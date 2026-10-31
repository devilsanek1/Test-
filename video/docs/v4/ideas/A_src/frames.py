"""imagination A, THE FROSTED CITY: every beat as one whole 9:16 frame (value sketch, one warm accent).
python3 frames.py [B1 B2 ...]   renders the named frames (all if none) into the scratchpad, one at a time."""
import math
import random
import sys

from sketchlib import (W, H, Frame, g, HONEY, HONEY_CORE, AMBER, EMBER, INK, sky, cloud, band, snowfall, grain,
                       street_wall, computer_cabinet,
                       win_shape, snowcap, block, far_city, person, breath, plume, curl, kettle, mug, rack,
                       frost_fern, frost_field, warm, homography, qpoly, facade, hand_phone, frost_line, ice_line)
from render import render

FRAMES = {}


def frame(name):
    def deco(fn):
        FRAMES[name] = fn
        return fn
    return deco


# ------------------------------------------------------------------ the home view (B1, B12)
BY = 1240  # the far shore road: the city's foot


def home_view(f, wave=0.5, all_warm=False, her_step=False, data_plume=False, her_inside=False, resident=True,
              pulse=False):
    """from the snowy near shore, across a narrow arm of frozen harbour: her block with the one window in the
    golden box, the city's blocks stepping up the hill behind, the blank building at the harbour's edge (left).
    wave: how far the warm wave has run (0 frosted city .. 1 all warm); it runs from the blank building outward."""
    r = f.rng
    sky(f, [(0, 15), (0.3, 19), (0.55, 27), (0.72, 35), (0.86, 42), (1, 46)], 0, BY)
    cloud(f, 250, 150, 760, 230, 25, 0.95, seed=3)
    cloud(f, 900, 230, 420, 120, 22, 0.8, seed=4)
    cloud(f, 620, 700, 1000, 110, 31, 0.6, seed=5)

    def front_d(x, y):
        return math.hypot((x - 120) / 1.0, (y - 1200) * 1.1) - (80 + wave * 900)

    def warm_at(x, y):
        if all_warm:
            return True
        return front_d(x, y) < 0

    def state_at(x, y):
        if all_warm:
            return 'warm'
        d = front_d(x, y)
        if d < -90:
            return 'warm'
        if d < 0:
            return 'crest'
        if d < 60:
            return 'half'
        return 'frost'

    # the hill: the far city stepping up to the right, the dome on its crest
    rr = random.Random(21)
    x = -30
    while x < W + 40:
        bw = rr.uniform(56, 110)
        base = 1010 - (x + 30) * 0.13
        bh = rr.uniform(70, 140)
        top = max(690, base - bh)
        Lb = 36 + rr.uniform(-3, 3)
        f.poly([(x, 1200), (x, top), (x + bw, top + rr.uniform(-4, 4)), (x + bw, 1200)], g(Lb), 'filter="url(#rough)"')
        snowcap(f, x - 1, x + bw + 1, top + 3, th=5, L=58)
        for yy in range(int(top + 14), int(base + 120), 15):
            for xx in range(int(x + 7), int(x + bw - 6), 13):
                if rr.random() < 0.55:
                    st_ = state_at(xx, yy)
                    if st_ in ('warm', 'crest'):
                        f.rect(xx, yy, 6, 7, HONEY_CORE if st_ == 'crest' else HONEY, 'opacity="0.95"')
                    elif st_ == 'half':
                        f.rect(xx, yy, 6, 7, AMBER, 'opacity="0.8"')
                    else:
                        f.rect(xx, yy, 6, 7, g(52), 'opacity="0.9"')
        x += bw - 6
    # the dome on the crest (a landmark of the view only)
    f.rect(842, 760, 74, 140, g(40))
    f.ellipse(879, 762, 40, 36, g(43))
    f.ellipse(879, 730, 14, 16, g(44))
    f.rect(877, 680, 4, 40, g(44))
    snowcap(f, 840, 918, 764, th=5, L=60)

    def st_for(x0, ytop):
        def st(row, c):
            xx = x0 + 20 + c * 60
            yy = ytop + 40 + row * 60
            return state_at(xx, yy)
        return st

    block(f, -20, 178, 980, BY, 5, 3, L=26, states=st_for(-20, 980), chimneys=2, frost_L=60, seed=31)
    block(f, 178, 400, 930, BY, 6, 4, L=30, states=st_for(178, 930), chimneys=3, frost_L=60, seed=32, side=-14)

    # her block: Jugendstil, a corner tower, the one window (row 3, col 2)
    def her_states(row, c):
        if row == 3 and c == 2:
            return None
        xx = 410 + c * 64
        yy = 830 + row * 70
        return state_at(xx, yy)

    block(f, 400, 732, 790, BY, 6, 5, L=24, states=her_states, chimneys=3, frost_L=60, seed=33, tower=(695, 74, 130),
          side=16, side_L=18)
    wx, wy, ww, wh = 526, 1028, 60, 86
    f.rect(wx - 7, wy - 8, ww + 14, wh + 14, g(12))
    lit = warm_at(556, 1060) or her_step
    if her_step:
        f.add(f'<rect x="{wx - 70}" y="{wy - 60}" width="{ww + 140}" height="{wh + 120}" fill="{HONEY}" opacity="0.5" filter="url(#glow2)"/>')
    win_shape(f, wx, wy, ww, wh, 'warm' if lit else 'frost', frost_L=62, warmth=1.7)
    if her_inside:
        person(f, wx + ww * 0.36, wy + wh + 1, 50, L=10, pose='stand', facing=-1, coat=False)
    snowcap(f, wx - 9, wx + ww + 9, wy + wh + 7, th=6, L=88 if lit else 76)
    if lit:
        f.add(f'<path d="M{wx - 4},{wy + wh + 12} L{wx + ww + 4},{wy + wh + 12} L{wx + ww + 28},{wy + wh + 80} L{wx - 28},{wy + wh + 80}Z" '
              f'fill="{HONEY}" opacity="0.14" filter="url(#soft2)"/>')

    block(f, 748, 968, 960, BY, 5, 3, L=28, states=st_for(748, 960), chimneys=2, frost_L=60, seed=34)
    block(f, 968, 1110, 925, BY, 6, 2, L=25, states=st_for(968, 925), chimneys=2, frost_L=60, seed=35)

    # the blank building at the harbour's edge (left): no windows, cold lights, roof fans
    f.poly([(-10, 1250), (-10, 1098), (306, 1092), (322, 1104), (322, 1250)], g(15), 'filter="url(#rough2)"')
    f.poly([(306, 1092), (338, 1104), (338, 1250), (322, 1250), (322, 1104)], g(11))
    f.add(f'<path d="M-10,1099 L306,1093" stroke="{g(46)}" stroke-width="3" opacity="0.8"/>')
    snowcap(f, -10, 322, 1096, th=6, L=52)
    for k in range(15):
        f.rect(10 + k * 20, 1226, 4, 3, g(90))
    for k in range(3):
        fx = 62 + k * 88
        f.rect(fx - 30, 1074, 60, 18, g(20))
        f.ellipse(fx, 1074, 30, 8, g(30))
    if data_plume:
        plume(f, [(62, 1050), (110, 990), (170, 950), (250, 920), (340, 905)], [50, 70, 90, 110, 130], L=70, op=0.75, seed=7)
    f.ellipse(160, 1256, 230, 20, g(72), 'opacity="0.22" filter="url(#soft3)"')

    # the far shore road and the warm run along it (the warm water under the snow)
    f.rect(0, BY, W, 18, g(40), 'filter="url(#rough2)"')
    if wave > 0 or all_warm:
        f.ellipse(170, BY + 6, 70, 26, HONEY, 'opacity="0.45" filter="url(#soft3)"')
        run_to = 1080 if all_warm else min(1080, 150 + wave * 1000)
        sw = 8 if pulse else 5
        f.add(f'<path d="M160,{BY + 9} L{run_to},{BY + 8}" stroke="{HONEY}" stroke-width="{sw}" opacity="0.95" '
              f'stroke-linecap="round" filter="url(#soft1)"/>')
        f.add(f'<path d="M160,{BY + 9} L{run_to},{BY + 8}" stroke="{HONEY}" stroke-width="26" opacity="{0.3 if pulse else 0.16}" filter="url(#soft3)"/>')
    for k in range(9):
        lx = 40 + k * 125
        f.rect(lx, 1196, 3, 46, g(14))
        f.circle(lx + 1, 1196, 4, g(80))

    # the frozen harbour arm: ice sheets, a dark open channel that steams, the warm windows mirrored in it
    ice = f.lingrad([(0, g(46), 1), (1, g(40), 1)])
    f.rect(0, BY + 18, W, 230, ice)
    for k in range(9):
        y = BY + 26 + k * 24 + r.uniform(-4, 4)
        f.add(f'<path d="M{r.uniform(-50, 300):.0f},{y:.0f} L{r.uniform(500, 1130):.0f},{y + r.uniform(-6, 6):.0f}" '
              f'stroke="{g(r.choice([36, 52, 56]))}" stroke-width="{r.uniform(2, 6):.1f}" opacity="0.7"/>')
    cy = BY + 112
    f.add(f'<path d="M-20,{cy} C200,{cy - 10} 420,{cy + 18} 640,{cy + 2} C800,{cy - 8} 960,{cy + 8} 1100,{cy - 2} L1100,{cy + 40} '
          f'C900,{cy + 48} 700,{cy + 34} 520,{cy + 46} C300,{cy + 58} 120,{cy + 40} -20,{cy + 48}Z" fill="{g(15)}" filter="url(#rough)"/>')
    for k in range(16):
        xx = 30 + k * 68
        if warm_at(xx, 1060):
            f.rect(xx, cy + 8, 5, 30, HONEY, 'opacity="0.6" filter="url(#soft1)"')
    plume(f, [(120, cy - 6), (380, cy - 10), (660, cy - 12), (940, cy - 8)], [60, 70, 60, 70], L=70, op=0.32, filt='steam2', seed=11)

    # the near shore: dark snow, footprints, a bollard, the resident walking home
    near = f.lingrad([(0, g(36), 1), (0.3, g(28), 1), (1, g(13), 1)])
    f.poly([(0, 1478), (300, 1466), (700, 1474), (1080, 1462), (1080, 1920), (0, 1920)], near, 'filter="url(#rough)"')
    snowcap(f, 0, 1080, 1478, th=10, L=50)
    for k in range(9):
        y = 1560 + k * 42
        f.add(f'<path d="M{r.uniform(-40, 200):.0f},{y} Q540,{y - 10 + r.uniform(-8, 8):.0f} {r.uniform(880, 1120):.0f},{y + r.uniform(-6, 6):.0f}" '
              f'stroke="{g(r.choice([22, 32, 36]))}" stroke-width="{r.uniform(3, 9):.0f}" fill="none" opacity="0.5" filter="url(#soft1)"/>')
    for k in range(16):
        fx = 880 - k * 50 + r.uniform(-6, 6)
        fy = 1560 + k * 9 + (10 if k % 2 else -10)
        f.ellipse(fx, fy, 8, 4, g(18), 'opacity="0.7"')
    f.rect(1010, 1420, 36, 130, g(10), 'filter="url(#rough2)"')
    snowcap(f, 1006, 1050, 1422, th=8, L=62)
    if resident:
        person(f, 780, 1556, 210, L=9, pose='walk', facing=-1, rim=-1, bag=True, scarf=True)
        breath(f, 744, 1372, s=1.0)
    snowfall(f, 150, sizes=(2, 5), seed=12)
    snowfall(f, 28, region=(0, 1250, W, H), sizes=(6, 10), seed=13, op=(0.4, 0.75))


