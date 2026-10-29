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

DRY: dict = {}  # the current piece's dry-brush stamps (paint_piece)
DESIGN = False  # --design: write the flat designed shapes instead of their painting (style 'designed', designed skies)
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

def make_stamps(rng, n=20, L=192, W=48, bent=True, dry_range=(0.15, 0.5)):
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
        dry = rng.uniform(*dry_range)
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
        A = A * np.clip(0.78 + 0.32 * tex, 0, 1)
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

    def stamp(self, st, cx, cy, ang, length, width, color, opacity, clip=None, ref=None, tau=0.0):
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
        if ref is not None and tau > 0:
            # Hertzmann's rule, kept soft: a stroke stays inside its own flat region (the flat's colour at its centre)
            ci, cj = int(min(self.h - 1, max(0, cy))), int(min(self.w - 1, max(0, cx)))
            diff = np.abs(ref[y0:y1, x0:x1] - ref[ci, cj]).sum(-1)
            a = a * np.clip(1.5 - diff / tau, 0, 1)
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

def paint_passes(cv, rng, target, where, passes, flow, clip=None, calm=None, jitter=(0.012, 0.006, 0.008), stamps=None, dabs=None, ref=None, tau=0.0, dry_stamps=None, edge_d=None):
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
            if p.get('edge') is not None and edge_d is not None and edge_d[yi, xi] > p['edge']:
                continue
            if keep < 1.0 and rng.random() > keep:
                continue
            if err_thr is not None and err[yi, xi] < err_thr and rng.random() > p.get('alive', 0.25):
                continue
            k = 1.0 if calm is None else float(calm[yi, xi])
            lab = target[yi, xi].copy() + np.asarray(p.get('shift', (0.0, 0.0, 0.0)))
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
                cv.stamp(st, x, y, ang, size * rng.uniform(1.3, 1.8), size, col, op, clip, ref, p.get('tau', tau))
            else:
                pool = dry_stamps if (p.get('dry') and dry_stamps) else stamps
                st = pool[int(rng.integers(len(pool)))]
                length = r * rng.uniform(*p.get('len', (2.5, 5.0)))
                width = r * rng.uniform(0.85, 1.25)
                cv.stamp(st, x, y, ang, length, width, col, op, clip, ref, p.get('tau', tau))
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
    dr = piece.get('drift', [0.010, 0.004, 0.006])
    tgt = shift(lab, dL=dr[0] * n1 * k, da=dr[1] * n2 * k, db=dr[2] * n2 * k)
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    yy += y0
    xx += x0
    if piece.get('sun_warm'):
        sw = piece['sun_warm']
        dsun = np.hypot((xx - sw['xy'][0]) / 1.25, yy - sw['xy'][1])
        w = (np.clip(1 - dsun / sw['r'], 0, 1) ** 1.4 * (0.3 + 0.7 * calm))[..., None]
        tgt = tgt + w * np.array(sw['d'])
    if piece.get('top_cool'):
        tc = piece['top_cool']
        w = (np.clip(1 - yy / tc['y1'], 0, 1) ** 1.2 * (0.6 + 0.4 * (xx / W)))[..., None]
        tgt = tgt + w * np.array(tc['d'])
    cv = Canvas(H, W)
    cv.wash(lab_to_rgb(tgt), np.ones((H, W), np.float32))
    flow = np.full((H, W), piece.get('angle', -0.035), np.float32) + 0.10 * fbm(rng, H, W, 260, 2)
    where = np.ones((H, W), np.float32)
    passes = piece.get('passes') or [
        dict(r=58, len=(5, 9), op=(0.30, 0.55), spacing=1.1, jit=1.0, angj=0.05, calm_op=0.6),
        dict(r=30, len=(5, 10), op=(0.30, 0.55), spacing=1.0, jit=0.9, angj=0.05, calm_op=0.6),
        dict(r=14, len=(5, 11), op=(0.25, 0.5), spacing=1.0, keep=0.55, jit=0.8, angj=0.06, calm_op=0.5),
    ]
    n = paint_passes(cv, rng, tgt, where, passes, flow, calm=calm, jitter=tuple(piece.get('jitter', (0.008, 0.003, 0.005))), stamps=stamps, dry_stamps=DRY.get('stamps'))
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
        hgt = np.maximum(hgt, np.sqrt(np.clip(1 - d2, 0, 1)))
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
    if piece.get('calm_box'):
        # calm only where the caption's words sit (the box, soft by 40 px); the tower may stand beside them
        cx0, cy0, cx1, cy1 = piece['calm_box']
        yy_, xx_ = np.mgrid[0:bh, 0:bw].astype(np.float32)
        xx_ += bx
        yy_ += by
        inside = np.clip((xx_ - cx0) / 40, 0, 1) * np.clip((cx1 - xx_) / 40, 0, 1) * np.clip((yy_ - cy0) / 40, 0, 1) * np.clip((cy1 - yy_) / 40, 0, 1)
        calm = (1 - inside).astype(np.float32)
        sil = sil * (1 - inside)
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
    t = np.clip(piece.get('lobe_k', 0.62) * lit + piece.get('big_k', 0.38) * (big * 0.5 + 0.5) + piece.get('t_bias', -0.02) + 0.14 * fbm(rng, bh, bw, 110, 3), 0, 1)[..., None]
    tgt = np.where(t < 0.5, shade_lab + (mid_lab - shade_lab) * (t / 0.5), mid_lab + (lit_lab - mid_lab) * ((t - 0.5) / 0.5))
    # the glowing rim: where the silhouette edge faces the light
    e_in = ndimage.distance_transform_edt(sil > 0.5)
    facing = np.clip(lit * 1.4 - 0.3, 0, 1) * np.clip(big * 0.8 + 0.6, 0, 1)
    rim = (np.clip(1 - e_in / piece.get('rim_px', 26), 0, 1) * facing)[..., None]
    tgt = tgt + (rim_lab - tgt) * rim * 0.85
    # inside the band: one calm value (the sky's band stays a calm field under the captions)
    if spec.get('band') and not piece.get('calm_box'):
        calmv = calm[..., None]
        tgt = tgt * (0.4 + 0.6 * calmv) + mid_lab * (0.6 - 0.6 * calmv)
    cv = Canvas(bh, bw)
    if piece.get('glow'):
        # the glow: a soft warm haze in the sky round the lit side, painted (low alpha), under the cloud
        gl = piece['glow']
        halo = cv2.GaussianBlur(sil, (0, 0), gl.get('px', 40)) * np.clip(big * 0.9 + 0.5, 0, 1) * gl.get('alpha', 0.3) * calm
        cv.wash(np.broadcast_to(lab_to_rgb(hex_lab(gl.get('color', pal['rim']))[None])[0], (bh, bw, 3)), np.clip(halo, 0, 1))
    wash_a = np.clip((sil - 0.35) / 0.4, 0, 1) * 0.92
    cv.wash(lab_to_rgb(cv2.GaussianBlur(tgt.astype(np.float32), (0, 0), 3)), wash_a)
    # strokes curl round the billows (along the height's contours), drifting a little with the wind
    hb = cv2.GaussianBlur(hgt, (0, 0), 12)
    gy2, gx2 = np.gradient(hb)
    flow = np.arctan2(gy2, gx2) + math.pi / 2 + 0.25 * fbm(rng, bh, bw, 140, 2)
    flat_flow = np.full_like(flow, piece.get('wind', -0.12))
    mag = np.clip(np.hypot(gx2, gy2) * 160, 0, 1)
    edge_w = np.clip(1 - ndimage.distance_transform_edt(hgt > 0.12) / piece.get('curl_px', 40), 0, 1)
    flow = np.where((mag > 0.15) & (edge_w > 0.3), flow, flat_flow + 0.35 * fbm(rng, bh, bw, 180, 2)).astype(np.float32)
    where = (sil > 0.25).astype(np.float32)
    clip = np.clip(cv2.GaussianBlur(sil, (0, 0), 3) * 1.6, 0, 1).astype(np.float32)
    s = piece.get('scale', 1.0)
    passes = piece.get('passes') or [
        dict(r=52 * s, len=(2.2, 4.0), op=(0.55, 0.8), spacing=0.85, angj=0.2),
        dict(r=30 * s, len=(2.2, 4.2), op=(0.5, 0.8), spacing=0.85, angj=0.2),
        dict(r=16 * s, len=(2.2, 4.5), op=(0.5, 0.85), spacing=0.9, err=0.06, alive=0.3, angj=0.25),
        dict(r=8 * s, len=(2.0, 4.0), op=(0.5, 0.9), spacing=1.0, keep=0.5, err=0.08, alive=0.12, angj=0.3),
    ]
    edge_d = ndimage.distance_transform_edt(sil > 0.5)
    nst = paint_passes(cv, rng, tgt, where, passes, flow, clip=clip, calm=calm, jitter=tuple(piece.get('jitter', (0.012, 0.006, 0.008))), stamps=stamps, dry_stamps=DRY.get('stamps'), edge_d=edge_d)
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
    if piece.get('clusters'):
        # leaf clusters: domes scattered inside the crown, each lit on its own light side and shaded on the other
        cl = piece['clusters']
        inside_pts = np.argwhere(mask > 0.5)
        dome = np.zeros((H, W), np.float32)
        yy_c, xx_c = np.mgrid[0:H, 0:W].astype(np.float32)
        for _ in range(int(cl['n'])):
            cy_, cx_ = inside_pts[int(rng.integers(len(inside_pts)))]
            r_ = rng.uniform(*cl['r'])
            d2 = ((xx_c - cx_) ** 2 + (yy_c - cy_) ** 2) / (r_ * r_)
            dome = np.maximum(dome, np.sqrt(np.clip(1 - d2, 0, 1)) * r_)
        gyc, gxc = np.gradient(cv2.GaussianBlur(dome, (0, 0), 1.5))
        nc = np.stack([-gxc, -gyc, np.full_like(dome, 0.9)], -1)
        nc /= np.linalg.norm(nc, axis=-1, keepdims=True)
        Lc = np.array([light[0], light[1], 0.6], np.float32)
        Lc /= np.linalg.norm(Lc)
        litc = np.clip((nc @ Lc - 0.5) / 0.5, -1, 1)
        lit = np.clip(cl.get('global', 0.55) * lit + cl.get('local', 0.8) * litc, -1, 1)
    # colour moving within the shape: lit side lighter and warmer, shade side deeper and cooler, a slow drift through it
    warm = piece.get('warm', [0.035, 0.004, 0.022])  # dL, da, db toward the light
    cool = piece.get('cool', [-0.045, -0.006, -0.018])
    w_l = np.clip(lit, 0, 1)[..., None]
    w_s = np.clip(-lit, 0, 1)[..., None]
    tgt = lab + w_l * np.array(warm) + w_s * np.array(cool)
    # the big gradient across the whole piece along the light (a built face is flat: its colour moves light to shade)
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    ln = np.array(light, np.float32) / (np.linalg.norm(light) + 1e-8)
    proj = xx * ln[0] + yy * ln[1]
    inside_p = proj[mask > 0.5]
    ramp = np.clip((proj - inside_p.mean()) / (inside_p.std() * 1.8 + 1e-3), -1, 1)[..., None]
    rk = piece.get('ramp', 0.7)
    tgt = tgt + rk * (np.clip(ramp, 0, 1) * np.array(warm) + np.clip(-ramp, 0, 1) * np.array(cool))
    drift = piece.get('drift', [0.018, 0.006, 0.010])
    nA = fbm(rng, H, W, piece.get('drift_cell', 70), 3)
    nB = fbm(rng, H, W, piece.get('drift_cell', 70) * 1.3, 3)
    tgt = shift(tgt, dL=drift[0] * nA, da=drift[1] * nB, db=drift[2] * nB)
    if piece.get('chroma_k'):
        tgt[..., 1:] *= piece['chroma_k']
    if piece.get('value_bias'):
        tgt[..., 0] += piece['value_bias']
    if piece.get('haze'):
        # a soft painted haze: toward the air's colour, more toward the piece's foot
        hz = piece['haze']
        rows = np.linspace(0, 1, H, dtype=np.float32)[:, None, None]
        k_h = hz['k'] * (hz.get('top', 0.6) + (1 - hz.get('top', 0.6)) * rows)
        tgt = tgt + (hex_lab(hz['color']) - tgt) * k_h
    cv = Canvas(H, W)
    ragged = piece.get('ragged', 3.5 if foliage else 1.4)
    soft = piece.get('soft', 2.0 if foliage else 1.4)
    wash_a = soft_edge_mask(rng, mask, ragged, soft, piece.get('edge_cell', 14 if foliage else 30))
    # the outer edge where the frame cuts the piece stays whole (no ragged edge at the frame's edge)
    wash_a = keep_frame_edges(wash_a, mask, (x0, y0, x1, y1), spec['frame'])
    cv.wash(lab_to_rgb(cv2.GaussianBlur(tgt.astype(np.float32), (0, 0), 2.0)), wash_a)
    where = (mask > 0.5).astype(np.float32)
    clip_r = piece.get('overshoot', 7 if foliage else 1.0)
    clip = soft_edge_mask(rng, mask, ragged * 0.8, soft + clip_r, piece.get('edge_cell', 14 if foliage else 30))
    clip = keep_frame_edges(clip, mask, (x0, y0, x1, y1), spec['frame'])
    if foliage:
        # leaves: dabs drooping a little, clustered (a cluster noise thins the small dabs between clusters)
        flow = (-0.35 + 0.9 * fbm(rng, H, W, 40, 2)).astype(np.float32)
        passes = piece.get('passes') or [
            dict(r=24, len=(1.6, 2.4), op=(0.6, 0.85), spacing=0.9, angj=0.5),
            dict(r=17, dab=True, op=(0.75, 0.95), spacing=0.8, angj=0.6),
            dict(r=11, dab=True, op=(0.75, 0.95), spacing=0.8, err=0.05, alive=0.45, angj=0.7),
            dict(r=7, dab=True, op=(0.75, 1.0), spacing=0.9, keep=0.5, err=0.07, alive=0.15, angj=0.8),
        ]
        jit = piece.get('jitter', (0.02, 0.007, 0.011))
    else:
        ang = math.radians(piece.get('angle', 90))
        flow = (ang + 0.08 * fbm(rng, H, W, 80, 2)).astype(np.float32)
        passes = piece.get('passes') or [
            dict(r=30, len=(1.4, 2.6), op=(0.3, 0.5), spacing=0.9, angj=0.1),
            dict(r=17, len=(1.5, 3.0), op=(0.3, 0.55), spacing=0.9, angj=0.12),
            dict(r=9, len=(1.5, 3.0), op=(0.35, 0.6), spacing=1.0, keep=0.6, err=0.04, alive=0.25, angj=0.14),
        ]
        jit = piece.get('jitter', (0.012, 0.003, 0.006))
    ref = rgb.astype(np.float32)  # the flat (filled out): its regions keep each stroke inside its own shape
    edge_d = ndimage.distance_transform_edt(mask > 0.5)
    nst = paint_passes(cv, rng, tgt, where, passes, flow, clip=clip, jitter=tuple(jit), stamps=stamps, dabs=dabs, ref=ref, tau=piece.get('tau', 0.09), dry_stamps=DRY.get('stamps'), edge_d=edge_d)
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

