#!/usr/bin/env python3
"""Water and reflections: the painting recipe as code (video/docs/look/paint_recipes/water.md).

Paints the recipe's water elements as swatches in the scene's own light (an October dusk at the
King's Cross canal, a low sun on the left; colours sampled from paint_still_v4), puts each beside
the reference crop that shows it, and writes video/docs/look/paint_recipes/water_swatch.png
(1600 px wide). Row 7 applies the whole recipe to the v4 canal layout. Every size is in frame px
at 1080 x 1920.

  python3 video/scripts/look/paint/recipes/water.py                 # the sheet
  python3 video/scripts/look/paint/recipes/water.py --seed 7        # a new painting of the same design
  python3 video/scripts/look/paint/recipes/water.py --scratch /tmp/recipes/water/work/run
                                    # + each swatch at frame scale and a phone-size check (400 px frame)

Deterministic: every element, pass and stroke family draws from its own generator, keyed by
(seed, element, pass), so changing one element never changes another. numpy, PIL and scipy only.
It reads the references and the v4 stills, and writes only the sheet (and the scratch files).
"""
import argparse
import hashlib
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont
from scipy import ndimage as ndi

VIDEO = Path(__file__).resolve().parents[4]
LOOK = VIDEO / 'docs' / 'look'
OUT = LOOK / 'paint_recipes' / 'water_swatch.png'
V4 = VIDEO / 'docs' / 'studies' / '2026-10-28_city_posters' / 'paint_test'


# ----------------------------------------------------------------------------------------------
# 0. Seeds, colour, noise
# ----------------------------------------------------------------------------------------------
def rng_for(seed, *keys):
    """One generator per (seed, element, pass, ...): deterministic and independent of the others."""
    h = hashlib.sha256(('%d|' % seed + '|'.join(map(str, keys))).encode()).digest()
    return np.random.default_rng(int.from_bytes(h[:8], 'little'))


def hexrgb(h):
    h = h.lstrip('#')
    return np.array([int(h[i:i + 2], 16) for i in (0, 2, 4)], np.float64) / 255.0


_M = np.array([[0.4124564, 0.3575761, 0.1804375], [0.2126729, 0.7151522, 0.0721750],
               [0.0193339, 0.1191920, 0.9503041]])
_MI = np.linalg.inv(_M)
_WP = np.array([0.95047, 1.0, 1.08883])


def lab(c):
    """sRGB (..., 3) in 0-1 -> CIE Lab (D65)."""
    c = np.clip(np.asarray(c, np.float64), 0, 1)
    c = np.where(c > 0.04045, ((c + 0.055) / 1.055) ** 2.4, c / 12.92)
    xyz = c @ _M.T / _WP
    f = np.where(xyz > 216 / 24389, np.cbrt(xyz), (24389 / 27 * xyz + 16) / 116)
    return np.stack([116 * f[..., 1] - 16, 500 * (f[..., 0] - f[..., 1]), 200 * (f[..., 1] - f[..., 2])], -1)


def rgb(l):
    """CIE Lab (..., 3) -> sRGB 0-1 (clipped)."""
    l = np.asarray(l, np.float64)
    fy = (l[..., 0] + 16) / 116
    f = np.stack([fy + l[..., 1] / 500, fy, fy - l[..., 2] / 200], -1)
    xyz = np.where(f ** 3 > 216 / 24389, f ** 3, (116 * f - 16) / (24389 / 27)) * _WP
    c = xyz @ _MI.T
    c = np.where(c > 0.0031308, 1.055 * np.clip(c, 0, None) ** (1 / 2.4) - 0.055, 12.92 * c)
    return np.clip(c, 0, 1)


def shift(c, dL=0.0, cmul=1.0, dh=0.0):
    """Move colour(s) in LCh: lighter/darker (dL, L* units), richer/greyer (cmul), a hue turn (dh, degrees)."""
    l = lab(c)
    C = np.hypot(l[..., 1], l[..., 2]) * cmul
    h = np.arctan2(l[..., 2], l[..., 1]) + np.radians(dh)
    return rgb(np.stack([l[..., 0] + dL, C * np.cos(h), C * np.sin(h)], -1))


def mix(c1, c2, t):
    """Mix colours in Lab (t = the share of c2; arrays broadcast)."""
    t = np.asarray(t, np.float64)
    if t.ndim:
        t = t[..., None]
    return rgb(lab(c1) * (1 - t) + lab(c2) * t)


def grad(stops, s):
    """A Lab gradient: stops = [(s, rgb), ...]; s any shape -> (..., 3) RGB."""
    s = np.asarray(s, np.float64)
    ss = np.array([p[0] for p in stops])
    ll = np.array([lab(p[1]) for p in stops])
    return rgb(np.stack([np.interp(s, ss, ll[:, i]) for i in range(3)], -1))


def lerp(a, b, t):
    return a + (b - a) * t


def smooth(x):
    x = np.clip(x, 0.0, 1.0)
    return x * x * (3 - 2 * x)


class Noise:
    """A tileable anisotropic value-noise texture, uniform in [0, 1], long along x: the bristle
    streaks and the dry-brush breaks of every horizontal stroke read windows of it."""

    def __init__(self, rng, size=512, sx=7.0, sy=0.75):
        n = ndi.gaussian_filter(rng.standard_normal((size, size)), (sy, sx), mode='wrap')
        self.t = (n.ravel().argsort().argsort().reshape(n.shape) / (n.size - 1)).astype(np.float32)
        self.size = size

    def window(self, rng, h, w):
        oy, ox = rng.integers(0, self.size, 2)
        return self.t[np.ix_((np.arange(h) + oy) % self.size, (np.arange(w) + ox) % self.size)]


def field(rng, h, w, cy, cx):
    """Smooth value noise in [0, 1] with features about cy x cx px (calm/windy patches, tone bands)."""
    g = rng.random((int(np.ceil(h / cy)) + 4, int(np.ceil(w / cx)) + 4))
    yy, xx = np.meshgrid(np.arange(h) / cy + 1.5, np.arange(w) / cx + 1.5, indexing='ij')
    f = ndi.map_coordinates(g, [yy, xx], order=3, mode='nearest')
    return (f - f.min()) / max(1e-6, f.max() - f.min())


# ----------------------------------------------------------------------------------------------
# 1. Layers and the brush
# ----------------------------------------------------------------------------------------------
class Layer:
    """One paint pass: premultiplied colour + alpha. Strokes go on with 'over'; the finished pass is
    blurred by its plane's sigma, then composited onto the canvas inside the design's mask."""

    def __init__(self, h, w):
        self.rgb = np.zeros((h, w, 3), np.float32)
        self.a = np.zeros((h, w), np.float32)

    def over(self, col, a, y0, x0):
        H, W = self.a.shape
        h, w = a.shape
        ya, yb, xa, xb = max(y0, 0), min(y0 + h, H), max(x0, 0), min(x0 + w, W)
        if ya >= yb or xa >= xb:
            return
        aa = a[ya - y0:yb - y0, xa - x0:xb - x0]
        cc = col[ya - y0:yb - y0, xa - x0:xb - x0]
        self.rgb[ya:yb, xa:xb] = self.rgb[ya:yb, xa:xb] * (1 - aa[..., None]) + cc * aa[..., None]
        self.a[ya:yb, xa:xb] = self.a[ya:yb, xa:xb] * (1 - aa) + aa

    def fill(self, col, a):
        self.a[:] = a
        self.rgb[:] = np.asarray(col, np.float32) * a[..., None]
        return self

    def blur(self, sigma):
        if np.max(sigma) > 0:
            s = tuple(np.broadcast_to(sigma, 2))
            self.rgb = ndi.gaussian_filter(self.rgb, (*s, 0))
            self.a = ndi.gaussian_filter(self.a, s)
        return self

    def onto(self, cv, mask=None, mode='over'):
        a = self.a if mask is None else self.a * mask
        c = self.rgb if mask is None else self.rgb * mask[..., None]
        if mode == 'over':
            cv[:] = cv * (1 - a[..., None]) + c
        else:  # 'screen': lifts the underpaint and keeps its variation (glow)
            cv[:] = 1 - (1 - cv) * (1 - c)
        return cv


END_STYLES = ((0.6, 0.25), (0.1, 0.6), (0.1, 0.15))  # (thin_end, dry): taper / square-dry / blunt


def chisel(layer, nz, rng, x0, x1, yc, h, col, op=0.9, slope=0.0, bow=0.0, soft=0.9, t1=0.25,
           thin_end=0.45, dry=0.35, bdepth=0.16, cj=0.012, pressure=0.12, rag=0.5):
    """One flat-brush stroke along a near-horizontal path (x0 -> x1; x1 < x0 pulls it right to left).
    The brush touches down blunt and full at x0; over the last t1 of the run it lifts (thins by
    thin_end) and dries (a share `dry` breaks up along the bristles). h = the brush width (stroke
    thickness, px); soft = the edge ramp (px: 0.7 crisp flat paint .. 0.45*h a soft wash);
    pressure = the hand's slow thickness change along the run (+-share); rag = the dry-brush
    raggedness of the two long edges (px); bdepth = bristle streaks in the alpha; cj = the colour
    drift of the paint load along the run."""
    rev = x1 < x0
    xs_f, xe_f = (x1, x0) if rev else (x0, x1)
    run = max(xe_f - xs_f, 1.0)
    xa, xb = int(np.floor(xs_f)) - 2, int(np.ceil(xe_f)) + 3
    xs = np.arange(xa, xb) + 0.5
    u = np.clip((xs - xs_f) / run, 0, 1)
    if rev:
        u = 1 - u
    yl = yc + slope * (xs - x0) + bow * 4 * u * (1 - u)
    prof = (0.86 + 0.14 * smooth(u / 0.06)) * (1 - thin_end * smooth((u - (1 - t1)) / max(t1, 1e-3)))
    if pressure > 0:
        prof = prof * (1 + pressure * (ndi.gaussian_filter1d(nz.window(rng, 1, len(xs))[0], 6) - 0.5) * 4)
    hh = 0.5 * h * prof
    ya = int(np.floor((yl - hh).min() - soft - rag)) - 1
    yb = int(np.ceil((yl + hh).max() + soft + rag)) + 2
    ys = np.arange(ya, yb) + 0.5
    dist = hh[None, :] - np.abs(ys[:, None] - yl[None, :])
    if rag > 0:
        dist = dist + rag * (nz.window(rng, len(ys), len(xs)) - 0.5) * 2
    a = np.clip(dist / soft + 0.5, 0, 1)
    a *= (np.clip((xs - xs_f) / 0.9 + 0.5, 0, 1) * np.clip((xe_f - xs) / 0.9 + 0.5, 0, 1))[None, :]
    hgt, wid = a.shape
    if dry > 0:
        thr = dry * smooth((u - (1 - 1.6 * t1)) / (1.6 * t1))
        a *= smooth((nz.window(rng, hgt, wid) - thr[None, :]) / 0.08 + 1)
    nb = nz.window(rng, hgt, wid)
    if bdepth > 0:
        a *= 1 - bdepth * nb
    c = np.empty((hgt, wid, 3), np.float32)
    c[:] = np.asarray(col, np.float32)
    if cj > 0:
        c += ((nz.window(rng, 1, wid)[0] - 0.5) * 2 * cj)[None, :, None]
        c += ((nb - 0.5) * cj)[..., None]
    layer.over(np.clip(c, 0, 1), (a * op).astype(np.float32), ya, xa)


