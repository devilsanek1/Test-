# Film-size figures (~200 px) for the faces_v2 sheets: a simple direction C body (two flat tones, no outlines) with the
# option's head on it, in profile (facing screen-left) and in 3/4. Body units: H = 1000, y down from the crown.
from geo import Frame, rpath, poly
from draw import profile_svg, q34_svg, SKIN, uid

CLOTH = {
    'her': dict(coat='#4C3D43', coatS='#3A2E33', coatD='#2B1F24', tee='#E9E1D6', trou='#E3D6C2', trouS='#CBBDA6', shoe='#2B1F24'),
    'him': dict(coat='#9E5A3C', coatS='#893C2C', coatD='#6E2E22', tee='#9E5A3C', trou='#33435F', trouS='#26334A', shoe='#EDE5D8'),
}


def _R(x0, y0, s, pts):
    return rpath([(x0 + p[0] * s, y0 + p[1] * s, (p[2] if len(p) > 2 else 0) * s) for p in pts])


def _P(x0, y0, s, pts):
    return poly([(x0 + p[0] * s, y0 + p[1] * s) for p in pts])


def figure_profile(who, F, x, ybase, H=200):
    """x = the figure's axis, ybase = the sole's y."""
    s = H / 1000
    top = ybase - H
    C = CLOTH[who]
    S = SKIN[who]
    out = []
    man = who == 'him'
    # the legs (the far leg a touch behind), the shoes
    if man:
        out.append(_R(x, top, s, [(-34, 500, 10), (40, 500, 10), (36, 960, 4), (-14, 962, 4), (-30, 700, 20)]).join(['<path d="', f'" fill="{C["trouS"]}"/>']))
        out.append(_R(x, top, s, [(-40, 495, 10), (26, 495, 10), (14, 962, 4), (-36, 962, 4), (-38, 700, 20)]).join(['<path d="', f'" fill="{C["trou"]}"/>']))
        out.append(_R(x, top, s, [(-66, 966, 8), (-36, 948, 6), (22, 950, 6), (26, 1000, 3), (-70, 1000, 5)]).join(['<path d="', f'" fill="{C["shoe"]}"/>']))
    else:
        out.append(_R(x, top, s, [(-26, 690, 8), (34, 690, 8), (30, 962, 4), (-8, 962, 4)]).join(['<path d="', f'" fill="{C["trouS"]}"/>']))
        out.append(_R(x, top, s, [(-36, 690, 8), (22, 690, 8), (8, 962, 4), (-34, 962, 4)]).join(['<path d="', f'" fill="{C["trou"]}"/>']))
        out.append(_R(x, top, s, [(-64, 990, 6), (-40, 958, 6), (10, 958, 6), (14, 1000, 3), (-66, 1000, 4)]).join(['<path d="', f'" fill="{C["shoe"]}"/>']))
    # the torso garment
    gid = uid('fg')
    if man:
        body = [(-24, 168, 10), (-62, 210, 30), (-64, 330, 30), (-52, 520, 6), (60, 520, 6), (62, 300, 30), (52, 196, 26), (28, 165, 8)]
    else:
        body = [(-20, 170, 8), (-50, 230, 30), (-54, 330, 30), (-44, 430, 30), (-58, 700, 4), (70, 708, 4), (58, 430, 30), (62, 260, 30), (48, 192, 24), (26, 166, 8)]
    out.append(f'<clipPath id="{gid}"><path d="{_R(x, top, s, body)}"/></clipPath>')
    out.append(f'<path d="{_R(x, top, s, body)}" fill="{C["coat"]}"/>')
    out.append(f'<g clip-path="url(#{gid})"><path d="{_P(x, top, s, [(22, 150), (30, 720), (120, 720), (120, 150)])}" fill="{C["coatS"]}"/></g>')
    # the near arm (sleeve + hand)
    if man:
        arm = [(-4, 190, 22), (30, 196, 20), (34, 470, 12), (6, 478, 12)]
        hand = [(6, 470, 10), (32, 470, 10), (30, 560, 12), (12, 566, 10)]
    else:
        arm = [(-6, 196, 20), (26, 200, 18), (30, 520, 10), (4, 526, 10)]
        hand = [(6, 516, 8), (28, 516, 8), (26, 600, 10), (10, 606, 8)]
    out.append(f'<path d="{_R(x, top, s, hand)}" fill="{S["shade"]}"/>')
    out.append(f'<path d="{_R(x, top, s, arm)}" fill="{C["coatS"] if not man else C["coatS"]}"/>')
    # the head (the head frame: skull = 0.128 H, centred 0.064 H below the crown)
    sk = (0.127 if man else 0.128) * H
    fr = Frame(x + 2 * s, top + sk / 2, sk)
    out.append(profile_svg(F, who, fr, hair=True, neck_depth=0.75, garment=False))
    return '\n'.join(out)


