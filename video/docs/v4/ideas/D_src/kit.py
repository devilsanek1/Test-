"""Imagination D's thumbnail kit: SVG primitives for whole-frame value sketches (1080 x 1920), one warm accent.

Value sketches in the night's cool greys; the ONE warm accent (honey) is the heat and the home. Every frame is one SVG
page rendered by video/scripts/type/render.mjs (Chromium), so blur, turbulence and Gaegu are available.
"""
import math
import random

W, H = 1080, 1920


# ---------- colour ----------
def _lin2srgb(c):
    c = max(0.0, min(1.0, c))
    return 12.92 * c if c <= 0.0031308 else 1.055 * c ** (1 / 2.4) - 0.055


def g(L, tint=0.06):
    """A cool grey at CIE lightness L (0-100), tinted toward blue by `tint`."""
    L = max(0.0, min(100.0, L))
    Y = ((L + 16) / 116) ** 3 if L > 8 else L / 903.3
    r, gg, b = Y * (1 - 1.3 * tint), Y * (1 - 0.35 * tint), Y * (1 + 1.4 * tint)
    return '#%02x%02x%02x' % tuple(int(round(255 * _lin2srgb(v))) for v in (r, gg, b))


HONEY_HI = '#ffe7b4'
HONEY = '#f7c26f'
HONEY_MID = '#e9a24e'
HONEY_DEEP = '#b8753a'
HONEY_DARK = '#6f4626'
PLUM = '#34203d'


# ---------- svg helpers ----------
def f(v):
    return ('%.1f' % v).rstrip('0').rstrip('.')


def pts(p):
    return ' '.join('%s,%s' % (f(x), f(y)) for x, y in p)


def rect(x, y, w, h, fill, **a):
    return '<rect x="%s" y="%s" width="%s" height="%s" fill="%s"%s/>' % (f(x), f(y), f(w), f(h), fill, _a(a))


def poly(p, fill, **a):
    return '<polygon points="%s" fill="%s"%s/>' % (pts(p), fill, _a(a))


def pline(p, stroke, sw, **a):
    return '<polyline points="%s" fill="none" stroke="%s" stroke-width="%s" stroke-linecap="round" stroke-linejoin="round"%s/>' % (
        pts(p), stroke, f(sw), _a(a))


def path(d, fill, **a):
    return '<path d="%s" fill="%s"%s/>' % (d, fill, _a(a))


def circ(cx, cy, r, fill, **a):
    return '<circle cx="%s" cy="%s" r="%s" fill="%s"%s/>' % (f(cx), f(cy), f(r), fill, _a(a))


def ell(cx, cy, rx, ry, fill, **a):
    return '<ellipse cx="%s" cy="%s" rx="%s" ry="%s" fill="%s"%s/>' % (f(cx), f(cy), f(rx), f(ry), fill, _a(a))


def line(x1, y1, x2, y2, stroke, sw, **a):
    return '<line x1="%s" y1="%s" x2="%s" y2="%s" stroke="%s" stroke-width="%s" stroke-linecap="round"%s/>' % (
        f(x1), f(y1), f(x2), f(y2), stroke, f(sw), _a(a))


def grp(body, **a):
    return '<g%s>%s</g>' % (_a(a), body)


def _a(a):
    out = ''
    for k, v in a.items():
        if v is None:
            continue
        k = k.rstrip('_').replace('_', '-')
        out += ' %s="%s"' % (k, v)
    return out


def lin_grad(id_, stops, x1=0, y1=0, x2=0, y2=1, units=None):
    u = ' gradientUnits="userSpaceOnUse"' if units else ''
    s = ''.join('<stop offset="%s" stop-color="%s"%s/>' % (
        f(o), c, (' stop-opacity="%s"' % f(op)) if op is not None else '') for o, c, op in
        [(st + (None,))[:3] for st in stops])
    return '<linearGradient id="%s" x1="%s" y1="%s" x2="%s" y2="%s"%s>%s</linearGradient>' % (
        id_, f(x1), f(y1), f(x2), f(y2), u, s)


def rad_grad(id_, stops, cx=0.5, cy=0.5, r=0.5, units=None):
    u = ' gradientUnits="userSpaceOnUse"' if units else ''
    s = ''.join('<stop offset="%s" stop-color="%s"%s/>' % (
        f(o), c, (' stop-opacity="%s"' % f(op)) if op is not None else '') for o, c, op in
        [(st + (None,))[:3] for st in stops])
    return '<radialGradient id="%s" cx="%s" cy="%s" r="%s"%s>%s</radialGradient>' % (id_, f(cx), f(cy), f(r), u, s)


