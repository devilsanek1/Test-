#!/usr/bin/env python3
"""pro_2_hierarchy.py -- the hierarchy-of-finish meter (city-poster study, pro-practice 2, 2026-10-28).

How a frame spends its FINISH: where the small features, the faces, the tones, the texture and the value range sit,
tier by tier, and whether the simpler tiers still share the hero's colours and edges. Prototype for `check_finish.py`
(docs/studies/2026-10-28_city_posters/pro_2_hierarchy.md section 3).

All maps at a common width of 1080 px (CIE L*a*b*), the Instagram UI masked (ui_mask.json). Per declared box:
  fine %      thin features: black-hat or top-hat (9 px ellipse) >= 10 L* on the grain-free L* (median 5 + bilateral):
              window bars, mullions, rails, ornament, small figures (CRAFT §e's line mask is the same operator)
  flat %      pixels whose local gradient (5 px mean) is < 1.5 L*/px: the inside of faces
  faces/10k   Felzenszwalb regions (>= 40 px) per 10,000 px on the grain-free image: the density of shapes
  face side   sqrt of the area-weighted median face area after mean-shift flattening, px: the typical face size
  tone spread L* p90 - p10 inside each face >= 400 px, area-weighted: mottling and ramps inside a face
  L range     L* p95 - p5
  local c.    CRAFT §e's local contrast: mean |L* - Gaussian(L*, sigma 16)|
  texture     std of L* minus its 5 px median in calm areas (>= 4 px from any edge): the surface grain
  C*          median chroma
  edge w      10-90 % width of strong edges (step >= 15 L*): step / peak gradient, px (blur shows as a wide edge)
  dE pal      median CIEDE2000 from the box's pixels to the 16-colour palette of the image's A and B boxes
Per image: the share of the fine detail held by the top 10 % of tiles (W/24 px): how concentrated the detail is (the
posters' title zone and v2's caption band left out).

Usage:  python3 video/scripts/look/posters/pro_2_hierarchy.py [--v2dir DIR] [--out DIR] [--sheet PATH] [--crops PATH]
v2 frames: ffmpeg -ss <t> -i video/deliverables/v2/v2r_G7_master_v1.mp4 -frames:v 1 <v2dir>/v2_t<t>.png
Boxes: each screenshot's own pixels (posters), the 1080 x 1920 master's pixels (v2).
"""
import argparse
import json
import os
import sys

import numpy as np
import cv2
from PIL import Image, ImageDraw, ImageFont
from skimage import color as skcolor
from skimage.segmentation import felzenszwalb
from sklearn.cluster import KMeans

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..', '..'))
REF = os.path.join(ROOT, 'video/docs/look/poster_refs')
W = 1080  # common width

