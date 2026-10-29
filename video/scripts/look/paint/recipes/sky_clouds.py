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
SUN = (196.0, 772.0)           # the low sun, left, its lower part behind the far roofs
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
    'rim': '#fde6bf',      # cloud rim, the lightest cloud value (thin edges toward the sun)
    'lit': '#f5d0aa',      # cloud lit
    'mid': '#e4b9b4',      # cloud mid, rose-peach
    'shade': '#bfa9c8',    # cloud shade, lilac (skylit tops get the lighter end)
    'deep': '#a08db6',     # cloud accent: notches between billows, small areas only
    'streak': '#e3c3c6',   # horizon streak body (rose); its lit underside takes 'glow'
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
    # (c) the brush grain: 260 long thin dry strokes, width 6-20, length 160-620, +-0.4..0.7 L, blur 0.7
    p2 = Layer(H, W)
    wind = -7.0 if style == 'dusk' else -2.0
    for i in range(int(260 * grain)):
        y = rng.uniform(-20, H)
        x = rng.uniform(-200, W)
        L = rng.uniform(160, 620)
        ang = math.radians(wind + rng.normal(0, 2.5))
        w = rng.uniform(6, 20)
        xc, yc = int(np.clip(x + L / 2, 0, W - 1)), int(np.clip(y, 0, H - 1))
        dl = rng.choice([-1, 1]) * rng.uniform(0.004, 0.007) * calm[yc]
        col = lift(sky.c[yc, xc], dl)
        paint_line(p2, (x, y), (x + L * math.cos(ang), y + L * math.sin(ang)), w, col, rng.uniform(0.35, 0.6),
                   e_pos=1.2, e_neg=1.2, t_in=0.15, t_out=0.45, dry=rng.uniform(0.35, 0.6), tex_off=tex_off(rng))
    p2.blur(0.7).onto(sky)
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
    for (cx, cy, r, fl) in lobes:
        di = r - np.hypot(X - cx, (Y - cy) / fl)
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


