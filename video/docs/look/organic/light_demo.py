#!/usr/bin/env python3
"""light_demo.py: the PROPER LIGHT proof for scene 1 (docs/look/organic/light.md, an iteration, never production).

The scene-1 canal at an October dusk, still v6 (src/look/paint_s1, set 'v6'), relit by the rig light.md specifies:
the low sun on the left as the KEY (behind the far roofs: the sky's glow and bloom at the disc, warm rims on what faces
it, a few soft shafts low over the water) and the lit Google doorway as the STORY LIGHT on her (the source lifted, a
gentle bloom at the opening, its pool on the towpath with her shadow in it, light wrap and a rim on her). The facade
facing us is backlit, so it sits in the dusk's lilac shade; our near bank lies in the shade of trees off-screen left
(one big quiet mass with a leafy edge). Everything is computed from the engine's own renders of the scene and their
layer masks (render-frames.mjs on src/entry-look-paint.tsx; the commands are in light.md §8), in LINEAR light:
    out = base * E + G        E = the multiply light map (shade < 1, light > 1), G = the additive glow (bloom, shafts)
Captions are pasted back unlit. Deterministic: no unseeded randomness (the leafy edge and the dither are sha256-seeded).

    python3 light_demo.py <renders_dir> <out_dir> [--times 1.0,1.6] [--repeat 2]
renders_dir holds base/ cap/ norow/ nosky/ skyonly/ (f%05d.png at 60 fps). Writes lit_fXXXXX.png, maps_fXXXXX.jpg,
metrics.json and the sheet. --repeat 2 runs twice and checks the md5s match.
"""
import hashlib
import json
import os
import sys
import time

import cv2
import numpy as np

H, W = 1920, 1080
SUN = (195.0, 745.0)          # the painted disc's centre in v6 (measured: bbox x 176-215, y 732-753, cut by the roofs)
SUN_R = 20.0
HORIZON_Y = 965.0             # S1_LENS.horizonY (the level lens's true horizon, hidden by the far bank)
VP_SUN = (SUN[0], HORIZON_Y)  # the sun's shadow vanishing point: on the horizon straight under the sun
DOOR = (540, 848, 720, 1082)  # S1_SHEET.door (x0, y0, x1, y1)
FEET_Y = 1095.0               # her line on the straight (S1_LENS.herLineFeetY)
COPING_Y = 1110.0             # the far coping's front edge (the water starts)
BAND = (290, 610)             # the caption band rows the light never touches (CRAFT: one value across the band)
WING = np.array([[330, 640], [1080, 600], [1080, 1084], [330, 1084]], np.int32)   # S1_SHEET.wing + parapet

# The rig's colours (the dusk light table: PAINT_RECIPES §3 C5; light.md §6.1).
SUN_LIGHT = '#FFC27A'         # the low sun's light (gold-peach; the glint's #ee6a2e is its saturated core)
SHADE_WARM = '#C79AB4'        # the shade family on warm surfaces (rose-plum: CRAFT §d.3 keeps their chroma, 5-20 deg to rose)
SHADE_COOL = '#A49BD6'        # the same family on cool surfaces (violet: 10-16 deg toward violet)
DOOR_LIGHT = '#FFE2AE'        # the lobby's light (a warm 2700-3000 K interior, cream-gold)
ROSE_BOUNCE = '#F2B8A8'       # warm bounce from the terracotta ground into the undersides


# The float (src/look/paint_s1/V2S1_float.tsx S1_FLOAT_LEGS, lib/depth floatAt with ease 0.25, PARALLAX_K shares): every
# light layer rides the group of the plane it lies on, so the proof moves each one by its plane's share.
FLOAT_LEGS = [(1.1, 2.3, (-8.0, -3.0)), (2.3, 3.4, (-4.0, -9.0)), (3.4, 4.6, (4.0, -7.0)), (4.6, 5.8, (0.0, 0.0))]
SHARE = {'near': 1.0, 'bank': 0.85, 'water': 0.725, 'subject': 0.6, 'sky': 0.0}


def float_at(t, ease=0.25):
    fr = (0.0, 0.0)
    for t0, t1, to in FLOAT_LEGS:
        if t < t0:
            return fr
        if t <= t1:
            s_ = min(1.0, max(0.0, (t - t0) / max(1e-6, t1 - t0)))
            a = ease
            u = (0.5 * s_ * s_) / (a * (1 - a)) if s_ < a else (1 - (0.5 * (1 - s_) * (1 - s_)) / (a * (1 - a)) if s_ > 1 - a else (s_ - a / 2) / (1 - a))
            return (fr[0] + (to[0] - fr[0]) * u, fr[1] + (to[1] - fr[1]) * u)
        fr = to
    return fr


