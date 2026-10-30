"""ONE stroke plan per subject, read from our designed flat (never from a reference), so every library paints the SAME
marks: zones (flat colours) + their outlines, a tangent flow (structure tensor of the design), then strokes by pass:
wash (P1, broad, soft), form (P2, along the form), accent (P3, crisp, at the light edges), blend (across a zone edge
that turns away from the light: a LOST edge), edge (along the silhouette: found on the lit side, lost on the shade
side), dab (the tree's leaf marks, one step lighter than their zone) and leafy (dabs across the tree's silhouette).
Seeded: the same inputs give the same JSON. Run: venv/bin/python -B src/plan.py"""
import json, math, sys
import numpy as np, cv2
from scipy import ndimage as ndi
from PIL import Image

INP, OUT = '/tmp/organic/libraries/inputs', '/tmp/organic/libraries/plans'


def srgb2lin(c): return np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)
def lin2srgb(c): return np.where(c <= 0.0031308, 12.92 * c, 1.055 * np.clip(c, 0, None) ** (1 / 2.4) - 0.055)
M1 = np.array([[0.4122214708, 0.5363325363, 0.0514459929], [0.2119034982, 0.6806995451, 0.1073969566],
               [0.0883024619, 0.2817188376, 0.6299787005]])
M2 = np.array([[0.2104542553, 0.7936177850, -0.0040720468], [1.9779984951, -2.4285922050, 0.4505937099],
               [0.0259040371, 0.7827717662, -0.8086757660]])
def rgb2ok(rgb):
    lms = np.cbrt(srgb2lin(np.asarray(rgb, np.float64)) @ M1.T); return lms @ M2.T
def ok2rgb(lab):
    lms = np.asarray(lab, np.float64) @ np.linalg.inv(M2).T; return np.clip(lin2srgb((lms ** 3) @ np.linalg.inv(M1).T), 0, 1)
def hx(h): return [int(h[i:i + 2], 16) / 255 for i in (1, 3, 5)]
def hexof(rgb): r, g, b = (int(round(float(v) * 255)) for v in np.clip(rgb, 0, 1)); return f'#{r:02x}{g:02x}{b:02x}'


def zones(rgb, a, k):
    """k flat value zones by k-means in OKLab (seeded), ids sorted dark -> light; AA seams cleaned by a majority."""
    from sklearn.cluster import KMeans
    inside = a > 0.5
    ok = rgb2ok(rgb)
    X = ok[inside] * np.array([2.0, 1.0, 1.0])            # value first: the zones are values
    km = KMeans(n_clusters=k, n_init=4, random_state=0).fit(X[::3])
    lab = np.full(a.shape, -1); lab[inside] = km.predict(X)
    cols = np.array([np.median(rgb[lab == j], axis=0) for j in range(k)])
    out = lab.copy()
    for j in range(k):
        m = ndi.binary_opening(lab == j, iterations=1)
        out[(lab == j) & ~m] = -2
    holes = out == -2
    if holes.any():
        idx = ndi.distance_transform_edt(holes, return_distances=False, return_indices=True)
        out = out[tuple(idx)]
        out[~inside] = -1
    order = np.argsort(rgb2ok(cols)[:, 0])
    remap = np.zeros(k, int); remap[order] = np.arange(k)
    out = np.where(out >= 0, remap[np.clip(out, 0, None)], -1)
    return out, cols[order]


def tangent_flow(Lmap, rho, prefer):
    g = ndi.gaussian_filter(Lmap, 1.5)
    gx, gy = ndi.sobel(g, 1), ndi.sobel(g, 0)
    Jxx, Jxy, Jyy = (ndi.gaussian_filter(v, rho) for v in (gx * gx, gx * gy, gy * gy))
    theta = 0.5 * np.arctan2(2 * Jxy, Jxx - Jyy)          # the gradient's axis
    tx, ty = -np.sin(theta), np.cos(theta)                # the tangent (along the form)
    tr = np.sqrt((Jxx - Jyy) ** 2 + 4 * Jxy ** 2)
    coh = tr / (Jxx + Jyy + 1e-9)
    s = np.sign(tx * prefer[0] + ty * prefer[1]); s[s == 0] = 1
    tx, ty = tx * s, ty * s
    w = np.clip(coh, 0, 1) ** 0.7
    fx, fy = w * tx + (1 - w) * prefer[0], w * ty + (1 - w) * prefer[1]
    n = np.hypot(fx, fy) + 1e-9
    return fx / n, fy / n


