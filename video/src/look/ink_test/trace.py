"""The ink-line look test, step 2: WHERE the lines go (docs/look/ink_test/NOTES.md §2).

From each lined segment's flat, keyed, unlit render (two slabs -> colour + alpha) we find three kinds of edge, every one
traced ONCE, as an inker would draw it:
  sil   the segment's silhouette (its alpha's edge), where a later segment does not cover it
  bar   a thin dark feature of the design (a window bar, a post, a joint: <= ~5 px across) traced along its CENTRE, so a
        bar becomes one stroke, never two parallel ones (v1's doubled strokes)
  int   an interior colour step (dE >= the segment's threshold), away from the bars and the silhouette
Each edge map is thinned (Zhang-Suen), cut into chains at junctions, smoothed (no pixel stairs), and split at corners
(an inker lifts the pen at a corner: every side its own stroke). Strokes shorter than the segment's minimum are
dropped (no specks). Out: <scratch>/strokes.json (+ trace_debug.png, the strokes by kind over the dimmed frame)."""
import json
import os
import sys

import cv2
import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from inkcommon import LINED, PLANE, H, W, BAND, seg_rgba, srgb_to_lab, load_srgb, save_srgb, tier  # noqa: E402

#: the drawing order of the static picture (v7's context.tsx SEGMENTS; the mask-only far split left out)
ORDER = ['clouds', 'westgap', 'farlife', 'water', 'fartowpath', 'wing', 'lobby', 'doorleaves', 'winglife',
         'towpathshadows', 'pathfurniture', 'her', 'boatstrips', 'boats', 'pip', 'bank', 'near']

#: per segment: which kinds are traced, the interior step threshold (dE, flat design) and the shortest stroke kept (px).
#: The sky, the clouds, the water and the shadow strips never get a line (the painted pieces and the light's shapes).
SPEC = {
    'westgap':       dict(kinds=('sil', 'bar', 'int'), de=14, lmin=26),
    'fartowpath':    dict(kinds=('sil', 'bar', 'int'), de=12, lmin=18),
    'wing':          dict(kinds=('sil', 'bar', 'int'), de=10, lmin=14),
    'lobby':         dict(kinds=('sil', 'bar', 'int'), de=10, lmin=12),
    'doorleaves':    dict(kinds=('sil', 'bar', 'int'), de=10, lmin=12),
    'winglife':      dict(kinds=('sil',), de=99, lmin=16),
    'pathfurniture': dict(kinds=('sil', 'bar', 'int'), de=12, lmin=12),
    'her':           dict(kinds=('sil',), de=99, lmin=10),
    'boats':         dict(kinds=('sil', 'bar', 'int'), de=12, lmin=12),
    'pip':           dict(kinds=('sil',), de=99, lmin=10),
    'bank':          dict(kinds=('sil', 'bar'), de=99, lmin=30),
    'near':          dict(kinds=('sil', 'bar', 'int'), de=10, lmin=10),
}


# ------------------------------------------------------------------------------------------------ edge maps

def zhang_suen(mask):
    """Thin a boolean mask to 1-px 8-connected curves (Zhang & Suen 1984), vectorised."""
    img = np.pad(mask.astype(np.uint8), 1)
    while True:
        changed = False
        for step in (0, 1):
            P = img
            p2, p3, p4 = P[:-2, 1:-1], P[:-2, 2:], P[1:-1, 2:]
            p5, p6, p7 = P[2:, 2:], P[2:, 1:-1], P[2:, :-2]
            p8, p9 = P[1:-1, :-2], P[:-2, :-2]
            c = P[1:-1, 1:-1]
            nb = [p2, p3, p4, p5, p6, p7, p8, p9]
            B = sum(x.astype(np.int32) for x in nb)
            seq = nb + [p2]
            A = sum(((seq[i] == 0) & (seq[i + 1] == 1)).astype(np.int32) for i in range(8))
            if step == 0:
                m1 = (p2 * p4 * p6) == 0
                m2 = (p4 * p6 * p8) == 0
            else:
                m1 = (p2 * p4 * p8) == 0
                m2 = (p2 * p6 * p8) == 0
            rm = (c == 1) & (B >= 2) & (B <= 6) & (A == 1) & m1 & m2
            if rm.any():
                changed = True
                inner = img[1:-1, 1:-1]
                inner[rm] = 0
        if not changed:
            break
    return img[1:-1, 1:-1].astype(bool)


def lab_u8(col, k=2.4):
    lab = srgb_to_lab(col)
    return np.dstack([np.clip(lab[..., 0] * k, 0, 255), np.clip(lab[..., 1] * k + 128, 0, 255),
                      np.clip(lab[..., 2] * k + 128, 0, 255)]).astype(np.uint8), lab