# ------------------------------------------------------------------ the BROAD brush (v3; the owner's style models:
# refs_human_scale/03_beach_dusk.jpg, 02_bus_stop_night.jpg): big, simple masses in one colour family lit by one light,
# each made of a few broad, deliberate flat-brush strokes; calm, nearly smooth insides; the texture lives at the EDGES
# (a dragged, dry, scumbled break-up where the paint runs out and the sky shows through, a speckle dissolve); fine strokes
# only where the thing is fine. A piece opts in with "brush": "broad".

def smoothstep(a, b, x):
    t = np.clip((x - a) / max(1e-6, b - a), 0, 1)
    return t * t * (3 - 2 * t)


def make_flat_stamps(rng, n=14, L=256, W=64, side=(0.05, 0.10), chisel=0.012):
    """Flat-brush stamps: an even, opaque core (a faint bristle ripple), crisp sides, a chiselled start, and a dry tail
    whose bristle rows break up as the paint runs out."""
    stamps = []
    v = np.linspace(-1, 1, W)
    u = np.linspace(0, 1, L)
    for _ in range(n):
        side_ = np.clip((1 - np.abs(v)) / rng.uniform(*side), 0, 1)
        ripple = 1 - rng.uniform(0.03, 0.10) * value_noise(rng, W, 2, 3, 1)[:, 0]
        prof = side_ * ripple
        slant = rng.uniform(-0.08, 0.08)
        start = np.clip((u[None, :] - (0.015 + slant * v[:, None])) / chisel, 0, 1)
        tail0 = rng.uniform(0.45, 0.78)
        streak = value_noise(rng, W, L, 1.3, L / rng.uniform(4, 8))
        dry = np.clip((u[None, :] - tail0) / (1 - tail0), 0, 1) ** 1.15
        A = prof[:, None] * start * np.clip((streak - dry * 0.98 + 0.04) / 0.08 + 0.5, 0, 1)
        stamps.append(np.clip(A, 0, 1).astype(np.float32))
    return stamps


