"""The three directions' marks and lockups. Marks are drawn in a 1000 x 1000 box centred on (500, 500).
Fills only: no strokes, no outlines, no hairlines; text is outlined to paths (logo_lib.text_path)."""
import itertools
import math

import numpy as np

from logo_lib import PAL, arc, bez, join, stroke_outline, circle_d, text_path

_ids = itertools.count(1)


def _p(d, fill):
    return f'<path d="{d}" fill="{fill}"/>'


def _wrap(body, bb, scale, cx=500, cy=500):
    """Place a body whose visual bbox is bb, scaled, centred on (cx, cy)."""
    bx, by = (bb[0] + bb[2]) / 2, (bb[1] + bb[3]) / 2
    return (f'<g transform="translate({cx:.1f} {cy:.1f}) scale({scale:.4f}) translate({-bx:.1f} {-by:.1f})">'
            f'{body}</g>')


def _split_dot(d):
    """Split an outlined '?' into its hook and its dot (the last closed subpath)."""
    subs = [s for s in d.split('M') if s.strip()]
    return 'M' + 'M'.join(subs[:-1]), 'M' + subs[-1]


# ================================================================ 1. THE WORDMARK: "fuss about?" + the "f?" monogram
FRAUNCES = {'SOFT': 100, 'opsz': 144, 'wght': 760, 'WONK': 0}


def mono_fq(c_text, c_dot, size=600, cx=500, cy=500, gap=0.0):
    """'f?' in Fraunces Soft, optically centred on (cx, cy); the two hooks rhyme. The dot is 'the point'."""
    _, bb_f, adv_f = text_path('fraunces', 'f', size, variations=FRAUNCES)
    _, bb_q, _ = text_path('fraunces', '?', size, variations=FRAUNCES)
    x_q = adv_f + gap * size
    x0, x1 = min(bb_f[0], bb_q[0] + x_q), max(bb_f[2], bb_q[2] + x_q)
    y0, y1 = min(bb_f[1], bb_q[1]), max(bb_f[3], bb_q[3])
    ox, oy = cx - (x0 + x1) / 2, cy - (y0 + y1) / 2
    d_f, _, _ = text_path('fraunces', 'f', size, x=ox, y=oy, variations=FRAUNCES)
    d_q, _, _ = text_path('fraunces', '?', size, x=ox + x_q, y=oy, variations=FRAUNCES)
    hook, dot = _split_dot(d_q)
    return _p(d_f, c_text) + _p(hook, c_text) + _p(dot, c_dot)


def lockup_wordmark(c_text, c_dot, c_kicker=None):
    """The stacked masthead: a tracked kicker WHAT'S ALL THE over 'fuss / about?' in Fraunces Soft.
    Returns (body, w, h)."""
    S = 300
    lead = 0.86 * S
    pad = 0
    _, bb_a, adv_a = text_path('fraunces', 'about?', S, variations=FRAUNCES)
    _, bb_f, adv_f = text_path('fraunces', 'fuss', S, variations=FRAUNCES)
    W = bb_a[2] - bb_a[0]
    # kicker: Jost 500, tracked to the exact width of "about?"
    ks = 0.205 * S
    _, bb_k0, _ = text_path('jost', "WHAT’S ALL THE", ks)
    n_gaps = len("WHAT’S ALL THE") - 1
    track = ((W - (bb_k0[2] - bb_k0[0])) / n_gaps) / ks
    # vertical stack
    y_k = 0
    d_k, bb_k, _ = text_path('jost', "WHAT’S ALL THE", ks, x=-bb_k0[0], y=y_k, tracking=track)
    cap_k = bb_k[3] - bb_k[1]
    y_f = y_k + 0.30 * S + (-bb_f[1])  # gap under the kicker, then the ascender of f
    d_f, bbf, _ = text_path('fraunces', 'fuss', S, x=-bb_a[0], y=y_f, variations=FRAUNCES)
    y_a = y_f + lead
    d_a, bba, _ = text_path('fraunces', 'about?', S, x=-bb_a[0], y=y_a, variations=FRAUNCES)
    hook, dot = _split_dot(d_a)
    top, bottom = bb_k[1], bba[3]
    body = (_p(d_k, c_kicker or c_text) + _p(d_f, c_text) + _p(hook, c_text) + _p(dot, c_dot))
    w, h = W, bottom - top
    return f'<g transform="translate(0 {-top:.1f})">{body}</g>', w, h


