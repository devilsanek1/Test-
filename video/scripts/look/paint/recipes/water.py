#!/usr/bin/env python3
"""Water and reflections: the painting recipe as code (video/docs/look/paint_recipes/water.md).

Paints the recipe's water elements as swatches in the scene's own light (an October dusk at the
King's Cross canal, a low sun on the left; colours sampled from paint_still_v4), puts each beside
the reference crop that shows it, and writes video/docs/look/paint_recipes/water_swatch.png
(1600 px wide). Row 7 applies the whole recipe to the v4 canal layout. Every size is in frame px
at 1080 x 1920.

  python3 video/scripts/look/paint/recipes/water.py                 # the sheet
  python3 video/scripts/look/paint/recipes/water.py --seed 7        # a new painting of the same design
  python3 video/scripts/look/paint/recipes/water.py --scratch /tmp/recipes/water/work/run --metrics
                     # + each swatch at frame scale, a phone-size check (400 px frame), the mark metrics

The recipe's one rule, measured on the references (water.md section 1.1): the water is a CALM,
designed base (75-90 % of it untouched by marks), and the marks are FEW and BOLD (light marks
+9..+16 L* over their base, dark ones -8..-14), covering 3-8 % of it, clustered on windy patches.

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


def hexs(c):
    c = np.clip(np.round(np.asarray(c, np.float64) * 255), 0, 255).astype(int)
    return '#%02x%02x%02x' % tuple(c)


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


def with_L(c, L):
    """The colour c's hue and chroma at lightness L (L* units)."""
    l = lab(c)
    l[..., 0] = L
    return rgb(l)


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
           thin_end=0.45, dry=0.35, bdepth=0.16, cj=0.012, pressure=0.12, rag=0.5, lens=0.0):
    """One flat-brush stroke along a near-horizontal path (x0 -> x1; x1 < x0 pulls it right to left).
    The brush touches down blunt and full at x0; over the last t1 of the run it lifts (thins by
    thin_end) and dries (a share `dry` breaks up along the bristles). h = the brush width (stroke
    thickness, px); soft = the edge ramp (px: 0.7 crisp flat paint .. 0.45*h a soft wash);
    pressure = the hand's slow thickness change along the run (+-share); rag = the dry-brush
    raggedness of the two long edges (px); bdepth = bristle streaks in the alpha; cj = the colour
    drift of the paint load along the run. lens > 0: a pointed stroke tapered at BOTH ends, its
    thickness sin(pi u) ** lens (0.35 a ripple line with tapered tips, 0.7 a glint lens/sliver)."""
    rev = x1 < x0
    xs_f, xe_f = (x1, x0) if rev else (x0, x1)
    run = max(xe_f - xs_f, 1.0)
    xa, xb = int(np.floor(xs_f)) - 2, int(np.ceil(xe_f)) + 3
    xs = np.arange(xa, xb) + 0.5
    u = np.clip((xs - xs_f) / run, 0, 1)
    if rev:
        u = 1 - u
    yl = yc + slope * (xs - x0) + bow * 4 * u * (1 - u)
    if lens > 0:
        prof = np.sin(np.pi * u) ** lens
    else:
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


def stroke(layer, nz, rng, x0, x1, yc, h, col, op, soft, dry_scale=1.0, bdepth=0.06, cj=0.008, bow=None, rag=0.4,
           ends=(0.6, 0.25, 0.15)):
    """A flat, opaque gouache dash with a random end style (taper 60 % / square-dry 25 % / blunt 15 %)
    and a hand's small wobble: the default mark of the recipe."""
    te, dr = END_STYLES[int(rng.choice(3, p=ends))]
    chisel(layer, nz, rng, x0, x1, yc, h, col, op=op, slope=rng.normal(0, 0.004),
           bow=rng.normal(0, 0.08 * h) if bow is None else bow, soft=soft, t1=rng.uniform(0.15, 0.4),
           thin_end=te, dry=dr * dry_scale, bdepth=bdepth, cj=cj, rag=rag)


def lens_mark(layer, nz, rng, xc, yc, length, h, col, op=0.95, soft=0.7, power=0.7):
    """A pointed lens/sliver (glints, light slivers): tapered at both ends, crisp, opaque."""
    chisel(layer, nz, rng, xc - length / 2, xc + length / 2, yc, h, col, op=op, soft=soft, dry=0.0, bdepth=0.0,
           cj=0.0, pressure=0.0, rag=0.15, lens=power)


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
    """Recipe section 3 (the palette rule): every water colour is a scene colour moved in LCh.
    The ladder is the sky mirrored, darker and richer toward us (never greyer, never beige)."""
    c = {k: hexrgb(v) for k, v in P.items()}
    W = dict(c)
    W['w_line'] = shift(c['sky_horizon'], dL=-1, cmul=1.05)                                  # the grazing glow
    W['w_far'] = shift(mix(c['sky_horizon'], c['sky_low'], 0.55), dL=-7, cmul=1.2, dh=-14)  # rose-peach
    W['w_mid'] = shift(mix(c['sky_band'], c['sky_upper'], 0.45), dL=-13, cmul=1.7)          # lilac-rose
    W['w_near'] = shift(c['sky_upper'], dL=-19, cmul=1.45, dh=-4)                           # lavender
    W['w_deep'] = shift(c['sky_top'], dL=-24, cmul=1.35, dh=-6)                             # blue-violet
    W['w_deeper'] = shift(c['sky_top'], dL=-32, cmul=1.25, dh=-8)
    W['w_plum'] = shift(c['cloud_shade'], dL=-22, cmul=1.15)                                # the dark accent
    # the sun's glint: cream core, gold, amber bed, rose fringe (the soft lift)
    W['g_core'] = hexrgb('#fff4dc')
    W['g_gold'] = shift(mix(c['sun'], c['sky_horizon'], 0.58), dL=4)
    W['g_amber'] = mix(c['sun'], c['sky_horizon'], 0.35)
    W['g_lift'] = mix(c['sun'], c['sky_band'], 0.55)
    # foam: lit by the sky (never white at dusk), and its shade
    W['f_light'] = mix(c['sky_upper'], c['sky_band'], 0.5)
    W['f_top'] = mix(c['sky_band'], c['sky_horizon'], 0.45)
    # wet ground: the dry colour darker and richer (then it mirrors the sky)
    W['sand_dry'] = shift(c['sand'], dL=-1, cmul=1.05, dh=-14)                              # peach-rose, not tan
    W['sand_wet'] = shift(c['sand'], dL=-16, cmul=1.15, dh=-16)
    W['paving_wet'] = shift(c['paving'], dL=-15, cmul=1.35, dh=-10)
    return W


LADDER = ('w_line', 'w_far', 'w_mid', 'w_near', 'w_deep', 'w_deeper')
LADDER_S = (-0.35, 0.0, 0.33, 0.66, 1.0, 1.4)


def base_of(W, s):
    """The water's base colour at perspective depth s (0 = the far waterline, 1 = near; beyond = deeper)."""
    return grad(list(zip(LADDER_S, [W[k] for k in LADDER])), s)


def mark_colour(W, s, dl, dh=0.0):
    """A mark at depth s: hue and chroma from the ladder 0.2 farther (a light mark: a facet tilted away
    shows the lower, warmer sky) or 0.25 nearer (a dark mark: tilted toward us, the higher, cooler sky),
    at exactly dl L* off the local base. So the contrast is the measured one, whatever the ladder."""
    base_L = float(lab(base_of(W, s))[0])
    src = base_of(W, s - 0.2 if dl > 0 else s + 0.25)
    return shift(with_L(src, base_L + dl), dh=dh)


def reflect(src, water, k=0.25, dL=-4.0, cmul=0.9):
    """The reflection rule: a reflection moves 25 % toward the water's own colour, then 4 L* darker and
    a little duller: light things reflect darker, dark things lighter. Works on images too."""
    l = lab(src) * (1 - k) + lab(water) * k
    l[..., 0] = l[..., 0] + dL
    l[..., 1:] *= cmul
    return rgb(l)


# ----------------------------------------------------------------------------------------------
# 3. The water body: P0 design ladder, P1 soft underpaint, P2 few bold marks per plane, P3 accents
# ----------------------------------------------------------------------------------------------
# The marks per depth plane (frame px at 1080 wide). cover = the share of the plane's water the marks
# cover (light + dark); calm = the wind level under which a patch stays a mirror (no marks).
PLANES = {
    # dash = (median length px, lognormal sigma); chain = dashes per chain (a broken line along a swell);
    # long = the share of chains that are one long tapered line instead; dl_* = the plane's two mark
    # colours as L* steps off the base at the plane's centre (ONE light and ONE dark colour per plane).
    'far': dict(s=(-1.0, 0.33), h=(1.0, 1.8), dash=(18.0, 0.6), chain=(1, 3), chain_gap=(0.15, 0.6), long=0.35,
                long_len=(60.0, 220.0), gap=(0.5, 2.0), space=(2.2, 3.2), cover=0.04, light=0.55, dl_light=9.0,
                dl_dark=-7.0, pair=0.0, op=0.85, soft=0.7, blur=0.6),
    'mid': dict(s=(0.33, 0.66), h=(1.8, 4.0), dash=(30.0, 0.6), chain=(1, 3), chain_gap=(0.1, 0.5), long=0.2,
                long_len=(60.0, 180.0), gap=(0.4, 1.6), space=(1.8, 2.6), cover=0.07, light=0.55, dl_light=12.0,
                dl_dark=-10.0, pair=0.15, op=0.9, soft=0.8, blur=0.45),
    'near': dict(s=(0.66, 9.0), h=(3.5, 8.0), dash=(42.0, 0.6), chain=(1, 3), chain_gap=(0.08, 0.45), long=0.15,
                 long_len=(70.0, 200.0), gap=(0.3, 1.2), space=(1.7, 2.4), cover=0.09, light=0.55, dl_light=14.0,
                 dl_dark=-12.0, pair=0.3, op=0.93, soft=0.85, blur=0.3),
}
CALM = 0.32  # wind below this: no marks at all (the calm patches keep the mirror)


def plane_of(s):
    return 'far' if s < 0.33 else ('mid' if s < 0.66 else 'near')