@frame('B1')
def b1():
    f = Frame(101)
    home_view(f, wave=0.55)
    band(f, ['to heat', [('70,000', True), (' homes?', False)]], seat=530)
    grain(f)
    return f


# ------------------------------------------------------------------ inside the building with no windows (B2, B3)
def aisle(f, hot=0.0, scale=1.0, tech=(540, 1300, 150), tech_pose='stand', steam_out=0.0):
    """a street of giant computers: two rows of cabinets receding to the one opening, a huge door on the night;
    their rows of small cold lights rhyme with a city's windows. hot: 0 cold .. 1 the vents glow honey."""
    vx, vy = 540, 1050

    def S(x, y):
        return (vx + (x - vx) * scale, vy + (y - vy) * scale)

    # ceiling (the band is this calm dark field)
    ceil = f.lingrad([(0, g(9), 1), (1, g(14 + 6 * hot), 1)])
    f.poly([(0, 0), (W, 0), (W, S(1080, 620)[1]), S(640, 940), S(440, 940), (0, S(0, 620)[1])], ceil)
    for xx in (300, 780):
        a, b = S(xx + (540 - xx) * 0.36, 640), S(xx + (540 - xx) * 0.82, 930)
        f.add(f'<line x1="{a[0]:.0f}" y1="{max(612, a[1]):.0f}" x2="{b[0]:.0f}" y2="{b[1]:.0f}" stroke="{g(70)}" stroke-width="{6 * scale:.1f}" opacity="0.5"/>')
    # the door at the end: the night, the frozen harbour, the city's warm windows across it
    d0, d1 = S(440, 940), S(640, 1150)
    f.rect(d0[0], d0[1], d1[0] - d0[0], d1[1] - d0[1], f.lingrad([(0, g(22), 1), (0.6, g(32), 1), (1, g(40), 1)]))
    dw, dh = d1[0] - d0[0], d1[1] - d0[1]
    rr = random.Random(5)
    for k in range(9):
        bx = d0[0] + dw * k / 9
        bh = dh * rr.uniform(0.12, 0.26)
        f.rect(bx, d0[1] + dh * 0.72 - bh, dw / 9 + 1, bh, g(26))
        for j in range(3):
            if rr.random() < 0.8:
                f.rect(bx + dw / 9 * rr.uniform(0.2, 0.6), d0[1] + dh * 0.72 - bh * rr.uniform(0.3, 0.9), 3 * scale, 4 * scale, HONEY)
    f.rect(d0[0], d0[1] + dh * 0.72, dw, dh * 0.28, g(44))
    snowfall(f, 26, region=(d0[0], d0[1], d1[0], d1[1]), sizes=(1, 2.5 * scale), seed=8, skip_band=False)
    f.add(f'<rect x="{d0[0] - 6}" y="{d0[1] - 6}" width="{dw + 12}" height="{dh + 6}" fill="none" stroke="{g(48)}" stroke-width="{5 * scale:.1f}"/>')
    if steam_out > 0:
        plume(f, [(d0[0] + dw * 0.5, d0[1] + dh * 0.1), (d0[0] + dw * 0.3, d0[1] - dh * 0.05), (d0[0] + dw * 0.7, d0[1] + dh * 0.05)],
              [dw * 0.5, dw * 0.45, dw * 0.4], L=80, op=0.55 * steam_out, filt='steam2', seed=14)
    # the floor: polished, mirroring the lights and the door
    fl = f.lingrad([(0, g(20 + 6 * hot), 1), (1, g(12), 1)])
    f.poly([S(0, 1760), S(440, 1150), S(640, 1150), S(1080, 1760), (W, H), (0, H)], fl)
    f.poly([S(450, 1150), S(630, 1150), S(760, 1920), S(320, 1920)], g(46), 'opacity="0.25" filter="url(#soft3)"')
    # the two rows of giant computers
    for side in (-1, 1):
        if side < 0:
            quad = [S(0, 620), S(440, 940), S(440, 1150), S(0, 1760)]
        else:
            quad = [S(1080, 620), S(640, 940), S(640, 1150), S(1080, 1760)]
        m = homography(quad)
        n = 7
        rr = random.Random(40 + side)
        for i in range(n):
            u0, u1 = i / n + 0.012, (i + 1) / n - 0.012
            qpoly(f, m, u0, 0.0, u1, 1.0, g(13 + rr.uniform(-2, 2)), 'filter="url(#rough2)"')
            # the cabinet's lit edge (a cool rim from the ceiling strips)
            a, b = m(u0, 0.0), m(u0, 1.0)
            f.add(f'<line x1="{a[0]:.1f}" y1="{a[1]:.1f}" x2="{b[0]:.1f}" y2="{b[1]:.1f}" stroke="{g(34)}" stroke-width="{max(1.5, 4 * (1 - i / n)) * scale:.1f}"/>')
            rows = 11
            for j in range(rows):
                v = 0.06 + 0.88 * j / (rows - 1)
                if hot > 0:
                    va, vb = v - 0.012, v + 0.012
                    p1, p2, p3, p4 = m(u0 + 0.02, va), m(u1 - 0.02, va), m(u1 - 0.02, vb), m(u0 + 0.02, vb)
                    f.add(f'<polygon points="{p1[0]:.1f},{p1[1]:.1f} {p2[0]:.1f},{p2[1]:.1f} {p3[0]:.1f},{p3[1]:.1f} {p4[0]:.1f},{p4[1]:.1f}" '
                          f'fill="{HONEY}" opacity="{0.45 + 0.5 * hot * rr.random():.2f}"/>')
                else:
                    k = rr.randint(2, 6)
                    for t in range(k):
                        uu = u0 + (u1 - u0) * (0.1 + 0.12 * t)
                        if rr.random() < 0.85:
                            p1, p2 = m(uu, v - 0.004), m(uu + (u1 - u0) * 0.05, v + 0.004)
                            f.rect(min(p1[0], p2[0]), min(p1[1], p2[1]), max(2.0, abs(p2[0] - p1[0])), max(2.0, abs(p2[1] - p1[1])), g(90))
            if hot > 0:
                c = m((u0 + u1) / 2, 0.5)
                wid = abs(m(u1, 0.5)[0] - m(u0, 0.5)[0])
                f.add(f'<ellipse cx="{c[0]:.0f}" cy="{c[1]:.0f}" rx="{wid * 0.9:.0f}" ry="{abs(m(u0, 1)[1] - m(u0, 0)[1]) * 0.5:.0f}" '
                      f'fill="{HONEY}" opacity="{0.18 * hot:.2f}" filter="url(#glow2)"/>')
        # their reflections on the floor
        for i in range(n):
            a = m((i + 0.5) / n, 1.0)
            f.add(f'<rect x="{a[0] - 8 * scale:.0f}" y="{a[1]:.0f}" width="{16 * scale:.0f}" height="{120 * scale * (1 - i / n) + 20:.0f}" '
                  f'fill="{HONEY if hot > 0 else g(60)}" opacity="{0.25 if hot > 0 else 0.15}" filter="url(#soft2)"/>')
    if hot > 0:
        # the heat rising off the cabinets' tops: soft columns of warm air and steam under the ceiling (kept under the band)
        cid = f.uid('below')
        f.defs.append(f'<clipPath id="{cid}"><rect x="0" y="616" width="{W}" height="{H}"/></clipPath>')
        f.add(f'<g clip-path="url(#{cid})">')
        for side in (-1, 1):
            for i in range(5):
                t = i / 5
                x = (540 - 520 * (1 - t) * 0.9) if side < 0 else (540 + 520 * (1 - t) * 0.9)
                y = 640 + 300 * t
                X, Y = S(x, y)
                wdt = (120 - 80 * t) * scale
                plume(f, [(X, Y - 10), (X + side * 10, Y - 60 * scale), (X + side * 20, Y - 110 * scale)], [wdt, wdt * 1.2, wdt * 1.4],
                      L=74, op=0.38 * hot, filt='steam2', seed=60 + i + (10 if side > 0 else 0), warm_root=0.25)
        f.add('</g>')
    tx, ty, th = tech
    person(f, tx, ty, th, L=7, pose=tech_pose, facing=1, coat=False, hair=False, rim=-1 if hot == 0 else 1)
    if hot > 0.5:
        # a hand to his brow: phew
        hd = th / 7.8
        hx, hy = tx, ty - th + hd * 0.55
        f.add(f'<path d="M{hx + hd * 0.4},{hy + hd * 1.0} L{hx + hd * 0.95},{hy + hd * 0.2} L{hx + hd * 0.6},{hy - hd * 0.2} '
              f'L{hx + hd * 0.25},{hy - hd * 0.05} L{hx + hd * 0.55},{hy + hd * 0.25} L{hx + hd * 0.15},{hy + hd * 0.95}Z" fill="{g(7)}"/>')


@frame('B2')
def b2():
    f = Frame(202)
    aisle(f, hot=0.0, scale=1.0, tech=(560, 1290, 150))
    band(f, ['AI runs on', [('giant', True), (' computers,', False)]], seat=530, L=84, op=0.75)
    grain(f)
    return f


@frame('B3')
def b3():
    f = Frame(303)
    aisle(f, hot=1.0, scale=1.25, tech=(650, 1520, 300), steam_out=1.0)
    band(f, ['Those computers', [('get really ', False), ('hot.', True)]], seat=540, L=84, op=0.75)
    grain(f)
    return f


