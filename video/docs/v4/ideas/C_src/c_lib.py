"""Imagination C: drawing helpers for the idea thumbnails.

Value sketches in one cool night ramp, with ONE warm accent: the heat (a honey glow living inside what carries it).
Every frame is a whole 1080 x 1920 picture (world, light, people, words); `c_frames.py` composes them.
"""
import math
import random

W, H = 1080, 1920

# ---------------------------------------------------------------- colour
def _hx(h):
    h = h.lstrip('#')
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))


def _tohex(c):
    return '#%02x%02x%02x' % tuple(max(0, min(255, int(round(v)))) for v in c)


def mix(a, b, t):
    a, b = _hx(a), _hx(b)
    return _tohex([a[i] + (b[i] - a[i]) * t for i in range(3)])


# the night's value ramp (a cool indigo grey): v(0) darkest .. v(100) lightest
_RAMP = [(0, '#05070e'), (12, '#0f1424'), (25, '#1c2338'), (38, '#2d3552'), (50, '#434c6c'),
         (62, '#5f6888'), (74, '#838ba8'), (86, '#b0b6cb'), (94, '#d9dce8'), (100, '#f3f4f9')]


def v(L):
    L = max(0, min(100, L))
    for (a, ca), (b, cb) in zip(_RAMP, _RAMP[1:]):
        if a <= L <= b:
            return mix(ca, cb, (L - a) / (b - a))
    return _RAMP[-1][1]


# the heat: deep -> amber -> honey -> core
_WARM = [(0, '#4a2a16'), (35, '#a85a24'), (60, '#e8923e'), (80, '#ffc879'), (92, '#ffe2a8'), (100, '#fff6e2')]


def w(t):
    t = max(0, min(100, t))
    for (a, ca), (b, cb) in zip(_WARM, _WARM[1:]):
        if a <= t <= b:
            return mix(ca, cb, (t - a) / (b - a))
    return _WARM[-1][1]


CAP_INK = '#FFF0DE'
CAP_LIT = '#FFD58C'


# ---------------------------------------------------------------- svg basics
def pts(p):
    return ' '.join('%.1f,%.1f' % (x, y) for x, y in p)


def poly(p, fill, op=1.0, extra=''):
    o = '' if op >= 1 else ' opacity="%.3f"' % op
    return '<polygon points="%s" fill="%s"%s %s/>' % (pts(p), fill, o, extra)


def path(d, fill='none', stroke=None, sw=0, op=1.0, extra=''):
    s = '' if stroke is None else ' stroke="%s" stroke-width="%.1f" stroke-linecap="round" stroke-linejoin="round"' % (stroke, sw)
    o = '' if op >= 1 else ' opacity="%.3f"' % op
    return '<path d="%s" fill="%s"%s%s %s/>' % (d, fill, s, o, extra)


def rect(x, y, ww, hh, fill, op=1.0, rx=0, extra=''):
    o = '' if op >= 1 else ' opacity="%.3f"' % op
    r = '' if not rx else ' rx="%.1f"' % rx
    return '<rect x="%.1f" y="%.1f" width="%.1f" height="%.1f" fill="%s"%s%s %s/>' % (x, y, ww, hh, fill, r, o, extra)


def circ(x, y, r, fill, op=1.0, extra=''):
    o = '' if op >= 1 else ' opacity="%.3f"' % op
    return '<circle cx="%.1f" cy="%.1f" r="%.1f" fill="%s"%s %s/>' % (x, y, r, fill, o, extra)


def ell(x, y, rx, ry, fill, op=1.0, extra=''):
    o = '' if op >= 1 else ' opacity="%.3f"' % op
    return '<ellipse cx="%.1f" cy="%.1f" rx="%.1f" ry="%.1f" fill="%s"%s %s/>' % (x, y, rx, ry, fill, o, extra)


