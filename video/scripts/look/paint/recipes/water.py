#!/usr/bin/env python3
"""Water and reflections: the painting recipe as code (video/docs/look/paint_recipes/water.md).

Paints the recipe's water elements as swatches in the scene's own light (an October dusk at the
King's Cross canal, a low sun on the left; the colours are sampled from paint_still_v4), puts each
beside the reference crop that shows it, and writes video/docs/look/paint_recipes/water_swatch.png
(1600 px wide). Every size is in frame px at 1080 x 1920.

  python3 video/scripts/look/paint/recipes/water.py                 # the sheet
  python3 video/scripts/look/paint/recipes/water.py --seed 7        # a new painting of the same design
  python3 video/scripts/look/paint/recipes/water.py --scratch /tmp/recipes/water
                                    # + each swatch at frame scale and a phone-size check (400 px frame)

Deterministic: every element, pass and stroke family draws from its own generator, keyed by
(seed, element, pass), so changing one element never changes another. numpy, PIL, scipy and skimage
only; it reads the references and the v4 still, and writes only the sheet (and the scratch files).
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
    """One generator per (seed, element, pass...): deterministic and independent."""
    h = hashlib.sha256(('%d|' % seed + '|'.join(map(str, keys))).encode()).digest()
    return np.random.default_rng(int.from_bytes(h[:8], 'little'))


def hexrgb(h):
    h = h.lstrip('#')
    return np.array([int(h[i:i + 2], 16) for i in (0, 2, 4)], np.float64) / 255.0


_M = np.array([[0.4124564, 0.3575761, 0.1804375], [0.2126729, 0.7151522, 0.0721750],
               [0.0193339, 0.1191920, 0.9503041]])
_WP = np.array([0.95047, 1.0, 1.08883])


def lab(rgb):
    """sRGB (..., 3) in 0-1 -> CIE Lab (D65)."""
    c = np.clip(np.asarray(rgb, np.float64), 0, 1)
    c = np.where(c > 0.04045, ((c + 0.055) / 1.055) ** 2.4, c / 12.92)
    xyz = c @ _M.T / _WP
    f = np.where(xyz > 216 / 24389, np.cbrt(xyz), (24389 / 27 * xyz + 16) / 116)
    return np.stack([116 * f[..., 1] - 16, 500 * (f[..., 0] - f[..., 1]), 200 * (f[..., 1] - f[..., 2])], -1)


def rgb(lab_):
    """CIE Lab (..., 3) -> sRGB 0-1 (clipped)."""
    L, a, b = lab_[..., 0], lab_[..., 1], lab_[..., 2]
    fy = (L + 16) / 116
    f = np.stack([fy + a / 500, fy, fy - b / 200], -1)
    xyz = np.where(f ** 3 > 216 / 24389, f ** 3, (116 * f - 16) / (24389 / 27)) * _WP
    c = xyz @ np.linalg.inv(_M).T
    c = np.where(c > 0.0031308, 1.055 * np.clip(c, 0, None) ** (1 / 2.4) - 0.055, 12.92 * c)
    return np.clip(c, 0, 1)


def shift(c, dL=0.0, cmul=1.0, dh=0.0):
    """Move a colour in LCh: lighter/darker (dL, L* units), richer/greyer (cmul), hue turn (dh degrees)."""
    L, a, b = lab(c)
    C, h = np.hypot(a, b) * cmul, np.arctan2(b, a) + np.radians(dh)
    return rgb(np.array([L + dL, C * np.cos(h), C * np.sin(h)]))


def mix(c1, c2, t):
    """Mix two colours in Lab (t = share of c2)."""
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
    """Smooth value noise in [0, 1] with features about cy x cx px (the calm and windy patches)."""
    g = rng.random((int(np.ceil(h / cy)) + 4, int(np.ceil(w / cx)) + 4))
    yy, xx = np.meshgrid(np.arange(h) / cy + 1.5, np.arange(w) / cx + 1.5, indexing='ij')
    f = ndi.map_coordinates(g, [yy, xx], order=3, mode='nearest')
    f = (f - f.min()) / max(1e-6, f.max() - f.min())
    return f


# ----------------------------------------------------------------------------------------------
# 1. Layers and the brush
# ----------------------------------------------------------------------------------------------
class Layer:
    """One paint pass: premultiplied colour + alpha. Strokes go on with 'over'; the pass is then
    blurred by its plane's sigma and composited onto the canvas inside the design's mask."""

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

    def blur(self, sigma):
        if np.max(sigma) > 0:
            self.rgb = ndi.gaussian_filter(self.rgb, (*np.broadcast_to(sigma, 2), 0))
            self.a = ndi.gaussian_filter(self.a, sigma)
        return self

    def onto(self, cv, mask=None, mode='over'):
        a = self.a if mask is None else self.a * mask
        c = self.rgb if mask is None else self.rgb * mask[..., None]
        if mode == 'over':
            cv[:] = cv * (1 - a[..., None]) + c
        else:  # 'screen': lifts the underpaint and keeps its variation (glow)
            cv[:] = 1 - (1 - cv) * (1 - c)
        return cv


def chisel(layer, nz, rng, x0, x1, yc, h, col, op=0.9, slope=0.0, bow=0.0, soft=0.9, t1=0.25,
           thin_end=0.45, dry=0.35, bdepth=0.16, cj=0.012):
    """One flat-brush stroke along a near-horizontal path (x0 -> x1; x1 < x0 pulls it right to left).
    The brush touches down blunt and full at x0, and over the last t1 of the run it lifts (thins by
    thin_end) and dries (a share `dry` breaks up along the bristles). h = the brush width (stroke
    thickness, px); soft = the edge ramp (px: 0.8 crisp flat paint .. 0.4*h a soft wash);
    bdepth = bristle streaks in the alpha; cj = the colour drift of the paint load along the run."""
    rev = x1 < x0
    xs_f, xe_f = (x1, x0) if rev else (x0, x1)
    run = max(xe_f - xs_f, 1.0)
    xa, xb = int(np.floor(xs_f)) - 2, int(np.ceil(xe_f)) + 3
    xs = np.arange(xa, xb) + 0.5
    u = np.clip((xs - xs_f) / run, 0, 1)
    if rev:
        u = 1 - u
    yl = yc + slope * (xs - x0) + bow * 4 * u * (1 - u)
    prof = (0.82 + 0.18 * smooth(u / 0.08)) * (1 - thin_end * smooth((u - (1 - t1)) / max(t1, 1e-3)))
    hh = 0.5 * h * prof
    ya = int(np.floor((yl - hh).min() - soft)) - 1
    yb = int(np.ceil((yl + hh).max() + soft)) + 2
    ys = np.arange(ya, yb) + 0.5
    a = np.clip((hh[None, :] - np.abs(ys[:, None] - yl[None, :])) / soft + 0.5, 0, 1)
    a *= (np.clip((xs - xs_f) / 1.2 + 0.5, 0, 1) * np.clip((xe_f - xs) / 1.2 + 0.5, 0, 1))[None, :]
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


# ----------------------------------------------------------------------------------------------
# 2. The palette: sampled from the scene's light, the water palette derived by the recipe's rules
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
    # foam: lit by the sky (never pure white at dusk) and its shade
    W['f_light'] = mix(c['sky_upper'], np.ones(3), 0.5)
    W['f_shade'] = shift(c['sky_upper'], dL=-9, cmul=1.15)
    return W


def base_of(W, s):
    """The water's base colour at perspective depth s (0 = the far waterline, 1 = near, beyond = deeper)."""
    return grad([(-0.35, W['w_far_light']), (0.0, W['w_far']), (0.3, W['w_mid']), (0.65, W['w_near']),
                 (1.0, W['w_deep']), (1.4, W['w_deeper'])], s)


