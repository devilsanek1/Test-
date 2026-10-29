"""Round 5 (owner, 2026-10-29: "I like the city view but it's too generic like why is it relevant to us"): one dusk
city in the posters' language, made ours three ways (the talk, the fuss, the question). Stills only; no text.
Each function draws a full 1000 x 1000 square; the platforms crop the circle."""
import math
import random

import numpy as np

from logo_lib import bez, join, stroke_outline, poly_d, arc
from marks_r4 import _uid, lin, rad, elephant

SKY = [(0, '#2B2757'), (0.42, '#6A5A9C'), (0.74, '#C596AE'), (1, '#F5C39A')]
C = dict(sun='#FCD8A6', cloud='#A985B3', cloud2='#D9A9B4', far=('#9284BF', '#9D90C8', '#8678B6'), far_lit='#F4C98F',
         mid=('#4A3D7B', '#544689', '#3F3470'), win='#3A2F63', lit='#FFCB7E', water=('#C99BAC', '#7E6BA6', '#4A3E7A'),
         glint='#FCD8A6', quay='#1E1733', quay_top='#3A2E58', pip='#1E1733')
HZ, MID, QUAY = 652, 714, 822


def _c(cx, cy, r, fill):
    return f'<circle cx="{cx:.1f}" cy="{cy:.1f}" r="{r:.1f}" fill="{fill}"/>'


def _r(x, y, w, h, fill, rx=0):
    return f'<rect x="{x:.1f}" y="{y:.1f}" width="{w:.1f}" height="{h:.1f}" rx="{rx}" fill="{fill}"/>'


def city(seed=11, gap=(568, 748), pip=True, sun=(652, 640, 92), mono=None):
    """The dusk city: sky, sun, far skyline, mid city with lit windows, the river, the quay. mono: the skyline and
    the quay only, in that one colour (for the one-colour versions)."""
    rnd = random.Random(seed)
    if mono:
        return _city_mono(seed, gap, mono)
    g_sky, g_w = _uid('cs'), _uid('cw')
    defs = (lin(g_sky, 0, 0, 0, HZ, SKY)
            + lin(g_w, 0, MID, 0, QUAY, [(0, C['water'][0]), (0.45, C['water'][1]), (1, C['water'][2])]))
    out = f'<defs>{defs}</defs><rect width="1000" height="{HZ + 4}" fill="url(#{g_sky})"/>'
    # calm streaks of cloud, low in the warm part of the sky
    for (x, y, w, h, col) in ((90, 430, 260, 16, C['cloud']), (150, 458, 150, 12, C['cloud']),
                              (640, 404, 300, 18, C['cloud']), (700, 436, 170, 12, C['cloud']),
                              (430, 520, 210, 12, C['cloud2'])):
        out += _r(x, y, w, h, col, rx=h / 2)
    out += _c(*sun, C['sun'])
    # the far skyline: many slim pale buildings, a spire, a clock tower, a dome
    x = -16
    while x < 1016:
        w = rnd.randint(16, 40)
        h = rnd.choice([26, 34, 42, 52, 62, 74, 90, 46, 38])
        col = rnd.choice(C['far'])
        out += _r(x, HZ - h, w + 0.6, h + 2, col)
        top = rnd.random()
        if top < 0.22:
            out += f'<path d="M{x} {HZ - h} L{x + w / 2:.1f} {HZ - h - w * 0.55:.1f} L{x + w} {HZ - h} Z" fill="{col}"/>'
        elif top < 0.30:
            out += _r(x + w * 0.3, HZ - h - 14, w * 0.4, 16, col)
        for wy in range(HZ - h + 8, HZ - 6, 11):
            for wx in range(int(x) + 4, int(x + w) - 4, 8):
                if rnd.random() < 0.05:
                    out += _r(wx, wy, 3.4, 4.6, C['far_lit'])
        x += w
    fx = C['far'][2]
    out += _r(352, HZ - 214, 20, 216, fx) + f'<path d="M350 {HZ - 214} L362 {HZ - 300} L374 {HZ - 214} Z" fill="{fx}"/>'
    out += _r(168, HZ - 150, 34, 152, fx) + _r(174, HZ - 172, 22, 24, fx) + \
        f'<path d="M170 {HZ - 172} L185 {HZ - 200} L200 {HZ - 172} Z" fill="{fx}"/>' + _c(185, HZ - 128, 8, C['far_lit'])
    out += _r(770, HZ - 96, 92, 98, fx) + f'<path d="M774 {HZ - 96} A42 42 0 0 1 858 {HZ - 96} Z" fill="{fx}"/>' + \
        _r(812, HZ - 150, 8, 18, fx)
    # the river opens to the horizon between the two banks of the mid city
    out += f'<rect y="{HZ}" width="1000" height="{QUAY - HZ + 2}" fill="url(#{g_w})"/>'
    for wd, dy in ((170, 14), (130, 34), (96, 54), (66, 74), (42, 94), (24, 112)):
        out += _r(sun[0] - wd / 2, HZ + dy, wd, 8, C['glint'], rx=4)
    lit_spots = []
    for side in ('L', 'R'):
        x = -20 if side == 'L' else gap[1]
        x_end = gap[0] if side == 'L' else 1020
        while x < x_end:
            w = rnd.randint(52, 98)
            w = min(w, x_end - x) if x_end - x > 40 else w
            near_gap = (side == 'L' and x + w > gap[0] - 120) or (side == 'R' and x < gap[1] + 120)
            h = rnd.randint(110, 170) if near_gap else rnd.randint(150, 290)
            col = rnd.choice(C['mid'])
            y0 = MID - h
            out += _r(x, y0, w + 0.6, h + 2, col)
            roof = rnd.random()
            if roof < 0.38:
                out += f'<path d="M{x - 3} {y0} L{x + w / 2:.1f} {y0 - w * 0.42:.1f} L{x + w + 3} {y0} Z" fill="{col}"/>'
            elif roof < 0.50:
                out += _r(x + 6, y0 - 16, w - 12, 18, col) + _r(x + w / 2 - 5, y0 - 34, 10, 20, col)
            elif roof < 0.58:
                out += f'<path d="M{x + 8} {y0} A{(w - 16) / 2:.1f} {(w - 16) / 2:.1f} 0 0 1 {x + w - 8} {y0} Z" fill="{col}"/>'
            for wy in range(y0 + 16, MID - 26, 27):
                for wx in range(int(x) + 10, int(x + w) - 16, 20):
                    lit = rnd.random() < 0.24
                    out += _r(wx, wy, 9, 13, C['lit'] if lit else C['win'])
                    if lit and wy > MID - 70:
                        lit_spots.append(wx)
            x += w
    out += _r(-10, MID - 2, 1020, 8, C['mid'][2])
    for wx in lit_spots[:14]:  # the lit windows near the water, mirrored
        out += _r(wx + 1, MID + 12, 7, 26, C['lit'], rx=3.5)
    # the quay we stand on, and Pip on it (find Pip)
    out += _r(0, QUAY, 1000, 1000 - QUAY, C['quay']) + _r(0, QUAY - 4, 1000, 10, C['quay_top'])
    if pip:
        out += elephant(C['pip'], scale=0.075, dx=258 - 540 * 0.075, dy=QUAY - 772 * 0.075 + 1)
    return out


