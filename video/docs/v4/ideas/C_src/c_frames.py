"""Imagination C: the 12 frames + 4 alternates, each one whole 1080 x 1920 picture (value sketch + the one warm accent).

python3 c_frames.py [ids...]   -> writes pages/<id>.html (all when no ids)
"""
import math
import os
import random
import sys

from c_lib import (W, H, v, w, mix, pts, poly, path, rect, circ, ell, line, g, smooth, jit, texture, page, sky,
                   snowfall, Cam, person, caption, warm_window, steam_puff, cloud, streak, wisps)

HERE = os.path.dirname(os.path.abspath(__file__))
PAGES = os.path.join(HERE, 'pages')


# ============================================================== shared pieces of the world
def far_city(rng, y_base, y_top_max, x0, x1, col, lit_frac=0.0, lit_t=80, win_col=None, dome=None, seed_h=None):
    """The far city across the ice: a belt of blocks (tops lost into the glow), tiny windows; lit ones warm."""
    out = []
    x = x0
    while x < x1:
        bw = rng.uniform(26, 70)
        bh = rng.uniform(0.45, 1.0) * (y_base - y_top_max)
        top = y_base - bh
        roof = [(x, top + rng.uniform(0, 4)), (x + bw * 0.5, top - rng.uniform(4, 12)), (x + bw, top + rng.uniform(0, 4))]
        out.append(poly([(x, y_base)] + roof + [(x + bw, y_base)], col))
        # windows
        for yy in range(int(top + 8), int(y_base - 4), 9):
            for xx in range(int(x + 4), int(x + bw - 4), 8):
                if rng.random() < 0.55:
                    if rng.random() < lit_frac:
                        out.append(rect(xx, yy, 3.2, 4.2, w(lit_t + rng.uniform(-6, 8))))
                    else:
                        out.append(rect(xx, yy, 3.0, 4.0, win_col or mix(col, '#000000', 0.25), 0.8))
        x += bw + rng.uniform(-6, 3)
    if dome:
        dx, dy, dr, dc = dome
        out.append(path('M%.1f,%.1f Q%.1f,%.1f %.1f,%.1f Z' % (dx - dr, dy, dx, dy - dr * 1.6, dx + dr, dy), dc))
        out.append(rect(dx - dr * 0.9, dy, dr * 1.8, dr * 1.4, dc))
        out.append(line(dx, dy - dr * 1.55, dx, dy - dr * 2.3, dc, 2))
    return ''.join(out)


def jugend_block_street(cam, rng, z0, z1, h, X=12.0, depth=12.0, face=None, side=None, roof=None, snow=None,
                        lit=lambda k, j: False, lit_t=lambda k, j: 86, turret=False, door_z=None, chimneys=3,
                        win_dark=None, near_h=0.0, gable=False):
    """One Jugend block on the right of a one-point street (its facade in the plane X, from z0 to z1)."""
    out = []
    face = face or v(22)
    side = side or v(33)
    roof = roof or v(14)
    snow = snow or v(76)
    win_dark = win_dark or v(10)
    P = cam.P
    # the side wall facing us where the nearer block is lower (lit by the cool key from the left)
    if h > near_h + 0.5:
        out.append(poly([P(X, near_h, z0), P(X + depth, near_h, z0), P(X + depth, h, z0), P(X, h, z0)], side))
    # facade
    fa = [P(X, 0, z0), P(X, 0, z1), P(X, h, z1), P(X, h, z0)]
    out.append(poly(fa, face))
    # cornice line (a lighter step under the eave: snow on the cornice)
    out.append(poly([P(X - 0.25, h - 0.35, z0), P(X - 0.25, h - 0.35, z1), P(X - 0.25, h, z1), P(X - 0.25, h, z0)], snow, 0.75))
    # roof: from the eave back and up to the ridge
    rh = 5.0 if not gable else 7.0
    out.append(poly([P(X, h, z0), P(X, h, z1), P(X + 6, h + rh, z1), P(X + 6, h + rh, z0)], roof))
    out.append(poly([P(X + 4.6, h + rh * 0.78, z0), P(X + 4.6, h + rh * 0.78, z1), P(X + 6, h + rh, z1), P(X + 6, h + rh, z0)], snow, 0.9))
    # snow on the near roof edge (the eave's cap, seen from below as a light lip)
    out.append(poly([P(X - 0.2, h, z0), P(X - 0.2, h, z1), P(X + 0.8, h + 0.75, z1), P(X + 0.8, h + 0.75, z0)], snow))
    # chimneys
    for i in range(chimneys):
        zc = z0 + (z1 - z0) * (i + 0.6) / (chimneys + 0.2)
        cw = 0.9
        out.append(poly([P(X + 6, h + rh, zc), P(X + 6, h + rh, zc + cw), P(X + 6, h + rh + 1.8, zc + cw), P(X + 6, h + rh + 1.8, zc)], roof))
        out.append(poly([P(X + 5.9, h + rh + 1.8, zc), P(X + 5.9, h + rh + 1.8, zc + cw), P(X + 6.1, h + rh + 2.1, zc + cw), P(X + 6.1, h + rh + 2.1, zc)], snow))
    # windows: floors every 3.3 m from 3.6 m, along Z every 3.4 m
    floors = int((h - 3.2) / 3.3)
    zz = z0 + 1.6
    j = 0
    while zz + 1.3 < z1 - 0.8:
        for k in range(floors):
            y0 = 3.4 + k * 3.3
            q = [P(X - 0.05, y0, zz), P(X - 0.05, y0, zz + 1.25), P(X - 0.05, y0 + 1.9, zz + 1.25), P(X - 0.05, y0 + 1.9, zz)]
            if lit(k, j) and min(p[1] for p in q) > 640:
                t = lit_t(k, j)
                xs = [p[0] for p in q]
                ys = [p[1] for p in q]
                cx_, cy_ = sum(xs) / 4, sum(ys) / 4
                wd = max(xs) - min(xs)
                ht = max(ys) - min(ys)
                out.append(ell(cx_, cy_, wd * 1.6 + 4, ht * 0.9 + 3, w(72), 0.45, extra='filter="url(#gM)"'))
                out.append(poly(q, w(t)))
            else:
                out.append(poly(q, win_dark))
            # snow on the sill
            out.append(poly([P(X - 0.3, y0 - 0.12, zz - 0.1), P(X - 0.3, y0 - 0.12, zz + 1.35), P(X - 0.05, y0, zz + 1.35), P(X - 0.05, y0, zz - 0.1)], snow, 0.8))
        zz += 3.4
        j += 1
    # the ground-floor door
    if door_z is not None:
        out.append(poly([P(X - 0.05, 0, door_z), P(X - 0.05, 0, door_z + 1.6), P(X - 0.05, 2.6, door_z + 1.6), P(X - 0.05, 2.6, door_z)], v(8)))
    if turret:
        tz = z0 + 0.4
        r = 2.2
        base_y = h - 7
        top_y = h + 2.4
        a = P(X - 0.6, base_y, tz)
        b = P(X - 0.6, base_y, tz + 2 * r)
        c = P(X - 0.6, top_y, tz + 2 * r)
        d = P(X - 0.6, top_y, tz)
        out.append(poly([a, b, c, d], mix(face, side, 0.45)))
        apex = P(X + 0.6, top_y + 5.5, tz + r)
        out.append(poly([d, c, apex], roof))
        out.append(poly([(d[0], d[1]), ((d[0] + c[0]) / 2, (d[1] + c[1]) / 2), apex], snow, 0.55))
        # turret windows
        for k in range(2):
            yy = base_y + 1.4 + k * 3.0
            q = [P(X - 0.7, yy, tz + 1.4), P(X - 0.7, yy, tz + 2.6), P(X - 0.7, yy + 1.7, tz + 2.6), P(X - 0.7, yy + 1.7, tz + 1.4)]
            out.append(poly(q, w(84) if (lit(99, k) and min(p[1] for p in q) > 640) else win_dark))
    return ''.join(out)


def pov_phone(x, y, scale=1.0, sent=False, glove=None, case=None):
    """Your gloved hand from the bottom LEFT holding your phone; the screen a cool light, chat bubbles, no words."""
    s = scale
    glove = glove or v(13)
    case = case or v(6)
    out = []
    # forearm/sleeve from the bottom-left edge
    out.append(path(smooth([(x - 230 * s, H + 40), (x - 150 * s, y + 250 * s), (x - 40 * s, y + 140 * s), (x + 70 * s, y + 175 * s),
                            (x + 60 * s, y + 300 * s), (x - 40 * s, H + 60)], closed=True), mix(glove, v(20), 0.4)))
    # phone (tilted)
    pw, ph = 170 * s, 300 * s
    ang = -8
    out.append('<g transform="rotate(%d %.1f %.1f)">' % (ang, x + pw / 2, y + ph / 2))
    out.append(rect(x - 6 * s, y - 6 * s, pw + 12 * s, ph + 12 * s, case, rx=26 * s))
    out.append(rect(x, y, pw, ph, v(80), rx=20 * s))
    out.append(rect(x, y, pw, ph, '#bfe3f0', 0.10, rx=20 * s))
    # chat bubbles (no words): theirs left, yours right
    out.append(rect(x + 14 * s, y + 46 * s, 98 * s, 30 * s, v(95), rx=14 * s))
    out.append(rect(x + 58 * s, y + 92 * s, 98 * s, 30 * s, v(62), rx=14 * s))
    out.append(rect(x + 14 * s, y + 138 * s, 120 * s, 46 * s, v(95), rx=16 * s))
    if sent:
        out.append(rect(x + 48 * s, y + 200 * s, 108 * s, 30 * s, v(62), rx=14 * s))
        for i in range(3):
            out.append(circ(x + 30 * s + i * 14 * s, y + 262 * s, 4.5 * s, v(70)))
    else:
        out.append(rect(x + 70 * s, y + 200 * s, 86 * s, 30 * s, v(62), rx=14 * s))
    out.append('</g>')
    # glove: thumb over the side, fingers behind
    out.append(path(smooth([(x - 40 * s, y + 330 * s), (x - 30 * s, y + 160 * s), (x + 10 * s, y + 120 * s), (x + 40 * s, y + 160 * s),
                            (x + 30 * s, y + 250 * s), (x + 100 * s, y + 300 * s), (x + 150 * s, y + 360 * s), (x + 60 * s, y + 420 * s),
                            (x - 20 * s, y + 420 * s)], closed=True), glove))
    out.append(path(smooth([(x + 150 * s, y + 250 * s), (x + 196 * s, y + 262 * s), (x + 200 * s, y + 300 * s), (x + 160 * s, y + 320 * s)], closed=True), glove))
    out.append(path(smooth([(x + 150 * s, y + 310 * s), (x + 192 * s, y + 322 * s), (x + 194 * s, y + 356 * s), (x + 150 * s, y + 366 * s)], closed=True), glove))
    # the screen's cool spill on the glove
    out.append(ell(x + 60 * s, y + 200 * s, 90 * s, 70 * s, v(80), 0.10, extra='filter="url(#gM)"'))
    return ''.join(out)


def hung_lamp(x, y, r=7):
    return (circ(x, y, r * 4, v(86), 0.12, extra='filter="url(#gM)"') + circ(x, y + r * 0.2, r, v(97)) +
            path('M%.1f,%.1f L%.1f,%.1f L%.1f,%.1f Z' % (x - r * 1.6, y - r * 0.2, x + r * 1.6, y - r * 0.2, x, y - r * 1.4), v(30)))


