"""imagination A, THE FROSTED CITY: every beat as one whole 9:16 frame (value sketch, one warm accent).
python3 frames.py [B1 B2 ...]   renders the named frames (all if none) into the scratchpad, one at a time."""
import math
import random
import sys

from sketchlib import (W, H, Frame, g, HONEY, HONEY_CORE, AMBER, EMBER, INK, sky, cloud, band, snowfall, grain,
                       street_wall, computer_cabinet,
                       win_shape, snowcap, block, far_city, person, breath, plume, curl, kettle, mug, rack,
                       frost_fern, frost_field, warm, homography, qpoly, facade, hand_phone, frost_line, ice_line,
                       glint, frost_quad, bil, wobble, smooth_d, hand_runs, frost_stroke, knit_hand, steam_cloud, FROST)
from render import render

FRAMES = {}


def frame(name):
    def deco(fn):
        FRAMES[name] = fn
        return fn
    return deco


# ------------------------------------------------------------------ the home view (B1, B12)
BY = 1240  # the far shore road: the city's foot


def blank_building(f, x1=322, steam=False, door_warm=False, fans=3):
    """the one building in town with NO windows, at the harbour's edge: a smooth blank slab among the stucco blocks,
    two thin rows of cold lights along its face, big roof fans; its door at the right end"""
    x0, ytop, ybot = -10, 1094, 1250
    face = f.lingrad([(0, g(31), 1), (1, g(21), 1)])
    f.poly([(x0, ybot), (x0, ytop + 4), (x1 - 16, ytop), (x1, ytop + 12), (x1, ybot)], face)
    f.poly([(x1 - 16, ytop), (x1 + 16, ytop + 12), (x1 + 16, ybot), (x1, ybot), (x1, ytop + 12)], g(15))
    f.add(f'<path d="M{x0},{ytop + 5} L{x1 - 16},{ytop + 1}" stroke="{g(58)}" stroke-width="3" opacity="0.9"/>')
    snowcap(f, x0, x1 - 10, ytop + 2, th=6, L=56)
    # its cold lights: two thin rows along the blank face, and their cold sheen on the snow under them
    for yy, n in ((1146, 15), (1206, 15)):
        f.add(f'<rect x="{x0 + 10}" y="{yy - 5}" width="{x1 - x0 - 30}" height="12" fill="{g(80, -10)}" opacity="0.18" filter="url(#soft2)"/>')
        for k in range(n):
            f.rect(x0 + 18 + k * (x1 - x0 - 46) / (n - 1), yy, 5, 3, g(94, -9))
    f.ellipse((x0 + x1) / 2, 1258, (x1 - x0) * 0.6, 16, g(70, -8), 'opacity="0.22" filter="url(#soft3)"')
    # the roof fans: round housings with their blades
    fx_list = [x0 + 60 + k * ((x1 - x0 - 120) / max(1, fans - 1)) for k in range(fans)]
    for fx in fx_list:
        f.rect(fx - 30, ytop - 16, 60, 18, g(20))
        f.ellipse(fx, ytop - 16, 30, 9, g(36))
        f.ellipse(fx, ytop - 16, 25, 7, g(12))
        f.add(f'<path d="M{fx - 22},{ytop - 16} L{fx + 22},{ytop - 16} M{fx - 10},{ytop - 22} L{fx + 10},{ytop - 10}" stroke="{g(40)}" stroke-width="2.5"/>')
    if steam:
        for i, fx in enumerate(fx_list):
            plume(f, [(fx, ytop - 30), (fx + 8, ytop - 80), (fx + 22, ytop - 130)], [44, 56, 70], L=80, op=0.78, seed=170 + i,
                  warm_root=0.5)
    # the door at the right end
    dx = x1 - 62
    f.rect(dx, ybot - 54, 34, 54, HONEY if door_warm else g(10))
    if door_warm:
        f.add(f'<rect x="{dx - 30}" y="{ybot - 80}" width="94" height="96" fill="{HONEY}" opacity="0.45" filter="url(#glow2)"/>')
        f.ellipse(dx + 17, ybot + 6, 70, 14, HONEY, 'opacity="0.5" filter="url(#soft3)"')
    return dx + 17, fx_list


def home_view(f, wave=0.5, all_warm=False, her_step=False, data_plume=False, her_inside=False, resident=True,
              pulse=False, crest=False, plan_site=False, dim_city=0.0):
    """from the snowy near shore, across a narrow arm of frozen harbour: her block with the one window in the
    golden box, the city's blocks stepping up the hill behind, the blank building at the harbour's edge (left).
    wave: how far the warm wave has run (0 frosted city .. 1 across the whole hill); it runs from the blank building
    out along the shore and up the hill, one honey FRONT whose crest is the brightest honey, the frost ahead of it.
    plan_site (B12): the plan's new building drawn in frost lines beside the blank one; dim_city: the city's warm
    windows a step deeper so her window and your chat stay the two brightest honeys."""
    r = f.rng
    sky(f, [(0, 15), (0.3, 19), (0.55, 27), (0.72, 35), (0.86, 42), (1, 46)], 0, BY)
    cloud(f, 250, 150, 760, 230, 25, 0.95, seed=3)
    cloud(f, 900, 230, 420, 120, 22, 0.8, seed=4)
    cloud(f, 620, 700, 1000, 110, 31, 0.6, seed=5)

    # the wave's front: an arc spreading from the blank building's door, longer along the shore than up the hill
    fa, fb = 200 + 650 * wave, 110 + 340 * wave

    def front_d(x, y):
        return math.hypot((x - 150) / fa, (y - 1240) / fb) - 1.0

    def state_at(x, y):
        if all_warm:
            return 'deep' if dim_city else 'warm'
        d = front_d(x, y)
        if d < -0.3:
            return 'deep'
        if d < -0.075:
            return 'warm'
        if d < 0.0:
            return 'crest'
        if d < 0.07:
            return 'half'
        return 'frost'

    def warm_at(x, y):
        return all_warm or front_d(x, y) < 0

    shapes = []  # the city's silhouettes (the crest's light lies on facades only)
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
        shapes.append(f'<rect x="{x:.0f}" y="{top:.0f}" width="{bw:.0f}" height="{1200 - top:.0f}"/>')
        snowcap(f, x - 1, x + bw + 1, top + 3, th=5, L=58)
        for yy in range(int(top + 14), int(base + 120), 15):
            for xx in range(int(x + 7), int(x + bw - 6), 13):
                if rr.random() < 0.55:
                    st_ = state_at(xx, yy)
                    if st_ == 'crest':
                        f.rect(xx - 1, yy - 1, 8, 9, HONEY_CORE)
                    elif st_ == 'warm':
                        f.rect(xx, yy, 6, 7, HONEY, 'opacity="0.95"')
                    elif st_ == 'deep':
                        f.rect(xx, yy, 6, 7, AMBER if (not all_warm or dim_city) else HONEY, f'opacity="{0.9 if not dim_city else 0.7}"')
                    elif st_ == 'half':
                        f.rect(xx, yy, 6, 7, AMBER, 'opacity="0.85"')
                        f.rect(xx, yy, 6, 3, g(70))
                    else:
                        f.rect(xx, yy, 6, 7, g(60), 'opacity="0.95"')
                        if rr.random() < 0.16:
                            glint(f, xx + 3, yy + 3, rr.uniform(4, 7), op=0.9, halo=False)
        x += bw - 6
    # the dome on the crest (a landmark of the view only)
    f.rect(842, 760, 74, 140, g(40))
    f.ellipse(879, 762, 40, 36, g(43))
    f.ellipse(879, 730, 14, 16, g(44))
    f.rect(877, 680, 4, 40, g(44))
    snowcap(f, 840, 918, 764, th=5, L=60)
    shapes.append('<rect x="839" y="680" width="80" height="230"/>')

    def st_for(x0, ytop):
        def st(row, c):
            xx = x0 + 20 + c * 60
            yy = ytop + 40 + row * 60
            return state_at(xx, yy)
        return st

    def blk(x0, x1, ytop, floors, cols, **kw):
        block(f, x0, x1, ytop, BY, floors, cols, frost_L=60, warmth=(0.55 if dim_city else 1.0), **kw)
        shapes.append(f'<rect x="{x0}" y="{ytop - 30}" width="{x1 - x0}" height="{BY - ytop + 30}"/>')

    blk(-20, 178, 980, 5, 3, L=26, states=st_for(-20, 980), chimneys=2, seed=31)
    blk(178, 400, 930, 6, 4, L=30, states=st_for(178, 930), chimneys=3, seed=32, side=-14)

    # her block: Jugendstil, a corner tower, the one window (row 3, col 2)
    def her_states(row, c):
        if row == 3 and c == 2:
            return None
        xx = 410 + c * 64
        yy = 830 + row * 70
        return state_at(xx, yy)

    blk(400, 732, 790, 6, 5, L=24, states=her_states, chimneys=3, seed=33, tower=(695, 74, 130), side=16, side_L=18)
    shapes.append('<rect x="655" y="660" width="80" height="140"/>')
    wx, wy, ww, wh = 526, 1028, 60, 86
    f.rect(wx - 7, wy - 8, ww + 14, wh + 14, g(12))
    lit = warm_at(556, 1060) or her_step
    if her_step:
        f.add(f'<rect x="{wx - 90}" y="{wy - 80}" width="{ww + 180}" height="{wh + 160}" fill="{HONEY}" opacity="0.6" filter="url(#glow2)"/>')
        f.add(f'<rect x="{wx - 30}" y="{wy - 26}" width="{ww + 60}" height="{wh + 52}" fill="{HONEY_CORE}" opacity="0.45" filter="url(#glow)"/>')
    if lit:
        win_shape(f, wx, wy, ww, wh, 'warm', frost_L=62, warmth=1.7)
        if her_step:
            f.rect(wx + 4, wy + 4, ww - 8, wh - 8, HONEY_CORE, 'opacity="0.85"')
    else:
        win_shape(f, wx, wy, ww, wh, 'frost', frost_L=62)
    if her_inside:
        person(f, wx + ww * 0.36, wy + wh + 1, 50, L=10, pose='stand', facing=-1, coat=False)
    snowcap(f, wx - 9, wx + ww + 9, wy + wh + 7, th=6, L=88 if lit else 76)
    if lit:
        f.add(f'<path d="M{wx - 4},{wy + wh + 12} L{wx + ww + 4},{wy + wh + 12} L{wx + ww + 28},{wy + wh + 80} L{wx - 28},{wy + wh + 80}Z" '
              f'fill="{HONEY}" opacity="0.14" filter="url(#soft2)"/>')

    blk(748, 968, 960, 5, 3, L=28, states=st_for(748, 960), chimneys=2, seed=34)
    blk(968, 1110, 925, 6, 2, L=25, states=st_for(968, 925), chimneys=2, seed=35)

    # THE CREST: the wave's bright front lying across the facades, mid-building, from the shore up the whole hill
    if crest and not all_warm:
        cid = f.uid('city')
        f.defs.append(f'<clipPath id="{cid}">{"".join(shapes)}</clipPath>')
        arc = []
        for i in range(41):
            t = math.radians(-2 + 92 * i / 40)
            arc.append((150 + fa * math.cos(t) * 0.985, 1240 - fb * math.sin(t) * 0.985))
        d = smooth_d(arc)
        # the warm air rising off the crest (a bloom over the front only, the rest of the sky stays the night's)
        mid = arc[18]
        f.ellipse(mid[0] + 40, mid[1] - 40, 300, 150, HONEY, 'opacity="0.13" filter="url(#soft4)"')
        f.add(f'<g clip-path="url(#{cid})">'
              f'<path d="{d}" stroke="{HONEY}" stroke-width="140" fill="none" opacity="0.46" filter="url(#soft4)"/>'
              f'<path d="{d}" stroke="{HONEY_CORE}" stroke-width="30" fill="none" opacity="0.55" filter="url(#soft3)"/></g>')

    # the blank building at the harbour's edge (left): no windows, cold lights, roof fans
    if plan_site:
        door_x, _ = blank_building(f, x1=150, steam=False, door_warm=False, fans=2)
        # beside it, on the empty snowy site: the plan's new building, still drawn in frost ("could soon"): the same
        # box, door and two fans she drew on her window, glittering at full size
        bx0, bx1, by0, by1 = 186, 384, 1128, 1246
        f.poly([(bx0, by1), (bx0, by0), (bx1, by0 - 4), (bx1, by1)], g(12), 'opacity="0.88"')
        frost_stroke(f, [(bx0, by1), (bx0, by0), (bx1, by0 - 4), (bx1, by1)], w=7, seed=1210, L=94, glints=3)
        frost_stroke(f, [(bx0 + 78, by1), (bx0 + 78, by1 - 58), (bx0 + 118, by1 - 58), (bx0 + 118, by1)], w=6, seed=1211, L=94, glints=1)
        for k, fx in enumerate((bx0 + 50, bx1 - 50)):
            pts = [(fx + 34 * math.cos(t), by0 - 16 + 12 * math.sin(t)) for t in [i * math.pi / 6 for i in range(13)]]
            frost_stroke(f, pts, w=5, seed=1220 + k, L=94, feathers=False, glints=1)
            frost_stroke(f, [(fx - 24, by0 - 16), (fx + 24, by0 - 16)], w=3, seed=1230 + k, L=94, feathers=False, glints=0, glow=False)
            frost_stroke(f, [(fx, by0 - 25), (fx, by0 - 7)], w=3, seed=1240 + k, L=94, feathers=False, glints=0, glow=False)
        f.rect(bx0 + 82, by1 - 54, 32, 54, HONEY, 'opacity="0.9"')
        f.add(f'<rect x="{bx0 + 60}" y="{by1 - 76}" width="76" height="96" fill="{HONEY}" opacity="0.4" filter="url(#glow2)"/>')
        door_x = bx0 + 98
    else:
        door_x, _ = blank_building(f, x1=322, steam=crest or data_plume, door_warm=(wave > 0 or all_warm))
    if data_plume and not crest:
        plume(f, [(62, 1050), (110, 990), (170, 950), (250, 920), (340, 905)], [50, 70, 90, 110, 130], L=70, op=0.75, seed=7)

    # the far shore road and the warm run along it (the warm water under the snow)
    f.rect(0, BY, W, 18, g(40), 'filter="url(#rough2)"')
    run_from = door_x
    if wave > 0 or all_warm:
        run_to = 1080 if all_warm else min(1080, 150 + fa * 0.985)
        sw = 8 if pulse else 6
        f.add(f'<path d="M{run_from},{BY + 9} L{run_to},{BY + 8}" stroke="{HONEY}" stroke-width="{sw}" opacity="{0.75 if dim_city else 0.95}" '
              f'stroke-linecap="round" filter="url(#soft1)"/>')
        f.add(f'<path d="M{run_from},{BY + 9} L{run_to},{BY + 8}" stroke="{HONEY}" stroke-width="26" opacity="{0.12 if dim_city else 0.18}" filter="url(#soft3)"/>')
        if crest and not all_warm:
            f.ellipse(run_to - 10, BY + 8, 46, 14, HONEY_CORE, 'opacity="0.85" filter="url(#soft2)"')
            f.ellipse(run_to - 10, BY + 8, 110, 30, HONEY, 'opacity="0.35" filter="url(#soft3)"')
        if pulse:
            # the pulse: one bright packet of warmth running along the shore from the plan's door to her block
            px_ = 392
            f.ellipse(px_, BY + 8, 64, 15, HONEY_CORE, 'opacity="0.95" filter="url(#soft2)"')
            f.ellipse(px_, BY + 8, 150, 40, HONEY, 'opacity="0.45" filter="url(#soft3)"')
            f.add(f'<path d="M{px_ + 40},{BY + 4} L{px_ + 70},{BY + 4} M{px_ + 44},{BY + 13} L{px_ + 84},{BY + 13}" stroke="{HONEY_CORE}" stroke-width="3" opacity="0.6"/>')
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
            f.rect(xx, cy + 8, 5, 30, HONEY, f'opacity="{0.4 if dim_city else 0.6}" filter="url(#soft1)"')
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
    FROST.update(glint_p=0.6, glint_k=0.5)
    home_view(f, wave=0.77, crest=True)
    FROST.update(glint_p=0.45, glint_k=0.34)
    band(f, ['to heat', [('70,000', True), (' homes?', False)]], seat=530)
    grain(f)
    return f