# (label, tier, box [x0, y0, x1, y1] in the screenshot's pixels). C near = the patchwork; C far = far blocks, mountains.
BOXES = {
    '01_singapore.jpg': [
        ('MBS towers', 'A', [232, 661, 877, 1054]), ('Merlion', 'A', [795, 1001, 960, 1219]),
        ('shophouses', 'B', [495, 1309, 1060, 1495]), ('patchwork', 'C', [135, 1339, 495, 1609]),
        ('far blocks', 'Cf', [0, 739, 345, 994])],
    '02_reykjavik.jpg': [
        ('Hallgrimskirkja', 'A', [45, 398, 532, 1118]), ('Harpa', 'A', [592, 1002, 1140, 1233]),
        ('houses', 'B', [0, 1260, 930, 1605]), ('faceted roofs', 'C', [0, 1118, 630, 1260]),
        ('far mountain', 'Cf', [0, 390, 180, 960]), ('far facets', 'Cf', [900, 600, 1206, 880])],
    '03_hanoi.jpg': [
        ('One Pillar Pagoda', 'A', [675, 829, 1185, 1377]), ('Huc bridge', 'A', [225, 1054, 630, 1204]),
        ('cyclo', 'B', [82, 1279, 368, 1564]), ('patchwork', 'C', [405, 1279, 705, 1609]),
        ('far city (miniature)', 'Cf', [360, 574, 1200, 829])],
    '04_buenos_aires.jpg': [
        ('Obelisco', 'A', [558, 393, 670, 1065]), ('Casa Rosada', 'A', [660, 960, 1206, 1395]),
        ('La Boca', 'B', [0, 930, 300, 1575]), ('patchwork', 'C', [520, 1430, 780, 1575]),
        ('far blocks', 'Cf', [255, 750, 495, 915])],
    '05_cape_town.jpg': [
        ('Table Mountain', 'A', [0, 605, 1206, 928]), ('Bo-Kaap', 'A', [750, 827, 1206, 1440]),
        ('city mid', 'B', [480, 845, 900, 1145]), ('patchwork', 'C', [90, 1190, 360, 1290]),
        ('protea', 'B', [0, 1250, 495, 1605])],
    '06_copenhagen.jpg': [
        ('Nyhavn facades', 'A', [0, 724, 750, 1219]), ('spire', 'A', [183, 364, 300, 882]),
        ('mermaid', 'A', [840, 1114, 1185, 1490]), ('round tower', 'B', [600, 836, 738, 1069]),
        ('water patchwork', 'C', [560, 1282, 840, 1345]), ('pale blocks', 'Cf', [1005, 964, 1206, 1159])],
    '07_kyoto.jpg': [
        ('Kinkaku-ji', 'A', [638, 739, 1170, 1129]), ('pagoda', 'A', [165, 461, 413, 859]),
        ('torii', 'B', [90, 1054, 435, 1294]), ('patchwork', 'C', [560, 1180, 720, 1300]),
        ('far mountains', 'Cf', [660, 634, 1206, 799])],
}
V2 = {  # v2 master frames (1080 x 1920); A = the beat's subject (docs/v2/STYLE.md: her, her door, Google's door)
    'v2_t5.20.png': [  # S1, the cover frame
        ('her + Google door', 'A', [470, 780, 740, 1090]), ('Google facade', 'B', [740, 590, 1080, 1070]),
        ('props near', 'C', [0, 1300, 1080, 1900]), ('canal', 'C', [0, 1090, 1080, 1290]),
        ('far city', 'Cf', [0, 600, 320, 940])],
    'v2_t14.00.png': [  # S3
        ('her window', 'A', [256, 690, 410, 860]), ('neighbour windows', 'C', [560, 690, 1000, 860]),
        ('narrowboat', 'C', [0, 1320, 1080, 1580])],
    'v2_t9.00.png': [], 'v2_t17.50.png': [], 'v2_t22.00.png': [], 'v2_t26.00.png': [], 'v2_t30.50.png': [],
    'v2_t36.00.png': [],  # S2, S4, S5, S6, S7, S8: tile map only
}
TITLE_ROWS = 330          # posters: the title zone (rows above this at 1080 wide) is left out of the tile map
CAPTION_BAND = (290, 600)  # v2: the caption band (1080 x 1920 rows) is left out of the tile map
# the crop sheet: rows of (image, [(tier label, centre x, centre y) in the image's own pixels])
CROPS = [
    ('01_singapore.jpg', [('A MBS towers', 500, 840), ('B shophouses', 800, 1420), ('C patchwork', 300, 1470), ('C far blocks', 120, 760)]),
    ('02_reykjavik.jpg', [('A Hallgrimskirkja', 250, 820), ('B houses', 450, 1440), ('C faceted roofs', 300, 1190), ('C far facets', 1040, 760)]),
    ('04_buenos_aires.jpg', [('A Casa Rosada', 900, 1150), ('B La Boca', 150, 1250), ('C patchwork', 760, 1510), ('C far blocks', 375, 830)]),
    ('07_kyoto.jpg', [('A Kinkaku-ji', 880, 930), ('B torii', 260, 1170), ('C patchwork', 470, 1500), ('C far mountains', 1090, 640)]),
    ('v2_t5.20.png', [('A her + Google door', 610, 930), ('B Google facade', 900, 830), ('C props near', 400, 1640), ('C far city', 160, 770)]),
]
GROUP = {'A': 'A', 'B': 'B', 'C': 'C near', 'Cf': 'C far'}


def load(path, maskinfo=None):
    a = np.asarray(Image.open(path).convert('RGB')).astype(np.float32) / 255.0
    valid = np.ones(a.shape[:2], bool)
    r0, r1 = 0, a.shape[0]
    if maskinfo:
        for k in ('counter_pill_box', 'mute_button_box'):
            x0, y0, x1, y1 = maskinfo[k]
            valid[y0:y1, x0:x1] = False
        r0, r1 = maskinfo['content_rows']
        valid[:r0] = False
        valid[r1:] = False
    return a, valid, r0, r1