# ---------------------------------------------------------------- A. Talk of the Town: the city inside a speech bubble
def bubble_d(cx=520, cy=468, r=372, tail=((262, 690), (196, 878), (392, 764))):
    """A round speech bubble with a real tail, as one closed path."""
    (ax, ay), (tx, ty), (bx, by) = tail
    a0 = math.degrees(math.atan2(ay - cy, ax - cx))
    a1 = math.degrees(math.atan2(by - cy, bx - cx))
    pa = (cx + r * math.cos(math.radians(a0)), cy + r * math.sin(math.radians(a0)))
    pb = (cx + r * math.cos(math.radians(a1)), cy + r * math.sin(math.radians(a1)))
    return (f'M{pb[0]:.1f} {pb[1]:.1f} A{r} {r} 0 1 0 {pa[0]:.1f} {pa[1]:.1f} '
            f'Q{(pa[0] + tx) / 2 - 6:.1f} {(pa[1] + ty) / 2 + 30:.1f} {tx} {ty} '
            f'Q{(pb[0] + tx) / 2 + 24:.1f} {(pb[1] + ty) / 2 + 6:.1f} {pb[0]:.1f} {pb[1]:.1f} Z')


def talk_of_the_town(bg='#1A1328', rim='#F7EDE3'):
    cid = _uid('tb')
    d = bubble_d()
    scene = city(seed=11)
    s, ox, oy = 1.0, 520 - 500 * 1.0, 468 - 560 * 1.0
    out = f'<rect width="1000" height="1000" fill="{bg}"/>'
    out += f'<path d="{bubble_d(r=372 + 16, tail=((256, 694), (184, 896), (398, 770)))}" fill="{rim}"/>'
    out += (f'<defs><clipPath id="{cid}"><path d="{d}"/></clipPath></defs><g clip-path="url(#{cid})">'
            f'<g transform="translate({ox:.1f} {oy:.1f}) scale({s})">{scene}</g></g>')
    return out


