#!/usr/bin/env python3
"""Value thumbnails of the device catalogue (`../COMPOSITION_SHOTS.md` Part 1): one 270 x 480 frame per device.

The owner's 41 ideas come first, in his reels' order and with their names (A1-A7, B1-B13, C1-C3, D1-D7, E1-E11, then
T, the reels' own teaching device); our additions N1-N15 follow in their own section; the six rejected treatments
X1-X6 are shown small, crossed out, with the reason.

Each thumbnail is our 1080 x 1920 frame drawn at full size and shown at 1/4, in the style of `shots_sheet.py` (whose
drawing kit this script imports): five flat values (L* 97 / 80 / 60 / 40 / 18, white only for the story light), the
caption band and the app's interface on the owner's Reels tab marked faintly, the device's guide lines in red. The
content is scene 1 (the canal at King's Cross on an October dusk) or video 4 (Helsinki on a snowy night). E8 alone
adds one colour, its hot accent. Everything is drawn from the catalogue's numbers, seeded and deterministic: no image
is copied, traced or used as an input.

    python3 -B devices_sheet.py               # the sheet: devices_sheet.png next to this script
    python3 -B devices_sheet.py --phone DIR   # also the phone-size views (fit to the phone's width, zooms, the gist)
    python3 -B devices_sheet.py --thumbs DIR  # also each thumbnail, and a band check per frame
"""
import math
import os
import sys

sys.dont_write_bytecode = True
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)

import numpy as np  # noqa: E402
from PIL import Image, ImageDraw, ImageFilter  # noqa: E402

import shots_sheet as S  # noqa: E402
from shots_sheet import (ACCENT, BG, FH, FW, GREY, GREY_TO_L, INK, RULE, SUB, TH, TW, Frame, catmull,  # noqa: E402
                         font, ribbon, wobble, wrap)

OUT = os.path.join(HERE, 'devices_sheet.png')
AMBER = (238, 160, 52)       # E8's one hot accent (the only colour in a picture on this sheet)
PHI = (1 + 5 ** 0.5) / 2


# ---------------------------------------------------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------------------------------------------------
def clear(fr):
    fr.guides = []
    return fr


def thumb(fr):
    """As shots_sheet.thumbnail, plus colour patches (E8) painted into the picture before the faint furniture."""
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
    # the phone check (the sheet fit to the phone's width): guides 1.5x the shots sheet's, so each device still reads
    guides = [(k, a, dict(kw, w=max(6, int(round(kw.get('w', S.LW) * 1.5))))) for k, a, kw in fr.guides]
    rgba = S.draw_guides(rgba, guides)
    return rgba.convert('RGB').resize((TW, TH), Image.BOX)


def wall(fr, xe, top_e, foot_e, vp, u_end, v, win=None, rows=((0.18, 0.36), (0.52, 0.70)), k=0.32):
    """A wall from the frame edge x = xe receding toward the vanishing point vp, drawn to depth u_end (0 at the edge,
    1 at vp); its windows (value `win`) spaced in perspective."""
    def at(u, h):
        yt = top_e + (vp[1] - top_e) * u
        yf = foot_e + (vp[1] - foot_e) * u
        return (xe + (vp[0] - xe) * u, yf + (yt - yf) * h)
    fr.poly([at(0, 0), at(0, 1), at(u_end, 1), at(u_end, 0)], v)
    if win:
        us = [u for u in (1 - 1 / (1 + k * i) for i in range(60)) if u < u_end]
        for ua, ub in zip(us[:-1], us[1:]):
            a, b = ua + (ub - ua) * 0.24, ub - (ub - ua) * 0.24
            for ha, hb in rows:
                q = [at(a, ha), at(b, ha), at(b, hb), at(a, hb)]
                if min(p[1] for p in q) > 630 and abs(q[1][0] - q[0][0]) > 5:
                    fr.poly(q, win)
    return at


def spiral_pts(pole, r0, a0_deg, turns=4.2, cw=True, n=420):
    """A golden (log) spiral: radius r0 at angle a0 (screen degrees, y down), shrinking by phi every quarter turn."""
    out = []
    for i in range(n):
        t = i / (n - 1) * turns * 360.0
        a = math.radians(a0_deg + (t if cw else -t))
        r = r0 / PHI ** (t / 90.0)
        out.append((pole[0] + r * math.cos(a), pole[1] + r * math.sin(a)))
    return out


def night(seed, cloud_x=170):
    fr = Frame(seed, 'D')
    fr.cloud(cloud_x, 160, 660, 236, 'M')
    return fr


def dusk(seed, cloud_x=170):
    fr = Frame(seed, 'L')
    fr.cloud(cloud_x, 150, 640, 230, 'M')
    return fr


def harbour(seed, yh, band='W'):
    """Video 4's harbour front (setup A): the night sky, the far shore's lit band on the horizon, the dark harbour,
    the quay's snow."""
    fr = night(seed, cloud_x=200)
    fr.skyline(0, 1080, yh - 12, (yh - 80, yh - 34), 'K', wmin=40, wmax=120, gable=0.15)
    fr.rect(0, yh - 14, 1080, yh + 10, band)
    for x in (130, 318, 600, 836, 990):
        fr.rect(x, yh - 14, x + 16, yh + 10, 'K')
    fr.rect(0, yh + 10, 1080, yh + 74, 'K')
    for _ in range(8):
        fr.ell(fr.rng.uniform(0, 1000), fr.rng.uniform(yh + 20, yh + 66), fr.rng.uniform(26, 70), 3.5, 'D')
    fr.rect(0, yh + 74, 1080, 1920, 'M')
    return fr


def snowpath(seed, walker=None):
    """Video 4: a trodden path in the snow from the bottom corners to the block's lit door (setup A, horizon 1150)."""
    fr = night(seed, cloud_x=880)
    yh = 1150
    fr.skyline(0, 1080, yh, (1064, 1120), 'K', wmin=40, wmax=110, gable=0.2)
    fr.rect(0, yh, 1080, 1920, 'M')
    fr.hpoly([(424, 792), (474, 790), (478, 770), (506, 770), (510, 788), (700, 784), (704, 1184), (420, 1184)], 'K',
             amp=2)
    fr.windows((466, 526, 594, 654), (840, 930, 1020), 34, 46, 'D', skip=0.2)
    fr.rect(534, 1074, 586, 1182, 'W')                                   # the lit door: the story light
    fr.ell(560, 1192, 92, 12, 'L')                                       # its pool on the snow
    fr.poly([(60, 1920), (1020, 1920), (596, 1186), (524, 1186)], 'D')   # the trodden path
    fr.line([(60, 1920), (524, 1186)], 'K', 12)                          # its two edges: the leading lines
    fr.line([(1020, 1920), (596, 1186)], 'K', 12)
    for t in (0.18, 0.42, 0.62):                                         # lamp posts along it, receding
        x, y = 60 + (524 - 60) * (1 - t) - 40 * t, 1920 + (1186 - 1920) * (1 - t)
        h = 380 * t
        fr.rect(x - 4 * t - 2, y - h, x + 4 * t + 2, y, 'K')
        fr.ell(x, y - h, 9 * t + 3, 9 * t + 3, 'L')
    if walker is None:
        fr.person(560, 1180, 92, 'K')                                    # one small figure in the door
    else:
        fr.person(walker[0], walker[1], walker[2], 'K')                  # the walker on the path, from behind
    fr.focal = (560, 1128)
    return fr


# ---------------------------------------------------------------------------------------------------------------------
# The owner's 41 (A-E) and T
# ---------------------------------------------------------------------------------------------------------------------
def a1():
    fr = harbour(101, 1280)
    fr.person(720, 1420, 200, 'K', view='side', facing=-1)               # on the right third, facing in (left)
    for x in (360, 720):
        fr.g('line', [(x, 40), (x, 1880)], dash=True, w=4)
    for y in (640, 1280):
        fr.g('line', [(20, y), (1060, y)], dash=True, w=4)
    fr.g('ring', 720, 1320, 110)
    fr.focal = (720, 1320)
    return fr


def a2():
    fr = Frame(102, 'D')
    one = S.v4_home(fr, payoff=False, run=False)
    for x in (413, 667):
        fr.g('line', [(x, 40), (x, 1880)], dash=True, w=4)
    for y in (733, 1187):
        fr.g('line', [(20, y), (1060, y)], dash=True, w=4)
    fr.g('box', 413, 951, 667, 1187)
    fr.g('ring', one[0], one[1], 80)
    return fr