# ============================================================== THE STREET OF HOMES (B1, B12, alt shared)
def street_of_homes(rng, cam, bloom=1.0, seam=True, seam_t=1.0, phone=True, phone_sent=False, people=True,
                    far_lit=0.9, question=False, tram=True):
    P = cam.P
    out = []
    # sky
    out.append(sky(v(12), v(19), v(36), v(64), cam.cy, glow=(330, 330, 120, v(72), 0.55)))
    out.append('<defs><linearGradient id="snowg" x1="0" y1="%.0f" x2="0" y2="%d" gradientUnits="userSpaceOnUse">'
               '<stop offset="0" stop-color="%s"/><stop offset="0.10" stop-color="%s"/><stop offset="1" stop-color="%s"/>'
               '</linearGradient></defs>' % (cam.cy, H, v(66), v(55), v(33)))
    out.append(rect(0, cam.cy - 2, W, H - cam.cy + 2, 'url(#snowg)'))
    # the hero snow cloud (top left, its underside lit by the city's glow) and soft streaks low in the sky
    out.append(cloud(250, 190, 640, 180, v(22), v(38), rng, n=11))
    out.append(streak(-40, 760, 520, 40, v(30), 0.55))
    out.append(streak(120, 880, 640, 30, v(40), 0.45))
    out.append(streak(-30, 1010, 380, 24, v(50), 0.5))
    # far city across the harbour (left), the cathedral's dome among its roofs
    hz = cam.cy
    out.append(far_city(rng, hz + 6, hz - 70, -20, 520, v(44), lit_frac=far_lit * 0.55, lit_t=78,
                        dome=(250, hz - 52, 16, v(40))))
    # the harbour: plate ice from the quay out to the far shore
    ice_top = hz + 6
    q_near = P(-7, -1.2, 9)
    out.append(poly([(0, ice_top), (540, ice_top), P(-7, -1.2, 400), P(-7, -1.2, 9), (0, q_near[1] + 40)], v(56)))
    # ice plates (cracks)
    for i in range(60):
        Z = math.exp(rng.uniform(math.log(14), math.log(380)))
        X = rng.uniform(-9 - Z * 0.9, -7.5)
        a = P(X, -1.2, Z)
        if a[0] < -10 or a[0] > 560:
            continue
        b = P(X + rng.uniform(-6, 6), -1.2, Z * rng.uniform(1.05, 1.25))
        out.append(line(a[0], a[1], b[0], b[1], v(44), max(0.8, 6 / Z * 3), 0.7))
    for i in range(14):
        Z = rng.uniform(16, 120)
        X = rng.uniform(-30, -9)
        c = P(X, -1.2, Z)
        if c[0] < 0:
            continue
        out.append(ell(c[0], c[1], 900 / Z, 180 / Z, v(64), 0.5))
    # glow of the far city's lit windows in the ice (reflection)
    if far_lit > 0:
        out.append(rect(30, hz + 10, 480, 26, w(70), 0.22 * far_lit, extra='filter="url(#gM)"'))
    # the moored icebreaker (far left, at the quay)
    ib = [P(-9, -1.2, 70), P(-9, -1.2, 120), P(-9, 3.5, 120), P(-9, 4.5, 72)]
    out.append(poly(ib, v(16)))
    sup = [P(-10, 4.0, 82), P(-10, 4.0, 104), P(-10, 9.5, 102), P(-10, 9.5, 86)]
    out.append(poly(sup, v(70)))
    fn = [P(-11, 9.5, 92), P(-11, 9.5, 96), P(-11, 13, 96), P(-11, 13, 92)]
    out.append(poly(fn, v(30)))
    for zz in (86, 90, 95, 99):
        a = P(-10.05, 7.0, zz)
        out.append(rect(a[0] - 1.2, a[1] - 1.2, 2.6, 2.4, v(92)))
    # the working edge at the street's end (the vanishing point): a long dark hall with a row of tiny cool lights
    hall = [P(-14, 0, 300), P(40, 0, 300), P(40, 11, 300), P(-14, 11, 300)]
    out.append(poly(hall, v(20)))
    for xx in range(-12, 38, 3):
        a = P(xx, 7.5, 299)
        out.append(circ(a[0], a[1], 1.5, v(92), 0.9))
    # blocks on the right (the street of homes)
    specs = [(20, 33, 19.5, True), (33, 47, 17.5, False), (47, 60, 21.0, False), (60, 74, 18.0, True), (74, 92, 19.0, False),
             (92, 112, 17.0, False), (112, 140, 20.0, False), (140, 175, 18.0, False), (175, 230, 19.0, False), (230, 300, 17.0, False)]
    faces = [v(24), v(21), v(26), v(22), v(25), v(23), v(27), v(25), v(28), v(30)]
    blocks = []
    prev_h = 0.0
    # draw far to near so near overlaps
    order = list(range(len(specs)))[::-1]
    for i in order:
        z0, z1, h, tur = specs[i]
        near_h = specs[i - 1][2] if i > 0 else 0.0
        # the wave: lit windows, near blocks bloom fully (bloom=1)
        def litf(k, j, i=i):
            r = random.Random(i * 1000 + k * 37 + j)
            return r.random() < (0.8 * bloom if i < 8 else 0.7 * bloom)
        def ltf(k, j, i=i):
            r = random.Random(i * 77 + k * 5 + j)
            return 80 + r.uniform(-6, 10)
        door = z0 + (z1 - z0) * 0.45
        blocks.append(jugend_block_street(cam, rng, z0, z1, h, face=faces[i], side=mix(faces[i], v(44), 0.5),
                                          lit=litf, lit_t=ltf, turret=tur, door_z=door, near_h=near_h,
                                          chimneys=2 if z1 - z0 < 16 else 3, gable=(i == 2)))
    out.extend(blocks)
    # the street: pavement (right), kerb, the snowy street, the quay edge (left)
    out.append(poly([P(10.5, 0, 6), P(12, 0, 6), P(12, 0, 300), P(10.5, 0, 300)], v(58)))
    # footprints and tyre tracks running into the picture (tone-on-tone)
    for k in range(70):
        Z = math.exp(rng.uniform(math.log(3.0), math.log(60)))
        X = rng.choice([-5.5, -4.8, 4.6, 5.3, 8.0, 8.6]) + rng.uniform(-0.3, 0.3)
        a = P(X, 0, Z)
        r_ = max(1.2, 70 / Z)
        out.append(ell(a[0], a[1], r_ * 1.4, r_ * 0.5, v(26), 0.35))
    # the quay edge: granite with snow, bollards
    out.append(poly([P(-7, 0, 4), P(-7, 0, 300), P(-7, -1.2, 300), P(-7, -1.2, 4)], v(30)))
    out.append(poly([P(-7.4, 0.05, 4), P(-7.4, 0.05, 300), P(-6.4, 0.05, 300), P(-6.4, 0.05, 4)], v(70)))
    for zz in (12, 22, 34, 48, 66, 90, 130, 180):
        a = P(-6.8, 0, zz)
        b = P(-6.8, 0.7, zz)
        r_ = max(2, 300 / zz)
        out.append(rect(a[0] - r_, b[1], 2 * r_, a[1] - b[1], v(14)))
        out.append(ell(a[0], b[1], r_ * 1.1, r_ * 0.45, v(78)))
    # tram rails (converging), tyre tracks, footprints
    for X in (1.2, 2.6):
        a, b = P(X, 0, 5), P(X, 0, 300)
        out.append(line(a[0], a[1], b[0], b[1], v(30), 3.0, 0.8))
    for X in (5.5, 7.2, -3.5, -2.2):
        a, b = P(X, 0, 4), P(X, 0, 300)
        out.append(line(a[0], a[1], b[0], b[1], v(44), 9, 0.35))
    # the tram at its stop (cool lit windows, tone-on-tone)
    if tram:
        tz0, tz1 = 58, 84
        back = [P(0.6, 0.3, tz0), P(3.3, 0.3, tz0), P(3.3, 3.7, tz0), P(0.6, 3.7, tz0)]
        sidep = [P(0.6, 0.3, tz0), P(0.6, 0.3, tz1), P(0.6, 3.7, tz1), P(0.6, 3.7, tz0)]
        out.append(poly(sidep, v(36)))
        out.append(poly(back, v(42)))
        bw_ = back[1][0] - back[0][0]
        out.append(rect(back[0][0] + bw_ * 0.12, back[3][1] + (back[0][1] - back[3][1]) * 0.18, bw_ * 0.76, (back[0][1] - back[3][1]) * 0.32, v(84)))
        out.append(rect(back[0][0], back[3][1] + (back[0][1] - back[3][1]) * 0.62, bw_, (back[0][1] - back[3][1]) * 0.08, v(70)))
        for zz in range(tz0 + 2, tz1 - 2, 4):
            q = [P(0.58, 1.9, zz), P(0.58, 1.9, zz + 2.6), P(0.58, 3.0, zz + 2.6), P(0.58, 3.0, zz)]
            out.append(poly(q, v(78)))
        pa = P(2.0, 3.7, tz0 + 6)
        pb = P(2.0, 6.4, tz0 + 9)
        out.append(line(pa[0], pa[1], pb[0], pb[1], v(20), 1.5))
        out.append(poly([P(0.6, 3.7, tz0), P(3.3, 3.7, tz0), P(3.3, 3.9, tz1), P(0.6, 3.9, tz1)], v(80), 0.85))
    # overhead: the tram wire and the hung lamps on their cross-wires
    for X in (2.0,):
        a, b = P(X, 6.4, 12), P(X, 6.4, 300)
        out.append(line(a[0], a[1], b[0], b[1], v(10), 1.6, 0.85))
    for zz in (13, 24, 40, 62, 95, 140):
        a, b = P(-6.5, 7.6, zz), P(12, 7.9, zz)
        mid = P(2.6, 6.9, zz)
        out.append(path('M%.1f,%.1f Q%.1f,%.1f %.1f,%.1f' % (a[0], a[1], mid[0], mid[1] + 16 / zz * 10, b[0], b[1]), 'none', v(10), max(0.8, 18 / zz)))
        out.append(hung_lamp(mid[0], mid[1] + 12 / zz * 10, r=max(2.2, 90 / zz)))
    # people: a couple stopped on the right pavement, looking down at the glowing snow
    if people:
        for (X, Z, hh, pose) in ((9.2, 30, 1.75, 'stand'), (10.0, 31, 1.65, 'stand')):
            fx, fy = P(X, 0, Z)
            top = P(X, hh, Z)
            out.append(person(fx, fy, fy - top[1], v(10), rim=(v(40), -1), pose=pose, cap=True))
        X, Z = 8.4, 52
        fx, fy = P(X, 0, Z)
        top = P(X, 1.7, Z)
        out.append(person(fx, fy, fy - top[1], v(12), pose='walk', cap=True))
    # THE SEAM: the heat under the snow, from the far hall to us, turning in at the doors
    if seam:
        X0, X1 = -0.11, 0.11
        zs = [1.7, 2.2, 3.2, 4.5, 7, 11, 18, 30, 50, 85, 140, 210, 300]
        left = [P(X0, 0, z) for z in zs]
        right = [P(X1, 0, z) for z in zs][::-1]
        sp = left + right
        out.append(poly(sp, w(66), 0.75, extra='filter="url(#gL)"'))
        out.append(poly(sp, w(80), 0.85, extra='filter="url(#gM)"'))
        out.append(poly(sp, w(92)))
        core_l = [P(-0.035, 0, z) for z in zs]
        core_r = [P(0.035, 0, z) for z in zs][::-1]
        out.append(poly(core_l + core_r, w(100), 0.9))
        # wet melt edges
        for X in (X0 - 0.22, X1 + 0.22):
            a, b = P(X, 0, 1.8), P(X, 0, 300)
            out.append(line(a[0], a[1], b[0], b[1], v(30), 5, 0.45))
        # a manhole on the line breathing warm steam (the heat meeting the cold)
        mh = P(0, 0, 16)
        out.append(ell(mh[0], mh[1], 34, 7, v(20), 0.9))
        out.append(steam_puff(mh[0] + 6, mh[1] - 60, 34, 60, w(84), 0.55))
        out.append(steam_puff(mh[0] + 14, mh[1] - 120, 26, 40, v(80), 0.35))
        # branches to the doors (across the street, under the tracks)
        for i, (z0, z1, h, tur) in enumerate(specs[:7]):
            dz = z0 + (z1 - z0) * 0.45 + 0.8
            br = [P(X1, 0, dz - 0.18), P(12, 0, dz - 0.14), P(12, 0, dz + 0.14), P(X1, 0, dz + 0.18)]
            out.append(poly(br, w(72), 0.8, extra='filter="url(#gS)"'))
            out.append(poly(br, w(90), 1.0))
            # the door glows where the heat goes in
            dq = [P(11.95, 0, z0 + (z1 - z0) * 0.45), P(11.95, 0, z0 + (z1 - z0) * 0.45 + 1.6), P(11.95, 2.6, z0 + (z1 - z0) * 0.45 + 1.6), P(11.95, 2.6, z0 + (z1 - z0) * 0.45)]
            out.append(poly(dq, w(76), 0.85))
        # the source: a warm breath at the hall where the seam starts
        src = P(-2.5, 0.5, 298)
        out.append(ell(src[0], src[1], 24, 10, w(80), 0.8, extra='filter="url(#gM)"'))
    # snowfall
    out.append(snowfall(rng, n=170))
    # the question: a cool spark leaving your phone down the street
    if question:
        a = (520, 1180)
        out.append(circ(a[0], a[1], 18, v(96), 0.35, extra='filter="url(#gM)"') + circ(a[0], a[1], 5, v(100)))
    if phone:
        out.append(pov_phone(250, 1300, scale=0.92, sent=phone_sent))
    return ''.join(out)


# ============================================================== frames
def f_B1(rng):
    cam = Cam(f=1000, cx=540, cy=1150, eye=1.6)
    body = street_of_homes(rng, cam, bloom=1.0, seam=True, phone=True)
    body += caption([[('wants AI to heat', False)], [('70,000', True), (' homes?', False)]])
    return body + texture()



