#!/usr/bin/env python3
"""Sky and clouds: the painting recipe as code (video/docs/look/paint_recipes/sky_clouds.md).

A standalone, seeded proof. It paints every element of the sky family at the film's own scale (px of a 1080 x 1920
frame: an October canal evening at King's Cross, a low sun on the left) and lays each one beside the reference crops
that show it:

    python3 video/scripts/look/paint/recipes/sky_clouds.py               # the swatch sheet
    python3 video/scripts/look/paint/recipes/sky_clouds.py --plate P.png  # + the 1080 x 900 sky plate alone
    python3 video/scripts/look/paint/recipes/sky_clouds.py --check        # + the numbers against the refs

Elements: the sky gradient (dusk, daylight), the near cumulus, banks and decks in depth planes, thin horizon streaks,
the sun and its glow, a far flock. The method (the owner's): DESIGN the flat shapes first, in one colour family lit by
one light (3-4 values per mass), then BRUSH them in passes: big soft strokes blurred, then flat-brush scoop strokes
along each billow (one crisp edge, one soft), then a few crisp strokes at the light edges, then the speckle on near
masses only; each plane converges on the sky and blurs more the farther it is. All colour maths in OKLab. Every random
draw comes from np.random.default_rng([SEED, element, k]): the same seed gives the same PNG. numpy + PIL + scipy
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


def mix(a, b, t):
    return a + (b - a) * t


def lift(c, dL=0.0, da=0.0, db=0.0):
    return (np.asarray(c, np.float32) + np.array([dL, da, db], np.float32)).astype(np.float32)


# THE LIMITED PALETTE (15 swatches per light; recipe 2.1). Sampled from the approved v4 design's light (one dusk family
# lit by the low sun: lavender zenith, lilac caption field, rose, a pale warm band, peach horizon) and set by target
# CIELAB values: the sky inside CRAFT section g (zenith 1.1 L* deeper than the flat field, the band the lightest, the
# cool-warm crossing at C* 7); the clouds with the references' value range (lit +7, half = the sky's value as a hue
# step, shade -11, deep -20 L* against the field), every swatch within the family's hues (lilac 295-310, rose 30-350,
# peach-gold 60-84).
DUSK = {k: hx(v) for k, v in {
    'zenith': '#c9c6e2',     # L* 80.9 C* 15 h 295  lavender, a touch deeper and cooler than the field
    'field': '#d3c8dd',      # L* 82.0 C* 12 h 310  the caption field, flat through y 317-556
    'rose': '#e6ccd7',       # L* 84.4 C* 11 h 349  rose-lilac under the field
    'band': '#eddcd6',       # L* 88.9 C* 7  h 46   the light band: the sky's lightest, the cool-warm crossing
    'horizon': '#f3d6c3',    # L* 87.5 C* 15 h 61   the warm horizon = the far AIR
    'glow': '#ffdfbe',       # L* 90.7 C* 21 h 73   the sun's warmth (an ellipse, never in the caption band)
    'sun': '#fff0db',        # L* 95.5 C* 12 h 82   the disc: one flat step over its band
    'rim': '#ffe8c3',        # L* 93.0 C* 21 h 84   cloud rim: the lightest cloud value, thin, at the sun-facing edges
    'lit': '#ffd6b2',        # L* 88.2 C* 25 h 68   cloud lit, peach-gold
    'half': '#eec0ba',       # L* 81.5 C* 18 h 31   cloud half-light: rose-peach AT the sky's value (a hue step)
    'shade_top': '#beb8d3',  # L* 76.0 C* 15 h 300  shade facing up: lit by the sky dome
    'shade': '#b4a9c9',      # L* 71.1 C* 18 h 304  cloud shade, lilac-violet
    'deep': '#a18fb4',       # L* 62.1 C* 22 h 310  accent: the core and the base away from the sun; small areas
    'streak': '#ddbecd',     # L* 80.0 C* 14 h 346  horizon streak body (rose); its lit underside takes 'glow'
    'bird': '#5a506f',       # L* 36.1 C* 20 h 304  the far flock
}.items()}

DAY = {k: hx(v) for k, v in {   # the posters' daylight (Cape Town, Singapore): a flat pale blue, white clouds
    'zenith': '#b5d0df', 'field': '#c0d5df', 'rose': '#cddde1', 'band': '#e0e7e1', 'horizon': '#e9e5da',
    'glow': '#f4edde', 'sun': '#fcf9f2', 'rim': '#fbf9f3', 'lit': '#f4f0e9', 'half': '#d2dfe4',
    'shade_top': '#c5d4dd', 'shade': '#aec1cf', 'deep': '#95abbf', 'streak': '#cedce2', 'bird': '#53606a',
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
    """The dry-brush texture, in stroke space: rows = across (px), cols = along (px); uniform 0..1, streaky along
    (the bristles), blotchy at a larger scale (the paint load)."""
    if 'b' not in _TEX:
        rng = np.random.default_rng([SEED, 999])
        g = rng.random((256, 2048)).astype(np.float32)
        g = ndi.gaussian_filter(g, (0.7, 14.0), mode='wrap')
        g += 0.6 * ndi.gaussian_filter(rng.random((256, 2048)).astype(np.float32), (3.0, 60.0), mode='wrap')
        r = np.argsort(np.argsort(g.ravel())).reshape(g.shape)
        _TEX['b'] = (r / r.size).astype(np.float32)
    return _TEX['b']


def sample_tex(along, across):
    return ndi.map_coordinates(bristle_tex(), [across, along], order=1, mode='wrap').astype(np.float32)


# ------------------------------------------------------------------------------------------ the canvas
class Layer:
    """A paint layer: OKLab colour with straight alpha. `over` is the Porter-Duff source-over of a coverage map
    (0..1) of one colour; `blur` blurs premultiplied colour and alpha together (no dark fringes)."""

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
        col = np.asarray(col, np.float32)
        self.c[sl] = c0 + (col - c0) * t[..., None]
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

    def copy(self):
        o = Layer(self.h, self.w)
        o.c, o.a = self.c.copy(), self.a.copy()
        return o

    def rgb(self, dither_seed=None):
        lab = self.c.astype(np.float64)
        rgb = ok2rgb(lab.reshape(-1, 3)).reshape(self.h, self.w, 3) * 255.0
        if dither_seed is not None:   # CRAFT g.4: +-2 codes at a 2 px grain (0.28 L* rms), so the encoder keeps no band
            rng = np.random.default_rng([SEED, dither_seed])
            d = noise(rng, self.h, self.w, 1.0)[..., None] * 0.7 + (rng.random(rgb.shape) - rng.random(rgb.shape)) * 0.5
            rgb += d
        return np.clip(np.round(rgb), 0, 255).astype(np.uint8)


# ------------------------------------------------------------------------------------------ the brushes
# A stroke is a brush stamp SWEPT along a path (recipe 6.2): for every pixel near the path we know u (0..1 along) and
# s (px across, + = the right of travel; on an arc + = the convex side). The coverage is across(s) x along(u) x
# bristle(u, s). This is the continuous limit of stamping dabs at a small spacing, with no stamp seams.
def _box(xmin, ymin, xmax, ymax, H, W):
    x0, y0 = max(0, int(math.floor(xmin))), max(0, int(math.floor(ymin)))
    x1, y1 = min(W, int(math.ceil(xmax)) + 1), min(H, int(math.ceil(ymax)) + 1)
    if x1 <= x0 or y1 <= y0:
        return None
    Y, X = np.mgrid[y0:y1, x0:x1].astype(np.float32)
    return (slice(y0, y1), slice(x0, x1)), X + 0.5, Y + 0.5


def line_uv(p0, p1, pad, H, W):
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


def arc_uv(c, R, a0, a1, pad, H, W, fl=1.0):
    """An arc stroke's frame (centre c, radius R, angle a0 -> a1 in radians, image y down; fl < 1 flattens the arc
    into an ellipse of half-height R*fl): u along (0..1), s across (px; + outside, the convex side)."""
    cx, cy = c
    ang = np.linspace(a0, a1, 40)
    xs, ys = cx + R * np.cos(ang), cy + R * fl * np.sin(ang)
    b = _box(xs.min() - pad, ys.min() - pad, xs.max() + pad, ys.max() + pad, H, W)
    if b is None:
        return None
    sl, X, Y = b
    span = a1 - a0
    d = np.mod((np.arctan2((Y - cy) / fl, X - cx) - a0) * np.sign(span), 2 * np.pi)
    d = np.where(d > np.pi + abs(span) / 2, d - 2 * np.pi, d)
    return sl, d / abs(span), np.hypot(X - cx, (Y - cy) / fl) - R, abs(span) * R


def stroke_cov(u, s, L, w, e_pos=1.0, e_neg=1.0, t_in=0.12, t_out=0.25, taper_w=0.0, dry=0.0, tex_off=(0.0, 0.0),
               round_=False):
    """Coverage (0..1) of one stroke in its own frame.
    w: width (px); e_pos / e_neg: edge softness (px) on the +s / -s side (ONE crisp edge, one soft); t_in / t_out: the
    fraction of the length over which it fades in / out; taper_w: how much the two ends thin (a pressure curve); dry: 0 =
    loaded, 1 = nearly dry (the bristle texture breaks it, more toward its tail); round_: the soft round brush (Gaussian
    across) instead of the flat chisel."""
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


def paint_arc(layer, c, R, a0, a1, w, col, op, fl=1.0, **kw):
    r = arc_uv(c, R, a0, a1, w + 4, layer.h, layer.w, fl)
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
    """The designed gradient (recipe 3.1 a): key colours at heights (px), one monotone cubic per OKLab channel (no stop
    line, no overshoot). The caption field is flat through the band; the light band is the lightest."""
    if style == 'dusk':
        stops = [(0, pal['zenith']), (CAPTION[0], pal['field']), (CAPTION[1], pal['field']),
                 (655, pal['rose']), (738, pal['band']), (HORIZON, pal['horizon']), (H, pal['horizon'])]
    else:
        stops = [(0, pal['zenith']), (CAPTION[0], pal['field']), (CAPTION[1], pal['field']),
                 (690, pal['rose']), (772, pal['band']), (HORIZON, pal['horizon']), (H, pal['horizon'])]
    ys = np.array([s[0] for s in stops], np.float64)
    cs = np.array([s[1] for s in stops], np.float64)
    return PchipInterpolator(ys, cs, axis=0)(np.arange(H) + 0.5).astype(np.float32)


def sun_warmth(H, W, sun, rx, ry, top_cut):
    """The sun is part of the sky (CRAFT g.2): a low, wide ellipse of warmth (ry = 0.45 rx), gone at its rim with a
    smootherstep (no edge, no ring), cut off above `top_cut` (never in the caption band)."""
    Y, X = np.mgrid[0:H, 0:W].astype(np.float32) + 0.5
    r = np.hypot((X - sun[0]) / rx, (Y - sun[1]) / ry)
    return (smootherstep(1.0, 0.0, r) * smoothstep(top_cut, top_cut + 90.0, Y)).astype(np.float32)


def hatch_field(rng, H, W, angle=35.0, period=9.0, width=(1.4, 2.4), seg=70.0, on=0.38):
    """The 03 hatch (recipe 3.1 b, pass P3): thin straight lines rising to the right at `angle` deg, `period` px apart
    (each line jittered +-25 %), each line `width` px, broken along its length into segments (~`seg` px correlation,
    `on` = the fraction drawn), each line lighter or darker. Returns a signed field in -1..1 (x the amplitude later).
    Built as a field (one line index per pixel), not as thousands of strokes: same look, a fraction of the CPU."""
    a = math.radians(angle)
    tx, ty = math.cos(a), -math.sin(a)             # along: right and up (image y is down)
    nx, ny = -ty, tx                               # across
    Y, X = np.mgrid[0:H, 0:W].astype(np.float32) + 0.5
    n = X * nx + Y * ny
    t = X * tx + Y * ty
    k = np.floor(n / period).astype(np.int64)
    k0 = int(k.min())
    nk = int(k.max()) - k0 + 1
    off = rng.uniform(-0.25, 0.25, nk) * period
    wid = rng.uniform(*width, nk)
    sgn = np.where(rng.random(nk) < 0.62, 1.0, -1.0)   # 62 % lighter than the field, as in 03
    amp = rng.uniform(0.6, 1.0, nk)
    ph = rng.uniform(0, 1e5, nk)
    ki = k - k0
    c = (k + 0.5) * period + off[ki]
    prof = smoothstep(wid[ki] * 0.5 + 0.6, wid[ki] * 0.5 - 0.6, np.abs(n - c))
    # segments along each line: a 1-D smooth noise sampled at t / seg + the line's own phase
    m = 8192
    n1 = ndi.gaussian_filter1d(np.random.default_rng([SEED, 31]).standard_normal(m), 3.0, mode='wrap')
    n1 = (n1 - n1.mean()) / n1.std()
    pos = np.mod(t / seg * 4.0 + ph[ki], m)
    i0 = np.floor(pos).astype(np.int64)
    fr = pos - i0
    v = n1[i0 % m] * (1 - fr) + n1[(i0 + 1) % m] * fr
    thr = float(np.quantile(n1, 1.0 - on))
    segm = smoothstep(thr - 0.15, thr + 0.35, v)
    return (prof * segm * sgn[ki] * amp[ki]).astype(np.float32)


def paint_sky(H, W, pal, style, rng, sun=SUN, glow=0.55, stages=None):
    """The sky (recipe 3.1): (a) the designed gradient + the sun's warmth; P1 big soft round strokes of the neighbouring
    colour, blurred sigma 24 (the wash moving within the calm); P2 mid soft strokes, blurred sigma 6; P3 [dusk] the
    hatch in patches, never over the caption; P4 [day] the posters' paper tooth. Returns the opaque sky Layer."""
    ramp = sky_ramp(pal, H, style)
    sky = Layer(H, W, alpha=1.0)
    sky.c[...] = ramp[:, None, :]
    calm = np.ones(H, np.float32)          # inside the caption band the paint keeps 25-30 % of its variation
    calm[CAPTION[0] - 30:CAPTION[1] + 30] = 0.3
    if style == 'dusk':
        g = sun_warmth(H, W, sun, 0.44 * FW, 0.45 * 0.44 * FW, CAPTION[1]) * glow
        sky.c[...] = sky.c + (pal['glow'] - sky.c) * g[..., None]
    if stages is not None:
        stages['sky_design'] = sky.copy()
    # P1 big soft strokes: 14 long round strokes, width 160-320, +-0.6-1.0 L*, opacity 0.30-0.45, then blur sigma 24
    p1 = Layer(H, W)
    for _ in range(14):
        y = rng.uniform(0, H)
        x = rng.uniform(-0.3, 0.7) * W
        L = rng.uniform(0.5, 1.1) * W
        ang = math.radians(rng.normal(-4, 2))
        yi = int(np.clip(y, 0, H - 1))
        base = sky.c[yi, int(np.clip(x + L / 2, 0, W - 1))]
        dl = rng.choice([-1, 1]) * rng.uniform(0.006, 0.010) * calm[yi]
        col = lift(base, dl, rng.normal(0, 0.003) * calm[yi], rng.normal(0, 0.003) * calm[yi])
        paint_line(p1, (x, y), (x + L * math.cos(ang), y + L * math.sin(ang)), rng.uniform(160, 320), col,
                   rng.uniform(0.30, 0.45), round_=True, t_in=0.3, t_out=0.3)
    p1.blur(24).onto(sky)
    # P2 mid soft strokes: 40 round strokes, width 40-90, +-0.6-1.0 L*, opacity 0.30-0.45, then blur sigma 6
    p2 = Layer(H, W)
    for _ in range(40):
        y, x = rng.uniform(0, H), rng.uniform(-0.2, 0.9) * W
        L = rng.uniform(0.25, 0.6) * W
        ang = math.radians(rng.normal(-5, 3))
        yi = int(np.clip(y, 0, H - 1))
        col = lift(sky.c[yi, int(np.clip(x + L / 2, 0, W - 1))], rng.choice([-1, 1]) * rng.uniform(0.006, 0.010) * calm[yi])
        paint_line(p2, (x, y), (x + L * math.cos(ang), y + L * math.sin(ang)), rng.uniform(40, 90), col,
                   rng.uniform(0.3, 0.45), round_=True, t_in=0.3, t_out=0.4)
    p2.blur(6).onto(sky)
    if style == 'dusk':
        # P3 the hatch: +-0.5-0.8 L*, 2 px lines 9 px apart at 35 deg, in elongated patches covering ~35 % of the sky,
        # x0.25 in the caption band, fading out over the warm horizon band
        hf = hatch_field(rng, H, W)
        patch = smoothstep(0.15, 1.1, noise(rng, H, W, 150, aniso=2.0, angle=-35.0))
        ys = np.arange(H, dtype=np.float32)[:, None]
        fade = np.where((ys > CAPTION[0] - 30) & (ys < CAPTION[1] + 30), 0.25, 1.0) * smoothstep(760, 640, ys)
        sky.c[..., 0] += hf * patch * fade * 0.0065
    else:
        # P4 the paper tooth: +-0.35 L* fine, very slightly streaky (vertical fibres), and broad patches +-0.3 L*
        sky.c[..., 0] += noise(rng, H, W, 0.9, aniso=2.5, angle=90.0) * 0.0035
        sky.c[..., 0] += noise(rng, H, W, 120, aniso=1.5) * 0.003 * calm[:, None]
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


