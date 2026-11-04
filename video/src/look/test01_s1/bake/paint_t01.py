#!/usr/bin/env python3
"""paint_t01.py: the PAINTER of the hero frame (docs/tests/process_test_01_amsterdam/CARD.md §7; the method of
docs/look/PAINT_RECIPES.md §1, after src/look/v8_s1/bake/paint_v8.py). From the set's design (set_t01.py: every plane's
flat colours and face labels), each plane's MATERIAL in the colour key, painted in one language (never lit: the light
bake, light_t01.py, solves the one dusk rig onto it):
  sky     the recipe book's sky tools (scripts/look/paint/recipes/sky_clouds.py) in a blue-hour palette: a deep indigo
          zenith, the caption field a calm flat periwinkle-slate (warm-white words read on it), a mauve to dusty-rose
          afterglow low down the canal; thin dusk streaks lit from below; nothing in the band
  far     the canal running on: houses, windows tone-on-tone (the lit ones kept), elms as leaf masses, the far bridge,
          the tower; the far dose (few broad marks, lost edges)
  bridge  brick laid in courses (each brick its own value, the joints a breath lighter, never lines), the arch's stone
          headers each their own tone, the coping, the vault's brick; the bikes stay crisp
  boat    the houseboat at the middle dose, its pots and plants
  twin    the PAPER TWIN: every sheet its own tone, a curl of light along one edge, a soft shadow on the sheet under it,
          its handwriting as a TEXTURE of soft sepia marks in rows (never letters, never ink lines); ledgers spine-out
          with raised bands; letters folded; the far twin softer
  water   the canal's dark body, its opacity growing toward us (the twin shows through near the waterline), level
          ripples, a few faint pages afloat
  glow    the waking pages: paper and writing, crisp (the light makes them lanterns)
  trees   the old elms' clumps at the top corners, leaf dabs, October yellow where the lamp reaches
  near    our bow: dark, one optical blur (a near framing object)
Marks through MyPaint (peinten; organic proof 1's scratch: OC_PEINTEN, OC_BRUSHES), planned per face (oc_lib.StrokePlan).
Seeded: a rerun gives the same bytes. From video/ (the organic proof's venv):
    OC_SCRATCH=<scratch>/oc <venv>/python -B src/look/test01_s1/bake/paint_t01.py --out <scratch>/bake [--only sky,twin]"""
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
import set_t01 as S  # noqa: E402
from t01cam import BAND, BR, CX, CY, F, GLOW_IMG, H, HC, W, proj  # noqa: E402

ROOT = os.path.abspath(os.path.join(HERE, '..'))
PAINT_DIR = os.path.join(ROOT, 'paint')
EXT = '.t01piece.png'
VP = (CX, CY)
BRUSH = 'tanda/acrylic-04-paint'
RING_C = proj([0.0, 0.0, BR['zf']])          # the ring's centre on screen (the waterline under the arch)

# ---------------------------------------------------------------- the blue-hour sky palette (one family)
SKY_T01 = {k: SC.hx(v) for k, v in {
    'zenith': '#262955',     # L* 18  deep indigo at the top
    'field': '#4C5087',      # L* 36  the caption field: a calm periwinkle-slate, flat through the band
    'rose': '#6B669A',       # L* 46  violet under the field
    'band': '#9A83A1',       # L* 58  mauve
    'horizon': '#DDB1A6',    # L* 76  the afterglow down the canal = the far AIR
    'glow': '#E9C2AA',       # L* 82  the afterglow's heart (low, behind the far street)
    'sun': '#F2D2B8', 'rim': '#E8BFAE', 'lit': '#D9A9A6', 'half': '#9A7E9E',
    'shade_top': '#3E4274', 'shade': '#353863', 'deep': '#2B2D55', 'streak': '#5A5888', 'bird': '#22223A',
}.items()}


def seeded(*k):
    return np.random.default_rng(int(hashlib.sha256('/'.join(('t01paint',) + tuple(str(x) for x in k)).encode()).hexdigest()[:12], 16))


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


# ---------------------------------------------------------------- the sky
SKY_H = 1240


def sky_ramp(pal, h):
    from scipy.interpolate import PchipInterpolator
    stops = [(0, pal['zenith']), (140, SC.mix(pal['zenith'], pal['field'], 0.45)), (BAND[0] - 20, SC.lift(pal['field'], -0.006)),
             (BAND[1] + 10, pal['field']), (700, pal['rose']), (820, pal['band']), (960, SC.mix(pal['band'], pal['horizon'], 0.6)),
             (1080, pal['horizon']), (h, pal['glow'])]
    ys = np.array([s[0] for s in stops], np.float64)
    cs = np.array([s[1] for s in stops], np.float64)
    return PchipInterpolator(ys, cs, axis=0)(np.arange(h) + 0.5).astype(np.float32)


