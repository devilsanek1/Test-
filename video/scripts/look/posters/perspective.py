#!/usr/bin/env python3
"""perspective.py: perspective and depth, measured on a picture (the city-poster study, 2026-10-28, look lens 1; the
report is docs/studies/2026-10-28_city_posters/perspective.md). Analysis only: it reads pictures, writes numbers and
sheets, and never touches a film's code.

  # the seven posters and our films' stills: every number (JSON) and the study's sheets
  python3 -I video/scripts/look/posters/perspective.py all --json /tmp/posters-perspective/perspective.json \
      --img-dir video/docs/studies/2026-10-28_city_posters/img [--model depth_anything_v2_vits.onnx]
  # one still of a film with its depth sheet (scripts/qa/depth_sheets/*.json): lines, VPs, planes, overlap share
  python3 -I video/scripts/look/posters/perspective.py frame still.png --sheet video/scripts/qa/depth_sheets/v2_s1.json

What it measures (CIE L*a*b* through OpenCV's float path, as scripts/qa/check_depth.py; planes at 540 px wide):
- LINES: LSD segments >= 2 % of the width whose colour step across is visible (median dE76 >= 6, 3 px each side):
  level (|angle| <= 3 deg: a frontal elevation's horizontals), vertical (+-3) or oblique, as shares of the visible line
  length, in the whole picture and in its bottom third (where the posters put their near frame and our films a ground).
- VANISHING POINTS per STRUCTURE (a box round a street, a facade row, a two-point box): sequential RANSAC (seeded) over
  the sloped segments, exactly level ones (<= 1 deg) counted apart as frontal; each VP refined by least squares;
  'parallel' when the lines meet farther than 6 image diagonals away (an elevation or an oblique projection); the
  verticals tested for convergence (three-point) the same way.
- VIEWS: the eye level(s) a picture implies: a structure's VP height, or a cue (a sea, lake or river's far edge); the
  camera height each 'thing' of roughly known size implies under a view: m x (base - horizon) / (base - top) (the
  construction of lib/persp measureEye and lib/depth sizeProblems).
- PLANES (polygons drawn by eye per poster; a film's from its depth sheet): share of the frame, y range, median L* and
  C*, dE76 of the plane's mean to the AIR (the sky's lowest open patch, CRAFT §f.1), visible edges (share of px with a
  colour step > dE 6 per px: check_depth's measure), local contrast (mean |L* - blur(sigma 8)|).
- UNITS: a repeated unit's height in px per plane (windows, storeys, a wheel), measured by eye on 1:1-3:1 crops with a
  10 px grid (POSTERS[...]['units'], +-10 %); with a guessed real size (est.) they give px per metre, hence each
  plane's share of a camera move (parallax and crane shift go as 1/distance, as drawn size does).
- A SECOND OPINION (optional, --model): Depth Anything V2 small (ONNX, 518 x 518; fabio-sim/Depth-Anything-ONNX release
  v2.0.0, depth_anything_v2_vits.onnx, sha256 d2b11a11...62be) through onnxruntime: each plane's median relative depth
  and the OVERLAP SHARE, the share of the non-sky depth variance found side by side within rows (0 = depth set by
  height alone: a ground ramp or stacked bands; high = frames, overlaps, layered silhouettes). A proxy for "does it
  read deep", never a measurement of the drawing.
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

sys.dont_write_bytecode = True
cv2.setNumThreads(2)

HERE = os.path.dirname(os.path.abspath(__file__))
VIDEO = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
REFS = os.path.join(VIDEO, 'docs', 'look', 'poster_refs')
W540 = 540  # the house depth check's working width (scripts/qa/check_depth.py)

# ================================================================= the posters, annotated by eye (screenshot px)
# Per poster: the sky and AIR boxes; the planes from the nearest (rank 1, the foreground frame) to the farthest (the
# sky comes last, from its box); `structures`: boxes where straight lines show the camera; `views`: the eye level(s),
# from structures' VPs (`from_`) or a cue (`y`); `things` for the camera height (base y, top y, metres; est. = a
# guessed real size); `hero_box`; `units` (a repeated unit's height in px, by eye on zoomed crops; m = its guessed real
# height, est.).
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
        views=[dict(zone='one camera (raised over the near roofs)', y=1140, cue="the bay's far edge (x 0-830); the near roofs are seen from above")],
        things=[
            dict(name='near shophouse door (arched)', base=1625, top=1530, m=2.6, note='cut by the bottom edge: base >= 1625 (est.)'),
            dict(name='Merlion', base=1205, top=1000, m=8.6),
        ],
        hero_box=dict(top=665, base=1100, m=200, hidden="its base behind the far shore's trees (est. 1100)"),
        units=[
            dict(rank=2, what='shophouse window (arched)', px=58, m=2.0, where='x 690-940, y 1435-1490'),
            dict(rank=4, what='MBS floor band', px=8, m=3.2, where='x 350-850, y 760-1030', hero=True),
            dict(rank=5, what='far towers, ghost blocks', px=0, where='none: window-less pale blocks'),
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
        views=[dict(zone='one camera (raised over the roofs)', y=990, cue="the sea's far edge (x 330-1206); Harpa's edges meet on it")],
        things=[
            dict(name='near house (yellow, eaves to the bottom edge)', base=1608, top=1500, m=5.5, note='cut by the bottom edge (est.)'),
            dict(name='Harpa (roof edge to its base)', base=1235, top=1005, m=43, note='est.'),
            dict(name='Hallgrimskirkja', base=1112, top=395, m=74.5, hero=True),
        ],
        hero_box=dict(top=395, base=1112, m=74.5, hidden='its foot behind the house rows'),
        units=[
            dict(rank=1, what='nearest house window', px=30, m=1.5, where='x 250-380, y 1500-1580'),
            dict(rank=2, what='row-2 house window', px=30, m=1.5, where='x 182-200, y 1368-1398'),
            dict(rank=3, what='Harpa glass panel row', px=12, m=1.5, where='x 600-1140, y 1020-1220'),
            dict(rank=3, what='Hallgrimskirkja belfry lancet', px=47, m=6, where='x 225-300, y 598-645', hero=True),
            dict(rank=5, what='mountains', px=0, where='none: flat ridge layers'),
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
            dict(name='pagoda balustrade', box=[690, 1255, 1206, 1365]),
            dict(name='left street (shophouses, road)', box=[0, 760, 320, 1610]),
            dict(name='One Pillar Pagoda', box=[680, 840, 1190, 1390]),
        ],
        views=[dict(zone='near/mid eye level', from_=['Huc bridge', 'pagoda balustrade']),
               dict(zone='far horizon (lifted)', y=925, cue="the lake's far edge at the Turtle Tower (x 300-860)")],
        things=[
            dict(name='cyclo and rider (hat to wheels)', base=1600, top=1308, m=1.75),
            dict(name='people on the bridge (feet on the deck)', base=1100, top=1050, m=1.65, note='the deck ~3 m over the water (est.)'),
            dict(name='One Pillar Pagoda (ridge to the water)', base=1380, top=850, m=11, note='~11 m with its pillar (est.)', hero=True),
        ],
        hero_box=dict(top=850, base=1380, m=11, hidden='no: it stands in the lake, its pillar in view'),
        units=[
            dict(rank=1, what='cyclo wheel', px=110, m=0.65, where='x 60-150, y 1490-1600'),
            dict(rank=3, what='person on the bridge', px=50, m=1.65, where='x 490-535, y 1050-1100'),
            dict(rank=4, what='colonial facade window', px=45, m=2.2, where='x 1035-1055, y 745-790'),
            dict(rank=5, what='far towers, ghost blocks', px=0, where='none: window-less blocks'),
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
            dict(name='La Boca houses', box=[0, 920, 420, 1579]),
            dict(name='Casa Rosada', box=[660, 960, 1206, 1430]),
            dict(name='avenue (9 de Julio)', box=[250, 930, 565, 1135]),
            dict(name='fence and plaza', box=[450, 1240, 1060, 1520]),
        ],
        views=[dict(zone='near-left eye level (La Boca)', from_=['La Boca houses']),
               dict(zone='near-right eye level (Casa Rosada)', from_=['Casa Rosada']),
               dict(zone='far horizon (lifted)', y=842, cue="the river's far shore (x 270-1206)")],
        things=[
            dict(name='street lamp (bottom left)', base=1579, top=1300, m=4.5, note='cut at the bottom: base >= 1579 (est.)'),
            dict(name='Casa Rosada (cornice to the fence foot)', base=1410, top=1040, m=22, note='est.'),
            dict(name='the Obelisco', base=1085, top=400, m=67.5, hero=True),
        ],
        hero_box=dict(top=400, base=1085, m=67.5, hidden='its plinth among the avenue trees and jacarandas'),
        units=[
            dict(rank=1, what='La Boca window', px=90, m=1.8, where='x 30-80, y 1200-1290 (cut, est.)'),
            dict(rank=2, what='Casa Rosada window (arched)', px=65, m=3.0, where='x 900-960, y 1078-1145'),
            dict(rank=3, what='domed building window', px=58, m=2.5, where='x 160-180, y 742-800'),
            dict(rank=3, what='car on the avenue', px=10, m=1.5, where='x 420-440, y 1000-1010'),
            dict(rank=5, what='far city blocks', px=0, where='none: window-less blocks'),
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
            dict(name="HERO: Table Mountain, Lion's Head", rank=6, hero=True, poly=[[0, 880], [0, 800], [100, 730], [180, 700], [260, 640], [450, 620], [700, 610], [820, 660], [900, 700], [1060, 670], [1206, 760], [1206, 820], [1000, 850], [880, 880]]),
        ],
        structures=[
            dict(name='Bo-Kaap street (houses, kerb)', box=[450, 820, 1206, 1605]),
            dict(name='harbour (V&A)', box=[80, 960, 700, 1110]),
        ],
        views=[dict(zone='near eye level (Bo-Kaap)', from_=['Bo-Kaap street (houses, kerb)']),
               dict(zone='far horizon (lifted)', y=943, cue="the sea's far edge at the coast (x 0-650)")],
        things=[
            dict(name='Bo-Kaap door (green house)', base=1460, top=1370, m=2.1),
            dict(name='Bo-Kaap door (pink house)', base=1590, top=1405, m=2.4, note='est.'),
            dict(name='Green Point lighthouse', base=1090, top=960, m=16, note='est.'),
        ],
        hero_box=dict(top=600, base=943, m=1085, hidden='its foot behind the far coast and the city'),
        units=[
            dict(rank=2, what='Bo-Kaap window (pink house)', px=75, m=1.6, where='x 1040-1080, y 935-1010'),
            dict(rank=3, what='lower house window', px=45, m=1.6, where='x 655-670, y 1280-1325'),
            dict(rank=4, what='harbour building window', px=7, m=1.5, where='x 260-480, y 1068-1076'),
            dict(rank=5, what='far coast house', px=5, m=5, where='x 0-650, y 890-940 (est.)'),
            dict(rank=6, what='Table Mountain', px=0, where='none: a silhouette with rock texture'),
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
            dict(name='quay paving', box=[0, 1500, 1206, 1625]),
            dict(name='railing and bicycle', box=[0, 1320, 860, 1580]),
        ],
        views=[dict(zone='one camera (standing eye level)', from_=['Nyhavn facade row', 'quay paving'])],
        things=[
            dict(name='bicycle (handlebar top)', base=1570, top=1345, m=1.05),
            dict(name='railing post', base=1550, top=1338, m=1.05, note='est.'),
        ],
        hero_box=dict(top=760, base=1160, m=None, hidden='its quay behind the boats; the row runs out of the right side'),
        units=[
            dict(rank=1, what='bicycle wheel', px=215, m=0.7, where='x 165-380, y 1355-1570'),
            dict(rank=3, what='facade window, nearest house', px=37, m=1.5, where='x 50-63, y 893-930', hero=True),
            dict(rank=3, what='facade window, mid row', px=28, m=1.5, where='x 300, y 1022-1050', hero=True),
            dict(rank=3, what='facade window, far end of the row', px=20, m=1.5, where='x 640-700, y 1088-1108', hero=True),
            dict(rank=4, what='Round Tower window', px=15, m=2.0, where='x 640-700, y 925-940'),
            dict(rank=5, what='ghost blocks', px=0, where='none: flat pale blocks'),
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
            dict(name='Kinkaku-ji', box=[640, 740, 1175, 1140]),
            dict(name='veranda', box=[0, 1150, 340, 1618]),
            dict(name='torii tunnel', box=[80, 1040, 440, 1320]),
            dict(name='pagoda', box=[100, 450, 420, 920]),
        ],
        views=[dict(zone='mid eye level (Kinkaku-ji, gentle two-point)', from_=['Kinkaku-ji']),
               dict(zone='near eye level (torii tunnel, by eye)', y=1236, cue="the tunnel's beams meet at its far end (x ~300-320), by eye on a 1.3x crop"),
               dict(zone='near (the veranda, from above)', from_=['veranda'])],
        things=[
            dict(name='Kinkaku-ji (finial to the stones)', base=1130, top=750, m=12.5, hero=True),
        ],
        hero_box=dict(top=750, base=1130, m=12.5, hidden="no: on the pond's far bank, its base in view"),
        units=[
            dict(rank=1, what='veranda baluster bay', px=62, m=1.8, where='x 0-200, y 1480-1560'),
            dict(rank=3, what='Kinkaku-ji upper window', px=30, m=1.2, where='x 845-865, y 860-890 (cut, est.)', hero=True),
            dict(rank=4, what='pagoda tier', px=63, m=9, where='x 170-400, y 640-900'),
            dict(rank=5, what='mountains', px=0, where='none: flat ridge layers'),
        ],
    ),
}

# Our films: one still per shot (the v2 G7 master; v1's final) with its depth sheet (the lanes' planes, air, camera).
FILMS = {
    'v2 S1 @5.2': dict(video='deliverables/v2/v2r_G7_master_v1.mp4', t=5.2, sheet='scripts/qa/depth_sheets/v2_s1.json'),
    'v2 S2 @11.0': dict(video='deliverables/v2/v2r_G7_master_v1.mp4', t=11.0, sheet='scripts/qa/depth_sheets/v2_s2.json'),
    'v2 S3 @13.5': dict(video='deliverables/v2/v2r_G7_master_v1.mp4', t=13.5, sheet='scripts/qa/depth_sheets/v2_s3.json'),
    'v2 S4 @17.0': dict(video='deliverables/v2/v2r_G7_master_v1.mp4', t=17.0, sheet='scripts/qa/depth_sheets/v2_s4.json'),
    'v2 S5 @23.4': dict(video='deliverables/v2/v2r_G7_master_v1.mp4', t=23.4, sheet='scripts/qa/depth_sheets/v2_s5_23.4.json'),
    'v2 S6 @25.0': dict(video='deliverables/v2/v2r_G7_master_v1.mp4', t=25.0, sheet='scripts/qa/depth_sheets/v2_s6.json'),
    'v2 S7 @31.0': dict(video='deliverables/v2/v2r_G7_master_v1.mp4', t=31.0, sheet='scripts/qa/depth_sheets/v2_s7.json'),
    'v2 S8 @38.0': dict(video='deliverables/v2/v2r_G7_master_v1.mp4', t=38.0, sheet='scripts/qa/depth_sheets/v2_s8_t38.json'),
    'v1 @10.0': dict(video='deliverables/v1/php2shell_final.mp4', t=10.0, sheet='scripts/qa/depth_sheets/v1_10.0.json'),
    'v1 @20.5': dict(video='deliverables/v1/php2shell_final.mp4', t=20.5, sheet='scripts/qa/depth_sheets/v1_20.5.json'),
    'v1 @38.5': dict(video='deliverables/v1/php2shell_final.mp4', t=38.5, sheet='scripts/qa/depth_sheets/v1_38.5.json'),
}
GROUND_WORDS = ('tread', 'towpath', 'footpath', 'landing', 'paving', 'water', 'canal', 'floor', 'ground', 'river')


# ================================================================= image, mask, colour

def load(path: str, mask_json: str | None = None):
    """BGR image and its VALID mask (True = picture pixels; the Instagram UI and the black bars out)."""
    bgr = cv2.imread(path)
    if bgr is None:
        raise SystemExit(f'cannot read {path}')
    H, W = bgr.shape[:2]
    valid = np.ones((H, W), bool)
    if mask_json and os.path.exists(mask_json):
        spec = json.load(open(mask_json)).get('images', {}).get(os.path.basename(path))
        if spec:
            r0, r1 = spec['content_rows']
            valid[:r0] = False
            valid[r1:] = False
            for k in ('counter_pill_box', 'mute_button_box'):
                x0, y0, x1, y1 = spec[k]
                valid[max(0, y0):y1, max(0, x0):x1] = False
    return bgr, valid


def to_lab(bgr):
    """CIE L*a*b* (D65), float32, via OpenCV's float path (the house check_depth.py convention)."""
    return cv2.cvtColor(bgr[:, :, ::-1].astype(np.float32) / 255, cv2.COLOR_RGB2LAB)