def billow_sdf(X, Y, b, idx):
    """One billow's signed distance (px, + inside): a circle (flattened by fl into an ellipse for bank humps) whose
    radius wobbles +-4.5 % in 3 slow harmonics (seeded by its index): a painted billow, never a compass circle."""
    cx, cy, r, fl = b[0], b[1], b[2], b[3]
    th = np.arctan2((Y - cy) / fl, X - cx)
    ph = np.random.default_rng([SEED, 77, idx]).uniform(0, 2 * np.pi, 3)
    rr = r * (1.0 + 0.045 * (0.6 * np.sin(2 * th + ph[0]) + 0.3 * np.sin(3 * th + ph[1]) + 0.2 * np.sin(5 * th + ph[2])))
    return rr - np.hypot(X - cx, (Y - cy) / fl)


def light_dir(c, sun, top=0.25):
    """The one light, seen from this mass: toward the sun's image position, mixed with a little sky-dome light from
    above (top). A low sun lights the near cumulus from the left and the banks above it from below."""
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


def fill_out(c, inside):
    """Colour outside a shape = the colour of the nearest inside pixel, so soft and dry edges fade in the edge's own
    colour (never darken toward an undefined outside)."""
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


def visible_arc(b, i, owner, D, x0, y0, centre_ang, half_span, inset=3.0, n=61):
    """The longest arc of billow i, within centre_ang +- half_span, where billow i is what we see (it owns the pixel)
    `inset` px inside its rim. Returns (a0, a1) or None."""
    cx, cy, r, fl = b[0], b[1], b[2], b[3]
    h, w = owner.shape
    angs = centre_ang + np.linspace(-half_span, half_span, n)
    ok = []
    for a in angs:
        px_, py_ = cx + (r - inset) * math.cos(a), cy + (r - inset) * fl * math.sin(a)
        ix, iy = int(px_ - x0), int(py_ - y0)
        ok.append(0 <= iy < h and 0 <= ix < w and owner[iy, ix] == i and D[iy, ix] > 1.0)
    b0, b1 = longest_run(ok)
    if b1 - b0 < 4:
        return None
    return float(angs[b0]), float(angs[b1 - 1])


