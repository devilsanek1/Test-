#!/usr/bin/env python3
"""paint_v8.py: the PAINTER v8 (paint_test/v8_card.md; NOTES.md "v8"). From the set's design (set_v8.py: every plane's
flat colours and face labels), each plane's MATERIAL in the colour key, painted with v7's tools (never lit: the light
bake, light_v8.py, solves the one rig onto it):
  sky       the recipe book's sky (scripts/look/paint/recipes/sky_clouds.py: the designed gradient, its soft passes and
            the 03 hatch, the sun's warmth, cloud masses designed then painted, horizon streaks, a far flock, the calm
            disc) in v8's golden-hour palette: one sunset family, the caption band flat and light
  farcity   hazed silhouettes at the far dose (coarse dry strokes, lost tops near the sun)
  far       the far bank and our side far down: buildings, windows tone-on-tone (the lit ones kept), trees as leaf masses,
            moored boats; the far dose (fewer, broader marks, lost edges)
  water     the canal's body (its colour is mostly the light bake's reflection): long level ripple marks
  boat      the narrowboat at the middle dose
  mid       the plaza (setts), the autumn tree (leaf dabs), the cafe's umbrellas and tables, the bollards
  street    the near street: large stone flags in perspective, each its own value, joints broken in pieces, the kerb,
            the damp and the puddles (a WET map for the light bake's reflections), marks along the perspective
  building  the curtain wall (each pane its own reflection, blinds, the slab bands), the fascia and piers, the lobby
            seen through the glass (warm, soft), the door's frame crisp
Marks through MyPaint (peinten, vendored in organic proof 1's scratch: OC_PEINTEN, OC_BRUSHES), planned per face
(oc_lib.StrokePlan). Seeded: a rerun gives the same bytes. From video/ (the organic proof's venv):
    OC_SCRATCH=<scratch>/oc <venv>/python -B src/look/v8_s1/bake/paint_v8.py --out <scratch> [--only sky,street]"""
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
VIDEO = os.path.abspath(os.path.join(HERE, '..', '..', '..', '..'))
sys.path.insert(0, HERE)
sys.path.insert(0, os.path.join(VIDEO, 'scripts', 'look', 'organic'))
sys.path.insert(0, os.path.join(VIDEO, 'scripts', 'look', 'paint', 'recipes'))
import oc_lib as L  # noqa: E402
import sky_clouds as SC  # noqa: E402
import set_v8 as S  # noqa: E402
from v8cam import BAND, CX, CY, F, H, HC, SUN_IMG, W, ground_at  # noqa: E402

ROOT = os.path.abspath(os.path.join(HERE, '..'))
PAINT_DIR = os.path.join(ROOT, 'paint')
EXT = '.v8piece.png'
VP = (CX, CY)
BR = 'tanda/acrylic-04-paint'
BR_WET = 'tanda/acrylic-03-with-water'

# ---------------------------------------------------------------- v8's sky palette: golden hour, one sunset family
SKY_V8 = {k: SC.hx(v) for k, v in {
    'zenith': '#b2a6d1',     # lavender-periwinkle, the top
    'field': '#d8bfd2',      # the caption field: rose-lilac, flat through the band (ink 8:1+)
    'rose': '#ebc3c3',       # coral-rose under the field
    'band': '#f6cfba',       # peach
    'horizon': '#fbd9b6',    # warm gold-peach: the far AIR
    'glow': '#ffe5bd',       # the sun's warmth (never in the caption band)
    'sun': '#fff4de',        # the disc: one flat step over its band
    'rim': '#ffeac6',        # cloud rim
    'lit': '#ffd2a0',        # cloud lit, gold-peach
    'half': '#f1b9ae',       # cloud half-light: rose-peach
    'shade_top': '#cdb7d2',  # cloud shade facing up (the sky dome)
    'shade': '#bba3c6',      # cloud shade, lilac
    'deep': '#a68bb4',       # the core, small
    'streak': '#e8c0c4',     # horizon streak body
    'bird': '#6b5878',       # the far flock
}.items()}


def seeded(*k):
    return np.random.default_rng(int(hashlib.sha256('/'.join(('v8paint',) + tuple(str(x) for x in k)).encode()).hexdigest()[:12], 16))


def smoothstep_np(t):
    return t * t * (3 - 2 * t)


def vnoise(key, shape, cell, octaves=3):
    """Smooth value noise in -1..1 (seeded)."""
    r = seeded('noise', key)
    h, w = shape
    out = np.zeros(shape, np.float32)
    amp, tot = 1.0, 0.0
    for o in range(octaves):
        c = max(2.0, cell / (2 ** o))
        gh, gw = int(h / c) + 3, int(w / c) + 3
        g = r.uniform(-1, 1, (gh, gw)).astype(np.float32)
        out += amp * cv2.resize(g, (int(gw * c), int(gh * c)), interpolation=cv2.INTER_CUBIC)[:h, :w]
        tot += amp
        amp *= 0.5
    return out / tot