FILTERS = '''
<filter id="rough" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves="2" seed="3" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="7" xChannelSelector="R" yChannelSelector="G"/></filter>
<filter id="rough2" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="7" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="4" xChannelSelector="R" yChannelSelector="G"/></filter>
<filter id="steam" x="-40%" y="-40%" width="180%" height="180%"><feTurbulence type="fractalNoise" baseFrequency="0.011" numOctaves="3" seed="11" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="46" xChannelSelector="R" yChannelSelector="G" result="d"/><feGaussianBlur in="d" stdDeviation="7"/></filter>
<filter id="steamS" x="-60%" y="-60%" width="220%" height="220%"><feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="2" seed="5" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="18" xChannelSelector="R" yChannelSelector="G" result="d"/><feGaussianBlur in="d" stdDeviation="3"/></filter>
<filter id="b1"><feGaussianBlur stdDeviation="1.2"/></filter>
<filter id="b2"><feGaussianBlur stdDeviation="2.5"/></filter>
<filter id="b4"><feGaussianBlur stdDeviation="4"/></filter>
<filter id="b8" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="8"/></filter>
<filter id="b16" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="16"/></filter>
<filter id="b30" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="30"/></filter>
<filter id="frostf" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves="3" seed="21" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="10" xChannelSelector="R" yChannelSelector="G" result="d"/><feGaussianBlur in="d" stdDeviation="0.8"/></filter>
<filter id="grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="2" result="n"/><feColorMatrix in="n" type="matrix" values="0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0 0.52  0 0 0 0.9 0"/></filter>
<filter id="mottle" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.006" numOctaves="3" seed="9" result="n"/><feColorMatrix in="n" type="matrix" values="0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 1 0"/></filter>
'''


def page(body, defs='', caption=None, band=True, grain=0.07, title=''):
    """Wrap a frame's SVG body in an HTML page: defs, the light caption band and its words, the paper grain."""
    cap = caption_svg(caption) if caption else ''
    bandsvg = band_svg() if band else ''
    return ('<!doctype html><html><head><meta charset="utf-8"><title>%s</title><style>html,body{margin:0;padding:0;background:#000}'
            'svg{display:block}</style></head><body>'
            '<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920" viewBox="0 0 1080 1920">'
            '<defs>%s%s</defs>%s'
            '<rect x="0" y="0" width="1080" height="1920" filter="url(#grain)" opacity="%s" style="mix-blend-mode:overlay"/>'
            '%s%s</svg></body></html>') % (title, FILTERS, defs, body, f(grain), bandsvg, cap)


def band_svg():
    # the caption seat: y 290-600, kept as a light, calm band (the world continues under it, nothing crosses it)
    return ('<rect x="0" y="290" width="1080" height="310" fill="#f4f1ec" opacity="0.66"/>'
            '<rect x="0" y="290" width="1080" height="1.5" fill="#ffffff" opacity="0.5"/>'
            '<rect x="0" y="598.5" width="1080" height="1.5" fill="#ffffff" opacity="0.5"/>')


def caption_svg(cap):
    """cap: list of lines; each line a list of (text, stressed) pieces. Baselines 395/515 (one line: 455), centred."""
    lines = cap['lines']
    size = cap.get('size', 108)
    bl = [455] if len(lines) == 1 else [395, 515]
    out = ''
    for i, ln in enumerate(lines):
        spans = ''
        for txt, st in ln:
            if st:
                spans += '<tspan font-weight="700" fill="%s">%s</tspan>' % (cap.get('stress', '#5a2d1f'), txt)
            else:
                spans += '<tspan>%s</tspan>' % txt
        out += ('<text x="540" y="%d" text-anchor="middle" font-family="Gaegu" font-weight="400" font-size="%d" '
                'fill="%s" style="paint-order:stroke" stroke="#fbf8f2" stroke-width="10" stroke-opacity="0.55">%s</text>') % (
            bl[i], size, PLUM, spans)
    return out


# ---------- the world's pieces ----------
def snow(seed, n, x0=0, y0=0, x1=W, y1=H, rmin=1.6, rmax=4.0, col='#f2f5fa', op=(0.35, 0.85), blur=None, band_half=True):
    rnd = random.Random(seed)
    out = []
    for _ in range(n):
        x, y = rnd.uniform(x0, x1), rnd.uniform(y0, y1)
        r = rnd.uniform(rmin, rmax)
        if band_half and 290 <= y <= 600:
            if rnd.random() < 0.5:
                continue
            r = min(r, 3.0)
        out.append(circ(x, y, r, col, opacity=f(rnd.uniform(*op))))
    body = ''.join(out)
    return grp(body, filter='url(#%s)' % blur if blur else None)


def steam(seed, x, y, w, h, col='#e9ecf2', op=0.55, n=9, root=None, root_op=0.8, flt='steam', lean=0.0):
    """A rising column of vapour: soft blobs from (x, y) at its root up to y - h, widening by w."""
    rnd = random.Random(seed)
    out = []
    for i in range(n):
        t = i / max(1, n - 1)
        cy = y - t * h
        cx = x + lean * t * h + rnd.uniform(-0.18, 0.18) * w * (0.4 + t)
        rx = w * (0.18 + 0.42 * t) * rnd.uniform(0.8, 1.2)
        ry = rx * rnd.uniform(0.55, 0.9)
        o = op * (1 - 0.75 * t) * rnd.uniform(0.8, 1.1)
        out.append(ell(cx, cy, rx, ry, col, opacity=f(max(0.03, o))))
    body = ''.join(out)
    if root:
        body = ell(x, y - h * 0.04, w * 0.22, w * 0.14, root, opacity=f(root_op)) + body
    return grp(body, filter='url(#%s)' % flt)


