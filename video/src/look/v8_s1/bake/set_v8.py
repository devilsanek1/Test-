"""set_v8.py: v8's SET as design (paint_test/v8_card.md): the canal-side street at golden hour from a seated person's
eye height, the Google building's glass wall cut by the left edge with its lit lobby and swinging door, the canal
running to the low sun, the far bank's lit windows, a plaza with a cafe under an autumn tree, a narrowboat on the water.
Every object is FACES in world metres (v8cam), each with its material colour (the colour key at the source: one sunset
family, the glass the one cool field), its normal and its surface kind, grouped into the scene's depth PLANES (each
plane's ground band first, then what stands on it, far to near, so a nearer ground never covers a farther object).
rasterize(plane) gives the flat design the painter repaints (RGB + alpha) and a LABEL map (the face id per pixel) the
light reads (normal, kind, emission). The people are the engine's (her, the cafe, the walkers, Pip): not here.
From video/:  python3 -B src/look/v8_s1/bake/set_v8.py --preview <dir>   (the idea thumbnail: flat + a crude light)"""
from __future__ import annotations

import argparse
import hashlib
import math
import os

import cv2
import numpy as np

from v8cam import CX, CY, F, HC, H, W, SCENE, SUN_DIR, SUN_IMG, proj, size_px

PLANES = ['farcity', 'water', 'far', 'boat', 'mid', 'street', 'building', 'near']
ZNEAR = 0.6
ST = SCENE['street']
WA = SCENE['water']
LOB = SCENE['lobby']
XB = ST['x0']          # the Google facade's plane (X), facing +X
XK = ST['x1']          # our kerb (the canal's edge)
XF = WA['x1']          # the far kerb
YW = WA['y']           # the water's level

# ---------------------------------------------------------------- the colour key (materials, before light)
# one sunset family (gold, peach, coral-rose, lilac); the glass the one cool field (slate violet); no beige, no olive
K = {
    'stone': '#CFA89A', 'stone2': '#C59D90', 'stone3': '#D6B3A3', 'kerb': '#DCC0B0', 'kerbface': '#B48C88',
    'setts': '#BE968C', 'plaza': '#CCA394',
    'iron': '#4A3B4E', 'iron_lit': '#6E5866', 'lantern': '#FFE3B4',
    'glass': '#6F6A90', 'glass_hi': '#8E86AA', 'mullion': '#5C5370', 'slab': '#A6919F', 'fascia': '#C6AFAE',
    'pier': '#B39CA6', 'bronze': '#3B2D37',
    'lobby_wall': '#D9A779', 'lobby_floor': '#E4B78C', 'lobby_ceiling': '#B98A6E', 'lobby_side': '#E2B587',
    'desk': '#8C5E52', 'lamp': '#FFF0D2', 'plant': '#7E6A5A',
    'brick': '#B98274', 'brick2': '#AD7569', 'brick3': '#C38E7A', 'stucco': '#D1A99A', 'slate_b': '#9C8796',
    'roof': '#8E7387', 'win_lit': '#F3D1A2', 'win_dark': '#7C6A82', 'win_mid': '#A68C9C', 'shop': '#F7DDB2',
    'far1': '#C79C95', 'far2': '#BB9092', 'far3': '#D2A99C', 'farwin': '#F0CDA0',
    'tree_a': '#D0703F', 'tree_b': '#E09A4E', 'tree_c': '#B4503F', 'trunk': '#5A4250',
    'umbrella': '#E6C3A8', 'umbrella2': '#C98E86', 'table': '#7A5E66',
    'hull': '#3F3546', 'cabin': '#9C4D55', 'cabin_trim': '#E7D3B8', 'boat_roof': '#5D4B5F', 'boat_win': '#F2CD9C',
    'water': '#B79CB2', 'farcity': '#D5ADA6', 'farcity2': '#CBA2A2', 'haze': '#E2BBA9',
}


def hexrgb(h):
    h = h.lstrip('#')
    return np.array([int(h[i:i + 2], 16) for i in (0, 2, 4)], np.float64) / 255.0


def seeded(*keys):
    return np.random.default_rng(int(hashlib.sha256('/'.join(str(k) for k in ('v8',) + keys).encode()).hexdigest()[:12], 16))


# ---------------------------------------------------------------- faces
class Face:
    """A planar face (world polygon) or a screen-space shape at a depth (`scr`: a billboard facing the camera)."""
    __slots__ = ('pts', 'scr', 'col', 'n', 'kind', 'plane', 'emit', 'z', 'name', 'id', 'extra')

    def __init__(self, plane, kind, col, pts=None, scr=None, n=(0.0, 0.0, -1.0), emit=0.0, z=None, name='', extra=None):
        self.plane, self.kind, self.col = plane, kind, col
        self.pts = None if pts is None else np.asarray(pts, np.float64)
        self.scr = None if scr is None else np.asarray(scr, np.float64)
        self.n = np.asarray(n, np.float64)
        self.emit = emit
        self.name = name
        self.extra = extra or {}
        if z is None:
            z = float(self.pts[:, 2].mean()) if self.pts is not None else 1000.0
        self.z = z
        self.id = -1