def bilin(F, x, y):
    h, w = F.shape
    x = min(max(x, 0), w - 1.001); y = min(max(y, 0), h - 1.001)
    x0, y0 = int(x), int(y); fx, fy = x - x0, y - y0
    return (F[y0, x0] * (1 - fx) * (1 - fy) + F[y0, x0 + 1] * fx * (1 - fy) + F[y0 + 1, x0] * (1 - fx) * fy
            + F[y0 + 1, x0 + 1] * fx * fy)


def trace(x, y, FX, FY, lab, zone, L, step=1.5, leak=4, keep=None):
    h, w = lab.shape
    def run(sgn):
        pts, px, py, dx0, dy0, out = [], x, y, None, None, 0
        for _ in range(int(L / 2 / step)):
            dx, dy = bilin(FX, px, py), bilin(FY, px, py)
            if dx0 is not None and dx * dx0 + dy * dy0 < 0: dx, dy = -dx, -dy
            if dx0 is None: dx, dy = dx * sgn, dy * sgn
            nx, ny = px + dx * step, py + dy * step
            if not (0 <= nx < w and 0 <= ny < h): break
            if keep is not None and not keep[int(ny), int(nx)]: break
            z = lab[int(ny), int(nx)]
            if (zone is None and z < 0) or (zone is not None and z != zone):
                out += 1
                if out * step > leak: break
            else:
                out = 0
            pts.append((nx, ny)); px, py, dx0, dy0 = nx, ny, dx, dy
        return pts
    back = run(-1)[::-1]
    return back + [(x, y)] + run(1)


def resample(pts, ds):
    p = np.asarray(pts, np.float64)
    if len(p) < 2: return p
    seg = np.hypot(*np.diff(p, axis=0).T); s = np.concatenate([[0], np.cumsum(seg)])
    if s[-1] < ds: return p[[0, -1]]
    t = np.arange(0, s[-1] + 1e-6, ds)
    return np.stack([np.interp(t, s, p[:, 0]), np.interp(t, s, p[:, 1])], -1)


def pressure(n, kind, rng):
    t = np.linspace(0, 1, n)
    att = {'wash': 0.15, 'form': 0.12, 'accent': 0.2, 'blend': 0.3, 'edge': 0.15, 'dab': 0.35, 'leafy': 0.3}[kind]
    tail = rng.uniform(0.45, 0.7)
    p = np.clip(t / att, 0, 1) ** 0.6 * (1 - 0.75 * np.clip((t - tail) / (1 - tail), 0, 1) ** 1.4)
    return np.clip(p * rng.uniform(0.85, 1.0), 0.05, 1)


def jitter(rgb, rng, dL=0.02, dab=0.006):
    ok = rgb2ok(rgb)
    ok = ok + np.array([rng.normal(0, dL), rng.normal(0, dab), rng.normal(0, dab)])
    return ok2rgb(ok)


