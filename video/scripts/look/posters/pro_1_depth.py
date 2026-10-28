#!/usr/bin/env python3
"""pro_1_depth.py: the numbers and sheets behind docs/studies/2026-10-28_city_posters/pro_1_depth.md (feeling 1, depth
and scale). Measures, in CIE L*a*b* (OpenCV float RGB, D65), on the seven city posters (Instagram UI masked with
ui_mask.json) and on v2's master frames:
  1. the value structure: the share of the picture in L* < 40 / 40-65 / 65-80 / >= 80 (the caption band y 290-600 left
     out of v2's frames), and the bottom quarter's L* (the near planes);
  2. plane boxes per poster (air = the sky right above the far anchor; anchor = the thing WAY further out; mid = the
     hero's plane; near = the foreground): mean L*, C*, hue, L* p5-p95 range, edge share, dE76 to the air and k_L, the
     share of the near-to-air value distance the plane has crossed (k_L = (L - L_near) / (L_air - L_near));
  3. vertical L* profiles down the far anchors (the pale foot);
  4. three sheets in docs/studies/2026-10-28_city_posters/img/: pro_1_depth_planes.jpg, pro_1_depth_value_groups.jpg,
     pro_1_depth_anchors.jpg (JPEG q85, <= 2400 px).
Boxes were placed by eye on the full-size posters (x0, y0, x1, y1 in poster pixels) and checked on the planes sheet.

  python3 -I video/scripts/look/posters/pro_1_depth.py            # numbers to stdout + /tmp/posters-pro_1_depth/*.json
  python3 -I video/scripts/look/posters/pro_1_depth.py --sheets   # also the three sheets
"""
from __future__ import annotations

import json
import os
import subprocess
import sys

import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..', '..'))
REFS = os.path.join(ROOT, 'video/docs/look/poster_refs')
STUDY = os.path.join(ROOT, 'video/docs/studies/2026-10-28_city_posters')
MASTER = os.path.join(ROOT, 'video/deliverables/v2/v2r_G7_master_v1.mp4')
TMP = '/tmp/posters-pro_1_depth'
V2_TIMES = ['3.00', '9.00', '17.50', '21.00', '22.00']  # S1, S2, S4, S5 start, S5 vista
BAND = (290, 600)  # the caption band (screen y), left out of v2's value structure

BOXES = {
    '01_singapore.jpg': {'air': (380, 330, 620, 420), 'anchor_ghost_towers': (10, 300, 110, 600),
                         'mid_MBS_tower': (360, 760, 440, 1000), 'near_shophouses': (520, 1400, 1000, 1600)},
    '02_reykjavik.jpg': {'air': (420, 845, 600, 885), 'anchor_mountains': (450, 905, 1206, 980),
                         'anchor_foot_haze': (420, 987, 1206, 997), 'sea': (400, 1010, 630, 1080),
                         'mid_Harpa': (700, 1060, 1100, 1200), 'near_houses': (0, 1350, 900, 1600)},
    '03_hanoi.jpg': {'air': (450, 450, 900, 540), 'anchor_far_city': (400, 640, 640, 760),
                     'mid_lake_tower': (450, 880, 900, 1000), 'near_pagoda': (700, 900, 1150, 1200),
                     'near_fg': (0, 1300, 1000, 1600)},
    '04_buenos_aires.jpg': {'air': (700, 650, 1100, 780), 'anchor_far_shore': (650, 822, 1100, 836),
                            'anchor_river': (650, 845, 940, 890), 'mid_obelisk': (580, 600, 640, 1000),
                            'near_LaBoca': (0, 1100, 400, 1500), 'near_CasaRosada': (700, 1050, 1150, 1350)},
    '05_cape_town.jpg': {'air': (60, 620, 220, 700), 'anchor_table_mtn': (380, 680, 980, 860),
                         'anchor_foot_haze': (60, 880, 700, 920), 'sea': (0, 960, 600, 1050),
                         'near_BoKaap': (800, 1100, 1206, 1400), 'near_proteas': (0, 1300, 450, 1600)},
    '06_copenhagen.jpg': {'air': (500, 500, 900, 700), 'far_dome': (860, 900, 1000, 1010),
                          'far_facet': (1010, 980, 1206, 1080), 'mid_Nyhavn': (0, 850, 600, 1100),
                          'near_mermaid_rock': (850, 1300, 1150, 1450)},
    '07_kyoto.jpg': {'air': (420, 560, 1000, 620), 'anchor_far_range': (780, 660, 1000, 700),
                     'anchor_near_range': (480, 735, 640, 775), 'mid_Kinkakuji': (700, 880, 1100, 1000),
                     'near_torii': (100, 1050, 400, 1250)},
}
# The far anchor's extent (hand-measured on the full-size posters, by eye from the grid crops): x0, x1, top, base,
# whether it leaves the frame at a side, and what it is.
ANCHORS = {
    '01_singapore.jpg': (0, 130, 280, 1000, 'left + right', 'ghost towers at both edges (pale slabs)'),
    '02_reykjavik.jpg': (400, 1206, 890, 985, 'right', 'the Esja range, snow tops, a pale foot strip'),
    '03_hanoi.jpg': (400, 1206, 570, 800, 'right', 'the far city: pale towers'),
    '04_buenos_aires.jpg': (300, 1206, 818, 836, 'right', 'the river horizon and its far shore'),
    '05_cape_town.jpg': (0, 1206, 615, 930, 'left + right', 'Table Mountain (Lion\'s Head nearer)'),
    '06_copenhagen.jpg': (850, 1206, 870, 1130, 'right', 'the far domes and pale facets (weakest)'),
    '07_kyoto.jpg': (400, 1206, 640, 800, 'right', 'two flat mountain ranges'),
}
PROFILES = {'05_cape_town.jpg': ((420, 700), (620, 960), 20), '02_reykjavik.jpg': ((700, 1000), (890, 1010), 8),
            '07_kyoto.jpg': ((520, 640), (700, 800), 10)}


