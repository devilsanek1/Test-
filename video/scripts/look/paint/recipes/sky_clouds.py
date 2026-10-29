#!/usr/bin/env python3
"""Sky and clouds: the painting recipe as code (docs/look/paint_recipes/sky_clouds.md).

A standalone, seeded proof. It paints every element of the sky family at the film's own scale
(px of a 1080 x 1920 frame: an October canal evening at King's Cross, a low sun on the left) and lays
each one beside the reference crops that show it:

    python3 video/scripts/look/paint/recipes/sky_clouds.py               # the swatch sheet
    python3 video/scripts/look/paint/recipes/sky_clouds.py --plate P.png  # + the 1080 x 900 sky plate alone
    python3 video/scripts/look/paint/recipes/sky_clouds.py --check        # + texture numbers vs the refs

Elements: the sky gradient (dusk, daylight), the near cumulus, banks and decks in depth planes, thin
horizon streaks, the sun and its glow, a far flock. Method (the owner's): design the flat shapes first in
one colour family lit by one light, then brush them in passes, big soft blurred strokes first, then
blocky flat-brush strokes along the form, then a few crisp strokes at the light edges; each plane softer
and blurrier the farther it is. All colour maths in OKLab. Every random draw comes from
np.random.default_rng([SEED, element, k]): the same seed gives the same PNG. numpy + PIL + scipy
(+ skimage for resizing and the CIELAB check numbers). Touches no other file.
"""
import argparse
import math
import os
import time

import numpy as np
from PIL import Image, ImageDraw, ImageFont
from scipy import ndimage as ndi
from scipy.interpolate import PchipInterpolator
from skimage.transform import resize as sk_resize

HERE = os.path.dirname(os.path.abspath(__file__))
VIDEO = os.path.abspath(os.path.join(HERE, '..', '..', '..', '..'))
LOOK = os.path.join(VIDEO, 'docs', 'look')
OUT = os.path.join(LOOK, 'paint_recipes', 'sky_clouds_swatch.png')
SEED = 20261029
FW = 1080                      # frame width: every size in this file is px of the 1080 x 1920 frame
PLATE_H = 900                  # the sky plate: the frame's top 900 px (sky to just under the horizon)
HORIZON = 792                  # the scene's horizon line (behind the far roofs)
SUN = (196.0, 779.0)           # the low sun, left, its lower part behind the far roofs
CAPTION = (317, 556)           # the caption band (LAYOUT.md section 1): calm, flat, no cloud behind the words


# ----------------------------------------------------------------------------------------------- colour
_M1 = np.array([[0.4122214708, 0.5363325363, 0.0514459929],
                [0.2119034982, 0.6806995451, 0.1073969566],
                [0.0883024619, 0.2817188376, 0.6299787005]])
_M2 = np.array([[0.2104542553, 0.7936177850, -0.0040720468],
                [1.9779984951, -2.4285922050, 0.4505937099],
                [0.0259040371, 0.7827717662, -0.8086757660]])
_M1i, _M2i = np.linalg.inv(_M1), np.linalg.inv(_M2)


def srgb_to_lin(c):
    c = np.asarray(c, np.float64)
    return np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)


def lin_to_srgb(c):
    c = np.clip(c, 0.0, 1.0)
    return np.where(c <= 0.0031308, 12.92 * c, 1.055 * np.power(c, 1 / 2.4) - 0.055)


def rgb2ok(rgb):
    return np.cbrt(srgb_to_lin(rgb) @ _M1.T) @ _M2.T


def ok2rgb(lab):
    lms = np.asarray(lab, np.float64) @ _M2i.T
    return lin_to_srgb((lms ** 3) @ _M1i.T)


def hx(h):
    h = h.lstrip('#')
    return rgb2ok(np.array([int(h[i:i + 2], 16) for i in (0, 2, 4)]) / 255.0).astype(np.float32)


def to_hex(lab):
    r = np.clip(np.round(ok2rgb(lab) * 255), 0, 255).astype(int)
    return '#%02x%02x%02x' % tuple(r)


def mix(a, b, t):
    return a + (b - a) * t


def lift(c, dL=0.0, da=0.0, db=0.0):
    return (np.asarray(c, np.float32) + np.array([dL, da, db], np.float32)).astype(np.float32)


# The scene's limited palette (14 colours), sampled from the approved v4 design's light (one dusk family lit by
# the low sun) and fitted to CRAFT section g (zenith a touch deeper, the caption field flat, the light band the
# sky's lightest, the cool-to-warm crossing at low chroma; the disc one flat step off its band, no halo).
DUSK = {k: hx(v) for k, v in {
    'zenith': '#cfc6e1',   # lavender, a touch deeper and cooler than the caption field
    'field': '#d6cce3',    # the caption field lilac, flat through y 317-556
    'rose': '#e2d0dc',     # rose-lilac under the band
    'band': '#efdcd3',     # the light band: the sky's lightest step, the cool-warm crossing at low chroma
    'horizon': '#efd6c4',  # the warm horizon = the far AIR
    'glow': '#f9d9b4',     # the sun's warmth (an ellipse, never in the caption band)
    'sun': '#fff2d9',      # the disc: one flat step over its band
    'rim': '#fee9c6',      # cloud rim, the lightest cloud value (thin edges toward the sun): sky +11 L*
    'lit': '#f7d9b7',      # cloud lit, peach-gold: sky +6 L*
    'mid': '#ebc6bf',      # cloud half-light, rose-peach AT the sky's value (a hue step, not a value step)
    'shade': '#cbbbd5',    # cloud shade, lilac, sky -4..-6 L* (skylit tops get this end)
    'deep': '#bba9cb',     # cloud accent: undersides away from the sky; small areas only, sky -10
    'streak': '#e9c9c4',   # horizon streak body (rose), band -5 L*; its lit underside takes 'glow'
    'bird': '#5d4d76',     # the far flock
}.items()}

DAY = {k: hx(v) for k, v in {
    'zenith': '#b8cfe0', 'field': '#c2d6e3', 'rose': '#cfdee5', 'band': '#dfe7e6', 'horizon': '#e5e8e1',
    'glow': '#f3efe0', 'sun': '#fffbef',
    'rim': '#fdfcf7', 'lit': '#f4f3ed', 'mid': '#e0e4ea', 'shade': '#bfc8d8', 'deep': '#a8b3c9',
    'streak': '#d9e1e6', 'bird': '#55606f',
}.items()}


# ------------------------------------------------------------------------------------------- utilities
def smoothstep(e0, e1, x):
    t = np.clip((x - e0) / (e1 - e0), 0.0, 1.0)
    return t * t * (3.0 - 2.0 * t)


def smootherstep(e0, e1, x):
    t = np.clip((x - e0) / (e1 - e0), 0.0, 1.0)
    return t * t * t * (t * (t * 6.0 - 15.0) + 10.0)


def rs(a, shape):
    """Bilinear resize of a float array (h, w[, c]) to shape (h, w)."""
    out_shape = tuple(shape) + tuple(a.shape[2:])
    return sk_resize(a, out_shape, order=1, mode='edge', anti_aliasing=False, preserve_range=True).astype(np.float32)


def gauss(x, s):
    """Gaussian blur over the first two axes; a large sigma runs on a downsampled copy (same look, less CPU)."""
    if s <= 0:
        return x
    extra = (0,) * (x.ndim - 2)
    if s < 6:
        return ndi.gaussian_filter(x, (s, s) + extra, mode='nearest').astype(np.float32)
    f = s / 3.0
    h, w = x.shape[:2]
    small = sk_resize(x, (max(2, int(h / f)), max(2, int(w / f))) + tuple(x.shape[2:]), order=1, mode='edge',
                      anti_aliasing=True, preserve_range=True)
    small = ndi.gaussian_filter(small, (3.0, 3.0) + extra, mode='nearest')
    return rs(small, (h, w))


def noise(rng, h, w, cell, aniso=1.0, angle=0.0):
    """Zero-mean, unit-std smooth noise: white noise blurred at `cell` px, stretched x`aniso` along `angle` deg."""
    f = max(1.0, cell / 4.0)
    n = int(math.ceil(math.hypot(h, w) / f)) + 8
    g = rng.standard_normal((n, n)).astype(np.float32)
    g = ndi.gaussian_filter(g, (cell / f, cell * aniso / f), mode='wrap')
    if angle:
        g = ndi.rotate(g, -angle, reshape=False, order=1, mode='wrap')
    hh, ww = int(math.ceil(h / f)) + 1, int(math.ceil(w / f)) + 1
    y0, x0 = (n - hh) // 2, (n - ww) // 2
    g = rs(g[y0:y0 + hh, x0:x0 + ww], (h, w))
    return ((g - g.mean()) / (g.std() + 1e-9)).astype(np.float32)


