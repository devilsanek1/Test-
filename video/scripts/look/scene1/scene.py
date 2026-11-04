"""Scene 1 ("She quit Google."), rebuilt the city-poster way: ONE still, 1080 x 1920, in stages.

python3 scene.py OUT_DIR [stage ...]    stages: 1 values, 2 colour, 3 detail, 4 final (default: all)
  -> stage_1_values.png, stage_2_colour.png, stage_3_detail.png, still_v1.png   (SVGs in /tmp/scene1-iter)

Construction (thumb A, grafts from C): a raised designed view from the north bank of Regent's Canal. A dark near
frame (autumn plane trees at left, a Coal Drops Yard brick shed at right, the towpath and a moored narrowboat), the
canal as the one flat gap, the Google landscraper as the hero (a gentle two-point elevation drawn bigger than the
camera allows: a lit front, a shade end, its fin rhythm the strongest contrast in the frame, a roof garden against
the sky), the gasholder frames as the secondary icon at left, and the far city lifted onto a second horizon: the
St Pancras clock tower (the pale far anchor) and a ghost skyline with the Shard. Key light: a low October sun from
the right. No outlines: every edge is a step of light, shade or value.
"""
import math
import os
import random
import sys

import numpy as np
from PIL import Image

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from svgkit import SVG, render  # noqa: E402

SCRATCH = '/tmp/scene1-iter'
W, H = 1080, 1920
EYE = 1150            # eye level of the hero's camera (y)
VPR = (4000, EYE)     # the hero's front face recedes gently to the right
VPL = (-1500, EYE)    # its end face recedes steeply to the left

# ---- colour (stage >= 2); stage 1 draws each role as the grey of its L* -------------------------------------------
C = dict(
    sky0='#C8DDE3', sky1='#D3E3E3', sky2='#DAE7E2', sky3='#EAE7D9', sky4='#F6E1C9', sky5='#F8DCC2',
    ink='#2C2232',
    ghost='#ECD7CA', ghost2='#E6D8D2', ghost_shade='#E2CEC8',
    anchor='#DFC0B5', anchor_lit='#EACDBD', anchor_shade='#CDB2B2', anchor_dark='#C9A9A8',
    iron='#3A5256', iron_lit='#56706F', drum_lit='#EBCDA4', drum_mid='#D7B79A', drum_shade='#B49E9F',
    drum_win='#8E7F8E',
    fin='#F3E0BC', fin_side='#B99A8F', glass='#2F4C5C', glass2='#3E5E6E', skyrefl='#9DBCC3', glow='#F4BE6E', glow2='#F7D49A',
    slab='#EAD3AE', parapet='#E4CBA6', end='#A08FA2', end_dark='#857590', end_fin='#B3A2B0',
    hero_front='#C9B49A',  # the front's mean (stage 1)
    lobby='#F6C77E',
    tree_d='#3D624F', tree_l='#6F9561', tree_a='#C2703F', tree_al='#DC9552',
    quay='#E8C9A4', quay_edge='#B98F78', quay_dark='#8E6E6A',
    water='#A7CBCA', water2='#93BDBE', water3='#BBD6D2', refl='#6F97A0', refl2='#86A9AE', refl_glow='#E9CFA0',
    hull='#24423B', cabin='#2E6A55', cabin_lit='#3F8068', trim='#B6462F', panel='#EFD8AE', yellow='#E1B04A',
    roof_b='#5B4848', pot='#C0663E', pot_d='#8F4A35', leaf='#5E8A50',
    path1='#A97A63', path2='#946A5B', path3='#B98B6D', path4='#80605A', path5='#C39A79',
    coping='#4A3A42', wall='#6E5052', wall_d='#56404A',
    brick='#B65A3C', brick_d='#86423A', brick_l='#C9704B', slate='#6C6E88', slate_d='#464962', slate_l='#8487A0',
    win='#2B2838', win_glow='#E9A75A',
    ntree_d='#2D493E', ntree_m='#466849', ntree_l='#6E8F55', ntree_a='#B55F2F', ntree_al='#D5873F', trunk='#4A3434',
    lamp='#2B2A36', lamp_glow='#F6D290',
    grass='#5E8A4C', grass_l='#7FA35E', stone='#C9A27F', stone_l='#DDBB94',
    her='#13898A', her_l='#2BA8A0', her_d='#0C6266', hair='#2A1E26', legs='#2E2B3C', box='#C9945A', box_d='#A67445',
    person1='#8C6E8A', person2='#B7795E', person3='#6A7A92', person_d='#4A4256',
    pip='#9EA4E8', pip_d='#7C82CF', pip_e='#C9B8EA', pip_eye='#2C2232',
)


def srgb_to_lstar(hexc):
    r, g, b = [int(hexc[i:i + 2], 16) / 255 for i in (1, 3, 5)]

    def lin(c):
        return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4
    y = 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)
    return 116 * (y ** (1 / 3) if y > 0.008856 else 7.787 * y + 16 / 116) - 16