def hexlab(h: str):
    h = h.lstrip('#')
    rgb = np.array([[[int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]]], np.float32)
    return cv2.cvtColor(rgb, cv2.COLOR_RGB2LAB)[0, 0]


def grad_de(lab):
    """Per-pixel colour step (dE76 per px, Sobel / 4): check_depth.py's 'visible edges' measure (> 6)."""
    g = 0
    for c in range(3):
        gx = cv2.Sobel(lab[..., c], cv2.CV_32F, 1, 0, ksize=3) / 4
        gy = cv2.Sobel(lab[..., c], cv2.CV_32F, 0, 1, ksize=3) / 4
        g = g + gx * gx + gy * gy
    return np.sqrt(g)


def boxmask(shape, boxes, sx=1.0, sy=None):
    sy = sx if sy is None else sy
    m = np.zeros(shape[:2], bool)
    for b in boxes or []:
        x0, y0, x1, y1 = int(round(b[0] * sx)), int(round(b[1] * sy)), int(round(b[2] * sx)), int(round(b[3] * sy))
        m[max(0, y0):max(0, y1), max(0, x0):max(0, x1)] = True
    return m


def polymask(shape, poly, sx=1.0, sy=None):
    sy = sx if sy is None else sy
    m = np.zeros(shape[:2], np.uint8)
    if poly:
        cv2.fillPoly(m, [np.round(np.array(poly, np.float64) * np.array([sx, sy])).astype(np.int32)], 1)
    return m.astype(bool)