_TEX = {}


def bristle_tex():
    """The dry-brush texture, in stroke space: rows = across (px), cols = along (px); uniform 0..1, streaky along."""
    if 'b' not in _TEX:
        rng = np.random.default_rng([SEED, 999])
        g = rng.random((256, 2048)).astype(np.float32)
        g = ndi.gaussian_filter(g, (0.7, 14.0), mode='wrap')
        g += 0.6 * ndi.gaussian_filter(rng.random((256, 2048)).astype(np.float32), (3.0, 60.0), mode='wrap')
        r = np.argsort(np.argsort(g.ravel())).reshape(g.shape)
        _TEX['b'] = (r / r.size).astype(np.float32)
    return _TEX['b']


def sample_tex(along, across):
    t = bristle_tex()
    return ndi.map_coordinates(t, [across, along], order=1, mode='wrap').astype(np.float32)


# ------------------------------------------------------------------------------------------ the canvas
class Layer:
    """A paint layer: OKLab colour with straight alpha."""

    def __init__(self, h, w, lab=None, alpha=0.0):
        self.h, self.w = h, w
        self.c = np.zeros((h, w, 3), np.float32)
        if lab is not None:
            self.c[...] = lab
        self.a = np.full((h, w), alpha, np.float32)

    def over(self, sl, cov, col):
        a0, c0 = self.a[sl], self.c[sl]
        ao = cov + a0 * (1.0 - cov)
        t = np.where(ao > 1e-6, cov / np.maximum(ao, 1e-6), 0.0).astype(np.float32)
        self.c[sl] = c0 + (np.asarray(col, np.float32) - c0) * t[..., None]
        self.a[sl] = ao

    def blur(self, s):
        if s <= 0:
            return self
        pre = gauss(self.c * self.a[..., None], s)
        a = gauss(self.a, s)
        ok = a > 1e-4
        self.c = np.where(ok[..., None], pre / np.maximum(a, 1e-4)[..., None], self.c).astype(np.float32)
        self.a = a.astype(np.float32)
        return self

    def onto(self, dst, x0=0, y0=0):
        dst.over((slice(y0, y0 + self.h), slice(x0, x0 + self.w)), self.a, self.c)

    def rgb(self, dither_seed=None):
        lab = self.c.astype(np.float64)
        rgb = ok2rgb(lab.reshape(-1, 3)).reshape(self.h, self.w, 3) * 255.0
        if dither_seed is not None:   # TPDF dither of +-1 code at the 8-bit step: no banding in the soft passes
            rng = np.random.default_rng([SEED, dither_seed])
            rgb += rng.random(rgb.shape) - rng.random(rgb.shape)
        return np.clip(np.round(rgb), 0, 255).astype(np.uint8)


# ------------------------------------------------------------------------------------------ the brushes
def _box(xmin, ymin, xmax, ymax, H, W):
    x0, y0 = max(0, int(math.floor(xmin))), max(0, int(math.floor(ymin)))
    x1, y1 = min(W, int(math.ceil(xmax)) + 1), min(H, int(math.ceil(ymax)) + 1)
    if x1 <= x0 or y1 <= y0:
        return None
    Y, X = np.mgrid[y0:y1, x0:x1].astype(np.float32)
    return (slice(y0, y1), slice(x0, x1)), X + 0.5, Y + 0.5


def line_uv(p0, p1, pad, H, W):
    """A straight stroke's own frame: u along (0..1), s across (px; + is to the right of travel)."""
    (x0, y0), (x1, y1) = p0, p1
    b = _box(min(x0, x1) - pad, min(y0, y1) - pad, max(x0, x1) + pad, max(y0, y1) + pad, H, W)
    if b is None:
        return None
    sl, X, Y = b
    dx, dy = x1 - x0, y1 - y0
    L = max(1e-3, math.hypot(dx, dy))
    tx, ty = dx / L, dy / L
    px, py = X - x0, Y - y0
    return sl, (px * tx + py * ty) / L, (py * tx - px * ty), L


def arc_uv(c, R, a0, a1, pad, H, W):
    """An arc stroke's own frame (centre c, radius R, from angle a0 to a1, radians, image y down):
    u along (0..1), s across (px; + outside the circle, the convex side)."""
    cx, cy = c
    ang = np.linspace(a0, a1, 32)
    xs, ys = cx + R * np.cos(ang), cy + R * np.sin(ang)
    b = _box(xs.min() - pad, ys.min() - pad, xs.max() + pad, ys.max() + pad, H, W)
    if b is None:
        return None
    sl, X, Y = b
    span = a1 - a0
    d = np.mod((np.arctan2(Y - cy, X - cx) - a0) * np.sign(span), 2 * np.pi)
    d = np.where(d > np.pi + abs(span) / 2, d - 2 * np.pi, d)
    return sl, d / abs(span), np.hypot(X - cx, Y - cy) - R, abs(span) * R


def stroke_cov(u, s, L, w, e_pos=1.0, e_neg=1.0, t_in=0.12, t_out=0.25, taper_w=0.0, dry=0.0, tex_off=(0.0, 0.0),
               round_=False):
    """Coverage (0..1) of one stroke in its own frame.
    w: width (px); e_pos / e_neg: edge softness (px) on the +s / -s side (asymmetric: one crisp edge, one soft);
    t_in / t_out: fraction of the length over which the stroke fades in / out; taper_w: how much the two ends thin
    (a pressure curve); dry: 0 = loaded brush, 1 = nearly dry (the bristle texture breaks the stroke, more toward
    its tail); round_: a soft round brush (Gaussian across) instead of the flat chisel."""
    if taper_w > 0:
        wu = w * (1.0 - taper_w + taper_w * np.sqrt(np.clip(np.sin(np.pi * np.clip(u, 0.0, 1.0)), 0.0, 1.0)))
    else:
        wu = w
    if round_:
        across = np.exp(-0.5 * (s / (0.32 * wu)) ** 2)
    else:
        h = wu * 0.5
        across = smoothstep(h + e_pos, h - e_pos, s) * smoothstep(-h - e_neg, -h + e_neg, s)
    cov = across * smoothstep(0.0, max(t_in, 1e-3), u) * smoothstep(1.0, 1.0 - max(t_out, 1e-3), u)
    if dry > 0:
        T = sample_tex(np.clip(u, -0.2, 1.2) * L + tex_off[1], s + tex_off[0])
        th = dry * (0.25 + 0.75 * np.clip(u, 0.0, 1.0) ** 1.5)
        cov = cov * smoothstep(th - 0.1, th + 0.1, T)
    return cov.astype(np.float32)


def paint_line(layer, p0, p1, w, col, op, **kw):
    r = line_uv(p0, p1, w + 4, layer.h, layer.w)
    if r is not None:
        sl, u, s, L = r
        layer.over(sl, stroke_cov(u, s, L, w, **kw) * op, col)


def paint_arc(layer, c, R, a0, a1, w, col, op, **kw):
    r = arc_uv(c, R, a0, a1, w + 4, layer.h, layer.w)
    if r is not None:
        sl, u, s, L = r
        layer.over(sl, stroke_cov(u, s, L, w, **kw) * op, col)


def paint_speck(layer, x, y, r, col, op):
    b = _box(x - r - 2, y - r - 2, x + r + 2, y + r + 2, layer.h, layer.w)
    if b is not None:
        sl, X, Y = b
        layer.over(sl, (np.clip(r + 0.5 - np.hypot(X - x, Y - y), 0.0, 1.0) * op).astype(np.float32), col)


def tex_off(rng):
    return (float(rng.uniform(0, 256)), float(rng.uniform(0, 2048)))


# ------------------------------------------------------------------------------------------- the sky
def sky_ramp(pal, H, style):
    """The designed gradient: key colours at heights (px), one monotone cubic per OKLab channel (no stop line,
    no overshoot). Dusk: zenith a touch deeper, the caption field flat, the light band the lightest, the warm
    horizon. Daylight: a gentle lift and warming toward the horizon."""
    if style == 'dusk':
        stops = [(0, pal['zenith']), (CAPTION[0], pal['field']), (CAPTION[1], pal['field']),
                 (650, pal['rose']), (735, pal['band']), (HORIZON, pal['horizon']), (H, pal['horizon'])]
    else:
        stops = [(0, pal['zenith']), (CAPTION[0], pal['field']), (CAPTION[1], pal['field']),
                 (690, pal['rose']), (HORIZON - 20, pal['band']), (HORIZON, pal['horizon']), (H, pal['horizon'])]
    ys = np.array([s[0] for s in stops], np.float64)
    cs = np.array([s[1] for s in stops], np.float64)
    f = PchipInterpolator(ys, cs, axis=0)
    return f(np.arange(H) + 0.5).astype(np.float32)