def clip_z(pts, zn=ZNEAR):
    out = []
    n = len(pts)
    for i in range(n):
        a, b = pts[i], pts[(i + 1) % n]
        ia, ib = a[2] >= zn, b[2] >= zn
        if ia:
            out.append(a)
        if ia != ib:
            t = (zn - a[2]) / (b[2] - a[2])
            out.append(a + (b - a) * t)
    return np.array(out) if len(out) >= 3 else None


def visible(face):
    if face.pts is None:
        return True
    c = face.pts.mean(0)
    cam = np.array([0.0, HC, 0.0])
    return float(np.dot(face.n, cam - c)) > 1e-6


def quad(plane, kind, col, p0, p1, p2, p3, n, **kw):
    return Face(plane, kind, col, pts=[p0, p1, p2, p3], n=n, **kw)


def box(plane, x0, x1, y0, y1, z0, z1, cols, kind='wall', name='', emit=0.0):
    """The visible faces of an axis box: cols = dict(front, left, right, top) (front faces -Z, toward us)."""
    out = []
    c = cols if isinstance(cols, dict) else {'front': cols, 'left': cols, 'right': cols, 'top': cols}
    fr = [(x0, y0, z0), (x1, y0, z0), (x1, y1, z0), (x0, y1, z0)]
    lf = [(x0, y0, z0), (x0, y0, z1), (x0, y1, z1), (x0, y1, z0)]
    rt = [(x1, y0, z0), (x1, y0, z1), (x1, y1, z1), (x1, y1, z0)]
    tp = [(x0, y1, z0), (x1, y1, z0), (x1, y1, z1), (x0, y1, z1)]
    for key, pts, n in (('front', fr, (0, 0, -1)), ('left', lf, (-1, 0, 0)), ('right', rt, (1, 0, 0)), ('top', tp, (0, 1, 0))):
        f = Face(plane, kind, c.get(key, c.get('front')), pts=pts, n=n, name=f'{name}.{key}', emit=emit)
        if visible(f):
            out.append(f)
    return out


def wall_x(plane, kind, col, x, z0, z1, y0, y1, n_sign, **kw):
    """A rectangle in the plane X = x (n = (+-1, 0, 0))."""
    return Face(plane, kind, col, pts=[(x, y0, z0), (x, y0, z1), (x, y1, z1), (x, y1, z0)], n=(n_sign, 0, 0), **kw)


def wall_z(plane, kind, col, z, x0, x1, y0, y1, **kw):
    return Face(plane, kind, col, pts=[(x0, y0, z), (x1, y0, z), (x1, y1, z), (x0, y1, z)], n=(0, 0, -1), **kw)


def ground(plane, kind, col, x0, x1, z0, z1, y=0.0, **kw):
    return Face(plane, kind, col, pts=[(x0, y, z0), (x1, y, z0), (x1, y, z1), (x0, y, z1)], n=(0, 1, 0), **kw)


def blob(cx, cy, rx, ry, rng, k=9, rough=0.2, n=64):
    """A free closed curve (an organic crown or puff) in screen px."""
    ph = rng.uniform(0, 2 * math.pi, k)
    am = rng.uniform(0, rough, k) / np.arange(1, k + 1) ** 0.6
    t = np.linspace(0, 2 * math.pi, n, endpoint=False)
    r = 1 + sum(am[i] * np.sin((i + 2) * t + ph[i]) for i in range(k))
    return np.stack([cx + rx * r * np.cos(t), cy + ry * r * np.sin(t)], -1)


# ---------------------------------------------------------------- the set, plane by plane
def set_farcity():
    """The city beyond the canal's end, at 0.6-2.5 km: hazed silhouettes close to the sky's horizon colour, one step
    darker; the sun sits just above their line (the far roofs half under it)."""
    r = seeded('farcity')
    faces = []
    # far roofs: a long low band, uneven, from the left of the vanishing point to the right edge
    xs = np.arange(330, 1140, 1.0)
    base = CY + 4
    hgt = np.zeros_like(xs)
    x = 330.0
    while x < 1140:
        w = r.uniform(14, 46)
        h = r.uniform(10, 34) * (1.0 if abs(x - SUN_IMG[0]) > 90 else 0.75)
        m = (xs >= x) & (xs < x + w)
        hgt[m] = h + (r.uniform(4, 9) if r.random() < 0.25 else 0)
        x += w
    top = base - hgt
    poly = np.concatenate([np.stack([xs, top], -1), [[1140, base + 30], [330, base + 30]]])
    faces.append(Face('farcity', 'farcity', K['farcity'], scr=poly, z=1500, name='farroofs'))
    # towers: a few, slim, of unequal height, none on the sun's disc; two flank it
    towers = [(470, 22, 70), (505, 14, 46), (618, 26, 118), (652, 18, 84), (742, 30, 142), (905, 24, 128), (948, 16, 92),
              (1010, 34, 150), (1062, 20, 104)]
    for i, (tx, tw, th) in enumerate(towers):
        top_y = base - th
        sl = r.uniform(-0.04, 0.04)
        poly = np.array([[tx - tw / 2, base + 30], [tx - tw / 2, top_y + 6], [tx - tw / 2 + 3, top_y], [tx + tw / 2 - 2, top_y + sl * tw],
                         [tx + tw / 2, top_y + 5], [tx + tw / 2, base + 30]])
        faces.append(Face('farcity', 'farcity', K['farcity2'] if i % 2 else K['farcity'], scr=poly, z=1400 - i, name=f'tower{i}'))
    return faces