def offset(t, plane):
    fx, fy = float_at(t)
    k = SHARE[plane]
    return fx * k, fy * k


def shift(img, dx, dy):
    """A map moved by its plane's float (sub-pixel, bilinear, as the browser draws a translated group)."""
    if abs(dx) < 1e-4 and abs(dy) < 1e-4:
        return img
    M = np.float32([[1, 0, dx], [0, 1, dy]])
    return cv2.warpAffine(img, M, (img.shape[1], img.shape[0]), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REPLICATE)


# ------------------------------------------------------------------------------------------------ colour helpers
def hex_rgb(h):
    h = h.lstrip('#')
    return np.array([int(h[i:i + 2], 16) / 255.0 for i in (0, 2, 4)], np.float32)


def to_lin(c):
    c = np.asarray(c, np.float32)
    return np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4).astype(np.float32)


def to_srgb(c):
    c = np.clip(c, 0.0, None)
    return np.where(c <= 0.0031308, 12.92 * c, 1.055 * np.power(c, 1 / 2.4) - 0.055).astype(np.float32)


def lin_hex(h):
    return to_lin(hex_rgb(h))


def load(path):
    im = cv2.imread(path, cv2.IMREAD_COLOR)
    if im is None:
        raise SystemExit(f'missing {path}')
    return im[..., ::-1].astype(np.float32) / 255.0      # RGB 0..1 (sRGB)


def lstar(rgb01):
    """CIE L* of an sRGB image (0..1)."""
    y = (to_lin(rgb01) * np.array([0.2126, 0.7152, 0.0722], np.float32)).sum(-1)
    return np.where(y > 216 / 24389, 116 * np.cbrt(y) - 16, y * 24389 / 27)


def rng_for(*key):
    return np.random.default_rng(int(hashlib.sha256(':'.join(map(str, key)).encode()).hexdigest()[:8], 16))


def smoothstep(e0, e1, x):
    t = np.clip((x - e0) / (e1 - e0), 0, 1)
    return t * t * (3 - 2 * t)


def gblur(a, sx, sy=None):
    """A Gaussian blur with sigmas in px (OpenCV, deterministic, reflect border)."""
    sy = sx if sy is None else sy
    return cv2.GaussianBlur(a, (0, 0), sigmaX=float(sx), sigmaY=float(sy), borderType=cv2.BORDER_REFLECT)


def band_mask():
    m = np.ones((H, W), np.float32)
    y = np.arange(H, dtype=np.float32)[:, None]
    # the band and a 10 px guard above and below it carry nothing
    m *= 1 - ((y >= BAND[0] - 10) & (y <= BAND[1] + 10)).astype(np.float32)
    return m