def sun_warmth(H, W, sun, rx, ry, top_cut):
    """The sun is part of the sky: a low, wide ellipse of warmth (ry ~0.45 rx), gone at its rim with a
    smootherstep (no edge, no ring), cut off above `top_cut` (never in the caption band)."""
    Y, X = np.mgrid[0:H, 0:W].astype(np.float32) + 0.5
    r = np.hypot((X - sun[0]) / rx, (Y - sun[1]) / ry)
    return (smootherstep(1.0, 0.0, r) * smoothstep(top_cut, top_cut + 90.0, Y)).astype(np.float32)


def paint_sky(H, W, pal, style, rng, sun=SUN, glow=0.55, grain=1.0):
    """The sky: (a) the designed gradient + the sun's warmth, (b) big soft strokes of the neighbouring colour,
    blurred (colour moving within the calm), (c) a faint brush grain of long thin dry strokes at the wind
    angle, (d) [daylight posters only] a fine paper tooth. Returns the opaque sky Layer."""
    ramp = sky_ramp(pal, H, style)
    sky = Layer(H, W, alpha=1.0)
    sky.c[...] = ramp[:, None, :]
    calm = np.ones(H, np.float32)          # the caption band keeps 30 % of the variation (CRAFT: band flat)
    calm[CAPTION[0] - 30:CAPTION[1] + 30] = 0.3
    if style == 'dusk':
        g = sun_warmth(H, W, sun, 0.44 * FW, 0.45 * 0.44 * FW, CAPTION[1]) * glow
        sky.c[...] = sky.c + (pal['glow'] - sky.c) * g[..., None]
    # (b) big soft strokes: 18 long round strokes, width 140-280, opacity 0.30-0.45, then blur sigma 26
    p1 = Layer(H, W)
    for i in range(18):
        y = rng.uniform(0, H)
        x = rng.uniform(-0.3, 0.7) * W
        L = rng.uniform(0.5, 1.2) * W
        ang = math.radians(rng.normal(-4, 2))
        w = rng.uniform(140, 280)
        yi = int(np.clip(y, 0, H - 1))
        base = sky.c[yi, int(np.clip(x + L / 2, 0, W - 1))]
        dl = rng.choice([-1, 1]) * rng.uniform(0.004, 0.008) * calm[yi]
        col = lift(base, dl, rng.normal(0, 0.003) * calm[yi], rng.normal(0, 0.003) * calm[yi])
        paint_line(p1, (x, y), (x + L * math.cos(ang), y + L * math.sin(ang)), w, col, rng.uniform(0.30, 0.45),
                   round_=True, t_in=0.3, t_out=0.3)
    p1.blur(26).onto(sky)
    # (b2) mid-scale soft strokes: 40 round strokes, width 40-90, +-0.8..1.3 L, opacity 0.3-0.45, blur 6
    p1b = Layer(H, W)
    for i in range(40):
        y, x = rng.uniform(0, H), rng.uniform(-0.2, 0.9) * W
        L = rng.uniform(0.25, 0.6) * W
        ang = math.radians(rng.normal(-5, 3))
        yi = int(np.clip(y, 0, H - 1))
        col = lift(sky.c[yi, int(np.clip(x + L / 2, 0, W - 1))],
                   rng.choice([-1, 1]) * rng.uniform(0.008, 0.013) * calm[yi])
        paint_line(p1b, (x, y), (x + L * math.cos(ang), y + L * math.sin(ang)), rng.uniform(40, 90), col,
                   rng.uniform(0.3, 0.45), round_=True, t_in=0.3, t_out=0.4)
    p1b.blur(6).onto(sky)
    # (c) the brush grain: 300 long thin dry strokes, width 6-20, length 160-620, +-1.1..1.7 L, blur 0.7
    p2 = Layer(H, W)
    wind = -7.0 if style == 'dusk' else -2.0
    for i in range(int(300 * grain)):
        y = rng.uniform(-20, H)
        x = rng.uniform(-200, W)
        L = rng.uniform(160, 620)
        ang = math.radians(wind + rng.normal(0, 2.5))
        w = rng.uniform(6, 20)
        xc, yc = int(np.clip(x + L / 2, 0, W - 1)), int(np.clip(y, 0, H - 1))
        dl = rng.choice([-1, 1]) * rng.uniform(0.011, 0.017) * calm[yc]
        col = lift(sky.c[yc, xc], dl)
        paint_line(p2, (x, y), (x + L * math.cos(ang), y + L * math.sin(ang)), w, col, rng.uniform(0.45, 0.7),
                   e_pos=1.2, e_neg=1.2, t_in=0.15, t_out=0.45, dry=rng.uniform(0.35, 0.6), tex_off=tex_off(rng))
    p2.blur(0.7)
    patch = smoothstep(-0.25, 0.9, noise(rng, H, W, 120, aniso=2.5, angle=-6.0))   # grain in patches, never even
    p2.a *= (0.15 + 0.85 * patch).astype(np.float32)
    p2.onto(sky)
    if style == 'day':   # (d) the posters' paper tooth: +-0.35 L fine, very slightly streaky
        n = noise(rng, H, W, 0.9, aniso=2.5, angle=90.0) * 0.0035
        sky.c[..., 0] += n
    return sky


# ------------------------------------------------------------------------------------- masses (clouds)
def smax(a, b, k):
    h = np.clip(0.5 + 0.5 * (a - b) / k, 0.0, 1.0)
    return a * h + b * (1.0 - h) + k * h * (1.0 - h)


def smin(a, b, k):
    return -smax(-a, -b, k)


def norm_sdf(d):
    gy, gx = np.gradient(d)
    return d / np.maximum(np.hypot(gx, gy), 0.35)


def mass_sdf(X, Y, lobes, k, base_y=None, base_soft=30.0, wob=None):
    """Signed distance (px, + inside) of a designed mass: a smooth union of lobes (cx, cy, r, flat), optionally
    cut by a level base line (the bases of one cloud layer share one height)."""
    d = None
    for n_, (cx, cy, r, fl) in enumerate(lobes):
        # each billow a little irregular: its radius wobbles +-5 % round the lobe (3 slow harmonics, seeded by index)
        th = np.arctan2((Y - cy) / fl, X - cx)
        ph = np.random.default_rng([SEED, 77, n_]).uniform(0, 2 * np.pi, 3)
        rr = r * (1.0 + 0.05 * (0.6 * np.sin(2 * th + ph[0]) + 0.3 * np.sin(3 * th + ph[1]) + 0.25 * np.sin(5 * th + ph[2])))
        di = rr - np.hypot(X - cx, (Y - cy) / fl)
        d = di if d is None else smax(d, di, k)
    d = norm_sdf(d)
    if base_y is not None:
        db = (base_y - Y) + (wob if wob is not None else 0.0)
        d = smin(d, db, base_soft)
    return d.astype(np.float32)


def light_dir(c, sun, top=0.25):
    """The one light: from a point toward the sun's image position, with a little sky-dome light from above."""
    v = np.array([sun[0] - c[0], sun[1] - c[1]], np.float64)
    v /= np.linalg.norm(v) + 1e-9
    v = (1 - top) * v + top * np.array([0.0, -1.0])
    return v / (np.linalg.norm(v) + 1e-9)


def light_depth(mask, l2, step, n):
    """How much cloud lies between each pixel and the light (px): march the mask toward the light."""
    acc = np.zeros_like(mask)
    for k in range(1, n + 1):
        acc += ndi.shift(mask, (-l2[1] * step * k, -l2[0] * step * k), order=1, mode='constant', cval=0.0)
    return acc * step


def ramp4(stops, t):
    """Colour along 4+ stops at t in [0, 1] (stops evenly spaced), smooth, in OKLab."""
    n = len(stops) - 1
    t = np.clip(t, 0.0, 1.0) * n
    i = np.minimum(np.floor(t).astype(int), n - 1)
    f = smoothstep(0.0, 1.0, t - i)[..., None]
    S = np.asarray(stops, np.float32)
    return S[i] + (S[i + 1] - S[i]) * f


def fill_out(c, inside):
    """Colour outside a shape = the colour of the nearest inside pixel, so soft and dry edges fade in the
    edge's own colour (never darken toward an undefined outside)."""
    if inside.all() or not inside.any():
        return c
    _, (iy, ix) = ndi.distance_transform_edt(~inside, return_indices=True)
    return c[iy, ix]