def kettle(x, y, h, body='#4d5568', lit='#8a93a6', dark='#262c3a', face=1, light=True, steam_seed=None, steam_h=None,
           steam_col='#eef0f4', steam_op=0.6):
    """An electric kettle standing at (x, y) (its base centre), h px tall; face=1 spout right, -1 spout left."""
    s = h / 100.0
    k = face
    X = lambda u: x + k * u * s
    Y = lambda v: y - v * s
    # body: a soft jug, wider at the base
    d = 'M %s %s ' % (f(X(-34)), f(Y(0)))
    d += 'C %s %s %s %s %s %s ' % (f(X(-38)), f(Y(28)), f(X(-30)), f(Y(70)), f(X(-24)), f(Y(84)))
    d += 'L %s %s ' % (f(X(22)), f(Y(84)))
    d += 'C %s %s %s %s %s %s ' % (f(X(28)), f(Y(70)), f(X(36)), f(Y(28)), f(X(32)), f(Y(0)))
    d += 'Z'
    o = path(d, body)
    # lit edge (left/top) and base shadow
    o += path('M %s %s C %s %s %s %s %s %s' % (f(X(-34)), f(Y(0)), f(X(-38)), f(Y(28)), f(X(-30)), f(Y(70)), f(X(-24)), f(Y(84))),
              'none', stroke=lit, stroke_width=f(max(1.5, 5 * s)), stroke_linecap='round')
    o += rect(X(-30) if k > 0 else X(30), Y(10), 62 * s, 10 * s, dark, opacity='0.55', transform=None) if False else ''
    o += ell(x, y, 36 * s, 5 * s, dark, opacity='0.7')
    # lid and knob
    o += path('M %s %s Q %s %s %s %s Z' % (f(X(-24)), f(Y(84)), f(X(-1)), f(Y(97)), f(X(22)), f(Y(84))), body)
    o += ell(X(-1), Y(96), 7 * s, 4.5 * s, dark)
    # spout
    o += path('M %s %s L %s %s L %s %s L %s %s Z' % (f(X(28)), f(Y(58)), f(X(52)), f(Y(80)), f(X(56)), f(Y(76)), f(X(33)), f(Y(40))), body)
    # handle
    o += path('M %s %s C %s %s %s %s %s %s' % (f(X(-26)), f(Y(76)), f(X(-62)), f(Y(78)), f(X(-60)), f(Y(26)), f(X(-34)), f(Y(22))),
              'none', stroke=dark, stroke_width=f(max(2, 9 * s)), stroke_linecap='round')
    # the little warm "on" light
    if light:
        o += circ(X(10), Y(20), max(2.2, 5.5 * s), HONEY)
        o += circ(X(10), Y(20), max(4, 12 * s), HONEY, opacity='0.35', filter='url(#b4)')
    if steam_seed is not None:
        sh = steam_h or 150 * s
        o += steam(steam_seed, X(56), Y(80), 70 * s, sh, col=steam_col, op=steam_op, n=6, flt='steamS', lean=0.05 * k)
    return o


def radiator(x, y, w, h, n=14, warm=0.0, base=None):
    """A cast-iron radiator of n rounded fins. warm: the share of fins already hot, counted from the right (the pipe end),
    in deep honey (the heat's colour on what it reaches, never a glow)."""
    out = []
    fw = w / n
    nw = int(round(n * (1.0 if warm is True else (0.0 if warm is False else warm))))
    out.append(rect(x, y + 8, w, h - 16, g(12), rx='6'))
    for i in range(n):
        hot = i >= n - nw
        # the fin nearest the cold side of the front warms last: a soft step
        c_fin = HONEY_DEEP if hot else (base or g(28))
        c_hi = HONEY_MID if hot else g(42)
        fx = x + i * fw + fw * 0.12
        out.append(rect(fx, y, fw * 0.76, h, c_fin, rx=f(fw * 0.38)))
        out.append(rect(fx + fw * 0.12, y + 10, fw * 0.17, h - 20, c_hi, rx=f(fw * 0.08), opacity='0.8'))
    pc = HONEY_DEEP if nw else g(14)
    out.append(rect(x + w + 4, y + h - 40, 26, 18, pc, rx='6'))
    out.append(rect(x + w + 22, y + h - 40, 16, 60, pc))
    return ''.join(out)


def frost(seed, x0, y0, x1, y1, n=26, col='#f3f6fb', op=0.75, avoid=None, edge_bias=1.0):
    """Frost ferns on glass: branching strokes growing in from the edges and corners of the box."""
    rnd = random.Random(seed)
    out = []

    def fern(x, y, ang, length, depth, width):
        if depth == 0 or length < 6:
            return
        x2 = x + math.cos(ang) * length
        y2 = y + math.sin(ang) * length
        if avoid and avoid(x2, y2):
            return
        out.append(line(x, y, x2, y2, col, max(0.8, width), opacity=f(op * rnd.uniform(0.6, 1.0))))
        steps = int(length / 9)
        for s in range(1, steps):
            t = s / steps
            px, py = x + (x2 - x) * t, y + (y2 - y) * t
            bl = length * 0.32 * (1 - t) * rnd.uniform(0.6, 1.1)
            for side in (-1, 1):
                if rnd.random() < 0.9:
                    a2 = ang + side * rnd.uniform(0.75, 1.05)
                    fern(px, py, a2, bl, depth - 1, width * 0.6)
        fern(x2, y2, ang + rnd.uniform(-0.4, 0.4), length * 0.6, depth - 1, width * 0.8)

    for _ in range(n):
        side = rnd.random()
        if side < 0.35:   # bottom edge, growing up
            x, y, ang = rnd.uniform(x0, x1), y1, -math.pi / 2 + rnd.uniform(-0.7, 0.7)
        elif side < 0.6:  # left edge
            x, y, ang = x0, rnd.uniform((y0 + y1) / 2, y1), rnd.uniform(-0.6, 0.4)
        elif side < 0.85:  # right edge
            x, y, ang = x1, rnd.uniform((y0 + y1) / 2, y1), math.pi + rnd.uniform(-0.4, 0.6)
        else:             # corners
            x, y = (x0, y1) if rnd.random() < 0.5 else (x1, y1)
            ang = -math.pi / 4 if x == x0 else -3 * math.pi / 4
        fern(x, y, ang, rnd.uniform(60, 150) * edge_bias, 4, 2.6)
    return grp(''.join(out), filter='url(#frostf)')