# ============================================================== THE STREET OF COMPUTERS (B2-B5)
def hall_aisle(rng, cam, warm_z=7.0, warm_amt=1.0, spark=True, engineer=True, teabags=False):
    P = cam.P
    out = []
    # the hall's dark ceiling (the band's calm field) down to the far wall
    out.append('<defs><linearGradient id="ceil" x1="0" y1="0" x2="0" y2="1">'
               '<stop offset="0" stop-color="%s"/><stop offset="0.6" stop-color="%s"/><stop offset="1" stop-color="%s"/>'
               '</linearGradient></defs>' % (v(9), v(14), v(24)))
    out.append(rect(0, 0, W, cam.cy, 'url(#ceil)'))
    # floor: perforated tiles, a cool sheen down the middle from the lamps
    out.append('<defs><linearGradient id="floorg" x1="0" y1="%.0f" x2="0" y2="%d" gradientUnits="userSpaceOnUse">'
               '<stop offset="0" stop-color="%s"/><stop offset="1" stop-color="%s"/></linearGradient></defs>' % (cam.cy, H, v(40), v(22)))
    out.append(rect(0, cam.cy, W, H - cam.cy, 'url(#floorg)'))
    sheen = [P(-0.5, 0, 2.0), P(0.5, 0, 2.0), P(0.25, 0, 60), P(-0.25, 0, 60)]
    out.append(poly(sheen, v(58), 0.35, extra='filter="url(#gM)"'))
    for X in (-1.2, -0.6, 0, 0.6, 1.2):
        a, b = P(X, 0, 1.6), P(X, 0, 62)
        out.append(line(a[0], a[1], b[0], b[1], v(18), 1.6, 0.6))
    z = 2.0
    while z < 62:
        a, b = P(-1.7, 0, z), P(1.7, 0, z)
        out.append(line(a[0], a[1], b[0], b[1], v(18), max(0.6, 5 / z), 0.6))
        z += 0.6
    # the far wall with the loading door open on the snowy night
    fw = [P(-6, 0, 62), P(6, 0, 62), P(6, 7, 62), P(-6, 7, 62)]
    out.append(poly(fw, v(20)))
    door = [P(-1.5, 0, 62), P(1.5, 0, 62), P(1.5, 3.4, 62), P(-1.5, 3.4, 62)]
    out.append(poly(door, v(40)))
    dx0, dy1 = door[0]
    dx1, dy0 = door[2]
    out.append(rect(dx0, dy0 + (dy1 - dy0) * 0.62, dx1 - dx0, (dy1 - dy0) * 0.38, v(56)))
    for i in range(18):
        out.append(circ(rng.uniform(dx0, dx1), rng.uniform(dy0, dy1), 1.2, v(92), 0.8))
    out.append(poly(door, v(60), 0.15, extra='filter="url(#gM)"'))
    # ceiling lamps in rows (cool), from 12 m on (the band stays calm)
    for X in (-1.0, 1.0):
        zz = 12
        while zz < 60:
            q = [P(X - 0.25, 6.2, zz), P(X + 0.25, 6.2, zz), P(X + 0.25, 6.2, zz + 1.2), P(X - 0.25, 6.2, zz + 1.2)]
            out.append(poly(q, v(80), 0.9))
            zz += 4
    # cable trays above the racks
    for X in (-1.75, 1.75):
        sgn = 1 if X > 0 else -1
        q = [P(X - 0.25 * sgn, 4.0, 6.0), P(X - 0.25 * sgn, 4.0, 62), P(X + 0.3 * sgn, 4.2, 62), P(X + 0.3 * sgn, 4.2, 6.0)]
        out.append(poly(q, v(30)))
    # the racks: both sides, giant (3.1 m), fronts facing the aisle
    for side in (-1, 1):
        X = 1.7 * side
        zz = 2.4
        n = 0
        while zz < 61:
            zw = 0.62
            RH = 3.6
            front = [P(X, 0, zz), P(X, 0, zz + zw), P(X, RH, zz + zw), P(X, RH, zz)]
            is_warm = side == 1 and abs(zz - warm_z) < 0.31
            col = v(13 + (n % 3)) if not is_warm else v(16)
            out.append(poly(front, col))
            # the gap/edge between racks (a lighter frame edge)
            e = [P(X - 0.01 * side, 0, zz), P(X - 0.01 * side, RH, zz)]
            out.append(line(e[0][0], e[0][1], e[1][0], e[1][1], v(30), max(0.6, 3 / zz), 0.8))
            # status lights: tiny cool dots in two columns
            if zz < 48:
                for row in range(22):
                    yy = 0.35 + row * 0.17
                    for cz in (0.14, 0.31, 0.48):
                        if rng.random() < 0.42:
                            continue
                        a = P(X - 0.02 * side, yy, zz + cz)
                        out.append(circ(a[0], a[1], max(0.8, 5.0 / zz), v(96), 0.95))
                if zz < 14:
                    mid_ = P(X - 0.02 * side, RH * 0.5, zz + 0.3)
                    out.append(ell(mid_[0], mid_[1], 26 / zz * 6, 160 / zz * 6, v(70), 0.10, extra='filter="url(#gM)"'))
            # tops
            tp = [P(X, RH, zz), P(X, RH, zz + zw), P(X + 1.1 * side, RH, zz + zw), P(X + 1.1 * side, RH, zz)]
            out.append(poly(tp, v(24)))
            if teabags and zz < 30:
                tg = P(X - 0.05 * side, RH, zz + 0.3)
                tb = P(X - 0.05 * side, 2.2, zz + 0.3)
                out.append(line(tg[0], tg[1], tb[0], tb[1], v(70), max(0.8, 4 / zz)))
                sz = max(4, 90 / zz)
                out.append(rect(tb[0] - sz * 0.35, tb[1], sz * 0.7, sz * 0.9, v(88)))
                out.append(steam_puff(tg[0], tg[1] - 40 / zz * 6, 70 / zz * 3, 110 / zz * 3, v(78), 0.4))
            zz += zw + (0.05 if (n + 1) % 10 else 1.6)
            n += 1
    # THE HEAT IS BORN: the one computer answering your question wakes warm
    if warm_amt > 0:
        X = 1.7
        z0 = warm_z - 0.3
        front = [P(X - 0.02, 0.2, z0), P(X - 0.02, 0.2, z0 + 0.62), P(X - 0.02, 3.45, z0 + 0.62), P(X - 0.02, 3.45, z0)]
        out.append(poly(front, w(70), 0.9 * warm_amt, extra='filter="url(#gL)"'))
        out.append(poly(front, w(84), 0.95 * warm_amt))
        # grille lines across it
        for k in range(14):
            yy = 0.4 + k * 0.22
            a, b = P(X - 0.03, yy, z0 + 0.05), P(X - 0.03, yy, z0 + 0.57)
            out.append(line(a[0], a[1], b[0], b[1], w(55), 1.4, 0.7))
        # warm pool on the floor, warm wash on the facing racks, heat rising off its top
        pool = [P(0.0, 0, z0 - 1.2), P(1.7, 0, z0 - 0.6), P(1.7, 0, z0 + 1.3), P(0.0, 0, z0 + 2.0)]
        out.append(poly(pool, w(70), 0.35 * warm_amt, extra='filter="url(#gL)"'))
        top = P(X + 0.3, 3.6, z0 + 0.3)
        out.append(wisps(top[0] - 6, top[1], 90 * warm_amt, 4, w(84), 10, rng, spread=14, op=0.3 * warm_amt))
        fl = [P(-1.69, 0.5, z0 - 0.8), P(-1.69, 0.5, z0 + 1.6), P(-1.69, 3.2, z0 + 1.6), P(-1.69, 3.2, z0 - 0.8)]
        out.append(poly(fl, w(60), 0.25 * warm_amt, extra='filter="url(#gM)"'))
    # the question arriving: a cool spark with its trail, flying in to the warm computer
    if spark:
        tgt = P(1.6, 2.6, warm_z)
        src = (300, 1060)
        d = 'M%.1f,%.1f Q%.1f,%.1f %.1f,%.1f' % (src[0], src[1], 560, 820, tgt[0] - 10, tgt[1])
        out.append(path(d, 'none', v(96), 10, 0.25, extra='filter="url(#gS)"'))
        out.append(path(d, 'none', v(98), 3.0, 0.7, extra='stroke-dasharray="2 14"'))
        out.append(circ(tgt[0] - 10, tgt[1], 30, v(98), 0.5, extra='filter="url(#gM)"'))
        out.append(circ(tgt[0] - 10, tgt[1], 8, v(100)))
    if engineer:
        fx, fy = P(0.35, 0, 11.5)
        tp = P(0.35, 1.72, 11.5)
        out.append(person(fx, fy, fy - tp[1], v(8), rim=(v(52), -1), pose='walk', cap=True, scarf=v(30)))
    return ''.join(out)


def f_B2(rng):
    cam = Cam(f=900, cx=540, cy=1200, eye=1.5)
    body = hall_aisle(rng, cam, warm_z=7.2)
    body += caption([[('AI actually runs on', False)], [('giant', True), (' computers', False)]], size=98)
    return body + texture()


def rack_front(x0, y0, rw, rh, rng, state='cool', glow=1.0):
    """One giant computer seen from the front: a dark cabinet, a grille, rows of status lights.
    state: cool | hot | open | teapot"""
    out = []
    out.append(rect(x0 - 10, y0 - 14, rw + 20, rh + 14, v(10)))
    out.append(rect(x0 - 10, y0 - 14, rw + 20, 16, v(28)))
    if state == 'open':
        return ''.join(out)
    hot = state in ('hot', 'teapot')
    if hot:
        out.append(rect(x0, y0, rw, rh, w(60), 0.6 * glow, extra='filter="url(#gL)"'))
    # the door: a grille of small holes
    out.append(rect(x0, y0, rw, rh, v(14)))
    cols, rows = 22, 52
    for r_ in range(rows):
        for c_ in range(cols):
            cx_ = x0 + 14 + c_ * (rw - 28) / (cols - 1)
            cy_ = y0 + 20 + r_ * (rh - 40) / (rows - 1)
            if hot:
                # hotter toward the middle and the top
                d = math.hypot((cx_ - (x0 + rw / 2)) / (rw / 2), (cy_ - (y0 + rh * 0.42)) / (rh * 0.6))
                t = max(0, 1 - d) * glow
                if state == 'teapot':
                    t *= 0.45
                if t > 0.05:
                    out.append(circ(cx_, cy_, 3.4, w(55 + 45 * t), min(1, 0.25 + t)))
                else:
                    out.append(circ(cx_, cy_, 2.6, v(22)))
            else:
                out.append(circ(cx_, cy_, 2.6, v(22)))
    # status light column at the left edge
    for k in range(18):
        yy = y0 + 40 + k * (rh - 80) / 17
        if hot and k < int(18 * glow * (0.8 if state == 'hot' else 0.3)):
            out.append(circ(x0 + 8, yy, 4.5, w(86)))
            out.append(circ(x0 + 8, yy, 10, w(80), 0.4, extra='filter="url(#gS)"'))
        else:
            out.append(circ(x0 + 8, yy, 4.0, v(94)))
    # handle
    out.append(rect(x0 + rw - 22, y0 + rh * 0.42, 9, 90, v(40), rx=4))
    return ''.join(out)


def hall_front_bg(rng, horizon=1260, kettle_glow=0.0):
    """The aisle seen across: the facing row of computers, the floor, the ceiling (the band calm)."""
    out = []
    out.append('<defs><linearGradient id="ceil2" x1="0" y1="0" x2="0" y2="1">'
               '<stop offset="0" stop-color="%s"/><stop offset="0.55" stop-color="%s"/><stop offset="1" stop-color="%s"/>'
               '</linearGradient></defs>' % (v(9), v(14), v(20)))
    out.append(rect(0, 0, W, H, 'url(#ceil2)'))
    # cable tray running across above the row
    out.append(rect(0, 640, W, 26, v(26)))
    out.append(rect(0, 666, W, 6, v(36)))
    for xx in range(-20, W, 64):
        out.append(rect(xx, 640, 6, 26, v(18)))
    # floor
    out.append('<defs><linearGradient id="fl2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="%s"/>'
               '<stop offset="1" stop-color="%s"/></linearGradient></defs>' % (v(34), v(20)))
    out.append(rect(0, 1640, W, H - 1640, 'url(#fl2)'))
    for k in range(9):
        yy = 1640 + (k ** 1.6) * 6
        out.append(line(0, yy, W, yy, v(16), 1.5, 0.6))
    for k in range(-8, 9):
        out.append(line(540 + k * 70, 1640, 540 + k * 260, H, v(16), 1.5, 0.5))
    return ''.join(out)


def side_racks(rng, y0=700, y1=1640, xs=((-300, 250), (830, 1380))):
    out = []
    for (a, b) in xs:
        out.append(rect(a, y0, b - a, y1 - y0, v(11)))
        for xx in range(a + 20, b - 10, 28):
            for yy in range(y0 + 40, y1 - 30, 46):
                if rng.random() < 0.55:
                    out.append(circ(xx, yy, 3.2, v(92), 0.85))
        out.append(rect(a, y0 - 10, b - a, 12, v(26)))
    return ''.join(out)


def f_B3(rng):
    out = [hall_front_bg(rng)]
    out.append(side_racks(rng, y0=700, y1=1650, xs=((-300, 262), (818, 1380))))
    x0, y0, rw, rh = 300, 720, 500, 920
    out.append(rack_front(x0, y0, rw, rh, rng, state='hot', glow=1.35))
    # the heat climbing off its top: warm air shimmering up, bending the cool lights behind
    out.append(ell(550, 700, 300, 60, w(76), 0.55, extra='filter="url(#gL)"'))
    out.append(g([wisps(550, 712, 120, 9, w(88), 18, rng, spread=200, op=0.6)], 'filter="url(#shimmer)"'))
    out.append(wisps(550, 712, 100, 6, w(96), 6, rng, spread=180, op=0.7))
    # warm spill on the floor in front of it
    out.append(ell(550, 1700, 360, 70, w(70), 0.45, extra='filter="url(#gL)"'))
    # the engineer, turned to it, tugging at her collar (rim lit warm by it)
    out.append(person(915, 1665, 440, v(7), rim=(w(78), -1), pose='shield', facing=-1, cap=True, scarf=v(26)))
    out.append(caption([[('Those computers get', False)], [('really ', False), ('hot.', True)]], size=98))
    return ''.join(out) + texture()