def set_water():
    faces = [ground('water', 'water', K['water'], XK, XF, 1.0, 3000.0, y=YW, name='canal')]
    return faces


def windows_on_x(plane, x, n_sign, z0, z1, y0, y1, nz, ny, rng, p_lit=0.35, inset=0.18, lit_col=None, name='w', fill=0.62):
    """A grid of windows on a wall X = x, each its own state (lit, mid, dark), never a template: sizes and sills vary."""
    out = []
    dz, dy = (z1 - z0) / nz, (y1 - y0) / ny
    for i in range(nz):
        for j in range(ny):
            if rng.random() < 0.07:
                continue
            wz = dz * fill * rng.uniform(0.85, 1.05)
            wy = dy * rng.uniform(0.48, 0.62)
            cz = z0 + dz * (i + 0.5) + rng.uniform(-0.05, 0.05) * dz
            cy = y0 + dy * (j + 0.52)
            u = rng.random()
            col = (lit_col or K['win_lit']) if u < p_lit else (K['win_mid'] if u < p_lit + 0.25 else K['win_dark'])
            emit = 1.0 if u < p_lit else 0.0
            off = 0.02 * n_sign
            out.append(wall_x(plane, 'window', col, x + off, cz - wz / 2, cz + wz / 2, cy - wy / 2, cy + wy / 2, n_sign, emit=emit, name=f'{name}{i}_{j}'))
    return out


def windows_on_z(plane, z, x0, x1, y0, y1, nx, ny, rng, p_lit=0.35, name='w', shop=False):
    out = []
    dx, dy = (x1 - x0) / nx, (y1 - y0) / ny
    for i in range(nx):
        for j in range(ny):
            if rng.random() < 0.06:
                continue
            wx = dx * rng.uniform(0.5, 0.64)
            wy = dy * rng.uniform(0.5, 0.62)
            cx = x0 + dx * (i + 0.5) + rng.uniform(-0.05, 0.05) * dx
            cy = y0 + dy * (j + 0.52)
            u = rng.random()
            lit = u < p_lit or (shop and j == 0)
            col = (K['shop'] if (shop and j == 0) else K['win_lit']) if lit else (K['win_mid'] if u < p_lit + 0.25 else K['win_dark'])
            if shop and j == 0:
                wy = dy * 0.7
                cy = y0 + dy * 0.42
                wx = dx * 0.78
            out.append(wall_z(plane, 'window', col, z - 0.02, cx - wx / 2, cx + wx / 2, cy - wy / 2, cy + wy / 2, emit=1.0 if lit else 0.0, name=f'{name}{i}_{j}'))
    return out