def edge_maps(col, a, occ, spec):
    """The three edge maps of one segment (bool, thinned), with what a later segment covers removed."""
    inside = a > 0.5
    solid = cv2.erode(inside.astype(np.uint8), np.ones((5, 5), np.uint8)).astype(bool)
    u8, lab = lab_u8(col)
    L = lab[..., 0].astype(np.float32)
    out = {}
    free = occ < 0.3
    # thin dark features: a black-hat on L* (features up to ~5 px across), inside the segment
    Lf = np.where(inside, L, 100.0).astype(np.float32)
    bh = cv2.morphologyEx(Lf, cv2.MORPH_BLACKHAT, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (9, 9)))
    thin = (bh > 9.0) & inside
    thin = cv2.morphologyEx(thin.astype(np.uint8), cv2.MORPH_OPEN, np.ones((1, 1), np.uint8)).astype(bool)
    # a "bar" is thin across but long: drop blobs whose thinned length is short against their area
    bars = np.zeros_like(thin)
    if 'bar' in spec['kinds'] and thin.any():
        sk = zhang_suen(thin)
        n, lab_cc, stats, _ = cv2.connectedComponentsWithStats(thin.astype(np.uint8), connectivity=8)
        sk_len = np.bincount(lab_cc[sk], minlength=n)
        area = stats[:, cv2.CC_STAT_AREA]
        ok = (sk_len >= 8) & (area <= sk_len * 6.0)
        ok[0] = False
        bars = sk & ok[lab_cc]
        bars &= free
    near_bar = cv2.dilate(thin.astype(np.uint8), np.ones((5, 5), np.uint8)).astype(bool)
    if 'sil' in spec['kinds']:
        e = cv2.Canny((np.clip(a, 0, 1) * 255).astype(np.uint8), 60, 120) > 0
        e &= free
        out['sil'] = zhang_suen(e)
    if 'int' in spec['kinds']:
        hi = 7.2 * spec['de']
        e = cv2.Canny(u8, hi * 0.5, hi, L2gradient=True) > 0
        e &= solid & free & ~near_bar
        out['int'] = zhang_suen(e)
    if 'bar' in spec['kinds']:
        out['bar'] = bars
    return out


# ------------------------------------------------------------------------------------------------ chains

NB = [(-1, -1), (-1, 0), (-1, 1), (0, -1), (0, 1), (1, -1), (1, 0), (1, 1)]


def chains(mask):
    """Ordered pixel chains (lists of (x, y)) from a thinned mask, cut at junctions (the junction pixel kept on both)."""
    m = mask.astype(np.uint8)
    k = np.ones((3, 3), np.float32)
    k[1, 1] = 0
    n = cv2.filter2D(m, cv2.CV_16S, k, borderType=cv2.BORDER_CONSTANT)
    junc = (m == 1) & (n >= 3)
    simple = (m == 1) & ~junc
    jset = set(zip(*np.nonzero(junc)))
    ncc, lab = cv2.connectedComponents(simple.astype(np.uint8), connectivity=8)
    ys, xs = np.nonzero(lab)
    order = np.argsort(lab[ys, xs], kind='stable')
    ys, xs = ys[order], xs[order]
    labs = lab[ys, xs]
    bounds = np.searchsorted(labs, np.arange(1, ncc + 1))
    out = []
    for ci in range(1, ncc):
        s, e = bounds[ci - 1], bounds[ci]
        pix = set(zip(ys[s:e].tolist(), xs[s:e].tolist()))
        if len(pix) < 3:
            continue
        def nbrs(p):
            return [(p[0] + dy, p[1] + dx) for dy, dx in NB if (p[0] + dy, p[1] + dx) in pix]
        start = next((p for p in pix if len(nbrs(p)) <= 1), next(iter(pix)))
        path = [start]
        seen = {start}
        cur = start
        while True:
            cand = [q for q in nbrs(cur) if q not in seen]
            if not cand:
                break
            # prefer the 4-neighbour (no corner cutting)
            cand.sort(key=lambda q: abs(q[0] - cur[0]) + abs(q[1] - cur[1]))
            cur = cand[0]
            seen.add(cur)
            path.append(cur)
        # the junction pixels the chain ends touch
        for end_i in (0, -1):
            p = path[end_i]
            js = [(p[0] + dy, p[1] + dx) for dy, dx in NB if (p[0] + dy, p[1] + dx) in jset]
            if js:
                if end_i == 0:
                    path.insert(0, js[0])
                else:
                    path.append(js[0])
        out.append(np.array([(x, y) for y, x in path], np.float32))
    return out


def resample(p, step):
    d = np.r_[0, np.cumsum(np.hypot(*np.diff(p, axis=0).T))]
    if d[-1] < step:
        return p[[0, -1]] if len(p) > 1 else p
    t = np.linspace(0, d[-1], max(2, int(round(d[-1] / step)) + 1))
    return np.stack([np.interp(t, d, p[:, 0]), np.interp(t, d, p[:, 1])], -1).astype(np.float32)