# ---------------------------------------------------------------- B. The City Is Talking: bubbles rising like lanterns
def _speech(cx, cy, r, fill, tail_dir=(-0.55, 0.85)):
    tx, ty = cx + tail_dir[0] * r * 1.55, cy + tail_dir[1] * r * 1.55
    a = math.atan2(tail_dir[1], tail_dir[0])
    p1 = (cx + r * math.cos(a - 0.42), cy + r * math.sin(a - 0.42))
    p2 = (cx + r * math.cos(a + 0.42), cy + r * math.sin(a + 0.42))
    return (_c(cx, cy, r, fill) + f'<path d="M{p1[0]:.1f} {p1[1]:.1f} L{tx:.1f} {ty:.1f} L{p2[0]:.1f} {p2[1]:.1f} Z" '
            f'fill="{fill}"/>')


def city_is_talking():
    out = city(seed=23)
    g = _uid('bg')
    out += f'<defs>{rad(g, 600, 250, 150, [(0, "#FFE7C4"), (0.55, "rgba(255,214,160,0.35)"), (1, "rgba(255,214,160,0)")])}</defs>'
    out += _c(600, 250, 150, f'url(#{g})')
    for (x, y, r, col, td) in ((190, 520, 22, '#F3DCCB', (-0.4, 0.9)), (300, 430, 30, '#F6E2CF', (-0.5, 0.86)),
                               (842, 470, 26, '#F3DCCB', (0.45, 0.9)), (420, 330, 40, '#F9E8D4', (-0.55, 0.84)),
                               (600, 250, 74, '#FFF4E2', (-0.5, 0.86))):
        out += _speech(x, y, r, col, td)
    return out


# ---------------------------------------------------------------- C. The Question Lamp
def _question_line(cx=640, top=214, R=104):
    """The bracket's centre line: a question mark's hook and stem (from the free end to the stem's foot)."""
    hook = arc(cx, top + R, R, 200, 360 + 28, 160)  # from the lower left, over the top, round the right
    P = hook[-1]
    stem_top = np.array([cx + 8, top + 2 * R + 66])
    tan = np.array([-math.sin(math.radians(28)), math.cos(math.radians(28))])
    s_curve = bez(P, P + 70 * tan, stem_top - np.array([0, 70]), stem_top, 40)
    stem = np.array([stem_top, stem_top + np.array([0, 34])])
    return join(hook, s_curve, stem)


def _lantern(x, y, ink, glass='#FFE3A6'):
    """A small glass lantern hanging from (x, y): the question's dot, lit."""
    return (_r(x - 4, y, 8, 18, ink)
            + f'<path d="M{x - 30} {y + 18} L{x + 30} {y + 18} L{x + 20} {y + 30} L{x - 20} {y + 30} Z" fill="{ink}"/>'
            + f'<path d="M{x - 24} {y + 30} L{x + 24} {y + 30} L{x + 30} {y + 82} L{x - 30} {y + 82} Z" fill="{glass}"/>'
            + _r(x - 36, y + 80, 72, 12, ink, rx=5) + _r(x - 6, y + 92, 12, 10, ink))


def question_lamp():
    out = city(seed=37, pip=False)
    ink = '#150E26'
    line = _question_line()
    foot = line[-1]
    lx, ly = foot[0], foot[1] + 4
    g = _uid('lg')
    out += f'<defs>{rad(g, lx, ly + 56, 250, [(0, "rgba(255,216,152,0.62)"), (0.42, "rgba(255,196,130,0.18)"), (1, "rgba(255,196,130,0)")])}</defs>'
    out += _c(lx, ly + 56, 250, f'url(#{g})')
    # the corner of the near building the bracket is fixed to
    out += _r(842, 0, 170, 1000, ink) + _r(842, 0, 10, 1000, '#2A2042')
    for wy in range(90, 800, 120):
        out += _r(880, wy, 46, 70, '#241A3A')
    # the bracket: a question mark in iron, from the wall; a short arm holds it
    out += _r(744, 300, 104, 16, ink)
    out += f'<path d="{stroke_outline(line, 40)}" fill="{ink}"/>'
    out += _lantern(lx, ly, ink)
    # Pip on the quay, looking up at the light (find Pip)
    out += elephant(ink, scale=0.085, dx=470 - 540 * 0.085, dy=QUAY - 772 * 0.085 + 1)
    return out


def question_lamp_mono(col):
    shape = '<circle cx="500" cy="500" r="500" fill="white"/>'
    line = _question_line()
    foot = line[-1]
    holes = city(seed=37, mono='black') + _r(842, 0, 170, 1000, 'black') + _r(744, 300, 104, 16, 'black')
    holes += f'<path d="{stroke_outline(line, 40)}" fill="black"/>' + _lantern(foot[0], foot[1] + 4, 'black', 'black')
    return _mono_emblem(col, shape, holes)


