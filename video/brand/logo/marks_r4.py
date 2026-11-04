"""Round 4 (owner, 2026-10-29: "Nope from scratch I don't like none of them", "More premium"): emblems in the
city posters' language (light at dusk, layered depth, a hidden detail), no text. Each draws a full 1000 x 1000
square (its own background); the platforms crop the circle."""
import itertools
import math
import random

import numpy as np

from logo_lib import arc, bez, join, stroke_outline, poly_d

_ids = itertools.count(1)


def _uid(p):
    return f'{p}{next(_ids)}'


def lin(gid, x1, y1, x2, y2, stops):
    st = ''.join(f'<stop offset="{o}" stop-color="{c}"/>' for o, c in stops)
    return (f'<linearGradient id="{gid}" gradientUnits="userSpaceOnUse" x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}">'
            f'{st}</linearGradient>')


def rad(gid, cx, cy, r, stops, fx=None, fy=None):
    st = ''.join(f'<stop offset="{o}" stop-color="{c}"/>' for o, c in stops)
    f = f' fx="{fx}" fy="{fy}"' if fx is not None else ''
    return (f'<radialGradient id="{gid}" gradientUnits="userSpaceOnUse" cx="{cx}" cy="{cy}" r="{r}"{f}>{st}'
            f'</radialGradient>')


def catmull(points, closed=True, alpha=0.5, n=14):
    """A smooth curve through the points (centripetal Catmull-Rom), as a dense polyline."""
    P = [np.array(p, float) for p in points]
    if closed:
        P = [P[-1]] + P + [P[0], P[1]]
    else:
        P = [P[0]] + P + [P[-1]]
    out = []
    for i in range(1, len(P) - 2):
        p0, p1, p2, p3 = P[i - 1], P[i], P[i + 1], P[i + 2]

        def tj(ti, a, b):
            return ti + max(np.linalg.norm(b - a), 1e-6) ** alpha
        t0 = 0
        t1 = tj(t0, p0, p1)
        t2 = tj(t1, p1, p2)
        t3 = tj(t2, p2, p3)
        for t in np.linspace(t1, t2, n, endpoint=False):
            a1 = (t1 - t) / (t1 - t0) * p0 + (t - t0) / (t1 - t0) * p1
            a2 = (t2 - t) / (t2 - t1) * p1 + (t - t1) / (t2 - t1) * p2
            a3 = (t3 - t) / (t3 - t2) * p2 + (t - t2) / (t3 - t2) * p3
            b1 = (t2 - t) / (t2 - t0) * a1 + (t - t0) / (t2 - t0) * a2
            b2 = (t3 - t) / (t3 - t1) * a2 + (t - t1) / (t3 - t1) * a3
            out.append((t2 - t) / (t2 - t1) * b1 + (t - t1) / (t2 - t1) * b2)
    return np.array(out)


def arch_d(x0, y_top, W, y_bot):
    r = W / 2
    return (f'M{x0:.2f} {y_bot:.2f} L{x0:.2f} {y_top + r:.2f} A{r:.2f} {r:.2f} 0 0 1 {x0 + W:.2f} {y_top + r:.2f} '
            f'L{x0 + W:.2f} {y_bot:.2f} Z')


# ================================================================ 1. THE WINDOW
WIN = dict(wall_in='#4C3A63', wall_mid='#2E2342', wall_out='#191325', jamb_lit='#D9895A', jamb_dark='#2A1F38',
           glass=('#FFF4DA', '#FFD999', '#F5A564', '#DD7848'), bar='#2A1F38', sill_lit='#F4B47C',
           sill_end='#5E4358', sill_front='#231A33', pip='#2A1F38')