def set_far():
    """Beyond Z ~40: the far kerb and towpath, the far bank LOW (warehouses of two or three storeys, each its own height,
    colour and window state, autumn trees between them), moored boats along the far kerb; on our side, a row of autumn
    trees along the plaza's edge running to the sun and low buildings far down; a small bridge at the canal's end."""
    r = seeded('far')
    faces = []
    faces.append(ground('far', 'ground', K['setts'], XB - 60, XK, 40.0, 3000.0, name='street_far'))
    faces.append(ground('far', 'ground', K['stone2'], XF, XF + 80, 40.0, 3000.0, name='towpath_far'))
    faces.append(wall_x('far', 'kerbface', K['kerbface'], XF, 40.0, 3000.0, YW, 0.0, -1, name='farkerb'))
    # the far bank's row: low, broken, trees in the gaps
    z = 64.0
    k = 0
    cols = [K['brick'], K['far3'], K['brick2'], K['stucco'], K['far1'], K['brick3'], K['slate_b'], K['far2']]
    while z < 700:
        wz = r.uniform(14, 34)
        hh = r.uniform(6.5, 10.5)
        x0 = XF + 4.0 + (r.uniform(0, 2.5) if r.random() < 0.4 else 0)
        col = cols[k % len(cols)]
        faces += box('far', x0, x0 + 16, 0.0, hh, z, z + wz, {'front': col, 'left': col, 'top': K['roof']}, name=f'fb{k}')
        faces += windows_on_x('far', x0, -1, z + 0.8, z + wz - 0.8, 0.6, hh - 0.6, max(2, int(wz / 3.4)), max(1, int(hh / 3.3)), r, p_lit=0.45, name=f'fbw{k}')
        gap = r.uniform(6, 16) if r.random() < 0.5 else r.uniform(0.0, 0.8)
        if gap > 5:
            faces += tree('far', XF + 2.2, z + wz + gap / 2, r.uniform(7, 10), r.uniform(5, 7), r, [K['tree_b'], K['tree_a'], K['tree_c']], f'ft{k}')
        z += wz + gap
        k += 1
    for zt in (48.0, 57.0):
        faces += tree('far', XF + 2.0, zt, r.uniform(8, 10), r.uniform(5.5, 7), r, [K['tree_a'], K['tree_b'], K['tree_c']], f'ftn{zt:.0f}')
    # moored narrowboats along the far kerb
    for i, (z0, ln) in enumerate([(52.0, 18.0), (74.0, 17.0), (104.0, 18.0)]):
        faces += box('far', XF - 2.1, XF - 0.15, YW, YW + 0.55, z0, z0 + ln, {'front': K['hull'], 'left': K['hull'], 'top': K['hull']}, name=f'mb{i}h')
        cc = [K['cabin'], K['slate_b'], K['brick3']][i]
        faces += box('far', XF - 1.95, XF - 0.3, YW + 0.55, YW + 1.6, z0 + 1.5, z0 + ln - 2.0, {'front': cc, 'left': cc, 'top': K['boat_roof']}, name=f'mb{i}c')
        for j in range(int((ln - 4) / 2.4)):
            zz = z0 + 2.4 + j * 2.4
            lit = r.random() < 0.6
            faces.append(wall_x('far', 'window', K['boat_win'] if lit else K['win_dark'], XF - 1.97, zz, zz + 0.9, YW + 0.95, YW + 1.3, -1, emit=1.0 if lit else 0.0, name=f'mb{i}w{j}'))
    # our side, far down: a row of autumn trees along the plaza's edge, then low buildings
    for i, zt in enumerate((44.0, 58.0, 76.0, 100.0, 132.0, 175.0)):
        faces += tree('far', XB - 1.6 - (i % 2) * 0.8, zt, r.uniform(8.5, 10.5), r.uniform(5.5, 7.5), r, [K['tree_a'], K['tree_c'], K['tree_b']], f'rt{i}')
    z = 150.0
    k = 0
    while z < 700:
        wz = r.uniform(18, 36)
        hh = r.uniform(8, 13)
        col = [K['brick3'], K['stucco'], K['brick'], K['far1']][k % 4]
        faces += box('far', XB - 22, XB - 6, 0.0, hh, z, z + wz, {'front': col, 'right': col, 'top': K['roof']}, name=f'sr{k}')
        faces += windows_on_x('far', XB - 6, 1, z + 0.6, z + wz - 0.6, 0.4, hh - 0.5, max(2, int(wz / 3.0)), max(1, int(hh / 3.2)), r, p_lit=0.3, name=f'srw{k}')
        z += wz + r.uniform(0.0, 4.0)
        k += 1
    # the bridge at the canal's end: a shallow arch over the water, its deck a rose stone band
    zb = 420.0
    faces.append(Face('far', 'wall', K['far3'], pts=[(XB - 8, YW, zb), (XF + 10, YW, zb), (XF + 10, 4.6, zb), (XB - 8, 4.6, zb)], n=(0, 0, -1), name='bridge'))
    arch = []
    for t in np.linspace(0, math.pi, 28):
        arch.append((XK + 1.0 + (XF - XK - 2.0) * (1 - math.cos(t)) / 2, YW + 3.4 * math.sin(t), zb - 0.05))
    faces.append(Face('far', 'archhole', '#B795AA', pts=arch, n=(0, 0, -1), name='arch'))
    faces.append(Face('far', 'wall', K['stone3'], pts=[(XB - 8, 4.1, zb - 0.1), (XF + 10, 4.1, zb - 0.1), (XF + 10, 4.9, zb - 0.1), (XB - 8, 4.9, zb - 0.1)], n=(0, 0, -1), name='parapet'))
    return faces


def set_boat():
    """The narrowboat chugging toward the sun on the canal's middle: a long dark hull, a rose-red cabin with cream trim
    and lit portholes, its roof, a chimney (its smoke the engine's)."""
    faces = []
    x0, x1, z0, z1 = 9.0, 11.05, 31.0, 49.0
    faces += box('boat', x0, x1, YW - 0.05, YW + 0.62, z0, z1, {'front': K['hull'], 'left': K['hull'], 'top': K['hull']}, name='bh')
    faces.append(Face('boat', 'wall', K['hull'], pts=[(x0, YW - 0.05, z0), ((x0 + x1) / 2, YW - 0.05, z0 - 1.6), ((x0 + x1) / 2, YW + 0.62, z0 - 1.6), (x0, YW + 0.62, z0)], n=(-0.7, 0, -0.7), name='bow'))
    faces += box('boat', x0 + 0.18, x1 - 0.18, YW + 0.62, YW + 1.68, z0 + 2.2, z1 - 3.0, {'front': K['cabin'], 'left': K['cabin'], 'top': K['boat_roof']}, name='bc')
    faces.append(wall_x('boat', 'trim', K['cabin_trim'], x0 + 0.16, z0 + 2.2, z1 - 3.0, YW + 1.5, YW + 1.6, -1, name='btrim'))
    for j in range(5):
        zz = z0 + 3.6 + j * 2.6
        faces.append(wall_x('boat', 'window', K['boat_win'], x0 + 0.15, zz, zz + 0.55, YW + 1.0, YW + 1.32, -1, emit=1.0, name=f'bw{j}'))
    faces += box('boat', x0 + 0.9, x0 + 1.12, YW + 1.68, YW + 2.25, z1 - 6.0, z1 - 5.8, {'front': K['iron'], 'left': K['iron'], 'top': K['iron']}, name='chimney')
    return faces