def plane_mask(shape, p, sx=1.0, sy=None):
    m = boxmask(shape, p.get('boxes'), sx, sy) | polymask(shape, p.get('poly'), sx, sy) | boxmask(shape, p.get('extra_boxes'), sx, sy)
    return m & ~boxmask(shape, p.get('exclude'), sx, sy)


# ================================================================= straight lines and vanishing points

def segments(bgr, valid, min_len_frac=0.02, min_de=6.0, roi=None):
    """LSD segments >= min_len_frac x the width, inside the valid mask (and the roi box), VISIBLE (median dE76 across
    the line, 3 px each side, >= min_de). Returns (N, 8): x1, y1, x2, y2, length, angle (deg 0..180: 0 level, 90
    vertical), dE across, dL* across (signed)."""
    H, W = bgr.shape[:2]
    found = cv2.createLineSegmentDetector(cv2.LSD_REFINE_STD).detect(cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY))[0]
    if found is None:
        return np.zeros((0, 8))
    lab = to_lab(bgr)
    out = []
    ts = np.linspace(0.1, 0.9, 9)
    for x1, y1, x2, y2 in found.reshape(-1, 4).astype(np.float64):
        dx, dy = x2 - x1, y2 - y1
        L = math.hypot(dx, dy)
        if L < min_len_frac * W:
            continue
        ok = True
        for px, py in ((x1, y1), (x2, y2), ((x1 + x2) / 2, (y1 + y2) / 2)):
            if not valid[int(min(H - 1, max(0, py))), int(min(W - 1, max(0, px)))]:
                ok = False
            if roi is not None and not (roi[0] <= px <= roi[2] and roi[1] <= py <= roi[3]):
                ok = False
        if not ok:
            continue
        nx, ny = -dy / L, dx / L
        px, py = x1 + dx * ts, y1 + dy * ts
        A = lab[np.clip(np.round(py + 3 * ny).astype(int), 0, H - 1), np.clip(np.round(px + 3 * nx).astype(int), 0, W - 1)]
        B = lab[np.clip(np.round(py - 3 * ny).astype(int), 0, H - 1), np.clip(np.round(px - 3 * nx).astype(int), 0, W - 1)]
        de = float(np.median(np.linalg.norm(A - B, axis=1)))
        if de >= min_de:
            out.append([x1, y1, x2, y2, L, math.degrees(math.atan2(dy, dx)) % 180, de, float(np.median(A[:, 0] - B[:, 0]))])
    return np.array(out) if out else np.zeros((0, 8))


def line_kinds(seg, level_tol=3.0, vert_tol=3.0):
    ang = seg[:, 5]
    return np.where(np.minimum(ang, 180 - ang) <= level_tol, 'level', np.where(np.abs(ang - 90) <= vert_tol, 'vertical', 'oblique'))


def line_stats(seg, H):
    """Shares of the visible line length (level / vertical / oblique) in the whole picture and in its bottom third."""
    out = {}
    if not len(seg):
        return out
    kinds = line_kinds(seg)
    low = (seg[:, 1] + seg[:, 3]) / 2 > 2 * H / 3
    for zone, sel in (('all', np.ones(len(seg), bool)), ('bottom_third', low)):
        tot = seg[sel, 4].sum()
        out[zone] = {k: round(float(seg[sel & (kinds == k), 4].sum() / tot), 3) if tot else 0.0 for k in ('level', 'vertical', 'oblique')}
        out[zone]['n'] = int(sel.sum())
    return out


def hom_lines(seg):
    p1 = np.c_[seg[:, 0], seg[:, 1], np.ones(len(seg))]
    p2 = np.c_[seg[:, 2], seg[:, 3], np.ones(len(seg))]
    l = np.cross(p1, p2)
    return l / np.linalg.norm(l[:, :2], axis=1, keepdims=True)


def vp_angle_err(seg, v):
    """Angle (deg) between each segment and the ray from its midpoint to the VP v (homogeneous; v[2] ~ 0 = at infinity)."""
    mx, my = (seg[:, 0] + seg[:, 2]) / 2, (seg[:, 1] + seg[:, 3]) / 2
    d = np.c_[seg[:, 2] - seg[:, 0], seg[:, 3] - seg[:, 1]]
    d /= np.linalg.norm(d, axis=1, keepdims=True)
    u = np.c_[v[0] / v[2] - mx, v[1] / v[2] - my] if abs(v[2]) > 1e-9 else np.tile(v[:2], (len(seg), 1))
    n = np.linalg.norm(u, axis=1, keepdims=True)
    n[n == 0] = 1
    return np.degrees(np.arccos(np.abs((d * (u / n)).sum(1)).clip(0, 1)))


def refine_vp(seg, w):
    """Least-squares VP: the unit 3-vector minimising sum w (l . v)^2 over the segments' normalised lines."""
    l = hom_lines(seg)
    v = np.linalg.eigh((l * w[:, None]).T @ l)[1][:, 0]
    return v / np.linalg.norm(v)


def find_vps(seg, n_max=3, tol=1.5, iters=2500, min_share=0.12, min_n=4, seed=11):
    """Sequential RANSAC (seeded: deterministic): the VP the most segment length points at (within `tol` deg), refined
    by least squares, its inliers removed; repeat."""
    rng = np.random.default_rng(seed)
    left = np.arange(len(seg))
    total = seg[:, 4].sum() if len(seg) else 1
    l_all = hom_lines(seg) if len(seg) else None
    out = []
    while len(left) >= max(2, min_n) and len(out) < n_max:
        S = seg[left]
        wlen = S[:, 4]
        p = wlen / wlen.sum()
        best, best_w = None, 0
        for _ in range(iters):
            i, j = rng.choice(len(S), 2, replace=False, p=p)
            v = np.cross(l_all[left[i]], l_all[left[j]])
            if np.linalg.norm(v) < 1e-12:
                continue
            v = v / np.linalg.norm(v)
            w = wlen[vp_angle_err(S, v) < tol].sum()
            if w > best_w:
                best, best_w = v, w
        if best is None:
            break
        inl = vp_angle_err(S, best) < tol
        if inl.sum() < min_n or best_w / total < min_share:
            break
        v = best
        for _ in range(2):
            v2 = refine_vp(S[inl], S[inl][:, 4])
            inl2 = vp_angle_err(S, v2) < tol
            if inl2.sum() >= min_n:
                v, inl = v2, inl2
        out.append(dict(v=v, idx=left[inl], n=int(inl.sum()), share=float(S[inl][:, 4].sum() / total)))
        left = left[~inl]
    return out


