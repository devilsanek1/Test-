#!/usr/bin/env python3
"""pro_3_nature.py -- the nature meter (city-poster study, pro-practice 3, 2026-10-28).

How the posters build NATURE that "looks real but is stylised" (the owner's feeling 3), measured per sample against
v2's trees: each sample is a box and a colour rule that masks the nature object inside it (the Instagram UI masked
with ui_mask.json). All lengths are reported in px at a 1080-wide frame (posters 1206 wide: x 0.8955).

Per sample (CIE L*a*b*, skimage):
  values     k-means (k 6) on L* inside the mask: clusters holding >= 3 % (the flat tones it is painted in)
  steps      dL* between neighbouring value clusters (the facet / cluster step)
  range      L* p95 - p5
  top r      Pearson r of L* against height (+1: lighter at the top, Gurney's "lit top")
  rim dL     mean L* of the outer band (<= 10 px inside the silhouette) minus the core (> 25 px inside):
             Gurney's "foliage is lightest at its outer edges" (+) or a dark rim (-)
  rough      silhouette length / length after a sigma 8 px smoothing (1.00 = smooth blob; leafy edges > 1.3)
  straight   share of the silhouette in straight runs >= 30 px (approxPolyDP, eps 1.5 px): faceted edges
  edge/core  Canny edge density (L*, 25 / 60) in the outer 20 px band over the core (> 20 px inside):
             > 1 = the detail lives at the silhouette
  fine       std of L* - Gaussian(L*, 1.5) inside the mask eroded 3 px: leaf-scale detail and grain
  mottle     std of Gaussian(L*, 3) - Gaussian(L*, 20) inside: strokes, dabs, painted variation
Edges (the soft "real effects" against the hard ones): 10-90 % rise width of L* (or b*) across a named edge,
sampled every 6 px along it.

Usage: python3 video/scripts/look/posters/pro_3_nature.py [--v2dir DIR] [--out DIR]
       python3 video/scripts/look/posters/pro_3_nature.py --recipe recipe.svg   (the recipe sheet's SVG)
v2 frames: ffmpeg -ss <t> -i video/deliverables/v2/v2r_G7_master_v1.mp4 -frames:v 1 <v2dir>/v2_<t>.png (t = 3.0, 22.0)
"""
import argparse
import json
import os

import numpy as np
import cv2
from PIL import Image
from skimage import color as skcolor
from sklearn.cluster import KMeans

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..', '..'))
REF = os.path.join(ROOT, 'video/docs/look/poster_refs')

# (label, band, kind, box [x0, y0, x1, y1] in the image's own pixels, colour rule)
# band: near (cut by the frame, framing), mid (a mass in the middle ground), far (patchwork / ranges)
SAMPLES = [
    ('01_singapore.jpg', 'banana leaves', 'near', 'foliage', [0, 1330, 250, 1620], 'green'),
    ('01_singapore.jpg', 'round trees (L)', 'mid', 'foliage', [0, 1020, 340, 1112], 'green'),
    ('01_singapore.jpg', 'jungle + palms (R)', 'mid', 'foliage', [990, 900, 1206, 1150], 'green'),
    ('01_singapore.jpg', 'round tree (low R)', 'near', 'foliage', [900, 1400, 1072, 1600], 'green'),
    ('03_hanoi.jpg', 'flame tree', 'near', 'foliage', [0, 420, 470, 860], 'foliage_any'),
    ('03_hanoi.jpg', 'lake trees', 'mid', 'foliage', [400, 770, 1100, 900], 'green'),
    ('03_hanoi.jpg', 'banana (R)', 'near', 'foliage', [1000, 1000, 1206, 1280], 'green'),
    ('07_kyoto.jpg', 'maples (L)', 'near', 'foliage', [0, 880, 250, 1180], 'red'),
    ('07_kyoto.jpg', 'pine (mid)', 'mid', 'foliage', [320, 1150, 520, 1330], 'green'),
    ('07_kyoto.jpg', 'garden trees (R)', 'mid', 'foliage', [740, 880, 1206, 1080], 'foliage_any'),
    ('07_kyoto.jpg', 'bamboo', 'near', 'foliage', [860, 1260, 1206, 1470], 'green'),
    ('04_buenos_aires.jpg', 'jacaranda (near R)', 'near', 'blossom', [980, 1360, 1206, 1575], 'purple'),
    ('04_buenos_aires.jpg', 'jacarandas (mid)', 'mid', 'blossom', [250, 900, 470, 1010], 'purple'),
    ('05_cape_town.jpg', 'protea bracts', 'near', 'flower', [0, 1260, 520, 1600], 'pink'),
    ('05_cape_town.jpg', 'protea leaves', 'near', 'foliage', [0, 1260, 520, 1600], 'green'),
    ('05_cape_town.jpg', 'round trees (mid)', 'mid', 'foliage', [440, 1090, 600, 1180], 'green'),
    ('05_cape_town.jpg', 'Table Mountain', 'far', 'rock', [150, 610, 900, 860], 'rockgrey'),
    ('05_cape_town.jpg', 'tablecloth cloud', 'far', 'cloud', [230, 520, 1206, 640], 'cloud'),
    ('02_reykjavik.jpg', 'Esja range', 'far', 'rock', [400, 885, 1206, 990], 'range'),
    ('02_reykjavik.jpg', 'conifers', 'mid', 'foliage', [0, 1040, 200, 1140], 'conifer'),
    ('07_kyoto.jpg', 'far ranges', 'far', 'rock', [260, 650, 1200, 760], 'range'),
    ('07_kyoto.jpg', 'pond rocks', 'mid', 'rock', [380, 1075, 730, 1130], 'stone'),
    ('06_copenhagen.jpg', 'mermaid rock', 'near', 'rock', [820, 1330, 1206, 1560], 'ochre'),
    ('v2:v2_3.0.png', 'v2 S1 sage tree', 'near', 'foliage', [0, 1290, 290, 1480], 'v2sage'),
    ('v2:v2_22.0.png', 'v2 S5 blossom tree (L)', 'mid', 'blossom', [0, 790, 320, 1000], 'v2mauve'),
    ('v2:v2_22.0.png', 'v2 S5 blossom tree (R)', 'mid', 'blossom', [760, 790, 1080, 1100], 'v2mauve'),
]