def tree(plane, X, Z, height, width, rng, cols, name):
    """An autumn tree as a billboard at its depth: a trunk and a crown of 3-5 overlapping free masses."""
    faces = []
    base = proj([X, 0.0, Z])
    top = proj([X, height, Z])
    s = size_px(1.0, Z)
    cw = width * s
    ch = (height * 0.62) * s
    ccx, ccy = base[0], top[1] + ch * 0.5
    tw = 0.28 * s
    trunk = np.array([[base[0] - tw * 0.6, base[1]], [base[0] - tw * 0.4, ccy + ch * 0.1], [base[0] + tw * 0.4, ccy + ch * 0.1], [base[0] + tw * 0.65, base[1]]])
    faces.append(Face(plane, 'trunk', K['trunk'], scr=trunk, z=Z + 0.01, name=f'{name}.trunk'))
    masses = rng.integers(3, 6)
    for m in range(masses):
        ox = rng.uniform(-0.28, 0.28) * cw
        oy = rng.uniform(-0.22, 0.25) * ch
        rx = cw * rng.uniform(0.3, 0.46)
        ry = ch * rng.uniform(0.3, 0.44)
        poly = blob(ccx + ox, ccy + oy, rx, ry, rng, rough=0.22)
        faces.append(Face(plane, 'crown', cols[m % len(cols)], scr=poly, z=Z - 0.01 * m, name=f'{name}.crown{m}', extra={'c': (ccx, ccy), 'r': (cw / 2, ch / 2)}))
    return faces


def set_mid():
    """Z 9-40: the plaza beyond the building's corner (its floor, an autumn tree over the cafe's umbrellas and tables),
    the street's middle band, our kerb's far stretch, a few small bollards along it."""
    r = seeded('mid')
    faces = []
    zc = LOB['corner']
    faces.append(ground('mid', 'ground', K['plaza'], XB - 60, XB, zc, 40.0, name='plaza'))
    faces.append(ground('mid', 'ground', K['stone'], XB, XK - 0.4, 10.0, 40.0, name='street_mid'))
    faces.append(ground('mid', 'kerb', K['kerb'], XK - 0.4, XK, 10.0, 40.0, name='kerb_mid'))
    faces += tree('mid', XB - 3.2, 27.0, 9.0, 6.6, r, [K['tree_a'], K['tree_b'], K['tree_c'], K['tree_a']], 'tree1')
    for i, (X, Z, col) in enumerate([(XB - 0.7, 14.0, K['umbrella']), (XB - 2.6, 17.0, K['umbrella2']), (XB - 0.9, 21.5, K['umbrella'])]):
        c = proj([X, 2.35, Z])
        s = size_px(1.0, Z)
        rw = 1.2 * s
        poly = np.array([[c[0] - rw, c[1] + 0.32 * s], [c[0] - rw * 0.15, c[1] - 0.12 * s], [c[0] + rw * 0.15, c[1] - 0.12 * s], [c[0] + rw, c[1] + 0.32 * s],
                         [c[0] + rw * 0.55, c[1] + 0.4 * s], [c[0] - rw * 0.55, c[1] + 0.4 * s]])
        faces.append(Face('mid', 'canopy', col, scr=poly, z=Z, name=f'umb{i}'))
        pole = proj([X, 0.0, Z])
        faces.append(Face('mid', 'iron', K['iron'], scr=np.array([[pole[0] - 0.03 * s, pole[1]], [c[0] - 0.03 * s, c[1]], [c[0] + 0.03 * s, c[1]], [pole[0] + 0.03 * s, pole[1]]]), z=Z + 0.02, name=f'pole{i}'))
        t = proj([X, 0.74, Z])
        faces.append(Face('mid', 'table', K['table'], scr=np.array([[t[0] - 0.45 * s, t[1]], [t[0] + 0.45 * s, t[1]], [t[0] + 0.4 * s, t[1] + 0.06 * s], [t[0] - 0.4 * s, t[1] + 0.06 * s]]), z=Z - 0.3, name=f'table{i}'))
    for zz in (16.0, 24.0, 32.0):
        faces += box('mid', XK - 0.36, XK - 0.18, 0.0, 0.7, zz, zz + 0.2, {'front': K['iron'], 'left': K['iron'], 'top': K['iron_lit']}, kind='iron', name=f'bol{zz}')
    return faces


def lamp_post(plane, X, Z, name):
    faces = []
    faces += box(plane, X - 0.07, X + 0.07, 0.0, 3.9, Z, Z + 0.14, {'front': K['iron'], 'left': K['iron'], 'top': K['iron']}, kind='iron', name=f'{name}.post')
    faces += box(plane, X - 0.2, X + 0.2, 3.9, 4.45, Z - 0.13, Z + 0.27, {'front': K['lantern'], 'left': K['lantern'], 'top': K['iron']}, kind='lamp', name=f'{name}.lantern', emit=0.7)
    faces += box(plane, X - 0.26, X + 0.26, 4.45, 4.55, Z - 0.19, Z + 0.33, {'front': K['iron'], 'left': K['iron'], 'top': K['iron']}, kind='iron', name=f'{name}.cap')
    return faces