def vp_xy(v):
    return None if abs(v[2]) < 1e-12 else (float(v[0] / v[2]), float(v[1] / v[2]))


def describe_vps(S, vps, W, H):
    diag = math.hypot(W, H)
    out = []
    for vp in vps:
        si = S[vp['idx']]
        p = vp_xy(vp['v'])
        ang = np.where(si[:, 5] > 90, si[:, 5] - 180, si[:, 5])
        d = dict(n=int(len(si)), share=round(vp['share'], 3), segs=si[:, :4].round(1).tolist(),
                 angle_p10_p90=[round(float(np.percentile(ang, 10)), 1), round(float(np.percentile(ang, 90)), 1)])
        if p is None or math.hypot(p[0] - W / 2, p[1] - H / 2) > 6 * diag:
            d.update(kind='parallel', direction_deg=round(float(np.median(si[:, 5])), 1))
        else:
            d.update(kind='finite', x=round(p[0], 1), y=round(p[1], 1), xf=round(p[0] / W, 3), yf=round(p[1] / H, 3),
                     inside=bool(0 <= p[0] <= W and 0 <= p[1] <= H))
        out.append(d)
    return out


def structure_vps(bgr, valid, box, seed=11):
    """A structure's vanishing points: segments inside `box`; verticals (+-3 deg) and exactly level lines (<= 1 deg:
    frontal edges) counted apart; up to 3 VPs over the sloped ones, each >= 12 % of their length."""
    H, W = bgr.shape[:2]
    seg = segments(bgr, valid, min_len_frac=0.015, roi=box)
    if not len(seg):
        return dict(n=0, vps=[])
    flat = np.minimum(seg[:, 5], 180 - seg[:, 5])
    ver = np.abs(seg[:, 5] - 90) <= 3
    lev = flat <= 1.0
    slo = ~ver & ~lev
    tot = seg[:, 4].sum()
    out = dict(n=int(len(seg)), level_share=round(float(seg[lev, 4].sum() / tot), 3), vertical_share=round(float(seg[ver, 4].sum() / tot), 3),
               sloped_share=round(float(seg[slo, 4].sum() / tot), 3), vps=[])
    S = seg[slo]
    if len(S) >= 4:
        out['vps'] = describe_vps(S, find_vps(S, seed=seed), W, H)
    V = seg[ver]
    if len(V) >= 4:
        p = vp_xy(refine_vp(V, V[:, 4]))
        out['verticals'] = dict(n=int(len(V)), converge_y=None if p is None else round(p[1]), parallel=bool(p is None or abs(p[1] - H / 2) > 6 * H))
    return out


# ================================================================= views: eye levels and camera heights

def resolve_views(cfg, structs):
    """Each view's eye-level y: a cue's y, or the mean y of the first finite VP of each named structure."""
    out = []
    for v in cfg.get('views', []):
        d = dict(zone=v['zone'])
        if 'y' in v:
            d.update(y=float(v['y']), source=v.get('cue', 'cue'))
        else:
            ys, src = [], []
            for name in v['from_']:
                fin = [p for p in structs.get(name, {}).get('vps', []) if p['kind'] == 'finite']
                if fin:
                    ys.append(fin[0]['y'])
                    src.append(f"{name}: VP ({fin[0]['x']:.0f}, {fin[0]['y']:.0f})")
            if not ys:
                continue
            d.update(y=float(np.mean(ys)), source='; '.join(src), spread=float(max(ys) - min(ys)))
        out.append(d)
    return out


def camera_height(thing, horizon):
    """Camera height (m) a thing implies under a horizon: m x (base - horizon) / (base - top); negative = its base
    stands above the eye level."""
    return thing['m'] * (thing['base'] - horizon) / max(1e-6, thing['base'] - thing['top'])


def unit_ladder(cfg):
    """Per rank: the units' px and, with their guessed real size, px per metre; k = that / the nearest rank's px per
    metre: each plane's share of a sideways float or a crane (both go as 1/distance, as drawn size does)."""
    rows = {}
    for u in cfg.get('units', []):
        if u.get('px') and u.get('m'):
            rows.setdefault(u['rank'], []).append(u['px'] / u['m'])
    if not rows:
        return {}
    near = rows[min(rows)]
    ref = float(np.median(near))
    return {int(r): dict(ppm=round(float(np.median(v)), 1), k=round(float(np.median(v)) / ref, 3)) for r, v in sorted(rows.items())}


# ================================================================= planes, the air, the ladder

def sky_air(lab, cfg, s=1.0):
    """The sky (median Lab of its boxes) and the AIR (the sky-like px of the air box: the sky's lowest open patch)."""
    sky = np.median(lab[boxmask(lab.shape, cfg['sky'], s)], 0)
    px = lab[boxmask(lab.shape, cfg['air'], s)]
    near = px[np.linalg.norm(px - sky, axis=1) < 10]
    return sky, (np.median(near, 0) if len(near) >= 30 else np.median(px, 0))


def plane_stats(lab, m, valid, sky, air, grad, lc_map):
    m = m & valid
    n = int(m.sum())
    if n < 30:
        return None
    px = lab[m]
    mean = px.mean(0)
    ys = np.nonzero(m)[0]
    hist, _ = np.histogram(px[:, 0], bins=np.arange(0, 102, 6))
    return dict(share=round(n / float(valid.sum()), 4), y0=round(float(np.percentile(ys, 2)) / lab.shape[0], 3),
                y1=round(float(np.percentile(ys, 98)) / lab.shape[0], 3), L=round(float(np.median(px[:, 0])), 1),
                C=round(float(np.median(np.hypot(px[:, 1], px[:, 2]))), 1), dE_sky=round(float(np.linalg.norm(mean - sky)), 1),
                dE_air=round(float(np.linalg.norm(mean - air)), 1), air_like=round(float((np.linalg.norm(px - air, axis=1) < 4).mean()), 3),
                edges=round(float((grad[m] > 6).mean()), 3), contrast=round(float(lc_map[m].mean()), 1),
                values=int((hist >= 0.03 * n).sum()), mean=[round(float(v), 2) for v in mean])


def _work(bgr, valid):
    """The 540 px working copy: lab, valid, colour-step map, local-contrast map, scale."""
    H0, W0 = bgr.shape[:2]
    s = W540 / W0
    small = cv2.resize(bgr, (W540, int(round(H0 * s))), interpolation=cv2.INTER_AREA)
    vs = cv2.resize(valid.astype(np.uint8), (small.shape[1], small.shape[0]), interpolation=cv2.INTER_NEAREST).astype(bool)
    lab = to_lab(small)
    L = lab[..., 0]
    return lab, vs, grad_de(lab), np.abs(L - cv2.GaussianBlur(L, (0, 0), 8)), s


def measure_planes(bgr, valid, cfg):
    lab, vs, grad, lc, s = _work(bgr, valid)
    sky, air = sky_air(lab, cfg, s)
    rows = []
    for p in cfg['planes']:
        st = plane_stats(lab, plane_mask(lab.shape, p, s), vs, sky, air, grad, lc)
        if st:
            st.update(name=p['name'], rank=p['rank'], role=p.get('role', 'env'), hero=bool(p.get('hero')))
            rows.append(st)
    sk = plane_stats(lab, boxmask(lab.shape, cfg['sky'], s), vs, sky, air, grad, lc)
    sk.update(name='sky', rank=max(p['rank'] for p in cfg['planes']) + 1, role='sky', hero=False)
    rows.append(sk)
    return dict(sky=[round(float(v), 2) for v in sky], air=[round(float(v), 2) for v in air], planes=rows)