def line(x1, y1, x2, y2, stroke, sw, op=1.0, extra=''):
    o = '' if op >= 1 else ' opacity="%.3f"' % op
    return '<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" stroke="%s" stroke-width="%.1f" stroke-linecap="round"%s %s/>' % (
        x1, y1, x2, y2, stroke, sw, o, extra)


def g(items, extra=''):
    return '<g %s>%s</g>' % (extra, ''.join(items))


def smooth(p, closed=False):
    """Catmull-Rom through points -> a cubic path (free curves, never compass arcs)."""
    if len(p) < 3:
        return 'M%.1f,%.1f ' % p[0] + ' '.join('L%.1f,%.1f' % q for q in p[1:])
    q = list(p)
    if closed:
        q = [p[-1]] + list(p) + [p[0], p[1]]
    else:
        q = [p[0]] + list(p) + [p[-1]]
    d = 'M%.1f,%.1f ' % q[1]
    for i in range(1, len(q) - 2):
        p0, p1, p2, p3 = q[i - 1], q[i], q[i + 1], q[i + 2]
        c1 = (p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6)
        c2 = (p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6)
        d += 'C%.1f,%.1f %.1f,%.1f %.1f,%.1f ' % (c1 + c2 + p2)
    return d + ('Z' if closed else '')


def jit(p, rng, a=1.5):
    return [(x + rng.uniform(-a, a), y + rng.uniform(-a, a)) for x, y in p]


# ---------------------------------------------------------------- defs
def defs(extra=''):
    return '''<defs>
<filter id="gS" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="5"/></filter>
<filter id="gM" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="14"/></filter>
<filter id="gL" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="34"/></filter>
<filter id="gXL" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="70"/></filter>
<filter id="soft1" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="1.3"/></filter>
<filter id="soft3" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="3"/></filter>
<filter id="halo" x="-20%" y="-40%" width="140%" height="180%"><feGaussianBlur stdDeviation="9"/></filter>
<filter id="paint" x="0" y="0" width="100%" height="100%">
  <feTurbulence type="fractalNoise" baseFrequency="0.011 0.019" numOctaves="3" seed="7" result="n"/>
  <feColorMatrix in="n" type="matrix" values="0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0 0.55  0 0 0 0.9 0"/>
</filter>
<filter id="tooth" x="0" y="0" width="100%" height="100%">
  <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="3" result="n"/>
  <feColorMatrix in="n" type="matrix" values="0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0.6 0"/>
</filter>
<filter id="shimmer" x="-30%" y="-10%" width="160%" height="120%">
  <feTurbulence type="turbulence" baseFrequency="0.012 0.045" numOctaves="2" seed="11" result="t"/>
  <feDisplacementMap in="SourceGraphic" in2="t" scale="26" xChannelSelector="R" yChannelSelector="G"/>
</filter>
<filter id="steam" x="-40%" y="-40%" width="180%" height="180%">
  <feTurbulence type="fractalNoise" baseFrequency="0.018 0.03" numOctaves="3" seed="5" result="t"/>
  <feDisplacementMap in="SourceGraphic" in2="t" scale="40" xChannelSelector="R" yChannelSelector="G" result="d"/>
  <feGaussianBlur in="d" stdDeviation="6"/>
</filter>
''' + extra + '</defs>'


def texture():
    """A very subtle painted mottle + tooth over the whole frame (the paper's job, at sketch strength)."""
    return (rect(0, 0, W, H, '#808080', 0.10, extra='filter="url(#paint)" style="mix-blend-mode:soft-light"') +
            rect(0, 0, W, H, '#808080', 0.07, extra='filter="url(#tooth)" style="mix-blend-mode:soft-light"'))


def page(svg_body, extra_defs=''):
    return ('<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0;padding:0;background:#000}'
            'svg{display:block}</style></head><body>'
            '<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920" viewBox="0 0 1080 1920">'
            + defs(extra_defs) + svg_body + '</svg></body></html>')


