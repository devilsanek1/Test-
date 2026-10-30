#!/usr/bin/env python3
"""Video 4 (Helsinki): the composition-and-motion pass as 12 PLANNING value thumbnails, one per shot S1-S12
(`COMPOSITION_PASS.md`). Not a render: G3 builds and plays the real sketch.

Each thumbnail is our 1080 x 1920 frame drawn at full size in frame px (so the pass's numbers are used as they stand)
and shown small: five flat greys (L* 97 / 80 / 60 / 40 / 18; white only for the story light), the one warm accent of
the film's colour key (the heat) in amber, the caption band and the app's interface on the owner's Reels tab marked
faintly; in RED the shot's frame device (its guide lines, the focal ring) and the motion inside the shot (arrows); in
BLUE the join's carrier (what crosses into the next shot). Under each: the shot, its time and frames, the lead device
with its tier, the move and the join with their codes (`video/docs/look/COMPOSITION_SHOTS.md` Part 0).

The drawing kit is the composition library's (`video/docs/look/composition/shots_sheet.py`, the `Frame` class, and
`devices_sheet.py`'s tile conventions), imported from the first folder that has it: this repo's
`video/docs/look/composition/`, then $COMPOSITION_KIT, then the main checkout. Seeded and deterministic; no image is
copied, traced or used as an input.

    python3 -B composition_pass_sheet.py              # writes composition_pass_sheet.png next to this script
    python3 -B composition_pass_sheet.py --tiles DIR  # also each full-size planning frame as DIR/Sn.png
"""
import math
import os
import sys

sys.dont_write_bytecode = True
HERE = os.path.dirname(os.path.abspath(__file__))
_CANDIDATES = [os.path.normpath(os.path.join(HERE, '..', '..', 'look', 'composition')),
               os.environ.get('COMPOSITION_KIT', ''),
               '/home/user/Test-/video/docs/look/composition']
KIT = next((c for c in _CANDIDATES if c and os.path.exists(os.path.join(c, 'shots_sheet.py'))
            and os.path.exists(os.path.join(c, 'devices_sheet.py'))), None)
if KIT is None:
    sys.exit('the composition kit (shots_sheet.py, devices_sheet.py) was not found; set COMPOSITION_KIT')
sys.path.insert(0, KIT)

import numpy as np  # noqa: E402
from PIL import Image, ImageDraw  # noqa: E402

import shots_sheet as S  # noqa: E402
import devices_sheet as D  # noqa: E402,F401  (the tile conventions: guides 1.5x+, colour patches, the veil)
from shots_sheet import FH, FW, GREY, Frame, catmull, font, wobble, wrap  # noqa: E402

OUT = os.path.join(HERE, 'composition_pass_sheet.png')
RED = S.ACCENT                       # the frame device and the motion
BLUE = (34, 116, 214)                # the join's carrier
AMBER = D.AMBER                      # the one warm accent: the heat
GW = 13                              # guide width at frame size (~4 px on the tile)


# ---------------------------------------------------------------------------------------------------------------------
# Guides: red (device, motion) and blue (carrier), drawn over the frame at full size
# ---------------------------------------------------------------------------------------------------------------------
def g(fr, kind, *a, **kw):
    fr.guides.append((kind, a, kw))


def c(fr, kind, *a, **kw):
    kw = dict(kw, col=BLUE)
    fr.guides.append((kind, a, kw))


def _dash(d, pts, w, col, on=46.0, off=30.0):
    S._polyline_dash(d, pts, w, col, on, off)


def _head(d, p_from, p_to, col, L=66.0, W=56.0):
    S._head(d, p_from, p_to, col, L, W)


def draw_guides(rgba, guides):
    ov = Image.new('RGBA', (FW, FH), (0, 0, 0, 0))
    d = ImageDraw.Draw(ov)
    for kind, a, kw in guides:
        col = kw.get('col', RED) + (255,)
        w = kw.get('w', GW)
        dash = kw.get('dash', False)
        if kind in ('line', 'arrow', 'curve'):
            pts = catmull(a[0], 12) if kind == 'curve' else [tuple(p) for p in a[0]]
            arrow = kind == 'arrow' or kw.get('arrow', False)
            if arrow:
                (x0, y0), (x1, y1) = pts[-2], pts[-1]
                L = math.hypot(x1 - x0, y1 - y0) or 1.0
                tip = pts[-1]
                pts = pts[:-1] + [(x1 - (x1 - x0) / L * 50, y1 - (y1 - y0) / L * 50)]
            if dash:
                _dash(d, pts, w, col)
            else:
                d.line(pts, fill=col, width=w, joint='curve')
            if arrow:
                _head(d, pts[-1], tip, col)
        elif kind == 'ring':
            cx, cy, r = a
            d.ellipse([cx - r, cy - r, cx + r, cy + r], outline=col, width=w)
        elif kind == 'box':
            x0, y0, x1, y1 = a
            pts = [(x0, y0), (x1, y0), (x1, y1), (x0, y1), (x0, y0)]
            if dash:
                _dash(d, pts, w, col)
            else:
                d.line(pts, fill=col, width=w, joint='curve')
        elif kind == 'tri':
            pts = [tuple(p) for p in a[0]] + [tuple(a[0][0])]
            d.line(pts, fill=col, width=w, joint='curve')
        elif kind == 'cross':
            cx, cy, r = a
            d.line([(cx - r, cy), (cx + r, cy)], fill=col, width=w)
            d.line([(cx, cy - r), (cx, cy + r)], fill=col, width=w)
        elif kind == 'hdim':
            y, x0, x1 = a
            d.line([(x0, y), (x1, y)], fill=col, width=w)
            for x in (x0, x1):
                d.line([(x, y - 30), (x, y + 30)], fill=col, width=w)
        elif kind == 'vdim':
            x, y0, y1 = a
            d.line([(x, y0), (x, y1)], fill=col, width=w)
            for y in (y0, y1):
                d.line([(x - 30, y), (x + 30, y)], fill=col, width=w)
        elif kind == 'corners':                      # the camera at rest: four corner brackets
            x0, y0, x1, y1, L = a
            for (x, y, sx, sy) in ((x0, y0, 1, 1), (x1, y0, -1, 1), (x0, y1, 1, -1), (x1, y1, -1, -1)):
                d.line([(x + sx * L, y), (x, y), (x, y + sy * L)], fill=col, width=w, joint='curve')
    return Image.alpha_composite(rgba, ov)