def ramp_plan(F, cuts, soft, deep_t, shade_c, pal):
    """The continuous value plan from F (0 = no light .. 1 = full light): deep -> shade -> half -> lit (smooth)."""
    c0, c1, c2 = cuts
    t_sh = smoothstep(c0 - soft, c0 + soft, F)[..., None]
    t_mid = smoothstep(c1 - soft, c1 + soft, F)[..., None]
    t_lit = smoothstep(c2 - soft, c2 + soft, F)[..., None]
    deep = mix(pal['deep'][None, None], shade_c, 1.0 - deep_t[..., None])
    cont = mix(deep, shade_c, t_sh)
    cont = cont + (pal['half'] - cont) * t_mid
    cont = cont + (pal['lit'] - cont) * t_lit
    return cont.astype(np.float32)


def paint_mass(box, billows, pal, sky, rng, prm, sun=SUN, stages=None):
    """One cloud plane, designed then painted (recipe 3.2 / 3.3). box = (x0, y0, x1, y1) in plate px; billows =
    [(cx, cy, r, fl, z)], z = the draw order (higher = in front). The designer puts each billow that lies farther from
    the light IN FRONT, so every front billow's lit edge lies over the shade side of the one behind it.
    Returns (Layer over the box, the flat design over the box (OKLab), the mask)."""
    x0, y0, x1, y1 = box
    h, w = y1 - y0, x1 - x0
    Y, X = np.mgrid[y0:y1, x0:x1].astype(np.float32) + 0.5
    order = sorted(range(len(billows)), key=lambda i: billows[i][4])
    size = max(b[2] for b in billows)
    # ---- geometry: the union's signed distance, the base cut, who owns each pixel ----
    ds = [billow_sdf(X, Y, b, i) for i, b in enumerate(billows)]
    D = ds[order[0]]
    for i in order[1:]:
        D = smax(D, ds[i], prm['k_smooth'])
    D = norm_sdf(D)
    base_y = prm.get('base_y')
    wob = noise(rng, h, w, 40, aniso=4.0) * prm['base_wobble']
    if base_y is not None:
        D = smin(D, (base_y - Y) + wob, prm['base_soft'])
    holes = ndi.binary_fill_holes(D > 0) & (D <= 0)          # slivers of sky trapped between billows: fill them
    D = np.where(holes, 6.0, D).astype(np.float32)
    M = smoothstep(-1.0, 1.0, D)
    inside = M > 0.5
    owner = np.full((h, w), -1, np.int32)
    for i in order:
        owner[ds[i] > 0] = i
    own_fill = owner.copy()                                  # pixels inside the union but outside every billow (the
    if (inside & (owner < 0)).any():                         # smooth-union fillets): owned by the nearest billow
        _, (iy, ix) = ndi.distance_transform_edt(owner < 0, return_indices=True)
        own_fill = owner[iy, ix]
    cen = np.array([(X * M).sum() / M.sum(), (Y * M).sum() / M.sum()])
    l2 = light_dir(cen, sun, prm['top_light'])
    L3 = np.array([l2[0], l2[1], prm['lz']])
    L3 /= np.linalg.norm(L3)
    # ---- (a) DESIGN: ONE big form lit from one side (2-3 value zones), then a lit cap at each billow's sun-facing
    # edge, brighter on the lit side of the mass. Never a full light-to-shade ramp per billow: that draws eggs. ----
    sf = prm['form_sigma'] * size
    Mb = gauss(M, sf)
    gy_b, gx_b = np.gradient(Mb)
    gn_b = np.hypot(gx_b, gy_b) + 1e-6
    e_b = smoothstep(0.0, 1.0, gn_b * sf * 2.5)
    facing_big = (-gx_b * l2[0] - gy_b * l2[1]) / gn_b * e_b       # the big shape's outward normal . light
    step = size * 0.05
    od = gauss(light_depth(M, l2, step=step, n=30), step * 1.5)
    att = np.exp(-od / (prm['penetration'] * size))
    F_big = prm['w_att'] * att + (1.0 - prm['w_att']) * (0.5 + 0.5 * facing_big)
    if inside.any():
        lo, hi = np.percentile(F_big[inside], [2, 98])
        F_big = np.clip((F_big - lo) / max(hi - lo, 1e-3), 0.0, 1.0)
    B = np.array([b[:4] for b in billows], np.float32)
    bx, by, br, bf = (B[own_fill, j] for j in range(4))
    u = (X - bx) / br
    v = (Y - by) / (br * bf)
    rho = np.hypot(u, v)
    sc_ = np.minimum(rho, 1.0) / np.maximum(rho, 1e-6)
    u, v = u * sc_, v * sc_
    nz = np.sqrt(np.clip(1.0 - u * u - v * v, 0.0, 1.0))
    nx, ny = u, v / bf
    nn = np.sqrt(nx * nx + ny * ny + nz * nz) + 1e-6
    nx, ny, nz = nx / nn, ny / nn, nz / nn
    lam = np.clip(nx * L3[0] + ny * L3[1] + nz * L3[2], 0.0, 1.0)  # the billow as a sphere (an ellipsoid for humps)
    dlx, dly = l2[0], l2[1] / bf                                    # how far inside the rim, measured toward the light
    dln = np.hypot(dlx, dly)
    dlx, dly = dlx / dln, dly / dln
    bq = u * dlx + v * dly
    t_rim = (-bq + np.sqrt(np.clip(bq * bq - (u * u + v * v - 1.0), 0.0, None))) * br
    cap = smoothstep(prm['cap_lam'][0], prm['cap_lam'][1], lam) * smoothstep(prm['cap_w'] * br, 0.0, t_rim)
    F = F_big + prm['cap_gain'] * cap * (prm['cap_floor'] + (1.0 - prm['cap_floor']) * F_big)
    F = np.clip(F, 0.0, 1.0).astype(np.float32)
    up_big = np.clip(gy_b / gn_b * e_b, 0.0, 1.0)                    # faces turned up: the sky dome lights the shade
    skyl = np.clip(0.55 * np.clip(-ny, 0.0, 1.0) + 0.45 * up_big, 0.0, 1.0)
    shade_c = mix(pal['shade'][None, None], pal['shade_top'][None, None], skyl[..., None] * prm['skylight'])
    low = smoothstep(cen[1] - 0.2 * size, cen[1] + 0.6 * size, Y)  # the deep accent lives low, at the base
    deep_t = (smoothstep(prm['cuts'][0] + 0.06, prm['cuts'][0] - 0.06, F) * low).astype(np.float32)
    cont = ramp_plan(F, prm['cuts'], prm['soft_cut'], deep_t, shade_c, pal)
    q = np.digitize(F, prm['cuts'][1:])
    flat = np.where((q == 0)[..., None], mix(shade_c, pal['deep'][None, None], (deep_t > 0.5)[..., None].astype(np.float32)),
                    np.where((q == 1)[..., None], pal['half'], pal['lit']))
    # the rim, in the design too: the lightest value, a thin band on the silhouette where it faces the light
    ggy, ggx = np.gradient(gauss(D, 4.0))
    ggn = np.hypot(ggx, ggy) + 1e-6
    facing = (-ggx * l2[0] - ggy * l2[1]) / ggn
    if prm['rim_px'] > 0:
        rim_m = (D > 0) & (D < prm['rim_px']) & (facing > 0.45)
        flat = np.where(rim_m[..., None], pal['rim'], flat)
    flat = fill_out(flat.astype(np.float32), inside)
    cont = fill_out(cont, inside)
    # ---- (b) PAINT passes on an opaque canvas over the box ----
    canvas = Layer(h, w, alpha=1.0)
    canvas.c[...] = gauss(flat, prm['p0_blur'])                          # P0: the flats, brushed soft
    if stages is not None:
        stages['P0'] = canvas.copy()
    # P1: big soft round strokes, tangent to each billow, colours from the plan, then blurred
    p1 = Layer(h, w)
    for i in order:
        cx, cy, r, fl = billows[i][:4]
        ys_i, xs_i = np.nonzero((owner == i) & (ds[i] > 0.15 * r))
        if len(xs_i) == 0:
            continue
        for _ in range(int(round(prm['n_soft'] * (0.5 + r / size)))):
            j = rng.integers(len(xs_i))
            px_, py_ = xs_i[j] + 0.5, ys_i[j] + 0.5
            th = math.atan2((py_ + y0 - cy) / fl, px_ + x0 - cx) + math.pi / 2 + rng.normal(0, 0.25)
            if fl < 0.6:
                th = math.radians(prm['wind'] + rng.normal(0, 3))
            L = rng.uniform(0.6, 1.1) * r
            col = lift(cont[ys_i[j], xs_i[j]], rng.normal(0, 0.008), rng.normal(0, 0.003), rng.normal(0, 0.003))
            wd = rng.uniform(0.35, 0.55) * r * (fl if fl < 0.6 else 1.0) * (1.6 if fl < 0.6 else 1.0)
            paint_line(p1, (px_ - L / 2 * math.cos(th), py_ - L / 2 * math.sin(th)),
                       (px_ + L / 2 * math.cos(th), py_ + L / 2 * math.sin(th)), wd, col,
                       rng.uniform(0.25, 0.4), round_=True, t_in=0.35, t_out=0.35)
    p1.blur(prm['p1_blur']).onto(canvas)
    if stages is not None:
        stages['P1'] = canvas.copy()
    # P2: flat-brush SCOOP strokes along each billow's visible lit arc: the outermost one's convex edge ON the billow's
    # edge (crisp), the next ones stepping inward (p02); one or two darker soft scoops on the shade half. Bank humps
    # (fl < 0.6) get level flat strokes instead, crisp on the side toward the light.
    p2 = Layer(h, w)
    a_l = math.atan2(l2[1], l2[0])
    for i in order:
        cx, cy, r, fl = billows[i][:4]
        if fl >= 0.6:
            arc = visible_arc(billows[i], i, owner, D, x0, y0, a_l, 1.75)
            if arc is not None:
                aa, ab = arc
                n_s = int(np.clip(round(1 + prm['n_scoop'] * r / size), 1, prm['n_scoop'] + 1))
                inset = 0.0
                for s_ in range(n_s):
                    wd = float(np.clip(rng.uniform(*prm['scoop_w']) * r, prm['scoop_px'][0], prm['scoop_px'][1]))
                    full = ab - aa
                    span = full * (rng.uniform(0.7, 0.95) if s_ == 0 else rng.uniform(0.35, 0.7))
                    mid_a = float(np.clip(a_l + rng.normal(0, 0.35), aa + span / 2, ab - span / 2)) if full > span else 0.5 * (aa + ab)
                    R = r - wd * 0.5 - inset
                    mx_ = int(cx + (R) * math.cos(mid_a) - x0)
                    my_ = int(cy + (R) * fl * math.sin(mid_a) - y0)
                    if not (0 <= my_ < h and 0 <= mx_ < w):
                        continue
                    toward = math.cos(mid_a - a_l)
                    col = lift(cont[my_, mx_], prm['scoop_lift'] * max(toward, 0.0) * (1.0 if s_ == 0 else 0.6)
                               + rng.normal(0, 0.003), rng.normal(0, 0.002), rng.normal(0, 0.002))
                    paint_arc(p2, (cx - x0, cy - y0), R, mid_a - span / 2, mid_a + span / 2, wd, col,
                              rng.uniform(0.6, 0.85), fl=fl, e_pos=prm['scoop_edge'], e_neg=wd * 0.45, t_in=0.1,
                              t_out=0.35, taper_w=0.55, dry=rng.uniform(0.0, 0.3), tex_off=tex_off(rng))
                    inset += wd * rng.uniform(0.7, 1.1)
            sh = visible_arc(billows[i], i, owner, D, x0, y0, a_l + math.pi, 1.2, inset=0.3 * r)
            if sh is not None and r > 0.25 * size:
                for _ in range(prm['n_shade_scoop']):
                    aa, ab = sh
                    span = (ab - aa) * rng.uniform(0.4, 0.8)
                    mid_a = rng.uniform(aa + span / 2, ab - span / 2) if ab - aa > span else 0.5 * (aa + ab)
                    wd = float(np.clip(rng.uniform(0.2, 0.32) * r, 10, 40))
                    R = r * rng.uniform(0.55, 0.8)
                    mx_, my_ = int(cx + R * math.cos(mid_a) - x0), int(cy + R * fl * math.sin(mid_a) - y0)
                    if not (0 <= my_ < h and 0 <= mx_ < w) or owner[my_, mx_] != i:
                        continue
                    paint_arc(p2, (cx - x0, cy - y0), R, mid_a - span / 2, mid_a + span / 2, wd,
                              lift(cont[my_, mx_], -0.012), rng.uniform(0.35, 0.5), fl=fl, e_pos=3.0, e_neg=wd * 0.5,
                              t_in=0.25, t_out=0.4, taper_w=0.6)
        else:
            nb = int(round(prm['n_level'] * (r / size) ** 0.6))
            for _ in range(nb):
                sx = cx + rng.uniform(-0.85, 0.85) * r
                sy = cy + rng.uniform(-0.6, 0.6) * r * fl
                ix, iy = int(sx - x0), int(sy - y0)
                if not (0 <= iy < h and 0 <= ix < w) or D[iy, ix] < 2 or owner[iy, ix] != i:
                    continue
                L = rng.uniform(0.5, 1.1) * r
                ang = math.radians(prm['wind'] + rng.normal(0, 2.0))
                lit_side = F[iy, ix] > 0.5
                col = lift(cont[iy, ix], (0.012 if lit_side else -0.008) + rng.normal(0, 0.004))
                bw = rng.uniform(*prm['level_w'])
                below = l2[1] > 0.3                         # lit from below: the crisp edge is the stroke's bottom
                paint_line(p2, (ix - L / 2, iy - L / 2 * math.tan(ang)), (ix + L / 2, iy + L / 2 * math.tan(ang)), bw, col,
                           rng.uniform(0.5, 0.8), e_pos=(1.0 if below else 3.0), e_neg=(3.0 if below else 1.0),
                           t_in=0.06, t_out=0.4, dry=rng.uniform(0.1, 0.35), tex_off=tex_off(rng))
    p2.blur(prm['p2_blur']).onto(canvas)
    if stages is not None:
        stages['P2'] = canvas.copy()
    # P3: the crisp light edges. Rims: on each billow's silhouette arc that faces the light, a thin stroke whose outer
    # edge sits ON the outline (crisp, 0.7 px), its inner edge soft, both ends tapered: ONE crisp edge, never a
    # two-edged crescent. The lit underside of a bank lit from below: one level crisp stroke along its base.
    p3 = Layer(h, w)
    if prm['n_rim']:
        cand = [i for i in order if billows[i][3] >= 0.6 and billows[i][2] >= prm['rim_min_r']]
        cand.sort(key=lambda i: -np.dot(np.array(billows[i][:2]) - cen, l2))
        nrim = 0
        for i in cand:
            if nrim >= prm['n_rim']:
                break
            cx, cy, r, fl = billows[i][:4]
            angs = a_l + np.linspace(-1.4, 1.4, 57)
            out = []
            for a in angs:
                ix, iy = int(cx + (r + 3) * math.cos(a) - x0), int(cy + (r + 3) * fl * math.sin(a) - y0)
                out.append(0 <= iy < h and 0 <= ix < w and D[iy, ix] < -1.0)
            b0, b1 = longest_run(out)
            if b1 - b0 < 6:
                continue
            a0_, a1_ = angs[b0], angs[b1 - 1]
            warm = float(np.clip(1.3 - math.hypot(cx - sun[0], cy - sun[1]) / 900.0, 0.6, 1.0))
            rw = rng.uniform(*prm['rim_w']) * (0.55 + 0.45 * min(1.0, r / size))
            col = mix(pal['lit'], pal['rim'], 0.6 + 0.4 * warm)
            paint_arc(p3, (cx - x0, cy - y0), r - rw * 0.5 + 0.5, a0_, a1_, rw, col, rng.uniform(0.85, 0.95) * warm,
                      e_pos=0.7, e_neg=rw * 0.55, t_in=0.2, t_out=0.3, taper_w=0.8)
            nrim += 1
    if prm.get('underside') and base_y is not None:
        xs_b = np.nonzero(inside[int(np.clip(base_y - y0 - 3, 0, h - 1))])[0]
        if len(xs_b):
            xa, xb = xs_b.min() + x0, xs_b.max() + x0
            x = xa + rng.uniform(0, 30)
            while x < xb - 20:
                L = rng.uniform(70, 220)
                near = float(np.exp(-abs(x + L / 2 - sun[0]) / 380.0))
                col = lift(mix(pal['lit'], pal['glow'], near), 0.008 + 0.02 * near)
                yb = base_y - y0 - prm['underside'] * 0.5 + rng.normal(0, 1.0)
                paint_line(p3, (x - x0, yb), (min(x + L, xb) - x0, yb + rng.normal(0, 1.0)), prm['underside'] * rng.uniform(0.8, 1.2),
                           col, 0.55 + 0.4 * near, e_pos=0.8, e_neg=2.2, t_in=0.25, t_out=0.3, taper_w=0.4)
                x += L + rng.uniform(20, 70)
    p3.blur(prm['p3_blur']).onto(canvas)
    if stages is not None:
        stages['P3'] = canvas.copy()
    # ---- (c) EDGES: the silhouette's alpha, crisp toward the light, soft or dry-broken away from it ----
    ew = mix(prm['edge_shade'], prm['edge_lit'], smoothstep(-0.45, 0.1, facing))
    near_base = np.zeros((h, w), np.float32)
    if base_y is not None:
        near_base = smoothstep(prm['base_soft'] * 2.5, 0.0, np.abs(base_y - Y + wob)) * smoothstep(-0.2, 0.2, -ggy / ggn)
        ew = mix(ew, prm['edge_base'], near_base)
    shade_side = smoothstep(-0.1, -0.5, facing) * smoothstep(0.1, -0.3, facing_big)
    n_side = np.clip(noise(rng, h, w, prm['dry_cell'], aniso=prm['dry_aniso'], angle=prm['wind']), -1.6, 1.6)
    n_base = np.clip(noise(rng, h, w, prm['dry_cell'] * 2.0, aniso=8.0, angle=prm['wind']), -1.6, 1.6)
    in_band = smoothstep(1.2, 0.0, np.abs(D) / ew)
    dd = D + (n_side * ew * prm['dry_amp'] * shade_side * (1.0 - near_base)
              + n_base * prm['edge_base'] * prm['base_drag'] * near_base) * in_band
    canvas.a[...] = smoothstep(-ew * 0.5, ew * 0.5, dd)
    # P4 (near masses only): the speckle dissolve on the side away from the light (sky-coloured holes inside the edge,
    # cloud-coloured flecks outside it, thinning over ~40 px), and a few light flecks off the lit edge
    if prm['n_speck']:
        dissolve = (facing_big < -0.15) | ((near_base > 0.3) & (X > cen[0] + 0.3 * size))
        band = (D < 10) & (D > -30) & dissolve & (facing < 0.2)
        ys_b, xs_b = np.nonzero(band)
        for _ in range(prm['n_speck'] if len(xs_b) else 0):
            j = rng.integers(len(xs_b))
            dist = D[ys_b[j], xs_b[j]]
            if rng.random() > math.exp(-abs(dist) / 14.0):
                continue
            yy, xx = ys_b[j], xs_b[j]
            rr_ = rng.uniform(0.7, 2.2)
            if dist > 0:      # a hole: the sky shows through the dissolving cloud
                b_ = _box(xx - rr_ - 2, yy - rr_ - 2, xx + rr_ + 2, yy + rr_ + 2, h, w)
                if b_ is not None:
                    sl, Xs, Ys = b_
                    cut = np.clip(rr_ + 0.5 - np.hypot(Xs - xx - 0.5, Ys - yy - 0.5), 0.0, 1.0) * rng.uniform(0.5, 0.9)
                    canvas.a[sl] *= (1.0 - cut).astype(np.float32)
            else:             # a fleck of cloud just off the edge
                col = mix(canvas.c[yy, xx], sky.c[y0 + yy, x0 + xx], 0.25)
                paint_speck(canvas, xx + 0.5, yy + 0.5, rr_, col, rng.uniform(0.5, 0.9))
        lit_band = (D < -3) & (D > -30) & (facing > 0.45)
        ys_b, xs_b = np.nonzero(lit_band)
        for _ in range(prm['n_spatter'] if len(xs_b) else 0):
            j = rng.integers(len(xs_b))
            paint_speck(canvas, xs_b[j] + 0.5, ys_b[j] + 0.5, rng.uniform(1.0, 2.4), pal['rim'], rng.uniform(0.3, 0.6))
    # ---- (d) DEPTH: converge on the sky behind by k, then blur the plane ----
    if prm['k'] > 0:
        behind = sky.c[y0:y1, x0:x1]
        canvas.c[...] = canvas.c + (behind - canvas.c) * prm['k']
        flat = flat + (behind - flat) * prm['k']
    canvas.blur(prm['plane_blur'])
    return canvas, flat.astype(np.float32), M


