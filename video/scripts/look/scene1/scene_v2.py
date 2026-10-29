"""Scene 1 ("She quit Google."), still v2: DEPTH IS AIR AND DISTANCE (owner, 2026-10-29, on still v1).

python3 scene_v2.py OUT_DIR [values] [detail] [final]   (default: all three)
  values -> stage_v2_values.png   (big shapes, each in the grey of its colour's L*)
  detail -> /tmp/scene1-iter/stage_v2_detail.png (colour + detail, before the mottle)
  final  -> still_v2.png          (detail + the very subtle paper mottle)
v1 stays reproducible with scene.py.

Construction: the camera pulled far back across a canal basin. The landscraper sits in the middle distance (~55 % of
the width, its whole length visible, sky round its top and both ends), its quay FULL (awnings, cafe tables, people,
bikes, lamps, a row of trees, planters, moored narrowboats), open water before it, and the city receding behind and
beside it in five paler, smaller, simpler layers down to tiny towers on the horizon. The sky: one gentle gradient, a
soft cloud bank low behind the city, small clouds, a paint-like tonal variation, a few birds; the caption band calm.
The near frame is a hint at the edges: a low dark bank edge, one branch at the top right, a few leaves at the bottom
left. No landmarks hunted, no clever angle. Key light: a low October sun from the right. No outlines.
"""
import math
import os
import random
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from svgkit import SVG, render  # noqa: E402
from scene import srgb_to_lstar, lstar_to_grey, crown, walker, mottle  # noqa: E402

SCRATCH = '/tmp/scene1-iter'
W, H = 1080, 1920

C = dict(
    # sky (top -> horizon), clouds, birds
    sky0='#C4DAE2', sky1='#D0E1E2', sky2='#D9E5E0', sky3='#E7E3D4', sky4='#F2DDC6', sky5='#F5D9C0',
    cloud_l='#FAEEDD', cloud_s='#E8D8D3', cloud_hi='#FDF4E8', bird='#8F8290',
    ink='#2C2232',
    # the far layers, farthest (5) to nearest (1)
    f5='#EDDDD6', f5s='#E7D6D3',
    f4='#E4D4D5', f4s='#DACACF',
    f3='#D9C6CA', f3s='#CCB9C1', f3w='#D0BCC2',
    f2='#CDB3B5', f2s='#B9A1AC', f2w='#BBA2AA', f2l='#D9C0BB',
    f1='#C99E88', f1s='#A98A8B', f1w='#8E7277', f1l='#D8AE93', f1g='#EFC48A',
    crane='#B9A4A6',
    # the hero
    fin='#F4E1BE', fin_side='#BC9D90', glass='#2E4B5B', glass2='#3D5D6D', skyrefl='#A3C0C6', glow='#F4BE6E',
    glow2='#F8D79E', slab='#EAD3AE', parapet='#E6CDA8', end='#A391A4', end_dark='#887892', end_fin='#B6A5B2',
    hero_front='#8F857C', lobby='#F8D79E',
    tree_d='#3F6450', tree_l='#719662', tree_a='#C3713F', tree_al='#DC9552', trunk='#5A4240',
    # the quay and its life
    quay='#E8CAA6', quay_l='#F1D9B6', quay_s='#D9B793', quay_glow='#F6E0BC', quay_edge='#B98F78', quay_dark='#8A6B67',
    awn='#F3E5C9', awn_f='#DCC4A2', awn_t='#C9714E', awn_tf='#A95C40', awn_g='#5C9A8C', awn_gf='#477A70',
    under='#7E6762', table='#F0E2C8', chair='#6E5A5E',
    p1='#8C6E8A', p2='#B7795E', p3='#6A7A92', p4='#C79A5A', p5='#7D8C6E', p6='#A86A6E', pd='#4A4256', skin='#D9A48A',
    bike='#4A4256', lamp='#3A3442', lamp_glow='#F6D290', planter='#9C7A66', shrub='#5E8A50', shrub_l='#86AA66',
    # boats
    hull='#2A4740', hull2='#2F3D63', hull3='#6E2F35', cabin='#2F6B56', cabin2='#34477A', cabin3='#8E3A3E',
    trim='#B6462F', trim2='#E1B04A', panel='#EFD8AE', roof_b='#5B4848', pot='#C0663E', leaf_pot='#5E8A50',
    win='#2B2838',
    # her + Pip
    her='#13898A', her_l='#2BA8A0', her_d='#0C6266', hair='#2A1E26', legs='#2E2B3C', box='#C9945A', box_d='#A67445',
    pip='#9EA4E8', pip_d='#7C82CF', pip_e='#C9B8EA', pip_eye='#2C2232',
    # water
    water0='#BDD6D2', water1='#A9CBCA', water2='#93BCBD', ripple='#D3E4DE', ripple_d='#86AFB2', refl='#8EB0B3',
    refl_l='#C2D5CF', refl_glow='#EBD3A4', refl_dark='#6B8F97', duck='#6A5A56',
    # the near frame (small, subtle)
    coping_l='#C7A68C', coping='#6A5050', path='#8E6E62', path2='#836459', path3='#9A7868', bollard='#3E3440',
    brick='#B65A3C', brick_d='#86423A', brick_l='#C9704B', slate='#6C6E88', slate_d='#464962', slate_l='#8487A0',
    win_glow='#E9A75A', brick_sh='#9A4A36',
    tread='#8A8E6C', tread2='#9C8A75', tread_l='#AA9882', riser='#74625A', tread_gl='#989C78',
    leaf_d='#4F6A4E', leaf_l='#748F63', leaf_a='#B9774A', leaf_al='#CF935E', twig='#5A4446',
)