def stroke(layer, nz, rng, x0, x1, yc, h, col, op, soft, dry_scale=1.0, bdepth=0.14, cj=0.01, bow=None):
    """A flat stroke with a random end style (taper / square-dry / blunt) and a hand's small wobble."""
    te, dr = END_STYLES[int(rng.choice(3, p=(0.4, 0.4, 0.2)))]
    chisel(layer, nz, rng, x0, x1, yc, h, col, op=op, slope=rng.normal(0, 0.004),
           bow=rng.normal(0, 0.08 * h) if bow is None else bow, soft=soft, t1=rng.uniform(0.15, 0.4),
           thin_end=te, dry=dr * dry_scale, bdepth=bdepth, cj=cj)


# ----------------------------------------------------------------------------------------------
# 2. The palette: sampled from the scene's light; the water palette derived by the recipe's rules
# ----------------------------------------------------------------------------------------------
KX_LIGHT = {  # King's Cross canal, October dusk, low sun on the left (sampled from paint_still_v4)
    'sky_top': '#b4b6da', 'sky_upper': '#d0c5e0', 'sky_band': '#e6d1d3', 'sky_low': '#e2c4b8',
    'sky_horizon': '#fbdbbc', 'sun': '#ee6a2e', 'cloud_shade': '#b79ab9', 'window': '#f7cf86',
    'door': '#fbe6c2', 'facade': '#cd9985', 'facade_cream': '#d5c5bb', 'dark_window': '#412f45',
    'paving': '#e2d0c1', 'sand': '#d8b9a2', 'stone': '#6d6680', 'haze': '#cdb3bf',
}


def water_palette(P):
    """Recipe section 0 (the palette rule): every water colour is a scene colour moved in LCh."""
    c = {k: hexrgb(v) for k, v in P.items()}
    W = dict(c)
    # the base ladder: the sky mirrored (far = the horizon's colour), darker and richer toward us
    W['w_far_light'] = shift(c['sky_horizon'], dL=-2, cmul=1.1)
    W['w_far'] = shift(mix(c['sky_horizon'], c['sky_low'], 0.35), dL=-8, cmul=1.15)
    W['w_mid'] = shift(c['sky_band'], dL=-16, cmul=1.35)
    W['w_near'] = shift(c['sky_upper'], dL=-27, cmul=1.25, dh=-5)
    W['w_deep'] = shift(c['sky_top'], dL=-38, cmul=1.2, dh=-6)
    W['w_deeper'] = shift(c['sky_top'], dL=-47, cmul=1.15, dh=-8)
    # the sun's glint: cream core, gold body, rose-orange fringe
    W['g_core'] = hexrgb('#fff4dc')
    W['g_gold'] = shift(mix(c['sun'], c['sky_horizon'], 0.58), dL=4)
    W['g_fringe'] = mix(c['sun'], c['sky_band'], 0.5)
    # foam: lit by the sky (never pure white at dusk), and its shade
    W['f_light'] = mix(c['sky_upper'], np.ones(3), 0.55)
    W['f_shade'] = shift(c['sky_upper'], dL=-10, cmul=1.2)
    # wet ground: the dry colour darker and richer (then it mirrors the sky)
    W['sand_wet'] = shift(c['sand'], dL=-14, cmul=1.15)
    W['paving_wet'] = shift(c['paving'], dL=-12, cmul=1.15)
    return W


def base_of(W, s):
    """The water's base colour at perspective depth s (0 = the far waterline, 1 = near; beyond = deeper)."""
    return grad([(-0.35, W['w_far_light']), (0.0, W['w_far']), (0.3, W['w_mid']), (0.65, W['w_near']),
                 (1.0, W['w_deep']), (1.4, W['w_deeper'])], s)


def reflect(src, water, k=0.25, dL=-4.0, cmul=0.9):
    """The reflection rule: a reflection moves 25 % toward the water's own colour, then 4 L* darker and
    a little greyer: light things reflect darker, dark things lighter. Works on images too."""
    l = lab(src) * (1 - k) + lab(water) * k
    l[..., 0] = l[..., 0] + dL
    l[..., 1:] *= cmul
    return rgb(l)


def sky_mirror(W, t):
    """The sky as a calm wet surface sees it, from the horizon (t=0) up toward the zenith (t=1)."""
    return grad([(0, W['sky_horizon']), (0.3, W['sky_low']), (0.55, W['sky_band']),
                 (0.8, W['sky_upper']), (1.0, W['sky_top'])], t)


# ----------------------------------------------------------------------------------------------
# 3. The shared water body: base ladder, soft wash bands, strata, ripple dashes, crisp light strokes
# ----------------------------------------------------------------------------------------------
STRATA = dict(h=(1.5, 8.0), med=(50.0, 130.0), sig=0.7, clip=(16.0, 480.0), gap=(0.05, 0.6),
              space=(1.8, 1.1), op=(0.45, 0.75), soft=(1.0, 0.8), ds=(0.10, 0.25), dL=(2.0, 4.5),
              blur=(1.3, 0.8, 0.4), calm_skip=0.85, local_keep=0.25)
RIPPLE = dict(h=(1.3, 6.5), med=(14.0, 38.0), sig=0.7, clip=(4.0, 180.0), gap=(0.4, 2.5),
              space=(2.4, 1.4), op=(0.72, 0.92), soft=(0.9, 0.75), ds=(0.10, 0.24), dL=(1.0, 3.0),
              dens=(0.10, 0.32), pair=0.3, blur=(1.1, 0.6, 0.3))


def strata(planes, nz, rng, x0, x1, y0, y1, s_of, W, band, wind, mask, spec=STRATA):
    """P2a, the body: long, packed, low-contrast flat strokes along the form. Each takes its tone from
    a band field (light / dark / local), so they group into horizontal strata; calm patches skip most."""
    H, Wd = band.shape
    n = 0
    y = y0 + rng.uniform(0, 1.5)
    while y < y1:
        s = float(np.clip(s_of(y), 0, 1))
        h = lerp(*spec['h'], s) * rng.uniform(0.8, 1.25)
        x = x0 - rng.uniform(0, 120)
        while x < x1:
            run = float(np.clip(rng.lognormal(np.log(lerp(*spec['med'], s)), spec['sig']), *spec['clip']))
            xi, yi = int(np.clip(x + run / 2, 0, Wd - 1)), int(np.clip(y, 0, H - 1))
            t = band[yi, xi]
            zone = 'light' if t > 0.62 else ('dark' if t < 0.38 else 'local')
            keep = mask[yi, xi] > 0.5 and not (wind[yi, xi] < 0.3 and rng.random() < spec['calm_skip'])
            if keep and zone == 'local':
                keep = rng.random() < spec['local_keep']
            if keep:
                ds = lerp(*spec['ds'], s) * rng.uniform(0.5, 0.9)
                if zone == 'light':
                    col = shift(base_of(W, s - ds), dL=rng.uniform(*spec['dL']))
                elif zone == 'dark':
                    col = shift(base_of(W, s + ds), dL=-rng.uniform(*spec['dL']), dh=rng.uniform(1, 4))
                else:
                    col = shift(base_of(W, s), dL=rng.normal(0, 1.5), dh=rng.normal(0, 2.5))
                a, b = (x, x + run) if rng.random() < 0.65 else (x + run, x)
                stroke(planes[min(2, int(s * 3))], nz, rng, a, b, y + rng.normal(0, 0.4), h, col,
                       op=lerp(*spec['op'], s) * rng.uniform(0.85, 1.0), soft=lerp(*spec['soft'], s))
                n += 1
            x += run * (1 + rng.uniform(*spec['gap']))
        y += h * lerp(*spec['space'], s) * rng.uniform(0.85, 1.2)
    return n


def ripples(planes, nz, rng, x0, x1, y0, y1, s_of, W, wind, mask, spec=RIPPLE, dens_mul=1.0):
    """P2b, the ripples: shorter, more contrasting flat dashes, clustered on the windy patches. Light =
    a facet tilted away (shows the lower, warmer, lighter sky: the colour of water farther off); dark =
    a facet tilted toward us (the higher, cooler, darker sky); some light ones get a dark partner below."""
    H, Wd = wind.shape
    n = 0
    y = y0 + rng.uniform(0, 2)
    while y < y1:
        s = float(np.clip(s_of(y), 0, 1))
        h = lerp(*spec['h'], s) * rng.uniform(0.8, 1.2)
        x = x0 - rng.uniform(0, 60)
        while x < x1:
            run = float(np.clip(rng.lognormal(np.log(lerp(*spec['med'], s)), spec['sig']), *spec['clip']))
            xi, yi = int(np.clip(x + run / 2, 0, Wd - 1)), int(np.clip(y, 0, H - 1))
            p = dens_mul * lerp(*spec['dens'], s) * (0.1 + 0.9 * float(smooth((wind[yi, xi] - 0.35) / 0.4)))
            if mask[yi, xi] > 0.5 and rng.random() < p:
                ds = lerp(*spec['ds'], s)
                light = rng.random() < 0.5
                if light:
                    col = shift(base_of(W, s - ds * rng.uniform(0.8, 1.15)), dL=rng.uniform(*spec['dL']))
                else:
                    col = shift(base_of(W, s + ds * rng.uniform(0.8, 1.15)), dL=-rng.uniform(*spec['dL']),
                                dh=rng.uniform(2, 5))
                a, b = (x, x + run) if rng.random() < 0.65 else (x + run, x)
                k = min(2, int(s * 3))
                op = lerp(*spec['op'], s) * rng.uniform(0.85, 1.0)
                stroke(planes[k], nz, rng, a, b, y, h, col, op=op, soft=lerp(*spec['soft'], s))
                if light and rng.random() < spec['pair']:
                    dk = shift(base_of(W, s + ds), dL=-rng.uniform(*spec['dL']), dh=3)
                    off = run * rng.uniform(-0.15, 0.3)
                    stroke(planes[k], nz, rng, a + off, a + off + (b - a) * rng.uniform(0.5, 0.9), y + 0.95 * h,
                           h * 0.8, dk, op=op, soft=lerp(*spec['soft'], s))
                n += 1
            x += run * (1 + rng.uniform(*spec['gap']))
        y += h * lerp(*spec['space'], s) * rng.uniform(0.85, 1.25)
    return n