def underpaint(cv, mask, W, nz, rng, y_top, y_bot, s_of, n=(5, 9), mirrors=(), sigma=None):
    """P1: a few big soft wash strokes along the form (gentle variation inside the calm area, +-1.5-3.5 L*),
    plus the sky's designed features mirrored; then the pass blur (6 px far .. 3 px near)."""
    H, Wd = mask.shape
    wash = Layer(H, Wd)
    for _ in range(int(rng.integers(*n))):
        y = rng.uniform(y_top, y_bot)
        s = float(s_of(y))
        hh = lerp(14.0, 48.0, float(np.clip(s, 0, 1))) * rng.uniform(0.7, 1.3)
        xa = rng.uniform(-0.3, 0.5) * Wd
        col = shift(base_of(W, s + rng.uniform(-0.06, 0.06)), dL=rng.choice([-1.0, 1.0]) * rng.uniform(1.5, 3.5),
                    dh=rng.normal(0, 3))
        chisel(wash, nz, rng, xa, xa + rng.uniform(0.4, 1.0) * Wd, y, hh, col, op=rng.uniform(0.3, 0.45),
               soft=0.45 * hh, dry=0.2, bdepth=0.05, cj=0.006, thin_end=0.5, t1=0.4, rag=1.5)
    for (xa, xb, y, hh, col, op) in mirrors:
        chisel(wash, nz, rng, xa, xb, y, hh, col, op=op, soft=0.42 * hh, dry=0.2, bdepth=0.05, cj=0.006,
               thin_end=0.55, t1=0.4, rag=1.0)
    s_mid = float(np.clip(s_of(0.5 * (y_top + y_bot)), 0, 1))
    wash.blur(lerp(6.0, 3.0, s_mid) if sigma is None else sigma).onto(cv, mask)


def far_lines(layer, nz, rng, W, mask, s_of, y0, y1, x0, x1, n=(4, 10), wind=None):
    """P2 (far): the long thin lines across the far water (CRAFT f.7 f: 6-14 lines, 40-250 px, tapered):
    a light one is the lower sky seen in a long swell, a dark one its shade side."""
    H, Wd = mask.shape
    count = 0
    for _ in range(int(rng.integers(*n))):
        y = rng.uniform(y0 + 3, y1)
        run = rng.uniform(60, 250)
        x = rng.uniform(x0 - 40, x1 - run + 40)
        xi, yi = int(np.clip(x + run / 2, 0, Wd - 1)), int(np.clip(y, 0, H - 1))
        if mask[yi, xi] < 0.5:
            continue
        s = float(s_of(y))
        light = rng.random() < 0.55
        col = mark_colour(W, s, 9.0 if light else -7.0, 0 if light else 3)
        chisel(layer, nz, rng, x, x + run, y, rng.uniform(1.1, 1.8), col, op=0.8, soft=0.7, dry=0.3,
               bdepth=0.0, cj=0.0, rag=0.2, lens=0.35, slope=rng.normal(0, 0.002))
        count += 1
    return count


def plane_marks(layer, nz, rng, W, mask, wind, s_of, spec, y0, y1, x0, x1, dose=1.0, s_c=None):
    """P2: the marks of one depth plane, coverage-driven, in the plane's LIMITED palette: one light and one
    dark colour (+-0.7 L* jitter), set at the plane's centre depth s_c.
    Marks come in CHAINS along swell rows (1-5 dashes with small gaps: a broken line), or as one long
    tapered line (`long` of the chains). Every chain gets a weight from the wind (0 on calm patches); the
    chains are then accepted with the probability that makes their expected area = cover x the plane's
    water area. Returns (strokes, covered share)."""
    H, Wd = mask.shape
    if s_c is None:
        s_c = float(s_of(0.5 * (y0 + y1)))
    c_light = mark_colour(W, s_c, spec['dl_light'])
    c_dark = mark_colour(W, s_c, spec['dl_dark'], dh=3)
    chains = []
    y = y0 + rng.uniform(0, 2)
    while y < y1:
        k = float(np.clip((y - y0) / max(1, y1 - y0), 0, 1))       # the dashes grow toward us inside the plane
        h = rng.uniform(*spec['h']) * lerp(0.85, 1.15, k)
        x = x0 - rng.uniform(0, 120)
        while x < x1:
            dashes = []
            if rng.random() < spec['long']:
                L = rng.uniform(*spec['long_len'])
                dashes.append((x, L, 0.75 * h, True))
                xe = x + L
            else:
                xe = x
                for _ in range(int(rng.integers(spec['chain'][0], spec['chain'][1] + 1))):
                    L = float(np.clip(rng.lognormal(np.log(spec['dash'][0] * lerp(0.85, 1.2, k)), spec['dash'][1]),
                                      4.5 * h, 9.0 * spec['dash'][0]))
                    dashes.append((xe, L, h * rng.uniform(0.75, 1.25), False))
                    xe += L * (1 + rng.uniform(*spec['chain_gap']))
            xm, yi = int(np.clip(0.5 * (x + xe), 0, Wd - 1)), int(np.clip(y, 0, H - 1))
            wgt = float(mask[yi, xm]) * float(smooth((wind[yi, xm] - CALM) / 0.4))
            if wgt > 0.01:
                chains.append((y, dashes, wgt))
            x = xe + (xe - x) * rng.uniform(*spec['gap'])
        y += h * rng.uniform(*spec['space'])
    area = mask[int(max(0, y0)):int(min(H, y1))].sum()
    want = spec['cover'] * dose * area
    have = sum(sum(L * hh * 0.8 for (_, L, hh, _) in d) * w for (_, d, w) in chains)
    kacc = want / max(have, 1e-6)
    n = 0
    covered = 0.0
    for (y, dashes, wgt) in chains:
        if rng.random() >= min(1.0, kacc * wgt):
            continue
        light = rng.random() < spec['light']
        for (xa, L, hh, is_long) in dashes:
            if rng.random() < 0.2:                       # a chain is mostly one colour
                light = not light
            col = shift(c_light if light else c_dark, dL=rng.normal(0, 0.7))
            yy_ = y + rng.normal(0, 0.35)
            if is_long:
                chisel(layer, nz, rng, xa, xa + L, yy_, hh, col, op=spec['op'] * 0.9, soft=spec['soft'], dry=0.3,
                       bdepth=0.0, cj=0.0, rag=0.2, lens=0.3, slope=rng.normal(0, 0.002))
            else:
                a, b = (xa, xa + L) if rng.random() < 0.65 else (xa + L, xa)
                stroke(layer, nz, rng, a, b, yy_, hh, col, op=spec['op'] * rng.uniform(0.93, 1.0), soft=spec['soft'])
            n += 1
            covered += L * hh * 0.8
            if light and not is_long and rng.random() < spec['pair']:   # a dark partner under a light dash
                off = L * rng.uniform(-0.1, 0.3)
                stroke(layer, nz, rng, xa + off, xa + off + L * rng.uniform(0.5, 0.9), yy_ + 0.95 * hh, hh * 0.8,
                       shift(c_dark, dL=rng.normal(0, 0.7)), op=spec['op'], soft=spec['soft'])
                n += 1
                covered += L * 0.7 * hh * 0.8 * 0.8
    return n, covered


def water_body(cv, mask, W, seed, key, y_top, y_bot, s_range, mirrors=(), dose=None, wind_cell=(40, 280),
               accents=4, line=None, far_n=(4, 10), grain=True, base=None, underpaint_n=(5, 9)):
    """The recipe's passes P0-P4 for any calm water shape (mask, 0-1).
    P0 design: the base ladder by depth (or `base`, an (H, W, 3) designed flat), the sky mirrored.
    P1 underpaint: a few big soft strokes + the mirrored sky features, blurred 6 -> 3 px.
    P2 marks, plane by plane far -> near: the far lines, then coverage-driven bold dashes; each plane
       blurred by its own sigma (0.7 / 0.5 / 0.3 px) before it is composited.
    P3 accents: 3-6 crisp lightest strokes on windy spots + the horizon/waterline line (`line`).
    P4 texture: a faint horizontal tooth (+-0.5 L*) everywhere, a fine grain on the near plane only.
    dose: {'far': x, 'mid': x, 'near': x} multiplies each plane's coverage (1 = the measured dose).
    Returns (stats, wind)."""
    H, Wd = mask.shape
    dose = {'far': 1.0, 'mid': 1.0, 'near': 1.0, **(dose or {})}
    g = lambda *k: rng_for(seed, key, *k)
    nz = Noise(g('noise'))
    s_of = lambda y: lerp(s_range[0], s_range[1], np.clip((y - y_top) / max(1, y_bot - y_top), 0, 1))
    srow = s_of(np.arange(H))
    # P0: the design (the mirrored sky ladder, darker and richer toward us)
    flat = np.broadcast_to(base_of(W, srow).astype(np.float32)[:, None, :], (H, Wd, 3)) if base is None else base
    cv[:] = cv * (1 - mask[..., None]) + flat * mask[..., None]
    # P1: the soft underpaint
    underpaint(cv, mask, W, nz, g('wash'), y_top, y_bot, s_of, n=underpaint_n, mirrors=mirrors)
    # P2: the marks, far -> near, one layer per plane
    wind = field(g('wind'), H, Wd, *wind_cell)
    stats = {}
    for name in ('far', 'mid', 'near'):
        spec = PLANES[name]
        rows = np.where((srow >= spec['s'][0]) & (srow < spec['s'][1]))[0]
        rows = rows[(rows >= y_top) & (rows < y_bot)]
        if len(rows) == 0 or dose[name] <= 0:
            continue
        L = Layer(H, Wd)
        nl = far_lines(L, nz, g('lines'), W, mask, s_of, rows[0], rows[-1] + 1, 0, Wd, n=far_n) \
            if name == 'far' and far_n else 0
        n, cov = plane_marks(L, nz, g('marks', name), W, mask, wind, s_of, spec, rows[0], rows[-1] + 1, 0, Wd,
                             dose[name])
        L.blur(spec['blur']).onto(cv, mask)
        stats[name] = (n + nl, cov / max(1.0, mask[rows].sum()))
    # P3: accents: a few crisp lightest strokes on windy spots of the mid and near water
    r3 = g('accents')
    top = Layer(H, Wd)
    placed = tries = 0
    while placed < accents and tries < 800:
        tries += 1
        x, y = r3.uniform(0, Wd), r3.uniform(y_top + 0.3 * (y_bot - y_top), y_bot)
        if wind[int(y), int(x)] < 0.6 or mask[int(y), int(x)] < 0.5:
            continue
        s = float(s_of(y))
        run = r3.uniform(30, 110) * lerp(0.6, 1.0, float(np.clip(s, 0, 1)))
        chisel(top, nz, r3, x, x + run * (1 if r3.random() < 0.6 else -1), y, r3.uniform(1.5, 2.4),
               mark_colour(W, s, 16.0), op=0.92, soft=0.7, dry=0.35, bdepth=0.0, cj=0.0, t1=0.3, rag=0.2)
        placed += 1
    if line is not None:  # the open horizon's / far waterline's bright line: crisp, broken (80 %)
        (xa, xb, y, col) = line
        x = xa
        while x < xb:
            run = r3.uniform(40, 240)
            if r3.random() < 0.8:
                chisel(top, nz, r3, x, min(xb, x + run), y + r3.normal(0, 0.3), r3.uniform(1.6, 2.4), col,
                       op=0.92, soft=0.7, dry=0.25, bdepth=0.0, cj=0.0, rag=0.2)
            x += run * r3.uniform(1.05, 1.3)
    top.onto(cv, mask)
    # P4: texture: a faint horizontal tooth everywhere (+-0.5 L*), a fine grain on the near plane only
    tooth = Noise(g('tooth'), sx=9.0, sy=0.6).window(g('tooth', 'w'), H, Wd)
    mod = 0.006 * (tooth - 0.5) * 2
    if grain:
        gn = ndi.gaussian_filter(g('grain').standard_normal((H, Wd)), 0.7)
        mod = mod + 0.010 * gn / (gn.std() + 1e-6) * smooth((srow - 0.6) / 0.3)[:, None]
    cv[:] = np.clip(cv * (1 + mod * mask)[..., None], 0, 1)
    return stats, wind


