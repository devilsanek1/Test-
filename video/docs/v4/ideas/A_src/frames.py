"""imagination A, THE FROSTED CITY: every beat as one whole 9:16 frame (value sketch, one warm accent).
python3 frames.py [B1 B2 ...]   renders the named frames (all if none) into the scratchpad, one at a time."""
import math
import random
import sys

from sketchlib import (W, H, Frame, g, HONEY, HONEY_CORE, AMBER, EMBER, INK, lab2rgb, hexc, sky, cloud, band, snowfall, grain,
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


def blank_building(f, x1=322, steam=False, door_warm=False, fans=3, bold=False):
    """the one building in town with NO windows, at the harbour's edge: a smooth blank slab among the stucco blocks,
    two thin rows of cold lights along its face, big roof fans; its door at the right end.
    bold (B1, round 2): the source made the second read: a smooth pale machine face unlike the stucco, big fans
    breathing warm, the door wide open and blazing, its light pooled on the snow"""
    if bold:
        return blank_building_bold(f, x1=x1, fans=fans)
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


def blank_building_bold(f, x1=322, fans=3):
    """B1's source, made the second read: the building with no windows as a machine among homes (a smooth cool face,
    two long rows of cold lights like a server's, big round fans breathing warm air), its wide door blazing honey with
    the machines' rows dark against the glow inside, the light pooled on the snow where the warm run leaves it"""
    x0, ytop, ybot = -10, 1072, 1250
    face = f.lingrad([(0, g(40, -9), 1), (0.5, g(33, -9), 1), (1, g(25, -8), 1)])
    f.poly([(x0, ybot), (x0, ytop + 4), (x1 - 16, ytop), (x1, ytop + 12), (x1, ybot)], face)
    f.poly([(x1 - 16, ytop), (x1 + 16, ytop + 12), (x1 + 16, ybot), (x1, ybot), (x1, ytop + 12)], g(17))
    f.add(f'<path d="M{x0},{ytop + 5} L{x1 - 16},{ytop + 1}" stroke="{g(70, -8)}" stroke-width="4" opacity="0.9"/>')
    snowcap(f, x0, x1 - 10, ytop + 2, th=7, L=60)
    for yy, n in ((1124, 19), (1180, 19)):
        f.add(f'<rect x="{x0 + 10}" y="{yy - 7}" width="{x1 - x0 - 34}" height="16" fill="{g(88, -12)}" opacity="0.22" filter="url(#soft2)"/>')
        for k in range(n):
            f.rect(x0 + 16 + k * (x1 - x0 - 112) / (n - 1), yy, 6, 4, g(97, -12))
    # the big round fans on the roof, breathing warm air up into the night
    fx_list = [x0 + 64 + k * ((x1 - x0 - 190) / max(1, fans - 1)) for k in range(fans)]
    for i, fx in enumerate(fx_list):
        roof_fan(f, fx, ytop - 12, r=40, tilt=0.5, warm_op=0.6)
        drift(f, [(fx, ytop - 44), (fx + 6, ytop - 92), (fx + 18, ytop - 140)], [46, 58, 70],
              [warm(84, 34, 80), warm(82, 22, 78), g(74)], [0.8, 0.62, 0.42], seed=170 + i, filt='steam2')
    # the door: wide open, blazing, the machines' rows dark against the glow inside; its light on the snow
    dw, dh = 58, 92
    dx = x1 - 34 - dw
    f.add(f'<rect x="{dx - 70}" y="{ybot - dh - 70}" width="{dw + 140}" height="{dh + 120}" fill="{HONEY}" opacity="0.55" filter="url(#glow2)"/>')
    f.rect(dx - 5, ybot - dh - 6, dw + 10, dh + 6, g(12))
    f.rect(dx, ybot - dh, dw, dh, f.radgrad([(0, HONEY_CORE, 1), (0.6, HONEY, 1), (1, AMBER, 1)], cx=0.5, cy=0.6, r=0.8))
    for k in range(3):
        xx = dx + 8 + k * 17
        f.rect(xx, ybot - dh + 18, 9, dh - 18, g(30), 'opacity="0.55"')
        for j in range(5):
            f.rect(xx + 2, ybot - dh + 24 + j * 13, 5, 3, HONEY_CORE, 'opacity="0.8"')
    f.add(f'<path d="M{dx - 4},{ybot} L{dx + dw + 4},{ybot} L{dx + dw + 60},{ybot + 24} L{dx - 60},{ybot + 24}Z" fill="{HONEY}" opacity="0.5" filter="url(#soft2)"/>')
    return dx + dw / 2, fx_list


SWEEP = [(0, 800), (140, 808), (277, 826), (400, 876), (556, 962), (700, 1060), (800, 1138), (884, 1200), (930, 1240)]


def sweep_y(x):
    """B1's front (round 2): the warm run along the shore rises up every facade it has passed, highest by the source
    and still low far off, so the front is one long sweep down across all five facades to where the run has got to"""
    if x >= SWEEP[-1][0]:
        return BY + 60
    for (xa, ya), (xb, yb) in zip(SWEEP[:-1], SWEEP[1:]):
        if xa <= x <= xb:
            return ya + (yb - ya) * (x - xa) / (xb - xa)
    return SWEEP[0][1]


def home_view(f, wave=0.5, all_warm=False, her_step=False, data_plume=False, her_inside=False, resident=True,
              pulse=False, crest=False, plan_site=False, dim_city=0.0, sweep=False, walker=(780, 1556, 210),
              plan_drawn=True, pulse_x=392, her_toast=False):
    """from the snowy near shore, across a narrow arm of frozen harbour: her block with the one window in the
    golden box, the city's blocks stepping up the hill behind, the blank building at the harbour's edge (left).
    wave: how far the warm wave has run (0 frosted city .. 1 across the whole hill); it runs from the blank building
    out along the shore and up the hill, one honey FRONT whose crest is the brightest honey, the frost ahead of it.
    sweep (B1, round 2): the front is SWEEP, a bold line across every facade fed by the run along the shore.
    plan_site (B12): the plan's new building drawn in frost lines beside the blank one (plan_drawn=False lets it go);
    dim_city: the city's warm windows a step deeper so her window and your chat stay the two brightest honeys;
    her_toast (B12, round 2): she lifts her cup toward you in her window."""
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
        if sweep:
            dy = y - sweep_y(x)  # below the front = behind it, warm
            if dy > 150:
                return 'deep'
            if dy > 40:
                return 'warm'
            if dy > -8:
                return 'crest'
            if dy > -30:
                return 'half'
            return 'frost'
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
        if sweep and not all_warm:
            return y > sweep_y(x)
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
    if her_toast:
        # her, close to the glass, facing out across the harbour, lifting her cup toward you (B5's toast returned)
        c = g(13)
        f.add(f'<path d="M{wx + 5},{wy + wh} C{wx + 6},{wy + wh - 18} {wx + 9},{wy + wh - 28} {wx + 15},{wy + wh - 31} '
              f'L{wx + 33},{wy + wh - 31} C{wx + 39},{wy + wh - 28} {wx + 42},{wy + wh - 18} {wx + 43},{wy + wh}Z" fill="{c}"/>')
        f.rect(wx + 20, wy + wh - 38, 8, 9, c)
        f.ellipse(wx + 24, wy + wh - 46, 8, 10, c)
        f.circle(wx + 25, wy + wh - 58, 5.5, c)
        # the raised arm, the cup held up high, its curl of steam
        f.add(f'<path d="M{wx + 33},{wy + wh - 30} L{wx + 39},{wy + wh - 33} L{wx + 48},{wy + 32} L{wx + 41},{wy + 30}Z" fill="{c}"/>')
        f.add(f'<rect x="{wx + 38}" y="{wy + 17}" width="13" height="14" rx="2" fill="{c}"/>')
        f.add(f'<path d="M{wx + 51},{wy + 20} q6,1 5,6 q-1,4 -5,4" stroke="{c}" stroke-width="2.5" fill="none"/>')
        curl(f, wx + 44, wy + 15, h=11, L=97, op=0.95, sw=2.2)
    elif her_inside:
        person(f, wx + ww * 0.36, wy + wh + 1, 50, L=10, pose='stand', facing=-1, coat=False)
    snowcap(f, wx - 9, wx + ww + 9, wy + wh + 7, th=6, L=88 if lit else 76)
    if lit:
        f.add(f'<path d="M{wx - 4},{wy + wh + 12} L{wx + ww + 4},{wy + wh + 12} L{wx + ww + 28},{wy + wh + 80} L{wx - 28},{wy + wh + 80}Z" '
              f'fill="{HONEY}" opacity="0.14" filter="url(#soft2)"/>')

    blk(748, 968, 960, 5, 3, L=28, states=st_for(748, 960), chimneys=2, seed=34)
    blk(968, 1110, 925, 6, 2, L=25, states=st_for(968, 925), chimneys=2, seed=35)

    # THE CREST: the wave's bright front lying across the facades, mid-building, from the shore up the whole hill
    if crest and sweep and not all_warm:
        # (round 2) one bold front across all five facades: a sharp honey edge, the warm light trailing behind it,
        # warm air rising off it, and the frost ahead glinting as the warmth reaches it
        cid = f.uid('city')
        f.defs.append(f'<clipPath id="{cid}">{"".join(shapes)}</clipPath>')

        def off(dy):
            return smooth_d([(x, y + dy) for x, y in SWEEP])
        f.add(f'<path d="{off(-40)}" stroke="{HONEY}" stroke-width="150" fill="none" opacity="0.12" filter="url(#soft4)"/>')
        f.add(f'<g clip-path="url(#{cid})">'
              f'<path d="{off(95)}" stroke="{HONEY}" stroke-width="180" fill="none" opacity="0.22" filter="url(#soft4)"/>'
              f'<path d="{off(26)}" stroke="{HONEY}" stroke-width="58" fill="none" opacity="0.5" filter="url(#soft3)"/>'
              f'<path d="{off(8)}" stroke="{HONEY_CORE}" stroke-width="24" fill="none" opacity="0.55" filter="url(#soft2)"/></g>')
        rg = random.Random(77)
        for i in range(10):
            x = 400 + i * 62 + rg.uniform(-16, 16)
            if x > SWEEP[-1][0] - 10:
                break
            glint(f, x, sweep_y(x) - rg.uniform(14, 34), rg.uniform(8, 13), op=0.9)
    elif crest and not all_warm:
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
    if plan_site and not plan_drawn:
        # (B12, round 2) the plan's frost-line building let go: the warm run leaves the empty site behind your phone
        blank_building(f, x1=150, steam=False, door_warm=False, fans=2)
        door_x = 284
    elif plan_site:
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
    elif sweep:
        door_x, _ = blank_building(f, x1=322, bold=True)
    else:
        door_x, _ = blank_building(f, x1=322, steam=crest or data_plume, door_warm=(wave > 0 or all_warm))
    if data_plume and not crest:
        plume(f, [(62, 1050), (110, 990), (170, 950), (250, 920), (340, 905)], [50, 70, 90, 110, 130], L=70, op=0.75, seed=7)

    # the far shore road and the warm run along it (the warm water under the snow)
    f.rect(0, BY, W, 18, g(40), 'filter="url(#rough2)"')
    run_from = door_x
    if sweep and not all_warm:
        # (round 2) the warm run leaving the blazing door: snow melted in a line over the pipe along the shore road, the
        # honey glowing up through it, all the way to where the front rises off it (the brightest knot)
        run_to, y_r = SWEEP[-1][0], BY + 9
        # (drawn as rects: a level stroked line has a zero-height box and its blur filter would clip it away)
        rl = run_to - run_from
        f.rect(run_from - 10, y_r - 9, rl + 10, 18, g(13), 'rx="9" filter="url(#rough2)"')
        f.rect(run_from, y_r - 30, rl, 60, HONEY, 'opacity="0.3" filter="url(#soft3)"')
        f.rect(run_from, y_r - 7, rl, 14, AMBER, 'rx="7" opacity="0.95" filter="url(#soft1)"')
        f.rect(run_from, y_r - 4, rl, 8, HONEY, 'rx="4" opacity="0.95" filter="url(#soft1)"')
        f.rect(run_from, y_r - 2, rl, 3, HONEY_CORE, 'opacity="0.7"')
        f.ellipse(run_to - 6, y_r - 6, 36, 17, HONEY_CORE, 'opacity="0.95" filter="url(#soft2)"')
        f.ellipse(run_to - 6, y_r - 14, 96, 44, HONEY, 'opacity="0.45" filter="url(#soft3)"')
    elif wave > 0 or all_warm:
        run_to = 1080 if all_warm else min(1080, 150 + fa * 0.985)
        sw = 8 if pulse else 6
        if pulse:
            # (B12, round 2) the run drawn as rects so it shows (a level stroked line's blur clipped it to a hairline)
            f.rect(run_from, BY + 9 - sw / 2, run_to - run_from, sw, HONEY, f'rx="{sw / 2}" opacity="{0.8 if dim_city else 0.95}" filter="url(#soft1)"')
            f.rect(run_from, BY - 4, run_to - run_from, 26, HONEY, f'opacity="{0.14 if dim_city else 0.18}" filter="url(#soft3)"')
        else:
            f.add(f'<path d="M{run_from},{BY + 9} L{run_to},{BY + 8}" stroke="{HONEY}" stroke-width="{sw}" opacity="{0.75 if dim_city else 0.95}" '
                  f'stroke-linecap="round" filter="url(#soft1)"/>')
            f.add(f'<path d="M{run_from},{BY + 9} L{run_to},{BY + 8}" stroke="{HONEY}" stroke-width="26" opacity="{0.12 if dim_city else 0.18}" filter="url(#soft3)"/>')
        if crest and not all_warm:
            f.ellipse(run_to - 10, BY + 8, 46, 14, HONEY_CORE, 'opacity="0.85" filter="url(#soft2)"')
            f.ellipse(run_to - 10, BY + 8, 110, 30, HONEY, 'opacity="0.35" filter="url(#soft3)"')
        if pulse:
            # the pulse: one bright packet of warmth running along the shore from the plan's door to her block
            px_ = pulse_x
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
    wkx, wky, wkh = walker
    for k in range(16):
        fx = wkx + 100 - k * 50 + r.uniform(-6, 6)
        fy = wky + 4 + k * 9 + (10 if k % 2 else -10)
        f.ellipse(fx, fy, 8, 4, g(18), 'opacity="0.7"')
    f.rect(1010, 1420, 36, 130, g(10), 'filter="url(#rough2)"')
    snowcap(f, 1006, 1050, 1422, th=8, L=62)
    if resident:
        person(f, wkx, wky, wkh, L=9, pose='walk', facing=-1, rim=-1, bag=True, scarf=True)
        breath(f, wkx - 36 * wkh / 210, wky - 184 * wkh / 210, s=wkh / 210)
    snowfall(f, 150, sizes=(2, 5), seed=12)
    snowfall(f, 28, region=(0, 1250, W, H), sizes=(6, 10), seed=13, op=(0.4, 0.75))


@frame('B1')
def b1():
    f = Frame(101)
    FROST.update(glint_p=0.6, glint_k=0.5)
    home_view(f, wave=0.77, crest=True, sweep=True, walker=(790, 1494, 196))
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


def kitchen(f, x, y, w, h, kind, seed, kettle_kind='round', kx=0.42, curl_w=None):
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
    curl(f, sx, sy, h=(sy - y) * 0.95, L=95, op=0.95, sw=curl_w or max(4, h * 0.075))
    f.add(f'<path d="M{sx},{sy} C{sx + 14},{sy - h * 0.3} {sx - 10},{sy - h * 0.5} {sx + 4},{y + 2}" stroke="{g(95)}" stroke-width="{h * 0.16:.0f}" '
          f'fill="none" opacity="0.35" filter="url(#soft2)"/>')
    snowcap(f, x - 8, x + w + 8, y + h + 9, th=6, L=84, sag=0.4)
    return (sx + 4, y - 12)


@frame('B4')
def b4():
    """(round 2) the computer stepped clear of the facade into its own space (the corner of a side street open to the
    frozen harbour), the block of kitchens come closer (bigger kitchens, a shorter street), and the two clouds side by
    side, the same size, with sky between them: one machine, one cloud; forty kitchens, one cloud"""
    f = Frame(404)
    sky(f, [(0, 14), (0.35, 19), (0.62, 25), (0.85, 31), (1, 36)], 0, 1200)
    cloud(f, 520, 120, 1000, 200, 22, 0.85, seed=31)
    # the open view down the side street at the left: the far shore's frosted blocks, the frozen harbour, the quay
    far_city(f, 1192, x0=-30, x1=430, L=29, heights=(34, 92), seed=4401, density=0.45, warm_frac=0.0, Lwin=52)
    f.rect(0, 1192, 430, 170, f.lingrad([(0, g(50), 1), (1, g(42), 1)]))
    rq = random.Random(4402)
    for k in range(5):
        yy = 1210 + k * 30 + rq.uniform(-5, 5)
        f.rect(-10, yy, 450, rq.uniform(2, 4), g(rq.choice([36, 56])), 'opacity="0.6"')
    plume(f, [(40, 1236), (220, 1232), (390, 1238)], [50, 60, 50], L=66, op=0.3, filt='steam2', seed=4403)
    f.rect(0, 1362, 430, 8, g(20))
    for k in range(7):
        f.rect(8 + k * 66, 1330, 5, 34, g(18))
    f.rect(0, 1330, 430, 5, g(22))
    f.rect(0, 1370, 430, 130, f.lingrad([(0, g(52), 1), (1, g(44), 1)]))
    # the block of kitchens, close: its corner at the side street, its facade running past the right edge
    x0, x1, ytop, ybase = 422, 1150, 796, 1492
    f.poly([(400, ytop + 14), (x0, ytop + 4), (x0, ybase), (400, ybase)], g(17), 'filter="url(#rough2)"')
    f.poly([(x0, ybase), (x0, ytop), (x1, ytop + 4), (x1, ybase)], g(24), 'filter="url(#rough2)"')
    for row in range(1, 4):
        yy = 842 + row * 134 - 26
        f.rect(x0, yy, x1 - x0, 7, g(30), 'opacity="0.8"')
    # the ground floor: the street door (warm), the shop windows, the plinth
    f.rect(x0, 1366, x1 - x0, 126, g(20))
    f.rect(640, 1384, 74, 108, g(12))
    f.rect(646, 1390, 62, 102, f.lingrad([(0, HONEY, 1), (1, AMBER, 1)]), 'opacity="0.9"')
    f.rect(746, 1396, 300, 64, g(50), 'opacity="0.9"')
    f.rect(450, 1396, 160, 64, g(46), 'opacity="0.9"')
    for i in range(4):
        f.rect(458 + i * 38, 1406, 28, 46, g(38), 'opacity="0.7"')
    kinds = [['hand', 'plant', 'curtain', 'lamp'],
             ['shelf', 'person', 'blind', 'mugs'],
             ['lamp', 'mugs', 'hand', 'curtain'],
             ['curtain', 'plant', 'shelf', 'person']]
    kets = ['round', 'jug', 'whistle', 'round', 'jug', 'whistle', 'round']
    tops = []
    rr = random.Random(77)
    for row in range(4):
        for c in range(4):
            wx = 452 + 172 * c + rr.uniform(-5, 5)
            wy = 842 + row * 134 + rr.uniform(-3, 3)
            tops.append((row, kitchen(f, wx, wy, 136, 98, kinds[row][c], seed=row * 10 + c,
                                      kettle_kind=kets[(row * 4 + c) % 7], kx=rr.uniform(0.32, 0.52), curl_w=10)))
    snowcap(f, 400, x1, ytop + 2, th=11, L=74)
    for cxx in (500, 850, 1050):
        f.rect(cxx, ytop - 34, 20, 38, g(20))
        snowcap(f, cxx - 2, cxx + 22, ytop - 33, th=5, L=74)
    # every kitchen's curl wafting up out of its open top pane; the top row's carried up over the roof and gathered
    # into the block's ONE cloud
    cx2, cy2 = 786, 722
    for row, (sx, sy) in tops:
        d = f'M{sx:.0f},{sy:.0f} C{sx + 18:.0f},{sy - 26:.0f} {sx - 14:.0f},{sy - 44:.0f} {sx + 4:.0f},{sy - 66:.0f}'
        f.add(f'<path d="{d}" stroke="{g(95)}" stroke-width="11" fill="none" opacity="0.5" stroke-linecap="round" filter="url(#soft1)"/>')
        if row == 0:
            d2 = (f'M{sx:.0f},{sy - 30:.0f} C{sx:.0f},{ytop - 10:.0f} {sx + (cx2 - sx) * 0.45:.0f},{ytop - 20:.0f} '
                  f'{cx2 + (sx - cx2) * 0.35:.0f},{cy2 + 40:.0f}')
            f.add(f'<path d="{d2}" stroke="{g(92)}" stroke-width="30" fill="none" opacity="0.4" stroke-linecap="round" filter="url(#soft2)"/>')
    # the ONE giant computer, out on the corner of the pavement in its own space, the harbour behind it, melting
    # its own pool in the snow
    f.ellipse(206, 1494, 180, 24, g(14), 'opacity="0.8" filter="url(#soft1)"')
    f.ellipse(206, 1494, 220, 36, HONEY, 'opacity="0.12" filter="url(#soft3)"')
    computer_cabinet(f, 94, 904, 226, 1490, L=11, seed=4, steam=False)
    # THE TWO CLOUDS, side by side, the same size and height, sky between them: the computer's own, and the
    # forty kettles' one
    plume(f, [(207, 892), (206, 856), (207, 822)], [64, 78, 92], L=88, op=0.85, seed=405, warm_root=0.4)
    steam_cloud(f, 207, cy2, 300, 190, seed=7, L=90, op=0.95, warm=0.12)
    steam_cloud(f, cx2, cy2, 300, 190, seed=7, L=90, op=0.95, warm=0.12)
    # a neighbour and her dog stop beside it and look up
    person(f, 352, 1488, 164, L=8, pose='stand', facing=-1, rim=1, scarf=True)
    # her dog, a pale husky, sniffing at the warm pool the machine has melted
    f.add(f'<path d="M384,1488 l-4,-24 l-30,-6 l-12,-12 l-10,5 l3,13 l8,24 l7,0 l0,-14 l26,2 l5,12Z" fill="{g(66)}" stroke="{g(30)}" stroke-width="2"/>')
    breath(f, 332, 1340, s=0.8)
    # the street: the pavement, the kerb, the snowy road and its tram rails, the near kerb's snowbank
    f.rect(0, 1492, W, 22, g(54), 'filter="url(#rough2)"')
    f.rect(0, 1514, W, 10, g(30))
    f.rect(0, 1524, W, 396, f.lingrad([(0, g(40), 1), (0.5, g(30), 1), (1, g(18), 1)]))
    for yy in (1580, 1600, 1650, 1672):
        f.rect(0, yy, W, 4, g(22), 'opacity="0.8"')
    rt = random.Random(4404)
    for k in range(7):
        yy = 1700 + k * 30 + rt.uniform(-6, 6)
        f.add(f'<path d="M-20,{yy:.0f} Q540,{yy - 8 + rt.uniform(-6, 6):.0f} 1100,{yy + rt.uniform(-5, 5):.0f}" stroke="{g(rt.choice([24, 34, 38]))}" '
              f'stroke-width="{rt.uniform(3, 8):.0f}" fill="none" opacity="0.5" filter="url(#soft1)"/>')
    for c in range(4):
        f.rect(452 + 172 * c + 30, 1530, 76, 60, HONEY, 'opacity="0.1" filter="url(#soft3)"')
    f.add(f'<path d="M-20,1920 L-20,1846 C160,1810 380,1834 560,1816 C760,1798 920,1826 1100,1808 L1100,1920Z" fill="{g(48)}" filter="url(#rough)"/>')
    snowcap(f, -20, 1100, 1822, th=10, L=60)
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


COOL = g(72, -12)  # the cool water coming in (pale blue-grey)


def frost_solid(f, pts, L=60, seed=0, ferns=10, warm=0.0, wc=None):
    """(round 2) a SOLID of frost for the plan's hall (frosted glass with body, never a line on the dark): pale,
    crystalline, ferns growing in from its edges, lit warm from within (warm: how much)"""
    pp = ' '.join(f'{x:.1f},{y:.1f}' for x, y in pts)
    xs, ys = [p[0] for p in pts], [p[1] for p in pts]
    f.add(f'<polygon points="{pp}" fill="{g(L)}"/>')
    cid = f.uid('solid')
    f.defs.append(f'<clipPath id="{cid}"><polygon points="{pp}"/></clipPath>')
    f.add(f'<g clip-path="url(#{cid})">')
    frost_field(f, min(xs), min(ys), max(xs) - min(xs), max(ys) - min(ys), L=min(96, L + 18), op=0.55, density=ferns,
                seed=seed, base_op=0.22)
    if warm > 0:
        cx, cy = wc or ((min(xs) + max(xs)) / 2, (min(ys) + max(ys)) / 2)
        f.ellipse(cx, cy, (max(xs) - min(xs)) * 0.6, (max(ys) - min(ys)) * 0.5, HONEY, f'opacity="{warm:.2f}" filter="url(#soft4)"')
    f.add('</g>')


def frost_machine(f, x0, y0, x1, y1, vp=(1150, 1120), depth=64, rows=9, seed=1000, side=True, edge_w=7):
    """one giant computer of the plan, built of frost: a pale glowing slab, its glass door of trays, each tray's vent
    glowing honey with its heat, a row of tiny cold lights on each; glittering frost edges. Returns the trays' y."""
    if side:
        k = depth / max(60, vp[0] - x1)
        sd = [(x1, y0), (x1 + depth, y0 + (vp[1] - y0) * k), (x1 + depth, y1 - (y1 - vp[1]) * k), (x1, y1)]
        frost_solid(f, sd, L=42, seed=seed + 1, ferns=4, warm=0.25)
        frost_stroke(f, sd[:3] + [sd[3]], w=edge_w * 0.6, seed=seed + 2, L=92, op=0.8, glints=1)
    f.add(f'<rect x="{x0 - 60}" y="{y0 - 40}" width="{x1 - x0 + 120}" height="{y1 - y0 + 80}" fill="{HONEY}" opacity="0.2" filter="url(#glow2)"/>')
    frost_solid(f, [(x0, y0), (x1, y0), (x1, y1), (x0, y1)], L=64, seed=seed + 3, ferns=14, warm=0.3)
    # the glass door: a darker inset with the trays behind it
    gx0, gx1, gy0, gy1 = x0 + (x1 - x0) * 0.1, x1 - (x1 - x0) * 0.1, y0 + (y1 - y0) * 0.05, y1 - (y1 - y0) * 0.06
    f.rect(gx0, gy0, gx1 - gx0, gy1 - gy0, g(34), 'rx="6"')
    ys = []
    th = (gy1 - gy0) / rows
    rr = random.Random(seed + 4)
    for j in range(rows):
        ty = gy0 + th * j + th * 0.14
        f.rect(gx0 + 8, ty, gx1 - gx0 - 16, th * 0.72, g(24), 'rx="3"')
        # the vent glowing with the machine's heat
        f.rect(gx0 + 14, ty + th * 0.38, gx1 - gx0 - 28, th * 0.2, AMBER, f'opacity="{0.55 + 0.15 * rr.random():.2f}"')
        f.rect(gx0 + 10, ty + th * 0.2, gx1 - gx0 - 20, th * 0.5, HONEY, 'opacity="0.35" filter="url(#soft2)"')
        for c in range(rr.randint(4, 7)):
            f.rect(gx0 + 24 + c * 16, ty + th * 0.12, 6, 4, g(97, -10))
        ys.append(ty + th * 0.48)
    f.add(f'<rect x="{gx0}" y="{gy0}" width="{gx1 - gx0}" height="{gy1 - gy0}" rx="6" fill="none" stroke="{g(86)}" stroke-width="3" opacity="0.6"/>')
    frost_stroke(f, [(x0, y0), (x1, y0), (x1, y1), (x0, y1), (x0, y0)], w=edge_w, seed=seed + 5, L=96, glints=3)
    return ys, gx0


def frost_figure(f, x, yfeet, h, hand=None, seed=0, L=80, rim=1):
    """(round 2) her frost-hand person with body: a frosted figure (a pale, glittering silhouette, never a stick figure)
    in a long coat, hair up in a bun, head tipped up; one arm out, its palm on `hand`; the machine's warm light on
    the side facing it"""
    hd = h / 7.6
    hx, hy = x + hd * 0.15, yfeet - h + hd * 0.6
    top = yfeet - h + hd * 1.2
    hem = yfeet - h * 0.24
    body = (f'M{hx - hd * 0.55},{top} Q{hx},{top - hd * 0.18} {hx + hd * 0.6},{top} '
            f'Q{x + hd * 0.85},{(top + hem) / 2} {x + hd * 1.05},{hem} Q{x},{hem + hd * 0.16} {x - hd * 1.0},{hem} '
            f'Q{x - hd * 0.8},{(top + hem) / 2} {hx - hd * 0.55},{top}Z')
    legs = (f'M{x - hd * 0.45},{hem - 4} L{x - hd * 0.5},{yfeet} L{x - hd * 0.1},{yfeet} L{x - hd * 0.02},{hem} '
            f'M{x + hd * 0.08},{hem} L{x + hd * 0.15},{yfeet} L{x + hd * 0.55},{yfeet} L{x + hd * 0.48},{hem - 4}Z')
    head = f'M{hx + hd * 0.44},{hy} A{hd * 0.44},{hd * 0.54} 0 1 0 {hx - hd * 0.44},{hy} A{hd * 0.44},{hd * 0.54} 0 1 0 {hx + hd * 0.44},{hy}Z'
    bun = f'M{hx + hd * 0.3},{hy - hd * 0.62} A{hd * 0.26},{hd * 0.24} 0 1 0 {hx - hd * 0.22},{hy - hd * 0.62} A{hd * 0.26},{hd * 0.24} 0 1 0 {hx + hd * 0.3},{hy - hd * 0.62}Z'
    arm = ''
    if hand:
        ax, ay = hx + hd * 0.45, top + hd * 0.35
        hx2, hy2 = hand
        nx, ny = -(hy2 - ay), hx2 - ax
        nl = math.hypot(nx, ny) or 1
        nx, ny = nx / nl * hd * 0.2, ny / nl * hd * 0.2
        arm = (f'M{ax - nx},{ay - ny} L{hx2 - nx * 0.8},{hy2 - ny * 0.8} L{hx2 + hd * 0.3},{hy2 - hd * 0.12} '
               f'L{hx2 + hd * 0.32},{hy2 + hd * 0.2} L{hx2 + nx * 0.8},{hy2 + ny * 0.8} L{ax + nx},{ay + ny}Z')
    d = body + ' ' + legs + ' ' + head + ' ' + bun + (' ' + arm if arm else '')
    cid = f.uid('fig')
    f.defs.append(f'<clipPath id="{cid}"><path d="{d}"/></clipPath>')
    f.add(f'<path d="{d}" fill="{g(L - 6)}" opacity="0.94"/>')
    f.add(f'<g clip-path="url(#{cid})">')
    frost_field(f, x - h * 0.3, yfeet - h - 10, h * 0.8, h + 20, L=min(97, L + 12), op=0.7, density=8, seed=seed, base_op=0.25)
    f.add(f'<rect x="{x + rim * hd * 0.2}" y="{yfeet - h}" width="{hd * 1.6}" height="{h}" fill="{HONEY}" opacity="0.35" filter="url(#soft3)"/>')
    f.add('</g>')
    f.add(f'<path d="{d}" fill="none" stroke="{g(97)}" stroke-width="3.2" stroke-linejoin="round" opacity="0.85" filter="url(#rough2)"/>')
    for k in range(3):
        rg = random.Random(seed + k)
        glint(f, x + rg.uniform(-hd, hd), yfeet - rg.uniform(0.2, 0.9) * h, rg.uniform(9, 14))


def water_pipe(f, pts, w=34, warm_from=None, warm_to=None, cols=None, seed=0):
    """the one painted (real) thing in the plan: the water's pipe along pts, solid and shaded; its colour runs from
    cool to honey between the points warm_from and warm_to (by path length), cool before, honey after"""
    # resample by length so the colour can change gradually along it
    seg = []
    for (xa, ya), (xb, yb) in zip(pts[:-1], pts[1:]):
        n = max(1, int(math.hypot(xb - xa, yb - ya) / 14))
        for i in range(n):
            seg.append(((xa + (xb - xa) * i / n, ya + (yb - ya) * i / n), (xa + (xb - xa) * (i + 1) / n, ya + (yb - ya) * (i + 1) / n)))
    L_tot = sum(math.hypot(b[0] - a[0], b[1] - a[1]) for a, b in seg)
    t0 = warm_from if warm_from is not None else 0.3
    t1 = warm_to if warm_to is not None else 0.7
    acc = 0.0
    out_sh, out_body = '', ''
    for a, b in seg:
        acc += math.hypot(b[0] - a[0], b[1] - a[1])
        u = min(1.0, max(0.0, (acc / L_tot - t0) / max(1e-6, t1 - t0))) ** 1.25
        # cool pale blue-grey -> grey -> honey, through Lab so it warms steadily as it climbs
        col = hexc(lab2rgb(72 + 12 * u, 0.6 + 7.4 * u, -12 + 57 * u))
        sh = hexc(lab2rgb(46 + 8 * u, 0.6 + 9 * u, -12 + 44 * u))
        d = f'M{a[0]:.1f},{a[1]:.1f} L{b[0]:.1f},{b[1]:.1f}'
        out_sh += f'<path d="{d}" stroke="{sh}" stroke-width="{w + 8}" stroke-linecap="round"/>'
        out_body += f'<path d="{d}" stroke="{col}" stroke-width="{w}" stroke-linecap="round"/>'
    f.add(f'<g fill="none">{out_sh}</g>')
    f.add(f'<g fill="none">{out_body}</g>')
    # the highlight along it (a straight polyline: a smoothed curve would overshoot its corners)
    d_all = 'M' + ' L'.join(f'{x:.1f},{y:.1f}' for x, y in pts)
    f.add(f'<path d="{d_all}" stroke="{g(97)}" stroke-width="{w * 0.16:.1f}" fill="none" stroke-linejoin="round" opacity="0.45" '
          f'transform="translate({-w * 0.2:.1f},{-w * 0.2:.1f})"/>')
    return seg


@frame('B10')
def b10():
    """(round 2, reworked from the idea: B10alt's staging made a place) inside the plan's hall, built of frost and lit
    from within by the machines' heat: ONE giant machine close, the water's pipe coming in cool at its foot, climbing
    its face and drinking its heat tray by tray, warming as it climbs, leaving honey at its top and away toward the
    warm city glowing through the frost walls; her frost-drawn person with a palm on the machine, looking up"""
    f = Frame(1010)
    vp = (1150, 1120)
    # the hall's frost wall (her window pane): the warm city glowing through it, brightest round the machine
    f.rect(0, 0, W, H, g(16))
    rr = random.Random(1092)
    bl = ''
    for k in range(60):
        x, y = rr.uniform(-60, W + 60), rr.uniform(640, 1460)
        bl += f'<circle cx="{x:.0f}" cy="{y:.0f}" r="{rr.uniform(26, 70):.0f}" opacity="{rr.uniform(0.25, 0.6):.2f}"/>'
    f.add(f'<g fill="{HONEY}" filter="url(#soft4)">{bl}</g>')
    f.add(f'<rect x="0" y="600" width="{W}" height="900" fill="{g(30)}" opacity="0.45"/>')
    frost_field(f, 0, 610, W, 880, L=74, op=0.65, density=34, seed=1093, base_op=0.3)
    # the ceiling: calm and dark above (the band sits on it), a soft warm haze under it
    f.rect(0, 0, W, 640, f.lingrad([(0, g(10), 1), (0.8, g(15), 1), (1, g(20), 0.0)]))
    f.ellipse(560, 700, 520, 120, HONEY, 'opacity="0.16" filter="url(#soft4)"')
    # the ice floor, the machines' glow lying on it
    f.poly([(0, 1462), (W, 1300), (W, H), (0, H)], f.lingrad([(0, g(32), 1), (0.4, g(24), 1), (1, g(14), 1)]))
    f.add(f'<path d="M0,1462 L{W},1300" stroke="{g(70)}" stroke-width="4" opacity="0.6"/>')
    for k in range(6):
        y = 1520 + k * 64
        f.add(f'<path d="M-20,{y} Q540,{y - 14} 1100,{y - 40 + k * 4}" stroke="{g(40)}" stroke-width="{3 + k}" fill="none" opacity="0.35" filter="url(#soft1)"/>')
    f.rect(400, 1470, 300, 380, HONEY, 'opacity="0.16" filter="url(#soft4)"')
    # the row of machines receding behind the near one toward the hall's end, each glowing with its heat
    for k in (4, 3, 2, 1):
        t = 1 / (1 + 0.35 * k)
        X0, X1, Y0, Y1 = (vp[0] + (X - vp[0]) * t for X in (380, 740)), None, None, None
        x0_, x1_ = vp[0] + (380 - vp[0]) * t, vp[0] + (740 - vp[0]) * t
        y0_, y1_ = vp[1] + (660 - vp[1]) * t, vp[1] + (1462 - vp[1]) * t
        frost_machine(f, x0_, y0_, x1_, y1_, vp=vp, depth=64 * t, rows=9, seed=1500 + k * 20, edge_w=7 * t)
        # each one's own pipe, honey, up out of its top
        f.rect(x0_ + (x1_ - x0_) * 0.12, y0_ - 30 * t, 14 * t, 32 * t, HONEY, 'opacity="0.8"')
    # THE ONE MACHINE, close
    mx0, mx1, my0, my1 = 380, 740, 660, 1462
    rows, gx0 = frost_machine(f, mx0, my0, mx1, my1, vp=vp, depth=70, rows=9, seed=1600, edge_w=8)
    # THE WATER: in cool along the floor from the left, up the machine's face drinking its heat tray by tray, warming
    # as it climbs, honey at the top, and away over the hall toward the warm city
    px = mx0 + 44
    pts = [(-40, 1440), (px, 1440), (px, my0 + 26), (mx1 + 50, my0 + 26), (mx1 + 150, my0 + 4), (W + 40, 646)]
    L1 = (px + 40)
    L2 = L1 + (1440 - my0 - 26)
    Ltot = L2 + (mx1 + 50 - px) + math.hypot(100, 22) + math.hypot(W + 40 - mx1 - 150, my0 + 4 - 646)
    # the heat flowing from each tray's vent into the pipe (before the pipe, so the pipe sits on it)
    water_pipe(f, pts, w=38, warm_from=(L1 + 20) / Ltot, warm_to=(L2 - 30) / Ltot)
    # each tray's heat wrapping the pipe where it passes: the water drinking the heat, tray by tray (stronger higher up,
    # where the water already carries the heat of the trays below)
    for i, y in enumerate(rows):
        k = 1 - i / (len(rows) - 1)
        f.ellipse(px + 10, y, 40, 18, HONEY, f'opacity="{0.25 + 0.3 * k:.2f}" filter="url(#soft2)"')
        f.add(f'<path d="M{px + 50},{y - 8} C{px + 34},{y - 10} {px + 30},{y - 2} {px + 20},{y}" stroke="{HONEY_CORE}" stroke-width="5" '
              f'fill="none" stroke-linecap="round" opacity="0.75" filter="url(#soft1)"/>')
    # small marks of the flow: in from the left, up, out
    for (x, y, a) in [(110, 1440, 0), (250, 1440, 0), (px, 1300, -90), (930, 668, -10), (1030, 656, -10)]:
        f.add(f'<path d="M-7,-9 L4,0 L-7,9" transform="translate({x},{y}) rotate({a})" stroke="{g(97)}" stroke-width="4" fill="none" opacity="0.5"/>')
    # her frost-hand person, a palm on the machine, looking up at the pipe
    frost_figure(f, 214, 1478, 400, hand=(mx0 + 8, 1186), seed=1700, L=80)
    snowfall(f, 40, region=(0, 620, W, 1500), sizes=(1.5, 3.5), seed=1094, op=(0.3, 0.6))
    band(f, ['with water', 'in pipes.'], seat=540, L=86)
    grain(f, 0.07)
    return f


# ------------------------------------------------------------------ B11: home by home, up the street
def melt_line(f, pts, widths, seed=0, steam=(), rim=True):
    """(round 2) the warm water UNDER the snow, as a street really shows it: the snow melted in a ragged line over the
    pipe, wet dark ground in the melt, a soft slushy lip, the honey glowing up through it from below (never a lit
    stripe lying on top), a breath of steam off it in the cold. pts near -> far, widths per point"""
    segs = list(zip(pts[:-1], pts[1:], widths[:-1], widths[1:]))
    lip, wet, glow, core = '', '', '', ''
    rr = random.Random(seed)
    for (a, b, wa, wb) in segs:
        d = f'M{a[0]:.1f},{a[1]:.1f} L{b[0]:.1f},{b[1]:.1f}'
        w = (wa + wb) / 2 * rr.uniform(0.85, 1.15)
        lip += f'<path d="{d}" stroke-width="{w + 12:.1f}"/>'
        wet += f'<path d="{d}" stroke-width="{w:.1f}"/>'
        glow += f'<path d="{d}" stroke-width="{w * 0.7:.1f}"/>'
        core += f'<path d="{d}" stroke-width="{max(1.5, w * 0.2):.1f}"/>'
    if rim:
        f.add(f'<g stroke="{warm(60, 6, 76)}" fill="none" stroke-linecap="round" opacity="0.55" filter="url(#soft1)">{lip}</g>')
    f.add(f'<g stroke="{g(15)}" fill="none" stroke-linecap="round" filter="url(#rough)">{wet}</g>')
    f.add(f'<g stroke="{HONEY}" fill="none" stroke-linecap="round" opacity="0.55" filter="url(#soft2)">{glow}</g>')
    f.add(f'<g stroke="{HONEY_CORE}" fill="none" stroke-linecap="round" opacity="0.4" filter="url(#soft2)">{core}</g>')
    for i, (x, y, sz) in enumerate(steam):
        plume(f, [(x, y - sz * 0.3), (x + sz * 0.15, y - sz * 0.9), (x + sz * 0.4, y - sz * 1.5)], [sz * 0.7, sz * 0.9, sz],
              L=86, op=0.36, filt='steam2', seed=seed + 31 + i)


def tram(f, fx, fy, s=1.0, L=40, dim=False):
    """a Helsinki tram coming down its rails toward us (three-quarter front): rounded nose, big lit windscreen, the
    destination sign, headlights, lit side windows receding up the street, the pantograph up to the wire.
    dim (B11, round 2): its lights low (no white glare, no beam on the snow), so it is life in the street, not the focus"""
    w, h = 170 * s, 190 * s
    Lwin, Lscr, Lsign = (56, 50, 62) if dim else (86, 84, 94)
    # the side, receding up-left toward the street's far end
    side = [(fx, fy - h), (fx - 150 * s, fy - h * 0.72), (fx - 150 * s, fy - h * 0.12), (fx, fy)]
    f.poly(side, g(L - 6))
    for i in range(4):
        u0, u1 = 0.08 + i * 0.22, 0.24 + i * 0.22
        p = [bil(side, u0, 0.2), bil(side, u1, 0.2), bil(side, u1, 0.48), bil(side, u0, 0.48)]
        f.poly(p, g(Lwin, -6))
    f.poly([bil(side, 0, 0.62), bil(side, 1, 0.62), bil(side, 1, 0.7), bil(side, 0, 0.7)], g(L + 12))
    # the front: rounded nose, the windscreen lit, the sign above, two headlights
    f.add(f'<path d="M{fx},{fy - h} C{fx + w * 0.2},{fy - h * 1.04} {fx + w * 0.8},{fy - h * 1.04} {fx + w},{fy - h * 0.98} '
          f'L{fx + w * 1.02},{fy - h * 0.08} C{fx + w * 0.7},{fy + h * 0.02} {fx + w * 0.3},{fy + h * 0.02} {fx},{fy}Z" fill="{g(L)}"/>')
    f.add(f'<path d="M{fx + w * 0.08},{fy - h * 0.84} L{fx + w * 0.92},{fy - h * 0.82} L{fx + w * 0.9},{fy - h * 0.42} L{fx + w * 0.1},{fy - h * 0.44}Z" fill="{g(Lscr, -6)}"/>')
    f.add(f'<rect x="{fx + w * 0.22}" y="{fy - h * 0.97}" width="{w * 0.56}" height="{h * 0.09}" rx="3" fill="{g(Lsign)}"/>')
    for hx in (0.18, 0.82):
        if dim:
            f.circle(fx + w * hx, fy - h * 0.22, 6 * s, g(70))
            continue
        f.circle(fx + w * hx, fy - h * 0.22, 9 * s, g(98))
        f.add(f'<circle cx="{fx + w * hx}" cy="{fy - h * 0.22}" r="{30 * s}" fill="{g(95)}" opacity="0.35" filter="url(#soft2)"/>')
    # the headlights' light on the snow ahead of it
    if not dim:
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
    # tram rails up the right side of the street (round 2: the tram moved back and aside onto them), its wire
    for x_near, x_far in ((900, 650), (1060, 690)):
        f.add(f'<path d="M{x_near},{H} L{x_far},1192" stroke="{g(30)}" stroke-width="5"/>')
    f.add(f'<path d="M{1140},{900} L{650},{1150}" stroke="{g(20)}" stroke-width="2.5" opacity="0.7"/>')
    # THE WARM WATER UNDER THE STREET (round 2): no cut, no lit stripe: the snow melted in a line over the pipe up each
    # kerb, the honey glowing up through it, turning in at every door the warmth has reached; ahead of its front the
    # snow is still whole, only a faint warmth under it on the way to her door

    def kerb(q, u, off):
        mm = homography(q)
        x, y = mm(u, 1.0)
        return (x + off * (1 - u), y + 10 * (1 - u))

    for q, doors, sgn, us, steam in ((lq, doors_l, 1, (0.0, 0.08, 0.16, 0.24, 0.32, 0.4, 0.44, 0.48), ((150, 1560, 70), (300, 1420, 44))),
                                     (rq, doors_r, -1, (0.04, 0.12, 0.2, 0.28, 0.36, 0.44, 0.48), ((960, 1520, 54),))):
        front_u = 0.48
        pts = [kerb(q, u, sgn * 46) for u in us]
        if sgn > 0:
            pts = [(-50, 1736)] + pts
            ws = [62] + [6 + 52 * (1 - u) ** 1.4 for u in us]
        else:
            ws = [6 + 52 * (1 - u) ** 1.4 for u in us]
        line_pts = pts
        melt_line(f, pts, ws, seed=1120 + (sgn > 0), steam=steam)
        tip = pts[-1]
        f.ellipse(tip[0], tip[1], 24, 9, HONEY_CORE, 'opacity="0.7" filter="url(#soft2)"')
        # ahead of the front, the pipe still under unmelted snow: only a faint warmth under it on the way to her door
        rest = [kerb(q, u, sgn * 46) for u in (front_u, 0.6, 0.75, 0.9, 1.0)] + [(560 + sgn * 20, 1190)]
        f.add(f'<path d="{smooth_d(rest)}" stroke="{HONEY}" stroke-width="14" fill="none" opacity="0.07" filter="url(#soft2)"/>')
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
            wb = max(5, 20 * (ty - 1150) / 600)
            melt_line(f, [uu, ((uu[0] + tx) / 2, (uu[1] + ty) / 2 + 2), (tx, ty)], [wb, wb * 0.9, wb * 0.8], seed=int(tx), rim=False)
            f.ellipse(tx, ty, 30, 10, HONEY, 'opacity="0.55" filter="url(#soft2)"')
    # the tram (round 2): moved back and aside onto the right-hand rails, its lights low
    tram(f, 680, 1300, s=0.6, L=40, dim=True)
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
    """(round 2) the home view stepped in on her block (the same place as B1, nearer): her window the warm box, her
    in it lifting her cup toward you (B5's toast returned); your phone raised, your message right on it; the pulse
    leaving from behind your phone along the shore; your bubble, the pulse and her window on one diagonal. The plan's
    frost-line building let go (it read as a neon gate): the warm run leaves the site behind your phone"""
    f = Frame(1212)
    zs, (zx, zy) = 1.25, (380, 860)  # stepped in; the tower top stays clear of the band (y 610)
    f.add(f'<g transform="translate({zx},{zy}) scale({zs}) translate({-zx},{-zy})">')
    home_view(f, wave=1.0, all_warm=True, her_step=True, her_toast=True, resident=False, pulse=True, plan_site=True,
              plan_drawn=False, pulse_x=388, dim_city=0.5)
    f.add('</g>')
    # your hand, lower left: a light knit glove and sleeve cut by the bottom edge, the phone raised; your message on it
    s = 1.0
    x, y = 100, 1234
    sw, sh = 190 * s, 330 * s
    f.add(f'<path d="M{x - 70},{H + 20} C{x - 60},{y + sh + 330} {x - 40},{y + sh + 220} {x - 26},{y + sh + 140} L{x + sw + 6},{y + sh + 140} '
          f'C{x + sw + 26},{y + sh + 240} {x + sw + 40},{y + sh + 380} {x + sw + 50},{H + 20}Z" fill="{g(30)}"/>')
    for k in range(4):
        yy = y + sh + 176 + k * 32
        f.add(f'<path d="M{x - 34 + k * 4},{yy} C{x + 50},{yy - 10} {x + 130},{yy - 8} {x + sw + 20 + k * 4},{yy + 6}" '
              f'stroke="{g(25)}" stroke-width="7" fill="none" opacity="0.6"/>')
    hand_phone(f, x, y, s=s, L_glove=34, mine_right=True)
    # your bubble glowing: the one honey on your side of the picture
    f.add(f'<rect x="{x + sw * 0.3 - 12}" y="{y + sh * 0.52 - 12}" width="{sw * 0.62 + 24}" height="{58 * s + 24}" rx="34" fill="{HONEY}" '
          f'opacity="0.5" filter="url(#glow2)"/>')
    band(f, ['could soon heat', [('an ', False), ('apartment', True)]], seat=540)
    grain(f)
    return f


# ------------------------------------------------------------------ the alternates
@frame('B4alt')
def b4alt():
    """(round 2, reworked from the idea; the seesaw retired) THE MACHINE OF FORTY KITCHENS: the one giant computer
    stands alone in a snowy little square, and where its rows of lights should be, its whole front is forty tiny lit
    kitchen windows, a kettle boiling in each, the heat of all forty pouring out of its top as ONE cloud; a neighbour
    and her dog stop and stare up. The film's own rhyme (the machine's lights in rows like a facade's windows, B2)
    turned into the joke: one computer holds a whole block's kettles"""
    f = Frame(4041)
    sky(f, [(0, 13), (0.45, 19), (0.8, 26), (1, 31)], 0, 1320)
    cloud(f, 820, 150, 700, 200, 22, 0.85, seed=401)
    # the little square held by blocks, their windows frosted and quiet (the cold city around the warm machine)
    rr = random.Random(402)
    FROST.update(glint_p=0.15)
    block(f, -40, 300, 820, 1320, 6, 4, L=23, states=lambda r_, c: 'frost', chimneys=2, frost_L=46, seed=403)
    block(f, 780, 1120, 860, 1320, 5, 4, L=21, states=lambda r_, c: 'frost', chimneys=2, frost_L=46, seed=405)
    block(f, 300, 780, 900, 1320, 5, 6, L=26, states=lambda r_, c: 'frost', chimneys=3, frost_L=44, seed=404)
    FROST.update(glint_p=0.45)
    yard = f.lingrad([(0, g(50), 1), (0.45, g(38), 1), (1, g(18), 1)])
    f.rect(0, 1320, W, 600, yard)
    f.rect(980, 1150, 10, 330, g(14))
    f.ellipse(985, 1146, 26, 10, g(20))
    f.add(f'<ellipse cx="985" cy="1166" rx="70" ry="40" fill="{g(84)}" opacity="0.22" filter="url(#soft3)"/>')
    # the ONE giant computer: rounded shoulders, a plinth, vents on top, its warm pool melted in the snow
    x0, x1, y0, y1 = 262, 818, 800, 1478
    f.ellipse((x0 + x1) / 2, y1 + 6, 360, 40, g(14), 'opacity="0.85" filter="url(#soft1)"')
    f.ellipse((x0 + x1) / 2, y1 + 6, 420, 60, HONEY, 'opacity="0.16" filter="url(#soft3)"')
    f.add(f'<rect x="{x0 - 50}" y="{y0 - 30}" width="{x1 - x0 + 100}" height="{y1 - y0 + 60}" fill="{HONEY}" opacity="0.2" filter="url(#glow2)"/>')
    f.add(f'<rect x="{x0}" y="{y0}" width="{x1 - x0}" height="{y1 - y0}" rx="34" fill="{g(12)}"/>')
    f.add(f'<rect x="{x0}" y="{y0}" width="26" height="{y1 - y0}" rx="16" fill="{g(30)}" opacity="0.8"/>')
    f.rect(x0 - 18, y1 - 26, x1 - x0 + 36, 30, g(8), 'rx="6"')
    for k in range(6):
        f.rect(x0 + 60 + k * 76, y0 + 14, 50, 14, g(26), 'rx="4"')
    # its front: forty tiny kitchen windows (8 floors of 5), each lit warm with a kettle boiling on its sill
    cols, rows = 5, 8
    gx0, gx1, gy0, gy1 = x0 + 44, x1 - 34, y0 + 48, y1 - 44
    pw, ph = (gx1 - gx0) / cols, (gy1 - gy0) / rows
    kets = ['round', 'jug', 'whistle']
    rk = random.Random(4077)
    for r_ in range(rows):
        for c in range(cols):
            wx, wy = gx0 + c * pw + 7, gy0 + r_ * ph + 8
            ww, wh = pw - 14, ph - 16
            f.rect(wx - 4, wy - 4, ww + 8, wh + 8, g(6))
            f.rect(wx, wy, ww, wh, f.radgrad([(0, HONEY_CORE, 1), (0.55, HONEY, 1), (1, AMBER, 1)], cx=rk.uniform(0.35, 0.65), cy=0.3, r=0.8))
            if rk.random() < 0.3:
                f.rect(wx, wy, ww * 0.22, wh, g(26), 'opacity="0.7"')
            kk = kettle2(f, wx + ww * rk.uniform(0.34, 0.5), wy + wh - 3, s=wh / 46, kind=kets[(r_ * cols + c) % 3], L=9)
            sx, sy = kk
            curl(f, sx, sy, h=max(10, (sy - wy) * 0.9), L=97, op=0.95, sw=5.5)
            f.rect(wx - 5, wy + wh + 1, ww + 10, 4, g(70))
        # a server's cold status lights down the side of each floor
        for j in range(3):
            f.rect(gx1 + 8, gy0 + r_ * ph + 14 + j * 14, 7, 5, g(97, -10))
    # the glass door's frame round the forty, and the thick cable into the snow: a machine, not a building
    f.add(f'<rect x="{gx0 - 12}" y="{gy0 - 12}" width="{gx1 - gx0 + 24}" height="{gy1 - gy0 + 22}" rx="10" fill="none" stroke="{g(34)}" stroke-width="5"/>')
    f.add(f'<path d="M{x1 - 60},{y1 - 4} C{x1 + 40},{y1 + 50} {x1 + 120},{y1 + 40} {x1 + 260},{y1 + 110}" stroke="{g(8)}" stroke-width="16" fill="none"/>')
    # the heat of all forty pouring up out of its top vents as ONE cloud (kept under the band)
    plume(f, [(540, y0 + 4), (544, y0 - 20), (548, y0 - 42)], [140, 165, 185], L=90, op=0.85, seed=406, warm_root=0.4)
    steam_cloud(f, 548, 748, 360, 98, seed=7, L=92, op=0.95, warm=0.12)
    # a neighbour and her pale dog stop and stare up at it
    person(f, 902, 1478, 168, L=8, pose='stand', facing=-1, rim=1, scarf=True)
    f.add(f'<path d="M866,1478 l-4,-24 l-30,-6 l-12,-12 l-10,5 l3,13 l8,24 l7,0 l0,-14 l26,2 l5,12Z" fill="{g(66)}" stroke="{g(30)}" stroke-width="2"/>')
    breath(f, 880, 1326, s=0.8)
    for k in range(10):
        f.ellipse(930 + k * 18, 1500 + k * 22, 7, 3.5, g(16), 'opacity="0.7"')
    snowfall(f, 110, sizes=(2, 5), seed=408)
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
    like a lid, and we lean in from above onto the hall inside.
    (round 2) the building given body and a place (walls of frost with her glowing lines at their edges, standing on
    the shore line she drew, the warm line running off it toward her home) and the inside given depth: we look DOWN
    into a deep hall, two rows of machines standing along an aisle that runs away from us, the cool pipe waiting on
    its floor, a cool glow at its far end"""
    f = Frame(9091)
    f.rect(0, 0, W, H, g(20))
    rr = random.Random(9092)
    bl = ''
    for k in range(60):
        bl += f'<circle cx="{rr.uniform(-60, W + 60):.0f}" cy="{rr.uniform(0, H):.0f}" r="{rr.uniform(30, 90):.0f}" opacity="{rr.uniform(0.3, 0.7):.2f}"/>'
    f.add(f'<g fill="{HONEY}" filter="url(#soft4)">{bl}</g>')
    frost_field(f, 0, 0, W, H, L=80, op=0.9, density=70, seed=9093, base_op=0.72)
    f.add(f'<rect x="0" y="0" width="{W}" height="{H}" fill="{g(10)}" opacity="0.2" filter="url(#soft4)"/>')

    # the box in an oblique view from above: X right, Y away (up and to the right), Z up
    O = (226, 1516)

    def P(X, Y, Z):
        return (O[0] + X + 0.32 * Y, O[1] - 0.62 * Y - 0.55 * Z)
    BX, BY_, BZ = 560, 520, 300
    T = [P(0, 0, BZ), P(BX, 0, BZ), P(BX, BY_, BZ), P(0, BY_, BZ)]
    # her drawn shore line under it, and the warm line running off it toward her home (her plan, as in B8)
    glow_line(f, wobble([(-20, 1530), (180, 1524), (420, 1532), (700, 1526), (1100, 1534)], amp=3, seed=9301, step=18), 12)
    glow_line(f, wobble([P(BX, 60, 0), (900, 1440), (990, 1380), (1100, 1300)], amp=3, seed=9302, step=18), 16)
    # INSIDE, seen down through the open top (clipped to the opening)
    cid = f.uid('top')
    f.defs.append(f'<clipPath id="{cid}"><polygon points="{" ".join(f"{x:.0f},{y:.0f}" for x, y in T)}"/></clipPath>')
    f.add(f'<g clip-path="url(#{cid})">')
    f.poly([P(0, 0, 0), P(BX, 0, 0), P(BX, BY_, 0), P(0, BY_, 0)], g(13))
    f.poly([P(0, BY_, 0), P(BX, BY_, 0), P(BX, BY_, BZ), P(0, BY_, BZ)], g(22))
    f.poly([P(0, 0, 0), P(0, BY_, 0), P(0, BY_, BZ), P(0, 0, BZ)], g(30))
    c = P(BX * 0.5, BY_ - 4, BZ * 0.35)
    f.ellipse(c[0], c[1], 200, 90, g(74, -10), 'opacity="0.55" filter="url(#soft4)"')
    f.ellipse(c[0], c[1], 60, 30, g(92, -8), 'opacity="0.7" filter="url(#soft3)"')
    # the cool pipe waiting on the aisle's floor, running away to the glow
    pa, pb = P(280, 0, 0), P(280, BY_, 0)
    f.add(f'<path d="M{pa[0] - 13:.0f},{pa[1]:.0f} L{pb[0] - 7:.0f},{pb[1]:.0f} L{pb[0] + 7:.0f},{pb[1]:.0f} L{pa[0] + 13:.0f},{pa[1]:.0f}Z" fill="{COOL}"/>')
    f.add(f'<path d="M{pa[0] - 5:.0f},{pa[1]:.0f} L{pb[0] - 2:.0f},{pb[1]:.0f}" stroke="{g(92, -8)}" stroke-width="3" opacity="0.8"/>')
    # two rows of machines standing along the aisle, far ones first: tops catching the light, fronts with cold lights
    for Y0 in (410, 250, 90):
        Y1 = Y0 + 70
        for (X0, X1) in ((40, 190), (370, 520)):
            Z1 = 170
            top = [P(X0, Y0, Z1), P(X1, Y0, Z1), P(X1, Y1, Z1), P(X0, Y1, Z1)]
            front = [P(X0, Y0, 0), P(X1, Y0, 0), P(X1, Y0, Z1), P(X0, Y0, Z1)]
            side = [P(X1, Y0, 0), P(X1, Y1, 0), P(X1, Y1, Z1), P(X1, Y0, Z1)]
            f.poly(side, g(16))
            f.poly(front, g(32))
            f.poly(top, g(50))
            for j in range(5):
                for k in range(4):
                    x, y = P(X0 + 22 + k * 32, Y0, Z1 * (0.18 + 0.16 * j))
                    f.circle(x, y, 3.2, g(97, -9), 'opacity="0.95"')
            frost_stroke(f, top + [top[0]], w=2.4, seed=9400 + Y0 + X0, L=92, op=0.85, feathers=False, glints=0, glow=False)
            frost_stroke(f, [front[0], front[3], front[2], front[1]], w=2.0, seed=9500 + Y0 + X0, L=90, op=0.7, feathers=False, glints=0, glow=False)
    f.add('</g>')
    # the walls she drew, with body: frost slabs (the front lit by the candle below, the side in shade), the wall tops'
    # thickness round the opening, her cleared lines glowing honey along every edge, the door
    front_w = [P(0, 0, 0), P(BX, 0, 0), P(BX, 0, BZ), P(0, 0, BZ)]
    side_w = [P(BX, 0, 0), P(BX, BY_, 0), P(BX, BY_, BZ), P(BX, 0, BZ)]
    frost_solid(f, side_w, L=56, seed=9601, ferns=6, warm=0.12)
    frost_solid(f, front_w, L=70, seed=9602, ferns=10, warm=0.18)
    rim = [P(-8, -12, BZ), P(BX + 8, -12, BZ), P(BX + 8, BY_ + 8, BZ), P(-8, BY_ + 8, BZ)]
    f.add(f'<polygon points="{" ".join(f"{x:.1f},{y:.1f}" for x, y in rim + [rim[0]] + T[::-1])}" fill="{g(84)}" fill-rule="evenodd" opacity="0.9"/>')
    glow_line(f, wobble([front_w[3], front_w[0], front_w[1], front_w[2], front_w[3]], amp=3, seed=9201, step=18), 20)
    glow_line(f, wobble([side_w[0], side_w[1], side_w[2], side_w[3]], amp=3, seed=9202, step=18), 16)
    glow_line(f, wobble([T[3], T[2]], amp=3, seed=9203, step=18), 12)
    glow_line(f, wobble([T[0], T[3]], amp=3, seed=9204, step=18), 12)
    d0, d1 = P(230, 0, 0), P(330, 0, 150)
    glow_line(f, wobble([d0, (d0[0], d1[1]), (d1[0], d1[1]), (d1[0], d0[1])], amp=2.5, seed=9205, step=16), 15)
    # the roof: a sheet of frost hinged at the back, lifted up like a lid, its underside toward us, its edge catching
    # the warm light; her fingertip under its edge
    R = [P(0, BY_, BZ), P(BX, BY_, BZ), P(BX, BY_ + 45, BZ + 518), P(0, BY_ + 45, BZ + 518)]
    f.poly(R, f.lingrad([(0, g(70), 1), (1, g(86), 1)], x1=0, y1=1, x2=0, y2=0))
    rc = f.uid('roof')
    f.defs.append(f'<clipPath id="{rc}"><polygon points="{" ".join(f"{x:.0f},{y:.0f}" for x, y in R)}"/></clipPath>')
    f.add(f'<g clip-path="url(#{rc})">')
    for k in range(8):
        x, y = bil([R[3], R[2], R[1], R[0]], 0.06 + k * 0.125, 0.97)
        frost_fern(f, x, y, -1.57 + rr.uniform(-0.5, 0.5), 170, depth=3, L=99, op=0.55, sw=2.4, seed=9300 + k)
    for k in range(5):
        x, y = bil(R, rr.uniform(0.1, 0.9), rr.uniform(0.1, 0.9))
        glint(f, x, y, rr.uniform(10, 18))
    f.add('</g>')
    glow_line(f, wobble([R[3], R[2]], amp=2.5, seed=9206, step=16), 12)
    glow_line(f, wobble([R[0], R[1]], amp=2.5, seed=9207, step=16), 10)
    knit_hand(f, (R[2][0] - 70, R[2][1] + 8), reach=1.0, rot=-18)
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
