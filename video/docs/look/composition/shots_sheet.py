#!/usr/bin/env python3
"""Value thumbnails of the shot library: one 270 x 480 frame per recipe, SR1-SR24 (`../COMPOSITION_SHOTS.md`).

Each thumbnail is our 1080 x 1920 frame, drawn at full size in frame px (so the recipes' numbers are used as they
stand) and shown at 1/4. The picture holds five flat values at most, L* 97 / 80 / 60 / 40 / 18, and white (97) is kept
for the story light. Over it, faintly: the caption band (y 290-600, its block as two ghost lines) and the app's
interface on the owner's Reels tab (the header to y 240, the name block from y 1519, the rail x > 870 from y 860, the
strips x < 98 and x > 982 his crop hides); then the recipe's composition idea in one thin accent colour (its lines,
the focal ring, the eye's path or the move). Content: scene 1 (v2's canal at King's Cross on an October dusk, T1's
light rig) or video 4 (Helsinki's AI-heated homes on a snowy night), as each recipe's own example says.

Everything is drawn here from the recipes' numbers, seeded and deterministic: no image is copied, traced or used as an
input. The owner's reels taught the method (a grey value sketch with its armature in one accent colour); nothing of
their pictures is in it.

    python3 -B shots_sheet.py                 # the sheet: shots_sheet.png next to this script (~30 s on one core)
    python3 -B shots_sheet.py --thumbs DIR    # also each thumbnail as DIR/SRn.png, and the per-frame checks
    python3 -B shots_sheet.py --phone DIR     # also the phone-size views used for the sheet's phone check
"""
import math
import os
import sys

import numpy as np
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, 'shots_sheet.png')
FW, FH = 1080, 1920            # the frame, px, y down
SC = 4                         # a thumbnail is the frame at 1/4
TW, TH = FW // SC, FH // SC    # 270 x 480


# ---------------------------------------------------------------------------------------------------------------------
# Values, the accent, the frame's furniture
# ---------------------------------------------------------------------------------------------------------------------
def lstar_to_grey(L):
    """CIE L* (a* = b* = 0) to an sRGB grey, 0-255."""
    fy = (L + 16.0) / 116.0
    Y = fy ** 3 if fy > 6 / 29 else 3 * (6 / 29) ** 2 * (fy - 4 / 29)
    v = 12.92 * Y if Y <= 0.0031308 else 1.055 * Y ** (1 / 2.4) - 0.055
    return int(round(min(max(v, 0.0), 1.0) * 255))


VALUES = (('W', 97, 'the story light (only there)'), ('L', 80, 'light'), ('M', 60, 'mid'), ('D', 40, 'mid-dark'),
          ('K', 18, 'dark'))
LSTAR = {k: L for k, L, _ in VALUES}
GREY = {k: lstar_to_grey(L) for k, L in LSTAR.items()}          # 246 / 198 / 145 / 94 / 44
GREY_TO_L = {g: LSTAR[k] for k, g in GREY.items()}
ACCENT = (226, 56, 32)        # the one accent: the composition idea
LW = 6                        # the accent's width at frame size (1.5 px on the thumbnail)

BAND = (290, 600)             # the caption band
BLOCK = ((170, 364, 870, 404), (262, 484, 778, 524))   # the caption block's two lines (x-height), centred on x 520
UI_TOP, UI_BOTTOM = 240, 1519  # the Reels tab's header (with its scrim) and the name block
CUT_L, CUT_R = 98, 982        # the strips his Reels tab hides
RAIL = (870, 860)             # nothing to read at x > 870 below y 860


# ---------------------------------------------------------------------------------------------------------------------
# Shapes: hand-cut, organic, seeded
# ---------------------------------------------------------------------------------------------------------------------
def wobble(p0, p1, amp, rng, step=36.0):
    """Points along p0 -> p1 with a seeded sideways wobble (a sum of three sines); the ends stay put."""
    (x0, y0), (x1, y1) = p0, p1
    L = math.hypot(x1 - x0, y1 - y0)
    n = max(1, int(L / step))
    if amp <= 0 or n < 2:
        return [p0, p1]
    nx, ny = -(y1 - y0) / L, (x1 - x0) / L
    ph = rng.uniform(0, 2 * math.pi, 3)
    out = []
    for i in range(n + 1):
        t = i / n
        w = 0.0 if i in (0, n) else amp * (0.6 * math.sin(2 * math.pi * 1.3 * t + ph[0]) +
                                           0.3 * math.sin(2 * math.pi * 2.9 * t + ph[1]) +
                                           0.22 * math.sin(2 * math.pi * 6.1 * t + ph[2]))
        out.append((x0 + (x1 - x0) * t + nx * w, y0 + (y1 - y0) * t + ny * w))
    return out


def hand_poly(pts, amp, rng, step=36.0):
    """A polygon with hand-cut edges: every edge wobbles a little; the corners stay where they are."""
    out = []
    for i in range(len(pts)):
        out.extend(wobble(pts[i], pts[(i + 1) % len(pts)], amp, rng, step)[:-1])
    return out


def blob_pts(cx, cy, rx, ry, rng, amp=0.08, n=96):
    """An organic closed shape: an ellipse whose radius breathes with four seeded harmonics (never a compass arc)."""
    k = (2, 3, 5, 7)
    ph = rng.uniform(0, 2 * math.pi, len(k))
    a = rng.uniform(0.35, 1.0, len(k)) / np.sqrt(np.arange(1, len(k) + 1))
    pts = []
    for i in range(n):
        t = 2 * math.pi * i / n
        r = 1 + amp * sum(a[j] * math.sin(k[j] * t + ph[j]) for j in range(len(k)))
        pts.append((cx + rx * r * math.cos(t), cy + ry * r * math.sin(t)))
    return pts


def catmull(pts, n=14, closed=False):
    """A smooth curve through the points (Catmull-Rom)."""
    P = np.asarray(pts, float)
    P = np.vstack([P[-1], P, P[0], P[1]]) if closed else np.vstack([P[0], P, P[-1]])
    out = []
    for i in range(1, len(P) - 2):
        p0, p1, p2, p3 = P[i - 1], P[i], P[i + 1], P[i + 2]
        for t in np.linspace(0, 1, n, endpoint=False):
            out.append(tuple(0.5 * ((2 * p1) + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t * t +
                                    (-p0 + 3 * p1 - 3 * p2 + p3) * t ** 3)))
    if not closed:
        out.append(tuple(P[-2]))
    return out


def ribbon(centre, half_w):
    """A band of half-width half_w along a smooth centre line (a road, a ramp, a run)."""
    C = np.asarray(catmull(centre, 10), float)
    d = np.gradient(C, axis=0)
    nrm = np.stack([-d[:, 1], d[:, 0]], 1) / (np.linalg.norm(d, axis=1)[:, None] + 1e-9)
    hw = np.broadcast_to(np.asarray(half_w, float), (len(C),)) if np.ndim(half_w) == 0 else \
        np.interp(np.linspace(0, 1, len(C)), np.linspace(0, 1, len(half_w)), half_w)
    a = C + nrm * hw[:, None]
    b = C - nrm * hw[:, None]
    return [tuple(p) for p in a] + [tuple(p) for p in b[::-1]]


# people, in units of their height P, origin at the feet's centre, y up is negative (from behind, or walking in profile)
_BACK = dict(
    head=(0.010, -0.925, 0.064, 0.074),
    polys=[[(-0.05, -0.846), (0.05, -0.846), (0.118, -0.820), (0.140, -0.782), (0.134, -0.62), (0.128, -0.47),
            (0.138, -0.352), (-0.138, -0.352), (-0.128, -0.47), (-0.134, -0.62), (-0.140, -0.782), (-0.118, -0.820)],
           [(-0.118, -0.80), (-0.152, -0.765), (-0.170, -0.60), (-0.163, -0.452), (-0.128, -0.452), (-0.134, -0.60),
            (-0.120, -0.745)],
           [(0.118, -0.80), (0.152, -0.765), (0.170, -0.60), (0.163, -0.452), (0.128, -0.452), (0.134, -0.60),
            (0.120, -0.745)],
           [(-0.100, -0.37), (-0.012, -0.37), (-0.022, -0.030), (-0.082, -0.030)],
           [(0.012, -0.37), (0.100, -0.37), (0.088, -0.045), (0.028, -0.045)]],
    feet=[(-0.054, -0.016, 0.040, 0.020), (0.058, -0.031, 0.038, 0.019)])
_SIDE = dict(
    head=(0.018, -0.926, 0.060, 0.071),
    polys=[[(-0.058, -0.836), (0.040, -0.842), (0.074, -0.806), (0.082, -0.660), (0.074, -0.420), (-0.082, -0.420),
            (-0.088, -0.620), (-0.076, -0.790)],
           [(-0.004, -0.40), (0.062, -0.42), (0.096, -0.24), (0.150, -0.050), (0.120, -0.030), (0.052, -0.215),
            (-0.012, -0.38)],
           [(-0.074, -0.42), (-0.004, -0.42), (-0.030, -0.22), (-0.096, -0.040), (-0.128, -0.052), (-0.080, -0.23)],
           [(-0.030, -0.800), (0.030, -0.792), (-0.004, -0.640), (-0.062, -0.505), (-0.104, -0.522), (-0.058, -0.660)]],
    feet=[(0.152, -0.018, 0.052, 0.020), (-0.118, -0.028, 0.046, 0.019)])