# ------------------------------------------------------------------ B4: a whole block boiling
def kettle_block(f, x0, x1, ytop, ybase, cols=8, floors=5, steam=True, seed=44, small=False):
    """an apartment block whose 40 kitchens each boil a kettle on the sill: steam from every window, one cloud"""
    rr = random.Random(seed)
    w = x1 - x0
    hgt = ybase - ytop
    gf = hgt * 0.16  # the ground floor: a door and a shop window
    f.poly([(x0, ybase), (x0, ytop), (x1, ytop + 4), (x1, ybase)], g(25), 'filter="url(#rough2)"')
    f.poly([(x1, ytop + 6), (x1 + w * 0.05, ytop + 20), (x1 + w * 0.05, ybase), (x1, ybase)], g(18))
    snowcap(f, x0 - 4, x1 + 4, ytop + 2, th=9, L=74)
    for i in range(4):
        cx = x0 + w * (0.12 + 0.24 * i) + rr.uniform(-10, 10)
        f.rect(cx, ytop - 26, 15, 30, g(21))
        snowcap(f, cx - 2, cx + 17, ytop - 25, th=5, L=74)
    fh = (hgt - gf - 20) / floors
    cw = w / cols
    tops = []
    for row in range(floors):
        for c in range(cols):
            ww, wh = cw * 0.5, fh * 0.56
            wx = x0 + cw * (c + 0.5) - ww / 2 + rr.uniform(-2, 2)
            wy = ytop + 18 + fh * row + fh * 0.16 + rr.uniform(-2, 2)
            f.rect(wx - 2, wy - 3, ww + 4, wh + 4, g(15))
            win_shape(f, wx, wy, ww, wh, 'warm', mullion=False, warmth=0.8)
            snowcap(f, wx - 3, wx + ww + 3, wy + wh + 2, th=3, L=84, sag=0.3)
            ks = ww / 60
            kettle(f, wx + ww * 0.42, wy + wh - 1, s=ks, L=14, steam=False)
            if steam:
                curl(f, wx + ww * 0.62, wy - 2, h=fh * 0.45, L=90, op=0.8, sw=max(1.6, ww * 0.06))
            tops.append((wx + ww / 2, wy))
    # the ground floor: a lit door and a dark shop window
    f.rect(x0 + w * 0.42, ybase - gf * 0.85, w * 0.09, gf * 0.85, g(14))
    f.rect(x0 + w * 0.08, ybase - gf * 0.7, w * 0.26, gf * 0.5, g(17))
    f.rect(x0 + w * 0.62, ybase - gf * 0.7, w * 0.26, gf * 0.5, g(17))
    if steam:
        # the forty curls gather into one soft cloud over the roof
        plume(f, [(x0 + w * 0.15, ytop - 40), (x0 + w * 0.4, ytop - 70), (x0 + w * 0.65, ytop - 60), (x0 + w * 0.88, ytop - 45)],
              [150, 190, 180, 150], L=84, op=0.8, seed=seed + 1)
        for x in range(int(x0 + 20), int(x1), 70):
            plume(f, [(x, ytop + 30), (x + 6, ytop - 10)], [40, 60], L=84, op=0.45, filt='steam2', seed=int(x))


@frame('B4')
def b4():
    f = Frame(404)
    sky(f, [(0, 14), (0.4, 20), (0.7, 30), (1, 36)], 0, 1480)
    cloud(f, 300, 140, 800, 220, 22, 0.9, seed=31)
    # the street goes on past the edges: a frosted neighbour on the left, the block of forty kitchens
    block(f, -40, 250, 980, 1440, 6, 3, L=21, states=lambda r_, c: 'frost', chimneys=2, frost_L=56, seed=45)
    kettle_block(f, 300, 1040, 700, 1440)
    # the street: kerb, the road's snow, tram rails, the near snow
    f.rect(0, 1440, W, 20, g(48), 'filter="url(#rough2)"')
    road = f.lingrad([(0, g(40), 1), (1, g(30), 1)])
    f.rect(0, 1460, W, 180, road)
    for yy in (1530, 1556, 1596, 1622):
        f.add(f'<line x1="0" y1="{yy}" x2="{W}" y2="{yy + 6}" stroke="{g(22)}" stroke-width="4" opacity="0.8"/>')
    near = f.lingrad([(0, g(34), 1), (1, g(14), 1)])
    f.poly([(0, 1650), (W, 1640), (W, H), (0, H)], near, 'filter="url(#rough)"')
    snowcap(f, 0, W, 1652, th=10, L=48)
    f.ellipse(670, 1470, 420, 40, HONEY, 'opacity="0.16" filter="url(#soft4)"')
    # the ONE giant computer, out in the snow on the near pavement: a machine, four times a person's height,
    # melting its own pool in the snow, its own column of steam as big as the forty together
    f.ellipse(160, 1640, 220, 34, g(12), 'opacity="0.9" filter="url(#soft1)"')
    f.ellipse(160, 1640, 250, 40, g(70), 'opacity="0.18" filter="url(#soft3)"')
    computer_cabinet(f, 50, 930, 220, 1640, L=11, seed=4)
    # a neighbour and her dog stop beside it and look up
    person(f, 360, 1650, 172, L=8, pose='stand', facing=-1, rim=1, scarf=True)
    f.add(f'<path d="M392,1650 l6,-28 l34,-5 l11,-13 l9,6 l-4,13 l-7,27 l-7,0 l0,-16 l-29,2 l-4,14Z" fill="{g(8)}"/>')
    breath(f, 338, 1495, s=0.8)
    snowfall(f, 130, sizes=(2, 5), seed=41)
    band(f, ['as much heat as', [('forty', True), (' kettles,', False)]], seat=540)
    grain(f)
    return f


# ------------------------------------------------------------------ B5: one cup
def her_bust(f, x, y, s=1.0, L=22, rim=True):
    """her, waist up, three-quarter from behind, head turned to the window (a lost profile: only the cheek's edge and
    an ear show), copper hair twisted up in a claw clip, an oversized knit; one mug held up by the glass.
    (x, y) = her nape."""
    knit = g(L)
    skin = g(L + 12)
    hair = g(L - 9)
    # the knit: dropped shoulders, soft and wide, a little narrower at the waist, cut by the frame's bottom
    f.add(f'<path d="M{x - 34 * s},{y + 30 * s} C{x - 120 * s},{y + 40 * s} {x - 178 * s},{y + 80 * s} {x - 196 * s},{y + 200 * s} '
          f'C{x - 210 * s},{y + 330 * s} {x - 190 * s},{y + 520 * s} {x - 170 * s},{y + 760 * s} L{x + 170 * s},{y + 760 * s} '
          f'C{x + 176 * s},{y + 540 * s} {x + 182 * s},{y + 340 * s} {x + 172 * s},{y + 210 * s} '
          f'C{x + 160 * s},{y + 96 * s} {x + 104 * s},{y + 46 * s} {x + 40 * s},{y + 30 * s}Z" fill="{knit}"/>')
    for k in range(3):
        xx = x - 100 * s + k * 90 * s
        f.add(f'<path d="M{xx},{y + 140 * s} C{xx + 10 * s},{y + 320 * s} {xx - 6 * s},{y + 520 * s} {xx + 4 * s},{y + 740 * s}" '
              f'stroke="{g(L - 5)}" stroke-width="{6 * s}" fill="none" opacity="0.5"/>')
    f.add(f'<path d="M{x - 42 * s},{y + 24 * s} C{x - 10 * s},{y + 46 * s} {x + 32 * s},{y + 46 * s} {x + 50 * s},{y + 24 * s}" '
          f'stroke="{g(L + 6)}" stroke-width="{18 * s}" fill="none" stroke-linecap="round"/>')
    # the neck (slim, upright)
    f.add(f'<path d="M{x - 20 * s},{y + 30 * s} L{x - 16 * s},{y - 30 * s} L{x + 28 * s},{y - 34 * s} L{x + 34 * s},{y + 26 * s}Z" fill="{skin}"/>')
    # the head, turned to the glass: almost all hair from here; the jaw's edge, the cheek and an ear catch the light
    f.add(f'<ellipse cx="{x + 6 * s}" cy="{y - 88 * s}" rx="{56 * s}" ry="{62 * s}" fill="{hair}"/>')
    f.add(f'<path d="M{x + 40 * s},{y - 130 * s} C{x + 62 * s},{y - 100 * s} {x + 62 * s},{y - 58 * s} {x + 36 * s},{y - 30 * s} '
          f'C{x + 30 * s},{y - 50 * s} {x + 44 * s},{y - 80 * s} {x + 36 * s},{y - 120 * s}Z" fill="{skin}"/>')
    f.add(f'<ellipse cx="{x + 30 * s}" cy="{y - 84 * s}" rx="{9 * s}" ry="{15 * s}" fill="{g(L + 30)}"/>')
    # the twist on top and the claw clip, a few loose strands at the nape
    f.add(f'<path d="M{x - 30 * s},{y - 132 * s} C{x - 40 * s},{y - 186 * s} {x + 30 * s},{y - 196 * s} {x + 40 * s},{y - 150 * s} '
          f'C{x + 30 * s},{y - 128 * s} {x - 10 * s},{y - 120 * s} {x - 30 * s},{y - 132 * s}Z" fill="{hair}"/>')
    f.add(f'<path d="M{x - 24 * s},{y - 168 * s} C{x},{y - 182 * s} {x + 22 * s},{y - 180 * s} {x + 36 * s},{y - 166 * s}" '
          f'stroke="{g(L + 28)}" stroke-width="{10 * s}" fill="none" stroke-linecap="round"/>')
    for k in range(3):
        f.add(f'<path d="M{x - 26 * s + k * 10 * s},{y - 46 * s} C{x - 36 * s + k * 10 * s},{y - 16 * s} {x - 28 * s + k * 9 * s},{y} '
              f'{x - 34 * s + k * 12 * s},{y + 18 * s}" stroke="{hair}" stroke-width="{3.5 * s}" fill="none"/>')
    f.add(f'<path d="M{x + 36 * s},{y - 148 * s} C{x + 52 * s},{y - 126 * s} {x + 56 * s},{y - 110 * s} {x + 50 * s},{y - 96 * s}" '
          f'stroke="{HONEY}" stroke-width="{4 * s}" fill="none" opacity="0.6" filter="url(#soft1)"/>')
    # her right arm: the sleeve bent up, the hand round the mug against the glass
    f.add(f'<path d="M{x + 140 * s},{y + 160 * s} C{x + 200 * s},{y + 230 * s} {x + 250 * s},{y + 240 * s} {x + 292 * s},{y + 186 * s} '
          f'L{x + 324 * s},{y + 212 * s} C{x + 286 * s},{y + 296 * s} {x + 214 * s},{y + 324 * s} {x + 132 * s},{y + 286 * s}Z" fill="{knit}"/>')
    mx, my = x + 296 * s, y + 92 * s
    f.add(f'<path d="M{mx - 14 * s},{my + 40 * s} C{mx + 4 * s},{my + 34 * s} {mx + 16 * s},{my + 54 * s} {mx + 14 * s},{my + 80 * s} '
          f'L{mx - 26 * s},{my + 110 * s} L{mx - 38 * s},{my + 72 * s}Z" fill="{skin}"/>')
    f.add(f'<rect x="{mx}" y="{my}" width="{62 * s}" height="{74 * s}" rx="{9 * s}" fill="{g(76)}"/>')
    f.add(f'<path d="M{mx + 62 * s},{my + 16 * s} q{24 * s},{2 * s} {22 * s},{24 * s} q{-2 * s},{18 * s} {-22 * s},{18 * s}" stroke="{g(76)}" stroke-width="{8 * s}" fill="none"/>')
    f.add(f'<ellipse cx="{mx + 31 * s}" cy="{my + 6 * s}" rx="{28 * s}" ry="{8 * s}" fill="{AMBER}"/>')
    curl(f, mx + 30 * s, my - 4 * s, h=120 * s, L=92, op=0.95, warm=True, sw=6 * s)
    curl(f, mx + 42 * s, my - 2 * s, h=90 * s, L=92, op=0.6, warm=False, sw=4 * s)
    if rim:
        f.add(f'<path d="M{x + 104 * s},{y + 50 * s} C{x + 160 * s},{y + 96 * s} {x + 176 * s},{y + 240 * s} {x + 172 * s},{y + 700 * s}" '
              f'stroke="{HONEY}" stroke-width="{6 * s}" fill="none" opacity="0.5" filter="url(#soft1)"/>')