def accent(fr, kind, *a):
    """The one warm accent (the heat), painted over the grey picture before the furniture."""
    fr.amber.append((kind, a))


def full(fr):
    """The planning frame at full size: the greys, the amber accent, the faint furniture, the guides."""
    gim = fr.im
    rgba = Image.merge('RGBA', (gim, gim, gim, Image.new('L', (FW, FH), 255)))
    da = ImageDraw.Draw(rgba)
    for kind, a in getattr(fr, 'amber', []):
        if kind == 'rect':
            da.rectangle([float(v) for v in a[0]], fill=AMBER + (255,))
        elif kind == 'ell':
            cx, cy, rx, ry = a
            da.ellipse([cx - rx, cy - ry, cx + rx, cy + ry], fill=AMBER + (255,))
        elif kind == 'line':
            pts, w = a[0]
            da.line([(float(x), float(y)) for x, y in pts], fill=AMBER + (255,), width=int(w), joint='curve')
        elif kind == 'bust':                          # a person in the lit window, dark against the warm light
            cx, base, P = a
            k = (GREY['K'],) * 3 + (255,)
            da.ellipse([cx - P * 0.17, base - P * 0.74 - P * 0.21, cx + P * 0.17, base - P * 0.74 + P * 0.21], fill=k)
            da.polygon([(cx - P * 0.43, base), (cx - P * 0.40, base - P * 0.33), (cx - P * 0.22, base - P * 0.45),
                        (cx + P * 0.22, base - P * 0.45), (cx + P * 0.40, base - P * 0.33), (cx + P * 0.43, base)],
                       fill=k)
    band = np.asarray(gim)[290:600, 95:945]
    rgba = S.furniture(rgba, S.GREY_TO_L.get(int(np.median(band)), 50) < 55)
    return draw_guides(rgba, fr.guides).convert('RGB')


def new(seed, base):
    fr = Frame(seed, base)
    fr.amber = []
    return fr


# ---------------------------------------------------------------------------------------------------------------------
# The home view (COMPOSITION_PASS.md, "The home view in numbers"), drawn through a map so S11 can use it at 1.15x
# ---------------------------------------------------------------------------------------------------------------------
class Map:
    """Home-view px -> frame px: the window (598, 985) lands at (tx, ty), scaled k about it."""

    def __init__(self, k=1.0, tx=598.0, ty=985.0):
        self.k, self.tx, self.ty = k, tx, ty

    def __call__(self, x, y):
        return (self.tx + self.k * (x - 598.0), self.ty + self.k * (y - 985.0))

    def pts(self, pts):
        return [self(x, y) for x, y in pts]

    def r(self, v):
        return v * self.k