# ------------------------------------------------------------------ inside the building with no windows (B2, B3)
def door_city(f, d0, d1, seed=5):
    """the night seen through the big open door (B2): the sky, the hill city, the stucco blocks across the frozen
    harbour with their warm windows, the pale ice, falling snow"""
    x0, y0 = d0
    x1, y1 = d1
    dw, dh = x1 - x0, y1 - y0
    rr = random.Random(seed)
    f.rect(x0, y0, dw, dh, f.lingrad([(0, g(34), 1), (0.4, g(44), 1), (0.7, g(50), 1), (1, g(50), 1)]))
    f.ellipse(x0 + dw * 0.5, y0 + dh * 0.62, dw * 0.6, dh * 0.2, HONEY, 'opacity="0.18" filter="url(#soft4)"')
    # the hill city behind (paler), then the waterfront blocks (stucco, chimneys, warm windows)
    hz = y0 + dh * 0.74
    x = x0 - 10
    while x < x1:
        bw = rr.uniform(26, 44)
        top = hz - dh * rr.uniform(0.36, 0.5)
        f.rect(x, top, bw, hz - top, g(38))
        snowcap(f, x - 1, x + bw + 1, top + 2, th=3, L=60)
        for yy in range(int(top + 6), int(hz - 4), 9):
            for xx in range(int(x + 4), int(x + bw - 4), 8):
                if rr.random() < 0.5:
                    f.rect(xx, yy, 3.5, 4.5, HONEY if rr.random() < 0.7 else g(60), 'opacity="0.9"')
        x += bw - 2
    x = x0 - 6
    while x < x1:
        bw = rr.uniform(46, 70)
        top = hz - dh * rr.uniform(0.2, 0.3)
        Lb = 28 + rr.uniform(-3, 3)
        f.rect(x, top, bw, hz - top + 2, g(Lb))
        snowcap(f, x - 2, x + bw + 2, top + 2, th=4, L=74)
        f.rect(x + bw * rr.uniform(0.2, 0.7), top - 10, 6, 11, g(Lb - 4))
        rows = max(2, int((hz - top - 10) / 13))
        for j in range(rows):
            for i in range(int(bw / 13)):
                wx_ = x + 5 + i * 13
                wy_ = top + 7 + j * 13
                if wx_ + 6 < x + bw and rr.random() < 0.85:
                    f.rect(wx_, wy_, 6, 7, HONEY if rr.random() < 0.8 else g(66))
        x += bw + rr.uniform(2, 8)
    # the frozen harbour, its dark channel, the warm windows mirrored in it
    f.rect(x0, hz + 2, dw, y1 - hz - 2, f.lingrad([(0, g(70), 1), (1, g(62), 1)]))
    f.rect(x0, hz + dh * 0.1, dw, dh * 0.045, g(26))
    for k in range(int(dw / 16)):
        f.rect(x0 + 6 + k * 16 + rr.uniform(-3, 3), hz + dh * 0.105, 3, dh * 0.035, HONEY, 'opacity="0.55"')
    snowfall(f, 40, region=(x0, y0, x1, y1), sizes=(1.2, 3), seed=seed + 3, skip_band=False, L=95)


def aisle(f, hot=0.0, scale=1.0, tech=(540, 1300, 150), tech_pose='stand', steam_out=0.0, far=1.0, city_door=False,
          light_rows=False, rake=0.0):
    """a street of giant computers: two rows of cabinets receding to the one opening, a huge door on the night;
    their rows of small cold lights rhyme with a city's windows. hot: 0 cold .. 1 the vents glow honey.
    far > 1 brings the aisle's end (the door) closer and bigger; city_door paints the warm city in it; light_rows sets
    each cabinet's lights in rows and columns like a facade's windows; rake: the door's light along the floor and the
    cabinets' edges"""
    vx, vy = 540, 1050
    ex0, ex1, ey0, ey1 = 540 - 100 * far, 540 + 100 * far, 1050 - 110 * far, 1050 + 100 * far

    def S(x, y):
        return (vx + (x - vx) * scale, vy + (y - vy) * scale)

    # ceiling (the band is this calm dark field)
    ceil = f.lingrad([(0, g(9), 1), (1, g(14 + 6 * hot), 1)])
    f.poly([(0, 0), (W, 0), (W, S(1080, 620)[1]), S(ex1, ey0), S(ex0, ey0), (0, S(0, 620)[1])], ceil)
    for xx in (300, 780):
        if far == 1.0:
            a, b = S(xx + (540 - xx) * 0.36, 640), S(xx + (540 - xx) * 0.82, 930)
        else:
            a = S(xx + (540 - xx) * 0.36, 640)
            tt = (ey0 - 10 - 640) / (vy - 640)
            b = S(a[0] + (vx - a[0]) * tt, ey0 - 10)
        f.add(f'<line x1="{a[0]:.0f}" y1="{max(612, a[1]):.0f}" x2="{b[0]:.0f}" y2="{b[1]:.0f}" stroke="{g(70)}" stroke-width="{6 * scale:.1f}" opacity="0.5"/>')
    # the door at the end: the night, the frozen harbour, the city's warm windows across it
    d0, d1 = S(ex0, ey0), S(ex1, ey1)
    dw, dh = d1[0] - d0[0], d1[1] - d0[1]
    if city_door:
        # its light spilling into the hall round the opening
        f.add(f'<rect x="{d0[0] - dw * 0.35:.0f}" y="{d0[1] - dh * 0.3:.0f}" width="{dw * 1.7:.0f}" height="{dh * 1.5:.0f}" fill="{g(70)}" '
              f'opacity="{0.28 * rake:.2f}" filter="url(#soft4)"/>')
        door_city(f, d0, d1)
    else:
        f.rect(d0[0], d0[1], d1[0] - d0[0], d1[1] - d0[1], f.lingrad([(0, g(22), 1), (0.6, g(32), 1), (1, g(40), 1)]))
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
    f.add(f'<rect x="{d0[0] - 6}" y="{d0[1] - 6}" width="{dw + 12}" height="{dh + 6}" fill="none" stroke="{g(48 if not city_door else 66)}" stroke-width="{5 * scale:.1f}"/>')
    if steam_out > 0:
        plume(f, [(d0[0] + dw * 0.5, d0[1] + dh * 0.1), (d0[0] + dw * 0.3, d0[1] - dh * 0.05), (d0[0] + dw * 0.7, d0[1] + dh * 0.05)],
              [dw * 0.5, dw * 0.45, dw * 0.4], L=80, op=0.55 * steam_out, filt='steam2', seed=14)
    # the floor: polished, mirroring the lights and the door
    fl = f.lingrad([(0, g(20 + 6 * hot), 1), (1, g(12), 1)])
    f.poly([S(0, 1760), S(ex0, ey1), S(ex1, ey1), S(1080, 1760), (W, H), (0, H)], fl)
    f.poly([S(450, 1150), S(630, 1150), S(760, 1920), S(320, 1920)], g(46), 'opacity="0.25" filter="url(#soft3)"')
    if rake > 0:
        # the door's light laid along the polished floor toward us: the door mirrored, long and soft, its warm windows in it
        f.poly([(d0[0] + dw * 0.04, d1[1]), (d1[0] - dw * 0.04, d1[1]), (d1[0] + dw * 0.55, H), (d0[0] - dw * 0.55, H)],
               f.lingrad([(0, g(72), 1), (0.35, g(50), 0.9), (1, g(30), 0.5)]), f'opacity="{0.7 * rake:.2f}" filter="url(#soft2)"')
        rr = random.Random(55)
        for k in range(16):
            u = rr.uniform(0.08, 0.92)
            xx = d0[0] + dw * u
            f.add(f'<path d="M{xx:.0f},{d1[1] + 6:.0f} L{xx + (u - 0.5) * dw * 0.5:.0f},{d1[1] + 170 + rr.uniform(0, 90):.0f}" stroke="{HONEY}" '
                  f'stroke-width="{rr.uniform(3, 6):.1f}" opacity="{rr.uniform(0.25, 0.5):.2f}" stroke-linecap="round" filter="url(#soft1)"/>')
    # the two rows of giant computers
    for side in (-1, 1):
        if side < 0:
            quad = [S(0, 620), S(ex0, ey0), S(ex0, ey1), S(0, 1760)]
        else:
            quad = [S(1080, 620), S(ex1, ey0), S(ex1, ey1), S(1080, 1760)]
        m = homography(quad)
        n = 7
        rr = random.Random(40 + side)
        for i in range(n):
            u0, u1 = i / n + 0.012, (i + 1) / n - 0.012
            qpoly(f, m, u0, 0.0, u1, 1.0, g(13 + rr.uniform(-2, 2)), 'filter="url(#rough2)"')
            if rake > 0:
                # the far cabinets catch the door's light on their faces
                qpoly(f, m, u0, 0.0, u1, 1.0, g(60), f'opacity="{0.14 * rake * (i / (n - 1)) ** 2:.2f}"')
            # the cabinet's lit edge (a cool rim from the ceiling strips)
            a, b = m(u0, 0.0), m(u0, 1.0)
            f.add(f'<line x1="{a[0]:.1f}" y1="{a[1]:.1f}" x2="{b[0]:.1f}" y2="{b[1]:.1f}" stroke="{g(34)}" stroke-width="{max(1.5, 4 * (1 - i / n)) * scale:.1f}"/>')
            if rake > 0:
                # the door's light raking the edge that faces the aisle's end
                a, b = m(u1, 0.02), m(u1, 0.99)
                f.add(f'<line x1="{a[0]:.1f}" y1="{a[1]:.1f}" x2="{b[0]:.1f}" y2="{b[1]:.1f}" stroke="{g(78)}" '
                      f'stroke-width="{max(1.5, 5 * (1 - i / n)):.1f}" opacity="{rake * (0.35 + 0.6 * i / (n - 1)):.2f}"/>')
            rows = 11
            for j in range(rows):
                v = 0.06 + 0.88 * j / (rows - 1)
                if hot > 0:
                    va, vb = v - 0.012, v + 0.012
                    p1, p2, p3, p4 = m(u0 + 0.02, va), m(u1 - 0.02, va), m(u1 - 0.02, vb), m(u0 + 0.02, vb)
                    f.add(f'<polygon points="{p1[0]:.1f},{p1[1]:.1f} {p2[0]:.1f},{p2[1]:.1f} {p3[0]:.1f},{p3[1]:.1f} {p4[0]:.1f},{p4[1]:.1f}" '
                          f'fill="{HONEY}" opacity="{0.45 + 0.5 * hot * rr.random():.2f}"/>')
                elif light_rows:
                    # lights in rows and columns, like a facade's windows (a few dark)
                    for t in range(3):
                        uc = u0 + (u1 - u0) * (0.24 + 0.26 * t)
                        du = (u1 - u0) * 0.062
                        if rr.random() < 0.86:
                            qpoly(f, m, uc - du, v - 0.011, uc + du, v + 0.011, g(88, -8))
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
    aisle(f, hot=0.0, scale=1.0, tech=(556, 1330, 170), far=1.5, city_door=True, light_rows=True, rake=1.0)
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


def kettle2(f, x, y, s=1.0, kind='round', L=10):
    """a bold kettle silhouette standing on y (its base), x its centre; returns its spout tip"""
    c = g(L)
    if kind == 'jug':
        f.add(f'<path d="M{x - 13 * s},{y} L{x - 11 * s},{y - 34 * s} Q{x},{y - 38 * s} {x + 11 * s},{y - 34 * s} L{x + 13 * s},{y}Z" fill="{c}"/>')
        f.add(f'<path d="M{x - 12 * s},{y - 30 * s} q{-12 * s},{2 * s} {-11 * s},{12 * s} q{0},{9 * s} {11 * s},{10 * s}" stroke="{c}" stroke-width="{3.5 * s}" fill="none"/>')
        f.add(f'<path d="M{x + 10 * s},{y - 33 * s} L{x + 19 * s},{y - 38 * s} L{x + 12 * s},{y - 28 * s}Z" fill="{c}"/>')
        f.rect(x - 15 * s, y - 2 * s, 30 * s, 4 * s, c)
        return (x + 19 * s, y - 38 * s)
    if kind == 'whistle':
        f.add(f'<path d="M{x - 18 * s},{y} C{x - 22 * s},{y - 22 * s} {x - 8 * s},{y - 28 * s} {x},{y - 28 * s} '
              f'C{x + 8 * s},{y - 28 * s} {x + 22 * s},{y - 22 * s} {x + 18 * s},{y}Z" fill="{c}"/>')
        f.add(f'<path d="M{x + 12 * s},{y - 18 * s} L{x + 24 * s},{y - 34 * s} L{x + 27 * s},{y - 31 * s} L{x + 16 * s},{y - 13 * s}Z" fill="{c}"/>')
        f.add(f'<path d="M{x - 12 * s},{y - 24 * s} Q{x - 4 * s},{y - 44 * s} {x + 10 * s},{y - 26 * s}" stroke="{c}" stroke-width="{3.2 * s}" fill="none"/>')
        f.circle(x, y - 29 * s, 3 * s, c)
        return (x + 27 * s, y - 34 * s)
    # round stovetop kettle
    f.add(f'<path d="M{x - 17 * s},{y} L{x - 13 * s},{y - 21 * s} Q{x},{y - 28 * s} {x + 13 * s},{y - 21 * s} L{x + 17 * s},{y}Z" fill="{c}"/>')
    f.add(f'<path d="M{x + 12 * s},{y - 12 * s} L{x + 27 * s},{y - 24 * s} L{x + 28 * s},{y - 20 * s} L{x + 14 * s},{y - 6 * s}Z" fill="{c}"/>')
    f.add(f'<path d="M{x - 10 * s},{y - 23 * s} Q{x},{y - 38 * s} {x + 10 * s},{y - 23 * s}" stroke="{c}" stroke-width="{3 * s}" fill="none"/>')
    f.circle(x, y - 26 * s, 2.6 * s, c)
    return (x + 28 * s, y - 23 * s)