def domes(x, y, s=1.0, col='#1a1f2c', snowcol=None):
    """Uspenski on its rock, as a far silhouette: a long nave with stepped gables, a central drum with the big onion dome,
    four small onions on turrets (x: centre, y: base)."""
    o = []
    S = lambda v: v * s

    def onion(cx, by, r, hgt):
        d = 'M %s %s C %s %s %s %s %s %s C %s %s %s %s %s %s Z' % (
            f(cx - r), f(by), f(cx - r * 1.4), f(by - hgt * 0.42), f(cx - r * 0.25), f(by - hgt * 0.72), f(cx), f(by - hgt),
            f(cx + r * 0.25), f(by - hgt * 0.72), f(cx + r * 1.4), f(by - hgt * 0.42), f(cx + r), f(by))
        return path(d, col) + line(cx, by - hgt, cx, by - hgt - r * 0.8, col, max(1.2, r * 0.1))
    o.append(path('M %s %s C %s %s %s %s %s %s L %s %s C %s %s %s %s %s %s Z' % (
        f(x - S(190)), f(y), f(x - S(160)), f(y - S(40)), f(x - S(110)), f(y - S(52)), f(x - S(60)), f(y - S(56)),
        f(x + S(80)), f(y - S(54)), f(x + S(140)), f(y - S(46)), f(x + S(170)), f(y - S(20)), f(x + S(200)), f(y)), col))
    o.append(rect(x - S(110), y - S(150), S(220), S(100), col))
    for gx in (-110, 110):
        o.append(poly([(x + S(gx) - S(28), y - S(150)), (x + S(gx) - S(28), y - S(178)), (x + S(gx) - S(14), y - S(178)),
                       (x + S(gx) - S(14), y - S(192)), (x + S(gx) + S(14), y - S(192)), (x + S(gx) + S(14), y - S(178)),
                       (x + S(gx) + S(28), y - S(178)), (x + S(gx) + S(28), y - S(150))], col))
    o.append(poly([(x - S(96), y - S(150)), (x, y - S(196)), (x + S(96), y - S(150))], col))
    o.append(rect(x - S(26), y - S(250), S(52), S(70), col))
    o.append(onion(x, y - S(248), S(30), S(74)))
    for dx, dy, r, hh in ((-62, -196, 13, 38), (62, -196, 13, 38), (-40, -218, 11, 32), (40, -218, 11, 32)):
        o.append(rect(x + S(dx) - S(r * 0.7), y + S(dy), S(r * 1.4), S(34), col))
        o.append(onion(x + S(dx), y + S(dy) + S(2), S(r), S(hh)))
    out = ''.join(o)
    if snowcol:
        out += grp(poly([(x - S(96), y - S(150)), (x, y - S(196)), (x + S(96), y - S(150)), (x + S(86), y - S(148)),
                         (x, y - S(190)), (x - S(86), y - S(148))], snowcol), opacity='0.75')
    return out


def window_grid(x, y, w, h, cols, rows, gapx, gapy, seed, lit_p=0.35, lit_cols=(HONEY_MID, HONEY), dark=None, warm=True,
                cool='#8e98ae', cool_p=0.0, size_jit=0.0):
    rnd = random.Random(seed)
    cw = (w - gapx * (cols + 1)) / cols
    ch = (h - gapy * (rows + 1)) / rows
    out = []
    for r in range(rows):
        for c in range(cols):
            wx = x + gapx + c * (cw + gapx)
            wy = y + gapy + r * (ch + gapy)
            jw = cw * (1 + rnd.uniform(-size_jit, size_jit))
            p = rnd.random()
            if warm and p < lit_p:
                col = rnd.choice(lit_cols)
            elif p < lit_p + cool_p:
                col = cool
            else:
                col = dark or g(14)
            out.append(rect(wx, wy, jw, ch, col))
    return ''.join(out)


