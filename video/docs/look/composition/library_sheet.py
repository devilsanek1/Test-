#!/usr/bin/env python3
"""The composition library's frames (`../COMPOSITION_SHOTS.md` Part 0), one value thumbnail each.

It opens with the frame's grammar kept IN EVERY SHOT (Part 0 §0.3a: the owner's seven first, in his reels' order, then
ours), each with the rule that keeps it and its tier as a shot's lead. Then the 65 ranked frames by tier: CORE big
(3 a row), SITUATIONAL smaller (4 a row), RARE small (6 a row), NOT FOR US listed with the reason; in each tier the
owner's ideas first, in his reels' order and under Part 0's names, then ours. Each ranked tile carries, on a strip over
the app's name-block zone at its foot, one move it pairs with (inside the shot) and one join OUT to the next shot, both
from its Part 0 row (Part 0b §3's grammar); a chip marks a frame that is also kept in every shot, and "in: RJ2" one
that a plain cut may bring IN on a "But". The tiers are computed here from the three blind judges
(`judges/attention.json`, `story.json`, `fit.json`) by the doc's one rule (Part 0 §0.2): CORE = the sum of the three
12-15 with no lens under 3; SITUATIONAL = 9-11 with none under 2, or 12+ with a lens at 2; RARE = 6-8, or 9-11 with a
lens at 1; NOT FOR US = 5 or less; † = one judge-point in one lens from another tier. N2 and N5 are rules only.

The tiles are `devices_sheet.py`'s (each our 1080 x 1920 frame drawn at full size from the catalogue's numbers, five
flat values, the caption band and the feed's interface marked faintly, the device's guides in red), plus the ones drawn
here: the catalogue's new frames (Z1-Z4, S2, K8, M3) and five redrawn to their own rules after the library critique
(`critique_library.md` S20): N1 and N9 (an object or the home view, never a wall in your face), Z4 (the paper >= 60 %
of the stage wide, one number 120-160 px), B5 and B6 (every line under the band). Seeded and deterministic; no image
copied, traced or used as an input. The sheet is laid out at 1080 px wide, the phone's width, so it is read as the
owner sees it.

    python3 -B library_sheet.py               # library_sheet.png next to this script
    python3 -B library_sheet.py --check DIR   # also crops of the sheet at 1:1 for the phone check
"""
import json
import math
import os
import re
import sys

sys.dont_write_bytecode = True
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)

import numpy as np  # noqa: E402
from PIL import Image, ImageDraw  # noqa: E402

import devices_sheet as DS  # noqa: E402
import shots_sheet as S  # noqa: E402
from shots_sheet import ACCENT, BG, FH, FW, GREY_TO_L, INK, RULE, SUB, Frame, font, wrap  # noqa: E402

OUT = os.path.join(HERE, 'library_sheet.png')
DOC = os.path.join(HERE, '..', 'COMPOSITION_SHOTS.md')
SW, M = 1080, 24                                   # the sheet: the phone's width; the side margin

# ---------------------------------------------------------------------------------------------------------------------
# The tiers, from the three judges (the doc's rule, Part 0 §0.2); the names, from Part 0's tables
# ---------------------------------------------------------------------------------------------------------------------
TIERS = ('CORE', 'SITUATIONAL', 'RARE', 'NOT FOR US')
RULES_ONLY = ('N2', 'N5')                          # the frame's grammar only: not ranked (Part 0 §0.3a)


def tier_of(a, s, f):
    t, lo = a + s + f, min(a, s, f)
    if t >= 12 and lo >= 3:
        return 'CORE'
    if (9 <= t <= 11 and lo >= 2) or (t >= 12 and lo == 2):
        return 'SITUATIONAL'
    if 6 <= t <= 8 or (9 <= t <= 11 and lo == 1):
        return 'RARE'
    return 'NOT FOR US'


def edge(a, s, f):
    """One judge-point in one lens moves the entry to another tier (Part 0's †)."""
    t0 = tier_of(a, s, f)
    for i in range(3):
        for dv in (-1, 1):
            v = [a, s, f]
            v[i] += dv
            if 1 <= v[i] <= 5 and tier_of(*v) != t0:
                return True
    return False


def part0_names():
    """Part 0's names, as the doc prints them (the owner's under his reels' names), the strand tags dropped; the tier
    tables (§0.3-0.5) come after §0.3a, so their fuller names win."""
    names = {}
    for line in open(DOC, encoding='utf-8'):
        m = re.match(r'\| ([A-Z]+[0-9]*b?) \| ([^|]+?) \|', line)
        if m and not m.group(1).startswith('SR'):
            names[m.group(1)] = re.sub(r' \[[a-z, ]+\]$', '', m.group(2).strip())
    return names


def load():
    cat = json.load(open(os.path.join(HERE, 'catalogue.json')))
    J = {k: {s['id']: s['score'] for s in json.load(open(os.path.join(HERE, 'judges', k + '.json')))['scores']}
         for k in ('attention', 'story', 'fit')}
    names = part0_names()
    out = []
    for e in cat:
        a, s, f = (J[k][e['id']] for k in ('attention', 'story', 'fit'))
        out.append(dict(e, a=a, s=s, f=f, mean=(a + s + f) / 3.0, tier=tier_of(a, s, f),
                        edge=edge(a, s, f) and e['id'] not in RULES_ONLY, name=names.get(e['id'], e['name'])))
    return out