def paint_mass(box, lobes, pal, sky, rng, prm, sun=SUN):
    """One cloud plane, designed then painted. box = (x0, y0, x1, y1) in plate px. Returns (Layer over the box,
    flat-design RGB over the box, info). prm: the plane's numbers from DEPTH (near / mid / far)."""
    x0, y0, x1, y1 = box
    h, w = y1 - y0, x1 - x0
    Y, X = np.mgrid[y0:y1, x0:x1].astype(np.float32) + 0.5
    size = max(r for (_, _, r, _) in lobes)
    wob = noise(rng, h, w, 40, aniso=4.0) * prm['base_wobble']
    d = mass_sdf(X, Y, lobes, prm['k_smooth'], prm.get('base_y'), prm['base_soft'], wob)
    M = smoothstep(-1.0, 1.0, d)
    cen = np.array([(X * M).sum() / M.sum(), (Y * M).sum() / M.sum()])
    l2 = light_dir(cen, sun, prm['top_light'])
    # ---- (a) DESIGN: value plan from one light ----
    # key light: per-lobe form (front lobe wins, z = away from the light is in front) x the mass's own shadow
    order = sorted(range(len(lobes)), key=lambda i: -np.dot(np.array(lobes[i][:2]) - cen, l2) + lobes[i][2] * 0.002)
    lz = prm['lz']
    l3 = np.array([l2[0], l2[1], lz]) / np.linalg.norm([l2[0], l2[1], lz])
    key = np.zeros((h, w), np.float32)
    skyl = np.zeros((h, w), np.float32)
    for i in order:
        cx, cy, r, fl = lobes[i]
        nx, ny = (X - cx) / r, (Y - cy) / (r * fl)
        rho2 = nx * nx + ny * ny
        nz = np.sqrt(np.clip(1.0 - rho2, 0.0, 1.0))
        di = r - np.hypot(X - cx, (Y - cy) / fl)
        facing = (nx * l2[0] + ny * l2[1]) / np.sqrt(np.maximum(rho2, 1e-6))
        ew = mix(prm['inner_soft'], prm['inner_crisp'], smoothstep(-0.2, 0.5, facing))   # crisp toward the light
        cov = smoothstep(-ew * 0.5, ew * 0.5, di)
        lam = np.clip((nx * l3[0] + ny * l3[1] + nz * l3[2] + prm['wrap']) / (1 + prm['wrap']), 0.0, 1.0)
        key = key + (lam - key) * cov
        skyl = skyl + (np.clip(0.5 - 0.5 * ny, 0, 1) - skyl) * cov
    od = light_depth(M, l2, step=size * 0.06, n=22)
    att = np.exp(-od / (prm['penetration'] * size))
    k = np.clip(key * (0.25 + 0.75 * att) * prm['key_gain'], 0.0, 1.0)
    # colour: shade (skylit tops lighter) -> mid -> lit -> rim, in OKLab
    shade_c = mix(pal['deep'][None, None], pal['shade'][None, None], skyl[..., None])
    stops = [pal['mid'], pal['lit'], pal['rim']]
    cont = ramp4([np.zeros(3)] + stops, k)                        # stop 0 replaced by the per-pixel shade colour
    t0 = np.clip(k * 3.0, 0, 1)[..., None]
    cont = np.where((k < 1 / 3)[..., None], shade_c + (pal['mid'] - shade_c) * smoothstep(0, 1, t0), cont)
    # the flat design: 4 values, crisp
    q = np.digitize(k, prm['cuts'])
    zone_cols = [None, pal['mid'], pal['lit'], pal['rim']]
    flat = shade_c.copy()
    for zi in (1, 2, 3):
        flat = np.where((q == zi)[..., None], zone_cols[zi], flat)
    # ---- (b) PAINT passes on an opaque colour canvas over the box ----
    canvas = Layer(h, w, alpha=1.0)
    canvas.c[...] = gauss(flat.astype(np.float32), prm['base_blur'])          # the flats, softened
    # P1: big soft round strokes along the wind, colour picked from the continuous plan, then blurred
    p1 = Layer(h, w)
    ys_in, xs_in = np.nonzero(M > 0.5)
    for i in range(prm['n_soft'] if len(xs_in) else 0):
        j = rng.integers(len(xs_in))
        cx, cy = float(xs_in[j]), float(ys_in[j])
        L = rng.uniform(0.6, 1.6) * size
        ang = math.radians(prm['wind'] + rng.normal(0, 12))
        col = lift(cont[int(cy), int(cx)], rng.normal(0, 0.006), rng.normal(0, 0.003), rng.normal(0, 0.003))
        paint_line(p1, (cx - L / 2 * math.cos(ang), cy - L / 2 * math.sin(ang)),
                   (cx + L / 2 * math.cos(ang), cy + L / 2 * math.sin(ang)), rng.uniform(0.35, 0.7) * size, col,
                   rng.uniform(0.35, 0.6), round_=True, t_in=0.3, t_out=0.3)
    p1.blur(prm['p1_blur']).onto(canvas)
    # P2: blocky flat-brush strokes along each lobe's form (arcs concentric with the lobe), colour from the plan
    p2 = Layer(h, w)
    for i in order:
        cx, cy, r, fl = lobes[i]
        if fl < 0.75:      # flattened lobes (banks): level flat strokes along the bank instead of arcs
            for _ in range(int(prm['n_block'] * r / size) + 1):
                sx = cx + rng.uniform(-0.9, 0.9) * r
                sy = cy + rng.uniform(-0.6, 0.5) * r * fl
                L = rng.uniform(0.5, 1.3) * r
                if not (0 <= int(sy - y0) < h and 0 <= int(sx - x0) < w) or M[int(sy - y0), int(sx - x0)] < 0.5:
                    continue
                col = lift(cont[int(sy - y0), int(sx - x0)], rng.normal(0, 0.006))
                ang = math.radians(prm['wind'] + rng.normal(0, 3))
                paint_line(p2, (sx - x0 - L / 2 * math.cos(ang), sy - y0 - L / 2 * math.sin(ang)),
                           (sx - x0 + L / 2 * math.cos(ang), sy - y0 + L / 2 * math.sin(ang)),
                           rng.uniform(*prm['block_w']) * 0.7, col, rng.uniform(0.5, 0.8),
                           e_pos=0.9, e_neg=2.5, t_in=0.02, t_out=0.35, dry=rng.uniform(0.1, 0.35),
                           tex_off=tex_off(rng))
            continue
        a_l = math.atan2(l2[1], l2[0])
        nb = int(prm['n_block'] * (r / size) ** 0.7) + 1
        for _ in range(nb):
            R = r * rng.uniform(0.45, 0.93)
            a_c = a_l + rng.normal(0, 1.1)
            span = rng.uniform(0.5, 1.3) * (1 if rng.random() < 0.5 else -1)
            am = a_c
            px_, py_ = cx + R * math.cos(am), cy + R * fl * math.sin(am)
            ix, iy = int(px_ - x0), int(py_ - y0)
            if not (0 <= iy < h and 0 <= ix < w) or M[iy, ix] < 0.5:
                continue
            col = lift(cont[iy, ix], rng.normal(0, 0.005), rng.normal(0, 0.002), rng.normal(0, 0.002))
            bw = rng.uniform(*prm['block_w'])
            paint_arc(p2, (cx - x0, cy - y0), R, am - span / 2, am + span / 2, bw, col, rng.uniform(0.5, 0.85),
                      e_pos=0.9, e_neg=bw * 0.35, t_in=0.04, t_out=0.4, taper_w=0.3, dry=rng.uniform(0.0, 0.3),
                      tex_off=tex_off(rng))
    p2.blur(prm['p2_blur']).onto(canvas)
    # P3: a few crisp strokes at the light edges: rims on the outer silhouette's lit arcs (outer edge crisp ON the
    # silhouette, inner edge soft, both ends tapered: never a two-edged crescent)
    p3 = Layer(h, w)
    nrim = 0
    for i in order[::-1]:
        if nrim >= prm['n_rim']:
            break
        cx, cy, r, fl = lobes[i]
        if fl < 0.75 or r < prm['rim_min_r']:
            continue
        a_l = math.atan2(l2[1], l2[0])
        # the lit arc must lie on the outer silhouette: test a few points just outside the lobe
        angs = a_l + np.linspace(-1.2, 1.2, 25)
        out = []
        for a in angs:
            qx, qy = cx + (r + 4) * math.cos(a) - x0, cy + (r + 4) * math.sin(a) - y0
            ok = 0 <= int(qy) < h and 0 <= int(qx) < w and d[int(qy), int(qx)] < 0
            out.append(ok)
        out = np.array(out)
        if out.sum() < 5:
            continue
        idx = np.nonzero(out)[0]
        a0, a1 = angs[idx[0]], angs[idx[-1]]
        dist_sun = math.hypot(cx - sun[0], cy - sun[1])
        warm = float(np.clip(1.25 - dist_sun / 900.0, 0.55, 1.0))
        rw = rng.uniform(*prm['rim_w']) * (0.6 + 0.4 * min(1.0, r / size))
        col = mix(pal['lit'], pal['rim'], warm)
        paint_arc(p3, (cx - x0, cy - y0), r - rw * 0.5, a0, a1, rw, col, rng.uniform(0.75, 0.95) * warm,
                  e_pos=0.6, e_neg=rw * 0.6, t_in=0.25, t_out=0.3, taper_w=0.75)
        nrim += 1
    p3.blur(prm['p3_blur']).onto(canvas)
    # ---- (c) EDGES: the silhouette's alpha, crisp toward the light, soft or dry-broken away from it ----
    gy, gx = np.gradient(gauss(d, 2.0))
    gn = np.hypot(gx, gy) + 1e-6
    facing = (-gx * l2[0] - gy * l2[1]) / gn          # outward normal . light
    ew = mix(prm['edge_shade'], prm['edge_lit'], smoothstep(-0.15, 0.55, facing))
    if prm.get('base_y') is not None:
        near_base = smoothstep(prm['base_soft'] * 2.0, 0.0, np.abs(prm['base_y'] - Y + wob))
        ew = mix(ew, prm['edge_base'], near_base * smoothstep(0.5, -0.2, facing))
    dryn = noise(rng, h, w, prm['dry_cell'], aniso=prm['dry_aniso'], angle=prm['dry_angle'])
    shade_side = smoothstep(0.3, -0.4, facing)
    dd = d + dryn * ew * prm['dry_amp'] * shade_side
    alpha = smoothstep(-ew * 0.5, ew * 0.5, dd)
    canvas.a[...] = alpha
    # P4 (near masses only): speckle dissolve on the shade side, a light spatter off the lit edge
    if prm['n_speck']:
        band = (np.abs(d) < 26) & (shade_side > 0.5)
        ys_b, xs_b = np.nonzero(band)
        for _ in range(prm['n_speck'] if len(xs_b) else 0):
            j = rng.integers(len(xs_b))
            sx, sy = xs_b[j] + rng.uniform(-0.5, 0.5), ys_b[j] + rng.uniform(-0.5, 0.5)
            dist = -d[ys_b[j], xs_b[j]]
            if dist > 0 and rng.random() < dist / 30.0:
                continue
            col = canvas.c[ys_b[j], xs_b[j]]
            paint_speck(canvas, sx, sy, rng.uniform(0.7, 2.4), col, rng.uniform(0.45, 0.9))
        lit_band = (d < -3) & (d > -40) & (facing > 0.4)
        ys_b, xs_b = np.nonzero(lit_band)
        for _ in range(prm['n_spatter'] if len(xs_b) else 0):
            j = rng.integers(len(xs_b))
            paint_speck(canvas, xs_b[j] + 0.5, ys_b[j] + 0.5, rng.uniform(1.2, 3.2), pal['rim'],
                        rng.uniform(0.25, 0.55))
    # ---- (d) DEPTH: converge on the sky behind by k, then blur the plane ----
    if prm['k'] > 0:
        behind = sky.c[y0:y1, x0:x1]
        canvas.c[...] = canvas.c + (behind - canvas.c) * prm['k']
        flat = flat + (behind - flat) * prm['k']
    canvas.blur(prm['plane_blur'])
    info = {'l2': l2, 'k_mean': float(k[M > 0.5].mean()) if (M > 0.5).any() else 0.0}
    return canvas, flat.astype(np.float32), M, info


