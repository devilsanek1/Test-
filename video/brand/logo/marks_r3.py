"""Round 3 (owner, 2026-10-29: "No, more abstract more premium"): abstract marks, no text, no face.
Precise geometry in a 1000 x 1000 box centred on (500, 500); fills only."""
import itertools
import math

import numpy as np

from logo_lib import arc, bez, join, stroke_outline, circle_d, poly_d

_ids = itertools.count(1)


def _pt(cx, cy, r, a):
    return cx + r * math.cos(math.radians(a)), cy + r * math.sin(math.radians(a))


def ring_seg(cx, cy, r_out, r_in, a0, a1):
    """An annular sector with flat (butt) ends; screen angles, a0 -> a1 clockwise."""
    span = (a1 - a0) % 360 or 360
    large = 1 if span > 180 else 0
    o0, o1 = _pt(cx, cy, r_out, a0), _pt(cx, cy, r_out, a0 + span)
    i1, i0 = _pt(cx, cy, r_in, a0 + span), _pt(cx, cy, r_in, a0)
    return (f'M{o0[0]:.2f} {o0[1]:.2f} A{r_out:.2f} {r_out:.2f} 0 {large} 1 {o1[0]:.2f} {o1[1]:.2f} '
            f'L{i1[0]:.2f} {i1[1]:.2f} A{r_in:.2f} {r_in:.2f} 0 {large} 0 {i0[0]:.2f} {i0[1]:.2f} Z')


def half_disc(cx, cy, r, a):
    """The half of a disc on the clockwise side of the diameter at screen angle a."""
    p0, p1 = _pt(cx, cy, r, a), _pt(cx, cy, r, a + 180)
    return f'M{p0[0]:.2f} {p0[1]:.2f} A{r:.2f} {r:.2f} 0 0 1 {p1[0]:.2f} {p1[1]:.2f} Z'


def _p(d, fill):
    return f'<path d="{d}" fill="{fill}"/>'


def _c(cx, cy, r, fill):
    return f'<circle cx="{cx:.2f}" cy="{cy:.2f}" r="{r:.2f}" fill="{fill}"/>'


# ---------------------------------------------------------------- candidates
def arc_point(c, dot, s=1.0):
    """An open ring and a point: the question reduced to its two parts, no stem."""
    cx, cy, R, w = 500, 440, 205 * s, 112 * s
    d = ring_seg(cx, cy, R + w / 2, R - w / 2, 180, 90 + 360 - 1e-3)
    dr = 74 * s
    return _p(d, c) + _c(cx, cy + R + w / 2 + 70 * s + dr, dr, dot)


def split_sphere(c, dot, s=1.0, a=-38, gap=64, r=340, dr=54):
    """A sphere split open: the two halves part and show the point inside (the fuss, opened up)."""
    r, gap, dr = r * s, gap * s, dr * s
    nx, ny = math.cos(math.radians(a + 90)), math.sin(math.radians(a + 90))
    out = ''
    for sg in (-1, 1):
        ox, oy = sg * nx * gap / 2, sg * ny * gap / 2
        ang = a if sg == 1 else a + 180
        out += _p(half_disc(500 + ox, 500 + oy, r, ang), c)
    return out + _c(500, 500, dr, dot)


def echo(c, dot, s=1.0, w=44):
    """Ripples from one point: nested rings, all touching at the source."""
    tx, ty = 330, 690  # the source, lower left
    ang = math.atan2(500 - ty, 500 - tx)
    out = ''
    for r in (330, 235, 140):
        rr = r * s
        cx, cy = tx + rr * math.cos(ang), ty + rr * math.sin(ang)
        cx, cy = 500 + (cx - 500) * 1, cy
        out += _p(ring_seg(cx, cy, rr + w / 2 * s, rr - w / 2 * s, 0, 360 - 1e-3), c)
    cx, cy = tx + 62 * s * math.cos(ang), ty + 62 * s * math.sin(ang)
    return out + _c(cx, cy, 52 * s, dot)


def calm_centre(c, dot, s=1.0, w=62):
    """The calm centre: broken rings turning round a still point (the eye of the storm)."""
    out = ''
    for i, (r, g0) in enumerate(((175, 200), (275, 320), (375, 80))):
        out += _p(ring_seg(500, 500, (r + w / 2) * s, (r - w / 2) * s, g0 + 38, g0 - 38 + 360), c)
    return out + _c(500, 500, 78 * s, dot)