# ----------------------------------------------------------------------------------------------
# 4. Reflections: one solid block, then level bars; sky breaks across it; lights as block + slivers
# ----------------------------------------------------------------------------------------------
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


def wobble_rows(img, rng, amp_of_row, cell=7.0):
    """Shift each row sideways by a smooth random offset (amplitude per row): ripples break a mirror."""
    H, Wd = img.shape[:2]
    off = ndi.gaussian_filter1d(rng.standard_normal(H + 40), cell)[20:20 + H]
    off = off / (off.std() + 1e-6) * amp_of_row
    xs = np.clip(np.round(np.arange(Wd)[None, :] - off[:, None]), 0, Wd - 1).astype(int)
    return img[np.arange(H)[:, None], xs]


def simplify(tgt, cover, W, s_rows, size=(7, 19)):
    """Only masses survive in a reflection: a median over (rows, cols); the uncovered parts filled with water."""
    filled = np.where(cover[..., None] > 0.5, tgt, base_of(W, s_rows)[:, None, :])
    return np.stack([ndi.median_filter(filled[..., i], size=size) for i in range(3)], -1).astype(np.float32)


def reflection(cv, mask, W, seed, key, tgt, cover, yw, s_of, lights=(), solid=0.6, op=0.97):
    """Paint a reflection (CRAFT f.7 c, painted). tgt = the toned mirror target (H, W, 3); cover = where
    the mirror exists; yw = the waterline per column. Returns the stroke count.
    P1 the solid block: opaque, down to `solid` (0.55-0.65) of the visible length, soft along the view
       (blur 1.2 y, 0.6 x); then LEVEL BARS on bands 7-12 px (perspective), each bar 70-85 % of its band,
       ends tapered and cut back 0-18 %, kept with a probability falling 0.9 -> 0.3, at most one break; the
       gaps tone-on-tone (35 % of the reflection under them).
    P2 sky breaks: thin long lines of the open water's light (the sky in a facet), 1.3-2.2 px, 50-280 px,
       5-11 px apart, more of them farther from the waterline.
    P2b lights: a soft screened glow column; a solid block over the first 35 % of the light's length; then
       up to 3 pointed slivers, each 15-30 % shorter and thinner, >= 4 px of water between them.
    P3 cores: 2-3 crisp strokes of the light's colour +6 L* at the top of each light's block."""
    H, Wd = mask.shape
    g = lambda *k: rng_for(seed, key, *k)
    nz = Noise(g('noise'))
    yw_c = np.broadcast_to(np.asarray(yw, np.float64), (Wd,))
    yy = np.arange(H)[:, None]
    d = yy - yw_c[None, :]
    cov_b = (cover * mask) > 0.5
    anyc = cov_b.any(0)
    last = np.where(anyc, H - 1 - np.argmax(cov_b[::-1], axis=0), 0).astype(np.float64)
    vis = np.maximum(4.0, last - yw_c)
    t = np.clip(d / vis[None, :], -1, 2)
    # P1: the solid block (alpha), then the bars (alpha strokes), the colour from the target
    A = (cover * smooth((d + 0.5) / 1.0) * (t < solid)).astype(np.float32)
    A = A * (1 - smooth((t - solid + 0.03) / 0.06))
    bars = Layer(H, Wd)
    rb = g('bars')
    y = float(np.min(yw_c[anyc])) if anyc.any() else 0.0
    n = 0
    white = np.ones(3)
    while y < H - 1:
        pitch = lerp(7.0, 12.0, float(np.clip(s_of(y), 0, 1))) * rb.uniform(0.85, 1.15)
        yi = int(min(H - 1, y + pitch / 2))
        row = cov_b[yi] & (t[yi] >= solid - 0.02) & (t[yi] <= 1.02)
        if row.any() and pitch >= 7:
            lbl, nr = ndi.label(row)
            for j in range(1, nr + 1):
                xs_ = np.where(lbl == j)[0]
                xa, xb = float(xs_[0]), float(xs_[-1] + 1)
                if xb - xa < 6:
                    continue
                tm = float(np.clip((t[yi, xs_].mean() - solid) / max(1e-3, 1 - solid), 0, 1))
                if rb.random() > lerp(0.9, 0.3, tm):
                    continue
                L = xb - xa
                xa2, xb2 = xa + rb.uniform(0, 0.18) * L, xb - rb.uniform(0, 0.18) * L
                segs = [(xa2, xb2)]
                if rb.random() < 0.3 and xb2 - xa2 > 40:
                    xm = rb.uniform(xa2 + 0.3 * (xb2 - xa2), xa2 + 0.7 * (xb2 - xa2))
                    gap = rb.uniform(6, 20)
                    segs = [(xa2, xm - gap / 2), (xm + gap / 2, xb2)]
                for (a, b) in segs:
                    chisel(bars, nz, rb, a, b, y + 0.4 * pitch, pitch * rb.uniform(0.7, 0.85), white, op=1.0,
                           soft=0.9, thin_end=0.5, t1=0.25, dry=0.2, bdepth=0.0, cj=0.0, rag=0.4)
                    n += 1
        y += pitch
    zone = cover * (t >= solid - 0.03) * (t <= 1.05)
    A = np.maximum(A, np.maximum(bars.a, 0.35 * zone))
    rl = Layer(H, Wd)
    rl.a[:] = A * op
    rl.rgb[:] = tgt * rl.a[..., None]
    rl.blur((1.2, 0.6)).onto(cv, mask)
    # P2b: the lights (glow, block, slivers, cores) go on before the breaks, so the breaks cross them
    yy2, xx2 = np.mgrid[0:H, 0:Wd]
    lay = Layer(H, Wd)
    rl2 = g('lights')
    tops = Layer(H, Wd)
    for (xa, xb, y_top, length, col) in lights:
        w_ = xb - xa
        xc = (xa + xb) / 2
        wc = base_of(W, float(s_of(y_top)))
        prof = np.exp(-0.5 * ((xx2 - xc) / (0.45 * w_)) ** 2) * smooth((yy2 - y_top + 4) / 6.0) * \
            (1 - smooth((yy2 - y_top) / (1.5 * length)))
        Layer(H, Wd).fill(mix(col, wc, 0.35), (0.32 * prof).astype(np.float32)).blur(5).onto(cv, mask, mode='screen')
        blk = 0.35 * length
        # the block: ONE solid shape (its sides wobbled by the ripples, its lower corners rounded)
        ry = (yy2 - y_top) / max(1.0, blk)
        off = ndi.gaussian_filter1d(rl2.standard_normal(H + 20), 3)[10:10 + H]
        off = (off / (off.std() + 1e-6) * lerp(0.4, 1.4, np.clip((np.arange(H) - y_top) / max(1.0, blk), 0, 1)))[:, None]
        half = 0.45 * w_ * (1 - 0.1 * np.clip(ry, 0, 1)) - 0.5 * w_ * smooth((ry - 0.75) / 0.25) * 0.35
        bm = (np.abs(xx2 - xc - off) <= half) & (ry >= 0) & (ry <= 1)
        blkL = Layer(H, Wd).fill(shift(col, dL=-4), ndi.gaussian_filter(bm.astype(np.float32), 0.6) * 0.97)
        blkL.onto(cv, mask)
        n += 1
        ys_, ws_, hs_ = y_top + blk + rl2.uniform(4, 6), 0.85 * w_, 4.2
        for i in range(3):
            if ys_ > y_top + 1.4 * length or ys_ >= H - 2:
                break
            lens_mark(lay, nz, rl2, xc + rl2.normal(0, 0.06 * w_), ys_, ws_, hs_, shift(col, dL=-5 - 2 * i), op=0.95)
            n += 1
            ys_ += hs_ / 2 + rl2.uniform(4.5, 7.5) + 0.85 * hs_ / 2
            ws_ *= rl2.uniform(0.7, 0.85)
            hs_ *= rl2.uniform(0.75, 0.85)
        for j in range(int(rl2.integers(2, 4))):
            run = w_ * rl2.uniform(0.25, 0.55)
            x = rl2.uniform(xa + 0.1 * w_, xb - 0.1 * w_ - run)
            chisel(tops, nz, rl2, x, x + run, y_top + 2.5 + j * rl2.uniform(3.5, 6), 1.8, shift(col, dL=6), op=0.95,
                   soft=0.7, dry=0.3, bdepth=0.0, cj=0.0, rag=0.2)
            n += 1
    lay.blur(0.35).onto(cv, mask)
    tops.onto(cv, mask)
    # P2: the sky breaks across the reflection (a facet facing the high sky shows the open water's light)
    r3 = g('breaks')
    br = Layer(H, Wd)
    y = (float(np.min(yw_c[anyc])) if anyc.any() else 0.0) + 7
    while y < H - 3:
        x = r3.uniform(-60, Wd)
        xi, yi = int(np.clip(x + 20, 0, Wd - 1)), int(np.clip(y, 0, H - 1))
        tt = float(np.clip(t[yi, xi], 0, 1))
        if cov_b[yi, xi] and r3.random() < lerp(0.3, 0.75, tt):
            run = r3.uniform(50, 280)
            s = float(s_of(y))
            chisel(br, nz, r3, x, x + run, y, r3.uniform(1.3, 2.2), mark_colour(W, s, r3.uniform(4, 8)), op=0.85,
                   soft=0.75, dry=0.45, bdepth=0.0, cj=0.0, rag=0.2, lens=0.3)
            n += 1
        y += r3.uniform(5, 11) * lerp(1.3, 0.8, tt)
    br.onto(cv, mask * np.clip(ndi.maximum_filter(cover, size=5), 0, 1))
    return n


