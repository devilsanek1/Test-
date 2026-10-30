"""piece_tree.py: the organic near tree (docs/look/organic/organic_proof.md section 2.2). The owner on v6's tree: "it is
weird looking tree we have on the forefront like it doesn't fit the style there" (2026-10-30). Measured (shapes.md 2.3):
a poster tree in a painted frame, 67 % small shapes by area, 58 % crisp edges, 1 % lost. This designs a NEW crown at
v6's place and size, by the shapes lane's tree rules, and paints it in the cloud's language, a step crisper (near):
  1. DESIGN (shapes.md 3.1 "Trees"): a body wider than tall with a flattened underside, 4 big lobes on a size ladder
     over its upper three-quarters (uneven, the biggest toward the light), 2-3 clumps half sunk on each lobe's outer
     arc, small clumps on a third of those, 1-2 sky gaps where lobes meet; every outline displaced at the foliage
     octaves. By area the mass reads as a few medium shapes, not confetti.
  2. LIGHT: one crown lit as one form from the upper left (its dome from the distance inside), the clumps bumping the
     terminator, a dark flat underside; four values from v6's own leaf colours (L* 26 / 36 / 47 / 62) and a lit accent.
  3. EDGES: found and leafy where the crown faces the light (crisp dabs breaking the outline), lost (6-9 px) on the
     shade side and the underside: the near dose, crisper than the cloud's.
  4. MARKS (MyPaint): broad strokes inside each value mass, short flat-brush leaf dabs only where the light catches a
     clump's top (fewer, bigger than v6's ~1550 dabs), a few dark dabs into the shade side; the trunk and two limbs
     (shapes_gen.limb: bowed, tapered, a root flare) entering the crown, seen in the gaps."""
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

BOX = (-60, 1226, 440, 324)              # frame px: x, y, w, h (v6's tree box -60, 1250, 420, 300, a little roomier)
CROWN = dict(cx=125.0, cy=1390.0, W=330.0, H=210.0)   # v6's crown (scripts/look/paint/v2s1_v6.json)
FOOT = (128.0, 1530.0)                   # v6's trunk foot, at the planter's rim
LIGHT = np.array([-0.70, -0.62, 0.36])
# v6's tree colours (sampled from public/paint/v2s1_v6/tree.png): deep, shade, mid, lit, accent; bark
COL = {'deep': '#1d4248', 'shade': '#30554f', 'mid': '#4f6d52', 'lit': '#8b9a62', 'accent': '#c9bb70'}
NAMES = ['deep', 'shade', 'mid', 'lit', 'accent']
BARK = {'shade': '#3f3340', 'lit': '#7d6459'}


def crown_ellipses(seed):
    """The crown in three levels (frame px): (cx, cy, rx, ry, deg, level): a body, 4 lobes on a ladder around its upper
    rim (uneven, the biggest toward the light), 2-3 clumps half sunk on each lobe's outer arc, small clumps on a third."""
    r = L.seeded(seed, 'crown')
    cx, cy = CROWN['cx'], CROWN['cy']
    bx, by, Rw, Rh = cx + 2, cy - 4, 150.0, 72.0
    ells = [(bx, by, Rw, Rh, r.uniform(-4, 4), 0)]
    nl = 4
    sizes = SG.size_ladder(nl, (seed, 'lobes'), ratio=(0.64, 0.84))
    span = np.sort(r.uniform(0, 1, nl))
    span = 0.04 + 0.92 * (span - span.min()) / max(span.max() - span.min(), 1e-6)
    angs = np.radians(-196 + 212 * span)
    order = np.argsort(np.abs(angs - math.radians(-120)))     # the biggest toward the light (upper left)
    lobes = []
    for rank, i in enumerate(order):
        lr = 92.0 * sizes[rank] * r.uniform(0.92, 1.08)
        a = angs[i] + r.uniform(-0.08, 0.08)
        d = r.uniform(0.62, 0.8)
        lobes.append((bx + math.cos(a) * Rw * d, by + math.sin(a) * Rh * d, lr, lr * r.uniform(0.72, 0.88),
                      math.degrees(a) + 90 + r.uniform(-10, 10), 1))
    ells += lobes
    for (lx, ly, lr, lry, rot, _) in lobes:
        out_a = math.atan2(ly - by, lx - bx)
        for o in np.sort(r.uniform(-1.0, 1.0, int(r.integers(2, 4)))):
            a = out_a + o * r.uniform(0.6, 0.95)
            mr = lr * r.uniform(0.34, 0.5)
            sink = r.uniform(0.45, 0.72)
            mx, my = lx + math.cos(a) * (lr - mr * sink), ly + math.sin(a) * (lry - mr * sink)
            if my > by + Rh * 0.5:
                continue
            ells.append((mx, my, mr, mr * r.uniform(0.72, 0.9), r.uniform(-20, 20), 2))
            if r.uniform() < 0.33:
                sa = a + r.uniform(-0.6, 0.6)
                sr = mr * r.uniform(0.3, 0.42)
                sx, sy = mx + math.cos(sa) * (mr - sr * 0.9), my + math.sin(sa) * (mr - sr * 0.9)
                # a small clump sits ON its clump's outline, half sunk: never a knob standing off the crown
                ells.append((sx, sy, sr, sr * 0.85, 0.0, 3))
    return ells, (bx, by, Rw, Rh)


