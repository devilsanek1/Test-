"""piece_facade.py: the organic facade of the wing, by the doorway (docs/look/organic/organic_proof.md section 2.3).
Measured on v6 (shapes.md 2.4): 76 % of the facade's edge length straight, 54 % ruler lines, 40 % right angles, 93 %
parallels, mirror-symmetric panes (0.78), every edge one crisp clean step. Man-made stays straight (a noise wobble on it
reads melted: techniques.md 3.7), so this keeps v6's design (its exact flat render, OrganicFlat 'wing') and changes how
it is drawn, by the shapes lane's man-made rules (shapes.md 3.2) and the techniques' dose for a tier-C near plane:
  1. HAND-RULED: a smooth, long-wave displacement (0.6 px at 110 px, 0.3 px at 40 px: no wobble, a hand's bow), every
     corner worn 2 px (a majority filter).
  2. NO TEMPLATE: each pane its own: a sky reflection running down its glass at its own strength, on some panes a
     diagonal sheen at its own place, the lit interiors glowing from their own top; never the same state twice.
  3. LIGHT INSIDE THE FACES (techniques.md 3.8): every face a ramp toward the low sun (+-2.5 L*, warmer toward it), a
     slow mottle (+-0.8 L*).
  4. MARKS (MyPaint): flat-brush strokes along each face (vertical on the piers and fins, level on the bands and sills:
     the lighthouse's blocky marks, learned), a value step off the face's own, sparse inside, denser where an edge is
     LOST.
  5. EDGES BY INTENT (techniques.md 3.6, edge strokes): where two faces meet at a close value (< 14 L*) the edge is
     brushed over by short flat strokes of one side's colour or the other's (a slow noise along it picks the side): the
     ruler lines break; where the step is big (the dark frames, the glass) the edge stays found, but long frame bars
     away from the door get a lost stretch (a stroke of the face across them: a joint that stops).
  6. FOCUS: the door (its frame, its lobby, her, the fascia whose letters still pop) and W (her office window, the
     story's next subject) are HOLES in the piece: the scene's own crisp layers show through, so the found edges and
     the detail stay where the eye goes; the paint thins toward them (the owner's balance: the focal sharp).
The roof terrace's planting is brushed as soft tufts. The one pane that switches on at 3.90 (V2S1_set_wing WING_SWITCH)
is baked in its 1.0 s state: production bakes it per state (two images) or leaves it a hole."""
from __future__ import annotations

import math
import os
import sys

import cv2
import numpy as np
from scipy import ndimage as ndi

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import oc_lib as L  # noqa: E402

sys.path.insert(0, L.ORG_DOCS)
import shapes_gen as SG  # noqa: E402

BOX = (300, 575, 780, 525)               # frame px: x, y, w, h (the wing: x 312-1080, y 589-1093)
LIGHT = np.array([-0.70, -0.62, 0.36])
# holes (frame px): the door's frame and lobby, the fascia (its letters pop from 0.97), W's glass
HOLES = [(534, 842, 726, 1091), (517, 797, 743, 850), (783, 607, 937, 780)]
DOOR = (630.0, 960.0)                    # the focal: the paint thins toward it


def components(lab):
    """Split each colour region into its connected pieces: every pane, pier and frame bar its own face."""
    comp = np.full(lab.shape, -1, np.int32)
    colour_of = []
    n = 0
    for l in np.unique(lab[lab >= 0]):
        cc, k = ndi.label(lab == l)
        if k == 0:
            continue
        comp[cc > 0] = cc[cc > 0] - 1 + n
        colour_of += [l] * k
        n += k
    return comp, np.array(colour_of, np.int32)