def reflect(src, water, k=0.25, dL=-4.0, cmul=0.88):
    """The reflection rule: a reflection moves 25 % toward the water's own colour, then 4 L* darker
    and a little greyer (light things reflect darker, dark things lighter). Works on images too."""
    l = lab(src) * (1 - k) + lab(water) * k
    l[..., 0] += dL
    l[..., 1:] *= cmul
    return rgb(l)


# ----------------------------------------------------------------------------------------------
# 3. The shared water body: base ladder, soft wash bands, flat dashes in rows, crisp light strokes
# ----------------------------------------------------------------------------------------------
DASH = dict(h=(1.5, 10.0), med=(11.0, 40.0), sig=0.85, clip=(5.0, 260.0), gap=(0.15, 0.9),
            space=(2.7, 1.25), op=(0.62, 0.93), soft=(1.15, 0.8), dry=0.45, bdepth=0.16, cj=0.012,
            dens=(0.32, 0.78), blur=(1.4, 0.8, 0.35))


def dash_colour(W, s, rng, gain=1.0):
    """A dash's paint: facets tilted away show the lower (warmer, lighter) sky, i.e. the colour of
    water farther off; facets tilted toward us show the higher (cooler, darker) sky; the rest is the
    local colour moved a little (colour moving within the shape)."""
    ds = lerp(0.12, 0.36, min(max(s, 0), 1))
    r = rng.random()
    if r < 0.40:
        return shift(base_of(W, s - ds * rng.uniform(0.7, 1.2)), dL=gain * rng.uniform(1.5, 4.0))
    if r < 0.76:
        return shift(base_of(W, s + ds * rng.uniform(0.7, 1.2)), dL=-gain * rng.uniform(1.5, 4.0),
                     dh=rng.uniform(2, 6))
    return shift(base_of(W, s), dL=rng.normal(0, 1.5), dh=rng.normal(0, 3))


def dash_rows(layers, nz, rng, x0, x1, y0, y1, s_of, colour_of, density, spec=DASH):
    """Rows of flat horizontal dashes. Sizes, spacing, opacity and edge grow with depth s (perspective);
    each dash goes on its plane's layer (far / mid / near) so each plane gets its own blur."""
    n = 0
    y = y0 + rng.uniform(0, 2)
    while y < y1:
        s = float(np.clip(s_of(y), 0, 1))
        h = lerp(*spec['h'], s) * rng.uniform(0.8, 1.2)
        x = x0 - rng.uniform(0, 40)
        while x < x1:
            run = float(np.clip(rng.lognormal(np.log(lerp(*spec['med'], s)), spec['sig']), *spec['clip']))
            xc = x + run / 2
            if rng.random() < density(xc, y):
                col = colour_of(xc, y, s, rng)
                if col is not None:
                    k = min(2, int(s * 3))
                    a, b = (x, x + run) if rng.random() < 0.7 else (x + run, x)
                    chisel(layers[k], nz, rng, a, b, y + rng.normal(0, 0.5), h * rng.uniform(0.75, 1.15), col,
                           op=lerp(*spec['op'], s) * rng.uniform(0.85, 1.0), slope=rng.normal(0, 0.005),
                           bow=rng.normal(0, 0.08 * h), soft=lerp(*spec['soft'], s), t1=rng.uniform(0.15, 0.4),
                           dry=spec['dry'] * rng.uniform(0.3, 1.0), bdepth=spec['bdepth'], cj=spec['cj'])
                    n += 1
            x += run * (1 + rng.uniform(*spec['gap']))
        y += h * lerp(*spec['space'], s) * rng.uniform(0.8, 1.25)
    return n


def water_body(cv, mask, W, seed, key, y_top, y_bot, s_range, mirrors=(), wind=(46, 280), dens=None,
               gain=1.0, crisp=6, grain=True, light_edge=None, spec=DASH):
    """Recipe passes 1-4 for any calm water shape (mask): returns the dash count.
    P0 design: the base ladder by depth. P1: big soft wash bands (+ the mirrored sky features), blurred.
    P2: flat dashes in rows, per plane, blurred less the nearer. P3: a few crisp light strokes.
    P4: grain on the near plane only."""
    H, Wd = mask.shape
    g = lambda *k: rng_for(seed, key, *k)
    nz = Noise(g('noise'))
    yy = np.arange(H)
    s_of = lambda y: lerp(s_range[0], s_range[1], np.clip((y - y_top) / max(1, y_bot - y_top), 0, 1))
    srow = s_of(yy)
    # P0: the design: the base ladder (the mirrored sky, darker and richer toward us)
    base = base_of(W, srow).astype(np.float32)
    flat = np.broadcast_to(base[:, None, :], (H, Wd, 3))
    cv[:] = cv * (1 - mask[..., None]) + flat * mask[..., None]
    # P1: big soft wash bands, along the form (horizontal), then the pass blur
    r1 = g('wash')
    wash = Layer(H, Wd)
    for _ in range(int(r1.integers(7, 12))):
        y = r1.uniform(y_top, y_bot)
        s = float(s_of(y))
        hh = lerp(10, 36, s) * r1.uniform(0.7, 1.3)
        xa = r1.uniform(-0.3, 0.5) * Wd
        xb = xa + r1.uniform(0.4, 1.0) * Wd
        col = shift(base_of(W, s + r1.uniform(-0.1, 0.1)), dL=r1.normal(0, 1.8), dh=r1.normal(0, 4))
        chisel(wash, nz, r1, xa, xb, y, hh, col, op=r1.uniform(0.28, 0.45), soft=0.45 * hh, dry=0.25,
               bdepth=0.08, cj=0.008, thin_end=0.5, t1=0.4)
    for (xa, xb, y, hh, col, op) in mirrors:  # the sky's features, mirrored: soft and darker
        chisel(wash, nz, r1, xa, xb, y, hh, col, op=op, soft=0.42 * hh, dry=0.2, bdepth=0.06, cj=0.006,
               thin_end=0.55, t1=0.4)
    wash.blur(lerp(7.0, 4.0, 0.5 * (s_range[0] + s_range[1]))).onto(cv, mask)
    # P2: the flat dashes, in rows, three planes
    r2 = g('dash')
    wf = field(g('wind'), H, Wd, *wind)
    d0, d1 = dens or spec['dens']
    density = lambda x, y: lerp(d0, d1, float(s_of(y))) * (
        0.22 + 0.78 * float(smooth((wf[int(np.clip(y, 0, H - 1)), int(np.clip(x, 0, Wd - 1))] - 0.28) / 0.45)))
    planes = [Layer(H, Wd) for _ in range(3)]
    n = dash_rows(planes, nz, r2, 0, Wd, y_top + 1, y_bot, s_of, lambda x, y, s, r: dash_colour(W, s, r, gain),
                  density, spec)
    for k, L in enumerate(planes):
        L.blur(spec['blur'][k]).onto(cv, mask)
    # P3: a few crisp light strokes, on the windy patches of the mid and near water (the light edges)
    r3 = g('crisp')
    top = Layer(H, Wd)
    tries = 0
    placed = 0
    while placed < crisp and tries < 400:
        tries += 1
        x, y = r3.uniform(0, Wd), r3.uniform(y_top + 0.35 * (y_bot - y_top), y_bot)
        if wf[int(y), int(x)] < 0.62 or mask[int(y), int(x)] < 0.5:
            continue
        s = float(s_of(y))
        col = shift(base_of(W, s - 0.5), dL=5)
        run = r3.uniform(30, 120) * lerp(0.6, 1.0, s)
        chisel(top, nz, r3, x, x + run * (1 if r3.random() < 0.6 else -1), y, r3.uniform(1.6, 2.6), col,
               op=0.9, soft=0.75, dry=0.35, bdepth=0.0, cj=0.0, t1=0.3)
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
        gn /= gn.std() + 1e-6
        near = smooth((srow - 0.55) / 0.3)[:, None] * mask
        cv[:] = np.clip(cv * (1 + 0.012 * gn * near)[..., None], 0, 1)
    return n


