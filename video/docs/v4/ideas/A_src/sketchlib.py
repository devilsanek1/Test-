"""sketchlib: a tiny SVG kit for imagination A's value-sketch thumbnails (1080 x 1920 frames).

Value sketches: cool greys by CIE L*, ONE warm accent (the heat, honey), the caption seat as a light band.
Every frame is one whole picture built from these pieces; nothing here is a placement rule.
"""
import math
import random

W, H = 1080, 1920


# ---------- colour ----------
def lab2rgb(L, a=0.0, b=0.0):
    fy = (L + 16) / 116
    fx = fy + a / 500
    fz = fy - b / 200

    def finv(t):
        return t ** 3 if t ** 3 > 0.008856 else (t - 16 / 116) / 7.787

    X, Y, Z = 0.95047 * finv(fx), 1.0 * finv(fy), 1.08883 * finv(fz)
    r = 3.2406 * X - 1.5372 * Y - 0.4986 * Z
    g = -0.9689 * X + 1.8758 * Y + 0.0415 * Z
    bb = 0.0557 * X - 0.2040 * Y + 1.0570 * Z

    def gam(c):
        c = max(0.0, min(1.0, c))
        return 12.92 * c if c <= 0.0031308 else 1.055 * c ** (1 / 2.4) - 0.055

    return tuple(int(round(gam(c) * 255)) for c in (r, g, bb))


def hexc(rgb):
    return '#%02x%02x%02x' % rgb


def g(L, tint=-3.5):
    """a cool grey of lightness L (the night's value scale)"""
    return hexc(lab2rgb(L, 0.6, tint))


def warm(L=82, C=48, h=78):
    a = C * math.cos(math.radians(h))
    b = C * math.sin(math.radians(h))
    return hexc(lab2rgb(L, a, b))


HONEY = warm(84, 46, 80)        # the heat, the accent
HONEY_CORE = warm(95, 18, 84)   # a lit pane's core
AMBER = warm(66, 44, 68)        # the accent's shade
EMBER = warm(56, 40, 62)
INK = hexc(lab2rgb(18, 9, -12))  # the caption ink (deep plum) on the light band


# ---------- the frame builder ----------
COMMON_DEFS = """
<filter id="rough" x="-5%" y="-5%" width="110%" height="110%">
  <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="3" result="n"/>
  <feDisplacementMap in="SourceGraphic" in2="n" scale="7" xChannelSelector="R" yChannelSelector="G"/>
</filter>
<filter id="rough2" x="-5%" y="-5%" width="110%" height="110%">
  <feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves="2" seed="11" result="n"/>
  <feDisplacementMap in="SourceGraphic" in2="n" scale="4" xChannelSelector="R" yChannelSelector="G"/>
</filter>
<filter id="paint" x="-10%" y="-10%" width="120%" height="120%">
  <feTurbulence type="fractalNoise" baseFrequency="0.018 0.05" numOctaves="3" seed="7" result="n"/>
  <feDisplacementMap in="SourceGraphic" in2="n" scale="14" xChannelSelector="R" yChannelSelector="G" result="d"/>
  <feGaussianBlur in="d" stdDeviation="1.2"/>
</filter>
<filter id="soft1" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="2"/></filter>
<filter id="soft2" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="5"/></filter>
<filter id="soft3" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="12"/></filter>
<filter id="soft4" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="26"/></filter>
<filter id="glow" x="-200%" y="-200%" width="500%" height="500%"><feGaussianBlur stdDeviation="9"/></filter>
<filter id="glow2" x="-300%" y="-300%" width="700%" height="700%"><feGaussianBlur stdDeviation="22"/></filter>
<filter id="steam" x="-40%" y="-40%" width="180%" height="180%">
  <feTurbulence type="fractalNoise" baseFrequency="0.012 0.03" numOctaves="3" seed="5" result="n"/>
  <feDisplacementMap in="SourceGraphic" in2="n" scale="60" xChannelSelector="R" yChannelSelector="G" result="d"/>
  <feGaussianBlur in="d" stdDeviation="9"/>
</filter>
<filter id="steam2" x="-40%" y="-40%" width="180%" height="180%">
  <feTurbulence type="fractalNoise" baseFrequency="0.02 0.045" numOctaves="3" seed="9" result="n"/>
  <feDisplacementMap in="SourceGraphic" in2="n" scale="34" xChannelSelector="R" yChannelSelector="G" result="d"/>
  <feGaussianBlur in="d" stdDeviation="4"/>
</filter>
<filter id="haze" x="-30%" y="-30%" width="160%" height="160%">
  <feTurbulence type="turbulence" baseFrequency="0.004 0.06" numOctaves="2" seed="21" result="n"/>
  <feDisplacementMap in="SourceGraphic" in2="n" scale="26" xChannelSelector="R" yChannelSelector="G"/>
</filter>
<filter id="grain" x="0" y="0" width="100%" height="100%">
  <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="2" result="n"/>
  <feColorMatrix in="n" type="matrix" values="0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0.9 -0.35"/>
</filter>
<filter id="frostnoise" x="0" y="0" width="100%" height="100%">
  <feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="4" seed="31" result="n"/>
  <feColorMatrix in="n" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 2.6 -1.05"/>
</filter>
"""


