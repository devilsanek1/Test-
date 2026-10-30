"""piece_cloud.py: the organic near cumulus (docs/look/organic/organic_proof.md section 2.1). v6's own design intent
(its 14 billows, the tower top right, the skirt tapering to the lower left, the flat base at y 300, the low sun's light
from the upper left) rebuilt by the shapes lane's rules and painted by intent:
  1. DESIGN (shapes.md 3.1): each billow an ellipse (aspect 0.62-0.92, tilt +-18 deg) instead of a circle, 2-4 smaller
     billows half sunk on the lit outer arcs (a size ladder, three levels), every outline displaced by value noise at
     the cloud octaves (shapes_gen.displace), the union cut by a tilted, wandering base. No compass arcs.
  2. LIGHT (techniques.md 3.8): flat zones read from a per-billow dome blended with the mass's dome, the terminator
     wandering by FastNoiseLite noise, the belly a quiet shade band; v6's own colours (its rim, lit, half, shade, deep).
  3. PAINT (libraries.md rank 1; PAINT_RECIPES' passes): MyPaint marks laid over the flat zones, so they pick the
     zones up: a few broad wet washes, flat-brush form strokes along the billows (calm in the shade), blending-knife
     strokes across the shade-side zone edges (lost), a few crisp accents on the lit edge.
  4. EDGES (techniques.md 3.6, shapes.md 3.3): found and crisp where the silhouette faces the light, lost (soft,
     12-22 px) away from it and along the base, dry-brush teeth along the wind between; found and lost alternate along
     the outline by a slow noise. The far plane's dose: the cloud is the frame's most painted piece (the owner's
     balance: far = more brush).
Run from video/: python3 scripts/look/organic/organic_proof.py (it calls make())."""
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

# the piece's box in frame px (v6's clouds_p3 box): x, y, w, h
BOX = (560, 0, 520, 345)
SS = 2                      # the design is drawn at 2x and box-reduced (clean anti-aliasing)
# v6's design (scripts/look/paint/recipes/sky_clouds.py NEAR): (cx, cy, r, z), frame px; z = drawing order
NEAR = [(1062, 66, 104, 1), (968, 14, 74, 0), (900, 92, 80, 2), (846, 46, 36, 1.5), (884, 4, 15, 0.5),
        (838, 164, 70, 3), (797, 124, 19, 2.5), (990, 178, 132, 4), (764, 222, 56, 5), (731, 190, 27, 4.5),
        (700, 256, 37, 6), (667, 279, 15, 7), (902, 256, 66, 2.8), (1040, 262, 78, 2.9)]
# v6's cloud colours, sampled from its painted plane (public/paint/v2s1_v6/clouds_p3.png): L* 90 / 87 / 81 / 66 / 62 / 49
COL = {'rim': '#ffe3bd', 'lit': '#fdd3b0', 'half': '#f1bdb7', 'shade_top': '#b3a8cb', 'shade': '#a194bd',
       'deep': '#86739f'}
SKY = '#cfc6de'             # the sky behind it (v6's sky piece, rows 0-345, L* ~81)
LIGHT = np.array([-0.70, -0.62, 0.36])  # toward the low sun: left, up, toward us (v6's key)
WIND = (-1.0, 0.0)          # the brush's default direction in the sky: level


def _ellipse_poly(cx, cy, rx, ry, ang, n=180):
    t = np.linspace(0, 2 * np.pi, n, endpoint=False)
    c, s = math.cos(ang), math.sin(ang)
    x, y = rx * np.cos(t), ry * np.sin(t)
    return np.stack([cx + c * x - s * y, cy + s * x + c * y], -1)


