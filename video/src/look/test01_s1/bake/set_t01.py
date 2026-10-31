"""set_t01.py: the SET of the hero frame as design (docs/tests/process_test_01_amsterdam/CARD.md). A Jordaan canal at
blue hour seen from a small boat low on the water: the humped brick bridge (a stone-headed arch, brick spandrels, a
stone coping, the dark green iron railing, an Amsterdam lamp, bikes chained along it), the canal running on beyond it
(narrow gabled houses on both quays, young elms, moored sloops, a smaller bridge, a church tower in the haze), a
houseboat at the right quay, the old elms on the near quays at the edges, our own bow at the bottom; and below the
waterline the street's PAPER TWIN, the same street mirrored and made of old paper: ledgers spine-out for the arch
stones, long written sheets in courses for the bridge's face, houses of stacked letters and ledger pages.
Every object is FACES in world metres (t01cam), each with its material colour (the colour key at the source, before
light), its normal and its surface kind, grouped in depth PLANES. rasterize(faces) gives a plane's flat design (RGB +
alpha) and a LABEL map (face id per pixel) that the painter and the light read. Her is the engine's (her_t01.tsx).
From video/:  python3 -B src/look/test01_s1/bake/set_t01.py --preview <dir>   (flat + a crude light, at phone size)"""
from __future__ import annotations

import argparse
import hashlib
import math
import os

import cv2
import numpy as np

from t01cam import BR, CN, CX, CY, F, H, HC, SCENE, W, deck_y, intrados_y, proj

#: the planes far to near (the sky is the painter's). The TWIN is everything mirrored in the water, seen THROUGH the
#: water's surface; the real street stands on it. So: twin, water, then the real planes far to near.
PLANES = ['twin', 'water', 'far', 'bridge', 'boat', 'rail', 'glow', 'trees', 'near']
ZNEAR = 0.4
ZF, ZB = BR['zf'], BR['zb']
QY = CN['quay_y']
XW = CN['water_x']
XF = CN['facade_x']
SPAN2 = BR['span'] / 2

# ---------------------------------------------------------------- the colour key (materials, before light)
# One dusk: everything is designed in its material colour; the light bake pushes it into the blue hour. The paper twin
# is cream, ivory, sepia and umber; the one hot accent (candle gold) belongs to the light, never to a material.
K = {
    # the bridge
    'brick': '#9B5B4B', 'brick2': '#8C5044', 'brick3': '#A86A57', 'stone': '#B4ABA0', 'stone2': '#A69C90',
    'coping': '#B4AAA0', 'vault': '#7F4C42', 'iron': '#243231', 'lamp_post': '#1E2A29', 'lantern': '#FFE3AE',
    'bike': '#2A2F33', 'bike2': '#3A3034', 'bike_red': '#7E3B36',
    # the far street
    'h_brick': '#8E4F43', 'h_brown': '#5B3B34', 'h_char': '#3B3B44', 'h_green': '#304B44', 'h_cream': '#D5C6AF',
    'h_ochre': '#A5634B', 'h_plum': '#5E3C47', 'h_grey': '#6E6A70', 'frame': '#E6DFD2', 'glass': '#2B2F3E',
    'glass_mid': '#4A4A5E', 'win_lit': '#FFD9A2', 'win_warm': '#F5C68A', 'roof': '#45434F', 'roof2': '#3B3A47',
    'beam': '#2C2A30', 'stone_t': '#D9D2C6', 'h_ox': '#6B3133', 'door': '#2A2A31', 'quay': '#7C5A50', 'quay_top': '#8F7A70', 'tower': '#5A5466', 'tower_lit': '#6D6577',
    'elm': '#2D4743', 'elm2': '#36524B', 'elm3': '#26403C', 'elm_y': '#D9A646', 'elm_y2': '#C98B3C',
    'trunk': '#2E2A2E', 'sloop': '#30383A', 'sloop2': '#5A4038', 'cover': '#3C4A55',
    # the houseboat and our boat
    'hull': '#28363A', 'cabin': '#33423B', 'cabin2': '#4E3E37', 'cabin_trim': '#D8D0C2', 'boat_roof': '#3A3C46',
    'pot': '#A35A3E', 'pot2': '#8C4A36', 'plant': '#2E4A40', 'plant2': '#3D5A48', 'boat_win': '#FFD29A',
    'bow': '#2E2420', 'bow_rim': '#6A4A36', 'bow_wood': '#3A2C26',
    # the water and the paper twin
    'water': '#1D2236',
    'paper': '#E9DBBB', 'paper2': '#F1E6CC', 'paper3': '#DCC8A2', 'sepia': '#C9AA7C', 'sepia2': '#B8956A',
    'umber': '#8C6C4C', 'leather': '#7B4B34', 'leather2': '#6A3F2E', 'leather3': '#8E5A3C', 'vellum': '#E5D4AE',
    'letter': '#D6C29C', 'ink_page': '#BFA27A',
}


def hexrgb(h):
    h = h.lstrip('#')
    return np.array([int(h[i:i + 2], 16) for i in (0, 2, 4)], np.float64) / 255.0


def seeded(*keys):
    return np.random.default_rng(int(hashlib.sha256('/'.join(str(k) for k in ('t01',) + keys).encode()).hexdigest()[:12], 16))


# ---------------------------------------------------------------- faces
class Face:
    """A planar face (world polygon) or a screen-space shape at a depth (`scr`: a billboard facing the camera).
    `twin` marks the paper twin (under the water); `extra` carries what the painter and the light need (alpha, a
    sheet's writing, a page's lantern weight)."""
    __slots__ = ('pts', 'scr', 'col', 'n', 'kind', 'plane', 'emit', 'z', 'name', 'id', 'extra', 'twin')

    def __init__(self, plane, kind, col, pts=None, scr=None, n=(0.0, 0.0, -1.0), emit=0.0, z=None, name='', extra=None, twin=False):
        self.plane, self.kind, self.col = plane, kind, col
        self.pts = None if pts is None else np.asarray(pts, np.float64)
        self.scr = None if scr is None else np.asarray(scr, np.float64)
        self.n = np.asarray(n, np.float64)
        self.emit = emit
        self.name = name
        self.extra = extra or {}
        self.twin = twin
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


def mirror(f: Face, plane='twin', col=None, kind=None, extra=None) -> Face:
    """The face's twin: mirrored in the water (Y -> -Y), its normal flipped in Y; a new material."""
    pts = None if f.pts is None else f.pts * np.array([1.0, -1.0, 1.0])
    scr = None
    if f.scr is not None:
        # a billboard: mirror about the waterline at its depth
        yw = CY + F * HC / f.z
        scr = f.scr.copy()
        scr[:, 1] = 2 * yw - scr[:, 1]
    n = f.n * np.array([1.0, -1.0, 1.0])
    return Face(plane, kind or ('t_' + f.kind), col or f.col, pts=pts, scr=scr, n=n, z=f.z, name='twin.' + f.name, extra=extra or {}, twin=True)


def wall_z(plane, kind, col, z, poly_xy, **kw):
    """A polygon in the plane Z = z (facing us), given in (X, Y)."""
    pts = [(x, y, z) for (x, y) in poly_xy]
    return Face(plane, kind, col, pts=pts, n=(0, 0, -1), **kw)


def wall_x(plane, kind, col, x, poly_zy, n_sign, **kw):
    """A polygon in the plane X = x, given in (Z, Y); n = (n_sign, 0, 0)."""
    pts = [(x, y, z) for (z, y) in poly_zy]
    return Face(plane, kind, col, pts=pts, n=(n_sign, 0, 0), **kw)


def ground(plane, kind, col, x0, x1, z0, z1, y=0.0, **kw):
    return Face(plane, kind, col, pts=[(x0, y, z0), (x1, y, z0), (x1, y, z1), (x0, y, z1)], n=(0, 1, 0), **kw)


def blob(cx, cy, rx, ry, rng, k=9, rough=0.2, n=72):
    """A free closed curve (an organic crown or puff) in screen px."""
    ph = rng.uniform(0, 2 * math.pi, k)
    am = rng.uniform(0, rough, k) / np.arange(1, k + 1) ** 0.6
    t = np.linspace(0, 2 * math.pi, n, endpoint=False)
    r = 1 + sum(am[i] * np.sin((i + 2) * t + ph[i]) for i in range(k))
    return np.stack([cx + rx * r * np.cos(t), cy + ry * r * np.sin(t)], -1)


def mix_hex(a, b, t):
    ca, cb = hexrgb(a), hexrgb(b)
    c = ca * (1 - t) + cb * t
    return '#' + ''.join(f'{int(round(v * 255)):02X}' for v in np.clip(c, 0, 1))