@frame('B5')
def b5():
    f = Frame(505)
    # her room: dark and warm, a lamp off to the right
    f.rect(0, 0, W, H, g(15))
    f.add(f'<rect x="{W - 300}" y="300" width="600" height="1500" fill="{HONEY}" opacity="0.12" filter="url(#soft4)"/>')
    # the window: a deep reveal and a double casement
    ox0, oy0, ox1, oy1 = 190, 660, 900, 1400
    f.rect(ox0 - 40, oy0 - 40, ox1 - ox0 + 80, oy1 - oy0 + 80, g(24))
    f.poly([(ox0 - 40, oy0 - 40), (ox0, oy0), (ox0, oy1), (ox0 - 40, oy1 + 40)], g(28))
    f.poly([(ox1 + 40, oy0 - 40), (ox1, oy0), (ox1, oy1), (ox1 + 40, oy1 + 40)], g(34))
    f.add(f'<rect x="{ox1}" y="{oy0}" width="40" height="{oy1 - oy0}" fill="{HONEY}" opacity="0.15"/>')
    # outside: the night, the kettle block across the street boiling away, its cloud, the street's snow
    outside = f.lingrad([(0, g(18), 1), (0.6, g(24), 1), (1, g(30), 1)])
    f.rect(ox0, oy0, ox1 - ox0, oy1 - oy0, outside)
    cid = f.uid('clip')
    f.defs.append(f'<clipPath id="{cid}"><rect x="{ox0}" y="{oy0}" width="{ox1 - ox0}" height="{oy1 - oy0}"/></clipPath>')
    f.add(f'<g clip-path="url(#{cid})">')
    kettle_block(f, 420, 900, 930, 1320, seed=46)
    block(f, 150, 420, 1060, 1320, 4, 3, L=19, states=lambda r_, c: 'frost', chimneys=1, frost_L=54, seed=47)
    f.rect(ox0, 1320, ox1 - ox0, 90, g(38))
    snowfall(f, 50, region=(ox0, oy0, ox1, oy1), sizes=(1.5, 3.5), seed=52, skip_band=False)
    f.add('</g>')
    # the casements' frames and a little frost in their corners
    for xx in (ox0, (ox0 + ox1) / 2 - 8, ox1 - 16):
        f.rect(xx, oy0, 16, oy1 - oy0, g(30))
    f.rect(ox0, oy0, ox1 - ox0, 16, g(30))
    f.rect(ox0, oy0 + (oy1 - oy0) * 0.26, ox1 - ox0, 14, g(30))
    for (cx, cy, a) in [(ox0 + 16, oy1, -0.9), (ox1 - 16, oy1, -2.3), ((ox0 + ox1) / 2 + 8, oy1, -1.0), ((ox0 + ox1) / 2 - 8, oy1, -2.1)]:
        for k in range(2):
            frost_fern(f, cx, cy, a + (k - 0.5) * 0.4, 80 + 30 * k, depth=3, L=92, op=0.35, sw=1.8, seed=int(cx + cy + k))
    # the sill: a candle, a little plant; the radiator below
    f.rect(ox0 - 60, oy1 + 30, ox1 - ox0 + 120, 36, g(36))
    f.add(f'<path d="M{ox1 - 90},{oy1 + 30} l10,-40 l40,0 l10,40Z" fill="{g(22)}"/>')
    for k in range(5):
        f.add(f'<path d="M{ox1 - 66 + k * 6},{oy1 - 10} q{(k - 2) * 12},-40 {(k - 2) * 20},-58" stroke="{g(26)}" stroke-width="7" fill="none"/>')
    for k in range(14):
        f.rect(ox0 + 20 + k * 46, oy1 + 120, 30, 190, g(26), 'rx="10"')
    # her, at the glass, one small cup of tea against the block of forty boiling kettles
    her_bust(f, 250, 1130, s=1.0, L=22)
    band(f, ["That's a lot", 'of tea.'], seat=540, L=86)
    grain(f)
    return f


# ------------------------------------------------------------------ B6: warmth drifting away over the frosted city
@frame('B6')
def b6():
    f = Frame(606)
    sky(f, [(0, 13), (0.35, 18), (0.65, 27), (0.9, 35), (1, 38)], 0, 1200)
    cloud(f, 760, 140, 820, 220, 21, 0.85, seed=62)
    # the far city on the right: blocks and the hill, its windows FROSTED (the heat is not reaching them)
    rr = random.Random(66)
    x = 400
    while x < W + 20:
        bw = rr.uniform(50, 100)
        top = 1110 - (x - 400) * 0.16 - rr.uniform(20, 70)
        f.poly([(x, 1190), (x, top), (x + bw, top + rr.uniform(-3, 3)), (x + bw, 1190)], g(29 + rr.uniform(-3, 3)), 'filter="url(#rough)"')
        snowcap(f, x - 1, x + bw + 1, top + 2, th=4, L=58)
        for yy in range(int(top + 10), 1180, 13):
            for xx in range(int(x + 6), int(x + bw - 6), 12):
                if rr.random() < 0.55:
                    f.rect(xx, yy, 5, 6, g(56 if rr.random() < 0.85 else 22))
        x += bw - 4
    f.rect(890, 1000, 50, 90, g(30)); f.ellipse(915, 1000, 27, 24, g(32)); f.rect(913, 955, 3, 30, g(32))
    # two other data centers far along the shore: their heat thins away too (the usual way, everywhere)
    for bx, bw2 in ((560, 60), (700, 44)):
        f.rect(bx, 1166, bw2, 22, g(20))
        plume(f, [(bx + bw2 / 2, 1150), (bx + bw2 / 2 + 20, 1100), (bx + bw2 / 2 + 60, 1060)], [20, 30, 40], L=56, op=0.5, filt='steam2', seed=bx)
    # the blank building (left) and its three big roof fans
    f.poly([(-10, 1210), (-10, 1080), (330, 1074), (346, 1088), (346, 1210)], g(12), 'filter="url(#rough2)"')
    snowcap(f, -10, 330, 1078, th=5, L=44)
    for k in range(15):
        f.rect(10 + k * 22, 1188, 4, 3, g(90))
    for k in range(3):
        fx = 64 + k * 100
        f.rect(fx - 40, 1036, 80, 42, g(17), 'rx="6"')
        f.ellipse(fx, 1036, 40, 12, g(8))
        f.add(f'<path d="M{fx - 32},1036 L{fx + 32},1036 M{fx - 16},1028 L{fx + 16},1044" stroke="{g(28)}" stroke-width="3"/>')
        f.ellipse(fx, 1030, 46, 18, HONEY, 'opacity="0.5" filter="url(#soft2)"')
    # THE PLUME: three warm columns off the fans, rising together, then bending away over the frozen bay and the
    # frosted city, greying and thinning into the night
    for k in range(3):
        fx = 64 + k * 100
        plume(f, [(fx, 1000), (fx + 6, 940), (fx + 16, 880)], [60, 74, 90], L=86, op=0.9, seed=80 + k, warm_root=0.55)
    plume(f, [(180, 840), (260, 780), (380, 730), (530, 700), (700, 690), (870, 700), (1040, 720)],
          [170, 200, 220, 220, 200, 180, 160], L=74, op=0.8, seed=67)
    plume(f, [(760, 680), (940, 690), (1120, 720)], [150, 150, 140], L=50, op=0.55, seed=68)
    f.add(f'<path d="M100,1010 C140,920 190,860 300,790" stroke="{HONEY}" stroke-width="70" opacity="0.2" fill="none" filter="url(#soft4)"/>')
    # the frozen bay: a vast field, a far channel steaming, pressure ridges, the lone ice fisher
    ice = f.lingrad([(0, g(44), 1), (0.4, g(37), 1), (1, g(20), 1)])
    f.rect(0, 1200, W, 720, ice)
    f.add(f'<path d="M-10,1236 C300,1226 600,1244 1090,1230 L1090,1252 C700,1262 400,1250 -10,1260Z" fill="{g(15)}"/>')
    plume(f, [(200, 1226), (520, 1222), (860, 1226)], [70, 80, 70], L=62, op=0.35, filt='steam2', seed=69)
    for k in range(9):
        yy = 1310 + k * 66
        f.add(f'<path d="M{rr.uniform(-60, 200):.0f},{yy} Q540,{yy - 12 + rr.uniform(-8, 8):.0f} {rr.uniform(880, 1140):.0f},{yy + rr.uniform(-8, 8):.0f}" '
              f'stroke="{g(rr.choice([28, 46, 52]))}" stroke-width="{rr.uniform(3, 12):.0f}" fill="none" opacity="0.5" filter="url(#soft1)"/>')
    for k in range(12):
        f.ellipse(1000 - k * 34 + rr.uniform(-4, 4), 1860 - k * 30 + (6 if k % 2 else -6), 7, 3.5, g(15), 'opacity="0.7"')
    f.ellipse(556, 1532, 26, 7, g(8))
    f.add(f'<path d="M598,1446 L562,1528" stroke="{g(10)}" stroke-width="2"/>')
    person(f, 620, 1540, 150, L=7, pose='sit', facing=-1, rim=-1)
    f.rect(652, 1512, 10, 28, g(9))
    breath(f, 604, 1396, s=0.8, op=0.45)
    snowfall(f, 110, sizes=(1.5, 4), seed=63)
    band(f, ['big fans to blow', 'that heat outside.'], seat=540)
    grain(f)
    return f