# ---------------------------------------------------------------- the sky (the recipe book's, in v8's palette)
SKY_H = 1200
CLOUDS = {
    # the near cumulus at the top right, above the band, lit from below-right by the low sun (sizes on a ladder)
    'near': dict(box=(520, 0, 1080, 282), base_y=262.0, depth='near', billows=[
        (1050, 96, 112, 1.0, 1), (948, 40, 84, 1.0, 0), (872, 118, 76, 1.0, 2), (812, 70, 40, 1.0, 1.5),
        (796, 176, 62, 1.0, 3), (742, 150, 24, 1.0, 2.5), (962, 196, 118, 1.0, 4), (700, 222, 44, 1.0, 5),
        (660, 240, 20, 1.0, 6), (880, 238, 60, 1.0, 2.8), (1030, 240, 70, 1.0, 2.9)]),
    # a long bank below the band on the left, its underside gold toward the sun
    'mid': dict(box=(0, 640, 700, 790), base_y=762.0, depth='mid', billows=[
        (30, 742, 96, 0.46, 1), (140, 726, 92, 0.5, 2), (252, 736, 78, 0.48, 3), (344, 748, 58, 0.44, 4),
        (420, 756, 40, 0.4, 5), (478, 762, 24, 0.36, 6), (196, 694, 64, 0.16, 0), (300, 690, 44, 0.14, 0)]),
    # a thin low deck near the horizon, over the sun, lit underneath
    'far': dict(box=(360, 900, 1080, 985), base_y=968.0, depth='far', billows=[
        (420, 952, 46, 0.3, 1), (520, 956, 58, 0.32, 2), (640, 950, 40, 0.28, 3), (930, 948, 64, 0.3, 4),
        (1030, 954, 54, 0.3, 5), (1090, 950, 44, 0.3, 6)]),
}


def sky_ramp_v8(pal, h):
    from scipy.interpolate import PchipInterpolator
    stops = [(0, pal['zenith']), (BAND[0] - 10, pal['field']), (BAND[1] + 10, pal['field']), (760, pal['rose']),
             (900, pal['band']), (1020, pal['horizon']), (h, pal['horizon'])]
    ys = np.array([s[0] for s in stops], np.float64)
    cs = np.array([s[1] for s in stops], np.float64)
    return PchipInterpolator(ys, cs, axis=0)(np.arange(h) + 0.5).astype(np.float32)


def paint_sky():
    """paint_sky (recipe 3.1) with v8's stops and sun, then the clouds (3.2-3.3), the streaks (3.4), the flock (3.6) and
    the disc (3.5), each on the same OKLab layer."""
    pal = SKY_V8
    sun = (float(SUN_IMG[0]), float(SUN_IMG[1]))
    SC.CAPTION = (BAND[0] + 10, BAND[1] - 10)
    SC.SUN = sun
    SC.HORIZON = 1036
    rng = seeded('sky')
    hh, ww = SKY_H, W
    sky = SC.Layer(hh, ww, alpha=1.0)
    sky.c[...] = sky_ramp_v8(pal, hh)[:, None, :]
    calm = np.ones(hh, np.float32)
    calm[BAND[0] - 30:BAND[1] + 30] = 0.25
    g = SC.sun_warmth(hh, ww, sun, 0.52 * ww, 0.42 * 0.52 * ww, BAND[1] + 40) * 0.75
    sky.c[...] = sky.c + (pal['glow'] - sky.c) * g[..., None]
    p1 = SC.Layer(hh, ww)
    for _ in range(14):
        y = rng.uniform(0, hh)
        x = rng.uniform(-0.3, 0.7) * ww
        Ln = rng.uniform(0.5, 1.1) * ww
        ang = math.radians(rng.normal(-4, 2))
        yi = int(np.clip(y, 0, hh - 1))
        base = sky.c[yi, int(np.clip(x + Ln / 2, 0, ww - 1))]
        dl = rng.choice([-1, 1]) * rng.uniform(0.009, 0.014) * calm[yi]
        col = SC.lift(base, dl, rng.normal(0, 0.003) * calm[yi], rng.normal(0, 0.003) * calm[yi])
        SC.paint_line(p1, (x, y), (x + Ln * math.cos(ang), y + Ln * math.sin(ang)), rng.uniform(160, 320), col, rng.uniform(0.3, 0.45), round_=True, t_in=0.3, t_out=0.3)
    p1.blur(24).onto(sky)
    p2 = SC.Layer(hh, ww)
    for _ in range(70):
        y, x = rng.uniform(0, hh), rng.uniform(-0.2, 0.9) * ww
        Ln = rng.uniform(0.25, 0.6) * ww
        ang = math.radians(rng.normal(-5, 3))
        yi = int(np.clip(y, 0, hh - 1))
        col = SC.lift(sky.c[yi, int(np.clip(x + Ln / 2, 0, ww - 1))], rng.choice([-1, 1]) * rng.uniform(0.008, 0.013) * calm[yi])
        SC.paint_line(p2, (x, y), (x + Ln * math.cos(ang), y + Ln * math.sin(ang)), rng.uniform(40, 90), col, rng.uniform(0.3, 0.45), round_=True, t_in=0.3, t_out=0.4)
    p2.blur(6).onto(sky)
    hf = SC.hatch_field(rng, hh, ww)
    patch = SC.smoothstep(-0.3, 0.9, SC.noise(rng, hh, ww, 150, aniso=2.0, angle=-35.0))
    ys = np.arange(hh, dtype=np.float32)[:, None]
    fade = np.where((ys > BAND[0] - 40) & (ys < BAND[1] + 40), 0.0, 1.0) * SC.smoothstep(1000, 880, ys)
    sky.c[..., 0] += hf * patch * fade * 0.011
    # the clouds, far to near, painted on the sky's own bytes
    for name in ('far', 'mid', 'near'):
        cd = CLOUDS[name]
        prm = dict(SC.DEPTH[cd['depth']], base_y=cd['base_y'])
        lay, _, _ = SC.paint_mass(cd['box'], [tuple(b) for b in cd['billows']], pal, sky, seeded('cloud', name), prm, sun=sun)
        x0, y0 = cd['box'][:2]
        lay.onto(sky, x0, y0)
    SC.paint_streaks(sky, pal, seeded('streaks'), sun, n_rows=3)
    SC.paint_flock(sky, pal, seeded('flock'), [(626, 902), (712, 868), (840, 884)], n=22, span=(3.0, 8.0), band=18.0, far_k=0.5)
    SC.paint_sun(sky, pal, sun, 21.0)
    rgb8 = sky.rgb(dither_seed=81)
    rgb = rgb8.astype(np.float64) / 255.0 if rgb8.dtype == np.uint8 else np.clip(rgb8, 0, 1)
    return np.dstack([rgb, np.ones((hh, ww))]), (0, 0)


