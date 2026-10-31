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
<filter id="vap" x="-60%" y="-60%" width="220%" height="220%"><feTurbulence type="fractalNoise" baseFrequency="0.007 0.012" numOctaves="3" seed="17" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="38" xChannelSelector="R" yChannelSelector="G" result="d"/><feGaussianBlur in="d" stdDeviation="11"/></filter>
<filter id="vapS" x="-60%" y="-60%" width="220%" height="220%"><feTurbulence type="fractalNoise" baseFrequency="0.02 0.03" numOctaves="2" seed="23" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="16" xChannelSelector="R" yChannelSelector="G" result="d"/><feGaussianBlur in="d" stdDeviation="4"/></filter>
<filter id="chalk" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="2" seed="8" result="w"/><feDisplacementMap in="SourceGraphic" in2="w" scale="4" xChannelSelector="R" yChannelSelector="G" result="d"/><feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="1" seed="12" result="gr"/><feColorMatrix in="gr" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 4.2 -1.55" result="m"/><feComposite in="d" in2="m" operator="in"/></filter>
<filter id="fog" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="3" seed="31" result="n"/><feColorMatrix in="n" type="matrix" values="0 0 0 0 0.93  0 0 0 0 0.9  0 0 0 0 0.86  0 0 0 1.6 -0.35"/></filter>
'''


# ---------- the film's one vapour paint (board read, round 1: "white vapour, warm only at its root", never smoke)
def vapour(seed, x, y, w, h, op=0.7, lean=0.0, n=12, col='#f3f6fa', root=HONEY, root_w=None, fade=1.7, wisps=3,
           shimmer=False, flt='vap'):
    """Warm moist air meeting the cold: bright and dense just above its mouth, thinning fast to nothing, soft wispy
    edges, white (never grey); the heat's colour only AT the mouth (a small warm breath), never up the column.
    (x, y) = the mouth; h = how far it rises before it is gone; lean = drift per px risen."""
    rnd = random.Random(seed)
    o = []
    for i in range(n):
        t = i / max(1, n - 1)
        cy = y - 0.06 * h - t * h
        cx = x + lean * t * h + rnd.uniform(-0.14, 0.14) * w * (0.25 + t)
        rx = w * (0.16 + 0.48 * t) * rnd.uniform(0.85, 1.15)
        ry = rx * rnd.uniform(0.42, 0.7)
        a = op * (1 - t) ** fade * rnd.uniform(0.85, 1.08)
        o.append(ell(cx, cy, rx, ry, col, opacity=f(max(0.02, a))))
    body = grp(''.join(o), filter='url(#%s)' % flt)
    # the wisps where it thins: a few loose strands drifting off the top
    ws = ''
    for k in range(wisps):
        t0 = rnd.uniform(0.45, 0.7)
        sx = x + lean * t0 * h + rnd.uniform(-0.25, 0.25) * w
        sy = y - t0 * h
        ex = sx + lean * 0.4 * h + rnd.uniform(-0.6, 0.6) * w
        ey = sy - rnd.uniform(0.25, 0.45) * h
        ws += path('M %s %s C %s %s %s %s %s %s' % (f(sx), f(sy), f(sx + rnd.uniform(-0.4, 0.4) * w), f(sy - 0.15 * h),
                                                   f(ex + rnd.uniform(-0.3, 0.3) * w), f(ey + 0.1 * h), f(ex), f(ey)),
                   'none', stroke=col, stroke_width=f(max(6, w * 0.16)), stroke_linecap='round', opacity=f(op * 0.16))
    body += grp(ws, filter='url(#vap)')
    if root:
        rw = root_w or w * 0.3
        body = (ell(x, y - rw * 0.2, rw, rw * 0.42, root, opacity='0.42', filter='url(#b8)') +
                ell(x, y - rw * 0.3, rw * 0.5, rw * 0.2, HONEY_HI, opacity='0.5', filter='url(#b4)')) + body
    if shimmer:
        sh = ''
        for k in range(3):
            yy = y - 0.03 * h - k * 0.04 * h
            pts_ = [(x - w * 0.35 + u * w / 14.0, yy + math.sin(u * 1.9 + k) * 3) for u in range(11)]
            sh += pline(pts_, '#ffffff', 1.6, opacity='0.14')
        body += grp(sh, filter='url(#b1)')
    return body


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


def smooth_closed(points, tension=1.0):
    """A smooth closed path through the points (Catmull-Rom as cubic Beziers)."""
    n = len(points)
    d = 'M %s %s ' % (f(points[0][0]), f(points[0][1]))
    for i in range(n):
        p0, p1, p2, p3 = points[(i - 1) % n], points[i], points[(i + 1) % n], points[(i + 2) % n]
        c1 = (p1[0] + (p2[0] - p0[0]) / 6 * tension, p1[1] + (p2[1] - p0[1]) / 6 * tension)
        c2 = (p2[0] - (p3[0] - p1[0]) / 6 * tension, p2[1] - (p3[1] - p1[1]) / 6 * tension)
        d += 'C %s %s %s %s %s %s ' % (f(c1[0]), f(c1[1]), f(c2[0]), f(c2[1]), f(p2[0]), f(p2[1]))
    return d + 'Z'


def blob(seed, cx, cy, rx, ry, n=24, jit=0.12):
    rnd = random.Random(seed)
    return [(cx + math.cos(2 * math.pi * k / n) * rx * rnd.uniform(1 - jit, 1 + jit),
             cy + math.sin(2 * math.pi * k / n) * ry * rnd.uniform(1 - jit, 1 + jit)) for k in range(n)]


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
           steam_col='#eef0f4', steam_op=0.6, bloom=1.0, boil=False):
    """An electric kettle standing at (x, y) (its base centre), h px tall; face=1 spout right, -1 spout left.
    bloom: how far its little warm light blooms; boil: boiling hard (the lid lifting on a puff, the spout jetting)."""
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
    # lid and knob (boiling hard: the lid lifted and tipped on a puff of steam)
    lid = path('M %s %s Q %s %s %s %s Z' % (f(X(-24)), f(Y(84)), f(X(-1)), f(Y(97)), f(X(22)), f(Y(84))), body) + ell(X(-1), Y(96), 7 * s, 4.5 * s, dark)
    if boil:
        o += steam((steam_seed or 1) + 7, X(-1), Y(88), 60 * s, 46 * s, col=steam_col, op=0.8, n=4, flt='steamS')
        o += '<g transform="translate(0 %s) rotate(%s %s %s)">%s</g>' % (f(-11 * s), f(-14 * k), f(X(22)), f(Y(84)), lid)
    else:
        o += lid
    # spout
    o += path('M %s %s L %s %s L %s %s L %s %s Z' % (f(X(28)), f(Y(58)), f(X(52)), f(Y(80)), f(X(56)), f(Y(76)), f(X(33)), f(Y(40))), body)
    # handle
    o += path('M %s %s C %s %s %s %s %s %s' % (f(X(-26)), f(Y(76)), f(X(-62)), f(Y(78)), f(X(-60)), f(Y(26)), f(X(-34)), f(Y(22))),
              'none', stroke=dark, stroke_width=f(max(2, 9 * s)), stroke_linecap='round')
    # the little warm "on" light
    if light:
        o += circ(X(10), Y(20), max(2.2, 5.5 * s), HONEY)
        o += circ(X(10), Y(20), max(4, 12 * s * bloom), HONEY, opacity=f(min(0.6, 0.35 * bloom)), filter='url(#b4)' if bloom <= 1 else 'url(#b8)')
    if steam_seed is not None:
        sh = steam_h or 150 * s
        if boil:   # a hard jet out of the spout, then the cloud
            o += steam(steam_seed, X(60), Y(84), 54 * s, sh * 0.5, col=steam_col, op=0.9, n=5, flt='steamS', lean=0.9 * k)
            o += steam(steam_seed + 3, X(56) + k * sh * 0.4, Y(84) - sh * 0.35, 90 * s, sh * 0.9, col=steam_col, op=steam_op, n=6, flt='steamS', lean=0.15 * k)
        else:
            o += steam(steam_seed, X(56), Y(80), 70 * s, sh, col=steam_col, op=steam_op, n=6, flt='steamS', lean=0.05 * k)
    return o


def fogged_window(uid, x, y, w, h, seed=3, fog=0.62, top_fog=None, drips=7, lights=34, avoid=None, frame=g(30), mull=True):
    """A kitchen window at night, fogged by the steam: the night dark behind it, the city's lights blurred through the
    fog, the fog lit by the room's lamp (warm, heavier at the top), streams of drops running down it, beads."""
    rnd = random.Random(seed)
    top_fog = fog if top_fog is None else top_fog
    defs = '<clipPath id="fw%s"><rect x="%s" y="%s" width="%s" height="%s"/></clipPath>' % (uid, f(x), f(y), f(w), f(h))
    defs += lin_grad('fwn%s' % uid, [(0, g(7)), (0.6, g(12)), (1, g(18))], x1=0, y1=y, x2=0, y2=y + h, units=True)
    defs += lin_grad('fwf%s' % uid, [(0, '#efe5d6', top_fog), (0.55, '#e9e3da', (top_fog + fog) / 2), (1, '#e3e2e0', fog)],
                     x1=0, y1=y, x2=0, y2=y + h, units=True)
    o = rect(x, y, w, h, 'url(#fwn%s)' % uid)
    hz = y + h * 0.66
    o += rect(x, hz, w, h * 0.34, g(10))
    lt = ''
    for _ in range(lights):
        lx, ly = rnd.uniform(x, x + w), rnd.uniform(hz - h * 0.12, hz + 4)
        lt += circ(lx, ly, rnd.uniform(3, 6), HONEY if rnd.random() < 0.7 else HONEY_MID, opacity=f(rnd.uniform(0.6, 1)))
    o += grp(lt, filter='url(#b4)')
    o += rect(x, y, w, h, 'url(#fwf%s)' % uid)
    o += rect(x, y, w, h, '#ffffff', filter='url(#fog)', opacity='0.18')
    st = ''
    for _ in range(drips):
        for _try in range(8):
            dx = rnd.uniform(x + 10, x + w - 10)
            if not (avoid and avoid(dx)):
                break
        y0_ = rnd.uniform(y + h * 0.05, y + h * 0.45)
        y1_ = rnd.uniform(y0_ + h * 0.25, y + h)
        pts_ = [(dx + math.sin(v * 1.3 + dx) * 2.5, y0_ + v * (y1_ - y0_) / 6.0) for v in range(7)]
        st += pline(pts_, g(18), rnd.uniform(2.2, 3.4), opacity='0.6') + circ(pts_[-1][0], pts_[-1][1] + 2, 3.2, '#f4f2ee', opacity='0.75')
    beads = ''.join(circ(rnd.uniform(x, x + w), rnd.uniform(y + h * 0.55, y + h), rnd.uniform(1.2, 2.6), '#f6f4f0', opacity='0.6')
                    for _ in range(int(w * h / 900)))
    o += st + beads
    o = '<g clip-path="url(#fw%s)">%s</g>' % (uid, o)
    if mull:
        o += line(x + w / 2, y, x + w / 2, y + h, frame, max(6, w * 0.025))
    return defs, o


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


def frost(seed, x0, y0, x1, y1, n=26, col='#f3f6fb', op=0.75, avoid=None, edge_bias=1.0, interior=0.0):
    """Frost ferns on glass: branching strokes growing in from the edges and corners of the box (and, with interior > 0,
    that share of them seeded across the glass: a pane frosted over)."""
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
        if interior and rnd.random() < interior:
            fern(rnd.uniform(x0, x1), rnd.uniform(y0, y1), rnd.uniform(0, 2 * math.pi), rnd.uniform(50, 120) * edge_bias, 4, 2.2)
            continue
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


def her_profile_tucked(cx, cy, s=1.0, sweater=None, hair=None, skin=None, legs=None, socks='#e3d8c8', mug_col=None, rim=None,
                       flip=False):
    """Up on the table, in profile facing right, her knees pulled up to her chest and her socked feet on the table top
    (off the floor of kettles), both hands holding the mug close under her chin, eyes wide open on the kettles.
    (cx, cy) = where she sits on the table top; s = 1 for a head ~95 px tall."""
    sweater = sweater or g(26); hair = hair or g(10); skin = skin or g(52); legs = legs or g(18)
    mug_col = mug_col or g(16); rim = rim or g(66)
    o = []
    # the back (rounded, leaning a little forward over her knees)
    o.append(path('M -70 0 C -84 -60 -86 -150 -66 -214 C -54 -250 -20 -266 14 -258 C 40 -250 52 -226 50 -196 '
                  'C 44 -130 30 -60 26 0 Z', sweater))
    o.append(path('M -70 0 C -84 -60 -86 -150 -66 -214', 'none', stroke=rim, stroke_width='6', opacity='0.45'))
    # the thighs up to the knees, the shins down to the feet on the table, wool socks
    o.append(path('M -40 -6 C 0 -40 50 -100 92 -150 C 104 -164 128 -160 132 -142 C 120 -96 70 -40 30 6 Z', legs))
    o.append(path('M 98 -156 C 126 -150 140 -136 138 -112 C 136 -70 132 -36 130 -10 L 104 -8 C 104 -44 104 -84 98 -120 Z', legs))
    o.append(path('M 100 -14 C 100 4 112 10 150 10 C 164 10 166 -4 156 -10 C 142 -16 134 -18 128 -24 Z', socks))
    # the neck and head (profile to the right), the bob, the bun, the wide-open eye, a raised brow
    o.append(path('M 6 -276 L 28 -276 L 28 -246 L 4 -246 Z', skin))
    o.append(path('M -20 -340 C -20 -380 46 -386 54 -346 C 58 -336 60 -328 62 -324 L 71 -309 C 73 -305 67 -302 63 -302 '
                  'L 64 -295 C 65 -291 62 -289 60 -288 C 61 -282 57 -276 49 -273 C 35 -269 19 -271 8 -275 C -14 -281 -22 -308 -20 -340 Z', skin))
    o.append(path('M -26 -322 C -32 -380 34 -398 58 -354 C 46 -354 32 -350 24 -340 C 18 -320 16 -300 12 -280 C -2 -272 -22 -278 -30 -290 '
                  'C -34 -304 -30 -316 -26 -322 Z', hair))
    o.append(path('M 22 -342 C 34 -356 52 -354 60 -340 L 56 -334 C 46 -340 34 -340 22 -332 Z', hair))
    o.append(path('M -24 -368 C -36 -392 -20 -416 4 -414 C 28 -412 34 -388 20 -372 C 8 -362 -14 -360 -24 -368 Z', hair))
    o.append(ell(50, -323, 4.2, 5.4, g(10)) + path('M 42 -334 C 46 -338 54 -338 58 -334', 'none', stroke=g(14), stroke_width='2.5', stroke_linecap='round'))
    # the arm round the knees, both hands holding the mug close under her chin; its warm steam
    o.append(path('M 20 -238 C 50 -222 80 -200 96 -176 C 104 -164 100 -150 88 -150 C 74 -168 50 -190 24 -206 Z', sweater))
    o.append(path('M 92 -170 C 96 -196 92 -222 80 -244 L 96 -252 C 110 -228 114 -196 108 -166 Z', sweater))
    mx, my = 96, -248
    o.append(rect(mx - 22, my - 40, 44, 50, mug_col, rx='7') + rect(mx - 19, my - 40, 38, 7, HONEY_DEEP))
    o.append(path('M %d %d C %d %d %d %d %d %d' % (mx + 20, my - 30, mx + 36, my - 30, mx + 36, my - 6, mx + 20, my - 6), 'none',
                  stroke=mug_col, stroke_width='6'))
    o.append(ell(mx - 18, my - 8, 13, 11, skin) + ell(mx + 18, my - 4, 12, 10, skin))
    o.append(steam(78, mx, my - 44, 26, 70, col=HONEY_HI, op=0.65, n=4, flt='steamS'))
    body = ''.join(o)
    if flip:
        body = '<g transform="scale(-1 1)">%s</g>' % body
    return _g(body, cx, cy, s)


def open_hand(x, y, ang, size, skin, spread=1.0):
    """An open hand, palm out, fingers spread (ang: the direction the fingers point, radians)."""
    o = ell(x, y, size * 0.5, size * 0.42, skin, transform='rotate(%s %s %s)' % (f(math.degrees(ang)), f(x), f(y)))
    for k, (da, L) in enumerate(((-0.62, 0.62), (-0.24, 0.8), (0.1, 0.84), (0.42, 0.74), (1.15, 0.56))):
        a = ang + da * spread
        bx, by = x + math.cos(a) * size * 0.3, y + math.sin(a) * size * 0.3
        o += line(bx, by, bx + math.cos(a) * size * L, by + math.sin(a) * size * L, skin, size * (0.19 if k < 4 else 0.22))
    return o


def her_reach_back(sill_y, waist, shoulders, head, elbow, hand, rest, sweater=None, hair=None, skin=None, rim=None, warm=None,
                   head_s=1.0, head_rot=-30):
    """Close, from behind and a little above: she leans right out over the sill, her waist at the sill (`waist`, the
    knit's big near mass below it), her shoulders and head out in the snow (`shoulders` = (left, right)), the head turned
    up to her left in lost profile (a sliver of cheek, the ear, the bun), her left arm out and up through `elbow` to the
    open `hand`, her right forearm resting on the outer sill at `rest`. warm: the light of the wisp of heat where it
    meets her (the hand, the cheek, the sleeve's top)."""
    sweater = sweater or g(20); hair = hair or g(8); skin = skin or g(40); rim = rim or g(52)
    o = []
    (lx, ly), (rx, ry) = shoulders
    wx, wy = waist
    # the right forearm on the outer sill (beyond it)
    o.append(pline([(rx - 10, ry + 10), (rest[0] - 20, rest[1] - 6), rest], sweater, 46))
    o.append(ell(rest[0] + 18, rest[1] - 2, 20, 15, skin))
    # the upper back, out past the sill: foreshortened, wide at the shoulders
    o.append(path('M %s %s C %s %s %s %s %s %s C %s %s %s %s %s %s L %s %s L %s %s Z' % (
        f(lx - 10), f(ly + 24), f(lx - 4), f(ly - 18), f((lx + rx) / 2 - 60), f(min(ly, ry) - 34), f((lx + rx) / 2), f(min(ly, ry) - 30),
        f((lx + rx) / 2 + 60), f(min(ly, ry) - 34), f(rx + 6), f(ry - 18), f(rx + 12), f(ry + 24),
        f(wx + (rx - lx) * 0.42), f(sill_y + 4), f(wx - (rx - lx) * 0.42), f(sill_y + 4)), sweater))
    o.append(path('M %s %s C %s %s %s %s %s %s' % (f((lx + rx) / 2 + 10), f(min(ly, ry) - 30), f((lx + rx) / 2 + 70), f(min(ly, ry) - 34),
                                                 f(rx + 6), f(ry - 18), f(rx + 12), f(ry + 24)), 'none', stroke=rim, stroke_width='7', opacity='0.75'))
    # the near mass below the sill: her waist and hips in the long knit, cut by the frame's bottom
    o.append(path('M %s %s C %s %s %s %s %s 1940 L %s 1940 C %s %s %s %s %s %s Z' % (
        f(wx - (rx - lx) * 0.47), f(sill_y), f(wx - (rx - lx) * 0.53), f(sill_y + 70), f(wx - (rx - lx) * 0.56), f(sill_y + 180), f(wx - (rx - lx) * 0.57),
        f(wx + (rx - lx) * 0.57), f(wx + (rx - lx) * 0.56), f(sill_y + 180), f(wx + (rx - lx) * 0.53), f(sill_y + 70), f(wx + (rx - lx) * 0.47), f(sill_y)), g(17)))
    o.append(path('M %s %s C %s %s %s %s %s %s' % (f(wx + (rx - lx) * 0.47), f(sill_y), f(wx + (rx - lx) * 0.53), f(sill_y + 70),
                                                 f(wx + (rx - lx) * 0.56), f(sill_y + 180), f(wx + (rx - lx) * 0.57), f(1940)), 'none', stroke=rim, stroke_width='6', opacity='0.5'))
    for k in (-0.5, -0.17, 0.17, 0.5):
        o.append(line(wx + (rx - lx) * k * 0.85, sill_y + 20, wx + (rx - lx) * k * 1.0, 1930, g(22), 10, opacity='0.5'))
    # the left arm, out and up into the night; the sleeve's top catching the warmth; the open hand
    o.append(pline([(lx + 6, ly + 8), elbow, hand], sweater, 50))
    o.append(path('M %s %s L %s %s L %s %s' % (f(lx + 2), f(ly - 16), f(elbow[0] - 4), f(elbow[1] - 22), f(hand[0] + 4), f(hand[1] - 20)), 'none',
                  stroke=warm or rim, stroke_width='6', stroke_linecap='round', opacity='0.7'))
    ang = math.atan2(hand[1] - elbow[1], hand[0] - elbow[0])
    o.append(open_hand(hand[0] + math.cos(ang) * 20, hand[1] + math.sin(ang) * 20, ang, 56, skin))
    if warm:
        o.append(ell(hand[0] + math.cos(ang) * 36, hand[1] + math.sin(ang) * 36, 58, 48, warm, opacity='0.5', filter='url(#b8)'))
    # the head, out beyond the shoulders, turned up to her left: the back of it, the bun, the ear, a sliver of cheek
    hd = head_bun_back(rim=rim, hair=hair, skin=skin)
    cheek = path('M -50 -70 C -62 -54 -62 -26 -48 -10 C -38 0 -26 4 -16 2 C -30 -12 -40 -40 -40 -66 Z', skin)
    if warm:
        cheek += path('M -50 -70 C -62 -54 -62 -26 -48 -10 C -44 -22 -46 -48 -50 -70 Z', warm, opacity='0.75')
    o.append('<g transform="translate(%s %s) scale(%s) rotate(%s)">%s%s</g>' % (f(head[0]), f(head[1]), f(head_s), f(head_rot), cheek, hd))
    return ''.join(o)


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
