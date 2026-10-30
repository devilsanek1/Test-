"""The ink-line look test, step 3: HOW the lines are drawn, three treatments over v7a's paint (NOTES.md §2).

Each stroke from trace.py is redrawn as an ink stroke: a pressure profile (a touch-down, a body, a tapered lift), a slow
hand drift (never jitter), weight by light (thin and lost where the paint is lit, fuller on the undersides), small corner
behaviour (stop short or a tiny overshoot), lost-edge gaps, and a dry edge from the paper's tooth (the coverage
thresholded against a fine noise: the core stays solid, the edge breaks a little). The colour is never one near-black:
  trace   the line in the paint's own deep shade (a colour trace: the darker side's colour, L* -24, chroma x1.3)
  glaze   one warm plum-sepia ink under a glaze: multiplied by the paint (as a wash laid over an ink line)
Everything is seeded per stroke and per treatment (the same bytes on a rerun). The captions go back on top.
Out: <scratch>/ink_<T>.png (full size) and the deliverables in docs/look/ink_test/ (full size + 360 px wide)."""
import hashlib
import json
import os
import sys

import cv2
import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from inkcommon import H, W, BAND, load_srgb, save_srgb, srgb_to_lab, to_lin, to_srgb, lin_to_lab, lab_to_lin  # noqa: E402

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
OUT = os.path.join(ROOT, 'docs', 'look', 'ink_test')
SS = 3  # supersampling of the stroke raster
FOCAL = np.array([630.0, 965.0])  # the lit doorway (her and the lobby): the one place to look

# ------------------------------------------------------------------------------------------------ the treatments
# widths in px at 1080 wide (the core of a silhouette on the plane; bars x0.85, interior steps x0.7)
TREATMENTS = {
    'A': dict(
        title='A  Fine liner, colour trace',
        colour='trace', opacity=0.92,
        width={0: 2.4, 1: 2.1, 2: 1.9, 3: 1.3}, kind_w={'sil': 1.0, 'bar': 0.85, 'int': 0.7},
        taper_in=5, taper_out=12, touch=0.55, press_amp=0.06, press_wl=80,
        wobble=0.35, wobble_wl=95,
        lit_from=80, lit_thin=0.5, lit_gap=88, rand_gap=0.0, gap=(4, 10),
        over_p=0.0, over=(0, 0), short_p=0.5, short=(0.5, 2.0),
        tooth=0.12, far={3: (0.55, 0.75)},
        construct=0,
    ),
    'B': dict(
        title='B  Brush pen, glazed ink',
        colour='glaze', ink=(52.0, 16.0, 4.0), opacity=0.90,
        width={0: 3.3, 1: 2.8, 2: 2.5, 3: 1.6}, kind_w={'sil': 1.0, 'bar': 0.8, 'int': 0.62},
        taper_in=6, taper_out=22, touch=0.5, press_amp=0.20, press_wl=60,
        wobble=0.6, wobble_wl=70,
        lit_from=78, lit_thin=0.45, lit_gap=86, rand_gap=1 / 260, gap=(5, 14),
        over_p=0.3, over=(1.0, 3.0), short_p=0.25, short=(1.0, 3.0),
        tooth=0.35, far={3: (0.5, 0.7)},
        construct=0,
    ),
    'C': dict(
        title='C  Sketch ink, construction marks',
        colour='glaze', ink=(48.0, 18.0, 6.0), opacity=0.92,
        width={0: 3.4, 1: 2.9, 2: 2.6, 3: 1.7, 4: 1.2}, kind_w={'sil': 1.0, 'bar': 0.8, 'int': 0.62},
        taper_in=5, taper_out=26, touch=0.45, press_amp=0.28, press_wl=48,
        wobble=0.95, wobble_wl=55,
        lit_from=78, lit_thin=0.42, lit_gap=85, rand_gap=1 / 170, gap=(4, 18),
        over_p=0.45, over=(2.0, 6.0), short_p=0.2, short=(1.0, 3.0),
        tooth=0.6, far={3: (0.5, 0.7), 4: (0.3, 0.5)},
        construct=12,
    ),
}