# ----------------------------------------------------------------------------------------------
# 5. The sun's glint column: a soft lift, a bed of amber lenses, a few gold-white slivers
# ----------------------------------------------------------------------------------------------
def glint(cv, mask, W, seed, key, xc, D, y0, y1, strength=1.0, slivers=(4, 7)):
    """The column straight under the sun (x centre xc, sun diameter D), from the waterline y0 down to y1.
    P1 a soft screened lift, rose-gold, FWHM 1.1 D at the horizon -> 2 D near, opacity 0.42 -> 0.10 (blur 6).
    P2 the bed: one amber lens per band (pitch 5.5 -> 13 px; 14-46 x 1.6-5.5 px) on the axis (sd 0.18 of
       the width) + 0-2 small gold side glints per band (sd 0.45 of the width), all pointed, crisp (blur 0.5).
    P3 4-6 gold-white slivers on the far 60 % of the bed (20-36 px, +13 L* over it) and the merged short
       bright line under the sun at the horizon (0.9 D x 2 px). Never stars or point sparkles."""
    H, Wd = mask.shape
    g = lambda *k: rng_for(seed, key, *k)
    nz = Noise(g('noise'))
    yy, xx = np.mgrid[0:H, 0:Wd]
    k = np.clip((yy - y0) / max(1, y1 - y0), 0, 1)
    width = D * lerp(1.1, 2.0, k)
    prof = np.exp(-0.5 * ((xx - xc) / (width / 2.355)) ** 2) * lerp(0.42, 0.10, k) * strength * (yy >= y0)
    Layer(H, Wd).fill(W['g_lift'], (prof * mask).astype(np.float32)).blur(6).onto(cv, mask, mode='screen')
    r2 = g('bed')
    bed = Layer(H, Wd)
    lenses = []
    n = 0
    y = y0 + 2.5
    while y < y1 - 2:
        kk = (y - y0) / max(1, y1 - y0)
        wdt = D * lerp(1.1, 2.0, kk)
        for j in range(1 + int(r2.random() < 0.25)):     # a quarter of the bands carry a second lens
            if kk > 0.6 and r2.random() < 0.3:              # the near column thins out
                continue
            ln = lerp(14, 46, kk) * r2.uniform(0.6, 1.4) * (0.7 if j else 1.0)
            hh = lerp(1.6, 5.5, kk) * r2.uniform(0.8, 1.15) * (0.8 if j else 1.0)
            x = xc + r2.normal(0, lerp(0.16, 0.3, kk) * wdt) + (r2.choice([-1, 1]) * 0.3 * wdt if j else 0)
            if mask[int(min(H - 1, y)), int(np.clip(x, 0, Wd - 1))] > 0.5:
                lens_mark(bed, nz, r2, x, y + r2.normal(0, 0.6), ln, hh, mix(W['g_amber'], W['g_gold'],
                          r2.uniform(0.3, 0.8)), op=lerp(0.95, 0.72, kk) * min(1.0, strength + 0.2))
                lenses.append((x, y, ln, hh, kk))
                n += 1
        for _ in range(int(r2.poisson(lerp(1.4, 0.5, kk) * strength))):
            xs_ = xc + r2.normal(0, 0.45 * wdt)
            fall = float(np.exp(-0.5 * ((xs_ - xc) / (0.5 * wdt)) ** 2))
            if mask[int(min(H - 1, y)), int(np.clip(xs_, 0, Wd - 1))] < 0.5:
                continue
            lens_mark(bed, nz, r2, xs_, y + r2.normal(0, 1), lerp(8, 20, kk) * r2.uniform(0.8, 1.2),
                      lerp(1.2, 2.6, kk), W['g_gold'], op=0.75 * (0.4 + 0.6 * fall))
            n += 1
        y += lerp(5.5, 13.0, kk) * r2.uniform(0.85, 1.2)
    bed.blur(0.5).onto(cv, mask)
    top = Layer(H, Wd)
    far = [l for l in lenses if l[4] < 0.6]
    if far:
        pick = r2.choice(len(far), size=min(len(far), int(r2.integers(*slivers))), replace=False)
        for i in pick:
            x, y, ln, hh, kk = far[int(i)]
            bed_L = float(lab(mix(W['g_amber'], W['g_gold'], 0.55))[0])
            lens_mark(top, nz, r2, x + r2.normal(0, 2), y - 0.1 * hh, r2.uniform(20, 36) * lerp(0.6, 1.0, kk / 0.6),
                      lerp(2.0, 3.8, kk / 0.6), with_L(mix(W['g_core'], W['g_gold'], 0.4), min(98.0, bed_L + 13)),
                      op=0.95 * min(1.0, strength + 0.3))
            n += 1
    lens_mark(top, nz, r2, xc, y0 + 1.6, 0.9 * D, 2.0, W['g_core'], op=0.9 * min(1.0, strength + 0.3), power=0.35)
    top.onto(cv, mask)
    return n


# ----------------------------------------------------------------------------------------------
# 6. Wet ground: wet sand and wet paving mirror the sky; things on it reflect short; pools crisp
# ----------------------------------------------------------------------------------------------
def wet_sky(W, t):
    """What a wet surface mirrors, from its far edge (t=0, the low sky) toward us (t=1, the high sky):
    the sky's own layers, with its cloud bands, so the wet ground gets value structure (bands)."""
    cloud = mix(W['cloud_shade'], W['sky_upper'], 0.25)
    return grad([(0, W['sky_horizon']), (0.16, W['sky_low']), (0.32, cloud), (0.5, W['sky_band']),
                 (0.7, W['sky_upper']), (0.86, shift(W['cloud_shade'], dL=-4)), (1, W['sky_top'])], t)


def wet_ground(cv, mask, W, seed, key, body_wet, y0, y1, share=(0.75, 0.35), sky_t=(0.0, 1.0), blur=(3.0, 14.0),
               n_bands=16, dl=-3.0):
    """P0: the ground's wet colour (darker, richer than dry) mixed with the sky mirror, the sky's share far
    -> near (grazing views mirror more), a step (dl) under the sky. P1: soft bands of the mirrored sky's
    own colours along the ground (8-24 px, op 0.35-0.6), blurred along it (sigma y, x = 3, 14 px)."""
    H, Wd = mask.shape
    g = lambda *k: rng_for(seed, key, *k)
    nz = Noise(g('noise'))
    t = np.clip((np.arange(H) - y0) / max(1, y1 - y0), 0, 1)
    sk = wet_sky(W, lerp(sky_t[0], sky_t[1], t))
    rows = shift(mix(np.broadcast_to(body_wet, sk.shape), sk, lerp(share[0], share[1], t)), dL=dl)
    cv[:] = cv * (1 - mask[..., None]) + rows[:, None, :].astype(np.float32) * mask[..., None]
    r = g('bands')
    L = Layer(H, Wd)
    for _ in range(n_bands):
        y = r.uniform(y0, y1)
        tt = (y - y0) / max(1, y1 - y0)
        hh = r.uniform(8, 24)
        tsky = np.clip(lerp(sky_t[0], sky_t[1], tt) + r.normal(0, 0.12), 0, 1)
        c = shift(mix(body_wet, wet_sky(W, tsky), lerp(share[0], share[1], tt)), dL=dl + r.normal(0, 2))
        xa = r.uniform(-0.3, 0.6) * Wd
        chisel(L, nz, r, xa, xa + r.uniform(0.3, 0.9) * Wd, y, hh, c, op=r.uniform(0.35, 0.6), soft=0.45 * hh,
               dry=0.3, bdepth=0.06, cj=0.006, rag=1.0)
    L.blur(blur).onto(cv, mask)
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


def rock(cv, xx, yy, cx, by, rx, ry, colour, W, light=(-0.72, -0.42, 0.55), rng=None):
    """A designed rock (flat shapes, no outline): an organic rounded mass standing on its base line by,
    shaded as a dome by the low sun on the left and quantised into FLAT tones (the posters' 2-3 values):
    a lit face (+11 L*, warmed 25 % toward the low sky), a mid face, a shade face (-3 L*, a cooler turn)
    and a core shadow (-8 L*) along the terminator, which therefore curves with the form. The lit edge
    is crisp (0.6 px), the shade edge soft (1.4 px). Returns its mask."""
    cy = by - 0.55 * ry
    nx, ny = (xx - cx) / rx, (yy - cy) / ry
    ang = np.arctan2(ny, nx)
    wob = 0.05 * np.sin(ang * 3 + (0 if rng is None else rng.uniform(0, 6))) + \
        0.03 * np.sin(ang * 5 + (0 if rng is None else rng.uniform(0, 6)))
    r = (np.abs(nx) ** 2.3 + np.abs(ny) ** 2.1) ** (1 / 2.2) - wob
    inside = (r < 1) & (yy < by)
    rr = np.clip(r, 0, 1)
    nzc = np.sqrt(np.clip(1 - rr ** 2, 0, 1))                     # the dome's normal
    lv = np.array(light) / np.linalg.norm(light)
    dot = (nx * 0.9 * lv[0] + ny * 0.9 * lv[1] + nzc * lv[2]) / np.sqrt(0.81 * (nx ** 2 + ny ** 2) + nzc ** 2 + 1e-6)
    dot = ndi.gaussian_filter(dot, 2.0)
    lit = mix(shift(colour, dL=11), W['sky_low'], 0.25)
    mid = shift(colour, dL=3)
    shade = shift(colour, dL=-3, dh=8)
    core = shift(colour, dL=-8)
    col = np.where((dot > 0.62)[..., None], lit, np.where((dot > 0.38)[..., None], mid,
                   np.where((dot > 0.26)[..., None], core, shade)))
    col = ndi.gaussian_filter(col, (0.7, 0.7, 0))
    lit_side = dot > 0.38
    m = np.where(lit_side, ndi.gaussian_filter(inside.astype(np.float32), 0.6),
                 ndi.gaussian_filter(inside.astype(np.float32), 1.4))
    cv[:] = cv * (1 - m[..., None]) + col.astype(np.float32) * m[..., None]
    return m


def puddle(cv, region, W, seed, key, pud, body, sky_t=(0.62, 0.98), y_span=(190, 265)):
    """A puddle (or a beach pool): a crisp organic edge (0.6 px); inside, a sharper mirror of the HIGHER sky
    (lighter and cooler than the wet ground); a darker damp margin (6 px, blur 3, -6 L*, op 0.4); the far
    edge catches the low sky as a thin light line (1.5 px). No outline."""
    H, Wd = pud.shape
    yy = np.arange(H)[:, None]
    ring = np.clip(ndi.gaussian_filter(ndi.binary_dilation(pud > 0.5, iterations=6).astype(np.float32), 3) - pud, 0, 1)
    Layer(H, Wd).fill(shift(body, dL=-6), ring * 0.4).onto(cv, region)
    pt_ = np.clip((yy - y_span[0]) / max(1, y_span[1] - y_span[0]), 0, 1)
    pc = mix(wet_sky(W, lerp(sky_t[0], sky_t[1], pt_)), body, 0.12)
    pc = np.broadcast_to(pc, (H, 1, 3)) if pc.ndim == 2 else pc
    cv[:] = cv * (1 - pud[..., None]) + np.broadcast_to(pc, cv.shape).astype(np.float32) * pud[..., None]
    rim = np.clip(pud - np.roll(pud, 1, axis=0), 0, 1)
    Layer(H, Wd).fill(shift(wet_sky(W, 0.08), dL=1), rim * 0.4).onto(cv)


