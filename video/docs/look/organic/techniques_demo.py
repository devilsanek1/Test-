"""ORGANIC techniques: the seeded proof script behind docs/look/organic/techniques.md (research, 2026-10-30).

What it does (paths from video/):
  python3 docs/look/organic/techniques_demo.py            -> docs/look/organic/techniques_sheet.jpg (3 rows x 4 panels)
  python3 docs/look/organic/techniques_demo.py --bench    -> per-operator cost on a full 1080 x 1920 frame, one core
  python3 docs/look/organic/techniques_demo.py --measure  -> edge / fill statistics: our still vs the references

Every operator is seeded (sha256 of seed + keys -> numpy Generator) and deterministic: the same inputs give the same
bytes. numpy + OpenCV (Apache-2.0) + SciPy (BSD-3) only; nothing to install. These are proofs of METHOD for a study,
not production code: in production each operator runs per painted layer in scripts/look/paint/paint.py with the
layer's plane, tier and material (the doc's section 5), never as a filter over the whole frame.

Input: docs/studies/2026-10-28_city_posters/paint_test/paint_still_v6.png (our latest still). The references are only
MEASURED (--measure), never copied, traced or used as input.
"""
import argparse
import hashlib
import json
import os
import sys
import time

import numpy as np
import cv2
from scipy import ndimage as ndi

cv2.setNumThreads(1)
HERE = os.path.dirname(os.path.abspath(__file__))
VIDEO = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
STILL = os.path.join(VIDEO, 'docs/studies/2026-10-28_city_posters/paint_test/paint_still_v6.png')



def rng_for(seed, *keys):
    k = ':'.join(str(x) for x in (seed,) + keys)
    return np.random.default_rng(int(hashlib.sha256(k.encode()).hexdigest()[:12], 16))


def value_noise(rng, h, w, cell):
    """Smooth value noise in [-1, 1] at a feature size of `cell` px (bicubic upsample of a random lattice)."""
    gh, gw = int(np.ceil(h / cell)) + 3, int(np.ceil(w / cell)) + 3
    g = rng.uniform(-1.0, 1.0, (gh, gw)).astype(np.float32)
    big = cv2.resize(g, (int(gw * cell), int(gh * cell)), interpolation=cv2.INTER_CUBIC)
    oy, ox = int(rng.integers(0, cell)), int(rng.integers(0, cell))
    return big[oy:oy + h, ox:ox + w]


def fbm(rng, h, w, cell, octaves=4, gain=0.5, aniso=(1.0, 1.0)):
    """Fractal sum of value noise, normalised to ~[-1, 1]. `aniso` stretches the features (sy, sx)."""
    sy, sx = aniso
    hh, ww = int(np.ceil(h / sy)), int(np.ceil(w / sx))
    acc = np.zeros((hh, ww), np.float32)
    amp, tot, c = 1.0, 0.0, float(cell)
    for _ in range(octaves):
        acc += amp * value_noise(rng, hh, ww, max(c, 1.5))
        tot += amp
        amp *= gain
        c /= 2.0
    acc /= tot
    if (sy, sx) != (1.0, 1.0):
        acc = cv2.resize(acc, (w, h), interpolation=cv2.INTER_LINEAR)
    return acc / max(1e-6, float(np.abs(acc).max()))


def smoothstep(a, b, x):
    t = np.clip((x - a) / (b - a), 0, 1)
    return t * t * (3 - 2 * t)



# ---------------------------------------------------------------------------------------------- colour (OKLab)


def srgb_to_lin(c):
    return np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4).astype(np.float32)


def lin_to_srgb(c):
    c = np.clip(c, 0.0, 1.0)
    return np.where(c <= 0.0031308, 12.92 * c, 1.055 * np.power(c, 1 / 2.4) - 0.055).astype(np.float32)


_M1 = np.array([[0.4122214708, 0.5363325363, 0.0514459929],
                [0.2119034982, 0.6806995451, 0.1073969566],
                [0.0883024619, 0.2817188376, 0.6299787005]], np.float32)


_M2 = np.array([[0.2104542553, 0.7936177850, -0.0040720468],
                [1.9779984951, -2.4285922050, 0.4505937099],
                [0.0259040371, 0.7827717662, -0.8086757660]], np.float32)


def srgb_to_oklab(rgb):
    lms = srgb_to_lin(rgb) @ _M1.T
    return np.cbrt(lms) @ _M2.T


def oklab_to_srgb(lab):
    lms = lab @ np.linalg.inv(_M2).T
    return lin_to_srgb((lms ** 3) @ np.linalg.inv(_M1).T)


def luminance_L(rgb):
    """OKLab L (0..1); x100 is close to CIELAB L* in feel."""
    return srgb_to_oklab(rgb)[..., 0]



# ---------------------------------------------------------------------------------------------- flow, warp, regions


def structure_tensor(gray, rho=2.5):
    gx = cv2.Sobel(gray, cv2.CV_32F, 1, 0, ksize=3)
    gy = cv2.Sobel(gray, cv2.CV_32F, 0, 1, ksize=3)
    jxx = cv2.GaussianBlur(gx * gx, (0, 0), rho)
    jxy = cv2.GaussianBlur(gx * gy, (0, 0), rho)
    jyy = cv2.GaussianBlur(gy * gy, (0, 0), rho)
    tr = jxx + jyy
    disc = np.sqrt(np.maximum(0.0, (jxx - jyy) ** 2 + 4 * jxy * jxy))
    l1, l2 = 0.5 * (tr + disc), 0.5 * (tr - disc)
    # tangent = eigenvector of the SMALLER eigenvalue (along the edge)
    tx, ty = l2 - jyy, jxy
    n = np.sqrt(tx * tx + ty * ty)
    flat = n < 1e-9
    tx = np.where(flat, 1.0, tx / np.maximum(n, 1e-9)).astype(np.float32)
    ty = np.where(flat, 0.0, ty / np.maximum(n, 1e-9)).astype(np.float32)
    aniso = np.where(l1 + l2 > 1e-9, (l1 - l2) / np.maximum(l1 + l2, 1e-9), 0.0).astype(np.float32)
    strength = np.sqrt(np.maximum(l1, 0)).astype(np.float32)
    return tx, ty, aniso, strength


def flow_field(rgb, default_angle_deg=0.0, rho=2.5, min_strength=0.02):
    """Edge-tangent flow; where the picture is flat (no edge nearby) fall back to a default stroke angle
    (horizontal for sky and water, the perspective line for paving ...)."""
    tx, ty, aniso, s = structure_tensor(luminance_L(rgb), rho)
    a = np.deg2rad(default_angle_deg)
    wgt = np.clip(s / min_strength, 0, 1) * np.clip(aniso * 1.5, 0, 1)
    fx = wgt * tx + (1 - wgt) * np.cos(a)
    fy = wgt * ty + (1 - wgt) * np.sin(a)
    # keep the orientation consistent with the default (tangents are sign-free)
    sgn = np.sign(fx * np.cos(a) + fy * np.sin(a) + 1e-6)
    fx, fy = fx * sgn, fy * sgn
    n = np.sqrt(fx * fx + fy * fy) + 1e-9
    return (fx / n).astype(np.float32), (fy / n).astype(np.float32)


