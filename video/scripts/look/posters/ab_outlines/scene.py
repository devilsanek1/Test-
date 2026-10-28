#!/usr/bin/env python3
"""The A vs B scene: v2's terrace across the canal at sunset (S3, "her window"), drawn ONE way in three modes.

Owner (2026-10-28), on our observation 3 ("No outlines: shapes are separated by light and dark steps, with only tiny
lines for windows and railings ... Our main objects use outlines"): "i like 3 - but can you draw me a picture of
difference like A vs B what you are talking about".

  A   our line today = v2 exactly (docs/v2/STYLE.md §3, src/v2r/pen.ts + lib/pen.ts CLEAN_TIERS, CRAFT §c):
        tier A (her French window + her silhouette, S3's subject): one closed 3.0 px outline in the object's own deep
        shade (lib/pen.ts shadeL(tone, -35, floor 16)); tier B (Pip, the walker): a same-hue line 1.8 px at the fill's
        L* -20 (Pip's is #616389); tier C (houses, water, boat, tree): no line; things that ARE lines (railings, glazing
        bars, pipes) stay. Light: v2's rig, the sun at screen left, ONE tint family TINT_CANAL = CM.shadeWarm at
        form 0.20 / cast 0.28 / contact 0.48 (multiply), the water's own deeper step on the canal.
  B   the posters' way: no outline on anything; the SAME shapes and colours; every volume a lit face and a shade face
        (the same tint family at a poster-like step: B_K below), casts as flat colour, faces turned up a step lighter;
        tiny dark lines only for window bars and railings (the same bars as A).
  B0  the inset, "B without its shade faces": B's no-line drawing with no light and shade at all (flat fills only):
        why B needs its light and shade.

Geometry and colours are v2's: CM tokens from src/v2r/palette.ts, the terrace from src/v2r/scenes/V2S3_tHouses.tsx and
V2S3_tHer.tsx (world px of the 1080 x 1920 frame at the 12.98 match), the pen's tier fills from lib/pen.ts (tierFill:
environment = value pulled 16 % toward the scope's ground, chroma x0.85 <= 36; support = 8 %, x0.9 <= 25 in v2).
Only the edge treatment and the light and shade differ between the modes. Pure SVG out; no film code is imported.
"""
from __future__ import annotations

import math

# ----------------------------------------------------------------------------------------------- the palette (CM)
CM = {
    'sky': '#BCDCCF', 'skyHigh': '#CFE6DC', 'bandGold': '#F6D9BC', 'bandSunset': '#F3C6A6', 'bandDusk': '#B3CDD2',
    'stucco': '#F4E4D2', 'paving': '#EFD8C2', 'limestone': '#EEE4D4', 'glass': '#CDE1DF', 'paper': '#FBF3E6',
    'brickLight': '#E3A88C', 'brick': '#C9806A', 'brickDeep': '#A5604F', 'sage': '#AFC4A8', 'stoneShade': '#C8C3D3',
    'water': '#9DC6BF', 'waterDeep': '#7DAEA8', 'paneUnlit': '#5E6F86',
    'hero': '#0B8577', 'anchor': '#36223A', 'pop': '#EE6A2E', 'sun': '#EE6A2E',
    'box': '#F6B892', 'lamp': '#F7CF86', 'lampCore': '#FBE6C2', 'ink': '#2B1B0A', 'line': '#9A563C',
    'shadeWarm': '#8C5E6B', 'shadeCool': '#6F80A0',
    'leafGold': '#D6A563', 'leafRust': '#B8714F', 'blossom': '#F3C3CD',
    'coatSlate': '#5E6F86', 'coatMustard': '#D4A960', 'coatOat': '#E6D3B5', 'coatPlum': '#6E4A5E',
    'pipBody': '#9495C1', 'pipShade': '#73739D', 'pipEar': '#F2C3CC', 'pipScarf': '#D8C599',
}
S3_IRON = '#A08E96'  # V2S3_tParts: thin iron is a mid plum, never near-black
PIP_LINE = '#616389'  # v2's Pip line (palette.ts: the pen's B line from the body)
EMISSIVE = {CM['lamp'].upper(), CM['lampCore'].upper(), CM['sun'].upper()}


# ----------------------------------------------------------------------------------------------- colour maths
def _lin(x):
    return x / 12.92 if x <= 0.04045 else ((x + 0.055) / 1.055) ** 2.4


def _gam(x):
    return 12.92 * x if x <= 0.0031308 else 1.055 * x ** (1 / 2.4) - 0.055


def hex_rgb(h):
    h = h.lstrip('#')
    return [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]


def rgb_hex(r, g, b):
    return '#' + ''.join('%02X' % round(min(1, max(0, v)) * 255) for v in (r, g, b))


def lab(h):
    """CIE Lab (D65) exactly as lib/pen.ts hexToLab."""
    r, g, b = (_lin(v) for v in hex_rgb(h))
    X = (0.4124 * r + 0.3576 * g + 0.1805 * b) / 0.95047
    Y = 0.2126 * r + 0.7152 * g + 0.0722 * b
    Z = (0.0193 * r + 0.1192 * g + 0.9505 * b) / 1.08883
    f = lambda t: t ** (1 / 3) if t > 0.008856 else 7.787 * t + 16 / 116
    return [116 * f(Y) - 16, 500 * (f(X) - f(Y)), 200 * (f(Y) - f(Z))]


def lab_hex(L, a, b):
    """lib/pen.ts labToHex."""
    fy = (L + 16) / 116
    fx = fy + a / 500
    fz = fy - b / 200
    inv = lambda t: t ** 3 if t ** 3 > 0.008856 else (t - 16 / 116) / 7.787
    X, Y, Z = inv(fx) * 0.95047, inv(fy), inv(fz) * 1.08883
    r = 3.2406 * X - 1.5372 * Y - 0.4986 * Z
    g = -0.9689 * X + 1.8758 * Y + 0.0415 * Z
    bl = 0.0557 * X - 0.204 * Y + 1.057 * Z
    return rgb_hex(*(_gam(min(1, max(0, v))) for v in (r, g, bl)))


def lch(h):
    L, a, b = lab(h)
    return L, math.hypot(a, b), (math.degrees(math.atan2(b, a)) + 360) % 360


def shadeL(h, dL, floor=16):
    """lib/pen.ts shadeL: the colour dL L* lighter (negative = darker), hue kept, most of its chroma kept."""
    L0, a, b = lab(h)
    L = min(100, max(min(L0, floor), L0 + dL))
    k = min(1, L / max(1, L0))
    ck = 0.8 + 0.2 * k
    return lab_hex(L, a * ck, b * ck)


# lib/pen.ts CLEAN_TIERS (+ v2r/pen.ts's override: support chromaMax 25)
TIERS = {
    'subject': dict(pull=0.0, chromaK=1.0, chromaMax=200, drop=35, floor=16),
    'support': dict(pull=0.08, chromaK=0.9, chromaMax=25, drop=20, floor=20),
    'environment': dict(pull=0.16, chromaK=0.85, chromaMax=36, drop=14, floor=24),
}


def tier_fill(h, tier, bg):
    """lib/pen.ts tierFill: value pulled toward the scope's ground, chroma x chromaK capped, hue kept."""
    s = TIERS[tier]
    if h.upper() in EMISSIVE or (s['pull'] <= 0 and s['chromaK'] >= 1):
        return h
    L, a, b = lab(h)
    gL = lab(bg)[0]
    L2 = L + (gL - L) * s['pull']
    C = math.hypot(a, b)
    k = min(C * s['chromaK'], s['chromaMax']) / C if C > 1e-6 else 0
    return lab_hex(L2, a * k, b * k)


def mix(a, b, k):
    x, y = hex_rgb(a), hex_rgb(b)
    return rgb_hex(*(x[i] + (y[i] - x[i]) * k for i in range(3)))


def multiply(a, *ts):
    v = hex_rgb(a)
    for t in ts:
        c = hex_rgb(t)
        v = [v[i] * c[i] for i in range(3)]
    return rgb_hex(*v)


def tint_for(surface, target):
    s, t = hex_rgb(surface), hex_rgb(target)
    return rgb_hex(*(min(1, t[i] / s[i]) if s[i] > 0 else 1 for i in range(3)))