def jitter_hex(h, rng, dv=0.05, dh=0.02):
    c = hexrgb(h)
    v = 1 + rng.uniform(-dv, dv)
    c = c * v + rng.uniform(-dh, dh, 3)
    return '#' + ''.join(f'{int(round(x * 255)):02X}' for x in np.clip(c, 0, 1))


# ---------------------------------------------------------------- the far street (beyond the bridge)
# Amsterdam's own gables (from photos of the Jordaan's canals: Bloemgracht, Egelantiersgracht, Prinsengracht): narrow
# brick houses of four or five storeys, shoulder to shoulder, each crowned by its gable: the STEP gable (stepped edges up
# to a small top), the NECK gable (a tall central neck with curved shoulder pieces, a small pediment on top), the BELL
# gable (a bell's outline with a rounded top), the SPOUT gable (a plain point) and the flat CORNICE of the 18th century
# (a horizontal entablature with a raised centre). The gables' edges and the cornices are pale sandstone (a material,
# never a drawn line); the window frames white; a hoist beam under the apex.
GABLES = ['neck', 'step', 'cornice', 'bell', 'neck', 'spout', 'cornice', 'step', 'bell', 'neck', 'cornice']


def gable_outline(kind, w, rng):
    """The top outline above the eave in facade-local (u across 0..w, v up from the eave), left to right, starting at
    (0, 0) and ending at (w, 0). Heights in metres, proportioned as the real gables (a neck about 0.55 w tall over a
    neck 0.4 w wide; a step gable about 0.6 w; a bell about 0.55 w)."""
    if kind == 'step':
        n = 3
        top = 0.64 * w
        tw = 0.84
        sw = (w / 2 - tw / 2) / n
        sh = (top - 0.25) / (n + 0.55)
        left = []
        u, v = 0.0, 0.0
        for i in range(n):
            v += sh
            left.append((u, v))
            u += sw
            left.append((u, v))
        left.append((u, top))
        right = [(w - uu, vv) for (uu, vv) in reversed(left)]
        return [(0.0, 0.0)] + left + [(w / 2 - 0.18, top + 0.18), (w / 2 + 0.18, top + 0.18)] + right + [(w, 0.0)]
    if kind == 'neck':
        nw = w * 0.42
        a = (w - nw) / 2
        hn = 0.62 * w
        sh = []
        # the curved shoulder (a claw piece) from the eave's corner up to the neck's side
        for t in np.linspace(0, 1, 7)[1:-1]:
            sh.append((a * t, 1.05 * math.sin(t * math.pi / 2) ** 0.8))
        left = [(0.0, 0.25)] + sh + [(a, 1.05), (a, hn - 0.55)]
        ped = [(a - 0.12, hn - 0.55), (w / 2, hn + 0.25), (w - a + 0.12, hn - 0.55)]
        right = [(w - u, v) for (u, v) in reversed(left)]
        return [(0.0, 0.0)] + left + ped + right + [(w, 0.0)]
    if kind == 'bell':
        hb = 0.6 * w
        prof = [(0.00, 0.12), (0.05, 0.26), (0.11, 0.38), (0.15, 0.50), (0.17, 0.62), (0.21, 0.75), (0.28, 0.86), (0.36, 0.94), (0.44, 0.985)]
        left = [(w * u, hb * v) for (u, v) in prof]
        right = [(w - uu, vv) for (uu, vv) in reversed(left)]
        return [(0.0, 0.0)] + left + [(w / 2, hb + 0.12)] + right + [(w, 0.0)]
    if kind == 'spout':
        ht = 0.5 * w
        return [(0.0, 0.0), (w * 0.22, ht * 0.42), (w / 2 - 0.35, ht - 0.1), (w / 2 - 0.35, ht + 0.25), (w / 2 + 0.35, ht + 0.25),
                (w / 2 + 0.35, ht - 0.1), (w * 0.78, ht * 0.42), (w, 0.0)]
    # a cornice: the entablature, a raised centre (the attic) with a small crest
    return [(0.0, 0.0), (0.0, 0.75), (w * 0.33, 0.75), (w * 0.36, 1.25), (w * 0.47, 1.45), (w * 0.5, 1.6), (w * 0.53, 1.45), (w * 0.64, 1.25),
            (w * 0.67, 0.75), (w, 0.75), (w, 0.0)]


def offset_inward(pts, d):
    """A closed outline offset inward by d (a rough miter: each vertex moved along the bisector of its two inner
    normals). For the pale stone band inside a gable's edge."""
    P = np.asarray(pts, np.float64)
    n = len(P)
    area = 0.5 * np.sum(P[:, 0] * np.roll(P[:, 1], -1) - np.roll(P[:, 0], -1) * P[:, 1])
    sgn = 1.0 if area > 0 else -1.0
    out = []
    for i in range(n):
        a, b, c = P[i - 1], P[i], P[(i + 1) % n]
        e1 = b - a
        e2 = c - b
        n1 = np.array([-e1[1], e1[0]]) * sgn
        n2 = np.array([-e2[1], e2[0]]) * sgn
        n1 /= np.linalg.norm(n1) + 1e-9
        n2 /= np.linalg.norm(n2) + 1e-9
        bis = n1 + n2
        nb = np.linalg.norm(bis)
        if nb < 1e-6:
            bis = n1
            k = d
        else:
            bis /= nb
            k = d / max(0.35, float(np.dot(bis, n1)))
        out.append(b + bis * min(k, 3 * d))
    return [tuple(q) for q in out]


FACADE_COLS = ['h_brick', 'h_brown', 'h_char', 'h_brick', 'h_cream', 'h_brown', 'h_ox', 'h_brick', 'h_grey', 'h_char', 'h_brick', 'h_green']


def band_top_ok(side, z0, w, top_y_world):
    """Does a house (its facade plane at X = side * XF from z0 to z0 + w, its top at world Y) stay out of the caption
    band (y 290-600, x 95-945) with a margin? Its inner corner is the one nearest the frame's middle."""
    for z in (z0, z0 + w):
        x = CX + F * side * XF / z
        y = CY - F * (top_y_world - HC) / z
        if 95 - 20 < x < 945 + 20 and y < 616:
            return False
    return True


def make_houses():
    """Both quays beyond the bridge: narrow canal houses shoulder to shoulder, each its own width, height, gable,
    colour and lit windows (a few lit: kitchens, reading lamps), a hoist beam under the gable. A house whose top would
    reach into the caption band is made a storey lower (the real rows vary that much)."""
    houses = []
    for side in (-1, 1):
        r = seeded('houses2', side)
        z = ZB + 1.6
        k = 0 if side < 0 else 5
        while z < 260:
            w = float(r.uniform(4.8, 7.4))
            floors = int(r.choice([4, 4, 5, 5, 3]))
            eave = 1.2 + floors * float(r.uniform(2.65, 2.95))
            kind = GABLES[(k + int(r.integers(0, 3))) % len(GABLES)]
            out = gable_outline(kind, w, r)
            apex = max(v for (_, v) in out)
            while floors > 2 and not band_top_ok(side, z, w, QY + eave + apex + 0.3):
                floors -= 1
                eave = 1.2 + floors * 2.8
            col = K[FACADE_COLS[(k * 7 + int(r.integers(0, 5))) % len(FACADE_COLS)]]
            bays = 3 if w > 5.6 else 2
            lit = [[r.random() < (0.32 if j < floors - 1 else 0.2) for _ in range(bays)] for j in range(floors)]
            houses.append(dict(side=side, z0=z, w=w, eave=eave, kind=kind, col=jitter_hex(col, r, 0.05, 0.01), floors=floors, bays=bays,
                               lit=lit, out=out, seed=k, apex=apex))
            z += w + float(r.uniform(0.0, 0.1))
            k += 1
    return houses