def analyse(a, valid):
    s = W / a.shape[1]
    a2 = cv2.resize(a, (W, int(round(a.shape[0] * s))), interpolation=cv2.INTER_AREA)
    v2 = cv2.resize(valid.astype(np.uint8), (a2.shape[1], a2.shape[0]), interpolation=cv2.INTER_NEAREST).astype(bool)
    lab = skcolor.rgb2lab(np.clip(a2, 0, 1)).astype(np.float32)
    L = lab[..., 0]
    L8 = np.clip(L * 2.55, 0, 255).astype(np.uint8)
    Lmed = cv2.medianBlur(L8, 5).astype(np.float32) / 2.55
    Lm = cv2.bilateralFilter(cv2.medianBlur(L8, 5), 7, 12, 5).astype(np.float32) / 2.55  # grain-free L*
    k9 = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (9, 9))
    fine = (np.maximum(cv2.morphologyEx(Lm, cv2.MORPH_TOPHAT, k9), cv2.morphologyEx(Lm, cv2.MORPH_BLACKHAT, k9)) >= 10) & v2
    gx = cv2.Sobel(Lm, cv2.CV_32F, 1, 0, ksize=3) / 8
    gy = cv2.Sobel(Lm, cv2.CV_32F, 0, 1, ksize=3) / 8
    g = np.hypot(gx, gy)
    flat = (cv2.blur(g, (5, 5)) < 1.5) & v2
    e = (cv2.Canny(np.clip(Lm * 2.55, 0, 255).astype(np.uint8), 20, 50) > 0) & v2
    near_edge = cv2.dilate(e.astype(np.uint8), np.ones((9, 9), np.uint8)) > 0
    k7 = np.ones((7, 7), np.uint8)
    step = cv2.dilate(Lm, k7) - cv2.erode(Lm, k7)
    u8 = (np.clip(a2, 0, 1) * 255).astype(np.uint8)
    sm = cv2.bilateralFilter(cv2.medianBlur(u8, 5), 7, 20, 5)
    seg = felzenszwalb(sm, scale=250, sigma=0.8, min_size=40)
    ms = cv2.pyrMeanShiftFiltering(cv2.medianBlur(u8, 5), 8, 14)
    lc = np.abs(L - cv2.GaussianBlur(L, (0, 0), 16))
    return dict(a=a2, valid=v2, L=L, Lm=Lm, grain=L - Lmed, fine=fine, flat=flat, edge=e, near_edge=near_edge, g=g,
                step=step, seg=seg, ms=ms, lab=lab, lc=lc, s=s)


def _sl(m, box):
    x0, y0, x1, y1 = [int(round(v * m['s'])) for v in box]
    return (slice(y0, y1), slice(x0, x1))


def box_stats(m, box, palette):
    sl = _sl(m, box)
    v = m['valid'][sl]
    if v.sum() < 100:
        return None
    area = v.sum()
    seg = m['seg'][sl]
    ids, counts = np.unique(seg[v], return_counts=True)
    keep = counts >= 40
    Lm = m['Lm'][sl]
    spreads, wts = [], []
    for i, c in zip(ids, counts):
        if c >= 400:
            vals = Lm[(seg == i) & v]
            spreads.append(np.percentile(vals, 90) - np.percentile(vals, 10))
            wts.append(c)
    fseg = felzenszwalb(m['ms'][sl], scale=300, sigma=0.5, min_size=60)
    _, fc = np.unique(fseg, return_counts=True)
    fc = np.sort(fc)
    face_side = float(np.sqrt(fc[np.searchsorted(np.cumsum(fc) / fc.sum(), 0.5)]))
    calm = v & ~m['near_edge'][sl]
    e = m['edge'][sl] & v
    stp, gg = m['step'][sl], m['g'][sl]
    strong = e & (stp >= 15) & (gg > 0.5)
    px = m['lab'][sl][v]
    rng = np.random.default_rng(0)
    px = px[rng.choice(len(px), min(12000, len(px)), replace=False)]
    dE = np.min(np.stack([skcolor.deltaE_ciede2000(px, np.tile(c, (len(px), 1))) for c in palette], 1), 1)
    return dict(
        fine_pct=100 * (m['fine'][sl] & v).sum() / area,
        flat_pct=100 * (m['flat'][sl] & v).sum() / area,
        faces_per_10k=1e4 * keep.sum() / area,
        face_side=face_side,
        tone_spread=float(np.average(spreads, weights=wts)) if spreads else float('nan'),
        L_range=float(np.percentile(m['L'][sl][v], 95) - np.percentile(m['L'][sl][v], 5)),
        local_c=float(np.mean(m['lc'][sl][v])),
        texture=float(np.std(m['grain'][sl][calm])) if calm.sum() > 200 else float('nan'),
        C_med=float(np.median(np.hypot(m['lab'][..., 1], m['lab'][..., 2])[sl][v])),
        edge_w=float(np.median(stp[strong] / gg[strong])) if strong.sum() > 30 else float('nan'),
        dE_pal=float(np.median(dE)),
        area_pct=100 * area / m['valid'].sum(),
    )