# ------------------------------------------------------------------------------------------------ masks
def masks(R, f, t=None):
    """Layer masks from the engine's own renders (light.md §8): every mask is a difference of two renders of the SAME
    frame with one layer switched, so it is exact to the pixel (no colour segmentation except the doorway's source)."""
    sdx, sdy = offset(f / 60.0 if t is None else t, 'subject')   # the subject plane's float at this frame
    base = load(f'{R}/base/f{f:05d}.png')
    cap = load(f'{R}/cap/f{f:05d}.png')
    norow = load(f'{R}/norow/f{f:05d}.png')
    nosky = load(f'{R}/nosky/f{f:05d}.png')
    skyonly = load(f'{R}/skyonly/f{f:05d}.png')
    nopip = load(f'{R}/nopip/f{f:05d}.png') if os.path.exists(f'{R}/nopip/f{f:05d}.png') else base
    d = lambda a, b, thr=2.5 / 255: (np.abs(a - b).max(-1) > thr)
    cap_m = cv2.dilate(d(cap, base).astype(np.uint8), np.ones((3, 3), np.uint8)) > 0
    # her and the row (rowHidden): body vs her own shadows (a multiply: darker in every channel, near the feet)
    row = d(base, norow, 3 / 255)
    darker = (base <= norow + 1 / 255).all(-1)
    ratio = (lstar(base) + 1) / (lstar(norow) + 1)
    yy = np.arange(H)[:, None] * np.ones((1, W))
    shadow_like = darker & (ratio > 0.45) & (ratio < 0.985) & (yy > FEET_Y - 14)
    body = row & ~shadow_like
    body = cv2.morphologyEx(body.astype(np.uint8), cv2.MORPH_OPEN, np.ones((2, 2), np.uint8)) > 0
    # her alone (the subject) vs the rest of the row (the ghosts: B): the components centred near her x at t
    tt = f / 60.0 if t is None else t
    hx = (692 - 12 * min(1, max(0, (tt - 0.55) / 0.42))) if tt < 0.97 else 680 - 40.06 * (min(tt, 4.54) - 0.97)
    hx += offset(tt, 'subject')[0]
    nl, lab_, st, cen = cv2.connectedComponentsWithStats(body.astype(np.uint8), 8)
    her = np.zeros((H, W), bool)
    for i in range(1, nl):
        if hx - 34 <= cen[i][0] <= hx + 62:
            her |= lab_ == i
    others = body & ~her
    # the sky (the painted sky and its clouds against v2's flat sky: identical wherever something stands in front)
    sky = d(base, nosky) & (yy < 800)
    sky = cv2.morphologyEx(sky.astype(np.uint8), cv2.MORPH_CLOSE, np.ones((3, 3), np.uint8)) > 0
    # the painted water and the near tree (the painted pieces against their flats)
    piece = d(base, skyonly)
    xx = np.arange(W)[None, :] * np.ones((H, 1))
    tree = piece & (xx < 420) & (yy > 1240)
    water = piece & ~tree & (yy >= 1030) & (yy <= 1320)
    # the doorway's source: the lit lobby inside the door frame (warm and light), the glass leaves included
    L = lstar(base)
    x0, y0, x1, y1 = DOOR
    inside = np.zeros((H, W), bool)
    ox, oy = int(round(sdx)), int(round(sdy))
    inside[y0 + 8 + oy:y1 - 2 + oy, x0 + 8 + ox:x1 - 8 + ox] = True
    r, g, b = base[..., 0], base[..., 1], base[..., 2]
    warm = (r > b + 0.06)
    door_src = inside & (L > 74) & warm & ~her
    door_src = cv2.morphologyEx(door_src.astype(np.uint8), cv2.MORPH_CLOSE, np.ones((5, 5), np.uint8)) > 0
    # lit panes on the facade (warm and light: the interiors are light sources, never shaded)
    wing = np.zeros((H, W), np.uint8)
    cv2.fillPoly(wing, [np.round(WING + np.array([sdx, sdy])).astype(np.int32)], 1)
    wing = wing > 0
    panes = wing & ~inside & (L > 78) & (r > b + 0.12) & (yy < 1080)
    panes = cv2.morphologyEx(panes.astype(np.uint8), cv2.MORPH_OPEN, np.ones((3, 3), np.uint8)) > 0
    pip = d(base, nopip, 3 / 255) & (yy > 1100) & (yy < 1300) & (xx > 600) & (xx < 800)
    return dict(base=base, cap=cap, cap_m=cap_m, her=her, others=others, row=row, sky=sky, tree=tree, water=water,
                door_src=door_src, inside=inside, wing=wing, panes=panes, pip=pip, L=L)


# ------------------------------------------------------------------------------------------------ the light passes
def rim_band(obj, light_xy=None, light_dir=None, width=3.0, power=1.0, soft=0.8, inside_only=True):
    """A rim from the shape's own distance field (light.md §4.3): the band of `obj` within `width` px of its edge,
    weighted by how much the edge's outward normal faces the light (n . l)^power. n = -grad(EDT_inside) (exact EDT,
    Felzenszwalb-Huttenlocher via OpenCV DIST_MASK_PRECISE). light_xy: a point light's image position (the direction
    varies per pixel); light_dir: a fixed 2D direction toward the light (a far sun)."""
    m = obj.astype(np.uint8)
    din = cv2.distanceTransform(m, cv2.DIST_L2, cv2.DIST_MASK_PRECISE)
    ds = gblur(din, 1.2)                          # a smooth field for a stable normal
    gx = cv2.Sobel(ds, cv2.CV_32F, 1, 0, ksize=3) / 8.0
    gy = cv2.Sobel(ds, cv2.CV_32F, 0, 1, ksize=3) / 8.0
    n = np.stack([-gx, -gy], -1)
    n /= np.linalg.norm(n, axis=-1, keepdims=True) + 1e-6
    if light_xy is not None:
        yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
        l = np.stack([light_xy[0] - xx, light_xy[1] - yy], -1)
        l /= np.linalg.norm(l, axis=-1, keepdims=True) + 1e-6
    else:
        l = np.array(light_dir, np.float32)
        l = (l / np.linalg.norm(l))[None, None, :]
    facing = np.clip((n * l).sum(-1), 0, 1) ** power
    band = 1 - smoothstep(width - soft, width + soft, din)
    band *= (din > 0)
    return (band * facing).astype(np.float32)