def poly_of(mask, eps=1.0):
    cs, _ = cv2.findContours(mask.astype(np.uint8), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
    out = []
    for c in cs:
        if cv2.contourArea(c) < 12: continue
        c = cv2.approxPolyDP(c, eps, True)[:, 0, :]
        if len(c) >= 3: out.append(c.astype(float).round(1).tolist())
    return out


def plan(name, light, prefer, cfg, seed, design=None, tag=''):
    design = design or f'{INP}/{name}_design.png'
    rgba = np.asarray(Image.open(design).convert('RGBA')).astype(np.float64) / 255
    rgb, a = rgba[..., :3], rgba[..., 3]
    h, w = a.shape
    rng = np.random.default_rng(seed)
    a_z = a
    if cfg.get('wood'):
        wd = np.asarray(Image.open(cfg['wood']).convert('RGBA')).astype(np.float64) / 255
        same0 = (wd[..., 3] > 0.5) & (np.abs(wd[..., :3] - rgb).max(-1) < 4 / 255)
        a_z = np.where(same0, 0.0, a)                              # the foliage alone
    lab, cols = zones(rgb, a_z, cfg['k'])
    okc = rgb2ok(cols)
    Lmap = np.where(a > 0.5, rgb2ok(rgb)[..., 0], cfg['outside_L'])
    FX, FY = tangent_flow(Lmap, cfg['rho'], prefer)
    inside = a > 0.5
    smask = inside
    if cfg.get('wood'):
        wd = np.asarray(Image.open(cfg['wood']).convert('RGBA')).astype(np.float64) / 255
        same = (wd[..., 3] > 0.5) & (np.abs(wd[..., :3] - rgb).max(-1) < 4 / 255)
        smask = inside & ~ndi.binary_dilation(same & ~ndi.binary_dilation(~same, iterations=2), iterations=1)
    d_in = ndi.distance_transform_edt(inside)
    # the silhouette's outward normal and how much it faces the light
    sm = ndi.gaussian_filter(inside.astype(float), 3)
    nx, ny = -ndi.sobel(sm, 1), -ndi.sobel(sm, 0)
    nn = np.hypot(nx, ny) + 1e-9; nx, ny = nx / nn, ny / nn
    lx, ly = light; facing = nx * lx + ny * ly                       # +1: the edge faces the light (found)
    # zone boundaries inside the mass, and which side faces the light
    zb = np.zeros_like(inside)
    for k in range(len(cols)):
        m = lab == k
        zb |= m & ndi.binary_dilation(inside & ~m & (lab >= 0), iterations=1)
    strokes = []

    def add(kind, pts, col, width, op, extra=None):
        p = resample(pts, max(1.0, width * 0.25))
        if len(p) < 2: return
        pr = pressure(len(p), kind, rng)
        s = {'kind': kind, 'pts': np.round(np.column_stack([p, pr]), 2).tolist(), 'color': hexof(col),
             'width': round(float(width), 2), 'opacity': round(float(op), 3)}
        if extra: s.update(extra)
        strokes.append(s)

    def seeds(spacing, where, prob=None):
        ys, xs = np.mgrid[spacing / 2:h:spacing, spacing / 2:w:spacing]
        xs = xs + rng.uniform(-0.45, 0.45, xs.shape) * spacing; ys = ys + rng.uniform(-0.45, 0.45, ys.shape) * spacing
        out = []
        for x, y in zip(xs.ravel(), ys.ravel()):
            xi, yi = int(np.clip(x, 0, w - 1)), int(np.clip(y, 0, h - 1))
            if not where[yi, xi]: continue
            if prob is not None and rng.random() > prob[yi, xi]: continue
            out.append((x, y))
        rng.shuffle(out)
        return out

    near_edge = np.exp(-d_in / cfg['edge_falloff'])
    zdist = ndi.distance_transform_edt(~zb)
    near_zone = np.exp(-zdist / cfg['zone_falloff'])
    # P1 wash: broad soft strokes inside each zone
    for (x, y) in seeds(cfg['wash_spacing'], smask & (d_in > 3)):
        z = lab[int(np.clip(y, 0, h - 1)), int(np.clip(x, 0, w - 1))]
        if z < 0: continue
        L = rng.uniform(*cfg['wash_len'])
        pts = trace(x, y, FX, FY, lab, z, L, leak=cfg['wash_w'][1] * 0.5, keep=smask if cfg.get('wood') else None)
        add('wash', pts, jitter(cols[z], rng, 0.012, 0.004), rng.uniform(*cfg['wash_w']), rng.uniform(*cfg['wash_op']))
    # P2 form: along the form, more near the silhouette and the zone edges
    prob = np.clip(cfg['form_base'] + 0.8 * np.maximum(near_edge, near_zone), 0, 1)
    if cfg.get('calm_dark'):          # calm stays calm: the shade masses take few marks, the lit side most
        zw = np.linspace(cfg['calm_dark'], 1.0, len(cols))
        prob = prob * np.where(lab >= 0, zw[np.clip(lab, 0, len(cols) - 1)], 0)
    zl_idx = ndi.distance_transform_edt(lab < 0, return_distances=False, return_indices=True)
    for (x, y) in seeds(cfg['form_spacing'], smask & (d_in > 1.5), prob):
        xi, yi = int(np.clip(x, 0, w - 1)), int(np.clip(y, 0, h - 1))
        z = lab[yi, xi]
        if z < 0: continue
        col = rgb2ok(cols[z])
        nb = None
        if zdist[yi, xi] < cfg['zone_falloff'] * 1.6:          # find the zone across the nearest zone edge
            r = int(cfg['zone_falloff'] * 2)
            win = lab[max(0, yi - r):yi + r + 1, max(0, xi - r):xi + r + 1]
            others = win[(win >= 0) & (win != z)]
            if len(others): nb = int(np.bincount(others).argmax())
        if nb is not None and rng.random() < cfg['form_mix']:
            col = col * (1 - cfg['cross']) + rgb2ok(cols[nb]) * cfg['cross']
        else:
            fx_, fy_ = bilin(FX, x, y), bilin(FY, x, y)
            side = np.sign(-fy_ * lx + fx_ * ly) if rng.random() < 0.5 else rng.choice([-1, 1])
            col = col + np.array([side * rng.uniform(*cfg['form_dL']), 0, 0])
        pts = trace(x, y, FX, FY, lab, z, rng.uniform(*cfg['form_len']), leak=cfg['form_leak'], keep=smask if cfg.get('wood') else None)
        add('form', pts, jitter(ok2rgb(col), rng, 0.008, 0.005), rng.uniform(*cfg['form_w']), rng.uniform(*cfg['form_op']))
    # P3 accent: short crisp strokes along the lit silhouette, a step lighter than the lightest zone
    lit_edge = smask & (d_in < cfg['accent_band']) & (facing > 0.35) & (lab >= len(cols) - 2)
    top = rgb2ok(np.array(hx(cfg['accent_col']))) if cfg.get('accent_col') else rgb2ok(cols[-1]) + np.array([cfg['accent_dL'], 0.0, 0.0])
    for (x, y) in seeds(cfg['accent_spacing'], lit_edge):
        pts = trace(x, y, FX, FY, lab, None, rng.uniform(*cfg['accent_len']), leak=0.5)
        add('accent', pts, jitter(ok2rgb(top), rng, 0.01, 0.004), rng.uniform(*cfg['accent_w']), rng.uniform(0.85, 1.0))
    # blend: short strokes ACROSS a zone edge, where the light is not (lost edges), mixed colour
    away = zb & (d_in > 4) & smask
    gxz, gyz = ndi.sobel(ndi.gaussian_filter(lab.astype(float), 2), 1), ndi.sobel(ndi.gaussian_filter(lab.astype(float), 2), 0)
    for (x, y) in seeds(cfg['blend_spacing'], away):
        xi, yi = int(np.clip(x, 0, w - 1)), int(np.clip(y, 0, h - 1))
        gx_, gy_ = gxz[yi, xi], gyz[yi, xi]; g = math.hypot(gx_, gy_)
        if g < 1e-6: continue
        gx_, gy_ = gx_ / g, gy_ / g
        if gx_ * lx + gy_ * ly > cfg['blend_light_max'] and rng.random() < 0.8: continue   # keep lit edges found
        Ls = rng.uniform(*cfg['blend_len'])
        p0, p1 = (x - gx_ * Ls / 2, y - gy_ * Ls / 2), (x + gx_ * Ls / 2, y + gy_ * Ls / 2)
        z0 = lab[int(np.clip(p0[1], 0, h - 1)), int(np.clip(p0[0], 0, w - 1))]
        z1 = lab[int(np.clip(p1[1], 0, h - 1)), int(np.clip(p1[0], 0, w - 1))]
        if z0 < 0 or z1 < 0: continue
        mixc = ok2rgb(0.5 * rgb2ok(cols[z0]) + 0.5 * rgb2ok(cols[z1]))
        mid = [(p0[0] + (p1[0] - p0[0]) * t + rng.normal(0, 1.0), p0[1] + (p1[1] - p0[1]) * t) for t in np.linspace(0, 1, 6)]
        add('blend', mid, mixc, rng.uniform(*cfg['blend_w']), rng.uniform(*cfg['blend_op']), {'from': hexof(cols[z0]), 'to': hexof(cols[z1])})
    # edge: along the silhouette, its own zone colour; found (crisp) facing the light, lost (soft, smudged) away
    cs, _ = cv2.findContours(inside.astype(np.uint8), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
    for c in cs:
        c = c[:, 0, :].astype(float)
        if len(c) < 30: continue
        i = 0
        while i < len(c):
            n = int(rng.uniform(*cfg['edge_len']))
            seg = c[i:i + n]; i += n + int(rng.uniform(*cfg['edge_gap']))
            if len(seg) < 6: continue
            mx, my = seg[len(seg) // 2]
            xi, yi = int(np.clip(mx, 0, w - 1)), int(np.clip(my, 0, h - 1))
            f = float(facing[yi, xi])
            inset = cfg['edge_w'][1] * 0.35
            sx = np.clip(seg[:, 0] - nx[seg[:, 1].astype(int).clip(0, h - 1), seg[:, 0].astype(int).clip(0, w - 1)] * inset, 0, w - 1)
            sy = np.clip(seg[:, 1] - ny[seg[:, 1].astype(int).clip(0, h - 1), seg[:, 0].astype(int).clip(0, w - 1)] * inset, 0, h - 1)
            zz = lab[sy.astype(int), sx.astype(int)]; zz = zz[zz >= 0]
            if len(zz) == 0: continue
            z = int(np.bincount(zz).argmax())
            if cfg.get('wood') and not smask[sy.astype(int), sx.astype(int)].mean() > 0.6: continue
            lost = f < cfg['lost_below']
            add('edge', list(zip(sx, sy)), jitter(cols[z], rng, 0.01, 0.004), rng.uniform(*cfg['edge_w']),
                rng.uniform(*cfg['edge_op']), {'lost': bool(lost), 'facing': round(f, 2)})
    # dab (tree): leaf marks one value step lighter than the zone under them, gathered in clumps
    if cfg.get('dab_spacing'):
        clump = ndi.gaussian_filter(rng.standard_normal((h, w)), cfg['clump_sigma']); clump = clump / (clump.std() + 1e-9)
        cover = np.linspace(*cfg['dab_cover'], len(cols))[np.clip(lab, 0, len(cols) - 1)]
        prob = np.where(inside, np.clip(cover * (0.55 + 0.45 * np.tanh(clump)), 0, 1), 0)
        for (x, y) in seeds(cfg['dab_spacing'], smask & (lab >= 0), prob):
            z = lab[int(np.clip(y, 0, h - 1)), int(np.clip(x, 0, w - 1))]
            zz = min(z + 1, len(cols) - 1)
            if zz != z: col = ok2rgb(rgb2ok(cols[zz]) * 0.7 + rgb2ok(cols[z]) * 0.3)
            elif cfg.get('dab_top'): col = ok2rgb(rgb2ok(np.array(hx(cfg['dab_top']))) * 0.8 + rgb2ok(cols[z]) * 0.2)
            else: col = ok2rgb(rgb2ok(cols[z]) + [0.035, 0, 0])
            ang = math.atan2(bilin(FY, x, y), bilin(FX, x, y)) + rng.normal(0, 0.5)
            Ld = rng.uniform(*cfg['dab_len'])
            pts = [(x - math.cos(ang) * Ld / 2, y - math.sin(ang) * Ld / 2), (x + math.cos(ang) * Ld / 2, y + math.sin(ang) * Ld / 2)]
            add('dab', pts, jitter(col, rng, 0.015, 0.006), rng.uniform(*cfg['dab_w']), rng.uniform(0.8, 1.0))
        # leafy: clumps of dabs across the silhouette (out on the lit side, a few notches in)
        for c in cs:
            c = c[:, 0, :].astype(float)
            for j in range(0, len(c), int(cfg['leafy_step'])):
                if rng.random() > cfg['leafy_p']: continue
                x, y = c[j]
                xi, yi = int(np.clip(x, 0, w - 1)), int(np.clip(y, 0, h - 1))
                if not smask[max(0, yi - 2):yi + 3, max(0, xi - 2):xi + 3].any(): continue
                ox, oy = nx[yi, xi], ny[yi, xi]
                f = float(facing[yi, xi])
                zz = lab[int(np.clip(y - oy * 4, 0, h - 1)), int(np.clip(x - ox * 4, 0, w - 1))]
                if zz < 0: continue
                for _ in range(int(rng.integers(1, 4))):
                    ang = math.atan2(oy, ox) + rng.normal(0, 0.7)
                    Ld = rng.uniform(*cfg['dab_len'])
                    cx_, cy_ = x + rng.normal(0, 2.5) - ox * 1.5, y + rng.normal(0, 2.5) - oy * 1.5
                    pts = [(cx_ - math.cos(ang) * Ld * 0.3, cy_ - math.sin(ang) * Ld * 0.3), (cx_ + math.cos(ang) * Ld * 0.7, cy_ + math.sin(ang) * Ld * 0.7)]
                    col = cols[zz] if f < 0.2 else ok2rgb(rgb2ok(cols[zz]) + [0.02, 0, 0])
                    add('leafy', pts, jitter(col, rng, 0.012, 0.005), rng.uniform(*cfg['dab_w']) * 0.85, rng.uniform(0.85, 1.0))
    zone_polys = [{'zone': k, 'color': hexof(cols[k]), 'polys': poly_of(lab == k)} for k in range(len(cols))]
    out = {'name': name, 'size': [w, h], 'light': list(light), 'design': design,
           'wood': cfg.get('wood'), 'zones': zone_polys, 'silhouette': poly_of(lab >= 0), 'strokes': strokes,
           'palette': [hexof(c) for c in cols]}
    json.dump(out, open(f'{OUT}/{name}{tag}.json', 'w'))
    # a preview of the flow and the plan (for the record)
    kinds = {}
    for s in strokes: kinds[s['kind']] = kinds.get(s['kind'], 0) + 1
    print(name, 'zones', len(cols), 'strokes', len(strokes), kinds)
    vis = (np.dstack([rgb, a]) * 255).astype(np.uint8)
    img = Image.new('RGBA', (w, h), (235, 235, 235, 255)); img.alpha_composite(Image.fromarray(vis, 'RGBA'))
    arr = np.asarray(img.convert('RGB')).copy()
    for y in range(6, h, 12):
        for x in range(6, w, 12):
            if not inside[y, x]: continue
            cv2.line(arr, (int(x - FX[y, x] * 5), int(y - FY[y, x] * 5)), (int(x + FX[y, x] * 5), int(y + FY[y, x] * 5)), (20, 20, 20), 1, cv2.LINE_AA)
    Image.fromarray(arr).save(f'{OUT}/{name}{tag}_flow.png')


# the cloud: lit from the low sun at the left (the frame's sun is at x 196, y 779; the piece's box starts at x 560)
CLOUD = dict(k=5, outside_L=0.86, rho=9, edge_falloff=14, zone_falloff=10,
             wash_spacing=70, wash_len=(90, 180), wash_w=(30, 46), wash_op=(0.3, 0.5),
             form_spacing=15, form_base=0.05, form_len=(26, 70), form_w=(9, 16), form_op=(0.55, 0.85), form_mix=0.55,
             cross=0.5, form_dL=(0.03, 0.07), form_leak=6, calm_dark=0.35,
             accent_band=9, accent_spacing=8, accent_len=(10, 26), accent_w=(2.2, 4.0), accent_dL=0.035,
             blend_spacing=10, blend_len=(14, 30), blend_w=(8, 15), blend_op=(0.35, 0.6), blend_light_max=-0.1,
             edge_len=(24, 60), edge_gap=(4, 26), edge_w=(6, 12), edge_op=(0.75, 0.95), lost_below=-0.05)
TREE = dict(k=5, outside_L=0.70, rho=6, edge_falloff=8, zone_falloff=6,
            wash_spacing=22, wash_len=(24, 60), wash_w=(12, 20), wash_op=(0.4, 0.6),
            form_spacing=16, form_base=0.08, form_len=(12, 30), form_w=(5, 9), form_op=(0.6, 0.85), form_mix=0.35,
            cross=0.45, form_dL=(0.03, 0.06), form_leak=2, wood=f'{INP}/tree_wood.png', dab_top='#b7b46c', accent_col='#e7d182',
            accent_band=6, accent_spacing=11, accent_len=(4, 10), accent_w=(2.5, 4.0), accent_dL=0.05,
            blend_spacing=16, blend_len=(8, 16), blend_w=(5, 9), blend_op=(0.3, 0.5), blend_light_max=0.0,
            edge_len=(14, 34), edge_gap=(6, 20), edge_w=(4, 7), edge_op=(0.7, 0.9), lost_below=-0.1,
            dab_spacing=4.2, clump_sigma=5, dab_cover=(0.25, 0.8),
            dab_len=(3.5, 8.0), dab_w=(4.0, 7.0), leafy_step=5, leafy_p=0.55)

if __name__ == '__main__':
    import os; os.makedirs(OUT, exist_ok=True)
    # light vectors in image coords (x right, y down), pointing TOWARD the light
    if len(sys.argv) > 1 and sys.argv[1] == 'warped':     # the recommended stack: the design warped first
        plan('cloud', (-0.95, 0.31), (1.0, 0.0), CLOUD, 7, f'{INP}/cloud_design_warped.png', '_w')
        plan('tree', (-0.75, -0.66), (1.0, 0.0), dict(TREE, wood=f'{INP}/tree_wood_warped.png'), 8, f'{INP}/tree_design_warped.png', '_w')
    else:
        plan('cloud', (-0.95, 0.31), (1.0, 0.0), CLOUD, 7)
        plan('tree', (-0.75, -0.66), (1.0, 0.0), TREE, 8)