def warp_field(rng, h, w, cell, amp, octaves=4, nested=True, aniso=(1.0, 1.0)):
    """A displacement field (dx, dy) in px. nested=True is a two-level domain warp (fbm(p + q(p)))."""
    qx = fbm(rng, h, w, cell, octaves, aniso=aniso)
    qy = fbm(rng, h, w, cell, octaves, aniso=aniso)
    if not nested:
        return (amp * qx).astype(np.float32), (amp * qy).astype(np.float32)
    rx = fbm(rng, h, w, cell, octaves, aniso=aniso)
    ry = fbm(rng, h, w, cell, octaves, aniso=aniso)
    X, Y = np.meshgrid(np.arange(w, dtype=np.float32), np.arange(h, dtype=np.float32))
    k = 0.5 * cell
    mx, my = X + k * qx, Y + k * qy
    rx2 = cv2.remap(rx, mx, my, cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)
    ry2 = cv2.remap(ry, mx, my, cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)
    return (amp * rx2).astype(np.float32), (amp * ry2).astype(np.float32)


def apply_warp(img, dx, dy, nearest=False):
    h, w = img.shape[:2]
    X, Y = np.meshgrid(np.arange(w, dtype=np.float32), np.arange(h, dtype=np.float32))
    return cv2.remap(img, X + dx, Y + dy, cv2.INTER_NEAREST if nearest else cv2.INTER_LINEAR,
                     borderMode=cv2.BORDER_REFLECT)


def regions(rgb, k=28, seed=1, min_area=40):
    """Flat-design regions: k-means in OKLab, then connected components (a stand-in for the design's own layers)."""
    lab = srgb_to_oklab(rgb).reshape(-1, 3).astype(np.float32)
    crit = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 30, 1e-4)
    cv2.setRNGSeed(seed)
    _, lab_idx, _ = cv2.kmeans(lab, k, None, crit, 2, cv2.KMEANS_PP_CENTERS)
    q = lab_idx.reshape(rgb.shape[:2]).astype(np.int32)
    lbl = np.zeros_like(q)
    nxt = 1
    for c in range(k):
        n, cc = cv2.connectedComponents((q == c).astype(np.uint8), connectivity=4)
        m = cc > 0
        lbl[m] = cc[m] + nxt
        nxt += n
    return lbl


def clean_regions(rgb, k=20, seed=1, min_area=80, pre_median=5):
    """Regions of the flat design: median filter (kills anti-aliasing), k-means in OKLab, connected components,
    small components merged into their nearest neighbour."""
    u8 = (np.clip(rgb, 0, 1) * 255).astype(np.uint8)
    med = cv2.medianBlur(u8, pre_median).astype(np.float32) / 255.0
    lbl = regions(med, k, seed)
    ids, counts = np.unique(lbl, return_counts=True)
    small = np.isin(lbl, ids[counts < min_area])
    lbl2 = lbl.copy()
    lbl2[small] = 0
    _, (iy, ix) = ndi.distance_transform_edt(lbl2 == 0, return_indices=True)
    lbl2 = lbl2[iy, ix]
    return lbl2


def boundary(lbl):
    b = np.zeros(lbl.shape, bool)
    b[:, 1:] |= lbl[:, 1:] != lbl[:, :-1]
    b[1:, :] |= lbl[1:, :] != lbl[:-1, :]
    return b



# ---------------------------------------------------------------------------------------------- RANKED: by intent


def line_blur(img, angle_deg, length):
    """1-D box blur along a direction (a constant-direction LIC): streaks along the brush."""
    L = max(3, int(length) | 1)
    k = np.zeros((L, L), np.float32)
    c = L // 2
    a = np.deg2rad(angle_deg)
    for t in np.linspace(-c, c, 2 * L):
        x, y = int(round(c + t * np.cos(a))), int(round(c + t * np.sin(a)))
        k[y, x] = 1.0
    k /= k.sum()
    return cv2.filter2D(img, -1, k, borderType=cv2.BORDER_REFLECT)


def edge_teeth_maps(rgb, seed, angle_deg=0.0, lost_px=8.0, found_px=0.8, rule_px=0.5, c_found=14.0, c_lost=4.0,
                    streak=28, tooth=2.2, density=0.35, rhythm_cell=70.0, rule_cell=48.0, ss=2):
    """edge_teeth with the dose given per pixel by the caller (the engine knows each layer's plane, tier and
    material): lost_px = the longest tooth on a lost edge, found_px = on a found edge, rule_px = the hand-ruled wobble.
    Scalars or H x W maps."""
    h, w = rgb.shape[:2]
    full = lambda v: np.broadcast_to(np.float32(v), (h, w)) if np.isscalar(v) else v.astype(np.float32)
    lost_px, found_px, rule_px = full(lost_px), full(found_px), full(rule_px)
    L = luminance_L(rgb) * 100.0
    ker = np.ones((5, 5), np.uint8)
    c = cv2.dilate(L, ker) - cv2.erode(L, ker)
    e = smoothstep(0.8, 2.5, cv2.dilate(c, np.ones((7, 7), np.uint8)))
    hard = cv2.dilate(smoothstep(c_lost, c_found, c), np.ones((5, 5), np.uint8))
    rng = rng_for(seed, 'teeth')
    n0 = cv2.GaussianBlur(rng.standard_normal((h, w)).astype(np.float32), (0, 0), tooth)
    n = line_blur(n0, angle_deg, streak)
    n /= n.std() + 1e-6
    pos = smoothstep(1.0 - density, 1.0 + 1.2 * (1 - density), n)
    neg = smoothstep(1.0 - density, 1.0 + 1.2 * (1 - density), -n)
    rhythm = smoothstep(-0.35, 0.45, fbm(rng_for(seed, 'rhythm'), h, w, rhythm_cell, 3))
    amp = e * (found_px * hard + lost_px * (1 - hard) * (0.2 + 0.8 * rhythm))
    d = amp * (pos - neg)
    a = np.deg2rad(angle_deg)
    dx, dy = (d * np.cos(a)).astype(np.float32), (d * np.sin(a)).astype(np.float32)
    tx, ty, _, _ = structure_tensor(cv2.GaussianBlur(L, (0, 0), 1.0) / 100.0, 1.5)
    wob = rule_px * e * fbm(rng_for(seed, 'rule'), h, w, rule_cell, 3)
    dx, dy = (dx - ty * wob).astype(np.float32), (dy + tx * wob).astype(np.float32)
    big = cv2.resize(rgb, (w * ss, h * ss), interpolation=cv2.INTER_LINEAR)
    dxb = cv2.resize(dx, (w * ss, h * ss), interpolation=cv2.INTER_LINEAR) * ss
    dyb = cv2.resize(dy, (w * ss, h * ss), interpolation=cv2.INTER_LINEAR) * ss
    X, Y = np.meshgrid(np.arange(w * ss, dtype=np.float32), np.arange(h * ss, dtype=np.float32))
    out = cv2.remap(big, X + dxb, Y + dyb, cv2.INTER_NEAREST, borderMode=cv2.BORDER_REFLECT)
    return cv2.resize(out, (w, h), interpolation=cv2.INTER_AREA), hard


