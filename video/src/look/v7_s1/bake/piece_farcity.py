"""piece_farcity.py: painter v7's FAR CITY through the west gap (ORGANIC.md §6 step 3c; §5's rows +2, +3, +4: "farther
objects are more like brushes and painting", the owner, 2026-10-30): the far roofs (+4), the calm tower (+3) and the
bridge (+2), v7a's flat west gap (the scene's own hazed vector: the painter's far-city pieces were lost to a manifest
merge, NOTES.md v7a's flags) repainted at their far doses:
  1. NO TEMPLATE: the tower's window grid tone-on-tone (each window lerped 55-90 % toward the wall: dE <= 6, a few lost
     outright), the far roofs' windows likewise.
  2. TOPS LOST BY THE SUN: within ~190 px of the sun's disc the rooflines dissolve into the bright air (the silhouette's
     alpha softened and its colour lerped toward the haze).
  3. MARKS, few, broad and visible (the coarse passes only): level strokes on the roofs and the bridge, vertical on the
     tower, each in its own stone +-2 L*.
  4. THE PLANE'S BLUR (PAINT_RECIPES §1's ladder): +4 1.6 px, +3 0.9 px, +2 0.5 px, premultiplied.
The far towpath's people and furniture are other segments (crisp by tier, the light calms them). Seeded."""
from __future__ import annotations

import math
import os
import sys

import cv2
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
VIDEO = os.path.abspath(os.path.join(HERE, '..', '..', '..', '..'))
sys.path.insert(0, HERE)
sys.path.insert(0, os.path.join(VIDEO, 'scripts', 'look', 'organic'))
import oc_lib as L  # noqa: E402
from v7common import all_alphas, far_split, value_noise  # noqa: E402

BOX = (0, 585, 384, 475)                 # frame px: the west gap (x 0-371, y 590-1055)
SUN = (195.0, 750.0)
BLUR = {'roofs': 1.6, 'tower': 0.9, 'bridge': 0.5}


