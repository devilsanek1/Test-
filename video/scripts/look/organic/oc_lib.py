"""oc_lib.py: the organic proof's shared tools (docs/look/organic/organic_proof.md). Seeded and deterministic: the
same inputs give the same bytes. numpy (BSD-3), SciPy (BSD-3), OpenCV (Apache-2.0), pyfastnoiselite (MIT, the
FastNoiseLite noise: libraries.md rank 2) and MyPaint's engine through peinten (MIT port of libmypaint, ISC; brushes
CC0: libraries.md rank 1), run by mypaint_bake.mjs. Lengths are px of the 1080 x 1920 frame.

  seeded(*keys)                 a numpy Generator from a string key (sha256, as scripts/look/paint)
  fnl(shape, seed, freq, ...)   FastNoiseLite OpenSimplex2 fBm on a pixel grid, optionally domain-warped
  oklab / lab helpers           sRGB <-> OKLab, CIE L*
  flat_labels(rgba)             the regions of a flat vector render (its exact fill colours; AA seams split)
  StrokePlan                    marks by pass, written as a MyPaint job (brush, points with pressure, colour, width)
  mypaint(base, strokes)        lays the marks with MyPaint's engine over a base RGBA (smudge brushes pick it up)
  edge_alpha_light(...)         lost and found silhouette edges by the light (shapes.md section 3.3)"""
from __future__ import annotations

import hashlib
import json
import math
import os
import subprocess
import sys
import tempfile

import cv2
import numpy as np
from scipy import ndimage as ndi

HERE = os.path.dirname(os.path.abspath(__file__))
VIDEO = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
ORG_DOCS = os.path.join(VIDEO, 'docs', 'look', 'organic')
SCRATCH = os.environ.get('OC_SCRATCH', '/tmp/organic/organic_proof')
FW, FH = 1080, 1920
BAND = (290, 600)          # the caption band (LAYOUT.md section 1): nothing painted may change it

# ------------------------------------------------------------------------------------------- seeds and noise


def seeded(*keys) -> np.random.Generator:
    h = hashlib.sha256('/'.join(str(k) for k in keys).encode()).digest()
    return np.random.default_rng(int.from_bytes(h[:8], 'little'))


def seed_int(*keys) -> int:
    h = hashlib.sha256('/'.join(str(k) for k in keys).encode()).digest()
    return int.from_bytes(h[:4], 'little') & 0x7FFFFFFF


def fnl(shape, seed, freq, octaves=3, gain=0.5, lac=2.0, warp=0.0, warp_freq=None, offset=(0.0, 0.0), xs=None, ys=None):
    """FastNoiseLite OpenSimplex2 fBm in about [-1, 1] on a pixel grid (or at given coordinates). `warp` > 0 domain-warps
    it (Quilez's fbm(p + warp * q(p))): curling, eroded forms for natural shapes only."""
    from pyfastnoiselite.pyfastnoiselite import FastNoiseLite, NoiseType, FractalType
    h, w = shape
    if xs is None:
        ys, xs = np.mgrid[0:h, 0:w].astype(np.float32)
    xs = np.asarray(xs, np.float32) + offset[0]
    ys = np.asarray(ys, np.float32) + offset[1]

    def gen(sd, fq, X, Y):
        n = FastNoiseLite(seed=int(sd))
        n.noise_type = NoiseType.NoiseType_OpenSimplex2
        n.fractal_type = FractalType.FractalType_FBm
        n.fractal_octaves = int(octaves)
        n.fractal_gain = float(gain)
        n.fractal_lacunarity = float(lac)
        n.frequency = float(fq)
        c = np.stack([X.ravel(), Y.ravel()]).astype(np.float32)
        return n.gen_from_coords(c).reshape(X.shape)

    if warp > 0:
        wf = warp_freq or freq
        qx = gen(seed + 101, wf, xs, ys)
        qy = gen(seed + 202, wf, xs + 5.2 / max(wf, 1e-6) * 0.01, ys + 1.3 / max(wf, 1e-6) * 0.01)
        xs = xs + warp * qx
        ys = ys + warp * qy
    return gen(seed, freq, xs, ys)