def _city_mono(seed, gap, col):
    """The same skyline as city(seed), as one flat silhouette (the far city, the mid city, the quay)."""
    rnd = random.Random(seed)
    out = ''
    x = -16
    while x < 1016:
        w = rnd.randint(16, 40)
        h = rnd.choice([26, 34, 42, 52, 62, 74, 90, 46, 38])
        rnd.choice(C['far'])
        out += _r(x, HZ - h, w + 0.6, h + 2, col)
        top = rnd.random()
        if top < 0.22:
            out += f'<path d="M{x} {HZ - h} L{x + w / 2:.1f} {HZ - h - w * 0.55:.1f} L{x + w} {HZ - h} Z" fill="{col}"/>'
        elif top < 0.30:
            out += _r(x + w * 0.3, HZ - h - 14, w * 0.4, 16, col)
        for wy in range(HZ - h + 8, HZ - 6, 11):
            for wx in range(int(x) + 4, int(x + w) - 4, 8):
                rnd.random()
        x += w
    out += _r(352, HZ - 214, 20, 216, col) + f'<path d="M350 {HZ - 214} L362 {HZ - 300} L374 {HZ - 214} Z" fill="{col}"/>'
    out += _r(168, HZ - 150, 34, 152, col) + _r(174, HZ - 172, 22, 24, col) + \
        f'<path d="M170 {HZ - 172} L185 {HZ - 200} L200 {HZ - 172} Z" fill="{col}"/>'
    out += _r(770, HZ - 96, 92, 98, col) + f'<path d="M774 {HZ - 96} A42 42 0 0 1 858 {HZ - 96} Z" fill="{col}"/>'
    for side in ('L', 'R'):
        x = -20 if side == 'L' else gap[1]
        x_end = gap[0] if side == 'L' else 1020
        while x < x_end:
            w = rnd.randint(52, 98)
            w = min(w, x_end - x) if x_end - x > 40 else w
            near_gap = (side == 'L' and x + w > gap[0] - 120) or (side == 'R' and x < gap[1] + 120)
            h = rnd.randint(110, 170) if near_gap else rnd.randint(150, 290)
            rnd.choice(C['mid'])
            y0 = MID - h
            out += _r(x, y0, w + 0.6, h + 2, col)
            roof = rnd.random()
            if roof < 0.38:
                out += f'<path d="M{x - 3} {y0} L{x + w / 2:.1f} {y0 - w * 0.42:.1f} L{x + w + 3} {y0} Z" fill="{col}"/>'
            elif roof < 0.50:
                out += _r(x + 6, y0 - 16, w - 12, 18, col) + _r(x + w / 2 - 5, y0 - 34, 10, 20, col)
            elif roof < 0.58:
                out += f'<path d="M{x + 8} {y0} A{(w - 16) / 2:.1f} {(w - 16) / 2:.1f} 0 0 1 {x + w - 8} {y0} Z" fill="{col}"/>'
            for wy in range(y0 + 16, MID - 26, 27):
                for wx in range(int(x) + 10, int(x + w) - 16, 20):
                    rnd.random()
            x += w
    out += _r(-10, MID - 2, 1020, 10, col)
    out += _r(0, QUAY - 4, 1000, 1004 - QUAY, col)
    return out


def _mono_emblem(col, shape, holes):
    """One colour: a solid shape with the skyline and the given holes cut out of it."""
    mid = _uid('m5')
    return (f'<defs><mask id="{mid}" maskUnits="userSpaceOnUse" x="0" y="0" width="1000" height="1000">'
            f'<rect width="1000" height="1000" fill="black"/>{shape}{holes}</mask></defs>'
            f'<rect width="1000" height="1000" fill="{col}" mask="url(#{mid})"/>')


def talk_of_the_town_mono(col):
    s, ox, oy = 1.0, 520 - 500 * 1.0, 468 - 560 * 1.0
    shape = f'<path d="{bubble_d()}" fill="white"/>'
    cid = _uid('tm')
    holes = (f'<clipPath id="{cid}"><path d="{bubble_d()}"/></clipPath><g clip-path="url(#{cid})">'
             f'<g transform="translate({ox:.1f} {oy:.1f}) scale({s})">{city(seed=11, mono="black")}</g></g>')
    return _mono_emblem(col, shape, holes)


def city_is_talking_mono(col):
    shape = '<circle cx="500" cy="500" r="500" fill="white"/>'
    holes = city(seed=23, mono='black')
    for (x, y, r, td) in ((190, 520, 22, (-0.4, 0.9)), (300, 430, 30, (-0.5, 0.86)), (842, 470, 26, (0.45, 0.9)),
                          (420, 330, 40, (-0.55, 0.84)), (600, 250, 74, (-0.5, 0.86))):
        holes += _speech(x, y, r, 'black', td)
    return _mono_emblem(col, shape, holes)