def kitchen(f, x, y, w, h, kind, seed, kettle_kind='round', kx=0.42):
    """one kitchen window at night, each a little different: warm inside, its kettle boiling on the sill, a big white
    curl of steam out through the open top pane. Returns where its steam leaves the window."""
    r = random.Random(seed)
    f.rect(x - 9, y - 9, w + 18, h + 18, g(14))
    f.add(f'<rect x="{x - w * 0.3:.0f}" y="{y - h * 0.3:.0f}" width="{w * 1.6:.0f}" height="{h * 1.6:.0f}" fill="{HONEY}" '
          f'opacity="{r.uniform(0.18, 0.26):.2f}" filter="url(#glow)"/>')
    f.rect(x, y, w, h, f.radgrad([(0, HONEY_CORE, 1), (0.55, HONEY, 1), (1, AMBER, 1)], cx=r.uniform(0.35, 0.65), cy=0.3, r=0.75))
    tr = h * 0.24  # the top pane (a transom), tilted open for the steam
    # the room inside: a shelf, a hanging lamp, tiles (kept quiet, a shade darker than the light)
    if kind in ('shelf', 'person', 'plant'):
        f.rect(x + w * 0.1, y + h * 0.42, w * 0.5, 4, g(40), 'opacity="0.55"')
        for i in range(3):
            f.rect(x + w * (0.14 + 0.13 * i), y + h * 0.42 - 12 - i % 2 * 4, 9, 12 + i % 2 * 4, g(42), 'opacity="0.5"')
    if kind == 'lamp':
        f.add(f'<path d="M{x + w * 0.6},{y + tr} L{x + w * 0.6},{y + h * 0.36} M{x + w * 0.5},{y + h * 0.46} Q{x + w * 0.6},{y + h * 0.3} {x + w * 0.7},{y + h * 0.46}Z" '
              f'stroke="{g(30)}" stroke-width="3" fill="{g(30)}" opacity="0.8"/>')
    if kind == 'person':
        # a neighbour in the back of the kitchen, waiting for the kettle
        px = x + w * 0.74
        f.add(f'<path d="M{px - w * 0.17},{y + h} C{px - w * 0.16},{y + h * 0.62} {px - w * 0.1},{y + h * 0.52} {px},{y + h * 0.52} '
              f'C{px + w * 0.1},{y + h * 0.52} {px + w * 0.16},{y + h * 0.62} {px + w * 0.17},{y + h}Z" fill="{g(26)}"/>')
        f.ellipse(px, y + h * 0.42, w * 0.075, h * 0.12, g(26))
        f.add(f'<path d="M{px - w * 0.08},{y + h * 0.38} Q{px},{y + h * 0.24} {px + w * 0.09},{y + h * 0.36}" fill="{g(26)}"/>')
    if kind == 'curtain':
        f.add(f'<path d="M{x},{y + tr} L{x + w * 0.3},{y + tr} C{x + w * 0.26},{y + h * 0.5} {x + w * 0.1},{y + h * 0.56} {x + w * 0.14},{y + h} L{x},{y + h}Z" fill="{g(22)}"/>')
        f.add(f'<path d="M{x + w * 0.14},{y + h * 0.56} q{w * 0.05},{-4} {w * 0.08},{4}" stroke="{g(40)}" stroke-width="4"/>')
    if kind == 'blind':
        f.rect(x, y + tr, w, h * 0.22, g(64), 'opacity="0.85"')
        f.rect(x + w * 0.46, y + tr + h * 0.22, w * 0.08, 6, g(30))
    # the window's frame: the mullion, the transom bar, the top pane tilted open
    f.rect(x, y + tr - 4, w, 8, g(16))
    f.rect(x + w / 2 - 4, y + tr, 8, h - tr, g(16))
    f.poly([(x + 4, y + tr - 4), (x + w - 4, y + tr - 4), (x + w - 14, y - 10), (x + 14, y - 10)], g(30), 'opacity="0.9"')
    # the kettle on the sill, bold, and its steam
    kxp = x + w * kx
    kk = kettle2(f, kxp, y + h - 4, s=h / 52, kind=kettle_kind, L=10)
    if kind == 'hand':
        # a hand reaching in from the side to lift it
        f.add(f'<path d="M{x + w},{y + h * 0.5} C{x + w * 0.85},{y + h * 0.52} {x + w * 0.7},{y + h * 0.6} {kxp + h * 0.25},{y + h * 0.62} '
              f'L{kxp + h * 0.22},{y + h * 0.74} C{x + w * 0.72},{y + h * 0.74} {x + w * 0.86},{y + h * 0.7} {x + w},{y + h * 0.72}Z" fill="{g(12)}"/>')
    if kind == 'plant':
        px = x + w * 0.84
        f.add(f'<path d="M{px - 10},{y + h - 4} L{px - 8},{y + h - 22} L{px + 8},{y + h - 22} L{px + 10},{y + h - 4}Z" fill="{g(14)}"/>')
        for i in range(5):
            f.add(f'<path d="M{px},{y + h - 22} q{(i - 2) * 10},{-18} {(i - 2) * 16},{-30}" stroke="{g(14)}" stroke-width="5" fill="none" stroke-linecap="round"/>')
    if kind == 'mugs':
        for i in range(2):
            mx = x + w * (0.7 + 0.13 * i)
            f.rect(mx - 8, y + h - 22, 16, 18, g(12), 'rx="2"')
    sx, sy = kk
    curl(f, sx, sy, h=(sy - y) * 0.95, L=95, op=0.95, sw=max(4, h * 0.075))
    f.add(f'<path d="M{sx},{sy} C{sx + 14},{sy - h * 0.3} {sx - 10},{sy - h * 0.5} {sx + 4},{y + 2}" stroke="{g(95)}" stroke-width="{h * 0.16:.0f}" '
          f'fill="none" opacity="0.35" filter="url(#soft2)"/>')
    snowcap(f, x - 8, x + w + 8, y + h + 9, th=6, L=84, sag=0.4)
    return (sx + 4, y - 12)


@frame('B4')
def b4():
    f = Frame(404)
    sky(f, [(0, 14), (0.4, 19), (0.75, 26), (1, 30)], 0, 1340)
    cloud(f, 520, 120, 1000, 200, 22, 0.85, seed=31)
    # the block of kitchens across the street, close: its facade runs past both edges; every kitchen boils a kettle
    x0, x1, ytop, ybase = -60, 1140, 764, 1336
    f.poly([(x0, ybase), (x0, ytop), (x1, ytop + 4), (x1, ybase)], g(24), 'filter="url(#rough2)"')
    for row in range(1, 4):
        yy = ytop + 14 + row * 120
        f.rect(x0, yy - 10, x1 - x0, 7, g(30), 'opacity="0.8"')
    # the ground floor: the street door (warm), the shop window, the plinth
    f.rect(x0, 1246, x1 - x0, 90, g(20))
    f.rect(470, 1252, 80, 84, g(12))
    f.rect(476, 1258, 68, 78, f.lingrad([(0, HONEY, 1), (1, AMBER, 1)]), 'opacity="0.9"')
    f.rect(600, 1262, 300, 56, g(52), 'opacity="0.9"')
    f.rect(140, 1262, 280, 56, g(48), 'opacity="0.9"')
    for i in range(6):
        f.rect(150 + i * 46, 1272, 30, 40, g(40), 'opacity="0.7"')
    kinds = [['hand', 'plant', 'curtain', 'lamp', 'mugs'],
             ['shelf', 'curtain', 'person', 'blind', 'plant'],
             ['lamp', 'person', 'mugs', 'hand', 'curtain'],
             ['curtain', 'blind', 'shelf', 'plant', 'person']]
    kets = ['round', 'jug', 'whistle', 'round', 'jug', 'whistle', 'round']
    tops = []
    rr = random.Random(77)
    for row in range(4):
        for c in range(5):
            wx = x0 + 232 * c + 54 + rr.uniform(-6, 6)
            wy = ytop + 34 + row * 120 + rr.uniform(-3, 3)
            tops.append(kitchen(f, wx, wy, 128, 82, kinds[row][c], seed=row * 10 + c,
                                kettle_kind=kets[(row * 5 + c) % 7], kx=rr.uniform(0.3, 0.55)))
    # every kitchen's curl wafting up out of its top pane, and all of it drawn up the facade into ONE cloud
    cx2, cy2 = 712, 716
    for (sx, sy) in tops:
        d = f'M{sx:.0f},{sy:.0f} C{sx + 16:.0f},{sy - 26:.0f} {sx - 14:.0f},{sy - 46:.0f} {sx + 2:.0f},{sy - 70:.0f}'
        f.add(f'<path d="{d}" stroke="{g(94)}" stroke-width="9" fill="none" opacity="0.5" stroke-linecap="round" filter="url(#soft1)"/>')
    f.add(f'<path d="M80,{ytop + 40} C260,{ytop - 10} 470,{cy2 + 80} {cx2 - 120},{cy2 + 20} L{cx2 + 120},{cy2 + 20} '
          f'C960,{cy2 + 80} 1080,{ytop - 10} 1140,{ytop + 40}Z" fill="{g(92)}" opacity="0.2" filter="url(#soft4)"/>')
    snowcap(f, x0, x1, ytop + 2, th=10, L=74)
    for cxx in (90, 420, 980):
        f.rect(cxx, ytop - 30, 18, 34, g(20))
        snowcap(f, cxx - 2, cxx + 20, ytop - 29, th=5, L=74)
    # the street: kerb, the road's snow and its tram rails, the near pavement
    f.rect(0, 1336, W, 16, g(46), 'filter="url(#rough2)"')
    f.rect(0, 1352, W, 92, f.lingrad([(0, g(40), 1), (1, g(33), 1)]))
    for yy in (1374, 1388, 1412, 1426):
        f.add(f'<line x1="0" y1="{yy}" x2="{W}" y2="{yy + 4}" stroke="{g(24)}" stroke-width="3.5" opacity="0.8"/>')
    near = f.lingrad([(0, g(36), 1), (0.3, g(26), 1), (1, g(12), 1)])
    f.poly([(0, 1448), (W, 1440), (W, H), (0, H)], near, 'filter="url(#rough)"')
    snowcap(f, 0, W, 1450, th=10, L=50)
    # the ONE giant computer out on the pavement: the one big break in the street's pattern of warm kitchens,
    # melting its own pool in the snow
    f.ellipse(178, 1470, 230, 30, g(10), 'opacity="0.9" filter="url(#soft1)"')
    f.ellipse(178, 1470, 260, 40, HONEY, 'opacity="0.12" filter="url(#soft3)"')
    computer_cabinet(f, 66, 892, 228, 1466, L=11, seed=4, steam=False)
    # THE TWO CLOUDS, side by side, the same size and height: the computer's single column, and the forty kettles' one
    plume(f, [(180, 880), (176, 830), (180, 790)], [120, 150, 180], L=88, op=0.9, seed=405, warm_root=0.45)
    steam_cloud(f, 182, cy2, 300, 190, seed=7, L=90, op=0.95, warm=0.12)
    steam_cloud(f, cx2, cy2, 300, 190, seed=7, L=90, op=0.95, warm=0.12)
    # a neighbour and her dog stop beside it and look up (in the read zone)
    person(f, 380, 1462, 160, L=8, pose='stand', facing=-1, rim=1, scarf=True)
    f.add(f'<path d="M408,1462 l6,-26 l32,-5 l10,-12 l9,6 l-4,12 l-7,25 l-7,0 l0,-15 l-27,2 l-4,13Z" fill="{g(8)}"/>')
    breath(f, 360, 1316, s=0.8)
    snowfall(f, 120, sizes=(2, 5), seed=41)
    band(f, ['as much heat as', [('forty', True), (' kettles,', False)]], seat=540)
    grain(f)
    return f