def face_props(comp, n):
    """Per face: area, centroid, bbox, the major axis angle, elongation, thickness (2 x the max inside distance)."""
    idx = np.arange(n)
    area = ndi.sum(np.ones_like(comp), comp, index=idx)
    objs = ndi.find_objects(comp + 1, max_label=n)
    props = []
    for i in range(n):
        sl = objs[i]
        if sl is None:
            props.append(None)
            continue
        m = comp[sl] == i
        ys, xs = np.nonzero(m)
        ys = ys + sl[0].start
        xs = xs + sl[1].start
        cx, cy = xs.mean(), ys.mean()
        if len(xs) > 2:
            cxx, cyy, cxy = ((xs - cx) ** 2).mean(), ((ys - cy) ** 2).mean(), ((xs - cx) * (ys - cy)).mean()
            ang = 0.5 * math.atan2(2 * cxy, cxx - cyy)
            l1 = 0.5 * (cxx + cyy) + math.sqrt(0.25 * (cxx - cyy) ** 2 + cxy ** 2)
            l2 = 0.5 * (cxx + cyy) - math.sqrt(0.25 * (cxx - cyy) ** 2 + cxy ** 2)
            elong = math.sqrt(max(l1, 1e-6) / max(l2, 1e-6))
        else:
            ang, elong = 0.0, 1.0
        thick = 2 * float(ndi.distance_transform_edt(np.pad(m, 1))[1:-1, 1:-1].max())
        props.append(dict(area=float(area[i]), cx=cx, cy=cy, ang=ang, elong=elong, thick=thick,
                          bbox=(xs.min(), ys.min(), xs.max(), ys.max())))
    return props