def house_faces(h, plane='far'):
    """One house's facade (with its gable), the pale stone band inside the gable's edge (or the cornice), its windows
    (white frame, glass: lit warm or dark), its door, its hoist beam and the roof mass behind it. The facade lies in
    X = side * XF, facing the canal."""
    s = h['side']
    x = s * XF
    n_sign = -s
    w, e = h['w'], h['eave']

    def P(u, v):
        return (h['z0'] + u, QY + v)

    gl = h['out']
    out = [(0.0, 0.0), (0.0, e)] + [(u, e + v) for (u, v) in gl[1:-1]] + [(w, e), (w, 0.0)]
    faces = []
    apex = e + h['apex']
    # the roof mass behind: a pitched block seen past the gable (fills the jagged gaps between gables with roofs)
    rx = s * (XF + 7.0)
    roof = [(h['z0'] - 0.05, QY + e - 0.5), (h['z0'] - 0.05, QY + apex - 0.9), (h['z0'] + w + 0.05, QY + apex - 0.9), (h['z0'] + w + 0.05, QY + e - 0.5)]
    zc = h['z0'] + w / 2
    faces.append(wall_x(plane, 'roof', K['roof'] if h['seed'] % 2 else K['roof2'], rx, roof, n_sign, name=f'roof{s}_{h["seed"]}', extra={'house': h['seed']}, z=zc + 0.6))
    faces.append(wall_x(plane, 'facade', h['col'], x, [P(u, v) for (u, v) in out], n_sign, name=f'house{s}_{h["seed"]}', extra={'house': h['seed']}, z=zc))
    # the stone: the gable's edge band (a ring between the gable's outline and its inward offset), or the cornice
    if h['kind'] == 'cornice':
        cor = [P(-0.05, e + 0.45), P(-0.05, e + 0.78), P(w + 0.05, e + 0.78), P(w + 0.05, e + 0.45)]
        faces.append(wall_x(plane, 'trim', K['stone_t'], x - s * 0.02, cor, n_sign, name=f'cornice{s}_{h["seed"]}', z=zc - 0.04))
        att = [(u, e + v) for (u, v) in gl[3:-3]]
        if len(att) >= 3:
            faces.append(wall_x(plane, 'trim', K['stone_t'], x - s * 0.02, [P(u, v) for (u, v) in [(att[0][0], e + 0.75)] + att + [(att[-1][0], e + 0.75)]], n_sign, name=f'attic{s}_{h["seed"]}', z=zc - 0.04))
    else:
        top = [(u, e + v) for (u, v) in gl[1:-1]]
        inner = offset_inward([(0.0, e)] + top + [(w, e)], 0.26)
        ring = top + [inner[-2]] + list(reversed(inner[1:-1]))
        faces.append(wall_x(plane, 'trim', K['stone_t'], x - s * 0.02, [P(u, v) for (u, v) in ring], n_sign, name=f'gtrim{s}_{h["seed"]}', z=zc - 0.04))
        # the band at the eave line across the facade (where the gable starts)
        sb = [P(0.0, e - 0.12), P(0.0, e + 0.1), P(w, e + 0.1), P(w, e - 0.12)]
        faces.append(wall_x(plane, 'trim', K['stone_t'], x - s * 0.021, sb, n_sign, name=f'eave{s}_{h["seed"]}', z=zc - 0.04))
    # windows: the ground floor tall (a front room, or a shop), then the floors; white frames, glass inside
    floor_h = (e - 1.2) / h['floors']
    for j in range(h['floors']):
        v0 = 0.65 if j == 0 else 1.2 + j * floor_h + 0.35
        wh = (2.2 if j == 0 else min(1.9, floor_h * 0.64)) * (0.9 if j == h['floors'] - 1 else 1.0)
        for b in range(h['bays']):
            uc = w * (b + 1) / (h['bays'] + 1)
            ww = 1.02 if j else 1.18
            fr = 0.11
            if j == 0 and b == 0:
                # the door: dark, panelled, a fanlight over it (lit if the hall is)
                dr = [P(uc - 0.55, 0.0), P(uc - 0.55, 2.3), P(uc + 0.55, 2.3), P(uc + 0.55, 0.0)]
                faces.append(wall_x(plane, 'door', K['door'], x - s * 0.02, dr, n_sign, name=f'door{s}_{h["seed"]}', z=zc - 0.05))
                continue
            frame = [P(uc - ww / 2, v0), P(uc - ww / 2, v0 + wh), P(uc + ww / 2, v0 + wh), P(uc + ww / 2, v0)]
            faces.append(wall_x(plane, 'frame', K['frame'], x - s * 0.02, frame, n_sign, name=f'fr{s}_{h["seed"]}_{j}_{b}', z=zc - 0.05))
            lit = h['lit'][j][b]
            gp = [P(uc - ww / 2 + fr, v0 + fr), P(uc - ww / 2 + fr, v0 + wh - fr), P(uc + ww / 2 - fr, v0 + wh - fr), P(uc + ww / 2 - fr, v0 + fr)]
            col = (K['win_lit'] if (h['seed'] + j + b) % 3 else K['win_warm']) if lit else (K['glass_mid'] if (j + b + h['seed']) % 4 == 0 else K['glass'])
            faces.append(wall_x(plane, 'window', col, x - s * 0.03, gp, n_sign, emit=1.0 if lit else 0.0, name=f'gl{s}_{h["seed"]}_{j}_{b}', z=zc - 0.06))
    # the hoist beam under the apex (a short dark bar with its hook)
    if h['kind'] != 'cornice':
        hb = [P(w / 2 - 0.1, e + h['apex'] - 1.25), P(w / 2 - 0.1, e + h['apex'] - 0.95), P(w / 2 + 0.1, e + h['apex'] - 0.95), P(w / 2 + 0.1, e + h['apex'] - 1.25)]
        faces.append(wall_x(plane, 'beam', K['beam'], x - s * 0.04, hb, n_sign, name=f'beam{s}_{h["seed"]}', z=zc - 0.07))
    return faces


