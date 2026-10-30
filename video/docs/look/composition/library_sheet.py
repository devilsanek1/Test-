#!/usr/bin/env python3
"""The composition library's frames by tier (`../COMPOSITION_SHOTS.md` Part 0), one value thumbnail each.

CORE frames big (3 a row), SITUATIONAL smaller (4 a row), RARE small (6 a row), NOT FOR US listed with the reason; in
each tier the owner's ideas first, in his reels' order, then ours, labelled. Each tile carries, on a strip over the
app's name-block zone at its foot, the move it pairs with (inside the shot) and the join it offers (to the next shot):
Part 0b §3's grammar. The tiers are computed here from the three blind judges (`judges/attention.json`, `story.json`,
`fit.json`) by the doc's one rule: CORE = mean >= 4.0 with no lens under 3; SITUATIONAL = mean 3.0-3.67 with no lens
under 2; RARE = mean 2.0-2.67; NOT FOR US = under 2.0.

The tiles are `devices_sheet.py`'s (each our 1080 x 1920 frame drawn at full size from the catalogue's numbers, five
flat values, the caption band and the feed's interface marked faintly, the device's guides in red), plus seven drawn
here for the catalogue's new frames (Z1-Z4, S2, K8, M3). Seeded and deterministic; no image copied, traced or used as
an input. The sheet is laid out at 1080 px wide, the phone's width, so it is read as the owner sees it.

    python3 -B library_sheet.py               # library_sheet.png next to this script
    python3 -B library_sheet.py --check DIR   # also crops of the sheet at 1:1 for the phone check
"""
import json
import math
import os
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
SW, M = 1080, 24                                   # the sheet: the phone's width; the side margin

# ---------------------------------------------------------------------------------------------------------------------
# The tiers, from the three judges (the doc's rule, Part 0 §0.2)
# ---------------------------------------------------------------------------------------------------------------------
TIERS = ('CORE', 'SITUATIONAL', 'RARE', 'NOT FOR US')


def load():
    cat = json.load(open(os.path.join(HERE, 'catalogue.json')))
    J = {k: {s['id']: s['score'] for s in json.load(open(os.path.join(HERE, 'judges', k + '.json')))['scores']}
         for k in ('attention', 'story', 'fit')}
    out = []
    for e in cat:
        a, s, f = (J[k][e['id']] for k in ('attention', 'story', 'fit'))
        m, lo = (a + s + f) / 3.0, min(a, s, f)
        t = 'CORE' if m >= 4.0 and lo >= 3 else 'SITUATIONAL' if m >= 3.0 and lo >= 2 else 'RARE' if m >= 2.0 \
            else 'NOT FOR US'
        out.append(dict(e, a=a, s=s, f=f, mean=m, tier=t))
    return out


# ---------------------------------------------------------------------------------------------------------------------
# The move and the join each frame pairs with (Part 0's "move -> join", its first of each), in short words
# ---------------------------------------------------------------------------------------------------------------------
MOVE = {'RM1': 'travels the line', 'RM2': 'the world passes', 'RM3': 'rides the lines', 'RM4': 'story push',
        'RM5': 'parallax float', 'RM6': 'a light comes on', 'RM7': 'locked hold', 'RM8': 'draw-on',
        'I4': 'pull-back (S5)', 'I5': 'reveal tilt', 'I6': 'rise-over (S1)', 'I11': 'light pull', 'I12': 'pivot',
        'any': 'any'}
JOIN = {'RJ2': 'plain cut, on "But"', 'RJ3': 'the loop', 'RJ4': 'continuous camera', 'J2': 'push-through',
        'J3': 'shape match', 'J4': 'light match', 'J6': 'eyeline', 'J7': 'carry', 'J8': 'near-mass wipe',
        'J11': 'light change', 'J13': 'card flip', 'any': 'any'}