# ----------------------------------------------------------------------------------------------
# 7. Waves and foam on a shore: long sea bands, wave faces, foam of many thin marks, lace, swash
# ----------------------------------------------------------------------------------------------
def sea_bands(layer, nz, rng, W, mask, s_of, y0, y1, Wd, n=(5, 8)):
    """The sea between foam lines: a few long, straight, thin bands (2-5 px, 200 px to the full width),
    alternately the lower sky's light (+5..+7 L*) and the plum shade (-6..-8), crisp (0.8 px)."""
    for _ in range(int(rng.integers(*n))):
        y = rng.uniform(y0 + 2, y1 - 2)
        s = float(s_of(y))
        run = rng.uniform(200, Wd * 1.1)
        x = rng.uniform(-100, Wd - run + 100)
        light = rng.random() < 0.5
        col = mark_colour(W, s, rng.uniform(5, 7)) if light else \
            with_L(mix(W['w_plum'], base_of(W, s), 0.4), float(lab(base_of(W, s))[0]) - rng.uniform(6, 8))
        chisel(layer, nz, rng, x, x + run, y, rng.uniform(2.0, 5.0) * lerp(0.6, 1.0, float(np.clip(s, 0, 1))), col,
               op=rng.uniform(0.7, 0.85), soft=0.8, dry=0.3, bdepth=0.0, cj=0.004, rag=0.3, lens=0.25,
               slope=rng.normal(0, 0.0015))


def foam_line(cv, mask, W, nz, rng, curve, s, hmax, Wd, swell, warm_x=220.0, curls=0):
    """One foam line (a breaking wave) along curve(x):
    P1 the wave face: a soft darker band just under the foam (1.6 x hmax tall, -9 L*, blur 2 px);
    P2 the foam body: MASSES 30-160 px long with gaps (55-95 % covered where the swell breaks), each built
       of THIN flat marks (1.4-3 px) stacked densely (row pitch 0.8 x the mark) from a flat bottom up to a
       ragged, narrower top (a low mound); the sky-lit colour, never white: +9 L* over the sea far .. +15
       near, the bottom rows 3 L* darker (the foam's own shade); some rows split by a 2-6 px gap;
    P3 a crisp lit top on 70 % of the masses (+5 L* over the body), 1-3 curls in the nearest foam, a few
       lace dabs under it."""
    H = mask.shape[0]
    sea_L = float(lab(base_of(W, s))[0])
    dl_body = lerp(9.0, 15.0, s)
    face = Layer(H, Wd)
    x = -20.0
    while x < Wd:
        run = rng.uniform(80, 220)
        chisel(face, nz, rng, x, x + run, curve(x + run / 2) + 1.0 * hmax, hmax * 1.6,
               with_L(base_of(W, s + 0.25), sea_L - 9), op=0.6, soft=0.35 * hmax * 1.6, dry=0.2, bdepth=0.0,
               cj=0.0, rag=0.8)
        x += run * 0.9
    face.blur(2.0).onto(cv, mask)
    body, tops = Layer(H, Wd), Layer(H, Wd)
    n = 0
    x = rng.uniform(-30, 10)
    while x < Wd:
        seg = rng.uniform(30, 160) * lerp(0.6, 1.0, s)
        sw_ = float(swell[int(np.clip(x + seg / 2 + 200, 0, len(swell) - 1))])
        if rng.random() < 0.55 + 0.4 * sw_:
            depth = hmax * lerp(0.5, 1.2, sw_)
            yb_ = curve(x + seg / 2) + 0.5 * depth            # the flat bottom
            warm = float(smooth((warm_x - x) / warm_x)) * 0.35  # the sun's side (left) a touch warmer
            base_c = mix(W['f_light'], W['sky_low'], warm)
            mh = rng.uniform(1.4, 3.0) * lerp(0.75, 1.0, s)
            rows = max(2, int(np.ceil(depth / (0.8 * mh))))
            for j in range(rows):                             # j = 0 is the bottom row
                frac = j / max(1, rows - 1)
                inset = seg * 0.5 * frac ** 1.5 * rng.uniform(0.3, 1.0)
                xa_ = x + inset * rng.uniform(0.3, 1.0)
                xb_ = x + seg - inset * rng.uniform(0.3, 1.0)
                if xb_ - xa_ < 4:
                    continue
                c = with_L(base_c, min(sea_L + dl_body + lerp(-3.0, 1.5, frac), 90.0))
                parts = [(xa_, xb_)]
                if rng.random() < 0.3 and xb_ - xa_ > 30:
                    xm = rng.uniform(xa_ + 0.3 * (xb_ - xa_), xa_ + 0.7 * (xb_ - xa_))
                    gp = rng.uniform(2, 6)
                    parts = [(xa_, xm - gp / 2), (xm + gp / 2, xb_)]
                for (pa, pb) in parts:
                    chisel(body, nz, rng, pa, pb, yb_ - j * 0.8 * mh, mh, c, op=0.95, soft=0.7, dry=0.35, bdepth=0.08,
                           cj=0.008, t1=0.3, thin_end=0.4, rag=0.5, pressure=0.15)
                    n += 1
            ytop = yb_ - (rows - 1) * 0.8 * mh - 0.5 * mh
            if rng.random() < 0.7:                            # the lit top: thin, crisp, broken
                chisel(tops, nz, rng, x + 0.15 * seg, x + 0.8 * seg, ytop + 0.4, rng.uniform(1.0, 1.6),
                       with_L(mix(W['f_top'], W['sky_horizon'], warm), min(sea_L + dl_body + 5, 92.0)),
                       op=0.95, soft=0.55, dry=0.5, bdepth=0.0, cj=0.0, rag=0.3)
                n += 1
            for _ in range(curls if sw_ > 0.5 else 0):        # curls: short arcs inside the nearest foam
                cx_ = rng.uniform(x + 0.15 * seg, x + 0.85 * seg)
                th = np.linspace(rng.uniform(0.2, 0.6) * np.pi, rng.uniform(1.2, 1.6) * np.pi, 9)
                rr = rng.uniform(3, 6)
                pts = [(cx_ + rr * np.cos(t_), ytop + 0.5 * depth + 0.8 * rr * np.sin(t_)) for t_ in th]
                for (p0, p1) in zip(pts[:-1], pts[1:]):
                    if abs(p1[0] - p0[0]) > 0.5:
                        chisel(tops, nz, rng, p0[0], p1[0], p0[1], 1.2,
                               with_L(base_c, min(sea_L + dl_body + 4, 90.0)), op=0.8, soft=0.6, dry=0.0,
                               bdepth=0.0, cj=0.0, rag=0.0, slope=(p1[1] - p0[1]) / (p1[0] - p0[0]), pressure=0.0)
            for _ in range(int(rng.integers(1, 5))):          # lace dabs under the foam
                lx = rng.uniform(x, x + seg)
                chisel(body, nz, rng, lx, lx + rng.uniform(3, 9), yb_ + rng.uniform(2, 0.8 * depth + 3),
                       rng.uniform(1.0, 2.0), with_L(base_c, min(sea_L + 0.6 * dl_body, 90.0)), op=0.6, soft=0.7,
                       dry=0.3, bdepth=0.0, cj=0.0, rag=0.3)
        x += seg * rng.uniform(1.04, 1.3)
    body.blur(0.4).onto(cv, mask)
    tops.onto(cv, mask)
    return n


def swash(layer, nz, rng, W, y0, Wd, rows=3, spacing=22, colour=None):
    """The swash on the wet sand: 2-3 thin lacy lines (1.0-1.7 px, 40-150 px segments, 70 % covered), wavy,
    fading toward us (op 0.65 -> 0.37); the sky's low light."""
    for j in range(rows):
        yj = y0 + spacing * j
        x = rng.uniform(-40, 0)
        while x < Wd:
            run = rng.uniform(40, 150)
            if rng.random() < 0.7:
                chisel(layer, nz, rng, x, x + run, yj + 4 * np.sin((x + run / 2) / 45.0 + j), rng.uniform(1.0, 1.7),
                       shift(colour, dL=-3 * j), op=0.65 - 0.14 * j, soft=0.7, dry=0.5, bdepth=0.0, cj=0.0,
                       slope=rng.normal(0, 0.03), rag=0.4)
            x += run * rng.uniform(1.1, 1.6)


# ----------------------------------------------------------------------------------------------
# 8. The elements
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


def dusk_sky(W, H, Wd, yh, stops=None):
    t = np.clip(np.arange(H) / max(1, yh), 0, 1)
    stops = stops or [(0, W['sky_band']), (0.62, W['sky_low']), (1, W['sky_horizon'])]
    sky = grad(stops, t).astype(np.float32)
    return np.broadcast_to(sky[:, None, :], (H, Wd, 3)).copy(), sky