def water_body(cv, mask, W, seed, key, y_top, y_bot, s_range, mirrors=(), wind_cell=(46, 280),
               ripple_mul=1.0, crisp=6, grain=True, light_edge=None, strata_spec=STRATA, ripple_spec=RIPPLE,
               base=None):
    """Recipe passes P0-P4 for any calm water shape (mask, 0-1). Returns the stroke count and the wind field.
    P0 design: the base ladder by depth (or `base`, an (H, W, 3) designed flat). P1: big soft wash bands
    (+ the mirrored sky features), blurred 4-7 px. P2a strata, P2b ripples, per plane, blurred less the
    nearer. P3: a few crisp light strokes (+ the open horizon's bright line). P4: grain, near plane only."""
    H, Wd = mask.shape
    g = lambda *k: rng_for(seed, key, *k)
    nz = Noise(g('noise'))
    s_of = lambda y: lerp(s_range[0], s_range[1], np.clip((y - y_top) / max(1, y_bot - y_top), 0, 1))
    srow = s_of(np.arange(H))
    # P0: the design: the base ladder (the mirrored sky, darker and richer toward us)
    flat = np.broadcast_to(base_of(W, srow).astype(np.float32)[:, None, :], (H, Wd, 3)) if base is None else base
    cv[:] = cv * (1 - mask[..., None]) + flat * mask[..., None]
    # P1: big soft wash bands along the form, then the pass blur
    r1 = g('wash')
    wash = Layer(H, Wd)
    for _ in range(int(r1.integers(7, 12))):
        y = r1.uniform(y_top, y_bot)
        s = float(s_of(y))
        hh = lerp(10, 36, s) * r1.uniform(0.7, 1.3)
        xa = r1.uniform(-0.3, 0.5) * Wd
        col = shift(base_of(W, s + r1.uniform(-0.1, 0.1)), dL=r1.normal(0, 1.8), dh=r1.normal(0, 4))
        chisel(wash, nz, r1, xa, xa + r1.uniform(0.4, 1.0) * Wd, y, hh, col, op=r1.uniform(0.28, 0.45),
               soft=0.45 * hh, dry=0.25, bdepth=0.08, cj=0.008, thin_end=0.5, t1=0.4)
    for (xa, xb, y, hh, col, op) in mirrors:  # the sky's features, mirrored: soft and darker
        chisel(wash, nz, r1, xa, xb, y, hh, col, op=op, soft=0.42 * hh, dry=0.2, bdepth=0.06, cj=0.006,
               thin_end=0.55, t1=0.4)
    wash.blur(lerp(7.0, 4.0, 0.5 * (s_range[0] + s_range[1]))).onto(cv, mask)
    # P2: strata (the body) then ripples, three planes each
    wind = field(g('wind'), H, Wd, *wind_cell)
    band = field(g('band'), H, Wd, 16, 420)
    planes = [Layer(H, Wd) for _ in range(3)]
    n = strata(planes, nz, g('strata'), 0, Wd, y_top + 1, y_bot, s_of, W, band, wind, mask, strata_spec)
    for k, L in enumerate(planes):
        L.blur(strata_spec['blur'][k]).onto(cv, mask)
    planes = [Layer(H, Wd) for _ in range(3)]
    n += ripples(planes, nz, g('ripple'), 0, Wd, y_top + 2, y_bot, s_of, W, wind, mask, ripple_spec, ripple_mul)
    for k, L in enumerate(planes):
        L.blur(ripple_spec['blur'][k]).onto(cv, mask)
    # P3: a few crisp light strokes on the windy patches of the mid and near water (the light edges)
    r3 = g('crisp')
    top = Layer(H, Wd)
    placed = tries = 0
    while placed < crisp and tries < 600:
        tries += 1
        x, y = r3.uniform(0, Wd), r3.uniform(y_top + 0.35 * (y_bot - y_top), y_bot)
        if wind[int(y), int(x)] < 0.62 or mask[int(y), int(x)] < 0.5:
            continue
        s = float(s_of(y))
        run = r3.uniform(30, 110) * lerp(0.6, 1.0, s)
        chisel(top, nz, r3, x, x + run * (1 if r3.random() < 0.6 else -1), y, r3.uniform(1.5, 2.4),
               shift(base_of(W, s - 0.45), dL=4), op=0.9, soft=0.7, dry=0.35, bdepth=0.0, cj=0.0, t1=0.3)
        placed += 1
    if light_edge is not None:  # the open horizon's bright line: crisp, broken
        (xa, xb, y, col) = light_edge
        x = xa
        while x < xb:
            run = r3.uniform(40, 240)
            if r3.random() < 0.82:
                chisel(top, nz, r3, x, min(xb, x + run), y + r3.normal(0, 0.3), r3.uniform(1.6, 2.4), col,
                       op=0.92, soft=0.7, dry=0.25, bdepth=0.0, cj=0.0)
            x += run * r3.uniform(1.05, 1.3)
    top.onto(cv, mask)
    # P4: a fine grain, near plane only
    if grain:
        gn = ndi.gaussian_filter(g('grain').standard_normal((H, Wd)), 0.7)
        near = smooth((srow - 0.55) / 0.3)[:, None] * mask
        cv[:] = np.clip(cv * (1 + 0.012 * gn / (gn.std() + 1e-6) * near)[..., None], 0, 1)
    return n, wind


def mirror_rows(img, yw, H, face=0, stretch=1.0, top_limit=0):
    """Mirror an image about the waterline row(s) yw (scalar or per column): row y below the line shows
    the source row yw - face - (y - yw - face)/stretch; the first `face` rows show the quay face."""
    Hs, Wd = img.shape[:2]
    yw = np.broadcast_to(np.asarray(yw, np.float64), (Wd,))
    yy = np.arange(H)[:, None] - yw[None, :]
    src = np.where(yy < face, yw[None, :] - 1 - yy, yw[None, :] - face - (yy - face) / stretch - 1)
    ok = (yy >= 0) & (src >= top_limit)
    src = np.clip(np.round(src), 0, Hs - 1).astype(int)
    out = img[src, np.arange(Wd)[None, :]]
    return out, ok.astype(np.float32)


def wobble_rows(img, rng, amp_of_row, cell=7.0):
    """Shift each row sideways by a smooth random offset (amplitude per row): ripples break a mirror."""
    H, Wd = img.shape[:2]
    off = ndi.gaussian_filter1d(rng.standard_normal(H + 40), cell)[20:20 + H]
    off = off / (off.std() + 1e-6) * amp_of_row
    xs = np.clip(np.round(np.arange(Wd)[None, :] - off[:, None]), 0, Wd - 1).astype(int)
    return img[np.arange(H)[:, None], xs]


def paint_reflection(cv, mask, W, seed, key, tgt, cover, yw, s_of, lights=(), breaks=True, op=0.95,
                     simplify=(7, 19)):
    """Reflections of things above the water (the facade, the quay, posts, boats), as the recipe paints
    them: P1 the mirrored flat as an opaque soft underpaint (wobbled per row, its far end lost);
    P2 flat dashes that each take the target's colour at their centre; light sources get a glow column
    and longer streaks; P3 sky breaks across it and a few crisp cores under each light."""
    H, Wd = mask.shape
    g = lambda *k: rng_for(seed, key, *k)
    nz = Noise(g('noise'))
    yw_c = np.broadcast_to(np.asarray(yw, np.float64), (Wd,))
    d = np.arange(H)[:, None] - yw_c[None, :]
    if simplify:  # only masses survive: a median over (rows, cols), the uncovered parts filled with water
        filled = np.where(cover[..., None] > 0.5, tgt, base_of(W, s_of(np.arange(H)))[:, None, :])
        tgt = np.stack([ndi.median_filter(filled[..., i], size=simplify) for i in range(3)], -1).astype(np.float32)
    # P1: opaque soft underpaint (no blending of complements: the reflection replaces the water)
    under = Layer(H, Wd)
    a = cover * smooth((d + 0.5) / 1.0) * op
    under.rgb[:] = tgt * a[..., None]
    under.a[:] = a
    under.blur((1.6, 0.8)).onto(cv, mask)
    # light sources: a soft glow column, screened, longer than the mirrored source
    yy, xx = np.mgrid[0:H, 0:Wd]
    for (xa, xb, y_top_ref, length, col) in lights:
        xc, wdt = (xa + xb) / 2, (xb - xa)
        prof = np.exp(-0.5 * ((xx - xc) / (0.42 * wdt)) ** 2) * smooth((yy - y_top_ref + 6) / 8) * \
            (1 - smooth((yy - y_top_ref) / length))
        Layer(H, Wd).fill(mix(col, base_of(W, 0.8), 0.3), (0.38 * prof).astype(np.float32)).blur(5).onto(
            cv, mask, mode='screen')
    # P2: dashes that sample the target, rows packed near the waterline, thinning as they go down
    r2 = g('dash')
    layer = Layer(H, Wd)
    y = float(np.min(yw_c)) + 1.0
    n = 0
    while y < H:
        x = -r2.uniform(0, 30)
        while x < Wd:
            xc = int(np.clip(x, 0, Wd - 1))
            dd = y - yw_c[xc]
            s = float(np.clip(s_of(y), 0, 1))
            h = lerp(2.8, 6.5, min(1, max(dd, 0) / 160)) * r2.uniform(0.8, 1.2)
            run = float(np.clip(r2.lognormal(np.log(lerp(16, 30, s)), 0.75), 5, 200))
            xm = int(np.clip(x + run / 2, 0, Wd - 1))
            yi = int(np.clip(y, 0, H - 1))
            if dd >= 0 and cover[yi, xm] > 0.5 and r2.random() < lerp(0.95, 0.6, min(1, dd / 150)):
                wob = r2.normal(0, 1.0 + 3.0 * min(1, dd / 120))
                c = shift(tgt[yi, xm], dL=r2.normal(0, 1.3))
                a0, b0 = (x + wob, x + wob + run) if r2.random() < 0.7 else (x + wob + run, x + wob)
                stroke(layer, nz, r2, a0, b0, y, h, c, op=0.92, soft=0.8, dry_scale=0.7)
                n += 1
            x += run * (1 + r2.uniform(0.05, 0.45))
        y += 4.2 * r2.uniform(0.8, 1.25)
    for (xa, xb, y_top_ref, length, col) in lights:  # the streak runs on below the mirrored light
        xc, wdt = (xa + xb) / 2, (xb - xa)
        y = y_top_ref + 0.35 * length
        while y < min(H - 2, y_top_ref + length):
            k = (y - y_top_ref) / length
            if r2.random() < 1 - 0.6 * k:
                run = wdt * r2.uniform(0.35, 0.95) * (1 - 0.45 * k)
                x = xc + r2.normal(0, 0.18 * wdt) - run / 2
                stroke(layer, nz, r2, x, x + run, y, r2.uniform(2.4, 4.2), shift(col, dL=-6 * k), op=0.88, soft=0.8)
            y += r2.uniform(4.5, 8.5)
    layer.blur(0.45).onto(cv, mask)
    # P3: sky breaks (light rows across the reflection: facets that face us show the high sky) + cores
    r3 = g('crisp')
    top = Layer(H, Wd)
    if breaks:
        brk = shift(mix(W['sky_upper'], W['sky_band'], 0.35), dL=-6)
        y = float(np.min(yw_c)) + 8
        while y < H - 3:
            x = r3.uniform(-80, Wd)
            dd = y - yw_c[int(np.clip(x, 0, Wd - 1))]
            if dd > 4 and r3.random() < lerp(0.35, 0.75, min(1, dd / 120)):
                run = r3.uniform(50, 280)
                chisel(top, nz, r3, x, x + run, y, r3.uniform(1.3, 2.3), brk, op=0.8, soft=0.75, dry=0.45,
                       bdepth=0.0, cj=0.0, thin_end=0.7)
            y += r3.uniform(4, 11)
    for (xa, xb, y_top_ref, length, col) in lights:
        for j in range(int(r3.integers(2, 5))):
            run = (xb - xa) * r3.uniform(0.25, 0.55)
            x = r3.uniform(xa, xb - run)
            chisel(top, nz, r3, x, x + run, y_top_ref + 3 + j * r3.uniform(4, 8), 2.0, shift(col, dL=6), op=0.95,
                   soft=0.7, dry=0.3, bdepth=0.0, cj=0.0)
    top.onto(cv, mask)
    return n