class Pal:
    def __init__(self, grey):
        self.grey = grey

    def __getitem__(self, k):
        c = C[k]
        return lstar_to_grey(srgb_to_lstar(c)) if self.grey else c


def y_on(x, x0, y0, vp):
    return y0 + (vp[1] - y0) * (x - x0) / (vp[0] - x0)


def cloud(s, cx, cy, w, h, lit, shade, hi=None, seed=0, n=7):
    """a soft cumulus bank: a flat base, lumps on top, the lit top toward the sun (right), a shade underside."""
    rnd = random.Random(seed)
    lumps = []
    for i in range(n):
        t = (i + 0.5) / n
        lx = cx - w / 2 + w * t + rnd.uniform(-w / (3 * n), w / (3 * n))
        lr = h * (0.45 + 0.55 * math.sin(math.pi * t)) * rnd.uniform(0.8, 1.1)
        lumps.append((lx, lr))
    base = cy + h * 0.35
    s.group(filter='url(#soft)')
    for lx, lr in lumps:
        s.ellipse(lx, base - lr * 0.55, lr * 1.25, lr * 0.75, shade)
    s.rect(cx - w / 2, base - h * 0.35, w, h * 0.35, shade)
    for lx, lr in lumps:
        s.ellipse(lx + lr * 0.12, base - lr * 0.70, lr * 1.12, lr * 0.62, lit)
    if hi:
        for lx, lr in lumps[len(lumps) // 3:]:
            s.ellipse(lx + lr * 0.3, base - lr * 0.86, lr * 0.62, lr * 0.32, hi)
    s.end()


def leaf(s, x, y, L, ang, lit, shade, wid=0.34):
    """one real leaf shape: a pointed ellipse, its lit half and its shade half (no outline, no vein lines)."""
    ca, sa = math.cos(ang), math.sin(ang)

    def T(u, v):
        return (x + u * ca - v * sa, y + u * sa + v * ca)
    top, bot = [], []
    N = 9
    for i in range(N + 1):
        u = L * i / N
        v = L * wid * math.sin(math.pi * i / N) ** 0.85
        top.append(T(u, -v))
        bot.append(T(u, v))
    mid = [T(L * i / N, 0) for i in range(N + 1)]
    s.poly(top + mid[::-1], lit)
    s.poly(bot + mid[::-1], shade)


def person_seated(s, x, y, h, col, pd):
    s.circle(x, y - h * 0.82, h * 0.15, pd)
    s.poly([(x - h * 0.2, y - h * 0.66), (x + h * 0.2, y - h * 0.66), (x + h * 0.26, y - h * 0.18), (x - h * 0.26, y - h * 0.18)], col)


def bike(s, x, y, r, col):
    s.add('<circle cx="%.1f" cy="%.1f" r="%.1f" fill="none" stroke="%s" stroke-width="1.4"/>' % (x - r * 1.2, y - r, r, col))
    s.add('<circle cx="%.1f" cy="%.1f" r="%.1f" fill="none" stroke="%s" stroke-width="1.4"/>' % (x + r * 1.2, y - r, r, col))
    s.add('<polyline points="%.1f,%.1f %.1f,%.1f %.1f,%.1f %.1f,%.1f" fill="none" stroke="%s" stroke-width="1.4" stroke-linejoin="round"/>'
          % (x - r * 1.2, y - r, x - r * 0.1, y - r * 2.1, x + r * 1.2, y - r, x - r * 0.2, y - r, col))


def build(stage):
    grey = stage == 'values'
    D = stage != 'values'
    P = Pal(grey)
    s = SVG(W, H)
    s.defs.append('<filter id="soft" x="-5%" y="-20%" width="110%" height="140%"><feGaussianBlur stdDeviation="1.6"/></filter>')
    s.defs.append('<filter id="paint" x="0" y="0" width="1" height="1" filterUnits="objectBoundingBox">'
                  '<feTurbulence type="fractalNoise" baseFrequency="0.0021 0.0046" numOctaves="3" seed="8" result="n"/>'
                  '<feColorMatrix in="n" type="matrix" values="0 0 0 0 1  0 0 0 0 0.95  0 0 0 0 0.88  2.2 0 0 0 -1.0"/>'
                  '</filter>')
    s.defs.append('<filter id="paint2" x="0" y="0" width="1" height="1" filterUnits="objectBoundingBox">'
                  '<feTurbulence type="fractalNoise" baseFrequency="0.0030 0.0060" numOctaves="2" seed="21" result="n"/>'
                  '<feColorMatrix in="n" type="matrix" values="0 0 0 0 0.70  0 0 0 0 0.80  0 0 0 0 0.88  0 2.2 0 0 -1.0"/>'
                  '</filter>')

    # ---- SKY: one gentle gradient + a paint-like tonal variation (calmer in the caption band) ----------------------
    if grey:
        s.rect(0, 0, W, H, P['sky2'])
    else:
        g = s.lingrad([(0, C['sky0']), (290 / 1920, C['sky1']), (600 / 1920, C['sky2']), (820 / 1920, C['sky3']),
                       (980 / 1920, C['sky4']), (1100 / 1920, C['sky5']), (1, C['sky5'])], 0, 0, 0, 1920,
                      units='userSpaceOnUse')
        s.rect(0, 0, W, H, g)
        for (y0, y1, op1, op2) in [(0, 290, 0.16, 0.14), (290, 600, 0.05, 0.04), (600, 1100, 0.18, 0.15)]:
            s.rect(0, y0, W, y1 - y0, '#fff', filter='url(#paint)', opacity=op1)
            s.rect(0, y0, W, y1 - y0, '#fff', filter='url(#paint2)', opacity=op2)

    # clouds: small ones high (outside the band), one big soft bank low behind the city
    cloud(s, 210, 170, 330, 62, P['cloud_l'], P['cloud_s'], None if grey else P['cloud_hi'], seed=3, n=6)
    cloud(s, 905, 690, 250, 44, P['cloud_l'], P['cloud_s'], None if grey else P['cloud_hi'], seed=5, n=5)
    cloud(s, 300, 860, 720, 120, P['cloud_l'], P['cloud_s'], None if grey else P['cloud_hi'], seed=9, n=9)
    cloud(s, 860, 880, 620, 104, P['cloud_l'], P['cloud_s'], None if grey else P['cloud_hi'], seed=12, n=8)
    if D:
        for (bx, by, bs) in [(742, 652, 1.0), (764, 640, 0.8), (786, 657, 0.9), (722, 668, 0.7), (806, 646, 0.6)]:
            s.poly([(bx - 7 * bs, by - 3 * bs), (bx, by + 1.5 * bs), (bx + 7 * bs, by - 3 * bs), (bx + 7 * bs, by - 1.6 * bs),
                    (bx, by + 3.4 * bs), (bx - 7 * bs, by - 1.6 * bs)], P['bird'])

    # ---- THE FAR CITY: five layers, each paler, smaller, simpler; tiny towers on the horizon ------------------------
    def blocks(rnd, x0, x1, base, tmin, tmax, wmin, wmax, col, scol=None, wcol=None, unit=0, towers=(), lit=None,
               glowc=None, crane=None):
        x = x0
        while x < x1:
            w = rnd.uniform(wmin, wmax)
            top = rnd.uniform(tmin, tmax)
            s.rect(x, top, w + 0.6, base - top, P[col])
            if D and scol:
                s.rect(x, top, w * 0.28, base - top, P[scol])
            if D and lit:
                s.rect(x + w * 0.78, top, w * 0.22, base - top, P[lit])
            if D and wcol and unit:
                cols = max(1, int((w * 0.62) / (unit * 2.0)))
                for yy in range(int(top + unit * 1.6), int(base - unit), int(unit * (2.4 if unit > 4 else 4.2))):
                    for k in range(cols):
                        xx = x + w * 0.3 + k * unit * 2.0
                        c = P[glowc] if (glowc and rnd.random() < 0.08) else P[wcol]
                        s.rect(xx, yy, unit, unit * 1.3, c)
            x += w
        for (tx, tw, ttop) in towers:
            s.rect(tx, ttop, tw, base - ttop, P[col])
            if D and scol:
                s.rect(tx, ttop, tw * 0.3, base - ttop, P[scol])
        if D and crane:
            for (cx, ctop, jib) in crane:
                s.rect(cx, ctop, 2.2, base - ctop, P['crane'])
                s.rect(cx - jib * 0.25, ctop, jib, 2.2, P['crane'])
                s.rect(cx + jib * 0.6, ctop + 2, 1, 14, P['crane'])

    rnd = random.Random(41)
    # L5: the ghost strip on the horizon, with a cluster of tiny towers (k ~0.87)
    blocks(rnd, -10, 1090, 1075, 1036, 1058, 14, 34, 'f5', 'f5s',
           towers=[(642, 9, 952), (654, 7, 964), (665, 12, 940), (679, 6, 968), (688, 9, 956), (726, 7, 972),
                   (744, 10, 962), (150, 8, 1018), (962, 9, 1010)], crane=[(704, 958, 30)])
    # L4 (k ~0.75)
    blocks(rnd, -10, 1090, 1090, 1010, 1046, 22, 48, 'f4', 'f4s',
           towers=[(70, 16, 958), (96, 11, 980), (930, 18, 950), (958, 12, 972), (1010, 14, 966)],
           crane=[(860, 978, 46), (200, 990, 40)])
    # L3 (k ~0.6): a little bigger, tone-on-tone windows
    blocks(rnd, -10, 1090, 1110, 1010, 1050, 30, 64, 'f3', 'f3s', None, unit=0,
           towers=[(20, 24, 930), (1036, 26, 920), (60, 14, 960), (984, 16, 950)])
    # L2 (k ~0.4): King's Cross mid-rises beside the hero
    blocks(rnd, -10, 200, 1150, 1030, 1070, 44, 80, 'f2', 'f2s', 'f2w', unit=2.6, lit='f2l')
    blocks(rnd, 846, 1090, 1150, 1036, 1076, 44, 80, 'f2', 'f2s', 'f2w', unit=2.6, lit='f2l',
           towers=[(1000, 40, 970)])
    # L1 (k ~0.25): warm brick blocks at the hero's ends, real windows, a few lit
    blocks(rnd, -10, 190, 1210, 1086, 1112, 56, 96, 'f1', 'f1s', 'f1w', unit=4.4, lit='f1l', glowc='f1g')
    blocks(rnd, 866, 1090, 1196, 1084, 1110, 56, 96, 'f1', 'f1s', 'f1w', unit=4.4, lit='f1l', glowc='f1g')

    # ---- THE HERO: the landscraper in the middle distance, its whole length visible -----------------------------
    EYE = 1070
    VPR, VPL = (3200, EYE), (-1600, EYE)
    cx0, ytop0, ybase0 = 238, 952, 1198       # front-left corner
    xr = 838                                  # its far (right) end
    xend = 202                                # the end face's back edge

    def ft(x):
        return y_on(x, cx0, ytop0, VPR)

    def fb(x):
        return y_on(x, cx0, ybase0, VPR)
    kU = (VPR[0] - cx0) / (VPR[0] - xr) - 1

    def fx(u):
        return VPR[0] - (VPR[0] - cx0) / (1 + kU * u)

    def sc(x):
        return (VPR[0] - x) / (VPR[0] - cx0)
    storeys, gf, par = 10, 44, 6
    sh = (ybase0 - gf - ytop0 - par) / storeys
    steps = [(0.0, 1), (0.07, 0), (0.56, 1), (0.80, 2.5)]   # (from u, storeys down): the terraces

    def down(x):
        d = 0
        for u0, dd in steps:
            if x >= fx(u0):
                d = dd
        return d

    def rt(x):
        return ft(x) + down(x) * sh * sc(x)
    xs = [fx(u0) for u0, _ in steps[1:]]
    front = [(cx0, rt(cx0))]
    for x in xs:
        front += [(x, rt(x - 0.01)), (x, rt(x))]
    front += [(xr, rt(xr)), (xr, fb(xr)), (cx0, ybase0)]
    ytop_e = y_on(xend, cx0, rt(cx0), VPL)
    ybase_e = y_on(xend, cx0, ybase0, VPL)
    endf = [(xend, ytop_e), (cx0, rt(cx0)), (cx0, ybase0), (xend, ybase_e)]
    s.poly(endf, P['end'])
    s.poly(front, P['hero_front'] if grey else P['glass'])
    clip = s.clip('<polygon points="%s"/>' % ' '.join('%.1f,%.1f' % q for q in front))
    zf = [(ytop0 + par) + sh * i for i in range(storeys + 1)]
    if D:
        s.group(clip_path=clip)
        nb = 48
        rr = random.Random(3)
        for i in range(storeys):
            for b in range(nb):
                r_ = rr.random()
                if r_ < 0.30:
                    xa, xb = fx(b / nb), fx((b + 1) / nb)
                    col = P['glow'] if r_ < 0.10 else (P['glass2'] if r_ < 0.20 else P['skyrefl'])
                    s.poly([(xa, y_on(xa, cx0, zf[i], VPR)), (xb, y_on(xb, cx0, zf[i], VPR)),
                            (xb, y_on(xb, cx0, zf[i + 1], VPR)), (xa, y_on(xa, cx0, zf[i + 1], VPR))], col)
        for j in range(nb + 1):
            x = fx(j / nb)
            k = sc(x)
            pier = j % 4 == 0
            wf = (6.0 if pier else 3.4) * k
            side = (2.2 if pier else 1.4) * k
            yt, yb = ft(x), fb(x) - gf * k
            s.poly([(x - side, yt), (x, yt), (x, yb), (x - side, yb)], P['fin_side'])
            s.poly([(x, yt), (x + wf, ft(x + wf)), (x + wf, fb(x + wf) - gf * k), (x, yb)], P['fin'])
        for i, z in enumerate(zf):
            th = 2.6 if i not in (0, storeys) else 4
            s.poly([(cx0, z), (xr, y_on(xr, cx0, z, VPR)), (xr, y_on(xr, cx0, z, VPR) + th), (cx0, z + th)], P['slab'])
        s.end()
        # parapets on each terrace, their top edge catching the low sun
        bounds = [cx0] + xs + [xr]
        for xa, xb in zip(bounds[:-1], bounds[1:]):
            s.poly([(xa, rt(xa + 0.02)), (xb, rt(xb - 0.02)), (xb, rt(xb - 0.02) + par * sc(xb)), (xa, rt(xa + 0.02) + par)],
                   P['parapet'])
            s.poly([(xa, rt(xa + 0.02)), (xb, rt(xb - 0.02)), (xb, rt(xb - 0.02) + 2), (xa, rt(xa + 0.02) + 2)], P['fin'])
        # ground floor: tall shopfronts; the lobby (her door) the brightest spot
        gt = ybase0 - gf
        s.poly([(cx0, gt), (xr, y_on(xr, cx0, gt, VPR)), (xr, fb(xr)), (cx0, ybase0)], P['glass'])
        nbg = 24
        for b in range(nbg):
            xa, xb = fx((b + 0.12) / nbg), fx((b + 0.88) / nbg)
            col = P['glow2'] if b in (8, 9) else (P['glow'] if b % 3 == 0 else P['glass2'])
            s.poly([(xa, y_on(xa, cx0, gt + 6, VPR)), (xb, y_on(xb, cx0, gt + 6, VPR)), (xb, fb(xb) - 1), (xa, fb(xa) - 1)], col)
        for b in range(nbg + 1):
            x = fx(b / nbg)
            k = sc(x)
            s.poly([(x - 2 * k, y_on(x, cx0, gt, VPR)), (x + 2.6 * k, y_on(x, cx0, gt, VPR)), (x + 2.6 * k, fb(x)), (x - 2 * k, fb(x))], P['fin'])
        # end face (shade): slabs + a few fins
        for z in zf:
            ze = y_on(xend, cx0, z, VPL)
            s.poly([(xend, ze), (cx0, z), (cx0, z + 2), (xend, ze + 2)], P['end_fin'])
        for k in range(1, 4):
            x = cx0 - (cx0 - xend) * k / 4
            s.poly([(x - 1, y_on(x, cx0, rt(cx0), VPL) + par), (x + 1, y_on(x, cx0, rt(cx0), VPL) + par),
                    (x + 1, y_on(x, cx0, ybase0, VPL)), (x - 1, y_on(x, cx0, ybase0, VPL))], P['end_dark'])
    # the roof garden (the hero's living skyline)
    rr = random.Random(11)
    x, i = xend + 6, 0
    while x < xr + 4:
        yt = rt(max(x, cx0)) if x >= cx0 else y_on(x, cx0, rt(cx0), VPL)
        r = rr.uniform(6.5, 11) * (1.45 if rr.random() < 0.15 else 1)
        a = rr.random() < 0.3
        if grey:
            crown(s, x, yt - r * 0.5, r * 1.2, r, P['tree_d'], P['tree_d'], seed=i)
        else:
            crown(s, x, yt - r * 0.5, r * 1.2, r, P['tree_a' if a else 'tree_d'], P['tree_al' if a else 'tree_l'], seed=i)
        x += r * 1.45
        i += 1

    # ---- THE QUAY: full, like Nyhavn's (all small, calm tier); she reads as the one figure that matters ----------
    qedge = 1262
    s.poly([(-10, 1206), (cx0, ybase0), (xr, fb(xr)), (1090, 1190), (1090, qedge), (-10, qedge)], P['quay'])
    lobby_x = fx(8.5 / 24)
    hx, hy = lobby_x + 18, 1226
    if D:
        rr = random.Random(23)
        for k in range(16):   # quiet paving patchwork
            x0 = rr.uniform(-40, 1080)
            y0 = rr.uniform(1200, 1250)
            s.poly([(x0, y0), (x0 + rr.uniform(50, 120), y0), (x0 + rr.uniform(40, 110), y0 + rr.uniform(8, 16)),
                    (x0 - rr.uniform(0, 20), y0 + 12)], P[rr.choice(['quay_l', 'quay_s'])])
        # the lit pool in front of the lobby (her clear space)
        s.ellipse(hx - 4, hy + 6, 62, 14, P['quay_glow'])
    s.rect(-10, qedge - 5, 1100, 5, P['quay_edge'])
    s.rect(-10, qedge, 1100, 8, P['quay_dark'])

    if D:
        # awnings on the shopfronts (cream, two terracotta, one green), dark shade under each
        aw = [(0.02, 0.10, 'awn'), (0.11, 0.20, 'awn_t'), (0.21, 0.31, 'awn'), (0.45, 0.53, 'awn'), (0.54, 0.62, 'awn_g'),
              (0.63, 0.71, 'awn'), (0.72, 0.80, 'awn_t'), (0.81, 0.90, 'awn'), (0.91, 0.99, 'awn')]
        for (u0, u1, col) in aw:
            xa, xb = fx(u0), fx(u1)
            ka, kb = sc(xa), sc(xb)
            ya, yb_ = fb(xa) - 26 * ka, fb(xb) - 26 * kb
            fa, fbb = fb(xa) - 13 * ka, fb(xb) - 13 * kb
            s.poly([(xa, fa + 4), (xb, fbb + 4), (xb, fb(xb)), (xa, fb(xa))], P['under'])
            s.poly([(xa, ya), (xb, yb_), (xb + 3, fbb), (xa - 3, fa)], P[col])
            s.poly([(xa - 3, fa), (xb + 3, fbb), (xb + 3, fbb + 4), (xa - 3, fa + 4)], P[col + 'f' if col != 'awn' else 'awn_f'])
            # cafe tables + seated people under/in front of it
            for t in range(2):
                tx = xa + (xb - xa) * (0.3 + 0.4 * t)
                ty = fb(tx) + 14 + 4 * t
                person_seated(s, tx - 6, ty, 15, P[rr.choice(['p1', 'p2', 'p3', 'p4', 'p6'])], P['pd'])
                s.rect(tx - 0.8, ty - 8, 1.6, 8, P['chair'])
                s.ellipse(tx, ty - 8, 6.5, 2.2, P['table'])
                if rr.random() < 0.6:
                    person_seated(s, tx + 7, ty + 1, 15, P[rr.choice(['p3', 'p5', 'p2'])], P['pd'])
        # the ends of the quay: awnings + tables at the L1 blocks too
        for (xa, xb, base, col) in [(10, 86, 1210, 'awn_t'), (96, 180, 1210, 'awn'), (862, 960, 1196, 'awn'), (968, 1070, 1196, 'awn_g')]:
            s.poly([(xa, base - 9), (xb, base - 9), (xb, base), (xa, base)], P['under'])
            s.poly([(xa, base - 24), (xb, base - 24), (xb + 3, base - 12), (xa - 3, base - 12)], P[col])
            s.poly([(xa - 3, base - 12), (xb + 3, base - 12), (xb + 3, base - 8), (xa - 3, base - 8)], P[col + 'f' if col != 'awn' else 'awn_f'])
            for t in range(2):
                tx = xa + (xb - xa) * (0.3 + 0.4 * t)
                person_seated(s, tx - 6, base + 15, 15, P[rr.choice(['p1', 'p2', 'p6', 'p4'])], P['pd'])
                s.ellipse(tx, base + 7, 6.5, 2.2, P['table'])
        # lamps between the trees
        for lx in [66, 224, 376, 628, 772, 920, 1066]:
            s.rect(lx - 1, 1206, 2, 44, P['lamp'])
            s.rect(lx - 3.5, 1200, 7, 8, P['lamp'])
            s.rect(lx - 2, 1202, 4, 4, P['lamp_glow'])
        # planters with shrubs
        for px in [140, 300, 700, 850, 1000]:
            s.rect(px - 9, 1244, 18, 10, P['planter'])
            crown(s, px, 1242, 10, 7, P['shrub'], P['shrub_l'], seed=px)
        # parked bikes
        for bx in [452, 462, 472]:
            bike(s, bx, 1256, 4.2, P['bike'])
        bike(s, 560, 1254, 4.0, P['bike'])
        # people walking and standing (tiny, soft), none near her
        walkers = [(52, 1240, 22, 'p3', 1), (88, 1236, 21, 'p6', -1), (196, 1242, 22, 'p4', 1), (238, 1234, 20, 'p1', -1),
                   (318, 1244, 22, 'p5', 1), (358, 1236, 21, 'p2', -1), (608, 1240, 22, 'p6', 1), (646, 1234, 20, 'p3', -1),
                   (690, 1246, 23, 'p1', 1), (758, 1236, 21, 'p4', -1), (836, 1244, 22, 'p2', 1), (900, 1232, 20, 'p5', -1),
                   (932, 1244, 22, 'p3', 1), (1004, 1238, 21, 'p6', -1), (1046, 1246, 22, 'p1', 1)]
        for (px, py, ph, col, st) in walkers:
            walker(s, px, py, ph, P[col], P[col], P['pd'], P['pd'], P['pd'], step=st)
        # a cyclist
        bike(s, 720, 1258, 4.4, P['bike'])
        walker(s, 720, 1250, 17, P['p2'], P['p2'], P['pd'], P['pd'], P['pd'], step=0)
    # a row of trees along the quay edge (the posters' tree band), a gap left at the lobby for her
    rt_ = random.Random(77)
    for tx in [30, 104, 178, 268, 340, 412, 592, 664, 736, 808, 884, 956, 1030]:
        ty = 1246
        s.rect(tx - 1.6, ty - 38, 3.2, 38, P['trunk'])
        a = rt_.random() < 0.35
        if grey:
            crown(s, tx, ty - 50, 17, 19, P['tree_d'], P['tree_d'], seed=tx)
        else:
            crown(s, tx, ty - 50, 17, 19, P['tree_a' if a else 'tree_d'], P['tree_al' if a else 'tree_l'], seed=tx)
    # HER: leaving the lit lobby with her box; clear space, value contrast against the glow
    if grey:
        walker(s, hx, hy, 44, P['her'], P['her'], P['her'], P['her'], P['her'])
    else:
        s.ellipse(hx + 1, hy + 0.5, 11, 2.2, P['quay_edge'])
        walker(s, hx, hy, 44, P['her'], P['her_l'], P['her_d'], P['hair'], P['legs'], box=(P['box'], P['box_d']))

    # ---- THE WATER: the basin, open and calm, the sky seen in it ------------------------------------------------
    wy0, wy1 = qedge + 8, 1540
    if grey:
        s.rect(0, wy0, W, wy1 - wy0, P['water1'])
    else:
        gw = s.lingrad([(0, C['water0']), (0.55, C['water1']), (1, C['water2'])], 0, 0, 0, 1)
        s.rect(0, wy0, W, wy1 - wy0, gw)
    wl = qedge + 4   # the waterline the hero mirrors in (compressed: a calm, broken reflection)
    mirror = [(x, wl + (wl - y) * 0.42) for (x, y) in front if y < 1190] 
    mirror = [(cx0, wl + 16)] + mirror + [(xr, wl + 16)]
    s.poly(mirror, P['refl'])
    if not grey:
        for k in range(7):
            yy = wl + 30 + k * 13
            s.rect(cx0 - 10, yy, xr - cx0 + 20, 3 + k * 0.4, P['water1'])
    if D:
        # the hero's reflection: pale fin strokes and warm glints, broken by ripples
        for j in range(0, 49, 2):
            x = fx(j / 48)
            ln = 26 + 10 * math.sin(j * 1.7)
            s.rect(x, wy0 + 30, 2.0 * sc(x), ln * 0.8, P['refl_l'] if j % 4 else P['refl_dark'])
        for j in range(0, 24, 3):
            x = fx((j + 0.5) / 24)
            s.rect(x, wy0 + 46 + (j % 2) * 8, 6, 3, P['refl_glow'])
        s.rect(fx(8.2 / 24), wy0 + 44, 18, 4, P['refl_glow'])
        s.rect(fx(8.4 / 24), wy0 + 56, 12, 3, P['refl_glow'])
        # ripples: thin, closer and shorter far, longer near (perspective)
        rr = random.Random(31)
        y = wy0 + 70
        gap = 9
        while y < wy1 - 10:
            for _ in range(2 if y < 1450 else 3):
                x0 = rr.uniform(-60, 1000)
                ln = rr.uniform(60, 150) * (1 + (y - wy0) / 220)
                s.rect(x0, y, ln, 1.2 + (y - wy0) / 260, P['ripple'] if rr.random() < 0.7 else P['ripple_d'])
            y += gap
            gap *= 1.16

    # moored narrowboats along the far quay (colour as confetti) + Pip hidden on the middle one
    def narrowboat(x0, x1, yb, hullc, cabinc, trimc, roof_items=(), scale=1.0, pip=None):
        hh, ch = 12 * scale, 10 * scale
        s.poly([(x0, yb - hh), (x1, yb - hh), (x1 - 4 * scale, yb), (x0 + 10 * scale, yb)], P[hullc])
        s.rect(x0 + 2, yb - hh - 2 * scale, x1 - x0 - 2, 2.4 * scale, P[trimc])
        s.rect(x0 + 18 * scale, yb - hh - ch, x1 - x0 - 34 * scale, ch, P[cabinc])
        s.rect(x0 + 16 * scale, yb - hh - ch - 2.2 * scale, x1 - x0 - 30 * scale, 2.4 * scale, P['roof_b'])
        if D:
            n = int((x1 - x0 - 40 * scale) / (16 * scale))
            for k in range(n):
                px = x0 + 24 * scale + k * 16 * scale
                s.rect(px, yb - hh - ch + 2.5 * scale, 9 * scale, 5 * scale, P['panel'] if k % 2 else P['win'])
            for (px, ph) in roof_items:
                s.rect(px - 3 * scale, yb - hh - ch - 6 * scale, 6 * scale, 4 * scale, P['pot'])
                crown(s, px, yb - hh - ch - 8 * scale, 5 * scale, 3.6 * scale * ph, P['leaf_pot'], P['shrub_l'], seed=int(px))
            if pip:
                px, py = pip, yb - hh - ch - 2.2 * scale
                s.ellipse(px, py - 5.2, 6.2, 5.2, P['pip_d'])
                s.ellipse(px + 1.2, py - 6.0, 5.0, 4.4, P['pip'])
                s.circle(px + 5.0, py - 10.6, 3.8, P['pip'])
                s.ellipse(px + 2.2, py - 11.0, 2.6, 3.3, P['pip_e'])
                s.poly([(px + 8.2, py - 10.2), (px + 10.2, py - 7.4), (px + 9.4, py - 4.2), (px + 7.6, py - 7.4)], P['pip'])
                s.circle(px + 6.1, py - 11.6, 0.8, P['pip_eye'])
    narrowboat(120, 330, qedge + 30, 'hull', 'cabin', 'trim', roof_items=[(160, 1), (300, 1.2)])
    narrowboat(560, 790, qedge + 31, 'hull2', 'cabin2', 'trim2', roof_items=[(600, 1), (640, 1.2), (742, 1)], pip=684)
    narrowboat(860, 1060, qedge + 30, 'hull3', 'cabin3', 'trim2', roof_items=[(900, 1)])
    if D:
        for (x0, x1, col) in [(130, 326, 'refl_dark'), (570, 786, 'refl_dark'), (870, 1056, 'refl_dark')]:
            s.rect(x0, qedge + 31, x1 - x0, 6, P[col])
    # one narrowboat cruising in the basin (bigger: nearer), its V wake
    narrowboat(540, 860, 1424, 'hull', 'cabin', 'trim', roof_items=[(600, 1.2), (800, 1)], scale=1.6)
    if D:
        walker(s, 838, 1390, 25, P['p3'], P['p3'], P['pd'], P['pd'], P['pd'], step=0)
        s.poly([(864, 1418), (1090, 1446), (1090, 1450), (864, 1421)], P['ripple'])
        s.poly([(864, 1424), (1090, 1478), (1090, 1483), (864, 1427)], P['ripple'])
        s.rect(540, 1425, 320, 6, P['refl_dark'])
        for (dx, dy) in [(250, 1486), (272, 1494), (294, 1482)]:
            s.ellipse(dx, dy, 7, 3.2, P['duck'])
            s.circle(dx + 5, dy - 4, 2.6, P['duck'])

    # ---- THE NEAR FRAME: a darker frame in front of the lighter world, small and calm ------------------------------
    # our bank: steps down to the water (grass treads, stone risers), each band thicker as it nears: calm, darker
    s.rect(0, wy1, W, H - wy1, P['riser'])
    y, k = wy1, 0
    hgt = 26.0
    while y < H:
        s.rect(0, y, W, hgt * 0.30, P['riser'])
        s.rect(0, y + hgt * 0.30, W, hgt * 0.70, P['tread'] if k % 2 == 0 else P['tread2'])
        if D:
            s.rect(0, y + hgt * 0.30, W, 2.0 + hgt * 0.04, P['tread_l'] if k % 2 else P['tread_gl'])
        y += hgt
        hgt *= 1.13
        k += 1
    if D:
        rl = random.Random(61)
        for k in range(22):
            lx, ly = rl.uniform(20, 640), rl.uniform(wy1 + 30, H - 10)
            leaf(s, lx, ly, 9 + (ly - wy1) / 40, rl.uniform(0, 6.28), P['leaf_al'], P['leaf_a'])
        for bx in (470, 548):
            s.rect(bx - 7, wy1 - 18, 14, 20, P['bollard'])
            s.ellipse(bx, wy1 - 18, 9, 3.2, P['bollard'])
    # the shed (Coal Drops Yard's brick, smaller now): roof sweeping up to the right, arched windows, a dark base
    sx0 = 660
    eave = lambda x: 1716 + (1660 - 1716) * (x - sx0) / (1090 - sx0)
    s.poly([(sx0, eave(sx0)), (1090, eave(1090)), (1090, H), (sx0, H)], P['brick_sh'])
    s.poly([(sx0 - 44, eave(sx0) + 26), (sx0, eave(sx0)), (sx0, H), (sx0 - 44, H)], P['brick_d'])
    s.path('M%d,%d Q%d,%d 1090,1590 L1090,%d L%d,%d Z' % (sx0, 1684, 880, 1676, eave(1090), sx0, eave(sx0)), P['slate'])
    s.poly([(sx0 - 44, eave(sx0) + 26), (sx0, 1684), (sx0, eave(sx0)), (sx0 - 44, eave(sx0) + 34)], P['slate_d'])
    if D:
        s.path('M%d,%d Q%d,%d 1090,1590 L1090,1610 Q%d,%d %d,%d Z' % (sx0, 1684, 880, 1676, 880, 1692, sx0, 1698), P['slate_l'])
        for k in range(5):
            wx = sx0 + 26 + k * 82
            wy = eave(wx + 18) + 30
            col = P['win_glow'] if k == 2 else P['win']
            s.rect(wx, wy + 18, 36, 110, col)
            s.ellipse(wx + 18, wy + 18, 18, 17, col)
            s.rect(wx + 16.5, wy + 2, 3, 126, P['brick_d'])
            s.rect(wx - 5, wy + 128, 46, 6, P['brick_l'])
        s.rect(sx0 - 44, H - 46, 500, 46, P['brick_d'])
    # a lamp on the towpath (a thin line object) with its warm lantern
    if D:
        lx0 = 612
        s.rect(lx0 - 3, 1470, 6, 260, P['lamp'])
        s.rect(lx0 - 11, 1452, 22, 20, P['lamp'])
        s.rect(lx0 - 7, 1456, 14, 12, P['lamp_glow'])
        s.poly([(lx0 - 14, 1452), (lx0, 1440), (lx0 + 14, 1452)], P['lamp'])
    # a few leaves at the bottom left (a low shrub), calm
    leaves_bl = [(-10, 1880, 70, -0.9, 0), (10, 1900, 64, -0.5, 1), (30, 1918, 58, -1.25, 0), (-4, 1830, 52, -0.25, 0),
                 (52, 1906, 50, -0.75, 1), (78, 1918, 44, -1.05, 0)]
    for (lx, ly, L, a, au) in leaves_bl:
        leaf(s, lx, ly, L, a, P['leaf_al' if au else 'leaf_l'], P['leaf_a' if au else 'leaf_d'])
    # one branch at the top right, hanging in
    if D:
        s.poly([(1090, 30), (1090, 38), (930, 112), (928, 108)], P['twig'])
        s.poly([(1010, 68), (1013, 70), (968, 176), (965, 174)], P['twig'])
    for (lx, ly, L, a, au) in [(930, 110, 54, 2.2, 1), (952, 100, 48, 1.75, 0), (978, 88, 50, 2.5, 0), (1000, 76, 46, 1.6, 1),
                               (968, 176, 46, 1.9, 0), (984, 140, 42, 2.4, 1), (1040, 56, 44, 1.9, 0), (1060, 46, 40, 2.6, 0)]:
        leaf(s, lx, ly, L, a, P['leaf_al' if au else 'leaf_l'], P['leaf_a' if au else 'leaf_d'])

    # ---- CAPTION: ink on light, in the calm band -------------------------------------------------------------------
    s.text(540, 484, 'She quit Google.', 112, P['ink'])
    return s


if __name__ == '__main__':
    out = sys.argv[1] if len(sys.argv) > 1 else '.'
    stages = sys.argv[2:] or ['values', 'detail', 'final']
    os.makedirs(SCRATCH, exist_ok=True)
    pairs = []
    if 'values' in stages:
        pairs.append((build('values').save(os.path.join(SCRATCH, 'stage_v2_values.svg')), os.path.join(out, 'stage_v2_values.png')))
    if 'detail' in stages or 'final' in stages:
        pairs.append((build('detail').save(os.path.join(SCRATCH, 'stage_v2_detail.svg')), os.path.join(SCRATCH, 'stage_v2_detail.png')))
    render(pairs)
    if 'final' in stages:
        mottle(os.path.join(SCRATCH, 'stage_v2_detail.png'), os.path.join(out, 'still_v2.png'))
    print('ok', stages)