def home(fr, m, state='hook', person='street'):
    """state: 'hook' (S1 at ~2.2 s), 'follow' (S11: the front mid-run), 'payoff' (S12). person: 'street' or 'window'."""
    k = m.k
    fr.cloud(*m(230, 170), m.r(620), m.r(230), 'M')                       # the hero snow cloud, top gutter
    sky_floor = m(0, 1100)[1]
    fr.skyline(0, 1080, m(0, 1170)[1], (m(0, 1090)[1], m(0, 1150)[1]), 'K', wmin=30 * k, wmax=96 * k, gable=0.2,
               tall=0.15, tall_top=(m(0, 1060)[1], m(0, 1085)[1]))      # the far city on the horizon
    lit = 'L' if state == 'payoff' else 'M'
    fr.dots(np.arange(10, 1080, 30 * k), (m(0, 1122)[1], m(0, 1146)[1]), 4 * k, lit, skip=0.5, jit=5)
    fr.rect(0, m(0, 1166)[1], 1080, m(0, 1214)[1], 'K')                   # the harbour
    fr.rect(0, m(0, 1214)[1], 1080, 1920, 'M')                            # the snowy street: the near quiet field
    for y in (1300, 1338):                                                # kerb and tram rails, tone-on-tone
        fr.line([(0, m(0, y)[1]), (1080, m(0, y)[1])], 'D', max(3, 5 * k))
    # the giant computer, left third, its rows of small cool lights
    fr.hpoly(m.pts([(66, 842), (282, 836), (284, 1216), (64, 1216)]), 'K', amp=2)
    fr.rect(*m(68, 828), *m(280, 842), 'M', amp=1)                        # snow on its top
    for yy in np.arange(870, 1200, 38):
        for xx in np.arange(92, 270, 30):
            if fr.rng.random() > 0.3:
                fr.ell(*m(xx, yy), 4.5 * k, 4.5 * k, 'D' if state != 'payoff' else 'M')
    # the block on the axis: one closed dark shape, its panes one texture, its one window
    roof = [(378, 700), (470, 698), (476, 668), (506, 668), (510, 696), (700, 692), (704, 674), (728, 674),
            (732, 692), (812, 690)]
    fr.hpoly(m.pts(roof + [(812, 1262), (378, 1262)]), 'K', amp=2)
    fr.hpoly(m.pts([(372, 704), (818, 694), (812, 682), (378, 690)]), 'M', amp=2)   # snow on the roof
    for cy in (775, 880, 985, 1090):
        for cx in (438, 518, 598, 678, 758):
            if (cx, cy) == (598, 985) or fr.rng.random() < 0.18:
                continue
            x0, y0 = m(cx - 30, cy - 40)
            x1, y1 = m(cx + 30, cy + 40)
            fr.rect(x0, y0, x1, y1, 'D', amp=1.2)
    fr.rect(*m(388, 1186), *m(808, 1262), 'D', amp=1)                    # the snow-lit plinth (the resident reads on it)
    fr.rect(*m(532, 1182), *m(588, 1262), 'K', amp=1)                    # the door
    # the next block, right third, darker and quiet
    fr.hpoly(m.pts([(812, 762), (1100, 756), (1100, 1262), (812, 1262)]), 'K', amp=2)
    for cy in (840, 950, 1060):
        for cx in (868, 948, 1028):
            if fr.rng.random() > 0.3:
                x0, y0 = m(cx - 24, cy - 32)
                x1, y1 = m(cx + 24, cy + 32)
                fr.rect(x0, y0, x1, y1, 'D', amp=1)
    # the one window: the story light, its glow one step out
    fr.rrect(*m(546, 923), *m(650, 1047), 20 * k, 'L')
    fr.rect(*m(564, 941), *m(632, 1029), 'W')
    accent(fr, 'rect', (*m(566, 943), *m(630, 1027)))
    if person == 'window':                                               # the resident, home (over the accent)
        bx, by = m(604, 1029)
        fr.bust(bx, by, 62 * k, 'K')
        accent(fr, 'bust', bx, by, 62 * k)
    fr.rect(*m(595, 941), *m(601, 1029), 'K')                            # the mullion
    # the run: the melt line in the snow, the manhole (the small box), the soft painted riser
    run = [(250, 1230), (330, 1272), (420, 1272), (560, 1272), (598, 1262), (598, 1062)]
    fr.line(m.pts(run), 'D', 22 * k)
    warm = {'hook': run, 'payoff': run, 'follow': run[:3] + [(450, 1272)]}[state]
    fr.line(m.pts(warm), 'L', 9 * k)
    fr.ell(*m(420, 1272), 26 * k, 10 * k, 'K')                          # the manhole
    if state != 'follow':
        accent(fr, 'line', (m.pts(warm[-2:]), 7 * k))
    fr.steam(*m(420, 1262), m(0, 1150)[1], 34 * k, 'M', sway=10 * k, ceiling=sky_floor)
    if person == 'street':                                               # the resident walking home, tier B
        fr.person(*m(780, 1340), m.r(180), 'K', view='side', facing=-1)
    fr.ell(*m(845, 905), 9 * k, 7 * k, 'D')                              # Pip, tone-on-tone on a balcony
    return run


# ---------------------------------------------------------------------------------------------------------------------
# The 12 shots (frame px; the numbers are COMPOSITION_PASS.md's)
# ---------------------------------------------------------------------------------------------------------------------
def s1():
    """The hook at ~2.2 s: the run laid first (the line first, T), the one window lit on "heat" in the golden box."""
    fr = new(401, 'D')
    home(fr, Map(1.0), 'hook', 'street')
    g(fr, 'arrow', [(140, 1196), (250, 1196), (330, 1238), (560, 1238), (640, 1228), (640, 1090)])  # the run, first
    g(fr, 'ring', 140, 1230, 26)                                         # the brush's start (x >= 140)
    g(fr, 'box', 413, 951, 667, 1187, dash=True, w=7)                    # the golden box
    g(fr, 'ring', 598, 985, 112)                                         # the focal: the one break, lit
    c(fr, 'arrow', [(560, 1090), (560, 1312), (330, 1312), (240, 1262)], dash=True)   # the brush un-paints back
    return fr


def s2():
    """The medium on "giant": the computer on the axis, the plan's walls rising round it on "buildings"."""
    fr = new(402, 'D')
    fr.cloud(300, 160, 600, 220, 'M')
    fr.skyline(0, 1080, 1438, (1313, 1407), 'K', wmin=46, wmax=150, gable=0.2)       # the far city, behind
    fr.dots(np.arange(10, 1080, 46), (1360, 1400), 6, 'M', skip=0.5, jit=6)
    fr.rect(0, 1432, 1080, 1507, 'K')                                    # the harbour
    fr.rect(0, 1507, 1080, 1920, 'M')                                    # the footprint's snow
    for p, q in (((110, 625), (110, 1600)), ((970, 625), (970, 1600)), ((110, 625), (330, 760)),
                 ((970, 625), (750, 760)), ((110, 1600), (330, 1470)), ((970, 1600), (750, 1470)),
                 ((330, 1470), (750, 1470))):
        fr.line([p, q], 'L', 8)                                          # the plan, only marked out (back open)
    fr.hpoly([(372, 924), (706, 918), (708, 1510), (370, 1510)], 'K', amp=2)   # the computer, 336 x 590
    fr.rect(372, 906, 708, 924, 'M', amp=1)
    for yy in np.arange(960, 1490, 44):
        for xx in np.arange(404, 690, 40):
            if fr.rng.random() > 0.3:
                fr.ell(xx, yy, 6, 6, 'M')
    g(fr, 'box', 110, 625, 970, 1600, dash=True, w=8)                    # C1: the plan frames the machine
    g(fr, 'arrow', [(170, 1060), (430, 1190)])                           # its drift to the axis as the push lands
    g(fr, 'ring', 540, 1050, 96)
    c(fr, 'ring', 540, 912, 66)                                          # the cue: flakes melting on its top
    c(fr, 'box', 270, 465, 810, 1425, dash=True, w=9)                    # S3's frame: the 2x push
    return fr