SHORT = {'RM1': 'travel', 'RM2': 'world passes', 'RM3': 'ride', 'RM4': 'push', 'RM5': 'float', 'RM6': 'light on',
         'RM7': 'hold', 'RM8': 'draw-on', 'I4': 'pull-back', 'I5': 'tilt', 'I6': 'rise', 'I11': 'light pull',
         'I12': 'pivot', 'RJ2': 'cut (But)', 'RJ3': 'loop', 'RJ4': 'continuous', 'J2': 'push-through',
         'J3': 'shape match', 'J4': 'light match', 'J6': 'eyeline', 'J7': 'carry', 'J8': 'wipe', 'J11': 'light change',
         'J13': 'card flip', 'any': 'any'}
PAIR = {
    'B1': ('RM1', 'J2'), 'B2': ('RM4', 'RJ4'), 'B4': ('RM4', 'J2'), 'C1': ('RM7', 'J2'), 'D1': ('RM7', 'J11'),
    'D2': ('I5', 'RJ2'), 'D7': ('RM6', 'J4'), 'E2': ('I11', 'J2'), 'E7': ('RM4', 'J2'), 'E8': ('RM6', 'J4'),
    'E9': ('RM1', 'J7'), 'T': ('RM8', 'RJ3'), 'N7': ('RM8', 'J4'), 'N1': ('RM7', 'RJ4'), 'N9': ('RM4', 'RJ4'),
    'N14': ('RM7', 'J3'), 'N2': ('any', 'any'), 'N5': ('RM4', 'any'), 'Z4': ('RM8', 'J13'),
    'A2': ('any', 'J3'), 'A6': ('I5', 'J3'), 'A7': ('RM7', 'J3'), 'B3': ('I11', 'J11'), 'B8': ('RM1', 'J7'),
    'B9': ('RM7', 'J3'), 'B10': ('RM5', 'J2'), 'B11': ('I5', 'RJ2'), 'C3': ('I11', 'RJ4'), 'D4': ('RM5', 'any'),
    'E1': ('RM1', 'J6'), 'E3': ('RM2', 'RJ4'), 'E4': ('RM3', 'J6'), 'E6': ('RM5', 'J11'), 'E10': ('RM7', 'J6'),
    'E11': ('RM8', 'J2'), 'N13': ('RM5', 'J2'), 'Z3': ('RM8', 'RJ4'), 'N6': ('RM5', 'RJ4'), 'Z2': ('RM1', 'J2'),
    'N3': ('RM7', 'J3'), 'N11': ('I5', 'RJ2'), 'Z1': ('I4', 'RJ4'), 'S2': ('RM7', 'J11'),
    'A1': ('RM3', 'J7'), 'A3': ('RM4', 'J2'), 'A5': ('RM1', 'RJ2'), 'B5': ('RM3', 'J7'), 'B6': ('RM1', 'RJ2'),
    'B7': ('RM7', 'RJ4'), 'B12': ('RM1', 'J2'), 'B13': ('RM4', 'J2'), 'C2': ('RM5', 'J8'), 'D5': ('RM4', 'J3'),
    'D6': ('RM1', 'J3'), 'E5': ('RM5', 'J8'), 'N12': ('RM7', 'RJ4'), 'N15': ('RM7', 'RJ2'), 'K8': ('RM6', 'J4'),
    'M3': ('RM7', 'RJ2'),
}
SHORTNAME = {'E9': 'Held frame, the subject travels', 'N6': 'Depth stacked up the frame', 'D4': 'The steelyard',
             'E1': 'One small figure at the meeting', 'E10': 'The near "you"', 'N3': 'Horizon off the half',
             'N7': 'Figure and ground (notan)', 'N1': 'The centre', 'N2': 'The stage square', 'N5': 'Headroom: the drop',
             'N9': 'Isolation (the close)', 'N13': 'Refuge and prospect', 'N14': 'The deliberate match',
             'N11': 'The low angle', 'N12': 'The high angle', 'N15': 'The off-balance', 'Z4': 'The insert (the paper)',
             'E8': 'One colour accent', 'T': 'The line first, then the world', 'A2': 'Golden section',
             'A3': 'Golden section, nested', 'B2': 'Vanishing point', 'D7': 'Pattern, one break',
             'E3': 'Stillness against motion', 'S2': 'Sun behind the roofline', 'K8': 'Light shaft and pool',
             'M3': 'Short-siding, low quadrant', 'E11': 'The POV hook', 'C3': 'Level change',
             'E6': 'Atmospheric layers', 'E5': 'A soft near layer'}
