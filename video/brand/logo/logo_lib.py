"""Shared helpers for the studio logo: palette, text outlined to paths, stroke geometry, SVG writing.

Text is shaped with HarfBuzz (uharfbuzz; kerning and the variable axes applied) and outlined to SVG paths, so the
SVGs need no fonts. The fonts come from npm (@fontsource, all SIL OFL 1.1); see LOGO.md for the list and licences.
Setup (once):  npm i --prefix video/brand/logo/.deps @fontsource-variable/fraunces@5 @fontsource/jost@5 \
               @fontsource/patrick-hand@5 @fontsource-variable/bricolage-grotesque@5
               pip install uharfbuzz fonttools brotli
"""
import io
import math
import os

import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
DEPS = os.environ.get('LOGO_DEPS', os.path.join(HERE, '.deps', 'node_modules'))

# ---------------------------------------------------------------- palette (proposal; LOGO.md)
PAL = {
    'cream': '#F7EDE3',      # the page: warm paper, never beige
    'plum': '#2E2138',       # ink and the dark background (tinted, never black)
    'peri': '#7A7FE3',       # Pip periwinkle, the brand colour
    'peri_deep': '#5A5CC4',  # periwinkle shade face
    'peri_lite': '#AEB2F4',  # periwinkle on dark
    'teal': '#0F8273',       # canal teal
    'terra': '#E0683A',      # terracotta, the one pop ("the point")
    'peach': '#F6B494',      # soft accent (inner ear, cheeks)
}

# ---------------------------------------------------------------- fonts
FONTS = {
    'fraunces': ('@fontsource-variable/fraunces/files/fraunces-latin-full-normal.woff2', {}),
    'jost': ('@fontsource/jost/files/jost-latin-500-normal.woff2', {}),
    'jost600': ('@fontsource/jost/files/jost-latin-600-normal.woff2', {}),
    'patrick': ('@fontsource/patrick-hand/files/patrick-hand-latin-400-normal.woff2', {}),
    'bricolage': ('@fontsource-variable/bricolage-grotesque/files/bricolage-grotesque-latin-full-normal.woff2', {}),
}
_FACES = {}


def _face(key):
    if key not in _FACES:
        import uharfbuzz as hb
        from fontTools.ttLib import TTFont
        path = os.path.join(DEPS, FONTS[key][0])
        if not os.path.exists(path):  # fontsource-variable packages name the full-axes file differently per family
            alt = path.replace('-full-normal', '-standard-normal')
            path = alt if os.path.exists(alt) else path
        f = TTFont(path)
        f.flavor = None
        buf = io.BytesIO()
        f.save(buf)
        upem = f['head'].unitsPerEm
        _FACES[key] = (hb.Face(buf.getvalue()), upem)
    return _FACES[key]


class _PathPen:
    """Collects glyph outlines as an SVG path in user space (y down), with exact-enough bounds."""

    def __init__(self):
        self.cmds = []
        self.pts = []
        self.ox = self.oy = 0.0
        self.s = 1.0

    def _t(self, p):
        x, y = self.ox + p[0] * self.s, self.oy - p[1] * self.s
        self.pts.append((x, y))
        return f'{x:.2f} {y:.2f}'

    def moveTo(self, p):
        self.cmds.append('M' + self._t(p))

    def lineTo(self, p):
        self.cmds.append('L' + self._t(p))

    def curveTo(self, *ps):
        self.cmds.append('C' + ' '.join(self._t(p) for p in ps))

    def qCurveTo(self, *ps):
        # TrueType implied on-curve points: split into single quadratics
        ps = list(ps)
        if len(ps) == 2:
            self.cmds.append('Q' + ' '.join(self._t(p) for p in ps))
            return
        for i in range(len(ps) - 1):
            c = ps[i]
            if i < len(ps) - 2:
                n = ps[i + 1]
                e = ((c[0] + n[0]) / 2, (c[1] + n[1]) / 2)
            else:
                e = ps[-1]
            self.cmds.append('Q' + self._t(c) + ' ' + self._t(e))

    def closePath(self):
        self.cmds.append('Z')

    def endPath(self):
        pass


