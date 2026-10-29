#!/usr/bin/env python3
"""Painted-piece recipe proof: buildings, ground and far city.

Paints the family's five elements at film scale (px of the 1080 x 1920 frame) in the October canal evening light
(a low sun on the left, at frame (196, 779)) and lays each one beside the reference crops that show it:
  1 far    the far city as layered atmospheric haze (4 planes, each paler and softer),
  2 facade a painted corner facade: a sunlit side face, a shade front, windows as value shapes, weathering,
  3 brick  brick and stone surfaces up close (stock brick in sun and in shade, a stone cornice, chipped render),
  4 paving paving receding in perspective (a texture gradient, the low sun's sheen, long shadows toward us),
  5 rocks  smooth boulders and faceted rocks.
The recipe is video/docs/look/paint_recipes/built_ground.md. Standalone: numpy, PIL, scipy, skimage. Seeded: the same
seed gives the same bytes.

  python3 video/scripts/look/paint/recipes/built_ground.py [--out PATH] [--only NAME] [--seed N] [--check]
                                                           [--passes N] [--phone PATH]

The method, for every element: DESIGN the flat shapes in a limited palette lit by one light (P0), then BRUSH them in
passes, each blurred less than the one before: P1 big soft strokes (blurred 6-12 px), P2 blocky flat-brush strokes
placed where the form turns or the weather runs (blurred 0.5 px), P3 a few crisp light accents, P4 weathering and
speckle on near pieces only; then convert the plane for its depth (toward the air, less chroma, a little softer).
"""
import argparse
import hashlib
import os
import sys
import time

import numpy as np
from PIL import Image, ImageDraw, ImageFont
from scipy import ndimage as ndi
from skimage import color as skcolor

SEED = 20261029
HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, '..', '..', '..', '..', '..'))
LOOK = os.path.join(REPO, 'video', 'docs', 'look')
OUT_DEFAULT = os.path.join(LOOK, 'paint_recipes', 'built_ground_swatch.png')

# ----------------------------------------------------------------------------------------------------------------
# 1. Colour: sRGB <-> OKLab, mixes, the limited palette
# ----------------------------------------------------------------------------------------------------------------
_M1 = np.array([[0.4122214708, 0.5363325363, 0.0514459929],
                [0.2119034982, 0.6806995451, 0.1073969566],
                [0.0883024619, 0.2817188376, 0.6299787005]])
_M2 = np.array([[0.2104542553, 0.7936177850, -0.0040720468],
                [1.9779984951, -2.4285922050, 0.4505937099],
                [0.0259040371, 0.7827717662, -0.8086757660]])
_M1i = np.linalg.inv(_M1)
_M2i = np.linalg.inv(_M2)


def hex2rgb(h):
    h = h.lstrip('#')
    return np.array([int(h[i:i + 2], 16) for i in (0, 2, 4)], np.float64) / 255.0


def rgb2hex(c):
    c = np.clip(np.asarray(c, np.float64), 0, 1)
    return '#%02x%02x%02x' % tuple(int(round(v * 255)) for v in c)


def _to_lin(c):
    c = np.asarray(c, np.float64)
    return np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)


def _to_srgb(c):
    c = np.clip(c, 0.0, 1.0)
    return np.where(c <= 0.0031308, c * 12.92, 1.055 * np.power(c, 1 / 2.4) - 0.055)


def rgb2ok(rgb):
    lms = _to_lin(rgb) @ _M1.T
    return np.cbrt(lms) @ _M2.T


def ok2rgb(ok):
    lms = (np.asarray(ok, np.float64) @ _M2i.T) ** 3
    return _to_srgb(lms @ _M1i.T)


def mix(c1, c2, t):
    """Mix two sRGB colours in OKLab (a painter's mix that keeps lightness honest)."""
    return ok2rgb(rgb2ok(c1) * (1.0 - t) + rgb2ok(c2) * t)


def shift(c, dl=0.0, da=0.0, db=0.0):
    """Shift a colour in OKLab: dl in OKLab L units (0.01 ~ 1 L*)."""
    o = rgb2ok(c)
    return ok2rgb(o + np.array([dl, da, db]))


def jitter(c, rng, dl=0.006, dab=0.003):
    """A per-stroke colour wobble: the same swatch never lands twice exactly the same."""
    return shift(c, rng.normal(0, dl), rng.normal(0, dab), rng.normal(0, dab))


def lighter(c, t=0.12, toward='glow'):
    """One value step up = toward the light's colour (warmer), never toward white."""
    return mix(c, PAL[toward], t)


def darker(c, t=0.12, toward='plum'):
    """One value step down = toward the shade family (cooler), never toward black or grey."""
    return mix(c, PAL[toward], t)


def lab_of(c):
    return skcolor.rgb2lab(np.asarray(c, np.float64).reshape(1, 1, 3))[0, 0]


