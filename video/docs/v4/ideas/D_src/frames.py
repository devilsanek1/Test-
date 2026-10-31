"""Imagination D: the twelve beats and the alternates, each one whole frame (1080 x 1920) as an SVG page.

python3 frames.py [ids...]  -> writes pages/<id>.html (all frames when no id is given)
"""
import math
import os
import random
import sys

from kit import *  # noqa

HERE = os.path.dirname(os.path.abspath(__file__))


def cap(*lines, size=108):
    out = []
    for ln in lines:
        parts = []
        for piece in ln.split('|'):
            if piece.startswith('*'):
                parts.append((piece[1:], True))
            elif piece:
                parts.append((piece, False))
        out.append(parts)
    return {'lines': out, 'size': size}


# ------------------------------------------------------------------ shared: her flat's big window and the view
def night_view(seed, x0, y0, x1, y1, horizon=1000, warm_p=0.75, wave_left=0.25, domes_at=(250, 1012), ships=True,
               near_roofs=True, plan=None, frost_clear=False, roof_y=1085, sky_top=10, glow=34):
    """The view from her window over Katajanokka's roofs to the bay and the far city. Returns (defs, body)."""
    rnd = random.Random(seed)
    defs = lin_grad('skyv%d' % seed, [(0, g(sky_top)), (0.55, g(18)), (0.86, g(26)), (1, g(glow))], x1=0, y1=y0, x2=0, y2=horizon, units=True)
    o = [rect(x0, y0, x1 - x0, horizon - y0 + 2, 'url(#skyv%d)' % seed)]
    # soft snow cloud masses tone-on-tone (below the band)
    cl = []
    for k in range(7):
        cy = rnd.uniform(690, 930)
        cx = rnd.uniform(x0 - 100, x1)
        cw = rnd.uniform(260, 520)
        cl.append(path('M %s %s C %s %s %s %s %s %s C %s %s %s %s %s %s Z' % (
            f(cx), f(cy), f(cx + cw * 0.3), f(cy - 22), f(cx + cw * 0.7), f(cy - 18), f(cx + cw), f(cy + 4),
            f(cx + cw * 0.7), f(cy + 16), f(cx + cw * 0.3), f(cy + 14), f(cx), f(cy)), g(rnd.uniform(19, 25)), opacity='0.7'))
    o.append(grp(''.join(cl), filter='url(#rough)'))
    # the far city across the bay: a belt of roofs standing in the glow
    belt = []
    x = x0 - 20
    while x < x1 + 20:
        w = rnd.uniform(26, 70)
        h = rnd.uniform(26, 72) * (1.4 if rnd.random() < 0.08 else 1)
        belt.append((x, w, h))
        x += w * rnd.uniform(0.75, 1.0)
    fc = []
    for x, w, h in belt:
        fc.append(rect(x, horizon - h, w, h + 40, g(21)))
    # a far crane and a far dome to say "a harbour city"
    fc.append(pline([(860, horizon - 70), (860, horizon - 190), (790, horizon - 175)], g(21), 4))
    fc.append(line(860, horizon - 190, 940, horizon - 170, g(21), 3))
    o.append(grp(''.join(fc), filter='url(#b1)'))
    # its windows: the wave of warmth (warm to the right, the front moving left)
    wins = []
    for x, w, h in belt:
        for _ in range(int(w * h / 260)):
            wx, wy = rnd.uniform(x + 3, x + w - 6), rnd.uniform(horizon - h + 6, horizon + 26)
            t = (wx - x0) / (x1 - x0)
            pw = warm_p * min(1, max(0, (t - wave_left) / 0.25 + 0.15))
            if rnd.random() < pw:
                wins.append(rect(wx, wy, 3.2, 4.2, HONEY if rnd.random() < 0.6 else HONEY_MID, opacity=f(rnd.uniform(0.75, 1))))
            elif rnd.random() < 0.35:
                wins.append(rect(wx, wy, 3, 4, g(40)))
    o.append(''.join(wins))
    # the bay: dark water, ice floes, warm reflections
    o.append(rect(x0, horizon + 30, x1 - x0, 90, g(12)))
    floes = []
    for _ in range(26):
        fx, fy = rnd.uniform(x0, x1), rnd.uniform(horizon + 36, horizon + 112)
        fw, fh = rnd.uniform(30, 120), rnd.uniform(4, 10)
        floes.append(ell(fx, fy, fw / 2, fh / 2, g(rnd.uniform(34, 46))))
    o.append(grp(''.join(floes), filter='url(#rough2)'))
    refl = []
    for _ in range(40):
        rx = rnd.uniform(x0, x1)
        t = (rx - x0) / (x1 - x0)
        if rnd.random() < warm_p * min(1, max(0, (t - wave_left) / 0.25 + 0.15)):
            refl.append(rect(rx, horizon + 34, 2.2, rnd.uniform(10, 26), HONEY_MID, opacity='0.45'))
    o.append(grp(''.join(refl), filter='url(#b1)'))
    if ships:
        # two icebreakers moored at the quay, their deck lights cool
        for sx, sw in ((690, 150), (850, 130)):
            sy = horizon + 78
            o.append(poly([(sx, sy), (sx + sw, sy), (sx + sw * 0.94, sy + 20), (sx + sw * 0.05, sy + 20)], g(15)))
            o.append(rect(sx + sw * 0.3, sy - 34, sw * 0.4, 34, g(17)))
            o.append(rect(sx + sw * 0.42, sy - 58, sw * 0.12, 24, g(17)))
            for k in range(5):
                o.append(rect(sx + sw * 0.32 + k * sw * 0.075, sy - 26, 4, 5, g(62)))
    if plan:
        o.append(plan)
    if domes_at:
        o.append(grp(domes(domes_at[0], domes_at[1], 0.62, g(17), snowcol=g(50)), filter='url(#rough2)'))
    if near_roofs:
        # Katajanokka's snowy roofs right under her window
        roofs = []
        specs = [(80, roof_y + 40, 300, 150, 0.32), (330, roof_y + 10, 330, 170, 0.36), (630, roof_y + 30, 300, 160, 0.3),
                 (900, roof_y + 0, 260, 180, 0.38)]
        for i, (rx, ry, rw, rh, pitch) in enumerate(specs):
            top = ry
            roofs.append(poly([(rx, top + rh), (rx + rw * 0.18, top), (rx + rw * 0.82, top), (rx + rw, top + rh)], g(66 - i * 2)))
            roofs.append(poly([(rx + rw * 0.18, top), (rx + rw * 0.22, top + 10), (rx + rw * 0.78, top + 10), (rx + rw * 0.82, top)], g(78)))
            roofs.append(rect(rx, top + rh * 0.62, rw, rh, g(16)))
            # dormers / attic windows
            for k in range(3):
                dx = rx + rw * (0.25 + 0.22 * k)
                lit = rnd.random() < warm_p * 0.3
                roofs.append(rect(dx, top + rh * 0.42, 18, 22, HONEY if lit else g(22)))
            # chimney with a curl of steam
            cx = rx + rw * rnd.uniform(0.3, 0.7)
            roofs.append(rect(cx, top - 34, 22, 40, g(18)))
            roofs.append(rect(cx - 3, top - 38, 28, 7, g(70)))
        o.append(grp(''.join(roofs), filter='url(#rough2)'))
    o.append(snow(seed + 1, 220, x0, y0, x1, y1, 1.4, 3.6, op=(0.3, 0.8)))
    return defs, ''.join(o)


