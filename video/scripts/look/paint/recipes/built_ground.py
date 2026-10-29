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
# The plane ladder (recipe 3.4), far -> near. k = share of the way to the air; chroma = chroma kept; blur = the plane's
# sigma (px); lost = the extra sigma on the tops by the sun; sliver = lit-edge width (px) on edges that face the sun;
# wide = share of blocks with a whole face turned to the sun; win = share of blocks with lit windows; h = building
# heights above the horizon (px); w = widths (px); types = the mix of building kinds.
FAR_PLANES = [
    dict(name='p4', k=0.82, chroma=0.40, blur=1.6, lost=3.5, sliver=0.0, wide=0.0, win=0.0, mottle=0.5, jit=0.010,
         scatter=0.50, mist=0.16, h=(8, 30), w=(18, 60), types=dict(block=0.7, tower=0.18, warehouse=0.12),
         base=HORIZON_Y + 12),
    dict(name='p3', k=0.62, chroma=0.55, blur=1.0, lost=2.5, sliver=1.2, wide=0.0, win=0.0, mottle=0.6, jit=0.012,
         scatter=0.45, mist=0.13, h=(18, 56), w=(20, 64), types=dict(block=0.5, tower=0.25, warehouse=0.2, gable=0.05),
         base=HORIZON_Y + 30),
    dict(name='p2', k=0.40, chroma=0.70, blur=0.6, lost=0.0, sliver=2.0, wide=0.12, win=0.25, mottle=0.7, jit=0.016,
         scatter=0.35, mist=0.09, h=(22, 64), w=(26, 84), types=dict(block=0.45, tower=0.12, warehouse=0.25,
                                                                         gable=0.18), base=HORIZON_Y + 90),
    dict(name='p1', k=0.18, chroma=0.85, blur=0.3, lost=0.0, sliver=3.4, wide=0.15, win=0.35, mottle=0.8, jit=0.025,
         scatter=0.25, mist=0.05, h=(6, 30), w=(40, 120), types=dict(block=0.2, warehouse=0.35, terrace=0.35,
                                                                        gable=0.1), base=HORIZON_Y + 600,
         chimneys=True),
]
SUN_GAP = (SUN[0], 95.0, 0.5)    # the skyline dips by half within ~95 px of the sun's x: the sun stays visible


def skyline(rng, w, spec):
    """Buildings for one plane, left to right, in a slow rise-and-fall rhythm (clusters of taller blocks among low
    stretches), with a dip by the sun. Returns [(poly, info)] in frame px; info: x0, x1, top, kind, roof."""
    out = []
    hmod = value_noise(1, w + 400, 260.0, rng)[0]
    kinds = list(spec['types'].keys())
    probs = np.array([spec['types'][k] for k in kinds], np.float64)
    probs /= probs.sum()
    x = -30.0
    base = spec['base']
    while x < w + 30:
        xi = int(np.clip(x + 60, 0, w + 399))
        m = (1.0 + 0.35 * float(hmod[xi])) * (1.0 - SUN_GAP[2] * np.exp(-((x - SUN_GAP[0]) / SUN_GAP[1]) ** 2))
        kind = kinds[int(rng.choice(len(kinds), p=probs))]
        bw = rng.uniform(*spec['w'])
        hgt = rng.uniform(*spec['h']) * max(m, 0.25)
        if kind == 'tower':
            bw = bw * rng.uniform(0.35, 0.55)
            hgt = hgt * rng.uniform(1.9, 2.8)
        elif kind == 'warehouse':
            bw = bw * rng.uniform(1.4, 2.2)
            hgt = hgt * rng.uniform(0.7, 0.95)
        top = HORIZON_Y - hgt
        info = dict(x0=x, x1=x + bw, top=top, kind=kind, roof=None)
        if kind == 'gable':
            ridge = top - bw * rng.uniform(0.22, 0.36)
            poly = [(x, top), (x + bw / 2, ridge), (x + bw, top), (x + bw, base), (x, base)]
            info['roof'] = ridge
        elif kind == 'warehouse':
            ridge = top - bw * rng.uniform(0.05, 0.09)                    # a shallow pitch, long and low
            poly = [(x, top), (x + bw * 0.5, ridge), (x + bw, top), (x + bw, base), (x, base)]
            info['roof'] = ridge
        else:
            poly = rect(x, top, x + bw, base)
        out.append((poly, info))
        if kind in ('block', 'tower') and rng.random() < 0.3:              # a setback or a roof box on top
            sw = bw * rng.uniform(0.35, 0.65)
            sx = x + rng.uniform(0.1, 0.9) * (bw - sw)
            sh = hgt * rng.uniform(0.08, 0.22)
            out.append((rect(sx, top - sh, sx + sw, top + 1), dict(x0=sx, x1=sx + sw, top=top - sh, kind='box',
                                                                    roof=None)))
        if kind == 'terrace' or (spec.get('chimneys') and kind == 'block' and rng.random() < 0.3):
            for j in range(int(rng.integers(2, 5))):                       # a row of chimney stacks
                cx = x + bw * (0.12 + 0.76 * (j + rng.uniform(0.2, 0.8)) / 4.0)
                cw, ch = rng.uniform(5, 8), rng.uniform(7, 13)
                out.append((rect(cx, top - ch, cx + cw, top + 1), dict(x0=cx, x1=cx + cw, top=top - ch,
                                                                        kind='chimney', roof=None)))
        x += bw * rng.uniform(0.72, 1.02)
    return out


def landmarks(plane):
    """King's Cross's own far shapes (frame px): the clock tower with its spire on plane p2."""
    out = []
    if plane == 'p2':
        x, tw, top = 668.0, 24.0, HORIZON_Y - 146.0
        out.append((rect(x, top, x + tw, HORIZON_Y + 90), dict(x0=x, x1=x + tw, top=top, kind='tower', roof=None)))
        out.append(([(x - 2, top + 1), (x + tw / 2, top - 52), (x + tw + 2, top + 1)],
                    dict(x0=x - 2, x1=x + tw + 2, top=top - 52, kind='spire', roof=None)))
        for px in (x - 3, x + tw - 1):                                     # corner pinnacles
            out.append(([(px, top + 2), (px + 2, top - 13), (px + 4, top + 2)],
                        dict(x0=px, x1=px + 4, top=top - 13, kind='spire', roof=None)))
    return out


def far_window_grid(brush, layer, b, h, frame_y0, prng, colour, cell, dash, p_lit):
    """Window lights as a grid on one block: columns every cell[0] px, rows every cell[1] px, each lit with p_lit
    (a row's chance varies, so lit windows cluster by floor)."""
    x0, x1 = b['x0'] + 3, b['x1'] - 3
    y = b['top'] - frame_y0 + prng.uniform(5, 9)
    while y < h - 2:
        pr = p_lit * prng.uniform(0.2, 1.6)
        x = x0 + prng.uniform(0, cell[0] * 0.5)
        while x < x1 - dash[0]:
            if prng.random() < pr:
                brush.line(layer, (x, y), (x + dash[0], y), dash[1], jitter(colour, prng, 0.01),
                           prng.uniform(0.65, 0.95), soft=(0.4, 0.4), taper=(0.04, 0.04))
            x += cell[0]
        y += cell[1]