def s3():
    """The close: the top 672 px wide, the melt lit, steam pouring off on "hot", thinning under the band."""
    fr = new(403, 'D')
    for _ in range(60):
        x, y = fr.rng.uniform(0, 1080), fr.rng.uniform(630, 1880)
        if not (180 < x < 900 and y > 860):
            fr.ell(x, y, 5, 5, 'M')                                      # snow falling (none in the band)
    fr.steam(500, 915, 640, 300, 'M', sway=46)
    fr.steam(610, 915, 700, 250, 'M', sway=-30)
    fr.steam(545, 915, 820, 230, 'L', sway=16)
    fr.poly([(214, 900), (866, 900), (890, 935), (190, 935)], 'L')       # its top, catching the light
    fr.poly([(400, 902), (680, 902), (690, 933), (390, 933)], 'W')       # the melt: the story light
    accent(fr, 'rect', (404, 905, 676, 930))
    fr.rect(190, 935, 890, 1920, 'K')                                    # its face, the deepest
    fr.rect(190, 935, 212, 1920, 'M')
    fr.dots(np.arange(250, 860, 40), np.arange(1000, 1480, 44), 4.5, 'D', skip=0.35, jit=1.0)
    g(fr, 'hdim', 862, 204, 876)                                         # N9: >= 650 px
    g(fr, 'ring', 540, 915, 104)
    c(fr, 'arrow', [(545, 870), (545, 650)])                             # the steam column carries the eye up
    c(fr, 'ring', 545, 612, 40)                                          # its top held at the band's floor
    return fr


def kettles(fr, rows):
    for y, width, s in rows:
        for i in range(8):
            x = 540 - width / 2 + width * (i + 0.5) / 8 + fr.rng.uniform(-3, 3)
            fr.blob(x, y - s * 0.30, s * 0.42, s * 0.36, 'D', 0.05)
            fr.poly([(x + s * 0.30, y - s * 0.40), (x + s * 0.62, y - s * 0.66), (x + s * 0.66, y - s * 0.58),
                     (x + s * 0.36, y - s * 0.22)], 'D')
            fr.ell(x, y - s * 0.66, s * 0.12, s * 0.07, 'K')


def s4():
    """The lineup on "FORTY": 5 rows of 8 kettles under the computer, the pyramid's apex."""
    fr = new(404, 'D')
    fr.skyline(0, 1080, 1268, (1143, 1237), 'K', wmin=46, wmax=150, gable=0.2)
    fr.rect(0, 1262, 1080, 1337, 'K')
    fr.rect(0, 1337, 1080, 1920, 'M')
    for x in (60, 1020):
        fr.line([(x, 300), (x, 1700)], 'L', 8)                           # the plan's side walls, in the gutters
    fr.steam(540, 752, 640, 280, 'M', sway=20)
    fr.hpoly([(372, 754), (706, 748), (708, 1340), (370, 1340)], 'K', amp=2)   # the computer: the apex
    fr.rect(372, 736, 708, 754, 'M', amp=1)
    fr.dots(np.arange(404, 690, 40), np.arange(790, 1320, 44), 6, 'M', skip=0.3)
    fr.rect(522, 868, 558, 1060, 'W')                                    # its lit grille: the hardest step
    accent(fr, 'rect', (525, 871, 555, 1057))
    kettles(fr, [(1366, 480, 50), (1396, 530, 56), (1426, 580, 62), (1456, 620, 68), (1486, 660, 74)])
    for x in (420, 500, 580, 660):
        fr.steam(x, 1330, 1180, 56, 'M', sway=10)
    g(fr, 'tri', [(210, 1490), (870, 1490), (540, 752)])                 # D5: the pyramid
    g(fr, 'ring', 540, 964, 84)
    for y in (1366, 1396, 1426, 1456, 1486):                             # the rows pop back to front, 6 f apart
        g(fr, 'line', [(150, y - 20), (190, y - 20)], w=9)
    c(fr, 'arrow', [(540, 730), (540, 628)])                             # the steam column: the camera follows it up
    c(fr, 'box', 270, 235, 810, 1195, dash=True, w=9)                    # S5's frame: the 2x push
    return fr


def s5():
    """The mug pops on "tea" at the pivot (540, 955), in a field of steam."""
    fr = new(405, 'D')
    for x, sway, w in ((360, 30, 240), (540, 16, 300), (720, -26, 240)):
        fr.steam(x, 1030, 640, w, 'M', sway=sway)
    fr.poly([(214, 1015), (866, 1015), (890, 1050), (190, 1050)], 'L')
    fr.rect(190, 1050, 890, 1920, 'K')
    fr.rect(190, 1050, 212, 1920, 'M')
    fr.dots(np.arange(250, 860, 40), np.arange(1110, 1480, 44), 4.5, 'D', skip=0.35, jit=1.0)
    fr.rrect(470, 892, 610, 1032, 26, 'L')                               # the mug
    fr.ell(626, 958, 34, 40, 'L')                                        # its handle
    fr.ell(626, 958, 16, 22, 'K')
    fr.ell(540, 896, 64, 12, 'D')                                        # the tea
    fr.steam(540, 884, 760, 60, 'L', sway=14)                            # its small curl
    g(fr, 'ring', 540, 955, 118)
    c(fr, 'cross', 540, 955, 44)                                         # the pivot the big move holds
    for sx, sy in ((-1, -1), (1, -1), (-1, 1), (1, 1)):                  # the world will shrink toward it
        c(fr, 'arrow', [(540 + sx * 420, 955 + sy * 520), (540 + sx * 250, 955 + sy * 310)], w=9)
    return fr