# ----------------------------------------------------------------------------------------------
# 4. The elements
# ----------------------------------------------------------------------------------------------
def e1_mirror(seed, W):
    """E1 calm water mirroring the dusk sky (a harbour: a low far quay on the left, open water right)."""
    Wd, H, yh = 1080, 460, 170
    g = lambda *k: rng_for(seed, 'e1', *k)
    nz = Noise(g('noise'))
    cv = np.zeros((H, Wd, 3), np.float32)
    # DESIGN: the scene's lower sky + three soft cloud streaks (they will be mirrored)
    t = np.clip(np.arange(H) / yh, 0, 1)
    sky = grad([(0, W['sky_band']), (0.62, W['sky_low']), (1, W['sky_horizon'])], t).astype(np.float32)
    cv[:] = sky[:, None, :]
    skym = np.zeros((H, Wd), np.float32)
    skym[:yh] = 1
    streaks = [(-60, 560, 52, 18), (430, 1140, 98, 24), (150, 700, 136, 10)]
    sl = Layer(H, Wd)
    mirrors = []
    for i, (xa, xb, y, hh) in enumerate(streaks):
        col = mix(W['cloud_shade'], sky[y], 0.42)
        chisel(sl, nz, g('sky', i), xa, xb, y, hh, col, op=0.62, soft=0.4 * hh, dry=0.25, bdepth=0.1,
               cj=0.01, thin_end=0.6, t1=0.35)
        chisel(sl, nz, g('sky', i, 'lit'), xa + 30, xb - 60, y - 0.42 * hh, 2.2, mix(W['sky_horizon'], np.ones(3), 0.3),
               op=0.55, soft=0.9, dry=0.45, bdepth=0.0, cj=0.0)
        d = yh - y  # mirrored: the same height below the waterline, a little compressed, darker
        mirrors.append((xa + 10, xb - 10, yh + 0.9 * d, hh * 0.85,
                        shift(reflect(col, base_of(W, 0.2)), dL=-4 - 10 * d / yh), 0.5))
    sl.blur(2.2).onto(cv, skym)
    # the far quay (left): a low hazy band with a few roof bumps; its edge is the waterline
    far = np.zeros((H, Wd), np.float32)
    rq = g('quay')
    xs = np.arange(Wd)
    top = yh - 9 - 5 * (field(rq, 1, Wd, 1, 60)[0] > 0.7)
    far[(np.arange(H)[:, None] >= top[None, :]) & (np.arange(H)[:, None] < yh) & (xs[None, :] < 640)] = 1
    far = ndi.gaussian_filter(far, 0.6)
    haze = mix(W['haze'], W['sky_horizon'], 0.35)
    cv[:] = cv * (1 - far[..., None]) + haze * far[..., None]
    water = np.zeros((H, Wd), np.float32)
    water[yh:] = 1
    n = water_body(cv, water, W, seed, 'e1w', yh, H, (0.0, 0.72), mirrors=mirrors, crisp=5,
                   light_edge=(640, Wd, yh + 1.6, mix(W['sky_horizon'], np.ones(3), 0.35)))
    # the quay's reflection: its silhouette mirrored under the waterline, darker, soft, broken by light rows
    rl = Layer(H, Wd)
    refl = np.zeros((H, Wd), np.float32)
    refl[yh:yh + (yh - top.min()) + 2] = far[yh - 1::-1][:(yh - top.min()) + 2]
    refl = ndi.gaussian_filter(refl, (1.8, 1.0)) * (smooth((640 - xs) / 6))[None, :]
    rc = reflect(haze, base_of(W, 0.05), dL=-8)
    rl.rgb[:] = rc
    rl.a[:] = refl * 0.85
    rl.rgb *= rl.a[..., None]
    rl.onto(cv)
    return cv, n