# ---------------------------------------------------------------- sky, snow
def sky(top, band, low, horizon, y_h, glow=None, gid='sky'):
    """One gentle gradient from the frame top to the horizon; flat through the caption band (y 290-600)."""
    stops = [(0, top), (250 / y_h, band), (600 / y_h, band), (min(0.97, 820 / y_h), low), (1, horizon)]
    s = ''.join('<stop offset="%.4f" stop-color="%s"/>' % (o, c) for o, c in stops)
    out = '<linearGradient id="%s" x1="0" y1="0" x2="0" y2="1">%s</linearGradient>' % (gid, s)
    out = '<defs>%s</defs>' % out + rect(0, 0, W, y_h + 2, 'url(#%s)' % gid)
    if glow:
        out += ell(glow[0], y_h, glow[1], glow[2], glow[3], glow[4], extra='filter="url(#gXL)"')
    return out


def snowfall(rng, n=140, y0=0, y1=H, band_half=True, col=None, big=1.0, avoid=None):
    col = col or v(88)
    out = []
    for _ in range(n):
        x = rng.uniform(0, W)
        y = rng.uniform(y0, y1)
        r = rng.choice([1.4, 1.8, 2.3, 2.3, 3.0, 3.8 * big, 5.0 * big])
        if 290 <= y <= 600:
            if band_half and rng.random() < 0.5:
                continue
            r = min(r, 2.6)
        if avoid and avoid(x, y):
            continue
        out.append(circ(x, y, r, col, rng.uniform(0.35, 0.85)))
    return ''.join(out)


# ---------------------------------------------------------------- the camera
class Cam:
    """A person's camera: eye height `eye` m, focal f px, horizon at cy, looking down +Z (yaw in degrees)."""

    def __init__(self, f=1000, cx=540, cy=1150, eye=1.6, yaw=0.0):
        self.f, self.cx, self.cy, self.eye = f, cx, cy, eye
        self.cs, self.sn = math.cos(math.radians(yaw)), math.sin(math.radians(yaw))

    def P(self, X, Y, Z):
        x = X * self.cs - Z * self.sn
        z = X * self.sn + Z * self.cs
        z = max(z, 0.05)
        return (self.cx + self.f * x / z, self.cy - self.f * (Y - self.eye) / z)

    def quad(self, a, b, c, d):
        return [self.P(*a), self.P(*b), self.P(*c), self.P(*d)]


