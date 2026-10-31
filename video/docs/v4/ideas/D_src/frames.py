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


# ------------------------------------------------------------------ the far city: seventy thousand homes across the bay
def sea_of_windows(seed, x0, x1, base, top, warm_p=0.85, wave_left=0.3, front=0.16, s=1.0, domes_u=None):
    """Round 2 (B1's note 2, the board read's one world): Helsinki across the bay as it is, long and low, never a wall
    of towers. Jugend blocks of five to seven storeys stand shoulder to shoulder along the far shore in three rows
    stepping gently up the city's slope (the far rows paler, their windows smaller); each is a grid of windows under a
    steep tin roof carrying snow (chimneys, lit dormers; here a corner turret's pointed cap, there a curved Jugend
    gable). Still a sea of windows: the wave of warmth runs right to left, warm past its front, just turning at it,
    still cold before it. Uspenski's onion domes (at domes_u of the width) rise over the middle row's roofs into the
    glow. s scales every size (the old B2's door draws the same city small)."""
    rnd = random.Random(seed)
    Ht, span = float(base - top), float(x1 - x0)
    out = []

    def win(wins, wx, wy, ww, wh, wcol):
        t = (wx - x0) / span
        pw = warm_p * min(1.0, max(0.0, (t - wave_left) / front + 0.06))
        u = rnd.random()
        if u < pw:
            wins.append(rect(wx, wy, ww, wh, HONEY if rnd.random() < 0.62 else HONEY_MID, opacity=f(rnd.uniform(0.8, 1.0))))
        elif u < pw + 0.06 and 0 < (t - wave_left) < front:
            wins.append(rect(wx, wy, ww, wh, HONEY_DEEP))           # just turning, at the wave's front
        elif u < pw + (0.34 if pw < 0.4 else 0.1):
            wins.append(rect(wx, wy, ww, wh, wcol))

    # back to front: (the row's foot, facade height as a share of Ht, facade, snow on the roof, tin, a cold window,
    # window w / h, window step x / y, block width)
    rows = ((base - 0.52 * Ht, (0.17, 0.25), g(20), g(24), g(42), g(29), 3.4, 4.4, 6.6, 8.8, (70, 130)),
            (base - 0.26 * Ht, (0.21, 0.30), g(16), g(20), g(46), g(27), 4.4, 5.6, 8.4, 11.2, (90, 165)),
            (base, (0.27, 0.36), g(12), g(16), g(50), g(25), 5.6, 7.2, 10.6, 13.8, (110, 200)))
    for b, (h0, h1), fac, tin, snowc, wcol, ww, wh, gx, gy, (w0, w1) in rows:
        ww, wh, gx, gy = ww * s, wh * s, gx * s, gy * s
        o, wins = [], []
        x = x0 - 40 * s
        while x < x1 + 40 * s:
            w = rnd.uniform(w0, w1) * s
            fh = rnd.uniform(h0, h1) * Ht
            rh = fh * rnd.uniform(0.28, 0.4)                    # the steep tin roof
            et = b - fh                                          # the eave
            ins = rh * 0.8
            kind = rnd.random()
            o.append(rect(x, et, w, fh + 70 * s, fac))
            o.append(poly([(x - 1.5 * s, et + 1), (x + ins, et - rh), (x + w - ins, et - rh), (x + w + 1.5 * s, et + 1)], tin))
            o.append(line(x + ins, et - rh, x + w - ins, et - rh, snowc, 2.6 * s) + line(x - 1.5 * s, et, x + w + 1.5 * s, et, snowc, 2.2 * s, opacity='0.8') +
                     line(x - 1.5 * s, et + 1, x + ins, et - rh, snowc, 1.6 * s, opacity='0.7') + line(x + w + 1.5 * s, et + 1, x + w - ins, et - rh, snowc, 1.6 * s, opacity='0.7'))
            for _ in range(rnd.randint(1, 2)):                   # chimneys on the ridge, capped with snow
                cx_ = rnd.uniform(x + ins + 4 * s, max(x + ins + 5 * s, x + w - ins - 10 * s))
                ch = rnd.uniform(8, 14) * s
                o.append(rect(cx_, et - rh - ch * 0.6, 5 * s, ch, tin) + rect(cx_ - 1 * s, et - rh - ch * 0.6 - 2 * s, 7 * s, 3 * s, snowc))
            nd = int((w - 2 * ins - 8 * s) // (24 * s))          # dormers in the roof, some lit
            for k in range(nd):
                dx_, dy_ = x + ins + 8 * s + k * 24 * s, et - rh * 0.5
                o.append(rect(dx_, dy_, 11 * s, rh * 0.42, fac) + poly([(dx_ - 2 * s, dy_ + 1), (dx_ + 5.5 * s, dy_ - 6 * s), (dx_ + 13 * s, dy_ + 1)], snowc))
                win(wins, dx_ + 3 * s, dy_ + 2 * s, ww * 0.85, wh * 0.85, wcol)
            if kind < 0.24:
                # a corner turret: a pointed cap over the corner bay
                tw_ = 18 * s
                tx = x + (w - tw_ if rnd.random() < 0.5 else 0)
                o.append(rect(tx, et - rh * 0.75, tw_, rh * 0.75 + 2, fac))
                o.append(poly([(tx - 2.5 * s, et - rh * 0.75 + 1), (tx + tw_ / 2, et - rh * 0.75 - rh * 1.25), (tx + tw_ + 2.5 * s, et - rh * 0.75 + 1)], tin))
                o.append(poly([(tx + tw_ * 0.2, et - rh * 0.75 - rh * 0.25), (tx + tw_ / 2, et - rh * 0.75 - rh * 1.25), (tx + tw_ * 0.5, et - rh * 0.75 - rh * 0.2)], snowc))
                win(wins, tx + (tw_ - ww) / 2, et - rh * 0.6, ww, wh, wcol)
            elif kind < 0.44:
                # a curved Jugend gable over the middle bays
                gw, gh = w * 0.34, rh * 1.15
                gx0 = x + (w - gw) / 2
                o.append(path('M %s %s L %s %s C %s %s %s %s %s %s C %s %s %s %s %s %s L %s %s Z' % (
                    f(gx0), f(et + 1), f(gx0), f(et - gh * 0.5), f(gx0), f(et - gh * 0.95), f(gx0 + gw * 0.3), f(et - gh), f(gx0 + gw / 2), f(et - gh),
                    f(gx0 + gw * 0.7), f(et - gh), f(gx0 + gw), f(et - gh * 0.95), f(gx0 + gw), f(et - gh * 0.5), f(gx0 + gw), f(et + 1)), fac))
                o.append(path('M %s %s C %s %s %s %s %s %s C %s %s %s %s %s %s' % (
                    f(gx0), f(et - gh * 0.5), f(gx0), f(et - gh * 0.95), f(gx0 + gw * 0.3), f(et - gh), f(gx0 + gw / 2), f(et - gh),
                    f(gx0 + gw * 0.7), f(et - gh), f(gx0 + gw), f(et - gh * 0.95), f(gx0 + gw), f(et - gh * 0.5)), 'none', stroke=snowc, stroke_width=f(2.4 * s)))
                win(wins, gx0 + gw / 2 - ww * 0.6, et - gh * 0.62, ww * 1.2, wh * 1.1, wcol)
            # its windows: a grid, five to seven storeys under the eave
            ncols = max(1, int((w - 8 * s) // gx))
            off = (w - ncols * gx) / 2 + (gx - ww) / 2
            for r in range(max(1, int((fh - 5 * s) // gy))):
                for c in range(ncols):
                    win(wins, x + off + c * gx, et + 5 * s + r * gy, ww, wh, wcol)
            x += w * rnd.uniform(0.92, 1.0)                      # shoulder to shoulder
        out.append(grp(''.join(o), filter='url(#b1)') + ''.join(wins))
        if domes_u is not None and len(out) == 1:
            out.append(grp(domes(x0 + domes_u * span, base - 0.26 * Ht + 4 * s, 0.6 * s, g(11), snowcol=g(46)), filter='url(#rough2)'))
    return ''.join(out)


# ------------------------------------------------------------------ shared: her flat's big window and the view
def night_view(seed, x0, y0, x1, y1, horizon=1000, warm_p=0.75, wave_left=0.25, domes_at=(250, 1012), ships=True,
               near_roofs=True, plan=None, frost_clear=False, roof_y=1085, sky_top=10, glow=34, city='belt', city_top=None, domes_u=None):
    """The view from her window over Katajanokka's roofs to the bay and the far city. Returns (defs, body).
    city='sea': the far city up and wide, a sea of windows (her living-room window, B1 and B12: the same view)."""
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
    # the far city across the bay: a belt of roofs standing in the glow (its random draws are made either way, so
    # everything after it in the view stays as it was)
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
    if city == 'sea':
        # the far city wide and low in the glass (round 2: Helsinki's harbour blocks, never a wall of towers): seventy
        # thousand homes, a sea of windows; a harbour crane over the far quay
        top = city_top or horizon - 260
        o.append(grp(ell(x0 + 0.55 * (x1 - x0), top + 70, (x1 - x0) * 0.62, 95, g(40), opacity='0.75'), filter='url(#b30)'))  # the city's glow on the snow cloud
        o.append(grp(ell(x0 + (0.5 + 0.5 * wave_left) * (x1 - x0), top + 80, (x1 - x0) * (0.5 - 0.4 * wave_left), 80, HONEY_DEEP, opacity='0.22'), filter='url(#b30)'))
        o.append(grp(pline([(900, top + 150), (900, top + 34), (826, top + 46)], g(19), 5) + line(900, top + 34, 984, top + 50, g(19), 3),
                     filter='url(#b1)'))
        o.append(sea_of_windows(seed * 7 + 3, x0, x1, horizon + 6, top, warm_p, wave_left, domes_u=domes_u))
    else:
        o.append(grp(''.join(fc), filter='url(#b1)'))
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
# round 2 (one real Helsinki): Uspenski's onion domes over the roofs, rising into the city's glow (B1 and B12, the same)
DOMES_U = 0.8


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
    d2, view = night_view(41, gx0, gy0, gx1, gy1, horizon=1040, warm_p=0.95 if warm else 0.92,
                          wave_left=0.0 if warm else 0.36, domes_at=None, domes_u=DOMES_U, city='sea', city_top=772, roof_y=1140)
    defs += d2
    o.append('<g clip-path="url(#glass)">' + view)
    if not warm:
        # the hook's event: the pane frosted over at frame 0, caught mid-clear, the frost melting back from the middle
        # onto the city warming. Round 2 (note 1: the clearing read as a dark cloud, as smoke): the frost is one even veil
        # cut cleanly at the melting edge (no soft dark halo round it), the edge a bright lacy rim of crystals, wet just
        # inside, drops running down from it through the frost; the cleared glass clean (no frost line across the city)
        cx, cy, rx, ry = 612, 916, 350, 196
        edge = blob(57, cx, cy, rx, ry, n=22, jit=0.14)
        hole = smooth_closed(edge)
        bigger = smooth_closed([(cx + (x_ - cx) * 1.03, cy + (y_ - cy) * 1.03) for x_, y_ in edge])
        rr = random.Random(56)
        # the drops: water running down from the lower edge, each clearing its own channel through the frost
        trails, drops = [], ''
        for k in (2, 3, 4, 5, 6, 7, 8, 9):
            if k in (4, 8):
                continue
            ex, ey = edge[k]
            ex, ey = cx + (ex - cx) * 0.97 + rr.uniform(-14, 14), cy + (ey - cy) * 0.97
            L = rr.uniform(90, 230)
            trails.append(([(ex + math.sin(v * 0.9 + k) * 3.0, ey + v * L / 6.0) for v in range(7)], rr.uniform(8, 11)))
        tr_mask = ''.join(pline(p_, 'black', w_) for p_, w_ in trails)
        defs += '<clipPath id="lowpanes"><rect x="%d" y="652" width="%d" height="%d"/></clipPath>' % (gx0, gx1 - gx0, gy1 - 652)
        defs += ('<mask id="frostm" maskUnits="userSpaceOnUse" x="0" y="0" width="1080" height="1920">'
                 '<rect x="0" y="0" width="1080" height="1920" fill="white"/>'
                 '<g filter="url(#b1)"><path d="%s" fill="black"/>%s</g></mask>') % (hole, tr_mask)
        defs += ('<mask id="fernm" maskUnits="userSpaceOnUse" x="0" y="0" width="1080" height="1920">'
                 '<rect x="0" y="0" width="1080" height="1920" fill="white"/>'
                 '<path d="%s" fill="black"/>%s</mask>') % (bigger, ''.join(pline(p_, 'black', w_ + 6) for p_, w_ in trails))
        defs += ('<mask id="outh" maskUnits="userSpaceOnUse" x="0" y="0" width="1080" height="1920">'
                 '<rect x="0" y="0" width="1080" height="1920" fill="white"/><path d="%s" fill="black"/></mask>'
                 '<mask id="inh" maskUnits="userSpaceOnUse" x="0" y="0" width="1080" height="1920"><path d="%s" fill="white"/></mask>') % (hole, hole)
        defs += ('<filter id="lace" x="-10%" y="-10%" width="120%" height="120%">'
                 '<feTurbulence type="fractalNoise" baseFrequency="0.07" numOctaves="2" seed="41" result="n"/>'
                 '<feDisplacementMap in="SourceGraphic" in2="n" scale="16" xChannelSelector="R" yChannelSelector="G" result="d"/>'
                 '<feTurbulence type="fractalNoise" baseFrequency="0.42" numOctaves="2" seed="43" result="gr"/>'
                 '<feColorMatrix in="gr" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 3.6 -1.25" result="m"/>'
                 '<feTurbulence type="fractalNoise" baseFrequency="0.011" numOctaves="2" seed="47" result="lo"/>'
                 '<feColorMatrix in="lo" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 3.0 -0.75" result="m2"/>'
                 '<feComposite in="d" in2="m" operator="in" result="c"/><feComposite in="c" in2="m2" operator="in" result="c2"/>'
                 '<feGaussianBlur in="c2" stdDeviation="0.5"/></filter>')
        veil = (rect(gx0, 652, gx1 - gx0, gy1 - 652, '#dbe3ec', opacity='0.52') +
                rect(gx0, 1150, gx1 - gx0, gy1 - 1150, '#e8eef4', opacity='0.22'))
        o.append('<g clip-path="url(#lowpanes)"><g mask="url(#frostm)">' + veil + '</g>'
                 '<g mask="url(#fernm)">' + frost(5, gx0, 652, gx1, gy1, n=190, op=0.85, interior=0.62) + '</g>')
        # the rim: the crystals heaped bright and lacy along the melting edge, feathering out into the frost
        rim = (grp(grp(path(hole, 'none', stroke='#f6f9fc', stroke_width='120', opacity='0.5'), filter='url(#lace)'), mask='url(#outh)') +
               grp(grp(path(hole, 'none', stroke='#f6f9fc', stroke_width='50'), filter='url(#lace)'), mask='url(#outh)') +
               grp(grp(path(hole, 'none', stroke='#ffffff', stroke_width='12', opacity='0.95'), filter='url(#frostf)'), mask='url(#outh)'))
        feathers = []
        ne = len(edge)
        for k in range(ne * 4):
            a_, b_ = edge[(k // 4) % ne], edge[(k // 4 + 1) % ne]
            t_ = (k % 4) / 4.0
            px_, py_ = a_[0] + (b_[0] - a_[0]) * t_, a_[1] + (b_[1] - a_[1]) * t_
            ang = math.atan2((py_ - cy) / ry, (px_ - cx) / rx) + rr.uniform(-0.7, 0.7)
            L_ = rr.uniform(26, 70)
            qx, qy = px_ + math.cos(ang) * L_, py_ + math.sin(ang) * L_
            feathers.append(line(px_, py_, qx, qy, '#f4f8fc', rr.uniform(2.0, 3.2), opacity=f(rr.uniform(0.6, 0.95))))
            for side in (-1, 1):
                mx, my = px_ + (qx - px_) * 0.5, py_ + (qy - py_) * 0.5
                feathers.append(line(mx, my, mx + math.cos(ang + side * 0.9) * L_ * 0.35, my + math.sin(ang + side * 0.9) * L_ * 0.35,
                                     '#f4f8fc', 1.2, opacity='0.7'))
        rim += grp(grp(''.join(feathers), filter='url(#frostf)'), mask='url(#outh)')
        o.append(rim)
        # wet just inside the edge: a film of water on the glass, catching the light, beads of water along it (the
        # lowest ones catching the city's warm light)
        o.append(grp(grp(path(hole, 'none', stroke='#e9eff6', stroke_width='30', opacity='0.24'), filter='url(#b2)'), mask='url(#inh)'))
        for k in range(ne * 3):
            a_, b_ = edge[(k // 3) % ne], edge[(k // 3 + 1) % ne]
            t_ = (k % 3) / 3.0 + rr.uniform(0, 0.3)
            px_, py_ = a_[0] + (b_[0] - a_[0]) * t_, a_[1] + (b_[1] - a_[1]) * t_
            px_, py_ = cx + (px_ - cx) * rr.uniform(0.94, 0.985), cy + (py_ - cy) * rr.uniform(0.94, 0.985)
            r_ = rr.uniform(2.4, 5.2)
            warm_bead = py_ > cy + ry * 0.45 and rr.random() < 0.5
            o.append(circ(px_, py_, r_, HONEY_HI if warm_bead else '#eef3f8', opacity=f(rr.uniform(0.6, 0.95))) +
                     circ(px_ - r_ * 0.3, py_ - r_ * 0.35, r_ * 0.35, '#ffffff', opacity='0.9'))
        # the drops' trails: a wet glint down one side of each channel, the drop itself at its foot
        for p_, w_ in trails:
            o.append(pline([(x_ - w_ * 0.45, y_) for x_, y_ in p_], '#f2f6fa', 2.6, opacity='0.75') + pline([(x_ + w_ * 0.45, y_) for x_, y_ in p_], '#f2f6fa', 1.4, opacity='0.4'))
            lx, ly = p_[-1]
            o.append(ell(lx, ly + 4, w_ * 0.72, w_ * 0.9, '#eef3f8', opacity='0.95') + ell(lx, ly + 7, w_ * 0.55, w_ * 0.5, g(46), opacity='0.55') +
                     circ(lx - w_ * 0.25, ly, w_ * 0.22, '#ffffff'))
        o.append('</g>')
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
    # the radiator: cold in B1, only its first fin waking on the "ding" (its full warmth is B12's)
    # (round 2 polish: the radiator two fins further left, so its waking fin and pipe sit clear of the app's right rail)
    o.append(radiator(355, 1386, 520, 214, n=16, warm=1.0 if warm else 1.0 / 16))
    if warm:
        o.append(grp(rect(430, 1600, 520, 36, HONEY_DEEP, opacity='0.22'), filter='url(#b16)'))
    else:
        o.append(grp(rect(835, 1600, 60, 22, HONEY_DEEP, opacity='0.16'), filter='url(#b8)'))
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
    # the same view as B1 (round 1: B1's far city is now a sea of windows; B12 shows the same city, all of it warm)
    d2, view = night_view(41, gx0, gy0, gx1, gy1, horizon=1010, warm_p=0.98, wave_left=0.0, domes_at=None, domes_u=DOMES_U, roof_y=1110,
                          city='sea', city_top=742)
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
def camera(Hc, pitch, F, cx, cy):
    """A camera Hc metres up, pitched down by `pitch` degrees: world (X right, Y up, Z ahead) -> screen px."""
    ct, st = math.cos(math.radians(pitch)), math.sin(math.radians(pitch))

    def P(X, Y, Z):
        yc = Y - Hc
        yy, zz = yc * ct + Z * st, -yc * st + Z * ct
        return (cx + F * X / zz, cy - F * yy / zz)
    return P


def B2():
    """Round 1: a CITY of machines seen from a catwalk high in the hall, as her street is seen from her window (B11):
    rows of giant computers like blocks of flats, their tops like flat roofs, the aisles like streets with walkers and a
    cart coming up the main one like the tram, their lights in rows like a city's windows at night; at the end of the
    main aisle the wide door open to the snow is the frame's one light, and in it, across the bay, her city's warm windows.
    Round 2 (note 1: it read as a city under the night sky as easily as a hall): the hall's roof shown (its trusses with
    rows of lights running to the door) and a machine detail no building has (fan grilles on the computers' tops, cable
    trays bridging the aisles); the layout keeps the rhyme with B11. Now D-B2alt: D-B2 is her armchair among the giants."""
    defs = lin_grad('ceil2', [(0, g(4)), (1, g(9))], x1=0, y1=0, x2=0, y2=600, units=True)
    o = [rect(0, 0, W, H, 'url(#ceil2)')]
    rnd = random.Random(72)
    P = camera(11.0, 32.0, 760.0, 610.0, 1080.0)
    ZF, HR = 36.0, 3.3                       # the far wall; the computers' height (giant: about twice a person)
    # the far wall, and the wide door at the end of the main aisle: the snowy night, the bay, her city's warm windows
    o.append(poly([P(-40, 12, ZF), P(40, 12, ZF), P(40, 0, ZF), P(-40, 0, ZF)], g(8)))
    d0, d1, d2, d3 = P(-7.5, 10, ZF), P(7.5, 10, ZF), P(7.5, 0, ZF), P(-7.5, 0, ZF)
    dx0, dx1, dy0, dy1 = d3[0], d2[0], d0[1], d3[1]
    defs += '<clipPath id="door2"><polygon points="%s"/></clipPath>' % pts([d0, d1, d2, d3])
    defs += lin_grad('dsky2', [(0, g(12)), (1, g(30))], x1=0, y1=dy0, x2=0, y2=dy1, units=True)
    door = rect(dx0 - 20, dy0 - 10, dx1 - dx0 + 40, dy1 - dy0 + 20, 'url(#dsky2)')
    hz = dy0 + (dy1 - dy0) * 0.56
    door += sea_of_windows(2027, dx0 - 14, dx1 + 10, hz, hz - 46, warm_p=0.9, wave_left=0.0, s=0.34)   # her city across the bay (round 2: one Helsinki)
    door += rect(dx0 - 20, hz + 2, dx1 - dx0 + 40, 12, g(24))                        # the frozen bay
    door += rect(dx0 - 20, hz + 14, dx1 - dx0 + 40, dy1 - hz, g(86))                 # the lit snow outside the door
    door += poly([(dx0 + 50, dy1), ((dx0 + dx1) / 2 - 12, hz + 16), ((dx0 + dx1) / 2 + 12, hz + 16), (dx1 - 50, dy1)], g(74), opacity='0.6')
    door += snow(2021, 70, dx0, dy0, dx1, dy1, 1.3, 2.8, op=(0.5, 0.95), band_half=False)
    o.append(grp(ell((dx0 + dx1) / 2, (dy0 + dy1) / 2, (dx1 - dx0) * 0.75, (dy1 - dy0) * 0.8, '#dfe7f0', opacity='0.16'), filter='url(#b30)'))
    o.append('<g clip-path="url(#door2)">' + door + '</g>')
    # the door's jambs and the rolled-up door at its head
    o.append(poly([P(-7.9, 10.4, ZF), P(7.9, 10.4, ZF), P(7.9, 10, ZF), P(-7.9, 10, ZF)], g(20)))
    for sx in (-7.9, 7.5):
        o.append(poly([P(sx, 10, ZF), P(sx + 0.4, 10, ZF), P(sx + 0.4, 0, ZF), P(sx, 0, ZF)], g(18)))
    # round 2: the hall's roof: its trusses' lower chords spanning the hall and the rows of lights hung under them,
    # running away to the door (only below the caption band)
    defs += '<clipPath id="roof2"><rect x="0" y="604" width="1080" height="400"/></clipPath>'
    rf, glow = [], []
    for Z in (5.0, 6.4, 8.2, 10.6, 14.0, 19.0, 26.0):
        a_, b_ = P(-40, 10.6, Z), P(40, 10.6, Z)
        rf.append(line(a_[0], a_[1], b_[0], b_[1], g(32), max(2.0, 36.0 / Z)))
        for X in range(-36, 37, 4):
            q = P(X, 10.25, Z)
            if -20 < q[0] < 1100:
                rf.append(rect(q[0] - 95.0 / Z, q[1] - 8.0 / Z, 190.0 / Z, 26.0 / Z, '#f0f6fc'))
                glow.append(ell(q[0], q[1] + 40.0 / Z, 260.0 / Z, 110.0 / Z, '#dfe9f4', opacity='0.35'))
    for X in (-12.0, -4.0, 4.0, 12.0):
        a_, b_ = P(X, 10.4, 4.5), P(X, 10.4, 36)
        rf.append(line(a_[0], a_[1], b_[0], b_[1], '#cfdbe8', 3, opacity='0.55'))
    o.append('<g clip-path="url(#roof2)">' + grp(''.join(glow), filter='url(#b8)') + grp(''.join(rf), filter='url(#b1)') + '</g>')
    o.append(grp(ell(610, 650, 520, 70, '#cfdbe8', opacity='0.1'), filter='url(#b30)'))
    # the floor of the hall, its main aisle lit by the door (the light running toward us like a lit street)
    o.append(poly([P(-40, 0, 1.0), P(40, 0, 1.0), P(40, 0, ZF), P(-40, 0, ZF)], g(11)))
    o.append(grp(poly([P(-1.8, 0, 2), P(1.8, 0, 2), P(6, 0, ZF), P(-6, 0, ZF)], g(46), opacity='0.6'), filter='url(#b16)'))
    for zz in range(2, 36, 2):
        o.append(line(*P(-1.8, 0, zz), *P(1.8, 0, zz), g(30), 1.2, opacity='0.5'))
    # the blocks: rows of computers back to back, in segments between cross aisles (the side streets)
    rows = [(1.8, 4.2), (5.8, 8.2), (9.8, 12.2), (13.8, 16.2), (17.8, 20.2)]
    segs = [(1.0, 10.4), (12.4, 22.0), (24.0, 34.4)]

    def face_side(X, z0, z1, toward):
        """The side face at X between z0 and z1, its lights in rows like a block's windows."""
        out = poly([P(X, HR, z0), P(X, HR, z1), P(X, 0, z1), P(X, 0, z0)], g(12))
        zz = z0 + 0.1
        while zz < z1 - 0.5:
            for k in range(7):
                yb = 0.35 + k * 0.4
                u = rnd.random()
                if u < 0.72:
                    c = '#dbe6f2' if u < 0.3 else ('#a9bacd' if u < 0.55 else '#6f7f93')
                    out += poly([P(X, yb + 0.16, zz + 0.08), P(X, yb + 0.16, zz + 0.46), P(X, yb, zz + 0.46), P(X, yb, zz + 0.08)], c)
            out += line(*P(X, HR, zz), *P(X, 0, zz), g(7), 1.4)
            zz += 0.6
        return out

    def face_end(xa, xb, Z):
        out = poly([P(xa, HR, Z), P(xb, HR, Z), P(xb, 0, Z), P(xa, 0, Z)], g(10))
        n = max(1, int((xb - xa) / 0.6))
        for q in range(n):
            for k in range(7):
                if rnd.random() < 0.6:
                    x0_, x1_ = xa + q * 0.6 + 0.1, xa + q * 0.6 + 0.48
                    yb = 0.35 + k * 0.4
                    out += poly([P(x0_, yb + 0.16, Z), P(x1_, yb + 0.16, Z), P(x1_, yb, Z), P(x0_, yb, Z)], '#c3d1e0' if rnd.random() < 0.5 else '#8495a9')
        return out

    def top(xa, xb, z0, z1):
        """The top of a row of computers: cable trays along it and, round 2, its fan grilles (the machine detail no
        building has): round fans side by side down its length."""
        out = poly([P(xa, HR, z0), P(xb, HR, z0), P(xb, HR, z1), P(xa, HR, z1)], g(30))
        out += line(*P((xa + xb) / 2, HR, z0), *P((xa + xb) / 2, HR, z1), g(22), 2)
        for k in (0.06, 0.94):
            out += line(*P(xa + (xb - xa) * k, HR, z0), *P(xa + (xb - xa) * k, HR, z1), g(38), 1.4)
        zz = z0 + 0.55
        while zz < z1 - 0.4:
            for xc in (xa + (xb - xa) * 0.27, xa + (xb - xa) * 0.73):
                c_ = P(xc, HR, zz)
                rx_ = abs(P(xc + 0.42, HR, zz)[0] - c_[0])
                ry_ = abs(P(xc, HR, zz + 0.42)[1] - P(xc, HR, zz - 0.42)[1]) / 2
                if rx_ < 2.2:
                    continue
                out += (ell(c_[0], c_[1], rx_, ry_, g(46)) + ell(c_[0], c_[1], rx_ * 0.8, ry_ * 0.8, g(13)) +
                        line(c_[0] - rx_ * 0.8, c_[1], c_[0] + rx_ * 0.8, c_[1], g(40), max(0.8, rx_ * 0.12)) +
                        line(c_[0], c_[1] - ry_ * 0.8, c_[0], c_[1] + ry_ * 0.8, g(40), max(0.8, rx_ * 0.12)) +
                        circ(c_[0], c_[1], max(0.8, rx_ * 0.18), g(52)))
            zz += 1.0
        return out

    blocks = []
    for xa, xb in rows:
        for sgn in (-1, 1):
            xa_, xb_ = (xa, xb) if sgn > 0 else (-xb, -xa)
            for z0, z1 in segs:
                blocks.append((xa_, xb_, z0, z1, sgn))
    blocks.sort(key=lambda b_: (-(b_[2] + b_[3]), -abs(b_[0] + b_[1])))
    for xa_, xb_, z0, z1, sgn in blocks:
        inner = xa_ if sgn > 0 else xb_
        o.append(face_side(inner, z0, z1, sgn))
        o.append(face_end(xa_, xb_, z0))
        o.append(top(xa_, xb_, z0, z1))
    # round 2: cable trays bridging the side aisles from row to row, a little above the computers' tops
    trays = []
    for xa, xb in rows[:-1]:
        nxt = [r_ for r_ in rows if r_[0] > xb][0]
        for sgn in (-1, 1):
            for Z in (3.2, 7.0, 11.0, 15.4, 19.6, 24.0, 28.6, 33.0):
                a0, a1 = sgn * xb, sgn * nxt[0]
                for dz in (0.0, 0.32):
                    p0, p1 = P(a0, HR + 0.5, Z + dz), P(a1, HR + 0.5, Z + dz)
                    trays.append(line(p0[0], p0[1], p1[0], p1[1], g(40), max(1.0, 9.0 / Z)))
                for t_ in (0.25, 0.5, 0.75):
                    xx = a0 + (a1 - a0) * t_
                    p0, p1 = P(xx, HR + 0.5, Z), P(xx, HR + 0.5, Z + 0.32)
                    trays.append(line(p0[0], p0[1], p1[0], p1[1], g(40), max(0.8, 6.0 / Z)))
    o.append(''.join(trays))
    # the life of the streets: walkers in the aisles, a cart coming up the main one (the tram's rhyme)
    def walker(X, Z, lit=False):
        fx, fy = P(X, 0, Z)
        hx, hy = P(X, 1.75, Z)
        hh = fy - hy
        return (ell(fx, fy, hh * 0.22, hh * 0.06, g(6), opacity='0.6') +
                rect(fx - hh * 0.13, hy + hh * 0.16, hh * 0.26, hh * 0.84, g(4), rx=f(hh * 0.1)) + circ(fx, hy + hh * 0.08, hh * 0.1, g(4)))
    for X, Z in ((0.6, 15.0), (-0.9, 20.5), (0.3, 27.0), (-5.0, 11.4), (7.0, 23.0), (-7.0, 23.2), (11.2, 11.3)):
        o.append(walker(X, Z))
    c0, c1, c2, c3 = P(-0.9, 1.3, 8.0), P(0.9, 1.3, 8.0), P(0.9, 0, 8.0), P(-0.9, 0, 8.0)
    t0, t1 = P(-0.9, 1.3, 10.2), P(0.9, 1.3, 10.2)
    o.append(walker(0.2, 10.8))
    o.append(poly([c0, c1, t1, t0], g(46)) + poly([c0, c1, c2, c3], g(20)) + circ((c0[0] + c1[0]) / 2, (c0[1] + c2[1]) / 2, 4, '#dbe6f2'))
    # the catwalk at the bottom (the near hint)
    o.append(rect(0, 1760, W, 160, g(9)))
    o.append(line(0, 1700, W, 1700, g(26), 10) + line(0, 1760, W, 1760, g(20), 8))
    for k in range(9):
        o.append(line(60 + k * 125, 1700, 60 + k * 125, 1920, g(20), 9))
    caption = cap('AI runs on', '*giant| computers')
    return defs, ''.join(o), caption


# ------------------------------------------------------------------ D-B3: the building the snow can't touch
def B3():
    # round 2 (note 2: black on a black sky): the sky lifted behind it, the vapour lit by the city's glow, so the
    # building stands as a black, steaming mass in white
    defs = lin_grad('sky3', [(0, g(10)), (0.26, g(12)), (0.52, g(15)), (0.7, g(34)), (0.86, g(52)), (1, g(60))], x1=0, y1=0, x2=0, y2=1150, units=True)
    o = [rect(0, 0, W, 1160, 'url(#sky3)')]
    o.append(grp(ell(520, 950, 660, 170, '#e2e7ee', opacity='0.6'), filter='url(#b30)'))
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
    # the melted ring round the building: bare wet ground (round 2, note 3: it read as a shadow; its puddles and steam
    # are drawn in front of the building, below)
    o.append(grp(path('M -20 1236 C 120 1180 360 1196 520 1188 C 700 1180 940 1170 1100 1222 L 1100 1300 C 900 1352 640 1376 420 1366 C 220 1356 60 1330 -20 1296 Z', g(20)), filter='url(#rough)'))
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
    # the bare roof, wet and shining (no snow can stay on it): a sheen along its edge, water running down the wall
    o.append(poly([(60, 952), (990, 922), (990, 929), (60, 959)], g(46), opacity='0.8'))
    for k in range(9):
        x = 120 + k * 100 + rnd.uniform(-20, 20)
        y = 956 - (x - 70) * 0.033
        o.append(line(x, y + 4, x + rnd.uniform(-3, 3), y + rnd.uniform(120, 260), g(24), rnd.uniform(4, 8), opacity='0.8'))
    # round 2 (note 1: the icicles said "frozen"): no ice can hold on it; meltwater pours off the roof edge in streams,
    # steaming as it falls, and splashes into the water at the wall's foot
    streams, steams = [], []
    for k, x in enumerate((150, 300, 470, 790, 930)):
        y = 956 - (x - 70) * 0.033
        L = 1254 - y
        sw = (16, 12, 14, 15, 12)[k]
        pts_ = [(x + 8 + 10 * (1 - (1 - v / 10.0) ** 3) + math.sin(v * 1.3 + k) * 1.5, y + v * L / 10.0) for v in range(11)]
        lip = path('M %s %s C %s %s %s %s %s %s' % (f(x - sw * 0.8), f(y - 2), f(x - sw * 0.2), f(y - 7), f(x + sw * 0.6), f(y - 6), f(pts_[1][0]), f(pts_[1][1])),
                   'none', stroke='#eef3f8', stroke_width=f(sw * 0.9), opacity='0.8')
        body = (pline(pts_[:4], '#e4ebf2', sw * 1.15, opacity='0.62') + pline(pts_[3:6], '#e4ebf2', sw * 0.85, opacity='0.5') +
                pline(pts_[5:8], '#e4ebf2', sw * 0.6, opacity='0.42') +
                ''.join(ell(pts_[v][0] + rnd.uniform(-4, 4), pts_[v][1] + rnd.uniform(-10, 10), sw * 0.22, sw * 0.4, '#eef3f8', opacity='0.75') for v in (8, 8, 9, 9, 10)))
        core = pline([(x_ - sw * 0.25, y_) for x_, y_ in pts_[1:4]], '#ffffff', 2.2, opacity='0.7') + pline([(x_ + sw * 0.15, y_) for x_, y_ in pts_[4:6]], '#ffffff', 1.6, opacity='0.55')
        splash = (ell(pts_[-1][0], 1258, sw * 1.8, 5, '#f2f6fa', opacity='0.8') +
                  ''.join(circ(pts_[-1][0] + dx, 1258 - abs(dx) * 0.5 - 6, 2.4, '#f2f6fa', opacity='0.8') for dx in (-18, -9, 10, 20)))
        streams.append(grp(lip + body, filter='url(#b1)') + core + splash)
        steams.append(vapour(3300 + k * 3, pts_[4][0] + 8, pts_[4][1] + 30, 70, 120, op=0.55, lean=0.3, n=6, flt='vap', root=None, wisps=1))
        steams.append(vapour(3301 + k * 3, pts_[-1][0] + 6, 1262, 90, 150, op=0.62, lean=0.25, n=7, flt='vap', root=None, wisps=1))
    o.append(''.join(streams) + ''.join(steams))
    # the meltwater at the wall's foot: the wet bare ground in front of it, its puddles mirroring the lifted sky and
    # catching the vents' and the door's warm glow, steam lifting off it, the snowbanks slumped wet at its edge
    o.append(grp(path('M 40 1262 C 260 1250 700 1246 1010 1236 L 1030 1262 C 760 1280 300 1290 40 1290 Z', g(24)), filter='url(#rough)'))
    pud = []
    for k, (px_, py_, pw_, ph_) in enumerate(((150, 1298, 120, 16), (330, 1320, 150, 20), (560, 1304, 110, 14), (720, 1332, 170, 22), (900, 1302, 130, 16), (470, 1348, 90, 10))):
        pud.append(path(smooth_closed(blob(3500 + k, px_, py_, pw_, ph_, n=14, jit=0.22)), g(58), opacity='0.9'))
        pud.append(ell(px_, py_ - ph_ * 0.3, pw_ * 0.85, ph_ * 0.4, g(26), opacity='0.6'))      # the building mirrored dark in it
    o.append(grp(''.join(pud), filter='url(#rough)'))
    glints = []
    for vx in (210, 420, 650, 850):
        glints.append(ell(vx, 1300 + (vx % 3) * 8, 16, 8, HONEY, opacity='0.75'))
    o.append(grp(''.join(glints), filter='url(#b4)'))
    o.append(grp(rect(604, 1264, 82, 92, HONEY_MID, opacity='0.42'), filter='url(#b8)'))   # the door's light, mirrored
    for k, (sx_, sy_, sw_, sh_) in enumerate(((110, 1336, 150, 170), (290, 1356, 170, 190), (520, 1366, 150, 170), (700, 1362, 170, 190), (960, 1336, 150, 170))):
        o.append(vapour(3400 + k, sx_, sy_, sw_, sh_, op=0.62, lean=0.18, n=7, flt='vap', root=None, wisps=1))
    # the banks slumped at its edge: wet grey slush, then the snow's soft sagging lip
    o.append(grp(path('M -20 1336 C 120 1326 200 1364 330 1358 C 470 1352 560 1386 700 1380 C 840 1374 960 1356 1100 1366 '
                      'L 1100 1392 C 900 1402 640 1412 420 1408 C 220 1404 60 1392 -20 1382 Z', g(50)), filter='url(#rough)'))
    o.append(grp(path('M -20 1366 C 160 1372 300 1400 460 1398 C 640 1396 860 1384 1100 1386 L 1100 1430 C 800 1440 400 1446 -20 1426 Z', g(78)), filter='url(#rough)'))
    o.append(grp(path('M -20 1368 C 160 1374 300 1402 460 1400 C 640 1398 860 1386 1100 1388', 'none', stroke=g(90), stroke_width='6', opacity='0.9'), filter='url(#rough)'))
    # the heat: white vapour pouring off the roof vents, warm only at their mouths, a shimmer over the roof, gone
    # before the caption band
    o.append(grp(''.join(pline([(110 + u * 42 + k * 30, 912 - k * 16 + math.sin(u * 1.5 + k * 2) * 4) for u in range(20)], '#ffffff', 1.8,
                               opacity='0.12') for k in range(3)), filter='url(#b1)'))
    for i, (vx, h, w, ln) in enumerate([(210, 215, 150, 0.32), (420, 250, 210, 0.26), (650, 238, 190, 0.28), (850, 200, 140, 0.36)]):
        vy = 948 - (vx - 70) * 0.033
        o.append(rect(vx - 30, vy - 30, 60, 30, g(12)))
        o.append(vapour(500 + i, vx, vy - 32, w, h, op=0.85, lean=ln, n=11))
    o.append(grp(rect(560, 1080, 170, 40, HONEY_DEEP, opacity='0.5'), filter='url(#b8)'))
    o.append(vapour(520, 645, 1084, 150, 150, op=0.6, lean=0.25, n=7, root_w=60))
    # a snowy fence in front (the near hint), a lamppost
    for k in range(9):
        x = 40 + k * 125
        o.append(rect(x, 1560, 14, 220, g(30)) + rect(x - 4, 1552, 22, 10, g(92)))
    o.append(rect(0, 1600, W, 10, g(30)) + rect(0, 1594, W, 7, g(92)))
    o.append(rect(950, 1100, 12, 560, g(22)) + rect(918, 1094, 60, 10, g(22)) + circ(926, 1110, 12, g(70)))
    # the snow falls everywhere, but in the warm air over the building the flakes turn to rain
    warm_zone = lambda x, y: 40 < x < 1020 and 640 < y < 1250
    sn = []
    r2 = random.Random(301)
    for _ in range(300):
        x, y = r2.uniform(0, W), r2.uniform(0, 1920)
        if 290 <= y <= 600 and r2.random() < 0.5:
            continue
        rr = r2.uniform(1.6, 4.2) if not (290 <= y <= 600) else r2.uniform(1.6, 3.0)
        if warm_zone(x, y):
            if y < 720:     # turning: a flake stretching into a drop
                sn.append(ell(x, y, rr * 0.7, rr * 1.5, g(90), opacity=f(r2.uniform(0.5, 0.85))))
            else:           # rain: short falling streaks
                sn.append(line(x, y, x - 1.5, y + r2.uniform(14, 24), g(82), 2.2, opacity=f(r2.uniform(0.45, 0.8))))
        else:
            sn.append(circ(x, y, rr, '#f2f5fa', opacity=f(r2.uniform(0.4, 0.9))))
    o.append(''.join(sn))
    caption = cap('Those computers', 'get really |*hot.')
    return defs, ''.join(o), caption


# ------------------------------------------------------------------ the kitchen (D-B4, D-B5)
def kitchen_kettles(seed=4):
    """Her small kitchen filled with forty boiling kettles (one point, from the doorway); steam fills the ceiling.
    Round 1: night in the fogged window, the lamp's light warm, the kettles boiling hard, a floor of kettles."""
    rnd = random.Random(seed)
    o = []
    kdefs = ''
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
    # the back window: the night behind its fog, the city's lights blurred through it, drops streaming down
    o.append(rect(392, 872, 296, 236, g(36)))
    wd, wb = fogged_window('k4', 400, 880, 280, 220, seed=41, fog=0.2, top_fog=0.38, drips=6, lights=26, frame=g(40))
    kdefs += wd
    o.append(wb)
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
    # the pendant lamp in the steam (top gutter); its warm light falls down through the steam onto the table and her
    o.append(line(540, 0, 540, 150, g(30), 3) + path('M 480 196 C 486 156 594 156 600 196 Z', g(24)))
    o.append(grp(poly([(490, 200), (590, 200), (900, 1400), (240, 1400)], '#f7dfb0', opacity='0.16'), filter='url(#b30)'))
    # kettles: on the back counter, along both side counters, on the table, the chairs, the floor, the fridge
    ket = []
    def put(x, y, h, face=1, sd=None):
        ket.append((y, kettle(x, y, h, body=g(rnd.uniform(28, 40)), lit=g(62), dark=g(18), face=face,
                               steam_seed=sd if sd is not None else rnd.randint(0, 999), steam_h=h * 1.6, steam_op=0.55,
                               steam_col='#f6e9d3', bloom=2.2, boil=rnd.random() < 0.75)))
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
    for i, (xx, yy, hh) in enumerate([(130, 1780, 150), (330, 1720, 120), (880, 1760, 140), (720, 1650, 100), (470, 1600, 92),
                                      (600, 1552, 78), (262, 1590, 86), (836, 1588, 84), (990, 1652, 104), (60, 1640, 100),
                                      (410, 1648, 96), (560, 1690, 108), (196, 1694, 110), (760, 1740, 118)]):
        put(xx, yy, hh, face=1 if xx < 540 else -1)
    ket.sort(key=lambda t: t[0])
    back = ''.join(kk for yy, kk in ket if yy < ty)
    front = ''.join(kk for yy, kk in ket if yy >= ty)
    o.insert(0, '<defs>%s</defs>' % kdefs)
    return o, o_table, o_chairs, back, front


def steam_ceiling(op=0.85):
    """The kettles' steam gathered under the ceiling: a light, calm field (the caption seat sits in it), lit warm by the
    pendant lamp (round 1, the board read: one night, the lamp's light warm, never a cool daylight fog)."""
    return (grp(rect(0, 0, W, 700, '#e8e3db', opacity=f(op)) + ell(540, 700, 700, 120, '#e3dfd9', opacity='0.7') +
                ell(260, 820, 300, 90, '#dfdcd8', opacity='0.5') + ell(840, 800, 300, 90, '#dfdcd8', opacity='0.5'), filter='url(#b30)') +
            grp(ell(540, 250, 470, 250, '#f5d9a6', opacity=f(0.5 * op)), filter='url(#b30)'))


def B4():
    o, table, chairs, back, front = kitchen_kettles()
    o.append(back)
    o.append(chairs)
    o.append(table)
    # her, up on the table among them, in profile: her feet pulled up off a floor of kettles, the mug held close
    o.append(her_profile_tucked(700, 1330, 1.0, sweater=g(22), hair=g(8), skin=g(50), legs=g(16), flip=True))
    o.append(front)
    o.append(steam_ceiling())
    # the lamp's warm light on everything it reaches (the steam, the table, her), the corners left cool (round 1, the
    # builder's look: at 0.13 the middle of the room still read as a cool grey fog; the steam glows lamp-warm now)
    o.append(grp(ell(540, 940, 620, 860, '#f2d29a', opacity='0.22'), filter='url(#b30)'))
    # the near doorway (the near hint at both edges)
    o.append(rect(0, 0, 46, H, g(20)) + rect(W - 46, 0, 46, H, g(20)))
    caption = cap('as much heat as', '*forty| kettles,')
    return '', ''.join(o), caption


def B5():
    """Tea for one: closer on her sip among the steaming crowd; soft, light, a breath."""
    o = [rect(0, 0, W, H, g(78))]
    rnd = random.Random(55)
    # the fogged window behind her (round 1, the board read's one night: the same window as B4, the night and the
    # city's lights blurred behind its fog; the fog lit by the lamp, heaviest behind her head, so her profile still
    # reads dark on light), the back counter's kettles soft
    # (round 1, the builder's look: at fog 0.6-0.9 it still read as a pale day window: the fog is thinner now, so the
    # night shows dark round the edges, and the lamp's light caught in the fog sits behind her head)
    wd, wb = fogged_window('k5', 60, 640, 720, 560, seed=42, fog=0.24, top_fog=0.1, drips=7, lights=44,
                           avoid=lambda x: 360 < x < 620, frame=g(70))
    o.append(wb)
    wd += rad_grad('k5halo', [(0, '#f1e7d8', 0.95), (0.45, '#ece3d6', 0.8), (1, '#e6e1da', 0)], cx=470, cy=965, r=245, units=True)
    o.append(grp(rect(60, 640, 720, 560, 'url(#k5halo)'), clip_path='url(#fwk5)'))
    o.append(line(420, 640, 420, 1200, g(70), 18))
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
    return wd, ''.join(o), caption


FRAMES.update({
    'D-B2alt': B2,
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
        o.append(vapour(640 + i, px, 960, pw * 1.6, ph + 120, op=0.5, lean=0.35, n=7, root_w=pw * 0.35))
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
        o.append(vapour(700 + i, fx, fy - 6, 90, 200, op=0.6, lean=0.1, n=5, root_w=40, flt='vapS', wisps=0))
    o.append(vapour(760, 560, 1100, 500, 400, op=0.62, lean=0.18, n=11, root=None))
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
    o.append(vapour(606, 578, 1690, 60, 300, op=0.55, lean=0.08, n=8, flt='vapS', root_w=22, wisps=0))
    o.append(snow(660, 200, 0, 0, W, 1600, 1.0, 2.8, op=(0.3, 0.8)))
    caption = cap('big fans blow', 'that heat |*outside.')
    return defs, ''.join(o), caption


# ------------------------------------------------------------------ D-B7alt: she leans out and catches it (round 1: the old B7, reworked from the idea)
def B7_catch():
    """Round 1 rework (the old B7 was wide: her whole figure standing in a pale room, both arms flung out, the plume's
    tip at the window's edge, read as a stretch): close, over her shoulder, at night: she leans right out of her open
    kitchen window into the snowfall, her right hand gripping the frame, her left arm stretched up and out, and a wisp of
    the warmth being thrown away on the horizon drifts across the night and curls into her open fingers; honey on her
    hand, her cheek and her sleeve. Helsinki wants that heat: the turn, a spark of delight."""
    defs = ''
    o = [rect(0, 0, W, H, g(14))]
    gx0, gy0, gx1, gy1 = 96, 640, 984, 1610
    defs += '<clipPath id="kw7"><rect x="%d" y="%d" width="%d" height="%d"/></clipPath>' % (gx0, gy0, gx1 - gx0, gy1 - gy0)
    d2, view = night_view(77, gx0, gy0, gx1, gy1, horizon=1010, warm_p=0.7, wave_left=0.0, domes_at=None, ships=True,
                          near_roofs=True, roof_y=1190)
    defs += d2
    o.append('<g clip-path="url(#kw7)">' + view)
    # the plumes on the horizon, where the heat is thrown away; the wisp off the nearest one drifts to her hand
    for i, (px, ph, pw) in enumerate([(470, 200, 150), (690, 140, 90), (210, 120, 80), (890, 110, 70)]):
        o.append(vapour(1700 + i, px, 1008, pw, ph, op=0.62, lean=-0.12 if px == 470 else 0.3, n=8, root_w=pw * 0.26))
    o.append('</g>')
    # the kitchen around the window: its wall dim in the lamp's warm light from behind us, the deep frame, the casements open in
    o.append(rect(0, 0, W, gy0, '#2b2622') + rect(0, gy0, gx0, H, '#26221f') + rect(gx1, gy0, W - gx1, H, '#24201d'))
    o.append(grp(ell(540, 140, 600, 260, '#6e5a42', opacity='0.45'), filter='url(#b30)'))
    fr = '#3a3029'
    o.append(rect(gx0 - 30, gy0 - 30, gx1 - gx0 + 60, 30, fr) + rect(gx0 - 30, gy0, 30, gy1 - gy0, fr) + rect(gx1, gy0, 30, gy1 - gy0, fr))
    o.append(poly([(gx0, gy0), (gx0 + 110, gy0 + 50), (gx0 + 110, gy1 - 30), (gx0, gy1)], '#45392f') +
             poly([(gx0 + 12, gy0 + 22), (gx0 + 98, gy0 + 60), (gx0 + 98, gy1 - 44), (gx0 + 12, gy1 - 18)], g(30), opacity='0.6'))
    o.append(poly([(gx1, gy0), (gx1 - 110, gy0 + 50), (gx1 - 110, gy1 - 30), (gx1, gy1)], '#42372e') +
             poly([(gx1 - 12, gy0 + 22), (gx1 - 98, gy0 + 60), (gx1 - 98, gy1 - 44), (gx1 - 12, gy1 - 18)], g(28), opacity='0.6'))
    o.append(rect(0, gy1, W, 46, '#4a3d33') + rect(0, gy1, W, 6, '#8d7458') + rect(0, gy1 + 46, W, H, '#221e1b'))
    o.append(kettle(150, gy1 + 2, 84, body=g(24), lit=g(44), dark=g(12), face=1, bloom=1.3, steam_seed=811, steam_h=120, steam_op=0.4))
    o.append(rect(0, gy1 + 46, W, 8, '#2d2722'))
    # the wisp: the nearest plume's top bends over and drifts down across the night into her open fingers: white
    # vapour, thinning as it comes, warm only where it meets her
    hx, hy = 206, 1262
    def bez(t, p0, p1, p2, p3):
        u = 1 - t
        return (u ** 3 * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t ** 3 * p3[0],
                u ** 3 * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t ** 3 * p3[1])
    P0, P1, P2, P3 = (452, 830), (380, 740), (260, 860), (hx + 10, hy - 10)
    blobs, core = '', ''
    for k in range(26):
        t = k / 25.0
        bx, by = bez(t, P0, P1, P2, P3)
        r = 54 * (1 - t) + 16
        blobs += ell(bx, by, r, r * 0.7, '#f3f6fa', opacity=f(0.42 - 0.18 * t))
        if t > 0.62:
            core += ell(bx, by, r * 0.45, r * 0.32, HONEY_HI, opacity=f(0.25 + 0.6 * (t - 0.62) / 0.38))
    o.append(grp(blobs, filter='url(#vap)'))
    o.append(grp(core, filter='url(#b4)'))
    o.append(grp(path('M %s %s C %s %s %s %s %s %s' % (f(hx + 10), f(hy - 10), f(hx + 34), f(hy + 18), f(hx - 10), f(hy + 40), f(hx - 34), f(hy + 10)),
                      'none', stroke=HONEY_HI, stroke_width='12', stroke_linecap='round', opacity='0.75'), filter='url(#b4)'))
    o.append(grp(ell(hx, hy, 86, 70, HONEY, opacity='0.26'), filter='url(#b16)'))
    # her, close, over her shoulder, leaning right out over the sill into the snow: head and shoulders outside
    o.append(her_reach_back(gy1, waist=(610, gy1), shoulders=((436, 1480), (790, 1494)), head=(600, 1452), elbow=(300, 1404),
                            hand=(200, 1276), rest=(900, gy1 - 8), sweater=g(18), hair=g(6), skin=g(42), rim='#8d7458', warm=HONEY_HI,
                            head_s=1.08, head_rot=-36))
    o.append(snow(707, 220, gx0, gy0, gx1, gy1, 1.5, 4.0, op=(0.4, 0.9)))
    o.append(snow(708, 40, 0, 0, W, gy0, 1.2, 2.6, op=(0.15, 0.35)))
    caption = cap('But Helsinki', '*wants| that heat.')
    return defs, ''.join(o), caption


# ------------------------------------------------------------------ D-B8: across the bay, a plan (round 1)
def chalk_dc(x0, x1, yb, yt, depth=60, rise=14, ch='#eef1f5', warm=HONEY):
    """A big new data centre drawn in pale chalk on the night (no fill: the night shows through): its long front, the
    roof's edge, the side, the big doors, the row of roof fans. Returns (chalk lines, the pipe's start point)."""
    pl = ''
    pl += pline([(x0, yb), (x0, yt), (x1, yt - rise), (x1, yb - rise * 0.4)], ch, 6)
    pl += pline([(x0, yb), (x1, yb - rise * 0.4)], ch, 5)
    pl += pline([(x0, yt), (x0 + depth, yt - depth * 0.45), (x1 + depth, yt - rise - depth * 0.45), (x1, yt - rise)], ch, 5)
    pl += pline([(x1 + depth, yt - rise - depth * 0.45), (x1 + depth, yb - rise * 0.4 - depth * 0.45), (x1, yb - rise * 0.4)], ch, 5)
    for k in range(1, 6):
        xx = x0 + (x1 - x0) * k / 6
        pl += line(xx, yt - rise * k / 6 + 8, xx, yb - rise * 0.4 * k / 6 - 2, ch, 2.6)
    for k in range(5):                                       # the roof fans, drawn as rings
        fx = x0 + 60 + k * (x1 - x0 - 60) / 5 + depth * 0.4
        fy = yt - rise * (fx - x0) / (x1 - x0) - depth * 0.24
        pl += ell(fx, fy, 30, 9, 'none', stroke=ch, stroke_width='3')
    for dx_ in (0.08, 0.2):                                  # the big doors
        xa, xb = x0 + (x1 - x0) * dx_, x0 + (x1 - x0) * (dx_ + 0.09)
        pl += pline([(xa, yb), (xa, yb - (yb - yt) * 0.55), (xb, yb - (yb - yt) * 0.55 - 1), (xb, yb)], ch, 3.4)
    return pl, (x1 + depth * 0.5, yb - rise * 0.4 - depth * 0.2)


def B8():
    """Round 1 (the evaluator's notes): back at her window, wider than B7's close, at night: she leans on the sill with her
    tea, the window still open (no bar across the view); across the narrow end of the bay, on the empty snowy lot at the
    city's edge, the big new data centre stands drawn in pale chalk, near and big (no fill: the night shows through it),
    survey stakes in the snow; its pipe, drawn in warm chalk, runs along the far shore and comes across the ice toward her
    window: real, coming soon, not built; the warmth is coming here."""
    defs = ''
    o = [rect(0, 0, W, H, '#221e1b')]
    gx0, gy0, gx1, gy1 = 96, 640, 984, 1450
    defs += '<clipPath id="kw8"><rect x="%d" y="%d" width="%d" height="%d"/></clipPath>' % (gx0, gy0, gx1 - gx0, gy1 - gy0)
    rnd = random.Random(808)
    # the plan on the empty lot, near: chalk on the night, the pipe in warm chalk coming toward her
    lot_y = 1072
    lot = grp(path('M -40 %d C 160 %d 520 %d 760 %d C 900 %d 1000 %d 1100 %d L 1100 %d L -40 %d Z' % (
        lot_y + 10, lot_y - 14, lot_y - 22, lot_y - 18, lot_y - 14, lot_y - 4, lot_y + 4, lot_y + 40, lot_y + 40), g(66)), filter='url(#rough)')
    dc, pstart = chalk_dc(250, 760, lot_y - 4, 820, depth=70, rise=16)
    stakes = ''.join(line(210 + k * 112, lot_y + 6, 210 + k * 112, lot_y - 22, g(80), 3.4) + rect(210 + k * 112, lot_y - 26, 12, 8, HONEY_MID) for k in range(7))
    route = [pstart, (900, lot_y + 2), (950, lot_y + 30), (880, 1130), (720, 1200), (600, 1300), (560, 1400), (548, 1460)]
    pipe = ''.join(line(route[i][0], route[i][1], route[i + 1][0], route[i + 1][1], HONEY, 7 + 2.4 * i) for i in range(len(route) - 1))
    plan = (lot + grp(dc, filter='url(#chalk)') + grp(pipe, filter='url(#chalk)') +
            grp(pline(route, HONEY_MID, 22, opacity='0.22'), filter='url(#b8)') + stakes)
    d2, view = night_view(78, gx0, gy0, gx1, gy1, horizon=lot_y - 8, warm_p=0.7, wave_left=0.0, domes_at=None, ships=False,
                          near_roofs=True, plan=plan, roof_y=1290)
    defs += d2
    o.append('<g clip-path="url(#kw8)">' + view + '</g>')
    # the kitchen at night around the open window: dim walls in the lamp's warm light from behind us, the deep frame,
    # the casements swung in at the sides (nothing across the view)
    o.append(rect(0, 0, W, gy0, '#2b2622') + rect(0, gy0, gx0, H, '#26221f') + rect(gx1, gy0, W - gx1, H, '#24201d'))
    o.append(grp(ell(540, 160, 620, 280, '#6e5a42', opacity='0.42'), filter='url(#b30)'))
    fr = '#3a3029'
    o.append(rect(gx0 - 30, gy0 - 30, gx1 - gx0 + 60, 30, fr) + rect(gx0 - 30, gy0, 30, gy1 - gy0, fr) + rect(gx1, gy0, 30, gy1 - gy0, fr))
    o.append(poly([(gx0, gy0), (gx0 + 90, gy0 + 46), (gx0 + 90, gy1 - 26), (gx0, gy1)], '#45392f') +
             poly([(gx0 + 10, gy0 + 20), (gx0 + 80, gy0 + 54), (gx0 + 80, gy1 - 38), (gx0 + 10, gy1 - 16)], g(30), opacity='0.6'))
    o.append(poly([(gx1, gy0), (gx1 - 90, gy0 + 46), (gx1 - 90, gy1 - 26), (gx1, gy1)], '#42372e') +
             poly([(gx1 - 10, gy0 + 20), (gx1 - 80, gy0 + 54), (gx1 - 80, gy1 - 38), (gx1 - 10, gy1 - 16)], g(28), opacity='0.6'))
    o.append(rect(0, gy1, W, 46, '#4a3d33') + rect(0, gy1, W, 6, '#8d7458') + rect(0, gy1 + 46, W, H, '#221e1b'))
    o.append(kettle(880, gy1 + 2, 80, body=g(24), lit=g(44), dark=g(12), face=-1, bloom=1.0, light=False))
    o.append(rect(800, gy1 - 40, 42, 42, g(22), rx='5') + grp(ell(821, gy1 - 64, 36, 26, g(18)) + ell(804, gy1 - 82, 17, 24, g(18)), filter='url(#rough)'))
    o.append(radiator(300, gy1 + 110, 480, 190, n=14, warm=0.0, base=g(22)))
    # her, leaning on the sill with her tea, from behind, looking across at it
    o.append(her_on_sill(380, gy1 + 4, 1.3, sweater=g(18), hair=g(7), skin=g(40), rim='#8d7458'))
    o.append(snow(808, 200, gx0, gy0, gx1, gy1, 1.4, 3.8, op=(0.35, 0.85)))
    caption = cap('The city has a plan,', 'starting |*next year.')
    return defs, ''.join(o), caption


# ------------------------------------------------------------------ D-B9: the plan's door opens
def B9():
    """Round 1 (the evaluator's notes): at the threshold of the plan, low, in the real snowy lot at night: the tall door
    drawn in chalk towers over us, swung open, and the warm light from inside (the giants' heat) is the frame's one
    light, the chalk giants glimpsed lit in it, the light spilling over the snow to our feet; through the chalk walls
    the night shows: the lot's snow and stakes, the frozen bay, her city's warm windows. Leaning in: a door opens."""
    HZ = 1176
    defs = lin_grad('sky9', [(0, g(6)), (0.7, g(13)), (1, g(24))], x1=0, y1=0, x2=0, y2=HZ, units=True)
    o = [rect(0, 0, W, HZ + 4, 'url(#sky9)')]
    rnd = random.Random(99)
    ch = '#e9edf2'
    # beyond the walls: the far shore (her city: warm windows), the frozen bay, the snow of the unbuilt lot
    x = -20
    while x < W + 20:
        bw, bh = rnd.uniform(26, 60), rnd.uniform(14, 52)
        o.append(rect(x, HZ - bh, bw, bh + 6, g(14)))
        for q in range(int(bh // 9)):
            for c in range(int(bw // 9)):
                if rnd.random() < 0.55:
                    o.append(rect(x + 3 + c * 9, HZ - bh + 4 + q * 9, 4, 5, HONEY if rnd.random() < 0.7 else HONEY_MID))
        x += bw * rnd.uniform(0.85, 1.0)
    o.append(rect(0, HZ + 4, W, 30, g(12)))
    o.append(grp(''.join(ell(rnd.uniform(0, W), rnd.uniform(HZ + 10, HZ + 30), rnd.uniform(20, 70), 3, g(34)) for _ in range(20)), filter='url(#rough2)'))
    defs += lin_grad('lot9', [(0, g(58)), (1, g(76))], x1=0, y1=HZ + 30, x2=0, y2=H, units=True)
    o.append(rect(0, HZ + 32, W, H - HZ, 'url(#lot9)'))
    # inside the unbuilt walls: chalk giants in rows, faint (the plan); the snow where its floor will be
    inner = ''
    for k in range(6):
        for side in (-1, 1):
            xx = 540 + side * (330 + k * 70)
            yb, yt = HZ + 120 - k * 14, HZ - 120 + k * 4
            inner += pline([(xx, yb), (xx, yt), (xx + side * 46, yt - 4), (xx + side * 46, yb - 4)], ch, 2.2)
    o.append(grp(grp(inner, opacity='0.45'), filter='url(#chalk)'))
    # the snow at our feet: banks, the survey stakes and their warm flags, our footprints to the door
    o.append(grp(path('M -40 1700 C 80 1640 200 1660 250 1720 C 160 1760 40 1770 -40 1770 Z', g(88)) +
                 path('M 1120 1690 C 1000 1630 880 1650 830 1720 C 920 1770 1040 1780 1120 1780 Z', g(88)), filter='url(#rough)'))
    for sx_, sy_ in ((120, 1640), (980, 1650), (60, 1500), (1020, 1490)):
        o.append(line(sx_, sy_, sx_, sy_ - 70, g(82), 5) + rect(sx_, sy_ - 74, 22, 13, HONEY_MID))
    for k in range(7):
        fx, fy = 470 + (k % 2) * 90 + k * 8, 1900 - k * 34
        o.append(ell(fx, fy, 22 - k * 1.6, 9 - k * 0.6, g(56), opacity='0.8'))
    # the warm light from inside: the frame's one light, the chalk giants glimpsed lit in it, spilling to our feet
    dx0, dx1, dy0, dy1 = 352, 728, 760, 1700
    o.append(grp(poly([(dx0, dy1), (dx1, dy1), (1000, 1920), (80, 1920)], '#f4dfb8', opacity='0.4'), filter='url(#b30)'))
    defs += rad_grad('glow9', [(0, '#fffaf0'), (0.5, '#f5e4c4'), (1, '#b89068')], cx=0.5, cy=0.62, r=0.78)
    o.append(rect(dx0, dy0, dx1 - dx0, dy1 - dy0, 'url(#glow9)'))
    lit = ''
    for k in range(4):
        for side in (-1, 1):
            xx = 540 + side * (40 + k * 34)
            yb, yt = 1560 - k * 40, 1000 + k * 30
            lit += poly([(xx, yb), (xx, yt), (xx + side * 26, yt - 3), (xx + side * 26, yb - 3)], '#8c6a48', opacity='0.55')
            lit += pline([(xx, yb), (xx, yt), (xx + side * 26, yt - 3), (xx + side * 26, yb - 3)], '#6b4a2a', 4)
            for q in range(7):
                lit += line(xx + side * 5, yt + 40 + q * (yb - yt - 60) / 7.0, xx + side * 21, yt + 40 + q * (yb - yt - 60) / 7.0, HONEY, 3)
    o.append(grp(lit, opacity='0.85'))
    o.append(grp(ell(540, 1240, 160, 300, '#fff6e2', opacity='0.45'), filter='url(#b30)'))
    # the plan's chalk: the long wall across the lot, its roof line high above, the tall door and its swung leaf
    pl = ''
    pl += pline([(-20, 1720), (1100, 1720)], ch, 6) + pline([(-20, 650), (1100, 650)], ch, 6) + pline([(-20, 690), (1100, 690)], ch, 2.6)
    for xx in (40, 200, 880, 1040):
        pl += line(xx, 690, xx, 1720, ch, 4)
    pl += pline([(dx0, dy1), (dx0, dy0), (dx1, dy0), (dx1, dy1)], ch, 7)
    pl += pline([(dx0 - 22, dy0 - 22), (dx1 + 22, dy0 - 22)], ch, 4)
    leaf = [(dx0, dy0), (196, 700), (196, 1810), (dx0, dy1)]
    o.append(poly(leaf, g(22), opacity='0.35'))
    pl += pline(leaf, ch, 6) + line(220, 1250, 262, 1252, ch, 7)
    o.append(grp(pl, filter='url(#chalk)'))
    o.append(grp(pline([(dx0, dy0), (dx1, dy0)], '#ffe7b4', 10, opacity='0.35'), filter='url(#b8)'))
    o.append(snow(990, 240, 0, 0, W, H, 1.6, 4.0, op=(0.4, 0.9)))
    caption = cap('So how would', 'that work?')
    return defs, ''.join(o), caption


# ------------------------------------------------------------------ D-B10: blue in, honey out
def worker(x, y, h, look=1, col=None, lamp=True):
    """A worker in a padded jacket and a hard hat with a headlamp, standing at (x, y) (the feet), h px tall, looking up
    (look: +1 to the right, -1 to the left): the human measure beside the giant."""
    col = col or g(10)
    s_ = h / 100.0
    X = lambda u: x + look * u * s_
    Y = lambda v: y - v * s_
    o = pline([(X(-6), Y(0)), (X(-5), Y(44))], col, 9 * s_) + pline([(X(6), Y(0)), (X(5), Y(44))], col, 9 * s_)
    o += path('M %s %s C %s %s %s %s %s %s C %s %s %s %s %s %s Z' % (
        f(X(-14)), f(Y(44)), f(X(-16)), f(Y(66)), f(X(-12)), f(Y(82)), f(X(0)), f(Y(84)),
        f(X(14)), f(Y(82)), f(X(16)), f(Y(66)), f(X(14)), f(Y(44))), col)
    o += pline([(X(10), Y(78)), (X(20), Y(64)), (X(24), Y(76))], col, 6 * s_)
    o += circ(X(2), Y(90), 7 * s_, col)
    o += path('M %s %s C %s %s %s %s %s %s Z' % (f(X(-7)), f(Y(93)), f(X(-6)), f(Y(101)), f(X(9)), f(Y(102)), f(X(10)), f(Y(93))), g(70))
    if lamp:
        o += circ(X(9), Y(95), 2.4 * s_, '#eaf2fb') + grp(poly([(X(9), Y(95)), (X(9) + look * 120 * s_, Y(160)), (X(9) + look * 150 * s_, Y(120))],
                                                               '#e6eef7', opacity='0.18'), filter='url(#b4)')
    return o


def B10():
    """Round 1 (the evaluator's notes): inside the chalk walls of the plan, in the snowy lot at night: one real giant
    computer, a worker in a hard hat at its foot looking up at it (the human measure); the cold pipe, frosted, runs in
    at its foot, the hot pipe out of its top, steaming, down, out through the chalk wall and away across the shore to
    her city's warm windows on the far side of the bay, one of them hers: oh, that's how."""
    HZ = 1084
    defs = lin_grad('sky10', [(0, g(7)), (0.65, g(15)), (1, g(26))], x1=0, y1=0, x2=0, y2=HZ, units=True)
    o = [rect(0, 0, W, HZ + 4, 'url(#sky10)')]
    rnd = random.Random(1010)
    # across the bay, her city: its warm windows along the far shore; hers the one the hot pipe's line ends at
    x = 520
    while x < W + 20:
        bw, bh = rnd.uniform(24, 54), rnd.uniform(14, 48)
        o.append(rect(x, HZ - bh, bw, bh + 6, g(15)))
        for q in range(int(bh // 9)):
            for c in range(int(bw // 9)):
                if rnd.random() < 0.6:
                    o.append(rect(x + 3 + c * 9, HZ - bh + 4 + q * 9, 4, 5, HONEY if rnd.random() < 0.7 else HONEY_MID))
        x += bw * rnd.uniform(0.85, 1.0)
    o.append(grp(ell(968, HZ - 30, 22, 18, HONEY_HI, opacity='0.8'), filter='url(#b4)') + rect(962, HZ - 36, 12, 12, HONEY_HI))
    o.append(rect(0, HZ + 2, W, 26, g(12)))
    defs += lin_grad('lot10', [(0, g(56)), (1, g(74))], x1=0, y1=HZ + 28, x2=0, y2=H, units=True)
    o.append(rect(0, HZ + 28, W, H - HZ, 'url(#lot10)'))
    # the hot pipe's way out (drawn after the walls, below): through the chalk wall and across the shore, away to her window
    # the plan's chalk walls round us, in one-point perspective: the far wall, the side walls, the ceiling's edge
    ch = '#e3e7ed'
    fw = (170, 700, 880, 1110)
    pl = pline([(fw[0], fw[3]), (fw[0], fw[1]), (fw[2], fw[1]), (fw[2], fw[3]), (fw[0], fw[3])], ch, 4)
    pl += pline([(fw[0], fw[1]), (-40, 600)], ch, 4) + pline([(fw[2], fw[1]), (1120, 610)], ch, 4)
    pl += pline([(fw[0], fw[3]), (-40, 1600)], ch, 4) + pline([(fw[2], fw[3]), (1120, 1700)], ch, 4)
    o.append(grp(pl, filter='url(#chalk)'))
    # the giant computer: real, painted; its rows of blades and lights
    gx0, gx1, gy0, gy1 = 380, 660, 740, 1520
    o.append(grp(ell((gx0 + gx1) / 2, gy1 + 6, 220, 26, g(30), opacity='0.6'), filter='url(#b8)'))
    o.append(rect(gx0, gy0, gx1 - gx0, gy1 - gy0, g(13)) + rect(gx0, gy0, 18, gy1 - gy0, g(28)))
    o.append(rect(gx0 + 30, gy0 + 30, gx1 - gx0 - 60, gy1 - gy0 - 60, g(8)))
    for q in range(26):
        y = gy0 + 50 + q * 27
        o.append(line(gx0 + 40, y, gx1 - 40, y, g(20), 3))
        for k in range(4):
            if rnd.random() < 0.65:
                o.append(circ(gx1 - 80 + k * 12, y - 9, 3, g(84)))
    o.append(rect(gx0, gy0 - 8, gx1 - gx0, 10, g(64)))
    # the cold pipe: frosted and pale, in from the left and down into the giant's foot, icicles hanging from it
    cp = [(-20, 1200), (250, 1200), (300, 1250), (300, 1450), (350, 1500), (gx0 + 6, 1500)]
    o.append(pline(cp, g(70), 34) + pline(cp, g(88), 16) + pline(cp, '#ffffff', 5, opacity='0.7'))
    for k in range(8):
        x_ = 10 + k * 30
        o.append(poly([(x_ - 4, 1217), (x_ + 4, 1217), (x_, 1217 + rnd.uniform(12, 30))], g(90)))
    o.append(grp(''.join(circ(rnd.uniform(0, 300), rnd.uniform(1186, 1216), 2.2, '#ffffff', opacity='0.85') for _ in range(40)), filter='url(#b1)'))
    # the hot pipe: honey, out at its top and away on its posts, high over the snow, out through the chalk wall and
    # across the shore, tapering into the distance to her city's windows, the last one hers; warm air rising off it.
    # Round 1 (the builder's look: it read as a ribbed warm beam at phone size): drawn as ONE tube, as present as the
    # cold pipe where it leaves the giant, a collar at every post, a saddle on every post, a continuous lit top, and
    # still a pipe (never a point) where it reaches her window
    A, B = (738.0, 782.0), (966.0, HZ - 30.0)
    dx_, dy_ = B[0] - A[0], B[1] - A[1]
    L_ = math.hypot(dx_, dy_)
    ux_, uy_ = dx_ / L_, dy_ / L_
    nx_, ny_ = uy_, -ux_                        # the pipe's top side (toward the sky)
    at = lambda t: (A[0] + dx_ * t, A[1] + dy_ * t)
    wd = lambda t: 40.0 * (1 - 0.76 * t)        # 40 px at the giant, ~10 px at her window
    def band(o0, o1, col, op=None):             # a strip of the tube between offsets o0..o1 (fractions of its width)
        p = [(at(t)[0] + nx_ * wd(t) * o, at(t)[1] + ny_ * wd(t) * o) for t, o in ((0, o0), (1, o0), (1, o1), (0, o1))]
        return poly(p, col, opacity=op)
    for t in (0.1, 0.3, 0.5, 0.68, 0.82):       # the posts and their saddles
        px_, py_ = at(t)
        gy_ = 1520 + (HZ + 6 - 1520) * t
        wpost = 10 * (1 - t) + 2
        o.append(line(px_, py_ + wd(t) * 0.4, px_, gy_, g(22), wpost) + line(px_ - 3 * (1 - t), gy_, px_ + 3 * (1 - t), gy_, g(30), wpost))
        o.append(rect(px_ - wd(t) * 0.35, py_ + wd(t) * 0.55, wd(t) * 0.7, wd(t) * 0.42, g(18)))
        o.append(grp(ell(px_ + 4, gy_ + 2, 26 * (1 - t) + 4, 6 * (1 - t) + 2, g(36), opacity='0.6'), filter='url(#b2)'))
    # out of the giant's top: the straight stub and its elbow, as thick as the cold pipe
    o.append(pline([(gx1, 782), A], HONEY_DEEP, 40) + pline([(gx1, 776), (A[0], 776)], HONEY_MID, 16) +
             pline([(gx1, 768), (A[0], 768)], HONEY_HI, 4, opacity='0.7'))
    o.append(circ(A[0], A[1], 20, HONEY_DEEP) + circ(A[0] + 2, A[1] - 6, 9, HONEY_MID))
    o.append(rect(gx1 - 4, 758, 10, 48, HONEY_DARK))                       # its collar at the giant
    # the tube: shadow side, body, lit top, the highlight
    o.append(band(-0.5, 0.5, HONEY_DEEP) + band(-0.5, -0.3, HONEY_DARK, '0.8') + band(-0.05, 0.38, HONEY_MID) +
             band(0.2, 0.32, HONEY_HI, '0.75'))
    for t in (0.1, 0.3, 0.5, 0.68, 0.82, 0.93):  # a collar at each post: the read of a pipe
        cx_, cy_ = at(t)
        o.append(line(cx_ - nx_ * wd(t) * 0.62, cy_ - ny_ * wd(t) * 0.62, cx_ + nx_ * wd(t) * 0.62, cy_ + ny_ * wd(t) * 0.62,
                      HONEY_DARK, max(2.0, wd(t) * 0.26)))
    o.append(grp(ell(B[0], B[1] + 4, 30, 20, HONEY_HI, opacity='0.75'), filter='url(#b4)'))
    for i, (t, hh) in enumerate([(0.0, 110), (0.22, 90), (0.45, 70)]):
        px_, py_ = A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t
        o.append(vapour(1100 + i, px_, py_ - 14 * (1 - t), 56 * (1 - 0.5 * t), hh, op=0.6, n=5, flt='vapS', root_w=18, wisps=0))
    # the worker at its foot, looking up at it: the human measure (it stands more than twice her height)
    o.append(worker(236, 1524, 318, look=1))
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
    # round 1: the melt strip, never a painted line: over the pipe under the snow, the snow has melted into a dark wet
    # ribbon with ragged edges, the lit windows shining in it, the banks slumping beside it; it wanders up from the
    # harbour and turns in to her door below the window (its front: the warmth arriving home)
    cl = [(641, 724), (643, 800), (646, 900), (641, 1000), (628, 1100), (604, 1196), (566, 1286), (512, 1362), (444, 1418), (372, 1452), (330, 1462)]
    wd = [7, 9, 13, 18, 24, 31, 38, 44, 48, 50, 46]
    rr = random.Random(1113)
    left, right = [], []
    for i, (x_, y_) in enumerate(cl):
        if i < len(cl) - 1:
            dx_, dy_ = cl[i + 1][0] - x_, cl[i + 1][1] - y_
        else:
            dx_, dy_ = x_ - cl[i - 1][0], y_ - cl[i - 1][1]
        L_ = math.hypot(dx_, dy_)
        nx_, ny_ = -dy_ / L_, dx_ / L_
        left.append((x_ + nx_ * wd[i] * rr.uniform(0.8, 1.2), y_ + ny_ * wd[i] * rr.uniform(0.8, 1.2)))
        right.append((x_ - nx_ * wd[i] * rr.uniform(0.8, 1.2), y_ - ny_ * wd[i] * rr.uniform(0.8, 1.2)))
    banks_l = [(x_ + (x_ - c_[0]) * 0.5, y_ + (y_ - c_[1]) * 0.5) for (x_, y_), c_ in zip(left, cl)]
    banks_r = [(x_ + (x_ - c_[0]) * 0.5, y_ + (y_ - c_[1]) * 0.5) for (x_, y_), c_ in zip(right, cl)]
    o.append(grp(poly(banks_l + banks_r[::-1], g(80)), filter='url(#rough)'))
    o.append(grp(poly(left + right[::-1], g(28)), filter='url(#rough)'))
    refl = ''
    for i in range(2, len(cl) - 1):
        for _ in range(3):
            t_ = rr.random()
            x_ = cl[i][0] + (cl[i + 1][0] - cl[i][0]) * t_ + rr.uniform(-0.6, 0.6) * wd[i]
            y_ = cl[i][1] + (cl[i + 1][1] - cl[i][1]) * t_
            refl += rect(x_, y_, max(2.0, wd[i] * 0.09), wd[i] * 0.5, HONEY if rr.random() < 0.6 else HONEY_MID, opacity='0.7')
    o.append(grp(refl, filter='url(#b1)'))
    o.append(grp(pline(cl[3:], '#ffffff', 3, opacity='0.12'), filter='url(#b2)'))
    o.append(vapour(1121, 330, 1452, 70, 120, op=0.55, n=5, flt='vapS', root_w=26, wisps=0))
    # the manhole on it (its big warm puff is drawn over the facades, below)
    o.append(ell(560, 1290, 54, 20, g(22)) + ell(560, 1290, 44, 15, g(30)))
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
            u_ = rnd.random()
            if yy < 615:
                continue
            col_ = (HONEY if u_ < 0.7 else g(13)) if t < 0.6 else (HONEY_DEEP if u_ < 0.45 else (HONEY_MID if u_ < 0.6 else g(13)))
            o.append(rect(xa - ww * 0.5, yy, ww * 0.5, ww * 0.8, col_))
    # the opposite facades (right), Jugend blocks receding; windows warming as the heat passes under them (round 2
    # polish: cut at the band's foot, so no pale wedge crosses the caption band)
    fac = poly([(700, 600), (700, 720), (1080, 1520), (1080, 600)], g(24))
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
            u_ = rnd.random()
            if min(a[1], b[1]) < 615:
                continue
            col_ = (HONEY if u_ < 0.75 else g(16)) if t0 < 0.55 else (HONEY_DEEP if u_ < 0.45 else (HONEY_MID if u_ < 0.62 else g(16)))
            o.append(poly([a, b, c2, d], col_))
    # a lamppost
    o.append(line(880, 1100, 860, 1500, g(20), 8) + circ(880, 1094, 14, g(80)))
    # the manhole's big warm puff, lit by the street's lamps (a warm haze over the snow)
    o.append(grp(ell(574, 1150, 120, 170, '#e9d6b4', opacity='0.35'), filter='url(#b30)'))
    o.append(vapour(1120, 560, 1284, 190, 360, op=0.8, n=10, lean=0.1, col='#f6efe4'))
    # a tram coming up the street, two walkers, cars under snow at the kerb
    o.append(poly([(600, 900), (650, 900), (668, 1010), (590, 1010)], g(30)) + rect(600, 920, 56, 24, g(70)))
    o.append(rect(880, 1270, 64, 32, g(80), rx='14') + rect(930, 1400, 76, 38, g(82), rx='16') + rect(430, 1218, 56, 28, g(80), rx='12'))
    o.append(circ(520, 1140, 6, g(14)) + rect(515, 1146, 10, 26, g(14)) + circ(536, 1150, 6, g(14)) + rect(531, 1156, 10, 26, g(14)))
    # round 2 (note 1: the arrival was hidden behind her head): the strip's front turning in at her door is in view,
    # its warm spill on the snow, the door lit; she moves to the right third, looking down at it
    fa, fb = (330, 1440), (318, 1478)
    o.append(grp(ell(332, 1462, 92, 46, HONEY, opacity='0.5'), filter='url(#b16)'))
    o.append(poly([fa, fb, (fb[0] - 30, fb[1] - 14), (fa[0] - 30, fa[1] - 14)], HONEY_MID) +
             poly([fa, fb, (fb[0] - 8, fb[1] - 4), (fa[0] - 8, fa[1] - 4)], HONEY_HI, opacity='0.8'))
    o.append(grp(ell(338, 1462, 40, 20, HONEY_HI, opacity='0.6'), filter='url(#b8)'))
    # the near frame: her window's sill and frame; her head and shoulder from behind, looking down; her mug
    o.append(rect(0, 1600, W, 320, g(16)) + rect(0, 1590, W, 16, g(34)))
    o.append(rect(0, 0, 70, 1600, g(14)) + rect(1010, 0, 70, 1600, g(14)))
    o.append('<g transform="translate(1600 0) scale(-1 1)">%s</g>' % her_on_sill(800, 1606, 1.2, sweater=g(18), hair=g(7), skin=g(36), rim=g(50)))
    o.append(snow(1112, 260, 0, 0, W, 1600, 1.4, 4.0, op=(0.4, 0.9)))
    caption = cap('carry that heat', "into people's |*homes.")
    return defs, ''.join(o), caption


FRAMES.update({
    'D-B12': B12,
    'D-B6': B6,
    'D-B8': B8,
    'D-B9': B9,
    'D-B10': B10,
    'D-B11': B11,
})


# ------------------------------------------------------------------ alternates
def B2alt():
    """Round 1 rework (the old B2alt put the giants on a phone screen: no awe): her armchair in the aisle. Her own
    corner of home (the armchair with her in it reading her chat, the knitted throw, the floor lamp's warm pool on a
    round rug, her tea on a stool) set down in the aisle of the hall: walls of giant computers rise on both sides,
    twice and more her height, their cold lights running away into the dark without end. Her chat's other end, measured
    against her: AI is a real, huge, physical place; a little awe."""
    defs = lin_grad('ceil2a', [(0, g(4)), (1, g(8))], x1=0, y1=0, x2=0, y2=1000, units=True)
    o = [rect(0, 0, W, H, 'url(#ceil2a)')]
    rnd = random.Random(2222)
    VPX, VPY, F, EYE = 540.0, 1000.0, 700.0, 1.6
    P = lambda X, Y, Z: (VPX + F * X / Z, VPY - F * (Y - EYE) / Z)
    HR, AW = 3.6, 1.6                        # the computers' height; the aisle's half width
    # the floor: raised tiles, cold; the far end lost in the dark
    o.append(poly([P(-AW, 0, 1.2), P(AW, 0, 1.2), P(AW, 0, 80), P(-AW, 0, 80)], g(12)))
    for zz in (2, 3, 4, 5.5, 7.5, 10, 14, 20, 30):
        o.append(line(*P(-AW, 0, zz), *P(AW, 0, zz), g(16), 1.5))
    for xx in (-0.8, 0.0, 0.8):
        o.append(line(*P(xx, 0, 1.4), *P(xx, 0, 80), g(16), 1.5))
    # the two walls of giants: lights in rows only up to their working height; their tops dark like the ceiling
    for side in (-1, 1):
        X = side * AW
        o.append(poly([P(X, HR, 1.0), P(X, HR, 80), P(X, 0, 80), P(X, 0, 1.0)], g(9)))
        zz = 1.0
        while zz < 60:
            for k in range(9):
                yb = 0.3 + k * 0.26
                if rnd.random() < 0.75:
                    c = '#dbe6f2' if rnd.random() < 0.35 else ('#9fb0c4' if rnd.random() < 0.6 else '#5d6c80')
                    o.append(poly([P(X, yb + 0.1, zz + 0.06), P(X, yb + 0.1, zz + 0.5), P(X, yb, zz + 0.5), P(X, yb, zz + 0.06)], c))
            o.append(line(*P(X, 2.6, zz), *P(X, 0, zz), g(5), max(1.0, 8.0 / zz)))
            zz += 0.6 if zz < 6 else (0.9 if zz < 15 else 1.6)
        o.append(poly([P(X, HR, 1.0), P(X, HR, 80), P(X, 2.65, 80), P(X, 2.65, 1.0)], g(7)))
    o.append(grp(poly([P(-AW, 0, 6), P(AW, 0, 6), P(AW, 0, 80), P(-AW, 0, 80)], '#c9d6e6', opacity='0.05'), filter='url(#b16)'))
    # her corner of home in the aisle: the round rug in the lamp's warm pool, the lamp, her tea, her in her armchair
    rx_, ry_ = 548, 1566
    o.append(grp(ell(rx_, ry_, 300, 84, HONEY_DEEP, opacity='0.32'), filter='url(#b16)'))
    o.append(ell(rx_, ry_, 270, 70, '#5a4632') + ell(rx_, ry_, 226, 56, '#6b5440') + ell(rx_, ry_, 180, 44, '#5a4632'))
    lx, ly, lty = 846, 1574, 1000
    o.append(line(lx, ly, lx, lty + 10, g(20), 6) + ell(lx, ly, 30, 8, g(16)))
    o.append(grp(ell(lx, lty + 60, 190, 220, HONEY, opacity='0.22'), filter='url(#b30)'))
    o.append(poly([(lx - 44, lty + 40), (lx + 44, lty + 40), (lx + 28, lty - 18), (lx - 28, lty - 18)], HONEY_MID))
    o.append(grp(ell(lx, lty + 48, 50, 14, HONEY_HI, opacity='0.8'), filter='url(#b4)'))
    sx, sy = 270, 1572
    o.append(rect(sx - 32, sy - 120, 64, 14, g(22)) + rect(sx - 5, sy - 106, 10, 106, g(18)))
    o.append(rect(sx - 15, sy - 152, 30, 32, g(30), rx='5') + vapour(2201, sx, sy - 154, 26, 70, op=0.55, n=4, flt='vapS', root=None, wisps=0))
    o.append(her_seated_back(536, 1222, 0.76, head_rot=-6, chair=g(15), chair_lit=HONEY_DEEP, throw=g(24), warm_rim=HONEY_MID))
    # the cold lights away into the dark: the hall going on without end
    o.append(snow(2223, 0, 0, 0, 0, 0))
    caption = cap('AI runs on', '*giant| computers')
    return defs, ''.join(o), caption


def neighbour(kind, x, y, sc, warm_hand=False, face=1, lit=0.0, only_light=False):
    """A neighbour leaning out of a window, in profile facing `face` (+1 right), reaching out with an open hand toward
    the drifting warmth. (x, y) = where the body meets the sill; sc = px per unit (1 unit = a ~110 px head at sc 1).
    Round 2 (B7, note 2): lit > 0 catches the passing warmth on the up-turned face (a lit cheek) and the open hand (a lit
    palm); her own (warm_hand) the brightest; only_light draws just that light (drawn again over the drifting vapour)."""
    k = face
    o = []
    dark, skin = g(9), g(40)
    X = lambda u: x + k * u * sc
    Y = lambda v: y + v * sc
    lc = HONEY_HI if warm_hand else HONEY_MID
    if only_light:
        dark = 'none'
    def body(lean=40, w=74, top=-120):
        return path('M %s %s C %s %s %s %s %s %s C %s %s %s %s %s %s Z' % (
            f(X(-w)), f(Y(0)), f(X(-w + lean * 0.3)), f(Y(top * 0.7)), f(X(-w * 0.4 + lean)), f(Y(top)), f(X(lean * 0.6)), f(Y(top - 4)),
            f(X(w * 0.6 + lean)), f(Y(top * 0.9)), f(X(w)), f(Y(top * 0.4)), f(X(w)), f(Y(0))), dark)
    def head(hx, hy, r=30):
        out = '' if only_light else (ell(X(hx), Y(hy), r * sc * 0.86, r * sc, dark) + path('M %s %s L %s %s L %s %s Z' % (
            f(X(hx + r * 0.8)), f(Y(hy - 4)), f(X(hx + r * 1.12)), f(Y(hy + 8)), f(X(hx + r * 0.78)), f(Y(hy + 12))), dark))
        if lit and (only_light or not warm_hand):
            # the up-turned face catching the warmth: a lit cheek and brow along its front
            arc = [(X(hx + math.cos(math.radians(a)) * r * 0.79), Y(hy + math.sin(math.radians(a)) * r * 0.92)) for a in range(-95, 30, 15)]
            out += grp(pline(arc, lc, r * sc * 0.26, opacity=f(min(1.0, 0.8 * lit))), filter='url(#b1)')
        return out
    def arm(sx, sy, ex, ey, hx2, hy2, wdt=20):
        # round 1, the builder's look: knit sleeves (never sticks) and big open hands, readable at phone size
        out = '' if only_light else pline([(X(sx), Y(sy)), (X(ex), Y(ey)), (X(hx2), Y(hy2))], dark, wdt * 1.35 * sc)
        ang = math.atan2(Y(hy2) - Y(ey), X(hx2) - X(ex))
        hx3, hy3 = X(hx2) + math.cos(ang) * 10 * sc, Y(hy2) + math.sin(ang) * 10 * sc
        if not only_light:
            out += open_hand(hx3, hy3, ang, 33 * sc, dark)
        if lit and (only_light or not warm_hand):
            # the open hand in the warmth: a lit palm (her own the brightest warm in the frame: the eye lands there first)
            gx_, gy_ = hx3 + math.cos(ang) * 12 * sc, hy3 + math.sin(ang) * 12 * sc
            if warm_hand:
                out += (ell(gx_, gy_, 80 * sc, 66 * sc, HONEY, opacity='0.55', filter='url(#b16)') +
                        ell(gx_, gy_, 40 * sc, 34 * sc, HONEY_HI, opacity='0.95', filter='url(#b8)'))
            else:
                out += ell(gx_, gy_, 34 * sc, 28 * sc, HONEY, opacity=f(0.32 * lit), filter='url(#b8)')
            out += grp(open_hand(hx3, hy3, ang, 33 * sc * 0.86, lc), opacity=f(min(1.0, 0.85 * lit)))
        return out
    if kind == 'her':          # the one difference: her bun, the furthest lean, the warmth at her hand first
        o.append(body(lean=70, w=60, top=-118) + head(78, -150, 30) +
                 ell(X(66), Y(-190), 18 * sc, 16 * sc, dark) + arm(50, -100, 120, -150, 186, -186, 20))
    elif kind == 'oldman':     # a flat cap, a white moustache, leaning on his forearm, one hand out
        o.append(body(lean=30, w=78, top=-112) + head(46, -140, 30) +
                 path('M %s %s L %s %s L %s %s L %s %s Z' % (f(X(14)), f(Y(-160)), f(X(76)), f(Y(-168)), f(X(88)), f(Y(-158)), f(X(16)), f(Y(-150))), dark) +
                 ell(X(76), Y(-128), 9 * sc, 4 * sc, g(70)) + arm(40, -90, 100, -110, 150, -150, 20))
    elif kind == 'child':      # small, a pom-pom hat, both hands up
        o.append(body(lean=20, w=46, top=-70) + head(28, -98, 24) + circ(X(20), Y(-128), 9 * sc, dark) +
                 arm(18, -60, 60, -110, 92, -150, 15) + arm(-6, -60, 34, -120, 56, -168, 15))
    elif kind == 'woman':      # long hair down her back, a mug in one hand, the other out
        o.append(body(lean=36, w=70, top=-116) + head(50, -146, 29) +
                 path('M %s %s C %s %s %s %s %s %s L %s %s Z' % (f(X(30)), f(Y(-170)), f(X(0)), f(Y(-150)), f(X(-10)), f(Y(-100)), f(X(-6)), f(Y(-60)), f(X(20)), f(Y(-80))), dark) +
                 arm(44, -96, 104, -118, 156, -140, 19) + rect(X(10) - 12 * sc, Y(-80), 24 * sc, 26 * sc, dark))
    elif kind == 'beard':      # a big beard, both forearms on the sill, one hand lifted
        o.append(body(lean=24, w=82, top=-118) + head(40, -146, 31) +
                 path('M %s %s C %s %s %s %s %s %s Z' % (f(X(30)), f(Y(-130)), f(X(50)), f(Y(-96)), f(X(76)), f(Y(-104)), f(X(70)), f(Y(-136))), dark) +
                 arm(36, -86, 96, -96, 140, -128, 21))
    elif kind == 'cat':        # a cat sitting on the sill, looking at it
        o.append(ell(X(10), Y(-30), 30 * sc, 30 * sc, dark) + circ(X(30), Y(-72), 19 * sc, dark) +
                 poly([(X(20), Y(-86)), (X(24), Y(-110)), (X(34), Y(-90))], dark) + poly([(X(34), Y(-88)), (X(44), Y(-108)), (X(46), Y(-82))], dark) +
                 path('M %s %s C %s %s %s %s %s %s' % (f(X(-18)), f(Y(-6)), f(X(-46)), f(Y(-4)), f(X(-50)), f(Y(-40)), f(X(-34)), f(Y(-56))), 'none', stroke=dark, stroke_width=f(8 * sc)))
    elif kind == 'couple':     # two heads, the nearer one reaching
        o.append(body(lean=10, w=64, top=-104) + head(-6, -134, 27) + body(lean=40, w=60, top=-116) + head(56, -146, 28) +
                 arm(46, -92, 104, -120, 150, -150, 18))
    return ''.join(o)


def B7_block():
    """Round 1 (the evaluator's notes on the old B7alt; now the sequence's B7, the board read's call): the whole block reaches. Her block's Jugend facade, turned a little for depth,
    every window thrown open, its lamplight muted; her neighbours, each their own (an old man in a cap, a child on tiptoe,
    a woman with her mug, a bearded man, a couple, a cat on a sill), lean out with open hands into the warm vapour
    drifting past from the plumes; it reaches her hand first: her window, top floor at the corner, her bun, the
    furthest lean. Helsinki wants that heat, the city reaching for it."""
    defs = lin_grad('sky7a', [(0, g(6)), (1, g(22))], x1=0, y1=0, x2=0, y2=1100, units=True)
    o = [rect(0, 0, W, H, 'url(#sky7a)')]
    rnd = random.Random(77)
    a_ = math.radians(34)
    Z0, F, CX, CY = 9.0, 1080.0, 50.0, 1490.0
    def P(U, Yw):
        Xw, Zw = U * math.cos(a_), Z0 + U * math.sin(a_)
        return (CX + F * Xw / Zw, CY - F * Yw / Zw)
    TOP, BOT, UE = 7.0, -9.0, 22.0
    # the facade and its cornice under snow; Jugend ornament; the corner catching the light
    o.append(poly([P(0, TOP), P(UE, TOP), P(UE, BOT), P(0, BOT)], g(19)))
    o.append(poly([P(0, TOP + 0.5), P(UE, TOP + 0.5), P(UE, TOP), P(0, TOP)], g(28)) + poly([P(0, TOP + 0.62), P(UE, TOP + 0.62), P(UE, TOP + 0.5), P(0, TOP + 0.5)], g(84)))
    o.append(poly([P(0, TOP), P(0.25, TOP), P(0.25, BOT), P(0, BOT)], g(28)))
    for yy in (3.0, -0.4, -3.8):
        o.append(line(*P(0, yy - 0.15), *P(UE, yy - 0.15), g(24), 4))
    # the windows: four floors, five across; all thrown open, the lamplight inside lit but muted
    cols = [1.0, 5.0, 9.0, 13.0, 17.0]
    floors = [5.8, 2.4, -1.0, -4.4]
    cast = {(0, 0): 'her', (0, 1): 'oldman', (0, 2): 'couple', (0, 3): 'cat', (0, 4): None,
            (1, 0): 'child', (1, 1): 'woman', (1, 2): None, (1, 3): 'beard', (1, 4): 'woman',
            (2, 0): 'beard', (2, 1): 'cat', (2, 2): 'oldman', (2, 3): None, (2, 4): 'child',
            (3, 0): None, (3, 1): 'couple', (3, 2): 'woman', (3, 3): 'cat', (3, 4): None}
    figs = []
    for r, top in enumerate(floors):
        for c, u0 in enumerate(cols):
            u1 = u0 + 1.5
            tl, tr, br, bl = P(u0, top), P(u1, top), P(u1, top - 2.2), P(u0, top - 2.2)
            lit = cast[(r, c)] is not None or rnd.random() < 0.3
            o.append(poly([P(u0 - 0.15, top + 0.15), P(u1 + 0.15, top + 0.15), P(u1 + 0.15, top - 2.35), P(u0 - 0.15, top - 2.35)], g(26)))
            o.append(poly([tl, tr, br, bl], '#5a4838' if lit else g(10)))
            if lit:
                cx_, cy_ = (tl[0] + br[0]) / 2, (tl[1] + br[1]) / 2
                o.append(grp(ell(cx_, cy_ - (bl[1] - tl[1]) * 0.15, (tr[0] - tl[0]) * 0.45, (bl[1] - tl[1]) * 0.3, '#8c6c4a', opacity='0.55'), filter='url(#b8)'))
            # the casements, swung out
            o.append(poly([tl, P(u0 - 0.55, top + 0.1), P(u0 - 0.55, top - 2.3), bl], g(32)) + poly([tr, P(u1 + 0.45, top + 0.12), P(u1 + 0.45, top - 2.3), br], g(30)))
            o.append(poly([P(u0 - 0.25, top - 2.2), P(u1 + 0.25, top - 2.2), P(u1 + 0.25, top - 2.36), P(u0 - 0.25, top - 2.36)], g(84)))
            if cast[(r, c)]:
                sx_, sy_ = P((u0 + u1) / 2, top - 2.2)
                zz = Z0 + (u0 + u1) / 2 * math.sin(a_)
                figs.append((cast[(r, c)], sx_, sy_, F / zz / 120.0 * 1.15, (r, c) == (0, 0)))
    def leaning(kind, sx_, sy_, sc_, first, only_light=False):
        lean = 0 if kind == 'cat' else (17 if first else 13)
        return '<g transform="translate(%s %s) skewX(%s) translate(%s %s)">%s</g>' % (
            f(sx_), f(sy_ - 2), f(-lean), f(-sx_), f(-(sy_ - 2)),
            neighbour(kind, sx_, sy_ - 2, sc_, warm_hand=first, lit=(0.0 if kind == 'cat' else 1.0), only_light=only_light))
    for kind, sx_, sy_, sc_, first in figs:
        # each one leans out over the sill toward the warmth (the cats sit)
        o.append(leaning(kind, sx_, sy_, sc_, first))
    # the warm vapour drifting past from the plumes beyond the block: white, its warmth carried in it; it reaches her first.
    # Round 2 (note 1: it read as cool fog): a warm core that reads at a glance, warmest where it meets the hands
    for i, (u, yy, w, h) in enumerate([(3.0, 6.6, 520, 120), (8.0, 3.4, 600, 130), (12.5, 6.9, 480, 110), (5.5, -0.2, 520, 120), (14.0, 2.2, 460, 110)]):
        px, py = P(u, yy)
        blobs = ''.join(ell(px + k * w / 7.0, py + math.sin(k * 0.9 + i) * 18, w / 6.0 * (0.7 + 0.08 * k), h / 2.6, '#f3f6fa', opacity='0.34') for k in range(8))
        o.append(grp(blobs, filter='url(#vap)'))
        core = [(px + k * w / 7.0, py + math.sin(k * 0.9 + i) * 18) for k in range(1, 7)]
        o.append(grp(pline(core, HONEY, h / 2.4, opacity='0.4'), filter='url(#b16)'))
        o.append(grp(pline(core[1:], HONEY_HI, h / 6.0, opacity='0.72'), filter='url(#b4)'))
    hx_, hy_ = P(2.5, 6.0)
    o.append(grp(path('M %s %s C %s %s %s %s %s %s' % (f(hx_ + 260), f(hy_ - 10), f(hx_ + 160), f(hy_ - 40), f(hx_ + 90), f(hy_ - 70), f(hx_ + 40), f(hy_ - 74)),
                      'none', stroke=HONEY, stroke_width='44', stroke_linecap='round', opacity='0.45'), filter='url(#b16)'))
    o.append(grp(path('M %s %s C %s %s %s %s %s %s' % (f(hx_ + 260), f(hy_ - 10), f(hx_ + 160), f(hy_ - 40), f(hx_ + 90), f(hy_ - 70), f(hx_ + 40), f(hy_ - 74)),
                      'none', stroke=HONEY_HI, stroke_width='18', stroke_linecap='round', opacity='0.9'), filter='url(#b4)'))
    # the warmth caught on the faces and the open hands, over the vapour (kept below the payoff's warmth; hers the brightest)
    for kind, sx_, sy_, sc_, first in figs:
        if kind != 'cat':
            o.append(leaning(kind, sx_, sy_, sc_, first, only_light=True))
    o.append(snow(771, 300, 0, 0, W, H, 1.6, 4.2, op=(0.4, 0.9)))
    caption = cap('But Helsinki', '*wants| that heat.')
    return defs, ''.join(o), caption


def B8alt():
    """Round 1 rework (the old B8alt, her finger-drawing on the steamed glass, read as her daydream, not the city's plan):
    the reverse shot. On the empty snowy lot at the city's edge, at night, the big new data centre stands drawn in pale
    chalk right beside us (big: a plan, not built), survey stakes in the snow; its pipe, drawn in warm chalk, leaves it,
    crosses the frozen bay and points straight at one small warm window on the far shore: hers, top floor, by
    Uspenski's domes. Real, coming soon, and coming to her."""
    HZ = 1046
    defs = lin_grad('sky8a', [(0, g(6)), (0.7, g(13)), (1, g(24))], x1=0, y1=0, x2=0, y2=HZ, units=True)
    o = [rect(0, 0, W, HZ + 4, 'url(#sky8a)')]
    rnd = random.Random(818)
    # the far shore: Katajanokka's blocks across the bay, Uspenski's domes, her corner block and her one warm window
    x = 380
    while x < W + 20:
        bw, bh = rnd.uniform(40, 80), rnd.uniform(46, 96)
        o.append(rect(x, HZ - bh, bw, bh + 8, g(15)) + poly([(x, HZ - bh), (x + bw / 2, HZ - bh - 12), (x + bw, HZ - bh)], g(15)))
        for q in range(int((bh - 8) // 14)):
            for c in range(int((bw - 6) // 12)):
                if rnd.random() < 0.3:
                    o.append(rect(x + 5 + c * 12, HZ - bh + 8 + q * 14, 5, 7, HONEY_DEEP if rnd.random() < 0.6 else g(30)))
        x += bw * rnd.uniform(0.9, 1.0)
    o.append(grp(domes(470, HZ - 40, 0.5, g(12), snowcol=g(46)), filter='url(#rough2)'))
    hbx, hby = 760, HZ - 130
    o.append(rect(hbx - 50, hby, 120, 140, g(17)) + rect(hbx - 54, hby - 8, 128, 10, g(62)))
    o.append(rect(hbx + 30, hby + 18, 22, 26, HONEY_HI) + circ(hbx + 41, hby + 34, 6, g(10)) + circ(hbx + 39, hby + 26, 3.6, g(10)))
    o.append(grp(ell(hbx + 41, hby + 31, 34, 28, HONEY, opacity='0.45'), filter='url(#b8)'))
    o.append(rect(0, HZ, W, 8, g(20)))
    # the frozen bay between us and her: snowy ice, its cracks, open water's dark line by the shore
    defs += lin_grad('ice8a', [(0, g(44)), (1, g(64))], x1=0, y1=HZ, x2=0, y2=1330, units=True)
    o.append(rect(0, HZ + 8, W, 1330 - HZ, 'url(#ice8a)'))
    o.append(grp(''.join(pline([(rnd.uniform(0, W), rnd.uniform(HZ + 20, 1320)) for _ in range(3)], g(36), 2, opacity='0.6') for _ in range(9)), filter='url(#rough2)'))
    # the lot on our shore: snow, banks, stakes with their warm flags, footprints
    defs += lin_grad('lot8a', [(0, g(72)), (1, g(84))], x1=0, y1=1320, x2=0, y2=H, units=True)
    o.append(grp(path('M -40 1330 C 200 1312 600 1318 1120 1300 L 1120 1940 L -40 1940 Z', 'url(#lot8a)'), filter='url(#rough)'))
    for sx_, sy_ in ((640, 1500), (780, 1640), (930, 1780), (560, 1400), (880, 1420)):
        o.append(line(sx_, sy_, sx_, sy_ - 60, g(86), 5) + rect(sx_, sy_ - 64, 20, 12, HONEY_MID))
    for k in range(6):
        o.append(ell(700 + k * 46, 1880 - k * 70, 16, 6, g(66)))
    # the plan beside us: the big data centre in pale chalk on the night (no fill), the night and the lot through it
    ch = '#eef1f5'
    pl = ''
    X0, X1, YT, YB, VX, VY = -60, 470, 650, 1450, 900, HZ - 30
    k_ = lambda x_, y_, t: (x_ + (VX - x_) * t, y_ + (VY - y_) * t)
    pl += pline([(X0, YB), (X1, YB), (X1, YT), (X0, YT)], ch, 7)
    e_t, e_b = k_(X1, YT, 0.34), k_(X1, YB, 0.34)
    pl += pline([(X1, YT), e_t, e_b, (X1, YB)], ch, 6)
    for xx in (40, 150, 260, 370):
        pl += line(xx, YT + 6, xx, YB - 4, ch, 3)
    for xa, xb in ((60, 180), (210, 330)):
        pl += pline([(xa, YB), (xa, YB - 380), (xb, YB - 380), (xb, YB)], ch, 4)
    for k in range(4):
        fx = 40 + k * 120
        pl += ell(fx, YT - 16, 46, 12, 'none', stroke=ch, stroke_width='3.4')
    o.append(grp(pl, filter='url(#chalk)'))
    # its pipe in warm chalk: out of its far end, along our shore, over the ice, straight to her window
    route = [(482, 1452), (560, 1392), (636, 1310), (694, 1214), (734, 1130), (756, 1074), (764, HZ + 2)]
    pipe = ''.join(line(route[i][0], route[i][1], route[i + 1][0], route[i + 1][1], HONEY, 18 - i * 2.4) for i in range(len(route) - 1))
    o.append(grp(pline(route, HONEY_MID, 26, opacity='0.22'), filter='url(#b8)'))
    o.append(grp(pipe, filter='url(#chalk)'))
    o.append(snow(818, 240, 0, 0, W, H, 1.6, 4.0, op=(0.4, 0.9)))
    caption = cap('The city has a plan,', 'starting |*next year.')
    return defs, ''.join(o), caption


def flat_room(kind, x, y, w, h, warm_rad, rnd):
    """One flat in the opened house: its lamplit room (muted), the life in it as silhouettes, and its radiator under the
    back window (warm once the heat has come up to it)."""
    d = g(9)
    o = rect(x, y, w, h, '#3c3631' if kind != 'dark' else g(13))
    if kind != 'dark':
        o += grp(ell(x + w * 0.5, y + h * 0.3, w * 0.45, h * 0.55, '#6b6054', opacity='0.5'), filter='url(#b8)')
    o += rect(x + w * 0.62, y + h * 0.16, w * 0.2, h * 0.44, g(16) if kind != 'dark' else g(10))          # the back window
    rw = w * 0.2
    rcol = HONEY_DEEP if warm_rad == 1 else (HONEY_DARK if warm_rad == 0.5 else g(26))
    o += rect(x + w * 0.62, y + h * 0.66, rw, h * 0.2, rcol, rx='3')                                       # its radiator
    for k in range(5):
        o += line(x + w * 0.62 + rw * (k + 0.5) / 5, y + h * 0.68, x + w * 0.62 + rw * (k + 0.5) / 5, y + h * 0.84, g(12), 1.4)
    fl = y + h
    if kind == 'dinner':
        o += rect(x + w * 0.16, fl - h * 0.36, w * 0.36, h * 0.06, d) + line(x + w * 0.34, y, x + w * 0.34, y + h * 0.2, d, 2) + \
            ell(x + w * 0.34, y + h * 0.22, 12, 6, HONEY_MID)
        for k, hx in enumerate((0.14, 0.3, 0.5)):
            o += circ(x + w * hx, fl - h * 0.56, 9, d) + rect(x + w * hx - 9, fl - h * 0.48, 18, h * 0.3, d, rx='6')
    elif kind == 'reader':
        o += path('M %s %s C %s %s %s %s %s %s L %s %s Z' % (f(x + w * 0.12), f(fl), f(x + w * 0.1), f(fl - h * 0.6), f(x + w * 0.36), f(fl - h * 0.6),
                                                          f(x + w * 0.36), f(fl - h * 0.3), f(x + w * 0.36), f(fl)), d)
        o += circ(x + w * 0.27, fl - h * 0.62, 9, d) + rect(x + w * 0.32, fl - h * 0.5, 16, 10, g(70))
        o += line(x + w * 0.46, fl, x + w * 0.46, fl - h * 0.7, d, 2.4) + poly([(x + w * 0.42, fl - h * 0.7), (x + w * 0.5, fl - h * 0.7), (x + w * 0.48, fl - h * 0.82), (x + w * 0.44, fl - h * 0.82)], HONEY_MID)
    elif kind == 'kids':
        o += rect(x + w * 0.08, fl - h * 0.3, w * 0.38, h * 0.1, d) + rect(x + w * 0.08, fl - h * 0.7, w * 0.38, h * 0.1, d) + \
            line(x + w * 0.09, fl, x + w * 0.09, fl - h * 0.8, d, 3) + line(x + w * 0.45, fl, x + w * 0.45, fl - h * 0.8, d, 3)
        o += circ(x + w * 0.2, fl - h * 0.78, 7, d) + circ(x + w * 0.3, fl - h * 0.38, 7, d) + circ(x + w * 0.52, fl - h * 0.1, 8, d)
    elif kind == 'cook':
        o += rect(x + w * 0.1, fl - h * 0.4, w * 0.22, h * 0.4, d) + rect(x + w * 0.14, fl - h * 0.48, w * 0.12, h * 0.08, g(30))
        o += vapour(rnd.randint(0, 999), x + w * 0.2, fl - h * 0.5, 22, 40, op=0.5, n=4, flt='vapS', root=None, wisps=0)
        o += circ(x + w * 0.44, fl - h * 0.72, 9, d) + rect(x + w * 0.44 - 10, fl - h * 0.64, 20, h * 0.64, d, rx='7')
    elif kind == 'cat':
        o += rect(x + w * 0.06, fl - h * 0.34, w * 0.42, h * 0.34, d, rx='8') + ell(x + w * 0.24, fl - h * 0.4, w * 0.12, h * 0.07, d) + \
            circ(x + w * 0.4, fl - h * 0.46, 7, d)
        o += circ(x + w * 0.12, fl - h * 0.48, 6, d) + poly([(x + w * 0.1, fl - h * 0.52), (x + w * 0.11, fl - h * 0.6), (x + w * 0.125, fl - h * 0.53)], d)
    elif kind == 'her':
        o += path('M %s %s C %s %s %s %s %s %s L %s %s Z' % (f(x + w * 0.1), f(fl), f(x + w * 0.08), f(fl - h * 0.62), f(x + w * 0.34), f(fl - h * 0.62),
                                                          f(x + w * 0.34), f(fl - h * 0.3), f(x + w * 0.34), f(fl)), d)
        o += circ(x + w * 0.27, fl - h * 0.64, 9, d) + circ(x + w * 0.25, fl - h * 0.76, 5.5, d)
        o += rect(x + w * 0.32, fl - h * 0.56, 9, 13, '#dfe9f1') + grp(circ(x + w * 0.33, fl - h * 0.5, 14, '#cfe0ec', opacity='0.4'), filter='url(#b4)')
        o += rect(x + w * 0.42, fl - h * 0.3, w * 0.08, h * 0.3, d) + rect(x + w * 0.43, fl - h * 0.4, w * 0.06, h * 0.1, g(26))
    elif kind == 'plants':
        for k in range(3):
            px_ = x + w * (0.1 + 0.13 * k)
            o += rect(px_, fl - h * 0.2, 14, h * 0.2, d) + grp(ell(px_ + 7, fl - h * 0.3, 14, 14, d), filter='url(#rough)')
        o += circ(x + w * 0.5, fl - h * 0.72, 9, d) + rect(x + w * 0.5 - 10, fl - h * 0.64, 20, h * 0.64, d, rx='7')
    return o


def B11alt():
    """Round 1 rework (the old B11alt, an eye-level street to her door, read lonely and cold): the house opened like a
    doll's house. Her Jugend block across the snowy street, its front cut away: every flat lamplit with its life (a
    family at dinner, an old man reading, the kids' bunk beds, someone at the stove, a cat on the sofa, plants), and
    under the street, in the opened ground, the warm pipe comes in from the harbour, into the cellar, up the wall, into
    every radiator, floor by floor, the lower ones warm already, hers at the top, the last, just warming. Pipes under
    the streets carry that heat into people's homes."""
    defs = lin_grad('sky11b', [(0, g(6)), (1, g(20))], x1=0, y1=0, x2=0, y2=700, units=True)
    o = [rect(0, 0, W, H, 'url(#sky11b)')]
    rnd = random.Random(1112)
    BX0, BX1, TOPY, FLH, NF = 100, 980, 664, 126, 5
    BASE = TOPY + FLH * NF
    # neighbours' blocks either side (dark, a few windows), the roof under snow, chimneys
    for x0_, x1_ in ((-40, BX0 - 8), (BX1 + 8, 1120)):
        o.append(rect(x0_, TOPY - 10, x1_ - x0_, BASE - TOPY + 10, g(14)))
        for r in range(NF):
            for c in range(2):
                if rnd.random() < 0.5:
                    o.append(rect(x0_ + 14 + c * 46, TOPY + 24 + r * FLH, 24, 40, HONEY_DEEP if rnd.random() < 0.5 else g(20)))
    o.append(poly([(BX0 - 20, TOPY), (BX1 + 20, TOPY), (BX1 - 40, 618), (BX0 + 40, 618)], g(74)) + rect(BX0 - 20, TOPY - 4, BX1 - BX0 + 40, 8, g(30)))
    for cx_ in (260, 620, 860):
        o.append(rect(cx_, 600, 24, 30, g(20)) + rect(cx_ - 3, 596, 30, 7, g(80)))
    # the opened house: the flats floor by floor (the heat has reached the lower ones; hers, top right, is just warming)
    plan_ = [['plants', 'reader', 'her'], ['cook', 'dark', 'cat'], ['kids', 'dinner', 'reader'], ['reader', 'cat', 'cook'], ['dinner', 'plants', 'kids']]
    rw_ = (BX1 - BX0 - 40) / 3.0
    for r in range(NF):
        for c in range(3):
            kind = plan_[r][c]
            warm_rad = 1 if r >= 1 else (0.5 if c == 2 else 1)
            o.append(flat_room(kind, BX0 + 30 + c * rw_ + 4, TOPY + r * FLH + 8, rw_ - 8, FLH - 16, warm_rad, rnd))
    for r in range(NF + 1):
        o.append(rect(BX0, TOPY + r * FLH - 8, BX1 - BX0, 14, g(30)))
    o.append(rect(BX0, TOPY - 8, 30, BASE - TOPY + 8, g(28)) + rect(BX1 - 14, TOPY - 8, 14, BASE - TOPY + 8, g(28)))
    for c in (1, 2):
        o.append(rect(BX0 + 30 + c * rw_ - 4, TOPY, 8, BASE - TOPY, g(26)))
    # the riser up the wall, a branch along each floor to its radiators (warm up to the floor it has reached)
    riser_x = BX0 + 14
    o.append(line(riser_x, BASE + 60, riser_x, TOPY + FLH * 0.8, HONEY_DEEP, 8) + line(riser_x, BASE + 60, riser_x, TOPY + FLH * 0.8, HONEY_MID, 3))
    for r in range(NF):
        yy = TOPY + r * FLH + FLH - 24
        o.append(line(riser_x, yy, BX1 - 60, yy, HONEY_DEEP if r >= 1 else HONEY_DARK, 4))
    # the street in front: snow, the tram passing, the kerb, a lamp
    o.append(rect(0, BASE, W, 60, g(76)) + rect(0, BASE + 50, W, 10, g(60)))
    o.append(rect(60, BASE - 70, 300, 76, g(36), rx='16') + rect(80, BASE - 58, 260, 26, g(78)) + rect(60, BASE - 2, 300, 8, g(20)))
    o.append(line(880, BASE + 10, 880, BASE - 160, g(22), 6) + circ(880, BASE - 166, 10, g(80)))
    # under the street, the ground opened: the warm pipe in its trench, in from the harbour, into the cellar's heat box
    gy_ = BASE + 60
    o.append(rect(0, gy_, W, H - gy_, '#3a332d'))
    o.append(grp(''.join(circ(rnd.uniform(0, W), rnd.uniform(gy_ + 10, H), rnd.uniform(2, 6), g(30), opacity='0.6') for _ in range(130)), filter='url(#b1)'))
    o.append(rect(BX0, gy_, BX1 - BX0, 150, g(16)))                                                         # the cellar
    o.append(rect(BX0 + 20, gy_ + 40, 120, 90, g(26), rx='6') + grp(ell(BX0 + 80, gy_ + 85, 80, 50, HONEY, opacity='0.3'), filter='url(#b8)'))
    py_ = gy_ + 176
    o.append(grp(rect(0, py_ - 30, W, 60, HONEY_DEEP, opacity='0.25'), filter='url(#b16)'))
    o.append(line(0, py_, BX0 + 80, py_, HONEY_DEEP, 30) + line(0, py_, BX0 + 80, py_, HONEY_MID, 14) + line(0, py_, BX0 + 80, py_, HONEY_HI, 4, opacity='0.6'))
    o.append(line(BX0 + 80, py_, BX0 + 80, gy_ + 130, HONEY_DEEP, 26) + line(BX0 + 80, py_, BX0 + 80, gy_ + 130, HONEY_MID, 12))
    o.append(line(BX0 + 20, gy_ + 70, riser_x, gy_ + 70, HONEY_DEEP, 8) + line(riser_x, gy_ + 70, riser_x, BASE, HONEY_DEEP, 8))
    # the snow on the street melted over the pipe, a warm breath from the street's manhole
    o.append(grp(rect(0, BASE + 2, BX0 + 80, 10, g(40)), filter='url(#rough)'))
    o.append(vapour(1131, 40, BASE + 2, 70, 140, op=0.6, n=6, flt='vapS', root_w=24, wisps=0))
    o.append(snow(1113, 280, 0, 0, W, BASE, 1.6, 4.2, op=(0.4, 0.9)))
    caption = cap('carry that heat', "into people's |*homes.")
    return defs, ''.join(o), caption


FRAMES.update({
    'D-B2': B2alt,
    'D-B7': B7_block,
    'D-B7alt': B7_catch,
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