def streak_noise(rng, h, w, theta, along, across):
    """Noise in streaks along `theta` (radians): long `along` px, fine `across` px (a dragged dry brush)."""
    D = int(math.ceil(math.hypot(h, w))) + 8
    n = value_noise(rng, D, D, across, along)
    M = cv2.getRotationMatrix2D((D / 2, D / 2), -math.degrees(theta), 1.0)
    r = cv2.warpAffine(n, M, (D, D), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)
    y0 = (D - h) // 2
    x0 = (D - w) // 2
    return r[y0:y0 + h, x0:x0 + w]


def signed_dist(mask):
    inside = mask > 0.5
    return (ndimage.distance_transform_edt(inside) - ndimage.distance_transform_edt(~inside)).astype(np.float32)


def broad_paint(piece, rng, sil, tgt, light2, calm=None, ref=None):
    """Paint one mass the broad way. sil: the silhouette (0..1); tgt: OKLab target already in its few flat masses.
    Returns (rgb, alpha, n strokes)."""
    H, W = sil.shape
    b = piece.get('broad', {})
    theta = math.radians(b.get('angle', -8))
    sd = signed_dist(sil)
    # 1. the masses: one wash, the silhouette's edge dragged dry along the brush (the sky shows through the break-up)
    drag = streak_noise(rng, H, W, theta, b.get('drag_along', 70), b.get('drag_across', 2.2))
    depth = b.get('edge_px', 16)
    soft = b.get('edge_soft', 3.0)
    coarse = fbm(rng, H, W, b.get('edge_cell', 60), 3)
    alpha = np.clip((sd + depth * (drag - 0.55) * 2.0 + b.get('edge_wobble', 10) * coarse + soft * 0.5) / soft, 0, 1)
    # inside the mass the paint is whole (only the rim breaks up)
    alpha = np.maximum(alpha, np.clip((sd - depth * 1.2) / 4, 0, 1))
    if ref is not None and b.get('crisp_colors'):
        # parts that keep a clean edge (a trunk, a post): where the flat has one of these colours, no break-up
        crisp = np.zeros((H, W), bool)
        for hx in b['crisp_colors']:
            crisp |= np.abs(ref - hex_rgb(hx)[None, None, :]).sum(-1) < 0.12
        crisp = ndimage.binary_dilation(crisp, iterations=4)
        alpha = np.where(crisp, np.clip((sd + 1.0) / 2.0, 0, 1), alpha)
    cv = Canvas(H, W)
    gentle = fbm(rng, H, W, b.get('vary_cell', 140), 3)
    base = shift(tgt, dL=b.get('vary', 0.006) * gentle)
    cv.wash(lab_to_rgb(cv2.GaussianBlur(base.astype(np.float32), (0, 0), b.get('wash_blur', 2.0))), alpha.astype(np.float32))
    stamps = make_flat_stamps(np.random.default_rng(int(piece['seed']) * 11 + 5), side=tuple(b.get('side', (0.05, 0.10))), chisel=b.get('chisel', 0.012))
    if ref is None and b.get('mass_tau'):
        # strokes stay inside their own mass (a stroke never drags the shade over the lit side)
        ref = lab_to_rgb(tgt).astype(np.float32)
        b = dict(b, tau=b['mass_tau'])
    n = 0
    # 2. a few broad, deliberate strokes inside the masses, along the brush, each one flat colour of its mass
    area = float((alpha > 0.5).sum())
    w_lo, w_hi = b.get('width', (40, 90))
    k_n = b.get('strokes', 0.7)
    count = int(k_n * area / ((w_lo + w_hi) * 0.5) ** 2)
    pts = np.argwhere(alpha > 0.9)
    clipm = np.clip(alpha * 1.05, 0, 1).astype(np.float32)
    for _ in range(count):
        if len(pts) == 0:
            break
        y, x = pts[int(rng.integers(len(pts)))]
        k = 1.0 if calm is None else float(calm[y, x])
        lab = tgt[y, x] + np.array([rng.normal(0, b.get('jitter_L', 0.012)), rng.normal(0, 0.003), rng.normal(0, 0.004)]) * k
        wdt = rng.uniform(w_lo, w_hi)
        cv.stamp(stamps[int(rng.integers(len(stamps)))], x, y, theta + rng.normal(0, b.get('angj', 0.10)), wdt * rng.uniform(*b.get('len', (1.8, 3.2))), wdt,
                 lab_to_rgb(lab[None])[0], rng.uniform(*b.get('op', (0.35, 0.65))) * (0.4 + 0.6 * k), clipm, ref, b.get('tau', 0.0))
        n += 1
    # 3. the edge's flat-brush strokes: chiselled shapes along the rim, their dry tails running out past it
    edge_pts = np.argwhere((sd > -2) & (sd < depth * 0.6))
    e_lo, e_hi = b.get('edge_width', (18, 44))
    n_edge = int(b.get('edge_strokes', 0.5) * len(edge_pts) / ((e_lo + e_hi) * 0.5) / 3.0)
    gy, gx = np.gradient(cv2.GaussianBlur(sd, (0, 0), 4))
    for _ in range(n_edge):
        if len(edge_pts) == 0:
            break
        y, x = edge_pts[int(rng.integers(len(edge_pts)))]
        k = 1.0 if calm is None else float(calm[y, x])
        if k < 0.5:
            continue
        nx, ny = -gx[y, x], -gy[y, x]
        nn = math.hypot(nx, ny) + 1e-6
        # the stroke runs along the brush, pushed a little outward, its tail toward the outside
        wdt = rng.uniform(e_lo, e_hi)
        ang = theta + rng.normal(0, b.get('edge_angj', 0.18))
        if (math.cos(ang) * nx + math.sin(ang) * ny) < 0:
            ang += math.pi
        cx = x + nx / nn * wdt * 0.15
        cy = y + ny / nn * wdt * 0.15
        lab = tgt[y, x] + np.array([rng.normal(0, b.get('jitter_L', 0.012)), 0, 0])
        cv.stamp(stamps[int(rng.integers(len(stamps)))], cx, cy, ang, wdt * rng.uniform(1.5, 2.8), wdt, lab_to_rgb(lab[None])[0], rng.uniform(0.75, 0.95), None, ref, b.get('tau', 0.0))
        n += 1
    # 4. a speckle dissolve on the side away from the light (the paint scattering into the sky)
    if b.get('specks', 0):
        L2 = np.array(light2, np.float32) / (np.linalg.norm(light2) + 1e-8)
        away = np.clip(-(gx * -L2[0] + gy * -L2[1]) * 6, 0, 1) if False else np.clip(((-gx) * (-L2[0]) + (-gy) * (-L2[1])) / (np.hypot(gx, gy) + 1e-6), 0, 1)
        dout = np.clip(-sd, 0, None)
        zone = (np.clip(1 - dout / b.get('speck_px', 34), 0, 1) * (sd < 0) * away).astype(np.float32)
        if calm is not None:
            zone *= calm
        zone *= b.get('speck_density', 0.02)
        cols = [lab_to_rgb(tgt[int(H / 2), int(W / 2)][None])[0]]
        ys_, xs_ = np.nonzero(zone > 0)
        if len(ys_):
            cols = [lab_to_rgb(np.median(tgt[alpha > 0.9], 0)[None])[0]]
        n += speckle(cv, rng, zone, int(b['specks']), 0.7, 2.0, cols, (0.5, 0.9))
    out, a = cv.rgba()
    out = out * grain(rng, H, W, b.get('grain', 0.006))[..., None]
    return out, a, n


def masses(t, cuts, soft, noise):
    """Weights of a few flat value masses from a smooth light term t (0..1): cuts between them, a soft, noisy border."""
    tt = t + noise
    ws = []
    prev = np.ones_like(t)
    for c in cuts:
        s_ = smoothstep(c - soft, c + soft, tt)
        ws.append(prev - s_)
        prev = s_
    ws.append(prev)
    return ws