def smoothstep(a, b, x):
    t = np.clip((x - a) / (b - a), 0.0, 1.0)
    return t * t * (3 - 2 * t)


# ------------------------------------------------------------------------------------------------- colour

def srgb2lin(c):
    c = np.asarray(c, np.float64)
    return np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)


def lin2srgb(c):
    c = np.asarray(c, np.float64)
    return np.where(c <= 0.0031308, 12.92 * c, 1.055 * np.clip(c, 0, None) ** (1 / 2.4) - 0.055)


_M1 = np.array([[0.4122214708, 0.5363325363, 0.0514459929], [0.2119034982, 0.6806995451, 0.1073969566],
                [0.0883024619, 0.2817188376, 0.6299787005]])
_M2 = np.array([[0.2104542553, 0.7936177850, -0.0040720468], [1.9779984951, -2.4285922050, 0.4505937099],
                [0.0259040371, 0.7827717662, -0.8086757660]])
_M1i, _M2i = np.linalg.inv(_M1), np.linalg.inv(_M2)


def rgb2ok(rgb):
    """sRGB (0..1, last axis RGB) -> OKLab."""
    return np.cbrt(srgb2lin(rgb) @ _M1.T) @ _M2.T


def ok2rgb(lab):
    lms = np.asarray(lab, np.float64) @ _M2i.T
    return np.clip(lin2srgb((lms ** 3) @ _M1i.T), 0, 1)


def hx(h):
    return np.array([int(h[i:i + 2], 16) / 255 for i in (1, 3, 5)])


def hexof(rgb):
    r, g, b = (int(round(float(v) * 255)) for v in np.clip(rgb, 0, 1))
    return f'#{r:02x}{g:02x}{b:02x}'


def Lstar(rgb):
    """CIE L* of sRGB (0..1)."""
    Y = srgb2lin(rgb) @ np.array([0.2126, 0.7152, 0.0722])
    return np.where(Y > 216 / 24389, 116 * np.cbrt(Y) - 16, Y * 24389 / 27)


def shift_ok(rgb, dL=0.0, da=0.0, db=0.0):
    return ok2rgb(rgb2ok(rgb) + np.array([dL, da, db]))


# ---------------------------------------------------------------------------------------------------- I/O

def load_rgba(path):
    im = cv2.imread(path, cv2.IMREAD_UNCHANGED)
    if im.ndim == 2:
        im = cv2.cvtColor(im, cv2.COLOR_GRAY2BGRA)
    if im.shape[2] == 3:
        im = np.dstack([im, np.full(im.shape[:2], 255, np.uint8)])
    rgba = im[..., [2, 1, 0, 3]].astype(np.float64) / 255.0
    return rgba


def save_rgba(path, rgba):
    a = np.clip(np.round(np.asarray(rgba) * 255), 0, 255).astype(np.uint8)
    cv2.imwrite(path, a[..., [2, 1, 0, 3]], [cv2.IMWRITE_PNG_COMPRESSION, 9])


def save_rgb(path, rgb, q=None):
    a = np.clip(np.round(np.asarray(rgb)[..., :3] * 255), 0, 255).astype(np.uint8)[..., ::-1]
    if q:
        cv2.imwrite(path, a, [cv2.IMWRITE_JPEG_QUALITY, q])
    else:
        cv2.imwrite(path, a, [cv2.IMWRITE_PNG_COMPRESSION, 9])


def over(dst_rgb, src_rgba, x=0, y=0):
    """src (straight alpha) over dst, src placed at (x, y) of dst (clipped)."""
    out = dst_rgb.copy()
    H, W = out.shape[:2]
    h, w = src_rgba.shape[:2]
    x0, y0, x1, y1 = max(0, x), max(0, y), min(W, x + w), min(H, y + h)
    if x1 <= x0 or y1 <= y0:
        return out
    s = src_rgba[y0 - y:y1 - y, x0 - x:x1 - x]
    a = s[..., 3:4]
    out[y0:y1, x0:x1] = s[..., :3] * a + out[y0:y1, x0:x1] * (1 - a)
    return out


