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