def person(j, sweater='#2a3040', skin='#8b7268', hair='#1e1a22', legs='#252a36', socks='#c9c3b8', rim=None, rimw=3,
           arm_w=34, leg_w=30, head_r=34, back_arm=True, fringe=True, face_dir=1, mug=None, phone=None, scale=1.0):
    """A capsule figure from joints (absolute px). j keys: head, neck, sh_f, sh_b, el_f, el_b, ha_f, ha_b, hip_f, hip_b,
    kn_f, kn_b, ft_f, ft_b. Drawn back limbs first. face_dir: +1 looking right, -1 left (for the hair's fall)."""
    s = scale
    o = []
    A = lambda k: j[k]
    # back leg
    if 'kn_b' in j:
        o.append(pline([A('hip_b'), A('kn_b'), A('ft_b')], legs, leg_w * s))
        o.append(circ(*A('ft_b'), leg_w * 0.62 * s, socks))
    # back arm
    if back_arm and 'el_b' in j:
        o.append(pline([A('sh_b'), A('el_b'), A('ha_b')], sweater, arm_w * s))
        o.append(circ(*A('ha_b'), arm_w * 0.36 * s, skin))
    # torso: shoulders to hips, chunky knit
    sb, sf, hb, hf = A('sh_b'), A('sh_f'), A('hip_b'), A('hip_f')
    o.append(poly([sb, sf, hf, hb], sweater, stroke=sweater, stroke_width=f(arm_w * 0.9 * s), stroke_linejoin='round'))
    # front leg
    if 'kn_f' in j:
        o.append(pline([A('hip_f'), A('kn_f'), A('ft_f')], legs, leg_w * s))
        o.append(circ(*A('ft_f'), leg_w * 0.62 * s, socks))
    # neck and head
    hx, hy = A('head')
    nx, ny = A('neck')
    o.append(line(nx, ny, hx, hy + head_r * 0.6 * s, skin, head_r * 0.62 * s))
    o.append(ell(hx, hy, head_r * 0.86 * s, head_r * s, skin))
    # hair: a stylish bob that falls past the jaw, a soft fringe
    r = head_r * s
    k = face_dir
    d = 'M %s %s ' % (f(hx - k * r * 1.02), f(hy + r * 0.95))
    d += 'C %s %s %s %s %s %s ' % (f(hx - k * r * 1.25), f(hy - r * 0.2), f(hx - k * r * 0.9), f(hy - r * 1.25), f(hx + k * r * 0.05), f(hy - r * 1.18))
    d += 'C %s %s %s %s %s %s ' % (f(hx + k * r * 0.75), f(hy - r * 1.12), f(hx + k * r * 1.02), f(hy - r * 0.55), f(hx + k * r * 0.92), f(hy - r * 0.05))
    if fringe:
        d += 'C %s %s %s %s %s %s ' % (f(hx + k * r * 0.7), f(hy - r * 0.45), f(hx + k * r * 0.3), f(hy - r * 0.6), f(hx + k * r * 0.05), f(hy - r * 0.35))
        d += 'C %s %s %s %s %s %s ' % (f(hx - k * r * 0.2), f(hy + r * 0.1), f(hx - k * r * 0.35), f(hy + r * 0.7), f(hx - k * r * 0.55), f(hy + r * 1.05))
    else:
        d += 'C %s %s %s %s %s %s ' % (f(hx + k * r * 0.6), f(hy + r * 0.4), f(hx - k * r * 0.2), f(hy + r * 0.9), f(hx - k * r * 0.55), f(hy + r * 1.05))
    d += 'Z'
    o.append(path(d, hair))
    # front arm
    if 'el_f' in j:
        o.append(pline([A('sh_f'), A('el_f'), A('ha_f')], sweater, arm_w * s))
        o.append(circ(*A('ha_f'), arm_w * 0.36 * s, skin))
    if mug:
        mx, my, mh = mug
        o.append(rect(mx - mh * 0.38, my - mh, mh * 0.76, mh, g(18), rx=f(mh * 0.12)))
        o.append(path('M %s %s C %s %s %s %s %s %s' % (f(mx + mh * 0.36), f(my - mh * 0.8), f(mx + mh * 0.78), f(my - mh * 0.78),
                                                     f(mx + mh * 0.78), f(my - mh * 0.25), f(mx + mh * 0.36), f(my - mh * 0.28)),
                      'none', stroke=g(18), stroke_width=f(mh * 0.14)))
    if phone:
        px, py, pw, ph, ang = phone
        o.append('<g transform="rotate(%s %s %s)">' % (f(ang), f(px), f(py)) + rect(px - pw / 2, py - ph / 2, pw, ph, g(8), rx=f(pw * 0.14)) +
                 rect(px - pw / 2 + 3, py - ph / 2 + 4, pw - 6, ph - 8, '#cfe0ec', rx=f(pw * 0.1)) + '</g>')
    return ''.join(o)


def chat_screen(px, py, pw, ph, ang=0, dots=True, bubble=True, warm_bubble=False):
    """A phone seen near-on with a chat: a bubble and the three typing dots."""
    o = '<g transform="rotate(%s %s %s)">' % (f(ang), f(px), f(py))
    o += rect(px - pw / 2 - 5, py - ph / 2 - 5, pw + 10, ph + 10, g(6), rx=f(pw * 0.16))
    o += rect(px - pw / 2, py - ph / 2, pw, ph, '#dfe9f1', rx=f(pw * 0.12))
    if bubble:
        o += rect(px - pw * 0.38, py - ph * 0.36, pw * 0.56, ph * 0.16, '#9fb0c2', rx=f(ph * 0.06))
        o += rect(px - pw * 0.02, py - ph * 0.12, pw * 0.4, ph * 0.13, HONEY if warm_bubble else '#7f93a8', rx=f(ph * 0.06))
    if dots:
        for i in range(3):
            o += circ(px - pw * 0.22 + i * pw * 0.13, py + ph * 0.2, pw * 0.05, '#55657a')
    o += '</g>'
    return o