# ---------------------------------------------------------------------------------------------------------------------
# The move and the join out each frame pairs with (one of each from its Part 0 row), in short words
# ---------------------------------------------------------------------------------------------------------------------
MOVE = {'RM1': 'travels the line', 'RM2': 'the world passes', 'RM3': 'rides the lines', 'RM4': 'story push',
        'RM5': 'parallax float', 'RM6': 'a light comes on', 'RM7': 'locked hold', 'RM8': 'draw-on',
        'RM8b': 'the build (pops)', 'I4': 'pull-back (S5 at scale)', 'I5': 'reveal tilt', 'I6': 'rise-over (S1)',
        'I11': 'light pull', 'I12': 'pivot', 'any': 'any'}
JOIN = {'RJ2': 'plain cut, on "But"', 'RJ3': 'the loop', 'RJ4': 'continuous camera', 'J2': 'push-through',
        'J3': 'shape match', 'J4': 'light match', 'J6': 'eyeline', 'J7': 'carry', 'J8': 'near-mass wipe',
        'J11': 'light change', 'J13': 'card flip', 'any': 'any'}
SHORT = {'RM1': 'travel', 'RM2': 'world passes', 'RM3': 'ride', 'RM4': 'push', 'RM5': 'float', 'RM6': 'light on',
         'RM7': 'hold', 'RM8': 'draw-on', 'RM8b': 'build', 'I4': 'pull-back', 'I5': 'tilt', 'I6': 'rise',
         'I11': 'light pull', 'I12': 'pivot', 'RJ2': 'cut (But)', 'RJ3': 'loop', 'RJ4': 'continuous',
         'J2': 'push-through', 'J3': 'shape match', 'J4': 'light match', 'J6': 'eyeline', 'J7': 'carry', 'J8': 'wipe',
         'J11': 'light change', 'J13': 'card flip', 'any': 'any'}
PAIR = {
    'B1': ('RM1', 'J2'), 'B2': ('RM4', 'RJ4'), 'B4': ('RM4', 'J2'), 'C1': ('RM7', 'J2'), 'D1': ('RM7', 'J11'),
    'D2': ('I5', 'J2'), 'D7': ('RM6', 'J4'), 'E2': ('I11', 'J2'), 'E7': ('RM4', 'J2'), 'E8': ('RM6', 'J4'),
    'E9': ('RM1', 'J7'), 'T': ('RM8', 'RJ3'), 'N7': ('RM8', 'J4'), 'N1': ('RM7', 'RJ4'), 'N9': ('RM4', 'RJ4'),
    'N14': ('RM7', 'J3'), 'Z4': ('RM8', 'J13'),
    'A2': ('any', 'J3'), 'A6': ('I5', 'J3'), 'A7': ('RM7', 'J3'), 'B3': ('I11', 'J11'), 'B8': ('RM1', 'J7'),
    'B9': ('RM7', 'J3'), 'B10': ('RM5', 'J2'), 'B11': ('I5', 'RJ4'), 'C3': ('I11', 'RJ4'), 'D4': ('RM5', 'any'),
    'E1': ('RM1', 'J6'), 'E3': ('RM2', 'RJ4'), 'E4': ('RM3', 'J6'), 'E6': ('RM5', 'J11'), 'E10': ('RM7', 'J6'),
    'E11': ('RM8b', 'J2'), 'N13': ('RM5', 'J2'), 'Z3': ('RM8', 'RJ4'), 'N6': ('RM5', 'RJ4'), 'Z2': ('RM1', 'J2'),
    'N3': ('RM7', 'J3'), 'N11': ('I5', 'RJ4'), 'Z1': ('I4', 'RJ4'), 'S2': ('RM7', 'J11'),
    'A1': ('RM3', 'J7'), 'A3': ('RM4', 'J2'), 'A5': ('RM1', 'J3'), 'B5': ('RM3', 'J7'), 'B6': ('RM1', 'J7'),
    'B7': ('RM7', 'RJ4'), 'B12': ('RM1', 'J2'), 'B13': ('RM4', 'J2'), 'C2': ('RM5', 'J8'), 'D5': ('RM4', 'J3'),
    'D6': ('RM1', 'J3'), 'E5': ('RM5', 'J8'), 'N12': ('RM7', 'RJ4'), 'N15': ('RM7', 'RJ4'), 'K8': ('RM6', 'J4'),
    'M3': ('RM7', 'J3'),
}
IN_RJ2 = ('D2', 'B11', 'N11', 'A5', 'B6', 'N15', 'M3')     # a plain cut on a "But" may bring these IN (Part 0)
# The frame's grammar in every shot (Part 0 §0.3a): the rule that keeps it, in short words
EVERY = {'A1': (6, 'thirds as 2:1'), 'A2': (3, 'the focal\'s home'), 'C2': (10, 'the near hint'),
         'E5': (10, 'soft by value'), 'D4': (9, 'one counterweight'), 'E6': (2, 'air by distance'),
         'E8': (4, 'one hot accent'), 'N1': (3, 'the centre first'), 'N2': (2, 'words up top'),
         'N3': (6, 'horizon off half'), 'N5': (3, 'the drop'), 'N6': (2, 'planes stack up'), 'N7': (5, 'notan first')}