def set_street():
    """Z 0.6-10: the near street in front of the building (large stone flags) and our kerb (the canal's edge)."""
    faces = []
    faces.append(ground('street', 'ground', K['stone'], XB, XK - 0.4, ZNEAR, 10.0, name='street'))
    faces.append(ground('street', 'kerb', K['kerb'], XK - 0.4, XK, ZNEAR, 10.0, name='kerb'))
    return faces


def set_building():
    """The Google building: its east wall in the plane X = XB, cut by the left edge and turning its corner at
    LOB['corner']; the double-height lobby (lit, warm: the office she leaves) behind glass, the door of two glass leaves,
    the near one swung open; a stone fascia; above, the curtain wall in its own cool shade (slate-violet glass, slab
    bands, mullions), a few panes lit by the office inside."""
    r = seeded('building')
    faces = []
    z0, z1, top = LOB['z0'], LOB['z1'], LOB['top']
    zc = LOB['corner']
    dz0, dz1 = LOB['door']
    dh = LOB['door_h']
    xi = XB - 9.0                      # the lobby's back wall
    # the interior (drawn first: seen through the glass)
    faces.append(wall_x('building', 'lobby', K['lobby_wall'], xi, z0 - 3, z1 + 2, 0.0, top + 0.6, 1, emit=0.85, name='lobby_back'))
    faces.append(ground('building', 'lobby', K['lobby_floor'], xi, XB, z0 - 3, z1, emit=0.6, name='lobby_floor'))
    faces.append(Face('building', 'lobby', K['lobby_ceiling'], pts=[(xi, top, z0 - 3), (XB, top, z0 - 3), (XB, top, z1), (xi, top, z1)], n=(0, -1, 0), emit=0.7, name='lobby_ceiling'))
    faces.append(wall_z('building', 'lobby', K['lobby_side'], z1, xi, XB, 0.0, top, emit=0.75, name='lobby_side'))
    faces += box('building', XB - 6.4, XB - 4.6, 0.0, 1.1, 6.6, 8.4, {'front': K['desk'], 'right': K['desk'], 'top': '#B07E6A'}, kind='lobby', name='desk')
    for i, zz in enumerate(np.arange(z0 - 1.6, z1, 1.45)):
        for xx in (XB - 2.2, XB - 5.6):
            faces += box('building', xx - 0.22, xx + 0.22, top - 0.55, top - 0.35, zz - 0.22, zz + 0.22, {'front': K['lamp'], 'right': K['lamp'], 'top': K['lamp']}, kind='lamp', name=f'pend{i}_{xx:.0f}', emit=1.0)
    pc = proj([XB - 1.3, 0.0, 8.2])
    s = size_px(1.0, 8.2)
    faces.append(Face('building', 'plant', K['plant'], scr=blob(pc[0], pc[1] - 1.3 * s, 0.55 * s, 0.9 * s, seeded('plant'), rough=0.3), z=8.2, name='plant'))
    # the lobby's glass: panes with slim bronze mullions and a transom at the door's head; the DOOR is an open sliding
    # door: a gap in the glass (no film), so the warm lobby shows through it brightest, its light pouring out
    zs = list(np.arange(z0 - 3, z1 - 0.3, 0.92)) + [z1]
    for za, zb in zip(zs[:-1], zs[1:]):
        if zb <= dz0 + 0.05 or za >= dz1 - 0.05:
            faces.append(wall_x('building', 'lobbyglass', K['glass_hi'], XB, za, zb, 0.0, top, 1, name=f'lg{za:.1f}', extra={'alpha': 0.2}))
        else:
            # over the door gap: glass only above the door's head
            faces.append(wall_x('building', 'lobbyglass', K['glass_hi'], XB, za, zb, dh + 0.1, top, 1, name=f'lgd{za:.1f}', extra={'alpha': 0.2}))
            if za < dz0:
                faces.append(wall_x('building', 'lobbyglass', K['glass_hi'], XB, za, dz0, 0.0, dh + 0.1, 1, name=f'lgl{za:.1f}', extra={'alpha': 0.2}))
            if zb > dz1:
                faces.append(wall_x('building', 'lobbyglass', K['glass_hi'], XB, dz1, zb, 0.0, dh + 0.1, 1, name=f'lgr{za:.1f}', extra={'alpha': 0.2}))
    for zz in zs:
        if dz0 - 0.15 < zz < dz1 + 0.15:
            continue
        faces.append(wall_x('building', 'mullion', K['bronze'], XB + 0.01, zz - 0.035, zz + 0.035, 0.0, top, 1, name=f'mul{zz:.1f}'))
    faces.append(wall_x('building', 'mullion', K['bronze'], XB + 0.01, z0 - 3, z1, top - 0.07, top, 1, name='transom_top'))
    faces.append(wall_x('building', 'mullion', K['bronze'], XB + 0.01, z0 - 3, z1, dh + 0.04, dh + 0.12, 1, name='transom'))
    faces.append(wall_x('building', 'mullion', K['bronze'], XB + 0.01, z0 - 3, z1, 0.0, 0.08, 1, name='sill'))
    # the door's jambs (the sliding leaves parked behind the glass beside the gap: a darker pane each side)
    faces.append(wall_x('building', 'mullion', K['bronze'], XB + 0.012, dz0 - 0.1, dz0, 0.0, dh + 0.12, 1, name='door_jamb0'))
    faces.append(wall_x('building', 'mullion', K['bronze'], XB + 0.012, dz1, dz1 + 0.1, 0.0, dh + 0.12, 1, name='door_jamb1'))
    # the warm lobby inside: wood slats on its end wall, a glowing ceiling cove, the floor polished
    for i, xx in enumerate(np.arange(xi + 0.2, XB - 0.2, 0.34)):
        faces.append(wall_z('building', 'lobby', '#B97E58' if i % 2 else '#C98F62', z1 - 0.02, xx, xx + 0.17, 0.25, top - 0.45, emit=0.75, name=f'slat{i}'))
    faces.append(wall_z('building', 'lamp', '#FFE9C4', z1 - 0.03, xi, XB, top - 0.42, top - 0.3, emit=1.0, name='cove'))

    # the fascia over the lobby, the piers, and the curtain wall above in its cool shade
    faces.append(wall_x('building', 'fascia', K['fascia'], XB, 1.0, zc, top, top + 0.95, 1, name='fascia'))
    faces.append(wall_x('building', 'pier', K['pier'], XB + 0.03, z1, zc, 0.0, 40.0, 1, name='corner_pier'))
    faces.append(Face('building', 'pier', K['pier'], pts=[(XB, 0.0, zc), (XB - 0.3, 0.0, zc), (XB - 0.3, 40.0, zc), (XB, 40.0, zc)], n=(0, 0, -1), name='corner_side'))
    y = top + 0.95
    fl = 0
    while y < 40:
        yh = y + 3.9
        faces.append(wall_x('building', 'glass', K['glass'], XB, 1.0, z1, y + 0.42, yh, 1, name=f'glass{fl}'))
        faces.append(wall_x('building', 'slab', K['slab'], XB + 0.02, 1.0, z1, y, y + 0.42, 1, name=f'slab{fl}'))
        for i, zz in enumerate(np.arange(1.0, z1, 1.4)):
            u = r.random()
            if u < 0.12:
                faces.append(wall_x('building', 'officewin', '#E7D9C6', XB + 0.01, zz + 0.08, zz + 1.32, y + 0.55, yh - 0.12, 1, emit=0.55, name=f'ow{fl}_{i}'))
            elif u < 0.3:
                faces.append(wall_x('building', 'glass', K['glass_hi'], XB + 0.01, zz + 0.08, zz + 1.32, y + 0.55, y + 0.55 + (yh - y - 0.7) * r.uniform(0.3, 0.8), 1, name=f'blind{fl}_{i}'))
            faces.append(wall_x('building', 'mullion', K['mullion'], XB + 0.02, zz - 0.04, zz + 0.04, y + 0.42, yh, 1, name=f'm{fl}_{i}'))
        y = yh
        fl += 1
    return faces


