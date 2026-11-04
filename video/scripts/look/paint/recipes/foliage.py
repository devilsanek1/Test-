#!/usr/bin/env python3
"""Painting recipe proof: trees and greenery (docs/look/paint_recipes/foliage.md).

Paints, from seeds, each element of the greenery family the way the recipe says, and lays it beside the reference
crops that show it:
  1. a tree crown: pads lit from the low sun, painted dark first, then lighter leaf dabs, a leafy edge (+ its passes);
  2. the depth ladder: the same recipe on the far, mid and near planes;
  3. a bush in a planter;
  4. grass and wind-blown reeds (fine strokes) + near out-of-focus plumes (+ its passes);
  5. a near flowering plant (protea-like);
  6. near leaves framing a corner.

Sizes are px of the 1080 x 1920 frame; every swatch is painted at 1:1. The scene: an October canal evening at King's
Cross, a low sun on the left (the sky recipe's dusk set).

  python3 video/scripts/look/paint/recipes/foliage.py            # writes docs/look/paint_recipes/foliage_swatch.png
  python3 video/scripts/look/paint/recipes/foliage.py --check    # + determinism (md5 of two bakes) and the numbers
  python3 video/scripts/look/paint/recipes/foliage.py --phone P  # + a 400 px wide phone-size review sheet at P

numpy + PIL + scipy + skimage only. Deterministic: every element draws from its own np.random.default_rng(seed), and
every pass inside an element from its own child generator (so stopping after a pass never changes the earlier ones).
"""
import argparse
import hashlib
import math
import os
import time

import numpy as np
from PIL import Image, ImageDraw, ImageFont
from scipy import ndimage as ndi
from skimage import color as skc
from skimage import measure

HERE = os.path.dirname(os.path.abspath(__file__))
VIDEO = os.path.abspath(os.path.join(HERE, '..', '..', '..', '..'))
LOOK = os.path.join(VIDEO, 'docs', 'look')
OUT = os.path.join(LOOK, 'paint_recipes', 'foliage_swatch.png')
CROPS = '/tmp/recipes/foliage/crops'
SEED = 1029
SS = 4  # supersampling for every stroke polygon (AA edges ~1 px, as the refs measure)

# ----------------------------------------------------------------------------------------------------------------
# 1. Colour: the limited palette, in CIELAB LCh (L*, C*, h), sampled from the scene's light (recipe section 3.1)
# ----------------------------------------------------------------------------------------------------------------
PAL = {
    # the scene's light and air (the sky recipe's dusk set + v5's ground)
    'zenith': (80.9, 17, 293), 'field': (82.0, 12, 310), 'band': (88.9, 7, 46), 'horizon': (87.5, 15, 61),
    'paving': (88.6, 13, 66), 'paving_far': (89.5, 11, 64), 'water': (77.8, 18, 313),
    'shadow': (79.0, 14, 330),  # a cast shadow on the paving: lilac
    # foliage: ONE family, yellow-olive in the low sun's light, turning cool toward the lilac sky in the shade
    'leaf_accent': (84, 42, 94), 'leaf_lit': (72, 38, 104), 'leaf_mid': (58, 27, 124),
    'leaf_shade': (45, 19, 162), 'leaf_deep': (31, 14, 218),
    'leaf_amber': (72, 44, 80), 'leaf_rust': (58, 34, 55),  # October: a few turned clusters, in patches
    'bark_lit': (56, 16, 55), 'bark_shade': (30, 12, 320),
    # grasses in October: straw-gold plumes, ochre-mauve stems, plum at the root
    'grass_tip': (90, 24, 82), 'grass_lit': (80, 30, 76), 'grass_mid': (63, 22, 55),
    'grass_shade': (47, 17, 15), 'grass_deep': (30, 14, 325),
    # the verge (short grass): the foliage family a step greener
    'verge_deep': (28, 10, 220), 'verge_shade': (37, 14, 168), 'verge_mid': (47, 18, 128), 'verge_lit': (64, 28, 100),
    'verge_tip': (78, 32, 90), 'flower': (93, 6, 78),
    # the protea
    'dome_lit': (92, 12, 78), 'dome_mid': (85, 13, 66), 'dome_shade': (72, 12, 340), 'dome_hatch': (66, 16, 40),
    'dome_dot': (95, 8, 85),
    'bract_lit': (74, 32, 16), 'bract_mid': (63, 36, 6), 'bract_shade': (50, 32, 356), 'bract_deep': (37, 26, 345),
    'stem': (40, 20, 30),
    'pleaf_lit': (70, 26, 112), 'pleaf_mid': (57, 22, 132), 'pleaf_shade': (44, 16, 178), 'pleaf_deep': (33, 12, 215),
    # autumn corner leaves (plane / maple in October)
    'aut_lit': (78, 38, 76), 'aut_mid': (66, 40, 56), 'aut_shade': (53, 33, 34), 'aut_deep': (37, 20, 350),
    # the planter (corten-terracotta, flat: a lit face and a shade face)
    'planter_top': (72, 30, 60), 'planter_lit': (64, 32, 52), 'planter_shade': (50, 26, 42), 'soil': (32, 12, 20),
}


def lch2lab(L, C, h):
    return np.array([L, C * math.cos(math.radians(h)), C * math.sin(math.radians(h))], np.float64)


def lab2rgb(lab):
    lab = np.asarray(lab, np.float64)
    return np.clip(skc.lab2rgb(lab.reshape(1, -1, 3)).reshape(lab.shape), 0, 1).astype(np.float32)


def rgb2lab(rgb):
    rgb = np.asarray(rgb, np.float64)
    return skc.rgb2lab(rgb.reshape(1, -1, 3)).reshape(rgb.shape)


def C(name):
    """Palette swatch as sRGB float (3,)."""
    return lab2rgb(lch2lab(*PAL[name]))


def hexc(name):
    r, g, b = (np.clip(C(name), 0, 1) * 255 + 0.5).astype(int)
    return '#%02x%02x%02x' % (r, g, b)


def mixc(a, b, t):
    """Mix two colours (names or rgb) in CIELAB: the painter's mix of two neighbours."""
    la = rgb2lab(C(a) if isinstance(a, str) else a)
    lb = rgb2lab(C(b) if isinstance(b, str) else b)
    return lab2rgb(la * (1 - t) + lb * t)


def shift(rgb, dL=0.0, cmul=1.0, dh=0.0):
    lab = rgb2lab(rgb)
    L, a, b = lab
    Cc = math.hypot(a, b) * cmul
    h = math.atan2(b, a) + math.radians(dh)
    return lab2rgb([L + dL, Cc * math.cos(h), Cc * math.sin(h)])


def variants(rgb, rng, n=40, dL=2.5, dC=2.0, dh=4.0):
    """n jittered copies of one swatch (each stroke takes one): colour moving within a shape, never a new colour."""
    lab = rgb2lab(rgb)
    L, a, b = lab
    C0, h0 = math.hypot(a, b), math.atan2(b, a)
    Ls = L + rng.normal(0, dL / 1.5, n).clip(-dL, dL)
    Cs = np.maximum(0, C0 + rng.normal(0, dC / 1.5, n).clip(-dC, dC))
    hs = h0 + np.radians(rng.normal(0, dh / 1.5, n).clip(-dh, dh))
    labs = np.stack([Ls, Cs * np.cos(hs), Cs * np.sin(hs)], -1)
    return lab2rgb(labs)


def converge(img, air_rgb, k):
    """Atmospheric perspective: move a plane's colours k of the way to the air behind it (CIELAB)."""
    if k <= 0:
        return img
    lab = skc.rgb2lab(np.clip(img[..., :3], 0, 1))
    air = rgb2lab(air_rgb)
    lab = lab * (1 - k) + air * k
    out = img.copy()
    out[..., :3] = np.clip(skc.lab2rgb(lab), 0, 1)
    return out


def kids(rng, n):
    """n child generators: one per pass, so a pass's strokes never depend on how many strokes an earlier pass drew."""
    return [np.random.default_rng(int(v)) for v in rng.integers(0, 2 ** 31 - 1, n)]


# ----------------------------------------------------------------------------------------------------------------
# 2. Layers (premultiplied RGBA float32) and the stroke rasteriser (PIL polygons at SS x, box-reduced: crisp AA)
# ----------------------------------------------------------------------------------------------------------------
class Layer:
    def __init__(self, w, h):
        self.w, self.h = w, h
        self.px = np.zeros((h, w, 4), np.float32)

    def _box(self, mask, x0, y0):
        h, w = mask.shape
        X0, Y0, X1, Y1 = max(x0, 0), max(y0, 0), min(x0 + w, self.w), min(y0 + h, self.h)
        return X0, Y0, X1, Y1

    def comp(self, mask, x0, y0, rgb, op=1.0):
        """Paint `rgb` (3,) or (h,w,3) through `mask` (h,w) placed at (x0, y0), source-over."""
        X0, Y0, X1, Y1 = self._box(mask, x0, y0)
        if X1 <= X0 or Y1 <= Y0:
            return
        m = mask[Y0 - y0:Y1 - y0, X0 - x0:X1 - x0] * op
        if isinstance(rgb, np.ndarray) and rgb.ndim == 3:
            col = rgb[Y0 - y0:Y1 - y0, X0 - x0:X1 - x0]
        else:
            col = np.asarray(rgb, np.float32)
        sub = self.px[Y0:Y1, X0:X1]
        m3 = m[..., None]
        sub[..., :3] = sub[..., :3] * (1 - m3) + col * m3
        sub[..., 3] = sub[..., 3] * (1 - m) + m

    def comp_full(self, mask, rgb, op=1.0):
        self.comp(mask, 0, 0, rgb, op)

    def replace(self, mask, x0, y0, src=None):
        """Show `src` (a full (H, W, 4) premultiplied array: what was behind) through `mask`; src None = erase."""
        X0, Y0, X1, Y1 = self._box(mask, x0, y0)
        if X1 <= X0 or Y1 <= Y0:
            return
        m = mask[Y0 - y0:Y1 - y0, X0 - x0:X1 - x0][..., None]
        cur = self.px[Y0:Y1, X0:X1]
        self.px[Y0:Y1, X0:X1] = cur * (1 - m) + (src[Y0:Y1, X0:X1] * m if src is not None else 0)

    def alpha(self):
        return self.px[..., 3]

    def rgb(self):
        a = self.px[..., 3:4]
        return np.where(a > 1e-6, self.px[..., :3] / np.maximum(a, 1e-6), 0)

    def rgb_soft(self, sigma=1.0):
        """Unpremultiplied colour, blurred inside the shape only (for sampling the local zone colour)."""
        a = ndi.gaussian_filter(self.px[..., 3], sigma)
        c = np.stack([ndi.gaussian_filter(self.px[..., i], sigma) for i in range(3)], -1)
        return c / np.maximum(a, 1e-4)[..., None]

    def blur(self, sigma):
        if sigma > 0:
            for c in range(4):
                self.px[..., c] = ndi.gaussian_filter(self.px[..., c], sigma)

    def copy(self):
        L = Layer(self.w, self.h)
        L.px = self.px.copy()
        return L


def under(top, bottom):
    """A new layer: `top` over `bottom` (both premultiplied)."""
    out = Layer(top.w, top.h)
    a = top.px[..., 3:4]
    out.px = top.px + bottom.px * (1 - a)
    return out


def over(bg_rgb, layer):
    """Composite a layer over an opaque RGB background (h,w,3)."""
    a = layer.px[..., 3:4]
    return bg_rgb * (1 - a) + layer.px[..., :3]


def polys_mask(polys, pad=2):
    """Coverage mask (1x, float) of one or more polygons drawn at SS x and box-reduced. polys: list of (N,2) arrays
    (1x px) or (array, value 0..1) pairs. Returns (mask, x0, y0)."""
    items = [(p, 1.0) if not isinstance(p, tuple) else p for p in polys]
    allp = np.concatenate([np.asarray(p, np.float64) for p, _ in items], 0)
    x0 = int(math.floor(allp[:, 0].min())) - pad
    y0 = int(math.floor(allp[:, 1].min())) - pad
    x1 = int(math.ceil(allp[:, 0].max())) + pad
    y1 = int(math.ceil(allp[:, 1].max())) + pad
    w, h = max(x1 - x0, 1), max(y1 - y0, 1)
    im = Image.new('L', (w * SS, h * SS), 0)
    dr = ImageDraw.Draw(im)
    for p, v in items:
        p = np.asarray(p, np.float64)
        dr.polygon([((x - x0) * SS, (y - y0) * SS) for x, y in p], fill=int(round(255 * v)))
    m = np.asarray(im.reduce(SS), np.float32) / 255.0
    return m, x0, y0


def lines_mask(lines, pad=2):
    """Thin lines (veins, hatch, twigs): list of (pts (N,2), width px, value). Drawn at SS x, reduced."""
    allp = np.concatenate([np.asarray(p, np.float64) for p, _, _ in lines], 0)
    x0 = int(math.floor(allp[:, 0].min())) - pad
    y0 = int(math.floor(allp[:, 1].min())) - pad
    x1 = int(math.ceil(allp[:, 0].max())) + pad
    y1 = int(math.ceil(allp[:, 1].max())) + pad
    im = Image.new('L', (max(x1 - x0, 1) * SS, max(y1 - y0, 1) * SS), 0)
    dr = ImageDraw.Draw(im)
    for p, wpx, v in lines:
        pts = [((x - x0) * SS, (y - y0) * SS) for x, y in np.asarray(p, np.float64)]
        dr.line(pts, fill=int(round(255 * v)), width=max(1, int(round(wpx * SS))), joint='curve')
    return np.asarray(im.reduce(SS), np.float32) / 255.0, x0, y0


