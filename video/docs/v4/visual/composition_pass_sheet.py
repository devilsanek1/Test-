#!/usr/bin/env python3
"""Video 4 (Helsinki): the composition-and-motion pass as 12 PLANNING value thumbnails, one per shot S1-S12
(`COMPOSITION_PASS.md`, after its fix pass, `review_composition.md`). Not a render: G3 builds and plays the real sketch.

ONE PLACE, ONE MAP. Every frame but the two closes (S3, S5) and the planet (S6) is the one home view drawn through that
frame's map, x' = s (x - 66) + X, y' = s (y - 838) + Y (s = the computer's drawn width / 216, (X, Y) its drawn top-left:
FRAMES below), so the block, the plan, the run, the person and Pip land where the camera puts them (the review's M1).
The same tables give the numbers in the pass (`--numbers`) and every camera move's speeds (`--speeds`, `--camspeed`).

Each thumbnail is our 1080 x 1920 frame drawn at full size in frame px and shown small: five flat greys (L* 97 / 80 /
60 / 40 / 18; white only for the story light), the one warm accent of the film's colour key (the heat) in amber, the
caption band and the app's interface on the owner's Reels tab marked faintly; in RED the shot's frame device (its
guides, the focal ring) and the motion inside the shot; in BLUE the join's carrier (what crosses into the next shot).
The drawing kit is the composition library's (`video/docs/look/composition/shots_sheet.py`, the `Frame` class, and
`devices_sheet.py`'s tile conventions), imported from the first folder that has it: this repo's
`video/docs/look/composition/`, then $COMPOSITION_KIT, then the main checkout. Seeded and deterministic; no image is
copied, traced or used as an input.

    python3 -B composition_pass_sheet.py                 # writes composition_pass_sheet.png next to this script
    python3 -B composition_pass_sheet.py --tiles DIR     # also each full-size planning frame as DIR/Sn.png
    python3 -B composition_pass_sheet.py --numbers       # every home-view piece in every frame, and the band checks
    python3 -B composition_pass_sheet.py --speeds        # every camera move's peak screen speeds (px per 60 fps frame)
    python3 -B composition_pass_sheet.py --camspeed DIR  # each move rendered at half size from the planning world into
                                                         # DIR/<move>/ and video/scripts/camspeed.py run on it
"""
import math
import os
import subprocess
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
from shots_sheet import FH, FW, GREY, Frame, catmull, font, wrap  # noqa: E402

OUT = os.path.join(HERE, 'composition_pass_sheet.png')
CAMSPEED = os.path.normpath(os.path.join(HERE, '..', '..', '..', 'scripts', 'camspeed.py'))
RED = S.ACCENT                       # the frame device and the motion
BLUE = (34, 116, 214)                # the join's carrier
AMBER = D.AMBER                      # the one warm accent: the heat
GW = 13                              # guide width at frame size (~4 px on the tile)

# =====================================================================================================================
# THE PLACE: the home view (W1, 1x, px, y down) and every frame's map
# =====================================================================================================================
HOME = dict(
    horizon=1170,                                   # setup A: camera ~1.6 m, level
    computer=(66, 838, 282, 1216),                  # the monolith: x0, top, x1, foot
    block=(378, 690, 812, 1262),                    # x0, roof (its snow's top), x1, foot
    bumps=((716, 752, 668), (786, 800, 674)),       # a stair tower and a chimney: x0, x1, top (x >= 715: rule 2)
    panes=((438, 518, 598, 678, 758), (775, 880, 985, 1090)),   # columns, rows; panes 60 x 80
    window=(598, 985), win=(564, 941, 632, 1029),   # the one window (the focal), its pane
    radiator=(598, 1062),
    door=(532, 1182, 588, 1262),
    nextblock=(812, 760, 1100, 1262),
    plan=(-50, 360, 756, 1240),                     # the footprint's x0, x1; the corner posts' tops; its front line
    run=((140, 1214), (260, 1220), (330, 1272), (420, 1272), (598, 1272), (598, 1062)),   # frame 0's start -> radiator
    smallbox=(420, 1272),                           # the manhole where the plan's stretch meets the city's pipe
    farcity=(1090, 1150), harbour=(1166, 1214),
    cloud=(230, 170, 620, 230),                     # the hero snow cloud: centre, w, h (the top gutter)
    resident=(780, 1340, 180),                      # the person near the camera: feet x, feet y, height
    pip=(840, 900),
    pivot=(174, 814),                               # the mug's spot (S5) = the big move's pivot
)
FRAMES = {   # s, X, Y: x' = s (x - 66) + X, y' = s (y - 838) + Y
    'S1': (1.0, 66.0, 838.0),
    'S2': (1.5556, 372.0, 880.0),                   # lifted 40 px: the foot 51 px over the name block, drop 454
    'S3': (3.1111, 204.0, 1025.0),                  # the top at y 1025: the melt in the golden box, drop 469
    'S4': (1.5556, 372.0, 875.0),                   # the block's roof at y 645 (M1), the kettles under y 1515
    'S5': (3.1111, 204.0, 1084.0),                  # the mug at (540, 1010): the pivot
    'S7a': (1.10, 421.2, 900.9),                    # S7's incoming push, keyed f1372 (cut into at f1402)
    'S7': (1.15, 415.8, 900.0),                     # the computer on the axis (M2)
    'S8': (1.2963, 400.0, 900.0),                   # lifted 59 px (M2)
    'S9': (1.5, 378.0, 845.0),                      # = S10; lowered 5 px (the block's roof at y 623: S18)
    'S11': (1.15, -11.8, 830.95),                   # the window (598, 985) at (600, 1000)
    'S12': (1.0, 66.0, 838.0),
}
PIVOT = (540, 1010)                                 # the mug (S5), held through the big move: Helsinki's spot (S6)
LAND = 3.1111 / 124.0                               # the home view's scale on the landed curve (the city ~27 px)


class Map:
    """Home-view px -> frame px for one frame (FRAMES)."""

    def __init__(self, s=1.0, X=66.0, Y=838.0):
        self.s, self.X, self.Y = s, X, Y

    @classmethod
    def of(cls, key):
        return cls(*FRAMES[key]) if isinstance(key, str) else cls(*key)

    def __call__(self, x, y):
        return (self.s * (x - 66.0) + self.X, self.s * (y - 838.0) + self.Y)

    def pts(self, pts):
        return [self(x, y) for x, y in pts]

    def r(self, v):
        return v * self.s

    def inv(self, x, y):
        return ((x - self.X) / self.s + 66.0, (y - self.Y) / self.s + 838.0)

    @property
    def k(self):
        return self.s


def fixed_point(a, b):
    """The screen point a straight move from frame a to frame b scales about (rule 12: one move), and the ratio."""
    s0, X0, Y0 = FRAMES[a] if isinstance(a, str) else a
    s1, X1, Y1 = FRAMES[b] if isinstance(b, str) else b
    r = s1 / s0
    return ((X1 - r * X0) / (1 - r), (Y1 - r * Y0) / (1 - r)), r


# =====================================================================================================================
# THE MOVES: eases (rule 20) and every camera move between stops (Part 0b §2 item 7), on the take's frames
# =====================================================================================================================
def _bezier(x1, y1, x2, y2):
    def f(u):
        lo, hi = 0.0, 1.0
        for _ in range(60):
            m = (lo + hi) / 2
            if 3 * (1 - m) ** 2 * m * x1 + 3 * (1 - m) * m * m * x2 + m ** 3 < u:
                lo = m
            else:
                hi = m
        m = (lo + hi) / 2
        return 3 * (1 - m) ** 2 * m * y1 + 3 * (1 - m) * m * m * y2 + m ** 3
    return f


S5_EASE = _bezier(0.55, 0.03, 0.50, 1.0)            # one peak at ~2.1x the mean (pullback.tsx)


