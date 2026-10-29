#!/usr/bin/env python3
"""Painting recipe proof: trees and greenery (docs/look/paint_recipes/foliage.md).

Paints, from seeds, each element of the greenery family the way the recipe says, and lays it beside the reference
crops that show it:
  1. a tree crown: lit and shade masses built from clusters, painted with leaf-spray dabs (+ the pass-by-pass strip);
  2. the depth ladder: the same tree on the near, mid and far planes;
  3. a bush in a planter;
  4. grass and wind-blown reeds (fine strokes) + near out-of-focus blades;
  5. a near flowering plant (protea-like);
  6. near leaves framing a corner.

Sizes are px of the 1080 x 1920 frame; every swatch is painted at 1:1. The scene: an October canal evening at King's
Cross, a low sun on the left (the sky recipe's dusk set).

  python3 video/scripts/look/paint/recipes/foliage.py            # writes docs/look/paint_recipes/foliage_swatch.png
  python3 video/scripts/look/paint/recipes/foliage.py --check    # + determinism (md5 of two bakes) and the numbers

numpy + PIL + scipy + skimage only. Deterministic: every element draws from its own np.random.default_rng(seed).
"""
import argparse
import hashlib
import math
import os
import time
import zlib

import numpy as np
from PIL import Image, ImageDraw, ImageFont
from scipy import ndimage as ndi
from skimage import color as skc

HERE = os.path.dirname(os.path.abspath(__file__))
VIDEO = os.path.abspath(os.path.join(HERE, '..', '..', '..', '..'))
LOOK = os.path.join(VIDEO, 'docs', 'look')
OUT = os.path.join(LOOK, 'paint_recipes', 'foliage_swatch.png')
CROPS = '/tmp/recipes/foliage/crops'
SEED = 1029
SS = 4  # supersampling for every stroke polygon (AA edges ~1 px, as the refs measure)