def place(mask, x0, y0, W, H):
    """Paste a local mask into a full (H, W) canvas."""
    out = np.zeros((H, W), np.float32)
    h, w = mask.shape
    X0, Y0, X1, Y1 = max(x0, 0), max(y0, 0), min(x0 + w, W), min(y0 + h, H)
    if X1 > X0 and Y1 > Y0:
        out[Y0:Y1, X0:X1] = mask[Y0 - y0:Y1 - y0, X0 - x0:X1 - x0]
    return out


def clip_local(mk, xk, yk, full):
    """The part of a full-frame mask `full` under a local mask's box (same shape as mk)."""
    H, W = full.shape
    hh, ww = mk.shape
    out = np.zeros_like(mk)
    Xa, Ya, Xb, Yb = max(xk, 0), max(yk, 0), min(xk + ww, W), min(yk + hh, H)
    if Xb > Xa and Yb > Ya:
        out[Ya - yk:Yb - yk, Xa - xk:Xb - xk] = full[Ya:Yb, Xa:Xb]
    return out


# ---- stroke geometry --------------------------------------------------------------------------------------------
def bez(p0, p1, p2, n=24):
    t = np.linspace(0, 1, n)[:, None]
    p0, p1, p2 = (np.asarray(p, np.float64) for p in (p0, p1, p2))
    return (1 - t) ** 2 * p0 + 2 * (1 - t) * t * p1 + t ** 2 * p2


def ribbon(path, widths):
    """A stroke as a polygon: the centre line +- half its width along the normal (no stamp seams)."""
    path = np.asarray(path, np.float64)
    d = np.gradient(path, axis=0)
    d /= np.maximum(np.linalg.norm(d, axis=1, keepdims=True), 1e-9)
    n = np.stack([-d[:, 1], d[:, 0]], 1)
    w = np.asarray(widths, np.float64)[:, None] / 2
    return np.concatenate([path + n * w, (path - n * w)[::-1]], 0)


def leaf_poly(cx, cy, length, width, ang, n=14):
    """A pointed leaf: base at -L/2, tip at +L/2 along `ang`; rounder at the base, pointed at the tip."""
    t = np.linspace(0, 1, n)
    hw = 0.5 * width * np.sin(np.pi * np.clip(t, 0, 1)) ** 0.8 * (1 - 0.35 * t)
    u = (t - 0.5) * length
    ca, sa = math.cos(ang), math.sin(ang)
    pts = np.concatenate([np.stack([u, hw], 1), np.stack([u, -hw], 1)[::-1]], 0)
    R = np.array([[ca, -sa], [sa, ca]])
    return pts @ R.T + [cx, cy]


def spray(cx, cy, D, ang, rng, n=None, spread=0.65):
    """A leaf spray = one painted leaf clump: 2-5 pointed leaves fanning from one point (1.7:1 each)."""
    n = n or int(rng.integers(3, 6))
    out = []
    for _ in range(n):
        a = ang + rng.uniform(-spread, spread)
        L = D * rng.uniform(0.62, 1.0)
        W = L * rng.uniform(0.42, 0.56)
        off = D * rng.uniform(0.05, 0.32)
        out.append(leaf_poly(cx + math.cos(a) * off, cy + math.sin(a) * off, L, W, a))
    return out


def ellipse_poly(cx, cy, rx, ry, ang, rng, rough=0.14, n=18):
    th = np.linspace(0, 2 * np.pi, n, endpoint=False)
    ph = rng.uniform(0, 2 * np.pi, 2)
    rr = 1 + rough * (0.6 * np.sin(3 * th + ph[0]) + 0.4 * np.sin(5 * th + ph[1]))
    x, y = rx * rr * np.cos(th), ry * rr * np.sin(th)
    ca, sa = math.cos(ang), math.sin(ang)
    return np.stack([cx + x * ca - y * sa, cy + x * sa + y * ca], 1)


def dab(cx, cy, D, ang, rng):
    """A gouache dab (the lit 'foam' inside a crown): 2-3 overlapping small ragged ellipses, aspect 1.5-2.2, along
    `ang` (the leaves' hang)."""
    out = []
    for _ in range(int(rng.integers(2, 4))):
        a = ang + rng.uniform(-0.35, 0.35)
        Lx = D * rng.uniform(0.5, 0.85)
        off = D * rng.uniform(-0.3, 0.3)
        out.append(ellipse_poly(cx + math.cos(ang) * off, cy + math.sin(ang) * off + D * rng.uniform(-0.12, 0.12),
                                Lx / 2, Lx / 2 / rng.uniform(1.5, 2.2), a, rng))
    return out


def blob_poly(cx, cy, r, rng, k=9, rough=0.22):
    th = np.linspace(0, 2 * np.pi, k * 4, endpoint=False)
    ph = rng.uniform(0, 2 * np.pi, 3)
    rr = r * (1 + rough * (0.6 * np.sin(3 * th + ph[0]) + 0.4 * np.sin(5 * th + ph[1]) + 0.3 * np.sin(2 * th + ph[2])))
    return np.stack([cx + rr * np.cos(th), cy + rr * np.sin(th)], 1)


def bristle_stroke(path, width, rng, nb=5, dry=0.35):
    """A flat brush = nb bristles side by side; each a thin ribbon that runs out of paint at its own point (the dry
    tail). Returns a list of (polygon, value) for polys_mask."""
    path = np.asarray(path, np.float64)
    d = np.gradient(path, axis=0)
    d /= np.maximum(np.linalg.norm(d, axis=1, keepdims=True), 1e-9)
    n = np.stack([-d[:, 1], d[:, 0]], 1)
    out = []
    N = len(path)
    for b in range(nb):
        off = (b + 0.5) / nb - 0.5
        end = int(N * (1 - dry * rng.random() ** 1.5))
        start = int(N * 0.1 * rng.random())
        if end - start < 3:
            continue
        p = path[start:end] + n[start:end] * off * width
        bw = width / nb * rng.uniform(1.0, 1.5)
        ww = np.full(end - start, bw)
        ww[:2] *= 0.6
        ww[-3:] *= np.array([0.7, 0.45, 0.2])
        out.append((ribbon(p, ww), rng.uniform(0.55, 1.0)))
    return out


def noise2(rng, h, w, sigma):
    n = rng.standard_normal((h, w)).astype(np.float32)
    n = ndi.gaussian_filter(n, sigma, mode='wrap')
    return n / (n.std() + 1e-8)


def fbm1(rng, n, scale):
    v = rng.standard_normal(n + 64)
    v = ndi.gaussian_filter1d(v, scale)
    v = v[32:32 + n]
    return v / (v.std() + 1e-8)


def texture(layer, rng, grain=1.6, mottle=2.2, speck=0.0, speck_cols=None):
    """Paper-and-paint texture inside a painted piece (recipe 3.6): fine grain + gentle mottle; speckle on near
    pieces only. Amplitudes are L* std, applied as a value change so the hue holds."""
    h, w = layer.h, layer.w
    a = layer.px[..., 3]
    if a.max() <= 0:
        return
    g = noise2(rng, h, w, 0.7) * grain + noise2(rng, h, w, 7.0) * mottle
    f = (1 + g / 100.0 * 1.15)[..., None]
    layer.px[..., :3] = np.clip(layer.px[..., :3] * f, 0, a[..., None])
    if speck > 0 and speck_cols is not None:
        n = int(a.sum() * speck)
        ys, xs = np.nonzero(a > 0.95)
        if len(ys) == 0:
            return
        for i in rng.integers(0, len(ys), n):
            r = rng.uniform(0.55, 1.1)
            p = blob_poly(xs[i] + rng.uniform(0, 1), ys[i] + rng.uniform(0, 1), r, rng, k=3, rough=0.2)
            m, x0, y0 = polys_mask([p])
            layer.comp(m, x0, y0, speck_cols[int(rng.integers(0, len(speck_cols)))], rng.uniform(0.25, 0.5))


LIGHT = np.array([-0.70, -0.62, 0.36])  # the key: the low sun on the left + the sky above, a little frontal
LIGHT /= np.linalg.norm(LIGHT)


def unit(v):
    return v / np.maximum(np.linalg.norm(v, axis=-1, keepdims=True), 1e-6)


# ----------------------------------------------------------------------------------------------------------------
# 3. The leafy edge: walk a mass's outline and break it into leaf clumps (recipe 3.2, pass P4)
# ----------------------------------------------------------------------------------------------------------------
def leafy_edge(L, m, behind, D, rng, src, p_out=0.5, p_notch=0.3, droop=0.4, nleaf=(2, 5), step=(0.75, 1.45)):
    """Every ~1.1 D along the outline of mask `m`: a leaf clump sticking OUT in the colour just inside (sampled from
    `src`, the layer's soft colour), or a NOTCH biting in that shows what was behind (`behind`: the layer before this
    mass was painted; None = transparent), or nothing. Crisp, leafy, never a fuzz or a comb."""
    h, w = m.shape
    ab = ndi.gaussian_filter(m, 1.5)
    gy, gx = np.gradient(ab)
    for c in measure.find_contours(m, 0.5):
        if len(c) < 6:
            continue
        d = np.r_[0, np.cumsum(np.hypot(*np.diff(c, axis=0).T))]
        pos = rng.uniform(0, D)
        while pos < d[-1]:
            i = min(int(np.searchsorted(d, pos)), len(c) - 1)
            pos += D * rng.uniform(*step)
            yy, xx = c[i]
            iy, ix = int(np.clip(round(yy), 0, h - 1)), int(np.clip(round(xx), 0, w - 1))
            ox, oy = -gx[iy, ix], -gy[iy, ix]
            nn = math.hypot(ox, oy)
            if nn < 1e-6:
                continue
            ox, oy = ox / nn, oy / nn
            r = rng.random()
            if r < p_out:
                ang = math.atan2(oy + droop, ox) + rng.normal(0, 0.25)
                Dd = D * rng.uniform(0.75, 1.2)
                jx = int(np.clip(xx - ox * 0.9 * D, 0, w - 1))
                jy = int(np.clip(yy - oy * 0.9 * D, 0, h - 1))
                col = shift(src[jy, jx], rng.normal(0, 1.2))
                mk, xk, yk = polys_mask(spray(xx + ox * 0.05 * Dd, yy + oy * 0.05 * Dd, Dd, ang, rng,
                                              n=int(rng.integers(*nleaf)), spread=0.55))
                L.comp(mk, xk, yk, col)
            elif r < p_out + p_notch:
                ang = math.atan2(-oy, -ox) + rng.normal(0, 0.3)
                Dn = D * rng.uniform(0.55, 0.95)
                mk, xk, yk = polys_mask(spray(xx + ox * 0.25 * Dn, yy + oy * 0.25 * Dn, Dn, ang, rng,
                                              n=int(rng.integers(1, 3)), spread=0.45))
                L.replace(mk, xk, yk, behind)


# ----------------------------------------------------------------------------------------------------------------
# 4. ELEMENT 1: the tree crown (recipe 4.1)
# ----------------------------------------------------------------------------------------------------------------
PAD_TEMPLATE = [  # (u, v, half-width) in crown W / H; back (top) to front (bottom). Pads are wider than tall, the
    # crown a dome: the top pad narrower, the widest row a little above the middle, the front pad lowest
    (-0.04, -0.36, 0.21), (-0.30, -0.20, 0.20), (0.24, -0.25, 0.19), (0.02, -0.12, 0.24), (0.38, -0.04, 0.17),
    (-0.38, 0.04, 0.17), (-0.17, 0.15, 0.20), (0.22, 0.15, 0.20), (0.02, 0.27, 0.17)]

PLANES = {  # the depth ladder (recipe 4.1 d): near -> far
    'near': dict(k=0.0, blur=0.0, values=4, pads=range(9), dab=0.021, edge=1.15, cover=(0.74, 0.56, 0.38, 0.10),
                 occ=0.45, accents=True, holes=0.012, grain=1.6, mottle=2.0, speck=1 / 520, branch=True, autumn=0.07),
    'mid': dict(k=0.28, blur=0.4, values=3, pads=range(7), dab=0.032, edge=1.1, cover=(0.62, 0.40, 0.14, 0.0),
                occ=0.45, accents=False, holes=0.008, grain=1.1, mottle=1.4, speck=0, branch=True, autumn=0.0),
    'far': dict(k=0.55, blur=0.5, values=2, pads=(0, 1, 2, 3, 4, 5), dab=0.065, edge=1.0, cover=(0.0, 0.0, 0.0, 0.0),
                occ=0.30, accents=False, holes=0.0, grain=0.7, mottle=0.9, speck=0, branch=False, autumn=0.0),
}