def paint_sky():
    """The designed gradient, the afterglow's warmth low down the canal, two soft passes of paint-like variation (calm
    inside the band), thin dusk streaks low (dark violet bodies, their undersides lit rose by the afterglow) and a few
    high wisps in the top gutter. Nothing crosses the band."""
    pal = SKY_T01
    rng = seeded('sky')
    hh, ww = SKY_H, W
    sky = SC.Layer(hh, ww, alpha=1.0)
    sky.c[...] = sky_ramp(pal, hh)[:, None, :]
    calm = np.ones(hh, np.float32)
    calm[BAND[0] - 30:BAND[1] + 30] = 0.2
    # the afterglow: a low wide warmth centred down the canal, never reaching the band
    g = SC.sun_warmth(hh, ww, (GLOW_IMG[0], GLOW_IMG[1] + 40), 0.62 * ww, 0.34 * ww, BAND[1] + 130) * 0.8
    sky.c[...] = sky.c + (pal['glow'] - sky.c) * g[..., None]
    # P1: big soft strokes, P2: smaller ones (the paint moving in the field), both calm in the band
    p1 = SC.Layer(hh, ww)
    for _ in range(16):
        y = rng.uniform(0, hh)
        x = rng.uniform(-0.3, 0.7) * ww
        Ln = rng.uniform(0.5, 1.1) * ww
        ang = math.radians(rng.normal(-3, 2))
        yi = int(np.clip(y, 0, hh - 1))
        base = sky.c[yi, int(np.clip(x + Ln / 2, 0, ww - 1))]
        dl = rng.choice([-1, 1]) * rng.uniform(0.008, 0.013) * calm[yi]
        col = SC.lift(base, dl, rng.normal(0, 0.003) * calm[yi], rng.normal(0, 0.004) * calm[yi])
        SC.paint_line(p1, (x, y), (x + Ln * math.cos(ang), y + Ln * math.sin(ang)), rng.uniform(160, 320), col, rng.uniform(0.3, 0.45), round_=True, t_in=0.3, t_out=0.3)
    p1.blur(24).onto(sky)
    p2 = SC.Layer(hh, ww)
    for _ in range(80):
        y, x = rng.uniform(0, hh), rng.uniform(-0.2, 0.9) * ww
        Ln = rng.uniform(0.25, 0.6) * ww
        ang = math.radians(rng.normal(-4, 3))
        yi = int(np.clip(y, 0, hh - 1))
        col = SC.lift(sky.c[yi, int(np.clip(x + Ln / 2, 0, ww - 1))], rng.choice([-1, 1]) * rng.uniform(0.007, 0.012) * calm[yi])
        SC.paint_line(p2, (x, y), (x + Ln * math.cos(ang), y + Ln * math.sin(ang)), rng.uniform(40, 90), col, rng.uniform(0.3, 0.45), round_=True, t_in=0.3, t_out=0.4)
    p2.blur(6).onto(sky)
    # the low dusk streaks: rows under the band, longer and thinner lower down, lit underneath by the afterglow
    rows = [(668, 20.0, 34.0), (724, 14.0, 26.0), (778, 10.0, 18.0)]
    for ri, (y0, wmin, wmax) in enumerate(rows):
        x = rng.uniform(-220, 40)
        while x < ww + 60:
            Ln = float(np.exp(rng.uniform(np.log(180), np.log(620 - 90 * ri))))
            gap = rng.uniform(60, 260)
            yy = y0 + rng.normal(0, 6)
            wd = rng.uniform(wmin, wmax)
            xc = x + Ln / 2
            near = float(np.exp(-abs(xc - GLOW_IMG[0]) / 420.0))
            base = sky.c[int(np.clip(yy, 0, hh - 1)), int(np.clip(xc, 0, ww - 1))]
            body = SC.lift(SC.mix(base, pal['streak'], 0.42 - 0.06 * ri), -0.012)
            ang = math.radians(rng.normal(0, 0.5))
            p0 = (x, yy)
            p1_ = (x + Ln * math.cos(ang), yy + Ln * math.sin(ang))
            SC.paint_line(sky, p0, p1_, wd, body, rng.uniform(0.35, 0.55), round_=True, t_in=0.35, t_out=0.4, taper_w=0.5)
            lit = SC.lift(SC.mix(body, pal['rim'], 0.3 + 0.35 * near), 0.008 + 0.02 * near)
            SC.paint_line(sky, (p0[0] + 20, p0[1] + wd * 0.22), (p1_[0] - 20, p1_[1] + wd * 0.22), wd * 0.45, lit, 0.22 + 0.3 * near, round_=True,
                          t_in=0.35, t_out=0.4, taper_w=0.6)
            x += Ln + gap
    # high wisps in the top gutter (dark violet, faint lit undersides): the sky is never an empty field
    for (x0, y0, Ln, wd) in [(-60, 92, 520, 26), (640, 58, 470, 20), (200, 196, 380, 14), (760, 232, 300, 12)]:
        base = sky.c[int(y0), int(np.clip(x0 + Ln / 2, 0, ww - 1))]
        body = SC.lift(SC.mix(base, pal['deep'], 0.5), -0.012)
        SC.paint_line(sky, (x0, y0), (x0 + Ln, y0 - 6), wd, body, 0.55, round_=True, t_in=0.35, t_out=0.4)
        SC.paint_line(sky, (x0 + 30, y0 + wd * 0.3), (x0 + Ln - 40, y0 + wd * 0.3 - 6), wd * 0.35, SC.lift(body, 0.022, 0.004, 0.0), 0.35, round_=True, t_in=0.35, t_out=0.4)
    # the caption band: one calm field (LAYOUT §1: the words sit on a flat sky): each row's lightness pulled to a
    # nearly level ramp across the band, eased in and out at its edges so the sky stays one gradient
    ok = sky.c.astype(np.float64)          # the recipe's layers hold OKLab (sky_clouds.Layer)
    y0b, y1b = BAND[0] - 30, BAND[1] + 30
    n = y1b - y0b
    ease = np.ones(n)
    ease[:30] = np.linspace(0, 1, 30)
    ease[-30:] = np.linspace(1, 0, 30)
    for ch, keep in ((0, 0.004), (1, 0.0), (2, 0.0)):
        big = cv2.GaussianBlur(np.ascontiguousarray(ok[y0b:y1b, :, ch]).astype(np.float32), (0, 0), 40).astype(np.float64)
        ref = float(big[30:50, 100:ww - 100].mean())
        tgt = ref + keep * np.linspace(0, 1, n)[:, None]
        ok[y0b:y1b, :, ch] += (tgt - big) * ease[:, None]
    sky.c[...] = ok.astype(sky.c.dtype)
    rgb8 = sky.rgb(dither_seed=101)
    rgb = rgb8.astype(np.float64) / 255.0 if rgb8.dtype == np.uint8 else np.clip(rgb8, 0, 1)
    return np.dstack([rgb, np.ones((hh, ww))]), (0, 0)


