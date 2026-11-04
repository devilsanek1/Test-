"""piece_wing.py: painter v7's FACADE, the Google wing (ORGANIC.md §6 step 3; §4.1's man-made rules; §5's row "the
subject's plane around the focal"). Decision 2 keeps v2's FRONTAL view (the owner: "our initial angle snd the view
frankly wasn't bad"), so the grid is broken by design and by paint, never by turning it (the orchestrator's read of
v7a: "break the frontal grid (overlaps, varied windows, painted edges, colour moving inside each plane), and keep the
plum warm and clean, never muddy; the backlit read stays"). The MATERIAL in the keyed colours over v7a's flat wing (the
light bake shades it as the backlit facade it repaints: its labels come from the flat):
  1. HAND-RULED: the region map bowed by a smooth sub-pixel displacement (0.55 px at 140 px, 0.25 px at 50 px).
  2. COLOUR MOVING INSIDE EVERY FACE: a ramp toward the low sun (left, a little up: +-2.5 L*, warmer toward it) and a
     slow mottle (+-1 L*), each face at its own strength.
  3. NO TEMPLATE, every window its own state: each glass pane its own sky (lighter at its top at its own strength), a
     diagonal sheen at its own angle and place or none, a blind lowered to its own height on some; each lit pane its
     own warmth, one dimmer, one with a blind, one with a curtain drawn to one side (its shelves and bottles kept).
  4. OVERLAPS, one per long edge: an autumn creeper (Boston ivy turning crimson in October: the dusk family, so the
     plum stays clean, never an olive or a muddy green) spilling from the roof's planters over the parapet, the upper
     band and a pier, as natural shapes (leaf clumps on a size ladder, outlines displaced, a few tendrils).
  5. MARKS through MyPaint: blocky flat strokes along each face (vertical on the piers, level on the bands; light marks
     only on the glass), each clipped to its own face; on LOST edges (two big faces within ~10 L*) short strokes lap
     across from one side or the other (the ruler line breaks).
  6. FOCUS: the door (its frame and lobby: her), the fascia and W (the story's next subject) are HOLES: the scene's own
     crisp layers show through; the paint thins toward the door.
Seeded: two bakes, the same bytes."""
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
from piece_facade import components, face_props  # noqa: E402  (organic proof 1's facade: faces and their shapes)
from v7common import value_noise  # noqa: E402
from v7labels import DOOR_FRAME, FASCIA, W_RECT  # noqa: E402

BOX = (300, 575, 780, 525)               # frame px: x, y, w, h (the wing: x 312-1080, y 589-1090)
LIGHT2 = np.array([-0.88, -0.48])         # toward the low sun in the picture (left, a little up)
HOLES = [(DOOR_FRAME[0] - 6, DOOR_FRAME[1] - 2, DOOR_FRAME[2] + 6, DOOR_FRAME[3] + 9),
         (FASCIA[0] - 3, FASCIA[1] - 3, FASCIA[2] + 3, FASCIA[3] + 4),
         (W_RECT[0] - 5, W_RECT[1] - 1, W_RECT[2] - 3, W_RECT[3])]
DOOR = (630.0, 960.0)
#: the creeper's cascades: (anchor x, anchor y (frame px), length, top width, lean) from the roof's planters
CREEPER = [(400.0, 628.0, 128.0, 74.0, 0.06), (1018.0, 630.0, 112.0, 66.0, -0.05)]
CREEPER_COL = dict(deep='#B26C70', mid='#CC8A80', lit='#E6AE98')
DOSE = dict(ramp=0.026, mott=0.011, face_marks=1.0, edge=0.6)


def flat_wing(parts):
    X0, Y0, W, H = BOX
    k = L.load_rgba(os.path.join(parts, 'seg_wing_k.png'))[Y0:Y0 + H, X0:X0 + W, :3]
    w = L.load_rgba(os.path.join(parts, 'seg_wing_w.png'))[Y0:Y0 + H, X0:X0 + W, :3]
    a = np.clip(1 - (w - k).mean(2), 0, 1)
    col = np.where(a[..., None] > 0.02, np.clip(k / np.maximum(a[..., None], 1e-3), 0, 1), 0)
    return np.dstack([col, a])


