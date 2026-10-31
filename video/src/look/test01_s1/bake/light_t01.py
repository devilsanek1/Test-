#!/usr/bin/env python3
"""light_t01.py: the hero frame's LIGHT (docs/tests/process_test_01_amsterdam/CARD.md §6; the playbook's PROPER LIGHT:
one story light done properly; after src/look/v8_s1/bake/light_v8.py, never editing it). From the painted planes
(paint_t01.py: the material, never lit), the set's labels (design.npz, faces.json) and the movers' parts render (the
stream's end = her phone), it lights every static pixel with ONE rig, composites the lit planes into the TARGET, and
solves each plane's maps (one multiply, one screen: light_s1/bake/solve.py's solve_pair) against the composite of the
unlit pieces, so the browser's blends land on the target. The rig, felt first ("a candle in a dark room": a hushed,
glowing doorway into the city's past):
  the story light  ONE source, candle gold: the waking pages at the waterline under her (a soft area light with real
                   falloff), the stream of light climbing the bridge's face (a line of small lights) and her phone at
                   its end. It lights the vault's underside like a lantern in a cave, the arch's stones and the bricks
                   along the stream, the coping and the railing by her hands; nothing far from it
  the blue hour    the fill, by facing: the violet dome overhead, the darker east behind us on every face that looks
                   at us (the bridge's face sits in a cool shade), the afterglow's rose down the canal on what faces it
                   (a thin warm rim on the far roofs and gables), the dark water's bounce from below
  the lamp, the windows   warm, a clear step under the story light: emitting, a small pool at the lamp
  the paper twin   seen through the water: dark and cool, its paper just readable as paper; around the source it WAKES
                   (the sheets glow like paper lanterns with their writing showing through), the light filling the
                   ring from inside and dying off into the dark twin that runs on through it
  the water        the canal's dark body over the twin, the story light's gold path on its ripples toward us
  the air          far planes toward the low sky's own colour; bloom only at sources; the paper over all of it
Deterministic. From video/:
    python3 -B src/look/test01_s1/bake/light_t01.py --bake <scratch>/bake --parts <scratch>/parts [--preview <dir>]"""
from __future__ import annotations

import argparse
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
from t01cam import BAND, BR, CX, CY, F, GLOW_IMG, H, HC, SCENE, W, proj  # noqa: E402

ROOT = os.path.abspath(os.path.join(HERE, '..'))
PAINT_DIR = os.path.join(ROOT, 'paint')
MAPS_DIR = os.path.join(ROOT, 'maps')
EXT = '.t01map.png'
PLANES = ['sky', 'twin', 'water', 'far', 'bridge', 'boat', 'rail', 'glow', 'trees', 'near']
CAM = np.array([0.0, HC, 0.0])


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


# ---------------------------------------------------------------- the rig (linear light; by eye, for the feeling)
RIG = dict(
    sky_up=hexlin('#B8B2E2') * 0.50,         # the violet dome overhead
    sky_east=hexlin('#8A8FC6') * 0.30,       # behind us: the darker east (every face that looks at us)
    sky_west=hexlin('#E9BDB5') * 0.46,       # down the canal: the afterglow's rose
    bounce=hexlin('#40406A') * 0.10,         # the dark water below
    gold=hexlin('#FFC676'),                  # the story light's colour (candle gold)
    src_power=6.5,                           # the waking pages (an area light)
    src_r0=0.7,                             # its softness (m): real falloff past it
    stream_power=1.6,                        # the stream's small lights, all together
    stream_r0=0.30,
    phone_power=0.9,
    patch_power=3.2,                         # the lit pages on the water, as one broad patch
    patch_r0=1.9,
    phone_r0=0.30,
    lamp=hexlin('#FFD9A6'),
    lamp_power=1.3,
    lamp_r0=0.7,
    emit_window=1.25,                        # a lit window's gain over its colour
    emit_lantern=1.7,
    rim=hexlin('#F4C9B4') * 0.9,             # the afterglow's rim on far roofs and gables
)


def ambient(N):
    """The blue hour by facing: the dome above, the afterglow (+Z) or the east (-Z) on the sides, the water below."""
    up = np.clip(N[..., 1], 0, 1)[..., None]
    down = np.clip(-N[..., 1], 0, 1)[..., None]
    side = (1 - np.abs(N[..., 1]))[..., None]
    fz = N[..., 2][..., None]
    mid = (RIG['sky_west'] + RIG['sky_east']) * 0.5
    side_col = np.where(fz > 0, mid + (RIG['sky_west'] - mid) * fz, mid + (RIG['sky_east'] - mid) * (-fz))
    return RIG['sky_up'] * up + side_col * side + RIG['bounce'] * down