NOT_WHY = {
    'A4': ('no gaze evidence; its pole lands in the band or under the read zone',
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
# The seven new frames (drawn as the device tiles are: full size, five values, guides in red)
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
    return S.sr22()                       # the insert: the 2027 tag, one number 120-160 px on the plan's wall


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


FUNC = {c: getattr(DS, c.lower()) for c in
        ['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8', 'B9', 'B10', 'B11',
         'B12', 'B13', 'C1', 'C2', 'C3', 'D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'E1', 'E2', 'E3', 'E4', 'E5', 'E6',
         'E7', 'E8', 'E9', 'E10', 'E11', 'N1', 'N2', 'N3', 'N5', 'N6', 'N7', 'N9', 'N11', 'N12', 'N13', 'N14', 'N15']}
FUNC.update({'T': DS.tt, 'Z1': z1, 'Z2': z2, 'Z3': z3, 'Z4': z4, 'S2': s2, 'K8': k8, 'M3': m3})


# ---------------------------------------------------------------------------------------------------------------------
# A tile: the frame at any width, its guides kept readable, the move and the join on a strip at its foot
# ---------------------------------------------------------------------------------------------------------------------
def tile(code, w, fs):
    fr = FUNC[code]()
    g = fr.im
    rgba = Image.merge('RGBA', (g, g, g, Image.new('L', (FW, FH), 255)))
    for box, col in getattr(fr, 'colour', []):
        ImageDraw.Draw(rgba).rectangle(box, fill=col + (255,))
    band = np.asarray(g)[290:600, 95:945]
    rgba = S.furniture(rgba, GREY_TO_L.get(int(np.median(band)), 50) < 55)
    if fr.inset is not None:
        sub, (ix, iy), k = fr.inset
        size = (int(FW * k), int(FH * k))
        sg = sub.im.resize(size, Image.LANCZOS)
        rgba.paste(Image.merge('RGBA', (sg, sg, sg, Image.new('L', size, 255))), (ix, iy))
    floor = 2.4 * FW / w                                                # >= 2.4 px wide on the tile
    guides = [(k, a, dict(kw, w=int(round(max(kw.get('w', S.LW) * 1.5, floor))))) for k, a, kw in fr.guides]
    rgba = S.draw_guides(rgba, guides)
    h = int(round(w * FH / FW))
    im = rgba.convert('RGB').resize((w, h), Image.BOX)
    mv, jn = PAIR[code]
    long_words = w >= 300                                               # CORE tiles carry the long words
    lines = [('move', mv, (MOVE if long_words else SHORT)[mv]), ('join', jn, (JOIN if long_words else SHORT)[jn])]
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
        if c != 'any':
            d.text((x, y), c, font=fb, fill=(255, 196, 120))
            x += d.textlength(c + ' ', font=fb)
        ws = words.split()
        while ws and d.textlength(' '.join(ws), font=fr_) > w - x - 5:   # drop whole words, never clip one
            ws = ws[:-1]
        d.text((x, y), ' '.join(ws), font=fr_, fill=(250, 248, 244))
        y += lh
    return im


# ---------------------------------------------------------------------------------------------------------------------
# The sheet
# ---------------------------------------------------------------------------------------------------------------------
TIER_COL = {'CORE': (34, 30, 36), 'SITUATIONAL': (78, 74, 84), 'RARE': (126, 120, 128), 'NOT FOR US': (160, 52, 34)}
LAYOUT = {'CORE': (3, 18, 22), 'SITUATIONAL': (4, 14, 18), 'RARE': (6, 10, 14)}   # columns, gap, strip font
LABEL = {'CORE': (26, 22, 19), 'SITUATIONAL': (21, 19, 16), 'RARE': (17, 15, 14)}  # code, name, scores
TIER_NOTE = {'CORE': 'the default tools: every film draws on them',
             'SITUATIONAL': 'by beat or emotion, under its condition',
             'RARE': 'once in a while, under its condition',
             'NOT FOR US': 'not used, for the reason given'}


def bar(d, y, tier, n):
    d.rectangle([M, y, SW - M, y + 52], fill=TIER_COL[tier])
    t = '%s · %d frames' % (tier, n)
    d.text((M + 14, y + 11), t, font=font(27, 'Bold'), fill=(250, 248, 244))
    tw = d.textlength(t, font=font(27, 'Bold'))
    d.text((M + 30 + tw, y + 17), TIER_NOTE[tier], font=font(19), fill=(222, 218, 214))
    return y + 66


def sub(d, y, text):
    d.text((M, y), text, font=font(19, 'SemiBold'), fill=SUB)
    d.line([(M, y + 28), (SW - M, y + 28)], fill=RULE, width=2)
    return y + 38


def label_h(tier, w, entries, d):
    fc, fn, fsc = LABEL[tier]
    hmax = 0
    for e in entries:
        name = SHORTNAME.get(e['id'], e['name'])
        kw = d.textlength(e['id'] + ' ', font=font(fc, 'Bold'))
        n = len(wrap(d, name, font(fn, 'Bold'), w - kw)[:2])
        hmax = max(hmax, 6 + n * (fn + 5) + fsc + 10)
    return hmax


def grid(sheet, d, y, tier, entries, measure=False):
    cols, gap, fs = LAYOUT[tier]
    w = (SW - 2 * M - (cols - 1) * gap) // cols
    h = int(round(w * FH / FW))
    fc, fn, fsc = LABEL[tier]
    for r in range(0, len(entries), cols):
        row = entries[r:r + cols]
        lh = label_h(tier, w, row, d)
        if not measure:
            for i, e in enumerate(row):
                x = M + i * (w + gap)
                sheet.paste(tile(e['id'], w, fs), (x, y))
                d.rectangle([x - 1, y - 1, x + w, y + h], outline=(176, 170, 166))
                ty = y + h + 6
                d.text((x, ty), e['id'], font=font(fc, 'Bold'), fill=ACCENT)
                kw = d.textlength(e['id'] + ' ', font=font(fc, 'Bold'))
                name = SHORTNAME.get(e['id'], e['name'])
                nl = wrap(d, name, font(fn, 'Bold'), w - kw)[:2]
                for j, line in enumerate(nl):
                    d.text((x + kw, ty + (fc - fn) + j * (fn + 5)), line, font=font(fn, 'Bold'), fill=INK)
                ty += len(nl) * (fn + 5) + 4
                sc = 'A·S·F %d·%d·%d · mean %.2f' % (e['a'], e['s'], e['f'], e['mean'])
                if d.textlength(sc, font=font(fsc)) > w:
                    sc = '%d·%d·%d · %.2f' % (e['a'], e['s'], e['f'], e['mean'])
                d.text((x, ty), sc, font=font(fsc), fill=SUB)
        y += h + lh + 16
    return y


def build(rows):
    frames = [r for r in rows if r['family'] == 'frame']
    by = {t: [r for r in frames if r['tier'] == t] for t in TIERS}
    for t in TIERS:                                                    # his first (reel order), then ours by mean
        own = [r for r in by[t] if r['source'] == 'owner']
        ours = sorted([r for r in by[t] if r['source'] == 'ours'], key=lambda r: -r['mean'])
        by[t] = (own, ours)
    scratch = Image.new('RGB', (SW, 100), BG)
    dm = ImageDraw.Draw(scratch)

    def body(sheet, d, y, measure):
        for t in ('CORE', 'SITUATIONAL', 'RARE'):
            own, ours = by[t]
            y = bar(d, y, t, len(own) + len(ours)) if not measure else y + 66
            for lab, grp in (('THE OWNER\'S (his reels\' order) · %d' % len(own), own), ('OURS · %d' % len(ours), ours)):
                if not grp:
                    continue
                y = sub(d, y, lab) if not measure else y + 38
                y = grid(sheet, d, y, t, grp, measure)
            y += 8
        own, ours = by['NOT FOR US']
        y = bar(d, y, 'NOT FOR US', len(own) + len(ours)) if not measure else y + 66
        for r in own + ours:
            why, inst = NOT_WHY[r['id']]
            name = SHORTNAME.get(r['id'], r['name'])
            who = 'his' if r['source'] == 'owner' else 'ours'
            t2 = '%s · instead: %s' % (why, inst)
            lines2 = wrap(dm, t2, font(19), SW - 2 * M - 58)
            if not measure:
                d.text((M, y), r['id'], font=font(21, 'Bold'), fill=ACCENT)
                d.text((M + 58, y + 1), name, font=font(20, 'Bold'), fill=INK)
                nw = d.textlength(name + '  ', font=font(20, 'Bold'))
                d.text((M + 58 + nw, y + 3), '(%s · %d·%d·%d)' % (who, r['a'], r['s'], r['f']), font=font(17),
                       fill=SUB)
                for j, line in enumerate(lines2):
                    d.text((M + 58, y + 28 + j * 24), line, font=font(19), fill=INK)
            y += 28 + max(1, len(lines2)) * 24 + 12
        return y

    lines = ['103 choices: 67 frames, 17 moves, 19 joins. Here the 67 frames, by tier: CORE big, SITUATIONAL '
             'smaller, RARE small, NOT FOR US listed. In each tier the owner\'s ideas first, then ours.',
             'The tier: three blind judges (attention · story · fit, 1-5). CORE mean >= 4.0, no lens under 3; '
             'SITUATIONAL 3.0-3.67, none under 2; RARE 2.0-2.67; NOT FOR US under 2.0.',
             'On each frame\'s foot: the MOVE it pairs with inside the shot and the JOIN it offers to the next one '
             '(Part 0b §3). Red: the device\'s guides; dashed: the caption band; veiled: the app.']
    head_h = 78 + sum(len(wrap(dm, t, font(20), SW - 2 * M)) * 26 + 6 for t in lines) + 8
    H = body(None, dm, head_h, True) + 480
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
    keys = [(c, MOVE[c]) for c in MOVE if c != 'any'] + [(c, JOIN[c]) for c in JOIN if c != 'any']
    half = (len(keys) + 1) // 2
    for i, (c, words) in enumerate(keys):
        x = M + (i // half) * ((SW - 2 * M) // 2)
        yy = y + (i % half) * 25
        d.text((x, yy), c, font=font(18, 'Bold'), fill=ACCENT)
        d.text((x + 52, yy), '%s · %s' % (words, tierof[c]), font=font(18), fill=INK)
    y += half * 25 + 18
    d.text((M, y), 'Script: video/docs/look/composition/library_sheet.py (tiles from devices_sheet.py; seeded; no image '
                   'copied, traced or used as an input).', font=font(16), fill=SUB)
    d.text((M, y + 22), 'The library and its numbers: video/docs/look/COMPOSITION_SHOTS.md (Part 0 the ranking, Part 0b '
                        'the guidelines).', font=font(16), fill=SUB)
    return sheet.crop((0, 0, SW, y + 56))


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