def keep(st, T):
    """WHERE the lines go, per treatment (economy: the silhouettes and the big structure, the details near the focal)."""
    seg, kind, L, plane = st['seg'], st['kind'], st['len'], st['plane']
    p = np.asarray(st['pts'])
    d_focal = float(np.min(np.hypot(*(p - FOCAL).T)))
    span = p.max(0) - p.min(0)
    ang = np.degrees(np.arctan2(abs(p[-1, 1] - p[0, 1]), abs(p[-1, 0] - p[0, 0]) + 1e-6))
    axis = min(ang, 90 - ang) < 14  # a frontal made thing's structure (the wing is frontal: decision 2)
    if seg in ('westgap', 'farlife') and T != 'C':
        return False
    if seg == 'westgap':  # C only: a whisper of the bridge and the tallest far shapes
        return kind == 'sil' and L >= 60
    if seg in ('near', 'bank') and max(span) < 30:  # the fallen leaves and crumbs: no specks
        return False
    if seg == 'bank':
        return L >= 120  # the coping's edge only: the quay stays one quiet mass
    if seg in ('her', 'pip'):
        return True  # the subject and the mascot are drawn like everything else (a lineless figure reads pasted in)
    if T == 'A':
        if kind == 'sil':
            return L >= 24 or d_focal < 160
        if kind == 'bar':
            return L >= 40 or d_focal < 160
        return axis and L >= 60 or (d_focal < 120 and L >= 24)
    # B and C
    if kind == 'sil':
        return L >= 16 or d_focal < 200
    if kind == 'bar':
        return L >= 22 or d_focal < 200
    if seg == 'wing':
        return (axis and L >= 26) or (d_focal < 200 and L >= 16)
    return L >= 18


# ------------------------------------------------------------------------------------------------ helpers

def seed(*parts):
    return int.from_bytes(hashlib.sha256('/'.join(map(str, parts)).encode()).digest()[:8], 'little')


def noise1d(s, wl, rng):
    """Smooth value noise along arc length s (cubic-interpolated seeded knots), in [-1, 1]."""
    n = int(np.ceil((s[-1] if len(s) else 0) / wl)) + 4
    knots = rng.uniform(-1, 1, n)
    u = s / wl
    i = np.floor(u).astype(int)
    f = u - i
    f = f * f * (3 - 2 * f)
    return knots[i] * (1 - f) + knots[i + 1] * f


def fine_noise(name, shape, cell):
    rng = np.random.default_rng(seed(name))
    h, w = shape
    small = rng.random((int(h / cell) + 2, int(w / cell) + 2)).astype(np.float32)
    big = cv2.resize(small, (int((w / cell + 2) * cell), int((h / cell + 2) * cell)), interpolation=cv2.INTER_CUBIC)
    return np.clip(big[:h, :w], 0, 1)


def arclen(p):
    return np.r_[0, np.cumsum(np.hypot(*np.diff(p, axis=0).T))]


def normals(p):
    t = np.gradient(p, axis=0)
    t /= np.maximum(np.linalg.norm(t, axis=1, keepdims=True), 1e-6)
    return t, np.stack([-t[:, 1], t[:, 0]], -1)


def sample(img, pts):
    x = np.clip(np.round(pts[:, 0]).astype(int), 0, W - 1)
    y = np.clip(np.round(pts[:, 1]).astype(int), 0, H - 1)
    return img[y, x]


def smoothstep(e0, e1, x):
    t = np.clip((x - e0) / (e1 - e0), 0, 1)
    return t * t * (3 - 2 * t)


# ------------------------------------------------------------------------------------------------ one stroke