def figure_q34(who, Q, x, ybase, H=200):
    s = H / 1000
    top = ybase - H
    C = CLOTH[who]
    S = SKIN[who]
    out = []
    man = who == 'him'
    if man:
        out.append(_R(x, top, s, [(-8, 500, 10), (66, 500, 10), (60, 962, 4), (18, 962, 4)]).join(['<path d="', f'" fill="{C["trouS"]}"/>']))
        out.append(_R(x, top, s, [(-70, 500, 10), (0, 500, 10), (-8, 962, 4), (-56, 962, 4)]).join(['<path d="', f'" fill="{C["trou"]}"/>']))
        out.append(_R(x, top, s, [(-84, 970, 8), (-56, 950, 6), (-4, 950, 6), (-2, 1000, 3), (-86, 1000, 5)]).join(['<path d="', f'" fill="{C["shoe"]}"/>']))
        out.append(_R(x, top, s, [(8, 966, 8), (24, 950, 6), (70, 950, 6), (72, 998, 3), (6, 998, 5)]).join(['<path d="', f'" fill="{C["shoe"]}"/>']))
        body = [(-40, 168, 12), (-104, 200, 36), (-98, 330, 30), (-80, 520, 6), (92, 520, 6), (100, 300, 30), (104, 200, 34), (44, 165, 10)]
    else:
        out.append(_R(x, top, s, [(-6, 690, 8), (52, 690, 8), (46, 962, 4), (12, 962, 4)]).join(['<path d="', f'" fill="{C["trouS"]}"/>']))
        out.append(_R(x, top, s, [(-56, 690, 8), (-2, 690, 8), (-10, 962, 4), (-48, 962, 4)]).join(['<path d="', f'" fill="{C["trou"]}"/>']))
        out.append(_R(x, top, s, [(-74, 990, 6), (-52, 958, 6), (-8, 958, 6), (-6, 1000, 3), (-76, 1000, 4)]).join(['<path d="', f'" fill="{C["shoe"]}"/>']))
        out.append(_R(x, top, s, [(8, 988, 6), (18, 958, 6), (54, 958, 6), (56, 998, 3), (6, 998, 4)]).join(['<path d="', f'" fill="{C["shoe"]}"/>']))
        body = [(-36, 170, 10), (-96, 204, 34), (-90, 330, 30), (-80, 430, 30), (-96, 700, 4), (98, 708, 4), (84, 430, 30), (94, 280, 30), (98, 200, 32), (40, 166, 10)]
    sk = (0.127 if man else 0.128) * H
    fr = Frame(x - 6 * s, top + sk / 2, sk)
    out.insert(0, q34_svg(who, Q, fr, neck_w=0.46 if man else 0.34, garment=False, only_back=True))
    gid = uid('fq')
    out.append(f'<clipPath id="{gid}"><path d="{_R(x, top, s, body)}"/></clipPath>')
    out.append(f'<path d="{_R(x, top, s, body)}" fill="{C["coat"]}"/>')
    g = f'<path d="{_P(x, top, s, [(40, 150), (52, 720), (150, 720), (150, 150)])}" fill="{C["coatS"]}"/>'
    if not man:
        g += f'<path d="{_P(x, top, s, [(-30, 172), (30, 170), (14, 700), (-24, 700)])}" fill="{C["tee"]}"/>'
    out.append(f'<g clip-path="url(#{gid})">{g}</g>')
    # arms
    if man:
        out.append(f'<path d="{_R(x, top, s, [(-112, 205, 24), (-82, 205, 20), (-80, 476, 12), (-108, 480, 12)])}" fill="{C["coatS"]}"/>')
        out.append(f'<path d="{_R(x, top, s, [(-108, 472, 10), (-82, 472, 10), (-86, 560, 12), (-104, 562, 10)])}" fill="{S["lit"]}"/>')
        out.append(f'<path d="{_R(x, top, s, [(84, 205, 24), (112, 210, 20), (108, 476, 12), (82, 472, 12)])}" fill="{C["coatD"]}"/>')
    else:
        out.append(f'<path d="{_R(x, top, s, [(-104, 210, 20), (-78, 210, 18), (-76, 520, 10), (-100, 524, 10)])}" fill="{C["coatS"]}"/>')
        out.append(f'<path d="{_R(x, top, s, [(-98, 516, 8), (-78, 516, 8), (-82, 600, 10), (-96, 604, 8)])}" fill="{S["lit"]}"/>')
        out.append(f'<path d="{_R(x, top, s, [(80, 208, 20), (104, 214, 18), (100, 520, 10), (78, 516, 10)])}" fill="{C["coatD"]}"/>')
    out.append(q34_svg(who, Q, fr, neck_w=0.46 if man else 0.34, garment=False, back=False))
    return '\n'.join(out)