# ------------------------------------------------------------------ B5: one cup
def her_toast(f, nx, ny, L=50):
    """her, waist up, three-quarter from behind at her window, lit by the lamp at her shoulder: the big soft knit
    catching the warm light, her hair twisted up in a bun with a claw clip, her cheek turned to the glass (smiling),
    her one mug raised in a little toast to the block boiling across the street. (nx, ny) = her nape."""
    knit = f.lingrad([(0, warm(L + 8, 14, 76), 1), (0.45, g(L), 1), (1, g(L - 14), 1)], x1=0, y1=0, x2=1, y2=0)
    skin, hair = g(66), g(22)
    # the knit: dropped shoulders, soft and wide, cut by the frame's bottom
    f.add(f'<path d="M{nx - 38},{ny + 26} C{nx - 120},{ny + 32} {nx - 182},{ny + 80} {nx - 196},{ny + 190} C{nx - 210},{ny + 330} '
          f'{nx - 196},{ny + 560} {nx - 200},{ny + 800} L{nx + 196},{ny + 800} C{nx + 186},{ny + 560} {nx + 186},{ny + 340} {nx + 172},{ny + 200} '
          f'C{nx + 160},{ny + 96} {nx + 100},{ny + 40} {nx + 40},{ny + 26}Z" fill="{knit}" filter="url(#rough2)"/>')
    for k in range(4):  # the knit's cables
        xx = nx - 120 + k * 76
        f.add(f'<path d="M{xx},{ny + 130} C{xx + 12},{ny + 300} {xx - 8},{ny + 500} {xx + 6},{ny + 790}" stroke="{g(L - 9)}" '
              f'stroke-width="9" fill="none" opacity="0.45"/>')
    f.add(f'<path d="M{nx - 46},{ny + 22} C{nx - 12},{ny + 50} {nx + 34},{ny + 50} {nx + 54},{ny + 22}" stroke="{g(L + 10)}" '
          f'stroke-width="20" fill="none" stroke-linecap="round"/>')
    # the lamp's warm light along her shoulder and back (it stands at her left shoulder)
    f.add(f'<path d="M{nx - 40},{ny + 30} C{nx - 120},{ny + 36} {nx - 180},{ny + 84} {nx - 194},{ny + 200} C{nx - 206},{ny + 330} {nx - 196},{ny + 540} {nx - 198},{ny + 790}" '
          f'stroke="{HONEY}" stroke-width="14" fill="none" opacity="0.55" filter="url(#soft2)"/>')
    # her right arm raised, the sleeve bunched at the elbow, the mug held up toward the forty windows
    mx, my = nx + 116, ny - 262
    f.add(f'<path d="M{nx + 120},{ny + 120} C{nx + 190},{ny + 70} {nx + 236},{ny - 30} {nx + 214},{ny - 130} C{nx + 204},{ny - 180} {mx + 34},{my + 92} {mx + 16},{my + 86} '
          f'L{mx - 20},{my + 104} C{mx - 6},{my + 150} {nx + 166},{ny - 90} {nx + 168},{ny - 30} C{nx + 168},{ny + 30} {nx + 120},{ny + 70} {nx + 70},{ny + 90}Z" '
          f'fill="{g(L - 6)}" filter="url(#rough2)"/>')
    f.add(f'<path d="M{nx + 214},{ny - 128} C{nx + 230},{ny - 40} {nx + 196},{ny + 60} {nx + 130},{ny + 110}" stroke="{g(L - 16)}" stroke-width="8" fill="none" opacity="0.6"/>')
    for k in range(3):  # the sleeve bunched toward the wrist, a ribbed cuff
        yy = my + 110 + k * 30
        f.add(f'<path d="M{mx - 18 + k * 8},{yy} q{24},{-10} {44},{4}" stroke="{g(L - 14)}" stroke-width="6" fill="none" opacity="0.55"/>')
    f.add(f'<path d="M{mx - 24},{my + 100} L{mx + 34},{my + 92}" stroke="{g(L + 6)}" stroke-width="14" stroke-linecap="round"/>')
    # the hand round the mug, the mug, its tea and its ONE curl of steam against the dark sky
    f.add(f'<path d="M{mx - 26},{my + 98} C{mx - 30},{my + 70} {mx - 16},{my + 52} {mx},{my + 50} L{mx + 30},{my + 56} L{mx + 26},{my + 96}Z" fill="{skin}"/>')
    f.add(f'<rect x="{mx - 24}" y="{my}" width="58" height="66" rx="8" fill="{g(84)}"/>')
    f.add(f'<path d="M{mx + 34},{my + 14} q22,2 20,22 q-2,16 -20,16" stroke="{g(84)}" stroke-width="8" fill="none"/>')
    f.add(f'<ellipse cx="{mx + 5}" cy="{my + 5}" rx="26" ry="7" fill="{AMBER}"/>')
    f.add(f'<path d="M{mx - 18},{my + 60} L{mx + 26},{my + 60}" stroke="{g(66)}" stroke-width="4"/>')
    curl(f, mx + 4, my - 6, h=150, L=95, op=0.95, warm=True, sw=7)
    curl(f, mx + 16, my - 4, h=110, L=95, op=0.7, warm=False, sw=5)
    # the neck, the head turned to the glass: the cheek's edge rounded by a smile, an ear, the lamp's rim on the hair
    f.add(f'<path d="M{nx - 22},{ny + 30} L{nx - 18},{ny - 30} L{nx + 28},{ny - 34} L{nx + 36},{ny + 24}Z" fill="{skin}"/>')
    f.add(f'<ellipse cx="{nx + 4}" cy="{ny - 90}" rx="56" ry="62" fill="{hair}"/>')
    f.add(f'<path d="M{nx + 46},{ny - 124} C{nx + 66},{ny - 100} {nx + 70},{ny - 70} {nx + 60},{ny - 50} C{nx + 54},{ny - 38} {nx + 44},{ny - 30} {nx + 34},{ny - 28} '
          f'C{nx + 44},{ny - 56} {nx + 50},{ny - 92} {nx + 42},{ny - 118}Z" fill="{skin}"/>')
    f.add(f'<path d="M{nx + 52},{ny - 64} q8,6 5,16" stroke="{g(54)}" stroke-width="3" fill="none"/>')
    f.add(f'<ellipse cx="{nx + 36}" cy="{ny - 80}" rx="6" ry="11" fill="{g(72)}"/>')
    # the bun twisted up at the crown and the claw clip gripping its back (a short clip, teeth down), strands at the nape
    f.add(f'<path d="M{nx - 44},{ny - 140} C{nx - 52},{ny - 196} {nx + 30},{ny - 214} {nx + 40},{ny - 158} C{nx + 30},{ny - 136} {nx - 20},{ny - 128} {nx - 44},{ny - 140}Z" fill="{hair}"/>')
    f.add(f'<path d="M{nx - 30},{ny - 174} C{nx - 14},{ny - 196} {nx + 16},{ny - 194} {nx + 26},{ny - 170}" stroke="{g(32)}" stroke-width="5" fill="none"/>')
    f.add(f'<g transform="rotate(-12 {nx - 4} {ny - 160})">'
          f'<path d="M{nx - 30},{ny - 168} Q{nx - 4},{ny - 180} {nx + 22},{ny - 168} L{nx + 20},{ny - 156} Q{nx - 4},{ny - 166} {nx - 28},{ny - 156}Z" fill="{g(70)}"/>'
          + ''.join(f'<path d="M{nx - 24 + i * 11},{ny - 158} L{nx - 22 + i * 11},{ny - 144}" stroke="{g(70)}" stroke-width="4.5" stroke-linecap="round"/>' for i in range(5))
          + '</g>')
    for k in range(3):
        f.add(f'<path d="M{nx - 26 + k * 10},{ny - 46} C{nx - 36 + k * 10},{ny - 16} {nx - 28 + k * 9},{ny} {nx - 34 + k * 12},{ny + 18}" '
              f'stroke="{hair}" stroke-width="3.5" fill="none"/>')
    f.add(f'<path d="M{nx - 52},{ny - 128} C{nx - 62},{ny - 96} {nx - 58},{ny - 60} {nx - 40},{ny - 36}" stroke="{HONEY}" stroke-width="5" '
          f'fill="none" opacity="0.7" filter="url(#soft1)"/>')


@frame('B5')
def b5():
    f = Frame(505)
    # her room, lit by the lamp at her shoulder: warm near it, the wall cooling toward the window
    f.rect(0, 0, W, H, f.lingrad([(0, warm(38, 12, 76), 1), (0.45, g(30), 1), (1, g(24), 1)], x1=0, y1=0, x2=1, y2=0))
    f.add(f'<ellipse cx="100" cy="1150" rx="520" ry="620" fill="{HONEY}" opacity="0.2" filter="url(#soft4)"/>')
    # the window: a deep reveal and a double casement
    ox0, oy0, ox1, oy1 = 190, 660, 900, 1400
    f.rect(ox0 - 40, oy0 - 40, ox1 - ox0 + 80, oy1 - oy0 + 80, g(36))
    f.poly([(ox0 - 40, oy0 - 40), (ox0, oy0), (ox0, oy1), (ox0 - 40, oy1 + 40)], warm(48, 16, 76))
    f.poly([(ox1 + 40, oy0 - 40), (ox1, oy0), (ox1, oy1), (ox1 + 40, oy1 + 40)], g(32))
    # outside: the night, the kettle block across the street boiling away, its cloud, the street's snow
    outside = f.lingrad([(0, g(14), 1), (0.6, g(20), 1), (1, g(28), 1)])
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
        f.rect(xx, oy0, 16, oy1 - oy0, g(40))
    f.rect(ox0, oy0, ox1 - ox0, 16, g(40))
    f.rect(ox0, oy0 + (oy1 - oy0) * 0.26, ox1 - ox0, 14, g(40))
    for (cx, cy, a) in [(ox0 + 16, oy1, -0.9), (ox1 - 16, oy1, -2.3), ((ox0 + ox1) / 2 + 8, oy1, -1.0), ((ox0 + ox1) / 2 - 8, oy1, -2.1)]:
        for k in range(2):
            frost_fern(f, cx, cy, a + (k - 0.5) * 0.4, 80 + 30 * k, depth=3, L=92, op=0.4, sw=1.8, seed=int(cx + cy + k))
    # the sill (a little plant), the radiator below
    f.rect(ox0 - 60, oy1 + 30, ox1 - ox0 + 120, 36, g(46))
    f.add(f'<path d="M{ox1 - 90},{oy1 + 30} l10,-40 l40,0 l10,40Z" fill="{g(26)}"/>')
    for k in range(5):
        f.add(f'<path d="M{ox1 - 66 + k * 6},{oy1 - 10} q{(k - 2) * 12},-40 {(k - 2) * 20},-58" stroke="{g(28)}" stroke-width="7" fill="none"/>')
    for k in range(14):
        f.rect(ox0 + 20 + k * 46, oy1 + 120, 30, 190, g(34), 'rx="10"')
    # the lamp at her shoulder: a little table lamp on the side table, its shade glowing
    f.rect(-20, 1300, 210, 26, g(30))
    f.rect(0, 1326, 22, 600, g(26))
    f.rect(84, 1200, 16, 100, g(26))
    f.ellipse(92, 1298, 46, 10, g(28))
    f.add(f'<rect x="-120" y="900" width="420" height="460" fill="{HONEY}" opacity="0.4" filter="url(#glow2)"/>')
    f.poly([(36, 1200), (148, 1200), (126, 1090), (58, 1090)], f.lingrad([(0, HONEY_CORE, 1), (1, HONEY, 1)]))
    # her, at the glass, one small cup raised to a block's worth of boiling kettles
    her_toast(f, 300, 1150, L=50)
    band(f, ["That's a lot", 'of tea.'], seat=540, L=86)
    grain(f)
    return f


# ------------------------------------------------------------------ B6: warmth drifting away over the frosted city
def roof_fan(f, cx, cy, r=52, tilt=0.5, warm_op=0.5):
    """a big round roof fan tilted toward us: the drum, the guard ring, five blades round the hub, warm air off it"""
    ry = r * tilt
    f.add(f'<path d="M{cx - r},{cy} L{cx - r},{cy + 34} A{r},{ry} 0 0 0 {cx + r},{cy + 34} L{cx + r},{cy}Z" fill="{g(22)}"/>')
    f.ellipse(cx, cy, r, ry, g(44))
    f.ellipse(cx, cy, r * 0.88, ry * 0.88, g(10))
    blades = ''
    for k in range(5):
        a0 = k * 2 * math.pi / 5 + 0.3
        a1 = a0 + 0.75
        p0 = (cx + math.cos(a0) * r * 0.16, cy + math.sin(a0) * ry * 0.16)
        p1 = (cx + math.cos(a0) * r * 0.84, cy + math.sin(a0) * ry * 0.84)
        p2 = (cx + math.cos(a1) * r * 0.8, cy + math.sin(a1) * ry * 0.8)
        blades += f'M{p0[0]:.1f},{p0[1]:.1f} L{p1[0]:.1f},{p1[1]:.1f} Q{cx + math.cos(a0 + 0.4) * r * 0.95:.1f},{cy + math.sin(a0 + 0.4) * ry * 0.95:.1f} {p2[0]:.1f},{p2[1]:.1f}Z '
    f.add(f'<path d="{blades}" fill="{g(36)}"/>')
    f.ellipse(cx, cy, r * 0.14, ry * 0.14, g(52))
    f.add(f'<ellipse cx="{cx}" cy="{cy}" rx="{r}" ry="{ry}" fill="none" stroke="{g(60)}" stroke-width="3"/>')
    f.ellipse(cx, cy - ry * 0.6, r * 0.9, ry * 1.2, HONEY, f'opacity="{warm_op}" filter="url(#soft2)"')


def drift(f, pts, widths, cols, ops, seed=0, filt='steam'):
    """a plume along a path whose colour and strength change along it (warm at its root, greying, thinning)"""
    r = random.Random(seed)
    for (x, y), w, c, o in zip(pts, widths, cols, ops):
        s = ''
        for k in range(3):
            s += (f'<ellipse cx="{x + r.uniform(-0.25, 0.25) * w:.0f}" cy="{y + r.uniform(-0.2, 0.2) * w:.0f}" '
                  f'rx="{w * r.uniform(0.45, 0.65):.0f}" ry="{w * r.uniform(0.3, 0.45):.0f}"/>')
        f.add(f'<g fill="{c}" opacity="{o:.2f}" filter="url(#{filt})">{s}</g>')


@frame('B6')
def b6():
    f = Frame(606)
    sky(f, [(0, 13), (0.35, 18), (0.65, 26), (0.9, 34), (1, 37)], 0, 1210)
    cloud(f, 760, 140, 820, 220, 21, 0.85, seed=62)
    # the city on the right along the far shore: stucco blocks, their windows FROSTED (the heat is not reaching them)
    rr = random.Random(66)
    far_city(f, 1120, x0=560, x1=W + 30, L=26, heights=(60, 120), seed=661, density=0.5, warm_frac=0.0)
    FROST.update(glint_p=0.5, glint_k=0.55)
    x = 600
    while x < W + 20:
        bw = rr.uniform(96, 140)
        top = 1046 + rr.uniform(-10, 24) - (x - 600) * 0.02
        block(f, x, x + bw, top, 1196, 4, max(2, int(bw / 34)), L=27 + rr.uniform(-3, 3), states=lambda r_, c: 'frost',
              chimneys=2, frost_L=62, seed=int(x), win_w=0.5, win_h=0.56)
        x += bw + rr.uniform(-4, 6)
    FROST.update(glint_p=0.45, glint_k=0.34)
    # two other data centers far along the shore: their warmth thins away too (the usual way, everywhere)
    for bx, bw2, s_ in ((404, 90, 1.0), (512, 62, 0.75)):
        f.rect(bx, 1190 - 38 * s_, bw2, 38 * s_ + 8, g(30))
        f.rect(bx, 1190 - 38 * s_, bw2, 4, g(52))
        for k in range(int(bw2 / 12)):
            f.rect(bx + 5 + k * 12, 1174, 3, 2, g(92, -8))
        for j in range(2):
            fx_ = bx + bw2 * (0.3 + 0.4 * j)
            drift(f, [(fx_, 1140 - 4 * s_), (fx_ + 4, 1110), (fx_ + 16, 1078), (fx_ + 40, 1052), (fx_ + 74, 1036)],
                  [22 * s_, 28 * s_, 34 * s_, 38 * s_, 36 * s_], [warm(76, 20, 78), g(70), g(64), g(58), g(52)],
                  [0.8, 0.7, 0.55, 0.4, 0.25], seed=bx + j, filt='steam2')
    # the blank building (left) and its three big roof fans, tilted to us
    f.poly([(-10, 1210), (-10, 1056), (360, 1050), (380, 1064), (380, 1210)], f.lingrad([(0, g(28), 1), (1, g(18), 1)]))
    snowcap(f, -10, 362, 1054, th=5, L=46)
    for yy in (1110, 1170):
        f.add(f'<rect x="10" y="{yy - 5}" width="340" height="12" fill="{g(80, -10)}" opacity="0.18" filter="url(#soft2)"/>')
        for k in range(16):
            f.rect(14 + k * 22, yy, 5, 3, g(94, -9))
    fans = [(70, 1022), (190, 1018), (310, 1014)]
    for (fx, fy) in fans:
        roof_fan(f, fx, fy, r=52, tilt=0.52, warm_op=0.55)
    # THE PLUME: three warm columns off the fans, joining, bending away over the frozen bay, greying and thinning,
    # its last wisps lost just above the frosted windows that need it
    for k, (fx, fy) in enumerate(fans):
        drift(f, [(fx, fy - 40), (fx + 8, fy - 100), (fx + 24, fy - 160)], [62, 78, 96],
              [warm(84, 34, 80), warm(82, 22, 78), warm(78, 14, 76)], [0.92, 0.88, 0.85], seed=80 + k)
    path = [(200, 840), (330, 800), (480, 798), (620, 822), (750, 864), (860, 912), (950, 956)]
    widths = [200, 220, 214, 196, 170, 140, 104]
    cols = [warm(78, 14, 76), g(74), g(70), g(66), g(62), g(58), g(56)]
    ops = [0.88, 0.84, 0.78, 0.68, 0.56, 0.44, 0.34]
    drift(f, path, widths, cols, ops, seed=67)
    # its last wisps coming apart just above the frosted roofs
    rw = random.Random(68)
    for k in range(9):
        x_ = 960 + k * 18 + rw.uniform(-10, 10)
        y_ = 990 + k * 4 + rw.uniform(-8, 8)
        f.add(f'<ellipse cx="{x_:.0f}" cy="{y_:.0f}" rx="{rw.uniform(16, 30):.0f}" ry="{rw.uniform(6, 11):.0f}" fill="{g(60)}" '
              f'opacity="{0.34 - k * 0.03:.2f}" filter="url(#steam2)"/>')
    f.add(f'<path d="M80,1000 C120,900 170,860 280,800" stroke="{HONEY}" stroke-width="80" opacity="0.22" fill="none" filter="url(#soft4)"/>')
    # the frozen bay: a vast field, a far channel steaming, pressure ridges, the lone ice fisher
    ice = f.lingrad([(0, g(44), 1), (0.4, g(37), 1), (1, g(20), 1)])
    f.rect(0, 1210, W, 710, ice)
    f.add(f'<path d="M-10,1246 C300,1236 600,1254 1090,1240 L1090,1262 C700,1272 400,1260 -10,1270Z" fill="{g(15)}"/>')
    plume(f, [(200, 1236), (520, 1232), (860, 1236)], [70, 80, 70], L=62, op=0.35, filt='steam2', seed=69)
    for k in range(9):
        yy = 1320 + k * 66
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

    m, mms = street_wall(f, quad, pieces, frost_L=58, seed=79, states=states, ornate=True)
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


