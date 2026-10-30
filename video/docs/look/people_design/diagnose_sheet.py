#!/usr/bin/env python3
"""Builds diagnose_sheet.png (next to this file): every person we have drawn, cropped and scaled to the same figure
height, side by side, grouped by source and tagged with the causes ranked in diagnose.md.

    python3 docs/look/people_design/diagnose_sheet.py            # from video/; work files in out/people_design/
    python3 docs/look/people_design/diagnose_sheet.py --work DIR --out PATH

Sources (all in the repo): the masters of v1, v2 and v3 and the v3 G5b draft (`deliverables/`; full-res frames are
extracted with ffmpeg into the work dir), the v2r cast sheet (`KitCast`, src/entry-v2r-cast.tsx) and the first v2
kit sheet (`KitSheet2`, src/entry-v2-kit.tsx: the faces), both rendered 1:1 with Remotion into the work dir if
missing, the painted still v6, the people sheet, the archived v2 G4 desk still, and the owner's references
(refs_human_scale/, assets/ref/ = reference 1). Missing work files are made once; the build itself is pure Pillow
and deterministic. Fonts: Inter (/usr/share/fonts/opentype/inter).
"""
import argparse
import os
import subprocess
import sys

import numpy as np
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
VIDEO = os.path.abspath(os.path.join(HERE, '..', '..', '..'))  # video/
V6 = f'{VIDEO}/docs/studies/2026-10-28_city_posters/paint_test/paint_still_v6.png'
SHEET = f'{VIDEO}/docs/look/paint_recipes/people_sheet.png'
REFS = f'{VIDEO}/docs/look/refs_human_scale'
REF1 = f'{VIDEO}/assets/ref'
DESK = f'{VIDEO}/docs/v2/archive/restart_2026-10-27/g4/desk_B.png'
MASTERS = {
    'v1': f'{VIDEO}/deliverables/v1/php2shell_final.mp4',
    'v2': f'{VIDEO}/deliverables/v2/v2r_G7_master_v1.mp4',
    'v3': f'{VIDEO}/deliverables/v3/v3_final.mp4',
    'v3g5b': f'{VIDEO}/deliverables/v3/v3_g5b.mp4',
}
FRAMES = {'v1': [1, 18, 21, 23, 36], 'v2': [2, 5.2, 9, 17.5, 36], 'v3': [1, 22], 'v3g5b': [7, 9.5, 19.5, 24]}
RENDERS = {  # file: (entry, composition, frame)
    'kitcast.png': ('src/entry-v2r-cast.tsx', 'KitCast', 0),
    'kitsheet2.png': ('src/entry-v2-kit.tsx', 'KitSheet2', 90),
}

FIG_H = 300   # every full figure is scaled to this height (head top to feet)
CAP_H = 112   # the caption block under each cell
GAP = 18
SHEET_W = 3560
MARGIN = 40

FONT_DIR = '/usr/share/fonts/opentype/inter/'


def font(name, size):
    return ImageFont.truetype(FONT_DIR + name, size)


INK = (43, 30, 34)
MUTED = (110, 96, 100)
RED = (196, 40, 52)
BG = (246, 241, 236)
CELLBG = (255, 255, 255)

# The causes, ranked in diagnose.md (the number IS the rank).
CAUSES = {1: 'BODY', 2: 'CLOTHES', 3: 'HAIR', 4: 'COLOUR', 5: 'POSE', 6: 'RENDER', 7: 'FACE', 8: 'DETAIL', 9: 'TELLS'}
TAGC = {1: (196, 40, 52), 2: (200, 96, 28), 3: (150, 92, 20), 4: (40, 120, 110), 5: (60, 110, 40), 6: (70, 70, 150),
        7: (160, 50, 120), 8: (110, 80, 60), 9: (90, 90, 90)}