def ink_stroke(st, i, T, P, Lstar):
    """The stroke's drawn pieces: [(points Nx2, widths N)], after its ends, its drift, its light and its gaps."""
    rng = np.random.default_rng(seed('ink', T, i))
    p = np.asarray(st['pts'], np.float64)
    if len(p) < 2:
        return []
    # the ends: stop short, or a small overshoot along the end tangent (never v1's 6-62 px)
    for end in (0, -1):
        r = rng.random()
        tdir = p[end] - p[end + (1 if end == 0 else -1) * min(4, len(p) - 1)]
        tdir /= max(np.linalg.norm(tdir), 1e-6)
        if r < P['over_p']:
            e = rng.uniform(*P['over'])
            ext = p[end] + tdir * np.linspace(0, e, max(2, int(e / 1.5) + 1))[1:, None]
            p = np.vstack([ext[::-1], p]) if end == 0 else np.vstack([p, ext])
        elif r < P['over_p'] + P['short_p']:
            e = rng.uniform(*P['short'])
            s = arclen(p)
            keep_m = (s >= e) if end == 0 else (s <= s[-1] - e)
            if keep_m.sum() >= 2:
                p = p[keep_m]
    s = arclen(p)
    Ltot = s[-1]
    if Ltot < 3:
        return []
    t, n = normals(p)
    # the hand's slow drift across the line (one smooth noise; never jitter)
    drift = P['wobble'] * noise1d(s, P['wobble_wl'], rng)
    q = p + n * drift[:, None]
    # the light both sides of the line, in the painted, lit frame
    La = sample(Lstar, p + 3.5 * n)
    Lb = sample(Lstar, p - 3.5 * n)
    Lbright = np.maximum(La, Lb)
    # the outward normal (the "inside" side from trace.py): top edges thinner, undersides fuller
    n_out = -n * st['inside']
    top = -n_out[:, 1]  # +1 where the edge faces up
    w0 = P['width'].get(st['plane'], 0) * P['kind_w'][st['kind']]
    if w0 <= 0:
        return []
    # pressure: touch-down, body, lift (scaled down on short strokes)
    tin, tout = P['taper_in'], P['taper_out']
    k = min(1.0, Ltot / (tin + tout + 1e-6) * 0.8)
    tin, tout = tin * k, tout * k
    prof = (P['touch'] + (1 - P['touch']) * smoothstep(0, max(tin, 1e-3), s)) * (0.08 + 0.92 * smoothstep(0, max(tout, 1e-3), Ltot - s))
    press = 1 + P['press_amp'] * noise1d(s, P['press_wl'], rng)
    light = 1 - (1 - P['lit_thin']) * smoothstep(P['lit_from'], P['lit_from'] + 10, Lbright)
    under = 1 - 0.22 * top
    w = w0 * prof * press * light * under
    # far planes: thinner (their opacity is set per stroke in the layer)
    far = P['far'].get(st['plane'])
    if far:
        w = w * far[1]
    # lost edges: where the light eats the edge (a gap), and a few breaks on the long lines (B, C)
    lost = Lbright > P['lit_gap']
    lost = cv2.dilate(lost.astype(np.uint8)[:, None], np.ones((3, 1), np.uint8))[:, 0].astype(bool)
    if P['rand_gap'] > 0 and Ltot > 90:
        nb = rng.poisson(Ltot * P['rand_gap'])
        for _ in range(nb):
            c = rng.uniform(0.2, 0.8) * Ltot
            g = rng.uniform(*P['gap'])
            lost |= np.abs(s - c) < g / 2
    # cut into drawn pieces; each piece lifts and lands softly at a gap
    pieces = []
    idx = np.nonzero(~lost)[0]
    if len(idx) == 0:
        return []
    runs = np.split(idx, np.nonzero(np.diff(idx) > 1)[0] + 1)
    for r in runs:
        if len(r) < 3:
            continue
        ss = s[r] - s[r[0]]
        lr = ss[-1]
        if lr < 4:
            continue
        a0 = r[0] > 0
        a1 = r[-1] < len(s) - 1
        soft = np.ones_like(ss)
        if a0:
            soft *= 0.25 + 0.75 * smoothstep(0, 5, ss)
        if a1:
            soft *= 0.15 + 0.85 * smoothstep(0, 6, lr - ss)
        pieces.append((q[r], w[r] * soft))
    return pieces