# THE DEPTH LADDER (recipe 3.3 d): one row per plane, px of the 1080 frame. k = how far its colours move toward the sky
# behind it; plane_blur = the sigma after all passes; edge_* = the 10-90 % edge widths.
DEPTH = {
    'near': dict(k=0.0, plane_blur=0.0, k_smooth=6.0, base_soft=18.0, base_wobble=10.0, top_light=0.4, lz=0.35,
                 penetration=1.0, lam_pow=0.9, att_floor=0.22, skylight=0.8, cuts=[0.16, 0.36, 0.64], soft_cut=0.06,
                 rim_px=5.0, p0_blur=4.0, n_soft=3, p1_blur=7.0, n_scoop=3, scoop_w=(0.16, 0.28), scoop_px=(9, 38),
                 scoop_lift=0.018, scoop_edge=1.1, n_shade_scoop=2, n_level=8, level_w=(10, 22), p2_blur=0.6,
                 n_rim=7, rim_w=(5, 10), rim_min_r=24, underside=0, p3_blur=0.0,
                 edge_lit=1.8, edge_shade=16.0, edge_base=30.0, base_drag=0.35, dry_cell=4.0, dry_aniso=7.0,
                 dry_amp=0.7, n_speck=520, n_spatter=14, wind=-6.0),
    'mid': dict(k=0.30, plane_blur=1.3, k_smooth=10.0, base_soft=8.0, base_wobble=3.0, top_light=0.3, lz=0.3,
                penetration=1.2, lam_pow=1.0, att_floor=0.35, skylight=0.8, cuts=[0.12, 0.38, 0.7], soft_cut=0.08,
                rim_px=0.0, p0_blur=3.0, n_soft=2, p1_blur=6.0, n_scoop=2, scoop_w=(0.16, 0.26), scoop_px=(8, 26),
                scoop_lift=0.012, scoop_edge=1.5, n_shade_scoop=0, n_level=9, level_w=(8, 18), p2_blur=1.0,
                n_rim=0, rim_w=(4, 7), rim_min_r=999, underside=6.0, p3_blur=0.6,
                edge_lit=2.6, edge_shade=12.0, edge_base=2.6, base_drag=0.0, dry_cell=5.0, dry_aniso=9.0,
                dry_amp=0.5, n_speck=0, n_spatter=0, wind=-3.0),
    'far': dict(k=0.45, plane_blur=2.4, k_smooth=12.0, base_soft=6.0, base_wobble=2.0, top_light=0.2, lz=0.3,
                penetration=1.4, lam_pow=1.0, att_floor=0.45, skylight=0.6, cuts=[0.1, 0.36, 0.68], soft_cut=0.1,
                rim_px=0.0, p0_blur=2.5, n_soft=2, p1_blur=5.0, n_scoop=1, scoop_w=(0.15, 0.22), scoop_px=(6, 16),
                scoop_lift=0.008, scoop_edge=2.0, n_shade_scoop=0, n_level=7, level_w=(6, 12), p2_blur=1.5,
                n_rim=0, rim_w=(3, 5), rim_min_r=999, underside=4.0, p3_blur=1.0,
                edge_lit=3.5, edge_shade=12.0, edge_base=3.5, base_drag=0.0, dry_cell=6.0, dry_aniso=10.0,
                dry_amp=0.35, n_speck=0, n_spatter=0, wind=-2.0),
}


