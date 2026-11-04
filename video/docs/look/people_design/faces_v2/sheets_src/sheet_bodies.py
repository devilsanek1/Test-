# faces_v2 sheet 2: the bodies. The woman's and the man's silhouettes now (direction C, PEOPLE_DESIGN §5.1 / graphic
# body.ts) and with RECIPE.md's composition, front and side, at the same height, in a plain fitted outfit (two flat
# tones, no outlines). Body units: H = 1000, y down from the crown, x = 0 on the axis (+ = screen right / the back).
from geo import rpath, poly

W = 2400
BG = '#F2EAE2'
PANEL = '#EAE0D6'
INK = '#3B2A26'
SUB = '#6E5A52'
REC = '#1F7A68'
FONT = "Inter, 'Helvetica Neue', Arial, sans-serif"
SKIN = {'her': ('#DDAF92', '#B8856C'), 'him': ('#C79671', '#A87150')}
HAIR = {'her': ('#8A4A31', '#712F21'), 'him': ('#2F2627', '#5E4A40')}
TOP = {'her': ('#E9E1D6', '#D2C6B6'), 'him': ('#A9B6C0', '#8E9CA7')}
TROU = {'her': ('#4C3D43', '#3A2E33'), 'him': ('#33435F', '#26334A')}
SHOE = {'her': '#2B1F24', 'him': '#CFC6BA'}

# the builds (H = 1000): widths are full widths in the front view; depths are full depths in the side view
B = {
    'her_now': dict(sex='f', skull=128, headW=97, neck=46, sh=240, slope=16, chest=200, waist=158, waistY=375, hip=210,
                    thigh=100, knee=60, calf=66, ankle=34, arm=50, elbow=40, wrist=29, hand=98, foot=148,
                    chestD=132, waistD=116, hipD=140),
    'her_new': dict(sex='f', skull=128, headW=97, neck=40, sh=228, slope=19, chest=194, waist=148, waistY=370, hip=214,
                    thigh=98, knee=54, calf=62, ankle=27, arm=44, elbow=34, wrist=24, hand=94, foot=140,
                    chestD=128, waistD=108, hipD=144),
    'him_now': dict(sex='m', skull=127, headW=99, neck=58, sh=272, slope=10, chest=236, waist=184, waistY=390, hip=196,
                    thigh=108, knee=68, calf=74, ankle=38, arm=60, elbow=48, wrist=34, hand=104, foot=156,
                    chestD=148, waistD=128, hipD=136),
    'him_new': dict(sex='m', skull=125, headW=98, neck=62, sh=290, slope=13, chest=252, waist=180, waistY=395, hip=190,
                    thigh=112, knee=70, calf=78, ankle=38, arm=66, elbow=50, wrist=36, hand=108, foot=160,
                    chestD=160, waistD=124, hipD=132),
}


def cr(pts, closed=True, t=0.5):
    """a smooth closed path through pts (Catmull-Rom as cubic Beziers)"""
    n = len(pts)
    d = f"M{pts[0][0]:.1f},{pts[0][1]:.1f}"
    rng = range(n) if closed else range(n - 1)
    for i in rng:
        p0 = pts[(i - 1) % n] if closed or i > 0 else pts[i]
        p1 = pts[i]
        p2 = pts[(i + 1) % n]
        p3 = pts[(i + 2) % n] if closed or i + 2 < n else p2
        c1 = (p1[0] + (p2[0] - p0[0]) * t / 3, p1[1] + (p2[1] - p0[1]) * t / 3)
        c2 = (p2[0] - (p3[0] - p1[0]) * t / 3, p2[1] - (p3[1] - p1[1]) * t / 3)
        d += f"C{c1[0]:.1f},{c1[1]:.1f} {c2[0]:.1f},{c2[1]:.1f} {p2[0]:.1f},{p2[1]:.1f}"
    return d + ('Z' if closed else '')


