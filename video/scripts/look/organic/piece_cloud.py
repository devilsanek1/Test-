"""piece_cloud.py: the organic near cumulus (docs/look/organic/organic_proof.md section 2.1). The owner liked v6's cloud
("AI generated cloud certainly fits", 2026-10-30), so this REPAINTS v6's own painted plane (public/paint/v2s1_v6/
clouds_p3.png: its colours, its light, its softness) and changes what read geometric in it (shapes.md 2.2: a union of
circles, 27 % compass arcs, one soft edge quality all round, a big disc's arc inside):
  1. SHAPE (shapes.md 3.1, techniques.md 3.7 rank 7: a raster warp on a baked natural piece): the whole piece
     displaced by FastNoiseLite fBm at the cloud octaves (150 / 60 / 24 / 12 px wavelengths): every billow's arc and
     the disc's arc become free curves; the base only slides level (it stays a flat condensation base).
  2. SILHOUETTE: the outline re-cut by value noise at the cloud octaves (shapes_gen.displace, the short octave kept: it
     is the one that breaks the compass), more ragged on the side away from the sun.
  3. EDGES (techniques.md 3.6, shapes.md 3.3): found and crisp where the silhouette faces the low sun, lost (v6's soft
     alpha, wider) away from it and along the base, broken by short level dry-brush teeth between, alternating along
     the outline by a slow noise.
  4. MARKS (libraries.md rank 1): MyPaint strokes over v6's painting, their colours sampled from it: a few broad
     flat-brush strokes along the billows where the form turns (the shade mass stays calm), blending-knife strokes
     across the old disc's arc and the shade-side terminators, crisp accents along the found lit edge, a few dry level
     strokes in the dissolving base. The cloud is the frame's farthest painted piece: the most brush."""
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
import shapes_gen as SG  # noqa: E402  (the shapes lane's generators, read-only)

V6 = os.path.join(L.VIDEO, 'public', 'paint', 'v2s1_v6', 'clouds_p3.png')
BOX = (560, 0, 520, 345)                 # frame px: x, y, w, h (v6's clouds_p3 box)
LIGHT = np.array([-0.70, -0.62, 0.36])   # toward the low sun: left, up, toward us (v6's key)
WIND = (-1.0, 0.0)                       # the sky's brush direction: level
BASE_Y = 300.0                           # v6's flat base (frame px)
# the warp's octaves: (wavelength px, RMS displacement px), above the references' wiggle on purpose (shapes.md 3.1:
# on a smooth piece the displacement is the only source of irregularity)
WARP = [(150.0, 4.5), (60.0, 2.4), (24.0, 1.2), (12.0, 0.7)]


def warp_field(shape, seed, octs=WARP):
    dx = np.zeros(shape, np.float32)
    dy = np.zeros(shape, np.float32)
    for i, (lam, amp) in enumerate(octs):
        nx = L.fnl(shape, L.seed_int(seed, 'wx', i), 1.0 / lam, octaves=1)
        ny = L.fnl(shape, L.seed_int(seed, 'wy', i), 1.0 / lam, octaves=1)
        dx += amp * nx / (nx.std() + 1e-9)
        dy += amp * ny / (ny.std() + 1e-9)
    return dx, dy


def remap_rgba(rgba, dx, dy):
    """Warp a straight-alpha RGBA through its premultiplied form (no dark fringes)."""
    h, w = rgba.shape[:2]
    ys, xs = np.mgrid[0:h, 0:w].astype(np.float32)
    pre = np.dstack([rgba[..., :3] * rgba[..., 3:4], rgba[..., 3:4]]).astype(np.float32)
    out = cv2.remap(pre, xs + dx, ys + dy, cv2.INTER_LINEAR, borderMode=cv2.BORDER_REPLICATE)
    a = out[..., 3:4]
    rgb = out[..., :3] / np.maximum(a, 1e-6)
    return np.dstack([np.clip(rgb, 0, 1), np.clip(a, 0, 1)]).astype(np.float64)