def sheet_planes(bgr, sheet):
    """A film still on its depth sheet's planes (units 'frac' or 'px' of a 1080-wide canvas): the posters' numbers;
    ranks from the sheet's plane index (nearest = 1); the AIR = the sheet's air_hex (or its air boxes)."""
    valid = np.ones(bgr.shape[:2], bool)
    lab, vs, grad, lc, _ = _work(bgr, valid)
    h, w = lab.shape[:2]
    sx, sy = (w, h) if sheet.get('units') == 'frac' else (w / 1080, w / 1080)
    air = hexlab(sheet['air_hex']) if sheet.get('air_hex') else lab[boxmask(lab.shape, sheet.get('air'), sx, sy)].mean(0)
    sky = lab[: int(0.12 * h)].reshape(-1, 3).mean(0)
    idx = sorted({float(p.get('plane', 0)) for p in sheet.get('planes', [])})
    rows = []
    for p in sheet.get('planes', []):
        st = plane_stats(lab, plane_mask(lab.shape, dict(boxes=p.get('boxes'), poly=p.get('poly'), exclude=p.get('exclude')), sx, sy), vs, sky, air, grad, lc)
        if not st:
            continue
        nm = p['name'].lower()
        ground = p.get('role') == 'ground' or any(k in nm for k in GROUND_WORDS)
        st.update(name=p['name'], plane=float(p.get('plane', 0)), rank=idx.index(float(p.get('plane', 0))) + 1,
                  role='ground' if ground else p.get('role', 'env'), hero=p.get('role') == 'subject')
        rows.append(st)
    return dict(sky=[round(float(v), 2) for v in sky], air=[round(float(v), 2) for v in air], planes=rows)


def row_profile(bgr, valid, title=None, bands=40):
    """Per horizontal band: the share of px on a visible colour step (dE > 6 per px at 540 wide)."""
    lab, vs, grad, _, s = _work(bgr, valid)
    if title:
        vs &= ~boxmask(vs.shape, [title], s)
    h = lab.shape[0]
    out = []
    for i in range(bands):
        y0, y1 = int(i * h / bands), int((i + 1) * h / bands)
        m = vs[y0:y1]
        if m.sum() >= 50:
            out.append([round((y0 + y1) / 2 / h, 3), round(float((grad[y0:y1][m] > 6).mean()), 3)])
    return out


# ================================================================= a second opinion: a monocular depth network (optional)

def depth_net(bgr, model_path, size=518):
    """Depth Anything V2 small (ONNX) through onnxruntime: relative inverse depth scaled to 0 (far) .. 1 (near) between
    its 1st and 99th percentiles. The picture is squeezed to 518 x 518, as the export takes."""
    import onnxruntime as ort  # optional dependency
    sess = depth_net.sessions.get(model_path)
    if sess is None:
        sess = depth_net.sessions[model_path] = ort.InferenceSession(model_path, providers=['CPUExecutionProvider'])
    H, W = bgr.shape[:2]
    rgb = cv2.cvtColor(cv2.resize(bgr, (size, size), interpolation=cv2.INTER_AREA), cv2.COLOR_BGR2RGB).astype(np.float32) / 255
    x = ((rgb - np.array([0.485, 0.456, 0.406], np.float32)) / np.array([0.229, 0.224, 0.225], np.float32)).transpose(2, 0, 1)[None]
    d = cv2.resize(sess.run(None, {sess.get_inputs()[0].name: x})[0][0], (W, H), interpolation=cv2.INTER_CUBIC)
    lo, hi = np.percentile(d, 1), np.percentile(d, 99)
    return np.clip((d - lo) / max(1e-6, hi - lo), 0, 1)


depth_net.sessions = {}


def depth_layering(d, valid=None, sky_cut=0.03):
    """Over the non-sky px (d > sky_cut): `side` = the share of the depth variance found WITHIN rows (things at one
    height at different depths: frames, overlaps); 0 = depth set by height alone (a ground ramp, stacked bands).
    `range` = p95 - p5; `modes` = histogram peaks >= 0.15 of the highest."""
    m = d > sky_cut
    if valid is not None:
        m &= valid
    if m.sum() < 100:
        return dict(side=0.0, range=0.0, modes=0)
    vals = d[m]
    num, den = 0.0, 0
    for y in range(d.shape[0]):
        r = d[y][m[y]]
        if len(r) > 5:
            num += len(r) * r.var()
            den += len(r)
    hs = np.convolve(np.histogram(vals, bins=40, range=(0, 1))[0].astype(float), np.ones(3) / 3, 'same')
    modes = sum(1 for i in range(1, len(hs) - 1) if hs[i] >= hs[i - 1] and hs[i] > hs[i + 1] and hs[i] >= 0.15 * hs.max())
    return dict(side=round(float(num / max(1, den) / max(1e-9, vals.var())), 3), range=round(float(np.percentile(vals, 95) - np.percentile(vals, 5)), 3), modes=int(modes))


# ================================================================= the analysis

def analyse_poster(name, cfg, model=None):
    bgr, valid = load(os.path.join(REFS, name), os.path.join(REFS, 'ui_mask.json'))
    H, W = bgr.shape[:2]
    if cfg.get('title'):
        valid_lines = valid & ~boxmask(valid.shape, [cfg['title']])
    else:
        valid_lines = valid
    structs = {st['name']: structure_vps(bgr, valid_lines, st['box']) for st in cfg['structures']}
    views = resolve_views(cfg, structs)
    seg = segments(bgr, valid_lines)
    res = dict(file=name, city=cfg['city'], hero=cfg['hero'], size=[W, H], structures=structs, views=views,
               lines=line_stats(seg, H), planes=measure_planes(bgr, valid, cfg), rows=row_profile(bgr, valid, cfg.get('title')),
               units=cfg.get('units', []), unit_ladder=unit_ladder(cfg), hero_box=cfg.get('hero_box'))
    res['cameras'] = [dict(thing=t['name'], m=t['m'], hero=bool(t.get('hero')), note=t.get('note', ''),
                           heights={v['zone']: round(camera_height(t, v['y']), 1) for v in views}) for t in cfg.get('things', [])]
    hb = cfg.get('hero_box') or {}
    if hb:
        res['hero_frac'] = dict(top=round(hb['top'] / H, 3), base=round(hb['base'] / H, 3), height=round((hb['base'] - hb['top']) / H, 3))
    res['ground_share'] = round(sum(p['share'] for p in res['planes']['planes'] if p['role'] == 'ground'), 4)
    if model:
        d = depth_net(bgr, model)
        res['depth'] = depth_layering(d, valid)
        by_name = {p['name']: p for p in cfg['planes']}
        for row in res['planes']['planes']:
            p = by_name.get(row['name'])
            m = (plane_mask(bgr.shape, p) if p else boxmask(bgr.shape, cfg['sky'])) & valid
            row['depth'] = round(float(np.median(d[m])), 3) if m.sum() else None
        res['_depthmap'] = d
    res['_bgr'] = bgr
    return res


def film_still(spec, frames_dir):
    os.makedirs(frames_dir, exist_ok=True)
    tag = os.path.basename(spec['video']).split('.')[0]
    out = os.path.join(frames_dir, f"{tag}_t{spec['t']:.2f}.png")
    if not os.path.exists(out):
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', str(spec['t']), '-i', os.path.join(VIDEO, spec['video']), '-frames:v', '1', out], check=True)
    return out


def analyse_still(png, sheet, model=None, label=''):
    bgr = cv2.imread(png)
    if bgr is None:
        raise SystemExit(f'cannot read {png}')
    H, W = bgr.shape[:2]
    valid = np.ones((H, W), bool)
    # the caption band holds captions (text strokes are no perspective): out of the line count
    vl = valid.copy()
    vl[int(H * 290 / 1920):int(H * 600 / 1920)] = False
    seg = segments(bgr, vl)
    obl = seg[line_kinds(seg) == 'oblique'] if len(seg) else seg
    vps = describe_vps(obl, find_vps(obl, n_max=3, min_share=0.08), W, H) if len(obl) >= 4 else []
    res = dict(label=label, file=png, size=[W, H], horizon=sheet.get('horizon'), lines=line_stats(seg, H), vps=vps,
               planes=sheet_planes(bgr, sheet) if sheet.get('planes') else dict(planes=[]), rows=row_profile(bgr, valid),
               sheet_name=sheet.get('name', ''))
    res['ground_share'] = round(sum(p['share'] for p in res['planes']['planes'] if p['role'] == 'ground'), 4)
    if model:
        d = depth_net(bgr, model)
        res['depth'] = depth_layering(d)
        res['_depthmap'] = d
    res['_bgr'] = bgr
    return res


# ================================================================= drawing (sheets)
SEQ = ['#0d366b', '#104281', '#184f95', '#256abf', '#3987e5', '#6da7ec', '#9ec5f4']  # nearest (dark) -> farthest (light)
CAT = ['#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4', '#008300', '#6250d6', '#e34948']
INK, INK2, MUTED, GRID = (11, 11, 11), (78, 81, 82), (150, 150, 146), (228, 228, 224)  # BGR
HERO = '#eb6834'
NEAR_LINE, FAR_LINE = '#e34948', '#2a78d6'