def style_sky_broad(piece, spec, rng, stamps):
    """A calm sky the broad way: the flat gradient kept smooth, a gentle drift (warm by the sun, cooler up top), a faint,
    very low-contrast diagonal stroke texture (calmer still in the band), and a few long, flat horizontal strokes of lit
    cloud low by the sun."""
    rgb, _ = load_flat(os.path.join(ROOT, piece['flat']))
    x0, y0, x1, y1 = piece.get('crop', [0, 0, rgb.shape[1], rgb.shape[0]])
    rgb = rgb[y0:y1, x0:x1]
    H, W = rgb.shape[:2]
    lab = rgb_to_lab(rgb)
    calm = band_calm(H, y0, spec.get('band'), 46)[:, None] * np.ones((1, W), np.float32)
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    yy += y0
    xx += x0
    tgt = lab.copy()
    if piece.get('sun_warm'):
        sw = piece['sun_warm']
        dsun = np.hypot((xx - sw['xy'][0]) / 1.3, yy - sw['xy'][1])
        tgt += (np.clip(1 - dsun / sw['r'], 0, 1) ** 1.5 * (0.35 + 0.65 * calm))[..., None] * np.array(sw['d'])
    if piece.get('top_cool'):
        tc = piece['top_cool']
        tgt += (np.clip(1 - yy / tc['y1'], 0, 1) ** 1.3)[..., None] * np.array(tc['d'])
    b = piece.get('broad', {})
    gentle = fbm(rng, H, W, b.get('vary_cell', 260), 3, aniso=2.5)
    tgt = shift(tgt, dL=b.get('vary', 0.006) * gentle * (0.3 + 0.7 * calm))
    # the faint diagonal texture (the beach sky's): long thin streaks, very low contrast
    diag = streak_noise(rng, H, W, math.radians(b.get('hatch_angle', -24)), b.get('hatch_along', 160), b.get('hatch_across', 1.6)) - 0.5
    tgt = shift(tgt, dL=b.get('hatch', 0.007) * diag * (0.15 + 0.85 * calm))
    cv = Canvas(H, W)
    cv.wash(lab_to_rgb(tgt), np.ones((H, W), np.float32))
    n = 0
    fstamps = make_flat_stamps(np.random.default_rng(int(piece['seed']) * 11 + 5))
    for st_ in piece.get('layers', []):
        # one long flat stroke: [x, y, length, width, angle deg, hex colour, opacity]
        x, y, L_, w_, ang, col, op = st_
        k = float(band_calm(1, int(y), spec.get('band'), 46)[0])
        cv.stamp(fstamps[n % len(fstamps)], x - x0, y - y0, math.radians(ang), L_, w_, lab_to_rgb(hex_lab(col)[None])[0], op * (0.25 + 0.75 * k))
        n += 1
    out, a = cv.rgba()
    out = out * grain(rng, H, W, b.get('grain', 0.004))[..., None]
    return out, np.ones((H, W), np.float32), (x0, y0), n


def style_cloud_broad(piece, spec, rng, stamps):
    """A cloud the broad way: its lobes give the shape and the form, lit by the ONE light into three flat masses of the
    sky's own family (the lit side warm from the sun), painted with a few broad strokes, its rim dragged dry."""
    bx, by, bw, bh = piece['box']
    hgt = lobe_mask(piece['lobes'], piece['box'], rng, 0, 0)
    sil = np.clip((hgt - 0.12) / 0.06, 0, 1)
    rows = (np.arange(bh, dtype=np.float32) + by)[:, None]
    if piece.get('base_y') is not None:
        sil = sil * np.clip((piece['base_y'] - rows) / piece.get('base_soft', 30), 0, 1)
    calm = np.ones((bh, bw), np.float32)
    if piece.get('calm_box'):
        cx0, cy0, cx1, cy1 = piece['calm_box']
        yy_, xx_ = np.mgrid[0:bh, 0:bw].astype(np.float32)
        xx_ += bx
        yy_ += by
        inside = np.clip((xx_ - cx0) / 40, 0, 1) * np.clip((cx1 - xx_) / 40, 0, 1) * np.clip((yy_ - cy0) / 40, 0, 1) * np.clip((cy1 - yy_) / 40, 0, 1)
        calm = (1 - inside).astype(np.float32)
        sil = sil * calm
    light = piece.get('light', spec['light']['dir'])
    gy, gx = np.gradient(cv2.GaussianBlur(hgt, (0, 0), piece.get('form_blur', 10)))
    nrm = np.stack([-gx * 30, -gy * 30, np.full_like(hgt, 1.0)], -1)
    nrm /= np.linalg.norm(nrm, axis=-1, keepdims=True)
    L3 = np.array([light[0], light[1], 0.3], np.float32)
    L3 /= np.linalg.norm(L3)
    lit = np.clip(nrm @ L3, 0, 1)
    cxm = np.mean([l[0] for l in piece['lobes']])
    cym = np.mean([l[1] for l in piece['lobes']])
    yy, xx = np.mgrid[0:bh, 0:bw].astype(np.float32)
    big = np.clip(((xx + bx - cxm) * light[0] + (yy + by - cym) * light[1]) / (max(bw, bh) * 0.55), -1, 1)
    t = np.clip(piece.get('lobe_k', 0.6) * lit + piece.get('big_k', 0.4) * (big * 0.5 + 0.5), 0, 1)
    pal = piece['palette']
    labs = [hex_lab(pal[k]) for k in ('shade', 'mid', 'lit')]
    ws = masses(t, piece.get('cuts', [0.36, 0.62]), piece.get('mass_soft', 0.035), 0.05 * fbm(rng, bh, bw, 50, 3))
    tgt = sum(w[..., None] * lab for w, lab in zip(ws, labs))
    if pal.get('rim'):
        # the lit rim: where the edge faces the light, one warm step (a band, not a glow)
        e_in = ndimage.distance_transform_edt(sil > 0.5)
        rim = (np.clip(1 - e_in / piece.get('rim_px', 14), 0, 1) * smoothstep(0.55, 0.8, lit) * (big > -0.2)).astype(np.float32)
        tgt = tgt + (hex_lab(pal['rim']) - tgt) * rim[..., None] * 0.9
    out, a, n = broad_paint(piece, rng, sil, tgt, light, calm)
    return out, a, (bx, by), n


def style_flat_broad(piece, spec, rng, stamps):
    """foliage / surface from the flat, the broad way: the flat's colours lit into a lit and a shade mass (each a flat
    step), painted with a few broad strokes inside its own flat regions, the silhouette broken at the rim."""
    rgb, mask = load_flat(os.path.join(ROOT, piece['flat']))
    ys, xs = np.nonzero(mask > 0.02)
    m = piece.get('margin', 24)
    x0, x1 = max(0, xs.min() - m), min(mask.shape[1], xs.max() + m + 1)
    y0, y1 = max(0, ys.min() - m), min(mask.shape[0], ys.max() + m + 1)
    rgb, mask = rgb[y0:y1, x0:x1], mask[y0:y1, x0:x1]
    H, W = mask.shape
    rgb = fill_out(rgb, mask)
    lab = rgb_to_lab(rgb)
    light = piece.get('light', spec['light']['dir'])
    lit, _ = form_light(mask, piece.get('form_sigma', 30), light)
    if piece.get('clusters'):
        cl = piece['clusters']
        inside_pts = np.argwhere(mask > 0.5)
        dome = np.zeros((H, W), np.float32)
        yy_c, xx_c = np.mgrid[0:H, 0:W].astype(np.float32)
        for _ in range(int(cl['n'])):
            cy_, cx_ = inside_pts[int(rng.integers(len(inside_pts)))]
            r_ = rng.uniform(*cl['r'])
            dome = np.maximum(dome, np.sqrt(np.clip(1 - ((xx_c - cx_) ** 2 + (yy_c - cy_) ** 2) / (r_ * r_), 0, 1)) * r_)
        gyc, gxc = np.gradient(cv2.GaussianBlur(dome, (0, 0), 3))
        nc = np.stack([-gxc, -gyc, np.full_like(dome, 0.9)], -1)
        nc /= np.linalg.norm(nc, axis=-1, keepdims=True)
        Lc = np.array([light[0], light[1], 0.6], np.float32)
        Lc /= np.linalg.norm(Lc)
        lit = np.clip(cl.get('global', 0.5) * lit + cl.get('local', 0.8) * np.clip((nc @ Lc - 0.5) / 0.5, -1, 1), -1, 1)
    t = lit * 0.5 + 0.5
    ws = masses(t, piece.get('cuts', [0.42, 0.66]), piece.get('mass_soft', 0.03), 0.06 * fbm(rng, H, W, 24, 3))
    offs = [np.array(piece.get('cool', [-0.06, -0.01, -0.01])), np.zeros(3), np.array(piece.get('warm', [0.04, -0.005, 0.03]))]
    tgt = lab + sum(w[..., None] * o for w, o in zip(ws, offs))
    if piece.get('chroma_k'):
        tgt[..., 1:] *= piece['chroma_k']
    if piece.get('value_bias'):
        tgt[..., 0] += piece['value_bias']
    if piece.get('haze'):
        hz = piece['haze']
        rr = np.linspace(0, 1, H, dtype=np.float32)[:, None, None]
        tgt = tgt + (hex_lab(hz['color']) - tgt) * (hz['k'] * (hz.get('top', 0.6) + (1 - hz.get('top', 0.6)) * rr))
    out, a, n = broad_paint(piece, rng, mask, tgt, light, None, ref=rgb.astype(np.float32))
    a2 = keep_frame_edges(a, mask, (x0, y0, x1, y1), spec['frame'])
    # where the frame's edge keeps the paint whole, the colour is the mass's (never the canvas's unpainted black)
    fix = (a2 > a + 0.01)
    out = np.where(fix[..., None], (out * a[..., None] + lab_to_rgb(tgt) * (a2 - a)[..., None]) / np.maximum(a2, 1e-4)[..., None], out)
    return out, a2, (x0, y0), n


