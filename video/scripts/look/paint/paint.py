#!/usr/bin/env python3
"""The engine's paint pass, the BAKE half (src/lib/paint is the placing half; the API, the method and the cost:
docs/studies/2026-10-28_city_posters/paint_test/NOTES.md). Owner, 2026-10-29: "I really like the “painted” pieces like
the sky and the clouds ... some foreground buildings and trees / greenery are uniquely painted"; playbook PAINTED PIECES.

    python3 scripts/look/paint/paint.py <spec.json> [--only id,id] [--preview dir]

Each piece of the spec is painted stroke by stroke into ONE RGBA PNG (public/<out>/<name>.png) and listed with its box in
<out>/manifest.json (lib/paint paintSet reads it). Deterministic: the same spec and seed give the same pixels; a new seed
is a new painting of the same shapes (each piece painted for its place, never one stamp repeated).

A piece starts from its FLAT shapes (`flat`: the piece rendered alone on a transparent frame by the film's bake
composition, lib/paint/bake.tsx) or, for a cloud, from `lobes` alone. The painter keeps the flat's silhouette and its
colours (the tier's, the light rig's shade steps) and adds what the references show:
  - colour moving within the shape: a lit side warmer and lighter, a shade side cooler (the scene's key `light`), and a
    slow drift of hue and value through it;
  - visible brush strokes (bristle stamps, several sizes, along a flow per style), with dry-brush streaks and broken ends;
  - soft, broken painted edges (a ragged base wash, strokes running a little past the edge);
  - a few specks (spatter, grit, leaf lights) and a fine paper-and-paint grain, locked to the piece.
Styles: sky (long, low-contrast horizontal strokes over the flat gradient; calm in the caption band), cloud (strokes round
the billows, a lit rim glowing on the light's side, a soft base that dissolves above the caption band), foliage (leaf dabs
in clusters, lit and shade sides), surface (a built face: strokes along `angle`, straight edges barely broken).
"""
from __future__ import annotations

import argparse
import json
import math
import os
import sys
import time

import cv2
import numpy as np
from PIL import Image
from scipy import ndimage

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))  # video/

# ------------------------------------------------------------------ colour (OKLab, as lib/sky)

def srgb_to_lin(c):
    return np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)


def lin_to_srgb(c):
    c = np.clip(c, 0, 1)
    return np.where(c <= 0.0031308, 12.92 * c, 1.055 * np.power(c, 1 / 2.4) - 0.055)


_M1 = np.array([[0.4122214708, 0.5363325363, 0.0514459929], [0.2119034982, 0.6806995451, 0.1073969566], [0.0883024619, 0.2817188376, 0.6299787005]])
_M2 = np.array([[0.2104542553, 0.7936177850, -0.0040720468], [1.9779984951, -2.4285922050, 0.4505937099], [0.0259040371, 0.7827717662, -0.8086757660]])
_M2i = np.linalg.inv(_M2)
_M1i = np.linalg.inv(_M1)


def rgb_to_lab(rgb):
    return np.cbrt(srgb_to_lin(rgb) @ _M1.T) @ _M2.T


def lab_to_rgb(lab):
    return lin_to_srgb(((lab @ _M2i.T) ** 3) @ _M1i.T)


def hex_rgb(h):
    h = h.lstrip('#')
    return np.array([int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)])


def hex_lab(h):
    return rgb_to_lab(hex_rgb(h)[None, :])[0]

# ------------------------------------------------------------------ noise (seeded)

def value_noise(rng, h, w, cell_y, cell_x):
    """Smooth noise in [0, 1]: a random grid of cell size (cell_y, cell_x) px, bicubic up."""
    gh = int(math.ceil(h / cell_y)) + 3
    gw = int(math.ceil(w / cell_x)) + 3
    g = rng.random((gh, gw)).astype(np.float32)
    up = cv2.resize(g, (int(gw * cell_x), int(gh * cell_y)), interpolation=cv2.INTER_CUBIC)
    oy = int(rng.integers(0, max(1, int(cell_y))))
    ox = int(rng.integers(0, max(1, int(cell_x))))
    return np.clip(up[oy:oy + h, ox:ox + w], 0, 1)


def fbm(rng, h, w, cell, octaves=4, aniso=1.0):
    """Fractal noise, zero mean, ~unit range: octaves from `cell` px down; aniso > 1 stretches it along x."""
    out = np.zeros((h, w), np.float32)
    amp, tot = 1.0, 0.0
    c = float(cell)
    for _ in range(octaves):
        out += amp * (value_noise(rng, h, w, max(2.0, c), max(2.0, c * aniso)) - 0.5)
        tot += amp
        amp *= 0.5
        c /= 2.0
    return out / tot * 2.0