def creeper(H, W, X0, Y0, seed):
    """The autumn creeper's cascades: (coverage 0..1, colour rgb) in the box. Shape first (ORGANIC §4.1: one dominant
    mass, free curves): each cascade a mass hugging the parapet (a low spread, wider than tall) with 2-4 tongues of
    unequal length hanging from it (tapered, bowed, their outlines displaced by noise at two octaves), then filled with
    small leaves (2.5-5 px ellipses at their own tilt) whose bumps make the leafy edge; lit on the upper-left (the sun's
    side), deep in the folds and under each tongue; a few loose leaves and a tendril below."""
    r = L.seeded(seed, 'creeper')
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    shape = np.zeros((H, W), np.float32)
    for ci, (ax, ay, length, w0, lean) in enumerate(CREEPER):
        ax, ay = ax - X0, ay - Y0
        poly = []
        # the spread along the parapet: a low lens, wider than tall, its top tucked under the planter
        sw, sh = w0 * r.uniform(1.0, 1.3), r.uniform(12, 20)
        m = (((xx - ax) / (sw / 2)) ** 2 + ((yy - (ay + sh * 0.35)) / (sh / 2)) ** 2) <= 1.0
        shape = np.maximum(shape, m.astype(np.float32))
        # the tongues: unequal, the longest toward the lean, each a tapered bowed strip
        nt = int(r.integers(2, 5))
        offs = np.sort(r.uniform(-0.42, 0.42, nt)) * sw
        lens = length * np.sort(r.uniform(0.25, 1.0, nt))[::-1]
        r.shuffle(lens)
        for o, Lt in zip(offs, lens):
            wt = r.uniform(0.18, 0.32) * w0
            bend = r.normal(0, 0.12) * Lt
            pts_l, pts_r = [], []
            for k in range(14):
                t = k / 13
                cx = ax + o + lean * Lt * t + bend * math.sin(math.pi * t)
                cy = ay + sh * 0.3 + Lt * t
                half = wt * (1 - 0.82 * t ** 1.3) * 0.5 + 0.8
                pts_l.append((cx - half, cy))
                pts_r.append((cx + half, cy))
            pg = np.array(pts_l + pts_r[::-1], np.float32)
            c8 = np.zeros((H, W), np.uint8)
            cv2.fillPoly(c8, [np.round(pg * 4).astype(np.int32)], 255, cv2.LINE_AA, shift=2)
            shape = np.maximum(shape, c8.astype(np.float32) / 255.0)
            poly.append(pg)
    # the outline displaced (free curves), then the leaves: small ellipses scattered inside the shape and on its edge
    dx = value_noise(f'{seed}/creeper/wx', (H, W), 14, octaves=2) * 3.2
    dy = value_noise(f'{seed}/creeper/wy', (H, W), 14, octaves=2) * 3.2
    shape = cv2.remap(shape, (xx + dx).astype(np.float32), (yy + dy).astype(np.float32), cv2.INTER_LINEAR)
    cov = np.zeros((H, W), np.float32)
    lightv = np.zeros((H, W), np.float32)
    ys, xs = np.nonzero(shape > 0.35)
    if len(xs):
        n = int(len(xs) / 9)
        for j in r.choice(len(xs), size=n, replace=False):
            cx, cy = float(xs[j]) + r.normal(0, 1.2), float(ys[j]) + r.normal(0, 1.2)
            rx = r.uniform(2.6, 5.0)
            ry = rx * r.uniform(0.6, 0.85)
            ang = r.uniform(0, 180)
            x0, x1, y0, y1 = int(cx - 7), int(cx + 8), int(cy - 7), int(cy + 8)
            if x0 < 0 or y0 < 0 or x1 > W or y1 > H:
                continue
            c, s_ = math.cos(math.radians(ang)), math.sin(math.radians(ang))
            u = (xx[y0:y1, x0:x1] - cx) * c + (yy[y0:y1, x0:x1] - cy) * s_
            v = -(xx[y0:y1, x0:x1] - cx) * s_ + (yy[y0:y1, x0:x1] - cy) * c
            e = (u / rx) ** 2 + (v / ry) ** 2
            mm = np.clip((1.15 - e) / 0.3, 0, 1)
            # its light: the leaf's own tilt toward the sun, the mass's upper-left edge more, the folds deep
            lv = float(np.clip(0.5 + 0.35 * r.normal(0, 1) * 0.5 + 0.25 * math.cos(math.radians(ang - 135)), 0, 1))
            sub_c, sub_l = cov[y0:y1, x0:x1], lightv[y0:y1, x0:x1]
            upd = mm > 0.35
            sub_l[upd] = lv
            np.maximum(sub_c, mm, out=sub_c)
    # the mass's form light: its upper-left lit, deeper toward its inside and down each tongue
    edge_in = cv2.distanceTransform((shape > 0.35).astype(np.uint8), cv2.DIST_L2, 3)
    form = np.clip(0.35 + 0.08 * np.clip(3 - edge_in, 0, 3), 0, 1)
    lightv = np.clip(0.55 * lightv + 0.45 * form - 0.004 * (yy - yy.min()) * 0, 0, 1)
    deep, mid, lit = (L.rgb2ok(L.hx(CREEPER_COL[k])) for k in ('deep', 'mid', 'lit'))
    lv = lightv[..., None]
    ok = np.where(lv < 0.5, deep + (mid - deep) * (lv / 0.5), mid + (lit - mid) * ((lv - 0.5) / 0.5))
    return np.clip(cov, 0, 1), L.ok2rgb(ok)


