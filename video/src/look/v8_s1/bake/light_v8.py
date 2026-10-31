#!/usr/bin/env python3
"""light_v8.py: v8's LIGHT (paint_test/v8_card.md §6; DIRECTION rule 5: one story light done properly). From the painted
planes (paint_v8.py: the material, never lit), the set's labels (design.npz, faces.json) and the movers' parts renders
(her silhouette), it lights every static pixel with ONE rig, composites the lit planes into the TARGET, and solves each
plane's maps (one multiply, one screen: light_s1/bake/solve.py's solve_pair) against the composite of the unlit pieces,
so the browser's blends land on the target (light_proof.md §2.2). The rig:
  the sun      the key and the story light, low at the canal's end (scene.json): direct light by facing with real cast
               shadows on the ground (her feet's long streaks, the bollards, the cafe's umbrellas and the tree's trunk),
               a backlit rim on the crowns and the far roofs, the glitter on the water and a softer path on the wet stones
  the sky      the fill, by facing: the warm west dome toward the sun, the lilac east behind us, the rose-lilac overhead;
               the shade family is the sky's, never grey
  the lobby    the office she leaves, a step under the sun: its interior glowing behind the glass, a warm pool on the
               street in front of it with her soft shadow from it (the door open: brighter there)
  emitters     lit windows, the boat's portholes, the lantern: glowing, a soft bloom at each source only
  reflections  the glass wall mirrors the sunset ahead (its reflection is the picture mirrored about the vanishing
               line); the canal and the wet street mirror the lit world (her too, under her feet), the street's damp
               film rough, its puddles sharp
  the air      far planes toward the horizon's own colour (warm by the sun)
  the paper    light_s1/bake/texture.py's one paper, folded into the target (the band at 30 %)
Deterministic. From video/:
    python3 -B src/look/v8_s1/bake/light_v8.py --bake <scratch>/bake --parts <scratch>/parts [--preview <dir>]"""
from __future__ import annotations

import argparse
import hashlib
import json
import math
import os
import sys
import time

import cv2
import numpy as np
from scipy import ndimage as ndi

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
LIGHT_S1_BAKE = os.path.abspath(os.path.join(HERE, '..', '..', 'light_s1', 'bake'))
if LIGHT_S1_BAKE not in sys.path:
    sys.path.append(LIGHT_S1_BAKE)
import solve as SV  # noqa: E402  (light_s1/bake/solve.py: solve_pair, bbox, write_png, browser_blend)
import texture as TX  # noqa: E402  (light_s1/bake/texture.py: the one paper)
from v8cam import CX, CY, F, H, HC, SCENE, SUN_DIR, SUN_IMG, W, ground_at, proj  # noqa: E402

ROOT = os.path.abspath(os.path.join(HERE, '..'))
PAINT_DIR = os.path.join(ROOT, 'paint')
MAPS_DIR = os.path.join(ROOT, 'maps')
EXT = '.v8map.png'
PLANES = ['sky', 'farcity', 'water', 'far', 'boat', 'mid', 'street', 'building', 'near']
LOB = SCENE['lobby']
XB = SCENE['street']['x0']
YW = SCENE['water']['y']


def lin(c):
    c = np.asarray(c, np.float64)
    return np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)


def srgb(c):
    c = np.clip(np.asarray(c, np.float64), 0, None)
    return np.clip(np.where(c <= 0.0031308, c * 12.92, 1.055 * np.power(c, 1 / 2.4) - 0.055), 0, 1)


def hexlin(h):
    h = h.lstrip('#')
    return lin(np.array([int(h[i:i + 2], 16) for i in (0, 2, 4)], np.float64) / 255.0)


def gblur(img, s):
    if s <= 0:
        return img
    if img.ndim == 2:
        return cv2.GaussianBlur(img.astype(np.float32), (0, 0), s).astype(np.float64)
    return np.dstack([cv2.GaussianBlur(np.ascontiguousarray(img[..., c]).astype(np.float32), (0, 0), s) for c in range(img.shape[2])]).astype(np.float64)


def smoothstep(a, b, x):
    t = np.clip((x - a) / (b - a), 0, 1)
    return t * t * (3 - 2 * t)


# ---------------------------------------------------------------- the rig (linear light)
RIG = dict(
    sun=hexlin('#FFD29A') * 2.35,           # the low sun: gold
    sky_up=hexlin('#D8C3D6') * 0.80,        # the dome overhead: rose-lilac
    sky_west=hexlin('#F7D4B9') * 0.86,      # toward the sun
    sky_east=hexlin('#BDB3D6') * 0.58,      # behind us: lilac
    bounce=hexlin('#D9AA94') * 0.22,        # the warm ground
    lobby=hexlin('#FFD9A8') * 1.05,         # the lobby's lamps, into the street
    emit=1.55,                               # a lit window's gain over its colour
    rim=hexlin('#FFD7A0') * 1.6,            # the backlit rim on crowns and far roofs
)