# ------------------------------------------------------------------ brushes

def make_stamps(rng, n=20, L=192, W=48, bent=True):
    """Bristle stamps (alpha, W x L): bristles across, a quick start, a broken taper, dry streaks along; some bent."""
    stamps = []
    v = np.linspace(-1, 1, W)
    u = np.linspace(0, 1, L)
    for i in range(n):
        prof = np.zeros(W, np.float32)
        for _ in range(int(rng.integers(7, 16))):
            c = rng.uniform(-0.8, 0.8)
            s = rng.uniform(0.05, 0.16)
            prof += rng.uniform(0.45, 1.0) * np.exp(-0.5 * ((v - c) / s) ** 2)
        prof = np.clip(prof / prof.max() * 1.35, 0, 1) * np.clip((1 - np.abs(v)) * 3.5, 0, 1)
        start = np.clip(u / rng.uniform(0.03, 0.10), 0, 1) ** 0.7
        end = np.clip((1 - u) / rng.uniform(0.12, 0.35), 0, 1) ** 0.8
        A = prof[:, None] * (start * end)[None, :]
        # dry streaks: long along the stroke, fine across; drier toward the end (the paint running out)
        streak = value_noise(rng, W, L, 1.6, L / rng.uniform(3, 7))
        dry = rng.uniform(0.15, 0.5)
        thr = dry * (0.35 + 0.9 * u[None, :] ** 1.5)
        A = A * np.clip((streak - thr) / 0.12 + 0.5, 0, 1)
        A = np.clip(A, 0, 1).astype(np.float32)
        if bent and i % 2 == 1:
            k = rng.uniform(-0.35, 0.35) * W
            mx, my = np.meshgrid(np.arange(L, dtype=np.float32), np.arange(W, dtype=np.float32))
            off = (k * (2 * (mx / L) - 1) ** 2 - k * 0.5).astype(np.float32)
            A = cv2.remap(A, mx, my + off, cv2.INTER_LINEAR, borderMode=cv2.BORDER_CONSTANT, borderValue=0)
        stamps.append(A)
    return stamps


def make_dabs(rng, n=16, S=64):
    """Leaf dabs (alpha, S x S): a pointed oval with a bristle texture and a ragged rim."""
    dabs = []
    yy, xx = np.mgrid[0:S, 0:S].astype(np.float32)
    xx = (xx - S / 2) / (S / 2)
    yy = (yy - S / 2) / (S / 2)
    for _ in range(n):
        ax = rng.uniform(0.75, 0.95)
        ay = rng.uniform(0.38, 0.6)
        # a leaf: an oval pinched at both ends
        r = (xx / ax) ** 2 + (yy / (ay * (1 - 0.55 * np.abs(xx / ax) ** 1.6 + 0.05))) ** 2
        rim = value_noise(rng, S, S, 6, 6) - 0.5
        A = np.clip((1.0 - r + 0.35 * rim) / 0.25, 0, 1)
        tex = value_noise(rng, S, S, 1.5, 9)
        A = A * np.clip(0.55 + 0.6 * tex, 0, 1)
        dabs.append(np.clip(A, 0, 1).astype(np.float32))
    return dabs