# ------------------------------------------------------------------ B7: the city throws its windows open
def lean_out(f, x, y_sill, h, kind='up', L=10, facing=-1):
    """a neighbour leaning out over the sill into the night: torso over the sill, head tilted up, arm(s) raised;
    h = the head-to-sill height of what shows"""
    s = facing
    c = g(L)
    hd = h * 0.22
    # torso leaning out over the sill
    f.add(f'<path d="M{x - h * 0.22},{y_sill} C{x - h * 0.24},{y_sill - h * 0.4} {x - h * 0.1 * -s},{y_sill - h * 0.62} {x + h * 0.02 * s},{y_sill - h * 0.66} '
          f'C{x + h * 0.2},{y_sill - h * 0.62} {x + h * 0.26},{y_sill - h * 0.36} {x + h * 0.24},{y_sill}Z" fill="{c}"/>')
    # head, tilted up toward the drift
    hx, hy = x + h * 0.04 * s, y_sill - h * 0.78
    f.add(f'<ellipse cx="{hx}" cy="{hy}" rx="{hd * 0.5}" ry="{hd * 0.6}" fill="{c}" transform="rotate({-18 * s} {hx} {hy})"/>')
    f.add(f'<path d="M{hx - hd * 0.55},{hy - hd * 0.1} Q{hx},{hy - hd * 0.9} {hx + hd * 0.55},{hy - hd * 0.2} L{hx + hd * 0.5},{hy + hd * 0.5} '
          f'Q{hx},{hy + hd * 0.2} {hx - hd * 0.5},{hy + hd * 0.6}Z" fill="{c}"/>')
    if kind in ('up', 'both'):
        f.add(f'<path d="M{x + h * 0.14},{y_sill - h * 0.56} L{x + h * 0.38},{y_sill - h * 1.18} L{x + h * 0.48},{y_sill - h * 1.14} '
              f'L{x + h * 0.26},{y_sill - h * 0.5}Z" fill="{c}"/>')
        f.add(f'<circle cx="{x + h * 0.44}" cy="{y_sill - h * 1.2}" r="{h * 0.06}" fill="{c}"/>')
    if kind == 'both':
        f.add(f'<path d="M{x - h * 0.14},{y_sill - h * 0.56} L{x - h * 0.34},{y_sill - h * 1.14} L{x - h * 0.44},{y_sill - h * 1.1} '
              f'L{x - h * 0.24},{y_sill - h * 0.5}Z" fill="{c}"/>')
        f.add(f'<circle cx="{x - h * 0.4}" cy="{y_sill - h * 1.16}" r="{h * 0.06}" fill="{c}"/>')
    if kind == 'cup':
        f.add(f'<path d="M{x + h * 0.14},{y_sill - h * 0.5} L{x + h * 0.42},{y_sill - h * 0.62} L{x + h * 0.44},{y_sill - h * 0.52} L{x + h * 0.2},{y_sill - h * 0.4}Z" fill="{c}"/>')
        f.add(f'<rect x="{x + h * 0.4}" y="{y_sill - h * 0.74}" width="{h * 0.12}" height="{h * 0.13}" rx="2" fill="{g(70)}"/>')
        curl(f, x + h * 0.46, y_sill - h * 0.76, h=h * 0.3, L=90, op=0.8, warm=True, sw=max(2, h * 0.02))
    breath(f, hx + hd * 0.6 * s, hy - hd * 0.8, s=max(0.5, h / 140), op=0.55)


@frame('B7')
def b7():
    f = Frame(707)
    sky(f, [(0, 13), (0.4, 19), (0.8, 28), (1, 32)], 0, 1300)
    # the warm drift overhead, its underside lit by the opened windows
    plume(f, [(-20, 700), (200, 714), (420, 704), (640, 716), (860, 734), (1100, 752)], [170, 190, 200, 190, 180, 170], L=76, op=0.85, seed=71)
    f.add(f'<rect x="0" y="770" width="{W}" height="130" fill="{HONEY}" opacity="0.22" filter="url(#soft4)"/>')
    # the waterfront wall, close: three blocks shoulder to shoulder, stepping away up the shore
    quad = [(-40, 760), (1090, 1000), (1090, 1330), (-40, 1800)]
    pieces = [(0.0, 0.42, 0.06, 3, 2, 28), (0.42, 0.72, 0.14, 3, 3, 33), (0.72, 1.0, 0.03, 3, 3, 25)]
    rr = random.Random(78)
    opened = {(0, 0, 0): 'both', (0, 1, 1): 'up', (0, 2, 0): 'cup', (1, 0, 1): 'up', (1, 1, 2): 'both', (1, 2, 0): 'up',
              (2, 0, 2): 'up', (2, 1, 0): 'up', (0, 0, 1): 'up', (2, 2, 1): 'up'}

    def states(k, row, c, u):
        return 'warm' if (k, row, c) in opened else ('frost' if rr.random() < 0.8 else 'warm')

    m, mms = street_wall(f, quad, pieces, frost_L=58, seed=79, states=states)
    # the opened casements and the neighbours leaning out, reaching up into the warm drift
    for (k, row, c), kind in opened.items():
        u0, u1, rise, floors, cols, L = pieces[k]
        mm = mms[k]
        wu0, wu1 = (c + 0.27) / cols, (c + 0.73) / cols
        v0 = 0.06 + (row + 0.2) * 0.86 / floors
        v1 = v0 + 0.5 * 0.86 / floors
        p0, p1, p3 = mm(wu0, v0), mm(wu1, v0), mm(wu0, v1)
        bw, bh = abs(p1[0] - p0[0]), abs(p3[1] - p0[1])
        q = [p0, (p0[0] - bw * 0.42, p0[1] - bh * 0.06), (p3[0] - bw * 0.42, p3[1] + bh * 0.06), p3]
        f.poly(q, g(80), 'opacity="0.9"')
        f.add(f'<polygon points="{" ".join(f"{x:.1f},{y:.1f}" for x, y in q)}" fill="none" stroke="{g(16)}" stroke-width="{max(2, bw * 0.05):.1f}"/>')
        f.add(f'<line x1="{(q[0][0] + q[1][0]) / 2:.1f}" y1="{(q[0][1] + q[1][1]) / 2:.1f}" x2="{(q[3][0] + q[2][0]) / 2:.1f}" '
              f'y2="{(q[3][1] + q[2][1]) / 2:.1f}" stroke="{g(16)}" stroke-width="{max(1.5, bw * 0.03):.1f}"/>')
        f.add(f'<polygon points="{" ".join(f"{x:.1f},{y:.1f}" for x, y in q)}" fill="{HONEY}" opacity="0.2"/>')
        cx = (p0[0] + p1[0]) / 2
        lean_out(f, cx, p3[1] + bh * 0.02, bh * 0.95, kind=kind)
    # the shore road, the quay's rail, a child with both arms up on the near pavement
    road = f.lingrad([(0, g(36), 1), (1, g(14), 1)])
    f.poly([(-10, 1800), (1090, 1330), (1090, H), (-10, H)], road)
    f.add(f'<path d="M-10,1860 L1090,1420" stroke="{g(12)}" stroke-width="6"/>')
    person(f, 830, 1690, 200, L=8, pose='stand', facing=-1, arm_up=True, coat=True, rim=1)
    f.add(f'<path d="M{830 - 200 / 7.8 * 0.5},{1690 - 200 + 32} l-30,-74 l10,-5 l30,70Z" fill="{g(8)}"/>')
    breath(f, 812, 1500, s=0.9)
    snowfall(f, 120, sizes=(2, 5), seed=73)
    band(f, ['But Helsinki', [('wants', True), (' that heat.', False)]], seat=540)
    grain(f)
    return f


# ------------------------------------------------------------------ the frost (B8, B9, B10)
def night_outside(f, x0, y0, x1, y1, seed=81, lights=True, L=(12, 20, 24), n=160):
    """the night seen through the cleared glass: dark, the harbour's far shore with a few lights"""
    f.rect(x0, y0, x1 - x0, y1 - y0, f.lingrad([(0, g(L[0]), 1), (0.7, g(L[1]), 1), (1, g(L[2]), 1)]))
    if lights:
        rr = random.Random(seed)
        for k in range(n):
            x = rr.uniform(x0, x1)
            y = rr.uniform(y0 + (y1 - y0) * 0.45, y1)
            f.rect(x, y, 4, 5, HONEY if rr.random() < 0.55 else g(60), f'opacity="{rr.uniform(0.5, 1):.2f}"')


def frost_pane(f, x0, y0, x1, y1, mask_paths=(), mask_w=26, seed=90, warm_cast=0.0, L=88, ferns=46):
    """a frosted pane over the night; mask_paths are cleared lines (a finger's drawing) through which the night shows"""
    mid = f.uid('m')
    strokes = ''.join(f'<path d="{d}" stroke="black" stroke-width="{w}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'
                      for d, w in mask_paths)
    f.defs.append(f'<filter id="{mid}b"><feGaussianBlur stdDeviation="2.2"/></filter>'
                  f'<mask id="{mid}" maskUnits="userSpaceOnUse" x="0" y="0" width="{W}" height="{H}">'
                  f'<rect x="0" y="0" width="{W}" height="{H}" fill="white"/><g filter="url(#{mid}b)">{strokes}</g></mask>')
    f.add(f'<g mask="url(#{mid})">')
    frost_field(f, x0, y0, x1 - x0, y1 - y0, L=L, op=0.95, density=ferns, seed=seed, base_op=0.97)
    if warm_cast > 0:
        f.add(f'<rect x="{x0}" y="{y0}" width="{x1 - x0}" height="{y1 - y0}" fill="{HONEY}" opacity="{warm_cast}" filter="url(#soft4)"/>')
    f.add('</g>')


def room_window(f, x0, y0, x1, y1):
    """her room around the window: the warm-lit wall (the caption band's calm field), the frame, the sill, the radiator"""
    f.rect(0, 0, W, H, g(18))
    f.add(f'<rect x="-200" y="0" width="{W + 400}" height="700" fill="{HONEY}" opacity="0.08" filter="url(#soft4)"/>')
    f.rect(x0 - 34, y0 - 34, x1 - x0 + 68, y1 - y0 + 68, g(30))
    f.rect(x0 - 12, y0 - 12, x1 - x0 + 24, y1 - y0 + 24, g(22))


def room_sill(f, x0, x1, y1):
    f.rect(x0 - 70, y1 + 30, x1 - x0 + 140, 40, g(40))
    f.rect(x0 + 40, y1 - 14, 24, 46, g(82))
    f.ellipse(x0 + 52, y1 - 24, 8, 13, HONEY)
    f.ellipse(x0 + 52, y1 - 24, 30, 34, HONEY, 'opacity="0.35" filter="url(#glow)"')
    f.add(f'<path d="M{x1 - 120},{y1 + 30} l12,-46 l46,0 l12,46Z" fill="{g(26)}"/>')
    for k in range(5):
        f.add(f'<path d="M{x1 - 92 + k * 7},{y1 - 14} q{(k - 2) * 14},-44 {(k - 2) * 24},-64" stroke="{g(28)}" stroke-width="8" fill="none"/>')
    for k in range(15):
        f.rect(x0 + 10 + k * 52, y1 + 130, 34, 200, g(30), 'rx="12"')