def ambient(N):
    up = np.clip(N[..., 1], 0, 1)[..., None]
    down = np.clip(-N[..., 1], 0, 1)[..., None]
    side = (1 - np.abs(N[..., 1]))[..., None]
    fz = N[..., 2][..., None]
    mid = (RIG['sky_west'] + RIG['sky_east']) * 0.5
    side_col = np.where(fz > 0, mid + (RIG['sky_west'] - mid) * fz, mid + (RIG['sky_east'] - mid) * (-fz))
    return RIG['sky_up'] * up + side_col * side * 0.9 + RIG['bounce'] * down


# ---------------------------------------------------------------- inputs
def load_piece(name, rows):
    """A plane's painted piece as a full-frame RGBA (straight), or None."""
    r = rows.get(name)
    if not r:
        return None
    im = cv2.imread(os.path.join(PAINT_DIR, r['file']), cv2.IMREAD_UNCHANGED)
    x, y, w, h = r['box']
    out = np.zeros((H, W, 4), np.float64)
    sub = im[..., [2, 1, 0, 3]].astype(np.float64) / 255.0
    hh, ww = min(h, H - y, sub.shape[0]), min(w, W - x, sub.shape[1])
    out[y:y + hh, x:x + ww] = sub[:hh, :ww]
    return out


def two_slab(parts, name):
    k = cv2.imread(os.path.join(parts, f'{name}_k.png'))[..., ::-1].astype(np.float64) / 255.0
    w = cv2.imread(os.path.join(parts, f'{name}_w.png'))[..., ::-1].astype(np.float64) / 255.0
    a = np.clip(1 - (w - k).mean(2), 0, 1)
    col = np.where(a[..., None] > 0.02, np.clip(k / np.maximum(a[..., None], 1e-3), 0, 1), 0)
    return col, a


KINDS = ['', 'ground', 'kerb', 'kerbface', 'wall', 'window', 'roof', 'crown', 'trunk', 'canopy', 'iron', 'table', 'lamp',
         'lobby', 'lobbyglass', 'doorglass', 'glass', 'slab', 'mullion', 'fascia', 'pier', 'plant', 'officewin', 'farcity',
         'water', 'trim', 'archhole']
KID = {k: i for i, k in enumerate(KINDS)}


def isk(kind, *names):
    return np.isin(kind, [KID[n] for n in names])


def geometry(lab, faces):
    """Per pixel of a plane: the 3D point, the normal, the face's kind (KINDS code) and emission (from its label)."""
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float64)
    rx, ry = (xx - CX) / F, -(yy - CY) / F
    P = np.zeros((H, W, 3))
    N = np.zeros((H, W, 3))
    N[..., 2] = -1
    kind = np.zeros((H, W), np.int16)
    emit = np.zeros((H, W))
    for fid in np.unique(lab[lab > 0]):
        f = faces[str(int(fid))]
        m = lab == fid
        n = np.array(f['n'])
        if f['billboard'] or f['p0'] is None:
            Z = float(f['z'])
            P[m, 0] = rx[m] * Z
            P[m, 1] = HC + ry[m] * Z
            P[m, 2] = Z
        else:
            p0 = np.array(f['p0'])
            den = n[0] * rx[m] + n[1] * ry[m] + n[2]
            t = (np.dot(n, p0) - n[1] * HC) / np.where(np.abs(den) < 1e-6, 1e-6, den)
            P[m, 0] = t * rx[m]
            P[m, 1] = HC + t * ry[m]
            P[m, 2] = t
        N[m] = n
        kind[m] = KID.get(f['kind'], 0)
        emit[m] = f['emit']
    return P, N, kind, emit


def crown_normals(lab, faces, N, kind):
    """A tree's crown read as a soft ball: the normal tips toward the outline near the edge (so its sun-facing edge
    catches the backlight), facing us inside."""
    crowns = kind == KID['crown']
    if not crowns.any():
        return N, np.zeros(lab.shape)
    m = crowns.astype(np.uint8)
    d = ndi.distance_transform_edt(m)
    sm = gblur(m.astype(np.float64), 3.0)
    gx, gy = -ndi.sobel(sm, 1), -ndi.sobel(sm, 0)
    g = np.hypot(gx, gy) + 1e-9
    R = 14.0
    s = np.clip(1 - d / R, 0, 1)
    N2 = N.copy()
    N2[crowns, 0] = (gx / g * s)[crowns]
    N2[crowns, 1] = (-gy / g * s)[crowns]
    N2[crowns, 2] = -np.sqrt(np.clip(1 - s ** 2, 0, 1))[crowns]
    return N2, np.where(crowns, s, 0)