# ---------------------------------------------------------------- people (small, simple, modern; from behind or turned away)
def person(x, foot_y, h, col, rim=None, pose='stand', facing=1, cap=True, coat_long=True, scarf=None, extra=''):
    """A small modern figure (about 7.8 heads), drawn as a silhouette with a rim on the lit side.
    pose: stand | walk | lean_back | tug | sit | lean_in | look_up."""
    u = h / 7.8
    hx = x
    out = []
    head_cy = foot_y - h + u * 0.55
    sh_y = foot_y - h + u * 1.45
    hip_y = foot_y - h + u * 4.0
    lean = {'lean_back': -0.9, 'lean_in': 1.1, 'look_up': -0.2, 'shield': -0.6}.get(pose, 0.0) * u * facing
    hx_head = hx + lean
    # legs
    if pose == 'sit':
        seat_y = foot_y - u * 2.2
        out.append(path('M%.1f,%.1f L%.1f,%.1f L%.1f,%.1f L%.1f,%.1f L%.1f,%.1f Z' % (
            hx - u * 0.6, seat_y, hx + u * 1.6 * facing, seat_y + u * 0.1, hx + u * 1.5 * facing, foot_y,
            hx + u * 1.1 * facing, foot_y, hx + u * 1.0 * facing, seat_y + u * 0.6), col))
        hip_y = seat_y
        sh_y = seat_y - u * 2.6
        head_cy = sh_y - u * 0.9
        hx_head = hx + u * 0.2 * facing
    else:
        step = u * (0.9 if pose == 'walk' else 0.35)
        out.append(path('M%.1f,%.1f L%.1f,%.1f L%.1f,%.1f L%.1f,%.1f L%.1f,%.1f L%.1f,%.1f Z' % (
            hx - u * 0.75, hip_y, hx - step - u * 0.25, foot_y, hx - step + u * 0.25, foot_y,
            hx + u * 0.05, hip_y + u * 1.2, hx + step - u * 0.15, foot_y, hx + step + u * 0.35, foot_y) +
            ' L%.1f,%.1f Z' % (hx + u * 0.75, hip_y), col))
    # coat / torso (a soft trapezoid, the hem flaring)
    hem_y = hip_y + (u * 1.6 if coat_long and pose != 'sit' else u * 0.4)
    tor = [(hx - u * 0.95 + lean * 0.5, sh_y), (hx + u * 0.95 + lean * 0.5, sh_y), (hx + u * 1.15, hem_y),
           (hx - u * 1.15, hem_y)]
    out.append(path(smooth([(tor[0][0] + u * 0.2, sh_y - u * 0.15), tor[1], tor[2], ((tor[2][0] + tor[3][0]) / 2, hem_y + u * 0.08), tor[3], tor[0]], closed=True), col))
    # arms
    if pose == 'tug':
        out.append(path('M%.1f,%.1f Q%.1f,%.1f %.1f,%.1f' % (hx + u * 0.8 * facing, sh_y + u * 0.2, hx + u * 1.6 * facing, sh_y + u * 1.3,
                                                         hx + u * 0.3 * facing, sh_y - u * 0.1), 'none', col, u * 0.55))
        out.append(path('M%.1f,%.1f Q%.1f,%.1f %.1f,%.1f' % (hx - u * 0.8 * facing, sh_y + u * 0.2, hx - u * 1.3 * facing, sh_y + u * 1.4,
                                                         hx - u * 1.6 * facing, sh_y + u * 0.2), 'none', col, u * 0.5))
    elif pose == 'shield':
        out.append(path('M%.1f,%.1f Q%.1f,%.1f %.1f,%.1f' % (hx + u * 0.7 * facing, sh_y + u * 0.2, hx + u * 2.0 * facing, sh_y - u * 0.2,
                                                         hx + u * 1.3 * facing, head_cy - u * 0.6), 'none', col, u * 0.5))
        out.append(ell(hx + u * 1.3 * facing, head_cy - u * 0.65, u * 0.32, u * 0.42, col))
        out.append(path('M%.1f,%.1f L%.1f,%.1f' % (hx - u * 0.8 * facing, sh_y + u * 0.3, hx - u * 1.3 * facing, hip_y + u * 0.1), 'none', col, u * 0.48))
    elif pose == 'lean_back':
        out.append(path('M%.1f,%.1f L%.1f,%.1f' % (hx - u * 0.8 * facing, sh_y + u * 0.3, hx - u * 2.6 * facing, sh_y + u * 0.6), 'none', col, u * 0.5))
        out.append(path('M%.1f,%.1f L%.1f,%.1f' % (hx + u * 0.6 * facing, sh_y + u * 0.3, hx + u * 1.0 * facing, hip_y + u * 0.3), 'none', col, u * 0.5))
    elif pose == 'sit':
        out.append(path('M%.1f,%.1f Q%.1f,%.1f %.1f,%.1f' % (hx + u * 0.6 * facing, sh_y + u * 0.3, hx + u * 1.4 * facing, sh_y + u * 1.8,
                                                         hx + u * 1.5 * facing, sh_y + u * 0.9), 'none', col, u * 0.5))
    elif pose == 'lean_in':
        out.append(path('M%.1f,%.1f L%.1f,%.1f' % (hx + u * 0.7 * facing, sh_y + u * 0.3, hx + u * 2.0 * facing, sh_y + u * 0.5), 'none', col, u * 0.48))
    elif pose == 'look_up':
        out.append(path('M%.1f,%.1f L%.1f,%.1f' % (hx - u * 0.8, sh_y + u * 0.3, hx - u * 0.9, hip_y + u * 0.2), 'none', col, u * 0.5))
        out.append(path('M%.1f,%.1f L%.1f,%.1f' % (hx + u * 0.8, sh_y + u * 0.3, hx + u * 0.9, hip_y + u * 0.2), 'none', col, u * 0.5))
    else:
        sw_ = u * (0.5 if pose == 'walk' else 0.15)
        out.append(path('M%.1f,%.1f L%.1f,%.1f' % (hx - u * 0.85, sh_y + u * 0.3, hx - u * 1.0 - sw_, hip_y + u * 0.3), 'none', col, u * 0.48))
        out.append(path('M%.1f,%.1f L%.1f,%.1f' % (hx + u * 0.85, sh_y + u * 0.3, hx + u * 1.0 + sw_, hip_y + u * 0.3), 'none', col, u * 0.48))
    # neck + head + hair/cap
    out.append(rect(hx_head - u * 0.22, head_cy + u * 0.3, u * 0.44, u * 0.6, col))
    out.append(ell(hx_head, head_cy, u * 0.5, u * 0.6, col))
    if cap:
        out.append(path(smooth([(hx_head - u * 0.56, head_cy - u * 0.05), (hx_head - u * 0.4, head_cy - u * 0.62),
                                (hx_head + u * 0.05, head_cy - u * 0.8), (hx_head + u * 0.5, head_cy - u * 0.55),
                                (hx_head + u * 0.58, head_cy - u * 0.02)], closed=True), col))
    if scarf:
        out.append(path('M%.1f,%.1f Q%.1f,%.1f %.1f,%.1f' % (hx_head - u * 0.55, head_cy + u * 0.95, hx_head, head_cy + u * 1.25,
                                                         hx_head + u * 0.6, head_cy + u * 0.9), 'none', scarf, u * 0.42))
    fig = ''.join(out)
    if rim:
        # a thin rim on the lit side (a shifted copy clipped by the figure itself is overkill: a light sliver)
        rimx = rim[1] * u * 0.18
        return g([g([fig], 'transform="translate(%.1f,0)" fill="%s" opacity="0.9"' % (rimx, rim[0])), fig], extra)
    return g([fig], extra)