# The family palette for the dusk scene (an October canal evening, a low sun on the left). 14 swatches, set by CIELAB
# targets in three hue families (gamut mask: peach-gold 45-80, rose 10-45, lilac-violet 295-320), the same families as
# the sky recipe. Every stroke takes one, or an OKLab mix of two of them.
PAL_HEX = dict(
    glow='#ffdfbe',        # L91 C21 h73  sun warmth: lit arrises, slivers, the brightest light on a surface
    air='#f3d6c3',         # L88 C15 h61  the horizon air = the far-plane target (the sky family's 'horizon')
    cream='#e9d7c0',       # L87 C14 h80  stone facing up or toward the sun: sills, coping, cornice tops
    sand='#dfc1aa',        # L80 C17 h64  paving and stone in the sun, near
    ochre='#d1a67b',       # L71 C30 h70  stock brick in the sun
    granite='#b8a196',     # L68 C11 h52  warm grey: paving mid, stone and rock half-light
    terracotta='#b67e6b',  # L58 C27 h45  brick in half-light; warm ground bounce
    lilac='#a49db4',       # L66 C13 h302 sky-lit shadow on pale ground and stone (cast shadows)
    mauve='#916e73',       # L50 C15 h10  brick in shade; the far city's nearest plane
    slate='#6d6b7f',       # L46 C12 h295 rock shade, joints, the shade side of stone
    plum='#56465b',        # L32 C15 h318 deep shade: under cornices, reveals, rock bodies
    ink='#2d2a3b',         # L18 C12 h300 the darkest: glass in shade, contact shadows
    lamp='#faca7e',        # L84 C45 h80  lit windows (warm interiors at dusk)
    skyglass='#9893ab',    # L62 C14 h300 glass reflecting the sky (the upper part of a pane)
)
PAL = {k: hex2rgb(v) for k, v in PAL_HEX.items()}
# The sky family's dusk stops, used only as the backdrop the far city converges on (sky_clouds.md section 2.1).
SKY_HEX = dict(zenith='#c7c6e6', field='#d3c8dd', rose='#e6ccd7', band='#eddcd6', horizon='#f3d6c3',
               glow='#ffdfbe', sun='#fff0db')
SKY = {k: hex2rgb(v) for k, v in SKY_HEX.items()}

# The light table (recipe section 3.2): which palette mix a face takes, by the way it faces the low sun on the left.
# Each entry: (palette mix, why). A face's local colour then shifts its hue (brick warmer, stone paler).
LIGHT = dict(
    sun_face='faces the sun (left): direct low sun, the lightest vertical value, warm',
    top_face='faces up (sills, copings, paving, rock tops): the sky dome + a grazing sun, light and neutral',
    front_face='faces us, away from the sun: sky light from behind us (lilac) + warm bounce low, the shade family',
    back_face='faces right, away from the sun: the deepest vertical value, cool',
    soffit='faces down (cornice undersides, lintels, arch heads): the darkest, a little warm bounce',
    sliver='an edge or reveal that faces the sun on a shaded face: a 1.5-3 px line of glow',
)

# ----------------------------------------------------------------------------------------------------------------
# 2. Determinism, noise, masks, placement
# ----------------------------------------------------------------------------------------------------------------


def rng_for(name, seed=None):
    """One generator per piece: a stable hash of (seed, piece name). Same seed -> same painting."""
    s = SEED if seed is None else seed
    h = int.from_bytes(hashlib.sha256(('%d:%s' % (s, name)).encode()).digest()[:8], 'little')
    return np.random.default_rng(h)


def smooth(x):
    x = np.clip(x, 0.0, 1.0)
    return x * x * (3.0 - 2.0 * x)


def value_noise(h, w, cell, rng, aniso=1.0):
    """Smooth noise ~N(0,1): a random grid upsampled with cubic splines. cell = feature size in px (x); aniso scales y."""
    cy, cx = max(cell * aniso, 1.0), max(cell, 1.0)
    gh, gw = int(np.ceil(h / cy)) + 4, int(np.ceil(w / cx)) + 4
    g = rng.standard_normal((gh, gw))
    out = ndi.zoom(g, (cy, cx), order=3, mode='reflect')[:h, :w]
    out = out - out.mean()
    return (out / (out.std() + 1e-9)).astype(np.float32)


def bristle_tile(rng, n=512, across=0.7, along=14.0):
    """Anisotropic noise sampled in stroke coordinates: rows = across the stroke (fine), cols = along it (long)."""
    t = ndi.gaussian_filter(rng.random((n, n)), sigma=(across, along), mode='wrap')
    return ((t - t.mean()) / (t.std() + 1e-9)).astype(np.float32)


def poly_mask(h, w, polys, ss=4, ellipses=()):
    """Anti-aliased union of polygons (and ellipses [x0,y0,x1,y1]) as a float mask, by 4x supersampling."""
    im = Image.new('L', (w * ss, h * ss), 0)
    d = ImageDraw.Draw(im)
    for p in polys:
        d.polygon([(x * ss, y * ss) for x, y in p], fill=255)
    for e in ellipses:
        d.ellipse([e[0] * ss, e[1] * ss, e[2] * ss, e[3] * ss], fill=255)
    return np.asarray(im.resize((w, h), Image.BOX), np.float32) / 255.0