# ------------------------------------------------------------------ D-B1 (and its warm match, D-B12)
def living_room(state='landing'):
    """Her living room at night: the deep old window over Katajanokka's roofs, the bay and the far city.
    state 'landing' = B1 (frost melting, the radiator warming, the city's windows warming in a wave);
    'warm' = B12 (frost gone, the radiator hot, her socked feet up on it)."""
    warm = state == 'warm'
    defs = ''
    o = []
    o.append(rect(0, 0, W, H, g(8)))
    gx0, gy0, gx1, gy1 = 96, 166, 984, 1300
    defs += '<clipPath id="glass"><rect x="%d" y="%d" width="%d" height="%d"/></clipPath>' % (gx0, gy0, gx1 - gx0, gy1 - gy0)
    d2, view = night_view(41, gx0, gy0, gx1, gy1, horizon=1000, warm_p=0.95 if warm else 0.85,
                          wave_left=0.0 if warm else 0.3, domes_at=(250, 1004))
    defs += d2
    o.append('<g clip-path="url(#glass)">' + view)
    if not warm:
        avoid = lambda x, y: ((x - 600) / 380) ** 2 + ((y - 1030) / 230) ** 2 < 1 or y < 690
        o.append(grp(rect(gx0, 1190, gx1 - gx0, 110, '#e6ebf2', opacity='0.2'), filter='url(#b16)'))
        o.append(frost(5, gx0, 690, gx1, gy1, n=50, op=0.8, avoid=avoid))
    o.append('</g>')
    fr, lit = g(19), g(36)
    o.append(rect(70, 146, 940, 22, fr) + rect(70, 1298, 940, 26, fr))
    o.append(rect(70, 146, 26, 1178, fr) + rect(984, 146, 26, 1178, fr))
    o.append(rect(96, 626, 888, 26, fr) + rect(96, 626, 888, 4, lit))
    o.append(rect(527, 652, 26, 648, fr) + rect(549, 652, 4, 648, lit))
    o.append(rect(96, 166, 4, 1134, lit, opacity='0.7'))
    # the deep sill, lit by the snow light; her mug and a plant on it
    o.append(rect(30, 1318, 1050, 34, g(33)) + rect(30, 1350, 1050, 16, g(15)))
    o.append(rect(770, 1270, 40, 48, g(15), rx='6') + path('M 808 1282 C 826 1282 826 1306 808 1306', 'none', stroke=g(15), stroke_width='7'))
    o.append(steam(301, 790, 1264, 34, 70, col=HONEY_HI, op=0.5, n=4, flt='steamS'))
    o.append(rect(902, 1272, 46, 46, g(13), rx='5') + grp(ell(925, 1246, 44, 28, g(12)) + ell(905, 1228, 20, 28, g(12)) +
                                                          ell(948, 1232, 19, 25, g(12)), filter='url(#rough)'))
    # the floor: a cool patch of snow-light from the window, a warm breath under the radiator
    o.append(rect(0, 1600, W, 320, g(10)))
    for i in range(8):
        y = 1612 + i * i * 4.4 + i * 20
        o.append(line(0, y, W, y, g(13), 2))
    o.append(grp(poly([(300, 1600), (1000, 1600), (1080, 1920), (520, 1920)], g(17), opacity='0.55'), filter='url(#b16)'))
    o.append(grp(ell(330, 1830, 430, 110, g(14)), filter='url(#rough)'))
    o.append(radiator(420, 1386, 520, 214, n=16, warm=1.0 if warm else 0.62))
    o.append(grp(rect(560 if not warm else 430, 1600, 380 if not warm else 520, 36, HONEY_DEEP, opacity='0.22'), filter='url(#b16)'))
    # the curtain (left gutter) and the right wall with a shelf of books
    cur = ''.join(rect(cx - 16, 100, 34, 1640, g(L), rx='14') for cx, L in [(14, 12), (40, 16), (66, 13), (92, 18)])
    o.append(grp(cur, filter='url(#rough)'))
    o.append(rect(1010, 0, 70, 1600, g(10)))
    o.append(rect(1010, 1130, 70, 10, g(19)) + rect(1018, 1060, 14, 70, g(15)) + rect(1036, 1072, 12, 58, g(18)) +
             rect(1052, 1050, 16, 80, g(13)))
    o.append(rect(0, 0, W, 146, g(9)) + rect(0, 112, W, 8, g(15)))
    # her: in a low armchair, seen from behind, head turned up to the window; the phone's chat in her hand
    o.append(circ(470, 1520, 90, '#cfe0ec', opacity='0.16', filter='url(#b16)'))
    if not warm:
        # her knees under a knitted blanket toward the radiator, the socks tucked in
        o.append(grp(path('M 470 1500 C 540 1462 640 1458 690 1490 C 716 1510 712 1556 684 1574 L 500 1588 Z', g(22)), filter='url(#rough)'))
        for k in range(4):
            o.append(path('M %d 1478 C %d 1510 %d 1550 %d 1580' % (520 + k * 45, 516 + k * 45, 524 + k * 45, 520 + k * 45), 'none',
                          stroke=g(26), stroke_width='7', opacity='0.6'))
        o.append(ell(694, 1560, 24, 14, '#cfc3b2'))
    if not warm:
        o.append(her_seated_back(330, 1296, 1.18, head_rot=-20))
    body = ''.join(o)
    if warm:
        caption = cap('your chatbot could', 'heat an |*apartment', size=100)
    else:
        caption = cap('AI to heat', '*70,000| homes?')
    return defs, body, caption


FRAMES = {
    'D-B1': lambda: living_room('landing'),
}


# ------------------------------------------------------------------ D-B12: socks on a warm radiator (B1's frame, closer, warm)
def B12():
    defs = ''
    o = [rect(0, 0, W, H, g(13))]
    gx0, gy0, gx1, gy1 = 60, 120, 1020, 1290
    defs += '<clipPath id="glass12"><rect x="%d" y="%d" width="%d" height="%d"/></clipPath>' % (gx0, gy0, gx1 - gx0, gy1 - gy0)
    d2, view = night_view(41, gx0, gy0, gx1, gy1, horizon=1010, warm_p=0.98, wave_left=0.0, domes_at=(250, 1012), roof_y=1110)
    defs += d2
    o.append('<g clip-path="url(#glass12)">' + view + '</g>')
    fr, lit = g(24), g(42)
    o.append(rect(30, 96, 1020, 24, fr) + rect(30, 1288, 1020, 26, fr) + rect(30, 96, 30, 1218, fr) + rect(1020, 96, 30, 1218, fr))
    o.append(rect(60, 628, 960, 26, fr) + rect(60, 628, 960, 4, lit) + rect(527, 654, 26, 634, fr) + rect(549, 654, 4, 634, lit))
    # the sill (its front lit warm from below), the mug steaming, the plant
    o.append(rect(0, 1306, W, 36, g(36)) + rect(0, 1340, W, 18, HONEY_DARK))
    o.append(rect(860, 1258, 42, 48, g(17), rx='6') + path('M 900 1270 C 918 1270 918 1294 900 1294', 'none', stroke=g(17), stroke_width='7'))
    o.append(steam(302, 880, 1252, 36, 80, col=HONEY_HI, op=0.6, n=4, flt='steamS'))
    o.append(rect(950, 1262, 50, 44, g(15), rx='5') + grp(ell(975, 1236, 46, 30, g(14)) + ell(955, 1216, 22, 30, g(14)), filter='url(#rough)'))
    # the warm room: the radiator hot, its warmth on the floor, the chair's edge, her
    o.append(rect(0, 1358, W, 562, g(14)))
    o.append(radiator(470, 1372, 540, 230, n=16, warm=1.0))
    o.append(grp(rect(440, 1600, 600, 70, HONEY_DEEP, opacity='0.32'), filter='url(#b16)'))
    o.append(rect(0, 1640, W, 280, g(12)))
    for i in range(6):
        y = 1652 + i * i * 5 + i * 22
        o.append(line(0, y, W, y, g(15), 2))
    o.append(grp(poly([(440, 1640), (1080, 1640), (1080, 1800), (560, 1780)], HONEY_DEEP, opacity='0.18'), filter='url(#b16)'))
    # her legs: knees up, shins out to the radiator, wool socks crossed on its warm top
    o.append(path('M 300 1720 C 340 1600 400 1520 470 1470 C 500 1450 530 1452 546 1470 C 600 1420 660 1380 700 1352 '
                  'L 724 1384 C 680 1420 620 1470 560 1520 C 520 1560 470 1560 430 1600 C 400 1640 380 1700 370 1760 Z', g(18)))
    o.append(path('M 360 1760 C 400 1640 470 1580 530 1546 C 560 1530 590 1530 604 1546 C 660 1490 730 1430 780 1392 '
                  'L 802 1424 C 750 1470 690 1530 630 1590 C 590 1630 540 1640 500 1680 C 470 1712 450 1760 440 1800 Z', g(21)))
    for (sx, sy, sc, rot) in ((708, 1348, '#e9ddc9', -28), (786, 1378, '#ddcfb9', -18)):
        sock = (path('M -50 18 C -56 -10 -40 -36 -6 -40 C 30 -44 64 -34 72 -12 C 78 6 66 22 46 24 L -40 30 Z', sc) +
                line(-46, 6, -36, -26, HONEY_DEEP, 6) + line(-34, 10, -24, -30, HONEY_DEEP, 4) +
                ''.join(circ(-6 + k * 16, -10 + (k % 2) * 8, 3, HONEY_DEEP) for k in range(4)) +
                path('M 40 -36 C 58 -34 72 -22 72 -12 C 60 -18 48 -22 36 -24 Z', g(66)))
        o.append('<g transform="translate(%s %s) rotate(%s)">%s</g>' % (f(sx), f(sy), f(rot), sock))
    o.append(her_seated_back(220, 1420, 1.32, warm_rim=HONEY_MID, head_rot=6, warm_bubble=True, chair_lit=HONEY_DEEP))
    caption = cap('your chatbot could', 'heat an |*apartment', size=100)
    return defs, ''.join(o), caption