# ---------------------------------------------------------------- captions
def caption(lines, size=108, weight=300, y_one=455, ys=(395, 515), seat=540, ink=CAP_INK, lit=CAP_LIT):
    """lines: list of lists of (text, is_lit). Centered on the seat, in the band, warm white on the night, the lit word honey."""
    out = []
    bases = [y_one] if len(lines) == 1 else list(ys)
    for ln, by in zip(lines, bases):
        spans_h, spans = [], []
        for txt, is_lit in ln:
            if is_lit:
                spans.append('<tspan font-weight="700" fill="%s">%s</tspan>' % (lit, txt))
                spans_h.append('<tspan font-weight="700">%s</tspan>' % txt)
            else:
                spans.append('<tspan>%s</tspan>' % txt)
                spans_h.append('<tspan>%s</tspan>' % txt)
        common = 'x="%d" y="%d" text-anchor="middle" font-family="Gaegu" font-size="%d" font-weight="%d"' % (seat, by, size, weight)
        out.append('<text %s fill="#10142a" opacity="0.85" filter="url(#halo)">%s</text>' % (common, ''.join(spans_h)))
        # the lit word's warm glow
        if any(l for _, l in ln):
            gl = ''.join('<tspan font-weight="700" fill="%s">%s</tspan>' % (lit, t) if l else
                         '<tspan fill="none">%s</tspan>' % t for t, l in ln)
            out.append('<text %s opacity="0.55" filter="url(#gS)">%s</text>' % (common, gl))
        out.append('<text class="ink" %s fill="%s">%s</text>' % (common, ink, ''.join(spans)))
    return ''.join(out)