def kettle(cx, base_y, s, body, lid, glow_t=None, steam=True):
    out = []
    if glow_t is not None:
        out.append(ell(cx, base_y - s * 0.45, s * 0.75, s * 0.55, w(glow_t), 0.5, extra='filter="url(#gM)"'))
    body_p = smooth([(cx - s * 0.48, base_y), (cx - s * 0.52, base_y - s * 0.45), (cx - s * 0.3, base_y - s * 0.78),
                     (cx + s * 0.3, base_y - s * 0.78), (cx + s * 0.52, base_y - s * 0.45), (cx + s * 0.48, base_y)], closed=True)
    out.append(path(body_p, body))
    out.append(path('M%.1f,%.1f Q%.1f,%.1f %.1f,%.1f' % (cx + s * 0.45, base_y - s * 0.4, cx + s * 0.75, base_y - s * 0.55, cx + s * 0.82, base_y - s * 0.85), 'none', body, s * 0.12))
    out.append(path('M%.1f,%.1f Q%.1f,%.1f %.1f,%.1f' % (cx - s * 0.3, base_y - s * 0.78, cx, base_y - s * 1.12, cx + s * 0.3, base_y - s * 0.78), 'none', lid, s * 0.08))
    out.append(ell(cx, base_y - s * 0.8, s * 0.2, s * 0.06, lid))
    out.append(path('M%.1f,%.1f L%.1f,%.1f' % (cx - s * 0.35, base_y - s * 0.3, cx - s * 0.2, base_y - s * 0.6), 'none', mix(body, '#ffffff', 0.35), s * 0.06, 0.7))
    if steam:
        out.append(steam_puff(cx + s * 0.86, base_y - s * 1.15, s * 0.22, s * 0.35, v(90), 0.65))
    return ''.join(out)


def f_B4(rng):
    out = [hall_front_bg(rng)]
    out.append(side_racks(rng, y0=700, y1=1650, xs=((-300, 236), (860, 1380))))
    x0, y0, rw, rh = 300, 720, 500, 920
    out.append(rack_front(x0, y0, rw, rh, rng, state='open'))
    # the open cabinet: a lit opening full of kettles
    out.append(rect(x0, y0, rw, rh, w(50)))
    out.append(rect(x0 - 40, y0 - 40, rw + 80, rh + 80, w(70), 0.5, extra='filter="url(#gL)"'))
    out.append(rect(x0, y0, rw, rh, w(62)))
    rows, cols = 10, 4
    sh = rh / rows
    for r_ in range(rows):
        yb = y0 + (r_ + 1) * sh - 6
        out.append(rect(x0, yb, rw, 7, w(35)))
        for c_ in range(cols):
            cx_ = x0 + 62 + c_ * (rw - 124) / (cols - 1) + (8 if r_ % 2 else -8)
            out.append(kettle(cx_, yb, sh * 0.78, v(24), v(16), glow_t=88, steam=(rng.random() < 0.8)))
    # steam pouring up out of the cabinet
    out.append(wisps(550, 712, 100, 12, v(92), 16, rng, spread=220, op=0.55, blur='gS'))
    out.append(wisps(550, 712, 90, 5, w(94), 8, rng, spread=180, op=0.5))
    # the door swung wide (hinged at the left), seen edge-on-ish
    out.append(poly([(300, 706), (150, 760), (150, 1600), (300, 1640)], v(12)))
    out.append(poly([(300, 706), (286, 712), (286, 1636), (300, 1640)], v(24)))
    # warm spill on the floor and on her
    out.append(ell(560, 1700, 420, 80, w(72), 0.55, extra='filter="url(#gL)"'))
    out.append(person(925, 1680, 470, v(7), rim=(w(80), -1), pose='lean_back', facing=1, cap=True, scarf=v(26)))
    out.append(caption([[('as much heat as', False)], [('40', True), (' kettles', False)]]))
    return ''.join(out) + texture()


def f_B5(rng):
    out = [hall_front_bg(rng)]
    out.append(side_racks(rng, y0=760, y1=1600, xs=((-300, 180), (900, 1380))))
    x0, y0, rw, rh = 250, 800, 440, 800
    out.append(rack_front(x0, y0, rw, rh, rng, state='teapot', glow=0.8))
    # it steams like a teapot
    out.append(wisps(470, 790, 150, 9, v(90), 14, rng, spread=170, op=0.5, lean=0.25))
    # the teabag's string over its top edge and the big paper tag dangling down its front
    out.append(path('M%.1f,%.1f C%.1f,%.1f %.1f,%.1f %.1f,%.1f' % (520, 786, 545, 830, 520, 900, 548, 980), 'none', v(80), 4))
    out.append(poly([(486, 978), (614, 970), (622, 1146), (494, 1154)], v(94)))
    out.append(poly([(486, 978), (614, 970), (616, 1010), (488, 1018)], w(82)))
    out.append(circ(551, 994, 6, v(40)))
    # the engineer on a step stool, one tiny mug, dunking her own teabag
    out.append(rect(770, 1480, 120, 14, v(30)))
    out.append(rect(780, 1494, 12, 110, v(24)))
    out.append(rect(868, 1494, 12, 110, v(24)))
    out.append(person(830, 1600, 400, v(7), rim=(w(70), -1), pose='sit', facing=-1, cap=True, scarf=v(26)))
    out.append(rect(742, 1344, 40, 44, v(90), rx=6))
    out.append(path('M%.1f,%.1f q%.1f,%.1f %.1f,%.1f' % (782, 1352, 18, 8, 0, 26), 'none', v(90), 5))
    out.append(line(762, 1344, 762, 1290, v(76), 2.5))
    out.append(rect(752, 1276, 20, 18, v(92)))
    out.append(wisps(762, 1340, 60, 3, v(94), 5, rng, spread=8, op=0.7))
    out.append(ell(470, 1650, 330, 60, w(70), 0.35, extra='filter="url(#gL)"'))
    out.append(caption([[("That's a lot of ", False), ('tea.', True)]]))
    return ''.join(out) + texture()



# ============================================================== THE ROOF: THROWN INTO THE NIGHT (B6), THE CITY REACHES BACK (B7)
def fan_top(cx, cy, rx, ratio, warm_amt, rng, spin=0.0):
    """A big round fan seen from above at an angle: housing ring, curved blades, the heat glowing up between them."""
    ry = rx * ratio
    out = []
    out.append(ell(cx, cy + ry * 0.5, rx * 1.08, ry * 1.08 + 10, v(12)))
    out.append(ell(cx, cy, rx * 1.08, ry * 1.08, v(30)))
    out.append(ell(cx, cy, rx, ry, v(14)))
    if warm_amt > 0:
        out.append(ell(cx, cy, rx * 0.86, ry * 0.86, w(52), 0.85 * warm_amt))
        out.append(ell(cx, cy, rx * 0.5, ry * 0.5, w(74), 0.6 * warm_amt))
    for k in range(6):
        a0 = spin + k * math.pi / 3
        pts_ = []
        for t in (0.15, 0.45, 0.75, 0.98):
            a = a0 + t * 0.9
            pts_.append((cx + math.cos(a) * rx * t, cy + math.sin(a) * ry * t))
        for t in (0.98, 0.75, 0.45, 0.15):
            a = a0 + t * 0.9 + 0.42
            pts_.append((cx + math.cos(a) * rx * t * 0.97, cy + math.sin(a) * ry * t * 0.97))
        out.append(path(smooth(pts_, closed=True), v(13)))
    out.append(ell(cx, cy, rx * 0.16, ry * 0.16, v(20)))
    out.append(ell(cx - rx * 0.2, cy - ry * 0.85, rx * 0.7, ry * 0.18, v(70), 0.45))
    return ''.join(out)


def roof_view(rng, reach=0.0, plumes=1.0):
    hz = 1000
    out = []
    out.append(sky(v(10), v(17), v(32), v(58), hz, glow=(600, 520, 110, v(64), 0.5)))
    out.append(cloud(820, 170, 560, 160, v(21), v(36), rng, n=10))
    out.append(streak(560, 690, 1120, 30, v(28), 0.5))
    out.append(streak(-40, 820, 460, 26, v(36), 0.45))
    # the lot and the streets between the hall and the city, seen from the roof
    out.append('<defs><linearGradient id="lotg" x1="0" y1="%d" x2="0" y2="%d" gradientUnits="userSpaceOnUse">'
               '<stop offset="0" stop-color="%s"/><stop offset="1" stop-color="%s"/></linearGradient></defs>' % (hz, 1400, v(62), v(50)))
    out.append(rect(0, hz - 1, W, 420, 'url(#lotg)'))
    # the frozen harbour on the left
    out.append(poly([(0, hz + 4), (330, hz + 4), (150, 1180), (0, 1240)], v(54)))
    for i in range(26):
        x = rng.uniform(0, 300)
        y = rng.uniform(hz + 8, 1230)
        if x > 330 - (y - hz) * 1.0:
            continue
        out.append(line(x, y, x + rng.uniform(-30, 30), y + rng.uniform(4, 16), v(42), 1.4, 0.6))
    out.append(far_city(rng, hz + 4, hz - 36, -10, 1090, v(52), lit_frac=0.0))
    # streets of the lot converging on the city (snow ruts), lamp posts
    for (xa, xb) in ((420, 300), (640, 560), (900, 760), (1150, 950)):
        out.append(line(xa, 1400, xb, 1080, v(46), 6, 0.6))
    # KATAJANOKKA across the lot: blocks shoulder to shoulder, steep snowy roofs, chimneys; Uspenski on its rock
    base = 1080
    rock = path(smooth([(150, base + 4), (165, base - 30), (240, base - 48), (330, base - 34), (350, base + 4)], closed=True), v(26))
    out.append(rock)
    out.append(rect(195, base - 128, 112, 84, v(24)))
    for (dx, dr, hh) in ((251, 22, 64), (214, 11, 32), (290, 11, 32)):
        out.append(path('M%.1f,%.1f Q%.1f,%.1f %.1f,%.1f Q%.1f,%.1f %.1f,%.1f Z' % (
            dx - dr, base - 128, dx - dr * 1.1, base - 128 - hh * 0.8, dx, base - 128 - hh * 1.25,
            dx + dr * 1.1, base - 128 - hh * 0.8, dx + dr, base - 128), v(30)))
        out.append(line(dx, base - 128 - hh * 1.25, dx, base - 128 - hh * 1.6, v(30), 2.2))
    rngb = random.Random(5)
    xs = 330
    doors = []
    while xs < 1100:
        bw = rngb.uniform(70, 125)
        top = base - rngb.uniform(78, 128)
        out.append(poly([(xs, base), (xs, top + 12), (xs + bw * 0.5, top - 12), (xs + bw, top + 12), (xs + bw, base)], v(27)))
        out.append(poly([(xs, top + 12), (xs + bw * 0.5, top - 12), (xs + bw, top + 12), (xs + bw * 0.5, top - 2)], v(66), 0.75))
        for cxx in (xs + bw * 0.3, xs + bw * 0.7):
            out.append(rect(cxx - 3, top - 8, 7, 14, v(22)))
        for yy in range(int(top + 22), int(base - 14), 15):
            for xx in range(int(xs + 8), int(xs + bw - 8), 13):
                if rngb.random() < 0.7:
                    out.append(rect(xx, yy, 5, 7, v(48) if rngb.random() < 0.35 else v(16)))
        doors.append((xs + bw * 0.5, base))
        out.append(rect(xs + bw * 0.5 - 5, base - 14, 10, 14, v(8)))
        xs += bw + rngb.uniform(-4, 4)
    # THE CITY REACHES BACK: warm lines out of the homes' doors, joining like streams into one trunk that reaches for the heat
    if reach > 0:
        goal = (560, 1372)
        joins = [(470, 1180), (720, 1190)]
        trunk = (590, 1265)
        segs = []
        for (dx, dy) in doors[::1]:
            j = joins[0] if dx < 640 else joins[1]
            segs.append([(dx, dy + 2), ((dx + j[0]) / 2 + rng.uniform(-14, 14), (dy + j[1]) / 2), j])
        segs.append([joins[0], ((joins[0][0] + trunk[0]) / 2, (joins[0][1] + trunk[1]) / 2 + 6), trunk])
        segs.append([joins[1], ((joins[1][0] + trunk[0]) / 2, (joins[1][1] + trunk[1]) / 2 + 6), trunk])
        segs.append([trunk, ((trunk[0] + goal[0]) / 2 + 12, (trunk[1] + goal[1]) / 2), goal])
        for k, sg in enumerate(segs):
            wdt = 4 if k < len(doors) else 9
            d = smooth(sg)
            out.append(path(d, 'none', w(66), wdt * 3.4, 0.5, extra='filter="url(#gS)"'))
            out.append(path(d, 'none', w(90), wdt, 1.0))
        for (dx, dy) in doors:
            out.append(rect(dx - 5, dy - 14, 10, 14, w(86)))
            out.append(circ(dx, dy - 6, 12, w(80), 0.6, extra='filter="url(#gS)"'))
        out.append(circ(goal[0], goal[1], 34, w(88), 0.7, extra='filter="url(#gM)"'))
        out.append(circ(goal[0], goal[1], 9, w(100)))
    # the roof: parapet edge, then the snowy roof (the near quiet mass)
    out.append('<defs><linearGradient id="roofg" x1="0" y1="1400" x2="0" y2="1920" gradientUnits="userSpaceOnUse">'
               '<stop offset="0" stop-color="%s"/><stop offset="1" stop-color="%s"/></linearGradient></defs>' % (v(48), v(28)))
    out.append(poly([(0, 1410), (W, 1392), (W, H), (0, H)], 'url(#roofg)'))
    out.append(poly([(0, 1398), (W, 1380), (W, 1394), (0, 1412)], v(80)))
    out.append(poly([(0, 1412), (W, 1394), (W, 1406), (0, 1424)], v(24)))
    for k in range(36):
        x = rng.uniform(0, W)
        y = rng.uniform(1440, 1900)
        out.append(ell(x, y, rng.uniform(20, 60), rng.uniform(3, 7), v(54), 0.35))
    # THE FANS: two cooler units on the roof, big round fans on top, the heat pouring up out of them
    def unit(nl, nr, fr, fl, depth, fans, frx, ratio):
        o = []
        o.append(poly([nl, nr, (nr[0], nr[1] + depth), (nl[0], nl[1] + depth)], v(22)))
        o.append(poly([nl, nr, fr, fl], v(34)))
        o.append(poly([nl, nr, (nr[0], nr[1] + 8), (nl[0], nl[1] + 8)], v(70), 0.6))
        for (cx, cy) in fans:
            o.append(fan_top(cx, cy, frx, ratio, plumes, rng, spin=rng.uniform(0, 3)))
        return ''.join(o)
    fansA = [(90, 1590), (270, 1572), (450, 1554)]
    fansB = [(700, 1462), (858, 1450)]
    out.append(unit((620, 1490), (960, 1474), (930, 1420), (600, 1434), 70, fansB, 64, 0.36))
    out.append(unit((-60, 1640), (560, 1606), (520, 1500), (-80, 1528), 120, fansA, 84, 0.40))
    # the plumes: warm at the root, cooling and thinning to nothing as they rise (never into the band)
    for (cx, cy, rx) in [(x, y, 84) for x, y in fansA] + [(x, y, 64) for x, y in fansB]:
        rise = cy - 650
        out.append(ell(cx, cy - 30, rx * 0.8, rx * 0.4, w(78), 0.35 * plumes, extra='filter="url(#gM)"'))
        out.append(wisps(cx, cy - 10, rise * 0.3, 5, w(84), rx * 0.2, rng, spread=rx * 0.35, op=0.5 * plumes, blur='gM', lean=0.1))
        out.append(wisps(cx + 10, cy - rise * 0.2, rise * 0.55, 6, mix(w(70), v(70), 0.6), rx * 0.18, rng, spread=rx * 0.5, op=0.32 * plumes, blur='gM', lean=0.2))
        out.append(wisps(cx + 30, cy - rise * 0.5, rise * 0.5, 6, v(70), rx * 0.14, rng, spread=rx * 0.7, op=0.2 * plumes, blur='gM', lean=0.3))
    out.append(snowfall(rng, n=150))
    return ''.join(out)