def rect(x0, y0, x1, y1):
    return [(x0, y0), (x1, y0), (x1, y1), (x0, y1)]


def inside_dist(mask):
    """Distance (px) from the mask's border, measured inside it (0 outside)."""
    return ndi.distance_transform_edt(mask > 0.5).astype(np.float32)


def sample_by(weight, n, rng):
    """n points (x, y) drawn with probability proportional to `weight`: where a recipe wants its strokes."""
    wsum = float(weight.sum())
    if n <= 0 or wsum <= 0:
        return np.zeros(0), np.zeros(0)
    p = (weight / wsum).ravel().astype(np.float64)
    p /= p.sum()
    idx = rng.choice(weight.size, n, p=p)
    ys, xs = np.unravel_index(idx, weight.shape)
    return xs + rng.uniform(0, 1, n), ys + rng.uniform(0, 1, n)


def below_map(mask, length, step=2):
    """A weight that runs DOWN from a feature for `length` px and fades: where rain stains and soot start."""
    out = np.zeros_like(mask, dtype=np.float32)
    for k in range(step, int(length) + 1, step):
        sh = np.zeros_like(out)
        sh[k:] = mask[:-k]
        out = np.maximum(out, sh * (1.0 - k / float(length + 1)))
    return out * (1.0 - np.clip(mask, 0, 1))


# ----------------------------------------------------------------------------------------------------------------
# 3. Layers and the brush
# ----------------------------------------------------------------------------------------------------------------


class Layer:
    """Premultiplied RGBA float layer. Each pass paints on its own layer, is blurred by its sigma, then composited."""

    def __init__(self, h, w):
        self.h, self.w = h, w
        self.c = np.zeros((h, w, 3), np.float32)
        self.a = np.zeros((h, w), np.float32)

    def put(self, y0, x0, cov, rgb):
        hh, ww = cov.shape
        c = self.c[y0:y0 + hh, x0:x0 + ww]
        a = self.a[y0:y0 + hh, x0:x0 + ww]
        c *= (1.0 - cov)[..., None]
        c += cov[..., None] * np.asarray(rgb, np.float32)
        a *= (1.0 - cov)
        a += cov

    def fill(self, mask, rgb):
        """A flat design shape (P0): rgb may be a colour or an (h, w, 3) image."""
        self.put(0, 0, np.clip(mask, 0, 1).astype(np.float32), rgb)

    def blur(self, sigma):
        if sigma and sigma > 0.05:
            self.c = ndi.gaussian_filter(self.c, (sigma, sigma, 0)).astype(np.float32)
            self.a = ndi.gaussian_filter(self.a, sigma).astype(np.float32)
        return self

    def clip(self, mask):
        self.c *= mask[..., None]
        self.a *= mask
        return self

    def copy(self):
        o = Layer(self.h, self.w)
        o.c, o.a = self.c.copy(), self.a.copy()
        return o


class Canvas:
    def __init__(self, h, w, rgb=None):
        self.h, self.w = h, w
        self.c = np.zeros((h, w, 3), np.float32)
        if rgb is not None:
            self.c[:] = np.asarray(rgb, np.float32)
        self.a = np.ones((h, w), np.float32)

    def over(self, layer):
        self.c = layer.c + self.c * (1.0 - layer.a)[..., None]
        self.a = layer.a + self.a * (1.0 - layer.a)

    def image(self):
        return Image.fromarray((np.clip(self.c, 0, 1) * 255 + 0.5).astype(np.uint8), 'RGB')

    def copy(self):
        o = Canvas(self.h, self.w)
        o.c, o.a = self.c.copy(), self.a.copy()
        return o


def over_into(dst, layer):
    """Composite a premultiplied layer over another layer (both stay layers)."""
    dst.c = layer.c + dst.c * (1.0 - layer.a)[..., None]
    dst.a = layer.a + dst.a * (1.0 - layer.a)


