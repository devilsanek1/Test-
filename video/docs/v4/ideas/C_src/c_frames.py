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


# ============================================================== round 1 helpers (the frame loop's adjust round)
CYAN_GLOW = '#8fe3ff'
CYAN_CORE = '#effdff'
CHALK_HI = '#e6e9f7'


def figure(J, col, wl=14.0, wa=11.0, rim=None, cap=True):
    """A small modern figure as one silhouette, posed by its joints (screen px): legs, a work jacket, arms, a knit cap.
    J: hipL/R, knL/R, ftL/R, shL/R, elL/R, haL/R, neck, head, hr (head radius), tilt, hem; openL/R = finger angle for an
    open hand. rim = (colour, dx): the lit sliver on the side the story light touches."""
    def body():
        o = []
        for sd in ('L', 'R'):
            o.append(path('M%.1f,%.1f L%.1f,%.1f L%.1f,%.1f' % (J['hip' + sd] + J['kn' + sd] + J['ft' + sd]), 'none', col, wl))
            fx, fy = J['ft' + sd]
            o.append(ell(fx + J.get('toe' + sd, -wl * 0.35), fy - wl * 0.2, wl * 0.8, wl * 0.4, col))
        sl, sr, hl, hr_ = J['shL'], J['shR'], J['hipL'], J['hipR']
        hem = J.get('hem', wl * 0.9)
        o.append(path(smooth([(sl[0] + wa * 0.15, sl[1] - wa * 0.3), ((sl[0] + sr[0]) / 2, (sl[1] + sr[1]) / 2 - wa * 0.5),
                              (sr[0] - wa * 0.15, sr[1] - wa * 0.3), (sr[0] + wa * 0.4, sr[1] + wa * 0.6),
                              (hr_[0] + wl * 0.5, hr_[1] + hem), ((hl[0] + hr_[0]) / 2, (hl[1] + hr_[1]) / 2 + hem * 1.06),
                              (hl[0] - wl * 0.5, hl[1] + hem), (sl[0] - wa * 0.4, sl[1] + wa * 0.6)], closed=True), col))
        for sd in ('L', 'R'):
            o.append(path('M%.1f,%.1f L%.1f,%.1f L%.1f,%.1f' % (J['sh' + sd] + J['el' + sd] + J['ha' + sd]), 'none', col, wa))
            hx, hy = J['ha' + sd]
            if J.get('open' + sd) is not None:
                o.append(open_hand(hx, hy, J['open' + sd], wa * 1.9, col))
            else:
                o.append(circ(hx, hy, wa * 0.62, col))
        nx, ny = J['neck']
        hx, hy = J['head']
        r = J['hr']
        o.append(path('M%.1f,%.1f L%.1f,%.1f' % (nx, ny, hx, hy + r * 0.45), 'none', col, r * 0.8))
        rot = 'transform="rotate(%.1f %.1f %.1f)"' % (J.get('tilt', 0.0), hx, hy)
        o.append(ell(hx, hy, r * 0.86, r, col, extra=rot))
        if cap:
            o.append(g([ell(hx, hy - r * 0.42, r * 0.95, r * 0.72, col), rect(hx - r * 0.98, hy - r * 0.42, r * 1.96, r * 0.34, col, rx=r * 0.15)], rot))
        return ''.join(o)
    fig_ = body()
    if rim:
        rim_svg = fig_.replace('"%s"' % col, '"%s"' % rim[0])
        return g([rim_svg], 'transform="translate(%.1f,0)" opacity="0.75" filter="url(#soft1)"' % rim[1]) + fig_
    return fig_


def open_hand(cx, cy, ang, sz, col):
    """An open hand (a mitten's palm and four fingers spread), the fingers pointing at angle `ang` (degrees, screen)."""
    a = math.radians(ang)
    o = [ell(cx, cy, sz * 0.42, sz * 0.5, col, extra='transform="rotate(%.1f %.1f %.1f)"' % (ang + 90, cx, cy))]
    for k, da in enumerate((-30, -10, 10, 30)):
        b = math.radians(ang + da)
        x0, y0 = cx + math.cos(a) * sz * 0.3, cy + math.sin(a) * sz * 0.3
        L = sz * (0.62 if k in (1, 2) else 0.52)
        o.append(path('M%.1f,%.1f L%.1f,%.1f' % (x0, y0, x0 + math.cos(b) * L, y0 + math.sin(b) * L), 'none', col, sz * 0.17))
    b = math.radians(ang + 70)
    o.append(path('M%.1f,%.1f L%.1f,%.1f' % (cx, cy, cx + math.cos(b) * sz * 0.5, cy + math.sin(b) * sz * 0.5), 'none', col, sz * 0.19))
    return ''.join(o)


def melt_channel(cam, rng, z_near, z_far, xc=lambda z: 0.0, hw0=0.42, steam_at=(), steam_scale=1.0, n=70, glow_hw=1.6):
    """The heat under the snow, painted as a soft, ragged melt channel along Z: the snow lit from beneath, sagging dark
    and wet along it, wet stones glowing in it, light through its cracks, steam lifting off it."""
    P, f = cam.P, cam.f
    out = []
    zs = [z_near * (z_far / z_near) ** (i / n) for i in range(n + 1)]

    def hw(z):
        return hw0 * (1 + 0.22 * math.sin(z * 1.9 + 0.7) + 0.14 * math.sin(z * 5.3 + 2.1) + 0.1 * math.sin(z * 0.37))

    def band(extra_hw):
        return [P(xc(z) - hw(z) - extra_hw, 0, z) for z in zs] + [P(xc(z) + hw(z) + extra_hw, 0, z) for z in zs][::-1]
    out.append(poly(band(glow_hw), w(60), 0.30, extra='filter="url(#gL)"'))
    out.append(poly(band(0.24), v(24), 0.72, extra='filter="url(#soft3)"'))
    out.append(poly(band(0.0), w(56), 0.95))
    out.append(poly(band(-0.12), w(74), 0.6, extra='filter="url(#gS)"'))
    # wet dark stones showing through the melt
    for _ in range(int(n * 0.7)):
        z = math.exp(rng.uniform(math.log(z_near + 0.4), math.log(min(z_far, 140))))
        c = P(xc(z) + rng.uniform(-0.65, 0.65) * hw(z), 0, z)
        rx = f * 0.11 / z
        out.append(ell(c[0], c[1], rx * 0.8, max(0.8, rx * cam.eye / z * 1.1), v(20), 0.38))
    # light coming up through the cracks (broken, never a stripe)
    for i in range(n):
        if rng.random() < 0.4:
            continue
        z0, z1 = zs[i], zs[i + 1]
        a = P(xc(z0) + rng.uniform(-0.25, 0.25) * hw(z0), 0, z0)
        b = P(xc(z1) + rng.uniform(-0.25, 0.25) * hw(z1), 0, z1)
        out.append(line(a[0], a[1], b[0], b[1], w(96), max(0.9, f * 0.05 / z0), 0.85))
    # steam lifting off it where the heat meets the cold
    for z in steam_at:
        c = P(xc(z), 0, z)
        sc = f / z
        out.append(wisps(c[0], c[1], 1.5 * sc * steam_scale, 3, mix(w(86), v(88), 0.45), max(1.4, 0.09 * sc), rng,
                         spread=0.3 * sc, op=0.5, blur='gS', lean=0.12))
    return ''.join(out)


def melt_branch(cam, rng, z, x0, x1, hw=0.16):
    """A thin melt line across the street at depth z, from x0 to x1 (the heat turning in at a door)."""
    P = cam.P
    xs = [x0 + (x1 - x0) * t / 10 for t in range(11)]
    jit_ = [rng.uniform(-0.05, 0.05) for _ in xs]
    up = [P(x, 0, z - hw - j) for x, j in zip(xs, jit_)]
    dn = [P(x, 0, z + hw + j) for x, j in zip(xs, jit_)][::-1]
    sag_up = [P(x, 0, z - hw * 2.2 - j) for x, j in zip(xs, jit_)]
    sag_dn = [P(x, 0, z + hw * 2.2 + j) for x, j in zip(xs, jit_)][::-1]
    a, b = P(x0, 0, z), P(x1, 0, z)
    return (poly(sag_up + sag_dn, v(26), 0.6, extra='filter="url(#soft1)"') + poly(up + dn, w(62), 0.9) +
            line(a[0], a[1], b[0], b[1], w(94), max(0.8, cam.f * 0.035 / z), 0.9) +
            poly(up + dn, w(78), 0.45, extra='filter="url(#gS)"'))


def chalk_bold(a, b, rng, sw=6.0, op=0.95, glow=0.28, breaks=True):
    """A bold chalk line with a faint glow of its own (the plan reads at phone size: almost there)."""
    return (line(a[0], a[1], b[0], b[1], v(92), sw * 3.0, glow, extra='filter="url(#gS)"') +
            chalk_line(a, b, rng, sw, col=CHALK_HI, op=op, breaks=breaks))


def chalk_poly(pts_, rng, sw=6.0, op=0.95, glow=0.28, closed=False):
    out = []
    seq = list(pts_) + ([pts_[0]] if closed else [])
    for a, b in zip(seq, seq[1:]):
        out.append(chalk_bold(a, b, rng, sw, op, glow))
    return ''.join(out)


def running_head(cam, rng, xc, head_z, size=1.0):
    """THE RUNNING HEAD of the warm current: a bright front racing under the snow, the melt trailing behind it, a soft
    burst of steam thrown up and back; just ahead of it the cold snow lifting and cracking (it is coming)."""
    P = cam.P
    out = []
    # THE RUNNING HEAD: a bright front racing under the snow toward us, the melt trailing behind it, a soft burst
    # of steam thrown up and back; just ahead of it the cold snow lifting and cracking (it is coming)
    hz_ = head_z

    def prof(t, p):
        return max(0.0, 1 - min(1.0, max(0.0, t)) ** p) ** 0.5

    def teardrop(L, hw_, p, cap=0.32):
        # a rounded nose at the front (toward us), the tail narrowing behind it
        zz = [hz_ - cap * math.cos(math.pi / 2 * t / 6) for t in range(6)] + [hz_ + L * t / 12 for t in range(13)]

        def wd(z):
            if z < hz_:
                return hw_ * math.sqrt(max(0.0, 1 - ((hz_ - z) / cap) ** 2))
            return hw_ * prof((z - hz_) / L, p)
        return [P(xc(z) - wd(z), 0, z) for z in zz] + [P(xc(z) + wd(z), 0, z) for z in zz][::-1]
    comet = teardrop(2.6 * size, 0.62 * size, 1.3)
    sc = cam.f / hz_ * size
    hc = P(xc(hz_), 0, hz_)
    out.append(ell(hc[0], hc[1] - 0.12 * sc, 1.5 * sc, 0.45 * sc, w(70), 0.42, extra='filter="url(#gL)"'))
    out.append(poly(comet, w(80), 0.95, extra='filter="url(#gS)"'))
    out.append(poly(comet, w(92), 0.9, extra='filter="url(#soft3)"'))
    out.append(poly(teardrop(0.9 * size, 0.5 * size, 1.5), w(100), 0.95, extra='filter="url(#soft3)"'))
    # the cold snow just ahead, lifting: a pale lip and a few short cracks
    mound = P(xc(hz_), 0.0, hz_ - 0.45)
    out.append(ell(mound[0], mound[1], 0.75 * sc, 0.07 * sc, v(78), 0.55, extra='filter="url(#gS)"'))
    for k in range(4):
        x_ = -0.36 + 0.24 * k + rng.uniform(-0.05, 0.05)
        a = P(xc(hz_) + x_, 0, hz_ - 0.4)
        b = P(xc(hz_) + x_ * 1.4 + rng.uniform(-0.1, 0.1), 0, hz_ - rng.uniform(0.75, 1.0))
        out.append(line(a[0], a[1], b[0], b[1], v(36), max(1.2, 0.016 * sc), 0.38))
    for (dz, dx, ry_, rx_, col, op) in ((0.4, 0.0, 0.5, 0.42, w(92), 0.5), (1.2, 0.1, 0.95, 0.5, mix(w(92), v(94), 0.4), 0.36),
                                        (2.2, -0.05, 1.35, 0.55, mix(w(92), v(96), 0.6), 0.24)):
        c = P(xc(hz_ + dz) + dx, ry_, hz_ + dz)
        out.append(steam_puff(c[0], c[1], rx_ * sc, rx_ * 0.75 * sc, col, op))
    for k in range(12):
        z = hz_ + rng.uniform(0.0, 1.0)
        c = P(xc(z) + rng.uniform(-0.6, 0.6), rng.uniform(0.1, 0.9), z)
        out.append(circ(c[0], c[1], rng.uniform(1.5, 3.0), w(96), 0.75))
    return ''.join(out)