def f_B6(rng):
    body = roof_view(rng, reach=0.0, plumes=1.0)
    body += caption([[('big fans to blow', False)], [('that heat ', False), ('outside.', True)]], size=100)
    return body + texture()


def f_B7(rng):
    body = roof_view(rng, reach=1.0, plumes=0.75)
    body += caption([[('But Helsinki', False)], [('wants', True), (' that heat.', False)]])
    return body + texture()


# ============================================================== THE PLAN IN CHALK (B8), ITS DOOR (B9), INSIDE (B10)
CHALK = '#c9cce0'


def chalk_line(a, b, rng, sw=3.2, col=CHALK, op=0.85, breaks=True):
    """A hand-laid chalk line: dry, a little broken, never a ruler line."""
    out = []
    n = max(2, int(math.hypot(b[0] - a[0], b[1] - a[1]) / 40))
    for i in range(n):
        if breaks and rng.random() < 0.12:
            continue
        t0, t1 = i / n, (i + 1) / n
        p0 = (a[0] + (b[0] - a[0]) * t0 + rng.uniform(-1, 1), a[1] + (b[1] - a[1]) * t0 + rng.uniform(-1, 1))
        p1 = (a[0] + (b[0] - a[0]) * t1 + rng.uniform(-1, 1), a[1] + (b[1] - a[1]) * t1 + rng.uniform(-1, 1))
        out.append(line(p0[0], p0[1], p1[0], p1[1], col, sw * rng.uniform(0.8, 1.15), op * rng.uniform(0.75, 1.0)))
    return ''.join(out)


def chalk_box(cam, rng, X0, X1, Z0, Z1, Hh, sw=3.0, op=0.85, roof_pitch=0.0, racks=True):
    P = cam.P
    c = {}
    for nm, (X, Y, Z) in {'a': (X0, 0, Z0), 'b': (X1, 0, Z0), 'c': (X1, 0, Z1), 'd': (X0, 0, Z1),
                          'A': (X0, Hh, Z0), 'B': (X1, Hh, Z0), 'C': (X1, Hh, Z1), 'D': (X0, Hh, Z1)}.items():
        c[nm] = P(X, Y, Z)
    out = []
    for e in ('ab', 'bc', 'cd', 'da', 'AB', 'BC', 'CD', 'DA', 'aA', 'bB', 'cC', 'dD'):
        out.append(chalk_line(c[e[0]], c[e[1]], rng, sw, op=op))
    if racks:
        # the planned computers inside: rows of tall chalk boxes
        for X in [X0 + (X1 - X0) * t for t in (0.25, 0.5, 0.75)]:
            zz = Z0 + 3
            while zz < Z1 - 3:
                q = [P(X - 0.5, 0, zz), P(X - 0.5, 3.0, zz), P(X + 0.5, 3.0, zz), P(X + 0.5, 0, zz)]
                for i in range(3):
                    out.append(chalk_line(q[i], q[i + 1], rng, sw * 0.7, op=op * 0.75, breaks=False))
                zz += 4.5
    return ''.join(out)


def icebreakers(rng, base_y, items):
    out = []
    for (x, s, lit) in items:
        hull = [(x, base_y), (x + 360 * s, base_y), (x + 400 * s, base_y - 60 * s), (x - 30 * s, base_y - 70 * s)]
        out.append(poly(hull, v(14)))
        out.append(poly([(x + 60 * s, base_y - 66 * s), (x + 300 * s, base_y - 62 * s), (x + 290 * s, base_y - 140 * s), (x + 80 * s, base_y - 145 * s)], v(64)))
        out.append(poly([(x + 120 * s, base_y - 145 * s), (x + 250 * s, base_y - 142 * s), (x + 245 * s, base_y - 190 * s), (x + 130 * s, base_y - 192 * s)], v(58)))
        out.append(rect(x + 170 * s, base_y - 250 * s, 40 * s, 62 * s, v(36)))
        out.append(line(x + 150 * s, base_y - 192 * s, x + 150 * s, base_y - 300 * s, v(30), 2))
        for k in range(6):
            out.append(rect(x + (90 + k * 34) * s, base_y - 120 * s, 12 * s, 9 * s, v(90) if lit else v(30)))
    return ''.join(out)


def plan_lot(rng, cam, warm_tip=True, engineer_pose='look_up', tag=True, door_open=0.0, near=False):
    P = cam.P
    out = []
    out.append(sky(v(11), v(18), v(34), v(60), cam.cy, glow=(400, 520, 100, v(66), 0.5)))
    out.append(cloud(760, 180, 600, 170, v(21), v(36), rng, n=11))
    out.append(streak(-60, 760, 520, 30, v(30), 0.5))
    out.append(streak(500, 900, 1140, 26, v(40), 0.45))
    # the far shore and the frozen harbour behind the lot
    out.append(far_city(rng, cam.cy + 4, cam.cy - 46, -10, 1090, v(48), lit_frac=0.0))
    out.append(rect(0, cam.cy + 4, W, 40, v(56)))
    out.append(icebreakers(rng, cam.cy + 34, [(20, 0.5, True), (300, 0.42, False)]))
    # the snowy lot
    out.append('<defs><linearGradient id="lotg2" x1="0" y1="%d" x2="0" y2="%d" gradientUnits="userSpaceOnUse">'
               '<stop offset="0" stop-color="%s"/><stop offset="1" stop-color="%s"/></linearGradient></defs>' % (cam.cy + 40, H, v(64), v(36)))
    out.append(rect(0, cam.cy + 40, W, H, 'url(#lotg2)'))
    for k in range(60):
        Z = math.exp(rng.uniform(math.log(4), math.log(60)))
        X = rng.uniform(-20, 20)
        a = P(X, 0, Z)
        out.append(ell(a[0], a[1], max(4, 160 / Z), max(1.2, 30 / Z), v(54), 0.35))
    return ''.join(out)


def f_B8(rng):
    cam = Cam(f=1000, cx=540, cy=1110, eye=1.6)
    P = cam.P
    out = [plan_lot(rng, cam)]
    # the plan: a big new data center in pale chalk on the night (lines only; snow falls through it)
    out.append(chalk_box(cam, rng, -22, 8, 26, 60, 12, sw=4.6, op=0.95))
    # a chalk line still being laid at its far corner (the plan being drawn: soon)
    a_, b_ = P(8, 12, 60), P(8, 6, 60)
    out.append(circ(b_[0], b_[1], 7, v(98)))
    out.append(circ(b_[0], b_[1], 20, v(96), 0.35, extra='filter="url(#gS)"'))
    # survey stakes at its near corners, with ribbons
    for (X, Z) in ((-22, 26), (8, 26)):
        a, b = P(X, 0, Z), P(X, 1.3, Z)
        out.append(line(a[0], a[1], b[0], b[1], v(70), 3.5))
        out.append(path('M%.1f,%.1f q8,4 16,-2' % (b[0], b[1] + 6), 'none', v(88), 3))
    # the chalk pipe from the plan toward the city's warm line, the gap still open
    pa = P(3, 0, 26)
    pb = P(6.0, 0, 13)
    out.append(chalk_line(pa, pb, rng, 4.5))
    out.append(chalk_line((pa[0] + 10, pa[1]), (pb[0] + 22, pb[1]), rng, 4.5))
    # THE CITY'S WARM LINE arriving from the right, its tip waiting at the gap
    pts_ = [(1140, 1560), (1000, 1470), (900, 1405), (800, 1352)]
    d = smooth(pts_)
    out.append(path(d, 'none', w(66), 34, 0.55, extra='filter="url(#gM)"'))
    out.append(path(d, 'none', w(88), 12, 1.0))
    out.append(path(d, 'none', w(100), 4, 0.9))
    out.append(circ(800, 1352, 30, w(90), 0.6, extra='filter="url(#gM)"'))
    out.append(circ(800, 1352, 9, w(100)))
    # the 2027 tag on its own stake by the gap
    ta, tb = (640, 1420), (640, 1260)
    out.append(line(ta[0], ta[1], tb[0], tb[1], v(66), 5))
    out.append(path('M%.1f,%.1f L%.1f,%.1f' % (640, 1268, 600, 1300), 'none', v(80), 2.5))
    out.append(poly([(520, 1296), (668, 1290), (672, 1376), (524, 1382)], v(92)))
    out.append(circ(534, 1336, 5, v(40)))
    out.append('<text x="598" y="1360" text-anchor="middle" font-family="Gaegu" font-weight="700" font-size="74" fill="%s">2027</text>' % v(12))
    # the engineer with a rolled drawing, looking up at it
    out.append(person(860, 1520, 300, v(9), rim=(v(60), -1), pose='look_up', facing=-1, cap=True, scarf=v(30)))
    out.append(line(820, 1330, 880, 1300, v(80), 9))
    out.append(snowfall(rng, n=150))
    out.append(caption([[('The city has a plan,', False)], [('starting ', False), ('next year.', True)]], size=98))
    return ''.join(out) + texture()