# ----------------------------------------------------------------------------------------------------------------
# 1. Colour: the limited palette, in CIELAB LCh (L*, C*, h), sampled from the scene's light (recipe section 2.1)
# ----------------------------------------------------------------------------------------------------------------
PAL = {
    # the scene's light and air (the sky recipe's dusk set + v5's ground)
    'zenith': (80.9, 17, 293), 'field': (82.0, 12, 310), 'band': (88.9, 7, 46), 'horizon': (87.5, 15, 61),
    'paving': (88.6, 13, 66), 'paving_far': (89.5, 11, 64), 'water': (77.8, 18, 313),
    'shadow': (79.0, 14, 330),  # a cast shadow on the paving: lilac
    # greenery (one family: sage lit by peach-gold, shaded toward the lilac-plum sky)
    'leaf_accent': (85, 36, 98), 'leaf_lit': (75, 34, 114), 'leaf_mid': (62, 23, 138),
    'leaf_shade': (49, 16, 178), 'leaf_deep': (33, 11, 232),
    'leaf_amber': (74, 32, 80), 'leaf_rust': (60, 27, 58),  # October: a few turned clusters
    'bark_lit': (54, 18, 50), 'bark_shade': (31, 12, 330),
    # grasses in October: straw-gold plumes, rose-ochre stems, mauve and plum below
    'grass_tip': (89, 28, 80), 'grass_lit': (79, 30, 72), 'grass_mid': (64, 24, 50),
    'grass_shade': (49, 18, 12), 'grass_deep': (32, 14, 318),
    # the protea
    'dome_lit': (92, 13, 76), 'dome_mid': (85, 13, 64), 'dome_shade': (73, 12, 330), 'dome_hatch': (67, 17, 42),
    'bract_lit': (74, 32, 18), 'bract_mid': (63, 36, 8), 'bract_shade': (50, 32, 356), 'bract_deep': (37, 26, 345),
    'stem': (40, 22, 30),
    # autumn corner leaves
    'aut_lit': (78, 36, 72), 'aut_mid': (66, 38, 52), 'aut_shade': (54, 32, 30), 'aut_deep': (38, 22, 350),
    # the planter (corten-terracotta, flat: a lit face and a shade face)
    'planter_top': (72, 30, 60), 'planter_lit': (64, 32, 52), 'planter_shade': (52, 26, 40), 'soil': (34, 12, 20),
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


# ----------------------------------------------------------------------------------------------------------------
# 2. Layers (premultiplied RGBA float32) and the stroke rasteriser (PIL polygons at SS x, box-reduced: crisp AA)
# ----------------------------------------------------------------------------------------------------------------
class Layer:
    def __init__(self, w, h):
        self.w, self.h = w, h
        self.px = np.zeros((h, w, 4), np.float32)

    def comp(self, mask, x0, y0, rgb, op=1.0):
        """Paint `rgb` (3,) or (h,w,3) through `mask` (h,w) placed at (x0, y0), source-over."""
        h, w = mask.shape
        X0, Y0, X1, Y1 = max(x0, 0), max(y0, 0), min(x0 + w, self.w), min(y0 + h, self.h)
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

    def alpha(self):
        return self.px[..., 3]

    def rgb(self):
        a = self.px[..., 3:4]
        return np.where(a > 1e-6, self.px[..., :3] / np.maximum(a, 1e-6), 0)

    def blur(self, sigma):
        if sigma > 0:
            for c in range(4):
                self.px[..., c] = ndi.gaussian_filter(self.px[..., c], sigma)

    def copy(self):
        L = Layer(self.w, self.h)
        L.px = self.px.copy()
        return L


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


def leaf_poly(cx, cy, length, width, ang, n=14, tip=1.0, base=0.0):
    """A pointed leaf (a dab's unit): base at -L/2, tip at +L/2 along `ang`; rounder at the base, pointed at the tip."""
    t = np.linspace(0, 1, n)
    hw = 0.5 * width * np.sin(np.pi * np.clip(t, 0, 1)) ** 0.8 * (1 - 0.35 * t)
    u = (t - 0.5) * length
    ca, sa = math.cos(ang), math.sin(ang)
    left = np.stack([u, hw], 1)
    right = np.stack([u, -hw], 1)[::-1]
    pts = np.concatenate([left, right], 0)
    R = np.array([[ca, -sa], [sa, ca]])
    return pts @ R.T + [cx, cy]


def spray(cx, cy, D, ang, rng, n=None, spread=0.65):
    """A leaf spray = one painted dab: 3-5 pointed leaves fanning from one point (the refs' lit dab, 1.7:1)."""
    n = n or int(rng.integers(3, 6))
    out = []
    for i in range(n):
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
    """A gouache dab (the refs' lit 'foam' inside a crown): 2-3 overlapping small ragged ellipses, aspect 1.2-1.7,
    leaning along `ang` (the leaves' hang). Pointed leaves are kept for the silhouette (spray)."""
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


def noise2(rng, h, w, sigma):
    n = rng.standard_normal((h, w)).astype(np.float32)
    n = ndi.gaussian_filter(n, sigma, mode='wrap')
    return n / (n.std() + 1e-8)


def texture(layer, rng, grain=1.6, mottle=2.2, speck=0.0, speck_cols=None):
    """Paper-and-paint texture inside a painted piece (recipe 2.6): fine grain + gentle mottle, speckle on near only.
    Amplitudes are L* std; applied as a value change so the hue holds."""
    h, w = layer.h, layer.w
    a = layer.px[..., 3]
    if a.max() <= 0:
        return
    g = noise2(rng, h, w, 0.7) * grain + noise2(rng, h, w, 7.0) * mottle
    # ~1 L* = 1/100 of the value; scale rgb (premultiplied) multiplicatively
    f = (1 + g / 100.0 * 1.15)[..., None]
    layer.px[..., :3] = np.clip(layer.px[..., :3] * f, 0, a[..., None])
    if speck > 0 and speck_cols is not None:
        n = int(a.sum() * speck)
        ys, xs = np.nonzero(a > 0.95)
        if len(ys) == 0:
            return
        idx = rng.integers(0, len(ys), n)
        for i in idx:
            r = rng.uniform(0.55, 1.1)
            p = blob_poly(xs[i] + rng.uniform(0, 1), ys[i] + rng.uniform(0, 1), r, rng, k=3, rough=0.2)
            m, x0, y0 = polys_mask([p])
            layer.comp(m, x0, y0, speck_cols[int(rng.integers(0, len(speck_cols)))], rng.uniform(0.25, 0.5))


LIGHT = np.array([-0.70, -0.62, 0.36])  # the key: the low sun on the left + the sky above, a little frontal
LIGHT /= np.linalg.norm(LIGHT)


# ----------------------------------------------------------------------------------------------------------------
# 3. ELEMENT 1: the tree crown (recipe 3.1)
# ----------------------------------------------------------------------------------------------------------------
CLUSTER_TEMPLATE = [  # (u, v, r) in crown widths/heights: the design's clusters, top (back) to bottom (front);
    # pads wider than tall (squash 0.72-0.86), sizes 0.11-0.24 W, the biggest mass up and toward the light
    (-0.06, -0.30, 0.24), (0.24, -0.23, 0.17), (-0.31, -0.11, 0.19), (0.37, 0.00, 0.15),
    (0.03, -0.02, 0.21), (-0.21, 0.19, 0.16), (0.21, 0.19, 0.15), (0.00, 0.31, 0.11)]

PLANES = {  # the depth ladder (recipe 3.1 d): near -> far
    'near': dict(k=0.0, blur=0.0, values=4, bump=0.45, dab=0.018, cover=(0.82, 0.55, 0.25, 0.12), accents=True, holes=1.0,
                 grain=1.6, mottle=2.2, speck=1 / 450, clusters=8, branch=True, autumn=0.05),
    'mid': dict(k=0.30, blur=0.5, values=3, bump=0.35, dab=0.032, cover=(0.72, 0.48, 0.16, 0.0), accents=False, holes=0.6,
                grain=1.2, mottle=1.6, speck=0, clusters=7, branch=True, autumn=0.0),
    'far': dict(k=0.55, blur=0.9, values=2, dab=0.055, cover=(0.0, 0.0, 0.0, 0.0), accents=False, holes=0.0,
                grain=0.8, mottle=1.0, speck=0, clusters=5, branch=False, autumn=0.0),
}


def disc_aa(X, Y, cx, cy, r):
    return np.clip(r - np.hypot(X - cx, Y - cy) + 0.5, 0, 1)


def tree_design(rng, cx, cy, W, H, n):
    """The flat design: clusters (lobed discs, flat-ish undersides), back to front."""
    cl = []
    for (u, v, r) in CLUSTER_TEMPLATE[:n]:
        x = cx + (u + rng.normal(0, 0.022)) * W
        y = cy + (v + rng.normal(0, 0.022)) * H
        rr = r * W * rng.uniform(0.98, 1.16)
        k = int(rng.integers(5, 8))
        angs = np.linspace(-math.pi * 0.96, -math.pi * 0.04, k) + rng.normal(0, 0.12, k)
        angs = np.concatenate([angs, [math.pi * 0.06 + rng.normal(0, 0.1), math.pi * 0.94 + rng.normal(0, 0.1)]])
        lobes = [(x + 0.56 * rr * math.cos(a) * rng.uniform(0.85, 1.1),
                  y + 0.50 * rr * math.sin(a) * rng.uniform(0.85, 1.1),
                  rr * rng.uniform(0.40, 0.54)) for a in angs]
        lobes.append((x, y + 0.05 * rr, rr * 0.74))
        q = rng.uniform(0.80, 0.92)
        lobes = [(lx, y + (ly - y) * q, lr) for (lx, ly, lr) in lobes]
        cl.append(dict(x=x, y=y, r=rr, q=q, lobes=lobes, cut=y + rr * q * rng.uniform(0.40, 0.50),
                       ao=rng.uniform(0.45, 0.85)))
    return cl


def cluster_fields(c, X, Y, crown, bump=None):
    """AA mask and the light value s for one cluster (sphere-ish normals: lobe + cluster + the whole crown)."""
    m = np.zeros_like(X)
    best = np.full_like(X, -1e9)
    nl = np.zeros(X.shape + (3,), np.float32)
    q = c.get('q', 1.0)
    for (lx, ly, lr) in c['lobes']:
        d = np.hypot(X - lx, (Y - ly) / q)
        m = np.maximum(m, np.clip(lr - d + 0.5, 0, 1))
        ins = (lr - d) / lr
        upd = ins > best
        best = np.where(upd, ins, best)
        nx, ny = (X - lx) / lr, (Y - ly) / (lr * q)
        nz = np.sqrt(np.clip(1 - nx * nx - ny * ny, 0, 1))
        nl = np.where(upd[..., None], np.stack([nx, ny, nz], -1), nl)
    # a flat-ish underside: a gentle convex cut
    cut = c['cut'] + 0.10 * c['r'] * (1 - ((X - c['x']) / c['r']) ** 2)
    m = np.minimum(m, np.clip(cut - Y + 0.5, 0, 1))

    def sph(cx, cy, r):
        nx, ny = (X - cx) / r, (Y - cy) / r
        nz = np.sqrt(np.clip(1 - nx * nx - ny * ny, 0.02, 1))
        v = np.stack([nx, ny, nz], -1)
        return v / np.linalg.norm(v, axis=-1, keepdims=True)
    n = 0.40 * nl + 0.28 * sph(c['x'], c['y'], c['r'] * 1.05) + 0.32 * sph(crown[0], crown[1], crown[2])
    n /= np.maximum(np.linalg.norm(n, axis=-1, keepdims=True), 1e-6)
    if bump is not None:  # sub-clumps: a smooth height field tilts the normal, so each clump gets its own lit top
        gy, gx = bump
        n = n + np.stack([-gx, -gy, np.zeros_like(gx)], -1)
        n /= np.maximum(np.linalg.norm(n, axis=-1, keepdims=True), 1e-6)
    s = n @ LIGHT.astype(np.float32)
    # occlusion: the underside of every cluster goes deep
    ao = np.clip((Y - (cut - 0.30 * c['r'])) / (0.30 * c['r']), 0, 1)
    s = s - c.get('ao', 0.75) * ao ** 1.5
    return m.astype(np.float32), s.astype(np.float32)


def dab_pass(L, c, m, s, z, front_i, D0, cover, zvar, t, clump_field, rng, recolor=None, k_cov=1.45):
    """P4 for one cluster (or dome): gouache dabs one step lighter than the zone they sit on, on a jittered grid
    (spacing 0.58 D), accepted by the zone's coverage (cover = lit, mid, shade, deep) and grouped in sub-clumps by
    `clump_field`; flat-ish marks tangent to the cluster inside, pointed leaf sprays on the silhouette band (they
    break the edge by up to 0.42 D); clipped by the clusters in front (front_i). k_cov = mean dab area / cell area."""
    h, w = m.shape
    dist_out = ndi.distance_transform_edt(m < 0.5)
    ndi_edge = ndi.distance_transform_edt(m > 0.5) < 0.9 * D0  # the silhouette band: pointed leaves break it
    allow = np.clip(1 - (dist_out - 0.42 * D0), 0, 1).astype(np.float32) * (1 - front_i)
    allow_low = np.clip(1 - (dist_out - 0.18 * D0), 0, 1).astype(np.float32) * (1 - front_i)
    x0b, x1b = int(max(c['x'] - 1.3 * c['r'], 0)), int(min(c['x'] + 1.3 * c['r'], w))
    y0b, y1b = int(max(c['y'] - 1.1 * c['r'], 0)), int(min(c['cut'] + 0.2 * c['r'], h))
    if x1b - x0b < 2 or y1b - y0b < 2:
        return
    sp = 0.58 * D0
    gy, gx = np.mgrid[y0b:y1b:sp, x0b:x1b:sp]
    pts = np.stack([gx.ravel(), gy.ravel()], 1) + rng.uniform(-0.5, 0.5, (gx.size, 2)) * sp
    rng.shuffle(pts)
    smax = float(s[m > 0.5].max()) if (m > 0.5).any() else 1.0
    nvar = len(zvar[0])
    for (px, py) in pts:
        ix, iy = int(px), int(py)
        if not (0 <= ix < w and 0 <= iy < h) or m[iy, ix] < 0.5 or front_i[iy, ix] > 0.5:
            continue
        zk = int(z[iy, ix])
        cov = cover[3 - zk]
        if cov <= 0:
            continue
        p_acc = min(1.0, -math.log(max(1 - cov, 1e-3)) / k_cov) * (0.55 + 0.45 * float(np.clip(
            0.5 + 0.5 * clump_field[iy, ix], 0, 1)) * 1.6)
        if rng.random() > p_acc:
            continue
        D = D0 * float(np.clip(rng.lognormal(0, 0.32), 0.55, 2.4)) * [1.35, 1.25, 1.1, 1.0][zk]
        if zk == 3:  # bigger, calmer dabs in the heart of the light
            D *= 1.0 + 0.4 * float(np.clip((s[iy, ix] - t[2]) / max(smax - t[2], 1e-3), 0, 1))
        ox, oy = px - c['x'], py - c['y'] + 0.25 * c['r']
        ang = math.atan2(oy + 0.55 * math.hypot(ox, oy), ox) if (ox or oy) else math.pi / 2
        # the marks follow the foliage: tangent to the cluster (flat on its top), drooping toward its sides
        tang = math.atan2(oy, ox) + math.pi / 2
        dang = (math.atan2(math.sin(tang), math.cos(tang)) + math.pi / 2) % math.pi - math.pi / 2
        dang = 0.55 * dang + rng.normal(0, 0.18)
        near_edge = dist_out[iy, ix] == 0 and ndi_edge[iy, ix]
        mk, xk, yk = polys_mask(spray(px, py, D * 1.15, ang, rng) if near_edge else dab(px, py, D, dang, rng))
        clip = allow if zk >= 2 else allow_low
        hh, ww = mk.shape
        Xa, Ya, Xb, Yb = max(xk, 0), max(yk, 0), min(xk + ww, w), min(yk + hh, h)
        if Xb <= Xa or Yb <= Ya:
            continue
        sub = np.zeros_like(mk)
        sub[Ya - yk:Yb - yk, Xa - xk:Xb - xk] = clip[Ya:Yb, Xa:Xb]
        colv = zvar[zk][int(rng.integers(0, nvar))]
        if recolor is not None:
            rc = recolor(zk, ix, iy)
            if rc is not None:
                colv = rc
        L.comp(mk * sub, xk, yk, colv)


def paint_tree(w, h, base, crown_c, Wc, Hc, rng, plane='near', bg_at=None, snaps=None, air=None):
    """Paint one tree on its own layer (w x h). base: trunk foot (x, y); crown_c: crown centre; Wc, Hc: crown size.
    bg_at(x, y) -> rgb of what is behind (for sky holes). Returns the Layer (converged and blurred for its plane)."""
    P = PLANES[plane]
    L = Layer(w, h)
    Y, X = np.mgrid[0:h, 0:w].astype(np.float32) + 0.5
    cx, cy = crown_c
    cl = tree_design(rng, cx, cy, Wc, Hc, P['clusters'])
    crown = (cx - 0.04 * Wc, cy - 0.06 * Hc, 0.62 * Wc)
    Hb = noise2(rng, h, w, 0.045 * Wc)  # the sub-clump height field (bumps ~0.1 W across)
    gy, gx = np.gradient(Hb)
    beta = P.get('bump', 0.0) * 0.045 * Wc
    fields = [cluster_fields(c, X, Y, crown, (gy * beta, gx * beta) if beta > 0 else None) for c in cl]
    vis = np.full((h, w), np.nan, np.float32)
    for (m, s) in fields:
        vis = np.where(m > 0.5, s, vis)
    vals = vis[np.isfinite(vis)]
    nv = P['values']
    # the value plan by area: deep 15 %, shade 30 %, mid 28 %, lit 27 % (refs 1.2); fewer values farther
    t = np.percentile(vals, [15, 45, 73])
    names4 = ['leaf_deep', 'leaf_shade', 'leaf_mid', 'leaf_lit']
    pal = {k: C(k) for k in names4 + ['leaf_accent', 'leaf_amber', 'leaf_rust', 'bark_lit', 'bark_shade']}
    if nv == 3:
        pal['leaf_deep'] = shift(pal['leaf_shade'], -5)
    if nv == 2:
        pal['leaf_deep'] = pal['leaf_shade'] = shift(pal['leaf_shade'], 2)
        pal['leaf_mid'] = pal['leaf_lit'] = mixc(pal['leaf_mid'], pal['leaf_lit'], 0.6)
    # base colour of each zone = one step under the dab colour that will cover it (dark first, then lighter dabs)
    zbase = [pal['leaf_deep'], pal['leaf_shade'], mixc(pal['leaf_shade'], pal['leaf_mid'], 0.45),
             mixc(pal['leaf_mid'], pal['leaf_lit'], 0.35)]
    zdab = [mixc(pal['leaf_deep'], pal['leaf_shade'], 0.55), mixc(pal['leaf_shade'], pal['leaf_mid'], 0.35),
            pal['leaf_mid'], pal['leaf_lit']]
    if nv == 2:
        zbase = [pal['leaf_shade'], pal['leaf_shade'], pal['leaf_lit'], pal['leaf_lit']]
    zvar = [variants(c, rng, 40) for c in zdab]
    amber = variants(pal['leaf_amber'], rng, 24)
    rust = variants(pal['leaf_rust'], rng, 24)
    autumn_field = noise2(rng, h, w, 0.12 * Wc)  # turned leaves come in patches, never salt and pepper
    clump_field = noise2(rng, h, w, 0.035 * Wc)  # sub-clumps: dabs gather in groups with gaps between

    # P0: the crown's inner darkness (the gaps between clusters, where the branches show); never past a cluster's
    # underside, so no dark 'balloons' hang below the crown
    env = np.zeros((h, w), np.float32)
    for c in cl:
        d = disc_aa(X, Y, c['x'], c['y'] - 0.02 * c['r'], c['r'] * 0.70)
        d = np.minimum(d, np.clip(c['cut'] - 0.06 * c['r'] - Y + 0.5, 0, 1))
        env = np.maximum(env, d)
    hull_pts = np.array([[c['x'], c['y']] for c in cl])
    if len(hull_pts) >= 3:
        from scipy.spatial import ConvexHull
        hp = hull_pts[ConvexHull(hull_pts).vertices]
        mk, xk, yk = polys_mask([hp])
        env = np.maximum(env, place(mk, xk, yk, w, h))
    L.comp_full(env, pal['leaf_deep'])
    if snaps is not None:
        snaps['P0 inner dark'] = L.copy()

    # P1 branches: the trunk forks below the crown into 2-3 limbs that run into the clusters; two facets (the lit
    # left third, the shade rest); drawn before the clusters so the leaves cover them
    if P['branch']:
        bx, by = base
        fork = (bx + 0.01 * Wc, cy + 0.48 * Hc)
        tw = 0.072 * Wc
        trunk = bez((bx, by), (bx + 0.02 * Wc, (by + fork[1]) / 2), fork, 24)
        tws = np.linspace(tw * 1.22, tw * 0.80, 24)
        tws[:3] *= np.array([1.3, 1.12, 1.04])
        limbs = [(trunk, tws)]
        ends = sorted(cl[2:], key=lambda c: c['x'])
        picks = [ends[0], ends[len(ends) // 2], ends[-1]]
        for j, c in enumerate(picks):
            end = (c['x'] + rng.normal(0, 0.08) * c['r'], c['y'] + 0.05 * c['r'])
            mid = ((fork[0] * 0.55 + end[0] * 0.45), (fork[1] * 0.45 + end[1] * 0.55) + 0.03 * Hc)
            wl = tw * (0.62 if j == 1 else 0.5)
            limbs.append((bez(fork, mid, end, 20), np.linspace(wl, wl * 0.28, 20)))
            if rng.random() < 0.7:  # a side twig off each limb
                k = int(rng.integers(7, 13))
                p0 = limbs[-1][0][k]
                sgn = -1 if end[0] < fork[0] else 1
                p2 = (p0[0] + sgn * 0.10 * Wc, p0[1] - 0.12 * Hc)
                limbs.append((bez(p0, (p0[0] + sgn * 0.03 * Wc, p0[1] - 0.08 * Hc), p2, 12),
                              np.linspace(wl * 0.42, wl * 0.15, 12)))
        for path, widths in limbs:
            m, x0, y0 = polys_mask([ribbon(path, widths)])
            L.comp(m, x0, y0, pal['bark_shade'])
            lp = path + np.array([-1.0, 0.0]) * widths[:, None] * 0.26
            m2, x2, y2 = polys_mask([ribbon(lp, widths * 0.38)])
            full = place(m, x0, y0, w, h)
            hh, ww = m2.shape
            Xa, Ya, Xb, Yb = max(x2, 0), max(y2, 0), min(x2 + ww, w), min(y2 + hh, h)
            clip = np.zeros_like(m2)
            clip[Ya - y2:Yb - y2, Xa - x2:Xb - x2] = full[Ya:Yb, Xa:Xb]
            L.comp(m2 * clip, x2, y2, pal['bark_lit'], 0.85)
    if snaps is not None:
        snaps['P1 branches'] = L.copy()

    # P2: each cluster back to front: its flat value zones (softened 1.2 px)
    zone_maps = []
    for ci, (c, (m, s)) in enumerate(zip(cl, fields)):
        z = np.digitize(s, t)  # 0 deep .. 3 lit
        if nv == 2:
            z = np.where(z >= 2, 3, 0)
        col = np.zeros((h, w, 3), np.float32)
        for k in range(4):
            col[z == k] = zbase[k]
        wgt = ndi.gaussian_filter((m > 0).astype(np.float32), 1.2) + 1e-6
        col = np.stack([ndi.gaussian_filter(col[..., i] * (m > 0), 1.2) / wgt for i in range(3)], -1)
        L.comp_full(m, col)
        zone_maps.append((m, z))
    zall = np.full((h, w), -1)
    for (m, z) in zone_maps:
        zall = np.where(m > 0.5, z, zall)
    if snaps is not None:
        snaps['P2 flat value zones'] = L.copy()

    holes = []
    # P4: leaf-spray dabs per cluster, back to front, each clipped by the clusters in front of it; one step lighter
    # than the zone they sit on; coverage by zone (lit 0.80, mid 0.62, shade 0.28, deep 0.10), grouped in sub-clumps
    D0 = P['dab'] * Wc
    front = [np.zeros((h, w), np.float32) for _ in cl]
    acc_u = np.zeros((h, w), np.float32)
    for i in range(len(cl) - 1, -1, -1):
        front[i] = acc_u.copy()
        acc_u = np.maximum(acc_u, zone_maps[i][0])
    k_cov = 1.45  # mean spray area / grid cell area (calibrated: 3-5 leaves of 0.62-1.0 D)
    crown_in = ndi.distance_transform_edt(acc_u > 0.5)
    edge_band = crown_in < 0.12 * Wc
    def turn(zk, ix, iy):  # October: the outer, sun-side leaves turn first
        if zk == 3 and P['autumn'] > 0 and autumn_field[iy, ix] > 1.0 and edge_band[iy, ix] and \
                rng.random() < P['autumn'] * 5:
            return amber[int(rng.integers(0, 24))]
        return None
    if sum(P['cover']) > 0:
        for ci, (c, (m, s)) in enumerate(zip(cl, fields)):
            dab_pass(L, c, m, s, zone_maps[ci][1], front[ci], D0, P['cover'], zvar, t, clump_field, rng, turn)
    # P4b: the undersides hang: shade-coloured sprays along each cluster's lower edge, pointing down (a leafy, flatter
    # bottom edge instead of a smooth dark curve)
    if sum(P['cover']) > 0:
        for ci, (c, (m, s)) in enumerate(zip(cl, fields)):
            xs_ = np.arange(c['x'] - 0.95 * c['r'], c['x'] + 0.95 * c['r'], 0.75 * D0)
            for xx in xs_:
                ix = int(np.clip(xx, 0, w - 1))
                col_m = m[:, ix]
                yy = np.nonzero(col_m > 0.5)[0]
                if len(yy) == 0:
                    continue
                py = float(yy.max()) - 0.15 * D0
                iy = int(np.clip(py, 0, h - 1))
                if front[ci][min(iy + 2, h - 1), ix] > 0.5 or rng.random() < 0.25:
                    continue
                D = D0 * rng.uniform(0.6, 1.05)
                mk, xk, yk = polys_mask(spray(xx, py, D, math.pi / 2 + rng.normal(0, 0.35), rng, n=3, spread=0.5))
                hh, ww = mk.shape
                Xa, Ya, Xb, Yb = max(xk, 0), max(yk, 0), min(xk + ww, w), min(yk + hh, h)
                if Xb <= Xa or Yb <= Ya:
                    continue
                sub = np.zeros_like(mk)
                sub[Ya - yk:Yb - yk, Xa - xk:Xb - xk] = 1 - front[ci][Ya:Yb, Xa:Xb]
                L.comp(mk * sub, xk, yk, zvar[1 if rng.random() < 0.6 else 0][int(rng.integers(0, 40))])
    if snaps is not None:
        snaps['P4 leaf-spray dabs'] = L.copy()

    # P5: sky holes AFTER the dabs, so they read: ~2.5-3.4 % of the crown, in the outer band (0.025-0.09 W in from
    # the edge), mid and shade zones, leafy-edged (a blob + 1-2 leaf sprays cut out); darker, duller and cooler than
    # what is behind them (the smaller, the darker)
    a_now = L.alpha().copy()
    if P['holes'] > 0 and bg_at is not None:
        inside = ndi.distance_transform_edt(a_now > 0.5)
        cand = (inside > 0.02 * Wc) & (inside < 0.07 * Wc) & (zall >= 1) & (zall <= 2) & (Y < cy + 0.15 * Hc)
        ys, xs = np.nonzero(cand)
        area = (a_now > 0.5).sum()
        target = 0.011 * area * P['holes']
        got, tries = 0.0, 0
        while got < target and len(ys) and tries < 600:
            tries += 1
            i = int(rng.integers(0, len(ys)))
            dia = 0.026 * Wc * float(np.clip(rng.lognormal(0, 0.4), 0.5, 2.0))
            hx, hy = float(xs[i]), float(ys[i])
            if any(math.hypot(hx - a, hy - b) < (dia + dd) * 1.5 for a, b, dd in holes):
                continue
            holes.append((hx, hy, dia))
            polys = [blob_poly(hx, hy, dia * 0.38, rng, k=5, rough=0.3)]
            polys += spray(hx, hy, dia * 0.85, rng.uniform(0, 6.28), rng, n=int(rng.integers(2, 4)), spread=1.2)
            mk, xk, yk = polys_mask(polys)
            dark = -8.0 - 8.0 * float(np.clip(1.0 - dia / (0.06 * Wc), 0, 1))  # small holes read darker
            L.comp(mk, xk, yk, shift(bg_at(hx, hy), dark, 0.8, -8.0))
            got += mk.sum()
    if snaps is not None:
        snaps['P5 sky holes'] = L.copy()

    # P5: accents: a few small, lightest sprays where the light hits hardest (never a band along the outline);
    # twigs across a few of the bigger holes, clipped to the hole
    if P['accents']:
        acc = variants(pal['leaf_accent'], rng, 16)
        top_s = np.percentile(vals, 95)
        for ci, (c, (m, s)) in enumerate(zip(cl, fields)):
            ys, xs = np.nonzero((s > top_s) & (m > 0.9) & (front[ci] < 0.5))
            if len(ys) == 0:
                continue
            for _ in range(int(rng.integers(2, 6))):
                i = int(rng.integers(0, len(ys)))
                D = D0 * rng.uniform(0.5, 0.85)
                ang = math.atan2(ys[i] - c['y'], xs[i] - c['x'])
                mk, xk, yk = polys_mask(spray(xs[i], ys[i], D, ang, rng, n=int(rng.integers(2, 4))))
                L.comp(mk, xk, yk, acc[int(rng.integers(0, 16))], 0.95)
    if P['branch']:
        for (hx, hy, dia) in holes:
            if dia < 0.035 * Wc or rng.random() > 0.35:
                continue
            a0 = rng.uniform(math.pi * 0.3, math.pi * 0.7)
            ln = (np.array([[hx - math.cos(a0) * dia, hy + math.sin(a0) * dia],
                            [hx + math.cos(a0) * dia, hy - math.sin(a0) * dia]]), rng.uniform(1.0, 1.4), 1.0)
            mk, xk, yk = lines_mask([ln])
            L.comp(mk, xk, yk, pal['bark_shade'], 0.85)

    # P6: texture (near only gets speckle), then the plane: converge on the air and blur by distance
    texture(L, rng, grain=P['grain'], mottle=P['mottle'], speck=P['speck'],
            speck_cols=[pal['leaf_lit'], pal['leaf_shade'], pal['leaf_accent']])
    if P['k'] > 0 and air is not None:
        rgbv = L.rgb()
        a = L.alpha()
        conv = converge(np.dstack([rgbv, a]), air, P['k'])
        L.px[..., :3] = conv[..., :3] * a[..., None]
    L.blur(P['blur'])
    if snaps is not None:
        snaps['P6 accents + texture (final)'] = L.copy()
    return L


# ----------------------------------------------------------------------------------------------------------------
# 4. Backgrounds (the scene's own colours, flat with a faint grain: the context each piece sits in)
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


def paving_bg(w, h, rng, horizon=None):
    stops = [(0.0, C('paving_far')), (1.0, shift(C('paving'), -2.0))]
    img = bg_vertical(w, h, stops, rng)
    return img


def cast_shadow(img, cx, cy, rx, ry, rng, depth=-9.0, soft=3.0):
    """A soft cast shadow on the ground, along the light (away from the sun: to the right), lilac, never grey."""
    h, w = img.shape[:2]
    Y, X = np.mgrid[0:h, 0:w].astype(np.float32)
    d = ((X - cx) / rx) ** 2 + ((Y - cy) / ry) ** 2
    m = np.clip((1 - d) * 4, 0, 1)
    m = ndi.gaussian_filter(m, soft)
    lab = skc.rgb2lab(img)
    sh = rgb2lab(C('shadow'))
    tgt = lab.copy()
    tgt[..., 0] += depth
    tgt[..., 1] = tgt[..., 1] * 0.6 + sh[1] * 0.4
    tgt[..., 2] = tgt[..., 2] * 0.6 + sh[2] * 0.4
    out = lab * (1 - m[..., None]) + tgt * m[..., None]
    return np.clip(skc.lab2rgb(out), 0, 1).astype(np.float32)


# ----------------------------------------------------------------------------------------------------------------
# 5. ELEMENT 2: bush in a planter (recipe 3.2)
# ----------------------------------------------------------------------------------------------------------------
def bristle_stroke(path, width, rng, nb=5, dry=0.35):
    """A flat brush = nb bristles side by side; each bristle a thin ribbon that runs out of paint at its own point
    (the dry tail). Returns a list of (polygon, value)."""
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


def paint_bush(w, h, rng, top_y, x0b, x1b, dome_h):
    """A clipped shrub resting on a planter's top edge at y=top_y: 3 domes, painted in the layered order: soft flat
    value zones -> broad strokes along the form (low contrast) -> dabs one step lighter -> pointed sprays on the
    silhouette -> grain. The same light and palette as the tree, one scale down."""
    L = Layer(w, h)
    Y, X = np.mgrid[0:h, 0:w].astype(np.float32) + 0.5
    Wb = x1b - x0b
    domes = [(x0b + 0.66 * Wb, 0.30 * Wb, dome_h * 0.86), (x0b + 0.30 * Wb, 0.34 * Wb, dome_h * 1.0),
             (x0b + 0.50 * Wb, 0.22 * Wb, dome_h * 0.62)]  # back to front
    crown = ((x0b + x1b) / 2 - 0.05 * Wb, top_y - 0.5 * dome_h, 0.6 * Wb)
    pal = {k: C(k) for k in ['leaf_deep', 'leaf_shade', 'leaf_mid', 'leaf_lit', 'leaf_accent']}
    zbase = [pal['leaf_deep'], pal['leaf_shade'], mixc(pal['leaf_shade'], pal['leaf_mid'], 0.45),
             mixc(pal['leaf_mid'], pal['leaf_lit'], 0.35)]
    zdab = [mixc(pal['leaf_deep'], pal['leaf_shade'], 0.55), mixc(pal['leaf_shade'], pal['leaf_mid'], 0.35),
            pal['leaf_mid'], pal['leaf_lit']]
    zvar = [variants(c, rng, 30) for c in zdab]
    Hb = noise2(rng, h, w, 0.06 * Wb)
    gy, gx = np.gradient(Hb)
    beta = 0.4 * 0.06 * Wb
    clump_field = noise2(rng, h, w, 0.04 * Wb)
    fields = []
    for (dx, rx, ry) in domes:
        cy0 = top_y + 0.06 * ry
        th = np.arctan2((Y - cy0) / ry, (X - dx) / rx)
        bump = 1 + 0.06 * np.sin(5 * th + rng.uniform(0, 6)) + 0.04 * np.sin(9 * th + rng.uniform(0, 6))
        rr = np.hypot((X - dx) / rx, (Y - cy0) / ry) / bump
        m = np.clip((1 - rr) * min(rx, ry) + 0.5, 0, 1) * np.clip(cy0 - Y + 0.5, 0, 1)
        nx, ny = (X - dx) / rx, (Y - cy0) / ry
        nz = np.sqrt(np.clip(1 - nx * nx - ny * ny, 0.02, 1))
        n = np.stack([nx, ny, nz], -1)
        n /= np.linalg.norm(n, axis=-1, keepdims=True)
        cx_, cy_, cr = crown
        bx, by = (X - cx_) / cr, (Y - cy_) / cr
        bz = np.sqrt(np.clip(1 - bx * bx - by * by, 0.02, 1))
        nb = np.stack([bx, by, bz], -1)
        nb /= np.linalg.norm(nb, axis=-1, keepdims=True)
        nn = 0.7 * n + 0.3 * nb + np.stack([-gx * beta, -gy * beta, np.zeros_like(gx)], -1)
        nn /= np.linalg.norm(nn, axis=-1, keepdims=True)
        s = nn @ LIGHT.astype(np.float32)
        s -= 0.9 * np.clip((Y - (cy0 - 0.16 * ry)) / (0.16 * ry), 0, 1) ** 1.3  # contact dark at the planter
        fields.append((m.astype(np.float32), s.astype(np.float32), (dx, cy0, rx, ry)))
    vis = np.full((h, w), np.nan, np.float32)
    for (m, s, _) in fields:
        vis = np.where(m > 0.5, s, vis)
    t = np.percentile(vis[np.isfinite(vis)], [15, 45, 72])
    front = []
    acc_u = np.zeros((h, w), np.float32)
    for (m, s, _) in fields[::-1]:
        front.append(acc_u.copy())
        acc_u = np.maximum(acc_u, m)
    front = front[::-1]
    D0 = 0.016 * Wb
    for i, (m, s, (dx, cy0, rx, ry)) in enumerate(fields):
        z = np.digitize(s, t)
        col = np.zeros((h, w, 3), np.float32)
        for k in range(4):
            col[z == k] = zbase[k]
        wgt = ndi.gaussian_filter((m > 0).astype(np.float32), 1.5) + 1e-6
        col = np.stack([ndi.gaussian_filter(col[..., c] * (m > 0), 1.5) / wgt for c in range(3)], -1)
        L.comp_full(m, col)
        # broad strokes along the form first (Cape Town's domes), short and low in contrast: the underlayer
        for _ in range(int(rx * ry / 70)):
            u = rng.uniform(-0.92, 0.92)
            v = rng.uniform(0.2, 0.95)
            ang0 = math.pi + math.acos(np.clip(u, -1, 1))
            span = rng.uniform(0.10, 0.2) / max(v, 0.3)
            angs = np.linspace(ang0 - span / 2, ang0 + span / 2, 10)
            path = np.stack([dx + v * rx * np.cos(angs), cy0 + v * ry * np.sin(angs)], 1)
            px, py = path[5]
            ix, iy = int(np.clip(px, 0, w - 1)), int(np.clip(py, 0, h - 1))
            if m[iy, ix] < 0.5 or front[i][iy, ix] > 0.5:
                continue
            zk = int(z[iy, ix])
            items = bristle_stroke(path, rng.uniform(4.0, 6.5), rng, nb=int(rng.integers(4, 6)), dry=0.45)
            if not items:
                continue
            mk, xk, yk = polys_mask(items)
            hh, ww = mk.shape
            Xa, Ya, Xb, Yb = max(xk, 0), max(yk, 0), min(xk + ww, w), min(yk + hh, h)
            if Xb <= Xa or Yb <= Ya:
                continue
            clip = np.zeros_like(mk)
            clip[Ya - yk:Yb - yk, Xa - xk:Xb - xk] = m[Ya:Yb, Xa:Xb] * (1 - front[i][Ya:Yb, Xa:Xb])
            L.comp(mk * clip, xk, yk, mixc(zbase[zk], zdab[zk], 0.5), rng.uniform(0.6, 0.85))
        # then the dabs (the tree's pass, a scale down), the silhouette broken by pointed sprays
        c = dict(x=dx, y=cy0 - 0.5 * ry, r=max(rx, ry), cut=cy0)
        dab_pass(L, c, m, s, z, front[i], D0, (0.70, 0.45, 0.20, 0.06), zvar, t, clump_field, rng, k_cov=1.45)
    texture(L, rng, grain=1.6, mottle=2.0, speck=1 / 600, speck_cols=[pal['leaf_lit'], pal['leaf_shade']])
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
    # the sun-side (left) quarter of the front face is a step lighter: light moving across a face
    lit = np.array([[x0 - 4, top_y], [x0 + 0.22 * (x1 - x0), top_y], [x0 + 0.16 * (x1 - x0), bot_y], [x0 - 4, bot_y]])
    m, xa, ya = polys_mask([lit])
    m = ndi.gaussian_filter(m, 6)
    L.comp(m, xa, ya, C('planter_lit'), 0.8)
    # a lit lip on the rim's front edge (2 px)
    m, xa, ya = lines_mask([(np.array([[x0 - 4, top_y], [x1 + 4, top_y]]), 2.0, 1.0)])
    L.comp(m, xa, ya, shift(C('planter_top'), 6), 0.9)
    texture(L, rng, grain=1.3, mottle=1.8)
    return L


# ----------------------------------------------------------------------------------------------------------------
# 6. ELEMENT 3: grass and wind-blown reeds (recipe 3.3)
# ----------------------------------------------------------------------------------------------------------------
def fbm1(rng, n, scale):
    v = rng.standard_normal(n + 64)
    v = ndi.gaussian_filter1d(v, scale)
    v = v[32:32 + n]
    return v / (v.std() + 1e-8)


def blade_path(x, yb, length, lean, bend, rng, n=22):
    """A blade from its root (x, yb): up, leaning downwind (+x), the tip bending further (quadratic)."""
    up = np.array([math.sin(lean), -math.cos(lean)])
    tipdir = np.array([math.sin(lean + bend), -math.cos(lean + bend)])
    p0 = np.array([x, yb])
    p2 = p0 + up * length * 0.55 + tipdir * length * 0.5
    p1 = p0 + up * length * 0.62
    return bez(p0, p1, p2, n)


def paint_reeds(w, h, rng, x0, x1, yb, hmax, wind=0.42):
    L = Layer(w, h)
    Wd = x1 - x0
    xs = np.arange(w)
    gust = fbm1(rng, w, 55)  # rhythm in the lean: groups lean more, never parallel combing
    # the MASS is lower than the blades: the blades and plumes make the ragged top above it (refs 02, van)
    hm = hmax * (0.60 + 0.06 * fbm1(rng, w, 40) + 0.05 * fbm1(rng, w, 10))
    hm = np.where((xs >= x0) & (xs < x1), hm, 0)
    taper = np.clip(np.minimum(xs - x0, x1 - xs) / 40.0, 0, 1) ** 0.7
    hm = hm * taper
    lean_x = wind + 0.16 * gust
    # P0 the MASS: a band with a ragged top, leaning downwind, deep at the root, lighter toward the top
    Y, X = np.mgrid[0:h, 0:w].astype(np.float32) + 0.5
    shear = (yb - Y) * np.tan(lean_x)[None, :] * 0.25
    Xs = np.clip((X - shear).astype(int), 0, w - 1)
    rag = 2.0 * fbm1(rng, w, 4.0)  # small-scale raggedness only (the blades carry the real edge)
    topv = (yb - hm + rag)[Xs]
    mass = np.clip(Y - topv + 0.5, 0, 1) * np.clip(yb - Y + 0.5, 0, 1) * (hm[Xs] > 2)
    fr = np.clip((yb - Y) / np.maximum(hm[Xs], 1), 0, 1)  # 0 root .. 1 top
    cols = [C('grass_deep'), C('grass_shade'), C('grass_mid')]
    col = np.where(fr[..., None] < 0.30, cols[0], np.where(fr[..., None] < 0.70, cols[1], cols[2]))
    col = np.stack([ndi.gaussian_filter(col[..., i], 3.0) for i in range(3)], -1)
    L.comp_full(mass.astype(np.float32), col)
    snaps = {'P0 mass': L.copy()}
    # P1 back blades: thin, mid-dark, many (one per ~3.5 px), from the root to past the top
    back = []
    for _ in range(int(Wd / 3.4)):
        x = rng.uniform(x0 + 4, x1 - 4)
        ix = int(x)
        if hm[ix] < 6:
            continue
        ln = hm[ix] * rng.uniform(1.05, 1.62)
        lean = float(lean_x[ix]) * rng.uniform(0.6, 1.25) + rng.normal(0, 0.09)
        path = blade_path(x, yb + 2, ln, lean * 0.55, lean * rng.uniform(0.6, 1.2), rng)
        wd = rng.uniform(1.5, 2.6)
        widths = wd * np.linspace(1, 0.12, len(path)) ** 0.9
        tcol = mixc('grass_shade', 'grass_mid', rng.uniform(0.15, 0.8))
        back.append((path, widths, tcol))
        m, xa, ya = polys_mask([ribbon(path, widths)])
        L.comp(m, xa, ya, tcol, rng.uniform(0.75, 0.95))
    snaps['P1 back blades'] = L.copy()
    # P2 plumes: on ~45 % of the blades, a feathery head along the last third, mid with a lit upper edge
    tipv = variants(C('grass_tip'), rng, 24)
    litv = variants(C('grass_lit'), rng, 24)
    for (path, widths, tcol) in back:
        if rng.random() > 0.45:
            continue
        k0 = int(len(path) * rng.uniform(0.55, 0.7))
        seg = path[k0:]
        if len(seg) < 4:
            continue
        mw = rng.uniform(3.0, 5.2)
        tt = np.linspace(0, 1, len(seg))
        pw = mw * np.sin(np.pi * np.clip(tt * 0.9 + 0.08, 0, 1)) ** 0.7
        m, xa, ya = polys_mask([ribbon(seg, pw)])
        L.comp(m, xa, ya, mixc('grass_mid', 'grass_lit', rng.uniform(0.3, 0.7)), 0.95)
        # lit upper edge (the light from the upper left): a narrower plume offset toward the light
        d = np.gradient(seg, axis=0)
        d /= np.maximum(np.linalg.norm(d, axis=1, keepdims=True), 1e-9)
        nrm = np.stack([-d[:, 1], d[:, 0]], 1)
        sgn = -1 if (nrm[len(nrm) // 2] @ np.array([-0.8, -0.6])) < 0 else 1
        seg2 = seg + nrm * sgn * pw[:, None] * 0.28
        m, xa, ya = polys_mask([ribbon(seg2, pw * 0.42)])
        L.comp(m, xa, ya, litv[int(rng.integers(0, 24))], 0.9)
    snaps['P2 plumes'] = L.copy()
    # P3 front blades: fewer, thin LIT strokes over the darker mass (the van ref), and a few dark ones for depth
    for _ in range(int(Wd / 8.5)):
        x = rng.uniform(x0 + 6, x1 - 6)
        ix = int(x)
        if hm[ix] < 6:
            continue
        ln = hm[ix] * rng.uniform(0.6, 1.45)
        lean = float(lean_x[ix]) * rng.uniform(0.7, 1.3) + rng.normal(0, 0.08)
        path = blade_path(x, yb + 3, ln, lean * 0.6, lean * rng.uniform(0.7, 1.2), rng)
        widths = rng.uniform(1.1, 1.7) * np.linspace(1, 0.1, len(path))
        m, xa, ya = polys_mask([ribbon(path, widths)])
        L.comp(m, xa, ya, litv[int(rng.integers(0, 24))], rng.uniform(0.55, 0.85))
    for _ in range(int(Wd / 30)):
        x = rng.uniform(x0 + 6, x1 - 6)
        ix = int(x)
        if hm[ix] < 6:
            continue
        path = blade_path(x, yb + 3, hm[ix] * rng.uniform(0.6, 0.95), float(lean_x[ix]) * 0.5, 0.5, rng)
        widths = rng.uniform(1.6, 2.4) * np.linspace(1, 0.1, len(path))
        m, xa, ya = polys_mask([ribbon(path, widths)])
        L.comp(m, xa, ya, C('grass_deep'), 0.8)
    snaps['P3 front blades'] = L.copy()
    # P4 the lightest touches: 1 px highlights on some plume tips, sun side (left) favoured
    lines = []
    for (path, widths, tcol) in back:
        if rng.random() > 0.22 * (1.3 - (path[0, 0] - x0) / Wd):
            continue
        k0 = int(len(path) * 0.72)
        seg = path[k0:] + np.array([-0.8, -0.6]) * 1.2
        lines.append((seg, rng.uniform(0.9, 1.3), 1.0))
    for ln in lines:
        m, xa, ya = lines_mask([ln])
        L.comp(m, xa, ya, tipv[int(rng.integers(0, 24))], rng.uniform(0.6, 0.9))
    texture(L, rng, grain=1.4, mottle=1.4)
    snaps['final'] = L.copy()
    return L, snaps


def paint_near_blades(w, h, rng, n=4, sigma=2.6):
    """Out-of-focus near plumes framing a bottom corner (02's near reeds): big, a step darker than the bed, low
    contrast, blurred (sigma 2.6 px = 10-90 % edges ~6.5 px, as measured)."""
    L = Layer(w, h)
    for i in range(n):
        x = (rng.uniform(-0.04, 0.16) if i % 2 == 0 else rng.uniform(0.78, 0.98)) * w
        ln = rng.uniform(0.45, 0.8) * h
        lean = rng.uniform(0.3, 0.6) * (1 if x < w / 2 else 0.6)
        path = blade_path(x, h + 12, ln, lean * 0.6, lean * 0.9, rng, n=30)
        tt = np.linspace(0, 1, len(path))
        widths = rng.uniform(22, 30) * (0.45 + 0.55 * np.sin(np.pi * np.clip(tt * 0.95, 0, 1)) ** 0.8) * (1 - tt) ** 0.3
        m, xa, ya = polys_mask([ribbon(path, widths)])
        L.comp(m, xa, ya, shift(C('grass_shade'), -9, 0.9), rng.uniform(0.72, 0.85))
    L.blur(sigma)
    return L


# ----------------------------------------------------------------------------------------------------------------
# 7. ELEMENT 4: the protea-like flowering plant (recipe 3.4)
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
    """Two flat facets split along the midline: the folded-paper look (05). Returns (poly_lit_side, poly_shade_side)
    with the lit side chosen as the one facing the light."""
    full, left, right, mid = bract_poly(bx, by, length, width, ang, curl=curl)
    polyL = np.concatenate([left, mid[::-1]], 0)
    polyR = np.concatenate([mid, right[::-1]], 0)
    nL = np.array([-math.sin(ang), math.cos(ang)])  # the 'left' side's normal direction (y down)
    lit_left = (nL @ LIGHT[:2]) > 0
    return (polyL, polyR) if lit_left else (polyR, polyL)


def paint_protea(w, h, rng, cx, cy, R, leaves=True, scale_leaf=1.0):
    """The protea-like flower (05): a cream dome sitting in a CUP of broad, overlapping two-facet bracts; long
    two-tone leaves behind it make the darker field the head reads against."""
    L = Layer(w, h)

    def bract(bx, by, ln, wd, ang, cols, curl=0.0):
        lit, sh = facet_masks(bx, by, ln, wd, ang, curl)
        for poly, cname in [(sh, cols[0]), (lit, cols[1])]:
            m, xa, ya = polys_mask([poly])
            L.comp(m, xa, ya, variants(C(cname), rng, 1)[0])

    # 1. leaves (behind): lanceolate-elliptic, width 0.30-0.36 of the length, split by the midrib into a lit and a
    # shade half, three greens; a light midrib on 80 % of the length
    if leaves:
        lv = []
        for i, (a, hy) in enumerate([(-138, 1.15), (-104, 1.05), (-74, 1.05), (-42, 1.15), (172, 1.8), (12, 1.9),
                                     (148, 2.5), (34, 2.6), (160, 3.1)]):
            a = math.radians(a + rng.normal(0, 7))
            ln = R * rng.uniform(2.2, 3.0) * scale_leaf
            bx = cx + rng.normal(0, 0.1) * R
            by = cy + R * hy
            lv.append((bx, by, ln, ln * rng.uniform(0.30, 0.36), a))
        greens = [('leaf_shade', 'leaf_mid'), ('leaf_deep', 'leaf_shade'), ('leaf_mid', 'leaf_lit')]
        for j, (bx, by, ln, wd, a) in enumerate(lv):
            pair = greens[j % 3]
            curl = rng.uniform(-0.10, 0.10)
            full, le, ri, mid = bract_poly(bx, by, ln, wd, a, curl=curl, n=16)
            # an elliptic leaf: re-profile the bract into both-ends-pointed
            t = np.linspace(0, 1, 16)
            hw = 0.5 * wd * np.sin(np.pi * t) ** 0.75
            u = t * ln
            bend = curl * t ** 2 * ln
            ca, sa = math.cos(a), math.sin(a)
            Rm = np.array([[ca, -sa], [sa, ca]])
            left = np.stack([u, hw + bend], 1) @ Rm.T + [bx, by]
            right = np.stack([u, -hw + bend], 1) @ Rm.T + [bx, by]
            midl = np.stack([u, bend], 1) @ Rm.T + [bx, by]
            polyA = np.concatenate([left, midl[::-1]], 0)
            polyB = np.concatenate([midl, right[::-1]], 0)
            nA = np.array([-sa, ca])
            lit_first = (nA @ LIGHT[:2]) > 0
            lit_p, sh_p = (polyA, polyB) if lit_first else (polyB, polyA)
            for poly, cname in [(sh_p, pair[0]), (lit_p, pair[1])]:
                m, xa, ya = polys_mask([poly])
                L.comp(m, xa, ya, variants(C(cname), rng, 1)[0])
            m, xa, ya = lines_mask([(midl[1:13], 1.3, 1.0)])
            L.comp(m, xa, ya, shift(C(pair[1]), 9), 0.6)
    # 2. the stem
    stem = bez((cx + 0.15 * R, cy + 3.6 * R), (cx - 0.12 * R, cy + 2.2 * R), (cx, cy + 0.8 * R), 20)
    m, xa, ya = polys_mask([ribbon(stem, np.linspace(0.16 * R, 0.11 * R, 20))])
    L.comp(m, xa, ya, C('stem'))
    # 3. the back ring (behind the dome): broad bracts fanning up and outward, tips 0.7-1.0 R past the dome
    nb = 11
    for i in range(nb):
        a = math.radians(-172 + 164 * (i + rng.uniform(-0.2, 0.2)) / (nb - 1))
        bx, by = cx + math.cos(a) * 0.40 * R, cy + math.sin(a) * 0.36 * R + 0.15 * R
        bract(bx, by, R * rng.uniform(1.25, 1.5), R * rng.uniform(0.52, 0.60), a, ('bract_shade', 'bract_mid'),
              rng.uniform(-0.06, 0.06))
    # 4. the dome: cream, lit cap on the sun side, its lower part in shade; fine radial strokes from a point below
    Y, X = np.mgrid[0:h, 0:w].astype(np.float32) + 0.5
    ry = R * 0.86
    dm = np.clip((1 - np.hypot((X - cx) / R, (Y - cy) / ry)) * R + 0.5, 0, 1)
    nx, ny = (X - cx) / R, (Y - cy) / ry
    nz = np.sqrt(np.clip(1 - nx * nx - ny * ny, 0.02, 1))
    s = (np.stack([nx, ny, nz], -1) @ LIGHT.astype(np.float32))
    zc = np.where(s[..., None] > 0.55, C('dome_lit'), np.where(s[..., None] > 0.1, C('dome_mid'), C('dome_shade')))
    zc = np.stack([ndi.gaussian_filter(zc[..., i], 1.5) for i in range(3)], -1)
    L.comp_full(dm.astype(np.float32), zc)
    fx, fy = cx + 0.05 * R, cy + 0.8 * R
    lines = []
    for i in range(int(R * 7)):
        a = rng.uniform(math.pi * 1.0, math.pi * 2.0)
        r0 = rng.uniform(0.3, 1.65) * R
        ln = R * rng.uniform(0.10, 0.20)
        p0 = np.array([fx + math.cos(a) * r0, fy + math.sin(a) * r0 * 0.95])
        if ((p0[0] - cx) / R) ** 2 + ((p0[1] - cy) / ry) ** 2 > 0.86:
            continue
        p1 = p0 + np.array([math.cos(a), math.sin(a)]) * ln
        lines.append((np.array([p0, p1]), rng.uniform(0.9, 1.4), rng.uniform(0.5, 0.95)))
    if lines:
        m, xa, ya = lines_mask(lines)
        dmc = place(dm, 0, 0, w, h)
        hh, ww = m.shape
        Xa, Ya, Xb, Yb = max(xa, 0), max(ya, 0), min(xa + ww, w), min(ya + hh, h)
        clip = np.zeros_like(m)
        clip[Ya - ya:Yb - ya, Xa - xa:Xb - xa] = dmc[Ya:Yb, Xa:Xb]
        L.comp(m * clip, xa, ya, C('dome_hatch'), 0.5)
    # 5. the front of the cup: bracts rooted below the dome's middle, pointing up and outward, overlapping its lower
    # half (the dome shows ~its top 55 %); outer ones a step darker, inner ones lit; 2 small ones turned down
    for kind, n, rad, a0, a1, lm, cols in [('outer', 8, 0.62, -168, -12, (0.95, 1.2), ('bract_shade', 'bract_mid')),
                                            ('inner', 6, 0.42, -140, -40, (0.85, 1.05), ('bract_mid', 'bract_lit'))]:
        for i in range(n):
            a = math.radians(a0 + (a1 - a0) * (i + rng.uniform(-0.2, 0.2)) / (n - 1))
            bx = cx + math.cos(a) * rad * R * 0.9
            by = cy + 0.95 * R + math.sin(a) * 0.12 * R
            ang = math.atan2(math.sin(a), math.cos(a) * 1.25)
            bract(bx, by, R * rng.uniform(*lm), R * rng.uniform(0.48, 0.56), ang, cols, rng.uniform(-0.08, 0.08))
    for a in (152, 28):
        a = math.radians(a + rng.normal(0, 6))
        bract(cx + math.cos(a) * 0.3 * R, cy + 1.0 * R, R * 0.7, R * 0.36, a, ('bract_deep', 'bract_shade'))
    texture(L, rng, grain=1.8, mottle=1.8, speck=1 / 900, speck_cols=[C('dome_lit'), C('bract_lit')])
    return L


# ----------------------------------------------------------------------------------------------------------------
# 8. ELEMENT 5: near leaves framing a corner (recipe 3.5)
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


def paint_corner_leaves(w, h, rng, sky_rgb_at):
    L = Layer(w, h)
    near = Layer(w, h)
    twig = bez((-10, 22), (w * 0.30, 28), (w * 0.60, h * 0.30), 30)
    m, xa, ya = polys_mask([ribbon(twig, np.linspace(5.5, 1.4, 30))])
    L.comp(m, xa, ya, C('aut_deep'))
    for k, (dx, dy) in [(9, (40, -18)), (17, (34, 30))]:  # two side twigs
        p0 = twig[k]
        side = bez(p0, p0 + np.array([dx * 0.5, dy * 0.2]), p0 + np.array([dx, dy]), 10)
        m, xa, ya = polys_mask([ribbon(side, np.linspace(2.6, 1.0, 10))])
        L.comp(m, xa, ya, C('aut_deep'))
    # leaves alternate along the twig on short stalks (0.35 R), pointing out from it and drooping, smaller toward
    # its tip; the two at the corner are the nearest (bigger, then out of focus)
    spots = [0.05, 0.15, 0.30, 0.42, 0.55, 0.67, 0.79, 0.92]
    leaves = []
    tang = np.gradient(twig, axis=0)
    for i, f in enumerate(spots):
        k = int(f * (len(twig) - 1))
        px, py = twig[k]
        ta = math.atan2(tang[k, 1], tang[k, 0])
        side = 1 if i % 2 == 0 else -1
        ang = ta + side * math.radians(rng.uniform(40, 80))
        ang = ang + (math.pi / 2 - ((ang + math.pi) % (2 * math.pi) - math.pi)) * 0.35  # droop toward down
        R = rng.uniform(32, 44) * (1 - 0.3 * f) * (1.3 if i < 2 else 1.0)
        st = 0.35 * R
        cx_ = px + math.cos(ang) * (st + 0.78 * R)
        cy_ = py + math.sin(ang) * (st + 0.78 * R)
        leaves.append((i, px, py, cx_, cy_, R, ang))
    leaves.sort(key=lambda v: (v[0] >= 2, v[4]))  # far (twig-side) leaves first, nearest last
    for (i, px, py, cx_, cy_, R, hang) in leaves:
        target = near if i < 2 else L
        # the stalk
        m, xa, ya = lines_mask([(np.array([[px, py], [cx_ - math.cos(hang) * R * 0.32, cy_ - math.sin(hang) * R * 0.32]]),
                                 1.6, 1.0)])
        target.comp(m, xa, ya, C('aut_deep'), 0.95)
        pts, tips = palmate_poly(cx_, cy_, R, hang, rng, squash=rng.uniform(0.62, 1.0))
        m, xa, ya = polys_mask([pts])
        turn = rng.random()
        lit_c, sh_c = ('aut_lit', 'aut_mid') if turn < 0.55 else ('aut_mid', 'aut_shade')
        target.comp(m, xa, ya, variants(C(sh_c), rng, 1)[0])
        # the lit facet: the half on the sun's side of the midrib (an analytic half-plane, AA 1 px)
        hh, ww = m.shape
        Yl, Xl = np.mgrid[0:hh, 0:ww].astype(np.float32) + 0.5
        Xl += xa
        Yl += ya
        nrm = np.array([-math.sin(hang), math.cos(hang)])
        if nrm @ LIGHT[:2] < 0:
            nrm = -nrm
        sd = (Xl - cx_) * nrm[0] + (Yl - cy_) * nrm[1]
        half = np.clip(sd + 0.5, 0, 1)
        target.comp(m * half, xa, ya, variants(C(lit_c), rng, 1)[0])
        # veins: from the stalk point to each lobe tip, 1 px, a step lighter on the shade facet, darker on the lit
        base = (cx_ - math.cos(hang) * R * 0.28, cy_ - math.sin(hang) * R * 0.28)
        vl = [(np.array([base, (base[0] * 0.15 + tx * 0.85, base[1] * 0.15 + ty * 0.85)]), 1.0, 1.0) for tx, ty in tips]
        mv, xv, yv = lines_mask(vl)
        clipm = place(m, xa, ya, w, h)[max(yv, 0):max(yv, 0) + mv.shape[0], max(xv, 0):max(xv, 0) + mv.shape[1]]
        if clipm.shape == mv.shape:
            mv = mv * clipm
        target.comp(mv, xv, yv, shift(C(sh_c), 7), 0.4)
    texture(L, rng, grain=1.6, mottle=1.6)
    texture(near, rng, grain=1.0, mottle=1.0)
    # the nearest leaves: a step darker, a little duller and out of focus (02's near plane), never a black silhouette
    rgbv = near.rgb()
    a = near.alpha()
    lab = skc.rgb2lab(np.clip(rgbv, 0, 1))
    lab[..., 0] -= 6
    lab[..., 1:] *= 0.85
    near.px[..., :3] = np.clip(skc.lab2rgb(lab), 0, 1) * a[..., None]
    near.blur(1.8)
    return L, near


# ----------------------------------------------------------------------------------------------------------------
# 9. The sheet
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


def build_tree_panel(rng_seed, snaps=None):
    rng = np.random.default_rng(rng_seed)
    w, h = 420, 470
    bg = paving_bg(w, h, rng)
    base = (205, 445)
    bg = cast_shadow(bg, base[0] + 95, base[1] + 4, 150, 16, rng, depth=-8.0, soft=3.0)
    bg = cast_shadow(bg, base[0] + 8, base[1] + 2, 26, 6, rng, depth=-12.0, soft=1.5)
    bgc = bg.copy()
    tree = paint_tree(w, h, base, (210, 190), 330, 270, rng, 'near', bg_at=lambda x, y: bgc[int(y), int(x)],
                      snaps=snaps)
    return over(bg, tree), bg


def build_depth_panel(seed):
    """The ladder in one view: far trees on the far bank, mid trees on the towpath, a near crown cut by the edge;
    the same recipe on three planes, each converging on the air behind it."""
    rng = np.random.default_rng(seed)
    w, h = 600, 320
    air = C('horizon')
    bg = bg_vertical(w, h, [(0, C('field')), (0.42, C('band')), (0.62, C('horizon')), (0.63, mixc('horizon', 'water', 0.5)),
                            (0.645, C('water')), (0.76, shift(C('water'), 1)), (0.77, C('paving_far')),
                            (1.0, C('paving'))], rng)
    out = bg.copy()
    for i, x in enumerate([30, 78, 128, 176, 226]):  # far: on the far bank (y ~ 200)
        cw = 52 + 14 * ((i * 7) % 3)
        Lf = paint_tree(w, h, (x, 203), (x, 203 - 0.36 * cw), cw, 0.8 * cw, rng, 'far', air=air)
        out = over(out, Lf)
    for x, cw in [(250, 120), (352, 136)]:  # mid: on the towpath (y ~ 262)
        Lm = paint_tree(w, h, (x, 262), (x, 262 - 0.95 * cw), cw, 0.82 * cw, rng, 'mid', air=air,
                        bg_at=lambda xx, yy: bg[int(min(max(yy, 0), h - 1)), int(min(max(xx, 0), w - 1))])
        out = over(out, Lm)
    Ln = paint_tree(w, h, (560, 420), (590, 120), 330, 270, rng, 'near',  # near: cut by the right edge
                    bg_at=lambda xx, yy: out[int(min(max(yy, 0), h - 1)), int(min(max(xx, 0), w - 1))])
    return over(out, Ln)


def build_bush_panel(seed):
    rng = np.random.default_rng(seed)
    w, h = 420, 300
    bg = paving_bg(w, h, rng)
    bg = cast_shadow(bg, 300, 268, 150, 18, rng, depth=-8)
    pl = paint_planter(w, h, 60, 360, 190, 262, 22, rng)
    bush = paint_bush(w, h, rng, 172, 60, 360, 128)
    return over(over(bg, pl), bush)


def build_reeds_panel(seed):
    rng = np.random.default_rng(seed)
    w, h = 560, 300
    bg = bg_vertical(w, h, [(0, C('water')), (0.62, shift(C('water'), 1.5)), (0.63, C('paving_far')),
                            (1.0, C('paving'))], rng)
    reeds, snaps = paint_reeds(w, h, rng, 20, 540, 222, 170)
    near = paint_near_blades(w, h, np.random.default_rng(seed + 7))
    img = over(over(bg, reeds), near)
    strip = [over(bg, snaps[k]) for k in ['P0 mass', 'P1 back blades', 'P2 plumes', 'P3 front blades']]
    return img, strip


def build_protea_panel(seed):
    rng = np.random.default_rng(seed)
    w, h = 420, 380
    bg = bg_vertical(w, h, [(0, shift(C('planter_shade'), -8, 0.8)), (0.55, C('planter_shade')),
                            (0.56, C('paving_far')), (1.0, C('paving'))], rng)
    pr = paint_protea(w, h, rng, 180, 150, 38)
    pr2 = paint_protea(w, h, np.random.default_rng(seed + 3), 318, 200, 26, leaves=True, scale_leaf=0.8)
    return over(over(bg, pr2), pr)


def build_corner_panel(seed):
    rng = np.random.default_rng(seed)
    w, h = 420, 300
    bg = bg_vertical(w, h, [(0, C('zenith')), (1.0, C('field'))], rng)
    L, near = paint_corner_leaves(w, h, rng, lambda x, y: bg[int(y), int(x)])
    return over(over(bg, L), near)


def label(dr, xy, text, sz=15, bold=False, fill=(46, 40, 56)):
    dr.text(xy, text, fill=fill, font=font(sz, bold))


def fit(im, hgt):
    w, h = im.size
    return im.resize((max(1, int(round(w * hgt / h))), hgt), Image.LANCZOS)


def sheet(seed=SEED):
    t0 = time.time()
    snaps = {}
    tree_img, tree_bg = build_tree_panel(seed + 1, snaps)
    depth = build_depth_panel(seed + 2)
    bush = build_bush_panel(seed + 3)
    reeds, reed_strip = build_reeds_panel(seed + 4)
    protea = build_protea_panel(seed + 5)
    corner = build_corner_panel(seed + 6)
    t_paint = time.time() - t0

    W = 1600
    rows = []
    pad = 16

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
        hgt = max(oh, rh) + 60
        im = Image.new('RGB', (W, hgt), (250, 246, 242))
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

    row('1  Tree crown: lit and shade masses built from clusters, painted with leaf-spray dabs',
        ['kyoto_tree', 'hanoi_tree', 'singapore_tree'], tree_img,
        'Design: 9 clusters, 4 values by area (deep 17 / shade 30 / mid 27 / lit 26 %), one light (the low sun, left). '
        'Paint: inner dark + branches, flat zones, dabs one step lighter, accents, sky holes 3.4 %, grain. Edges crisp.',
        ref_h=300)
    # the pass strip
    keys = ['P0 inner dark', 'P1 branches', 'P2 flat value zones', 'P4 leaf-spray dabs', 'P5 sky holes',
            'P6 accents + texture (final)']
    strip_h = 250
    st = Image.new('RGB', (W, strip_h + 40), (250, 246, 242))
    dr = ImageDraw.Draw(st)
    label(dr, (pad, 6), '1b  The tree pass by pass (each pass blurred less than the one before; the plane blur last)', 15,
          True)
    x = pad
    for k in keys:
        if k not in snaps:
            continue
        im = to_img(over(tree_bg, snaps[k]))
        im = fit(im, strip_h - 10)
        st.paste(im, (x, 30))
        label(dr, (x + 4, 32), k, 12, True)
        x += im.size[0] + 8
    rows.append(st)
    row('2  Depth ladder: the same recipe on the far and mid planes (converge on the air, fewer values, simpler)',
        ['hanoi_far', 'bus_trees'], depth,
        'far: k 0.55, 2 values, no dabs inside, blur 0.9 px | mid: k 0.30, 3 values, dabs 3.2 % of the crown, '
        'blur 0.5 px | near (cut, right): k 0, 4 values + accents, dabs 1.8 %, no blur')
    row('3  Bush in a planter: domes, brushed arcs along the form, a leafy edge; the planter flat (lit and shade face)',
        ['cape_domes', 'sing_crowns'], bush,
        'Dome lit cap / mid / shade / contact dark at the planter; bristle strokes on the dome\'s latitude lines; '
        'sprays only on the silhouette.')
    row('4  Grass and wind-blown reeds: a MASS first, then blades, plumes with lit upper edges, a few lit front blades',
        ['bus_reeds', 'van_grass', 'hill_grass'], reeds,
        'Mass (deep root -> lit top, ragged top leaning downwind), back blades 1 per 3.4 px, plumes on 45 %, '
        'front lit blades 1 per 8.5 px, 1 px tip lights; near plumes out of focus (sigma 2.6).', ref_h=220)
    st2 = Image.new('RGB', (W, 190), (250, 246, 242))
    dr = ImageDraw.Draw(st2)
    label(dr, (pad, 6), '4b  The reeds pass by pass', 15, True)
    x = pad
    for k, im_ in zip(['P0 mass', 'P1 back blades', 'P2 plumes', 'P3 front blades'], reed_strip):
        im = fit(to_img(im_), 150)
        st2.paste(im, (x, 30))
        label(dr, (x + 4, 32), k, 12, True)
        x += im.size[0] + 8
    rows.append(st2)
    row('5  Near flowering plant (protea-like): a radial-hatched cream dome, folded two-facet bracts, two-tone leaves',
        ['cape_protea'], protea,
        'Dome R 40 px: lit cap, lower shade, radial strokes 1-1.4 px; bracts 1.0-1.45 R long, 0.3-0.38 R wide, '
        'each a lit and a shade facet; leaves split by a light midrib.')
    row('6  Near leaves framing a corner: few, small, two-facet autumn leaves; the nearest two out of focus',
        ['kyoto_maple', 'sing_leaves', 'bus_near'], corner,
        'Leaves 44-85 px (R 22-34), on one twig from the corner; lit facet on the sun side of the midrib; '
        'veins 1 px at 40 %; the nearest two -6 L*, x0.85 chroma, blur 1.8 px.', ref_h=250)

    total_h = sum(r.size[1] for r in rows) + 60
    out = Image.new('RGB', (W, total_h), (250, 246, 242))
    dr = ImageDraw.Draw(out)
    label(dr, (pad, 14), 'Foliage recipe proof (docs/look/paint_recipes/foliage.md): each element painted by '
          'scripts/look/paint/recipes/foliage.py, beside the reference crops', 17, True)
    y = 46
    for r in rows:
        out.paste(r, (0, y))
        y += r.size[1]
    return out, t_paint


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--out', default=OUT)
    ap.add_argument('--seed', type=int, default=SEED)
    ap.add_argument('--check', action='store_true', help='bake twice and compare md5; print the tree numbers')
    a = ap.parse_args()
    im, tp = sheet(a.seed)
    os.makedirs(os.path.dirname(a.out), exist_ok=True)
    im.save(a.out, optimize=True)
    print('wrote', a.out, im.size, 'paint %.1f s' % tp)
    if a.check:
        im2, _ = sheet(a.seed)
        h1 = hashlib.md5(im.tobytes()).hexdigest()
        h2 = hashlib.md5(im2.tobytes()).hexdigest()
        print('deterministic:', h1 == h2, h1)


if __name__ == '__main__':
    main()