def e2_windows(seed, W):
    """E2 reflections of lit windows: a facade on its quay, mirrored about the waterline into the canal."""
    Wd, H, yw = 540, 400, 176
    g = lambda *k: rng_for(seed, 'e2', *k)
    nz = Noise(g('noise'))
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
    src[40:44, 30:500] = shift(W['facade_cream'], dL=-8)          # a sill line
    src[150:170] = W['paving']                                     # the quay's top
    src[170:yw] = shift(W['stone'], dL=4)                          # the quay's face (dark stone)
    cv[:yw] = src[:yw]
    water = np.zeros((H, Wd), np.float32)
    water[yw:] = 1
    # the open water below the reflection: the mirrored high sky (beyond the facade's top)
    n = water_body(cv, water, W, seed, 'e2w', yw, H, (0.55, 1.0), crisp=3, gain=1.0, dens=(0.35, 0.6))
    # the reflection target: the source mirrored about the waterline; the quay top is not seen in it,
    # the quay face is; light sources stretch 1.15x down in rippled water
    tgt = np.zeros((H, Wd, 3), np.float32)
    cover = np.zeros((H, Wd), np.float32)
    face = yw - 170
    for y in range(yw, H):
        d = y - yw
        if d < face:
            ys = yw - 1 - d
        else:
            ys = 150 - 1 - int((d - face) / 1.0)
        if ys < 26:
            continue
        tgt[y] = src[ys]
        cover[y] = 1
    s_row = lerp(0.55, 1.0, np.clip((np.arange(H) - yw) / (H - yw), 0, 1))
    water_col = base_of(W, s_row)[:, None, :]
    tgt = reflect(tgt, water_col).astype(np.float32)
    # P1: the soft underpaint of the reflection (the mirrored flat, blurred) + the glow under lit windows
    under = Layer(H, Wd)
    dist = np.clip((np.arange(H) - yw) / 140.0, 0, 1)[:, None]
    under.a[:] = cover * (0.92 - 0.45 * dist)
    under.rgb[:] = tgt * under.a[..., None]
    under.blur((2.6, 1.2)).onto(cv, water)
    yy, xx = np.mgrid[0:H, 0:Wd]
    for (xa, xb, ya, yb, c) in lit:  # one soft glow column per light source, screened on
        xc, wdt = (xa + xb) / 2, (xb - xa)
        y_top_ref = yw + face + (150 - yb)
        length = 1.7 * (yb - ya)
        prof = np.exp(-0.5 * ((xx - xc) / (0.42 * wdt)) ** 2) * smooth((yy - y_top_ref + 6) / 8) * \
            (1 - smooth((yy - y_top_ref) / length))
        cc = mix(reflect(c, base_of(W, 0.8)), base_of(W, 0.8), 0.35)
        glow = Layer(H, Wd)
        glow.a[:] = 0.42 * prof
        glow.rgb[:] = cc * glow.a[..., None]
        glow.blur(5).onto(cv, water, mode='screen')
    # P2: flat dashes that take their colour from the mirrored target (each dash samples it at its centre)
    r2 = g('dash')
    layer = Layer(H, Wd)
    y = yw + 1.0
    while y < H:
        d = y - yw
        s = lerp(0.55, 1.0, min(1, d / (H - yw)))
        h = lerp(3.0, 7.0, min(1, d / 160)) * r2.uniform(0.8, 1.2)
        x = -r2.uniform(0, 30)
        cov = lerp(0.95, 0.5, min(1, d / 150))
        while x < Wd:
            run = float(np.clip(r2.lognormal(np.log(lerp(16, 30, s)), 0.75), 5, 200))
            xc = int(np.clip(x + run / 2, 0, Wd - 1))
            yi = int(np.clip(y, 0, H - 1))
            if cover[yi, xc] > 0 and r2.random() < cov:
                wob = r2.normal(0, 1.2 + 4.0 * min(1, d / 120))
                c = shift(tgt[yi, xc], dL=r2.normal(0, 1.3))
                a, b = (x + wob, x + wob + run) if r2.random() < 0.7 else (x + wob + run, x + wob)
                chisel(layer, nz, r2, a, b, y, h, c, op=0.9, soft=0.8, dry=0.35, bdepth=0.14, cj=0.01,
                       t1=r2.uniform(0.15, 0.35), bow=r2.normal(0, 0.3))
                n += 1
            x += run * (1 + r2.uniform(0.05, 0.5))
        y += h * r2.uniform(0.95, 1.45)
    # the light sources' streaks: their dashes run on below the mirrored window, thinning out
    for (xa, xb, ya, yb, c) in lit:
        xc, wdt = (xa + xb) / 2, (xb - xa)
        y0 = yw + face + (150 - yb)
        cc = reflect(c, base_of(W, 0.8))
        y = y0 + (yb - ya) * 0.6
        while y < min(H - 2, y0 + 2.1 * (yb - ya)):
            k = (y - y0) / (2.1 * (yb - ya))
            if r2.random() < 1 - 0.7 * k:
                run = wdt * r2.uniform(0.35, 0.95) * (1 - 0.45 * k)
                x = xc + r2.normal(0, 0.18 * wdt) - run / 2
                chisel(layer, nz, r2, x, x + run, y, r2.uniform(2.5, 4.5), shift(cc, dL=-6 * k), op=0.85, soft=0.8,
                       dry=0.4, bdepth=0.1, cj=0.01)
            y += r2.uniform(5, 9)
    layer.blur(0.5).onto(cv, water)
    # P3: the sky breaks (light rows across the reflection) and the crisp cores under the lit windows
    r3 = g('crisp')
    top = Layer(H, Wd)
    y = yw + 10
    while y < H - 4:
        if r3.random() < 0.55:
            run = r3.uniform(60, 300)
            x = r3.uniform(-60, Wd)
            s = lerp(0.55, 1.0, min(1, (y - yw) / (H - yw)))
            chisel(top, nz, r3, x, x + run, y, r3.uniform(1.4, 2.4), shift(base_of(W, s - 0.55), dL=2), op=0.7,
                   soft=0.8, dry=0.45, bdepth=0.0, cj=0.0)
        y += r3.uniform(9, 22)
    for (xa, xb, ya, yb, c) in lit:
        y0 = yw + face + (150 - yb)
        for j in range(int(r3.integers(2, 5))):
            run = (xb - xa) * r3.uniform(0.25, 0.55)
            x = r3.uniform(xa, xb - run)
            chisel(top, nz, r3, x, x + run, y0 + 3 + j * r3.uniform(4, 8), 2.0, shift(c, dL=-2), op=0.95, soft=0.7,
                   dry=0.3, bdepth=0.0, cj=0.0)
    # the contact line: the quay face meets the water (crisp, dark)
    top.a[yw:yw + 2] = 0.55
    top.rgb[yw:yw + 2] = shift(W['stone'], dL=-14) * 0.55
    top.onto(cv, water)
    return cv, n


def e3_glint(seed, W):
    """E3 the sun's glint column on calm water: a soft lift, then gold dashes, then a few crisp cores."""
    Wd, H, yw = 540, 420, 132
    g = lambda *k: rng_for(seed, 'e3', *k)
    nz = Noise(g('noise'))
    cv = np.zeros((H, Wd, 3), np.float32)
    t = np.clip(np.arange(H) / yw, 0, 1)
    cv[:] = grad([(0, W['sky_band']), (0.55, W['sky_low']), (1, W['sky_horizon'])], t).astype(np.float32)[:, None]
    # the sun: a half disc on the far bank (as in the scene: 96 px across)
    xc, D = 270.0, 96.0
    yy, xx = np.mgrid[0:H, 0:Wd]
    sun = smooth((D / 2 - np.hypot(xx - xc, yy - (yw - 14))) / 1.2 + 0.5)
    cv[:] = cv * (1 - sun[..., None]) + W['sun'] * sun[..., None]
    # the far bank (a hazy far city in front of the sun's lower half)
    bank = ((yy >= yw - 20 - 6 * (field(g('bank'), 1, Wd, 1, 40)[0][None, :] > 0.6)) & (yy < yw)).astype(np.float32)
    bank = ndi.gaussian_filter(bank, 0.7)
    cv[:] = cv * (1 - bank[..., None]) + mix(W['haze'], W['sky_horizon'], 0.25) * bank[..., None]
    water = (yy >= yw).astype(np.float32)
    n = water_body(cv, water, W, seed, 'e3w', yw, H, (0.0, 0.8), crisp=2, dens=(0.25, 0.6))
    s_of = lambda y: lerp(0.0, 0.8, np.clip((y - yw) / (H - yw), 0, 1))
    half = lambda s: D * (0.45 + 0.55 * s)          # the column's half width, px
    # P1: the glow: a soft column, brightest at the far end, screened onto the water
    glow = Layer(H, Wd)
    s = s_of(yy)
    prof = np.exp(-0.5 * ((xx - xc) / (0.8 * half(s))) ** 2) * lerp(0.42, 0.14, s / 0.8) * water
    glow.a[:] = prof
    glow.rgb[:] = W['g_fringe'] * prof[..., None]
    glow.blur(6).onto(cv, water, mode='screen')
    # P2: the glint dashes: rows nearly continuous far off, spaced out near; x around the centre
    r2 = g('dash')
    dl = Layer(H, Wd)
    cores = []
    y = yw + 2.0
    while y < H - 2:
        sy = float(s_of(y))
        k = sy / 0.8
        for _ in range(int(r2.poisson(lerp(3.2, 1.6, k))) + 1):
            x = xc + r2.normal(0, half(sy) / 1.7)
            if abs(x - xc) > 2.2 * half(sy):
                continue
            run = lerp(10, 48, k) * float(np.exp(r2.normal(0, 0.45)))
            h = lerp(1.4, 4.6, k) * r2.uniform(0.8, 1.2)
            p = r2.random()
            c = W['g_core'] if (p < 0.12 and k < 0.4) else (W['g_fringe'] if p > 0.78 else W['g_gold'])
            fall = np.exp(-0.5 * ((x - xc) / half(sy)) ** 2)
            op = lerp(0.95, 0.7, k) * (0.55 + 0.45 * fall)
            chisel(dl, nz, r2, x - run / 2, x + run / 2, y, h, c, op=op, soft=0.75, dry=0.35, bdepth=0.08, cj=0.01,
                   t1=0.3)
            if fall > 0.55 and r2.random() < 0.35:
                cores.append((x - run * 0.3, x + run * 0.3, y, max(1.0, h * 0.35)))
            n += 1
        y += lerp(2.6, 12.0, k) * r2.uniform(0.8, 1.25)
    dl.blur(0.6).onto(cv, water)
    # P3: the crisp cores and the merged bright line at the far waterline
    top = Layer(H, Wd)
    for (a, b, y, h) in cores:
        chisel(top, nz, r2, a, b, y, h, W['g_core'], op=0.95, soft=0.6, dry=0.2, bdepth=0.0, cj=0.0)
    chisel(top, nz, r2, xc - 0.9 * half(0), xc + 0.9 * half(0), yw + 1.5, 2.2, W['g_core'], op=0.9, soft=0.7,
           dry=0.3, bdepth=0.0, cj=0.0)
    top.onto(cv, water)
    return cv, n