def point_light(P, N, L0, power, r0, wrap=0.3):
    """A soft point light at L0 (world m): wrapped Lambert x a falloff 1 / (1 + (d / r0)^2) (real, never linear)."""
    d = L0[None, None, :] - P
    dist = np.linalg.norm(d, axis=-1) + 1e-6
    l = d / dist[..., None]
    ndl = (N * l).sum(-1)
    lam = np.clip((ndl + wrap) / (1 + wrap), 0, 1)
    return power * lam / (1 + (dist / r0) ** 2)


# ---------------------------------------------------------------- inputs
def load_piece(name, rows):
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


def ray(xx, yy):
    return np.stack([(xx - CX) / F, -(yy - CY) / F, np.ones_like(xx)], -1)


def geometry(lab, faces, R):
    """Per pixel of a plane: the 3D point, the normal, the face's kind (string table index), emission and twin flag."""
    ids = np.unique(lab[lab > 0])
    n_max = int(lab.max()) + 1
    Ntab = np.zeros((n_max, 3))
    P0 = np.zeros((n_max, 3))
    bb = np.zeros(n_max, bool)
    Z = np.zeros(n_max)
    em = np.zeros(n_max)
    kind_ix = np.zeros(n_max, np.int32)
    for i in ids:
        f = faces[str(int(i))]
        Ntab[i] = f['n']
        Z[i] = f['z']
        em[i] = f['emit']
        bb[i] = f['billboard'] or f['p0'] is None
        if not bb[i]:
            P0[i] = f['p0']
        kind_ix[i] = KIND.setdefault(f['kind'], len(KIND))
    n = Ntab[lab]
    p0 = P0[lab]
    den = (n * R).sum(-1)
    den = np.where(np.abs(den) < 1e-6, 1e-6, den)
    t = ((n * (p0 - CAM)).sum(-1)) / den
    t = np.where(bb[lab], Z[lab], t)
    t = np.where(lab > 0, np.clip(t, 0.3, 2000), 0)
    P = CAM + R * t[..., None]
    nn = np.linalg.norm(n, axis=-1, keepdims=True)
    N = np.where(nn > 1e-6, n / np.maximum(nn, 1e-6), np.array([0, 0, -1.0]))
    return P, N, kind_ix[lab], em[lab]


KIND: dict[str, int] = {'': 0}


def isk(kind, *names):
    return np.isin(kind, [KIND[n] for n in names if n in KIND])


def stream_world(parts):
    """The stream's lights in world metres: scene.json's points, the last replaced by her phone (found in the parts
    render: the stream's top end), densely sampled (Catmull-Rom)."""
    pts = [np.array(p, np.float64) for p in SCENE['stream']]
    phone = None
    fn = os.path.join(parts, 'stream_k.png')
    if os.path.exists(fn):
        im = cv2.imread(fn)[..., ::-1].astype(np.float64) / 255
        ys, xs = np.nonzero(im.mean(2) > 0.55)
        if len(xs):
            top = ys < ys.min() + 30
            px, py = float(xs[top].mean()), float(ys[top].mean())
            Zp = 17.55
            phone = np.array([(px - CX) * Zp / F, HC - (py - CY) * Zp / F, Zp])
    if phone is not None:
        pts[-1] = phone
    out = []
    for i in range(len(pts) - 1):
        p0, p1, p2, p3 = pts[max(0, i - 1)], pts[i], pts[i + 1], pts[min(len(pts) - 1, i + 2)]
        for t in np.linspace(0, 1, 7, endpoint=False):
            t2, t3 = t * t, t * t * t
            out.append(0.5 * (2 * p1 + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (-p0 + 3 * p1 - 3 * p2 + p3) * t3))
    out.append(pts[-1])
    return np.array(out), phone