# ---------------------------------------------------------------- the generic plane painter
def face_dir(face, x, y):
    """The image direction of a face's main strokes at a pixel: along its receding lines (to the vanishing point) for
    walls facing +-X and grounds, level for faces turned to us, a free angle for billboards."""
    if face.pts is None:
        return None
    n = face.n
    if abs(n[0]) > 0.7 or abs(n[1]) > 0.7:
        d = np.array([VP[0] - x, VP[1] - y], np.float64)
        nd = np.linalg.norm(d)
        return d / nd if nd > 1 else np.array([1.0, 0.0])
    return np.array([1.0, 0.0])


def colour_move(rgb, a, lab, faces_by_id, key, dose):
    """Colour moving inside every face (PAINTED PIECES): a slow mottle and a ramp toward the low sun, each face its own
    strength; OKLab, so it never greys."""
    ok = L.rgb2ok(np.clip(rgb, 0, 1))
    mott = vnoise(key + '/mott', a.shape, 90 * dose['scale'], 3)
    yy, xx = np.mgrid[0:a.shape[0], 0:a.shape[1]].astype(np.float32)
    ds = np.hypot(xx - SUN_IMG[0], yy - SUN_IMG[1])
    toward = np.clip(1 - ds / 1400.0, 0, 1)
    ok[..., 0] += mott * dose['mott'] + (toward - 0.5) * dose['ramp']
    ok[..., 1] += (toward - 0.5) * dose['ramp'] * 0.25
    ok[..., 2] += (toward - 0.5) * dose['ramp'] * 0.45
    return np.clip(L.ok2rgb(ok), 0, 1)


def plan_faces(plan, rgb, a, lab, faces_by_id, dose, clips, used, skip_kinds=()):
    """Flat strokes along each face's own direction, clipped to the faces of its material (one clip per colour and
    orientation, so a mark never crosses into another material); light marks on glass only."""
    r = plan.rng
    ids, counts = np.unique(lab[lab > 0], return_counts=True)
    groups = {}
    for fid, cnt in zip(ids, counts):
        f = faces_by_id.get(int(fid))
        if f is None or f.kind in skip_kinds or cnt < dose['min_area']:
            continue
        key = f'g{f.col.lstrip("#")}_{int(round(f.n[0]))}{int(round(f.n[1]))}{int(round(f.n[2]))}'
        groups.setdefault(key, []).append((int(fid), int(cnt)))
    for key, members in groups.items():
        m_all = np.isin(lab, [fid for fid, _ in members])
        clips[key] = ndi.binary_dilation(m_all, iterations=1).astype(np.uint8)
        used.add(key)
        for fid, cnt in members:
            f = faces_by_id[fid]
            m = lab == fid
            ys, xs = np.nonzero(m)
            k = int(np.clip(cnt / dose['area_per_mark'], 1, dose['max_marks']))
            bb_w, bb_h = xs.max() - xs.min() + 1, ys.max() - ys.min() + 1
            for _ in range(k):
                j = r.integers(len(xs))
                x, y = float(xs[j]), float(ys[j])
                d = face_dir(f, x, y)
                if d is None or f.kind == 'crown':
                    ang = r.uniform(0, math.pi)
                    d = np.array([math.cos(ang), math.sin(ang)])
                elif r.random() < dose['cross'] and abs(f.n[1]) < 0.7:
                    d = np.array([0.0, 1.0])
                Ls = min(r.uniform(*dose['len']), max(bb_w, bb_h) * 0.9)
                if Ls < 4:
                    continue
                p0 = (x - d[0] * Ls / 2, y - d[1] * Ls / 2)
                p1 = (x + d[0] * Ls / 2, y + d[1] * Ls / 2)
                base = L.rgb2ok(rgb[int(y), int(x)])
                glass = f.kind in ('glass', 'lobbyglass', 'doorglass')
                sgn = 1 if glass else r.choice([-1, 1])
                c = base + np.array([sgn * r.uniform(*dose['dl']), r.normal(0, 0.004), r.normal(0, 0.006)])
                plan.add('face', BR, [p0, p1], L.ok2rgb(c), r.uniform(*dose['width']), r.uniform(*dose['op']), clip=key, ds=1.0,
                         flat_p=r.uniform(0.7, 0.9))


