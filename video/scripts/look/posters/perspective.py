#!/usr/bin/env python3
"""perspective.py: perspective and depth, measured on a picture (the city-poster study, 2026-10-28, look lens 1;
the report: docs/studies/2026-10-28_city_posters/perspective.md).

Work in progress: this header is rewritten when the script is complete.
"""
from __future__ import annotations

import argparse
import json
import math
import os
import sys

import cv2
import numpy as np

sys.dont_write_bytecode = True
cv2.setNumThreads(2)

HERE = os.path.dirname(os.path.abspath(__file__))
VIDEO = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
REFS = os.path.join(VIDEO, 'docs', 'look', 'poster_refs')
STUDY = os.path.join(VIDEO, 'docs', 'studies', '2026-10-28_city_posters')
W540 = 540  # the house depth check's working width (scripts/qa/check_depth.py)

# ================================================================= the posters, annotated by eye (original px)
# Each poster: its sky and air boxes (the air = the sky's lowest open patch right above the farthest plane: CRAFT §f.1),
# its planes from the nearest (the foreground frame) to the farthest (order = depth rank, 1 = nearest; the sky is last),
# `structures` (boxes where straight lines show the camera: a street, a quay, a facade row, a box in two-point),
# `horizon` cues (y of a visible eye-level line: a sea or lake's far edge), `things` of roughly known height for the
# camera height (base y, top y, metres; est. = a guessed real size), `units` (a repeated unit's height in px per plane,
# measured by eye on 1:1 crops with a 50 px grid: windows, storeys, gables). All coordinates are the screenshot's px.
POSTERS = {
    '01_singapore.jpg': dict(
        city='Singapore', hero='Marina Bay Sands',
        sky=[[150, 260, 1000, 560]], air=[[420, 580, 820, 650]], title=[400, 175, 800, 230],
        planes=[
            dict(name='frame: leaves', rank=1, poly=[[0, 1290], [90, 1290], [180, 1330], [260, 1420], [300, 1625], [0, 1625]]),
            dict(name='near: shophouses, stairs', rank=2, poly=[[300, 1625], [280, 1420], [330, 1385], [480, 1375], [560, 1335], [700, 1305], [960, 1250], [1000, 1165], [1206, 1165], [1206, 1625]]),
            dict(name='water: the bay', rank=3, role='ground', poly=[[0, 1150], [600, 1150], [600, 1300], [480, 1370], [330, 1380], [130, 1330], [0, 1300]], exclude=[[265, 1230, 475, 1295]]),
            dict(name='mid: Merlion, Supertrees', rank=3, poly=[[830, 780], [1206, 780], [1206, 1160], [1000, 1160], [960, 1245], [840, 1245], [830, 1000]]),
            dict(name='far: the far shore, museum', rank=4, poly=[[0, 1030], [160, 1030], [160, 905], [440, 905], [440, 1030], [830, 1030], [830, 1150], [0, 1150]]),
            dict(name='HERO: Marina Bay Sands', rank=4, hero=True, boxes=[[245, 674, 858, 733], [347, 748, 476, 1032], [550, 752, 660, 1038], [730, 752, 840, 1002]]),
            dict(name='background: far towers, ghost blocks', rank=5, boxes=[[0, 300, 118, 630], [1162, 380, 1206, 890], [252, 885, 298, 995], [0, 790, 88, 995]]),
        ],
        structures=[
            dict(name='shophouses (roofs, fronts)', box=[480, 1160, 1206, 1625]),
            dict(name='stairs and arch', box=[120, 1380, 600, 1625]),
            dict(name='Marina Bay Sands', box=[230, 660, 870, 1045]),
            dict(name='far shore', box=[0, 1080, 850, 1160]),
        ],
        horizon=[dict(y=1140, how='the bay\'s far edge under the museum (x 0-830)')],
        things=[
            dict(name='Marina Bay Sands (towers to the SkyPark top)', base=1100, top=665, m=200, hero=True, note='base hidden behind the trees: 1100 = the far shore (est.)'),
            dict(name='Merlion (statue)', base=1205, top=1000, m=8.6, note='on its wave plinth'),
            dict(name='shophouse door (arched, near)', base=1625, top=1530, m=2.6, note='cut by the bottom edge: base >= 1625 (est.)'),
        ],
        units=[
            dict(rank=2, what='near shophouse window (arched)', px=62, where='x 690-940, y 1450-1512'),
            dict(rank=3, what='bumboat cabin window row', px=14, where='x 290-450, y 1250-1265'),
            dict(rank=4, what='MBS floor band (12 per 100 px)', px=8, where='tower facades, x 350-850'),
            dict(rank=4, what='museum petal tip to tip (one unit)', px=60, where='x 160-440'),
        ],
    ),
    '02_reykjavik.jpg': dict(
        city='Reykjavik', hero='Hallgrimskirkja',
        sky=[[400, 200, 1000, 520]], air=[[400, 840, 560, 885]], title=[300, 145, 900, 195],
        planes=[
            dict(name='frame: the nearest houses', rank=1, poly=[[0, 1440], [560, 1430], [560, 1500], [900, 1500], [900, 1608], [0, 1608]]),
            dict(name='near: house rows 2-4', rank=2, poly=[[0, 1180], [300, 1150], [560, 1185], [640, 1260], [640, 1430], [0, 1440]]),
            dict(name='water: the harbour, Sun Voyager', rank=3, role='ground', poly=[[640, 1245], [1206, 1245], [1206, 1460], [900, 1460], [640, 1405]], exclude=[[1000, 1150, 1206, 1305]]),
            dict(name='mid: Harpa', rank=3, poly=[[592, 1100], [880, 1005], [1145, 1075], [1145, 1235], [592, 1235]]),
            dict(name='HERO: Hallgrimskirkja', rank=3, hero=True, poly=[[35, 1112], [35, 1000], [110, 905], [195, 885], [205, 640], [255, 400], [305, 640], [330, 885], [440, 965], [530, 1060], [530, 1112]]),
            dict(name='far: the sea', rank=4, role='ground', poly=[[465, 992], [588, 992], [588, 1098], [535, 1098], [530, 1062]]),
            dict(name='background: the mountains (Esja)', rank=5, poly=[[400, 985], [400, 975], [600, 930], [800, 892], [1000, 882], [1206, 900], [1206, 985]]),
        ],
        structures=[
            dict(name='Harpa', box=[585, 990, 1150, 1240]),
            dict(name='house rows', box=[0, 1100, 1000, 1608]),
            dict(name='Hallgrimskirkja', box=[30, 390, 540, 1120]),
        ],
        horizon=[dict(y=990, how='the sea\'s far edge under the mountains (x 330-1206)')],
        things=[
            dict(name='Hallgrimskirkja (spire top)', base=1112, top=395, m=74.5, hero=True),
            dict(name='Harpa (roof top, right corner)', base=1235, top=1005, m=43, note='real 43 m (est.)'),
            dict(name='near house (yellow, eaves to ground)', base=1608, top=1500, m=5.5, note='cut by the bottom edge (est.)'),
        ],
        units=[
            dict(rank=1, what='near house window', px=32, where='yellow house x 560-900, y 1520-1560'),
            dict(rank=2, what='row-2 house window', px=22, where='white house x 160-230, y 1360-1385'),
            dict(rank=2, what='row-3 house window', px=14, where='x 250-350, y 1250-1270'),
            dict(rank=3, what='Harpa glass panel row', px=18, where='x 600-1140'),
            dict(rank=3, what='Hallgrimskirkja belfry lancet', px=40, where='x 225-300, y 595-640'),
        ],
    ),
    '03_hanoi.jpg': dict(
        city='Hanoi', hero='One Pillar Pagoda',
        sky=[[500, 290, 1000, 520]], air=[[620, 560, 780, 600]], title=[480, 215, 740, 270],
        planes=[
            dict(name='frame: cyclo, woman, flowers', rank=1, boxes=[[60, 1295, 370, 1610], [990, 1350, 1206, 1610], [740, 1430, 990, 1610]]),
            dict(name='near: street, shophouses, lanterns', rank=2, poly=[[0, 780], [110, 820], [255, 1000], [260, 1290], [60, 1295], [60, 1610], [0, 1610]]),
            dict(name='near ground: patchwork blocks', rank=2, role='ground', boxes=[[400, 1290, 740, 1610]]),
            dict(name='HERO: One Pillar Pagoda', rank=3, hero=True, poly=[[690, 1000], [700, 880], [940, 850], [1180, 960], [1180, 1030], [1060, 1050], [1060, 1170], [960, 1240], [960, 1380], [870, 1380], [860, 1230], [760, 1170], [760, 1040]]),
            dict(name='water: the lake', rank=3, role='ground', boxes=[[560, 905, 800, 1055], [150, 1235, 650, 1290], [700, 1365, 990, 1440]]),
            dict(name='mid: bridge, Ngoc Son gate, trees', rank=3, poly=[[150, 890], [560, 890], [560, 1060], [650, 1060], [650, 1230], [150, 1230]]),
            dict(name='far: Turtle Tower, tree band', rank=4, boxes=[[470, 760, 870, 900]]),
            dict(name='far: the colonial row (right)', rank=4, boxes=[[880, 650, 1206, 850]]),
            dict(name='background: far towers, ghost blocks', rank=5, boxes=[[470, 590, 870, 760]]),
        ],
        structures=[
            dict(name='Huc bridge', box=[140, 1040, 650, 1250]),
            dict(name='One Pillar Pagoda', box=[680, 840, 1190, 1390]),
            dict(name='left street (shophouses, road)', box=[0, 760, 320, 1610]),
            dict(name='pagoda balustrade', box=[690, 1255, 1206, 1365]),
        ],
        horizon=[dict(y=925, how='the lake\'s far edge at the Turtle Tower (x 300-860)')],
        things=[
            dict(name='One Pillar Pagoda (roof ridge to the water)', base=1380, top=850, m=11, hero=True, note='real ~11 m with the pillar (est.)'),
            dict(name='people on the bridge', base=1100, top=1050, m=1.65, note='feet on the deck, ~3 m over the water (est.)'),
            dict(name='cyclo rider (hat top to the wheels)', base=1590, top=1308, m=1.75),
            dict(name='Turtle Tower', base=920, top=820, m=8, note='est.'),
        ],
        units=[
            dict(rank=1, what='cyclo wheel', px=150, where='x 70-230, y 1440-1590'),
            dict(rank=2, what='shophouse window / balcony bay', px=60, where='x 30-110, y 860-1000'),
            dict(rank=3, what='bridge railing bay', px=26, where='x 230-630, y 1070-1100'),
            dict(rank=3, what='pagoda balcony baluster bay', px=24, where='x 790-1060, y 1100-1130'),
            dict(rank=4, what='colonial facade window', px=30, where='x 1000-1180, y 740-790'),
            dict(rank=5, what='far tower window band', px=8, where='x 600-860, y 600-700'),
        ],
    ),
    '04_buenos_aires.jpg': dict(
        city='Buenos Aires', hero='the Obelisco',
        sky=[[100, 200, 540, 600], [700, 200, 1150, 600]], air=[[700, 770, 940, 830]], title=[350, 125, 870, 175],
        planes=[
            dict(name='frame: La Boca houses, cafe', rank=1, poly=[[0, 930], [180, 960], [420, 1120], [560, 1170], [560, 1579], [0, 1579]]),
            dict(name='frame: jacaranda (bottom right)', rank=1, boxes=[[1010, 1410, 1206, 1579]]),
            dict(name='near ground: the plaza patchwork', rank=2, role='ground', poly=[[560, 1170], [700, 1140], [1000, 1440], [1000, 1579], [560, 1579]]),
            dict(name='near: Casa Rosada', rank=2, boxes=[[700, 1000, 1206, 1415]]),
            dict(name='mid: the domed building (left)', rank=3, poly=[[0, 640], [60, 640], [100, 520], [180, 600], [255, 700], [255, 1000], [0, 1000]]),
            dict(name='mid: the avenue, trees, plinth', rank=3, boxes=[[260, 905, 560, 1150], [660, 905, 700, 1150]]),
            dict(name='HERO: the Obelisco', rank=4, hero=True, poly=[[568, 1075], [592, 420], [607, 400], [623, 420], [658, 1075]]),
            dict(name='far: far city blocks', rank=5, boxes=[[260, 760, 560, 900], [700, 900, 1206, 990]]),
            dict(name='background: the river, far shore', rank=6, role='ground', boxes=[[680, 845, 1206, 895]]),
        ],
        structures=[
            dict(name='avenue (9 de Julio)', box=[250, 930, 565, 1135]),
            dict(name='Casa Rosada', box=[660, 960, 1206, 1430]),
            dict(name='fence and plaza', box=[450, 1240, 1060, 1520]),
            dict(name='La Boca houses', box=[0, 920, 420, 1579]),
        ],
        horizon=[dict(y=842, how='the river\'s far shore (x 270-1206)')],
        things=[
            dict(name='the Obelisco', base=1085, top=400, m=67.5, hero=True),
            dict(name='Casa Rosada (cornice to the fence foot)', base=1410, top=1040, m=22, note='est.'),
            dict(name='street lamp (bottom left)', base=1579, top=1300, m=4.5, note='cut at the bottom: base >= 1579 (est.)'),
        ],
        units=[
            dict(rank=1, what='La Boca window', px=60, where='x 30-160, y 1180-1250'),
            dict(rank=2, what='Casa Rosada window', px=48, where='x 820-1100, y 1080-1130'),
            dict(rank=3, what='domed building window', px=28, where='x 100-200, y 760-800'),
            dict(rank=3, what='car on the avenue', px=12, where='x 400-480, y 980-1030'),
            dict(rank=5, what='far city window', px=0, where='none: blocks are window-less ghosts'),
        ],
    ),
    '05_cape_town.jpg': dict(
        city='Cape Town', hero='Table Mountain',
        sky=[[100, 260, 1000, 480]], air=[[0, 600, 80, 700]], title=[420, 200, 790, 250],
        planes=[
            dict(name='frame: proteas, stairs', rank=1, poly=[[0, 1260], [200, 1240], [420, 1300], [480, 1460], [480, 1605], [0, 1605]], extra_boxes=[[1100, 1385, 1206, 1605]]),
            dict(name='near: Bo-Kaap houses', rank=2, poly=[[640, 1590], [640, 1250], [700, 1150], [860, 1040], [1000, 850], [1206, 820], [1206, 1380], [1100, 1380], [1100, 1605], [640, 1605]]),
            dict(name='near ground: the street', rank=2, role='ground', poly=[[480, 1605], [480, 1462], [640, 1450], [1100, 1590], [1100, 1605]]),
            dict(name='mid: lower houses, palm, gardens', rank=3, poly=[[300, 1180], [700, 1110], [700, 1450], [480, 1460], [420, 1300], [300, 1250]]),
            dict(name='water: the sea', rank=4, role='ground', boxes=[[0, 955, 200, 1060], [0, 1110, 330, 1235]]),
            dict(name='mid-far: harbour, city towers', rank=4, boxes=[[80, 960, 470, 1105], [470, 870, 1000, 1110]]),
            dict(name='far: the far coast', rank=5, boxes=[[0, 885, 700, 945]]),
            dict(name='HERO: Table Mountain, Lion\'s Head', rank=6, hero=True, poly=[[0, 880], [0, 800], [100, 730], [180, 700], [260, 640], [450, 620], [700, 610], [820, 660], [900, 700], [1060, 670], [1206, 760], [1206, 820], [1000, 850], [880, 880]]),
        ],
        structures=[
            dict(name='Bo-Kaap street (houses, kerb)', box=[450, 820, 1206, 1605]),
            dict(name='harbour (V&A)', box=[80, 960, 700, 1110]),
        ],
        horizon=[dict(y=943, how='the sea\'s far edge at the coast (x 0-650)')],
        things=[
            dict(name='Bo-Kaap door (green house)', base=1460, top=1370, m=2.1),
            dict(name='Bo-Kaap door (pink house, right)', base=1590, top=1405, m=2.4, note='est.'),
            dict(name='Green Point lighthouse', base=1090, top=960, m=16, note='est.'),
            dict(name='Table Mountain (top over the far coast)', base=943, top=620, m=1085, hero=True, note='its foot is the coast'),
        ],
        units=[
            dict(rank=1, what='protea head', px=150, where='x 20-200, y 1280-1430'),
            dict(rank=2, what='Bo-Kaap window (pink, right)', px=95, where='x 1050-1110, y 900-990'),
            dict(rank=2, what='Bo-Kaap window (green house)', px=60, where='x 820-860, y 1150-1210'),
            dict(rank=3, what='lower house window', px=30, where='x 640-670, y 1320-1350'),
            dict(rank=4, what='harbour building window row', px=10, where='x 280-480, y 1050-1060'),
            dict(rank=5, what='far coast house', px=5, where='x 0-650, y 890-940'),
        ],
    ),
    '06_copenhagen.jpg': dict(
        city='Copenhagen', hero='Nyhavn',
        sky=[[350, 300, 1000, 650]], air=[[745, 960, 840, 1040]], title=[280, 190, 940, 245],
        planes=[
            dict(name='frame: the mermaid on her rock', rank=1, poly=[[840, 1625], [860, 1330], [900, 1120], [1000, 1100], [1100, 1300], [1170, 1340], [1206, 1450], [1206, 1625]]),
            dict(name='frame: the quay paving', rank=1, role='ground', boxes=[[0, 1555, 840, 1625]]),
            dict(name='near: the water (patchwork)', rank=2, role='ground', boxes=[[0, 1295, 840, 1330], [0, 1380, 120, 1520], [600, 1380, 840, 1520]]),
            dict(name='near-mid: boats, the quay', rank=3, boxes=[[0, 1160, 840, 1290]]),
            dict(name='HERO: Nyhavn facades', rank=3, hero=True, poly=[[0, 760], [60, 770], [150, 820], [300, 880], [450, 920], [600, 985], [780, 1040], [780, 1160], [0, 1160]]),
            dict(name='far: Round Tower, Marble Church, far row', rank=4, boxes=[[605, 825, 735, 1060], [855, 880, 1005, 1100], [740, 1060, 1206, 1160]]),
            dict(name='far: Our Saviour spire', rank=4, poly=[[195, 880], [200, 640], [225, 470], [240, 360], [255, 470], [280, 640], [290, 880]]),
            dict(name='background: ghost blocks', rank=5, boxes=[[505, 822, 598, 960], [1010, 965, 1206, 1060], [0, 690, 110, 770]]),
        ],
        structures=[
            dict(name='Nyhavn facade row', box=[0, 740, 800, 1240]),
            dict(name='railing and bicycle', box=[0, 1320, 860, 1580]),
            dict(name='quay paving', box=[0, 1500, 1206, 1625]),
        ],
        horizon=[],
        things=[
            dict(name='bicycle (handlebar top)', base=1570, top=1345, m=1.05),
            dict(name='railing post', base=1550, top=1338, m=1.05, note='est.'),
            dict(name='Church of Our Saviour', base=880, top=355, m=90, hero=True, note='base hidden behind the facades: 880 = its visible foot (est.)'),
        ],
        units=[
            dict(rank=1, what='bicycle wheel', px=215, where='x 165-380, y 1355-1570'),
            dict(rank=3, what='facade window, nearest house (yellow)', px=33, where='x 50-140, y 905-940'),
            dict(rank=3, what='facade window, mid row (red)', px=25, where='x 250-330, y 1030-1055'),
            dict(rank=3, what='facade window, far end of the row', px=13, where='x 690-760, y 1100-1115'),
            dict(rank=4, what='Round Tower window', px=12, where='x 610-730, y 880-1000'),
        ],
    ),
    '07_kyoto.jpg': dict(
        city='Kyoto', hero='Kinkaku-ji',
        sky=[[300, 250, 1000, 600]], air=[[380, 640, 560, 690]], title=[460, 190, 760, 240],
        planes=[
            dict(name='frame: maple, veranda, bamboo', rank=1, boxes=[[0, 880, 170, 1240], [0, 1215, 330, 1618], [965, 1275, 1206, 1618]]),
            dict(name='near: torii tunnel, its bank', rank=2, boxes=[[60, 1040, 440, 1330]]),
            dict(name='HERO: Kinkaku-ji', rank=3, hero=True, poly=[[650, 1135], [650, 960], [690, 930], [750, 905], [765, 835], [820, 795], [900, 765], [1000, 772], [1060, 830], [1100, 930], [1168, 960], [1168, 1135]]),
            dict(name='water: the pond', rank=3, role='ground', boxes=[[610, 1145, 1100, 1470]]),
            dict(name='mid: trees, roofs, the bridge', rank=3, boxes=[[330, 900, 640, 1500]]),
            dict(name='far: pagoda, the central hall', rank=4, boxes=[[205, 560, 360, 900], [410, 785, 700, 890]]),
            dict(name='background: mountains, ghost blocks', rank=5, poly=[[380, 700], [560, 690], [700, 650], [900, 640], [1100, 660], [1206, 640], [1206, 760], [1100, 770], [740, 800], [700, 790], [380, 790]], extra_boxes=[[0, 645, 200, 760]]),
        ],
        structures=[
            dict(name='torii tunnel', box=[80, 1040, 440, 1320]),
            dict(name='Kinkaku-ji', box=[640, 740, 1175, 1140]),
            dict(name='veranda', box=[0, 1150, 340, 1618]),
            dict(name='pagoda', box=[100, 450, 420, 920]),
        ],
        horizon=[],
        things=[
            dict(name='Kinkaku-ji (finial to the stones)', base=1130, top=750, m=12.5, hero=True),
            dict(name='Yasaka pagoda', base=900, top=465, m=46, note='base hidden: 900 = its visible foot (est.)'),
        ],
        units=[
            dict(rank=1, what='veranda baluster bay', px=60, where='x 0-330, y 1500-1560'),
            dict(rank=2, what='torii gate (nearest, pillar height)', px=200, where='x 120-420, y 1080-1290'),
            dict(rank=3, what='Kinkaku-ji upper window', px=30, where='x 790-1000, y 840-870'),
            dict(rank=4, what='pagoda storey', px=48, where='x 165-410, y 560-900'),
            dict(rank=5, what='mountain ridge layer', px=0, where='no unit: flat layers'),
        ],
    ),
}