def f_B9(rng):
    cam = Cam(f=1000, cx=540, cy=1180, eye=1.6)
    P = cam.P
    out = [plan_lot(rng, cam)]
    # the plan's front wall in chalk, close: posts, a lintel, the roof line
    out.append(chalk_box(cam, rng, -14, 14, 13, 40, 7.2, sw=4.2, racks=False))
    # THE DOOR: the one solid, painted thing in the drawing, swung open on warm light
    da, db = P(-1.4, 0, 13), P(1.4, 0, 13)
    dt = P(1.4, 3.0, 13)
    dx0, dy1 = da
    dx1, dy0 = dt
    out.append(rect(dx0 - 60, dy0 - 60, dx1 - dx0 + 120, dy1 - dy0 + 80, w(70), 0.6, extra='filter="url(#gL)"'))
    out.append(rect(dx0, dy0, dx1 - dx0, dy1 - dy0, w(84)))
    # the glimpse inside: machines and pipes, dark against the warm
    for k in range(4):
        xx = dx0 + 26 + k * (dx1 - dx0 - 52) / 3
        out.append(rect(xx - 14, dy0 + 60, 28, dy1 - dy0 - 80, w(40)))
        out.append(rect(xx - 14, dy0 + 60, 28, 10, w(20)))
    out.append(rect(dx0, dy0 + 40, dx1 - dx0, 10, w(56)))
    out.append(rect(dx0, dy0 + 34, dx1 - dx0, 5, w(96)))
    # the door leaf itself, swung open toward us (painted, solid)
    out.append(poly([(dx1, dy0), (dx1 + 120, dy0 - 18), (dx1 + 120, dy1 + 26), (dx1, dy1)], v(22)))
    out.append(poly([(dx1, dy0), (dx1 + 14, dy0 - 2), (dx1 + 14, dy1 + 3), (dx1, dy1)], v(40)))
    out.append(rect(dx1 + 92, (dy0 + dy1) / 2, 8, 30, v(60)))
    # the warm spill across the snow toward us
    out.append(poly([(dx0, dy1), (dx1, dy1), (dx1 + 240, 1900), (dx0 - 240, 1900)], w(78), 0.32, extra='filter="url(#gM)"'))
    out.append(poly([(dx0 + 10, dy1), (dx1 - 10, dy1), (dx1 + 120, 1700), (dx0 - 120, 1700)], w(86), 0.25, extra='filter="url(#gS)"'))
    # the engineer at the threshold, leaning in, a silhouette against the warm
    out.append(person(dx0 + 40, dy1 + 6, (dy1 - dy0) * 0.62, v(6), rim=(w(90), 1), pose='lean_in', facing=1, cap=True, scarf=v(22)))
    # the warm line arriving from the right and the chalk pipe to the door's foot
    d = smooth([(1140, 1700), (1000, 1600), (860, 1520), (dx1 + 60, dy1 + 40)])
    out.append(path(d, 'none', w(66), 30, 0.5, extra='filter="url(#gM)"'))
    out.append(path(d, 'none', w(88), 10, 1.0))
    out.append(snowfall(rng, n=150))
    out.append(caption([[('So ', False), ('how', True), (' would', False)], [('that work?', False)]]))
    return ''.join(out) + texture()


def pipe_path(pp, t0, t1, width, rng, glow=True):
    """A water pipe drawn as a run of short segments, its water going from cool (t0) to warm (t1)."""
    out = []
    n = len(pp) - 1
    for i in range(n):
        t = t0 + (t1 - t0) * i / max(1, n - 1)
        a, b = pp[i], pp[i + 1]
        if t < 0.5:
            col = mix(v(90), v(74), t * 2)
        else:
            col = w(70 + 30 * (t - 0.5) * 2)
        if glow and t > 0.55:
            out.append(line(a[0], a[1], b[0], b[1], w(72), width * 2.6, 0.45, extra='filter="url(#gS)"'))
        out.append(line(a[0], a[1], b[0], b[1], v(16), width + 6))
        out.append(line(a[0], a[1], b[0], b[1], col, width))
    return ''.join(out)


def f_B10(rng):
    out = []
    # the inside of the plan: the snowy night through chalk walls
    out.append(sky(v(10), v(16), v(28), v(44), 1250))
    out.append(snowfall(rng, n=90, y1=1250))
    out.append('<defs><linearGradient id="hf" x1="0" y1="1250" x2="0" y2="1920" gradientUnits="userSpaceOnUse">'
               '<stop offset="0" stop-color="%s"/><stop offset="1" stop-color="%s"/></linearGradient></defs>' % (v(36), v(22)))
    out.append(rect(0, 1250, W, 670, 'url(#hf)'))
    out.append(line(0, 1500, 1080, 1500, v(16), 26))
    out.append(line(0, 1500, 1080, 1500, v(84), 16))
    # the plan's chalk walls and roof lines framing the hall
    for (a, b) in (((60, 1250), (60, 640)), ((1020, 1250), (1020, 640)), ((60, 640), (1020, 640)),
                   ((60, 1250), (300, 1150)), ((1020, 1250), (780, 1150)), ((300, 1150), (780, 1150)),
                   ((300, 1150), (300, 760)), ((780, 1150), (780, 760)), ((60, 640), (300, 760)), ((1020, 640), (780, 760)),
                   ((300, 760), (780, 760))):
        out.append(chalk_line(a, b, rng, 3.2, op=0.6))
    # rows of computers receding on both sides, each with its own loop: cool in at the foot, a gold riser to the main
    main_y = 700
    for side in (-1, 1):
        for k in range(7):
            t = k / 6
            x = 540 + side * (470 - 300 * t)
            yb = 1330 - 150 * t
            sc = 1.0 - 0.62 * t
            rw, rh = 120 * sc, 520 * sc
            out.append(rect(x - rw / 2, yb - rh, rw, rh, v(12 + 4 * t)))
            for r_ in range(8):
                out.append(rect(x - rw / 2 + 5, yb - rh + 8 + r_ * rh / 8, rw - 10, max(2, 4 * sc), v(30)))
            rx_ = x + side * (rw / 2 + 4)
            out.append(line(rx_, yb - 6, rx_, yb - rh * 0.5, v(80), max(2, 7 * sc)))
            out.append(line(rx_, yb - rh * 0.5, rx_, main_y + 18 + 60 * t, w(86), max(2, 7 * sc)))
            out.append(line(rx_, yb - rh * 0.6, rx_, main_y + 18 + 60 * t, w(72), max(4, 16 * sc), 0.4, extra='filter="url(#gS)"'))
    # THE ONE COMPUTER in front: big, centred, its door glass, the pipe climbing past every shelf
    x0, y0, rw, rh = 380, 840, 320, 700
    out.append(rect(x0 - 12, y0 - 14, rw + 24, rh + 20, v(8)))
    shelves = 9
    for r_ in range(shelves):
        sy = y0 + 18 + r_ * (rh - 30) / shelves
        sh = (rh - 30) / shelves - 12
        # each shelf's chips: cooled behind the water (blue-grey), a last warm ember at the hottest chip
        out.append(rect(x0 + 10, sy, rw - 20, sh, v(26)))
        out.append(rect(x0 + 24, sy + sh * 0.3, 60, sh * 0.45, v(44)))
        out.append(rect(x0 + 110, sy + sh * 0.3, 60, sh * 0.45, v(44)))
        out.append(circ(x0 + 210, sy + sh * 0.55, 5, v(92)))
    # the loop: in at the foot (cool), up past each shelf in a serpentine, out of the top (gold)
    pp = [(0, 1500), (200, 1500), (x0 + 30, 1500), (x0 + rw - 40, 1500)]
    yy = 1500
    for r_ in range(shelves):
        sy = y0 + 18 + (shelves - 1 - r_) * (rh - 30) / shelves + (rh - 30) / shelves * 0.75
        xa = x0 + rw - 40 if r_ % 2 == 0 else x0 + 40
        pp += [(xa, sy)]
        pp += [(x0 + 40 if r_ % 2 == 0 else x0 + rw - 40, sy)]
    pp += [(x0 + rw - 40, y0 - 30), (x0 + rw + 60, y0 - 30), (x0 + rw + 60, main_y), (1100, main_y)]
    sm = []
    for i in range(len(pp) - 1):
        a, b = pp[i], pp[i + 1]
        for t in (0.0, 0.33, 0.66):
            sm.append((a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t))
    sm.append(pp[-1])
    out.append(path(smooth(sm), 'none', v(16), 22))
    out.append(pipe_path(sm, 0.0, 1.0, 14, rng))
    # the main overhead, gold, leaving through the chalk wall toward the city
    out.append(line(40, main_y, 1100, main_y, w(70), 40, 0.45, extra='filter="url(#gS)"'))
    out.append(line(40, main_y, 1100, main_y, v(16), 30))
    out.append(line(40, main_y, 1100, main_y, w(88), 22))
    out.append(line(40, main_y - 5, 1100, main_y - 5, w(98), 5, 0.9))
    # little flow chevrons: blue in, gold out
    for (cx_, cy_, col) in ((90, 1500, v(96)), (250, 1500, v(96)), (900, main_y, w(100)), (1000, main_y, w(100))):
        out.append(path('M%.1f,%.1f l14,-9 l-14,-9' % (cx_ - 7, cy_ + 9), 'none', col, 4))
    # the snow outside the right wall melting where the main goes out
    out.append(ell(1040, 1260, 60, 12, w(70), 0.4, extra='filter="url(#gM)"'))
    out.append(caption([[('take the heat out', False)], [('with ', False), ('water', True), (' in pipes', False)]], size=98))
    return ''.join(out) + texture()


# ============================================================== HOME: UNDER THE SNOW (B11), THE WINDOW (B12)
def block_front(rng, x0, x1, base_y, top_y, floors, win_w, win_h, lit_fn, face=None, snow=None, focal=None, turret=True, roof_h=120):
    """A Jugend block seen across the street (nearly frontal): stone, a steep snowy roof, chimneys, windows."""
    face = face or v(22)
    snow = snow or v(74)
    out = []
    out.append(rect(x0, top_y, x1 - x0, base_y - top_y, face))
    # stone courses near the base (lighter rusticated band)
    out.append(rect(x0, base_y - 150, x1 - x0, 150, mix(face, v(34), 0.5)))
    for yy in range(int(base_y - 150), int(base_y), 26):
        out.append(line(x0, yy, x1, yy, v(16), 1.5, 0.6))
    # roof
    out.append(poly([(x0 - 10, top_y), (x1 + 10, top_y), (x1 - 40, top_y - roof_h), (x0 + 40, top_y - roof_h)], v(13)))
    out.append(poly([(x0 + 40, top_y - roof_h), (x1 - 40, top_y - roof_h), (x1 - 30, top_y - roof_h * 0.83), (x0 + 30, top_y - roof_h * 0.83)], snow))
    out.append(poly([(x0 - 14, top_y - 4), (x1 + 14, top_y - 4), (x1 + 4, top_y - 22), (x0 - 4, top_y - 22)], snow))
    for cxx in range(int(x0 + 80), int(x1 - 40), 150):
        out.append(rect(cxx, top_y - roof_h - 40, 28, 52, v(15)))
        out.append(rect(cxx - 4, top_y - roof_h - 46, 36, 10, snow))
    if turret:
        tx = x1 - 70
        out.append(rect(tx - 50, top_y - 60, 100, 220, mix(face, v(30), 0.4)))
        out.append(poly([(tx - 58, top_y - 60), (tx + 58, top_y - 60), (tx, top_y - 230)], v(12)))
        out.append(poly([(tx - 58, top_y - 60), (tx - 20, top_y - 60), (tx - 6, top_y - 200), (tx, top_y - 230)], snow, 0.55))
    fl_h = (base_y - 150 - top_y) / floors
    cols = int((x1 - x0) / (win_w * 2.0))
    for k in range(floors):
        wy = top_y + k * fl_h + fl_h * 0.22
        for j in range(cols):
            wx = x0 + (x1 - x0) * (j + 0.5) / cols - win_w / 2
            lit = lit_fn(floors - 1 - k, j)
            if focal and focal == (floors - 1 - k, j):
                continue
            if lit:
                out.append(warm_window(wx, wy, win_w, win_h, t=lit if isinstance(lit, (int, float)) and lit > 1 else 84))
            else:
                out.append(rect(wx, wy, win_w, win_h, v(10)))
                out.append(rect(wx + win_w / 2 - 2, wy, 4, win_h, v(20), 0.8))
            out.append(rect(wx - 6, wy + win_h, win_w + 12, 9, snow))
    return ''.join(out)


def street_across(rng, lit_fn, focal=None, horizon=1150, cut=False, melt=True):
    out = []
    out.append(sky(v(11), v(18), v(32), v(52), horizon, glow=(540, 560, 90, v(58), 0.4)))
    out.append(cloud(240, 170, 560, 160, v(21), v(35), rng, n=10))
    # the block across the street (the subject) and its neighbours cut by the edges
    out.append(block_front(rng, -120, 150, 1330, 820, 5, 44, 70, lambda k, j: False, face=v(18), turret=False))
    out.append(block_front(rng, 170, 930, 1330, 700, 5, 70, 108, lit_fn, face=v(23), focal=focal))
    out.append(block_front(rng, 950, 1300, 1330, 760, 5, 50, 80, lambda k, j: False, face=v(19), turret=False))
    # the door of the block (the heat goes in at its cellar)
    out.append(rect(510, 1180, 90, 150, v(8)))
    out.append(rect(500, 1166, 110, 14, v(70)))
    # pavement, kerb and the street's snow
    out.append(rect(0, 1330, W, 40, v(56)))
    out.append(rect(0, 1370, W, 10, v(30)))
    out.append('<defs><linearGradient id="stg" x1="0" y1="1380" x2="0" y2="1920" gradientUnits="userSpaceOnUse">'
               '<stop offset="0" stop-color="%s"/><stop offset="1" stop-color="%s"/></linearGradient></defs>' % (v(58), v(38)))
    out.append(rect(0, 1380, W, 540, 'url(#stg)'))
    # tram rails across the street (level), tyre tracks
    for yy in (1450, 1468, 1540, 1566):
        out.append(line(0, yy, W, yy, v(36), 3, 0.7))
    for k in range(40):
        out.append(ell(rng.uniform(0, W), rng.uniform(1600, 1900), rng.uniform(16, 40), rng.uniform(3, 6), v(46), 0.4))
    # a snowy parked car and a bike under snow (the street's life), a hung lamp
    out.append(path(smooth([(40, 1360), (60, 1300), (130, 1282), (230, 1286), (280, 1320), (300, 1362)], closed=True), v(30)))
    out.append(path(smooth([(60, 1300), (130, 1272), (230, 1276), (270, 1304)], closed=False), 'none', v(80), 14))
    out.append(line(-20, 610, 1100, 640, v(10), 1.5))
    return ''.join(out)