def billows(seed):
    """v6's billows as organic ellipses + level-2 and level-3 billows on the lit outer arcs. Frame px."""
    r = L.seeded(seed, 'billows')
    out = []
    radii = sorted({b[2] for b in NEAR}, reverse=True)
    for (cx, cy, rad, z) in NEAR:
        # a ladder: never two neighbouring sizes within 10 % (v6 had 74 / 80 and 66 / 70)
        k = r.uniform(0.9, 1.08)
        rr = rad * k
        asp = r.uniform(0.66, 0.92)
        ang = math.radians(r.uniform(-18, 18))
        out.append(dict(cx=cx + r.uniform(-5, 5), cy=cy + r.uniform(-4, 3), rx=rr, ry=rr * asp, ang=ang, z=z, lvl=1))
    # level 2: small billows half sunk on the upper-left arcs of the big ones (where the light and the sky are)
    base = list(out)
    for b in base:
        R = b['rx']
        if R < 28:
            continue
        n = int(r.integers(2, 5))
        angs = np.sort(r.uniform(math.radians(170), math.radians(300), n))   # screen angles: left .. up
        for a in angs:
            rr = R * r.uniform(0.24, 0.46)
            d = R * r.uniform(0.62, 0.86)
            px = b['cx'] + d * math.cos(a)
            py = b['cy'] + d * math.sin(a) * (b['ry'] / b['rx'])
            out.append(dict(cx=px, cy=py, rx=rr, ry=rr * r.uniform(0.62, 0.9), ang=math.radians(r.uniform(-25, 25)),
                            z=b['z'] + 0.05, lvl=2))
            if r.random() < 0.33:     # level 3 on a third of them
                rr3 = rr * r.uniform(0.32, 0.5)
                a3 = a + r.uniform(-0.6, 0.6)
                out.append(dict(cx=px + rr * 0.8 * math.cos(a3), cy=py + rr * 0.7 * math.sin(a3), rx=rr3,
                                ry=rr3 * r.uniform(0.65, 0.95), ang=0.0, z=b['z'] + 0.06, lvl=3))
    return out


def base_y(x, seed):
    """The flat base, tilted ~1.2 deg and wandering +-2 px (frame px)."""
    n = SG.line_noise(len(x), [(90, 1.6), (30, 0.6)], (seed, 'base'), length=float(x.max() - x.min() + 1))
    return 301.0 + 0.021 * (x - 760.0) + n