def paint_far_city(w=1000, h=300, frame_y0=592, seed=None, passes=9):
    """Sky, then 4 planes far -> near. Each plane: P0 flat silhouettes, one value per block (+-1.2 L*), converted
    toward the air by its k (more toward the sun: in-scatter; more at its base: mist) and a slow mottle; P2 the
    sun-side face of a block one step lighter, dark slots (mid planes); P3 lit slivers on the edges that face the sun,
    glowing roof edges, window grids, the gasholder's frame; then the plane blur, and lost tops by the sun."""
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
        blocks = skyline(prng, w, spec) + landmarks(spec['name'])
        # ---- P0: per-block flat colour, then the plane's depth conversion, per pixel
        pre = Layer(h, w)
        for poly, b in blocks:
            m = poly_mask(h, w, [[(px, py - frame_y0) for px, py in poly]])
            if m.sum() < 1:
                continue
            c = shift(shade, prng.normal(0, spec['jit']), prng.normal(0, 0.003), prng.normal(0, 0.004))
            pre.fill(m, c)
        mask = pre.a.copy()
        if mask.sum() < 1:
            continue
        o = rgb2ok(np.where(mask[..., None] > 1e-3, pre.c / np.maximum(mask[..., None], 1e-3), shade))
        o[..., 0] += 0.01 * spec['mottle'] * value_noise(h, w, 46.0, prng)           # colour moving in the plane
        k = spec['k'] + (1 - spec['k']) * (spec['scatter'] * veil)                      # in-scatter toward the sun
        k = k + (1 - k) * spec['mist'] * smooth((fy - (HORIZON_Y - 30)) / 170.0)        # mist: the air is thick low
        o = o * (1 - k[..., None]) + t_air * k[..., None]
        o[..., 1:] = t_air[1:] + (o[..., 1:] - t_air[1:]) * spec['chroma']
        warm = 0.22 * veil[..., None]                                                  # the in-scatter is the sun's
        o = o * (1 - warm) + rgb2ok(SKY['glow']) * warm
        lay = Layer(h, w)
        lay.fill(mask, ok2rgb(o).astype(np.float32))
        if passes >= 2 and spec['name'] in ('p2', 'p1'):
            # P2: the sun-side face of a block (a second face, one step lighter and warmer), and dark slots
            p2 = Layer(h, w)
            for poly, b in blocks:
                if b['kind'] in ('chimney', 'spire', 'box'):
                    continue
                bw_ = b['x1'] - b['x0']
                toward_left = (b['x0'] + b['x1']) / 2 > SUN[0]
                top_l = b['top'] - frame_y0
                if prng.random() < 0.75:
                    fw = bw_ * prng.uniform(0.2, 0.36)
                    fx = b['x0'] + fw / 2 if toward_left else b['x1'] - fw / 2
                    c = to_plane(lighter(shade, 0.3), spec['k'], spec['chroma'])
                    y_start = top_l + 0.5 if b['roof'] is None else top_l + 0.5
                    brush.line(p2, (fx, y_start), (fx, h + 4), fw, jitter(c, prng, 0.004), prng.uniform(0.6, 0.8),
                               soft=(0.6, 0.6), taper=(0.0, 0.0))
                if prng.random() < 0.3:
                    sx = prng.uniform(b['x0'] + 0.35 * bw_, b['x1'] - 4)
                    c = to_plane(darker(shade, 0.35), spec['k'], spec['chroma'])
                    brush.line(p2, (sx, top_l + prng.uniform(5, 14)), (sx, h + 4), prng.uniform(2.5, 5), c,
                               prng.uniform(0.35, 0.55), soft=(0.6, 0.6), taper=(0.0, 0.0))
            p2.blur(0.4).clip(mask)
            over_into(lay, p2)
        if passes >= 3:
            # P3: lit slivers on the edges facing the sun; glowing roof edges; window grids; the gasholder
            p3 = Layer(h, w)
            sl_col = to_plane(PAL['glow'], spec['k'] * 0.45, 1.0)
            for poly, b in blocks:
                top_l = b['top'] - frame_y0
                if spec['sliver'] > 0 and b['kind'] in ('tower', 'block', 'warehouse', 'terrace', 'gable', 'box'):
                    if prng.random() < 0.8:
                        toward_left = (b['x0'] + b['x1']) / 2 > SUN[0]
                        sw = spec['sliver']
                        if prng.random() < spec['wide'] and b['kind'] in ('tower', 'block'):
                            sw = prng.uniform(5, 11)                                    # a face turned to the sun
                        ex = b['x0'] + sw / 2 if toward_left else b['x1'] - sw / 2
                        vis = min(h + frame_y0, HORIZON_Y + 120) - b['top']
                        ln = vis * (prng.uniform(0.8, 1.0) if b['kind'] == 'tower' else prng.uniform(0.5, 1.0))
                        brush.line(p3, (ex, top_l), (ex, top_l + max(ln, 5)), sw, sl_col, prng.uniform(0.8, 0.95),
                                   soft=(0.45, 0.45), taper=(0.0, 0.6), dry=0.2)
                    if b['roof'] is None and b['kind'] in ('tower', 'block', 'box') and prng.random() < 0.55:
                        brush.line(p3, (b['x0'], top_l + 0.7), (b['x1'], top_l + 0.7), 1.3, sl_col, 0.55,
                                   soft=(0.45, 0.45), taper=(0.08, 0.3))           # the parapet catches the glow
                if b['kind'] == 'spire' and spec['sliver'] > 0:                        # the spire's sunward flank
                    (ax, ay), (bx, by) = poly[0], poly[1]
                    brush.line(p3, (ax + 1.0, ay - frame_y0), (bx, by - frame_y0 + 2), 1.6, sl_col, 0.85,
                               soft=(0.45, 0.45), taper=(0.0, 0.2))
                if spec['win'] and b['kind'] in ('block', 'tower', 'warehouse', 'terrace') and \
                        prng.random() < spec['win']:
                    lampc = to_plane(mix(PAL['lamp'], shade, 0.15), spec['k'] * 0.55, 1.0)
                    near = spec['name'] == 'p1'
                    far_window_grid(brush, p3, b, h, frame_y0, prng, lampc, (7.5, 10.0) if near else (6.0, 8.0),
                                    (2.4, 1.5) if near else (1.8, 1.2), 0.28)
            if spec['name'] == 'p3':                                                     # the gasholder frame
                gx0, gx1, gtop = 800.0, 920.0, HORIZON_Y - 70.0
                gcol = to_plane(darker(shade, 0.2), spec['k'] * 0.85, spec['chroma'])
                for j in range(8):
                    t = (1 - np.cos(np.pi * j / 7)) / 2
                    gx = gx0 + (gx1 - gx0) * t
                    brush.line(p3, (gx, gtop - frame_y0), (gx, HORIZON_Y + 8 - frame_y0), 1.7, gcol, 0.9,
                               soft=(0.45, 0.45), taper=(0.0, 0.0))
                for ry in (0.0, 0.34, 0.68):
                    yv = gtop + (HORIZON_Y - gtop) * ry - frame_y0
                    brush.line(p3, (gx0, yv), (gx1, yv), 1.8, gcol, 0.9, soft=(0.45, 0.45), taper=(0.0, 0.0))
                brush.line(p3, (gx0 + 2, gtop - frame_y0 + 1.6), (gx1 - 2, gtop - frame_y0 + 1.6), 1.2, sl_col, 0.6,
                           soft=(0.45, 0.45), taper=(0.0, 0.0))
            else:
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


# ----------------------------------------------------------------------------------------------------------------
# 6. ELEMENT 2: the painted facade (recipe 4.2)
# ----------------------------------------------------------------------------------------------------------------
# A four-storey stock-brick warehouse 27 m away, seen from the towpath (eye 1.6 m): its base at frame y 848, its top
# at y 288, the horizon cutting it 56 px above the base. The sun is low, ahead-left: the SIDE face (facing left) is lit
# at a grazing angle, the FRONT face (facing us) is in the shade family; every reveal and edge that faces left catches
# a sliver of sun. Panel px = frame px - (430, 198).
FAC_X0, FAC_Y0 = 430, 198
FAC_HZ = HORIZON_Y - FAC_Y0                       # 594: the horizon in panel px (the eye's level)
FAC_VP = (-900.0, float(FAC_HZ))                  # the side face's vanishing point (left, on the horizon)
FAC_CORNER, FAC_FAR, FAC_RIGHT = 170.0, 58.0, 570.0
FAC_TOP, FAC_GROUND = 90.0, 650.0


def fac_colours():
    """The facade's value plan in the dusk light (recipe 4.2 a): 9 values from 3 hue families, all palette mixes."""
    C = dict(
        side=mix(PAL['ochre'], PAL['glow'], 0.18),           # L~74 brick on the sunlit side face (warm gold)
        front_top=mix(PAL['mauve'], PAL['lilac'], 0.30),     # L~55 brick in shade, high: more sky, cooler
        front_low=mix(PAL['mauve'], PAL['terracotta'], 0.40),  # L~53 brick in shade, low: warm bounce
        stone_sh=mix(PAL['lilac'], PAL['cream'], 0.30),      # L~72 dressed stone in shade (cornice, bands, sills)
        stone_lit=mix(PAL['cream'], PAL['glow'], 0.55),      # L~90 dressed stone in the sun (the side face)
        deep=mix(PAL['plum'], PAL['mauve'], 0.20),           # L~35 soffits seen from below, lintel heads
        glass=mix(PAL['ink'], PAL['plum'], 0.30),            # L~22 glass in shade
        glass_sky=mix(PAL['skyglass'], PAL['lilac'], 0.30),  # L~63 the upper pane mirrors the lilac sky behind us
        lamp=PAL['lamp'],                                    # L~84 a lit interior
        lamp_low=mix(PAL['lamp'], PAL['terracotta'], 0.45),  # L~72 the same, falling off low
        plinth=mix(PAL['slate'], PAL['plum'], 0.45),         # L~39 blue engineering brick in shade
        plinth_lit=mix(PAL['terracotta'], PAL['ochre'], 0.35),  # L~63 the same in the sun
        pipe=mix(PAL['plum'], PAL['ink'], 0.30),             # L~28
        reveal=mix(PAL['ochre'], PAL['glow'], 0.32),         # L~78 a reveal facing the sun (the brightest brick)
        ground_lit=mix(PAL['sand'], PAL['glow'], 0.25),      # the sunlit paving in front
        ground_sh=mix(PAL['lilac'], PAL['sand'], 0.30),      # the building's shadow wedge on it
    )
    return C