class Canvas:
    """A premultiplied RGBA canvas (float32) the strokes are composited onto, 'over'."""

    def __init__(self, h, w):
        self.h, self.w = h, w
        self.pm = np.zeros((h, w, 3), np.float32)
        self.a = np.zeros((h, w), np.float32)

    def wash(self, rgb, alpha):
        a = alpha.astype(np.float32)
        self.pm = self.pm * (1 - a[..., None]) + rgb.astype(np.float32) * a[..., None]
        self.a = self.a * (1 - a) + a

    def stamp(self, st, cx, cy, ang, length, width, color, opacity, clip=None):
        sh, sw = st.shape
        sx, sy = length / sw, width / sh
        ca, sa = math.cos(ang), math.sin(ang)
        M = np.array([[ca * sx, -sa * sy, 0.0], [sa * sx, ca * sy, 0.0]], np.float64)
        M[0, 2] = cx - (M[0, 0] * sw / 2 + M[0, 1] * sh / 2)
        M[1, 2] = cy - (M[1, 0] * sw / 2 + M[1, 1] * sh / 2)
        cs = M @ np.array([[0, sw, sw, 0], [0, 0, sh, sh], [1, 1, 1, 1]], np.float64)
        x0 = max(0, int(math.floor(cs[0].min())) - 1)
        x1 = min(self.w, int(math.ceil(cs[0].max())) + 2)
        y0 = max(0, int(math.floor(cs[1].min())) - 1)
        y1 = min(self.h, int(math.ceil(cs[1].max())) + 2)
        if x1 <= x0 or y1 <= y0:
            return
        Ml = M.copy()
        Ml[0, 2] -= x0
        Ml[1, 2] -= y0
        patch = cv2.warpAffine(st, Ml, (x1 - x0, y1 - y0), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_CONSTANT, borderValue=0)
        a = patch * opacity
        if clip is not None:
            a = a * clip[y0:y1, x0:x1]
        pm = self.pm[y0:y1, x0:x1]
        pm *= (1 - a[..., None])
        pm += a[..., None] * np.asarray(color, np.float32)
        al = self.a[y0:y1, x0:x1]
        al *= (1 - a)
        al += a

    def rgba(self):
        a = np.clip(self.a, 0, 1)
        rgb = np.where(a[..., None] > 1e-4, self.pm / np.maximum(a[..., None], 1e-4), 0)
        return np.clip(rgb, 0, 1), a

# ------------------------------------------------------------------ helpers

def load_flat(path):
    im = Image.open(path).convert('RGBA')
    a = np.asarray(im).astype(np.float32) / 255
    return a[..., :3], a[..., 3]


def fill_out(rgb, mask):
    """Each outside pixel takes its nearest inside colour (so edge strokes sample the piece, never the void)."""
    inside = mask > 0.5
    if inside.all():
        return rgb
    _, (iy, ix) = ndimage.distance_transform_edt(~inside, return_indices=True)
    return rgb[iy, ix]


def form_light(mask, sigma, light):
    """A soft form from the silhouette: blur it into a height, light it from `light` (screen dir, toward the light);
    -1 shade .. +1 lit."""
    hgt = cv2.GaussianBlur(mask.astype(np.float32), (0, 0), sigma)
    gy, gx = np.gradient(hgt)
    nz = np.full_like(hgt, 1.0 / max(1.0, sigma) * 2.2)
    n = np.stack([-gx, -gy, nz], -1)
    n /= np.linalg.norm(n, axis=-1, keepdims=True) + 1e-8
    L = np.array([light[0], light[1], 0.55], np.float32)
    L /= np.linalg.norm(L)
    return np.clip((n @ L - 0.55) / 0.45, -1, 1), hgt


def shift(lab, dL=0.0, da=0.0, db=0.0):
    out = lab.copy()
    out[..., 0] += dL
    out[..., 1] += da
    out[..., 2] += db
    return out


def soft_edge_mask(rng, mask, ragged, soft, cell):
    """The base wash's alpha: the silhouette with a ragged, soft painted edge (noise-displaced distance)."""
    inside = mask > 0.5
    d_in = ndimage.distance_transform_edt(inside)
    d_out = ndimage.distance_transform_edt(~inside)
    sd = d_in - d_out  # + inside
    n = fbm(rng, *mask.shape, cell, 3)
    return np.clip((sd + ragged * n + soft * 0.5) / max(1e-3, soft), 0, 1).astype(np.float32)


def band_calm(h, y0, band, ramp=40):
    """1 outside the caption band, 0 inside (smooth `ramp` px), in the piece's rows (y0 = its top in frame px)."""
    if not band:
        return np.ones(h, np.float32)
    y = np.arange(h, dtype=np.float32) + y0
    a, b = band
    inside = np.clip((y - a) / ramp, 0, 1) * np.clip((b - y) / ramp, 0, 1)
    return (1 - inside).astype(np.float32)

# ------------------------------------------------------------------ the strokes