def window_emblem(c=WIN, figurine=True, scale=1.18):
    g1, g2, g3, g4 = _uid('ww'), _uid('wg'), _uid('wj'), _uid('ws')
    W = 330 * scale
    x0 = 500 - W / 2
    y_top, y_bot = 500 - 300 * scale, 500 + 238 * scale
    defs = (rad(g1, 500, 560, 660, [(0, c['wall_in']), (0.45, c['wall_mid']), (1, c['wall_out'])])
            + lin(g3, x0, 0, x0 + W, 0, [(0, c['jamb_lit']), (0.5, '#7A4A4A'), (1, c['jamb_dark'])])
            + rad(g2, 488, y_bot - 90, 520, [(0, c['glass'][0]), (0.32, c['glass'][1]), (0.72, c['glass'][2]),
                                              (1, c['glass'][3])])
            + lin(g4, x0 - 50, 0, x0 + W + 50, 0, [(0, c['sill_end']), (0.5, c['sill_lit']), (1, c['sill_end'])]))
    out = f'<defs>{defs}</defs><rect width="1000" height="1000" fill="url(#{g1})"/>'
    out += f'<path d="{arch_d(x0, y_top, W, y_bot)}" fill="url(#{g3})"/>'
    il, ir, it = 32 * scale, 11 * scale, 17 * scale
    gx0, gW = x0 + il, W - il - ir
    glass = arch_d(gx0, y_top + it, gW, y_bot)
    out += f'<path d="{glass}" fill="url(#{g2})"/>'
    cid = _uid('wc')
    out += f'<defs><clipPath id="{cid}"><path d="{glass}"/></clipPath></defs><g clip-path="url(#{cid})">'
    r = gW / 2
    cx_, cy_ = gx0 + r, y_top + it + r
    bw = 15 * scale
    out += f'<rect x="{cx_ - bw / 2:.1f}" y="{y_top:.1f}" width="{bw:.1f}" height="{y_bot - y_top:.1f}" fill="{c["bar"]}"/>'
    out += f'<rect x="{gx0 - 5:.1f}" y="{cy_ - bw / 2:.1f}" width="{gW + 10:.1f}" height="{bw:.1f}" fill="{c["bar"]}"/>'
    out += f'<rect x="{gx0 - 5:.1f}" y="{cy_ + 0.5 * (y_bot - cy_) - bw / 2:.1f}" width="{gW + 10:.1f}" height="{bw:.1f}" fill="{c["bar"]}"/>'
    for a in (-135, -45):
        ex, ey = cx_ + 2 * r * math.cos(math.radians(a)), cy_ + 2 * r * math.sin(math.radians(a))
        out += _bar(cx_, cy_, ex, ey, bw * 0.85, c['bar'])
    out += _circle(cx_, cy_, r * 0.26, c['bar'])
    # a small elephant on the inner sill, a silhouette against the lamp (find Pip)
    if figurine:
        k = 0.15 * scale
        out += elephant(c['bar'], scale=k, dx=gx0 + gW * 0.60 - 540 * k, dy=y_bot - 772 * k - 2, tail=True)
    out += '</g>'
    sw = W + 100
    out += f'<rect x="{500 - sw / 2:.1f}" y="{y_bot:.1f}" width="{sw:.1f}" height="{24 * scale:.1f}" fill="url(#{g4})"/>'
    out += f'<rect x="{500 - sw / 2:.1f}" y="{y_bot + 24 * scale:.1f}" width="{sw:.1f}" height="{38 * scale:.1f}" fill="{c["sill_front"]}"/>'
    return out


def _bar(x1, y1, x2, y2, w, fill):
    dx, dy = x2 - x1, y2 - y1
    L = math.hypot(dx, dy)
    nx, ny = -dy / L * w / 2, dx / L * w / 2
    pts = [(x1 + nx, y1 + ny), (x2 + nx, y2 + ny), (x2 - nx, y2 - ny), (x1 - nx, y1 - ny)]
    return f'<path d="{poly_d(np.array(pts), close=True)}" fill="{fill}"/>'


def _circle(cx, cy, r, fill):
    return f'<circle cx="{cx:.1f}" cy="{cy:.1f}" r="{r:.1f}" fill="{fill}"/>'


# ================================================================ 2. THE FAR VIEW
FAR = dict(sky=('#BDB9EA', '#E6CEDC', '#FBE2C8'), sun='#FFF0D8', far='#C9C1E3', far2='#B7AEDA', water=('#B2B1E5', '#9493D6'),
           glint='#FDEBD0', mid='#8A80BF', mid2='#7468AE', lit='#FFD9A0', near='#2C2242', near_top='#4A3C68',
           tree='#251C38', cloud='#F6EDF1')