def lighten(h, dL, warm=10.0):
    """A face turned up to the light: dL L* lighter, its hue turned up to `warm` degrees toward gold (h 80)."""
    L, C, hh = lch(h)
    d = ((80 - hh + 540) % 360) - 180
    turn = math.copysign(min(abs(d), warm), d) if C > 4 else 0
    hr = math.radians(hh + turn)
    return lab_hex(min(99, L + dL), C * math.cos(hr) * 1.0, C * math.sin(hr) * 1.0)


# ----------------------------------------------------------------------------------------------- the light, per mode
SHADE = CM['shadeWarm']
TINT = lambda k: mix('#FFFFFF', SHADE, k)
WATER_TINT = tint_for(CM['water'], CM['waterDeep'])  # rigs.ts TINT_CANAL.water: the water's own deeper step

# A = v2's TINT_CANAL strengths (rigs.ts): form .20 / cast .28 / contact .48; an underside is a form plane.
A_K = dict(form=0.20, under=0.20, cast=0.28, contact=0.48, water=1)
# B = the posters' way inside our palette rules (one tint family, colour never grey): a shade face clearly one value
# step down (brick L* 61 -> ~45, limestone 86 -> ~66; Reykjavik's lit and shade faces sit 35-39 L* apart, v2's
# 5-10), undersides a little deeper, casts flat, tops lit (+6 L*).
B_K = dict(form=0.56, under=0.66, cast=0.52, contact=0.78, water=2)
B_TOP_DL = 6.0
B_LEFT_DL = 4.0

def own_step(h, dL, ck=1.05):
    L, C, hh = lch(h)
    r = math.radians(hh)
    return lab_hex(L + dL, C * ck * math.cos(r), C * ck * math.sin(r))


# the scope grounds the pen's environment fills are pulled toward (S3 measured: the terrace's scope = its brick)
BG_TERRACE = CM['brick']
BG_SKY = CM['sky']
# greens: the leaf's own deeper step (A: v2's form depth on sage, ~-8 L*; B: the poster-like step, ~-23 L*)
_SAGE = tier_fill(CM['sage'], 'environment', BG_TERRACE)
LEAF_TINT = {'A': tint_for(_SAGE, own_step(_SAGE, -8)), 'B': tint_for(_SAGE, own_step(_SAGE, -23))}


# ----------------------------------------------------------------------------------------------- path helpers
def f1(v):
    s = ('%.2f' % v).rstrip('0').rstrip('.')
    return '0' if s in ('-0', '') else s


def P(x, y):
    return f'{f1(x)} {f1(y)}'


def rect(x, y, w, h):
    return f'M{P(x, y)}H{f1(x + w)}V{f1(y + h)}H{f1(x)}Z'


def poly(pts):
    """A closed polygon, always clockwise on screen (y down), so overlapping subpaths of one path union under the
    nonzero rule instead of cancelling."""
    a = sum(pts[i][0] * pts[(i + 1) % len(pts)][1] - pts[(i + 1) % len(pts)][0] * pts[i][1] for i in range(len(pts)))
    if a < 0:
        pts = pts[::-1]
    return 'M' + 'L'.join(P(x, y) for x, y in pts) + 'Z'


def ell(cx, cy, rx, ry=None):
    ry = rx if ry is None else ry
    return f'M{P(cx - rx, cy)}A{f1(rx)} {f1(ry)} 0 1 1 {P(cx + rx, cy)}A{f1(rx)} {f1(ry)} 0 1 1 {P(cx - rx, cy)}Z'


def rrect(x, y, w, h, r):
    r = min(r, w / 2, h / 2)
    return (f'M{P(x + r, y)}H{f1(x + w - r)}A{f1(r)} {f1(r)} 0 0 1 {P(x + w, y + r)}V{f1(y + h - r)}'
            f'A{f1(r)} {f1(r)} 0 0 1 {P(x + w - r, y + h)}H{f1(x + r)}A{f1(r)} {f1(r)} 0 0 1 {P(x, y + h - r)}'
            f'V{f1(y + r)}A{f1(r)} {f1(r)} 0 0 1 {P(x + r, y)}Z')


def arch(x, y, w, h):
    """A round-headed opening: a semicircle on top of a rect (top at y)."""
    r = w / 2
    return f'M{P(x, y + h)}V{f1(y + r)}A{f1(r)} {f1(r)} 0 0 1 {P(x + w, y + r)}V{f1(y + h)}Z'


def dome(cx, by, rx, ry):
    """A half ellipse standing on y = by (a lamp shade, a fanlight)."""
    return f'M{P(cx - rx, by)}A{f1(rx)} {f1(ry)} 0 0 1 {P(cx + rx, by)}Z'


# ----------------------------------------------------------------------------------------------- the document
class Doc:
    """Collects SVG in painter's order. Shades queue into ONE multiply group (lib/light ShadowLayer: no
    double-darkening inside it) that is flushed before the next opaque thing is drawn."""

    def __init__(self, mode: str):
        assert mode in ('A', 'B', 'B0')
        self.mode = mode
        self.k = B_K if mode == 'B' else A_K
        self.lines_on = mode == 'A'
        self.out: list[str] = []
        self.shade: list[str] = []
        self.defs: list[str] = []
        self.nclip = 0

    # -- opaque fills
    def flush(self):
        if self.shade:
            self.out.append('<g style="mix-blend-mode:multiply">' + ''.join(self.shade) + '</g>')
            self.shade = []

    def col(self, c, tier='environment', bg=BG_TERRACE):
        return tier_fill(c, tier, bg)

    def fill(self, d, c, tier='environment', bg=BG_TERRACE, face='front', raw=False, clip=None):
        """face: front | right | under (a shade face: base fill + a form/under shade) | top (lit +6 L* in B) |
        left (turned to the low western sun: +4 L* in B)."""
        self.flush()
        cc = c if raw else self.col(c, tier, bg)
        if face == 'top' and self.mode == 'B':
            cc = lighten(cc, B_TOP_DL)
        if face == 'left' and self.mode == 'B':
            cc = lighten(cc, B_LEFT_DL)
        cl = f' clip-path="url(#{clip})"' if clip else ''
        self.out.append(f'<path d="{d}" fill="{cc}"{cl}/>')
        if face == 'right':
            self.shadow(d, 'form', clip=clip)
        elif face == 'under':
            self.shadow(d, 'under', clip=clip)

    def shadow(self, d, kind, clip=None):
        """kind: form | under | cast | contact (the tint family) | water (the water's own step) | leaf (greens'
        own step). B0 (the inset "B without its shade faces") draws none: the same shapes, flat."""
        if self.mode == 'B0':
            return
        cl = f' clip-path="url(#{clip})"' if clip else ''
        if kind == 'water':
            n = self.k['water']
            c = WATER_TINT if n == 1 else multiply(WATER_TINT, *([WATER_TINT] * (n - 1)))
        elif kind == 'leaf':  # greens keep their hue (v2's LAWN_SHADE: the leaf's own deeper step, never olive)
            c = LEAF_TINT[self.mode]
        else:
            c = TINT(self.k[kind])
        self.shade.append(f'<path d="{d}" fill="{c}"{cl}/>')

    def bar(self, d, c):
        """A thing that IS a line (railing bar, glazing bar, pipe): the same in every mode."""
        self.flush()
        self.out.append(f'<path d="{d}" fill="{c}"/>')

    def outline(self, d, tier, tone, width=None, cap='round'):
        """The tier line (mode A only): A = 3.0 px in the tone's own deep shade (L* -35, floor 16); B = 1.8 px at the
        (calmed) tone's L* -20 (floor 20)."""
        if not self.lines_on:
            return
        self.flush()
        if tier == 'subject':
            c, w = shadeL(tone, -35, 16), width or 3.0
        else:
            c, w = (PIP_LINE if tone == 'pip' else shadeL(tone, -20, 20)), width or 1.8
        self.out.append(f'<path d="{d}" fill="none" stroke="{c}" stroke-width="{f1(w)}" stroke-linejoin="round" '
                        f'stroke-linecap="{cap}"/>')

    def clip(self, d):
        self.nclip += 1
        cid = f'c{self.mode}{self.nclip}'
        self.defs.append(f'<clipPath id="{cid}" clipPathUnits="userSpaceOnUse"><path d="{d}"/></clipPath>')
        return cid

    def raw(self, s):
        self.flush()
        self.out.append(s)

    def svg(self, vb, w_px, h_px):
        self.flush()
        x, y, w, h = vb
        return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{f1(x)} {f1(y)} {f1(w)} {f1(h)}" width="{w_px}" '
                f'height="{h_px}" shape-rendering="geometricPrecision"><defs>{"".join(self.defs)}'
                f'<linearGradient id="sky" x1="0" y1="560" x2="0" y2="1110" gradientUnits="userSpaceOnUse">'
                f'<stop offset="0" stop-color="{CM["sky"]}"/><stop offset="0.22" stop-color="{CM["sky"]}"/>'
                f'<stop offset="0.62" stop-color="{mix(CM["sky"], CM["bandSunset"], 0.72)}"/>'
                f'<stop offset="1" stop-color="{mix(CM["bandSunset"], CM["paper"], 0.25)}"/></linearGradient>'
                f'</defs>{"".join(self.out)}</svg>')