EVERY_ORDER = ('A1', 'A2', 'C2', 'E5', 'D4', 'E6', 'E8', 'N1', 'N2', 'N3', 'N5', 'N6', 'N7')
NOT_WHY = {
    'A4': ('no gaze evidence; its pole lands at or just under the band, or under the read zone',
           'B1 or B8 with RM1'),
    'D3': ('two equal masses are two equal calls', 'D4, A7'),
    'X1': ('no blur (DIRECTION 5; one optical blur on a near framing object aside)', 'E5 by value, I11'),
    'X2': ('never a title over the captions (the playbook)', 'the captions; the cover'),
    'X4': ('two stacked stages split the eye', 'N14 in sequence, D6'),
    'X5': ('no roll (DIRECTION 8)', 'B6, N15'),
    'X7': ('one camera from a human viewpoint (DIRECTION 7)', 'Z4: paper in the place'),
    'X8': ('verticals stay parallel', 'N11, the frame shifted'),
}


# ---------------------------------------------------------------------------------------------------------------------
# The new frames, and five redrawn to their rules (drawn as the device tiles are: full size, five values, guides red)
# ---------------------------------------------------------------------------------------------------------------------
def z1():
    return S.sr17()                       # the extreme wide: the big move's end, Helsinki a lit spot at the pivot


def z2():
    """The wide: video 4's home view, the block 15-35 % of the height (here ~600 px), the "you" near the camera."""
    fr = Frame(202, 'D')
    S.v4_home(fr, run=False)
    fr.person(236, 1456, 186, 'K')                                      # the "you" from behind, 186 px
    fr.g('vdim', 860, 664, 1262)                                        # the subject: 15-35 % of the height
    fr.g('arrow', [(250, 1290), (560, 1010)])                           # the "you"'s sightline to the one window
    fr.g('ring', 598, 985, 84)
    return fr


def z3():
    """The medium: inside the flat, the radiator under the one window, ~380 px wide, the lamp's pool on it."""
    fr = Frame(203, 'L')                                                # the room's light wall (the band on it)
    fr.rect(300, 640, 780, 944, 'D', amp=1.5)                           # the window: the night, a step down
    fr.dots(np.arange(330, 760, 46), (900, 920), 5, 'M', skip=0.4, jit=4)
    fr.rect(536, 640, 544, 944, 'M')                                    # its mullion
    fr.rect(270, 944, 810, 972, 'M', amp=1)                             # the sill
    fr.rect(350, 990, 730, 1236, 'D', amp=1.5)                          # the radiator: the subject
    for x in range(372, 716, 34):
        fr.rect(x, 1004, x + 12, 1222, 'K')                             # its fins
    fr.ell(540, 990, 220, 22, 'W')                                      # the lamp's pool on its top: the story light
    fr.poly([(0, 690), (120, 680), (150, 800), (0, 812)], 'M')          # the lamp's shade, cut by the left edge
    fr.rect(0, 1300, 1080, 1920, 'M')                                   # the floor: the near quiet field
    fr.rect(0, 1288, 1080, 1302, 'D')                                   # the skirting
    fr.rect(640, 900, 690, 944, 'K', amp=1)                             # a mug on the sill
    fr.g('hdim', 1262, 350, 730)                                        # the subject box: 270-460 px wide
    fr.g('ring', 540, 1060, 150)
    fr.focal = (540, 1060)
    return fr


def z4():
    """The insert (the paper): video 4's heat plan as paper on the wall, straight-on and level, 740 px wide (69 % of
    the stage), the one number 2027 140 px tall on its lit tag at the focal; the place a step under it at the edges."""
    fr = Frame(213, 'D')                                                # the wall: one flat field (the band on it)
    fr.rect(0, 1560, 1080, 1920, 'M')                                   # the snow at its foot: the near quiet field
    fr.rect(0, 1548, 1080, 1562, 'K')                                   # the wall's foot
    fr.rect(170, 690, 910, 1440, 'L', amp=1.5)                          # the paper: one quiet light field
    for x, y in ((186, 706), (894, 706), (186, 1424), (894, 1424)):
        fr.ell(x, y, 7, 7, 'K')                                         # its pins
    fr.hpoly([(170, 860), (330, 840), (520, 872), (700, 846), (910, 868), (910, 900), (700, 878), (520, 904),
              (330, 872), (170, 892)], 'M', amp=1.5)                    # the harbour's edge on the plan, a step under
    fr.rect(230, 760, 300, 820, 'D', amp=1)                             # the data centre, drawn as a block
    for x in (600, 680, 760, 840):
        fr.rect(x, 930, x + 44, 960, 'M', amp=1)                        # the homes, a step under
    fr.line([(300, 800), (380, 940), (860, 945)], 'M', 6)               # the warm run on the plan
    fr.rect(270, 990, 810, 1170, 'W', amp=1.5)                          # the tag: the paper's lit spot, the story light
    fr.text((540, 1080), '2027', 187, 'K')                              # one number, 140 px tall
    for y in (1230, 1290, 1350):
        fr.line([(240, y), (840, y)], 'M', 5)                           # the plan's streets below, a step under
    fr.g('hdim', 650, 170, 910)                                         # the paper: >= 60 % of the stage wide
    fr.g('vdim', 850, 1010, 1150)                                       # the number: 120-160 px
    fr.g('box', 254, 974, 826, 1186, dash=True)                         # one light tag, one dark mark
    fr.focal = (540, 1080)
    return fr