def warm_night(f, x0, y0, x1, y1, seed=81, glow_paths=(), density=1.0):
    """the night through the glass with its warm lights soft and close (the city across the harbour, out of focus
    behind the frost): through any line cleared in the frost the warm city glows"""
    cid = f.uid('pane')
    f.defs.append(f'<clipPath id="{cid}"><rect x="{x0}" y="{y0}" width="{x1 - x0}" height="{y1 - y0}"/></clipPath>')
    f.add(f'<g clip-path="url(#{cid})">')
    f.rect(x0, y0, x1 - x0, y1 - y0, f.lingrad([(0, g(12), 1), (0.6, g(17), 1), (1, g(22), 1)]))
    rr = random.Random(seed)
    s = ''
    for k in range(int(320 * density)):
        x = rr.uniform(x0, x1)
        y = y0 + (y1 - y0) * (rr.uniform(0.0, 1.0) ** 0.7)
        s += f'<circle cx="{x:.0f}" cy="{y:.0f}" r="{rr.uniform(5, 15):.0f}" opacity="{rr.uniform(0.35, 0.9):.2f}"/>'
    f.add(f'<g fill="{HONEY}" filter="url(#soft1)">{s}</g>')
    for d, w in glow_paths:
        # the warm light running in each cleared line: deep amber at its edges, honey to its core
        f.add(f'<path d="{d}" stroke="{AMBER}" stroke-width="{w * 0.95:.0f}" fill="none" stroke-linecap="round" stroke-linejoin="round" '
              f'opacity="0.9" filter="url(#soft1)"/>')
        f.add(f'<path d="{d}" stroke="{HONEY}" stroke-width="{w * 0.55:.0f}" fill="none" stroke-linecap="round" stroke-linejoin="round" '
              f'opacity="0.95" filter="url(#soft1)"/>')
        f.add(f'<path d="{d}" stroke="{HONEY_CORE}" stroke-width="{max(2, w * 0.2):.0f}" fill="none" stroke-linecap="round" '
              f'stroke-linejoin="round" opacity="0.8"/>')
    f.add('</g>')


def finger_drawing(f, strokes, x0, y0, x1, y1, seed=91, warm_cast=0.12, drips=(), ferns=46, L=88):
    """a frosted pane with a drawing a fingertip has cleared through it: wobbly strokes, thick and thin, frost crumbs
    pushed to their edges, a drip running from one; the warm night glowing through every line.
    strokes: [(points, width)]; drips: [(x, y, length)]"""
    runs_all = []
    for i, (pts, w) in enumerate(strokes):
        runs, wp = hand_runs(pts, w, seed=seed + i * 13, amp=w * 0.2, step=12, var=0.3)
        runs_all.append((runs, wp, w))
    dpaths = [(f'M{dx},{dy} C{dx + 2},{dy + dl * 0.4} {dx - 2},{dy + dl * 0.7} {dx + 1},{dy + dl + 6}', 14) for (dx, dy, dl) in drips]
    warm_night(f, x0, y0, x1, y1, seed=seed, glow_paths=[(smooth_d(wp), w) for _, wp, w in runs_all] + dpaths)
    mid = f.uid('m')
    mstr = ''.join(f'<path d="{d}" stroke="black" stroke-width="{ww:.1f}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'
                   for runs, _, _ in runs_all for d, ww in runs)
    for (dx, dy, dl) in drips:
        mstr += (f'<path d="M{dx},{dy} C{dx + 2},{dy + dl * 0.4} {dx - 2},{dy + dl * 0.7} {dx + 1},{dy + dl}" stroke="black" stroke-width="10" fill="none" '
                 f'stroke-linecap="round"/><ellipse cx="{dx + 1}" cy="{dy + dl + 6}" rx="8" ry="10" fill="black"/>')
    f.defs.append(f'<filter id="{mid}b"><feGaussianBlur stdDeviation="1.6"/></filter>'
                  f'<mask id="{mid}" maskUnits="userSpaceOnUse" x="0" y="0" width="{W}" height="{H}">'
                  f'<rect x="0" y="0" width="{W}" height="{H}" fill="white"/><g filter="url(#{mid}b)">{mstr}</g></mask>')
    f.add(f'<g mask="url(#{mid})">')
    frost_field(f, x0, y0, x1 - x0, y1 - y0, L=L, op=0.95, density=ferns, seed=seed, base_op=0.97)
    if warm_cast > 0:
        f.add(f'<rect x="{x0}" y="{y0}" width="{x1 - x0}" height="{y1 - y0}" fill="{HONEY}" opacity="{warm_cast}" filter="url(#soft4)"/>')
    f.add('</g>')
    # the warm light through the lines catching the frost at their edges, and the crumbs her finger pushed aside
    rr = random.Random(seed + 5)
    for runs, wp, w in runs_all:
        f.add(f'<path d="{smooth_d(wp)}" stroke="{HONEY}" stroke-width="{w * 2.0:.0f}" fill="none" stroke-linecap="round" '
              f'stroke-linejoin="round" opacity="0.22" filter="url(#soft2)"/>')
        crumbs = ''
        for i in range(1, len(wp) - 1):
            (xa, ya), (xb, yb) = wp[i - 1], wp[i + 1]
            a = math.atan2(yb - ya, xb - xa) + math.pi / 2
            for side in (-1, 1):
                if rr.random() < 0.35:
                    off = w * rr.uniform(0.62, 0.85)
                    x, y = wp[i][0] + math.cos(a) * off * side, wp[i][1] + math.sin(a) * off * side
                    crumbs += (f'<ellipse cx="{x:.1f}" cy="{y:.1f}" rx="{rr.uniform(1.5, 3.2):.1f}" ry="{rr.uniform(1.2, 2.4):.1f}" '
                               f'transform="rotate({math.degrees(a):.0f} {x:.1f} {y:.1f})"/>')
        f.add(f'<g fill="{g(99)}" opacity="0.85">{crumbs}</g>')
    for (dx, dy, dl) in drips:
        f.add(f'<ellipse cx="{dx + 1}" cy="{dy + dl + 6}" rx="6" ry="8" fill="{HONEY_CORE}" opacity="0.8"/>')
        f.add(f'<circle cx="{dx - 1}" cy="{dy + dl + 3}" r="2.4" fill="{g(99)}"/>')


def plan_strokes(ox=0, oy=0, k=1.0):
    """her drawing of the plan: the new data center at the harbour's edge (a box, a door, two fans), the line along
    the shore and up to HER block with its little tower, and the year. Points in the B8 pane's coordinates."""
    def P(pts):
        return [(ox + x * k, oy + y * k) for x, y in pts]
    box = P([(214, 1206), (402, 1200), (406, 1322), (218, 1328), (214, 1206)])
    door = P([(288, 1326), (290, 1262), (330, 1260), (332, 1324)])
    fan1 = P([(232, 1196), (248, 1182), (270, 1180), (286, 1192), (270, 1206), (246, 1206), (232, 1196)])
    fan2 = P([(330, 1192), (348, 1178), (370, 1178), (386, 1190), (370, 1204), (346, 1204), (330, 1192)])
    run = P([(406, 1290), (470, 1300), (560, 1292), (640, 1254), (700, 1200), (740, 1140), (770, 1100)])
    home = P([(770, 1180), (770, 1010), (790, 1010), (806, 958), (822, 1010), (874, 1010), (874, 1180), (770, 1180)])
    def sq(x, y):
        return P([(x, y), (x + 20, y), (x + 20, y + 20), (x, y + 20), (x, y)])
    wins = sq(794, 1046), sq(834, 1046), sq(794, 1100), sq(834, 1100)
    two1 = P([(318, 760), (338, 728), (380, 722), (404, 748), (398, 784), (352, 826), (322, 858), (410, 856)])
    zero = P([(478, 734), (450, 760), (444, 806), (458, 846), (488, 856), (514, 832), (520, 784), (506, 744), (478, 734)])
    two2 = P([(556, 760), (576, 728), (618, 722), (642, 748), (636, 784), (590, 826), (560, 858), (648, 856)])
    seven = P([(668, 734), (744, 732), (716, 790), (692, 852)])
    s = [(box, 18), (door, 15), (fan1, 11), (fan2, 11), (run, 19), (home, 16)]
    s += [(w_, 9) for w_ in wins]
    s += [(two1, 24), (zero, 24), (two2, 24), (seven, 24)]
    return s


@frame('B8')
def b8():
    f = Frame(808)
    x0, y0, x1, y1 = 120, 650, 960, 1500
    room_window(f, x0, y0, x1, y1)
    finger_drawing(f, plan_strokes(), x0, y0, x1, y1, seed=91, warm_cast=0.12, drips=[(404, 1330, 96), (321, 862, 70)])
    f.rect(x0 - 12, y0 - 12, x1 - x0 + 24, 14, g(26))
    room_sill(f, x0, x1, y1)
    knit_hand(f, (692, 856))
    band(f, ['starting', 'next year.'], seat=540, L=86)
    grain(f, 0.07)
    return f


def frost_hall(f, quad_door, vp, n=5, L=90, cool=True, pipe=True, seed=950, lines_w=7):
    """the plan's hall seen through the drawn door: dark, two rows of machines drawn in glittering frost lines, their
    lights in rows, a cool glow at the far end, the pipe of cool water waiting on the floor (the one painted thing)"""
    (dx0, dy0), (dx1, dy1) = quad_door
    vx, vy = vp
    f.rect(dx0, dy0, dx1 - dx0, dy1 - dy0, f.lingrad([(0, g(9), 1), (0.6, g(13), 1), (1, g(16), 1)]))
    if cool:
        f.add(f'<ellipse cx="{vx}" cy="{vy}" rx="{(dx1 - dx0) * 0.34:.0f}" ry="{(dy1 - dy0) * 0.2:.0f}" fill="{g(72, -10)}" opacity="0.55" filter="url(#soft4)"/>')
        f.add(f'<ellipse cx="{vx}" cy="{vy}" rx="{(dx1 - dx0) * 0.1:.0f}" ry="{(dy1 - dy0) * 0.07:.0f}" fill="{g(92, -8)}" opacity="0.8" filter="url(#soft3)"/>')
    # the far wall's opening (the hall's end) and the floor / ceiling edges converging
    fw, fh = (dx1 - dx0) * 0.16, (dy1 - dy0) * 0.17
    fx0, fy0, fx1, fy1 = vx - fw / 2, vy - fh * 0.6, vx + fw / 2, vy + fh * 0.4
    for side in (-1, 1):
        xa = dx0 if side < 0 else dx1
        xf = fx0 if side < 0 else fx1
        # a row of machines on this side, receding
        m = homography([(xa, dy0 + (dy1 - dy0) * 0.06), (xf, fy0), (xf, fy1), (xa, dy1 - (dy1 - dy0) * 0.04)])
        for i in range(n):
            u0, u1 = (i + 0.08) / n, (i + 0.92) / n
            t = 1 - (u0 + u1) / 2
            pts = [m(u0, 0.02), m(u1, 0.02), m(u1, 0.98), m(u0, 0.98), m(u0, 0.02)]
            frost_stroke(f, pts, w=max(2.0, lines_w * (0.35 + 0.65 * t)), seed=seed + i * 7 + (50 if side > 0 else 0), L=L, op=0.9,
                         feathers=t > 0.5, glints=1 if t > 0.4 else 0, glow=t > 0.3)
            # its lights: little glints in rows, like a facade's windows
            for j in range(9):
                v = 0.1 + 0.8 * j / 8
                for c in range(2):
                    uu = u0 + (u1 - u0) * (0.32 + 0.36 * c)
                    x, y = m(uu, v)
                    f.circle(x, y, max(1.2, 4 * t), g(95, -8), f'opacity="{0.6 + 0.35 * t:.2f}"')
    frost_stroke(f, [(fx0, fy0), (fx1, fy0), (fx1, fy1), (fx0, fy1), (fx0, fy0)], w=3, seed=seed + 99, L=L, op=0.8, feathers=False, glints=0)
    if pipe:
        # the pipe of cool water on the floor, waiting, running into the depth (painted: it is the real thing)
        px0, px1 = vx - 46, vx + 46
        f.add(f'<path d="M{px0},{dy1 + 4} L{vx - 5},{fy1} L{vx + 5},{fy1} L{px1},{dy1 + 4}Z" fill="{g(74, -12)}" opacity="0.95"/>')
        f.add(f'<path d="M{px0 + 12},{dy1 + 4} L{vx - 2},{fy1}" stroke="{g(92, -8)}" stroke-width="5" opacity="0.8"/>')