def a3():
    fr = night(103, cloud_x=200)
    yg = 1169
    fr.skyline(0, 1080, yg, (1112, 1150), 'K', wmin=40, wmax=110, gable=0.15)
    fr.rect(0, yg, 1080, 1920, 'M')
    fr.rect(655, 760, 681, yg + 6, 'K')                                  # the big tree's trunk on x 667
    for cx, cy, rx, ry in ((770, 800, 230, 150), (680, 740, 150, 110), (880, 900, 170, 120), (720, 930, 170, 90)):
        fr.blob(cx, cy, rx, ry, 'K', 0.12)                               # its crown, top under the band
    fr.poly([(506, 1046), (570, 1000), (634, 1046), (634, yg), (506, yg)], 'K')   # the cabin at its foot
    fr.rect(552, 1064, 588, 1108, 'W')                                   # its lit window at (570, 1086)
    fr.ell(570, yg + 8, 70, 9, 'L')
    fr.g('box', 0, 600, 1080, 1520, dash=True, w=4)                      # built on the stage square
    fr.g('line', [(667, 600), (667, 1520)])                              # the main line
    fr.g('line', [(0, 1169), (1080, 1169)])
    fr.g('box', 413, 951, 667, 1169)                                     # the cell, cut again
    for x in (510, 570):
        fr.g('line', [(x, 951), (x, 1169)], dash=True, w=4)
    for y in (1034, 1086):
        fr.g('line', [(413, y), (667, y)], dash=True, w=4)
    fr.g('ring', 570, 1086, 46)
    fr.focal = (570, 1086)
    return fr


def a4():
    fr = clear(S.sr6())
    fr.g('line', spiral_pts((606, 1200), 1100, -73, turns=4.6, cw=True), w=5)
    fr.g('ring', 606, 1200, 40)
    return fr


def a5():
    fr = night(105, cloud_x=200)
    slope = lambda x: 1520 - x * 920.0 / 1080.0  # noqa: E731  (the stage square's rising diagonal)
    fr.poly([(0, slope(0)), (1080, slope(1080)), (1080, 1920), (0, 1920)], 'M')   # the snowy hill
    fr.rect(0, 1560, 1080, 1920, 'D')                                    # the near ground in shade
    fr.poly([(566, slope(566) + 4), (566, 892), (626, 846), (686, 892), (686, slope(686) + 4)], 'K')  # the house
    fr.rect(606, 900, 646, 962, 'W')                                     # its lit window: the subject at the foot
    fr.person(454, slope(454), 120, 'K', view='side', facing=1)          # a walker at the other foot (tier B)
    fr.g('box', 0, 600, 1080, 1520, dash=True, w=4)
    fr.g('line', [(0, 1520), (1080, 600)])                               # the diagonal
    fr.g('line', [(0, 600), (454, 1133)], dash=True)                     # the two perpendiculars
    fr.g('line', [(1080, 1520), (626, 987)], dash=True)
    fr.g('ring', 626, 940, 74)
    fr.focal = (626, 931)
    return fr


def a6():
    return S.sr9()


def a7():
    return S.sr23()


def b1():
    fr = snowpath(111)
    fr.g('arrow', [(96, 1880), (522, 1206)])
    fr.g('arrow', [(984, 1880), (598, 1206)])
    fr.g('ring', 560, 1128, 82)
    return fr


def b2():
    fr = night(112, cloud_x=170)
    vp = (600, 1080)
    fr.poly([(0, 1560), vp, (1080, 1640), (1080, 1920), (0, 1920)], 'M')   # the street's snow
    fr.rect(556, 962, 650, 1086, 'K', amp=1)                             # the block that closes the vista
    fr.rect(586, 990, 614, 1030, 'W')                                    # its lit window
    wall(fr, 0, 760, 1560, vp, 0.86, 'K', win='D')                       # the low side
    wall(fr, 1080, 420, 1640, vp, 0.86, 'K', win='D', rows=((0.12, 0.26), (0.40, 0.54), (0.66, 0.80)))
    fr.line([(0, 1560), (vp[0] - 12, vp[1] - 4)], 'D', 10)               # the kerbs
    fr.line([(1080, 1640), (vp[0] + 12, vp[1] - 4)], 'D', 10)
    for x0, y0, x1, y1 in ((0, 760, 600, 1080), (0, 1560, 600, 1080), (945, 606, 600, 1080), (1080, 1640, 600, 1080)):
        fr.g('line', [(x0, y0), (x0 + (x1 - x0) * 0.9, y0 + (y1 - y0) * 0.9)])
    fr.g('ring', 600, 1016, 70)
    fr.focal = (600, 1010)
    return fr


def b3():
    fr = night(113, cloud_x=880)
    vp = (560, 1068)
    fr.rect(0, 1068, 1080, 1920, 'M')
    fr.hpoly([(290, 790), (560, 744), (830, 790), (830, 1072), (290, 1072)], 'K', amp=2)   # the depot
    fr.poly([(506, 1070), (506, 990)] + [(560 + 54 * math.cos(a), 990 - 54 * math.sin(a))
                                        for a in np.linspace(math.pi, 0, 16)] + [(614, 1070)], 'W')  # its lit door
    for xc in (-760, -330, 60, 560, 1060, 1450, 1880):                   # the tracks, radiating from it
        for dx in (-70, 70):
            xb = xc + dx
            fr.poly([(vp[0] - 1, vp[1]), (vp[0] + 1, vp[1]), (xb + 7, 1920), (xb - 7, 1920)], 'K')
    for t in np.linspace(0.08, 0.9, 9):                                  # sleepers' shadow lines, tone-on-tone
        y = vp[1] + (1920 - vp[1]) * t ** 1.6
        fr.line([(0, y), (1080, y)], 'M', 2)
    for xc in (-330, 60, 1060, 1450):
        fr.g('line', [(vp[0] + (xc - vp[0]) * 0.08, vp[1] + 68), (vp[0] + (xc - vp[0]) * 0.9, 1830)], w=5)
    fr.g('ring', 560, 1030, 76)
    fr.focal = (560, 1030)
    return fr


def b4():
    fr = dusk(114, cloud_x=540)
    fr.hpoly([(300, 900), (780, 896), (784, 1150), (296, 1150)], 'M', amp=2)   # the far facade, framed
    fr.rect(500, 1000, 580, 1150, 'W')                                   # the lit door at the far end
    fr.person(548, 1146, 112, 'K')
    fr.rect(0, 1150, 1080, 1200, 'D')
    fr.rect(0, 1200, 1080, 1920, 'M')                                    # the water under the arch
    fr.column(540, 1204, 1520, 70, 120, 'L')
    lw = [(0, 0), (92, 0), (92, 602), (440, 900), (440, 1180), (92, 1560), (92, 1920), (0, 1920)]
    fr.poly(lw, 'K')                                                     # the portal's two sides: gutters first
    fr.poly([(1080 - x, y) for x, y in lw], 'K')
    fr.poly([(92, 1560), (440, 1180), (640, 1180), (988, 1560), (988, 1920), (92, 1920)], 'D')   # the towpath floor
    fr.rect(440, 880, 640, 900, 'K')                                     # the far arch's lintel
    fr.g('box', 92, 602, 988, 1560, w=5)                                 # the box in the box, corners joined
    fr.g('box', 440, 900, 640, 1180, w=5)
    for (x0, y0), (x1, y1) in (((92, 602), (440, 900)), ((988, 602), (640, 900)), ((92, 1560), (440, 1180)),
                               ((988, 1560), (640, 1180))):
        fr.g('line', [(x0, y0), (x1, y1)], dash=True, w=4)
    fr.focal = (540, 1080)
    return fr