# ------------------------------------------------------------------ D-B2: her chat's other end, a city of machines
def B2():
    """From a catwalk high in the hall: rows of giant computers like a city at night, their cold lights converging on the
    far door, open to the snow; tiny people in the aisles; through the door, across the bay, warm windows (home)."""
    defs = ''
    o = [rect(0, 0, W, H, g(6))]
    rnd = random.Random(7)
    VPX, VPY, F, HC = 540, 660, 520.0, 8.4
    P = lambda X, Y, Z: (VPX + F * X / Z, VPY + F * (HC - Y) / Z)
    # the far wall and the wide door at the end of the hall: the snowy night, the bay, the warm city
    ZE = 42.0
    fl, fr_ = P(-14, 0, ZE), P(14, 0, ZE)
    o.append(rect(0, VPY - 30, W, fl[1] - VPY + 34, g(9)))
    d0, d1 = P(-6, 0, ZE), P(6, 6.5, ZE)
    o.append(rect(d0[0], d1[1], d1[0] - d0[0], d0[1] - d1[1], g(42)))
    o.append(rect(d0[0], d0[1] - 12, d1[0] - d0[0], 12, g(80)))
    o.append(rect(d0[0], d0[1] - 34, d1[0] - d0[0], 22, g(24)))
    for i in range(26):
        o.append(rect(d0[0] + rnd.uniform(2, d1[0] - d0[0] - 8), rnd.uniform(d0[1] - 32, d0[1] - 18), 5, 6, HONEY if rnd.random() < 0.75 else HONEY_MID))
    o.append(grp(rect(d0[0] - 40, d1[1] - 20, d1[0] - d0[0] + 80, d0[1] - d1[1] + 60, '#dfe6ee', opacity='0.22'), filter='url(#b16)'))
    # the floor of the hall, its aisles lit cool
    o.append(poly([P(-30, 0, 3.0), P(-30, 0, ZE), P(30, 0, ZE), P(30, 0, 3.0)], g(13)))
    # the rows: long blocks of giant cabinets, lit tops, side faces glittering with status lights
    rows = [(-13.5, -11.0), (-9.0, -6.6), (-4.5, -2.1), (2.1, 4.5), (6.6, 9.0), (11.0, 13.5)]
    TOPH = 6.4
    def row(xa, xb):
        out = []
        z0, z1 = 3.2, ZE - 2
        near_face_x = xb if xb < 0 else xa      # the side face that looks at the camera's axis
        # the aisle-side face
        a, b2, c, d = P(near_face_x, TOPH, z0), P(near_face_x, TOPH, z1), P(near_face_x, 0, z1), P(near_face_x, 0, z0)
        out.append(poly([a, b2, c, d], g(15)))
        # its status lights: a grid in perspective, cabinet by cabinet
        zz = z0
        while zz < z1:
            for hh in [0.5 + k * 0.42 for k in range(14)]:
                if rnd.random() < 0.8:
                    x, y = P(near_face_x, hh, zz + 0.3)
                    r = max(0.9, 26 / (zz + 2))
                    out.append(circ(x, y, r, g(rnd.choice([86, 92, 78]))))
            sx0, sy0 = P(near_face_x, TOPH, zz)
            sx1, sy1 = P(near_face_x, 0, zz)
            out.append(line(sx0, sy0, sx1, sy1, g(8), max(1, 9 / zz)))
            zz += 0.75 if zz < 8 else (1.2 if zz < 16 else 2.2)
        # the lit top
        t0, t1, t2, t3 = P(xa, TOPH, z0), P(xb, TOPH, z0), P(xb, TOPH, z1), P(xa, TOPH, z1)
        out.append(poly([t0, t1, t2, t3], g(19)))
        for k in range(3):
            u = (k + 1) / 4
            out.append(line(*P(xa + (xb - xa) * u, TOPH, z0), *P(xa + (xb - xa) * u, TOPH, z1), g(22), 2))
        # the front end (toward us)
        e0, e1, e2, e3 = P(xa, TOPH, z0), P(xb, TOPH, z0), P(xb, 0, z0), P(xa, 0, z0)
        out.append(poly([e0, e1, e2, e3], g(11)))
        for hh in [0.5 + k * 0.42 for k in range(14)]:
            for q in range(5):
                if rnd.random() < 0.7:
                    x, y = P(xa + (xb - xa) * (q + 0.5) / 5, hh, z0)
                    out.append(circ(x, y, 3.2, g(88)))
        return ''.join(out)
    # draw from the outside in so the near rows overlap correctly
    for xa, xb in sorted(rows, key=lambda r: -abs(r[0] + r[1])):
        o.append(row(xa, xb))
    # light pools in the aisles
    for xa in (-2.1, -6.6, 2.1):
        pass
    o.append(grp(poly([P(-2.1, 0, 3.2), P(-2.1, 0, ZE), P(2.1, 0, ZE), P(2.1, 0, 3.2)], g(24), opacity='0.6'), filter='url(#b8)'))
    # tiny people in the aisles: scale
    for (X, Z) in ((0.2, 14.0), (-5.3, 22.0), (5.6, 10.0)):
        fx, fy = P(X, 0, Z)
        hh = F * 1.75 / Z
        o.append(rect(fx - hh * 0.13, fy - hh * 0.82, hh * 0.26, hh * 0.82, g(3), rx=f(hh * 0.1)) + circ(fx, fy - hh * 0.9, hh * 0.1, g(3)))
    # the catwalk railing at the bottom (the near hint)
    o.append(rect(0, 1760, W, 160, g(9)))
    o.append(line(0, 1700, W, 1700, g(26), 10) + line(0, 1760, W, 1760, g(20), 8))
    for k in range(9):
        o.append(line(60 + k * 125, 1700, 60 + k * 125, 1920, g(20), 9))
    caption = cap('AI runs on', '*giant| computers')
    return defs, ''.join(o), caption


# ------------------------------------------------------------------ D-B3: the building the snow can't touch
def B3():
    defs = lin_grad('sky3', [(0, g(9)), (0.6, g(16)), (1, g(28))], x1=0, y1=0, x2=0, y2=1150, units=True)
    o = [rect(0, 0, W, 1160, 'url(#sky3)')]
    rnd = random.Random(33)
    # far: the bay and the city's warm windows on the horizon (home, far away)
    o.append(rect(0, 1100, W, 60, g(18)))
    for i in range(60):
        x = rnd.uniform(0, 380)
        o.append(rect(x, rnd.uniform(1102, 1124), 3, 4, HONEY if rnd.random() < 0.7 else g(40)))
    for i in range(20):
        bx = rnd.uniform(0, 400)
        bh = rnd.uniform(10, 40)
        o.append(rect(bx, 1100 - bh, rnd.uniform(16, 40), bh, g(17)))
    # the snowy field, light; tyre tracks to the door
    o.append(rect(0, 1150, W, 770, g(80)))
    o.append(grp(poly([(0, 1150), (W, 1150), (W, 1190), (0, 1180)], g(70)), filter='url(#rough)'))
    o.append(pline([(620, 1250), (520, 1600), (360, 1920)], g(66), 26) + pline([(700, 1250), (660, 1600), (600, 1920)], g(66), 26))
    # the melted, wet dark ring round the building, its puddles mirroring the door's light
    o.append(grp(path('M -20 1236 C 120 1180 360 1196 520 1188 C 700 1180 940 1170 1100 1222 L 1100 1300 C 900 1352 640 1376 420 1366 C 220 1356 60 1330 -20 1296 Z', g(34)), filter='url(#rough)'))
    o.append(grp(ell(610, 1270, 120, 20, g(56), opacity='0.6') + ell(380, 1262, 90, 12, g(44)), filter='url(#rough2)'))
    # the building: long, low, windowless; its roof bare and wet (no snow can stay on it)
    o.append(poly([(70, 960), (980, 930), (980, 1250), (70, 1258)], g(15)))
    o.append(poly([(60, 952), (990, 922), (990, 940), (60, 970)], g(10)))
    for k in range(12):
        x = 110 + k * 72
        o.append(line(x, 966 - k * 2.5, x, 1250, g(13), 3))
    # the loading door, open: the giants' rows of lights inside
    o.append(rect(560, 1080, 170, 172, g(42)))
    for r in range(9):
        for q in range(8):
            if rnd.random() < 0.7:
                o.append(circ(572 + q * 20, 1094 + r * 17, 2.2, g(86)))
    # icicles along the eave, dripping
    ic = []
    for k in range(40):
        x = 80 + k * 22.5 + rnd.uniform(-5, 5)
        y = 958 - (x - 70) * 0.033
        L = rnd.uniform(12, 42)
        ic.append(poly([(x - 4, y), (x + 4, y), (x, y + L)], g(70)))
        if rnd.random() < 0.3:
            ic.append(circ(x, y + L + rnd.uniform(14, 60), 2.2, g(74)))
    o.append(''.join(ic))
    # the heat: steam pouring off the roof vents, warm at the root, thinning before the band
    for i, (vx, h, w, ln) in enumerate([(210, 250, 120, 0.35), (420, 400, 190, 0.28), (650, 330, 160, 0.3), (850, 210, 110, 0.4)]):
        vy = 948 - (vx - 70) * 0.033
        o.append(rect(vx - 30, vy - 30, 60, 30, g(12)))
        o.append(steam(500 + i, vx, vy - 34, w, h, col=g(80), op=0.6, n=10, root=HONEY_MID, root_op=0.75, lean=ln))
    o.append(grp(rect(560, 1080, 170, 40, HONEY_DEEP, opacity='0.5'), filter='url(#b8)'))
    o.append(steam(520, 645, 1086, 160, 170, col=g(84), op=0.45, n=6, root=HONEY_MID, root_op=0.6, lean=0.25))
    # a snowy fence in front (the near hint), a lamppost
    for k in range(9):
        x = 40 + k * 125
        o.append(rect(x, 1560, 14, 220, g(30)) + rect(x - 4, 1552, 22, 10, g(92)))
    o.append(rect(0, 1600, W, 10, g(30)) + rect(0, 1594, W, 7, g(92)))
    o.append(rect(950, 1100, 12, 560, g(22)) + rect(918, 1094, 60, 10, g(22)) + circ(926, 1110, 12, g(70)))
    o.append(snow(301, 260, 0, 0, W, 1920, 1.6, 4.2, op=(0.4, 0.9)))
    caption = cap('Those computers', 'get really |*hot.')
    return defs, ''.join(o), caption