# ---------- her: the one "you", drawn per pose (rounded shapes, two tones, no outlines, seen from behind or in profile)
def _g(body, tx, ty, s, rot=0):
    return '<g transform="translate(%s %s) scale(%s)%s">%s</g>' % (f(tx), f(ty), f(s), (' rotate(%s)' % f(rot)) if rot else '', body)


def head_bun_back(rim=None, hair=None, skin=None, tilt_rim=True):
    """The back of her head: a messy high bun (her signature, readable in silhouette), a few loose strands, the nape.
    Local coords: the nape at (0, 0); head ~100 px tall."""
    hair = hair or g(9); skin = skin or g(34); rim = rim or g(52)
    o = []
    o.append(ell(-47, -44, 8, 14, skin) + ell(47, -44, 8, 14, skin))
    o.append(path('M -13 -6 C -15 8 -15 22 -17 32 L 17 32 C 15 22 15 8 13 -6 Z', skin))
    o.append(path('M -48 -34 C -58 -84 -32 -110 0 -110 C 32 -110 58 -84 48 -34 C 42 -14 24 -4 0 -4 C -24 -4 -42 -14 -48 -34 Z', hair))
    # the bun on top, a hair tie, loose loops
    o.append(path('M -30 -112 C -40 -140 -22 -166 4 -166 C 32 -166 44 -140 32 -114 C 22 -100 -18 -100 -30 -112 Z', hair))
    o.append(path('M -22 -128 C -10 -150 18 -152 26 -132 M -14 -142 C 0 -158 22 -150 22 -140', 'none', stroke=g(20), stroke_width='4', opacity='0.9'))
    o.append(ell(0, -108, 26, 7, g(20)))
    o.append(path('M -34 -96 C -46 -84 -50 -66 -44 -50 M 36 -94 C 46 -80 48 -64 42 -52 M -20 -10 C -26 4 -22 14 -28 24', 'none',
                  stroke=hair, stroke_width='3.5', stroke_linecap='round'))
    o.append(path('M -46 -50 C -54 -86 -28 -108 0 -110 C 10 -110 18 -108 24 -104', 'none', stroke=rim, stroke_width='7',
                  stroke_linecap='round', opacity='0.75'))
    o.append(path('M -28 -132 C -30 -152 -12 -166 6 -166', 'none', stroke=rim, stroke_width='6', stroke_linecap='round', opacity='0.75'))
    return ''.join(o)


def her_seated_back(cx, cy, s=1.0, sweater=None, hair=None, skin=None, rim=None, chair=None, phone=True,
                    warm_rim=None, head_rot=-14, chair_lit=None, throw=None, warm_bubble=False):
    """Seated in a low armchair, seen from behind; head turned up toward the window; her right hand raised a little
    with the phone, its chat glowing at us over her shoulder. (cx, cy) = the nape; s = 1: head ~100 px."""
    sweater = sweater or g(21); hair = hair or g(9); skin = skin or g(34); rim = rim or g(52); chair = chair or g(14)
    chair_lit = chair_lit or g(21); throw = throw or g(25)
    o = []
    # the sweater: big soft shoulders, knit ribs
    o.append(path('M -160 74 C -160 38 -100 20 -44 26 C -20 36 20 36 44 26 C 100 20 160 38 160 74 C 172 130 174 230 168 340 '
                  'L -164 340 C -172 230 -172 130 -160 74 Z', sweater))
    o.append(path('M -160 74 C -160 38 -100 20 -44 26 M 44 26 C 100 20 160 38 160 74', 'none', stroke=rim, stroke_width='7',
                  stroke_linecap='round', opacity='0.8'))
    for xx in (-100, -48, 4, 56, 108):
        o.append(path('M %d 74 C %d 150 %d 240 %d 330' % (xx, xx - 5, xx + 5, xx), 'none', stroke=g(25), stroke_width='8', opacity='0.5'))
    o.append(path('M -44 26 C -30 42 30 42 44 26 C 32 16 -32 16 -44 26 Z', g(27)))
    if warm_rim:
        o.append(path('M 160 74 C 172 130 174 230 168 340', 'none', stroke=warm_rim, stroke_width='8', opacity='0.8'))
    # the right arm raised: the phone over her shoulder, its chat to us
    if phone:
        o.append(path('M 128 54 C 176 70 206 130 206 180 C 206 204 196 214 180 212 C 172 170 156 120 116 92 Z', sweater))
        o.append(path('M 182 210 C 196 176 210 130 220 96 L 244 104 C 236 140 222 186 204 220 Z', sweater))
        o.append(circ(236, 66, 64, '#cfe0ec', opacity='0.2', filter='url(#b16)'))
        o.append('<g transform="rotate(14 236 64)">' + rect(212, 18, 50, 92, g(6), rx='9') + rect(216, 23, 42, 82, '#d9e6ef', rx='7') +
                 rect(220, 31, 27, 11, '#93a7bb', rx='5') + rect(229, 49, 25, 11, (HONEY if warm_bubble else '#7d92a8'), rx='5') +
                 circ(226, 82, 3.4, '#56677c') + circ(235, 82, 3.4, '#56677c') + circ(244, 82, 3.4, '#56677c') + '</g>')
        o.append(ell(232, 104, 17, 14, skin))
    # the head
    o.append('<g transform="rotate(%s 0 0)">%s</g>' % (f(head_rot), head_bun_back(rim=rim, hair=hair, skin=skin)))
    # the armchair's back in front of her lower back, a knit throw over it
    o.append(path('M -236 196 C -236 156 -184 146 -124 154 L 124 154 C 192 146 240 162 240 202 L 250 600 L -244 600 Z', chair))
    o.append(path('M -236 196 C -236 156 -184 146 -124 154 L 124 154 C 192 146 240 162 240 202', 'none', stroke=chair_lit,
                  stroke_width='8', stroke_linecap='round'))
    o.append(path('M -200 160 C -150 150 -90 152 -40 160 L -30 300 C -60 320 -130 322 -190 300 Z', throw))
    for k in range(6):
        o.append(line(-186 + k * 30, 300 + (k % 2) * 6, -186 + k * 30, 326 + (k % 2) * 6, throw, 5))
    return _g(''.join(o), cx, cy, s)