def make(parts, seed='v7/farcity'):
    X0, Y0, W, H = BOX
    k = L.load_rgba(os.path.join(parts, 'seg_westgap_k.png'))[Y0:Y0 + H, X0:X0 + W, :3]
    w = L.load_rgba(os.path.join(parts, 'seg_westgap_w.png'))[Y0:Y0 + H, X0:X0 + W, :3]
    alpha = np.clip(1 - (w - k).mean(2), 0, 1)
    # the straight colour where the matte is solid; the anti-aliased rim takes its nearest solid pixel's colour (k / alpha
    # at a thin rim amplifies the slab's noise into dark specks)
    solid = alpha > 0.3
    col = np.where(solid[..., None], np.clip(k / np.maximum(alpha[..., None], 1e-3), 0, 1), 0)
    from scipy import ndimage as ndi
    idx = ndi.distance_transform_edt(~solid, return_distances=False, return_indices=True)
    col = np.where(solid[..., None], col, col[idx[0], idx[1]])
    A = all_alphas(parts)
    roofs, tower, bridge = (m[Y0:Y0 + H, X0:X0 + W] for m in far_split(parts, A))
    tot = np.maximum(roofs + tower + bridge, 1e-6)
    planes = {'roofs': roofs / tot, 'tower': tower / tot, 'bridge': bridge / tot}
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float64)
    fx, fy = xx + X0, yy + Y0
    ok = L.rgb2ok(col)
    Lc = L.Lstar(col)
    rng = L.seeded(seed)
    # 1. windows tone-on-tone: in the tower and the roofs, the small darker cells pulled toward their wall
    nwin = 0
    for name in ('tower', 'roofs'):
        pm = (planes[name] > 0.6) & (alpha > 0.9)
        if pm.sum() < 50:
            continue
        med = cv2.medianBlur((np.clip(Lc, 0, 100) * 2.55).astype(np.uint8), 15).astype(np.float64) / 2.55
        win = pm & (np.abs(Lc - med) > 3.0)
        n, cc, st, _ = cv2.connectedComponentsWithStats(win.astype(np.uint8), 8)
        wall = cv2.medianBlur(np.ascontiguousarray((col * 255).astype(np.uint8)), 15).astype(np.float64) / 255.0
        wall_ok = L.rgb2ok(wall)
        for i in range(1, n):
            x, y, ww, hh, area = st[i]
            if area < 4 or area > 600:
                continue
            m = cc == i
            t = 1.0 if rng.random() < 0.4 else rng.uniform(0.72, 0.95)
            ok[m] = ok[m] * (1 - t) + wall_ok[m] * t
            nwin += 1
    # 2. the tops lost by the sun: the haze's colour near the disc (the air behind the roofs), the silhouette softened
    haze = L.rgb2ok(L.hx('#F2D8C8'))
    dsun = np.hypot((fx - SUN[0]) / 1.4, fy - SUN[1])
    near_sun = 1 - L.smoothstep(40.0, 190.0, dsun)
    top = np.zeros((H, W))
    for name in ('roofs', 'tower'):
        pm = (planes[name] > 0.5) & (alpha > 0.5)
        dist_top = cv2.distanceTransform(pm.astype(np.uint8), cv2.DIST_L2, 3)
        # the band under each silhouette's top edge (the top 3-14 px, by the sun's nearness)
        band = pm & (dist_top < 3 + 11 * near_sun)
        top = np.maximum(top, band * (0.45 + 0.4 * near_sun))
    lostw = (top * near_sun * (0.5 + 0.5 * value_noise(f'{seed}/tops', (H, W), 22, octaves=2)))[..., None]
    ok = ok * (1 - lostw) + haze[None, None] * lostw
    base = L.ok2rgb(ok)
    # 3. a few broad marks per plane (the coarse passes only)
    plan = L.StrokePlan((seed, 'plan'))
    r = plan.rng
    clips = {}
    for name, n_marks, vertical, wd in (('roofs', 14, False, (8, 14)), ('tower', 12, True, (9, 16)), ('bridge', 10, False, (6, 11))):
        pm = (planes[name] > 0.6) & (alpha > 0.9)
        if pm.sum() < 200:
            continue
        clips[name] = pm.astype(np.float64)
        ys, xs = np.nonzero(pm)
        for _ in range(n_marks):
            j = r.integers(len(xs))
            x, y = xs[j], ys[j]
            Ls = r.uniform(30, 80)
            ang = math.pi / 2 if vertical else r.normal(0, 0.03)
            pts = [(x - math.cos(ang) * Ls / 2, y - math.sin(ang) * Ls / 2), (x + math.cos(ang) * Ls / 2, y + math.sin(ang) * Ls / 2)]
            c = L.rgb2ok(base[y, x]) + np.array([r.choice([-1, 1]) * r.uniform(0.012, 0.024), 0, r.normal(0, 0.003)])
            plan.add('far', 'tanda/acrylic-03-with-water', pts, L.ok2rgb(c), r.uniform(*wd), r.uniform(0.35, 0.6), clip=name, ds=1.5, flat_p=r.uniform(0.6, 0.85))
    painted, sec = L.mypaint(np.dstack([base, alpha]), plan.strokes, clips=clips, tag='v7farcity')
    # 4. the plane's blur, premultiplied, per plane (weights by the plane split); the tops' alpha softened by the sun
    rgb, a = painted[..., :3], painted[..., 3]
    out_pm = np.zeros((H, W, 3))
    out_a = np.zeros((H, W))
    for name, sg in BLUR.items():
        wgt = planes[name]
        bl = lambda im: cv2.GaussianBlur(np.ascontiguousarray(im).astype(np.float32), (0, 0), sg).astype(np.float64)
        pm_ = np.dstack([bl(rgb[..., c] * a * wgt) for c in range(3)])
        out_pm += pm_
        out_a += bl(a * wgt)
    soft_a = cv2.GaussianBlur(out_a.astype(np.float32), (0, 0), 2.0).astype(np.float64)
    out_a = out_a * (1 - near_sun * 0.6 * top) + soft_a * near_sun * 0.6 * top
    out = np.dstack([np.clip(out_pm / np.maximum(out_a, 1e-4)[..., None], 0, 1), np.clip(out_a, 0, 1)])
    out[..., :3] = np.where(out[..., 3:4] > 1e-3, out[..., :3], 0)
    stats = dict(box=list(BOX), windows_toned=nwin, strokes=plan.count(), mypaint_s=round(sec, 2))
    return out, stats