def b5():
    fr = dusk(115, cloud_x=880)
    fr.skyline(0, 1080, 1060, (900, 980), 'M', wmin=40, wmax=110, gable=0.2)   # the far bank, low
    fr.rect(0, 1060, 1080, 1920, 'M')                                    # the canal's water beyond the stair
    y = lambda c, x: c - 0.839 * x  # noqa: E731  (lines at 40 degrees)
    fr.poly([(0, y(1560, 0)), (1080, y(1560, 1080)), (1080, 1920), (0, 1920)], 'D')   # the flight and its wall
    fr.poly([(0, y(1790, 0)), (1080, y(1790, 1080)), (1080, 1920), (0, 1920)], 'K')   # the wall below it
    for i in range(16):                                                  # the step nosings, tone-on-tone
        x = 40 + i * 64
        fr.line([(x, y(1580, x)), (x + 34, y(1790, x + 34))], 'K', 3)
    fr.line([(0, y(1440, 0)), (1080, y(1440, 1080))], 'K', 9)            # the handrail
    for x in range(60, 1080, 150):
        fr.line([(x, y(1440, x)), (x, y(1560, x))], 'K', 6)
    fr.person(600, y(1675, 600), 170, 'K', view='side', facing=-1)       # walking down the flight
    for c in (1440, 1560, 1790):
        fr.g('arrow', [(980, y(c, 980) - 18), (140, y(c, 140) - 18)], w=5)
    fr.g('ring', 600, y(1675, 600) - 90, 100)
    fr.focal = (600, y(1675, 600) - 90)
    return fr


def b6():
    fr = dusk(116, cloud_x=880)
    edge = lambda x: 1650 - x * 790.0 / 1080.0  # noqa: E731  (one ramp at ~36 degrees)
    fr.skyline(0, 640, 1500, (1240, 1330), 'M', wmin=40, wmax=110, gable=0.25)   # the far city, low at the left
    fr.poly([(0, edge(0)), (1080, edge(1080)), (1080, 1920), (0, 1920)], 'D')     # the ramp's mass
    fr.line([(0, edge(0) - 50), (1080, edge(1080) - 50)], 'K', 7)       # its railing
    for x in range(40, 1080, 170):
        fr.line([(x, edge(x) - 50), (x, edge(x))], 'K', 5)
    fr.person(560, edge(560), 190, 'K', view='side', facing=1)           # climbing it, against the light sky
    fr.g('line', [(0, edge(0)), (470, edge(470))], w=7)                  # the one diagonal, broken by her
    fr.g('arrow', [(650, edge(650)), (1060, edge(1060))], w=7)
    fr.g('ring', 560, edge(560) - 100, 112)
    fr.focal = (560, edge(560) - 100)
    return fr


def b7():
    fr = Frame(117, 'M')                                                 # the snow: one calm field
    fr.hpoly([(0, 0), (1080, 0), (1080, 630), (0, 646)], 'D', amp=4)    # the lid: the facade across
    fr.windows((160, 400, 640, 880), (150,), 90, 110, 'K', skip=0.1)   # only above the band: it stays flat
    c = (540, 1070)
    for p0, p1 in (((-80, 700), (1160, 1460)), ((1160, 700), (-80, 1460))):
        pts = [p0, c, p1]
        fr.poly(ribbon(pts, [44, 80, 124]), 'D')                         # two streets crossing: the X
    for t in np.linspace(0.12, 0.92, 8):                                 # the lamps along both, texture
        for p0, p1 in (((-80, 700), (1160, 1460)), ((1160, 700), (-80, 1460))):
            x, y = p0[0] + (p1[0] - p0[0]) * t, p0[1] + (p1[1] - p0[1]) * t
            if abs(x - c[0]) > 90:
                fr.ell(x, y - 70, 7, 7, 'L')
    fr.ell(c[0], c[1], 70, 40, 'L')                                      # the lit crossing
    fr.ell(c[0], c[1], 34, 20, 'W')
    fr.person(c[0] + 6, c[1] + 10, 64, 'K')
    fr.hpoly([(760, 1920), (820, 1720), (1080, 1640), (1080, 1920)], 'K', amp=3)   # our balcony's corner
    fr.g('line', [(70, 760), (1010, 1380)], w=5)
    fr.g('line', [(1010, 760), (70, 1380)], w=5)
    fr.g('ring', c[0], c[1], 92)
    fr.focal = c
    return fr


def b8():
    fr = dusk(118, cloud_x=880)
    fr.skyline(0, 1080, 800, (708, 760), 'M', wmin=40, wmax=110, gable=0.25)   # the far city (setup B)
    fr.rect(0, 800, 1080, 1920, 'D')                                     # the land
    centre = [(470, 1990), (800, 1640), (330, 1300), (650, 1060), (560, 930)]
    fr.poly(ribbon(centre, [250, 170, 100, 52, 26]), 'M')                # the canal winding up the frame
    fr.hpoly([(500, 870), (626, 866), (628, 930), (498, 930)], 'K', amp=1)   # the lock-keeper's house at its end
    fr.rect(546, 884, 580, 928, 'W')                                     # its lit door
    for x, y, r in ((120, 1500, 90), (980, 1180, 80), (180, 1050, 60), (900, 1820, 120)):
        fr.blob(x, y, r, r * 0.7, 'K', 0.14)                             # trees along the banks
    fr.g('curve', centre[:-1] + [(566, 950)], arrow=True, w=7)
    fr.g('ring', 563, 906, 68)
    fr.focal = (563, 906)
    return fr


def b9():
    return S.sr5()


def b10():
    fr = harbour(120, 1300, band='L')
    fr.rect(26, 0, 84, 1420, 'K')                                        # a tall pine at the left edge
    for cx, cy, rx, ry in ((70, 700, 230, 90), (60, 860, 280, 110), (50, 1030, 300, 120), (40, 1200, 260, 100)):
        fr.blob(cx, cy, rx, ry, 'K', 0.16)
    fr.rect(0, 1400, 1080, 1920, 'D')                                    # the quay: the ground line
    fr.hpoly([(452, 1150), (604, 1150), (608, 1400), (448, 1400)], 'K', amp=1.5)   # a kiosk in the L's corner
    fr.rect(492, 1192, 556, 1252, 'W')
    fr.g('line', [(55, 620), (55, 1400), (1040, 1400)], w=7)             # the L
    fr.g('ring', 524, 1222, 70)
    fr.focal = (524, 1222)
    return fr


def b11():
    fr = dusk(121, cloud_x=540)
    fr.hpoly([(300, 980), (780, 976), (784, 1110), (296, 1110)], 'M', amp=2)
    fr.rect(500, 1004, 580, 1108, 'W')                                   # the lit door at the V's point
    fr.person(546, 1104, 90, 'K')
    fr.rect(0, 1110, 1080, 1920, 'M')                                    # the water
    fr.column(540, 1114, 1400, 60, 90, 'L')
    fr.poly([(0, 0), (92, 0), (92, 602), (482, 1060), (482, 1920), (0, 1920)], 'D')   # a warehouse, stepping down
    for i in range(5):                                                   # its roofs' steps, under the band
        x = 150 + i * 70
        y = 602 + (x - 92) * (458 / 390.0)
        fr.rect(x - 30, y - 18, x, y + 4, 'D')
    fr.poly([(1080, 0), (988, 0), (988, 602), (600, 1060), (600, 1920), (1080, 1920)], 'K')   # the trees' bank
    for cx, cy, r in ((960, 680, 60), (880, 770, 66), (790, 880, 60), (700, 990, 46)):
        fr.blob(cx, cy, r, r * 0.8, 'K', 0.2)
    fr.g('line', [(92, 602), (480, 1056)], w=7)
    fr.g('line', [(988, 602), (602, 1056)], w=7)
    fr.g('ring', 540, 1060, 70)
    fr.focal = (540, 1056)
    return fr


def b12():
    fr = Frame(122, 'M')
    fr.hpoly([(0, 0), (1080, 0), (1080, 640), (0, 628)], 'D', amp=4)    # the lid
    c = (540, 1090)
    for i, r in enumerate((430, 372, 316, 262, 210, 160, 112)):
        fr.ell(c[0], c[1] - (430 - r) * 0.06, r, r * 0.93, 'D' if i % 2 == 0 else 'M')   # the ramps from above
    fr.ell(c[0], c[1], 74, 68, 'L')                                      # its pale floor
    fr.ell(c[0], c[1], 40, 36, 'W')
    rail = []
    for t in np.linspace(0, 1, 260):                                     # the rail: one spiral in to the floor
        a = 2 * math.pi * 3.2 * t - 1.2
        r = 430 - 340 * t
        rail.append((c[0] + r * math.cos(a), c[1] + r * 0.93 * math.sin(a)))
    fr.line(rail, 'K', 8)
    for t in np.linspace(0.08, 0.86, 9):                                 # people on the ramps, in twos
        a = 2 * math.pi * 3.2 * t - 1.0
        r = 430 - 340 * t - 22
        fr.person(c[0] + r * math.cos(a), c[1] + r * 0.93 * math.sin(a) + 18, 46, 'K')
    fr.g('curve', [rail[i] for i in range(0, 250, 14)], arrow=True, w=6)
    fr.g('ring', c[0], c[1], 64)
    fr.focal = c
    return fr


