# Drawing the faces_v2 heads and film-size figures as SVG, in direction C's language: flat two-tone shapes, no
# outlines, the closed-eye lash, the hair as a clean cut. Colours sampled from the FcTest render of the current cast.
import math
from geo import Frame, rpath, poly, lash_pts

SKIN = {
    'her': dict(lit='#DDAF92', shade='#B8856C', deep='#A0705A', ear_in='#C99A7E'),
    'him': dict(lit='#C79671', shade='#A87150', deep='#8F5E41', ear_in='#B5825F', beard='#8C6247'),
}
HAIR = {
    'her': dict(base='#8A4A31', shade='#712F21', sheen='#B4744F', deep='#5E2618'),
    'him': dict(base='#2F2627', shade='#231C1D', sheen='#55474A', deep='#1A1415', fade='#5E4A40'),
}
LASH = {'her': '#743528', 'him': '#3A2522'}

_uid = [0]


def uid(p='c'):
    _uid[0] += 1
    return f"{p}{_uid[0]}"


def ear_shape(e):
    """an ear in head units: a soft D, its back edge rounder, tilted back by rot degrees"""
    cx, cy = e['c']
    h, w, r = e['h'], e['w'], math.radians(e['rot'])
    pts = [(-0.45, -0.42, 0.25), (0.1, -0.5, 0.3), (0.5, -0.25, 0.35), (0.42, 0.2, 0.3), (0.05, 0.5, 0.25),
           (-0.3, 0.42, 0.1), (-0.42, 0.1, 0.2)]
    inner = [(-0.12, -0.24, 0.15), (0.14, -0.26, 0.15), (0.2, -0.06, 0.15), (0.04, 0.12, 0.1), (-0.08, 0.02, 0.08)]

    def tr(q):
        x, y = q[0] * w, q[1] * h
        X = x * math.cos(r) - y * math.sin(r)
        Y = x * math.sin(r) + y * math.cos(r)
        return (cx + X, cy + Y, q[2] * w)

    return [tr(q) for q in pts], [tr(q) for q in inner]


def neck_poly(F, depth=1.25):
    n = F['neck']
    lean = math.radians(n['lean'])
    fx, fy = n['front_top']
    w = n['w']
    # the front line from under the jaw down; the back line from the nape down; parallel, leaning forward by `lean`
    dx = math.tan(lean)
    bot = fy + depth
    return [(fx, fy, 0), (fx + dx * (fy - bot), bot, 0), (fx + w + dx * (fy - bot) + 0.06, bot, 0),
            (fx + w + 0.03, fy - 0.12, 0), (fx + w - 0.02, fy - 0.3, 0), (fx + 0.02, fy - 0.2, 0)]


# ------------------------------------------------------------------ hair (profile), head units
def hair_her_profile(F):
    """A long fall with a side-swept fringe resting on the brow line, tucked behind the ear (the ear shows: 05)."""
    e = F.get('ear')
    ex = e['c'][0] if e else 0.08
    ey = e['c'][1] if e else 0.09
    ff = F['ff']
    eyeY = F.get('eyeY', 0)
    fr_tip_y = eyeY - 0.085
    back = [(ff + 0.1, -0.52, 0.14), (0.15, -0.6, 0.22), (0.5, -0.47, 0.2), (0.66, -0.12, 0.2), (0.66, 0.4, 0.2),
            (0.64, 1.0, 0.25), (0.6, 1.55, 0.06), (0.44, 1.62, 0.05), (0.27, 1.56, 0.04), (0.24, 1.0, 0.2),
            (0.22, 0.45, 0.12), (ex + 0.08, ey + 0.08, 0.05), (ex + 0.07, ey - 0.12, 0.05), (ex - 0.02, ey - 0.15, 0.03),
            (ex - 0.25, fr_tip_y + 0.0, 0.05), (ff + 0.04, fr_tip_y, 0.008), (ff - 0.012, eyeY - 0.2, 0.08),
            (ff - 0.012, -0.33, 0.1)]
    # the shade plane: the back half and the underside of the fall
    shade = [(0.3, -0.7), (0.26, 0.2), (0.32, 1.7), (1.2, 1.7), (1.2, -0.7)]
    # the fringe's own shade under its lifted edge (one crisp shape)
    fringe_shade = [(ff + 0.03, fr_tip_y - 0.005, 0.01), (ex - 0.25, fr_tip_y - 0.005, 0.03), (ex - 0.04, ey - 0.16, 0.02),
                    (ex - 0.12, ey - 0.2, 0.03), (ff + 0.08, fr_tip_y - 0.05, 0.02)]
    sheen = crescent(0.12, -0.12, 0.42, 0.4, 205, 285, 0.06)
    return dict(main=back, shade=shade, sheen=sheen, extra=[])