def design(seed=('organic', 'cloud', 1)):
    """The flat zones of the cumulus at the piece's size: (rgba 0..1, zone ids, zone colours, info)."""
    X0, Y0, W, H = BOX
    w2, h2 = W * SS, H * SS
    bl = billows(seed)
    # every billow's outline displaced (no compass arcs), rasterized at 2x in z order (back to front)
    zbuf = np.full((h2, w2), -1, np.int32)
    union = np.zeros((h2, w2), np.uint8)
    polys = []
    for i, b in enumerate(sorted(range(len(bl)), key=lambda j: bl[j]['z'])):
        e = bl[b]
        P = _ellipse_poly(e['cx'] - X0, e['cy'] - Y0, e['rx'], e['ry'], e['ang'], n=max(60, int(2 * math.pi * e['rx'] / 2)))
        R = math.sqrt(e['rx'] * e['ry'])
        octs = [(lam, amp) for (lam, amp) in SG.spectrum_for(R, 'cloud') if lam <= 0.5 * R + 1e-6] or [(max(6, R * 0.4), 1.0)]
        # the underside of a billow (facing down) takes a third of the displacement: flat and quiet
        P = SG.displace(P, octs, (seed, 'b', b), amp_at=lambda Q, N: 0.35 + 0.65 * np.clip(-N[:, 1] * 0.5 + 0.6, 0, 1))
        polys.append((b, P))
        m = np.zeros((h2, w2), np.uint8)
        cv2.fillPoly(m, [np.round(P * SS * 16).astype(np.int32)], 1, lineType=cv2.LINE_8, shift=4)
        zbuf[m > 0] = b
        union |= m
    # the base: everything under the wandering base line goes
    xs = np.arange(w2) / SS + X0
    by = base_y(xs, seed) - Y0
    yy = np.arange(h2)[:, None] / SS
    union[yy > by[None, :]] = 0
    zbuf[union == 0] = -1
    # the union's outline, displaced once more at the cloud's own (mass) scale: lobes and jags of the whole
    area = union.sum() / SS ** 2
    Rm = math.sqrt(area / math.pi)
    cs, _ = cv2.findContours(union, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
    mass = np.zeros_like(union)
    for c in cs:
        P = c[:, 0, :].astype(np.float64) / SS
        if len(P) < 40:
            continue
        # the base (normals pointing down) stays level and quiet; the frame's top and right edges are cuts, not edges
        def quiet(Q, N):
            cut = (Q[:, 1] < 2) | (Q[:, 0] > W - 2)
            return np.where(cut, 0.0, np.where(N[:, 1] > 0.6, 0.2, 1.0))
        octs = [(lam, amp * 0.7) for (lam, amp) in SG.spectrum_for(Rm, 'cloud') if 6 <= lam <= 0.25 * Rm]
        P = SG.displace(P, octs, (seed, 'mass'), amp_at=quiet)
        cv2.fillPoly(mass, [np.round(P * SS * 16).astype(np.int32)], 1, lineType=cv2.LINE_8, shift=4)
    union = mass & (yy <= by[None, :] + 0.5).astype(np.uint8)
    # owners outside every billow but inside the displaced union: the nearest billow
    own = zbuf.copy()
    miss = (union > 0) & (own < 0)
    if miss.any():
        idx = ndi.distance_transform_edt(own < 0, return_distances=False, return_indices=True)
        own = np.where(miss, own[tuple(idx)], own)
    own[union == 0] = -1

    # ---- light: a per-billow dome blended with the mass dome, the terminator wandering
    yyy, xxx = np.mgrid[0:h2, 0:w2].astype(np.float64) / SS
    nx = np.zeros((h2, w2)); ny = np.zeros((h2, w2)); nz = np.ones((h2, w2))
    for b, e in enumerate(bl):
        m = own == b
        if not m.any():
            continue
        c, s = math.cos(-e['ang']), math.sin(-e['ang'])
        dx, dy = xxx[m] - (e['cx'] - X0), yyy[m] - (e['cy'] - Y0)
        u, v = (c * dx - s * dy) / e['rx'], (s * dx + c * dy) / e['ry']
        rr = np.clip(u * u + v * v, 0, 0.98)
        zz = np.sqrt(1 - rr)
        # back to screen axes
        c2, s2 = math.cos(e['ang']), math.sin(e['ang'])
        nx[m], ny[m], nz[m] = c2 * u - s2 * v, s2 * u + c2 * v, zz
    # the mass: a dome from the distance inside the union (its own normals)
    dist = ndi.distance_transform_edt(union) / SS
    hgt = np.sqrt(np.clip(dist / max(dist.max(), 1), 0, 1))
    hs = ndi.gaussian_filter(hgt, 10 * SS)
    mx, my = -ndi.sobel(hs, 1), -ndi.sobel(hs, 0)
    mn = np.sqrt(mx ** 2 + my ** 2 + (0.06) ** 2)
    mx, my, mz = mx / mn, my / mn, 0.06 / mn
    wb = 0.58     # the billow's share of the normal (the form reads per billow, lit as one mass)
    Nx, Ny, Nz = wb * nx + (1 - wb) * mx, wb * ny + (1 - wb) * my, wb * nz + (1 - wb) * mz
    Nn = np.sqrt(Nx ** 2 + Ny ** 2 + Nz ** 2) + 1e-9
    l = LIGHT / np.linalg.norm(LIGHT)
    s = (Nx * l[0] + Ny * l[1] + Nz * l[2]) / Nn
    # the right side of the cloud turns from the sun (the low sun is far left): the mass falls off toward the right
    s = s - 0.22 * np.clip((xxx - W * 0.45) / (W * 0.55), 0, 1)
    # a wandering terminator (FastNoiseLite fBm), never a ruler line or a crescent
    s = s + 0.09 * L.fnl((h2, w2), L.seed_int(seed, 'term'), 0.012 / SS, octaves=3)
    # the belly: a quiet shade band over the base
    belly = np.clip(1 - (by[None, :] - yyy) / 26.0, 0, 1)
    s = s - 0.45 * belly ** 1.5
    zone = np.full((h2, w2), -1, np.int32)
    cuts = [-0.06, 0.14, 0.33, 0.56]          # deep | shade | shade_top | half | lit
    names = ['deep', 'shade', 'shade_top', 'half', 'lit', 'rim']
    zone[union > 0] = np.digitize(s[union > 0], cuts)
    # the rim: a thin lightest band where the lit silhouette meets the sky, 2-4 px, uneven
    edge_d = ndi.distance_transform_edt(union) / SS
    nxo, nyo = L.outward_normal(union > 0, 2.0 * SS)
    facing = nxo * l[0] + nyo * l[1]
    rimw = 2.4 + 1.6 * L.fnl((h2, w2), L.seed_int(seed, 'rim'), 0.02 / SS)
    rim = (union > 0) & (edge_d < rimw) & (facing > 0.45) & (zone >= 3)
    zone[rim] = 5
    cols = np.array([L.hx(COL[n]) for n in names])
    # box-reduce the 2x design: colour by area, alpha by coverage
    rgb2 = np.zeros((h2, w2, 3))
    m = zone >= 0
    rgb2[m] = cols[zone[m]]
    a2 = (union > 0).astype(np.float64)
    pre = rgb2 * a2[..., None]
    pre1 = cv2.resize(pre, (W, H), interpolation=cv2.INTER_AREA)
    a1 = cv2.resize(a2, (W, H), interpolation=cv2.INTER_AREA)
    rgb1 = pre1 / np.maximum(a1[..., None], 1e-6)
    zone1 = cv2.resize(zone.astype(np.float32), (W, H), interpolation=cv2.INTER_NEAREST).astype(np.int32)
    s1 = cv2.resize(s.astype(np.float32), (W, H), interpolation=cv2.INTER_AREA)
    by1 = base_y(np.arange(W) + X0, seed) - Y0
    info = dict(billows=bl, R=Rm, names=names, base_y=by1, s=s1, n_billows=len(bl),
                levels={k: sum(1 for b in bl if b['lvl'] == k) for k in (1, 2, 3)})
    rgba = np.dstack([rgb1, a1])
    return rgba, zone1, cols, info


def plan_strokes(rgba, zone, cols, info, seed, dose=1.0):
    """The marks by intent, read from the design (never from a reference)."""
    W, H = BOX[2], BOX[3]
    a = rgba[..., 3]
    inside = a > 0.5
    plan = L.StrokePlan((seed, 'cloud', 'plan'))
    rng = plan.rng
    s = info['s']
    # the flow: along the billows (the light field's isolines), level where the form is weak
    FX, FY = L.tangent_flow(s * 40.0, rho=4.0, prefer=WIND, coh_floor=0.0)
    d_in = ndi.distance_transform_edt(inside)
    ok = L.rgb2ok(cols)
    nz = len(cols)

    def zc(x, y):
        return zone[int(np.clip(y, 0, H - 1)), int(np.clip(x, 0, W - 1))]

    def seeds(spacing, where, prob=None):
        ys, xs = np.mgrid[spacing / 2:H:spacing, spacing / 2:W:spacing]
        xs = xs + rng.uniform(-0.45, 0.45, xs.shape) * spacing
        ys = ys + rng.uniform(-0.45, 0.45, ys.shape) * spacing
        out = []
        for x, y in zip(xs.ravel(), ys.ravel()):
            xi, yi = int(np.clip(x, 0, W - 1)), int(np.clip(y, 0, H - 1))
            if not where[yi, xi]:
                continue
            if prob is not None and rng.random() > prob[yi, xi]:
                continue
            out.append((x, y))
        rng.shuffle(out)
        return out

    # P1 wash: a few broad, soft, wet strokes along the form, each in its zone's colour: colour moves inside a zone
    for (x, y) in seeds(46, inside & (d_in > 6)):
        z = zc(x, y)
        if z < 0:
            continue
        pts = L.trace(x, y, FX, FY, rng.uniform(60, 130), keep=(zone == z), leak=10)
        col = L.ok2rgb(ok[z] + np.array([rng.normal(0, 0.012), rng.normal(0, 0.004), rng.normal(0, 0.004)]))
        plan.add('wash', 'ramon/wet_round', pts, col, rng.uniform(16, 30), rng.uniform(0.22, 0.38) * dose)
    # P2 form: flat-brush strokes along the billows; most at the terminator and the lit side, few in the deep shade
    zb = L.boundaries(np.where(inside, zone, -1)) & inside
    zdist = ndi.distance_transform_edt(~zb)
    calm = np.array([0.25, 0.45, 0.75, 1.0, 1.0, 0.6])[np.clip(zone, 0, nz - 1)]
    prob = np.clip(0.18 + 0.85 * np.exp(-zdist / 9.0), 0, 1) * calm
    for (x, y) in seeds(9, inside & (d_in > 2), prob):
        z = zc(x, y)
        if z < 0:
            continue
        col = ok[z].copy()
        xi, yi = int(np.clip(x, 0, W - 1)), int(np.clip(y, 0, H - 1))
        near_nb = zdist[yi, xi] < 7
        if near_nb and rng.random() < 0.45:
            # carry the neighbour across the zone edge (the edge melts where it turns from the light)
            r_ = 8
            win = zone[max(0, yi - r_):yi + r_ + 1, max(0, xi - r_):xi + r_ + 1]
            others = win[(win >= 0) & (win != z)]
            if len(others):
                nb = int(np.bincount(others).argmax())
                col = col * 0.55 + ok[nb] * 0.45
        else:
            col = col + np.array([rng.choice([-1, 1]) * rng.uniform(0.008, 0.022), 0, 0])
        pts = L.trace(x, y, FX, FY, rng.uniform(16, 38), keep=inside, leak=2)
        plan.add('form', 'tanda/acrylic-04-paint', pts, L.ok2rgb(col + np.array([0, rng.normal(0, 0.004), rng.normal(0, 0.004)])),
                 rng.uniform(5, 11), rng.uniform(0.7, 0.95) * min(1.0, dose))
    # blend: blending-knife strokes ACROSS the zone edges on the shade side (those edges go lost)
    gxz = ndi.sobel(ndi.gaussian_filter(zone.astype(float), 2), 1)
    gyz = ndi.sobel(ndi.gaussian_filter(zone.astype(float), 2), 0)
    lx, ly = LIGHT[0], LIGHT[1]
    for (x, y) in seeds(12, zb & (d_in > 5)):
        xi, yi = int(np.clip(x, 0, W - 1)), int(np.clip(y, 0, H - 1))
        g = math.hypot(gxz[yi, xi], gyz[yi, xi])
        if g < 1e-6:
            continue
        ux, uy = gxz[yi, xi] / g, gyz[yi, xi] / g
        if zone[yi, xi] >= 3 and rng.random() < 0.75:     # the lit zones keep their edges found
            continue
        Ls = rng.uniform(10, 22)
        pts = [(x - ux * Ls / 2 + rng.normal(0, 0.8), y - uy * Ls / 2), (x, y), (x + ux * Ls / 2, y + uy * Ls / 2)]
        z0 = zc(*pts[0]); z1 = zc(*pts[-1])
        if z0 < 0 or z1 < 0:
            continue
        plan.add('blend', 'classic/blending_knife', pts, L.ok2rgb(0.5 * ok[z0] + 0.5 * ok[z1]), rng.uniform(6, 12), rng.uniform(0.5, 0.8))
    # P3 accents: a few crisp strokes along the lit silhouette, a step lighter than the lit zone (the found edge)
    nxo, nyo = L.outward_normal(inside, 2.0)
    facing = nxo * lx + nyo * ly
    lit_edge = inside & (d_in < 7) & (facing > 0.5) & (zone >= 3)
    top = ok[5] + np.array([0.012, 0, 0])
    for (x, y) in seeds(17, lit_edge):
        pts = L.trace(x, y, FX, FY, rng.uniform(10, 24), keep=inside, leak=0.5)
        plan.add('accent', 'deevad/brush', pts, L.ok2rgb(top + np.array([rng.normal(0, 0.008), 0, 0])), rng.uniform(2.4, 4.0), rng.uniform(0.8, 1.0))
    # dry, level strokes along the base and the shade side's lower edge: the vapour drags with the wind
    base_y = info['base_y']
    for i in range(int(16 * dose)):
        x = rng.uniform(W * 0.2, W * 0.98)
        y = base_y[int(np.clip(x, 0, W - 1))] - rng.uniform(2, 14)
        if not inside[int(np.clip(y, 0, H - 1)), int(np.clip(x, 0, W - 1))]:
            continue
        z = zc(x, y)
        Ls = rng.uniform(30, 70)
        pts = [(x + Ls * 0.5, y + rng.normal(0, 0.6)), (x, y), (x - Ls * 0.5, y + rng.normal(0, 1.0))]
        plan.add('lost', 'tanda/acrylic-03-with-water', pts, L.ok2rgb(ok[max(z, 0)]), rng.uniform(5, 9), rng.uniform(0.5, 0.8))
    return plan


def edges_by_light(rgba, info, seed, lost_px=(12.0, 22.0), found_share=0.45):
    """The silhouette's lost and found edges (shapes.md 3.3): crisp where it faces the light, lost (a long soft alpha)
    away from it and along the base, broken by level dry-brush teeth between; alternating along the outline."""
    H, W = rgba.shape[:2]
    a = rgba[..., 3]
    inside = a > 0.5
    nxo, nyo = L.outward_normal(inside, 3.0)
    facing = nxo * LIGHT[0] + nyo * LIGHT[1]
    t = L.contour_param(inside)
    along = SG.line_noise(4096, [(140, 1.0), (60, 0.5)], (seed, 'lf'), length=4096.0)
    alt = np.interp(t % 4096, np.arange(4096), along)
    lostw = np.clip(0.55 - 0.9 * facing + 0.45 * alt, 0, 1)                # 0 found .. 1 lost
    # the base is lost, the frame's cut edges (top, right) are not edges at all
    by = info['base_y'][None, :]
    yy = np.arange(H)[:, None]
    lostw = np.maximum(lostw, np.clip(1 - (by - yy) / 18.0, 0, 1))
    lostw = ndi.gaussian_filter(lostw, 3)
    # lost: the alpha spread by a wide blur (12-22 px), level-biased (the wind)
    sig = lost_px[0] + (lost_px[1] - lost_px[0]) * 0.5
    soft = cv2.GaussianBlur(a, (0, 0), sigmaX=sig * 0.55, sigmaY=sig * 0.32)
    soft = np.clip(soft * 1.15 - 0.05, 0, 1)
    # broken: dry-brush teeth along the wind in the transition (crisp flecks >= 2 px)
    rr = L.seeded(seed, 'teeth')
    tex = rr.random((H // 2 + 2, W // 14 + 2))
    tex = cv2.resize(tex, (W, H), interpolation=cv2.INTER_LINEAR)[:H, :W]
    tex = ndi.gaussian_filter(tex, (0.6, 3.0))
    broken = np.clip((tex - 0.35) * 3.0, 0, 1)
    a_found = a
    a_lost = np.where(inside, np.maximum(a * (1 - 0.35 * lostw), soft), soft)
    mid = np.clip(1 - np.abs(lostw - 0.5) * 2.2, 0, 1)                   # the transition: broken
    a_new = a_found * (1 - lostw) + a_lost * lostw
    a_new = np.where(mid > 0, a_new * (1 - 0.55 * mid * (1 - broken)), a_new)
    # colour outside the old silhouette: the nearest inside colour (the lost fringe keeps the cloud's own value)
    idx = ndi.distance_transform_edt(~inside, return_distances=False, return_indices=True)
    rgb = np.where(inside[..., None], rgba[..., :3], rgba[..., :3][tuple(idx)])
    # stay clear of the caption block's rows (y >= 299, x 95-985): fade to nothing over 299-318
    fx = np.arange(W)[None, :] + BOX[0]
    fy = np.arange(H)[:, None] + BOX[1]
    guard = np.where(fx <= 985, np.clip((318 - fy) / 19.0, 0, 1), 1.0)
    return np.dstack([rgb, np.clip(a_new, 0, 1) * guard])


def make(out_dir, seed=('organic', 'cloud', 1), dose=1.0):
    os.makedirs(out_dir, exist_ok=True)
    rgba, zone, cols, info = design(seed)
    L.save_rgba(os.path.join(out_dir, 'cloud_design.png'), rgba)
    plan = plan_strokes(rgba, zone, cols, info, seed, dose)
    painted, sec = L.mypaint(rgba, plan.strokes, tag='cloud')
    L.save_rgba(os.path.join(out_dir, 'cloud_painted_raw.png'), painted)
    out = edges_by_light(painted, info, seed)
    L.save_rgba(os.path.join(out_dir, 'cloud.png'), out)
    stats = dict(box=list(BOX), strokes=plan.count(), mypaint_s=round(sec, 2), billows=info['levels'], R=round(info['R'], 1))
    return out, stats


if __name__ == '__main__':
    o = sys.argv[1] if len(sys.argv) > 1 else os.path.join(L.SCRATCH, 'pieces')
    _, st = make(o)
    print(st)