def arch_window(c, dot, s=1.0):
    """A window: an arch with the low sun in it (our cozy window, the posters' architecture)."""
    W, H = 440 * s, 640 * s
    x0, y0 = 500 - W / 2, 500 - H / 2 + 20 * s
    r = W / 2
    d = (f'M{x0:.1f} {y0 + H:.1f} L{x0:.1f} {y0 + r:.1f} A{r:.1f} {r:.1f} 0 0 1 {x0 + W:.1f} {y0 + r:.1f} '
         f'L{x0 + W:.1f} {y0 + H:.1f} Z')
    # the inner window (negative space) and the sun sitting on its sill
    m = 70 * s
    W2, r2 = W - 2 * m, (W - 2 * m) / 2
    y2 = y0 + m
    sill = y0 + H - 130 * s
    d2 = (f'M{x0 + m:.1f} {sill:.1f} L{x0 + m:.1f} {y2 + r2:.1f} A{r2:.1f} {r2:.1f} 0 0 1 {x0 + m + W2:.1f} '
          f'{y2 + r2:.1f} L{x0 + m + W2:.1f} {sill:.1f} Z')
    mid = f'aw{next(_ids)}'
    mask = (f'<mask id="{mid}" maskUnits="userSpaceOnUse" x="0" y="0" width="1000" height="1000">'
            f'<rect width="1000" height="1000" fill="white"/><path d="{d2}" fill="black"/></mask>')
    sun_r = 66 * s
    # the sun half set on the sill, clipped by the window
    cid = f'awc{next(_ids)}'
    clip = f'<clipPath id="{cid}"><path d="{d2}"/></clipPath>'
    return (f'<defs>{mask}{clip}</defs><path d="{d}" fill="{c}" mask="url(#{mid})"/>'
            f'<g clip-path="url(#{cid})">{_c(500, sill, sun_r * 1.25, dot)}</g>')


def two_circles(c, dot, s=1.0, w=56):
    """Heard about it, and understood: a ring and a disc; where they overlap, the point."""
    r = 250 * s
    c1, c2 = (500 - 120 * s, 500), (500 + 120 * s, 500)
    mid = f'tc{next(_ids)}'
    lens_clip = f'<clipPath id="{mid}"><circle cx="{c2[0]:.1f}" cy="{c2[1]:.1f}" r="{r:.1f}"/></clipPath>'
    ring = _p(ring_seg(c1[0], c1[1], r + w / 2, r - w / 2, 0, 360 - 1e-3), c)
    disc = _c(c2[0], c2[1], r, c)
    lens = f'<g clip-path="url(#{mid})">{_c(c1[0], c1[1], r - w / 2, dot)}</g>'
    return f'<defs>{lens_clip}</defs>{ring}{disc}{lens}'


def fib_spiral(c, dot, s=1.0, w=74):
    """Going deeper: a spiral of quarter circles (each one smaller by the golden ratio) round a point."""
    phi = (1 + 5 ** 0.5) / 2
    pts = []
    r = 300 * s
    # start at the outside, turning inwards clockwise
    cx, cy = 500 + 60 * s, 500 + 40 * s
    a = 180
    centre = np.array([cx, cy])
    for i in range(5):
        seg = arc(centre[0], centre[1], r, a, a + 90, 60)
        pts.append(seg)
        end = seg[-1]
        r2 = r / phi
        # the next centre lies on the line from the end point to the current centre
        v = (centre - end) / np.linalg.norm(centre - end)
        centre = end + v * r2
        r = r2
        a += 90
    line = join(*pts)
    last = line[-1]
    return _p(stroke_outline(line, w * s), c) + _c(centre[0], centre[1], 48 * s, dot)