def far_view(c=FAR, cloud_pip=True, seed=7):
    rnd = random.Random(seed)
    g1, g2 = _uid('fs'), _uid('fw')
    hz = 600  # the far horizon
    defs = (lin(g1, 0, 0, 0, hz, [(0, c['sky'][0]), (0.55, c['sky'][1]), (1, c['sky'][2])])
            + lin(g2, 0, hz, 0, 800, [(0, c['water'][0]), (1, c['water'][1])]))
    out = f'<defs>{defs}</defs><rect width="1000" height="{hz + 2}" fill="url(#{g1})"/>'
    # a cloud that is, on a second look, Pip (ear, head, trunk)
    if cloud_pip:
        out += _cloud_pip(300, 290, c['cloud'])
    # the sun, one step off its sky, sitting on the far city
    out += _circle(612, hz - 22, 112, c['sun'])
    # the far city: a pale band of roofs, towers and one dome
    x = -10
    while x < 1010:
        w = rnd.randint(22, 52)
        h = rnd.choice([18, 26, 34, 42, 52, 64, 30, 22])
        if 470 < x < 540:
            h = 128  # a far tower
            w = 26
        out += f'<rect x="{x}" y="{hz - h}" width="{w + 1}" height="{h + 2}" fill="{c["far"] if rnd.random() < 0.6 else c["far2"]}"/>'
        if rnd.random() < 0.25:
            out += f'<path d="M{x} {hz - h} L{x + w / 2:.1f} {hz - h - w * 0.45:.1f} L{x + w} {hz - h} Z" fill="{c["far2"]}"/>'
        x += w
    out += f'<path d="M712 {hz - 70} A44 44 0 0 1 800 {hz - 70} Z" fill="{c["far2"]}"/><rect x="712" y="{hz - 70}" width="88" height="70" fill="{c["far2"]}"/>'
    # the water, mirroring the sky's warmth, with the sun's glints
    out += f'<rect y="{hz}" width="1000" height="200" fill="url(#{g2})"/>'
    for i, (wd, dy) in enumerate(((150, 14), (118, 36), (88, 58), (62, 80), (40, 102), (24, 124))):
        out += f'<rect x="{612 - wd / 2:.1f}" y="{hz + dy}" width="{wd}" height="9" rx="4.5" fill="{c["glint"]}"/>'
    # the mid city on the left bank: deeper, with lit windows (the darks in small pieces)
    x = -10
    bank = 668
    while x < 330:
        w = rnd.randint(46, 78)
        h = rnd.randint(110, 230) if x < 250 else rnd.randint(70, 120)
        col = c['mid'] if rnd.random() < 0.5 else c['mid2']
        out += f'<rect x="{x}" y="{bank - h}" width="{w + 1}" height="{h}" fill="{col}"/>'
        if rnd.random() < 0.5:
            out += f'<path d="M{x - 2} {bank - h} L{x + w / 2:.1f} {bank - h - 30} L{x + w + 2} {bank - h} Z" fill="{c["mid2"]}"/>'
        for wy in range(bank - h + 18, bank - 20, 30):
            for wx in range(x + 10, x + w - 14, 20):
                if rnd.random() < 0.38:
                    out += f'<rect x="{wx}" y="{wy}" width="9" height="13" fill="{c["lit"]}"/>'
        x += w
    out += f'<rect x="-10" y="{bank}" width="350" height="16" fill="{c["mid2"]}"/>'
    # the near quay and a tree at the edge: a small frame, never a big chunky mass
    out += f'<rect y="806" width="1000" height="194" fill="{c["near"]}"/><rect y="800" width="1000" height="10" fill="{c["near_top"]}"/>'
    for (tx, ty, tr) in ((935, 610, 120), (1010, 540, 120), (880, 700, 86), (990, 700, 110)):
        out += _circle(tx, ty, tr, c['tree'])
    out += f'<rect x="925" y="700" width="22" height="110" fill="{c["tree"]}"/>'
    return out


