"""piece_quay.py: painter v7's QUAY (ORGANIC.md §6 step 3; §4.1's ground; §5's near world: the full brush ladder, the
finest marks in the frame, joints <= 25 % of the width in pieces). Our bank as a painted dusk quay of wet stone, never
an empty slab with ruler joints (the orchestrator's read of v7a, beside refs 03 and 02: "a quiet dark mass is ALIVE and
painted"). This is the MATERIAL only, in the keyed colours: the canopy's shade, the sky's sheen in the wet and the
door's light coming across the quay are the light's (v7light.py, the same wet field: quay.py), solved onto it by the
bank's maps, never painted lit. Designed from v7a's flat bank (its colours per face: the parts render of look 'v7a')
and its geometry (quay.py: the coping, the landing, five treads with their lips, the terrace's corner):
  1. FLAGS, hand-laid: each tread cut into flags along it (a ground length of ~1.0-1.6 m, finer toward the canal, the
     cross joints to GROUND_VP2), each flag its own value (+-2-5 L*) and a warm or cool lean, the two stones of v2's
     paving mixed, never strictly alternating (no template); the cross joints faint, most broken into 2-4 pieces with
     lost gaps and faded ends, a third of them lost outright.
  2. THE LIPS (the nosings: v7a's straightest lines): their tone moving along their length, LOST over long stretches
     (lerped to the treads' value: 10-60 % of each lip), chipped at the nosing (small bites of the tread's stone), bowed
     by a sub-pixel hand-ruled wobble (never a ruler line).
  3. WEAR AND WATER: a slow mottle (+-2 L*, 160 px), the damp film and the puddles darker and a little richer (wet
     stone), the puddles smooth (the water's surface: no marks inside).
  4. MARKS through MyPaint (peinten, vendored; CC0 brushes): washes along the treads; flat blocky strokes along the
     perspective (toward GROUND_VP), sized by the ground's scale (bold near the camera for 400 px, fine by the canal);
     strokes lapping across the nosings where they are lost (the line breaks); strokes along each lip in its own
     stone; a few crisp worn chips on the nosings.
The coping (the canal's kerb, its wet dark lip, its iron cleats calmed toward the stone: R2) keeps its design. Seeded
(sha256 of a name): two bakes give the same bytes."""
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
import oc_lib as L  # noqa: E402  (organic proof 1's library: FastNoiseLite, OKLab, the stroke plan, MyPaint's bridge)
import quay as Q  # noqa: E402
from v7common import value_noise  # noqa: E402

BOX = (0, 1140, 1080, 780)             # frame px: x, y, w, h (our bank: y 1143-1920)
DOSE = dict(flag=0.045, mott=0.02, joint=0.55, lip_lost=0.6, wet=0.06, puddle_rich=0.14, wash=36, form=90, form_far=70,
            lost=70, lipmark=50, chip=30)


def flat_bank(parts):
    """v7a's flat bank (the parts render of look 'v7a': the keyed vector bank alone on black and on white): its straight
    colour and alpha, in the box."""
    X0, Y0, W, H = BOX
    k = L.load_rgba(os.path.join(parts, 'seg_bank_k.png'))[Y0:Y0 + H, X0:X0 + W, :3]
    w = L.load_rgba(os.path.join(parts, 'seg_bank_w.png'))[Y0:Y0 + H, X0:X0 + W, :3]
    a = np.clip(1 - (w - k).mean(2), 0, 1)
    col = np.where(a[..., None] > 0.02, np.clip(k / np.maximum(a[..., None], 1e-3), 0, 1), 0)
    return col, a


def modes(col, mask, n=2):
    """The n most frequent exact colours (8-bit) in a mask: v2's stones as the flat paints them."""
    c8 = np.round(col[mask] * 255).astype(np.int32)
    key = (c8[:, 0] << 16) | (c8[:, 1] << 8) | c8[:, 2]
    vals, cnt = np.unique(key, return_counts=True)
    top = vals[np.argsort(-cnt)[:n]]
    return [np.array([(v >> 16) & 255, (v >> 8) & 255, v & 255]) / 255.0 for v in top]


