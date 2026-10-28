#!/usr/bin/env python3
"""perspective.py: perspective and depth measured on a picture (the city-poster study, 2026-10-28, look lens 1;
report: docs/studies/2026-10-28_city_posters/perspective.md).

Work in progress: this header is rewritten when the script is complete.
"""
from __future__ import annotations

import argparse
import json
import math
import os
import sys

import cv2
import numpy as np

sys.dont_write_bytecode = True
cv2.setNumThreads(2)

HERE = os.path.dirname(os.path.abspath(__file__))
VIDEO = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
REFS = os.path.join(VIDEO, 'docs', 'look', 'poster_refs')


# ---------------------------------------------------------------- image, mask, colour

def load(path: str, mask_json: str | None = None):
    """BGR image and its VALID mask (True = poster pixels; the Instagram UI, the black bars and the title box out)."""
    bgr = cv2.imread(path)
    if bgr is None:
        raise SystemExit(f'cannot read {path}')
    H, W = bgr.shape[:2]
    valid = np.ones((H, W), bool)
    name = os.path.basename(path)
    if mask_json and os.path.exists(mask_json):
        spec = json.load(open(mask_json)).get('images', {}).get(name)
        if spec:
            r0, r1 = spec['content_rows']
            valid[:r0] = False
            valid[r1:] = False
            for k in ('counter_pill_box', 'mute_button_box'):
                x0, y0, x1, y1 = spec[k]
                valid[max(0, y0):y1, max(0, x0):x1] = False
    return bgr, valid


def to_lab(bgr):
    """CIE L*a*b* (D65) as float32, via OpenCV's float path (the house check_depth.py convention)."""
    return cv2.cvtColor(bgr[:, :, ::-1].astype(np.float32) / 255, cv2.COLOR_RGB2LAB)


def grad_de(lab):
    """Per-pixel colour step (ΔE76 per px, Sobel / 4): check_depth.py's 'visible edges' measure (> 6)."""
    g = 0
    for c in range(3):
        gx = cv2.Sobel(lab[..., c], cv2.CV_32F, 1, 0, ksize=3) / 4
        gy = cv2.Sobel(lab[..., c], cv2.CV_32F, 0, 1, ksize=3) / 4
        g = g + gx * gx + gy * gy
    return np.sqrt(g)


# ---------------------------------------------------------------- straight lines and vanishing points

def segments(bgr, valid, min_len_frac=0.02, min_de=6.0):
    """LSD segments, at least min_len_frac x the width long, inside the valid mask, VISIBLE (median ΔE76 across the line,
    3 px each side, >= min_de: paper grain and soft brushwork drop out). Returns an (N, 8) array:
    x1, y1, x2, y2, length, angle (deg, 0..180, 0 = level, 90 = vertical), dE across, dL across (signed: side A - side B)."""
    H, W = bgr.shape[:2]
    gray = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY)
    lsd = cv2.createLineSegmentDetector(cv2.LSD_REFINE_STD)
    found = lsd.detect(gray)[0]
    if found is None:
        return np.zeros((0, 8))
    seg = found.reshape(-1, 4).astype(np.float64)
    lab = to_lab(bgr)
    out = []
    min_len = min_len_frac * W
    for x1, y1, x2, y2 in seg:
        dx, dy = x2 - x1, y2 - y1
        L = math.hypot(dx, dy)
        if L < min_len:
            continue
        mx, my = (x1 + x2) / 2, (y1 + y2) / 2
        if not (0 <= int(my) < H and 0 <= int(mx) < W) or not valid[int(my), int(mx)]:
            continue
        if not (valid[int(min(H - 1, max(0, y1))), int(min(W - 1, max(0, x1)))] and valid[int(min(H - 1, max(0, y2))), int(min(W - 1, max(0, x2)))]):
            continue
        nx, ny = -dy / L, dx / L
        ts = np.linspace(0.1, 0.9, 9)
        px = x1 + dx * ts
        py = y1 + dy * ts
        ax = np.clip(np.round(px + 3 * nx).astype(int), 0, W - 1)
        ay = np.clip(np.round(py + 3 * ny).astype(int), 0, H - 1)
        bx = np.clip(np.round(px - 3 * nx).astype(int), 0, W - 1)
        by = np.clip(np.round(py - 3 * ny).astype(int), 0, H - 1)
        A = lab[ay, ax]
        B = lab[by, bx]
        de = float(np.median(np.linalg.norm(A - B, axis=1)))
        if de < min_de:
            continue
        dl = float(np.median(A[:, 0] - B[:, 0]))
        ang = math.degrees(math.atan2(dy, dx)) % 180
        out.append([x1, y1, x2, y2, L, ang, de, dl])
    return np.array(out) if out else np.zeros((0, 8))


def classify(seg, level_tol=3.0, vert_tol=3.0):
    """'level' (parallel to the picture's bottom: a frontal elevation's horizontals, or a line at eye level),
    'vertical', 'oblique' (receding lines, slopes, roofs)."""
    ang = seg[:, 5]
    lev = np.minimum(ang, 180 - ang) <= level_tol
    ver = np.abs(ang - 90) <= vert_tol
    return np.where(lev, 'level', np.where(ver, 'vertical', 'oblique'))


def hom_lines(seg):
    p1 = np.c_[seg[:, 0], seg[:, 1], np.ones(len(seg))]
    p2 = np.c_[seg[:, 2], seg[:, 3], np.ones(len(seg))]
    l = np.cross(p1, p2)
    return l / np.linalg.norm(l[:, :2], axis=1, keepdims=True)