def ease(name, u):
    u = min(max(u, 0.0), 1.0)
    if name == 'cubic':                               # in-out cubic: peak 3x the mean
        return 4 * u ** 3 if u < 0.5 else 1 - (-2 * u + 2) ** 3 / 2
    if name == 'sine':                                # in-out sine: peak 1.57x
        return -(math.cos(math.pi * u) - 1) / 2
    if name == 'trap':                                # trapezoid(0.25, 0.35): peak 1.43x, the cruise in the middle
        A, Dd = 0.25, 0.35
        v = 1 / (1 - A / 2 - Dd / 2)
        if u < A:
            return v * u * u / (2 * A)
        if u < 1 - Dd:
            return v * (A / 2 + (u - A))
        return 1 - v * (1 - u) ** 2 / (2 * Dd)
    if name == 's5':
        return S5_EASE(u)
    raise ValueError(name)


MOVES = [  # key, from, to, f0, f1, ease, the join (code, carrier), what it carries
    ('S1-S2', 'S1', 'S2', 235, 325, 'trap', 'C: RM4 1.56x in and left', 'the un-paint (RM8), the cruise from "AI" f257'),
    ('S2-S3', 'S2', 'S3', 490, 570, 'trap', 'C: RM4 2x lean-in', 'the cruise over "Those" f526'),
    ('S3-S4', 'S3', 'S4', 636, 742, 'trap', 'C: I4 a story pull 2x', 'the cruise from "To" f658'),
    ('S4-S5', 'S4', 'S5', 1012, 1102, 'trap', 'C: RM4 2x up the steam', 'the cruise over "That\'s" f1066'),
    ('S7in', 'S7a', 'S7', 1372, 1442, 'sine', 'S7\'s incoming push 1.045x', 'cut into at f1402, lands "WANTS" f1442'),
    ('S7-S8', 'S7', 'S8', 1513, 1556, 'sine', 'C: RJ4 seam 1.13x', 'midpoint "The" f1532'),
    ('S8-S9', 'S8', 'S9', 1678, 1716, 'sine', 'C: RM4 1.16x', 'midpoint "So" f1700'),
    ('S10-S11', 'S9', 'S11', 1979, 2208, 'follow', 'C: RM3 the follow, back and right', 'the front held at x 540-556'),
    ('S11-S12', 'S11', 'S12', 2286, 2332, 'cubic', 'C: RJ4 seam 1.15x pull', 'midpoint "So" f2309'),
]
BIG = ('S5-S6', 1130, 1312, 's5', 124.0)           # the one big move: f0, f1, ease, the total factor (nested pull)


def frame_at(a, b, p):
    """The frame (s, X, Y) a straight move from a to b reaches at progress p (geometric zoom about its fixed point)."""
    s0, X0, Y0 = FRAMES[a] if isinstance(a, str) else a
    (Px, Py), r = fixed_point(a, b)
    k = r ** p
    return (s0 * k, Px + k * (X0 - Px), Py + k * (Y0 - Py))


FOLLOW_PATH = [(174, 1216), (260, 1220), (330, 1272), (420, 1272), (560, 1272)]   # the computer's foot -> the door


def front_at(f):
    """The hot water's front (home px): it leaves the foot 6 f ahead of "water" (f1975) and reaches the door on
    "into" (f2208), on a trapezoid along its path."""
    u = ease('trap', (f - 1975) / (2208 - 1975))
    return cut_path(FOLLOW_PATH, 0.0, max(u, 1e-4))[-1]


def follow_p(f):
    """The follow's progress (RM3 with I12): the camera starts 4 f after the front (f1979) and holds it on screen
    at x 540 -> 556 (S11's landing spot at the door), so the subject leads and the camera rides it."""
    if f <= 1979:
        return 0.0
    if f >= 2208:
        return 1.0
    hx, hy = front_at(f)
    target = 540 + 16 * (f - 1975) / (2208 - 1975)
    lo, hi = 0.0, 1.0
    for _ in range(50):
        mid = (lo + hi) / 2
        if Map(*frame_at('S9', 'S11', mid))(hx, hy)[0] > target:
            lo = mid
        else:
            hi = mid
    return (lo + hi) / 2


def move_frame(a, b, f0, f1, e, f):
    """A move's frame at film frame f (the follow derives its progress from its subject)."""
    p = follow_p(f) if e == 'follow' else ease(e, (f - f0) / (f1 - f0))
    return frame_at(a, b, p)


# =====================================================================================================================
# Guides: red (device, motion) and blue (carrier), drawn over the frame at full size
# =====================================================================================================================
def g(fr, kind, *a, **kw):
    fr.guides.append((kind, a, kw))


def c(fr, kind, *a, **kw):
    kw = dict(kw, col=BLUE)
    fr.guides.append((kind, a, kw))


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
            tip = pts[-1]
            if arrow:
                (x0, y0), (x1, y1) = pts[-2], pts[-1]
                L = math.hypot(x1 - x0, y1 - y0) or 1.0
                pts = pts[:-1] + [(x1 - (x1 - x0) / L * 50, y1 - (y1 - y0) / L * 50)]
            if dash:
                S._polyline_dash(d, pts, w, col, 46.0, 30.0)
            else:
                d.line(pts, fill=col, width=w, joint='curve')
            if arrow:
                S._head(d, pts[-1], tip, col, 66.0, 56.0)
        elif kind == 'ring':
            cx, cy, r = a
            if dash:
                n = 28
                for i in range(0, n, 2):
                    t0, t1 = 2 * math.pi * i / n, 2 * math.pi * (i + 1) / n
                    d.arc([cx - r, cy - r, cx + r, cy + r], math.degrees(t0), math.degrees(t1), fill=col, width=w)
            else:
                d.ellipse([cx - r, cy - r, cx + r, cy + r], outline=col, width=w)
        elif kind == 'box':
            x0, y0, x1, y1 = a
            pts = [(x0, y0), (x1, y0), (x1, y1), (x0, y1), (x0, y0)]
            if dash:
                S._polyline_dash(d, pts, w, col, 46.0, 30.0)
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
            da.line([(float(x), float(y)) for x, y in pts], fill=AMBER + (255,), width=max(1, int(w)), joint='curve')
    band = np.asarray(gim)[290:600, 95:945]
    rgba = S.furniture(rgba, S.GREY_TO_L.get(int(np.median(band)), 50) < 55)
    return draw_guides(rgba, fr.guides).convert('RGB')


def new(seed, base):
    fr = Frame(seed, base)
    fr.amber = []
    return fr


def polyline_len(pts):
    return sum(math.hypot(x1 - x0, y1 - y0) for (x0, y0), (x1, y1) in zip(pts[:-1], pts[1:]))


def cut_path(pts, t0, t1):
    """The part of a polyline between fractions t0 and t1 of its length."""
    L = polyline_len(pts)
    out, run = [], 0.0
    a, b = t0 * L, t1 * L
    for (x0, y0), (x1, y1) in zip(pts[:-1], pts[1:]):
        seg = math.hypot(x1 - x0, y1 - y0)
        s0, s1 = run, run + seg
        lo, hi = max(a, s0), min(b, s1)
        if hi > lo and seg > 0:
            pa = ((lo - s0) / seg, (hi - s0) / seg)
            p0 = (x0 + (x1 - x0) * pa[0], y0 + (y1 - y0) * pa[0])
            p1 = (x0 + (x1 - x0) * pa[1], y0 + (y1 - y0) * pa[1])
            if not out:
                out.append(p0)
            out.append(p1)
        run = s1
    return out


