#!/usr/bin/env python3
"""details.py: the DETAIL lens of the city-poster study (2026-10-28): where detail lives, how much, how it stays calm.

Report: video/docs/studies/2026-10-28_city_posters/details.md. Sheets: .../img/details_*.jpg. Scratch: /tmp/posters-details/.
Reusable on any still (a G4 look-clip frame, a G5 key still): `python3 -I details.py measure <img.png> [--json out.json]`.

    python3 -I video/scripts/look/posters/details.py frames            # extract full-size film frames to scratch (ffmpeg)
    python3 -I video/scripts/look/posters/details.py regions           # the region overlay sheet (check the polygons)
    python3 -I video/scripts/look/posters/details.py maps              # tile metrics, heat-map sheets, region table
    python3 -I video/scripts/look/posters/details.py calm              # calm-detail metrics (contrast, repetition, ticks)
    python3 -I video/scripts/look/posters/details.py motion            # shimmer / encode test (synthetic grids, v2 floats)
    python3 -I video/scripts/look/posters/details.py measure <img> ... # the per-still numbers for any frame

METHOD (every image on a 1080-px-wide CANVAS: posters 1206 -> 1080 with INTER_AREA, our masters as they are):
  edges     Canny on L* x 2.55 after a Gaussian blur of sigma 0.7 px, thresholds 20 / 40 (L2 gradient): a sharp step is
            seeded at >= ~5.3 L* and traced down to ~2.6 L*; a 1-px line is seeded at >= ~7.8 L* of contrast. The
            posters' paper grain (0.2-0.9 L*) and mottle (0.4-0.7 L*) stay under it (style.md 1.4).
  step      at each edge pixel the local contrast: max - min of the blurred L* in a 5 x 5 window. QUIET detail = an edge
            with step < 15 L* (CRAFT §c: C's flat shapes stay within dL* 15 inside one plane); LOUD = step >= 15.
  tile      24 x 24 canvas px (45 across). ed = edge pixels / tile pixels. CALM ed < 0.02 (less than half of one
            straight edge across the tile), STRUCTURE 0.02-0.08 (a few big edges), BUSY >= 0.08 (several small things).
            A tile counts when >= 50 % of it is measured.
  regions   hand polygons per image (REGIONS below, in the image's own pixels): sky, far (horizon planes: mountains, far
            sea, far city), hero (the README's one landmark; for our films the beat's tier-A subject), L2 (the other
            named landmarks), near ground (everything else: mid and fore ground, fabric, props, people, near water).
            Excluded: the Instagram UI (ui_mask.json), the posters' title, our caption band (y 290-600) and 1820-1920.
  density.py-equivalent  scripts/qa/density.py's fullness numbers recomputed on the same still (540 px wide, 24-px tiles
            = 48 canvas px, Canny 40 / 110 on luma; flat, detail, obj/Mpx) so the posters sit in LIFE_AND_DENSITY §1's
            table beside reference 1 and v1.
"""
from __future__ import annotations

import argparse
import json
import math
import os
import subprocess
import sys

import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..', '..'))
REF = os.path.join(ROOT, 'video/docs/look/poster_refs')
STUDY = os.path.join(ROOT, 'video/docs/studies/2026-10-28_city_posters')
IMG = os.path.join(STUDY, 'img')
DELIV = os.path.join(ROOT, 'video/deliverables')
REF1 = os.path.join(ROOT, 'video/assets/ref')
SCRATCH = '/tmp/posters-details'
FRAMES = os.path.join(SCRATCH, 'frames')

CANVAS_W = 1080
TILE = 24
CALM, BUSY = 0.02, 0.08
QUIET_STEP = 15.0
CAPTION_BAND = (290, 600)
BOTTOM_IGNORE = (1820, 1920)
POSTERS = ['01_singapore.jpg', '02_reykjavik.jpg', '03_hanoi.jpg', '04_buenos_aires.jpg', '05_cape_town.jpg',
           '06_copenhagen.jpg', '07_kyoto.jpg']
CITY = {p: p[3:-4].replace('_', ' ').title() for p in POSTERS}