class Frame:
    """The 1080 x 1920 picture as flat values (an 'L' image holding only the five greys), the accent guides kept
    apart until the thumbnail is made."""

    def __init__(self, seed, base):
        self.im = Image.new('L', (FW, FH), GREY[base])
        self.dr = ImageDraw.Draw(self.im)
        self.rng = np.random.default_rng(seed)
        self.guides = []
        self.inset = None          # (Frame, (x, y)): a second frame shown at 1/4 inside this one (SR19)
        self.focal = None          # the beat's focal centre (checks)

    # -- fills --------------------------------------------------------------------------------------------------------
    def poly(self, pts, v):
        self.dr.polygon([(float(x), float(y)) for x, y in pts], fill=GREY[v])

    def hpoly(self, pts, v, amp=3.0, step=36.0):
        self.poly(hand_poly(pts, amp, self.rng, step), v)

    def rect(self, x0, y0, x1, y1, v, amp=0.0):
        if amp > 0:
            self.hpoly([(x0, y0), (x1, y0), (x1, y1), (x0, y1)], v, amp)
        else:
            self.dr.rectangle([x0, y0, x1, y1], fill=GREY[v])

    def rrect(self, x0, y0, x1, y1, r, v):
        self.dr.rounded_rectangle([x0, y0, x1, y1], r, fill=GREY[v])

    def ell(self, cx, cy, rx, ry, v):
        self.dr.ellipse([cx - rx, cy - ry, cx + rx, cy + ry], fill=GREY[v])

    def blob(self, cx, cy, rx, ry, v, amp=0.08):
        self.poly(blob_pts(cx, cy, rx, ry, self.rng, amp), v)

    def line(self, pts, v, w):
        self.dr.line([(float(x), float(y)) for x, y in pts], fill=GREY[v], width=int(round(w)), joint='curve')

    def mask_fill(self, mask, v):
        """Fill through a binary 'L' mask (keeps the picture to its five values)."""
        self.im.paste(GREY[v], (0, 0), mask.point(lambda a: 255 if a >= 128 else 0))

    def text(self, xy, s, size, v, anchor='mm', weight='Bold'):
        m = Image.new('L', (FW, FH), 0)
        ImageDraw.Draw(m).text(xy, s, font=font(size, weight), fill=255, anchor=anchor)
        self.mask_fill(m, v)

    # -- things -------------------------------------------------------------------------------------------------------
    def cloud(self, cx, cy, w, h, v, lobes=5, base=None, flat=True):
        """A cumulus w x h: a lobed top (bigger lobes mid), a flat base with a soft wobble (y = base)."""
        rng = self.rng
        base = cy + h * 0.5 if base is None else base
        m = Image.new('L', (FW, FH), 0)
        d = ImageDraw.Draw(m)
        xs = np.linspace(cx - w * 0.36, cx + w * 0.36, lobes)
        for i, x in enumerate(xs):
            s = (0.58 + 0.42 * math.sin(math.pi * (i + 0.5) / lobes)) * rng.uniform(0.86, 1.14)
            rx, ry = w * 0.19 * s, h * 0.50 * s
            d.polygon(blob_pts(x + rng.uniform(-w * 0.025, w * 0.025), base - ry * 0.78, rx, ry, rng, 0.07), fill=255)
        d.polygon(blob_pts(cx, base - h * 0.13, w * 0.50, h * 0.17, rng, 0.04), fill=255)
        if flat:
            a = np.asarray(m).copy()
            ph = rng.uniform(0, 6.28)
            yb = base + 5 * np.sin(np.arange(FW) / 70.0 + ph)
            a[np.arange(FH)[:, None] > yb[None, :]] = 0
            m = Image.fromarray(a)
        self.mask_fill(m, v)

    def skyline(self, x0, x1, base, tops, v, wmin=50, wmax=140, gable=0.25, tall=0.0, tall_top=None):
        """A row of buildings standing on y = base, their tops in `tops`, hand-cut; one polygon (no seams)."""
        rng = self.rng
        pts = [(x0, base)]
        x = x0
        while x < x1 - 1:
            w = rng.uniform(wmin, wmax)
            xe = min(x + w, x1)
            top = rng.uniform(*tops)
            if tall and rng.random() < tall:
                top = rng.uniform(*tall_top)
            if rng.random() < gable and xe - x > 44:
                pts += [(x, top), ((x + xe) / 2 + rng.uniform(-6, 6), top - rng.uniform(16, 34)), (xe, top)]
            else:
                pts += [(x, top + rng.uniform(-3, 3)), (xe, top + rng.uniform(-3, 3))]
            x = xe
        pts.append((x1, base))
        self.poly(pts, v)

    def windows(self, cols, rows, w, h, v, skip=0.15, jit=5.0, size_jit=0.08, avoid=(), clip=None):
        """A facade's panes: one texture, varied in size and place, some left dark (never a ruler grid)."""
        rng = self.rng
        out = []
        for cy in rows:
            for cx in cols:
                r1, r2, r3, r4, r5 = rng.random(), rng.uniform(-jit, jit), rng.uniform(-jit, jit), \
                    rng.uniform(1 - size_jit, 1 + size_jit), rng.uniform(1 - size_jit, 1 + size_jit)
                if (cx, cy) in avoid or r1 < skip:
                    continue
                x, y, ww, hh = cx + r2, cy + r3, w * r4, h * r5
                if clip and not clip(x, y):
                    continue
                self.rect(x - ww / 2, y - hh / 2, x + ww / 2, y + hh / 2, v, amp=1.2)
                out.append((x, y, ww, hh))
        return out

    def person(self, cx, feet, P, v, view='back', facing=1):
        """A figure P px tall, from behind ('back') or walking in profile ('side'), facing +1 (right) or -1."""
        spec = _BACK if view == 'back' else _SIDE
        T = lambda x, y: (cx + facing * x * P, feet + y * P)  # noqa: E731  (P < 0: mirrored, a reflection)
        ap = abs(P)
        hx, hy, hrx, hry = spec['head']
        x, y = T(hx, hy)
        self.ell(x, y, hrx * ap, hry * ap, v)
        (nx0, ny0), (nx1, ny1) = T(-0.03, -0.866), T(0.03, -0.836)
        self.rect(min(nx0, nx1), min(ny0, ny1), max(nx0, nx1), max(ny0, ny1), v)
        for poly in spec['polys']:
            self.poly([T(px, py) for px, py in poly], v)
        for fx, fy, frx, fry in spec['feet']:
            x, y = T(fx, fy)
            self.ell(x, y, frx * ap, fry * ap, v)

    def bust(self, cx, base, P, v):
        """Head and shoulders, P = the visible height (a person in a window)."""
        self.ell(cx, base - P * 0.74, P * 0.17, P * 0.21, v)
        self.poly([(cx - P * 0.43, base), (cx - P * 0.40, base - P * 0.33), (cx - P * 0.22, base - P * 0.45),
                   (cx + P * 0.22, base - P * 0.45), (cx + P * 0.40, base - P * 0.33), (cx + P * 0.43, base)], v)

    def steam(self, x, y0, y1, w0, v, sway=36.0, ceiling=614):
        """A plume rising from (x, y0) to y1: joined and wide low, breaking into wisps that thin out at the top and
        never reach above `ceiling` (the steam thins out below the caption band)."""
        rng = self.rng
        n = 16
        for i in range(n):
            t = i / (n - 1)
            y = y0 - (y0 - y1) * t
            xc = x + sway * math.sin(t * 2.7 + 0.6) * t
            w = w0 * (0.62 + 0.75 * t) * (1 - 0.62 * t ** 1.6)
            skip = t > 0.55 and rng.random() < 0.3
            jx = rng.uniform(-w0, w0) * 0.08
            if skip:
                continue
            rx, ry = w * 0.5, w * 0.30 * (1 - 0.35 * t)
            ry = min(ry, (y - ceiling) / 1.25)          # the blob's top (with its wobble) stays under the ceiling
            if ry < 8:
                continue
            self.blob(xc + jx, y, rx, ry, v, 0.13)

    def column(self, cx, y0, y1, w0, w1, v, broken=0.5):
        """A light's broken column on water, from its source at y0 toward us (y1), widening a little."""
        rng = self.rng
        y = y0
        while y < y1:
            t = (y - y0) / max(1.0, y1 - y0)
            h = (12 + 12 * t) * rng.uniform(0.8, 1.25)
            w = (w0 + (w1 - w0) * t) * rng.uniform(0.72, 1.05)
            off = rng.uniform(-12, 12) * t
            self.ell(cx + off, y + h / 2, w / 2, h / 2, v)
            y += h + (2 + 20 * t * broken) * rng.uniform(0.5, 1.4)

    def dots(self, xs, ys, r, v, skip=0.2, jit=2.0):
        rng = self.rng
        for y in ys:
            for x in xs:
                if rng.random() < skip:
                    continue
                self.ell(x + rng.uniform(-jit, jit), y + rng.uniform(-jit, jit), r, r, v)

    # -- the composition idea (accent) --------------------------------------------------------------------------------
    def g(self, kind, *a, **kw):
        self.guides.append((kind, a, kw))


# ---------------------------------------------------------------------------------------------------------------------
# Drawing the accent guides and the faint furniture
# ---------------------------------------------------------------------------------------------------------------------
def _polyline_dash(d, pts, w, col, on=30.0, off=20.0):
    carry, draw = 0.0, True
    for (x0, y0), (x1, y1) in zip(pts[:-1], pts[1:]):
        L = math.hypot(x1 - x0, y1 - y0)
        if L < 1e-6:
            continue
        ux, uy = (x1 - x0) / L, (y1 - y0) / L
        s = 0.0
        while s < L:
            seg = (on if draw else off) - carry
            e = min(L, s + seg)
            if draw:
                d.line([(x0 + ux * s, y0 + uy * s), (x0 + ux * e, y0 + uy * e)], fill=col, width=w)
            if e - s < seg:
                carry += e - s
                break
            carry, draw, s = 0.0, not draw, e


def _head(d, p_from, p_to, col, L=40.0, W=32.0):
    (x0, y0), (x1, y1) = p_from, p_to
    a = math.atan2(y1 - y0, x1 - x0)
    bx, by = x1 - L * math.cos(a), y1 - L * math.sin(a)
    px, py = -math.sin(a) * W / 2, math.cos(a) * W / 2
    d.polygon([(x1, y1), (bx + px, by + py), (bx - px, by - py)], fill=col)


def draw_guides(rgba, guides):
    ov = Image.new('RGBA', (FW, FH), (0, 0, 0, 0))
    d = ImageDraw.Draw(ov)
    col = ACCENT + (255,)
    for kind, a, kw in guides:
        w = kw.get('w', LW)
        dash = kw.get('dash', False)
        if kind in ('line', 'arrow', 'curve'):
            pts = catmull(a[0], 12) if kind == 'curve' else list(a[0])
            if kind == 'curve' and kw.get('arrow'):
                kind = 'arrow'
            if kind == 'arrow':          # stop the shaft where the head starts
                (x0, y0), (x1, y1) = pts[-2], pts[-1]
                L = math.hypot(x1 - x0, y1 - y0)
                tip = pts[-1]
                pts = pts[:-1] + [(x1 - (x1 - x0) / L * 30, y1 - (y1 - y0) / L * 30)]
            if dash:
                _polyline_dash(d, pts, w, col)
            else:
                d.line(pts, fill=col, width=w, joint='curve')
            if kind == 'arrow':
                _head(d, pts[-1], tip, col)
                if kw.get('both'):
                    _head(d, pts[1], pts[0], col)
        elif kind == 'ring':
            cx, cy, r = a
            d.ellipse([cx - r, cy - r, cx + r, cy + r], outline=col, width=w)
        elif kind == 'box':
            x0, y0, x1, y1 = a
            pts = [(x0, y0), (x1, y0), (x1, y1), (x0, y1), (x0, y0)]
            if dash:
                _polyline_dash(d, pts, w, col)
            else:
                d.line(pts, fill=col, width=w, joint='curve')
        elif kind == 'tri':
            pts = list(a[0]) + [a[0][0]]
            d.line(pts, fill=col, width=w, joint='curve')
        elif kind == 'vdim':           # a dimension: a line with end ticks
            x, y0, y1 = a
            d.line([(x, y0), (x, y1)], fill=col, width=w)
            for y in (y0, y1):
                d.line([(x - 20, y), (x + 20, y)], fill=col, width=w)
        elif kind == 'hdim':
            y, x0, x1 = a
            d.line([(x0, y), (x1, y)], fill=col, width=w)
            for x in (x0, x1):
                d.line([(x, y - 20), (x, y + 20)], fill=col, width=w)
        elif kind == 'cross':
            cx, cy, r = a
            d.line([(cx - r, cy), (cx + r, cy)], fill=col, width=w)
            d.line([(cx, cy - r), (cx, cy + r)], fill=col, width=w)
    return Image.alpha_composite(rgba, ov)