# ---------------------------------------------------------------- the generic plane painter (v8's, toward the afterglow)
def face_dir(face, x, y):
    if face.pts is None:
        return None
    n = face.n
    if abs(n[0]) > 0.7 or abs(n[1]) > 0.7:
        d = np.array([VP[0] - x, VP[1] - y], np.float64)
        nd = np.linalg.norm(d)
        return d / nd if nd > 1 else np.array([1.0, 0.0])
    return np.array([1.0, 0.0])


def colour_move(rgb, a, key, dose):
    """Colour moving inside every face: a slow mottle and a ramp toward the afterglow; OKLab, never greying."""
    ok = L.rgb2ok(np.clip(rgb, 0, 1))
    mott = vnoise(key + '/mott', a.shape, 90 * dose['scale'], 3)
    yy, xx = np.mgrid[0:a.shape[0], 0:a.shape[1]].astype(np.float32)
    ds = np.hypot(xx - GLOW_IMG[0], yy - GLOW_IMG[1])
    toward = np.clip(1 - ds / 1400.0, 0, 1)
    ok[..., 0] += mott * dose['mott'] + (toward - 0.5) * dose['ramp']
    ok[..., 2] += (toward - 0.5) * dose['ramp'] * 0.35
    return np.clip(L.ok2rgb(ok), 0, 1)


def plan_faces(plan, rgb, lab, faces_by_id, dose, clips, used, skip_kinds=()):
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
                if d is None or f.kind in ('crown',):
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
                c = base + np.array([r.choice([-1, 1]) * r.uniform(*dose['dl']), r.normal(0, 0.004), r.normal(0, 0.006)])
                plan.add('face', BRUSH, [p0, p1], L.ok2rgb(c), r.uniform(*dose['width']), r.uniform(*dose['op']), clip=key, ds=1.0, flat_p=r.uniform(0.7, 0.9))


def lost_edges(plan, rgb, lab, dose):
    """On LOST edges (two neighbouring faces within a few L*), short strokes lap across: the ruler line breaks."""
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
        ang = r.uniform(0, math.pi)
        Ls = r.uniform(*dose['lost_len'])
        p0 = (x - math.cos(ang) * Ls / 2, y - math.sin(ang) * Ls / 2)
        p1 = (x + math.cos(ang) * Ls / 2, y + math.sin(ang) * Ls / 2)
        plan.add('edge', BRUSH, [p0, p1], rgb[y, x], r.uniform(3.0, 6.0), r.uniform(0.55, 0.8), ds=1.0, flat_p=r.uniform(0.7, 0.9))
        n += 1
        if n >= dose['lost_max']:
            break
    return n


DOSES = {
    'far': dict(scale=1.6, mott=0.010, ramp=0.03, min_area=40, area_per_mark=420, max_marks=12, len=(8, 26), width=(3, 7),
                dl=(0.012, 0.03), op=(0.45, 0.72), cross=0.25, lost_dl=9.0, lost_len=(8, 18), lost_max=160, blur=1.0),
    'bridge': dict(scale=1.0, mott=0.012, ramp=0.02, min_area=60, area_per_mark=700, max_marks=60, len=(16, 60), width=(6, 13),
                   dl=(0.012, 0.028), op=(0.4, 0.66), cross=0.3, lost_dl=9.0, lost_len=(10, 26), lost_max=120, blur=0.0),
    'boat': dict(scale=1.0, mott=0.012, ramp=0.02, min_area=30, area_per_mark=300, max_marks=14, len=(8, 30), width=(3, 7),
                 dl=(0.012, 0.03), op=(0.5, 0.8), cross=0.2, lost_dl=8.0, lost_len=(6, 14), lost_max=40, blur=0.3),
    'trees': dict(scale=1.2, mott=0.014, ramp=0.0, min_area=60, area_per_mark=400, max_marks=30, len=(10, 30), width=(4, 9),
                  dl=(0.014, 0.034), op=(0.5, 0.8), cross=0.3, lost_dl=9.0, lost_len=(10, 26), lost_max=60, blur=0.4),
}


def soften(rgba, sigma, keep=None):
    if sigma <= 0:
        return rgba
    a = rgba[..., 3:4]
    pm = rgba[..., :3] * a

    def bl(im):
        return np.dstack([cv2.GaussianBlur(np.ascontiguousarray(im[..., c]).astype(np.float32), (0, 0), sigma) for c in range(im.shape[2])]).astype(np.float64)
    soft = bl(pm) / np.maximum(bl(a), 1e-4)
    w = (a > 0.4).astype(np.float64)
    if keep is not None:
        w = w * (1 - keep[..., None])
    out = rgba.copy()
    out[..., :3] = np.clip(rgba[..., :3] * (1 - w) + soft * w, 0, 1)
    return out


def paint_generic(name, rgb, a, lab, faces_by_id, dose, extra_marks=None, skip_kinds=(), keep=None, tag=None):
    rgb2 = colour_move(rgb, a, name, dose)
    plan = L.StrokePlan(('t01', name))
    clips, used = {}, set()
    plan_faces(plan, rgb2, lab, faces_by_id, dose, clips, used, skip_kinds=skip_kinds)
    nl = lost_edges(plan, rgb2, lab, dose)
    if extra_marks:
        extra_marks(plan, rgb2, a, lab, clips, used)
    base = np.dstack([rgb2, a])
    painted, sec = L.mypaint(base, plan.strokes, clips={k: clips[k] for k in used}, tag=tag or f't01{name}')
    painted[..., 3] = a
    painted = soften(painted, dose['blur'], keep=keep)
    return painted, dict(strokes=plan.count(), lost=nl, mypaint_s=round(sec, 2))