# ---------------------------------------------------------------- the heat
def heat_glow(shape_svg_fill_fn, strength=1.0):
    """Draw a warm shape with its own glow: wide soft bloom, tighter glow, then the crisp core."""
    return (g([shape_svg_fill_fn(w(70))], 'filter="url(#gL)" opacity="%.2f"' % (0.55 * strength)) +
            g([shape_svg_fill_fn(w(82))], 'filter="url(#gM)" opacity="%.2f"' % (0.75 * strength)) +
            shape_svg_fill_fn(w(92)))


def warm_window(x, y, ww, hh, t=88, glow=True, frame_col=None, mullion=True):
    out = []
    if glow:
        out.append(rect(x - ww * 0.35, y - hh * 0.25, ww * 1.7, hh * 1.5, w(70), 0.55, extra='filter="url(#gM)"'))
    out.append(rect(x, y, ww, hh, w(t)))
    out.append(rect(x + ww * 0.12, y + hh * 0.1, ww * 0.76, hh * 0.55, w(min(100, t + 8)), 0.8))
    if mullion:
        fc = frame_col or v(18)
        out.append(rect(x + ww / 2 - max(1, ww * 0.05), y, max(2, ww * 0.1), hh, fc, 0.85))
        out.append(rect(x, y + hh * 0.36, ww, max(1.5, hh * 0.06), fc, 0.85))
    return ''.join(out)


def steam_puff(cx, cy, rx, ry, col, op=0.6):
    return ell(cx, cy, rx, ry, col, op, extra='filter="url(#steam)"')


def cloud(cx, cy, wdt, hgt, body, lit, rng, n=10, op=1.0, under=True):
    """A painted snow cloud: irregular billows (ellipses of varied size on a ladder), its underside lit by the city."""
    lobes = []
    for i in range(n):
        t = i / (n - 1)
        x = cx - wdt / 2 + t * wdt + rng.uniform(-wdt * 0.04, wdt * 0.04)
        bump = math.sin(t * math.pi) * hgt * rng.uniform(0.55, 1.0)
        rx = wdt / n * rng.uniform(0.9, 1.6)
        ry = max(hgt * 0.25, bump * rng.uniform(0.5, 0.8))
        lobes.append((x, cy - bump * 0.45, rx, ry))
    out = []
    if under:
        out.append(g([ell(x, y + ry * 0.28, rx, ry, lit) for x, y, rx, ry in lobes] +
                     [ell(cx, cy + hgt * 0.1, wdt * 0.52, hgt * 0.22, lit)], 'filter="url(#soft3)"'))
    out.append(g([ell(x, y, rx, ry, body) for x, y, rx, ry in lobes] +
                 [ell(cx, cy, wdt * 0.5, hgt * 0.2, body)], 'filter="url(#soft3)"'))
    return g(out, 'opacity="%.2f"' % op)


def streak(x0, y, x1, th, col, op=0.5):
    return path(smooth([(x0, y), ((x0 + x1) / 2, y - th * 0.6), (x1, y + th * 0.2), ((x0 + x1) / 2, y + th * 0.6)], closed=True),
                col, op=op, extra='filter="url(#soft3)"')


def wisps(x, y, height, n, col, width, rng, spread=60, op=0.55, blur='gS', lean=0.0):
    """Rising wisps of steam or warm air: soft S-curves, thinning and fading as they rise."""
    out = []
    for i in range(n):
        x0 = x + rng.uniform(-spread, spread)
        hgt = height * rng.uniform(0.6, 1.0)
        amp = rng.uniform(10, 26)
        ph = rng.uniform(0, 6.28)
        p = []
        for k in range(9):
            t = k / 8
            p.append((x0 + math.sin(ph + t * 5.0) * amp * (0.4 + t) + lean * t * hgt, y - t * hgt))
        out.append(path(smooth(p), 'none', col, width * rng.uniform(0.7, 1.2), op * rng.uniform(0.6, 1.0),
                        extra='filter="url(#%s)"' % blur))
    return ''.join(out)