LEGEND = [
    (1, "BODY: a toddler's or a toy's body under adult clothes: 3.7-4.9 heads (refs 6.7-7.4; 4-5 heads is a 1-3-year-old's ratio), a compass-circle head 0.8x the shoulders' width (refs ~0.4x) with ears stuck out, no neck, a tombstone torso, 0.2-0.34 H of leg, bar limbs, puck feet, mittens."),
    (2, 'CLOTHES: no fashion: one generic sack coat + two leg tubes on everyone, no fabric, drape or fit; the garments that do read are 2010s or older (trench + back bow, belted A-line coat + tights + ankle boots, apron, lanyard, panama, pom-pom, earmuffs, cable knit).'),
    (3, 'HAIR: balls and helmets in one flat colour (a comb-line bowl cut, a bun as a 2nd ball, a bumpy curls circle, a straight curtain, a carrot ponytail); silver, balding and granny-bun heads; teal hair; no current cut. From behind, the hair is the main cue.'),
    (4, "COLOUR: dressed in the set's paint (all of v1's coats and its skin = wall tokens; 8 of v2r's 11 coats and all 5 skins = facade, paving, leaf, window and caption tokens): dusty mid-tones, skin like plaster or brick (hue 40-43), no black / white / denim / grey base; a patchwork, never one value shape."),
    (5, 'POSE: stiff tokens: upright, symmetric, feet together, arms hidden inside the coat (v2r backs) or one straight tube; clones in lockstep; no weight shift, no attitude (a pocket, a strap, a phone, a coffee).'),
    (6, 'RENDER: a clip-art finish: thick uniform dark outlines (~1.5-3 % of the height: v1, v2 first pass, v3), pure-white rim strips, ruled quilting; v2r flat and lightless; the refined her a crisp vector sticker inside a painted world.'),
    (7, 'FACE: when shown, dot eyes + a C-nose + one mouth line (the 2018-21 corporate flat / emoji face) on a circle; a profile = a skin crescent cut out of the hair ball (a mask).'),
    (8, 'DETAIL: spent on icons (badges, backpack rectangles, bows, a plant, a clipboard, headphone discs, a pencil in a bun) instead of the hair shape, the garment silhouette, trouser width + shoe, one bag shape.'),
    (9, 'TELLS: cheap artifacts: the headless walker under the arch (v6), split stick legs, 9 identical ghosts in lockstep, a third of the frame filled with balloon heads (v1).'),
]


def frame_name(film, t):
    return f'{film}_t{t:g}.png'


def prepare(work):
    """Extracts the master frames and renders the two kit sheets into `work` (only what is missing)."""
    os.makedirs(work, exist_ok=True)
    for film, times in FRAMES.items():
        for t in times:
            out = os.path.join(work, frame_name(film, t))
            if not os.path.exists(out):
                subprocess.run(['nice', '-n', '10', 'ffmpeg', '-v', 'error', '-threads', '1', '-ss', f'{t:g}', '-i',
                                MASTERS[film], '-frames:v', '1', out], check=True)
    for name, (entry, comp, frame) in RENDERS.items():
        out = os.path.join(work, name)
        if not os.path.exists(out):
            subprocess.run(['nice', '-n', '10', 'npx', 'remotion', 'still', entry, comp, out, f'--frame={frame}',
                            '--scale=1', '--gl=angle', '--concurrency=1'], check=True, cwd=VIDEO)