def lobe_height(lobes, box, flat=1.0):
    """Domes of lobes [x, y, r] (frame px) in a box; `flat` < 1 squashes them vertically (a far, flattened deck)."""
    bx, by, bw, bh = box
    yy, xx = np.mgrid[0:bh, 0:bw].astype(np.float32)
    xx += bx
    yy += by
    hgt = np.zeros((bh, bw), np.float32)
    for (cx, cy, r) in lobes:
        hgt = np.maximum(hgt, np.sqrt(np.clip(1 - ((xx - cx) / r) ** 2 - ((yy - cy) / (r * flat)) ** 2, 0, 1)))
    return hgt


def style_cloudscape(piece, spec, rng, stamps):
    """A LAYERED cloudscape (the owner, 2026-10-29: "even clouds have layers that give a sense of depth"): cloud planes
    by depth (0 near ... 1 far), each its own image (far to near), painted the broad way. With depth a plane converges on
    the sky's OWN colour behind it (atmospheric perspective), loses contrast, softens its edges, simplifies (fewer
    strokes, two masses), flattens (`flat`), and turns its strokes level; a nearer plane's edge sits in front of a
    farther one with a little AIR between them (a lighter band of the sky's value on the farther plane); kind 'streaks'
    is a deck of long thin level strokes by the sun's line."""
    FW, FH = spec['frame']
    sky_rgb, _ = load_flat(os.path.join(ROOT, piece['sky_flat']))
    sky_lab = rgb_to_lab(sky_rgb)
    pal = piece['palette']
    light = piece.get('light', spec['light']['dir'])
    planes = sorted(piece['planes'], key=lambda q: -q['depth'])  # far first
    # every solid plane's silhouette in frame px (for the air gaps)
    sils = []
    for pl in planes:
        full = np.zeros((FH, FW), np.float32)
        if pl.get('kind') != 'streaks':
            bx, by, bw, bh = pl['box']
            hgt = lobe_height(pl['lobes'], pl['box'], pl.get('flat', 1.0))
            sil = np.clip((hgt - 0.12) / 0.06, 0, 1)
            x0, y0 = max(0, bx), max(0, by)
            x1, y1 = min(FW, bx + bw), min(FH, by + bh)
            full[y0:y1, x0:x1] = sil[y0 - by:y1 - by, x0 - bx:x1 - bx]
        sils.append(full)
    outs = []
    for j, pl in enumerate(planes):
        d = float(pl['depth'])
        conv = pl.get('conv', 0.8 * d)
        bx, by, bw, bh = pl['box']
        x0, y0 = max(0, bx), max(0, by)
        sky_box = np.zeros((bh, bw, 3), np.float32)
        x1, y1 = min(FW, bx + bw), min(FH, by + bh)
        sky_box[y0 - by:y1 - by, x0 - bx:x1 - bx] = sky_lab[y0:y1, x0:x1]
        prng = np.random.default_rng(int(piece['seed']) * 101 + j)
        bb = dict(piece.get('broad', {}))
        bb.update({
            'edge_soft': bb.get('edge_soft', 3.0) * (1 + 2.5 * d),
            'edge_px': bb.get('edge_px', 16) * (1 - 0.45 * d),
            'strokes': bb.get('strokes', 0.7) * (1 - 0.7 * d),
            'edge_strokes': bb.get('edge_strokes', 0.5) * (1 - 0.6 * d),
            'width': tuple(w * (1 - 0.35 * d) for w in bb.get('width', (40, 90))),
            'edge_width': tuple(w * (1 - 0.35 * d) for w in bb.get('edge_width', (18, 44))),
            'specks': int(bb.get('specks', 0) * (1 - d)),
            'angle': bb.get('angle', -8) * (1 - d),
            'jitter_L': bb.get('jitter_L', 0.012) * (1 - 0.6 * d),
        })
        bb.update(pl.get('broad', {}))
        sub = dict(piece, broad=bb, seed=int(piece['seed']) * 101 + j)
        if pl.get('kind') == 'streaks':
            cv = Canvas(bh, bw)
            fst = make_flat_stamps(np.random.default_rng(int(piece['seed']) * 13 + j))
            for k, (x, y, L_, w_) in enumerate(pl['streaks']):
                col = hex_lab(pl.get('color', pal['lit']))
                sk = sky_lab[int(min(FH - 1, max(0, y))), int(min(FW - 1, max(0, x)))]
                lab = col + (sk - col) * conv
                cv.stamp(fst[k % len(fst)], x - bx, y - by, math.radians(prng.normal(0, 0.8)), L_, w_, lab_to_rgb(lab[None])[0], prng.uniform(0.65, 0.9))
            out, a = cv.rgba()
            outs.append((f'p{j}', out, a, (bx, by), len(pl['streaks']), d))
            continue
        hgt = lobe_height(pl['lobes'], pl['box'], pl.get('flat', 1.0))
        sil = np.clip((hgt - 0.12) / 0.06, 0, 1)
        calm = np.ones((bh, bw), np.float32)
        if piece.get('calm_box') and d < 0.3:
            cx0, cy0, cx1, cy1 = piece['calm_box']
            yy_, xx_ = np.mgrid[0:bh, 0:bw].astype(np.float32)
            xx_ += bx
            yy_ += by
            inside = np.clip((xx_ - cx0) / 40, 0, 1) * np.clip((cx1 - xx_) / 40, 0, 1) * np.clip((yy_ - cy0) / 40, 0, 1) * np.clip((cy1 - yy_) / 40, 0, 1)
            calm = (1 - inside).astype(np.float32)
            sil = sil * calm
        # the form, lit by the one light; masses (two when far)
        gy, gx = np.gradient(cv2.GaussianBlur(hgt, (0, 0), pl.get('form_blur', 10)))
        nrm = np.stack([-gx * 30, -gy * 30, np.full_like(hgt, 1.0)], -1)
        nrm /= np.linalg.norm(nrm, axis=-1, keepdims=True)
        L3 = np.array([light[0], light[1], 0.3], np.float32)
        L3 /= np.linalg.norm(L3)
        lit = np.clip(nrm @ L3, 0, 1)
        cxm = np.mean([l[0] for l in pl['lobes']])
        cym = np.mean([l[1] for l in pl['lobes']])
        yy, xx = np.mgrid[0:bh, 0:bw].astype(np.float32)
        big = np.clip(((xx + bx - cxm) * light[0] + (yy + by - cym) * light[1]) / (max(bw, bh) * 0.55), -1, 1)
        t = np.clip(pl.get('lobe_k', 0.6) * lit + pl.get('big_k', 0.4) * (big * 0.5 + 0.5), 0, 1)
        shade, mid, litc = (hex_lab(pal[k]) for k in ('shade', 'mid', 'lit'))
        cuts = pl.get('cuts', [0.36, 0.62] if d < 0.6 else [0.5])
        labs = [shade, mid, litc] if len(cuts) == 2 else [shade + (mid - shade) * 0.55, litc]
        ws = masses(t, cuts, 0.035 + 0.04 * d, 0.05 * fbm(prng, bh, bw, 50, 3))
        tgt = sum(w[..., None] * lab for w, lab in zip(ws, labs))
        if pal.get('rim') and d < 0.6:
            e_in = ndimage.distance_transform_edt(sil > 0.5)
            rim = (np.clip(1 - e_in / pl.get('rim_px', 14), 0, 1) * smoothstep(0.55, 0.8, lit) * (big > -0.2)).astype(np.float32)
            tgt = tgt + (hex_lab(pal['rim']) - tgt) * rim[..., None] * 0.9 * (1 - d)
        # atmospheric perspective: toward the sky's own colour behind it
        tgt = tgt + (sky_box - tgt) * conv
        # the air between this plane and every nearer one: a lighter band of the sky's value along their edges
        nearer = np.zeros((FH, FW), np.float32)
        for k in range(j + 1, len(planes)):
            nearer = np.maximum(nearer, sils[k])
        if nearer.max() > 0:
            dn = ndimage.distance_transform_edt(nearer < 0.5)[y0:y1, x0:x1]
            gap = np.zeros((bh, bw), np.float32)
            gap[y0 - by:y1 - by, x0 - bx:x1 - bx] = np.clip(1 - dn / piece.get('air_px', 14), 0, 1)
            air = sky_box + np.array([piece.get('air_dL', 0.03), 0, 0])
            tgt = tgt + (air - tgt) * gap[..., None] * 0.85
        out, a, n = broad_paint(sub, prng, sil, tgt, light, calm)
        outs.append((f'p{j}', out, a, (bx, by), n, d))
    return outs


