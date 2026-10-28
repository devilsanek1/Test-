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
    ('02_reykjavik.jpg', 'aurora: upper (streaked) edge', 'soft', [560, 640, 760, 760], 'y', 'a'),
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


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--v2dir', default='/tmp/posters-pro_3_nature')
    ap.add_argument('--out', default='/tmp/posters-pro_3_nature')
    a = ap.parse_args()
    res = []
    cache = {}
    for name, label, band, kind, box, rule in SAMPLES:
        if name not in cache:
            rgb = load(name, a.v2dir)
            cache[name] = (rgb, skcolor.rgb2lab(rgb).astype(np.float32), ui_mask(name, rgb.shape))
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
    json.dump({'samples': res, 'edges': edges}, open(os.path.join(a.out, 'pro_3_nature.json'), 'w'), indent=1, default=float)
    hdr = f"{'sample':28s} {'band':4s} {'cov':>4s} {'vals':>4s} {'L mean':>6s} {'range':>5s} {'steps':24s} {'top r':>5s} {'rim':>5s} {'rough':>5s} {'strt':>5s} {'e/c':>5s} {'fine':>5s} {'mott':>5s} {'flat':>5s} {'lt deg':>6s} {'lt k':>5s}"
    print(hdr)
    for r in res:
        print(f"{r['label'][:28]:28s} {r['band'][:4]:4s} {r['cover']:4.2f} {len(r['values']):4d} {r['L_mean']:6.1f} {r['range']:5.1f} {str(r['steps'])[:24]:24s} "
              f"{r['top_r']:5.2f} {str(r.get('rim_dL')):>5s} {r.get('rough', 0):5.2f} {r.get('straight', 0):5.2f} {str(r.get('edge_core')):>5s} {r['fine']:5.2f} {r['mottle']:5.2f} {r.get('flat', 0):5.2f} {r['light_deg']:6.0f} {r['light_k']:5.2f}")
    print()
    for e in edges:
        print(f"{e['label']:40s} {e['kind']:5s} width {e['width_px']} px at 1080 ({e['profiles']} profiles)")


if __name__ == '__main__':
    main()