def items(work):
    """The sections and their crops. Each item: id, src, box (x0, y0, x1, y1) in src px, mode, caption lines, causes,
    heads = (head top, head bottom, feet) in src px (draws the red lines and the heads count) and sil (fill black).
    mode: ('fig', h) scales a figure h px tall to FIG_H; ('cut',) scales the box height to FIG_H (figures cut by the
    frame, waist-up, hands); ('fit', h) scales the box height to h; ('scale', k) scales by k (the native-size row)."""
    fr = lambda film, t: os.path.join(work, frame_name(film, t))
    kc = os.path.join(work, 'kitcast.png')
    ks2 = os.path.join(work, 'kitsheet2.png')
    S, SECTIONS = [], []

    def section(title, note):
        SECTIONS.append(dict(title=title, note=note, start=len(S)))

    def item(i, src, box, mode, cap, causes, heads=None, sil=False):
        S.append(dict(id=i, src=src, box=box, mode=mode, cap=cap, causes=sorted(causes), heads=heads, sil=sil))

    section('A. v1 "PHP2Shell" (posted 25 Oct): the kit Person',
            'src/lib/kit/Person.tsx via src/scenes/shared/props/Figures.tsx (v3 People3.tsx reuses it). Final master, 1080 x 1920.')
    item('A1', fr('v1', 1), (254, 1440, 350, 1614), ('fig', 150), ['v1 1.0 s | 150 px', 'bun + backpack icon', 'legs 0.31 H, torso 0.45 H'], [1, 2, 4, 6, 8], (1458, 1492, 1608))
    item('A2', fr('v1', 1), (664, 1448, 758, 1606), ('fig', 150), ['v1 1.0 s | 150 px', 'cream bell coat + strap,', 'curly ball head, teal shoes'], [1, 2, 5, 6])
    item('A3', fr('v1', 18), (30, 1372, 148, 1566), ('fig', 168), ['v1 18.0 s | 168 px', 'lanyard badge, clipboard', 'mitten hand'], [1, 2, 6, 8], (1394, 1430, 1562))
    item('A4', fr('v1', 18), (190, 1290, 362, 1566), ('fig', 175), ['v1 18.0 s', 'backpack, raised tube arm', 'sparkle tablet'], [1, 5, 6, 8])
    item('A5', fr('v1', 18), (446, 1296, 586, 1566), ('fig', 174), ['v1 18.0 s', 'carrot ponytail', 'raised tube arm'], [1, 3, 5, 6])
    item('A6', fr('v1', 18), (636, 1374, 784, 1566), ('fig', 176), ['v1 18.0 s', 'hands on hips, strap', 'lanyard badge'], [1, 2, 6, 8])
    item('A7', fr('v1', 21), (384, 1134, 474, 1276), ('fig', 130), ['v1 21.0 s | 130 px', 'pom-pom beanie walker', 'legs 0.20 H'], [1, 2, 3, 5], (1146, 1190, 1270))
    item('A8', fr('v1', 21), (470, 1232, 722, 1542), ('fig', 295), ['v1 21.0 s | 295 px', 'messenger bag on a strap', 'arm = one tube'], [1, 2, 6])
    item('A9', fr('v1', 36), (558, 1106, 660, 1302), ('fig', 180), ['v1 36.0 s | 174 px', 'apron + bow, top bun', 'two leg bars'], [1, 2, 3, 5], (1122, 1165, 1296))
    item('A10', fr('v1', 1), (408, 1606, 678, 1920), ('cut',), ['v1 1.0 s | near back (cut)', 'comb-line bowl cut', 'ears stuck out, hood'], [1, 3, 6])
    item('A11', fr('v1', 18), (250, 1336, 1080, 1920), ('cut',), ['v1 18.0 s | near crowd (cut)', 'panama hat, pom-pom,', 'curly ball: balloon heads'], [2, 3, 9])
    item('A12', fr('v1', 23), (60, 1250, 262, 1920), ('cut',), ['v1 23.0 s | near back (cut)', 'top knot + long coat', '+ strap'], [2, 3])

    section('B. v2 "One Small Window" (G7 master, 28 Oct): the v2r cast',
            'src/v2r/kit/cast (People.tsx, parts.tsx, body.ts, traits.ts). Film frames + the KitCast sheet rendered 1:1.')
    item('B1', fr('v2', 2), (596, 912, 684, 1098), ('fig', 172), ['v2 2.0 s | 172 px', 'her: ball head + bun,', 'box coat, tote, plant'], [1, 3, 5, 8], (920, 958, 1092))
    item('B2', fr('v2', 17.5), (688, 886, 760, 1072), ('fig', 175), ['v2 17.5 s | 175 px', 'profile = skin crescent', 'cut out of a ball'], [1, 3, 7], (893, 936, 1068))
    item('B3', fr('v2', 9), (86, 1030, 170, 1300), ('fig', 258), ['v2 9.0 s | 258 px', 'capsule coat, inner pill', 'arm, dot hand'], [1, 5], (1037, 1098, 1295))
    item('B4', fr('v2', 36), (6, 1024, 168, 1270), ('fig', 235), ['v2 36.0 s | 235 px', 'blonde top bun,', 'arm = straight tube'], [1, 3, 5])
    item('B5', fr('v2', 9), (586, 1104, 824, 1252), ('cut',), ['v2 9.0 s | bench pair', 'circle heads, ears out,', 'hoodie cord = mustard arc'], [1, 3])
    item('B6', fr('v2', 5.2), (34, 918, 546, 1082), ('fig', 152), ['v2 5.2 s | ghost row, 9 clones', 'trench + back bow x 9,', 'one stance in lockstep'], [2, 5, 9])
    item('B7', kc, (66, 2648, 198, 2962), ('fig', 300), ['KitCast | LOD 300 px', 'silver ball + ears,', 'armless sack coat'], [1, 3], (2658, 2725, 2958))
    item('B8', kc, (1100, 3012, 1300, 3222), ('cut',), ['KitCast | bench, 190 px', 'reporter + staffer:', 'two balls on two sacks'], [1, 3])
    item('B9', kc, (4, 2090, 646, 2258), ('fig', 150), ['KitCast | the public, 150 px (7 of 12)', 'tombstone coats, no arms,', 'two bars + pucks'], [1, 2, 3, 4, 5])
    item('B10', kc, (1100, 2236, 2152, 2562), ('cut',), ['KitCast | near row (cut)', 'hood, pom beanie, silver,', 'curls ball, balding crown'], [1, 2, 3])
    item('B11', kc, (1858, 3608, 2022, 3804), ('fig', 170), ['KitCast | cafe owner 170', 'apron + bow, top bun,', 'arm = tube + puck'], [2, 3, 5])

    section('C. Faces and hands we drew: v2 first pass, v3 G5b draft, v3 final',
            'src/v2/film/kit/Her.tsx (KitSheet2 rendered 1:1; archived G4 desk_B), src/v3/film/kit/You.tsx + People3.tsx (v3_g5b.mp4; its timecode is the draft burn-in), v3_final.mp4.')
    item('C1', ks2, (212, 470, 314, 808), ('fig', 322), ['v2 first | her, P2', 'dot eyes, brow dashes,', 'mouth line; mitten hands'], [1, 6, 7], (478, 548, 800))
    item('C2', ks2, (746, 470, 1076, 748), ('cut',), ['v2 first | staffers, P3', 'shocked face + lanyard;', 'bald, glasses, moustache'], [2, 3, 7])
    item('C3', ks2, (732, 2384, 968, 2702), ('cut',), ['v2 first | her, P6', 'the worried face', '(2018-21 corporate flat)'], [6, 7])
    item('C4', DESK, (0, 1010, 600, 1920), ('cut',), ['v2 G4 desk_B (archived)', 'noodle arm, fist of', 'sausage fingers'], [1, 6])
    item('C5', fr('v3', 1), (170, 1290, 900, 1920), ('cut',), ['v3 final 1.0 s | POV hands', 'giant finger + oval nail,', 'stacked sausage fingers'], [1, 4, 6])
    item('C6', fr('v3g5b', 9.5), (40, 700, 720, 1400), ('cut',), ['v3 G5b 9.5 s | "you"', 'dot eyes, C-nose, smile,', 'ears, mitten hands'], [1, 6, 7])
    item('C7', fr('v3g5b', 9.5), (0, 1200, 300, 1920), ('cut',), ['v3 G5b 9.5 s | near back', 'pencil through a bun,', 'puffer + lanyard'], [2, 3, 8])
    item('C8', fr('v3g5b', 7), (0, 1440, 860, 1920), ('cut',), ['v3 G5b 7.0 s | back row', 'ruled puffers, earmuffs,', 'pom-poms, white rim strips'], [2, 6, 8])
    item('C9', fr('v3g5b', 24), (440, 1440, 1060, 1920), ('cut',), ['v3 G5b 24.0 s | crowd', 'a raised arm as one', 'straight tube'], [5, 6])
    item('C10', fr('v3g5b', 19.5), (200, 1040, 820, 1920), ('cut',), ['v3 G5b 19.5 s | "you" back', 'cable knit, thick outline'], [1, 6])
    item('C11', fr('v3', 22), (515, 1062, 600, 1116), ('fit', 180), ['v3 final 22.0 s | ~50 px', 'hi-vis workers (x6)'], [8])

    section('D. The latest: the refined her (src/lib/figure) in the painted still v6 and on the people sheet',
            'paint_test/paint_still_v6.png (1080 x 1920) and paint_recipes/people_sheet.png (her at 640 px).')
    item('D1', V6, (648, 920, 714, 1086), ('fig', 155), ['v6 | 155 px', 'refined her: belted A-line', 'coat, tights, low bun'], [2, 3, 4, 5, 6], (925, 950, 1080))
    item('D2', V6, (916, 934, 1012, 1036), ('fit', 200), ['v6 | man on the boat', 'ball head + beanie band,', 'sweater = one blob'], [1, 3])
    item('D3', V6, (184, 994, 242, 1048), ('fit', 200), ['v6 | walker under the arch', 'head hidden by the arch,', 'legs split ~70 deg, no knees'], [5, 9])
    item('D4', V6, (24, 902, 74, 966), ('fit', 200), ['v6 | bridge walker 48 px', 'grey ball head,', 'two sticks'], [1, 3])
    item('D5', V6, (212, 902, 262, 966), ('fit', 200), ['v6 | bridge walker 46 px', 'cap + cream top', '(the old kit look)'], [2, 4])
    item('D6', SHEET, (1010, 204, 1244, 862), ('fig', 632), ['sheet | current her 640', '4.8 heads, box coat,', 'straight seam split'], [1, 3, 6, 8], (208, 340, 840))
    item('D7', SHEET, (1268, 200, 1562, 862), ('fig', 630), ['sheet | refined her 640', '6.6 heads: neat, but a', '2014 lookbook coat'], [2, 3, 4, 5], (205, 300, 835))
    item('D8', SHEET, (438, 1210, 762, 1884), ('fig', 640), ['sheet | rear 3/4', 'arms hang straight,', 'no weight shift'], [2, 5])
    item('D9', SHEET, (756, 1224, 1180, 1884), ('fig', 640), ['sheet | walking profile', 'the best view: gait,', 'neck, small head'], [2])
    item('D10', SHEET, (1216, 1210, 1462, 1884), ('fig', 640), ['sheet | walking away', 'a teal column'], [2, 5])
    item('D11', SHEET, (1972, 1214, 2306, 1884), ('fig', 640), ['sheet | phone light', 'helmet hair + bun,', 'stiff scarf tube'], [2, 3])

    section("E. The owner's references at the same height (comparison only; never traced)",
            'refs_human_scale/04 (girl strip, frame 1), 03 (couple zoom), 01 (man on the hill); assets/ref = reference 1 (the France reel, the first style reference): the crowd grammar our cast was built from.')
    item('E1', f'{REFS}/04_cloud_beast_girl_strip.jpg', (186, 200, 446, 676), ('fig', 467), ['ref 04 | the girl', '~7 heads (wrap incl.),', 'neck, 3 masses, soft light'], [], (205, 275, 672))
    item('E2', f'{REFS}/03_beach_dusk_couple_zoom.jpg', (104, 40, 362, 530), ('fig', 470), ['ref 03 | the couple', '~7.3 heads: tee, shorts,', 'sneakers; phone light'], [], (48, 112, 517))
    item('E3', f'{REFS}/01_city_hill_sunset.jpg', (440, 326, 596, 548), ('fig', 200), ['ref 01 | man from behind', '~7.4 heads: hoodie,', 'jeans, sneakers'], [], (330, 357, 530))
    item('E4', f'{REF1}/frame_0060.jpg', (175, 742, 570, 945), ('fig', 168), ['reference 1 | the crowd', 'pegs as TEXTURE: dozens,', 'overlapping, never a character'], [], (775, 810, 940))
    item('E5', f'{REF1}/frame_0285.jpg', (200, 760, 900, 940), ('cut',), ['reference 1 | near backs', 'the round-head grammar', 'we scaled up to characters'], [])

    section('F. At the size the phone shows them (1:1 in a 1080-wide frame; the refs as the owner sees them, full width)',
            'This is the level of detail that matters: at 130-220 px only the silhouette, the head size, the hair shape, the value pattern and one accessory survive.')
    landscape = 1080 / 1206  # the owner's landscape refs fill the phone's width
    item('F1', fr('v1', 1), (254, 1440, 350, 1614), ('scale', 1.0), ['v1 bun + backpack', '150 px'], [1, 8])
    item('F2', fr('v1', 21), (384, 1134, 474, 1276), ('scale', 1.0), ['v1 beanie walker', '130 px'], [1, 3])
    item('F3', fr('v2', 2), (596, 912, 684, 1098), ('scale', 1.0), ['v2 her rear 3/4', '172 px'], [1, 3])
    item('F4', fr('v2', 17.5), (688, 886, 760, 1072), ('scale', 1.0), ['v2 her profile', '175 px'], [1, 3])
    item('F5', kc, (4, 2090, 290, 2258), ('scale', 1.0), ['v2 the public', '150 px'], [1, 2, 4])
    item('F6', V6, (648, 920, 714, 1086), ('scale', 1.0), ['v6 refined her', '155 px'], [2, 3])
    item('F7', SHEET, (756, 1224, 1180, 1884), ('scale', 155 / 640), ['refined her walking', 'at 155 px'], [2])
    item('F8', f'{REFS}/04_cloud_beast_frame.jpg', (440, 1088, 545, 1206), ('scale', 1.5), ['ref 04 girl', '~145 px'], [])
    item('F9', f'{REFS}/03_beach_dusk.jpg', (828, 355, 912, 532), ('scale', landscape), ['ref 03 couple', '~150 px'], [])
    item('F10', f'{REFS}/01_city_hill_sunset.jpg', (440, 326, 596, 548), ('scale', landscape), ['ref 01 man + friend', '~180 px'], [])
    item('F11', f'{REFS}/02_bus_stop_night.jpg', (600, 410, 710, 522), ('scale', landscape), ['ref 02 bus stop', '~95 px seated'], [])

    section('G. Filled black: the silhouette test (flat-background renders only)',
            'The v2r cast is one peg shape (a ball with ear bumps on a rounded box on two bars) whatever the hair or coat; the refined her reads as a person.')
    item('G1', kc, (4, 2090, 646, 2246), ('fig', 150), ['v2r the public, 150 px', 'seven people, one shape'], [1, 3], sil=True)
    item('G2', kc, (66, 2648, 198, 2956), ('fig', 300), ['v2r LOD 300 px', 'a restroom-sign pictogram'], [1], sil=True)
    item('G3', SHEET, (1010, 204, 1244, 846), ('fig', 632), ['current her 640', 'ball + box + two legs'], [1], sil=True)
    item('G4', SHEET, (1268, 200, 1562, 846), ('fig', 630), ['refined her 640', 'neck, slope, waist, hem'], [], sil=True)
    item('G5', SHEET, (756, 1224, 1180, 1868), ('fig', 640), ['refined her walking', 'a person, a gait'], [], sil=True)
    return S, SECTIONS