def lstar_to_grey(L):
    y = ((L + 16) / 116) ** 3 if L > 8 else L / 903.3
    c = 12.92 * y if y <= 0.0031308 else 1.055 * y ** (1 / 2.4) - 0.055
    v = max(0, min(255, round(c * 255)))
    return '#%02x%02x%02x' % (v, v, v)


class Pal:
    def __init__(self, grey):
        self.grey = grey

    def __getitem__(self, k):
        c = C[k]
        return lstar_to_grey(srgb_to_lstar(c)) if self.grey else c


# ---- helpers ------------------------------------------------------------------------------------------------------
def toward(p, vp, t):
    return (p[0] + (vp[0] - p[0]) * t, p[1] + (vp[1] - p[1]) * t)


def y_on(x, x0, y0, vp):
    """y at x of the line from (x0, y0) toward vp."""
    return y0 + (vp[1] - y0) * (x - x0) / (vp[0] - x0)


def crown(s, cx, cy, rx, ry, dark, lit, core=None, seed=0, n=8):
    """a low-poly tree crown: an irregular polygon, a lit facet toward the key (right), a shade core at lower left."""
    rnd = random.Random(seed)
    P = []
    for i in range(n):
        a = -math.pi / 2 + 2 * math.pi * i / n + rnd.uniform(-0.18, 0.18)
        k = rnd.uniform(0.84, 1.08)
        P.append((cx + rx * k * math.cos(a), cy + ry * k * math.sin(a)))
    s.poly(P, dark)
    # lit facet: the right/top part, cut by a slanted chord
    L = [p for p in P if (p[0] - cx) * 0.8 - (p[1] - cy) * 0.6 > -rx * 0.15]
    if len(L) >= 2:
        L = L + [(cx + rx * 0.05, cy + ry * 0.30), (cx - rx * 0.30, cy - ry * 0.10)]
        L = sorted(L, key=lambda p: math.atan2(p[1] - cy, p[0] - cx))
        s.poly(L, lit)
    if core:
        s.poly([(cx - rx * 0.75, cy + ry * 0.15), (cx - rx * 0.05, cy + ry * 0.35), (cx - rx * 0.2, cy + ry * 0.9),
                (cx - rx * 0.6, cy + ry * 0.62)], core)


def walker(s, x, y, h, coat, coat_l, coat_d, hair, legs, step=1, box=None):
    """a small person from behind / rear 3/4, walking right: no face, a lit right side, a shade left side."""
    w = h * 0.30
    hy = y - h * 0.86
    # legs (one forward)
    s.poly([(x - w * 0.30, y - h * 0.34), (x - w * 0.02, y - h * 0.34), (x - w * 0.22 - step * w * 0.25, y),
            (x - w * 0.46 - step * w * 0.25, y)], legs)
    s.poly([(x + w * 0.02, y - h * 0.34), (x + w * 0.32, y - h * 0.34), (x + w * 0.40 + step * w * 0.3, y - h * 0.01),
            (x + w * 0.16 + step * w * 0.3, y)], legs)
    # coat: a trapezoid, its shade side at left
    coat_p = [(x - w * 0.46, y - h * 0.76), (x + w * 0.46, y - h * 0.76), (x + w * 0.62, y - h * 0.30),
              (x - w * 0.64, y - h * 0.30)]
    s.poly(coat_p, coat)
    s.poly([(x + w * 0.10, y - h * 0.76), (x + w * 0.46, y - h * 0.76), (x + w * 0.62, y - h * 0.30),
            (x + w * 0.22, y - h * 0.30)], coat_l)
    s.poly([(x - w * 0.46, y - h * 0.76), (x - w * 0.26, y - h * 0.76), (x - w * 0.40, y - h * 0.30),
            (x - w * 0.64, y - h * 0.30)], coat_d)
    if box:
        s.poly([(x + w * 0.38, y - h * 0.62), (x + w * 0.98, y - h * 0.66), (x + w * 1.0, y - h * 0.44),
                (x + w * 0.42, y - h * 0.40)], box[0])
        s.poly([(x + w * 0.38, y - h * 0.62), (x + w * 0.98, y - h * 0.66), (x + w * 0.92, y - h * 0.70),
                (x + w * 0.40, y - h * 0.67)], box[1])
    # head from behind: hair covers it
    s.ellipse(x + w * 0.02, hy, h * 0.105, h * 0.12, hair)
    s.poly([(x - w * 0.22, hy + h * 0.02), (x + w * 0.24, hy + h * 0.02), (x + w * 0.20, hy + h * 0.13),
            (x - w * 0.20, hy + h * 0.13)], hair)