def longest_run(flags):
    best, cur = (0, 0), 0
    for k, f in enumerate(flags):
        cur = cur + 1 if f else 0
        if cur > best[1] - best[0]:
            best = (k - cur + 1, k + 1)
    return best


def inner_arcs(lobes, order, d, x0, y0, l2, max_n):
    """The billow edges inside a mass: for each front lobe (front = later in `order`), the longest lit-facing
    arc of its circle that lies over a lobe behind it and well inside the outline. Returns (lobe, a0, a1)."""
    h, w = d.shape
    a_l = math.atan2(l2[1], l2[0])
    res = []
    for zi in range(len(order) - 1, 0, -1):
        i = order[zi]
        cx, cy, r, fl = lobes[i]
        if fl < 0.75 or r < 24:
            continue
        behind = [lobes[j] for j in order[:zi]]
        angs = a_l + np.linspace(-1.5, 1.5, 49)
        ok = []
        for a in angs:
            px_, py_ = cx + (r + 3) * math.cos(a), cy + (r + 3) * math.sin(a)
            ix, iy = int(px_ - x0), int(py_ - y0)
            ok.append(0 <= iy < h and 0 <= ix < w and d[iy, ix] > 10 and
                      any(math.hypot(px_ - bx, (py_ - by) / bf) < br - 3 for (bx, by, br, bf) in behind))
        b0, b1 = longest_run(ok)
        if b1 - b0 >= 6:
            res.append((i, float(angs[b0]), float(angs[b1 - 1])))
        if len(res) >= max_n:
            break
    return res