# ------------------------------------------------------------------ the kitchen (D-B4, D-B5, D-B7, D-B8 use it)
def kitchen_kettles(seed=4):
    """Her small kitchen filled with forty boiling kettles (one point, from the doorway); steam fills the ceiling."""
    rnd = random.Random(seed)
    o = []
    VPX, VPY = 540, 1040
    k = 193.0
    bx0, bx1 = VPX - 1.5 * k, VPX + 1.5 * k
    by_floor, by_ceil = VPY + 1.6 * k, VPY - 1.1 * k
    # walls and floor
    o.append(rect(0, 0, W, H, g(66)))
    o.append(poly([(0, 0), (bx0, by_ceil), (bx0, by_floor), (0, 1920)], g(60)))      # left wall
    o.append(poly([(W, 0), (bx1, by_ceil), (bx1, by_floor), (W, 1920)], g(56)))      # right wall
    o.append(rect(bx0, by_ceil, bx1 - bx0, by_floor - by_ceil, g(70)))                # back wall
    o.append(poly([(bx0, by_floor), (bx1, by_floor), (W, 1920), (0, 1920)], g(52)))  # floor
    # floor tiles (checker, in perspective)
    tiles = []
    rows = [by_floor, 1420, 1500, 1610, 1760, 1920]
    for r in range(len(rows) - 1):
        ya, yb = rows[r], rows[r + 1]
        ta, tb = (ya - VPY) / (by_floor - VPY), (yb - VPY) / (by_floor - VPY)
        for c in range(-6, 6):
            xa0, xa1 = VPX + c * 60 * ta, VPX + (c + 1) * 60 * ta
            xb0, xb1 = VPX + c * 60 * tb, VPX + (c + 1) * 60 * tb
            if (r + c) % 2 == 0:
                tiles.append(poly([(xa0, ya), (xa1, ya), (xb1, yb), (xb0, yb)], g(46)))
    o.append(''.join(tiles))
    # the back window, fogged white
    o.append(rect(392, 872, 296, 236, g(36)) + rect(400, 880, 280, 220, g(88)))
    o.append(line(540, 880, 540, 1100, g(40), 8) + grp(rect(410, 1000, 120, 90, g(70), opacity='0.6'), filter='url(#b8)'))
    # counters: back, left, right (0.9 m), upper cabinets lost in the steam
    cy = VPY + 0.7 * k
    o.append(rect(bx0, cy, bx1 - bx0, by_floor - cy, g(40)) + rect(bx0, cy - 10, bx1 - bx0, 12, g(80)))
    for side in (-1, 1):
        xb = bx0 if side < 0 else bx1
        xe = 0 if side < 0 else W
        top_b, top_e = cy, VPY + 0.7 * 650
        o.append(poly([(xb, top_b), (xe, top_e), (xe, 1920), (xb, by_floor)], g(38 if side < 0 else 34)))
        o.append(poly([(xb, top_b - 10), (xe, top_e - 30), (xe, top_e), (xb, top_b)], g(78)))
        # cabinet door seams
        for t in (0.25, 0.5, 0.75):
            xx = xb + (xe - xb) * t
            ya = top_b + (top_e - top_b) * t
            yz = by_floor + (1920 - by_floor) * t
            o.append(line(xx, ya + 12, xx, yz, g(30), 3))
    # the fridge on the right, a stove on the left (back corner)
    o.append(poly([(bx1, 760), (bx1 + 160, 690), (bx1 + 160, 1500), (bx1, by_floor)], g(76)))
    o.append(line(bx1 + 20, 900, bx1 + 20, 1000, g(50), 4))
    o.append(rect(bx0 + 20, cy - 14, 120, 14, g(20)))
    # the pendant lamp in the steam (top gutter), its light on the steam
    o.append(line(540, 0, 540, 150, g(30), 3) + path('M 480 196 C 486 156 594 156 600 196 Z', g(24)))
    o.append(ell(540, 214, 120, 46, HONEY_HI, opacity='0.35', filter='url(#b16)'))
    # kettles: on the back counter, along both side counters, on the table, the chairs, the floor, the fridge
    ket = []
    def put(x, y, h, face=1, sd=None):
        ket.append((y, kettle(x, y, h, body=g(rnd.uniform(28, 40)), lit=g(62), dark=g(18), face=face,
                               steam_seed=sd if sd is not None else rnd.randint(0, 999), steam_h=h * 1.6, steam_op=0.5)))
    for i in range(7):
        put(bx0 + 30 + i * 40, cy - 12, 44, face=1 if i % 2 else -1)
    for i in range(6):
        t = 0.08 + i * 0.16
        x = bx0 + (0 - bx0) * t + 30
        y = cy + (VPY + 0.7 * 650 - cy) * t - 22
        put(x, y, 50 + 110 * t, face=1)
    for i in range(6):
        t = 0.08 + i * 0.16
        x = bx1 + (W - bx1) * t - 30
        y = cy + (VPY + 0.7 * 650 - cy) * t - 22
        put(x, y, 50 + 110 * t, face=-1)
    put(bx1 + 70, 700, 56, face=-1)
    put(bx1 + 120, 690, 52, face=-1)
    # the table and its kettles
    tx0, tx1, ty = 330, 760, 1330
    o_table = rect(tx0, ty, tx1 - tx0, 26, g(30)) + rect(tx0 + 20, ty + 26, 18, 230, g(26)) + rect(tx1 - 40, ty + 26, 18, 230, g(26))
    for i, xx in enumerate((360, 420, 480, 545)):
        put(xx, ty, 74, face=1 if i % 2 else -1)
    # chairs with a kettle each, floor kettles in front
    o_chairs = rect(200, 1390, 120, 18, g(28)) + rect(206, 1408, 12, 200, g(24)) + rect(300, 1408, 12, 200, g(24))
    put(256, 1390, 84, face=1)
    for i, (xx, yy, hh) in enumerate([(130, 1780, 150), (330, 1720, 120), (880, 1760, 140), (720, 1650, 100), (470, 1600, 92)]):
        put(xx, yy, hh, face=1 if xx < 540 else -1)
    ket.sort(key=lambda t: t[0])
    back = ''.join(kk for yy, kk in ket if yy < ty)
    front = ''.join(kk for yy, kk in ket if yy >= ty)
    return o, o_table, o_chairs, back, front


def steam_ceiling(op=0.85):
    """The kettles' steam gathered under the ceiling: a light, calm field (the caption seat sits in it)."""
    return (grp(rect(0, 0, W, 700, g(90), opacity=f(op)) + ell(540, 700, 700, 120, g(88), opacity='0.7') +
                ell(260, 820, 300, 90, g(86), opacity='0.5') + ell(840, 800, 300, 90, g(86), opacity='0.5'), filter='url(#b30)'))


def B4():
    o, table, chairs, back, front = kitchen_kettles()
    o.append(back)
    o.append(chairs)
    o.append(table)
    # her, sitting on the table's edge among them, in profile, mug at her chest: astonished
    o.append(her_profile_sitting(690, 1330, 0.95, sweater=g(22), hair=g(8), skin=g(48), legs=g(16), flip=True))
    o.append(front)
    o.append(steam_ceiling())
    # the near doorway (the near hint at both edges)
    o.append(rect(0, 0, 46, H, g(20)) + rect(W - 46, 0, 46, H, g(20)))
    caption = cap('as much heat as', '*forty| kettles,')
    return '', ''.join(o), caption


def B5():
    """Tea for one: closer on her sip among the steaming crowd; soft, light, a breath."""
    o = [rect(0, 0, W, H, g(78))]
    rnd = random.Random(55)
    # the fogged window behind her, the back counter's kettles soft
    o.append(rect(60, 640, 720, 560, g(90)))
    o.append(line(420, 640, 420, 1200, g(70), 10))
    o.append(rect(0, 1200, W, 40, g(84)) + rect(0, 1240, W, 680, g(58)))
    soft = ''
    for i in range(8):
        x = 40 + i * 140 + rnd.uniform(-20, 20)
        soft += kettle(x, 1210, 110, body=g(48), lit=g(70), dark=g(34), face=1 if i % 2 else -1, steam_seed=200 + i, steam_h=200, steam_op=0.4)
    o.append(grp(soft, filter='url(#b4)'))
    # the table top she sits on
    o.append(rect(0, 1560, W, 40, g(44)) + rect(0, 1600, W, 320, g(52)))
    o.append(her_profile_sitting(470, 1580, 1.75, sip=True, sweater=g(26), hair=g(9), skin=g(54), legs=g(20)))
    # near kettles at the corners, big and soft
    near = kettle(110, 1900, 260, body=g(36), lit=g(60), dark=g(22), face=1, steam_seed=901, steam_h=300, steam_op=0.35)
    near += kettle(990, 1920, 280, body=g(34), lit=g(58), dark=g(20), face=-1, steam_seed=902, steam_h=300, steam_op=0.35)
    o.append(grp(near, filter='url(#b8)'))
    o.append(steam_ceiling(0.8))
    caption = cap("That's a lot", 'of |*tea.')
    return '', ''.join(o), caption


FRAMES.update({
    'D-B2': B2,
    'D-B3': B3,
    'D-B4': B4,
    'D-B5': B5,
})