# -------------------------------------------------------------------------------------- the designs
# The designed masses (plate px; billows = (cx, cy, r, fl, z)). Sizes in a ladder (1 : 0.75 : 0.55 : 0.4 : 0.25 :
# 0.15), the biggest at the back of the tower, the small ones only along the lit edge; never a necklace of equal circles.
# Light from the left (the low sun): billows farther right sit in front, so each lit edge lies over a shade.
NEAR = [
    (1062, 66, 104, 1.0, 1), (968, 14, 74, 1.0, 0), (900, 92, 80, 1.0, 2), (852, 40, 30, 1.0, 1.5),
    (838, 164, 70, 1.0, 3), (792, 118, 27, 1.0, 2.5), (990, 178, 132, 1.0, 4), (764, 222, 56, 1.0, 5),
    (734, 184, 22, 1.0, 4.5), (704, 254, 35, 1.0, 6), (664, 274, 19, 1.0, 7), (902, 256, 66, 1.0, 8),
    (1040, 262, 78, 1.0, 9),
]
NEAR_BOX = (560, 0, 1080, 345)
NEAR_BASE = 300.0

MID = [   # a long bank, upper left (plane 2): low humps on a level base lit from below, a thin wisp above
    (30, 214, 96, 0.36, 1), (140, 204, 92, 0.42, 2), (246, 210, 78, 0.38, 3), (334, 218, 60, 0.36, 4),
    (410, 224, 42, 0.34, 5), (468, 229, 24, 0.3, 6), (300, 172, 72, 0.15, 0), (392, 166, 50, 0.13, 0),
]
MID_BOX = (0, 120, 560, 290)
MID_BASE = 240.0