def f_B11(rng):
    def litf(k, j):
        # the warm climbs: lower floors lit, the bloom rising
        return {0: True, 1: True, 2: j in (1, 2, 4), 3: j in (2,), 4: False}.get(k, False)
    out = []
    out.append(sky(v(11), v(18), v(32), v(52), 1100, glow=(540, 560, 90, v(58), 0.4)))
    out.append(cloud(240, 170, 560, 160, v(21), v(35), rng, n=10))
    base, top = 1180, 740
    out.append(block_front(rng, -120, 150, base, 830, 4, 44, 64, lambda k, j: False, face=v(18), turret=False, roof_h=80))
    out.append(block_front(rng, 170, 930, base, top, 5, 64, 70, litf, face=v(23), focal=(2, 2), turret=False, roof_h=90))
    out.append(block_front(rng, 950, 1300, base, 800, 4, 50, 70, lambda k, j: False, face=v(19), turret=False, roof_h=80))
    fl_h = (base - 150 - top) / 5
    fw, fh = 64, 70
    fx = 170 + (930 - 170) * 2.5 / 5 - fw / 2
    fy = top + 2 * fl_h + fl_h * 0.22
    out.append(warm_window(fx, fy, fw, fh, t=92))
    out.append(person(fx + fw * 0.6, fy + fh + 2, fh * 0.92, v(14), pose='stand', cap=False))
    # the door (the heat goes in at its cellar)
    out.append(rect(512, base - 130, 86, 130, v(8)))
    out.append(rect(502, base - 142, 106, 12, v(70)))
    # pavement, kerb, the street's snow, tram rails
    out.append(rect(0, base, W, 34, v(56)))
    out.append(rect(0, base + 34, W, 8, v(30)))
    out.append('<defs><linearGradient id="stg" x1="0" y1="%d" x2="0" y2="1330" gradientUnits="userSpaceOnUse">'
               '<stop offset="0" stop-color="%s"/><stop offset="1" stop-color="%s"/></linearGradient></defs>' % (base + 42, v(58), v(46)))
    out.append(rect(0, base + 42, W, 1330 - base - 42, 'url(#stg)'))
    for yy in (1250, 1260, 1294, 1306):
        out.append(line(0, yy, W, yy, v(36), 3, 0.7))
    out.append(path(smooth([(40, base + 30), (60, base - 26), (130, base - 44), (230, base - 40), (280, base - 8), (300, base + 30)], closed=True), v(30)))
    out.append(path(smooth([(60, base - 26), (130, base - 52), (230, base - 48), (270, base - 22)]), 'none', v(80), 14))
    # a tram passing far off along the street's end (tone-on-tone, cool windows)
    out.append(rect(980, base - 70, 140, 66, v(40)))
    for k in range(3):
        out.append(rect(990 + k * 34, base - 60, 24, 22, v(76)))
    # the melt line: from the cut at our feet, across the street, to the block's cellar
    mpts = [(560, 1336), (556, 1300), (552, 1260), (552, 1230), (555, base + 4)]
    out.append(path(smooth(mpts), 'none', v(28), 60, 0.55, extra='filter="url(#gS)"'))
    out.append(path(smooth(mpts), 'none', w(70), 36, 0.55, extra='filter="url(#gM)"'))
    out.append(path(smooth(mpts), 'none', w(88), 10, 0.95))
    out.append(steam_puff(556, base - 20, 36, 34, w(86), 0.4))
    out.append(line(555, base, 555, fy + fh, w(80), 12, 0.35, extra='filter="url(#gM)"'))
    # THE CUT: the snowbank at our feet sliced like cake: snow, cobbles, earth, the gold pipe in it
    by = 1330
    out.append(rect(0, by, W, H - by, v(12)))
    out.append(path(smooth([(-20, by + 4), (200, by - 14), (420, by - 4), (700, by - 18), (900, by - 2), (1100, by - 10)]) +
                    ' L1100,%d L-20,%d Z' % (by + 56, by + 56), v(86)))
    for xx in range(-10, W, 46):
        out.append(ell(xx + rng.uniform(-4, 4), by + 74, 22, 13, v(30)))
    out.append(rect(0, by + 90, W, H - by - 90, v(10)))
    for k in range(90):
        out.append(circ(rng.uniform(0, W), rng.uniform(by + 100, H), rng.uniform(1.5, 4), v(22), 0.6))
    px, py = 560, by + 136
    out.append(circ(px, py, 110, w(64), 0.55, extra='filter="url(#gL)"'))
    out.append(circ(px, py, 64, v(30)))
    out.append(circ(px, py, 48, w(80)))
    out.append(circ(px, py, 38, w(94)))
    out.append(circ(px - 10, py - 12, 13, w(100), 0.8))
    out.append(circ(px + 170, py + 6, 50, v(26)))
    out.append(circ(px + 170, py + 6, 34, v(56)))
    out.append(snowfall(rng, n=140, y1=1320))
    out.append(caption([[('carry that heat', False)], [("into people's ", False), ('homes.', True)]], size=96))
    return ''.join(out) + texture()


def f_B12(rng):
    out = []
    out.append(sky(v(11), v(18), v(30), v(46), 1300))
    out.append(cloud(820, 180, 520, 150, v(21), v(35), rng, n=10))
    # the block's facade, close: stone, the one window big, its neighbours dark-calm
    out.append(rect(0, 640, W, 1280, v(21)))
    out.append(poly([(0, 640), (W, 640), (W, 660), (0, 660)], v(72)))
    for yy in range(700, 1920, 64):
        out.append(line(0, yy, W, yy, v(17), 1.6, 0.5))
    for (wx, wy) in ((70, 760), (830, 760), (70, 1420), (830, 1420)):
        out.append(rect(wx, wy, 180, 260, v(9)))
        out.append(rect(wx + 86, wy, 8, 260, v(18)))
        out.append(rect(wx - 10, wy + 260, 200, 16, v(72)))
    # THE ONE WINDOW: an apartment glowing honey
    x0, y0, ww, wh = 360, 820, 360, 520
    out.append(rect(x0 - 80, y0 - 60, ww + 160, wh + 140, w(66), 0.55, extra='filter="url(#gL)"'))
    out.append(rect(x0 - 20, y0 - 20, ww + 40, wh + 40, v(30)))
    out.append(rect(x0, y0, ww, wh, w(88)))
    # inside: the room's back wall gradient, a lamp, a shelf, a plant
    out.append(rect(x0, y0, ww, wh * 0.55, w(92)))
    out.append(circ(x0 + ww * 0.78, y0 + wh * 0.22, 26, w(100)))
    out.append(circ(x0 + ww * 0.78, y0 + wh * 0.22, 60, w(98), 0.5, extra='filter="url(#gM)"'))
    # a shelf with a small plant and a picture on the back wall, right of her (clear of her silhouette)
    out.append(rect(x0 + ww * 0.6, y0 + wh * 0.42, 120, 8, w(52)))
    out.append(rect(x0 + ww * 0.66, y0 + wh * 0.36, 26, 24, w(46)))
    for (dx, dy) in ((-14, -22), (0, -34), (14, -24), (-6, -14), (10, -12)):
        out.append(ell(x0 + ww * 0.66 + 13 + dx, y0 + wh * 0.36 + dy, 12, 7, w(42)))
    out.append(rect(x0 + ww * 0.08, y0 + wh * 0.1, 70, 56, w(60)))
    out.append(rect(x0 + ww * 0.08 + 8, y0 + wh * 0.1 + 8, 54, 40, w(80)))
    # her: on the window seat in profile, knees up, a mug in both hands, looking out past us
    sx, sy = x0 + ww * 0.36, y0 + wh * 0.88
    sil = w(28)
    out.append(path(smooth([(sx - 70, sy), (sx - 80, sy - 60), (sx - 60, sy - 150), (sx - 30, sy - 196), (sx + 10, sy - 200),
                            (sx + 20, sy - 160), (sx + 40, sy - 120), (sx + 120, sy - 112), (sx + 150, sy - 80), (sx + 140, sy - 30),
                            (sx + 120, sy)], closed=True), sil))
    out.append(path(smooth([(sx + 40, sy - 118), (sx + 90, sy - 150), (sx + 120, sy - 112)], closed=True), sil))
    out.append(rect(sx - 26, sy - 236, 26, 44, sil))
    out.append(ell(sx - 8, sy - 262, 34, 38, sil))
    out.append(ell(sx - 14, sy - 270, 38, 36, w(20)))
    out.append(circ(sx - 48, sy - 248, 18, w(20)))
    out.append(path(smooth([(sx + 22, sy - 262), (sx + 36, sy - 254), (sx + 24, sy - 246)]), 'none', sil, 6))
    out.append(path(smooth([(sx - 10, sy - 180), (sx + 40, sy - 160), (sx + 66, sy - 168)]), 'none', sil, 18))
    out.append(rect(sx + 56, sy - 194, 34, 38, v(92), rx=6))
    out.append(path('M%.1f,%.1f q14,6 0,20' % (sx + 90, sy - 186), 'none', v(92), 5))
    out.append(wisps(sx + 73, sy - 198, 90, 3, w(100), 6, rng, spread=8, op=0.85))
    # the radiator under the sill, its fins warm (the heat arrived)
    out.append(rect(x0 + 20, y0 + wh * 0.9, ww - 40, wh * 0.1 - 6, w(60)))
    for k in range(12):
        out.append(rect(x0 + 30 + k * (ww - 60) / 12, y0 + wh * 0.9, 8, wh * 0.1 - 6, w(80)))
    # the window's frame and mullions, frost melting at the corners
    out.append(rect(x0 + ww / 2 - 7, y0, 14, wh, v(26)))
    out.append(rect(x0, y0 + wh * 0.32, ww, 12, v(26)))
    out.append(rect(x0 + 2, y0 + 2, ww - 4, wh - 4, 'none', extra='stroke="%s" stroke-width="14" opacity="0.35" filter="url(#gS)"' % v(90)))
    # the sill with snow and a candle bridge (a Finnish winter window), the warm spill on the sill's snow
    out.append(rect(x0 - 40, y0 + wh + 20, ww + 80, 26, v(80)))
    out.append(rect(x0 - 40, y0 + wh + 20, ww + 80, 26, w(80), 0.5))
    out.append(path('M%.1f,%.1f L%.1f,%.1f L%.1f,%.1f Z' % (x0 + ww * 0.25, y0 + wh - 6, x0 + ww * 0.5, y0 + wh - 60, x0 + ww * 0.75, y0 + wh - 6), w(40)))
    for k in range(7):
        cxk = x0 + ww * 0.29 + k * ww * 0.07
        cyk = y0 + wh - 10 - (54 * (1 - abs(k - 3) / 3.5))
        out.append(circ(cxk, cyk, 5, w(100)))
    # the street at the foot: snow, the melt line running in at the cellar, glowing
    out.append(rect(0, 1560, W, 360, v(46)))
    out.append(rect(0, 1548, W, 14, v(70)))
    mp = [(1100, 1880), (900, 1760), (760, 1650), (640, 1566)]
    out.append(path(smooth(mp), 'none', v(28), 54, 0.5, extra='filter="url(#gS)"'))
    out.append(path(smooth(mp), 'none', w(70), 30, 0.55, extra='filter="url(#gM)"'))
    out.append(path(smooth(mp), 'none', w(90), 8, 0.95))
    # Pip, hidden: a small round shape on the sill of the dark window, top right
    out.append(ell(898, 1006, 20, 16, v(36)))
    out.append(circ(890, 1000, 3, v(80)))
    out.append(snowfall(rng, n=150))
    # YOU: your gloved hand and phone, the question just sent
    out.append(pov_phone(170, 1290, scale=0.95, sent=True))
    out.append(caption([[('your chatbot', True), (' could', False)], [('heat an apartment', False)]], size=100))
    return ''.join(out) + texture()