def furniture(rgba, band_dark):
    """The app's interface on the owner's Reels tab (a faint veil) and the caption band (dashes; the block ghosted)."""
    ov = Image.new('RGBA', (FW, FH), (0, 0, 0, 0))
    d = ImageDraw.Draw(ov)
    veil = (126, 128, 136, 46)
    d.rectangle([0, 0, FW, UI_TOP], fill=veil)
    d.rectangle([0, UI_BOTTOM, FW, FH], fill=veil)
    d.rectangle([0, UI_TOP, CUT_L, UI_BOTTOM], fill=veil)
    d.rectangle([CUT_R, UI_TOP, FW, UI_BOTTOM], fill=veil)
    d.rounded_rectangle([RAIL[0], RAIL[1], CUT_R + 40, UI_BOTTOM + 40], 34, fill=veil)
    ink = (255, 255, 255, 40) if band_dark else (26, 24, 30, 36)
    for x0, y0, x1, y1 in BLOCK:
        d.rounded_rectangle([x0, y0, x1, y1], 27, fill=ink)
    dash = (255, 255, 255, 96) if band_dark else (26, 24, 30, 84)
    for y in BAND:
        _polyline_dash(d, [(0, y), (FW, y)], 4, dash, on=26, off=18)
    return Image.alpha_composite(rgba, ov)


def thumbnail(fr):
    """The frame's picture, its furniture, the inset, the guides; then 1/4 by area (the anti-aliasing)."""
    g = fr.im
    rgba = Image.merge('RGBA', (g, g, g, Image.new('L', (FW, FH), 255)))
    band = np.asarray(g)[BAND[0]:BAND[1], 95:945]
    band_dark = GREY_TO_L.get(int(np.median(band)), 50) < 55
    rgba = furniture(rgba, band_dark)
    if fr.inset is not None:
        sub, (ix, iy) = fr.inset
        sg = sub.im.resize((TW, TH), Image.BOX)
        rgba.paste(Image.merge('RGBA', (sg, sg, sg, Image.new('L', (TW, TH), 255))), (ix, iy))
    rgba = draw_guides(rgba, fr.guides)
    return rgba.convert('RGB').resize((TW, TH), Image.BOX)


# ---------------------------------------------------------------------------------------------------------------------
# Shared places
# ---------------------------------------------------------------------------------------------------------------------
def v4_home(fr, payoff=False, run=True):
    """Video 4's home view (setup A, camera ~1.6 m on the street, horizon y 1170): the night sky with the band, the far
    city across the harbour, the giant computer by the harbour (left), the block and its one window (W), the snowy
    street; the warm run from the computer's foot along the street and up the block's wall to the one window."""
    yh = 1170
    fr.cloud(170, 150, 660, 240, 'M')                                   # the snow cloud: the counterweight, high left
    fr.rect(0, 1096, 1080, yh, 'M')                                     # the city's glow low on the sky
    fr.skyline(0, 1080, yh, (1100, 1150), 'K', wmin=36, wmax=110, gable=0.2, tall=0.18, tall_top=(1050, 1090))
    if payoff:                                                          # the far city lit: a dotted band, a step under
        fr.dots(np.arange(16, 1080, 34), (1138, 1156), 5, 'L', skip=0.45, jit=6)
    fr.rect(0, yh, 1080, 1214, 'D')                                     # the harbour
    # the giant computer by the harbour, its rows of small lights
    fr.hpoly([(66, 838), (278, 832), (282, 1216), (62, 1216)], 'K', amp=2)
    fr.rect(66, 826, 278, 842, 'M', amp=1)                              # snow on its top
    fr.dots(np.arange(96, 260, 30), np.arange(878, 1180, 34), 5, 'L' if payoff else 'M', skip=0.25, jit=1.5)
    fr.rect(0, 1214, 1080, 1920, 'M')                                   # the snowy street, the near quiet field
    # the block: one closed dark shape, roof under the band, its panes one texture, its one window
    roof = [(380, 698), (470, 696), (476, 664), (506, 664), (510, 694), (700, 690), (704, 670), (728, 670),
            (732, 690), (808, 688)]
    fr.hpoly(roof + [(812, 1262), (378, 1262)], 'K', amp=2)
    fr.hpoly([(372, 702), (816, 692), (812, 680), (378, 688)], 'M', amp=2)   # its roof's snow
    one = (598, 985)
    fr.windows((438, 518, 598, 678, 758), (775, 880, 985, 1090), 62, 82, 'D', skip=0.18, avoid=(one,))
    fr.rect(500, 1180, 560, 1262, 'D', amp=1)                           # its door
    fr.rrect(one[0] - 52, one[1] - 62, one[0] + 52, one[1] + 62, 22, 'L')   # the glow at the source: one step
    fr.rect(one[0] - 34, one[1] - 44, one[0] + 34, one[1] + 44, 'W')        # the one window: the story light
    fr.rect(one[0] - 3, one[1] - 44, one[0] + 3, one[1] + 44, 'K')          # its mullion
    if run:
        w = 16 if payoff else 12
        path = [(250, 1226), (360, 1300), (598, 1300), (598, 1046)]
        if not payoff:                                                  # the pen's line: dark, the water inside it
            fr.line(path, 'K', 22)
        fr.line(path, 'L', w)
        fr.rect(426, 1282, 466, 1318, 'K')                              # the small box on the run
    fr.focal = one
    return one


def s1_home(fr, office=None, door='W', horizon=1124):
    """Scene 1's home view across the canal (setup A, camera ~1.3 m on our quay, horizon y 1124): the dusk sky with the
    band, the far facade (one mid mass), the lit Google door with her silhouette, the far towpath, the water with the
    door's light column, our quay in shade with one table and chair cut by the right edge."""
    fr.cloud(170, 150, 660, 236, 'M')                                   # the hero cloud, cut by the left edge
    fr.skyline(0, 330, 1150, (1004, 1066), 'M', wmin=36, wmax=86, gable=0.25)   # the far city by the sun, low
    fr.rect(0, 1082, 334, 1136, 'M', amp=2)                             # the bridge's deck
    fr.poly([(56 + 210 * t, 1232 - 92 * math.sin(math.pi * t)) for t in np.linspace(0, 1, 30)], 'D')  # its arch
    roof = [(300, 794), (300, 774), (410, 770), (414, 754), (600, 750), (604, 764), (790, 762), (794, 744),
            (1080, 742)]
    fr.hpoly(roof + [(1080, 1232), (300, 1232)], 'M', amp=2)            # the far facade: one mid mass
    for bx, by, r in ((360, 768, 26), (452, 750, 30), (650, 760, 22), (860, 742, 28), (990, 740, 24)):
        fr.blob(bx, by, r * 1.5, r, 'M', 0.15)                          # planting on its roofs, tone-on-tone
    if office is not None:                                              # the upper floor's panes, one of them hers
        for x in (330, 410, 650, 730, 810, 890, 970):
            fr.rect(x, 860, x + 56, 950, 'D', amp=1.2)
        fr.rect(486, 846, 594, 966, 'K' if office == 'dark' else 'W', amp=1.2)
        if office == 'lit':
            fr.bust(548, 966, 74, 'K')
    fr.rect(545, 990, 725, 1232, door, amp=1.2)                         # the door
    if door == 'W':
        fr.person(682, 1228, 158, 'K')                                  # her silhouette in it
    fr.rect(0, 1232, 1080, 1268, 'D')                                   # the far towpath
    if door == 'W':
        fr.ell(635, 1249, 136, 13, 'L')                                 # the door's pool on it
    rag = wobble((1080, 1330), (300, 1322), 9, fr.rng, 30)
    fr.poly([(300, 1268), (1080, 1268)] + rag, 'M')                     # the facade's reflection
    fr.poly([(0, 1268), (334, 1268), (334, 1296), (0, 1300)], 'M')      # the bridge's
    if door == 'W':
        fr.column(635, 1272, 1450, 150, 96, 'W')                        # the door's broken light column
    fr.rect(0, 1452, 1080, 1478, 'M')                                   # our coping, lit by the sky
    fr.rect(0, 1478, 1080, 1920, 'D')                                   # our quay in the canopy's shade
    fr.ell(1010, 1648, 112, 17, 'K')                                    # a table and a chair, cut by the right edge
    fr.rect(1003, 1648, 1017, 1772, 'K')
    fr.ell(1010, 1774, 56, 9, 'K')
    fr.poly([(880, 1600), (896, 1598), (902, 1690), (946, 1688), (950, 1800), (940, 1800), (936, 1706), (906, 1708),
             (904, 1800), (894, 1800)], 'K')
    return horizon


# ---------------------------------------------------------------------------------------------------------------------
# The recipes (frame px; the numbers are the recipes' own: ../COMPOSITION_SHOTS.md §0-§3)
# ---------------------------------------------------------------------------------------------------------------------
def sr1():
    """The hook at ~2.2 s: the pen has drawn the pipe first (the darkest line), the world stands in flat values round
    it, and the one window has just lit on "heat" in the golden box."""
    fr = Frame(1, 'D')
    one = v4_home(fr, payoff=False)
    fr.ell(598, 1046, 13, 13, 'K')                                      # the pen tip, lifting at the radiator
    fr.g('arrow', [(208, 1272), (338, 1346), (642, 1346), (642, 1080)])  # the pen's path: the line first
    fr.g('ring', one[0], one[1], 96)
    return fr


def sr2():
    """Home across the water, the open variant (setup A): stacked level bands, one lit opening on the far bank."""
    fr = Frame(2, 'L')
    yh = s1_home(fr)
    fr.g('line', [(0, yh), (1080, yh)], dash=True)                     # the horizon, off the half
    fr.g('box', 528, 976, 742, 1240)                                    # the one opening
    fr.g('arrow', [(635, 1440), (635, 1262)])                           # its light column confirms it from below
    fr.focal = (635, 1110)
    return fr