def s6():
    """The landing on "fans": the Earth's curve (limb y 780), Helsinki's warm spot held at the pivot."""
    fr = new(406, 'D')
    R = 2600.0
    arc = lambda x: 780 + R - math.sqrt(R * R - (x - 540) ** 2)  # noqa: E731
    xs = np.linspace(0, 1080, 60)
    fr.poly([(x, arc(x)) for x in xs] + [(1080, 1920), (0, 1920)], 'K')  # the night side's sea
    fr.poly([(x, arc(x) - 7) for x in xs] + [(x, arc(x) + 9) for x in xs[::-1]], 'L')   # the limb's light
    term = catmull([(760, arc(760) + 9), (830, 1160), (900, 1450), (950, 1920)], 12)
    fr.poly([(x, arc(x) + 9) for x in np.linspace(760, 1080, 20)] + [(1080, 1920)] + term[::-1], 'M')   # dusk side
    fr.blob(420, 1040, 420, 110, 'D', 0.12)                              # the land, round Helsinki
    fr.blob(250, 1230, 300, 90, 'D', 0.14)
    fr.blob(700, 1200, 240, 70, 'D', 0.14)
    for x, y, h in ((380, 1060, 150), (700, 1090, 130), (540, 1120, 190), (260, 1190, 120), (820, 1210, 110)):
        fr.rect(x - 18, y - 10, x + 18, y + 10, 'M')                     # a box with roof fans
        fr.steam(x, y - 12, y - h, 36, 'L', sway=12)                     # its plume
    fr.ell(540, 955, 30, 22, 'L')
    fr.ell(540, 955, 14, 11, 'W')                                        # Helsinki: the one warm accent
    accent(fr, 'ell', 540, 955, 12, 9)
    for i, (w, h) in enumerate(((54, 96), (162, 288), (405, 720))):
        g(fr, 'box', 540 - w / 2, 955 - h / 2, 540 + w / 2, 955 + h / 2, dash=i > 0, w=9)   # the move's steps
    g(fr, 'ring', 540, 955, 64)
    c(fr, 'ring', 540, 955, 128, dash=True)                              # the alternative's opening (J2)
    return fr


def s7():
    """The turn: the computer off the axis at x ~330, the open half to its right; the reach drawn on "WANTS"."""
    fr = new(407, 'D')
    fr.cloud(860, 150, 560, 210, 'M')
    fr.skyline(0, 1080, 1150, (1080, 1130), 'K', wmin=36, wmax=110, gable=0.2)
    fr.dots(np.arange(560, 1080, 30), (1100, 1126), 4, 'M', skip=0.5, jit=4)
    fr.rect(0, 1150, 1080, 1190, 'K')                                    # the harbour
    fr.rect(0, 1190, 1080, 1920, 'M')                                    # the street's start, snow
    for p, q in (((120, 1300), (560, 1300)), ((160, 1215), (520, 1215)), ((120, 1300), (160, 1215)),
                 ((560, 1300), (520, 1215))):
        fr.line([p, q], 'L', 6)                                          # the plan's footprint on the snow
    fr.steam(330, 798, 630, 200, 'M', sway=24)
    fr.hpoly([(215, 804), (445, 798), (447, 1210), (213, 1210)], 'K', amp=2)   # the computer, the heavy mass
    fr.rect(215, 786, 445, 804, 'L', amp=1)                              # its top, lit warm from inside
    accent(fr, 'rect', (230, 789, 430, 801))
    fr.rect(431, 812, 445, 1204, 'W')                                    # the key's edge: the story light
    fr.dots(np.arange(244, 420, 34), np.arange(840, 1190, 40), 5, 'D', skip=0.3)
    fr.ell(330, 1218, 160, 16, 'D')                                      # its contact shadow
    fr.ell(760, 1320, 34, 12, 'K')                                       # the city's pipe ends at a manhole
    for i in range(9):                                                   # the reach: a marked-out line, empty
        x0 = 726 - i * 32
        fr.line([(x0, 1318 - i * 2), (x0 - 18, 1317 - i * 2)], 'L', 7)
    g(fr, 'line', [(540, 640), (540, 1500)], dash=True, w=7)             # the axis it left (N15)
    g(fr, 'arrow', [(740, 1262), (470, 1250)])                           # the reach across the open half (B1)
    g(fr, 'ring', 330, 880, 112)
    c(fr, 'ring', 330, 700, 70)                                          # the steam over the empty stretch
    c(fr, 'arrow', [(360, 1010), (520, 1100)])                           # the push re-centres on the plan
    return fr


def plan_walls(fr):
    for p, q in (((150, 713), (150, 1450)), ((930, 713), (930, 1450)), ((150, 713), (330, 800)),
                 ((930, 713), (750, 800)), ((150, 1450), (330, 1330)), ((930, 1450), (750, 1330)),
                 ((330, 1330), (750, 1330)), ((150, 1450), (930, 1450))):
        fr.line([p, q], 'L', 7)