def paint_passes(cv, rng, target, where, passes, flow, clip=None, calm=None, jitter=(0.012, 0.006, 0.008), stamps=None, dabs=None):
    """Hertzmann-style passes, big brush to small: each pass lays strokes on a jittered grid inside `where`, each
    sampling the target colour (OKLab) at its centre plus a jitter, oriented by `flow` (radians) per pixel.
    pass = dict(r=brush width px, len=(lo, hi) x r, op=(lo, hi), keep=fraction of grid cells, err=refine threshold,
    dab=True for leaf dabs)."""
    H, W = where.shape
    target_rgb = lab_to_rgb(target).astype(np.float32)
    n_total = 0
    for p in passes:
        r = p['r']
        step = max(2.0, r * p.get('spacing', 0.9))
        ys = np.arange(step / 2, H, step)
        xs = np.arange(step / 2, W, step)
        gy, gx = np.meshgrid(ys, xs, indexing='ij')
        gy = (gy + rng.uniform(-0.5, 0.5, gy.shape) * step).ravel()
        gx = (gx + rng.uniform(-0.5, 0.5, gx.shape) * step).ravel()
        order = rng.permutation(len(gx))
        gx, gy = gx[order], gy[order]
        keep = p.get('keep', 1.0)
        err_thr = p.get('err')
        if err_thr is not None:
            rgb_now, a_now = cv.rgba()
            err = np.abs(rgb_now - target_rgb).sum(-1) + (1 - a_now)
        for x, y in zip(gx, gy):
            xi, yi = int(min(W - 1, max(0, x))), int(min(H - 1, max(0, y)))
            if where[yi, xi] < 0.5:
                continue
            if keep < 1.0 and rng.random() > keep:
                continue
            if err_thr is not None and err[yi, xi] < err_thr and rng.random() > p.get('alive', 0.25):
                continue
            k = 1.0 if calm is None else float(calm[yi, xi])
            lab = target[yi, xi].copy()
            jl, ja, jb = jitter
            lab[0] += rng.normal(0, jl) * k * p.get('jit', 1.0)
            lab[1] += rng.normal(0, ja) * k * p.get('jit', 1.0)
            lab[2] += rng.normal(0, jb) * k * p.get('jit', 1.0)
            col = lab_to_rgb(lab[None, :])[0]
            ang = float(flow[yi, xi]) + rng.normal(0, p.get('angj', 0.12))
            op = rng.uniform(*p.get('op', (0.6, 0.9))) * (p.get('calm_op', 1.0) if k < 0.5 else 1.0)
            if p.get('dab'):
                st = dabs[int(rng.integers(len(dabs)))]
                size = r * rng.uniform(0.8, 1.3)
                cv.stamp(st, x, y, ang, size * rng.uniform(1.4, 2.0), size, col, op, clip)
            else:
                st = stamps[int(rng.integers(len(stamps)))]
                length = r * rng.uniform(*p.get('len', (2.5, 5.0)))
                width = r * rng.uniform(0.85, 1.25)
                cv.stamp(st, x, y, ang, length, width, col, op, clip)
            n_total += 1
    return n_total


def speckle(cv, rng, where, n, rmin, rmax, colors, op=(0.5, 0.9)):
    """Specks: small soft dots (spatter, grit, leaf lights) at points of `where` (a probability map)."""
    H, W = where.shape
    idx = np.flatnonzero(where.ravel() > rng.random(where.size) * 1.0)
    if len(idx) == 0:
        return 0
    pick = rng.choice(idx, size=min(n, len(idx)), replace=False)
    S = 16
    yy, xx = np.mgrid[0:S, 0:S].astype(np.float32)
    dot = np.clip(1.0 - (((xx - S / 2 + 0.5) ** 2 + (yy - S / 2 + 0.5) ** 2) / (S / 2) ** 2), 0, 1) ** 0.6
    for i in pick:
        y, x = divmod(int(i), W)
        rr = rng.uniform(rmin, rmax)
        c = colors[int(rng.integers(len(colors)))]
        cv.stamp(dot, x + rng.random(), y + rng.random(), 0.0, rr * 2, rr * 2 * rng.uniform(0.7, 1.0), c, rng.uniform(*op))
    return len(pick)


def grain(rng, h, w, amp):
    """A fine paper-and-paint grain (multiplicative, ~1 +- amp), static, locked to the piece."""
    g = fbm(rng, h, w, 3.0, 2) * 0.6 + (rng.random((h, w)).astype(np.float32) - 0.5) * 0.8
    return 1.0 + amp * g

# ------------------------------------------------------------------ styles