def b13():
    fr = Frame(123, 'L')                                                 # the room's light wall (the band on it)
    c, R = (540, 1010), 230
    view = Frame(1123, 'D')                                              # the night outside, cooler and darker
    view.skyline(0, 1080, 1120, (900, 1000), 'K', wmin=60, wmax=140, gable=0.3)
    view.rect(0, 1120, 1080, 1920, 'M')
    view.rect(500, 940, 580, 1120, 'K')
    view.rect(524, 976, 556, 1016, 'W')                                  # the one lit window: inside the circuit
    m = Image.new('L', (FW, FH), 0)
    ImageDraw.Draw(m).ellipse([c[0] - R, c[1] - R, c[0] + R, c[1] + R], fill=255)
    fr.ell(c[0], c[1], R + 26, R + 26, 'D')                              # the round window's frame
    fr.im.paste(view.im, (0, 0), m)
    fr.rect(0, 1300, 1080, 1340, 'M')                                    # the sill and the desk below
    fr.rect(0, 1340, 1080, 1920, 'M')
    fr.hpoly([(0, 1500), (210, 1470), (240, 1920), (0, 1920)], 'K', amp=3)   # a chair cut by the left edge
    fr.g('ring', c[0], c[1], R + 40)
    fr.g('ring', 540, 996, 52)
    fr.focal = (540, 996)
    return fr


def c1():
    return S.sr6()


def c2():
    fr = clear(S.sr7())
    fr.g('line', [(20, 1640), (1060, 1640)], dash=True)                 # the near layer's top
    fr.g('vdim', 80, 1640, 1900)
    fr.g('ring', 1004, 1800, 96)                                         # one prop, cut by the edge
    fr.g('ring', 558, 1028, 70)
    return fr


def c3():
    return S.sr11()


def d1():
    fr = clear(S.sr16())
    fr.g('box', 40, 40, 1040, 1390, dash=True)                           # the field: the sky with the band
    fr.g('ring', 340, 1360, 84)
    return fr


def d2():
    return S.sr15()


def d3():
    fr = night(133, cloud_x=540)
    fr.rect(0, 1300, 1080, 1920, 'M')
    fr.hpoly([(390, 720), (690, 714), (694, 1300), (386, 1300)], 'K', amp=2)   # the block on the axis
    fr.windows((430, 486, 594, 650), (790, 890, 1000, 1110, 1210), 36, 50, 'D', skip=0.15)
    fr.rect(516, 968, 564, 1032, 'W')                                    # the one window
    for side in (0, 1):                                                  # two equal snowy trees, mirrored
        for cx, cy, rx, ry in ((110, 760, 170, 120), (90, 920, 210, 140), (100, 1090, 230, 150)):
            x = cx if side == 0 else 1080 - cx
            fr.blob(x, cy, rx, ry, 'K', 0.1)
        fr.rect((40 if side == 0 else 1010), 1150, (70 if side == 0 else 1040), 1310, 'K')
    fr.g('box', 0, 630, 216, 1300, dash=True)
    fr.g('box', 864, 630, 1080, 1300, dash=True)
    fr.g('line', [(540, 640), (540, 1500)], dash=True, w=4)
    fr.g('ring', 540, 1000, 70)
    fr.focal = (540, 1000)
    return fr


def d4():
    fr = clear(S.sr2())
    fr.g('box', 0, 40, 500, 300, dash=True)                              # the big soft weight, far out
    fr.g('ring', 635, 1110, 84)                                          # the small loud one, near the centre
    fr.g('line', [(170, 1530), (635, 1530)], w=7)                        # the steelyard's beam
    fr.g('tri', [(540, 1536), (510, 1590), (570, 1590)])                 # its fulcrum on the axis
    fr.g('line', [(170, 300), (170, 1530)], dash=True, w=4)
    fr.g('line', [(635, 1194), (635, 1530)], dash=True, w=4)
    return fr


def d5():
    return S.sr21()


def d6():
    return S.sr20()


def d7():
    return S.sr8()


def e1():
    fr = night(141, cloud_x=880)
    yh = 1160
    fr.skyline(0, 1080, yh - 12, (1090, 1130), 'K', wmin=40, wmax=120, gable=0.15)
    fr.rect(0, yh - 14, 1080, yh + 4, 'L')                               # the far shore's lit band
    fr.rect(0, yh + 4, 1080, 1920, 'D')                                  # the frozen harbour
    fr.poly([(230, 1920), (850, 1920), (552, yh + 6), (528, yh + 6)], 'M')   # the jetty, straight out
    fr.line([(230, 1920), (528, yh + 6)], 'K', 10)
    fr.line([(850, 1920), (552, yh + 6)], 'K', 10)
    fr.person(540, 1301, 150, 'K')                                       # one small figure where the lines meet
    fr.g('line', [(250, 1880), (520, 1200)], w=5)
    fr.g('line', [(830, 1880), (560, 1200)], w=5)
    fr.g('vdim', 640, 1151, 1301)
    fr.g('ring', 540, 1226, 92)
    fr.focal = (540, 1226)
    return fr


def e2():
    fr = clear(S.sr7())
    fr.g('box', 500, 950, 616, 1102, w=5)                                # the lit aperture
    fr.g('ring', 582, 1046, 40)                                          # the figure dark in it
    return fr


def e3():
    fr = night(143, cloud_x=170)
    fr.skyline(0, 1080, 1010, (650, 720), 'K', wmin=150, wmax=260, gable=0.35)
    fr.windows((80, 200, 330, 460, 590, 720, 850, 980), (770, 860), 54, 70, 'D', skip=0.3, jit=8, size_jit=0.12)
    fr.rrect(-60, 902, 1140, 1006, 30, 'D')                              # the tram passing in one band
    for x in range(0, 1080, 96):
        fr.rect(x + 20, 922, x + 76, 960, 'M')
    fr.rect(0, 1006, 1080, 1920, 'M')                                    # the street's snow
    fr.line([(0, 1030), (1080, 1030)], 'D', 6)
    fr.person(520, 1372, 210, 'K')                                       # the one still figure, at the stop
    fr.rect(640, 1130, 652, 1372, 'K')                                   # the stop's post and sign
    fr.rect(612, 1120, 680, 1170, 'K')
    fr.g('arrow', [(1010, 878), (620, 878)], w=6)                        # the world moves, drawn sharp ...
    fr.g('arrow', [(470, 878), (90, 878)], w=6)
    fr.g('cross', 520, 1262, 150, w=5)                                   # ... the subject holds
    fr.focal = (520, 1262)
    return fr


def e4():
    fr = harbour(144, 1280)
    fr.person(720, 1420, 200, 'K', view='side', facing=-1)
    fr.g('hdim', 1180, 130, 690)                                         # the room ahead ...
    fr.g('hdim', 1180, 750, 870)                                         # ... and behind (the rail ends at 870)
    fr.g('arrow', [(690, 1262), (300, 1262)], dash=True)
    fr.g('ring', 720, 1320, 110)
    fr.focal = (720, 1320)
    return fr


def e5():
    fr = Frame(145, 'L')
    S.s1_home(fr)
    for cx, cy, rx, ry in ((40, 1640, 190, 140), (140, 1760, 170, 130), (20, 1840, 200, 120)):
        fr.blob(cx, cy, rx, ry, 'K', 0.14)                               # a shrub on our quay, cut by the edge
    fr.g('box', 0, 1478, 1080, 1920, dash=True)                          # the near layer: one quiet mass
    fr.g('ring', 120, 1720, 150)
    fr.g('ring', 990, 1700, 110)
    fr.focal = (635, 1110)
    return fr