def lost_edges(plan, rgb, lab, dose, clips, used):
    """On LOST edges (two neighbouring faces within a few L*), short strokes lap across from one side: the ruler line
    breaks into pieces."""
    r = plan.rng
    Lt = L.Lstar(np.clip(rgb, 0, 1))
    bnd = L.boundaries(np.where(lab > 0, lab, -1)) & (lab > 0)
    big = cv2.dilate(Lt.astype(np.float32), np.ones((5, 5), np.uint8)) - cv2.erode(Lt.astype(np.float32), np.ones((5, 5), np.uint8))
    cand = bnd & (big < dose['lost_dl']) & (big > 0.8)
    ys, xs = np.nonzero(cand)
    if not len(xs):
        return 0
    taken = np.zeros(lab.shape, bool)
    n = 0
    for j in r.permutation(len(xs))[: dose['lost_max'] * 6]:
        x, y = xs[j], ys[j]
        if taken[max(0, y - 18):y + 19, max(0, x - 18):x + 19].any():
            continue
        taken[y, x] = True
        la = lab[y, x]
        win = lab[max(0, y - 4):y + 5, max(0, x - 4):x + 5]
        nb = [v for v in np.unique(win) if v > 0 and v != la]
        if not nb:
            continue
        ang = r.uniform(0, math.pi)
        Ls = r.uniform(*dose['lost_len'])
        p0 = (x - math.cos(ang) * Ls / 2, y - math.sin(ang) * Ls / 2)
        p1 = (x + math.cos(ang) * Ls / 2, y + math.sin(ang) * Ls / 2)
        plan.add('edge', BR, [p0, p1], rgb[y, x], r.uniform(3.0, 6.0), r.uniform(0.55, 0.8), ds=1.0, flat_p=r.uniform(0.7, 0.9))
        n += 1
        if n >= dose['lost_max']:
            break
    return n


DOSES = {
    'far': dict(scale=1.6, mott=0.010, ramp=0.03, min_area=40, area_per_mark=380, max_marks=14, len=(10, 34), width=(4, 9),
                dl=(0.012, 0.03), op=(0.45, 0.75), cross=0.25, lost_dl=9.0, lost_len=(8, 20), lost_max=140, blur=1.1),
    'farcity': dict(scale=2.4, mott=0.008, ramp=0.02, min_area=30, area_per_mark=300, max_marks=10, len=(14, 40), width=(6, 12),
                    dl=(0.008, 0.02), op=(0.4, 0.7), cross=0.5, lost_dl=6.0, lost_len=(10, 24), lost_max=60, blur=1.6),
    'mid': dict(scale=1.2, mott=0.012, ramp=0.03, min_area=60, area_per_mark=300, max_marks=26, len=(12, 46), width=(5, 11),
                dl=(0.014, 0.034), op=(0.5, 0.8), cross=0.3, lost_dl=9.0, lost_len=(10, 26), lost_max=120, blur=0.6),
    'boat': dict(scale=1.0, mott=0.010, ramp=0.03, min_area=30, area_per_mark=260, max_marks=12, len=(8, 30), width=(3, 7),
                 dl=(0.012, 0.03), op=(0.5, 0.8), cross=0.2, lost_dl=8.0, lost_len=(6, 14), lost_max=30, blur=0.4),
    'building': dict(scale=1.0, mott=0.012, ramp=0.03, min_area=80, area_per_mark=520, max_marks=40, len=(20, 70), width=(7, 15),
                     dl=(0.014, 0.032), op=(0.5, 0.78), cross=0.35, lost_dl=10.0, lost_len=(14, 34), lost_max=90, blur=0.0),
}


def soften(rgba, sigma, keep=None):
    """The plane's softness (far planes more like brushwork: lost edges): colour softened by a premultiplied blur inside
    the piece, the silhouette kept; `keep` (0..1) protects found edges (lit windows, the focal)."""
    if sigma <= 0:
        return rgba
    a = rgba[..., 3:4]
    pm = rgba[..., :3] * a
    bl = lambda im: np.dstack([cv2.GaussianBlur(np.ascontiguousarray(im[..., c]).astype(np.float32), (0, 0), sigma) for c in range(im.shape[2])]).astype(np.float64)
    soft = bl(pm) / np.maximum(bl(a), 1e-4)
    w = (a > 0.4).astype(np.float64)
    if keep is not None:
        w = w * (1 - keep[..., None])
    out = rgba.copy()
    out[..., :3] = np.clip(rgba[..., :3] * (1 - w) + soft * w, 0, 1)
    return out


def paint_generic(name, rgb, a, lab, faces_by_id, dose, extra_marks=None, skip_kinds=(), keep=None):
    rgb2 = colour_move(rgb, a, lab, faces_by_id, name, dose)
    plan = L.StrokePlan(('v8', name))
    clips, used = {}, set()
    plan_faces(plan, rgb2, a, lab, faces_by_id, dose, clips, used, skip_kinds=skip_kinds)
    nl = lost_edges(plan, rgb2, lab, dose, clips, used)
    if extra_marks:
        extra_marks(plan, rgb2, a, lab, clips, used)
    base = np.dstack([rgb2, a])
    painted, sec = L.mypaint(base, plan.strokes, clips={k: clips[k] for k in used}, tag=f'v8{name}')
    painted[..., 3] = a
    painted = soften(painted, dose['blur'], keep=keep)
    return painted, dict(strokes=plan.count(), lost=nl, mypaint_s=round(sec, 2))