# =====================================================================================================================
# The home view, drawn through a frame's map
# =====================================================================================================================
def person2(fr, cx, feet, P, facing=-1, view='side', coat='M'):
    """The person near the camera: a mid-value coat against the dark facade, dark legs against the snow (a >= 25 L*
    step both ways: the review's S1), from the library kit's walking figure."""
    W, H = fr.im.size
    tmp = Frame(7, 'W')
    tmp.im = Image.new('L', (W, H), GREY['W'])
    tmp.dr = ImageDraw.Draw(tmp.im)
    tmp.person(cx, feet, P, 'K', view=view, facing=facing)
    a = (np.asarray(tmp.im) == GREY['K']).astype(np.uint8) * 255
    fr.mask_fill(Image.fromarray(a), 'K')
    yy = np.arange(H)[:, None]
    a = a.copy()
    a[((yy < feet - 0.84 * P) | (yy > feet - 0.40 * P)).repeat(W, axis=1)] = 0
    fr.mask_fill(Image.fromarray(a), coat)


def monolith(fr, m, lights='L', top=None):
    """The giant computer as a monolith (STYLE_ADJUSTMENTS 6; the review's S20): no roofline, no window grid, soft
    top corners, its small cool lights in tight vertical rows a step under the window."""
    x0, y0, x1, y1 = HOME['computer']
    r = 14
    pts = [(x0, y1), (x0, y0 + r), (x0 + r * 0.3, y0 + r * 0.3), (x0 + r, y0), (x1 - r, y0), (x1 - r * 0.3, y0 + r * 0.3),
           (x1, y0 + r), (x1, y1)]
    fr.hpoly(m.pts(pts), 'K', amp=max(1.0, 1.5 * m.k))
    if top:                                          # snow on its top (M) or its heat (L, amber over it)
        fr.hpoly(m.pts([(x0 + 8, y0 + 3), (x1 - 8, y0 + 3), (x1 - 4, y0 + 10), (x0 + 4, y0 + 10)]), top, amp=1)
    if lights:
        for xx in (110, 138, 166, 194, 222, 250):
            for yy in np.arange(880, 1180, 22):
                if fr.rng.random() > 0.22:
                    fr.ell(*m(xx, yy), max(1.6, 2.6 * m.k), max(1.6, 2.6 * m.k), lights)


def plan_posts(fr, m, v='L', w=5):
    """The plan, only marked out: two corner posts, short top returns (never a full top line: it would cut the closes'
    sky and cross the band in the moves), the footprint's front line on the snow."""
    x0, x1, top, front = HOME['plan']
    lw = max(3, w * m.k)
    for x, sgn in ((x0, 1), (x1, -1)):
        fr.line(m.pts([(x, front), (x, top)]), v, lw)
        fr.line(m.pts([(x, top), (x + sgn * 44, top)]), v, lw)
    fr.line(m.pts([(x0, front), (x1, front)]), v, lw)