# ============================================================== ALTERNATES
def f_B1alt(rng):
    """The waterfront wakes: across the frozen harbour to Katajanokka's waterfront, its windows blooming."""
    out = []
    hz = 1160
    out.append(sky(v(12), v(19), v(36), v(62), hz, glow=(540, 600, 120, v(70), 0.5)))
    out.append(cloud(760, 180, 620, 170, v(22), v(38), rng, n=11))
    out.append(streak(-40, 780, 560, 34, v(32), 0.5))
    # the waterfront: blocks shoulder to shoulder, steep snowy roofs, chimneys, a dome, the cathedral behind
    rngb = random.Random(21)
    x = -20
    qy = 1150
    rows = []
    while x < 1100:
        bw = rngb.uniform(110, 170)
        top = qy - rngb.uniform(250, 330)
        rows.append((x, bw, top))
        x += bw + rngb.uniform(-2, 2)
    # Uspenski's domes rising behind the roofs (left of centre)
    out.append(rect(250, 760, 120, 120, v(24)))
    for (dx, dr, hh) in ((310, 26, 70), (268, 13, 36), (352, 13, 36)):
        out.append(path('M%.1f,%.1f Q%.1f,%.1f %.1f,%.1f Q%.1f,%.1f %.1f,%.1f Z' % (dx - dr, 760, dx - dr * 1.1, 760 - hh * 0.8, dx, 760 - hh * 1.25,
                                                                               dx + dr * 1.1, 760 - hh * 0.8, dx + dr, 760), v(30)))
        out.append(line(dx, 760 - hh * 1.25, dx, 760 - hh * 1.6, v(30), 2.4))
    for i, (x0, bw, top) in enumerate(rows):
        face = v(20 + (i * 5) % 9)
        out.append(rect(x0, top, bw, qy - top, face))
        rf = top - rngb.uniform(50, 80)
        out.append(poly([(x0 - 4, top), (x0 + bw + 4, top), (x0 + bw - 20, rf), (x0 + 20, rf)], v(13)))
        out.append(poly([(x0 + 20, rf), (x0 + bw - 20, rf), (x0 + bw - 14, rf + 12), (x0 + 14, rf + 12)], v(74)))
        out.append(poly([(x0 - 6, top - 2), (x0 + bw + 6, top - 2), (x0 + bw, top - 12), (x0, top - 12)], v(72)))
        for cxx in (x0 + bw * 0.3, x0 + bw * 0.72):
            out.append(rect(cxx - 7, rf - 26, 14, 30, v(14)))
            out.append(rect(cxx - 9, rf - 30, 18, 6, v(74)))
        if i == 3:
            out.append(path('M%.1f,%.1f Q%.1f,%.1f %.1f,%.1f Z' % (x0 + bw * 0.25, rf + 4, x0 + bw * 0.5, rf - 90, x0 + bw * 0.75, rf + 4), v(15)))
        for k in range(5):
            wy = top + 26 + k * (qy - top - 60) / 5
            for j in range(3):
                wx = x0 + bw * (j + 0.5) / 3 - 11
                lit = rngb.random() < 0.82
                if lit:
                    out.append(warm_window(wx, wy, 22, 32, t=84 + rngb.uniform(-6, 8), mullion=False))
                else:
                    out.append(rect(wx, wy, 22, 32, v(10)))
                out.append(rect(wx - 3, wy + 32, 28, 4, v(74)))
    # the quay with its snow, the moored icebreaker at the right, the warm current along the quay into the doors
    out.append(rect(0, qy, W, 18, v(70)))
    out.append(rect(0, qy + 18, W, 14, v(24)))
    out.append(icebreakers(rng, qy + 40, [(700, 0.55, True)]))
    d = smooth([(-20, qy + 8), (300, qy + 7), (600, qy + 8), (1100, qy + 7)])
    out.append(path(d, 'none', w(66), 26, 0.6, extra='filter="url(#gM)"'))
    out.append(path(d, 'none', w(92), 6, 1.0))
    for (x0, bw, top) in rows:
        out.append(line(x0 + bw * 0.5, qy + 8, x0 + bw * 0.5, qy - 20, w(90), 4))
    # the frozen harbour: cracked plate ice, the windows' warmth reflected in the wet cracks
    out.append('<defs><linearGradient id="iceg" x1="0" y1="%d" x2="0" y2="1920" gradientUnits="userSpaceOnUse">'
               '<stop offset="0" stop-color="%s"/><stop offset="1" stop-color="%s"/></linearGradient></defs>' % (qy + 32, v(52), v(36)))
    out.append(rect(0, qy + 32, W, H, 'url(#iceg)'))
    for (x0, bw, top) in rows:
        out.append(rect(x0 + bw * 0.3, qy + 40, bw * 0.4, 160, w(72), 0.16, extra='filter="url(#gM)"'))
    for i in range(70):
        x = rng.uniform(-40, W)
        y = rng.uniform(qy + 40, H)
        l_ = rng.uniform(40, 200) * (y - qy) / 600
        out.append(line(x, y, x + l_, y + rng.uniform(-10, 14), v(28), 2.5 * (y - qy) / 500 + 0.8, 0.6))
    for i in range(10):
        x = rng.uniform(0, W)
        y = rng.uniform(qy + 300, H)
        out.append(ell(x, y, rng.uniform(80, 200), rng.uniform(12, 30), v(56), 0.4))
    out.append(snowfall(rng, n=160))
    out.append(pov_phone(170, 1300, scale=0.92))
    out.append(caption([[('wants AI to heat', False)], [('70,000', True), (' homes?', False)]]))
    return ''.join(out) + texture()


def f_B5alt(rng):
    """The tea cosy: the giant computer wearing a huge knitted tea cosy, steam out of its pompom."""
    out = [hall_front_bg(rng)]
    out.append(side_racks(rng, y0=760, y1=1600, xs=((-300, 160), (920, 1380))))
    cx, base, cw, ch = 470, 1600, 560, 900
    top = base - ch
    # the cosy's dome (a soft, slightly lumpy knitted shape), the heat glowing at its hem
    out.append(ell(cx, base - 10, cw * 0.6, 60, w(70), 0.5, extra='filter="url(#gL)"'))
    dome = smooth([(cx - cw / 2, base), (cx - cw / 2 - 8, base - ch * 0.55), (cx - cw * 0.36, base - ch * 0.88), (cx, top),
                   (cx + cw * 0.36, base - ch * 0.88), (cx + cw / 2 + 8, base - ch * 0.55), (cx + cw / 2, base)], closed=True)
    out.append(path(dome, v(30)))
    # knit pattern: ribbed hem, rows of zigzags and snowflakes (a Nordic knit), tone-on-tone
    out.append(rect(cx - cw / 2, base - 70, cw, 70, v(24)))
    for xx in range(int(cx - cw / 2) + 8, int(cx + cw / 2), 18):
        out.append(line(xx, base - 66, xx, base - 4, v(36), 6, 0.8))
    for row, yy in enumerate((base - 150, base - 330, base - 510)):
        span = cw * (0.98 - 0.12 * row)
        pts_ = []
        n = int(span / 36)
        for k in range(n + 1):
            pts_.append((cx - span / 2 + k * span / n, yy + (14 if k % 2 else -14)))
        out.append(path('M' + ' L'.join('%.1f,%.1f' % q for q in pts_), 'none', v(56), 8, 0.9))
    for (fx, fy, fr) in ((cx - 150, base - 245, 34), (cx, base - 245, 38), (cx + 150, base - 245, 34), (cx - 80, base - 425, 30), (cx + 80, base - 425, 30)):
        for a in range(6):
            ang = a * math.pi / 3
            out.append(line(fx, fy, fx + math.cos(ang) * fr, fy + math.sin(ang) * fr, v(62), 6))
        out.append(circ(fx, fy, 7, v(66)))
    # the heat escaping at the hem and through the knit (warm light low), steam out of the top
    out.append(rect(cx - cw / 2, base - 16, cw, 16, w(84), 0.8))
    # the pompom
    out.append(circ(cx, top - 40, 58, v(46)))
    for k in range(16):
        ang = k * math.pi / 8
        out.append(line(cx + math.cos(ang) * 30, top - 40 + math.sin(ang) * 30, cx + math.cos(ang) * 60, top - 40 + math.sin(ang) * 60, v(58), 6))
    out.append(wisps(cx, top - 96, 0, 1, w(90), 1, rng, spread=1, op=0.0))
    out.append(wisps(cx + 6, top - 90, 60, 5, w(90), 10, rng, spread=20, op=0.6, lean=0.2))
    # the computer's feet and the edge of its cyan lights peeking under the hem
    for xx in range(int(cx - cw / 2) + 40, int(cx + cw / 2) - 30, 46):
        out.append(circ(xx, base - 8, 3.5, v(94)))
    # the engineer, holding up one tiny mug as if waiting for her pour
    out.append(person(870, 1600, 410, v(7), rim=(w(70), -1), pose='stand', facing=-1, cap=True, scarf=v(26)))
    out.append(path('M%.1f,%.1f Q%.1f,%.1f %.1f,%.1f' % (850, 1300, 800, 1290, 772, 1250), 'none', v(7), 22))
    out.append(rect(744, 1214, 40, 44, v(90), rx=6))
    out.append(ell(560, 1650, 330, 50, w(70), 0.3, extra='filter="url(#gL)"'))
    out.append(caption([[("That's a lot of ", False), ('tea.', True)]]))
    return ''.join(out) + texture()


def f_B7alt(rng):
    """The street opens a way: manholes pop open down the street, a warm runway reaching for the far plumes."""
    cam = Cam(f=1000, cx=540, cy=1150, eye=1.6)
    P = cam.P
    body = street_of_homes(rng, cam, bloom=0.0, seam=False, phone=False, people=True, far_lit=0.0)
    # the far plumes over the roofs at the street's end (the hall's fans, still blowing)
    for k, x in enumerate((470, 520, 575)):
        body += wisps(x, 1120, 420, 5, v(70), 14, rng, spread=20, op=0.4, blur='gM', lean=0.2)
        body += ell(x, 1110, 26, 12, w(80), 0.7, extra='filter="url(#gS)"')
    # the runway: manhole lids tilted open one after another, warm light breathing up out of each
    for i, Z in enumerate((5.5, 8.5, 13, 20, 31, 48, 75, 115)):
        c = P(0, 0, Z)
        rx = 0.55 * 1000 / Z
        ry = rx * 1.6 / Z * 1.0 + 1.5
        body += ell(c[0], c[1], rx * 2.6, ry * 3.0 + 6, w(70), 0.45, extra='filter="url(#gM)"')
        body += ell(c[0], c[1], rx, max(2, ry), w(94))
        # the lid, lifted and tilted on its edge
        lid = [(c[0] + rx * 0.9, c[1]), (c[0] + rx * 1.9, c[1] - rx * 0.9), (c[0] + rx * 2.2, c[1] - rx * 0.75), (c[0] + rx * 1.15, c[1] + 2)]
        body += poly(lid, v(16))
        body += wisps(c[0], c[1], rx * 3.2 + 10, 3, w(90), max(2, rx * 0.25), rng, spread=rx * 0.4, op=0.55, blur='gS')
    body += caption([[('But Helsinki', False)], [('wants', True), (' that heat.', False)]])
    return body + texture()


def f_B11alt(rng):
    """The melt line: no cut; the heat shows as a melted line in the snow, a steaming manhole, frost clearing up the block."""
    def litf(k, j):
        return {0: True, 1: True, 2: j in (1, 2, 4), 3: j in (2,), 4: False}.get(k, False)
    out = [street_across(rng, litf, focal=(2, 2))]
    fl_h = (1330 - 150 - 700) / 5
    fw, fh = 70, 108
    fx = 170 + (930 - 170) * 2.5 / 5 - fw / 2
    fy = 700 + 2 * fl_h + fl_h * 0.22
    out.append(warm_window(fx, fy, fw, fh, t=92))
    out.append(person(fx + fw * 0.6, fy + fh + 2, fh * 0.92, v(14), pose='stand', cap=False))
    # the frost still on the upper windows (pale), already cleared below
    for k in (3, 4):
        for j in range(5):
            wx = 170 + (930 - 170) * (j + 0.5) / 5 - 35
            wy = 700 + (4 - k) * fl_h + fl_h * 0.22
            out.append(rect(wx, wy, 70, 108, v(70), 0.35))
    # the melt line across the street, warm from beneath, widening at a steaming manhole
    mp = [(470, 1920), (500, 1760), (526, 1600), (540, 1460), (556, 1340)]
    out.append(path(smooth(mp), 'none', v(30), 90, 0.5, extra='filter="url(#gS)"'))
    out.append(path(smooth(mp), 'none', w(70), 54, 0.5, extra='filter="url(#gM)"'))
    out.append(path(smooth(mp), 'none', w(86), 14, 0.9))
    out.append(ell(540, 1460, 64, 15, v(20)))
    out.append(ell(540, 1456, 50, 10, w(80), 0.7))
    out.append(wisps(540, 1450, 240, 6, w(90), 16, rng, spread=26, op=0.5, blur='gM', lean=0.1))
    out.append(wisps(548, 1320, 160, 5, v(84), 12, rng, spread=34, op=0.3, blur='gM', lean=0.2))
    out.append(snowfall(rng, n=150))
    out.append(caption([[('carry that heat', False)], [("into people's ", False), ('homes.', True)]], size=96))
    return ''.join(out) + texture()


FRAMES = {
    'B1': f_B1, 'B2': f_B2, 'B3': f_B3, 'B4': f_B4, 'B5': f_B5, 'B6': f_B6, 'B7': f_B7, 'B8': f_B8,
    'B9': f_B9, 'B10': f_B10, 'B11': f_B11, 'B12': f_B12,
    'B1alt': f_B1alt, 'B5alt': f_B5alt, 'B7alt': f_B7alt, 'B11alt': f_B11alt,
}


def main(ids):
    os.makedirs(PAGES, exist_ok=True)
    for fid in ids or list(FRAMES):
        rng = random.Random(sum(ord(c) * (i + 1) for i, c in enumerate(fid)) + 17)
        body = FRAMES[fid](rng)
        with open(os.path.join(PAGES, fid + '.html'), 'w') as fh:
            fh.write(page(body))
        print('wrote', fid)


if __name__ == '__main__':
    main(sys.argv[1:])