# ================================================================= image, mask, colour

def load(path: str, mask_json: str | None = None):
    """BGR image and its VALID mask (True = picture pixels; the Instagram UI and the black bars are out)."""
    bgr = cv2.imread(path)
    if bgr is None:
        raise SystemExit(f'cannot read {path}')
    H, W = bgr.shape[:2]
    valid = np.ones((H, W), bool)
    name = os.path.basename(path)
    if mask_json and os.path.exists(mask_json):
        spec = json.load(open(mask_json)).get('images', {}).get(name)
        if spec:
            r0, r1 = spec['content_rows']
            valid[:r0] = False
            valid[r1:] = False
            for k in ('counter_pill_box', 'mute_button_box'):
                x0, y0, x1, y1 = spec[k]
                valid[max(0, y0):y1, max(0, x0):x1] = False
    return bgr, valid


def to_lab(bgr):
    """CIE L*a*b* (D65) as float32, via OpenCV's float path (the house check_depth.py convention)."""
    return cv2.cvtColor(bgr[:, :, ::-1].astype(np.float32) / 255, cv2.COLOR_RGB2LAB)


def grad_de(lab):
    """Per-pixel colour step (ΔE76 per px, Sobel / 4): check_depth.py's 'visible edges' measure (> 6)."""
    g = 0
    for c in range(3):
        gx = cv2.Sobel(lab[..., c], cv2.CV_32F, 1, 0, ksize=3) / 4
        gy = cv2.Sobel(lab[..., c], cv2.CV_32F, 0, 1, ksize=3) / 4
        g = g + gx * gx + gy * gy
    return np.sqrt(g)