# ---------------------------------------------------------------- special pieces
def tree_marks(plan, rgb, a, lab, clips, used, faces_by_id, plane):
    """Leaf dabs on the crowns: short strokes at free angles on a size ladder, the crown's own colours, more at the edge
    (the lit edge's broken outline), so a crown is a mass of leaves, never a flat blob."""
    r = plan.rng
    crowns = np.isin(lab, [fid for fid, f in faces_by_id.items() if f.kind == 'crown'])
    if not crowns.any():
        return
    ck = 'crowns'
    clips[ck] = ndi.binary_dilation(crowns, iterations=3).astype(np.uint8)
    used.add(ck)
    ys, xs = np.nonzero(crowns)
    edge = crowns & ~ndi.binary_erosion(crowns, iterations=4)
    ey, ex = np.nonzero(edge)
    k = int(min(len(xs) / (70 if plane == 'mid' else 120), 900))
    pal = [S.hexrgb(c) for c in (S.K['tree_a'], S.K['tree_b'], S.K['tree_c'], '#E4B26A', '#B8694C')]
    for i in range(k):
        if i % 3 == 0 and len(ex):
            j = r.integers(len(ex))
            x, y = float(ex[j]), float(ey[j])
        else:
            j = r.integers(len(xs))
            x, y = float(xs[j]), float(ys[j])
        ang = r.uniform(0, math.pi)
        Ls = r.uniform(4, 11) if plane == 'mid' else r.uniform(3, 7)
        base = rgb[int(y), int(x)] * 0.6 + pal[r.integers(len(pal))] * 0.4
        c = L.rgb2ok(base) + np.array([r.uniform(-0.04, 0.03), 0, r.normal(0, 0.01)])
        plan.add('leaf', BR, [(x - math.cos(ang) * Ls / 2, y - math.sin(ang) * Ls / 2), (x + math.cos(ang) * Ls / 2, y + math.sin(ang) * Ls / 2)],
                 L.ok2rgb(c), r.uniform(3.0, 6.5) if plane == 'mid' else r.uniform(2.2, 4.0), r.uniform(0.6, 0.92), clip=ck, ds=1.0)


def street_material(rgb, a, lab, faces_by_id, key):
    """The near street's stone: large flags laid in perspective (ground metres from the camera), each its own value and
    a touch of hue, the joints darker and broken (2-4 pieces, faded ends), the kerb's long stones; a WET map: a damp film
    everywhere (stronger in the hollows) and puddles (in ground coordinates, outlines displaced by noise)."""
    h, w = a.shape
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float64)
    below = yy > CY + 2
    X, Z = ground_at(xx, np.maximum(yy, CY + 2))
    ok = L.rgb2ok(np.clip(rgb, 0, 1))
    # flags: rows along Z (0.62 m), courses across X (0.9 m) offset per row
    row = np.floor(Z / 0.62 + 0.15 * np.sin(X * 0.7))
    offs = (np.sin(row * 12.9898) * 43758.5453) % 1.0
    col = np.floor(X / 0.9 + offs)
    hsh = (np.sin(row * 78.233 + col * 37.719) * 43758.5453) % 1.0
    hsh2 = (np.sin(row * 11.13 + col * 91.7) * 23421.631) % 1.0
    isstreet = np.zeros((h, w), bool)
    iskerb = np.zeros((h, w), bool)
    for fid, f in faces_by_id.items():
        if f.kind == 'ground' and f.name in ('street', 'street_mid', 'plaza', 'street_far'):
            isstreet |= lab == fid
        if f.kind == 'kerb':
            iskerb |= lab == fid
    ok[..., 0] += np.where(isstreet, (hsh - 0.5) * 0.026, 0)
    ok[..., 1] += np.where(isstreet, (hsh2 - 0.5) * 0.008, 0)
    ok[..., 2] += np.where(isstreet, (hsh2 - 0.5) * 0.012, 0)
    # joints: the distance to the flag's edges in metres -> px; dark, broken in pieces by noise along them
    fr = Z / 0.62 + 0.15 * np.sin(X * 0.7)
    fc = X / 0.9 + offs
    dz = np.minimum(fr - np.floor(fr), np.ceil(fr) - fr) * 0.62
    dx = np.minimum(fc - np.floor(fc), np.ceil(fc) - fc) * 0.9
    px_per_m = F / np.maximum(Z, 0.5)                     # across (X)
    py_per_m = F * HC / np.maximum(Z, 0.5) ** 2           # along (Z), foreshortened
    jw = 0.014
    jz = np.clip(1 - (dz * py_per_m) / (jw * py_per_m + 0.55), 0, 1)
    jx = np.clip(1 - (dx * px_per_m) / (jw * px_per_m + 0.55), 0, 1)
    brk = np.clip((vnoise(key + '/jbreak', (h, w), 30, 2) + 0.1) * 2.2, 0, 1)
    joint = np.maximum(jz, jx) * brk * isstreet
    ok[..., 0] -= joint * 0.045
    # the kerb: long stones (1.3 m) with fine cross joints
    kc = Z / 1.3
    dk = np.minimum(kc - np.floor(kc), np.ceil(kc) - kc) * 1.3
    kj = np.clip(1 - (dk * py_per_m) / (0.01 * py_per_m + 0.55), 0, 1) * iskerb
    khs = (np.sin(np.floor(kc) * 19.19) * 4375.85) % 1.0
    ok[..., 0] += np.where(iskerb, (khs - 0.5) * 0.03, 0) - kj * 0.05
    # the wet: a damp film (low in the hollows: the flags' centres a touch drier), puddles near her, in the lobby's light
    # and along the sun's path; ground coordinates, outlines displaced
    damp = 0.34 + 0.16 * vnoise(key + '/damp', (h, w), 110, 3) - 0.08 * (1 - np.maximum(jz, jx))
    pud = np.zeros((h, w))
    rr = seeded('puddles')
    # by intent: one by her front foot (her reflection), one in the lobby's light, one far in the sun's path
    puddles = [(0.02, 2.95, 0.4, 0.14), (-1.55, 3.9, 0.36, 0.18), (1.05, 7.4, 0.5, 0.25), (-0.6, 11.5, 0.8, 0.4)]
    wob = vnoise(key + '/pwob', (h, w), 18, 2)
    for (px_, pz, rx, rz) in puddles:
        e = np.hypot((X - px_) / rx, (Z - pz) / rz) + 0.22 * wob + 0.05 * rr.normal()
        pud = np.maximum(pud, smoothstep_np(np.clip((1.0 - e) / 0.32, 0, 1)))
    wet = np.clip(np.maximum(damp, pud), 0, 1) * (isstreet | iskerb) * below
    ok[..., 0] -= pud * 0.05 * isstreet
    out = np.clip(L.ok2rgb(ok), 0, 1)
    return out, wet.astype(np.float32), pud.astype(np.float32)