# ----------------------------------------------------------------------------------------- flat regions

def flat_labels(rgba, min_px=24, alpha_min=0.999):
    """Label the flat fills of a vector render: every exact colour covering >= min_px opaque pixels is a region; the
    anti-aliased seam pixels (mixed colours) go to the nearest region. Returns (labels (-1 outside), colours (n x 3))."""
    a = rgba[..., 3]
    rgb8 = np.round(rgba[..., :3] * 255).astype(np.int32)
    key = (rgb8[..., 0] << 16) | (rgb8[..., 1] << 8) | rgb8[..., 2]
    op = a >= alpha_min
    vals, inv, cnt = np.unique(key[op], return_inverse=True, return_counts=True)
    keep = cnt >= min_px
    remap = np.full(len(vals), -1)
    remap[keep] = np.arange(keep.sum())
    lab = np.full(a.shape, -1, np.int32)
    lab[op] = remap[inv]
    cols = np.stack([(vals[keep] >> 16) & 255, (vals[keep] >> 8) & 255, vals[keep] & 255], -1) / 255.0
    inside = a > 0.02
    hole = inside & (lab < 0)
    if hole.any() and (lab >= 0).any():
        idx = ndi.distance_transform_edt(lab < 0, return_distances=False, return_indices=True)
        lab = np.where(hole, lab[tuple(idx)], lab)
    lab[~inside] = -1
    return lab, cols


def clean_labels(lab, min_area=30):
    """Drop every connected bit of a label smaller than min_area px (anti-aliasing slivers): it takes its nearest
    neighbour's label."""
    out = lab.copy()
    for l in np.unique(lab[lab >= 0]):
        cc, k = ndi.label(lab == l)
        if k <= 1:
            continue
        sz = ndi.sum(np.ones_like(cc), cc, index=np.arange(1, k + 1))
        small = np.nonzero(sz < min_area)[0] + 1
        if len(small):
            out[np.isin(cc, small)] = -2
    hole = out == -2
    if hole.any():
        idx = ndi.distance_transform_edt(out < 0, return_distances=False, return_indices=True)
        out = np.where(hole, out[tuple(idx)], out)
    out[lab < 0] = -1
    return out


def recolour(lab, cols, outside=(0, 0, 0)):
    out = np.zeros(lab.shape + (3,))
    m = lab >= 0
    out[m] = cols[lab[m]]
    out[~m] = outside
    return out


def boundaries(lab):
    """True on pixels whose 4-neighbour has another label."""
    b = np.zeros(lab.shape, bool)
    b[:-1] |= lab[:-1] != lab[1:]
    b[1:] |= lab[1:] != lab[:-1]
    b[:, :-1] |= lab[:, :-1] != lab[:, 1:]
    b[:, 1:] |= lab[:, 1:] != lab[:, :-1]
    return b


def warp_labels(lab, dx, dy):
    """Move a label map by a displacement field (nearest: labels stay exact)."""
    h, w = lab.shape
    ys, xs = np.mgrid[0:h, 0:w].astype(np.float32)
    mx = (xs + dx).astype(np.float32)
    my = (ys + dy).astype(np.float32)
    return cv2.remap(lab.astype(np.float32), mx, my, cv2.INTER_NEAREST, borderMode=cv2.BORDER_REPLICATE).astype(np.int32)


def round_corners(lab, r=2, protect=None):
    """Wear every corner of a label map by a majority (mode) filter of radius r: corners round, straight runs stay."""
    h, w = lab.shape
    n = lab.max() + 2
    out = lab.copy()
    k = 2 * r + 1
    ker = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (k, k)).astype(np.float32)
    best = np.full(lab.shape, -1.0, np.float32)
    bestl = lab.copy()
    for l in np.unique(lab):
        m = (lab == l).astype(np.float32)
        s = cv2.filter2D(m, -1, ker, borderType=cv2.BORDER_REPLICATE)
        upd = s > best
        best[upd] = s[upd]
        bestl[upd] = l
    out = bestl
    if protect is not None:
        out = np.where(protect, lab, out)
    return out