def sr3():
    """The lane along the towpath: the walls' feet and the coping converge on the lit door that closes the vista."""
    fr = Frame(3, 'L')
    vp = (606, 1080)
    fr.cloud(150, 150, 600, 226, 'M')
    # the far bank across the canal: low buildings, their tops under the band, receding to the vista
    top = lambda x: 640 + (1050 - 640) * (x / 560.0) ** 1.15  # noqa: E731
    pts, x = [(0, 1150)], 0.0
    while x < 560:
        w = 70 + 60 * (1 - x / 560.0) * fr.rng.uniform(0.7, 1.2)
        xe = min(560.0, x + w)
        t = top(x) + fr.rng.uniform(-16, 10)
        pts += [(x, t), (xe, t)]
        x = xe
    pts += [(560, 1090)]
    fr.poly(pts, 'M')
    fr.poly([(0, 1150), (560, 1090), (560, 1104), (0, 1196)], 'M')      # its reflection's top, ragged below
    fr.poly(wobble((0, 1196), (560, 1104), 7, fr.rng, 28) + [(560, 1090), (0, 1150)], 'M')
    # the bridge crossing the canal at the far end, the water seen through its arch
    fr.rect(390, 1030, 640, 1076, 'D', amp=1.5)
    fr.poly([(430 + 150 * t, 1110 - 30 * math.sin(math.pi * t)) for t in np.linspace(0, 1, 20)] + [(580, 1110)], 'L')
    # the building at the end of the walk, its lit door: the closed vista
    fr.rect(560, 892, 720, 1112, 'D', amp=1.5)
    fr.rect(578, 978, 638, 1104, 'W')
    fr.person(616, 1102, 98, 'K')
    # the towpath floor (mid), its lit lane down the middle to the door; the coping along the canal
    foot = lambda x: 1120 + (x - 690) * (173.0 / 390.0)  # noqa: E731
    fr.poly([(-120, 1920), (1080, 1920), (1080, foot(1080)), (690, foot(690)), (610, 1112), (560, 1110)], 'M')
    fr.poly([(300, 1920), (640, 1920), (612, 1112), (596, 1112)], 'L')  # the lit lane
    fr.ell(606, 1114, 60, 8, 'L')
    fr.poly([(-262, 1920), (-120, 1920), (560, 1110), (552, 1110)], 'D')  # the coping
    # the tall wall at the right, cut by the top: its face light (the band lies on it), its panes one texture
    yt = lambda x: 760 + (x - 690) * (-3.56)  # noqa: E731
    fr.poly([(903, 0), (1080, 0), (1080, foot(1080)), (690, foot(690)), (690, 760)], 'L')
    for (ha, hb) in ((0.08, 0.15), (0.22, 0.29), (0.36, 0.43)):
        xs = [1060, 990, 930, 880, 840, 806, 778, 755, 736, 720]
        for xa, xb in zip(xs[1:], xs[:-1]):
            xa2, xb2 = xa + (xb - xa) * 0.18, xb - (xb - xa) * 0.18
            q = [(xa2, foot(xa2) + (yt(xa2) - foot(xa2)) * hb), (xb2, foot(xb2) + (yt(xb2) - foot(xb2)) * hb),
                 (xb2, foot(xb2) + (yt(xb2) - foot(xb2)) * ha), (xa2, foot(xa2) + (yt(xa2) - foot(xa2)) * ha)]
            if min(p[1] for p in q) > 636:
                fr.poly(q, 'M')
    fr.poly([(1080, foot(1080)), (690, foot(690)), (690, foot(690) - 26), (1080, foot(1080) - 120)], 'D')  # plinth
    fr.g('line', [(1080, foot(1080) + 4), (664, foot(664) + 2)])        # the wall's foot
    fr.g('line', [(-40, 1700), (548, 1112)])                            # the coping
    fr.g('line', [(0, 1150), (548, 1092)], dash=True)                   # the far bank's foot
    fr.g('ring', vp[0], 1040, 74)
    fr.focal = (608, 1040)
    return fr


def sr4():
    """The nook inside the flat behind the one window: refuge on two edges and the top, one opening, the low lamp's
    pool on the sill and the radiator (the subject) under it; the snowy street a cool step darker in the glass."""
    fr = Frame(4, 'L')                                                  # the room's wall: the band lies on it
    fr.rect(118, 618, 912, 1022, 'K', amp=2)                            # the window's frame
    fr.rect(136, 636, 894, 1004, 'D', amp=1.5)                          # the glass: the night outside
    fr.skyline(136, 894, 1004, (900, 948), 'K', wmin=56, wmax=130, gable=0.3)
    fr.rect(136, 966, 894, 1004, 'M')                                   # the street's snow, a cool step down
    fr.rect(206, 752, 334, 990, 'K', amp=1.5)                           # the giant computer by the harbour
    fr.dots(np.arange(226, 320, 22), np.arange(780, 960, 26), 4, 'M', skip=0.3, jit=1)
    fr.rect(686, 636, 698, 1004, 'K')                                   # one mullion, clear of the landmark
    fr.rect(96, 1022, 934, 1054, 'M', amp=1.5)                          # the sill
    fr.hpoly([(0, 0), (780, 0), (780, 150), (720, 192), (0, 196)], 'D', amp=2)   # the soffit over the top-left
    fr.rect(0, 190, 86, 1920, 'D', amp=2)                               # the bookcase, cut by the left edge
    for y in (420, 640, 860, 1080, 1300):
        fr.rect(0, y, 82, y + 14, 'K')
    fr.rect(0, 1560, 1080, 1920, 'M')                                   # the floor
    fr.ell(548, 1040, 236, 24, 'L')                                     # the lamp's pool, falling off
    fr.ell(548, 1036, 150, 15, 'W')
    fr.rect(372, 1070, 708, 1196, 'D', amp=1.5)                         # the radiator: the subject
    for x in range(394, 700, 26):
        fr.rect(x, 1084, x + 7, 1186, 'K')
    fr.rect(374, 1070, 706, 1084, 'L')                                  # its top, lit by the lamp
    fr.rect(390, 1196, 404, 1222, 'K')
    fr.rect(676, 1196, 690, 1222, 'K')
    fr.poly([(500, 960), (596, 960), (582, 898), (514, 898)], 'K')      # the lamp: its shade
    fr.ell(548, 964, 40, 9, 'W')                                        # its light under the shade
    fr.rect(544, 968, 552, 1028, 'K')
    fr.ell(548, 1028, 28, 7, 'K')
    fr.hpoly([(810, 1460), (1080, 1430), (1080, 1920), (748, 1920), (780, 1620)], 'K', amp=3)  # an armchair, cut
    fr.g('line', [(48, 1520), (48, 48), (740, 48)])                     # the refuge, held on two edges
    fr.g('box', 118, 618, 912, 1022, dash=True)                         # the one opening
    fr.g('ring', 548, 1062, 92)
    fr.focal = (548, 1062)
    return fr


def sr5():
    """The balcony: from the next block's snowy balcony, 45 degrees down; the lid behind the captions, the street's
    C-curve, the warm water's front on it (the subject, its own light), the snow below the calm field."""
    fr = Frame(5, 'M')                                                  # the snow: the floor, one calm field
    fr.hpoly([(0, 0), (1080, 0), (1080, 628), (0, 652)], 'D', amp=4)    # the lid: the facade across the street
    centre = [(-80, 690), (160, 742), (360, 860), (560, 990), (760, 1010), (920, 966), (1120, 912)]
    fr.poly(ribbon(centre, 74), 'D')                                    # the street: one C-curve
    kerb = [(x, y + 112) for x, y in centre]
    fr.blob(560, 1104, 92, 30, 'L', 0.06)                               # the front's glow on the snow
    melt = [p for p in catmull(kerb, 10) if p[0] <= 540]
    fr.line(melt, 'K', 15)                                              # the melt line behind the front
    fr.ell(560, 1103, 30, 15, 'W')                                      # the warm water's front: the story light
    fr.poly([(0, 640), (-10, 1300), (60, 1360), (150, 1250), (196, 1030), (150, 820), (90, 690)], 'K')  # side mass
    fr.hpoly([(990, 760), (1080, 740), (1080, 1520), (1000, 1560), (968, 1100)], 'K', amp=3)  # the mouth's mass
    # the tram on the curve, going the other way
    a = math.radians(-14)
    cx, cy = 830, 975
    tram = [(-130, -36), (130, -36), (136, 36), (-136, 36)]
    rot = lambda p: (cx + p[0] * math.cos(a) - p[1] * math.sin(a), cy + p[0] * math.sin(a) + p[1] * math.cos(a))  # noqa
    fr.poly([rot(p) for p in tram], 'K')
    for i in range(5):
        fr.poly([rot(p) for p in [(-112 + i * 48, -20), (-80 + i * 48, -20), (-80 + i * 48, 4), (-112 + i * 48, 4)]],
                'M')
    for x, y, P in ((250, 726, 92), (300, 734, 84), (650, 712, 88), (430, 1196, 104), (700, 1214, 96)):
        fr.person(x, y, P, 'K')                                         # walkers, small, in twos and threes
    fr.hpoly([(720, 1920), (780, 1730), (1080, 1650), (1080, 1920)], 'K', amp=3)  # our balcony's corner, cut twice
    fr.g('curve', [(40, 716), (230, 772), (400, 888), (560, 990), (760, 1010), (900, 970), (1010, 930)], arrow=True)
    fr.g('ring', 560, 1103, 70)
    fr.focal = (560, 1103)
    return fr


def sr6():
    """The lit opening: a C push to the Google door; its aperture the lightest area, her silhouette dark in it."""
    fr = Frame(6, 'L')
    fr.cloud(930, 150, 660, 236, 'M')                                   # the hero cloud, cut by the right edge
    roof = [(0, 668), (180, 664), (184, 650), (520, 646), (524, 660), (760, 662), (764, 642), (1080, 638)]
    fr.hpoly(roof + [(1080, 1382), (0, 1382)], 'M', amp=2)              # the brick: one mid mass
    fr.hpoly([(296, 700), (816, 700), (808, 770), (304, 770)], 'D', amp=2)   # the canopy
    fr.rect(318, 770, 794, 1382, 'D', amp=1.5)                          # the frame round the aperture
    fr.rect(336, 778, 776, 1378, 'W')                                   # the lit aperture: the story light
    fr.person(606, 1372, 300, 'K')                                      # her silhouette, ~300 px
    fr.blob(236, 1300, 64, 56, 'K', 0.12)                               # a planter by the door
    fr.rect(196, 1320, 276, 1382, 'K', amp=1.5)
    fr.rect(0, 1382, 1080, 1436, 'D')                                   # the far towpath
    fr.ell(556, 1400, 300, 22, 'L')                                     # the door's pool on it
    fr.ell(556, 1398, 190, 13, 'W')
    fr.poly([(0, 1436), (1080, 1436)] + wobble((1080, 1512), (0, 1504), 9, fr.rng, 30), 'M')   # its reflection
    fr.column(556, 1440, 1724, 400, 250, 'W')                           # the light column
    fr.rect(0, 1728, 1080, 1920, 'D')                                   # our side, quiet
    fr.g('box', 326, 770, 786, 1386)                                    # the frame within the frame
    fr.g('arrow', [(556, 612), (556, 760)])                             # the drop: from the words into it
    fr.focal = (556, 1080)
    return fr