# ----------------------------------------------------------------------------------------------- the world (S3 px)
# The views (world px of the 1080 x 1920 frame): the panel, the close-up corner, the inset.
VIEW_PANEL = (58, 576, 784, 772)  # roofs to the boat's waterline: the west gap, her house, the stock house, the boat
VIEW_ZOOM = (246, 676, 412, 392)  # her window (A's outline) + Pip (B's thin line) + the railing + the bay's top
WORLD = (0, 560, 1080, 920)

GROUND = 1100  # the terrace's pavement line (V2S3_tHouses TL.ground)
CORNICE = 660
STRING = 872
HOUSES = [  # V2S3_tHouses HOUSES, west -> east
    dict(id='her', x0=165, x1=525, wall=CM['brick'], roof='mansard', top=606),
    dict(id='stock', x0=525, x1=775, wall=CM['brickLight'], roof='parapet', top=640),
    dict(id='deep', x0=775, x1=1010, wall=CM['brickDeep'], roof='mansard', top=626),
    dict(id='stucco', x0=1010, x1=1290, wall=CM['sage'], roof='mansard', top=634),
]
# her French window: MAP.M = (335, 785) 132.5 x 164.3 (V2S3_tHer)
FW = dict(x=335, y=785, w=132.5, h=164.3)
FX0, FX1 = FW['x'] - FW['w'] / 2, FW['x'] + FW['w'] / 2
FY0, FY1 = FW['y'] - FW['h'] / 2, FW['y'] + FW['h'] / 2
WFR = FW['w'] * 0.07
TRANSOM = FY0 + FW['h'] * 0.62
BOX = dict(x0=255, y0=868, x1=520, y1=900)  # map S3.windowBox
PIP = dict(x=590, y=1050)  # map S3.pipSeat (on her terrace railing)
SUN = (112, 744, 36)  # setting into the west gap behind the far roofs (SUN0's kind: an evening sun, not a sticker)


def sky_and_far(d: Doc):
    d.raw(f'<rect x="-20" y="540" width="1120" height="600" fill="url(#sky)"/>')
    d.fill(ell(*SUN), CM['sun'], raw=True)  # the pop: the disc only
    # far roofs in the west gap: flat steps toward the haze (C, unlit past the atmosphere: CRAFT §d.9)
    haze = mix(CM['bandSunset'], CM['paper'], 0.25)
    far1 = mix(tier_fill(CM['stoneShade'], 'environment', BG_SKY), haze, 0.35)
    far2 = mix(tier_fill(CM['brickLight'], 'environment', BG_SKY), haze, 0.45)
    d.fill(poly([(-10, 1100), (-10, 768), (44, 768), (44, 760), (98, 760), (98, 772), (142, 772), (142, 784),
                 (176, 784), (176, 1100)]), far1, raw=True)
    for wx in (8, 26, 58, 76, 112, 130):
        for wy in (794, 826):
            d.fill(rect(wx, wy, 9, 14), mix(far1, CM['paper'], 0.45), raw=True)
    d.fill(poly([(-10, 1100), (-10, 905), (60, 905), (60, 890), (120, 890), (120, 908), (176, 908), (176, 1100)]),
           far2, raw=True)


def tree(d: Doc):
    """S3's plane tree at the west end (C): lobed crowns in sage, gold and rust, a brickDeep trunk."""
    d.fill(poly([(88, 1102), (93, 965), (89, 936), (100, 934), (106, 966), (112, 1102)]), CM['brickDeep'])
    d.fill(poly([(102, 1102), (106, 966), (100, 934), (104, 934), (110, 966), (114, 1102)]), CM['brickDeep'],
           face='right')
    d.shadow(ell(104, 1101, 30, 4), 'contact')
    sage = [(52, 880, 38), (92, 852, 40), (136, 862, 36), (158, 900, 30), (62, 930, 36), (112, 925, 42),
            (152, 944, 26), (30, 906, 28)]
    gold = [(70, 840, 32), (108, 820, 34), (140, 840, 26), (50, 866, 24)]
    rust = [(98, 905, 34), (136, 898, 28), (72, 934, 28), (118, 952, 28)]
    for group, c, kind in ((sage, CM['sage'], 'leaf'), (gold, CM['leafGold'], 'form'), (rust, CM['leafRust'], 'form')):
        dd = ''.join(ell(x, y, r) for x, y, r in group)
        d.fill(dd, c, bg=BG_SKY)
        cid = d.clip(dd)  # each lobe's crescent away from the low western sun (rigs.ts form frac ~0.3)
        d.shadow(''.join(ell(x + r * 0.55, y + r * 0.35, r * 0.8) for x, y, r in group), kind, clip=cid)


def stack(d: Doc, x, w, top, base, brick, pots=3):
    """A chimney stack: its front face, its right return (a shade face), a stone cap, pots; its cast falls right."""
    dep = 14
    d.shadow(poly([(x + w + dep, top + 12), (x + w + dep + 18, top + 22), (x + w + dep + 18, base + 6),
                   (x + w + dep, base)]), 'cast')
    d.fill(rect(x, top + 8, w, base - top - 8), brick)
    d.fill(poly([(x + w, top + 8), (x + w + dep, top + 4), (x + w + dep, base - 3), (x + w, base)]), brick, face='right')
    d.fill(rect(x - 3, top + 2, w + 6, 7), CM['limestone'])
    d.fill(poly([(x + w + 3, top + 2), (x + w + dep + 3, top - 1), (x + w + dep + 3, top + 5), (x + w + 3, top + 9)]),
           CM['limestone'], face='right')
    d.fill(rect(x - 3, top + 9, w + 6, 3), CM['limestone'], face='under')
    pw = (w - 4) / pots
    for k in range(pots):
        px = x + 2 + k * pw
        c = [CM['leafRust'], CM['brickDeep'], CM['brick']][k % 3]
        d.fill(rect(px + 1, top - 10, pw - 3, 12), c)
        d.fill(rect(px + pw - 6, top - 10, 4, 12), c, face='right')


def dormer(d: Doc, x, y, w, h, lit):
    """A mansard dormer (V2S3 WinSpec 'dormer'): paper surround, pane, a gabled roof; its right cheek in shade."""
    cheek = 10
    d.shadow(poly([(x + w + 4 + cheek, y - 2), (x + w + 4 + cheek + 12, y + 4), (x + w + 4 + cheek + 12, y + h + 6),
                   (x + w + 4 + cheek, y + h + 2)]), 'cast')
    d.fill(rect(x - 4, y - 4, w + 8, h + 6), CM['paper'])
    d.fill(poly([(x + w + 4, y - 4), (x + w + 4 + cheek, y - 2), (x + w + 4 + cheek, y + h + 2), (x + w + 4, y + h + 2)]),
           CM['paper'], face='right')
    d.fill(rect(x, y, w, h), CM['lamp'] if lit else CM['glass'], raw=lit)
    if not lit:
        d.fill(rect(x, y, w, h * 0.45), CM['coatOat'])
        d.shadow(rect(x, y, 5, h), 'form')  # the reveal (an unlit pane only: lit panes stay unlit, CRAFT §d.9)
    else:
        d.fill(dome(x + w * 0.5, y + h * 0.35, w * 0.14, h * 0.18), CM['anchor'], raw=True)
    d.bar(rect(x + w * 0.48, y, 1.6, h), CM['paper'])
    # the gable roof: its lit left slope, its shade right slope, the soffit
    d.fill(poly([(x - 9, y - 4), (x + w / 2, y - 17), (x + w / 2, y - 4)]), CM['shadeCool'])
    d.fill(poly([(x + w / 2, y - 17), (x + w + 4 + cheek + 3, y - 4), (x + w / 2, y - 4)]), CM['shadeCool'], face='right')