def s2():
    """The sun behind the roofline (CINEMATIC_GUIDE S2): a ~650 px disc at (580, 1060), the city one silhouette."""
    fr = Frame(204, 'L')
    fr.cloud(860, 160, 520, 200, 'M')
    fr.ell(580, 1060, 325, 325, 'W')                                    # the disc: the subject and the story light
    for y, w in ((1004, 520), (1118, 440)):
        fr.blob(600, y, w / 2, 11, 'L', 0.06)                           # two painted streaks across it
    fr.skyline(0, 1080, 1920, (1486, 1520), 'K', wmin=50, wmax=130, gable=0.3)
    fr.poly([(0, 1920), (0, 902), (46, 880), (112, 872), (182, 888), (242, 934), (290, 1004), (318, 1096),
             (330, 1500), (330, 1920)], 'K')                            # one dome mass cut by the left edge
    fr.line([(940, 520 + 100), (958, 532 + 100), (976, 520 + 100)], 'K', 4)   # one bird
    fr.g('ring', 580, 1060, 345)
    fr.g('hdim', 700, 255, 905)                                         # the disc ~650 px
    fr.focal = (580, 1060)
    return fr


def k8():
    """The light shaft and its pool (COZY_AND_SCALE K8): one person singled out by light in a vast interior."""
    fr = Frame(205, 'K')
    for x in (60, 250, 830, 1020):                                      # the hall's piers, receding to the sides
        fr.rect(x - 40, 620, x + 40, 1640, 'D', amp=1.5)
    fr.rect(0, 1640, 1080, 1920, 'D')                                   # the floor
    fr.poly([(474, 610), (606, 610), (650, 1460), (430, 1460)], 'M')    # the shaft: a soft wedge on the axis
    fr.ell(540, 1470, 230, 40, 'L')                                     # its pool on the floor
    fr.ell(540, 1468, 120, 20, 'W')                                     # the brightest: where the observer stands
    fr.person(540, 1470, 132, 'K')                                      # the one small life in it
    fr.g('line', [(474, 610), (430, 1460)], dash=True)
    fr.g('line', [(606, 610), (650, 1460)], dash=True)
    fr.g('hdim', 650, 474, 606)                                         # the core: 108-151 px on the axis
    fr.g('ring', 540, 1400, 110)
    fr.focal = (540, 1400)
    return fr


def m3():
    """Short-siding (modern M3, the turn only): the subject at x ~220 facing LEFT out of the frame, the stage empty."""
    fr = DS.harbour(206, 1200)
    fr.person(226, 1430, 196, 'K', view='side', facing=-1)
    fr.g('arrow', [(206, 1290), (40, 1290)])                            # the gaze leaves the frame
    fr.g('box', 420, 860, 900, 1480, dash=True)                         # the empty stage behind it
    fr.g('ring', 226, 1340, 110)
    fr.focal = (226, 1340)
    return fr


def n1():
    """The centre, the first look: video 4's home view, its one window (598, 985) within 130 px of the centre, where
    the first look lands (the cross at 540, 960)."""
    fr = Frame(211, 'D')
    one = S.v4_home(fr)
    fr.g('cross', 540, 960, 70, w=5)                                    # where the first look lands
    fr.g('box', 410, 951, 670, 1006, dash=True, w=4)                    # the target: x 540 +-130, y 951-1006
    fr.g('ring', one[0], one[1], 96)
    return fr


def n9():
    """Isolation (the close): one object, the tea mug, ~690 px wide with its handle, on one quiet backing (the night
    window), a calm ring round it; the tea dark, the lamp's reflection on it the story light; never a face, a
    building or a wall up close."""
    fr = Frame(212, 'D')                                                # the night window behind: one quiet field
    fr.rect(0, 1478, 1080, 1920, 'M')                                   # the sill: the near quiet field
    fr.rect(0, 1466, 1080, 1480, 'L')                                   # its lit edge
    fr.steam(470, 952, 660, 230, 'M', sway=28)                          # the steam, thinning out under the band
    fr.steam(590, 952, 740, 180, 'M', sway=-22)
    fr.ell(800, 1190, 124, 156, 'L')                                    # the handle's ring ...
    fr.ell(800, 1190, 70, 104, 'D')                                     # ... the backing through it
    fr.hpoly([(230, 990), (770, 990), (748, 1446), (252, 1446)], 'L', amp=2)   # the mug: one closed light shape
    fr.ell(500, 990, 270, 44, 'M')                                      # its rim
    fr.ell(500, 996, 244, 32, 'K')                                      # the tea, the darkest
    fr.ell(548, 990, 92, 12, 'W')                                       # the lamp on the tea: the story light
    fr.g('hdim', 1530, 230, 924)                                        # the object: >= 650 px
    fr.g('ring', 575, 1190, 440)                                        # its calm ring: nothing else in it
    fr.focal = (548, 990)
    return fr