def style_sky(piece, spec, rng, stamps):
    rgb, mask = load_flat(os.path.join(ROOT, piece['flat']))
    x0, y0, x1, y1 = piece.get('crop', [0, 0, rgb.shape[1], rgb.shape[0]])
    rgb = rgb[y0:y1, x0:x1]
    H, W = rgb.shape[:2]
    lab = rgb_to_lab(rgb)
    calm = band_calm(H, y0, spec.get('band'), 46)[:, None] * np.ones((1, W), np.float32)
    # a gentle paint-like variation in its tone: long horizontal drifts of value and warmth, calm in the band
    n1 = fbm(rng, H, W, 180, 3, aniso=3.5)
    n2 = fbm(rng, H, W, 120, 3, aniso=4.0)
    k = 0.25 + 0.75 * calm
    tgt = shift(lab, dL=0.010 * n1 * k, da=0.004 * n2 * k, db=0.006 * n2 * k)
    cv = Canvas(H, W)
    cv.wash(lab_to_rgb(tgt), np.ones((H, W), np.float32))
    flow = np.full((H, W), piece.get('angle', -0.035), np.float32) + 0.10 * fbm(rng, H, W, 260, 2)
    where = np.ones((H, W), np.float32)
    passes = [
        dict(r=58, len=(5, 9), op=(0.30, 0.55), spacing=1.1, jit=1.0, angj=0.05, calm_op=0.6),
        dict(r=30, len=(5, 10), op=(0.30, 0.55), spacing=1.0, jit=0.9, angj=0.05, calm_op=0.6),
        dict(r=14, len=(5, 11), op=(0.25, 0.5), spacing=1.0, keep=0.55, jit=0.8, angj=0.06, calm_op=0.5),
    ]
    n = paint_passes(cv, rng, tgt, where, passes, flow, calm=calm, jitter=(0.008, 0.003, 0.005), stamps=stamps)
    out, a = cv.rgba()
    g = grain(rng, H, W, 0.010)[..., None] * (0.35 + 0.65 * calm[..., None]) + (1 - (0.35 + 0.65 * calm[..., None]))
    return out * g, np.ones((H, W), np.float32), (x0, y0), n


def lobe_mask(lobes, box, rng, ragged, cell):
    """A cloud's silhouette and height from lobes [x, y, r] (frame px), in its box."""
    bx, by, bw, bh = box
    yy, xx = np.mgrid[0:bh, 0:bw].astype(np.float32)
    xx += bx
    yy += by
    hgt = np.zeros((bh, bw), np.float32)
    for (cx, cy, r) in lobes:
        d2 = ((xx - cx) ** 2 + (yy - cy) ** 2) / (r * r)
        hgt = np.maximum(hgt, np.sqrt(np.clip(1 - d2, 0, 1)) * (r / 100.0) ** 0.5)
    return hgt