def hair_him_profile(F):
    """A modern short cut: the top swept up and back from a small lift at the front, the sides and the back faded
    (one mid tone between the hair and the skin), a short sideburn, a clean taper at the nape."""
    e = F.get('ear')
    ex = e['c'][0] if e else 0.1
    ey = e['c'][1] if e else 0.08
    ff = F['ff']
    # the faded sides and back: from the temple over the ear's top to the nape
    main = [(ff + 0.09, -0.3, 0.02), (ff + 0.06, -0.38, 0.04), (0.1, -0.52, 0.12), (0.44, -0.44, 0.14),
            (0.545, -0.16, 0.12), (0.52, 0.06, 0.06), (0.45, 0.17, 0.02), (0.37, 0.12, 0.03),
            (ex + 0.07, ey - 0.07, 0.04), (ex + 0.0, ey - 0.135, 0.03), (ex - 0.07, ey - 0.12, 0.01),
            (ex - 0.085, ey + 0.0, 0.01), (ex - 0.115, ey - 0.0, 0.0), (ex - 0.13, -0.13, 0.04), (ff + 0.17, -0.25, 0.04)]
    # the top: a mass swept back from a lift at the front hairline
    top = [(ff + 0.07, -0.33, 0.015), (ff + 0.0, -0.43, 0.04), (ff + 0.03, -0.53, 0.05), (0.0, -0.6, 0.1),
           (0.3, -0.56, 0.14), (0.5, -0.36, 0.1), (0.42, -0.3, 0.05), (0.2, -0.33, 0.06), (0.0, -0.3, 0.05),
           (ff + 0.2, -0.27, 0.04)]
    shade = [(0.24, -0.8), (0.22, -0.3), (1.2, -0.3), (1.2, -0.8)]
    sheen = crescent(0.05, -0.2, 0.4, 0.34, 218, 275, 0.045)
    return dict(main=main, top=top, shade=shade, sheen=sheen, extra=[], fade=True)


def crescent(cx, cy, rx, ry, a0, a1, th, N=12):
    outer, inner = [], []
    for i in range(N + 1):
        a = math.radians(a0 + (a1 - a0) * i / N)
        w = th * math.sin(math.pi * i / N)
        outer.append((cx + rx * math.cos(a), cy + ry * math.sin(a)))
        inner.append((cx + (rx - w) * math.cos(a), cy + (ry - w) * math.sin(a)))
    return outer + inner[::-1]


# ------------------------------------------------------------------ a profile head
COAT = {'her': dict(lit='#4C3D43', shade='#3A2E33', deep='#2B1F24'), 'him': dict(lit='#9E5A3C', shade='#893C2C', deep='#6E2E22')}


def neck_x(F, y, side):
    n = F['neck']
    dx = math.tan(math.radians(n['lean']))
    fx, fy = n['front_top']
    x = fx + dx * (fy - y)
    return x if side == 'f' else x + n['w']