def b5():
    """Parallel lines: a canal stair's handrail, its flight and its wall at 34 degrees, 3 lines, all of them under
    the band (the top one ends at y ~672 at the right edge); a walker on the flight."""
    fr = DS.dusk(115, cloud_x=880)
    k = math.tan(math.radians(34))
    y = lambda c, x: c - k * x  # noqa: E731
    fr.skyline(0, 1080, 1010, (870, 950), 'M', wmin=40, wmax=110, gable=0.2)   # the far bank, low
    fr.rect(0, 1010, 1080, 1920, 'M')                                    # the canal's water beyond the stair
    fr.poly([(0, y(1520, 0)), (1080, y(1520, 1080)), (1080, 1920), (0, 1920)], 'D')   # the flight and its wall
    fr.poly([(0, y(1750, 0)), (1080, y(1750, 1080)), (1080, 1920), (0, 1920)], 'K')   # the wall below it
    for i in range(16):                                                  # the step nosings, tone-on-tone
        x = 40 + i * 64
        fr.line([(x, y(1540, x)), (x + 34, y(1750, x + 34))], 'K', 3)
    fr.line([(0, y(1400, 0)), (1080, y(1400, 1080))], 'K', 9)            # the handrail
    for x in range(60, 1080, 150):
        fr.line([(x, y(1400, x)), (x, y(1520, x))], 'K', 6)
    fr.person(600, y(1640, 600), 170, 'K', view='side', facing=-1)       # walking down the flight
    for c in (1400, 1520, 1750):
        fr.g('arrow', [(980, y(c, 980) - 18), (140, y(c, 140) - 18)], w=5)
    fr.g('ring', 600, y(1640, 600) - 90, 100)
    fr.focal = (600, y(1640, 600) - 90)
    return fr


def b6():
    """Diagonal: one ramp rising at 36 degrees from the lower left to a lit door, broken by the figure climbing it;
    the line ends at the light (no corner-to-corner line, nothing near the band)."""
    fr = DS.dusk(116, cloud_x=880)
    k = math.tan(math.radians(36))
    top = (560, 1150)                                                    # the ramp's top: the door's sill
    edge = lambda x: top[1] + (top[0] - x) * k  # noqa: E731
    fr.skyline(0, 1080, 1260, (1150, 1220), 'M', wmin=40, wmax=110, gable=0.25)  # the far city, low
    fr.rect(0, 1260, 1080, 1920, 'M')
    fr.hpoly([(540, 742), (1080, 736), (1080, 1152), (540, 1152)], 'K', amp=2)    # the house at the top, cut right
    fr.rect(590, 958, 676, 1150, 'W')                                    # its lit door: the story light
    fr.poly([(0, edge(0)), top, (1080, top[1]), (1080, 1920), (0, 1920)], 'D')    # the ramp, then the level landing
    fr.line([(0, edge(0) - 52), (top[0] - 30, edge(top[0] - 30) - 52)], 'K', 7)   # its railing, ending at the top
    for x in range(40, top[0] - 30, 130):
        fr.line([(x, edge(x) - 52), (x, edge(x))], 'K', 5)
    fr.person(470, edge(470), 196, 'K', view='side', facing=1)           # climbing it, against the light
    fr.g('line', [(0, edge(0)), (400, edge(400))], w=7)                  # the one diagonal, broken by her ...
    fr.g('arrow', [(520, edge(520)), (604, edge(604) - 6)], w=7)         # ... ending at the light
    fr.g('ring', 540, 1080, 124)
    fr.focal = (540, 1080)
    return fr


FUNC = {c: getattr(DS, c.lower()) for c in
        ['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'B1', 'B2', 'B3', 'B4', 'B7', 'B8', 'B9', 'B10', 'B11',
         'B12', 'B13', 'C1', 'C2', 'C3', 'D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'E1', 'E2', 'E3', 'E4', 'E5', 'E6',
         'E7', 'E8', 'E9', 'E10', 'E11', 'N2', 'N3', 'N5', 'N6', 'N7', 'N11', 'N12', 'N13', 'N14', 'N15']}
FUNC.update({'T': DS.tt, 'Z1': z1, 'Z2': z2, 'Z3': z3, 'Z4': z4, 'S2': s2, 'K8': k8, 'M3': m3, 'N1': n1, 'N9': n9,
             'B5': b5, 'B6': b6})


