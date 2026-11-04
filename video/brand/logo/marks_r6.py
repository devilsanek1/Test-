"""Round 6 (owner, 2026-10-29: "I said no elephant", "Too many details who would use this logo", "No from scratch pick
up the modern logos and do it again"): modern marks, each one idea in a few bold shapes, built the way today's strong
marks are built (one line, an overlap, modular pieces, one cut). No text, no elephant, no scene. 1000 x 1000 box."""
import itertools
import math

import numpy as np

from logo_lib import arc, bez, join, stroke_outline, poly_d

_ids = itertools.count(1)
INK, CREAM, CORAL, VIOLET, SUN, TEAL = '#1F1630', '#F7EDE3', '#F0643C', '#6A5CFF', '#FFC24B', '#12A58C'


def _uid(p):
    return f'{p}{next(_ids)}'


def _c(cx, cy, r, fill):
    return f'<circle cx="{cx:.2f}" cy="{cy:.2f}" r="{r:.2f}" fill="{fill}"/>'


def _p(d, fill):
    return f'<path d="{d}" fill="{fill}"/>'


def bubble(cx, cy, r, tail_ang=135, tail_len=1.5, tail_w=34, curve=0.0):
    """A round speech bubble as one closed path: the circle and a tail leaving it at tail_ang (screen degrees)."""
    a = math.radians(tail_ang)
    half = math.radians(tail_w / 2)
    p1 = (cx + r * math.cos(a - half), cy + r * math.sin(a - half))
    p2 = (cx + r * math.cos(a + half), cy + r * math.sin(a + half))
    tip = (cx + r * tail_len * math.cos(a + curve), cy + r * tail_len * math.sin(a + curve))
    return (f'M{p2[0]:.2f} {p2[1]:.2f} A{r:.2f} {r:.2f} 0 1 1 {p1[0]:.2f} {p1[1]:.2f} '
            f'L{tip[0]:.2f} {tip[1]:.2f} Z')


# ---------------------------------------------------------------- 1. ONE LINE: a bubble drawn in a single stroke, and the point
def one_line(line=INK, dot=CORAL, w=74):
    cx, cy, r = 500, 462, 268
    start = np.array([262.0, 842.0])
    a0, a1 = 128, 128 + 330
    ring = arc(cx, cy, r, a0, a1, 260)
    lead = bez(start, start + np.array([22, -62]), ring[0] + np.array([-34, 40]), ring[0], 40)
    path = join(lead, ring)
    return _p(stroke_outline(path, w), line) + _c(cx, cy, 78, dot)


# ---------------------------------------------------------------- 2. TWO VOICES: two bubbles; where they overlap, it's clear
def two_voices(left=VIOLET, right=CORAL, overlap=INK):
    r = 250
    L = bubble(390, 470, r, tail_ang=128, tail_len=1.42)
    R = bubble(610, 470, r, tail_ang=52, tail_len=1.42)
    cid = _uid('tv')
    return (f'<defs><clipPath id="{cid}"><path d="{L}"/></clipPath></defs>'
            + _p(L, left) + _p(R, right) + f'<g clip-path="url(#{cid})">{_p(R, overlap)}</g>')