def paint_mass(box, lobes, pal, sky, rng, prm, sun=SUN):
    """One cloud plane, designed then painted. box = (x0, y0, x1, y1) in plate px.
    Returns (Layer over the box, the flat design over the box (OKLab), the mask, info).
    prm: the plane's numbers from DEPTH (near / mid / far)."""
    x0, y0, x1, y1 = box
    h, w = y1 - y0, x1 - x0
    Y, X = np.mgrid[y0:y1, x0:x1].astype(np.float32) + 0.5
    size = max(r for (_, _, r, _) in lobes)
    wob = noise(rng, h, w, 40, aniso=4.0) * prm['base_wobble']
    d = mass_sdf(X, Y, lobes, prm['k_smooth'], prm.get('base_y'), prm['base_soft'], wob)
    holes = ndi.binary_fill_holes(d > 0) & (d <= 0)         # slivers of sky trapped between lobes: fill them
    d = np.where(holes, 14.0, d).astype(np.float32)
    M = smoothstep(-1.0, 1.0, d)
    inside = M > 0.5
    cen = np.array([(X * M).sum() / M.sum(), (Y * M).sum() / M.sum()])
    l2 = light_dir(cen, sun, prm['top_light'])
    # ---- (a) DESIGN: ONE smooth big form from one light (never a value zone per lobe: that draws crescents) ----
    sf = prm['form_sigma'] * size
    Mb = gauss(M, sf)
    gy, gx = np.gradient(Mb)
    gn = np.hypot(gx, gy) + 1e-6
    e = smoothstep(0.0, 1.0, gn * sf * 2.5)
    facing_g = (-gx * l2[0] - gy * l2[1]) / gn
    step = size * 0.05
    od = gauss(light_depth(M, l2, step=step, n=26), step * 1.5)
    att = np.exp(-od / (prm['penetration'] * size))
    F = prm['w_att'] * att + (1 - prm['w_att']) * (0.5 + 0.5 * facing_g * e)
    # soft lobe bulges (front lobe wins; lobes away from the light sit in front): gentle roundness, no crisp edge
    order = sorted(range(len(lobes)), key=lambda i: -np.dot(np.array(lobes[i][:2]) - cen, l2))
    B = np.full((h, w), 0.5, np.float32)
    for i in order:
        cx, cy, r, fl = lobes[i]
        nx, ny = (X - cx) / r, (Y - cy) / (r * fl)
        di = r - np.hypot(X - cx, (Y - cy) / fl)
        lam = 0.5 + 0.5 * np.clip(nx * l2[0] + ny * l2[1], -1, 1)
        cov = smoothstep(-0.1 * r, 0.35 * r, di)
        B = B + (lam - B) * cov
    if inside.any():
        lo, hi = np.percentile(F[inside], [3, 97])
        F = (F - lo) / max(hi - lo, 1e-3)
    F = np.clip(F + prm['bulge'] * (B - 0.5) * 2.0, 0.0, 1.0).astype(np.float32)
    skyl = np.clip(0.5 + 0.5 * (gy / gn) * e, 0.0, 1.0)          # top-facing: the sky dome lights the shade
    shade_top = mix(pal['shade'], pal['field'], 0.35)            # the shade's skylit top: toward the sky's own lilac
    shade_c = mix(pal['deep'][None, None], shade_top[None, None], skyl[..., None])
    # the continuous plan (for picking stroke colours) and the flat design: 3 values
    c1, c2 = prm['cuts']
    sc_ = prm['soft_cut']
    t_mid = smoothstep(c1 - sc_, c1 + sc_, F)[..., None]
    t_lit = smoothstep(c2 - sc_, c2 + sc_, F)[..., None]
    cont = shade_c + (pal['mid'] - shade_c) * t_mid
    cont = cont + (pal['lit'] - cont) * t_lit
    q = np.digitize(F, prm['cuts'])
    flat = np.where((q == 0)[..., None], shade_c, np.where((q == 1)[..., None], pal['mid'], pal['lit']))
    flat = fill_out(flat.astype(np.float32), inside)
    cont = fill_out(cont.astype(np.float32), inside)
    # ---- (b) PAINT passes on an opaque colour canvas over the box ----
    canvas = Layer(h, w, alpha=1.0)
    canvas.c[...] = gauss(flat, prm['base_blur'])                 # P0: the flats, brushed soft
    # P1: big soft round strokes laid ALONG the form (the iso-lines of F), colours from the plan, then blurred
    p1 = Layer(h, w)
    gFy, gFx = np.gradient(gauss(F, 6.0))
    ys_in, xs_in = np.nonzero(inside)
    for _ in range(prm['n_soft'] if len(xs_in) else 0):
        j = rng.integers(len(xs_in))
        cx, cy = float(xs_in[j]), float(ys_in[j])
        ang = math.atan2(gFx[ys_in[j], xs_in[j]], -gFy[ys_in[j], xs_in[j]]) if abs(gFx[ys_in[j], xs_in[j]]) + abs(gFy[ys_in[j], xs_in[j]]) > 1e-4 else math.radians(prm['wind'])
        L = rng.uniform(0.5, 1.2) * size
        col = lift(cont[ys_in[j], xs_in[j]], rng.normal(0, 0.006), rng.normal(0, 0.003), rng.normal(0, 0.003))
        paint_line(p1, (cx - L / 2 * math.cos(ang), cy - L / 2 * math.sin(ang)),
                   (cx + L / 2 * math.cos(ang), cy + L / 2 * math.sin(ang)), rng.uniform(0.3, 0.55) * size, col,
                   rng.uniform(0.25, 0.45), round_=True, t_in=0.35, t_out=0.35)
    p1.blur(prm['p1_blur']).onto(canvas)
    # P2: blocky flat-brush strokes along the form: arcs on the billows (convex edge crisp, concave side soft),
    # level strokes on flattened banks; a touch lighter than the plan on the lit half, darker on the shade half
    p2 = Layer(h, w)
    a_l = math.atan2(l2[1], l2[0])
    for i in order:
        cx, cy, r, fl = lobes[i]
        nb = int(round(prm['n_block'] * (r / size) ** 0.6))
        for _ in range(nb):
            if fl < 0.75:
                sx = cx + rng.uniform(-0.9, 0.9) * r
                sy = cy + rng.uniform(-0.55, 0.45) * r * fl
                ix, iy = int(sx - x0), int(sy - y0)
                if not (0 <= iy < h and 0 <= ix < w) or d[iy, ix] < 3:
                    continue
                L = rng.uniform(0.5, 1.2) * r
                ang = math.radians(prm['wind'] + rng.normal(0, 2.5))
                lit_side = F[iy, ix] > 0.5
                col = lift(cont[iy, ix], (0.012 if lit_side else -0.008) + rng.normal(0, 0.004))
                bw = rng.uniform(*prm['block_w']) * 0.6
                paint_line(p2, (ix - L / 2 * math.cos(ang), iy - L / 2 * math.sin(ang)),
                           (ix + L / 2 * math.cos(ang), iy + L / 2 * math.sin(ang)), bw, col, rng.uniform(0.45, 0.75),
                           e_pos=2.0, e_neg=0.8, t_in=0.03, t_out=0.4, dry=rng.uniform(0.1, 0.35), tex_off=tex_off(rng))
                continue
            R = r * rng.uniform(0.55, 0.92)
            am = a_l + rng.normal(0, 0.9)
            span = rng.uniform(0.45, 1.1)
            px_, py_ = cx + R * math.cos(am), cy + R * fl * math.sin(am)
            ix, iy = int(px_ - x0), int(py_ - y0)
            if not (0 <= iy < h and 0 <= ix < w) or d[iy, ix] < 4:
                continue
            toward = math.cos(am - a_l)                      # +1 on the lobe's lit side
            if toward < -0.2:                                # no flat-brush arcs on the shade half: they draw rings
                continue
            col = lift(cont[iy, ix], prm['block_lift'] * max(toward, 0) - 0.004 * max(-toward, 0) + rng.normal(0, 0.003),
                       rng.normal(0, 0.002), rng.normal(0, 0.002))
            bw = rng.uniform(*prm['block_w'])
            crisp = 0.9 if toward > 0 else 2.5             # crisp flat-brush edges only on the lit half
            paint_arc(p2, (cx - x0, cy - y0), R, am - span / 2, am + span / 2, bw, col, rng.uniform(0.4, 0.7),
                      e_pos=crisp, e_neg=bw * 0.45, t_in=0.08, t_out=0.4, taper_w=0.45, dry=rng.uniform(0.0, 0.25),
                      tex_off=tex_off(rng))
    # the billow edges INSIDE the mass: where a front lobe lies over the lobes behind it, its lit-facing arc gets one
    # light stroke on its own side, crisp at the edge and soft inward (no dark line beside it: that draws a ring)
    for (i, a0, a1) in inner_arcs(lobes, order, d, x0, y0, l2, prm['n_inner']):
        cx, cy, r, fl = lobes[i]
        am = 0.5 * (a0 + a1)
        mx_, my_ = int(cx + (r * 0.85) * math.cos(am) - x0), int(cy + (r * 0.85) * math.sin(am) - y0)
        if not (0 <= my_ < h and 0 <= mx_ < w):
            continue
        lw = rng.uniform(*prm['inner_w']) * (0.6 + 0.4 * r / size)
        paint_arc(p2, (cx - x0, cy - y0), r - lw * 0.5, a0, a1, lw, lift(cont[my_, mx_], prm['inner_lift']),
                  rng.uniform(0.55, 0.8), e_pos=0.9, e_neg=lw * 0.85, t_in=0.3, t_out=0.35, taper_w=0.75)
    p2.blur(prm['p2_blur']).onto(canvas)
    # P3: a few crisp strokes at the light edges: rims on the outer silhouette's lit arcs (outer edge crisp ON the
    # outline, inner edge soft, both ends tapered: one crisp edge, never a two-edged crescent)
    p3 = Layer(h, w)
    nrim = 0
    cand = [i for i in order[::-1] if lobes[i][3] >= 0.75 and lobes[i][2] >= prm['rim_min_r']]
    cand.sort(key=lambda i: -np.dot(np.array(lobes[i][:2]) - cen, l2))       # most sun-facing lobes first
    for i in cand:
        if nrim >= prm['n_rim']:
            break
        cx, cy, r, fl = lobes[i]
        angs = a_l + np.linspace(-1.35, 1.35, 41)
        out = [(0 <= int(cy + (r + 3) * math.sin(a) - y0) < h and 0 <= int(cx + (r + 3) * math.cos(a) - x0) < w
                and d[int(cy + (r + 3) * math.sin(a) - y0), int(cx + (r + 3) * math.cos(a) - x0)] < 0)
               for a in angs]
        best = longest_run(out)
        if best[1] - best[0] < 6:
            continue
        a0, a1 = angs[best[0]], angs[best[1] - 1]
        warm = float(np.clip(1.3 - math.hypot(cx - sun[0], cy - sun[1]) / 900.0, 0.6, 1.0))
        rw = rng.uniform(*prm['rim_w']) * (0.55 + 0.45 * min(1.0, r / size))
        col = mix(pal['lit'], pal['rim'], 0.55 + 0.45 * warm)
        paint_arc(p3, (cx - x0, cy - y0), r - rw * 0.5 + 0.6, a0, a1, rw, col, rng.uniform(0.8, 0.95) * warm,
                  e_pos=0.6, e_neg=rw * 0.55, t_in=0.22, t_out=0.3, taper_w=0.8)
        nrim += 1
    p3.blur(prm['p3_blur']).onto(canvas)
    # ---- (c) EDGES: the silhouette's alpha, crisp toward the light, soft or dry-broken away from it ----
    ggy, ggx = np.gradient(gauss(d, 5.0))               # smoothed: the raw SDF's gradient breaks at the medial axis
    ggn = np.hypot(ggx, ggy) + 1e-6
    facing = (-ggx * l2[0] - ggy * l2[1]) / ggn          # the outline's outward normal . light
    ew = mix(prm['edge_shade'], prm['edge_lit'], smoothstep(-0.15, 0.55, facing))
    near_base = np.zeros((h, w), np.float32)
    if prm.get('base_y') is not None:
        # the flat base is soft or lost whatever it faces (a lit underside included), dragged in vertical streaks
        near_base = smoothstep(prm['base_soft'] * 2.5, 0.0, np.abs(prm['base_y'] - Y + wob)) * smoothstep(-0.2, 0.2, -ggy / ggn)
        ew = mix(ew, prm['edge_base'], near_base)
    n_side = np.clip(noise(rng, h, w, prm['dry_cell'], aniso=prm['dry_aniso'], angle=prm['wind']), -1.6, 1.6)
    n_base = np.clip(noise(rng, h, w, prm['dry_cell'], aniso=6.0, angle=90.0), -1.6, 1.6)
    shade_side = smoothstep(0.35, -0.35, facing)
    in_band = smoothstep(1.2, 0.0, np.abs(d) / ew)      # the dry break-up lives in the edge band only
    dd = d + (n_side * ew * prm['dry_amp'] * shade_side * (1.0 - near_base)
              + n_base * prm['edge_base'] * prm['base_drag'] * near_base) * in_band
    canvas.a[...] = smoothstep(-ew * 0.5, ew * 0.5, dd)
    # P4 (near masses only): a speckle dissolve on the shade side, a few light flecks off the lit edge
    if prm['n_speck']:
        band = (d < 4) & (d > -22) & (shade_side > 0.75) & (near_base < 0.2)
        ys_b, xs_b = np.nonzero(band)
        for _ in range(prm['n_speck'] if len(xs_b) else 0):
            j = rng.integers(len(xs_b))
            dist = -d[ys_b[j], xs_b[j]]
            if dist > 0 and rng.random() < dist / 24.0:
                continue
            col = mix(canvas.c[ys_b[j], xs_b[j]], sky.c[y0 + ys_b[j], x0 + xs_b[j]], 0.3)   # the cloud dissolving
            paint_speck(canvas, xs_b[j] + rng.uniform(0, 1), ys_b[j] + rng.uniform(0, 1), rng.uniform(0.7, 2.2),
                        col, rng.uniform(0.5, 0.9))
        lit_band = (d < -4) & (d > -36) & (facing > 0.45)
        ys_b, xs_b = np.nonzero(lit_band)
        for _ in range(prm['n_spatter'] if len(xs_b) else 0):
            j = rng.integers(len(xs_b))
            paint_speck(canvas, xs_b[j] + 0.5, ys_b[j] + 0.5, rng.uniform(1.0, 2.8), pal['rim'], rng.uniform(0.25, 0.5))
    # ---- (d) DEPTH: converge on the sky behind by k, then blur the plane ----
    if prm['k'] > 0:
        behind = sky.c[y0:y1, x0:x1]
        canvas.c[...] = canvas.c + (behind - canvas.c) * prm['k']
        flat = flat + (behind - flat) * prm['k']
    canvas.blur(prm['plane_blur'])
    info = {'l2': [round(float(v), 3) for v in l2], 'F_inside': float(F[inside].mean()) if inside.any() else 0.0}
    return canvas, flat.astype(np.float32), M, info