# ---------------------------------------------------------------------------------------------------------------------
# A tile: the frame at any width, its guides kept readable, a strip of two lines at its foot, a chip at its top
# ---------------------------------------------------------------------------------------------------------------------
def chip(d, x, y, text, fs, fill, ink):
    f = font(fs, 'Bold')
    w = d.textlength(text, font=f)
    d.rounded_rectangle([x, y, x + w + 12, y + fs + 9], 6, fill=fill)
    d.text((x + 6, y + 3), text, font=f, fill=ink)


def tile(code, w, fs, lines, chips=()):
    """`lines`: two (label, code or '', words) rows for the strip; `chips`: (text, fill, ink) at the top left."""
    fr = FUNC[code]()
    g = fr.im
    rgba = Image.merge('RGBA', (g, g, g, Image.new('L', (FW, FH), 255)))
    for box, col in getattr(fr, 'colour', []):
        ImageDraw.Draw(rgba).rectangle(box, fill=col + (255,))
    band = np.asarray(g)[290:600, 95:945]
    rgba = S.furniture(rgba, GREY_TO_L.get(int(np.median(band)), 50) < 55)
    if fr.inset is not None:
        sub_, (ix, iy), k = fr.inset
        size = (int(FW * k), int(FH * k))
        sg = sub_.im.resize(size, Image.LANCZOS)
        rgba.paste(Image.merge('RGBA', (sg, sg, sg, Image.new('L', size, 255))), (ix, iy))
    floor = 2.4 * FW / w                                                # >= 2.4 px wide on the tile
    guides = [(k, a, dict(kw, w=int(round(max(kw.get('w', S.LW) * 1.5, floor))))) for k, a, kw in fr.guides]
    rgba = S.draw_guides(rgba, guides)
    h = int(round(w * FH / FW))
    im = rgba.convert('RGB').resize((w, h), Image.BOX)
    lh = fs + 6
    sh = 2 * lh + 10
    ov = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(ov)
    d.rectangle([0, h - sh, w, h], fill=(22, 20, 26, 205))
    im = Image.alpha_composite(im.convert('RGBA'), ov).convert('RGB')
    d = ImageDraw.Draw(im)
    fb, fr_ = font(fs, 'Bold'), font(fs, 'Medium')
    y = h - sh + 5
    for lab, c, words in lines:
        x = 7
        d.text((x, y), lab, font=fr_, fill=(176, 172, 180))
        x += d.textlength(lab + ' ', font=fr_)
        if c and c != 'any':
            d.text((x, y), c, font=fb, fill=(255, 196, 120))
            x += d.textlength(c + ' ', font=fb)
        ws = words.split()
        while ws and d.textlength(' '.join(ws), font=fr_) > w - x - 5:   # drop whole words, never clip one
            ws = ws[:-1]
        d.text((x, y), ' '.join(ws), font=fr_, fill=(250, 248, 244))
        y += lh
    cy = 6
    for text, fill, ink in chips:
        chip(d, 6, cy, text, max(12, fs - 3), fill, ink)
        cy += fs + 12
    return im


def pair_lines(code, w):
    mv, jn = PAIR[code]
    long_words = w >= 300                                               # CORE tiles carry the long words
    return [('move', mv, (MOVE if long_words else SHORT)[mv]), ('join out', jn, (JOIN if long_words else SHORT)[jn])]


def every_lines(r):
    n, words = EVERY[r['id']]
    if r['id'] in RULES_ONLY:
        return [('rule', str(n), words), ('lead', '', 'none: a rule')]
    return [('rule', str(n), words), ('lead', r['tier'], '')]


# ---------------------------------------------------------------------------------------------------------------------
# The sheet
# ---------------------------------------------------------------------------------------------------------------------
EVERY_COL = (26, 76, 100)
TIER_COL = {'CORE': (34, 30, 36), 'SITUATIONAL': (78, 74, 84), 'RARE': (126, 120, 128), 'NOT FOR US': (160, 52, 34)}
LAYOUT = {'CORE': (3, 18, 22), 'SITUATIONAL': (4, 14, 18), 'RARE': (6, 10, 14)}   # columns, gap, strip font
LABEL = {'CORE': (26, 22, 19), 'SITUATIONAL': (21, 19, 16), 'RARE': (17, 15, 14)}  # code, name, scores
TIER_NOTE = {'CORE': 'the default tools: every film draws on them',
             'SITUATIONAL': 'by beat or emotion, under its condition',
             'RARE': 'once in a while, under its condition',
             'NOT FOR US': 'not used, for the reason given'}


def bar(d, y, title, note, col):
    d.rectangle([M, y, SW - M, y + 52], fill=col)
    d.text((M + 14, y + 11), title, font=font(27, 'Bold'), fill=(250, 248, 244))
    tw = d.textlength(title, font=font(27, 'Bold'))
    d.text((M + 30 + tw, y + 17), note, font=font(19), fill=(222, 218, 214))
    return y + 66


def sub(d, y, text):
    d.text((M, y), text, font=font(19, 'SemiBold'), fill=SUB)
    d.line([(M, y + 28), (SW - M, y + 28)], fill=RULE, width=2)
    return y + 38


