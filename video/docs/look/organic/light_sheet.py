#!/usr/bin/env python3
"""light_sheet.py: the PROPER LIGHT proof sheet (light.md §6): v6 against the relit frames at phone width, the doorway
at 2x, the light maps, and the references' light (measured for method, never copied).
    python3 light_sheet.py <renders_dir> <proof_out_dir> <sheet.jpg>"""
import sys

import cv2
import numpy as np

R, P, OUT = sys.argv[1], sys.argv[2], sys.argv[3]
REF = '/home/user/Test-/video/docs/look/'
BG = (246, 241, 236)


def label(img, text, scale=0.55):
    out = img.copy()
    cv2.rectangle(out, (0, 0), (out.shape[1], 26), (255, 255, 255), -1)
    cv2.putText(out, text, (8, 18), cv2.FONT_HERSHEY_SIMPLEX, scale, (40, 30, 30), 1, cv2.LINE_AA)
    return out


def fit(img, w):
    h = int(round(img.shape[0] * w / img.shape[1]))
    return cv2.resize(img, (w, h), interpolation=cv2.INTER_AREA)


def pad_row(row, width):
    h = max(r.shape[0] for r in row)
    cells = [np.vstack([r, np.full((h - r.shape[0], r.shape[1], 3), BG, np.uint8)]) if r.shape[0] < h else r for r in row]
    out = np.hstack([np.hstack([c, np.full((h, 8, 3), BG, np.uint8)]) for c in cells])
    if out.shape[1] < width:
        out = np.hstack([out, np.full((h, width - out.shape[1], 3), BG, np.uint8)])
    return out[:, :width]


W = 4 * 368
rows = []
# row 1: phone width (360 px), 1.0 s (the hook frame) and 1.6 s
cells = []
for f, tag in ((60, '1.0 s'), (96, '1.6 s')):
    cells.append(label(fit(cv2.imread(f'{R}/cap/f{f:05d}.png'), 360), f'v6 as is, {tag}'))
    cells.append(label(fit(cv2.imread(f'{P}/lit_f{f:05d}_d1.png'), 360), f'proper light, dose 1.0, {tag}'))
rows.append(pad_row(cells, W))
cells = []
for f, tag in ((60, '1.0 s'), (96, '1.6 s')):
    cells.append(label(fit(cv2.imread(f'{P}/lit_f{f:05d}_d1.6.png'), 360), f'proper light, dose 1.6, {tag}'))
cells.append(label(fit(cv2.imread(f'{P}/lit_f00144_d1.6.png'), 360), 'dose 1.6, 2.4 s (G1 beside her)'))
cells.append(label(fit(cv2.imread(f'{P}/lit_f00144_d1.png'), 360), 'dose 1.0, 2.4 s'))
rows.append(pad_row(cells, W))
# row 3: the doorway at 2x, 1.6 s
y0, y1, x0, x1 = 830, 1130, 520, 760
crop = lambda im: cv2.resize(im[y0:y1, x0:x1], None, fx=1.5, fy=1.5, interpolation=cv2.INTER_NEAREST)
cells = [label(crop(cv2.imread(f'{R}/cap/f00096.png')), 'v6, the doorway (1.5x)'),
         label(crop(cv2.imread(f'{P}/lit_f00096_d1.png')), 'dose 1.0'),
         label(crop(cv2.imread(f'{P}/lit_f00096_d1.6.png')), 'dose 1.6'),
         label(crop(cv2.imread(f'{P}/lit_f00060_d1.6.png')), 'dose 1.6, 1.0 s (doors open)')]
rows.append(pad_row(cells, W))
# row 4: the maps (multiply E / additive G / rims) at 1.6 s, dose 1.0
m = cv2.imread(f'{P}/maps_f00096_d1.jpg')
third = m.shape[1] // 3
cells = [label(m[:, 0:third], 'E: the multiply map (shade < 1, light > 1)'), label(m[:, third:2 * third], 'G: the additive glow (x6)'),
         label(m[:, 2 * third:], 'the rims and the wrap')]
rows.append(pad_row(cells, W))
# row 5: the references' light (method only)
refs = [('refs_human_scale/02_bus_stop_night.jpg', (300, 600, 380, 860), '02: one story light, its pool and rims'),
        ('refs_human_scale/03_beach_dusk_couple_zoom.jpg', None, '03: the phone as the story light'),
        ('refs_human_scale/01_city_hill_sunset.jpg', (60, 330, 560, 900), '01: sun-facing slivers, fronts in shade')]
cells = []
for path, box, text in refs:
    im = cv2.imread(REF + path)
    if box:
        a, b, c, d = box
        im = im[a:b, c:d]
    cells.append(label(fit(im, 480 if box else 300), text))
rows.append(pad_row(cells, W))
sheet = np.vstack([np.vstack([r, np.full((10, W, 3), BG, np.uint8)]) for r in rows])
cv2.imwrite(OUT, sheet, [cv2.IMWRITE_JPEG_QUALITY, 86])
print('sheet', sheet.shape)