def bloom(src, sigmas, weights, aniso=None):
    """Bloom at a source (light.md §4.4): a sum of Gaussians of the source's own bright mask (Jimenez-style mip chain,
    here as direct blurs: the bake can afford them). aniso: per-sigma x stretch (the horizon glow is wider)."""
    out = np.zeros_like(src, np.float32)
    for i, (s, w) in enumerate(zip(sigmas, weights)):
        k = aniso[i] if aniso else 1.0
        out += w * gblur(src, s * k, s)
    return out


def shafts(emit, center, n=72, decay=0.965, length=0.55):
    """Light shafts (light.md §4.5): Mitchell's radial accumulation toward the light's image position (GPU Gems 3
    ch. 13), on a half-res grid; each pixel sums `emit` along its ray to the light, with an exponential decay."""
    h2, w2 = H // 2, W // 2
    e = cv2.resize(emit, (w2, h2), interpolation=cv2.INTER_AREA)
    yy, xx = np.mgrid[0:h2, 0:w2].astype(np.float32)
    cx, cy = center[0] / 2, center[1] / 2
    acc = np.zeros((h2, w2), np.float32)
    wsum = 0.0
    for i in range(n):
        t = i / (n - 1) * length
        sx = xx + (cx - xx) * t
        sy = yy + (cy - yy) * t
        wgt = decay ** i
        acc += wgt * cv2.remap(e, sx, sy, cv2.INTER_LINEAR, borderMode=cv2.BORDER_REPLICATE)
        wsum += wgt
    acc /= wsum
    return cv2.resize(acc, (W, H), interpolation=cv2.INTER_LINEAR)


def leafy_edge_shade(seed, y_mid=1338, amp=40, soft=12):
    """The near bank in the shade of trees off-screen left (light.md §6.3): one big quiet mass whose top edge is the
    canopy's own outline thrown on the ground: clumps of three sizes (never a ruler line, never a sine), a few holes of
    light near the edge, soft by the penumbra of a distant canopy (~12 px here), two warm dapples inside."""
    rng = rng_for(seed, 'leafy-edge', 0)
    x = np.arange(W, dtype=np.float32)
    edge = np.full(W, float(y_mid), np.float32) + (x - W / 2) * 0.06     # the far end lower: the canopy is west of us
    # clumps: rounded bumps of three sizes at seeded places (big 140-260 px, medium 60-110, small 22-40)
    for n, (w0, w1), (a0, a1) in ((4, (140, 260), (0.7, 1.0)), (9, (60, 110), (0.35, 0.6)), (16, (22, 40), (0.15, 0.3))):
        for _ in range(n):
            cx = rng.uniform(-60, W + 60)
            w = rng.uniform(w0, w1)
            a = amp * rng.uniform(a0, a1) * rng.choice([-1.0, 1.0], p=[0.35, 0.65])
            u = np.clip(1 - ((x - cx) / (w / 2)) ** 2, 0, None)
            edge -= a * np.sqrt(u)                                   # a rounded clump (a half-ellipse), up = shade grows
    yy = np.arange(H, dtype=np.float32)[:, None]
    m = smoothstep(edge[None, :] - soft, edge[None, :] + soft, yy)
    # holes of light inside the shade near its edge (sun through the canopy's gaps), and two warm dapples farther in
    holes = np.zeros((H, W), np.float32)
    for _ in range(7):
        cx = rng.uniform(40, W - 40)
        cy = float(np.interp(cx, x, edge)) + rng.uniform(25, 90)
        rx, ry = rng.uniform(10, 26), rng.uniform(4, 8)
        d = np.zeros((H, W), np.uint8)
        cv2.ellipse(d, (int(cx), int(cy)), (int(rx), int(ry)), float(rng.uniform(5, 18)), 0, 360, 1, -1)
        holes = np.maximum(holes, d.astype(np.float32))
    for (cx, cy, rx, ry, rot) in [(780, 1500, 120, 26, 12), (300, 1700, 150, 30, 14)]:
        d = np.zeros((H, W), np.uint8)
        cv2.ellipse(d, (cx, cy), (rx, ry), rot, 0, 360, 1, -1)
        holes = np.maximum(holes, d.astype(np.float32))
    m = m * (1 - 0.95 * gblur(holes, 7, 4))
    return m.astype(np.float32)