def text(x, y, s, size=20, weight=400, color=INK, anchor='start'):
    s = s.replace('&', '&amp;')
    return f'<text x="{x}" y="{y}" font-family="{FONT}" font-size="{size}" font-weight="{weight}" fill="{color}" text-anchor="{anchor}">{s}</text>'


def front(b, who, X, Y, s):
    """the front view, the figure's crown at (X, Y), scale s px per unit"""
    T = lambda p: (X + p[0] * s, Y + p[1] * s)
    M = lambda pts: [T(p) for p in pts]
    sk = b['skull']
    chinY = sk
    shY = 1000 - 818 + (0 if b['sex'] == 'f' else 3)
    hw = b['headW'] / 2
    n = b['neck'] / 2
    sh = b['sh'] / 2
    import math
    dy = math.tan(math.radians(b['slope'])) * (sh - n - 18)
    o = []
    skin_l, skin_s = SKIN[who]
    hair_l, hair_s = HAIR[who]
    top_l, top_s = TOP[who]
    tr_l, tr_s = TROU[who]
    # hair behind (her long fall behind the shoulders)
    if who == 'her':
        o.append(f'<path d="{cr(M([(-hw - 8, 40), (0, -8), (hw + 8, 40), (hw + 14, 160), (hw + 22, 330), (0, 345), (-hw - 22, 330), (-hw - 14, 160)]))}" fill="{hair_s}"/>')
    # legs (two), the shoes
    hipY = 495
    crotch = 515 if b['sex'] == 'f' else 520
    kneeY, calfY, ankY = 705, 775, 958
    for side in (-1, 1):
        hx = side * (b['hip'] / 2 - b['thigh'] / 2)
        cx_k, cx_a = side * 34, side * 36
        leg = [(side * b['hip'] / 2, hipY - 10), (side * (b['hip'] / 2 - 4), 600), (cx_k + side * b['knee'] / 2, kneeY),
               (cx_k + side * (b['calf'] / 2 + 3), calfY), (cx_a + side * b['ankle'] / 2, ankY), (cx_a - side * b['ankle'] / 2, ankY),
               (cx_k - side * (b['calf'] / 2 - 8), calfY + 20), (cx_k - side * b['knee'] / 2, kneeY), (side * 8, crotch + 40), (side * 1, crotch)]
        o.append(f'<path d="{cr(M(leg))}" fill="{tr_l if side < 0 else tr_s}"/>')
        foot = b['foot']
        fx = side * 38
        fw = b['ankle'] * 0.62 + 10
        o.append(f'<path d="{cr(M([(fx - fw, ankY - 4), (fx + fw, ankY - 4), (fx + fw + side * 4, 990), (fx + side * 8, 1000), (fx - fw + side * 2, 994)]))}" fill="{SHOE[who]}"/>')
    # the waistband of the trousers over the hips
    wy = b['waistY'] + (6 if b['sex'] == 'f' else 50)
    o.append(f'<path d="{cr(M([(-b["hip"] / 2, hipY - 6), (-b["waist"] / 2 - 2, wy), (b["waist"] / 2 + 2, wy), (b["hip"] / 2, hipY - 6), (b["hip"] / 2 * 0.9, crotch - 10), (0, crotch + 6), (-b["hip"] / 2 * 0.9, crotch - 10)]))}" fill="{tr_l}"/>')
    o.append(f'<path d="{cr(M([(b["waist"] * 0.1, wy), (b["waist"] / 2 + 2, wy), (b["hip"] / 2, hipY - 6), (b["hip"] / 2 * 0.9, crotch - 10), (b["hip"] * 0.1, crotch)]))}" fill="{tr_s}"/>')
    # arms (behind the torso's edge a little)
    for side in (-1, 1):
        ax = side * (sh - b['arm'] / 2 + 4)
        arm = [(side * (sh - 6), shY + dy - 6), (side * (sh + b['arm'] / 2 - 2), shY + dy + 30), (side * (sh + 16 + b['elbow'] / 2), 385),
               (side * (sh + 34 + b['wrist'] / 2), 530), (side * (sh + 34 - b['wrist'] / 2), 532), (side * (sh + 14 - b['elbow'] / 2), 385),
               (side * (sh - b['arm'] / 2 - 4), shY + dy + 60)]
        o.append(f'<path d="{cr(M(arm))}" fill="{skin_l if side < 0 else skin_s}"/>')
        hx0 = side * (sh + 34)
        o.append(f'<path d="{cr(M([(hx0 - b["wrist"] / 2, 528), (hx0 + b["wrist"] / 2, 528), (hx0 + b["wrist"] / 2 + 2 * side, 528 + b["hand"] * 0.6), (hx0 + side * 2, 528 + b["hand"]), (hx0 - b["wrist"] / 2, 528 + b["hand"] * 0.7)]))}" fill="{skin_l if side < 0 else skin_s}"/>')
    # torso: a fitted tee with short sleeves
    hemY = b['waistY'] + 12 if b['sex'] == 'f' else hipY - 18
    hemW = b['waist'] / 2 + 2 if b['sex'] == 'f' else b['hip'] / 2 - 2
    tor = [(-n - 4, shY - 18), (-(sh - 10), shY + dy - 8), (-(sh + 8), shY + dy + 22), (-(sh + 10), shY + dy + 90),
           (-(sh - 4), shY + dy + 96), (-b['chest'] / 2, 265 + 20), (-b['waist'] / 2, b['waistY'] - 6), (-hemW, hemY),
           (hemW, hemY), (b['waist'] / 2, b['waistY'] - 6), (b['chest'] / 2, 285), ((sh - 4), shY + dy + 96),
           ((sh + 10), shY + dy + 90), ((sh + 8), shY + dy + 22), ((sh - 10), shY + dy - 8), (n + 4, shY - 18)]
    o.append(f'<path d="{cr(M(tor))}" fill="{top_l}"/>')
    tor_r = [(0, shY - 12), ((sh - 10), shY + dy - 8), ((sh + 8), shY + dy + 22), ((sh + 10), shY + dy + 90),
             ((sh - 4), shY + dy + 96), (b['chest'] / 2, 285), (b['waist'] / 2, b['waistY'] - 6), (hemW, hemY),
             (hemW * 0.24, hemY), (b['waist'] * 0.18, b['waistY'] - 6), (b['chest'] * 0.2, 285)]
    o.append(f'<path d="{cr(M(tor_r))}" fill="{top_s}" opacity="0.9"/>')
    # neck and head
    o.append(f'<path d="{cr(M([(-n, chinY - 30), (n, chinY - 30), (n + 2, shY - 6), (n + 18, shY + 4), (-n - 18, shY + 4), (-n - 2, shY - 6)]))}" fill="{skin_s}"/>')
    if b['sex'] == 'm':
        # the trapezius: the neck's sides flare into the shoulders
        for side in (-1, 1):
            o.append(f'<path d="{cr(M([(side * (n - 2), shY - 34), (side * (n + 30), shY - 2), (side * (n + 6), shY + 4)]))}" fill="{skin_s}"/>')
    head = [(0, 0), (hw * 0.86, 20), (hw, 62), (hw * 0.8, 102), (hw * 0.36, chinY - 4), (0, chinY), (-hw * 0.36, chinY - 4), (-hw * 0.8, 102), (-hw, 62), (-hw * 0.86, 20)]
    o.append(f'<path d="{cr(M(head))}" fill="{skin_l}"/>')
    o.append(f'<path d="{cr(M([(hw * 0.1, 0), (hw * 0.86, 20), (hw, 62), (hw * 0.8, 102), (hw * 0.36, chinY - 4), (hw * 0.2, chinY - 2), (hw * 0.4, 70)]))}" fill="{skin_s}"/>')
    if who == 'her':
        o.append(f'<path d="{cr(M([(-hw - 6, 60), (-hw * 0.7, -2), (0, -10), (hw * 0.75, -2), (hw + 6, 60), (hw + 8, 150), (hw - 4, 150), (hw * 0.55, 40), (-hw * 0.2, 30), (-hw * 0.7, 48), (-hw + 4, 150), (-hw - 8, 150)]))}" fill="{hair_l}"/>')
    else:
        o.append(f'<path d="{cr(M([(-hw - 2, 48), (-hw * 0.8, -4), (0, -14), (hw * 0.8, -4), (hw + 2, 48), (hw - 6, 40), (hw * 0.4, 26), (-hw * 0.4, 26), (-hw + 6, 40)]))}" fill="{hair_l}"/>')
    return '\n'.join(o)