# ---- the scene ----------------------------------------------------------------------------------------------------
def build(stage):
    grey = stage == 1
    P = Pal(grey)
    s = SVG(W, H)
    D = stage >= 3  # detail

    # SKY: one gentle gradient, nearly flat in the caption band (stage 1: one flat value)
    if grey:
        s.rect(0, 0, W, H, P['sky2'])
    else:
        g = s.lingrad([(0, C['sky0']), (0.15, C['sky1']), (0.31, C['sky2']), (0.43, C['sky3']), (0.53, C['sky4']),
                       (0.62, C['sky5']), (1, C['sky5'])], 0, 0, 0, H, units='userSpaceOnUse')
        s.rect(0, 0, W, H, g)

    # FAR STAGE (second horizon ~y 1010): ghost skyline + the Shard ghost + the St Pancras tower (pale far anchor)
    rnd = random.Random(7)
    x = -10
    while x < 330:  # left of the hero, behind the gasholders
        w = rnd.randint(34, 70)
        top = rnd.randint(890, 960)
        s.rect(x, top, w + 1, 1030 - top, P['ghost'])
        if D and rnd.random() < 0.5:
            s.rect(x, top, w * 0.35, 1030 - top, P['ghost_shade'])
        x += w
    # the far right, peeking over the hero's descending roofline
    for (x0, w, top) in [(820, 60, 812), (880, 46, 790), (1000, 50, 800), (1046, 40, 822)]:
        s.rect(x0, top, w, 900 - top, P['ghost'])
        if D:
            s.rect(x0, top, w * 0.35, 900 - top, P['ghost_shade'])
    s.poly([(948, 676), (918, 900), (992, 900)], P['ghost2'])  # the Shard, the WAY further out thing
    if D:
        s.poly([(948, 676), (918, 900), (940, 900)], P['ghost_shade'])
    # St Pancras: the hotel range (gables) + the clock tower and spire
    s.rect(-10, 905, 250, 125, P['anchor'])
    for gx in (-6, 50, 168):
        s.poly([(gx, 906), (gx + 26, 868), (gx + 52, 906)], P['anchor'])
    tx, tw = 104, 64
    s.rect(tx, 770, tw, 260, P['anchor'])
    s.poly([(tx - 6, 772), (tx + tw / 2, 642), (tx + tw + 6, 772)], P['anchor'])
    if not grey:
        # lit (right) and shade (left) faces
        s.rect(tx + tw * 0.55, 770, tw * 0.45, 260, P['anchor_lit'])
        s.poly([(tx + tw / 2, 642), (tx + tw + 6, 772), (tx + tw * 0.55, 772)], P['anchor_lit'])
        s.rect(tx, 770, tw * 0.18, 260, P['anchor_shade'])
        for gx in (-6, 50, 168):
            s.poly([(gx + 26, 868), (gx + 52, 906), (gx + 26, 906)], P['anchor_lit'])
    if D:
        # tone-on-tone detail only (far): the clock, lancets, pinnacles
        s.circle(tx + tw / 2, 806, 13, P['anchor_lit'])
        s.circle(tx + tw / 2, 806, 9, P['anchor_dark'])
        for k in range(3):
            s.rect(tx + 12 + k * 16, 850, 7, 40, P['anchor_dark'])
            s.rect(tx + 12 + k * 16, 920, 7, 34, P['anchor_dark'])
        for px in (tx - 8, tx + tw + 2):
            s.poly([(px, 772), (px + 3, 740), (px + 6, 772)], P['anchor'])
        for k in range(10):
            s.rect(-4 + k * 24, 930, 8, 22, P['anchor_dark'])
            s.rect(-4 + k * 24, 972, 8, 22, P['anchor_dark'])

    # GASHOLDERS (secondary icon, mid, left): two linked frames, a drum inside each
    def gasholder(cx, r, top, base, front=True):
        n = 16
        # back columns (behind the drum: visible above it)
        for i in range(n):
            a = 2 * math.pi * i / n
            if math.cos(a) < 0:
                xx = cx + r * math.sin(a)
                s.rect(xx - 3, top, 6, base - top, P['iron'])
        # the drum (apartments): a low-poly cylinder, lit at right
        dr = r * 0.86
        dtop = top + (base - top) * 0.22
        bands = [(-1.0, -0.55, 'drum_shade'), (-0.55, -0.05, 'drum_mid'), (-0.05, 1.0, 'drum_lit')]
        for a0, a1, col in bands:
            s.rect(cx + dr * a0, dtop, dr * (a1 - a0) + 0.6, base - dtop, P[col])
        if D:
            for yy in np.arange(dtop + 16, base - 10, 26):
                for a0, a1, col in [(-0.95, -0.6, 'drum_win'), (-0.5, -0.1, 'drum_win'), (0.0, 0.9, 'drum_win')]:
                    for k in range(5):
                        xa = cx + dr * (a0 + (a1 - a0) * (k + 0.2) / 5)
                        s.rect(xa, yy, dr * (a1 - a0) / 5 * 0.55, 9, P[col])
        # front columns + ring girders
        for i in range(n):
            a = 2 * math.pi * i / n
            if math.cos(a) >= 0:
                xx = cx + r * math.sin(a)
                wcol = 5 if D else 8
                s.rect(xx - wcol / 2, top, wcol, base - top, P['iron'])
                if D:
                    s.rect(xx + 0.5, top, 1.8, base - top, P['iron_lit'])
                    s.rect(xx - 6, top - 9, 12, 9, P['iron'])
        tiers = [top, top + (base - top) * 0.36, top + (base - top) * 0.70]
        for ty in tiers:
            s.rect(cx - r - 4, ty, 2 * r + 8, 10 if D else 13, P['iron'])
            if D:
                # lattice: small triangles in the girder band
                for k in range(int(2 * r / 14)):
                    xx = cx - r + k * 14
                    s.poly([(xx, ty + 2), (xx + 7, ty + 8), (xx + 14, ty + 2)], P['iron_lit'])

    gasholder(262, 118, 1032, 1352)
    gasholder(54, 160, 985, 1360)

    # HERO: the landscraper, a gentle two-point elevation drawn bigger than the camera allows
    cx0, ytop0, ybase0 = 300, 790, 1340   # front-left corner (x, roof y, base y)
    xend = 232                            # the end face's back edge
    xr = W + 10
    kU = (VPR[0] - cx0) / (VPR[0] - xr) - 1

    def fx(u):  # u in [0,1] along the front -> x (perspective)
        return VPR[0] - (VPR[0] - cx0) / (1 + kU * u)

    def ft(x):
        return y_on(x, cx0, ytop0, VPR)

    def fb(x):
        return y_on(x, cx0, ybase0, VPR)

    storeys = 10
    gf = 78  # ground floor height at the corner
    roof_par = 20
    sh = (ybase0 - gf - ytop0 - roof_par) / storeys   # one storey at the corner
    # the stepped roofline (terraces): full height, one storey down, two storeys down
    xs1, xs2 = fx(0.50), fx(0.80)

    def sc(x):
        return (VPR[0] - x) / (VPR[0] - cx0)

    def rt(x):  # roof (top of parapet) at x
        d = 0 if x < xs1 else (1 if x < xs2 else 2)
        return ft(x) + d * sh * sc(x)
    front = [(cx0, ytop0), (xs1, rt(xs1 - 0.01)), (xs1, rt(xs1)), (xs2, rt(xs2 - 0.01)), (xs2, rt(xs2)), (xr, rt(xr)),
             (xr, fb(xr)), (cx0, ybase0)]
    ytop_e = y_on(xend, cx0, ytop0, VPL)
    ybase_e = y_on(xend, cx0, ybase0, VPL)
    endf = [(xend, ytop_e), (cx0, ytop0), (cx0, ybase0), (xend, ybase_e)]
    if stage == 1:
        s.poly(front, P['hero_front'])
        s.poly(endf, P['end'])
    else:
        s.poly(front, P['glass'])
        s.poly(endf, P['end'])
    clip = s.clip('<polygon points="%s"/>' % ' '.join('%.1f,%.1f' % q for q in front))

    if stage >= 2:
        s.group(clip_path=clip)
        z_floor = [(ytop0 + roof_par) + sh * i for i in range(storeys + 1)]
        nb = 48
        if D:
            rnd = random.Random(3)
            for i in range(storeys):
                for b in range(nb):
                    r_ = rnd.random()
                    if r_ < 0.30:
                        u0, u1 = b / nb, (b + 1) / nb
                        xa, xb = fx(u0), fx(u1)
                        ya0 = y_on(xa, cx0, z_floor[i], VPR)
                        ya1 = y_on(xa, cx0, z_floor[i + 1], VPR)
                        yb0 = y_on(xb, cx0, z_floor[i], VPR)
                        yb1 = y_on(xb, cx0, z_floor[i + 1], VPR)
                        col = P['glow'] if r_ < 0.11 else (P['glass2'] if r_ < 0.22 else P['skyrefl'])
                        s.poly([(xa, ya0), (xb, yb0), (xb, yb1), (xa, ya1)], col)
        # the fins: the signature rhythm (slender fins, a wider pier every 4th), lit fronts + shade sides
        nfin = nb if D else 24
        for j in range(nfin + 1):
            u = j / nfin
            x = fx(u)
            k = sc(x)
            pier = D and (j % 4 == 0)
            wf = ((13 if pier else 7) if D else 11) * k
            side = (4.5 if pier else 3) * k
            yt, yb = ft(x), fb(x) - gf * k
            s.poly([(x - side, yt), (x, yt), (x, yb), (x - side, yb)], P['fin_side'])
            s.poly([(x, yt), (x + wf, ft(x + wf)), (x + wf, fb(x + wf) - gf * k), (x, yb)], P['fin'])
        for i, z in enumerate(z_floor):
            th = 6 if i not in (0, storeys) else 9
            s.poly([(cx0, z), (xr, y_on(xr, cx0, z, VPR)), (xr, y_on(xr, cx0, z, VPR) + th), (cx0, z + th)], P['slab'])
        s.end()
        # parapets on each terrace (lit)
        for (xa, xb) in [(cx0, xs1), (xs1, xs2), (xs2, xr)]:
            s.poly([(xa, rt(xa + 0.02)), (xb, rt(xb - 0.02)), (xb, rt(xb - 0.02) + roof_par * sc(xb)),
                    (xa, rt(xa + 0.02) + roof_par * sc(xa))], P['parapet'])
            # the terrace's top edge catches the low sun
            s.poly([(xa, rt(xa + 0.02)), (xb, rt(xb - 0.02)), (xb, rt(xb - 0.02) + 4), (xa, rt(xa + 0.02) + 4)], P['fin'])
        # ground floor: tall shopfronts, warm; the lit lobby (her door) brightest
        gtop0 = ybase0 - gf
        s.poly([(cx0, gtop0), (xr, y_on(xr, cx0, gtop0, VPR)), (xr, fb(xr)), (cx0, ybase0)], P['glass'])
        nb_g = 24
        for b in range(nb_g):
            u0, u1 = (b + 0.12) / nb_g, (b + 0.88) / nb_g
            xa, xb = fx(u0), fx(u1)
            col = P['glow2'] if b in (8, 9) else (P['glow'] if b % 3 == 0 else P['glass2'])
            if not D and b not in (8, 9):
                col = P['glass2']
            ya, yb_ = y_on(xa, cx0, gtop0 + 10, VPR), y_on(xb, cx0, gtop0 + 10, VPR)
            s.poly([(xa, ya), (xb, yb_), (xb, fb(xb) - 2), (xa, fb(xa) - 2)], col)
        for b in range(nb_g + 1):
            x = fx(b / nb_g)
            k = sc(x)
            s.poly([(x - 4 * k, y_on(x, cx0, gtop0, VPR)), (x + 5 * k, y_on(x, cx0, gtop0, VPR)),
                    (x + 5 * k, fb(x)), (x - 4 * k, fb(x))], P['fin'])
        # a canopy over the lobby (lit top)
        xa, xb = fx(7.6 / 24), fx(10.4 / 24)
        s.poly([(xa, y_on(xa, cx0, gtop0 + 4, VPR)), (xb, y_on(xb, cx0, gtop0 + 4, VPR)),
                (xb, y_on(xb, cx0, gtop0 + 14, VPR)), (xa, y_on(xa, cx0, gtop0 + 14, VPR))], P['fin'])
        # end face (shade): its own slabs + a few fins
        for i, z in enumerate(z_floor):
            ze = y_on(xend, cx0, z, VPL)
            s.poly([(xend, ze), (cx0, z), (cx0, z + 4), (xend, ze + 4)], P['end_fin'])
        for k in range(1, 4):
            x = cx0 - (cx0 - xend) * k / 4
            s.poly([(x - 2, y_on(x, cx0, ytop0, VPL) + roof_par), (x + 2, y_on(x, cx0, ytop0, VPL) + roof_par),
                    (x + 2, y_on(x, cx0, ybase0, VPL)), (x - 2, y_on(x, cx0, ybase0, VPL))], P['end_dark'])
        s.poly([(xend, ytop_e), (cx0, ytop0), (cx0, ytop0 + roof_par), (xend, ytop_e + roof_par)], P['end_fin'])

    # the roof garden: low-poly crowns along each terrace (the hero's skyline)
    rnd = random.Random(11)
    x = cx0 - 50
    i = 0
    while x < W + 40:
        yt = rt(max(x, cx0)) if x >= cx0 else y_on(x, cx0, ytop0, VPL)
        r = rnd.uniform(20, 34) if D else 30
        if D and rnd.random() < 0.18:
            r *= 1.45   # a few taller trees break the line
        autumn = D and rnd.random() < 0.3
        dk, lt = ('tree_a', 'tree_al') if autumn else ('tree_d', 'tree_l')
        if stage == 1:
            crown(s, x, yt - r * 0.55, r * 1.2, r, P['tree_d'], P['tree_d'], seed=i)
        else:
            crown(s, x, yt - r * 0.55, r * 1.2, r, P[dk], P[lt], seed=i)
        x += r * (1.35 if D else 1.9)
        i += 1
    ybase_r = fb(xr)

    # FAR QUAY at the hero's foot (lit paving) + its edge
    qy0, qy1 = ybase0, 1384
    s.poly([(xend - 60, ybase0 + 2), (W + 10, ybase_r), (W + 10, qy1 - 6), (xend - 60, qy1)], P['quay'])
    if stage >= 2:
        s.rect(0, qy1 - 8, W, 10, P['quay_edge'])
        s.rect(0, qy1 + 2, W, 6, P['quay_dark'])

    # trees on the far quay: they hide the hero's base at both sides, the door and her left open
    for (tx_, r_, a_) in [(338, 40, 0), (400, 32, 1), (930, 38, 1), (994, 32, 0), (1058, 42, 0)]:
        ty_ = ybase0 + 14 - 70
        s.rect(tx_ - 3, ty_, 7, 84, P['trunk'])
        if stage == 1:
            crown(s, tx_, ty_ - 18, r_ * 1.1, r_ * 1.25, P['tree_d'], P['tree_d'], seed=tx_)
        else:
            dk, lt = ('tree_a', 'tree_al') if (a_ and D) else ('tree_d', 'tree_l')
            crown(s, tx_, ty_ - 18, r_ * 1.1, r_ * 1.25, P[dk], P[lt], seed=tx_)

    # THE GAP: the canal, one flat light field (+ the hero's broken reflection)
    wy0, wy1 = qy1 + 8, 1512
    s.rect(0, wy0, W, wy1 - wy0, P['water'])
    if stage >= 2:
        s.rect(0, wy0, W, 18, P['refl'])
        if D:
            # the hero's piers reflected: calm vertical strokes under each bay, warm glints under the lobby
            for j in range(0, 49, 4):
                x = fx(j / 48)
                s.rect(x, wy0 + 16, 7 * sc(x), 34 - 10 * (j / 48), P['refl2'])
            for (gx, gy, gw) in [(fx(8.2 / 24), wy0 + 24, 40), (fx(8.6 / 24) + 6, wy0 + 36, 26), (fx(8.4 / 24), wy0 + 47, 18)]:
                s.rect(gx, gy, gw, 5, P['refl_glow'])
        if D:
            for (y, x0, w, col) in [(wy0 + 60, 40, 380, 'water3'), (wy0 + 74, 600, 260, 'water2'),
                                    (wy0 + 92, 300, 420, 'water2'), (wy0 + 108, 760, 330, 'water3'),
                                    (wy0 + 40, 820, 200, 'water3')]:
                s.rect(x0, y, w, 9, P[col])

    # NEAR FRAME ---------------------------------------------------------------------------------------------------
    # the narrowboat, moored at the near wall (colour as confetti) + Pip hidden among the pots on its roof
    bx0, bx1, by = 36, 560, 1505
    if stage == 1:
        s.poly([(bx0, by - 40), (bx1, by - 40), (bx1, by), (bx0 + 30, by)], P['hull'])
        s.rect(bx0 + 60, by - 80, bx1 - bx0 - 130, 40, P['cabin'])
    else:
        s.poly([(bx0, by - 44), (bx1, by - 44), (bx1 - 8, by), (bx0 + 40, by)], P['hull'])
        s.rect(bx0 + 4, by - 48, bx1 - bx0 - 4, 7, P['trim'])
        s.rect(bx0 + 60, by - 84, bx1 - bx0 - 130, 38, P['cabin'])
        s.rect(bx0 + 60, by - 84, bx1 - bx0 - 130, 7, P['cabin_lit'])
        s.rect(bx0 + 56, by - 90, bx1 - bx0 - 122, 7, P['roof_b'])
        if D:
            for k in range(5):
                px = bx0 + 84 + k * 66
                s.rect(px, by - 74, 42, 20, P['panel'])
                s.circle(px + 21, by - 64, 6, P['glow'] if k in (1, 3) else P['win'])
            s.rect(bx0 + 60, by - 52, bx1 - bx0 - 130, 5, P['yellow'])
            s.rect(bx1 - 62, by - 92, 9, 44, P['lamp'])  # tiller post
            s.rect(bx0 + 120, by - 112, 10, 22, P['lamp'])  # stove chimney
            # pots on the roof, Pip among them (tier B, well under 1 % of the frame)
            for (px, ph) in [(150, 22), (182, 30), (392, 30), (452, 22)]:
                s.poly([(px - 10, by - 90), (px + 10, by - 90), (px + 7, by - 90 - ph * 0.45), (px - 7, by - 90 - ph * 0.45)], P['pot'])
                crown(s, px, by - 90 - ph * 0.75, 15, ph * 0.42, P['leaf'], P['tree_l'], seed=px)
            pipx, pipy = 418, by - 91
            s.ellipse(pipx, pipy - 14, 15, 13, P['pip_d'])
            s.ellipse(pipx + 3, pipy - 16, 12, 11, P['pip'])
            s.circle(pipx + 12, pipy - 28, 9, P['pip'])                       # head
            s.ellipse(pipx + 5, pipy - 29, 6, 8, P['pip_e'])                  # ear
            s.poly([(pipx + 19, pipy - 27), (pipx + 24, pipy - 20), (pipx + 22, pipy - 12), (pipx + 18, pipy - 20)], P['pip'])
            s.circle(pipx + 15, pipy - 30, 1.7, P['pip_eye'])
            s.rect(pipx - 6, pipy - 6, 6, 7, P['pip_d'])
            s.rect(pipx + 7, pipy - 6, 6, 7, P['pip_d'])

    # near wall + a strip of towpath (small, flat patchwork)
    s.rect(0, wy1, W, 14, P['coping'])
    ty0 = wy1 + 14
    s.rect(0, ty0, W, H - ty0, P['path2'])
    if stage >= 2:
        rnd = random.Random(21)
        cols = ['path1', 'path2', 'path3', 'path4', 'path5']
        for k in range(18 if D else 8):
            x0 = rnd.uniform(-100, W)
            y0 = rnd.uniform(ty0, ty0 + 90)
            w = rnd.uniform(110, 260)
            hgt = rnd.uniform(30, 80)
            sk = rnd.uniform(-50, 50)
            s.poly([(x0, y0), (x0 + w, y0), (x0 + w + sk, y0 + hgt), (x0 + sk, y0 + hgt)], P[rnd.choice(cols)])
        s.rect(0, ty0, W, 7, P['path5'])

    # Granary Square's steps (grass terraces + stone), between the trees and the shed
    for k in range(10):
        y = 1604 + k * 34
        s.rect(220, y, 260, 34, P['grass'] if k % 2 == 0 else P['stone'])
        if stage >= 2:
            s.rect(220, y, 260, 6, P['grass_l'] if k % 2 == 0 else P['stone_l'])

    # bottom-right: a Coal Drops Yard brick shed, its roof sweeping up to "kiss" (cut by the right and bottom edges)
    sx0 = 420
    eave = lambda x: 1704 + (1598 - 1704) * (x - sx0) / (1090 - sx0)
    s.poly([(sx0, eave(sx0)), (1090, eave(1090)), (1090, H), (sx0, H)], P['brick'])
    s.poly([(sx0 - 64, eave(sx0) + 40), (sx0, eave(sx0)), (sx0, H), (sx0 - 64, H)], P['brick_d'])   # its shade end
    s.path('M%d,%d Q%d,%d 1090,1430 L1090,%d L%d,%d Z' % (sx0, 1650, 800, 1640, eave(1090), sx0, eave(sx0)), P['slate'])
    s.poly([(sx0 - 64, eave(sx0) + 40), (sx0, 1650), (sx0, eave(sx0)), (sx0 - 64, eave(sx0) + 52)], P['slate_d'])
    if stage >= 2:
        # the lit band along the rising ridge (the low sun from the right)
        s.path('M%d,%d Q%d,%d 1090,1430 L1090,1462 Q%d,%d %d,%d Z' % (sx0, 1650, 800, 1640, 800, 1664, sx0, 1668), P['slate_l'])
        s.rect(sx0 - 64, H - 70, 1100, 70, P['brick_d'])   # the dark base (shade at the bottom corner)
    if D:
        # tall arched windows in a rhythm (darks in many small pieces, one warm)
        for k in range(7):
            wx = sx0 + 34 + k * 92
            wy = eave(wx + 23) + 34
            col = P['win_glow'] if k == 3 else P['win']
            s.rect(wx, wy + 22, 46, 140, col)
            s.ellipse(wx + 23, wy + 22, 23, 22, col)
            s.rect(wx + 21, wy + 2, 4, 160, P['brick_d'])
            s.rect(wx, wy + 84, 46, 4, P['brick_d'])
            s.rect(wx - 6, wy + 162, 58, 8, P['brick_l'])
            s.rect(wx + 4, H - 60, 38, 60, P['win'])
            s.ellipse(wx + 23, H - 60, 19, 16, P['win'])
        for k in range(9):
            yy = eave(sx0) + 60 + k * 22
            s.rect(sx0 - 64, yy, 64, 4, P['brick'])
    # bottom-left: autumn plane trees (dark, cut by the left and bottom edges)
    s.rect(70, 1260, 16, 300, P['trunk'])
    crowns = [(40, 1290, 150, 120, 0), (-30, 1450, 140, 130, 1), (170, 1420, 120, 95, 0), (60, 1600, 170, 140, 1),
              (250, 1730, 120, 110, 0), (-20, 1780, 160, 150, 1), (170, 1870, 170, 120, 0)]
    for (cx, cy, rx, ry, a) in crowns:
        if stage == 1:
            crown(s, cx, cy, rx, ry, P['ntree_d'], P['ntree_d'], seed=cx + cy)
        else:
            dk, lt = ('ntree_a', 'ntree_al') if (a and D) else ('ntree_d', 'ntree_m')
            crown(s, cx, cy, rx, ry, P[dk], P[lt], core=P['ntree_d'] if D else None, seed=cx + cy)
            if D:
                crown(s, cx + rx * 0.3, cy - ry * 0.35, rx * 0.4, ry * 0.32, P['ntree_m'] if a else P['ntree_l'],
                      P['ntree_al'] if a else P['ntree_l'], seed=cx * 3 + cy)
    # a lamp at the top of the steps (a thin line object) with its warm lantern + a few fallen leaves
    if D:
        lx0 = 352
        s.rect(lx0, 1560, 8, 360, P['lamp'])
        s.rect(lx0 - 12, 1540, 32, 26, P['lamp'])
        s.rect(lx0 - 7, 1545, 22, 16, P['lamp_glow'])
        s.poly([(lx0 - 18, 1540), (lx0 + 4, 1522), (lx0 + 26, 1540)], P['lamp'])
        rnd = random.Random(9)
        for k in range(18):
            lx, ly = rnd.uniform(240, 470), rnd.uniform(1540, 1900)
            s.poly([(lx, ly), (lx + 8, ly - 3), (lx + 12, ly + 3), (lx + 3, ly + 5)], P[rnd.choice(['ntree_a', 'ntree_al', 'tree_a'])])

    # PEOPLE (small, from behind): HER leaving the lit lobby along the quay with her box; strangers tiny and soft
    lobby_x = fx(8.5 / 24)
    hx, hy = lobby_x + 60, ybase0 + 28
    if stage == 1:
        walker(s, hx, hy, 84, P['her'], P['her'], P['her'], P['her'], P['her'])
    elif stage == 2:
        walker(s, hx, hy, 84, P['her'], P['her'], P['her'], P['hair'], P['legs'])
    else:
        s.ellipse(hx + 2, hy + 1, 22, 4, P['quay_edge'])  # contact shadow (colour, never grey)
        walker(s, hx, hy, 84, P['her'], P['her_l'], P['her_d'], P['hair'], P['legs'], box=(P['box'], P['box_d']))
        for (px, py, ph, col, st) in [(842, ybase0 + 20, 46, 'person1', -1), (874, ybase0 + 21, 48, 'person3', 1),
                                      (500, ybase0 + 24, 44, 'person2', 1)]:
            walker(s, px, py, ph, P[col], P[col], P['person_d'], P['person_d'], P['person_d'], step=st)

    # CAPTION: ink on light, in the calm band
    s.text(540, 484, 'She quit Google.', 112, P['ink'])
    return s