def s8():
    """The plan alone: walls only marked out, the computer inside, the 2027 tag on the front wall on "next"."""
    fr = new(408, 'D')
    fr.skyline(0, 1080, 1180, (1120, 1160), 'K', wmin=36, wmax=110, gable=0.15)
    fr.rect(0, 1176, 1080, 1222, 'K')
    fr.hpoly([(730, 1150), (900, 1146), (890, 1180), (740, 1180)], 'D', amp=1)   # the ferry beyond the plan
    fr.ell(762, 1140, 7, 6, 'D')                                         # Pip at its rail
    fr.rect(0, 1222, 1080, 1920, 'M')
    fr.steam(540, 957, 640, 220, 'M', sway=20)
    plan_walls(fr)
    fr.hpoly([(400, 962), (680, 956), (682, 1450), (398, 1450)], 'K', amp=2)   # the computer, 280 x 491
    fr.rect(400, 944, 680, 962, 'M', amp=1)
    fr.dots(np.arange(428, 670, 36), np.arange(1270, 1430, 40), 5, 'D', skip=0.3)
    fr.line([(540, 1040), (540, 1066)], 'K', 5)                          # the pin's string
    fr.ell(540, 1038, 8, 8, 'K')
    fr.rect(400, 1066, 680, 1236, 'W', amp=1.5)                          # the tag: the paper lit (drop 594 px)
    fr.text((540, 1152), '2027', 122, 'K')
    g(fr, 'box', 150, 713, 930, 1450, dash=True, w=8)                    # C1: the plan frames the machine
    g(fr, 'vdim', 800, 1116, 1188)                                       # the figures ~72 px
    g(fr, 'ring', 540, 1151, 170)
    c(fr, 'ring', 540, 1360, 54)                                         # the cue: its small lights blink
    c(fr, 'arrow', [(720, 1250), (720, 1560)])                           # the dolly passes the tag out below
    return fr


def machine_15(fr, opened=True):
    """S9-S10's held frame: the computer at 1.5x the home view (x 378-702, y 840-1407)."""
    fr.skyline(0, 1080, 1338, (1218, 1308), 'K', wmin=46, wmax=150, gable=0.2)
    fr.rect(0, 1334, 1080, 1404, 'K')
    fr.rect(0, 1404, 1080, 1920, 'M')
    fr.hpoly([(378, 844), (702, 838), (704, 1407), (376, 1407)], 'K', amp=2)
    fr.rect(378, 826, 702, 844, 'M', amp=1)
    fr.line([(0, 884), (300, 884), (340, 860), (400, 860)], 'K', 14)     # the inlet, cool water still in it
    if opened:
        fr.poly([(400, 880), (326, 904), (326, 1366), (400, 1390)], 'D')  # the door, swung open on its hinge
        fr.rect(400, 880, 680, 1390, 'L')                                # inside, lit: the lightest area below the sky
        for i in range(8):
            y = 886 + i * 63
            fr.rect(414, y + 6, 666, y + 50, 'D', amp=1)                 # the 8 stacked machines
        fr.rect(532, 880, 548, 1392, 'K')                                # the pipe down past each, empty


def s9():
    """On "how" its side opens like a cabinet door: inside, 8 stacked machines and an empty pipe."""
    fr = new(409, 'D')
    fr.steam(540, 836, 630, 240, 'M', sway=18)
    machine_15(fr)
    g(fr, 'box', 400, 880, 680, 1390, w=9)                               # E2: the lit opening
    g(fr, 'curve', [(680, 846), (520, 812), (370, 852)], arrow=True)     # the door's swing
    g(fr, 'ring', 540, 1135, 92)
    c(fr, 'corners', 60, 640, 1020, 1480, 110)                           # the camera at rest across the join
    return fr


def s10():
    """The hall's rows recede to a vanishing point hidden behind the machine; water runs down; hot water out."""
    fr = new(410, 'D')
    vp = (540, 1150)
    for x in (-420, -60, 260, 820, 1140, 1500):                          # the floor's joints, converging on the VP
        fr.line([(x, 1920), (540 + (x - 540) * 0.36, 1404)], 'D', 6)
    for side in (-1, 1):                                                 # the planned machines, marked out in rows
        for t, (w, top, bot) in enumerate(((210, 660, 1560), (120, 790, 1420), (70, 880, 1330), (40, 950, 1270))):
            xo = (0 if side < 0 else 1080) + side * (-1) * (30 + [0, 230, 360, 440][t])
            x0, x1 = (xo, xo + w) if side < 0 else (xo - w, xo)
            fr.line([(x0, bot), (x0, top), (x1, top), (x1, bot)], 'M', 6)
    machine_15(fr)
    fr.rect(534, 884, 546, 1392, 'M')                                    # the water passed down the pipe (cool)
    fr.line([(548, 1398), (650, 1412), (760, 1420)], 'W', 16)            # hot out at the foot, heading right
    accent(fr, 'line', ([(552, 1398), (650, 1412), (756, 1420)], 12))
    g(fr, 'line', [(0, 1920), vp], dash=True, w=8)                       # B2: the vanishing point, hidden behind
    g(fr, 'line', [(1080, 1920), vp], dash=True, w=8)
    g(fr, 'arrow', [(600, 900), (600, 1360)])                            # RM1: the water travels the pipe down
    g(fr, 'ring', 540, 1400, 70)
    c(fr, 'arrow', [(780, 1460), (1040, 1460)])                          # the front leads out: the one follow
    return fr


def s11():
    """Mid-follow: the hot water's front held at x ~410 as the street slides; it will climb to the window."""
    fr = new(411, 'D')
    m = Map(1.15, 600, 1000)
    home(fr, m, 'follow', 'window')
    fr.ell(410, 1330, 28, 18, 'W')                                       # the front: held still on screen
    accent(fr, 'ell', 410, 1330, 22, 13)
    g(fr, 'cross', 410, 1330, 58)                                        # E3: still against the moving street
    g(fr, 'arrow', [(1000, 1440), (760, 1440)])                          # the world slides past
    g(fr, 'arrow', [(470, 1372), (556, 1372), (640, 1360), (640, 1110)], dash=True)   # its path on: door, riser
    g(fr, 'ring', 600, 1000, 92)
    c(fr, 'ring', 600, 1000, 130)                                        # the window: the pull back's anchor
    for sx, sy in ((-1, -1), (1, 1)):
        c(fr, 'arrow', [(600 + sx * 430, 1000 + sy * 470), (600 + sx * 300, 1000 + sy * 330)], w=9)
    return fr