def garment_profile(F, who):
    yf, yb = 0.86, 0.74
    xf, xb = neck_x(F, yf, 'f'), neck_x(F, yb, 'b')
    man = who == 'him'
    sh = 0.47 if man else 0.4
    pts = [(xf - 0.01, yf, 0.03), (xf - 0.12, yf + 0.25, 0.2), (xf - 0.2, 2.4, 0), (sh + 0.32, 2.4, 0),
           (sh + 0.3, 1.25, 0.25), (sh + 0.12, yb + 0.12, 0.12), (xb + 0.01, yb, 0.02)]
    shade = [(sh - 0.02, yb), (sh + 0.05, 2.5), (1.5, 2.5), (1.5, yb)]
    return pts, shade


def profile_svg(F, who, fr, hair=True, neck_depth=1.25, garment=True):
    S, H, lashc = SKIN[who], HAIR[who], LASH[who]
    C = COAT[who]
    out = []
    cid, hcid, gid = uid('sk'), uid('hr'), uid('gm')
    hd = (hair_her_profile(F) if who == 'her' else hair_him_profile(F)) if hair else None
    out.append(f'<path d="{fr.R(neck_poly(F, neck_depth))}" fill="{S["shade"]}"/>')
    if F.get('adam'):
        n = F['neck']
        ay = n['front_top'][1] + 0.2
        ax = neck_x(F, ay, 'f')
        out.append(f'<path d="{fr.R([(ax + 0.01, ay - 0.07, 0.02), (ax - 0.026, ay - 0.01, 0.02), (ax + 0.01, ay + 0.06, 0.02), (ax + 0.05, ay, 0.02)])}" fill="{S["shade"]}"/>')
    skin = F['skin']
    out.append(f'<clipPath id="{cid}"><path d="{fr.R(skin)}"/></clipPath>')
    out.append(f'<path d="{fr.R(skin)}" fill="{S["lit"]}"/>')
    g = [f'<path d="{fr.poly(F["shade"])}" fill="{S["shade"]}"/>']
    if F.get('beard'):
        g.append(f'<path d="{fr.R(F["beard"])}" fill="{SKIN["him"]["beard"]}"/>')
    g.append(f'<path d="{fr.R(F["wing"])}" fill="{S["shade"]}"/>')
    out.append(f'<g clip-path="url(#{cid})">' + ''.join(g) + '</g>')
    if garment:
        gp, gs = garment_profile(F, who)
        out.append(f'<clipPath id="{gid}"><path d="{fr.R(gp)}"/></clipPath>')
        out.append(f'<path d="{fr.R(gp)}" fill="{C["lit"]}"/>')
        out.append(f'<g clip-path="url(#{gid})"><path d="{fr.poly(gs)}" fill="{C["shade"]}"/></g>')
    if hd is not None and hd.get('fade'):
        out.append(f'<path d="{fr.R(hd["main"])}" fill="{H["fade"]}"/>')
        out.append(f'<clipPath id="{hcid}"><path d="{fr.R(hd["top"])}"/></clipPath>')
        out.append(f'<path d="{fr.R(hd["top"])}" fill="{H["base"]}"/>')
        out.append(f'<g clip-path="url(#{hcid})"><path d="{fr.poly(hd["shade"])}" fill="{H["shade"]}"/>'
                   f'<path d="{fr.poly(hd["sheen"])}" fill="{H["sheen"]}"/></g>')
    elif hd is not None:
        out.append(f'<clipPath id="{hcid}"><path d="{fr.R(hd["main"])}"/></clipPath>')
        out.append(f'<path d="{fr.R(hd["main"])}" fill="{H["base"]}"/>')
        out.append(f'<g clip-path="url(#{hcid})"><path d="{fr.poly(hd["shade"])}" fill="{H["shade"]}"/>'
                   f'<path d="{fr.poly(hd["sheen"])}" fill="{H["sheen"]}"/></g>')
    if F.get('ear'):
        eo, ei = ear_shape(F['ear'])
        out.append(f'<clipPath id="{cid}e"><path d="{fr.R(eo)}"/></clipPath>')
        out.append(f'<path d="{fr.R(eo)}" fill="{S["lit"]}"/>')
        ex, ey = F['ear']['c']
        out.append(f'<g clip-path="url(#{cid}e)"><path d="{fr.poly([(ex + 0.03, ey - 0.3), (ex + 0.3, ey - 0.3), (ex + 0.3, ey + 0.3), (ex + 0.04, ey + 0.3)])}" fill="{S["shade"]}"/></g>')
        out.append(f'<path d="{fr.R(ei)}" fill="{S["ear_in"]}"/>')
    out.append(f'<path d="{fr.R(F["lash"])}" fill="{lashc}"/>')
    return '\n'.join(out)