def door_pool(her_shadow):
    """The doorway's spill on the towpath (light.md §6.2): the opening projected forward from the lobby's lamps: a
    trapezoid from the door's foot widening 1.45x by the coping, falling off with distance (cos^3 law), soft at its
    sides (an area light's penumbra), with her shadow cut out of it."""
    x0, _, x1, y1 = DOOR
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    top, bot = y1 - 2, COPING_Y + 12
    t = np.clip((yy - top) / (bot - top), 0, 1)
    cx = (x0 + x1) / 2
    half = (x1 - x0) / 2 * (1 + 0.45 * t)
    side = 1 - smoothstep(half - 4 - 10 * t, half + 4 + 10 * t, np.abs(xx - cx))
    # cos^3 falloff along the ground from a lamp 2.4 m up, 2 m inside; the coping is ~1.6 m from the door
    dist = t * 1.6 + 2.0
    fall = (2.4 / np.sqrt(2.4 ** 2 + dist ** 2)) ** 3 / (2.4 / np.sqrt(2.4 ** 2 + 2.0 ** 2)) ** 3
    inband = ((yy >= top) & (yy <= bot)).astype(np.float32)
    pool = side * fall * inband * smoothstep(top - 1, top + 2, yy)
    return pool * (1 - her_shadow)


def shadow_homography(light_img, light_foot, ground_y, x_span=(0.0, 1080.0), y_span=(700.0, 1090.0)):
    """The cast-shadow map of a vertical billboard standing on ground_y (light.md §4.6): every billboard point P maps to
    the crossing of the line light_img -> P with the line light_foot -> G (G = P dropped to the ground). Points of one
    plane mapped through one centre onto another plane: a 2D HOMOGRAPHY of the image, fitted here from four points
    (exact for a point light; for the sun pass its image and its vanishing point on the horizon)."""
    def proj(P):
        P = np.asarray(P, np.float64)
        G = np.array([P[0], ground_y])
        Lp, Lf = np.asarray(light_img, np.float64), np.asarray(light_foot, np.float64)
        d1, d2 = P - Lp, G - Lf
        A = np.array([[d1[0], -d2[0]], [d1[1], -d2[1]]])
        a, _ = np.linalg.solve(A, Lf - Lp)
        return Lp + a * d1
    src = np.float32([[x_span[0], y_span[0]], [x_span[1], y_span[0]], [x_span[1], y_span[1]], [x_span[0], y_span[1]]])
    dst = np.float32([proj(p) for p in src])
    return cv2.getPerspectiveTransform(src, dst)


def project_shadow(sil, light_img, light_foot, ground_y):
    """The silhouette's cast shadow on the ground: the mask warped by shadow_homography (anti-aliased, gap-free)."""
    if not sil.any():
        return np.zeros((H, W), np.float32)
    ys, xs = np.nonzero(sil)
    Hm = shadow_homography(light_img, light_foot, ground_y, (float(xs.min()), float(xs.max() + 1)), (float(ys.min()), float(ground_y)))
    out = cv2.warpPerspective(sil.astype(np.float32), Hm, (W, H), flags=cv2.INTER_LINEAR, borderValue=0)
    yy = np.arange(H)[:, None]
    return (out * (yy >= ground_y - 2)).astype(np.float32)