def s12():
    """The payoff: S1's frame, the run warm end to end, the resident in the window, your phone from the bottom left."""
    fr = new(412, 'D')
    home(fr, Map(1.0), 'payoff', 'window')
    fr.poly([(150, 1920), (196, 1640), (262, 1520), (322, 1470), (372, 1500), (420, 1580), (430, 1920)], 'K')
    fr.rrect(322, 1296, 478, 1494, 24, 'K')                              # the phone
    fr.rrect(334, 1310, 466, 1480, 16, 'L')                              # its screen, a step under the window
    fr.rrect(358, 1362, 444, 1408, 18, 'D')                              # the chat bubble
    fr.poly([(372, 1400), (360, 1428), (392, 1404)], 'D')
    g(fr, 'arrow', [(392, 1330), (200, 1090), (262, 1196), (330, 1238), (560, 1238), (640, 1228), (640, 1080)])
    g(fr, 'ring', 598, 985, 104)
    c(fr, 'arrow', [(560, 1080), (560, 1306), (300, 1306), (160, 1262)], dash=True)   # the loop's un-paint
    c(fr, 'ring', 140, 1230, 34)                                         # frame 0's spot
    return fr


SHOTS = [  # key, lead code, lead name, time, frames, tier, move, join
    ('S1', 'T', 'the line first', '0.00-4.28 s', 'f0-257', 'CORE', 'RM8 the run first, RM7', 'RJ4 (C) brush, "AI" f257', s1),
    ('S2', 'Z3', 'the medium', '4.28-8.76 s', 'f257-526', 'SIT', 'RM4 1.56x in-and-left', 'RJ4 (C) melt, "Those" f526', s2),
    ('S3', 'N9', 'isolation', '8.76-10.96 s', 'f526-658', 'CORE', 'RM4 2.0x lean-in, RM7', 'RJ4 (C) steam, "To" f658', s3),
    ('S4', 'D7', 'the pattern', '10.96-17.76 s', 'f658-1066', 'CORE', 'I4 pull 2x, pops f904', 'RJ4 (C) steam, f1066', s4),
    ('S5', 'N9', 'the close', '17.76-19.26 s', 'f1066-1156', 'CORE', 'RM4 2x, the mug f1117', 'RJ4 + I12 the pivot', s5),
    ('S6', 'D2', 'scale', '19.26-23.46 s', 'f1156-1408', 'CORE', 'I4 the big move, I12', 'RJ2 (F) cut f1402; alt J2', s6),
    ('S7', 'N15', 'off-balance', '23.46-25.54 s', 'f1408-1532', 'RARE', 'push in, RM8 the reach', 'RJ4 (C) steam, "The"', s7),
    ('S8', 'C1', 'frame in frame', '25.54-28.34 s', 'f1532-1700', 'CORE', 'RM7, tag on "next"', 'RJ4 (C) dolly, "So"', s8),
    ('S9', 'E2', 'the lit opening', '28.34-29.56 s', 'f1700-1774', 'CORE', 'the door f1716-1740', 'RJ4 (C) at rest, "A"', s9),
    ('S10', 'B2', 'vanishing point', '29.56-34.46 s', 'f1774-2068', 'CORE', 'RM7, RM1 the water', 'RM3 follow (C), "Then"', s10),
    ('S11', 'E3', 'still vs motion', '34.46-38.48 s', 'f2068-2309', 'SIT', 'RM3 + I12, RM1 climb', 'RJ4 (C) pull, "So"', s11),
    ('S12', 'N14', 'the match', '38.48-42.24 s', 'f2309-2534', 'CORE', 'RM7, RM1 the pulse', 'RJ3 the loop (B)', s12),
]
JOINS = ['C', 'C', 'C', 'C', 'C', 'F', 'C', 'C', 'C', 'C', 'C', 'B']
DUR = [4.28, 4.48, 2.20, 6.80, 1.50, 4.20, 2.08, 2.80, 1.22, 4.90, 4.02, 3.76]


# ---------------------------------------------------------------------------------------------------------------------
# The sheet: 1080 px wide (the phone's width), 3 x 4 tiles, then the film's strip
# ---------------------------------------------------------------------------------------------------------------------
SW, M, COLS, GAP = 1080, 24, 3, 18
TWp = (SW - 2 * M - (COLS - 1) * GAP) // COLS          # 332
THp = int(round(TWp * FH / FW))                          # 590
CAP_H = 74


def text_line(d, xy, parts):
    """Draw [(text, font, colour), ...] one after another on one line."""
    x, y = xy
    for t, f, col in parts:
        d.text((x, y), t, font=f, fill=col)
        x += d.textlength(t, font=f)
    return x


def tile(fr, key, code, name, when, frames, tier, move, join):
    im = full(fr).resize((TWp, THp), Image.LANCZOS)
    d = ImageDraw.Draw(im, 'RGBA')
    d.rectangle([0, THp - 62, TWp, THp], fill=(22, 20, 26, 226))
    f = font(18, 'Medium')
    text_line(d, (10, THp - 58), [('move ', f, (190, 186, 196)), (move, font(18, 'SemiBold'), (255, 255, 255))])
    text_line(d, (10, THp - 32), [('join ', f, (190, 186, 196)), (join, font(18, 'SemiBold'), (150, 196, 255))])
    d.rectangle([0, 0, 118, 30], fill=(22, 20, 26, 200))
    d.text((8, 5), 'PLANNING', font=font(16, 'Bold'), fill=(255, 255, 255))
    return im