def text_path(key, text, size, x=0.0, y=0.0, tracking=0.0, variations=None, features=None, kern_adjust=None):
    """Outline `text` at font size `size` (px), baseline at y, starting at x. tracking in em.
    kern_adjust: {index: extra advance in em after glyph index}. Returns (d, bbox(x0,y0,x1,y1), advance_px)."""
    import uharfbuzz as hb
    face, upem = _face(key)
    font = hb.Font(face)
    if variations:
        font.set_variations(variations)
    buf = hb.Buffer()
    buf.add_str(text)
    buf.guess_segment_properties()
    hb.shape(font, buf, features or {'kern': True, 'liga': True})
    s = size / upem
    pen = _PathPen()
    pen.s = s
    cx = x
    for i, (info, pos) in enumerate(zip(buf.glyph_infos, buf.glyph_positions)):
        pen.ox = cx + pos.x_offset * s
        pen.oy = y - pos.y_offset * s
        font.draw_glyph_with_pen(info.codepoint, pen)
        cx += pos.x_advance * s + tracking * size
        if kern_adjust and i in kern_adjust:
            cx += kern_adjust[i] * size
    adv = cx - x - tracking * size
    xs = [p[0] for p in pen.pts] or [x]
    ys = [p[1] for p in pen.pts] or [y]
    return ' '.join(pen.cmds), (min(xs), min(ys), max(xs), max(ys)), adv


def text_bbox_exact(key, text, size, **kw):
    d, bb, adv = text_path(key, text, size, **kw)
    return bb, adv


# ---------------------------------------------------------------- geometry
def arc(cx, cy, r, a0, a1, n=None):
    """Points on a circle, screen angles in degrees (0 = right, 90 = down: increasing = clockwise on screen)."""
    n = n or max(8, int(abs(a1 - a0) / 2))
    a = np.radians(np.linspace(a0, a1, n))
    return np.stack([cx + r * np.cos(a), cy + r * np.sin(a)], 1)


def bez(p0, p1, p2, p3, n=40):
    t = np.linspace(0, 1, n)[:, None]
    p0, p1, p2, p3 = map(np.asarray, (p0, p1, p2, p3))
    return (1 - t) ** 3 * p0 + 3 * (1 - t) ** 2 * t * p1 + 3 * (1 - t) * t ** 2 * p2 + t ** 3 * p3


def join(*parts):
    out = [np.asarray(parts[0])]
    for p in parts[1:]:
        p = np.asarray(p)
        if np.allclose(out[-1][-1], p[0], atol=0.5):
            p = p[1:]
        out.append(p)
    return np.concatenate(out)


def poly_d(pts, close=False):
    pts = np.asarray(pts)
    s = 'M' + ' L'.join(f'{x:.1f} {y:.1f}' for x, y in pts)
    return s + (' Z' if close else '')


def stroke_outline(pts, w, cap='round'):
    """Filled outline of a stroke of width w along a dense polyline (round caps). Returns an SVG path d."""
    pts = np.asarray(pts, float)
    # resample evenly
    seg = np.linalg.norm(np.diff(pts, axis=0), axis=1)
    keep = np.concatenate([[True], seg > 1e-6])
    pts = pts[keep]
    seg = np.linalg.norm(np.diff(pts, axis=0), axis=1)
    L = np.concatenate([[0], np.cumsum(seg)])
    n = max(16, int(L[-1] / 2.0))
    t = np.linspace(0, L[-1], n)
    P = np.stack([np.interp(t, L, pts[:, 0]), np.interp(t, L, pts[:, 1])], 1)
    T = np.gradient(P, axis=0)
    T /= np.linalg.norm(T, axis=1, keepdims=True)
    N = np.stack([-T[:, 1], T[:, 0]], 1)
    h = w / 2
    left = P + N * h
    right = P - N * h
    a_end = math.degrees(math.atan2(N[-1, 1], N[-1, 0]))
    cap_end = arc(P[-1, 0], P[-1, 1], h, a_end, a_end - 180, 24)
    a_st = math.degrees(math.atan2(-N[0, 1], -N[0, 0]))
    cap_st = arc(P[0, 0], P[0, 1], h, a_st, a_st - 180, 24)
    ring = np.concatenate([left, cap_end, right[::-1], cap_st])
    return poly_d(ring, close=True)


def circle_d(cx, cy, r):
    return (f'M{cx - r:.1f} {cy:.1f} a{r:.1f} {r:.1f} 0 1 0 {2 * r:.1f} 0 '
            f'a{r:.1f} {r:.1f} 0 1 0 {-2 * r:.1f} 0 Z')


def svg_doc(w, h, body, bg=None, title=None):
    t = f'<title>{title}</title>' if title else ''
    b = f'<rect width="{w}" height="{h}" fill="{bg}"/>' if bg else ''
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}">'
            f'{t}{b}{body}</svg>\n')