def tree_design(rng, cx, cy, W, H, n, plane):
    """The flat design: pads (a domed top with 5-8 small bumps, a flat-ish underside), back to front."""
    pads = []
    flip = -1 if (plane != 'near' and rng.random() < 0.5) else 1  # mid and far trees: mirror half of them
    for (u, v, s) in [PAD_TEMPLATE[i] for i in n]:
        x = cx + (flip * u + rng.normal(0, 0.02)) * W
        y = cy + (v + rng.normal(0, 0.02)) * H
        rx = s * W * rng.uniform(0.96, 1.12)
        ry = rx * rng.uniform(0.52, 0.64) * (1.3 if plane == 'far' else 1.0)
        bot = ry * rng.uniform(0.30, 0.42)
        k = int(rng.integers(5, 9))
        bumps = []
        for a in np.sort(rng.uniform(-math.pi * 0.96, -math.pi * 0.04, k)):
            rb = rx * float(np.clip(rng.lognormal(math.log(0.23), 0.3), 0.12, 0.40))
            bumps.append((x + 0.80 * rx * math.cos(a), y + 0.78 * ry * math.sin(a), rb))
        pads.append(dict(x=x, y=y, rx=rx, ry=ry, bot=bot, bumps=bumps, ao=rng.uniform(0.5, 0.8),
                         wave=rng.uniform(0, 2 * math.pi)))
    return pads


def pad_fields(p, X, Y, crown):
    """AA mask and the light value s of one pad: normals = its bumps + the pad + the whole crown (a sphere each), the
    underside darkened (it faces down, away from the sky)."""
    x, y, rx, ry, bot = p['x'], p['y'], p['rx'], p['ry'], p['bot']
    ryy = np.where(Y < y, ry, bot * 1.6)
    nx, ny = (X - x) / rx, (Y - y) / ryy
    m = np.clip((1 - np.hypot(nx, ny)) * np.minimum(rx, ryy) + 0.5, 0, 1)
    npad = np.stack([nx, ny, np.sqrt(np.clip(1 - nx * nx - ny * ny, 0.02, 1))], -1)
    nb = npad.copy()
    best = np.zeros(X.shape, np.float32)
    for (bx, by, rb) in p['bumps']:
        db = np.hypot(X - bx, Y - by)
        m = np.maximum(m, np.clip(rb - db + 0.5, 0, 1))
        ins = (rb - db) / rb
        upd = ins > best
        best = np.where(upd, ins, best)
        bnx, bny = (X - bx) / rb, (Y - by) / rb
        nb = np.where(upd[..., None], np.stack([bnx, bny, np.sqrt(np.clip(1 - bnx * bnx - bny * bny, 0.02, 1))], -1),
                      nb)
    cut = (y + bot + 0.10 * ry * (1 - np.clip(((X - x) / rx) ** 2, 0, 1))
           + 0.04 * ry * np.sin((X - x) / rx * 4.5 + p['wave']))
    m = np.minimum(m, np.clip(cut - Y + 0.5, 0, 1))
    cxx, cyy, cr = crown
    sx, sy = (X - cxx) / cr, (Y - cyy) / cr
    ncr = np.stack([sx, sy, np.sqrt(np.clip(1 - sx * sx - sy * sy, 0.02, 1))], -1)
    n = unit(0.30 * unit(nb) + 0.32 * unit(npad) + 0.38 * unit(ncr))
    s = n @ LIGHT.astype(np.float32)
    ao = np.clip((Y - (cut - 0.45 * ry)) / (0.45 * ry), 0, 1)
    s = s - p['ao'] * ao ** 1.4
    return m.astype(np.float32), s.astype(np.float32)


def dab_pass(L, p, m, s, z, D0, cover, zvar, accv, s_acc, clump, edge_in, Wc, rng, recolor=None, k_cov=1.9):
    """P3 for one pad: dabs one value step lighter than the zone they sit on (lit dabs on the mid, mid on the shade,
    shade on the deep), on a jittered grid (spacing 0.58 D0), accepted by the zone's coverage (cover = lit, mid,
    shade, deep) and gathered in sub-clumps; bigger in the light, smaller toward the crown's edge; clipped to the pad
    (+0.1 D0), so the edge stays crisp. k_cov = mean dab area / grid cell area (calibrated, --check)."""
    h, w = m.shape
    x0b, x1b = int(max(p['x'] - 1.35 * p['rx'], 0)), int(min(p['x'] + 1.35 * p['rx'], w))
    y0b, y1b = int(max(p['y'] - 1.5 * p['ry'], 0)), int(min(p['y'] + p['bot'] + 0.3 * p['ry'], h))
    if x1b - x0b < 2 or y1b - y0b < 2:
        return
    allow = np.zeros((h, w), np.float32)
    sub = m[y0b:y1b, x0b:x1b]
    allow[y0b:y1b, x0b:x1b] = np.clip(1 - (ndi.distance_transform_edt(sub < 0.5) - 0.10 * D0), 0, 1)
    sp = 0.58 * D0
    gy, gx = np.mgrid[y0b:y1b:sp, x0b:x1b:sp]
    pts = np.stack([gx.ravel(), gy.ravel()], 1) + rng.uniform(-0.5, 0.5, (gx.size, 2)) * sp
    rng.shuffle(pts)
    nvar = len(zvar[0])
    for (px, py) in pts:
        ix, iy = int(px), int(py)
        if not (0 <= ix < w and 0 <= iy < h) or m[iy, ix] < 0.5:
            continue
        zk = int(z[iy, ix])
        cov = cover[3 - zk]
        if cov <= 0:
            continue
        p_acc = min(1.0, -math.log(max(1 - cov, 1e-3)) / k_cov) * (0.55 + 0.9 * float(np.clip(
            0.5 + 0.5 * clump[iy, ix], 0, 1)))
        if rng.random() > p_acc:
            continue
        e = float(np.clip(edge_in[iy, ix] / (0.10 * Wc), 0, 1))
        D = D0 * float(np.clip(rng.lognormal(0, 0.4), 0.5, 2.4)) * [1.0, 1.05, 1.15, 1.3][zk] * (0.72 + 0.28 * e)
        ox, oy = (px - p['x']) / p['rx'], (py - p['y']) / p['ry']
        tang = math.atan2(oy, ox) + math.pi / 2
        dang = (math.atan2(math.sin(tang), math.cos(tang)) + math.pi / 2) % math.pi - math.pi / 2
        dang = 0.6 * dang + rng.normal(0, 0.2)
        if zk >= 2 and rng.random() < 0.3:  # a leaf clump, pointing out from the pad
            polys = spray(px, py, D * 0.95, math.atan2(oy, ox) + rng.normal(0, 0.35), rng,
                          n=int(rng.integers(3, 5)), spread=0.8)
        else:
            polys = dab(px, py, D, dang, rng)
        mk, xk, yk = polys_mask(polys)
        colv = zvar[zk][int(rng.integers(0, nvar))]
        if zk == 3 and s[iy, ix] > s_acc and rng.random() < 0.6:
            colv = accv[int(rng.integers(0, len(accv)))]
        if recolor is not None:
            rc = recolor(zk, ix, iy)
            if rc is not None:
                colv = rc
        L.comp(mk * clip_local(mk, xk, yk, allow), xk, yk, colv)