def labimg(path: str) -> np.ndarray:
    bgr = cv2.imread(path)
    if bgr is None:
        raise SystemExit(f'cannot read {path}')
    return cv2.cvtColor(bgr.astype(np.float32) / 255.0, cv2.COLOR_BGR2LAB)


def poster_mask(name: str, shape) -> np.ndarray:
    m = json.load(open(os.path.join(REFS, 'ui_mask.json')))['images'][name]
    mask = np.zeros(shape[:2], bool)
    r0, r1 = m['content_rows']
    mask[r0:r1] = True
    for k in ('counter_pill_box', 'mute_button_box'):
        x0, y0, x1, y1 = m[k]
        mask[y0:y1, x0:x1] = False
    return mask


def value_structure(L: np.ndarray, mask: np.ndarray) -> dict:
    l = L[..., 0][mask]
    share = lambda lo, hi: float(((l >= lo) & (l < hi)).mean() * 100)
    rows = np.where(mask.any(1))[0]
    r0, r1 = rows.min(), rows.max() + 1
    bm = mask.copy()
    bm[: r0 + int((r1 - r0) * 0.75)] = False
    lb = L[..., 0][bm]
    return {'lt40': share(0, 40), '40_65': share(40, 65), '65_80': share(65, 80), 'ge80': share(80, 101),
            'p5': float(np.percentile(l, 5)), 'p50': float(np.percentile(l, 50)),
            'bottom_p5': float(np.percentile(lb, 5)), 'bottom_p50': float(np.percentile(lb, 50))}


def box_stats(L: np.ndarray, b) -> dict:
    x0, y0, x1, y1 = b
    r = L[y0:y1, x0:x1].reshape(-1, 3)
    m = r.mean(0)
    sub = L[y0:y1, x0:x1, 0]
    g = np.hypot(cv2.Sobel(sub, cv2.CV_32F, 1, 0, ksize=3), cv2.Sobel(sub, cv2.CV_32F, 0, 1, ksize=3)) / 8.0
    p5, p95 = np.percentile(r[:, 0], [5, 95])
    return {'L': float(m[0]), 'C': float(np.hypot(m[1], m[2])), 'h': float((np.degrees(np.arctan2(m[2], m[1])) + 360) % 360),
            'p5': float(p5), 'p95': float(p95), 'range': float(p95 - p5), 'edge': float((g > 3).mean()), 'lab': m.tolist()}


def v2_frame(t: str) -> str:
    os.makedirs(TMP, exist_ok=True)
    out = os.path.join(TMP, f'v2_t{t}.png')
    if not os.path.exists(out):
        subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-ss', t, '-i', MASTER, '-frames:v', '1', out], check=True)
    return out