def fac_side_pt(u, yc):
    """A point on the side face: u = 0 at its far edge .. 1 at the corner; yc = the height on the corner's scale."""
    x = FAC_FAR + (FAC_CORNER - FAC_FAR) * u
    f = (x - FAC_VP[0]) / (FAC_CORNER - FAC_VP[0])
    return (x, FAC_HZ + (yc - FAC_HZ) * f)


def fac_side_quad(u0, u1, y0, y1):
    return [fac_side_pt(u0, y0), fac_side_pt(u1, y0), fac_side_pt(u1, y1), fac_side_pt(u0, y1)]


FAC_ROWS = [(150.0, 236.0), (278.0, 364.0), (406.0, 492.0)]   # window top/bottom per upper floor
FAC_COLS = [218.0, 318.0, 418.0, 518.0]                        # window centre x on the front (width 50)
FAC_BANDS = [254.0, 382.0, 510.0]                             # stone string courses (top y), 8 px tall
FAC_ARCHES = [240.0, 370.0, 500.0]                            # ground-floor loading arches (width 80)


def paint_facade(W=600, H=720, seed=None, passes=9, keep=None):
    """P0 the flat design in its value plan; P1 big soft strokes per face (blurred 8 px); P2 blocky flat strokes where
    the form turns and the weather runs (blurred 0.5 px); P2b brick suggested in patches (strong in the raking sun,
    faint in shade); P3 crisp accents (slivers on everything that faces the sun, glazing bars, the arris); P4 weather
    (stains under sills, soot under the cornice, the splash band) and speckle. `keep` collects pass snapshots."""
    rng = rng_for('facade', seed)
    brush = Brush(rng)
    C = fac_colours()
    cv = Canvas(H, W)
    cv.c[:] = sky_backdrop(H, W, FAC_Y0, FAC_X0)
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    # ---- the ground: sunlit paving to the horizon (its glare toward the sun), the shadow wedge along the front ----
    g = Layer(H, W)
    m_gr = (yy >= FAC_HZ).astype(np.float32)
    zf = np.clip((yy - FAC_HZ) / 60.0, 0, 1)[..., None]
    gcol = mix(PAL['air'], PAL['glow'], 0.4) * (1 - zf) + C['ground_lit'] * zf
    g.fill(m_gr, gcol.astype(np.float32))
    sun_foot = (SUN[0] - FAC_X0, float(FAC_HZ))
    d = np.array([FAC_CORNER - sun_foot[0], FAC_GROUND - sun_foot[1]])
    d /= np.linalg.norm(d)
    wedge = [(FAC_CORNER, FAC_GROUND), (FAC_CORNER + d[0] * 2000, FAC_GROUND + d[1] * 2000), (W + 50, FAC_GROUND)]
    g.fill(poly_mask(H, W, [wedge]) * m_gr, C['ground_sh'])
    cv.over(g)
    # ---- DESIGN (P0): faces, stone, openings ----
    side = [fac_side_pt(0, FAC_TOP), fac_side_pt(1, FAC_TOP), fac_side_pt(1, FAC_GROUND), fac_side_pt(0, FAC_GROUND)]
    front = rect(FAC_CORNER, FAC_TOP, FAC_RIGHT, FAC_GROUND)
    m_side = poly_mask(H, W, [side])
    m_front = poly_mask(H, W, [front])
    m_bldg = np.clip(m_side + m_front, 0, 1)
    # front features
    cornice = rect(FAC_CORNER, FAC_TOP, FAC_RIGHT + 6, 106)
    soffit = rect(FAC_CORNER, 106, FAC_RIGHT + 6, 116)
    bedc = rect(FAC_CORNER, 116, FAC_RIGHT, 120)
    bands = [rect(FAC_CORNER, b, FAC_RIGHT, b + 8) for b in FAC_BANDS]
    band_under = [rect(FAC_CORNER, b + 8, FAC_RIGHT, b + 9.6) for b in FAC_BANDS]
    win, sills, sill_under, heads, reveals, wins = [], [], [], [], [], []
    for (t, b) in FAC_ROWS:
        for c in FAC_COLS:
            x0, x1 = c - 25, c + 25
            wins.append((x0, t, x1, b))
            win.append(rect(x0, t, x1, b))
            sills.append(rect(x0 - 5, b, x1 + 5, b + 8))
            sill_under.append(rect(x0 - 5, b + 8, x1 + 5, b + 9.6))
            heads.append(rect(x0, t, x1, t + 4))
            reveals.append(rect(x1 - 6, t + 4, x1, b))
    arches, arch_reveals, arch_heads = [], [], []
    for c in FAC_ARCHES:
        r = 40.0
        x0, x1, top, spring = c - r, c + r, 548.0, 588.0
        poly = [(x0, FAC_GROUND), (x0, spring)] + [(c + r * np.cos(a), spring - r * np.sin(a))
                                                   for a in np.linspace(np.pi, 0, 24)] + [(x1, FAC_GROUND)]
        arches.append(poly)
        arch_reveals.append([(x1 - 7, spring + 4), (x1, spring), (x1, FAC_GROUND), (x1 - 7, FAC_GROUND)])
        ring = [(c + (r + 9) * np.cos(a), spring - (r + 9) * np.sin(a)) for a in np.linspace(np.pi, 0, 24)]
        ring += [(c + r * np.cos(a), spring - r * np.sin(a)) for a in np.linspace(0, np.pi, 24)]
        arch_heads.append(ring)
    plinth_f = rect(FAC_CORNER, 628, FAC_RIGHT, FAC_GROUND)
    pipe = rect(553, 116, 559, FAC_GROUND)
    # side features (the same heights, mapped through the side face's perspective)
    s_cornice = [fac_side_pt(0, FAC_TOP), fac_side_pt(1, FAC_TOP), fac_side_pt(1, 106), fac_side_pt(0, 106)]
    s_soffit = fac_side_quad(0, 1, 106, 116)
    s_bands = [fac_side_quad(0, 1, b, b + 8) for b in FAC_BANDS]
    s_wins = [fac_side_quad(0.40, 0.64, t, b) for (t, b) in FAC_ROWS]
    s_sills = [fac_side_quad(0.37, 0.67, b, b + 7) for (t, b) in FAC_ROWS]
    s_arch = []
    u0, u1 = 0.32, 0.72
    pts = [fac_side_pt(u0, FAC_GROUND), fac_side_pt(u0, 590)]
    for a in np.linspace(np.pi, 0, 20):
        u = (u0 + u1) / 2 + (u1 - u0) / 2 * np.cos(a)
        pts.append(fac_side_pt(u, 590 - 36 * np.sin(a)))
    pts += [fac_side_pt(u1, 590), fac_side_pt(u1, FAC_GROUND)]
    s_arch.append(pts)
    s_plinth = fac_side_quad(0, 1, 628, FAC_GROUND)
    M = lambda polys: poly_mask(H, W, polys)                                     # noqa: E731
    m_win, m_sill, m_sill_u, m_head = M(win), M(sills), M(sill_under), M(heads)
    m_reveal = M(reveals)
    m_arch, m_arch_rev, m_arch_head = M(arches), M(arch_reveals), M(arch_heads) * (1 - M(arches))
    m_cornice, m_soffit, m_bedc = M([cornice]), M([soffit]), M([bedc])
    m_band, m_band_u = M(bands), M(band_under)
    m_plinth_f = M([plinth_f]) * (1 - m_arch)
    m_pipe = M([pipe])
    m_s_cornice, m_s_soffit, m_s_band = M([s_cornice]), M([s_soffit]), M(s_bands)
    m_s_win, m_s_sill, m_s_arch, m_s_plinth = M(s_wins), M(s_sills), M(s_arch), M([s_plinth]) * (1 - M(s_arch))
    stone_f = np.clip(m_cornice + m_bedc + m_band + m_sill, 0, 1) * (1 - m_soffit)
    open_f = np.clip(m_win + m_arch, 0, 1)
    m_fbrick = np.clip(m_front - stone_f - m_soffit - open_f - m_plinth_f - m_pipe - m_arch_head * 0, 0, 1)
    m_fbrick = np.clip(m_fbrick - m_sill_u - m_band_u, 0, 1)
    m_sbrick = np.clip(m_side - m_s_cornice - m_s_soffit - m_s_band - m_s_win - m_s_sill - m_s_arch - m_s_plinth,
                       0, 1)
    lay = Layer(H, W)
    t = smooth((yy - FAC_TOP) / (FAC_GROUND - FAC_TOP))[..., None]
    front_img = C['front_top'] * (1 - t) + C['front_low'] * t                   # cooler high, warmer low
    tb = (np.exp(-(xx - FAC_CORNER) / 120.0) * smooth((yy - 300) / 340.0))[..., None]
    front_img = front_img * (1 - 0.35 * tb) + lighter(C['front_low'], 0.2, 'terracotta') * 0.35 * tb  # bounce
    lay.fill(m_front, front_img.astype(np.float32))
    ts = smooth((FAC_CORNER - xx) / (FAC_CORNER - FAC_FAR))[..., None]
    side_img = C['side'] * (1 - 0.5 * ts) + lighter(C['side'], 0.2) * 0.5 * ts   # brighter toward the sun's end
    lay.fill(m_side, side_img.astype(np.float32))
    lay.fill(m_arch_head * m_front, mix(front_img, C['stone_sh'], 0.25).astype(np.float32))  # a gauged-brick ring
    lay.fill(stone_f, C['stone_sh'])
    lay.fill(m_soffit, C['deep'])
    lay.fill(np.clip(m_sill_u + m_band_u, 0, 1), C['deep'])
    lay.fill(m_s_cornice, C['stone_lit'])
    lay.fill(m_s_soffit, mix(C['stone_lit'], C['deep'], 0.55))
    lay.fill(m_s_band + m_s_sill, C['stone_lit'])
    lay.fill(m_plinth_f, C['plinth'])
    lay.fill(m_s_plinth, C['plinth_lit'])
    lay.fill(m_pipe, C['pipe'])
    # glass: the upper pane mirrors the lilac sky behind us, the lower pane is dark; a few lit from inside
    wrng = rng_for('facade/windows', seed)
    lit_ids = {1, 6, 11}
    glass = np.zeros((H, W, 3), np.float32)
    for idx, (x0, t0, x1, b0) in enumerate(wins):
        m = poly_mask(H, W, [rect(x0, t0, x1, b0)])
        split = t0 + (b0 - t0) * wrng.uniform(0.32, 0.46) + (xx - x0) * 0.22
        f = smooth((yy - split) / 2.5 + 0.5)[..., None]
        col = C['glass_sky'] * (1 - f) + C['glass'] * f
        col = col * (1 - f) + shift(C['glass'], wrng.normal(0, 0.025)) * f                 # interiors differ
        if idx in (3, 8):                                                                  # a blind half down
            fb = (yy < t0 + (b0 - t0) * wrng.uniform(0.3, 0.45))[..., None]
            col = np.where(fb, mix(C['stone_sh'], C['glass_sky'], 0.5), col)
        if idx in lit_ids:
            f2 = smooth((yy - (t0 + (b0 - t0) * 0.55)) / 26.0)[..., None]
            col = C['lamp'] * (1 - f2) + C['lamp_low'] * f2
        glass = glass * (1 - m[..., None]) + col * m[..., None]
    for idx, poly in enumerate(s_wins):                                       # side windows: sky glass, one lit
        m = poly_mask(H, W, [poly])
        ys = [p[1] for p in poly]
        split = min(ys) + (max(ys) - min(ys)) * 0.4
        f = smooth((yy - split) / 2.5 + 0.5)[..., None]
        col = mix(C['glass_sky'], PAL['air'], 0.35) * (1 - f) + C['glass'] * f   # it mirrors the brighter west
        glass = glass * (1 - m[..., None]) + col * m[..., None]
    lay.fill(m_win + m_s_win, glass)
    lay.fill(m_head, C['deep'])
    lay.fill(m_reveal, C['reveal'])
    # the arches: dark bays, one a lit cafe; their right reveals catch the sun
    arch_img = np.zeros((H, W, 3), np.float32)
    for j, poly in enumerate(arches + s_arch):
        m = poly_mask(H, W, [poly])
        if j == 1:
            f2 = smooth((yy - 560) / 80.0)[..., None]
            col = C['lamp'] * (1 - f2) + C['lamp_low'] * f2
        else:
            f2 = smooth((yy - 560) / 90.0)[..., None]
            col = C['glass'] * (1 - f2) + mix(C['glass'], C['deep'], 0.5) * f2
        arch_img = arch_img * (1 - m[..., None]) + col * m[..., None]
    lay.fill(np.clip(m_arch + m_s_arch, 0, 1), arch_img)
    lay.fill(m_arch_rev, C['reveal'])
    lay.clip(m_bldg)
    cv.over(lay)
    if keep is not None:
        keep['P0'] = cv.image()
    # ---- P1: big soft strokes per face: +-2 L*, warm/cool, blurred 8 px, clipped to the brick of that face ----
    if passes >= 1:
        for region, base, n in ((m_fbrick, None, 8), (m_sbrick, C['side'], 4)):
            p1 = Layer(H, W)
            xs, ys = sample_by(region, n, rng)
            for x, y in zip(xs, ys):
                b0 = base if base is not None else (C['front_top'] if y < 380 else C['front_low'])
                warm = rng.random() < 0.5
                c = lighter(b0, rng.uniform(0.15, 0.22), 'terracotta' if base is None else 'glow') if warm else \
                    darker(b0, rng.uniform(0.14, 0.2), 'slate')
                brush.line(p1, (x, y - rng.uniform(80, 200)), (x + rng.uniform(-12, 12), y + rng.uniform(80, 200)),
                           rng.uniform(60, 120), c, 0.5, soft=(14, 14), taper=(0.25, 0.25))
            p1.blur(6.0).clip(region)
            cv.over(p1)
        if keep is not None:
            keep['P1'] = cv.image()
    # ---- P2: blocky flat-brush strokes, placed where the form turns and the weather runs ----
    if passes >= 2:
        p2 = Layer(H, W)

        def panel_stroke(x0, x1, y0, y1, b0, vertical=True):
            r = rng.random()
            if r < 0.4:
                c = lighter(b0, rng.uniform(0.15, 0.24), 'terracotta')            # +4..7 L*, warmer
            elif r < 0.78:
                c = darker(b0, rng.uniform(0.14, 0.22))                           # -4..7 L*, cooler
            else:
                c = mix(b0, PAL['lilac'], rng.uniform(0.3, 0.42))                 # the sky's hue laid in (p02)
            if vertical:
                wd = (x1 - x0) * rng.uniform(0.6, 0.92)
                cx = x0 + (x1 - x0) / 2 + rng.uniform(-0.15, 0.15) * (x1 - x0 - wd)
                ln = (y1 - y0) * rng.uniform(0.55, 1.0)
                cy = y0 + ln / 2 + rng.uniform(0, (y1 - y0) - ln)
                brush.mark(p2, cx, cy, ln, wd, 90, jitter(c, rng, 0.003), rng.uniform(0.55, 0.8), soft=(0.6, 0.6),
                           taper=(0.01, 0.1), dry=0.3 if rng.random() < 0.5 else 0.0, dry_len=0.25)
            else:
                ln = (x1 - x0) * rng.uniform(0.6, 0.95)
                cx = x0 + ln / 2 + rng.uniform(0, (x1 - x0) - ln)
                wd = (y1 - y0) * rng.uniform(0.55, 0.9)
                brush.mark(p2, cx, (y0 + y1) / 2, ln, wd, rng.normal(0, 1), jitter(c, rng, 0.003),
                           rng.uniform(0.5, 0.75), soft=(0.6, 0.6), taper=(0.03, 0.12),
                           dry=0.3 if rng.random() < 0.5 else 0.0, dry_len=0.25)
        floors = [(120.0, FAC_BANDS[0]), (FAC_BANDS[0] + 9.6, FAC_BANDS[1]), (FAC_BANDS[1] + 9.6, FAC_BANDS[2])]
        pier_x = [(FAC_CORNER, FAC_COLS[0] - 30)] + [(FAC_COLS[i] + 30, FAC_COLS[i + 1] - 30) for i in range(3)] + \
                 [(FAC_COLS[3] + 30, 552.0)]
        for (fy0, fy1) in floors:                                             # each pier: one deliberate stroke
            for (px0, px1) in pier_x:
                if rng.random() < 0.8:
                    panel_stroke(px0, px1, fy0, fy1, C['front_top'] if fy0 < 380 else C['front_low'])
        for (t0, b0) in FAC_ROWS:                                             # each spandrel: one, half the time
            band_y = min([bb for bb in FAC_BANDS + [FAC_GROUND] if bb > b0])
            for c in FAC_COLS:
                if rng.random() < 0.5:
                    panel_stroke(c - 28, c + 28, b0 + 11, band_y - 1, C['front_top'] if b0 < 380 else C['front_low'],
                                 vertical=False)
        for _ in range(3):                                                     # the corner: the form turns, warm
            y = rng.uniform(140, 600)
            brush.mark(p2, FAC_CORNER + rng.uniform(5, 14), y, rng.uniform(40, 110), rng.uniform(8, 16), 90,
                       lighter(C['front_low'], rng.uniform(0.12, 0.2), 'terracotta'), rng.uniform(0.5, 0.7),
                       soft=(0.6, 0.6), taper=(0.02, 0.15))
        for _ in range(4):                                                     # the plinth: level strokes
            y = rng.uniform(631, 646)
            x = rng.uniform(FAC_CORNER, FAC_RIGHT - 60)
            brush.mark(p2, x + 40, y, rng.uniform(50, 120), rng.uniform(5, 9), rng.normal(0, 0.5),
                       lighter(C['plinth'], rng.uniform(0.08, 0.16), 'lilac'), rng.uniform(0.45, 0.7),
                       soft=(0.6, 0.6), taper=(0.04, 0.15), dry=0.4)
        for _ in range(5):                                                     # cool patches: the sky's lilac, high
            x, y = sample_by(m_fbrick * (yy < 400) * (1 - np.exp(-inside_dist(m_fbrick) / 6.0)), 1, rng)
            if len(x):
                brush.mark(p2, x[0], y[0], rng.uniform(18, 46), rng.uniform(10, 22), 90,
                           mix(C['front_top'], PAL['lilac'], rng.uniform(0.35, 0.5)), rng.uniform(0.55, 0.8),
                           soft=(0.6, 0.6), taper=(0.02, 0.05))
        for _ in range(4):                                                     # warm repairs: newer brick, low
            x, y = sample_by(m_fbrick * (yy > 420), 1, rng)
            if len(x):
                brush.mark(p2, x[0], y[0], rng.uniform(14, 34), rng.uniform(10, 26), 0,
                           mix(C['front_low'], PAL['terracotta'], rng.uniform(0.35, 0.55)), rng.uniform(0.5, 0.75),
                           soft=(0.6, 0.6), taper=(0.02, 0.05))
        p2.blur(0.5).clip(np.clip(m_fbrick + m_plinth_f, 0, 1))
        cv.over(p2)
        p2s = Layer(H, W)
        for (fy0, fy1) in [(120.0, FAC_BANDS[0]), (FAC_BANDS[0] + 8, FAC_BANDS[1]), (FAC_BANDS[1] + 8, FAC_BANDS[2]),
                           (FAC_BANDS[2] + 8, 626.0)]:
            for (u0_, u1_) in ((0.04, 0.37), (0.67, 0.97)):                    # the two bays beside the window
                if rng.random() < 0.85:
                    r = rng.random()
                    c = lighter(C['side'], rng.uniform(0.2, 0.32)) if r < 0.5 else \
                        darker(C['side'], rng.uniform(0.12, 0.2), 'terracotta')
                    ua, ub = sorted(rng.uniform(u0_, u1_, 2))
                    ub = max(ub, ua + 0.12)
                    pa, pb_ = fac_side_pt(ua, fy0), fac_side_pt(ub, fy0)
                    ln = (fy1 - fy0) * rng.uniform(0.5, 0.95)
                    yc = (pa[1] + pb_[1]) / 2 + ln / 2 + rng.uniform(0, (fy1 - fy0) - ln)
                    brush.mark(p2s, (pa[0] + pb_[0]) / 2, yc, ln, abs(pb_[0] - pa[0]), 90, jitter(c, rng, 0.003),
                               rng.uniform(0.5, 0.75), soft=(0.6, 0.6), taper=(0.02, 0.12),
                               dry=0.3 if rng.random() < 0.5 else 0.0, dry_len=0.25)
        p2s.blur(0.5).clip(m_sbrick)
        cv.over(p2s)
        # P2b: brick suggested, never rendered: patches of courses laid IN THE FACE'S OWN PLANE (the side face's
        # courses run to its vanishing point), strong in the raking sun, faint in the shade
        side_w = 280.0                                                         # the side face's true width (px)

        def side_map(fx, fy):
            return fac_side_pt(fx / side_w, fy)

        for region, base, n_p, amp, crs, blen, fmap in (
                (m_sbrick, C['side'], 12, (0.16, 0.28), 3.0, 7.5, 'side'),
                (m_fbrick * np.exp(-inside_dist(m_fbrick) / 18.0), None, 7, (0.12, 0.18), 2.8, 7.0, 'front')):
            pb = Layer(H, W)
            cxs, cys = sample_by(region, n_p, rng)
            for pcx, pcy in zip(cxs, cys):
                if fmap == 'side':                                             # back to face coordinates
                    u = (pcx - FAC_FAR) / (FAC_CORNER - FAC_FAR)
                    f = (pcx - FAC_VP[0]) / (FAC_CORNER - FAC_VP[0])
                    pcx, pcy = u * side_w, FAC_HZ + (pcy - FAC_HZ) / f
                pw, ph = rng.uniform(30, 64), rng.uniform(12, 27)
                b0 = base if base is not None else (C['front_top'] if pcy < 380 else C['front_low'])
                y = pcy - ph / 2
                row = 0
                if fmap == 'side':
                    # foreshortened, the head joints vanish: what reads is the COURSES, thin lines to the VP,
                    # lit tops and shadowed joints alternating, patchy
                    while y < pcy + ph / 2:
                        dyn = (y - pcy) / (ph / 2)
                        half = pw / 2 * np.sqrt(max(0.0, 1 - dyn * dyn)) * rng.uniform(0.5, 1.0)
                        if half > 4 and rng.random() < 0.8:
                            xa = pcx - half + rng.uniform(-4, 4)
                            c = lighter(b0, rng.uniform(*amp)) if rng.random() < 0.55 else \
                                darker(b0, rng.uniform(*amp) * 0.8, 'terracotta')
                            brush.line(pb, side_map(xa, y), side_map(xa + 2 * half, y), 1.0, c,
                                       rng.uniform(0.45, 0.65), soft=(0.4, 0.4), taper=(0.15, 0.15))
                        y += crs
                    continue
                while y < pcy + ph / 2:
                    x = pcx - pw / 2 + (blen / 2 if row % 2 else 0) - blen
                    while x < pcx + pw / 2:
                        dxn, dyn = (x - pcx) / (pw / 2), (y - pcy) / (ph / 2)
                        if rng.random() < 0.62 * (1 - min(1.0, dxn * dxn + dyn * dyn)):  # the patch fades out
                            c = lighter(b0, rng.uniform(*amp)) if rng.random() < 0.5 else \
                                darker(b0, rng.uniform(*amp) * 0.8, 'terracotta')
                            a_, b_ = (x + 0.6, y + crs / 2), (x + blen - 0.6, y + crs / 2)
                            if fmap == 'side':
                                a_, b_ = side_map(*a_), side_map(*b_)
                            brush.line(pb, a_, b_, crs - 0.9, c, rng.uniform(0.45, 0.7), soft=(0.4, 0.4),
                                       taper=(0.02, 0.02))
                        x += blen
                    y += crs
                    row += 1
            pb.clip(region)
            cv.over(pb)
        if keep is not None:
            keep['P2'] = cv.image()
    # ---- P3: the crisp light accents, last and few ----
    if passes >= 3:
        p3 = Layer(H, W)
        gl = PAL['glow']
        bar = mix(C['deep'], C['glass'], 0.4)
        # the corner arris: the lit face's edge catches the most light; the cornice's sunward end and top on the side
        brush.line(p3, (FAC_CORNER - 0.9, 120), (FAC_CORNER - 0.9, 628), 1.6, mix(C['side'], gl, 0.55), 0.85,
                   soft=(0.45, 0.45), taper=(0.0, 0.0))
        brush.line(p3, fac_side_pt(0.0, FAC_TOP + 1.0), fac_side_pt(1.0, FAC_TOP + 1.0), 2.0, gl, 0.9,
                   soft=(0.45, 0.45), taper=(0.0, 0.0))
        for b in FAC_BANDS:
            brush.line(p3, fac_side_pt(0.0, b + 0.8), fac_side_pt(1.0, b + 0.8), 1.4, gl, 0.8, soft=(0.45, 0.45),
                       taper=(0.0, 0.0))
        # slivers on every front-face edge that looks left, toward the sun: reveals, arch jambs, the pipe
        for (x0, t0, x1, b0) in wins:
            brush.line(p3, (x1 - 6.0, t0 + 4), (x1 - 6.0, b0), 1.2, mix(C['reveal'], gl, 0.6), 0.75, soft=(0.45, 0.45),
                       taper=(0.0, 0.0))
        for c in FAC_ARCHES:
            brush.line(p3, (c + 40 - 7.0, 592), (c + 40 - 7.0, FAC_GROUND), 1.4, mix(C['reveal'], gl, 0.6), 0.75,
                       soft=(0.45, 0.45), taper=(0.0, 0.0))
        brush.line(p3, (553.6, 118), (553.6, FAC_GROUND - 2), 1.2, mix(C['pipe'], gl, 0.55), 0.8, soft=(0.45, 0.45),
                   taper=(0.0, 0.0))
        for yb in range(160, 640, 120):                                         # pipe brackets
            brush.line(p3, (551.5, yb), (561, yb), 2.0, C['deep'], 0.9, soft=(0.45, 0.45), taper=(0.0, 0.0))
        # the stone's lower edges seen from below: a thin bright lip where a band's face meets its shadow
        for b in FAC_BANDS:
            brush.line(p3, (FAC_CORNER, b + 7.2), (FAC_RIGHT, b + 7.2), 1.0, mix(C['stone_sh'], PAL['cream'], 0.5),
                       0.6, soft=(0.45, 0.45), taper=(0.0, 0.0))
        # glazing bars: thin dark lines in the window's own deep (CRAFT: lines only on things that are lines)
        for idx, (x0, t0, x1, b0) in enumerate(wins):
            xm = (x0 + x1 - 6) / 2
            lit = idx in lit_ids
            bc = mix(C['lamp_low'], C['deep'], 0.55) if lit else bar
            brush.line(p3, (xm, t0 + 4), (xm, b0), 1.5, bc, 0.7, soft=(0.45, 0.45), taper=(0.0, 0.0))
            ym = t0 + (b0 - t0) * 0.5
            brush.line(p3, (x0, ym), (x1 - 6, ym), 2.2, bc, 0.75, soft=(0.45, 0.45), taper=(0.0, 0.0))
        for poly in s_wins:                                                      # side windows: a bar and a rail
            (ax, ay), (bx, by), (cx_, cy_), (dx, dy) = poly
            brush.line(p3, ((ax + bx) / 2, (ay + by) / 2), ((dx + cx_) / 2, (dy + cy_) / 2), 1.3, bar, 0.85,
                       soft=(0.45, 0.45), taper=(0.0, 0.0))
            brush.line(p3, (ax, (ay + dy) / 2), (bx, (by + cy_) / 2), 2.0, bar, 0.85, soft=(0.45, 0.45),
                       taper=(0.0, 0.0))
        p3.clip(m_bldg)
        cv.over(p3)
        if keep is not None:
            keep['P3'] = cv.image()
    # ---- P4: the weather (stains run down from sills, soot from the cornice, splash at the base) and speckle ----
    if passes >= 4:
        p4 = Layer(H, W)                                                        # the front face's weather
        p4s = Layer(H, W)                                                       # the side face's weather
        for (x0, t0, x1, b0) in wins:
            for _ in range(int(rng.integers(1, 3))):
                sx = rng.choice([x0 - 2, x1 + 2, (x0 + x1) / 2]) + rng.uniform(-3, 3)
                b0_ = C['front_top'] if b0 < 380 else C['front_low']
                brush.line(p4, (sx, b0 + 10), (sx + rng.uniform(-1, 1), b0 + 10 + rng.uniform(24, 70)),
                           rng.uniform(3, 7), darker(b0_, 0.42), rng.uniform(0.25, 0.4), soft=(1.2, 1.2),
                           taper=(0.0, 0.7), dry=0.5, dry_len=0.5)
        for _ in range(7):
            sx = rng.uniform(FAC_CORNER + 10, FAC_RIGHT - 20)
            brush.line(p4, (sx, 121), (sx, 121 + rng.uniform(50, 160)), rng.uniform(5, 12), darker(C['front_top'], 0.4),
                       rng.uniform(0.14, 0.22), soft=(2.5, 2.5), taper=(0.0, 0.8), dry=0.45, dry_len=0.6)
        for _ in range(14):
            sx, sy = rng.uniform(FAC_CORNER - 30, FAC_RIGHT), rng.uniform(612, 630)
            brush.line(p4, (sx, sy), (sx + rng.uniform(25, 80), sy + rng.uniform(-1.5, 1.5)), rng.uniform(5, 11),
                       darker(C['front_low'], 0.35), rng.uniform(0.2, 0.38), soft=(2.5, 1.0), taper=(0.1, 0.2),
                       dry=0.4, edge_dry=0.55)
        for _ in range(6):
            u = rng.uniform(0.0, 0.85)
            a_, b_ = fac_side_pt(u, rng.uniform(612, 628)), fac_side_pt(min(u + rng.uniform(0.15, 0.3), 1.0), 620)
            brush.line(p4s, a_, (b_[0], a_[1] + (b_[1] - a_[1]) * 0.3), rng.uniform(5, 10),
                       darker(C['side'], 0.3, 'terracotta'), rng.uniform(0.2, 0.35), soft=(2.5, 1.0), taper=(0.1, 0.2),
                       dry=0.4, edge_dry=0.55)
        for (x0, t0, x1, b0) in wins:                                          # a few hard soot drips (p02's rust)
            if rng.random() < 0.3:
                sx = rng.uniform(x0, x1)
                brush.line(p4, (sx, b0 + 9.6), (sx, b0 + 9.6 + rng.uniform(28, 80)), rng.uniform(2.0, 3.2),
                           darker(C['front_low'], 0.5), rng.uniform(0.45, 0.6), soft=(0.5, 0.5), taper=(0.0, 0.3))
        for _ in range(14):                                                     # pale chips on the lit side (p02)
            x, y = sample_by(m_sbrick * (0.3 + (yy > 420)), 1, rng)
            if len(x):
                brush.mark(p4s, x[0], y[0], rng.uniform(8, 26), rng.uniform(3, 7), 90, lighter(C['side'], 0.5, 'cream'),
                           rng.uniform(0.45, 0.7), soft=(0.5, 0.5))
        p4s.clip(np.clip(m_sbrick + m_s_plinth, 0, 1))
        cv.over(p4s)
        p4.clip(np.clip(m_fbrick + m_plinth_f, 0, 1))
        cv.over(p4)
        gl_ = grain(H, W, m_sbrick + m_s_plinth, 85, (0.45, 0.9), (2.5, 4.0), rng, light_share=0.6)
        gs_ = grain(H, W, m_fbrick + m_plinth_f + stone_f, 32, (0.45, 0.8), (1.5, 2.5), rng, light_share=0.5)
        apply_dl(cv, gl_ + gs_)
    # ---- the base meets the ground: a dark contact line, crisp; the wedge's edge softer away from the corner ----
    cs = Layer(H, W)
    brush.line(cs, (FAC_CORNER, FAC_GROUND + 1.0), (FAC_RIGHT, FAC_GROUND + 1.0), 3.0, mix(C['ground_sh'], PAL['plum'],
               0.6), 0.8, soft=(0.5, 3.0), taper=(0.0, 0.0))
    a_, b_ = fac_side_pt(0, FAC_GROUND), fac_side_pt(1, FAC_GROUND)
    brush.line(cs, (a_[0], a_[1] + 1), (b_[0], b_[1] + 1), 2.4, mix(C['ground_lit'], PAL['plum'], 0.5), 0.7,
               soft=(0.5, 2.5), taper=(0.0, 0.0))
    cs.clip(m_gr * (1 - m_bldg))
    cv.over(cs)
    if keep is not None:
        keep['final'] = cv.image()
    return cv