def bgr_hex(h):
    h = h.lstrip('#')
    return (int(h[4:6], 16), int(h[2:4], 16), int(h[0:2], 16))


def rank_col(rank, max_rank):
    k = 0 if max_rank <= 1 else (rank - 1) / (max_rank - 1)
    return bgr_hex(SEQ[int(round(k * (len(SEQ) - 1)))])


def put(img, text, org, scale=0.5, col=INK, th=1, bg=None):
    (w, h), b = cv2.getTextSize(text, cv2.FONT_HERSHEY_SIMPLEX, scale, th)
    x, y = int(org[0]), int(org[1])
    if bg is not None:
        cv2.rectangle(img, (x - 3, y - h - 4), (x + w + 3, y + b + 2), bg, -1)
    cv2.putText(img, text, (x, y), cv2.FONT_HERSHEY_SIMPLEX, scale, col, th, cv2.LINE_AA)
    return w


def dashed(img, p0, p1, col, th=2, dash=12, gap=8):
    (x0, y0), (x1, y1) = p0, p1
    L = math.hypot(x1 - x0, y1 - y0)
    if L < 1:
        return
    ux, uy = (x1 - x0) / L, (y1 - y0) / L
    t = 0.0
    while t < L:
        t2 = min(L, t + dash)
        cv2.line(img, (int(x0 + ux * t), int(y0 + uy * t)), (int(x0 + ux * t2), int(y0 + uy * t2)), col, th, cv2.LINE_AA)
        t += dash + gap


def fade(bgr, k=0.5):
    return (bgr.astype(np.float32) * (1 - k) + 255 * k).astype(np.uint8)


def view_col(zone):
    if 'far' in zone:
        return bgr_hex(FAR_LINE)
    if 'one camera' in zone:
        return INK
    return bgr_hex(NEAR_LINE)


def vp_panel(bgr, cfg, structs, views, width=420, margin=0.36, title=''):
    """A poster faded, with side margins so the VPs just outside show: each structure's VP families in categorical
    colours (segments thick, their extension to the VP thin; a triangle at the margin = a VP beyond it), the eye levels
    dashed (near red, far blue, one camera black) with their fraction of the height."""
    H, W = bgr.shape[:2]
    s = width / W
    mw = int(round(margin * width))
    h = int(round(H * s))
    head = 34
    canvas = np.full((h + head, width + 2 * mw, 3), 255, np.uint8)
    canvas[head:, mw:mw + width] = fade(cv2.resize(bgr, (width, h), interpolation=cv2.INTER_AREA), 0.5)
    X = lambda x: int(round(mw + x * s))
    Y = lambda y: int(round(head + y * s))
    k = 0
    for st in cfg['structures']:
        for v in structs.get(st['name'], {}).get('vps', []):
            col = bgr_hex(CAT[k % len(CAT)])
            k += 1
            for x1, y1, x2, y2 in v['segs']:
                cv2.line(canvas, (X(x1), Y(y1)), (X(x2), Y(y2)), col, 2, cv2.LINE_AA)
                if v['kind'] == 'finite':
                    e = (x1, y1) if math.hypot(x1 - v['x'], y1 - v['y']) < math.hypot(x2 - v['x'], y2 - v['y']) else (x2, y2)
                    cv2.line(canvas, (X(e[0]), Y(e[1])), (X(v['x']), Y(v['y'])), col, 1, cv2.LINE_AA)
            if v['kind'] == 'finite':
                p = (X(v['x']), Y(v['y']))
                if 0 <= p[0] < canvas.shape[1] and head <= p[1] < canvas.shape[0]:
                    cv2.circle(canvas, p, 7, col, 2, cv2.LINE_AA)
                else:
                    cv2.drawMarker(canvas, (min(max(p[0], 8), canvas.shape[1] - 9), min(max(p[1], head + 8), canvas.shape[0] - 9)), col, cv2.MARKER_TRIANGLE_UP, 14, 2)
    for v in views:
        col = view_col(v['zone'])
        y = Y(v['y'])
        dashed(canvas, (0, y), (canvas.shape[1], y), col, 2)
        put(canvas, f"{v['y'] / H:.2f} H", (canvas.shape[1] - 70, y - 6), 0.5, col, 1, bg=(255, 255, 255))
    put(canvas, title, (8, 24), 0.62, INK, 1)
    return canvas