def score_line(r, every):
    dag = '†' if r['edge'] else ''
    if every:                                                           # the tier is on the strip already
        return 'A·S·F %d·%d·%d%s' % (r['a'], r['s'], r['f'], ' · not ranked' if r['id'] in RULES_ONLY else dag)
    return 'A·S·F %d·%d·%d%s · mean %.2f' % (r['a'], r['s'], r['f'], dag, r['mean'])


def labels(d, lay, w, r, every):
    """The label under a tile: the code, the name (Part 0's, up to 3 lines), the scores; returns its lines."""
    fc, fn, fsc = LABEL[lay]
    kw = d.textlength(r['id'] + ' ', font=font(fc, 'Bold'))
    nl = wrap(d, r['name'], font(fn, 'Bold'), w - kw)[:3]
    sc = score_line(r, every)
    for cand in (sc, sc.replace('A·S·F ', '').replace(' · mean ', ' · '), sc.replace('A·S·F ', '').split(' · ')[0]):
        if d.textlength(cand, font=font(fsc)) <= w - 2:                # never into the next column
            return kw, nl, cand
    return kw, nl, cand


def grid(sheet, d, y, lay, entries, every=False, measure=False):
    cols, gap, fs = LAYOUT[lay]
    w = (SW - 2 * M - (cols - 1) * gap) // cols
    h = int(round(w * FH / FW))
    fc, fn, fsc = LABEL[lay]
    for r0 in range(0, len(entries), cols):
        row = entries[r0:r0 + cols]
        lh = max(6 + len(labels(d, lay, w, e, every)[1]) * (fn + 5) + fsc + 10 for e in row)
        if not measure:
            for i, e in enumerate(row):
                x = M + i * (w + gap)
                chips = []
                if every:
                    lines = every_lines(e)
                else:
                    lines = pair_lines(e['id'], w)
                    if e['id'] in EVERY:
                        chips.append(('EVERY SHOT · rule %d' % EVERY[e['id']][0] if w >= 200 else 'EVERY SHOT',
                                      EVERY_COL, (250, 248, 244)))
                    if e['id'] in IN_RJ2:
                        chips.append(('in: RJ2 on "But"' if w >= 200 else 'in: RJ2', (22, 20, 26),
                                      (255, 196, 120)))
                sheet.paste(tile(e['id'], w, fs, lines, chips), (x, y))
                d.rectangle([x - 1, y - 1, x + w, y + h], outline=(176, 170, 166))
                ty = y + h + 6
                kw, nl, sc = labels(d, lay, w, e, every)
                d.text((x, ty), e['id'], font=font(fc, 'Bold'), fill=ACCENT)
                for j, line in enumerate(nl):
                    d.text((x + kw, ty + (fc - fn) + j * (fn + 5)), line, font=font(fn, 'Bold'), fill=INK)
                ty += len(nl) * (fn + 5) + 4
                d.text((x, ty), sc, font=font(fsc), fill=SUB)
        y += h + lh + 16
    return y