# ------------------------------------------------------------------ D-B6: out of her window, up into the night
def B6():
    """The rise lands high over the snowy land at night: a data centre's big roof fans throw warm columns up into the cold,
    merging, thinning to nothing; more plumes to the horizon; at the bottom, the snowy roofs of home and her open window."""
    defs = lin_grad('sky6', [(0, g(5)), (0.55, g(11)), (0.88, g(20)), (1, g(30))], x1=0, y1=0, x2=0, y2=960, units=True)
    o = [rect(0, 0, W, 980, 'url(#sky6)')]
    rnd = random.Random(66)
    # the land: a snowy plain, forest belts in long ragged strips, finer toward the horizon (y 960); a road with car lights
    defs += lin_grad('land6', [(0, g(46)), (1, g(56))], x1=0, y1=960, x2=0, y2=1600, units=True)
    o.append(rect(0, 960, W, 960, 'url(#land6)'))
    belts = ''
    for i in range(16):
        y = 970 + (i ** 1.6) * 9
        t = (y - 960) / 600
        x = rnd.uniform(-200, 600)
        L = rnd.uniform(300, 900)
        hgt = 3 + 26 * t
        belts += path('M %s %s C %s %s %s %s %s %s L %s %s C %s %s %s %s %s %s Z' % (
            f(x), f(y), f(x + L * 0.3), f(y - hgt * 0.8), f(x + L * 0.7), f(y - hgt * 1.1), f(x + L), f(y - hgt * 0.2),
            f(x + L), f(y + hgt * 0.4), f(x + L * 0.6), f(y + hgt * 0.5), f(x + L * 0.3), f(y + hgt * 0.6), f(x), f(y + hgt * 0.3)),
            g(rnd.uniform(24, 30)))
    o.append(grp(belts, filter='url(#rough)'))
    o.append(pline([(1080, 1180), (760, 1080), (520, 1010), (300, 975)], g(36), 7))
    for k in range(5):
        t = rnd.uniform(0.05, 0.95)
        o.append(circ(1080 - 780 * t, 1180 - 205 * t, 2.2, g(80)))
    # far plumes to the horizon: everywhere, the same
    for i, (px, ph, pw) in enumerate([(90, 140, 50), (250, 190, 60), (430, 120, 40), (690, 170, 55), (860, 210, 70), (1010, 130, 45)]):
        o.append(rect(px - pw * 0.4, 962, pw * 0.8, 10, g(30)))
        o.append(steam(640 + i, px, 960, pw * 1.6, ph + 120, col=g(48), op=0.45, n=7, root=HONEY_DEEP, root_op=0.45, lean=0.35))
    # the near data centre: a plain long box, its roof full of big fans, seen from above
    x0, y0, w, d = 250, 1200, 560, 220
    roof = [(x0, y0), (x0 + w, y0 - 40), (x0 + w + 90, y0 - 40 + d * 0.62), (x0 + 90, y0 + d * 0.62)]
    o.append(poly([roof[3], roof[2], (roof[2][0], roof[2][1] + 120), (roof[3][0], roof[3][1] + 120)], g(16)))
    o.append(poly([roof[0], roof[3], (roof[3][0], roof[3][1] + 120), (roof[0][0], roof[0][1] + 120)], g(12)))
    o.append(poly(roof, g(46)))
    fans = []
    for r in range(2):
        for c in range(4):
            u = (c + 0.5) / 4
            v = (r + 0.5) / 2
            fx = roof[0][0] + (roof[1][0] - roof[0][0]) * u + (roof[3][0] - roof[0][0]) * v
            fy = roof[0][1] + (roof[1][1] - roof[0][1]) * u + (roof[3][1] - roof[0][1]) * v
            fans.append((fx, fy))
            o.append(ell(fx, fy, 56, 30, g(20)) + ell(fx, fy, 46, 24, g(10)))
            for k in range(4):
                ang = k * math.pi / 2 + 0.4
                o.append(line(fx, fy, fx + math.cos(ang) * 40, fy + math.sin(ang) * 21, g(34), 7))
            o.append(ell(fx, fy, 8, 5, g(40)))
    # the warmth thrown up from each fan, merging into one plume, thinning into the cold
    for i, (fx, fy) in enumerate(fans):
        o.append(steam(700 + i, fx, fy - 6, 90, 200, col=g(70), op=0.45, n=5, root=HONEY_MID, root_op=0.8, flt='steamS', lean=0.1))
    o.append(steam(760, 560, 1100, 500, 400, col=g(64), op=0.55, n=11, lean=0.18))
    # home, at the bottom: Katajanokka's snowy roofs, her window open and warm, a thin thread of steam rising from it
    o.append(path('M 0 1600 C 260 1560 600 1580 1080 1640 L 1080 1920 L 0 1920 Z', g(18)))
    roofs = ''
    for i, (rx, ry, rw) in enumerate([(-30, 1640, 260), (220, 1612, 240), (450, 1630, 250), (690, 1660, 240), (900, 1690, 220),
                                      (60, 1790, 260), (330, 1770, 280), (620, 1800, 260), (870, 1830, 240)]):
        roofs += poly([(rx, ry + 60), (rx + 40, ry), (rx + rw - 40, ry - 6), (rx + rw, ry + 54)], g(70 - (i % 3) * 3))
        roofs += rect(rx, ry + 56, rw, 70, g(22))
        for q in range(4):
            if rnd.random() < 0.45:
                roofs += rect(rx + 26 + q * 52, ry + 76, 14, 16, HONEY_MID)
    o.append(grp(roofs, filter='url(#rough2)'))
    o.append(rect(560, 1700, 36, 34, HONEY) + rect(556, 1696, 44, 5, g(80)))
    o.append(steam(606, 578, 1690, 60, 300, col=g(76), op=0.5, n=8, flt='steamS', lean=0.08, root=HONEY_HI, root_op=0.7))
    o.append(snow(660, 200, 0, 0, W, 1600, 1.0, 2.8, op=(0.3, 0.8)))
    caption = cap('big fans blow', 'that heat |*outside.')
    return defs, ''.join(o), caption


# ------------------------------------------------------------------ the kitchen window, from inside, behind her (D-B7, D-B8)
def kitchen_window(state):
    """Her kitchen window over the bay, seen from inside behind her. state 'reach' (B7: open, she leans out and gathers a
    long ribbon of warm steam back in from the night) or 'plan' (B8: she leans on the sill; across the bay, on the empty
    snowy lot at the city's edge, the plan for a big new data centre stands drawn in pale chalk, its pipe drawn warm)."""
    defs = ''
    o = [rect(0, 0, W, H, g(52))]
    gx0, gy0, gx1, gy1 = 110, 620, 970, 1420
    defs += '<clipPath id="kw"><rect x="%d" y="%d" width="%d" height="%d"/></clipPath>' % (gx0, gy0, gx1 - gx0, gy1 - gy0)
    plan = None
    hz = 1060
    if state == 'plan':
        ch = '#eef1f5'
        pl = ''
        bx0, bx1, by_t, by_b = 330, 820, 870, 1050
        # the building drawn in chalk: front, roof edge, side, posts and big doors; no fill: the night shows through
        pl += pline([(bx0, by_b), (bx0, by_t), (bx1, by_t - 12), (bx1, by_b - 4)], ch, 5)
        pl += pline([(bx0, by_t), (bx0 + 60, by_t - 34), (bx1 + 60, by_t - 46), (bx1, by_t - 12)], ch, 4)
        pl += pline([(bx1 + 60, by_t - 46), (bx1 + 60, by_b - 30), (bx1, by_b - 4)], ch, 4)
        for k in range(1, 6):
            xx = bx0 + (bx1 - bx0) * k / 6
            pl += line(xx, by_t - 12 * k / 6 + 6, xx, by_b - 4 * k / 6, ch, 2.2)
        pl += pline([(bx0 + 40, by_b), (bx0 + 40, by_b - 80), (bx0 + 130, by_b - 82), (bx0 + 130, by_b)], ch, 3)
        # its pipe, drawn warm, along the shore toward the city: toward her
        pl += pline([(bx1, by_b - 20), (bx1 + 90, by_b - 16), (gx1 + 20, by_b - 6)], HONEY, 6)
        stakes = ''.join(line(bx0 - 20 + k * 110, by_b + 12, bx0 - 20 + k * 110, by_b - 8, g(78), 3) +
                         rect(bx0 - 20 + k * 110, by_b - 12, 10, 7, HONEY_MID) for k in range(6))
        snowlot = grp(path('M %s %s C %s %s %s %s %s %s L %s %s L %s %s Z' % (
            f(bx0 - 120), f(by_b + 14), f(bx0 + 100), f(by_b - 20), f(bx1), f(by_b - 22), f(bx1 + 200), f(by_b + 4),
            f(bx1 + 200), f(by_b + 30), f(bx0 - 120), f(by_b + 30)), g(64)), filter='url(#rough)')
        plan = snowlot + grp(grp(pl, filter='url(#rough2)') + stakes, opacity='0.97')
    d2, view = night_view(77, gx0, gy0, gx1, gy1, horizon=hz, warm_p=0.7, wave_left=0.0, domes_at=None, ships=(state == 'reach'),
                          near_roofs=True, plan=plan, roof_y=1240)
    defs += d2
    o.append('<g clip-path="url(#kw)">' + view)
    if state == 'reach':
        # far plumes on the horizon, and the long ribbon of warm steam she pulls back toward the window
        for i, (px, ph) in enumerate([(230, 200), (470, 160), (820, 150)]):
            o.append(steam(700 + i, px, hz, 90, ph, col=g(46), op=0.45, n=7, lean=0.3))
        # the nearest plume bends from the horizon toward her outstretched hand, warm where it meets it
        rib = [(860, 900), (900, 960), (930, 1010)]
        for i, (rx, ry) in enumerate(rib):
            o.append(steam(740 + i, rx, ry, 110 - i * 20, 90, col=g(86), op=0.5, n=4, flt='steamS'))
        o.append(steam(744, 935, 1040, 70, 40, col=HONEY_HI, op=0.75, n=3, flt='steamS', root=HONEY, root_op=0.9))
    o.append('</g>')
    fr = g(26)
    o.append(rect(80, 592, 920, 30, fr) + rect(80, 1420, 920, 34, fr) + rect(80, 592, 30, 862, fr) + rect(970, 592, 30, 862, fr))
    if state == 'reach':
        o.append(poly([(110, 622), (36, 580), (36, 1470), (110, 1420)], g(34)) + poly([(48, 604), (96, 628), (96, 1404), (48, 1440)], g(60), opacity='0.5'))
        o.append(poly([(970, 622), (1044, 580), (1044, 1470), (970, 1420)], g(30)) + poly([(984, 628), (1032, 604), (1032, 1440), (984, 1404)], g(58), opacity='0.5'))
    else:
        o.append(rect(527, 622, 26, 798, fr) + rect(110, 1000, 860, 18, fr))
        o.append(rect(116, 628, 4, 790, g(70), opacity='0.6'))
    # the sill: kettles still steaming, a plant
    o.append(rect(40, 1440, 1000, 42, g(70)) + rect(40, 1480, 1000, 22, g(38)))
    o.append(kettle(190, 1442, 80, body=g(32), lit=g(60), dark=g(18), face=1, steam_seed=811, steam_h=130, steam_op=0.45))
    o.append(kettle(900, 1442, 74, body=g(30), lit=g(58), dark=g(18), face=-1, steam_seed=812, steam_h=130, steam_op=0.45))
    o.append(rect(770, 1400, 44, 42, g(28), rx='5') + grp(ell(792, 1378, 36, 26, g(22)) + ell(774, 1358, 17, 24, g(22)), filter='url(#rough)'))
    o.append(rect(0, 1502, W, 418, g(46)))
    o.append(radiator(300, 1560, 480, 190, n=14, warm=0.0, base=g(38)))
    if state == 'reach':
        o.append(her_reaching_out(470, 1446, 1.3, sweater=g(18), hair=g(7), skin=g(42), legs=g(14), rim=g(66)))
        caption = cap('But Helsinki', '*wants| that heat.')
    else:
        o.append(her_on_sill(400, 1452, 1.3, sweater=g(20), hair=g(7), skin=g(42), rim=g(64)))
        caption = cap('The city has a plan,', 'starting |*next year.')
    o.append(steam_ceiling(0.75))
    return defs, ''.join(o), caption