def leaf_marks(plan, rgb, lab, clips, used, faces_by_id, kinds=('crown',), size=(3, 8), width=(2.4, 5.5), density=80, yellow=0.0, key='crowns'):
    """Leaf dabs on the crowns: short strokes at free angles, the crown's own colours, more at the edge (a broken,
    lost-and-found outline), a few October yellows where `yellow` > 0."""
    r = plan.rng
    crowns = np.isin(lab, [fid for fid, f in faces_by_id.items() if f.kind in kinds])
    if not crowns.any():
        return
    clips[key] = ndi.binary_dilation(crowns, iterations=4).astype(np.uint8)
    used.add(key)
    ys, xs = np.nonzero(crowns)
    edge = crowns & ~ndi.binary_erosion(crowns, iterations=4)
    ey, ex = np.nonzero(edge)
    k = int(min(len(xs) / density, 2400))
    pal = [S.hexrgb(c) for c in (S.K['elm'], S.K['elm2'], S.K['elm3'], '#3F5A50', '#24383A')]
    yel = [S.hexrgb(c) for c in (S.K['elm_y'], S.K['elm_y2'], '#E8BC5A')]
    for i in range(k):
        if i % 3 == 0 and len(ex):
            j = r.integers(len(ex))
            x, y = float(ex[j]), float(ey[j])
        else:
            j = r.integers(len(xs))
            x, y = float(xs[j]), float(ys[j])
        ang = r.uniform(0, math.pi)
        Ls = r.uniform(*size)
        if yellow > 0 and r.random() < yellow:
            base = rgb[int(y), int(x)] * 0.35 + yel[r.integers(len(yel))] * 0.65
        else:
            base = rgb[int(y), int(x)] * 0.6 + pal[r.integers(len(pal))] * 0.4
        c = L.rgb2ok(base) + np.array([r.uniform(-0.04, 0.03), 0, r.normal(0, 0.01)])
        plan.add('leaf', BRUSH, [(x - math.cos(ang) * Ls / 2, y - math.sin(ang) * Ls / 2), (x + math.cos(ang) * Ls / 2, y + math.sin(ang) * Ls / 2)],
                 L.ok2rgb(c), r.uniform(*width), r.uniform(0.6, 0.92), clip=key, ds=1.0)