def sr7():
    """The path in, from a raised quay (setup B): the door's broken light column is the one line in, rising from our
    side of the water to the lit door; the quay stays level and quiet."""
    fr = Frame(7, 'L')
    fr.cloud(170, 150, 640, 236, 'M')
    roof = [(0, 702), (220, 698), (224, 682), (470, 680), (474, 700), (690, 704), (694, 688), (1080, 686)]
    fr.hpoly(roof + [(1080, 1102), (0, 1102)], 'M', amp=2)
    for bx, by, r in ((120, 700, 26), (330, 682, 30), (600, 702, 22), (900, 688, 28)):
        fr.blob(bx, by, r * 1.5, r, 'M', 0.15)
    fr.rect(500, 950, 616, 1102, 'D', amp=1)
    fr.rect(508, 958, 608, 1100, 'W')                                   # the lit door: the story light
    fr.person(582, 1098, 104, 'K')
    fr.rect(0, 1102, 1080, 1156, 'D')                                   # the far towpath, wider from above
    fr.ell(558, 1122, 124, 15, 'L')
    fr.hpoly([(780, 1166), (1080, 1150), (1080, 1218), (808, 1214)], 'D', amp=2)   # boats at the far quay, cut
    fr.rect(850, 1128, 1010, 1166, 'D', amp=1.5)
    fr.poly([(0, 1156), (1080, 1156)] + wobble((1080, 1226), (0, 1218), 8, fr.rng, 30), 'M')   # reflection
    fr.column(558, 1160, 1630, 84, 150, 'W', broken=0.8)                # the one line in
    fr.rect(0, 1640, 1080, 1664, 'M')                                   # our coping
    fr.rect(0, 1664, 1080, 1920, 'D')                                   # our quay: level, quiet
    fr.ell(1004, 1770, 104, 15, 'K')
    fr.rect(997, 1770, 1011, 1890, 'K')
    fr.g('arrow', [(632, 1622), (632, 1150)])                           # the line in, ending at the light
    fr.g('ring', 558, 1028, 92)
    fr.focal = (558, 1028)
    return fr


def sr8():
    """The break in the row: the block's panes are one dark texture inside one mass; one window lit, a person in it."""
    fr = Frame(8, 'D')
    fr.cloud(150, 150, 640, 236, 'M')
    fr.hpoly([(0, 772), (92, 768), (92, 1470), (0, 1470)], 'K', amp=2)  # the neighbours, cut by the edges
    fr.hpoly([(986, 724), (1080, 720), (1080, 1470), (986, 1470)], 'K', amp=2)
    roof = [(92, 668), (300, 664), (304, 640), (336, 640), (340, 662), (760, 656), (764, 634), (792, 634),
            (796, 654), (986, 652)]
    fr.hpoly(roof + [(986, 1470), (92, 1470)], 'K', amp=2)              # the block: one mass
    fr.hpoly([(88, 672), (990, 656), (986, 642), (92, 658)], 'M', amp=2)  # snow on its roof
    one = (540, 1000)
    fr.windows((170, 290, 410, 540, 670, 790, 910), (760, 880, 1000, 1120, 1240, 1360), 74, 96, 'D', skip=0.14,
               jit=7, size_jit=0.12, avoid=(one,))
    fr.rrect(one[0] - 58, one[1] - 70, one[0] + 58, one[1] + 70, 24, 'L')   # its glow, one step
    fr.rect(one[0] - 40, one[1] - 52, one[0] + 40, one[1] + 52, 'W')        # the one lit window
    fr.bust(one[0] + 6, one[1] + 52, 70, 'K')                               # a person in it
    fr.rect(0, 1470, 1080, 1920, 'M')                                   # the street's snow
    fr.g('box', 128, 700, 952, 1420, dash=True)                         # the pattern: one texture in one mass
    fr.g('ring', one[0], one[1], 92)
    fr.focal = one
    return fr


def sr9():
    """On the line of light: a walker crossing the harbour front, dark against the far shore's lit band on the horizon
    (y 1200), camera ~1.15 m; the snow cloud high on the far side."""
    fr = Frame(9, 'D')
    yh = 1200
    fr.cloud(880, 160, 760, 236, 'M')
    fr.skyline(0, 1080, yh - 12, (1130, 1168), 'K', wmin=40, wmax=120, gable=0.15)
    fr.rect(0, yh - 14, 1080, yh + 12, 'W')                             # the lit line: the story light
    for x in (130, 318, 600, 836, 990):
        fr.rect(x, yh - 14, x + fr.rng.uniform(10, 24), yh + 12, 'K')
    fr.rect(0, yh + 12, 1080, 1272, 'K')                                # the harbour
    for _ in range(16):
        x, y = fr.rng.uniform(0, 1000), fr.rng.uniform(yh + 20, 1262)
        fr.ell(x, y, fr.rng.uniform(26, 70), 3.5, 'L')                  # the line, broken in the water
    fr.rect(0, 1272, 1080, 1920, 'M')                                   # the quay's snow
    fr.person(480, 1322, 180, 'K', view='side')                         # the walker, ~180 px, its lead room ahead
    fr.g('line', [(30, yh + 40), (1050, yh + 40)])                      # the cross: the lit line (just under it) ...
    fr.g('line', [(480, 1078), (480, 1376)])                            # ... and the one upright on it
    fr.focal = (480, yh)
    return fr


def sr10():
    """The follow (S11): the camera trucks right with the hot water's front, held at x ~400 with its lead room ahead,
    while the street slides past above; the snow melts just behind the front."""
    fr = Frame(10, 'D')
    fr.skyline(0, 1080, 1010, (650, 720), 'K', wmin=150, wmax=260, gable=0.35)
    fr.windows((80, 200, 330, 460, 590, 720, 850, 980), (770, 870), 54, 70, 'D', skip=0.3, jit=8, size_jit=0.12)
    fr.rrect(744, 902, 1120, 1004, 30, 'D')                             # the tram, going the other way
    for x in range(776, 1080, 64):
        fr.rect(x, 922, x + 40, 952, 'M')
    fr.rect(0, 1004, 1080, 1060, 'M')                                   # the street's snow
    fr.rect(0, 1034, 396, 1050, 'D')                                    # the melt just behind the front
    fr.poly([(0, 1060), (1080, 1060)] + wobble((1080, 1092), (0, 1096), 8, fr.rng, 28), 'M')   # the cut's soft edge
    fr.blob(404, 1160, 78, 52, 'L', 0.08)                               # the front's glow in the ground
    fr.rect(0, 1140, 1080, 1182, 'K', amp=1)                            # the pipe
    fr.rect(0, 1150, 384, 1172, 'L')                                    # the hot water behind its front
    fr.ell(398, 1161, 26, 18, 'W')                                      # the front: the story light
    fr.g('line', [(400, 660), (400, 1500)], dash=True)                  # held at x 400 on screen
    fr.g('arrow', [(450, 1216), (820, 1216)])                           # its travel, and its lead room
    fr.g('ring', 400, 1161, 62)
    fr.focal = (400, 1161)
    return fr


def sr11():
    """The level change (setup B, horizon y 760): the computer on the harbour front below, the block and its one
    window on the street above, joined by the steps the melt line climbs (40 degrees)."""
    fr = Frame(11, 'D')
    fr.cloud(170, 150, 620, 226, 'M')
    fr.skyline(0, 1080, 770, (692, 736), 'K', wmin=50, wmax=120, gable=0.2)
    # the upper level: the street and the block on it
    fr.rect(420, 1000, 1080, 1122, 'M')
    roof = [(520, 646), (640, 642), (644, 626), (672, 626), (676, 640), (960, 636)]
    fr.hpoly(roof + [(964, 1012), (516, 1012)], 'K', amp=2)
    fr.hpoly([(514, 650), (966, 640), (962, 628), (518, 636)], 'M', amp=2)
    one = (640, 930)
    fr.windows((580, 700, 820, 910), (720, 820, 930), 56, 72, 'D', skip=0.2, avoid=((700, 930),))
    fr.rrect(596, 872, 684, 988, 20, 'L')
    fr.rect(612, 886, 668, 974, 'W')                                    # the one window
    fr.ell(640, 1030, 96, 13, 'L')                                      # its pool on the snow
    fr.poly([(420, 1122), (1080, 1122), (1080, 1300), (300, 1440)], 'K')  # the retaining wall between the levels
    # the steps down to the harbour front, the melt line climbing them
    ramp = ribbon([(560, 1060), (360, 1230), (160, 1410)], 62)
    fr.poly(ramp, 'M')
    for t in np.linspace(0.08, 0.94, 11):
        x, y = 560 - 400 * t, 1060 + 350 * t
        fr.line([(x - 44, y - 50), (x + 44, y + 50)], 'D', 5)
    fr.rect(0, 1400, 1080, 1920, 'M')                                   # the lower level: the harbour front
    fr.poly(ramp, 'M')
    fr.hpoly([(40, 960), (296, 954), (300, 1440), (36, 1440)], 'K', amp=2)   # the giant computer: the cause
    fr.dots(np.arange(68, 280, 30), np.arange(1000, 1400, 36), 5, 'M', skip=0.3, jit=1.5)
    fr.steam(170, 950, 680, 200, 'M', sway=30)
    fr.line(catmull([(300, 1420), (190, 1404), (360, 1232), (560, 1064), (640, 1020)], 10), 'D', 16)  # the melt line
    fr.g('line', [(470, 1014), (1050, 1014)])                           # the upper level
    fr.g('line', [(20, 1446), (520, 1446)])                             # the lower level
    fr.g('arrow', [(214, 1390), (560, 1062)])                           # the one diagonal joining them
    fr.g('ring', one[0], one[1], 84)
    fr.focal = one
    return fr


def sr12():
    """The close (S3): the computer's top ~700 px wide on the axis, the melt on it lit, steam pouring off and thinning
    below the band, the snowy night one quiet dark field behind."""
    fr = Frame(12, 'D')
    fr.rect(36, 640, 62, 1920, 'K')                                     # a post, cut by the left edge
    fr.steam(540, 930, 640, 520, 'M', sway=40)                          # the steam, thinning below the band
    fr.steam(540, 930, 820, 300, 'L', sway=20)
    fr.poly([(214, 912), (866, 912), (890, 952), (190, 952)], 'L')      # its top, catching the light
    fr.poly([(400, 916), (680, 916), (690, 948), (390, 948)], 'W')      # the melt, lit: the story light
    fr.rect(190, 952, 890, 1920, 'K')                                   # its face, the deepest
    fr.rect(190, 952, 212, 1920, 'M')                                   # a rim on the key's side
    fr.dots(np.arange(250, 860, 40), np.arange(1010, 1500, 44), 4.5, 'L', skip=0.35, jit=1.0)  # its small lights
    for _ in range(70):                                                 # snow falling (none in the band)
        x, y = fr.rng.uniform(0, 1080), fr.rng.uniform(630, 1880)
        if 180 < x < 900 and y > 860:
            continue
        fr.ell(x, y, 5, 5, 'M')
    fr.g('hdim', 868, 190, 890)                                         # its size: >= 60 % of the width
    fr.g('ring', 540, 932, 96)
    fr.focal = (540, 932)
    return fr


