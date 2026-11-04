"""Tiny SVG writer + Chromium render for the scene-1 poster-rethink still (2026-10-29 iteration).

Shapes are flat fills only (no outlines anywhere: DIRECTION rule 4). Render with render.cjs (Playwright Chromium).
"""
import base64
import os
import subprocess

HERE = os.path.dirname(os.path.abspath(__file__))
FONT = os.path.join(HERE, '..', '..', '..', 'public', 'fonts', 'CaptionHand.woff2')  # = Patrick Hand 400


def font_face():
    with open(FONT, 'rb') as f:
        b64 = base64.b64encode(f.read()).decode()
    return ("<style>@font-face{font-family:'PatrickHand';src:url(data:font/woff2;base64,%s) format('woff2');}"
            "</style>" % b64)


def f(v):
    return ('%.1f' % v).rstrip('0').rstrip('.')


def pts(p):
    return ' '.join('%s,%s' % (f(x), f(y)) for x, y in p)


class SVG:
    def __init__(self, w=1080, h=1920, out_w=None, out_h=None):
        self.w, self.h = w, h
        self.ow, self.oh = out_w or w, out_h or h
        self.defs = []
        self.body = []
        self._gid = 0

    def uid(self, p='g'):
        self._gid += 1
        return '%s%d' % (p, self._gid)

    def add(self, s):
        self.body.append(s)

    @staticmethod
    def _kw(kw):
        out = []
        for k, v in kw.items():
            if v is None:
                continue
            out.append('%s="%s"' % (k.replace('_', '-'), v))
        return (' ' + ' '.join(out)) if out else ''

    def rect(self, x, y, w, h, fill, **kw):
        self.add('<rect x="%s" y="%s" width="%s" height="%s" fill="%s"%s/>' % (f(x), f(y), f(w), f(h), fill, self._kw(kw)))

    def poly(self, p, fill, **kw):
        self.add('<polygon points="%s" fill="%s"%s/>' % (pts(p), fill, self._kw(kw)))

    def path(self, d, fill, **kw):
        self.add('<path d="%s" fill="%s"%s/>' % (d, fill, self._kw(kw)))

    def circle(self, cx, cy, r, fill, **kw):
        self.add('<circle cx="%s" cy="%s" r="%s" fill="%s"%s/>' % (f(cx), f(cy), f(r), fill, self._kw(kw)))

    def ellipse(self, cx, cy, rx, ry, fill, **kw):
        self.add('<ellipse cx="%s" cy="%s" rx="%s" ry="%s" fill="%s"%s/>' % (f(cx), f(cy), f(rx), f(ry), fill, self._kw(kw)))

    def line(self, x1, y1, x2, y2, stroke, width, **kw):
        # only for things that ARE lines (rails, wires, rigging): rule 4
        self.add('<line x1="%s" y1="%s" x2="%s" y2="%s" stroke="%s" stroke-width="%s" stroke-linecap="round"%s/>'
                 % (f(x1), f(y1), f(x2), f(y2), stroke, f(width), self._kw(kw)))

    def text(self, x, y, s, size, fill, anchor='middle', family='PatrickHand', **kw):
        self.add('<text x="%s" y="%s" font-family="%s" font-size="%s" fill="%s" text-anchor="%s"%s>%s</text>'
                 % (f(x), f(y), family, f(size), fill, anchor, self._kw(kw), s))

    def lingrad(self, stops, x1=0, y1=0, x2=0, y2=1, units='objectBoundingBox'):
        gid = self.uid('lg')
        st = ''.join('<stop offset="%s" stop-color="%s"/>' % (f(o), c) for o, c in stops)
        self.defs.append('<linearGradient id="%s" x1="%s" y1="%s" x2="%s" y2="%s" gradientUnits="%s">%s</linearGradient>'
                         % (gid, f(x1), f(y1), f(x2), f(y2), units, st))
        return 'url(#%s)' % gid

    def clip(self, inner):
        cid = self.uid('cp')
        self.defs.append('<clipPath id="%s">%s</clipPath>' % (cid, inner))
        return 'url(#%s)' % cid

    def group(self, **kw):
        self.add('<g%s>' % self._kw(kw))

    def end(self):
        self.add('</g>')

    def to_string(self, with_font=True):
        return ('<svg xmlns="http://www.w3.org/2000/svg" width="%d" height="%d" viewBox="0 0 %d %d" '
                'shape-rendering="geometricPrecision">%s<defs>%s</defs>%s</svg>'
                % (self.ow, self.oh, self.w, self.h, font_face() if with_font else '', ''.join(self.defs),
                   '\n'.join(self.body)))

    def save(self, path, with_font=True):
        with open(path, 'w') as fh:
            fh.write(self.to_string(with_font))
        return path


def render(pairs):
    """pairs: [(svg_path, png_path), ...] rendered in one Chromium launch."""
    args = []
    for s, p in pairs:
        args += [s, p]
    subprocess.run(['node', os.path.join(HERE, 'render.cjs')] + args, check=True)