# ============================================================== THE STREET OF HOMES (B1, B7alt)
def street_of_homes(rng, cam, bloom=1.0, head_z=None, phone=True, phone_sent=False, people=True, far_lit=0.9, tram=True):
    """The island's street at a person's eye height. head_z: the warm current's running head (None: no current).
    bloom: 0 = every window cold; 'wave' = the windows bloom only behind the head, the far blocks full, the near ones
    just starting from their lowest floor (the heat arrives at the cellar and climbs)."""
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
    # the wave: how high the warm has climbed in each block (floors from the lowest; 99 = every floor)
    climbed = {0: 0, 1: 1, 2: 2, 3: 3}
    order = list(range(len(specs)))[::-1]
    for i in order:
        z0, z1, h, tur = specs[i]
        near_h = specs[i - 1][2] if i > 0 else 0.0

        def litf(k, j, i=i):
            if bloom == 'wave':
                if k == 99:
                    return i >= 4 and random.Random(i * 31 + j).random() < 0.8
                r = random.Random(i * 1000 + k * 37 + j).random()
                return k <= climbed.get(i, 99) and r < (0.86 if i < 4 else 0.8)
            r = random.Random(i * 1000 + k * 37 + j).random()
            return r < (0.8 * bloom if i < 8 else 0.7 * bloom)

        def ltf(k, j, i=i):
            r = random.Random(i * 77 + k * 5 + j)
            return 80 + r.uniform(-6, 10)
        door = z0 + (z1 - z0) * 0.45
        out.append(jugend_block_street(cam, rng, z0, z1, h, face=faces[i], side=mix(faces[i], v(44), 0.5),
                                       lit=litf, lit_t=ltf, turret=tur, door_z=door, near_h=near_h,
                                       chimneys=2 if z1 - z0 < 16 else 3, gable=(i == 2)))
    # the street: pavement (right), kerb, the snowy street, the quay edge (left)
    out.append(poly([P(10.5, 0, 6), P(12, 0, 6), P(12, 0, 300), P(10.5, 0, 300)], v(58)))
    for k in range(70):
        Z = math.exp(rng.uniform(math.log(3.0), math.log(60)))
        X = rng.choice([-5.5, -4.8, 4.6, 5.3, 8.0, 8.6]) + rng.uniform(-0.3, 0.3)
        a = P(X, 0, Z)
        r_ = max(1.2, 70 / Z)
        out.append(ell(a[0], a[1], r_ * 1.4, r_ * 0.5, v(26), 0.35))
    out.append(poly([P(-7, 0, 4), P(-7, 0, 300), P(-7, -1.2, 300), P(-7, -1.2, 4)], v(30)))
    out.append(poly([P(-7.4, 0.05, 4), P(-7.4, 0.05, 300), P(-6.4, 0.05, 300), P(-6.4, 0.05, 4)], v(70)))
    for zz in (12, 22, 34, 48, 66, 90, 130, 180):
        a = P(-6.8, 0, zz)
        b = P(-6.8, 0.7, zz)
        r_ = max(2, 300 / zz)
        out.append(rect(a[0] - r_, b[1], 2 * r_, a[1] - b[1], v(14)))
        out.append(ell(a[0], b[1], r_ * 1.1, r_ * 0.45, v(78)))
    for X in (1.2, 2.6):
        a, b = P(X, 0, 5), P(X, 0, 300)
        out.append(line(a[0], a[1], b[0], b[1], v(30), 3.0, 0.8))
    for X in (5.5, 7.2, -3.5, -2.2):
        a, b = P(X, 0, 4), P(X, 0, 300)
        out.append(line(a[0], a[1], b[0], b[1], v(44), 9, 0.35))
    # THE CURRENT: the heat under the snow, lit from the harbour end to its running head; nearer than the head, cold
    if head_z is not None:
        def xc(z):
            return 0.08 * math.sin(z * 0.21) + 0.05 * math.sin(z * 0.9 + 1.3)
        out.append(melt_channel(cam, rng, head_z + 1.2, 298, xc=xc, hw0=0.46, glow_hw=1.0,
                                steam_at=(head_z + 4.5, 17, 26, 40, 62), steam_scale=0.6))
        # it turns in at each door it has passed, and the door glows where the heat goes in
        for i, (z0, z1, h, tur) in enumerate(specs[:7]):
            dz = z0 + (z1 - z0) * 0.45 + 0.8
            if dz <= head_z:
                continue
            out.append(melt_branch(cam, rng, dz, xc(dz) + 0.4, 12.0))
            dq = [P(11.95, 0, dz - 0.8), P(11.95, 0, dz + 0.8), P(11.95, 2.6, dz + 0.8), P(11.95, 2.6, dz - 0.8)]
            out.append(poly(dq, w(76), 0.85))
        # the source: a warm breath at the hall where it starts
        src = P(-2.5, 0.5, 298)
        out.append(ell(src[0], src[1], 34, 12, w(82), 0.85, extra='filter="url(#gM)"'))
        out.append(running_head(cam, rng, xc, head_z))
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
    a, b = P(2.0, 6.4, 12), P(2.0, 6.4, 300)
    out.append(line(a[0], a[1], b[0], b[1], v(10), 1.6, 0.85))
    for zz in (13, 24, 40, 62, 95, 140):
        a, b = P(-6.5, 7.6, zz), P(12, 7.9, zz)
        mid = P(2.6, 6.9, zz)
        out.append(path('M%.1f,%.1f Q%.1f,%.1f %.1f,%.1f' % (a[0], a[1], mid[0], mid[1] + 16 / zz * 10, b[0], b[1]), 'none', v(10), max(0.8, 18 / zz)))
        out.append(hung_lamp(mid[0], mid[1] + 12 / zz * 10, r=max(2.2, 90 / zz)))
    # people: a couple stopped on the right pavement, looking down at the glowing snow; a walker beyond
    if people:
        for (X, Z, hh, pose) in ((9.2, 30, 1.75, 'stand'), (10.0, 31, 1.65, 'stand')):
            fx, fy = P(X, 0, Z)
            top = P(X, hh, Z)
            out.append(person(fx, fy, fy - top[1], v(10), rim=(v(40), -1), pose=pose, cap=True))
        X, Z = 8.4, 52
        fx, fy = P(X, 0, Z)
        top = P(X, 1.7, Z)
        out.append(person(fx, fy, fy - top[1], v(12), pose='walk', cap=True))
    out.append(snowfall(rng, n=170))
    if phone:
        out.append(pov_phone(250, 1300, scale=0.92, sent=phone_sent))
    return ''.join(out)


# ============================================================== frames
def f_B1(rng):
    cam = Cam(f=1000, cx=540, cy=1150, eye=1.6)
    body = street_of_homes(rng, cam, bloom='wave', head_z=7.6, phone=True)
    body += caption([[('wants AI to heat', False)], [('70,000', True), (' homes?', False)]])
    return body + texture()


# ============================================================== THE STREET OF COMPUTERS (B2-B5)
def hall_aisle(rng, cam, warm_rack=(1, 5), spark=True, engineer=True):
    """The aisle drawn on purpose like B1's street: the computers stand in blocks like apartment blocks (each block its
    own roofline and cornice), their faces grids of small cool lights like windows, cross-aisles like side streets,
    cable trays strung across like tram wires with lamps hung under them; a canyon glowing with thousands of lights.
    warm_rack = (side, index): the ONE computer answering your question, the only warm thing."""
    P = cam.P
    out = []
    # the ceiling: the band's calm dark field, a cool haze where the lights are
    out.append('<defs><linearGradient id="ceil" x1="0" y1="0" x2="0" y2="1">'
               '<stop offset="0" stop-color="%s"/><stop offset="0.32" stop-color="%s"/><stop offset="0.5" stop-color="%s"/>'
               '<stop offset="1" stop-color="%s"/></linearGradient></defs>' % (v(9), v(11), v(14), v(30)))
    out.append(rect(0, 0, W, cam.cy, 'url(#ceil)'))
    # the floor: polished, catching the canyon's light
    out.append('<defs><linearGradient id="floorg" x1="0" y1="%.0f" x2="0" y2="%d" gradientUnits="userSpaceOnUse">'
               '<stop offset="0" stop-color="%s"/><stop offset="0.35" stop-color="%s"/><stop offset="1" stop-color="%s"/>'
               '</linearGradient></defs>' % (cam.cy, H, v(48), v(40), v(30)))
    out.append(rect(0, cam.cy, W, H - cam.cy, 'url(#floorg)'))
    sheen = [P(-0.7, 0, 1.6), P(0.7, 0, 1.6), P(0.3, 0, 62), P(-0.3, 0, 62)]
    out.append(poly(sheen, v(66), 0.4, extra='filter="url(#gM)"'))
    for X in (-1.2, -0.6, 0, 0.6, 1.2):
        a, b = P(X, 0, 1.6), P(X, 0, 62)
        out.append(line(a[0], a[1], b[0], b[1], v(30), 1.5, 0.55))
    z = 2.0
    while z < 62:
        a, b = P(-1.7, 0, z), P(1.7, 0, z)
        out.append(line(a[0], a[1], b[0], b[1], v(30), max(0.6, 5 / z), 0.5))
        z += 0.6
    # the far wall, the loading door open on the snowy night (dim: the warm must win)
    fw = [P(-6, 0, 62), P(6, 0, 62), P(6, 7, 62), P(-6, 7, 62)]
    out.append(poly(fw, v(20)))
    door = [P(-1.5, 0, 62), P(1.5, 0, 62), P(1.5, 3.4, 62), P(-1.5, 3.4, 62)]
    out.append(poly(door, v(36)))
    dx0, dy1 = door[0]
    dx1, dy0 = door[2]
    out.append(rect(dx0, dy0 + (dy1 - dy0) * 0.62, dx1 - dx0, (dy1 - dy0) * 0.38, v(50)))
    for i in range(18):
        out.append(circ(rng.uniform(dx0, dx1), rng.uniform(dy0, dy1), 1.2, v(88), 0.7))
    # the blocks of computers, both sides: each block 10 racks, its own height (a roofline), a cross-aisle between
    heights = {1: [3.85, 4.5, 4.1, 4.7, 4.2, 4.6, 4.0, 4.4], -1: [3.65, 4.3, 4.7, 4.0, 4.5, 4.1, 4.6, 4.3]}
    reflections = []
    warm_quad = None
    items = []  # (depth, svg): painted far to near
    for side in (-1, 1):
        X = 1.7 * side
        zz = 2.4
        n = 0
        blk = 0
        while zz < 61:
            RH = heights[side][min(blk, 7)]
            zw = 0.62
            o = []
            if n % 10 == 0 and blk > 0:
                # the block's near end wall, seen across the cross-aisle (a side street), lit by its own few lights
                endw = [P(X, 0, zz), P(X + 1.6 * side, 0, zz), P(X + 1.6 * side, RH, zz), P(X, RH, zz)]
                o.append(poly(endw, v(18)))
                rr = random.Random(side * 31 + blk)
                for row in range(int((RH - 0.6) / 0.3)):
                    for cx_ in (0.3, 0.75, 1.2):
                        if rr.random() < 0.5:
                            q = P(X + cx_ * side, 0.45 + row * 0.3, zz)
                            o.append(circ(q[0], q[1], max(0.8, 6 / zz), v(90), 0.8))
                gap = [P(X, 0, zz - 1.6), P(X + 3.0 * side, 0, zz - 1.6), P(X + 3.0 * side, 0, zz), P(X, 0, zz)]
                o.append(poly(gap, v(30)))
            front = [P(X, 0, zz), P(X, 0, zz + zw), P(X, RH, zz + zw), P(X, RH, zz)]
            is_warm = (side, n) == warm_rack
            o.append(poly(front, v(22 + (n % 3) * 2)))
            e = [P(X - 0.01 * side, 0, zz), P(X - 0.01 * side, RH, zz)]
            o.append(line(e[0][0], e[0][1], e[1][0], e[1][1], v(12), max(0.6, 3 / zz), 0.9))
            if is_warm:
                warm_quad = (front, zz, RH)
            else:
                # window-like grid of small cool lights (two columns, rows like floors)
                rr = random.Random(side * 7919 + n * 104729)
                busy = 0.78 if blk % 2 == 0 else 0.62
                rows = int((RH - 0.6) / 0.24)
                for row in range(rows):
                    yy = 0.4 + row * 0.24
                    for cz in (0.1, 0.36):
                        q = [P(X - 0.02 * side, yy, zz + cz), P(X - 0.02 * side, yy, zz + cz + 0.16),
                             P(X - 0.02 * side, yy + 0.1, zz + cz + 0.16), P(X - 0.02 * side, yy + 0.1, zz + cz)]
                        if rr.random() < busy:
                            o.append(poly(q, mix(v(96), '#c9f1ff', rr.uniform(0.2, 0.7))))
                        else:
                            o.append(poly(q, v(14)))
                if zz < 40:
                    mid_ = P(X - 0.02 * side, RH * 0.5, zz + 0.3)
                    o.append(ell(mid_[0], mid_[1], max(4, 50 / zz * 4), max(10, 300 / zz * 4), '#bfeaff', 0.10, extra='filter="url(#gM)"'))
                reflections.append((X, zz))
            # the block's cornice: a lighter cap along its top (the roofline)
            cap_ = [P(X - 0.05 * side, RH, zz), P(X - 0.05 * side, RH, zz + zw + 0.05), P(X - 0.05 * side, RH + 0.12, zz + zw + 0.05), P(X - 0.05 * side, RH + 0.12, zz)]
            o.append(poly(cap_, v(46)))
            tp = [P(X, RH + 0.12, zz), P(X, RH + 0.12, zz + zw), P(X + 1.1 * side, RH + 0.12, zz + zw), P(X + 1.1 * side, RH + 0.12, zz)]
            o.append(poly(tp, v(26)))
            items.append((zz, ''.join(o)))
            n += 1
            if n % 10 == 0:
                zz += zw + 1.6
                blk += 1
            else:
                zz += zw + 0.05
    for _, svg in sorted(items, key=lambda it: -it[0]):
        out.append(svg)
    # the floor reflecting the walls of lights
    for (X, zz) in reflections:
        if zz > 34:
            continue
        a, b = P(X * 0.8, 0, zz), P(X * 0.8, 0, zz + 0.6)
        out.append(line(a[0], a[1], b[0], b[1], '#cdeeff', max(2, 26 / zz), 0.10, extra='filter="url(#gS)"'))
    # overhead: cable trays strung across the aisle like tram wires, a lamp hung under each; one long tray down the middle
    a, b = P(0.0, 4.95, 6.0), P(0.0, 4.95, 62)
    out.append(line(a[0], a[1], b[0], b[1], v(8), 3.0, 0.9))
    for zz in (7.6, 12.2, 18.6, 26.6, 35.2, 44.2, 52.2):
        L, R = P(-1.7, 4.85, zz), P(1.7, 4.85, zz)
        mid = P(0, 4.55, zz)
        out.append(path('M%.1f,%.1f Q%.1f,%.1f %.1f,%.1f' % (L[0], L[1], mid[0], mid[1] + 8 / zz * 10, R[0], R[1]), 'none', v(8), max(1.2, 30 / zz)))
        lamp = P(0, 4.35, zz)
        rr_ = max(2.4, 80 / zz)
        out.append(circ(lamp[0], lamp[1] + rr_, rr_ * 6, '#cfeeff', 0.10, extra='filter="url(#gM)"'))
        out.append(path('M%.1f,%.1f L%.1f,%.1f L%.1f,%.1f Z' % (lamp[0] - rr_ * 1.8, lamp[1] + rr_, lamp[0] + rr_ * 1.8, lamp[1] + rr_, lamp[0], lamp[1] - rr_ * 0.6), v(30)))
        out.append(ell(lamp[0], lamp[1] + rr_ * 1.05, rr_ * 1.3, rr_ * 0.45, v(98)))
    # a cool light down the aisle from the lamps
    out.append(poly([P(-1.0, 0, 3.0), P(1.0, 0, 3.0), P(0.4, 0, 55), P(-0.4, 0, 55)], '#d8f1ff', 0.10, extra='filter="url(#gL)"'))
    # THE HEAT IS BORN: the one computer answering your question wakes warm (its grille glowing from inside)
    if warm_quad:
        front, z0, RH = warm_quad
        X = 1.7
        out.append(poly(front, w(70), 0.85, extra='filter="url(#gL)"'))
        out.append(poly(front, w(80)))
        inner = [P(X - 0.02, 0.25, z0 + 0.06), P(X - 0.02, 0.25, z0 + 0.56), P(X - 0.02, RH - 0.25, z0 + 0.56), P(X - 0.02, RH - 0.25, z0 + 0.06)]
        out.append(poly(inner, w(94)))
        for k in range(int((RH - 0.6) / 0.2)):
            yy = 0.4 + k * 0.2
            a, b = P(X - 0.03, yy, z0 + 0.05), P(X - 0.03, yy, z0 + 0.57)
            out.append(line(a[0], a[1], b[0], b[1], w(56), 1.6, 0.75))
        pool = [P(0.4, 0, z0 - 1.4), P(1.7, 0, z0 - 0.6), P(1.7, 0, z0 + 1.4), P(0.4, 0, z0 + 2.0)]
        out.append(poly(pool, w(70), 0.4, extra='filter="url(#gL)"'))
        top = P(X + 0.2, RH + 0.15, z0 + 0.3)
        out.append(wisps(top[0] - 4, top[1], 120, 3, w(86), 14, rng, spread=10, op=0.3, blur='gM'))
    # the question arriving: a cool spark riding the right-hand cable tray in from the night, landing on that computer
    a, b = P(1.45, 5.05, 6.4), P(1.45, 5.05, 62)
    out.append(line(a[0], a[1], b[0], b[1], v(6), 7, 0.9))
    out.append(line(a[0], a[1] + 4, b[0], b[1] + 0.4, v(30), 1.5, 0.8))
    if spark and warm_quad:
        front, z0, RH = warm_quad
        land = P(1.62, RH + 0.18, z0 + 0.32)
        zs_ = [58, 46, 36, 28, 22, 17.5, 14, 11.5, 9.8]
        pts_ = [P(1.45, 5.0, z) for z in zs_]
        pts_ += [P(1.5, 4.75, 8.4), P(1.56, 4.45, 7.3), land]
        d = smooth(pts_)
        out.append(path(d, 'none', CYAN_GLOW, 18, 0.16, extra='filter="url(#gS)"'))
        nseg = len(pts_) - 1
        for i in range(nseg):
            t = (i + 1) / nseg
            a, b = pts_[i], pts_[i + 1]
            out.append(line(a[0], a[1], b[0], b[1], CYAN_CORE, 0.8 + 5.0 * t ** 2, 0.18 + 0.75 * t ** 1.5))
        for k in range(16):
            t = rng.uniform(0.35, 1.0)
            i = min(nseg - 1, int(t * nseg))
            a, b = pts_[i], pts_[i + 1]
            u = t * nseg - i
            out.append(circ(a[0] + (b[0] - a[0]) * u + rng.uniform(-8, 8), a[1] + (b[1] - a[1]) * u + rng.uniform(-8, 8),
                            rng.uniform(1.2, 2.6), CYAN_CORE, 0.8))
        out.append(circ(land[0], land[1], 52, CYAN_GLOW, 0.55, extra='filter="url(#gM)"'))
        out.append(circ(land[0], land[1], 14, CYAN_CORE))
        for k in range(6):
            ang = k * math.pi / 3 + 0.5
            out.append(line(land[0] + math.cos(ang) * 18, land[1] + math.sin(ang) * 18, land[0] + math.cos(ang) * 34,
                            land[1] + math.sin(ang) * 34, CYAN_CORE, 2.5, 0.6))
    # the engineer in the middle distance, looking up at the computer towering over her (its warm on her)
    if engineer:
        fx, fy = P(0.75, 0, 5.1)
        tp = P(0.75, 1.7, 5.1)
        out.append(person(fx, fy, fy - tp[1], v(8), rim=(w(80), 1), pose='look_up', facing=1, cap=True, scarf=v(30)))
    return ''.join(out)