def vp_angle_err(seg, v):
    """Angle (deg) between each segment and the ray from its midpoint to the VP v (homogeneous; v[2] ~ 0 = at infinity)."""
    mx = (seg[:, 0] + seg[:, 2]) / 2
    my = (seg[:, 1] + seg[:, 3]) / 2
    d = np.c_[seg[:, 2] - seg[:, 0], seg[:, 3] - seg[:, 1]]
    d /= np.linalg.norm(d, axis=1, keepdims=True)
    if abs(v[2]) > 1e-9:
        u = np.c_[v[0] / v[2] - mx, v[1] / v[2] - my]
    else:
        u = np.tile(v[:2], (len(seg), 1))
    n = np.linalg.norm(u, axis=1, keepdims=True)
    n[n == 0] = 1
    u /= n
    c = np.abs((d * u).sum(1)).clip(0, 1)
    return np.degrees(np.arccos(c))


def refine_vp(seg, w):
    """Least-squares VP: the unit 3-vector v minimising sum w (l . v)^2 over the segments' normalised lines."""
    l = hom_lines(seg)
    M = (l * w[:, None]).T @ l
    vals, vecs = np.linalg.eigh(M)
    v = vecs[:, 0]
    return v / np.linalg.norm(v)


def find_vps(seg, n_max=6, tol=1.5, iters=4000, min_share=0.04, min_n=6, seed=7):
    """Sequential RANSAC over the oblique segments: the VP with the most segment length pointing at it (within `tol`
    deg), refined by least squares, its inliers removed; repeat. Returns a list of dicts."""
    rng = np.random.default_rng(seed)
    left = np.arange(len(seg))
    total = seg[:, 4].sum() if len(seg) else 1
    l_all = hom_lines(seg) if len(seg) else None
    out = []
    while len(left) >= min_n and len(out) < n_max:
        S = seg[left]
        best, best_w = None, 0
        wlen = S[:, 4]
        p = wlen / wlen.sum()
        for _ in range(iters):
            i, j = rng.choice(len(S), 2, replace=False, p=p)
            v = np.cross(l_all[left[i]], l_all[left[j]])
            nv = np.linalg.norm(v)
            if nv < 1e-12:
                continue
            v = v / nv
            err = vp_angle_err(S, v)
            w = wlen[err < tol].sum()
            if w > best_w:
                best, best_w = v, w
        if best is None:
            break
        inl = vp_angle_err(S, best) < tol
        if inl.sum() < min_n or best_w / total < min_share:
            break
        v = refine_vp(S[inl], S[inl][:, 4])
        inl = vp_angle_err(S, v) < tol
        v = refine_vp(S[inl], S[inl][:, 4])
        inl = vp_angle_err(S, v) < tol
        out.append(dict(v=v, idx=left[inl], n=int(inl.sum()), share=float(S[inl][:, 4].sum() / total)))
        left = left[~inl]
    return out


def vp_point(v, W, H, far=8.0):
    """(x, y) of a VP, or None when it lies farther than `far` image diagonals from the centre (parallel lines)."""
    if abs(v[2]) < 1e-12:
        return None
    x, y = v[0] / v[2], v[1] / v[2]
    if math.hypot(x - W / 2, y - H / 2) > far * math.hypot(W, H):
        return None
    return float(x), float(y)


# ---------------------------------------------------------------- quick look (development)

def _dev(paths, mask_json, out_dir):
    os.makedirs(out_dir, exist_ok=True)
    cols = [(0, 0, 255), (0, 170, 0), (255, 0, 0), (0, 200, 255), (255, 0, 255), (255, 255, 0)]
    for p in paths:
        bgr, valid = load(p, mask_json)
        H, W = bgr.shape[:2]
        seg = segments(bgr, valid)
        cls = classify(seg)
        obl = seg[cls == 'oblique']
        vps = find_vps(obl)
        vis = (bgr * 0.45 + 140).astype(np.uint8)
        for s, c in zip(seg, cls):
            col = {'level': (90, 90, 90), 'vertical': (160, 160, 160), 'oblique': (40, 40, 40)}[c]
            cv2.line(vis, (int(s[0]), int(s[1])), (int(s[2]), int(s[3])), col, 2)
        print(os.path.basename(p), 'segments', len(seg), {k: int((cls == k).sum()) for k in ('level', 'vertical', 'oblique')},
              'length share', {k: round(float(seg[cls == k][:, 4].sum() / seg[:, 4].sum()), 3) for k in ('level', 'vertical', 'oblique')})
        for k, vp in enumerate(vps):
            col = cols[k % len(cols)]
            for s in obl[vp['idx']]:
                cv2.line(vis, (int(s[0]), int(s[1])), (int(s[2]), int(s[3])), col, 3)
            pt = vp_point(vp['v'], W, H)
            print(f'   VP{k}: n {vp["n"]:3d} share {vp["share"]:.3f} at', None if pt is None else (round(pt[0]), round(pt[1]), round(pt[0] / W, 2), round(pt[1] / H, 3)),
                  'dir' if pt is None else '', None if pt is not None else round(math.degrees(math.atan2(vp['v'][1], vp['v'][0])) % 180, 1))
            if pt is not None and -W < pt[0] < 2 * W and -H < pt[1] < 2 * H:
                cv2.circle(vis, (int(pt[0]), int(pt[1])), 14, col, 4)
        cv2.imwrite(os.path.join(out_dir, 'dev_lines_' + os.path.basename(p)), cv2.resize(vis, (W // 2, H // 2), interpolation=cv2.INTER_AREA), [cv2.IMWRITE_JPEG_QUALITY, 85])


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('images', nargs='+')
    ap.add_argument('--mask-json', default=os.path.join(REFS, 'ui_mask.json'))
    ap.add_argument('--out-dir', default='/tmp/posters-perspective')
    a = ap.parse_args()
    _dev(a.images, a.mask_json, a.out_dir)