# The depth ladder: near / mid / far plane numbers (px of the 1080 frame). The horizon streaks are the 4th plane.
DEPTH = {
    'near': dict(k=0.0, plane_blur=0.0, k_smooth=26.0, base_soft=24.0, base_wobble=10.0, top_light=0.25, lz=-0.05,
                 wrap=0.35, penetration=0.55, key_gain=1.15, cuts=[0.22, 0.52, 0.82], base_blur=10.0,
                 inner_soft=34.0, inner_crisp=2.0, n_soft=16, p1_blur=12.0, n_block=12, block_w=(14, 36),
                 p2_blur=1.2, n_rim=7, rim_w=(7, 13), rim_min_r=34, p3_blur=0.5, edge_lit=1.8, edge_shade=26.0,
                 edge_base=56.0, dry_cell=5.0, dry_aniso=6.0, dry_angle=-80.0, dry_amp=0.9, n_speck=190,
                 n_spatter=14, wind=-6.0),
    'mid': dict(k=0.22, plane_blur=1.3, k_smooth=22.0, base_soft=16.0, base_wobble=5.0, top_light=0.25, lz=-0.05,
                wrap=0.4, penetration=0.6, key_gain=1.0, cuts=[0.25, 0.55, 0.86], base_blur=8.0,
                inner_soft=30.0, inner_crisp=3.0, n_soft=10, p1_blur=10.0, n_block=10, block_w=(16, 34),
                p2_blur=1.6, n_rim=2, rim_w=(5, 8), rim_min_r=60, p3_blur=0.8, edge_lit=2.6, edge_shade=30.0,
                edge_base=40.0, dry_cell=6.0, dry_aniso=8.0, dry_angle=-4.0, dry_amp=0.6, n_speck=0,
                n_spatter=0, wind=-4.0),
    'far': dict(k=0.40, plane_blur=2.4, k_smooth=18.0, base_soft=10.0, base_wobble=3.0, top_light=0.25, lz=-0.1,
                wrap=0.45, penetration=0.7, key_gain=0.95, cuts=[0.28, 0.6, 0.9], base_blur=6.0,
                inner_soft=24.0, inner_crisp=4.0, n_soft=6, p1_blur=8.0, n_block=8, block_w=(14, 28),
                p2_blur=2.0, n_rim=0, rim_w=(4, 6), rim_min_r=999, p3_blur=1.0, edge_lit=4.0, edge_shade=36.0,
                edge_base=30.0, dry_cell=6.0, dry_aniso=10.0, dry_angle=-2.0, dry_amp=0.4, n_speck=0,
                n_spatter=0, wind=-2.0),
}