# ----------------------------------------------------------------------------------------------------------------
# 7. ELEMENT 3: brick and stone surfaces up close (recipe 4.3)
# ----------------------------------------------------------------------------------------------------------------


def brick_courses(layer, brush, rng, box, course, blen, base, amp, coverage, patch_cell=60.0, mortar=None,
                  lit_tops=0.0, lit_col=None):
    """Brick SUGGESTED by flat dabs on a frontal wall: running bond, `course` px per course (joint 1.2-1.6 px),
    `blen` px per brick; each brick a flat dab of its own value (+-amp as an OKLab mix toward the light or the shade
    family); a smooth patch field sets where bricks show at all (coverage 0-1), so most of the wall stays calm; an
    optional lit top arris on a share of the bricks (raking sun)."""
    x0, y0, x1, y1 = box
    h, w = layer.h, layer.w
    field = smooth(0.5 + 0.5 * value_noise(h, w, patch_cell, rng) * 0.9 + (coverage - 0.5))
    joint = max(1.2, course * 0.16)
    y = y0
    row = 0
    while y < y1:
        x = x0 - (blen / 2 if row % 2 else 0)
        while x < x1:
            cxi, cyi = int(np.clip(x + blen / 2, 0, w - 1)), int(np.clip(y + course / 2, 0, h - 1))
            if rng.random() < field[cyi, cxi]:
                r = rng.random()
                if r < 0.45:
                    c = lighter(base, rng.uniform(*amp))
                elif r < 0.85:
                    c = darker(base, rng.uniform(*amp), 'terracotta')
                else:
                    c = darker(base, rng.uniform(amp[1], amp[1] * 1.6), 'plum')          # a burnt header
                brush.line(layer, (x + joint / 2, y + (course - joint) / 2), (x + blen - joint / 2,
                           y + (course - joint) / 2), course - joint, jitter(c, rng, 0.004), rng.uniform(0.55, 0.85),
                           soft=(0.45, 0.45), taper=(0.01, 0.01))
                if lit_tops and rng.random() < lit_tops:
                    brush.line(layer, (x + joint, y + 0.6), (x + blen * rng.uniform(0.4, 0.95), y + 0.6), 1.0,
                               lit_col, rng.uniform(0.5, 0.8), soft=(0.4, 0.4), taper=(0.05, 0.3))
            x += blen
        y += course
        row += 1


