#!/usr/bin/env python3
"""Painted-piece recipe proof: buildings, ground and far city.

Paints five swatches at film scale (px of the 1080 x 1920 frame) and lays each one beside the reference crops that
show it:
  1 the far city as layered atmospheric haze (4 planes, counter-light at dusk),
  2 a brick facade: a lit face and a shade face, windows as value shapes, weathering,
  3 brick and stone close-ups,
  4 paving receding in perspective (a texture gradient, cast shadows),
  5 smooth boulders and faceted rocks.
The recipe is video/docs/look/paint_recipes/built_ground.md. Standalone: numpy, PIL, scipy, skimage. Seeded: the same
seed gives the same bytes.

  python3 video/scripts/look/paint/recipes/built_ground.py [--out PATH] [--check] [--only NAME] [--seed N]

The method, for every element: DESIGN flat shapes in a limited palette lit by one light (P0), then BRUSH them in
passes from big, soft and blurred to small and crisp (P1 underpainting, P2 block-in, P3 light accents, P4 texture),
then convert the whole plane for its depth (toward the air, less chroma, a little softer).
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


def jitter(c, rng, dl=0.008, dab=0.003):
    """A per-stroke colour wobble: the same swatch never lands twice exactly the same."""
    return shift(c, rng.normal(0, dl), rng.normal(0, dab), rng.normal(0, dab))


# The family palette for the dusk scene (an October canal evening, a low sun on the left). 14 swatches, set by CIELAB
# targets (the recipe's section 2.1). Every stroke takes one, or an OKLab mix of two neighbours.
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

# ----------------------------------------------------------------------------------------------------------------
# 2. Determinism, noise, masks
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
        self.put(0, 0, mask.astype(np.float32), rgb)

    def blur(self, sigma):
        if sigma and sigma > 0.05:
            self.c = ndi.gaussian_filter(self.c, (sigma, sigma, 0)).astype(np.float32)
            self.a = ndi.gaussian_filter(self.a, sigma).astype(np.float32)
        return self

    def clip(self, mask):
        self.c *= mask[..., None]
        self.a *= mask
        return self


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
            # the paint thins along the stroke: the tail drifts by `drift` in OKLab L
            end = shift(rgb, drift)
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
    """Speckle as an OKLab-L delta field: `density` specks per 100 x 100 px of the mask, radius r_range px, value
    shift dl_range (in L* units, applied +/-), light_share of them lighter. Place only where the recipe says."""
    area = float(mask.sum())
    n = int(rng.poisson(density * area / 1e4)) if area > 0 else 0
    if n == 0:
        return np.zeros((h, w), np.float32)
    p = (mask / area).ravel().astype(np.float64)
    p /= p.sum()
    idx = rng.choice(mask.size, n, p=p)
    ys, xs = np.unravel_index(idx, mask.shape)
    xs = xs + rng.uniform(0, 1, n)
    ys = ys + rng.uniform(0, 1, n)
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


# ----------------------------------------------------------------------------------------------------------------
# 4. Shared backdrop: the dusk sky (the sky family's stops), used behind the far city and the facade
# ----------------------------------------------------------------------------------------------------------------
SKY_STOPS = [(0, 'zenith'), (317, 'field'), (556, 'field'), (655, 'rose'), (738, 'band'), (792, 'horizon')]
HORIZON_Y = 792          # frame y of the horizon
SUN = (196.0, 779.0)     # frame position of the sun's centre (low, on the left)


def sky_backdrop(h, w, frame_y0, frame_x0=0):
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
    r = np.hypot(xx - SUN[0], yy - SUN[1])
    disc = np.clip(31.0 + 0.5 - r, 0, 1)[..., None]
    return (rgb * (1 - disc) + SKY['sun'] * disc).astype(np.float32)


# ----------------------------------------------------------------------------------------------------------------
# 5. ELEMENT 1: the far city as layered atmospheric haze
# ----------------------------------------------------------------------------------------------------------------
# Plane ladder (recipe 3.5 / 2.5): k = share of the way to the air, chroma = chroma kept, blur = plane sigma (px),
# sliver = lit-edge width (px) on the edges that face the sun, windows = share of blocks with lit windows.
FAR_PLANES = [  # far -> near
    dict(name='p4', k=0.86, chroma=0.35, blur=1.2, sliver=0.0, windows=0.0, strokes=0, top=(4, 24), w=(10, 34),
         tower=(0.10, 6, 12, 26, 62), base=HORIZON_Y + 6),
    dict(name='p3', k=0.68, chroma=0.50, blur=0.8, sliver=1.0, windows=0.0, strokes=0, top=(14, 52), w=(16, 52),
         tower=(0.14, 12, 22, 70, 130), base=HORIZON_Y + 22),
    dict(name='p2', k=0.45, chroma=0.65, blur=0.45, sliver=1.8, windows=0.25, strokes=2, top=(-4, 70), w=(26, 70),
         tower=(0.10, 30, 46, 150, 190), base=HORIZON_Y + 60, gable=0.45),
    dict(name='p1', k=0.22, chroma=0.85, blur=0.2, sliver=2.6, windows=0.45, strokes=3, top=(-70, 30), w=(46, 120),
         tower=(0.06, 36, 54, 120, 170), base=HORIZON_Y + 140, gable=0.6, chimneys=True),
]


def skyline(rng, w, spec, x_from=-20):
    """Blocks for one plane: flat tops, gables, towers, chimneys. Returns [(poly, (x0, x1, top_y, kind))]."""
    out = []
    x = x_from
    while x < w + 20:
        bw = rng.uniform(*spec['w'])
        p_tower, tw0, tw1, th0, th1 = spec['tower']
        if rng.random() < p_tower:
            tw = rng.uniform(tw0, tw1)
            top = HORIZON_Y - rng.uniform(th0, th1)
            out.append((rect(x, top, x + tw, spec['base'] + 400), (x, x + tw, top, 'tower')))
            x += tw * rng.uniform(0.6, 1.0)
            continue
        top = HORIZON_Y - rng.uniform(*spec['top'])
        if rng.random() < spec.get('gable', 0.0):
            ridge = top - bw * rng.uniform(0.22, 0.42)
            poly = [(x, top), (x + bw / 2, ridge), (x + bw, top), (x + bw, spec['base'] + 400), (x, spec['base'] + 400)]
            out.append((poly, (x, x + bw, top, 'gable')))
            if spec.get('chimneys') and rng.random() < 0.7:
                cx = x + bw * rng.uniform(0.15, 0.75)
                cw = rng.uniform(6, 10)
                ch = rng.uniform(10, 20)
                cy = top - (bw / 2 - abs(cx + cw / 2 - x - bw / 2)) * (top - ridge) / (bw / 2) - ch
                out.append((rect(cx, cy, cx + cw, top), (cx, cx + cw, cy, 'chimney')))
        else:
            out.append((rect(x, top, x + bw, spec['base'] + 400), (x, x + bw, top, 'block')))
            if spec.get('chimneys') and rng.random() < 0.35:
                cx = x + bw * rng.uniform(0.2, 0.7)
                out.append((rect(cx, top - rng.uniform(8, 16), cx + rng.uniform(6, 10), top), (cx, cx + 8, top - 12, 'chimney')))
        x += bw * rng.uniform(0.7, 1.05)
    return out


def paint_far_city(w=1000, h=420, frame_y0=600, seed=None, passes=None):
    """Sky, then 4 planes far -> near. Each plane: P0 flat silhouette in its ladder colour (with the in-scatter veil
    toward the sun and a lighter base), P1 soft horizontal strokes (blurred 6 px), P2 vertical face strokes (near
    planes), P3 lit slivers on edges facing the sun + window lights, then the plane blur. No Gaussian haze."""
    rng = rng_for('far_city', seed)
    brush = Brush(rng)
    cv = Canvas(h, w)
    cv.c[:] = sky_backdrop(h, w, frame_y0)
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    fy = yy + frame_y0
    base_near = mix(PAL['mauve'], PAL['plum'], 0.35)                 # the shade side of a city block at dusk
    sun_veil = np.exp(-((xx - SUN[0]) / 330.0) ** 2) * np.exp(-((fy - SUN[1]) / 260.0) ** 2)
    for i, spec in enumerate(FAR_PLANES):
        prng = rng_for('far_city/' + spec['name'], seed)
        blocks = skyline(prng, w, spec)
        polys = [[(px, py - frame_y0) for px, py in poly] for poly, _ in blocks]
        mask = poly_mask(h, w, polys)
        if mask.sum() < 1:
            continue
        tops = np.array([b[1][2] for b in blocks]) - frame_y0
        y_top = float(np.median(tops))
        # P0: the flat design colour of the plane, varied only by the light: veil toward the sun, lighter base
        k = spec['k'] + (1 - spec['k']) * (0.42 * sun_veil)                       # in-scatter: more air toward the sun
        k = k + (1 - k) * 0.14 * smooth((yy - y_top) / max(h - y_top, 1))           # the air is thicker low
        col = to_plane(base_near[None, None, :] * np.ones((h, w, 1)), 0.0)
        o = rgb2ok(col)
        t = rgb2ok(PAL['air'])
        o = o * (1 - k[..., None]) + t * k[..., None]
        o[..., 1:] = t[1:] + (o[..., 1:] - t[1:]) * spec['chroma']
        warm = 0.25 * sun_veil[..., None]                                           # the veil is warm (the sun's air)
        o = o * (1 - warm) + rgb2ok(SKY['glow']) * warm
        plane_rgb = ok2rgb(o).astype(np.float32)
        lay = Layer(h, w)
        lay.fill(mask, plane_rgb)
        if passes is not None and passes < 1:
            lay.blur(spec['blur'])
            cv.over(lay)
            continue
        # P1: soft horizontal strokes, +/- half a value step, blurred 6 px (colour moving within the plane)
        p1 = Layer(h, w)
        mid = to_plane(base_near, spec['k'], spec['chroma'])
        for _ in range(3 + 2 * i):
            y = prng.uniform(y_top - 20, h)
            x0 = prng.uniform(-100, w - 100)
            ln = prng.uniform(200, 500)
            c = jitter(shift(mid, prng.choice([-1, 1]) * prng.uniform(0.008, 0.016)), prng)
            brush.line(p1, (x0, y), (x0 + ln, y + prng.uniform(-6, 6)), prng.uniform(30, 70), c, 0.28,
                       soft=(10, 10), taper=(0.2, 0.2))
        p1.blur(6.0).clip(mask)
        lay.c = p1.c + lay.c * (1 - p1.a)[..., None]
        # P2: near planes only: each block's face split into a lighter side toward the sun and a deeper rest
        if spec['strokes'] and (passes is None or passes >= 2):
            p2 = Layer(h, w)
            for poly, (bx0, bx1, top, kind) in blocks:
                if kind == 'chimney':
                    continue
                bw = bx1 - bx0
                toward = -1 if (bx0 + bx1) / 2 > SUN[0] else 1          # which side faces the sun
                top_l = top - frame_y0
                for _ in range(prng.integers(1, spec['strokes'] + 1)):
                    sw = bw * prng.uniform(0.18, 0.4)
                    side = bx0 + sw / 2 + 1 if toward < 0 else bx1 - sw / 2 - 1
                    if prng.random() < 0.35:
                        side = prng.uniform(bx0 + sw / 2, bx1 - sw / 2)
                    lit = (side < (bx0 + bx1) / 2) == (toward < 0)
                    c = shift(mid, 0.022 if lit else -0.02, 0.004 if lit else 0.0, 0.010 if lit else -0.004)
                    ln = (h - top_l) * prng.uniform(0.3, 0.9)
                    brush.line(p2, (side, top_l + 1), (side, top_l + ln), sw, jitter(c, prng), prng.uniform(0.3, 0.5),
                               soft=(0.8, 0.8), taper=(0.0, 0.25), dry=0.5, dry_len=0.3)
            p2.blur(0.4).clip(mask)
            lay.c = p2.c + lay.c * (1 - p2.a)[..., None]
        # P3: lit slivers on the edges facing the sun; window lights (near planes); dark slots between blocks
        if passes is None or passes >= 3:
            p3 = Layer(h, w)
            sl_col = to_plane(mix(PAL['glow'], base_near, 0.12 + 0.1 * (3 - i)), spec['k'] * 0.6, 1.0)
            for poly, (bx0, bx1, top, kind) in blocks:
                top_l = top - frame_y0
                if spec['sliver'] > 0 and kind in ('tower', 'block'):
                    toward_left = (bx0 + bx1) / 2 > SUN[0]
                    ex = bx0 + spec['sliver'] / 2 if toward_left else bx1 - spec['sliver'] / 2
                    ln = (h - top_l) * prng.uniform(0.25, 0.7) if kind == 'block' else (h - top_l) * prng.uniform(0.5, 0.9)
                    brush.line(p3, (ex, top_l), (ex, top_l + ln), spec['sliver'], sl_col, prng.uniform(0.65, 0.95),
                               soft=(0.5, 0.5), taper=(0.0, 0.5), dry=0.35)
                    if kind == 'tower':   # the flat top catches the sky glow too
                        brush.line(p3, (bx0, top_l + 0.8), (bx1, top_l + 0.8), 1.6, sl_col, 0.6, soft=(0.5, 0.5),
                                   taper=(0.1, 0.1))
                if spec['windows'] and kind in ('block', 'tower', 'gable') and prng.random() < spec['windows']:
                    lampc = to_plane(mix(PAL['lamp'], base_near, 0.25), spec['k'] * 0.7, 1.0)
                    rows = prng.integers(2, 5)
                    for r in range(rows):
                        wy = top_l + 10 + r * prng.uniform(9, 13)
                        if wy > h - 4:
                            break
                        for c in range(prng.integers(1, 4)):
                            wx = bx0 + 5 + prng.uniform(0, max(bx1 - bx0 - 12, 1))
                            if prng.random() < 0.6:
                                brush.line(p3, (wx, wy), (wx + prng.uniform(3, 6), wy), 2.2, lampc,
                                           prng.uniform(0.55, 0.9), soft=(0.5, 0.5), taper=(0.05, 0.05))
            # darks in small pieces: slots between the nearest blocks and the shadow under gable eaves
            if i == len(FAR_PLANES) - 1:
                dark = to_plane(PAL['plum'], spec['k'] * 0.8, 1.0)
                for poly, (bx0, bx1, top, kind) in blocks:
                    top_l = top - frame_y0
                    if kind == 'gable':
                        brush.line(p3, (bx0 + 2, top_l + 2.5), (bx1 - 2, top_l + 2.5), 4.0, dark, 0.55,
                                   soft=(0.6, 2.0), taper=(0.05, 0.05))
                    if kind == 'block' and prng.random() < 0.4:
                        sx = bx1 - prng.uniform(2, 6)
                        brush.line(p3, (sx, top_l + 6), (sx, h), prng.uniform(3, 6), dark, 0.5, soft=(0.6, 0.6),
                                   taper=(0.0, 0.0))
            p3.clip(mask)
            lay.c = p3.c + lay.c * (1 - p3.a)[..., None]
        # PLANE: one small blur for its depth; extra softness only on the top edges right by the sun (lost edges)
        lay.blur(spec['blur'])
        if i < 2:
            soft = Layer(h, w)
            soft.c, soft.a = lay.c.copy(), lay.a.copy()
            soft.blur(4.0)
            wgt = (0.85 * sun_veil)[..., None]
            lay.c = lay.c * (1 - wgt) + soft.c * wgt
            lay.a = lay.a * (1 - wgt[..., 0]) + soft.a * wgt[..., 0]
        cv.over(lay)
    return cv
