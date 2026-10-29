"""Three constructions of scene 1 ("She quit Google.") as grey value thumbnails, 540 x 960, 7 flat values.

python3 thumbs.py OUT_DIR   ->  thumb_A.png, thumb_B.png, thumb_C.png (+ .svg in /tmp/scene1-iter)
Drawn in 1080 x 1920 units, rendered at half size.
"""
import math
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from svgkit import SVG, render  # noqa: E402

# 7 values: air, ghost, far, light-mid, mid, dark-mid, dark
V = {1: '#eeeeee', 2: '#dedede', 3: '#c9c9c9', 4: '#acacac', 5: '#8b8b8b', 6: '#626262', 7: '#383838'}
INK = '#262626'
SCRATCH = '/tmp/scene1-iter'


def caption(s):
    s.text(540, 478, 'She quit Google.', 112, INK)


def person(s, x, y, h, fill):
    """a tiny walker from behind: head, coat, legs (flat)."""
    w = h * 0.30
    s.ellipse(x, y - h * 0.88, h * 0.10, h * 0.115, fill)
    s.poly([(x - w * 0.5, y - h * 0.78), (x + w * 0.5, y - h * 0.78), (x + w * 0.62, y - h * 0.30),
            (x - w * 0.62, y - h * 0.30)], fill)
    s.poly([(x - w * 0.35, y - h * 0.31), (x - w * 0.05, y - h * 0.31), (x - w * 0.30, y), (x - w * 0.52, y)], fill)
    s.poly([(x + w * 0.05, y - h * 0.31), (x + w * 0.35, y - h * 0.31), (x + w * 0.55, y), (x + w * 0.32, y)], fill)


def tree(s, cx, cy, r, dark, lit):
    s.circle(cx, cy, r, dark)
    s.circle(cx + r * 0.25, cy - r * 0.25, r * 0.62, lit)


def thumb_A():
    """A raised designed view: dark near roofs + trees frame the bottom, the canal is the gap, the landscraper is the
    hero (a frontal elevation, its left end stepping down), the far city lifted onto a second horizon behind its roof,
    the St Pancras tower as the pale far anchor."""
    s = SVG(1080, 1920, 540, 960)
    s.rect(0, 0, 1080, 1920, V[1])
    caption(s)
    # far stage: ghost skyline on a second horizon (y ~990), the Shard ghost, St Pancras tower (pale far anchor)
    blocks = [(0, 930), (70, 905), (130, 950), (300, 915), (380, 940), (470, 890), (560, 925), (650, 900), (900, 935),
              (980, 905), (1040, 930)]
    for i, (x, top) in enumerate(blocks):
        x2 = blocks[i + 1][0] if i + 1 < len(blocks) else 1080
        s.rect(x, top, x2 - x + 1, 1000 - top, V[2])
    s.poly([(808, 715), (770, 1000), (858, 1000)], V[2])
    # St Pancras: the hotel's gabled range + the clock tower and spire
    s.poly([(60, 895), (330, 895), (330, 1000), (60, 1000)], V[3])
    for gx in (90, 150, 270):
        s.poly([(gx, 895), (gx + 22, 862), (gx + 44, 895)], V[3])
    s.rect(180, 760, 62, 240, V[3])
    s.poly([(176, 762), (211, 640), (246, 762)], V[3])
    # hero: the landscraper, a long frontal elevation, its left end stepping down in terraces
    top, base = 960, 1300
    s.rect(330, top, 760, base - top, V[4])
    s.rect(200, 1010, 135, base - 1010, V[4])
    s.rect(70, 1065, 135, base - 1065, V[4])
    # shade faces: the terraces' risers / left ends
    s.poly([(52, 1072), (70, 1065), (70, base), (52, base)], V[6])
    s.poly([(186, 1016), (200, 1010), (200, 1065), (186, 1065)], V[6])
    s.poly([(318, 966), (330, 960), (330, 1010), (318, 1010)], V[6])
    # the signature rhythm: tall fins in bays
    for x in range(78, 1080, 18):
        y0 = 1072 if x < 200 else (1018 if x < 330 else 968)
        s.rect(x, y0, 6, base - 10 - y0, V[5])
    for y in range(1050, base, 62):
        s.rect(52, y, 1040, 7, V[5])
    # roof garden trees
    for i, x in enumerate(range(345, 1080, 46)):
        tree(s, x, top - 12 - (i % 3) * 5, 20 + (i % 2) * 6, V[6], V[5])
    for x in (220, 268, 300):
        tree(s, x, 1000, 18, V[6], V[5])
    for x in (90, 140, 180):
        tree(s, x, 1056, 16, V[6], V[5])
    # door + her (dark on the light quay)
    s.rect(600, 1212, 54, 88, V[7])
    s.rect(52, base, 1040, 40, V[3])
    person(s, 690, 1334, 58, V[7])
    # the canal: one flat light field (the gap) + the hero's reflection
    s.rect(0, 1340, 1080, 160, V[3])
    s.rect(52, 1340, 1040, 28, V[4])
    s.poly([(120, 1420), (470, 1420), (455, 1450), (135, 1450)], V[6])
    s.rect(180, 1402, 160, 20, V[5])
    # near frame: the quay wall + dark near roofs seen from above + trees on both sides
    s.rect(0, 1500, 1080, 420, V[6])
    s.rect(0, 1500, 1080, 16, V[7])
    s.poly([(0, 1600), (360, 1560), (520, 1640), (160, 1700), (0, 1690)], V[5])
    s.poly([(0, 1690), (160, 1700), (520, 1640), (560, 1920), (0, 1920)], V[7])
    s.poly([(520, 1640), (780, 1580), (1080, 1620), (1080, 1920), (560, 1920)], V[6])
    s.poly([(780, 1580), (1080, 1540), (1080, 1620)], V[5])
    for (cx, cy, r) in [(40, 1260, 150), (120, 1420, 130), (-10, 1520, 160)]:
        tree(s, cx, cy, r, V[7], V[6])
    for (cx, cy, r) in [(1060, 1330, 140), (980, 1470, 110)]:
        tree(s, cx, cy, r, V[7], V[6])
    for x in range(40, 1080, 70):
        s.rect(x, 1840, 34, 54, V[4])
    return s