def chip_marks(layer, brush, rng, weight, n, col_fn, size=((6, 22), (10, 60)), opacity=(0.55, 0.85)):
    """p02's blocky chips: upright square-ended flat marks, some stepped (a second smaller block on one side)."""
    xs, ys = sample_by(weight, n, rng)
    for x, y in zip(xs, ys):
        wd, ln = rng.uniform(*size[0]), rng.uniform(*size[1])
        c = col_fn(rng)
        brush.mark(layer, x, y, ln, wd, 90, c, rng.uniform(*opacity), soft=(0.45, 0.45), taper=(0.01, 0.01))
        if rng.random() < 0.45:                                                     # stepped: an L-shaped chip
            side_ = 1 if rng.random() < 0.5 else -1
            brush.mark(layer, x + side_ * wd * 0.75, y + ln * rng.uniform(-0.3, 0.3), ln * rng.uniform(0.3, 0.6),
                       wd * rng.uniform(0.4, 0.8), 90, c, rng.uniform(*opacity), soft=(0.45, 0.45), taper=(0.01, 0.01))


def paint_brick_tiles(T=240, seed=None):
    """Four close-up tiles (each T x T px at film scale, a near wall about 1.7 m across): A stock brick in the raking
    sun, B stock brick in shade with a window's lit reveal and sill, C a stone cornice (its sunlit return and its shaded
    front, seen from below) over ashlar, D chipped, rust-stained render (the p02 lighthouse method in our palette)."""
    C = fac_colours()
    out = {}
    yy, xx = np.mgrid[0:T, 0:T].astype(np.float32)
    # ---- A: stock brick in the raking sun ----
    rng = rng_for('tile/brick_sun', seed)
    brush = Brush(rng)
    cv = Canvas(T, T)
    base = C['side']
    g = smooth((xx + yy * 0.5) / (1.5 * T))[..., None]
    cv.c[:] = (lighter(base, 0.18) * (1 - g) + darker(base, 0.06, 'terracotta') * g).astype(np.float32)
    p1 = Layer(T, T)
    for _ in range(4):
        x, y = rng.uniform(0, T, 2)
        c = lighter(base, rng.uniform(0.12, 0.2)) if rng.random() < 0.5 else darker(base, rng.uniform(0.1, 0.16),
                                                                                       'terracotta')
        brush.line(p1, (x, y - 90), (x + rng.uniform(-10, 10), y + 90), rng.uniform(60, 100), c, 0.5, soft=(14, 14),
                   taper=(0.25, 0.25))
    p1.blur(6.0)
    cv.over(p1)
    pb = Layer(T, T)
    brick_courses(pb, brush, rng, (-30, -4, T + 30, T + 10), 9.0, 26.0, base, (0.12, 0.24), 0.62, patch_cell=70.0,
                  lit_tops=0.18, lit_col=mix(base, PAL['glow'], 0.7))
    pb.blur(0.4)
    cv.over(pb)
    p4 = Layer(T, T)
    brush.line(p4, (150, 0), (152, 150), 14, darker(base, 0.3, 'plum'), 0.14, soft=(3, 3), taper=(0.0, 0.8), dry=0.5,
               dry_len=0.6)
    cv.over(p4)
    apply_dl(cv, grain(T, T, np.ones((T, T), np.float32), 110, (0.45, 0.95), (2.5, 4.5), rng, 0.6))
    out['A'] = cv
    # ---- B: stock brick in shade, a window's lit reveal, its stone sill and a stain below ----
    rng = rng_for('tile/brick_shade', seed)
    brush = Brush(rng)
    cv = Canvas(T, T)
    t = smooth(yy / T)[..., None]
    wall = C['front_top'] * (1 - t) + C['front_low'] * t
    cv.c[:] = wall.astype(np.float32)
    p1 = Layer(T, T)
    for _ in range(3):
        x, y = rng.uniform(0, 140), rng.uniform(0, T)
        c = mix(C['front_top'], PAL['lilac'], 0.2) if rng.random() < 0.5 else darker(C['front_low'], 0.12)
        brush.line(p1, (x, y - 90), (x, y + 90), rng.uniform(50, 90), c, 0.5, soft=(14, 14), taper=(0.25, 0.25))
    p1.blur(6.0)
    cv.over(p1)
    pb = Layer(T, T)
    brick_courses(pb, brush, rng, (-30, -4, T + 30, T + 10), 9.0, 26.0, C['front_low'], (0.07, 0.13), 0.5,
                  patch_cell=60.0)
    pb.blur(0.4)
    m_open = poly_mask(T, T, [rect(150, 0, T, 150)])
    pb.clip(1 - m_open)
    cv.over(pb)
    d = Layer(T, T)
    d.fill(poly_mask(T, T, [rect(150, 0, T, 150)]), C['glass'])
    f = smooth((yy - 60 - (xx - 150) * 0.25) / 2.5 + 0.5)[..., None]
    d.fill(poly_mask(T, T, [rect(168, 0, T, 150)]), (C['glass_sky'] * (1 - f) + C['glass'] * f).astype(np.float32))
    d.fill(poly_mask(T, T, [rect(150, 0, 168, 150)]), C['reveal'])                    # the reveal faces the sun
    d.fill(poly_mask(T, T, [rect(140, 150, T, 166)]), C['stone_sh'])                  # the sill's front face
    d.fill(poly_mask(T, T, [rect(140, 166, T, 169)]), C['deep'])                      # its underside (from below)
    cv.over(d)
    p3 = Layer(T, T)
    brush.line(p3, (150.6, 0), (150.6, 150), 1.3, mix(C['reveal'], PAL['glow'], 0.6), 0.8, soft=(0.45, 0.45),
               taper=(0, 0))
    brush.line(p3, (204, 0), (204, 150), 2.2, mix(C['deep'], C['glass'], 0.4), 0.75, soft=(0.45, 0.45), taper=(0, 0))
    brush.line(p3, (168, 92), (T, 92), 3.0, mix(C['deep'], C['glass'], 0.4), 0.8, soft=(0.45, 0.45), taper=(0, 0))
    brush.line(p3, (140, 150.6), (T, 150.6), 1.2, mix(C['stone_sh'], PAL['cream'], 0.6), 0.7, soft=(0.45, 0.45),
               taper=(0, 0))
    cv.over(p3)
    p4 = Layer(T, T)
    for sx in (152, 188, 226):
        brush.line(p4, (sx + rng.uniform(-3, 3), 170), (sx, 170 + rng.uniform(30, 66)), rng.uniform(4, 8),
                   darker(C['front_low'], 0.45), rng.uniform(0.28, 0.4), soft=(1.2, 1.2), taper=(0.0, 0.7), dry=0.5,
                   dry_len=0.5)
    brush.line(p4, (172, 169), (172, 225), 2.4, darker(C['front_low'], 0.55), 0.5, soft=(0.5, 0.5), taper=(0, 0.3))
    p4.clip(1 - m_open)
    cv.over(p4)
    apply_dl(cv, grain(T, T, (1 - m_open), 40, (0.45, 0.85), (1.5, 2.5), rng, 0.5))
    out['B'] = cv
    # ---- C: a stone cornice seen from below (a sunlit return on the left, the shaded front) over ashlar ----
    rng = rng_for('tile/stone', seed)
    brush = Brush(rng)
    cv = Canvas(T, T)
    cv.c[:] = sky_backdrop(T, T, 300, 560, disc=False)
    ret = 58.0                                                     # the return (the cornice's end, facing the sun)
    lay = Layer(T, T)
    lay.fill(poly_mask(T, T, [rect(ret, 40, T, 70)]), C['stone_sh'])                 # the corona's front
    lay.fill(poly_mask(T, T, [[(0, 52), (ret, 40), (ret, 70), (0, 76)]]), C['stone_lit'])  # its return, sunlit
    lay.fill(poly_mask(T, T, [rect(ret, 70, T, 92)]), C['deep'])                     # the soffit, seen from below
    lay.fill(poly_mask(T, T, [[(0, 76), (ret, 70), (ret, 92), (0, 96)]]), mix(C['stone_lit'], C['deep'], 0.5))
    for k_ in range(9):                                                               # modillions under the soffit
        mx = ret + 10 + k_ * 21
        lay.fill(poly_mask(T, T, [rect(mx, 70, mx + 9, 90)]), mix(C['stone_sh'], C['deep'], 0.35))
    ash = poly_mask(T, T, [rect(ret, 92, T, T), [(0, 96), (ret, 92), (ret, T), (0, T)]])
    lay.fill(poly_mask(T, T, [rect(ret, 92, T, T)]), mix(C['stone_sh'], C['front_top'], 0.25))
    lay.fill(poly_mask(T, T, [[(0, 96), (ret, 92), (ret, T), (0, T)]]), mix(C['stone_lit'], C['side'], 0.35))
    cv.over(lay)
    p2 = Layer(T, T)
    for row, yb in enumerate(range(92, T, 28)):                                       # ashlar: big flat blocks
        x = ret - (30 if row % 2 else 0)
        while x < T:
            c = jitter(shift(mix(C['stone_sh'], C['front_top'], 0.25), rng.normal(0, 0.018)), rng, 0.004)
            brush.mark(p2, x + 31, yb + 13.6, 60.0, 25.6, 0, c, rng.uniform(0.6, 0.85), soft=(0.45, 0.45),
                       taper=(0.005, 0.005))
            x += 62
    for k_ in range(3):                                                               # the corona: level strokes
        brush.mark(p2, rng.uniform(100, 200), rng.uniform(46, 64), rng.uniform(60, 140), rng.uniform(6, 12), 0,
                   lighter(C['stone_sh'], 0.12, 'cream') if k_ % 2 else darker(C['stone_sh'], 0.1, 'slate'),
                   rng.uniform(0.5, 0.7), soft=(0.5, 0.5), taper=(0.03, 0.15), dry=0.4)
    p2.clip(poly_mask(T, T, [rect(ret, 40, T, 70), rect(ret, 92, T, T)]))
    cv.over(p2)
    p3 = Layer(T, T)
    brush.line(p3, (ret, 40.8), (T, 40.8), 1.2, mix(C['stone_sh'], PAL['cream'], 0.5), 0.6, soft=(0.45, 0.45),
               taper=(0, 0))
    brush.line(p3, (0, 52.8), (ret, 40.8), 2.0, PAL['glow'], 0.9, soft=(0.45, 0.45), taper=(0, 0))
    brush.line(p3, (ret - 0.8, 41), (ret - 0.8, 70), 1.6, mix(C['stone_lit'], PAL['glow'], 0.6), 0.8,
               soft=(0.45, 0.45), taper=(0, 0))
    cv.over(p3)
    p4 = Layer(T, T)
    for _ in range(6):                                                                # soot runs from the soffit
        sx = rng.uniform(ret + 6, T - 6)
        brush.line(p4, (sx, 93), (sx, 93 + rng.uniform(40, 130)), rng.uniform(5, 12),
                   darker(C['stone_sh'], 0.35, 'slate'), rng.uniform(0.12, 0.22), soft=(2.5, 2.5), taper=(0.0, 0.8),
                   dry=0.45, dry_len=0.6)
    p4.clip(ash)
    cv.over(p4)
    apply_dl(cv, grain(T, T, ash + poly_mask(T, T, [rect(0, 40, T, 70)]), 60, (0.45, 0.9), (1.5, 3.0), rng, 0.55))
    out['C'] = cv
    # ---- D: chipped, rust-stained render, lit left and shaded right (the p02 lighthouse method, our palette) ----
    rng = rng_for('tile/render', seed)
    brush = Brush(rng)
    cv = Canvas(T, T)
    lit_r = mix(PAL['granite'], PAL['sand'], 0.4)                     # L~73 render in the sun
    sh_r = mix(PAL['slate'], PAL['mauve'], 0.3)                       # L~47 the same in shade
    term = smooth((xx - 120) / 40.0)[..., None]                       # a soft terminator band (the wall turns)
    cv.c[:] = (lit_r * (1 - term) + sh_r * term).astype(np.float32)
    p1 = Layer(T, T)
    for x in (95.0, 130.0, 160.0):                                    # the terminator painted as vertical bands
        brush.mark(p1, x, 120, 260, rng.uniform(16, 26), 90, mix(lit_r, sh_r, (x - 80) / 100.0), 0.6, soft=(1, 1))
    p1.blur(1.2)
    cv.over(p1)
    rust = mix(PAL['terracotta'], PAL['plum'], 0.45)                  # L~42 warm rust/dirt
    p2 = Layer(T, T)
    chip_marks(p2, brush, rng, ((xx < 120) * 1.0 + 0.25) * (np.abs(yy - 90) < 70), 16,
               lambda r: lighter(lit_r, r.uniform(0.35, 0.6), 'cream'))
    chip_marks(p2, brush, rng, (xx > 130) * 1.0 * (np.abs(yy - 120) < 100), 10,
               lambda r: mix(sh_r, lit_r, r.uniform(0.3, 0.5)), size=((4, 12), (8, 40)))
    p2.blur(0.3)
    cv.over(p2)
    p3 = Layer(T, T)
    brush.line(p3, (-5, 150), (T + 5, 152), 12, rust, 0.75, soft=(0.6, 2.5), taper=(0, 0), edge_dry=0.35)
    for _ in range(9):                                                # drips run down from the band, hard-edged
        sx = rng.uniform(5, T - 5)
        brush.line(p3, (sx, 152), (sx + rng.uniform(-1, 1), 152 + rng.uniform(14, 80)), rng.uniform(2.5, 6.0), rust,
                   rng.uniform(0.6, 0.85), soft=(0.5, 0.5), taper=(0.0, 0.35))
    brush.line(p3, (-5, 60), (T + 5, 60), 1.4, mix(sh_r, PAL['ink'], 0.4), 0.6, soft=(0.45, 0.45), taper=(0, 0))
    cv.over(p3)
    spk_l = grain(T, T, (xx > 120).astype(np.float32) + 0.3, 70, (0.5, 1.1), (6.0, 12.0), rng, light_share=0.85)
    spk_d = grain(T, T, (xx < 120).astype(np.float32), 50, (0.45, 0.9), (3.0, 6.0), rng, light_share=0.2)
    apply_dl(cv, spk_l + spk_d)
    out['D'] = cv
    return out