def mottle(src, dst, seed=4):
    """a VERY subtle paper mottle (static): low-frequency value drift + a fine grain; calmer inside the caption band."""
    from scipy.ndimage import gaussian_filter
    im = np.asarray(Image.open(src).convert('RGB')).astype(np.float32) / 255
    rng = np.random.default_rng(seed)
    h, w = im.shape[:2]
    low = gaussian_filter(rng.standard_normal((h, w)), 38) * 1.0
    low /= (np.abs(low).max() + 1e-6)
    mid = gaussian_filter(rng.standard_normal((h, w)), 6)
    mid /= (np.abs(mid).max() + 1e-6)
    fine = gaussian_filter(rng.standard_normal((h, w)), 0.7)
    fine /= (np.abs(fine).std() * 4 + 1e-6)
    amt = np.ones((h, w), np.float32)
    amt[290:600, :] = 0.35   # the caption band stays a calm field
    m = (0.016 * low + 0.008 * mid + 0.010 * fine) * amt
    out = np.clip(im * (1 + m[..., None]) + (rng.random((h, w, 1)) - 0.5) / 255, 0, 1)
    Image.fromarray((out * 255 + 0.5).astype(np.uint8)).save(dst)


if __name__ == '__main__':
    out = sys.argv[1] if len(sys.argv) > 1 else '.'
    stages = [int(a) for a in sys.argv[2:]] or [1, 2, 3, 4]
    os.makedirs(SCRATCH, exist_ok=True)
    names = {1: 'stage_1_values', 2: 'stage_2_colour', 3: 'stage_3_detail'}
    pairs = []
    for st in stages:
        if st in names:
            pairs.append((build(st).save(os.path.join(SCRATCH, names[st] + '.svg')), os.path.join(out, names[st] + '.png')))
    if 4 in stages and 3 not in stages:
        pairs.append((build(3).save(os.path.join(SCRATCH, 'stage_3_detail.svg')), os.path.join(SCRATCH, 'stage_3_detail.png')))
    if pairs:
        render(pairs)
    if 4 in stages:
        src = os.path.join(out, 'stage_3_detail.png') if 3 in stages else os.path.join(SCRATCH, 'stage_3_detail.png')
        mottle(src, os.path.join(out, 'still_v1.png'))
    print('ok', stages)