# ------------------------------------------------------------------ DESIGNED shapes (v4; the playbook's "forest before the
# trees": design the masses first, then paint them). A piece with "style": "designed" gives its planes as deliberate
# silhouettes: billows [x, y, r, flat] in drawing order (later ones in front), a flat base line, and the light. Each
# billow splits into a LIT cap (the crescent facing the light), a MID band and a SHADE side by two circles shifted
# away from the light (a curved terminator), the base band is shade (a cloud's underside); the plane's three colours
# converge on the sky's colour with depth. `--design` writes the flat design (the check: squint beside the models), the
# default paints those same shapes: firm, lightly broken edges where the light hits, soft dry-brush edges on the shade
# side, a few broad strokes inside each value mass along the billow's form, gentle variation.

def design_plane(pl, box, light, ss=2):
    """Label map (0 none, 1 shade, 2 mid, 3 lit), coverage, and each pixel's billow centre (for the form's flow)."""
    bx, by, bw, bh = box
    H2, W2 = bh * ss, bw * ss
    yy, xx = np.mgrid[0:H2, 0:W2].astype(np.float32)
    xx = xx / ss + bx
    yy = yy / ss + by
    lab = np.zeros((H2, W2), np.uint8)
    cxm = np.zeros((H2, W2), np.float32)
    cym = np.zeros((H2, W2), np.float32)
    L = np.array(light, np.float32) / (np.linalg.norm(light) + 1e-8)
    s1, s2 = pl.get('lit_cap', 0.34), pl.get('mid_band', 0.7)
    def disc_of(b, dx=0.0, dy=0.0):
        cx, cy, r = b[0], b[1], b[2]
        f = b[3] if len(b) > 3 and b[3] else pl.get('flat', 1.0)
        return ((xx - cx - dx) / r) ** 2 + ((yy - cy - dy) / (r * f)) ** 2 <= 1.0
    if pl.get('light_mode', 'cloud') == 'cap':
        # TRUE billows (v5: no crescents): each billow, back to front, a lit TOP above a curved terminator (lower on the
        # light's side, bowed by the billow's roundness), a mid band under it, a shade underside; front lobes overlap
        tl, tm = pl.get('t_lit', 0.05), pl.get('t_mid', 0.45)
        tilt, curv = pl.get('tilt', 0.25), pl.get('curv', 0.14)
        side = -1.0 if L[0] < 0 else 1.0  # the light's side in x
        for b in pl['billows']:
            cx, cy, r = b[0], b[1], b[2]
            f = b[3] if len(b) > 3 and b[3] else pl.get('flat', 1.0)
            D = disc_of(b)
            u = (xx - cx) / r
            bow = curv * r * f * np.clip(1 - u * u, 0, 1)
            y_lit = cy + tl * r * f + tilt * side * (xx - cx) * f + bow
            y_mid = cy + tm * r * f + tilt * side * (xx - cx) * f + bow
            z = np.where(yy < y_lit, 3, np.where(yy < y_mid, 2, 1)).astype(np.uint8)
            lab = np.where(D, z, lab).astype(np.uint8)
            cxm = np.where(D, cx, cxm)
            cym = np.where(D, cy, cym)
    elif pl.get('light_mode', 'cloud') == 'billow':
        # every billow its own lit cap (a small, busy form: a crown of leaves)
        for b in pl['billows']:
            r = b[2]
            f = b[3] if len(b) > 3 and b[3] else pl.get('flat', 1.0)
            D = disc_of(b)
            A = disc_of(b, -L[0] * s1 * r, -L[1] * s1 * r * f)
            B = disc_of(b, -L[0] * s2 * r, -L[1] * s2 * r * f)
            lab = np.where(D, np.where(D & ~A, 3, np.where(D & A & ~B, 2, 1)), lab).astype(np.uint8)
            cxm = np.where(D, b[0], cxm)
            cym = np.where(D, b[1], cym)
    else:
        # ONE form for the whole cloud: the lit band follows the whole outline on the light's side, then a mid band,
        # then one big shade mass; a few ACCENT billows (5th value 1) add their own lit cap inside, for depth
        sil = np.zeros((H2, W2), bool)
        for b in pl['billows']:
            D = disc_of(b)
            sil |= D
            cxm = np.where(D, b[0], cxm)
            cym = np.where(D, b[1], cym)
        def shifted(m, d):
            M = np.float32([[1, 0, -L[0] * d * ss], [0, 1, -L[1] * d * ss]])
            return cv2.warpAffine(m.astype(np.uint8), M, (W2, H2), flags=cv2.INTER_NEAREST, borderMode=cv2.BORDER_CONSTANT, borderValue=1) > 0
        lit = sil & ~shifted(sil, pl.get('lit_px', 34))
        mid = sil & ~shifted(sil, pl.get('mid_px', 80)) & ~lit
        lab = np.where(lit, 3, np.where(mid, 2, np.where(sil, 1, 0))).astype(np.uint8)
        for b in pl['billows']:
            if len(b) > 4 and b[4]:
                r = b[2]
                f = b[3] if b[3] else pl.get('flat', 1.0)
                D = disc_of(b)
                A = disc_of(b, -L[0] * s1 * r, -L[1] * s1 * r * f)
                B = disc_of(b, -L[0] * s2 * r, -L[1] * s2 * r * f)
                lab = np.where(D & ~A, 3, np.where(D & A & ~B, np.maximum(lab, 2), lab)).astype(np.uint8)
    if pl.get('base'):
        x0b, y0b, x1b, y1b = pl['base']  # the base line from (x0b, y0b) to (x1b, y1b)
        yb = y0b + (xx - x0b) * (y1b - y0b) / max(1e-3, (x1b - x0b))
        lab = np.where(yy > yb, 0, lab)
        under = (yy > yb - pl.get('under_px', 46)) & (lab > 0)
        lab = np.where(under & (lab == 3), 2, np.where(under, 1, lab)).astype(np.uint8)
    cov = cv2.resize((lab > 0).astype(np.float32), (bw, bh), interpolation=cv2.INTER_AREA)
    zones = [cv2.resize((lab == k).astype(np.float32), (bw, bh), interpolation=cv2.INTER_AREA) for k in (1, 2, 3)]
    cxs = cv2.resize(cxm, (bw, bh), interpolation=cv2.INTER_NEAREST)
    cys = cv2.resize(cym, (bw, bh), interpolation=cv2.INTER_NEAREST)
    return cov, zones, cxs, cys


def gradient_sky(spec_g, H, W, y0=0):
    """A designed sky: vertical stops [[y, hex], ...] mixed in OKLab, plus the low sun's warmth (xy, r, hex, k)."""
    ys = np.array([g[0] for g in spec_g['stops']], np.float32)
    cols = np.array([hex_lab(g[1]) for g in spec_g['stops']], np.float32)
    rows = np.arange(H, dtype=np.float32) + y0
    lab_rows = np.stack([np.interp(rows, ys, cols[:, k]) for k in range(3)], -1)
    lab = np.broadcast_to(lab_rows[:, None, :], (H, W, 3)).copy()
    if spec_g.get('sun'):
        sn = spec_g['sun']
        yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
        yy += y0
        w = np.clip(1 - np.hypot((xx - sn['xy'][0]) / sn.get('sx', 1.4), yy - sn['xy'][1]) / sn['r'], 0, 1) ** 1.6 * sn.get('k', 0.6)
        if spec_g.get('band_k') is not None:
            w = w * band_calm(H, y0, spec_g.get('band'), 46)[:, None] ** 0 * 1.0
        lab = lab + (hex_lab(sn['hex']) - lab) * w[..., None]
    return lab