def her_profile_sitting(cx, cy, s=1.0, sip=False, sweater=None, hair=None, skin=None, legs=None, socks='#e3d8c8',
                        mug_col=None, rim=None, tea=True, flip=False, bun=True, tag=True):
    """Sitting on the edge of a table, in profile facing right, a mug in both hands (at her chest, or at her lips
    when she sips: eyes closed). (cx, cy) = where she sits; s = 1 for a head ~95 px tall."""
    sweater = sweater or g(26); hair = hair or g(10); skin = skin or g(52); legs = legs or g(18)
    mug_col = mug_col or g(16); rim = rim or g(66)
    o = []
    # legs over the table edge, wool socks
    o.append(path('M -30 -24 C 20 -30 90 -22 122 -12 C 136 -8 138 8 128 16 C 100 20 30 18 -20 16 Z', legs))
    o.append(path('M 104 -8 C 120 30 122 100 118 160 L 94 162 C 96 110 92 50 84 10 Z', legs))
    o.append(path('M 92 152 C 92 176 104 190 134 190 C 146 190 148 176 140 170 C 130 164 124 160 120 150 Z', socks))
    # the sweater: an oversized knit, rolled collar
    o.append(path('M -54 -250 C -36 -272 30 -274 46 -250 C 66 -200 70 -120 62 -40 C 60 -10 40 6 0 6 C -40 6 -64 -6 -66 -40 '
                  'C -72 -120 -70 -200 -54 -250 Z', sweater))
    o.append(path('M -54 -250 C -70 -200 -72 -120 -66 -40', 'none', stroke=rim, stroke_width='6', opacity='0.5'))
    o.append(ell(-2, -258, 36, 13, g(32)))
    # neck and head (profile to the right)
    o.append(path('M -10 -290 L 12 -290 L 14 -258 L -12 -258 Z', skin))
    o.append(path('M -36 -352 C -36 -392 30 -398 38 -358 C 42 -348 44 -340 46 -336 L 55 -321 C 57 -317 51 -314 47 -314 '
                  'L 48 -307 C 49 -303 46 -301 44 -300 C 45 -294 41 -288 33 -285 C 19 -281 3 -283 -8 -287 C -30 -293 -38 -320 -36 -352 Z', skin))
    # the bob, a soft fringe; eyes open looking ahead, or the closed lash for the sip
    o.append(path('M -42 -334 C -48 -392 18 -410 42 -366 C 30 -366 16 -362 8 -352 C 2 -332 0 -312 -4 -292 C -18 -284 -38 -290 -46 -302 '
                  'C -50 -316 -46 -328 -42 -334 Z', hair))
    o.append(path('M 6 -354 C 18 -368 36 -366 44 -352 L 40 -346 C 30 -352 18 -352 6 -344 Z', hair))
    if sip:
        o.append(path('M 26 -334 C 30 -330 36 -330 40 -334', 'none', stroke=g(14), stroke_width='2.5', stroke_linecap='round'))
    else:
        o.append(ell(34, -335, 3.2, 4, g(10)))
    # arms and the mug
    if sip:
        o.append(path('M 30 -246 C 62 -224 78 -196 76 -170 C 74 -150 60 -140 46 -146 C 52 -170 50 -196 22 -220 Z', sweater))
        o.append(path('M 60 -168 C 70 -200 70 -240 60 -282 L 76 -290 C 90 -250 92 -200 80 -160 Z', sweater))
        mx, my = 66, -300
        o.append('<g transform="rotate(-28 %d %d)">' % (mx, my) + rect(mx - 20, my - 30, 40, 46, mug_col, rx='6') +
                 (rect(mx - 17, my - 30, 34, 6, HONEY_DEEP) if tea else '') + '</g>')
        o.append(ell(66, -284, 13, 10, skin))
        o.append(line(54, -318, 50, -276, g(80), 1.5) + rect(46, -278, 9, 11, g(84)))
    else:
        o.append(path('M 30 -246 C 62 -224 78 -196 76 -170 C 74 -150 60 -140 46 -146 C 52 -170 50 -196 22 -220 Z', sweater))
        o.append(path('M 58 -164 C 76 -178 92 -190 104 -196 L 110 -180 C 96 -170 80 -160 66 -150 Z', sweater))
        mx, my = 116, -196
        o.append(rect(mx - 20, my - 34, 40, 46, mug_col, rx='6') + path('M %d %d C %d %d %d %d %d %d' % (
            mx + 18, my - 24, mx + 34, my - 24, mx + 34, my, mx + 18, my), 'none', stroke=mug_col, stroke_width='6'))
        o.append(ell(104, -184, 13, 10, skin))
        if tea:
            o.append(steam(77, mx, my - 36, 22, 60, col=HONEY_HI, op=0.6, n=4, flt='steamS'))
        if tag:
            o.append(line(mx - 12, my - 34, mx - 16, my - 4, g(80), 1.5) + rect(mx - 21, my - 6, 10, 12, g(86)))
    if bun:
        o.append(path('M -40 -380 C -52 -404 -36 -428 -12 -426 C 12 -424 18 -400 4 -384 C -8 -374 -30 -372 -40 -380 Z', hair))
        o.append(path('M -34 -396 C -26 -414 -6 -416 2 -402', 'none', stroke=g(22), stroke_width='3.5'))
    body = ''.join(o)
    if flip:
        body = '<g transform="scale(-1 1)">%s</g>' % body
    return _g(body, cx, cy, s)