def _cloud_pip(x, y, col):
    """A soft cloud built from round puffs; its outline is an elephant (ear, dome, trunk) for whoever looks twice."""
    puffs = [(x - 70, y + 8, 58), (x - 26, y - 22, 62), (x + 30, y - 18, 56), (x + 70, y + 8, 44), (x + 6, y + 26, 54),
             (x - 52, y + 40, 40), (x + 52, y + 36, 36)]
    out = ''.join(_circle(px, py, pr, col) for px, py, pr in puffs)
    # the trunk: a tapering puff line curling down at the front
    trunk = bez((x + 98, y + 20), (x + 126, y + 50), (x + 128, y + 96), (x + 108, y + 118), 30)
    out += f'<path d="{stroke_outline(trunk, 30)}" fill="{col}"/>'
    out += _circle(x + 116, y + 26, 30, col)
    return out


# ================================================================ 3. THE ELEPHANT AND THE SUN
ELE = dict(bg=('#4D3354', '#2B1E3A', '#170F22'), sun=('#FFE9BE', '#F9B978', '#EC8A55'), ground='#1A1228',
           body='#1A1228', rim='#F5A766')


ELEPHANT = [  # the near body, clockwise from the rump: a calm adult elephant walking right; legs about half its height
    (250, 472), (262, 420), (304, 376), (370, 348), (440, 336), (510, 338), (566, 352), (604, 366), (630, 352),
    (664, 330), (704, 322), (742, 334), (766, 362), (778, 404), (786, 452),
    # the trunk's front edge, down to the ground, the tip curling forward
    (794, 520), (800, 600), (800, 670), (804, 718), (816, 744), (834, 752), (848, 742), (842, 728), (828, 730),
    # its back edge, up to the mouth; the chin and the chest
    (816, 718), (790, 690), (770, 630), (752, 566), (738, 530), (722, 516), (706, 528), (694, 556), (690, 596),
    # the near front leg, the belly, the near back leg, the rump
    (694, 640), (700, 710), (706, 760), (710, 772), (642, 772), (642, 760), (638, 700), (636, 640), (626, 606),
    (590, 610), (530, 616), (470, 612), (436, 602),
    (432, 640), (430, 710), (432, 760), (436, 772), (360, 772), (360, 760), (352, 700), (340, 636), (320, 584),
    (292, 542), (268, 506),
]

FAR_LEGS = [  # the far legs, splayed in the walk so the sun shows between them
    [(592, 606), (634, 608), (626, 700), (618, 760), (618, 772), (560, 772), (564, 752), (576, 700)],
    [(440, 600), (486, 604), (500, 700), (510, 760), (514, 772), (456, 772), (452, 752), (444, 700)],
]

EAR = [(640, 366), (684, 380), (708, 420), (710, 476), (698, 526), (676, 560), (654, 552), (640, 506), (632, 444)]


def elephant_path(scale=1.0, dx=0, dy=0, pts=None):
    p = catmull(pts or ELEPHANT, closed=True, n=10)
    p = p * scale + np.array([dx, dy])
    return poly_d(p, close=True)


def elephant(fill, scale=1.0, dx=0, dy=0, tail=True, legs=True):
    """The elephant silhouette (near body, far legs, tail) at scale around the origin, shifted by (dx, dy)."""
    out = ''
    if legs:
        for L in FAR_LEGS:
            p = np.array(L, float) * scale + np.array([dx, dy])
            out += f'<path d="{poly_d(p, close=True)}" fill="{fill}"/>'
    out += f'<path d="{elephant_path(scale, dx, dy)}" fill="{fill}"/>'
    if tail:
        t = bez((256, 452), (244, 494), (240, 540), (245, 584), 20) * scale + np.array([dx, dy])
        out += f'<path d="{stroke_outline(t, 11 * scale)}" fill="{fill}"/>'
        out += f'<ellipse cx="{246 * scale + dx:.1f}" cy="{592 * scale + dy:.1f}" rx="{8 * scale:.1f}" ry="{15 * scale:.1f}" fill="{fill}"/>'
    return out