def set_near():
    return []


def build():
    sets = {'farcity': set_farcity(), 'water': set_water(), 'far': set_far(), 'boat': set_boat(), 'mid': set_mid(),
            'street': set_street(), 'building': set_building(), 'near': set_near()}
    table = []
    for p in PLANES:
        for f in sets[p]:
            f.id = len(table) + 1
            table.append(f)
    return sets, table


# ---------------------------------------------------------------- raster
def screen_poly(f):
    if f.scr is not None:
        return f.scr
    pts = clip_z(f.pts)
    if pts is None:
        return None
    return proj(pts)


def cover(poly, h=H, w=W, pad=2):
    """Anti-aliased coverage of a screen polygon (1/4 px vertices) on its bounding box: (mask, x0, y0)."""
    x0 = int(max(0, math.floor(poly[:, 0].min()) - pad))
    y0 = int(max(0, math.floor(poly[:, 1].min()) - pad))
    x1 = int(min(w, math.ceil(poly[:, 0].max()) + pad))
    y1 = int(min(h, math.ceil(poly[:, 1].max()) + pad))
    if x1 <= x0 or y1 <= y0:
        return None, 0, 0
    m = np.zeros((y1 - y0, x1 - x0), np.uint8)
    q = np.round((poly - [x0, y0]) * 4).astype(np.int32)
    cv2.fillPoly(m, [q], 255, cv2.LINE_AA, shift=2)
    return m.astype(np.float32) / 255.0, x0, y0


def rasterize(faces, h=H, w=W, film_out=None):
    """One plane's flat design: rgb (straight), alpha, label (face id at > 50 % coverage, 0 = none). A see-through face
    (glass: extra alpha < 1) never takes the label (what is behind it keeps it); its coverage goes to `film_out`."""
    rgb = np.zeros((h, w, 3), np.float32)
    a = np.zeros((h, w), np.float32)
    lab = np.zeros((h, w), np.int32)
    for f in sorted(faces, key=lambda f: -f.z):
        poly = screen_poly(f)
        if poly is None:
            continue
        m, x0, y0 = cover(poly)
        if m is None:
            continue
        hh, ww = m.shape
        sl = (slice(y0, y0 + hh), slice(x0, x0 + ww))
        if film_out is not None and f.extra.get('alpha', 1.0) < 0.99:
            film_out[sl] = np.maximum(film_out[sl], m)
        m = m * float(f.extra.get('alpha', 1.0))
        c = hexrgb(f.col).astype(np.float32)
        aa = a[sl]
        na = m + aa * (1 - m)
        rgb[sl] = np.where(na[..., None] > 1e-6, (c * m[..., None] + rgb[sl] * (aa * (1 - m))[..., None]) / np.maximum(na[..., None], 1e-6), rgb[sl])
        a[sl] = na
        if f.extra.get('alpha', 1.0) >= 0.99:
            lab[sl] = np.where(m > 0.5, f.id, lab[sl])
        else:
            lab[sl] = np.where((m > 0.05) & (lab[sl] == 0), f.id, lab[sl])
        if film_out is not None and f.extra.get('alpha', 1.0) >= 0.99 and f.z < 1e9:
            # an opaque face in front of the glass (a mullion, the jambs) clears the film there
            if f.kind in ('mullion', 'pier', 'fascia', 'slab'):
                film_out[sl] = film_out[sl] * (1 - m)
    return rgb, a, lab