# ----------------------------------------------------------------------------------------------
# 4. The elements
# ----------------------------------------------------------------------------------------------
def far_city(rng, Wd, H, x0, x1, base_y, hmin=6, hmax=30):
    """A low hazy far-city silhouette (blocks) standing on base_y; returns (mask, block-shade field)."""
    m = np.zeros((H, Wd), np.float32)
    tone = np.zeros((H, Wd), np.float32)
    x = x0
    while x < x1:
        w = rng.uniform(18, 72)
        hgt = rng.uniform(hmin, hmax) * (1.6 if rng.random() < 0.12 else 1.0)
        xa, xb = int(x), int(min(x1, x + w))
        ya = int(base_y - hgt)
        m[ya:base_y, xa:xb] = 1
        tone[ya:base_y, xa:xb] = rng.normal(0, 1)
        x += w * rng.uniform(0.85, 1.05)
    return ndi.gaussian_filter(m, 0.9), ndi.gaussian_filter(tone, 0.9)


def e1_mirror(seed, W):
    """E1 calm water mirroring the dusk sky (a harbour: a low far city on the left, open water right)."""
    Wd, H, yh = 1080, 460, 170
    g = lambda *k: rng_for(seed, 'e1', *k)
    nz = Noise(g('noise'))
    cv = np.zeros((H, Wd, 3), np.float32)
    t = np.clip(np.arange(H) / yh, 0, 1)
    sky = grad([(0, W['sky_band']), (0.62, W['sky_low']), (1, W['sky_horizon'])], t).astype(np.float32)
    cv[:] = sky[:, None, :]
    skym = np.zeros((H, Wd), np.float32)
    skym[:yh] = 1
    # three soft cloud streaks (they will be mirrored)
    sl = Layer(H, Wd)
    mirrors = []
    for i, (xa, xb, y, hh) in enumerate([(-60, 560, 52, 18), (430, 1140, 98, 24), (150, 700, 136, 10)]):
        col = mix(W['cloud_shade'], sky[y], 0.42)
        chisel(sl, nz, g('sky', i), xa, xb, y, hh, col, op=0.62, soft=0.4 * hh, dry=0.25, bdepth=0.1,
               cj=0.01, thin_end=0.6, t1=0.35)
        chisel(sl, nz, g('sky', i, 'lit'), xa + 30, xb - 60, y - 0.42 * hh, 2.2,
               mix(W['sky_horizon'], np.ones(3), 0.3), op=0.55, soft=0.9, dry=0.45, bdepth=0.0, cj=0.0)
        d = yh - y
        mirrors.append((xa + 10, xb - 10, yh + 0.9 * d, hh * 0.85,
                        shift(reflect(col, base_of(W, 0.2)), dL=-4 - 10 * d / yh), 0.5))
    sl.blur(2.2).onto(cv, skym)
    # the far city (left), hazy, with a few tiny lit windows
    rq = g('city')
    city, tone = far_city(rq, Wd, H, -10, 650, yh, 4, 20)
    haze = mix(W['haze'], W['sky_horizon'], 0.35)
    cl = (lab(haze)[None, None, :] + np.stack([tone * 1.1, tone * 0.4, tone * 0.4], -1))
    cv[:] = cv * (1 - city[..., None]) + rgb(cl).astype(np.float32) * city[..., None]
    wins = [(int(rq.uniform(20, 620)), int(rq.uniform(yh - 16, yh - 4))) for _ in range(9)]
    wins = [(x, y) for (x, y) in wins if city[y, x] > 0.9]
    for (x, y) in wins:
        cv[y:y + 2, x:x + 3] = mix(W['window'], haze, 0.25)
    water = np.zeros((H, Wd), np.float32)
    water[yh:] = 1
    n, _ = water_body(cv, water, W, seed, 'e1w', yh, H, (0.0, 0.72), mirrors=mirrors, crisp=5,
                      light_edge=(650, Wd, yh + 1.6, mix(W['sky_horizon'], np.ones(3), 0.35)))
    # the far city's reflection: its silhouette mirrored, darker, soft, broken by thin sky lines
    rm, ok = mirror_rows(city[..., None], yh, H)
    rm = ndi.gaussian_filter(rm[..., 0] * ok, (1.6, 0.8))
    Layer(H, Wd).fill(reflect(haze, base_of(W, 0.05), dL=-7), rm * 0.88).onto(cv)
    for (x, y) in wins:  # tiny lit windows: short soft streaks straight below
        dy = yh - y
        L = Layer(H, Wd)
        L.a[yh + dy - 1:yh + dy + int(rq.uniform(6, 13)), x:x + 2] = 0.8
        L.rgb[:] = reflect(W['window'], base_of(W, 0.05)) * L.a[..., None]
        L.blur((1.6, 0.4)).onto(cv)
    r = g('breaks')
    br = Layer(H, Wd)
    for y in (yh + 6, yh + 13, yh + 19):
        x = r.uniform(-40, 100)
        while x < 650:
            run = r.uniform(40, 180)
            chisel(br, nz, r, x, x + run, y + r.normal(0, 0.4), 1.3, base_of(W, -0.1), op=0.7, soft=0.7, dry=0.4,
                   bdepth=0.0, cj=0.0)
            x += run * r.uniform(1.3, 2.2)
    br.onto(cv, water)
    return cv, n


def e2_windows(seed, W):
    """E2 reflections of lit windows: a facade on its quay, mirrored about the waterline."""
    Wd, H, yw = 540, 400, 176
    cv = np.zeros((H, Wd, 3), np.float32)
    # DESIGN (the source, our flat): sky strip, cream facade, terracotta piers, windows, a lit door, quay
    src = np.zeros((H, Wd, 3), np.float32)
    src[:] = W['sky_band']
    src[26:150] = W['facade_cream']
    for x in (0, 262, 516):
        src[26:150, x:x + 24] = W['facade']
    lit = [(44, 128, 46, 114, W['window']), (390, 474, 46, 114, W['window']), (296, 360, 60, 150, W['door'])]
    for (xa, xb, ya, yb, c) in lit:
        src[ya:yb, xa:xb] = c
    src[46:114, 150:236] = W['dark_window']
    src[40:44, 30:500] = shift(W['facade_cream'], dL=-8)
    src[150:170] = W['paving']                       # the quay's top
    src[170:yw] = shift(W['stone'], dL=4)            # the quay's face
    cv[:yw] = src[:yw]
    water = np.zeros((H, Wd), np.float32)
    water[yw:] = 1
    n, _ = water_body(cv, water, W, seed, 'e2w', yw, H, (0.55, 1.0), crisp=3, ripple_mul=0.8)
    face = yw - 170
    s_of = lambda y: lerp(0.55, 1.0, np.clip((y - yw) / (H - yw), 0, 1))
    # the target: the facade mirrored (the quay's top is not seen in a reflection; its face is)
    tgt, ok = mirror_rows_split(src, yw, H, face, 150, 26)
    srow = s_of(np.arange(H))
    wcol = base_of(W, srow)[:, None, :]
    tgt = reflect(tgt, wcol, dL=(-4 - 8 * srow)[:, None]).astype(np.float32)   # + Fresnel: darker toward us
    rr = rng_for(seed, 'e2', 'wob')
    d = np.arange(H) - yw
    tgt = wobble_rows(tgt, rr, 0.6 + 2.6 * np.clip(d / 120, 0, 1))
    ok = wobble_rows(ok[..., None], rr, 0.6 + 2.6 * np.clip(d / 120, 0, 1))[..., 0]
    far_end = yw + face + (150 - 26)                  # the mirrored facade top: a lost edge, broken by ripples
    edge = 1 - smooth((np.arange(H) - (far_end - 34)) / 44.0)
    cover = ok * (field(rr, H, Wd, 4, 46) < edge[:, None])
    lights = [(xa, xb, yw + face + (150 - yb), 1.8 * (yb - ya), reflect(c, base_of(W, 0.8)))
              for (xa, xb, ya, yb, c) in lit]
    n += paint_reflection(cv, water, W, seed, 'e2r', tgt, cover.astype(np.float32), yw, s_of, lights)
    # the contact line: the quay face meets the water (crisp, dark)
    cv[yw:yw + 2] = cv[yw:yw + 2] * 0.45 + shift(W['stone'], dL=-14) * 0.55
    return cv, n