# -------------------------------------------------------------------------------------- the elements
# The designed masses (plate px; lobes = (cx, cy, r, flat)). Sizes in a geometric ladder (1 : 0.55 : 0.3), the
# biggest at the back of the tower, small ones only along the lit edge; never a necklace of equal circles.
NEAR_LOBES = [
    (1010, 70, 175, 1.0), (880, 150, 120, 1.0), (1000, 230, 105, 1.0),   # the body (back)
    (905, 40, 92, 1.0), (790, 170, 78, 1.0), (1075, 190, 120, 1.0),
    (820, 92, 60, 1.0), (735, 226, 54, 1.0), (880, 250, 66, 1.0),        # mid billows toward the light
    (690, 255, 34, 1.0), (765, 128, 40, 1.0), (860, 0, 52, 1.0), (650, 276, 22, 1.0),   # small, the lit edge
]
NEAR_BOX = (560, 0, 1080, 345)
NEAR_BASE = 300.0

MID_LOBES = [   # a flatter bank, upper left (plane 2)
    (120, 214, 120, 0.42), (270, 200, 96, 0.5), (390, 216, 70, 0.45), (30, 226, 90, 0.4), (200, 182, 60, 0.55),
    (470, 226, 40, 0.4),
]
MID_BOX = (0, 120, 560, 290)
MID_BASE = 246.0