def style_cloud(piece, spec, rng, stamps):
    bx, by, bw, bh = piece['box']
    lobes = piece['lobes']
    hgt = lobe_mask(lobes, piece['box'], rng, 0, 0)
    # the edge: the lobes' union, noise-displaced (soft, broken), the base flattened and dissolving
    n_edge = fbm(rng, bh, bw, piece.get('edge_cell', 46), 4)
    sil = np.clip((hgt - 0.10 + 0.16 * n_edge) / 0.10, 0, 1)
    base_y = piece.get('base_y')
    rows = (np.arange(bh, dtype=np.float32) + by)[:, None]
    if base_y is not None:
        soft = piece.get('base_soft', 60)
        sil *= np.clip((base_y - rows + 18 * n_edge) / soft, 0, 1)
    calm = band_calm(bh, by, spec.get('band'), 30)[:, None] * np.ones((1, bw), np.float32)
    # the form: each lobe a soft dome, lit from the key's side (the low sun): lit rim warm cream-gold, shade cool lilac
    light = piece.get('light', spec['light']['dir'])
    gy, gx = np.gradient(cv2.GaussianBlur(hgt, (0, 0), 6))
    n = np.stack([-gx * 26, -gy * 26, np.full_like(hgt, 1.0)], -1)
    n /= np.linalg.norm(n, axis=-1, keepdims=True)
    L = np.array([light[0], light[1], 0.35], np.float32)
    L /= np.linalg.norm(L)
    lit = np.clip(n @ L, 0, 1)
    # the big-form gradient across the whole cloud: toward the light lighter and warmer
    cx = np.mean([l[0] for l in lobes])
    cy = np.mean([l[1] for l in lobes])
    yy, xx = np.mgrid[0:bh, 0:bw].astype(np.float32)
    span = max(bw, bh) * 0.6
    big = np.clip(((xx + bx - cx) * light[0] + (yy + by - cy) * light[1]) / span, -1, 1)
    pal = piece['palette']
    shade_lab, mid_lab, lit_lab, rim_lab = (hex_lab(pal[k]) for k in ('shade', 'mid', 'lit', 'rim'))
    t = np.clip(0.42 * lit + 0.38 * (big * 0.5 + 0.5) + 0.12 * fbm(rng, bh, bw, 90, 3), 0, 1)[..., None]
    tgt = np.where(t < 0.5, shade_lab + (mid_lab - shade_lab) * (t / 0.5), mid_lab + (lit_lab - mid_lab) * ((t - 0.5) / 0.5))
    # the glowing rim: where the silhouette edge faces the light
    e_in = ndimage.distance_transform_edt(sil > 0.5)
    facing = np.clip(lit * 1.4 - 0.3, 0, 1) * np.clip(big * 0.8 + 0.6, 0, 1)
    rim = (np.clip(1 - e_in / piece.get('rim_px', 26), 0, 1) * facing)[..., None]
    tgt = tgt + (rim_lab - tgt) * rim * 0.85
    # inside the band: one calm value (the sky's band stays a calm field under the captions)
    if spec.get('band'):
        calmv = calm[..., None]
        tgt = tgt * (0.4 + 0.6 * calmv) + mid_lab * (0.6 - 0.6 * calmv)
    cv = Canvas(bh, bw)
    wash_a = np.clip((sil - 0.35) / 0.4, 0, 1) * 0.92
    cv.wash(lab_to_rgb(cv2.GaussianBlur(tgt.astype(np.float32), (0, 0), 3)), wash_a)
    # strokes curl round the billows (along the height's contours), drifting a little with the wind
    hb = cv2.GaussianBlur(hgt, (0, 0), 12)
    gy2, gx2 = np.gradient(hb)
    flow = np.arctan2(gy2, gx2) + math.pi / 2 + 0.25 * fbm(rng, bh, bw, 140, 2)
    flat_flow = np.full_like(flow, piece.get('wind', -0.12))
    mag = np.clip(np.hypot(gx2, gy2) * 160, 0, 1)
    flow = np.where(mag > 0.15, flow, flat_flow).astype(np.float32)
    where = (sil > 0.25).astype(np.float32)
    clip = np.clip(cv2.GaussianBlur(sil, (0, 0), 3) * 1.6, 0, 1).astype(np.float32)
    s = piece.get('scale', 1.0)
    passes = [
        dict(r=34 * s, len=(2.5, 4.5), op=(0.45, 0.75), spacing=0.9, angj=0.25),
        dict(r=18 * s, len=(2.5, 5.0), op=(0.45, 0.8), spacing=0.85, angj=0.25),
        dict(r=9 * s, len=(2.5, 5.0), op=(0.5, 0.85), spacing=0.9, err=0.05, alive=0.35, angj=0.3),
        dict(r=5 * s, len=(2.0, 4.0), op=(0.5, 0.9), spacing=0.9, keep=0.6, err=0.06, alive=0.2, angj=0.3),
    ]
    nst = paint_passes(cv, rng, tgt, where, passes, flow, clip=clip, calm=calm, jitter=(0.012, 0.006, 0.008), stamps=stamps)
    # spatter: light specks just outside the lit edge, a few inside (the reference's floating paint flecks)
    e_out = ndimage.distance_transform_edt(sil < 0.5)
    ring = (np.clip(1 - np.abs(e_out - 14) / 12, 0, 1) * facing * calm).astype(np.float32) * 0.04
    speck_cols = [lab_to_rgb(rim_lab[None])[0], lab_to_rgb(lit_lab[None])[0]]
    nsp = speckle(cv, rng, ring, piece.get('specks', 90), 0.8, 2.6, speck_cols, (0.5, 0.95))
    inner = (sil > 0.6).astype(np.float32) * 0.004 * calm
    nsp += speckle(cv, rng, inner, piece.get('specks', 90) // 2, 0.8, 2.0, speck_cols + [lab_to_rgb(shade_lab[None])[0]], (0.35, 0.7))
    out, a = cv.rgba()
    out = out * grain(rng, bh, bw, 0.012)[..., None]
    a = a * calm ** 0  # the band calm is in the colour; the base dissolves by `base_y`
    return out, a, (bx, by), nst + nsp


def style_flat_piece(piece, spec, rng, stamps, dabs):
    """foliage and surface: a piece painted from its flat render."""
    rgb, mask = load_flat(os.path.join(ROOT, piece['flat']))
    ys, xs = np.nonzero(mask > 0.02)
    m = piece.get('margin', 18)
    x0, x1 = max(0, xs.min() - m), min(mask.shape[1], xs.max() + m + 1)
    y0, y1 = max(0, ys.min() - m), min(mask.shape[0], ys.max() + m + 1)
    rgb, mask = rgb[y0:y1, x0:x1], mask[y0:y1, x0:x1]
    H, W = mask.shape
    rgb = fill_out(rgb, mask)
    lab = rgb_to_lab(rgb)
    light = piece.get('light', spec['light']['dir'])
    style = piece['style']
    foliage = style == 'foliage'
    lit, hgt = form_light(mask, piece.get('form_sigma', 26 if foliage else 60), light)
    # colour moving within the shape: lit side lighter and warmer, shade side deeper and cooler, a slow drift through it
    warm = piece.get('warm', [0.035, 0.004, 0.022])  # dL, da, db toward the light
    cool = piece.get('cool', [-0.045, -0.006, -0.018])
    w_l = np.clip(lit, 0, 1)[..., None]
    w_s = np.clip(-lit, 0, 1)[..., None]
    tgt = lab + w_l * np.array(warm) + w_s * np.array(cool)
    drift = piece.get('drift', [0.018, 0.006, 0.010])
    nA = fbm(rng, H, W, piece.get('drift_cell', 70), 3)
    nB = fbm(rng, H, W, piece.get('drift_cell', 70) * 1.3, 3)
    tgt = shift(tgt, dL=drift[0] * nA, da=drift[1] * nB, db=drift[2] * nB)
    cv = Canvas(H, W)
    ragged = piece.get('ragged', 7 if foliage else 2.2)
    soft = piece.get('soft', 3.0 if foliage else 1.6)
    wash_a = soft_edge_mask(rng, mask, ragged, soft, piece.get('edge_cell', 14 if foliage else 30))
    # the outer edge where the frame cuts the piece stays whole (no ragged edge at the frame's edge)
    wash_a = keep_frame_edges(wash_a, mask, (x0, y0, x1, y1), spec['frame'])
    cv.wash(lab_to_rgb(cv2.GaussianBlur(tgt.astype(np.float32), (0, 0), 2.0)), wash_a)
    where = (mask > 0.5).astype(np.float32)
    clip_r = piece.get('overshoot', 6 if foliage else 1.5)
    clip = soft_edge_mask(rng, mask, ragged * 0.8, soft + clip_r, piece.get('edge_cell', 14 if foliage else 30))
    clip = keep_frame_edges(clip, mask, (x0, y0, x1, y1), spec['frame'])
    if foliage:
        # leaves: dabs drooping a little, clustered (a cluster noise thins the small dabs between clusters)
        flow = (-0.35 + 0.9 * fbm(rng, H, W, 40, 2)).astype(np.float32)
        passes = [
            dict(r=16, len=(2.0, 3.2), op=(0.6, 0.85), spacing=0.9, angj=0.5),
            dict(r=11, dab=True, op=(0.7, 0.95), spacing=0.75, angj=0.6),
            dict(r=7.5, dab=True, op=(0.7, 0.95), spacing=0.7, err=0.04, alive=0.55, angj=0.7),
            dict(r=5, dab=True, op=(0.7, 1.0), spacing=0.75, keep=0.7, err=0.05, alive=0.35, angj=0.8),
        ]
        jit = piece.get('jitter', (0.022, 0.008, 0.012))
    else:
        ang = math.radians(piece.get('angle', 90))
        flow = (ang + 0.08 * fbm(rng, H, W, 80, 2)).astype(np.float32)
        passes = [
            dict(r=20, len=(3.0, 6.0), op=(0.35, 0.6), spacing=1.0, angj=0.06),
            dict(r=11, len=(3.0, 7.0), op=(0.35, 0.6), spacing=0.95, angj=0.07),
            dict(r=6, len=(3.0, 7.0), op=(0.4, 0.7), spacing=1.0, err=0.035, alive=0.3, angj=0.08),
        ]
        jit = piece.get('jitter', (0.014, 0.004, 0.007))
    nst = paint_passes(cv, rng, tgt, where, passes, flow, clip=clip, jitter=jit, stamps=stamps, dabs=dabs)
    nsp = 0
    if foliage:
        # leaf lights on the lit side, a few deep specks in the shade
        lit_c = [lab_to_rgb((lab_mean(tgt, mask) + np.array([0.09, -0.01, 0.045]))[None])[0]]
        nsp += speckle(cv, rng, (np.clip(lit, 0, 1) * where * 0.03).astype(np.float32), piece.get('specks', 70), 0.8, 2.2, lit_c, (0.6, 0.95))
    else:
        grit_l = lab_to_rgb((lab_mean(tgt, mask) + np.array([0.05, 0.0, 0.01]))[None])[0]
        grit_d = lab_to_rgb((lab_mean(tgt, mask) + np.array([-0.07, 0.004, -0.004]))[None])[0]
        nsp += speckle(cv, rng, (where * 0.006).astype(np.float32), piece.get('specks', 120), 0.6, 1.6, [grit_l, grit_d], (0.35, 0.7))
    out, a = cv.rgba()
    out = out * grain(rng, H, W, piece.get('grain', 0.014))[..., None]
    return out, a, (x0, y0), nst + nsp


def lab_mean(lab, mask):
    w = (mask > 0.5)
    return lab[w].mean(0)


def keep_frame_edges(alpha, mask, crop, frame):
    """Where the piece runs off the frame, the paint stays solid to the frame's edge (a ragged edge there would show the
    paper behind it in the float)."""
    x0, y0, x1, y1 = crop
    fw, fh = frame
    H, W = alpha.shape
    out = alpha.copy()
    inside = (mask > 0.5).astype(np.float32)
    band = 24
    if x1 >= fw:
        out[:, W - band:] = np.maximum(out[:, W - band:], inside[:, W - band:])
    if y1 >= fh:
        out[H - band:, :] = np.maximum(out[H - band:, :], inside[H - band:, :])
    if x0 <= 0:
        out[:, :band] = np.maximum(out[:, :band], inside[:, :band])
    if y0 <= 0:
        out[:band, :] = np.maximum(out[:band, :], inside[:band, :])
    return out

# ------------------------------------------------------------------ main

def paint_piece(piece, spec, preview=None):
    seed = int(piece['seed'])
    rng = np.random.default_rng(seed)
    stamps = make_stamps(np.random.default_rng(seed * 7 + 1))
    dabs = make_dabs(np.random.default_rng(seed * 7 + 2))
    st = piece['style']
    t0 = time.time()
    if st == 'sky':
        out, a, (x0, y0), n = style_sky(piece, spec, rng, stamps)
    elif st == 'cloud':
        out, a, (x0, y0), n = style_cloud(piece, spec, rng, stamps)
    elif st in ('foliage', 'surface'):
        out, a, (x0, y0), n = style_flat_piece(piece, spec, rng, stamps, dabs)
    else:
        raise SystemExit(f'unknown style {st}')
    H, W = a.shape
    # 8-bit with a blue-ish dither (the strokes already break any banding; this keeps the sky's ramp smooth)
    dith = (rng.random((H, W, 1)) - 0.5) / 255
    rgba = np.concatenate([np.clip(out + dith, 0, 1), a[..., None]], -1)
    img = Image.fromarray((rgba * 255 + 0.5).astype(np.uint8), 'RGBA')
    name = piece['id'].split('/')[-1]
    rel = os.path.join(spec['out'], f'{name}.png')
    img.save(os.path.join(ROOT, rel), optimize=True)
    src = os.path.relpath(rel, 'public') if rel.startswith('public/') else rel
    row = {'id': piece['id'], 'src': src, 'box': [int(x0), int(y0), int(W), int(H)], 'style': st, 'seed': seed}
    print(f"{piece['id']:16s} {st:8s} seed {seed:4d}  box {row['box']}  {n:6d} strokes  {time.time() - t0:5.1f}s")
    return row


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('spec')
    ap.add_argument('--only', default='')
    args = ap.parse_args()
    spec = json.load(open(args.spec))
    os.makedirs(os.path.join(ROOT, spec['out']), exist_ok=True)
    man_path = os.path.join(ROOT, spec['out'], 'manifest.json')
    old = {}
    if os.path.exists(man_path):
        for r in json.load(open(man_path)).get('pieces', []):
            old[r['id']] = r
    only = [s for s in args.only.split(',') if s]
    rows = dict(old)
    for piece in spec['pieces']:
        name = piece['id'].split('/')[-1]
        if only and piece['id'] not in only and name not in only:
            continue
        rows[piece['id']] = paint_piece(piece, spec)
    order = [p['id'] for p in spec['pieces']]
    man = {'film': spec['film'], 'spec': os.path.relpath(os.path.abspath(args.spec), ROOT), 'pieces': [rows[i] for i in order if i in rows]}
    with open(man_path, 'w') as f:
        json.dump(man, f, indent=1)
        f.write('\n')


if __name__ == '__main__':
    main()