# ---------------------------------------------------------------- brick, laid in courses (the bridge)
def brick_material(rgb, a, lab, faces_by_id):
    """The spandrel and the vault in brick: courses (each brick its own value and a touch of hue, a few dark clinkers,
    a few weathered pale ones), the joints only a breath lighter (a value, never a drawn line), the whole face moving
    in colour (damp low by the water, weathered streaks under the coping)."""
    out = L.rgb2ok(np.clip(rgb, 0, 1))
    h, w = a.shape
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float64)
    kinds = {fid: f.kind for fid, f in faces_by_id.items()}
    face = np.isin(lab, [fid for fid, k in kinds.items() if k == 'brick'])
    vault = np.isin(lab, [fid for fid, k in kinds.items() if k == 'vault'])
    r = seeded('brick')
    # the front face: world Y per row (frontal: screen y is linear in Y at Z = zf)
    Y = HC - (yy - CY) * BR['zf'] / F
    X = (xx - CX) * BR['zf'] / F
    course = 0.068
    row = np.floor(Y / course).astype(np.int64)
    bw = 0.215
    off = (row % 2) * bw / 2
    col = np.floor((X + off) / bw).astype(np.int64)
    hsh = ((row * 73856093) ^ (col * 19349663)) & 0xFFFFFF
    u1 = (hsh % 1000) / 1000.0
    u2 = ((hsh // 1000) % 1000) / 1000.0
    dv = (u1 - 0.5) * 0.045
    clinker = (u2 > 0.93) * -0.05 + (u2 < 0.04) * 0.035
    fy = (Y / course) - np.floor(Y / course)
    fx = ((X + off) / bw) - np.floor((X + off) / bw)
    joint = np.clip(1 - np.minimum(np.minimum(fy, 1 - fy) * course / 0.012, np.minimum(fx, 1 - fx) * bw / 0.012), 0, 1)
    damp = np.clip(1 - Y / 1.2, 0, 1) * 0.04
    streak = np.clip(vnoise('brick/streaks', (h, w), 60, 2) * 2 + 0.2, 0, 1) * 0.012
    dL = dv + clinker + joint * 0.022 - damp - streak
    out[..., 0] += np.where(face, dL, 0)
    out[..., 1] += np.where(face, (u2 - 0.5) * 0.012, 0)
    out[..., 2] += np.where(face, (u1 - 0.5) * 0.01 - damp * 0.2, 0)
    # the vault: the same brick seen from below, darker and calmer (it is a barrel: a mottle along its strips)
    out[..., 0] += np.where(vault, vnoise('vault', (h, w), 14, 2) * 0.02, 0)
    return np.clip(L.ok2rgb(out), 0, 1)


def stone_marks(plan, rgb, lab, clips, used, faces_by_id):
    """The arch's headers and the coping: each stone a couple of strokes along its own length (weathering), its edges
    found (stones read one by one)."""
    r = plan.rng
    for fid, f in faces_by_id.items():
        if f.kind not in ('voussoir', 'coping') or f.plane != 'bridge':
            continue
        m = lab == fid
        if m.sum() < 30:
            continue
        key = f'stone{fid}'
        clips[key] = m.astype(np.uint8)
        used.add(key)
        ys, xs = np.nonzero(m)
        cxy = np.array([xs.mean(), ys.mean()])
        if f.kind == 'voussoir':
            d = cxy - np.array(RING_C)
            d = d / (np.linalg.norm(d) + 1e-9)
        else:
            d = np.array([1.0, 0.0])
        n = 3 if f.kind == 'voussoir' else 70
        for _ in range(n):
            j = r.integers(len(xs))
            x, y = float(xs[j]), float(ys[j])
            Ls = r.uniform(8, 22) if f.kind == 'voussoir' else r.uniform(20, 60)
            base = L.rgb2ok(rgb[int(y), int(x)])
            c = base + np.array([r.choice([-1, 1]) * r.uniform(0.012, 0.03), 0, r.normal(0, 0.005)])
            plan.add('stone', BRUSH, [(x - d[0] * Ls / 2, y - d[1] * Ls / 2), (x + d[0] * Ls / 2, y + d[1] * Ls / 2)], L.ok2rgb(c), r.uniform(3, 6), r.uniform(0.45, 0.7), clip=key, ds=1.0, flat_p=0.8)


# ---------------------------------------------------------------- the paper twin
def quad_frame(f):
    """A sheet's screen frame: its projected corners (u along the first edge, v along the face), or None."""
    if f.pts is None or len(f.pts) < 4:
        return None
    if (f.pts[:, 2] < 0.5).any():
        return None
    q = proj(f.pts[:4])
    return q


def bilerp(q, u, v):
    """Screen point of (u, v) in 0..1 inside the projected quad q (corners 0, 1, 2, 3 = (0,0), (1,0), (1,1), (0,1))."""
    a = q[0] * (1 - u) + q[1] * u
    b = q[3] * (1 - u) + q[2] * u
    return a * (1 - v) + b * v


def write_rows(ink, q, seed, rows, ss=3, slant=0.18, margin=0.1):
    """Handwriting as a TEXTURE on one sheet: `rows` rows of short soft words (a few wavy points each), a ragged right
    edge, the first row indented: drawn at ss x into `ink` (a supersampled mask); never letters."""
    r = np.random.default_rng(seed)
    du = np.linalg.norm(q[1] - q[0])
    dv = np.linalg.norm(q[3] - q[0])
    if du < 10 or dv < 6:
        return
    nrows = int(min(rows, max(1, dv / 4.2)))
    for i in range(nrows):
        v = margin + (1 - 2 * margin) * (i + 0.5) / nrows
        u = margin + (0.08 if i == 0 else 0.0) + r.uniform(0, 0.03)
        u_end = 1 - margin - r.uniform(0, 0.22)
        while u < u_end:
            wl = r.uniform(0.05, 0.16) * (40.0 / max(du, 40.0)) ** 0.15
            n = max(3, int(wl * du / 2.2))
            us = np.linspace(u, min(u + wl, u_end), n)
            amp = 0.18 / max(nrows, 1)
            vs = v + amp * np.sin(np.linspace(0, r.uniform(4, 9), n) + r.uniform(0, 6)) * r.uniform(0.3, 0.7) - amp * 0.4 * np.linspace(0, 1, n) * slant
            pts = np.array([bilerp(q, a, b) for a, b in zip(us, vs)]) * ss
            cv2.polylines(ink, [np.round(pts * 4).astype(np.int32)], False, 255, max(1, int(round(ss * 0.75))), cv2.LINE_AA, shift=2)
            u += wl + r.uniform(0.02, 0.05)


def paper_material(rgb, a, lab, faces_by_id, plane='twin'):
    """Paper: every sheet its own tone and a curl of light along one edge (its upper edge lifts), a soft shadow cast on
    the sheet below it, its writing in soft sepia rows (the ink a TONE: blurred, never a crisp line); the ledgers'
    spines rounded with raised bands; folded letters; the far twin softer."""
    h, w = a.shape
    ok = L.rgb2ok(np.clip(rgb, 0, 1))
    ss = 3
    ink = np.zeros((h * ss, w * ss), np.uint8)
    curl = np.zeros((h, w), np.float32)
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float64)
    objs = ndi.find_objects(lab)
    for fid0, sl in enumerate(objs):
        if sl is None:
            continue
        fid = fid0 + 1
        f = faces_by_id.get(fid)
        if f is None:
            continue
        k = f.kind
        sub = lab[sl] == fid
        n_px = int(sub.sum())
        if n_px == 0:
            continue
        y0, x0 = sl[0].start, sl[1].start
        if k in ('t_sheet', 't_page', 'page'):
            q = quad_frame(f)
            if q is None or n_px < 30:
                continue
            write_rows(ink, q, f.extra.get('writing', fid), f.extra.get('rows', 8), ss=ss)
            # the curl: light along the sheet's upper screen edge, fading inward
            top_y = min((q[3][1] + q[2][1]) / 2, (q[0][1] + q[1][1]) / 2)
            dvv = max(4.0, abs((q[3][1] + q[2][1]) / 2 - (q[0][1] + q[1][1]) / 2))
            dist = np.abs(yy[sl] - top_y)
            curl[sl] += (sub * np.exp(-dist / (0.18 * dvv))).astype(np.float32)
        elif k == 't_spine':
            ys, xs = np.nonzero(sub)
            ys = ys + y0
            xs = xs + x0
            ang = np.arctan2(ys - RING_C[1], xs - RING_C[0])
            a0, a1 = ang.min(), ang.max()
            across = (ang - (a0 + a1) / 2) / max((a1 - a0) / 2, 1e-4)
            rr = np.hypot(xs - RING_C[0], ys - RING_C[1])
            along = (rr - rr.min()) / max(rr.max() - rr.min(), 1e-4)
            sh = -0.07 * across ** 2 + 0.02 * (1 - np.abs(across))
            nb = f.extra.get('bands', 3)
            band = np.zeros_like(along)
            for bi in range(nb):
                c = (bi + 1) / (nb + 1)
                band += np.exp(-((along - c) / 0.035) ** 2) * 0.05 - np.exp(-((along - c - 0.05) / 0.03) ** 2) * 0.035
            label = ((np.abs(along - 0.5) < 0.12) & (np.abs(across) < 0.55)) * (0.05 if (fid % 3 == 0) else 0.0)
            gilt = np.zeros_like(along)
            for bi in range(nb):
                c = (bi + 1) / (nb + 1)
                gilt += ((np.abs(along - c - 0.03) < 0.012) & (np.abs(across) < 0.62)).astype(np.float64)
            gilt = np.clip(gilt, 0, 1)
            ok[ys, xs, 0] += sh + band + label + gilt * 0.16
            ok[ys, xs, 1] += gilt * 0.006
            ok[ys, xs, 2] += gilt * 0.05
        elif k == 't_pages':
            ys, xs = np.nonzero(sub)
            ys = ys + y0
            xs = xs + x0
            ang = np.arctan2(ys - RING_C[1], xs - RING_C[0])
            a0, a1 = ang.min(), ang.max()
            across = (ang - (a0 + a1) / 2) / max((a1 - a0) / 2, 1e-4)
            # the page edges: fine lines along the book (radial), a soft round at the block's two sides
            ok[ys, xs, 0] += 0.022 * np.sin(across * 15.0 + fid) - 0.05 * across ** 4
        elif k == 't_letter':
            ys, xs = np.nonzero(sub)
            d = xs / max(np.ptp(xs), 1) - ys / max(np.ptp(ys), 1)
            ok[ys + y0, xs + x0, 0] += np.where(d > 0, 0.025, -0.02)
        elif k == 't_ledger':
            ys, xs = np.nonzero(sub)
            ok[ys + y0, xs + x0, 0] += 0.012 * np.sin((ys + y0) * 2.1)
    # the writing: soft, a tone (blurred at ss, then reduced), sepia, a share of the paper's lightness
    inkf = cv2.resize(cv2.GaussianBlur(ink.astype(np.float32) / 255.0, (0, 0), ss * 0.45), (w, h), interpolation=cv2.INTER_AREA)
    paper_kinds = np.isin(lab, [fid for fid, f in faces_by_id.items() if f.kind in ('t_sheet', 't_page', 'page')])
    inkf = inkf * paper_kinds
    ok[..., 0] -= inkf * 0.16
    ok[..., 1] += inkf * 0.008
    ok[..., 2] += inkf * 0.012
    # the curl's light and each sheet's shadow on the one under it (just below its lower edge)
    ok[..., 0] += np.clip(curl, 0, 1) * 0.035 * paper_kinds
    bnd = L.boundaries(np.where(lab > 0, lab, -1)) & paper_kinds
    shadow = cv2.GaussianBlur(bnd.astype(np.float32), (0, 0), 1.6)
    ok[..., 0] -= np.clip(shadow * 0.55, 0, 0.05)
    out = np.clip(L.ok2rgb(ok), 0, 1)
    return out, inkf


def cursive_rows(ink, q, seed, rows, ss=3, margin=0.09):
    """Handwriting as a TEXTURE on a page: rows of words made of small connected loops (the pen moving along while it
    loops), each word its own length, a ragged right edge; drawn thin at ss x into `ink`. Never letters."""
    r = np.random.default_rng(seed)
    du = np.linalg.norm(q[1] - q[0])
    dv = np.linalg.norm(q[3] - q[0])
    if du < 20 or dv < 10:
        return
    nrows = int(min(rows, max(1, dv / 7.5)))
    lh = (1 - 2 * margin) / nrows
    for i in range(nrows):
        v = margin + lh * (i + 0.62)
        u = margin + (0.07 if i == 0 else 0.0)
        u_end = 1 - margin - r.uniform(0, 0.25)
        while u < u_end:
            nl = int(r.integers(3, 9))
            step = 3.3 / du
            n = nl * 10
            t = np.linspace(0, nl, n)
            loop_r = 0.34 * lh * r.uniform(0.8, 1.1)
            us = u + t * step + 0.45 * step * np.sin(t * 2 * np.pi)
            vs = v - loop_r * (1 - np.cos(t * 2 * np.pi)) * (0.55 + 0.45 * np.abs(np.sin(t * 1.7 + i)))
            us = np.clip(us, 0, u_end)
            pts = np.array([bilerp(q, a, b) for a, b in zip(us, vs)]) * ss
            cv2.polylines(ink, [np.round(pts * 4).astype(np.int32)], False, 255, max(1, int(round(ss * 0.42))), cv2.LINE_AA, shift=2)
            u += nl * step + r.uniform(0.03, 0.06)


def parchment_ground(h, w, y_top):
    """The twin of the sky (what the water would mirror between the twin's houses and through the ring): old pages laid
    edge to edge, each its own tone and age stains, a soft shadow under each page's upper edge, and rows of handwriting
    as a TEXTURE (soft sepia marks, never letters). Returns rgb, alpha (1 below y_top) and its ink map."""
    r = seeded('parchment')
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float64)
    base = np.array(S.hexrgb('#DCCBA4'))
    ok = L.rgb2ok(np.broadcast_to(base, (h, w, 3)).copy())
    ok[..., 0] += vnoise('parch/stain', (h, w), 70, 3) * 0.035 + vnoise('parch/fine', (h, w), 9, 2) * 0.012
    ss = 3
    ink = np.zeros((h * ss, w * ss), np.uint8)
    edge = np.zeros((h, w), np.float32)
    row_h = 86.0
    y = y_top - r.uniform(0, 40)
    i = 0
    while y < h:
        ph = row_h * r.uniform(0.85, 1.15)
        x = -r.uniform(0, 160)
        while x < w:
            pw = r.uniform(100, 150)
            sk = r.uniform(-4, 4)
            q = np.array([[x, y + sk], [x + pw, y - sk], [x + pw, y + ph - sk], [x, y + ph + sk]], np.float64)
            tone = r.uniform(-0.03, 0.03)
            m = np.zeros((h, w), np.uint8)
            cv2.fillPoly(m, [np.round(q * 4).astype(np.int32)], 1, cv2.LINE_AA, shift=2)
            mm = m.astype(bool)
            ok[..., 0] += np.where(mm, tone, 0)
            ok[..., 2] += np.where(mm, r.uniform(-0.006, 0.01), 0)
            # the page's upper edge: a soft shadow just under it (the page above overlaps it)
            top_y = y + sk
            edge += (mm * np.exp(-np.clip(yy - top_y, 0, None) / 3.0) * (yy >= top_y)).astype(np.float32)
            cursive_rows(ink, q, int(r.integers(1, 1 << 30)), int(ph / 7.5), ss=ss, margin=0.09)
            # now and then a corner lifts (a lighter fold catching the light)
            if r.random() < 0.35:
                cx_, cy_ = (q[1] if r.random() < 0.5 else q[2])
                sz = r.uniform(10, 18)
                sx_ = -1 if cx_ > x + pw / 2 else 1
                sy_ = 1 if cy_ < y + ph / 2 else -1
                tri = np.array([[cx_, cy_], [cx_ + sx_ * sz, cy_], [cx_, cy_ + sy_ * sz]])
                tm = np.zeros((h, w), np.uint8)
                cv2.fillPoly(tm, [np.round(tri * 4).astype(np.int32)], 1, cv2.LINE_AA, shift=2)
                ok[..., 0] += tm * 0.06
            x += pw - r.uniform(2, 14)
        y += ph - r.uniform(2, 10)
        i += 1
    inkf = cv2.resize(cv2.GaussianBlur(ink.astype(np.float32) / 255.0, (0, 0), ss * 0.35), (w, h), interpolation=cv2.INTER_AREA)
    ok[..., 0] -= inkf * 0.24 + np.clip(edge, 0, 1) * 0.08
    ok[..., 2] += inkf * 0.012
    rgb = np.clip(L.ok2rgb(ok), 0, 1)
    alpha = (yy >= y_top).astype(np.float64)
    return rgb, alpha, inkf * alpha