def sr13():
    """The hands (S12): your gloved hand and phone rise from the bottom left; the chat bubble on the lit screen; the
    warm run and the one window above and right of it, a step under, changing on the same word."""
    fr = Frame(13, 'D')
    yh = 1150
    fr.cloud(910, 150, 640, 236, 'M')
    fr.rect(0, 1070, 1080, yh, 'M')
    fr.skyline(0, 1080, yh, (1082, 1130), 'K', wmin=36, wmax=100, gable=0.2)
    fr.rect(0, yh, 1080, 1196, 'D')
    fr.hpoly([(0, 770), (176, 764), (180, 1196), (0, 1196)], 'K', amp=2)    # the computer at the far left
    fr.dots(np.arange(24, 170, 30), np.arange(810, 1170, 36), 5, 'M', skip=0.3)
    fr.rect(0, 1196, 1080, 1920, 'M')
    roof = [(540, 650), (640, 646), (644, 626), (674, 626), (678, 644), (940, 640)]
    fr.hpoly(roof + [(944, 1256), (536, 1256)], 'K', amp=2)
    fr.hpoly([(534, 654), (946, 644), (942, 632), (538, 640)], 'M', amp=2)
    fr.windows((600, 700, 800, 890), (730, 830, 930, 1040, 1140), 56, 74, 'D', skip=0.2, avoid=((700, 930),))
    fr.rect(664, 884, 736, 976, 'L')                                    # the one window, a step under the screen
    fr.line([(180, 1210), (420, 1240), (700, 1250), (700, 980)], 'L', 14)   # the warm run
    # the hand and the phone
    fr.poly([(0, 1920), (0, 1560), (150, 1400), (262, 1300), (330, 1330), (420, 1420), (360, 1560), (330, 1920)], 'K')
    fr.rrect(262, 934, 500, 1366, 34, 'K')                              # the phone
    fr.rrect(280, 958, 482, 1342, 22, 'W')                              # its screen: the local story light
    fr.rrect(312, 1080, 452, 1160, 26, 'D')                             # the chat bubble
    fr.poly([(330, 1150), (316, 1186), (360, 1158)], 'D')
    fr.poly([(250, 1300), (226, 1250), (262, 1200), (290, 1290)], 'K')  # the thumb's side
    fr.g('line', [(694, 932), (420, 1090)], dash=True)                  # cause above, effect in hand: one group
    fr.g('ring', 700, 930, 64)
    fr.g('ring', 382, 1120, 84)
    fr.g('arrow', [(130, 1880), (250, 1420)])                           # the hand from the bottom left
    fr.focal = (382, 1120)
    return fr


def sr14():
    """The "you" and the world: setup A (camera 1.6 m, horizon y 1200); the "you" from behind at the street's near
    edge, ~180 px, its head on the horizon; the far city one band of lit windows; the one lit window on its sightline."""
    fr = Frame(14, 'D')
    yh = 1200
    fr.cloud(900, 150, 680, 236, 'M')
    fr.skyline(0, 1080, yh, (1108, 1160), 'K', wmin=36, wmax=110, gable=0.2)
    fr.rect(0, 1170, 1080, yh, 'L')                                     # the far city's band of lit windows
    for x in np.arange(0, 1080, 64):
        fr.rect(x + fr.rng.uniform(0, 30), 1170, x + fr.rng.uniform(36, 52), yh, 'K')   # broken by dark walls
    fr.hpoly([(470, 772), (660, 766), (664, yh), (466, yh)], 'K', amp=2)  # the block, tall, far
    fr.hpoly([(466, 776), (668, 768), (664, 756), (470, 764)], 'M', amp=2)
    fr.windows((510, 560, 610), (850, 1100), 32, 44, 'D', skip=0.25)
    fr.rrect(526, 954, 594, 1046, 14, 'L')
    fr.rect(536, 966, 584, 1034, 'W')                                   # the one window: the story light
    fr.rect(0, yh, 1080, 1248, 'D')                                     # the harbour
    for _ in range(12):
        fr.ell(fr.rng.uniform(0, 1080), fr.rng.uniform(yh + 10, 1240), fr.rng.uniform(20, 50), 3, 'L')
    fr.rect(0, 1248, 1080, 1920, 'M')                                   # the street's near edge, snow
    fr.person(270, 1369, 180, 'K')                                      # the "you", head on the horizon
    fr.g('arrow', [(296, 1196), (520, 1018)], dash=True)                # its sightline to the one window
    fr.g('vdim', 176, 1189, 1369)                                       # a known size: 180 px
    fr.g('ring', 560, 1000, 70)
    fr.focal = (560, 1000)
    return fr


def sr15():
    """Tiny under giant (S10's planned hall): a worm's-eye (camera 0.3 m, horizon y 1170); rows of giant computers run
    past both edges and the top, one engineer ~130 px at their foot in the light of the aisle."""
    fr = Frame(15, 'D')                                                 # the giant's face: one flat field
    fr.poly([(0, 0), (330, 0), (250, 110), (0, 150)], 'M')              # a sliver of the night over the open hall
    for x in (150, 330, 750, 930):
        fr.rect(x - 7, 620, x + 7, 1182, 'K')                           # the seams between the machines
    for x0, x1 in ((0, 143), (157, 323), (337, 743), (757, 923), (937, 1080)):
        fr.dots(np.arange(x0 + 26, x1 - 10, 34), np.arange(660, 1150, 46), 5, 'L', skip=0.4, jit=1)
    fr.rect(486, 898, 594, 1184, 'W')                                   # the lit aisle at its foot: the story light
    fr.rect(0, 1182, 1080, 1920, 'L')                                   # the floor: light, plain
    fr.ell(540, 1206, 176, 26, 'W')                                     # the light's pool at the figure's spot
    fr.person(540, 1198, 130, 'K')                                      # the engineer, ~130 px
    fr.g('line', [(40, 1186), (1040, 1186)])                            # the cross: the ground line ...
    fr.g('line', [(540, 640), (540, 1290)])                             # ... and the giant's vertical
    fr.g('arrow', [(110, 1160), (110, 650)])                            # the giant's height (and the tilt-up)
    fr.focal = (540, 1130)
    return fr


def sr16():
    """The big sky (S3): a low horizon (y ~1400); one cloud bank in planes below the band; the sun half behind its
    edge; the bridge's arch the one landmark on the left third."""
    fr = Frame(16, 'L')
    fr.ell(372, 1106, 44, 44, 'W')                                      # the sun, half behind the bank's edge
    fr.cloud(760, 905, 940, 390, 'M', lobes=6, base=1094)               # the bank: the near plane, cut by the right
    fr.poly(wobble((330, 1093), (1080, 1090), 4, fr.rng, 40) + [(1080, 1074), (360, 1080)], 'D')   # its shade underside
    fr.cloud(110, 1236, 380, 120, 'M', lobes=4)                         # a far, smaller cloud, cut by the left edge
    fr.cloud(780, 1286, 300, 80, 'M', lobes=3)                          # the farthest
    fr.skyline(0, 1080, 1520, (1386, 1424), 'D', wmin=26, wmax=90, gable=0.2)   # the far city, a thin strip
    fr.rect(196, 1296, 500, 1338, 'D', amp=1.5)                         # the bridge's deck
    fr.poly([(196, 1338), (500, 1338), (500, 1420), (196, 1420)], 'D')
    fr.poly([(232 + 236 * t, 1426 - 74 * math.sin(math.pi * t)) for t in np.linspace(0, 1, 26)], 'L')   # its arch
    fr.rect(0, 1520, 1080, 1920, 'K')                                   # the near ground, one dark mass
    fr.g('line', [(360, 640), (360, 1500)])                             # the left third ...
    fr.g('line', [(30, 1400), (1050, 1400)])                            # ... and the low horizon, 0.73 H
    fr.focal = (360, 1300)
    return fr


def sr17():
    """The one big move (S6), its end frame: out from the mug to the Earth's curve, Helsinki a small lit spot held at the
    pivot; the curve's top at y 820, off the half; the nested frames are the move's earlier steps."""
    fr = Frame(17, 'K')
    R = 2600.0
    arc = lambda x: 820 + R - math.sqrt(R * R - (x - 540) ** 2)  # noqa: E731
    xs = np.linspace(0, 1080, 60)
    fr.poly([(x, arc(x) - 130 - 10 * abs(x - 540) / 540) for x in xs] + [(x, arc(x)) for x in xs[::-1]], 'D')
    fr.poly([(x, arc(x)) for x in xs] + [(1080, 1920), (0, 1920)], 'D')     # the Earth at dusk
    fr.poly([(x, arc(x) - 7) for x in xs] + [(x, arc(x) + 9) for x in xs[::-1]], 'L')   # the limb's light
    fr.poly([(760, arc(760) + 9), (1080, arc(1080) + 9), (1080, 1920), (930, 1920), (860, 1400), (790, 1080)], 'M')
    fr.blob(330, 1086, 420, 42, 'K', 0.10)                              # the gulf
    fr.blob(140, 1180, 260, 60, 'K', 0.12)
    fr.blob(820, 1240, 180, 40, 'D', 0.15)                              # cloud over the dusk side, a step down
    fr.ell(540, 1000, 30, 22, 'L')
    fr.ell(540, 1000, 14, 11, 'W')                                      # Helsinki: the story light at the pivot
    for x, y in ((470, 1032), (612, 1024), (420, 1010), (660, 1060)):
        fr.ell(x, y, 5, 5, 'L')
    for i, (w, h) in enumerate(((54, 96), (162, 288), (405, 720))):
        fr.g('box', 540 - w / 2, 1000 - h / 2, 540 + w / 2, 1000 + h / 2, dash=i > 0)   # the move, held on the pivot
    fr.focal = (540, 1000)
    return fr


def sr18():
    """The off-balance (S7, "But Helsinki WANTS that heat"): the computer lands off the axis at x ~330, one heavy dark
    mass with nothing against it; the city's pipe reaches in from the right across the open half."""
    fr = Frame(18, 'D')
    fr.skyline(0, 1080, 1092, (1052, 1076), 'K', wmin=40, wmax=110, gable=0.1)
    fr.rect(0, 1150, 1080, 1920, 'M')                                   # the plan's snowy floor
    fr.steam(330, 712, 630, 240, 'M', sway=24)
    fr.hpoly([(150, 706), (510, 700), (512, 1334), (148, 1334)], 'K', amp=2)   # the giant computer: the heavy mass
    fr.rect(484, 712, 512, 1324, 'W')                                   # the raking key on its edge: the story light
    fr.rect(152, 694, 510, 712, 'L', amp=1)
    fr.dots(np.arange(186, 470, 36), np.arange(760, 1300, 44), 5, 'M', skip=0.3)
    fr.ell(330, 1344, 220, 20, 'D')                                     # its shadow on the snow
    fr.rect(716, 1428, 1080, 1458, 'K')                                 # the city's pipe, ending short
    fr.line([(716, 1443), (514, 1443)], 'K', 7)                         # the stretch the pen draws: empty
    fr.g('line', [(540, 640), (540, 1500)], dash=True)                  # the axis it left
    fr.g('arrow', [(1040, 1396), (548, 1396)])                          # the reach across the open half
    fr.g('ring', 330, 1010, 120)
    fr.focal = (330, 1010)
    return fr


def sr19():
    """The matched pair: the home view with her office window on the axis the one warm pane; then (inset) the same
    frame on "She quit", the pane dark and nothing else changed."""
    fr = Frame(19, 'L')
    s1_home(fr, office='lit', door='D')
    after = Frame(19, 'L')
    s1_home(after, office='dark', door='D')
    fr.inset = (after, (40, 1404))
    fr.g('box', 40, 1404, 40 + TW, 1404 + TH)
    fr.g('arrow', [(470, 990), (232, 1380)], dash=True)
    fr.g('ring', 540, 906, 84)
    fr.focal = (540, 906)
    return fr