def measure() -> dict:
    res = {'posters': {}, 'v2': {}}
    for name, boxes in BOXES.items():
        L = labimg(os.path.join(REFS, name))
        vs = value_structure(L, poster_mask(name, L.shape))
        stats = {k: box_stats(L, b) for k, b in boxes.items()}
        air = np.array(stats['air']['lab'])
        for k, s in stats.items():
            s['dEair'] = float(np.linalg.norm(np.array(s['lab']) - air))
            s['kL'] = float((s['L'] - vs['bottom_p50']) / max(1e-6, stats['air']['L'] - vs['bottom_p50']))
        H, W = L.shape[:2]
        x0, x1, top, base, off, what = ANCHORS[name]
        geo = {'width_share': (x1 - x0) / W, 'height_share': (base - top) / H, 'top_share': top / H, 'base_share': base / H,
               'off_edge': off, 'what': what}
        prof = None
        if name in PROFILES:
            (px0, px1), (py0, py1), st = PROFILES[name]
            prof = [(y, float(np.percentile(L[y:y + st, px0:px1, 0], 50))) for y in range(py0, py1, st)]
        res['posters'][name] = {'value_structure': vs, 'planes': stats, 'anchor': geo, 'profile': prof}
    for t in V2_TIMES:
        L = labimg(v2_frame(t))
        mask = np.ones(L.shape[:2], bool)
        mask[BAND[0]:BAND[1]] = False
        res['v2'][t] = {'value_structure': value_structure(L, mask)}
    return res


def report(res: dict) -> None:
    print('VALUE STRUCTURE (share of the picture by L*; bottom quarter = the near planes)')
    for k, v in list(res['posters'].items()) + [(f'v2 t{t}', d) for t, d in res['v2'].items()]:
        s = v['value_structure']
        print(f"  {k:22s} <40 {s['lt40']:5.1f}%  40-65 {s['40_65']:5.1f}%  65-80 {s['65_80']:5.1f}%  >=80 {s['ge80']:5.1f}%"
              f"   bottom quarter L* p5 {s['bottom_p5']:5.1f} p50 {s['bottom_p50']:5.1f}")
    print('PLANES (dE76 to the air box; k_L = share of the near-median-to-air value distance crossed)')
    for k, v in res['posters'].items():
        print(f'  {k}')
        for n, s in v['planes'].items():
            print(f"    {n:22s} L* {s['L']:5.1f} C* {s['C']:5.1f} h {s['h']:4.0f}  range {s['range']:5.1f}  edges {s['edge'] * 100:4.1f}%"
                  f"  dEair {s['dEair']:5.1f}  kL {s['kL']:5.2f}")
        a = v['anchor']
        print(f"    anchor: {a['what']}; width {a['width_share'] * 100:.0f} % of W, height {a['height_share'] * 100:.0f} % of H,"
              f" at {a['top_share'] * 100:.0f}-{a['base_share'] * 100:.0f} % of H, leaves the frame: {a['off_edge']}")
        if v['profile']:
            print('    profile (y, L* p50): ' + ', '.join(f'{y}:{l:.0f}' for y, l in v['profile']))


# ---------------------------------------------------------------- sheets

def font(size: int, bold: bool = False):
    p = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf' if bold else '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
    try:
        return ImageFont.truetype(p, size)
    except Exception:
        return ImageFont.load_default()