# --------------------------------------------------------------------------------------------- flow fields

def tangent_flow(L, rho=3.0, prefer=(1.0, 0.0), coh_floor=0.0):
    """The structure tensor's tangent (along the form), blended toward `prefer` where the form is weak."""
    g = ndi.gaussian_filter(L, 1.2)
    gx, gy = ndi.sobel(g, 1), ndi.sobel(g, 0)
    Jxx, Jxy, Jyy = (ndi.gaussian_filter(v, rho) for v in (gx * gx, gx * gy, gy * gy))
    theta = 0.5 * np.arctan2(2 * Jxy, Jxx - Jyy)
    tx, ty = -np.sin(theta), np.cos(theta)
    tr = np.sqrt((Jxx - Jyy) ** 2 + 4 * Jxy ** 2)
    coh = np.clip(tr / (Jxx + Jyy + 1e-9), 0, 1)
    s = np.sign(tx * prefer[0] + ty * prefer[1])
    s[s == 0] = 1
    tx, ty = tx * s, ty * s
    w = np.clip(coh, coh_floor, 1) ** 0.7
    fx, fy = w * tx + (1 - w) * prefer[0], w * ty + (1 - w) * prefer[1]
    n = np.hypot(fx, fy) + 1e-9
    return fx / n, fy / n


def bilin(F, x, y):
    h, w = F.shape
    x = min(max(x, 0), w - 1.001)
    y = min(max(y, 0), h - 1.001)
    x0, y0 = int(x), int(y)
    fx, fy = x - x0, y - y0
    return (F[y0, x0] * (1 - fx) * (1 - fy) + F[y0, x0 + 1] * fx * (1 - fy) + F[y0 + 1, x0] * (1 - fx) * fy
            + F[y0 + 1, x0 + 1] * fx * fy)


def trace(x, y, FX, FY, L, step=1.5, keep=None, leak=3.0):
    """A streamline through (x, y) along the flow, both ways, L long; stops `leak` px after leaving `keep`."""
    h, w = FX.shape

    def run(sgn):
        pts, px, py, d0, out = [], x, y, None, 0.0
        for _ in range(int(L / 2 / step)):
            dx, dy = bilin(FX, px, py), bilin(FY, px, py)
            if d0 is None:
                dx, dy = dx * sgn, dy * sgn
            elif dx * d0[0] + dy * d0[1] < 0:
                dx, dy = -dx, -dy
            nx, ny = px + dx * step, py + dy * step
            if not (0 <= nx < w and 0 <= ny < h):
                break
            if keep is not None and not keep[int(ny), int(nx)]:
                out += step
                if out > leak:
                    break
            else:
                out = 0.0
            pts.append((nx, ny))
            px, py, d0 = nx, ny, (dx, dy)
        return pts
    return run(-1)[::-1] + [(x, y)] + run(1)


def resample(pts, ds):
    p = np.asarray(pts, np.float64)
    if len(p) < 2:
        return p
    seg = np.hypot(*np.diff(p, axis=0).T)
    s = np.concatenate([[0], np.cumsum(seg)])
    if s[-1] < ds:
        return p[[0, -1]]
    t = np.arange(0, s[-1] + 1e-6, ds)
    return np.stack([np.interp(t, s, p[:, 0]), np.interp(t, s, p[:, 1])], -1)


# ------------------------------------------------------------------------------------------- the strokes