FAR = [   # a thin low deck in the west gap (plane 3): smaller, flatter, closer to the sky, lit underneath
    (40, 664, 84, 0.27, 1), (168, 668, 68, 0.3, 2), (282, 662, 74, 0.25, 3), (396, 671, 54, 0.27, 4),
    (498, 670, 44, 0.27, 5), (606, 676, 58, 0.23, 6), (698, 680, 38, 0.23, 7),
]
FAR_BOX = (0, 610, 780, 706)
FAR_BASE = 686.0


def paint_streaks(layer, pal, rng, sun=SUN, n_rows=4):
    """Thin horizon streaks along the sun line (the farthest plane, recipe 3.4): 4 rows above the horizon, lower =
    thinner and longer; each streak a level flat stroke, two-tone: a rose body a step off the band, its underside lit
    by the sun (brightest near the sun's x), crisp below, softer above, the long taper pointing away from the sun."""
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
            ti, to = (0.45, 0.15) if xc > sun[0] else (0.15, 0.45)
            ang = math.radians(rng.normal(0, 0.35))
            p0 = (x, yy)
            p1 = (x + L * math.cos(ang), yy + L * math.sin(ang))
            paint_line(layer, p0, p1, wd, body, rng.uniform(0.7, 0.9), e_pos=0.8, e_neg=1.6, t_in=ti, t_out=to,
                       taper_w=0.5)
            lit = lift(mix(body, pal['glow'], 0.45 + 0.55 * near), 0.012 + 0.04 * near)
            paint_line(layer, (p0[0], p0[1] + wd * 0.32), (p1[0], p1[1] + wd * 0.32), wd * 0.42, lit,
                       (0.45 + 0.5 * near), e_pos=0.6, e_neg=1.2, t_in=ti, t_out=to, taper_w=0.6)
            x += L + gap