# ---------------------------------------------------------------- main
def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--bake', required=True, help="paint_t01.py's --out (design.npz, faces.json, the ink maps)")
    ap.add_argument('--parts', required=True, help='the movers alone (stream_k.png: her phone at the stream\'s end)')
    ap.add_argument('--preview', default='')
    ap.add_argument('--paper', action='store_true')
    a = ap.parse_args()
    t0 = time.time()
    rows = json.load(open(os.path.join(PAINT_DIR, 'pieces.json')))
    faces = json.load(open(os.path.join(a.bake, 'faces.json')))
    dz = np.load(os.path.join(a.bake, 'design.npz'))
    pieces = {p: load_piece(p, rows) for p in PLANES}
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float64)
    R = ray(xx, yy)

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

    S = SCENE['source']
    SRC = np.array([S['X'], S['Y'], S['Z']])
    SRC_IMG = proj(SRC)
    stream, phone = stream_world(a.parts)
    LAMP = SCENE['lamp']
    from t01cam import deck_y
    lamp_pos = np.array([LAMP['X'], float(deck_y(LAMP['X'])) + 0.12 + LAMP['post'] + 0.33, LAMP['Z'] - 0.02])

    # ---- the story light's image-space glow (for the twin: the light filling the ring from inside, dying into the
    # dark twin that runs on through it) and the air's lantern haze
    dx, dy = xx - SRC_IMG[0], yy - (SRC_IMG[1] + 18)
    g_core = np.exp(-((dx / 135.0) ** 2 + (dy / 95.0) ** 2))
    g_wide = np.exp(-((dx / 270.0) ** 2 + (dy / 175.0) ** 2))
    G = np.clip(g_core * 0.9 + g_wide * 0.16, 0, 1.2)

    lit = {}
    geo = {}
    sky_pc = pieces['sky']
    lit['sky'] = lin(sky_pc[..., :3])
    for p in PLANES[1:]:
        pc = pieces[p]
        if pc is None:
            continue
        lab = dz[f'{p}_lab']
        P, N, kind, emit = geometry(lab, faces, R)
        geo[p] = (P, N, kind, emit)

    gold = RIG['gold']
    for p in PLANES[1:]:
        pc = pieces[p]
        if pc is None:
            continue
        P, N, kind, emit = geo[p]
        M = lin(pc[..., :3])
        if p == 'twin':
            lab_twin = dz['twin_lab']
            # the paper twin in the water: a dim cool light (its paper readable as paper in the dark), the story
            # light filling the ring around the source, and the WAKING: the sheets nearest the source glow from within
            # (lanterns), their writing showing through as soft darker marks
            ink = np.load(os.path.join(a.bake, 'twin_ink.npy')).astype(np.float64) if os.path.exists(os.path.join(a.bake, 'twin_ink.npy')) else np.zeros((H, W))
            depth = smoothstep(CY + 60, H, yy)
            amb = hexlin('#7A7EB8') * (0.13 - 0.075 * depth)[..., None]
            # the light dies with the twin's depth: the far twin through the ring stays dark beyond the source
            zf = np.where(lab_twin > 0, np.maximum(np.exp(-np.clip(P[..., 2] - 24.0, 0, None) / 22.0), 0.6 * g_core), 1.0)
            Gt = G * zf
            E = amb + gold * (Gt * 1.5)[..., None]
            # the ring's paper half lit from inside: the ledgers' spines and page-blocks round the source
            rpx = np.hypot((xx - SRC_IMG[0]) * 1.15, (yy - SRC_IMG[1]) * 1.25)
            ringk = isk(kind, 't_spine', 't_pages')
            E = E + gold * (ringk * 1.5 * np.exp(-rpx / 230.0))[..., None]
            wake = smoothstep(0.30, 0.95, g_core * zf)
            paperish = isk(kind, 't_sheet', 't_page', 't_ledger', 't_letter', 't_pages') | (lab_twin == 0)
            glowc = hexlin('#FFEFD0') * 1.9
            lantern = glowc * (wake * paperish)[..., None] * (1 - 0.68 * np.clip(ink * 3, 0, 1))[..., None]
            out = M * E + M * lantern
            lit[p] = out
            continue
        if p == 'water':
            # the canal's dark body (cool, a touch of the sky's violet), lit only by the story light near the source
            E = hexlin('#6E70A8') * 0.22 + gold[None, None, :] * (G * 0.9)[..., None]
            lit[p] = M * E
            continue
        E = ambient(N)
        # the story light: the waking pages (an area light), the stream's small lights, the phone; the lamp's small
        # pool (the far street is too far for either: they reach it as the air's glow, below)
        if p == 'far':
            Es = np.zeros((H, W))
            El = np.zeros((H, W))
        else:
            Es = point_light(P, N, SRC, RIG['src_power'], RIG['src_r0'], wrap=0.25)
            for q in stream:
                Es = Es + point_light(P, N, q, RIG['stream_power'] / len(stream) * 9.0, RIG['stream_r0'], wrap=0.2)
            if phone is not None:
                Es = Es + point_light(P, N, phone, RIG['phone_power'], RIG['phone_r0'], wrap=0.2)
            El = point_light(P, N, lamp_pos, RIG['lamp_power'], RIG['lamp_r0'], wrap=0.3)
            # the waking pages lying on the water are a broad warm patch: their light fills the arch from below
            patch = np.array([SRC[0] - 0.05, 0.05, SRC[2] + 0.2])
            Es = Es + point_light(P, N, patch, RIG['patch_power'], RIG['patch_r0'], wrap=0.15) * np.where(isk(kind, 'vault'), 1.0, 0.45)
        E = E + gold * Es[..., None] + RIG['lamp'] * El[..., None]
        out = M * E
        # far roofs, gables and crowns: the afterglow's thin warm rim on the edges facing up (toward the low sky)
        if p in ('far', 'boat'):
            al = (pc[..., 3] > 0.5).astype(np.float64)
            edge_up = np.clip(al - np.roll(al, 2, 0), 0, 1)
            edge_up = gblur(edge_up, 0.7)
            near_glow = np.exp(-np.abs(xx - GLOW_IMG[0]) / 520.0)
            k = (0.35 if p == 'far' else 0.25) * (0.5 + 0.5 * near_glow)
            out = out + RIG['rim'] * (edge_up * k)[..., None] * (1 - isk(kind, 'window')[..., None])
        # the elms' leaves: thin, a little light through them at their edges (the low sky behind)
        cr = isk(kind, 'crown')
        if cr.any():
            out = np.where(cr[..., None], out * 0.85, out)
        # emitters: lit windows, the lamp's glass, the houseboat's window, the waking pages
        em = emit > 0
        if em.any():
            gain = np.where(isk(kind, 'lantern'), RIG['emit_lantern'], np.where(isk(kind, 'page'), 1.0, RIG['emit_window']))
            if p == 'glow':
                ink = np.load(os.path.join(a.bake, 'glow_ink.npy')).astype(np.float64) if os.path.exists(os.path.join(a.bake, 'glow_ink.npy')) else np.zeros((H, W))
                pg = hexlin('#FFF1D4') * 1.85 * (1 - 0.62 * np.clip(ink * 3, 0, 1))[..., None]
                out = np.where(em[..., None], M * pg + gold * 0.12, out)
            else:
                out = np.where(em[..., None], M * (gain * np.maximum(emit, 0.5))[..., None], out)
        # unlit windows: dark glass with a little of the sky in it
        dw = isk(kind, 'window') & ~em
        if dw.any():
            out = np.where(dw[..., None], out * 0.8 + hexlin('#6C6C9E')[None, None, :] * 0.05, out)
        # the bow: near and dark (a quiet mass), the varnished rims catching a little of the gold far ahead
        if p == 'near':
            out = M * (hexlin('#7E80B8') * 0.15)
            rimk = isk(kind, 'bow_rim')
            tipk = np.exp(-np.abs(xx - SRC_IMG[0]) / 110.0) * smoothstep(H, H - 220, yy)
            # the varnish: the violet sky's sheen along the gunwales, a breath of the gold only at the tip
            out = np.where(rimk[..., None], out + hexlin('#8C8CC0') * 0.035 + M * gold * (0.10 * tipk)[..., None], out)
        lit[p] = out

    # ---- the water: the gold path of the story light on its ripples toward us (from the source down to the bow)
    wpc = pieces['water']
    if wpc is not None:
        mat_L = lin(wpc[..., :3]).mean(-1)
        rip = mat_L - gblur(mat_L, 2.5)
        wpath = 26 + (yy - SRC_IMG[1]) * 0.16
        inpath = np.exp(-((xx - SRC_IMG[0]) / np.maximum(wpath, 1)) ** 2) * (yy > SRC_IMG[1] + 20)
        fade = np.exp(-np.maximum(yy - SRC_IMG[1], 0) / 520.0)
        spark = np.clip((rip - 0.002) * 90, 0, 1) * inpath * fade
        lit['water'] = lit['water'] + gold * (1.9 * spark + 0.16 * inpath * fade)[..., None]

    # ---- the air: the far planes toward the low sky's own colour (the afterglow's haze), more with distance
    if 'far' in geo:
        P, N, kind, emit = geo['far']
        sky_rows = gblur(lit['sky'], 10.0)
        air = sky_rows[np.clip(yy.astype(int) - 40, 0, sky_rows.shape[0] - 1), xx.astype(int)]
        dist = np.linalg.norm(P - CAM, axis=-1)
        hz = np.clip(1 - np.exp(-dist / 170.0), 0, 0.6)
        hz = np.where(emit > 0, hz * 0.45, hz)
        lit['far'] = lit['far'] * (1 - hz)[..., None] + air * hz[..., None]

    # ---- the target: the lit planes composited; the lantern haze in the air round the source; bloom at sources
    T = lit['sky'].copy()
    clear = smoothstep(0.2, 0.8, g_core)
    for p in PLANES[1:]:
        if pieces[p] is None:
            continue
        al = pieces[p][..., 3:4]
        if p == 'water':
            al = al * (1 - 0.88 * clear)[..., None]
        T = lit[p] * al + T * (1 - al)
    haze = np.exp(-((dx / 250.0) ** 2 + ((yy - SRC_IMG[1] + 40) / 230.0) ** 2))
    T = T + gold * (0.10 * haze)[..., None]
    src = np.zeros((H, W, 3))
    for p in ('far', 'boat', 'rail', 'glow'):
        if pieces[p] is None:
            continue
        P, N, kind, emit = geo[p]
        m = (emit > 0) & (pieces[p][..., 3] > 0.5)
        k = 0.85 if p == 'glow' else (0.55 if p == 'rail' else 0.35)
        src[m] = np.maximum(src[m], lit[p][m] * k)
    bloom = gblur(src, 5.0) * 0.30 + gblur(src, 20.0) * 0.30 + gblur(src, 60.0) * 0.22
    # never into the caption band: the bloom fades out above it
    bloom = bloom * smoothstep(BAND[1] + 10, BAND[1] + 90, yy)[..., None]
    T = T + bloom
    Ts = srgb(T)
    if a.paper:
        # the one paper, very subtle: at half strength on the open sky (its texture must never read as bands there)
        Tp = TX.grain_static(Ts.astype(np.float32), None).astype(np.float64)
        wpap = np.where(car == 0, 0.5, 1.0)[..., None]
        Ts = Ts + (Tp - Ts) * wpap
    t_light = time.time() - t0

    # ---- solve each plane's maps against the base, only where that plane carries the pixel
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
        Mq, S_ = SV.solve_pair(base.astype(np.float32), Ts.astype(np.float32), m, f't01/{p}')
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
    # the live inputs: the light round her, blurred (her wrap), and the paper's tile
    live = {}
    x0, y0, w0, h0 = 300, 700, 480, 420
    wrap = gblur(T[y0:y0 + h0, x0:x0 + w0], 12.0)
    SV.write_png(os.path.join(MAPS_DIR, f'wrap{EXT}'), srgb(wrap))
    live['wrap'] = dict(file=f'wrap{EXT}', box=[x0, y0, w0, h0])
    tile, size = TX.grain_tile()
    SV.write_png(os.path.join(MAPS_DIR, f'grain{EXT}'), tile)
    live['grain'] = dict(file=f'grain{EXT}', size=size)
    write_ts(out_rows, live)
    err = np.abs(comp - Ts)
    print(json.dumps({'light_s': round(t_light, 1), 'total_s': round(time.time() - t0, 1), 'maps': sum(len(v) for v in out_rows.values()),
                      'solve_max_code': float(np.round(err[car >= 0].max() * 255, 2)),
                      'phone': None if phone is None else [round(float(v), 3) for v in phone]}))
    if a.preview:
        os.makedirs(a.preview, exist_ok=True)
        cv2.imwrite(os.path.join(a.preview, 'target.png'), (np.clip(Ts, 0, 1) * 255 + 0.5).astype(np.uint8)[..., ::-1])
        cv2.imwrite(os.path.join(a.preview, 'base.png'), (np.clip(base, 0, 1) * 255 + 0.5).astype(np.uint8)[..., ::-1])


def write_ts(rows, live):
    lines = ["// GENERATED by src/look/test01_s1/bake/light_t01.py (the light bake): each plane's baked light maps (one multiply,",
             "// one screen) and the movers' live inputs. Do not edit by hand; rerun the bake.",
             "import type {MapSet} from './context';"]
    imps, body = [], ['', 'export const MAPS_T01: MapSet = {', '  slots: {']
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
    open(os.path.join(ROOT, 'maps_t01.ts'), 'w').write('\n'.join(lines + imps + body) + '\n')


if __name__ == '__main__':
    main()