def x_on_line(px, py, y540):
    """Where the line from GROUND_VP2 through (px, py) meets the bank edge y540 (its x): a flag's place along its tread."""
    X2, Y2 = Q.VP2
    m = (y540 - Q.VP[1]) / (540.0 - Q.VP[0])
    A = Q.VP[1] - m * Q.VP[0]
    return (X2 * (py - Y2) + (A - Y2) * (px - X2)) / ((py - Y2) - m * (px - X2))


def toward_vp(x, y):
    dx, dy = Q.VP[0] - x, Q.VP[1] - y
    n = math.hypot(dx, dy)
    return dx / n, dy / n


def make(parts, seed='v7/quay', dose=None):
    D = dict(DOSE, **(dose or {}))
    X0, Y0, W, H = BOX
    col, alpha = flat_bank(parts)
    bank = alpha > 0.5
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float64)
    fx, fy = xx + X0, yy + Y0
    R = Q.regions()
    crop = lambda m: m[Y0:Y0 + H, X0:X0 + W]
    rng = L.seeded(seed)
    # the hand-ruled bow: every band edge wobbles by a sub-pixel amount (0.7 px at 160 px, 0.3 px at 60 px), so the
    # nosings are drawn, never ruled
    bow = np.zeros((H, W))
    for i, (lam, amp) in enumerate([(160.0, 0.7), (60.0, 0.3)]):
        nz = value_noise(f'{seed}/bow/{i}', (H, W), lam, octaves=1)
        bow += amp * nz / (nz.std() + 1e-9)
    Y540 = Q.y540_of(fx, fy + bow)
    band_of = lambda k: (Y540 >= Q.BAND_Y0[k]) & (Y540 < Q.BAND_Y1[k])
    tread = {k: band_of(k) & (Y540 >= Q.BAND_Y0[k] + Q.LIPS[k]) & bank for k in range(7)}
    lip = {k: band_of(k) & (Y540 < Q.BAND_Y0[k] + Q.LIPS[k]) & bank for k in range(1, 7)}
    coping = (Y540 < Q.BAND_Y0[0]) & bank
    ok = L.rgb2ok(col)
    tgt = ok.copy()
    lipcol = {}
    treadcol = {}
    # ---- 1. flags, hand-laid
    joints = np.zeros((H, W), np.float32)
    jcol = np.zeros((H, W, 3))
    for k in range(7):
        tm = tread[k]
        if tm.sum() < 60:
            continue
        ca = modes(col, tm, 2)
        if len(ca) < 2:
            ca = ca * 2
        cs = [L.rgb2ok(c) for c in ca]
        treadcol[k] = 0.5 * (cs[0] + cs[1])
        y0, y1 = Q.BAND_Y0[k] + Q.LIPS[k], min(Q.BAND_Y1[k], 2400.0)
        mid = 0.5 * (y0 + y1)
        xm = x_on_line(fx, fy, mid)
        # the joints along the mid line: a ground length ~1.0-1.6 m, finer toward the canal (StoneBand's rule), staggered
        x = -420.0 - 60.0 * (k % 2) - rng.uniform(0, 60)
        xs = []
        while x < 1700:
            xs.append(x)
            step = 150 * ((x - Q.VP[0]) / (540 - Q.VP[0])) * ((mid - Q.VP[1]) / (1500 - Q.VP[1])) ** 1.5 * rng.uniform(0.78, 1.3)
            x += max(16.0, step)
        xs = np.array(xs)
        idx = np.clip(np.searchsorted(xs, xm) - 1, 0, len(xs) - 1)
        n = len(xs)
        pick = np.zeros(n, np.int32)
        for i in range(1, n):
            pick[i] = 1 - pick[i - 1] if rng.random() > 0.22 else pick[i - 1]
        fcol = np.array([cs[p] for p in pick])
        fcol[:, 0] += rng.uniform(-1, 1, n) * D['flag'] * rng.uniform(0.35, 1.0, n)
        fcol[:, 1] += rng.normal(0, 0.004, n)
        fcol[:, 2] += rng.normal(0, 0.006, n)
        tgt[tm] = fcol[idx[tm]]
        # the cross joints: thin strips toward GROUND_VP2, a third lost, the rest in 2-4 pieces with gaps, ends faded
        jc = L.rgb2ok(modes(col, lip.get(k, tm) if k in lip else tm, 1)[0])
        for i in range(1, n):
            if rng.random() < 0.34:
                continue
            p_top = (x_on_line_inv := None)
            # the joint's two ends: where the line from VP2 through the mid-line point meets the tread's top and bottom
            xmid = xs[i]
            ymid = Q.edge_y(mid, xmid)
            pts = []
            for ye in (y0, y1):
                xe = x_on_line(np.array([xmid]), np.array([ymid]), ye)[0]
                pts.append((xe - X0, Q.edge_y(ye, xe) - Y0))
            (ax_, ay_), (bx_, by_) = pts
            if max(ay_, by_) < 0 or min(ay_, by_) > H:
                continue
            gs = float(Q.ground_scale(xmid, ymid))
            jw = max(0.6, 2.4 * gs)
            npc = int(rng.integers(2, 5))
            cuts = np.sort(rng.uniform(0.1, 0.9, npc - 1))
            edges = np.concatenate([[0.0], cuts, [1.0]])
            for a0, a1 in zip(edges[:-1], edges[1:]):
                g = rng.uniform(0.05, 0.13)
                s0, s1 = a0 + g * 0.5, a1 - g * 0.5
                if s1 <= s0:
                    continue
                strength = D['joint'] * rng.uniform(0.45, 1.0)
                # a piece as a polygon strip, its two ends faded (drawn as three sub-pieces at 0.5 / 1 / 0.5)
                for (t0, t1, f) in ((s0, s0 + 0.12 * (s1 - s0), 0.45), (s0 + 0.12 * (s1 - s0), s1 - 0.12 * (s1 - s0), 1.0), (s1 - 0.12 * (s1 - s0), s1, 0.45)):
                    p0 = (ax_ + (bx_ - ax_) * t0, ay_ + (by_ - ay_) * t0)
                    p1 = (ax_ + (bx_ - ax_) * t1, ay_ + (by_ - ay_) * t1)
                    canvas = np.zeros((H, W), np.uint8)
                    cv2.line(canvas, (int(round(p0[0] * 4)), int(round(p0[1] * 4))), (int(round(p1[0] * 4)), int(round(p1[1] * 4))),
                             255, max(1, int(round(jw * 4))), cv2.LINE_AA, shift=2)
                    v = canvas.astype(np.float32) / 255.0 * strength * f
                    upd = v > joints
                    joints[upd] = v[upd]
                    jcol[upd] = jc
        del p_top
    jm = (joints > 0) & bank & ~coping
    tgt[jm] = tgt[jm] * (1 - joints[jm, None]) + jcol[jm] * joints[jm, None]
    # ---- 2. the lips: tone moving along them, lost over long stretches, chipped at the nosing
    for k in range(1, 7):
        lm = lip[k]
        if lm.sum() < 20:
            continue
        lc = L.rgb2ok(modes(col, lm, 1)[0])
        lipcol[k] = lc
        near = treadcol.get(k, treadcol.get(k - 1, lc))
        far = treadcol.get(k - 1, near)
        nb = 0.5 * (near + far)
        n1 = value_noise(f'{seed}/lip/{k}', (1, W + 400), 70, octaves=2, gain=0.5)[0, 200:200 + W]
        n2 = value_noise(f'{seed}/lip2/{k}', (1, W + 400), 26, octaves=2, gain=0.5)[0, 200:200 + W]
        lost = np.clip(0.5 + 0.9 * n1 + 0.3 * n2, 0, 1)
        lost = L.smoothstep(0.42, 0.82, lost) * D['lip_lost']
        lv = np.broadcast_to(lost[None, :], (H, W))
        c = lc[None, :] * (1 - lv[lm, None]) + nb[None, :] * lv[lm, None]
        c[:, 0] += rng.normal(0, 0.004)
        tgt[lm] = c
        # chips: small bites of the tread's stone into the nosing, every 60-150 px (sized by the ground)
        x = rng.uniform(0, 80)
        while x < W:
            yl = Q.edge_y(Q.BAND_Y0[k], x + X0) - Y0
            gs = float(Q.ground_scale(x + X0, yl + Y0))
            rx, ry = rng.uniform(3, 9) * gs, rng.uniform(1.2, 3.2) * gs
            ang = math.degrees(math.atan(Q.VP[1] - (yl + Y0)) if False else math.atan2((yl + Y0) - Q.VP[1], (x + X0) - Q.VP[0]))
            canvas = np.zeros((H, W), np.uint8)
            cv2.ellipse(canvas, (int(round(x * 4)), int(round(yl * 4))), (max(1, int(rx * 4)), max(1, int(ry * 4))), ang, 0, 360, 255, -1, cv2.LINE_AA, shift=2)
            m = (canvas > 0) & lm
            if m.any():
                w_ = canvas[m].astype(np.float64)[:, None] / 255.0
                tgt[m] = tgt[m] * (1 - w_) + far[None, :] * w_
            x += rng.uniform(60, 150) * max(gs, 0.35)
    # ---- 3. wear and water
    mott = value_noise(f'{seed}/mott', (H, W), 160, octaves=3, gain=0.55)
    mott2 = value_noise(f'{seed}/mott2', (H, W), 46, octaves=2, gain=0.5)
    paved = bank & ~coping
    tgt[paved, 0] += (D['mott'] * mott + 0.008 * mott2)[paved]
    tgt[paved, 2] += (0.004 * mott)[paved]
    wet, pud, _ = Q.wet_field()
    wet, pud = crop(wet).astype(np.float64), crop(pud).astype(np.float64)
    damp = np.clip(wet - pud, 0, 1)
    tgt[paved, 0] -= (D['wet'] * pud + 0.022 * damp)[paved]
    tgt[paved, 1:] *= (1 + D['puddle_rich'] * pud)[paved, None]
    # the coping keeps its design; its iron cleats calmed toward its stone (tone-on-tone: R2's value pieces)
    cop_l = L.Lstar(col)
    cl = coping & (cop_l < 40) & (Y540 > Q.COPING[0] + 6)
    if cl.any():
        cs = L.rgb2ok(modes(col, coping & (cop_l > 50), 1)[0])
        tgt[cl] = tgt[cl] * 0.45 + cs[None, :] * 0.55
    # the coping's waterside edge (the canal's kerb: v7a's longest straight line after the lips): its wet dark lip broken
    # into pieces with lost stretches (lerped to the coping's stone) and a few chips; the kerb itself hand-cut
    if coping.any():
        cop_stone = L.rgb2ok(modes(col, coping & (cop_l > 50), 1)[0])
        lipw = coping & (Y540 < Q.COPING[0] + 6)
        # the edge row's seam: the flat's light top face peeks out under its dark wet lip in the anti-aliased row (a
        # 1 px bright line along the whole canal once the matte is divided out); that row takes the lip's own colour
        lip_dark = L.rgb2ok(modes(col, lipw & (cop_l < 45), 1)[0])
        seam = (alpha > 0.01) & (Q.y540_of(fx, fy) < Q.COPING[0] + 1.6)
        tgt[seam] = lip_dark
        nk = value_noise(f'{seed}/kerb', (1, W + 400), 70, octaves=2, gain=0.55)[0, 200:200 + W]
        lostk = L.smoothstep(0.1, 0.6, nk) * 0.7
        lk = np.broadcast_to(lostk[None, :], (H, W))
        tgt[lipw] = tgt[lipw] * (1 - lk[lipw, None]) + cop_stone[None, :] * lk[lipw, None]
    base = L.ok2rgb(tgt)
    # ---- 4. the marks (MyPaint)
    plan = L.StrokePlan((seed, 'plan'))
    r = plan.rng
    clips = {}
    for k in range(7):
        if tread[k].sum() > 60:
            clips[f't{k}'] = cv2.dilate(tread[k].astype(np.uint8), np.ones((3, 3), np.uint8)).astype(np.float64)
    for k in range(1, 7):
        if lip[k].sum() > 20:
            clips[f'l{k}'] = lip[k].astype(np.float64)
    clips['cop'] = coping.astype(np.float64)
    tok = L.rgb2ok(base)

    def colour_at(x, y, dL, db=0.0):
        xi, yi = int(np.clip(x, 0, W - 1)), int(np.clip(y, 0, H - 1))
        c = tok[yi, xi] + np.array([dL, 0.0, db])
        return L.ok2rgb(c)

    def along(x, y, length):
        ux, uy = toward_vp(x + X0, y + Y0)
        return [(x - ux * length / 2, y - uy * length / 2), (x + ux * length / 2, y + uy * length / 2)]

    tk_of = np.full((H, W), -1, np.int8)
    for k in range(7):
        tk_of[tread[k]] = k
    ys_, xs_ = np.nonzero(tk_of >= 0)
    order = r.permutation(len(xs_))
    # the near half carries the bold marks (they read at 400 px); the far half by the canal only a few fine ones: a shade
    # zone stays <= ~35 % covered (PAINT_RECIPES §1.4: calm stays calm), never an even texture
    dist_lip = cv2.distanceTransform((~np.any([lip[k] for k in lip], axis=0)).astype(np.uint8), cv2.DIST_L2, 3)
    cover = np.zeros((H, W), np.float32)

    def footprint(pts, wd):
        c8 = np.zeros((H, W), np.uint8)
        (ax_, ay_), (bx_, by_) = pts
        cv2.line(c8, (int(ax_), int(ay_)), (int(bx_), int(by_)), 1, max(1, int(wd)))
        return c8.astype(bool)

    # (a) washes: a few big soft strokes along the treads, very low opacity: the stone's slow colour
    n = 0
    for j in order:
        if n >= D['wash']:
            break
        x, y = xs_[j], ys_[j]
        gs = float(Q.ground_scale(x + X0, y + Y0))
        if r.random() > 0.00025 / max(gs, 0.3):
            continue
        k = int(tk_of[y, x])
        plan.add('wash', 'ramon/wet_round', along(x, y, r.uniform(180, 380) * gs), colour_at(x, y, r.choice([-1, 1]) * r.uniform(0.012, 0.028)),
                 r.uniform(40, 90) * gs, r.uniform(0.08, 0.14), clip=f't{k}', ds=2.0)
        n += 1
    # (b) the flat blocky strokes along the perspective: broad and few near the camera, fine and fewer by the canal; never
    # inside a puddle, never on a lip (the steps stay legible), each a value step off its own flag (no hue jitter)
    n_near = n_far = 0
    for j in order:
        if n_near >= D['form'] and n_far >= D['form_far']:
            break
        x, y = xs_[j], ys_[j]
        if pud[y, x] > 0.3 or dist_lip[y, x] < 5:
            continue
        gs = float(Q.ground_scale(x + X0, y + Y0))
        near = gs > 0.75
        if (near and n_near >= D['form']) or (not near and n_far >= D['form_far']):
            continue
        if r.random() > (0.0011 if near else 0.0009):
            continue
        k = int(tk_of[y, x])
        Ls = r.uniform(70, 190) * gs
        wd = r.uniform(12, 28) * gs
        if wd < 3.0:
            continue
        pts = along(x, y, Ls)
        fp = footprint(pts, wd)
        if cover[fp].mean() > 0.35:
            continue
        cover[fp] = 1.0
        dl = r.choice([-1, 1]) * r.uniform(0.022, 0.045)
        plan.add('form', 'tanda/acrylic-04-paint', pts, colour_at(x, y, dl), wd, r.uniform(0.35, 0.6), clip=f't{k}', ds=1.0)
        if near:
            n_near += 1
        else:
            n_far += 1
    n = n_near + n_far
    # (c) strokes lapping across the nosings where a lip is lost: the long line breaks into pieces
    n = 0
    for k in range(1, 7):
        lm = lip[k]
        if not lm.any():
            continue
        x = r.uniform(0, 40)
        while x < W and n < D['lost']:
            yl = Q.edge_y(Q.BAND_Y0[k] + 0.5 * Q.LIPS[k], x + X0) - Y0
            gs = float(Q.ground_scale(x + X0, yl + Y0))
            xi, yi = int(np.clip(x, 0, W - 1)), int(np.clip(yl, 0, H - 1))
            lostv = abs(tok[yi, xi, 0] - tok[int(np.clip(yi - 6 * gs - 3, 0, H - 1)), xi, 0])
            if lostv < 0.035 and r.random() < 0.75:
                side = -1 if r.random() < 0.5 else 1
                off = side * r.uniform(1.0, 3.5) * gs
                ux, uy = toward_vp(x + X0, yl + Y0)
                cx, cy = x - uy * off, yl + ux * off
                c = colour_at(cx - uy * side * 4 * gs, cy + ux * side * 4 * gs, r.normal(0, 0.008))
                plan.add('lost', 'tanda/acrylic-04-paint', along(cx, cy, r.uniform(26, 70) * gs), c, r.uniform(4.0, 8.5) * gs, r.uniform(0.55, 0.85), ds=1.0)
                n += 1
            x += r.uniform(30, 75) * max(gs, 0.4)
    # (d) along each lip in its own stone
    n = 0
    for k in range(1, 7):
        if f'l{k}' not in clips:
            continue
        x = r.uniform(0, 60)
        while x < W and n < D['lipmark']:
            yl = Q.edge_y(Q.BAND_Y0[k] + 0.5 * Q.LIPS[k], x + X0) - Y0
            gs = float(Q.ground_scale(x + X0, yl + Y0))
            plan.add('lipmark', 'tanda/acrylic-04-paint', along(x, yl, r.uniform(40, 110) * gs), colour_at(x, yl, r.choice([-1, 1]) * r.uniform(0.012, 0.028)),
                     max(2.8, Q.LIPS[k] * gs * r.uniform(0.7, 1.1)), r.uniform(0.5, 0.8), clip=f'l{k}', ds=1.0)
            n += 1
            x += r.uniform(110, 240) * max(gs, 0.4)
    # (e) a few worn chips on the nosings: short crisp marks of a lighter stone (the edge the feet wore)
    n = 0
    for k in range(1, 7):
        x = r.uniform(0, 120)
        while x < W and n < D['chip']:
            yl = Q.edge_y(Q.BAND_Y0[k], x + X0) - Y0
            gs = float(Q.ground_scale(x + X0, yl + Y0))
            if r.random() < 0.6:
                plan.add('accent', 'deevad/brush', along(x, yl - 0.8 * gs, r.uniform(8, 22) * gs), colour_at(x, yl - 3 * gs, r.uniform(0.03, 0.06)),
                         max(1.6, r.uniform(1.6, 3.2) * gs), r.uniform(0.6, 0.9), ds=0.8)
                n += 1
            x += r.uniform(120, 260) * max(gs, 0.4)
    # the coping: a few level strokes along its top in its own stone
    ys_c, xs_c = np.nonzero(coping & (L.Lstar(base) > 45))
    for j in r.permutation(len(xs_c))[:14]:
        x, y = xs_c[j], ys_c[j]
        gs = float(Q.ground_scale(x + X0, y + Y0))
        plan.add('form', 'tanda/acrylic-04-paint', along(x, y, r.uniform(30, 80) * gs), colour_at(x, y, r.choice([-1, 1]) * r.uniform(0.015, 0.03)), max(2.6, r.uniform(4, 8) * gs),
                 r.uniform(0.4, 0.7), clip='cop', ds=1.0)
    base_rgba = np.dstack([base, alpha])
    painted, sec = L.mypaint(base_rgba, plan.strokes, clips=clips, tag='v7quay')
    # ---- 5. the puddles' water: smooth, no marks inside (the wet colour, softly blurred, laid back over them)
    smooth = np.dstack([cv2.GaussianBlur(base[..., c].astype(np.float32), (0, 0), 2.2) for c in range(3)]).astype(np.float64)
    pw = np.clip((pud - 0.25) / 0.6, 0, 1)[..., None]
    out = painted.copy()
    out[..., :3] = painted[..., :3] * (1 - pw) + smooth * pw
    out[..., 3] = alpha
    # the kerb's wet lip reaches 2 px over the canal's last rows (the painted canal mirrors the light coping there: a
    # bright seam along the whole kerb): solid, in the lip's own dark stone
    if coping.any():
        yk = Q.edge_y(Q.COPING[0], fx)
        over = (fy >= yk - 2.6) & (fy < yk + 1.5)
        out[over, :3] = L.ok2rgb(lip_dark)
        out[over, 3] = np.maximum(out[over, 3], np.clip((fy[over] - (yk[over] - 2.6)) / 0.8, 0, 1))
    stats = dict(box=list(BOX), strokes=plan.count(), mypaint_s=round(sec, 2), puddle_px=int((pud > 0.5).sum()))
    return out, stats