def ab_palette(m, boxes):
    pts = []
    for _, t, b in boxes:
        if t in ('A', 'B'):
            sl = _sl(m, b)
            pts.append(m['lab'][sl][m['valid'][sl]])
    pts = np.concatenate(pts)
    rng = np.random.default_rng(0)
    pts = pts[rng.choice(len(pts), min(40000, len(pts)), replace=False)]
    return KMeans(n_clusters=16, n_init=3, random_state=0).fit(pts).cluster_centers_


def tile_map(m, n=24):
    t = W // n
    rows = m['fine'].shape[0] // t
    out = np.full((rows, n), np.nan)
    for r in range(rows):
        for c in range(n):
            sl = (slice(r * t, (r + 1) * t), slice(c * t, (c + 1) * t))
            v = m['valid'][sl]
            if v.mean() >= 0.6:
                out[r, c] = 100 * (m['fine'][sl] & v).sum() / v.sum()
    return out, t


def top10_share(tm):
    x = np.sort(tm[~np.isnan(tm)])[::-1]
    return 100 * x[: max(1, len(x) // 10)].sum() / (x.sum() or 1)


try:
    FONT = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 26)
    FONT_M = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 17)
    FONT_MB = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 18)
    FONT_S = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 34)
except OSError:
    FONT = FONT_M = FONT_MB = FONT_S = ImageFont.load_default()
COL = {'A': (0, 150, 70), 'B': (40, 90, 220), 'C': (110, 110, 110), 'Cf': (160, 160, 160)}
BG = (250, 247, 240)


def heat_overlay(m, tm, t, boxes):
    base = (np.clip(m['a'], 0, 1) * 255).astype(np.uint8)
    grey = cv2.cvtColor(cv2.cvtColor(base, cv2.COLOR_RGB2GRAY), cv2.COLOR_GRAY2RGB)
    img = (grey * 0.55 + 255 * 0.45).astype(np.uint8)
    norm = np.clip(np.nan_to_num(tm, nan=0) / 20.0, 0, 1)
    cm = cv2.applyColorMap((norm * 255).astype(np.uint8), cv2.COLORMAP_INFERNO)[..., ::-1]
    big = cv2.resize(cm, (tm.shape[1] * t, tm.shape[0] * t), interpolation=cv2.INTER_NEAREST)
    al = cv2.resize(norm, (tm.shape[1] * t, tm.shape[0] * t), interpolation=cv2.INTER_NEAREST)[..., None] * 0.8
    h = min(big.shape[0], img.shape[0])
    img[:h] = (img[:h] * (1 - al[:h]) + big[:h] * al[:h]).astype(np.uint8)
    pil = Image.fromarray(img)
    d = ImageDraw.Draw(pil)
    for lab, tier, b in boxes:
        bb = [int(round(v * m['s'])) for v in b]
        d.rectangle(bb, outline=COL[tier], width=4)
        d.text((bb[0] + 6, bb[1] + 4), f'{GROUP[tier]}: {lab}', fill=COL[tier], font=FONT)
    return pil