# ------------------------------------------------------------------------------------------------ the frame
def light_frame(R, f, seed=1, dose=1.0):
    """One frame relit (light.md §6). dose scales every light layer (0 = v6 as it is)."""
    T = {}
    t0 = time.perf_counter()
    M = masks(R, f)
    T['masks'] = time.perf_counter() - t0
    base = M['base']
    lin = to_lin(base)
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    free = band_mask()                                       # nothing in the caption band
    E = np.ones((H, W, 3), np.float32)                       # the multiply map (linear)
    G = np.zeros((H, W, 3), np.float32)                      # the additive glow (linear)
    her = M['her'].astype(np.float32)
    pip = M['pip'].astype(np.float32)
    t = f / 60.0
    sdx, sdy = offset(t, 'subject')                          # the subject plane's float (the wing, the door, her)
    bdx, bdy = offset(t, 'bank')                             # our bank's float (the big near shade)
    keep_src = (M['door_src'] | M['panes']).astype(np.float32)

    # 1. THE SHADE (what the key doesn't reach): the backlit facade, the towpath under the far roofs' shadow, our bank
    #    under the trees: ONE family at three strengths (light.md §6.1), rose-plum on warm surfaces and violet on cool
    #    ones (CRAFT §d.3: chroma kept, never grey). Sources, the sky and the water (a mirror) stay unshaded.
    t0 = time.perf_counter()
    warmth = smoothstep(-0.03, 0.08, base[..., 0] - base[..., 2])[..., None]
    tint = warmth * lin_hex(SHADE_WARM) + (1 - warmth) * lin_hex(SHADE_COOL)
    fascia = ((xx >= 520 + sdx) & (xx <= 740 + sdx) & (yy >= 800 + sdy) & (yy <= 846 + sdy)).astype(np.float32)
    facade = M['wing'].astype(np.float32) * (1 - keep_src) * (1 - her) * (1 - M['others'].astype(np.float32)) * (1 - fascia)
    facade = gblur(facade, 0.8) * (1 - her)
    towpath = ((yy >= 1083 + sdy) & (yy < 1113 + sdy)).astype(np.float32) * smoothstep(120, 420, xx - sdx) * (1 - her)
    near = shift(leafy_edge_shade(seed), bdx, bdy) * (yy > 1180) * (1 - M['water'].astype(np.float32))
    k_map = 0.52 * facade + 0.36 * towpath + 0.80 * near
    k_map = np.maximum(k_map, 0.22 * her + 0.30 * pip)       # her front and Pip: a light shade, so their rims read
    k_map = np.clip(k_map * free * dose, 0, 0.95)
    E *= (1 - k_map[..., None]) + k_map[..., None] * tint
    S = E.copy()                                             # the multiply half (<= 1): the engine's shade layer
    T['shade'] = time.perf_counter() - t0

    # 2. THE KEY: the low sun, half behind the far roofs.
    t0 = time.perf_counter()
    sun_c = lin_hex(SUN_LIGHT)
    disc = ((xx - SUN[0]) ** 2 + (yy - SUN[1]) ** 2 <= SUN_R ** 2).astype(np.float32) * M['sky']
    glow = bloom(disc, sigmas=[4, 14, 40, 110], weights=[0.55, 0.32, 0.20, 0.12], aniso=[1, 1.2, 1.8, 2.4])
    glow *= smoothstep(BAND[1] + 14, BAND[1] + 70, yy)        # nothing reaches the band's guard
    G += glow[..., None] * sun_c * 0.6 * dose
    # the air near the sun: in-scatter veils what stands between us and it (the far roofs, the tower: lost edges)
    veil = np.exp(-(((xx - SUN[0]) / 260) ** 2 + ((yy - SUN[1] - 40) / 130) ** 2)) * smoothstep(BAND[1] + 30, BAND[1] + 90, yy)
    G += (veil * 0.045 * dose)[..., None] * sun_c
    # two soft shafts low over the water, left of the doorway (the air between us and the sun; never on the focus,
    # never in the band): wedges from the sun's image, fading in past the far city and out over our bank
    ang = np.degrees(np.arctan2(yy - SUN[1], xx - SUN[0]))
    rad = np.hypot(xx - SUN[0], yy - SUN[1])
    sh = np.zeros((H, W), np.float32)
    for a0, half, k in ((47.0, 1.6, 1.0), (55.5, 2.4, 0.75)):
        across = np.clip(1 - ((ang - a0) / half) ** 2, 0, 1) ** 1.5
        along = smoothstep(260, 420, rad) * (1 - smoothstep(560, 900, rad))
        sh += k * across * along
    sh *= (1 - M['sky']) * (1 - her)
    G += (sh * 0.045 * dose)[..., None] * sun_c
    # rims on what faces the sun: the skyline (the parapet, the roof planting, the lamp heads; the far tower calmer)
    obj = ~M['sky'] & (yy < 800)
    obj &= ~((xx < 60) & (yy < 300))                        # not the corner leaves (their light is painted)
    rim_sky = rim_band(obj, light_xy=SUN, width=2.4, power=1.2) * (yy > BAND[1] + 20)
    rim_sky *= np.where(xx < 330, 0.35, 1.0)                # the far tower (+3): calm (CRAFT §f: far planes quiet)
    # the wing's west corner: a 3 px sliver up its edge (its hidden west face takes the sun)
    corner = ((xx >= 330 + sdx) & (xx < 333.5 + sdx) & (yy > 640 + sdy) & (yy < 1080 + sdy)).astype(np.float32) * (1 - her)
    # her: the sun on her front (she walks west, into it), the subject's dose; Pip: B's dose
    rim_her_sun = rim_band(M['her'], light_xy=SUN, width=4.2, power=0.8) * her
    rim_pip = rim_band(M['pip'], light_xy=SUN, width=2.0, power=1.2) * pip
    oth = M['others'].astype(np.float32)
    rim_oth = rim_band(M['others'], light_xy=SUN, width=2.0, power=1.0) * oth if M['others'].any() else np.zeros((H, W), np.float32)
    E += (dose * (0.55 * rim_sky + 0.45 * corner))[..., None] * (sun_c - 0.12)
    E += (dose * (1.25 * rim_her_sun + 0.55 * rim_pip + 0.5 * rim_oth))[..., None] * (sun_c - 0.05)
    T['key'] = time.perf_counter() - t0

    # 3. THE STORY LIGHT: the lit doorway.
    t0 = time.perf_counter()
    door_c = lin_hex(DOOR_LIGHT)
    src = M['door_src'].astype(np.float32)
    lamp_img = ((DOOR[0] + DOOR[2]) / 2 + sdx, DOOR[1] + 26 + sdy)   # the lobby's lamps seen through the opening
    lamp_foot = ((DOOR[0] + DOOR[2]) / 2 + sdx, DOOR[3] - 6 + sdy)    # the floor under them (behind the facade line)
    # 3a. the source: lifted a step (CRAFT §d.2: a lit interior 88-92, the lamps 95-98), most under the lamps
    lift = src * (0.10 + 0.16 * smoothstep(1060, 880, yy))
    E += (dose * lift)[..., None] * (door_c - 0.2)
    lamps = np.zeros((H, W), np.float32)
    for lx in (575.0, 675.0):
        lamps += np.exp(-(((xx - lx - sdx) / 9) ** 2 + ((yy - 879 - sdy) / 5) ** 2))
    G += (dose * bloom(lamps, [3, 10], [0.5, 0.25]) * src * 0.35)[..., None] * door_c
    # 3b. her shadow from the door light (behind her, high): cast toward us, on the towpath and the coping only
    her_sh = project_shadow(M['her'], lamp_img, lamp_foot, FEET_Y + sdy) * (yy <= COPING_Y + 3 + sdy)
    her_sh = gblur(her_sh, 1.4, 2.2)
    # 3c. the pool on the towpath (and the coping's face), her shadow cut out of it
    pool = shift(door_pool(shift(np.clip(her_sh * 1.15, 0, 1), -sdx, -sdy)), sdx, sdy)
    E += (dose * pool * 1.15)[..., None] * (door_c - 0.08)
    # 3d. bloom at the opening (the glow AT the source: ~+5 L* at the frame, gone by ~60 px)
    dglow = bloom(src, sigmas=[2.5, 8, 22], weights=[0.30, 0.20, 0.10]) * (1 - src)
    G += (dose * dglow * 0.32)[..., None] * door_c
    # 3e. light wrap on her: the opening's light, blurred, laid on her inner edge where she stands against it
    wrap_src = np.clip(gblur(src, 7) * 1.4, 0, 1)
    edge = rim_band(M['her'], light_xy=None, light_dir=(0, 1), width=3.6, power=0.0)      # power 0: all round
    wrap = edge * wrap_src * her
    E += (dose * wrap * 0.85)[..., None] * (door_c - 0.12)
    # 3f. the back rim from the lamps behind her (the side and top facing them)
    rim_her_door = rim_band(M['her'], light_xy=lamp_img, width=2.4, power=1.6) * her * wrap_src
    E += (dose * rim_her_door * 0.55)[..., None] * (door_c - 0.08)
    # 3g. the sources' images in the water bloom too (the door's column, the sun's glint): emitters only, never a lit surface
    Lw = M['L'] * M['water']
    wsrc = (smoothstep(84, 92, Lw) * M['water']).astype(np.float32)
    G += (dose * bloom(wsrc, [2.5, 9], [0.22, 0.10]) * (1 - wsrc) * 0.35)[..., None] * door_c
    T['story'] = time.perf_counter() - t0

    # 4. the composite (linear): out = base * E + G; a soft shoulder above 0.9; the band untouched; captions on top
    t0 = time.perf_counter()
    G *= free[..., None]
    out = lin * E + G
    knee = 0.9
    over = np.clip(out - knee, 0, None)
    out = np.where(out > knee, knee + over / (1 + over / (1.0 - knee + 0.08)), out)
    srgb = to_srgb(out)
    rng = rng_for(seed, 'dither', f)                           # +-0.5 code triangular (CRAFT §g.4: never bands)
    dth = (rng.random((H, W, 1), np.float32) - rng.random((H, W, 1), np.float32)) / 255.0
    srgb = np.clip(srgb + dth, 0, 1)
    band_rows = np.zeros((H, W), bool)
    band_rows[BAND[0] - 10:BAND[1] + 11] = True
    srgb[band_rows] = base[band_rows]                          # the band: v6's pixels exactly
    srgb[M['cap_m']] = M['cap'][M['cap_m']]                    # the captions: unlit, on top
    out8 = np.round(srgb * 255).astype(np.uint8)
    T['composite'] = time.perf_counter() - t0
    maps = dict(E=E, S=S, A=E - S, src=src, G=G, k=k_map, pool=pool, rim=np.clip(rim_sky + corner + rim_her_sun + rim_pip + wrap + rim_her_door, 0, 1),
                her_sh=her_sh, glow=glow, shafts=sh)
    return out8, M, maps, T