# ------------------------------------------------------------------ D-B9: the plan's door opens
def B9():
    defs = lin_grad('sky9', [(0, g(8)), (0.65, g(16)), (1, g(28))], x1=0, y1=0, x2=0, y2=1180, units=True)
    o = [rect(0, 0, W, 1190, 'url(#sky9)')]
    rnd = random.Random(99)
    # beyond the chalk walls: the bay and, across it, her city's warm windows
    o.append(rect(0, 1150, W, 50, g(14)))
    for i in range(70):
        o.append(rect(rnd.uniform(0, W), rnd.uniform(1124, 1150), 3, 4, HONEY if rnd.random() < 0.6 else g(36)))
    for i in range(30):
        bx = rnd.uniform(0, W)
        o.append(rect(bx, 1150 - rnd.uniform(14, 44), rnd.uniform(20, 46), 50, g(18)))
    o.append(rect(0, 1196, W, 724, g(76)))
    ch = '#e4e8ee'
    pl = ''
    # the chalk facade: walls, a roof line, posts; drawn right where it will stand
    pl += pline([(-20, 700), (1100, 700)], ch, 5)
    pl += pline([(-20, 1520), (1100, 1520)], ch, 4)
    for xx in (60, 1020):
        pl += pline([(xx, 700), (xx, 1520)], ch, 5)
    pl += pline([(60, 760), (1020, 760)], ch, 2.5)
    # the door frame and the door swung open on its hinge (left), a cool light from inside on the snow
    pl += pline([(380, 1520), (380, 960), (700, 960), (700, 1520)], ch, 5)
    o.append(poly([(380, 960), (700, 960), (700, 1520), (380, 1520)], g(36)))
    # inside the door: chalk giants with their pipes, one warm pipe running out (the heat to come)
    inner = ''
    for k in range(3):
        cx = 430 + k * 92
        inner += pline([(cx, 1500), (cx, 1080), (cx + 64, 1074), (cx + 64, 1496)], ch, 3)
        for q in range(8):
            inner += line(cx + 8, 1110 + q * 46, cx + 56, 1108 + q * 46, ch, 1.6)
    inner += pline([(420, 1060), (690, 1050)], HONEY, 5)
    o.append(grp(inner, opacity='0.9'))
    o.append(poly([(380, 960), (250, 900), (250, 1590), (380, 1520)], g(30)))
    pl += pline([(380, 960), (250, 900), (250, 1590), (380, 1520)], ch, 5)
    pl += pline([(272, 1250), (296, 1252)], ch, 6)
    o.append(grp(poly([(380, 1520), (700, 1520), (900, 1920), (180, 1920)], g(92), opacity='0.55'), filter='url(#b16)'))
    o.append(grp(pl, filter='url(#rough2)'))
    o.append(snow(990, 240, 0, 0, W, H, 1.6, 4.0, op=(0.4, 0.9)))
    caption = cap('So how would', 'that work?')
    return defs, ''.join(o), caption


# ------------------------------------------------------------------ D-B10: blue in, honey out
def B10():
    defs = lin_grad('sky10', [(0, g(9)), (0.65, g(17)), (1, g(28))], x1=0, y1=0, x2=0, y2=1100, units=True)
    o = [rect(0, 0, W, 1110, 'url(#sky10)')]
    rnd = random.Random(1010)
    # across the bay, her city: the hot pipe's line ends at her window
    o.append(rect(0, 1080, W, 40, g(14)))
    for i in range(22):
        bx = rnd.uniform(640, W)
        o.append(rect(bx, 1080 - rnd.uniform(16, 50), rnd.uniform(22, 50), 56, g(19)))
    for i in range(50):
        o.append(rect(rnd.uniform(640, W), rnd.uniform(1040, 1078), 3, 4, HONEY if rnd.random() < 0.6 else g(36)))
    o.append(rect(980, 1020, 12, 14, HONEY_HI))
    o.append(rect(0, 1110, W, 810, g(74)))
    ch = '#e1e5ec'
    # chalk walls of the plan round us
    pl = pline([(70, 1660), (70, 650), (1010, 650), (1010, 1660)], ch, 4) + pline([(70, 720), (1010, 720)], ch, 2.2)
    pl += pline([(70, 1660), (1010, 1660)], ch, 3)
    for k in range(4):
        xx = 120 + k * 30
        pl += pline([(xx, 1600), (xx, 1300 + k * 20), (xx + 22, 1296 + k * 20), (xx + 22, 1598)], ch, 2)
    o.append(grp(pl, filter='url(#rough2)'))
    # the giant computer: real, painted; its rows of blades and lights
    gx0, gx1, gy0, gy1 = 360, 640, 760, 1560
    o.append(rect(gx0 - 10, gy1 - 6, gx1 - gx0 + 20, 14, g(30)))
    o.append(rect(gx0, gy0, gx1 - gx0, gy1 - gy0, g(13)) + rect(gx0, gy0, 18, gy1 - gy0, g(28)))
    o.append(rect(gx0 + 30, gy0 + 30, gx1 - gx0 - 60, gy1 - gy0 - 60, g(8)))
    for q in range(26):
        y = gy0 + 50 + q * 28
        o.append(line(gx0 + 40, y, gx1 - 40, y, g(20), 3))
        for k in range(4):
            if rnd.random() < 0.65:
                o.append(circ(gx1 - 80 + k * 12, y - 9, 3, g(84)))
    o.append(rect(gx0, gy0 - 8, gx1 - gx0, 10, g(64)))
    # the cold pipe: frosted and pale, in from the left and down into the giant's foot, icicles hanging from it
    cp = [(-20, 1180), (240, 1180), (290, 1230), (290, 1440), (340, 1490), (gx0 + 6, 1490)]
    o.append(pline(cp, g(70), 34) + pline(cp, g(88), 16) + pline(cp, '#ffffff', 5, opacity='0.7'))
    for k in range(8):
        x = 10 + k * 30
        o.append(poly([(x - 4, 1197), (x + 4, 1197), (x, 1197 + rnd.uniform(12, 30))], g(90)))
    o.append(grp(''.join(circ(rnd.uniform(0, 300), rnd.uniform(1166, 1196), 2.2, '#ffffff', opacity='0.85') for _ in range(40)), filter='url(#b1)'))
    # the hot pipe: honey, out at its top, down and away through the chalk wall, across the shore toward her window
    hp = [(gx1, 800), (720, 800), (760, 840), (760, 1360), (800, 1400), (1100, 1400)]
    o.append(pline(hp, HONEY_DEEP, 34) + pline(hp, HONEY_MID, 16) + pline(hp, HONEY_HI, 5, opacity='0.7'))
    o.append(pline([(990, 1380), (1000, 1240), (994, 1060)], HONEY_MID, 3, opacity='0.0'))
    for i, (sx, sy) in enumerate([(700, 790), (760, 980), (760, 1180), (900, 1388)]):
        o.append(steam(1100 + i, sx, sy, 60, 120, col=g(92), op=0.55, n=5, flt='steamS', root=HONEY_HI, root_op=0.6))
    # the snow melted along the hot pipe's run
    o.append(grp(rect(780, 1418, 320, 16, g(40)), filter='url(#rough)'))
    o.append(snow(1011, 220, 0, 0, W, H, 1.6, 4.0, op=(0.4, 0.9)))
    caption = cap('with |*water', 'in pipes.')
    return defs, ''.join(o), caption