class Brush:
    """Strokes are swept profiles, never stamp chains: each pixel gets (u along, v across) stroke coordinates and the
    coverage is profile(v) x taper(u) x dry(u, v). The core of a stroke is flat and opaque (gouache); the paint breaks
    up only at the tail (dry) and at the soft edge (edge_dry), in streaks running ALONG the stroke."""

    def __init__(self, rng):
        self.rng = rng
        self.tile = bristle_tile(rng)

    def _cov(self, u, v, length, width, soft, taper, dry, dry_len, edge_dry, bristle):
        hw = width / 2.0
        lo, hi = soft
        across = smooth((v + hw) / max(lo, 0.35)) * smooth((hw - v) / max(hi, 0.35))
        s = u / max(length, 1e-6)
        tin, tout = taper
        along = smooth(s / max(tin, 1e-3)) * smooth((1.0 - s) / max(tout, 1e-3))
        along = np.where((s < -0.02) | (s > 1.02), 0.0, along)
        cov = across * along
        if dry > 0 or edge_dry > 0 or bristle > 0:
            ou, ov = self.rng.uniform(0, 512, 2)
            n = ndi.map_coordinates(self.tile, [v + ov, u + ou], order=1, mode='grid-wrap')
            if dry > 0 or edge_dry > 0:
                core = np.clip(np.minimum(v + hw, hw - v) / max(hw * 0.55, 0.8), 0, 1)
                thr = dry * smooth((s - (1.0 - dry_len)) / max(dry_len, 1e-3)) + edge_dry * (1.0 - core)
                keep = smooth((n - (thr * 3.0 - 1.7)) / 0.7 + 0.5)
                cov = cov * np.where(thr > 0.02, keep, 1.0)
            if bristle > 0:
                cov = cov * (1.0 - bristle * smooth(0.5 - 0.5 * n))
        return cov, s

    def _bbox(self, layer, xs, ys, pad):
        x0 = max(int(np.floor(min(xs) - pad)), 0)
        x1 = min(int(np.ceil(max(xs) + pad)), layer.w)
        y0 = max(int(np.floor(min(ys) - pad)), 0)
        y1 = min(int(np.ceil(max(ys) + pad)), layer.h)
        return x0, y0, x1, y1

    def _apply(self, layer, bb, cov, s, rgb, opacity, clip, drift):
        x0, y0, x1, y1 = bb
        cov = cov * opacity
        if clip is not None:
            cov = cov * clip[y0:y1, x0:x1]
        if not np.any(cov > 1e-4):
            return
        rgb = np.asarray(rgb, np.float64)
        if drift:
            end = shift(rgb, drift)                # the paint thins along the stroke: the tail drifts in OKLab L
            col = (rgb[None, None, :] * (1 - s[..., None]) + end[None, None, :] * s[..., None])
            col = np.where((s[..., None] >= 0) & (s[..., None] <= 1), col, rgb[None, None, :])
        else:
            col = rgb
        layer.put(y0, x0, cov.astype(np.float32), col)

    def line(self, layer, p0, p1, width, rgb, opacity=1.0, soft=(0.8, 0.8), taper=(0.04, 0.08), dry=0.0,
             dry_len=0.35, edge_dry=0.0, bristle=0.0, clip=None, drift=0.0):
        (xa, ya), (xb, yb) = p0, p1
        length = float(np.hypot(xb - xa, yb - ya))
        if length < 0.5:
            return
        tx, ty = (xb - xa) / length, (yb - ya) / length
        nx, ny = -ty, tx
        bb = self._bbox(layer, (xa, xb), (ya, yb), width / 2.0 + 2)
        x0, y0, x1, y1 = bb
        if x1 <= x0 or y1 <= y0:
            return
        yy, xx = np.mgrid[y0:y1, x0:x1].astype(np.float32) + 0.5
        dx, dy = xx - xa, yy - ya
        u = dx * tx + dy * ty
        v = dx * nx + dy * ny
        cov, s = self._cov(u, v, length, width, soft, taper, dry, dry_len, edge_dry, bristle)
        self._apply(layer, bb, cov, s, rgb, opacity, clip, drift)

    def mark(self, layer, cx, cy, length, width, angle, rgb, opacity=1.0, **kw):
        """A blocky flat-brush mark centred at (cx, cy): `length` along `angle` (degrees, 90 = down), `width` across."""
        t = np.radians(angle)
        dx, dy = np.cos(t) * length / 2.0, np.sin(t) * length / 2.0
        kw.setdefault('taper', (0.02, 0.05))
        self.line(layer, (cx - dx, cy - dy), (cx + dx, cy + dy), width, rgb, opacity, **kw)

    def arc(self, layer, centre, radius, th0, th1, width, rgb, opacity=1.0, soft=(0.8, 0.8), taper=(0.08, 0.12),
            dry=0.0, dry_len=0.35, edge_dry=0.0, bristle=0.0, clip=None, drift=0.0, squash=1.0):
        """A stroke along a circular (or, with squash, elliptical) arc from angle th0 to th1 (radians, th1 > th0)."""
        cx, cy = centre
        ths = np.linspace(th0, th1, 16)
        xs, ys = cx + radius * np.cos(ths), cy + radius * squash * np.sin(ths)
        bb = self._bbox(layer, xs, ys, width / 2.0 + 2)
        x0, y0, x1, y1 = bb
        if x1 <= x0 or y1 <= y0:
            return
        yy, xx = np.mgrid[y0:y1, x0:x1].astype(np.float32) + 0.5
        dx, dy = xx - cx, (yy - cy) / squash
        r = np.hypot(dx, dy)
        th = np.arctan2(dy, dx)
        dth = np.mod(th - th0, 2 * np.pi)
        span = th1 - th0
        dth = np.where(dth > span + (2 * np.pi - span) / 2, dth - 2 * np.pi, dth)
        u = dth * radius
        v = r - radius
        cov, s = self._cov(u, v, span * radius, width, soft, taper, dry, dry_len, edge_dry, bristle)
        self._apply(layer, bb, cov, s, rgb, opacity, clip, drift)