def street_marks(plan, rgb, a, lab, clips, used, wet):
    """Marks by intent: flat strokes along the perspective (broad near the camera, fine by the far end), a few across;
    none in the puddles (still water has no marks)."""
    r = plan.rng
    ok_area = (a > 0.5) & (wet < 0.9)
    ck = 'streetclip'
    clips[ck] = ok_area.astype(np.uint8)
    used.add(ck)
    ys, xs = np.nonzero(ok_area & (np.arange(a.shape[0])[:, None] > CY + 30))
    n = 0
    for _ in range(170):
        j = r.integers(len(xs))
        x, y = float(xs[j]), float(ys[j])
        near = np.clip((y - CY) / (H - CY), 0, 1)
        d = np.array([VP[0] - x, VP[1] - y])
        d /= max(np.linalg.norm(d), 1)
        if r.random() < 0.15:
            d = np.array([1.0, r.normal(0, 0.03)])
            d /= np.linalg.norm(d)
        Ls = r.uniform(30, 70) + near * r.uniform(60, 190)
        wdt = 5 + near * r.uniform(10, 26)
        base = L.rgb2ok(rgb[int(y), int(x)])
        c = base + np.array([r.choice([-1, 1]) * r.uniform(0.006, 0.016), r.normal(0, 0.003), r.normal(0, 0.004)])
        plan.add('street', BR_WET, [(x - d[0] * Ls / 2, y - d[1] * Ls / 2), (x + d[0] * Ls / 2, y + d[1] * Ls / 2)], L.ok2rgb(c), wdt, r.uniform(0.22, 0.42), clip=ck, ds=1.0, flat_p=r.uniform(0.55, 0.8))
        n += 1


def water_material(rgb, a, lab, faces_by_id):
    """The canal's body: a deep rose-violet (its colour is mostly what it mirrors: the light bake), darker and a touch
    greener toward us; long level ripple marks, coarse far, fine near, never over the far kerb."""
    h, w = a.shape
    yy = np.arange(h, dtype=np.float64)[:, None] * np.ones((1, w))
    ok = L.rgb2ok(np.clip(rgb, 0, 1))
    t = np.clip((yy - CY) / 500.0, 0, 1)
    ok[..., 0] += -0.06 * t
    ok[..., 2] += -0.01 * t
    out = np.clip(L.ok2rgb(ok), 0, 1)
    plan = L.StrokePlan(('v8', 'water'))
    r = plan.rng
    ck = 'water'
    clips = {ck: (a > 0.5).astype(np.uint8)}
    ys, xs = np.nonzero(a > 0.6)
    for _ in range(420):
        j = r.integers(len(xs))
        x, y = float(xs[j]), float(ys[j])
        near = np.clip((y - CY) / 600.0, 0, 1)
        Ls = 10 + near * r.uniform(30, 110) + r.uniform(0, 20)
        wdt = 1.5 + near * r.uniform(2.5, 7)
        c = L.rgb2ok(out[int(y), int(x)]) + np.array([r.choice([-1, 1]) * r.uniform(0.015, 0.04), 0, r.normal(0, 0.005)])
        plan.add('ripple', BR, [(x - Ls / 2, y), (x + Ls / 2, y + r.normal(0, 0.3))], L.ok2rgb(c), wdt, r.uniform(0.35, 0.7), clip=ck, ds=1.0, flat_p=r.uniform(0.6, 0.85))
    painted, sec = L.mypaint(np.dstack([out, a]), plan.strokes, clips=clips, tag='v8water')
    painted[..., 3] = a
    return painted, dict(strokes=plan.count(), mypaint_s=round(sec, 2))