@frame('B9')
def b9():
    f = Frame(909)
    # pushed in on the little box she drew, until its door is the frame: the frost all round, the warm city glowing
    # through it, the door swung open toward us, a deep dark hall beyond with a cool glow far inside
    f.rect(0, 0, W, H, g(20))
    rr = random.Random(92)
    bl = ''
    for k in range(70):
        x, y = rr.uniform(-60, W + 60), rr.uniform(0, H)
        bl += f'<circle cx="{x:.0f}" cy="{y:.0f}" r="{rr.uniform(30, 90):.0f}" opacity="{rr.uniform(0.3, 0.75):.2f}"/>'
    f.add(f'<g fill="{HONEY}" filter="url(#soft4)">{bl}</g>')
    frost_field(f, 0, 0, W, H, L=80, op=0.9, density=70, seed=93, base_op=0.7)
    f.add(f'<rect x="0" y="0" width="{W}" height="{H}" fill="{g(10)}" opacity="0.22" filter="url(#soft4)"/>')
    # the drawn door's opening: its cleared outline (thick: we are close), the warm night glowing in it
    dx0, dy0, dx1, dy1 = 330, 700, 790, 1660
    frost_hall(f, ((dx0, dy0), (dx1, dy1)), (566, 1190), n=5, L=90)
    outline = [(dx0 - 6, dy1 + 30), (dx0 - 2, dy0 + 10), (dx0 + 30, dy0 - 18), (dx1 - 24, dy0 - 20), (dx1 + 6, dy0 + 6), (dx1 + 8, dy1 + 30)]
    runs, wp = hand_runs(outline, 64, seed=95, amp=10, step=26, var=0.22)
    d = smooth_d(wp)
    f.add(f'<path d="{d}" stroke="{g(14)}" stroke-width="72" fill="none" stroke-linecap="round" stroke-linejoin="round" filter="url(#rough)"/>')
    f.add(f'<path d="{d}" stroke="{AMBER}" stroke-width="54" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="0.95" filter="url(#soft2)"/>')
    f.add(f'<path d="{d}" stroke="{HONEY}" stroke-width="30" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="0.95" filter="url(#soft1)"/>')
    f.add(f'<path d="{d}" stroke="{HONEY_CORE}" stroke-width="10" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="0.85"/>')
    # the frost's broken crystal edge along the cleared line (ice feathers growing back into it, a few glints)
    rc = random.Random(96)
    for i in range(1, len(wp) - 1, 2):
        (xa, ya), (xb, yb) = wp[i - 1], wp[i + 1]
        a = math.atan2(yb - ya, xb - xa) + math.pi / 2
        for side in (-1, 1):
            if rc.random() < 0.55:
                off = rc.uniform(36, 44)
                x, y = wp[i][0] + math.cos(a) * off * side, wp[i][1] + math.sin(a) * off * side
                frost_fern(f, x, y, a + (math.pi if side > 0 else 0) + rc.uniform(-0.5, 0.5), rc.uniform(26, 44), depth=2, L=99,
                           op=0.75, sw=2.4, seed=960 + i * 2 + (side > 0))
    for i in range(5):
        x, y = wp[rc.randrange(len(wp))]
        glint(f, x + rc.uniform(-40, 40), y + rc.uniform(-10, 10), rc.uniform(12, 20))
    # the door: a sheet of frost swung open toward us on its left hinge, its edge catching the candle's warm light
    leaf = [(dx0 - 30, dy0 + 10), (170, dy0 - 100), (170, dy1 + 150), (dx0 - 30, dy1 + 20)]
    lf = f.lingrad([(0, g(86), 1), (1, g(74), 1)], x1=1, y1=0, x2=0, y2=0)
    f.poly(leaf, lf)
    cid = f.uid('leaf')
    f.defs.append(f'<clipPath id="{cid}"><polygon points="{" ".join(f"{x:.0f},{y:.0f}" for x, y in leaf)}"/></clipPath>')
    f.add(f'<g clip-path="url(#{cid})">')
    for k in range(9):
        a_ = bil(leaf, 1.0, 0.08 + k * 0.11)
        frost_fern(f, a_[0], a_[1], 0.0 + rr.uniform(-0.4, 0.4), 150, depth=3, L=99, op=0.6, sw=2.6, seed=940 + k)
    for k in range(6):
        x, y = bil(leaf, rr.uniform(0.1, 0.9), rr.uniform(0.05, 0.95))
        glint(f, x, y, rr.uniform(10, 18))
    f.add('</g>')
    f.add(f'<path d="M170,{dy0 - 100} L170,{dy1 + 150}" stroke="{HONEY}" stroke-width="10" opacity="0.8" filter="url(#soft1)"/>')
    f.add(f'<path d="M170,{dy0 - 100} L170,{dy1 + 150}" stroke="{HONEY_CORE}" stroke-width="3"/>')
    # the candle's warmth from below, the cold from above
    f.add(f'<rect x="-100" y="1560" width="{W + 200}" height="500" fill="{HONEY}" opacity="0.22" filter="url(#soft4)"/>')
    # her fingertip (in the knit sleeve) at the door's edge: she has just swung it open
    knit_hand(f, (180, 1290), mirror=True, reach=1.15, rot=-28)
    band(f, ['So how would', 'that work?'], seat=540, L=86)
    grain(f, 0.07)
    return f


def dim_night(f, seed=94, n=46):
    """the dark glass of her window seen from inside the drawing: the night, the warm city faint and far beyond"""
    f.rect(0, 0, W, H, f.lingrad([(0, g(10), 1), (0.6, g(14), 1), (1, g(17), 1)]))
    rr = random.Random(seed)
    s = ''
    for k in range(n):
        s += (f'<circle cx="{rr.uniform(0, W):.0f}" cy="{rr.uniform(640, H):.0f}" r="{rr.uniform(6, 16):.0f}" '
              f'opacity="{rr.uniform(0.08, 0.2):.2f}"/>')
    f.add(f'<g fill="{HONEY}" filter="url(#soft2)">{s}</g>')


def frost_person(f, x, yfeet, h, seed=0, w=3.0):
    """a person drawn in frost by a fingertip: head, coat, legs, one arm out to a machine"""
    hd = h / 7.5
    head = [(x + hd * 0.45 * math.sin(t), yfeet - h + hd * 0.55 - hd * 0.5 * math.cos(t)) for t in [i * math.pi / 5 for i in range(11)]]
    frost_stroke(f, head, w=w, seed=seed, feathers=False, glints=0, glow=False)
    frost_stroke(f, [(x - hd * 0.5, yfeet - h * 0.78), (x - hd * 0.9, yfeet - h * 0.3), (x + hd * 0.9, yfeet - h * 0.3),
                     (x + hd * 0.5, yfeet - h * 0.78), (x - hd * 0.5, yfeet - h * 0.78)], w=w, seed=seed + 1, feathers=False, glints=0, glow=False)
    frost_stroke(f, [(x - hd * 0.35, yfeet - h * 0.3), (x - hd * 0.45, yfeet)], w=w, seed=seed + 2, feathers=False, glints=0, glow=False)
    frost_stroke(f, [(x + hd * 0.35, yfeet - h * 0.3), (x + hd * 0.45, yfeet)], w=w, seed=seed + 3, feathers=False, glints=0, glow=False)
    frost_stroke(f, [(x + hd * 0.5, yfeet - h * 0.72), (x + hd * 1.7, yfeet - h * 0.58)], w=w, seed=seed + 4, feathers=False, glints=1, glow=False)


@frame('B10')
def b10():
    f = Frame(1010)
    # inside her frost drawing: the planned hall drawn in glittering frost on the dark glass, the warm city faint beyond;
    # only the water is painted, cool where it comes in, warming machine by machine, honey where it leaves (near)
    dim_night(f)
    for (cx, cy, a) in [(0, 980, 0.15), (0, 1500, -0.15), (W, 760, math.pi), (200, H, -1.3), (W, 1880, math.pi + 0.5)]:
        for k in range(2):
            frost_fern(f, cx, cy, a + (k - 0.5) * 0.3, 220 + 40 * k, depth=3, L=92, op=0.3, sw=2.0, seed=int(cx * 7 + cy + k))
    # the hall: floor and ceiling edges running to the far end at the left, the far wall
    frost_stroke(f, [(0, 1560), (330, 1110)], w=7, seed=1001, op=0.85)
    frost_stroke(f, [(330, 1110), (330, 930), (0, 700)], w=6, seed=1002, op=0.8)
    frost_stroke(f, [(330, 1110), (372, 1110)], w=4, seed=1003, op=0.7, feathers=False, glints=0)
    frost_stroke(f, [(330, 930), (372, 930)], w=4, seed=1004, op=0.7, feathers=False, glints=0)
    frost_stroke(f, [(1080, 1720), (372, 1110)], w=6, seed=1005, op=0.6, glints=1)
    # the row of giant computers on the right, receding to the far end, each with its heat glowing inside
    quad = [(372, 930), (1010, 640), (1010, 1690), (372, 1110)]
    m = homography(quad)
    n = 5
    for i in range(n):
        u0, u1 = i / n + 0.025, (i + 1) / n - 0.025
        t = (u0 + u1) / 2
        c = m(t, 0.5)
        wd = abs(m(u1, 0.5)[0] - m(u0, 0.5)[0])
        hh = abs(m(u0, 1.0)[1] - m(u0, 0.0)[1])
        f.add(f'<ellipse cx="{c[0]:.0f}" cy="{c[1]:.0f}" rx="{wd * 0.42:.0f}" ry="{hh * 0.36:.0f}" fill="{HONEY}" opacity="0.2" filter="url(#glow2)"/>')
        frost_stroke(f, [m(u0, 0.0), m(u1, 0.0), m(u1, 1.0), m(u0, 1.0), m(u0, 0.0)], w=max(3.0, 9 * t), seed=1100 + i * 9, op=0.95,
                     glints=1 + int(2 * t))
        for j in range(7):
            v = 0.1 + 0.12 * j
            a_, b_ = m(u0 + 0.03, v), m(u1 - 0.03, v)
            frost_stroke(f, [a_, b_], w=max(1.5, 3.6 * t), seed=1200 + i * 20 + j, op=0.55, feathers=False, glints=0, glow=False)
            for cc in range(3):
                x, y = m(u0 + (u1 - u0) * (0.25 + 0.25 * cc), v + 0.05)
                f.circle(x, y, max(1.2, 3.5 * t), g(95, -8), 'opacity="0.8"')
    # a person at the far end, drawn in the same frost hand (the scale of a big new hall)
    frost_person(f, 352, 1106, 64, seed=1300, w=2.2)
    # THE WATER: one loop. It comes in COOL along the left (pale blue-grey, quiet), runs to the far end, turns, and comes
    # back along the machines' feet; each machine pours its heat down into it, so it warms machine by machine and
    # leaves HONEY only at the near end
    COOL = g(70, -12)
    cool_leg = [(-30, 1700), (120, 1500), (250, 1330), (336, 1214), (360, 1180)]
    for k in range(len(cool_leg) - 1):
        (xa, ya), (xb, yb) = cool_leg[k], cool_leg[k + 1]
        wa = 26 - 5 * k
        f.add(f'<line x1="{xa}" y1="{ya}" x2="{xb}" y2="{yb}" stroke="{COOL}" stroke-width="{wa}" stroke-linecap="round"/>')
        f.add(f'<line x1="{xa}" y1="{ya}" x2="{xb}" y2="{yb}" stroke="{g(80, -10)}" stroke-width="{max(2, wa * 0.25):.0f}" opacity="0.6" stroke-linecap="round"/>')
    a = m(0.0, 1.06)
    f.add(f'<path d="M360,1180 C366,1170 {a[0] - 4:.0f},{a[1] + 6:.0f} {a[0]:.0f},{a[1]:.0f}" stroke="{COOL}" stroke-width="8" fill="none"/>')
    stops = [m(i / n, 1.06) for i in range(n + 1)] + [(1120, 1880)]
    cols = [COOL, warm(76, 10, 78), warm(79, 20, 79), warm(81, 30, 80), warm(83, 40, 80), HONEY]
    for k in range(len(stops) - 1):
        (xa, ya), (xb, yb) = stops[k], stops[k + 1]
        wa = 8 + 34 * (k / (len(stops) - 1))
        col = cols[min(k, len(cols) - 1)]
        f.add(f'<line x1="{xa:.0f}" y1="{ya:.0f}" x2="{xb:.0f}" y2="{yb:.0f}" stroke="{col}" stroke-width="{wa:.0f}" stroke-linecap="round"/>')
        if k >= 2:
            f.add(f'<line x1="{xa:.0f}" y1="{ya:.0f}" x2="{xb:.0f}" y2="{yb:.0f}" stroke="{col}" stroke-width="{wa * 2.4:.0f}" '
                  f'opacity="{0.08 * k:.2f}" stroke-linecap="round" filter="url(#soft2)"/>')
    # each machine pouring its glow down into the pipe at its feet
    for i in range(n):
        t = (i + 0.5) / n
        a_, b_ = m(t, 0.84), m(t, 1.05)
        f.add(f'<path d="M{a_[0]:.0f},{a_[1]:.0f} L{b_[0]:.0f},{b_[1]:.0f}" stroke="{HONEY}" stroke-width="{10 + 26 * t:.0f}" '
              f'opacity="0.5" stroke-linecap="round" filter="url(#soft2)"/>')
        f.add(f'<path d="M{a_[0]:.0f},{a_[1]:.0f} L{b_[0]:.0f},{b_[1]:.0f}" stroke="{HONEY_CORE}" stroke-width="{3 + 6 * t:.0f}" '
              f'opacity="0.85" stroke-linecap="round"/>')
    band(f, ['with water', 'in pipes.'], seat=540, L=86)
    grain(f, 0.07)
    return f


# ------------------------------------------------------------------ B11: home by home, up the street
def tram(f, fx, fy, s=1.0, L=40):
    """a Helsinki tram coming down its rails toward us (three-quarter front): rounded nose, big lit windscreen, the
    destination sign, headlights, lit side windows receding up the street, the pantograph up to the wire"""
    w, h = 170 * s, 190 * s
    # the side, receding up-left toward the street's far end
    side = [(fx, fy - h), (fx - 150 * s, fy - h * 0.72), (fx - 150 * s, fy - h * 0.12), (fx, fy)]
    f.poly(side, g(L - 6))
    for i in range(4):
        u0, u1 = 0.08 + i * 0.22, 0.24 + i * 0.22
        p = [bil(side, u0, 0.2), bil(side, u1, 0.2), bil(side, u1, 0.48), bil(side, u0, 0.48)]
        f.poly(p, g(86, -6))
    f.poly([bil(side, 0, 0.62), bil(side, 1, 0.62), bil(side, 1, 0.7), bil(side, 0, 0.7)], g(L + 12))
    # the front: rounded nose, the windscreen lit, the sign above, two headlights
    f.add(f'<path d="M{fx},{fy - h} C{fx + w * 0.2},{fy - h * 1.04} {fx + w * 0.8},{fy - h * 1.04} {fx + w},{fy - h * 0.98} '
          f'L{fx + w * 1.02},{fy - h * 0.08} C{fx + w * 0.7},{fy + h * 0.02} {fx + w * 0.3},{fy + h * 0.02} {fx},{fy}Z" fill="{g(L)}"/>')
    f.add(f'<path d="M{fx + w * 0.08},{fy - h * 0.84} L{fx + w * 0.92},{fy - h * 0.82} L{fx + w * 0.9},{fy - h * 0.42} L{fx + w * 0.1},{fy - h * 0.44}Z" fill="{g(84, -6)}"/>')
    f.add(f'<rect x="{fx + w * 0.22}" y="{fy - h * 0.97}" width="{w * 0.56}" height="{h * 0.09}" rx="3" fill="{g(94)}"/>')
    for hx in (0.18, 0.82):
        f.circle(fx + w * hx, fy - h * 0.22, 9 * s, g(98))
        f.add(f'<circle cx="{fx + w * hx}" cy="{fy - h * 0.22}" r="{30 * s}" fill="{g(95)}" opacity="0.35" filter="url(#soft2)"/>')
    # the headlights' light on the snow ahead of it
    f.add(f'<path d="M{fx + w * 0.1},{fy} L{fx + w * 0.9},{fy} L{fx + w * 1.6},{fy + 160 * s} L{fx - w * 0.4},{fy + 160 * s}Z" fill="{g(80)}" opacity="0.18" filter="url(#soft3)"/>')
    # wheels on the rails, the pantograph up to its wire
    f.rect(fx + w * 0.05, fy - 4, w * 0.9, 10 * s, g(14))
    f.add(f'<path d="M{fx + w * 0.4},{fy - h * 1.02} L{fx + w * 0.55},{fy - h * 1.3} L{fx + w * 0.7},{fy - h * 1.02} M{fx + w * 0.42},{fy - h * 1.3} L{fx + w * 0.7},{fy - h * 1.3}" '
          f'stroke="{g(18)}" stroke-width="{3 * s:.1f}" fill="none"/>')
    return (fx + w * 0.55, fy - h * 1.3)