def e1_mirror(seed, W):
    """E1 calm water mirroring the dusk sky (a harbour: a low far city on the left, open water right)."""
    Wd, H, yh = 1080, 460, 170
    g = lambda *k: rng_for(seed, 'e1', *k)
    nz = Noise(g('noise'))
    cv, sky = dusk_sky(W, H, Wd, yh)
    skym = np.zeros((H, Wd), np.float32)
    skym[:yh] = 1
    sl = Layer(H, Wd)                                   # three soft cloud streaks (they will be mirrored)
    mirrors = []
    for i, (xa, xb, y, hh) in enumerate([(-60, 560, 52, 18), (430, 1140, 98, 24), (150, 700, 136, 10)]):
        col = mix(W['cloud_shade'], sky[y], 0.42)
        chisel(sl, nz, g('sky', i), xa, xb, y, hh, col, op=0.62, soft=0.4 * hh, dry=0.25, bdepth=0.08,
               cj=0.01, thin_end=0.6, t1=0.35)
        chisel(sl, nz, g('sky', i, 'lit'), xa + 30, xb - 60, y - 0.42 * hh, 2.2,
               mix(W['sky_horizon'], np.ones(3), 0.3), op=0.55, soft=0.9, dry=0.45, bdepth=0.0, cj=0.0)
        d = yh - y                                       # its reflection: as far below the line, a little shorter
        mirrors.append((xa + 10, xb - 10, yh + 0.9 * d, hh * 0.85,
                        shift(reflect(col, base_of(W, 0.2)), dL=-4 - 10 * d / yh), 0.5))
    sl.blur(2.2).onto(cv, skym)
    rq = g('city')                                      # the far city (left), hazy, a few tiny lit windows
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
    stats, _ = water_body(cv, water, W, seed, 'e1w', yh, H, (0.0, 0.75), mirrors=mirrors, accents=4,
                          line=(650, Wd, yh + 1.6, W['w_line']))
    rm, ok = mirror_rows(city[..., None], yh, H)        # the far city's reflection: a whole soft dark mass
    rm = ndi.gaussian_filter(rm[..., 0] * ok, (1.6, 0.8))
    Layer(H, Wd).fill(reflect(haze, base_of(W, 0.05), dL=-7), rm * 0.88).onto(cv)
    for (x, y) in wins:                                 # tiny lit windows: short soft streaks straight below
        dy = yh - y
        L = Layer(H, Wd)
        L.a[yh + dy - 1:yh + dy + int(rq.uniform(6, 13)), x:x + 2] = 0.8
        L.rgb[:] = reflect(W['window'], base_of(W, 0.05)) * L.a[..., None]
        L.blur((1.6, 0.4)).onto(cv)
    r = g('breaks')                                     # two thin sky lines break the city's reflection
    br = Layer(H, Wd)
    for y in (yh + 7, yh + 14):
        x = r.uniform(-40, 100)
        while x < 650:
            run = r.uniform(40, 180)
            chisel(br, nz, r, x, x + run, y + r.normal(0, 0.4), 1.3, mark_colour(W, 0.05, 6), op=0.75, soft=0.7,
                   dry=0.4, bdepth=0.0, cj=0.0, lens=0.3)
            x += run * r.uniform(1.3, 2.2)
    br.onto(cv, water)
    return cv, stats


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
    src[46:114, 150:236] = W['dark_window']
    src[40:44, 30:500] = shift(W['facade_cream'], dL=-8)
    src[150:170] = W['paving']                       # the quay's top
    src[170:yw] = shift(W['stone'], dL=4)            # the quay's face
    mir = src.copy()                                 # the mirror's source: the lights become wall (they are
    for (xa, xb, ya, yb, c) in lit:                  # painted as lights, never as slabs)
        src[ya:yb, xa:xb] = c
        mir[ya:yb, xa:xb] = W['facade_cream']
    cv[:yw] = src[:yw]
    water = np.zeros((H, Wd), np.float32)
    water[yw:] = 1
    stats, _ = water_body(cv, water, W, seed, 'e2w', yw, H, (0.55, 1.0), accents=2, far_n=None,
                          dose=dict(mid=0.8, near=0.8))
    face = yw - 170
    s_of = lambda y: lerp(0.55, 1.0, np.clip((y - yw) / (H - yw), 0, 1))
    tgt, ok = mirror_rows_split(mir, yw, H, face, 150, 26)
    srow = s_of(np.arange(H))
    tgt = simplify(tgt, ok, W, srow, size=(5, 13))
    wcol = base_of(W, srow)[:, None, :]
    tgt = reflect(tgt, wcol, dL=(-4 - 8 * srow)[:, None]).astype(np.float32)   # + Fresnel: darker toward us
    rr = rng_for(seed, 'e2', 'wob')
    d = np.arange(H) - yw
    amp = 0.5 + 2.0 * np.clip(d / 120, 0, 1)
    tgt = wobble_rows(tgt, rr, amp)
    ok = wobble_rows(ok[..., None], rr, amp)[..., 0]
    lights = [(xa, xb, yw + face + (150 - yb), 1.25 * (yb - ya), reflect(c, base_of(W, 0.7), k=0.15, dL=-3))
              for (xa, xb, ya, yb, c) in lit]
    n = reflection(cv, water, W, seed, 'e2r', tgt, ok, yw, s_of, lights, solid=0.6)
    cl = np.zeros((H, Wd), np.float32)                  # the contact line: the quay face meets the water
    cl[yw:yw + 2] = 0.55
    Layer(H, Wd).fill(shift(W['stone'], dL=-14), cl).onto(cv)
    stats['reflection'] = (n, 0)
    return cv, stats


def e3_glint(seed, W):
    """E3 the sun's glint column on calm water: a soft lift, then the amber bed, then a few slivers."""
    Wd, H, yw = 540, 420, 132
    g = lambda *k: rng_for(seed, 'e3', *k)
    cv, _ = dusk_sky(W, H, Wd, yw, [(0, W['sky_band']), (0.55, W['sky_low']), (1, W['sky_horizon'])])
    xc, D = 270.0, 96.0                                # the sun: 96 px across, as in the scene
    yy, xx = np.mgrid[0:H, 0:Wd]
    sun = smooth((D / 2 - np.hypot(xx - xc, yy - (yw - 14))) / 1.2 + 0.5)
    cv[:] = cv * (1 - sun[..., None]) + W['sun'] * sun[..., None]
    city, tone = far_city(g('city'), Wd, H, -10, Wd + 10, yw, 6, 22)
    haze = mix(W['haze'], W['sky_horizon'], 0.25)
    cv[:] = cv * (1 - city[..., None]) + rgb(lab(haze)[None, None] + np.stack([tone * 1.5, tone * 0.4, tone * 0.4], -1)
                                            ).astype(np.float32) * city[..., None]
    water = (yy >= yw).astype(np.float32)
    stats, _ = water_body(cv, water, W, seed, 'e3w', yw, H, (0.0, 0.8), accents=2, dose=dict(far=0.8, mid=0.7, near=0.7))
    rm, ok = mirror_rows(city[..., None], yw, H)
    Layer(H, Wd).fill(reflect(haze, base_of(W, 0.05), dL=-7), ndi.gaussian_filter(rm[..., 0] * ok, (1.6, 0.8)) * 0.85
                      ).onto(cv)
    n = glint(cv, water, W, seed, 'e3g', xc, D, yw, H)
    stats['glint'] = (n, 0)
    return cv, stats


def ring_marks(layer, nz, rng, W, px, py, a0, s, n_rings=3, ratio=7.0, grow=1.6):
    """Rings round a floater or a post: flattened ellipses (1 : 7) broken into 7-10 dashes each; each dash a
    light line (the far-facing slope: lower sky) with, on the near arc, a dark partner under it."""
    n = 0
    for kk in range(n_rings):
        a = a0 * grow ** kk
        b = a / ratio
        for th0 in np.linspace(0, 2 * np.pi, int(rng.integers(7, 11)), endpoint=False):
            th = th0 + rng.uniform(0, 0.3)
            span = rng.uniform(0.35, 0.6)
            x0, x1 = px + a * np.cos(th), px + a * np.cos(th + span)
            y0, y1 = py + b * np.sin(th), py + b * np.sin(th + span)
            if abs(x1 - x0) < 6:
                continue
            near_arc = np.sin(th + span / 2) > 0
            op = [0.85, 0.6, 0.4][min(kk, 2)]
            chisel(layer, nz, rng, x0, x1, y0, (2.4 if near_arc else 1.6) * (1 - 0.15 * kk), mark_colour(W, s, 12),
                   op=op, slope=(y1 - y0) / (x1 - x0), soft=0.8, dry=0.35, bdepth=0.0, cj=0.0, rag=0.3, lens=0.4)
            n += 1
            if near_arc:
                chisel(layer, nz, rng, x0, x1, y0 + 2.2, 1.8 * (1 - 0.15 * kk), mark_colour(W, s, -10), op=op * 0.8,
                       slope=(y1 - y0) / (x1 - x0), soft=0.8, dry=0.35, bdepth=0.0, cj=0.0, rag=0.3, lens=0.4)
                n += 1
    return n


def e4_ripples(seed, W):
    """E4 near water: calm patches and windy patches of bold dashes; a post, its reflection and rings."""
    Wd, H = 1080, 300
    g = lambda *k: rng_for(seed, 'e4', *k)
    nz = Noise(g('noise'))
    cv = np.zeros((H, Wd, 3), np.float32)
    water = np.ones((H, Wd), np.float32)
    stats, _ = water_body(cv, water, W, seed, 'e4w', 0, H, (0.5, 1.05), accents=8, wind_cell=(40, 300),
                          far_n=None)
    px, pw, pt, pb = 760, 30, 40, 118                 # a mooring post standing in the water (our flat)
    yy, xx = np.mgrid[0:H, 0:Wd]
    post = ndi.gaussian_filter(((np.abs(xx - px) <= pw / 2) & (yy >= pt) & (yy < pb)).astype(np.float32), 0.6)
    post_c = shift(W['stone'], dL=-16)
    s_of = lambda y: lerp(0.5, 1.05, np.clip(y / H, 0, 1))
    # its reflection: the reflection rule (dark reflects a little lighter), one solid block then bars
    pc = reflect(post_c, base_of(W, 0.9), k=0.3, dL=2)
    tgt = np.broadcast_to(pc.astype(np.float32), (H, Wd, 3)).copy()
    cover = ((np.abs(xx - px) <= pw / 2) & (yy >= pb) & (yy < pb + (pb - pt))).astype(np.float32)
    rr = rng_for(seed, 'e4', 'wob')
    amp = 0.5 + 2.5 * np.clip((np.arange(H) - pb) / 80.0, 0, 1)
    cover = wobble_rows(cover[..., None], rr, amp)[..., 0]
    n = reflection(cv, water, W, seed, 'e4r', tgt, cover, np.full(Wd, float(pb)), s_of, (), solid=0.6)
    rings = Layer(H, Wd)
    n += ring_marks(rings, nz, g('rings'), W, px, pb - 1, 40, 0.75)
    rings.blur(0.35).onto(cv)
    lensm = ndi.gaussian_filter(((((xx - px) / (pw * 0.75)) ** 2 + ((yy - pb) / 2.6) ** 2) < 1).astype(np.float32), 0.6)
    Layer(H, Wd).fill(mark_colour(W, 0.8, -14), lensm * 0.8).onto(cv)   # the contact lens: a thin dark ellipse
    pcol = np.where((xx < px - 4)[..., None], shift(post_c, dL=12), post_c).astype(np.float32)
    cv[:] = cv * (1 - post[..., None]) + pcol * post[..., None]
    stats['post'] = (n, 0)
    return cv, stats