def lockup_wordmark_line(c_text, c_dot):
    """One line, for banners and end cards: What's All the Fuss About? (Fraunces Soft)."""
    S = 200
    d, bb, _ = text_path('fraunces', "What’s All the Fuss About?", S, variations=FRAUNCES)
    hook, dot = _split_dot(d)
    body = _p(hook, c_text) + _p(dot, c_dot)
    return f'<g transform="translate({-bb[0]:.1f} {-bb[1]:.1f})">{body}</g>', bb[2] - bb[0], bb[3] - bb[1]


# ================================================================ 2. THE POINT: a question that stops going round in circles
def q_spiral_paths(w=94, R=226, cx=500, cy=380, r_in=76, k=1.25, stem_x=516, stem_top=706, stem_len=28,
                   dot_r=64, dot_gap=70):
    """A question mark whose hook winds in as a spiral (going round in circles), straightens into the stem and
    lands on the dot (the point). Returns (hook_d, dot_d, bbox)."""
    a = np.linspace(-360, -180, 180)  # the inner curl, from right of centre round the bottom to the left
    f = ((a + 360) / 180) ** k
    r = r_in + (R - r_in) * f
    curl = np.stack([cx + r * np.cos(np.radians(a)), cy + r * np.sin(np.radians(a))], 1)
    bowl = arc(cx, cy, R, -180, 24, 220)
    P = bowl[-1]
    ta = math.radians(24)
    tan = np.array([-math.sin(ta), math.cos(ta)])
    S0 = np.array([stem_x, stem_top])
    junction = bez(P, P + 118 * tan, S0 - np.array([0, 118]), S0, 70)
    stem = np.array([S0, S0 + np.array([0, stem_len])])
    line = join(curl, bowl, junction, stem)
    hook = stroke_outline(line, w)
    dot_cy = stem_top + stem_len + w / 2 + dot_gap + dot_r
    bb = (cx - R - w / 2, cy - R - w / 2, cx + R + w / 2, dot_cy + dot_r)
    return hook, circle_d(stem_x, dot_cy, dot_r), bb


def mark_point(c_hook, c_dot, scale=1.0, cx=500, cy=500):
    hook, dot, bb = q_spiral_paths()
    return _wrap(_p(hook, c_hook) + _p(dot, c_dot), bb, scale, cx, cy)


def lockup_point(c_mark, c_dot, c_text):
    """The spiral question beside the name in Bricolage Grotesque ExtraBold, two lines."""
    S = 150
    var = {'wght': 800, 'opsz': 96, 'wdth': 100}
    _, bb1, _ = text_path('bricolage', "What’s All the", S, variations=var)
    _, bb2, _ = text_path('bricolage', 'Fuss About?', S, variations=var)
    lead = 1.02 * S
    hook, dot, bbm = q_spiral_paths()
    # the mark spans from the first line's cap top to the second line's baseline, a bit taller
    text_top = bb1[1]
    text_h = lead + (-bb1[1])
    mark_h = text_h * 1.16
    sc = mark_h / (bbm[3] - bbm[1])
    mark_w = (bbm[2] - bbm[0]) * sc
    gap = 0.36 * S
    x_t = mark_w + gap
    y1 = -text_top + (mark_h - text_h) / 2
    d1, b1, _ = text_path('bricolage', "What’s All the", S, x=x_t - bb1[0], y=y1, variations=var)
    d2, b2, _ = text_path('bricolage', 'Fuss About?', S, x=x_t - bb2[0], y=y1 + lead, variations=var)
    h2, dot2 = _split_dot(d2)
    m = (f'<g transform="scale({sc:.4f}) translate({-bbm[0]:.1f} {-bbm[1]:.1f})">'
         f'{_p(hook, c_mark)}{_p(dot, c_dot)}</g>')
    body = m + _p(d1, c_text) + _p(h2, c_text) + _p(dot2, c_dot)
    w = x_t + max(b1[2], b2[2]) - x_t
    return body, max(b1[2], b2[2]), mark_h