def sheet_planes(res: dict, out: str) -> None:
    col = {'air': (0, 140, 255), 'anchor': (230, 0, 190), 'far': (230, 0, 190), 'sea': (0, 170, 170), 'mid': (240, 140, 0),
           'near': (235, 30, 30)}
    f = font(26, True)
    tiles = []
    for name, boxes in BOXES.items():
        im = Image.open(os.path.join(REFS, name)).convert('RGB')
        d = ImageDraw.Draw(im)
        st = res['posters'][name]['planes']
        for n, (x0, y0, x1, y1) in boxes.items():
            c = col[n.split('_')[0]]
            d.rectangle([x0, y0, x1, y1], outline=c, width=5)
            s = st[n]
            lab = f"air L{s['L']:.0f} C{s['C']:.0f}" if n == 'air' else f"{n.split('_')[0]} L{s['L']:.0f} C{s['C']:.0f} dE{s['dEair']:.0f} k{s['kL']:.2f}"
            tw = d.textlength(lab, font=f)
            ty = y0 - 31 if y0 > 40 else y1 + 4
            d.rectangle([x0, ty, x0 + tw + 8, ty + 30], fill=(255, 255, 255))
            d.text((x0 + 4, ty + 1), lab, fill=c, font=f)
        tiles.append(im.resize((600, int(im.height * 600 / im.width))))
    H = max(t.height for t in tiles)
    sheet = Image.new('RGB', (2400, H * 2), (255, 255, 255))
    for i, t in enumerate(tiles):
        sheet.paste(t, ((i % 4) * 600, (i // 4) * H))
    d = ImageDraw.Draw(sheet)
    x, y = 1820, H + 30
    lines = [('pro_1_depth: the planes, measured', True),
             ('CIE L*, C*, dE76 to the box marked air', False), ('(the sky right above the far anchor);', False),
             ('k = share of the way from the near', False), ('planes\' median L* to the air\'s.', False), ('', False),
             ('anchor (magenta): the thing WAY out', False), ('mid (orange): the hero\'s plane', False),
             ('near (red): the foreground', False), ('', False),
             ('Read: the anchor sits within dE 4-16', False), ('of its air at the air\'s chroma (C* 2-13)', False),
             ('and k 0.69-0.93; Cape Town\'s mountain', False), ('keeps its value (k 0.09) and recedes', False),
             ('by chroma, hue and a third of the near', False), ('contrast instead. Near and mid planes', False),
             ('sit at k <= 0.3: a jump of 19-36 L*', False), ('(water, a hidden valley) between', False),
             ('the hero\'s group and the far one.', False)]
    for t, b in lines:
        d.text((x, y), t, fill=(20, 20, 20), font=font(22, b))
        y += 30
    sheet.save(out, quality=85)


NOTAN = [(0, 40, (43, 43, 43)), (40, 65, (122, 122, 122)), (65, 80, (242, 184, 128)), (80, 101, (244, 244, 244))]


def notan(L: np.ndarray) -> Image.Image:
    l = L[..., 0]
    out = np.zeros(L.shape[:2] + (3,), np.uint8)
    for lo, hi, c in NOTAN:
        out[(l >= lo) & (l < hi)] = c
    return Image.fromarray(out)


def sheet_value_groups(res: dict, out: str) -> None:
    pairs = [('02_reykjavik.jpg', 'Reykjavik', os.path.join(REFS, '02_reykjavik.jpg'), res['posters']['02_reykjavik.jpg']),
             ('05_cape_town.jpg', 'Cape Town', os.path.join(REFS, '05_cape_town.jpg'), res['posters']['05_cape_town.jpg']),
             ('07_kyoto.jpg', 'Kyoto', os.path.join(REFS, '07_kyoto.jpg'), res['posters']['07_kyoto.jpg']),
             ('v2 3.00', 'v2 S1 @3.0', v2_frame('3.00'), res['v2']['3.00']),
             ('v2 22.00', 'v2 S5 @22.0', v2_frame('22.00'), res['v2']['22.00'])]
    tw = 240
    cols = []
    for key, title, path, r in pairs:
        im = Image.open(path).convert('RGB')
        L = labimg(path)
        nt = notan(L)
        h = int(im.height * tw / im.width)
        cols.append((title, im.resize((tw, h)), nt.resize((tw, h), Image.NEAREST), r['value_structure']))
    Hmax = max(c[1].height for c in cols)
    W = tw * 2 * len(cols)
    sheet = Image.new('RGB', (W, 70 + Hmax + 260), (255, 255, 255))
    d = ImageDraw.Draw(sheet)
    d.text((10, 8), 'pro_1_depth: the value structure (each pair: the picture, then its L* in four bands)', fill=(20, 20, 20), font=font(26, True))
    d.text((10, 40), 'bands: L* < 40 dark grey | 40-65 mid grey | 65-80 AMBER (the in-between) | >= 80 white.  v2: caption band left out of the bars.',
           fill=(60, 60, 60), font=font(20))
    for i, (title, a, b, vs) in enumerate(cols):
        x = i * tw * 2
        sheet.paste(a, (x, 70))
        sheet.paste(b, (x + tw, 70))
        y = 70 + Hmax + 10
        d.text((x + 8, y), title, fill=(20, 20, 20), font=font(22, True))
        y += 34
        bars = [('< 40', vs['lt40'], NOTAN[0][2]), ('40-65', vs['40_65'], NOTAN[1][2]), ('65-80', vs['65_80'], NOTAN[2][2]), ('>= 80', vs['ge80'], NOTAN[3][2])]
        for lab, v, c in bars:
            d.text((x + 8, y), f'{lab:>6s}', fill=(20, 20, 20), font=font(18))
            d.rectangle([x + 80, y + 2, x + 80 + int(v * 3.6), y + 20], fill=c, outline=(80, 80, 80))
            d.text((x + 86 + int(v * 3.6), y), f'{v:.0f} %', fill=(20, 20, 20), font=font(18))
            y += 28
        d.text((x + 8, y + 4), f"near quarter L* p50 {vs['bottom_p50']:.0f}", fill=(20, 20, 20), font=font(18))
    sheet.save(out, quality=85)


def sheet_anchors(res: dict, out: str) -> None:
    rows_spec = [[('02_reykjavik.jpg', (380, 820, 1206, 1100)), ('05_cape_town.jpg', (0, 560, 1206, 1000))],
                 [('07_kyoto.jpg', (380, 600, 1206, 900)), ('04_buenos_aires.jpg', (560, 770, 1206, 930)),
                  ('01_singapore.jpg', (0, 250, 600, 1050))],
                 [('v2 22.00', (0, 600, 1080, 1000)), ('v2 3.00', (0, 560, 600, 1000))]]
    W, GAP = 2400, 10
    rows = []
    for spec in rows_spec:
        tiles = []
        for name, (x0, y0, x1, y1) in spec:
            path = v2_frame(name.split()[1]) if name.startswith('v2') else os.path.join(REFS, name)
            im = Image.open(path).convert('RGB').crop((x0, y0, x1, y1))
            if name.startswith('v2'):
                cap = {'v2 22.00': 'v2 S5 @22.0: the far city a 55 px strip (3 % of H), dE 14 from its air; nothing rises over it; the sun disc dE 80 from its sky: the far plane\'s strongest contrast',
                       'v2 3.00': 'v2 S1 @3.0: the far city fills the left quarter only; nothing WAY out'}[name]
            else:
                pr = res['posters'][name]
                a = pr['anchor']
                an = [v for k, v in pr['planes'].items() if k.startswith('anchor')]
                de = '/'.join(f"{v['dEair']:.0f}" for v in an) if an else '-'
                cap = (f"{name[3:-4].replace('_', ' ').title()}: {a['what']}; {a['width_share'] * 100:.0f} % of W x {a['height_share'] * 100:.0f} % of H "
                       f"at {a['top_share'] * 100:.0f}-{a['base_share'] * 100:.0f} % of H; dE to its air {de}")
            tiles.append((im, cap))
        # one height per row, the row scaled to fill the width (at most 1.6x the crop's own size)
        h = min((W - GAP * (len(tiles) - 1)) / sum(t.width / t.height for t, _ in tiles), 1.6 * min(t.height for t, _ in tiles))
        rows.append([(t.resize((int(t.width * h / t.height), int(h))), c) for t, c in tiles])
    probe = ImageDraw.Draw(Image.new('RGB', (10, 10)))

    def wrap(cap: str, width: int) -> list[str]:
        lines, line = [], ''
        for w_ in cap.split(' '):
            if line and probe.textlength(line + ' ' + w_, font=font(17)) > width - 6:
                lines.append(line)
                line = w_
            else:
                line = (line + ' ' + w_).strip()
        return lines + [line]

    caph = [max(len(wrap(c, t.width)) for t, c in r) * 21 + 14 for r in rows]
    H = 60 + sum(r[0][0].height + ch for r, ch in zip(rows, caph))
    sheet = Image.new('RGB', (W, H), (255, 255, 255))
    d = ImageDraw.Draw(sheet)
    d.text((10, 10), 'pro_1_depth: the far scale anchor in five posters, and v2\'s far planes', fill=(20, 20, 20), font=font(28, True))
    y = 60
    for row, ch in zip(rows, caph):
        x = 0
        for im2, cap in row:
            sheet.paste(im2, (x, y))
            for i, line in enumerate(wrap(cap, im2.width)):
                d.text((x + 4, y + im2.height + 4 + 21 * i), line, fill=(20, 20, 20), font=font(17))
            x += im2.width + GAP
        y += row[0][0].height + ch
    sheet.save(out, quality=85)


def main() -> int:
    res = measure()
    os.makedirs(TMP, exist_ok=True)
    json.dump(res, open(os.path.join(TMP, 'pro_1_depth.json'), 'w'), indent=1)
    report(res)
    if '--sheets' in sys.argv:
        img = os.path.join(STUDY, 'img')
        os.makedirs(img, exist_ok=True)
        sheet_planes(res, os.path.join(img, 'pro_1_depth_planes.jpg'))
        sheet_value_groups(res, os.path.join(img, 'pro_1_depth_value_groups.jpg'))
        sheet_anchors(res, os.path.join(img, 'pro_1_depth_anchors.jpg'))
        print('sheets written to', img)
    return 0


if __name__ == '__main__':
    sys.exit(main())