# ------------------------------------------------------------------ the 3/4 head (yaw -34), after head.ts head34
def q34(who, opt):
    """returns dict(skin, side, nose, lashN, lashF, ear, jaw, chin...) in head units for the option."""
    man = who == 'him'
    k = 1 if man else 0
    yaw = -34
    t = math.sin(math.radians(-yaw))
    cs = math.cos(math.radians(yaw))
    fx = -0.47 * t
    sil = math.sqrt((0.38 * cs) ** 2 + (0.47 * t) ** 2)
    o = dict(dy=0.0, tipY=0.185 + 0.01 * k, nl=0.155 + 0.02 * k, jw=0.27 + 0.04 * k, jy=0.31 + 0.02 * k,
             chinW=0.07 + 0.03 * k, lips=0.0, lipsY=0.0, chin=0.0, chinY=0.0, cheek=0.0, brow=0.0, sock=0.0,
             eyeY=-0.005, lashW=1.0, flick=0.45 if man else 1.0, th=0.017 if man else 0.022, sag=0.022,
             nearJaw=None, tipR=0.012, ear=False, beard=False, bluntChin=0.0)
    o.update(opt)
    tipX = fx - o['nl'] * t - 0.005
    tipY = o['tipY']
    L, LY = o['lips'], o['lipsY']
    c34 = [
        (fx - 0.026 - 0.025 * k - o['chin'], 0.435 + o['chinY'], 0.04 - 0.02 * o['bluntChin']),
        (fx - 0.03 - 0.012 * k - L * 0.5, 0.398 + LY, 0.02),
        (fx - 0.062 + 0.008 * k - L, 0.354 + LY, 0.014),
        (fx - 0.055 - L * 0.5, 0.327 + LY, 0.005),
        (fx - 0.074 + 0.01 * k - L, 0.3 + LY, 0.014),
        (tipX + 0.036, tipY + 0.042, 0.01),
        (tipX, tipY, o['tipR']),
        (tipX + 0.02 + o.get('scoop', 0), tipY - 0.055, 0.006),
        (-sil + 0.025 - o['cheek'] * 0.5, 0.1 + o['dy'] * 0.5, 0.02),
        (-sil + 0.01 - o['cheek'], 0.045 + o['dy'], 0.04),
        (-sil + 0.035 + o['sock'], -0.015 + o['dy'], 0.03),
        (-sil + 0.02 - o['brow'], -0.075 + o['dy'] * 0.6, 0.04),
        (-sil + 0.025, -0.2, 0.12),
        (-sil + 0.12, -0.4, 0.14),
    ]
    ns = 0.94 + 0.06
    jw, jy, chinW = o['jw'], o['jy'], o['chinW']
    near = o['nearJaw'] or [
        (fx + 0.22 + chinW * 0.5, 0.465, 0.05),
        (fx + 0.1, 0.49 + 0.01 * k, 0.05 + 0.02 * k),
        (fx + 0.02 - 0.01 * k, 0.483 + 0.012 * k, 0.03),
    ]
    skin = [(0.02, -0.5, 0.2), (0.33 * ns, -0.42, 0.16), (0.45 * ns, -0.17, 0.18), (0.44 * ns, 0.04, 0.12),
            (0.37 * ns + o['cheek'] * 0.3, 0.2, 0.06), (jw, jy, 0.03 + 0.02 * k)] + near + c34
    x0 = fx + 0.3 * cs + 0.005
    side = [(x0 + 0.06, -0.62), (x0 + 0.03, -0.26), (x0 - 0.01, -0.02), (x0 - 0.015, 0.12), (x0 + 0.03, 0.29),
            (x0 + 0.12, 0.42), (x0 + 0.3, 0.62), (1.2, 0.62), (1.2, -0.62)]
    d = 0.005 * k
    nose = [(fx + 0.03, 0.105 + o['dy'] * 0.7, 0.02), (fx + 0.043, 0.16 + o['dy'] * 0.5, 0.02),
            (fx + 0.062, tipY + 0.005 + d, 0.025), (fx + 0.056, tipY + 0.035 + d, 0.02),
            (fx + 0.02, tipY + 0.042 + d, 0.015), (tipX + 0.03, tipY + 0.034, 0.01), (tipX + 0.012, tipY + 0.022, 0.004),
            (tipX + 0.04, tipY + 0.02, 0.008), (fx + 0.022, tipY + 0.014, 0.015), (fx + 0.035, tipY - 0.01, 0.015),
            (fx + 0.027, 0.13 + o['dy'] * 0.6, 0.015)]
    eN = (fx + 0.14 * cs, o['eyeY'])
    wN = (0.13 * cs + 0.02) * o['lashW']
    eF = (fx - 0.07, o['eyeY'] + 0.005)
    wF = 0.058 * o['lashW']
    lashN = lash_pts(eN[0], eN[1], wN, o['sag'], o['th'], 1, o['flick'], 0.01, o.get('curl', 0))
    lashF = lash_pts(eF[0], eF[1], wF, o['sag'] * 0.64, o['th'] * 0.85, -1, o['flick'] * 0.9, 0.006, o.get('curl', 0) * 0.6)
    res = dict(skin=skin, side=side, nose=nose, lashN=lashN, lashF=lashF, fx=fx, x0=x0, tip=(tipX, tipY), sil=sil, dy=o['dy'])
    if o['ear']:
        res['ear'] = dict(c=(0.33 + 0.02 * k, 0.07 + o['dy'] * 0.5), h=0.23 + 0.02 * k, w=0.075, rot=8)
    if o['beard']:
        res['beard'] = [(0.36, 0.02, 0.03), (0.3, 0.14, 0.06), (fx + 0.13, 0.28, 0.06), (fx + 0.03, tipY + 0.06, 0.03),
                        (fx - 0.2, tipY + 0.06, 0.0), (fx - 0.3, 0.7, 0), (0.6, 0.7, 0), (0.6, 0.0, 0)]
    return res