# ------------------------------------------------------------------ D-B11: up her street, seen from her window
def B11():
    defs = lin_grad('sky11', [(0, g(8)), (0.7, g(18)), (1, g(30))], x1=0, y1=0, x2=0, y2=720, units=True)
    o = [rect(0, 0, W, 730, 'url(#sky11)')]
    rnd = random.Random(1111)
    VPX, VPY = 640, 610
    # the far end: the harbour, the bay, and across it the plan with its warm pipe start
    o.append(rect(0, 640, W, 70, g(16)))
    o.append(pline([(470, 660), (470, 640), (560, 636), (560, 656)], '#dfe3ea', 2) + pline([(560, 650), (640, 652)], HONEY, 3))
    o.append(rect(0, 700, W, 30, g(24)))
    # the street, from the harbour down to the foot of her building (seen from above)
    o.append(poly([(560, 720), (720, 720), (1080, 1520), (1080, 1920), (60, 1920), (300, 1520)], g(70)))
    o.append(poly([(560, 720), (590, 720), (330, 1920), (60, 1920)], g(58)))  # left pavement and snowbank
    o.append(poly([(700, 720), (720, 720), (1080, 1600), (1080, 1760)], g(60)))
    for off in (-34, -14, 14, 34):
        o.append(line(640 + off * 0.2, 720, 640 + off * 7, 1920, g(46), 3))
    # the melt line down the middle: dark and wet, the lit windows' warmth in its sheen
    o.append(grp(poly([(632, 720), (648, 720), (700, 1920), (580, 1920)], g(36)), filter='url(#rough)'))
    o.append(grp(poly([(637, 760), (643, 760), (660, 1920), (624, 1920)], HONEY_MID, opacity='0.55'), filter='url(#rough2)'))
    # the manhole puffing warm steam
    o.append(ell(646, 1280, 42, 16, g(26)))
    o.append(steam(1120, 646, 1276, 110, 300, col=g(92), op=0.6, n=8, root=HONEY, root_op=0.75, lean=0.1))
    # her side of the street (left): facades seen steeply from above, their windows (some warm already)
    o.append(poly([(0, 260), (560, 640), (560, 720), (300, 1520), (0, 1720)], g(20)))
    for r in range(7):
        for c in range(5):
            t = (c + 0.3) / 5.5
            xa = 560 - 560 * t
            ytop = 640 - 380 * t
            ybot = 720 + 1000 * t
            yy = ytop + (ybot - ytop) * (0.12 + r * 0.12)
            ww = 18 + 50 * t
            warm = t < 0.55 and rnd.random() < 0.7
            o.append(rect(xa - ww * 0.5, yy, ww * 0.5, ww * 0.8, HONEY if warm else g(13)))
    # the opposite facades (right), Jugend blocks receding; windows warming as the heat passes under them
    blocks = [(720, 1180, 320, 820), (780, 1130, 1500, 2100)]
    fac = poly([(700, 560), (700, 720), (1080, 1520), (1080, 0)], g(24))
    o.append(fac)
    rows = 6
    for r in range(rows):
        for c in range(7):
            t0 = (c + 0.2) / 7
            t1 = (c + 0.55) / 7
            def P(t, v):
                x = 700 + (1080 - 700) * t
                ytop = 560 + (0 - 560) * t
                ybot = 720 + (1520 - 720) * t
                return x, ytop + (ybot - ytop) * v
            v0, v1 = 0.12 + r * 0.14, 0.12 + r * 0.14 + 0.08
            a, b, c2, d = P(t0, v0), P(t1, v0), P(t1, v1), P(t0, v1)
            warm = t0 > 0.35 and rnd.random() < 0.85
            o.append(poly([a, b, c2, d], HONEY if warm else g(16)))
    # balconies with snow, a lamppost
    for r in range(2):
        o.append(poly([(860, 470 - r * 160), (980, 300 - r * 160), (980, 330 - r * 160), (860, 498 - r * 160)], g(66)))
    o.append(line(880, 1100, 860, 1500, g(20), 8) + circ(880, 1094, 14, g(80)))
    # a tram coming up the street, two walkers, cars under snow at the kerb
    o.append(poly([(600, 900), (650, 900), (668, 1010), (590, 1010)], g(30)) + rect(600, 920, 56, 24, g(70)))
    o.append(rect(420, 1380, 70, 34, g(80), rx='14') + rect(380, 1520, 80, 40, g(82), rx='16') + rect(430, 1218, 56, 28, g(80), rx='12'))
    o.append(circ(520, 1140, 6, g(14)) + rect(515, 1146, 10, 26, g(14)) + circ(536, 1150, 6, g(14)) + rect(531, 1156, 10, 26, g(14)))
    # the near frame: her window's sill and frame; her head and shoulder from behind, looking down; her mug
    o.append(rect(0, 1700, W, 220, g(16)) + rect(0, 1690, W, 16, g(34)))
    o.append(rect(0, 0, 70, 1700, g(14)) + rect(1010, 0, 70, 1700, g(14)))
    o.append(her_on_sill(230, 1716, 1.25, sweater=g(18), hair=g(7), skin=g(36), rim=g(50)))
    o.append(snow(1112, 260, 0, 0, W, 1700, 1.4, 4.0, op=(0.4, 0.9)))
    caption = cap('carry that heat', "into people's |*homes.")
    return defs, ''.join(o), caption


FRAMES.update({
    'D-B12': B12,
    'D-B6': B6,
    'D-B7': lambda: kitchen_window('reach'),
    'D-B8': lambda: kitchen_window('plan'),
    'D-B9': B9,
    'D-B10': B10,
    'D-B11': B11,
})


# ------------------------------------------------------------------ alternates
def B2alt():
    """Her phone, lined up with it: she holds the phone up to the window; across the bay the long data centre sits exactly
    behind it, the same size in the frame: the small thing in her hand IS that big thing over there."""
    defs = ''
    o = [rect(0, 0, W, H, g(8))]
    gx0, gy0, gx1, gy1 = 96, 166, 984, 1300
    defs += '<clipPath id="glassA"><rect x="%d" y="%d" width="%d" height="%d"/></clipPath>' % (gx0, gy0, gx1 - gx0, gy1 - gy0)
    rnd = random.Random(222)
    dc = ''
    # the data centre on the far shore: long, windowless, its rows of cool lights, big fans on the roof, a plume
    x0, x1, yt, yb = 650, 900, 982, 1040
    dc += rect(x0, yt, x1 - x0, yb - yt, g(13)) + rect(x0, yt - 6, x1 - x0, 8, g(30))
    for r in range(4):
        for q in range(26):
            if rnd.random() < 0.7:
                dc += circ(x0 + 10 + q * 12.4, yt + 16 + r * 16, 1.8, g(82))
    for k in range(5):
        dc += ell(x0 + 40 + k * 62, yt - 6, 20, 6, g(24))
    dc += steam(2221, 640, yt - 10, 160, 200, col=g(56), op=0.5, n=8, root=HONEY_DEEP, root_op=0.55, lean=0.3)
    d2, view = night_view(41, gx0, gy0, gx1, gy1, horizon=1040, warm_p=0.7, wave_left=0.0, domes_at=(230, 1044), plan=dc, roof_y=1120)
    defs += d2
    o.append('<g clip-path="url(#glassA)">' + view + '</g>')
    fr, lit = g(19), g(36)
    o.append(rect(70, 146, 940, 22, fr) + rect(70, 1298, 940, 26, fr) + rect(70, 146, 26, 1178, fr) + rect(984, 146, 26, 1178, fr))
    o.append(rect(96, 626, 888, 26, fr) + rect(96, 626, 888, 4, lit) + rect(527, 652, 26, 648, fr))
    o.append(rect(30, 1318, 1050, 34, g(31)) + rect(30, 1350, 1050, 16, g(15)))
    o.append(rect(0, 1366, W, 554, g(10)))
    o.append(radiator(420, 1386, 520, 214, n=16, warm=0.0))
    # her phone held up to the glass like a viewfinder: on its screen, the data centre across the bay, close and huge
    o.append(path('M 300 1500 C 360 1420 420 1300 470 1200 L 510 1216 C 470 1316 410 1440 350 1530 Z', g(22)))
    o.append(ell(486, 1196, 24, 20, g(34)))
    o.append(rect(380, 860, 220, 380, g(4), rx='22'))
    o.append(rect(392, 874, 196, 352, g(16), rx='14'))
    scr = rect(392, 874, 196, 352, g(10), rx='14')
    scr += rect(392, 874, 196, 120, g(18), rx='14')
    for r in range(14):
        for q in range(10):
            if rnd.random() < 0.75:
                scr += circ(404 + q * 18, 1000 + r * 16, 2.4, g(88))
    scr += rect(392, 990, 196, 6, g(40)) + steam(2223, 470, 990, 90, 100, col=g(60), op=0.5, n=5, flt='steamS', root=HONEY_DEEP, root_op=0.6)
    o.append(scr)
    o.append(rect(392, 1186, 196, 40, '#d9e6ef', rx='10') + rect(404, 1196, 90, 18, '#7d92a8', rx='8'))
    # the corner brackets of the camera view, and a line from the screen to the real building over there
    for (cx2, cy2, sx2, sy2) in ((402, 884, 1, 1), (578, 884, -1, 1), (402, 1176, 1, -1), (578, 1176, -1, -1)):
        o.append(pline([(cx2, cy2 + 22 * sy2), (cx2, cy2), (cx2 + 22 * sx2, cy2)], '#ffffff', 3, opacity='0.8'))
    o.append(her_seated_back(300, 1430, 1.15, phone=False, head_rot=4))
    caption = cap('AI runs on', '*giant| computers')
    return defs, ''.join(o), caption