# ================================================================ 3. PIP: big ears (heard it all), never forgets
def _pip_geo(s=1.0, cx=500, cy=500):
    """Pip from the front, built from circles and one curve. Coordinates designed round (500, 520)."""
    def T(x, y):
        return cx + (x - 500) * s, cy + (y - 500) * s
    g = {}
    g['ears'] = []
    for sgn in (-1, 1):
        ex, ey = T(500 + sgn * 226, 486)
        ix, iy = T(500 + sgn * 258, 500)
        g['ears'].append(dict(cx=ex, cy=ey, rx=170 * s, ry=198 * s, rot=-sgn * 14,
                              icx=ix, icy=iy, irx=100 * s, iry=134 * s))
    hx, hy = T(500, 452)
    g['head'] = (hx, hy, 202 * s)
    down = bez((500, 500), (500, 590), (494, 664), (500, 712), 40)
    curl = arc(572, 712, 72, 180, 18, 70)
    line = join(down, curl)
    g['trunk_line'] = np.array([T(x, y) for x, y in line])
    g['trunk_w'] = 106 * s
    g['eyes'] = [(*T(500 + sgn * 80, 440), 26 * s) for sgn in (-1, 1)]
    g['cheeks'] = [(*T(500 + sgn * 134, 512), 28 * s) for sgn in (-1, 1)]
    return g


def _ell(e, fill, inner=False):
    if inner:
        return (f'<ellipse cx="{e["icx"]:.1f}" cy="{e["icy"]:.1f}" rx="{e["irx"]:.1f}" ry="{e["iry"]:.1f}" '
                f'transform="rotate({e["rot"]} {e["icx"]:.1f} {e["icy"]:.1f})" fill="{fill}"/>')
    return (f'<ellipse cx="{e["cx"]:.1f}" cy="{e["cy"]:.1f}" rx="{e["rx"]:.1f}" ry="{e["ry"]:.1f}" '
            f'transform="rotate({e["rot"]} {e["cx"]:.1f} {e["cy"]:.1f})" fill="{fill}"/>')