# named edges: (image, label, kind, box, axis 'y' (profiles run down) or 'x', channel 'L' or 'b')
EDGES = [
    ('05_cape_town.jpg', 'tablecloth: top edge on the sky', 'soft', [420, 500, 700, 600], 'y', 'b'),
    ('05_cape_town.jpg', 'Table Mountain ridge on the sky', 'hard', [330, 560, 600, 660], 'y', 'L'),
    ('01_singapore.jpg', 'Merlion spray: outer edge', 'soft', [640, 1180, 720, 1240], 'x', 'L'),
    ('01_singapore.jpg', 'MBS tower edge (a building)', 'hard', [440, 900, 520, 960], 'x', 'L'),
    ('v2:v2_22.0.png', 'v2 S5 cloud: lower edge', 'v2', [700, 640, 1000, 760], 'y', 'L'),
]


def load(name, v2dir):
    if name.startswith('v2:'):
        p = os.path.join(v2dir, name[3:])
    else:
        p = os.path.join(REF, name)
    rgb = np.asarray(Image.open(p).convert('RGB')).astype(np.float32) / 255.0
    return rgb


def ui_mask(name, shape):
    m = np.ones(shape[:2], bool)
    if name.startswith('v2:'):
        return m
    js = json.load(open(os.path.join(REF, 'ui_mask.json')))['images'][name]
    r0, r1 = js['content_rows']
    m[:r0] = False
    m[r1:] = False
    for k in ('counter_pill_box', 'mute_button_box'):
        x0, y0, x1, y1 = js[k]
        m[y0:y1, x0:x1] = False
    return m


def rule_mask(rule, rgb, lab):
    hsv = cv2.cvtColor((rgb * 255).astype(np.uint8), cv2.COLOR_RGB2HSV).astype(np.float32)
    H, S, V = hsv[..., 0], hsv[..., 1], hsv[..., 2]
    L, a, b = lab[..., 0], lab[..., 1], lab[..., 2]
    C = np.hypot(a, b)
    if rule == 'green':
        return (H >= 25) & (H <= 95) & (S >= 45) & (V >= 25)
    if rule == 'red':
        return ((H <= 16) | (H >= 168)) & (S >= 90) & (V >= 50)
    if rule == 'foliage_any':
        return rule_mask('green', rgb, lab) | rule_mask('red', rgb, lab)
    if rule == 'purple':
        return (H >= 118) & (H <= 160) & (S >= 45)
    if rule == 'pink':
        return ((H >= 160) | (H <= 8)) & (S >= 35) & (V >= 120)
    if rule == 'rockgrey':
        return (L < 74) & (C < 22)
    if rule == 'cloud':
        return (L > 86) & (b > -2.5)
    if rule == 'range':
        return (L < 93) & (L > 40)
    if rule == 'conifer':
        return (L < 45) & (b < 8)
    if rule == 'stone':
        return (C < 14) & (L > 35) & (L < 82)
    if rule == 'ochre':
        return (H >= 8) & (H <= 30) & (S >= 45) & (V >= 50)
    if rule == 'v2sage':
        return (H >= 30) & (H <= 95) & (S >= 18) & (L < 82)
    if rule == 'v2mauve':
        return ((H >= 140) | (H <= 12)) & (S >= 22) & (L < 86) & (L > 40)
    raise ValueError(rule)


def clean(mask, k=3):
    m = mask.astype(np.uint8)
    m = cv2.morphologyEx(m, cv2.MORPH_OPEN, np.ones((k, k), np.uint8))
    m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, np.ones((k, k), np.uint8))
    n, lab, st, _ = cv2.connectedComponentsWithStats(m, 8)
    keep = np.zeros_like(m)
    for i in range(1, n):
        if st[i, cv2.CC_STAT_AREA] >= 150:
            keep[lab == i] = 1
    return keep.astype(bool)


def _runs(c, w, h):
    """Split a closed contour into open runs of points that are NOT on the box border (cut by the box)."""
    pts = c[:, 0, :]
    on = (pts[:, 0] <= 1) | (pts[:, 1] <= 1) | (pts[:, 0] >= w - 2) | (pts[:, 1] >= h - 2)
    if not on.any():
        return [np.vstack([pts, pts[:1]]).astype(np.float32)]
    k = int(np.argmax(on))
    pts, on = np.roll(pts, -k, 0), np.roll(on, -k)
    runs, cur = [], []
    for p_, o in zip(pts, on):
        if o:
            if len(cur) > 4:
                runs.append(np.array(cur, np.float32))
            cur = []
        else:
            cur.append(p_)
    if len(cur) > 4:
        runs.append(np.array(cur, np.float32))
    return runs


def _len(r):
    return float(np.hypot(*np.diff(r, axis=0).T).sum())