# ---------------------------------------------------------------- shadows on the ground (the sun's)
def ground_shadow_from_points(Pts, Y0=0.0, splat=2):
    """Each 3D point's shadow on the plane Y = Y0 along the sun, splatted into a mask."""
    Lx, Ly, Lz = SUN_DIR
    t = (Pts[:, 1] - Y0) / Ly
    G = np.stack([Pts[:, 0] - t * Lx, np.full(len(Pts), Y0), Pts[:, 2] - t * Lz], -1)
    ok = G[:, 2] > 0.5
    s = proj(G[ok])
    m = np.zeros((H, W), np.float32)
    xi, yi = np.round(s[:, 0]).astype(int), np.round(s[:, 1]).astype(int)
    good = (xi >= 0) & (xi < W) & (yi >= 0) & (yi < H)
    m[yi[good], xi[good]] = 1
    if splat:
        m = cv2.dilate(m, np.ones((2 * splat + 1, 2 * splat + 1), np.uint8))
        m = cv2.erode(m, np.ones((max(1, splat), max(1, splat)), np.uint8))
    return m


def plane_shadows(Pmap, amap, kinds_cast):
    """Casters of a plane: every covered pixel with a height, its 3D point -> its sun shadow on the ground."""
    m = (amap > 0.5) & kinds_cast & (Pmap[..., 1] > 0.02)
    if not m.any():
        return np.zeros((H, W), np.float32)
    return ground_shadow_from_points(Pmap[m][::1])


# ---------------------------------------------------------------- the lobby's light on the street
def lobby_pool(X, Z, her_cut=None):
    """Irradiance on the ground from the lobby's glass wall (X = XB, Z in [z0 - 3, z1], Y in [0, top]) and its open door
    (brighter): a small sum over the wall, cos at both ends, 1 / d^2."""
    z0, z1, top = LOB['z0'] - 3, LOB['z1'], LOB['top']
    dz0, dz1 = LOB['door']
    E = np.zeros_like(X)
    zs = np.linspace(z0 + 0.3, z1 - 0.3, 12)
    ys = np.linspace(0.4, top - 0.4, 5)
    dA = (z1 - z0) / 12 * top / 5
    for zz in zs:
        I = 2.4 if dz0 <= zz <= dz1 else 1.0
        for yv in ys:
            dx = X - XB
            dzz = Z - zz
            d2 = dx ** 2 + dzz ** 2 + yv ** 2
            cos_w = np.clip(dx / np.sqrt(d2), 0, 1)
            cos_g = yv / np.sqrt(d2)
            E += I * cos_w * cos_g / d2 * dA
    E = E * (X > XB)
    if her_cut is not None:
        E = E * (1 - her_cut)
    return E


# ---------------------------------------------------------------- reflections
def mirror_splat(cols, P, valid, Ym, zbuf_init=None):
    """Forward-map the lit scene's pixels into a horizontal mirror at height Ym (each point (X, Y, Z) appears at
    (X, 2 Ym - Y, Z)): returns (colour, coverage, depth) buffers; the nearest wins."""
    ys, xs = np.nonzero(valid)
    Pv = P[ys, xs]
    keep = Pv[:, 2] > 0.3
    ys, xs, Pv = ys[keep], xs[keep], Pv[keep]
    Ym2 = 2 * Ym - Pv[:, 1]
    yd = CY - F * (Ym2 - HC) / Pv[:, 2]
    yi = np.round(yd).astype(int)
    good = (yi >= 0) & (yi < H) & (Pv[:, 2] > 0.3)
    ys, xs, yi, Z = ys[good], xs[good], yi[good], Pv[good, 2]
    c = cols[ys, xs]
    order = np.argsort(Z, kind='stable')
    flat = yi[order] * W + xs[order]
    _, first = np.unique(flat, return_index=True)
    sel = order[first]
    out = np.zeros((H, W, 3))
    cov = np.zeros((H, W))
    dep = np.full((H, W), np.inf)
    out[yi[sel], xs[sel]] = c[sel]
    cov[yi[sel], xs[sel]] = 1
    dep[yi[sel], xs[sel]] = Z[sel]
    # fill the 1-2 px gaps of the forward map (from above in each column)
    for _ in range(3):
        hole = cov < 0.5
        up = np.roll(out, 1, 0)
        upc = np.roll(cov, 1, 0)
        upd = np.roll(dep, 1, 0)
        fill = hole & (upc > 0.5)
        out[fill] = up[fill]
        cov[fill] = 1
        dep[fill] = upd[fill]
    return out, cov, dep