def e4_ripples(seed, W):
    """E4 near water: ripple dashes in light/dark pairs with calm gaps, a post with its rings."""
    Wd, H = 1080, 300
    g = lambda *k: rng_for(seed, 'e4', *k)
    nz = Noise(g('noise'))
    cv = np.zeros((H, Wd, 3), np.float32)
    water = np.ones((H, Wd), np.float32)
    spec = dict(DASH, dens=(0.5, 0.85))
    n = water_body(cv, water, W, seed, 'e4w', 0, H, (0.5, 1.05), crisp=12, spec=spec, wind=(40, 300))
    # a mooring post standing in the water (our flat: a dark stone post), its reflection and its rings
    px, pw, pt, pb = 760, 30, 40, 118
    yy, xx = np.mgrid[0:H, 0:Wd]
    post = (np.abs(xx - px) <= pw / 2) & (yy >= pt) & (yy < pb)
    post = ndi.gaussian_filter(post.astype(np.float32), 0.6)
    # its reflection: lifted (dark things reflect lighter), broken into dashes, wobbling
    r = g('post')
    rl = Layer(H, Wd)
    pc = reflect(W['stone'], base_of(W, 0.9), k=0.3, dL=2)
    y = pb + 1.0
    while y < min(H, pb + 1.3 * (pb - pt)):
        k = (y - pb) / (1.3 * (pb - pt))
        if r.random() < 1 - 0.55 * k:
            wob = r.normal(0, 1 + 4 * k)
            w2 = pw * r.uniform(0.8, 1.25)
            chisel(rl, nz, r, px - w2 / 2 + wob, px + w2 / 2 + wob, y, r.uniform(3, 5.5), pc, op=0.88 - 0.4 * k,
                   soft=0.8, dry=0.3, bdepth=0.1, cj=0.01)
        y += r.uniform(3.5, 6.5)
    rl.blur(0.5).onto(cv)
    # the rings: flattened ellipses (1:7) broken into dashes; the near arc lighter, the far arc darker
    rings = Layer(H, Wd)
    for kk in range(3):
        a = 40 * 1.6 ** kk
        b = a / 7
        fade = [0.9, 0.65, 0.42][kk]
        for th0 in np.linspace(0, 2 * np.pi, int(r.integers(7, 11)), endpoint=False):
            th = th0 + r.uniform(0, 0.3)
            span = r.uniform(0.35, 0.6)
            x0, x1 = px + a * np.cos(th), px + a * np.cos(th + span)
            y0, y1 = pb - 2 + b * np.sin(th), pb - 2 + b * np.sin(th + span)
            if abs(x1 - x0) < 6:
                continue
            near_arc = np.sin(th + span / 2) > 0
            c = shift(base_of(W, 0.45), dL=4) if near_arc else shift(base_of(W, 1.25), dL=-2)
            chisel(rings, nz, r, x0, x1, y0, (3.0 if near_arc else 2.2) * (1 - 0.15 * kk), c, op=fade,
                   slope=(y1 - y0) / (x1 - x0), soft=0.75, dry=0.3, bdepth=0.0, cj=0.0)
    rings.blur(0.35).onto(cv)
    stone = W['stone']  # the post itself: flat, lit on the sun's side (left)
    pcol = np.where((xx < px - 4)[..., None], shift(stone, dL=10), stone).astype(np.float32)
    cv[:] = cv * (1 - post[..., None]) + pcol * post[..., None]
    return cv, n