def sash(d: Doc, x, y, w, h, lit, curtain=None, surround='stone', blind=None, sill=True, inner=None):
    """A sash window in its opening (V2S3_tParts winBack / winPane / winFront): surround, pane, bars, sill; on an
    unlit pane the reveal and the head in shade; the surround's cast to the east and the sill's cast below."""
    fw = 7
    if surround == 'stone':
        d.shadow(poly([(x + w + fw + 6, y - fw + 6), (x + w + fw + 14, y - fw + 12), (x + w + fw + 14, y + h + 8),
                       (x + w + fw + 6, y + h + 2)]), 'cast')
        d.fill(rect(x - fw, y - fw, w + 2 * fw, h + fw), CM['limestone'])
        d.fill(poly([(x + w + fw, y - fw), (x + w + fw + 6, y - fw + 3), (x + w + fw + 6, y + h), (x + w + fw, y + h)]),
               CM['limestone'], face='right')
    elif surround == 'hood':
        d.shadow(rect(x - 6, y - 4, w + 26, 9), 'cast')
        d.shadow(poly([(x + w + 3, y), (x + w + 10, y + 5), (x + w + 10, y + h + 6), (x + w + 3, y + h)]), 'cast')
        d.fill(rect(x - 12, y - 18, w + 24, 10), CM['stucco'])
        d.fill(rect(x - 12, y - 8, w + 24, 4), CM['stucco'], face='under')
        d.fill(poly([(x + w + 12, y - 18), (x + w + 20, y - 15), (x + w + 20, y - 6), (x + w + 12, y - 4)]),
               CM['stucco'], face='right')
        d.fill(rect(x - 3, y - 3, w + 6, h + 3), CM['paper'])
    elif surround == 'arch':
        d.fill(arch(x - 6, y - 6, w + 12, h + 6), CM['limestone'])
    else:
        d.shadow(poly([(x + w + 3, y), (x + w + 9, y + 5), (x + w + 9, y + h + 6), (x + w + 3, y + h)]), 'cast')
        d.fill(rect(x - 3, y - 3, w + 6, h + 3), CM['paper'])
    shape = rect(x, y, w, h) if surround != 'arch' else arch(x, y, w, h)
    if lit:
        d.fill(shape, CM['lamp'], raw=True)
        d.fill(rect(x + w * 0.18, y + h * 0.14, w * 0.64, h * 0.4), CM['lampCore'], raw=True)
        if inner == 'shelf':
            for s in range(2):
                sy = y + h * (0.34 + s * 0.22)
                d.fill(rect(x + w * 0.2, sy, w * 0.6, 3), CM['line'])
                for b in range(4):
                    d.fill(rect(x + w * (0.24 + b * 0.13), sy - 12, w * 0.09, 12),
                           [CM['brick'], CM['sage'], CM['coatMustard'], CM['paneUnlit']][(b + s) % 4])
        elif inner == 'pendant':
            d.fill(dome(x + w * 0.5, y + h * 0.3, w * 0.13, h * 0.08), CM['anchor'], raw=True)
            d.bar(rect(x + w * 0.5 - 0.7, y, 1.4, h * 0.22), S3_IRON)
        if curtain:
            d.fill(rect(x, y, w * 0.17, h), curtain)
            d.fill(rect(x + w * 0.83, y, w * 0.17, h), curtain)
    else:
        d.fill(shape, CM['glass'])
        d.fill(poly([(x, y + h * 0.55), (x + w, y + h * 0.38), (x + w, y + h), (x, y + h)]), CM['shadeCool'])
        if blind:
            d.fill(rect(x, y, w, h * blind), CM['coatOat'])
        top = y + (w / 2 if surround == 'arch' else 0)
        d.shadow(rect(x, top, 6, y + h - top), 'form')  # the reveal, in shade
        if surround != 'arch':
            d.shadow(rect(x, y, w, 7), 'cast')  # the head's shadow
    bw = max(2.2, w * 0.035)
    d.bar(rect(x, y + h * 0.48, w, bw), CM['paper'])  # glazing bars: the window's own (light) bars
    d.bar(rect(x + w * 0.5 - bw / 2, y, bw, h), CM['paper'])
    if sill:
        d.shadow(poly([(x - 6, y + h + 10), (x + w + 18, y + h + 10), (x + w + 26, y + h + 19), (x + 2, y + h + 19)]), 'cast')
        d.fill(rect(x - 12, y + h, w + 24, 7), CM['limestone'])
        d.fill(rect(x - 12, y + h + 7, w + 24, 3), CM['limestone'], face='under')
        d.fill(poly([(x + w + 12, y + h), (x + w + 18, y + h + 3), (x + w + 18, y + h + 10), (x + w + 12, y + h + 10)]),
               CM['limestone'], face='right')


def bay(d: Doc):
    """Her ground-floor canted bay (the tripartite window of V2S3 'h1g' with its side lights, as a bay): the face turned
    to the sun, the front, the face turned away; a stone cornice over it; its cast on the brick to the east."""
    xl, xa, xb, xr = 290, 326, 438, 474  # left face, front, right face
    top, base = 914, 1100
    d.shadow(poly([(xr, top + 4), (xr + 26, top + 14), (xr + 26, base), (xr, base)]), 'cast')
    # the windows in each face; the face turned from the sun takes ONE flat shade over all its parts (below)
    for (fx0, fx1, face) in ((xl, xa, 'left'), (xa, xb, 'front'), (xb, xr, 'front')):
        d.fill(rect(fx0, top, fx1 - fx0, base - top), CM['stucco'], face=face)
        inset = 10 if fx1 - fx0 > 60 else 7
        wx, ww, wy, wh = fx0 + inset, fx1 - fx0 - 2 * inset, top + 18, 104
        d.fill(rect(wx - 3, wy - 3, ww + 6, wh + 3), CM['paper'], face=face)
        d.fill(rect(wx, wy, ww, wh), CM['glass'], face=face)
        d.fill(poly([(wx, wy + wh * 0.55), (wx + ww, wy + wh * 0.38), (wx + ww, wy + wh), (wx, wy + wh)]),
               CM['shadeCool'], face=face)
        d.fill(rect(wx, wy, ww, wh * 0.2), CM['coatOat'], face=face)
        if ww > 40:
            lob = ell(wx + 24, wy + wh - 6, 14) + ell(wx + 44, wy + wh - 12, 16) + ell(wx + 64, wy + wh - 6, 12)
            d.fill(lob, CM['sage'])
        bw = 2.4
        d.bar(rect(wx, wy + wh * 0.48, ww, bw), CM['paper'])
        if ww > 40:
            d.bar(rect(wx + ww * 0.5 - bw / 2, wy, bw, wh), CM['paper'])
        if fx0 != xb:
            d.shadow(rect(wx, wy, 5, wh), 'form')
            d.shadow(rect(wx, wy, ww, 7), 'cast')
        d.fill(rect(wx - 6, wy + wh, ww + 12, 6), CM['limestone'], face='top' if face == 'front' else face)
    d.shadow(rect(xb, top, xr - xb, base - top), 'form')  # the face turned from the sun: one flat plane
    # the bay's stone cornice: front (lit), its underside, its cast on the bay's head
    d.fill(rect(xl - 6, top - 14, xr - xl + 12, 12), CM['limestone'])
    d.fill(poly([(xr + 6, top - 14), (xr + 14, top - 10), (xr + 14, top + 1), (xr + 6, top - 2)]), CM['limestone'],
           face='right')
    d.fill(rect(xl - 6, top - 2, xr - xl + 12, 4), CM['limestone'], face='under')
    d.shadow(rect(xl, top + 2, xr - xl, 8), 'cast')
    # the plinth: a face turned up (lit), its front
    d.fill(rect(xl - 4, base - 30, xr - xl + 8, 5), CM['limestone'], face='top')
    d.fill(rect(xl - 4, base - 25, xr - xl + 8, 25), CM['limestone'])
    d.shadow(rect(xb, base - 30, xr - xb + 4, 30), 'form')