def make(out_dir, seed=('organic', 'facade', 1), dose=1.0, flat_path=None):
    os.makedirs(out_dir, exist_ok=True)
    X0, Y0, W, H = BOX
    flat = L.load_rgba(flat_path or os.path.join(L.SCRATCH, 'renders', 'flat_wing.png'))[Y0:Y0 + H, X0:X0 + W]
    alpha0 = flat[..., 3]
    lab, cols = L.flat_labels(flat)
    # 1. hand-ruled: a smooth, long-wave displacement of the region map, then every corner worn 2 px
    dx = sum(a * L.fnl((H, W), L.seed_int(seed, 'hx', i), 1.0 / lam, octaves=1) / 0.35 for i, (lam, a) in enumerate([(110, 0.6), (40, 0.3)]))
    dy = sum(a * L.fnl((H, W), L.seed_int(seed, 'hy', i), 1.0 / lam, octaves=1) / 0.35 for i, (lam, a) in enumerate([(110, 0.6), (40, 0.3)]))
    lab = L.warp_labels(lab, dx.astype(np.float32), dy.astype(np.float32))
    lab = L.round_corners(lab, r=2)
    comp, colour_of = components(lab)
    n = len(colour_of)
    props = face_props(comp, n)
    base = L.recolour(lab, cols)
    okb = L.rgb2ok(base)
    Lb = L.Lstar(base)
    fx = np.arange(W)[None, :] + X0
    fy = np.arange(H)[:, None] + Y0
    hole = np.zeros((H, W), bool)
    for (x0, y0, x1, y1) in HOLES:
        hole |= (fx >= x0) & (fx <= x1) & (fy >= y0) & (fy <= y1)
    inside = (alpha0 > 0.5) & ~hole
    rng = L.seeded(seed, 'facade')
    # 2 + 3. the light inside every face (a ramp toward the sun, a mottle) and each pane its own state
    l2 = np.array([LIGHT[0], LIGHT[1]]) / np.hypot(LIGHT[0], LIGHT[1])
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float64)
    tgt = okb.copy()
    mott = L.fnl((H, W), L.seed_int(seed, 'mott'), 1 / 60.0, octaves=2)
    for i, p in enumerate(props):
        if p is None or p['area'] < 60:
            continue
        m = comp == i
        x0, y0, x1, y1 = p['bbox']
        ext = max(x1 - x0, y1 - y0, 8)
        proj = ((xx[m] - p['cx']) * l2[0] + (yy[m] - p['cy']) * l2[1]) / (ext / 2)
        c0 = cols[colour_of[i]]
        hue = L.rgb2ok(c0)
        chroma = math.hypot(hue[1], hue[2])
        glass = (0.04 < chroma < 0.09) and hue[2] < 0 and hue[0] > 0.5      # the teal glass family
        interior = hue[2] > 0.06 and hue[0] > 0.8                            # the lit (yellow) interiors
        dL = 0.018 * np.clip(proj, -1, 1) + 0.006 * mott[m]
        db = 0.004 * np.clip(proj, -1, 1)
        if glass and p['area'] > 300:
            # the sky in the glass: lighter at its top, at this pane's own strength; some panes a diagonal sheen
            k = rng.uniform(0.012, 0.03)
            dL = dL + k * np.clip(1 - (yy[m] - y0) / max(y1 - y0, 1), 0, 1)
            if rng.random() < 0.45:
                a = math.radians(rng.uniform(55, 75))
                pos = rng.uniform(0.2, 0.8)
                d = (xx[m] - (x0 + pos * (x1 - x0))) * math.cos(a) - (yy[m] - y0) * math.sin(a) * 0.25
                w_ = rng.uniform(5, 12)
                dL = dL + rng.uniform(0.012, 0.025) * np.exp(-(d / w_) ** 2)
        if interior and p['area'] > 300:
            dL = dL + rng.uniform(0.01, 0.022) * np.clip(1 - (yy[m] - y0) / max(y1 - y0, 1), 0, 1) - 0.006
        tgt[m] = okb[m] + np.stack([dL, np.zeros_like(dL), db], -1)
    target = L.ok2rgb(tgt)
    # 4 + 5. the marks
    plan = L.StrokePlan((seed, 'facade', 'plan'))
    r = plan.rng
    focus = np.hypot(fx - DOOR[0], fy - DOOR[1])
    near_focus = np.clip(1 - (focus - 90) / 220.0, 0, 1)            # the paint thins toward the door
    # the boundaries: value step across each, from the region map
    bnd = L.boundaries(np.where(inside, comp, -1)) & inside
    step = np.zeros((H, W))
    Lbig = cv2.dilate(Lb.astype(np.float32), np.ones((5, 5), np.uint8)) - cv2.erode(Lb.astype(np.float32), np.ones((5, 5), np.uint8))
    step[bnd] = Lbig[bnd]
    face_n = 0
    for i, p in enumerate(props):
        if p is None or p['area'] < 500 or p['thick'] < 10:
            continue
        m = (comp == i) & inside
        if m.sum() < 400:
            continue
        x0, y0, x1, y1 = p['bbox']
        vertical = (y1 - y0) > (x1 - x0) * 1.15
        k = int(np.clip(p['area'] / 1400.0, 1, 26) * dose * (1 - 0.6 * near_focus[int(p['cy']) , int(np.clip(p['cx'], 0, W - 1))]))
        ys, xs = np.nonzero(m)
        din = ndi.distance_transform_edt(np.pad(comp == i, 1))[1:-1, 1:-1]
        for _ in range(k):
            j = r.integers(len(xs))
            x, y = xs[j], ys[j]
            if din[y, x] < 3:
                continue
            Ls = min(r.uniform(14, 42), (y1 - y0 if vertical else x1 - x0) * 0.8)
            if Ls < 8:
                continue
            ang = (math.pi / 2 if vertical else 0.0) + r.normal(0, 0.03)
            dxs, dys = math.cos(ang) * Ls / 2, math.sin(ang) * Ls / 2
            c = L.rgb2ok(target[y, x]) + np.array([r.choice([-1, 1]) * r.uniform(0.008, 0.018), 0, 0])
            wdt = min(r.uniform(4, 9), p['thick'] * 0.6)
            plan.add('face', 'tanda/acrylic-04-paint', [(x - dxs, y - dys), (x + dxs, y + dys)], L.ok2rgb(c), wdt, r.uniform(0.45, 0.75),
                     clip='face', ds=1.0)
            face_n += 1
    # edge strokes on LOST edges (close values): brushed over from one side or the other, alternating along the edge
    lost = bnd & (step < 14.0) & (step > 1.0) & (near_focus < 0.6)
    along = L.fnl((H, W), L.seed_int(seed, 'side'), 1 / 45.0, octaves=1)
    ys, xs = np.nonzero(lost)
    order = r.permutation(len(xs))
    taken = np.zeros((H, W), bool)
    gL = np.hypot(ndi.sobel(ndi.gaussian_filter(Lb, 1.0), 1), ndi.sobel(ndi.gaussian_filter(Lb, 1.0), 0)) + 1e-6
    tx_, ty_ = -ndi.sobel(ndi.gaussian_filter(Lb, 1.0), 0) / gL, ndi.sobel(ndi.gaussian_filter(Lb, 1.0), 1) / gL
    for j in order:
        x, y = xs[j], ys[j]
        if taken[max(0, y - 8):y + 9, max(0, x - 8):x + 9].any():
            continue
        taken[y, x] = True
        ex, ey = tx_[y, x], ty_[y, x]
        # the side: the face across the edge or this one, by a slow noise along it
        nx_, ny_ = -ey, ex
        sgn = 1 if along[y, x] > 0 else -1
        sx, sy = int(np.clip(x + sgn * nx_ * 3, 0, W - 1)), int(np.clip(y + sgn * ny_ * 3, 0, H - 1))
        c = target[sy, sx]
        Ls = r.uniform(12, 26)
        off = sgn * r.uniform(0.2, 0.5) * 4
        cx_, cy_ = x + nx_ * off, y + ny_ * off
        plan.add('edge', 'tanda/acrylic-04-paint', [(cx_ - ex * Ls / 2, cy_ - ey * Ls / 2), (cx_ + ex * Ls / 2, cy_ + ey * Ls / 2)],
                 c, r.uniform(3.0, 5.5), r.uniform(0.6, 0.9), clip='face', ds=1.0)
    # long found frame bars away from the door: a lost stretch (a stroke of the face beside them across the bar)
    bars = 0
    for i, p in enumerate(props):
        if p is None or p['thick'] > 9 or p['elong'] < 6 or p['area'] < 120:
            continue
        if near_focus[int(np.clip(p['cy'], 0, H - 1)), int(np.clip(p['cx'], 0, W - 1))] > 0.3 or r.random() > 0.55:
            continue
        m = comp == i
        ys, xs = np.nonzero(m)
        j = r.integers(len(xs))
        x, y = xs[j], ys[j]
        vertical = (p['bbox'][3] - p['bbox'][1]) > (p['bbox'][2] - p['bbox'][0])
        # the face beside the bar
        sx, sy = (int(np.clip(x + 6, 0, W - 1)), y) if vertical else (x, int(np.clip(y - 6, 0, H - 1)))
        c = target[sy, sx]
        Ls = r.uniform(8, 18)
        if vertical:
            pts = [(x + r.normal(0, 0.5), y - Ls / 2), (x, y + Ls / 2)]
        else:
            pts = [(x - Ls / 2, y + r.normal(0, 0.5)), (x + Ls / 2, y)]
        plan.add('bar', 'tanda/acrylic-04-paint', pts, c, p['thick'] + r.uniform(1.0, 2.5), r.uniform(0.5, 0.8), clip='face', ds=1.0)
        bars += 1
    # the roof planting: soft tufts (the planting's own colours, short dabs up and out)
    plant = inside & (fy < 612) & (L.rgb2ok(base)[..., 1] < -0.01)
    ys, xs = np.nonzero(plant)
    for _ in range(int(min(len(xs) / 25, 160))):
        j = r.integers(len(xs))
        x, y = xs[j], ys[j]
        a = -math.pi / 2 + r.normal(0, 0.6)
        Ls = r.uniform(4, 9)
        c = L.rgb2ok(target[y, x]) + np.array([r.normal(0, 0.02), 0, 0])
        plan.add('tuft', 'tanda/acrylic-04-paint', [(x, y), (x + math.cos(a) * Ls, y + math.sin(a) * Ls)], L.ok2rgb(c), r.uniform(3, 5),
                 r.uniform(0.7, 0.95), ds=1.0)
    base_rgba = np.dstack([target, np.where(hole, 0.0, alpha0)])
    clipm = (inside | ndi.binary_dilation(inside, iterations=1)) & ~hole
    painted, sec = L.mypaint(base_rgba, plan.strokes, clips={'face': clipm.astype(np.float64)}, tag='facade')
    painted[..., 3] = np.where(hole, 0.0, painted[..., 3])
    L.save_rgba(os.path.join(out_dir, 'facade_base.png'), base_rgba)
    L.save_rgba(os.path.join(out_dir, 'facade.png'), painted)
    stats = dict(box=list(BOX), faces=n, strokes=plan.count(), mypaint_s=round(sec, 2), bars_broken=bars)
    return painted, stats


if __name__ == '__main__':
    o = sys.argv[1] if len(sys.argv) > 1 else os.path.join(L.SCRATCH, 'pieces')
    _, st = make(o)
    print(st)