def raster_pieces(pieces, layer):
    """Union of the pieces' outlines (quads between samples + round joins) into a SS-supersampled uint8 layer."""
    sh = 2  # fixed-point bits for cv2's sub-pixel AA fill
    f = SS * (1 << sh)
    for pts, w in pieces:
        t, n = normals(pts)
        hw = np.maximum(w, 0.05) / 2
        L = pts + n * hw[:, None]
        R = pts - n * hw[:, None]
        for j in range(len(pts) - 1):
            quad = np.array([L[j], L[j + 1], R[j + 1], R[j]]) * f
            cv2.fillConvexPoly(layer, np.round(quad).astype(np.int32), 255, cv2.LINE_AA, sh)
            if hw[j] * SS > 1.0:
                cv2.circle(layer, tuple(np.round(pts[j] * f).astype(int)), int(round(hw[j] * f)), 255, -1, cv2.LINE_AA, sh)


def construction_marks(strokes, T, P, rng):
    """C only: a few light construction marks, the inker's guides left in: the longest straight structural lines of the
    subject plane and the near table carried 20-60 px past their end, a hair off-angle, thin and faint."""
    cand = []
    for i, st in enumerate(strokes):
        if st['plane'] > 2 or st['seg'] in ('her', 'pip', 'bank'):
            continue
        p = np.asarray(st['pts'])
        if st['len'] < 70:
            continue
        chord = np.linalg.norm(p[-1] - p[0])
        if chord / st['len'] < 0.985:
            continue
        cand.append((st['len'], i))
    cand.sort(reverse=True)
    marks = []
    for _, i in cand[: P['construct'] * 3: 3][: P['construct']]:
        p = np.asarray(strokes[i]['pts'])
        end = rng.integers(0, 2)
        a, b = (p[0], p[min(8, len(p) - 1)]) if end == 0 else (p[-1], p[max(-9, -len(p))])
        d = (a - b) / max(np.linalg.norm(a - b), 1e-6)
        th = np.radians(rng.uniform(-1.4, 1.4))
        d = np.array([d[0] * np.cos(th) - d[1] * np.sin(th), d[0] * np.sin(th) + d[1] * np.cos(th)])
        ln = rng.uniform(20, 60)
        start = a - d * rng.uniform(4, 10)  # overlaps its line a little, as a guide drawn first does
        pts = start + d * np.linspace(0, ln, max(3, int(ln / 1.5)))[:, None]
        s = arclen(pts)
        w = 1.0 * (0.4 + 0.6 * smoothstep(0, 4, s)) * (0.1 + 0.9 * smoothstep(0, ln * 0.5, ln - s))
        marks.append((pts, w))
    return marks


# ------------------------------------------------------------------------------------------------ the frame