def side_view(b, who, X, Y, s):
    """the side view facing screen-left (x + = the back)"""
    T = lambda p: (X + p[0] * s, Y + p[1] * s)
    M = lambda pts: [T(p) for p in pts]
    f = b['sex'] == 'f'
    o = []
    skin_l, skin_s = SKIN[who]
    hair_l, hair_s = HAIR[who]
    top_l, top_s = TOP[who]
    tr_l, tr_s = TROU[who]
    cD, wD, hD = b['chestD'], b['waistD'], b['hipD']
    sk = b['skull']
    # legs (one in front of the other, standing), the shoes
    kneeY, ankY = 705, 958
    leg = [(-hD * 0.36, 500), (-b['thigh'] * 0.5, 600), (-b['knee'] * 0.5 + 2, kneeY), (-b['calf'] * 0.36, 790), (-b['ankle'] * 0.5, ankY),
           (b['ankle'] * 0.5, ankY), (b['calf'] * 0.62, 790), (b['knee'] * 0.5, kneeY), (b['thigh'] * 0.52, 600), (hD * 0.56, 520), (hD * 0.5, 470)]
    o.append(f'<path d="{cr(M([(p[0] + 8, p[1]) for p in leg]))}" fill="{tr_s}"/>')
    o.append(f'<path d="{cr(M(leg))}" fill="{tr_l}"/>')
    foot = b['foot']
    o.append(f'<path d="{cr(M([(-foot * 0.74, 996), (-foot * 0.5, 974), (-b["ankle"] * 0.55, ankY - 8), (b["ankle"] * 0.6, ankY - 6), (foot * 0.24, 990), (foot * 0.2, 1000), (-foot * 0.6, 1001)]))}" fill="{SHOE[who]}"/>')
    # hips/trousers top
    o.append(f'<path d="{cr(M([(-wD * 0.46, b["waistY"] + 40), (wD * 0.52, b["waistY"] + 40), (hD * 0.56, 520), (hD * 0.2, 560), (-hD * 0.4, 540), (-hD * 0.44, 470)]))}" fill="{tr_l}"/>')
    # torso: chest front (a gentle curve for her), the back's line
    if f:
        tor = [(-14, 160), (-cD * 0.4, 205), (-cD * 0.5, 262), (-cD * 0.44, 300), (-wD * 0.46, b['waistY']), (-hD * 0.44, 470),
               (hD * 0.5, 470), (wD * 0.5, b['waistY'] - 10), (cD * 0.46, 270), (cD * 0.4, 200), (30, 160)]
    else:
        tor = [(-18, 162), (-cD * 0.42, 210), (-cD * 0.5, 262), (-cD * 0.46, 310), (-wD * 0.48, b['waistY']), (-hD * 0.44, 470),
               (hD * 0.48, 470), (wD * 0.5, b['waistY'] - 10), (cD * 0.48, 270), (cD * 0.44, 205), (34, 160)]
    o.append(f'<path d="{cr(M(tor))}" fill="{top_l}"/>')
    o.append(f'<path d="{cr(M([(cD * 0.1, 175), (cD * 0.42, 200), (cD * 0.46, 270), (wD * 0.5, b["waistY"] - 10), (hD * 0.5, 470), (hD * 0.12, 470), (cD * 0.08, 300)]))}" fill="{top_s}"/>')
    # the arm hanging, in front of the torso
    arm = [(-b['arm'] * 0.5 + 6, 200), (b['arm'] * 0.5 + 6, 200), (b['elbow'] * 0.5 + 10, 385), (b['wrist'] * 0.5 + 4, 530),
           (-b['wrist'] * 0.5 + 4, 532), (-b['elbow'] * 0.5 + 8, 385)]
    o.append(f'<path d="{cr(M(arm))}" fill="{skin_s}"/>')
    o.append(f'<path d="{cr(M([(-b["arm"] * 0.56 + 6, 196), (b["arm"] * 0.56 + 6, 196), (b["arm"] * 0.5 + 8, 290), (-b["arm"] * 0.5 + 6, 292)]))}" fill="{top_l}"/>')
    o.append(f'<path d="{cr(M([(-b["wrist"] * 0.5 + 2, 528), (b["wrist"] * 0.5 + 6, 528), (b["wrist"] * 0.5 + 4, 528 + b["hand"] * 0.7), (2, 528 + b["hand"]), (-b["wrist"] * 0.5, 528 + b["hand"] * 0.6)]))}" fill="{skin_s}"/>')
    # neck and head (a simple profile egg; the face is sheet 1's business)
    nk = b['neck'] * (0.9 if f else 0.95)
    o.append(f'<path d="{cr(M([(-nk * 0.42, sk - 20), (nk * 0.62, sk - 46), (nk * 0.7, 178), (-nk * 0.46, 182)]))}" fill="{skin_s}"/>')
    hw = sk * 0.47
    head = [(4, 0), (hw * 0.9, 18), (hw * 1.04, 60), (hw * 0.86, 100), (hw * 0.3, sk - 18), (-hw * 0.6, sk), (-hw * 0.84, sk - 30),
            (-hw * 0.88, 70), (-hw * 0.8, 28)]
    o.append(f'<path d="{cr(M(head))}" fill="{skin_l}"/>')
    if f:
        o.append(f'<path d="{cr(M([(-hw * 0.84, 40), (-hw * 0.4, -6), (hw * 0.5, -6), (hw * 1.1, 50), (hw * 1.2, 160), (hw * 1.24, 330), (hw * 0.5, 335), (hw * 0.34, 160), (hw * 0.1, 60), (-hw * 0.5, 34)]))}" fill="{hair_l}"/>')
    else:
        o.append(f'<path d="{cr(M([(-hw * 0.84, 30), (-hw * 0.5, -10), (hw * 0.5, -8), (hw * 1.06, 40), (hw * 1.0, 92), (hw * 0.6, 70), (hw * 0.2, 36), (-hw * 0.6, 32)]))}" fill="{hair_l}"/>')
    return '\n'.join(o)