def smooth(p, sigma):
    if len(p) < 5:
        return p
    r = int(3 * sigma)
    k = np.exp(-0.5 * (np.arange(-r, r + 1) / sigma) ** 2)
    k /= k.sum()
    q = np.stack([np.convolve(np.pad(p[:, i], r, mode='edge'), k, 'valid') for i in (0, 1)], -1)
    q[0], q[-1] = p[0], p[-1]
    return q.astype(np.float32)


def split_corners(p, win=5, deg=42):
    """Split at corners: the turn between the incoming and outgoing directions over `win` px, at its local maxima."""
    if len(p) < 2 * win + 3:
        return [p]
    v_in = p[win:-win] - p[:-2 * win]
    v_out = p[2 * win:] - p[win:-win]
    a_in = np.arctan2(v_in[:, 1], v_in[:, 0])
    a_out = np.arctan2(v_out[:, 1], v_out[:, 0])
    turn = np.degrees(np.abs((a_out - a_in + np.pi) % (2 * np.pi) - np.pi))
    turn = np.r_[np.zeros(win), turn, np.zeros(win)]
    cuts = []
    i = 0
    while i < len(turn):
        if turn[i] > deg:
            j = i
            while j + 1 < len(turn) and turn[j + 1] > deg:
                j += 1
            cuts.append((i + j) // 2 if j - i < 3 * win else None)
            if cuts[-1] is None:
                cuts[-1] = (i + j) // 2
            i = j + 1
        else:
            i += 1
    pieces, s = [], 0
    for c in cuts:
        if c - s >= 2:
            pieces.append(p[s:c + 1])
        s = c
    pieces.append(p[s:])
    return [q for q in pieces if len(q) >= 2]


def main(scr):
    rdir = os.path.join(scr, 'renders')
    rgba = {s: seg_rgba(rdir, s) for s in LINED}
    # what later segments cover (the static picture's order; the movers drawn too: they are in the still)
    occ_after = {}
    acc = np.zeros((H, W), np.float32)
    for s in reversed(ORDER):
        occ_after[s] = cv2.dilate(acc, np.ones((3, 3), np.uint8))
        acc = 1 - (1 - acc) * (1 - rgba[s][1])
    strokes = []
    dbg = load_srgb(os.path.join(rdir, 'v7a_nocap.png')) * 0.35 + 0.55
    colours = {'sil': (0.85, 0.1, 0.2), 'bar': (0.1, 0.3, 0.9), 'int': (0.1, 0.6, 0.2)}
    for s, spec in SPEC.items():
        col, a = rgba[s]
        maps = edge_maps(col, a, occ_after[s], spec)
        Ls = srgb_to_lab(col)[..., 0]
        n_seg = 0
        for kind, m in maps.items():
            m = m.copy()
            m[BAND[0]:BAND[1]] = False  # never in the caption band
            for ch in chains(m):
                p = smooth(resample(ch, 1.0), 1.4)
                for q in split_corners(p):
                    q = resample(q, 1.5)
                    L = float(np.hypot(*np.diff(q, axis=0).T).sum())
                    if L < spec['lmin']:
                        continue
                    # which side is "inside" (the segment, or the darker side of an interior step): sampled at 3 px
                    t = np.gradient(q, axis=0)
                    t /= np.maximum(np.linalg.norm(t, axis=1, keepdims=True), 1e-6)
                    nrm = np.stack([-t[:, 1], t[:, 0]], -1)
                    def samp(img, pts):
                        x = np.clip(np.round(pts[:, 0]).astype(int), 0, W - 1)
                        y = np.clip(np.round(pts[:, 1]).astype(int), 0, H - 1)
                        return img[y, x]
                    if kind == 'sil':
                        side = np.sign(np.mean(samp(a, q + 3 * nrm) - samp(a, q - 3 * nrm)))
                    else:
                        side = np.sign(np.mean(samp(Ls, q - 3 * nrm) - samp(Ls, q + 3 * nrm)))
                    strokes.append({'seg': s, 'plane': PLANE[s], 'tier': tier(s), 'kind': kind, 'len': round(L, 1),
                                    'inside': int(side) if side != 0 else 1,
                                    'pts': np.round(q, 2).tolist()})
                    n_seg += 1
                    cv2.polylines(dbg, [np.round(q * 4).astype(np.int32)], False, colours[kind], 2, cv2.LINE_AA, shift=2)
        print(f'{s:14s} {n_seg:4d} strokes', file=sys.stderr)
    json.dump({'W': W, 'H': H, 'strokes': strokes}, open(os.path.join(scr, 'strokes.json'), 'w'))
    save_srgb(os.path.join(scr, 'trace_debug.png'), np.clip(dbg, 0, 1))
    tot = sum(st['len'] for st in strokes)
    print(f'{len(strokes)} strokes, {tot:.0f} px of line', file=sys.stderr)


if __name__ == '__main__':
    main(sys.argv[1] if len(sys.argv) > 1 else '/tmp/ink_test')