def door(d: Doc, x, y, w, h, color, fan='arch', fan_lit=True, case=True):
    """A front door (V2S3_tParts doorInto): a stucco case with a hood, a fanlight, the leaf with panels, two steps."""
    fh = w * 0.55 if fan == 'arch' else 26
    top = y - fh
    if case:
        d.shadow(poly([(x + w + 26, top - 8), (x + w + 36, top - 2), (x + w + 36, GROUND), (x + w + 26, GROUND)]), 'cast')
        d.fill(rect(x - 16, top - 14, w + 32, GROUND - top + 14), CM['stucco'])
        d.fill(poly([(x + w + 16, top - 14), (x + w + 26, top - 10), (x + w + 26, GROUND), (x + w + 16, GROUND)]),
               CM['stucco'], face='right')
        d.fill(rect(x - 22, top - 24, w + 44, 10), CM['limestone'])
        d.fill(poly([(x + w + 22, top - 24), (x + w + 30, top - 20), (x + w + 30, top - 10), (x + w + 22, top - 14)]),
               CM['limestone'], face='right')
        d.fill(rect(x - 22, top - 14, w + 44, 4), CM['limestone'], face='under')
        d.shadow(rect(x - 16, top - 10, w + 42, 8), 'cast')
    if fan == 'arch':
        d.fill(dome(x + w / 2, y, w / 2, fh), CM['lamp'] if fan_lit else CM['glass'], raw=fan_lit)
        for k in range(1, 4):
            a = math.pi * k / 4
            ex, ey = x + w / 2 + (w / 2) * math.cos(math.pi - a), y - fh * math.sin(a)
            d.bar(poly([(x + w / 2 - 0.9, y), (ex - 0.9, ey), (ex + 0.9, ey), (x + w / 2 + 0.9, y)]), CM['paper'])
    else:
        d.fill(rect(x, y - 24, w, 20), CM['glass'])
        d.shadow(rect(x, y - 24, w, 5), 'cast')
    d.fill(rect(x, y, w, h), color)
    for py, ph in ((0.08, 0.36), (0.52, 0.38)):
        d.fill(rect(x + w * 0.12, y + h * py, w * 0.76, h * ph), color)
        d.shadow(rect(x + w * 0.12, y + h * py, w * 0.76, 3), 'cast')
        d.shadow(rect(x + w * 0.12, y + h * py, 3, h * ph), 'form')
    d.fill(ell(x + w * 0.8, y + h * 0.5, 2.6), CM['coatMustard'])
    d.shadow(rect(x, y, 7, h), 'form')  # the door reveal (the leaf is set back)
    d.shadow(rect(x, y, w, 6), 'cast')
    for k in range(2):  # steps: treads (faces turned up) and risers
        sx, sw = x - 8 - k * 8, w + 16 + k * 16
        ty = y + h + k * 17
        d.fill(rect(sx, ty, sw, 5), CM['limestone'], face='top')
        d.fill(rect(sx, ty + 5, sw, 12), CM['stoneShade'])
        d.fill(poly([(sx + sw, ty), (sx + sw + 6, ty + 3), (sx + sw + 6, ty + 17), (sx + sw, ty + 17)]),
               CM['stoneShade'], face='right')
    d.shadow(rect(x - 16, GROUND - 4, w + 40, 6), 'contact')


def her_window(d: Doc):
    """Her French window at M (V2S3_tHer): the teal frame band, the lit room, her plum silhouette on the phone, the
    transom, the meeting stile, the Juliet rail; tier A (subject): the shot's one full outline."""
    fx, fy, w, h = FX0, FY0, FW['w'], FW['h']
    by = fy + h + w * 0.05
    # the frame band's right return (a shade face) and its cast on the brick (A: v2's strength)
    d.shadow(poly([(fx + w + WFR + 5, fy - WFR + 6), (fx + w + WFR + 16, fy - WFR + 14), (fx + w + WFR + 16, by + 8),
                   (fx + w + WFR + 5, by + 3)]), 'cast')
    d.fill(poly([(fx + w + WFR, fy - WFR), (fx + w + WFR + 5, fy - WFR + 3), (fx + w + WFR + 5, by + 3),
                 (fx + w + WFR, by)]), CM['hero'], tier='subject', face='right')
    d.fill(rect(fx - WFR, fy - WFR, w + 2 * WFR, h + WFR), CM['hero'], tier='subject')
    # the lit room (lit panes stay unlit: CRAFT §d.9)
    d.fill(rect(fx, fy, w, h), mix(CM['lamp'], CM['lampCore'], 0.5), raw=True)
    d.fill(rect(fx + w * 0.18, fy + h * 0.12, w * 0.64, h * 0.46), CM['lampCore'], raw=True)
    d.fill(rect(fx, fy, w, h * 0.06), CM['coatOat'], tier='subject')
    for s in range(2):
        sy = fy + h * (0.3 + s * 0.18)
        d.fill(rect(fx + w * 0.55, sy, w * 0.4, h * 0.02), CM['line'], tier='subject')
        for bk in range(5):
            d.fill(rect(fx + w * (0.57 + bk * 0.075), sy - h * 0.08, w * 0.055, h * 0.08),
                   [CM['brick'], CM['coatMustard'], CM['sage'], CM['paneUnlit'], CM['box']][(bk + s) % 5], tier='subject')
    d.fill(dome(fx + w * 0.2, fy + h * 0.32, w * 0.09, h * 0.06), CM['coatMustard'], tier='subject')
    d.fill(rect(fx + w * 0.195, fy + h * 0.32, 2.0, h * 0.6), CM['anchor'], tier='subject')
    sil = her_silhouette_path()
    # her figure's ONE outline, in its own deep shade: stroked at 2x behind the fill, so only the outer 3 px show
    # (one line round the whole figure, no seams inside it)
    d.outline(sil, 'subject', CM['anchor'], width=6.0)
    d.fill(sil, CM['anchor'], tier='subject')
    d.fill(rect(fx + w * 0.48, TRANSOM, w * 0.04, fy + h - TRANSOM), CM['hero'], tier='subject')
    d.fill(rect(fx, TRANSOM, w, w * 0.035), CM['hero'], tier='subject')
    d.fill(rect(fx - WFR, fy + h - w * 0.02, w + 2 * WFR, w * 0.07), CM['hero'], tier='subject')
    ry = fy + h * 0.6
    d.bar(rect(fx - w * 0.1, ry, w * 1.2, max(2, w * 0.025)), CM['anchor'])
    bx = fx - w * 0.08
    while bx <= fx + w * 1.08:
        d.bar(rect(bx, ry, max(1.2, w * 0.012), fy + h - ry), CM['anchor'])
        bx += w * 0.09
    # tier A: ONE closed outline round the frame, in the frame's own deep shade (V2S3_tHer frontBatch, INK_PX.mid ->
    # the clean pen's 3.0 px)
    d.outline(poly([(fx - WFR, fy - WFR), (fx + w + WFR, fy - WFR), (fx + w + WFR, by), (fx - WFR, by)]), 'subject',
              CM['hero'])


def her_silhouette_path():
    """Her profile silhouette on the phone (K4's Person 'phoneEar', simplified): head, bun, coat, legs, arm up."""
    hx, hy = 331.5, 742  # her head (map S3.pushFrom (330, 742)); she faces left, in profile
    head = ell(hx, hy, 13, 14.5)
    bun = ell(hx + 11, hy - 6, 7.5)
    neck = rect(hx - 4, hy + 10, 9, 8)
    coat = poly(bez((hx - 4, hy + 16), (hx - 18, hy + 18), (hx - 19, hy + 40), (hx - 18, hy + 60), 10) +
                [(hx - 22, hy + 100), (hx + 18, hy + 100)] +
                bez((hx + 15, hy + 56), (hx + 16, hy + 30), (hx + 14, hy + 17), (hx + 4, hy + 16), 10))
    legs = rect(hx - 12, hy + 99, 9, 21) + rect(hx + 2, hy + 99, 9, 21)
    # the arm bent up: the elbow out in front, the forearm across the jaw, the hand and the phone at her ear
    arm = poly([(hx - 4, hy + 20), (hx - 12, hy + 19), (hx - 23, hy + 34), (hx - 19, hy + 42), (hx - 9, hy + 35),
                (hx + 5, hy + 12), (hx + 5, hy - 2), (hx - 3, hy - 3), (hx - 4, hy + 8)])
    return head + bun + neck + coat + legs + arm