def home(fr, m, person=True, plan=True, panes='M', window='city', run='none', cloud=True, run_upto=None, pip=True,
         lights='L'):
    """The home view through map m (any canvas). panes: the city's lit homes ('D' unlit before the wave, 'M' lit at
    rest). window: 'dark', 'city' (lit at the city's level), 'lit' (the story light). run: 'none', 'line' (the pen's
    bold line, no heat), 'warm' (the warm water over it, end to end), 'front' (the melt and the warm water only up to
    run_upto, a fraction of the run from the computer's foot), 'stretch' (the plan's stretch only, marked out)."""
    k = m.k
    W, H = fr.im.size
    yh = HOME['horizon']
    if cloud:
        cx, cy, cw, ch = HOME['cloud']
        bx, by = m(cx, cy + ch / 2)
        if by <= 289:                                # only in the top gutter, never across the band
            fr.cloud(*m(cx, cy), m.r(cw), m.r(ch), 'M')
    fr.skyline(-60, W + 60, m(0, yh)[1], (m(0, HOME['farcity'][0])[1], m(0, HOME['farcity'][1])[1]), 'K',
               wmin=30 * k, wmax=96 * k, gable=0.2, tall=0.15, tall_top=(m(0, 1060)[1], m(0, 1085)[1]))
    fr.dots(np.arange(10, W, max(14, 30 * k)), (m(0, 1122)[1], m(0, 1146)[1]), max(2.5, 4 * k), panes, skip=0.5,
            jit=5)
    fr.rect(0, m(0, HOME['harbour'][0])[1], W, m(0, HOME['harbour'][1])[1], 'K')
    fr.rect(0, m(0, HOME['harbour'][1])[1], W, H, 'M')                   # the snowy street: the near quiet field
    for y in (1300, 1338):                                                # kerb and tram rails, tone-on-tone
        fr.line([(0, m(0, y)[1]), (W, m(0, y)[1])], 'D', max(3, 4 * k))
    if plan:
        plan_posts(fr, m)
    monolith(fr, m, lights=lights, top='M')
    # the block: one closed dark shape, its roof's snow, its panes one texture, its one window
    bx0, broof, bx1, bfoot = HOME['block']
    roof = [(bx0, broof + 8)]
    for x0, x1, top in HOME['bumps']:
        roof += [(x0, broof + 8), (x0, top), (x1, top), (x1, broof + 8)]
    roof += [(bx1, broof + 8)]
    fr.hpoly(m.pts(roof + [(bx1, bfoot), (bx0, bfoot)]), 'K', amp=max(1.0, 2 * k))
    fr.hpoly(m.pts([(bx0 - 4, broof + 9), (bx1 + 4, broof + 9), (bx1, broof), (bx0, broof)]), 'M', amp=1)
    cols, rows = HOME['panes']
    for cy in rows:
        for cx in cols:
            if (cx, cy) == HOME['window']:
                continue
            fr.rect(*m(cx - 30, cy - 40), *m(cx + 30, cy + 40), panes, amp=1.2)
    fr.rect(*m(*HOME['door'][:2]), *m(*HOME['door'][2:]), 'D', amp=1)
    nx0, nroof, nx1, nfoot = HOME['nextblock']
    fr.hpoly(m.pts([(nx0, nroof), (nx1, nroof - 4), (nx1, nfoot), (nx0, nfoot)]), 'K', amp=max(1.0, 2 * k))
    for cy in (840, 950, 1060, 1170):
        for cx in (868, 948, 1028):
            fr.rect(*m(cx - 24, cy - 32), *m(cx + 24, cy + 32), panes, amp=1)
    # the one window
    x0, y0, x1, y1 = HOME['win']
    if window == 'lit':
        fr.rrect(*m(x0 - 18, y0 - 18), *m(x1 + 18, y1 + 18), 20 * k, 'L')
        fr.rect(*m(x0, y0), *m(x1, y1), 'W')
        accent(fr, 'rect', (*m(x0 + 2, y0 + 2), *m(x1 - 2, y1 - 2)))
    else:
        fr.rect(*m(x0, y0), *m(x1, y1), 'M' if window == 'city' else 'D')
    fr.rect(*m(595, y0), *m(601, y1), 'K')                                # the mullion
    # the run (the thread): the pen's bold line, the warm water over it, the manhole
    pts = list(HOME['run'])
    if run in ('line', 'warm'):
        fr.line(m.pts(pts), 'K', max(6, 26 * k))                          # the melt line: >= 40 L* under the snow
        if run == 'warm':
            accent(fr, 'line', (m.pts(pts[1:]), max(3, 10 * k)))
    elif run == 'front':                                                  # the hot water's front and its melt
        lead = [(174, 1216)] + pts[1:]
        part = cut_path(lead, 0.0, run_upto)
        fr.line(m.pts(part), 'K', max(6, 26 * k))
        accent(fr, 'line', (m.pts(part), max(3, 10 * k)))
    elif run == 'stretch':                                                # the plan's stretch, only marked out
        sx, sy = HOME['smallbox']
        st = [(sx, sy), (330, 1272), (260, 1220)]
        mp = m.pts(st)
        for i in range(int(polyline_len(mp) // max(18, 26 * k))):
            seg = cut_path(mp, i / max(1, polyline_len(mp) / max(18, 26 * k)),
                           (i + 0.55) / max(1, polyline_len(mp) / max(18, 26 * k)))
            if len(seg) >= 2:
                fr.line(seg, 'L', max(3, 7 * k))
    fr.ell(*m(*HOME['smallbox']), 24 * k, 9 * k, 'K')
    if person and HOME['resident']:
        rx, ry, rP = HOME['resident']
        fx, fy = m(rx, ry)
        if -60 < fx < 1140:
            person2(fr, fx, fy, rP * k, facing=-1)
    if pip:
        fr.ell(*m(*HOME['pip']), max(4, 8 * k), max(3.5, 7 * k), 'D')  # Pip, tone-on-tone, off the eye path
    return pts


# =====================================================================================================================
# The 12 shots (frame px)
# =====================================================================================================================
def s1():
    """The hook at ~2.1 s (f126): the run filled warm (the line first, then the colour over it), the one window lit on
    "heat" in the golden box, the resident stopped and looking up; the wave starts at f140."""
    fr = new(401, 'D')
    m = Map.of('S1')
    home(fr, m, panes='D', window='lit', run='warm', plan=False)
    g(fr, 'arrow', [(140, 1180), (262, 1186), (330, 1238), (640, 1238), (640, 1100)])   # the pen's line, f0-40
    g(fr, 'ring', 140, 1214, 26)                                          # frame 0: the brush's start (x >= 140)
    g(fr, 'box', 413, 951, 667, 1187, dash=True, w=7)                     # the golden box
    g(fr, 'ring', 598, 985, 112)                                          # the focal: the one break, lit
    g(fr, 'arrow', [(560, 1020), (240, 1150)], dash=True, w=9)            # f60-84: the brush leads the eye to the source
    g(fr, 'line', [(746, 1176), (640, 1030)], dash=True, w=7)             # the resident's look (E10's), f98-104
    c(fr, 'arrow', [(560, 1100), (560, 1312), (330, 1312), (230, 1250)], dash=True)    # the un-paint, back to the source
    return fr


def s2():
    """The medium on "giant": the computer on the axis, the block at the right edge (the scale), the plan's corner
    posts risen on "buildings"."""
    fr = new(402, 'D')
    m = Map.of('S2')
    home(fr, m, panes='M', window='city', run='none', plan=True, person=False)
    x0, x1, top, front = HOME['plan']
    px0, ptop = m(x0, top)
    px1, pfront = m(x1, front)
    g(fr, 'box', px0, ptop, px1, min(pfront, 1500), dash=True, w=8)        # C1: the plan frames the machine
    g(fr, 'arrow', [(190, 1110), (430, 1150)])                            # its slide to the axis as the push lands
    g(fr, 'ring', 540, 1010, 100)                                         # the focal: its lights blinking on "giant"
    g(fr, 'vdim', 1030, m(0, HOME['block'][1])[1], 1500)                  # the block's floors: the scale for "giant"
    c(fr, 'ring', 540, 880, 60)                                           # the cue: flakes melting on its top, f493
    c(fr, 'box', 270, 368, 810, 1328, dash=True, w=9)                     # S3's frame: the 2x push about (540, 735)
    return fr


def s3():
    """The close: the top 672 px wide at y 1025, the melt lit in the golden box, steam pouring off on "hot"."""
    fr = new(403, 'D')
    for _ in range(70):
        x, y = fr.rng.uniform(0, 1080), fr.rng.uniform(630, 1880)
        if not (180 < x < 900 and y > 1000):
            fr.ell(x, y, 5, 5, 'M')                                       # snow falling (none in the band)
    fr.steam(500, 1025, 640, 330, 'M', sway=46, ceiling=626)
    fr.steam(610, 1025, 700, 270, 'M', sway=-30, ceiling=626)
    fr.steam(545, 1025, 760, 240, 'L', sway=16, ceiling=626)
    fr.poly([(214, 1010), (866, 1010), (890, 1045), (190, 1045)], 'L')     # its top, catching the light
    fr.poly([(400, 1012), (680, 1012), (690, 1043), (390, 1043)], 'W')     # the melt: the story light
    accent(fr, 'rect', (404, 1015, 676, 1040))
    fr.rect(190, 1045, 890, 1920, 'K')                                    # its face, the deepest
    for xx in range(260, 860, 88):                                        # its light rows, vertical and cool
        fr.dots([xx, xx + 26], np.arange(1100, 1500, 40), 5, 'D', skip=0.3, jit=0.8)
    g(fr, 'hdim', 970, 204, 876)                                          # N9: >= 650 px (672)
    g(fr, 'ring', 540, 1025, 104)
    c(fr, 'arrow', [(545, 980), (545, 690)])                              # the steam column carries the eye up
    c(fr, 'ring', 545, 650, 40)                                           # its top at the band's floor as it pulls
    return fr


def kettles(fr, rows):
    for y, width, s in rows:
        for i in range(8):
            x = 540 - width / 2 + width * (i + 0.5) / 8 + fr.rng.uniform(-3, 3)
            fr.blob(x, y - s * 0.30, s * 0.42, s * 0.36, 'D', 0.05)
            fr.poly([(x + s * 0.30, y - s * 0.40), (x + s * 0.62, y - s * 0.66), (x + s * 0.66, y - s * 0.58),
                     (x + s * 0.36, y - s * 0.22)], 'D')
            fr.ell(x, y - s * 0.66, s * 0.12, s * 0.07, 'K')


KETTLE_ROWS = [(1471, 470, 56), (1482, 520, 60), (1493, 570, 64), (1504, 610, 68), (1515, 650, 72)]


def s4():
    """The lineup on "FORTY": 5 shallow rows of 8 kettles at the computer's foot, the lit grille the apex; the block's
    roof at y 645 at the right edge (M1)."""
    fr = new(404, 'D')
    m = Map.of('S4')
    home(fr, m, panes='M', window='city', run='none', plan=True, person=False)
    fr.steam(540, 877, 650, 260, 'M', sway=16, ceiling=626)
    gx0, gy0 = 522, m(0, 838)[1] + 118
    fr.rect(gx0, gy0, 558, gy0 + 192, 'W')                                # its lit grille: the hardest step
    accent(fr, 'rect', (gx0 + 3, gy0 + 3, 555, gy0 + 189))
    kettles(fr, KETTLE_ROWS)
    for x in (430, 500, 580, 650):
        fr.steam(x, 1420, 1240, 52, 'M', sway=10, ceiling=640)
    g(fr, 'tri', [(215, 1515), (865, 1515), (540, gy0 - 30)])              # D5: the pyramid, the apex lit
    g(fr, 'ring', 540, gy0 + 96, 86)
    for y, _w, _s in KETTLE_ROWS:                                         # the rows pop back to front, 6 f apart
        g(fr, 'line', [(150, y - 22), (190, y - 22)], w=8)
    c(fr, 'arrow', [(540, 840), (540, 690)])                              # the steam column: the push follows it up
    c(fr, 'box', 270, 333, 810, 1293, dash=True, w=9)                     # S5's frame: the 2x push about (540, 666)
    return fr


def s5():
    """The mug pops on "tea" at the pivot (540, 1010), in a field of steam."""
    fr = new(405, 'D')
    for x, sway, w in ((360, 30, 240), (540, 16, 300), (720, -26, 240)):
        fr.steam(x, 1084, 640, w, 'M', sway=sway, ceiling=626)
    fr.poly([(214, 1070), (866, 1070), (890, 1104), (190, 1104)], 'L')
    fr.rect(190, 1104, 890, 1920, 'K')
    for xx in range(260, 860, 88):
        fr.dots([xx, xx + 26], np.arange(1160, 1500, 40), 5, 'D', skip=0.3, jit=0.8)
    fr.rrect(470, 942, 610, 1080, 26, 'L')                                # the mug
    fr.ell(626, 1010, 34, 40, 'L')                                        # its handle
    fr.ell(626, 1010, 16, 22, 'K')
    fr.ell(540, 946, 64, 12, 'D')                                         # the tea
    fr.steam(540, 934, 790, 60, 'L', sway=14, ceiling=626)                             # its small curl
    g(fr, 'ring', 540, 1010, 118)
    c(fr, 'cross', 540, 1010, 44)                                         # the pivot the big move holds
    for sx, sy in ((-1, -1), (1, -1), (-1, 1), (1, 1)):                   # the world will shrink toward it
        c(fr, 'arrow', [(540 + sx * 420, 1010 + sy * 520), (540 + sx * 250, 1010 + sy * 310)], w=9)
    return fr


def s6():
    """The landing on "blow": the Earth from high above at night, its limb ABOVE the band (y 220), the band and the
    stage over the open sea in the night sky's own value (one flat field through the whole move), the snowy land
    below the coast, Helsinki's warm spot at the pivot (540, 1010), the boxes' plumes."""
    fr = new(406, 'D')
    R = 3000.0
    arc = lambda x: 220 + R - math.sqrt(R * R - (x - 540) ** 2)  # noqa: E731
    xs = np.linspace(0, 1080, 60)
    fr.poly([(0, 0), (1080, 0)] + [(x, arc(x)) for x in xs[::-1]], 'K')  # space
    fr.poly([(x, arc(x) - 4) for x in xs] + [(x, arc(x) + 10) for x in xs[::-1]], 'L')   # the limb's thin light
    land = [(0, 960), (120, 930), (260, 960), (400, 985), (500, 990), (560, 1000), (640, 985), (760, 970), (900, 990),
            (1080, 960), (1080, 1920), (0, 1920)]
    fr.hpoly(land, 'M', amp=6)                                            # the snowy land below the coast
    for x, y, h in ((300, 1080, 170), (780, 1110, 150), (540, 1175, 210), (180, 1260, 140), (900, 1280, 130),
                    (420, 1330, 120), (680, 1360, 120)):
        fr.rect(x - 16, y - 9, x + 16, y + 9, 'K')                        # a box with roof fans
        fr.steam(x, y - 12, y - h, 34, 'L', sway=10, ceiling=640)         # its plume, thinning under the band
    for x, y in ((90, 1180), (990, 1210), (300, 1450), (780, 1480)):
        fr.ell(x, y, 4, 4, 'D')                                           # far towns, tiny
    fr.ell(540, 1010, 30, 22, 'L')
    fr.ell(540, 1010, 14, 11, 'W')                                        # Helsinki: the one warm accent
    accent(fr, 'ell', 540, 1010, 12, 9)
    for i, (w, h) in enumerate(((54, 96), (162, 288), (405, 720))):
        g(fr, 'box', 540 - w / 2, 1010 - h / 2, 540 + w / 2, 1010 + h / 2, dash=i > 0, w=9)   # the chain's steps
    g(fr, 'ring', 540, 1010, 64)
    c(fr, 'arrow', [(-20, 1150), (420, 1150)], w=11)                      # the alternative: a snow cloud wipes across
    c(fr, 'box', 30, 640, 980, 1500, dash=True, w=8)                      # J8: >= 70 % of the stage on the cut frame
    return fr


def s7():
    """The turn, centred (M2): the computer on the axis at 1.15x, its warm steaming top the focal; the reach drawn on
    "WANTS" from the small box to its foot; the block enters at x 775, its window off the feed."""
    fr = new(407, 'D')
    m = Map.of('S7')
    home(fr, m, panes='M', window='city', run='stretch', plan=True, person=False, lights='D')
    x0, top, x1, foot = HOME['computer']
    tx0, ty = m(x0, top)
    tx1, _ = m(x1, top)
    fr.steam(540, ty + 2, 640, 220, 'M', sway=24, ceiling=626)
    fr.rect(tx0 + 10, ty - 2, tx1 - 10, ty + 14, 'L', amp=1)              # its top, lit warm from inside
    accent(fr, 'rect', (tx0 + 26, ty + 1, tx1 - 26, ty + 11))
    g(fr, 'ring', 540, 925, 96)                                           # the focal: ~90 px from the pivot it left
    g(fr, 'arrow', [m(*HOME['smallbox']), m(330, 1272), m(260, 1220)])    # the reach: E9's line, B1 (f1442-1496)
    g(fr, 'cross', 540, 1010, 30)                                         # where the eye was (S6's pivot)
    c(fr, 'ring', 540, 760, 64)                                           # the steam over the empty stretch
    c(fr, 'box', 61, 102, 1019, 1805, dash=True, w=9)                     # S8's frame: the 1.13x seam about (540, 900)
    return fr


def s8():
    """The plan alone (lifted, M2): its corner posts frame the machine, the 2027 tag on its front panel, the ferry
    on the harbour left of the plan, the empty stretch to the small box."""
    fr = new(408, 'D')
    m = Map.of('S8')
    home(fr, m, panes='M', window='city', run='stretch', plan=True, person=False, lights='D')
    # the ferry with Pip at its rail, on the harbour left of the plan (M1's item 4)
    fr.hpoly([(112, 1352), (236, 1348), (226, 1380), (122, 1380)], 'D', amp=1)
    fr.rect(150, 1330, 196, 1350, 'D')
    fr.ell(202, 1339, 7, 6, 'K')
    fr.steam(540, m(0, 838)[1] + 2, 650, 200, 'M', sway=20, ceiling=626)
    tx, ty = 540, 1091
    fr.line([(tx, ty - 98), (tx, ty - 85)], 'K', 5)                       # the pin's string
    fr.ell(tx, ty - 100, 8, 8, 'K')
    fr.rect(tx - 140, ty - 85, tx + 140, ty + 85, 'W', amp=1.5)           # the tag: the paper lit (drop 535)
    fr.text((tx, ty + 2), '2027', 122, 'K')
    x0, x1, top, front = HOME['plan']
    px0, ptop = m(x0, top)
    px1, pfront = m(x1, front)
    g(fr, 'box', px0, ptop, px1, pfront, dash=True, w=8)                  # C1: the plan frames the machine (~16 %)
    g(fr, 'vdim', 760, ty - 36, ty + 36)                                  # the figures ~72 px
    g(fr, 'ring', tx, ty, 168)
    c(fr, 'ring', 540, 975, 40)                                           # the cue: its small lights blink, f1678
    c(fr, 'curve', [(680, 1000), (600, 930), (470, 960)], arrow=True)     # the panel (and the tag) swing away on "how"
    return fr


def machine_15(fr, m, opened=True, water='none'):
    """S9-S10's held frame: the computer at 1.5x the home view (x 378-702, y 845-1412)."""
    x0, top, x1, foot = HOME['computer']
    (X0, T), (X1, F) = m(x0, top), m(x1, foot)
    fr.line([(0, T + 44), (X0 - 70, T + 44), (X0 - 30, T + 20), (X0 + 20, T + 20)], 'K', 14)   # the inlet, cool
    if opened:
        fr.poly([(X0, T + 40), (X0 - 74, T + 64), (X0 - 74, F - 40), (X0, F - 16)], 'D')   # the panel, swung open
        fr.rect(X0 + 22, T + 40, X1 - 22, F - 16, 'L')                    # inside: the computer's own cool light
        for i in range(8):
            y = T + 46 + i * 63
            fr.rect(X0 + 36, y + 6, X1 - 36, y + 50, 'D', amp=1)          # the 8 stacked machines
        fr.rect(532, T + 40, 548, F - 14, 'K')                            # the pipe down past each
        if water == 'down':
            fr.rect(534, T + 44, 546, F - 18, 'M')
        if water == 'hot':
            fr.rect(534, T + 44, 546, F - 18, 'M')
            fr.line([(548, F - 8), (650, F + 6), (760, F + 14)], 'W', 16)
            accent(fr, 'line', ([(552, F - 8), (650, F + 6), (756, F + 14)], 12))


def s9():
    """On "how" its front panel swings open on its left hinge, the tag going with it: 8 stacked machines lit by the
    computer's own cool light, an empty pipe."""
    fr = new(409, 'D')
    m = Map.of('S9')
    home(fr, m, panes='M', window='city', run='none', plan=True, person=False, lights='D')
    fr.steam(540, m(0, 838)[1] + 2, 650, 220, 'M', sway=18, ceiling=626)
    machine_15(fr, m)
    T = m(0, 838)[1]
    g(fr, 'box', 400, T + 40, 680, m(0, 1216)[1] - 16, w=9)               # E2: the lit opening
    g(fr, 'curve', [(680, T + 6), (520, T - 26), (372, T + 14)], arrow=True)   # the panel's swing (and the tag's)
    g(fr, 'ring', 540, 1140, 92)
    c(fr, 'corners', 60, 640, 1020, 1480, 110)                            # the camera at rest across the join
    return fr


def s10():
    """The hall's rows recede to a vanishing point on the eye line (540, 1343), hidden behind the machine; their tops
    converge inside the stage; water runs down; hot water out on "water"."""
    fr = new(410, 'D')
    m = Map.of('S9')
    home(fr, m, panes='M', window='city', run='none', plan=False, person=False, lights='D')
    vp = (540.0, m(0, HOME['horizon'])[1])
    T, F = m(0, 838)[1], m(0, 1216)[1]
    bx = m(HOME['block'][0], 0)[0]

    def on(p0, t):                                                        # a point a fraction t of the way to the VP
        return (p0[0] + (vp[0] - p0[0]) * t, p0[1] + (vp[1] - p0[1]) * t)
    # the hall's rows, marked out: their tops fall from y 640 at the left edge toward the VP, their feet rise from
    # y 1560; each row's front edge a vertical mark; on the right only the strip between the machine and the block
    for top0, foot0, xs in (((0, 640), (0, 1560), (0.0, 0.16, 0.36, 0.56)),
                            ((1080, 640), (1080, 1560), (0.46, 0.56, 0.64))):
        x_stop = 378 if top0[0] == 0 else 702
        t_stop = (x_stop - top0[0]) / (vp[0] - top0[0])
        for p0 in (top0, foot0):
            pa = on(p0, 0.0)
            pb = on(p0, t_stop)
            if top0[0] == 1080:
                pa = on(p0, (bx - p0[0]) / (vp[0] - p0[0]))
            fr.line([pa, pb], 'L', 5)
        for t in xs:
            a, b = on(top0, t), on(foot0, t)
            if (top0[0] == 0 and a[0] < 372) or (top0[0] == 1080 and 708 < a[0] < bx - 6):
                fr.line([a, b], 'L', 5)
    for x in (-420, -60, 1140, 1500):                                    # the floor's joints, under the app's text
        fr.line([(x, 1920), on((x, 1920), 0.62)], 'D', 6)
    machine_15(fr, m, water='hot')
    fr.steam(540, T + 2, 820, 120, 'M', sway=10, ceiling=760)             # the steam thinning (it stops on "computers")
    g(fr, 'line', [(0, 640), vp], dash=True, w=8)                         # B2: the rows' tops converge on the VP
    g(fr, 'line', [(0, 1560), vp], dash=True, w=8)
    g(fr, 'arrow', [(600, T + 60), (600, F - 30)])                        # RM1: the water travels the pipe down
    g(fr, 'ring', 540, F, 66)
    c(fr, 'arrow', [(560, F + 60), (700, F + 60)])                        # the front leads out: the one follow
    return fr


def s11_frame():
    """S11's mid-follow frame (f2096, "pipes"): the front held at x ~548."""
    return frame_at('S9', 'S11', follow_p(2096))


def s11():
    """Mid-follow (f2096): the hot water's front held at x ~550 while the street slides; the person near the camera
    on the pavement (M6), looking up; the window, frost on, at the city's level."""
    fr = new(411, 'D')
    m = Map(*s11_frame())
    fx, fy = front_at(2096)
    lead = [(174, 1216)] + list(HOME['run'][1:])
    t = polyline_len(cut_path(FOLLOW_PATH, 0.0, ease('trap', (2096 - 1975) / (2208 - 1975)))) / polyline_len(lead)
    home(fr, m, panes='M', window='city', run='front', run_upto=t, plan=True, person=True, lights='D')
    sx, sy = m(fx, fy)
    fr.ell(sx, sy, 28, 16, 'W')                                           # the front: held still on screen
    accent(fr, 'ell', sx, sy, 22, 12)
    g(fr, 'cross', sx, sy, 58)                                            # E3: still against the moving street
    g(fr, 'arrow', [(1000, 1460), (780, 1460)])                           # the world slides past (from the right)
    door = m(560, 1272)
    riser = m(598, 1062)
    g(fr, 'arrow', [(sx + 60, sy + 34), (door[0] + 40, door[1] + 34), (riser[0] + 40, door[1] + 20),
                    (riser[0] + 40, riser[1])], dash=True)                # its path on: the door, the riser
    win = m(*HOME['window'])
    c(fr, 'ring', win[0], win[1], 120)                                    # the window: the pull back's anchor
    return fr


def s12():
    """The payoff: S1's frame, the run warm end to end, the window the story light, the person near the camera on the
    pavement, your gloved hand and phone from the bottom left."""
    fr = new(412, 'D')
    m = Map.of('S12')
    home(fr, m, panes='M', window='lit', run='warm', plan=True, person=True)
    fr.poly([(150, 1920), (196, 1640), (262, 1520), (322, 1470), (372, 1500), (420, 1580), (430, 1920)], 'K')
    fr.rrect(322, 1296, 478, 1494, 24, 'K')                               # the phone
    fr.rrect(334, 1310, 466, 1480, 16, 'L')                               # its screen, a step under the window
    fr.rrect(358, 1362, 444, 1408, 18, 'D')                               # the chat bubble
    fr.poly([(372, 1400), (360, 1428), (392, 1404)], 'D')
    g(fr, 'arrow', [(392, 1330), (200, 1090), (262, 1190), (330, 1238), (640, 1238), (640, 1100)])
    g(fr, 'ring', 598, 985, 104)
    g(fr, 'line', [(746, 1176), (640, 1030)], dash=True, w=7)             # the person's look to the window
    c(fr, 'arrow', [(560, 1100), (560, 1306), (300, 1306), (160, 1250)], dash=True)   # the loop's un-paint
    c(fr, 'ring', 140, 1214, 34)                                          # frame 0's spot
    return fr


SHOTS = [  # key, lead code, lead name, time, frames, tier, move, join, fn
    ('S1', 'D7', 'the one lit break', '0.00-4.28 s', 'f0-257', 'CORE', 'RM8 the run, RM6 "heat"',
     'C: un-paint + push, "AI" f257', s1),
    ('S2', 'Z3', 'the medium', '4.28-8.76 s', 'f257-526', 'SIT', 'RM7, the walls rise',
     'C: RM4 2x, "Those" f526', s2),
    ('S3', 'N9', 'isolation', '8.76-10.96 s', 'f526-658', 'CORE', 'RM7, steam on "hot"',
     'C: I4 pull 2x, "To" f658', s3),
    ('S4', 'D7', 'the pattern', '10.96-17.76 s', 'f658-1066', 'CORE', 'RM8b rows on "FORTY"',
     'C: RM4 2x, "That\'s" f1066', s4),
    ('S5', 'N9', 'the close', '17.76-19.26 s', 'f1066-1156', 'CORE', 'RM7, the mug f1111',
     'C: the big move, I12', s5),
    ('S6', 'D2', 'scale', '19.26-23.46 s', 'f1156-1408', 'CORE', 'I4 at scale + I12',
     'RJ2 cut f1402; alt: J8 cloud', s6),
    ('S7', 'E9', 'the line travelled', '23.46-25.54 s', 'f1408-1532', 'CORE', 'RM8 the reach',
     'RJ4 seam 1.13x, "The"', s7),
    ('S8', 'C1', 'frame in frame', '25.54-28.34 s', 'f1532-1700', 'CORE', 'RM8 re-trace, tag',
     'C: RM4 1.16x, "So" f1700', s8),
    ('S9', 'E2', 'the lit opening', '28.34-29.56 s', 'f1700-1774', 'CORE', 'the panel opens f1716',
     'RJ4 at rest, "A" f1774', s9),
    ('S10', 'E2', '(held: B2 inside)', '29.56-34.46 s', 'f1774-2068', 'CORE', 'RM1 the water down',
     'C: RM3 the follow', s10),
    ('S11', 'E3', 'still vs motion', '34.46-38.48 s', 'f2068-2309', 'SIT', 'RM3 + I12, RM1 climb',
     'RJ4 seam pull, "So"', s11),
    ('S12', 'N14', 'the match', '38.48-42.24 s', 'f2309-2534', 'CORE', 'RM7, RM1 the pulse',
     'RJ3 the loop (B)', s12),
]
JOINS = ['C', 'C', 'C', 'C', 'C', 'F', 'C', 'C', 'C', 'C', 'C', 'B']
DUR = [4.28, 4.48, 2.20, 6.80, 1.50, 4.20, 2.08, 2.80, 1.22, 4.90, 4.02, 3.76]


# =====================================================================================================================
# The sheet: 1080 px wide (the phone's width), 3 x 4 tiles, then the film's strip
# =====================================================================================================================
SW, M, COLS, GAP = 1080, 24, 3, 18
TWp = (SW - 2 * M - (COLS - 1) * GAP) // COLS          # 332
THp = int(round(TWp * FH / FW))                          # 590
CAP_H = 74


def text_line(d, xy, parts):
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
    head_h, strip_h, foot_h = 300, 236, 66
    rows = (len(tiles) + COLS - 1) // COLS
    row_h = THp + CAP_H + 22
    SH = head_h + rows * row_h + strip_h + foot_h
    sheet = Image.new('RGB', (SW, SH), S.BG)
    d = ImageDraw.Draw(sheet)
    d.text((M, 22), 'Helsinki: the composition-and-motion pass', font=font(36, 'Bold'), fill=S.INK)
    d.text((M, 72), '12 PLANNING THUMBNAILS · after the fix pass · not a render', font=font(21, 'Bold'), fill=RED)
    y = 108
    para = ('Each frame is our 1080 x 1920 drawn from COMPOSITION_PASS.md\'s numbers on the locked 42.24 s take; '
            'every frame but the closes (S3, S5) and the planet (S6) is the ONE home view through that frame\'s map, '
            'so the block, the plan, the run and the person sit where the camera puts them. Grey values (white only '
            'for the story light), amber the one warm accent (the heat). RED: the lead device\'s guides, the focal '
            'ring, the motion in the shot. BLUE: the join\'s carrier. Dashed: the caption band; veiled: the app on '
            'the owner\'s Reels tab. Leads (Part 0 codes): his D7, D2, E9, C1, E2, E3; ours Z3, N9, N14.')
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
        text_line(d, (x0, ty), [(key + ' ', font(23, 'Bold'), S.INK), (code, font(23, 'Bold'), RED),
                                (' ' + name, font(21, 'SemiBold'), S.INK)])
        d.text((x0, ty + 32), '%s · %s · %s' % (when, frames, tier), font=font(18), fill=S.SUB)
    top = head_h + rows * row_h + 6
    d.text((M, top), 'The film on the take (42.24 s): the lead per stop, the join after it', font=font(20, 'Bold'),
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
    for line in wrap(d, 'Joins: C x10 (one continuous camera; RJ4 only at the two <= 1.15x seams and at rest) · F x1, '
                     'the one cut, on "But" (f1402; the owner\'s alternative is a snow cloud wiping across, J8) · B, '
                     'the loop back to frame 0. 9 leads in 11 stops (S9-S10 one held frame), 9 CORE-led, no RARE.',
                     font(17), SW - 2 * M):
        d.text((M, yy), line, font=font(17), fill=S.INK)
        yy += 23
    yy = SH - 52
    for line in wrap(d, 'Script: video/docs/v4/visual/composition_pass_sheet.py (PIL, seeded; the composition '
                     'library\'s drawing kit; --numbers and --speeds print the pass\'s tables). Planning only: nothing '
                     'traced or copied.', font(15), SW - 2 * M):
        d.text((M, yy), line, font=font(15), fill=S.SUB)
        yy += 20
    return sheet


# =====================================================================================================================
# --numbers, --speeds, --camspeed
# =====================================================================================================================
def numbers():
    print('Every home-view piece in every frame (px, y down); the band is y 290-600, every top at y >= 620; the name'
          ' block from y 1519; the feed x 98-982.')
    for key in ('S1', 'S2', 'S3', 'S4', 'S5', 'S7', 'S8', 'S9', 'S11', 'S12'):
        m = Map.of(key)
        cx0, ct, cx1, cf = HOME['computer']
        bx0, broof, bx1, bfoot = HOME['block']
        px0, px1, ptop, pfront = HOME['plan']
        a, b = m(cx0, ct), m(cx1, cf)
        bumps = [m(x0, top) for x0, x1, top in HOME['bumps']]
        print(f'{key:4s} s {m.s:.4f}  computer x {a[0]:.0f}-{b[0]:.0f} y {a[1]:.0f}-{b[1]:.0f}  '
              f'block x {m(bx0, 0)[0]:.0f} roof {m(0, broof)[1]:.0f} foot {m(0, bfoot)[1]:.0f}  '
              f'horizon {m(0, HOME["horizon"])[1]:.0f}  plan posts x {m(px0, 0)[0]:.0f}/{m(px1, 0)[0]:.0f} '
              f'top {m(0, ptop)[1]:.0f} front {m(0, pfront)[1]:.0f}')
        print(f'      window ({m(*HOME["window"])[0]:.0f}, {m(*HOME["window"])[1]:.0f})  small box '
              f'({m(*HOME["smallbox"])[0]:.0f}, {m(*HOME["smallbox"])[1]:.0f})  door ({m(560, 1272)[0]:.0f}, '
              f'{m(560, 1272)[1]:.0f})  run start ({m(260, 1220)[0]:.0f}, {m(260, 1220)[1]:.0f})  riser top '
              f'({m(*HOME["radiator"])[0]:.0f}, {m(*HOME["radiator"])[1]:.0f})  resident feet '
              f'({m(780, 1340)[0]:.0f}, {m(780, 1340)[1]:.0f}) P {180 * m.s:.0f}  bumps '
              + ', '.join(f'({x:.0f}, {y:.0f})' for x, y in bumps))
    print('\nThe moves (fixed point = the screen point the move scales about; rule 12: one move):')
    for key, a, b, f0, f1, e, code, what in MOVES:
        (Px, Py), r = fixed_point(a, b)
        print(f'  {key:8s} {r:.3f}x about ({Px:.0f}, {Py:.0f}), f{f0}-{f1} ({f1 - f0} f, {e}): {code}; {what}')
    print('\nBand check through every move (the block\'s roof and bumps, the plan\'s post tops; x <= 945, the caption'
          ' band\'s width): the lowest y reached while inside x 95-945')
    pieces = {'block roof (left corner)': (HOME['block'][0], HOME['block'][1]),
              'stair tower': (HOME['bumps'][0][0], HOME['bumps'][0][2]), 'chimney': (HOME['bumps'][1][0], HOME['bumps'][1][2]),
              'plan post top L': (HOME['plan'][0], HOME['plan'][2]), 'plan post top R': (HOME['plan'][1], HOME['plan'][2])}
    for key, a, b, f0, f1, e, code, what in MOVES:
        worst = {}
        for f in range(f0, f1 + 1):
            fm = Map(*move_frame(a, b, f0, f1, e, f))
            for name, (hx, hy) in pieces.items():
                x, y = fm(hx, hy)
                if 95 <= x <= 945 and (name not in worst or y < worst[name][0]):
                    worst[name] = (y, f, x)
        bad = {n: v for n, v in worst.items() if v[0] < 620}
        print(f'  {key:8s} ' + ('clear (>= 620)' if not bad else '; '.join(
            f'{n} y {v[0]:.0f} at f{v[1]} x {v[2]:.0f}' for n, v in bad.items())))
    print('\nThe big move (nested pull, one S5_EASE): progress and the home view\'s scale on the words')
    f0, f1, e, tot = BIG[1:]
    for w, f in (('end of "tea."', 1130), ('"Normally,"', 1156), ('"data"', 1196), ('"centers"', 1206),
                 ('"just" (peak)', 1225), ('"use" (hand-off)', 1242), ('"big"', 1256), ('"fans"', 1271),
                 ('"blow" (landed)', 1312)):
        p = ease(e, (f - f0) / (f1 - f0))
        h = 3.1111 * tot ** (-p)
        print(f'  f{f} {w:18s} p {p:.3f}  home view x{h:.3f} ({1080 * h:.0f} px wide)  vs landed x{h / LAND:.2f}')


GRID = [((i + 0.5) * FW / 7, (j + 0.5) * FH / 11) for i in range(7) for j in range(11)]


def move_speeds(a, b, f0, f1, e, pts):
    prev = None
    best = {kk: (0.0, None, None) for kk in pts}
    gbest = (0.0, None)
    for f in range(f0, f1 + 1):
        fr = move_frame(a, b, f0, f1, e, f)
        if prev is not None:
            m0, m1 = Map(*prev), Map(*fr)
            for kk, (hx, hy) in pts.items():
                x0, y0 = m0(hx, hy)
                x1, y1 = m1(hx, hy)
                if (0 <= x1 <= FW and 0 <= y1 <= FH) or (0 <= x0 <= FW and 0 <= y0 <= FH):
                    v = math.hypot(x1 - x0, y1 - y0)
                    if v > best[kk][0]:
                        best[kk] = (v, f, (round(x1), round(y1)))
            gv = max(math.hypot(*(np.subtract(m1(*m0.inv(gx, gy)), (gx, gy)))) for gx, gy in GRID)
            if gv > gbest[0]:
                gbest = (gv, f)
        prev = fr
    return gbest, best


def speeds():
    s4 = Map.of('S4')
    tracked = {
        'S1-S2': {'the window': (598, 985), 'the block\'s right side': (812, 1000), 'the computer\'s lights': (174, 1027),
                  'the riser (the brush)': (598, 1160)},
        'S2-S3': {'the computer\'s lower lights': (174, 1150), 'the computer\'s foot': (174, 1216),
                  'the plan\'s left post': (-50, 1000), 'the block\'s roof': (378, 690)},
        'S3-S4': {'the computer\'s foot': (174, 1216), 'its lower lights': (174, 1150), 'its right side': (282, 1027)},
        'S4-S5': {'the kettles\' front row': s4.inv(220, 1515), 'their back row': s4.inv(310, 1458),
                  'the lit grille': s4.inv(540, 1076), 'the block\'s roof': (378, 690)},
        'S7in': {'the computer\'s top': (174, 838), 'the block': (378, 900)},
        'S7-S8': {'the small box': (420, 1272), 'the computer\'s foot': (174, 1216), 'the block': (378, 900)},
        'S8-S9': {'the block\'s roof': (378, 690), 'the plan\'s left post top': (-50, 756), 'the tag': (174, 985)},
        'S10-S11': {'the window': (598, 985), 'the next block': (900, 900), 'the computer\'s top': (174, 838),
                    'the person\'s head': (780, 1170)},
        'S11-S12': {'the computer\'s lights': (174, 1027), 'the person\'s head': (780, 1170), 'the door': (560, 1272)},
    }
    print('Peak screen speeds (px per 60 fps frame; the budget ~15 for detailed layers, PIPELINE_V2 "Frame rate"):'
          ' the frame grid (camspeed\'s camera measure) and the named detailed things while on screen')
    for key, a, b, f0, f1, e, code, what in MOVES:
        (gv, gf), best = move_speeds(a, b, f0, f1, e, tracked.get(key, {}))
        items = '; '.join(f'{n} {v:.1f}' for n, (v, f, xy) in best.items() if v > 0)
        print(f'  {key:8s} f{f0}-{f1} {e:5s} grid {gv:5.1f} at f{gf}  |  {items}')
    f0, f1, e, tot = BIG[1:]
    us = np.linspace(0, 1, 4001)
    ps = np.array([ease(e, u) for u in us])
    peak = float(np.max(np.gradient(ps, us)))
    rate = peak * math.log(tot) / (f1 - f0)
    print(f'  S5-S6    f{f0}-{f1} S5_EASE x{tot:.0f}: peak log-rate {rate:.4f}/f ({peak:.2f}x the mean) -> a detail '
          f'r px from the pivot moves r x {rate:.4f}: 15 px/f at r = {15 / rate:.0f} px; mean per 30 f '
          f'x{math.exp(30 * math.log(tot) / (f1 - f0)):.2f} (library: <= ~2.3x)')


def _world(WS, MX, MY, with_kettles):
    """The planning world: the home view drawn once at WS x scale on a canvas MX / MY home px wider than the frame."""
    size = (int((1080 + 2 * MX) * WS), int((1920 + 2 * MY) * WS))
    FWb, FHb = S.FW, S.FH
    try:
        S.FW, S.FH = size                            # the kit's masks (clouds, text) follow the canvas
        world = Frame(499, 'D')
        world.amber = []
        wm = Map(WS, (66 + MX) * WS, (838 + MY) * WS)
        home(world, wm, panes='M', window='city', run='line', plan=True, person=True)
        if with_kettles:
            s4 = Map.of('S4')
            for y, width, s_ in KETTLE_ROWS:
                for i in range(8):
                    hx, hy = s4.inv(540 - width / 2 + width * (i + 0.5) / 8, y)
                    x, yb = wm(hx, hy)
                    r = s_ / s4.s * WS
                    world.blob(x, yb - r * 0.3, r * 0.42, r * 0.36, 'L', 0.05)
                    world.ell(x, yb - r * 0.66, r * 0.12, r * 0.07, 'K')
    finally:
        S.FW, S.FH = FWb, FHb
    return world.im


def camspeed(out_dir):
    """Render each move at half size from the planning world (the home view drawn once at 3x) and run camspeed.py."""
    os.makedirs(out_dir, exist_ok=True)
    WS, MX, MY = 3.0, 320, 140
    worlds = {False: _world(WS, MX, MY, False), True: _world(WS, MX, MY, True)}
    results = []
    for key, a, b, f0, f1, e, code, what in MOVES:
        big = worlds[key in ('S3-S4', 'S4-S5')]
        d = os.path.join(out_dir, key)
        os.makedirs(d, exist_ok=True)
        for old in os.listdir(d):
            os.remove(os.path.join(d, old))
        for i, f in enumerate(range(f0, f1 + 1)):
            s_, X, Y = move_frame(a, b, f0, f1, e, f)
            # output px (u, v) at half size -> frame px (2u, 2v) -> home px -> world px
            ax = WS * 2.0 / s_
            ox = WS * ((0 - X) / s_ + 66 + MX)
            oy = WS * ((0 - Y) / s_ + 838 + MY)
            im = big.transform((FW // 2, FH // 2), Image.AFFINE, (ax, 0, ox, 0, ax, oy), resample=Image.BILINEAR,
                               fillcolor=GREY['D'])
            im.convert('RGB').save(os.path.join(d, 'f%05d.png' % i))
        cmd = [sys.executable, CAMSPEED, '--frames', d, '--fps', '60', '--limit', '15']
        r = subprocess.run(cmd, capture_output=True, text=True)
        txt = (r.stdout + r.stderr).strip().splitlines()
        results.append((key, txt))
        print(key, f'f{f0}-{f1}')
        for line in txt:
            print('   ', line)
    return results


def main(argv):
    if '--numbers' in argv:
        numbers()
        return
    if '--speeds' in argv:
        speeds()
        return
    if '--camspeed' in argv:
        camspeed(argv[argv.index('--camspeed') + 1])
        return
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