def render(T, strokes, base, cap, capmask, Lstar):
    P = TREATMENTS[T]
    chosen = [(i, st) for i, st in enumerate(strokes) if keep(st, T)]
    layers = {}  # opacity -> SS layer
    for i, st in chosen:
        pieces = ink_stroke(st, i, T, P, Lstar)
        if not pieces:
            continue
        op = P['opacity']
        far = P['far'].get(st['plane'])
        if far:
            op *= far[0]
        op = round(op, 2)
        if op not in layers:
            layers[op] = np.zeros((H * SS, W * SS), np.uint8)
        raster_pieces(pieces, layers[op])
    if P['construct']:
        rng = np.random.default_rng(seed('construct', T))
        layers.setdefault(0.26, np.zeros((H * SS, W * SS), np.uint8))
        raster_pieces(construction_marks([st for _, st in chosen], T, P, rng), layers[0.26])
    # coverage per layer at 1x, the dry edge (coverage thresholded against the paper's tooth), then one alpha
    tooth = 0.6 * fine_noise('tooth', (H, W), 1.3) + 0.4 * fine_noise('tooth2', (H, W), 3.1)
    alpha = np.zeros((H, W), np.float32)
    n_px = 0
    for op, lay in sorted(layers.items()):
        cov = cv2.resize(lay.astype(np.float32) / 255, (W, H), interpolation=cv2.INTER_AREA)
        k = P['tooth']
        cov = np.clip(cov * (1 + k) - k * tooth, 0, 1)
        n_px += int((cov > 0.5).sum())
        alpha = 1 - (1 - alpha) * (1 - op * cov)
    alpha[BAND[0]:BAND[1]] = 0
    lin = to_lin(base)
    if P['colour'] == 'glaze':
        ink = lab_to_lin(np.array(P['ink'], np.float32)[None, None, :])[0, 0]
        out = lin * (1 - alpha[..., None] + alpha[..., None] * ink[None, None, :])
    else:
        lab = srgb_to_lab(base)
        Lmin = cv2.erode(lab[..., 0], np.ones((7, 7), np.uint8))
        a = cv2.GaussianBlur(lab[..., 1], (0, 0), 2.0)
        b = cv2.GaussianBlur(lab[..., 2], (0, 0), 2.0)
        line = np.stack([np.maximum(12.0, Lmin - 24.0), a * 1.3, b * 1.3], -1)
        out = lin * (1 - alpha[..., None]) + lab_to_lin(line) * alpha[..., None]
    out = to_srgb(out)
    out = np.where(capmask[..., None], cap, out)
    stats = dict(strokes=len(chosen), line_px=round(sum(st['len'] for _, st in chosen)), ink_px_share=round(n_px / (H * W) * 100, 2))
    return np.clip(out, 0, 1), stats


def main(scr):
    rdir = os.path.join(scr, 'renders')
    base = load_srgb(os.path.join(rdir, 'v7a_nocap.png'))
    cap = load_srgb(os.path.join(rdir, 'v7a_cap.png'))
    capmask = np.abs(cap - base).max(-1) > 0.5 / 255
    capmask = cv2.dilate(capmask.astype(np.uint8), np.ones((3, 3), np.uint8)).astype(bool)
    Lstar = srgb_to_lab(base)[..., 0]
    strokes = json.load(open(os.path.join(scr, 'strokes.json')))['strokes']
    os.makedirs(OUT, exist_ok=True)
    allstats = {}
    only = sys.argv[2].split(',') if len(sys.argv) > 2 else list(TREATMENTS)
    for T in only:
        out, stats = render(T, strokes, base, cap, capmask, Lstar)
        save_srgb(os.path.join(scr, f'ink_{T}.png'), out)
        save_srgb(os.path.join(OUT, f'ink_{T}.png'), out)
        small = cv2.resize(out, (360, 640), interpolation=cv2.INTER_AREA)
        save_srgb(os.path.join(OUT, f'ink_{T}_360.png'), small)
        allstats[T] = stats
        print(T, stats, file=sys.stderr)
    # the control: v7a as it is (no lines)
    save_srgb(os.path.join(OUT, 'control_v7a.png'), cap)
    save_srgb(os.path.join(OUT, 'control_v7a_360.png'), cv2.resize(cap, (360, 640), interpolation=cv2.INTER_AREA))
    prev = {}
    pth = os.path.join(scr, 'ink_stats.json')
    if os.path.exists(pth):
        prev = json.load(open(pth))
    prev.update(allstats)
    json.dump(prev, open(pth, 'w'), indent=1)


if __name__ == '__main__':
    main(sys.argv[1] if len(sys.argv) > 1 else '/tmp/ink_test')