def hair_her_34(fx, dy=0.0, sil=0.41):
    """the long fall in 3/4: a back mass behind the head (the far curtain behind the far cheek, the fall behind the
    neck) and a cap over the skull with a side-swept fringe at the brow line, the near side tucked behind the ear"""
    back = [(-0.3, -0.56, 0.2), (0.3, -0.62, 0.22), (0.6, -0.3, 0.2), (0.64, 0.4, 0.2), (0.63, 1.0, 0.25),
            (0.57, 1.56, 0.06), (0.3, 1.62, 0.05), (0.0, 1.6, 0.05), (-0.3, 1.56, 0.05), (-0.46, 1.5, 0.05),
            (-0.52, 1.0, 0.2), (-0.53, 0.4, 0.2), (-0.5, -0.2, 0.18)]
    cap = [(-sil + 0.015, -0.06 + dy * 0.6, 0.02), (-sil + 0.08, -0.1 + dy * 0.7, 0.04), (fx + 0.06, -0.085 + dy, 0.006),
           (fx + 0.17, -0.13 + dy * 0.7, 0.05), (0.12, -0.15 + dy * 0.4, 0.06), (0.3, -0.13, 0.05), (0.37, -0.02, 0.04),
           (0.42, 0.2, 0.05), (0.47, 0.3, 0.04), (0.52, 0.1, 0.1), (0.5, -0.3, 0.16), (0.3, -0.58, 0.2),
           (-0.15, -0.6, 0.2), (-0.44, -0.36, 0.14), (-sil - 0.01, -0.15, 0.06)]
    shade = [(0.22, -0.8), (0.2, 0.1), (0.24, 1.7), (1.2, 1.7), (1.2, -0.8)]
    sheen = crescent(0.06, -0.12, 0.44, 0.42, 205, 290, 0.06)
    return dict(back=back, cap=cap, shade=shade, sheen=sheen)