def e5_wet(seed, W):
    """E5 wet sand (left: the sea, its swash, wet sand mirroring the sky, rocks and a pool) and wet paving
    (right: slab joints, a puddle and a lamp), both mirroring the dusk sky."""
    Wd, H, half = 1080, 340, 540
    g = lambda *k: rng_for(seed, 'e5', *k)
    nz = Noise(g('noise'))
    cv = np.zeros((H, Wd, 3), np.float32)
    yy, xx = np.mgrid[0:H, 0:Wd]
    # --- wet sand (left half) ---------------------------------------------------------------------
    sea_y = 40
    left = (xx < half).astype(np.float32)
    edge = sea_y - 3 * np.sin(xx / 70.0)
    sand = ndi.gaussian_filter((yy >= edge).astype(np.float32), 0.6) * left
    body = W['sand_wet']
    wet_ground(cv, sand, W, seed, 'e5s', body, sea_y, H - 40, share=(0.8, 0.45), sky_t=(0.0, 0.85))
    water_body(cv, left * (1 - sand), W, seed, 'e5sea', 0, sea_y, (0.4, 0.7), accents=1, far_n=None, grain=False,
               dose=dict(mid=0.8, near=0.8))
    r = g('swash')
    sw = Layer(H, Wd)                                   # the swash: the sea's last thin sheet, a lacy light edge
    x = -30
    while x < half:
        run = r.uniform(40, 160)
        if r.random() < 0.75:
            chisel(sw, nz, r, x, x + run, sea_y + 1.5 - 3 * np.sin((x + run / 2) / 70.0), r.uniform(1.6, 2.6),
                   with_L(W['f_light'], 86), op=0.85, soft=0.7, dry=0.5, bdepth=0.0, cj=0.0, rag=0.6)
        x += run * r.uniform(1.05, 1.4)
    swash(sw, nz, r, W, sea_y + 18, half, rows=2, spacing=20, colour=shift(wet_sky(W, 0.05), dL=-4))
    sw.onto(cv, left)
    # the pool: crisp, it mirrors the higher sky (lighter than the wet sand)
    env = np.exp(-0.5 * (((xx - 120) / 70.0) ** 2 + ((yy - 252) / 13.0) ** 2))
    pool = (field(g('pool'), H, Wd, 18, 60) * 0.5 + env > 0.75).astype(np.float32) * left
    pool = ndi.gaussian_filter(ndi.binary_opening(pool > 0.5, iterations=2).astype(np.float32), 0.6)
    puddle(cv, left, W, seed, 'e5pool', pool, body, sky_t=(0.55, 0.9), y_span=(235, 270))
    # rocks (our flat: lit face toward the sun, shade face, no outline) and their reflections
    stone = shift(W['stone'], dL=-4)
    rr = g('rocks')
    for (bx, by, brx, bry) in [(300, 186, 78, 50), (420, 170, 26, 16), (200, 300, 40, 22)]:
        rshape = (((np.abs(xx - bx) / brx) ** 2.3 + (np.abs(yy - (by - 0.55 * bry)) / bry) ** 2.1) < 1) & (yy < by)
        reflect_shape(cv, left, rshape.astype(np.float32), by, reflect(stone, body, k=0.2, dL=2), 0.55)
        Layer(H, Wd).fill(shift(stone, dL=-10), ndi.gaussian_filter(
            ((np.abs(xx - bx) < brx * 0.85) & (np.abs(yy - by) < 1.6)).astype(np.float32), (0.6, 2)) * 0.6).onto(cv, left)
        rock(cv, xx, yy, bx, by, brx, bry, stone, W, rng=rr)
    r2 = g('edges')                                     # thin water-edge lines (light; a few dark), tapered
    L2 = Layer(H, Wd)
    for i in range(8):
        y = r2.uniform(sea_y + 30, H - 60)
        x0 = r2.uniform(-120, 360)
        tt = (y - sea_y) / (H - sea_y)
        c = shift(wet_sky(W, 0.05), dL=-4 - 8 * tt) if i < 5 else shift(body, dL=-6)
        chisel(L2, nz, r2, x0, x0 + r2.uniform(120, 380), y, r2.uniform(1.2, 2.0), c, op=0.7, soft=0.8, dry=0.5,
               bdepth=0.0, cj=0.0, slope=r2.normal(0, 0.01), bow=r2.normal(0, 2), lens=0.3, rag=0.4)
    L2.blur(0.5).onto(cv, sand)
    # the wet/dry edge near the bottom: crisp in places, wavy; the dry sand matte, lighter, speckled (near)
    wd = H - 40 + 6 * np.sin(xx / 61.0) + 3 * np.sin(xx / 19.0)
    soft_e = lerp(0.8, 3.5, field(g('wd'), H, Wd, 60, 120))
    dry_m = smooth((yy - wd) / (2 * soft_e) + 0.5) * left
    dry_c = W['sand_dry']
    cv[:] = cv * (1 - dry_m[..., None]) + dry_c * dry_m[..., None]
    gn = ndi.gaussian_filter(g('sandgrain').standard_normal((H, Wd)), 0.6)
    cv[:] = np.clip(cv * (1 + 0.014 * gn / (gn.std() + 1e-6) * dry_m)[..., None], 0, 1)
    sp = g('speck')
    for _ in range(80):
        x, y = int(sp.uniform(0, half - 2)), int(sp.uniform(H - 36, H))
        if dry_m[y, x] > 0.8:
            cv[y, x:x + 2] = shift(W['sand_dry'], dL=float(sp.choice([-14, 10])))
    # --- wet paving (right half) ------------------------------------------------------------------
    right = (xx >= half).astype(np.float32)
    pbody = W['paving_wet']
    wet_ground(cv, right, W, seed, 'e5p', pbody, 0, H, share=(0.5, 0.28), sky_t=(0.3, 1.0), blur=(10.0, 2.0),
               n_bands=22, dl=-2)
    J = Layer(H, Wd)                                    # slab joints in perspective: lost far, crisper near
    vp = (820.0, -1400.0)
    for xb_ in np.arange(half - 600, Wd + 700, 170):
        for y in range(0, H):
            x = vp[0] + (xb_ - vp[0]) * (y - vp[1]) / (H - vp[1])
            if half <= x < Wd - 1:
                J.a[y, int(x)] = lerp(0.1, 0.5, y / H)
    for yj in [30, 92, 170, 266]:
        J.a[yj:yj + 2, half:] = np.maximum(J.a[yj:yj + 2, half:], lerp(0.1, 0.5, yj / H))
    J.rgb[:] = shift(pbody, dL=-12) * J.a[..., None]
    J.blur(0.5).onto(cv, right)
    env = np.exp(-0.5 * (((xx - 730) / 150.0) ** 2 + ((yy - 236) / 28.0) ** 2))
    pud = (field(g('pud'), H, Wd, 22, 70) * 0.55 + env > 0.78).astype(np.float32) * right
    pud = ndi.gaussian_filter(ndi.binary_opening(pud > 0.5, iterations=2).astype(np.float32), 0.6)
    puddle(cv, right, W, seed, 'e5pud', pud, pbody)
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
    return cv, {}


def e6_foam(seed, W):
    """E6 gentle waves and foam lines on a shore: the horizon glow, the sea in long thin bands, three foam
    lines far -> near (finer and paler far), the swash and the wet sand mirroring the sky."""
    Wd, H, yh, shore = 1080, 300, 22, 150
    g = lambda *k: rng_for(seed, 'e6', *k)
    nz = Noise(g('noise'))
    cv, _ = dusk_sky(W, H, Wd, yh, [(0, W['sky_low']), (1, W['sky_horizon'])])
    yy, xx = np.mgrid[0:H, 0:Wd]
    sea = ((yy >= yh) & (yy < shore + 3 * np.sin(xx / 90.0 + 1))).astype(np.float32)
    sea = ndi.gaussian_filter(sea, 0.6)
    s_of = lambda y: lerp(0.15, 0.85, np.clip((y - yh) / (shore - yh), 0, 1))
    wet_ground(cv, (yy >= shore - 6).astype(np.float32) * (1 - sea), W, seed, 'e6s', W['sand_wet'], shore, H,
               share=(0.8, 0.5), sky_t=(0.0, 0.75))
    water_body(cv, sea, W, seed, 'e6sea', yh, shore, (0.15, 0.85), accents=0, far_n=None,
               dose=dict(far=0.3, mid=0.3, near=0.3), line=(-10, Wd + 10, yh + 1.2, W['w_line']))
    bands = Layer(H, Wd)
    sea_bands(bands, nz, g('bands'), W, sea, s_of, yh + 4, shore - 4, Wd)
    bands.blur(0.4).onto(cv, sea)
    r = g('foam')
    n = 0
    for i, (y0, hmax, curls) in enumerate([(46, 4.0, 0), (88, 7.0, 0), (shore - 10, 12.0, 2)]):
        s = float(s_of(y0))

        def curve(x, y0=y0, i=i, s=s):
            return y0 + 3.0 * s * np.sin(x / 90.0 + 1 + 0.4 * i) + 1.2 * np.sin(x / 31.0 + i)
        swell = field(rng_for(seed, 'e6', 'swell', i), 1, Wd + 400, 1, 70)[0]
        n += foam_line(cv, sea, W, nz, r, curve, s, hmax, Wd, swell, curls=curls)
    sw = Layer(H, Wd)
    swash(sw, nz, r, W, shore + 16, Wd, rows=3, spacing=24, colour=with_L(W['f_light'], 82))
    sw.blur(0.5).onto(cv, 1 - sea)
    wd = H - 26 + 5 * np.sin(xx / 70.0) + 2 * np.sin(xx / 23.0)   # the wet/dry edge, the dry sand matte
    dry_m = smooth((yy - wd) / 3.0 + 0.5)
    cv[:] = cv * (1 - dry_m[..., None]) + W['sand_dry'] * dry_m[..., None]
    return cv, {'foam': (n, 0)}


def e7_canal(seed, W):
    """E7 the recipe on the v4 canal: the design above the water is mirrored into the canal (the bridge,
    the far city, the building's lit door, the quay), the water body painted around it, the sun's glint
    (sparse: the canal lies far below the horizon), the boats' and the duck's reflections, rings round
    the duck; the objects in the water and everything outside it stay our crisp flat."""
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
    stats, _ = water_body(cv, water, W, seed, 'e7w', 40, H, (0.55, 0.95), accents=4, far_n=None,
                          dose=dict(mid=0.6, near=0.6))
    # the reflection target: the design above the waterline, mirrored about it (per column); rows 0-6
    # below the line show the quay's lip/face (a darker stone band), then the scene above the quay's top
    face = 7
    dd = np.arange(H)[:, None] - yw[None, :]
    face_rows = (dd >= 0) & (dd < face)
    src = des.copy()
    door = (545, 712, 850, 1062)                       # the lit doorway: painted as a light, never a slab
    ring = np.concatenate([des[door[2]:door[3], door[0] - 14:door[0] - 4].reshape(-1, 3),
                           des[door[2]:door[3], door[1] + 4:door[1] + 14].reshape(-1, 3)])
    src[door[2]:door[3], door[0]:door[1]] = np.median(ring, 0)
    ys = np.round(yw[None, :] + y0 - 10 - (dd - face)).astype(int)       # skip the quay's top strip (~10 px)
    scene_rows = (dd >= face) & (ys >= 600)
    tgt = src[np.clip(ys, 0, src.shape[0] - 1), xs[None, :]].astype(np.float32)
    tgt[face_rows] = shift(W['stone'], dL=6)
    cover = (face_rows | scene_rows).astype(np.float32)
    srow = s_of(np.arange(H))
    tgt = simplify(tgt, cover, W, srow, size=(7, 21))
    wcol = base_of(W, srow)[:, None, :]
    tgt = reflect(tgt, wcol, k=0.3, dL=(-4 - 8 * srow)[:, None]).astype(np.float32)   # + Fresnel
    rr = rng_for(seed, 'e7', 'wob')
    d = np.arange(H) - 75
    amp = 0.5 + 2.2 * np.clip(d / 120, 0, 1)
    tgt = wobble_rows(tgt, rr, amp)
    cover = wobble_rows(cover[..., None], rr, amp)[..., 0]
    # the boats and the duck: mirrored about their own bottoms (one dark solid shape each)
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
    xa, xb, ya, yb = door
    y_top_ref = 1111 - y0 + face + 10 - 1                 # the doorway's foot, mirrored just under the quay face
    lights.append((xa + 15, xb - 15, y_top_ref, 0.75 * (yb - ya), reflect(W['door'], wcol[int(y_top_ref), 0], k=0.15,
                                                                          dL=-3)))
    n = reflection(cv, water * (1 - objf), W, seed, 'e7r', tgt, cover, yw, s_of, lights, solid=0.6)
    n += glint(cv, water * (1 - objf), W, seed, 'e7g', 195.0, 96.0, int(yw[195]) + 1, int(yn[195]), strength=0.5,
               slivers=(2, 4))
    nz = Noise(rng_for(seed, 'e7', 'noise'))
    rings = Layer(H, Wd)
    n += ring_marks(rings, nz, rng_for(seed, 'e7', 'rings'), W, 400, 1137 - y0, 46, 0.75, ratio=7.0, grow=1.5)
    rings.blur(0.35).onto(cv, water * (1 - objf))
    cl = np.clip(1 - np.abs(yy - yw[None, :] - 0.8) / 1.2, 0, 1) * (water > 0)   # the contact line under the quay
    cv[:] = cv * (1 - 0.5 * cl[..., None]) + shift(W['stone'], dL=-12) * 0.5 * cl[..., None]
    cv[:] = cv * (1 - objf[..., None]) + band * objf[..., None]          # the objects stay our crisp flat
    stats['reflection'] = (n, 0)
    return cv, stats