def B7alt():
    """The whole block reaches: the Jugend facade across the street, windows thrown open, her and her neighbours leaning out
    toward the warm steam drifting past: Helsinki wants it."""
    defs = lin_grad('sky7a', [(0, g(8)), (1, g(22))], x1=0, y1=0, x2=0, y2=700, units=True)
    o = [rect(0, 0, W, 700, 'url(#sky7a)')]
    rnd = random.Random(77)
    # the facade: plum-dark stucco, ornament under the roof, snow on every sill
    o.append(rect(0, 640, W, 1280, g(22)))
    o.append(rect(0, 630, W, 24, g(30)) + rect(0, 650, W, 10, g(70)))
    for k in range(9):
        o.append(path('M %d 700 C %d 680 %d 680 %d 700' % (k * 130, k * 130 + 40, k * 130 + 90, k * 130 + 130), 'none', stroke=g(28), stroke_width='8'))
    cols = [120, 380, 640, 900]
    rows = [760, 1040, 1320, 1600]
    for r, wy in enumerate(rows):
        for c, wx in enumerate(cols):
            her = (r == 1 and c == 1)
            o.append(rect(wx - 74, wy, 148, 200, HONEY if her else HONEY_MID))
            o.append(rect(wx - 84, wy + 200, 168, 16, g(74)))
            # open casements
            o.append(poly([(wx - 74, wy), (wx - 120, wy - 12), (wx - 120, wy + 212), (wx - 74, wy + 200)], g(34)))
            o.append(poly([(wx + 74, wy), (wx + 120, wy - 12), (wx + 120, wy + 212), (wx + 74, wy + 200)], g(30)))
            # a neighbour leaning out, reaching (small); her window: her, reaching furthest
            sc = 0.55 if not her else 0.62
            px, py = wx, wy + 196
            body = path('M -40 0 C -44 -60 -30 -110 0 -116 C 30 -110 44 -60 40 0 Z', g(10))
            reach = 1 if (r + c) % 2 == 0 else -1
            arm = path('M %d -90 C %d -120 %d -150 %d -170 L %d -156 C %d -136 %d -110 %d -76 Z' % (
                20 * reach, 70 * reach, 110 * reach, 150 * reach, 160 * reach, 116 * reach, 76 * reach, 26 * reach), g(10))
            head = circ(0, -140, 26, g(8)) + (circ(-4, -176, 15, g(8)) if her else '')
            o.append('<g transform="translate(%s %s) scale(%s)">%s</g>' % (f(px), f(py), f(sc * 1.4), body + arm + head))
    # the warm steam drifting across the facade, the arms reaching into it
    for i, (sx, sy) in enumerate([(200, 980), (520, 900), (800, 1000), (330, 1260), (700, 1240)]):
        o.append(steam(770 + i, sx, sy, 260, 160, col=g(88), op=0.5, n=6, root=HONEY_HI, root_op=0.55, flt='steamS'))
    o.append(rect(0, 1840, W, 80, g(64)))
    o.append(snow(771, 260, 0, 0, W, H, 1.6, 4.2, op=(0.4, 0.9)))
    caption = cap('But Helsinki', '*wants| that heat.')
    return defs, ''.join(o), caption


def B8alt():
    """She draws it on the steamed glass: the kitchen window fogged by the kettles; with a fingertip she draws the plan on
    the fog, and through the cleared lines the real night shows, lined up with the empty lot across the bay."""
    defs = ''
    o = [rect(0, 0, W, H, g(52))]
    gx0, gy0, gx1, gy1 = 110, 620, 970, 1420
    defs += '<clipPath id="kwA"><rect x="%d" y="%d" width="%d" height="%d"/></clipPath>' % (gx0, gy0, gx1 - gx0, gy1 - gy0)
    d2, view = night_view(77, gx0, gy0, gx1, gy1, horizon=1060, warm_p=0.7, wave_left=0.0, domes_at=None, ships=False, roof_y=1240)
    defs += d2
    # the drawing: lines wiped clear in the fog (a mask) over the empty lot across the bay
    strokes = ''
    strokes += pline([(330, 1050), (330, 870), (820, 858), (820, 1046)], 'white', 18)
    strokes += pline([(330, 870), (390, 836), (880, 824), (820, 858)], 'white', 14)
    strokes += pline([(880, 824), (880, 1010), (820, 1046)], 'white', 14)
    for k in range(1, 5):
        xx = 330 + 98 * k
        strokes += line(xx, 868, xx, 1046, 'white', 10)
    strokes += pline([(820, 1030), (900, 1036), (960, 1040)], 'white', 16)
    defs += '<mask id="wipe"><rect x="0" y="0" width="1080" height="1920" fill="black"/>%s</mask>' % grp(strokes, filter='url(#rough2)')
    o.append('<g clip-path="url(#kwA)">' + view + '</g>')
    # the fog over the glass, with the drawn lines wiped through it
    o.append('<g clip-path="url(#kwA)">' + rect(gx0, gy0, gx1 - gx0, gy1 - gy0, g(84)) + '</g>')
    o.append('<g clip-path="url(#kwA)" mask="url(#wipe)">' + view + '</g>')
    o.append(grp(pline([(820, 1030), (900, 1036), (960, 1040)], HONEY, 6, opacity='0.85'), filter='url(#rough2)'))
    # drips running down from the lines
    for k in range(10):
        x = rnd = 340 + k * 60
        o.append(line(x, 1060, x + 2, 1100 + (k % 3) * 20, g(70), 4, opacity='0.7'))
    fr = g(26)
    o.append(rect(80, 592, 920, 30, fr) + rect(80, 1420, 920, 34, fr) + rect(80, 592, 30, 862, fr) + rect(970, 592, 30, 862, fr))
    o.append(rect(40, 1440, 1000, 42, g(70)) + rect(40, 1480, 1000, 22, g(38)))
    o.append(kettle(190, 1442, 80, body=g(32), lit=g(60), dark=g(18), face=1, steam_seed=811, steam_h=130, steam_op=0.45))
    o.append(rect(0, 1502, W, 418, g(46)))
    # her hand, the fingertip at the end of the warm pipe line, her shoulder at the right edge
    o.append(path('M 1080 1300 C 1040 1200 1000 1100 968 1050 L 952 1062 C 980 1110 1010 1210 1040 1320 Z', g(24)))
    o.append(ell(958, 1046, 14, 18, g(46)))
    o.append(path('M 1080 1250 C 1000 1300 960 1420 980 1600 L 1080 1600 Z', g(20)))
    o.append(steam_ceiling(0.75))
    caption = cap('The city has a plan,', 'starting |*next year.')
    return defs, ''.join(o), caption


def B11alt():
    """Her building ends the street: at eye level up the snowy street, the melt line runs from our feet to her door; a
    manhole breathes warm steam, the tram passes, and high on the building that closes the street, her window is warm."""
    defs = lin_grad('sky11a', [(0, g(8)), (1, g(26))], x1=0, y1=0, x2=0, y2=900, units=True)
    o = [rect(0, 0, W, 900, 'url(#sky11a)')]
    rnd = random.Random(1112)
    VPX, VPY = 540, 1130
    # her building closes the street: 5 storeys, her window warm near the top
    o.append(rect(330, 640, 420, 500, g(22)) + rect(320, 628, 440, 18, g(64)))
    for r in range(5):
        for c in range(4):
            wx, wy = 356 + c * 100, 668 + r * 92
            warm = rnd.random() < 0.22
            o.append(rect(wx, wy, 56, 64, HONEY_DEEP if warm else g(14)))
    o.append(rect(556, 668, 56, 64, HONEY_HI) + circ(584, 700, 14, g(10)) + circ(584, 682, 8, g(10)))
    o.append(rect(500, 1050, 80, 90, g(12)))
    # facades on both sides, receding to her building
    o.append(poly([(0, 300), (330, 640), (330, 1140), (0, 1700)], g(18)))
    o.append(poly([(W, 300), (750, 640), (750, 1140), (W, 1700)], g(16)))
    for side in (-1, 1):
        for r in range(6):
            for c in range(4):
                t = (c + 0.3) / 4.4
                xb = 330 if side < 0 else 750
                xe = 0 if side < 0 else W
                x = xb + (xe - xb) * t
                ytop = 640 + (300 - 640) * t
                ybot = 1140 + (1700 - 1140) * t
                yy = ytop + (ybot - ytop) * (0.08 + r * 0.14)
                ww = 20 + 70 * t
                warm = rnd.random() < 0.2
                o.append(rect(x - ww * 0.5, yy, ww * 0.55, ww * 0.9, HONEY_DEEP if warm else g(12)))
    # the street: snow, tram rails, snowbanks; the melt line from us to her door
    o.append(poly([(330, 1140), (750, 1140), (W, 1700), (W, H), (0, H), (0, 1700)], g(72)))
    for off in (-90, -40, 40, 90):
        o.append(line(VPX + off * 0.2, 1140, VPX + off * 6, 1920, g(50), 4))
    o.append(grp(poly([(530, 1140), (550, 1140), (640, 1920), (440, 1920)], g(36)), filter='url(#rough)'))
    o.append(grp(poly([(537, 1160), (543, 1160), (566, 1920), (514, 1920)], HONEY_MID, opacity='0.55'), filter='url(#rough2)'))
    o.append(ell(560, 1460, 70, 20, g(26)))
    o.append(steam(1130, 560, 1454, 160, 380, col=g(90), op=0.6, n=9, root=HONEY, root_op=0.75, lean=0.12))
    # the tram passing on the left, snowbanks, cars under snow, a walker
    o.append(rect(120, 1260, 230, 120, g(36), rx='20') + rect(140, 1280, 190, 40, g(76)) + rect(120, 1360, 230, 14, g(24)))
    o.append(ell(60, 1760, 160, 60, g(84)) + ell(1020, 1760, 160, 60, g(84)))
    o.append(rect(820, 1480, 150, 70, g(80), rx='26') + rect(830, 1540, 30, 20, g(20)) + rect(930, 1540, 30, 20, g(20)))
    o.append(circ(700, 1320, 10, g(12)) + rect(692, 1330, 16, 50, g(12)))
    o.append(snow(1113, 280, 0, 0, W, H, 1.6, 4.4, op=(0.4, 0.9)))
    caption = cap('carry that heat', "into people's |*homes.")
    return defs, ''.join(o), caption


FRAMES.update({
    'D-B2alt': B2alt,
    'D-B7alt': B7alt,
    'D-B8alt': B8alt,
    'D-B11alt': B11alt,
})


def write(fid):
    defs, body, caption = FRAMES[fid]()
    html = page(body, defs, caption, title=fid)
    os.makedirs(os.path.join(HERE, 'pages'), exist_ok=True)
    p = os.path.join(HERE, 'pages', fid + '.html')
    with open(p, 'w') as fh:
        fh.write(html)
    return p


if __name__ == '__main__':
    ids = sys.argv[1:] or list(FRAMES)
    for fid in ids:
        print(write(fid))