# ------------------------------------------------------------------------------------------------ measuring
def metrics(M, out8, f):
    base = M['base']
    lit = out8.astype(np.float32) / 255.0
    Lb, Ll = lstar(base), lstar(lit)
    yy, xx = np.mgrid[0:H, 0:W]
    her = M['her']
    res = {}
    def reg(name, m):
        res[name] = {'L_before': round(float(Lb[m].mean()), 1), 'L_after': round(float(Ll[m].mean()), 1)}
    wing = M['wing'] & ~M['door_src'] & ~M['panes'] & ~her
    reg('facade', wing)
    reg('door_source', M['door_src'])
    reg('her', her)
    reg('near_bank', (yy > 1450) & ~M['tree'])
    reg('towpath_pool', (yy > 1084) & (yy < 1108) & (xx > 560) & (xx < 700) & ~her)
    reg('sky_by_sun', ((xx - SUN[0]) ** 2 + (yy - SUN[1]) ** 2 < 60 ** 2) & M['sky'])
    band = np.zeros((H, W), bool)
    band[317:557, 150:801] = True
    res['caption_band_max_change'] = int(np.abs(out8.astype(int) - np.round(M['cap'] * 255).astype(int))[band].max())
    # CRAFT §d.2: the brightest 5 % (the sky and the caption band left out) centred near the subject
    cand = ~M['sky'] & ~band & (yy > 620)
    thr = np.percentile(Ll[cand], 95)
    top = cand & (Ll >= thr)
    cy, cx = yy[top].mean(), xx[top].mean()
    hy, hx = yy[her].mean() if her.any() else 0, xx[her].mean() if her.any() else 0
    res['brightest5_centroid'] = [round(float(cx)), round(float(cy))]
    res['subject_centroid'] = [round(float(hx)), round(float(hy))]
    res['brightest5_to_subject_H'] = round(float(np.hypot(cx - hx, cy - hy) / H), 3)
    cand2 = cand & ~((xx < 330) & (yy < 1000))
    thr2 = np.percentile(Ll[cand2], 95)
    top2 = cand2 & (Ll >= thr2)
    res['brightest5_no_far_to_subject_H'] = round(float(np.hypot(xx[top2].mean() - hx, yy[top2].mean() - hy) / H), 3)
    for nm, L in (('before', Lb), ('after', Ll)):
        res[f'darks_L40_{nm}'] = round(float((L < 40).mean() * 100), 1)
        res[f'median_L_{nm}'] = round(float(np.median(L)), 1)
    return res