def mirror_rows_split(src, yw, H, face, base, top):
    """Facade on a quay: rows yw..yw+face mirror the quay face (src rows yw-1 .. yw-face); below, the
    facade from its base row upward (src rows base-1 .. top). Returns (target, covered)."""
    Wd = src.shape[1]
    tgt = np.zeros((H, Wd, 3), np.float32)
    ok = np.zeros((H, Wd), np.float32)
    for y in range(yw, H):
        d = y - yw
        ys = yw - 1 - d if d < face else base - 1 - (d - face)
        if ys >= top:
            tgt[y] = src[ys]
            ok[y] = 1
    return tgt, ok


def e3_glint(seed, W):
    """E3 the sun's glint column on calm water: a soft lift, then gold dashes, then a few crisp cores."""
    Wd, H, yw = 540, 420, 132
    g = lambda *k: rng_for(seed, 'e3', *k)
    nz = Noise(g('noise'))
    cv = np.zeros((H, Wd, 3), np.float32)
    t = np.clip(np.arange(H) / yw, 0, 1)
    cv[:] = grad([(0, W['sky_band']), (0.55, W['sky_low']), (1, W['sky_horizon'])], t).astype(np.float32)[:, None]
    xc, D = 270.0, 96.0                                # the sun: 96 px across, as in the scene
    yy, xx = np.mgrid[0:H, 0:Wd]
    sun = smooth((D / 2 - np.hypot(xx - xc, yy - (yw - 14))) / 1.2 + 0.5)
    cv[:] = cv * (1 - sun[..., None]) + W['sun'] * sun[..., None]
    city, tone = far_city(g('city'), Wd, H, -10, Wd + 10, yw, 6, 22)
    haze = mix(W['haze'], W['sky_horizon'], 0.25)
    cv[:] = cv * (1 - city[..., None]) + rgb(lab(haze)[None, None] + np.stack([tone * 1.5, tone * 0.4, tone * 0.4], -1)
                                            ).astype(np.float32) * city[..., None]
    water = (yy >= yw).astype(np.float32)
    n, _ = water_body(cv, water, W, seed, 'e3w', yw, H, (0.0, 0.8), crisp=2, ripple_mul=0.8)
    rm, ok = mirror_rows(city[..., None], yw, H)
    Layer(H, Wd).fill(reflect(haze, base_of(W, 0.05), dL=-7), ndi.gaussian_filter(rm[..., 0] * ok, (1.6, 0.8)) * 0.85
                      ).onto(cv)
    n += glint_column(cv, water, W, seed, 'e3g', xc, D, yw, H, (0.0, 0.8))
    return cv, n


def glint_column(cv, mask, W, seed, key, xc, D, y0, y1, s_range, strength=1.0):
    """The sun's glint column, x centre xc, sun diameter D, from the waterline y0 down to y1.
    P1 a soft screened lift (brightest far); P2 gold dashes, near-continuous far and spaced near,
    x around the centre (gaussian); P3 crisp cream cores and the merged bright line at the far end."""
    H, Wd = mask.shape
    g = lambda *k: rng_for(seed, key, *k)
    nz = Noise(g('noise'))
    yy, xx = np.mgrid[0:H, 0:Wd]
    s_of = lambda y: lerp(s_range[0], s_range[1], np.clip((y - y0) / max(1, y1 - y0), 0, 1))
    half = lambda s: D * (0.4 + 0.5 * s)
    s = s_of(yy)
    k = (s - s_range[0]) / max(1e-6, s_range[1] - s_range[0])
    prof = np.exp(-0.5 * ((xx - xc) / (0.8 * half(s))) ** 2) * lerp(0.4, 0.12, k) * mask * (yy >= y0) * strength
    Layer(H, Wd).fill(W['g_fringe'], prof.astype(np.float32)).blur(6).onto(cv, mask, mode='screen')
    r2 = g('dash')
    dl = Layer(H, Wd)
    cores = []
    n = 0
    y = y0 + 2.0
    while y < y1 - 2:
        sy = float(s_of(y))
        kk = (sy - s_range[0]) / max(1e-6, s_range[1] - s_range[0])
        for _ in range(int(r2.poisson(lerp(2.6, 1.1, kk) * strength)) + (1 if kk < 0.3 else 0)):
            x = xc + r2.normal(0, half(sy) / 1.8)
            if abs(x - xc) > 2.0 * half(sy) or mask[int(min(H - 1, y)), int(np.clip(x, 0, Wd - 1))] < 0.5:
                continue
            run = lerp(10, 44, kk) * float(np.exp(r2.normal(0, 0.45)))
            h = lerp(1.3, 4.2, kk) * r2.uniform(0.8, 1.2)
            p = r2.random()
            c = W['g_core'] if (p < 0.12 and kk < 0.4) else (W['g_fringe'] if p > 0.75 else W['g_gold'])
            fall = float(np.exp(-0.5 * ((x - xc) / half(sy)) ** 2))
            op = lerp(0.95, 0.7, kk) * (0.5 + 0.5 * fall)
            stroke(dl, nz, r2, x - run / 2, x + run / 2, y, h, c, op=op, soft=0.75, bdepth=0.06, cj=0.01)
            if fall > 0.55 and r2.random() < 0.3:
                cores.append((x - run * 0.3, x + run * 0.3, y, max(1.0, h * 0.35)))
            n += 1
        y += lerp(2.8, 13.0, kk) * r2.uniform(0.8, 1.25)
    dl.blur(0.55).onto(cv, mask)
    top = Layer(H, Wd)
    for (a, b, y, h) in cores:
        chisel(top, nz, r2, a, b, y, h, W['g_core'], op=0.95, soft=0.6, dry=0.2, bdepth=0.0, cj=0.0)
    chisel(top, nz, r2, xc - 0.9 * half(s_range[0]), xc + 0.9 * half(s_range[0]), y0 + 1.5, 2.0, W['g_core'],
           op=0.9 * strength, soft=0.7, dry=0.3, bdepth=0.0, cj=0.0)
    top.onto(cv, mask)
    return n


def e4_ripples(seed, W):
    """E4 near water: strata and ripple dashes with calm gaps, crisp light edges; a post, its rings."""
    Wd, H = 1080, 300
    g = lambda *k: rng_for(seed, 'e4', *k)
    nz = Noise(g('noise'))
    cv = np.zeros((H, Wd, 3), np.float32)
    water = np.ones((H, Wd), np.float32)
    n, _ = water_body(cv, water, W, seed, 'e4w', 0, H, (0.5, 1.05), crisp=10, wind_cell=(40, 300), ripple_mul=1.5)
    px, pw, pt, pb = 760, 30, 40, 118                 # a mooring post standing in the water (our flat)
    yy, xx = np.mgrid[0:H, 0:Wd]
    post = ndi.gaussian_filter(((np.abs(xx - px) <= pw / 2) & (yy >= pt) & (yy < pb)).astype(np.float32), 0.6)
    r = g('post')
    rl = Layer(H, Wd)
    post_c = shift(W['stone'], dL=-16)
    pc = reflect(post_c, base_of(W, 0.9), k=0.3, dL=2)  # dark things reflect lighter (still darker than the water)
    y = pb + 1.0
    while y < min(H, pb + 1.3 * (pb - pt)):
        k = (y - pb) / (1.3 * (pb - pt))
        if r.random() < 1 - 0.55 * k:
            wob = r.normal(0, 1 + 4 * k)
            w2 = pw * r.uniform(0.8, 1.25)
            stroke(rl, nz, r, px - w2 / 2 + wob, px + w2 / 2 + wob, y, r.uniform(3, 5.5), pc, op=0.9 - 0.4 * k, soft=0.8)
        y += r.uniform(3.5, 6.5)
    rl.blur(0.5).onto(cv)
    rings = Layer(H, Wd)                              # flattened ellipses (1:7), broken into dashes
    for kk in range(3):
        a = 40 * 1.6 ** kk
        b = a / 7
        for th0 in np.linspace(0, 2 * np.pi, int(r.integers(7, 11)), endpoint=False):
            th = th0 + r.uniform(0, 0.3)
            span = r.uniform(0.35, 0.6)
            x0, x1 = px + a * np.cos(th), px + a * np.cos(th + span)
            y0, y1 = pb - 2 + b * np.sin(th), pb - 2 + b * np.sin(th + span)
            if abs(x1 - x0) < 6:
                continue
            near_arc = np.sin(th + span / 2) > 0
            c = shift(base_of(W, 0.55), dL=2) if near_arc else shift(base_of(W, 1.15), dL=-1)
            chisel(rings, nz, r, x0, x1, y0, (2.8 if near_arc else 1.8) * (1 - 0.15 * kk), c,
                   op=[0.8, 0.58, 0.38][kk] * (1 if near_arc else 0.7), slope=(y1 - y0) / (x1 - x0), soft=0.8,
                   dry=0.35, bdepth=0.0, cj=0.0, rag=0.3)
    rings.blur(0.35).onto(cv)
    pcol = np.where((xx < px - 4)[..., None], shift(post_c, dL=12), post_c).astype(np.float32)
    cv[:] = cv * (1 - post[..., None]) + pcol * post[..., None]
    return cv, n


def wet_sky(W, t):
    """What a wet surface mirrors, from its far edge (t=0, the low sky) toward us (t=1, the high sky):
    the sky's own layers, with its cloud bands, so the wet ground gets value structure (bands)."""
    cloud = mix(W['cloud_shade'], W['sky_upper'], 0.25)
    return grad([(0, W['sky_horizon']), (0.16, W['sky_low']), (0.32, cloud), (0.5, W['sky_band']),
                 (0.7, W['sky_upper']), (0.86, shift(W['cloud_shade'], dL=-4)), (1, W['sky_top'])], t)