def sky_mirror(sky_lin, Ym=0.0):
    """The sky's own mirror about the horizon (points at infinity), for every pixel below it."""
    yy = np.arange(H)
    src = np.clip(np.round(2 * CY - yy).astype(int), 0, sky_lin.shape[0] - 1)
    return sky_lin[src]


# ---------------------------------------------------------------- main
def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--bake', required=True, help="paint_v8.py's --out (design.npz, faces.json, wet maps)")
    ap.add_argument('--parts', required=True, help='the movers alone (her_k/w.png, cafe_k/w.png, pip_k/w.png)')
    ap.add_argument('--preview', default='')
    ap.add_argument('--paper', action='store_true')
    a = ap.parse_args()
    t0 = time.time()
    rows = json.load(open(os.path.join(PAINT_DIR, 'pieces.json')))
    faces = json.load(open(os.path.join(a.bake, 'faces.json')))
    dz = np.load(os.path.join(a.bake, 'design.npz'))
    pieces = {p: load_piece(p, rows) for p in PLANES}
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float64)

    # ---- the base: the unlit pieces composited (what the browser draws under the maps)
    base = np.zeros((H, W, 3))
    car = np.full((H, W), -1, np.int16)
    for i, p in enumerate(PLANES):
        pc = pieces[p]
        if pc is None:
            continue
        al = pc[..., 3:4]
        base = pc[..., :3] * al + base * (1 - al)
        car[pc[..., 3] > 1.5 / 255] = i

    # ---- her (parts render): her shadows and her reflection by BACKWARD maps (each ground pixel looks up the point of
    # her silhouette, a billboard at her depth, that shades or mirrors it: no gaps, no ladder)
    her_col, her_a = two_slab(a.parts, 'her')
    hz = SCENE['her']['Z']
    her_P = np.stack([(xx - CX) / F * hz, HC - (yy - CY) / F * hz, np.full((H, W), hz)], -1)
    below = yy > CY + 1
    Xg, Zg = ground_at(xx, np.maximum(yy, CY + 1))
    # the sun: from the ground point toward the sun to her plane
    Lx, Ly, Lz = SUN_DIR
    s_ = (hz - Zg) / Lz
    qx, qy = Xg + s_ * Lx, s_ * Ly
    q = proj(np.stack([qx, qy, np.full_like(qx, hz)], -1))
    her_sh = cv2.remap(her_a.astype(np.float32), q[..., 0].astype(np.float32), q[..., 1].astype(np.float32), cv2.INTER_LINEAR, borderValue=0)
    her_sh = np.where(below & (Zg < hz) & (s_ > 0), her_sh, 0).astype(np.float64)
    her_sh = gblur(her_sh, 0.8 + 0.0)
    # the lobby (a soft source at the door's middle, 1.4 m up): the ray from the source through the ground point's
    # opposite... the line from the ground point toward the source meets her plane
    Ld = np.array([XB, 1.4, (LOB['door'][0] + LOB['door'][1]) / 2])
    tl = (hz - Zg) / (Ld[2] - Zg + 1e-9)
    lx, ly = Xg + tl * (Ld[0] - Xg), tl * Ld[1]
    ql = proj(np.stack([lx, ly, np.full_like(lx, hz)], -1))
    her_lob = cv2.remap(her_a.astype(np.float32), ql[..., 0].astype(np.float32), ql[..., 1].astype(np.float32), cv2.INTER_LINEAR, borderValue=0)
    her_lob = np.where(below & (tl > 0) & (tl < 1) & (Xg > Ld[0]), her_lob, 0).astype(np.float64)
    her_lob = np.clip(gblur(her_lob, 10.0) * 1.2, 0, 1)
    # her mirror in the wet ground: the flip about her feet line
    feet_y = CY + F * HC / hz
    my = (2 * feet_y - yy).astype(np.float32)
    her_m_a = cv2.remap(her_a.astype(np.float32), xx.astype(np.float32), my, cv2.INTER_LINEAR, borderValue=0).astype(np.float64)
    her_m_c = np.dstack([cv2.remap(np.ascontiguousarray(her_col[..., c]).astype(np.float32), xx.astype(np.float32), my, cv2.INTER_LINEAR, borderValue=0) for c in range(3)]).astype(np.float64)
    her_m_a = np.where(yy > feet_y - 2, her_m_a, 0)

    # ---- light each plane
    lit = {}
    geo = {}
    sky_pc = pieces['sky']
    sky_lin = lin(sky_pc[..., :3])
    # the sun's bloom in the sky (the disc's own glow, gentle) is added at the end with the other sources
    lit['sky'] = sky_lin.copy()
    shadows = np.zeros((H, W), np.float32)
    for p in PLANES[1:]:
        pc = pieces[p]
        if pc is None:
            continue
        lab = dz[f'{p}_lab']
        P, N, kind, emit = geometry(lab, faces)
        N, crown_s = crown_normals(lab, faces, N, kind)
        geo[p] = (P, N, kind, emit, crown_s)
        casters = isk(kind, 'iron', 'canopy', 'table', 'trunk')
        if p in ('mid', 'street'):
            shadows = np.maximum(shadows, plane_shadows(P, dz[f'{p}_a'], casters))
    shadows = np.maximum(shadows, (her_sh * 0.92).astype(np.float32))
    shadows = gblur(shadows.astype(np.float64), 1.0)

    L = SUN_DIR
    for p in PLANES[1:]:
        pc = pieces[p]
        if pc is None:
            continue
        P, N, kind, emit, crown_s = geo[p]
        M = lin(pc[..., :3])
        ndl = np.clip((N * L).sum(-1), 0, 1)
        ground = isk(kind, 'ground', 'kerb')
        vis = 1 - np.where(ground, shadows, 0)
        sun_k = np.where(ground, 2.3, 1.0)
        E = ambient(N) + RIG['sun'] * (ndl * vis * sun_k)[..., None]
        if p in ('street', 'mid'):
            Xg, Zg = P[..., 0], P[..., 2]
            pool = lobby_pool(Xg, Zg, her_cut=her_lob * 0.65) * ground
            E = E + RIG['lobby'] * pool[..., None] * 1.25
        out = M * E
        # crowns: backlit, their sun-facing edge rimmed and the thin leaves glowing through
        if (kind == KID['crown']).any():
            dx_, dy_ = SUN_IMG[0] - xx, SUN_IMG[1] - yy
            dn = np.hypot(dx_, dy_) + 1e-6
            nimg = np.stack([N[..., 0], -N[..., 1]], -1)
            face_sun = np.clip((nimg[..., 0] * dx_ + nimg[..., 1] * dy_) / dn, 0, 1)
            cr = kind == KID['crown']
            rim = (crown_s ** 2.2) * face_sun * cr
            glow = (0.3 + 0.5 * crown_s ** 1.5) * cr
            warm = hexlin('#FFB37A')
            out = out * np.where(cr, 0.92, 1.0)[..., None] + M * RIG['rim'][None, None] * (rim * 1.5)[..., None] + M * warm * (glow * 0.85)[..., None]
        # the cafe's umbrellas: backlit canvas, the sun glowing through it
        cano = kind == KID['canopy']
        if cano.any():
            out = np.where(cano[..., None], out + M * RIG['rim'] * 0.55, out)
        # far roofs and tops: a thin backlit rim on edges facing up and toward the sun (C: thin, by tier)
        if p in ('far', 'farcity', 'boat'):
            al = (pc[..., 3] > 0.5).astype(np.float64)
            edge_up = np.clip(al - np.roll(al, 2, 0), 0, 1)
            edge_up = gblur(edge_up, 0.7)
            k = 0.55 if p == 'boat' else 0.35
            out = out + RIG['rim'] * edge_up[..., None] * k * (1 - (kind == KID['window'])[..., None])
        # emitters: lit windows, the lobby, lamps, portholes, the lantern
        em = emit > 0
        if em.any():
            gain = np.where(kind == KID['lobby'], 0.92, np.where(kind == KID['lamp'], 1.9, np.where(kind == KID['officewin'], 0.85, RIG['emit'])))
            out = np.where(em[..., None], M * (gain * np.maximum(emit, 0.5))[..., None], out)
        # unlit windows: dark glass reflecting the sky a little
        dw = (kind == KID['window']) & ~em
        if dw.any():
            out = np.where(dw[..., None], out * 0.72, out)
        lit[p] = out
        geo[p] = (P, N, kind, emit, crown_s)

    # ---- the glass wall mirrors the picture ahead (about the vanishing column), tinted, at a grazing angle
    P, N, kind, emit, _ = geo['building']
    far_comp = lit['sky'].copy()
    for p in ('farcity', 'far', 'water', 'boat', 'mid'):
        if pieces[p] is not None:
            al = pieces[p][..., 3:4]
            far_comp = lit[p] * al + far_comp * (1 - al)
    mx = np.clip(np.round(2 * CX - xx).astype(int), 0, W - 1)
    refl = far_comp[yy.astype(int), mx]
    gl = isk(kind, 'glass')
    tint = hexlin('#8F86AE')
    lit['building'] = np.where(gl[..., None], lit['building'] * 0.5 + refl * tint * 0.62, lit['building'])
    # the lobby's glass (its film's coverage from the design): the sky's reflection grows above the door's head (where
    # the view grazes the glass against the bright sky), the warm interior shows at people height; the open door has
    # no glass, so the lobby shows through it warmest
    film = dz['building_film'].astype(np.float64)
    rx_, ry_ = (xx - CX) / F, -(yy - CY) / F
    yg = HC + (XB / np.where(np.abs(rx_) < 1e-6, -1e-6, rx_)) * ry_
    wr = (0.3 + 0.5 * smoothstep(LOB['door_h'] - 0.2, LOB['door_h'] + 0.35, yg)) * film
    lit['building'] = lit['building'] * (1 - wr)[..., None] + refl * tint * (wr * 1.1)[..., None]
    lobby_k = isk(kind, 'lobby')
    door_open = lobby_k & (film < 0.1) & (yg < LOB['door_h'])
    lit['building'] = np.where(door_open[..., None], lit['building'] * 1.5 + RIG['lobby'] * 0.06, lit['building'])
    dg = isk(kind, 'doorglass')
    lit['building'] = np.where(dg[..., None], lit['building'] * 0.55 + refl * tint * 0.42, lit['building'])

    # ---- the lit composite without the reflecting surfaces' mirror (for the reflections' sources)
    def composite(planes, override=None):
        c = lit['sky'].copy()
        for p in planes:
            if pieces[p] is None:
                continue
            src = override[p] if override and p in override else lit[p]
            al = pieces[p][..., 3:4]
            c = src * al + c * (1 - al)
        return c

    # her, lit roughly as the engine does (her backlit shade): for her reflection
    her_lit = lin(her_col) * (0.5 + 0.5 * hexlin('#C6B0CC')) * 0.95

    # ---- the canal: the mirror at the water's level (the far bank, the boat, the sky, her if she reached it)
    src_cols = np.zeros((H, W, 3))
    src_P = np.zeros((H, W, 3))
    src_ok = np.zeros((H, W), bool)
    for p in ('farcity', 'far', 'boat', 'mid', 'building'):
        if pieces[p] is None:
            continue
        Pp, Np, kp, ep, _ = geo[p]
        m = (pieces[p][..., 3] > 0.5) & ~isk(kp, 'ground', 'kerb', 'water')
        src_cols[m] = lit[p][m]
        src_P[m] = Pp[m]
        src_ok |= m
    Rw, cw, _ = mirror_splat(src_cols, src_P, src_ok & (src_P[..., 1] > YW), YW)
    skyw = sky_mirror(sky_lin)
    Rw = np.where(cw[..., None] > 0.5, Rw, skyw)
    # ripples: rows wobbled sideways, a soft vertical drag
    wob = (np.sin(yy[:, :1] * 0.9) * 1.6 + np.sin(yy[:, :1] * 0.31 + 1.3) * 2.4) * np.clip((yy[:, :1] - CY) / 300, 0.2, 1.5)
    mapx = (xx + wob).astype(np.float32)
    Rw = np.dstack([cv2.remap(np.ascontiguousarray(Rw[..., c]).astype(np.float32), mapx, yy.astype(np.float32), cv2.INTER_LINEAR) for c in range(3)]).astype(np.float64)
    Rw = gblur(Rw, 0.8)
    Rw = np.dstack([ndi.uniform_filter1d(Rw[..., c], 5, axis=0) for c in range(3)])
    P, N, kind, emit, _ = geo['water']
    wm = pieces['water'][..., 3] > 0.01
    fres = np.clip(0.62 + 0.3 * smoothstep(1500, CY, yy), 0, 0.92)
    body = lit['water']
    mat_L = lin(pieces['water'][..., :3]).mean(-1)
    rip = mat_L - gblur(mat_L, 3.0)
    water = body * (1 - fres[..., None]) * 0.9 + Rw * fres[..., None] * hexlin('#E8D2DE') * 1.02
    water = water * (1 + np.clip(rip, -0.08, 0.08)[..., None] * 4.0)
    # the sun's glitter: below the disc, a path of bright slivers that widens toward us
    wpath = 14 + (yy - CY) * 0.10
    inpath = np.exp(-((xx - SUN_IMG[0]) / np.maximum(wpath, 1)) ** 2)
    spark = np.clip((rip - 0.004) * 60, 0, 1) * inpath
    water = water + RIG['sun'] * 0.55 * spark[..., None] + RIG['sun'] * 0.07 * inpath[..., None] * smoothstep(CY, CY + 120, yy)[..., None]
    lit['water'] = np.where(wm[..., None], water, lit['water'])

    # ---- the wet street: the mirror at the ground (rough in the damp, sharp in the puddles), her under her feet
    Rg, cg, _ = mirror_splat(src_cols, src_P, src_ok & (src_P[..., 1] > 0.0), 0.0)
    Rg = np.where(cg[..., None] > 0.5, Rg, skyw)
    her_m_lit = lin(her_m_c) * (0.5 + 0.5 * hexlin('#C6B0CC')) * 0.95
    Rg = her_m_lit * her_m_a[..., None] + Rg * (1 - her_m_a[..., None])
    Rg_rough = gblur(Rg, 5.0)
    Rg_rough = np.dstack([ndi.uniform_filter1d(Rg_rough[..., c], 21, axis=0) for c in range(3)])
    Rg_sharp = gblur(Rg, 1.6)
    for p in ('street', 'mid', 'far'):
        if pieces[p] is None:
            continue
        wf = os.path.join(a.bake, f'wet_{p}.npz')
        if not os.path.exists(wf):
            continue
        w = np.load(wf)
        wet, pud = w['wet'].astype(np.float64), w['pud'].astype(np.float64)
        _, _, kind, _, _ = geo[p]
        gmask = isk(kind, 'ground', 'kerb')
        k_damp = 0.30 if p == 'street' else 0.24
        spec = (Rg_rough * (wet * (1 - pud))[..., None] * k_damp + Rg_sharp * pud[..., None] * 0.52)
        diff = lit[p] * (1 - (wet * 0.30 + pud * 0.42))[..., None]
        # the sun's softer path on the wet stones (no single disc: the stones are rough)
        spath = np.exp(-((xx - SUN_IMG[0]) / np.maximum(30 + (yy - CY) * 0.35, 1)) ** 2) * smoothstep(CY, CY + 200, yy)
        sun_wet = RIG['sun'] * (0.10 * wet + 0.35 * pud)[..., None] * spath[..., None]
        out = diff + spec + sun_wet
        lit[p] = np.where(gmask[..., None], out, lit[p])

    # ---- the air: the far planes toward the horizon's own colour (warm by the sun)
    air_row = gblur(lit['sky'], 12.0)[int(CY - 60)]
    air = np.broadcast_to(air_row[None, :, :], (H, W, 3))
    for p in ('farcity', 'far', 'boat'):
        if pieces[p] is None:
            continue
        P, N, kind, emit, _ = geo[p]
        if p == 'farcity':
            hz = np.full((H, W), 0.62)
        else:
            dist = np.linalg.norm(P - np.array([0, HC, 0]), axis=-1)
            hz = np.clip(1 - np.exp(-dist / 520.0), 0, 0.55) * 0.9
            hz = np.where(emit > 0, hz * 0.5, hz)
        lit[p] = lit[p] * (1 - hz)[..., None] + air * hz[..., None]

    # ---- the target: the lit planes composited; bloom at the sources; the paper
    T = composite(PLANES[1:])
    src = np.zeros((H, W, 3))
    sunm = np.hypot(xx - SUN_IMG[0], yy - SUN_IMG[1]) < 23
    src[sunm] = lit['sky'][sunm] * 0.9
    for p in ('far', 'boat', 'mid', 'building'):
        if pieces[p] is None:
            continue
        _, _, kind, emit, _ = geo[p]
        m = (emit > 0) & (pieces[p][..., 3] > 0.5)
        k = 0.55 if p == 'building' else 0.4
        src[m] = np.maximum(src[m], lit[p][m] * k)
    bloom = gblur(src, 6.0) * 0.32 + gblur(src, 24.0) * 0.30 + gblur(src, 70.0) * 0.22
    T = T + bloom
    # the lobby's warm air at the door (a source's own glow, never on a lit surface): a soft spill out of the opening
    dmid = proj([XB, 1.3, (LOB['door'][0] + LOB['door'][1]) / 2])
    spill = np.exp(-(((xx - dmid[0]) / 120.0) ** 2 + ((yy - dmid[1]) / 260.0) ** 2)) * (xx > dmid[0] - 60)
    T = T + RIG['lobby'] * 0.10 * spill[..., None]
    Ts = srgb(T)
    if a.paper:
        Ts = TX.grain_static(Ts.astype(np.float32), None).astype(np.float64)
    t_light = time.time() - t0

    # ---- solve each plane's maps against the base (light_proof.md §2.2), only where that plane carries the pixel
    os.makedirs(MAPS_DIR, exist_ok=True)
    for f in os.listdir(MAPS_DIR):
        if f.endswith(EXT):
            os.remove(os.path.join(MAPS_DIR, f))
    comp = base.copy()
    out_rows = {}
    for i, p in enumerate(PLANES):
        m = car == i
        if not m.any():
            continue
        Mq, S_ = SV.solve_pair(base.astype(np.float32), Ts.astype(np.float32), m, f'v8/{p}')
        S8 = np.round(S_ * 255) / 255
        comp[m] = SV.browser_blend(base, Mq, S8)[m]
        maps = []
        bm = SV.bbox((Mq < 1).any(-1))
        if bm:
            x, y, w, h = bm
            fn = f'{p}_mul{EXT}'
            SV.write_png(os.path.join(MAPS_DIR, fn), Mq[y:y + h, x:x + w])
            maps.append(dict(file=fn, box=[x, y, w, h], blend='multiply'))
        bs = SV.bbox((S8 > 0).any(-1))
        if bs:
            x, y, w, h = bs
            fn = f'{p}_scr{EXT}'
            SV.write_png(os.path.join(MAPS_DIR, fn), S8[y:y + h, x:x + w])
            maps.append(dict(file=fn, box=[x, y, w, h], blend='screen'))
        if maps:
            out_rows[p] = maps
    # the live inputs: the lit lobby behind her, blurred (her wrap), and the paper's tile
    live = {}
    x0, y0, w0, h0 = 0, 780, 920, 960
    wrap = gblur(T[y0:y0 + h0, x0:x0 + w0], 14.0)
    SV.write_png(os.path.join(MAPS_DIR, f'wrap{EXT}'), srgb(wrap))
    live['wrap'] = dict(file=f'wrap{EXT}', box=[x0, y0, w0, min(h0, H - y0)])
    tile, size = TX.grain_tile()
    SV.write_png(os.path.join(MAPS_DIR, f'grain{EXT}'), tile)
    live['grain'] = dict(file=f'grain{EXT}', size=size)
    write_ts(out_rows, live)
    err = np.abs(comp - Ts)
    print(json.dumps({'light_s': round(t_light, 1), 'total_s': round(time.time() - t0, 1), 'maps': sum(len(v) for v in out_rows.values()),
                      'solve_max_code': float(np.round(err[car >= 0].max() * 255, 2))}))
    if a.preview:
        os.makedirs(a.preview, exist_ok=True)
        cv2.imwrite(os.path.join(a.preview, 'target.png'), (np.clip(Ts, 0, 1) * 255 + 0.5).astype(np.uint8)[..., ::-1])
        cv2.imwrite(os.path.join(a.preview, 'base.png'), (np.clip(base, 0, 1) * 255 + 0.5).astype(np.uint8)[..., ::-1])
        prev = Ts * (1 - her_a[..., None]) + her_col * her_a[..., None]
        cv2.imwrite(os.path.join(a.preview, 'target_her.png'), (np.clip(prev, 0, 1) * 255 + 0.5).astype(np.uint8)[..., ::-1])