def paint_sun(layer, pal, sun=SUN, r=20.0):
    """The disc (recipe 3.5): a flat shape one step over its band, a crisp edge (1.2 px), no halo; the far roofs cut it
    with one near-level edge (they are painted over it)."""
    b = _box(sun[0] - r - 3, sun[1] - r - 3, sun[0] + r + 3, sun[1] + r + 3, layer.h, layer.w)
    if b is None:
        return
    sl, X, Y = b
    cov = smoothstep(r + 0.6, r - 0.6, np.hypot(X - sun[0], Y - sun[1]))
    band_c = layer.c[int(min(sun[1] - r - 6, layer.h - 1)), int(sun[0])]
    layer.over(sl, cov.astype(np.float32), mix(band_c, pal['sun'], 0.85))


def paint_flock(layer, pal, rng, path, n=46, span=(3.5, 9.5), band=26.0, far_k=0.55, ss=4):
    """A far flock (recipe 3.6): n tiny two-stroke birds along a gentle arc, in loose clumps with gaps and a few
    stragglers; nearer birds (toward path[2]) bigger and darker; every pose different (wings up, level, down). Drawn as
    polylines at 4x and box-filtered down: crisp, never jaggy."""
    (ax, ay), (bx, by), (cx_, cy_) = path
    H, W = layer.h, layer.w
    xs, ys = [ax, bx, cx_], [ay, by, cy_]
    x0, x1 = int(max(0, min(xs) - 60)), int(min(W, max(xs) + 60))
    y0, y1 = int(max(0, min(ys) - band * 2 - 30)), int(min(H, max(ys) + band * 2 + 30))
    bw, bh = x1 - x0, y1 - y0
    big = Image.new('L', (bw * ss, bh * ss), 0)
    dr = ImageDraw.Draw(big)
    n_cl = max(4, n // 5)
    centres = np.sort(rng.uniform(0.0, 1.0, n_cl))
    birds = []
    for _ in range(n):
        if rng.random() < 0.18:
            t = rng.uniform(0, 1)
            off = rng.normal(0, band * 1.4)
        else:
            t = float(np.clip(centres[rng.integers(n_cl)] + rng.normal(0, 0.045), 0, 1))
            off = rng.normal(0, band * 0.5)
        px_ = (1 - t) ** 2 * ax + 2 * (1 - t) * t * bx + t * t * cx_
        py_ = (1 - t) ** 2 * ay + 2 * (1 - t) * t * by + t * t * cy_ + off
        birds.append((t, px_ + rng.normal(0, 6), py_))
    for (t, px_, py_) in birds:
        sp = span[0] + (span[1] - span[0]) * (t ** 1.3) * rng.uniform(0.75, 1.15)
        lift_ = float(np.clip(rng.normal(0.25, 0.3), -0.35, 0.75))     # the wing tips: up (V) ... level ... down
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
    tt = np.linspace(0, 1, bw)[None, :] if cx_ >= ax else np.linspace(1, 0, bw)[None, :]
    sl = (slice(y0, y1), slice(x0, x1))
    behind = layer.c[sl]
    col = behind + (pal['bird'] - behind) * (1.0 - far_k * (1.0 - tt))[..., None]
    layer.over(sl, cov * 0.92, col)


def ridge(layer, pal, y=HORIZON, rng=None):
    """A placeholder far roofline (not this family: the city's own recipe paints it) so the horizon and the sun read in
    the plate: a flat haze shape, the AIR one step darker, a few roof steps."""
    H, W = layer.h, layer.w
    top = np.full(W, float(y))
    x = 0
    while x < W:
        wdt = int(rng.uniform(30, 110))
        hgt = rng.choice([0, 6, 10, 16, 26, 40], p=[.3, .2, .2, .15, .1, .05])
        top[x:x + wdt] = y - hgt
        x += wdt
    Y = np.arange(H)[:, None] + 0.5
    cov = smoothstep(top[None, :] - 0.5, top[None, :] + 0.5, Y).astype(np.float32)
    layer.over((slice(0, H), slice(0, W)), cov, lift(mix(pal['horizon'], pal['shade'], 0.35), -0.03))
    return top


# ----------------------------------------------------------------------------------- the plate
def paint_plate(pal=DUSK, style='dusk', seed=SEED, with_ridge=True, stages=None, near=True, flock=True):
    """The October canal evening sky, all elements together, far to near: sky -> streaks -> far deck -> mid bank ->
    near cumulus -> flock -> sun -> (placeholder ridge). Each plane is its own layer."""
    H, W = PLATE_H, FW
    t0 = time.time()
    sky = paint_sky(H, W, pal, style, np.random.default_rng([seed, 1]), stages=stages)
    plate = sky.copy()
    paint_streaks(plate, pal, np.random.default_rng([seed, 4]))
    far, far_flat, _ = paint_mass(FAR_BOX, FAR, pal, sky, np.random.default_rng([seed, 3]), dict(DEPTH['far'], base_y=FAR_BASE))
    far.onto(plate, FAR_BOX[0], FAR_BOX[1])
    mid, mid_flat, _ = paint_mass(MID_BOX, MID, pal, sky, np.random.default_rng([seed, 2]), dict(DEPTH['mid'], base_y=MID_BASE))
    mid.onto(plate, MID_BOX[0], MID_BOX[1])
    if near:
        st = {} if stages is not None else None
        nr, near_flat, near_M = paint_mass(NEAR_BOX, NEAR, pal, sky, np.random.default_rng([seed, 5]),
                                           dict(DEPTH['near'], base_y=NEAR_BASE), stages=st)
        nr.onto(plate, NEAR_BOX[0], NEAR_BOX[1])
        if stages is not None:
            stages.update({'near_' + k: v for k, v in st.items()})
            stages['near_flat'], stages['near_M'], stages['near_layer'] = near_flat, near_M, nr
    if flock:
        paint_flock(plate, pal, np.random.default_rng([seed, 6]), path=((330, 612), (520, 576), (760, 600)))
    paint_sun(plate, pal)
    if with_ridge:   # the roofs cut the disc with one near-level edge
        ridge(plate, pal, rng=np.random.default_rng([seed, 7]))
    if stages is not None:
        stages['mid_flat'], stages['far_flat'], stages['sky'] = mid_flat, far_flat, sky
    return plate, sky, time.time() - t0


# ----------------------------------------------------------------------------------- the sheet
def font(sz, bold=False):
    p = '/usr/share/fonts/truetype/dejavu/DejaVuSans%s.ttf' % ('-Bold' if bold else '')
    try:
        return ImageFont.truetype(p, sz)
    except OSError:
        return ImageFont.load_default()


def ref(path, box):
    return Image.open(os.path.join(LOOK, path)).convert('RGB').crop(box)


def to_img(a):
    return Image.fromarray(a) if isinstance(a, np.ndarray) else a


def row(tiles, height, width, gap=10):
    """Lay (image, caption) tiles in one row at a common height, shrunk to fit the width."""
    ims = [to_img(t[0]) for t in tiles]
    ws = [im.width * height / im.height for im in ims]
    s = min(1.0, (width - gap * (len(ims) - 1)) / sum(ws))
    hh = int(height * s)
    return [(im.resize((max(1, int(round(im.width * hh / im.height))), hh), Image.LANCZOS), cap)
            for im, cap in zip(ims, [t[1] for t in tiles])], hh


def layer_on(layer, sky_c, box):
    """A mass Layer over its box, composited on the sky behind it, as RGB."""
    x0, y0, x1, y1 = box
    bg = Layer(y1 - y0, x1 - x0, alpha=1.0)
    bg.c[...] = sky_c[y0:y1, x0:x1]
    layer.onto(bg)
    return bg.rgb(23)


def build_sheet(path, seed=SEED, plate_path=None):
    t0 = time.time()
    stages = {}
    plate, sky, _ = paint_plate(DUSK, 'dusk', seed, stages=stages)
    P = plate.rgb(31)
    if plate_path:
        Image.fromarray(P).save(plate_path)
    day = paint_sky(PLATE_H, FW, DAY, 'day', np.random.default_rng([seed, 41]))
    planes, _, _ = paint_plate(DUSK, 'dusk', seed, near=False, flock=False)
    PL = planes.rgb(51)
    S = sky.c
    nb = NEAR_BOX
    design = Layer(nb[3] - nb[1], nb[2] - nb[0], alpha=1.0)
    design.c[...] = S[nb[1]:nb[3], nb[0]:nb[2]]
    fl = Layer(design.h, design.w)
    fl.c[...] = stages['near_flat']
    fl.a[...] = (stages['near_M'] > 0.5).astype(np.float32)
    fl.onto(design)
    passes = []
    for k in ('P0', 'P1', 'P2', 'P3'):
        L_ = stages['near_' + k].copy()
        L_.a[...] = (stages['near_M'] > 0.5).astype(np.float32) * 0.0 + stages['near_layer'].a
        passes.append((layer_on(L_, S, nb), 'after %s' % k))
    final = layer_on(stages['near_layer'], S, nb)
    WIDTH = 1600
    rows = []
    rows.append(('1  SKY GRADIENT  a calm field that moves in hue, not value (<= 6 L*), a faint hatch in patches (dusk) or a paper tooth (day)', [
        (ref('refs_human_scale/03_beach_dusk.jpg', (300, 8, 900, 230)), 'ref 03 sky + hatch'),
        (ref('refs_paint/01_beach_van_dusk.jpg', (300, 28, 720, 250)), 'ref p01 dusk'),
        (ref('poster_refs/05_cape_town.jpg', (60, 140, 700, 520)), 'ref Cape Town day'),
        (Image.fromarray(sky.rgb(12)[0:860]), 'ours: dusk sky'),
        (Image.fromarray(day.rgb(41)[0:860]), 'ours: daylight sky'),
    ], 300))
    rows.append(('2  NEAR CUMULUS  designed in 4 values from one light (billow caps, the front billow lit over the shade behind), then brushed', [
        (ref('refs_human_scale/02_bus_stop_night.jpg', (430, 10, 980, 340)), 'ref 02 cumulus'),
        (ref('refs_paint/02_lighthouse_process.jpg', (790, 620, 1160, 1060)), 'ref p02 scoops'),
        (ref('refs_human_scale/04_cloud_beast_frame.jpg', (300, 200, 720, 760)), 'ref 04 lit edge'),
        (Image.fromarray(design.rgb(21)), 'ours: DESIGN (flat)'),
        (Image.fromarray(final), 'ours: PAINTED'),
    ], 360))
    rows.append(('2b  THE PASSES  P0 flats blurred 4 px, P1 soft strokes blurred 7, P2 scoops blurred 0.6, P3 crisp rims; then edges + speckle', [
        passes[0], passes[1], passes[2], passes[3], (Image.fromarray(final), 'final (edges, speckle)'),
    ], 230))
    rows.append(('3  BANKS AND DECKS IN DEPTH PLANES  far = closer to the sky (k .30 / .45), softer (blur 1.3 / 2.4 px), flatter, lit from below', [
        (ref('refs_human_scale/03_beach_dusk.jpg', (560, 80, 1206, 350)), 'ref 03 banks'),
        (ref('refs_paint/02_lighthouse_process.jpg', (226, 700, 560, 1180)), 'ref p02 far layer'),
        (ref('refs_human_scale/01_city_hill_sunset.jpg', (0, 0, 620, 300)), 'ref 01 lit undersides'),
        (Image.fromarray(PL[100:720, 0:760]), 'ours: mid bank + far deck + streaks'),
    ], 300))
    rows.append(('4  HORIZON STREAKS  thin level two-tone strokes on the sun line, lit undersides brightest near the sun', [
        (ref('refs_human_scale/03_beach_dusk.jpg', (0, 370, 760, 452)), 'ref 03 horizon'),
        (Image.fromarray(P[700:800, 0:760]), 'ours'),
    ], 150))
    rows.append(('5  SUN AND GLOW  a flat disc one step over its band, a low wide warmth (ry 0.45 rx), no halo, no ring', [
        (ref('refs_human_scale/03_beach_dusk.jpg', (260, 360, 560, 470)), 'ref 03 sun'),
        (ref('refs_human_scale/01_city_hill_sunset.jpg', (520, 0, 1050, 260)), 'ref 01 glow'),
        (Image.fromarray(P[560:860, 0:640]), 'ours'),
    ], 230))
    rows.append(('6  FAR FLOCK  tiny two-stroke birds, loose clumps along an arc, every pose different, nearer = bigger and darker', [
        (ref('refs_human_scale/03_beach_dusk.jpg', (430, 345, 1000, 445)), 'ref 03 flock'),
        (ref('refs_human_scale/04_cloud_beast_frame.jpg', (330, 890, 660, 1000)), 'ref 04 light birds'),
        (Image.fromarray(P[530:660, 280:820]), 'ours'),
    ], 160))
    phone = Image.fromarray(P).resize((400, int(400 * PLATE_H / FW)), Image.LANCZOS)
    rows.append(('7  ALL TOGETHER AT PHONE WIDTH (400 px)  the October canal evening sky plate, 1080 x 900, a placeholder roofline', [
        (ref('refs_human_scale/03_beach_dusk.jpg', (0, 0, 1206, 470)).resize((400, 156), Image.LANCZOS), 'ref 03 at 400 px'),
        (ref('refs_human_scale/02_bus_stop_night.jpg', (0, 0, 1206, 360)).resize((400, 119), Image.LANCZOS), 'ref 02 at 400 px'),
        (phone, 'ours at 400 px'),
    ], 333))
    pad, title_h, cap_h = 18, 30, 22
    laid, total_h = [], 70
    for title, tiles, hgt in rows:
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
    return time.time() - t0, sheet.size, P


# ----------------------------------------------------------------------------------- checks
def check(P, sky_rgb):
    """The recipe's numbers on the painted plate (recipe 6.6)."""
    from skimage import color
    L = color.rgb2lab(P.astype(np.float64) / 255.0)[..., 0]
    Ls = color.rgb2lab(sky_rgb.astype(np.float64) / 255.0)[..., 0]

    def tex(a, box):
        x0, y0, x1, y1 = box
        a = a[y0:y1, x0:x1]
        return [float(np.std(a - ndi.gaussian_filter(a, s))) for s in (1.5, 4, 12)] + \
               [float(np.percentile(a, 98) - np.percentile(a, 2))]
    print('open sky: residual std L* (sigma 1.5 / 4 / 12) and range; refs: 03 .36/.60/.86 range 4.1, '
          'Cape Town .31/.45/.56 range 4.1')
    for name, box in [('top sky (0-110)', (40, 0, 540, 110)), ('caption band', (150, 330, 800, 480)),
                      ('below caption', (40, 570, 1040, 640))]:
        print('  %-18s %s' % (name, ' / '.join('%.2f' % v for v in tex(Ls, box))))
    band = Ls[CAPTION[0]:CAPTION[1], 150:800]
    print('caption band L* spread p2-98 (CRAFT <= 1.5): %.2f (mean %.1f)' % (np.percentile(band, 98) - np.percentile(band, 2), band.mean()))
    x0, y0, x1, y1 = NEAR_BOX
    cl = L[y0:y1, x0:x1]
    sk = Ls[y0:y1, x0:x1]
    diff = np.abs(cl - sk) > 1.5
    if diff.any():
        v = cl[diff]
        print('near cumulus L* p2/25/50/75/98: %s vs its sky %.1f (refs: 11-33 L* inside, 6-30 off the sky)'
              % ('/'.join('%.0f' % q for q in np.percentile(v, [2, 25, 50, 75, 98])), float(np.median(sk))))


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--out', default=OUT)
    ap.add_argument('--seed', type=int, default=SEED)
    ap.add_argument('--plate', default=None, help='also save the 1080 x 900 sky plate here')
    ap.add_argument('--check', action='store_true')
    a = ap.parse_args()
    dt, size, P = build_sheet(a.out, a.seed, a.plate)
    print('wrote %s %dx%d in %.1f s' % (a.out, size[0], size[1], dt))
    if a.check:
        sky = paint_sky(PLATE_H, FW, DUSK, 'dusk', np.random.default_rng([a.seed, 1]))
        check(P, sky.rgb(12))


if __name__ == '__main__':
    main()