def hair_him_34(fx, sil=0.41):
    cap = [(-sil + 0.035, -0.17, 0.02), (-sil + 0.03, -0.29, 0.05), (fx - 0.03, -0.35, 0.05), (fx + 0.05, -0.42, 0.05),
           (-0.08, -0.55, 0.12), (0.22, -0.56, 0.18), (0.45, -0.43, 0.16), (0.52, -0.15, 0.12), (0.48, 0.1, 0.05),
           (0.43, 0.09, 0.03), (0.405, -0.03, 0.03), (0.31, -0.1, 0.04), (0.22, -0.2, 0.05), (fx + 0.16, -0.27, 0.05),
           (fx + 0.06, -0.26, 0.03), (-sil + 0.1, -0.24, 0.04)]
    top = [(-sil + 0.03, -0.27, 0.03), (fx - 0.05, -0.37, 0.04), (fx + 0.02, -0.5, 0.05), (-0.05, -0.61, 0.12),
           (0.25, -0.6, 0.16), (0.45, -0.45, 0.1), (0.34, -0.36, 0.06), (0.1, -0.33, 0.06), (fx + 0.12, -0.29, 0.04)]
    shade = [(0.2, -0.8), (0.18, -0.3), (1.2, -0.3), (1.2, -0.8)]
    sheen = crescent(0.02, -0.2, 0.42, 0.38, 218, 282, 0.045)
    return dict(back=None, cap=cap, top=top, shade=shade, sheen=sheen, fade=True)


def garment_34(who):
    if who == 'her':
        coat = [(-0.3, 0.82, 0.04), (-0.82, 1.02, 0.2), (-0.92, 2.4, 0), (1.0, 2.4, 0), (0.95, 1.06, 0.2), (0.42, 0.8, 0.05)]
        tee = [(-0.2, 0.86, 0.02), (0.3, 0.84, 0.02), (0.12, 1.5, 0), (0.0, 2.4, 0), (-0.32, 2.4, 0), (-0.3, 1.3, 0)]
        lapel_shade = [(0.3, 0.84), (0.12, 1.5), (0.06, 2.4), (0.3, 2.4), (0.36, 1.4), (0.42, 0.9)]
        side = [(0.55, 0.8), (0.62, 2.5), (1.5, 2.5), (1.5, 0.8)]
        return dict(main=coat, inner=tee, inner2=lapel_shade, side=side)
    top = [(-0.32, 0.82, 0.04), (-0.9, 1.04, 0.22), (-1.0, 2.4, 0), (1.05, 2.4, 0), (1.0, 1.06, 0.22), (0.46, 0.8, 0.05)]
    rib = [(-0.33, 0.81, 0.03), (0.47, 0.79, 0.03), (0.44, 0.88, 0.04), (0.06, 0.95, 0.06), (-0.3, 0.9, 0.04)]
    side = [(0.58, 0.8), (0.66, 2.5), (1.5, 2.5), (1.5, 0.8)]
    return dict(main=top, inner=None, inner2=rib, side=side)