def terrace(d: Doc):
    for H in HOUSES:
        x0, x1 = H['x0'], H['x1']
        if H['roof'] == 'mansard':
            d.fill(poly([(x0, CORNICE), (x0 + 10, H['top']), (x1 - 10, H['top']), (x1, CORNICE)]), CM['shadeCool'])
            d.fill(rect(x0 + 8, H['top'] - 4, x1 - x0 - 16, 5), CM['paneUnlit'], face='top')
        else:
            d.fill(rect(x0, H['top'], x1 - x0, CORNICE - H['top'] + 2), H['wall'])
            d.fill(rect(x0 - 2, H['top'] - 6, x1 - x0 + 4, 7), CM['limestone'], face='top')
            d.fill(rect(x0 - 2, H['top'] + 1, x1 - x0 + 4, 3), CM['limestone'], face='under')
    dormer(d, 230, 637, 36, 21, False)
    dormer(d, 404, 637, 36, 21, True)
    dormer(d, 868, 633, 42, 24, True)
    stack(d, 163, 40, 602, CORNICE, CM['brickDeep'])
    stack(d, 500, 42, 598, CORNICE, CM['brick'])
    stack(d, 752, 42, 602, 640, CM['brickLight'])
    stack(d, 986, 42, 604, CORNICE, CM['brickDeep'])
    for H in HOUSES:
        d.fill(rect(H['x0'], CORNICE, H['x1'] - H['x0'], GROUND - CORNICE), H['wall'])
    d.fill(rect(525, STRING + 6, 250, GROUND - STRING - 6), CM['stucco'])
    d.fill(rect(1010, STRING + 6, 290, GROUND - STRING - 6), mix(CM['sage'], CM['stucco'], 0.35))
    for x in (525, 775, 1010):  # party-wall pilasters: a face and its right return
        d.fill(rect(x - 3, CORNICE, 6, GROUND - CORNICE), CM['brickDeep'])
        d.fill(rect(x + 3, CORNICE, 4, GROUND - CORNICE), CM['brickDeep'], face='right')
    d.shadow(rect(160, CORNICE + 13, 1140, 11), 'cast')  # the cornice's cast band on the walls
    d.fill(rect(160, CORNICE - 6, 1140, 14), CM['limestone'])
    d.fill(rect(160, CORNICE + 8, 1140, 5), CM['limestone'], face='under')
    d.shadow(rect(160, STRING + 10, 1140, 6), 'cast')
    d.fill(rect(160, STRING, 1140, 7), CM['limestone'])
    d.fill(rect(160, STRING + 7, 1140, 3), CM['limestone'], face='under')
    d.fill(rect(160, CORNICE, 6, GROUND - CORNICE), CM['brickDeep'])  # her end wall's quoin edge
    sash(d, 566, 708, 66, 136, True, curtain=CM['blossom'], surround='hood')
    sash(d, 668, 708, 66, 136, False, surround='hood', blind=0.36)
    sash(d, 794, 714, 38, 130, False, surround='arch')
    sash(d, 852, 706, 74, 158, True, surround='arch', sill=False, inner='shelf')
    sash(d, 1036, 710, 62, 134, True, curtain=CM['leafRust'], surround='plain', inner='shelf')
    bx0, bx1, by = 836, 942, 864  # house 3's balcony
    d.shadow(poly([(bx0 + 4, by + 11), (bx1 + 6, by + 11), (bx1 + 14, by + 26), (bx0 + 12, by + 26)]), 'cast')
    d.fill(rect(bx0, by, bx1 - bx0, 7), CM['limestone'])
    d.fill(rect(bx0, by + 7, bx1 - bx0, 4), CM['limestone'], face='under')
    d.fill(poly([(bx1, by), (bx1 + 6, by + 3), (bx1 + 6, by + 11), (bx1, by + 11)]), CM['limestone'], face='right')
    d.bar(rect(bx0, by - 40, bx1 - bx0, 3), S3_IRON)
    for k in range(10):
        d.bar(rect(bx0 + 3 + k * 11.3, by - 40, 1.8, 40), S3_IRON)
    bay(d)
    sash(d, 562, 920, 86, 114, True, curtain=CM['coatMustard'], surround='plain')
    sash(d, 884, 920, 100, 114, True, curtain=CM['box'], surround='arch', inner='pendant')
    sash(d, 1030, 922, 30, 110, True, surround='plain', sill=False)
    door(d, 184, 940, 62, 126, CM['hero'], fan='arch', fan_lit=True)
    door(d, 690, 940, 62, 126, CM['coatMustard'], fan='rect', fan_lit=False)
    door(d, 792, 942, 60, 124, CM['sage'], fan='arch', fan_lit=True, case=False)
    for x in (521, 771, 1006):
        d.bar(rect(x, CORNICE + 8, 4, GROUND - CORNICE - 8), S3_IRON)
    her_window(d)
    window_box(d)


def window_box(d: Doc):
    """Her window box (map S3.windowBox): planting on a painted trough; its right end and underside in shade, its cast
    on the brick below (falling right)."""
    x0, y0, x1, y1 = BOX['x0'], BOX['y0'], BOX['x1'], BOX['y1']
    d.shadow(poly([(x0 + 8, y1), (x1 + 8, y1), (x1 + 22, y1 + 18), (x0 + 22, y1 + 18)]), 'cast')
    west = [(x0 + 18, y0 - 6, 16), (x0 + 44, y0 - 14, 20), (x0 + 74, y0 - 10, 18), (x0 + 100, y0 - 4, 14)]
    east = [(x0 + 130, y0 - 4, 12), (x0 + 160, y0 - 8, 14), (x0 + 192, y0 - 6, 13), (x0 + 222, y0 - 9, 15),
            (x0 + 248, y0 - 5, 12)]
    dd = ''.join(ell(x, y, r) for x, y, r in west + east)
    d.fill(dd, CM['sage'])
    d.shadow(''.join(ell(x + r * 0.55, y + r * 0.4, r * 0.85) for x, y, r in west + east), 'leaf', clip=d.clip(dd))
    for x, y, c in ((x0 + 24, y0 - 20, CM['leafRust']), (x0 + 52, y0 - 30, CM['blossom']), (x0 + 84, y0 - 24, CM['leafRust']),
                    (x0 + 150, y0 - 18, CM['blossom']), (x0 + 214, y0 - 20, CM['box'])):
        d.fill(ell(x, y, 6.5, 5.5), c)
    d.fill(rect(x0, y0, x1 - x0, y1 - y0 - 2), CM['line'])
    d.fill(poly([(x1, y0), (x1 + 9, y0 + 3), (x1 + 9, y1 + 1), (x1, y1 - 2)]), CM['line'], face='right')
    d.fill(rect(x0, y1 - 2, x1 - x0, 3), CM['line'], face='under')
    d.fill(rect(x0, y0, x1 - x0, 4), CM['line'], face='top')
    for k in range(5):
        d.fill(ell(x0 + 24 + k * 52, y0 + 16, 4, 9), CM['sage'])


def pavement_and_railings(d: Doc):
    d.fill(rect(-10, GROUND, 1100, 22), CM['paving'], face='top')
    d.fill(rect(-10, GROUND + 22, 1100, 6), CM['limestone'])
    for x in range(176, 1080, 19):  # area railings (S3_IRON: things that ARE lines), gates at the doors
        if 184 - 24 <= x <= 246 + 24 or 690 - 24 <= x <= 752 + 24 or 792 - 16 <= x <= 852 + 16:
            continue
        d.bar(rect(x, GROUND - 64, 1.8, 64), S3_IRON)
    for (a, b) in ((276, 660), (782, 776), (868, 1080)):
        if b > a:
            d.bar(rect(a, GROUND - 64, b - a, 2.6), S3_IRON)
            d.bar(rect(a, GROUND - 20, b - a, 2.0), S3_IRON)
    lx = 1046  # a street lamp (C): the post in two tones, the lantern lit (sunset)
    d.shadow(rect(lx - 10, GROUND - 3, 30, 5), 'contact')
    d.fill(rect(lx - 3, 905, 6, GROUND - 905), CM['paneUnlit'])
    d.fill(rect(lx, 905, 3, GROUND - 905), CM['paneUnlit'], face='right')
    d.fill(poly([(lx - 13, 872), (lx + 13, 872), (lx + 9, 904), (lx - 9, 904)]), CM['lamp'], raw=True)
    d.fill(poly([(lx - 17, 872), (lx, 860), (lx + 17, 872)]), CM['paneUnlit'])
    d.fill(poly([(lx, 860), (lx + 17, 872), (lx, 872)]), CM['paneUnlit'], face='right')
    d.fill(rect(lx - 10, 904, 20, 4), CM['paneUnlit'])