# ---------------------------------------------------------------- the water
def water_material(rgb, a, lab):
    """The canal's dark body and how much of the twin it lets through: little near the waterline (the twin is clear in
    the ring), more toward us (the twin sinks into dark water by the bottom), level ripple marks, coarse near, fine far,
    and a few faint pages afloat."""
    h, w = a.shape
    yy = np.arange(h, dtype=np.float64)[:, None] * np.ones((1, w))
    ok = L.rgb2ok(np.clip(rgb, 0, 1))
    t = np.clip((yy - CY) / 700.0, 0, 1)
    ok[..., 0] += -0.02 * t
    out = np.clip(L.ok2rgb(ok), 0, 1)
    # the opacity: the water body over the twin (0 = the twin shows fully)
    yw = RING_C[1]
    op = 0.10 + 0.78 * SC.smoothstep(yw + 140, h + 80, yy) + 0.06 * SC.smoothstep(yw - 120, yw + 140, yy)
    op = op * (yy > CY)
    alpha = np.clip(op, 0, 1) * a
    plan = L.StrokePlan(('t01', 'water'))
    r = plan.rng
    ck = 'water'
    clips = {ck: (a > 0.5).astype(np.uint8)}
    ys, xs = np.nonzero(a > 0.6)
    marks = np.zeros((h, w), np.float32)
    for _ in range(520):
        j = r.integers(len(xs))
        x, y = float(xs[j]), float(ys[j])
        near = np.clip((y - CY) / 700.0, 0, 1)
        Ls = 12 + near * r.uniform(30, 140) + r.uniform(0, 24)
        wdt = 1.2 + near * r.uniform(2.0, 6.0)
        c = L.rgb2ok(out[int(y), int(x)]) + np.array([r.choice([-1, 1]) * r.uniform(0.02, 0.05), 0, r.normal(0, 0.006)])
        plan.add('ripple', BRUSH, [(x - Ls / 2, y), (x + Ls / 2, y + r.normal(0, 0.3))], L.ok2rgb(c), wdt, r.uniform(0.35, 0.65), clip=ck, ds=1.0, flat_p=r.uniform(0.6, 0.85))
    painted, sec = L.mypaint(np.dstack([out, np.ones((h, w))]), plan.strokes, clips=clips, tag='t01water')
    # the ripples also break the twin a little: where a mark sits, the water is a touch more opaque
    diff = np.abs(painted[..., :3] - out).sum(-1)
    marks = np.clip(diff * 6, 0, 1)
    alpha = np.clip(alpha + marks * 0.25 * (a > 0), 0, 1)
    painted[..., 3] = alpha
    return painted, dict(strokes=plan.count(), mypaint_s=round(sec, 2))


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
    var = 'FLAT_T01' if flat else 'PIECES_T01'
    fname = 'flat_t01.ts' if flat else 'pieces_t01.ts'
    head = ["// GENERATED by src/look/test01_s1/bake/paint_t01.py" + (" --flat (the set's flat design per plane, unpainted: look 'flat')." if flat else " (the painter: each plane's painted material and its box"),
            "// " + ("Do not edit by hand; rerun the painter." if flat else "in frame px). Do not edit by hand; rerun the painter."),
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
    for p in S.PLANES:
        rgb, a, lab = S.rasterize(sets[p])
        out[p] = (rgb.astype(np.float64), a.astype(np.float64), lab)
    return sets, table, out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--out', required=True, help='the scratch: design.npz, faces.json and the ink map for the light bake')
    ap.add_argument('--only', default='')
    a = ap.parse_args()
    os.makedirs(PAINT_DIR, exist_ok=True)
    os.makedirs(a.out, exist_ok=True)
    t0 = time.time()
    sets, table, D = design()
    faces_by_id = {f.id: f for f in table}
    np.savez_compressed(os.path.join(a.out, 'design.npz'), **{f'{p}_a': D[p][1].astype(np.float32) for p in S.PLANES}, **{f'{p}_lab': D[p][2] for p in S.PLANES})
    ftab = {f.id: dict(plane=f.plane, kind=f.kind, n=f.n.tolist(), emit=f.emit, z=f.z, name=f.name, billboard=f.pts is None, twin=f.twin,
                       p0=(f.pts[0].tolist() if f.pts is not None else None), col=f.col, lantern=f.extra.get('lantern', 0.0)) for f in table}
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
        row = None
        if name == 'sky':
            rgba, org = paint_sky()
            row = save_piece('sky', rgba, org)
        else:
            rgb, al, lab = D[name]
            if al.max() <= 0:
                continue
            if name == 'far':
                lit = np.isin(lab, [fid for fid, f in faces_by_id.items() if f.emit > 0]).astype(np.float64)
                rgba, stats = paint_generic('far', rgb, al, lab, faces_by_id, DOSES['far'], skip_kinds=('window', 'frame', 'beam', 'trim', 'door'),
                                            extra_marks=lambda pl, rg, aa, lb, cl, us: leaf_marks(pl, rg, lb, cl, us, faces_by_id, size=(2.5, 6), width=(2.0, 3.6), density=110),
                                            keep=lit * 0.8)
            elif name == 'bridge':
                mat = brick_material(rgb, al, lab, faces_by_id)
                keep = np.isin(lab, [fid for fid, f in faces_by_id.items() if f.kind == 'bike']).astype(np.float64)
                rgba, stats = paint_generic('bridge', mat, al, lab, faces_by_id, DOSES['bridge'], skip_kinds=('bike', 'voussoir', 'coping', 'pier'),
                                            extra_marks=lambda pl, rg, aa, lb, cl, us: stone_marks(pl, rg, lb, cl, us, faces_by_id), keep=keep)
            elif name == 'boat':
                rgba, stats = paint_generic('boat', rgb, al, lab, faces_by_id, DOSES['boat'], skip_kinds=('window',),
                                            extra_marks=lambda pl, rg, aa, lb, cl, us: leaf_marks(pl, rg, lb, cl, us, faces_by_id, kinds=('plant',), size=(2.5, 6), width=(2.0, 3.5), density=30, key='plants'))
            elif name == 'trees':
                plan = L.StrokePlan(('t01', 'trees'))
                clips, used = {}, set()
                mat = colour_move(rgb, al, 'trees', DOSES['trees'])
                leaf_marks(plan, mat, lab, clips, used, faces_by_id, size=(4, 12), width=(3.5, 8.0), density=34, yellow=0.12)
                painted, sec = L.mypaint(np.dstack([mat, al]), plan.strokes, clips={k: clips[k] for k in used}, tag='t01trees')
                # the clumps' edges broken by the leaves: the painted alpha follows the marks a little past the blob
                painted[..., 3] = np.clip(np.maximum(al, (np.abs(painted[..., :3] - mat).sum(-1) > 0.02) * 0.9 * ndi.binary_dilation(al > 0.5, iterations=4)), 0, 1)
                rgba, stats = painted, dict(strokes=plan.count(), mypaint_s=round(sec, 2))
            elif name == 'twin':
                mat, inkf = paper_material(rgb, al, lab, faces_by_id)
                prgb, pal, pink = parchment_ground(H, W, int(CY) + 1)
                mat = mat * al[..., None] + prgb * (1 - al[..., None])
                inkf = inkf * al + pink * (1 - al)
                al = np.maximum(al, pal)
                np.save(os.path.join(a.out, 'twin_ink.npy'), inkf.astype(np.float16))
                # the far twin (beyond the bridge's twin) a little softer; the near twin crisp
                far = np.isin(lab, [fid for fid, f in faces_by_id.items() if f.twin and f.z > BR['zb'] + 2]).astype(np.float64)
                rgba = np.dstack([mat, al])
                soft = soften(rgba, 1.1)
                rgba[..., :3] = rgba[..., :3] * (1 - far[..., None]) + soft[..., :3] * far[..., None]
            elif name == 'water':
                rgba, stats = water_material(rgb, al, lab)
            elif name == 'glow':
                mat, inkf = paper_material(rgb, al, lab, faces_by_id, plane='glow')
                np.save(os.path.join(a.out, 'glow_ink.npy'), inkf.astype(np.float16))
                rgba = np.dstack([mat, al])
            elif name == 'near':
                rgba = soften(np.dstack([rgb, al]), 2.6)
                rgba[..., 3] = cv2.GaussianBlur(al.astype(np.float32), (0, 0), 2.2)
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