def thumb_B():
    """B the long building as the hero over the canal, Nyhavn-like: a standing eye at the near rail, the facade row
    receding from the left edge to a VP past the right edge, the gasholders and the St Pancras tower at its far end."""
    s = SVG(1080, 1920, 540, 960)
    s.rect(0, 0, 1080, 1920, V[1])
    caption(s)
    hy, vx = 1250, 1420
    # far: ghost blocks on the horizon, the St Pancras tower ghost, the gasholder frames
    for i, x in enumerate(range(620, 1080, 60)):
        s.rect(x, hy - 90 - (i * 37 % 60), 61, 90 + (i * 37 % 60), V[2])
    s.rect(880, 800, 50, hy - 800, V[2])
    s.poly([(876, 802), (905, 700), (934, 802)], V[2])
    for gx, r in [(640, 92), (760, 80)]:
        s.rect(gx - r, hy - 230, 2 * r, 230, V[3])
        for k in range(7):
            s.rect(gx - r + k * (2 * r / 6) - 4, hy - 236, 8, 236, V[5])
        for yy in (hy - 236, hy - 160, hy - 84):
            s.rect(gx - r - 4, yy, 2 * r + 8, 8, V[5])

    def fy(x, y0):  # a line toward the VP
        return y0 + (hy - y0) * (x + 10) / (vx + 10)
    x1 = 700
    t0, b0 = 650, 1560
    s.poly([(-10, t0), (x1, fy(x1, t0)), (x1, fy(x1, b0)), (-10, b0)], V[4])
    # shade: the far end face
    s.poly([(x1, fy(x1, t0)), (x1 + 34, fy(x1, t0) + 8), (x1 + 34, fy(x1, b0) - 6), (x1, fy(x1, b0))], V[6])
    # fins, spaced by 1/z
    x = 0.0
    while x < x1:
        z = 1 + 2.2 * x / x1
        s.poly([(x, fy(x, t0) + 14), (x + 9 / z, fy(x + 9 / z, t0) + 14), (x + 9 / z, fy(x + 9 / z, b0) - 8),
                (x, fy(x, b0) - 8)], V[5])
        x += 30 / z
    for y0 in range(t0 + 90, b0, 95):
        s.poly([(-10, y0), (x1, fy(x1, y0)), (x1, fy(x1, y0 + 9)), (-10, y0 + 9)], V[5])
    for i in range(0, 14):
        xx = i * 52
        tree(s, xx, fy(xx, t0) - 14, 26 - i * 1.2, V[6], V[5])
    # quay at its foot, her
    s.poly([(-10, b0), (x1, fy(x1, b0)), (x1 + 400, fy(x1 + 400, b0) + 6), (-10, b0 + 70)], V[3])
    s.rect(250, fy(250, b0) - 130, 60, 130, V[7])
    person(s, 360, fy(360, b0) + 24, 76, V[7])
    # water
    s.poly([(-10, b0 + 70), (1080, fy(1080, b0) + 26), (1080, 1690), (-10, 1690)], V[3])
    s.poly([(-10, b0 + 70), (x1, fy(x1, b0) + 18), (x1, fy(x1, b0) + 46), (-10, b0 + 140)], V[4])
    # near: a narrowboat's bow at right, the rail, the paving
    s.poly([(620, 1600), (1080, 1540), (1080, 1700), (660, 1690)], V[6])
    s.poly([(640, 1600), (1080, 1545), (1080, 1575), (650, 1625)], V[5])
    s.rect(-10, 1690, 1100, 240, V[5])
    for k in range(-4, 12):
        s.poly([(k * 140, 1920), (k * 140 + 40, 1920), (vx * 0.5 + k * 10 + 40, 1690), (vx * 0.5 + k * 10, 1690)], V[6])
    s.rect(0, 1730, 1080, 12, V[7])
    s.rect(0, 1650, 1080, 10, V[7])
    for x in range(30, 1080, 190):
        s.rect(x, 1640, 18, 230, V[7])
    tree(s, 1060, 980, 170, V[7], V[6])
    tree(s, 990, 1170, 120, V[7], V[6])
    return s