def her_reaching_out(cx, cy, s=1.0, sweater=None, hair=None, skin=None, legs=None, rim=None):
    """Leaning out of the open window, seen from behind: her left hand on the frame, her right arm stretched far out and up
    toward a plume on the horizon, fingers spread. (cx, cy) = her hips at the sill."""
    sweater = sweater or g(18); hair = hair or g(8); skin = skin or g(40); legs = legs or g(14); rim = rim or g(52)
    o = []
    o.append(path('M -54 0 C -60 90 -62 220 -58 330 L -16 330 L -6 70 L 6 70 L 16 330 L 58 330 C 62 220 60 90 54 0 Z', legs))
    o.append(ell(-36, 336, 26, 10, g(30)) + ell(36, 336, 26, 10, g(30)))
    # left arm to the window frame
    o.append(path('M -70 -136 C -120 -120 -170 -110 -214 -150 L -200 -172 C -160 -142 -116 -150 -64 -168 Z', sweater))
    o.append(ell(-214, -164, 15, 18, skin))
    # the back, leaning forward and a little right
    o.append(path('M -82 -140 C -78 -184 76 -196 96 -152 C 100 -96 76 -30 60 6 L -60 6 C -78 -30 -88 -90 -82 -140 Z', sweater))
    o.append(path('M -82 -140 C -78 -184 76 -196 96 -152', 'none', stroke=rim, stroke_width='6', opacity='0.75'))
    for xx in (-46, 0, 46):
        o.append(path('M %d -150 C %d -100 %d -40 %d 0' % (xx, xx - 4, xx + 4, xx), 'none', stroke=g(23), stroke_width='7', opacity='0.5'))
    # right arm: far out and up toward the plume, fingers spread
    o.append(path('M 84 -170 C 160 -214 250 -262 340 -318 L 356 -296 C 270 -238 180 -184 100 -134 Z', sweater))
    o.append(ell(362, -318, 18, 14, skin))
    for k in range(4):
        ang = -1.05 + k * 0.32
        o.append(line(366, -320, 366 + math.cos(ang) * 30, -320 + math.sin(ang) * 30, skin, 7))
    # the head with the bun, turned up toward her hand
    o.append('<g transform="translate(18 -168) rotate(18) scale(0.95)">%s</g>' % head_bun_back(rim=rim, hair=hair, skin=skin))
    return _g(''.join(o), cx, cy, s)


def her_leaning_out(cx, cy, s=1.0, **kw):
    return her_reaching_out(cx, cy, s, **kw)


def her_on_sill(cx, cy, s=1.0, sweater=None, hair=None, skin=None, rim=None, mug=True):
    """Leaning on the windowsill on her forearms, seen from behind, a mug between her hands, looking out (a little
    right). (cx, cy) = the sill line under her chest."""
    sweater = sweater or g(20); hair = hair or g(9); skin = skin or g(40); rim = rim or g(52)
    o = []
    o.append(path('M -150 -40 C -150 -84 -90 -104 -40 -100 C -16 -90 16 -90 40 -100 C 90 -104 150 -84 150 -40 L 172 -8 '
                  'L 96 4 L 92 300 L -92 300 L -96 4 L -172 -8 Z', sweater))
    o.append(path('M -150 -40 C -150 -84 -90 -104 -40 -100 M 40 -100 C 90 -104 150 -84 150 -40', 'none', stroke=rim,
                  stroke_width='7', stroke_linecap='round', opacity='0.8'))
    for xx in (-60, -10, 40):
        o.append(path('M %d -80 C %d 0 %d 120 %d 290' % (xx, xx - 5, xx + 5, xx), 'none', stroke=g(25), stroke_width='8', opacity='0.5'))
    o.append('<g transform="translate(6 -96) rotate(8)">%s</g>' % head_bun_back(rim=rim, hair=hair, skin=skin))
    if mug:
        o.append(steam(91, 4, -22, 22, 60, col=HONEY_HI, op=0.55, n=4, flt='steamS'))
        o.append(ell(-150, -8, 26, 14, skin) + ell(150, -8, 26, 14, skin))
    return _g(''.join(o), cx, cy, s)