def elephant_sun(c=ELE, rim=True):
    g1, g2 = _uid('eb'), _uid('es')
    sun = (500, 540, 318)
    defs = (rad(g1, 500, 560, 720, [(0, c['bg'][0]), (0.5, c['bg'][1]), (1, c['bg'][2])])
            + rad(g2, 500, 520, 330, [(0, c['sun'][0]), (0.55, c['sun'][1]), (1, c['sun'][2])], fx=470, fy=470))
    out = f'<defs>{defs}</defs><rect width="1000" height="1000" fill="url(#{g1})"/>'
    out += _circle(*sun, f'url(#{g2})')
    out += f'<rect y="770" width="1000" height="230" fill="{c["ground"]}"/>'
    if rim:  # the sun behind catches the top edge, only where the sun is
        cid = _uid('er')
        out += (f'<defs><clipPath id="{cid}"><circle cx="{sun[0]}" cy="{sun[1]}" r="{sun[2] - 2}"/></clipPath></defs>'
                f'<g clip-path="url(#{cid})">{elephant(c["rim"], dx=-1.5, dy=-4.5, legs=False)}</g>')
    out += elephant(c['body'])
    out += f'<path d="{elephant_path(pts=EAR)}" fill="{c.get("ear", "#21162F")}"/>'
    return out


# ================================================================ 4. THE SEAL
SEAL = dict(paper='#F3E5D6', wax=('#D9693B', '#C1532A', '#A2411F'), field='#A9441F', field_rim_lit='#D7774C',
            field_rim_dark='#7E2F14', relief='#D4693D', relief_lit='#F09668', relief_dark='#7A2C12')


def seal(c=SEAL, seed=5):
    """A terracotta wax seal with the elephant pressed in relief: made by hand, signed and trusted."""
    rnd = random.Random(seed)
    g1, g2 = _uid('sw'), _uid('sf')
    # the wax spill: a circle with a slow, irregular edge
    a = np.linspace(0, 2 * math.pi, 240, endpoint=False)
    rr = 452 + sum(rnd.uniform(4, 11) * np.sin(k * a + rnd.uniform(0, 6.28)) for k in (3, 5, 7, 11))
    blob = np.stack([500 + rr * np.cos(a), 500 + rr * np.sin(a)], 1)
    defs = (rad(g1, 470, 450, 520, [(0, c['wax'][0]), (0.7, c['wax'][1]), (1, c['wax'][2])], fx=420, fy=400)
            + rad(g2, 500, 500, 360, [(0, '#B44B23'), (1, c['field'])]))
    out = f'<defs>{defs}</defs><rect width="1000" height="1000" fill="{c["paper"]}"/>'
    out += f'<path d="{poly_d(blob, close=True)}" fill="url(#{g1})"/>'
    # the pressed field, its inner wall dark at the top left and caught by the light at the bottom right
    R = 352
    out += _circle(500 + 5, 500 + 6, R, c['field_rim_lit'])
    out += _circle(500 - 4, 500 - 5, R, c['field_rim_dark'])
    out += _circle(500, 500, R - 3, f'url(#{g2})')
    # a raised ring inside the stamp
    for (dx, dy, col) in ((-3, -3, c['relief_lit']), (3, 4, c['relief_dark']), (0, 0, c['relief'])):
        out += f'<path d="{_ring(500 + dx, 500 + dy, 318, 300)}" fill="{col}"/>'
    # the elephant in relief: lit edge up-left, shadow down-right
    k, ox, oy = 0.62, 500 - 545 * 0.62, 500 - 556 * 0.62 + 6
    out += elephant(c['relief_lit'], scale=k, dx=ox - 3, dy=oy - 3)
    out += elephant(c['relief_dark'], scale=k, dx=ox + 4, dy=oy + 5)
    out += elephant(c['relief'], scale=k, dx=ox, dy=oy)
    # the ground line it walks on, raised too
    for (dx, dy, col) in ((-2, -2, c['relief_lit']), (3, 3, c['relief_dark']), (0, 0, c['relief'])):
        out += f'<rect x="{500 - 210 + dx}" y="{oy + 772 * k + 2 + dy:.1f}" width="420" height="14" rx="7" fill="{col}"/>'
    return out