def f_B2(rng):
    cam = Cam(f=900, cx=540, cy=1200, eye=1.5)
    body = hall_aisle(rng, cam)
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


def recoil_figure(x, foot_y, col, rim):
    """Her, recoiling from the heat: leaning away, a forearm up in front of her face with the open hand toward the heat,
    her scarf blown back by the hot air."""
    J = dict(ftL=(x - 44, foot_y), ftR=(x + 80, foot_y), knL=(x - 26, foot_y - 92), knR=(x + 62, foot_y - 94),
             hipL=(x + 2, foot_y - 190), hipR=(x + 38, foot_y - 194), shL=(x + 44, foot_y - 310), shR=(x + 96, foot_y - 298),
             elL=(x - 12, foot_y - 318), haL=(x + 22, foot_y - 384), elR=(x + 116, foot_y - 244), haR=(x + 102, foot_y - 190),
             neck=(x + 76, foot_y - 326), head=(x + 94, foot_y - 358), hr=27, tilt=28, hem=34, openL=-70,
             toeL=-12, toeR=10)
    scarf = path(smooth([(x + 64, foot_y - 330), (x + 100, foot_y - 340), (x + 128, foot_y - 352), (x + 146, foot_y - 344),
                         (x + 130, foot_y - 334), (x + 108, foot_y - 322), (x + 80, foot_y - 316)], closed=True), col)
    tail = path(smooth([(x + 114, foot_y - 336), (x + 136, foot_y - 330), (x + 152, foot_y - 318), (x + 138, foot_y - 314),
                        (x + 118, foot_y - 322)], closed=True), col)
    fig_ = figure(J, col, wl=25, wa=18, rim=rim)
    return fig_ + scarf + tail