def shape_light(rgb, lbl, light=(-0.70, -0.62), gL=0.028, gb=0.010, mottle=0.008, seed=3, cell=160.0, mask=None):
    """Colour moving within a shape, by the light: each region gets a gentle lit-to-shade ramp toward the key
    (+-gL in OKLab L ~ +-2.8 L*), warmer on the lit side and cooler away (+-gb on OKLab b), plus a very soft mottle.
    Flat colour stays the design; this only lets the light travel across it."""
    h, w = lbl.shape
    ids, inv = np.unique(lbl, return_inverse=True)
    inv = inv.reshape(h, w)
    yy, xx = np.indices((h, w), dtype=np.float32)
    cnt = np.bincount(inv.ravel()).astype(np.float32)
    cx = np.bincount(inv.ravel(), xx.ravel()) / cnt
    cy = np.bincount(inv.ravel(), yy.ravel()) / cnt
    rad = np.sqrt(cnt / np.pi) + 4.0
    lx, ly = -light[0], -light[1]                                   # direction toward the light in the image
    nrm = np.hypot(lx, ly)
    lx, ly = lx / nrm, ly / nrm
    s = ((xx - cx[inv]) * lx + (yy - cy[inv]) * ly) / rad[inv]
    s = np.clip(s, -1.2, 1.2)
    s = -s                                                          # +1 = toward the light
    lab = srgb_to_oklab(rgb)
    mo = fbm(rng_for(seed, 'mottle'), h, w, cell, 3)
    m = 1.0 if mask is None else mask
    lab[..., 0] += m * (gL * s + mottle * mo)
    lab[..., 2] += m * (gb * s)
    return oklab_to_srgb(lab)


def colour_oscillation(rgb, seed, dL=0.025, dab=0.012, cell=90, mask=None):
    """Low-frequency variation of value and hue INSIDE shapes (OKLab; dL 0.025 ~ +-2.5 L*), never across the whole
    frame as one texture: the noise is re-seeded per region when a label map is given via `mask`."""
    h, w = rgb.shape[:2]
    rng = rng_for(seed, 'osc')
    n1 = fbm(rng, h, w, cell, 3)
    n2 = fbm(rng, h, w, cell * 1.6, 3)
    n3 = fbm(rng, h, w, cell * 2.3, 2)
    lab = srgb_to_oklab(rgb)
    m = 1.0 if mask is None else mask[..., None]
    lab = lab + m * np.stack([dL * n1, dab * n2, dab * n3], -1)
    return oklab_to_srgb(lab)


def paper_grain(rgb, seed, amp=0.012, cell=1.6):
    h, w = rgb.shape[:2]
    rng = rng_for(seed, 'grain')
    g = fbm(rng, h, w, cell * 2, 2)
    lab = srgb_to_oklab(rgb)
    lab[..., 0] += amp * g
    return oklab_to_srgb(lab)