def mark_pip(c_head, c_ear, c_inner, c_eye, c_cheek=None, s=1.0, cx=500, cy=500):
    """Two flat tones of one periwinkle (lit head, shade ears) part the shapes: no outline anywhere."""
    g = _pip_geo(s, cx, cy)
    out = ''.join(_ell(e, c_ear) + _ell(e, c_inner, True) for e in g['ears'])
    hx, hy, hr = g['head']
    out += f'<circle cx="{hx:.1f}" cy="{hy:.1f}" r="{hr:.1f}" fill="{c_head}"/>'
    out += _p(stroke_outline(g['trunk_line'], g['trunk_w']), c_head)
    if c_cheek:
        out += ''.join(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{r:.1f}" fill="{c_cheek}"/>' for x, y, r in g['cheeks'])
    out += ''.join(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{r:.1f}" fill="{c_eye}"/>' for x, y, r in g['eyes'])
    return out


def mark_pip_mono(color, s=1.0, cx=500, cy=500, gap=26):
    """One colour: the same Pip as a single fill with knock-outs (a gap parts the head from the ears; the eyes
    are holes), so it works on any background, photo or video."""
    g = _pip_geo(s, cx, cy)
    mid = f'pipm{next(_ids)}'
    hx, hy, hr = g['head']
    trunk = stroke_outline(g['trunk_line'], g['trunk_w'])
    trunk_gap = stroke_outline(g['trunk_line'], g['trunk_w'] + 2 * gap * s)
    m = (f'<mask id="{mid}" maskUnits="userSpaceOnUse" x="0" y="0" width="1000" height="1000">'
         f'<rect width="1000" height="1000" fill="black"/>'
         + ''.join(_ell(e, 'white') for e in g['ears'])
         + f'<circle cx="{hx:.1f}" cy="{hy:.1f}" r="{hr + gap * s:.1f}" fill="black"/>'
         + _p(trunk_gap, 'black')
         + f'<circle cx="{hx:.1f}" cy="{hy:.1f}" r="{hr:.1f}" fill="white"/>'
         + _p(trunk, 'white')
         + ''.join(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{r:.1f}" fill="black"/>' for x, y, r in g['eyes'])
         + '</mask>')
    return f'<defs>{m}</defs><rect width="1000" height="1000" fill="{color}" mask="url(#{mid})"/>'


PIP_BB = (500 - 226 - 175, 452 - 202 - 10, 500 + 226 + 175, 712 + 72 + 53)


def pip_question(c_head, c_ear, c_inner, c_eye, s=1.0, cx=500, cy=500):
    """Pose B: Pip raises the trunk to sniff the air (the curious 'what's all the fuss about?'); the trunk curls
    into a question mark's hook and the head is its dot."""
    def T(x, y):
        return cx + (x - 500) * s, cy + (y - 500) * s
    parts = []
    for sgn in (-1, 1):
        ex, ey = T(500 + sgn * 170, 702)
        parts.append(f'<ellipse cx="{ex:.1f}" cy="{ey:.1f}" rx="{126 * s:.1f}" ry="{150 * s:.1f}" '
                     f'transform="rotate({-sgn * 14} {ex:.1f} {ey:.1f})" fill="{c_ear}"/>')
        ix, iy = T(500 + sgn * 194, 714)
        parts.append(f'<ellipse cx="{ix:.1f}" cy="{iy:.1f}" rx="{74 * s:.1f}" ry="{100 * s:.1f}" '
                     f'transform="rotate({-sgn * 14} {ix:.1f} {iy:.1f})" fill="{c_inner}"/>')
    hx, hy = T(500, 680)
    parts.append(f'<circle cx="{hx:.1f}" cy="{hy:.1f}" r="{152 * s:.1f}" fill="{c_head}"/>')
    up = bez((500, 720), (500, 640), (500, 520), (500, 470), 40)
    hook_c, R = (500, 296), 148
    P = np.array([hook_c[0] + R * math.cos(math.radians(40)), hook_c[1] + R * math.sin(math.radians(40))])
    s_curve = bez((500, 470), (500, 420), P + np.array([-60, 70]), P, 40)
    hook = arc(hook_c[0], hook_c[1], R, 40, -200, 200)
    line = np.array([T(x, y) for x, y in join(up, s_curve, hook)])
    parts.append(_p(stroke_outline(line, 92 * s), c_head))
    for sgn in (-1, 1):
        ex, ey = T(500 + sgn * 62, 682)
        parts.append(f'<circle cx="{ex:.1f}" cy="{ey:.1f}" r="{20 * s:.1f}" fill="{c_eye}"/>')
    return ''.join(parts)


def lockup_pip(c_head, c_ear, c_inner, c_eye, c_text, c_dot):
    """Pip beside the name in Patrick Hand, the films' caption hand (one look, one brand)."""
    S = 190
    _, bb1, _ = text_path('patrick', "What’s All the", S)
    _, bb2, _ = text_path('patrick', 'Fuss About?', S)
    lead = 0.98 * S
    text_h = lead + (-bb1[1])
    bbm = PIP_BB
    mark_h = text_h * 1.32
    sc = mark_h / (bbm[3] - bbm[1])
    mark_w = (bbm[2] - bbm[0]) * sc
    gap = 0.22 * S
    x_t = mark_w + gap
    y1 = -bb1[1] + (mark_h - text_h) / 2 + 0.02 * S
    d1, b1, _ = text_path('patrick', "What’s All the", S, x=x_t - bb1[0], y=y1)
    d2, b2, _ = text_path('patrick', 'Fuss About?', S, x=x_t - bb2[0], y=y1 + lead)
    h2, dot2 = _split_dot(d2)
    m = (f'<g transform="scale({sc:.4f}) translate({-bbm[0]:.1f} {-bbm[1]:.1f})">'
         f'{mark_pip(c_head, c_ear, c_inner, c_eye)}</g>')
    body = m + _p(d1, c_text) + _p(h2, c_text) + _p(dot2, c_dot)
    return body, max(b1[2], b2[2]), mark_h


# ================================================================ ROUND 2 (owner, 2026-10-29: "The logo should not contain any text")
def _crescent(c1, c2, r, n=900):
    """The shade face of a ball lit from c2's side: the part of circle (c1, r) outside circle (c2, r)."""
    a = np.linspace(0, 2 * math.pi, n, endpoint=False)
    p1 = np.stack([c1[0] + r * np.cos(a), c1[1] + r * np.sin(a)], 1)
    out = np.hypot(p1[:, 0] - c2[0], p1[:, 1] - c2[1]) > r
    i0 = int(np.argmax(~out & np.roll(out, -1))) + 1  # first index of the outside run
    arc1 = np.roll(p1, -i0, axis=0)[:int(out.sum())]
    p2 = np.stack([c2[0] + r * np.cos(a), c2[1] + r * np.sin(a)], 1)
    ins = np.hypot(p2[:, 0] - c1[0], p2[:, 1] - c1[1]) < r
    j0 = int(np.argmax(~ins & np.roll(ins, -1))) + 1
    arc2 = np.roll(p2, -j0, axis=0)[:int(ins.sum())]
    # walk c1's outer arc, then c2's inner arc back (choose the direction that closes the lune)
    if np.hypot(*(arc1[-1] - arc2[0])) > np.hypot(*(arc1[-1] - arc2[-1])):
        arc2 = arc2[::-1]
    from logo_lib import poly_d
    return poly_d(np.concatenate([arc1, arc2]), close=True)


def _pip2_geo(s=1.0, cx=500, cy=500):
    def T(x, y):
        return cx + (x - 500) * s, cy + (y - 500) * s
    g = {'s': s, 'T': T}
    g['ears'] = []
    for sgn in (-1, 1):
        ex, ey = T(500 + sgn * 232, 490)
        ix, iy = T(500 + sgn * 263, 507)
        g['ears'].append(dict(cx=ex, cy=ey, rx=176 * s, ry=205 * s, rot=-sgn * 14,
                              icx=ix, icy=iy, irx=104 * s, iry=140 * s))
    g['head'] = (*T(500, 452), 204 * s)
    g['lit'] = (*T(500 - 40, 452 - 30), 204 * s)
    down = bez((500, 500), (500, 590), (494, 664), (500, 712), 40)
    curl = arc(584, 712, 84, 180, 28, 70)
    g['trunk_line'] = np.array([T(x, y) for x, y in join(down, curl)])
    g['trunk_w'] = 106 * s
    g['eyes'] = [(*T(500 + sgn * 74, 462), 24 * s) for sgn in (-1, 1)]
    return g


PIP2_BB = (500 - 232 - 178, 452 - 204 - 8, 500 + 232 + 178, 712 + 84 + 53)


def mark_pip2(c_lit, c_shade, c_ear, c_inner, c_eye, s=1.0, cx=500, cy=500):
    """Pip, round 2: the head lit from the upper left with a shade face on the right (the films' volumes: a lit and a
    shade face, no outline), ears in the deeper shade, peach inside."""
    g = _pip2_geo(s, cx, cy)
    out = ''.join(_ell(e, c_ear) + _ell(e, c_inner, True) for e in g['ears'])
    hx, hy, hr = g['head']
    out += f'<circle cx="{hx:.1f}" cy="{hy:.1f}" r="{hr:.1f}" fill="{c_lit}"/>'
    out += _p(_crescent((hx, hy), g['lit'][:2], hr), c_shade)
    out += _p(stroke_outline(g['trunk_line'], g['trunk_w']), c_lit)
    out += ''.join(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{r:.1f}" fill="{c_eye}"/>' for x, y, r in g['eyes'])
    return out


def mark_pip2_mono(color, s=1.0, cx=500, cy=500, gap=26):
    g = _pip2_geo(s, cx, cy)
    mid = f'pipm{next(_ids)}'
    hx, hy, hr = g['head']
    trunk = stroke_outline(g['trunk_line'], g['trunk_w'])
    m = (f'<mask id="{mid}" maskUnits="userSpaceOnUse" x="-500" y="-500" width="2000" height="2000">'
         + ''.join(_ell(e, 'white') for e in g['ears'])
         + f'<circle cx="{hx:.1f}" cy="{hy:.1f}" r="{hr + gap * s:.1f}" fill="black"/>'
         + _p(stroke_outline(g['trunk_line'], g['trunk_w'] + 2 * gap * s), 'black')
         + f'<circle cx="{hx:.1f}" cy="{hy:.1f}" r="{hr:.1f}" fill="white"/>' + _p(trunk, 'white')
         + ''.join(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{r:.1f}" fill="black"/>' for x, y, r in g['eyes'])
         + '</mask>')
    return f'<defs>{m}</defs><rect x="-500" y="-500" width="2000" height="2000" fill="{color}" mask="url(#{mid})"/>'


def _peek_geo(s=1.0, cx=500, cy=500, ledge_w=760):
    """Pip peeking over a ledge: the dome of the head, the ears, the eyes, and the trunk hooked over the edge."""
    def T(x, y):
        return cx + (x - 500) * s, cy + (y - 500) * s
    g = {'s': s}
    g['ears'] = []
    for sgn in (-1, 1):
        ex, ey = T(500 + sgn * 214, 560)
        ix, iy = T(500 + sgn * 240, 578)
        g['ears'].append(dict(cx=ex, cy=ey, rx=150 * s, ry=178 * s, rot=-sgn * 18,
                              icx=ix, icy=iy, irx=88 * s, iry=118 * s))
    g['head'] = (*T(500, 588), 200 * s)
    g['lit'] = (*T(500 - 40, 588 - 30), 200 * s)
    g['eyes'] = [(*T(500 + sgn * 70, 548), 23 * s) for sgn in (-1, 1)]
    top = 640  # the ledge's top edge
    g['ledge_top'] = T(0, top)[1]
    g['ledge'] = (T(500 - ledge_w / 2, top), T(500 + ledge_w / 2, top), 300 * s)  # left, right, depth
    g['lip'] = 30 * s  # the lit top face of the ledge
    down = bez((500, 600), (500, 640), (500, 668), (500, 700), 20)
    curl = arc(560, 700, 60, 180, 30, 60)
    g['trunk_line'] = np.array([T(x, y) for x, y in join(down, curl)])
    g['trunk_w'] = 100 * s
    return g


PEEK_BB = (500 - 214 - 155, 588 - 200 - 6, 500 + 214 + 155, 640 + 300)


def mark_pip_peek(c_lit, c_shade, c_ear, c_inner, c_eye, c_wall, c_wall_top, s=1.0, cx=500, cy=500,
                  ledge_w=760, full_width=False, wall_r=40):
    g = _peek_geo(s, cx, cy, ledge_w)
    out = ''.join(_ell(e, c_ear) + _ell(e, c_inner, True) for e in g['ears'])
    hx, hy, hr = g['head']
    out += f'<circle cx="{hx:.1f}" cy="{hy:.1f}" r="{hr:.1f}" fill="{c_lit}"/>'
    out += _p(_crescent((hx, hy), g['lit'][:2], hr), c_shade)
    out += ''.join(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{r:.1f}" fill="{c_eye}"/>' for x, y, r in g['eyes'])
    (lx, ly), (rx, _), depth = g['ledge']
    if full_width:
        lx, rx, depth = -2000, 3000, 3000
    rr = 0 if full_width else wall_r * s
    out += (f'<rect x="{lx:.1f}" y="{ly:.1f}" width="{rx - lx:.1f}" height="{depth:.1f}" rx="{rr:.1f}" '
            f'fill="{c_wall}"/>')
    out += (f'<rect x="{lx:.1f}" y="{ly:.1f}" width="{rx - lx:.1f}" height="{g["lip"]:.1f}" rx="{min(rr, g["lip"] / 2):.1f}" '
            f'fill="{c_wall_top}"/>')
    out += _p(stroke_outline(g['trunk_line'], g['trunk_w']), c_lit)
    return out


def mark_pip_peek_mono(color, s=1.0, cx=500, cy=500, ledge_w=760, gap=24, wall_r=40):
    g = _peek_geo(s, cx, cy, ledge_w)
    mid = f'peekm{next(_ids)}'
    hx, hy, hr = g['head']
    (lx, ly), (rx, _), depth = g['ledge']
    rr = wall_r * g['s']
    trunk = stroke_outline(g['trunk_line'], g['trunk_w'])
    m = (f'<mask id="{mid}" maskUnits="userSpaceOnUse" x="-500" y="-500" width="2000" height="2000">'
         + ''.join(_ell(e, 'white') for e in g['ears'])
         + f'<circle cx="{hx:.1f}" cy="{hy:.1f}" r="{hr + gap * g["s"]:.1f}" fill="black"/>'
         + f'<circle cx="{hx:.1f}" cy="{hy:.1f}" r="{hr:.1f}" fill="white"/>'
         + ''.join(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{r:.1f}" fill="black"/>' for x, y, r in g['eyes'])
         + f'<rect x="{lx:.1f}" y="{ly - gap * g["s"]:.1f}" width="{rx - lx:.1f}" height="{depth + gap * g["s"]:.1f}" fill="black"/>'
         + f'<rect x="{lx:.1f}" y="{ly:.1f}" width="{rx - lx:.1f}" height="{depth:.1f}" rx="{rr:.1f}" fill="white"/>'
         + _p(stroke_outline(g['trunk_line'], g['trunk_w'] + 2 * gap * g['s']), 'black')
         + _p(trunk, 'white')
         + '</mask>')
    return f'<defs>{m}</defs><rect x="-500" y="-500" width="2000" height="2000" fill="{color}" mask="url(#{mid})"/>'


def pip_question2(c_lit, c_shade, c_ear, c_inner, c_eye, s=1.0, cx=500, cy=500):
    """Pose B, round 2: the raised trunk curls into a question's hook; the head (with its shade face) is the dot."""
    def T(x, y):
        return cx + (x - 500) * s, cy + (y - 500) * s
    parts = []
    for sgn in (-1, 1):
        e = dict(cx=T(500 + sgn * 170, 702)[0], cy=T(0, 702)[1], rx=126 * s, ry=150 * s, rot=-sgn * 14,
                 icx=T(500 + sgn * 194, 714)[0], icy=T(0, 714)[1], irx=74 * s, iry=100 * s)
        parts.append(_ell(e, c_ear) + _ell(e, c_inner, True))
    hx, hy = T(500, 680)
    hr = 152 * s
    parts.append(f'<circle cx="{hx:.1f}" cy="{hy:.1f}" r="{hr:.1f}" fill="{c_lit}"/>')
    parts.append(_p(_crescent((hx, hy), (hx - 30 * s, hy - 22 * s), hr), c_shade))
    up = bez((500, 720), (500, 640), (500, 520), (500, 470), 40)
    hook_c, R = (500, 296), 148
    P = np.array([hook_c[0] + R * math.cos(math.radians(40)), hook_c[1] + R * math.sin(math.radians(40))])
    s_curve = bez((500, 470), (500, 420), P + np.array([-60, 70]), P, 40)
    hook = arc(hook_c[0], hook_c[1], R, 40, -200, 200)
    line = np.array([T(x, y) for x, y in join(up, s_curve, hook)])
    parts.append(_p(stroke_outline(line, 92 * s), c_lit))
    for sgn in (-1, 1):
        ex, ey = T(500 + sgn * 62, 682)
        parts.append(f'<circle cx="{ex:.1f}" cy="{ey:.1f}" r="{20 * s:.1f}" fill="{c_eye}"/>')
    return ''.join(parts)


def badge_peek(c_sky, c_wall, c_wall_top, c_lit, c_shade, c_ear, c_inner, c_eye, cx=500, cy=500, R=500, k=1.1,
               clip=True):
    """Direction 3 as a round badge: Pip peeks over the ground (the band runs to the circle's edge, so it reads as
    a horizon, never a box), the trunk hooked over the edge. k scales Pip inside the circle."""
    pip = mark_pip_peek(c_lit, c_shade, c_ear, c_inner, c_eye, c_wall, c_wall_top, s=k, cx=500, cy=500 - 40 * k,
                        full_width=True)
    body = f'<circle cx="500" cy="500" r="500" fill="{c_sky}"/>{pip}'
    if clip:
        cid = f'bclip{next(_ids)}'
        body = (f'<defs><clipPath id="{cid}"><circle cx="500" cy="500" r="500"/></clipPath></defs>'
                f'<g clip-path="url(#{cid})">{body}</g>')
    sc = R / 500
    return f'<g transform="translate({cx - 500 * sc:.1f} {cy - 500 * sc:.1f}) scale({sc:.4f})">{body}</g>'


def badge_peek_mono(color, cx=500, cy=500, R=500, k=1.1, gap=22):
    """One colour, in negative space: a solid disc with Pip cut out of it, peeking over the ground line."""
    g = _peek_geo(k, 500, 500 - 40 * k)
    mid = f'bpm{next(_ids)}'
    hx, hy, hr = g['head']
    edge = g['ledge_top']
    trunk = stroke_outline(g['trunk_line'], g['trunk_w'])
    m = (f'<mask id="{mid}" maskUnits="userSpaceOnUse" x="0" y="0" width="1000" height="1000">'
         f'<circle cx="500" cy="500" r="500" fill="white"/>'
         + ''.join(_ell(e, 'black') for e in g['ears'])
         + f'<circle cx="{hx:.1f}" cy="{hy:.1f}" r="{hr + gap * k:.1f}" fill="white"/>'
         + f'<circle cx="{hx:.1f}" cy="{hy:.1f}" r="{hr:.1f}" fill="black"/>'
         + ''.join(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{r:.1f}" fill="white"/>' for x, y, r in g['eyes'])
         + f'<rect x="0" y="{edge - gap * k:.1f}" width="1000" height="{1000 - edge + gap * k:.1f}" fill="black"/>'
         + f'<rect x="0" y="{edge:.1f}" width="1000" height="{1000 - edge:.1f}" fill="white"/>'
         + _p(trunk, 'black')
         + f'<circle cx="500" cy="500" r="500" fill="none"/>'
         + '</mask>')
    # the ground stays inside the disc: re-clip the mask's band to the circle
    cid = f'bpc{next(_ids)}'
    sc = R / 500
    return (f'<g transform="translate({cx - 500 * sc:.1f} {cy - 500 * sc:.1f}) scale({sc:.4f})">'
            f'<defs>{m}<clipPath id="{cid}"><circle cx="500" cy="500" r="500"/></clipPath></defs>'
            f'<rect width="1000" height="1000" fill="{color}" mask="url(#{mid})" clip-path="url(#{cid})"/></g>')