def guides(b, X, Y, s, w=360):
    o = []
    for lab, y, wd in (('shoulders', 1000 - 818 + 14, b['sh']), ('waist', b['waistY'], b['waist']), ('hips', 495, b['hip'])):
        yy = Y + y * s
        o.append(f'<line x1="{X - wd / 2 * s}" y1="{yy}" x2="{X + wd / 2 * s}" y2="{yy}" stroke="{REC}" stroke-width="2" stroke-dasharray="6 5" opacity="0.8"/>')
    return '\n'.join(o)


def main():
    parts = [text(30, 62, 'People: faces with appeal (faces_v2), sheet 2: the bodies', 46, 800),
             text(30, 100, 'Now (direction C, PEOPLE_DESIGN 5.1 / graphic body.ts) beside the recipe (RECIPE.md section 3), front and side, the same height (900 px = H), one plain fitted outfit, two flat tones.', 21, 400, SUB),
             text(30, 128, 'The ratios carry it (F11): her waist : hips 0.75 -> 0.69, shoulders : hips 1.14 -> 1.07; his shoulders : waist 1.48 -> 1.61, a trapezius slope, a thicker neck. Tasteful: no bust or hip exaggeration.', 21, 400, SUB)]
    H = 900
    s = H / 1000
    top = 200
    cols = [('her_now', 'her', 'HER, NOW'), ('her_new', 'her', 'HER, RECIPE'), ('him_now', 'him', 'HIM, NOW'), ('him_new', 'him', 'HIM, RECIPE')]
    pw = 570
    for i, (key, who, lab) in enumerate(cols):
        x0 = 30 + i * (pw + 10)
        rec = key.endswith('new')
        parts.append(f'<rect x="{x0}" y="{top - 20}" width="{pw}" height="{H + 140}" rx="14" fill="{PANEL}"/>')
        if rec:
            parts.append(f'<rect x="{x0 - 4}" y="{top - 24}" width="{pw + 8}" height="{H + 148}" rx="17" fill="none" stroke="{REC}" stroke-width="5"/>')
        b = B[key]
        parts.append(front(b, who, x0 + 180, top + 20, s))
        parts.append(guides(b, x0 + 180, top + 20, s))
        parts.append(side_view(b, who, x0 + 440, top + 20, s))
        parts.append(text(x0 + 16, top + H + 64, lab, 24, 800, REC if rec else INK))
        wh = b['waist'] / b['hip']
        sh = b['sh'] / b['hip'] if b['sex'] == 'f' else b['sh'] / b['waist']
        lab2 = (f"shoulders {b['sh']}, waist {b['waist']}, hips {b['hip']}; waist:hips {wh:.2f}; shoulders:hips {sh:.2f}" if b['sex'] == 'f'
                else f"shoulders {b['sh']}, waist {b['waist']}, hips {b['hip']}; shoulders:waist {sh:.2f}; neck {b['neck']}")
        parts.append(text(x0 + 16, top + H + 92, lab2, 15, 400, SUB))
        lab3 = f"neck {b['neck']} wide; wrist {b['wrist']}, ankle {b['ankle']}; hand {b['hand']}, foot {b['foot']}" if b['sex'] == 'f' else f"wrist {b['wrist']}, ankle {b['ankle']}; hand {b['hand']}, foot {b['foot']}; skull {b['skull']}"
        parts.append(text(x0 + 16, top + H + 112, lab3, 15, 400, SUB))
    # film-size strip (phone check): the four at 200 px
    fy = top + H + 160
    parts.append(f'<rect x="30" y="{fy}" width="{W - 60}" height="300" rx="14" fill="#A8948F"/>')
    parts.append(text(50, fy + 32, 'film size 1:1 (200 px): now, recipe, now, recipe', 18, 600, '#FFFFFF'))
    for i, (key, who, lab) in enumerate(cols):
        b = B[key]
        sx = 0.2
        parts.append(front(b, who, 260 + i * 260, fy + 70, sx))
        parts.append(side_view(b, who, 360 + i * 260, fy + 70, sx))
    parts.append(text(30, fy + 340, 'Look at: does she read feminine and elegant (a waist, sloping shoulders, slim wrists and ankles), he manly (the V, the neck into the shoulders), both tasteful?', 22, 600))
    Ht = fy + 370
    html = (f'<!doctype html><html><head><meta charset="utf-8"></head><body style="margin:0;background:{BG}">'
            f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{Ht}" viewBox="0 0 {W} {Ht}"><rect width="{W}" height="{Ht}" fill="{BG}"/>'
            + '\n'.join(parts) + '</svg></body></html>')
    open('sheet_bodies.html', 'w').write(html)
    print(Ht)


main()