def crop_sheet(maps, stats, path):
    cw, ch = 340, 260
    cap_h = 64
    rows = []
    for name, cells in CROPS:
        if name not in maps:
            continue
        m = maps[name]
        imgs = []
        for lab, cx, cy in cells:
            x, y = int(round(cx * m['s'])), int(round(cy * m['s']))
            x0, y0 = max(0, x - cw // 2), max(0, y - ch // 2)
            x0, y0 = min(x0, m['a'].shape[1] - cw), min(y0, m['a'].shape[0] - ch)
            crop = Image.fromarray((np.clip(m['a'][y0:y0 + ch, x0:x0 + cw], 0, 1) * 255).astype(np.uint8))
            st = stats[name].get(lab, None)
            cell = Image.new('RGB', (cw, ch + cap_h), BG)
            cell.paste(crop, (0, 0))
            d = ImageDraw.Draw(cell)
            tier = lab.split()[0]
            d.rectangle([0, 0, cw - 1, ch - 1], outline=COL['A' if tier == 'A' else 'B' if tier == 'B' else 'C'], width=3)
            d.text((6, ch + 3), lab, fill=(20, 20, 20), font=FONT_MB)
            if st:
                d.text((6, ch + 24), f"fine {st['fine_pct']:.1f}% | faces {st['faces_per_10k']:.0f} | side {st['face_side']:.0f}px",
                       fill=(40, 40, 40), font=FONT_M)
                d.text((6, ch + 43), f"spread {st['tone_spread']:.1f} | L* {st['L_range']:.0f} | lc {st['local_c']:.1f} | tex {st['texture']:.1f}",
                       fill=(40, 40, 40), font=FONT_M)
            imgs.append(cell)
        label = Image.new('RGB', (150, ch + cap_h), BG)
        ImageDraw.Draw(label).text((8, 8), name.replace('.jpg', '').replace('.png', '').replace('_', '\n', 1), fill=(20, 20, 20), font=FONT_MB)
        row = Image.new('RGB', (150 + len(imgs) * (cw + 10), ch + cap_h), BG)
        row.paste(label, (0, 0))
        for i, im in enumerate(imgs):
            row.paste(im, (150 + i * (cw + 10), 0))
        rows.append(row)
    head = 92
    sheet = Image.new('RGB', (max(r.width for r in rows) + 10, head + sum(r.height + 12 for r in rows)), BG)
    d = ImageDraw.Draw(sheet)
    d.text((10, 8), 'One style, four finishes, at one magnification (340 x 260 px at 1080 wide). Last row: v2 S1 (t 5.20 s).', fill=(20, 20, 20), font=FONT)
    d.text((10, 44), 'A crisp hero | B near life | C near = the patchwork: the same faces and colours, no small features | C far: few tones near the air.'
           ' Numbers = the whole box (pro_2_hierarchy.py).', fill=(60, 60, 60), font=FONT_M)
    d.text((10, 66), 'fine = thin features < 9 px at >= 10 L* | faces = shapes per 10,000 px | side = typical face side | spread = L* p90-p10 inside a face'
           ' | lc = CRAFT local contrast | tex = surface texture', fill=(60, 60, 60), font=FONT_M)
    y = head
    for r in rows:
        sheet.paste(r, (0, y))
        y += r.height + 12
    if max(sheet.size) > 2400:
        k = 2400 / max(sheet.size)
        sheet = sheet.resize((int(sheet.width * k), int(sheet.height * k)), Image.LANCZOS)
    sheet.save(path, quality=85)
    print('crops', path, sheet.size)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--out', default='/tmp/posters-pro_2_hierarchy')
    ap.add_argument('--v2dir', default='/tmp/posters-pro_2_hierarchy/v2')
    ap.add_argument('--sheet', default=None)
    ap.add_argument('--crops', default=None)
    o = ap.parse_args()
    os.makedirs(o.out, exist_ok=True)
    masks = json.load(open(os.path.join(REF, 'ui_mask.json')))['images']
    items = [(f, os.path.join(REF, f), masks[f], BOXES[f]) for f in sorted(BOXES)]
    items += [(f, os.path.join(o.v2dir, f), None, V2[f]) for f in V2 if os.path.exists(os.path.join(o.v2dir, f))]
    results, tiles, maps, crop_stats = {}, [], {}, {}
    for name, path, mk, boxes in items:
        a, valid, r0, r1 = load(path, mk)
        if mk:
            valid[: int(TITLE_ROWS * a.shape[1] / W)] = False
        else:
            valid[CAPTION_BAND[0]:CAPTION_BAND[1]] = False
        m = analyse(a, valid)
        tm, t = tile_map(m)
        pal = ab_palette(m, boxes) if boxes else None
        bs = {f'{GROUP[tier]}: {lab}': box_stats(m, b, pal) for lab, tier, b in boxes}
        results[name] = dict(top10_share=top10_share(tm), mean_fine=float(np.nanmean(tm)), boxes=bs)
        maps[name] = m
        crop_stats[name] = {}
        for lab, tier, b in boxes:
            crop_stats[name][f"{tier[0]} {lab}"] = bs[f'{GROUP[tier]}: {lab}']
        ov = heat_overlay(m, tm, t, boxes)
        if mk:
            ov = ov.crop((0, int(r0 * m['s']), ov.width, int(r1 * m['s'])))
        tiles.append((name, ov, results[name]['top10_share']))
        print(f"{name}: top 10 % of tiles hold {results[name]['top10_share']:.0f} % of the fine detail; mean fine {results[name]['mean_fine']:.2f} %")
        for k, v in bs.items():
            if v:
                print(f"   {k:28s} fine {v['fine_pct']:5.1f}  flat {v['flat_pct']:4.0f}  faces {v['faces_per_10k']:5.1f}  side {v['face_side']:4.0f}"
                      f"  spread {v['tone_spread']:4.1f}  Lr {v['L_range']:4.0f}  lc {v['local_c']:4.1f}  tex {v['texture']:4.2f}"
                      f"  C* {v['C_med']:4.1f}  edge {v['edge_w']:4.2f}  dEpal {v['dE_pal']:4.1f}  area {v['area_pct']:4.1f}")
    # tier summary over the posters
    keys = ['fine_pct', 'flat_pct', 'faces_per_10k', 'face_side', 'tone_spread', 'L_range', 'local_c', 'texture', 'C_med', 'edge_w', 'dE_pal']
    summ = {}
    for g in ('A', 'B', 'C near', 'C far'):
        vals = [v for f, r in results.items() if not f.startswith('v2') for k, v in r['boxes'].items() if v and k.startswith(g + ':')]
        summ[g] = {k: [float(np.nanmedian([v[k] for v in vals])), float(np.nanmin([v[k] for v in vals])),
                       float(np.nanmax([v[k] for v in vals]))] for k in keys}
        summ[g]['n'] = len(vals)
    results['_summary_posters'] = summ
    print('\nposters, median [min-max] per tier group:')
    for g, d in summ.items():
        print(f"  {g:7s} n={d['n']:2d}  " + '  '.join(f"{k} {d[k][0]:.1f} [{d[k][1]:.1f}-{d[k][2]:.1f}]" for k in keys))
    json.dump(results, open(os.path.join(o.out, 'pro_2_hierarchy.json'), 'w'), indent=1)
    if o.crops:
        crop_sheet(maps, crop_stats, o.crops)
    if o.sheet:
        th = 820
        cells = []
        for name, ov, top10 in tiles:
            im = ov.resize((int(ov.width * th / ov.height), th), Image.LANCZOS)
            cell = Image.new('RGB', (im.width, th + 70), BG)
            cell.paste(im, (0, 0))
            d = ImageDraw.Draw(cell)
            d.text((8, th + 4), name.replace('.jpg', '').replace('.png', ''), fill=(30, 30, 30), font=FONT)
            d.text((8, th + 36), f'top 10% of tiles: {top10:.0f}%', fill=(30, 30, 30), font=FONT)
            cells.append(cell)
        per_row = 5
        rows = [cells[i:i + per_row] for i in range(0, len(cells), per_row)]
        sheet = Image.new('RGB', (max(sum(c.width + 12 for c in r) for r in rows), len(rows) * (th + 82) + 60), BG)
        ImageDraw.Draw(sheet).text((10, 10), 'Where the small features sit (thin features < 9 px at >= 10 L*, per tile; brighter = more).'
                                   ' Titles and captions out. Boxes: A green, B blue, C grey', fill=(20, 20, 20), font=FONT_S)
        y = 60
        for r in rows:
            x = 0
            for c in r:
                sheet.paste(c, (x, y))
                x += c.width + 12
            y += th + 82
        if max(sheet.size) > 2400:
            k = 2400 / max(sheet.size)
            sheet = sheet.resize((int(sheet.width * k), int(sheet.height * k)), Image.LANCZOS)
        sheet.save(o.sheet, quality=85)
        print('sheet', o.sheet, sheet.size)


if __name__ == '__main__':
    sys.exit(main())
