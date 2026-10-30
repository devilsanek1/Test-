"""piece_paving.py: the organic paving of our bank (docs/look/organic/organic_proof.md section 2.4). Measured on v6
(shapes.md 2.5, techniques.md 1): 80 % of the paving's edge length straight, 68 % ruler lines (the treads' nosings and
the joints cross the frame), 86 % crisp, 1 % lost, perfect-ellipse shadows, dead-flat fields. This keeps v6's design
(the coping, the landing, five treads, their lips, the alternating flags, the joints to the second vanishing point;
read from the engine: OrganicFlat 'bands' for the exact geometry, OrganicS1 'noProps' for the scene's own colours)
and repaints it by the shapes lane's ground rules (shapes.md 3.2 "Ground") and the near plane's dose:
  1. HAND-LAID: a sub-pixel bow on every long line (no wobble); each joint broken into pieces with lost gaps (10-25 %
     of its length) and faded ends; each flag its own value (+-1-3.5 L*): flags suggested by value patches.
  2. LIGHT: the whole bank a ramp toward the low sun and the canal (+-3 L*, warmer toward the light), a slow mottle.
  3. MARKS (MyPaint): flat-brush strokes along the treads toward the vanishing point, their size by perspective
     (bigger near, finer toward the canal), a value step off the flag's own, denser where an edge is lost; on the
     nosings, where the lip and the tread meet at a close value, strokes lap across (the ruler line breaks).
  4. SHADOWS (the ground's, baked; techniques.md 3.6): the props' contact and cast shadows recovered exactly from the
     engine (the frame / the frame with the ground's shadows off), their outlines displaced at the shadow octaves and
     their far ends softened: natural shapes lying across the man-made grid, never perfect ellipses.
The props, Pip and the bench stay the scene's own, crisp, drawn over this piece in the engine (OrganicSteps)."""
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

BOX = (0, 1140, 1080, 780)               # frame px: x, y, w, h (our bank: y 1144-1920)
VP = (-1100.0, 1000.0)                   # the ground's vanishing point along the canal (V2S1_steps_stone GROUND_VP)
LIGHT2 = np.array([-0.75, -0.66])        # toward the low sun (and the canal), in the picture


def ground_scale(x, y):
    """V2S1_steps_stone groundScale: 1 at x 540 on the line y540 = 1500; things shrink toward the vanishing point."""
    return ((x - VP[0]) / (540 - VP[0])) * (np.maximum(y - VP[1], 1) / (1500 - VP[1])) ** 0.5


def components(lab):
    comp = np.full(lab.shape, -1, np.int32)
    colour_of = []
    n = 0
    for l in np.unique(lab[lab >= 0]):
        cc, k = ndi.label(lab == l)
        comp[cc > 0] = cc[cc > 0] - 1 + n
        colour_of += [l] * k
        n += k
    return comp, np.array(colour_of, np.int32)