def sr20():
    """The seam: the melt line in the snow, from a little above (setup B): untouched snow on one side, the wet melt
    on the other, on a 33-degree diagonal; the hot water's front running along it, the one warm accent."""
    fr = Frame(20, 'D')
    fr.skyline(0, 1080, 792, (690, 740), 'K', wmin=46, wmax=120, gable=0.2)
    seam = wobble((0, 1500), (1080, 800), 7, fr.rng, 40)
    fr.poly(seam + [(1080, 1920), (0, 1920)], 'L')                      # untouched snow
    lit = [p for p in seam if p[0] <= 540]
    fr.line(lit, 'M', 18)
    fr.blob(540, 1150, 84, 40, 'M', 0.06)
    fr.ell(540, 1150, 34, 20, 'W')                                      # the front: the story light
    for x, y in ((760, 1200), (800, 1236), (842, 1270)):                # footprints across the untouched side
        fr.ell(x, y, 9, 5, 'M')
    fr.g('line', [(40, 1474), (1060, 813)])                             # the seam
    fr.g('ring', 540, 1150, 70)
    fr.focal = (540, 1150)
    return fr


def sr21():
    """The lineup (S4): 40 kettles in 5 rows of 8 on the snowy floor, one mid texture; the computer behind them, the
    pyramid's apex, with the hardest step."""
    fr = Frame(21, 'D')
    fr.steam(540, 712, 630, 300, 'M', sway=20)
    fr.hpoly([(330, 706), (750, 700), (752, 1164), (328, 1164)], 'K', amp=2)   # the giant computer
    fr.rect(332, 694, 750, 712, 'M', amp=1)
    fr.dots(np.arange(364, 730, 36), np.arange(750, 1140, 40), 5, 'M', skip=0.3)
    fr.rect(522, 874, 558, 1080, 'W')                                   # its lit grille: the story light
    fr.rect(0, 1164, 1080, 1920, 'L')                                   # the snowy floor
    rows = [(1180, 500, 50), (1232, 545, 56), (1288, 590, 62), (1346, 636, 68), (1406, 680, 74)]
    for y, width, s in rows:
        for i in range(8):
            x = 540 - width / 2 + width * (i + 0.5) / 8 + fr.rng.uniform(-3, 3)
            fr.blob(x, y - s * 0.30, s * 0.42, s * 0.36, 'M', 0.05)     # a kettle: body
            fr.poly([(x + s * 0.30, y - s * 0.40), (x + s * 0.62, y - s * 0.66), (x + s * 0.66, y - s * 0.58),
                     (x + s * 0.36, y - s * 0.22)], 'M')                # spout
            fr.ell(x, y - s * 0.66, s * 0.12, s * 0.07, 'D')            # lid knob
    for x in (430, 500, 580, 650):
        fr.steam(x, 1150, 1000, 60, 'M', sway=12)                       # their steam joining the computer's
    fr.g('tri', [(184, 1430), (896, 1430), (540, 960)])                 # the pyramid
    fr.g('ring', 540, 960, 70)
    fr.focal = (540, 977)
    return fr


def sr22():
    """The paper (S8): the 2027 tag on the plan's front wall on the axis, below the computer's middle; the paper lit,
    the place a step under it; the only word in the film's picture."""
    fr = Frame(22, 'D')
    fr.skyline(0, 1080, 1180, (1130, 1160), 'K', wmin=40, wmax=110, gable=0.15)
    fr.hpoly([(820, 1150), (1060, 1146), (1040, 1180), (836, 1180)], 'M', amp=2)   # a ferry beyond the plan
    fr.rect(0, 1180, 1080, 1920, 'M')                                   # the snow floor
    fr.steam(540, 694, 630, 300, 'M', sway=20)
    fr.hpoly([(330, 690), (750, 684), (752, 1400), (328, 1400)], 'K', amp=2)   # the giant computer in its plan
    fr.rect(332, 678, 750, 694, 'M', amp=1)
    fr.dots(np.arange(364, 730, 36), np.arange(730, 1060, 40), 5, 'M', skip=0.3)
    for x0, y0, x1, y1 in ((150, 760, 160, 1430), (920, 760, 930, 1430), (150, 760, 930, 770)):
        fr.rect(x0, y0, x1, y1, 'D')                                    # the plan's walls, only marked out
    fr.line([(540, 1050), (540, 1086)], 'K', 5)                         # the pin's string
    fr.ell(540, 1048, 8, 8, 'K')
    fr.rect(380, 1086, 700, 1300, 'W', amp=1.5)                         # the tag: the paper lit
    fr.text((540, 1196), '2027', 140, 'K')
    fr.g('vdim', 740, 1144, 1248)                                       # one number, 120-160 px
    fr.g('box', 366, 1072, 714, 1314, dash=True)                        # one light paper, one dark mark
    fr.focal = (540, 1193)
    return fr


def sr23():
    """The mirror: the lit doorway centred on x 540 across the still canal, doubled by its reflection to y ~1300; the
    two banks' dark masses mirrored at the sides."""
    fr = Frame(23, 'L')
    fr.cloud(540, 150, 560, 210, 'M')
    fr.hpoly([(160, 772), (430, 770), (540, 708), (650, 770), (920, 772), (920, 1060), (160, 1060)], 'M', amp=1.5)
    fr.rect(464, 846, 616, 1060, 'D', amp=1)
    fr.rect(472, 852, 608, 1058, 'W')                                   # the lit door: the story light
    fr.person(540, 1054, 150, 'K')
    fr.rect(160, 1060, 920, 1084, 'D')                                  # the far towpath
    fr.poly([(160, 1086), (920, 1086)] + wobble((920, 1300), (160, 1300), 6, fr.rng, 30), 'D')   # the reflection
    fr.rect(472, 1088, 608, 1290, 'L')                                  # the door's, a step darker and calmer
    fr.person(540, 1092, -150, 'D')                                     # her reflection
    banks = [blob_pts(60, 770, 130, 118, fr.rng, 0.14), blob_pts(96, 900, 150, 140, fr.rng, 0.12),
             blob_pts(70, 1010, 150, 110, fr.rng, 0.10), [(0, 1010), (196, 1010), (206, 1086), (0, 1086)],
             [(0, 1086), (206, 1086)] + wobble((206, 1086), (150, 1296), 8, fr.rng, 30) + [(0, 1306)]]
    for poly in banks:                                                  # the banks' dark masses, mirrored
        fr.poly(poly, 'K')
        fr.poly([(1080 - x, y) for x, y in poly], 'K')
    fr.rect(0, 1600, 1080, 1920, 'D')                                   # our near edge
    fr.g('line', [(540, 640), (540, 1560)])                             # the axis: the mirror's ...
    fr.g('line', [(110, 1086), (970, 1086)], dash=True)                 # ... and the water's
    fr.focal = (540, 955)
    return fr


def sr24():
    """The whole run (S12): the home view's matched frame at the payoff: the warm run lit end to end from the giant
    computer to the one window (the sweep, in its story order), the city lit, your phone from the bottom left."""
    fr = Frame(24, 'D')
    one = v4_home(fr, payoff=True)
    fr.poly([(0, 1920), (0, 1600), (110, 1480), (180, 1420), (240, 1440), (300, 1500), (250, 1640), (250, 1920)], 'K')
    fr.rrect(150, 1316, 318, 1520, 24, 'K')                             # your phone, a step under the window
    fr.rrect(164, 1332, 304, 1504, 16, 'L')
    fr.rrect(186, 1380, 280, 1424, 18, 'D')
    fr.g('arrow', [(250, 1180), (372, 1262), (642, 1262), (642, 1070)])  # the sweep: the run, in its story order
    fr.g('ring', one[0], one[1], 96)
    return fr


RECIPES = [  # (key, name, the beat, what the frame shows, the function)
    ('SR1', 'THE DRAWN SUBJECT', 'the hook, 0-3 s; the loop\'s frame',
     'video 4 S1 at ~2.2 s: the pen\'s line first, the one window lit on "heat"', sr1),
    ('SR2', 'HOME ACROSS THE WATER', 'the home place',
     'scene 1, setup A (horizon y 1124): v2\'s view, the lit door the opening', sr2),
    ('SR3', 'THE LANE', 'the home place: a street',
     'scene 1: along the towpath, the lines meet on the lit door (horizon y 1080)', sr3),
    ('SR4', 'THE NOOK', 'the home place: indoors',
     'video 4: inside the one window, the lamp\'s pool on the radiator', sr4),
    ('SR5', 'THE BALCONY', 'the home place from above; a crowd',
     'video 4: from the next block\'s balcony, the street\'s C-curve', sr5),
    ('SR6', 'THE LIT OPENING', 'the subject\'s moment',
     'scene 1: a C push to the Google door, her ~300 px silhouette in it', sr6),
    ('SR7', 'THE PATH IN', 'arrival; the thing at the end of the way',
     'scene 1, setup B (horizon ~780): the light column the one line in', sr7),
    ('SR8', 'THE BREAK IN THE ROW', 'the one among many',
     'video 4 S1, S12: the block\'s panes one texture, one window lit', sr8),
    ('SR9', 'ON THE LINE OF LIGHT', 'a person\'s moment',
     'video 4: a walker dark on the far shore\'s lit band (horizon y 1200)', sr9),
    ('SR10', 'THE FOLLOW', 'travel; the mechanism on its way',
     'video 4 S11: a truck right, the hot water\'s front held at x 400', sr10),
    ('SR11', 'THE LEVEL CHANGE', 'cause and effect; two places in one frame',
     'video 4, setup B: the computer below, the window above, one diagonal', sr11),
    ('SR12', 'THE CLOSE', 'intimacy: the object',
     'video 4 S3: the computer\'s top, ~700 px wide, steam off it', sr12),
    ('SR13', 'THE HANDS', 'intimacy: the "you"; "for you"',
     'video 4 S12: POV, the phone from the bottom left, the cause above it', sr13),
    ('SR14', 'THE YOU AND THE WORLD', 'scale from a human viewpoint',
     'video 4, setup A (1.6 m): the "you" ~180 px, head on the horizon', sr14),
    ('SR15', 'TINY UNDER GIANT', 'scale: the quantity, the machine',
     'video 4 S10\'s hall: worm\'s-eye, one engineer ~130 px at its foot', sr15),
    ('SR16', 'THE BIG SKY', 'a breather',
     'scene 1, S3: horizon y ~1400, the bridge on the left third', sr16),
    ('SR17', 'THE ONE BIG MOVE', 'the scale reveal, once',
     'video 4 S6, its end: the pivot held from the mug to the Earth\'s curve', sr17),
    ('SR18', 'THE OFF-BALANCE', 'the turn ("But")',
     'video 4 S7: the computer at x 330, the right half left open', sr18),
    ('SR19', 'THE MATCHED PAIR', 'the turn told by light; before and after',
     'scene 1: her pane the one warm one; inset: the same frame on "She quit"', sr19),
    ('SR20', 'THE SEAM', 'a comparison in one frame',
     'video 4: the melt line, untouched snow against the wet melt', sr20),
    ('SR21', 'THE LINEUP', 'how many; a list of like things',
     'video 4 S4: 40 kettles, 5 rows of 8, the computer the apex', sr21),
    ('SR22', 'THE PAPER', 'the proof: a chart, a number, a date',
     'video 4 S8: the 2027 tag, ~140 px, on the plan\'s front wall', sr22),
    ('SR23', 'THE MIRROR', 'stillness; a formal beat; once',
     'scene 1: the lit door on x 540 doubled in the still canal', sr23),
    ('SR24', 'THE WHOLE RUN', 'the payoff; the callback',
     'video 4 S12: SR1\'s frame, the warm run lit end to end, your phone', sr24),
]