def contour_metrics(mask, scale):
    """Silhouette metrics on the object's own edge (the parts cut by the box are left out)."""
    h, w = mask.shape
    m8 = mask.astype(np.uint8)
    cs, _ = cv2.findContours(m8, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
    cs = [c for c in cs if cv2.contourArea(c) >= 400]
    if not cs:
        return None
    runs = [r for c in cs for r in _runs(c, w, h)]
    per = sum(_len(r) for r in runs)
    if per * scale < 150:
        return None
    sm = cv2.GaussianBlur(m8.astype(np.float32), (0, 0), 8) > 0.5
    cs2, _ = cv2.findContours(sm.astype(np.uint8), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
    per2 = sum(_len(r) for c in cs2 if cv2.contourArea(c) >= 400 for r in _runs(c, w, h)) or per
    straight = 0.0
    for r in runs:
        ap = cv2.approxPolyDP(r.reshape(-1, 1, 2), 1.5, False)[:, 0, :].astype(np.float32)
        for i in range(len(ap) - 1):
            seg = float(np.hypot(*(ap[i + 1] - ap[i])))
            if seg * scale >= 30:
                straight += seg
    return {'rough': per / per2, 'straight': straight / per, 'perim_px': per * scale}


def light_vector(mask, L):
    """Centroid of the lightest 20 % minus the darkest 20 % of the object, over its radius of gyration:
    angle (deg; 0 = right, 90 = up) and strength (0 = no light structure, ~1 = lit side vs shade side)."""
    ys, xs = np.nonzero(mask)
    v = L[mask]
    lo, hi = np.percentile(v, 20), np.percentile(v, 80)
    b, d = v >= hi, v <= lo
    dx, dy = xs[b].mean() - xs[d].mean(), ys[b].mean() - ys[d].mean()
    rg = np.sqrt(xs.var() + ys.var())
    return round(float(np.degrees(np.arctan2(-dy, dx))), 0), round(float(np.hypot(dx, dy) / rg), 2)


def sample_metrics(L, mask, y0, scale):
    vals = L[mask]
    out = {'area_px': int(mask.sum() * scale * scale)}
    km = KMeans(n_clusters=6, n_init=4, random_state=0).fit(vals[::max(1, len(vals) // 40000)].reshape(-1, 1))
    cen = km.cluster_centers_[:, 0]
    share = np.bincount(km.predict(vals.reshape(-1, 1)), minlength=6) / len(vals)
    keep = sorted([(c, s) for c, s in zip(cen, share) if s >= 0.03])
    out['values'] = [round(float(c), 1) for c, _ in keep]
    out['shares'] = [round(float(s), 2) for _, s in keep]
    out['steps'] = [round(float(keep[i + 1][0] - keep[i][0]), 1) for i in range(len(keep) - 1)]
    out['range'] = round(float(np.percentile(vals, 95) - np.percentile(vals, 5)), 1)
    out['L_mean'] = round(float(vals.mean()), 1)
    ys = np.nonzero(mask)[0].astype(np.float32)
    out['top_r'] = round(float(np.corrcoef(-ys, vals)[0, 1]), 2)
    out['light_deg'], out['light_k'] = light_vector(mask, L)
    m8 = mask.astype(np.uint8)
    dist = cv2.distanceTransform(m8, cv2.DIST_L2, 5) * scale
    rim, core = mask & (dist <= 10), mask & (dist > 25)
    out['rim_dL'] = round(float(L[rim].mean() - L[core].mean()), 1) if core.sum() > 200 else None
    L8 = np.clip(L * 2.55, 0, 255).astype(np.uint8)
    L8 = cv2.bilateralFilter(cv2.medianBlur(L8, 5), 7, 20, 5)  # grain-free (pro_2's operator)
    ed = cv2.Canny(L8, 25, 60) > 0
    gx, gy = cv2.Sobel(L, cv2.CV_32F, 1, 0, ksize=3) / 8, cv2.Sobel(L, cv2.CV_32F, 0, 1, ksize=3) / 8
    gm = cv2.blur(np.hypot(gx, gy), (3, 3))
    out['flat'] = round(float((gm[mask & (dist > 3)] < 1.5).mean()), 2)
    band, inner = mask & (dist <= 20), mask & (dist > 20)
    if inner.sum() > 300:
        out['edge_core'] = round(float(ed[band].mean() / max(1e-6, ed[inner].mean())), 2)
    er = cv2.erode(m8, np.ones((7, 7), np.uint8)) > 0
    g15 = cv2.GaussianBlur(L, (0, 0), 1.5)
    g3, g20 = cv2.GaussianBlur(L, (0, 0), 3), cv2.GaussianBlur(L, (0, 0), 20)
    out['fine'] = round(float(np.std((L - g15)[er])), 2)
    out['mottle'] = round(float(np.std((g3 - g20)[er])), 2)
    return out


def edge_width(ch, axis, scale):
    """Edge width (px at 1080) of the strongest step in each profile across the box: |step| / peak gradient, the
    step taken between the medians 8-20 px either side of the peak (a blurred step of sigma s reads ~2.5 s; a clean
    vector edge 1-2 px; JPEG and the posters' upscale add ~1 px)."""
    if axis == 'x':
        ch = ch.T
    ch = cv2.GaussianBlur(ch, (0, 0), 0.8)
    ws = []
    for j in range(0, ch.shape[1], 6):
        p = ch[:, j]
        g = np.abs(np.diff(p))
        k = int(np.argmax(g))
        if k < 20 or k > len(p) - 21:
            continue
        a, b = np.median(p[k - 20:k - 8]), np.median(p[k + 9:k + 21])
        if abs(b - a) < 3:
            continue
        ws.append(abs(b - a) / g[k] * scale)
    return (round(float(np.median(ws)), 1), len(ws)) if ws else (None, 0)


# ================================================================= the recipe sheet (img/pro_3_nature_recipe.jpg)

def recipe_svg(OUT):
    """The tree recipe drawn in flat SVG (clean closed paths, flat fills, no gradient, no blur, no line on the foliage):
    v2's lollipop -> 1 one big shape lit -> 2 clusters lit as ONE mass -> 3 leaf-scale edge + sky holes -> far low poly
    -> near species leaves folded on their midribs. A prototype for lib/foliage.tsx (pro_3_nature.md section 3.1).
    Render: chrome-headless-shell --screenshot=out.png --window-size=W,H file://OUT."""
    import math
    import random
    # v2's lollipop -> 1 big shape lit -> 2 clusters lit -> 3 leaf-scale edge + sky holes -> far low poly.

    def lab2hex(L, a, b):
        fy = (L + 16) / 116; fx = fy + a / 500; fz = fy - b / 200
        def finv(t): return t ** 3 if t ** 3 > 0.008856 else (t - 16 / 116) / 7.787
        X, Y, Z = 0.95047 * finv(fx), 1.0 * finv(fy), 1.08883 * finv(fz)
        r = 3.2404542 * X - 1.5371385 * Y - 0.4985314 * Z
        g = -0.9692660 * X + 1.8760108 * Y + 0.0415560 * Z
        bb = 0.0556434 * X - 0.2040259 * Y + 1.0572252 * Z
        def gam(c):
            c = max(0, min(1, c))
            return 12.92 * c if c <= 0.0031308 else 1.055 * c ** (1 / 2.4) - 0.055
        return '#%02X%02X%02X' % tuple(int(round(gam(c) * 255)) for c in (r, g, bb))

    SKY, SKY_H = '#BFDDD2', lab2hex(83.5, -10, 0)       # sky; sky seen through a hole (3 L* darker: Gurney)
    GROUND = '#EFD8C5'
    HI, LIT, MID, SHADE, CORE = lab2hex(70, -15, 22), lab2hex(61, -20, 14), lab2hex(53, -19, 8), lab2hex(45, -16, 3), lab2hex(36, -12, -1)
    TR_LIT, TR_SH = lab2hex(50, 10, 15), lab2hex(37, 8, 8)
    CONTACT = lab2hex(74, 8, 10)
    V2_SAGE, V2_SH, V2_DOT, V2_TR = '#A9BEA1', '#8EA48C', '#C8D5C1', '#B27C60'
    KEY = (-0.62, -0.78)                                  # light from the upper left (screen y down)
    FAR_AIR = '#DCE6E0'

    PW, PH, GAP, TOP = 340, 620, 16, 70
    W = 6 * PW + 7 * GAP
    H = TOP + PH + 150
    rnd = random.Random(7)
    svg = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">',
           f'<rect width="{W}" height="{H}" fill="#FAF8F4"/>', '<defs>']
    body = []
    cid = [0]

    def newid():
        cid[0] += 1
        return f'c{cid[0]}'

    def f(v): return f'{v:.1f}'

    def poly_d(pts):
        return 'M' + ' L'.join(f'{f(x)},{f(y)}' for x, y in pts) + ' Z'

    def smooth_d(pts):
        # closed Catmull-Rom -> cubic Bezier
        n = len(pts); d = f'M{f(pts[0][0])},{f(pts[0][1])}'
        for i in range(n):
            p0, p1, p2, p3 = pts[(i - 1) % n], pts[i], pts[(i + 1) % n], pts[(i + 2) % n]
            c1 = (p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6)
            c2 = (p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6)
            d += f' C{f(c1[0])},{f(c1[1])} {f(c2[0])},{f(c2[1])} {f(p2[0])},{f(p2[1])}'
        return d + ' Z'

    def blob(cx, cy, R, sq=0.86, seed=1, n=48):
        r = random.Random(seed); ph = [r.uniform(0, 6.28) for _ in range(3)]
        pts = []
        for i in range(n):
            t = 2 * math.pi * i / n
            k = 1 + 0.10 * math.sin(2 * t + ph[0]) + 0.07 * math.sin(3 * t + ph[1]) + 0.04 * math.sin(5 * t + ph[2])
            pts.append((cx + R * k * math.cos(t), cy + R * sq * k * math.sin(t)))
        return pts

    def ellipse_pts(cx, cy, rx, ry, chord, seed=0, jitter=0.45):
        # points clockwise on screen (y down), spaced ~chord apart
        r = random.Random(seed)
        per = math.pi * (3 * (rx + ry) - math.sqrt((3 * rx + ry) * (rx + 3 * ry)))
        n = max(8, int(per / chord))
        ts, t = [], 0.0
        step = 2 * math.pi / n
        for i in range(n):
            ts.append(t); t += step * (1 + r.uniform(-jitter, jitter))
        s = 2 * math.pi / t
        return [(cx + rx * math.cos(a * s), cy + ry * math.sin(a * s)) for a in ts]

    def scallop_d(pts, bulge=0.51, seed=0):
        # a clean scalloped outline: one outward circular arc per chord (clockwise points, sweep 1)
        r = random.Random(seed)
        d = f'M{f(pts[0][0])},{f(pts[0][1])}'
        for i in range(len(pts)):
            x1, y1 = pts[(i + 1) % len(pts)]
            x0, y0 = pts[i]
            ch = math.hypot(x1 - x0, y1 - y0)
            rad = max(ch * 0.501, ch * bulge * (1 + r.uniform(-0.02, 0.18)))
            d += f' A{f(rad)},{f(rad)} 0 0 1 {f(x1)},{f(y1)}'
        return d + ' Z'

    def leafy_d(cx, cy, rx, ry, leaf, seed=0):
        """A two-scale leafy edge (Earle: the blob, then smaller and smaller leaves): lobes ~0.5 r long bulging up to
        ~0.25 r, each lobe's arc then cut into leaf bumps ~`leaf` px. One clean closed path of arcs."""
        r = random.Random(seed)
        lob = ellipse_pts(cx, cy, rx, ry, 0.55 * min(rx, ry), seed, 0.35)
        pts = []
        for i in range(len(lob)):
            (x0, y0), (x1, y1) = lob[i], lob[(i + 1) % len(lob)]
            mx, my = (x0 + x1) / 2, (y0 + y1) / 2
            ch = math.hypot(x1 - x0, y1 - y0)
            nx, ny = (y1 - y0) / ch, -(x1 - x0) / ch            # outward normal of a clockwise chain (y down)
            h = ch * r.uniform(0.18, 0.34)                      # the lobe's height
            n = max(2, int(ch * 1.3 / leaf))
            for k in range(n):
                t = k / n
                bx, by = x0 + (x1 - x0) * t, y0 + (y1 - y0) * t
                bump = 4 * t * (1 - t) * h
                pts.append((bx + nx * bump, by + ny * bump))
        return scallop_d(pts, 0.52, seed + 1)

    def clip(d):
        i = newid(); svg.append(f'<clipPath id="{i}"><path d="{d}"/></clipPath>'); return i

    def path(d, fill, extra=''):
        body.append(f'<path d="{d}" fill="{fill}" {extra}/>')

    def ellipse(cx, cy, rx, ry, fill, extra=''):
        body.append(f'<ellipse cx="{f(cx)}" cy="{f(cy)}" rx="{f(rx)}" ry="{f(ry)}" fill="{fill}" {extra}/>')

    def trunk(cx, base, top, w, lit=TR_LIT, sh=TR_SH):
        # tapered trunk, its shade side away from the key (right), 35 % of the width
        d = poly_d([(cx - w / 2, base), (cx - w * 0.32, top), (cx + w * 0.32, top), (cx + w / 2, base)])
        path(d, lit)
        i = clip(d)
        body.append(f'<rect x="{f(cx + w * 0.12)}" y="{f(top)}" width="{f(w)}" height="{f(base - top)}" fill="{sh}" clip-path="url(#{i})"/>')

    def cluster_d(cx, cy, rx, ry, edge, seed):
        if edge:
            return leafy_d(cx, cy, rx, ry, edge, seed)
        return f'M{f(cx - rx)},{f(cy)} A{f(rx)},{f(ry)} 0 1 1 {f(cx + rx)},{f(cy)} A{f(rx)},{f(ry)} 0 1 1 {f(cx - rx)},{f(cy)} Z'


    def crown(CX, CY, clusters, edge=None, seed=0, holes=()):
        """One crown lit as ONE mass (Gurney: a light side and a shadow side): the union of the clusters in the shade tone,
        a core crescent only along its underside away from the key, then a lit cap per cluster (smaller low down: the crown
        shades itself), hi dabs on the top clusters. Flat shapes, all clipped to the union: no gradient, no line."""
        kx, ky = KEY
        ds = [cluster_d(CX + dx, CY + dy, rx, ry, edge, seed + j * 7) for j, (dx, dy, rx, ry) in enumerate(clusters)]
        u = newid()
        svg.append(f'<clipPath id="{u}">' + ''.join(f'<path d="{d}"/>' for d in ds) + '</clipPath>')
        for d in ds:
            path(d, CORE)
        for j, (dx, dy, rx, ry) in enumerate(clusters):   # the shade mass, nudged toward the key: a core crescent stays below
            path(cluster_d(CX + dx + kx * 7, CY + dy + ky * 11, rx, ry, edge, seed + j * 7), SHADE, f'clip-path="url(#{u})"')
        top = min(dy for _, dy, _, _ in clusters)
        bot = max(dy for _, dy, _, _ in clusters)
        order = sorted(range(len(clusters)), key=lambda j: -clusters[j][1])  # low clusters first, the top ones last
        for j in order:
            dx, dy, rx, ry = clusters[j]
            h = (dy - top) / max(1, bot - top)              # 0 at the top of the crown, 1 at its bottom
            k = 0.82 - 0.30 * h                              # lit caps shrink low down
            e = edge and edge * 0.8
            path(cluster_d(CX + dx + kx * rx * 0.34, CY + dy + ky * ry * 0.34, rx * k, ry * k, e, seed + 50 + j), LIT, f'clip-path="url(#{u})"')
        for j in order:
            dx, dy, rx, ry = clusters[j]
            if (dy - top) / max(1, bot - top) < 0.2:
                path(cluster_d(CX + dx + kx * rx * 0.58, CY + dy + ky * ry * 0.58, rx * 0.36, ry * 0.32, edge and edge * 0.75, seed + 90 + j), HI, f'clip-path="url(#{u})"')
        for j, (hx, hy, hr) in enumerate(holes):         # sky holes near the thin edge: the sky a step darker (Gurney)
            dd = cluster_d(CX + hx, CY + hy, hr * 1.25, hr, edge and 6, seed + 300 + j)
            path(dd, SKY_H, f'clip-path="url(#{u})"')


    def panel(k, title, lines):
        x0 = GAP + k * (PW + GAP)
        pc = newid()
        svg.append(f'<clipPath id="{pc}"><rect width="{PW}" height="{PH}"/></clipPath>')
        body.append(f'<g transform="translate({x0},{TOP})" clip-path="url(#{pc})">')
        body.append(f'<rect width="{PW}" height="{PH * 0.66:.0f}" fill="{SKY}"/>')
        body.append(f'<rect y="{PH * 0.66:.0f}" width="{PW}" height="{PH * 0.34:.0f}" fill="{GROUND}"/>')
        return x0

    def end_panel(k, title, lines):
        body.append('</g>')
        x0 = GAP + k * (PW + GAP)
        body.append(f'<text x="{x0}" y="{TOP - 16}" font-family="DejaVu Sans, sans-serif" font-weight="bold" font-size="17" fill="#222">{title}</text>')
        for j, ln in enumerate(lines):
            body.append(f'<text x="{x0}" y="{TOP + PH + 26 + 21 * j}" font-family="DejaVu Sans, sans-serif" font-size="15" fill="#333">{ln}</text>')

    CX, CY, R, BASE = PW / 2, 250, 125, PH * 0.66 + 70

    # A: v2 S1 now
    panel(0, '', [])
    trunk(CX, BASE, CY + 60, 16, V2_TR, V2_TR)
    for (dx, dy, rr) in [(-70, 20, 70), (-10, -40, 85), (60, 10, 75), (20, 55, 70), (-55, 60, 58)]:
        ellipse(CX + dx, CY + dy, rr, rr, V2_SAGE)
    ellipse(CX - 40, CY + 70, 62, 34, V2_SH); ellipse(CX + 25, CY + 40, 70, 40, V2_SH)
    ellipse(CX + 55, CY + 30, 9, 9, V2_DOT); ellipse(CX + 20, CY + 66, 8, 8, V2_DOT)
    end_panel(0, 'v2 S1 now', ['5 pale discs + 2 floating shade ellipses', 'mean L* ~71, 4 tones over 19 L*', 'no key, no species, smooth edge', '(roughness 1.25)'])

    # B: one big shape, lit
    panel(1, '', [])
    ellipse(CX + 18, BASE + 4, 70, 11, CONTACT)
    trunk(CX, BASE, CY + 50, 22)
    bl = blob(CX, CY, R, seed=3)
    d = smooth_d(bl)
    path(d, CORE); i = clip(d)
    kx, ky = KEY
    body.append(f'<path d="{smooth_d([(x + kx * 14, y + ky * 14) for x, y in bl])}" fill="{SHADE}" clip-path="url(#{i})"/>')
    ellipse(CX + kx * R * 0.38, CY + ky * R * 0.38, R * 0.92, R * 0.80, LIT, f'clip-path="url(#{i})"')
    end_panel(1, '1. ONE big shape, lit', ['the species silhouette (Earle\'s blob)', 'lit cap toward the key, shade,', 'a thin core crescent away from it', 'lit L* 61 / shade 45 / core 36'])

    # C: clusters
    panel(2, '', [])
    ellipse(CX + 18, BASE + 4, 74, 11, CONTACT)
    trunk(CX, BASE, CY + 50, 22)
    CL = [(-66, 46, 62, 50), (62, 52, 64, 50), (2, 66, 70, 46), (-72, -16, 64, 58), (70, -8, 60, 56), (-18, -62, 76, 60), (36, -46, 58, 50), (0, 6, 70, 58)]
    crown(CX, CY, CL, None, 0)
    end_panel(2, '2. 3-7 CLUSTERS, each lit', ['back to front, every cluster', 'core / shade / lit / hi by the key', 'steps 6-10 L* (posters 6-13)', 'top-lit, one key for the set'])

    # D: leaf-scale edge + sky holes
    panel(3, '', [])
    ellipse(CX + 18, BASE + 4, 76, 11, CONTACT)
    trunk(CX, BASE, CY + 40, 22)
    for (a, b2, c, e2) in [(CX - 2, CY + 60, CX - 60, CY - 30), (CX + 2, CY + 60, CX + 62, CY - 20)]:
        body.append(f'<path d="M{f(a - 4)},{f(b2)} L{f(c - 3)},{f(e2)} L{f(c + 3)},{f(e2)} L{f(a + 4)},{f(b2)} Z" fill="{TR_SH}"/>')
    crown(CX, CY, CL, 11, 100, holes=[(-116, 22, 11), (118, 36, 10), (98, -66, 8)])
    end_panel(3, '3. LEAF-SCALE EDGE + sky holes', ['leaf bumps 8-14 px on 2-scale lobes,', 'on the silhouette + terminator only;', '2-3 sky holes, 3 L* under the sky;', 'roughness 1.16 (posters mid 1.19-1.67)'])

    # E: far low poly
    panel(4, '', [])
    AIRK = 0.55
    def air(hexc, k=AIRK):
        h = hexc.lstrip('#'); a = [int(h[i:i + 2], 16) for i in (0, 2, 4)]
        b = [int(FAR_AIR.lstrip('#')[i:i + 2], 16) for i in (0, 2, 4)]
        return '#%02X%02X%02X' % tuple(int(round(x + (y - x) * k)) for x, y in zip(a, b))
    # a faceted range (+4): each peak a lit and a shade face split on its ridge
    gy = PH * 0.66
    for (px, pw, ph_) in [(70, 150, 120), (190, 170, 160), (300, 140, 110)]:
        top = (px, gy - ph_ - 150)
        path(poly_d([(px - pw / 2, gy - 150), top, (px + 8, gy - 150)]), air(LIT, 0.72))
        path(poly_d([(px + 8, gy - 150), top, (px + pw / 2, gy - 150)]), air(SHADE, 0.72))
    body.append(f'<rect y="{f(gy - 150)}" width="{PW}" height="150" fill="{air(MID, 0.62)}"/>')
    # mid lollipops (+1/+2): a disc split into a lit and a shade half
    for (tx, ty, tr) in [(60, gy - 40, 30), (110, gy - 30, 26), (250, gy - 36, 32), (300, gy - 28, 24)]:
        body.append(f'<rect x="{f(tx - 2.5)}" y="{f(ty)}" width="5" height="{f(gy - ty + 30)}" fill="{air(TR_SH, 0.3)}"/>')
        ellipse(tx, ty, tr, tr * 0.95, air(SHADE, 0.3))
        i = clip(f'M{f(tx - tr)},{f(ty)} A{f(tr)},{f(tr * 0.95)} 0 1 1 {f(tx + tr)},{f(ty)} A{f(tr)},{f(tr * 0.95)} 0 1 1 {f(tx - tr)},{f(ty)} Z')
        body.append(f'<path d="M{f(tx - tr - 2)},{f(ty + tr * 0.5)} L{f(tx + tr * 0.6)},{f(ty - tr - 2)} L{f(tx - tr - 2)},{f(ty - tr - 2)} Z" fill="{air(LIT, 0.3)}" clip-path="url(#{i})"/>')
    # a far faceted tree (+3): 6 facets from one inner vertex, toned by their angle to the key
    fx, fy, fr = 180, gy - 70, 46
    ring = [(fx + fr * math.cos(t) * (1 + 0.12 * math.sin(3 * t)), fy - 14 + fr * 1.05 * math.sin(t)) for t in [i * math.pi / 3 + 0.3 for i in range(6)]]
    inner = (fx - 6, fy - 22)
    body.append(f'<rect x="{fx - 3}" y="{fy + 20}" width="6" height="{f(gy - fy + 20)}" fill="{air(TR_SH, 0.45)}"/>')
    for j in range(6):
        a, b = ring[j], ring[(j + 1) % 6]
        mx, my = (a[0] + b[0] + inner[0]) / 3 - fx, (a[1] + b[1] + inner[1]) / 3 - fy
        n = math.hypot(mx, my) or 1
        lam = max(0, (mx * KEY[0] + my * KEY[1]) / n)
        tone = LIT if lam > 0.55 else MID if lam > 0.1 else SHADE
        path(poly_d([inner, a, b]), air(tone, 0.45))
    end_panel(4, 'FAR: low poly (+1 ... +4)', ['+1/+2: disc + lit half (Blair)', '+3: 4-8 flat facets toned by the key', '+4: ranges, lit / shade faces', 'all on the air step (CRAFT f.2)'])


    # F: NEAR framing branch: species leaves, each folded along its midrib (the posters' near mode)
    panel(5, '', [])
    def palmate(cx, cy, Lf, ang):
        """A five-lobed leaf (maple / plane) pointing along `ang` (deg, screen), its stem at (cx, cy)."""
        spec = [(190, .30), (170, .62), (150, .38), (130, .86), (110, .42), (90, 1.0), (70, .42), (50, .86), (30, .38), (10, .62), (-10, .30), (270, .10)]
        a0 = math.radians(ang + 90)
        pts = []
        for a, rr in spec:
            t = math.radians(a)
            x, y = rr * math.cos(t), -rr * math.sin(t)          # leaf space, tip up (y down on screen)
            y -= 0.18                                           # the blade starts a little above the stem
            X = x * math.cos(a0) - y * math.sin(a0); Y = x * math.sin(a0) + y * math.cos(a0)
            pts.append((cx + Lf * X, cy + Lf * Y))
        return pts
    def leaf(cx, cy, Lf, ang, depth):
        pts = palmate(cx, cy, Lf, ang)
        d = poly_d(pts)
        lit_c, sh_c = [(HI, LIT), (LIT, MID), (MID, SHADE)][depth]
        sh_c = [MID, SHADE, CORE][depth]
        path(d, sh_c)
        i = clip(d)
        a = math.radians(ang)
        ax, ay = math.cos(a), math.sin(a)                       # the midrib's direction
        nx, ny = -ay, ax                                        # its normal; the lit half faces the key
        if nx * KEY[0] + ny * KEY[1] < 0:
            nx, ny = -nx, -ny
        far = 3 * Lf
        half = [(cx - ax * far, cy - ay * far), (cx + ax * far, cy + ay * far), (cx + ax * far + nx * far, cy + ay * far + ny * far), (cx - ax * far + nx * far, cy - ay * far + ny * far)]
        body.append(f'<path d="{poly_d(half)}" fill="{lit_c}" clip-path="url(#{i})"/>')
        # 3 veins from the base to the main tips: thin tapered same-hue light shapes (dL* ~ +7), not strokes
        base = (cx + ax * Lf * 0.2, cy + ay * Lf * 0.2)
        vein_c = lab2hex(68, -16, 18) if depth == 0 else lab2hex(58, -18, 12)
        for k in (5, 3, 7):
            tip = pts[k]
            vx, vy = tip[0] - base[0], tip[1] - base[1]; vl = math.hypot(vx, vy)
            px, py = -vy / vl * 1.1, vx / vl * 1.1
            end = (base[0] + vx * 0.86, base[1] + vy * 0.86)
            body.append(f'<path d="{poly_d([(base[0] + px, base[1] + py), end, (base[0] - px, base[1] - py)])}" fill="{vein_c}" clip-path="url(#{i})"/>')
    # the branch: a tapered closed path from the panel's top-left corner
    br = [(-10, 40), (60, 70), (130, 120), (190, 190), (230, 260)]
    bw = [16, 12, 9, 6, 3]
    left, right = [], []
    for j in range(len(br)):
        (x, y) = br[j]
        (x2, y2) = br[min(j + 1, len(br) - 1)] if j < len(br) - 1 else (2 * x - br[j - 1][0], 2 * y - br[j - 1][1])
        dx, dy = x2 - x, y2 - y; dl = math.hypot(dx, dy)
        nx, ny = -dy / dl, dx / dl
        left.append((x + nx * bw[j] / 2, y + ny * bw[j] / 2)); right.append((x - nx * bw[j] / 2, y - ny * bw[j] / 2))
    path(smooth_d(left + right[::-1]), TR_SH)
    for (lx, ly, Lf, ang, dep) in [(80, 58, 60, 20, 2), (160, 140, 62, 150, 2), (215, 236, 58, 30, 2), (60, 70, 70, 120, 1), (140, 128, 74, 100, 1),
                                    (200, 205, 70, 110, 1), (100, 95, 80, 70, 0), (175, 170, 76, 40, 0), (228, 255, 66, 85, 0)]:
        leaf(lx, ly, Lf, ang, dep)
    end_panel(5, 'NEAR: species leaves, folded', ['the species\' own leaf (not a blob),', 'each split on its midrib: lit / shade,', '3 veins as thin same-hue shapes,', '3 depths of green; cut by the frame'])

    svg.append('</defs>')
    svg += body
    svg.append(f'<text x="{GAP}" y="30" font-family="DejaVu Sans, sans-serif" font-weight="bold" font-size="22" fill="#111">The tree recipe in flat SVG (clean closed paths, flat fills, no gradient, no blur, no line on the foliage): pro_3_nature</text>')
    svg.append('</svg>')
    open(OUT, 'w').write('\n'.join(svg))
    return W, H


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--v2dir', default='/tmp/posters-pro_3_nature')
    ap.add_argument('--out', default='/tmp/posters-pro_3_nature')
    ap.add_argument('--recipe', help='write the recipe sheet SVG to this path and stop')
    a = ap.parse_args()
    if a.recipe:
        print(*recipe_svg(a.recipe))
        return
    res = []
    cache = {}
    for name, label, band, kind, box, rule in SAMPLES:
        if name not in cache:
            rgb = load(name, a.v2dir)
            cache[name] = (rgb, skcolor.rgb2lab(rgb).astype(np.float32), ui_mask(name, rgb.shape))
            # CRAFT §e local contrast: mean |L* - Gaussian(L*, sigma 16)| at 1080 wide (sigma scaled to this width)
            Lf = cache[name][1][..., 0]
            cache[name + '#lc'] = np.abs(Lf - cv2.GaussianBlur(Lf, (0, 0), 16.0 * rgb.shape[1] / 1080.0))
        rgb, lab, ui = cache[name]
        scale = 1080.0 / rgb.shape[1]
        x0, y0, x1, y1 = box
        sub = (slice(y0, y1), slice(x0, x1))
        m = rule_mask(rule, rgb[sub], lab[sub]) & ui[sub]
        m = clean(m)
        if m.sum() < 500:
            print('SKIP (tiny mask)', name, label)
            continue
        r = {'image': name, 'label': label, 'band': band, 'kind': kind, 'box': box, 'cover': round(float(m.mean()), 2)}
        r.update(sample_metrics(lab[sub][..., 0], m, y0, scale))
        r['lc'] = round(float(cache[name + '#lc'][sub][m].mean()), 2) if (name + '#lc') in cache else None
        cm = contour_metrics(m, scale)
        if cm:
            r.update({k: round(v, 2) for k, v in cm.items()})
        res.append(r)
        cv2.imwrite(os.path.join(a.out, f'mask_{label.replace(" ", "_").replace("/", "")}.png'), (m * 255).astype(np.uint8))
    edges = []
    for name, label, kind, box, axis, chn in EDGES:
        if name not in cache:
            rgb = load(name, a.v2dir)
            cache[name] = (rgb, skcolor.rgb2lab(rgb).astype(np.float32), ui_mask(name, rgb.shape))
        rgb, lab, ui = cache[name]
        scale = 1080.0 / rgb.shape[1]
        x0, y0, x1, y1 = box
        ch = lab[y0:y1, x0:x1, {'L': 0, 'a': 1, 'b': 2}[chn]]
        w, n = edge_width(ch, axis, scale)
        edges.append({'image': name, 'label': label, 'kind': kind, 'width_px': w, 'profiles': n})
    # the aurora (Reykjavik): a whisper on its sky; its vertical streaks' spacing
    rgb, lab, ui = cache.get('02_reykjavik.jpg') or (None, None, None)
    if rgb is None:
        rgb = load('02_reykjavik.jpg', a.v2dir)
        lab = skcolor.rgb2lab(rgb).astype(np.float32)
    band, sky = lab[690:760, 560:900], lab[600:640, 560:900]
    d = band.reshape(-1, 3).mean(0) - sky.reshape(-1, 3).mean(0)
    prof = band[..., 1].mean(0)
    prof = prof - np.convolve(prof, np.ones(41) / 41, 'same')
    spec = np.abs(np.fft.rfft(prof * np.hanning(len(prof))))
    fr = np.fft.rfftfreq(len(prof))
    k = int(np.argmax(spec[3:])) + 3
    aur = {'dL': round(float(d[0]), 1), 'da': round(float(d[1]), 1), 'db': round(float(d[2]), 1),
           'dE76': round(float(np.linalg.norm(d)), 1), 'streak_px_1080': round(float(1 / fr[k] * 1080 / rgb.shape[1]), 1)}
    print()
    print('aurora on its sky:', aur)
    json.dump({'samples': res, 'edges': edges, 'aurora': aur}, open(os.path.join(a.out, 'pro_3_nature.json'), 'w'), indent=1, default=float)
    hdr = f"{'sample':28s} {'band':4s} {'cov':>4s} {'vals':>4s} {'L mean':>6s} {'range':>5s} {'steps':24s} {'top r':>5s} {'rim':>5s} {'rough':>5s} {'strt':>5s} {'e/c':>5s} {'fine':>5s} {'mott':>5s} {'flat':>5s} {'lt deg':>6s} {'lt k':>5s} {'lc':>5s}"
    print(hdr)
    for r in res:
        print(f"{r['label'][:28]:28s} {r['band'][:4]:4s} {r['cover']:4.2f} {len(r['values']):4d} {r['L_mean']:6.1f} {r['range']:5.1f} {str(r['steps'])[:24]:24s} "
              f"{r['top_r']:5.2f} {str(r.get('rim_dL')):>5s} {r.get('rough', 0):5.2f} {r.get('straight', 0):5.2f} {str(r.get('edge_core')):>5s} {r['fine']:5.2f} {r['mottle']:5.2f} {r.get('flat', 0):5.2f} {r['light_deg']:6.0f} {r['light_k']:5.2f} {r['lc']:5.2f}")
    print()
    for e in edges:
        print(f"{e['label']:40s} {e['kind']:5s} width {e['width_px']} px at 1080 ({e['profiles']} profiles)")


if __name__ == '__main__':
    main()