def thumb(img, w):
    h = int(round(img.shape[0] * w / img.shape[1]))
    return cv2.resize(img, (w, h), interpolation=cv2.INTER_AREA)


def main():
    if len(sys.argv) < 3:
        raise SystemExit(__doc__)
    R, OUT = sys.argv[1], sys.argv[2]
    args = dict(a.split('=', 1) if '=' in a else (a, '1') for a in sys.argv[3:])
    times = [float(x) for x in args.get('--times', '1.0,1.6').split(',')]
    repeat = int(args.get('--repeat', '1'))
    doses = [float(x) for x in args.get('--doses', '1.0').split(',')]
    os.makedirs(OUT, exist_ok=True)
    allm = {}
    for t in times:
        f = int(round(t * 60))
        for dose in doses:
            md5s = []
            for rep in range(repeat):
                t0 = time.perf_counter()
                out8, M, maps, T = light_frame(R, f, dose=dose)
                T['total'] = time.perf_counter() - t0
                md5s.append(hashlib.md5(out8.tobytes()).hexdigest())
            tag = f'f{f:05d}_d{dose:g}'
            cv2.imwrite(f'{OUT}/lit_{tag}.png', out8[..., ::-1])
            m = metrics(M, out8, f)
            m['bake_s'] = {k: round(v, 2) for k, v in T.items()}
            m['md5'] = md5s
            m['deterministic'] = len(set(md5s)) == 1
            allm[tag] = m
            # the maps, for the doc: E (shade/light) as an image, G (glow) boosted, the rims
            Ev = np.clip(to_srgb(np.clip(maps['E'], 0, 2) / 2), 0, 1)
            Gv = np.clip(to_srgb(maps['G'] * 6), 0, 1)
            Rv = np.clip(maps['rim'], 0, 1)[..., None].repeat(3, -1)
            strip = np.hstack([thumb((Ev * 255).astype(np.uint8), 360), thumb((Gv * 255).astype(np.uint8), 360),
                               thumb((Rv * 255).astype(np.uint8), 360)])
            cv2.imwrite(f'{OUT}/maps_{tag}.jpg', strip[..., ::-1], [cv2.IMWRITE_JPEG_QUALITY, 88])
            print(f't {t} dose {dose}: {json.dumps(m)}')
    with open(f'{OUT}/metrics.json', 'w') as fh:
        json.dump(allm, fh, indent=1)


if __name__ == '__main__':
    main()