def disc_field(h, w, pts, radii, values):
    """Sum of small anti-aliased discs (grain specks) as a float field: value inside each disc."""
    f = np.zeros((h, w), np.float32)
    for (x, y), r, val in zip(pts, radii, values):
        x0, x1 = max(int(x - r - 1), 0), min(int(x + r + 2), w)
        y0, y1 = max(int(y - r - 1), 0), min(int(y + r + 2), h)
        if x1 <= x0 or y1 <= y0:
            continue
        yy, xx = np.mgrid[y0:y1, x0:x1].astype(np.float32) + 0.5
        cov = np.clip(r + 0.5 - np.hypot(xx - x, yy - y), 0, 1)
        f[y0:y1, x0:x1] += cov * val
    return f


def grain(h, w, mask, density, r_range, dl_range, rng, light_share=0.6):
    """Speckle as an L* delta field: `density` specks per 100 x 100 px of the mask (weighted by it), radius r_range
    px, value shift dl_range L* (applied +/-), light_share of them lighter. Place only where the recipe says."""
    area = float(mask.sum())
    n = int(rng.poisson(density * area / 1e4)) if area > 0 else 0
    if n == 0:
        return np.zeros((h, w), np.float32)
    xs, ys = sample_by(mask, n, rng)
    radii = rng.uniform(*r_range, n)
    sign = np.where(rng.random(n) < light_share, 1.0, -1.0)
    vals = sign * rng.uniform(*dl_range, n)
    return disc_field(h, w, zip(xs, ys), radii, vals)


def apply_dl(canvas, dl, mask=None):
    """Add an L* delta field (grain, value modulation) to the canvas in OKLab (0.01 OKLab L ~ 1 L*)."""
    if mask is not None:
        dl = dl * mask
    ok = rgb2ok(canvas.c.astype(np.float64))
    ok[..., 0] += dl * 0.01
    canvas.c = ok2rgb(ok).astype(np.float32)


def to_plane(rgb, k, chroma=1.0, target=None):
    """Depth conversion of an image or colour: move k of the way to the air, then scale chroma about the air."""
    t = rgb2ok(PAL['air'] if target is None else target)
    o = rgb2ok(np.asarray(rgb, np.float64))
    o = o * (1 - k) + t * k
    o[..., 1:] = t[1:] + (o[..., 1:] - t[1:]) * chroma
    return ok2rgb(o)


def depth_convert(canvas_or_layer, k_map, chroma_map=None, target=None):
    """Per-pixel depth conversion (a ground plane): k_map and chroma_map are (h, w) arrays."""
    t = rgb2ok(PAL['air'] if target is None else target)
    o = rgb2ok(canvas_or_layer.c.astype(np.float64))
    k = k_map[..., None]
    o = o * (1 - k) + t * k
    if chroma_map is not None:
        o[..., 1:] = t[1:] + (o[..., 1:] - t[1:]) * chroma_map[..., None]
    canvas_or_layer.c = ok2rgb(o).astype(np.float32)


# ----------------------------------------------------------------------------------------------------------------
# 4. The scene's sky (the sky family's stops), used behind the far city and the facade
# ----------------------------------------------------------------------------------------------------------------
SKY_STOPS = [(0, 'zenith'), (317, 'field'), (556, 'field'), (655, 'rose'), (738, 'band'), (792, 'horizon')]
HORIZON_Y = 792          # frame y of the horizon
SUN = (196.0, 779.0)     # frame position of the sun's centre (low, on the left)
F_PX = 935.0             # focal length in px (a ~60 degree horizontal view on the 1080 frame)
EYE_M = 1.6              # camera height (m): a person's eye on the towpath


def sky_backdrop(h, w, frame_y0, frame_x0=0, disc=True):
    """The dusk gradient for frame rows frame_y0..frame_y0+h, with the sun's wide low warmth and its flat disc."""
    ys = np.arange(h, dtype=np.float64) + frame_y0
    stops_y = np.array([s[0] for s in SKY_STOPS], np.float64)
    stops_ok = np.array([rgb2ok(SKY[s[1]]) for s in SKY_STOPS])
    col = np.stack([np.interp(ys, stops_y, stops_ok[:, i]) for i in range(3)], -1)
    ok = np.repeat(col[:, None, :], w, axis=1)
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float64)
    xx += frame_x0
    yy += frame_y0
    dx, dy = (xx - SUN[0]) / 300.0, (yy - SUN[1]) / 95.0
    warm = 0.55 * np.exp(-(dx * dx + dy * dy))
    ok = ok * (1 - warm[..., None]) + rgb2ok(SKY['glow']) * warm[..., None]
    rgb = ok2rgb(ok)
    if disc:
        r = np.hypot(xx - SUN[0], yy - SUN[1])
        d = np.clip(31.0 + 0.5 - r, 0, 1)[..., None]
        rgb = rgb * (1 - d) + SKY['sun'] * d
    return rgb.astype(np.float32)