def wet_ground(cv, mask, W, seed, key, body_wet, y0, y1, share=(0.75, 0.35), sky_t=(0.0, 1.0), streak=(3.0, 14.0),
               n_streaks=16):
    """Wet sand / wet paving (recipe E5). P0: the ground's wet colour (darker, richer) mixed with the sky
    mirror, share far -> near (grazing views mirror more). P1: soft streaks of the mirrored sky's own
    colours laid along the ground, blurred along it (sigma y, x). Returns t (0 far .. 1 near) per row."""
    H, Wd = mask.shape
    g = lambda *k: rng_for(seed, key, *k)
    nz = Noise(g('noise'))
    t = np.clip((np.arange(H) - y0) / max(1, y1 - y0), 0, 1)
    sk = wet_sky(W, lerp(sky_t[0], sky_t[1], t))
    rows = mix(np.broadcast_to(body_wet, sk.shape), sk, lerp(share[0], share[1], t))
    cv[:] = cv * (1 - mask[..., None]) + rows[:, None, :].astype(np.float32) * mask[..., None]
    r = g('streaks')
    L = Layer(H, Wd)
    for _ in range(n_streaks):
        y = r.uniform(y0, y1)
        tt = (y - y0) / max(1, y1 - y0)
        hh = r.uniform(8, 24)
        tsky = np.clip(lerp(sky_t[0], sky_t[1], tt) + r.normal(0, 0.12), 0, 1)
        c = shift(mix(body_wet, wet_sky(W, tsky), lerp(share[0], share[1], tt)), dL=r.normal(0, 2))
        xa = r.uniform(-0.3, 0.6) * Wd
        chisel(L, nz, r, xa, xa + r.uniform(0.3, 0.9) * Wd, y, hh, c, op=r.uniform(0.35, 0.6), soft=0.45 * hh,
               dry=0.3, bdepth=0.08, cj=0.006, rag=1.0)
    L.blur(streak).onto(cv, mask)
    return t


def reflect_shape(cv, mask, shape, base_y, colour, length, blur=(2.0, 0.8), op=0.95):
    """A thing standing on a wet surface: its silhouette mirrored about its base line, shorter (length =
    share of its height), fading, soft along the view; at nearly its own value (dark reflects a bit lighter)."""
    H, Wd = shape.shape
    yy = np.arange(H)[:, None]
    hgt = max(1, base_y - int(np.argmax(shape.max(1) > 0.5)))
    refl = shape[np.clip(2 * base_y - np.arange(H), 0, H - 1), :] * (yy >= base_y) * \
        (1 - smooth((yy - base_y) / (length * hgt)))
    Layer(H, Wd).fill(colour, (ndi.gaussian_filter(refl, blur) * op).astype(np.float32)).onto(cv, mask)


def e5_wet(seed, W):
    """E5 wet sand (left) and wet paving with a puddle and a lamp (right), both mirroring the dusk sky."""
    Wd, H, half = 1080, 340, 540
    g = lambda *k: rng_for(seed, 'e5', *k)
    nz = Noise(g('noise'))
    cv = np.zeros((H, Wd, 3), np.float32)
    yy, xx = np.mgrid[0:H, 0:Wd]
    # --- wet sand (left half) ---------------------------------------------------------------------
    sea_y = 40
    left = (xx < half).astype(np.float32)
    sand = ndi.gaussian_filter((yy >= sea_y - 3 * np.sin(xx / 70.0)).astype(np.float32), 0.6) * left
    body = shift(W['sand'], dL=-18, cmul=1.15)
    wet_ground(cv, sand, W, seed, 'e5s', body, sea_y, H - 40)
    water_body(cv, left * (1 - sand), W, seed, 'e5sea', 0, sea_y, (0.55, 0.75), crisp=1, grain=False)
    r = g('swash')                                      # the swash: the sea's last thin sheet, a lacy light edge
    sw = Layer(H, Wd)
    x = -30
    while x < half:
        run = r.uniform(40, 160)
        if r.random() < 0.75:
            chisel(sw, nz, r, x, x + run, sea_y + 2 - 3 * np.sin((x + run / 2) / 70.0), r.uniform(1.6, 2.8),
                   W['f_light'], op=0.8, soft=0.7, dry=0.5, bdepth=0.0, cj=0.0, rag=0.6)
        x += run * r.uniform(1.05, 1.4)
    sw.onto(cv, left)
    # the boulder (our flat) and its reflection: mirrored about its base, short, soft along the view
    bx, by, brx, bry = 250, 182, 74, 46
    base_y = by + 4
    boulder = ndi.gaussian_filter(((((xx - bx) / brx) ** 2 + ((yy - by) / bry) ** 2 < 1) & (yy < base_y)).astype(
        np.float32), 0.7)
    stone = shift(W['stone'], dL=-6)
    reflect_shape(cv, left, boulder, base_y, reflect(stone, body, k=0.2, dL=2), 0.85)
    r2 = g('edges')                                     # thin water-edge lines (light; a few dark), soft-ended
    L2 = Layer(H, Wd)
    for i in range(9):
        y = r2.uniform(sea_y + 12, H - 50)
        x0 = r2.uniform(-120, 360)
        tt = (y - sea_y) / (H - sea_y)
        c = shift(wet_sky(W, 0.05), dL=-6 - 10 * tt) if i < 6 else shift(body, dL=-8)
        chisel(L2, nz, r2, x0, x0 + r2.uniform(120, 420), y, r2.uniform(1.3, 2.2), c, op=0.7, soft=0.8, dry=0.5,
               bdepth=0.0, cj=0.0, slope=r2.normal(0, 0.01), bow=r2.normal(0, 2), t1=0.4, thin_end=0.7, rag=0.4)
    L2.blur(0.5).onto(cv, sand)
    # the wet/dry edge near the bottom: soft and wavy; the dry sand matte and lighter, speckled (near only)
    dry_m = ndi.gaussian_filter(((yy > H - 46 + 6 * np.sin(xx / 61.0) + 3 * np.sin(xx / 19.0)) & (xx < half)).astype(
        np.float32), 3.5)
    cv[:] = cv * (1 - dry_m[..., None]) + W['sand'] * dry_m[..., None]
    gn = ndi.gaussian_filter(g('sandgrain').standard_normal((H, Wd)), 0.6)
    cv[:] = np.clip(cv * (1 + 0.014 * gn / (gn.std() + 1e-6) * dry_m)[..., None], 0, 1)
    sp = g('speck')
    for _ in range(70):
        x, y = int(sp.uniform(0, half - 2)), int(sp.uniform(H - 40, H))
        if dry_m[y, x] > 0.8:
            cv[y, x:x + 2] = shift(W['sand'], dL=float(sp.choice([-14, 10])))
    cv[:] = cv * (1 - boulder[..., None]) + np.where((xx < bx - 12)[..., None], shift(stone, dL=9), stone) * \
        boulder[..., None]
    # --- wet paving (right half) ------------------------------------------------------------------
    right = (xx >= half).astype(np.float32)
    pbody = shift(W['paving'], dL=-15, cmul=1.15)
    wet_ground(cv, right, W, seed, 'e5p', pbody, 0, H, share=(0.5, 0.28), sky_t=(0.3, 1.0), streak=(10.0, 2.0),
               n_streaks=22)
    J = Layer(H, Wd)                                    # slab joints in perspective: lost far, crisper near
    vp = (820.0, -1400.0)
    for xb_ in np.arange(half - 600, Wd + 700, 170):
        for y in range(0, H):
            x = vp[0] + (xb_ - vp[0]) * (y - vp[1]) / (H - vp[1])
            if half <= x < Wd - 1:
                J.a[y, int(x)] = lerp(0.1, 0.55, y / H)
    for yj in [30, 92, 170, 266]:
        J.a[yj:yj + 2, half:] = np.maximum(J.a[yj:yj + 2, half:], lerp(0.1, 0.55, yj / H))
    J.rgb[:] = shift(pbody, dL=-12) * J.a[..., None]
    J.blur(0.5).onto(cv, right)
    # the puddle: an organic crisp-edged shape; a darker wet ring round it; inside, a sharper mirror of
    # the higher sky (lighter than the wet stone) with the lamp's reflections
    env = np.exp(-0.5 * (((xx - 830) / 150.0) ** 2 + ((yy - 228) / 30.0) ** 2))
    pud = (field(g('pud'), H, Wd, 22, 70) * 0.55 + env > 0.78).astype(np.float32) * right
    pud = ndi.gaussian_filter(ndi.binary_opening(pud > 0.5, iterations=2).astype(np.float32), 0.6)
    ring = np.clip(ndi.gaussian_filter(ndi.binary_dilation(pud > 0.5, iterations=6).astype(np.float32), 3) - pud, 0, 1)
    Layer(H, Wd).fill(shift(pbody, dL=-7), ring * 0.45).onto(cv, right)
    pt_ = np.clip((yy - 190) / 75.0, 0, 1)
    pc = mix(wet_sky(W, lerp(0.62, 0.98, pt_)), pbody, 0.1)
    cv[:] = cv * (1 - pud[..., None]) + pc.astype(np.float32) * pud[..., None]
    rim = np.clip(pud - np.roll(pud, 2, axis=0), 0, 1)  # the far edge catches the low sky: a thin light line
    Layer(H, Wd).fill(shift(wet_sky(W, 0.1), dL=2), rim * 0.75).onto(cv)
    lx = 646                                            # the lamp: a thin dark pole (its lit head above the frame)
    pole = ((np.abs(xx - lx) < 3) & (yy < 128)).astype(np.float32)
    rp = ((np.abs(xx - lx) < 3) & (yy > 132) & (yy < 330)).astype(np.float32) * (1 - smooth((yy - 132) / 200.0))
    Layer(H, Wd).fill(reflect(W['stone'], pbody, k=0.2, dL=0), ndi.gaussian_filter(rp, (7, 1.4)) * 0.65
                      ).onto(cv, right * (1 - pud))
    Layer(H, Wd).fill(reflect(W['stone'], pbody, k=0.15, dL=-4), ndi.gaussian_filter(rp, (1.5, 0.7)) * 0.9
                      ).onto(cv, pud)                   # sharper inside the puddle
    gl = np.exp(-0.5 * ((xx - lx) / 8.0) ** 2) * smooth((yy - 190) / 20.0) * (1 - smooth((yy - 230) / 100.0))
    Layer(H, Wd).fill(reflect(W['window'], pbody, k=0.15, dL=0), (0.7 * gl).astype(np.float32)).blur(
        (6, 1.5)).onto(cv, right, mode='screen')
    cv[:] = cv * (1 - pole[..., None]) + shift(W['stone'], dL=-6) * pole[..., None]
    gp = ndi.gaussian_filter(g('pgrain').standard_normal((H, Wd)), 0.6)
    cv[:] = np.clip(cv * (1 + 0.012 * gp / (gp.std() + 1e-6) * right * (1 - pud) * (yy / H))[..., None], 0, 1)
    return cv, 0