def finger_hand(f, tip, L_sleeve=34, L_skin=56, mirror=False):
    """her hand from the right (or the left, mirrored), the index finger out to the frost at `tip`, a knit sleeve,
    lit by the room's lamp"""
    if mirror:
        f.add(f'<g transform="translate({W},0) scale(-1,1)">')
        finger_hand(f, (W - tip[0], tip[1]), L_sleeve, L_skin, mirror=False)
        f.add('</g>')
        return
    tx, ty = tip
    sk = g(L_skin)
    # the sleeve
    f.add(f'<path d="M1100,{ty + 120} C1020,{ty + 96} 960,{ty + 80} {tx + 200},{ty + 66} L{tx + 214},{ty + 168} C{tx + 300},{ty + 200} 1040,{ty + 250} 1100,{ty + 280}Z" fill="{g(L_sleeve)}"/>')
    for k in range(4):
        x = tx + 205 + k * 9
        f.add(f'<path d="M{x},{ty + 66 + k * 2} L{x + 10},{ty + 170 + k * 3}" stroke="{g(L_sleeve - 8)}" stroke-width="4"/>')
    # the back of the hand, the curled fingers under it, the thumb
    f.add(f'<path d="M{tx + 205},{ty + 70} C{tx + 160},{ty + 50} {tx + 110},{ty + 30} {tx + 70},{ty + 22} '
          f'C{tx + 40},{ty + 16} {tx + 14},{ty + 6} {tx + 2},{ty + 4} C{tx - 8},{ty + 2} {tx - 10},{ty + 16} {tx + 2},{ty + 20} '
          f'C{tx + 30},{ty + 30} {tx + 60},{ty + 40} {tx + 86},{ty + 52} C{tx + 80},{ty + 70} {tx + 84},{ty + 96} {tx + 100},{ty + 110} '
          f'C{tx + 130},{ty + 136} {tx + 170},{ty + 150} {tx + 214},{ty + 166}Z" fill="{sk}"/>')
    for k in range(3):
        f.add(f'<path d="M{tx + 92 + k * 16},{ty + 60 + k * 10} c-10,14 -6,34 10,42" stroke="{g(L_skin - 12)}" stroke-width="5" fill="none"/>')
    f.add(f'<path d="M{tx + 120},{ty + 40} C{tx + 110},{ty + 20} {tx + 90},{ty + 10} {tx + 70},{ty + 12}" stroke="{g(L_skin + 10)}" stroke-width="6" fill="none" opacity="0.7"/>')
    f.add(f'<path d="M{tx + 210},{ty + 72} C{tx + 150},{ty + 54} {tx + 80},{ty + 26} {tx + 4},{ty + 6}" stroke="{HONEY}" stroke-width="4" fill="none" opacity="0.55" filter="url(#soft1)"/>')


@frame('B8')
def b8():
    f = Frame(808)
    x0, y0, x1, y1 = 120, 650, 960, 1500
    room_window(f, x0, y0, x1, y1)
    night_outside(f, x0, y0, x1, y1)
    for k in range(8):
        f.rect(230 + k * 22, 1335, 4, 3, g(88))
    # her drawing in the frost: the new data center (a box, a door, two fans), the line along the shore and up to her
    # window, and the year
    box = 'M222,1196 L410,1196 L410,1318 L222,1318 Z'
    door = 'M296,1318 L296,1258 L338,1258 L338,1318'
    fans = 'M262,1196 m-16,0 a16,10 0 1,0 32,0 a16,10 0 1,0 -32,0 M364,1196 m-16,0 a16,10 0 1,0 32,0 a16,10 0 1,0 -32,0'
    run = 'M410,1290 C520,1300 600,1270 660,1220 C720,1170 760,1110 790,1040'
    home = 'M754,966 L830,966 L830,1040 L754,1040 Z M792,966 L792,1040 M754,1000 L830,1000'
    year = ('M330,742 C352,716 402,716 404,750 C406,780 352,806 330,846 L410,846 '
            'M470,744 C440,744 432,792 434,800 C436,840 462,850 476,850 C500,850 512,820 512,796 C512,764 498,744 470,744 Z '
            'M548,742 C570,716 620,716 622,750 C624,780 570,806 548,846 L628,846 '
            'M664,740 L740,740 L690,850')
    paths = [(box, 16), (door, 14), (fans, 10), (run, 18), (home, 14), (year, 22)]
    frost_pane(f, x0, y0, x1, y1, mask_paths=paths, seed=91, warm_cast=0.12)
    f.rect(x0 - 12, y0 - 12, x1 - x0 + 24, 14, g(26))
    room_sill(f, x0, x1, y1)
    finger_hand(f, (688, 852))
    band(f, ['starting', 'next year.'], seat=540, L=86)
    grain(f, 0.07)
    return f


@frame('B9')
def b9():
    f = Frame(909)
    # pushed in on her drawing: the frost fills the frame; the drawn box's door swings open on a cool glow
    night_outside(f, 0, 0, W, H, seed=92, L=(20, 28, 32), n=900)
    box = 'M150,780 L930,780 L930,1430 L150,1430 Z'
    fans = ('M330,780 m-70,0 a70,30 0 1,0 140,0 a70,30 0 1,0 -140,0 M750,780 m-70,0 a70,30 0 1,0 140,0 a70,30 0 1,0 -140,0 '
            'M280,768 L380,792 M700,768 L800,792')
    run = 'M930,1300 C1000,1300 1060,1290 1120,1270'
    door = 'M440,1430 L440,1080 L640,1080 L640,1430'
    mid = 'M450,1090 L630,1090 L630,1425 L450,1425 Z'
    frost_pane(f, 0, 0, W, H, mask_paths=[(box, 40), (fans, 24), (run, 46), (door, 36), (mid, 30)], seed=93, warm_cast=0.0, ferns=90)
    # the room's warm light on the frost from below (the candle on the sill), the cold from above
    f.add(f'<rect x="-100" y="1500" width="{W + 200}" height="600" fill="{HONEY}" opacity="0.16" filter="url(#soft4)"/>')
    # the doorway: dark, deep, a cool light inside; the dark shapes of tall machines; the cool water waiting in its pipe
    glow = f.radgrad([(0, g(56), 1), (0.6, g(26), 1), (1, g(10), 1)], cx=0.5, cy=0.75, r=0.8)
    f.add(f'<path d="{mid}" fill="{glow}"/>')
    for k, (xx, hh) in enumerate([(470, 250), (520, 210), (566, 180), (600, 160)]):
        f.rect(xx, 1400 - hh, 26 - k * 3, hh, g(10))
        for j in range(5):
            f.rect(xx + 6, 1400 - hh + 20 + j * hh / 6, 4, 3, g(80))
    f.add(f'<path d="M455,1388 L625,1388" stroke="{g(86)}" stroke-width="10" opacity="0.9"/>')
    f.add(f'<path d="M455,1388 L625,1388" stroke="{g(86)}" stroke-width="34" opacity="0.2" filter="url(#soft2)"/>')
    # the door, a sheet of frost swung open toward us on its left hinge, its edge catching the light
    f.add(f'<polygon points="440,1080 296,1036 296,1476 440,1430" fill="{g(90)}" opacity="0.97"/>')
    for k in range(6):
        frost_fern(f, 298, 1060 + k * 70, -0.2, 110, depth=2, L=99, op=0.5, sw=2, seed=900 + k)
    f.add(f'<path d="M296,1036 L296,1476" stroke="{g(99)}" stroke-width="6"/>')
    f.add(f'<polygon points="440,1080 296,1036 296,1476 440,1430" fill="{HONEY}" opacity="0.06"/>')
    # light from the doorway spilling out over the frost in front of it
    f.add(f'<path d="M450,1426 L630,1426 L760,1560 L330,1560Z" fill="{g(80)}" opacity="0.35" filter="url(#soft3)"/>')
    # her fingertip at the frost door's edge: she has just swung it open
    finger_hand(f, (300, 1268), mirror=True)
    band(f, ['So how would', 'that work?'], seat=540, L=86)
    grain(f, 0.07)
    return f


@frame('B10')
def b10():
    f = Frame(1010)
    # inside her frost drawing: the planned hall in frost lines on the dark; only the water is painted, cool where it
    # comes in (far), honey where it leaves (near)
    night_outside(f, 0, 0, W, H, seed=94, lights=False)
    for (cx, cy, a) in [(0, 980, 0.15), (0, 1500, -0.15), (W, 760, math.pi), (200, H, -1.3), (W, 1880, math.pi + 0.5)]:
        for k in range(2):
            frost_fern(f, cx, cy, a + (k - 0.5) * 0.3, 220 + 40 * k, depth=3, L=92, op=0.28, sw=2.0, seed=int(cx * 7 + cy + k))
    # the hall: floor and ceiling edges running to the far end at the left, the far wall
    ice_line(f, 'M0,1560 L330,1110 M330,1110 L330,930 M330,930 L0,700', w=3.5, op=0.75)
    ice_line(f, 'M330,1110 L372,1110 M330,930 L372,930', w=3, op=0.6)
    ice_line(f, 'M1080,1720 L372,1110', w=3, op=0.5)
    # the row of giant computers on the right, receding to the far end
    quad = [(372, 930), (1010, 640), (1010, 1690), (372, 1110)]
    m = homography(quad)
    n = 5
    for i in range(n):
        u0, u1 = i / n + 0.025, (i + 1) / n - 0.025
        t = (u0 + u1) / 2
        pts = [m(u0, 0.0), m(u1, 0.0), m(u1, 1.0), m(u0, 1.0)]
        d = 'M' + ' L'.join(f'{x:.0f},{y:.0f}' for x, y in pts) + ' Z'
        ice_line(f, d, w=max(2.0, 5.5 * t), op=0.95)
        for j in range(7):
            v = 0.1 + 0.12 * j
            a, b = m(u0 + 0.02, v), m(u1 - 0.02, v)
            ice_line(f, f'M{a[0]:.0f},{a[1]:.0f} L{b[0]:.0f},{b[1]:.0f}', w=max(1.2, 3 * t), op=0.5)
        c = m(t, 0.5)
        wd = abs(m(u1, 0.5)[0] - m(u0, 0.5)[0])
        hh = abs(m(u0, 1.0)[1] - m(u0, 0.0)[1])
        f.add(f'<ellipse cx="{c[0]:.0f}" cy="{c[1]:.0f}" rx="{wd * 0.42:.0f}" ry="{hh * 0.36:.0f}" fill="{HONEY}" opacity="0.2" filter="url(#glow2)"/>')
    # a tiny frost-line person at the far end, for the scale of a big new hall
    ice_line(f, 'M352,1108 L352,1082 M352,1082 m-6,-9 a6,7 0 1,0 12,0 a6,7 0 1,0 -12,0 M345,1112 L352,1094 L359,1112 M343,1090 L361,1090', w=2.2)
    # THE WATER: one loop. It comes in COOL along the left (big and pale near us), runs to the far end, turns, and
    # comes back along the machines' feet taking their heat, leaving HONEY toward us on the right
    cool_leg = [(-30, 1700), (120, 1500), (250, 1330), (336, 1214), (360, 1180)]
    for k in range(len(cool_leg) - 1):
        (xa, ya), (xb, yb) = cool_leg[k], cool_leg[k + 1]
        wa = 40 - 8 * k
        f.add(f'<line x1="{xa}" y1="{ya}" x2="{xb}" y2="{yb}" stroke="{g(92)}" stroke-width="{wa}" stroke-linecap="round"/>')
        f.add(f'<line x1="{xa}" y1="{ya}" x2="{xb}" y2="{yb}" stroke="{g(92)}" stroke-width="{wa * 2.2:.0f}" opacity="0.15" stroke-linecap="round" filter="url(#soft2)"/>')
    a = m(0.0, 1.06)
    f.add(f'<path d="M360,1180 C366,1170 {a[0] - 4:.0f},{a[1] + 6:.0f} {a[0]:.0f},{a[1]:.0f}" stroke="{g(92)}" stroke-width="8" fill="none"/>')
    path = [m(0.0, 1.06), m(0.2, 1.06), m(0.4, 1.06), m(0.6, 1.06), m(0.8, 1.06), m(1.0, 1.06), (1120, 1880)]
    cols = [g(92), warm(88, 14, 80), warm(86, 26, 80), warm(85, 36, 80), HONEY, HONEY]
    for k in range(len(path) - 1):
        (xa, ya), (xb, yb) = path[k], path[k + 1]
        wa = 8 + 34 * (k / (len(path) - 1))
        col = cols[min(k, len(cols) - 1)]
        f.add(f'<line x1="{xa:.0f}" y1="{ya:.0f}" x2="{xb:.0f}" y2="{yb:.0f}" stroke="{col}" stroke-width="{wa:.0f}" stroke-linecap="round"/>')
        f.add(f'<line x1="{xa:.0f}" y1="{ya:.0f}" x2="{xb:.0f}" y2="{yb:.0f}" stroke="{col}" stroke-width="{wa * 2.4:.0f}" opacity="0.2" stroke-linecap="round" filter="url(#soft2)"/>')
    for i in range(n):
        t = (i + 0.5) / n
        a, b = m(t, 0.86), m(t, 1.05)
        f.add(f'<line x1="{a[0]:.0f}" y1="{a[1]:.0f}" x2="{b[0]:.0f}" y2="{b[1]:.0f}" stroke="{HONEY}" stroke-width="{4 + 12 * t:.0f}" opacity="0.85"/>')
    band(f, ['with water', 'in pipes.'], seat=540, L=86)
    grain(f, 0.07)
    return f