def make(parts, seed='v7/facade', dose=None):
    D = dict(DOSE, **(dose or {}))
    X0, Y0, W, H = BOX
    flat = flat_wing(parts)
    alpha0 = flat[..., 3]
    lab, cols = L.flat_labels(flat)

    def bow(tag):
        out = np.zeros((H, W))
        for i, (lam, a) in enumerate([(140, 0.55), (50, 0.25)]):
            nz = value_noise(f'{seed}/{tag}/{i}', (H, W), lam, octaves=1)
            out += a * nz / (nz.std() + 1e-9)
        return out
    lab = L.warp_labels(lab, bow('hx').astype(np.float32), bow('hy').astype(np.float32))
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
    rng = L.seeded(seed, 'faces')
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float64)
    near_focus0 = np.clip(1 - (np.hypot(fx - DOOR[0], fy - DOOR[1]) - 110) / 200.0, 0, 1) + 0 * xx
    tgt = okb.copy()
    mott = value_noise(f'{seed}/mott', (H, W), 70, octaves=2)
    l2 = LIGHT2 / np.hypot(*LIGHT2)
    states = {'glass': 0, 'blind': 0, 'sheen': 0, 'lit_dim': 0, 'lit_blind': 0, 'lit_curtain': 0}
    for i, p in enumerate(props):
        if p is None or p['area'] < 60:
            continue
        m = comp == i
        x0, y0, x1, y1 = p['bbox']
        ext = max(x1 - x0, y1 - y0, 8)
        proj = ((xx[m] - p['cx']) * l2[0] + (yy[m] - p['cy']) * l2[1]) / (ext / 2)
        hue = L.rgb2ok(cols[colour_of[i]])
        chroma = math.hypot(hue[1], hue[2])
        glass = hue[2] < -0.02 and 0.55 < hue[0] < 0.86 and chroma > 0.02
        interior = hue[2] > 0.035 and hue[0] > 0.8 and chroma > 0.045 and (p['bbox'][3] + Y0) < 800
        k_face = rng.uniform(0.6, 1.25)
        dL = (D['ramp'] * k_face) * np.clip(proj, -1, 1) + D['mott'] * mott[m] + rng.normal(0, 0.006)
        db = 0.006 * np.clip(proj, -1, 1)
        hy = np.clip((yy[m] - y0) / max(y1 - y0, 1), 0, 1)
        hx_ = np.clip((xx[m] - x0) / max(x1 - x0, 1), 0, 1)
        if glass and p['area'] > 400:
            states['glass'] += 1
            # the sky in this pane, at its own strength: lighter at its top
            dL = dL + rng.uniform(0.015, 0.05) * (1 - hy)
            u = rng.random()
            if u < 0.4:
                # a diagonal sheen at its own angle and place
                a = math.radians(rng.uniform(50, 78))
                pos = rng.uniform(0.15, 0.85)
                d = (xx[m] - (x0 + pos * (x1 - x0))) * math.cos(a) - (yy[m] - y0) * math.sin(a) * 0.3
                w_ = rng.uniform(4, 11)
                dL = dL + rng.uniform(0.015, 0.035) * np.exp(-(d / w_) ** 2)
                states['sheen'] += 1
            elif u < 0.7 and (y1 - y0) > 60:
                # a blind lowered to its own height: a calm, lighter band from the top
                hb = rng.uniform(0.18, 0.5)
                band = 1 - L.smoothstep(hb - 0.015, hb + 0.015, hy)
                dL = dL * (1 - band) + band * (rng.uniform(0.04, 0.07) + 0.006 * mott[m])
                db = db * (1 - band) + band * 0.012
                states['blind'] += 1
        if interior and p['area'] > 300:
            # each lit room its own warmth and state (its shelves and bottles are their own faces, kept)
            u = rng.random()
            if u < 0.3:
                dL = dL - rng.uniform(0.02, 0.04)
                states['lit_dim'] += 1
            elif u < 0.6:
                hb = rng.uniform(0.15, 0.35)
                band = 1 - L.smoothstep(hb - 0.02, hb + 0.02, hy)
                dL = dL - 0.035 * band
                states['lit_blind'] += 1
            else:
                side = hx_ if rng.random() < 0.5 else 1 - hx_
                cw = rng.uniform(0.18, 0.32)
                cur = 1 - L.smoothstep(cw - 0.03, cw + 0.03, side)
                dL = dL - 0.045 * cur
                db = db + 0.01 * cur
                states['lit_curtain'] += 1
            dL = dL + rng.uniform(0.006, 0.018) * (1 - hy)
        tgt[m] = okb[m] + np.stack([dL, np.zeros_like(dL), db], -1)
    # 3b. LOST STRETCHES along the grid's lines (ORGANIC §4.1: a long edge lost over 10-30 % of its length where it meets
    # a close value; a joint that stops): the thin frame bars and mullions and the light piers and bands, each faded
    # toward what lies beside it over its own stretches (a slow noise along its axis), away from the door (found there)
    nlost = 0
    for i, p in enumerate(props):
        if p is None or p['area'] < 80 or p['elong'] < 3.5:
            continue
        x0, y0, x1, y1 = p['bbox']
        cxi, cyi = int(np.clip(p['cx'], 0, W - 1)), int(np.clip(p['cy'], 0, H - 1))
        if near_focus0[cyi, cxi] > 0.35:
            continue
        m = comp == i
        Lf = float(np.median(Lb[m]))
        thin = p['thick'] < 9
        pier = (not thin) and Lf > 80 and p['thick'] < 26
        if not (thin or pier):
            continue
        ring = cv2.dilate(m.astype(np.uint8), np.ones((7, 7), np.uint8)).astype(bool) & ~m & (comp >= 0)
        if ring.sum() < 10:
            continue
        nb = np.median(tgt[ring], axis=0)
        ys, xs = np.nonzero(m)
        ca, sa = math.cos(p['ang']), math.sin(p['ang'])
        t = (xs - p['cx']) * ca + (ys - p['cy']) * sa
        span = max(t.max() - t.min(), 1.0)
        tn = (t - t.min()) / span
        ph = rng.uniform(0, 100)
        wave = value_noise(f'{seed}/lost/{i}', (1, 1024), 30, octaves=2)[0]
        g = wave[np.clip((tn * span + ph).astype(int), 0, 1023)]
        w = L.smoothstep(-0.05, 0.4, g) * (0.8 if thin else 0.72)
        tgt[ys, xs] = tgt[ys, xs] * (1 - w[:, None]) + nb[None, :] * w[:, None]
        nlost += 1
    # 3c. dark details INSIDE the mass (composition R2: detail lives inside a mass, 2-8 L*): the dark sill bands under the
    # upper panes and the like lifted part of the way toward what surrounds them (W, the frames and the door excepted)
    for i, p in enumerate(props):
        if p is None or p['area'] < 250 or p['thick'] < 9:
            continue
        m = comp == i
        if float(np.median(Lb[m])) > 40:
            continue
        cxi, cyi = int(np.clip(p['cx'], 0, W - 1)), int(np.clip(p['cy'], 0, H - 1))
        if near_focus0[cyi, cxi] > 0.35 or (W_RECT[0] - 10 <= p['cx'] + X0 <= W_RECT[2] + 10 and W_RECT[1] - 10 <= p['cy'] + Y0 <= W_RECT[3] + 10):
            continue
        ring = cv2.dilate(m.astype(np.uint8), np.ones((9, 9), np.uint8)).astype(bool) & ~m & (comp >= 0) & (Lb > 45)
        if ring.sum() < 10:
            continue
        nb = np.median(tgt[ring], axis=0)
        tgt[m] = tgt[m] * 0.6 + nb[None, :] * 0.4
    target = L.ok2rgb(tgt)
    # 4. the creeper over the parapet, the upper band and a pier
    cov, ccol = creeper(H, W, X0, Y0, seed)
    cov = cov * (alpha0 > 0.5) * ~hole
    target = target * (1 - cov[..., None]) + ccol * cov[..., None]
    # 5. the marks
    plan = L.StrokePlan((seed, 'plan'))
    r = plan.rng
    focus = np.hypot(fx - DOOR[0], fy - DOOR[1])
    near_focus = np.clip(1 - (focus - 90) / 220.0, 0, 1)
    bnd = L.boundaries(np.where(inside, comp, -1)) & inside
    step = np.zeros((H, W))
    Lt = L.Lstar(target)
    Lbig = cv2.dilate(Lt.astype(np.float32), np.ones((5, 5), np.uint8)) - cv2.erode(Lt.astype(np.float32), np.ones((5, 5), np.uint8))
    step[bnd] = Lbig[bnd]
    used = set()
    nface = 0
    for i, p in enumerate(props):
        if p is None or p['area'] < 500 or p['thick'] < 9:
            continue
        m = (comp == i) & inside & (cov < 0.2)
        if m.sum() < 300:
            continue
        x0, y0, x1, y1 = p['bbox']
        vertical = (y1 - y0) > (x1 - x0) * 1.15
        hue = L.rgb2ok(cols[colour_of[i]])
        glass = hue[2] < -0.02 and 0.55 < hue[0] < 0.86
        cxi, cyi = int(np.clip(p['cx'], 0, W - 1)), int(np.clip(p['cy'], 0, H - 1))
        k = int(np.clip(p['area'] / 900.0, 1, 30) * D['face_marks'] * (1 - 0.75 * near_focus[cyi, cxi]))
        ys, xs = np.nonzero(m)
        din = ndi.distance_transform_edt(np.pad(comp == i, 1))[1:-1, 1:-1]
        for _ in range(k):
            j = r.integers(len(xs))
            x, y = xs[j], ys[j]
            if din[y, x] < 3:
                continue
            Ls = min(r.uniform(22, 70), (y1 - y0 if vertical else x1 - x0) * 0.85)
            if Ls < 12:
                continue
            ang = (math.pi / 2 if vertical else 0.0) + r.normal(0, 0.02)
            dxs, dys = math.cos(ang) * Ls / 2, math.sin(ang) * Ls / 2
            sgn = 1 if glass else r.choice([-1, 1])
            c = L.rgb2ok(target[y, x]) + np.array([sgn * r.uniform(0.018, 0.038), 0, r.normal(0, 0.003)])
            wdt = min(r.uniform(7, 15), p['thick'] * 0.7)
            ck = 'c%d' % colour_of[i]
            used.add(ck)
            plan.add('face', 'tanda/acrylic-04-paint', [(x - dxs, y - dys), (x + dxs, y + dys)], L.ok2rgb(c), wdt, r.uniform(0.5, 0.78), clip=ck, ds=1.0,
                     flat_p=r.uniform(0.7, 0.9))
            nface += 1
    # lost edges between two big faces of close value: short strokes lapping across, one side's colour or the other's
    thick_face = np.zeros(n + 1, bool)
    for i, p in enumerate(props):
        thick_face[i] = p is not None and p['thick'] >= 9 and p['area'] >= 500
    tf = np.where(comp >= 0, thick_face[np.clip(comp, 0, n)], False)
    both = tf & (cv2.erode(tf.astype(np.uint8), np.ones((5, 5), np.uint8)) == 0) & (cv2.dilate(tf.astype(np.uint8), np.ones((5, 5), np.uint8)) > 0)
    lost = bnd & both & (step < 11.0) & (step > 1.0) & (near_focus < 0.5) & (cov < 0.1)
    dv = np.zeros((H, W), bool)
    dv[:, 1:] = comp[:, 1:] != comp[:, :-1]
    side_n = value_noise(f'{seed}/side', (H, W), 60, octaves=1)
    ys, xs = np.nonzero(lost)
    taken = np.zeros((H, W), bool)
    nedge = 0
    for j in r.permutation(len(xs)):
        x, y = xs[j], ys[j]
        if taken[max(0, y - 24):y + 25, max(0, x - 24):x + 25].any() or r.random() > D['edge']:
            continue
        taken[y, x] = True
        vert = dv[y, x]
        sgn = 1 if side_n[y, x] > 0 else -1
        Ls = r.uniform(22, 50)
        off = sgn * r.uniform(1.0, 3.0)
        if vert:
            sx, sy = int(np.clip(x + sgn * 5, 0, W - 1)), y
            ox_, oy_ = int(np.clip(x - sgn * 5, 0, W - 1)), y
            pts = [(x + off, y - Ls / 2), (x + off + r.normal(0, 0.4), y + Ls / 2)]
        else:
            sx, sy = x, int(np.clip(y + sgn * 5, 0, H - 1))
            ox_, oy_ = x, int(np.clip(y - sgn * 5, 0, H - 1))
            pts = [(x - Ls / 2, y + off), (x + Ls / 2, y + off + r.normal(0, 0.4))]
        la, lb = lab[sy, sx], lab[oy_, ox_]
        if la < 0 or lb < 0 or la == lb:
            continue
        ck = 'e%d_%d' % (min(la, lb), max(la, lb))
        used.add(ck)
        plan.add('edge', 'tanda/acrylic-04-paint', pts, target[sy, sx], r.uniform(4.0, 7.5), r.uniform(0.6, 0.85), clip=ck, ds=1.0, flat_p=r.uniform(0.7, 0.9))
        nedge += 1
    # the creeper: a few short dabs of its own leaves (the brush's edge on the leaf clumps' lit side)
    ys, xs = np.nonzero(cov > 0.6)
    for _ in range(int(min(len(xs) / 90, 50))):
        j = r.integers(len(xs))
        x, y = xs[j], ys[j]
        a = r.uniform(0, math.pi)
        Ls = r.uniform(4, 9)
        c = L.rgb2ok(target[y, x]) + np.array([r.uniform(-0.03, 0.04), 0, 0])
        plan.add('leaf', 'tanda/acrylic-04-paint', [(x - math.cos(a) * Ls / 2, y - math.sin(a) * Ls / 2), (x + math.cos(a) * Ls / 2, y + math.sin(a) * Ls / 2)],
                 L.ok2rgb(c), r.uniform(3.0, 5.0), r.uniform(0.6, 0.9), clip='creeper', ds=1.0)
    base_rgba = np.dstack([target, np.where(hole, 0.0, alpha0)])
    clips = {}
    for ck in sorted(used):
        if ck[0] == 'c':
            m = lab == int(ck[1:])
        else:
            a_, b_ = (int(v) for v in ck[1:].split('_'))
            m = (lab == a_) | (lab == b_)
        clips[ck] = (ndi.binary_dilation(m, iterations=1) & ~hole & (cov < 0.5)).astype(np.float64)
    clips['creeper'] = (cov > 0.3).astype(np.float64)
    painted, sec = L.mypaint(base_rgba, plan.strokes, clips=clips, tag='v7facade')
    painted[..., 3] = np.where(hole, 0.0, painted[..., 3])
    # 7. EDGES BY THE FOCUS (ORGANIC §5: found at the door, the fascia and W; elsewhere on the backlit facade the steps sit
    # under ~14 L* once it is in shade, so they are blended, never ruled): the colour inside the piece softened by a
    # premultiplied blur (sigma 1.2 px: a 10-90 % width of ~3 px), fading in from 150 px to 260 px from the door and kept
    # off W's surround; the silhouette (alpha) untouched, so the roofline and the holes stay as drawn
    a = painted[..., 3:4]
    pm = painted[..., :3] * a
    bl = lambda im: np.dstack([cv2.GaussianBlur(np.ascontiguousarray(im[..., c]).astype(np.float32), (0, 0), 1.2) for c in range(im.shape[2])]).astype(np.float64)
    soft = bl(pm) / np.maximum(bl(a), 1e-4)
    wx0, wy0, wx1, wy1 = W_RECT
    dW = np.hypot(np.clip(np.maximum(wx0 - fx, fx - wx1), 0, None), np.clip(np.maximum(wy0 - fy, fy - wy1), 0, None))
    wsoft = L.smoothstep(150.0, 260.0, focus) * L.smoothstep(6.0, 40.0, dW)
    wsoft = (wsoft * (a[..., 0] > 0.5))[..., None]
    painted[..., :3] = np.clip(painted[..., :3] * (1 - wsoft) + soft * wsoft, 0, 1)
    stats = dict(box=list(BOX), faces=n, strokes=plan.count(), mypaint_s=round(sec, 2), states=states, creeper_px=int((cov > 0.5).sum()), lost_lines=nlost)
    return painted, stats