FAMILIES = [('The hook', 1, 1), ('Establishing the home place', 2, 5), ('The subject\'s moment', 6, 11),
            ('Intimacy', 12, 13), ('Scale', 14, 17), ('The turn', 18, 19), ('A comparison or a list', 20, 22),
            ('The payoff', 23, 24)]


# ---------------------------------------------------------------------------------------------------------------------
# The checks (printed with --thumbs) and the sheet
# ---------------------------------------------------------------------------------------------------------------------
def checks(key, fr):
    a = np.asarray(fr.im)
    vals = sorted(GREY_TO_L[g] for g in np.unique(a))
    band = np.unique(a[BAND[0]:BAND[1], 95:945])
    w = a == GREY['W']
    wy, wx = np.nonzero(w)
    msg = ['%-4s values %d (%s)' % (key, len(vals), '/'.join('%d' % v for v in vals[::-1])),
           'band %s' % ('flat L* %d' % GREY_TO_L[band[0]] if len(band) == 1 else 'NOT FLAT %s' % band)]
    if len(wx):
        msg.append('white %.1f %% at (%d, %d)' % (100.0 * w.mean(), wx.mean(), wy.mean()))
    if fr.focal:
        fx, fy = fr.focal
        y0, y1, x0, x1 = int(fy - 60), int(fy + 60), int(fx - 60), int(fx + 60)
        win = a[max(0, y0):y1, max(0, x0):x1]
        L = [GREY_TO_L[g] for g in np.unique(win)]
        home = 380 <= fx <= 700 and 860 <= fy <= 1200
        msg.append('focal (%d, %d)%s step %d' % (fx, fy, '' if home else ' off home', max(L) - min(L)))
    return '  '.join(msg)


_FONTS = {}


def font(size, weight='Regular'):
    key = (size, weight)
    if key not in _FONTS:
        for f in ('/usr/share/fonts/opentype/inter/Inter-%s.otf' % weight,
                  '/usr/share/fonts/truetype/dejavu/DejaVuSans%s.ttf' % ('-Bold' if 'Bold' in weight else '')):
            if os.path.exists(f):
                _FONTS[key] = ImageFont.truetype(f, size)
                break
        else:
            _FONTS[key] = ImageFont.load_default()
    return _FONTS[key]


BG = (244, 240, 234)
INK = (34, 30, 36)
SUB = (100, 94, 102)
RULE = (196, 190, 184)


def wrap(d, text, f, width):
    lines, line = [], ''
    for word in text.split():
        t = (line + ' ' + word).strip()
        if line and d.textlength(t, font=f) > width:
            lines.append(line)
            line = word
        else:
            line = t
    if line:
        lines.append(line)
    return lines


def build_sheet(thumbs):
    SW, M, COLS = 2400, 40, 8
    PITCH = (SW - 2 * M) // COLS                       # 290
    head_h, fam_h, lab_h, gap = 330, 40, 132, 30
    row_h = fam_h + TH + lab_h + gap
    SH = head_h + 3 * row_h + 70
    sheet = Image.new('RGB', (SW, SH), BG)
    d = ImageDraw.Draw(sheet)
    # the head: title, the owner's words, how to read a frame
    d.text((M, 30), 'Composition shots: one value thumbnail per recipe (SR1-SR24)', font=font(44, 'Bold'), fill=INK)
    d.text((M, 92), 'The owner (2026-10-30): "do another research and distill of the composition shots to use"; '
                    '"8 agreed this is an important point about scene composition"; on still v6: "our scene is very '
                    'busy".', font=font(22), fill=SUB)
    d.text((M, 124), 'Each frame is our 1080 x 1920 at 1/4, drawn from the recipe\'s own numbers in '
                     'COMPOSITION_SHOTS.md (§3): scene 1 = v2\'s canal at King\'s Cross on an October dusk; '
                     'video 4 = Helsinki\'s AI-heated homes on a snowy night.', font=font(22), fill=SUB)
    y = 176
    x = M
    d.text((x, y + 4), 'Five flat values (L*):', font=font(21, 'SemiBold'), fill=INK)
    x += 236
    for k, L, name in VALUES:
        d.rectangle([x, y, x + 44, y + 34], fill=(GREY[k],) * 3, outline=(150, 146, 150))
        lab = '%d %s' % (L, name)
        d.text((x + 54, y + 5), lab, font=font(20), fill=INK)
        x += 54 + int(d.textlength(lab, font=font(20))) + 30
    y2 = 232
    x = M
    d.text((x, y2 + 4), 'Marked faintly:', font=font(21, 'SemiBold'), fill=INK)
    x += 170
    # the band sample
    for xx in range(x, x + 60, 14):
        d.line([(xx, y2 + 6), (xx + 8, y2 + 6)], fill=(90, 86, 94), width=2)
        d.line([(xx, y2 + 30), (xx + 8, y2 + 30)], fill=(90, 86, 94), width=2)
    d.rounded_rectangle([x + 8, y2 + 13, x + 52, y2 + 23], 5, fill=(200, 196, 196))
    lab = 'the caption band, y 290-600, its block ghosted'
    d.text((x + 72, y2 + 5), lab, font=font(20), fill=INK)
    x += 72 + int(d.textlength(lab, font=font(20))) + 34
    d.rectangle([x, y2 + 2, x + 44, y2 + 34], fill=(206, 204, 206), outline=(150, 146, 150))
    lab = 'the app\'s interface on the owner\'s Reels tab: the header to y 240, the name block from y 1519, ' \
          'the rail x > 870 from y 860, the strips x < 98 and x > 982 his crop hides'
    d.text((x + 54, y2 + 5), lab, font=font(20), fill=INK)
    y3 = 280
    x = M
    d.text((x, y3 + 4), 'In red:', font=font(21, 'SemiBold'), fill=INK)
    x += 90
    d.line([(x, y3 + 18), (x + 50, y3 + 18)], fill=ACCENT, width=3)
    lab = 'the composition idea: its lines, the focal (ring), the eye\'s path or the move (arrows), its key sizes ' \
          '(ticks). White in a picture is only ever the story light.'
    d.text((x + 64, y3 + 5), lab, font=font(20), fill=INK)
    # the rows
    by_key = {k: i for i, (k, *_r) in enumerate(RECIPES)}
    for r in range(3):
        top = head_h + r * row_h
        first, last = r * COLS + 1, r * COLS + COLS
        for name, a, b in FAMILIES:
            lo, hi = max(a, first), min(b, last)
            if lo > hi:
                continue
            x0 = M + (lo - first) * PITCH + 4
            x1 = M + (hi - first + 1) * PITCH - 6
            label = name + (' (cont.)' if a < first else '')
            d.text((x0, top + 4), label.upper(), font=font(17, 'SemiBold'), fill=SUB)
            d.line([(x0, top + 30), (x1, top + 30)], fill=RULE, width=2)
        for c in range(COLS):
            i = r * COLS + c
            key, name, beat, what, _fn = RECIPES[i]
            x0 = M + c * PITCH + (PITCH - TW) // 2
            y0 = top + fam_h
            sheet.paste(thumbs[i], (x0, y0))
            d.rectangle([x0 - 1, y0 - 1, x0 + TW, y0 + TH], outline=(176, 170, 166))
            ty = y0 + TH + 10
            d.text((x0, ty), key, font=font(19, 'Bold'), fill=ACCENT)
            kw = d.textlength(key + ' ', font=font(19, 'Bold'))
            nl = wrap(d, name, font(19, 'Bold'), TW + 12 - kw)
            d.text((x0 + kw, ty), nl[0], font=font(19, 'Bold'), fill=INK)
            ty += 24
            for extra in nl[1:]:
                d.text((x0 + kw, ty), extra, font=font(19, 'Bold'), fill=INK)
                ty += 24
            for line in wrap(d, beat, font(17, 'Medium'), TW + 12)[:2]:
                d.text((x0, ty), line, font=font(17, 'Medium'), fill=INK)
                ty += 21
            ty += 3
            for line in wrap(d, what, font(15), TW + 12)[:3]:
                d.text((x0, ty), line, font=font(15), fill=SUB)
                ty += 19
    d.text((M, SH - 46), 'Script: video/docs/look/composition/shots_sheet.py (PIL, seeded; every shape drawn here from '
                         'the recipes\' numbers; no image copied, traced or used as an input). The rules, the '
                         'numbers and the clashes: video/docs/look/COMPOSITION_SHOTS.md.', font=font(18), fill=SUB)
    return sheet


def phone_views(sheet, thumbs, out):
    """What the owner sees on his phone: the sheet fit to its width (1170 px), half a row at 100 % (his two-finger
    zoom), and every frame at 1/4 of a thumbnail (the 0.25-scale gist: is the one focal found at once?)."""
    os.makedirs(out, exist_ok=True)
    w = 1170
    sheet.resize((w, int(sheet.height * w / sheet.width)), Image.LANCZOS).save(os.path.join(out, 'phone_fit.png'))
    for r in range(3):
        for h in range(2):
            y0 = 330 + r * (40 + TH + 132 + 30)
            x0 = 40 + h * 4 * 290
            sheet.crop((x0, y0, x0 + 4 * 290, y0 + 40 + TH + 132)).save(
                os.path.join(out, 'phone_zoom_r%d%s.png' % (r + 1, 'ab'[h])))
    g = Image.new('RGB', (8 * 80 + 10, 3 * 132 + 10), (255, 255, 255))
    for i, t in enumerate(thumbs):
        g.paste(t.resize((TW // 4, TH // 4), Image.LANCZOS), (10 + (i % 8) * 80, 10 + (i // 8) * 132))
    g.save(os.path.join(out, 'gist_quarter.png'))


def main(argv):
    tdir = argv[argv.index('--thumbs') + 1] if '--thumbs' in argv else None
    pdir = argv[argv.index('--phone') + 1] if '--phone' in argv else None
    only = [a for a in argv if a.upper().startswith('SR') and a[2:].isdigit()]
    thumbs = []
    for key, name, beat, what, fn in RECIPES:
        if only and key.lower() not in [o.lower() for o in only]:
            continue
        fr = fn()
        th = thumbnail(fr)
        thumbs.append(th)
        if tdir:
            os.makedirs(tdir, exist_ok=True)
            th.save(os.path.join(tdir, key + '.png'))
            print(checks(key, fr))
    if only:
        return
    sheet = build_sheet(thumbs)
    sheet.save(OUT, optimize=True)
    print('wrote', OUT, sheet.size)
    if pdir:
        phone_views(sheet, thumbs, pdir)
        print('phone views in', pdir)


if __name__ == '__main__':
    main(sys.argv[1:])