def make(out_dir, seed=('organic', 'paving', 1), dose=1.0, renders=None):
    os.makedirs(out_dir, exist_ok=True)
    R = renders or os.path.join(L.SCRATCH, 'renders')
    X0, Y0, W, H = BOX
    crop = lambda im: im[Y0:Y0 + H, X0:X0 + W]
    flat = crop(L.load_rgba(os.path.join(R, 'flat_bands.png')))
    nop = crop(L.load_rgba(os.path.join(R, 'v6_noProps.png')))[..., :3]
    v6 = crop(L.load_rgba(os.path.join(R, 'v6.png')))[..., :3]
    gu = crop(L.load_rgba(os.path.join(R, 'v6_groundUnlit.png')))[..., :3]
    nopip = crop(L.load_rgba(os.path.join(R, 'v6_noPip.png')))[..., :3]
    alpha = flat[..., 3]
    bank = alpha > 0.5
    fy = np.arange(H)[:, None] + Y0
    fx = np.arange(W)[None, :] + X0
    rng = L.seeded(seed, 'paving')
    # ---- 1. the design: v6's regions with the scene's own colours (the flat's geometry: no occluders)
    lab, cols = L.flat_labels(flat)

    def bow(tag):
        out = np.zeros((H, W))
        for i, (lam, a) in enumerate([(160, 0.7), (60, 0.3)]):
            nz = L.fnl((H, W), L.seed_int(seed, tag, i), 1.0 / lam, octaves=1)
            out += a * nz / (nz.std() + 1e-9)
        return out.astype(np.float32)
    lab = L.warp_labels(lab, bow('bx'), bow('by'))
    lab[~bank] = -1
    lab = L.clean_labels(lab, 30)
    comp, colour_of = components(lab)
    n = len(colour_of)
    occl = (np.abs(v6 - nopip).max(2) > 1 / 255) | (np.abs(gu - nop).max(2) > 1 / 255)    # Pip, the props
    occl = ndi.binary_dilation(occl, iterations=2)
    med = np.zeros((n, 3))
    for i in range(n):
        m = (comp == i)
        mm = m & ~occl
        med[i] = np.median(nop[mm if mm.sum() > 3 else m], axis=0)
    base = np.zeros((H, W, 3))
    base[comp >= 0] = med[comp[comp >= 0]]
    okb = L.rgb2ok(base)
    Lb = L.Lstar(base)
    # the faces: big (flags, tread tops) and thin (joints, lips): thickness from the inside distance
    area = ndi.sum(np.ones_like(comp), comp, index=np.arange(n))
    objs = ndi.find_objects(comp + 1, max_label=n)
    thick = np.zeros(n)
    for i, sl in enumerate(objs):
        if sl is not None:
            thick[i] = 2 * ndi.distance_transform_edt(np.pad(comp[sl] == i, 1))[1:-1, 1:-1].max()
    # ---- flags: each its own value; joints broken into pieces with lost gaps and faded ends
    tgt = okb.copy()
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float64)
    for i in range(n):
        if area[i] < 40:
            continue
        m = comp == i
        if thick[i] >= 8:                                        # a flag or a tread's lit top: its own value
            tgt[m, 0] += rng.uniform(-0.03, 0.03) * rng.uniform(0.35, 1.0)
        else:                                                    # a thin joint or lip: broken, its ends fading
            ys, xs = np.nonzero(m)
            if len(xs) < 30:
                continue
            cx, cy = xs.mean(), ys.mean()
            cxx, cyy, cxy = ((xs - cx) ** 2).mean(), ((ys - cy) ** 2).mean(), ((xs - cx) * (ys - cy)).mean()
            ang = 0.5 * math.atan2(2 * cxy, cxx - cyy)
            t = (xs - cx) * math.cos(ang) + (ys - cy) * math.sin(ang)
            t = (t - t.min()) / max(t.max() - t.min(), 1)
            Lt = t.max() if t.max() > 0 else 1
            # the neighbour's colour (the flag beside it)
            ring = ndi.binary_dilation(m, iterations=3) & ~m & (comp >= 0)
            if not ring.any():
                continue
            nb = np.median(okb[ring], axis=0)
            fade = np.clip(np.minimum(t, 1 - t) / 0.14, 0, 1)                # faded ends
            gaps = np.zeros_like(t)
            for g in range(int(rng.integers(1, 3)) if (xs.max() - xs.min()) > 60 else 0):
                c0, half = rng.uniform(0.2, 0.8), rng.uniform(0.05, 0.12)
                gaps = np.maximum(gaps, np.clip(1 - np.abs(t - c0) / half, 0, 1) ** 0.6)
            keep = fade * (1 - gaps)
            tgt[ys, xs] = tgt[ys, xs] * keep[:, None] + nb * (1 - keep[:, None])
    # ---- 2. the light: a ramp toward the low sun and the canal, warmer toward it; a slow mottle
    proj = ((xx - W / 2) * LIGHT2[0] + (yy - H / 2) * LIGHT2[1]) / (0.5 * math.hypot(W, H))
    mott = L.fnl((H, W), L.seed_int(seed, 'mott'), 1 / 90.0, octaves=2)
    tgt[..., 0] += 0.022 * np.clip(proj, -1, 1) + 0.008 * mott
    tgt[..., 2] += 0.005 * np.clip(proj, -1, 1)
    target = L.ok2rgb(tgt)
    # ---- 3. the marks, along the treads toward the vanishing point, sized by perspective
    plan = L.StrokePlan((seed, 'paving', 'plan'))
    r = plan.rng
    bnd = L.boundaries(np.where(bank, comp, -1)) & bank
    Lbig = cv2.dilate(Lb.astype(np.float32), np.ones((5, 5), np.uint8)) - cv2.erode(Lb.astype(np.float32), np.ones((5, 5), np.uint8))
    lostb = bnd & (Lbig < 6.0)
    ldist = ndi.distance_transform_edt(~lostb)
    used = set()
    ys, xs = np.nonzero(bank & (comp >= 0))
    pick = r.permutation(len(xs))
    nmark = 0
    budget = int(800 * dose)
    for j in pick:
        if nmark >= budget:
            break
        x, y = xs[j], ys[j]
        i = comp[y, x]
        if thick[i] < 8:
            continue
        gs = float(ground_scale(x + X0, y + Y0))
        # density: a base everywhere, more near lost edges; fewer per px where the marks are big (near)
        p = (0.0035 + 0.02 * math.exp(-ldist[y, x] / (10 * gs))) / max(gs, 0.3) ** 1.5
        if r.random() > p * 6:
            continue
        dx_, dy_ = VP[0] - (x + X0), VP[1] - (y + Y0)
        dn = math.hypot(dx_, dy_)
        ux, uy = dx_ / dn, dy_ / dn
        Ls = r.uniform(30, 80) * gs
        wd = r.uniform(7, 14) * gs
        if Ls < 8 or wd < 2.5:
            continue
        c = L.rgb2ok(target[y, x]) + np.array([r.choice([-1, 1]) * r.uniform(0.006, 0.016), 0, r.normal(0, 0.003)])
        ck = 'c%d' % colour_of[i]
        used.add(ck)
        near_lost = ldist[y, x] < 6 * gs and r.random() < 0.3
        plan.add('flag', 'tanda/acrylic-04-paint', [(x - ux * Ls / 2, y - uy * Ls / 2), (x + ux * Ls / 2, y + uy * Ls / 2)], L.ok2rgb(c), wd,
                 r.uniform(0.45, 0.75), clip=None if near_lost else ck, ds=1.0)
        nmark += 1
    # the long nosings: where the lip meets the tread at a close value, strokes lap across (the ruler line breaks)
    lys, lxs = np.nonzero(lostb & (Lbig > 1.0))
    taken = np.zeros((H, W), bool)
    for j in r.permutation(len(lxs)):
        x, y = lxs[j], lys[j]
        gs = float(ground_scale(x + X0, y + Y0))
        sp = int(max(14, 60 * gs))
        if taken[max(0, y - sp // 3):y + sp // 3 + 1, max(0, x - sp):x + sp + 1].any() or r.random() > 0.5 * dose:
            continue
        taken[y, x] = True
        dx_, dy_ = VP[0] - (x + X0), VP[1] - (y + Y0)
        dn = math.hypot(dx_, dy_)
        ux, uy = dx_ / dn, dy_ / dn
        side = 1 if r.random() < 0.5 else -1
        sx, sy = int(np.clip(x - uy * 4 * side, 0, W - 1)), int(np.clip(y + ux * 4 * side, 0, H - 1))
        Ls = r.uniform(26, 60) * gs
        off = side * r.uniform(0.5, 2.0) * gs
        cx_, cy_ = x - uy * off, y + ux * off
        plan.add('lost', 'tanda/acrylic-04-paint', [(cx_ - ux * Ls / 2, cy_ - uy * Ls / 2), (cx_ + ux * Ls / 2, cy_ + uy * Ls / 2)],
                 target[sy, sx], r.uniform(3.5, 7.0) * gs, r.uniform(0.55, 0.85), ds=1.0)
    clips = {ck: ndi.binary_dilation(lab == int(ck[1:]), iterations=1).astype(np.float64) for ck in sorted(used)}
    base_rgba = np.dstack([target, alpha])
    painted, sec = L.mypaint(base_rgba, plan.strokes, clips=clips, tag='paving')
    # ---- 4. the ground's shadows, recovered exactly, then made natural
    shadow = bank & ~occl
    F = np.ones((H, W, 3))
    F[shadow] = np.clip(v6[shadow] / np.maximum(gu[shadow], 1e-3), 0.3, 1.0)
    # under the props (hidden there anyway) the factor continues: inpainted
    unk = (bank & occl).astype(np.uint8)
    F8 = np.clip(np.round(F * 255), 0, 255).astype(np.uint8)
    F8 = np.dstack([cv2.inpaint(np.ascontiguousarray(F8[..., c]), unk, 5, cv2.INPAINT_TELEA) for c in range(3)])
    F = F8.astype(np.float64) / 255.0
    # natural outlines: the factor field displaced at the shadow octaves (60 / 24 px), a soft penumbra
    def disp(tag, octs):
        out = np.zeros((H, W), np.float32)
        for i, (lam, a) in enumerate(octs):
            nz = L.fnl((H, W), L.seed_int(seed, tag, i), 1.0 / lam, octaves=1)
            out += a * nz / (nz.std() + 1e-9)
        return out
    gyy, gxx = np.mgrid[0:H, 0:W].astype(np.float32)
    octs = [(70.0, 2.6), (26.0, 1.2), (11.0, 0.6)]
    Fw = cv2.remap(F.astype(np.float32), gxx + disp('sx', octs), gyy + disp('sy', octs), cv2.INTER_LINEAR, borderMode=cv2.BORDER_REPLICATE)
    soft = np.clip(1.0 - F.min(axis=2), 0, 1)
    Fw = np.dstack([cv2.GaussianBlur(Fw[..., c], (0, 0), 1.6) for c in range(3)])
    out = painted.copy()
    out[..., :3] = np.clip(painted[..., :3] * Fw, 0, 1)
    L.save_rgba(os.path.join(out_dir, 'paving_base.png'), base_rgba)
    L.save_rgba(os.path.join(out_dir, 'paving.png'), out)
    stats = dict(box=list(BOX), regions=n, strokes=plan.count(), mypaint_s=round(sec, 2), shadow_px=int((soft > 0.02).sum()))
    return out, stats


if __name__ == '__main__':
    o = sys.argv[1] if len(sys.argv) > 1 else os.path.join(L.SCRATCH, 'pieces')
    _, st = make(o)
    print(st)