def building_material(rgb, a, lab, faces_by_id):
    """The curtain wall in its own cool shade: each pane its own soft reflection (lighter low, the far bank's dark band
    through it at the horizon line, a diagonal sheen on some), the blinds, the slabs; the fascia and piers stone; the
    lobby inside warm and SOFT (seen through glass: its edges blurred a little), the door's frame and the mullions crisp."""
    h, w = a.shape
    ok = L.rgb2ok(np.clip(rgb, 0, 1))
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float64)
    r = seeded('glass')
    kinds = {fid: f.kind for fid, f in faces_by_id.items()}
    glass = np.isin(lab, [fid for fid, k in kinds.items() if k == 'glass'])
    # the reflection in the glass: the sky across the canal (warm low, cooler high) and the far bank's band at the
    # horizon line seen in the glass (the reflection of things across is near the horizon's height)
    t = np.clip((CY - yy) / 1100.0, 0, 1)
    refl = np.where(glass, 0.03 * (1 - t) - 0.01, 0)
    ok[..., 0] += refl
    ok[..., 2] += np.where(glass, 0.016 * (1 - t), 0)
    band = np.exp(-((yy - (CY - 40)) / 70.0) ** 2) * glass
    ok[..., 0] -= band * 0.05
    # per pane: a diagonal sheen on some (each its own angle and place)
    for fid, f in faces_by_id.items():
        if f.kind != 'glass':
            continue
        m = lab == fid
        if m.sum() < 200:
            continue
        ys, xs = np.nonzero(m)
        if r.random() < 0.5:
            ang = r.uniform(0.9, 1.3)
            c0 = r.uniform(xs.min(), xs.max())
            dd = (xx - c0) * math.cos(ang) + (yy - ys.mean()) * math.sin(ang)
            sheen = np.exp(-(dd / r.uniform(6, 16)) ** 2) * m
            ok[..., 0] += sheen * r.uniform(0.02, 0.045)
    out = np.clip(L.ok2rgb(ok), 0, 1)
    # the lobby seen through glass: a little soft
    lobby = np.isin(lab, [fid for fid, k in kinds.items() if k in ('lobby', 'lamp', 'plant')]).astype(np.float64)
    soft = np.dstack([cv2.GaussianBlur(np.ascontiguousarray(out[..., c]).astype(np.float32), (0, 0), 1.6) for c in range(3)])
    out = out * (1 - lobby[..., None] * 0.85) + soft * lobby[..., None] * 0.85
    return out


# ---------------------------------------------------------------- the pieces
def crop_box(a, pad=2):
    ys, xs = np.nonzero(a > 1 / 255)
    if not len(xs):
        return None
    hh, ww = a.shape
    return (max(0, xs.min() - pad), max(0, ys.min() - pad), min(ww, xs.max() + pad + 1), min(hh, ys.max() + pad + 1))


def save_piece(name, rgba, origin=(0, 0), flat=False):
    a = rgba[..., 3]
    bx = crop_box(a)
    if bx is None:
        return None
    x0, y0, x1, y1 = bx
    sub = rgba[y0:y1, x0:x1]
    fn = f'{name}{"_flat" if flat else ""}{EXT}'
    L.save_rgba(os.path.join(PAINT_DIR, fn), sub)
    return dict(file=fn, box=[int(x0 + origin[0]), int(y0 + origin[1]), int(x1 - x0), int(y1 - y0)])


def write_ts(rows, flat=False):
    var = 'FLAT_V8' if flat else 'PIECES_V8'
    fname = 'flat_v8.ts' if flat else 'pieces_v8.ts'
    head = ["// GENERATED by src/look/v8_s1/bake/paint_v8.py" + (" --flat (the set's flat design per plane, unpainted: look 'flat')." if flat else " (the painter v8; paint_test/NOTES.md \"v8\"): each plane's painted"),
            "// " + ("Do not edit by hand; rerun the painter." if flat else "material and its box in frame px. Do not edit by hand; rerun the painter."),
            "import type {PieceSet} from './context';"]
    imps, body = [], ['', f'export const {var}: PieceSet = {{']
    for name in ['sky'] + S.PLANES:
        rr = rows.get(name)
        if not rr:
            continue
        v = 'p_' + name + ('_flat' if flat else '')
        imps.append(f"import {v} from './paint/{rr['file']}';")
        body.append(f"  {name}: {{src: {v}, box: [{', '.join(str(int(x)) for x in rr['box'])}]}},")
    body.append('};')
    open(os.path.join(ROOT, fname), 'w').write('\n'.join(head + imps + body) + '\n')


