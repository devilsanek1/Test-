#!/usr/bin/env python3
"""pro_2_hierarchy.py -- the hierarchy-of-finish meter (city-poster study, pro-practice 2, 2026-10-28).

Measures how a frame spends its DETAIL: where the structure edges, the facets (flat regions) and the value range sit,
and whether the edges are "found" (high value step) or "lost" (low value step). Prototype for a `check_finish.py`.

Per tile (W/24 px at a common width of 1080 px), after removing the posters' paper grain (median 5 px on L*):
  fine %   thin features (< 9 px wide at 1080 px, >= 10 L* contrast: window bars, mullions, rails, ornament) per tile
  facets   Felzenszwalb flat regions per 100 x 100 px
  L range  L* p95 - p5
Per declared box (the poster's hero A, its supporting B, its patchwork / far C): the same, plus
  dL edge  median L* step across its edge pixels (found vs lost edges)
  grain    std of L* minus its 5 px median (the surface texture; equal across tiers = one surface)
  min feat median width of its flat regions' thinnest dimension, px (how small its smallest drawn things are)

Usage:  python3 video/scripts/look/posters/pro_2_hierarchy.py [--out DIR] [--sheet PATH]
Boxes are in each screenshot's own pixels (ui_mask.json's frame), v2 boxes in 1080 x 1920 master pixels.
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

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..', '..'))
REF = os.path.join(ROOT, 'video/docs/look/poster_refs')
W = 1080  # common width

# (label, tier, box [x0, y0, x1, y1] in the screenshot's pixels)
BOXES = {
    '01_singapore.jpg': [
        ('MBS towers', 'A', [232, 661, 877, 1054]), ('Merlion', 'A', [795, 1001, 960, 1219]),
        ('shophouses', 'B', [495, 1309, 1060, 1495]), ('patchwork', 'C', [135, 1339, 495, 1609]),
        ('far blocks', 'C', [0, 739, 345, 994])],
    '02_reykjavik.jpg': [
        ('Hallgrimskirkja', 'A', [45, 398, 532, 1118]), ('Harpa', 'A', [592, 1002, 1140, 1233]),
        ('houses', 'B', [0, 1260, 930, 1605]), ('faceted roofs', 'C', [0, 1118, 630, 1260]),
        ('far mountain', 'C', [0, 390, 180, 960])],
    '03_hanoi.jpg': [
        ('One Pillar Pagoda', 'A', [675, 829, 1185, 1377]), ('Huc bridge', 'A', [225, 1054, 630, 1204]),
        ('cyclo', 'B', [82, 1279, 368, 1564]), ('patchwork', 'C', [405, 1279, 705, 1609]),
        ('far city (miniature)', 'C', [360, 574, 1200, 829])],
    '04_buenos_aires.jpg': [
        ('Obelisco', 'A', [558, 393, 670, 1065]), ('Casa Rosada', 'A', [660, 960, 1206, 1395]),
        ('La Boca', 'B', [0, 930, 300, 1575]), ('patchwork', 'C', [520, 1430, 780, 1575]),
        ('far blocks', 'C', [255, 750, 495, 915])],
    '05_cape_town.jpg': [
        ('Table Mountain', 'A', [0, 605, 1206, 928]), ('Bo-Kaap', 'A', [750, 827, 1206, 1440]),
        ('city mid', 'B', [480, 845, 900, 1145]), ('patchwork', 'C', [90, 1190, 360, 1290]),
        ('protea', 'B', [0, 1250, 495, 1605])],
    '06_copenhagen.jpg': [
        ('Nyhavn facades', 'A', [0, 724, 750, 1219]), ('spire', 'A', [183, 364, 300, 882]),
        ('mermaid', 'A', [840, 1114, 1185, 1490]), ('round tower', 'B', [600, 836, 738, 1069]),
        ('water patchwork', 'C', [560, 1282, 840, 1345]), ('pale blocks', 'C', [1005, 964, 1206, 1159])],
    '07_kyoto.jpg': [
        ('Kinkaku-ji', 'A', [638, 739, 1170, 1129]), ('pagoda', 'A', [165, 461, 413, 859]),
        ('torii', 'B', [90, 1054, 435, 1294]), ('patchwork', 'C', [560, 1180, 720, 1300]),
        ('far mountains', 'C', [660, 634, 1206, 799])],
}
V2 = {  # v2 master frames (1080 x 1920); A = the beat's subject per docs/v2/STYLE.md
    'v2_t5.20.png': [  # S1 cover
        ('her + Google door', 'A', [470, 780, 740, 1090]), ('Google facade', 'B', [740, 590, 1080, 1070]),
        ('far city', 'C', [0, 600, 320, 940]), ('props near', 'C', [0, 1300, 1080, 1900]),
        ('canal', 'C', [0, 1090, 1080, 1290])],
    'v2_t17.50.png': [],  # S4: heat map only
    'v2_t30.50.png': [],  # S7
}


def load(path, maskinfo=None):
    im = Image.open(path).convert('RGB')
    a = np.asarray(im).astype(np.float32) / 255.0
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
    """Maps at the common width: L*, grain-free L* (median 5 + bilateral), fine detail, flatness, segments."""
    s = W / a.shape[1]
    a2 = cv2.resize(a, (W, int(round(a.shape[0] * s))), interpolation=cv2.INTER_AREA)
    v2 = cv2.resize(valid.astype(np.uint8), (a2.shape[1], a2.shape[0]), interpolation=cv2.INTER_NEAREST).astype(bool)
    lab = skcolor.rgb2lab(np.clip(a2, 0, 1)).astype(np.float32)
    L = lab[..., 0]
    L8 = np.clip(L * 2.55, 0, 255).astype(np.uint8)
    Lm = cv2.bilateralFilter(cv2.medianBlur(L8, 5), 7, 12, 5).astype(np.float32) / 2.55
    grain = L - cv2.medianBlur(L8, 5).astype(np.float32) / 2.55
    # FINE DETAIL: thin features (< ~9 px wide at 1080 px) at >= 10 L* contrast: window bars, mullions, rails, ornament
    k9 = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (9, 9))
    th = cv2.morphologyEx(Lm, cv2.MORPH_TOPHAT, k9)
    bh = cv2.morphologyEx(Lm, cv2.MORPH_BLACKHAT, k9)
    fine = (np.maximum(th, bh) >= 10) & v2
    # FLAT: local value gradient < 1.5 L*/px over a 5 px window (inside a facet)
    gx = cv2.Sobel(Lm, cv2.CV_32F, 1, 0, ksize=3) / 8
    gy = cv2.Sobel(Lm, cv2.CV_32F, 0, 1, ksize=3) / 8
    g = cv2.blur(np.hypot(gx, gy), (5, 5))
    flat = (g < 1.5) & v2
    # STEP EDGES (structure, not grain): Canny on the grain-free L*
    e = (cv2.Canny(np.clip(Lm * 2.55, 0, 255).astype(np.uint8), 20, 50) > 0) & v2
    near_edge = cv2.dilate(e.astype(np.uint8), np.ones((9, 9), np.uint8)) > 0
    sm = cv2.bilateralFilter(cv2.medianBlur((np.clip(a2, 0, 1) * 255).astype(np.uint8), 5), 7, 20, 5)
    seg = felzenszwalb(sm, scale=250, sigma=0.8, min_size=40)
    return dict(a=a2, valid=v2, L=L, Lm=Lm, grain=grain, fine=fine, flat=flat, edge=e, near_edge=near_edge, seg=seg,
                lab=lab, s=s)


def box_stats(m, box):
    x0, y0, x1, y1 = [int(round(v * m['s'])) for v in box]
    sl = (slice(y0, y1), slice(x0, x1))
    v = m['valid'][sl]
    if v.sum() < 100:
        return None
    area = v.sum()
    Lv = m['L'][sl][v]
    seg = m['seg'][sl]
    ids, counts = np.unique(seg[v], return_counts=True)
    keep = counts >= 40
    # within-facet modelling: the L* spread (p90-p10) inside each facet of >= 400 px, area-weighted
    Lm = m['Lm'][sl]
    spreads, wts = [], []
    for i, c in zip(ids, counts):
        if c < 400:
            continue
        vals = Lm[(seg == i) & v]
        spreads.append(np.percentile(vals, 90) - np.percentile(vals, 10))
        wts.append(c)
    calm = v & ~m['near_edge'][sl]
    C = np.hypot(m['lab'][..., 1], m['lab'][..., 2])[sl][v]
    return dict(
        fine_pct=100 * (m['fine'][sl] & v).sum() / area,
        edge_pct=100 * (m['edge'][sl] & v).sum() / area,
        flat_pct=100 * (m['flat'][sl] & v).sum() / area,
        facets_per_10k=1e4 * keep.sum() / area,
        facet_med=float(np.median(counts[keep])) if keep.any() else float('nan'),
        model=float(np.average(spreads, weights=wts)) if spreads else float('nan'),
        L_range=float(np.percentile(Lv, 95) - np.percentile(Lv, 5)),
        grain=float(np.std(m['grain'][sl][calm])) if calm.sum() > 200 else float('nan'),
        C_med=float(np.median(C)),
        area_pct=100 * area / m['valid'].sum(),
    )


def tile_map(m, n=24):
    t = W // n
    H, Wd = m['fine'].shape
    rows = H // t
    out = np.full((rows, n), np.nan)
    for r in range(rows):
        for c in range(n):
            sl = (slice(r * t, (r + 1) * t), slice(c * t, (c + 1) * t))
            v = m['valid'][sl]
            if v.mean() < 0.6:
                continue
            out[r, c] = 100 * (m['fine'][sl] & v).sum() / v.sum()
    return out, t


def concentration(tm):
    x = tm[~np.isnan(tm)]
    x = np.sort(x)[::-1]
    tot = x.sum() or 1
    top10 = x[: max(1, len(x) // 10)].sum() / tot
    n = len(x)
    xs = np.sort(x)
    gini = (2 * np.sum((np.arange(1, n + 1)) * xs) / (n * xs.sum()) - (n + 1) / n) if xs.sum() else 0
    return 100 * top10, gini


def heat_overlay(m, tm, t, boxes):
    base = (np.clip(m['a'], 0, 1) * 255).astype(np.uint8)
    grey = cv2.cvtColor(cv2.cvtColor(base, cv2.COLOR_RGB2GRAY), cv2.COLOR_GRAY2RGB)
    img = (grey * 0.55 + 255 * 0.45).astype(np.uint8)
    hm = np.nan_to_num(tm, nan=0)
    vmax = 10.0
    norm = np.clip(hm / vmax, 0, 1)
    cm = cv2.applyColorMap((norm * 255).astype(np.uint8), cv2.COLORMAP_INFERNO)[..., ::-1]
    big = cv2.resize(cm, (tm.shape[1] * t, tm.shape[0] * t), interpolation=cv2.INTER_NEAREST)
    alpha = cv2.resize(norm, (tm.shape[1] * t, tm.shape[0] * t), interpolation=cv2.INTER_NEAREST)[..., None] * 0.75
    h = min(big.shape[0], img.shape[0])
    img[:h] = (img[:h] * (1 - alpha[:h]) + big[:h] * alpha[:h]).astype(np.uint8)
    pil = Image.fromarray(img)
    d = ImageDraw.Draw(pil)
    col = {'A': (0, 160, 80), 'B': (40, 90, 220), 'C': (120, 120, 120)}
    for lab, tier, b in boxes:
        bb = [int(round(v * m['s'])) for v in b]
        d.rectangle(bb, outline=col[tier], width=4)
        d.text((bb[0] + 6, bb[1] + 4), f'{tier} {lab}', fill=col[tier], font=FONT)
    return pil


try:
    FONT = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 26)
    FONT_S = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 34)
except OSError:
    FONT = FONT_S = ImageFont.load_default()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--out', default='/tmp/posters-pro_2_hierarchy')
    ap.add_argument('--v2dir', default='/tmp/posters-pro_2_hierarchy/v2')
    ap.add_argument('--sheet', default=None)
    o = ap.parse_args()
    masks = json.load(open(os.path.join(REF, 'ui_mask.json')))['images']
    results, tiles = {}, []
    items = [(f, os.path.join(REF, f), masks[f], BOXES[f]) for f in sorted(BOXES)]
    items += [(f, os.path.join(o.v2dir, f), None, V2[f]) for f in V2 if os.path.exists(os.path.join(o.v2dir, f))]
    for name, path, mk, boxes in items:
        a, valid, r0, r1 = load(path, mk)
        m = analyse(a, valid)
        tm, t = tile_map(m)
        top10, gini = concentration(tm)
        bs = {f'{tier} {lab}': box_stats(m, b) for lab, tier, b in boxes}
        results[name] = dict(top10_share=top10, gini=gini, boxes=bs, mean_edge_pct=float(np.nanmean(tm)))
        ov = heat_overlay(m, tm, t, boxes)
        # crop to content rows for the posters
        if mk:
            ov = ov.crop((0, int(r0 * m['s']), ov.width, int(r1 * m['s'])))
        tiles.append((name, ov, top10, gini))
        print(f'{name}: top-10% tiles hold {top10:.0f}% of the fine detail, gini {gini:.2f}, mean fine {np.nanmean(tm):.2f}%')
        for k, v in bs.items():
            if v:
                print(f'   {k:22s} fine {v["fine_pct"]:5.1f}%  edge {v["edge_pct"]:5.1f}%  flat {v["flat_pct"]:5.1f}%  facets/10k {v["facets_per_10k"]:5.1f}'
                      f'  facet med {v["facet_med"]:6.0f}px  model {v["model"]:5.1f}  Lrange {v["L_range"]:5.1f}  grain {v["grain"]:4.2f}  C {v["C_med"]:4.1f}  area {v["area_pct"]:4.1f}%')
    json.dump(results, open(os.path.join(o.out, 'pro_2_hierarchy.json'), 'w'), indent=1)
    if o.sheet:
        th = 820
        cells = []
        for name, ov, top10, gini in tiles:
            sc = th / ov.height
            im = ov.resize((int(ov.width * sc), th), Image.LANCZOS)
            cap = Image.new('RGB', (im.width, 70), (250, 247, 240))
            d = ImageDraw.Draw(cap)
            d.text((8, 4), name.replace('.jpg', '').replace('.png', ''), fill=(30, 30, 30), font=FONT)
            d.text((8, 36), f'top 10% tiles: {top10:.0f}% of fine detail', fill=(30, 30, 30), font=FONT)
            cell = Image.new('RGB', (im.width, th + 70), (250, 247, 240))
            cell.paste(im, (0, 0))
            cell.paste(cap, (0, th))
            cells.append(cell)
        per_row = 5
        rows = [cells[i:i + per_row] for i in range(0, len(cells), per_row)]
        wmax = max(sum(c.width + 12 for c in r) for r in rows)
        sheet = Image.new('RGB', (wmax, len(rows) * (th + 82) + 60), (250, 247, 240))
        ImageDraw.Draw(sheet).text((10, 10), 'Where the FINE detail sits (thin features < 9 px at >= 10 L*, per tile; brighter = more). Boxes: A green, B blue, C grey',
                                   fill=(20, 20, 20), font=FONT_S)
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