class Frame:
    def __init__(self, seed=1):
        self.rng = random.Random(seed)
        self.parts = []
        self.defs = []
        self._id = 0

    def uid(self, p='u'):
        self._id += 1
        return f'{p}{self._id}'

    def add(self, s):
        self.parts.append(s)

    def svg(self):
        return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">'
                f'<defs>{COMMON_DEFS}{"".join(self.defs)}</defs>{"".join(self.parts)}</svg>')

    # ---- primitives ----
    def rect(self, x, y, w, h, fill, extra=''):
        self.add(f'<rect x="{x:.1f}" y="{y:.1f}" width="{w:.1f}" height="{h:.1f}" fill="{fill}" {extra}/>')

    def poly(self, pts, fill, extra=''):
        p = ' '.join(f'{x:.1f},{y:.1f}' for x, y in pts)
        self.add(f'<polygon points="{p}" fill="{fill}" {extra}/>')

    def path(self, d, fill='none', extra=''):
        self.add(f'<path d="{d}" fill="{fill}" {extra}/>')

    def circle(self, x, y, r, fill, extra=''):
        self.add(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{r:.1f}" fill="{fill}" {extra}/>')

    def ellipse(self, x, y, rx, ry, fill, extra=''):
        self.add(f'<ellipse cx="{x:.1f}" cy="{y:.1f}" rx="{rx:.1f}" ry="{ry:.1f}" fill="{fill}" {extra}/>')

    def group(self, inner, extra=''):
        self.add(f'<g {extra}>{inner}</g>')

    def lingrad(self, stops, x1=0, y1=0, x2=0, y2=1, units='objectBoundingBox'):
        gid = self.uid('lg')
        st = ''.join(f'<stop offset="{o}" stop-color="{c}" stop-opacity="{a}"/>' for o, c, a in stops)
        self.defs.append(f'<linearGradient id="{gid}" x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" '
                         f'gradientUnits="{units}">{st}</linearGradient>')
        return f'url(#{gid})'

    def radgrad(self, stops, cx=0.5, cy=0.5, r=0.5, units='objectBoundingBox', fx=None, fy=None):
        gid = self.uid('rg')
        st = ''.join(f'<stop offset="{o}" stop-color="{c}" stop-opacity="{a}"/>' for o, c, a in stops)
        f = f' fx="{fx}" fy="{fy}"' if fx is not None else ''
        self.defs.append(f'<radialGradient id="{gid}" cx="{cx}" cy="{cy}" r="{r}"{f} '
                         f'gradientUnits="{units}">{st}</radialGradient>')
        return f'url(#{gid})'

    def jit(self, pts, a=2.0):
        r = self.rng
        return [(x + r.uniform(-a, a), y + r.uniform(-a, a)) for x, y in pts]


# ---------- the sky, the band, the weather ----------
def sky(f, stops, y0=0, y1=H):
    """one continuous sky: stops = [(offset, L)]"""
    fill = f.lingrad([(o, g(L), 1) for o, L in stops])
    f.rect(0, y0, W, y1 - y0, fill)


def cloud(f, cx, cy, w, h, L, op=0.9, seed=0, filt='soft3'):
    r = random.Random(seed)
    s = ''
    for i in range(9):
        ex = cx + r.uniform(-0.45, 0.45) * w
        ey = cy + r.uniform(-0.25, 0.3) * h
        s += f'<ellipse cx="{ex:.0f}" cy="{ey:.0f}" rx="{r.uniform(0.18, 0.34) * w:.0f}" ry="{r.uniform(0.25, 0.5) * h:.0f}"/>'
    f.add(f'<g fill="{g(L)}" opacity="{op}" filter="url(#{filt})">{s}</g>')


def band(f, lines, seat=520, size=116, lit=None, L=86, op=0.8, ink=INK, weight=400, lit_size=None):
    """the caption seat kept as a light band (y 290-600), with the beat's words in it.
    lines: list of rows; a row is a string or a list of (text, lit:bool) runs."""
    fill = f.lingrad([(0, g(L), 0), (0.10, g(L), op), (0.90, g(L), op), (1, g(L), 0)])
    f.rect(0, 280, W, 330, fill)
    base = [395, 515] if len(lines) == 2 else [455]
    out = ''
    for row, y in zip(lines, base):
        runs = row if isinstance(row, list) else [(row, False)]
        tsp = ''
        for t, is_lit in runs:
            if is_lit:
                sz = lit_size or int(size * 1.3)
                tsp += (f'<tspan font-weight="700" font-size="{sz}" fill="{AMBER}" '
                        f'style="paint-order:stroke" stroke="{HONEY}" stroke-width="3">{t}</tspan>')
            else:
                tsp += f'<tspan>{t}</tspan>'
        out += (f'<text x="{seat}" y="{y}" text-anchor="middle" font-family="Gaegu" font-weight="{weight}" '
                f'font-size="{size}" fill="{ink}" letter-spacing="2">{tsp}</text>')
    f.add(out)


def snowfall(f, n=160, region=(0, 0, W, H), sizes=(2, 6), L=92, op=(0.35, 0.85), seed=4, skip_band=True):
    r = random.Random(seed)
    s = ''
    x0, y0, x1, y1 = region
    for _ in range(n):
        x, y = r.uniform(x0, x1), r.uniform(y0, y1)
        rad = r.uniform(*sizes)
        if skip_band and 285 < y < 605:
            rad = min(rad, 3)
            if r.random() < 0.5:
                continue
        s += f'<circle cx="{x:.0f}" cy="{y:.0f}" r="{rad:.1f}" opacity="{r.uniform(*op):.2f}"/>'
    f.add(f'<g fill="{g(L)}">{s}</g>')


def grain(f, op=0.10):
    f.add(f'<rect x="0" y="0" width="{W}" height="{H}" filter="url(#grain)" opacity="{op}"/>')


# ---------- frost on glass (the film's device: every frosted pane drawn as frost, in every frame) ----------
def bil(p, s, t):
    """a point in a quad p = [TL, TR, BR, BL] by bilinear interpolation (s across, t down)"""
    (x0, y0), (x1, y1), (x2, y2), (x3, y3) = p
    xa, ya = x0 + (x1 - x0) * s, y0 + (y1 - y0) * s
    xb, yb = x3 + (x2 - x3) * s, y3 + (y2 - y3) * s
    return (xa + (xb - xa) * t, ya + (yb - ya) * t)


def glint(f, x, y, s, L=99, op=0.95, halo=True):
    """a sparkle: frost catching the light (a thin four-point star and a soft halo)"""
    c = g(L)
    a, b = s, s * 0.15
    if halo:
        f.add(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{s * 0.55:.1f}" fill="{c}" opacity="{op * 0.35:.2f}" filter="url(#soft1)"/>')
    f.add(f'<path d="M{x - a:.1f},{y:.1f} L{x - b:.1f},{y - b:.1f} L{x:.1f},{y - a:.1f} L{x + b:.1f},{y - b:.1f} L{x + a:.1f},{y:.1f} '
          f'L{x + b:.1f},{y + b:.1f} L{x:.1f},{y + a:.1f} L{x - b:.1f},{y + b:.1f}Z" fill="{c}" opacity="{op}"/>')


def _fern_st(r, s0, t0, ang, ln, depth, out, lvl=0):
    """a frost fern in a pane's own (s, t) space: segments (s, t, s', t', level)"""
    segs = 4
    s, t = s0, t0
    for _ in range(segs):
        ang += r.uniform(-0.25, 0.25)
        ns = min(0.99, max(0.01, s + math.cos(ang) * ln / segs))
        nt = min(0.99, max(0.01, t + math.sin(ang) * ln / segs))
        out.append((s, t, ns, nt, lvl))
        if depth > 1:
            for side in (-1, 1):
                if r.random() < 0.75:
                    _fern_st(r, ns, nt, ang + side * r.uniform(0.7, 1.1), ln * r.uniform(0.25, 0.42), depth - 1, out, lvl + 1)
        s, t = ns, nt


FROST = {'glint_p': 0.45, 'glint_k': 0.34}  # how much a frame's frost glitters (a frame may set it, then reset it)


def frost_quad(f, p, frost_L=60, seed=0, state='frost', glint_p=None, fern_L=97):
    """a frosted pane in any quad p [TL, TR, BR, BL]: the frost thicker and paler toward the bottom and the rim, ferns of
    ice growing in from the corners and the sill, sometimes a glint. state 'half': CLEARING, the warm light shows
    through the middle while the frost still holds the rim."""
    r = random.Random(seed)
    xs = [q[0] for q in p]
    ys = [q[1] for q in p]
    size = min(max(xs) - min(xs), max(ys) - min(ys))
    pts = ' '.join(f'{x:.1f},{y:.1f}' for x, y in p)
    if state == 'half':
        f.add(f'<polygon points="{pts}" fill="{f.radgrad([(0, HONEY_CORE, 1), (0.5, HONEY, 1), (1, AMBER, 1)])}"/>')
        inner = [bil(p, 0.27, 0.22), bil(p, 0.73, 0.22), bil(p, 0.73, 0.66), bil(p, 0.27, 0.66)]
        ring = ('M' + ' L'.join(f'{x:.1f},{y:.1f}' for x, y in p) + ' Z M' +
                ' L'.join(f'{x:.1f},{y:.1f}' for x, y in inner[::-1]) + ' Z')
        f.add(f'<path d="{ring}" fill="{g(frost_L + 10)}" fill-rule="evenodd" opacity="0.9" filter="url(#soft1)"/>')
    else:
        # the frost sheet: pale, thickest (whitest) along the sill, a faint glow of the room through its middle
        fill = f.lingrad([(0, g(frost_L - 2), 1), (0.45, g(frost_L + 6), 1), (1, g(min(96, frost_L + 22)), 1)])
        f.add(f'<polygon points="{pts}" fill="{fill}"/>')
        if size > 20:
            c = bil(p, 0.5, 0.42)
            f.add(f'<ellipse cx="{c[0]:.1f}" cy="{c[1]:.1f}" rx="{size * 0.3:.1f}" ry="{size * 0.24:.1f}" fill="{g(frost_L - 10)}" '
                  f'opacity="0.35" filter="url(#soft2)"/>')
    if size > 9:
        f.add(f'<polygon points="{pts}" fill="none" stroke="{g(min(97, frost_L + 28))}" stroke-width="{max(1.0, size * 0.09):.1f}" '
              f'opacity="0.6" stroke-linejoin="round"/>')
    if size > 13:
        segs = []
        starts = [(0.04, 0.97, -1.05), (0.96, 0.97, -2.1), (r.uniform(0.35, 0.65), 0.99, -1.57 + r.uniform(-0.4, 0.4))]
        if size > 40:
            starts += [(0.03, 0.05, 0.75), (0.97, 0.06, 2.4), (0.02, r.uniform(0.4, 0.6), r.uniform(-0.3, 0.3)),
                       (0.98, r.uniform(0.4, 0.6), 3.14 + r.uniform(-0.3, 0.3))]
        for (s0, t0, a0) in starts:
            _fern_st(r, s0, t0, a0, r.uniform(0.38, 0.62) if state == 'frost' else r.uniform(0.2, 0.3),
                     3 if size > 26 else 2, segs)
        for lvl, wmul, op in ((0, 0.045, 0.85), (1, 0.03, 0.75), (2, 0.02, 0.65)):
            d = ''
            for (s0, t0, s1, t1, lv) in segs:
                if lv == lvl:
                    a, b = bil(p, s0, t0), bil(p, s1, t1)
                    d += f'M{a[0]:.1f},{a[1]:.1f}L{b[0]:.1f},{b[1]:.1f}'
            if d:
                # feathery: a soft wide pass of rime under the crisp crystal line
                if size > 22:
                    f.add(f'<path d="{d}" stroke="{g(fern_L)}" stroke-width="{max(1.5, size * wmul * 3.2):.2f}" fill="none" '
                          f'stroke-linecap="round" opacity="{op * 0.35:.2f}" filter="url(#soft1)"/>')
                f.add(f'<path d="{d}" stroke="{g(fern_L)}" stroke-width="{max(0.7, size * wmul):.2f}" fill="none" '
                      f'stroke-linecap="round" opacity="{op}"/>')
    if size > 6 and r.random() < (FROST['glint_p'] if glint_p is None else glint_p):
        s_, t_ = r.choice([(r.uniform(0.1, 0.35), r.uniform(0.1, 0.3)), (r.uniform(0.6, 0.9), r.uniform(0.1, 0.3)),
                           (r.uniform(0.2, 0.8), r.uniform(0.7, 0.9))])
        x, y = bil(p, s_, t_)
        glint(f, x, y, min(24, max(5, size * FROST['glint_k'])))


def wobble(pts, amp=3.0, seed=0, step=16):
    """a hand's line: the polyline resampled every `step` px and jittered with a slow wander"""
    r = random.Random(seed)
    out = []
    for (xa, ya), (xb, yb) in zip(pts[:-1], pts[1:]):
        n = max(1, int(math.hypot(xb - xa, yb - ya) / step))
        for i in range(n):
            t = i / n
            out.append((xa + (xb - xa) * t, ya + (yb - ya) * t))
    out.append(pts[-1])
    p1, p2 = r.uniform(0, 6.3), r.uniform(0, 6.3)
    return [(x + amp * (0.65 * math.sin(i * 0.6 + p1) + r.uniform(-0.35, 0.35)),
             y + amp * (0.65 * math.sin(i * 0.47 + p2) + r.uniform(-0.35, 0.35))) for i, (x, y) in enumerate(out)]


def smooth_d(pts):
    """a Catmull-Rom curve through pts, as one SVG path"""
    if len(pts) < 3:
        return 'M' + ' L'.join(f'{x:.1f},{y:.1f}' for x, y in pts)
    d = f'M{pts[0][0]:.1f},{pts[0][1]:.1f}'
    for i in range(len(pts) - 1):
        p0 = pts[i - 1] if i > 0 else pts[i]
        p1, p2 = pts[i], pts[i + 1]
        p3 = pts[i + 2] if i + 2 < len(pts) else p2
        c1 = (p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6)
        c2 = (p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6)
        d += f' C{c1[0]:.1f},{c1[1]:.1f} {c2[0]:.1f},{c2[1]:.1f} {p2[0]:.1f},{p2[1]:.1f}'
    return d


def hand_runs(pts, w, seed=0, amp=None, step=14, var=0.35):
    """a finger's stroke as short overlapping runs, each with its own width (thick and thin, as a finger presses):
    [(d, width)], plus the jittered points"""
    r = random.Random(seed + 7)
    wp = wobble(pts, amp=amp if amp is not None else max(1.5, w * 0.22), seed=seed, step=step)
    runs = []
    ph = r.uniform(0, 6.3)
    for i in range(0, len(wp) - 1, 2):
        seg = wp[max(0, i - 1):i + 4]
        ww = w * (1 + var * math.sin(i * 0.33 + ph) + r.uniform(-0.12, 0.12))
        runs.append((smooth_d(seg), max(1.0, ww)))
    return runs, wp


def frost_stroke(f, pts, w=10, seed=0, L=92, op=0.95, feathers=True, glints=2, glow=True):
    """a line drawn IN frost on the dark glass (the plan's own lines): a finger's wobbly line, thick and thin, crumbly,
    feathers of ice growing off it, a glint or two; pale and glittering, never a CAD line"""
    r = random.Random(seed)
    runs, wp = hand_runs(pts, w, seed=seed)
    if glow:
        f.add(f'<path d="{smooth_d(wp)}" stroke="{g(L)}" stroke-width="{w * 3.2:.1f}" fill="none" stroke-linecap="round" '
              f'stroke-linejoin="round" opacity="{op * 0.13:.2f}" filter="url(#soft2)"/>')
    body = ''.join(f'<path d="{d}" stroke-width="{ww:.1f}"/>' for d, ww in runs)
    f.add(f'<g stroke="{g(L - 6)}" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="{op}" '
          f'filter="url(#rough2)">{body}</g>')
    f.add(f'<path d="{smooth_d(wp)}" stroke="{g(min(99, L + 6))}" stroke-width="{max(1.0, w * 0.32):.1f}" fill="none" '
          f'stroke-linecap="round" opacity="{op * 0.8:.2f}"/>')
    if feathers and len(wp) > 3:
        d = ''
        for i in range(1, len(wp) - 1, 2):
            (xa, ya), (xb, yb) = wp[i - 1], wp[i + 1]
            a = math.atan2(yb - ya, xb - xa)
            for side in (-1, 1):
                if r.random() < 0.55:
                    aa = a + side * r.uniform(0.8, 1.2) + r.uniform(-0.2, 0.2)
                    ln = w * r.uniform(0.9, 2.2)
                    x, y = wp[i]
                    d += f'M{x:.1f},{y:.1f}L{x + math.cos(aa) * ln:.1f},{y + math.sin(aa) * ln:.1f}'
        f.add(f'<path d="{d}" stroke="{g(min(99, L + 4))}" stroke-width="{max(0.8, w * 0.22):.1f}" fill="none" '
              f'stroke-linecap="round" opacity="{op * 0.7:.2f}"/>')
    for _ in range(glints):
        x, y = wp[r.randrange(len(wp))]
        glint(f, x, y, max(6, w * r.uniform(1.3, 2.0)), op=op)
    return wp


def knit_hand(f, tip, L_knit=50, L_skin=68, mirror=False, lit=1.0, reach=1.0, rot=0):
    """HER hand from the right (or the left, mirrored), the index finger out to `tip`, in the big soft knit sleeve she
    wears at her window (B5): a bulky sleeve with a ribbed cuff and cable bumps, lit warm by the room's lamp.
    rot: the arm turned about the fingertip (degrees)"""
    if rot:
        f.add(f'<g transform="rotate({rot} {tip[0]} {tip[1]})">')
        knit_hand(f, tip, L_knit, L_skin, mirror=mirror, lit=lit, reach=reach, rot=0)
        f.add('</g>')
        return
    if mirror:
        f.add(f'<g transform="translate({W},0) scale(-1,1)">')
        knit_hand(f, (W - tip[0], tip[1]), L_knit, L_skin, mirror=False, lit=lit, reach=reach)
        f.add('</g>')
        return
    tx, ty = tip
    k = reach
    sk = warm(L_skin, 9, 70)
    kn = g(L_knit)
    # the sleeve: bulky, soft-edged, running off the right edge (a lumpy outline: the knit's cables)
    top = [(tx + 640 * k, ty + 76 * k), (tx + 500 * k, ty + 56 * k), (tx + 390 * k, ty + 44 * k), (tx + 300 * k, ty + 40 * k), (tx + 232 * k, ty + 46 * k)]
    bot = [(tx + 236 * k, ty + 190 * k), (tx + 320 * k, ty + 214 * k), (tx + 410 * k, ty + 254 * k), (tx + 510 * k, ty + 296 * k), (tx + 640 * k, ty + 336 * k)]
    d = smooth_d(top) + ' L' + smooth_d(bot)[1:] + ' Z'
    f.add(f'<path d="{d}" fill="{kn}" filter="url(#rough2)"/>')
    # cable bumps along the sleeve (soft lighter ridges) and the ribbed cuff at the wrist
    for j in range(3):
        yy = ty + (82 + j * 46) * k
        bumps = [(tx + 250 * k + i * 44, yy + (i % 2) * 6 + (i * 44) * 0.18 * j) for i in range(int(390 * k / 44) + 1)]
        f.add(f'<path d="{smooth_d(bumps)}" stroke="{g(L_knit + 7)}" stroke-width="{11 * k:.1f}" fill="none" '
              f'stroke-linecap="round" opacity="0.55" filter="url(#soft1)"/>')
    cuff = f'M{tx + 214 * k},{ty + 52 * k} L{tx + 262 * k},{ty + 46 * k} L{tx + 268 * k},{ty + 200 * k} L{tx + 222 * k},{ty + 188 * k}Z'
    f.add(f'<path d="{cuff}" fill="{g(L_knit + 4)}"/>')
    for i in range(6):
        xx = tx + (220 + i * 8) * k
        f.add(f'<path d="M{xx:.1f},{ty + (52 - i) * k:.1f} L{xx + 4 * k:.1f},{ty + (190 + i * 2) * k:.1f}" stroke="{g(L_knit - 6)}" '
              f'stroke-width="{3 * k:.1f}" opacity="0.6"/>')
    # the lamp's warm light along the sleeve's top
    f.add(f'<path d="{smooth_d(top[::-1])}" stroke="{HONEY}" stroke-width="{9 * k:.1f}" fill="none" opacity="{0.5 * lit:.2f}" '
          f'filter="url(#soft1)"/>')
    # the hand: the back of it, the curled fingers under it, the index finger out to the tip, the thumb along it
    f.add(f'<path d="M{tx + 222 * k},{ty + 58 * k} C{tx + 170 * k},{ty + 44 * k} {tx + 112 * k},{ty + 26 * k} {tx + 70 * k},{ty + 18 * k} '
          f'C{tx + 40 * k},{ty + 12 * k} {tx + 14 * k},{ty + 3 * k} {tx + 2 * k},{ty + 2 * k} C{tx - 9 * k},{ty + 2 * k} {tx - 10 * k},{ty + 17 * k} {tx + 2 * k},{ty + 21 * k} '
          f'C{tx + 30 * k},{ty + 31 * k} {tx + 60 * k},{ty + 41 * k} {tx + 86 * k},{ty + 52 * k} C{tx + 80 * k},{ty + 72 * k} {tx + 84 * k},{ty + 98 * k} {tx + 102 * k},{ty + 114 * k} '
          f'C{tx + 132 * k},{ty + 140 * k} {tx + 176 * k},{ty + 158 * k} {tx + 226 * k},{ty + 182 * k}Z" fill="{sk}"/>')
    for i in range(3):
        f.add(f'<path d="M{tx + (94 + i * 18) * k},{ty + (62 + i * 12) * k} c{-10 * k},{14 * k} {-5 * k},{33 * k} {11 * k},{40 * k}" '
              f'stroke="{g(L_skin - 13)}" stroke-width="{4.5 * k:.1f}" fill="none" stroke-linecap="round"/>')
    f.add(f'<path d="M{tx + 205 * k},{ty + 60 * k} C{tx + 150 * k},{ty + 44 * k} {tx + 80 * k},{ty + 22 * k} {tx + 6 * k},{ty + 5 * k}" '
          f'stroke="{HONEY}" stroke-width="{5 * k:.1f}" fill="none" opacity="{0.6 * lit:.2f}" filter="url(#soft1)"/>')
    f.add(f'<ellipse cx="{tx + 7 * k}" cy="{ty + 9 * k}" rx="{6 * k}" ry="{5 * k}" fill="{g(L_skin + 12)}" opacity="0.8"/>')


def steam_cloud(f, cx, cy, w, h, seed=0, L=88, op=0.92, warm=0.0):
    """one puffy cloud of steam (round tops, a flatter base): for comparing two clouds side by side"""
    r = random.Random(seed)
    s = ''
    for i in range(13):
        ex = cx + r.uniform(-0.36, 0.36) * w
        ey = cy + r.uniform(-0.28, 0.22) * h + abs(ex - cx) / w * h * 0.35
        rr = r.uniform(0.17, 0.27) * w
        s += f'<circle cx="{ex:.0f}" cy="{ey:.0f}" r="{rr:.0f}"/>'
    f.add(f'<g fill="{g(L)}" opacity="{op}" filter="url(#steam2)">{s}</g>')
    if warm > 0:
        f.add(f'<ellipse cx="{cx}" cy="{cy + h * 0.3}" rx="{w * 0.3}" ry="{h * 0.2}" fill="{HONEY}" opacity="{warm}" filter="url(#soft3)"/>')


# ---------- the city ----------
def win_shape(f, x, y, w, h, state, L_frame=None, glow=True, frost_L=70, warmth=1.0, mullion=True):
    """one window: 'frost' (cold: the pane drawn AS frost), 'warm' (the heat arrived: honey), 'dark', 'cool' (a cold
    lamp), 'half' (clearing: warm through the middle, the frost holding the rim)"""
    r = f.rng
    if state == 'dark':
        f.rect(x, y, w, h, g(r.uniform(10, 16)))
    elif state == 'frost':
        frost_quad(f, [(x, y), (x + w, y), (x + w, y + h), (x, y + h)], frost_L=frost_L, seed=int(x * 7 + y * 13))
    elif state == 'cool':
        f.rect(x, y, w, h, g(r.uniform(44, 52)))
    elif state == 'deep':
        if glow:
            f.add(f'<rect x="{x - w * 0.3:.1f}" y="{y - h * 0.25:.1f}" width="{w * 1.6:.1f}" height="{h * 1.5:.1f}" '
                  f'fill="{HONEY}" opacity="{0.1 * warmth:.2f}" filter="url(#glow)"/>')
        f.rect(x, y, w, h, f.radgrad([(0, HONEY, 1), (0.6, AMBER, 1), (1, EMBER, 1)]))
    elif state in ('warm', 'half'):
        if glow and state == 'warm':
            f.add(f'<rect x="{x - w * 0.35:.1f}" y="{y - h * 0.3:.1f}" width="{w * 1.7:.1f}" height="{h * 1.6:.1f}" '
                  f'fill="{HONEY}" opacity="{0.22 * warmth:.2f}" filter="url(#glow)"/>')
        if state == 'half':
            frost_quad(f, [(x, y), (x + w, y), (x + w, y + h), (x, y + h)], frost_L=frost_L, seed=int(x * 7 + y * 13),
                       state='half')
        else:
            fill = f.radgrad([(0, HONEY_CORE, 1), (0.55, HONEY, 1), (1, AMBER, 1)])
            f.rect(x, y, w, h, fill)
    if mullion and w > 9 and h > 12:
        lw = max(1.0, w * 0.07)
        col = g(14) if state in ('warm', 'half') else g(22)
        f.add(f'<rect x="{x + w / 2 - lw / 2:.1f}" y="{y:.1f}" width="{lw:.1f}" height="{h:.1f}" fill="{col}" opacity="0.8"/>')
        f.add(f'<rect x="{x:.1f}" y="{y + h * 0.36:.1f}" width="{w:.1f}" height="{lw:.1f}" fill="{col}" opacity="0.7"/>')


def snowcap(f, x0, x1, y, th=6, L=78, sag=2.5):
    """a snow cap along a top edge (a sill, a roof, a rail): a soft hand-cut lump"""
    r = f.rng
    n = max(3, int((x1 - x0) / 18))
    pts = [(x0 - 2, y + 1)]
    for i in range(n + 1):
        xx = x0 + (x1 - x0) * i / n
        pts.append((xx, y - th * r.uniform(0.55, 1.0) - (sag if 0 < i < n else 0)))
    pts.append((x1 + 2, y + 1))
    pts.append((x1, y + th * 0.4))
    pts.append((x0, y + th * 0.4))
    f.poly(pts, g(L))


def block(f, x0, x1, ytop, ybase, floors, cols, L=28, states=None, side=None, side_L=None, roof='flat',
          chimneys=3, frost_L=70, sills=True, cornice=True, win_w=0.42, win_h=0.52, glow=True, seed=None,
          tower=None, bays=(), L_roof=None, warmth=1.0, filt='rough2'):
    """an apartment block, front-on: hand-cut, windows by state(row, col) -> state"""
    r = f.rng if seed is None else random.Random(seed)
    w = x1 - x0
    hgt = ybase - ytop
    # side face in shade (gives the volume)
    if side:
        sx = side
        sL = side_L if side_L is not None else L - 7
        if sx > 0:
            f.poly([(x1, ytop + 6), (x1 + sx, ytop + 18), (x1 + sx, ybase), (x1, ybase)], g(sL), f'filter="url(#{filt})"')
        else:
            f.poly([(x0 + sx, ytop + 18), (x0, ytop + 6), (x0, ybase), (x0 + sx, ybase)], g(sL), f'filter="url(#{filt})"')
    # the front
    pts = [(x0, ybase), (x0, ytop + r.uniform(-2, 2)), (x0 + w * 0.5, ytop + r.uniform(-2, 2)), (x1, ytop + r.uniform(-2, 2)), (x1, ybase)]
    f.poly(pts, g(L), f'filter="url(#{filt})"')
    # roof
    if roof == 'pitched':
        f.poly([(x0 - 6, ytop + 2), (x0 + w * 0.12, ytop - hgt * 0.07), (x1 - w * 0.12, ytop - hgt * 0.07), (x1 + 6, ytop + 2)],
               g(L_roof if L_roof is not None else 70), 'filter="url(#rough2)"')
    else:
        snowcap(f, x0 - 4, x1 + 4, ytop + 2, th=9, L=L_roof if L_roof is not None else 74)
    if tower:
        tx, tw, th_ = tower
        f.poly([(tx - tw / 2, ytop + 4), (tx - tw / 2, ytop - th_ * 0.55), (tx, ytop - th_), (tx + tw / 2, ytop - th_ * 0.55),
                (tx + tw / 2, ytop + 4)], g(L + 2), 'filter="url(#rough2)"')
        snowcap(f, tx - tw / 2 - 3, tx + tw / 2 + 3, ytop - th_ * 0.55 + 2, th=6, L=72)
        win_shape(f, tx - tw * 0.15, ytop - th_ * 0.45, tw * 0.3, th_ * 0.28, 'dark', mullion=False)
    for i in range(chimneys):
        cx = x0 + w * r.uniform(0.08, 0.92)
        cw = r.uniform(10, 18)
        ch = r.uniform(18, 34)
        f.rect(cx, ytop - ch, cw, ch + 4, g(L - 4))
        snowcap(f, cx - 2, cx + cw + 2, ytop - ch + 1, th=5, L=76)
    if cornice:
        f.rect(x0 - 3, ytop + 10, w + 6, 5, g(L + 6), 'opacity="0.7"')
    # windows (hand-cut: the piano nobile taller, a few unlit, sizes and spacing varied, never a template)
    fh = (hgt - 30) / floors
    cw_ = w / cols
    for row in range(floors):
        tall = 1.12 if row == 1 else (0.9 if row == floors - 1 else 1.0)
        for c in range(cols):
            st = states(row, c) if states else 'frost'
            if st is None:
                continue
            roll = r.random()
            crest = (st == 'crest')
            if crest:
                st = 'warm'
            if st in ('warm', 'deep') and roll < 0.12 and not crest:
                st = 'dark'
            elif st == 'frost' and roll < 0.10:
                st = 'dark'
            ww = cw_ * win_w * r.uniform(0.9, 1.1)
            wh = fh * win_h * tall * r.uniform(0.93, 1.07)
            wx = x0 + cw_ * (c + 0.5) - ww / 2 + r.uniform(-2.5, 2.5)
            wy = ytop + 24 + fh * row + fh * 0.18 + r.uniform(-2, 2)
            # deep reveal (a shade above the pane)
            f.rect(wx - 2, wy - 3, ww + 4, wh + 4, g(max(6, L - 9)))
            win_shape(f, wx, wy, ww, wh, st, frost_L=frost_L, glow=glow, warmth=warmth * (2.2 if crest else 1.0))
            if crest:
                f.add(f'<rect x="{wx - ww}" y="{wy - wh * 0.6}" width="{ww * 3}" height="{wh * 2.2}" fill="{HONEY}" opacity="0.22" filter="url(#glow2)"/>')
            if st == 'warm' and r.random() < 0.18 and ww > 14:
                # a candle or a paper star in the window
                if r.random() < 0.5:
                    f.rect(wx + ww * 0.45, wy + wh * 0.62, ww * 0.1, wh * 0.3, g(18))
                else:
                    f.add(f'<polygon points="{wx + ww / 2},{wy + wh * 0.15} {wx + ww * 0.6},{wy + wh * 0.3} {wx + ww / 2},{wy + wh * 0.45} '
                          f'{wx + ww * 0.4},{wy + wh * 0.3}" fill="{g(20)}"/>')
            if sills:
                snowcap(f, wx - 4, wx + ww + 4, wy + wh + 3, th=4, L=76 if st != 'warm' else 84, sag=0.5)
            if row in (1, 3) and r.random() < 0.12 and ww > 12:
                # a small balcony rail under snow
                f.rect(wx - 8, wy + wh + 6, ww + 16, 3, g(L - 8))
                snowcap(f, wx - 9, wx + ww + 9, wy + wh + 6, th=5, L=74)
    for (bx, bw) in bays:
        f.rect(bx, ytop + 30, bw, hgt - 60, g(L + 3), 'opacity="0.55" filter="url(#rough2)"')


def far_city(f, y_base, x0=0, x1=W, L=50, Lwin=None, heights=(40, 140), seed=8, density=0.5, warm_frac=0.0,
             dome=None, filt='rough', win=True):
    """the far city: a belt of roofs stepping, paler and simpler with distance"""
    r = random.Random(seed)
    x = x0
    while x < x1:
        bw = r.uniform(40, 110)
        bh = r.uniform(*heights)
        top = y_base - bh
        f.poly([(x, y_base), (x, top + r.uniform(0, 6)), (x + bw, top + r.uniform(0, 6)), (x + bw, y_base)], g(L + r.uniform(-3, 3)),
               f'filter="url(#{filt})"')
        snowcap(f, x - 1, x + bw + 1, top + 3, th=4, L=min(92, L + 18))
        if win:
            for yy in range(int(top + 12), int(y_base - 6), 13):
                for xx in range(int(x + 6), int(x + bw - 6), 12):
                    if r.random() < density:
                        if r.random() < warm_frac:
                            f.rect(xx, yy, 5, 6, HONEY, 'opacity="0.9"')
                        else:
                            f.rect(xx, yy, 5, 6, g(Lwin if Lwin else L + 12), 'opacity="0.8"')
        x += bw + r.uniform(-8, 4)
    if dome:
        dx, dy, dr = dome
        f.rect(dx - dr * 0.9, dy, dr * 1.8, dr * 1.5, g(L + 2))
        f.ellipse(dx, dy, dr, dr * 0.85, g(L + 4))
        f.rect(dx - 2, dy - dr * 1.6, 4, dr * 0.9, g(L + 4))


# ---------- people ----------
def person(f, x, yfeet, h, L=14, pose='walk', facing=1, rim=None, coat=True, hair=True, arm_up=False, bag=False,
           mug=False, lean=0.0, extra='', scarf=False):
    """a small figure in silhouette (about 7.8 heads), acting with its pose; facing +1 right, -1 left"""
    s = facing
    hd = h / 7.8
    c = g(L)
    parts = []
    hx, hy = x + lean * h * 0.15 * s, yfeet - h + hd * 0.55
    # legs
    if pose == 'walk':
        parts.append(f'<path d="M{x - hd * 0.3},{yfeet - h * 0.36} L{x - hd * 0.62},{yfeet - hd * 0.12} L{x - hd * 0.95},{yfeet} '
                     f'L{x - hd * 0.42},{yfeet} L{x - hd * 0.3},{yfeet - hd * 0.18} L{x + hd * 0.05},{yfeet - h * 0.28} '
                     f'L{x + hd * 0.42},{yfeet - hd * 0.14} L{x + hd * 0.4},{yfeet} L{x + hd * 0.9},{yfeet} '
                     f'L{x + hd * 0.66},{yfeet - hd * 0.2} L{x + hd * 0.36},{yfeet - h * 0.36}Z" fill="{c}"/>')
    elif pose == 'sit':
        parts.append(f'<path d="M{x - hd * 0.5},{yfeet - h * 0.3} L{x + hd * 1.2 * s},{yfeet - h * 0.3} '
                     f'L{x + hd * 1.3 * s},{yfeet} L{x + hd * 0.9 * s},{yfeet} L{x + hd * 0.8 * s},{yfeet - h * 0.18} '
                     f'L{x - hd * 0.3},{yfeet - h * 0.16}Z" fill="{c}"/>')
    else:
        parts.append(f'<path d="M{x - hd * 0.42},{yfeet - h * 0.44} L{x - hd * 0.5},{yfeet} L{x - hd * 0.08},{yfeet} '
                     f'L{x},{yfeet - h * 0.3} L{x + hd * 0.1},{yfeet} L{x + hd * 0.52},{yfeet} L{x + hd * 0.42},{yfeet - h * 0.44}Z" fill="{c}"/>')
    # coat / torso
    top = yfeet - h + hd * 1.15
    hem = yfeet - h * (0.30 if coat else 0.46)
    if pose == 'sit':
        hem = yfeet - h * 0.28
    sw = hd * 0.95
    flare = 0.95 if coat else 0.7
    parts.append(f'<path d="M{hx - sw * 0.55},{top} Q{hx},{top - hd * 0.12} {hx + sw * 0.55},{top} '
                 f'Q{x + sw * 0.62},{(top + hem) / 2} {x + sw * flare},{hem} Q{x},{hem + hd * 0.14} {x - sw * flare},{hem} '
                 f'Q{x - sw * 0.62},{(top + hem) / 2} {hx - sw * 0.55},{top}Z" fill="{c}"/>')
    if scarf:
        parts.append(f'<path d="M{hx - sw * 0.4},{top + hd * 0.05} Q{hx - sw * 1.3 * s},{top + hd * 0.3} {hx - sw * 1.6 * s},{top + hd * 0.9} '
                     f'L{hx - sw * 1.3 * s},{top + hd * 0.95} Q{hx - sw * 0.9 * s},{top + hd * 0.5} {hx},{top + hd * 0.35}Z" fill="{c}"/>')
    # head + hair
    parts.append(f'<ellipse cx="{hx}" cy="{hy}" rx="{hd * 0.42}" ry="{hd * 0.52}" fill="{c}"/>')
    if hair:
        parts.append(f'<path d="M{hx - hd * 0.5},{hy - hd * 0.1} Q{hx - hd * 0.2 * s},{hy - hd * 0.75} {hx + hd * 0.5},{hy - hd * 0.15} '
                     f'Q{hx + hd * 0.62 * -s},{hy + hd * 0.9} {hx - hd * 0.62 * s},{hy + hd * 1.05}Z" fill="{c}"/>')
    # arms
    if arm_up:
        parts.append(f'<path d="M{hx + sw * 0.4 * s},{top + hd * 0.2} L{hx + hd * 1.05 * s},{top - hd * 1.6} '
                     f'L{hx + hd * 1.3 * s},{top - hd * 1.5} L{hx + sw * 0.7 * s},{top + hd * 0.5}Z" fill="{c}"/>')
        parts.append(f'<circle cx="{hx + hd * 1.18 * s}" cy="{top - hd * 1.68}" r="{hd * 0.22}" fill="{c}"/>')
    if mug:
        mx, my = hx + hd * 0.85 * s, top + hd * 0.9
        parts.append(f'<path d="M{hx + sw * 0.3 * s},{top + hd * 0.25} L{mx},{my} L{mx - hd * 0.2 * s},{my + hd * 0.3} '
                     f'L{hx},{top + hd * 0.9}Z" fill="{c}"/>')
        parts.append(f'<rect x="{mx - hd * 0.2}" y="{my - hd * 0.32}" width="{hd * 0.42}" height="{hd * 0.42}" rx="{hd * 0.06}" fill="{c}"/>')
    if bag:
        parts.append(f'<rect x="{x - sw * (0.95 if s > 0 else -0.55) - hd * 0.2}" y="{top + hd * 1.6}" width="{hd * 0.75}" height="{hd * 0.95}" '
                     f'rx="{hd * 0.12}" fill="{g(L + 6)}"/>')
    inner = ''.join(parts)
    f.add(f'<g {extra}>{inner}</g>')
    if rim:
        # a thin lit edge on the side the light comes from
        rx = hx - hd * 0.45 * rim
        f.add(f'<path d="M{rx},{hy - hd * 0.3} Q{rx - hd * 0.05 * rim},{hy + hd * 0.6} {x - sw * 0.75 * rim},{hem}" '
              f'stroke="{g(min(95, L + 50))}" stroke-width="{max(1.2, h / 120):.1f}" fill="none" opacity="0.7"/>')


def breath(f, x, y, s=1.0, L=86, op=0.5):
    f.add(f'<g fill="{g(L)}" opacity="{op}" filter="url(#soft2)"><ellipse cx="{x}" cy="{y}" rx="{14 * s}" ry="{8 * s}"/>'
          f'<ellipse cx="{x + 14 * s}" cy="{y - 8 * s}" rx="{10 * s}" ry="{6 * s}"/></g>')


# ---------- steam ----------
def plume(f, pts, widths, L=82, op=0.85, warm_root=0.0, filt='steam', seed=0):
    """a column or drift of steam along a path of points with widths"""
    s = ''
    r = random.Random(seed)
    for (x, y), w in zip(pts, widths):
        for k in range(3):
            s += (f'<ellipse cx="{x + r.uniform(-0.25, 0.25) * w:.0f}" cy="{y + r.uniform(-0.2, 0.2) * w:.0f}" '
                  f'rx="{w * r.uniform(0.45, 0.65):.0f}" ry="{w * r.uniform(0.32, 0.5):.0f}"/>')
    f.add(f'<g fill="{g(L)}" opacity="{op}" filter="url(#{filt})">{s}</g>')
    if warm_root > 0:
        (x, y), w = pts[0], widths[0]
        f.add(f'<ellipse cx="{x}" cy="{y}" rx="{w * 0.7}" ry="{w * 0.45}" fill="{HONEY}" opacity="{warm_root}" filter="url(#soft3)"/>')


def curl(f, x, y, h=40, L=88, op=0.75, warm=False, sw=3.0):
    """a small curl of steam rising from a cup or a kettle's spout"""
    c = HONEY if warm else g(L)
    d = (f'M{x},{y} C{x - h * 0.25},{y - h * 0.3} {x + h * 0.3},{y - h * 0.5} {x},{y - h * 0.75} '
         f'C{x - h * 0.2},{y - h * 0.9} {x + h * 0.1},{y - h} {x + h * 0.05},{y - h * 1.15}')
    f.add(f'<path d="{d}" stroke="{c}" stroke-width="{sw}" fill="none" opacity="{op}" stroke-linecap="round" filter="url(#soft1)"/>')


# ---------- things ----------
def kettle(f, x, y, s=1.0, L=16, steam=True, steam_L=88, warm_back=False):
    """a kettle silhouette standing on y (its base), x its centre"""
    c = g(L)
    d = (f'M{x - 15 * s},{y} L{x - 12 * s},{y - 20 * s} Q{x},{y - 26 * s} {x + 12 * s},{y - 20 * s} L{x + 15 * s},{y}Z')
    f.add(f'<path d="{d}" fill="{c}"/>')
    f.add(f'<path d="M{x + 11 * s},{y - 12 * s} L{x + 24 * s},{y - 22 * s} L{x + 25 * s},{y - 19 * s} L{x + 13 * s},{y - 7 * s}Z" fill="{c}"/>')
    f.add(f'<path d="M{x - 9 * s},{y - 22 * s} Q{x},{y - 34 * s} {x + 9 * s},{y - 22 * s}" stroke="{c}" stroke-width="{2.6 * s}" fill="none"/>')
    if steam:
        curl(f, x + 25 * s, y - 22 * s, h=34 * s, L=steam_L, op=0.85, sw=2.4 * s)


def mug(f, x, y, s=1.0, L=16):
    c = g(L)
    f.add(f'<rect x="{x - 9 * s}" y="{y - 20 * s}" width="{18 * s}" height="{20 * s}" rx="{2 * s}" fill="{c}"/>')
    f.add(f'<path d="M{x + 9 * s},{y - 15 * s} q{7 * s},{1 * s} {6 * s},{6 * s} q{-1 * s},{4 * s} {-6 * s},{4 * s}" stroke="{c}" stroke-width="{2.4 * s}" fill="none"/>')


def rack(f, x, ytop, w, ybase, L=16, lights_L=86, rows=9, glow_warm=0.0, seed=0, lights=True, vent_warm=False):
    """a giant computer: a tall dark cabinet with rows of small cold lights (or warm vents when hot)"""
    r = random.Random(seed)
    f.poly(f.jit([(x, ybase), (x, ytop), (x + w, ytop), (x + w, ybase)], 1.5), g(L), 'filter="url(#rough2)"')
    hh = (ybase - ytop)
    for i in range(rows):
        yy = ytop + hh * (i + 0.5) / rows
        f.rect(x + w * 0.06, yy - hh / rows * 0.42, w * 0.88, hh / rows * 0.84, g(L + 4), 'opacity="0.55"')
        if vent_warm:
            f.add(f'<rect x="{x + w * 0.1:.1f}" y="{yy - hh / rows * 0.12:.1f}" width="{w * 0.8:.1f}" height="{hh / rows * 0.24:.1f}" '
                  f'fill="{HONEY}" opacity="{0.55 + 0.4 * r.random():.2f}"/>')
        if lights:
            n = r.randint(3, 7)
            for k in range(n):
                lx = x + w * 0.12 + k * w * 0.1
                if r.random() < 0.85:
                    f.rect(lx, yy - 2, max(2.5, w * 0.035), max(2.5, w * 0.03), g(lights_L))
    if glow_warm > 0:
        f.add(f'<rect x="{x - w * 0.1}" y="{ytop}" width="{w * 1.2}" height="{hh}" fill="{HONEY}" opacity="{glow_warm}" filter="url(#glow2)"/>')


# ---------- frost ----------
def frost_fern(f, x, y, ang, length, depth=3, L=96, op=0.55, sw=2.2, seed=0):
    """a frost fern: a branching feather of ice crystals"""
    r = random.Random(seed)
    s = []

    def branch(x, y, a, ln, d, w):
        if d == 0 or ln < 6:
            return
        segs = 6
        px, py = x, y
        for i in range(segs):
            a += r.uniform(-0.18, 0.18)
            nx, ny = px + math.cos(a) * ln / segs, py + math.sin(a) * ln / segs
            s.append(f'<line x1="{px:.1f}" y1="{py:.1f}" x2="{nx:.1f}" y2="{ny:.1f}" stroke-width="{w:.1f}"/>')
            if d > 1:
                for side in (-1, 1):
                    if r.random() < 0.8:
                        branch(nx, ny, a + side * r.uniform(0.6, 1.0), ln * r.uniform(0.25, 0.4), d - 1, w * 0.7)
            px, py = nx, ny

    branch(x, y, ang, length, depth, sw)
    f.add(f'<g stroke="{g(L)}" opacity="{op}" stroke-linecap="round">{"".join(s)}</g>')


def frost_field(f, x, y, w, h, L=88, op=0.9, clip=None, mask=None, density=26, seed=12, base_op=0.55):
    """a frosted pane: a pale crystalline sheet, brighter where it is thickest (the edges), feathered ferns growing in,
    a few glints"""
    r = random.Random(seed)
    cid = f.uid('fc')
    f.defs.append(f'<clipPath id="{cid}"><rect x="{x}" y="{y}" width="{w}" height="{h}"/></clipPath>')
    f.add(f'<g clip-path="url(#{cid})" {mask or ""}>')
    sheet = f.radgrad([(0, g(L - 6), 1), (0.65, g(L), 1), (1, g(min(97, L + 8)), 1)])
    f.rect(x, y, w, h, sheet, f'opacity="{base_op}"')
    f.add(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" filter="url(#frostnoise)" opacity="{op * 0.35}"/>')
    for i in range(density):
        side = r.choice(['l', 'r', 'b', 't', 'b', 'b'])
        if side == 'l':
            sx, sy, a = x, y + r.uniform(0, h), r.uniform(-0.6, 0.6)
        elif side == 'r':
            sx, sy, a = x + w, y + r.uniform(0, h), math.pi + r.uniform(-0.6, 0.6)
        elif side == 'b':
            sx, sy, a = x + r.uniform(0, w), y + h, -math.pi / 2 + r.uniform(-0.7, 0.7)
        else:
            sx, sy, a = x + r.uniform(0, w), y, math.pi / 2 + r.uniform(-0.7, 0.7)
        frost_fern(f, sx, sy, a, r.uniform(0.22, 0.5) * min(w, h), depth=3, L=99, op=op * 0.55, sw=r.uniform(1.4, 2.6),
                   seed=seed * 100 + i)
    glints = ''.join(f'<circle cx="{r.uniform(x, x + w):.0f}" cy="{r.uniform(y, y + h):.0f}" r="{r.uniform(1, 2.6):.1f}"/>'
                     for _ in range(int(w * h / 9000)))
    f.add(f'<g fill="{g(99)}" opacity="0.8">{glints}</g>')
    f.add('</g>')




# ---------- perspective ----------
def homography(quad):
    """the map from the unit square (u right, v down) to a quad [p00, p10, p11, p01] (true perspective)"""
    import numpy as np
    src = [(0, 0), (1, 0), (1, 1), (0, 1)]
    A, B = [], []
    for (u, v), (x, y) in zip(src, quad):
        A.append([u, v, 1, 0, 0, 0, -u * x, -v * x]); B.append(x)
        A.append([0, 0, 0, u, v, 1, -u * y, -v * y]); B.append(y)
    h = np.linalg.solve(np.array(A, float), np.array(B, float))
    a, b, c, d, e, ff, g_, h_ = h

    def m(u, v):
        den = g_ * u + h_ * v + 1
        return ((a * u + b * v + c) / den, (d * u + e * v + ff) / den)
    return m


def qpoly(f, m, u0, v0, u1, v1, fill, extra=''):
    f.poly([m(u0, v0), m(u1, v0), m(u1, v1), m(u0, v1)], fill, extra)


def facade(f, quad, floors, cols, L=26, states=None, frost_L=60, win_w=0.46, win_h=0.5, seed=0, sills=True,
           openings=None, glow=True):
    """a facade in perspective: windows by state(row, col); openings(row, col) -> 'open' draws a swung casement and a
    neighbour leaning out"""
    r = random.Random(seed)
    m = homography(quad)
    f.poly(quad, g(L), 'filter="url(#rough2)"')
    for row in range(floors):
        for c in range(cols):
            st = states(row, c) if states else 'frost'
            if st is None:
                continue
            u0 = (c + 0.5 - win_w / 2) / cols
            u1 = (c + 0.5 + win_w / 2) / cols
            v0 = (row + 0.22) / floors
            v1 = (row + 0.22 + win_h) / floors
            p = [m(u0, v0), m(u1, v0), m(u1, v1), m(u0, v1)]
            xs = [q[0] for q in p]; ys = [q[1] for q in p]
            bx, by, bw, bh = min(xs), min(ys), max(xs) - min(xs), max(ys) - min(ys)
            f.poly([m(u0 - 0.01, v0 - 0.02), m(u1 + 0.01, v0 - 0.02), m(u1 + 0.01, v1 + 0.01), m(u0 - 0.01, v1 + 0.01)], g(max(6, L - 10)))
            if st == 'warm':
                f.add(f'<polygon points="{" ".join(f"{x:.1f},{y:.1f}" for x, y in p)}" fill="{HONEY}" opacity="0.28" filter="url(#glow)"/>')
                fill = f.radgrad([(0, HONEY_CORE, 1), (0.6, HONEY, 1), (1, AMBER, 1)])
            elif st == 'half':
                fill = f.lingrad([(0, g(frost_L), 1), (0.5, g(frost_L - 4), 1), (0.65, HONEY, 1), (1, AMBER, 1)])
            elif st == 'dark':
                fill = g(12)
            else:
                fill = f.radgrad([(0, g(frost_L - 12), 1), (0.6, g(frost_L - 4), 1), (1, g(frost_L + 10), 1)])
            f.poly(p, fill)
            # mullion
            f.add(f'<line x1="{m((u0 + u1) / 2, v0)[0]:.1f}" y1="{m((u0 + u1) / 2, v0)[1]:.1f}" x2="{m((u0 + u1) / 2, v1)[0]:.1f}" '
                  f'y2="{m((u0 + u1) / 2, v1)[1]:.1f}" stroke="{g(14)}" stroke-width="{max(1, bw * 0.06):.1f}" opacity="0.8"/>')
            if sills:
                a, b = m(u0 - 0.015, v1 + 0.012), m(u1 + 0.015, v1 + 0.012)
                f.add(f'<line x1="{a[0]:.1f}" y1="{a[1]:.1f}" x2="{b[0]:.1f}" y2="{b[1]:.1f}" stroke="{g(80 if st == "warm" else 70)}" '
                      f'stroke-width="{max(2, bh * 0.1):.1f}" stroke-linecap="round"/>')
            if openings and openings(row, c):
                # the casement swung open toward the street, its frost catching the light; a neighbour leans out
                hinge_t, hinge_b = p[0], p[3]
                sw = bw * 0.75
                f.poly([hinge_t, (hinge_t[0] - sw, hinge_t[1] + bh * 0.08), (hinge_b[0] - sw, hinge_b[1] - bh * 0.02), hinge_b],
                       g(min(92, frost_L + 18)), 'opacity="0.9"')
                kind = openings(row, c)
                px = bx + bw * 0.55
                hh = bh * 0.95
                person(f, px, by + bh * 0.98, hh * 1.25, L=10, pose='stand', facing=-1, coat=False, arm_up=(kind != 'cup'),
                       mug=(kind == 'cup'))
    return m


def hand_phone(f, x, y, s=1.0, bubble=True, L_glove=17):
    """POV: your gloved hand from the bottom left holding a phone; (x, y) the screen's top-left"""
    sw, sh = 190 * s, 330 * s
    # the phone's dark case and its cool screen
    f.add(f'<rect x="{x - 10 * s}" y="{y - 12 * s}" width="{sw + 20 * s}" height="{sh + 24 * s}" rx="{26 * s}" fill="{g(9)}"/>')
    scr = f.lingrad([(0, g(78), 1), (1, g(70), 1)])
    f.add(f'<rect x="{x}" y="{y}" width="{sw}" height="{sh}" rx="{18 * s}" fill="{scr}"/>')
    f.add(f'<rect x="{x - 30 * s}" y="{y - 30 * s}" width="{sw + 60 * s}" height="{sh + 60 * s}" rx="40" fill="{g(80)}" opacity="0.18" filter="url(#glow)"/>')
    if bubble:
        f.add(f'<rect x="{x + 22 * s}" y="{y + 150 * s}" width="{sw - 50 * s}" height="{58 * s}" rx="{26 * s}" fill="{HONEY}"/>')
        f.add(f'<rect x="{x + 50 * s}" y="{y + 80 * s}" width="{sw - 75 * s}" height="{46 * s}" rx="{22 * s}" fill="{g(88)}"/>')
        f.add(f'<rect x="{x + 22 * s}" y="{y + 150 * s}" width="{sw - 50 * s}" height="{58 * s}" rx="{26 * s}" fill="{HONEY}" opacity="0.5" filter="url(#glow)"/>')
    # the glove: palm under the phone, fingers round its edge, the thumb over its face, the wrist cut by the bottom
    c = g(L_glove)
    f.add(f'<path d="M{x - 40 * s},{y + sh + 260 * s} C{x - 60 * s},{y + sh + 80 * s} {x - 34 * s},{y + sh * 0.55} {x - 6 * s},{y + sh * 0.45} '
          f'L{x + 20 * s},{y + sh * 0.6} C{x + 40 * s},{y + sh * 0.85} {x + 120 * s},{y + sh * 0.95} {x + sw + 26 * s},{y + sh * 0.88} '
          f'C{x + sw + 50 * s},{y + sh * 1.02} {x + sw + 40 * s},{y + sh + 120 * s} {x + sw - 10 * s},{y + sh + 260 * s}Z" fill="{c}"/>')
    for k in range(3):
        fy = y + sh * (0.52 + k * 0.13)
        f.add(f'<path d="M{x + sw + 6 * s},{fy} q{26 * s},{6 * s} {22 * s},{36 * s} q{-6 * s},{8 * s} {-22 * s},{4 * s}Z" fill="{c}"/>')
    f.add(f'<path d="M{x - 8 * s},{y + sh * 0.62} C{x + 10 * s},{y + sh * 0.5} {x + 50 * s},{y + sh * 0.56} {x + 62 * s},{y + sh * 0.7} '
          f'C{x + 50 * s},{y + sh * 0.78} {x + 6 * s},{y + sh * 0.8} {x - 14 * s},{y + sh * 0.76}Z" fill="{g(L_glove + 5)}"/>')
    f.add(f'<path d="M{x - 52 * s},{y + sh + 150 * s} C{x + 40 * s},{y + sh + 120 * s} {x + 120 * s},{y + sh + 130 * s} {x + sw + 30 * s},{y + sh + 150 * s}" '
          f'stroke="{g(L_glove + 9)}" stroke-width="{14 * s}" fill="none" opacity="0.8"/>')


def frost_line(f, d, w=14, L_clear=16, op=1.0, glow_L=None):
    """a line drawn by a finger through frost: the cleared glass shows the dark night (a soft-edged dark stroke)"""
    f.add(f'<path d="{d}" stroke="{g(L_clear)}" stroke-width="{w}" fill="none" stroke-linecap="round" stroke-linejoin="round" '
          f'opacity="{op}" filter="url(#rough2)"/>')


def ice_line(f, d, w=4, L=92, op=0.95):
    """a line drawn IN frost (the plan's own lines, light on the dark night)"""
    f.add(f'<path d="{d}" stroke="{g(L)}" stroke-width="{w}" fill="none" stroke-linecap="round" stroke-linejoin="round" '
          f'opacity="{op}" filter="url(#rough2)"/>')
    f.add(f'<path d="{d}" stroke="{g(L)}" stroke-width="{w * 3.5}" fill="none" stroke-linecap="round" opacity="{op * 0.16}" filter="url(#soft2)"/>')


# ---------- Helsinki street walls, the computer, her at the window ----------
def street_wall(f, quad, pieces, frost_L=58, seed=0, openings=None, states=None, ornate=False, doors=None, win_cb=None):
    """a street wall in perspective made of several buildings shoulder to shoulder: pieces = [(u0, u1, rise, floors,
    cols, L)], rise lifts that building's roofline above the wall's top line (in wall heights); states(k, row, col, u).
    ornate: the stucco blocks seen close (a moulded cornice, string courses between floors, window surrounds, a plinth);
    doors(k) -> None / 'warm' / 'cold': a street door at that building's foot (returns its threshold point)"""
    m = homography(quad)
    rr = random.Random(seed)
    out = []
    door_pts = []
    for k, (u0, u1, rise, floors, cols, L) in enumerate(pieces):
        q = [m(u0, -rise), m(u1, -rise), m(u1, 1.0), m(u0, 1.0)]
        mm = homography(q)
        f.poly(q, g(L), 'filter="url(#rough2)"')
        near = max(0.35, 1 - (u0 + u1) / 2)
        if ornate:
            # the stucco seen close: a plinth, string courses between floors, a deep moulded cornice under the roof's snow
            qpoly(f, mm, 0.0, 0.93, 1.0, 1.0, g(max(8, L - 7)), 'filter="url(#rough2)"')
            for row in range(1, floors):
                v = 0.06 + row * 0.86 / floors - 0.02
                qpoly(f, mm, 0.0, v, 1.0, v + 0.014, g(L + 7), 'opacity="0.85"')
                qpoly(f, mm, 0.0, v + 0.014, 1.0, v + 0.02, g(max(6, L - 8)), 'opacity="0.6"')
            qpoly(f, mm, -0.01, 0.0, 1.01, 0.035, g(L + 10), 'filter="url(#rough2)"')
            qpoly(f, mm, -0.01, 0.035, 1.01, 0.05, g(max(6, L - 9)), 'opacity="0.75"')
            for i in range(int(14 * (u1 - u0) / 0.3) + 4):
                uu = (i + 0.5) / (int(14 * (u1 - u0) / 0.3) + 4)
                qpoly(f, mm, uu - 0.008, 0.036, uu + 0.008, 0.048, g(L + 9), 'opacity="0.7"')
        # its cornice and roof snow, a chimney or two
        a, b = q[0], q[1]
        f.add(f'<path d="M{a[0]:.0f},{a[1] - 3:.0f} L{b[0]:.0f},{b[1] - 3:.0f}" stroke="{g(74)}" stroke-width="{max(4, 10 * (1 - (u0 + u1) / 2)):.0f}" '
              f'stroke-linecap="round" filter="url(#rough2)"/>')
        for t in ((0.2, 0.5, 0.78) if ornate else (0.25, 0.7)):
            if rr.random() < 0.8:
                x, y = mm(t, 0)
                sc = near * (1.3 if ornate else 1.0)
                f.rect(x, y - 44 * sc, 18 * sc, 46 * sc, g(L - 5))
                if ornate:
                    f.rect(x - 2 * sc, y - 46 * sc, 22 * sc, 6 * sc, g(L + 4))
                snowcap(f, x - 2, x + 18 * sc + 2, y - 44 * sc + 1, th=4, L=74)
        for row in range(floors):
            for c in range(cols):
                uu = (c + 0.5) / cols
                st = states(k, row, c, u0 + (u1 - u0) * uu) if states else 'frost'
                if st is None:
                    continue
                wu0, wu1 = (c + 0.27) / cols, (c + 0.73) / cols
                v0 = 0.06 + (row + 0.2) * 0.86 / floors
                v1 = v0 + 0.5 * 0.86 / floors
                p = [mm(wu0, v0), mm(wu1, v0), mm(wu1, v1), mm(wu0, v1)]
                bw = abs(p[1][0] - p[0][0])
                bh = abs(p[3][1] - p[0][1])
                if ornate:
                    # the window's moulded surround and a small hood over it
                    qpoly(f, mm, wu0 - 0.05, v0 - 0.04, wu1 + 0.05, v1 + 0.025, g(L + 8), 'opacity="0.9"')
                    qpoly(f, mm, wu0 - 0.07, v0 - 0.06, wu1 + 0.07, v0 - 0.035, g(L + 12), 'opacity="0.9"')
                f.poly([mm(wu0 - 0.02, v0 - 0.015), mm(wu1 + 0.02, v0 - 0.015), mm(wu1 + 0.02, v1 + 0.01), mm(wu0 - 0.02, v1 + 0.01)], g(max(6, L - 10)))
                if st == 'warm':
                    f.add(f'<polygon points="{" ".join(f"{x:.1f},{y:.1f}" for x, y in p)}" fill="{HONEY}" opacity="0.3" filter="url(#glow)"/>')
                    f.poly(p, f.radgrad([(0, HONEY_CORE, 1), (0.6, HONEY, 1), (1, AMBER, 1)]))
                elif st == 'dark':
                    f.poly(p, g(11))
                else:
                    frost_quad(f, p, frost_L=frost_L, seed=seed * 1000 + k * 100 + row * 10 + c, state=('half' if st == 'half' else 'frost'))
                ma, mb = mm((wu0 + wu1) / 2, v0), mm((wu0 + wu1) / 2, v1)
                f.add(f'<line x1="{ma[0]:.1f}" y1="{ma[1]:.1f}" x2="{mb[0]:.1f}" y2="{mb[1]:.1f}" stroke="{g(14)}" stroke-width="{max(1, bw * 0.06):.1f}" opacity="0.8"/>')
                sa, sb = mm(wu0 - 0.03, v1 + 0.012), mm(wu1 + 0.03, v1 + 0.012)
                f.add(f'<line x1="{sa[0]:.1f}" y1="{sa[1]:.1f}" x2="{sb[0]:.1f}" y2="{sb[1]:.1f}" stroke="{g(82 if st == "warm" else 70)}" '
                      f'stroke-width="{max(2, bh * 0.1):.1f}" stroke-linecap="round"/>')
                if win_cb:
                    win_cb(k, row, c, p, st)
                kind = openings(k, row, c) if openings else None
                if kind:
                    hinge_t, hinge_b = p[0], p[3]
                    swv = bw * 0.8
                    f.poly([hinge_t, (hinge_t[0] - swv, hinge_t[1] + bh * 0.06), (hinge_b[0] - swv, hinge_b[1]), hinge_b], g(88), 'opacity="0.92"')
                    f.add(f'<polygon points="{hinge_t[0] - swv},{hinge_t[1] + bh * 0.06} {hinge_t[0]},{hinge_t[1]} {hinge_b[0]},{hinge_b[1]} {hinge_b[0] - swv},{hinge_b[1]}" '
                          f'fill="{HONEY}" opacity="0.18"/>')
                    px = (p[0][0] + p[1][0]) / 2
                    person(f, px, p[3][1] + bh * 0.05, bh * 1.35, L=9, pose='stand', facing=-1, coat=False,
                           arm_up=(kind == 'up'), mug=(kind == 'cup'))
                    breath(f, px - bh * 0.25, p[0][1] - bh * 0.1, s=max(0.4, bh / 90), op=0.5)
        dk = doors(k) if doors else None
        if dk:
            # the street door at the building's foot: a dark doorway under a small hood, lit warm when the heat is in
            du = 0.5 if cols % 2 else 0.5 + 0.5 / cols
            p = [mm(du - 0.07, 0.8), mm(du + 0.07, 0.8), mm(du + 0.07, 1.0), mm(du - 0.07, 1.0)]
            qpoly(f, mm, du - 0.1, 0.77, du + 0.1, 0.8, g(L + 9))
            if dk == 'warm':
                f.add(f'<polygon points="{" ".join(f"{x:.1f},{y:.1f}" for x, y in p)}" fill="{HONEY}" opacity="0.45" filter="url(#glow)"/>')
                f.poly(p, f.lingrad([(0, HONEY, 1), (1, AMBER, 1)]))
            else:
                f.poly(p, g(10))
            door_pts.append((k, mm(du, 1.0), dk))
        out.append(mm)
    f.last_doors = door_pts
    return m, out


def computer_cabinet(f, x, ytop, w, ybase, L=12, hot=0.0, seed=3, steam=True):
    """ONE giant computer standing alone: a tall cabinet that reads as a machine, not a building: rounded shoulders,
    a plinth, a glass door with its stacked trays and small cold lights, vents on top, a thick cable into the snow"""
    rr = random.Random(seed)
    h = ybase - ytop
    rad = w * 0.08
    f.add(f'<rect x="{x}" y="{ytop}" width="{w}" height="{h}" rx="{rad}" fill="{g(L)}"/>')
    f.add(f'<rect x="{x}" y="{ytop}" width="{w * 0.08}" height="{h}" rx="{rad * 0.6}" fill="{g(L + 22)}" opacity="0.7"/>')
    f.add(f'<rect x="{x - w * 0.04}" y="{ybase - h * 0.035}" width="{w * 1.08}" height="{h * 0.04}" rx="4" fill="{g(L - 4)}"/>')
    gx, gy, gw, gh = x + w * 0.14, ytop + h * 0.07, w * 0.72, h * 0.84
    f.add(f'<rect x="{gx}" y="{gy}" width="{gw}" height="{gh}" rx="{rad * 0.5}" fill="{g(L - 5)}"/>')
    trays = 9
    for i in range(trays):
        ty = gy + gh * (i + 0.15) / trays
        f.rect(gx + gw * 0.05, ty, gw * 0.9, gh / trays * 0.7, g(L + 7))
        for k in range(rr.randint(3, 6)):
            f.rect(gx + gw * (0.1 + 0.11 * k), ty + gh / trays * 0.28, max(3, w * 0.03), max(3, w * 0.025),
                   HONEY if hot > 0.5 else g(92))
    f.add(f'<line x1="{gx + gw * 0.5}" y1="{gy}" x2="{gx + gw * 0.5}" y2="{gy + gh}" stroke="{g(L + 14)}" stroke-width="3"/>')
    for k in range(5):
        f.rect(x + w * (0.15 + 0.15 * k), ytop + h * 0.015, w * 0.1, h * 0.03, g(L + 10))
    f.add(f'<path d="M{x + w * 0.85},{ybase - 4} C{x + w * 1.2},{ybase + 40} {x + w * 1.6},{ybase + 30} {x + w * 2.4},{ybase + 70}" '
          f'stroke="{g(8)}" stroke-width="{max(5, w * 0.05)}" fill="none"/>')
    if steam:
        plume(f, [(x + w * 0.5, ytop - 20), (x + w * 0.55, ytop - 100), (x + w * 0.62, ytop - 190)], [w * 0.5, w * 0.7, w * 0.9],
              L=86, op=0.85, seed=seed + 5, warm_root=0.4)