def plane_panel(bgr, cfg, width=300, title=''):
    """A poster with its planes tinted by depth rank (sequential: nearest dark, farthest light; ground and water
    hatched; the hero outlined in the hero colour)."""
    H, W = bgr.shape[:2]
    s = width / W
    h = int(round(H * s))
    head = 30
    img = cv2.resize(bgr, (width, h), interpolation=cv2.INTER_AREA)
    vis = fade(img, 0.25)
    maxr = max(p['rank'] for p in cfg['planes'])
    for p in sorted(cfg['planes'], key=lambda p: -p['rank']):
        m = plane_mask(vis.shape, p, s)
        col = np.array(rank_col(p['rank'], maxr), np.float32)
        vis[m] = (vis[m] * 0.35 + col * 0.65).astype(np.uint8)
        if p.get('role') == 'ground':
            hatch = np.zeros(m.shape, bool)
            yy, xx = np.mgrid[0:m.shape[0], 0:m.shape[1]]
            hatch[((xx + yy) % 9) < 2] = True
            vis[m & hatch] = (255, 255, 255)
        if p.get('hero'):
            cs, _ = cv2.findContours(m.astype(np.uint8), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            cv2.drawContours(vis, cs, -1, bgr_hex(HERO), 3, cv2.LINE_AA)
    out = np.full((h + head, width, 3), 255, np.uint8)
    out[head:] = vis
    put(out, title, (6, 22), 0.55, INK, 1)
    return out


def depth_panel(d, width=300, title='', valid=None):
    H, W = d.shape[:2]
    h = int(round(H * width / W))
    head = 30
    col = cv2.applyColorMap((cv2.resize(d, (width, h)) * 255).astype(np.uint8), cv2.COLORMAP_VIRIDIS)
    out = np.full((h + head, width, 3), 255, np.uint8)
    out[head:] = col
    put(out, title, (6, 22), 0.5, INK, 1)
    return out


def film_panel(r, width=300, title=''):
    """A film still faded, with its visible lines (level grey, vertical light, receding in the VP families' colours)
    and the sheet's horizon dashed."""
    bgr = r['_bgr']
    H, W = bgr.shape[:2]
    s = width / W
    h = int(round(H * s))
    head = 30
    vis = fade(cv2.resize(bgr, (width, h), interpolation=cv2.INTER_AREA), 0.45)
    vl = np.ones((H, W), bool)
    vl[int(H * 290 / 1920):int(H * 600 / 1920)] = False
    seg = segments(bgr, vl)
    if len(seg):
        kinds = line_kinds(seg)
        for sgm, kd in zip(seg, kinds):
            col = (120, 120, 120) if kd == 'level' else (190, 190, 190) if kd == 'vertical' else (60, 60, 60)
            cv2.line(vis, (int(sgm[0] * s), int(sgm[1] * s)), (int(sgm[2] * s), int(sgm[3] * s)), col, 1, cv2.LINE_AA)
    for k, v in enumerate(r.get('vps', [])):
        col = bgr_hex(CAT[k % len(CAT)])
        for x1, y1, x2, y2 in v['segs']:
            cv2.line(vis, (int(x1 * s), int(y1 * s)), (int(x2 * s), int(y2 * s)), col, 2, cv2.LINE_AA)
        if v['kind'] == 'finite' and 0 <= v['x'] <= W and 0 <= v['y'] <= H:
            cv2.circle(vis, (int(v['x'] * s), int(v['y'] * s)), 6, col, 2, cv2.LINE_AA)
    if r.get('horizon'):
        dashed(vis, (0, int(r['horizon'] * s)), (width, int(r['horizon'] * s)), INK, 1)
        put(vis, f"{r['horizon'] / H:.2f} H", (width - 64, int(r['horizon'] * s) - 5), 0.45, INK, 1, bg=(255, 255, 255))
    out = np.full((h + head, width, 3), 255, np.uint8)
    out[head:] = vis
    put(out, title, (6, 22), 0.5, INK, 1)
    return out


def tile(panels, cols, gap=12, bg=255):
    rows = [panels[i:i + cols] for i in range(0, len(panels), cols)]
    pw = max(p.shape[1] for p in panels)
    rh = [max(p.shape[0] for p in r) for r in rows]
    out = np.full((sum(rh) + gap * (len(rows) - 1), cols * pw + gap * (cols - 1), 3), bg, np.uint8)
    y = 0
    for r, hh in zip(rows, rh):
        x = 0
        for p in r:
            out[y:y + p.shape[0], x:x + p.shape[1]] = p
            x += pw + gap
        y += hh + gap
    return out


def legend_panel(lines, w, h, title='How to read'):
    out = np.full((h, w, 3), 255, np.uint8)
    put(out, title, (12, 34), 0.7, INK, 2)
    y = 70
    for item in lines:
        if isinstance(item, tuple):
            kind, col, text = item
            if kind == 'dash':
                dashed(out, (14, y - 6), (70, y - 6), col, 2)
            elif kind == 'line':
                cv2.line(out, (14, y - 6), (70, y - 6), col, 3, cv2.LINE_AA)
            elif kind == 'dot':
                cv2.circle(out, (42, y - 6), 8, col, -1, cv2.LINE_AA)
            elif kind == 'ring':
                cv2.circle(out, (42, y - 6), 9, col, 3, cv2.LINE_AA)
            elif kind == 'tri':
                cv2.drawMarker(out, (42, y - 4), col, cv2.MARKER_TRIANGLE_UP, 14, 2)
            put(out, text, (84, y), 0.5, INK2, 1)
        else:
            put(out, item, (14, y), 0.5, INK2, 1)
        y += 30
    return out


def cap_size(img, long_side=2400):
    h, w = img.shape[:2]
    k = min(1.0, long_side / max(h, w))
    return img if k >= 1 else cv2.resize(img, (int(w * k), int(h * k)), interpolation=cv2.INTER_AREA)


def save_jpg(path, img):
    os.makedirs(os.path.dirname(os.path.abspath(path)), exist_ok=True)
    cv2.imwrite(path, cap_size(img), [cv2.IMWRITE_JPEG_QUALITY, 85])
    return path


# ---------------------------------------------------------------- the depth-ladder chart

def ladder_chart(posters, films, out):
    """Small multiples, one row per picture: each plane a dot (nearest dark -> farthest light; a ring = ground or water;
    an outer ring in the hero colour = the hero or the subject's plane), the planes of a row joined in depth order.
    Panels: dE76 to the air (CRAFT §f.1), visible-edge share, L*. The sky is left out (it is the air)."""
    rows = [(f"{r['city']}", r['planes']['planes']) for r in posters]
    rows.append(None)
    rows += [(f"{r['label']}", r['planes']['planes']) for r in films if r['planes']['planes']]
    panels = [('dE76 to the air', 'dE_air', 0, 65, [0, 10, 20, 30, 40, 50, 60]), ('visible-edge share (detail)', 'edges', 0, 0.85, [0, 0.2, 0.4, 0.6, 0.8]),
              ('L* (value)', 'L', 25, 95, [30, 50, 70, 90])]
    lab_w, pw, gap, rh, top = 250, 640, 40, 46, 150
    W = lab_w + len(panels) * pw + (len(panels) - 1) * gap + 40
    n = len(rows)
    Hh = top + n * rh + 120
    img = np.full((Hh, W, 3), 255, np.uint8)
    put(img, 'Depth ladder: each plane of each picture, nearest (dark) to farthest (light)', (20, 44), 0.95, INK, 2)
    put(img, 'posters above the line, our films below (planes from their depth sheets); the sky is the air, left out; ring = ground or water; orange ring = hero / subject plane', (20, 80), 0.55, INK2, 1)
    for pi, (ttl, key, lo, hi, ticks) in enumerate(panels):
        x0 = lab_w + pi * (pw + gap)
        put(img, ttl, (x0, top - 28), 0.62, INK, 1)
        for t in ticks:
            x = int(x0 + (t - lo) / (hi - lo) * pw)
            cv2.line(img, (x, top - 10), (x, top + n * rh), GRID, 1)
            put(img, f'{t:g}', (x - 10, top + n * rh + 24), 0.48, INK2, 1)
        for ri, row in enumerate(rows):
            yc = top + ri * rh + rh // 2
            if row is None:
                cv2.line(img, (x0 - 4, yc), (x0 + pw, yc), MUTED, 1)
                continue
            name, planes = row
            pts = [p for p in planes if p['role'] != 'sky' and p.get(key) is not None]
            if not pts:
                continue
            maxr = max(p['rank'] for p in pts)
            pts = sorted(pts, key=lambda p: (p['rank'], p['name']))
            xy = [(int(x0 + (min(max(p[key], lo), hi) - lo) / (hi - lo) * pw), yc) for p in pts]
            for a, b in zip(xy[:-1], xy[1:]):
                cv2.line(img, a, (b[0], yc), (200, 200, 196), 1, cv2.LINE_AA)
            for p, (x, y) in zip(pts, xy):
                col = rank_col(p['rank'], maxr)
                if p['role'] == 'ground':
                    cv2.circle(img, (x, y), 8, col, 3, cv2.LINE_AA)
                else:
                    cv2.circle(img, (x, y), 9, (255, 255, 255), -1, cv2.LINE_AA)
                    cv2.circle(img, (x, y), 8, col, -1, cv2.LINE_AA)
                if p.get('hero'):
                    cv2.circle(img, (x, y), 13, bgr_hex(HERO), 2, cv2.LINE_AA)
            if pi == 0:
                put(img, name, (20, yc + 6), 0.55, INK, 1)
    # legend
    ly = top + n * rh + 70
    lx = lab_w
    put(img, 'depth rank:', (lx, ly), 0.52, INK2, 1)
    for i, c in enumerate(SEQ):
        cv2.circle(img, (lx + 130 + i * 28, ly - 6), 9, bgr_hex(c), -1, cv2.LINE_AA)
    put(img, 'nearest', (lx + 120, ly + 24), 0.45, INK2, 1)
    put(img, 'farthest', (lx + 270, ly + 24), 0.45, INK2, 1)
    cv2.circle(img, (lx + 420, ly - 6), 8, bgr_hex(SEQ[3]), 3, cv2.LINE_AA)
    put(img, 'ground / water', (lx + 438, ly), 0.52, INK2, 1)
    cv2.circle(img, (lx + 620, ly - 6), 8, bgr_hex(SEQ[3]), -1, cv2.LINE_AA)
    cv2.circle(img, (lx + 620, ly - 6), 13, bgr_hex(HERO), 2, cv2.LINE_AA)
    put(img, 'hero (posters) / subject plane (films)', (lx + 642, ly), 0.52, INK2, 1)
    return save_jpg(out, img)


# ---------------------------------------------------------------- the 9:16 mapping diagram

def diagram_916(posters, films, out):
    """Left: the posters' measured vertical structure (median and range, as fractions of their height). Right: the same
    bands placed in a 1080 x 1920 frame under our screen zones (G5_BLOCKING §2), with v2's horizons for comparison."""
    def med(vals):
        vals = [v for v in vals if v is not None]
        return (float(np.median(vals)), float(min(vals)), float(max(vals))) if vals else None
    hero_top = med([r['hero_frac']['top'] for r in posters if r.get('hero_frac')])
    far = med([v['y'] / r['size'][1] for r in posters for v in r['views'] if 'far' in v['zone'] or 'one camera' in v['zone']])
    near = med([v['y'] / r['size'][1] for r in posters for v in r['views'] if ('near' in v['zone'] or 'one camera' in v['zone'] or 'mid' in v['zone']) and 'veranda' not in v['zone']])
    frame_top = med([min(p['y0'] for p in r['planes']['planes'] if p['rank'] == 1) for r in posters])
    sky_bot = med([min(p['y0'] for p in r['planes']['planes'] if p['role'] != 'sky') for r in posters])
    W, H = 1700, 1180
    img = np.full((H, W, 3), 255, np.uint8)
    put(img, 'From the posters to 9:16: where the bands go', (24, 46), 0.95, INK, 2)
    put(img, 'left: the seven posters (median, range bar), as fractions of their height; right: the same bands in our 1080 x 1920 frame', (24, 80), 0.55, INK2, 1)
    # poster column
    px0, py0, ph = 120, 140, 900
    pw = int(ph * 0.75)
    cv2.rectangle(img, (px0, py0), (px0 + pw, py0 + ph), MUTED, 1)
    bands = [('top of the skyline', sky_bot, MUTED), ('hero top', hero_top, bgr_hex(HERO)), ('far horizon', far, bgr_hex(FAR_LINE)),
             ('near eye level', near, bgr_hex(NEAR_LINE)), ('near frame top', frame_top, bgr_hex(SEQ[0]))]
    for name, b, col in bands:
        if not b:
            continue
        m, lo, hi = b
        y = int(py0 + m * ph)
        cv2.line(img, (px0, y), (px0 + pw, y), col, 2, cv2.LINE_AA)
        cv2.line(img, (px0 - 30, int(py0 + lo * ph)), (px0 - 30, int(py0 + hi * ph)), col, 4)
        put(img, f'{name} {m:.2f} ({lo:.2f}-{hi:.2f})', (px0 + 8, y - 8), 0.5, col, 1, bg=(255, 255, 255))
    put(img, 'poster (3:4)', (px0, py0 + ph + 30), 0.55, INK2, 1)
    # 9:16 column: zones
    fx0, fy0, fh = 1020, 140, 900
    fw = int(fh * 1080 / 1920)
    S = fh / 1920
    Y = lambda y: int(fy0 + y * S)
    overlay = img.copy()
    cv2.rectangle(overlay, (fx0, Y(0)), (fx0 + fw, Y(180)), (225, 225, 225), -1)
    cv2.rectangle(overlay, (fx0, Y(1520)), (fx0 + fw, Y(1920)), (225, 225, 225), -1)
    cv2.rectangle(overlay, (fx0 + int(950 * S), Y(900)), (fx0 + fw, Y(1500)), (225, 225, 225), -1)
    cv2.rectangle(overlay, (fx0, Y(290)), (fx0 + fw, Y(600)), (250, 236, 214), -1)
    img = cv2.addWeighted(overlay, 0.8, img, 0.2, 0)
    cv2.rectangle(img, (fx0, fy0), (fx0 + fw, fy0 + fh), MUTED, 1)
    put(img, 'platform UI (top)', (fx0 + 8, Y(120)), 0.42, INK2, 1)
    put(img, 'caption band 290-600', (fx0 + 8, Y(460)), 0.45, INK2, 1)
    put(img, 'platform UI (bottom) > 1520', (fx0 + 8, Y(1880)), 0.42, INK2, 1)
    put(img, 'rail', (fx0 + int(960 * S), Y(1200)), 0.4, INK2, 1)
    # mapping: the poster's hero top -> y 620 (under the caption band), the bottom -> 1920, linear between
    ht = hero_top[0] if hero_top else 0.33
    f2y = lambda f: 620 + (f - ht) / (1 - ht) * 1300
    for name, b, col in bands[1:]:
        if not b:
            continue
        y916 = f2y(b[0])
        cv2.line(img, (fx0, Y(y916)), (fx0 + fw, Y(y916)), col, 2, cv2.LINE_AA)
        put(img, f'{name}: y {y916:.0f} ({y916 / 1920:.2f} H)', (fx0 + fw + 14, Y(y916) + 5), 0.5, col, 1)
        dashed(img, (px0 + pw + 4, int(py0 + b[0] * ph)), (fx0 - 4, Y(y916)), col, 1, 8, 8)
    # v2's horizons
    for r in films:
        if r['label'].startswith('v2') and r.get('horizon'):
            y = Y(r['horizon'])
            cv2.line(img, (fx0 - 26, y), (fx0 - 6, y), INK, 2)
            put(img, r['label'].split(' @')[0].replace('v2 ', ''), (fx0 - 70, y + 5), 0.42, INK, 1)
    put(img, "v2's horizons", (fx0 - 120, Y(640)), 0.45, INK, 1)
    put(img, '9:16 (1080 x 1920)', (fx0, fy0 + fh + 30), 0.55, INK2, 1)
    return save_jpg(out, img)


# ================================================================= CLI

def strip(r):
    return {k: v for k, v in r.items() if not k.startswith('_')}


def run_all(args):
    model = args.model if args.model and os.path.exists(args.model) else None
    posters = []
    for name, cfg in POSTERS.items():
        print(f'poster {name} ...', file=sys.stderr)
        posters.append(analyse_poster(name, cfg, model))
    films = []
    for label, spec in FILMS.items():
        print(f'still {label} ...', file=sys.stderr)
        png = film_still(spec, args.frames_dir)
        films.append(analyse_still(png, json.load(open(os.path.join(VIDEO, spec['sheet']))), model, label))
    json.dump(dict(posters=[strip(r) for r in posters], films=[strip(r) for r in films], model=bool(model)), open(args.json, 'w'), indent=1)
    if args.img_dir:
        d = args.img_dir
        vps = [vp_panel(r['_bgr'], POSTERS[r['file']], r['structures'], r['views'], title=r['city']) for r in posters]
        vps.append(legend_panel([
            'Each colour = one family of lines',
            'meeting at one vanishing point:',
            ('line', bgr_hex(CAT[0]), 'its segments (thick)'),
            ('line', bgr_hex(CAT[1]), 'drawn on to the VP (thin)'),
            ('tri', INK2, 'a VP beyond the margin'),
            ('dash', bgr_hex(NEAR_LINE), 'near eye level (a VP height)'),
            ('dash', bgr_hex(FAR_LINE), "far horizon (water's far edge)"),
            ('dash', INK, 'one camera for the whole poster'),
            'Fractions = of the poster height.',
            'Lines: LSD, visible (dE >= 6 across);',
            'VPs: RANSAC per structure box.'], vps[0].shape[1], vps[0].shape[0]))
        save_jpg(os.path.join(d, 'perspective_vps.jpg'), tile(vps, 4))
        pp = []
        for r in posters:
            pan = plane_panel(r['_bgr'], POSTERS[r['file']], title=f"{r['city']}: planes")
            if model:
                dp = depth_panel(r['_depthmap'], title=f"overlap share {r['depth']['side']:.2f}")
                pan = np.hstack([pan, np.full((pan.shape[0], 8, 3), 255, np.uint8), cv2.resize(dp, (dp.shape[1], pan.shape[0]))])
            pp.append(pan)
        save_jpg(os.path.join(d, 'perspective_planes.jpg'), tile(pp, 4))
        fp = []
        for r in films:
            if r['label'] in ('v2 S1 @5.2', 'v2 S2 @11.0', 'v2 S4 @17.0', 'v2 S6 @25.0', 'v1 @10.0', 'v1 @38.5'):
                pan = film_panel(r, title=r['label'])
                if model:
                    dp = depth_panel(r['_depthmap'], title=f"overlap share {r['depth']['side']:.2f}")
                    pan = np.hstack([pan, np.full((pan.shape[0], 8, 3), 255, np.uint8), cv2.resize(dp, (dp.shape[1], pan.shape[0]))])
                fp.append(pan)
        save_jpg(os.path.join(d, 'perspective_films.jpg'), tile(fp, 3))
        ladder_chart(posters, films, os.path.join(d, 'perspective_ladder.jpg'))
        diagram_916(posters, films, os.path.join(d, 'perspective_916.jpg'))
    print(f'wrote {args.json}', file=sys.stderr)


def run_frame(args):
    model = args.model if args.model and os.path.exists(args.model) else None
    sheet = json.load(open(args.sheet)) if args.sheet else {}
    r = analyse_still(args.image, sheet, model, os.path.basename(args.image))
    print(json.dumps(strip(r), indent=1, default=lambda o: None)[:20000])


def main():
    ap = argparse.ArgumentParser(description=__doc__.split('\n')[0])
    sub = ap.add_subparsers(dest='cmd', required=True)
    a = sub.add_parser('all', help='the seven posters and our films\' stills: numbers and sheets')
    a.add_argument('--json', default='/tmp/posters-perspective/perspective.json')
    a.add_argument('--img-dir', default='')
    a.add_argument('--frames-dir', default='/tmp/posters-perspective/frames')
    a.add_argument('--model', default='', help='Depth Anything V2 small ONNX (optional)')
    f = sub.add_parser('frame', help='one still (+ its depth sheet)')
    f.add_argument('image')
    f.add_argument('--sheet', default='')
    f.add_argument('--model', default='')
    args = ap.parse_args()
    {'all': run_all, 'frame': run_frame}[args.cmd](args)


if __name__ == '__main__':
    main()