def set_far():
    """Beyond the bridge: the two rows of houses, the quay walls and their tops, young elms on the quays, moored sloops,
    the smaller far bridge, and the church tower in the haze down the canal."""
    faces = []
    houses = make_houses()
    for h in houses:
        faces += house_faces(h)
    # the quay walls (X = +-XW, from the water to the quay top) and the quay tops (the street, seen edge-on)
    for s in (-1, 1):
        faces.append(wall_x('far', 'quay', K['quay'], s * XW, [(ZB, 0.0), (ZB, QY), (400.0, QY), (400.0, 0.0)], -s, name=f'quaywall{s}'))
        faces.append(Face('far', 'quaytop', K['quay_top'], pts=[(s * XW, QY, ZB), (s * XF, QY, ZB), (s * XF, QY, 400.0), (s * XW, QY, 400.0)], n=(0, 1, 0), name=f'quaytop{s}'))
    # moored sloops along both quays (low open boats, a cover on some)
    r = seeded('sloops')
    for s in (-1, 1):
        z = ZB + 4.0 + r.uniform(0, 4)
        while z < 160:
            L = r.uniform(4.5, 7.5)
            if r.random() < 0.7:
                x_in = s * (XW - 2.1)
                hull = [(z, 0.0), (z + 0.6, 0.55), (z + L - 0.4, 0.55), (z + L, 0.15), (z + L, 0.0)]
                faces.append(wall_x('far', 'sloop', K['sloop'] if r.random() < 0.6 else K['sloop2'], x_in, hull, -s, name=f'sloop{s}_{z:.0f}'))
                if r.random() < 0.45:
                    cov = [(z + 0.8, 0.55), (z + 1.2, 0.95), (z + L - 1.0, 0.95), (z + L - 0.6, 0.55)]
                    faces.append(wall_x('far', 'cover', K['cover'], x_in - s * 0.02, cov, -s, name=f'cover{s}_{z:.0f}'))
            z += L + r.uniform(1.0, 6.0)
    # the elms on the quays (Amsterdam's canal elms, late October: thinning crowns, a few yellow), a row on each quay
    # near the water's edge from just past the bridge; a crown whose top would reach the caption band sits lower
    r = seeded('far_elms3')
    for s_ in (-1, 1):
        z = (41.0 if s_ < 0 else 47.0) + r.uniform(0, 2)
        i = 0
        while z < 230:
            X = s_ * (XW + 1.5)
            rad = r.uniform(2.0, 2.6)
            ht = r.uniform(10.0, 11.8)
            cz = z
            # keep the crown's top below the band (y >= 622) wherever it is inside x 95-945
            for _ in range(12):
                c = proj([X, ht - rad * 0.95, cz])
                rr = F * rad / cz
                if not (95 - 30 < c[0] < 945 + 30) or c[1] - rr >= 622:
                    break
                ht -= 0.4
            # the crown as a few leafy clumps with sky between them (late October: thinning), never one ball
            nclump = int(r.integers(4, 7))
            for j in range(nclump):
                ang = r.uniform(0, 2 * math.pi)
                dist = r.uniform(0.15, 0.62)
                cx_ = float(c[0]) + math.cos(ang) * dist * rr * 1.05
                cy_ = float(c[1]) + math.sin(ang) * dist * rr * 0.75 - 0.08 * rr
                sr = rr * r.uniform(0.34, 0.56)
                clump = blob(cx_, cy_, sr * r.uniform(1.0, 1.25), sr * r.uniform(0.75, 0.95), r, rough=0.3)
                faces.append(Face('far', 'crown', [K['elm'], K['elm2'], K['elm3']][(i + j) % 3], scr=clump, z=cz - 0.5 - 0.01 * j, name=f'farelm{s_}_{i}_{j}'))
            tb = proj([X, QY, cz])
            tt = proj([X, ht - 1.6 * rad, cz])
            tw = max(1.2, F * 0.3 / cz)
            trunk = np.array([[tb[0] - tw / 2, tb[1]], [tt[0] - tw / 3, tt[1]], [tt[0] + tw / 3, tt[1]], [tb[0] + tw / 2, tb[1]]])
            faces.append(Face('far', 'trunk', K['trunk'], scr=trunk, z=cz - 0.4, name=f'farelmtrunk{s_}_{i}'))
            # two limbs up into the crown (thin, where the tree IS thin)
            for k_, lean in enumerate((-0.55, 0.5)):
                top_ = (float(tt[0]) + lean * rr * 0.7, float(tt[1]) - rr * 0.55)
                lw = max(0.8, tw * 0.45)
                limb = np.array([[tt[0] - lw / 2, tt[1] + 2], [top_[0] - lw / 3, top_[1]], [top_[0] + lw / 3, top_[1]], [tt[0] + lw / 2, tt[1] + 2]])
                faces.append(Face('far', 'trunk', K['trunk'], scr=limb, z=cz - 0.45, name=f'farelmlimb{s_}_{i}_{k_}'))
            z += r.uniform(10.5, 14.5)
            i += 1
    # the far bridge (a smaller humped bridge across the canal, far down: a small ring in the haze)
    zf2 = 132.0
    span2 = 3.2
    top = []
    for xx in np.linspace(-XF, XF, 30):
        t = min(1.0, abs(xx) / 9.0)
        top.append((xx, QY + 1.4 * math.cos(t * math.pi / 2) ** 1.6 + 0.12))
    arch = [(span2 * math.cos(a), 0.2 + 1.9 * math.sin(a)) for a in np.linspace(0, math.pi, 22)]
    poly = [(-XF, QY), (-XW, QY), (-XW, 0.0), (-span2, 0.0)] + arch[::-1] + [(span2, 0.0), (XW, 0.0), (XW, QY), (XF, QY)] + top[::-1]
    # (the arch list runs from +span to -span; reversed it runs left to right under the polygon's walk)
    poly = [(-XF, QY), (-XW, QY), (-XW, 0.0), (-span2, 0.0)] + [(span2 * math.cos(a), 0.2 + 1.9 * math.sin(a)) for a in np.linspace(math.pi, 0, 22)] + [(span2, 0.0), (XW, 0.0), (XW, QY), (XF, QY)] + top[::-1]
    faces.append(wall_z('far', 'farbridge', K['h_brick'], zf2, poly, name='farbridge'))
    rail2 = [(xx, yy + 0.95) for (xx, yy) in top] + [(xx, yy + 0.8) for (xx, yy) in top[::-1]]
    faces.append(wall_z('far', 'iron', K['iron'], zf2 - 0.05, rail2, name='farbridge.rail'))
    # the church tower in the haze down the canal (a Westertoren-like silhouette: square stages, a lantern, a spire)
    tz, tx = 330.0, -26.0
    tw = 9.0
    stages = [(0.0, 46.0, tw), (46.0, 58.0, tw * 0.82), (58.0, 67.0, tw * 0.62), (67.0, 74.0, tw * 0.44), (74.0, 79.0, tw * 0.3)]
    for i, (y0, y1, ww) in enumerate(stages):
        q = [(tx - ww / 2, y0), (tx - ww / 2, y1), (tx + ww / 2, y1), (tx + ww / 2, y0)]
        faces.append(wall_z('far', 'tower', K['tower'] if i % 2 == 0 else K['tower_lit'], tz - i * 0.01, q, name=f'tower{i}'))
    spire = [(tx - 1.0, 79.0), (tx - 0.15, 86.0), (tx + 0.15, 86.0), (tx + 1.0, 79.0)]
    faces.append(wall_z('far', 'tower', K['tower'], tz - 0.06, spire, name='tower.spire'))
    # its clock face: one lit dot of warm (the tower's own small life)
    ck = [(tx - 1.4, 49.5), (tx - 1.4, 52.3), (tx + 1.4, 52.3), (tx + 1.4, 49.5)]
    faces.append(wall_z('far', 'window', K['win_warm'], tz - 0.07, ck, emit=0.45, name='tower.clock'))
    return faces, houses


# ---------------------------------------------------------------- the bridge
def arch_pts(n=40, r_off=0.0, z=ZF):
    """The intrados (r_off 0) or a curve offset outward by r_off (the extrados), left to right, at depth z."""
    out = []
    a = SPAN2 + r_off
    b = BR['rise'] + r_off
    for t in np.linspace(math.pi, 0, n):
        out.append((a * math.cos(t), BR['spring'] + b * math.sin(t), z))
    return out