def boxmask(shape, boxes, s=1.0):
    m = np.zeros(shape[:2], bool)
    for b in boxes or []:
        x0, y0, x1, y1 = [int(round(v * s)) for v in b]
        m[max(0, y0):max(0, y1), max(0, x0):max(0, x1)] = True
    return m


def polymask(shape, poly, s=1.0):
    m = np.zeros(shape[:2], np.uint8)
    if poly:
        cv2.fillPoly(m, [np.round(np.array(poly, np.float64) * s).astype(np.int32)], 1)
    return m.astype(bool)


def plane_mask(shape, p, s=1.0):
    m = boxmask(shape, p.get('boxes'), s) | polymask(shape, p.get('poly'), s) | boxmask(shape, p.get('extra_boxes'), s)
    return m & ~boxmask(shape, p.get('exclude'), s)


# ================================================================= straight lines and vanishing points

def segments(bgr, valid, min_len_frac=0.02, min_de=6.0, roi=None):
    """LSD segments at least min_len_frac x the width long, inside the valid mask (and the roi box, if given), VISIBLE
    (median ΔE76 across the line, 3 px each side, >= min_de: paper grain and soft brushwork drop out). Returns (N, 8):
    x1, y1, x2, y2, length, angle (deg 0..180: 0 = level, 90 = vertical), ΔE across, ΔL* across (signed)."""
    H, W = bgr.shape[:2]
    gray = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY)
    lsd = cv2.createLineSegmentDetector(cv2.LSD_REFINE_STD)
    found = lsd.detect(gray)[0]
    if found is None:
        return np.zeros((0, 8))
    seg = found.reshape(-1, 4).astype(np.float64)
    lab = to_lab(bgr)
    out = []
    min_len = min_len_frac * W
    for x1, y1, x2, y2 in seg:
        dx, dy = x2 - x1, y2 - y1
        L = math.hypot(dx, dy)
        if L < min_len:
            continue
        ok = True
        for (px, py) in ((x1, y1), (x2, y2), ((x1 + x2) / 2, (y1 + y2) / 2)):
            ix, iy = int(min(W - 1, max(0, px))), int(min(H - 1, max(0, py)))
            if not valid[iy, ix]:
                ok = False
            if roi is not None and not (roi[0] <= px <= roi[2] and roi[1] <= py <= roi[3]):
                ok = False
        if not ok:
            continue
        nx, ny = -dy / L, dx / L
        ts = np.linspace(0.1, 0.9, 9)
        px = x1 + dx * ts
        py = y1 + dy * ts
        ax = np.clip(np.round(px + 3 * nx).astype(int), 0, W - 1)
        ay = np.clip(np.round(py + 3 * ny).astype(int), 0, H - 1)
        bx = np.clip(np.round(px - 3 * nx).astype(int), 0, W - 1)
        by = np.clip(np.round(py - 3 * ny).astype(int), 0, H - 1)
        A = lab[ay, ax]
        B = lab[by, bx]
        de = float(np.median(np.linalg.norm(A - B, axis=1)))
        if de < min_de:
            continue
        dl = float(np.median(A[:, 0] - B[:, 0]))
        ang = math.degrees(math.atan2(dy, dx)) % 180
        out.append([x1, y1, x2, y2, L, ang, de, dl])
    return np.array(out) if out else np.zeros((0, 8))