def sun_veil(xx_frame, yy_frame, sx=330.0, sy=260.0):
    """How much of the sun's warm in-scatter a far pixel takes (0-1): wide and low around the sun."""
    return (np.exp(-((xx_frame - SUN[0]) / sx) ** 2) * np.exp(-((yy_frame - SUN[1]) / sy) ** 2)).astype(np.float32)


# ----------------------------------------------------------------------------------------------------------------
# 5. ELEMENT 1: the far city as layered atmospheric haze (recipe 4.1)
# ----------------------------------------------------------------------------------------------------------------
# The plane ladder (recipe 3.4): k = share of the way to the air, chroma = chroma kept, blur = plane sigma (px),
# lost = the extra sigma on the tops by the sun, sliver = lit-edge width (px) on edges that face the sun,
# win = share of blocks with lit windows. Heights are px above the horizon; widths px.
FAR_PLANES = [  # far -> near
    dict(name='p4', k=0.84, chroma=0.40, blur=1.6, lost=3.5, sliver=0.0, wide=0.0, win=0.0, p1=0, p2=0,
         top=(6, 26), w=(16, 52), tower=(0.10, 8, 16, 26, 52), gable=0.0, base=HORIZON_Y + 10),
    dict(name='p3', k=0.66, chroma=0.55, blur=1.0, lost=2.5, sliver=1.2, wide=0.0, win=0.0, p1=0, p2=0,
         top=(14, 50), w=(18, 62), tower=(0.16, 12, 24, 62, 120), gable=0.25, base=HORIZON_Y + 30),
    dict(name='p2', k=0.45, chroma=0.70, blur=0.6, lost=0.0, sliver=2.0, wide=0.12, win=0.22, p1=2, p2=1,
         top=(18, 70), w=(26, 80), tower=(0.10, 26, 44, 120, 170), gable=0.45, base=HORIZON_Y + 80),
    dict(name='p1', k=0.24, chroma=0.85, blur=0.3, lost=0.0, sliver=2.8, wide=0.15, win=0.42, p1=3, p2=1,
         top=(-30, 46), w=(44, 118), tower=(0.06, 36, 54, 100, 150), gable=0.6, base=HORIZON_Y + 420,
         chimneys=True),
]


def skyline(rng, w, spec, x_from=-30):
    """Blocks for one plane: flat tops, gables, towers, chimneys, in a slow rise-and-fall rhythm (clusters of taller
    blocks among low stretches). Returns [(poly, dict(x0, x1, top, kind))], heights in frame px."""
    out = []
    hmod = value_noise(1, w + 400, 240.0, rng)[0]          # the skyline's slow rhythm along x
    x = x_from
    base = spec['base']
    while x < w + 30:
        m = 1.0 + 0.32 * float(hmod[int(np.clip(x + 60, 0, w + 399))])
        bw = rng.uniform(*spec['w'])
        p_tower, tw0, tw1, th0, th1 = spec['tower']
        if rng.random() < p_tower * (0.6 + 0.8 * (m > 1.0)):
            tw = rng.uniform(tw0, tw1)
            top = HORIZON_Y - rng.uniform(th0, th1) * m
            out.append((rect(x, top, x + tw, base), dict(x0=x, x1=x + tw, top=top, kind='tower')))
            x += tw * rng.uniform(0.55, 1.0)
            continue
        top = HORIZON_Y - rng.uniform(*spec['top']) * m
        if rng.random() < spec.get('gable', 0.0):
            ridge = top - bw * rng.uniform(0.22, 0.40)
            poly = [(x, top), (x + bw / 2, ridge), (x + bw, top), (x + bw, base), (x, base)]
            out.append((poly, dict(x0=x, x1=x + bw, top=top, kind='gable', ridge=ridge)))
            if spec.get('chimneys') and rng.random() < 0.7:
                cx = x + bw * rng.uniform(0.15, 0.75)
                cw, ch = rng.uniform(6, 10), rng.uniform(10, 20)
                cy = top - (bw / 2 - abs(cx + cw / 2 - x - bw / 2)) * (top - ridge) / (bw / 2) - ch
                out.append((rect(cx, cy, cx + cw, top), dict(x0=cx, x1=cx + cw, top=cy, kind='chimney')))
        else:
            out.append((rect(x, top, x + bw, base), dict(x0=x, x1=x + bw, top=top, kind='block')))
            if spec.get('chimneys') and rng.random() < 0.35:
                cx = x + bw * rng.uniform(0.2, 0.7)
                cw, ch = rng.uniform(6, 10), rng.uniform(8, 16)
                out.append((rect(cx, top - ch, cx + cw, top), dict(x0=cx, x1=cx + cw, top=top - ch, kind='chimney')))
        x += bw * rng.uniform(0.7, 1.05)
    return out