def _ring(cx, cy, ro, ri):
    return (f'M{cx - ro:.1f} {cy:.1f} a{ro} {ro} 0 1 0 {2 * ro} 0 a{ro} {ro} 0 1 0 {-2 * ro} 0 Z '
            f'M{cx - ri:.1f} {cy:.1f} a{ri} {ri} 0 1 1 {2 * ri} 0 a{ri} {ri} 0 1 1 {-2 * ri} 0 Z')


# ---------------------------------------------------------------- one colour (watermarks, end cards)
def _mask_rect(mid, body_white_black, color):
    return (f'<defs><mask id="{mid}" maskUnits="userSpaceOnUse" x="0" y="0" width="1000" height="1000">'
            f'<rect width="1000" height="1000" fill="black"/>{body_white_black}</mask></defs>'
            f'<rect width="1000" height="1000" fill="{color}" mask="url(#{mid})"/>')


def elephant_sun_mono(color):
    """The sun cut by the horizon, the elephant cut out of it."""
    cid = _uid('emc')
    body = (f'<defs><clipPath id="{cid}"><rect width="1000" height="770"/></clipPath></defs>'
            f'<g clip-path="url(#{cid})"><circle cx="500" cy="540" r="318" fill="white"/></g>'
            f'{elephant("black")}<rect x="150" y="770" width="700" height="14" fill="white"/>')
    return _mask_rect(_uid('em'), body, color)


def window_mono(color, scale=1.18):
    W = 330 * scale
    x0 = 500 - W / 2
    y_top, y_bot = 500 - 300 * scale, 500 + 238 * scale
    r = W / 2
    cx_, cy_ = 500, y_top + r
    bw = 18 * scale
    bars = (f'<rect x="{cx_ - bw / 2:.1f}" y="{y_top:.1f}" width="{bw:.1f}" height="{y_bot - y_top:.1f}" fill="black"/>'
            f'<rect x="{x0:.1f}" y="{cy_ - bw / 2:.1f}" width="{W:.1f}" height="{bw:.1f}" fill="black"/>'
            f'<rect x="{x0:.1f}" y="{cy_ + 0.5 * (y_bot - cy_) - bw / 2:.1f}" width="{W:.1f}" height="{bw:.1f}" fill="black"/>')
    for a in (-135, -45):
        ex, ey = cx_ + 2 * r * math.cos(math.radians(a)), cy_ + 2 * r * math.sin(math.radians(a))
        bars += _bar(cx_, cy_, ex, ey, bw * 0.85, 'black')
    bars += _circle(cx_, cy_, r * 0.24, 'black')
    sw = W + 100
    body = (f'<path d="{arch_d(x0, y_top, W, y_bot)}" fill="white"/>{bars}'
            f'<rect x="{500 - sw / 2:.1f}" y="{y_bot + 14:.1f}" width="{sw:.1f}" height="{40 * scale:.1f}" fill="white"/>')
    return _mask_rect(_uid('wmm'), body, color)


def seal_mono(color, seed=5):
    rnd = random.Random(seed)
    a = np.linspace(0, 2 * math.pi, 240, endpoint=False)
    rr = 452 + sum(rnd.uniform(4, 11) * np.sin(k * a + rnd.uniform(0, 6.28)) for k in (3, 5, 7, 11))
    blob = np.stack([500 + rr * np.cos(a), 500 + rr * np.sin(a)], 1)
    k, ox, oy = 0.62, 500 - 545 * 0.62, 500 - 556 * 0.62 + 6
    body = (f'<path d="{poly_d(blob, close=True)}" fill="white"/>'
            f'<path d="{_ring(500, 500, 362, 340)}" fill="black"/>'
            f'<path d="{_ring(500, 500, 318, 300)}" fill="black"/>'
            f'{elephant("black", scale=k, dx=ox, dy=oy)}'
            f'<rect x="290" y="{oy + 772 * k + 2:.1f}" width="420" height="14" rx="7" fill="black"/>')
    return _mask_rect(_uid('smm'), body, color)