def e6_foam(seed, W):
    """E6 gentle waves and foam lines on a shore: wave face, dry-brush foam, crisp lit tops, lace, swash."""
    Wd, H, shore = 540, 260, 166
    g = lambda *k: rng_for(seed, 'e6', *k)
    nz = Noise(g('noise'))
    cv = np.zeros((H, Wd, 3), np.float32)
    yy, xx = np.mgrid[0:H, 0:Wd]
    sea = ndi.gaussian_filter((yy < shore + 4 * np.sin(xx / 90.0 + 1)).astype(np.float32), 0.6)
    wet_ground(cv, 1 - sea, W, seed, 'e6s', shift(W['sand'], dL=-18, cmul=1.15), shore, H, share=(0.75, 0.45),
               sky_t=(0.0, 0.7))
    calm = dict(RIPPLE, dens=(0.06, 0.18))
    water_body(cv, sea, W, seed, 'e6sea', 0, shore, (0.1, 0.8), crisp=2, ripple_spec=calm,
               strata_spec=dict(STRATA, local_keep=0.1))
    r = g('foam')
    for i, (y0, k, hmax) in enumerate([(42, 0.45, 4.5), (96, 0.72, 7.0), (shore - 10, 1.0, 10.0)]):
        def curve(x, y0=y0, k=k, i=i):
            return y0 + 3.5 * k * np.sin(x / 90.0 + 1 + 0.4 * i) + 1.5 * np.sin(x / 31.0 + i)
        swell = field(rng_for(seed, 'e6', 'swell', i), 1, Wd + 400, 1, 70)[0]   # the line thickens where it breaks
        face = Layer(H, Wd)                            # the wave face below the foam: a soft darker band
        x = -20
        while x < Wd:
            run = r.uniform(80, 220)
            chisel(face, nz, r, x, x + run, curve(x + run / 2) + hmax * 1.0, hmax * 1.7,
                   shift(base_of(W, 0.85 * k + 0.3), dL=-8), op=0.45, soft=0.35 * hmax * 1.7, dry=0.2, bdepth=0.0,
                   cj=0.0, rag=0.8)
            x += run * 0.9
        face.blur(2.0).onto(cv, sea)
        body, tops = Layer(H, Wd), Layer(H, Wd)
        x = r.uniform(-30, 10)
        while x < Wd:                                  # the foam body: dry-brush masses with gaps
            run = r.uniform(30, 150) * lerp(0.6, 1.0, k)
            sw_ = float(swell[int(np.clip(x + run / 2 + 200, 0, Wd + 399))])
            if r.random() < 0.55 + 0.4 * sw_:
                yc = curve(x + run / 2)
                h = hmax * lerp(0.35, 1.15, sw_) * r.uniform(0.8, 1.1)
                warm = float(smooth((220 - x) / 220.0)) * 0.35   # the sun's side (left) is a touch warmer
                c = mix(mix(W['f_shade'], W['f_light'], 0.35), W['sky_low'], warm)
                a, b = (x, x + run) if r.random() < 0.5 else (x + run, x)
                chisel(body, nz, r, a, b, yc, h, c, op=0.92, soft=0.85, dry=0.55, bdepth=0.3, cj=0.014, t1=0.45,
                       bow=r.normal(0, 0.6), thin_end=0.4, pressure=0.3, rag=1.1)
                if r.random() < 0.65:                   # the lit top: thin, crisp, broken
                    chisel(tops, nz, r, a + 0.1 * (b - a), b - 0.2 * (b - a), yc - 0.38 * h, r.uniform(1.2, 2.0),
                           mix(W['f_light'], W['sky_horizon'], warm), op=0.95, soft=0.55, dry=0.5, bdepth=0.0, cj=0.0,
                           rag=0.4)
                for _ in range(int(r.integers(1, 5))):  # lace dabs under the foam
                    lx = r.uniform(min(a, b), max(a, b))
                    chisel(body, nz, r, lx, lx + r.uniform(3, 9), yc + h * r.uniform(0.6, 1.4), r.uniform(1.2, 2.4), c,
                           op=0.6, soft=0.7, dry=0.3, bdepth=0.0, cj=0.0, rag=0.3)
            x += run * r.uniform(1.04, 1.3)
        body.blur(0.45).onto(cv)
        tops.onto(cv)
    sw = Layer(H, Wd)                                  # the swash on the wet sand: thin, lacy, low contrast
    for j in range(3):
        y0 = shore + 16 + 24 * j
        x = r.uniform(-40, 0)
        while x < Wd:
            run = r.uniform(40, 150)
            if r.random() < 0.7:
                chisel(sw, nz, r, x, x + run, y0 + 4 * np.sin((x + run / 2) / 45.0 + j), r.uniform(1.0, 1.7),
                       shift(W['f_light'], dL=-4 - 5 * j), op=0.65 - 0.14 * j, soft=0.7, dry=0.5, bdepth=0.0, cj=0.0,
                       slope=r.normal(0, 0.03), rag=0.4)
            x += run * r.uniform(1.1, 1.6)
    sw.blur(0.5).onto(cv, 1 - sea)
    return cv, 0


def e7_canal(seed, W):
    """E7 the recipe on the v4 canal: the design above the water is mirrored into the canal (the bridge,
    the far city, the building's lit door and windows, the quay), the water body painted around it, the
    sun's glint (sparse: the canal lies far below the horizon), the boats' and the duck's reflections,
    rings round the duck; the objects in the water and everything outside it stay our crisp flat."""
    y0, y1 = 1030, 1310
    des = np.asarray(Image.open(V4 / 'stage_v4_design.png').convert('RGB')).astype(np.float32) / 255
    band = des[y0:y1].copy()
    H, Wd = band.shape[:2]
    xs = np.arange(Wd)
    yw = (1068 + (1111 - 1068) * np.clip(xs / 460.0, 0, 1)) - y0       # the far waterline (measured)
    yn = (1143 + 0.1311 * xs) - y0                                      # the near quay edge (measured)
    yy = np.arange(H)[:, None]
    water = np.clip(yy - yw[None, :] + 0.5, 0, 1) * np.clip(yn[None, :] - yy + 0.5, 0, 1)
    # the objects standing in the water (our flat, crisp): non-water colours inside the canal, per box
    l = lab(band)
    hue = np.degrees(np.arctan2(l[..., 2], l[..., 1])) % 360
    chroma = np.hypot(l[..., 1], l[..., 2])
    waterish = (hue > 140) & (hue < 230) & (chroma > 4)
    obj = np.zeros((H, Wd), bool)
    for (xa, xb, ya, yb) in [(785, 1080, 1040, 1210), (355, 445, 1080, 1142), (650, 750, 1112, 1300)]:
        sub = ~waterish[ya - y0:yb - y0, xa:xb]
        if xa == 650:  # the door's old gold reflection stripe crosses Pip's box: not an object
            gold = (hue[ya - y0:yb - y0, xa:xb] > 50) & (hue[ya - y0:yb - y0, xa:xb] < 100)
            rows = (np.arange(ya, yb) >= 1122) & (np.arange(ya, yb) <= 1156)
            sub &= ~(gold & rows[:, None])
        obj[ya - y0:yb - y0, xa:xb] |= sub
    obj &= water > 0
    obj = ndi.binary_opening(obj, iterations=1)
    objf = ndi.gaussian_filter(obj.astype(np.float32), 0.5)
    cv = band.copy()
    s_of = lambda y: lerp(0.55, 0.95, np.clip((y - 40) / (H - 40), 0, 1))
    n, _ = water_body(cv, water, W, seed, 'e7w', 40, H, (0.55, 0.95), crisp=6, ripple_mul=0.9)
    # the reflection target: the design above the waterline, mirrored about it (per column);
    # rows 0-7 below the line show the quay's lip/face (a darker stone band), then the scene above it
    face = 7
    dd = np.arange(H)[:, None] - yw[None, :]
    face_rows = (dd >= 0) & (dd < face)
    ys = np.round(yw[None, :] + y0 - 10 - (dd - face)).astype(int)       # skip the quay's top strip (~10 px)
    scene_rows = (dd >= face) & (ys >= 600)
    tgt = des[np.clip(ys, 0, des.shape[0] - 1), xs[None, :]].astype(np.float32)
    tgt[face_rows] = shift(W['stone'], dL=6)
    cover = (face_rows | scene_rows).astype(np.float32)
    srow = s_of(np.arange(H))
    wcol = base_of(W, srow)[:, None, :]
    tgt = reflect(tgt, wcol, dL=(-4 - 8 * srow)[:, None]).astype(np.float32)   # + Fresnel: darker toward us
    rr = rng_for(seed, 'e7', 'wob')
    d = np.arange(H) - 75
    amp = 0.6 + 2.4 * np.clip(d / 120, 0, 1)
    tgt = wobble_rows(tgt, rr, amp)
    cover = wobble_rows(cover[..., None], rr, amp)[..., 0] * (field(rr, H, Wd, 5, 50) > 0.18)
    # the boats and the duck: mirrored about their own bottoms
    for (xa, xb, ya, yb) in [(785, 1080, 1040, 1210), (355, 445, 1080, 1142)]:
        sub = obj[ya - y0:yb - y0, xa:xb]
        if not sub.any():
            continue
        lbl, nl = ndi.label(sub)
        for j in range(1, nl + 1):
            m = lbl == j
            if m.sum() < 120:
                continue
            ys_, xs_ = np.where(m)
            ty = 2 * ys_.max() - ys_ + 1 + (ya - y0)
            tx = xs_ + xa
            keep = (ty >= 0) & (ty < H)
            ty, tx, sy_ = ty[keep], tx[keep], ys_[keep] + (ya - y0)
            keep = (water[ty, tx] > 0.5) & ~obj[ty, tx]
            ty, tx, sy_ = ty[keep], tx[keep], sy_[keep]
            tgt[ty, tx] = reflect(band[sy_, tx], wcol[ty, 0])
            cover[ty, tx] = 1
    lights = []
    for (xa, xb, ya, yb) in [(545, 712, 850, 1062)]:  # the lit doorway (the brightest source)
        y_top_ref = 1111 - y0 + face + (1101 - yb)
        lights.append((xa + 15, xb - 15, y_top_ref, 0.75 * (yb - ya), reflect(W['door'], wcol[int(y_top_ref), 0])))
    n += paint_reflection(cv, water * (1 - objf), W, seed, 'e7r', tgt, cover, yw, s_of, lights)
    n += glint_column(cv, water * (1 - objf), W, seed, 'e7g', 195.0, 96.0, int(yw[195]) + 1, int(yn[195]),
                      (0.2, 0.6), strength=0.55)
    # rings round the duck
    nz = Noise(rng_for(seed, 'e7', 'noise'))
    r = rng_for(seed, 'e7', 'rings')
    rings = Layer(H, Wd)
    px, pb = 400, 1137 - y0
    for kk in range(3):
        a = 46 * 1.5 ** kk
        b = a / 7
        for th0 in np.linspace(0, 2 * np.pi, int(r.integers(7, 10)), endpoint=False):
            th = th0 + r.uniform(0, 0.3)
            span = r.uniform(0.35, 0.6)
            x0_, x1_ = px + a * np.cos(th), px + a * np.cos(th + span)
            yy0, yy1 = pb + b * np.sin(th), pb + b * np.sin(th + span)
            if abs(x1_ - x0_) < 6:
                continue
            near_arc = np.sin(th + span / 2) > 0
            c = shift(base_of(W, 0.5), dL=2) if near_arc else shift(base_of(W, 1.1), dL=-1)
            chisel(rings, nz, r, x0_, x1_, yy0, (2.4 if near_arc else 1.6) * (1 - 0.15 * kk), c,
                   op=[0.75, 0.55, 0.35][kk] * (1 if near_arc else 0.7), slope=(yy1 - yy0) / (x1_ - x0_), soft=0.8,
                   dry=0.35, bdepth=0.0, cj=0.0, rag=0.3)
    rings.blur(0.35).onto(cv, water * (1 - objf))
    # the contact line under the far quay, crisp and dark
    cl = np.clip(1 - np.abs(yy - yw[None, :] - 0.8) / 1.2, 0, 1) * (water > 0)
    cv[:] = cv * (1 - 0.5 * cl[..., None]) + shift(W['stone'], dL=-12) * 0.5 * cl[..., None]
    cv[:] = cv * (1 - objf[..., None]) + band * objf[..., None]          # the objects stay our crisp flat
    return cv