def fold_bubble(c_lit, c_shade, dot=None, s=1.0):
    """A speech bubble folded like paper: everyone's talking about it, and we unfold it (a lit face and a shade
    face, the films' light and shade)."""
    r = 300 * s
    cx, cy = 500, 500
    # a circle with its lower-left quarter squared off (the tail)
    d = (f'M{cx - r:.1f} {cy:.1f} A{r:.1f} {r:.1f} 0 1 1 {cx:.1f} {cy + r:.1f} L{cx - r:.1f} {cy + r:.1f} Z')
    cid = f'fb{next(_ids)}'
    # the fold: a diagonal from upper left to lower right; the lower part is the shade face
    fold = f'M{cx - r - 10:.1f} {cy - r - 10:.1f} L{cx + r + 10:.1f} {cy + r + 10:.1f} L{cx - r - 10:.1f} {cy + r + 10:.1f} Z'
    out = f'<defs><clipPath id="{cid}"><path d="{d}"/></clipPath></defs><path d="{d}" fill="{c_lit}"/>'
    out += f'<g clip-path="url(#{cid})"><path d="{fold}" fill="{c_shade}"/></g>'
    if dot:
        out += _c(cx + 70 * s, cy - 70 * s, 56 * s, dot)
    return out


def pip_coin(c, s=1.0, gap=50):
    """Pip pressed into a coin: a solid disc where three cuts draw the head, the ears and the trunk. No face."""
    R = 400 * s
    mid = f'pc{next(_ids)}'
    hx, hy, hr = 500, 450, 205 * s
    g = gap * s
    # cuts: the head's sides (arcs), and the trunk as a channel
    left = ring_seg(hx, hy, hr + g / 2, hr - g / 2, 105, 235)
    right = ring_seg(hx, hy, hr + g / 2, hr - g / 2, -55, 75)
    trunk_c = bez((500, 520), (500, 610), (494, 700), (500, 760), 40)
    curl = arc(584, 760, 84 * s, 180, 40, 60)
    line = join(trunk_c, curl)
    tw = 110 * s
    trunk_outer = stroke_outline(line, tw + 2 * g)
    trunk = stroke_outline(line, tw)
    m = (f'<mask id="{mid}" maskUnits="userSpaceOnUse" x="0" y="0" width="1000" height="1000">'
         f'<circle cx="500" cy="500" r="{R:.1f}" fill="white"/>'
         f'<path d="{left}" fill="black"/><path d="{right}" fill="black"/>'
         f'<path d="{trunk_outer}" fill="black"/><path d="{trunk}" fill="white"/></mask>')
    return f'<defs>{m}</defs><rect width="1000" height="1000" fill="{c}" mask="url(#{mid})"/>'


CANDIDATES = [
    ('arc + point', arc_point),
    ('split sphere', split_sphere),
    ('echo', echo),
    ('calm centre', calm_centre),
    ('arch window', arch_window),
    ('two circles', two_circles),
    ('golden spiral', fib_spiral),
    ('fold bubble', None),
    ('pip coin', None),
]


# ---------------------------------------------------------------- refined (round 3 picks)
def fold(c_lit, c_shade, dot=None, s=1.0, r=300, cx=500, cy=500, dot_r=52, dot_at=0.42):
    """THE FOLD: a speech bubble (a circle with one square corner, the tail) folded along its diagonal into a lit
    face and a shade face. Everyone's talking about it; we unfold it. The point sits on the lit face."""
    r = r * s
    d = (f'M{cx - r:.2f} {cy:.2f} A{r:.2f} {r:.2f} 0 1 1 {cx:.2f} {cy + r:.2f} L{cx - r:.2f} {cy + r:.2f} Z')
    # the shade face: everything below the diagonal through the centre (upper left to lower right)
    k = 2 * r
    shade = (f'M{cx - k:.2f} {cy - k:.2f} L{cx + k:.2f} {cy + k:.2f} L{cx - k:.2f} {cy + k:.2f} Z')
    cid = f'fd{next(_ids)}'
    out = (f'<defs><clipPath id="{cid}"><path d="{d}"/></clipPath></defs><path d="{d}" fill="{c_lit}"/>'
           f'<g clip-path="url(#{cid})"><path d="{shade}" fill="{c_shade}"/></g>')
    if dot:
        q = dot_at * r
        out += _c(cx + q, cy - q, dot_r * s, dot)
    return out