# ---------------------------------------------------------------- 3. THE PEEL: a bubble with its corner peeled back
def peel(body=CORAL, flap=CREAM, chord=0.42):
    """The bubble's upper right corner folds back along a chord; the flap (the cut-off cap, mirrored over the chord)
    shows the light underside: what everyone's talking about, peeled open."""
    cx, cy, r = 488, 488, 300
    d_bub = bubble(cx, cy, r, tail_ang=135, tail_len=1.45)
    # the chord: perpendicular to the 45-degree diagonal, at distance chord*r from the centre (towards the upper right)
    u = np.array([math.cos(math.radians(-45)), math.sin(math.radians(-45))])
    m = np.array([cx, cy]) + u * chord * r
    t = np.array([u[1], -u[0]])
    h = math.sqrt(r * r - (chord * r) ** 2)
    q1, q2 = m + t * h, m - t * h
    # the cap beyond the chord, cut away from the body
    a1 = math.degrees(math.atan2(q1[1] - cy, q1[0] - cx))
    a2 = math.degrees(math.atan2(q2[1] - cy, q2[0] - cx))
    cap = arc(cx, cy, r, a1, a2 if a2 > a1 else a2 + 360, 120)
    if np.linalg.norm(cap[len(cap) // 2] - (np.array([cx, cy]) + u * r)) > r * 0.5:
        cap = arc(cx, cy, r, a2, a1 if a1 > a2 else a1 + 360, 120)
    # mirror the cap over the chord: the flap lies on the body
    def mirror(p):
        v = p - m
        return m + v - 2 * np.dot(v, u) * u
    flap_pts = np.array([mirror(p) for p in cap])
    mid = _uid('pm')
    cut = poly_d(np.concatenate([cap, [q2 + u * 2000, q1 + u * 2000]]), close=True) if False else None
    big = 3000
    keep = poly_d(np.array([q1 - u * big + t * big, q2 - u * big - t * big, q2 - t * big, q1 + t * big]), close=True)
    side = poly_d(np.array([m + t * big, m + t * big - u * big, m - t * big - u * big, m - t * big]), close=True)
    return (f'<defs><clipPath id="{mid}"><path d="{side}"/></clipPath></defs>'
            f'<g clip-path="url(#{mid})">{_p(d_bub, body)}</g>' + _p(poly_d(flap_pts, close=True), flap))


# ---------------------------------------------------------------- 4. EVERY SIDE: four voices turning round one point
def every_side(cols=(CORAL, VIOLET, SUN, TEAL), centre=None):
    """Four speech bubbles, each a quarter turn from the last, their tails pointing in: everyone's talking, from every
    side, about one thing."""
    out = ''
    for i, col in enumerate(cols):
        a = math.radians(-135 + 90 * i)
        cx, cy = 500 + 205 * math.cos(a), 500 + 205 * math.sin(a)
        tail = math.degrees(a) + 180 + 26
        out += _p(bubble(cx, cy, 150, tail_ang=tail, tail_len=1.55, tail_w=40), col)
    if centre:
        out += _c(500, 500, 40, centre)
    return out


# ---------------------------------------------------------------- 5. PLAY THE TALK: a bubble, and in it a play button
def play_talk(body=CREAM, cut=CORAL):
    cx, cy, r = 500, 476, 300
    d = bubble(cx, cy, r, tail_ang=132, tail_len=1.44)
    # a rounded play triangle as negative space
    s = 128
    pts = np.array([[cx - s * 0.62, cy - s], [cx + s * 1.05, cy], [cx - s * 0.62, cy + s]])
    rr = 34
    tri = _round_poly(pts, rr)
    return _p(d, body) + _p(tri, cut)


def _round_poly(pts, r):
    """A convex polygon with rounded corners, as a path."""
    n = len(pts)
    segs = []
    for i in range(n):
        p0, p1, p2 = pts[i - 1], pts[i], pts[(i + 1) % n]
        v1 = (p0 - p1) / np.linalg.norm(p0 - p1)
        v2 = (p2 - p1) / np.linalg.norm(p2 - p1)
        ang = math.acos(np.clip(np.dot(v1, v2), -1, 1))
        dcut = r / math.tan(ang / 2)
        a, b = p1 + v1 * dcut, p1 + v2 * dcut
        segs.append((a, p1, b))
    d = f'M{segs[0][2][0]:.2f} {segs[0][2][1]:.2f} '
    for i in range(1, n + 1):
        a, c, b = segs[i % n]
        d += f'L{a[0]:.2f} {a[1]:.2f} Q{c[0]:.2f} {c[1]:.2f} {b[0]:.2f} {b[1]:.2f} '
    return d + 'Z'


# ---------------------------------------------------------------- 6. THE FUSS: the point, and the buzz around it
def the_fuss(dot=CORAL, marks=INK):
    """A point with three short strokes flying off it: something everyone's buzzing about."""
    out = _c(452, 548, 190, dot)
    w = 64
    for ang, r0, r1 in ((-90, 290, 400), (-45, 290, 410), (0, 290, 400)):
        a = math.radians(ang)
        p0 = np.array([452 + r0 * math.cos(a), 548 + r0 * math.sin(a)])
        p1 = np.array([452 + r1 * math.cos(a), 548 + r1 * math.sin(a)])
        out += _p(stroke_outline(np.array([p0, p1]), w), marks)
    return out


# ---------------------------------------------------------------- refined picks and their one-colour versions
def _mask(col, white, black):
    mid = _uid('m6')
    return (f'<defs><mask id="{mid}" maskUnits="userSpaceOnUse" x="-500" y="-500" width="2000" height="2000">'
            f'<rect x="-500" y="-500" width="2000" height="2000" fill="black"/>{white}{black}</mask></defs>'
            f'<rect x="-500" y="-500" width="2000" height="2000" fill="{col}" mask="url(#{mid})"/>')


def _voices_paths():
    r = 250
    return bubble(388, 470, r, tail_ang=128, tail_len=1.42), bubble(612, 470, r, tail_ang=52, tail_len=1.42)


def two_voices_mono(col, gap=30):
    """One colour: both bubbles, the overlap cut out as the lens of light."""
    L, R = _voices_paths()
    cid = _uid('tvm')
    white = _p(L, 'white') + _p(R, 'white')
    black = (f'<clipPath id="{cid}"><path d="{L}"/></clipPath>'
             f'<g clip-path="url(#{cid})"><path d="{R}" fill="black"/></g>')
    # keep the lens as a solid shape inside the cut, parted by a gap
    lens_in = (f'<g clip-path="url(#{cid})"><path d="{R}" fill="white" transform="translate(0 0)"/></g>')
    ring = (f'<g clip-path="url(#{cid})"><path d="{R}" fill="none" stroke="black" stroke-width="{2 * gap}"/></g>'
            f'<path d="{L}" fill="none" stroke="black" stroke-width="0"/>')
    return _mask(col, white, black + lens_in + ring)


def peel2(body=CORAL, flap=CREAM):
    return peel(body, flap, chord=0.56)


def peel2_mono(col, gap=28):
    """One colour: the bubble's body and the flap, parted by a clean gap along the flap's edge."""
    art = peel(body='white', flap='black', chord=0.56)
    flap_d = art[art.rindex('<path d="') + 9:art.rindex('" fill="black"/>')]
    white = art.replace(f'<path d="{flap_d}" fill="black"/>', '')
    black = (f'<path d="{flap_d}" fill="black" stroke="black" stroke-width="{2 * gap}" stroke-linejoin="round"/>'
             f'<path d="{flap_d}" fill="white"/>')
    return _mask(col, white, black)


def play2(body=CREAM, cut=CORAL):
    return play_talk(body, cut)


def play2_mono(col):
    return _mask(col, play_talk('white', 'black'), '')