# ------------------------------------------------------------------ B11: home by home, up the street
@frame('B11')
def b11():
    f = Frame(1111)
    sky(f, [(0, 13), (0.5, 20), (1, 32)], 0, 1200)
    cloud(f, 540, 160, 900, 200, 21, 0.85, seed=111)
    # her block closes the street's vista: its windows still frosted, hers just starting to clear
    block(f, 430, 710, 850, 1185, 6, 4, L=24, states=lambda r_, c: 'frost', chimneys=2, frost_L=58, seed=112, tower=(470, 60, 110))
    f.rect(546, 1074, 34, 52, g(10))
    win_shape(f, 546, 1074, 34, 52, 'half', frost_L=60)

    def st(k, row, c, u):
        if u < 0.42:
            return 'warm'
        if u < 0.66:
            return 'half'
        return 'frost'

    # the two sides of the street, block after block, the warm climbing toward her block
    street_wall(f, [(-60, 600), (435, 922), (435, 1188), (-60, 1680)],
                [(0.0, 0.34, 0.05, 6, 3, 27), (0.34, 0.6, 0.12, 6, 3, 31), (0.6, 0.82, 0.0, 5, 3, 25), (0.82, 1.0, 0.08, 6, 2, 29)],
                frost_L=58, seed=113, states=st)
    street_wall(f, [(1140, 640), (705, 932), (705, 1188), (1140, 1650)],
                [(0.0, 0.3, 0.02, 6, 3, 22), (0.3, 0.58, 0.14, 6, 3, 26), (0.58, 0.8, 0.05, 6, 3, 21), (0.8, 1.0, 0.1, 6, 2, 25)],
                frost_L=58, seed=114, states=st)
    # the street's snow
    street = f.lingrad([(0, g(50), 1), (0.4, g(42), 1), (1, g(22), 1)])
    f.poly([(-60, 1680), (435, 1188), (705, 1188), (1140, 1650), (1140, H), (-60, H)], street)
    # tram rails up the middle, a tram going away up the street, its wire
    for dx in (-30, 30):
        f.add(f'<path d="M{640 + dx * 3},{H} L{590 + dx * 0.35},1200" stroke="{g(30)}" stroke-width="5"/>')
    f.add(f'<path d="M560,1300 L660,1300 L668,1236 L640,1220 L572,1220 L556,1240Z" fill="{g(34)}"/>')
    for k in range(4):
        f.rect(566 + k * 22, 1230, 16, 22, g(70))
    f.add(f'<path d="M612,1220 L626,1196 L640,1220 M626,1196 L626,1180" stroke="{g(20)}" stroke-width="3" fill="none"/>')
    f.add(f'<line x1="626" y1="1180" x2="560" y2="1640" stroke="{g(22)}" stroke-width="2" opacity="0.6"/>')
    # THE PIPES UNDER THE STREET: a soft painted cut along the near-left kerb shows them, the warm one honey; past it the
    # warm water shows as a melt line along the kerb to every door it passes, and up to her door
    f.add(f'<path d="M-40,1560 C40,1540 120,1500 190,1450 C240,1420 300,1380 330,1360 C340,1380 330,1420 300,1450 '
          f'C230,1530 130,1640 40,1720 C10,1740 -30,1760 -40,1760Z" fill="{g(10)}" filter="url(#rough)"/>')
    f.add(f'<path d="M-40,1560 C40,1540 120,1500 190,1450 C240,1420 300,1380 330,1360" stroke="{g(72)}" stroke-width="14" fill="none" filter="url(#rough)"/>')
    f.add(f'<path d="M-40,1640 C60,1600 180,1520 316,1400" stroke="{HONEY}" stroke-width="30" fill="none" stroke-linecap="round"/>')
    f.add(f'<path d="M-40,1640 C60,1600 180,1520 316,1400" stroke="{HONEY}" stroke-width="80" fill="none" opacity="0.2" filter="url(#soft3)"/>')
    f.add(f'<path d="M-40,1700 C70,1660 190,1580 300,1450" stroke="{g(46)}" stroke-width="24" fill="none" stroke-linecap="round"/>')
    melt = 'M316,1400 C360,1350 400,1290 430,1240 C470,1210 520,1196 560,1190'
    f.add(f'<path d="{melt}" stroke="{g(20)}" stroke-width="26" fill="none" filter="url(#rough)"/>')
    f.add(f'<path d="{melt}" stroke="{HONEY}" stroke-width="7" fill="none" opacity="0.85" filter="url(#soft1)"/>')
    for (xa, ya, xb, yb) in [(380, 1330, 300, 1300), (420, 1262, 380, 1250), (452, 1222, 700, 1236), (400, 1300, 860, 1420)]:
        f.add(f'<path d="M{xa},{ya} L{xb},{yb}" stroke="{g(24)}" stroke-width="12" filter="url(#rough)"/>')
        f.add(f'<path d="M{xa},{ya} L{xb},{yb}" stroke="{HONEY}" stroke-width="4" opacity="0.7"/>')
    # people on the pavements, falling snow
    person(f, 880, 1540, 172, L=8, pose='walk', facing=-1, rim=1)
    person(f, 930, 1548, 180, L=11, pose='walk', facing=-1, scarf=True)
    person(f, 360, 1470, 118, L=10, pose='walk', facing=1, rim=-1)
    f.add(f'<path d="M382,1470 l4,-18 l24,-3 l8,-9 l6,4 l-3,9 l-4,17 l-5,0 l0,-10 l-20,2 l-3,8Z" fill="{g(10)}"/>')
    snowfall(f, 140, sizes=(2, 5), seed=115)
    band(f, ['into', "people's homes."], seat=540)
    grain(f)
    return f


# ------------------------------------------------------------------ B12: your chat, her window
@frame('B12')
def b12():
    f = Frame(1212)
    home_view(f, wave=1.0, all_warm=True, her_step=True, her_inside=True, resident=False, pulse=True)
    # the source stays true: the plan's new building, still drawn in frost lines at the harbour's edge ("could soon"),
    # the warm run leaving it for her window
    ice_line(f, 'M188,1236 L188,1150 L330,1144 L330,1236 M188,1150 L230,1124 L372,1118 L330,1144 M372,1118 L372,1210 L330,1236', w=4)
    ice_line(f, 'M236,1236 L236,1196 L262,1196 L262,1236', w=3)
    f.ellipse(300, BY + 8, 60, 20, HONEY, 'opacity="0.5" filter="url(#soft3)"')
    hand_phone(f, 300, 1250, s=0.92)
    band(f, ['could soon heat', [('an ', False), ('apartment', True)]], seat=540)
    grain(f)
    return f


