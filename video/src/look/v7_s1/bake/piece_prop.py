"""piece_prop.py: painter v7's KEPT PROP, the café table and chair cut by the right edge (ORGANIC.md §6 step 3c: "the
kept prop at the near dose (hand-cut, a light ramp, edge strokes), so nothing reads pasted"; §5's near frame -2: few
marks, within ~8 L* of its shade mass, its outline lost where it meets the quay at a close value). v7a's flat props (the
near segment's solid faces, keyed) repainted over themselves, the same silhouette:
  1. HAND-CUT: the faces' region map bowed by a sub-pixel displacement (0.5 px).
  2. A LIGHT RAMP inside every face: lit from the sky above (+3 L* at its top, -3 at its foot), a warm lean on the
     faces turned toward the door's light behind them.
  3. MARKS, few: one to three flat strokes along each big face's form (the seat and the table top level, the back and
     the legs along their length), a value step off the face.
  4. THE OUTLINE by intent: softened (a premultiplied 1.1 px blur of its rim) where the prop meets the dark quay, found
     only along the chair's lit top edge.
Its soft contact shadows stay the near segment's own (a multiply layer: never baked twice). Seeded."""
from __future__ import annotations

import math
import os
import sys

import cv2
import numpy as np
from scipy import ndimage as ndi

HERE = os.path.dirname(os.path.abspath(__file__))
VIDEO = os.path.abspath(os.path.join(HERE, '..', '..', '..', '..'))
sys.path.insert(0, HERE)
sys.path.insert(0, os.path.join(VIDEO, 'scripts', 'look', 'organic'))
import oc_lib as L  # noqa: E402
from piece_facade import components, face_props  # noqa: E402  (organic proof 1's faces)
from v7common import value_noise  # noqa: E402

BOX = (740, 1500, 340, 420)              # frame px: the table and the chair (the near segment's x 790-1080, y 1530-1900)


def make(parts, seed='v7/prop'):
    X0, Y0, W, H = BOX
    k = L.load_rgba(os.path.join(parts, 'seg_near_k.png'))[Y0:Y0 + H, X0:X0 + W, :3]
    w = L.load_rgba(os.path.join(parts, 'seg_near_w.png'))[Y0:Y0 + H, X0:X0 + W, :3]
    a = np.clip(1 - (w - k).mean(2), 0, 1)
    solid = a > 0.85
    col = np.where(solid[..., None], np.clip(k / np.maximum(a[..., None], 1e-3), 0, 1), 0)
    idx = ndi.distance_transform_edt(~solid, return_distances=False, return_indices=True)
    col = np.where(solid[..., None], col, col[idx[0], idx[1]])
    # the solid props only (the contact shadows are the segment's multiply layer, kept as drawn)
    alpha = np.where(a > 0.85, a, np.where(ndi.binary_dilation(solid, iterations=1), a * (a > 0.5), 0.0))
    rgba = np.dstack([col, (alpha > 0.5).astype(np.float64)])
    lab, cols = L.flat_labels(rgba, min_px=12)

    def bow(tag):
        nz = value_noise(f'{seed}/{tag}', (H, W), 60, octaves=1)
        return (0.5 * nz / (nz.std() + 1e-9)).astype(np.float32)
    lab = L.warp_labels(lab, bow('bx'), bow('by'))
    lab[alpha < 0.5] = -1
    comp, colour_of = components(lab)
    n = len(colour_of)
    props = face_props(comp, n)
    base = L.recolour(lab, cols)
    base = np.where((lab >= 0)[..., None], base, col)
    ok = L.rgb2ok(base)
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float64)
    rng = L.seeded(seed)
    for i, p in enumerate(props):
        if p is None or p['area'] < 30:
            continue
        m = comp == i
        x0, y0, x1, y1 = p['bbox']
        hy = np.clip((yy[m] - y0) / max(y1 - y0, 1), 0, 1)
        ok[m, 0] += 0.03 * (0.5 - hy) * rng.uniform(0.7, 1.2) + rng.normal(0, 0.006)
        ok[m, 2] += 0.006 * (0.5 - hy)
    target = L.ok2rgb(ok)
    plan = L.StrokePlan((seed, 'plan'))
    r = plan.rng
    used = set()
    for i, p in enumerate(props):
        if p is None or p['area'] < 250:
            continue
        m = comp == i
        ys, xs = np.nonzero(m)
        x0, y0, x1, y1 = p['bbox']
        vertical = (y1 - y0) > (x1 - x0) * 1.2
        for _ in range(int(np.clip(p['area'] / 900, 1, 3))):
            j = r.integers(len(xs))
            x, y = xs[j], ys[j]
            Ls = min(r.uniform(18, 44), (y1 - y0 if vertical else x1 - x0) * 0.8)
            if Ls < 8:
                continue
            ang = math.pi / 2 if vertical else math.radians(r.uniform(8, 16))
            pts = [(x - math.cos(ang) * Ls / 2, y - math.sin(ang) * Ls / 2), (x + math.cos(ang) * Ls / 2, y + math.sin(ang) * Ls / 2)]
            c = L.rgb2ok(target[y, x]) + np.array([r.choice([-1, 1]) * r.uniform(0.015, 0.03), 0, 0])
            ck = 'c%d' % colour_of[i]
            used.add(ck)
            plan.add('form', 'tanda/acrylic-04-paint', pts, L.ok2rgb(c), min(r.uniform(5, 10), p['thick'] * 0.8), r.uniform(0.5, 0.75), clip=ck, ds=1.0, flat_p=r.uniform(0.7, 0.9))
    clips = {ck: ndi.binary_dilation(lab == int(ck[1:]), iterations=1).astype(np.float64) for ck in sorted(used)}
    painted, sec = L.mypaint(np.dstack([target, alpha]), plan.strokes, clips=clips, tag='v7prop')
    # the outline softened where it meets the quay (the rim's colour from a premultiplied blur; alpha feathered 0.8 px)
    pa = painted[..., 3:4]
    bl = lambda im, s: np.dstack([cv2.GaussianBlur(np.ascontiguousarray(im[..., c]).astype(np.float32), (0, 0), s) for c in range(im.shape[2])]).astype(np.float64)
    soft = bl(painted[..., :3] * pa, 1.1) / np.maximum(bl(pa, 1.1), 1e-4)
    rim = (cv2.distanceTransform((pa[..., 0] > 0.5).astype(np.uint8), cv2.DIST_L2, 3) < 3.0)[..., None]
    painted[..., :3] = np.where(rim, soft, painted[..., :3])
    fa = cv2.GaussianBlur(pa[..., 0].astype(np.float32), (0, 0), 0.8).astype(np.float64)
    painted[..., 3] = fa
    stats = dict(box=list(BOX), faces=n, strokes=plan.count(), mypaint_s=round(sec, 2))
    return painted, stats