def scale_for(it):
    x0, y0, x1, y1 = it['box']
    m = it['mode']
    if m[0] == 'fig':
        return FIG_H / m[1]
    if m[0] == 'cut':
        return FIG_H / (y1 - y0)
    if m[0] == 'fit':
        return m[1] / (y1 - y0)
    return m[1]


def render_cell(it, f):
    im = Image.open(it['src']).convert('RGB')
    x0, y0, x1, y1 = it['box']
    crop = im.crop((x0, y0, x1, y1))
    if it['sil']:  # filled black: everything that differs from the corner's background colour
        a = np.asarray(crop).astype(int)
        m = np.abs(a - a[1, 1]).sum(axis=2) > 26
        crop = Image.fromarray(np.where(m[..., None], np.array([30, 24, 28]), np.array([255, 255, 255])).astype('uint8'))
    s = scale_for(it)
    w, h = max(1, round(crop.width * s)), max(1, round(crop.height * s))
    crop = crop.resize((w, h), Image.LANCZOS)
    native = it['mode'][0] == 'scale'
    cw = max(w, 150 if native else 190)
    ch = max(h, 200 if native else FIG_H)
    cell = Image.new('RGB', (cw, ch + CAP_H), CELLBG)
    ox, oy = (cw - w) // 2, ch - h  # bottom-aligned: the feet on one line
    cell.paste(crop, (ox, oy))
    d = ImageDraw.Draw(cell)
    if it['heads']:
        for yy in it['heads']:
            d.line([(ox, oy + (yy - y0) * s), (ox + w, oy + (yy - y0) * s)], fill=RED, width=2)
    d.rectangle([0, 0, cw - 1, ch - 1], outline=(214, 204, 198), width=1)
    cy = ch + 6
    d.text((4, cy), it['id'], font=f['id'], fill=INK)
    tx = 4 + d.textlength(it['id'], font=f['id']) + 8
    for c in it['causes']:
        tw = d.textlength(str(c), font=f['tag'])
        d.rounded_rectangle([tx, cy + 1, tx + tw + 10, cy + 20], radius=4, fill=TAGC[c])
        d.text((tx + 5, cy + 2), str(c), font=f['tag'], fill=(255, 255, 255))
        tx += tw + 14
    ly = cy + 24
    if it['heads']:
        top, hb, feet = it['heads']
        d.text((4, ly - 1), f'{(feet - top) / max(1, hb - top):.1f} heads tall', font=f['heads'], fill=RED)
        ly += 20
    for k, line in enumerate(it['cap']):
        d.text((4, ly + k * 19), line, font=f['cap'], fill=INK if k else MUTED)
    return cell