def make_stamp(rng, L, W, dry=(0.25, 0.6), soft=1.2):
    """A flat-brush stamp (alpha, W x L px): an even core with soft long sides, a square-ish head and a dry tail whose
    bristle gaps run ALONG the stroke over its last 25-60 % (PAINT_RECIPES §1.8)."""
    L, W = int(max(6, L)), int(max(3, W))
    x = np.linspace(0, 1, L)[None, :]
    y = np.linspace(-1, 1, W)[:, None]
    side = np.clip((1 - np.abs(y)) * W / (2 * soft), 0, 1)
    head = np.clip(x * L / 2.0, 0, 1)
    bristle = cv2.resize(rng.random((W, max(2, L // 10))).astype(np.float32), (L, W), interpolation=cv2.INTER_LINEAR)
    d0 = rng.uniform(*dry)
    t = np.clip((x - (1 - d0)) / d0, 0, 1)
    keep = cv2.GaussianBlur((bristle > t * 1.05).astype(np.float32), (0, 0), 0.6)
    return np.clip(side * head * (1 - t * 0.35) * keep, 0, 1).astype(np.float32)


def stamp_into(canvas, stamp, cx, cy, ang, col, op):
    """Composite one rotated stamp of colour `col` at opacity `op`, centred at (cx, cy)."""
    h, w = stamp.shape
    r = int(np.ceil(np.hypot(w, h) / 2)) + 2
    M = cv2.getRotationMatrix2D((w / 2, h / 2), -np.degrees(ang), 1.0)
    M[0, 2] += r - w / 2
    M[1, 2] += r - h / 2
    rot = cv2.warpAffine(stamp, M, (2 * r, 2 * r), flags=cv2.INTER_LINEAR, borderValue=0)
    x0, y0 = int(round(cx)) - r, int(round(cy)) - r
    H, Wc = canvas.shape[:2]
    xa, ya, xb, yb = max(0, x0), max(0, y0), min(Wc, x0 + 2 * r), min(H, y0 + 2 * r)
    if xa >= xb or ya >= yb:
        return
    a = rot[ya - y0:yb - y0, xa - x0:xb - x0, None] * op
    canvas[ya:yb, xa:xb] = canvas[ya:yb, xa:xb] * (1 - a) + col[None, None, :] * a


def edge_strokes(rgb, seed, brush_deg=0.0, protect=None, c_found=14.0, c_min=1.5, spacing=14, length=(14, 26),
                 width=(3, 6), lap=0.35, op=(0.6, 0.85), ss=2):
    """EDGE STROKES, the quality route for lost edges: one flat-brush stamp every ~`spacing` px along every edge whose
    value step is under `c_found` (L*), in the colour of one side or the other (a slow noise along the contour: the
    lost / found rhythm), oriented along the edge where it runs with the brush and along the brush where it crosses it,
    lapping 0.35 of its width over the edge; none where `protect` (the subject, props, people) is set. 2x supersampled,
    seeded, deterministic."""
    rng = rng_for(seed, 'edge_strokes')
    h, w = rgb.shape[:2]
    L = luminance_L(rgb) * 100
    c = cv2.dilate(L, np.ones((5, 5), np.uint8)) - cv2.erode(L, np.ones((5, 5), np.uint8))
    Lb = cv2.GaussianBlur(L, (0, 0), 1.0)
    tx, ty, _, _ = structure_tensor(Lb / 100.0, 2.0)
    gx = cv2.Sobel(Lb, cv2.CV_32F, 1, 0, ksize=3)
    gy = cv2.Sobel(Lb, cv2.CV_32F, 0, 1, ksize=3)
    gm = np.hypot(gx, gy)
    can = cv2.Canny(np.clip(L * 2.55, 0, 255).astype(np.uint8), 8, 20, L2gradient=True) > 0
    cand = can & (c >= c_min) & (c < c_found)
    if protect is not None:
        cand &= protect < 0.5
    ys, xs = np.nonzero(cand)
    taken, pts = set(), []
    for k in rng.permutation(len(xs)):
        key = (int(ys[k]) // spacing, int(xs[k]) // spacing)
        if key not in taken:
            taken.add(key)
            pts.append((int(xs[k]), int(ys[k])))
    rhythm = fbm(rng_for(seed, 'edge_rhythm'), h, w, 60.0, 3)
    big = cv2.resize(rgb, (w * ss, h * ss), interpolation=cv2.INTER_LINEAR)
    bd = np.deg2rad(brush_deg)
    bdir = np.array([np.cos(bd), np.sin(bd)])
    stamps = [make_stamp(rng, rng.uniform(*length) * ss, rng.uniform(*width) * ss) for _ in range(24)]
    for (x, y) in pts:
        t = np.array([tx[y, x], ty[y, x]])
        nrm = np.array([gx[y, x], gy[y, x]]) / (gm[y, x] + 1e-6)
        pa = (int(np.clip(x - 3 * nrm[0], 0, w - 1)), int(np.clip(y - 3 * nrm[1], 0, h - 1)))
        pb = (int(np.clip(x + 3 * nrm[0], 0, w - 1)), int(np.clip(y + 3 * nrm[1], 0, h - 1)))
        side = 1 if rhythm[y, x] + rng.normal(0, 0.25) > 0 else -1
        col = rgb[pb[1], pb[0]] if side > 0 else rgb[pa[1], pa[0]]
        lab = srgb_to_oklab(col[None, None, :]) + (rng.normal(0, 0.006, 3) * np.array([1, .5, .5]))
        col = oklab_to_srgb(lab.astype(np.float32))[0, 0]
        d = t if abs(float(t @ bdir)) > 0.5 else bdir
        ang = np.arctan2(d[1], d[0]) + rng.normal(0, 0.06)
        st = stamps[int(rng.integers(len(stamps)))]
        off = -side * lap * st.shape[0] / ss
        if rng.random() < 0.5:
            st = st[:, ::-1]
        stamp_into(big, st, (x + off * nrm[0]) * ss, (y + off * nrm[1]) * ss, ang, col.astype(np.float32),
                   rng.uniform(*op))
    return cv2.resize(big, (w, h), interpolation=cv2.INTER_AREA), len(pts)

# ---------------------------------------------------------------------------------------------- RANKED LOW: filters


def lic(noise, fx, fy, length=14, lbl=None, step=1.0):
    """Line integral convolution of `noise` along the flow (fx, fy), both directions, `length` steps each.
    With a label map, a streamline stops at a region boundary (strokes clipped at edges)."""
    h, w = noise.shape
    X, Y = np.meshgrid(np.arange(w, dtype=np.float32), np.arange(h, dtype=np.float32))
    acc = noise.copy()
    wsum = np.ones_like(noise)
    for sgn in (1.0, -1.0):
        px, py = X.copy(), Y.copy()
        alive = np.ones_like(noise)
        for i in range(length):
            vx = cv2.remap(fx, px, py, cv2.INTER_LINEAR, borderMode=cv2.BORDER_REPLICATE)
            vy = cv2.remap(fy, px, py, cv2.INTER_LINEAR, borderMode=cv2.BORDER_REPLICATE)
            px = px + sgn * step * vx
            py = py + sgn * step * vy
            if lbl is not None:
                l2 = cv2.remap(lbl.astype(np.float32), px, py, cv2.INTER_NEAREST, borderMode=cv2.BORDER_REPLICATE)
                alive = alive * (l2 == lbl).astype(np.float32)
            wt = alive * (1.0 - i / length)
            acc += wt * cv2.remap(noise, px, py, cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)
            wsum += wt
    return acc / wsum


def brush_texture(rgb, seed, fx, fy, amp=0.03, grain=1.2, length=14, lbl=None, mask=None):
    """Flow-aligned brush streaks as a value modulation (OKLab L +-amp), clipped at region edges."""
    h, w = rgb.shape[:2]
    rng = rng_for(seed, 'lic')
    noise = rng.standard_normal((h, w)).astype(np.float32)
    noise = cv2.GaussianBlur(noise, (0, 0), grain)
    t = lic(noise, fx, fy, length, lbl)
    t = t / (t.std() + 1e-6)
    lab = srgb_to_oklab(rgb)
    m = 1.0 if mask is None else mask
    lab[..., 0] += amp * np.clip(t, -2.5, 2.5) * m
    return oklab_to_srgb(lab)


def _sector_kernels(r, n=8, ecc=1.0, angle=0.0, q_smooth=1.0):
    """Generalized (Papari) smooth sector kernels on an ellipse (semi-axes r*ecc along `angle`, r/ecc across)."""
    size = int(np.ceil(r * max(ecc, 1.0))) * 2 + 1
    c = size // 2
    yy, xx = np.mgrid[-c:c + 1, -c:c + 1].astype(np.float32)
    ca, sa = np.cos(angle), np.sin(angle)
    u = (ca * xx + sa * yy) / (r * ecc)
    v = (-sa * xx + ca * yy) / (r / ecc)
    rad = np.sqrt(u * u + v * v)
    gauss = np.exp(-(rad ** 2) / (2 * 0.45 ** 2)) * (rad <= 1.0)
    phi = np.arctan2(v, u)
    ks = []
    for i in range(n):
        a0 = 2 * np.pi * i / n
        d = np.angle(np.exp(1j * (phi - a0)))
        sect = np.exp(-(d ** 2) / (2 * (np.pi / n * 0.85) ** 2))
        k = (sect * gauss).astype(np.float32)
        k[c, c] = gauss[c, c] / n
        ks.append(k / k.sum())
    return ks


def kuwahara(rgb, r=6, n=8, q=8.0, ecc=1.0, angle=0.0):
    """Generalized Kuwahara (isotropic when ecc=1): per sector weighted mean and variance, combined with
    weights 1 / (1 + std^q)."""
    num = np.zeros_like(rgb)
    den = np.zeros(rgb.shape[:2], np.float32)
    sq = rgb * rgb
    for k in _sector_kernels(r, n, ecc, angle):
        m = cv2.filter2D(rgb, -1, k, borderType=cv2.BORDER_REFLECT)
        s2 = cv2.filter2D(sq, -1, k, borderType=cv2.BORDER_REFLECT) - m * m
        sd = np.sqrt(np.maximum(s2.sum(-1), 1e-8))
        wgt = 1.0 / (1.0 + (sd * 255.0 / 8.0) ** q)
        num += m * wgt[..., None]
        den += wgt
    return num / den[..., None]


def anisotropic_kuwahara(rgb, r=6, n=8, q=8.0, bins=8, alpha=1.0, rho=2.5):
    """Anisotropic Kuwahara (Kyprianidis 2009), approximated: the flow orientation is quantised into `bins`; each bin
    runs the elliptical sector filter once (fixed eccentricity from the median anisotropy), and every pixel blends its
    two nearest bins, then mixes toward the isotropic result where the anisotropy is low."""
    tx, ty, A, _ = structure_tensor(luminance_L(rgb), rho)
    theta = np.mod(np.arctan2(ty, tx), np.pi)
    ecc = float(np.sqrt((alpha + 0.6) / alpha))
    outs = [kuwahara(rgb, r, n, q, ecc, np.pi * b / bins) for b in range(bins)]
    iso = kuwahara(rgb, r, n, q, 1.0, 0.0)
    pos = theta / np.pi * bins
    b0 = np.floor(pos).astype(np.int32) % bins
    b1 = (b0 + 1) % bins
    t = (pos - np.floor(pos))[..., None]
    stack = np.stack(outs, 0)
    yy, xx = np.indices(theta.shape)
    aniso = stack[b0, yy, xx] * (1 - t) + stack[b1, yy, xx] * t
    a = np.clip(A * 1.4, 0, 1)[..., None]
    return aniso * a + iso * (1 - a)


def density(c, d):
    """Bousseau et al. 2006 pigment density: C' = C (1 - (1 - C)(d - 1)); d > 1 darkens, d < 1 lightens."""
    return np.clip(c * (1.0 - (1.0 - c) * (d - 1.0)), 0, 1)


def watercolour(rgb, seed, lbl, edge=0.35, gran=0.25, turb=0.15, paper_cell=2.0):
    h, w = rgb.shape[:2]
    rng = rng_for(seed, 'wc')
    paper = fbm(rng, h, w, paper_cell * 3, 3)          # paper height, fine
    flow = fbm(rng, h, w, 120.0, 3)                    # low-frequency pigment turbulence
    b = boundary(lbl)
    d = cv2.distanceTransform((~b).astype(np.uint8), cv2.DIST_L2, 3)
    ed = np.exp(-d / 2.5)                              # pigment piles up at the inner edge
    dd = 1.0 + edge * ed + gran * 0.5 * paper + turb * flow
    return density(rgb, dd[..., None])


def hertzmann(src, seed, radii=(12, 6, 3), fs=0.6, T=0.045, fc=0.75, maxlen=12, minlen=3, jitter=0.012,
              base=None, opacity=1.0):
    """Painterly rendering with curved strokes of multiple sizes (Hertzmann 1998), compact: coarse-to-fine; each
    brush paints where the canvas still differs from a blurred reference by more than T (OKLab distance); a stroke
    starts at the worst point of a grid cell and bends along the isophote (normal to the gradient), with curvature
    filter fc; its colour is the reference colour there with a small OKLab jitter (colour moving within a shape).
    STOPPING EARLY (fewer radii) = a brushier, simpler picture: the depth ladder (far = coarse brushes only)."""
    rng = rng_for(seed, 'hz')
    h, w = src.shape[:2]
    canvas = (cv2.GaussianBlur(src, (0, 0), radii[0] * 1.5) if base is None else base.copy())
    cv8 = (np.clip(canvas, 0, 1) * 255).astype(np.uint8)
    nstrokes = 0
    for R in radii:
        ref = cv2.GaussianBlur(src, (0, 0), max(0.5, fs * R))
        ref_lab = srgb_to_oklab(ref)
        cur = cv8.astype(np.float32) / 255.0
        diff = np.linalg.norm(srgb_to_oklab(cur) - ref_lab, axis=-1)
        Lr = ref_lab[..., 0]
        gx = cv2.Sobel(Lr, cv2.CV_32F, 1, 0, ksize=3)
        gy = cv2.Sobel(Lr, cv2.CV_32F, 0, 1, ksize=3)
        g = max(1, int(R))
        starts = []
        for y0 in range(0, h, g):
            for x0 in range(0, w, g):
                cell = diff[y0:y0 + g, x0:x0 + g]
                if cell.mean() > T:
                    iy, ix = np.unravel_index(int(np.argmax(cell)), cell.shape)
                    starts.append((x0 + ix, y0 + iy))
        order = rng.permutation(len(starts))
        thick = max(1, int(round(2 * R * 0.85)))
        for k in order:
            x, y = starts[k]
            col = ref[y, x].copy()
            lab = ref_lab[y, x] + rng.normal(0, jitter, 3).astype(np.float32) * np.array([1, 0.5, 0.5], np.float32)
            col = oklab_to_srgb(lab[None, None, :])[0, 0]
            pts = [(x, y)]
            ldx = ldy = 0.0
            fx, fy = float(x), float(y)
            for i in range(maxlen):
                xi, yi = int(round(fx)), int(round(fy))
                if not (0 <= xi < w and 0 <= yi < h):
                    break
                if i > minlen:
                    c_ref = ref_lab[yi, xi]
                    c_can = srgb_to_oklab(cv8[yi, xi].astype(np.float32)[None, None, :] / 255.0)[0, 0]
                    if np.linalg.norm(c_ref - c_can) < np.linalg.norm(c_ref - lab):
                        break
                gxv, gyv = gx[yi, xi], gy[yi, xi]
                gm = np.hypot(gxv, gyv)
                if gm < 1e-6:
                    if i == 0:
                        ang = rng.uniform(0, np.pi)
                        dx, dy = np.cos(ang), np.sin(ang)
                    else:
                        dx, dy = ldx, ldy
                else:
                    dx, dy = -gyv / gm, gxv / gm
                if ldx * dx + ldy * dy < 0:
                    dx, dy = -dx, -dy
                if i > 0:
                    dx, dy = fc * dx + (1 - fc) * ldx, fc * dy + (1 - fc) * ldy
                    n = np.hypot(dx, dy) + 1e-9
                    dx, dy = dx / n, dy / n
                fx, fy = fx + R * dx, fy + R * dy
                ldx, ldy = dx, dy
                pts.append((int(round(fx)), int(round(fy))))
            c8 = tuple(int(v) for v in np.clip(col * 255, 0, 255))
            if opacity >= 1.0:
                cv2.polylines(cv8, [np.array(pts, np.int32)], False, c8, thick, cv2.LINE_AA)
            else:
                lay = cv8.copy()
                cv2.polylines(lay, [np.array(pts, np.int32)], False, c8, thick, cv2.LINE_AA)
                cv8 = cv2.addWeighted(lay, opacity, cv8, 1 - opacity, 0)
            nstrokes += 1
    return cv8.astype(np.float32) / 255.0, nstrokes



# ---------------------------------------------------------------------------------------------- io


def load(path):
    im = cv2.imread(path, cv2.IMREAD_COLOR)[..., ::-1]
    return (im.astype(np.float32) / 255.0)


def save(path, rgb):
    cv2.imwrite(path, (np.clip(rgb, 0, 1)[..., ::-1] * 255.0 + 0.5).astype(np.uint8))



# ---------------------------------------------------------------------------------------------- design-level demo (a facade patch)


S = 4  # supersampling


def hexf(h):
    h = h.lstrip('#'); return np.array([int(h[i:i + 2], 16) for i in (0, 2, 4)], np.float32) / 255.0


def poly(img, pts, col):
    cv2.fillPoly(img, [np.round(np.array(pts) * S).astype(np.int32)], tuple(float(c) for c in col[::-1]), cv2.LINE_AA)


def hand_line(img, p0, p1, col, w0, rng, wob=0.6, w_var=0.25):
    """A hand-ruled line: a thin polygon whose centre wobbles (low frequency) and whose width varies along it."""
    p0, p1 = np.array(p0, np.float32), np.array(p1, np.float32)
    L = np.linalg.norm(p1 - p0); n = max(8, int(L / 6))
    t = np.linspace(0, 1, n)
    d = (p1 - p0) / max(L, 1e-6); nrm = np.array([-d[1], d[0]])
    k = rng.normal(0, 1, 4)
    off = wob * (k[0] * np.sin(np.pi * t * (1 + abs(k[1]))) + 0.5 * k[2] * np.sin(2 * np.pi * t + k[3]))
    wid = w0 * (1 + w_var * np.sin(np.pi * t * (0.7 + 0.6 * rng.random()) + rng.random() * 3))
    c = p0[None] + t[:, None] * (p1 - p0)[None] + off[:, None] * nrm[None]
    a = c + 0.5 * wid[:, None] * nrm[None]; b = c - 0.5 * wid[:, None] * nrm[None]
    poly(img, np.vstack([a, b[::-1]]), col)


def facade(variant, seed=5, W=540, H=540):
    rng = rng_for(seed, 'facade', 'A' if variant == 'A' else 'varied')
    img = np.zeros((H * S, W * S, 3), np.float32)
    wall, frame, sill = hexf('#cf9a84'), hexf('#5b4256'), hexf('#e9cdb9')
    glass_dark, glass_sky, lit = hexf('#4c6170'), hexf('#8fb0b5'), hexf('#f2cc86')
    img[:] = wall[::-1]
    pave = hexf('#b98a76')
    poly(img, [(0, 470), (W, 470), (W, H), (0, H)], pave)
    cols, rows = 4, 3
    x0, y0, dx, dy, ww, wh = 38, 40, 124, 140, 82, 104
    lits = {(0, 1), (2, 0), (3, 2)} if variant != 'A' else set()
    for r in range(rows):
        for c in range(cols):
            if variant == 'A':
                x, y, w_, h_ = x0 + c * dx, y0 + r * dy, ww, wh
                g = glass_sky
                poly(img, [(x - 5, y - 5), (x + w_ + 5, y - 5), (x + w_ + 5, y + h_ + 5), (x - 5, y + h_ + 5)], frame)
                poly(img, [(x, y), (x + w_, y), (x + w_, y + h_), (x, y + h_)], g)
                poly(img, [(x - 9, y + h_ + 5), (x + w_ + 9, y + h_ + 5), (x + w_ + 9, y + h_ + 11), (x - 9, y + h_ + 11)], sill)
                poly(img, [(x + w_ / 2 - 2, y), (x + w_ / 2 + 2, y), (x + w_ / 2 + 2, y + h_), (x + w_ / 2 - 2, y + h_)], frame)
                continue
            jw, jh = rng.normal(0, 0.035), rng.normal(0, 0.03)
            x = x0 + c * dx + rng.normal(0, 1.6); y = y0 + r * dy + rng.normal(0, 1.4)
            w_, h_ = ww * (1 + jw), wh * (1 + jh)
            tilt = np.deg2rad(rng.normal(0, 0.35))
            def rot(px, py, cx=x + w_ / 2, cy=y + h_ / 2):
                return (cx + (px - cx) * np.cos(tilt) - (py - cy) * np.sin(tilt), cy + (px - cx) * np.sin(tilt) + (py - cy) * np.cos(tilt))
            q = lambda pts: [rot(*p) for p in pts]
            g = lit if (c, r) in lits else (glass_dark if rng.random() < 0.45 else glass_sky)
            g = np.clip(g + rng.normal(0, 0.015, 3), 0, 1)
            poly(img, q([(x - 4, y - 4), (x + w_ + 4, y - 4), (x + w_ + 4, y + h_ + 4), (x - 4, y + h_ + 4)]), frame * (1 + rng.normal(0, 0.04)))
            poly(img, q([(x, y), (x + w_, y), (x + w_, y + h_), (x, y + h_)]), g)
            if (c, r) not in lits and g[2] > 0.6:   # a sky reflection band, its own angle per pane
                bx = x + rng.uniform(0.1, 0.5) * w_; bw = rng.uniform(8, 18)
                poly(img, q([(bx, y), (bx + bw, y), (bx + bw - 22, y + h_), (bx - 22, y + h_)]), np.clip(g + 0.06, 0, 1))
            if (c, r) in lits and rng.random() < 0.8:  # a curtain, an irregular soft shape
                cw = rng.uniform(0.2, 0.35) * w_
                pts = [(x, y), (x + cw, y)] + [(x + cw + 3 * np.sin(k * 1.3 + rng.random()), y + k * h_ / 6) for k in range(1, 7)] + [(x, y + h_)]
                poly(img, q(pts), np.clip(lit * 0.86 + hexf('#c86b5a') * 0.14, 0, 1))
            hand_line(img, rot(x + w_ / 2, y), rot(x + w_ / 2, y + h_), frame, 3.2, rng)
            sl = rng.normal(0, 1.2)
            poly(img, q([(x - 8, y + h_ + 4), (x + w_ + 8, y + h_ + 4 + sl * 0.3), (x + w_ + 8, y + h_ + 10 + sl * 0.3), (x - 8, y + h_ + 10)]), sill)
    out = cv2.resize(img, (W, H), interpolation=cv2.INTER_AREA)[..., ::-1]
    if variant in ('C', 'D'):
        # light: the wall ramps toward the key (upper left), a very soft mottle; a dappled tree shadow on the right
        yy, xx = np.indices((H, W), dtype=np.float32)
        lab = srgb_to_oklab(out)
        ramp = ((W - xx) / W * 0.6 + (H - yy) / H * 0.4 - 0.5)
        lab[..., 0] += 0.035 * ramp + 0.006 * fbm(rng_for(seed, 'mot'), H, W, 120, 3)
        lab[..., 2] += 0.012 * ramp
        n = fbm(rng_for(seed, 'leaf'), H, W, 26, 4)
        reach = smoothstep(0.45, 0.98, xx / W) * smoothstep(0.0, 0.3, yy / H)
        sh = smoothstep(0.06, 0.2, n + 0.6 * reach - 0.48) * (yy < 470)
        sh = cv2.GaussianBlur(sh.astype(np.float32), (0, 0), 1.4)
        glass = (np.abs(out - wall[None, None, :]).sum(-1) > 0.12).astype(np.float32)   # glass and frames take less
        sh = sh * (1 - 0.55 * cv2.GaussianBlur(glass, (0, 0), 1.0))
        lab[..., 0] -= 0.07 * sh
        lab[..., 1] += 0.008 * sh; lab[..., 2] -= 0.016 * sh   # a lilac shade, not a grey one
        out = oklab_to_srgb(lab)
    if variant == 'D':
        out, _ = edge_teeth_maps(out, seed, 75.0, lost_px=4.0, found_px=0.35, rule_px=0.35, streak=18, tooth=1.6, density=0.3)
    return out


# ---------------------------------------------------------------------------------------------- the sheet
FAR = (0, 560, 540, 1100)        # frame box of the far crop: sky, far city (+4), tower (+3), bridge (+2), the facade (0)
NEAR = (360, 1340, 900, 1880)    # frame box of the near crop: the paving (-1) and its props


def rect_map(h, w, rects, base=0.0, blur=2.0):
    m = np.full((h, w), base, np.float32)
    for (x0, y0, x1, y1, v) in rects:
        m[max(0, y0):max(0, y1), max(0, x0):max(0, x1)] = v
    return cv2.GaussianBlur(m, (0, 0), blur) if blur else m


def far_by_intent(img):
    """The depth ladder by intent on the far crop: vapour and the far roofs lose their edges in dry teeth along the
    wind (horizontal), the tower (+3) and the bridge (+2) keep their silhouettes with a hand-ruled wobble and short
    teeth, the facade (the subject's plane) stays crisp; light travels across every shape."""
    h, w = img.shape[:2]
    lost = rect_map(h, w, [(0, 0, 540, 200, 10.0), (0, 200, 256, 375, 6.0), (256, 30, 314, 335, 2.0),
                           (0, 375, 314, 505, 2.5), (314, 50, 540, 540, 0.0), (0, 485, 540, 540, 0.0)])
    found = rect_map(h, w, [(0, 0, 540, 375, 1.0), (0, 375, 314, 505, 0.6), (314, 50, 540, 540, 0.25),
                            (0, 485, 540, 540, 0.3)], 0.5)
    rule = rect_map(h, w, [(0, 0, 540, 375, 0.9), (0, 375, 314, 505, 0.7), (314, 50, 540, 540, 0.45),
                           (0, 485, 540, 540, 0.45)], 0.5)
    out, _ = edge_teeth_maps(img, 21, 0.0, lost, found, rule)
    lbl = clean_regions(img, k=20, seed=3)
    subj = rect_map(h, w, [(314, 50, 540, 540, 1.0)])
    return shape_light(out, lbl, gL=0.024, gb=0.009, mottle=0.006, mask=1 - 0.5 * subj)


def near_props(h, w):
    """The near crop's props (table, chairs, crate, bin, bench, fern): they keep found edges."""
    return rect_map(h, w, [(208, 190, 540, 340, 1.0), (0, 210, 190, 460, 1.0), (485, 20, 540, 540, 1.0),
                           (530, 25, 540, 105, 1.0), (0, 310, 300, 540, 1.0)])


def near_strokes(img, spacing):
    """Edge strokes on the near ground (along the paving's lines, 17 deg), then the light per tile."""
    h, w = img.shape[:2]
    if spacing <= 14:
        out, _ = edge_strokes(img, 5, 17.0, protect=near_props(h, w), spacing=14, length=(14, 26), width=(3, 6),
                              op=(0.6, 0.85))
    else:
        out, _ = edge_strokes(img, 5, 17.0, protect=near_props(h, w), spacing=20, length=(20, 34), width=(4, 7),
                              op=(0.7, 0.9))
    return shape_light(out, clean_regions(img, k=20, seed=3), gL=0.028, gb=0.010, mottle=0.008)


def near_by_intent(img):
    """The near ground by intent: the props (table, chairs, crate, bin, bench, fern) keep found edges; the paving's
    joints and the cast shadows (low value steps) lose and break along the paving's lines (17 deg); each tile and
    shadow gets the light moving across it."""
    h, w = img.shape[:2]
    props = near_props(h, w)
    lost = 8.0 * (1 - props)
    found = 0.8 * (1 - props) + 0.2 * props
    rule = 0.5 * (1 - props) + 0.3 * props
    out, _ = edge_teeth_maps(img, 22, 17.0, lost, found, rule)
    lbl = clean_regions(img, k=20, seed=3)
    return shape_light(out, lbl, gL=0.028, gb=0.010, mottle=0.008)


def label(panel, text, sub=''):
    h, w = panel.shape[:2]
    strip = np.full((44, w, 3), 245, np.uint8)
    cv2.putText(strip, text, (8, 19), cv2.FONT_HERSHEY_SIMPLEX, 0.52, (30, 30, 30), 1, cv2.LINE_AA)
    if sub:
        cv2.putText(strip, sub, (8, 38), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (90, 90, 90), 1, cv2.LINE_AA)
    return np.vstack([strip, panel])


def to8(rgb):
    return (np.clip(rgb, 0, 1)[..., ::-1] * 255 + 0.5).astype(np.uint8)


def make_sheet(out_path):
    still = load(STILL)
    x0, y0, x1, y1 = FAR
    far = still[y0:y1, x0:x1].copy()
    x0, y0, x1, y1 = NEAR
    near = still[y0:y1, x0:x1].copy()
    lbl_near = clean_regions(near, k=20, seed=3)
    fx, fy = flow_field(near, 17.0)
    rows = []
    rows.append([
        label(to8(far), '1 v6 as is (far crop)', 'razor edges everywhere, flat fills'),
        label(to8(anisotropic_kuwahara(far, r=7, bins=8)), '2 anisotropic Kuwahara r7', 'FILTER: softens, removes detail, no brush'),
        label(to8(hertzmann(far, 7, radii=(12, 6, 3))[0]), '3 generic Hertzmann strokes 12/6/3', 'FILTER: round dabs, "oil paint filter"'),
        label(to8(far_by_intent(far)), '4 BY INTENT: depth ladder', 'far loses edges in dry teeth; subject crisp'),
    ])
    rows.append([
        label(to8(near), '1 v6 as is (near crop)', 'ruler joints, perfect ellipses'),
        label(to8(brush_texture(colour_oscillation(near, 9, 0.02, 0.008, 70), 11, fx, fy, amp=0.03, length=14, lbl=lbl_near)),
              '2 LIC brush texture everywhere', 'FILTER: even streaks = a filter look'),
        label(to8(watercolour(near, 5, lbl_near)), '3 watercolour edge darkening', 'outlines + stains: off-brand'),
        label(to8(near_by_intent(near)), '4 BY INTENT: lost joints, crisp props', 'value-grouped edges break; light per tile'),
    ])
    subj = rect_map(*far.shape[:2], [(314, 50, 540, 540, 1.0), (0, 485, 540, 540, 1.0)], blur=0)
    rows.append([
        label(to8(near_strokes(near, 14)), '5 EDGE STROKES, light (near)', 'flat stamps along lost edges; props crisp'),
        label(to8(near_strokes(near, 20)), '6 EDGE STROKES, bolder (near)', 'longer, fewer strokes: the joints brushed'),
        label(to8(edge_strokes(far, 6, 0.0, protect=subj, spacing=18, length=(16, 28), width=(3, 5), op=(0.5, 0.75),
                               c_min=3.0, c_found=10.0)[0]), '7 EDGE STROKES, light (far)', 'horizontal marks on the far planes'),
        label(to8(edge_strokes(far, 6, 0.0, protect=subj, spacing=26, length=(24, 40), width=(4, 7), op=(0.6, 0.8),
                               c_min=3.0, c_found=12.0)[0]), '8 EDGE STROKES, bolder (far)', '"more like brushes": dose for the owner'),
    ])
    rows.append([
        label(to8(facade('A')), '1 design: perfect grid', 'one template, flat fills, ruler lines'),
        label(to8(facade('B')), '2 + variation, hand-ruled', 'each window its own; mullions drawn'),
        label(to8(facade('C')), '3 + light ramp, leaf shade', 'light moves; a tree out of frame'),
        label(to8(facade('D')), '4 + edges by value', 'low steps break (subtle at 1:1)'),
    ])
    sheet = np.vstack([np.hstack(r) for r in rows])
    cv2.imwrite(out_path, sheet, [cv2.IMWRITE_JPEG_QUALITY, 88])
    return sheet.shape


# ---------------------------------------------------------------------------------------------- --bench
def bench():
    os.environ.setdefault('OMP_NUM_THREADS', '1')
    img = load(STILL)
    h, w = img.shape[:2]
    res = {}

    def tm(name, fn, reps=1):
        best, out = 1e9, None
        for _ in range(reps):
            t = time.perf_counter(); out = fn(); best = min(best, time.perf_counter() - t)
        res[name] = round(best, 3); print(f'{name:40s} {best:8.3f} s', flush=True); return out
    dx, dy = tm('domain warp field (nested fbm)', lambda: warp_field(rng_for(1, 'w'), h, w, 60, 5.0), 2)
    tm('apply warp (remap)', lambda: apply_warp(img, dx, dy), 2)
    tm('flow field (structure tensor)', lambda: flow_field(img, 0.0), 2)
    tm('edge_teeth_maps (2x supersampled)', lambda: edge_teeth_maps(img, 3, 0.0), 2)
    out, n = tm('edge strokes (2x supersampled)', lambda: edge_strokes(img, 3, 0.0)); res['edge strokes count'] = n
    lbl = tm('regions from a composite (k-means)', lambda: clean_regions(img, 24, 3))
    tm('shape_light (given regions)', lambda: shape_light(img, lbl), 2)
    tm('colour oscillation', lambda: colour_oscillation(img, 3), 2)
    tm('paper grain', lambda: paper_grain(img, 3), 2)
    fx, fy = flow_field(img, 0.0)
    tm('LIC brush texture (14 steps x 2)', lambda: brush_texture(img, 3, fx, fy, length=14))
    tm('Kuwahara, generalized, r6', lambda: kuwahara(img, 6))
    tm('anisotropic Kuwahara r6 (8 bins)', lambda: anisotropic_kuwahara(img, 6, bins=8))
    tm('watercolour (density, edges, paper)', lambda: watercolour(img, 3, lbl), 2)
    out, n = tm('Hertzmann strokes 14/8', lambda: hertzmann(img, 7, radii=(14, 8))); res['strokes 14/8'] = n
    out, n = tm('Hertzmann strokes 12/6/3', lambda: hertzmann(img, 7, radii=(12, 6, 3))); res['strokes 12/6/3'] = n
    a, _ = edge_teeth_maps(img, 9, 0.0); b, _ = edge_teeth_maps(img, 9, 0.0)
    res['deterministic'] = hashlib.md5(a.tobytes()).hexdigest() == hashlib.md5(b.tobytes()).hexdigest()
    print(json.dumps(res, indent=1))


# ---------------------------------------------------------------------------------------------- --measure
def measure():
    """Edge and fill statistics at phone scale (1080 px wide, every image re-encoded JPEG q85 so ours and the
    screenshots carry the same codec). Edge width is calibrated on synthetic edges: an estimate of 3.0 ~ a 10-90 %
    width of 1.5 px (crisp), 4.5 ~ 3.8 px (soft). Edges with a step under 8 L* or wider than ~10 px are not counted."""
    R = os.path.join(VIDEO, 'docs/look/')
    ui = json.load(open(R + 'poster_refs/ui_mask.json'))['images']
    items = [('v6 still (ours)', STILL, None, []),
             ('h01 city hill', R + 'refs_human_scale/01_city_hill_sunset.jpg', None, [(1072, 500, 1180, 600)]),
             ('h02 bus stop', R + 'refs_human_scale/02_bus_stop_night.jpg', None, [(1072, 480, 1180, 590)]),
             ('h03 beach dusk', R + 'refs_human_scale/03_beach_dusk.jpg', None, [(1072, 495, 1180, 600)]),
             ('h04 cloud beast (9:16)', R + 'refs_human_scale/04_cloud_beast_frame.jpg', None, []),
             ('p01 beach van', R + 'refs_paint/01_beach_van_dusk.jpg', (22, 25, 1185, 405), []),
             ('p02 lighthouse', R + 'refs_paint/02_lighthouse_process.jpg', (230, 460, 1060, 1810), [])]
    for k in sorted(ui):
        m = ui[k]; ya, yb = m['content_rows']
        items.append(('poster ' + k[:2], R + 'poster_refs/' + k, (0, ya, m['size'][0], yb),
                      [tuple(v) for kk, v in m.items() if kk.endswith('_box')]))
    rows = []
    for name, path, crop, boxes in items:
        im = cv2.imread(path)
        valid = np.ones(im.shape[:2], np.uint8)
        for (bx0, by0, bx1, by1) in boxes:
            valid[by0:by1, bx0:bx1] = 0
        if crop:
            cx0, cy0, cx1, cy1 = crop; im = im[cy0:cy1, cx0:cx1]; valid = valid[cy0:cy1, cx0:cx1]
        s = 1080.0 / im.shape[1]
        im = cv2.resize(im, (1080, int(round(im.shape[0] * s))), interpolation=cv2.INTER_AREA)
        valid = cv2.resize(valid, (im.shape[1], im.shape[0]), interpolation=cv2.INTER_NEAREST)
        im = cv2.imdecode(cv2.imencode('.jpg', im, [cv2.IMWRITE_JPEG_QUALITY, 85])[1], 1)
        L = cv2.cvtColor(im.astype(np.float32) / 255.0, cv2.COLOR_BGR2Lab)[..., 0]
        valid = cv2.erode(valid, np.ones((9, 9), np.uint8)).astype(bool)
        Ls = cv2.GaussianBlur(L, (0, 0), 0.7)
        g = np.hypot(cv2.Sobel(Ls, cv2.CV_32F, 1, 0, ksize=3), cv2.Sobel(Ls, cv2.CV_32F, 0, 1, ksize=3)) / 8.0
        step = cv2.dilate(L, np.ones((9, 9), np.uint8)) - cv2.erode(L, np.ones((9, 9), np.uint8))
        can = cv2.Canny(np.clip(L * 2.55, 0, 255).astype(np.uint8), 20, 50, L2gradient=True) > 0
        E = can & (step >= 8.0) & valid
        width = step[E] / np.maximum(g[E], 1e-3)
        crisp, soft = float((width < 3.0).mean()), float((width >= 4.5).mean())
        em = (E * 255).astype(np.uint8)
        lines = cv2.HoughLinesP(em, 1, np.pi / 360, 40, minLineLength=60, maxLineGap=3)
        lm = np.zeros_like(em)
        if lines is not None:
            for lx0, ly0, lx1, ly1 in lines.reshape(-1, 4):
                cv2.line(lm, (int(lx0), int(ly0)), (int(lx1), int(ly1)), 255, 3)
        straight = float(((lm > 0) & E).sum() / max(E.sum(), 1))
        interior = valid & (cv2.dilate(can.astype(np.uint8), np.ones((9, 9), np.uint8)) == 0)
        n1 = cv2.blur(L, (31, 31)); n2 = cv2.blur(L * L, (31, 31))
        flat31 = float((np.sqrt(np.maximum(n2 - n1 * n1, 0))[interior] < 0.35).mean())
        rows.append(dict(name=name, crisp=round(crisp, 3), soft=round(soft, 3), straight=round(straight, 3),
                         flat31=round(flat31, 3), edge_density=round(float(E.sum() / valid.sum()), 4)))
        print(f"{name:24s} crisp {crisp*100:5.1f}%  soft {soft*100:5.1f}%  straight {straight*100:5.1f}%  flat31 {flat31*100:5.1f}%")
    return rows


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('--bench', action='store_true')
    ap.add_argument('--measure', action='store_true')
    ap.add_argument('--out', default=os.path.join(HERE, 'techniques_sheet.jpg'))
    a = ap.parse_args()
    if a.bench:
        bench()
    elif a.measure:
        measure()
    else:
        print('sheet', make_sheet(a.out), '->', a.out)