# The depth ladder: near / mid / far plane numbers (px of the 1080 frame). The horizon streaks are the 4th plane.
DEPTH = {
    'near': dict(k=0.0, plane_blur=0.0, k_smooth=7.0, base_soft=20.0, base_wobble=12.0, top_light=0.45,
                 form_sigma=0.32, penetration=1.1, w_att=0.5, bulge=0.06, cuts=[0.34, 0.66], soft_cut=0.16,
                 base_blur=12.0, n_soft=10, p1_blur=12.0, n_block=9, block_w=(14, 32), block_lift=0.02, p2_blur=1.0,
                 n_inner=6, inner_w=(9, 15), inner_lift=0.016, n_rim=8, rim_w=(7, 14), rim_min_r=30, p3_blur=0.5,
                 edge_lit=1.8, edge_shade=24.0, edge_base=40.0, base_drag=0.0, dry_cell=4.0, dry_aniso=7.0, dry_amp=0.8,
                 n_speck=170, n_spatter=12, wind=-6.0),
    'mid': dict(k=0.22, plane_blur=1.3, k_smooth=12.0, base_soft=12.0, base_wobble=4.0, top_light=0.3,
                form_sigma=0.4, penetration=1.2, w_att=0.45, bulge=0.1, cuts=[0.36, 0.7], soft_cut=0.18,
                base_blur=8.0, n_soft=6, p1_blur=9.0, n_block=10, block_w=(14, 30), block_lift=0.012, p2_blur=1.5,
                n_inner=0, inner_w=(6, 9), inner_lift=0.01, n_rim=0, rim_w=(5, 8), rim_min_r=999, p3_blur=0.8,
                edge_lit=2.6, edge_shade=28.0, edge_base=30.0, base_drag=0.18, dry_cell=5.0, dry_aniso=9.0, dry_amp=0.6,
                n_speck=0, n_spatter=0, wind=-4.0),
    'far': dict(k=0.40, plane_blur=2.4, k_smooth=14.0, base_soft=8.0, base_wobble=2.5, top_light=0.35,
                form_sigma=0.45, penetration=1.4, w_att=0.4, bulge=0.06, cuts=[0.3, 0.66], soft_cut=0.2,
                base_blur=6.0, n_soft=4, p1_blur=8.0, n_block=7, block_w=(12, 24), block_lift=0.008, p2_blur=2.0,
                n_inner=0, inner_w=(5, 8), inner_lift=0.008, n_rim=0, rim_w=(4, 6), rim_min_r=999, p3_blur=1.0,
                edge_lit=4.0, edge_shade=30.0, edge_base=24.0, base_drag=0.18, dry_cell=6.0, dry_aniso=10.0, dry_amp=0.4,
                n_speck=0, n_spatter=0, wind=-2.0),
}


# -------------------------------------------------------------------------------------- the elements
# The designed masses (plate px; lobes = (cx, cy, r, flat)). Sizes in a geometric ladder (1 : 0.6 : 0.35 : 0.2),
# the biggest at the back of the tower, small ones only along the lit edge; never a necklace of equal circles.
NEAR_LOBES = [
    (1010, 196, 142, 1.0), (1058, 104, 92, 1.0),                         # the body and the top right
    (905, 150, 100, 1.0), (962, 86, 70, 1.0), (880, 240, 70, 1.0),       # the tower
    (884, 62, 44, 1.0), (816, 128, 44, 1.0), (1010, 34, 46, 1.0),        # billows toward the light, the tower top
    (770, 218, 60, 1.0), (842, 92, 26, 1.0),
    (702, 260, 33, 1.0), (662, 282, 17, 1.0),                            # the shoulder: one medium, one small, one tiny
]
NEAR_BOX = (560, 0, 1080, 345)
NEAR_BASE = 298.0

MID_LOBES = [   # a long bank, upper left (plane 2): humps on a level base, a thin wisp above
    (30, 222, 92, 0.42), (130, 210, 104, 0.46), (238, 214, 84, 0.44), (330, 224, 66, 0.42),
    (420, 232, 46, 0.38), (490, 238, 28, 0.36), (300, 170, 70, 0.22), (380, 166, 52, 0.2),
]
MID_BOX = (0, 120, 560, 290)
MID_BASE = 246.0

FAR_LOBES = [   # a thin low deck in the west gap (plane 3): smaller, flatter, closer to the sky
    (40, 664, 86, 0.28), (170, 668, 70, 0.3), (285, 662, 76, 0.26), (400, 672, 56, 0.28),
    (500, 670, 46, 0.28), (610, 676, 60, 0.24), (700, 680, 40, 0.24),
]
FAR_BOX = (0, 610, 780, 706)
FAR_BASE = 684.0


def paint_streaks(layer, pal, rng, sun=SUN, n_rows=4):
    """Thin horizon streaks along the sun line (the farthest plane): 4 rows above the horizon, lower = thinner and
    longer; each streak a level flat stroke, two-tone: a rose body a step off the band, its underside lit by the
    sun (brightest near the sun's x), crisp below, softer above, long taper away from the sun."""
    rows = [(HORIZON - 16, 3.0, 5.0), (HORIZON - 30, 4.0, 7.0), (HORIZON - 48, 5.0, 9.0), (HORIZON - 74, 6.0, 12.0)]
    for ri, (y, wmin, wmax) in enumerate(rows[:n_rows]):
        x = rng.uniform(-120, 40)
        while x < FW + 40:
            L = float(np.exp(rng.uniform(np.log(70), np.log(520 - 80 * ri))))
            gap = rng.uniform(30, 160) * (1 + 0.4 * ri)
            yy = y + rng.normal(0, 2.5)
            wd = rng.uniform(wmin, wmax)
            xc = x + L / 2
            near = float(np.exp(-abs(xc - sun[0]) / 340.0))
            base = layer.c[int(np.clip(yy, 0, layer.h - 1)), int(np.clip(xc, 0, layer.w - 1))]
            body = mix(base, mix(pal['streak'], pal['shade'], 0.15 * ri), 0.85 - 0.1 * ri)
            left_tail = xc > sun[0]          # the long taper points away from the sun
            ti, to = (0.45, 0.15) if left_tail else (0.15, 0.45)
            ang = math.radians(rng.normal(0, 0.35))
            p0 = (x, yy)
            p1 = (x + L * math.cos(ang), yy + L * math.sin(ang))
            paint_line(layer, p0, p1, wd, body, rng.uniform(0.7, 0.9), e_pos=0.8, e_neg=1.6, t_in=ti, t_out=to,
                       taper_w=0.5)
            lit = mix(body, pal['glow'], 0.45 + 0.55 * near)
            lit = lift(lit, 0.012 + 0.04 * near)
            # +s is to the right of travel = below the line for a left-to-right stroke: the lit underside
            paint_line(layer, (p0[0], p0[1] + wd * 0.32), (p1[0], p1[1] + wd * 0.32), wd * 0.42, lit,
                       (0.45 + 0.5 * near), e_pos=0.6, e_neg=1.2, t_in=ti, t_out=to, taper_w=0.6)
            x += L + gap


def paint_sun(layer, pal, sun=SUN, r=21.0, ridge_y=None):
    """The disc: a flat shape one step over its band, crisp edge (1.2 px), no halo; cut by one near-level edge
    (the far roofs) or whole."""
    y_lo = ridge_y if ridge_y is not None else 1e9
    b = _box(sun[0] - r - 3, sun[1] - r - 3, sun[0] + r + 3, min(sun[1] + r + 3, y_lo), layer.h, layer.w)
    if b is None:
        return
    sl, X, Y = b
    cov = smoothstep(r + 0.6, r - 0.6, np.hypot(X - sun[0], Y - sun[1]))
    band_c = layer.c[int(min(sun[1] - r - 6, layer.h - 1)), int(sun[0])]
    col = mix(band_c, pal['sun'], 0.85)
    layer.over(sl, cov.astype(np.float32), col)