def e5_wet(seed, W):
    """E5 wet sand (left) and wet paving with a puddle and a lamp (right), both mirroring the dusk sky."""
    Wd, H = 1080, 340
    g = lambda *k: rng_for(seed, 'e5', *k)
    nz = Noise(g('noise'))
    cv = np.zeros((H, Wd, 3), np.float32)
    yy, xx = np.mgrid[0:H, 0:Wd]
    half = 540
    sky_m = lambda t: grad([(0, W['sky_horizon']), (0.35, W['sky_low']), (0.7, W['sky_band']), (1, W['sky_upper'])], t)
    # --- wet sand (left half) ---------------------------------------------------------------------
    sea_y = 44
    sand_dry = W['sand']
    sand_wet = shift(sand_dry, dL=-14, cmul=1.15)
    t = np.clip((np.arange(H) - sea_y) / (H - sea_y), 0, 1)
    rr = lerp(0.68, 0.22, t)                          # the share of sky in the wet sand: grazing far, less near
    wet = mix_rows(sand_wet, sky_m(t * 0.8), rr)
    left = np.zeros((H, Wd), np.float32)
    left[:, :half] = 1
    cv[:] = np.where(left[..., None] > 0, wet[:, None, :], cv)
    # the sea's last band at the top with its swash line
    seam = ((yy < sea_y + 3 * np.sin(xx / 70.0)) & (xx < half)).astype(np.float32)
    water_body(cv, ndi.gaussian_filter(seam, 0.6), W, seed, 'e5sea', 0, sea_y, (0.55, 0.75), crisp=1, grain=False)
    # P1: soft sky bands laid along the sand (the reflection streaked by the wet surface)
    r1 = g('bands')
    L1 = Layer(H, Wd)
    for _ in range(6):
        y = r1.uniform(sea_y + 8, H - 40)
        tt = (y - sea_y) / (H - sea_y)
        hh = r1.uniform(14, 34)
        c = mix(sky_m(r1.uniform(0.0, 0.6)), sand_wet, 0.25 + 0.4 * tt)
        chisel(L1, nz, r1, r1.uniform(-80, 200), r1.uniform(320, 640), y, hh, c, op=r1.uniform(0.3, 0.5),
               soft=0.45 * hh, dry=0.2, bdepth=0.05, cj=0.006)
    L1.blur((4, 10)).onto(cv, left)
    # the boulder (our flat) and its reflection: mirrored about its base, lifted, soft vertically
    bx, by, brx, bry = 250, 178, 74, 46
    boulder = (((xx - bx) / brx) ** 2 + ((yy - by) / bry) ** 2 < 1) & (yy < by + 4)
    boulder = ndi.gaussian_filter(boulder.astype(np.float32), 0.7)
    base_y = by + 4  # mirrored about its base line, shorter than the boulder, fading
    refl = boulder[np.clip(2 * base_y - np.arange(H), 0, H - 1), :]
    refl = refl * (yy > base_y - 1) * (1 - smooth((yy - base_y) / (0.75 * bry)))
    rl = Layer(H, Wd)
    rl.a[:] = ndi.gaussian_filter(refl, (4.5, 1.4)) * 0.85 * left
    rl.rgb[:] = reflect(W['stone'], sand_wet, k=0.3, dL=4) * rl.a[..., None]
    rl.onto(cv)
    # P2: the thin water-edge lines (light and a few dark), long, with soft ends
    r2 = g('edges')
    L2 = Layer(H, Wd)
    for i in range(9):
        y = r2.uniform(sea_y + 10, H - 30)
        x0 = r2.uniform(-100, 380)
        run = r2.uniform(120, 420)
        light = i < 6
        tt = (y - sea_y) / (H - sea_y)
        c = shift(sky_m(0.1), dL=-6 - 8 * tt) if light else shift(sand_wet, dL=-10)
        chisel(L2, nz, r2, x0, x0 + run, y, r2.uniform(1.2, 2.2), c, op=0.75, soft=0.8, dry=0.5, bdepth=0.0,
               cj=0.0, slope=r2.normal(0, 0.01), bow=r2.normal(0, 2), t1=0.4)
    L2.blur(0.4).onto(cv, left)
    # the wet/dry edge near the bottom: soft and wavy; the dry sand matte, with grain
    dry_m = ((yy > H - 50 + 8 * np.sin(xx / 53.0) + 5 * np.sin(xx / 17.0)) & (xx < half)).astype(np.float32)
    dry_m = ndi.gaussian_filter(dry_m, 5)
    cv[:] = cv * (1 - dry_m[..., None]) + sand_dry * dry_m[..., None]
    gn = ndi.gaussian_filter(g('sandgrain').standard_normal((H, Wd)), 0.6)
    cv[:] = np.clip(cv * (1 + 0.035 * gn / (gn.std() + 1e-6) * dry_m)[..., None], 0, 1)
    cv[:] = cv * (1 - boulder[..., None]) + np.where((xx < bx - 10)[..., None], shift(W['stone'], dL=8), W['stone']) * \
        boulder[..., None]
    # --- wet paving (right half) ------------------------------------------------------------------
    right = np.zeros((H, Wd), np.float32)
    right[:, half:] = 1
    pav_dry = W['paving']
    pav_wet = shift(pav_dry, dL=-12, cmul=1.15)
    tp = np.clip(np.arange(H) / H, 0, 1)
    pav = mix_rows(pav_wet, sky_m(0.2 + 0.6 * tp), lerp(0.5, 0.3, tp))
    cv[:] = np.where(right[..., None] > 0, pav[:, None, :], cv)
    # the sky's reflection in wet stone: smeared vertically (a soft vertical streak field)
    r3 = g('pav')
    L3 = Layer(H, Wd)
    for _ in range(26):
        x = r3.uniform(half, Wd)
        y = r3.uniform(0, H)
        L3.a[int(max(0, y - 60)):int(min(H, y + 60)), int(x):int(x) + int(r3.uniform(3, 9))] = r3.uniform(0.15, 0.3)
    L3.rgb[:] = sky_m(0.15) * L3.a[..., None]
    L3.blur((14, 2.0)).onto(cv, right)
    # slab joints in perspective: crisp near (bottom), lost far (top); darker where wet
    vp = (810, -900)
    J = Layer(H, Wd)
    for xb_ in np.arange(half - 400, Wd + 600, 150):
        for y in range(0, H, 2):
            tt = (y - vp[1]) / (H - vp[1])
            x = vp[0] + (xb_ - vp[0]) * tt
            if half <= x < Wd:
                J.a[y:y + 2, int(x)] = lerp(0.25, 0.75, y / H)
    for yj in [40, 108, 196, 304]:
        J.a[yj:yj + 2, half:] = np.maximum(J.a[yj:yj + 2, half:], lerp(0.25, 0.75, yj / H))
    J.rgb[:] = shift(pav_wet, dL=-14) * J.a[..., None]
    J.blur(0.5).onto(cv, right)
    # the puddle: a crisp-edged irregular shape, a sharper and lighter mirror of the sky
    pud = np.zeros((H, Wd), np.float32)
    for (cx, cy, ax, ay) in [(800, 220, 150, 30), (900, 240, 110, 26), (720, 238, 90, 20)]:
        pud = np.maximum(pud, (((xx - cx) / ax) ** 2 + ((yy - cy) / ay) ** 2 < 1).astype(np.float32))
    pud = ndi.gaussian_filter(pud, 0.7)
    pc = grad([(0, W['sky_band']), (1, W['sky_upper'])], np.clip((yy - 190) / 80.0, 0, 1))
    pc = shift_img(pc, dL=-6)
    cv[:] = cv * (1 - pud[..., None]) + pc * pud[..., None]
    # the lamp (our flat: a thin dark pole, its lit head above the swatch) and its reflections
    lx = 640
    pole = ((np.abs(xx - lx) < 3) & (yy < 120)).astype(np.float32)
    lamp_r = Layer(H, Wd)
    ref_pole = ((np.abs(xx - lx) < 3) & (yy > 124) & (yy < 300)).astype(np.float32) * (1 - smooth((yy - 124) / 170.0))
    lamp_r.a[:] = ndi.gaussian_filter(ref_pole, (6, 1.5)) * 0.6
    lamp_r.rgb[:] = shift(W['stone'], dL=6) * lamp_r.a[..., None]
    lamp_r.onto(cv, right)
    glow = Layer(H, Wd)
    gl = np.exp(-0.5 * ((xx - lx) / 9.0) ** 2) * smooth((yy - 200) / 20.0) * (1 - smooth((yy - 240) / 90.0))
    glow.a[:] = 0.55 * gl
    glow.rgb[:] = reflect(W['window'], pav_wet, k=0.2) * glow.a[..., None]
    glow.blur((5, 2)).onto(cv, np.maximum(right * 0.6, pud), mode='screen')
    cv[:] = cv * (1 - pole[..., None]) + shift(W['stone'], dL=-6) * pole[..., None]
    # speckle on the dry paving only (near): none on the puddle
    gp = ndi.gaussian_filter(g('pgrain').standard_normal((H, Wd)), 0.6)
    cv[:] = np.clip(cv * (1 + 0.018 * gp / (gp.std() + 1e-6) * right * (1 - pud) * (yy / H))[..., None], 0, 1)
    return cv, 0