def recut(alpha, seed):
    """The crisp silhouette: v6's outline (alpha 0.5), displaced at the cloud octaves, more ragged away from the sun;
    the base and the frame's cut edges stay where they are."""
    H, W = alpha.shape
    m = (alpha > 0.5).astype(np.uint8)
    Rm = math.sqrt(m.sum() / math.pi)
    cs, _ = cv2.findContours(m, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
    out = np.zeros((H * 4, W * 4), np.uint8)
    by = BASE_Y - BOX[1]

    def amp_at(Q, N):
        cut = (Q[:, 1] < 2) | (Q[:, 0] > W - 3)
        base = (N[:, 1] > 0.55) & (Q[:, 1] > by - 25)
        facing = N[:, 0] * LIGHT[0] + N[:, 1] * LIGHT[1]
        k = np.where(base, 0.25, 1.0 + 0.35 * np.clip(-facing, 0, 1))
        return np.where(cut, 0.0, k)
    octs = [(lam, amp) for (lam, amp) in SG.spectrum_for(Rm, 'cloud') if lam <= 0.5 * Rm]
    for c in cs:
        P = c[:, 0, :].astype(np.float64)
        if len(P) < 30:
            continue
        P = SG.displace(P, octs, (seed, 'recut'), amp_at=amp_at)
        cv2.fillPoly(out, [np.round(P * 4 * 16).astype(np.int32)], 255, lineType=cv2.LINE_8, shift=4)
    return cv2.resize(out.astype(np.float32) / 255.0, (W, H), interpolation=cv2.INTER_AREA)


def edges(rgba, crisp, seed, lost_sigma=8.0):
    """Found where the silhouette faces the light, lost elsewhere and along the base, broken between; alternating."""
    H, W = crisp.shape
    inside = crisp > 0.5
    nxo, nyo = L.outward_normal(inside, 3.0)
    facing = nxo * LIGHT[0] + nyo * LIGHT[1]
    t = L.contour_param(inside)
    along = SG.line_noise(4096, [(150, 1.0), (60, 0.45)], (seed, 'lf'), length=4096.0)
    alt = np.interp(t % 4096, np.arange(4096), along)
    lostw = np.clip(0.5 - 1.05 * facing + 0.42 * alt, 0, 1)            # 0 found .. 1 lost
    yy = np.arange(H)[:, None] + BOX[1]
    xx = np.arange(W)[None, :]
    lostw = np.maximum(lostw, np.clip(1 - (BASE_Y - yy) / 18.0, 0, 1))  # the base dissolves
    lostw = np.where((yy < 3) | (xx > W - 4), 0.0, lostw)              # the frame's cuts are not edges
    lostw = ndi.gaussian_filter(lostw, 2.5)
    # lost: v6's own soft alpha, spread a little wider
    soft = np.maximum(rgba[..., 3], L.smoothstep(0.05, 0.8, cv2.GaussianBlur(crisp, (0, 0), lost_sigma)))
    soft = np.minimum(soft, L.smoothstep(0.0, 0.6, cv2.GaussianBlur(crisp, (0, 0), lost_sigma * 1.3)))
    a = crisp * (1 - lostw) + soft * lostw
    # broken: short level dry-brush teeth (>= 2 px tall) in the found / lost transition, within 9 px of the outline
    rr = L.seeded(seed, 'teeth')
    streak = np.zeros((H, W), np.float32)
    for _ in range(int(W * H / 700)):
        x0, y0 = rr.uniform(0, W), rr.uniform(0, H)
        ln = rr.uniform(8, 24)
        cv2.line(streak, (int(x0), int(y0)), (int(x0 + ln), int(y0 + rr.normal(0, 0.5))), 1.0, 2)
    mid = np.clip(1 - np.abs(lostw - 0.5) * 2.4, 0, 1)
    band = np.abs(ndi.distance_transform_edt(inside) - ndi.distance_transform_edt(~inside)) < 9
    a = np.where(band, a * (1 - 0.55 * mid * (1 - streak)), a)
    # colour: where the new silhouette passes v6's edge, the nearest of v6's own cloud colours
    solid = rgba[..., 3] > 0.35
    idx = ndi.distance_transform_edt(~solid, return_distances=False, return_indices=True)
    rgb = np.where(solid[..., None], rgba[..., :3], rgba[..., :3][tuple(idx)])
    return np.dstack([rgb, np.clip(a, 0, 1)]), lostw


def plan_strokes(rgba, crisp, lostw, seed, dose=1.0):
    """The marks by intent, their colours sampled from v6's painting itself (the design is v6's)."""
    H, W = crisp.shape
    plan = L.StrokePlan((seed, 'cloud', 'plan'))
    rng = plan.rng
    inside = crisp > 0.5
    rgb = rgba[..., :3]
    Lm = L.Lstar(rgb)
    FX, FY = L.tangent_flow(ndi.gaussian_filter(Lm, 2.0), rho=6.0, prefer=WIND)
    d_in = ndi.distance_transform_edt(inside)
    ok = L.rgb2ok(rgb)
    Lg = ndi.gaussian_filter(Lm, 3)
    g = np.hypot(ndi.sobel(Lg, 1), ndi.sobel(Lg, 0))
    turn = np.clip(g / (np.percentile(g[inside], 90) + 1e-6), 0, 1)        # where the form turns (the value moves)
    lit = np.clip((Lm - 66.0) / 18.0, 0, 1)                                 # 0 shade .. 1 lit

    def seeds(spacing, where, prob=None):
        ys, xs = np.mgrid[spacing / 2:H:spacing, spacing / 2:W:spacing]
        xs = xs + rng.uniform(-0.45, 0.45, xs.shape) * spacing
        ys = ys + rng.uniform(-0.45, 0.45, ys.shape) * spacing
        out = []
        for x, y in zip(xs.ravel(), ys.ravel()):
            xi, yi = int(np.clip(x, 0, W - 1)), int(np.clip(y, 0, H - 1))
            if not where[yi, xi] or (prob is not None and rng.random() > prob[yi, xi]):
                continue
            out.append((x, y))
        rng.shuffle(out)
        return out

    def col_at(x, y, dL=0.0):
        xi, yi = int(np.clip(x, 0, W - 1)), int(np.clip(y, 0, H - 1))
        return L.ok2rgb(ok[yi, xi] + np.array([dL, rng.normal(0, 0.003), rng.normal(0, 0.003)]))

    # P2: broad flat-brush strokes along the billows, where the form turns and on the lit side (the shade stays calm)
    prob = np.clip(0.06 + 0.75 * turn * (0.35 + 0.65 * lit) + 0.25 * lit, 0, 1) * dose
    for (x, y) in seeds(13, inside & (d_in > 3), prob):
        pts = L.trace(x, y, FX, FY, rng.uniform(22, 50), keep=inside, leak=1.0)
        mx, my = pts[len(pts) // 2]
        up = rng.random() < 0.35 + 0.4 * lit[int(np.clip(my, 0, H - 1)), int(np.clip(mx, 0, W - 1))]
        dL = rng.uniform(0.004, 0.014) * (1 if up else -1)    # a step off the spot's own value: the form, painted
        plan.add('form', 'tanda/acrylic-04-paint', pts, col_at(mx, my, dL), rng.uniform(8, 16), rng.uniform(0.55, 0.85))
    # blend: knife strokes across the value steps on the shade side (the old disc's arc, the terminators): lost
    gx_, gy_ = ndi.sobel(ndi.gaussian_filter(Lm, 4), 1), ndi.sobel(ndi.gaussian_filter(Lm, 4), 0)
    for (x, y) in seeds(19, inside & (d_in > 8) & (turn > 0.5) & (lit < 0.6)):
        xi, yi = int(np.clip(x, 0, W - 1)), int(np.clip(y, 0, H - 1))
        gn = math.hypot(gx_[yi, xi], gy_[yi, xi])
        if gn < 1e-6:
            continue
        ux, uy = gx_[yi, xi] / gn, gy_[yi, xi] / gn
        Ls = rng.uniform(14, 26)
        p0, p1 = (x - ux * Ls / 2, y - uy * Ls / 2), (x + ux * Ls / 2, y + uy * Ls / 2)
        c = 0.5 * (col_at(*p0) + col_at(*p1))
        plan.add('blend', 'classic/blending_knife', [p0, (x + rng.normal(0, 0.8), y), p1], c, rng.uniform(8, 14), rng.uniform(0.4, 0.65))
    # P3: crisp accents along the found lit edge, a step over the rim (where the light meets the sky)
    nxo, nyo = L.outward_normal(inside, 2.0)
    facing = nxo * LIGHT[0] + nyo * LIGHT[1]
    edge_lit = inside & (d_in < 6) & (facing > 0.45) & (lostw < 0.3) & (lit > 0.5)
    for (x, y) in seeds(17, edge_lit):
        pts = L.trace(x, y, FX, FY, rng.uniform(10, 22), keep=inside, leak=0.5)
        plan.add('accent', 'deevad/brush', pts, col_at(*pts[len(pts) // 2], 0.022), rng.uniform(2.4, 3.6), rng.uniform(0.8, 1.0))
    # dry level strokes in the dissolving base (the vapour drags with the wind)
    by = BASE_Y - BOX[1]
    xs_in = np.nonzero(inside.any(0))[0]
    for i in range(int(8 * dose)):
        x = rng.uniform(xs_in.min() + 50, W * 0.97)
        y = by - rng.uniform(3, 16)
        if not inside[int(np.clip(y, 0, H - 1)), int(np.clip(x, 0, W - 1))]:
            continue
        Ls = rng.uniform(36, 80)
        pts = [(x + Ls * 0.4, y), (x, y + rng.normal(0, 0.6)), (x - Ls * 0.6, y + rng.uniform(0.3, 2.0))]
        plan.add('lost', 'tanda/acrylic-03-with-water', pts, col_at(x, y, -0.004), rng.uniform(5, 9), rng.uniform(0.45, 0.7))
    return plan


def make(out_dir, seed=('organic', 'cloud', 3), dose=1.0):
    os.makedirs(out_dir, exist_ok=True)
    v6 = L.load_rgba(V6)
    H, W = v6.shape[:2]
    dx, dy = warp_field((H, W), seed)
    # the flat base slides level only (no vertical wobble on a condensation base)
    yy = np.arange(H)[:, None] + BOX[1]
    fb = np.clip((yy - (BASE_Y - 40)) / 30.0, 0, 1).astype(np.float32)
    dy = dy * (1 - fb)
    warped = remap_rgba(v6, dx, dy)
    L.save_rgba(os.path.join(out_dir, 'cloud_warped.png'), warped)
    crisp = recut(warped[..., 3], seed)
    base, lostw = edges(warped, crisp, seed)
    L.save_rgba(os.path.join(out_dir, 'cloud_edges.png'), base)
    plan = plan_strokes(base, crisp, lostw, seed, dose)
    painted, sec = L.mypaint(base, plan.strokes, tag='cloud')
    # the frame's own cuts (its top and right edges): the cloud runs on past them, so its alpha there is v6's (warped)
    cutw = np.maximum(np.clip((6 - np.arange(H)[:, None]) / 6.0, 0, 1), np.clip((np.arange(W)[None, :] - (W - 7)) / 6.0, 0, 1))
    painted[..., 3] = painted[..., 3] * (1 - cutw) + np.maximum(painted[..., 3], warped[..., 3]) * cutw
    # the caption block's rows stay clear (y >= 299 for x 95-985): fade to nothing over 299-318
    fx = np.arange(W)[None, :] + BOX[0]
    fy = np.arange(H)[:, None] + BOX[1]
    painted[..., 3] *= np.where(fx <= 985, np.clip((318 - fy) / 19.0, 0, 1), 1.0)
    L.save_rgba(os.path.join(out_dir, 'cloud.png'), painted)
    stats = dict(box=list(BOX), strokes=plan.count(), mypaint_s=round(sec, 2),
                 warp_rms_px=round(float(np.sqrt((dx ** 2 + dy ** 2).mean())), 2))
    return painted, stats


if __name__ == '__main__':
    o = sys.argv[1] if len(sys.argv) > 1 else os.path.join(L.SCRATCH, 'pieces')
    _, st = make(o)
    print(st)