def e6():
    fr = Frame(146, 'L')
    fr.cloud(860, 150, 640, 230, 'M')
    fr.skyline(0, 1080, 1260, (900, 980), 'M', wmin=50, wmax=140, gable=0.25, tall=0.12, tall_top=(820, 860))
    fr.skyline(0, 1080, 1380, (1030, 1110), 'D', wmin=60, wmax=150, gable=0.3)
    fr.rect(560, 1150, 640, 1290, 'W')                                   # the lit door in the middle row
    fr.person(604, 1288, 104, 'K')
    fr.rect(0, 1380, 1080, 1920, 'D')
    for cx, cy, rx, ry in ((120, 1330, 200, 140), (360, 1400, 180, 120), (850, 1360, 240, 150), (1040, 1300, 160, 170)):
        fr.blob(cx, cy, rx, ry, 'K', 0.14)                               # the near bank's trees, darkest
    fr.rect(0, 1440, 1080, 1920, 'K')
    for y in (900, 1030, 1240):
        fr.g('line', [(930, y), (1060, y)], w=6)                         # each layer's top: farther = higher, paler
    fr.g('arrow', [(996, 1500), (996, 860)], w=5)
    fr.g('ring', 600, 1220, 76)
    fr.focal = (600, 1220)
    return fr


def e7():
    fr = clear(S.sr3())
    fr.g('arrow', [(606, 1880), (606, 1136)], dash=True)                 # one sight line ...
    fr.g('ring', 608, 1040, 74)                                          # ... ended by one object
    return fr


def e8():
    fr = Frame(148, 'D')
    one = S.v4_home(fr, payoff=True)
    fr.colour = [((one[0] - 34, one[1] - 44, one[0] + 34, one[1] + 44), AMBER),
                 ((one[0] - 3, one[1] - 44, one[0] + 3, one[1] + 44), (44, 40, 44))]
    fr.g('ring', one[0], one[1], 92)
    return fr


def e9():
    fr = snowpath(149, walker=(566, 1560, 220))
    fr.g('arrow', [(566, 1320), (562, 1206)], w=7)                       # the subject travels the line
    fr.g('vdim', 700, 1340, 1560)
    fr.g('vdim', 640, 1088, 1180)
    fr.g('ring', 560, 1128, 82)
    return fr


def e10():
    return S.sr14()


def e11():
    return S.sr13()


def tt():
    return S.sr1()


# ---------------------------------------------------------------------------------------------------------------------
# Our additions (N1-N15)
# ---------------------------------------------------------------------------------------------------------------------
def n1():
    fr = clear(S.sr12())
    fr.g('cross', 540, 960, 70, w=5)                                     # where the first look lands
    fr.g('ring', 540, 932, 110)
    return fr


def n2():
    fr = clear(S.sr24())
    fr.g('box', 6, 6, 1074, 1080, dash=True, w=4)                        # the two implied squares
    fr.g('box', 6, 840, 1074, 1914, dash=True, w=4)
    fr.g('box', 0, 600, 1080, 1520, w=6)                                 # the stage square
    fr.g('box', 413, 951, 667, 1187, w=5)                                # its golden box
    fr.g('line', [(0, 0), (1080, 608)], dash=True, w=4)                  # the reciprocal: the band's lower edge
    return fr


def n3():
    fr = clear(S.sr14())
    fr.g('line', [(20, 1200), (1060, 1200)], w=6)                        # the horizon, setup A
    for y in (900, 1020):
        fr.g('line', [(20, y), (1060, y)], dash=True, w=4)               # never between these: the half
    fr.g('line', [(470, 920), (610, 1000)], w=5)
    fr.g('line', [(470, 1000), (610, 920)], w=5)
    fr.g('vdim', 176, 1189, 1369)                                        # its head on the horizon
    return fr


def n4():
    fr = Frame(204, 'L')
    S.s1_home(fr)
    fr.rect(150, 1100, 176, 1478, 'K')                                   # a tree on our quay, cut by the left edge
    for cx, cy, rx, ry in ((60, 760, 160, 130), (100, 930, 140, 120), (40, 1100, 170, 140), (120, 1250, 110, 90)):
        fr.blob(cx, cy, rx, ry, 'K', 0.14)
    fr.g('hdim', 700, 0, 216)                                            # one side, <= 216 px
    fr.g('box', 0, 640, 216, 1478, dash=True)
    fr.g('ring', 635, 1110, 80)
    fr.focal = (635, 1110)
    return fr


def n5():
    fr = clear(S.sr8())
    fr.g('vdim', 300, 556, 1000)                                         # the drop: 444 px under the block
    fr.g('arrow', [(540, 612), (540, 912)], dash=True)
    fr.g('ring', 540, 1000, 92)
    return fr


def n6():
    fr = clear(S.sr2())
    for y in (746, 1232, 1268, 1452):
        fr.g('line', [(930, y), (1070, y)], w=6)                         # each plane's top
    fr.g('arrow', [(1000, 1800), (1000, 700)], w=5)                      # farther = higher
    fr.g('ring', 635, 1110, 84)
    return fr


def n7():
    fr = clear(S.sr6())
    a = np.asarray(fr.im)
    two = np.where(np.vectorize(lambda g: GREY_TO_L[g] >= 50)(a), GREY['L'], GREY['K']).astype(np.uint8)
    fr.im = Image.fromarray(two, 'L')
    fr.g('box', 536, 1062, 676, 1380, w=5)                               # the subject: one closed shape
    return fr


def n8():
    fr = clear(S.sr24())
    fr.g('arrow', [(180, 1760), (820, 1520), (330, 1300), (598, 1070)], w=7)   # 3 legs, alternating sides
    fr.g('ring', 598, 985, 96)
    return fr


def n9():
    fr = clear(S.sr12())
    fr.g('hdim', 868, 190, 890)                                          # the object: >= 650 px
    fr.g('ring', 540, 932, 380)                                          # its calm field
    return fr


def n10():
    return S.sr10()


def n11():
    fr = clear(S.sr15())
    fr.g('line', [(20, 1186), (1060, 1186)], dash=True)                  # the low horizon (K7)
    fr.g('arrow', [(540, 1120), (540, 680)], w=6)                        # looking up at the quantity
    fr.g('ring', 540, 1130, 70)
    return fr


def n12():
    fr = clear(S.sr5())
    fr.g('box', 0, 0, 1080, 640, dash=True)                              # the lid behind the band
    fr.g('arrow', [(940, 700), (640, 1040)], w=6)                        # looking down, 35-55 degrees
    fr.g('ring', 560, 1103, 86)
    return fr


def n13():
    return S.sr4()


def n14():
    return S.sr19()


def n15():
    return S.sr18()