def mix_rows(c, rows, t):
    """Mix colour c with per-row colours `rows` (H, 3) by per-row shares t (H,), in Lab."""
    l = lab(np.broadcast_to(c, rows.shape)) * (1 - t[:, None]) + lab(rows) * t[:, None]
    return rgb(l).astype(np.float32)


def shift_img(img, dL=0.0):
    l = lab(img)
    l[..., 0] += dL
    return rgb(l).astype(np.float32)


def e6_foam(seed, W):
    """E6 gentle waves and foam lines on a shore: wave face, dry-brush foam, crisp lit tops, lace, swash."""
    Wd, H = 540, 260
    g = lambda *k: rng_for(seed, 'e6', *k)
    nz = Noise(g('noise'))
    cv = np.zeros((H, Wd, 3), np.float32)
    shore = 168
    yy, xx = np.mgrid[0:H, 0:Wd]
    sea = (yy < shore + 4 * np.sin(xx / 90.0 + 1)).astype(np.float32)
    sea = ndi.gaussian_filter(sea, 0.6)
    # wet sand below (E5's rule), then the sea above it
    sky_m = lambda t: grad([(0, W['sky_horizon']), (0.35, W['sky_low']), (0.7, W['sky_band']), (1, W['sky_upper'])], t)
    t = np.clip((np.arange(H) - shore) / (H - shore), 0, 1)
    wet = mix_rows(shift(W['sand'], dL=-14, cmul=1.15), sky_m(0.2 + 0.5 * t), lerp(0.6, 0.3, t))
    cv[:] = wet[:, None, :]
    water_body(cv, sea, W, seed, 'e6sea', 0, shore, (0.1, 0.75), crisp=2, dens=(0.3, 0.55))
    # the foam lines follow the shoreline's curve; they compress with distance
    r = g('foam')
    lines = [(38, 0.45, 3.5), (92, 0.75, 5.5), (shore - 10, 1.0, 7.5)]
    for i, (y0, k, hmax) in enumerate(lines):
        curve = lambda x: y0 + 3.5 * k * np.sin(x / 90.0 + 1 + 0.4 * i) + 1.5 * np.sin(x / 31.0 + i)
        face = Layer(H, Wd)
        x = -20
        while x < Wd:  # the wave face under the foam: a soft darker band
            run = r.uniform(80, 220)
            yc = curve(x + run / 2) + hmax * 0.9
            chisel(face, nz, r, x, x + run, yc, hmax * 1.6, shift(base_of(W, 0.85 * k + 0.25), dL=-7), op=0.5,
                   soft=0.4 * hmax * 1.6, dry=0.2, bdepth=0.0, cj=0.0)
            x += run * 0.9
        face.blur(2.5).onto(cv, sea)
        body = Layer(H, Wd)
        tops = Layer(H, Wd)
        x = r.uniform(-30, 10)
        while x < Wd:  # the foam body: dry-brush segments with gaps; lit tops on some
            run = r.uniform(30, 190) * lerp(0.6, 1.0, k)
            if r.random() < 0.78:
                yc = curve(x + run / 2)
                h = hmax * r.uniform(0.6, 1.0)
                warm = smooth((200 - x) / 200.0) * 0.3   # the sun's side (left) is a touch warmer
                c = mix(W['f_shade'], W['sky_low'], warm)
                a, b = (x, x + run) if r.random() < 0.5 else (x + run, x)
                chisel(body, nz, r, a, b, yc, h, c, op=0.85, soft=0.9, dry=0.6, bdepth=0.3, cj=0.012, t1=0.45,
                       bow=r.normal(0, 0.6))
                if r.random() < 0.55:
                    tl = mix(W['f_light'], W['sky_horizon'], warm)
                    chisel(tops, nz, r, a + 0.15 * (b - a), b - 0.2 * (b - a), yc - 0.38 * h, r.uniform(1.1, 1.8), tl,
                           op=0.95, soft=0.6, dry=0.45, bdepth=0.0, cj=0.0)
                for _ in range(int(r.integers(0, 4))):  # lace dabs under the foam
                    lx = r.uniform(min(a, b), max(a, b))
                    chisel(body, nz, r, lx, lx + r.uniform(3, 8), yc + h * r.uniform(0.6, 1.3), r.uniform(1.2, 2.2),
                           c, op=0.55, soft=0.7, dry=0.3, bdepth=0.0, cj=0.0)
            x += run * r.uniform(1.08, 1.5)
        body.blur(0.5).onto(cv)
        tops.onto(cv)
    # the swash on the wet sand: thin lacy lines, wavy and broken, low contrast
    sw = Layer(H, Wd)
    for j in range(3):
        y0 = shore + 18 + 22 * j
        x = r.uniform(-40, 0)
        while x < Wd:
            run = r.uniform(40, 150)
            if r.random() < 0.7:
                yc = y0 + 4 * np.sin((x + run / 2) / 45.0 + j)
                chisel(sw, nz, r, x, x + run, yc, r.uniform(1.0, 1.6), shift(W['f_shade'], dL=4 - 4 * j), op=0.6 - 0.12 * j,
                       soft=0.7, dry=0.5, bdepth=0.0, cj=0.0, slope=r.normal(0, 0.03))
            x += run * r.uniform(1.1, 1.6)
    sw.blur(0.5).onto(cv, 1 - sea)
    return cv, 0


# ----------------------------------------------------------------------------------------------
# 5. The sheet: each element beside the reference crop that shows it
# ----------------------------------------------------------------------------------------------
REFS = {  # (file, box): the crops the recipe measured
    'e1': ('refs_human_scale/03_beach_dusk.jpg', (0, 330, 1206, 627), 1206,
           '03 beach dusk: the sea and the wet sand mirror the sky, darker toward us'),
    'e2': ('poster_refs/07_kyoto.jpg', (600, 930, 1206, 1420), 1206,
           '07 Kyoto: a lit building mirrored in a calm pond, broken by light streaks'),
    'e3': ('refs_human_scale/03_beach_dusk.jpg', (100, 380, 703, 627), 1206,
           '03 beach dusk: the low sun, its soft warm column across the waves and the wet sand'),
    'e4': ('refs_paint/02_lighthouse_process.jpg', (222, 1640, 1162, 1815), 940,
           '02 lighthouse: near water as flat horizontal dashes, objects reflected as dashes'),
    'e5': ('refs_paint/01_beach_van_dusk.jpg', (22, 290, 1183, 405), 1161,
           '01 beach van: wet sand mirrors the pink sky in soft bands; rocks reflected soft and short'),
    'e6': ('refs_human_scale/03_beach_dusk.jpg', (240, 440, 843, 505), 1206,
           '03 beach dusk: foam lines, dry-brush broken tops, a darker wave face below'),
}
TITLES = {
    'e1': '1  Calm water mirroring the dusk sky',
    'e2': '2  Reflections of lit windows (a facade on a quay)',
    'e3': '3  The sun\'s glint column',
    'e4': '4  Small ripples and horizontal dashes (+ a post\'s rings)',
    'e5': '5  Wet sand (left) and wet paving with a puddle (right)',
    'e6': '6  Gentle waves and foam lines on a shore',
}