def classify(seg, level_tol=3.0, vert_tol=3.0):
    """'level' (parallel to the frame's bottom: a frontal elevation's horizontals, or a line at eye level), 'vertical',
    'oblique' (receding lines, slopes, roofs)."""
    if not len(seg):
        return np.array([], dtype='<U8')
    ang = seg[:, 5]
    lev = np.minimum(ang, 180 - ang) <= level_tol
    ver = np.abs(ang - 90) <= vert_tol
    return np.where(lev, 'level', np.where(ver, 'vertical', 'oblique'))


def hom_lines(seg):
    p1 = np.c_[seg[:, 0], seg[:, 1], np.ones(len(seg))]
    p2 = np.c_[seg[:, 2], seg[:, 3], np.ones(len(seg))]
    l = np.cross(p1, p2)
    return l / np.linalg.norm(l[:, :2], axis=1, keepdims=True)


def vp_angle_err(seg, v):
    """Angle (deg) between each segment and the ray from its midpoint to the VP v (homogeneous; v[2] ~ 0 = at infinity)."""
    mx = (seg[:, 0] + seg[:, 2]) / 2
    my = (seg[:, 1] + seg[:, 3]) / 2
    d = np.c_[seg[:, 2] - seg[:, 0], seg[:, 3] - seg[:, 1]]
    d /= np.linalg.norm(d, axis=1, keepdims=True)
    if abs(v[2]) > 1e-9:
        u = np.c_[v[0] / v[2] - mx, v[1] / v[2] - my]
    else:
        u = np.tile(v[:2], (len(seg), 1))
    n = np.linalg.norm(u, axis=1, keepdims=True)
    n[n == 0] = 1
    u /= n
    c = np.abs((d * u).sum(1)).clip(0, 1)
    return np.degrees(np.arccos(c))