# ----------------------------------------------------------------------------------------------
# 5. The sheet: each element beside the reference crop that shows it
# ----------------------------------------------------------------------------------------------
REFS = {  # (file, box, the frame's width in the file, note)
    'e1': ('refs_human_scale/03_beach_dusk.jpg', (0, 330, 1206, 627), 1206,
           '03 beach dusk: the sea and the wet sand mirror the sky, darker toward us'),
    'e2': ('poster_refs/07_kyoto.jpg', (600, 930, 1206, 1420), 1206,
           '07 Kyoto: a lit building mirrored in a calm pond, broken by light streaks'),
    'e3': ('refs_human_scale/03_beach_dusk.jpg', (100, 380, 703, 627), 1206,
           '03 beach dusk: the low sun, its soft warm column across the waves and the wet sand'),
    'e4': ('refs_paint/02_lighthouse_process.jpg', (222, 1640, 1162, 1815), 940,
           '02 lighthouse: near water as flat horizontal dashes; objects reflected as dashes'),
    'e5': ('refs_paint/01_beach_van_dusk.jpg', (22, 290, 1183, 405), 1161,
           '01 beach van: wet sand mirrors the pink sky in soft bands; rocks reflected soft and short'),
    'e6': ('refs_human_scale/03_beach_dusk.jpg', (240, 440, 843, 505), 1206,
           '03 beach dusk: foam lines, dry-brush broken tops, a darker wave face below'),
}
TITLES = {
    'e1': '1  Calm water mirroring the dusk sky',
    'e2': '2  Reflections of lit windows (a facade on a quay)',
    'e3': '3  The sun\'s glint column',
    'e4': '4  Small ripples and horizontal dashes (+ a post and its rings)',
    'e5': '5  Wet sand (left) and wet paving with a puddle (right)',
    'e6': '6  Gentle waves and foam lines on a shore',
    'e7': '7  Together: the King\'s Cross canal (the v4 layout, its water repainted by the recipe)',
}
NOTES = {
    'e1': 'base ladder + mirrored streaks, wash bands, strata + ripples in 3 planes, the horizon line',
    'e2': 'mirrored flat as opaque underpaint, dashes sampling it, glow + streaks, sky breaks, cores',
    'e3': 'a soft screened lift, gold dashes (continuous far, spaced near), a few cream cores',
    'e4': 'packed strata, warm/cool ripple dashes, calm gaps, crisp light edges; the post lifted, 3 rings',
    'e5': 'wet = darker ground + the sky (70 -> 30 %), sky bands streaked; paving: smeared, a crisp puddle',
    'e6': 'wave face (soft), dry-brush foam segments, crisp lit tops, lace dabs, swash lines',
    'e7': 'the same recipe on the v4 canal; boats, duck and Pip stay our crisp flat',
}


def font(size, bold=False):
    for p in ['/usr/share/fonts/opentype/inter/Inter-%s.otf' % ('SemiBold' if bold else 'Regular'),
              '/usr/share/fonts/truetype/dejavu/DejaVuSans%s.ttf' % ('-Bold' if bold else '')]:
        if Path(p).exists():
            return ImageFont.truetype(p, size)
    return ImageFont.load_default()


def to_img(cv):
    return Image.fromarray((np.clip(cv, 0, 1) * 255 + 0.5).astype(np.uint8))


def ref_crop(key):
    if key == 'e7':
        return Image.open(V4 / 'paint_still_v4.png').convert('RGB').crop((0, 1030, 1080, 1310)), 1080, \
            'our v4 still: the flat mint canal (before)'
    f, box, fw, note = REFS[key]
    return Image.open(LOOK / f).convert('RGB').crop(box), fw, note


def sheet(swatches, out, width=1600, cell=780, gap=20, margin=10):
    f1, f2, f3 = font(22, True), font(15), font(13)
    rows = []
    for key in ['e1', 'e2', 'e3', 'e4', 'e5', 'e6', 'e7']:
        if key not in swatches:
            continue
        ref, fw, rnote = ref_crop(key)
        ours = swatches[key]
        ra = ref.resize((cell, round(ref.height * cell / ref.width)), Image.LANCZOS)
        oa = to_img(ours).resize((cell, round(ours.shape[0] * cell / ours.shape[1])), Image.LANCZOS)
        rows.append((key, ra, oa, rnote))
    hdr = 70
    total = margin + hdr + sum(48 + max(ra.height, oa.height) + 26 + gap for _, ra, oa, _ in rows) + margin
    S = Image.new('RGB', (width, total), (246, 243, 240))
    d = ImageDraw.Draw(S)
    d.text((margin + 4, margin), 'Water and reflections: the recipe, painted. Left: the reference crop. Right: our '
                                 'recipe, in the King\'s Cross dusk light', fill=(40, 36, 44), font=f1)
    d.text((margin + 4, margin + 34), 'Each pair shows the same share of its frame\'s width. Code: '
                                      'video/scripts/look/paint/recipes/water.py (seeded). Recipe: '
                                      'video/docs/look/paint_recipes/water.md', fill=(90, 86, 96), font=f2)
    y = margin + hdr
    for key, ra, oa, rnote in rows:
        d.text((margin + 4, y + 8), TITLES[key], fill=(40, 36, 44), font=f1)
        y += 48
        S.paste(ra, (margin, y))
        S.paste(oa, (margin + cell + gap, y))
        hh = max(ra.height, oa.height)
        d.text((margin + 2, y + hh + 5), 'ref: ' + rnote, fill=(90, 86, 96), font=f3)
        d.text((margin + cell + gap + 2, y + hh + 5), 'ours: ' + NOTES[key], fill=(90, 86, 96), font=f3)
        y += hh + 26 + gap
    S.save(out, optimize=True)
    return S


def phone_check(swatches, out):
    """Phone size: each frame's full width shown at 400 px; the ref crop and ours at the same scale."""
    tiles = []
    for key in ['e1', 'e2', 'e3', 'e4', 'e5', 'e6', 'e7']:
        if key not in swatches:
            continue
        ref, fw, _ = ref_crop(key)
        k = 400 / fw
        ra = ref.resize((max(1, round(ref.width * k)), max(1, round(ref.height * k))), Image.LANCZOS)
        o = to_img(swatches[key])
        oa = o.resize((max(1, round(o.width * 400 / 1080)), max(1, round(o.height * 400 / 1080))), Image.LANCZOS)
        tiles.append((ra, oa))
    Wt = 40 + max(ra.width + 12 + oa.width for ra, oa in tiles)
    Ht = 30 + sum(max(ra.height, oa.height) + 14 for ra, oa in tiles)
    S = Image.new('RGB', (Wt, Ht), (246, 243, 240))
    y = 20
    for ra, oa in tiles:
        S.paste(ra, (20, y))
        S.paste(oa, (20 + ra.width + 12, y))
        y += max(ra.height, oa.height) + 14
    S.save(out)


ELEMENTS = {'e1': e1_mirror, 'e2': e2_windows, 'e3': e3_glint, 'e4': e4_ripples, 'e5': e5_wet, 'e6': e6_foam}


def main():
    ap = argparse.ArgumentParser(description=__doc__.split('\n\n')[0])
    ap.add_argument('--seed', type=int, default=1029)
    ap.add_argument('--out', type=Path, default=OUT)
    ap.add_argument('--scratch', type=Path, default=None)
    ap.add_argument('--only', default='e1,e2,e3,e4,e5,e6,e7', help='comma list of e1..e7')
    a = ap.parse_args()
    W = water_palette(KX_LIGHT)
    sw = {}
    for k in a.only.split(','):
        if k == 'e7':
            sw[k] = e7_canal(a.seed, W)
        else:
            sw[k], n = ELEMENTS[k](a.seed, W)
            print(k, sw[k].shape, 'strokes', n)
        if a.scratch:
            a.scratch.mkdir(parents=True, exist_ok=True)
            to_img(sw[k]).save(a.scratch / ('swatch_%s.png' % k))
    a.out.parent.mkdir(parents=True, exist_ok=True)
    sheet(sw, a.out)
    print('wrote', a.out)
    if a.scratch:
        phone_check(sw, a.scratch / 'phone_check.png')
        print('wrote', a.scratch / 'phone_check.png')


if __name__ == '__main__':
    main()