FAR_LOBES = [   # a thin low deck in the west gap (plane 3)
    (60, 662, 80, 0.3), (190, 668, 64, 0.32), (300, 660, 78, 0.28), (420, 672, 52, 0.3), (520, 668, 44, 0.3),
    (640, 676, 60, 0.26), (110, 640, 46, 0.4),
]
FAR_BOX = (0, 600, 760, 710)
FAR_BASE = 684.0


def paint_streaks(layer, pal, rng, sun=SUN, n_rows=4):
    """Thin horizon streaks along the sun line (the farthest plane): 4 rows above the horizon, lower = thinner and
    longer; each streak a level flat stroke, two-tone: a rose body a step off the band, its underside lit by the
    sun (brightest near the sun's x), crisp below, softer above, long taper away from the sun."""
    rows = [(HORIZON - 16, 3.0, 4.5), (HORIZON - 30, 4.0, 6.0), (HORIZON - 48, 5.0, 8.0), (HORIZON - 74, 6.0, 10.0)]
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
            body = mix(base, pal['streak'], 0.55 - 0.1 * ri)
            left_tail = xc > sun[0]          # the long taper points away from the sun
            ti, to = (0.45, 0.15) if left_tail else (0.15, 0.45)
            ang = math.radians(rng.normal(0, 0.35))
            p0 = (x, yy)
            p1 = (x + L * math.cos(ang), yy + L * math.sin(ang))
            paint_line(layer, p0, p1, wd, body, rng.uniform(0.55, 0.8), e_pos=0.8, e_neg=1.6, t_in=ti, t_out=to,
                       taper_w=0.5)
            lit = mix(body, pal['glow'], 0.35 + 0.65 * near)
            lit = lift(lit, 0.03 * near)
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


BIRD_POSES = [(-0.55, 0.35), (-0.25, 0.25), (0.0, 0.15), (0.35, -0.1), (0.6, -0.25)]   # wing tip lift, elbow lift


def paint_flock(layer, pal, rng, path, n=46, span=(5.0, 13.0), band=34.0, far_k=0.45, ss=4):
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
    n_cl = max(3, n // 6)
    centres = np.sort(rng.beta(1.3, 1.3, n_cl))
    birds = []
    for i in range(n):
        if rng.random() < 0.12:
            t = rng.uniform(0, 1); off = rng.normal(0, band * 1.6)
        else:
            t = float(np.clip(centres[rng.integers(n_cl)] + rng.normal(0, 0.035), 0, 1)); off = rng.normal(0, band * 0.5)
        px_ = (1 - t) ** 2 * ax + 2 * (1 - t) * t * bx + t * t * cx_
        py_ = (1 - t) ** 2 * ay + 2 * (1 - t) * t * by + t * t * cy_ + off
        birds.append((t, px_ + rng.normal(0, 6), py_))
    for (t, px_, py_) in birds:
        sp = span[0] + (span[1] - span[0]) * (t ** 1.3) * rng.uniform(0.75, 1.15)
        tip, elbow = BIRD_POSES[rng.integers(len(BIRD_POSES))]
        tip += rng.normal(0, 0.08)
        a = sp * 0.5
        lw = max(1, int(round((0.9 + 0.8 * t) * ss)))
        bxp, byp = (px_ - x0) * ss, (py_ - y0) * ss
        tilt = rng.normal(0, 0.12)
        for side in (-1, 1):
            ex = bxp + side * a * 0.48 * ss
            ey = byp - elbow * a * ss * 0.9 + side * tilt * a * ss * 0.5
            tx_ = bxp + side * a * ss
            ty_ = byp - tip * a * ss + side * tilt * a * ss
            dr.line([(bxp, byp), (ex, ey), (tx_, ty_)], fill=255, width=lw, joint='curve')
        dr.ellipse([bxp - lw * 0.8, byp - lw * 0.6, bxp + lw * 0.8, byp + lw * 0.9], fill=255)
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