# ----------------------------------------------------------------------------------------------
# 9. The sheet: each element beside the reference crop(s) that show it; the phone check; metrics
# ----------------------------------------------------------------------------------------------
REFS = {  # [(file, box, the frame's width in the file, note), ...]
    'e1': [('refs_human_scale/03_beach_dusk.jpg', (0, 330, 1206, 627), 1206,
            '03 beach dusk: a thin bright horizon line, the sea a clear step darker, calm between few bold lines')],
    'e2': [('poster_refs/07_kyoto.jpg', (600, 930, 1206, 1420), 1206,
            '07 Kyoto: the reflection a solid mirror, darker and duller, cut by thin light lines')],
    'e3': [('refs_human_scale/03_beach_dusk.jpg', (100, 380, 703, 627), 1206,
            '03 beach dusk: under the low sun a SOFT warm column (+10 L*), running on across the wet sand')],
    'e4': [('refs_paint/02_lighthouse_process.jpg', (222, 1640, 1162, 1815), 940,
            '02 lighthouse: flat opaque dashes in 2-3 values on a calm base; whole patches left calm')],
    'e5': [('refs_paint/01_beach_van_dusk.jpg', (22, 290, 1183, 405), 1161,
            '01 van: wet sand mirrors the pink sky in soft bands, lighter than the sea; rocks reflect short'),
           ('refs_human_scale/02_bus_stop_night.jpg', (300, 500, 1100, 609), 1206,
            '02 bus stop: wet paving, the light a soft vertical smear')],
    'e6': [('refs_human_scale/03_beach_dusk.jpg', (0, 425, 1206, 560), 1206,
            '03 beach dusk: long thin sea bands, foam of many thin sky-lit marks, a crisp top, a wave face'),
           ('refs_paint/01_beach_van_dusk.jpg', (700, 250, 1185, 345), 1161,
            '01 van: thin light foam lines, the swash, the wet sand')],
}
TITLES = {
    'e1': '1  Calm water mirroring the dusk sky',
    'e2': '2  Reflections of lit windows (a facade on a quay)',
    'e3': '3  The sun\'s glint column',
    'e4': '4  Small ripples and horizontal dashes (+ a post, its reflection and rings)',
    'e5': '5  Wet sand with rocks and a pool (left), wet paving with a puddle and a lamp (right)',
    'e6': '6  Gentle waves and foam lines on a shore',
    'e7': '7  Together: the King\'s Cross canal (the v4 layout, its water repainted by the recipe)',
}
NOTES = {
    'e1': 'P0 ladder + mirrored cloud bands, P1 soft wash, P2 few bold marks by plane (calm patches stay), P3 line',
    'e2': 'solid mirror block (60 %) then level bars; sky breaks across it; each light a block + 3 slivers',
    'e3': 'a soft screened lift (FWHM 1.1 -> 2 x the sun), an amber lens per band, 4-6 gold-white slivers',
    'e4': 'calm base, coverage-driven dashes (+11..16 / -10..14 L*), pairs, 8 accents; post: block + bars + rings',
    'e5': 'wet = darker ground + the sky (80 -> 45 %), sky bands smeared along; rocks short; pool and puddle crisp',
    'e6': 'long thin sea bands, wave faces, foam of thin stacked marks with crisp lit tops, curls, lace, swash',
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


def ref_crops(key):
    if key == 'e7':
        return [(Image.open(V4 / 'paint_still_v4.png').convert('RGB').crop((0, 1030, 1080, 1310)), 1080,
                 'our v4 still: the flat mint canal (before)')]
    return [(Image.open(LOOK / f).convert('RGB').crop(box), fw, note) for (f, box, fw, note) in REFS[key]]


def sheet(swatches, out, width=1600, cell=780, gap=20, margin=10):
    """Left: the reference crop(s) at the cell width; right: ours at the cell width. Each pair shows the same
    share of its frame's width when the crop spans its frame (the full-width crops do)."""
    f1, f2, f3 = font(22, True), font(15), font(13)
    rows = []
    for key in ['e1', 'e2', 'e3', 'e4', 'e5', 'e6', 'e7']:
        if key not in swatches:
            continue
        refs = []
        for (ref, fw, rnote) in ref_crops(key):
            refs.append((ref.resize((cell, max(1, round(ref.height * cell / ref.width))), Image.LANCZOS), rnote))
        ours = swatches[key]
        oa = to_img(ours).resize((cell, round(ours.shape[0] * cell / ours.shape[1])), Image.LANCZOS)
        rows.append((key, refs, oa))
    hdr = 70
    def rh(refs, oa):
        return max(sum(r.height + 22 for r, _ in refs), oa.height + 22)
    total = margin + hdr + sum(48 + rh(refs, oa) + gap for _, refs, oa in rows) + margin
    S = Image.new('RGB', (width, total), (246, 243, 240))
    d = ImageDraw.Draw(S)
    d.text((margin + 4, margin), 'Water and reflections: the recipe, painted. Left: the reference crop. Right: our '
                                 'recipe, in the King\'s Cross dusk light', fill=(40, 36, 44), font=f1)
    d.text((margin + 4, margin + 34), 'Code: video/scripts/look/paint/recipes/water.py (seeded). Recipe: '
                                      'video/docs/look/paint_recipes/water.md. Never traced: the crops sit beside.',
           fill=(90, 86, 96), font=f2)
    y = margin + hdr
    for key, refs, oa in rows:
        d.text((margin + 4, y + 8), TITLES[key], fill=(40, 36, 44), font=f1)
        y += 48
        yr = y
        for (ra, rnote) in refs:
            S.paste(ra, (margin, yr))
            d.text((margin + 2, yr + ra.height + 4), 'ref: ' + rnote, fill=(90, 86, 96), font=f3)
            yr += ra.height + 22
        S.paste(oa, (margin + cell + gap, y))
        d.text((margin + cell + gap + 2, y + oa.height + 4), 'ours: ' + NOTES[key], fill=(90, 86, 96), font=f3)
        y += rh(refs, oa) + gap
    S.save(out, optimize=True)
    return S


def phone_check(swatches, out):
    """Phone size: each frame's full width shown at 400 px; the ref crop(s) and ours at the same scale."""
    tiles = []
    for key in ['e1', 'e2', 'e3', 'e4', 'e5', 'e6', 'e7']:
        if key not in swatches:
            continue
        ref, fw, _ = ref_crops(key)[0]
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


METRIC_BOX = {  # the water area of each swatch, for the mark metric (x0, y0, x1, y1)
    'e1': (0, 175, 1080, 460), 'e2': (0, 180, 540, 400), 'e3': (0, 136, 540, 420), 'e4': (0, 0, 1080, 300),
    'e5': (0, 50, 540, 290), 'e6': (0, 24, 1080, 150), 'e7': (0, 120, 1080, 200),
}


def mark_metric(cv, box, thr=6.0):
    """The recipe's check (water.md section 1.1), as measured on the references: the share of the water
    covered by marks lighter / darker than a (9 x 41) median by > thr L*, and the calm share (|dL| < 2.5)."""
    x0, y0, x1, y1 = box
    Lc = lab(cv[y0:y1, x0:x1])[..., 0]
    d = Lc - ndi.median_filter(Lc, size=(9, 41))
    light = ndi.binary_opening(d > thr, structure=np.ones((1, 2)))
    dark = ndi.binary_opening(d < -thr, structure=np.ones((1, 2)))
    hp = Lc - ndi.gaussian_filter(Lc, 3)
    calm = np.abs(d) < 2.5
    return light.mean() * 100, dark.mean() * 100, calm.mean() * 100, float(hp[calm].std())


ELEMENTS = {'e1': e1_mirror, 'e2': e2_windows, 'e3': e3_glint, 'e4': e4_ripples, 'e5': e5_wet, 'e6': e6_foam,
            'e7': e7_canal}


def main():
    ap = argparse.ArgumentParser(description=__doc__.split('\n\n')[0])
    ap.add_argument('--seed', type=int, default=1029)
    ap.add_argument('--out', type=Path, default=OUT)
    ap.add_argument('--scratch', type=Path, default=None)
    ap.add_argument('--metrics', action='store_true', help='print the mark metric of each swatch')
    ap.add_argument('--only', default='e1,e2,e3,e4,e5,e6,e7', help='comma list of e1..e7')
    a = ap.parse_args()
    W = water_palette(KX_LIGHT)
    sw = {}
    for k in a.only.split(','):
        sw[k], stats = ELEMENTS[k](a.seed, W)
        line = '%s %s' % (k, sw[k].shape[:2])
        for name, (n, cov) in (stats or {}).items():
            line += '  %s: %d strokes%s' % (name, n, (' (%.1f %%)' % (cov * 100)) if cov else '')
        if a.metrics and k in METRIC_BOX:
            li, dk, calm, hp = mark_metric(sw[k], METRIC_BOX[k])
            line += '  | marks light %.1f %% dark %.1f %% calm %.0f %% tooth %.2f' % (li, dk, calm, hp)
        print(line, flush=True)
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