# ---------------------------------------------------------------------------------------------------------------------
# The rejected (X1-X6): small, crossed out
# ---------------------------------------------------------------------------------------------------------------------
def x_tiles():
    out = []
    t = thumb(S.sr2())
    out.append(t.filter(ImageFilter.GaussianBlur(4)))                    # X1 blur
    fr = S.sr2()
    fr.guides = []
    fr.text((540, 440), 'TITLE', 230, 'K')                               # X2 a title over the shot
    out.append(thumb(fr))
    card = Image.new('RGB', (TW, TH), (14, 12, 16))
    dc = ImageDraw.Draw(card)
    for p, q in (((20, 470), (150, 260)), ((250, 470), (150, 260))):
        dc.line([p, q], fill=ACCENT, width=3)
    out.append(Image.blend(card, thumb(clear(S.sr7())), 0.5))            # X3 the cross-fade
    a, b = thumb(clear(S.sr9())), thumb(clear(S.sr2()))
    sp = Image.new('RGB', (TW, TH), BG)                                  # X4 the split screen
    sp.paste(a.crop((0, 120, TW, 360)), (0, 0))
    sp.paste(b.crop((0, 200, TW, 440)), (0, 240))
    ImageDraw.Draw(sp).line([(0, 240), (TW, 240)], fill=(250, 250, 250), width=3)
    out.append(sp)
    out.append(thumb(clear(S.sr2())).rotate(13, resample=Image.BICUBIC, fillcolor=(120, 118, 120)))   # X5
    fr = clear(S.sr3())
    for q in ((200, 700), (880, 700), (200, 1500), (880, 1500)):
        fr.g('arrow', [(540 + (q[0] - 540) * 0.3, 1040 + (q[1] - 1040) * 0.3), q], w=8)
    fr.g('arrow', [(540, 1700), (540, 1180)], w=8)
    out.append(thumb(fr))                                                # X6 the dolly zoom
    small = []
    for im in out:
        s = im.resize((TW // 2, TH // 2), Image.LANCZOS)
        d = ImageDraw.Draw(s)
        d.line([(6, 6), (TW // 2 - 6, TH // 2 - 6)], fill=ACCENT, width=6)
        d.line([(TW // 2 - 6, 6), (6, TH // 2 - 6)], fill=ACCENT, width=6)
        small.append(s)
    return small


# ---------------------------------------------------------------------------------------------------------------------
# The catalogue: (code, name, verdict, reference, ours in 9:16, recipes, function)
# ---------------------------------------------------------------------------------------------------------------------
OWNER = [
    ('A1', 'Rule of thirds', 'ADAPT', 'ref 02 4.75 s · 03 0 s · 04a 7.5 s · 04b 28.25 s',
     'lines as 2:1 proportions: horizon y 1280, the figure on x 720; the crossings never hot spots',
     'SR2 SR9 SR14 SR16', a1),
    ('A2', 'Golden section', 'YES', 'ref 03 8.0 s',
     'x 413/667, y 733/1187: its box x 413-667, y 951-1187 is the focal\'s home', 'every focal (rule 3)', a2),
    ('A3', 'Golden section, nested', 'ADAPT', 'ref 03 16.5 s',
     'on the stage square: the tree on x 667, the cabin in the nested cell (570, 1086)', 'SR14 SR15', a3),
    ('A4', 'Golden spiral / golden ratio', 'ADAPT', 'ref 03 2.5 s · 04a 0 s · 04b 22.25 s · 05 3.25 s',
     'scaled: its pole on her, the outer arc from the hero cloud down the side', 'SR6 (v) SR24 (v)', a4),
    ('A5', 'Golden triangle', 'ADAPT', 'ref 03 14.5 s',
     'on the stage square (40°): its feet (626, 987), (454, 1133) in the golden box', 'SR11 SR18', a5),
    ('A6', 'Cross', 'YES', 'ref 03 18.0 s',
     'one upright crossing the lit horizon at the subject, x 413-667', 'SR9 SR15', a6),
    ('A7', 'Symmetry', 'YES', 'ref 02 7.5 s · 04a 3.0 s · titles 01, 04b',
     'the axis x 540 under the words, waterline y 1040-1100; once a film', 'SR23', a7),
    ('B1', 'Leading lines', 'YES', 'ref 02 10.0 s · 04a 12.0 s',
     'from the bottom corners at ~58° to the lit door; they end at the light', 'SR3 SR7 SR24', b1),
    ('B2', 'Vanishing point / one point', 'YES', 'ref 01 13.0 s · 04b 25.25 s',
     'VP on the subject (600, 1080); every receding line ends under the band', 'SR3 SR7', b2),
    ('B3', 'Radiating', 'YES', 'ref 03 13.0 s',
     'tracks fan out from the lit depot door; no ray or wire across the band', 'SR3 SR15 SR21', b3),
    ('B4', 'Tunnel', 'ADAPT', 'ref 03 14.0 s',
     'a tall portal: its sides in the gutters through the band, the lit far end (540, 1040)', 'SR3 SR17', b4),
    ('B5', 'Parallel lines', 'ADAPT', 'ref 01 4.25 s',
     'rail, flight and wall at 40°, all below y 600; the walker passes along them', 'SR10 SR11', b5),
    ('B6', 'Diagonal', 'YES', 'ref 03 3.5 s',
     'one ramp at ~36° rising to the figure, broken by it; never in a cozy beat', 'SR11 SR18 SR20', b6),
    ('B7', 'Double diagonal', 'ADAPT', 'ref 03 11.5 s',
     'from SR5\'s balcony: two streets cross as an X on the focal, under the lid', 'SR5 (v)', b7),
    ('B8', 'S-curve', 'YES', 'ref 03 5.5 s',
     'the canal winds up the frame in 3 bends to the lit door (setup B)', 'SR7 (v)', b8),
    ('B9', 'C-shape', 'YES', 'ref 03 7.0 s',
     'enters under the band (y 600-700), wraps the focal, leaves at y 860-1060', 'SR5', b9),
    ('B10', 'L-shape', 'YES', 'ref 03 6.0 s',
     'a tall pine cut by the top (in the gutter through the band) and the quay\'s line', 'SR3 SR4', b10),
    ('B11', 'V-shape', 'ADAPT', 'ref 03 9.0 s',
     'opens round the band: the arms come in below y 600 and meet at the lit door', 'SR3 SR18', b11),
    ('B12', 'Spiral composition', 'ADAPT', 'ref 05 0 s',
     'SR5\'s raised angle, the lid over the band, the centre (540, 1090)', 'SR5 (v) SR24 (v)', b12),
    ('B13', 'Circular', 'ADAPT', 'ref 03 15.5 s',
     'a round window 460 px across, the one lit window inside the circuit', 'SR4 (v) SR21 (v)', b13),
    ('C1', 'Frame within a frame', 'YES', 'ref 01 10.0 s · 02 0 s · 04a 5.25 s · titles',
     'one tall opening on the axis, 15-30 % of the frame, in the golden box', 'SR2 SR4 SR6 SR8 SR17', c1),
    ('C2', 'Foreground', 'YES', 'ref 02 2.25 s · 05 9.0 s',
     'the near band y 1640-1920 as a hint: <= 2 props, cut by an edge', 'SR2 SR4 SR7', c2),
    ('C3', 'Level change', 'YES', 'ref 01 7.25 s',
     'two levels joined by steps at 30-45°: the subject on one, the effect on the other', 'SR11', c3),
    ('D1', 'Negative space', 'YES', 'ref 04a 9.75 s',
     'the sky with the band is the field (~70 %), the landmark small at its foot', 'SR16 SR18', d1),
    ('D2', 'Scale', 'YES', 'ref 04a 16.5 s',
     'the giant >= 0.7 H cut by the top, one figure ~130 px at its foot', 'SR14 SR15 SR17', d2),
    ('D3', 'Balance', 'ADAPT', 'ref 03 11.0 s',
     'two equal soft masses as the frame (<= 216 px each), one subject on x 540', 'SR23', d3),
    ('D4', 'Unbalanced (the steelyard)', 'ADAPT', 'ref 03 9.5 s',
     'the subject near x 540, the big soft cloud far out and high', 'rule 9: SR2 SR9 SR16', d4),
    ('D5', 'Pyramid', 'YES', 'ref 03 4.5 s',
     'base y 1430, apex on the focal in the golden box, top under the band', 'SR21', d5),
    ('D6', 'Juxtaposition', 'ADAPT', 'ref 05 6.0 s',
     'one seam on a diagonal at eye level, the subject on it', 'SR20', d6),
    ('D7', 'Patterns / repetition', 'YES', 'ref 04a 14.25 s',
     'the windows one texture in one mass, one lit break at (540, 1000)', 'SR8 SR21', d7),
    ('E1', 'One small figure where the lines meet', 'YES', 'ref 04a 0 s · 04b 25.25 s · 04a 5.25 s · 05 3.25 s',
     'a 150 px figure where the jetty\'s lines meet, its head on the horizon', 'SR3 SR7 SR9 SR14 SR15', e1),
    ('E2', 'The lit opening', 'YES', 'ref 02 0 s · 04a 5.25 s · 03 14.0 s · 04a 14.25 s',
     'the aperture the lightest (L* 97), the figure dark in it (L* 18)', 'SR2 SR6 SR7 SR8', e2),
    ('E3', 'Stillness against motion', 'ADAPT', 'ref 01 10.0 s · titles 01, 04b',
     'the figure holds; a tram passes behind in one band, drawn sharp (no blur)', 'SR9 SR10', e3),
    ('E4', 'Looking room', 'ADAPT', 'ref 02 4.75 s · 04b 28.25 s · 04a 9.75 s',
     'facing left at x 720: 590 px ahead, 150 behind (the rail ends at x 870)', 'SR9 SR10 SR14', e4),
    ('E5', 'A soft near layer', 'ADAPT', 'ref 02 2.25 s · 04a 7.5 s · 04b 28.25 s',
     'no blur: a shrub and a table cut by the edges, one step off the quay', 'SR2 SR4 SR7', e5),
    ('E6', 'Atmospheric layers', 'YES', 'ref 02 7.5 s · 04a 16.5 s · 05 3.25 s',
     'rows stacked up the frame, each farther one higher and paler', 'SR2 SR14 SR16 SR17', e6),
    ('E7', 'The closed vista', 'YES', 'ref 01 13.0 s · 02 10.0 s · 04a 3.0 s · 04b 25.25 s',
     'one sight line along the towpath, ended by the lit door', 'SR3 SR7', e7),
    ('E8', 'One colour accent on the subject', 'YES', 'ref 05 3.25 s · 01 10.0 s · 04a 16.5 s',
     'the one window the only warm colour; all else tone-on-tone', 'rule 4: SR1 SR8 SR24', e8),
    ('E9', 'The camera holds; the subject travels the line', 'YES', 'ref 04a 3.0 s · 04a 0 s · 02 0 s · 02 7.5 s',
     'locked: the walker shrinks up the path into the lit door (220 -> 92 px)', 'SR6 SR7 SR9 SR20 SR23', e9),
    ('E10', 'The near "you" over the shoulder', 'ADAPT', 'ref 04b 28.25 s',
     'one whole 180 px "you" at one side, looking in; never a big near head', 'SR13 SR14', e10),
    ('E11', 'The POV hook', 'YES', 'ref 05 12.25 s',
     'the hand from the bottom LEFT, the phone at (380, 1150), the cause above', 'SR13', e11),
    ('T', 'The line first, then the world under it', 'ADAPT', 'ref all five reels (03 throughout)',
     'the pen draws the line, the world floods in under it; never a cross-fade', 'SR1 SR22', tt),
]

OURS = [
    ('N1', 'The centre (the first look)', 'YES', 'cinema §1 · vertical §3',
     'the first look lands at (540, 960): a subject there costs no search', 'SR1 SR12 SR22', n1),
    ('N2', 'The stage square (rabatment)', 'YES', 'cinema §1 · vertical §2',
     'squares y 0-1080, 840-1920; the stage y 600-1520; the reciprocal meets y 608', 'all', n2),
    ('N3', 'The horizon off the half', 'YES', 'cinema §3.2-3.3',
     'setup A y 1150-1300 or B y 690-860, never y 900-1020; heads on the line', 'SR2 SR9 SR14', n3),
    ('N4', 'The repoussoir (one wing)', 'ADAPT', 'cinema §4.6',
     'one side only, cut by its edge, <= 216 px wide', 'SR2 SR4', n4),
    ('N5', 'Headroom: the drop', 'ADAPT', 'cinema §4.7 · vertical §3.3',
     'the band is the headroom: the focal 300-450 px under the block', 'SR6 (rule 3)', n5),
    ('N6', 'Depth stacked up the frame', 'YES', 'cinema §4.8 (Guo Xi) · vertical §2',
     '4-6 planes, each farther one higher, tops >= 40 px apart', 'SR2 SR14-SR17', n6),
    ('N7', 'Figure and ground (notan)', 'YES', 'cinema §4.13-4.14',
     'at two values the subject is one closed shape', 'SR1 SR2 SR6 SR9 SR22', n7),
    ('N8', 'The zigzag way in', 'YES', 'cinema §4.5 (Poore)',
     '2-3 legs of >= 150 px, alternating sides, ending on the focal', 'SR7 SR11 SR24', n8),
    ('N9', 'Isolation', 'YES', 'cinema §2',
     'one object >= 650 px wide on one quiet field', 'SR12 SR22', n9),
    ('N10', 'The pivot', 'YES', 'cinema §8',
     'the subject held within ±40 px while the world slides past', 'SR10 SR17', n10),
    ('N11', 'The low angle', 'ADAPT', 'cinema §3.1',
     'K7, horizon y 1114-1229: only on the quantity, never on the critiqued', 'SR15', n11),
    ('N12', 'The high angle', 'ADAPT', 'cinema §3.1',
     '35-55° down, the lid behind the band; once, never on one person', 'SR5 SR21', n12),
    ('N13', 'Refuge and prospect', 'YES', 'COZY_AND_SCALE §2-3',
     'refuge on >= 2 edges, one opening of 15-30 %', 'SR4', n13),
    ('N14', 'The deliberate match', 'YES', 'STORYBOARD_STYLE §7',
     'the same frame again, one change at the focal', 'SR19 SR24', n14),
    ('N15', 'The off-balance', 'YES', 'cinema §9',
     'one heavy side and nothing against it: the turn only', 'SR18', n15),
]

REJECTED = [
    ('X1', 'Focus and motion blur', 'seen in E3, E5, E10\'s examples', 'DIRECTION rule 5: our look has no blur'),
    ('X2', 'A title over the shot', 'the reels\' titles (01, 04a, 04b)',
     'no title over the captions: the core line goes on the cover'),
    ('X3', 'The opacity cross-fade', 'all five reels (T)', 'DIRECTION rule 8: no fades; the line draws on'),
    ('X4', 'The split screen', 'vertical §2', 'two stacked stages split the eye: one seam (D6) or a sequence'),
    ('X5', 'The Dutch tilt', 'cinema §3.1', 'no roll (DIRECTION rule 8)'),
    ('X6', 'The dolly zoom', 'cinema §8', 'a compound move and a feeling we never want'),
]

FAMILIES = [('A. Where the subject sits', 0, 6), ('B. Lines that carry the eye', 7, 19),
            ('C. Frames, layers and levels', 20, 22), ('D. Masses, balance and contrast', 23, 29),
            ('E. Moves the examples make without naming them', 30, 40), ('T. The reels\' own device', 41, 41)]
VCOL = {'YES': (40, 122, 72), 'ADAPT': (190, 110, 16), 'REJECT': ACCENT}


# ---------------------------------------------------------------------------------------------------------------------
# The sheet
# ---------------------------------------------------------------------------------------------------------------------
SW, M, COLS = 2400, 40, 8
PITCH = (SW - 2 * M) // COLS                        # 290
FAM_H, LAB_H, GAP = 40, 178, 22
ROW_H = FAM_H + TH + LAB_H + GAP


def label(d, x0, ty, dev):
    code, name, verdict, ref, ours, recipes = dev[:6]
    fb = font(19, 'Bold')
    d.text((x0, ty), code, font=fb, fill=ACCENT)
    kw = d.textlength(code + ' ', font=fb)
    for i, line in enumerate(wrap(d, name, fb, TW + 14 - kw)[:2]):
        d.text((x0 + kw, ty + 24 * i), line, font=fb, fill=INK)
    ty += 24 * min(2, len(wrap(d, name, fb, TW + 14 - kw))) + 4
    fv = font(15, 'Bold')
    vw = d.textlength(verdict, font=fv)
    d.rounded_rectangle([x0, ty, x0 + vw + 14, ty + 21], 5, fill=VCOL[verdict])
    d.text((x0 + 7, ty + 2), verdict, font=fv, fill=(255, 255, 255))
    fr_ = font(14)
    rl = wrap(d, ref, fr_, TW + 14 - vw - 22)
    d.text((x0 + vw + 22, ty + 3), rl[0], font=fr_, fill=SUB)
    ty += 25
    for line in rl[1:2]:
        d.text((x0 + vw + 22, ty - 2), line, font=fr_, fill=SUB)
        ty += 18
    for line in wrap(d, ours, font(15), TW + 14)[:3]:
        d.text((x0, ty), line, font=font(15), fill=INK)
        ty += 19
    d.text((x0, ty + 3), '-> ' + recipes, font=font(15, 'SemiBold'), fill=ACCENT)


def section(d, y, title, note):
    d.rectangle([M, y, SW - M, y + 44], fill=INK)
    d.text((M + 16, y + 9), title, font=font(23, 'Bold'), fill=(250, 248, 244))
    tw = d.textlength(title, font=font(23, 'Bold'))
    d.text((M + 36 + tw, y + 13), note, font=font(18), fill=(206, 202, 198))
    return y + 60


def rows(sheet, d, top, devs, thumbs, families):
    n_rows = (len(devs) + COLS - 1) // COLS
    for r in range(n_rows):
        y_row = top + r * ROW_H
        first, last = r * COLS, min(len(devs), (r + 1) * COLS) - 1
        for name, a, b in families:
            lo, hi = max(a, first), min(b, last)
            if lo > hi:
                continue
            x0 = M + (lo - first) * PITCH + 4
            x1 = M + (hi - first + 1) * PITCH - 6
            lab = (name + (' (cont.)' if a < first else '')).upper()
            if d.textlength(lab, font=font(17, 'SemiBold')) > x1 - x0:   # a one-tile span: the family's letter
                lab = (name.split('.')[0] + (' (cont.)' if a < first else '')).upper()
            d.text((x0, y_row + 4), lab, font=font(17, 'SemiBold'), fill=SUB)
            d.line([(x0, y_row + 30), (x1, y_row + 30)], fill=RULE, width=2)
        for i in range(first, last + 1):
            c = i - first
            x0 = M + c * PITCH + (PITCH - TW) // 2
            y0 = y_row + FAM_H
            sheet.paste(thumbs[i], (x0, y0))
            d.rectangle([x0 - 1, y0 - 1, x0 + TW, y0 + TH], outline=(176, 170, 166))
            label(d, x0, y0 + TH + 10, devs[i])
    return top + n_rows * ROW_H


def build_sheet(t_owner, t_ours, t_rej):
    n_own = (len(OWNER) + COLS - 1) // COLS
    n_ours = (len(OURS) + COLS - 1) // COLS
    head_h, rej_h = 300, TH // 2 + 70
    SH = head_h + 60 + n_own * ROW_H + 60 + n_ours * ROW_H + 60 + rej_h + 70
    sheet = Image.new('RGB', (SW, SH), BG)
    d = ImageDraw.Draw(sheet)
    d.text((M, 28), 'Composition devices: every idea in the owner\'s reels, one value thumbnail each', font=font(44, 'Bold'),
           fill=INK)
    d.text((M, 90), 'The owner (2026-10-30): "how many of the ones mentioned in the references you actually took ? I '
                    'don\'t see leading lines or vanishing point or frankly most of the references are not there?"',
           font=font(22), fill=SUB)
    n_yes = sum(1 for x in OWNER[:41] if x[2] == 'YES')
    n_ad = sum(1 for x in OWNER[:41] if x[2] == 'ADAPT')
    d.text((M, 124), 'The owner\'s 41: %d used as they are, %d adapted, 0 rejected (plus T, the reels\' own device). '
                     'His reels\' order and names; under each its reference (reel, time) and our 9:16 version. Our '
                     'additions follow, then the rejected.' % (n_yes, n_ad), font=font(22, 'Medium'), fill=INK)
    y = 172
    x = M
    d.text((x, y + 4), 'Five flat values (L*):', font=font(21, 'SemiBold'), fill=INK)
    x += 236
    for k, L, name in S.VALUES:
        d.rectangle([x, y, x + 44, y + 34], fill=(GREY[k],) * 3, outline=(150, 146, 150))
        lab = '%d %s' % (L, name)
        d.text((x + 54, y + 5), lab, font=font(20), fill=INK)
        x += 54 + int(d.textlength(lab, font=font(20))) + 30
    d.rectangle([x, y, x + 44, y + 34], fill=AMBER, outline=(150, 146, 150))
    d.text((x + 54, y + 5), 'E8 only: its one hot accent', font=font(20), fill=INK)
    y2 = 226
    x = M
    d.text((x, y2 + 4), 'Marked:', font=font(21, 'SemiBold'), fill=INK)
    x += 96
    lab = 'faintly, the caption band (y 290-600, dashed) and the app\'s interface on the owner\'s Reels tab, as on ' \
          'shots_sheet.png;'
    d.text((x, y2 + 5), lab, font=font(20), fill=INK)
    x += int(d.textlength(lab, font=font(20))) + 16
    d.line([(x, y2 + 18), (x + 50, y2 + 18)], fill=ACCENT, width=3)
    d.text((x + 62, y2 + 5), 'the device\'s guide lines, its focal (ring), its key sizes (ticks).', font=font(20),
           fill=INK)
    x = M
    y3 = 262
    for v in ('YES', 'ADAPT', 'REJECT'):
        vw = d.textlength(v, font=font(17, 'Bold'))
        d.rounded_rectangle([x, y3, x + vw + 16, y3 + 26], 5, fill=VCOL[v])
        d.text((x + 8, y3 + 3), v, font=font(17, 'Bold'), fill=(255, 255, 255))
        x += vw + 26
    d.text((x + 6, y3 + 3), 'used as it is · used with the change named (numbers in COMPOSITION_SHOTS.md Part 1) · '
                            'not taken, and why.   -> the recipes (SR) whose Device line names it; (v) a named variant.',
           font=font(19), fill=INK)
    y = section(d, head_h, 'THE OWNER\'S 41', 'in his reels\' order, with their names: placement A1-A7, lines '
                                                'B1-B13, frames C1-C3, masses D1-D7, unnamed moves E1-E11; then T')
    y = rows(sheet, d, y, OWNER, t_owner, FAMILIES)
    y = section(d, y + 10, 'OUR ADDITIONS (not in the owner\'s reels)', 'from our research (cinema.md, vertical.md) '
                                                                         'and the library\'s own; they come after his, '
                                                                         'never instead')
    y = rows(sheet, d, y, OURS, t_ours, [('Our additions', 0, len(OURS) - 1)])
    y = section(d, y + 10, 'REJECTED', 'none of the owner\'s 41: three treatments seen in his reels (X1-X3) and three from our '
                                       'research (X4-X6), each fighting the tall frame or a rule in force')
    for i, (code, name, seen, why) in enumerate(REJECTED):          # one row of six: a small crossed tile + why
        x0 = M + i * ((SW - 2 * M) // 6)
        sheet.paste(t_rej[i], (x0, y + 4))
        d.rectangle([x0 - 1, y + 3, x0 + TW // 2, y + 4 + TH // 2], outline=(176, 170, 166))
        tx = x0 + TW // 2 + 12
        tw = (SW - 2 * M) // 6 - TW // 2 - 22
        ty = y + 8
        d.text((tx, ty), code, font=font(18, 'Bold'), fill=ACCENT)
        ty += 24
        for line in wrap(d, name, font(18, 'Bold'), tw)[:3]:
            d.text((tx, ty), line, font=font(18, 'Bold'), fill=INK)
            ty += 22
        ty += 4
        for line in wrap(d, seen, font(14), tw)[:3]:
            d.text((tx, ty), line, font=font(14), fill=SUB)
            ty += 18
        ty += 4
        for line in wrap(d, 'why: ' + why, font(15), tw)[:5]:
            d.text((tx, ty), line, font=font(15), fill=INK)
            ty += 19
    d.text((M, SH - 60), 'Script: video/docs/look/composition/devices_sheet.py (PIL, seeded; drawn from the catalogue\'s '
                         'numbers with shots_sheet.py\'s kit; no image copied, traced or used as an input).',
           font=font(18), fill=SUB)
    d.text((M, SH - 34), 'The catalogue, the numbers and the coverage table: video/docs/look/COMPOSITION_SHOTS.md, '
                         'Part 1. The reels\' own frames: composition/reels_sheet.jpg.', font=font(18), fill=SUB)
    return sheet


def band_check(code, fr):
    a = np.asarray(fr.im)
    band = np.unique(a[290:600, 95:945])
    vals = sorted({GREY_TO_L.get(int(g), -1) for g in np.unique(a)}, reverse=True)
    return '%-4s values %s  band %s' % (code, '/'.join(str(v) for v in vals),
                                       'flat' if len(band) == 1 else 'NOT FLAT %s' % [GREY_TO_L.get(int(g)) for g in band])


def main(argv):
    pdir = argv[argv.index('--phone') + 1] if '--phone' in argv else None
    tdir = argv[argv.index('--thumbs') + 1] if '--thumbs' in argv else None
    t_owner, t_ours = [], []
    for devs, out in ((OWNER, t_owner), (OURS, t_ours)):
        for dev in devs:
            fr = dev[6]()
            th = thumb(fr)
            out.append(th)
            if tdir:
                os.makedirs(tdir, exist_ok=True)
                th.save(os.path.join(tdir, dev[0] + '.png'))
                print(band_check(dev[0], fr))
    t_rej = x_tiles()
    sheet = build_sheet(t_owner, t_ours, t_rej)
    sheet.save(OUT, optimize=True)
    print('wrote', OUT, sheet.size)
    if pdir:
        os.makedirs(pdir, exist_ok=True)
        w = 1170
        sheet.resize((w, int(sheet.height * w / sheet.width)), Image.LANCZOS).save(os.path.join(pdir, 'phone_fit.png'))
        sheet.crop((0, 300, SW // 2, 300 + 60 + ROW_H)).save(os.path.join(pdir, 'phone_zoom_row1a.png'))
        g = Image.new('RGB', (8 * 80 + 10, 8 * 132 + 10), (255, 255, 255))
        for i, t in enumerate(t_owner + t_ours):
            g.paste(t.resize((TW // 4, TH // 4), Image.LANCZOS), (10 + (i % 8) * 80, 10 + (i // 8) * 132))
        g.save(os.path.join(pdir, 'gist_quarter.png'))
        print('phone views in', pdir)


if __name__ == '__main__':
    main(sys.argv[1:])