def write_ts(rows, live):
    lines = ["// GENERATED by src/look/v8_s1/bake/light_v8.py (the light bake; paint_test/NOTES.md \"v8\"): each plane's baked light",
             "// maps (one multiply, one screen) and the movers' live inputs. Do not edit by hand; rerun the bake.",
             "import type {MapSet} from './context';"]
    imps, body = [], ['', 'export const MAPS_V8: MapSet = {', '  slots: {']
    for p in PLANES:
        rr = rows.get(p)
        if not rr:
            continue
        items = []
        for r in rr:
            v = 'm_' + r['file'].replace(EXT, '')
            imps.append(f"import {v} from './maps/{r['file']}';")
            items.append(f"{{src: {v}, box: [{', '.join(str(int(x)) for x in r['box'])}], blend: '{r['blend']}'}}")
        body.append(f"    {p}: [{', '.join(items)}],")
    body.append('  },')
    lv = []
    if 'wrap' in live:
        imps.append(f"import m_wrap from './maps/{live['wrap']['file']}';")
        lv.append(f"wrap: {{src: m_wrap, box: [{', '.join(str(int(x)) for x in live['wrap']['box'])}]}}")
    if 'grain' in live:
        imps.append(f"import m_grain from './maps/{live['grain']['file']}';")
        lv.append(f"grain: {{src: m_grain, size: {live['grain']['size']}}}")
    body.append(f"  live: {{{', '.join(lv)}}},")
    body.append('};')
    open(os.path.join(ROOT, 'maps_v8.ts'), 'w').write('\n'.join(lines + imps + body) + '\n')


if __name__ == '__main__':
    main()