def style_sky_designed(piece, spec, rng, stamps):
    H, W = piece.get('size', [1100, 1080])
    lab = gradient_sky(piece['gradient'], H, W)
    if DESIGN:
        return lab_to_rgb(lab), np.ones((H, W), np.float32), (0, 0), 0
    calm = band_calm(H, 0, spec.get('band'), 46)[:, None] * np.ones((1, W), np.float32)
    b = piece.get('broad', {})
    gentle = fbm(rng, H, W, b.get('vary_cell', 260), 3, aniso=2.5)
    lab = shift(lab, dL=b.get('vary', 0.006) * gentle * (0.3 + 0.7 * calm))
    diag = streak_noise(rng, H, W, math.radians(b.get('hatch_angle', -24)), b.get('hatch_along', 170), b.get('hatch_across', 1.6)) - 0.5
    lab = shift(lab, dL=b.get('hatch', 0.008) * diag * (0.15 + 0.85 * calm))
    out = lab_to_rgb(lab) * grain(rng, H, W, b.get('grain', 0.004))[..., None]
    return out, np.ones((H, W), np.float32), (0, 0), 0


def paint_designed_plane(pl, zones, cov, cxs, cys, cols, light, rng, seed, calm=None):
    """Paint one designed plane: the value masses as given, a few broad strokes inside each along its billow's form,
    firm edges where the light hits, soft dry-brush edges on the shade side, a sparse speckle there."""
    H, W = cov.shape
    b = pl.get('paint', {})
    tgt = sum(z[..., None] * c for z, c in zip(zones, cols)) / np.maximum(cov, 1e-4)[..., None]
    tgt = np.where(cov[..., None] > 1e-4, tgt, cols[1])
    # fill colours outward so soft edges and strokes sample the mass, never black
    tgt_f = fill_out(tgt, cov)
    tgt_f = shift(tgt_f, dL=b.get('vary', 0.007) * fbm(rng, H, W, b.get('vary_cell', 90), 3))
    # the edge by the light: the outward normal against the light
    cb = cv2.GaussianBlur(cov, (0, 0), 3)
    gy, gx = np.gradient(cb)
    gn = np.hypot(gx, gy) + 1e-6
    Ln = np.array(light, np.float32) / (np.linalg.norm(light) + 1e-8)
    facing = (-gx * Ln[0] - gy * Ln[1]) / gn  # +1 where the edge faces the light
    shade_side = 1 - smoothstep(-0.45, 0.15, facing)  # 1 where the edge turns away from the light
    soft = cv2.GaussianBlur(cov, (0, 0), b.get('soft_px', 4.5))
    alpha = cov * (1 - shade_side) + soft * shade_side
    # dry-brush break-up on the shade side only: patches (never combs) where the sky shows through
    band = np.clip(1 - np.abs(soft - 0.5) * 2.2, 0, 1)
    patches = fbm(rng, H, W, b.get('break_cell', 13), 3)
    alpha = alpha * (1 - shade_side * band * np.clip((patches + 0.15) * 2.2, 0, 1) * b.get('break_k', 0.75))
    # firm where the light hits: a whisper of break-up only
    fine = fbm(rng, H, W, 5, 2)
    alpha = alpha * (1 - (1 - shade_side) * np.clip(1 - np.abs(cov - 0.5) * 2, 0, 1) * np.clip(fine, 0, 1) * 0.35)
    if calm is not None:
        alpha = alpha * calm
    cv = Canvas(H, W)
    cv.wash(lab_to_rgb(tgt_f), alpha.astype(np.float32))
    stamps = make_flat_stamps(np.random.default_rng(seed * 11 + 5), side=tuple(b.get('side', (0.16, 0.28))), chisel=b.get('chisel', 0.05))
    zone_img = lab_to_rgb(tgt_f).astype(np.float32)
    n = 0
    # a few broad strokes inside each mass, along the billow's form (tangent to it), staying in their own mass
    w_lo, w_hi = b.get('width', (30, 60))
    count = int(b.get('strokes', 0.5) * float((cov > 0.6).sum()) / ((w_lo + w_hi) * 0.5) ** 2)
    pts = np.argwhere(cov > 0.85)
    clipm = alpha.astype(np.float32)
    for _ in range(count):
        if len(pts) == 0:
            break
        y, x = pts[int(rng.integers(len(pts)))]
        ang = math.atan2(y - (cys[y, x] - 0), x - cxs[y, x]) + math.pi / 2 if cxs[y, x] != 0 else 0.0
        lab = tgt_f[y, x] + np.array([rng.normal(0, b.get('jitter_L', 0.010)), rng.normal(0, 0.003), rng.normal(0, 0.004)])
        wdt = rng.uniform(w_lo, w_hi)
        cv.stamp(stamps[int(rng.integers(len(stamps)))], x, y, ang + rng.normal(0, 0.12), wdt * rng.uniform(*b.get('len', (1.6, 2.6))), wdt,
                 lab_to_rgb(lab[None])[0], rng.uniform(*b.get('op', (0.3, 0.5))), clipm, zone_img, b.get('tau', 0.05))
        n += 1
    # the DESIGNED strokes: a few broad strokes placed by hand along the form ([x, y, length, width, angle deg, zone
    # 1 shade | 2 mid | 3 lit, dL], frame px), each in its zone's colour a step lighter or deeper, kept in the mass
    for (sx, sy, sl, sw_, sa, sz, sdl) in b.get('designed_strokes', []):
        lab = cols[int(sz) - 1] + np.array([sdl, 0, 0])
        cv.stamp(stamps[n % len(stamps)], sx - b.get('_bx', 0), sy - b.get('_by', 0), math.radians(sa), sl, sw_, lab_to_rgb(lab[None])[0], b.get('designed_op', 0.6), clipm)
        n += 1
    # dry strokes along the shade-side edge (broken, along the edge, in the mass's colour)
    edge = np.argwhere((soft > 0.25) & (soft < 0.75) & (shade_side > 0.6))
    for _ in range(int(len(edge) * b.get('dry_edge', 0.01))):
        y, x = edge[int(rng.integers(len(edge)))]
        ang = math.atan2(gy[y, x], gx[y, x]) + math.pi / 2
        wdt = rng.uniform(*b.get('dry_width', (10, 22)))
        lab = tgt_f[y, x]
        cv.stamp(stamps[int(rng.integers(len(stamps)))], x, y, ang + rng.normal(0, 0.15), wdt * rng.uniform(2.0, 3.5), wdt, lab_to_rgb(lab[None])[0], rng.uniform(0.35, 0.6), None)
        n += 1
    if b.get('specks'):
        dout = ndimage.distance_transform_edt(cov < 0.5)
        zone = (np.clip(1 - dout / 26, 0, 1) * (cov < 0.5) * shade_side * 0.02).astype(np.float32)
        if calm is not None:
            zone *= calm
        n += speckle(cv, rng, zone, int(b['specks']), 0.7, 1.8, [lab_to_rgb(cols[1][None])[0]], (0.4, 0.8))
    out, a = cv.rgba()
    return out * grain(rng, H, W, b.get('grain', 0.005))[..., None], a, n