def build(work, out_path):
    f = dict(title=font('Inter-Bold.otf', 44), sub=font('Inter-Medium.otf', 22), sec=font('Inter-Bold.otf', 28),
             secnote=font('Inter-Medium.otf', 19), id=font('Inter-Bold.otf', 17), cap=font('Inter-Medium.otf', 15),
             tag=font('Inter-Bold.otf', 15), heads=font('Inter-Bold.otf', 17), legend=font('Inter-Medium.otf', 18))
    S, SECTIONS = items(work)
    cells = [render_cell(it, f) for it in S]
    y = MARGIN + 150
    blocks = []
    for si, sec in enumerate(SECTIONS):
        end = SECTIONS[si + 1]['start'] if si + 1 < len(SECTIONS) else len(S)
        y += 12
        blocks.append(('sec', sec, y))
        y += 70
        x, rowh = MARGIN, 0
        for k in range(sec['start'], end):
            c = cells[k]
            if x + c.width > SHEET_W - MARGIN and x > MARGIN:
                x, y, rowh = MARGIN, y + rowh + GAP, 0
            blocks.append(('cell', c, (x, y)))
            x += c.width + GAP
            rowh = max(rowh, c.height)
        y += rowh + 24
    legend_y = y
    out = Image.new('RGB', (SHEET_W, y + 330), BG)
    d = ImageDraw.Draw(out)
    d.text((MARGIN, MARGIN), 'Our people, side by side at the same height: why they read old and ugly', font=f['title'], fill=INK)
    d.text((MARGIN, MARGIN + 62), 'Every person we have drawn (v1, v2, v3 + drafts, the painted still v6, the people sheet), each full figure scaled to '
           '300 px head to feet. Red lines: head top, head bottom, feet.', font=f['sub'], fill=MUTED)
    d.text((MARGIN, MARGIN + 92), 'Numbered tags = the causes in diagnose.md, ranked by how much they hurt (1 = most). Cut figures (near backs, hands, '
           'waist-up) are shown at the cell height. 2026-10-30.', font=f['sub'], fill=MUTED)
    for b in blocks:
        if b[0] == 'sec':
            sec, yy = b[1], b[2]
            d.rectangle([MARGIN, yy, SHEET_W - MARGIN, yy + 58], fill=(232, 222, 214))
            d.text((MARGIN + 14, yy + 4), sec['title'], font=f['sec'], fill=INK)
            d.text((MARGIN + 14, yy + 36), sec['note'], font=f['secnote'], fill=MUTED)
        else:
            out.paste(b[1], b[2])
    ly = legend_y + 10
    d.rectangle([MARGIN, ly, SHEET_W - MARGIN, ly + 300], fill=(255, 255, 255), outline=(214, 204, 198))
    d.text((MARGIN + 16, ly + 10), 'The causes, ranked by how much they hurt (details and evidence: diagnose.md)', font=f['sec'], fill=INK)
    for k, (n, txt) in enumerate(LEGEND):
        yy = ly + 52 + k * 27
        d.rounded_rectangle([MARGIN + 16, yy + 1, MARGIN + 40, yy + 22], radius=4, fill=TAGC[n])
        d.text((MARGIN + 23, yy + 2), str(n), font=f['tag'], fill=(255, 255, 255))
        d.text((MARGIN + 52, yy + 1), txt, font=f['legend'], fill=INK)
    out.save(out_path, optimize=True)
    print(out_path, out.size)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--work', default=os.path.join(VIDEO, 'out', 'people_design'), help='frames and renders (git-ignored)')
    ap.add_argument('--out', default=os.path.join(HERE, 'diagnose_sheet.png'))
    a = ap.parse_args()
    prepare(a.work)
    build(a.work, a.out)


if __name__ == '__main__':
    sys.exit(main())