def refine_vp(seg, w):
    """Least-squares VP: the unit 3-vector v minimising sum w (l . v)^2 over the segments' normalised lines."""
    l = hom_lines(seg)
    M = (l * w[:, None]).T @ l
    _, vecs = np.linalg.eigh(M)
    v = vecs[:, 0]
    return v / np.linalg.norm(v)


def find_vps(seg, n_max=6, tol=1.5, iters=3000, min_share=0.04, min_n=5, seed=7):
    """Sequential RANSAC: the VP with the most segment length pointing at it (within `tol` deg), refined by least squares,
    its inliers removed; repeat. Deterministic (seeded). Returns [{v, idx, n, share}]."""
    rng = np.random.default_rng(seed)
    left = np.arange(len(seg))
    total = seg[:, 4].sum() if len(seg) else 1
    l_all = hom_lines(seg) if len(seg) else None
    out = []
    while len(left) >= max(2, min_n) and len(out) < n_max:
        S = seg[left]
        best, best_w = None, 0
        wlen = S[:, 4]
        p = wlen / wlen.sum()
        for _ in range(iters):
            i, j = rng.choice(len(S), 2, replace=False, p=p)
            v = np.cross(l_all[left[i]], l_all[left[j]])
            nv = np.linalg.norm(v)
            if nv < 1e-12:
                continue
            v = v / nv
            w = wlen[vp_angle_err(S, v) < tol].sum()
            if w > best_w:
                best, best_w = v, w
        if best is None:
            break
        inl = vp_angle_err(S, best) < tol
        if inl.sum() < min_n or best_w / total < min_share:
            break
        for _ in range(2):
            v = refine_vp(S[inl], S[inl][:, 4])
            inl2 = vp_angle_err(S, v) < tol
            if inl2.sum() >= min_n:
                inl = inl2
        out.append(dict(v=v, idx=left[inl], n=int(inl.sum()), share=float(S[inl][:, 4].sum() / total)))
        left = left[~inl]
    return out