def font(size, bold=False):
    for p in ['/usr/share/fonts/opentype/inter/Inter-%s.otf' % ('SemiBold' if bold else 'Regular'),
              '/usr/share/fonts/truetype/dejavu/DejaVuSans%s.ttf' % ('-Bold' if bold else '')]:
        if Path(p).exists():
            return ImageFont.truetype(p, size)
    return ImageFont.load_default()


def to_img(cv):
    return Image.fromarray((np.clip(cv, 0, 1) * 255 + 0.5).astype(np.uint8))


def sheet(swatches, notes, out, width=1600, cell=780, gap=20, margin=10):
    f1, f2, f3 = font(22, True), font(15), font(13)
    rows = []
    for key in ['e1', 'e2', 'e3', 'e4', 'e5', 'e6', 'e7']:
        if key not in swatches:
            continue
        ours, frac = swatches[key]
        if key == 'e7':
            ref = Image.open(V4 / 'paint_still_v4.png').convert('RGB').crop((0, 1030, 1080, 1310))
            rnote = 'our v4 still: the flat mint canal (before)'
        else:
            f, box, fw, rnote = REFS[key]
            ref = Image.open(LOOK / f).convert('RGB').crop(box)
        ra = ref.resize((cell, round(ref.height * cell / ref.width)), Image.LANCZOS)
        oa = to_img(ours).resize((cell, round(ours.shape[0] * cell / ours.shape[1])), Image.LANCZOS)
        rows.append((key, ra, oa, rnote))
    hdr = 70
    total = margin + hdr + sum(48 + max(ra.height, oa.height) + 26 + gap for _, ra, oa, _ in rows) + margin
    S = Image.new('RGB', (width, total), (246, 243, 240))
    d = ImageDraw.Draw(S)
    d.text((margin + 4, margin), 'Water and reflections: the recipe, painted (left: the reference crop; right: our recipe, '
                                 'in the King\'s Cross dusk light)', fill=(40, 36, 44), font=f1)
    d.text((margin + 4, margin + 34), 'Both sides show the same share of their frame\'s width. Ours: '
                                      'video/scripts/look/paint/recipes/water.py, seeded; recipe: '
                                      'docs/look/paint_recipes/water.md', fill=(90, 86, 96), font=f2)
    y = margin + hdr
    for key, ra, oa, rnote in rows:
        title = TITLES.get(key, '7  Together: the canal at King\'s Cross (the v4 layout, repainted by the recipe)')
        d.text((margin + 4, y + 8), title, fill=(40, 36, 44), font=f1)
        y += 48
        S.paste(ra, (margin, y))
        S.paste(oa, (margin + cell + gap, y))
        hh = max(ra.height, oa.height)
        d.text((margin + 2, y + hh + 5), 'ref: ' + rnote, fill=(90, 86, 96), font=f3)
        d.text((margin + cell + gap + 2, y + hh + 5), 'ours: ' + notes.get(key, ''), fill=(90, 86, 96), font=f3)
        y += hh + 26 + gap
    S.save(out, optimize=True)
    return S


def phone_check(swatches, out):
    """Phone size: each frame's full width shown at 400 px (the ref crop and ours at the same scale)."""
    tiles = []
    for key in ['e1', 'e2', 'e3', 'e4', 'e5', 'e6', 'e7']:
        if key not in swatches:
            continue
        ours, frac = swatches[key]
        if key == 'e7':
            ref = Image.open(V4 / 'paint_still_v4.png').convert('RGB').crop((0, 1030, 1080, 1310))
            fw = 1080
        else:
            f, box, fw, _ = REFS[key]
            ref = Image.open(LOOK / f).convert('RGB').crop(box)
        k = 400 / fw
        ra = ref.resize((max(1, round(ref.width * k)), max(1, round(ref.height * k))), Image.LANCZOS)
        o = to_img(ours)
        oa = o.resize((max(1, round(o.width * 400 / 1080)), max(1, round(o.height * 400 / 1080))), Image.LANCZOS)
        tiles.append((ra, oa))
    Wt = 20 + max(ra.width + 12 + oa.width for ra, oa in tiles) + 20
    Ht = 20 + sum(max(ra.height, oa.height) + 14 for ra, oa in tiles) + 10
    S = Image.new('RGB', (Wt, Ht), (246, 243, 240))
    y = 20
    for ra, oa in tiles:
        S.paste(ra, (20, y))
        S.paste(oa, (20 + ra.width + 12, y))
        y += max(ra.height, oa.height) + 14
    S.save(out)


def main():
    ap = argparse.ArgumentParser(description=__doc__.split('\n\n')[0])
    ap.add_argument('--seed', type=int, default=1029)
    ap.add_argument('--out', type=Path, default=OUT)
    ap.add_argument('--scratch', type=Path, default=None)
    ap.add_argument('--only', default=None, help='comma list of e1..e7')
    a = ap.parse_args()
    W = water_palette(KX_LIGHT)
    todo = a.only.split(',') if a.only else ['e1', 'e2', 'e3', 'e4', 'e5', 'e6']
    fns = {'e1': e1_mirror, 'e2': e2_windows, 'e3': e3_glint, 'e4': e4_ripples, 'e5': e5_wet, 'e6': e6_foam}
    fracs = {'e1': 1.0, 'e2': 0.5, 'e3': 0.5, 'e4': 1.0, 'e5': 1.0, 'e6': 0.5, 'e7': 1.0}
    notes = {
        'e1': 'base ladder + mirrored streaks, soft wash bands, dashes in 3 planes, the horizon line',
        'e2': 'mirrored flat (soft underpaint), dashes sampling it, glow + streaks, sky breaks, crisp cores',
        'e3': 'a soft screened lift, gold dashes (continuous far, spaced near), a few cream cores',
        'e4': 'warm/cool facet dashes in rows, calm gaps, crisp light edges, the post lifted + 3 rings',
        'e5': 'wet = darker ground + sky (68 -> 22 %), soft bands, edge lines; paving: streaks, a puddle',
        'e6': 'wave face (soft), dry-brush foam segments, crisp lit tops, lace dabs, swash lines',
        'e7': 'the recipe applied to the v4 layout: sky mirror, building reflection, glint, ripples',
    }
    sw = {}
    for k in todo:
        if k in fns:
            cv, n = fns[k](a.seed, W)
            sw[k] = (cv, fracs[k])
            print(k, cv.shape, 'dashes', n)
            if a.scratch:
                a.scratch.mkdir(parents=True, exist_ok=True)
                to_img(cv).save(a.scratch / ('swatch_%s.png' % k))
    if 'e7' in todo:
        cv = e7_canal(a.seed, W)
        sw['e7'] = (cv, 1.0)
        if a.scratch:
            to_img(cv).save(a.scratch / 'swatch_e7.png')
    a.out.parent.mkdir(parents=True, exist_ok=True)
    sheet(sw, notes, a.out)
    print('wrote', a.out)
    if a.scratch:
        phone_check(sw, a.scratch / 'phone_check.png')
        print('wrote', a.scratch / 'phone_check.png')


def e7_canal(seed, W):
    raise NotImplementedError


if __name__ == '__main__':
    main()