@frame('B11')
def b11():
    f = Frame(1111)
    sky(f, [(0, 13), (0.5, 20), (1, 32)], 0, 1200)
    cloud(f, 540, 160, 900, 200, 21, 0.85, seed=111)
    # her block closes the street's vista: still frosted, waiting
    FROST.update(glint_p=0.55, glint_k=0.5)
    block(f, 430, 710, 850, 1185, 6, 4, L=24, states=lambda r_, c: 'frost', chimneys=2, frost_L=60, seed=112, tower=(470, 60, 110))
    f.rect(546, 1074, 34, 52, g(10))
    win_shape(f, 546, 1074, 34, 52, 'frost', frost_L=64)
    # the warmth arriving: near windows warm, the middle ones clearing, the far ones still frosted
    def st(k, row, c, u):
        if u < 0.22:
            return 'warm'
        if u < 0.5:
            return 'half'
        return 'frost'

    def door_left(k):
        return 'warm' if k < 2 else 'cold'

    lq = [(-60, 600), (435, 922), (435, 1188), (-60, 1680)]
    rq = [(1140, 640), (705, 932), (705, 1188), (1140, 1650)]
    street_wall(f, lq, [(0.0, 0.34, 0.05, 6, 3, 27), (0.34, 0.6, 0.12, 6, 3, 31), (0.6, 0.82, 0.0, 5, 3, 25), (0.82, 1.0, 0.08, 6, 2, 29)],
                frost_L=60, seed=113, states=st, doors=door_left)
    doors_l = f.last_doors
    street_wall(f, rq, [(0.0, 0.3, 0.02, 6, 3, 22), (0.3, 0.58, 0.14, 6, 3, 26), (0.58, 0.8, 0.05, 6, 3, 21), (0.8, 1.0, 0.1, 6, 2, 25)],
                frost_L=60, seed=114, states=st, doors=door_left)
    doors_r = f.last_doors
    FROST.update(glint_p=0.45, glint_k=0.34)
    # the street's snow
    street = f.lingrad([(0, g(50), 1), (0.4, g(42), 1), (1, g(22), 1)])
    f.poly([(-60, 1680), (435, 1188), (705, 1188), (1140, 1650), (1140, H), (-60, H)], street)
    # tram rails up the right side of the street, its wire
    for x_near, x_far in ((690, 600), (840, 640)):
        f.add(f'<path d="M{x_near + 120},{H} L{x_far},1192" stroke="{g(30)}" stroke-width="5"/>')
    f.add(f'<path d="M{1140},{900} L{650},{1150}" stroke="{g(20)}" stroke-width="2.5" opacity="0.7"/>')
    # THE WARM WATER UNDER THE STREET: a soft painted cut in the near-left snowbank shows the twin pipes (the warm one
    # honey); past it the melt line runs up each kerb and turns in at every door the warmth has reached
    f.add(f'<path d="M-40,1560 C40,1540 120,1500 190,1450 C240,1420 300,1380 330,1360 C340,1380 330,1420 300,1450 '
          f'C230,1530 130,1640 40,1720 C10,1740 -30,1760 -40,1760Z" fill="{g(10)}" filter="url(#rough)"/>')
    f.add(f'<path d="M-40,1560 C40,1540 120,1500 190,1450 C240,1420 300,1380 330,1360" stroke="{g(72)}" stroke-width="14" fill="none" filter="url(#rough)"/>')
    f.add(f'<path d="M-40,1640 C60,1600 180,1520 316,1400" stroke="{HONEY}" stroke-width="30" fill="none" stroke-linecap="round"/>')
    f.add(f'<path d="M-40,1640 C60,1600 180,1520 316,1400" stroke="{HONEY}" stroke-width="80" fill="none" opacity="0.2" filter="url(#soft3)"/>')
    f.add(f'<path d="M-40,1700 C70,1660 190,1580 300,1450" stroke="{g(46)}" stroke-width="24" fill="none" stroke-linecap="round"/>')

    def kerb(q, u, off):
        mm = homography(q)
        x, y = mm(u, 1.0)
        return (x + off * (1 - u), y + 10 * (1 - u))

    cut_pipe = [(-40, 1640), (60, 1600), (180, 1520), (316, 1400)]
    for q, doors, sgn, start, us in ((lq, doors_l, 1, cut_pipe, (0.4, 0.44, 0.48)),
                                     (rq, doors_r, -1, [(1100, 1720)], (0.12, 0.2, 0.28, 0.36, 0.44, 0.48))):
        front_u = 0.48
        pts = start[-1:] + [kerb(q, u, sgn * 46) for u in us]
        line_pts = start + pts[1:]
        d = smooth_d(pts)
        f.add(f'<path d="{d}" stroke="{g(22)}" stroke-width="22" fill="none" stroke-linecap="round" filter="url(#rough)"/>')
        f.add(f'<path d="{d}" stroke="{HONEY}" stroke-width="7" fill="none" opacity="0.9" stroke-linecap="round" filter="url(#soft1)"/>')
        tip = pts[-1]
        f.ellipse(tip[0], tip[1], 26, 10, HONEY_CORE, 'opacity="0.8" filter="url(#soft2)"')
        # ahead of the front, the pipe still under unmelted snow: a faint line to her door
        rest = [kerb(q, u, sgn * 46) for u in (front_u, 0.6, 0.75, 0.9, 1.0)] + [(560 + sgn * 20, 1190)]
        f.add(f'<path d="{smooth_d(rest)}" stroke="{HONEY}" stroke-width="3" fill="none" opacity="0.18" stroke-dasharray="10 14"/>')
        for (k, (tx, ty), kind) in doors:
            if kind != 'warm':
                continue
            uu = None
            best = 1e9
            for (xa_, ya_), (xb_, yb_) in zip(line_pts[:-1], line_pts[1:]):
                for i in range(21):
                    x_, y_ = xa_ + (xb_ - xa_) * i / 20, ya_ + (yb_ - ya_) * i / 20
                    dd = math.hypot(x_ - tx, y_ - ty)
                    if dd < best:
                        best, uu = dd, (x_, y_)
            f.add(f'<path d="M{uu[0]:.0f},{uu[1]:.0f} L{tx:.0f},{ty:.0f}" stroke="{g(22)}" stroke-width="14" stroke-linecap="round" filter="url(#rough)"/>')
            f.add(f'<path d="M{uu[0]:.0f},{uu[1]:.0f} L{tx:.0f},{ty:.0f}" stroke="{HONEY}" stroke-width="5" opacity="0.9" stroke-linecap="round"/>')
            f.ellipse(tx, ty, 30, 10, HONEY, 'opacity="0.55" filter="url(#soft2)"')
    # the tram on its rails on the right, nearer, lit, coming down the street
    tram(f, 640, 1360, s=1.0, L=40)
    # people on the pavements, falling snow
    person(f, 360, 1470, 118, L=10, pose='walk', facing=1, rim=-1)
    f.add(f'<path d="M382,1470 l4,-18 l24,-3 l8,-9 l6,4 l-3,9 l-4,17 l-5,0 l0,-10 l-20,2 l-3,8Z" fill="{g(10)}"/>')
    person(f, 930, 1452, 150, L=9, pose='walk', facing=-1, rim=1, scarf=True)
    snowfall(f, 140, sizes=(2, 5), seed=115)
    band(f, ['into', "people's homes."], seat=540)
    grain(f)
    return f


# ------------------------------------------------------------------ B12: your chat, her window
@frame('B12')
def b12():
    f = Frame(1212)
    home_view(f, wave=1.0, all_warm=True, her_step=True, her_inside=True, resident=False, pulse=True, plan_site=True,
              dim_city=0.5)
    # your hand, lower left, gentle: a light knit glove and sleeve cut by the bottom edge, the phone held up; your chat's
    # bubble, her window and the pulse between them on one diagonal
    s = 0.74
    x, y = 132, 1300
    f.add(f'<path d="M{x - 64},{H + 20} C{x - 58},{y + 500} {x - 38},{y + 390} {x - 22},{y + 316} L{x + 156},{y + 316} '
          f'C{x + 172},{y + 400} {x + 186},{y + 520} {x + 196},{H + 20}Z" fill="{g(30)}"/>')
    for k in range(4):
        f.add(f'<path d="M{x - 30 + k * 4},{y + 346 + k * 26} C{x + 40},{y + 336 + k * 26} {x + 110},{y + 338 + k * 26} {x + 168 + k * 4},{y + 350 + k * 26}" '
              f'stroke="{g(25)}" stroke-width="6" fill="none" opacity="0.6"/>')
    hand_phone(f, x, y, s=s, L_glove=34)
    # the bubble glowing: the one honey on your side of the picture
    f.add(f'<rect x="{x + 10}" y="{y + 110}" width="{190 * s - 10}" height="{70 * s}" rx="26" fill="{HONEY}" opacity="0.55" filter="url(#glow2)"/>')
    f.add(f'<rect x="{x + 22 * s}" y="{y + 150 * s}" width="{190 * s - 50 * s}" height="{58 * s}" rx="{26 * s}" fill="{HONEY_CORE}" opacity="0.45"/>')
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
    FROST.update(glint_p=0.15)
    block(f, -40, 300, 760, 1300, 6, 4, L=24, states=lambda r_, c: 'warm' if rr.random() < 0.2 else 'frost', chimneys=2, frost_L=42, seed=403)
    block(f, 300, 780, 860, 1300, 5, 6, L=28, states=lambda r_, c: 'warm' if rr.random() < 0.15 else 'frost', chimneys=3, frost_L=42, seed=404)
    block(f, 780, 1120, 790, 1300, 6, 4, L=22, states=lambda r_, c: 'warm' if rr.random() < 0.2 else 'frost', chimneys=2, frost_L=42, seed=405)
    FROST.update(glint_p=0.45)
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
    # forty kettles in a tall teetering heap, big and light, each with its own curl of steam
    rows = [8, 7, 6, 5, 5, 4, 3, 2]
    ks = 1.5
    rk = random.Random(4077)
    tops = []
    for i, n in enumerate(rows):
        y = 1428 - i * 38
        lean = i * 5 + (6 if i % 2 else -4)
        for j in range(n):
            x = 790 + lean - (n - 1) * 44 / 2 + j * 44 + rk.uniform(-4, 4)
            rot = rk.uniform(-9, 9) * (1 + i * 0.25)
            f.add(f'<g transform="rotate({rot:.1f} {x:.0f} {y:.0f})">')
            c, o = g(rk.uniform(64, 76)), g(26)
            d = f'M{x - 15 * ks},{y} L{x - 12 * ks},{y - 20 * ks} Q{x},{y - 26 * ks} {x + 12 * ks},{y - 20 * ks} L{x + 15 * ks},{y}Z'
            f.add(f'<path d="{d}" fill="{c}" stroke="{o}" stroke-width="2.4"/>')
            f.add(f'<path d="M{x + 11 * ks},{y - 12 * ks} L{x + 24 * ks},{y - 22 * ks} L{x + 25 * ks},{y - 19 * ks} L{x + 13 * ks},{y - 7 * ks}Z" fill="{c}" stroke="{o}" stroke-width="2"/>')
            f.add(f'<path d="M{x - 9 * ks},{y - 22 * ks} Q{x},{y - 34 * ks} {x + 9 * ks},{y - 22 * ks}" stroke="{o}" stroke-width="{2.8 * ks}" fill="none"/>')
            f.add(f'<path d="M{x - 9 * ks},{y - 15 * ks} L{x - 6 * ks},{y - 4 * ks}" stroke="{g(92)}" stroke-width="3" opacity="0.8"/>')
            f.add('</g>')
            tops.append((x + 25 * ks, y - 22 * ks))
    for (x, y) in tops:
        curl(f, x, y, h=30, L=95, op=0.85, sw=3.2)
    plume(f, [(800, 1080), (810, 980), (830, 880), (860, 780), (890, 680)], [150, 170, 190, 210, 220], L=86, op=0.85, seed=407, warm_root=0.45)
    # a child with a sled stops to look
    person(f, 1000, 1640, 150, L=9, pose='stand', facing=-1, rim=1)
    f.add(f'<path d="M930,1640 L1060,1640 Q1072,1640 1070,1628" stroke="{g(12)}" stroke-width="6" fill="none"/>')
    snowfall(f, 120, sizes=(2, 5), seed=408)
    band(f, ['as much heat as', [('forty', True), (' kettles,', False)]], seat=540)
    grain(f)
    return f


def glow_line(f, pts, w, closed=False):
    """a line cleared in frost with the lamp-lit room glowing through it: deep amber edge, honey, a bright core"""
    d = smooth_d(pts) + (' Z' if closed else '')
    f.add(f'<path d="{d}" stroke="{AMBER}" stroke-width="{w:.1f}" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="0.95"/>')
    f.add(f'<path d="{d}" stroke="{HONEY}" stroke-width="{w * 0.6:.1f}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>')
    f.add(f'<path d="{d}" stroke="{HONEY_CORE}" stroke-width="{max(1.0, w * 0.22):.1f}" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="0.85"/>')
    f.add(f'<path d="{d}" stroke="{HONEY}" stroke-width="{w * 2.6:.1f}" fill="none" stroke-linecap="round" opacity="0.25" filter="url(#soft1)"/>')