def vp_xy(v):
    return None if abs(v[2]) < 1e-12 else (float(v[0] / v[2]), float(v[1] / v[2]))


def vp_kind(v, W, H, far=6.0):
    """'finite' (lines converge within `far` image diagonals of the centre) or 'parallel' (an elevation or an oblique
    projection: the lines stay parallel)."""
    p = vp_xy(v)
    if p is None or math.hypot(p[0] - W / 2, p[1] - H / 2) > far * math.hypot(W, H):
        return 'parallel'
    return 'finite'


def vp_summary(v, seg_in, W, H):
    p = vp_xy(v)
    kind = vp_kind(v, W, H)
    d = dict(kind=kind, n=int(len(seg_in)), length=float(seg_in[:, 4].sum()))
    if kind == 'finite':
        d.update(x=round(p[0], 1), y=round(p[1], 1), xf=round(p[0] / W, 3), yf=round(p[1] / H, 3),
                 inside=bool(0 <= p[0] <= W and 0 <= p[1] <= H))
    else:
        a = (math.degrees(math.atan2(v[1], v[0])) + 90) % 180 if abs(v[2]) < 1e-12 else math.degrees(math.atan2(p[1] - H / 2, p[0] - W / 2)) % 180
        d.update(direction_deg=round(float(np.median(seg_in[:, 5])), 1))
    # the convergence: the spread of the inlier lines' angles (0 for parallel lines)
    ang = seg_in[:, 5]
    ang = np.where(ang > 90, ang - 180, ang)
    d['angle_p10_p90'] = [round(float(np.percentile(ang, 10)), 1), round(float(np.percentile(ang, 90)), 1)]
    return d


# ================================================================= planes, the air, the ladder

def sky_air(lab, cfg, s=1.0):
    """The sky (median Lab of its boxes) and the AIR (the sky's lowest open patch: the air box's sky-like pixels)."""
    sky_m = boxmask(lab.shape, cfg['sky'], s)
    sky = np.median(lab[sky_m], 0)
    am = boxmask(lab.shape, cfg['air'], s)
    px = lab[am]
    near = px[np.linalg.norm(px - sky, axis=1) < 10]
    air = np.median(near, 0) if len(near) >= 30 else np.median(px, 0)
    return sky, air


def plane_stats(lab, m, valid, sky, air, grad, lc_map):
    m = m & valid
    n = int(m.sum())
    if n < 30:
        return None
    L = lab[..., 0][m]
    a = lab[..., 1][m]
    b = lab[..., 2][m]
    C = np.hypot(a, b)
    mean = lab[m].mean(0)
    ys = np.nonzero(m)[0]
    hist, _ = np.histogram(L, bins=np.arange(0, 102, 6))
    return dict(
        share=n / float(valid.sum()), y0=float(np.percentile(ys, 2)) / lab.shape[0], y1=float(np.percentile(ys, 98)) / lab.shape[0],
        L=float(np.median(L)), C=float(np.median(C)), Lmean=float(mean[0]), Cmean=float(np.hypot(mean[1], mean[2])),
        Lp5=float(np.percentile(L, 5)), Lp95=float(np.percentile(L, 95)),
        dE_sky=float(np.linalg.norm(mean - sky)), dE_air=float(np.linalg.norm(mean - air)),
        dE_air_median=float(np.median(np.linalg.norm(lab[m] - air, axis=1))),
        edges=float((grad[m] > 6).mean()), contrast=float(lc_map[m].mean()), values=int((hist >= 0.03 * n).sum()),
        hue=float(math.degrees(math.atan2(mean[2], mean[1])) % 360), mean=[float(v) for v in mean])


def measure_planes(bgr, valid, cfg):
    """Each plane's numbers at the house check's 540 px width (CIE Lab; ΔE76 of the plane's mean to the sky and air)."""
    H0, W0 = bgr.shape[:2]
    s = W540 / W0
    small = cv2.resize(bgr, (W540, int(round(H0 * s))), interpolation=cv2.INTER_AREA)
    vs = cv2.resize(valid.astype(np.uint8), (small.shape[1], small.shape[0]), interpolation=cv2.INTER_NEAREST).astype(bool)
    lab = to_lab(small)
    grad = grad_de(lab)
    L = lab[..., 0]
    lc_map = np.abs(L - cv2.GaussianBlur(L, (0, 0), 8))
    sky, air = sky_air(lab, cfg, s)
    rows = []
    for p in cfg['planes']:
        st = plane_stats(lab, plane_mask(lab.shape, p, s), vs, sky, air, grad, lc_map)
        if st:
            st.update(name=p['name'], rank=p['rank'], role=p.get('role', 'env'), hero=bool(p.get('hero')))
            rows.append(st)
    skym = boxmask(lab.shape, cfg['sky'], s) & vs
    sk = plane_stats(lab, skym, vs, sky, air, grad, lc_map)
    sk.update(name='sky', rank=max(p['rank'] for p in cfg['planes']) + 1, role='sky', hero=False)
    rows.append(sk)
    return dict(sky=[float(v) for v in sky], air=[float(v) for v in air], planes=rows)