# ------------------------------------------------------------------ the alternates
@frame('B4alt')
def b4alt():
    """the seesaw in the snowy courtyard park: one computer balances forty kettles"""
    f = Frame(4041)
    sky(f, [(0, 14), (0.5, 21), (1, 32)], 0, 1300)
    cloud(f, 760, 150, 820, 220, 22, 0.9, seed=401)
    # the courtyard held by blocks on three sides (frosted panes, a few warm)
    rr = random.Random(402)
    block(f, -40, 300, 760, 1300, 6, 4, L=24, states=lambda r_, c: 'warm' if rr.random() < 0.2 else 'frost', chimneys=2, frost_L=56, seed=403)
    block(f, 300, 780, 860, 1300, 5, 6, L=28, states=lambda r_, c: 'warm' if rr.random() < 0.15 else 'frost', chimneys=3, frost_L=56, seed=404)
    block(f, 780, 1120, 790, 1300, 6, 4, L=22, states=lambda r_, c: 'warm' if rr.random() < 0.2 else 'frost', chimneys=2, frost_L=56, seed=405)
    # the courtyard's snow, a slide and a bench under snow
    yard = f.lingrad([(0, g(52), 1), (0.5, g(40), 1), (1, g(20), 1)])
    f.rect(0, 1300, W, 620, yard)
    f.add(f'<path d="M820,1330 L880,1250 L900,1250 L960,1340" stroke="{g(18)}" stroke-width="8" fill="none"/>')
    f.rect(120, 1330, 140, 14, g(20)); snowcap(f, 118, 262, 1332, th=6, L=74)
    # the seesaw, level: the computer on the left, forty kettles stacked on the right, the same steam off both
    f.poly([(510, 1520), (570, 1520), (556, 1440), (524, 1440)], g(14))
    f.add(f'<path d="M110,1442 L970,1438" stroke="{g(12)}" stroke-width="22" stroke-linecap="round"/>')
    snowcap(f, 110, 970, 1430, th=6, L=72)
    computer_cabinet(f, 140, 900, 200, 1428, L=11, seed=6, steam=False)
    plume(f, [(240, 880), (250, 800), (270, 720), (300, 660)], [110, 150, 190, 210], L=86, op=0.85, seed=406, warm_root=0.45)
    rows = [9, 8, 7, 6, 5, 4, 1]
    ks = 1.35
    for i, n in enumerate(rows):
        y = 1428 - i * 40 * ks * 0.78
        for j in range(n):
            x = 820 - (n - 1) * 25 * ks / 2 * 1.0 + j * 25 * ks
            kettle(f, x, y, s=ks * 0.62, L=14, steam=False)
    plume(f, [(820, 1080), (830, 980), (850, 880), (880, 780), (910, 680)], [150, 170, 190, 210, 220], L=86, op=0.85, seed=407, warm_root=0.45)
    for k in range(40):
        f.circle(700 + (k % 9) * 31 + rr.uniform(-4, 4), 1420 - (k // 9) * 32 + rr.uniform(-4, 4), 2.5, HONEY, 'opacity="0.8"')
    # a child with a sled stops to look
    person(f, 1000, 1640, 150, L=9, pose='stand', facing=-1, rim=1)
    f.add(f'<path d="M930,1640 L1060,1640 Q1072,1640 1070,1628" stroke="{g(12)}" stroke-width="6" fill="none"/>')
    snowfall(f, 120, sizes=(2, 5), seed=408)
    band(f, ['as much heat as', [('forty', True), (' kettles,', False)]], seat=540)
    grain(f)
    return f


@frame('B7alt')
def b7alt():
    """the city reaches out: along the shore road, the city's own warm pipe races toward the blank building, every
    manhole on its way lifting its lid with a warm puff"""
    f = Frame(7071)
    sky(f, [(0, 13), (0.5, 20), (1, 34)], 0, 1220)
    cloud(f, 400, 150, 900, 220, 22, 0.9, seed=701)
    # far left: the blank building at the harbour's edge, its plume still drifting off
    f.poly([(-10, 1180), (-10, 1090), (210, 1086), (222, 1096), (222, 1180)], g(12))
    for k in range(9):
        f.rect(10 + k * 22, 1166, 4, 3, g(88))
    plume(f, [(60, 1060), (120, 990), (220, 930), (360, 900)], [50, 70, 100, 130], L=72, op=0.75, seed=702)
    # the harbour on the left (frozen), the city's blocks on the right shoulder to shoulder
    f.rect(0, 1180, 520, 70, g(42))
    street_wall(f, [(1140, 600), (560, 1060), (560, 1200), (1140, 1640)],
                [(0.0, 0.35, 0.04, 6, 3, 26), (0.35, 0.65, 0.12, 6, 3, 31), (0.65, 1.0, 0.02, 5, 3, 24)], frost_L=58, seed=703,
                states=lambda k, r_, c, u: 'warm' if random.Random(k * 100 + r_ * 10 + c).random() < 0.35 else 'frost')
    # the shore road receding to the left toward the blank building
    road = f.lingrad([(0, g(46), 1), (1, g(22), 1)])
    f.poly([(-10, 1250), (560, 1200), (1140, 1640), (1140, H), (-10, H)], road)
    # the warm line racing along it under the snow, from the city (near right) to the blank building (far left)
    line = 'M1100,1800 C900,1640 700,1470 520,1360 C380,1290 240,1240 120,1206'
    f.add(f'<path d="{line}" stroke="{g(20)}" stroke-width="40" fill="none" filter="url(#rough)"/>')
    f.add(f'<path d="{line}" stroke="{HONEY}" stroke-width="12" fill="none" opacity="0.9" filter="url(#soft1)"/>')
    f.add(f'<path d="{line}" stroke="{HONEY}" stroke-width="70" fill="none" opacity="0.14" filter="url(#soft3)"/>')
    # the manholes along it, lids lifting in a cascade, warm puffs
    for t, (x, y, sc) in enumerate([(940, 1676, 1.0), (720, 1484, 0.75), (520, 1360, 0.55), (340, 1272, 0.4), (200, 1226, 0.3)]):
        f.ellipse(x, y, 46 * sc, 14 * sc, g(10))
        lift = 30 * sc * (1 - t * 0.18)
        f.add(f'<ellipse cx="{x + 10 * sc}" cy="{y - lift}" rx="{46 * sc}" ry="{12 * sc}" fill="{g(30)}" transform="rotate(-12 {x} {y - lift})"/>')
        plume(f, [(x, y - 10 * sc), (x - 6 * sc, y - 60 * sc), (x - 14 * sc, y - 110 * sc)], [40 * sc, 60 * sc, 80 * sc], L=88, op=0.8, filt='steam2',
              seed=710 + t, warm_root=0.5)
    # people on the pavement turn to watch it pass
    person(f, 860, 1560, 150, L=9, pose='stand', facing=-1, rim=1, scarf=True)
    person(f, 640, 1420, 110, L=11, pose='stand', facing=-1, arm_up=True)
    snowfall(f, 120, sizes=(2, 5), seed=704)
    band(f, ['But Helsinki', [('wants', True), (' that heat.', False)]], seat=540)
    grain(f)
    return f


@frame('B9alt')
def b9alt():
    """she opens the window: the frosted pane with the plan on it swings in, the cold night pours into the warm room"""
    f = Frame(9091)
    x0, y0, x1, y1 = 120, 650, 960, 1500
    room_window(f, x0, y0, x1, y1)
    # the opened window: the real night beyond: the frozen harbour, the far shore's lights, the blank building and the
    # empty snowy site beside it where the plan will stand
    sky(f, [(0, 14), (0.6, 22), (1, 30)], y0, 1180)
    f.rect(x0, 1180, x1 - x0, 80, g(40))
    far_city(f, 1180, x0=430, x1=x1, L=30, heights=(40, 110), seed=901, density=0.5, warm_frac=0.5)
    f.rect(x0, 1130, 230, 50, g(12))
    for k in range(10):
        f.rect(x0 + 8 + k * 22, 1166, 4, 3, g(88))
    f.rect(x0 + 240, 1168, 180, 12, g(70), 'opacity="0.6"')
    f.rect(x0, 1260, x1 - x0, y1 - 1260, g(22))
    snowfall(f, 60, region=(x0, y0, x1, y1), sizes=(2, 5), seed=902, skip_band=False)
    # the casement swung into the room toward us, its frost and her drawing on it, seen at an angle
    q = [(x0, y0), (x0 + 330, y0 - 60), (x0 + 330, y1 + 70), (x0, y1)]
    f.poly(q, g(86))
    m = homography(q)
    for k in range(10):
        a = m(0.0 + 0.1 * k, 1.0)
        frost_fern(f, a[0], a[1], -1.5, 160, depth=3, L=99, op=0.5, sw=2, seed=903 + k)
    for (u, v, uu, vv) in [(0.25, 0.12, 0.8, 0.12), (0.3, 0.6, 0.7, 0.6), (0.3, 0.6, 0.3, 0.72), (0.7, 0.6, 0.7, 0.72)]:
        a, b = m(u, v), m(uu, vv)
        f.add(f'<line x1="{a[0]:.0f}" y1="{a[1]:.0f}" x2="{b[0]:.0f}" y2="{b[1]:.0f}" stroke="{g(20)}" stroke-width="10" stroke-linecap="round"/>')
    a = m(0.5, 0.2)
    f.add(f'<text x="{a[0]:.0f}" y="{a[1]:.0f}" font-family="Gaegu" font-weight="700" font-size="92" fill="{g(22)}" '
          f'transform="skewY(-10) translate(0 {a[0] * 0.18:.0f})" text-anchor="middle">2027</text>')
    f.poly(q, 'none', f'stroke="{g(30)}" stroke-width="14"')
    room_sill(f, x0, x1, y1)
    # the candle flame leans away from the cold; her hand on the latch
    f.add(f'<path d="M{x0 + 40},{y1 - 30} q20,-6 30,-26" stroke="{HONEY}" stroke-width="8" fill="none" opacity="0.9"/>')
    finger_hand(f, (420, 1080))
    band(f, ['So how would', 'that work?'], seat=540, L=86)
    grain(f, 0.07)
    return f


@frame('B10alt')
def b10alt():
    """one machine, one pipe: a giant computer of the plan in frost lines, the water painted: cool in at its foot,
    up through it, honey out at its top and away toward the city"""
    f = Frame(10101)
    night_outside(f, 0, 0, W, H, seed=1001, lights=False)
    for (cx, cy, a) in [(0, 900, 0.1), (W, 1100, math.pi - 0.1), (300, H, -1.3), (W, 1800, math.pi + 0.4)]:
        for k in range(2):
            frost_fern(f, cx, cy, a + (k - 0.5) * 0.3, 220 + 40 * k, depth=3, L=92, op=0.28, sw=2.0, seed=int(cx * 3 + cy + k))
    # the hall around it, faint
    ice_line(f, 'M0,1560 L200,1360 L880,1360 L1080,1560 M200,1360 L200,700 M880,1360 L880,700', w=2.5, op=0.35)
    # the machine
    x0, x1, y0, y1 = 330, 750, 650, 1640
    ice_line(f, f'M{x0},{y0} L{x1},{y0} L{x1},{y1} L{x0},{y1} Z', w=6)
    ice_line(f, f'M{x1},{y0} L{x1 + 70},{y0 + 40} L{x1 + 70},{y1 - 20} L{x1},{y1}', w=4, op=0.7)
    for j in range(9):
        y = y0 + 70 + j * 100
        ice_line(f, f'M{x0 + 30},{y} L{x1 - 30},{y}', w=3, op=0.6)
        f.add(f'<rect x="{x0 + 40}" y="{y + 18}" width="{x1 - x0 - 80}" height="40" fill="{HONEY}" opacity="0.16" filter="url(#glow)"/>')
    # the water: in cool at the foot (left), up through the machine, out honey at the top (right) and away
    def seg(xa, ya, xb, yb, col, w):
        f.add(f'<line x1="{xa}" y1="{ya}" x2="{xb}" y2="{yb}" stroke="{col}" stroke-width="{w}" stroke-linecap="round"/>')
        f.add(f'<line x1="{xa}" y1="{ya}" x2="{xb}" y2="{yb}" stroke="{col}" stroke-width="{w * 2.4}" opacity="0.18" stroke-linecap="round" filter="url(#soft2)"/>')
    seg(-20, 1590, 400, 1590, g(92), 34)
    steps = 8
    for k in range(steps):
        ya = 1590 - k * (1590 - 720) / steps
        yb = 1590 - (k + 1) * (1590 - 720) / steps
        t = k / (steps - 1)
        col = g(92) if t < 0.12 else (warm(88, 10 + 40 * t, 80) if t < 0.9 else HONEY)
        seg(400, ya, 400, yb, col, 26)
    seg(400, 720, 680, 720, HONEY, 28)
    seg(680, 720, 1100, 560 + 60, HONEY, 34)
    band(f, ['with water', 'in pipes.'], seat=540, L=86)
    grain(f, 0.07)
    return f


if __name__ == '__main__':
    names = sys.argv[1:] or list(FRAMES)
    for n in names:
        f = FRAMES[n]()
        p = render(f'A-{n}', f.svg())
        print('rendered', p)