def design(seed, ss=2):
    X0, Y0, W, H = BOX
    w2, h2 = W * ss, H * ss
    ells, (bx, by, Rw, Rh) = crown_ellipses(seed)
    yy, xx = np.mgrid[0:h2, 0:w2].astype(np.float64) / ss
    X, Y = xx + X0, yy + Y0
    union = np.zeros((h2, w2), bool)
    own = np.full((h2, w2), -1, np.int32)
    lu = np.zeros((h2, w2)); lv = np.zeros((h2, w2))
    for k in sorted(range(len(ells)), key=lambda i: ells[i][5]):        # body, lobes, clumps, small clumps: front last
        (cx, cy, rx, ry, deg, lvl) = ells[k]
        a = math.radians(deg)
        c, s_ = math.cos(a), math.sin(a)
        u = (c * (X - cx) + s_ * (Y - cy)) / rx
        v = (-s_ * (X - cx) + c * (Y - cy)) / ry
        m = u * u + v * v < 1
        union |= m
        own[m] = k
        # the clump's own frame back in screen axes (for its light)
        lu[m] = (c * u - s_ * v)[m]
        lv[m] = (s_ * u + c * v)[m]
    r = L.seeded(seed, 'under')
    flat_y = by + Rh * 0.92
    lens = flat_y + 10.0 * np.clip(1 - ((X - bx) / (Rw * 1.1)) ** 2, 0, 1)
    union &= Y <= lens
    for k in range(2):
        bxk = bx + r.uniform(-0.6, 0.6) * Rw
        brk = Rw * r.uniform(0.06, 0.1)
        union &= ~(((X - bxk) / brk) ** 2 + ((Y - flat_y - brk * 0.3) / (brk * 0.7)) ** 2 <= 1)
    union = ndi.binary_fill_holes(union)
    lab_, n = ndi.label(union)
    if n > 1:
        sz = ndi.sum(union, lab_, range(1, n + 1))
        union = lab_ == (1 + int(np.argmax(sz)))
    m8 = union.astype(np.uint8)
    cs, _ = cv2.findContours(m8, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
    R = math.sqrt(union.sum() / ss ** 2 / math.pi)
    cov = np.zeros((h2, w2), np.uint8)
    for c in cs:
        P = c[:, 0, :].astype(np.float64) / ss
        P = SG.displace(P, [o for o in SG.spectrum_for(R, 'foliage') if o[0] <= 0.25 * R], (seed, 'edge'),
                        amp_at=lambda Q, N: np.where(N[:, 1] > 0.6, 0.4, np.where(Q[:, 0] < 2, 0.0, 1.0)))
        cv2.fillPoly(cov, [np.round(P * ss * 16).astype(np.int32)], 1, lineType=cv2.LINE_8, shift=4)
    union = cov > 0
    miss = union & (own < 0)
    if miss.any():
        idx = ndi.distance_transform_edt(own < 0, return_distances=False, return_indices=True)
        own = np.where(miss, own[tuple(idx)], own)
        lu = np.where(miss, lu[tuple(idx)], lu)
        lv = np.where(miss, lv[tuple(idx)], lv)
    # sky gaps where two lobes meet (1-2), near the edge
    din = ndi.distance_transform_edt(union) / ss
    lobes = [e for e in ells if e[5] == 1]
    made = 0
    for i in range(len(lobes)):
        for j in range(i + 1, len(lobes)):
            if made >= 2:
                break
            hx, hy = (lobes[i][0] + lobes[j][0]) / 2, (lobes[i][1] + lobes[j][1]) / 2 - 6
            px, py = int((hx - X0) * ss), int((hy - Y0) * ss)
            if not (0 <= px < w2 and 0 <= py < h2) or not (R * 0.07 < din[py, px] < R * 0.32):
                continue
            hr = R * r.uniform(0.05, 0.08)
            aa = np.linspace(0, 2 * math.pi, 96, endpoint=False)
            circ = np.stack([hx - X0 + hr * np.cos(aa), hy - Y0 + hr * r.uniform(0.6, 0.85) * np.sin(aa)], 1)
            hole = SG.displace(circ, [(hr * 1.6, hr * 0.14), (hr * 0.7, hr * 0.07)], (seed, 'hole', made))
            hm = np.zeros((h2, w2), np.uint8)
            cv2.fillPoly(hm, [np.round(hole * ss * 16).astype(np.int32)], 1, lineType=cv2.LINE_8, shift=4)
            union &= hm == 0
            made += 1
    # ---- light: the crown as one dome lit from the upper left, each clump a bump; quantile zones (balanced masses)
    l = LIGHT / np.linalg.norm(LIGHT)
    dist = ndi.distance_transform_edt(union) / ss
    md = ndi.gaussian_filter(np.sqrt(np.clip(dist / max(dist.max(), 1), 0, 1)), 14 * ss)
    mx, my = -ndi.sobel(md, 1), -ndi.sobel(md, 0)
    mn = np.sqrt(mx ** 2 + my ** 2 + 0.03 ** 2)
    s_mass = (mx / mn * l[0] + my / mn * l[1] + 0.03 / mn * l[2])
    zz = np.sqrt(np.clip(1 - lu ** 2 - lv ** 2, 0.03, 1)) * 1.2
    nn = np.sqrt(lu ** 2 + lv ** 2 + zz ** 2)
    s_clump = (lu * l[0] + lv * l[1] + zz * l[2]) / nn
    s = 0.5 * s_mass + 0.5 * s_clump
    s = s - 0.9 * np.clip(1 - (lens - Y) / 30.0, 0, 1)                    # the flat underside: dark
    s = s - 0.35 * np.clip((X - bx) / (Rw * 1.2), 0, 1)                   # the side away from the light
    s = s + 0.25 * np.clip((by - Y) / (Rh * 1.4), -1, 1)                  # the top catches the light
    s = s + 0.05 * L.fnl((h2, w2), L.seed_int(seed, 'term'), 0.02 / ss, octaves=2)
    s = ndi.gaussian_filter(s, 1.0 * ss)
    qs = np.quantile(s[union], [0.2, 0.5, 0.78])                           # deep 20 | shade 30 | mid 28 | lit 22 %
    zone = np.full((h2, w2), -1, np.int32)
    zone[union] = np.digitize(s[union], qs)
    for z in range(4):
        lb, nb = ndi.label(zone == z)
        if nb:
            sz = ndi.sum(np.ones_like(lb), lb, index=np.arange(1, nb + 1))
            zone[np.isin(lb, np.nonzero(sz < 90 * ss * ss)[0] + 1)] = -2
    hole = zone == -2
    if hole.any():
        idx = ndi.distance_transform_edt(zone < 0, return_distances=False, return_indices=True)
        zone = np.where(hole, zone[tuple(idx)], zone)
    cols = np.array([L.hx(COL[k]) for k in NAMES])
    rgb2 = np.zeros((h2, w2, 3))
    rgb2[zone >= 0] = cols[zone[zone >= 0]]
    a2 = union.astype(np.float64)
    pre1 = cv2.resize(rgb2 * a2[..., None], (W, H), interpolation=cv2.INTER_AREA)
    a1 = cv2.resize(a2, (W, H), interpolation=cv2.INTER_AREA)
    rgb1 = pre1 / np.maximum(a1[..., None], 1e-6)
    zone1 = cv2.resize(zone.astype(np.float32), (W, H), interpolation=cv2.INTER_NEAREST).astype(np.int32)
    s1 = cv2.resize(s.astype(np.float32), (W, H), interpolation=cv2.INTER_AREA)
    info = dict(n_ells=len(ells), levels={k: sum(1 for e in ells if e[5] == k) for k in (0, 1, 2, 3)}, R=R, s=s1)
    return np.dstack([rgb1, a1]), zone1, cols, info


def wood(seed):
    """The trunk and two limbs (shapes_gen.limb), piece px RGBA: lit on the left, the shade side right."""
    X0, Y0, W, H = BOX
    ss = 2
    m = np.zeros((H * ss, W * ss), np.uint8)
    limbs = [((FOOT[0], FOOT[1] + 4), (133.0, 1420.0), 16.0, 10.5),
             ((131.0, 1462.0), (84.0, 1412.0), 7.0, 3.0),
             ((134.0, 1452.0), (186.0, 1414.0), 6.0, 2.6)]
    for i, (p0, p1, w0, w1) in enumerate(limbs):
        P = SG.limb((seed, 'limb', i), (p0[0] - X0, p0[1] - Y0), (p1[0] - X0, p1[1] - Y0), w0, w1)
        cv2.fillPoly(m, [np.round(P * ss * 16).astype(np.int32)], 1, lineType=cv2.LINE_8, shift=4)
    a = cv2.resize(m.astype(np.float64), (W, H), interpolation=cv2.INTER_AREA)
    # lit left edge of the wood, shade right (a 2-tone bark)
    inside = a > 0.5
    nx, ny = L.outward_normal(inside, 1.5)
    lit = (nx * LIGHT[0] + ny * LIGHT[1]) > 0.2
    rgb = np.where(lit[..., None], L.hx(BARK['lit']), L.hx(BARK['shade']))
    return np.dstack([rgb, a])


def plan_strokes(zone, cols, info, inside, seed, dose=1.0):
    H, W = zone.shape
    plan = L.StrokePlan((seed, 'tree', 'plan'))
    rng = plan.rng
    ok = L.rgb2ok(cols)
    FX, FY = L.tangent_flow(info['s'] * 40.0, rho=3.0, prefer=(0.8, -0.6))
    d_in = ndi.distance_transform_edt(inside)

    def zc(x, y):
        return zone[int(np.clip(y, 0, H - 1)), int(np.clip(x, 0, W - 1))]

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
    # P1: broad strokes inside each value mass (colour moves inside it); the lit masses keep their edges
    for (x, y) in seeds(26, inside & (d_in > 5)):
        z = zc(x, y)
        if z < 0:
            continue
        pts = L.trace(x, y, FX, FY, rng.uniform(26, 60), keep=(zone == z) if z >= 2 else inside, leak=3)
        plan.add('wash', 'ramon/wet_round', pts, L.ok2rgb(ok[min(z, 3)] + np.array([rng.normal(0, 0.012), 0, rng.normal(0, 0.006)])),
                 rng.uniform(12, 22), rng.uniform(0.28, 0.42))
    # P2: leaf dabs where the light catches a clump's top: short flat strokes, a step over their zone (fewer, bigger)
    zb = L.boundaries(np.where(inside, zone, -1)) & inside
    zdist = ndi.distance_transform_edt(~zb)
    litz = (zone >= 2)
    prob = np.clip(0.15 + 0.85 * np.exp(-zdist / 6.0), 0, 1) * np.where(litz, 1.0, 0.25)
    for (x, y) in seeds(11, inside & (d_in > 1), prob * dose):
        z = zc(x, y)
        if z < 0:
            continue
        up = z >= 2 and rng.random() < 0.7
        c = ok[min(z + 1, 4)] if up else ok[z]
        c = 0.5 * c + 0.5 * ok[z] + np.array([rng.normal(0, 0.008), rng.normal(0, 0.003), rng.normal(0, 0.005)])
        ang = math.atan2(-0.62, 0.78) + rng.normal(0, 0.5)           # leaves' marks lean up toward the light
        Ls = rng.uniform(8, 15)
        pts = [(x - math.cos(ang) * Ls / 2, y - math.sin(ang) * Ls / 2), (x + math.cos(ang) * Ls / 2, y + math.sin(ang) * Ls / 2)]
        plan.add('dab', 'tanda/acrylic-04-paint', pts, L.ok2rgb(c), rng.uniform(6.0, 10.0), rng.uniform(0.75, 0.95), ds=1.0)
    # the leafy found edge: dabs across the lit silhouette, pointing out (the outline breaks into leaves)
    nxo, nyo = L.outward_normal(inside, 2.5)
    facing = nxo * LIGHT[0] + nyo * LIGHT[1]
    rim = inside & (d_in < 4) & (facing > 0.1)
    for (x, y) in seeds(7, rim):
        xi, yi = int(np.clip(x, 0, W - 1)), int(np.clip(y, 0, H - 1))
        z = max(zone[yi, xi], 1)
        ox, oy = nxo[yi, xi], nyo[yi, xi]
        Ls = rng.uniform(6, 12)
        pts = [(x - ox * Ls * 0.5, y - oy * Ls * 0.5), (x + ox * Ls * 0.5 + rng.normal(0, 1.5), y + oy * Ls * 0.5 + rng.normal(0, 1.5))]
        c = ok[min(z + (1 if facing[yi, xi] > 0.5 else 0), 4)]
        plan.add('edge', 'tanda/acrylic-04-paint', pts, L.ok2rgb(c + np.array([rng.normal(0, 0.008), 0, 0])), rng.uniform(4.0, 7.0),
                 rng.uniform(0.85, 1.0), ds=1.0)
    # the shade side's lost edge: dark leaf dabs across it, in the shade's own values (it breaks, it does not blur)
    away = inside & (d_in < 4) & (facing <= 0.1)
    for (x, y) in seeds(9, away):
        xi, yi = int(np.clip(x, 0, W - 1)), int(np.clip(y, 0, H - 1))
        ox, oy = nxo[yi, xi], nyo[yi, xi]
        Ls = rng.uniform(5, 11)
        pts = [(x - ox * Ls * 0.4, y - oy * Ls * 0.4), (x + ox * Ls * 0.6 + rng.normal(0, 2.0), y + oy * Ls * 0.6 + rng.normal(0, 2.0))]
        c = ok[max(min(zone[yi, xi], 1), 0)] + np.array([rng.normal(0, 0.01), 0, 0])
        plan.add('edge', 'tanda/acrylic-04-paint', pts, L.ok2rgb(c), rng.uniform(3.5, 6.0), rng.uniform(0.55, 0.85), ds=1.0)
    # a few dark dabs into the shade side (the shade mass is still leaves, quietly)
    sh = inside & (zone <= 1) & (d_in > 3)
    for (x, y) in seeds(18, sh):
        Ls = rng.uniform(6, 12)
        ang = rng.uniform(0, math.pi)
        pts = [(x - math.cos(ang) * Ls / 2, y - math.sin(ang) * Ls / 2), (x + math.cos(ang) * Ls / 2, y + math.sin(ang) * Ls / 2)]
        plan.add('dab', 'tanda/acrylic-04-paint', pts, L.ok2rgb(ok[max(zc(x, y), 0)] + np.array([rng.choice([-1, 1]) * 0.018, 0, 0])),
                 rng.uniform(5, 8), rng.uniform(0.6, 0.85), ds=1.0)
    return plan


def lost_edges(rgba, seed, lost_px=3.0):
    """Lost on the shade side and the underside (6-9 px), found and leafy on the lit side."""
    H, W = rgba.shape[:2]
    a = rgba[..., 3]
    inside = a > 0.5
    nxo, nyo = L.outward_normal(inside, 3.0)
    facing = nxo * LIGHT[0] + nyo * LIGHT[1]
    t = L.contour_param(inside)
    along = SG.line_noise(4096, [(110, 1.0), (45, 0.4)], (seed, 'lf'), length=4096.0)
    alt = np.interp(t % 4096, np.arange(4096), along)
    lostw = ndi.gaussian_filter(np.clip(0.25 - 1.0 * facing + 0.35 * alt, 0, 1), 2.0)
    soft = L.smoothstep(0.03, 0.85, cv2.GaussianBlur(a, (0, 0), lost_px * 0.5))
    a2 = a * (1 - lostw) + np.maximum(soft * 0.92, a * 0.0) * lostw
    idx = ndi.distance_transform_edt(~inside, return_distances=False, return_indices=True)
    rgb = np.where(inside[..., None], rgba[..., :3], rgba[..., :3][tuple(idx)])
    return np.dstack([rgb, np.clip(a2, 0, 1)])


def make(out_dir, seed=('organic', 'tree', 1), dose=1.0):
    os.makedirs(out_dir, exist_ok=True)
    flat, zone, cols, info = design(seed)
    L.save_rgba(os.path.join(out_dir, 'tree_design.png'), flat)
    wd = wood(seed)
    inside = flat[..., 3] > 0.5
    plan = plan_strokes(zone, cols, info, inside, seed, dose)
    painted, sec = L.mypaint(flat, plan.strokes, tag='tree')
    crown = lost_edges(painted, seed)
    # the wood under the crown (the limbs show in its gaps and under it)
    out = np.zeros_like(crown)
    a_w, a_c = wd[..., 3:4], crown[..., 3:4]
    a_o = a_c + a_w * (1 - a_c)
    out[..., :3] = (crown[..., :3] * a_c + wd[..., :3] * a_w * (1 - a_c)) / np.maximum(a_o, 1e-6)
    out[..., 3:4] = a_o
    L.save_rgba(os.path.join(out_dir, 'tree.png'), out)
    stats = dict(box=list(BOX), strokes=plan.count(), mypaint_s=round(sec, 2), shapes=info['levels'], R=round(info['R'], 1))
    return out, stats


if __name__ == '__main__':
    o = sys.argv[1] if len(sys.argv) > 1 else os.path.join(L.SCRATCH, 'pieces')
    _, st = make(o)
    print(st)