def row_profile(bgr, valid, cfg=None, band=0.02):
    """Per horizontal band (2 % of the height): median L*, C*, ΔE76 to the sky and the edge share (540 px wide)."""
    H0, W0 = bgr.shape[:2]
    s = W540 / W0
    small = cv2.resize(bgr, (W540, int(round(H0 * s))), interpolation=cv2.INTER_AREA)
    vs = cv2.resize(valid.astype(np.uint8), (small.shape[1], small.shape[0]), interpolation=cv2.INTER_NEAREST).astype(bool)
    if cfg is not None and cfg.get('title'):
        vs &= ~boxmask(vs.shape, [cfg['title']], s)
    lab = to_lab(small)
    grad = grad_de(lab)
    sky = np.median(lab[boxmask(lab.shape, cfg['sky'], s)], 0) if cfg else lab[: lab.shape[0] // 10].reshape(-1, 3).mean(0)
    out = []
    h = lab.shape[0]
    step = max(1, int(round(band * h)))
    for y in range(0, h - step + 1, step):
        m = vs[y:y + step]
        if m.sum() < 50:
            continue
        px = lab[y:y + step][m]
        out.append(dict(y=(y + step / 2) / h, L=float(np.median(px[:, 0])), C=float(np.median(np.hypot(px[:, 1], px[:, 2]))),
                        dE_sky=float(np.median(np.linalg.norm(px - sky, axis=1))), edges=float((grad[y:y + step][m] > 6).mean())))
    return out


# ================================================================= dev: plane overlay
PLANE_COLS = [(60, 60, 230), (40, 160, 250), (60, 200, 60), (220, 160, 40), (200, 60, 200), (240, 240, 60), (120, 120, 120), (200, 200, 200)]


def overlay_planes(bgr, cfg, out):
    vis = bgr.copy()
    for p in cfg['planes']:
        m = plane_mask(bgr.shape, p)
        col = np.array(PLANE_COLS[(p['rank'] - 1) % len(PLANE_COLS)], np.float32)
        vis[m] = (vis[m] * 0.45 + col * 0.55).astype(np.uint8)
        ys, xs = np.nonzero(m)
        if len(xs):
            cv2.putText(vis, p['name'][:28], (int(np.median(xs)) - 80, int(np.median(ys))), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 0), 3)
            cv2.putText(vis, p['name'][:28], (int(np.median(xs)) - 80, int(np.median(ys))), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 1)
    for b in cfg['sky']:
        cv2.rectangle(vis, (b[0], b[1]), (b[2], b[3]), (255, 0, 0), 3)
    for b in cfg['air']:
        cv2.rectangle(vis, (b[0], b[1]), (b[2], b[3]), (0, 0, 255), 3)
    H, W = vis.shape[:2]
    cv2.imwrite(out, cv2.resize(vis, (W // 2, H // 2), interpolation=cv2.INTER_AREA), [cv2.IMWRITE_JPEG_QUALITY, 82])


if __name__ == '__main__' and len(sys.argv) > 1 and sys.argv[1] == '_dev_planes':
    for name, cfg in POSTERS.items():
        bgr, valid = load(os.path.join(REFS, name), os.path.join(REFS, 'ui_mask.json'))
        overlay_planes(bgr, cfg, os.path.join(sys.argv[2], 'dev_planes_' + name))
        res = measure_planes(bgr, valid, cfg)
        print(name, 'sky L%.1f C%.1f' % (res['sky'][0], math.hypot(*res['sky'][1:])), 'air L%.1f C%.1f' % (res['air'][0], math.hypot(*res['air'][1:])))
        for r in res['planes']:
            print(f"  r{r['rank']} {r['name'][:36]:36s} share {r['share']*100:4.1f}% y {r['y0']:.2f}-{r['y1']:.2f} L {r['L']:5.1f} C {r['C']:4.1f} dEair {r['dE_air']:5.1f} edges {r['edges']:.3f} contrast {r['contrast']:4.1f} values {r['values']}")


def structure_vps(bgr, valid, box, seed=11):
    """The vanishing points of one structure (a street, a facade row, a box): segments inside `box`, verticals out and
    exactly level lines (|angle| <= 1 deg: frontal edges) counted apart; up to 3 VPs, each holding >= 12 % of the
    structure's sloped line length."""
    H, W = bgr.shape[:2]
    seg = segments(bgr, valid, min_len_frac=0.015, roi=box)
    if not len(seg):
        return dict(n=0)
    ang = seg[:, 5]
    flat = np.minimum(ang, 180 - ang)
    ver = np.abs(ang - 90) <= 3
    lev = flat <= 1.0
    slo = ~ver & ~lev
    tot = seg[:, 4].sum()
    out = dict(n=int(len(seg)), level_share=float(seg[lev, 4].sum() / tot), vertical_share=float(seg[ver, 4].sum() / tot),
               sloped_share=float(seg[slo, 4].sum() / tot), vps=[])
    S = seg[slo]
    if len(S) >= 4:
        for vp in find_vps(S, n_max=3, tol=1.5, iters=2500, min_share=0.12, min_n=4, seed=seed):
            d = vp_summary(vp['v'], S[vp['idx']], W, H)
            d['share_of_sloped'] = round(vp['share'], 3)
            d['segs'] = S[vp['idx']][:, :4].round(1).tolist()
            out['vps'].append(d)
    # the verticals: parallel (an architect's two-point view) or converging (three-point)?
    V = seg[ver]
    if len(V) >= 4:
        v = refine_vp(V, V[:, 4])
        p = vp_xy(v)
        out['verticals'] = dict(n=int(len(V)), converge_y=None if p is None else round(p[1], 0),
                                far=bool(p is None or abs(p[1] - H / 2) > 6 * H))
    return out


# ================================================================= drawing helpers (sheets)
FAM = [(214, 39, 40), (31, 119, 180), (44, 160, 44), (255, 127, 14), (148, 103, 189), (23, 190, 207)]  # RGB


def _bgr(c):
    return (int(c[2]), int(c[1]), int(c[0]))


def dashed_hline(img, y, x0, x1, col, th=2, dash=14, gap=9):
    x = x0
    while x < x1:
        cv2.line(img, (int(x), int(y)), (int(min(x1, x + dash)), int(y)), col, th, cv2.LINE_AA)
        x += dash + gap


def put(img, text, org, scale=0.5, col=(20, 20, 20), th=1, bg=(255, 255, 255)):
    (w, h), b = cv2.getTextSize(text, cv2.FONT_HERSHEY_SIMPLEX, scale, th)
    x, y = int(org[0]), int(org[1])
    if bg is not None:
        cv2.rectangle(img, (x - 2, y - h - 3), (x + w + 2, y + b + 1), bg, -1)
    cv2.putText(img, text, (x, y), cv2.FONT_HERSHEY_SIMPLEX, scale, col, th, cv2.LINE_AA)


def vp_panel(bgr, valid, cfg, structs, horizons, width=560, margin=0.45):
    """One poster at `width` px with side margins (margin x W each side) so VPs just outside the frame show: the
    structure lines in their VP family's colour, extended to the VP; the horizon cues dashed."""
    H, W = bgr.shape[:2]
    s = width / W
    mw = int(round(margin * width))
    h = int(round(H * s))
    canvas = np.full((h, width + 2 * mw, 3), 250, np.uint8)
    pic = cv2.resize(bgr, (width, h), interpolation=cv2.INTER_AREA)
    pic = (pic.astype(np.float32) * 0.55 + 255 * 0.45).astype(np.uint8)  # faded so the lines read
    canvas[:, mw:mw + width] = pic
    X = lambda x: int(round(mw + x * s))
    Y = lambda y: int(round(y * s))
    k = 0
    for st in cfg['structures']:
        r = structs.get(st['name'], {})
        for v in r.get('vps', []):
            col = _bgr(FAM[k % len(FAM)])
            k += 1
            for x1, y1, x2, y2 in v['segs']:
                cv2.line(canvas, (X(x1), Y(y1)), (X(x2), Y(y2)), col, 2, cv2.LINE_AA)
                if v['kind'] == 'finite':
                    # extend from the segment's far end toward the VP (thin)
                    d1 = math.hypot(x1 - v['x'], y1 - v['y'])
                    d2 = math.hypot(x2 - v['x'], y2 - v['y'])
                    ex, ey = (x1, y1) if d1 < d2 else (x2, y2)
                    cv2.line(canvas, (X(ex), Y(ey)), (X(v['x']), Y(v['y'])), col, 1, cv2.LINE_AA)
            if v['kind'] == 'finite':
                px, py = X(v['x']), Y(v['y'])
                if 0 <= px < canvas.shape[1] and 0 <= py < canvas.shape[0]:
                    cv2.circle(canvas, (px, py), 7, col, 2, cv2.LINE_AA)
                else:
                    cx, cy = min(max(px, 8), canvas.shape[1] - 8), min(max(py, 8), canvas.shape[0] - 8)
                    cv2.drawMarker(canvas, (cx, cy), col, cv2.MARKER_TRIANGLE_UP, 14, 2)
    for hz in horizons:
        dashed_hline(canvas, Y(hz['y']), 0, canvas.shape[1], _bgr(hz.get('col', (20, 20, 20))), 2)
        put(canvas, hz['label'], (4, Y(hz['y']) - 5), 0.42, _bgr(hz.get('col', (20, 20, 20))))
    return canvas


def unit_period(bgr, box, axis='y', lo=4, hi_frac=0.5):
    """The repeated unit's size (px) in a box: the first clear peak of the autocorrelation of the high-passed L*
    profile along `axis` ('y' = a storey or window-row period, 'x' = a bay period). Returns (period px, peak strength)."""
    x0, y0, x1, y1 = box
    L = to_lab(bgr[y0:y1, x0:x1])[..., 0]
    L = L - cv2.GaussianBlur(L, (0, 0), 12)
    prof = L.mean(1) if axis == 'y' else L.mean(0)
    prof = prof - prof.mean()
    n = len(prof)
    ac = np.correlate(prof, prof, 'full')[n - 1:]
    ac = ac / (ac[0] + 1e-9)
    hi = int(n * hi_frac)
    best, bv = None, 0.15
    for k in range(lo, max(lo + 1, hi)):
        if ac[k] > ac[k - 1] and ac[k] >= ac[k + 1 if k + 1 < n else k] and ac[k] > bv:
            best, bv = k, ac[k]
            break
    return (best, float(bv)) if best else (None, 0.0)


# ================================================================= a second opinion: a monocular depth network (optional)
# Depth Anything V2 small (ONNX export, fabio-sim/Depth-Anything-ONNX release v2.0.0, depth_anything_v2_vits.onnx,
# 518 x 518 input) through onnxruntime: relative inverse depth (higher = nearer). It reads the same cues a viewer does
# (overlap, size, height in the frame, aerial perspective, converging lines), so it is a proxy for "does it read deep",
# never a measurement of the drawing. Optional: everything else runs without it.

def depth_net(bgr, model_path, size=518):
    import onnxruntime as ort  # optional dependency
    sess = depth_net.sessions.get(model_path)
    if sess is None:
        sess = ort.InferenceSession(model_path, providers=['CPUExecutionProvider'])
        depth_net.sessions[model_path] = sess
    H, W = bgr.shape[:2]
    rgb = cv2.cvtColor(cv2.resize(bgr, (size, size), interpolation=cv2.INTER_AREA), cv2.COLOR_BGR2RGB).astype(np.float32) / 255
    x = (rgb - np.array([0.485, 0.456, 0.406], np.float32)) / np.array([0.229, 0.224, 0.225], np.float32)
    x = x.transpose(2, 0, 1)[None]
    d = sess.run(None, {sess.get_inputs()[0].name: x})[0][0]
    d = cv2.resize(d, (W, H), interpolation=cv2.INTER_CUBIC)
    lo, hi = np.percentile(d, 1), np.percentile(d, 99)
    return np.clip((d - lo) / max(1e-6, hi - lo), 0, 1)  # 0 = farthest, 1 = nearest


depth_net.sessions = {}


def depth_layering(d, valid=None, sky_cut=0.03):
    """How the depth map is built, over the non-sky pixels (d > sky_cut):
    side = the share of the depth variance found WITHIN rows (things at one height at different depths: overlaps,
           side frames, layered silhouettes); 0 = depth set by height alone (a ground ramp, stacked bands).
    range = p95 - p5 of the depth; modes = peaks of its histogram (distinct layers), prominence >= 0.15 of the max."""
    m = d > sky_cut
    if valid is not None:
        m &= valid
    if m.sum() < 100:
        return dict(side=0.0, range=0.0, modes=0)
    vals = d[m]
    tot = vals.var()
    rows = []
    for y in range(d.shape[0]):
        r = d[y][m[y]]
        if len(r) > 5:
            rows.append((len(r), r.var()))
    within = sum(n * v for n, v in rows) / max(1, sum(n for n, _ in rows))
    hist, _ = np.histogram(vals, bins=40, range=(0, 1))
    hs = np.convolve(hist.astype(float), np.ones(3) / 3, 'same')
    peaks = 0
    for i in range(1, len(hs) - 1):
        if hs[i] >= hs[i - 1] and hs[i] > hs[i + 1] and hs[i] >= 0.15 * hs.max():
            peaks += 1
    return dict(side=float(within / max(1e-9, tot)), range=float(np.percentile(vals, 95) - np.percentile(vals, 5)), modes=int(peaks))