def build(rows):
    byid = {r['id']: r for r in rows}
    frames = [r for r in rows if r['family'] == 'frame' and r['id'] not in RULES_ONLY]
    by = {t: [r for r in frames if r['tier'] == t] for t in TIERS}
    for t in TIERS:                                                    # his first (reel order), then ours by mean
        own = [r for r in by[t] if r['source'] == 'owner']
        ours = sorted([r for r in by[t] if r['source'] == 'ours'], key=lambda r: -r['mean'])
        by[t] = (own, ours)
    every_own = [byid[c] for c in EVERY_ORDER if byid[c]['source'] == 'owner']
    every_ours = [byid[c] for c in EVERY_ORDER if byid[c]['source'] == 'ours']
    scratch = Image.new('RGB', (SW, 100), BG)
    dm = ImageDraw.Draw(scratch)

    def body(sheet, d, y, measure):
        y = bar(d, y, 'IN EVERY SHOT · %d frames' % (len(every_own) + len(every_ours)),
                'the frame\'s grammar, whatever leads the shot', EVERY_COL) if not measure else y + 66
        for lab, grp, lay in (('THE OWNER\'S (his reels\' order) · %d' % len(every_own), every_own, 'SITUATIONAL'),
                              ('OURS · %d' % len(every_ours), every_ours, 'RARE')):
            y = sub(d, y, lab) if not measure else y + 38
            y = grid(sheet, d, y, lay, grp, every=True, measure=measure)
        y += 8
        for t in ('CORE', 'SITUATIONAL', 'RARE'):
            own, ours = by[t]
            y = bar(d, y, '%s · %d frames' % (t, len(own) + len(ours)), TIER_NOTE[t], TIER_COL[t]) \
                if not measure else y + 66
            for lab, grp in (('THE OWNER\'S (his reels\' order) · %d' % len(own), own), ('OURS · %d' % len(ours), ours)):
                if not grp:
                    continue
                y = sub(d, y, lab) if not measure else y + 38
                y = grid(sheet, d, y, t, grp, measure=measure)
            y += 8
        own, ours = by['NOT FOR US']
        y = bar(d, y, 'NOT FOR US · %d frames' % (len(own) + len(ours)), TIER_NOTE['NOT FOR US'],
                TIER_COL['NOT FOR US']) if not measure else y + 66
        for r in own + ours:
            why, inst = NOT_WHY[r['id']]
            who = 'his' if r['source'] == 'owner' else 'ours'
            t2 = '%s · instead: %s' % (why, inst)
            lines2 = wrap(dm, t2, font(19), SW - 2 * M - 58)
            if not measure:
                d.text((M, y), r['id'], font=font(21, 'Bold'), fill=ACCENT)
                d.text((M + 58, y + 1), r['name'], font=font(20, 'Bold'), fill=INK)
                nw = d.textlength(r['name'] + '  ', font=font(20, 'Bold'))
                d.text((M + 58 + nw, y + 3), '(%s · %d·%d·%d%s)' % (who, r['a'], r['s'], r['f'],
                                                                   '†' if r['edge'] else ''), font=font(17), fill=SUB)
                for j, line in enumerate(lines2):
                    d.text((M + 58, y + 28 + j * 24), line, font=font(19), fill=INK)
            y += 28 + max(1, len(lines2)) * 24 + 12
        return y

    n_frames = sum(1 for r in rows if r['family'] == 'frame')
    lines = ['103 choices: %d frames, 17 moves, 19 joins. Here the frames: first the %d kept IN EVERY SHOT (the '
             'frame\'s grammar, the owner\'s %d first), then the %d ranked by tier: CORE big, SITUATIONAL smaller, RARE '
             'small, NOT FOR US listed. In each part the owner\'s ideas first, in his reels\' order and names, then '
             'ours.' % (n_frames, len(EVERY_ORDER), len(every_own), len(frames)),
             'The tier, for leading a shot: three blind judges (attention · story · fit, 1-5 each). CORE: the sum '
             '12-15, no lens under 3; SITUATIONAL: 9-11, none under 2; RARE: 6-8; NOT FOR US: 5 or less (the two '
             'guards: Part 0 §0.2). † = one judge-point from another tier (the owner settles it in one line).',
             'On each ranked frame\'s foot: the MOVE it pairs with inside the shot and the JOIN OUT to the next shot '
             '(Part 0b §3); a chip marks a frame kept in EVERY SHOT, or one a plain cut on a "But" may bring IN. Red: '
             'the device\'s guides; dashed: the caption band; veiled: the app.']
    head_h = 78 + sum(len(wrap(dm, t, font(20), SW - 2 * M)) * 26 + 6 for t in lines) + 8
    H = body(None, dm, head_h, True) + 520
    sheet = Image.new('RGB', (SW, H), BG)
    d = ImageDraw.Draw(sheet)
    d.text((M, 22), 'The composition library: the frames, ranked', font=font(38, 'Bold'), fill=INK)
    y = 78
    for t in lines:
        for line in wrap(d, t, font(20), SW - 2 * M):
            d.text((M, y), line, font=font(20), fill=INK)
            y += 26
        y += 6
    y = body(sheet, d, head_h, False)
    # the key: every move and join named on the tiles
    y += 16
    d.text((M, y), 'The moves and joins on the tiles (Part 0 §0.4-0.5; numbers: Part 0b §3)', font=font(21, 'Bold'),
           fill=INK)
    y += 34
    tierof = {r['id']: r['tier'] for r in rows}
    used = {c for code in PAIR if code in FUNC for c in PAIR[code]} | {'RJ2'}
    keys = [(c, MOVE[c]) for c in MOVE if c in used and c != 'any'] + \
        [(c, JOIN[c]) for c in JOIN if c in used and c != 'any']
    half = (len(keys) + 1) // 2
    for i, (c, words) in enumerate(keys):
        x = M + (i // half) * ((SW - 2 * M) // 2)
        yy = y + (i % half) * 25
        d.text((x, yy), c, font=font(18, 'Bold'), fill=ACCENT)
        d.text((x + 58, yy), '%s · %s' % (words, tierof.get(c, tierof.get(c.rstrip('b')))), font=font(18), fill=INK)
    y += half * 25 + 18
    for t in ('Script: video/docs/look/composition/library_sheet.py (tiles from devices_sheet.py, five redrawn here; '
              'seeded; no image copied, traced or used as an input).',
              'The library and its numbers: video/docs/look/COMPOSITION_SHOTS.md (Part 0 the ranking, §0.3a the '
              'every-shot grammar, Part 0b the guidelines).'):
        for line in wrap(d, t, font(16), SW - 2 * M):
            d.text((M, y), line, font=font(16), fill=SUB)
            y += 22
    return sheet.crop((0, 0, SW, y + 20))


def main(argv):
    rows = load()
    sheet = build(rows)
    sheet.save(OUT, optimize=True)
    print('wrote', OUT, sheet.size)
    if '--check' in argv:
        out = argv[argv.index('--check') + 1]
        os.makedirs(out, exist_ok=True)
        hgt = sheet.height
        for i, y0 in enumerate(range(0, hgt, 2340)):
            sheet.crop((0, y0, SW, min(hgt, y0 + 2340))).save(os.path.join(out, 'phone_%02d.png' % i))
        print('crops in', out)


if __name__ == '__main__':
    main(sys.argv[1:])