def q34_svg(who, Q, fr, neck_w=0.36, hair=True, garment=True, back=True, only_back=False):
    S, H, lashc = SKIN[who], HAIR[who], LASH[who]
    C = COAT[who]
    out = []
    cid, hcid, gid = uid('qs'), uid('qh'), uid('qg')
    sil = Q.get('sil', 0.41)
    hd = (hair_her_34(Q['fx'], Q.get('dy', 0), sil) if who == 'her' else hair_him_34(Q['fx'], sil)) if hair else None
    if hd is not None and hd['back'] and back:
        out.append(f'<path d="{fr.R(hd["back"])}" fill="{H["shade"]}"/>')
    if only_back:
        return '\n'.join(out)
    nw = neck_w
    out.append(f'<path d="{fr.R([(-0.13 - nw * 0.1, 0.3, 0), (0.1 + nw * 0.6, 0.24, 0), (0.1 + nw * 0.66, 1.2, 0), (-0.13 - nw * 0.22, 1.2, 0)])}" fill="{S["shade"]}"/>')
    if garment:
        G = garment_34(who)
        out.append(f'<clipPath id="{gid}"><path d="{fr.R(G["main"])}"/></clipPath>')
        out.append(f'<path d="{fr.R(G["main"])}" fill="{C["lit"]}"/>')
        g = f'<path d="{fr.poly(G["side"])}" fill="{C["shade"]}"/>'
        if G['inner']:
            g += f'<path d="{fr.R(G["inner"])}" fill="#E9E1D6"/>'
            g += f'<path d="{fr.poly(G["inner2"])}" fill="{C["deep"]}"/>'
        else:
            g += f'<path d="{fr.R(G["inner2"])}" fill="{C["shade"]}"/>'
        out.append(f'<g clip-path="url(#{gid})">{g}</g>')
    out.append(f'<clipPath id="{cid}"><path d="{fr.R(Q["skin"])}"/></clipPath>')
    out.append(f'<path d="{fr.R(Q["skin"])}" fill="{S["lit"]}"/>')
    g = [f'<path d="{fr.poly(Q["side"])}" fill="{S["shade"]}"/>']
    if Q.get('beard'):
        g.append(f'<path d="{fr.R(Q["beard"])}" fill="{SKIN["him"]["beard"]}"/>')
    g.append(f'<path d="{fr.R(Q["nose"])}" fill="{S["shade"]}"/>')
    out.append(f'<g clip-path="url(#{cid})">' + ''.join(g) + '</g>')
    if hd is not None and hd.get('fade'):
        out.append(f'<path d="{fr.R(hd["cap"])}" fill="{H["fade"]}"/>')
        out.append(f'<clipPath id="{hcid}"><path d="{fr.R(hd["top"])}"/></clipPath>')
        out.append(f'<path d="{fr.R(hd["top"])}" fill="{H["base"]}"/>')
        out.append(f'<g clip-path="url(#{hcid})"><path d="{fr.poly(hd["shade"])}" fill="{H["shade"]}"/>'
                   f'<path d="{fr.poly(hd["sheen"])}" fill="{H["sheen"]}"/></g>')
    elif hd is not None:
        out.append(f'<clipPath id="{hcid}"><path d="{fr.R(hd["cap"])}"/></clipPath>')
        out.append(f'<path d="{fr.R(hd["cap"])}" fill="{H["base"]}"/>')
        out.append(f'<g clip-path="url(#{hcid})"><path d="{fr.poly(hd["shade"])}" fill="{H["shade"]}"/>'
                   f'<path d="{fr.poly(hd["sheen"])}" fill="{H["sheen"]}"/></g>')
    if Q.get('ear'):
        eo, ei = ear_shape(Q['ear'])
        out.append(f'<path d="{fr.R(eo)}" fill="{S["shade"]}"/>')
        out.append(f'<path d="{fr.R(ei)}" fill="{S["deep"]}"/>')
    out.append(f'<path d="{fr.R(Q["lashN"])}" fill="{lashc}"/>')
    out.append(f'<path d="{fr.R(Q["lashF"])}" fill="{lashc}"/>')
    return '\n'.join(out)