def paint_tree(w, h, base, crown_c, Wc, Hc, rng, plane='near', air=None, stop=None, n_pads=None):
    """Paint one tree on its own layer (w x h). base: trunk foot (x, y); crown_c: crown centre; Wc, Hc: crown size.
    stop: 'wood' | 'zones' | 'dabs' | 'edges' returns the layer after that pass (the pass strip). Sky holes are CUT
    (alpha 0), so the piece shows whatever is behind it in the engine. Returns the Layer, converged and blurred."""
    P = PLANES[plane]
    r_design, r_dab, r_edge, r_hole, r_acc, r_tex, r_misc = kids(rng, 7)
    wood, L = Layer(w, h), Layer(w, h)
    Y, X = np.mgrid[0:h, 0:w].astype(np.float32) + 0.5
    cx, cy = crown_c
    pads = tree_design(r_design, cx, cy, Wc, Hc, P['pads'] if n_pads is None else n_pads, plane)
    crown = (cx - 0.04 * Wc, cy - 0.06 * Hc, 0.62 * Wc)
    fields = [pad_fields(p, X, Y, crown) for p in pads]
    front, acc = [None] * len(pads), np.zeros((h, w), np.float32)
    for i in range(len(pads) - 1, -1, -1):
        front[i] = acc.copy()
        acc = np.maximum(acc, fields[i][0])
    union = acc
    # occlusion: a back pad goes dark around the pads in front of it, offset away from the light (down-right)
    dx, dy = int(round(0.02 * Wc)), int(round(0.035 * Wc))
    for i, (m, s) in enumerate(fields):
        if front[i].max() > 0:
            occ = ndi.gaussian_filter(np.roll(np.roll(front[i], dy, 0), dx, 1), 0.03 * Wc)
            s -= P['occ'] * occ * (1 - front[i])
    vis = np.full((h, w), np.nan, np.float32)
    for (m, s) in fields:
        vis = np.where(m > 0.5, s, vis)
    vals = vis[np.isfinite(vis)]
    nv = P['values']
    if nv == 4:
        t = np.percentile(vals, [15, 45, 73])
        zf = lambda s: np.digitize(s, t)
    elif nv == 3:
        t = np.percentile(vals, [32, 68])
        zf = lambda s: np.digitize(s, t) + 1
    else:
        t = np.percentile(vals, [52])
        zf = lambda s: np.where(s > t[0], 3, 1)
    pal = {k: C(k) for k in ['leaf_deep', 'leaf_shade', 'leaf_mid', 'leaf_lit', 'leaf_accent', 'leaf_amber',
                             'leaf_rust', 'bark_lit', 'bark_shade']}
    # each zone's base is one value step under the dabs that will cover it: dark first, then lighter dabs
    zbase = [pal['leaf_deep'], mixc(pal['leaf_deep'], pal['leaf_shade'], 0.6),
             mixc(pal['leaf_shade'], pal['leaf_mid'], 0.3), pal['leaf_mid']]
    zdab = [mixc(pal['leaf_deep'], pal['leaf_shade'], 0.6), mixc(pal['leaf_shade'], pal['leaf_mid'], 0.25),
            pal['leaf_mid'], pal['leaf_lit']]
    if nv == 3:
        zbase[1] = mixc(pal['leaf_deep'], pal['leaf_shade'], 0.55)
    if nv == 2:
        zbase[1] = mixc(pal['leaf_shade'], pal['leaf_deep'], 0.25)
        zbase[3] = mixc(pal['leaf_mid'], pal['leaf_lit'], 0.45)
    zvar = [variants(c, r_misc, 40) for c in zdab]
    accv = variants(pal['leaf_accent'], r_misc, 24)
    amber = variants(pal['leaf_amber'], r_misc, 24)
    autumn_field = noise2(r_misc, h, w, 0.12 * Wc)  # turned leaves come in patches, never salt and pepper
    clump = noise2(r_misc, h, w, 0.035 * Wc)  # sub-clumps: dabs gather in groups with gaps between
    edge_in = ndi.distance_transform_edt(union > 0.5)
    s_acc = np.percentile(vals, 88)

    # P0 + P1 (the wood layer, under the foliage): the crown's inner dark (the gaps between pads, where branches
    # show), then the trunk forking into 2-3 limbs that run into the pads; two facets (the lit left third)
    if P['branch']:
        if plane != 'far':
            env = np.zeros((h, w), np.float32)
            for p in pads:
                d = np.clip(0.62 * p['rx'] - np.hypot(X - p['x'], (Y - p['y']) / 0.75) + 0.5, 0, 1)
                env = np.maximum(env, np.minimum(d, np.clip(p['y'] + p['bot'] - 0.1 * p['ry'] - Y + 0.5, 0, 1)))
            from scipy.spatial import ConvexHull
            hp = np.array([[p['x'], p['y']] for p in pads])
            if len(hp) >= 3:
                mk, xk, yk = polys_mask([hp[ConvexHull(hp).vertices]])
                env = np.maximum(env, place(mk, xk, yk, w, h))
            wood.comp_full(env, pal['leaf_deep'])
        bx, by = base
        fork = (bx + 0.01 * Wc, cy + 0.40 * Hc)
        tw = (0.072 if plane == 'near' else 0.06) * Wc
        trunk = bez((bx, by), (bx + 0.02 * Wc, (by + fork[1]) / 2), fork, 24)
        tws = np.linspace(tw * 1.22, tw * 0.80, 24)
        tws[:3] *= np.array([1.3, 1.12, 1.04])
        limbs = [(trunk, tws)]
        if plane != 'far':
            ends = sorted(pads[2:], key=lambda c: c['x'])
            for j, c in enumerate([ends[0], ends[len(ends) // 2], ends[-1]]):
                end = (c['x'] + r_misc.normal(0, 0.08) * c['rx'], c['y'])
                mid = (fork[0] * 0.55 + end[0] * 0.45, fork[1] * 0.45 + end[1] * 0.55 + 0.03 * Hc)
                wl = tw * (0.62 if j == 1 else 0.5)
                limbs.append((bez(fork, mid, end, 20), np.linspace(wl, wl * 0.28, 20)))
                if r_misc.random() < 0.7:  # a side twig off each limb
                    k = int(r_misc.integers(7, 13))
                    p0 = limbs[-1][0][k]
                    sgn = -1 if end[0] < fork[0] else 1
                    p2 = (p0[0] + sgn * 0.10 * Wc, p0[1] - 0.10 * Hc)
                    limbs.append((bez(p0, (p0[0] + sgn * 0.03 * Wc, p0[1] - 0.07 * Hc), p2, 12),
                                  np.linspace(wl * 0.42, wl * 0.15, 12)))
        for path, widths in limbs:
            m, x0, y0 = polys_mask([ribbon(path, widths)])
            wood.comp(m, x0, y0, pal['bark_shade'])
            lp = path + np.array([-1.0, 0.0]) * widths[:, None] * 0.26
            m2, x2, y2 = polys_mask([ribbon(lp, widths * 0.38)])
            wood.comp(m2 * clip_local(m2, x2, y2, place(m, x0, y0, w, h)), x2, y2, pal['bark_lit'], 0.85)
    if not P['branch'] and plane == 'far':
        pass
    if stop == 'wood':
        return wood

    # P2-P4 per pad, back to front: flat value zones (softened 1.2 px), then the dabs, then the leafy edge
    D0 = P['dab'] * Wc
    zall = np.full((h, w), -1)

    def turn(zk, ix, iy):  # October: the outer, sun-side leaves turn first, in patches
        if zk == 3 and P['autumn'] > 0 and autumn_field[iy, ix] > 0.9 and edge_in[iy, ix] < 0.12 * Wc and \
                r_dab.random() < P['autumn'] * 6:
            return amber[int(r_dab.integers(0, 24))]
        return None

    for i, (p, (m, s)) in enumerate(zip(pads, fields)):
        behind = L.px.copy()
        z = zf(s)
        col = np.zeros((h, w, 3), np.float32)
        for k in range(4):
            col[z == k] = zbase[k]
        wgt = ndi.gaussian_filter((m > 0).astype(np.float32), 1.2) + 1e-6
        col = np.stack([ndi.gaussian_filter(col[..., c] * (m > 0), 1.2) / wgt for c in range(3)], -1)
        L.comp_full(m, col)
        zall = np.where(m > 0.5, z, zall)
        if stop == 'zones':
            continue
        if sum(P['cover']) > 0:
            dab_pass(L, p, m, s, z, D0, P['cover'], zvar, accv, s_acc, clump, edge_in, Wc, r_dab, turn)
        if stop == 'dabs':
            continue
        leafy_edge(L, m, behind, P['edge'] * D0, r_edge, L.rgb_soft(1.0),
                   p_out=0.5, p_notch=0.3 if plane != 'far' else 0.22, droop=0.4)
    if stop in ('zones', 'dabs', 'edges'):
        return under(L, wood)

    # P5: sky holes, CUT through both layers (~1.2 % of the crown), in groups of 1-3 leafy holes in the outer band of
    # the shade and mid zones; a faint veil of the shade colour (22 %) so they read as seen through leaves
    if P['holes'] > 0:
        inside = ndi.distance_transform_edt(L.alpha() > 0.5)
        cand = (inside > 0.02 * Wc) & (inside < 0.07 * Wc) & (Y < cy + 0.05 * Hc) & (zall >= 0) & (zall <= 2)
        ys, xs = np.nonzero(cand)
        target = P['holes'] * float((union > 0.5).sum())
        got, groups, tries = 0.0, [], 0
        while got < target and len(ys) and tries < 400:
            tries += 1
            j = int(r_hole.integers(0, len(ys)))
            gx_, gy_ = float(xs[j]), float(ys[j])
            if any(math.hypot(gx_ - a, gy_ - b) < 5.0 * D0 for a, b in groups):
                continue
            groups.append((gx_, gy_))
            polys = []
            for _ in range(int(r_hole.integers(1, 4))):
                hx, hy = gx_ + r_hole.normal(0, 0.7 * D0), gy_ + r_hole.normal(0, 0.5 * D0)
                sz = D0 * float(np.clip(r_hole.lognormal(-0.1, 0.3), 0.5, 1.2))
                polys += spray(hx, hy, sz, r_hole.uniform(0, 2 * math.pi), r_hole, n=int(r_hole.integers(1, 3)),
                               spread=1.2)
                if r_hole.random() < 0.5:
                    polys.append(blob_poly(hx, hy, sz * 0.3, r_hole, k=4, rough=0.3))
            mk, xk, yk = polys_mask(polys)
            L.replace(mk, xk, yk, None)
            wood.replace(mk, xk, yk, None)
            L.comp(mk, xk, yk, pal['leaf_shade'], 0.22)
            got += float(mk.sum())
            if r_hole.random() < 0.25:  # a twig across the group
                a0 = r_hole.uniform(math.pi * 0.25, math.pi * 0.75)
                ln = (np.array([[gx_ - math.cos(a0) * 1.6 * D0, gy_ + math.sin(a0) * 1.6 * D0],
                                [gx_ + math.cos(a0) * 1.6 * D0, gy_ - math.sin(a0) * 1.6 * D0]]), 1.1, 1.0)
                mt, xt, yt = lines_mask([ln])
                L.comp(mt, xt, yt, pal['bark_shade'], 0.8)
    # P6: accents: a few small, lightest leaf clumps where the light hits hardest (never a band along the outline)
    if P['accents']:
        top_s = np.percentile(vals, 96)
        for i, (p, (m, s)) in enumerate(zip(pads, fields)):
            ys, xs = np.nonzero((s > top_s) & (m > 0.9) & (front[i] < 0.5))
            if len(ys) == 0:
                continue
            for _ in range(int(r_acc.integers(2, 6))):
                j = int(r_acc.integers(0, len(ys)))
                Dd = D0 * r_acc.uniform(0.5, 0.85)
                ang = math.atan2(ys[j] - p['y'], xs[j] - p['x'])
                mk, xk, yk = polys_mask(spray(xs[j], ys[j], Dd, ang, r_acc, n=int(r_acc.integers(2, 4))))
                L.comp(mk, xk, yk, accv[int(r_acc.integers(0, 24))], 0.95)
    texture(L, r_tex, grain=P['grain'], mottle=P['mottle'], speck=P['speck'],
            speck_cols=[pal['leaf_lit'], pal['leaf_shade'], pal['leaf_accent']])
    texture(wood, r_tex, grain=P['grain'] * 0.8, mottle=P['mottle'] * 0.6)
    out = under(L, wood)
    # the plane: converge on the air behind it, then blur by distance
    if P['k'] > 0 and air is not None:
        a = out.alpha()
        conv = converge(np.dstack([out.rgb(), a]), air, P['k'])
        out.px[..., :3] = conv[..., :3] * a[..., None]
    out.blur(P['blur'])
    return out


# ----------------------------------------------------------------------------------------------------------------
# 5. Backgrounds (the scene's own colours, flat with a faint grain: the context each piece sits in)
# ----------------------------------------------------------------------------------------------------------------
def bg_vertical(w, h, stops, rng, grain=0.6):
    """stops: list of (y_frac, rgb). A gentle vertical gradient + grain (the sky recipe owns the real sky)."""
    ys = np.linspace(0, 1, h)
    labs = np.array([rgb2lab(c) for _, c in stops])
    fr = np.array([f for f, _ in stops])
    lab = np.stack([np.interp(ys, fr, labs[:, i]) for i in range(3)], -1)
    img = np.repeat(lab2rgb(lab)[:, None, :], w, 1)
    img = img * (1 + noise2(rng, h, w, 0.8)[..., None] * grain / 100.0)
    return np.clip(img, 0, 1).astype(np.float32)


def paving_bg(w, h, rng):
    return bg_vertical(w, h, [(0.0, C('paving_far')), (1.0, shift(C('paving'), -2.0))], rng)


def cast_shadow(img, cx, cy, rx, ry, rng, depth=-9.0, soft=3.0):
    """A soft cast shadow on the ground, along the light (away from the sun: to the right), lilac, never grey."""
    h, w = img.shape[:2]
    Y, X = np.mgrid[0:h, 0:w].astype(np.float32)
    d = ((X - cx) / rx) ** 2 + ((Y - cy) / ry) ** 2
    m = ndi.gaussian_filter(np.clip((1 - d) * 4, 0, 1), soft)
    lab = skc.rgb2lab(img)
    sh = rgb2lab(C('shadow'))
    tgt = lab.copy()
    tgt[..., 0] += depth
    tgt[..., 1] = tgt[..., 1] * 0.6 + sh[1] * 0.4
    tgt[..., 2] = tgt[..., 2] * 0.6 + sh[2] * 0.4
    out = lab * (1 - m[..., None]) + tgt * m[..., None]
    return np.clip(skc.lab2rgb(out), 0, 1).astype(np.float32)


# ----------------------------------------------------------------------------------------------------------------
# 6. ELEMENT 2: bush in a planter (recipe 4.2)
# ----------------------------------------------------------------------------------------------------------------
def paint_bush(w, h, rng, top_y, x0b, x1b, dome_h):
    """A clipped shrub on a planter's top edge (y=top_y): 3 domes, painted like the tree a scale down, but calmer:
    flat zones -> broad dry strokes along the dome (the Cape Town domes) -> dabs in the light only -> leafy edge."""
    r_d, r_dry, r_dab, r_edge, r_tex = kids(rng, 5)
    L = Layer(w, h)
    Y, X = np.mgrid[0:h, 0:w].astype(np.float32) + 0.5
    Wb = x1b - x0b
    domes = [(x0b + 0.66 * Wb, 0.30 * Wb, dome_h * 0.88), (x0b + 0.29 * Wb, 0.31 * Wb, dome_h * 1.0),
             (x0b + 0.52 * Wb, 0.21 * Wb, dome_h * 0.62)]  # back to front
    crown = ((x0b + x1b) / 2 - 0.08 * Wb, top_y - 0.6 * dome_h, 0.62 * Wb)
    pal = {k: C(k) for k in ['leaf_deep', 'leaf_shade', 'leaf_mid', 'leaf_lit', 'leaf_accent']}
    zbase = [pal['leaf_deep'], mixc(pal['leaf_deep'], pal['leaf_shade'], 0.35),
             mixc(pal['leaf_shade'], pal['leaf_mid'], 0.3), pal['leaf_mid']]
    zdab = [mixc(pal['leaf_deep'], pal['leaf_shade'], 0.6), pal['leaf_shade'], pal['leaf_mid'], pal['leaf_lit']]
    zvar = [variants(c, r_d, 30) for c in zdab]
    accv = variants(pal['leaf_accent'], r_d, 16)
    clump = noise2(r_d, h, w, 0.04 * Wb)
    fields = []
    for (dx, rx, ry) in domes:
        cy0 = top_y + 0.04 * ry
        th = np.arctan2((Y - cy0) / ry, (X - dx) / rx)
        bump = 1 + 0.035 * np.sin(5 * th + r_d.uniform(0, 6)) + 0.025 * np.sin(11 * th + r_d.uniform(0, 6))
        rr = np.hypot((X - dx) / rx, (Y - cy0) / ry) / bump
        m = np.clip((1 - rr) * min(rx, ry) + 0.5, 0, 1) * np.clip(cy0 - Y + 0.5, 0, 1)
        nx, ny = (X - dx) / rx, (Y - cy0) / ry
        n = np.stack([nx, ny, np.sqrt(np.clip(1 - nx * nx - ny * ny, 0.02, 1))], -1)
        bx, by = (X - crown[0]) / crown[2], (Y - crown[1]) / crown[2]
        nbig = np.stack([bx, by, np.sqrt(np.clip(1 - bx * bx - by * by, 0.02, 1))], -1)
        s = unit(0.65 * unit(n) + 0.35 * unit(nbig)) @ LIGHT.astype(np.float32)
        s -= 0.95 * np.clip((Y - (cy0 - 0.18 * ry)) / (0.18 * ry), 0, 1) ** 1.3  # contact dark at the planter
        fields.append([m.astype(np.float32), s.astype(np.float32), (dx, cy0, rx, ry)])
    front, acc = [None] * 3, np.zeros((h, w), np.float32)
    for i in range(2, -1, -1):
        front[i] = acc.copy()
        acc = np.maximum(acc, fields[i][0])
    edge_in = ndi.distance_transform_edt(acc > 0.5)
    for i, f in enumerate(fields):
        if front[i].max() > 0:
            occ = ndi.gaussian_filter(np.roll(np.roll(front[i], 6, 0), 3, 1), 0.03 * Wb)
            f[1] = f[1] - 0.5 * occ * (1 - front[i])
    vis = np.full((h, w), np.nan, np.float32)
    for (m, s, _) in fields:
        vis = np.where(m > 0.5, s, vis)
    vals = vis[np.isfinite(vis)]
    t = np.percentile(vals, [15, 45, 72])
    s_acc = np.percentile(vals, 93)
    D0 = 0.02 * Wb
    for i, (m, s, (dx, cy0, rx, ry)) in enumerate(fields):
        behind = L.px.copy()
        z = np.digitize(s, t)
        col = np.zeros((h, w, 3), np.float32)
        for k in range(4):
            col[z == k] = zbase[k]
        wgt = ndi.gaussian_filter((m > 0).astype(np.float32), 1.5) + 1e-6
        col = np.stack([ndi.gaussian_filter(col[..., c] * (m > 0), 1.5) / wgt for c in range(3)], -1)
        L.comp_full(m, col)
        # broad dry strokes along the dome's latitude lines (the Cape Town domes): the calm underlayer
        for _ in range(int(rx * ry / 85)):
            u = r_dry.uniform(-0.92, 0.92)
            v = r_dry.uniform(0.2, 0.95)
            ang0 = math.pi + math.acos(np.clip(u, -1, 1))
            span = r_dry.uniform(0.12, 0.24) / max(v, 0.3)
            angs = np.linspace(ang0 - span / 2, ang0 + span / 2, 10)
            path = np.stack([dx + v * rx * np.cos(angs), cy0 + v * ry * np.sin(angs)], 1)
            ix, iy = int(np.clip(path[5, 0], 0, w - 1)), int(np.clip(path[5, 1], 0, h - 1))
            if m[iy, ix] < 0.5 or front[i][iy, ix] > 0.5:
                continue
            zk = int(z[iy, ix])
            items = bristle_stroke(path, r_dry.uniform(4.5, 7.0), r_dry, nb=int(r_dry.integers(4, 6)), dry=0.5)
            if not items:
                continue
            mk, xk, yk = polys_mask(items)
            L.comp(mk * clip_local(mk, xk, yk, m * (1 - front[i])), xk, yk, mixc(zbase[zk], zdab[zk], 0.6),
                   r_dry.uniform(0.45, 0.7))
        # dabs in the light and across the terminator only: the shade stays calm
        pdict = dict(x=dx, y=cy0 - 0.45 * ry, rx=rx, ry=ry * 0.75, bot=0.45 * ry)
        dab_pass(L, pdict, m, s, z, D0, (0.55, 0.28, 0.06, 0.0), zvar, accv, s_acc, clump, edge_in, Wb, r_dab)
        leafy_edge(L, m * np.clip(cy0 - 3 - Y, 0, 1), behind, 0.9 * D0, r_edge, L.rgb_soft(1.0), p_out=0.38,
                   p_notch=0.32, droop=0.35)
    texture(L, r_tex, grain=1.6, mottle=2.0, speck=1 / 700, speck_cols=[pal['leaf_lit'], pal['leaf_shade']])
    return L


def paint_planter(w, h, x0, x1, top_y, bot_y, depth_px, rng):
    """A corten planter: flat faces (lit top rim, a front face in shade, the sun-side end lit) + faint grain."""
    L = Layer(w, h)
    rim = np.array([[x0, top_y - depth_px], [x1, top_y - depth_px], [x1 + 4, top_y], [x0 - 4, top_y]])
    front = np.array([[x0 - 4, top_y], [x1 + 4, top_y], [x1 + 4, bot_y], [x0 - 4, bot_y]])
    soil = np.array([[x0 + 6, top_y - depth_px + 4], [x1 - 6, top_y - depth_px + 4], [x1 - 2, top_y - 2],
                     [x0 + 2, top_y - 2]])
    for poly, col in [(front, C('planter_shade')), (rim, C('planter_top')), (soil, C('soil'))]:
        m, xa, ya = polys_mask([poly])
        L.comp(m, xa, ya, col)
    lit = np.array([[x0 - 4, top_y], [x0 + 0.22 * (x1 - x0), top_y], [x0 + 0.16 * (x1 - x0), bot_y], [x0 - 4, bot_y]])
    m, xa, ya = polys_mask([lit])
    L.comp(ndi.gaussian_filter(m, 6), xa, ya, C('planter_lit'), 0.8)
    m, xa, ya = lines_mask([(np.array([[x0 - 4, top_y], [x1 + 4, top_y]]), 2.0, 1.0)])
    L.comp(m, xa, ya, shift(C('planter_top'), 6), 0.9)
    texture(L, rng, grain=1.3, mottle=1.8)
    return L


# ----------------------------------------------------------------------------------------------------------------
# 7. ELEMENT 3: grass and wind-blown reeds (recipe 4.3)
# ----------------------------------------------------------------------------------------------------------------
def blade_path(x, yb, length, lean, bend, n=22):
    """A blade from its root (x, yb): up, leaning downwind (+x) by `lean` (rad from vertical), the tip bending
    further by `bend` (a quadratic curve)."""
    up = np.array([math.sin(lean), -math.cos(lean)])
    tipdir = np.array([math.sin(lean + bend), -math.cos(lean + bend)])
    p0 = np.array([x, yb])
    p2 = p0 + up * length * 0.55 + tipdir * length * 0.5
    p1 = p0 + up * length * 0.62
    return bez(p0, p1, p2, n)


def paint_reeds(w, h, rng, x0, x1, yb, hmax, wind=0.62, stop=None):
    """A reed bed at the canal's edge, the wind from the left (the sun's side). Passes: P0 the MASS (soft, leaning,
    its top a row of plume shapes); P1 back blades a step lighter than the mass; P2 plumes (dry bristle heads, lit on
    the sun side); P3 a few lit front blades + dark ones; P4 tip lights. Returns (Layer, snaps)."""
    r_m, r_b, r_p, r_f, r_t, r_x = kids(rng, 6)
    L = Layer(w, h)
    Wd = x1 - x0
    xs = np.arange(w)
    gust = fbm1(r_m, w, 45)  # groups lean together: rhythm, never parallel combing
    lean_x = wind + 0.20 * gust
    hm = hmax * (0.60 + 0.08 * fbm1(r_m, w, 50) + 0.05 * fbm1(r_m, w, 14))
    taper = np.clip(np.minimum(xs - x0, x1 - xs) / 50.0, 0, 1) ** 0.6
    hm = np.where((xs >= x0) & (xs < x1), hm * taper, 0)
    Y, X = np.mgrid[0:h, 0:w].astype(np.float32) + 0.5
    # P0 the MASS: rows sheared downwind; deep at the root -> shade -> mid toward the top
    shear = (yb - Y) * np.tan(lean_x)[None, :] * 0.35
    Xs = np.clip((X - shear).astype(int), 0, w - 1)
    hmx = hm[Xs]
    mass = np.clip(Y - (yb - hmx * 0.8) + 0.5, 0, 1) * np.clip(yb + 2 - Y + 0.5, 0, 1) * (hmx > 2)
    fr = np.clip((yb - Y) / np.maximum(hmx, 1), 0, 1)
    labs = np.array([rgb2lab(C('grass_deep')), rgb2lab(C('grass_shade')), rgb2lab(mixc('grass_shade', 'grass_mid',
                                                                                         0.35))])
    lab = np.stack([np.interp(fr, [0.0, 0.55, 0.95], labs[:, i]) for i in range(3)], -1)
    col = np.clip(skc.lab2rgb(lab), 0, 1).astype(np.float32)
    L.comp_full(mass.astype(np.float32), col)
    top_rgb = mixc('grass_shade', 'grass_mid', 0.4)
    ytop = np.full(w, -1.0)
    for x in range(w):
        yy = np.nonzero(mass[:, x] > 0.5)[0]
        if len(yy):
            ytop[x] = yy.min()
    for x in np.arange(x0 + 3, x1 - 3, 5.0) + r_m.uniform(-2, 2, len(np.arange(x0 + 3, x1 - 3, 5.0))):
        ix = int(np.clip(x, 0, w - 1))
        if ytop[ix] < 0 or hm[ix] < 8:
            continue
        ln = hm[ix] * r_m.uniform(0.22, 0.5)
        lean = float(lean_x[ix]) * r_m.uniform(0.9, 1.3)
        path = blade_path(x, ytop[ix] + r_m.uniform(3, 9), ln, lean * 0.75, lean * 0.45, 16)
        tt = np.linspace(0, 1, len(path))
        widths = r_m.uniform(3.5, 6.5) * (1 - tt) ** 0.8 * (0.6 + 0.4 * np.sin(np.pi * tt))
        m, xa, ya = polys_mask([ribbon(path, widths)])
        L.comp(m, xa, ya, shift(top_rgb, r_m.normal(0, 2.0)))
    L.blur(0.7)  # the underpainting is the softest pass
    # the root mist: lighter air between the lower stems (02), over the mass only
    mist = np.clip(1 - (yb - Y) / np.maximum(0.28 * hmx, 1), 0, 1) * (L.alpha() > 0.5)
    L.comp_full(ndi.gaussian_filter(mist.astype(np.float32), 2.0), mixc('water', 'grass_mid', 0.45), 0.35)
    snaps = {'P0 mass': L.copy()}
    if stop == 'mass':
        return L, snaps
    # P1 back blades: thin (1.2-2.2 px), one per 3.2 px, a step lighter than the mass at their height
    back = []
    for _ in range(int(Wd / 3.2)):
        x = r_b.uniform(x0 + 4, x1 - 4)
        ix = int(np.clip(x, 0, w - 1))
        if hm[ix] < 6:
            continue
        ln = hm[ix] * r_b.uniform(0.95, 1.5)
        lean = float(lean_x[ix]) * r_b.uniform(0.7, 1.2) + r_b.normal(0, 0.07)
        path = blade_path(x, yb + 2, ln, lean * 0.55, lean * r_b.uniform(0.5, 1.0))
        widths = r_b.uniform(1.2, 2.2) * np.linspace(1, 0.12, len(path)) ** 0.9
        tcol = mixc('grass_shade', 'grass_mid', r_b.uniform(0.15, 0.75))
        back.append(path)
        m, xa, ya = polys_mask([ribbon(path, widths)])
        L.comp(m, xa, ya, tcol, r_b.uniform(0.7, 0.95))
    snaps['P1 back blades'] = L.copy()
    if stop == 'back':
        return L, snaps
    # P2 plumes on ~40 % of the blades: a dry bristle head along the last 30-45 %, mid -> lit, its sun-side edge lit
    litv = variants(C('grass_lit'), r_p, 24)
    tipv = variants(C('grass_tip'), r_p, 24)
    plumes = []
    for path in back:
        if r_p.random() > 0.40:
            continue
        k0 = int(len(path) * r_p.uniform(0.55, 0.7))
        seg = path[k0:]
        mw = r_p.uniform(3.5, 6.0)
        items = bristle_stroke(seg, mw, r_p, nb=3, dry=0.45)
        if items:
            m, xa, ya = polys_mask(items)
            L.comp(m, xa, ya, mixc('grass_mid', 'grass_lit', r_p.uniform(0.3, 0.7)), 0.95)
        d = np.gradient(seg, axis=0)
        d /= np.maximum(np.linalg.norm(d, axis=1, keepdims=True), 1e-9)
        nrm = np.stack([-d[:, 1], d[:, 0]], 1)
        sgn = -1 if (nrm[len(nrm) // 2] @ np.array([-0.8, -0.6])) < 0 else 1
        tt = np.linspace(0, 1, len(seg))
        pw = mw * np.sin(np.pi * np.clip(tt * 0.9 + 0.08, 0, 1)) ** 0.7
        m, xa, ya = polys_mask([ribbon(seg + nrm * sgn * pw[:, None] * 0.28, pw * 0.42)])
        L.comp(m, xa, ya, litv[int(r_p.integers(0, 24))], 0.9)
        plumes.append((seg, nrm * sgn))
    snaps['P2 plumes'] = L.copy()
    if stop == 'plumes':
        return L, snaps
    # P3 front blades: a few thin LIT strokes over the darker mass (the van ref), and a few dark ones for depth
    for _ in range(int(Wd / 9)):
        x = r_f.uniform(x0 + 6, x1 - 6)
        ix = int(np.clip(x, 0, w - 1))
        if hm[ix] < 6:
            continue
        ln = hm[ix] * r_f.uniform(0.55, 1.3)
        lean = float(lean_x[ix]) * r_f.uniform(0.7, 1.3) + r_f.normal(0, 0.08)
        path = blade_path(x, yb + 3, ln, lean * 0.6, lean * r_f.uniform(0.6, 1.1))
        m, xa, ya = polys_mask([ribbon(path, r_f.uniform(1.0, 1.5) * np.linspace(1, 0.1, len(path)))])
        L.comp(m, xa, ya, litv[int(r_f.integers(0, 24))], r_f.uniform(0.5, 0.8))
    for _ in range(int(Wd / 28)):
        x = r_f.uniform(x0 + 6, x1 - 6)
        ix = int(np.clip(x, 0, w - 1))
        if hm[ix] < 6:
            continue
        path = blade_path(x, yb + 3, hm[ix] * r_f.uniform(0.6, 0.95), float(lean_x[ix]) * 0.5, 0.5)
        m, xa, ya = polys_mask([ribbon(path, r_f.uniform(1.6, 2.4) * np.linspace(1, 0.1, len(path)))])
        L.comp(m, xa, ya, C('grass_deep'), 0.8)
    snaps['P3 front blades'] = L.copy()
    # P4 the lightest touches: 1 px lights on the sun side of some plume tips (the left of the bed favoured)
    for (seg, nside) in plumes:
        if r_t.random() > 0.45 * (1.3 - (seg[0, 0] - x0) / Wd):
            continue
        k0 = int(len(seg) * 0.35)
        m, xa, ya = lines_mask([(seg[k0:] + nside[k0:] * 1.3, r_t.uniform(0.9, 1.3), 1.0)])
        L.comp(m, xa, ya, tipv[int(r_t.integers(0, 24))], r_t.uniform(0.6, 0.9))
    texture(L, r_x, grain=1.4, mottle=1.4)
    snaps['P4 tip lights (final)'] = L.copy()
    return L, snaps


def paint_verge(w, h, rng, x0, x1, ytop, ybot, wind=0.3):
    """Short grass (the verge at the reeds' foot, refs 01 and van): a dark mass whose top is broken by fine blades
    (1-1.6 px, 5-18 px tall), a few lit tips, tiny pale flowers in drifts."""
    r_m, r_b, r_l, r_f, r_x = kids(rng, 5)
    L = Layer(w, h)
    Y, X = np.mgrid[0:h, 0:w].astype(np.float32) + 0.5
    xs = np.arange(w)
    top = ytop + 3.0 * fbm1(r_m, w, 18) + 1.2 * fbm1(r_m, w, 4)
    inx = (xs >= x0) & (xs < x1)
    m = np.clip(Y - top[None, :] + 0.5, 0, 1) * np.clip(ybot - Y + 0.5, 0, 1) * inx[None, :]
    fr = np.clip((Y - top[None, :]) / max(ybot - ytop, 1), 0, 1)
    labs = np.array([rgb2lab(C('verge_mid')), rgb2lab(C('verge_shade')), rgb2lab(C('verge_deep'))])
    lab = np.stack([np.interp(fr, [0.0, 0.35, 1.0], labs[:, i]) for i in range(3)], -1)
    L.comp_full(m.astype(np.float32), np.clip(skc.lab2rgb(lab), 0, 1).astype(np.float32))
    L.blur(0.5)
    # edge blades in the mass's own colours break the top into grass
    for x in np.arange(x0 + 1, x1 - 1, 1.6) + r_b.uniform(-0.8, 0.8, len(np.arange(x0 + 1, x1 - 1, 1.6))):
        ix = int(np.clip(x, 0, w - 1))
        ln = float(np.clip(r_b.lognormal(math.log(9), 0.4), 4, 20))
        lean = wind + r_b.normal(0, 0.25)
        path = blade_path(x, top[ix] + r_b.uniform(2, 6), ln, lean * 0.6, lean * 0.5, 10)
        m2, xa, ya = polys_mask([ribbon(path, r_b.uniform(1.0, 1.6) * np.linspace(1, 0.15, len(path)))])
        L.comp(m2, xa, ya, mixc('verge_shade', 'verge_mid', r_b.uniform(0.2, 1.0)))
    # lit blades: sparse, the sun's side (left) favoured
    for _ in range(int((x1 - x0) / 6)):
        x = r_l.uniform(x0 + 2, x1 - 2)
        if r_l.random() > 1.25 - (x - x0) / (x1 - x0):
            continue
        ix = int(x)
        ln = r_l.uniform(5, 15)
        lean = wind + r_l.normal(0, 0.2)
        path = blade_path(x, top[ix] + r_l.uniform(3, 9), ln, lean * 0.6, lean * 0.5, 10)
        m2, xa, ya = polys_mask([ribbon(path, r_l.uniform(0.9, 1.3) * np.linspace(1, 0.15, len(path)))])
        L.comp(m2, xa, ya, mixc('verge_lit', 'verge_tip', r_l.uniform(0, 1)), r_l.uniform(0.6, 0.9))
    # flowers in drifts (a few, near the top of the mass)
    fld = fbm1(r_f, w, 25)
    for _ in range(int((x1 - x0) / 9)):
        x = r_f.uniform(x0 + 3, x1 - 3)
        if fld[int(x)] < 0.6:
            continue
        y = top[int(x)] + r_f.uniform(2, 0.7 * (ybot - ytop))
        mk, xa, ya = polys_mask([blob_poly(x, y, r_f.uniform(0.7, 1.3), r_f, k=3, rough=0.2)])
        L.comp(mk, xa, ya, C('flower'), r_f.uniform(0.7, 0.95))
    texture(L, r_x, grain=1.3, mottle=1.4)
    return L


def paint_near_plumes(w, h, rng, sigma=3.0):
    """Out-of-focus near reeds framing the bottom corners (02's near plane): big plumed blades, darker than anything
    in the bed (plum), leaning with the wind, blurred (sigma 3 px = 10-90 % edges ~7.5 px, as measured)."""
    L = Layer(w, h)
    for (xf, ln_f, lean) in [(-0.03, 0.80, 0.55), (0.07, 0.62, 0.62), (0.88, 0.70, 0.48), (0.97, 0.52, 0.58)]:
        x = (xf + rng.uniform(-0.02, 0.02)) * w
        path = blade_path(x, h + 14, ln_f * h, lean * 0.6, lean * 0.6, 30)
        tt = np.linspace(0, 1, len(path))
        m, xa, ya = polys_mask([ribbon(path, rng.uniform(7, 10) * (1 - tt) ** 0.5)])
        col = shift(C('grass_deep'), -3, 0.9)
        L.comp(m, xa, ya, col, 0.92)
        seg = path[int(len(path) * 0.45):]
        items = bristle_stroke(seg, rng.uniform(26, 34), rng, nb=5, dry=0.35)
        if items:
            m, xa, ya = polys_mask(items)
            L.comp(m, xa, ya, col, 0.9)
    L.blur(sigma)
    return L


# ----------------------------------------------------------------------------------------------------------------
# 8. ELEMENT 4: the protea-like flowering plant (recipe 4.4)
# ----------------------------------------------------------------------------------------------------------------
def bract_poly(bx, by, length, width, ang, n=12, curl=0.0):
    """A pointed bract: wide near its base, a long straight taper to the tip (ogive)."""
    t = np.linspace(0, 1, n)
    hw = 0.5 * width * np.clip(np.sin(np.pi * (0.18 + 0.82 * t)) ** 0.55 * (1 - t) ** 0.35, 0, None)
    hw[0] = 0.5 * width * 0.55
    u = t * length
    bend = curl * (t ** 2) * length
    ca, sa = math.cos(ang), math.sin(ang)
    R = np.array([[ca, -sa], [sa, ca]])
    left = np.stack([u, hw + bend], 1)
    right = np.stack([u, -hw + bend], 1)
    mid = np.stack([u, bend], 1)
    to = lambda p: p @ R.T + [bx, by]
    return to(np.concatenate([left, right[::-1]], 0)), to(left), to(right), to(mid)


def facet_masks(bx, by, length, width, ang, curl):
    """Two flat facets split along the midline: the folded-paper look (05). Returns (lit_side, shade_side)."""
    full, left, right, mid = bract_poly(bx, by, length, width, ang, curl=curl)
    polyL = np.concatenate([left, mid[::-1]], 0)
    polyR = np.concatenate([mid, right[::-1]], 0)
    nL = np.array([-math.sin(ang), math.cos(ang)])  # the 'left' side's normal (y down)
    return (polyL, polyR) if (nL @ LIGHT[:2]) > 0 else (polyR, polyL)


def paint_protea(w, h, rng, cx, cy, R, leaves=True, scale_leaf=1.0):
    """The protea-like flower (05): a cream dome sitting in a CUP of broad, pointed two-facet bracts that fan UP
    (never a star), long two-tone leaves behind it pointing up and out."""
    r_l, r_b, r_d, r_f, r_x = kids(rng, 5)
    L = Layer(w, h)

    def bract(bx, by, ln, wd, ang, cols, curl, r):
        lit, sh = facet_masks(bx, by, ln, wd, ang, curl)
        for poly, cname in [(sh, cols[0]), (lit, cols[1])]:
            m, xa, ya = polys_mask([poly])
            L.comp(m, xa, ya, variants(C(cname), r, 1, dL=2.0)[0])

    # 1. leaves (behind): lanceolate, width 0.26-0.32 of the length, up and out from the stem, two-tone by the midrib
    if leaves:
        greens = [('pleaf_shade', 'pleaf_mid'), ('pleaf_deep', 'pleaf_shade'), ('pleaf_mid', 'pleaf_lit')]
        specs = [(-124, 1.05, 1.0), (-58, 1.1, 1.0), (-150, 1.75, 1.08), (-30, 1.8, 1.08), (-166, 2.45, 1.12),
                 (-12, 2.5, 1.12), (-138, 3.0, 0.95), (-44, 3.05, 0.95)]
        for j, (a, hy, sc) in enumerate(specs):
            a = math.radians(a + r_l.normal(0, 6))
            ln = R * r_l.uniform(2.2, 2.8) * sc * scale_leaf
            wd = ln * r_l.uniform(0.26, 0.32)
            bx, by = cx + r_l.normal(0, 0.05) * R, cy + R * hy
            curl = r_l.uniform(-0.12, 0.12)
            t = np.linspace(0, 1, 18)
            hw = 0.5 * wd * np.sin(np.pi * t) ** 0.75
            u, bend = t * ln, curl * t ** 2 * ln
            ca, sa = math.cos(a), math.sin(a)
            Rm = np.array([[ca, -sa], [sa, ca]])
            left = np.stack([u, hw + bend], 1) @ Rm.T + [bx, by]
            right = np.stack([u, -hw + bend], 1) @ Rm.T + [bx, by]
            midl = np.stack([u, bend], 1) @ Rm.T + [bx, by]
            polyA, polyB = np.concatenate([left, midl[::-1]], 0), np.concatenate([midl, right[::-1]], 0)
            lit_p, sh_p = (polyA, polyB) if (np.array([-sa, ca]) @ LIGHT[:2]) > 0 else (polyB, polyA)
            pair = greens[j % 3]
            for poly, cname in [(sh_p, pair[0]), (lit_p, pair[1])]:
                m, xa, ya = polys_mask([poly])
                L.comp(m, xa, ya, variants(C(cname), r_l, 1)[0])
            m, xa, ya = lines_mask([(midl[1:15], 1.2, 1.0)])
            L.comp(m, xa, ya, shift(C(pair[1]), 9), 0.55)
    # 2. the stem
    stem = bez((cx + 0.15 * R, cy + 3.6 * R), (cx - 0.1 * R, cy + 2.2 * R), (cx, cy + 0.9 * R), 20)
    m, xa, ya = polys_mask([ribbon(stem, np.linspace(0.16 * R, 0.11 * R, 20))])
    L.comp(m, xa, ya, C('stem'))
    # 3. the back bracts (behind the dome): 9, fanning UP and out (-160..-20 deg), longer at the sides
    nb = 9
    for i in range(nb):
        uu = (i + r_b.uniform(-0.2, 0.2)) / (nb - 1)
        a = math.radians(-160 + 140 * uu)
        bx, by = cx + 0.50 * R * math.cos(a), cy + 0.45 * R + 0.20 * R * math.sin(a)
        ln = R * (1.30 + 0.45 * abs(math.cos(a))) * r_b.uniform(0.95, 1.08)
        curl = -0.10 * math.copysign(1, math.cos(a))
        bract(bx, by, ln, R * r_b.uniform(0.48, 0.56), a, ('bract_shade', 'bract_mid'), curl, r_b)
    # 4. the dome: cream, a lit cap on the sun side, its lower right in a cool rose shade; radial fine strokes from a
    # point below its centre; a few floret dots on top
    Y, X = np.mgrid[0:h, 0:w].astype(np.float32) + 0.5
    ry = R * 0.90
    dm = np.clip((1 - np.hypot((X - cx) / R, (Y - cy) / ry)) * R + 0.5, 0, 1).astype(np.float32)
    nx, ny = (X - cx) / R, (Y - cy) / ry
    s = np.stack([nx, ny, np.sqrt(np.clip(1 - nx * nx - ny * ny, 0.02, 1))], -1) @ LIGHT.astype(np.float32)
    zc = np.where(s[..., None] > 0.55, C('dome_lit'), np.where(s[..., None] > 0.12, C('dome_mid'), C('dome_shade')))
    zc = np.stack([ndi.gaussian_filter(zc[..., i], 1.5) for i in range(3)], -1)
    L.comp_full(dm, zc)
    fx, fy = cx + 0.05 * R, cy + 0.85 * R
    lines = []
    for _ in range(int(R * 7)):
        a = r_d.uniform(math.pi * 1.0, math.pi * 2.0)
        r0 = r_d.uniform(0.3, 1.7) * R
        ln = R * r_d.uniform(0.10, 0.20)
        p0 = np.array([fx + math.cos(a) * r0, fy + math.sin(a) * r0 * 0.95])
        if ((p0[0] - cx) / R) ** 2 + ((p0[1] - cy) / ry) ** 2 > 0.86:
            continue
        lines.append((np.array([p0, p0 + np.array([math.cos(a), math.sin(a)]) * ln]), r_d.uniform(0.9, 1.4),
                      r_d.uniform(0.5, 0.95)))
    if lines:
        m, xa, ya = lines_mask(lines)
        L.comp(m * clip_local(m, xa, ya, dm), xa, ya, C('dome_hatch'), 0.45)
    for _ in range(int(R * 0.9)):
        a = r_d.uniform(-math.pi * 0.95, -math.pi * 0.05)
        rr = r_d.uniform(0.55, 0.92)
        px_, py_ = cx + math.cos(a) * rr * R, cy + math.sin(a) * rr * ry
        mk, xa, ya = polys_mask([blob_poly(px_, py_, r_d.uniform(0.6, 1.1), r_d, k=3, rough=0.2)])
        L.comp(mk, xa, ya, C('dome_dot'), r_d.uniform(0.5, 0.9))
    # 5. the front of the cup: 7 bracts rooted below the dome, pointing up and out (-90 +- 58 deg), overlapping its
    # lower 40 %; outer ones first and a step darker, the central ones in front and lit
    nf = 7
    order = sorted(range(nf), key=lambda i: -abs(i - (nf - 1) / 2))
    for i in order:
        uu = ((i + r_f.uniform(-0.15, 0.15)) / (nf - 1)) * 2 - 1
        a = math.radians(-90 + 58 * uu)
        bx, by = cx + 0.32 * R * uu, cy + 1.12 * R - 0.05 * R * (1 - abs(uu))
        ln = R * r_f.uniform(1.12, 1.36) * (1 - 0.10 * abs(uu))
        cols = ('bract_mid', 'bract_lit') if abs(uu) < 0.4 else ('bract_shade', 'bract_mid')
        bract(bx, by, ln, R * r_f.uniform(0.50, 0.58), a, cols, -0.06 * uu, r_f)
    for a in (150, 30):  # 6. two small sepals turned down at the base
        a = math.radians(a + r_f.normal(0, 6))
        bract(cx + math.cos(a) * 0.25 * R, cy + 1.15 * R, R * 0.62, R * 0.32, a, ('bract_deep', 'bract_shade'),
              0.0, r_f)
    texture(L, r_x, grain=1.8, mottle=1.8, speck=1 / 900, speck_cols=[C('dome_lit'), C('bract_lit')])
    return L


# ----------------------------------------------------------------------------------------------------------------
# 9. ELEMENT 5: near leaves framing a corner (recipe 4.5)
# ----------------------------------------------------------------------------------------------------------------
def palmate_poly(cx, cy, R, ang, rng, n=200, squash=1.0):
    """A 5-lobed leaf (plane / maple): broad pointed lobes, shallow sinuses, a few teeth, the stalk notch at the base.
    ang = the central lobe's direction; squash < 1 foreshortens it across (a leaf seen turned)."""
    lob = [(0, 1.0), (50, 0.88), (-50, 0.88), (100, 0.58), (-100, 0.58)]
    th = np.linspace(-math.pi, math.pi, n, endpoint=False)
    r = np.full(n, 0.50)
    tips = []
    for dthd, ln in lob:
        dth = math.radians(dthd + rng.normal(0, 4))
        l2 = ln * rng.uniform(0.92, 1.05)
        d = np.angle(np.exp(1j * (th - dth)))
        r = np.maximum(r, 0.50 + (l2 - 0.50) * np.clip(1 - np.abs(d) / 0.56, 0, 1) ** 1.25)
        tips.append((dth, l2))
    r *= 1 + 0.025 * np.sin(th * 21 + rng.uniform(0, 6))
    dback = np.angle(np.exp(1j * (th - math.pi)))
    r *= 1 - 0.45 * np.exp(-0.5 * (dback / 0.18) ** 2)
    x, y = R * r * np.cos(th), R * r * np.sin(th) * squash
    ca, sa = math.cos(ang), math.sin(ang)
    pts = np.stack([cx + x * ca - y * sa, cy + x * sa + y * ca], 1)
    tp = []
    for dth, l2 in tips:
        tx, ty = R * l2 * math.cos(dth), R * l2 * math.sin(dth) * squash
        tp.append((cx + tx * ca - ty * sa, cy + tx * sa + ty * ca))
    return pts, tp


def draw_leaf(target, cx_, cy_, R, hang, squash, pair, rng, w, h, stalk_from=None, vein_op=0.3):
    """One two-facet leaf: the shade colour, then the lit facet on the sun's side of the midrib (an analytic
    half-plane, AA 1 px), veins 1 px from the stalk to each lobe tip at 30 %."""
    if stalk_from is not None:
        m, xa, ya = lines_mask([(np.array([stalk_from, [cx_ - math.cos(hang) * R * 0.32,
                                                        cy_ - math.sin(hang) * R * 0.32]]), 1.4, 1.0)])
        target.comp(m, xa, ya, C('aut_deep'), 0.95)
    pts, tips = palmate_poly(cx_, cy_, R, hang, rng, squash=squash)
    m, xa, ya = polys_mask([pts])
    lit_c, sh_c = pair
    target.comp(m, xa, ya, variants(C(sh_c), rng, 1)[0])
    hh, ww = m.shape
    Yl, Xl = np.mgrid[0:hh, 0:ww].astype(np.float32) + 0.5
    Xl += xa
    Yl += ya
    nrm = np.array([-math.sin(hang), math.cos(hang)])
    if nrm @ LIGHT[:2] < 0:
        nrm = -nrm
    half = np.clip((Xl - cx_) * nrm[0] + (Yl - cy_) * nrm[1] + 0.5, 0, 1)
    target.comp(m * half, xa, ya, variants(C(lit_c), rng, 1)[0])
    base = (cx_ - math.cos(hang) * R * 0.28, cy_ - math.sin(hang) * R * 0.28)
    vl = [(np.array([base, (base[0] * 0.15 + tx * 0.85, base[1] * 0.15 + ty * 0.85)]), 1.0, 1.0) for tx, ty in tips]
    mv, xv, yv = lines_mask(vl)
    target.comp(mv * clip_local(mv, xv, yv, place(m, xa, ya, w, h)), xv, yv, shift(C(sh_c), 7), vein_op)


def paint_corner_leaves(w, h, rng, sky_rgb):
    """A small October branch entering from the top-left corner: leaves in clumps of overlapping, turned leaves on
    3 depth layers (back: converged 35 % on the sky; mid: full; near: the 2 at the corner, out of focus)."""
    r_t, r_l, r_n, r_x = kids(rng, 4)
    back, midL, near = Layer(w, h), Layer(w, h), Layer(w, h)
    twig = bez((-14, 30), (w * 0.24, 20), (w * 0.50, h * 0.27), 36)
    m, xa, ya = polys_mask([ribbon(twig, np.linspace(4.5, 1.2, 36))])
    midL.comp(m, xa, ya, C('aut_deep'))
    sides = []
    for k, (dx, dy) in [(7, (26, 50)), (14, (34, -20)), (21, (36, 40)), (28, (30, -14))]:
        p0 = twig[k]
        side = bez(p0, p0 + np.array([dx * 0.5, dy * 0.25]), p0 + np.array([dx, dy]), 12)
        m, xa, ya = polys_mask([ribbon(side, np.linspace(2.4, 0.9, 12))])
        midL.comp(m, xa, ya, C('aut_deep'))
        sides.append(side)
    pairs = [('aut_lit', 'aut_mid')] * 5 + [('aut_mid', 'aut_shade')] * 3 + [('aut_shade', 'aut_deep')] * 2
    spots = [(twig, f) for f in (0.10, 0.18, 0.27, 0.36, 0.45, 0.54, 0.62, 0.70, 0.78, 0.86, 0.93, 0.99)]
    spots += [(s, f) for s in sides for f in (0.45, 0.75, 1.0)]
    leaves = []
    for (path, f) in spots:
        k = int(f * (len(path) - 1))
        px, py = path[k]
        tg = np.gradient(path, axis=0)[k]
        ta = math.atan2(tg[1], tg[0])
        side = 1 if r_l.random() < 0.5 else -1
        hang = ta + side * math.radians(r_l.uniform(35, 85))
        hang += (math.pi / 2 - ((hang + math.pi) % (2 * math.pi) - math.pi)) * 0.4  # droop toward down
        R = r_l.uniform(16, 26) * (1.15 - 0.45 * px / w)
        st = 0.35 * R
        cxl, cyl = px + math.cos(hang) * (st + 0.78 * R), py + math.sin(hang) * (st + 0.78 * R)
        layer = 'back' if r_l.random() < 0.4 else 'mid'
        leaves.append((layer, (px, py), cxl, cyl, R, hang, r_l.uniform(0.45, 1.0), pairs[int(r_l.integers(0, 10))]))
    for (layer, sf, cxl, cyl, R, hang, sq, pair) in leaves:
        draw_leaf(back if layer == 'back' else midL, cxl, cyl, R, hang + r_l.normal(0, 0.25), sq, pair, r_l, w, h,
                  stalk_from=sf)
    # the two nearest at the corner, cut by the frame
    for (cx_, cy_, R, hang) in [(r_n.uniform(8, 26), r_n.uniform(78, 96), r_n.uniform(30, 36), 1.9),
                                (r_n.uniform(70, 96), r_n.uniform(-6, 8), r_n.uniform(26, 32), 0.9)]:
        draw_leaf(near, cx_, cy_, R, hang + r_n.normal(0, 0.2), r_n.uniform(0.7, 0.95),
                  ('aut_mid', 'aut_shade'), r_n, w, h)
    texture(back, r_x, grain=1.0, mottle=1.0)
    texture(midL, r_x, grain=1.6, mottle=1.6)
    texture(near, r_x, grain=1.0, mottle=1.0)
    # back leaves: converge 35 % on the sky and a touch duller (they sit behind, in the air)
    a = back.alpha()
    conv = converge(np.dstack([back.rgb(), a]), sky_rgb, 0.35)
    back.px[..., :3] = conv[..., :3] * a[..., None]
    back.blur(0.5)
    # the nearest: a step darker, a little duller and out of focus (02's near plane), never a black silhouette
    a = near.alpha()
    lab = skc.rgb2lab(np.clip(near.rgb(), 0, 1))
    lab[..., 0] -= 5
    lab[..., 1:] *= 0.85
    near.px[..., :3] = np.clip(skc.lab2rgb(lab), 0, 1) * a[..., None]
    near.blur(2.2)
    return back, midL, near


# ----------------------------------------------------------------------------------------------------------------
# 10. The sheet
# ----------------------------------------------------------------------------------------------------------------
def font(sz, bold=False):
    p = '/usr/share/fonts/truetype/dejavu/DejaVuSans%s.ttf' % ('-Bold' if bold else '')
    try:
        return ImageFont.truetype(p, sz)
    except OSError:
        return ImageFont.load_default()


REF_CROPS = {  # name: (file under docs/look, box in ref px)
    'kyoto_tree': ('poster_refs/07_kyoto.jpg', (370, 1130, 600, 1340)),
    'hanoi_tree': ('poster_refs/03_hanoi.jpg', (570, 1040, 760, 1250)),
    'singapore_tree': ('poster_refs/01_singapore.jpg', (920, 1390, 1110, 1600)),
    'hanoi_far': ('poster_refs/03_hanoi.jpg', (560, 770, 900, 900)),
    'bus_trees': ('refs_human_scale/02_bus_stop_night.jpg', (0, 200, 320, 360)),
    'cape_domes': ('poster_refs/05_cape_town.jpg', (560, 1050, 840, 1150)),
    'sing_crowns': ('poster_refs/01_singapore.jpg', (0, 1020, 330, 1140)),
    'bus_reeds': ('refs_human_scale/02_bus_stop_night.jpg', (300, 320, 760, 520)),
    'van_grass': ('refs_paint/01_beach_van_dusk.jpg', (20, 280, 330, 410)),
    'hill_grass': ('refs_human_scale/01_city_hill_sunset.jpg', (0, 300, 600, 632)),
    'bus_near': ('refs_human_scale/02_bus_stop_night.jpg', (0, 440, 520, 609)),
    'cape_protea': ('poster_refs/05_cape_town.jpg', (0, 1240, 540, 1605)),
    'kyoto_maple': ('poster_refs/07_kyoto.jpg', (0, 880, 300, 1060)),
    'sing_leaves': ('poster_refs/01_singapore.jpg', (0, 1260, 300, 1625)),
}


def ref_crop(name):
    f, box = REF_CROPS[name]
    im = Image.open(os.path.join(LOOK, f)).convert('RGB').crop(box)
    os.makedirs(CROPS, exist_ok=True)
    im.save(os.path.join(CROPS, 'ref_' + name + '.png'))
    return im


def to_img(rgb):
    return Image.fromarray((np.clip(rgb, 0, 1) * 255 + 0.5).astype(np.uint8))


TREE_ARGS = dict(w=420, h=470, base=(205, 445), crown=(210, 190), Wc=330, Hc=270)


def tree_bg(seed):
    rng = np.random.default_rng(seed)
    w, h = TREE_ARGS['w'], TREE_ARGS['h']
    bg = bg_vertical(w, h, [(0, C('field')), (0.55, C('band')), (0.80, C('horizon')), (0.81, C('paving_far')),
                            (1.0, C('paving'))], rng)
    bx, by = TREE_ARGS['base']
    bg = cast_shadow(bg, bx + 95, by + 4, 150, 16, rng, depth=-8.0, soft=3.0)
    return cast_shadow(bg, bx + 8, by + 2, 26, 6, rng, depth=-12.0, soft=1.5)


def build_tree_panel(seed, stop=None):
    a = TREE_ARGS
    bg = tree_bg(seed)
    tree = paint_tree(a['w'], a['h'], a['base'], a['crown'], a['Wc'], a['Hc'], np.random.default_rng(seed + 100),
                      'near', stop=stop)
    return over(bg, tree), tree


def build_depth_panel(seed):
    """The ladder in one view: a far tree line on the far bank, two mid trees on the towpath, a near crown cut by
    the edge; the same recipe on three planes, each converging on the air behind it."""
    rng = np.random.default_rng(seed)
    w, h = 600, 320
    air = C('horizon')
    bg = bg_vertical(w, h, [(0, C('field')), (0.42, C('band')), (0.62, C('horizon')), (0.63, mixc('horizon', 'water', 0.5)),
                            (0.645, C('water')), (0.76, shift(C('water'), 1)), (0.77, C('paving_far')),
                            (1.0, C('paving'))], rng)
    out = bg.copy()
    for i, x in enumerate([10, 36, 62, 90, 116, 144, 170, 198, 226, 252]):  # far: a tree line ON the far bank
        cw = rng.uniform(44, 62)
        Lf = paint_tree(w, h, (x, 204), (x, 204 - 0.30 * cw), cw, 0.8 * cw, np.random.default_rng(seed * 7 + i),
                        'far', air=air)
        out = over(out, Lf)
    for j, (x, cw) in enumerate([(262, 120), (366, 136)]):  # mid: on the towpath
        Lm = paint_tree(w, h, (x, 262), (x, 262 - 0.95 * cw), cw, 0.82 * cw, np.random.default_rng(seed * 11 + j),
                        'mid', air=air)
        out = over(out, Lm)
    Ln = paint_tree(w, h, (566, 420), (596, 120), 330, 270, np.random.default_rng(seed * 13), 'near')
    return over(out, Ln)


def build_bush_panel(seed):
    rng = np.random.default_rng(seed)
    w, h = 420, 300
    bg = paving_bg(w, h, rng)
    bg = cast_shadow(bg, 300, 268, 150, 18, rng, depth=-8)
    pl = paint_planter(w, h, 60, 360, 190, 262, 22, rng)
    img = over(bg, pl)
    # the bush's shadow on the planter's rim and soil: lilac, soft, offset away from the sun (right)
    img = cast_shadow(img, 236, 176, 150, 12, rng, depth=-10, soft=2.5)
    bush = paint_bush(w, h, rng, 172, 60, 360, 128)
    return over(img, bush)


def build_reeds_panel(seed):
    rng = np.random.default_rng(seed)
    w, h = 560, 300
    bg = bg_vertical(w, h, [(0, C('water')), (0.70, shift(C('water'), 1.5)), (0.71, C('paving_far')),
                            (1.0, C('paving'))], rng)
    reeds, snaps = paint_reeds(w, h, np.random.default_rng(seed + 1), -30, w + 30, 216, 170)
    verge = paint_verge(w, h, np.random.default_rng(seed + 2), 0, w, 208, 232)
    near = paint_near_plumes(w, h, np.random.default_rng(seed + 7))
    img = over(over(over(bg, reeds), verge), near)
    strip = [over(bg, snaps[k]) for k in ['P0 mass', 'P1 back blades', 'P2 plumes', 'P4 tip lights (final)']]
    return img, strip


def build_protea_panel(seed):
    rng = np.random.default_rng(seed)
    w, h = 420, 380
    bg = bg_vertical(w, h, [(0, shift(C('planter_shade'), -8, 0.8)), (0.58, C('planter_shade')),
                            (0.59, C('paving_far')), (1.0, C('paving'))], rng)
    pr2 = paint_protea(w, h, np.random.default_rng(seed + 3), 320, 196, 30, scale_leaf=0.85)
    pr = paint_protea(w, h, np.random.default_rng(seed + 4), 176, 130, 48)
    return over(over(bg, pr2), pr)


def build_corner_panel(seed):
    rng = np.random.default_rng(seed)
    w, h = 420, 300
    bg = bg_vertical(w, h, [(0, C('zenith')), (1.0, C('field'))], rng)
    back, midL, near = paint_corner_leaves(w, h, np.random.default_rng(seed + 1), C('zenith'))
    return over(over(over(bg, back), midL), near)


def label(dr, xy, text, sz=15, bold=False, fill=(46, 40, 56)):
    dr.text(xy, text, fill=fill, font=font(sz, bold))


def fit(im, hgt):
    w, h = im.size
    return im.resize((max(1, int(round(w * hgt / h))), hgt), Image.LANCZOS)


def panels(seed=SEED):
    t0 = time.time()
    tree_img, _ = build_tree_panel(seed + 1)
    tree_strip = [(k, build_tree_panel(seed + 1, stop=st)[0]) for k, st in
                  [('P0-1 wood', 'wood'), ('P2 flat zones', 'zones'), ('P3 lighter dabs', 'dabs'),
                   ('P4 leafy edge', 'edges')]] + [('P5-6 holes, accents', tree_img)]
    out = dict(tree=tree_img, tree_strip=tree_strip, depth=build_depth_panel(seed + 2), bush=build_bush_panel(seed + 3))
    out['reeds'], out['reed_strip'] = build_reeds_panel(seed + 4)
    out['protea'] = build_protea_panel(seed + 5)
    out['corner'] = build_corner_panel(seed + 6)
    out['t'] = time.time() - t0
    return out


ROWS = [  # key, title, refs, notes, ref height
    ('tree', '1  Tree crown: pads lit by the low sun, painted dark first, lighter leaf dabs on top, a leafy edge',
     ['kyoto_tree', 'hanoi_tree', 'singapore_tree'],
     'Design: 9 pads (wider than tall, flat undersides), 4 values by area (deep 15 / shade 30 / mid 28 / lit 27 %), one '
     'light (the low sun, left). Dabs one step lighter than their zone; edge = leaf clumps out + notches in; holes cut.',
     300),
    ('depth', '2  Depth ladder: the same recipe on the far, mid and near planes (fewer values, simpler, toward the air)',
     ['hanoi_far', 'bus_trees'],
     'far: k 0.55, 2 values, no dabs, leafy edge D 0.065 W, blur 0.5 | mid: k 0.28, 3 values, dabs 3.2 % W, blur 0.4 | '
     'near (cut, right): k 0, 4 values + accents, dabs 2.1 % W, no blur', None),
    ('bush', '3  Bush in a planter: domes, broad dry strokes along the form, dabs in the light only, a leafy edge',
     ['cape_domes', 'sing_crowns'],
     'Dome: lit cap / mid / shade / contact dark at the planter; dry strokes on the dome\'s latitude lines (45-70 %); '
     'dabs lit 55 %, mid 28 %, shade 6 %; the planter flat (a lit and a shade face).', None),
    ('reeds', '4  Grass and wind-blown reeds: a soft MASS first, then blades, dry plumes lit on the sun side, tip lights',
     ['bus_reeds', 'van_grass', 'hill_grass'],
     'Mass (plum root -> mauve-ochre top, a row of leaning plume shapes, blur 0.7), back blades 1 per 3.2 px, plumes '
     'on 40 %, lit front blades 1 per 9 px; verge: blades 1 per 1.6 px; near plumes plum, sigma 3.', 220),
    ('protea', '5  Near flowering plant (protea-like): a cream dome in a CUP of folded two-facet bracts, two-tone leaves',
     ['cape_protea'],
     'Dome R 48 px: lit cap, cool lower shade, radial strokes 1-1.4 px; 9 back bracts fan up (-160..-20 deg), '
     '7 front bracts up and out (-90 +- 58 deg), each a lit and a shade facet; leaves split by a light midrib.', None),
    ('corner', '6  Near leaves framing a corner: a small October branch, leaf clumps on 3 depth layers',
     ['kyoto_maple', 'sing_leaves', 'bus_near'],
     'Leaves R 16-26 px on one twig + 4 side twigs; lit facet on the sun side of the midrib, veins 1 px at 30 %; back '
     'leaves 35 % toward the sky; the 2 at the corner -5 L*, x0.85 chroma, blur 2.2 px.', 250),
]


def sheet(P):
    W, pad = 1600, 16
    rows = []

    def row(title, refs, ours, notes, ref_h=None):
        """One element: the reference crops (scaled to one height that fits) on the left, ours at 1:1 on the right."""
        ours_im = to_img(ours) if isinstance(ours, np.ndarray) else ours
        oh = ours_im.size[1]
        rh = ref_h or min(oh, 300)
        crops = [ref_crop(r) for r in refs]
        avail = W - 3 * pad - ours_im.size[0] - 8 * (len(crops) - 1)
        tot = sum(c.size[0] * rh / c.size[1] for c in crops)
        if tot > avail:
            rh = int(rh * avail / tot)
        ref_ims = [fit(c, rh) for c in crops]
        im = Image.new('RGB', (W, max(oh, rh) + 60), (250, 246, 242))
        dr = ImageDraw.Draw(im)
        label(dr, (pad, 8), title, 19, True)
        label(dr, (pad, 33), notes, 13)
        x = pad
        for r_im, rname in zip(ref_ims, refs):
            im.paste(r_im, (x, 56))
            dr.rectangle([x, 56 + r_im.size[1] - 18, x + 8 + 7 * len(rname) + 30, 56 + r_im.size[1]], fill=(40, 36, 48))
            label(dr, (x + 4, 56 + r_im.size[1] - 17), 'ref ' + rname, 12, fill=(255, 255, 255))
            x += r_im.size[0] + 8
        ox = W - pad - ours_im.size[0]
        im.paste(ours_im, (ox, 56))
        dr.rectangle([ox, 56, ox + 150, 74], fill=(40, 36, 48))
        label(dr, (ox + 6, 58), 'OURS (painted, 1:1)', 12, True, fill=(255, 255, 255))
        rows.append(im)

    def strip(title, items, hgt):
        st = Image.new('RGB', (W, hgt + 40), (250, 246, 242))
        dr = ImageDraw.Draw(st)
        label(dr, (pad, 6), title, 15, True)
        x = pad
        for k, im_ in items:
            im = fit(to_img(im_), hgt - 10)
            st.paste(im, (x, 30))
            dr.rectangle([x, 30, x + 8 + 7 * len(k), 46], fill=(250, 246, 242))
            label(dr, (x + 4, 31), k, 12, True)
            x += im.size[0] + 8
        rows.append(st)

    for key, title, refs, notes, rh in ROWS:
        row(title, refs, P[key], notes, rh)
        if key == 'tree':
            strip('1b  The tree pass by pass (every pass a separate seed: stopping early never changes the earlier ones)',
                  P['tree_strip'], 250)
        if key == 'reeds':
            strip('4b  The reeds pass by pass', list(zip(['P0 mass (soft)', 'P1 back blades', 'P2 plumes',
                                                          'P3-P4 front blades, tip lights'], P['reed_strip'])), 150)
    total_h = sum(r.size[1] for r in rows) + 60
    out = Image.new('RGB', (W, total_h), (250, 246, 242))
    dr = ImageDraw.Draw(out)
    label(dr, (pad, 14), 'Foliage recipe proof (docs/look/paint_recipes/foliage.md): each element painted by '
          'scripts/look/paint/recipes/foliage.py, beside the reference crops', 17, True)
    y = 46
    for r in rows:
        out.paste(r, (0, y))
        y += r.size[1]
    return out


def phone_sheet(P, path):
    """The phone check: every row at 400 px per frame width (ours x 400/1080, refs x 400/1206), side by side."""
    so, sr = 400 / 1080, 400 / 1206
    rows = []
    for key, _, refs, _, _ in ROWS:
        im = to_img(P[key])
        o = im.resize((round(im.width * so), round(im.height * so)), Image.LANCZOS)
        rr = [ref_crop(r) for r in refs]
        rr = [r.resize((round(r.width * sr), round(r.height * sr)), Image.LANCZOS) for r in rr]
        H = max([o.height] + [r.height for r in rr]) + 6
        Wd = sum(r.width + 6 for r in rr) + o.width + 20
        c = Image.new('RGB', (Wd, H), (255, 255, 255))
        x = 0
        for r in rr:
            c.paste(r, (x, 0))
            x += r.width + 6
        c.paste(o, (x + 14, 0))
        rows.append(c)
    W = max(r.width for r in rows)
    out = Image.new('RGB', (W, sum(r.height for r in rows)), (255, 255, 255))
    y = 0
    for r in rows:
        out.paste(r, (0, y))
        y += r.height
    os.makedirs(os.path.dirname(path), exist_ok=True)
    out.save(path)
    return out.size


def numbers(seed=SEED):
    """The checks the recipe quotes (section 7.7): the near crown's value clusters, its silhouette's edge width and its
    sky holes, measured the way section 1 measured the refs."""
    from scipy.cluster.vq import kmeans2
    a = TREE_ARGS
    tree = paint_tree(a['w'], a['h'], a['base'], a['crown'], a['Wc'], a['Hc'], np.random.default_rng(seed + 101), 'near')
    al = tree.alpha()
    rows = np.zeros_like(al, bool)
    rows[:300] = True  # the crown, not the trunk below it
    Lc = skc.rgb2lab(np.clip(tree.rgb(), 0, 1))[..., 0][(al > 0.98) & rows]
    cent, lab_ = kmeans2(Lc.reshape(-1, 1).astype(float), 5, minit='++', seed=1)
    order = np.argsort(cent[:, 0])[::-1]
    print('near crown L* k-means (5): ' + ', '.join('%.0f (%.0f %%)' % (cent[i, 0], 100 * (lab_ == i).mean())
                                                 for i in order))
    filled = ndi.binary_fill_holes(al > 0.5)
    ring = (al > 0.1) & (al < 0.9) & ~ndi.binary_erosion(filled, iterations=2) & ndi.binary_dilation(filled,
                                                                                                    iterations=2)
    length = sum(np.hypot(*np.diff(c, axis=0).T).sum() for c in measure.find_contours(filled.astype(float), 0.5))
    print('outer silhouette: mean 10-90 %% edge width %.2f px (ring area / outline length)' % (ring.sum() / length))
    print('sky holes: %.1f %% of the crown' % (100 * ((al < 0.5) & filled).sum() / filled.sum()))


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--out', default=OUT)
    ap.add_argument('--seed', type=int, default=SEED)
    ap.add_argument('--phone', default=None, help='also write the 400 px wide phone review sheet here')
    ap.add_argument('--check', action='store_true', help='bake twice and compare md5; print the tree numbers')
    a = ap.parse_args()
    P = panels(a.seed)
    im = sheet(P)
    os.makedirs(os.path.dirname(a.out), exist_ok=True)
    im.save(a.out, optimize=True)
    print('wrote', a.out, im.size, 'paint %.1f s' % P['t'])
    if a.phone:
        print('wrote', a.phone, phone_sheet(P, a.phone))
    if a.check:
        im2 = sheet(panels(a.seed))
        h1 = hashlib.md5(im.tobytes()).hexdigest()
        h2 = hashlib.md5(im2.tobytes()).hexdigest()
        print('deterministic:', h1 == h2, h1)
        numbers(a.seed)


if __name__ == '__main__':
    main()