@frame('B7alt')
def b7alt():
    """the city draws the sun on its windows: a waterfront facade of frosted windows, in almost every one a little sun
    drawn by a fingertip, glowing honey through the cleared lines, all turned to the warm drift passing overhead"""
    f = Frame(7071)
    sky(f, [(0, 13), (0.4, 19), (0.8, 27), (1, 31)], 0, 1300)
    # the warm drift passing over the roofs (the heat the city wants), lit honey underneath
    plume(f, [(-40, 690), (180, 700), (400, 690), (620, 704), (840, 720), (1100, 736)], [160, 180, 190, 180, 170, 160], L=76, op=0.85, seed=7071)
    f.add(f'<rect x="0" y="742" width="{W}" height="110" fill="{HONEY}" opacity="0.26" filter="url(#soft4)"/>')
    quad = [(-60, 760), (1120, 930), (1120, 1500), (-60, 1740)]
    pieces = [(0.0, 0.4, 0.03, 4, 3, 28), (0.4, 0.72, 0.13, 4, 3, 33), (0.72, 1.0, 0.04, 5, 3, 25)]
    rs = random.Random(7072)
    skip = {(0, 1, 2), (1, 3, 0), (2, 0, 2), (2, 3, 1)}

    def sun(k, row, c, p, st):
        if (k, row, c) in skip:
            return
        xs = [q[0] for q in p]
        size = max(xs) - min(xs)
        cs, ct = 0.5 + rs.uniform(-0.1, 0.1), 0.46 + rs.uniform(-0.08, 0.06)
        rad = rs.uniform(0.13, 0.24)
        ar = (max(q[0] for q in p) - min(q[0] for q in p)) / max(1, (max(q[1] for q in p) - min(q[1] for q in p)))
        c0 = bil(p, cs, ct)
        f.add(f'<ellipse cx="{c0[0]:.0f}" cy="{c0[1]:.0f}" rx="{size * 0.42:.0f}" ry="{size * 0.42 / max(0.4, ar):.0f}" fill="{HONEY}" '
              f'opacity="0.3" filter="url(#soft3)"/>')
        ring = [bil(p, cs + rad * math.cos(t), ct + rad * ar * math.sin(t)) for t in [i * math.pi / 7 for i in range(15)]]
        w = max(3.0, size * 0.085)
        glow_line(f, ring, w)
        nr = rs.choice([6, 8, 8, 10])
        for i in range(nr):
            t = i * 2 * math.pi / nr + rs.uniform(-0.15, 0.15)
            a_ = bil(p, cs + (rad + 0.08) * math.cos(t), ct + (rad + 0.08) * ar * math.sin(t))
            b_ = bil(p, cs + (rad + 0.2) * math.cos(t), ct + (rad + 0.2) * ar * math.sin(t))
            glow_line(f, [a_, b_], w * 0.8)
        if rs.random() < 0.3:
            # a smiling sun
            for ex in (-0.35, 0.35):
                e_ = bil(p, cs + rad * ex, ct - rad * ar * 0.2)
                f.circle(e_[0], e_[1], max(1.5, w * 0.45), HONEY_CORE)
            sm = [bil(p, cs + rad * 0.5 * math.cos(t), ct + rad * ar * (0.15 + 0.35 * math.sin(t))) for t in [0.3 + i * 0.4 for i in range(7)]]
            glow_line(f, sm, w * 0.5)
        if (k, row, c) == (0, 2, 1):
            # a hand still drawing the last ray, its shadow through the frost
            tip = bil(p, cs + (rad + 0.2) * math.cos(-0.6), ct + (rad + 0.2) * ar * math.sin(-0.6))
            f.add(f'<path d="M{tip[0]:.0f},{tip[1]:.0f} l{size * 0.3:.0f},{-size * 0.04:.0f} l{size * 0.25:.0f},{size * 0.2:.0f} l{-size * 0.05:.0f},{size * 0.3:.0f} '
                  f'l{-size * 0.3:.0f},{-size * 0.08:.0f}Z" fill="{g(18)}" opacity="0.7" filter="url(#soft1)"/>')

    FROST.update(glint_p=0.3)
    street_wall(f, quad, pieces, frost_L=50, seed=7073, states=lambda k, r_, c, u: 'frost', ornate=True, win_cb=sun)
    FROST.update(glint_p=0.45)
    # the pavement, a lamp post, two neighbours stopped to look up at the drift
    road = f.lingrad([(0, g(40), 1), (1, g(16), 1)])
    f.poly([(-40, 1720), (1120, 1530), (1120, H), (-40, H)], road)
    f.add(f'<path d="M-40,1760 L1120,1572" stroke="{g(54)}" stroke-width="8" opacity="0.7"/>')
    f.rect(900, 1160, 10, 420, g(14))
    f.ellipse(905, 1156, 26, 10, g(20))
    f.add(f'<ellipse cx="905" cy="1176" rx="70" ry="40" fill="{g(84)}" opacity="0.25" filter="url(#soft3)"/>')
    person(f, 640, 1630, 176, L=8, pose='stand', facing=-1, rim=1, scarf=True)
    person(f, 720, 1618, 124, L=10, pose='stand', facing=-1, arm_up=True)
    breath(f, 622, 1470, s=0.8)
    snowfall(f, 110, sizes=(2, 5), seed=704)
    band(f, ['But Helsinki', [('wants', True), (' that heat.', False)]], seat=540)
    grain(f)
    return f


@frame('B9alt')
def b9alt():
    """the roof lifts: pushed in on her frost drawing, her fingertip lifts the frost roof of the little building she drew
    like a lid, and we lean in from above onto the hall inside: rows of machines in glittering frost, their lights, a cool
    glow, the pipe of cool water waiting in the aisle"""
    f = Frame(9091)
    f.rect(0, 0, W, H, g(20))
    rr = random.Random(9092)
    bl = ''
    for k in range(60):
        bl += f'<circle cx="{rr.uniform(-60, W + 60):.0f}" cy="{rr.uniform(0, H):.0f}" r="{rr.uniform(30, 90):.0f}" opacity="{rr.uniform(0.3, 0.7):.2f}"/>'
    f.add(f'<g fill="{HONEY}" filter="url(#soft4)">{bl}</g>')
    frost_field(f, 0, 0, W, H, L=80, op=0.9, density=70, seed=9093, base_op=0.72)
    f.add(f'<rect x="0" y="0" width="{W}" height="{H}" fill="{g(10)}" opacity="0.2" filter="url(#soft4)"/>')
    # the drawn building, seen three-quarter: front face, side face, and its open top
    F = [(200, 1230), (690, 1280), (690, 1600), (200, 1560)]
    S = [(690, 1280), (880, 1100), (880, 1420), (690, 1600)]
    T = [(200, 1230), (690, 1280), (880, 1100), (390, 1050)]
    # inside, seen from above: dark, a cool glow, two rows of machines in frost, the pipe of cool water in the aisle
    cid = f.uid('top')
    f.defs.append(f'<clipPath id="{cid}"><polygon points="{" ".join(f"{x:.0f},{y:.0f}" for x, y in T)}"/></clipPath>')
    f.add(f'<g clip-path="url(#{cid})">')
    f.poly(T, g(9))
    c = bil(T, 0.5, 0.55)
    f.add(f'<ellipse cx="{c[0]:.0f}" cy="{c[1]:.0f}" rx="230" ry="90" fill="{g(66, -10)}" opacity="0.5" filter="url(#soft4)"/>')
    for (s0, s1) in ((0.08, 0.38), (0.62, 0.92)):
        for i in range(4):
            t0, t1 = 0.06 + 0.23 * i, 0.22 + 0.23 * i
            q = [bil(T, s0, t0), bil(T, s1, t0), bil(T, s1, t1), bil(T, s0, t1)]
            frost_stroke(f, q + [q[0]], w=max(2.0, 5 - 2.5 * i / 3), seed=9100 + i * 7 + int(s0 * 100), op=0.95, feathers=i < 2,
                         glints=1 if i == 0 else 0, glow=True)
            for j in range(3):
                for kk in range(2):
                    x, y = bil(T, s0 + (s1 - s0) * (0.3 + 0.4 * kk), t0 + (t1 - t0) * (0.25 + 0.25 * j))
                    f.circle(x, y, 3.2 - i * 0.5, g(95, -8), 'opacity="0.9"')
    pa, pb = bil(T, 0.5, -0.02), bil(T, 0.5, 1.02)
    f.add(f'<path d="M{pa[0]:.0f},{pa[1]:.0f} L{pb[0]:.0f},{pb[1]:.0f}" stroke="{g(72, -12)}" stroke-width="16" stroke-linecap="round"/>')
    f.add(f'<path d="M{pa[0]:.0f},{pa[1] - 4:.0f} L{pb[0]:.0f},{pb[1] - 4:.0f}" stroke="{g(90, -8)}" stroke-width="4" opacity="0.8"/>')
    f.add('</g>')
    # the walls she drew: cleared lines with the warm night glowing through them; a door on the front
    glow_line(f, wobble([F[3], F[0], F[1], F[2], F[3]], amp=3, seed=9201, step=18), 22)
    glow_line(f, wobble([S[0], S[1], S[2], S[3]], amp=3, seed=9202, step=18), 18)
    glow_line(f, wobble([T[3], T[2]], amp=3, seed=9203, step=18), 14)
    glow_line(f, wobble([T[0], T[3]], amp=3, seed=9204, step=18), 14)
    glow_line(f, wobble([(400, 1578), (402, 1462), (480, 1468), (482, 1584)], amp=2.5, seed=9205, step=16), 16)
    # the roof: a sheet of frost hinged at the back, lifted toward us like a lid, its edge catching the warm light
    R = [(390, 1050), (880, 1100), (830, 740), (340, 700)]
    f.poly(R, f.lingrad([(0, g(70), 1), (1, g(88), 1)]))
    rc = f.uid('roof')
    f.defs.append(f'<clipPath id="{rc}"><polygon points="{" ".join(f"{x:.0f},{y:.0f}" for x, y in R)}"/></clipPath>')
    f.add(f'<g clip-path="url(#{rc})">')
    for k in range(8):
        x, y = bil(R, 0.06 + k * 0.125, 0.03)
        frost_fern(f, x, y, -1.57 + rr.uniform(-0.5, 0.5), 170, depth=3, L=99, op=0.55, sw=2.4, seed=9300 + k)
    for k in range(5):
        x, y = bil(R, rr.uniform(0.1, 0.9), rr.uniform(0.1, 0.9))
        glint(f, x, y, rr.uniform(10, 18))
    f.add('</g>')
    f.add(f'<path d="M340,700 L830,740" stroke="{HONEY}" stroke-width="10" opacity="0.8" filter="url(#soft1)"/>')
    f.add(f'<path d="M340,700 L830,740" stroke="{HONEY_CORE}" stroke-width="3"/>')
    # her fingertip under the lid's edge, lifting it
    knit_hand(f, (770, 760), reach=1.0, rot=-18)
    band(f, ['So how would', 'that work?'], seat=540, L=86)
    grain(f, 0.07)
    return f


@frame('B10alt')
def b10alt():
    """one machine, one pipe, in its hall: the plan's big new data center drawn in glittering frost, a row of giant
    machines running back behind the one up close, a person beside it for scale; the water painted: in cool at its
    foot, up through the machine warming, out honey at its top and away toward the city"""
    f = Frame(10101)
    dim_night(f, seed=1001)
    for (cx, cy, a) in [(0, 900, 0.1), (W, 1100, math.pi - 0.1), (300, H, -1.3), (W, 1800, math.pi + 0.4)]:
        for k in range(2):
            frost_fern(f, cx, cy, a + (k - 0.5) * 0.3, 220 + 40 * k, depth=3, L=92, op=0.28, sw=2.0, seed=int(cx * 3 + cy + k))
    # the hall: its floor running back to the right, the row of machines behind the near one, getting smaller
    frost_stroke(f, [(0, 1700), (1080, 1430)], w=5, seed=1501, op=0.6, glints=1)
    frost_stroke(f, [(0, 660), (1080, 860)], w=4, seed=1502, op=0.45, feathers=False, glints=0)
    for i in range(5):
        t = i / 5
        x0_ = 780 + i * 62
        h_ = 700 * (1 - 0.13 * (i + 1))
        yb = 1560 - i * 30
        pts = [(x0_, yb), (x0_, yb - h_), (x0_ + 56 - i * 4, yb - h_ + 8), (x0_ + 56 - i * 4, yb - 6), (x0_, yb)]
        f.poly(pts[:4], g(12), 'opacity="0.9"')
        f.add(f'<rect x="{x0_ + 6}" y="{yb - h_ * 0.8:.0f}" width="{44 - i * 4}" height="{h_ * 0.6:.0f}" fill="{HONEY}" opacity="0.14" filter="url(#glow)"/>')
        frost_stroke(f, pts, w=max(2.0, 4.5 - i * 0.6), seed=1510 + i, op=0.8 - i * 0.08, feathers=i < 2, glints=1 if i < 2 else 0)
        for j in range(6):
            f.circle(x0_ + 20, yb - h_ * (0.15 + 0.13 * j), 2.6 - i * 0.3, g(95, -8), 'opacity="0.8"')
    # the one machine, big and close
    x0, x1, y0, y1 = 330, 750, 650, 1640
    f.poly([(x0, y0), (x1, y0), (x1 + 70, y0 + 40), (x1 + 70, y1 - 20), (x1, y1), (x0, y1)], g(11), 'opacity="0.92"')
    for j in range(9):
        y = y0 + 70 + j * 100
        f.add(f'<rect x="{x0 + 40}" y="{y + 18}" width="{x1 - x0 - 80}" height="40" fill="{HONEY}" opacity="0.16" filter="url(#glow)"/>')
    frost_stroke(f, [(x0, y0), (x1, y0), (x1, y1), (x0, y1), (x0, y0)], w=8, seed=1601, glints=3)
    frost_stroke(f, [(x1, y0), (x1 + 70, y0 + 40), (x1 + 70, y1 - 20), (x1, y1)], w=5, seed=1602, op=0.75, glints=1)
    for j in range(9):
        y = y0 + 70 + j * 100
        frost_stroke(f, [(x0 + 30, y), (x1 - 30, y)], w=3, seed=1610 + j, op=0.6, feathers=False, glints=0, glow=False)
        for kk in range(5):
            f.circle(x0 + 70 + kk * 22, y + 40, 3.2, g(95, -8), 'opacity="0.85"')
    # a person beside it, drawn in the same frost hand, one hand on its panel
    frost_person(f, 236, 1640, 310, seed=1700, w=4.5)
    # the water: in cool at the foot (left), up through the machine warming, out honey at the top (right) and away
    def seg(xa, ya, xb, yb, col, w):
        f.add(f'<line x1="{xa}" y1="{ya}" x2="{xb}" y2="{yb}" stroke="{col}" stroke-width="{w}" stroke-linecap="round"/>')
        f.add(f'<line x1="{xa}" y1="{ya}" x2="{xb}" y2="{yb}" stroke="{col}" stroke-width="{w * 2.4}" opacity="0.18" stroke-linecap="round" filter="url(#soft2)"/>')
    COOL = g(70, -12)
    seg(-20, 1590, 400, 1590, COOL, 28)
    steps = 8
    for k in range(steps):
        ya = 1590 - k * (1590 - 720) / steps
        yb = 1590 - (k + 1) * (1590 - 720) / steps
        t = k / (steps - 1)
        col = COOL if t < 0.12 else (warm(76 + 8 * t, 10 + 36 * t, 80) if t < 0.9 else HONEY)
        seg(400, ya, 400, yb, col, 26)
    seg(400, 720, 680, 720, HONEY, 28)
    seg(680, 720, 1100, 620, HONEY, 34)
    band(f, ['with water', 'in pipes.'], seat=540, L=86)
    grain(f, 0.07)
    return f


if __name__ == '__main__':
    names = sys.argv[1:] or list(FRAMES)
    for n in names:
        f = FRAMES[n]()
        p = render(f'A-{n}', f.svg())
        print('rendered', p)