def build(tiles):
    head_h, strip_h, foot_h = 286, 214, 66
    rows = (len(tiles) + COLS - 1) // COLS
    row_h = THp + CAP_H + 22
    SH = head_h + rows * row_h + strip_h + foot_h
    sheet = Image.new('RGB', (SW, SH), S.BG)
    d = ImageDraw.Draw(sheet)
    d.text((M, 22), 'Helsinki: the composition-and-motion pass', font=font(36, 'Bold'), fill=S.INK)
    d.text((M, 72), '12 PLANNING THUMBNAILS · not a render · G3 builds and plays the real sketch',
           font=font(21, 'Bold'), fill=RED)
    y = 108
    para = ('Each frame is our 1080 x 1920 drawn from COMPOSITION_PASS.md\'s numbers on the locked 42.24 s take: '
            'grey values (white only for the story light), amber the one warm accent (the heat). RED: the frame '
            'device\'s guides, the focal ring and the motion inside the shot. BLUE: the join\'s carrier into the next '
            'shot. Dashed: the caption band; veiled: the app on the owner\'s Reels tab. Codes and tiers: '
            'COMPOSITION_SHOTS.md Part 0 (his ideas: T, D7, D2, C1, E2, B2, E3; ours: Z3, N9, N15, N14).')
    for line in wrap(d, para, font(19), SW - 2 * M):
        d.text((M, y), line, font=font(19), fill=S.SUB)
        y += 25
    for i, (t, args) in enumerate(zip(tiles, SHOTS)):
        key, code, name, when, frames, tier, move, join, _fn = args
        r, cidx = divmod(i, COLS)
        x0 = M + cidx * (TWp + GAP)
        y0 = head_h + r * row_h
        sheet.paste(t, (x0, y0))
        d.rectangle([x0 - 1, y0 - 1, x0 + TWp, y0 + THp], outline=(176, 170, 166))
        ty = y0 + THp + 8
        x = text_line(d, (x0, ty), [(key + ' ', font(23, 'Bold'), S.INK), (code, font(23, 'Bold'), RED),
                                    (' ' + name, font(21, 'SemiBold'), S.INK)])
        d.text((x0, ty + 32), '%s · %s · %s' % (when, frames, tier), font=font(18), fill=S.SUB)
    # the film's strip: the shots to scale on the take, the lead device, the joins between
    top = head_h + rows * row_h + 6
    d.text((M, top), 'The film on the take (42.24 s): the lead device per shot, the join after it', font=font(20, 'Bold'),
           fill=S.INK)
    bx0, bx1, by0, by1 = M, SW - M, top + 64, top + 112
    k = (bx1 - bx0) / 42.24
    t0 = 0.0
    for i, (dur, args) in enumerate(zip(DUR, SHOTS)):
        xa, xb = bx0 + t0 * k, bx0 + (t0 + dur) * k
        d.rectangle([xa, by0, xb, by1], fill=(206, 202, 198) if i % 2 == 0 else (226, 222, 218), outline=(150, 146, 150))
        lab = args[1]
        fw = d.textlength(lab, font=font(17, 'Bold'))
        if fw < xb - xa - 2:
            d.text(((xa + xb - fw) / 2, by0 + 13), lab, font=font(17, 'Bold'), fill=RED)
        sk = args[0]
        sw_ = d.textlength(sk, font=font(14, 'Medium'))
        d.text(((xa + xb - sw_) / 2, by0 - 22), sk, font=font(14, 'Medium'), fill=S.SUB)
        j = JOINS[i]
        jx = xb if i < len(DUR) - 1 else xb - 14
        col = RED if j == 'F' else BLUE
        d.ellipse([jx - 13, by1 + 6, jx + 13, by1 + 32], fill=col)
        jw = d.textlength(j, font=font(16, 'Bold'))
        d.text((jx - jw / 2, by1 + 9), j, font=font(16, 'Bold'), fill=(255, 255, 255))
        t0 += dur
    yy = by1 + 42
    for line in wrap(d, 'Joins: C x10 (the continuous camera) · F x1, the one cut, on "But" (f1402; the owner\'s '
                     'alternative is one J2 push-through) · B, the loop back to frame 0', font(17), SW - 2 * M):
        d.text((M, yy), line, font=font(17), fill=S.INK)
        yy += 23
    yy = SH - 52
    for line in wrap(d, 'Script: video/docs/v4/visual/composition_pass_sheet.py (PIL, seeded; the composition '
                     'library\'s drawing kit, shots_sheet.py and devices_sheet.py). Planning only: nothing traced or '
                     'copied.', font(15), SW - 2 * M):
        d.text((M, yy), line, font=font(15), fill=S.SUB)
        yy += 20
    return sheet


def main(argv):
    tdir = argv[argv.index('--tiles') + 1] if '--tiles' in argv else None
    tiles = []
    for key, code, name, when, frames, tier, move, join, fn in SHOTS:
        fr = fn()
        if tdir:
            os.makedirs(tdir, exist_ok=True)
            full(fr).save(os.path.join(tdir, key + '.png'))
        tiles.append(tile(fr, key, code, name, when, frames, tier, move, join))
    sheet = build(tiles)
    sheet.save(OUT, optimize=True)
    print('wrote', OUT, sheet.size, 'kit', KIT)


if __name__ == '__main__':
    main(sys.argv[1:])