def landmarks(spec_name, frame_y0):
    """King's Cross's own far shapes, as flat design polygons (frame px): a clock tower with its spire (plane p2) and a
    gasholder's ring of columns (plane p3, drawn as thin lines in P3)."""
    out = []
    if spec_name == 'p2':
        x, tw, top = 668.0, 24.0, HORIZON_Y - 146.0
        out.append((rect(x, top, x + tw, HORIZON_Y + 80), dict(x0=x, x1=x + tw, top=top, kind='tower')))
        out.append(([(x - 2, top + 1), (x + tw / 2, top - 52), (x + tw + 2, top + 1)],
                    dict(x0=x - 2, x1=x + tw + 2, top=top - 52, kind='spire')))
        for px in (x - 3, x + tw - 1):                               # corner pinnacles
            out.append(([(px, top + 2), (px + 2, top - 13), (px + 4, top + 2)],
                        dict(x0=px, x1=px + 4, top=top - 13, kind='spire')))
    return out


def paint_far_city(w=1000, h=400, frame_y0=592, seed=None, passes=9):
    """Sky, then 4 planes far -> near. Each plane: P0 flat silhouettes, one value per block (+-1.2 L*), converted
    toward the air by its k (more toward the sun: in-scatter; more at its base: mist); P1 two or three huge soft
    strokes (near planes); P2 the sun-side face of a block one step lighter, dark slots; P3 lit slivers on the edges
    facing the sun + window lights; then the plane blur, and lost tops by the sun on the far planes."""
    rng = rng_for('far_city', seed)
    brush = Brush(rng)
    cv = Canvas(h, w)
    cv.c[:] = sky_backdrop(h, w, frame_y0)
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    fy = yy + frame_y0
    veil = sun_veil(xx, fy)
    shade = mix(PAL['mauve'], PAL['plum'], 0.35)          # the shade face of a city block at dusk, L* ~43
    t_air = rgb2ok(PAL['air'])
    for i, spec in enumerate(FAR_PLANES):
        prng = rng_for('far_city/' + spec['name'], seed)
        blocks = skyline(prng, w, spec) + landmarks(spec['name'], frame_y0)
        # ---- P0: per-block flat colour, then the plane's depth conversion per pixel
        pre = Layer(h, w)
        for poly, b in blocks:
            m = poly_mask(h, w, [[(px, py - frame_y0) for px, py in poly]])
            if m.sum() < 1:
                continue
            c = shift(shade, prng.normal(0, 0.012), prng.normal(0, 0.003), prng.normal(0, 0.004))
            pre.fill(m, c)
        mask = pre.a.copy()
        if mask.sum() < 1:
            continue
        o = rgb2ok(np.where(mask[..., None] > 1e-3, pre.c / np.maximum(mask[..., None], 1e-3), shade))
        k = spec['k'] + (1 - spec['k']) * (0.42 * veil)                              # in-scatter toward the sun
        k = k + (1 - k) * 0.15 * smooth((fy - (HORIZON_Y - 30)) / 170.0)              # mist: the air is thick low
        o = o * (1 - k[..., None]) + t_air * k[..., None]
        o[..., 1:] = t_air[1:] + (o[..., 1:] - t_air[1:]) * spec['chroma']
        warm = 0.22 * veil[..., None]                                                 # the in-scatter is the sun's
        o = o * (1 - warm) + rgb2ok(SKY['glow']) * warm
        lay = Layer(h, w)
        lay.fill(mask, ok2rgb(o).astype(np.float32))
        mid = to_plane(shade, spec['k'], spec['chroma'])
        if passes >= 1 and spec['p1']:
            # P1: two or three huge soft strokes, +-1 L*, blurred 14 px: the plane's colour moving, never stripes
            p1 = Layer(h, w)
            for _ in range(spec['p1']):
                cx_, cy_ = prng.uniform(0, w), prng.uniform(HORIZON_Y - 120, HORIZON_Y + 60) - frame_y0
                c = shift(mid, prng.choice([-1, 1]) * prng.uniform(0.008, 0.012), 0.0, prng.normal(0, 0.006))
                brush.line(p1, (cx_ - 160, cy_), (cx_ + 160, cy_ + prng.uniform(-30, 30)), prng.uniform(120, 200),
                           c, 0.5, soft=(50, 50), taper=(0.3, 0.3))
            p1.blur(14.0).clip(mask)
            over_into(lay, p1)
        if passes >= 2 and spec['p2']:
            # P2: the sun-side face of a block (a second face, one step lighter and warmer), and dark slots
            p2 = Layer(h, w)
            for poly, b in blocks:
                if b['kind'] in ('chimney', 'spire'):
                    continue
                bw_ = b['x1'] - b['x0']
                toward_left = (b['x0'] + b['x1']) / 2 > SUN[0]
                top_l = b['top'] - frame_y0
                if prng.random() < 0.55:
                    fw = bw_ * prng.uniform(0.2, 0.38)
                    fx = b['x0'] + fw / 2 if toward_left else b['x1'] - fw / 2
                    c = to_plane(lighter(shade, 0.24), spec['k'], spec['chroma'])
                    brush.line(p2, (fx, top_l + 0.5), (fx, h + 4), fw, jitter(c, prng, 0.004), prng.uniform(0.55, 0.75),
                               soft=(0.6, 0.6), taper=(0.0, 0.0))
                if prng.random() < 0.3:
                    sx = prng.uniform(b['x0'] + 0.3 * bw_, b['x1'] - 4)
                    c = to_plane(darker(shade, 0.35), spec['k'], spec['chroma'])
                    brush.line(p2, (sx, top_l + prng.uniform(4, 14)), (sx, h + 4), prng.uniform(2.5, 5), c,
                               prng.uniform(0.35, 0.55), soft=(0.6, 0.6), taper=(0.0, 0.0))
            p2.blur(0.4).clip(mask)
            over_into(lay, p2)
        if passes >= 3:
            # P3: lit slivers on the edges facing the sun; window lights; the gasholder's columns
            p3 = Layer(h, w)
            sl_col = to_plane(PAL['glow'], spec['k'] * 0.5, 1.0)
            for poly, b in blocks:
                top_l = b['top'] - frame_y0
                if spec['sliver'] > 0 and b['kind'] in ('tower', 'block', 'gable'):
                    toward_left = (b['x0'] + b['x1']) / 2 > SUN[0]
                    sw = spec['sliver']
                    if prng.random() < spec['wide']:
                        sw = prng.uniform(5, 12)                                       # a face turned to the sun
                    ex = b['x0'] + sw / 2 if toward_left else b['x1'] - sw / 2
                    if b['kind'] == 'tower':
                        ln = (HORIZON_Y + 40 - b['top']) * prng.uniform(0.6, 1.0)
                    else:
                        ln = (HORIZON_Y + 40 - b['top']) * prng.uniform(0.25, 0.7)
                    if b['kind'] == 'gable':
                        ex = b['x0'] + sw / 2 if toward_left else b['x1'] - sw / 2
                    brush.line(p3, (ex, top_l), (ex, top_l + max(ln, 6)), sw, sl_col, prng.uniform(0.75, 0.95),
                               soft=(0.45, 0.45), taper=(0.0, 0.55), dry=0.25)
                    if b['kind'] == 'tower':                                           # the roof edge catches it too
                        brush.line(p3, (b['x0'], top_l + 0.7), (b['x1'], top_l + 0.7), 1.4, sl_col, 0.6,
                                   soft=(0.45, 0.45), taper=(0.1, 0.1))
                if b['kind'] == 'spire' and spec['sliver'] > 0:                        # the spire's sunward flank
                    (ax, ay), (bx, by), (cx2, cy2) = poly[0], poly[1], poly[2]
                    brush.line(p3, (ax + 1.0, ay - frame_y0), (bx, by - frame_y0 + 2), 1.6, sl_col, 0.8,
                               soft=(0.45, 0.45), taper=(0.0, 0.2))
                if spec['win'] and b['kind'] in ('block', 'tower', 'gable') and prng.random() < spec['win']:
                    lampc = to_plane(mix(PAL['lamp'], shade, 0.2), spec['k'] * 0.6, 1.0)
                    wy = top_l + prng.uniform(7, 12)
                    while wy < h - 3:
                        for _ in range(int(prng.integers(1, 5))):
                            if prng.random() < 0.55:
                                wx = prng.uniform(b['x0'] + 4, max(b['x1'] - 6, b['x0'] + 5))
                                brush.line(p3, (wx, wy), (wx + prng.uniform(2.0, 4.5), wy), 1.5, lampc,
                                           prng.uniform(0.6, 0.95), soft=(0.4, 0.4), taper=(0.05, 0.05))
                        wy += prng.uniform(8, 11)
            if spec['name'] == 'p3':                                                    # the gasholder frame
                gx0, gx1, gtop = 780.0, 905.0, HORIZON_Y - 74.0
                gcol = to_plane(darker(shade, 0.2), spec['k'] * 0.85, spec['chroma'])
                for j in range(8):
                    t = (1 - np.cos(np.pi * j / 7)) / 2
                    gx = gx0 + (gx1 - gx0) * t
                    brush.line(p3, (gx, gtop - frame_y0), (gx, HORIZON_Y + 6 - frame_y0), 1.6, gcol, 0.85,
                               soft=(0.45, 0.45), taper=(0.0, 0.0))
                for ry in (0.0, 0.33, 0.66):
                    yv = gtop + (HORIZON_Y - gtop) * ry - frame_y0
                    brush.line(p3, (gx0, yv), (gx1, yv), 1.8, gcol, 0.85, soft=(0.45, 0.45), taper=(0.0, 0.0))
            if spec['name'] != 'p3':
                p3.clip(mask)
            over_into(lay, p3)
        # PLANE: one small blur for its depth; the far planes' tops are lost right by the sun
        lay.blur(spec['blur'])
        if spec['lost'] > 0:
            soft = lay.copy().blur(spec['lost'])
            wgt = np.clip(1.15 * veil, 0, 1)
            lay.c = lay.c * (1 - wgt[..., None]) + soft.c * wgt[..., None]
            lay.a = lay.a * (1 - wgt) + soft.a * wgt
        cv.over(lay)
    return cv