def set_bridge():
    """The front face (brick spandrel with the arch cut out), the arch ring of stone headers, the coping, the vault seen
    from below (the barrel), the piers' inner faces, the bikes chained along the railing (behind it) and her bike."""
    faces = []
    r = seeded('bridge')
    xs = np.linspace(-12.5, 12.5, 81)
    top = [(float(x), float(deck_y(x)) + 0.12) for x in xs]
    # the spandrel (keyhole polygon: the arch opening touches the water)
    intr = [(SPAN2 * math.cos(t), BR['spring'] + BR['rise'] * math.sin(t)) for t in np.linspace(math.pi, 0, 48)]
    poly = [(-12.5, QY), (-XW, QY), (-XW, 0.0), (-SPAN2, 0.0)] + intr + [(SPAN2, 0.0), (XW, 0.0), (XW, QY), (12.5, QY)] + top[::-1]
    faces.append(wall_z('bridge', 'brick', K['brick'], ZF, poly, name='spandrel'))
    # the arch ring: stone headers (voussoirs), odd count, a keystone a touch bigger; each its own tone
    nv = 27
    ring = BR['ring']
    for i in range(nv):
        t0 = math.pi * (1 - i / nv)
        t1 = math.pi * (1 - (i + 1) / nv)
        gap = 0.012
        ta, tb = t0 - gap, t1 + gap
        ro = ring * (1.12 if i == nv // 2 else 1.0)
        pts = []
        for t in np.linspace(ta, tb, 4):
            pts.append((SPAN2 * math.cos(t), BR['spring'] + BR['rise'] * math.sin(t)))
        for t in np.linspace(tb, ta, 4):
            pts.append(((SPAN2 + ro) * math.cos(t), BR['spring'] + (BR['rise'] + ro) * math.sin(t)))
        col = jitter_hex(K['stone'] if i % 3 else K['stone2'], r, 0.05, 0.01)
        faces.append(wall_z('bridge', 'voussoir', col, ZF - 0.03, pts, name=f'vous{i}', extra={'vi': i, 'nv': nv}))
    # the springing stones and the pier faces down to the water (stone), both sides
    for s in (-1, 1):
        pier = [(s * SPAN2, 0.0), (s * SPAN2, BR['spring']), (s * (SPAN2 + ring + 0.15), BR['spring'] + 0.05), (s * (SPAN2 + ring + 0.15), 0.0)]
        faces.append(wall_z('bridge', 'voussoir', K['stone2'], ZF - 0.03, pier if s < 0 else pier[::-1], name=f'pierface{s}'))
        inner = [(ZF, 0.0), (ZF, BR['spring']), (ZB, BR['spring']), (ZB, 0.0)]
        faces.append(wall_x('bridge', 'pier', K['stone2'], s * SPAN2, inner, -s, name=f'pierin{s}'))
    # the vault (the barrel's underside, front to back): strips along the arch, normal toward the axis
    nb = 30
    for i in range(nb):
        t0 = math.pi * (1 - i / nb)
        t1 = math.pi * (1 - (i + 1) / nb)
        p0 = (SPAN2 * math.cos(t0), BR['spring'] + BR['rise'] * math.sin(t0))
        p1 = (SPAN2 * math.cos(t1), BR['spring'] + BR['rise'] * math.sin(t1))
        tm = (t0 + t1) / 2
        nrm = -np.array([math.cos(tm) / SPAN2, math.sin(tm) / BR['rise'], 0.0])
        nrm /= np.linalg.norm(nrm)
        q = [(p0[0], p0[1], ZF), (p1[0], p1[1], ZF), (p1[0], p1[1], ZB), (p0[0], p0[1], ZB)]
        faces.append(Face('bridge', 'vault', jitter_hex(K['vault'], r, 0.04, 0.01), pts=q, n=tuple(nrm), name=f'vault{i}'))
    # the coping: a stone band along the top, proud of the face
    cop_top = [(float(x), float(deck_y(x)) + 0.15) for x in xs]
    cop_bot = [(float(x), float(deck_y(x)) - 0.12) for x in xs[::-1]]
    faces.append(wall_z('bridge', 'coping', K['coping'], ZF - 0.06, cop_top + cop_bot, name='coping'))
    # the bikes chained along the railing (behind it, on the deck): dark silhouettes, wheels as thin rings; her bike
    # beside her (to her left, screen right), a basket on it
    for (bx, col, nm, basket) in [(-5.5, K['bike'], 'bikeL1', False), (-2.75, K['bike2'], 'bikeL2', False), (1.25, K['bike'], 'herbike', True), (4.45, K['bike_red'], 'bikeR1', False)]:
        faces += bike_faces(bx, ZF + 0.22, col, nm, basket, r)
    return faces


def bike_faces(bx, bz, col, nm, basket, r):
    """A city bike in profile along the railing (X), standing on the deck: two thin wheel rings, the frame, a saddle,
    the handlebar, a basket on hers. Thin shapes only where the bike IS thin (DIRECTION rule 4)."""
    faces = []
    y0 = float(deck_y(bx))
    wr = 0.33
    wb = 1.12
    tire = 0.05
    flip = 1 if r.random() < 0.5 else -1
    cxs = [bx - wb / 2, bx + wb / 2]
    for i, cx in enumerate(cxs):
        cy = float(deck_y(cx)) + wr
        outer = [(cx + wr * math.cos(t), cy + wr * math.sin(t)) for t in np.linspace(0, 2 * math.pi, 36, endpoint=False)]
        inner = [(cx + (wr - tire) * math.cos(t), cy + (wr - tire) * math.sin(t)) for t in np.linspace(2 * math.pi, 0, 36, endpoint=False)]
        ringp = outer + [outer[0], inner[-1]] + inner + [inner[-1], outer[0]]
        faces.append(wall_z('bridge', 'bike', col, bz + 0.01 * i, ringp, name=f'{nm}.wheel{i}'))
    yb = float(deck_y(bx)) + wr
    rear, front = cxs[0] if flip > 0 else cxs[1], cxs[1] if flip > 0 else cxs[0]
    seat = (rear + flip * 0.38, yb + 0.55)
    head = (front - flip * 0.12, yb + 0.62)
    crank = (bx - flip * 0.05, yb - 0.02)

    def bar(p, q, w=0.045):
        dx, dy = q[0] - p[0], q[1] - p[1]
        L = math.hypot(dx, dy) or 1
        nx, ny = -dy / L * w / 2, dx / L * w / 2
        return [(p[0] + nx, p[1] + ny), (q[0] + nx, q[1] + ny), (q[0] - nx, q[1] - ny), (p[0] - nx, p[1] - ny)]
    for k, (p, q) in enumerate([((rear, yb), crank), (crank, seat), (seat, head), (crank, head), ((front, yb), head), ((rear, yb), seat)]):
        faces.append(wall_z('bridge', 'bike', col, bz - 0.01, bar(p, q), name=f'{nm}.tube{k}'))
    sad = [(seat[0] - 0.13, seat[1] + 0.05), (seat[0] + 0.12, seat[1] + 0.07), (seat[0] + 0.1, seat[1] + 0.11), (seat[0] - 0.14, seat[1] + 0.1)]
    faces.append(wall_z('bridge', 'bike', K['bike'], bz - 0.02, sad, name=f'{nm}.saddle'))
    hb = [(head[0] - 0.05, head[1]), (head[0] - 0.05 - flip * 0.06, head[1] + 0.22), (head[0] + 0.0 - flip * 0.2, head[1] + 0.26), (head[0] + 0.02 - flip * 0.2, head[1] + 0.21), (head[0] + 0.0, head[1] + 0.02)]
    faces.append(wall_z('bridge', 'bike', col, bz - 0.02, hb, name=f'{nm}.bar'))
    if basket:
        bxk = head[0] + flip * 0.08
        bk = [(bxk - 0.2, head[1] - 0.05), (bxk - 0.22, head[1] + 0.2), (bxk + 0.22, head[1] + 0.2), (bxk + 0.2, head[1] - 0.05)]
        faces.append(wall_z('bridge', 'bike', K['bike2'], bz - 0.03, bk, name=f'{nm}.basket'))
    return faces


def set_rail():
    """The front railing on the coping (dark green-black iron: round top rail, a middle rail, posts) and the lamp."""
    faces = []
    xs = np.linspace(-12.5, 12.5, 101)
    zr = ZF - 0.08
    rl = BR['rail']

    def band(y_off, th, name):
        a = [(float(x), float(deck_y(x)) + y_off + th / 2) for x in xs]
        b = [(float(x), float(deck_y(x)) + y_off - th / 2) for x in xs[::-1]]
        return wall_z('rail', 'iron', K['iron'], zr, a + b, name=name)
    faces.append(band(rl, 0.075, 'rail.top'))
    faces.append(band(0.52, 0.04, 'rail.mid'))
    faces.append(band(0.24, 0.04, 'rail.low'))
    for i, x in enumerate(np.arange(-12.0, 12.01, 1.32)):
        y0 = float(deck_y(x)) + 0.12
        y1 = float(deck_y(x)) + rl
        w = 0.055
        p = [(x - w, y0), (x - w, y1), (x + w, y1), (x + w, y0)]
        faces.append(wall_z('rail', 'iron', K['iron'], zr + 0.005, p, name=f'rail.post{i}'))
        base = [(x - 0.09, y0), (x - 0.07, y0 + 0.14), (x + 0.07, y0 + 0.14), (x + 0.09, y0)]
        faces.append(wall_z('rail', 'iron', K['iron'], zr + 0.006, base, name=f'rail.base{i}'))
    # the lamp: a cast-iron post on the coping, fluted base, a lantern with a domed cap and a finial
    L = SCENE['lamp']
    lx, lz = L['X'], L['Z']
    y0 = float(deck_y(lx)) + 0.12
    post = [(lx - 0.13, y0), (lx - 0.1, y0 + 0.55), (lx - 0.06, y0 + 0.75), (lx - 0.045, y0 + L['post']), (lx + 0.045, y0 + L['post']), (lx + 0.06, y0 + 0.75),
            (lx + 0.1, y0 + 0.55), (lx + 0.13, y0)]
    faces.append(wall_z('rail', 'lamp_post', K['lamp_post'], lz, post, name='lamp.post'))
    yt = y0 + L['post']
    cage = [(lx - 0.2, yt + 0.02), (lx - 0.27, yt + 0.62), (lx + 0.27, yt + 0.62), (lx + 0.2, yt + 0.02)]
    faces.append(wall_z('rail', 'lamp_post', K['lamp_post'], lz - 0.01, cage, name='lamp.cage'))
    glass = [(lx - 0.16, yt + 0.08), (lx - 0.22, yt + 0.57), (lx + 0.22, yt + 0.57), (lx + 0.16, yt + 0.08)]
    faces.append(wall_z('rail', 'lantern', K['lantern'], lz - 0.02, glass, emit=1.0, name='lamp.glass'))
    cap = [(lx - 0.31, yt + 0.6), (lx - 0.2, yt + 0.76), (lx - 0.06, yt + 0.84), (lx, yt + 0.98), (lx + 0.06, yt + 0.84), (lx + 0.2, yt + 0.76), (lx + 0.31, yt + 0.6)]
    faces.append(wall_z('rail', 'lamp_post', K['lamp_post'], lz - 0.03, cap, name='lamp.cap'))
    return faces


# ---------------------------------------------------------------- the houseboat (right quay, just in front of the bridge)
def set_boat():
    B = SCENE['boat']
    x0, x1, z0, z1 = B['x0'], B['x1'], B['z0'], B['z1']
    faces = []
    r = seeded('boat')
    # the hull: its canal-side wall (X = x0, facing -X) and its stern facing us (Z = z0)
    faces.append(wall_x('boat', 'hull', K['hull'], x0, [(z0, 0.0), (z0, 0.75), (z1, 0.75), (z1, 0.0)], -1, name='hull.side'))
    faces.append(wall_z('boat', 'hull', K['hull'], z0, [(x0, 0.0), (x0, 0.75), (x1, 0.75), (x1, 0.0)], name='hull.end'))
    # the cabin, set in from the hull's edge: walls with windows, a flat roof, pots and plants on the roof and the deck
    cx0 = x0 + 0.35
    cz0, cz1 = z0 + 1.2, z1 - 0.5
    ch = 2.15
    faces.append(wall_x('boat', 'cabin', K['cabin'], cx0, [(cz0, 0.75), (cz0, ch), (cz1, ch), (cz1, 0.75)], -1, name='cabin.side'))
    faces.append(wall_z('boat', 'cabin', K['cabin2'], cz0, [(cx0, 0.75), (cx0, ch), (x1 - 0.3, ch), (x1 - 0.3, 0.75)], name='cabin.end'))
    faces.append(wall_x('boat', 'trim', K['cabin_trim'], cx0 - 0.01, [(cz0, ch - 0.12), (cz0, ch), (cz1, ch), (cz1, ch - 0.12)], -1, name='cabin.trim', z=cz0 - 0.05))
    # the windows on the canal side: one lit warm (the counterweight), one dim
    for i, (za, zb2, lit) in enumerate([(cz0 + 0.5, cz0 + 1.3, False), (cz0 + 1.9, cz0 + 2.7, False), (cz1 - 1.15, cz1 - 0.35, True)]):
        win = [(za, 1.2), (za, 1.78), (zb2, 1.78), (zb2, 1.2)]
        faces.append(wall_x('boat', 'window', K['boat_win'] if lit else K['glass'], cx0 - 0.02, win, -1, emit=1.0 if lit else 0.0, name=f'boatwin{i}', z=cz0 - 0.1))
    # pots and plants on the roof's edge (Pip hides among them: the engine's)
    for i, zz in enumerate(np.linspace(cz0 + 0.3, cz1 - 0.4, 6)):
        c = proj([cx0 + 0.25, ch + 0.15, zz])
        s_ = F * 0.22 / zz
        pot = np.array([[c[0] - s_, c[1] + s_], [c[0] - s_ * 0.8, c[1] - s_ * 0.2], [c[0] + s_ * 0.8, c[1] - s_ * 0.2], [c[0] + s_, c[1] + s_]])
        faces.append(Face('boat', 'pot', K['pot'] if i % 2 else K['pot2'], scr=pot, z=zz - 0.2, name=f'pot{i}'))
        pl = blob(float(c[0]), float(c[1] - s_ * 1.4), s_ * r.uniform(1.0, 1.7), s_ * r.uniform(1.1, 1.9), r, rough=0.3)
        faces.append(Face('boat', 'plant', K['plant'] if i % 2 else K['plant2'], scr=pl, z=zz - 0.25, name=f'plant{i}'))
    return faces


# ---------------------------------------------------------------- the near elms (the old trees on the near quays, at the edges)
def set_trees():
    """No near elms: the sky above the street stays one calm field that holds the words (CARD.md §4)."""
    return []


# ---------------------------------------------------------------- our boat's bow (the near hint, cut by the bottom edge)
def set_near():
    """Our own small boat's bow, seen from its middle bench: the varnished foredeck between two gunwales that curve in
    to the stem post, pointing into the ring; cut by the bottom edge, dark and soft (the near hint)."""
    faces = []
    n = 14
    gl, gr = [], []
    for t in np.linspace(0.0, 1.0, n):
        z = 0.8 + 0.62 * t
        half = 0.4 * (1 - t) ** 0.62 + 0.01
        y = 0.52 + 0.07 * t ** 1.6
        gl.append((-half + 0.03 * t, y, z))
        gr.append((half + 0.03 * t, y, z))
    deck = [(x, y - 0.01, z) for (x, y, z) in gl] + [(x, y - 0.01, z) for (x, y, z) in reversed(gr)]
    faces.append(Face('near', 'bow', K['bow'], pts=deck, n=(0, 1, 0), name='bow.deck'))
    # the deck's planks: two seams running to the stem (a value, never a line: thin strips a touch lighter)
    for k, off in enumerate((-0.14, 0.14)):
        seam = []
        for t in np.linspace(0.0, 0.9, 10):
            z = 0.8 + 0.62 * t
            half = 0.4 * (1 - t) ** 0.62
            seam.append((off * half / 0.4 + 0.03 * t, 0.52 + 0.07 * t ** 1.6 - 0.008, z))
        strip = [(x - 0.008, y, z) for (x, y, z) in seam] + [(x + 0.008, y, z) for (x, y, z) in reversed(seam)]
        faces.append(Face('near', 'bow_seam', K['bow_wood'], pts=strip, n=(0, 1, 0), name=f'bow.seam{k}'))
    for nm, side in (('bow.rimL', gl), ('bow.rimR', gr)):
        rim = [(x, y + 0.035, z) for (x, y, z) in side] + [(x, y - 0.03, z) for (x, y, z) in reversed(side)]
        faces.append(Face('near', 'bow_rim', K['bow_rim'], pts=rim, n=(0, 1, 0), name=nm))
    return faces


# ---------------------------------------------------------------- the paper twin (the street mirrored, made of paper)
PAPER_TONES = ['paper', 'paper2', 'paper3', 'vellum', 'sepia', 'letter', 'paper', 'ink_page']


def twin_sheets_on_quad(base: Face, rows, cols, rng, kinds=('sheet',), tone_keys=PAPER_TONES, overlap=0.04):
    """A mirrored planar face re-made as paper: a grid of sheets (each its own tone, a little askew, overlapping like
    laid courses), each carrying a WRITING seed (the painter writes its rows of soft marks)."""
    out = []
    P = base.pts
    if P is None or len(P) < 3:
        return out
    # the face's own frame: u along its first edge, v along the face
    o = P[0]
    e1 = P[1] - P[0]
    nrm = base.n / (np.linalg.norm(base.n) + 1e-9)
    u_ax = e1 / (np.linalg.norm(e1) + 1e-9)
    v_ax = np.cross(nrm, u_ax)
    loc = np.array([[np.dot(p - o, u_ax), np.dot(p - o, v_ax)] for p in P])
    u0, v0 = loc.min(0)
    u1, v1 = loc.max(0)
    poly = loc.astype(np.float32)
    du, dv = (u1 - u0) / cols, (v1 - v0) / rows
    for i in range(rows):
        shift = (0.5 if i % 2 else 0.0) * du
        for j in range(-1, cols + 1):
            ua = u0 + j * du + shift - overlap
            ub = ua + du + 2 * overlap
            va = v0 + i * dv - overlap
            vb = va + dv + 2 * overlap
            cu, cv = (ua + ub) / 2, (va + vb) / 2
            if cv < v0 or cv > v1:
                continue
            inside = cv2.pointPolygonTest(poly.reshape(-1, 1, 2), (float(cu), float(cv)), False)
            if inside < 0:
                continue
            sk = rng.uniform(-0.05, 0.05)
            corners = [(ua, va + sk * du), (ub, va - sk * du), (ub, vb), (ua, vb)]
            # a curled corner now and then
            pts = [o + u_ax * a + v_ax * b for (a, b) in corners]
            col = jitter_hex(K[tone_keys[int(rng.integers(0, len(tone_keys)))]], rng, 0.07, 0.015)
            out.append(Face('twin', kinds[int(rng.integers(0, len(kinds)))], col, pts=pts, n=base.n, name=f'{base.name}.s{i}_{j}',
                            extra={'writing': int(rng.integers(1, 1 << 30)), 'rows': int(rng.integers(6, 14))}, twin=True))
    return out


def set_twin(far_faces, bridge_faces, rail_faces, boat_faces, houses):
    """The street's paper twin. The bridge: long written sheets in courses for the spandrel, ledgers standing spine-out
    for the arch's stones (the ring's lower half), ledgers lying flat for the coping, paper strips for the railing, curved
    pages for the vault. The houses: facades of stacked letters and ledger pages, windows as folded letters (dark), the
    gables cut in paper; the roofs dark board. The boat: a folded-paper boat. Everything the far plane holds mirrored."""
    faces = []
    r = seeded('twin')
    for f in bridge_faces:
        if f.kind == 'brick' and f.name == 'spandrel':
            # the face's twin as one dark backing (the gaps between sheets), then courses of long sheets over it
            faces.append(mirror(f, col=K['umber'], kind='t_back'))
            # build courses over the mirrored spandrel: rows of long sheets following its outline
            m = mirror(f)
            ys = np.arange(0.0, 4.6, 0.36)
            for i, y in enumerate(ys):
                x = -12.5 + r.uniform(0, 1.4)
                while x < 12.5:
                    L = r.uniform(1.1, 2.0)
                    ya, yb = -(y + 0.36 + 0.03), -(y - 0.03)
                    xa, xb = x, x + L
                    xm = (xa + xb) / 2
                    # inside the spandrel? (not in the arch opening, under the coping line)
                    top_here = -float(deck_y(xm)) - 0.1
                    if yb > 0 or ya < top_here - 0.0:
                        pass
                    if (-ya) > float(deck_y(xm)) + 0.1:
                        x += L
                        continue
                    if abs(xm) < SPAN2 + 0.45 and (-yb) < BR['spring'] + (BR['rise'] + 0.5) * math.sqrt(max(0.0, 1 - (xm / (SPAN2 + 0.5)) ** 2)):
                        x += L
                        continue
                    if abs(xm) > XW and (-yb) < QY:
                        x += L
                        continue
                    sk = r.uniform(-0.04, 0.04)
                    pts = [(xa, yb + sk, ZF), (xb, yb - sk, ZF), (xb, ya, ZF), (xa, ya, ZF)]
                    col = jitter_hex(K[PAPER_TONES[int(r.integers(0, len(PAPER_TONES)))]], r, 0.07, 0.015)
                    faces.append(Face('twin', 't_sheet', col, pts=pts, n=(0, 0, -1), z=ZF - 0.01, name=f'twin.course{i}_{x:.1f}',
                                      extra={'writing': int(r.integers(1, 1 << 30)), 'rows': int(r.integers(3, 6))}, twin=True))
                    x += L - r.uniform(0.02, 0.12)
        elif f.kind == 'voussoir' and f.name.startswith('vous'):
            vi = f.extra.get('vi', 0)
            nv = f.extra.get('nv', 27)
            t0 = math.pi * (1 - vi / nv) - 0.012
            t1 = math.pi * (1 - (vi + 1) / nv) + 0.012
            pages = vi % 3 == 1
            ro = BR['ring'] * (1.0 + (r.uniform(0.0, 0.3) if pages else r.uniform(0.15, 0.75)))
            lean = r.uniform(-0.05, 0.05)
            inner = [(SPAN2 * math.cos(t), -(BR['spring'] + BR['rise'] * math.sin(t))) for t in np.linspace(t0, t1, 4)]
            outer = [((SPAN2 + ro) * math.cos(t + lean), -(BR['spring'] + (BR['rise'] + ro) * math.sin(t + lean))) for t in np.linspace(t1, t0, 4)]
            pts = [(x, y, ZF - 0.03 - 0.002 * (vi % 4)) for (x, y) in inner + outer]
            if pages:
                col = jitter_hex([K['paper'], K['paper3'], K['vellum'], K['letter']][int(r.integers(0, 4))], r, 0.05, 0.012)
                faces.append(Face('twin', 't_pages', col, pts=pts, n=(0, 0, -1), name=f'twin.ledger{vi}', extra={'vi': vi}, twin=True))
            else:
                col = jitter_hex([K['leather'], K['leather2'], K['leather3'], K['umber'], '#7A4636', '#5E3A3A', '#4E3B33', '#5A3F38'][int(r.integers(0, 8))], r, 0.08, 0.02)
                faces.append(Face('twin', 't_spine', col, pts=pts, n=(0, 0, -1), name=f'twin.ledger{vi}', extra={'bands': int(r.integers(2, 5)), 'vi': vi}, twin=True))
        elif f.kind == 'voussoir':
            faces.append(mirror(f, col=K['leather2'], kind='t_spine', extra={'bands': 2}))
        elif f.kind == 'vault':
            faces.append(mirror(f, col=jitter_hex(K['sepia'], r, 0.08, 0.02), kind='t_page', extra={'writing': int(r.integers(1, 1 << 30)), 'rows': 10}))
        elif f.kind == 'coping':
            faces.append(mirror(f, col=K['vellum'], kind='t_ledger'))
        elif f.kind == 'pier':
            faces.append(mirror(f, col=K['umber'], kind='t_back'))
        elif f.kind == 'bike':
            faces.append(mirror(f, col=K['umber'], kind='t_strip'))
    for f in rail_faces:
        if f.kind == 'iron':
            faces.append(mirror(f, col=K['umber'], kind='t_strip'))
        elif f.kind in ('lamp_post',):
            faces.append(mirror(f, col=K['leather2'], kind='t_strip'))
        elif f.kind == 'lantern':
            faces.append(mirror(f, col=K['paper2'], kind='t_sheet', extra={'writing': 7, 'rows': 3}))
    for f in far_faces:
        if f.pts is None and f.scr is None:
            continue
        if f.kind == 'facade':
            faces.append(mirror(f, col=K['umber'], kind='t_back'))
            rows = max(4, int(f.pts[:, 1].max() / 1.0))
            cols = max(2, int(round((f.pts[:, 2].max() - f.pts[:, 2].min()) / 0.8)))
            faces += twin_sheets_on_quad(mirror(f), rows, cols, r, kinds=('t_sheet',))
        elif f.kind == 'window':
            faces.append(mirror(f, col=jitter_hex(K['leather2'] if not f.emit else K['umber'], r, 0.08, 0.02), kind='t_letter'))
        elif f.kind in ('frame', 'trim'):
            faces.append(mirror(f, col=K['paper3'] if f.kind == 'frame' else K['vellum'], kind='t_ledger'))
        elif f.kind == 'door':
            faces.append(mirror(f, col=K['leather2'], kind='t_letter'))
        elif f.kind == 'roof':
            faces.append(mirror(f, col=K['leather2'], kind='t_back'))
        elif f.kind in ('crown',):
            faces.append(mirror(f, col=jitter_hex(K['umber'], r, 0.1, 0.02), kind='t_crown'))
        elif f.kind in ('quay', 'farbridge'):
            faces.append(mirror(f, col=K['sepia2'], kind='t_back'))
            if f.kind == 'quay':
                pass
        elif f.kind in ('tower',):
            faces.append(mirror(f, col=K['sepia2'], kind='t_back'))
        elif f.kind in ('sloop', 'cover', 'trunk', 'beam', 'iron'):
            faces.append(mirror(f, col=K['leather2'], kind='t_strip'))
    for f in boat_faces:
        if f.kind in ('hull', 'cabin', 'trim'):
            faces.append(mirror(f, col=jitter_hex(K['paper3'] if f.kind != 'hull' else K['sepia'], r, 0.06, 0.01), kind='t_sheet',
                                extra={'writing': int(r.integers(1, 1 << 30)), 'rows': 5}))
        elif f.kind == 'window':
            faces.append(mirror(f, col=K['umber'], kind='t_letter'))
        elif f.kind in ('pot', 'plant'):
            faces.append(mirror(f, col=K['sepia2'], kind='t_crown'))
    return faces


# ---------------------------------------------------------------- the waking pages and the stream (the story light)
def set_glow():
    """Under her, at the ring's heart: sheets peeling up off the water, glowing like paper lanterns (their writing
    showing through), and the stream of light winding up the bridge's face to her phone. The stream itself is the
    light bake's (a ribbon of emission); here only the sheets as paper."""
    faces = []
    S = SCENE['source']
    r = seeded('glow')
    # (x, y, z, w, h, tilt (deg, about X: 90 = facing us upright), roll (deg), curl)
    sheets = [
        # lying on the water round the source, just lifting (the reflection turning to paper from the centre out)
        (-0.30, 0.03, 17.05, 0.78, 0.52, 14, -4, 0.06),
        (0.52, 0.03, 16.80, 0.66, 0.46, 18, 9, 0.07),
        (-1.08, 0.04, 16.95, 0.58, 0.40, 16, -12, 0.05),
        (0.10, 0.05, 16.45, 0.62, 0.44, 22, 5, 0.08),
        (-0.62, 0.06, 16.55, 0.50, 0.36, 26, -20, 0.08),
        # peeling up and rising along the stream, smaller as they climb
        (-0.38, 0.22, 17.25, 0.70, 0.46, 46, -6, 0.10),
        (0.40, 0.42, 17.10, 0.56, 0.40, 64, 12, 0.10),
        (-0.86, 0.66, 17.00, 0.46, 0.33, 76, -18, 0.08),
        (0.10, 1.02, 17.05, 0.40, 0.29, 84, 22, 0.12),
        (-0.46, 1.42, 17.15, 0.33, 0.24, 88, -28, 0.10),
        (0.16, 1.86, 17.30, 0.26, 0.19, 88, 30, 0.10),
        (-0.30, 2.30, 17.40, 0.19, 0.14, 88, -16, 0.08),
    ]
    for i, (x, y, z, w, h, tilt, roll, curl) in enumerate(sheets):
        x += S['X'] + 0.25
        t = math.radians(tilt)
        rl = math.radians(roll)
        # the sheet's local corners (u across, v up its face), curled: the far corner lifts toward us
        loc = [(-w / 2, -h / 2), (w / 2, -h / 2), (w / 2, h / 2), (-w / 2, h / 2)]
        pts = []
        for (u, v) in loc:
            uu = u * math.cos(rl) - v * math.sin(rl)
            vv = u * math.sin(rl) + v * math.cos(rl)
            # tilt about X: v runs up (Y) by sin(t) and back (Z) by cos(t)
            px = x + uu
            py = y + vv * math.sin(t)
            pz = z + vv * math.cos(t) - curl * (1 if (u > 0) == (v > 0) else 0)
            pts.append((px, py, pz))
        nrm = np.cross(np.subtract(pts[1], pts[0]), np.subtract(pts[3], pts[0]))
        nrm = nrm / (np.linalg.norm(nrm) + 1e-9)
        if nrm[2] > 0:
            nrm = -nrm
        faces.append(Face('glow', 'page', jitter_hex(K['paper2'], r, 0.04, 0.01), pts=pts, n=tuple(nrm), emit=1.0, name=f'page{i}',
                          extra={'writing': int(r.integers(1, 1 << 30)), 'rows': int(r.integers(5, 9)), 'lantern': 1.0 - 0.08 * i}))
    return faces


# ---------------------------------------------------------------- the water (one surface, under the real street)
def set_water():
    # the whole canal's surface in front of and beyond the bridge, as one face (its opacity is the painter's: the twin
    # shows through it near the waterline and fades into dark water toward us)
    return [Face('water', 'water', K['water'], pts=[(-XW, 0.0, 0.6), (XW, 0.0, 0.6), (XW, 0.0, 600.0), (-XW, 0.0, 600.0)], n=(0, 1, 0), z=900.0, name='canal')]


def build():
    far, houses = set_far()
    bridge = set_bridge()
    rail = set_rail()
    boat = set_boat()
    sets = {'far': far, 'bridge': bridge, 'rail': rail, 'boat': boat, 'trees': set_trees(), 'near': set_near(), 'glow': set_glow(), 'water': set_water()}
    sets['twin'] = set_twin(far, bridge, rail, boat, houses)
    table = []
    fid = 1
    for p in PLANES:
        keep = []
        for f in sets[p]:
            if f.pts is not None and not f.twin and f.kind not in ('vault', 'pier', 'page') and not visible(f):
                continue
            f.id = fid
            fid += 1
            table.append(f)
            keep.append(f)
        sets[p] = keep
    return sets, table


# ---------------------------------------------------------------- rasterize
def screen_poly(f):
    if f.scr is not None:
        return f.scr
    pts = clip_z(f.pts)
    if pts is None:
        return None
    return proj(pts)


def cover(poly, h=H, w=W, pad=2):
    x0 = max(0, int(math.floor(poly[:, 0].min())) - pad)
    x1 = min(w, int(math.ceil(poly[:, 0].max())) + pad)
    y0 = max(0, int(math.floor(poly[:, 1].min())) - pad)
    y1 = min(h, int(math.ceil(poly[:, 1].max())) + pad)
    if x1 <= x0 or y1 <= y0:
        return None, 0, 0
    m = np.zeros((y1 - y0, x1 - x0), np.uint8)
    q = np.round((poly - [x0, y0]) * 4).astype(np.int32)
    cv2.fillPoly(m, [q], 255, cv2.LINE_AA, shift=2)
    return m.astype(np.float32) / 255.0, x0, y0


def rasterize(faces, h=H, w=W):
    """One plane's flat design: rgb (straight), alpha, label (face id at > 50 % coverage, 0 = none). Far faces first."""
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
        c = hexrgb(f.col).astype(np.float32)
        aa = a[sl]
        na = m + aa * (1 - m)
        rgb[sl] = np.where(na[..., None] > 1e-6, (c * m[..., None] + rgb[sl] * (aa * (1 - m))[..., None]) / np.maximum(na[..., None], 1e-6), rgb[sl])
        a[sl] = na
        lab[sl] = np.where(m > 0.5, f.id, lab[sl])
    return rgb, a, lab


# ---------------------------------------------------------------- the idea check: flat + a crude dusk light, phone size
def sky_design(h=H, w=W):
    yy = np.arange(h, dtype=np.float32)[:, None]
    stops = [(0, '#2C2F5C'), (290, '#3E4373'), (600, '#55588A'), (800, '#7E7298'), (930, '#B8909E'), (1060, '#D8A5A0'), (1150, '#DDB0A4')]
    out = np.zeros((h, w, 3), np.float32)
    for (y0, c0), (y1, c1) in zip(stops[:-1], stops[1:]):
        t = np.clip((yy - y0) / (y1 - y0), 0, 1)
        m = (yy >= y0) & (yy <= y1)
        col = hexrgb(c0) * (1 - t[..., None]) + hexrgb(c1) * t[..., None]
        out = np.where(m[..., None], np.broadcast_to(col, (h, w, 3)), out)
    out[1150:] = hexrgb('#DDB0A4')
    return out


def preview(out_dir):
    os.makedirs(out_dir, exist_ok=True)
    sets, table = build()
    img = sky_design()
    src = SCENE['source']
    sp = proj([src['X'], src['Y'], src['Z']])
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    dsrc = np.hypot((xx - sp[0]) / 1.0, (yy - sp[1]) / 1.15)
    glow = np.exp(-(dsrc / 150.0) ** 2)
    for p in PLANES:
        rgb, a, lab = rasterize(sets[p])
        lit = rgb.copy()
        dusk = np.array([0.42, 0.42, 0.62]) if p != 'twin' else np.array([0.26, 0.24, 0.36])
        lit = lit * dusk
        if p == 'water':
            ys = np.arange(H, dtype=np.float32)[:, None]
            op = np.clip((ys - 1260) / 520.0, 0, 1) * 0.75 + 0.12
            a = a * op
        emit = np.zeros(lab.shape, bool)
        for f in sets[p]:
            if f.emit > 0:
                emit |= lab == f.id
        lit[emit] = rgb[emit]
        g = glow[..., None] * (np.array([1.0, 0.72, 0.32]) * (1.6 if p in ('twin', 'glow') else 0.9))
        lit = lit + g * rgb * (2.2 if p in ('twin', 'glow') else 1.0)
        img = lit * a[..., None] + img * (1 - a[..., None])
    # her stand-in at her place, leaning; the stream
    from t01cam import her_screen
    (fx, fy), hp = her_screen()
    sil = np.zeros((H, W), np.uint8)
    body = np.array([[fx - 0.14 * hp, fy], [fx - 0.17 * hp, fy - 0.5 * hp], [fx - 0.05 * hp, fy - 0.78 * hp], [fx + 0.14 * hp, fy - 0.72 * hp],
                     [fx + 0.16 * hp, fy - 0.5 * hp], [fx + 0.12 * hp, fy]])
    cv2.fillPoly(sil, [np.round(body * 4).astype(np.int32)], 255, cv2.LINE_AA, shift=2)
    cv2.ellipse(sil, (int(fx + 0.06 * hp), int(fy - 0.84 * hp)), (int(0.065 * hp), int(0.08 * hp)), 0, 0, 360, 255, -1, cv2.LINE_AA)
    m = sil.astype(np.float32)[..., None] / 255
    img = img * (1 - m) + hexrgb('#231E2A') * m
    pts = []
    phone = (fx + 0.05 * hp, fy - 0.5 * hp)
    for t in np.linspace(0, 1, 60):
        x = sp[0] + (phone[0] - sp[0]) * t + 26 * math.sin(t * 7.0) * (1 - t)
        y = sp[1] + (phone[1] - sp[1]) * t
        pts.append((x, y))
    st = np.zeros((H, W), np.uint8)
    cv2.polylines(st, [np.round(np.array(pts) * 4).astype(np.int32)], False, 255, 16, cv2.LINE_AA, shift=2)
    st = cv2.GaussianBlur(st.astype(np.float32) / 255, (0, 0), 2.5)[..., None]
    img = img + st * np.array([1.0, 0.78, 0.4]) * 0.9
    img = img + glow[..., None] * np.array([0.9, 0.62, 0.25]) * 0.35
    img8 = (np.clip(img, 0, 1) * 255 + 0.5).astype(np.uint8)
    cv2.imwrite(os.path.join(out_dir, 'thumb_full.png'), img8[..., ::-1])
    ph = cv2.resize(img8, (390, 693), interpolation=cv2.INTER_AREA)
    cv2.imwrite(os.path.join(out_dir, 'thumb_phone.png'), ph[..., ::-1])
    gray = cv2.cvtColor(img8, cv2.COLOR_RGB2GRAY)
    small = cv2.resize(gray, (90, 160), interpolation=cv2.INTER_AREA)
    q = np.digitize(small, [70, 140]) * 110 + 20
    cv2.imwrite(os.path.join(out_dir, 'thumb_notan.png'), cv2.resize(q.astype(np.uint8), (390, 693), interpolation=cv2.INTER_NEAREST))
    print('faces', len(table), {p: len(sets[p]) for p in PLANES})


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('--preview', default='')
    a = ap.parse_args()
    if a.preview:
        preview(a.preview)