# ---------------------------------------------------------------- the idea thumbnail (a crude light, a stand-in her)
def sky_design(h=H, w=W):
    yy = np.arange(h, dtype=np.float32)[:, None]
    stops = [(0, '#A99BC8'), (300, '#C9AECB'), (600, '#E2B6B8'), (850, '#F2C3A6'), (1000, '#FAD8AE'), (1150, '#FFE6C2')]
    out = np.zeros((h, w, 3), np.float32)
    for (y0, c0), (y1, c1) in zip(stops[:-1], stops[1:]):
        t = np.clip((yy - y0) / (y1 - y0), 0, 1)
        m = (yy >= y0) & (yy <= y1)
        col = hexrgb(c0) * (1 - t[..., None]) + hexrgb(c1) * t[..., None]
        out = np.where(m[..., None], np.broadcast_to(col, (h, w, 3)), out)
    out[1150:] = hexrgb('#FFE6C2')
    xx = np.arange(w, dtype=np.float32)[None, :]
    d = np.hypot(xx - SUN_IMG[0], yy - SUN_IMG[1])
    glow = np.exp(-(d / 260.0) ** 2)[..., None]
    out = out * (1 - 0.5 * glow) + hexrgb('#FFF1D6') * 0.5 * glow
    out[d < SUN_IMG[1] * 0 + 21] = hexrgb('#FFF6E4')
    return out


def preview(out_dir):
    os.makedirs(out_dir, exist_ok=True)
    sets, table = build()
    img = sky_design()
    for p in PLANES:
        rgb, a, lab = rasterize(sets[p])
        # crude light: faces toward the sun warm, the rest in a rose-violet shade; emitters as they are
        lit = rgb.copy()
        for f in sets[p]:
            m = lab == f.id
            if not m.any():
                continue
            if f.emit > 0:
                continue
            nl = float(np.dot(f.n, SUN_DIR))
            if f.kind in ('ground', 'kerb'):
                lit[m] = lit[m] * np.array([1.02, 0.94, 0.86])
            elif nl > 0.05:
                lit[m] = lit[m] * np.array([1.08, 0.98, 0.86])
            else:
                lit[m] = lit[m] * np.array([0.78, 0.72, 0.86])
        img = lit * a[..., None] + img * (1 - a[..., None])
    # her stand-in: a dark coat silhouette with a pale column, at her feet and height
    from v8cam import her_screen
    (fx, fy), hp = her_screen()
    sil = np.zeros((H, W), np.uint8)
    body = np.array([[fx - 0.13 * hp, fy], [fx - 0.2 * hp, fy - 0.45 * hp], [fx - 0.12 * hp, fy - 0.8 * hp], [fx + 0.06 * hp, fy - 0.82 * hp],
                     [fx + 0.12 * hp, fy - 0.45 * hp], [fx + 0.16 * hp, fy]])
    cv2.fillPoly(sil, [np.round(body * 4).astype(np.int32)], 255, cv2.LINE_AA, shift=2)
    cv2.ellipse(sil, (int(fx), int(fy - 0.9 * hp)), (int(0.07 * hp), int(0.09 * hp)), 0, 0, 360, 255, -1, cv2.LINE_AA)
    m = sil.astype(np.float32)[..., None] / 255
    img = img * (1 - m) + hexrgb('#3A2E36') * m
    img8 = (np.clip(img, 0, 1) * 255 + 0.5).astype(np.uint8)
    cv2.imwrite(os.path.join(out_dir, 'thumb_full.png'), img8[..., ::-1])
    ph = cv2.resize(img8, (390, 693), interpolation=cv2.INTER_AREA)
    cv2.imwrite(os.path.join(out_dir, 'thumb_phone.png'), ph[..., ::-1])
    gray = cv2.cvtColor(img8, cv2.COLOR_RGB2GRAY)
    small = cv2.resize(gray, (90, 160), interpolation=cv2.INTER_AREA)
    q = np.digitize(small, [95, 170]) * 120 + 15
    cv2.imwrite(os.path.join(out_dir, 'thumb_notan.png'), cv2.resize(q.astype(np.uint8), (390, 693), interpolation=cv2.INTER_NEAREST))
    print('faces', len(table), 'sun', SUN_IMG)


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('--preview', default='')
    a = ap.parse_args()
    if a.preview:
        preview(a.preview)