class StrokePlan:
    """Marks by pass, each a MyPaint stroke: {brush, pts: [[x, y, p]], color, width, opacity, seed}. The pressure
    profile is a hand's: a quick attack, a hold, a lifted tail (a dry end)."""

    ATT = {'wash': 0.15, 'form': 0.12, 'accent': 0.2, 'blend': 0.3, 'edge': 0.15, 'dab': 0.35, 'lost': 0.25}

    def __init__(self, key):
        self.key = key
        self.rng = seeded(key, 'plan')
        self.strokes = []

    def pressure(self, n, kind, p_max=1.0):
        t = np.linspace(0, 1, n)
        att = self.ATT.get(kind, 0.15)
        tail = self.rng.uniform(0.45, 0.72)
        p = np.clip(t / att, 0, 1) ** 0.6 * (1 - 0.75 * np.clip((t - tail) / (1 - tail), 0, 1) ** 1.4)
        return np.clip(p * self.rng.uniform(0.85, 1.0) * p_max, 0.05, 1)

    def add(self, kind, brush, pts, col, width, op, p_max=1.0, speed=None, clip=None, lock=False, ds=None, flat_p=None):
        p = resample(pts, ds or max(1.0, width * 0.25))
        if len(p) < 2:
            return None
        pr = np.full(len(p), flat_p) if flat_p is not None else self.pressure(len(p), kind, p_max)
        s = {'kind': kind, 'brush': brush, 'pts': np.round(np.column_stack([p, pr]), 2).tolist(),
             'color': hexof(col), 'width': round(float(width), 2), 'opacity': round(float(op), 3),
             'seed': seed_int(self.key, len(self.strokes))}
        if speed:
            s['speed'] = speed
        if clip:
            s['clip'] = clip
        if lock:
            s['lock'] = True
        self.strokes.append(s)
        return s

    def count(self):
        out = {}
        for s in self.strokes:
            out[s['kind']] = out.get(s['kind'], 0) + 1
        return out


def mypaint(base_rgba, strokes, clips=None, tag='job', keep=False):
    """Lay `strokes` with MyPaint (mypaint_bake.mjs) over base_rgba (H x W x 4, 0..1, straight alpha). `clips`:
    {name: mask (H x W, 0..1)}. Returns (rgba, seconds)."""
    import time
    h, w = base_rgba.shape[:2]
    d = os.path.join(SCRATCH, 'jobs')
    os.makedirs(d, exist_ok=True)
    bp, op_, jp = (os.path.join(d, f'{tag}.{s}') for s in ('base.rgba', 'out.rgba', 'json'))
    np.clip(np.round(base_rgba * 255), 0, 255).astype(np.uint8).tofile(bp)
    cl = {}
    for name, m in (clips or {}).items():
        p = os.path.join(d, f'{tag}.clip_{name}.u8')
        np.clip(np.round(m * 255), 0, 255).astype(np.uint8).tofile(p)
        cl[name] = p
    json.dump({'size': [w, h], 'base': bp, 'out': op_, 'clips': cl, 'strokes': strokes}, open(jp, 'w'))
    t0 = time.time()
    r = subprocess.run(['node', os.path.join(HERE, 'mypaint_bake.mjs'), jp], capture_output=True, text=True)
    if r.returncode:
        raise RuntimeError(r.stderr[-2000:])
    sec = time.time() - t0
    out = np.fromfile(op_, np.uint8).reshape(h, w, 4).astype(np.float64) / 255.0
    return out, sec


# ------------------------------------------------------------------------------------ edges by the light

def outward_normal(mask, sigma=3.0):
    sm = ndi.gaussian_filter(mask.astype(np.float64), sigma)
    nx, ny = -ndi.sobel(sm, 1), -ndi.sobel(sm, 0)
    n = np.hypot(nx, ny) + 1e-9
    return nx / n, ny / n


def contour_param(mask):
    """For every pixel near the outline: the arc-length position of its nearest outline point (for noise ALONG the
    outline: lost and found stretches alternate)."""
    cs, _ = cv2.findContours(mask.astype(np.uint8), cv2.RETR_LIST, cv2.CHAIN_APPROX_NONE)
    canvas = np.full(mask.shape, -1.0, np.float32)
    base = 0.0
    for c in cs:
        c = c[:, 0, :]
        if len(c) < 8:
            continue
        seg = np.hypot(*np.diff(np.vstack([c, c[:1]]), axis=0).T)
        s = base + np.concatenate([[0], np.cumsum(seg)[:-1]])
        canvas[c[:, 1], c[:, 0]] = s
        base = s[-1] + 500.0
    has = canvas >= 0
    idx = ndi.distance_transform_edt(~has, return_distances=False, return_indices=True)
    return canvas[tuple(idx)]