def paint_flock(layer, pal, rng, path, n=34, span=(6.0, 15.0), band=30.0, far_k=0.5, ss=4):
    """A far flock: n tiny two-stroke birds along a gentle arc, in loose clumps with gaps, a few stragglers;
    nearer birds (toward path[2]) bigger and darker; every pose different (wing up, level, down). Drawn as
    polylines at 4x and box-filtered down: crisp, never jaggy."""
    (ax, ay), (bx, by), (cx_, cy_) = path
    H, W = layer.h, layer.w
    xs = [ax, bx, cx_]
    ys = [ay, by, cy_]
    x0, x1 = int(max(0, min(xs) - 60)), int(min(W, max(xs) + 60))
    y0, y1 = int(max(0, min(ys) - band * 2 - 30)), int(min(H, max(ys) + band * 2 + 30))
    bw, bh = x1 - x0, y1 - y0
    big = Image.new('L', (bw * ss, bh * ss), 0)
    dr = ImageDraw.Draw(big)
    n_cl = max(4, n // 4)
    centres = np.sort(rng.uniform(0.0, 1.0, n_cl))
    birds = []
    for i in range(n):
        if rng.random() < 0.2:
            t = rng.uniform(0, 1); off = rng.normal(0, band * 1.4)
        else:
            t = float(np.clip(centres[rng.integers(n_cl)] + rng.normal(0, 0.05), 0, 1)); off = rng.normal(0, band * 0.55)
        px_ = (1 - t) ** 2 * ax + 2 * (1 - t) * t * bx + t * t * cx_
        py_ = (1 - t) ** 2 * ay + 2 * (1 - t) * t * by + t * t * cy_ + off
        birds.append((t, px_ + rng.normal(0, 6), py_))
    for (t, px_, py_) in birds:
        sp = span[0] + (span[1] - span[0]) * (t ** 1.3) * rng.uniform(0.75, 1.15)
        lift_ = float(np.clip(rng.normal(0.25, 0.28), -0.35, 0.7))     # wing tips: up (V) ... level ... down
        bend = rng.uniform(0.12, 0.3)                                  # the gull's arched wing
        a = sp * 0.5
        lw = max(1, int(round((0.9 + 0.8 * t) * ss)))
        bxp, byp = (px_ - x0) * ss, (py_ - y0) * ss
        tilt = rng.normal(0, 0.12)
        for side in (-1, 1):
            tx_, ty_ = bxp + side * a * ss, byp - (lift_ + side * tilt) * a * ss
            cx_q, cy_q = bxp + side * a * 0.45 * ss, byp - (lift_ * 0.5 + bend) * a * ss
            pts = [((1 - u) ** 2 * bxp + 2 * (1 - u) * u * cx_q + u * u * tx_,
                    (1 - u) ** 2 * byp + 2 * (1 - u) * u * cy_q + u * u * ty_) for u in np.linspace(0, 1, 7)]
            dr.line(pts, fill=255, width=lw, joint='curve')
        dr.ellipse([bxp - lw * 0.7, byp - lw * 0.5, bxp + lw * 0.7, byp + lw * 0.8], fill=255)
    cov = np.asarray(big, np.float32).reshape(bh, ss, bw, ss).mean(axis=(1, 3)) / 255.0
    # value by distance: far birds toward the sky behind (by far_k), near ones the full dark
    tt = np.linspace(0, 1, bw)[None, :] if cx_ >= ax else np.linspace(1, 0, bw)[None, :]
    sl = (slice(y0, y1), slice(x0, x1))
    behind = layer.c[sl]
    col = behind + (pal['bird'] - behind) * (1.0 - far_k * (1.0 - tt))[..., None]
    layer.over(sl, cov * 0.92, col)


def ridge(layer, pal, y=HORIZON, rng=None):
    """A placeholder far roofline (not this family: the city's own recipe paints it) so the horizon and the sun
    read in the plate: a flat haze shape, the AIR one step darker, a few roof steps."""
    H, W = layer.h, layer.w
    xs = np.arange(W)
    top = np.full(W, float(y))
    x = 0
    while x < W:
        wdt = int(rng.uniform(30, 110)); hgt = rng.choice([0, 6, 10, 16, 26, 40], p=[.3, .2, .2, .15, .1, .05])
        top[x:x + wdt] = y - hgt
        x += wdt
    Y = np.arange(H)[:, None] + 0.5
    cov = smoothstep(top[None, :] - 0.5, top[None, :] + 0.5, Y).astype(np.float32)
    col = lift(mix(pal['horizon'], pal['shade'], 0.35), -0.03)
    layer.over((slice(0, H), slice(0, W)), cov, col)
    return top


# ----------------------------------------------------------------------------------- the plate
def paint_plate(pal=DUSK, style='dusk', seed=SEED, with_ridge=True, stages=None):
    """The October canal evening sky, all elements together: sky -> far deck -> mid bank -> streaks -> sun ->
    near cumulus -> flock -> (placeholder ridge). Far to near; each plane its own layer."""
    H, W = PLATE_H, FW
    t0 = time.time()
    sky = paint_sky(H, W, pal, style, np.random.default_rng([seed, 1]))
    sky_only = Layer(H, W, alpha=1.0); sky_only.c[...] = sky.c
    plate = Layer(H, W, alpha=1.0); plate.c[...] = sky.c
    if stages is not None:
        stages['sky'] = plate.rgb(11)
    # the streaks sit on the warm band; the far deck above them
    paint_streaks(plate, pal, np.random.default_rng([seed, 4]))
    far, far_flat, _, _ = paint_mass(FAR_BOX, FAR_LOBES, pal, sky_only, np.random.default_rng([seed, 3]),
                                     dict(DEPTH['far'], base_y=FAR_BASE))
    far.onto(plate, FAR_BOX[0], FAR_BOX[1])
    mid, mid_flat, _, _ = paint_mass(MID_BOX, MID_LOBES, pal, sky_only, np.random.default_rng([seed, 2]),
                                     dict(DEPTH['mid'], base_y=MID_BASE))
    mid.onto(plate, MID_BOX[0], MID_BOX[1])
    near, near_flat, near_M, info = paint_mass(NEAR_BOX, NEAR_LOBES, pal, sky_only, np.random.default_rng([seed, 5]),
                                               dict(DEPTH['near'], base_y=NEAR_BASE))
    near.onto(plate, NEAR_BOX[0], NEAR_BOX[1])
    paint_flock(plate, pal, np.random.default_rng([seed, 6]), path=((330, 612), (520, 574), (760, 600)))
    top = None
    if with_ridge:
        top = ridge(plate, pal, rng=np.random.default_rng([seed, 7]))
    paint_sun(plate, pal, ridge_y=None)
    if with_ridge:   # the roofs cut the disc with one near-level edge: redraw the ridge over the sun's foot
        ridge(plate, pal, rng=np.random.default_rng([seed, 7]))
    if stages is not None:
        stages['near_flat'] = near_flat
        stages['mid_flat'] = mid_flat
        stages['far_flat'] = far_flat
        stages['near_layer'] = near
        stages['info'] = info
    return plate, sky_only, time.time() - t0


# ----------------------------------------------------------------------------------- isolated swatches
def swatch_cumulus(pal, seed):
    """The near cumulus alone on its sky: the design (flat values), then the painted mass."""
    H, W = PLATE_H, FW
    sky = paint_sky(H, W, pal, 'dusk', np.random.default_rng([seed, 1]))
    near, flat, M, info = paint_mass(NEAR_BOX, NEAR_LOBES, pal, sky, np.random.default_rng([seed, 5]),
                                     dict(DEPTH['near'], base_y=NEAR_BASE))
    x0, y0, x1, y1 = NEAR_BOX
    design = Layer(y1 - y0, x1 - x0, alpha=1.0)
    design.c[...] = sky.c[y0:y1, x0:x1]
    fl = Layer(y1 - y0, x1 - x0); fl.c[...] = flat; fl.a[...] = (M > 0.5).astype(np.float32)
    fl.onto(design)
    painted = Layer(y1 - y0, x1 - x0, alpha=1.0)
    painted.c[...] = sky.c[y0:y1, x0:x1]
    near.onto(painted)
    return design.rgb(21), painted.rgb(22)


def to_img(a):
    return Image.fromarray(a) if isinstance(a, np.ndarray) else a


# ----------------------------------------------------------------------------------- the sheet
def font(sz, bold=False):
    p = '/usr/share/fonts/truetype/dejavu/DejaVuSans%s.ttf' % ('-Bold' if bold else '')
    try:
        return ImageFont.truetype(p, sz)
    except OSError:
        return ImageFont.load_default()


def ref(path, box):
    return Image.open(os.path.join(LOOK, path)).convert('RGB').crop(box)


def row(tiles, height, width, gap=10):
    """Lay (image, caption) tiles in one row at a common height, shrunk to fit the width."""
    ims = [to_img(t[0]) for t in tiles]
    ws = [im.width * height / im.height for im in ims]
    total = sum(ws) + gap * (len(ims) - 1)
    s = min(1.0, width / total)
    hh = int(height * s)
    out = []
    for im, cap in zip(ims, [t[1] for t in tiles]):
        ww = max(1, int(round(im.width * hh / im.height)))
        out.append((im.resize((ww, hh), Image.LANCZOS), cap))
    return out, hh


def build_sheet(path, seed=SEED, plate_path=None):
    t0 = time.time()
    stages = {}
    plate, sky, dt = paint_plate(DUSK, 'dusk', seed, stages=stages)
    plate_rgb = plate.rgb(31)
    if plate_path:
        Image.fromarray(plate_rgb).save(plate_path)
    day = paint_sky(PLATE_H, FW, DAY, 'day', np.random.default_rng([seed, 41]))
    day_rgb = day.rgb(41)
    design, painted = swatch_cumulus(DUSK, seed)
    # the banks and decks: the planes without the near cumulus, cropped to the left
    planes, _, _ = paint_plate_planes(seed)
    WIDTH = 1600
    sheet_rows = []
    P = plate_rgb
    # 1 sky gradient
    sheet_rows.append(('1  SKY GRADIENT  dusk and daylight: a calm field that moves in hue more than value, a faint long brush grain', [
        (ref('refs_paint/01_beach_van_dusk.jpg', (300, 28, 720, 250)), 'ref p01 dusk'),
        (ref('refs_human_scale/03_beach_dusk.jpg', (700, 5, 1200, 150)), 'ref 03 flat sky + hatch'),
        (ref('poster_refs/05_cape_town.jpg', (60, 140, 700, 520)), 'ref Cape Town day'),
        (Image.fromarray(sky.rgb(12)[0:860, 0:FW]).crop((0, 0, 1080, 860)), 'ours: dusk sky alone'),
        (Image.fromarray(day_rgb[0:860]), 'ours: daylight sky'),
    ], 300))
    # 2 near cumulus
    sheet_rows.append(('2  NEAR CUMULUS  designed in 4 flat values from one light, then brushed: soft masses, flat strokes along the billows, crisp lit edges, dry/speckled shade side', [
        (ref('refs_human_scale/02_bus_stop_night.jpg', (430, 10, 980, 340)), 'ref 02 night cumulus'),
        (ref('refs_paint/02_lighthouse_process.jpg', (790, 620, 1160, 1060)), 'ref p02 lit billows'),
        (ref('refs_human_scale/04_cloud_beast_frame.jpg', (300, 200, 720, 760)), 'ref 04 glowing edge'),
        (Image.fromarray(design), 'ours: design (flat)'),
        (Image.fromarray(painted), 'ours: painted'),
    ], 360))
    # 3 banks and decks
    sheet_rows.append(('3  BANKS AND DECKS IN DEPTH PLANES  far = paler, closer to the sky, simpler, flatter, blurrier (k .22 / .40, blur 1.3 / 2.4 px)', [
        (ref('refs_human_scale/03_beach_dusk.jpg', (560, 80, 1206, 350)), 'ref 03 banks'),
        (ref('refs_paint/02_lighthouse_process.jpg', (226, 700, 560, 1180)), 'ref p02 far clouds'),
        (ref('refs_paint/01_beach_van_dusk.jpg', (780, 60, 1185, 250)), 'ref p01 pink banks'),
        (Image.fromarray(planes[100:720, 0:760]), 'ours: mid bank + far deck'),
    ], 300))
    # 4 horizon streaks
    sheet_rows.append(('4  HORIZON STREAKS  thin level two-tone strokes on the sun line, lit undersides near the sun', [
        (ref('refs_human_scale/03_beach_dusk.jpg', (0, 370, 760, 452)), 'ref 03 horizon'),
        (Image.fromarray(P[690:800, 0:760]), 'ours'),
    ], 150))
    # 5 sun and glow
    sheet_rows.append(('5  SUN AND GLOW  a flat disc one step over its band, a low wide warmth (ry 0.45 rx), no halo, no ring', [
        (ref('refs_human_scale/03_beach_dusk.jpg', (260, 360, 560, 470)), 'ref 03 sun'),
        (ref('refs_human_scale/01_city_hill_sunset.jpg', (520, 0, 1050, 260)), 'ref 01 sun glow'),
        (Image.fromarray(P[560:860, 0:640]), 'ours'),
    ], 230))
    # 6 flock
    sheet_rows.append(('6  FAR FLOCK  tiny two-stroke birds, loose clumps along an arc, every pose different, nearer = bigger and darker', [
        (ref('refs_human_scale/03_beach_dusk.jpg', (430, 345, 1000, 445)), 'ref 03 flock'),
        (ref('refs_human_scale/04_cloud_beast_frame.jpg', (330, 890, 660, 1000)), 'ref 04 light birds'),
        (Image.fromarray(P[540:660, 280:800]), 'ours'),
    ], 160))
    # 7 all together at phone size
    phone = Image.fromarray(P).resize((400, int(400 * PLATE_H / FW)), Image.LANCZOS)
    sheet_rows.append(('7  ALL TOGETHER  the October canal evening sky plate (1080 x 900, a placeholder roofline), at phone width (400 px)', [
        (ref('refs_human_scale/03_beach_dusk.jpg', (0, 0, 1206, 470)).resize((400, 156), Image.LANCZOS), 'ref 03 at 400 px'),
        (ref('refs_human_scale/02_bus_stop_night.jpg', (0, 0, 1206, 360)).resize((400, 119), Image.LANCZOS), 'ref 02 at 400 px'),
        (phone, 'ours at 400 px'),
    ], 333))
    # compose
    pad, title_h, cap_h = 18, 30, 22
    laid = []
    total_h = 70
    for title, tiles, hgt in sheet_rows:
        ims, hh = row(tiles, hgt, WIDTH - 2 * pad)
        laid.append((title, ims, hh))
        total_h += title_h + hh + cap_h + pad
    sheet = Image.new('RGB', (WIDTH, total_h), (246, 242, 236))
    dr = ImageDraw.Draw(sheet)
    dr.text((pad, 16), 'Sky and clouds: the painting recipe, proved (docs/look/paint_recipes/sky_clouds.md)  seed %d' % seed,
            fill=(40, 36, 44), font=font(24, True))
    y = 70
    for title, ims, hh in laid:
        dr.text((pad, y + 4), title, fill=(52, 46, 60), font=font(17, True))
        y += title_h
        x = pad
        for im, cap in ims:
            sheet.paste(im, (x, y))
            dr.text((x + 2, y + hh + 3), cap, fill=(80, 74, 86), font=font(14))
            x += im.width + 10
        y += hh + cap_h + pad
    sheet.save(path, optimize=True)
    return time.time() - t0, sheet.size


def paint_plate_planes(seed):
    """The mid bank and the far deck with the streaks, without the near cumulus or the flock (row 3)."""
    H, W = PLATE_H, FW
    sky = paint_sky(H, W, DUSK, 'dusk', np.random.default_rng([seed, 1]))
    plate = Layer(H, W, alpha=1.0); plate.c[...] = sky.c
    paint_streaks(plate, DUSK, np.random.default_rng([seed, 4]))
    far, _, _, _ = paint_mass(FAR_BOX, FAR_LOBES, DUSK, sky, np.random.default_rng([seed, 3]),
                              dict(DEPTH['far'], base_y=FAR_BASE))
    far.onto(plate, FAR_BOX[0], FAR_BOX[1])
    mid, _, _, _ = paint_mass(MID_BOX, MID_LOBES, DUSK, sky, np.random.default_rng([seed, 2]),
                              dict(DEPTH['mid'], base_y=MID_BASE))
    mid.onto(plate, MID_BOX[0], MID_BOX[1])
    return plate.rgb(51), sky, 0


# ----------------------------------------------------------------------------------- checks
def check(plate_rgb):
    from skimage import color
    L = color.rgb2lab(plate_rgb.astype(np.float64) / 255.0)[..., 0]

    def tex(box):
        x0, y0, x1, y1 = box
        a = L[y0:y1, x0:x1]
        return [float(np.std(a - ndi.gaussian_filter(a, s))) for s in (1.5, 4, 12)]
    print('texture residual std L* (sigma 1.5 / 4 / 12); refs: 03 sky .30/.47/.58, p01 sky .19/.28/.71, '
          'k05 sky .30/.44/.55')
    for name, box in [('open sky top', (40, 0, 540, 110)), ('caption band', (150, 330, 800, 480)),
                      ('near cumulus body', (900, 120, 1060, 220))]:
        print('  %-20s %s' % (name, ' / '.join('%.2f' % v for v in tex(box))))
    band = L[CAPTION[0]:CAPTION[1], 150:800]
    print('caption band L* spread (CRAFT <= 1.5): %.2f  (mean %.1f)' % (np.percentile(band, 98) - np.percentile(band, 2),
                                                                       band.mean()))


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--out', default=OUT)
    ap.add_argument('--seed', type=int, default=SEED)
    ap.add_argument('--plate', default=None, help='also save the 1080 x 900 sky plate here')
    ap.add_argument('--check', action='store_true')
    a = ap.parse_args()
    dt, size = build_sheet(a.out, a.seed, a.plate)
    print('wrote %s %dx%d in %.1f s' % (a.out, size[0], size[1], dt))
    if a.check:
        plate, _, _ = paint_plate(DUSK, 'dusk', a.seed)
        check(plate.rgb(31))


if __name__ == '__main__':
    main()