# Film frames (the study's baseline times; v2's shots in brackets).
V2_TIMES = ['01.00', '03.00', '05.20', '09.00', '14.00', '17.50', '22.00', '26.00', '30.50', '36.00']
V2_SHOT = dict(zip(V2_TIMES, ['S1', 'S1', 'S1 cover', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8']))
V1_TIMES = ['01.00', '05.00', '10.00', '15.00', '20.00', '25.00', '30.00', '35.00', '40.00', '45.00', '50.00', '54.00']
V3_TIMES = ['01.00', '05.00', '09.00', '13.00', '17.00', '21.00', '25.00', '29.00', '33.00', '37.00', '40.00']
REF1_FRAMES = ['f_0.5.png', 'f_3.0.png', 'f_5.5.png', 'f_9.0.png', 'f_12.0.png', 'f_15.4.png', 'f_16.0.png', 'f_16.3.png']
REF1_CROP = (156, 156, 924, 924)  # density.py preset 'ref1' fcrop: the art panel inside the 4:5 card
MASTERS = {'v1': 'v1/php2shell_final.mp4', 'v2': 'v2/v2r_G7_master_v1.mp4', 'v3': 'v3/v3_final.mp4'}

# ------------------------------------------------------------------ regions (each image's own pixels)
# Boxes [x0, y0, x1, y1] or polygons [(x, y), ...]. Painted in order: near (default) -> far -> sky -> L2 -> hero.
REGIONS = {
    '01_singapore.jpg': {
        'title': [[400, 170, 810, 235]],
        'sky': [[(0, 19), (1206, 19), (1206, 371), (1158, 371), (1158, 720), (1000, 720), (900, 760), (840, 760),
                 (840, 900), (725, 900), (725, 745), (665, 745), (665, 900), (540, 900), (540, 735), (480, 735),
                 (480, 840), (350, 840), (340, 860), (300, 850), (200, 850), (150, 830), (100, 790), (60, 760),
                 (0, 760)]],
        'far': [[(0, 760), (60, 760), (100, 790), (150, 830), (200, 850), (300, 850), (340, 860), (350, 1005),
                 (0, 1005)], [(480, 840), (540, 840), (540, 1010), (480, 1010)],
                [(665, 900), (725, 900), (725, 1010), (665, 1010)], [(1158, 371), (1206, 371), (1206, 1000), (1158, 1000)]],
        'L2': [[153, 887, 444, 1129], [839, 718, 1158, 1048], [795, 1001, 960, 1219]],
        'hero': [[(232, 668), (860, 700), (872, 738), (850, 752), (300, 705), (232, 690)],
                 [(352, 705), (478, 705), (480, 1052), (342, 1052)], [(540, 735), (665, 735), (667, 1052), (535, 1052)],
                 [(725, 745), (848, 745), (850, 1052), (720, 1052)]],
    },
    '02_reykjavik.jpg': {
        'title': [[420, 135, 790, 200]],
        'sky': [[(0, 0), (1206, 0), (1206, 895), (395, 895), (395, 1000), (0, 1000)]],
        'far': [[(395, 895), (1206, 895), (1206, 1113), (395, 1113)],
                [(0, 370), (60, 400), (160, 560), (230, 700), (300, 880), (300, 1000), (0, 1000)]],
        'L2': [[589, 1000, 1145, 1234], [710, 1242, 968, 1403], [1003, 1137, 1206, 1298]],
        'hero': [[(267, 400), (285, 470), (300, 560), (335, 600), (345, 700), (370, 800), (400, 900), (440, 1000),
                  (470, 1045), (540, 1060), (556, 1112), (30, 1112), (40, 980), (45, 935), (100, 910), (170, 880),
                  (190, 780), (210, 640), (235, 520), (255, 440)]],
    },
    '03_hanoi.jpg': {
        'title': [[480, 205, 730, 275]],
        'sky': [[(0, 19), (1206, 19), (1206, 600), (1100, 590), (1050, 560), (960, 565), (900, 640), (800, 660),
                 (700, 680), (560, 690), (500, 600), (400, 610), (380, 700), (300, 690), (200, 560), (100, 420),
                 (0, 440)]],
        'far': [[(380, 700), (400, 610), (500, 600), (560, 690), (700, 680), (800, 660), (900, 640), (960, 565),
                 (1050, 560), (1100, 590), (1206, 600), (1206, 900), (380, 900)]],
        'L2': [[513, 815, 600, 920], [277, 887, 395, 1073], [225, 1054, 630, 1204]],
        'hero': [[(673, 935), (760, 905), (860, 870), (962, 838), (1060, 875), (1150, 915), (1186, 935), (1150, 1000),
                  (1105, 1030), (1105, 1160), (1100, 1240), (1000, 1260), (996, 1378), (873, 1378), (873, 1260),
                  (790, 1240), (760, 1160), (762, 1030), (700, 1000)]],
    },
    '04_buenos_aires.jpg': {
        'title': [[365, 120, 860, 180]],
        'sky': [[(0, 0), (1206, 0), (1206, 830), (435, 830), (435, 750), (258, 750), (258, 520), (0, 520)]],
        'far': [[(435, 830), (1206, 830), (1206, 984), (903, 984), (903, 935), (435, 935)],
                [(258, 750), (565, 750), (565, 903), (258, 903)], [(0, 520), (65, 520), (65, 760), (0, 760)]],
        'L2': [[660, 960, 1206, 1395], [65, 484, 258, 1000], [950, 810, 1035, 890]],
        'hero': [[(612, 393), (625, 420), (668, 1050), (558, 1050), (600, 420)]],
    },
    '05_cape_town.jpg': {
        'title': [[415, 195, 790, 260]],
        'sky': [[(0, 5), (1206, 5), (1206, 774), (1129, 726), (1065, 677), (1032, 686), (984, 694), (879, 610),
                 (726, 613), (500, 645), (371, 637), (290, 694), (210, 726), (161, 726), (97, 750), (65, 758),
                 (0, 806)]],
        'far': [[(0, 900), (725, 925), (725, 1000), (0, 1000)]],
        'L2': [[750, 827, 1206, 1440], [222, 968, 258, 1097], [432, 1008, 480, 1065]],
        'hero': [[(0, 806), (65, 758), (97, 750), (161, 726), (210, 726), (290, 694), (371, 637), (500, 645),
                  (726, 613), (879, 610), (984, 694), (1032, 686), (1065, 677), (1129, 726), (1206, 774), (1206, 830),
                  (1080, 850), (1000, 840), (900, 880), (830, 905), (700, 925), (400, 925), (0, 935)]],
    },
    '06_copenhagen.jpg': {
        'title': [[280, 190, 940, 260]],
        'sky': [[(0, 19), (1206, 19), (1206, 968), (1008, 968), (1008, 871), (855, 871), (760, 1100), (700, 1050),
                 (640, 1000), (560, 980), (500, 960), (400, 910), (320, 900), (260, 880), (200, 860), (100, 790),
                 (0, 740)]],
        'far': [[(1008, 968), (1206, 968), (1206, 1226), (1008, 1226)]],
        'L2': [[183, 364, 300, 882], [600, 836, 738, 1069], [855, 871, 1008, 1113], [840, 1114, 1185, 1490]],
        'hero': [[(0, 740), (100, 790), (200, 860), (260, 880), (320, 900), (400, 910), (500, 960), (560, 980),
                  (640, 1000), (700, 1050), (760, 1100), (760, 1215), (0, 1215)]],
    },
    '07_kyoto.jpg': {
        'title': [[475, 190, 735, 250]],
        'sky': [[(0, 19), (1206, 19), (1206, 650), (960, 640), (700, 645), (540, 700), (400, 720), (100, 645),
                 (0, 645)]],
        'far': [[(0, 645), (100, 645), (400, 720), (540, 700), (700, 645), (960, 640), (1206, 650), (1206, 800),
                 (1100, 820), (700, 790), (420, 800), (0, 780)]],
        'L2': [[165, 461, 413, 859], [416, 782, 697, 887], [90, 1054, 435, 1294], [968, 1258, 1206, 1613]],
        'hero': [[(914, 735), (1000, 770), (1090, 800), (1060, 845), (1056, 900), (1175, 935), (1160, 960),
                  (1156, 1020), (1122, 1030), (1125, 1105), (700, 1105), (683, 1020), (680, 960), (630, 940),
                  (772, 900), (772, 845), (735, 805), (820, 770)]],
    },
    # v2 master frames (1080 x 1920): hero = the beat's tier-A subject (docs/v2/STYLE.md; pro_2_hierarchy's boxes).
    'v2_t01.00.png': {'sky': [[0, 0, 1080, 620]], 'far': [[0, 620, 280, 1000]], 'hero': [[470, 780, 740, 1090]]},
    'v2_t03.00.png': {'sky': [[0, 0, 1080, 620]], 'far': [[0, 620, 280, 1000]], 'hero': [[470, 780, 740, 1090]]},
    'v2_t05.20.png': {'sky': [[0, 0, 1080, 620]], 'far': [[0, 620, 280, 1000]], 'hero': [[470, 780, 740, 1090]]},
    'v2_t09.00.png': {'sky': [[0, 0, 1080, 620]], 'far': [[560, 620, 1080, 760]], 'hero': [[167, 640, 556, 890]]},
    'v2_t14.00.png': {'sky': [[0, 0, 1080, 610]], 'far': [[0, 610, 1080, 650]], 'hero': [[264, 680, 417, 875]]},
    'v2_t17.50.png': {'sky': [[0, 0, 1080, 610]], 'far': [[0, 610, 1080, 800]],
                      'hero': [[597, 597, 889, 792], [680, 880, 760, 1075]]},
    'v2_t22.00.png': {'sky': [[0, 0, 1080, 640]], 'far': [[0, 640, 1080, 1000]]},
    'v2_t26.00.png': {'sky': [[0, 0, 1080, 600]], 'far': [[0, 600, 1080, 800]], 'hero': [[111, 778, 639, 1236]]},
    'v2_t30.50.png': {'sky': [[0, 0, 1080, 600]], 'far': [[0, 600, 1080, 700]], 'hero': [[111, 778, 625, 1236]]},
    'v2_t36.00.png': {'sky': [[0, 0, 1080, 600]], 'far': [[0, 600, 1080, 760]], 'hero': [[111, 778, 625, 1236]]},
}
CLASSES = ['near', 'far', 'sky', 'L2', 'hero']          # label ids 0..4; 255 = not measured
CLS_ID = {c: i for i, c in enumerate(CLASSES)}
# region outline colours: the dataviz skill's validated categorical slots in a passing order (orange, aqua, violet,
# yellow); near ground has no outline. Labels are always written, so identity is never colour alone.
CLS_COL = {'hero': (0xeb, 0x68, 0x34), 'L2': (0x1b, 0xaf, 0x7a), 'far': (0x62, 0x50, 0xd6), 'sky': (0xed, 0xa1, 0x00)}
# sequential ramp (one hue, light -> dark): the dataviz skill's blue 100..700 with a near-white zero.
RAMP = ['#f7f9fc', '#cde2fb', '#9ec5f4', '#6da7ec', '#3987e5', '#256abf', '#184f95', '#0d366b']
INK = (11, 11, 11)
INK2 = (82, 81, 78)


def font(size: int, bold: bool = False):
    p = '/usr/share/fonts/truetype/dejavu/DejaVuSans%s.ttf' % ('-Bold' if bold else '')
    try:
        return ImageFont.truetype(p, size)
    except OSError:
        return ImageFont.load_default()


def hex2rgb(h: str) -> tuple:
    h = h.lstrip('#')
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))


def ramp_colour(v: np.ndarray, vmax: float) -> np.ndarray:
    """Map values 0..vmax onto the sequential ramp (piecewise linear between its steps)."""
    stops = np.array([hex2rgb(c) for c in RAMP], np.float32)
    t = np.clip(v / vmax, 0, 1) * (len(stops) - 1)
    i0 = np.floor(t).astype(int).clip(0, len(stops) - 2)
    f = (t - i0)[..., None]
    return (stops[i0] * (1 - f) + stops[i0 + 1] * f).astype(np.uint8)


# ------------------------------------------------------------------ loading

def ui_mask_info() -> dict:
    with open(os.path.join(REF, 'ui_mask.json')) as f:
        return json.load(f)['images']


def paint(draw: ImageDraw.ImageDraw, shapes, value: int) -> None:
    for s in shapes:
        if len(s) == 4 and not isinstance(s[0], (list, tuple)):
            draw.rectangle([s[0], s[1], s[2] - 1, s[3] - 1], fill=value)
        else:
            draw.polygon([tuple(p) for p in s], fill=value)


def label_map(name: str, w: int, h: int, valid: np.ndarray | None = None) -> np.ndarray:
    """Region labels in the image's own pixels (uint8; 255 = excluded)."""
    reg = REGIONS.get(name, {})
    lab = Image.new('L', (w, h), CLS_ID['near'])
    d = ImageDraw.Draw(lab)
    for c in ('far', 'sky', 'L2', 'hero'):
        paint(d, reg.get(c, []), CLS_ID[c])
    paint(d, reg.get('title', []), 255)
    out = np.asarray(lab).copy()
    if valid is not None:
        out[~valid] = 255
    return out


def load_image(path: str, kind: str | None = None) -> dict:
    """Return {'rgb': float32 HxWx3 at canvas scale, 'valid': bool, 'lab': uint8 labels or None, 'name', 'kind'}."""
    name = os.path.basename(path)
    im = np.asarray(Image.open(path).convert('RGB'))
    h, w = im.shape[:2]
    valid = np.ones((h, w), bool)
    kind = kind or ('poster' if name in POSTERS else 'ref1' if name.startswith('f_') else 'film')
    if kind == 'poster':
        info = ui_mask_info()[name]
        r0, r1 = info['content_rows']
        valid[:r0] = False
        valid[r1:] = False
        for k in ('counter_pill_box', 'mute_button_box'):
            x0, y0, x1, y1 = info[k]
            valid[y0:y1, x0:x1] = False
    lab = label_map(name, w, h, valid) if (kind == 'poster' or name in REGIONS) else None
    if kind == 'poster':
        for s in REGIONS.get(name, {}).get('title', []):
            valid[s[1]:s[3], s[0]:s[2]] = False
    if kind == 'ref1':
        x0, y0, x1, y1 = REF1_CROP
        im, valid = im[y0:y1, x0:x1], valid[y0:y1, x0:x1]
        h, w = im.shape[:2]
    elif kind == 'film':
        valid[CAPTION_BAND[0]:CAPTION_BAND[1]] = False
        valid[BOTTOM_IGNORE[0]:BOTTOM_IGNORE[1]] = False
        if lab is not None:
            lab[~valid] = 255
    scale = 1.0 if kind in ('film', 'ref1') else CANVAS_W / w
    if abs(scale - 1) > 1e-6:
        nw, nh = CANVAS_W, int(round(h * scale))
        im = cv2.resize(im, (nw, nh), interpolation=cv2.INTER_AREA)
        valid = cv2.resize(valid.astype(np.uint8), (nw, nh), interpolation=cv2.INTER_NEAREST) > 0
        if lab is not None:
            lab = cv2.resize(lab, (nw, nh), interpolation=cv2.INTER_NEAREST)
    return {'rgb': im.astype(np.float32) / 255.0, 'valid': valid, 'lab': lab, 'name': name, 'kind': kind,
            'scale': scale}


def lstar(rgb: np.ndarray) -> np.ndarray:
    return cv2.cvtColor(rgb.astype(np.float32), cv2.COLOR_RGB2Lab)[..., 0]


# ------------------------------------------------------------------ the core measurement

def edge_maps(rgb: np.ndarray) -> dict:
    L = lstar(rgb)
    g = cv2.GaussianBlur(L * 2.55, (0, 0), 0.7)
    g8 = np.clip(g + 0.5, 0, 255).astype(np.uint8)
    E = cv2.Canny(g8, 20, 40, L2gradient=True) > 0
    k = np.ones((5, 5), np.uint8)
    step = (cv2.dilate(g, k) - cv2.erode(g, k)) / 2.55
    hf = np.abs(L - cv2.GaussianBlur(L, (0, 0), 2.0))
    return {'L': L, 'E': E, 'step': step, 'hf': hf}


def tiles(m: dict, valid: np.ndarray, tile: int = TILE) -> dict:
    E, step, L, hf = m['E'], m['step'], m['L'], m['hf']
    h, w = E.shape
    ty, tx = h // tile, w // tile
    sl = (slice(0, ty * tile), slice(0, tx * tile))

    def blk(a):
        return a[sl].reshape(ty, tile, tx, tile).swapaxes(1, 2).reshape(ty, tx, tile * tile)

    V = blk(valid.astype(np.float32))
    vfrac = V.mean(-1)
    ok = vfrac >= 0.5
    Eb = blk(E.astype(np.float32)) * V
    nv = np.maximum(V.sum(-1), 1)
    ed = Eb.sum(-1) / nv
    quiet = (blk((E & (step < QUIET_STEP)).astype(np.float32)) * V).sum(-1) / nv
    loud = (blk((E & (step >= QUIET_STEP)).astype(np.float32)) * V).sum(-1) / nv
    Lb = blk(L)
    lstd = np.sqrt(np.maximum((Lb ** 2 * V).sum(-1) / nv - ((Lb * V).sum(-1) / nv) ** 2, 0))
    hfm = (blk(hf) * V).sum(-1) / nv
    S = np.where(blk(E), blk(step), np.nan)
    with np.errstate(all='ignore'):
        import warnings
        with warnings.catch_warnings():
            warnings.simplefilter('ignore')
            medstep = np.nanmedian(S, axis=-1)
    return {'ed': np.where(ok, ed, np.nan), 'quiet': np.where(ok, quiet, np.nan), 'loud': np.where(ok, loud, np.nan),
            'lstd': np.where(ok, lstd, np.nan), 'hf': np.where(ok, hfm, np.nan), 'medstep': np.where(ok, medstep, np.nan),
            'ok': ok, 'shape': (ty, tx)}


def density_equiv(rgb: np.ndarray, valid: np.ndarray) -> dict:
    """scripts/qa/density.py fullness_frame on the same still: 540 px wide, 24-px tiles, Canny 40/110 on luma."""
    h, w = rgb.shape[:2]
    nw, nh = 540, int(round(h * 540 / w))
    im = cv2.resize((rgb * 255).astype(np.uint8), (nw, nh), interpolation=cv2.INTER_AREA)
    mask = cv2.resize(valid.astype(np.uint8), (nw, nh), interpolation=cv2.INTER_NEAREST) > 0
    grey = cv2.cvtColor(im, cv2.COLOR_RGB2GRAY)
    e = cv2.Canny(grey, 40, 110) > 0
    tile = 24
    ty, tx = nh // tile, nw // tile
    E = e[:ty * tile, :tx * tile].reshape(ty, tile, tx, tile).mean(axis=(1, 3))
    imf = im[:ty * tile, :tx * tile].astype(np.float32).reshape(ty, tile, tx, tile, 3)
    S = imf.std(axis=(1, 3)).max(axis=2)
    M = mask[:ty * tile, :tx * tile].reshape(ty, tile, tx, tile).all(axis=(1, 3))
    nt = max(1, int(M.sum()))
    flat = ((E < 0.005) & (S < 6.0) & M).sum() / nt
    detail = ((E >= 0.10) & M).sum() / nt
    em = (e & mask).astype(np.uint8)
    n, _, st, _ = cv2.connectedComponentsWithStats(em, connectivity=8)
    objs = int((st[1:, cv2.CC_STAT_AREA] >= 16).sum())
    area_mpx = mask.sum() * (CANVAS_W / nw) ** 2 / 1e6
    return {'flat': float(flat), 'detail': float(detail), 'obj': objs / max(1e-6, area_mpx)}


def region_stats(m: dict, lab: np.ndarray, valid: np.ndarray) -> dict:
    E, step = m['E'], m['step']
    tot_e = max(1, int((E & valid).sum()))
    tot_a = max(1, int(valid.sum()))
    out = {}
    for c in CLASSES:
        sel = (lab == CLS_ID[c]) & valid
        a = int(sel.sum())
        if a == 0:
            continue
        e = E & sel
        ne = int(e.sum())
        st = step[e]
        out[c] = {'area': a / tot_a, 'ed': ne / a, 'edge_share': ne / tot_e,
                  'quiet_ed': float((st < QUIET_STEP).sum()) / a, 'loud_ed': float((st >= QUIET_STEP).sum()) / a,
                  'medstep': float(np.median(st)) if ne else float('nan')}
    return out


def measure(path: str, kind: str | None = None) -> dict:
    d = load_image(path, kind)
    m = edge_maps(d['rgb'])
    t = tiles(m, d['valid'])
    ed = t['ed'][t['ok']]
    calm = float((ed < CALM).mean())
    busy = float((ed >= BUSY).mean())
    flat_ed = np.sort(ed)[::-1]
    top10 = float(flat_ed[:max(1, len(flat_ed) // 10)].sum() / max(1e-9, flat_ed.sum()))
    # Gini of tile edge density: 0 = detail spread evenly, 1 = all in one tile
    s = np.sort(ed)
    n = len(s)
    gini = float((2 * np.arange(1, n + 1) - n - 1).dot(s) / (n * s.sum())) if s.sum() > 0 else float('nan')
    q = t['quiet'][t['ok']]
    lo = t['loud'][t['ok']]
    res = {'name': d['name'], 'kind': d['kind'], 'ed': float(m['E'][d['valid']].mean()),
           'calm': calm, 'structure': 1 - calm - busy, 'busy': busy, 'top10': top10, 'gini': gini,
           'quiet_share': float(q.sum() / max(1e-9, q.sum() + lo.sum())),
           'medstep': float(np.median(m['step'][m['E'] & d['valid']])),
           'hf': float(m['hf'][d['valid']].mean()),
           'density': density_equiv(d['rgb'], d['valid'])}
    if d['lab'] is not None:
        res['regions'] = region_stats(m, d['lab'], d['valid'])
    res['_tiles'] = t
    res['_img'] = d
    return res


# ------------------------------------------------------------------ inputs

def poster_paths() -> list[str]:
    return [os.path.join(REF, p) for p in POSTERS]


def film_paths(film: str) -> list[str]:
    times = {'v1': V1_TIMES, 'v2': V2_TIMES, 'v3': V3_TIMES}[film]
    return [os.path.join(FRAMES, f'{film}_t{t}.png') for t in times]


def ref1_paths() -> list[str]:
    return [os.path.join(REF1, f) for f in REF1_FRAMES]


def cmd_frames(a) -> None:
    os.makedirs(FRAMES, exist_ok=True)
    for film, times in (('v1', V1_TIMES), ('v2', V2_TIMES), ('v3', V3_TIMES)):
        src = os.path.join(DELIV, MASTERS[film])
        for t in times:
            out = os.path.join(FRAMES, f'{film}_t{t}.png')
            if not os.path.exists(out):
                subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', t, '-i', src, '-frames:v', '1', out], check=True)
    print('frames in', FRAMES)


# ------------------------------------------------------------------ sheets

def save_jpg(im: Image.Image, path: str, maxside: int = 2400) -> None:
    if max(im.size) > maxside:
        s = maxside / max(im.size)
        im = im.resize((int(im.width * s), int(im.height * s)), Image.LANCZOS)
    im.save(path, quality=85)
    print('wrote', path, im.size)


def outline_regions(img: Image.Image, lab: np.ndarray, width: int = 3) -> Image.Image:
    """Draw each region's boundary in its colour (lab at img's size)."""
    a = np.asarray(img).copy()
    for c, col in CLS_COL.items():
        m = (lab == CLS_ID[c]).astype(np.uint8)
        if not m.any():
            continue
        k = np.ones((width, width), np.uint8)
        edge = (cv2.dilate(m, k) - cv2.erode(m, k)) > 0
        a[edge] = col
    return Image.fromarray(a)


def heat_image(t: dict, size: tuple, vmax: float = 0.25) -> Image.Image:
    ed = np.nan_to_num(t['ed'], nan=-1)
    col = ramp_colour(np.clip(ed, 0, None), vmax)
    col[ed < 0] = (200, 200, 200)  # not measured: neutral grey
    im = Image.fromarray(col).resize(size, Image.NEAREST)
    return im


def legend_bar(w: int, vmax: float, label: str) -> Image.Image:
    h = 54
    im = Image.new('RGB', (w, h), (252, 252, 251))
    d = ImageDraw.Draw(im)
    bw = w - 40
    vals = np.linspace(0, vmax, bw)
    col = ramp_colour(vals[None, :], vmax)
    bar = Image.fromarray(np.repeat(col, 14, axis=0))
    im.paste(bar, (20, 6))
    f = font(13)
    for v in np.linspace(0, vmax, 6):
        x = 20 + int(v / vmax * (bw - 1))
        d.line([(x, 20), (x, 25)], fill=INK2)
        d.text((x - 12, 27), f'{v:.0%}' if v < vmax else f'>={v:.0%}', fill=INK2, font=f)
    d.text((20, 40), label, fill=INK, font=f) if False else None
    return im


def cmd_regions(a) -> None:
    """Overlay of the region polygons on every poster and the v2 frames (to check them)."""
    tiles_ = []
    for p in poster_paths() + film_paths('v2'):
        d = load_image(p)
        rgb = (d['rgb'] * 255).astype(np.uint8)
        lab = d['lab']
        over = rgb.astype(np.float32)
        for c, col in CLS_COL.items():
            m = lab == CLS_ID[c]
            over[m] = over[m] * 0.65 + np.array(col, np.float32) * 0.35
        over[lab == 255] = over[lab == 255] * 0.35
        im = outline_regions(Image.fromarray(over.astype(np.uint8)), lab)
        W = 300
        im = im.resize((W, int(im.height * W / im.width)), Image.LANCZOS)
        dr = ImageDraw.Draw(im)
        dr.rectangle([0, 0, W, 18], fill=(252, 252, 251))
        dr.text((4, 2), d['name'].replace('.jpg', '').replace('.png', ''), fill=INK, font=font(12))
        tiles_.append(im)
    H = max(t.height for t in tiles_)
    cols = 9
    rows = (len(tiles_) + cols - 1) // cols
    sheet = Image.new('RGB', (cols * 306, rows * (H + 6) + 40), (252, 252, 251))
    for i, t in enumerate(tiles_):
        sheet.paste(t, ((i % cols) * 306, 40 + (i // cols) * (H + 6)))
    d = ImageDraw.Draw(sheet)
    x = 8
    d.text((x, 10), 'Regions:', fill=INK, font=font(16, True))
    x += 90
    for c in ('hero', 'L2', 'far', 'sky'):
        d.rectangle([x, 12, x + 18, 28], fill=CLS_COL[c])
        d.text((x + 24, 10), {'hero': 'hero (the one landmark / tier-A subject)', 'L2': 'other landmarks',
                              'far': 'far planes', 'sky': 'sky'}[c], fill=INK, font=font(15))
        x += 24 + int(d.textlength({'hero': 'hero (the one landmark / tier-A subject)', 'L2': 'other landmarks',
                                     'far': 'far planes', 'sky': 'sky'}[c], font=font(15))) + 24
    d.text((x, 10), 'no tint = near ground; dark = not measured (UI, title, caption band)', fill=INK2, font=font(15))
    os.makedirs(SCRATCH, exist_ok=True)
    save_jpg(sheet, os.path.join(a.out or SCRATCH, 'details_regions.jpg'))


def fmt_pct(v: float) -> str:
    return '-' if v is None or (isinstance(v, float) and math.isnan(v)) else f'{100 * v:.1f}'


def strip(r: dict) -> dict:
    return {k: v for k, v in r.items() if not k.startswith('_')}


def map_panel(r: dict, W: int, vmax: float = 0.25, regions: bool = True) -> tuple[Image.Image, Image.Image]:
    """(the image, its edge-density heat map) at width W; region outlines on the heat map."""
    d = r['_img']
    rgb = Image.fromarray((d['rgb'] * 255).astype(np.uint8))
    H = int(round(rgb.height * W / rgb.width))
    pic = rgb.resize((W, H), Image.LANCZOS)
    heat = heat_image(r['_tiles'], (W, H), vmax)
    if regions and d['lab'] is not None:
        lab = cv2.resize(d['lab'], (W, H), interpolation=cv2.INTER_NEAREST)
        heat = outline_regions(heat, lab, width=3)
    # grey out what is not measured on the picture too
    v = cv2.resize(d['valid'].astype(np.uint8), (W, H), interpolation=cv2.INTER_NEAREST) > 0
    a = np.asarray(pic).copy()
    a[~v] = (a[~v] * 0.35).astype(np.uint8)
    return Image.fromarray(a), heat


def caption_lines(r: dict) -> list[str]:
    reg = r.get('regions', {})
    l1 = f"busy {100 * r['busy']:.0f}%  calm {100 * r['calm']:.0f}%  quiet {100 * r['quiet_share']:.0f}%"
    l2 = f"density.py: flat {100 * r['density']['flat']:.0f}% detail {100 * r['density']['detail']:.0f}% obj {r['density']['obj']:.0f}"
    out = [l1, l2]
    if reg:
        parts = []
        for c in ('hero', 'L2', 'near', 'far', 'sky'):
            if c in reg:
                parts.append(f"{ {'hero': 'H', 'L2': 'L2', 'near': 'N', 'far': 'F', 'sky': 'S'}[c]} {100 * reg[c]['ed']:.1f}")
        out.append('edge %: ' + ' '.join(parts))
    return out


def sheet_maps(rows: list[tuple[str, list[dict]]], path: str, W: int, title: str, vmax: float = 0.25) -> None:
    """rows: (row label, results). Each result gives a column pair: picture over heat map, with a 3-line caption."""
    f, fb = font(13), font(15, True)
    blocks = []
    for label, rs in rows:
        cols = []
        for r in rs:
            pic, heat = map_panel(r, W, vmax)
            cap = caption_lines(r)
            nm = r['name'].replace('.jpg', '').replace('.png', '')
            ch = 18 + 16 * len(cap)
            col = Image.new('RGB', (W, pic.height + heat.height + ch + 6), (252, 252, 251))
            col.paste(pic, (0, 0))
            col.paste(heat, (0, pic.height + 4))
            dr = ImageDraw.Draw(col)
            y = pic.height + heat.height + 8
            dr.text((2, y), nm, fill=INK, font=fb)
            for i, c in enumerate(cap):
                dr.text((2, y + 18 + 16 * i), c, fill=INK2, font=f)
            cols.append(col)
        H = max(c.height for c in cols)
        blk = Image.new('RGB', (len(cols) * (W + 8), H + 26), (252, 252, 251))
        ImageDraw.Draw(blk).text((4, 4), label, fill=INK, font=fb)
        for i, c in enumerate(cols):
            blk.paste(c, (i * (W + 8), 26))
        blocks.append(blk)
    leg = legend_bar(min(900, max(b.width for b in blocks)), vmax, '')
    head = Image.new('RGB', (max(b.width for b in blocks), 96), (252, 252, 251))
    dh = ImageDraw.Draw(head)
    dh.text((6, 4), title, fill=INK, font=font(18, True))
    dh.text((6, 28), 'Heat map: edge pixels per 24-px tile at 1080 wide (Canny on L*, steps >= ~5 L*); grey = not measured. '
                     'Outlines: hero orange, other landmarks aqua, far violet, sky yellow.', fill=INK2, font=font(14))
    head.paste(leg, (6, 46))
    Wt = max(b.width for b in blocks)
    sheet = Image.new('RGB', (Wt, head.height + sum(b.height + 6 for b in blocks)), (252, 252, 251))
    sheet.paste(head, (0, 0))
    y = head.height
    for b in blocks:
        sheet.paste(b, (0, y))
        y += b.height + 6
    save_jpg(sheet, path)


def region_table(rs: list[dict]) -> str:
    lines = ['| image | hero | L2 | near | far | sky | hero : near : far : sky (edge density) | detail share: hero / L2 / near / far / sky |',
             '|---|---|---|---|---|---|---|---|']
    for r in rs:
        reg = r.get('regions', {})
        def cell(c):
            if c not in reg:
                return '-'
            x = reg[c]
            return f"{100 * x['area']:.0f} % area, ed {100 * x['ed']:.1f} %, step {x['medstep']:.0f}"
        near = reg.get('near', {}).get('ed', float('nan'))
        ratio = ' : '.join(f"{reg[c]['ed'] / near:.2f}" if c in reg and near > 0 else '-' for c in ('hero', 'near', 'far', 'sky'))
        share = ' / '.join(f"{100 * reg[c]['edge_share']:.0f}" if c in reg else '-' for c in ('hero', 'L2', 'near', 'far', 'sky'))
        lines.append(f"| {r['name']} | {cell('hero')} | {cell('L2')} | {cell('near')} | {cell('far')} | {cell('sky')} | {ratio} | {share} |")
    return '\n'.join(lines)


def summary_table(rs: list[dict]) -> str:
    lines = ['| image | edge px % | busy % | structure % | calm % | quiet share of edges % | median step L* | top-10 % tiles hold % | gini | density.py flat / detail / obj |',
             '|---|---|---|---|---|---|---|---|---|---|']
    for r in rs:
        de = r['density']
        lines.append(f"| {r['name']} | {100 * r['ed']:.1f} | {100 * r['busy']:.0f} | {100 * r['structure']:.0f} | {100 * r['calm']:.0f} | "
                     f"{100 * r['quiet_share']:.0f} | {r['medstep']:.1f} | {100 * r['top10']:.0f} | {r['gini']:.2f} | "
                     f"{100 * de['flat']:.0f} / {100 * de['detail']:.0f} / {de['obj']:.0f} |")
    return '\n'.join(lines)


def group_stats(rs: list[dict]) -> dict:
    keys = ['ed', 'busy', 'structure', 'calm', 'quiet_share', 'medstep', 'top10', 'gini']
    out = {k: [float(np.median([r[k] for r in rs])), float(min(r[k] for r in rs)), float(max(r[k] for r in rs))] for k in keys}
    for k in ('flat', 'detail', 'obj'):
        v = [r['density'][k] for r in rs]
        out['density_' + k] = [float(np.median(v)), float(min(v)), float(max(v))]
    regs = [r['regions'] for r in rs if 'regions' in r]
    for c in CLASSES:
        for k in ('area', 'ed', 'edge_share', 'quiet_ed', 'loud_ed', 'medstep'):
            v = [g[c][k] for g in regs if c in g and not math.isnan(g[c][k])]
            if v:
                out[f'{c}_{k}'] = [float(np.median(v)), float(min(v)), float(max(v))]
    return out


def cmd_maps(a) -> None:
    os.makedirs(SCRATCH, exist_ok=True)
    groups = {'posters': [measure(p) for p in poster_paths()],
              'v2': [measure(p) for p in film_paths('v2')],
              'v1': [measure(p) for p in film_paths('v1')],
              'v3': [measure(p) for p in film_paths('v3')],
              'ref1': [measure(p, 'ref1') for p in ref1_paths()]}
    js = {g: {'frames': [strip(r) for r in rs], 'summary': group_stats(rs)} for g, rs in groups.items()}
    with open(os.path.join(SCRATCH, 'maps.json'), 'w') as f:
        json.dump(js, f, indent=1, default=float)
    md = []
    for g, rs in groups.items():
        md.append(f'### {g}\n' + summary_table(rs))
        if any('regions' in r for r in rs):
            md.append(region_table([r for r in rs if 'regions' in r]))
        s = js[g]['summary']
        md.append('summary (median [min-max]): ' + '; '.join(f"{k} {v[0]:.3g} [{v[1]:.3g}-{v[2]:.3g}]" for k, v in s.items()))
    with open(os.path.join(SCRATCH, 'maps.md'), 'w') as f:
        f.write('\n\n'.join(md))
    print('\n\n'.join(md))
    out = a.out or IMG
    sheet_maps([('The seven posters (UI and title masked)', groups['posters'])], os.path.join(out, 'details_maps_posters.jpg'),
               330, 'Detail maps: the seven city posters')
    sheet_maps([('v2 One Small Window (G7 master; caption band masked)', groups['v2'])],
               os.path.join(out, 'details_maps_v2.jpg'), 236, 'Detail maps: v2, the baseline (10 frames, shots S1-S8)')
    sheet_maps([('v1 php2shell (the best performer; the bar with reference 1)', groups['v1'][::2]),
                ('reference 1 (France; art panel) and v3 (laptop prices)', groups['ref1'][:3] + groups['v3'][::4])],
               os.path.join(out, 'details_maps_v1_ref1_v3.jpg'), 236, 'Detail maps: the benchmarks (v1, reference 1) and v3')


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest='cmd', required=True)
    sub.add_parser('frames')
    for c in ('regions', 'maps'):
        r = sub.add_parser(c)
        r.add_argument('--out', default=None)
    a = ap.parse_args()
    {'frames': cmd_frames, 'regions': cmd_regions, 'maps': cmd_maps}[a.cmd](a)
    return 0


if __name__ == '__main__':
    sys.exit(main())