def thumb_C():
    """C a King's Cross capriccio: the landscraper the biggest icon, the gasholder frames at left, Coal Drops Yard's
    kissing roofs in front, the St Pancras tower pale and far, Granary Square's steps down to the canal, dark leaves
    framing the bottom corners."""
    s = SVG(1080, 1920, 540, 960)
    s.rect(0, 0, 1080, 1920, V[1])
    caption(s)
    for i, x in enumerate(range(0, 1080, 64)):
        s.rect(x, 900 - (i * 53 % 70), 65, 120 + (i * 53 % 70), V[2])
    s.rect(470, 760, 60, 300, V[3])
    s.poly([(466, 762), (500, 645), (534, 762)], V[3])
    # gasholders (left): three ring frames
    for gx, r, gy in [(90, 150, 1210), (290, 130, 1235), (-60, 120, 1230)]:
        s.rect(gx - r * 0.8, gy - 300, r * 1.6, 300, V[4])
        for k in range(9):
            s.rect(gx - r + k * (2 * r / 8) - 6, gy - 330, 12, 330, V[6])
        for yy in (gy - 330, gy - 220, gy - 110):
            s.rect(gx - r - 6, yy, 2 * r + 12, 12, V[6])
    # hero landscraper (centre-right)
    top, base = 890, 1250
    s.rect(400, top, 700, base - top, V[4])
    s.poly([(380, top + 10), (400, top), (400, base), (380, base)], V[6])
    for x in range(410, 1080, 18):
        s.rect(x, top + 10, 6, base - top - 20, V[5])
    for y in range(top + 50, base, 64):
        s.rect(380, y, 720, 7, V[5])
    for i, x in enumerate(range(410, 1080, 44)):
        tree(s, x, top - 12 - (i % 3) * 5, 20 + (i % 2) * 6, V[6], V[5])
    # Coal Drops Yard's kissing roofs
    s.path('M300,1400 L300,1270 Q470,1260 600,1150 Q730,1260 900,1270 L900,1400 Z', V[6])
    s.path('M300,1270 Q470,1260 600,1150 L600,1190 Q480,1290 300,1300 Z', V[5])
    s.rect(300, 1300, 600, 100, V[4])
    for x in range(330, 900, 60):
        s.rect(x, 1320, 26, 60, V[6])
    # canal + boat, her on the towpath
    s.rect(0, 1400, 1080, 110, V[3])
    s.poly([(560, 1440), (900, 1440), (885, 1468), (575, 1468)], V[6])
    s.rect(0, 1510, 1080, 30, V[4])
    person(s, 660, 1540, 56, V[7])
    # near: Granary Square's steps + dark leaves at the corners
    for k in range(7):
        y = 1540 + k * 54
        s.rect(0, y, 1080, 54, V[5] if k % 2 else V[4])
    s.rect(0, 1700, 1080, 220, V[6])
    for (cx, cy, r) in [(60, 1620, 210), (-20, 1800, 200), (180, 1850, 150)]:
        tree(s, cx, cy, r, V[7], V[6])
    for (cx, cy, r) in [(1050, 1660, 190), (950, 1860, 160)]:
        tree(s, cx, cy, r, V[7], V[6])
    return s


if __name__ == '__main__':
    out = sys.argv[1] if len(sys.argv) > 1 else '.'
    os.makedirs(SCRATCH, exist_ok=True)
    pairs = []
    for name, fn in [('A', thumb_A), ('B', thumb_B), ('C', thumb_C)]:
        svgp = fn().save(os.path.join(SCRATCH, 'thumb_%s.svg' % name))
        pairs.append((svgp, os.path.join(out, 'thumb_%s.png' % name)))
    render(pairs)
    print('ok', [p for _, p in pairs])