def design():
    sets, table = S.build()
    out = {}
    films = {}
    for p in S.PLANES:
        film = np.zeros((H, W), np.float32)
        rgb, a, lab = S.rasterize(sets[p], film_out=film)
        out[p] = (rgb.astype(np.float64), a.astype(np.float64), lab)
        films[p] = film
    return sets, table, out, films


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--out', required=True, help='the scratch: design.npz and wet maps for the light bake')
    ap.add_argument('--only', default='')
    a = ap.parse_args()
    os.makedirs(PAINT_DIR, exist_ok=True)
    os.makedirs(a.out, exist_ok=True)
    t0 = time.time()
    sets, table, D, FILMS = design()
    faces_by_id = {f.id: f for f in table}
    # the design for the light bake: per plane alpha + labels, and the face table
    np.savez_compressed(os.path.join(a.out, 'design.npz'), **{f'{p}_a': D[p][1].astype(np.float32) for p in S.PLANES}, **{f'{p}_lab': D[p][2] for p in S.PLANES},
                        **{f'{p}_film': FILMS[p] for p in S.PLANES})
    ftab = {f.id: dict(plane=f.plane, kind=f.kind, n=f.n.tolist(), emit=f.emit, z=f.z, name=f.name, billboard=f.pts is None,
                       p0=(f.pts[0].tolist() if f.pts is not None else None), col=f.col) for f in table}
    json.dump(ftab, open(os.path.join(a.out, 'faces.json'), 'w'))
    print('design', round(time.time() - t0, 1), 's', len(table), 'faces')
    man_path = os.path.join(PAINT_DIR, 'pieces.json')
    man = json.load(open(man_path)) if os.path.exists(man_path) else {}
    flat_rows = {}
    for p in S.PLANES:
        rgb, al, lab = D[p]
        row = save_piece(p, np.dstack([rgb, al]), flat=True)
        if row:
            flat_rows[p] = row
    sky_flat = S.sky_design()[:SKY_H]
    flat_rows['sky'] = save_piece('sky', np.dstack([sky_flat, np.ones(sky_flat.shape[:2])]), flat=True)
    write_ts(flat_rows, flat=True)
    only = [s for s in a.only.split(',') if s] or ['sky'] + S.PLANES
    for name in only:
        t1 = time.time()
        stats = {}
        if name == 'sky':
            rgba, org = paint_sky()
            row = save_piece('sky', rgba, org)
        else:
            rgb, al, lab = D[name]
            if al.max() <= 0:
                continue
            if name == 'street':
                mat, wet, pud = street_material(rgb, al, lab, faces_by_id, 'street')
                np.savez_compressed(os.path.join(a.out, 'wet_street.npz'), wet=wet, pud=pud)
                plan = L.StrokePlan(('v8', 'street'))
                clips, used = {}, set()
                street_marks(plan, mat, al, lab, clips, used, wet)
                painted, sec = L.mypaint(np.dstack([mat, al]), plan.strokes, clips={k: clips[k] for k in used}, tag='v8street')
                painted[..., 3] = al
                rgba = painted
                stats = dict(strokes=plan.count(), mypaint_s=round(sec, 2))
            elif name == 'mid':
                mat, wet, pud = street_material(rgb, al, lab, faces_by_id, 'mid')
                np.savez_compressed(os.path.join(a.out, 'wet_mid.npz'), wet=wet, pud=pud)
                rgba, stats = paint_generic('mid', mat, al, lab, faces_by_id, DOSES['mid'], skip_kinds=('ground', 'kerb'),
                                            extra_marks=lambda pl, rg, aa, lb, cl, us: tree_marks(pl, rg, aa, lb, cl, us, faces_by_id, 'mid'))
            elif name == 'far':
                mat, wet, pud = street_material(rgb, al, lab, faces_by_id, 'far')
                np.savez_compressed(os.path.join(a.out, 'wet_far.npz'), wet=wet, pud=pud)
                lit = np.isin(lab, [fid for fid, f in faces_by_id.items() if f.emit > 0]).astype(np.float64)
                rgba, stats = paint_generic('far', mat, al, lab, faces_by_id, DOSES['far'], skip_kinds=('window', 'ground'),
                                            extra_marks=lambda pl, rg, aa, lb, cl, us: tree_marks(pl, rg, aa, lb, cl, us, faces_by_id, 'far'), keep=lit * 0.7)
            elif name == 'farcity':
                rgba, stats = paint_generic('farcity', rgb, al, lab, faces_by_id, DOSES['farcity'])
            elif name == 'water':
                rgba, stats = water_material(rgb, al, lab, faces_by_id)
            elif name == 'boat':
                rgba, stats = paint_generic('boat', rgb, al, lab, faces_by_id, DOSES['boat'], skip_kinds=('window',))
            elif name == 'building':
                mat = building_material(rgb, al, lab, faces_by_id)
                rgba, stats = paint_generic('building', mat, al, lab, faces_by_id, DOSES['building'],
                                            skip_kinds=('mullion', 'lobby', 'lamp', 'plant', 'officewin', 'lobbyglass', 'doorglass'))
            else:
                rgba = np.dstack([rgb, al])
            row = save_piece(name, rgba)
        if row:
            row.update(stats=stats, seconds=round(time.time() - t1, 2))
            man[name] = row
            print(name, json.dumps({k: v for k, v in row.items() if k != 'stats'}), row['stats'])
    json.dump(man, open(man_path, 'w'), indent=1, sort_keys=True)
    write_ts(man)
    print('total', round(time.time() - t0, 1), 's')


if __name__ == '__main__':
    main()