def f_B3(rng):
    out = []
    # the hall behind and above the row: its lights (ceiling lamps, a cable tray's LEDs, the far row's lights). This
    # group is painted once as it is, and once again bent by the heat inside the column of hot air
    bg = []
    bg.append('<defs><linearGradient id="ceil3" x1="0" y1="0" x2="0" y2="1">'
              '<stop offset="0" stop-color="%s"/><stop offset="0.33" stop-color="%s"/><stop offset="0.5" stop-color="%s"/>'
              '<stop offset="1" stop-color="%s"/></linearGradient></defs>' % (v(9), v(11), v(15), v(22)))
    bg.append(rect(0, 0, W, H, 'url(#ceil3)'))
    bg.append(rect(0, 622, W, 8, v(20)))
    for x in range(40, 1080, 150):
        bg.append(rect(x - 20, 612, 120, 50, '#cfeeff', 0.10, extra='filter="url(#gM)"'))
        bg.append(rect(x, 632, 80, 12, v(96), rx=4))
    bg.append(rect(0, 700, W, 22, v(24)))
    for x in range(10, 1080, 22):
        bg.append(circ(x, 711, 2.6, v(96) if (x // 22) % 3 else '#9fe8ff', 0.9))
    for k in range(9):
        x0 = k * 130 - 20
        bg.append(path('M%.1f,722 Q%.1f,%.1f %.1f,722' % (x0, x0 + 65, 748 + (k % 3) * 6, x0 + 130), 'none', v(14), 3, 0.9))
    bg.append(rect(0, 752, W, 196, v(14)))
    rr = random.Random(33)
    for yy in range(760, 942, 13):
        for xx in range(6, 1080, 15):
            if rr.random() < 0.6:
                bg.append(circ(xx + rr.uniform(-1, 1), yy, 2.0, mix(v(94), '#bfefff', rr.uniform(0, 0.6)), 0.95))
    out.append('<g id="b3bg">%s</g>' % ''.join(bg))
    # the near row: cool computers both sides
    for (a, b) in ((-300, 236), (744, 1380)):
        out.append(rect(a, 950, b - a, 700, v(12)))
        out.append(rect(a, 940, b - a, 12, v(30)))
        for xx in range(a + 18, b - 10, 26):
            for yy in range(982, 1630, 40):
                if rr.random() < 0.55:
                    out.append(circ(xx, yy, 3.0, v(92), 0.85))
    # the floor, and the warm spill in front of the computer
    out.append('<defs><linearGradient id="fl3" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="%s"/>'
               '<stop offset="1" stop-color="%s"/></linearGradient></defs>' % (v(32), v(20)))
    out.append(rect(0, 1650, W, H - 1650, 'url(#fl3)'))
    for k in range(9):
        yy = 1650 + (k ** 1.6) * 6
        out.append(line(0, yy, W, yy, v(16), 1.5, 0.6))
    for k in range(-8, 9):
        out.append(line(540 + k * 70, 1650, 540 + k * 260, H, v(16), 1.5, 0.5))
    out.append(ell(490, 1704, 340, 64, w(70), 0.5, extra='filter="url(#gL)"'))
    # THE COMPUTER, hot: its grille glowing from inside, hottest at its middle (a machine heating up, never a lit door)
    x0, y0, rw, rh = 270, 954, 440, 686
    out.append(rect(x0 - 12, y0 - 18, rw + 24, rh + 18, v(10)))
    out.append(rect(x0, y0, rw, rh, v(14)))
    out.append('<defs><clipPath id="grille3"><rect x="%d" y="%d" width="%d" height="%d"/></clipPath></defs>' % (x0, y0, rw, rh))
    out.append(g([ell(x0 + rw / 2, y0 + rh * 0.46, rw * 0.46, rh * 0.42, w(66), 0.55, extra='filter="url(#gL)"')], 'clip-path="url(#grille3)"'))
    cols, rows = 20, 42
    for r_ in range(rows):
        for c_ in range(cols):
            cx_ = x0 + 16 + c_ * (rw - 32) / (cols - 1)
            cy_ = y0 + 18 + r_ * (rh - 36) / (rows - 1)
            d = math.hypot((cx_ - (x0 + rw / 2)) / (rw * 0.55), (cy_ - (y0 + rh * 0.46)) / (rh * 0.55))
            t = max(0.0, 1 - d) * 1.4
            if t > 0.06:
                out.append(circ(cx_, cy_, 3.8, w(min(100, 50 + 50 * t)), min(1, 0.3 + t)))
            else:
                out.append(circ(cx_, cy_, 2.8, v(24)))
    for k in range(18):
        yy = y0 + 40 + k * (rh - 80) / 17
        if k > 2:
            out.append(circ(x0 + 9, yy, 4.6, w(88)))
            out.append(circ(x0 + 9, yy, 10, w(80), 0.4, extra='filter="url(#gS)"'))
        else:
            out.append(circ(x0 + 9, yy, 4.0, v(94)))
    out.append(rect(x0 + rw - 20, y0 + rh * 0.42, 9, 90, v(40), rx=4))
    # its top vent breathing out
    out.append(rect(x0 + 30, y0 - 14, rw - 60, 8, w(84), 0.9))
    # THE HEAT POURING UP: a tall wavering column of hot air off its top; through it the hall's lights bend and swim
    lft = [(326, 956), (300, 904), (318, 852), (270, 796), (292, 742), (236, 690), (252, 650), (206, 622)]
    rgt = [(654, 956), (684, 904), (662, 852), (712, 796), (690, 742), (748, 690), (730, 650), (780, 622)]
    top_ = [(300, 610), (380, 640), (450, 606), (520, 640), (600, 608), (680, 636)]
    col_d = smooth(lft + top_ + rgt[::-1], closed=True)
    out.append('<defs><filter id="haze3" x="0" y="0" width="100%%" height="100%%">'
               '<feTurbulence type="turbulence" baseFrequency="0.007 0.024" numOctaves="2" seed="9" result="t"/>'
               '<feDisplacementMap in="SourceGraphic" in2="t" scale="34" xChannelSelector="R" yChannelSelector="G"/></filter>'
               '<mask id="col3" maskUnits="userSpaceOnUse" x="0" y="0" width="%d" height="%d"><rect x="0" y="0" width="%d" height="%d" fill="black"/>'
               '<path d="%s" fill="white" filter="url(#gM)"/></mask>'
               '<linearGradient id="colw3" x1="0" y1="956" x2="0" y2="610" gradientUnits="userSpaceOnUse">'
               '<stop offset="0" stop-color="%s" stop-opacity="0.55"/><stop offset="0.6" stop-color="%s" stop-opacity="0.22"/>'
               '<stop offset="1" stop-color="%s" stop-opacity="0"/></linearGradient></defs>' % (W, H, W, H, col_d, w(72), w(72), w(72)))
    out.append(g(['<use href="#b3bg" filter="url(#haze3)"/>', rect(0, 600, W, 370, 'url(#colw3)')], 'mask="url(#col3)"'))
    out.append(ell(490, 820, 120, 170, w(80), 0.22, extra='filter="url(#gL)"'))
    out.append(g([wisps(490, 954, 330, 6, w(94), 7, rng, spread=150, op=0.32, blur='gS')], 'filter="url(#shimmer)"'))
    # her, recoiling from it: leaning away, a forearm up against the heat (in from the button rail)
    out.append(recoil_figure(792, 1652, v(7), rim=(w(80), -3.5)))
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


def quad_pt(q, u, s_):
    """Bilinear point on a quad q = [bottom-left, bottom-right, top-right, top-left]: u across, s_ up."""
    bl, br, tr, tl = q
    b = (bl[0] + (br[0] - bl[0]) * u, bl[1] + (br[1] - bl[1]) * u)
    t = (tl[0] + (tr[0] - tl[0]) * u, tl[1] + (tr[1] - tl[1]) * u)
    return (b[0] + (t[0] - b[0]) * s_, b[1] + (t[1] - b[1]) * s_)


def tea_tag(cx, top_y, wdt, hgt, ang, lit=1.0):
    """A teabag's paper tag (cream, a honey band at its top, the string's staple), swinging at angle ang."""
    o = []
    o.append(rect(cx - wdt / 2 - 10, top_y - 6, wdt + 20, hgt + 16, w(86), 0.35 * lit, extra='filter="url(#gM)"'))
    o.append(rect(cx - wdt / 2, top_y, wdt, hgt, v(97), rx=wdt * 0.06))
    o.append(rect(cx - wdt / 2, top_y, wdt, hgt * 0.24, w(84), rx=wdt * 0.06))
    o.append(rect(cx - wdt / 2, top_y + hgt * 0.2, wdt, hgt * 0.05, w(70)))
    o.append(path(smooth([(cx - wdt * 0.14, top_y + hgt * 0.62), (cx, top_y + hgt * 0.46), (cx + wdt * 0.14, top_y + hgt * 0.62),
                          (cx, top_y + hgt * 0.78)], closed=True), w(70), op=0.9))
    o.append(line(cx, top_y + hgt * 0.5, cx, top_y + hgt * 0.74, w(50), max(1.5, wdt * 0.02), 0.9))
    o.append(rect(cx - wdt * 0.08, top_y + hgt * 0.06, wdt * 0.16, hgt * 0.08, v(70), rx=2))
    return g(o, 'transform="rotate(%.1f %.1f %.1f)"' % (ang, cx, top_y))


def seated_figure(x, seat_y, col, rim):
    """Her on a step stool, facing left, her tiny mug raised beside the giant tag."""
    J = dict(hipL=(x - 6, seat_y - 8), hipR=(x + 22, seat_y - 6), knL=(x - 58, seat_y - 4), knR=(x - 50, seat_y + 4),
             ftL=(x - 62, seat_y + 104), ftR=(x - 38, seat_y + 108), shL=(x - 14, seat_y - 112), shR=(x + 26, seat_y - 106),
             elL=(x - 50, seat_y - 82), haL=(x - 68, seat_y - 120), elR=(x + 30, seat_y - 52), haR=(x - 16, seat_y - 30),
             neck=(x + 4, seat_y - 126), head=(x - 2, seat_y - 152), hr=21, tilt=-10, hem=6, toeL=-10, toeR=-10)
    return figure(J, col, wl=19, wa=14, rim=rim)


def f_B5(rng):
    """The teapot computer, wider: the giant computer seen at an angle in its quiet hall, its heat glowing through its
    mesh like tea steeping, a giant teabag tag swinging off its top; beside it, her tiny mug with its tiny tag."""
    cam = Cam(f=900, cx=540, cy=1150, eye=1.5)
    P = cam.P
    out = []
    # the hall around it: dark ceiling (the band's calm field), trays and lamps, a quiet row going back on the right
    out.append('<defs><linearGradient id="ceil5" x1="0" y1="0" x2="0" y2="1">'
               '<stop offset="0" stop-color="%s"/><stop offset="0.33" stop-color="%s"/><stop offset="0.6" stop-color="%s"/>'
               '<stop offset="1" stop-color="%s"/></linearGradient></defs>' % (v(9), v(11), v(16), v(26)))
    out.append(rect(0, 0, W, cam.cy, 'url(#ceil5)'))
    out.append('<defs><linearGradient id="fl5" x1="0" y1="%d" x2="0" y2="%d" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="%s"/>'
               '<stop offset="1" stop-color="%s"/></linearGradient></defs>' % (cam.cy, H, v(40), v(26)))
    out.append(rect(0, cam.cy, W, H - cam.cy, 'url(#fl5)'))
    for X in [x_ * 0.6 for x_ in range(-14, 15)]:
        a, b = P(X, 0, 1.4), P(X, 0, 40)
        out.append(line(a[0], a[1], b[0], b[1], v(30), 1.3, 0.5))
    z = 1.6
    while z < 40:
        a, b = P(-9, 0, z), P(9, 0, z)
        out.append(line(a[0], a[1], b[0], b[1], v(30), max(0.6, 4 / z), 0.5))
        z *= 1.12
    # the row going back on the right and a far row across the back (cool, quiet)
    for (X, z0, z1) in ((2.9, 6.5, 30), (-5.2, 9.0, 30)):
        side = 1 if X > 0 else -1
        zz = z0
        while zz < z1:
            q = [P(X, 0, zz), P(X, 0, zz + 0.62), P(X, 3.4, zz + 0.62), P(X, 3.4, zz)]
            out.append(poly(q, v(16)))
            rr = random.Random(int(zz * 100) + side)
            for row in range(12):
                for cz in (0.12, 0.38):
                    if rr.random() < 0.55:
                        c = P(X - 0.02 * side, 0.4 + row * 0.24, zz + cz)
                        out.append(circ(c[0], c[1], max(0.8, 4.5 / zz), mix(v(94), '#c9f1ff', 0.4), 0.85))
            out.append(poly([P(X, 3.4, zz), P(X, 3.4, zz + 0.62), P(X, 3.52, zz + 0.62), P(X, 3.52, zz)], v(40)))
            zz += 0.67
    back = [P(-6, 0, 30), P(6, 0, 30), P(6, 3.4, 30), P(-6, 3.4, 30)]
    out.append(poly(back, v(14)))
    for k in range(60):
        c = P(rng.uniform(-6, 6), rng.uniform(0.3, 3.2), 30)
        out.append(circ(c[0], c[1], 1.3, v(90), 0.8))
    for zz in (6.0, 10.0, 16.0, 24.0):
        L, R = P(-6, 4.6, zz), P(6, 4.6, zz)
        out.append(line(L[0], L[1], R[0], R[1], v(8), max(1.5, 26 / zz), 0.9))
        for X in (-2.0, 1.0):
            lamp = P(X, 4.4, zz)
            rr_ = max(2.0, 60 / zz)
            out.append(circ(lamp[0], lamp[1] + rr_, rr_ * 5, '#cfeeff', 0.08, extra='filter="url(#gM)"'))
            out.append(ell(lamp[0], lamp[1] + rr_, rr_ * 1.5, rr_ * 0.5, v(96)))
    # THE TEAPOT COMPUTER, at an angle: its front face (the mesh) toward the right, its side toward the left
    C, Wd, Dp, Ht, th = (-0.75, 4.7), 1.3, 1.0, 3.2, math.radians(24)
    e1 = (math.cos(th), math.sin(th))
    e2 = (-math.sin(th), math.cos(th))

    def corner(u, wv):
        return (C[0] + u * e1[0] + wv * e2[0], C[1] + u * e1[1] + wv * e2[1])
    fl, fr = corner(-Wd / 2, -Dp / 2), corner(Wd / 2, -Dp / 2)
    bl = corner(-Wd / 2, Dp / 2)
    front = [P(fl[0], 0, fl[1]), P(fr[0], 0, fr[1]), P(fr[0], Ht, fr[1]), P(fl[0], Ht, fl[1])]
    side_ = [P(bl[0], 0, bl[1]), P(fl[0], 0, fl[1]), P(fl[0], Ht, fl[1]), P(bl[0], Ht, bl[1])]
    # the warm on the floor, spilling out in front of its mesh
    spill = P(0.2, 0, 3.2)
    out.append(ell(spill[0], spill[1], 330, 70, w(70), 0.5, extra='filter="url(#gL)"'))
    out.append(poly(side_, v(13)))
    out.append(path('M%.1f,%.1f L%.1f,%.1f L%.1f,%.1f' % (side_[3] + front[3] + front[2]), 'none', v(34), 6))
    # the mesh: the heat glowing through it like tea steeping (honey with darker amber swirls drifting through)
    out.append(poly(front, w(30)))
    out.append('<defs><clipPath id="mesh5"><polygon points="%s"/></clipPath></defs>' % pts(front))
    sw_ = []
    for k in range(7):
        y0 = 0.08 + k * 0.13
        p_ = [quad_pt(front, u, y0 + 0.06 * math.sin(u * 7 + k * 1.7)) for u in [i / 10 for i in range(11)]]
        sw_.append(path(smooth(p_), 'none', w(74) if k % 2 else w(46), 30 + 8 * (k % 3), 0.6))
    sw_.append(ell(*quad_pt(front, 0.5, 0.55), 120, 260, w(84), 0.45, extra='filter="url(#gL)"'))
    out.append(g([g(sw_, 'filter="url(#gM)"')], 'clip-path="url(#mesh5)"'))
    cols, rows = 15, 40
    for r_ in range(rows):
        for c_ in range(cols):
            u = (c_ + 0.5) / cols
            s_ = (r_ + 0.5) / rows
            x_, y_ = quad_pt(front, 0.04 + u * 0.92, 0.03 + s_ * 0.94)
            t = 0.55 + 0.28 * math.sin(6.3 * u + 9.0 * s_ + 1.6 * math.sin(5.0 * s_ + 2 * u)) + 0.22 * (1 - abs(s_ - 0.55) * 1.6)
            t = max(0.0, min(1.0, t))
            out.append(circ(x_, y_, 3.5, w(46 + 52 * t), 0.95))
    for k in range(16):
        x_, y_ = quad_pt(front, 0.02, 0.1 + k * 0.05)
        out.append(circ(x_, y_, 4.2, w(88)))
    # the steam rising off its top vents, curling like a teapot's
    tc = quad_pt(front, 0.45, 1.0)
    out.append(wisps(tc[0], tc[1] - 4, 160, 6, v(92), 15, rng, spread=110, op=0.45, blur='gM', lean=0.15))
    out.append(wisps(tc[0], tc[1] - 4, 120, 4, w(90), 7, rng, spread=90, op=0.4, blur='gS', lean=0.1))
    # THE GIANT TAG: its string over the top edge, swinging out past the computer's corner, lit by its glow
    s0 = quad_pt(front, 0.8, 1.0)
    tag_top = (680, 1010)
    out.append(path('M%.1f,%.1f C%.1f,%.1f %.1f,%.1f %.1f,%.1f' % (s0[0], s0[1] - 6, s0[0] + 10, s0[1] + 90, tag_top[0] - 30, tag_top[1] - 120,
                                                                   tag_top[0], tag_top[1]), 'none', v(86), 4.5))
    for k, rr_ in enumerate((110, 140)):
        out.append(path('M%.1f,%.1f A%d,%d 0 0 0 %.1f,%.1f' % (tag_top[0] - 92 - k * 20, tag_top[1] + 30, rr_, rr_, tag_top[0] - 74 - k * 20,
                                                               tag_top[1] + 160), 'none', v(74), 3.5, 0.5))
    out.append(tea_tag(tag_top[0], tag_top[1], 150, 190, -14))
    # HER, small, on a step stool beside it, raising her tiny mug with its tiny tag
    out.append(rect(812, 1352, 108, 14, v(32)))
    out.append(rect(820, 1366, 11, 92, v(26)))
    out.append(rect(900, 1366, 11, 92, v(26)))
    out.append(seated_figure(862, 1352, v(8), rim=(w(78), -3)))
    mx, my = 772, 1206
    out.append(rect(mx - 22, my, 44, 46, v(92), rx=7))
    out.append(path('M%.1f,%.1f q15,5 0,24' % (mx + 22, my + 8), 'none', v(92), 5))
    out.append(wisps(mx, my - 2, 56, 3, v(96), 4, rng, spread=8, op=0.7))
    out.append(path('M%.1f,%.1f Q%.1f,%.1f %.1f,%.1f' % (mx - 8, my + 2, mx - 22, my + 12, mx - 26, my + 34), 'none', v(80), 2))
    out.append(tea_tag(mx - 26, my + 34, 20, 25, 6, lit=0.6))
    out.append(caption([[("That's a lot of ", False), ('tea.', True)]]))
    return ''.join(out) + texture()


# ============================================================== THE ROOF: THROWN INTO THE NIGHT (B6), THE CITY REACHES BACK (B7)
def fan_top(cx, cy, rx, ratio, warm_amt, gid, spin=0.0):
    """A big round fan seen from above at an angle: a short drum, four broad dark blades, the heat glowing up in the
    gaps between them (a fan, never a stove ring), a dark hub."""
    ry = rx * ratio
    out = []
    drum = ry * 0.6
    out.append(ell(cx, cy + drum, rx * 1.12, ry * 1.12, v(12)))
    out.append(rect(cx - rx * 1.12, cy, rx * 2.24, drum, v(12)))
    out.append(ell(cx, cy, rx * 1.12, ry * 1.12, v(44)))
    out.append(ell(cx, cy, rx * 1.03, ry * 1.03, v(10)))
    if warm_amt > 0:
        out.append('<defs><radialGradient id="%s" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="%s"/>'
                   '<stop offset="0.5" stop-color="%s"/><stop offset="1" stop-color="%s"/></radialGradient></defs>' % (gid, w(98), w(76), w(36)))
        out.append(ell(cx, cy, rx * 0.98, ry * 0.98, 'url(#%s)' % gid, warm_amt))
    for k in range(4):
        a0 = spin + k * math.pi / 2
        lead, trail = [], []
        for t in (0.2, 0.42, 0.66, 0.88, 0.97):
            lead.append((cx + math.cos(a0 + t * 0.55) * rx * t, cy + math.sin(a0 + t * 0.55) * ry * t))
            a1 = a0 + t * 0.55 + 0.55 + 0.45 * t
            trail.append((cx + math.cos(a1) * rx * t * 0.98, cy + math.sin(a1) * ry * t * 0.98))
        out.append(path(smooth(lead + trail[::-1], closed=True), v(7)))
    out.append(ell(cx, cy, rx * 0.22, ry * 0.22, v(9)))
    out.append(ell(cx - rx * 0.05, cy - ry * 0.06, rx * 0.1, ry * 0.1, v(36)))
    out.append(line(cx - rx * 1.0, cy, cx + rx * 1.0, cy, v(30), 2.2, 0.8))
    out.append(ell(cx - rx * 0.25, cy - ry * 1.02, rx * 0.65, ry * 0.12, v(80), 0.5))
    return ''.join(out)


def plume(cx, cy, rx, top_y, lean, rng, strength=1.0):
    """The heat thrown out: warm at the fan, rising, cooling to grey and thinning to nothing as it drifts away."""
    out = [ell(cx, cy - rx * 0.12, rx * 0.95, rx * 0.36, w(82), 0.5 * strength, extra='filter="url(#gM)"')]
    n = 13
    rise = cy - top_y
    ph = rng.uniform(0, 6)
    for i in range(n):
        t = i / (n - 1)
        y = cy - 30 - t * (rise - 30)
        x = cx + lean * (t ** 1.4) * rise + math.sin(t * 4.5 + ph) * 22 * t
        r = rx * (0.42 + 1.5 * t)
        col = mix(w(84), v(74), min(1.0, t * 1.6))
        op = (0.5 * (1 - t) ** 0.8 + 0.06) * strength * (1 - t ** 3)
        out.append(ell(x, y, r, r * 0.55, col, op, extra='filter="url(#steam)"'))
    out.append(wisps(cx, cy - 16, rise * 0.45, 4, w(90), rx * 0.1, rng, spread=rx * 0.3, op=0.45 * strength, blur='gS', lean=lean))
    return ''.join(out)


def block_mid(x0, x1, base, top, roof_h, face, rng, floors=5, door_x=None, door_warm=0.0, turret=False, chimneys=2):
    """A Katajanokka block across the lot, near enough to read: steep snowy roof, chimneys, rows of DARK windows
    (cold homes), snow on every sill, its street door."""
    out = []
    snow = v(76)
    out.append(rect(x0, top, x1 - x0, base - top, face))
    inset = roof_h * 0.32
    out.append(poly([(x0 - 4, top), (x1 + 4, top), (x1 - inset, top - roof_h), (x0 + inset, top - roof_h)], v(13)))
    out.append(poly([(x0 + inset, top - roof_h), (x1 - inset, top - roof_h), (x1 - inset * 0.55, top - roof_h * 0.62),
                     (x0 + inset * 0.55, top - roof_h * 0.62)], snow, 0.92))
    out.append(poly([(x0 - 6, top + 3), (x1 + 6, top + 3), (x1 + 2, top - 7), (x0 - 2, top - 7)], snow))
    for k in range(chimneys):
        cx_ = x0 + (x1 - x0) * (k + 1) / (chimneys + 1)
        out.append(rect(cx_ - 7, top - roof_h - 22, 14, 30, v(14)))
        out.append(rect(cx_ - 9, top - roof_h - 26, 18, 6, snow))
    if turret:
        tx = x1 - 26
        out.append(rect(tx - 22, top - 40, 44, 120, mix(face, v(30), 0.4)))
        out.append(poly([(tx - 26, top - 40), (tx + 26, top - 40), (tx, top - 120)], v(12)))
        out.append(poly([(tx - 26, top - 40), (tx - 8, top - 40), (tx - 2, top - 108), (tx, top - 120)], snow, 0.6))
    fl_h = (base - top - 46) / floors
    ncol = max(2, int((x1 - x0) / 38))
    for k in range(floors):
        wy = top + 12 + k * fl_h
        for j in range(ncol):
            wx = x0 + (x1 - x0) * (j + 0.5) / ncol - 9
            out.append(rect(wx, wy, 18, fl_h * 0.62, v(9)))
            out.append(rect(wx + 8, wy, 2, fl_h * 0.62, v(18), 0.8))
            out.append(rect(wx - 3, wy + fl_h * 0.62, 24, 4, snow, 0.9))
    if door_x is not None:
        if door_warm > 0:
            out.append(rect(door_x - 26, base - 52, 52, 60, w(76), 0.6 * door_warm, extra='filter="url(#gM)"'))
            out.append(rect(door_x - 11, base - 36, 22, 36, w(88)))
            out.append(rect(door_x - 6, base - 31, 12, 26, w(98)))
        else:
            out.append(rect(door_x - 11, base - 36, 22, 36, v(7)))
    return ''.join(out)


def roof_view(rng, reach=False):
    """From the hall's roof: the fans close in front, the lot below the parapet, Katajanokka's blocks across it, near
    and cold. reach=True: B7, the city answering (its doors and kerbs warm, its warm fingers reaching for the heat)."""
    base = 1050
    out = []
    out.append(sky(v(10), v(17), v(30), v(50), base, glow=(540, 820, 160, v(48), 0.4)))
    out.append(cloud(820, 170, 560, 160, v(21), v(36), rng, n=10))
    out.append(streak(560, 690, 1120, 26, v(26), 0.45))
    # Uspenski on its rock behind the roofs (its domes)
    out.append(rect(272, 700, 130, 360, v(19)))
    for (dx, dy, dr, hh) in ((336, 702, 26, 60), (292, 716, 13, 32), (380, 716, 13, 32)):
        out.append(path('M%.1f,%.1f Q%.1f,%.1f %.1f,%.1f Q%.1f,%.1f %.1f,%.1f Z' % (
            dx - dr, dy, dx - dr * 1.1, dy - hh * 0.8, dx, dy - hh * 1.25, dx + dr * 1.1, dy - hh * 0.8, dx + dr, dy), v(24)))
        out.append(line(dx, dy - hh * 1.25, dx, dy - hh * 1.6, v(24), 2.2))
    # KATAJANOKKA: the blocks across the lot, shoulder to shoulder, every window dark (cold homes)
    specs = [(-20, 160, 812, 70, v(25), False, None), (160, 330, 786, 80, v(28), True, 300), (330, 520, 806, 66, v(23), False, 420),
             (520, 690, 772, 84, v(27), False, 540), (690, 870, 798, 72, v(24), True, 660), (870, 1100, 784, 78, v(26), False, 780)]
    doors = []
    for (x0, x1, top, rh, face, tur, door_x) in specs:
        out.append(block_mid(x0, x1, base, top, rh, face, rng, door_x=door_x, door_warm=1.0 if reach else 0.0, turret=tur,
                             chimneys=2 if x1 - x0 < 190 else 3))
        if door_x is not None:
            doors.append(door_x)
    # the street at their feet and the snowy lot down to the hall's wall
    out.append(rect(0, base, W, 14, v(68)))
    out.append(rect(0, base + 14, W, 5, v(30)))
    out.append('<defs><linearGradient id="lotg" x1="0" y1="%d" x2="0" y2="1226" gradientUnits="userSpaceOnUse">'
               '<stop offset="0" stop-color="%s"/><stop offset="1" stop-color="%s"/></linearGradient></defs>' % (base + 19, v(60), v(50)))
    out.append(rect(0, base + 19, W, 1226 - base - 19, 'url(#lotg)'))
    for (xa, xb) in ((80, -60), (330, 260), (600, 600), (880, 960)):
        out.append(line(xa, base + 22, xb, 1222, v(46), 5, 0.5))
    for lx in (110, 470, 900):
        out.append(line(lx, base + 6, lx, base - 120, v(16), 3))
        out.append(circ(lx, base - 122, 5, v(96)))
        out.append(circ(lx, base - 122, 18, v(86), 0.18, extra='filter="url(#gS)"'))
    if reach:
        # the city answers: its kerbs catch the warm
        out.append(rect(0, base + 4, W, 14, w(74), 0.5, extra='filter="url(#gS)"'))
        for dx in doors:
            out.append(ell(dx, base + 14, 54, 12, w(82), 0.65, extra='filter="url(#gM)"'))
    # the parapet, then the hall's snowy roof
    out.append('<defs><linearGradient id="roofg" x1="0" y1="1250" x2="0" y2="1920" gradientUnits="userSpaceOnUse">'
               '<stop offset="0" stop-color="%s"/><stop offset="1" stop-color="%s"/></linearGradient></defs>' % (v(46), v(26)))
    out.append(rect(0, 1250, W, H - 1250, 'url(#roofg)'))
    out.append(rect(0, 1222, W, 14, v(84)))
    out.append(rect(0, 1236, W, 16, v(24)))
    for k in range(30):
        out.append(ell(rng.uniform(0, W), rng.uniform(1520, 1900), rng.uniform(20, 60), rng.uniform(3, 7), v(54), 0.35))
    # THE CITY REACHES BACK: warm lines leave its doors under the snow and open out like fingers as they near the
    # heat, each fingertip stopping just short of it
    if reach:
        tips = [(150, 1206), (338, 1201), (530, 1198), (738, 1194), (874, 1190)]

        def spline(ps, n=40):
            q = [ps[0]] + list(ps) + [ps[-1]]
            o = []
            for i in range(1, len(q) - 2):
                p0, p1, p2, p3 = q[i - 1], q[i], q[i + 1], q[i + 2]
                for k in range(n):
                    t = k / n
                    o.append(tuple(0.5 * ((2 * p1[j]) + (-p0[j] + p2[j]) * t + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t * t +
                                          (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * t ** 3) for j in (0, 1)))
            o.append(ps[-1])
            return o
        for dx, tip in zip(doors[:5], tips):
            ctrl = [(dx, base + 10), (dx + (tip[0] - dx) * 0.08, base + 50), (dx + (tip[0] - dx) * 0.45, base + 110), tip]
            cur = spline(ctrl)
            d = 'M' + ' L'.join('%.1f,%.1f' % p for p in cur)
            out.append(path(d, 'none', v(30), 30, 0.4, extra='filter="url(#soft3)"'))
            out.append(path(d, 'none', w(66), 30, 0.5, extra='filter="url(#gM)"'))
            m = len(cur) - 1
            for i in range(m):
                t = i / m
                a, b = cur[i], cur[i + 1]
                out.append(line(a[0], a[1], b[0], b[1], w(84 + 12 * t), 15 - 7 * t, 1.0))
            out.append(circ(tip[0], tip[1], 30, w(92), 0.55, extra='filter="url(#gM)"'))
            out.append(circ(tip[0], tip[1], 5.5, w(100)))
    # THE FANS: two cooler units on the roof, raised into the picture; the heat glows up between their blades
    def unit(near_l, near_r, far_r, far_l, depth):
        return (poly([near_l, near_r, (near_r[0], near_r[1] + depth), (near_l[0], near_l[1] + depth)], v(20)) +
                poly([near_l, near_r, far_r, far_l], v(34)) +
                poly([near_l, near_r, (near_r[0], near_r[1] + 7), (near_l[0], near_l[1] + 7)], v(72), 0.6))
    fansA = [(162, 1392), (346, 1380), (530, 1368)]
    fansB = [(732, 1306), (862, 1298)]
    warm = 1.0 if not reach else 0.8
    out.append(unit((684, 1342), (928, 1333), (912, 1262), (676, 1270), 46))
    for k, (cx, cy) in enumerate(fansB):
        out.append(fan_top(cx, cy, 60, 0.42, warm, 'fanB%d' % k, spin=0.4 + k * 0.7))
    out.append(unit((26, 1452), (646, 1426), (622, 1300), (52, 1322), 64))
    for k, (cx, cy) in enumerate(fansA):
        out.append(fan_top(cx, cy, 84, 0.42, warm, 'fanA%d' % k, spin=0.2 + k * 0.9))
    # the heat thrown out: B6 high over the cold homes, thinning to nothing; B7 quieter, a warm breath at each fan
    for (cx, cy), rx in [(p, 60) for p in fansB] + [(p, 84) for p in fansA]:
        if reach:
            out.append(plume(cx, cy, rx, cy - 64, -0.05, rng, strength=0.55))
        else:
            out.append(plume(cx, cy, rx, 690, -0.2, rng, strength=1.0))
    out.append(snowfall(rng, n=150))
    return ''.join(out)


def f_B6(rng):
    body = roof_view(rng, reach=False)
    body += caption([[('big fans to blow', False)], [('that heat ', False), ('outside.', True)]], size=100)
    return body + texture()


def f_B7(rng):
    body = roof_view(rng, reach=True)
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
    """A plan in chalk: the new data center drawn bold on the night, its planned computers and its pipe inside; the
    pipe is still being drawn out across the snow, its bright chalk tip coming toward the city's warm line, whose tip
    waits: two ends about to touch, close in front of us, a 2027 tag on a stake beside them."""
    cam = Cam(f=1000, cx=540, cy=1080, eye=1.6)
    P = cam.P
    out = [plan_lot(rng, cam)]
    # the plan: walls, roof line, door, bold chalk with a faint glow of its own (lines only: the snow falls through)
    X0, X1, Z0, Z1, Hh = -11.0, 9.0, 22.0, 46.0, 9.0
    c = {nm: P(X, Y, Z) for nm, (X, Y, Z) in {'a': (X0, 0, Z0), 'b': (X1, 0, Z0), 'c': (X1, 0, Z1), 'd': (X0, 0, Z1),
                                               'A': (X0, Hh, Z0), 'B': (X1, Hh, Z0), 'C': (X1, Hh, Z1), 'D': (X0, Hh, Z1)}.items()}
    for e in ('cd', 'CD', 'cC', 'dD', 'bc', 'BC', 'da', 'DA'):
        out.append(chalk_bold(c[e[0]], c[e[1]], rng, 4.2, 0.85, 0.22))
    # the planned computers inside: rows of tall chalk boxes going back, and the pipe running out of them
    for X in (-7.0, -2.6, 1.8, 6.0):
        zz = Z0 + 3.0
        while zz < Z1 - 2.5:
            f0, f1 = P(X - 0.5, 0, zz), P(X + 0.5, 0, zz)
            t0, t1 = P(X - 0.5, 2.6, zz), P(X + 0.5, 2.6, zz)
            out.append(chalk_poly([f0, t0, t1, f1], rng, 3.0, 0.7, 0.15))
            b0 = P(X + 0.5, 2.6, zz + 1.0)
            out.append(chalk_bold(t1, b0, rng, 2.4, 0.55, 0.0))
            zz += 3.6
    # the front wall last (nearest): bold, the door drawn in it
    for e in ('ab', 'AB', 'aA', 'bB'):
        out.append(chalk_bold(c[e[0]], c[e[1]], rng, 6.4, 0.97, 0.3, breaks=False))
    da, db = P(-2.4, 0, Z0), P(-0.4, 0, Z0)
    dt = P(-0.4, 3.2, Z0)
    out.append(chalk_poly([da, (da[0], dt[1]), dt, db], rng, 5.0, 0.95, 0.25))
    # survey stakes with ribbons at its near corners
    for (X, Z) in ((X0, Z0), (X1, Z0)):
        a, b = P(X, 0, Z), P(X, 1.4, Z)
        out.append(line(a[0], a[1], b[0], b[1], v(72), 4))
        out.append(path('M%.1f,%.1f q9,5 18,-2' % (b[0], b[1] + 6), 'none', v(90), 3))
    # THE CHALK PIPE: out through the plan's front wall and across the snow toward us, still being drawn
    hw = 0.17
    ctrl = [(-1.4, 26.0), (-1.4, Z0), (-2.0, 14.0), (-1.9, 8.5), (-1.15, 5.7), (-0.2, 4.65)]
    pts3 = []
    for (a_, b_) in zip(ctrl, ctrl[1:]):
        for t in range(8):
            u = t / 8
            pts3.append((a_[0] + (b_[0] - a_[0]) * u, a_[1] + (b_[1] - a_[1]) * u))
    pts3.append(ctrl[-1])
    smooth_pts = [pts3[0]] + [((pts3[i - 1][0] + pts3[i][0] + pts3[i + 1][0]) / 3, (pts3[i - 1][1] + pts3[i][1] + pts3[i + 1][1]) / 3)
                              for i in range(1, len(pts3) - 1)] + [pts3[-1]]
    left_e, right_e = [], []
    for i, (X, Z) in enumerate(smooth_pts):
        j = min(i + 1, len(smooth_pts) - 1)
        k = max(i - 1, 0)
        dX, dZ = smooth_pts[j][0] - smooth_pts[k][0], smooth_pts[j][1] - smooth_pts[k][1]
        L = math.hypot(dX, dZ) or 1
        nX, nZ = -dZ / L, dX / L
        left_e.append(P(X + nX * hw, 0, Z + nZ * hw))
        right_e.append(P(X - nX * hw, 0, Z - nZ * hw))
    out.append(poly(left_e + right_e[::-1], v(88), 0.16))
    for edge in (left_e, right_e):
        for a, b in zip(edge, edge[1:]):
            zz = max(1.0, (b[1] - cam.cy) / 30)
            out.append(chalk_bold(a, b, rng, min(8.5, 2.4 + zz * 0.55), 0.95, 0.24, breaks=False))
    # the chalk tip, being drawn right now: a bright nub, chalk dust
    tip = P(-0.2, 0.02, 4.65)
    out.append(circ(tip[0], tip[1], 46, v(98), 0.5, extra='filter="url(#gM)"'))
    out.append(ell(tip[0], tip[1], 19, 13, CHALK_HI))
    out.append(ell(tip[0] - 3, tip[1] - 3, 9, 6, v(100)))
    for k in range(22):
        out.append(circ(tip[0] + rng.uniform(-40, 30), tip[1] + rng.uniform(-36, 12), rng.uniform(1.2, 3.2), v(98), rng.uniform(0.4, 0.9)))
    # THE CITY'S WARM LINE: in from the right under the snow, its warm tip waiting just across the gap
    wl = [(6.0, 5.6), (3.4, 5.0), (1.8, 4.76), (0.9, 4.68), (0.2, 4.64)]

    def xcw(z):
        return 0.0
    wpts = []
    for (a_, b_) in zip(wl, wl[1:]):
        for t in range(10):
            u = t / 10
            wpts.append((a_[0] + (b_[0] - a_[0]) * u, a_[1] + (b_[1] - a_[1]) * u))
    wpts.append(wl[-1])
    up, dn, sag_u, sag_d = [], [], [], []
    for i, (X, Z) in enumerate(wpts):
        hw_ = 0.24 * (1 + 0.18 * math.sin(i * 1.3))
        up.append(P(X, 0, Z - hw_))
        dn.append(P(X, 0, Z + hw_))
        sag_u.append(P(X, 0, Z - hw_ - 0.16))
        sag_d.append(P(X, 0, Z + hw_ + 0.16))
    out.append(poly(sag_u + sag_d[::-1], v(26), 0.6, extra='filter="url(#soft3)"'))
    out.append(poly(up + dn[::-1], w(64), 0.95))
    out.append(poly(up + dn[::-1], w(80), 0.6, extra='filter="url(#gS)"'))
    for i in range(len(wpts) - 1):
        if rng.random() < 0.3:
            continue
        a, b = P(wpts[i][0], 0, wpts[i][1]), P(wpts[i + 1][0], 0, wpts[i + 1][1])
        out.append(line(a[0], a[1], b[0], b[1], w(98), 2.4, 0.9))
    wtip = P(0.2, 0, 4.64)
    out.append(ell(wtip[0] + 26, wtip[1] + 2, 80, 20, v(24), 0.6, extra='filter="url(#soft3)"'))
    out.append(circ(wtip[0], wtip[1], 96, w(72), 0.5, extra='filter="url(#gL)"'))
    out.append(circ(wtip[0], wtip[1], 40, w(90), 0.8, extra='filter="url(#gM)"'))
    out.append(ell(wtip[0], wtip[1], 19, 13, w(100)))
    out.append(wisps(wtip[0] + 8, wtip[1] - 6, 150, 3, mix(w(92), v(94), 0.5), 7, rng, spread=12, op=0.5, blur='gS', lean=0.1))
    # the 2027 tag on its stake, right by the gap
    sa, sb = P(-2.6, 0, 7.0), P(-2.6, 1.2, 7.0)
    out.append(line(sa[0], sa[1], sb[0], sb[1], v(70), 6))
    out.append(path('M%.1f,%.1f L%.1f,%.1f' % (sb[0], sb[1] + 4, sb[0] + 4, sb[1] + 28), 'none', v(84), 2.5))
    tx0, ty0 = sb[0] - 20, sb[1] + 24
    out.append(poly([(tx0, ty0 + 4), (tx0 + 184, ty0), (tx0 + 188, ty0 + 86), (tx0 + 4, ty0 + 90)], v(94)))
    out.append(circ(tx0 + 14, ty0 + 45, 5, v(40)))
    out.append('<text x="%.1f" y="%.1f" text-anchor="middle" font-family="Gaegu" font-weight="700" font-size="74" fill="%s">2027</text>'
               % (tx0 + 102, ty0 + 69, v(12)))
    # the engineer, a rolled drawing under her arm, looking down at the two ends about to meet
    J = dict(ftL=(782, 1250), ftR=(806, 1252), knL=(784, 1204), knR=(806, 1204), hipL=(786, 1160), hipR=(806, 1160),
             shL=(780, 1098), shR=(812, 1098), elL=(772, 1128), haL=(776, 1156), elR=(822, 1130), haR=(808, 1150),
             neck=(792, 1088), head=(788, 1072), hr=12, tilt=-14, hem=10)
    out.append(figure(J, v(9), wl=10, wa=8, rim=(v(70), -2)))
    out.append(line(752, 1132, 838, 1116, v(86), 9))
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


def water_col(t):
    """The water along its loop: cold blue as it comes in (t=0), honey then gold as it leaves with the heat (t=1)."""
    if t < 0.5:
        return mix('#5fa9da', '#e4f1f8', t * 2)
    return w(66 + 34 * (t - 0.5) * 2)


def f_B10(rng):
    """Blue in, gold out, as a place: inside the plan (its walls still chalk lines, the snowy night through them), the
    new hall's computers stand in rows going on into the dark, cold water in at their feet, gold out at their tops; in
    front, the one computer, its loop climbing past every shelf (the shelves it has cooled gone calm and blue, the top
    ones still amber), and the engineer with her gloved hand on the pipe where blue turns gold."""
    cam = Cam(f=820, cx=540, cy=1100, eye=1.6)
    P, f = cam.P, cam.f
    out = []
    out.append(sky(v(10), v(16), v(28), v(42), cam.cy, glow=(540, 640, 120, v(52), 0.35)))
    out.append(cloud(250, 170, 560, 160, v(21), v(35), rng, n=10))
    # beyond the plan's back wall: the frozen harbour, the far shore's few lights, a moored icebreaker
    out.append(far_city(rng, cam.cy + 4, cam.cy - 40, -10, 1090, v(40), lit_frac=0.12, lit_t=76))
    out.append(rect(0, cam.cy + 4, W, 40, v(52)))
    out.append(icebreakers(rng, cam.cy + 30, [(612, 0.26, True)]))
    # the floor of the plan: the snowy lot itself
    out.append('<defs><linearGradient id="snow10" x1="0" y1="%d" x2="0" y2="%d" gradientUnits="userSpaceOnUse">'
               '<stop offset="0" stop-color="%s"/><stop offset="1" stop-color="%s"/></linearGradient></defs>' % (cam.cy + 40, H, v(62), v(44)))
    out.append(rect(0, cam.cy + 40, W, H - cam.cy - 40, 'url(#snow10)'))
    for k in range(50):
        Z = math.exp(rng.uniform(math.log(3.0), math.log(30)))
        a = P(rng.uniform(-6, 6), 0, Z)
        out.append(ell(a[0], a[1], max(3, 110 / Z), max(1, 20 / Z), v(52), 0.35))
    # THE PLAN'S SHELL in chalk: back wall, side walls, posts, roof beams (the night shows through all of it)
    XW, ZB, HW = 6.5, 32.0, 6.0
    sw_at = lambda Z: max(2.6, min(7.0, 34.0 / Z))
    bw = [P(-XW, 0, ZB), P(XW, 0, ZB), P(XW, HW, ZB), P(-XW, HW, ZB)]
    out.append(chalk_poly(bw, rng, sw_at(ZB), 0.9, 0.22, closed=True))
    for sd in (-1, 1):
        for Y in (0.0, HW):
            zs = [ZB, 22, 16, 11, 8.0, 6.0, 4.6]
            ps = [P(sd * XW, Y, z) for z in zs]
            for a, b, z in zip(ps, ps[1:], zs[1:]):
                out.append(chalk_bold(a, b, rng, sw_at(z), 0.9, 0.22, breaks=False))
        for z in (22, 14, 9):
            out.append(chalk_bold(P(sd * XW, 0, z), P(sd * XW, HW, z), rng, sw_at(z), 0.85, 0.2, breaks=False))
    for z in (22, 14):
        out.append(chalk_bold(P(-XW, HW, z), P(XW, HW, z), rng, sw_at(z), 0.8, 0.18))
    out.append(snowfall(rng, n=110, y1=1260))
    # THE ROWS going on into the dark: computers in four rows; cold blue water along their feet, gold along their tops
    items = []
    for X in (-4.4, -2.0, 2.0, 4.4):
        sd = 1 if X > 0 else -1
        z = 5.6 if abs(X) < 3 else 7.0
        while z < 28.5:
            o = []
            face = [P(X, 0, z), P(X, 0, z + 0.6), P(X, 2.4, z + 0.6), P(X, 2.4, z)]
            o.append(poly(face, v(18)))
            e = P(X, 0, z)
            e2 = P(X, 2.4, z)
            o.append(line(e[0], e[1], e2[0], e2[1], v(10), max(0.6, 4 / z), 0.9))
            rr = random.Random(int(z * 31) + int(X * 7))
            for row in range(9):
                if rr.random() < 0.6:
                    c = P(X - 0.02 * sd, 0.4 + row * 0.22, z + 0.3)
                    o.append(circ(c[0], c[1], max(0.8, 5 / z), mix(v(94), '#c9f1ff', 0.5), 0.9))
            tg = P(X - 0.02 * sd, 2.36, z + 0.3)
            o.append(ell(tg[0], tg[1], max(2, 26 / z), max(1, 8 / z), w(84), 0.8, extra='filter="url(#soft1)"'))
            items.append((z, ''.join(o)))
            z += 0.66
    gx = [P(-4.4, 2.62, 28.5), P(XW + 0.8, 2.62, 28.5), P(XW + 1.0, 0.3, 28.5), P(XW + 1.2, 0.0, 28.0)]
    out.append(path('M%.1f,%.1f ' % gx[0] + ' '.join('L%.1f,%.1f' % p for p in gx[1:]), 'none', w(70), 14, 0.45, extra='filter="url(#gS)"'))
    out.append(path('M%.1f,%.1f ' % gx[0] + ' '.join('L%.1f,%.1f' % p for p in gx[1:]), 'none', v(10), 9))
    out.append(path('M%.1f,%.1f ' % gx[0] + ' '.join('L%.1f,%.1f' % p for p in gx[1:]), 'none', water_col(0.97), 5))
    melt = P(XW + 1.6, 0, 27.0)
    out.append(ell(melt[0] + 30, melt[1], 90, 12, w(70), 0.5, extra='filter="url(#gM)"'))
    out.append(ell(melt[0] + 10, melt[1], 30, 5, w(88), 0.8, extra='filter="url(#soft3)"'))
    for _, svg in sorted(items, key=lambda it: -it[0]):
        out.append(svg)
    for X in (-4.4, -2.0, 2.0, 4.4):
        z0 = 5.6 if abs(X) < 3 else 7.0
        for (Y, tcol) in ((0.1, 0.06), (2.62, 0.95)):
            a, b_ = P(X, Y, z0), P(X, Y, 28.5)
            wd = max(2.0, 30 / z0)
            if tcol > 0.5:
                out.append(line(a[0], a[1], b_[0], b_[1], w(72), wd * 2.2, 0.3, extra='filter="url(#gS)"'))
            out.append(line(a[0], a[1], b_[0], b_[1], v(10), wd + 4))
            out.append(line(a[0], a[1], b_[0], b_[1], water_col(tcol), wd))
    # THE ONE COMPUTER in front, centred: its glass door, eight shelves, the loop climbing past them all
    x0, x1 = P(-0.5, 0, 3.4)[0], P(0.5, 0, 3.4)[0]
    yb, yt = P(0, 0, 3.4)[1], P(0, 2.5, 3.4)[1]
    out.append(ell((x0 + x1) / 2, yb + 6, 260, 28, v(30), 0.5, extra='filter="url(#soft3)"'))
    out.append(rect(x0 - 12, yt - 12, x1 - x0 + 24, yb - yt + 12, v(8)))
    gx0, gx1, gy0, gy1 = x0 + 6, x1 - 6, yt + 4, yb - 6
    out.append(rect(gx0, gy0, gx1 - gx0, gy1 - gy0, v(16)))
    n_sh = 8
    sh_h = (gy1 - gy0) / n_sh
    mids = []
    for k in range(n_sh):
        sb_ = gy1 - k * sh_h
        st_ = sb_ - sh_h
        mids.append(st_ + sh_h * 0.5)
        warm_k = {5: 0.35, 6: 0.65, 7: 1.0}.get(k, 0.0)
        out.append(rect(gx0 + 6, st_ + 6, gx1 - gx0 - 12, sh_h - 12, v(22)))
        for cxp in (gx0 + 22, gx0 + 92):
            out.append(rect(cxp, st_ + sh_h * 0.32, 56, sh_h * 0.36, mix(v(40), w(54), warm_k) if warm_k else v(38), rx=3))
        if warm_k:
            out.append(rect(gx0 + 10, st_ + 8, gx1 - gx0 - 20, sh_h - 16, w(66), 0.32 * warm_k, extra='filter="url(#gS)"'))
            out.append(circ(gx1 - 30, st_ + sh_h * 0.5, 5, w(90)))
        else:
            out.append(circ(gx1 - 30, st_ + sh_h * 0.5, 5, '#bfeeff'))
            out.append(circ(gx1 - 46, st_ + sh_h * 0.5, 4, '#bfeeff', 0.8))
    # the cool glass: a faint reflection across it
    out.append(poly([(gx0, gy0 + 60), (gx0 + 70, gy0), (gx0 + 120, gy0), (gx0, gy0 + 140)], v(90), 0.08))
    # the loop: in along the floor from the left (cold), under the computer, then back and forth up past every shelf
    lx, rx_ = x0 - 16, x1 + 18
    loop = [(-20, yb - 12), (x0 - 40, yb - 12), (x1 - 20, yb - 12), (rx_, yb - 30), (rx_, mids[0])]
    for k in range(n_sh):
        a_x, b_x = (rx_, lx) if k % 2 == 0 else (lx, rx_)
        loop += [(a_x, mids[k]), (b_x, mids[k])]
        if k < n_sh - 1:
            loop += [(b_x, mids[k + 1])]
    loop += [(rx_, mids[-1])]
    loop[-1] = (rx_ + 24, mids[-1] - 14)
    near_main = P(2.0, 2.62, 5.6)
    loop += [(rx_ + 70, mids[-1] - 10), ((rx_ + 70 + near_main[0]) / 2, (mids[-1] + near_main[1]) / 2 - 6), near_main]
    segs = list(zip(loop, loop[1:]))
    total = sum(math.hypot(b_[0] - a[0], b_[1] - a[1]) for a, b_ in segs)
    dpath = 'M%.1f,%.1f ' % loop[0] + ' '.join('L%.1f,%.1f' % p for p in loop[1:])
    out.append(path(dpath, 'none', v(10), 22))
    acc = 0.0
    pieces = []
    for a, b_ in segs:
        L = math.hypot(b_[0] - a[0], b_[1] - a[1])
        if L < 1:
            continue
        n = max(1, int(L / 12))
        for i in range(n):
            tt = (acc + L * (i + 0.5) / n) / total
            pa = (a[0] + (b_[0] - a[0]) * i / n, a[1] + (b_[1] - a[1]) * i / n)
            pb = (a[0] + (b_[0] - a[0]) * (i + 1) / n, a[1] + (b_[1] - a[1]) * (i + 1) / n)
            pieces.append((pa, pb, tt))
        acc += L
    for pa, pb, tt in pieces:
        if tt > 0.55:
            out.append(line(pa[0], pa[1], pb[0], pb[1], w(72), 34, 0.16, extra='filter="url(#gS)"'))
    for pa, pb, tt in pieces:
        out.append(line(pa[0], pa[1], pb[0], pb[1], water_col(tt), 13))
    # the engineer beside it, her gloved hand on the pipe where blue turns gold (feeling it warm)
    hb = (rx_ + 4, (mids[3] + mids[4]) / 2)
    J = dict(ftL=(756, 1482), ftR=(804, 1484), knL=(760, 1394), knR=(800, 1394), hipL=(762, 1304), hipR=(796, 1304),
             shL=(758, 1170), shR=(806, 1174), elL=(722, 1200), haL=(hb[0] + 10, hb[1]), elR=(818, 1236), haR=(812, 1294),
             neck=(782, 1152), head=(776, 1122), hr=24, tilt=-12, hem=30)
    out.append(figure(J, v(8), wl=21, wa=15, rim=(w(80), -3)))
    out.append(circ(hb[0] + 8, hb[1], 26, w(84), 0.4, extra='filter="url(#gM)"'))
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
    """Warm under the snow = B11alt's melt line (the evaluator's note: take it), the woman bigger, at the glass, looking out."""
    rng_alt = random.Random(sum(ord(c) * (i + 1) for i, c in enumerate('B11alt')) + 17)
    return melt_line_street(rng_alt, woman='glass')


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
def facade_x(cam, X, z0, z1, h, sd, lit_fn, face, door_z=None, door_warm=0.0, roof=True, chimneys=2, win_dark=None):
    """A block's street facade in the plane X (sd = +1: it faces +X, the street on its right; -1: faces -X), seen from
    above the street: snowy roof, chimneys, windows (lit by lit_fn(floor, column)), its street door."""
    P = cam.P
    out = []
    win_dark = win_dark or v(10)
    out.append(poly([P(X, 0, z0), P(X, 0, z1), P(X, h, z1), P(X, h, z0)], face))
    if roof:
        r0, r1 = P(X, h, z0), P(X, h, z1)
        r2, r3 = P(X - 6 * sd, h + 5, z1), P(X - 6 * sd, h + 5, z0)
        out.append(poly([r0, r1, r2, r3], v(70)))
        out.append(poly([r0, r1, P(X - 1.2 * sd, h + 1.0, z1), P(X - 1.2 * sd, h + 1.0, z0)], v(84)))
        for k in range(chimneys):
            zc = z0 + (z1 - z0) * (k + 0.7) / (chimneys + 0.4)
            a, b = P(X - 6 * sd, h + 5, zc), P(X - 6 * sd, h + 6.8, zc)
            wd = max(2.0, cam.f * 0.9 / max(zc, 1))
            out.append(rect(a[0] - wd / 2, b[1], wd, a[1] - b[1], v(16)))
            out.append(rect(a[0] - wd * 0.6, b[1] - wd * 0.25, wd * 1.2, wd * 0.35, v(84)))
    out.append(poly([P(X + 0.25 * sd, h - 0.35, z0), P(X + 0.25 * sd, h - 0.35, z1), P(X + 0.25 * sd, h, z1), P(X + 0.25 * sd, h, z0)], v(78), 0.8))
    k = 0
    while 3.4 + k * 3.3 + 1.9 < h - 0.8:
        y0 = 3.4 + k * 3.3
        zz, j = z0 + 1.6, 0
        while zz + 1.3 < z1 - 0.8:
            q = [P(X + 0.05 * sd, y0, zz), P(X + 0.05 * sd, y0, zz + 1.25), P(X + 0.05 * sd, y0 + 1.9, zz + 1.25), P(X + 0.05 * sd, y0 + 1.9, zz)]
            if lit_fn(k, j):
                xs = [p[0] for p in q]
                ys = [p[1] for p in q]
                out.append(ell(sum(xs) / 4, sum(ys) / 4, (max(xs) - min(xs)) * 1.5 + 4, (max(ys) - min(ys)) * 0.9 + 3, w(72), 0.45, extra='filter="url(#gM)"'))
                out.append(poly(q, w(84 + (j * 7 + k * 3) % 10)))
            else:
                out.append(poly(q, win_dark))
            out.append(poly([P(X + 0.3 * sd, y0 - 0.1, zz - 0.1), P(X + 0.3 * sd, y0 - 0.1, zz + 1.35), P(X + 0.05 * sd, y0, zz + 1.35), P(X + 0.05 * sd, y0, zz - 0.1)], v(80), 0.8))
            zz += 3.4
            j += 1
        k += 1
    if door_z is not None:
        dq = [P(X + 0.05 * sd, 0, door_z - 0.8), P(X + 0.05 * sd, 0, door_z + 0.8), P(X + 0.05 * sd, 2.6, door_z + 0.8), P(X + 0.05 * sd, 2.6, door_z - 0.8)]
        out.append(poly(dq, w(80) if door_warm else v(7), 0.95))
    return ''.join(out)


def f_B1alt(rng):
    """From your balcony: high over the island's street on a snowy night, the warm current racing up it under the snow
    from the hall at the harbour's edge, turning in at every door it passes, the blocks blooming in its wake; its bright
    head just arriving below you."""
    cam = Cam(f=900, cx=540, cy=960, eye=14.0, yaw=-17)
    P = cam.P
    head_z = 26.0
    out = []
    out.append(sky(v(12), v(19), v(36), v(60), cam.cy, glow=(800, 600, 120, v(68), 0.5)))
    out.append(cloud(240, 190, 600, 170, v(22), v(38), rng, n=11))
    out.append(streak(-40, 760, 520, 30, v(30), 0.5))
    # across the harbour at the street's end: the far shore, a few lights, the frozen water
    out.append(far_city(rng, cam.cy + 2, cam.cy - 34, 560, 1090, v(46), lit_frac=0.3, lit_t=78))
    out.append(rect(560, cam.cy + 2, 520, 60, v(56)))
    # the snow of the street and the island, one plane from the horizon down
    out.append('<defs><linearGradient id="snow1a" x1="0" y1="%d" x2="0" y2="%d" gradientUnits="userSpaceOnUse">'
               '<stop offset="0" stop-color="%s"/><stop offset="1" stop-color="%s"/></linearGradient></defs>' % (cam.cy, H, v(62), v(46)))
    out.append(rect(0, cam.cy + 40, W, H, 'url(#snow1a)'))
    # the hall at the harbour's working edge, where the warm comes from: long, low, a band of cool lights
    hq = [P(-26, 0, 215), P(16, 0, 215), P(16, 12, 215), P(-26, 12, 215)]
    out.append(poly(hq, v(20)))
    for xx in range(-25, 16, 2):
        a = P(xx, 7.0, 214)
        out.append(rect(a[0] - 1.6, a[1] - 1.2, 3.2, 2.4, '#bfefff', 0.9))
    # the street: pavements, kerbs, tram rails, tracks in the snow
    for X in (-2.1, -13.1):
        a, b = P(X, 0, 9), P(X, 0, 214)
        out.append(line(a[0], a[1], b[0], b[1], v(36), 3.5, 0.8))
    for X in (-10.2, -8.9, -6.3, -5.0):
        a, b = P(X, 0, 9), P(X, 0, 214)
        out.append(line(a[0], a[1], b[0], b[1], v(34), 2.5, 0.75))
    for k in range(70):
        Z = math.exp(rng.uniform(math.log(10), math.log(120)))
        X = rng.choice([-12.0, -11.4, -3.2, -3.8, -14.4, 0.0]) + rng.uniform(-0.3, 0.3)
        a = P(X, 0, Z)
        r_ = max(1.0, 60 / Z)
        out.append(ell(a[0], a[1], r_ * 1.2, r_ * 0.5, v(40), 0.35))
    # THE CURRENT up the middle of the street, lit from the harbour end to its running head; nearer, the snow still cold
    def xc(z):
        return -7.6 + 0.12 * math.sin(z * 0.17) + 0.06 * math.sin(z * 0.8 + 1.1)
    out.append(melt_channel(cam, rng, head_z + 1.2, 212, xc=xc, hw0=0.55, glow_hw=1.2,
                            steam_at=(head_z + 6, 40, 56, 80, 120), steam_scale=0.7))
    src = P(-7.6, 0.6, 212)
    out.append(ell(src[0], src[1], 30, 10, w(84), 0.85, extra='filter="url(#gM)"'))
    # the blocks across the street (left) and along our side (right): the warm climbs them behind the head
    left = [(13, 30, 19.0), (30, 46, 17.5), (46, 64, 20.5), (64, 84, 18.0), (84, 108, 19.5), (108, 140, 17.0), (140, 175, 19.0), (175, 205, 18.0)]
    right = [(5, 22, 15.5), (22, 40, 17.0), (40, 60, 16.5), (60, 84, 18.0), (84, 112, 16.0), (112, 150, 17.5), (150, 205, 16.5)]
    faces_l = [v(24), v(21), v(26), v(22), v(25), v(23), v(27), v(26)]
    items = []
    for side, specs, X, sd in (('L', left, -15.6, 1), ('R', right, 1.2, -1)):
        for i, (z0, z1, h) in enumerate(specs):
            dz = z0 + (z1 - z0) * 0.45
            climbed = (dz - head_z) / 9.0

            def litf(k, j, climbed=climbed, i=i, side=side):
                if climbed < 0:
                    return False
                return k <= climbed and random.Random((side == 'L') * 100000 + i * 1000 + k * 37 + j).random() < 0.85
            face = faces_l[i % len(faces_l)] if side == 'L' else mix(v(20), v(28), (i % 3) / 2)
            items.append((z0, facade_x(cam, X, z0, z1, h, sd, litf, face, door_z=dz, door_warm=climbed >= 0,
                                       roof=(side == 'L'), chimneys=2 if z1 - z0 < 20 else 3)))
            if side == 'R':
                # our side's balconies, snowy slabs stepping away up the street
                o = []
                fl = 0
                while 3.6 + fl * 3.3 < h - 1:
                    yy = 3.0 + fl * 3.3
                    zz = z0 + 1.2
                    while zz + 1.6 < z1:
                        q = [P(X, yy, zz), P(X, yy, zz + 1.6), P(X - 1.2, yy, zz + 1.6), P(X - 1.2, yy, zz)]
                        o.append(poly(q, v(58)))
                        o.append(poly([P(X - 1.2, yy, zz), P(X - 1.2, yy, zz + 1.6), P(X - 1.2, yy + 1.0, zz + 1.6), P(X - 1.2, yy + 1.0, zz)], v(14), 0.85))
                        zz += 6.8
                    fl += 1
                items.append((z0 - 0.01, ''.join(o)))
    for _, svg in sorted(items, key=lambda it: -it[0]):
        out.append(svg)
    # the current turns in at every door it has passed (both sides), and those doors glow
    for side, specs, X in (('L', left, -15.6), ('R', right, 1.2)):
        for (z0, z1, h) in specs:
            dz = z0 + (z1 - z0) * 0.45
            if dz <= head_z + 0.5:
                continue
            x_from = xc(dz) - 0.55 if X < 0 else xc(dz) + 0.55
            out.append(melt_branch(cam, rng, dz, x_from, X, hw=0.2))
    # a tram stopped far up the street, people on the pavements turned to the glowing snow
    tz0, tz1 = 66, 92
    sidep = [P(-8.4, 0.3, tz0), P(-8.4, 0.3, tz1), P(-8.4, 3.6, tz1), P(-8.4, 3.6, tz0)]
    topp = [P(-8.4, 3.6, tz0), P(-8.4, 3.6, tz1), P(-11.0, 3.6, tz1), P(-11.0, 3.6, tz0)]
    out.append(poly(sidep, v(38)))
    out.append(poly(topp, v(76)))
    for zz in range(tz0 + 2, tz1 - 2, 4):
        q = [P(-8.38, 1.8, zz), P(-8.38, 1.8, zz + 2.6), P(-8.38, 2.9, zz + 2.6), P(-8.38, 2.9, zz)]
        out.append(poly(q, v(80)))
    for (X, Z, hh) in ((-14.0, 34, 1.75), (-14.5, 35, 1.65), (-1.0, 46, 1.7)):
        fx, fy = P(X, 0, Z)
        top = P(X, hh, Z)
        out.append(person(fx, fy, max(8, fy - top[1]), v(10), pose='stand', cap=True))
    # the hung lamps on their cross-wires, seen from above
    for zz in (22, 34, 52, 80, 120):
        a, b = P(-15.6, 8.0, zz), P(1.2, 8.0, zz)
        mid = P(-7.2, 7.2, zz)
        out.append(path('M%.1f,%.1f Q%.1f,%.1f %.1f,%.1f' % (a[0], a[1], mid[0], mid[1] + 6, b[0], b[1]), 'none', v(12), max(0.8, 26 / zz)))
        out.append(hung_lamp(mid[0], mid[1] + 3, r=max(2.0, 120 / zz)))
    # ITS RUNNING HEAD, just arriving below your balcony
    out.append(running_head(cam, rng, xc, head_z, size=1.7))
    out.append(snowfall(rng, n=160))
    # YOUR BALCONY: its snowy iron rail across the bottom, a flower box under snow; your gloved hand and phone
    out.append(poly([(0, 1700), (W, 1656), (W, H), (0, H)], v(14)))
    for k in range(30):
        x = -20 + k * 40
        ytop = 1700 - (x / W) * 44
        out.append(rect(x, ytop, 8, H - ytop, v(8)))
    out.append(poly([(0, 1800), (W, 1760), (W, 1772), (0, 1812)], v(8)))
    out.append(poly([(0, 1688), (W, 1644), (W, 1662), (0, 1706)], v(30)))
    out.append(path(smooth([(-10, 1690), (200, 1676), (420, 1668), (640, 1660), (860, 1650), (1090, 1640)]) + ' L1090,1652 L-10,1702 Z', v(86)))
    out.append(rect(640, 1600, 230, 56, v(20)))
    out.append(path(smooth([(636, 1604), (700, 1590), (760, 1596), (830, 1586), (874, 1600)]) + ' L874,1612 L636,1612 Z', v(84)))
    for (sx, sh) in ((672, 34), (700, 46), (742, 28), (790, 40), (832, 30)):
        out.append(path('M%.1f,1600 q-6,-%d 4,-%d' % (sx, sh * 0.6, sh), 'none', v(22), 2.2))
    out.append(pov_phone(120, 1330, scale=0.86))
    out.append(caption([[('wants AI to heat', False)], [('70,000', True), (' homes?', False)]]))
    return ''.join(out) + texture()


def f_B5alt(rng):
    """The tea cosy: the giant computer under a huge knitted tea cosy, its spout and handle poking out (a teapot under its
    cosy: the teapot computer itself), the knit lit warm by the heat beneath; she holds her tiny mug up under the spout."""
    out = [hall_front_bg(rng)]
    out.append(side_racks(rng, y0=760, y1=1600, xs=((-300, 150), (930, 1380))))
    cx, base, cw, ch = 450, 1600, 500, 860
    top = base - ch
    out.append(ell(cx, base - 10, cw * 0.65, 64, w(70), 0.55, extra='filter="url(#gL)"'))
    # the handle (left) and the spout (right), dark metal with the warm on their inner edges, behind the knit
    hd = 'M%.1f,%.1f C%.1f,%.1f %.1f,%.1f %.1f,%.1f' % (cx - cw / 2 + 10, base - 580, cx - cw / 2 - 90, base - 560, cx - cw / 2 - 96, base - 380,
                                                         cx - cw / 2 + 8, base - 350)
    metal, metal_lit = mix(v(46), w(46), 0.35), mix(v(70), w(80), 0.55)
    out.append(path(hd, 'none', w(70), 50, 0.3, extra='filter="url(#gS)"'))
    out.append(path(hd, 'none', v(14), 38))
    out.append(path(hd, 'none', metal, 30))
    out.append(path(hd, 'none', metal_lit, 8, 0.9, extra='transform="translate(9,0)"'))
    spout = smooth([(cx + cw / 2 - 40, base - 300), (cx + cw / 2 + 40, base - 340), (cx + cw / 2 + 96, base - 410), (cx + cw / 2 + 126, base - 482),
                    (cx + cw / 2 + 152, base - 500), (cx + cw / 2 + 146, base - 520), (cx + cw / 2 + 108, base - 512),
                    (cx + cw / 2 + 76, base - 462), (cx + cw / 2 + 26, base - 430), (cx + cw / 2 - 40, base - 440)], closed=True)
    out.append(path(spout, w(70), op=0.35, extra='filter="url(#gM)"'))
    out.append(path(spout, v(14), extra='transform="translate(0,4)"'))
    out.append(path(spout, metal))
    out.append(path(smooth([(cx + cw / 2 + 4, base - 352), (cx + cw / 2 + 56, base - 386), (cx + cw / 2 + 100, base - 440),
                            (cx + cw / 2 + 126, base - 494)]), 'none', metal_lit, 7, 0.9))
    tip = (cx + cw / 2 + 146, base - 512)
    out.append(ell(tip[0], tip[1], 10, 6, v(10)))
    out.append(wisps(tip[0], tip[1], 70, 3, v(94), 6, rng, spread=8, op=0.6, lean=0.15))
    # the cosy's dome, the knit lit warm from the heat beneath (warmest at the hem)
    out.append('<defs><linearGradient id="cosy" x1="0" y1="%d" x2="0" y2="%d" gradientUnits="userSpaceOnUse">'
               '<stop offset="0" stop-color="%s"/><stop offset="0.45" stop-color="%s"/><stop offset="1" stop-color="%s"/>'
               '</linearGradient></defs>' % (top, base, mix(v(30), w(40), 0.25), mix(v(30), w(52), 0.6), mix(v(30), w(64), 0.95)))
    dome = smooth([(cx - cw / 2, base), (cx - cw / 2 - 8, base - ch * 0.55), (cx - cw * 0.36, base - ch * 0.88), (cx, top),
                   (cx + cw * 0.36, base - ch * 0.88), (cx + cw / 2 + 8, base - ch * 0.55), (cx + cw / 2, base)], closed=True)
    out.append(path(dome, 'url(#cosy)'))
    out.append(path(dome, w(80), op=0.18, extra='filter="url(#gL)"'))
    # knit pattern: ribbed hem, rows of zigzags and snowflakes (a Nordic knit), lit warm, brightest low
    out.append(rect(cx - cw / 2, base - 70, cw, 70, mix(v(30), w(58), 0.8)))
    for xx in range(int(cx - cw / 2) + 8, int(cx + cw / 2), 18):
        out.append(line(xx, base - 66, xx, base - 4, w(74), 6, 0.8))
    for row, yy in enumerate((base - 150, base - 330, base - 510)):
        span = cw * (0.98 - 0.12 * row)
        pts_ = []
        n = int(span / 36)
        for k in range(n + 1):
            pts_.append((cx - span / 2 + k * span / n, yy + (14 if k % 2 else -14)))
        out.append(path('M' + ' L'.join('%.1f,%.1f' % q for q in pts_), 'none', w(80 - row * 8), 8, 0.9))
    for (fx, fy, fr) in ((cx - 140, base - 245, 32), (cx, base - 245, 36), (cx + 140, base - 245, 32), (cx - 76, base - 425, 28), (cx + 76, base - 425, 28)):
        for a in range(6):
            ang = a * math.pi / 3
            out.append(line(fx, fy, fx + math.cos(ang) * fr, fy + math.sin(ang) * fr, w(86 if fy > base - 300 else 78), 6))
        out.append(circ(fx, fy, 7, w(90)))
    out.append(rect(cx - cw / 2, base - 16, cw, 16, w(88), 0.85))
    # the pompom, steam out of the top
    out.append(circ(cx, top - 40, 58, mix(v(46), w(60), 0.3)))
    for k in range(16):
        ang = k * math.pi / 8
        out.append(line(cx + math.cos(ang) * 30, top - 40 + math.sin(ang) * 30, cx + math.cos(ang) * 60, top - 40 + math.sin(ang) * 60, mix(v(58), w(66), 0.3), 6))
    out.append(wisps(cx + 6, top - 90, 60, 5, w(90), 10, rng, spread=20, op=0.6, lean=0.2))
    for xx in range(int(cx - cw / 2) + 40, int(cx + cw / 2) - 30, 46):
        out.append(circ(xx, base - 8, 3.5, v(94)))
    # she holds her one tiny mug up under the spout, waiting for her pour
    J = dict(ftL=(862, 1600), ftR=(900, 1602), knL=(864, 1500), knR=(898, 1500), hipL=(866, 1404), hipR=(896, 1404),
             shL=(860, 1272), shR=(904, 1276), elL=(830, 1226), haL=(818, 1158), elR=(912, 1336), haR=(906, 1398),
             neck=(882, 1258), head=(880, 1230), hr=22, tilt=-14, hem=34)
    out.append(figure(J, v(7), wl=20, wa=15, rim=(w(78), -3)))
    out.append(rect(796, 1112, 40, 44, v(92), rx=6))
    out.append(path('M%.1f,%.1f q14,6 0,22' % (836, 1120), 'none', v(92), 5))
    out.append(ell(560, 1650, 330, 50, w(70), 0.3, extra='filter="url(#gL)"'))
    out.append(caption([[("That's a lot of ", False), ('tea.', True)]]))
    return ''.join(out) + texture()


def f_B7alt(rng):
    """The street opens a way: down the middle of the island's street the manhole lids lift one after another, each a
    warm light laid toward the harbour end, a runway reaching for the heat that the hall's fans are throwing into the
    sky at the street's end."""
    cam = Cam(f=1000, cx=540, cy=1150, eye=1.6)
    P = cam.P
    body = street_of_homes(rng, cam, bloom=0.0, head_z=None, phone=False, people=True, far_lit=0.0)
    # the thrown-away heat, plain at the street's end: warm plumes off the hall's roof, cooling, thinning into the night
    for k, x in enumerate((508, 566, 628)):
        body += plume(x, 1112, 34, 760, 0.12 + 0.04 * k, rng, strength=0.95)
    # the runway: the manholes open one after another, each lid slid aside, each a warm light laid out toward the
    # harbour end (no steam: a welcome, the city reaching for the heat)
    for i, Z in enumerate((5.5, 8.5, 13, 20, 31, 48, 75, 115)):
        c = P(0, 0, Z)
        rx = 0.55 * 1000 / Z
        ry = max(2.0, rx * 1.6 / Z + 1.5)
        far = P(0, 0, Z + 3.4)
        body += poly([(c[0] - rx * 0.85, c[1]), (c[0] + rx * 0.85, c[1]), (far[0] + rx * 0.08, far[1]), (far[0] - rx * 0.08, far[1])],
                     w(84), 0.5, extra='filter="url(#gS)"')
        body += ell(c[0], c[1], rx * 2.0, ry * 2.4 + 4, w(70), 0.4, extra='filter="url(#gM)"')
        body += ell(c[0], c[1], rx * 1.12, ry * 1.12, v(18))
        body += ell(c[0], c[1], rx, ry, w(94))
        body += ell(c[0], c[1] - ry * 0.15, rx * 0.55, ry * 0.5, w(100), 0.9)
        lid = P(0.95, 0, Z + 0.2)
        body += ell(lid[0] + rx * 0.4, lid[1], rx * 0.95, ry * 0.95, v(16))
        body += ell(lid[0] + rx * 0.4, lid[1] - ry * 0.3, rx * 0.9, ry * 0.5, v(34), 0.8)
    body += caption([[('But Helsinki', False)], [('wants', True), (' that heat.', False)]])
    return body + texture()


def melt_line_street(rng, woman='tiny'):
    """The melt line: no cut; the heat shows as a melted line in the snow, a steaming manhole, frost clearing up the
    block. woman: 'tiny' (B11alt as judged THERE) or 'glass' (B11: bigger, at the glass, looking out at the street)."""
    def litf(k, j):
        return {0: True, 1: True, 2: j in (1, 2, 4), 3: j in (2,), 4: False}.get(k, False)
    out = [street_across(rng, litf, focal=(2, 2))]
    fl_h = (1330 - 150 - 700) / 5
    fw, fh = 70, 108
    fx = 170 + (930 - 170) * 2.5 / 5 - fw / 2
    fy = 700 + 2 * fl_h + fl_h * 0.22
    if woman == 'glass':
        out.append(woman_at_glass(fx, fy, fw, fh))
    else:
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


def woman_at_glass(fx, fy, fw, fh):
    """The one warm window with her right at the glass: head and shoulders filling it, in profile, looking down at the
    street where the warm line comes in; the window's bars in front of her."""
    out = [warm_window(fx, fy, fw, fh, t=92, mullion=False)]
    col = w(10)
    cx = fx + fw * 0.54
    sh_y = fy + fh * 0.8
    out.append(path(smooth([(fx - 1, fy + fh), (fx + 1, sh_y + 6), (cx - 22, sh_y - 8), (cx - 6, sh_y - 13), (cx + 10, sh_y - 13),
                            (cx + 26, sh_y - 6), (fx + fw + 1, sh_y + 8), (fx + fw + 1, fy + fh)], closed=True), col))
    hx, hy = cx - 2, fy + fh * 0.55
    out.append(rect(hx - 7, hy + 6, 14, sh_y - hy - 4, col))
    rot = 'transform="rotate(-16 %.1f %.1f)"' % (hx, hy)
    out.append(g([ell(hx, hy, 15, 18, col),
                  path('M%.1f,%.1f L%.1f,%.1f L%.1f,%.1f Z' % (hx - 14, hy - 2, hx - 21, hy + 5, hx - 14, hy + 8), col),
                  ell(hx + 15, hy - 6, 8, 8, col),
                  path(smooth([(hx - 15, hy - 5), (hx - 9, hy - 19), (hx + 6, hy - 21), (hx + 17, hy - 12), (hx + 12, hy - 2)], closed=True), col)], rot))
    fc = v(18)
    out.append(rect(fx + fw / 2 - 2, fy, 4, fh, fc, 0.55))
    out.append(rect(fx, fy + fh * 0.24, fw, 4, fc, 0.7))
    return ''.join(out)


def f_B11alt(rng):
    """The melt line (judged THERE: kept as it is)."""
    return melt_line_street(rng, woman='tiny')


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