def tube(pts, r0, r1):
    """A filled tube along a polyline (radius r0 -> r1), closed: a trunk, a tail."""
    n = len(pts)
    left, right = [], []
    for i, (x, y) in enumerate(pts):
        if i == 0:
            dx, dy = pts[1][0] - x, pts[1][1] - y
        elif i == n - 1:
            dx, dy = x - pts[i - 1][0], y - pts[i - 1][1]
        else:
            dx, dy = pts[i + 1][0] - pts[i - 1][0], pts[i + 1][1] - pts[i - 1][1]
        L = math.hypot(dx, dy) or 1
        nx, ny = -dy / L, dx / L
        r = r0 + (r1 - r0) * i / (n - 1)
        left.append((x + nx * r, y + ny * r))
        right.append((x - nx * r, y - ny * r))
    return poly(left + right[::-1])


def bez(p0, p1, p2, p3, n=14):
    out = []
    for i in range(n + 1):
        t = i / n
        a, b, c, e = (1 - t) ** 3, 3 * (1 - t) ** 2 * t, 3 * (1 - t) * t ** 2, t ** 3
        out.append((a * p0[0] + b * p1[0] + c * p2[0] + e * p3[0], a * p0[1] + b * p1[1] + c * p2[1] + e * p3[1]))
    return out


def pip(d: Doc):
    """Pip (tier B; K5 'towpath Pip'): seated on her terrace railing facing left, the trunk curled, the big ear with
    its pink inner over the back of the head, the straw scarf and its knot, a tail with a tuft. A: v2's thin same-hue
    line (#616389). B: no line; the head parts from the body by the scarf and the body's shade face."""
    x, y = PIP['x'], PIP['y']
    sup = dict(tier='support', bg=CM['stucco'])
    body_d = ell(x + 4, y - 27, 34, 27)
    head_d = ell(x - 12, y - 66, 29, 26)
    leg_d = ell(x - 26, y - 6, 12, 9)
    trunk = bez((x - 36, y - 62), (x - 52, y - 60), (x - 64, y - 66), (x - 64, y - 76)) + \
        bez((x - 64, y - 76), (x - 64, y - 86), (x - 50, y - 88), (x - 48, y - 79))[1:]
    trunk_d = tube(trunk, 8.5, 5.5)
    tail = bez((x + 34, y - 20), (x + 40, y - 10), (x + 40, y + 2), (x + 44, y + 12), 8)
    tail_d = tube(tail, 2.6, 2.0) + ell(x + 45, y + 15, 4.5, 3.5)
    ear_d = ell(x + 15, y - 62, 20, 25)
    ear_in = ell(x + 16, y - 61, 13.5, 18.5)
    scarf = poly([(x - 36, y - 46), (x + 18, y - 44), (x + 18, y - 35), (x - 34, y - 38)])
    knot = ell(x - 33, y - 39, 7)
    tails = poly([(x - 36, y - 36), (x - 30, y - 34), (x - 36, y - 18), (x - 44, y - 21)])
    d.shadow(rect(x - 36, y - 1, 74, 5), 'contact')
    d.fill(leg_d, CM['pipShade'], **sup)
    d.outline(leg_d, 'support', 'pip')
    d.fill(tail_d, CM['pipBody'], **sup)
    d.outline(tail_d, 'support', 'pip')
    d.fill(body_d, CM['pipBody'], **sup)
    d.shadow(ell(x + 30, y - 16, 28, 30), 'form', clip=d.clip(body_d))  # the body's face turned from the sun
    d.outline(body_d, 'support', 'pip')
    d.fill(tails, CM['pipScarf'], **sup)
    d.outline(tails, 'support', 'pip')
    d.fill(head_d, CM['pipBody'], **sup)
    d.shadow(ell(x + 10, y - 50, 18, 24), 'form', clip=d.clip(head_d))
    d.outline(head_d, 'support', 'pip')
    d.fill(trunk_d, CM['pipBody'], **sup)
    d.outline(trunk_d, 'support', 'pip')
    d.fill(ear_d, CM['pipBody'], **sup)
    d.fill(ear_in, CM['pipEar'], **sup)
    d.shadow(ell(x + 30, y - 56, 13, 26), 'form', clip=d.clip(ear_d))
    d.outline(ear_d, 'support', 'pip')
    d.fill(scarf, CM['pipScarf'], **sup)
    d.outline(scarf, 'support', 'pip')
    d.fill(knot, CM['pipScarf'], **sup)
    d.outline(knot, 'support', 'pip')
    d.fill(ell(x - 24, y - 72, 2.6, 3.2), CM['anchor'], raw=True)
    d.fill(ell(x - 16, y - 58, 5.5, 3.4), CM['blossom'], **sup)
    for k, (a, b) in enumerate((((x - 14, y - 92), (x - 18, y - 102)), ((x - 10, y - 92), (x - 9, y - 104)),
                                ((x - 6, y - 92), (x - 1, y - 101)))):
        d.bar(tube([a, b], 1.0, 0.8), PIP_LINE)  # the tuft: things that ARE lines


def walker(d: Doc):
    """A walker on her pavement (tier B, small, from behind, hood up; v2 S3's), a thin tinted line in A."""
    x, fy, h = 768, GROUND + 10, 116
    sup = dict(tier='support', bg=CM['paving'])
    coat = CM['coatSlate']
    legs = poly([(x - 9, fy - 46), (x - 2, fy - 46), (x - 4, fy - 2), (x - 11, fy - 2)]) + \
        poly([(x + 1, fy - 46), (x + 9, fy - 46), (x + 13, fy - 3), (x + 6, fy - 3)])
    body = rrect(x - 16, fy - h + 26, 32, 72, 12)
    hood = ell(x, fy - h + 18, 13, 15)
    bag = rrect(x + 14, fy - 66, 10, 16, 3)
    d.shadow(ell(x + 10, fy, 26, 5), 'contact')
    d.fill(legs, CM['anchor'], **sup)
    d.fill(body, coat, **sup)
    d.shadow(rect(x + 3, fy - h, 20, h), 'form', clip=d.clip(body))
    d.fill(hood, CM['stoneShade'], **sup)
    d.shadow(rect(x + 3, fy - h - 6, 16, 40), 'form', clip=d.clip(hood))
    d.fill(bag, CM['coatMustard'], **sup)
    d.outline(body, 'support', tier_fill(coat, 'support', CM['paving']))
    d.outline(hood, 'support', tier_fill(CM['stoneShade'], 'support', CM['paving']))
    d.outline(bag, 'support', tier_fill(CM['coatMustard'], 'support', CM['paving']))


def water(d: Doc):
    """The canal (C): the water, the bank's shade under the kerb, broken reflections, a few long glints."""
    y0, y1 = GROUND + 28, 1360
    d.fill(rect(-10, y0, 1100, y1 - y0), CM['water'], bg=BG_SKY)
    W = tier_fill(CM['water'], 'environment', BG_SKY)
    for H in HOUSES:
        c = mix(tier_fill(H['wall'], 'environment', BG_TERRACE), W, 0.68)
        for k, (yy, hh) in enumerate(((y0 + 16, 16), (y0 + 42, 10), (y0 + 62, 6))):
            inset = 10 + k * 12
            span = H['x1'] - H['x0'] - 2 * inset
            for s0, s1 in ((0.0, 0.42), (0.5, 1.0)) if k else ((0.0, 1.0),):
                d.fill(rrect(H['x0'] + inset + span * s0, yy, span * (s1 - s0), hh, hh / 2), c, raw=True)
    for x, w in ((566, 66), (852, 74), (884, 100), (1036, 62), (562, 86), (268, 132)):
        d.fill(rrect(x + 10, y0 + 22, w - 20, 4, 2), mix(CM['lamp'], W, 0.35), raw=True)
    d.shadow(rect(-10, y0, 1100, 10), 'water')
    for x, yy, w in ((60, 1196, 110), (440, 1204, 80), (690, 1192, 120)):
        d.fill(rrect(x, yy, w, 3, 1.5), mix(CM['paper'], W, 0.3), raw=True)