def style_designed(piece, spec, rng, stamps):
    """Designed planes (far to near), each its own image: the flat design (--design) or its painting."""
    FW, FH = spec['frame']
    light = piece.get('light', spec['light']['dir'])
    sky_lab = gradient_sky(piece['sky_gradient'], FH, FW) if piece.get('sky_gradient') else rgb_to_lab(load_flat(os.path.join(ROOT, piece['sky_flat']))[0])
    planes = sorted(piece['planes'], key=lambda q: -q['depth'])
    designs = []
    for pl in planes:
        designs.append(design_plane(pl, pl['box'], pl.get('light', light)))
    outs = []
    for j, (pl, (cov, zones, cxs, cys)) in enumerate(zip(planes, designs)):
        d = float(pl['depth'])
        bx, by, bw, bh = pl['box']
        x0, y0 = max(0, bx), max(0, by)
        x1, y1 = min(FW, bx + bw), min(FH, by + bh)
        sky_box = np.zeros((bh, bw, 3), np.float32)
        sky_box[y0 - by:y1 - by, x0 - bx:x1 - bx] = sky_lab[y0:y1, x0:x1]
        sky_mean = sky_box[cov > 0.5].mean(0) if (cov > 0.5).any() else sky_box.reshape(-1, 3).mean(0)
        pal = pl.get('palette', piece.get('palette'))
        conv = pl.get('conv', 0.8 * d)
        cols = [hex_lab(pal[k]) + (sky_mean - hex_lab(pal[k])) * conv for k in ('shade', 'mid', 'lit')]
        # the air: a lighter band of the sky's value along every nearer plane's edge
        nearer = np.zeros((FH, FW), np.float32)
        for k in range(j + 1, len(planes)):
            pk = planes[k]
            c_, _, _, _ = designs[k]
            kbx, kby, kbw, kbh = pk['box']
            ax0, ay0 = max(0, kbx), max(0, kby)
            ax1, ay1 = min(FW, kbx + kbw), min(FH, kby + kbh)
            nearer[ay0:ay1, ax0:ax1] = np.maximum(nearer[ay0:ay1, ax0:ax1], c_[ay0 - kby:ay1 - kby, ax0 - kbx:ax1 - kbx])
        calm = None
        if piece.get('calm_box'):
            cx0, cy0, cx1, cy1 = piece['calm_box']
            yy_, xx_ = np.mgrid[0:bh, 0:bw].astype(np.float32)
            xx_ += bx
            yy_ += by
            calm = (1 - np.clip((xx_ - cx0) / 40, 0, 1) * np.clip((cx1 - xx_) / 40, 0, 1) * np.clip((yy_ - cy0) / 40, 0, 1) * np.clip((cy1 - yy_) / 40, 0, 1)).astype(np.float32)
        if DESIGN:
            rgb = sum(z[..., None] * lab_to_rgb(c[None])[0] for z, c in zip(zones, cols)) / np.maximum(cov, 1e-4)[..., None]
            a = cov * (calm if calm is not None else 1)
            out = rgb
        else:
            pl = dict(pl, paint=dict(pl.get('paint', {}), _bx=bx, _by=by))
            out, a, n = paint_designed_plane(pl, zones, cov, cxs, cys, cols, pl.get('light', light), np.random.default_rng(int(piece['seed']) * 101 + j), int(piece['seed']) * 101 + j, calm)
        if nearer.max() > 0 and pl.get('air', True):
            dn = ndimage.distance_transform_edt(nearer < 0.5)[y0:y1, x0:x1]
            gap = np.zeros((bh, bw), np.float32)
            gap[y0 - by:y1 - by, x0 - bx:x1 - bx] = np.clip(1 - dn / piece.get('air_px', 12), 0, 1) * (nearer[y0:y1, x0:x1] < 0.5)
            air = lab_to_rgb((sky_mean + np.array([piece.get('air_dL', 0.04), 0, 0]))[None])[0]
            out = out * (1 - gap[..., None] * 0.9) + air * gap[..., None] * 0.9
        if piece.get('keep_flat'):
            # parts of the flat kept crisp under the design (a trunk): its pixels in this box, under the painted mass
            frgb, fa = load_flat(os.path.join(ROOT, piece['keep_flat']['flat']))
            keep = np.zeros((FH, FW), bool)
            for hx in piece['keep_flat']['colors']:
                keep |= (np.abs(frgb - hex_rgb(hx)[None, None, :]).sum(-1) < 0.12) & (fa > 0.5)
            kb = keep[y0:y1, x0:x1].astype(np.float32)
            kbox = np.zeros((bh, bw), np.float32)
            kbox[y0 - by:y1 - by, x0 - bx:x1 - bx] = kb
            krgb = np.zeros((bh, bw, 3), np.float32)
            krgb[y0 - by:y1 - by, x0 - bx:x1 - bx] = frgb[y0:y1, x0:x1]
            under = kbox * (1 - a)
            out = (out * a[..., None] + krgb * under[..., None]) / np.maximum(a + under, 1e-4)[..., None]
            a = np.clip(a + under, 0, 1)
        outs.append((f'p{j}' if len(planes) > 1 else None, out, a, (bx, by), 0, d))
    return outs


# ------------------------------------------------------------------ main

def paint_piece(piece, spec, preview=None):
    seed = int(piece['seed'])
    rng = np.random.default_rng(seed)
    stamps = make_stamps(np.random.default_rng(seed * 7 + 1))
    dabs = make_dabs(np.random.default_rng(seed * 7 + 2))
    DRY['stamps'] = make_stamps(np.random.default_rng(seed * 7 + 3), n=12, dry_range=(0.5, 0.85))
    st = piece['style']
    t0 = time.time()
    if st == 'designed':
        res = style_designed(piece, spec, rng, stamps)
        return [write_png(piece, spec, rng, out, a, x0, y0, n, t0, suffix=suf, depth=dep) for (suf, out, a, (x0, y0), n, dep) in res]
    if st == 'sky' and piece.get('gradient'):
        out, a, (x0, y0), n = style_sky_designed(piece, spec, rng, stamps)
        return [write_png(piece, spec, rng, out, a, x0, y0, n, t0)]
    if st == 'cloudscape':
        return [write_png(piece, spec, rng, out, a, x0, y0, n, t0, suffix=suf, depth=dep) for (suf, out, a, (x0, y0), n, dep) in style_cloudscape(piece, spec, rng, stamps)]
    if piece.get('brush') == 'broad':
        fn = {'sky': style_sky_broad, 'cloud': style_cloud_broad, 'foliage': style_flat_broad, 'surface': style_flat_broad}[st]
        out, a, (x0, y0), n = fn(piece, spec, rng, stamps)
    elif st == 'sky':
        out, a, (x0, y0), n = style_sky(piece, spec, rng, stamps)
    elif st == 'cloud':
        out, a, (x0, y0), n = style_cloud(piece, spec, rng, stamps)
    elif st in ('foliage', 'surface'):
        out, a, (x0, y0), n = style_flat_piece(piece, spec, rng, stamps, dabs)
    else:
        raise SystemExit(f'unknown style {st}')
    return [write_png(piece, spec, rng, out, a, x0, y0, n, t0)]


def write_png(piece, spec, rng, out, a, x0, y0, n, t0, suffix=None, depth=None):
    H, W = a.shape
    # 8-bit with a blue-ish dither (the strokes already break any banding; this keeps the sky's ramp smooth)
    dith = (rng.random((H, W, 1)) - 0.5) / 255
    rgba = np.concatenate([np.clip(out + dith, 0, 1), a[..., None]], -1)
    img = Image.fromarray((rgba * 255 + 0.5).astype(np.uint8), 'RGBA')
    name = piece['id'].split('/')[-1]
    rid = piece['id'] + (f'_{suffix}' if suffix else '')
    rel = os.path.join(spec['out'], f"{name}{'_' + suffix if suffix else ''}.png")
    img.save(os.path.join(ROOT, rel), optimize=True)
    src = os.path.relpath(rel, 'public') if rel.startswith('public/') else rel
    st = piece['style']
    seed = int(piece['seed'])
    row = {'id': rid, 'src': src, 'box': [int(x0), int(y0), int(W), int(H)], 'style': st, 'seed': seed, 'from': piece['id']}
    if suffix:
        row['group'] = name
        row['depth'] = float(depth)
    print(f"{rid:16s} {st:10s} seed {seed:4d}  box {row['box']}  {n:6d} strokes  {time.time() - t0:5.1f}s")
    return row


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('spec')
    ap.add_argument('--only', default='')
    ap.add_argument('--design', action='store_true', help="write the flat designed shapes (spec 'out_design')")
    args = ap.parse_args()
    spec = json.load(open(args.spec))
    global DESIGN
    DESIGN = args.design
    if DESIGN:
        spec['out'] = spec['out_design']
    os.makedirs(os.path.join(ROOT, spec['out']), exist_ok=True)
    man_path = os.path.join(ROOT, spec['out'], 'manifest.json')
    rows = {}
    if os.path.exists(man_path):
        for r in json.load(open(man_path)).get('pieces', []):
            rows.setdefault(r.get('from', r['id']), []).append(r)
    only = [s for s in args.only.split(',') if s]
    for piece in spec['pieces']:
        name = piece['id'].split('/')[-1]
        if only and piece['id'] not in only and name not in only:
            continue
        rows[piece['id']] = paint_piece(piece, spec)
    order = [p['id'] for p in spec['pieces']]
    man = {'film': spec['film'], 'spec': os.path.relpath(os.path.abspath(args.spec), ROOT), 'pieces': [r for i in order if i in rows for r in rows[i]]}
    with open(man_path, 'w') as f:
        json.dump(man, f, indent=1)
        f.write('\n')


if __name__ == '__main__':
    main()