def fold_mono(c, s=1.0, r=300, cx=500, cy=500, gap=26, dot=True, dot_r=52, dot_at=0.42):
    """One colour: the fold becomes a cut along the diagonal; the point a hole."""
    r = r * s
    d = (f'M{cx - r:.2f} {cy:.2f} A{r:.2f} {r:.2f} 0 1 1 {cx:.2f} {cy + r:.2f} L{cx - r:.2f} {cy + r:.2f} Z')
    mid = f'fm{next(_ids)}'
    g = gap * s / 2 * 2 ** 0.5
    k = 2 * r
    cut = (f'M{cx - k - g:.2f} {cy - k + g:.2f} L{cx - k + g:.2f} {cy - k - g:.2f} L{cx + k + g:.2f} {cy + k - g:.2f} '
           f'L{cx + k - g:.2f} {cy + k + g:.2f} Z')
    hole = ''
    if dot:
        q = dot_at * r
        hole = _c(cx + q, cy - q, dot_r * s, 'black')
    m = (f'<mask id="{mid}" maskUnits="userSpaceOnUse" x="-500" y="-500" width="2000" height="2000">'
         f'<path d="{d}" fill="white"/><path d="{cut}" fill="black"/>{hole}</mask>')
    return f'<defs>{m}</defs><rect x="-500" y="-500" width="2000" height="2000" fill="{c}" mask="url(#{mid})"/>'


def question(c, dot, s=1.0, cx=500, cy=436, R=200, w=116, gap=74, dot_r=78):
    """THE QUESTION: the question mark reduced to its two parts, an open ring and the point; flat cut ends, no stem."""
    R, w, gap, dot_r = R * s, w * s, gap * s, dot_r * s
    d = ring_seg(cx, cy, R + w / 2, R - w / 2, 180, 450 - 1e-3)
    return _p(d, c) + _c(cx, cy + R + w / 2 + gap + dot_r, dot_r, dot)


def window(c, sun, s=1.0, cx=500, cy=500, W=400, H=640, m=50, sill=112, sun_r=104):
    """THE WINDOW: an arched window with the low sun setting on its sill: our cozy window, the posters'
    architecture; a small window onto a big story."""
    W, H, m, sill, sun_r = W * s, H * s, m * s, sill * s, sun_r * s
    x0, y0 = cx - W / 2, cy - H / 2
    r = W / 2
    outer = (f'M{x0:.2f} {y0 + H:.2f} L{x0:.2f} {y0 + r:.2f} A{r:.2f} {r:.2f} 0 0 1 {x0 + W:.2f} {y0 + r:.2f} '
             f'L{x0 + W:.2f} {y0 + H:.2f} Z')
    W2, r2 = W - 2 * m, (W - 2 * m) / 2
    yb = y0 + H - sill
    inner = (f'M{x0 + m:.2f} {yb:.2f} L{x0 + m:.2f} {y0 + m + r2:.2f} A{r2:.2f} {r2:.2f} 0 0 1 {x0 + m + W2:.2f} '
             f'{y0 + m + r2:.2f} L{x0 + m + W2:.2f} {yb:.2f} Z')
    mid, cid = f'wm{next(_ids)}', f'wc{next(_ids)}'
    return (f'<defs><mask id="{mid}" maskUnits="userSpaceOnUse" x="-500" y="-500" width="2000" height="2000">'
            f'<path d="{outer}" fill="white"/><path d="{inner}" fill="black"/></mask>'
            f'<clipPath id="{cid}"><path d="{inner}"/></clipPath></defs>'
            f'<path d="{outer}" fill="{c}" mask="url(#{mid})"/>'
            f'<g clip-path="url(#{cid})">{_c(cx, yb, sun_r, sun)}</g>')


def eclipse(c, dot, s=1.0, cx=500, cy=500, r=270, off=150):
    """Two circles: what you heard, and what you understand; where they overlap, the point."""
    r, off = r * s, off * s
    c1, c2 = (cx - off / 2, cy), (cx + off / 2, cy)
    cid = f'ec{next(_ids)}'
    return (f'<defs><clipPath id="{cid}"><circle cx="{c1[0]:.2f}" cy="{c1[1]:.2f}" r="{r:.2f}"/></clipPath></defs>'
            f'{_c(c2[0], c2[1], r, c)}<g clip-path="url(#{cid})">{_c(c2[0], c2[1], r, dot)}</g>')