def boat(d: Doc):
    """A narrowboat moored on our side (C; kit/canal/boat.tsx's design): slate hull + ONE plum gunwale stripe, a sage
    cabin with portholes and a painted door panel, an oat roof with pots and a chimney."""
    x0, x1 = 150, 990
    roof_y, cab_y, gun_y, wl = 1216, 1228, 1292, 1334
    d.shadow(poly([(x0 + 40, wl - 4), (x1 + 6, wl - 4), (x1 + 34, wl + 16), (x0 + 60, wl + 16)]), 'water')
    d.fill(poly([(x0 + 40, gun_y), (x1, gun_y), (x1 + 6, wl), (x0 + 58, wl)]), CM['coatSlate'])
    d.fill(poly([(x0 - 26, gun_y - 4), (x0 + 40, gun_y), (x0 + 58, wl), (x0 + 22, wl - 4)]), CM['coatSlate'], face='left')
    d.fill(poly([(x1, gun_y), (x1 + 12, gun_y + 2), (x1 + 14, wl - 2), (x1 + 6, wl)]), CM['coatSlate'], face='right')
    d.shadow(poly([(x0 + 34, gun_y + 4), (x1 + 12, gun_y + 4), (x1 + 12, gun_y + 13), (x0 + 40, gun_y + 13)]), 'cast')
    d.fill(poly([(x0 - 30, gun_y - 8), (x1 + 12, gun_y - 8), (x1 + 12, gun_y - 3), (x0 - 24, gun_y - 3)]),
           CM['coatSlate'], face='top')
    d.fill(poly([(x0 - 24, gun_y - 3), (x1 + 12, gun_y - 3), (x1 + 12, gun_y + 4), (x0 - 14, gun_y + 4)]), CM['anchor'],
           raw=True)
    cx0, cx1 = x0 + 70, x1 - 70
    d.fill(rect(cx0, cab_y, cx1 - cx0, gun_y - 8 - cab_y), CM['sage'])
    d.fill(poly([(cx1, cab_y), (cx1 + 14, cab_y + 3), (cx1 + 14, gun_y - 8), (cx1, gun_y - 8)]), CM['sage'], face='right')
    d.fill(rect(cx0, cab_y + 2, cx1 - cx0, 10), CM['brick'])  # the roof band: brick with cream diamonds (S3's)
    for k in range(int((cx1 - cx0) / 34)):
        dx = cx0 + 17 + k * 34
        d.fill(poly([(dx, cab_y + 3), (dx + 4, cab_y + 7), (dx, cab_y + 11), (dx - 4, cab_y + 7)]), CM['paper'])
    beading = mix(CM['paper'], CM['sage'], 0.3)
    for px0, px1 in ((cx0 + 10, cx0 + 200), (cx0 + 330, cx0 + 520), (cx0 + 540, cx1 - 10)):
        d.bar(rrect(px0, cab_y + 20, px1 - px0, 2, 1), beading)
        d.bar(rrect(px0, gun_y - 18, px1 - px0, 2, 1), beading)
    for k, px in enumerate((cx0 + 60, cx0 + 140, cx0 + 400, cx0 + 470, cx0 + 600, cx0 + 680)):
        if px > cx1 - 20:
            continue
        lit = k % 2 == 0
        rim = ell(px, cab_y + 38, 17)
        d.fill(rim, CM['leafGold'])
        d.shadow(ell(px + 9, cab_y + 46, 13), 'form', clip=d.clip(rim))  # the brass rim's crescent away from the sun
        d.fill(ell(px, cab_y + 38, 12), CM['lamp'] if lit else CM['glass'], raw=lit)
        if not lit:  # the recess of an unlit porthole (lit panes stay unlit)
            d.shadow(ell(px - 5, cab_y + 33, 12), 'form', clip=d.clip(ell(px, cab_y + 38, 12)))
    dx0 = cx0 + 222
    d.fill(rect(dx0, cab_y + 16, 92, gun_y - 8 - cab_y - 16), CM['brickDeep'])
    d.fill(rect(dx0 + 6, cab_y + 21, 37, gun_y - 8 - cab_y - 26), CM['paper'])
    d.fill(rect(dx0 + 49, cab_y + 21, 37, gun_y - 8 - cab_y - 26), CM['paper'])
    d.shadow(rect(dx0 + 6, cab_y + 21, 5, gun_y - 8 - cab_y - 26), 'form')
    d.shadow(rect(dx0 + 49, cab_y + 21, 5, gun_y - 8 - cab_y - 26), 'form')
    for fx in (dx0 + 24, dx0 + 67):
        d.fill(ell(fx, cab_y + 38, 6), CM['leafRust'])
        d.fill(ell(fx - 6, cab_y + 46, 4), CM['blossom'])
        d.fill(ell(fx + 6, cab_y + 46, 4), CM['sage'])
    # the roof (a face turned up), its overhang's underside and its cast on the cabin
    d.shadow(rect(cx0, cab_y + 2, cx1 - cx0 + 14, 9), 'cast')
    d.fill(rect(cx0 - 8, roof_y, cx1 - cx0 + 16, cab_y - roof_y), CM['coatOat'], face='top')
    d.fill(poly([(cx1 + 8, roof_y), (cx1 + 20, roof_y + 3), (cx1 + 20, cab_y + 2), (cx1 + 8, cab_y)]), CM['coatOat'],
           face='right')
    d.fill(rect(cx0 - 8, cab_y - 2, cx1 - cx0 + 16, 4), CM['coatOat'], face='under')
    for px in (cx0 + 30, cx0 + 62):  # pots on the roof
        d.shadow(ell(px + 8, roof_y + 1, 14, 3), 'contact')
        d.fill(poly([(px - 10, roof_y - 18), (px + 10, roof_y - 18), (px + 7, roof_y), (px - 7, roof_y)]), CM['brickDeep'])
        d.fill(poly([(px + 2, roof_y - 18), (px + 10, roof_y - 18), (px + 7, roof_y), (px + 2, roof_y)]), CM['brickDeep'],
               face='right')
        lob = ell(px - 6, roof_y - 24, 9) + ell(px + 5, roof_y - 28, 10) + ell(px + 1, roof_y - 20, 9)
        d.fill(lob, CM['sage'])
        d.shadow(ell(px + 9, roof_y - 22, 9), 'leaf', clip=d.clip(lob))
    d.fill(ell(cx0 + 150, roof_y - 4, 16, 6), CM['coatOat'])
    d.fill(ell(cx0 + 150, roof_y - 4, 9, 3), CM['line'])
    chx = cx1 - 120  # the chimney (a cylinder: lit left, shade right) with a brass band
    d.shadow(poly([(chx + 8, roof_y), (chx + 34, roof_y + 2), (chx + 34, roof_y + 5), (chx + 8, roof_y + 4)]), 'contact')
    d.fill(rect(chx - 8, roof_y - 46, 16, 46), CM['anchor'], raw=True)
    d.fill(rect(chx, roof_y - 46, 8, 46), CM['anchor'], face='right', raw=True)
    d.fill(rect(chx - 9, roof_y - 32, 18, 5), CM['leafGold'])
    d.fill(rect(chx, roof_y - 32, 9, 5), CM['leafGold'], face='right')
    d.bar(poly([(x1 - 10, gun_y - 10), (x1 + 30, gun_y - 44), (x1 + 33, gun_y - 41), (x1 - 6, gun_y - 7)]), CM['anchor'])


def towpath(d: Doc):
    """Our towpath (C): the coping (a face turned up), its front, the paving, a bollard and its rope."""
    top = 1362
    d.fill(rect(-10, top, 1100, 10), CM['limestone'], face='top')
    d.fill(rect(-10, top + 10, 1100, 8), CM['limestone'])
    d.fill(rect(-10, top + 18, 1100, 120), CM['paving'], face='top')


def build(mode: str) -> Doc:
    d = Doc(mode)
    sky_and_far(d)
    tree(d)
    terrace(d)
    pavement_and_railings(d)
    walker(d)
    pip(d)
    water(d)
    boat(d)
    towpath(d)
    return d


def view_svg(mode: str, vb, w_px: int) -> str:
    """The scene in `mode` through the view box `vb` (world px), `w_px` wide."""
    x, y, w, h = vb
    return build(mode).svg(vb, w_px, round(w_px * h / w))


if __name__ == '__main__':
    import os
    import sys
    out = sys.argv[1] if len(sys.argv) > 1 else '/tmp/posters-ab/build'
    os.makedirs(out, exist_ok=True)
    for m in ('A', 'B', 'B0'):
        open(f'{out}/scene_{m}.svg', 'w').write(view_svg(m, VIEW_PANEL, 870))
        open(f'{out}/zoom_{m}.svg', 'w').write(view_svg(m, VIEW_ZOOM, 870))
    print('ok')
