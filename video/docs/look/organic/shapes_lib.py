"""shapes_lib.py: the shape measures of docs/look/organic/shapes.md (contour geometry at phone scale).

Pure numpy / SciPy / OpenCV / scikit-image (BSD-3 / BSD-3 / Apache-2.0 / BSD-3). Deterministic: no random draws.
Every length is in px of a 1080-px-wide frame (the phone's width), so ours and the references are measured alike.

The measures (each a function below, the definitions in shapes.md §1):
  segment()           visible shapes: regions whose boundaries carry a colour step (Felzenszwalb + a mean-colour merge)
  region_contours()   sub-pixel contours of every region (marching squares), the crop's own border dropped
  contour_stats()     straight runs, compass arcs, corners and their angles, curvature, axis alignment, parallels
  edge_profiles()     the 10-90 % width and the step of the edge across each boundary (an erf fit)
  region_stats()      symmetry, repetition, spacing, size ladder, divider dimension, the roughness spectrum
  notan()             the 2-value mass map and its lost / soft / found boundary shares
"""
from __future__ import annotations

import math

import cv2
import numpy as np
from scipy import ndimage as ndi
from scipy.special import erf
from skimage import color, measure, segmentation, graph

# ----------------------------------------------------------------------------------------------------------------
# images


def to_lab(rgb: np.ndarray) -> np.ndarray:
    """uint8 RGB -> float32 CIELAB (L 0-100)."""
    return color.rgb2lab(rgb.astype(np.float32) / 255.0).astype(np.float32)


def normalize_image(bgr: np.ndarray, width: int = 1080, jpeg_q: int = 85) -> np.ndarray:
    """Resize to the phone's width (area when shrinking, cubic when enlarging) and round-trip through JPEG q85, so
    our PNG and the phone screenshots carry the same codec. Returns uint8 RGB."""
    h, w = bgr.shape[:2]
    s = width / w
    if abs(s - 1) > 1e-6:
        bgr = cv2.resize(bgr, (width, int(round(h * s))), interpolation=cv2.INTER_AREA if s < 1 else cv2.INTER_CUBIC)
    ok, buf = cv2.imencode('.jpg', bgr, [cv2.IMWRITE_JPEG_QUALITY, jpeg_q])
    assert ok
    bgr = cv2.imdecode(buf, cv2.IMREAD_COLOR)
    return cv2.cvtColor(bgr, cv2.COLOR_BGR2RGB)


# ----------------------------------------------------------------------------------------------------------------
# segmentation: the visible shapes


def segment(lab: np.ndarray, scale: float = 60.0, sigma: float = 0.8, min_size: int = 16,
            merge_de: float = 6.0, min_area: int = 16) -> np.ndarray:
    """Visible shapes. Felzenszwalb's graph segmentation on CIELAB (edge weights are delta-E 1976) over-segments,
    then adjacent regions whose mean colours differ by under `merge_de` merge (a colour step under ~6 delta-E is not
    seen as a shape edge at phone size), smallest-difference first; regions under `min_area` px go to their most
    similar neighbour. Returns int32 labels 0..n-1."""
    lab64 = lab.astype(np.float64)
    seg = segmentation.felzenszwalb(lab64, scale=scale, sigma=sigma, min_size=min_size, channel_axis=-1)
    seg = _merge_by_colour(lab64, seg, merge_de)
    seg = _absorb_small(lab64, seg, min_area)
    _, seg = np.unique(seg, return_inverse=True)
    return seg.reshape(lab.shape[:2]).astype(np.int32)


def _merge_by_colour(lab: np.ndarray, seg: np.ndarray, thresh: float) -> np.ndarray:
    rag = graph.rag_mean_color(lab, seg, mode='distance')

    def weight(g, src, dst, n):
        diff = g.nodes[dst]['mean color'] - g.nodes[n]['mean color']
        return {'weight': float(np.linalg.norm(diff))}

    def merge(g, src, dst):
        g.nodes[dst]['total color'] += g.nodes[src]['total color']
        g.nodes[dst]['pixel count'] += g.nodes[src]['pixel count']
        g.nodes[dst]['mean color'] = g.nodes[dst]['total color'] / g.nodes[dst]['pixel count']

    return graph.merge_hierarchical(seg, rag, thresh=thresh, rag_copy=False, in_place_merge=True,
                                    merge_func=merge, weight_func=weight)


def _absorb_small(lab: np.ndarray, seg: np.ndarray, min_area: int) -> np.ndarray:
    """Merge regions under min_area px into the adjacent region with the closest mean colour (repeat until none)."""
    seg = seg.copy()
    for _ in range(6):
        ids, inv, counts = np.unique(seg, return_inverse=True, return_counts=True)
        inv = inv.reshape(seg.shape)
        small = np.where(counts < min_area)[0]
        if len(small) == 0:
            break
        n = len(ids)
        sums = np.stack([np.bincount(inv.ravel(), lab[..., c].ravel(), minlength=n) for c in range(3)], 1)
        means = sums / counts[:, None]
        # adjacency through 4-neighbour pairs
        a = np.concatenate([inv[:, :-1].ravel(), inv[:-1, :].ravel()])
        b = np.concatenate([inv[:, 1:].ravel(), inv[1:, :].ravel()])
        m = a != b
        a, b = a[m], b[m]
        pairs = np.unique(np.stack([np.minimum(a, b), np.maximum(a, b)], 1), axis=0)
        best = {}
        is_small = np.zeros(n, bool)
        is_small[small] = True
        for p, q in pairs:
            for s, o in ((p, q), (q, p)):
                if is_small[s]:
                    d = float(np.linalg.norm(means[s] - means[o]))
                    if s not in best or d < best[s][0]:
                        best[s] = (d, o)
        remap = np.arange(n)
        # absorb the smallest first; never chain into a region that is itself absorbed this round
        for s in sorted(best, key=lambda k: counts[k]):
            o = best[s][1]
            if remap[o] != o:
                continue
            remap[s] = o
        inv = remap[inv]
        seg = inv
    return seg


# ----------------------------------------------------------------------------------------------------------------
# contours


def region_contours(labels: np.ndarray, min_area: int = 16, blur: float = 0.7):
    """Sub-pixel contours of every region: marching squares on a lightly blurred region mask (so a straight diagonal
    edge stays straight instead of a pixel staircase). Contours are split where they run along the crop's border
    (those stretches are the crop's, not the picture's). Returns a list of dicts: region id, the polyline (N x 2, x y),
    closed flag."""
    H, W = labels.shape
    out = []
    objs = ndi.find_objects(labels + 1)
    areas = np.bincount(labels.ravel())
    for rid, sl in enumerate(objs):
        if sl is None or areas[rid] < min_area:
            continue
        y0 = max(sl[0].start - 3, 0); y1 = min(sl[0].stop + 3, H)
        x0 = max(sl[1].start - 3, 0); x1 = min(sl[1].stop + 3, W)
        m = (labels[y0:y1, x0:x1] == rid).astype(np.float32)
        mb = ndi.gaussian_filter(m, blur, mode='nearest')
        for c in measure.find_contours(mb, 0.5):
            pts = np.stack([c[:, 1] + x0, c[:, 0] + y0], 1)
            closed = bool(np.allclose(c[0], c[-1]))
            for part, cl in _drop_border(pts, closed, W, H):
                if len(part) >= 6:
                    out.append({'rid': rid, 'pts': part, 'closed': cl})
    return out


def _drop_border(pts, closed, W, H, tol=1.2):
    on = (pts[:, 0] < tol) | (pts[:, 0] > W - 1 - tol) | (pts[:, 1] < tol) | (pts[:, 1] > H - 1 - tol)
    if not on.any():
        return [(pts[:-1] if closed else pts, closed)]
    keep = ~on
    parts = []
    idx = np.where(keep)[0]
    if len(idx) == 0:
        return parts
    # split into runs of kept points (wrapping for closed contours)
    if closed:
        start = np.where(on)[0][0]
        order = np.r_[start:len(pts) - 1, 0:start]
        seq = order
    else:
        seq = np.arange(len(pts))
    run = []
    for i in seq:
        if keep[i]:
            run.append(i)
        elif run:
            parts.append((pts[run], False)); run = []
    if run:
        parts.append((pts[run], False))
    return parts


def resample(pts: np.ndarray, closed: bool, step: float = 1.0) -> np.ndarray:
    """Points every `step` px of arc length."""
    P = np.vstack([pts, pts[:1]]) if closed else pts
    d = np.hypot(*np.diff(P, axis=0).T)
    s = np.r_[0, np.cumsum(d)]
    L = s[-1]
    if L < step * 3:
        return P[:1].repeat(1, 0)
    n = int(L / step)
    t = np.linspace(0, L, n, endpoint=not closed)
    return np.stack([np.interp(t, s, P[:, 0]), np.interp(t, s, P[:, 1])], 1)


def smooth_pts(P: np.ndarray, closed: bool, sigma: float) -> np.ndarray:
    if sigma <= 0:
        return P
    mode = 'wrap' if closed else 'nearest'
    return np.stack([ndi.gaussian_filter1d(P[:, 0], sigma, mode=mode), ndi.gaussian_filter1d(P[:, 1], sigma, mode=mode)], 1)


def _win_sums(v: np.ndarray, h: int, closed: bool):
    """Sum of v over windows [i-h, i+h] for every i (closed: wrapping; open: windows clipped -> NaN when partial)."""
    n = len(v)
    if closed:
        vv = np.concatenate([v[-h:], v, v[:h]]) if n > 2 * h else None
        if vv is None:
            return None
        c = np.r_[0, np.cumsum(vv)]
        return c[2 * h + 1:] - c[:-2 * h - 1]
    c = np.r_[0, np.cumsum(v)]
    out = np.full(n, np.nan)
    if n >= 2 * h + 1:
        out[h:n - h] = c[2 * h + 1:] - c[:n - 2 * h]
    return out


def line_rms(P: np.ndarray, closed: bool, h: int) -> np.ndarray:
    """RMS perpendicular distance of the points in each window [i-h, i+h] from their best-fit (total least squares)
    line. NaN where the window does not fit."""
    x = P[:, 0] - P[:, 0].mean(); y = P[:, 1] - P[:, 1].mean()
    n = 2 * h + 1
    S = {k: _win_sums(v, h, closed) for k, v in (('x', x), ('y', y), ('xx', x * x), ('yy', y * y), ('xy', x * y))}
    if S['x'] is None:
        return np.full(len(P), np.nan)
    mx, my = S['x'] / n, S['y'] / n
    cxx = S['xx'] / n - mx * mx; cyy = S['yy'] / n - my * my; cxy = S['xy'] / n - mx * my
    tr = cxx + cyy
    det = cxx * cyy - cxy * cxy
    lam = tr / 2 - np.sqrt(np.maximum(tr * tr / 4 - det, 0))
    return np.sqrt(np.maximum(lam, 0))


def circle_fit(P: np.ndarray, closed: bool, h: int):
    """Kasa circle fit in each window [i-h, i+h]: returns (radius, geometric RMS residual), NaN where no window."""
    x = P[:, 0] - P[:, 0].mean(); y = P[:, 1] - P[:, 1].mean()
    z = x * x + y * y
    n = 2 * h + 1
    keys = {'x': x, 'y': y, 'xx': x * x, 'yy': y * y, 'xy': x * y, 'z': z, 'zx': z * x, 'zy': z * y, 'zz': z * z}
    S = {k: _win_sums(v, h, closed) for k, v in keys.items()}
    if S['x'] is None:
        nanv = np.full(len(P), np.nan)
        return nanv, nanv
    N = len(P)
    A = np.zeros((N, 3, 3)); B = np.zeros((N, 3))
    A[:, 0, 0] = S['xx']; A[:, 0, 1] = S['xy']; A[:, 0, 2] = S['x']
    A[:, 1, 0] = S['xy']; A[:, 1, 1] = S['yy']; A[:, 1, 2] = S['y']
    A[:, 2, 0] = S['x']; A[:, 2, 1] = S['y']; A[:, 2, 2] = n
    B[:, 0] = -S['zx']; B[:, 1] = -S['zy']; B[:, 2] = -S['z']
    ok = np.isfinite(A).all(axis=(1, 2)) & (np.abs(np.linalg.det(np.where(np.isfinite(A), A, 0))) > 1e-6)
    sol = np.full((N, 3), np.nan)
    if ok.any():
        sol[ok] = np.linalg.solve(A[ok], B[ok][..., None])[..., 0]
    D, E, F = sol[:, 0], sol[:, 1], sol[:, 2]
    r2 = D * D / 4 + E * E / 4 - F
    r = np.sqrt(np.maximum(r2, 1e-12))
    # algebraic residual sum: sum (z + Dx + Ey + F)^2 expanded from the window sums
    sse = (S['zz'] + D * D * S['xx'] + E * E * S['yy'] + F * F * n + 2 * D * S['zx'] + 2 * E * S['zy'] + 2 * F * S['z']
           + 2 * D * E * S['xy'] + 2 * D * F * S['x'] + 2 * E * F * S['y'])
    rms_alg = np.sqrt(np.maximum(sse, 0) / n)
    rms_geo = rms_alg / (2 * r)
    r[~ok] = np.nan; rms_geo[~ok] = np.nan
    return r, rms_geo


def _cover(flag_centres: np.ndarray, h: int, closed: bool) -> np.ndarray:
    """Points covered by any window [i-h, i+h] whose centre i is flagged."""
    f = flag_centres.astype(np.float32)
    k = np.ones(2 * h + 1, np.float32)
    if closed:
        c = ndi.convolve1d(f, k, mode='wrap')
    else:
        c = ndi.convolve1d(f, k, mode='constant')
    return c > 0


# The thresholds (calibrated on synthetic shapes through the same codec: shapes.md §1.3)
LINE_H = 10           # straight windows: 21 px of arc ...
LINE_TOL = 0.22       # ... within 0.22 px RMS of a line
LONG_RUN = 60         # a "ruler line": a straight run of >= 60 px
ARC_H = 15            # compass arcs: 31 px of arc ...
ARC_TOL = 0.12        # ... within 0.12 px RMS of a circle (a free curve drifts off a circle faster)
ARC_RMIN, ARC_RMAX = 4.0, 600.0
CORNER_MIN = 35.0     # a corner turns >= 35 deg ...
CORNER_A, CORNER_B = 3, 8   # ... within +-3 px, and most of its +-8 px turn happens there
CORNER_CONC = 0.6
AXIS_TOL = 2.0        # deg from horizontal / vertical


def contour_stats(contours, region_req: dict | None = None):
    """Per-point classification of every contour and the length-weighted totals.
    Returns a dict of totals and per-contour arrays (for the drawn overlay)."""
    tot = {'len': 0.0, 'straight': 0.0, 'long': 0.0, 'arc': 0.0, 'axis': 0.0, 'axis_straight': 0.0,
           'curv_var_sum': 0.0, 'curv_n': 0, 'flat': 0.0, 'dk_sum': 0.0, 'dk_n': 0}
    corners = []        # (x, y, interior angle deg)
    runs = []           # straight runs: (x0, y0, x1, y1, length)
    per = []
    for c in contours:
        P0 = resample(c['pts'], c['closed'], 1.0)
        if len(P0) < 2 * LINE_H + 3:
            continue
        closed = c['closed']
        P = smooth_pts(P0, closed, 1.0)
        n = len(P)
        L = float(n)
        # straight
        lr = line_rms(P, closed, LINE_H)
        st_c = np.nan_to_num(lr, nan=9) <= LINE_TOL
        st = _cover(st_c, LINE_H, closed)
        # runs of straight points
        lab_runs, nr = ndi.label(st)
        if closed and nr > 1 and st[0] and st[-1]:
            lab_runs[lab_runs == lab_runs[-1]] = lab_runs[0]
        long_mask = np.zeros(n, bool)
        for k in range(1, nr + 1):
            idx = np.where(lab_runs == k)[0]
            if len(idx) == 0:
                continue
            if len(idx) >= LONG_RUN:
                long_mask[idx] = True
            if len(idx) >= 2 * LINE_H + 1:
                # endpoints along the run (ordered by arc position; wrapping handled loosely)
                a, b = P[idx[0]], P[idx[-1]]
                runs.append((a[0], a[1], b[0], b[1], float(len(idx))))
        # arcs (constant curvature) that are not lines
        r, rg = circle_fit(P, closed, ARC_H)
        arc_c = (np.nan_to_num(rg, nan=9) <= ARC_TOL) & (np.nan_to_num(r, nan=0) >= ARC_RMIN) & (np.nan_to_num(r, nan=1e9) <= ARC_RMAX)
        arc = _cover(arc_c, ARC_H, closed) & ~st
        # tangent and curvature (on a slightly smoother copy)
        P2 = smooth_pts(P0, closed, 2.0)
        d = np.gradient(P2, axis=0) if not closed else (np.roll(P2, -1, 0) - np.roll(P2, 1, 0)) / 2
        th = np.unwrap(np.arctan2(d[:, 1], d[:, 0]))
        if closed:
            dth = np.angle(np.exp(1j * (np.roll(th, -1) - np.roll(th, 1)))) / 2
        else:
            dth = np.gradient(th)
        kappa = dth  # per px of arc
        req = (region_req or {}).get(c['rid'], None)
        req = req if req else max(L / (2 * math.pi), 4.0)
        kh = kappa * req
        # orientation (mod 180), axis-aligned
        ori = np.degrees(np.mod(np.arctan2(d[:, 1], d[:, 0]), math.pi))
        dax = np.minimum.reduce([np.abs(ori - 0), np.abs(ori - 90), np.abs(ori - 180)])
        ax = dax <= AXIS_TOL
        # corners on the 1-px smoothed copy
        d1 = (np.roll(P, -1, 0) - np.roll(P, 1, 0)) / 2 if closed else np.gradient(P, axis=0)
        t1 = np.unwrap(np.arctan2(d1[:, 1], d1[:, 0]))
        cpts = _corners(P, t1, closed)
        corners.extend(cpts)
        cmask = np.zeros(n, bool)
        for (ci, _, _, _) in cpts:
            cmask[max(ci - 5, 0):ci + 6] = True
        free = ~cmask
        tot['len'] += L
        tot['straight'] += float(st.sum())
        tot['long'] += float(long_mask.sum())
        tot['arc'] += float(arc.sum())
        tot['axis'] += float(ax.sum())
        tot['axis_straight'] += float((ax & st).sum())
        kv = kh[free]
        tot['curv_var_sum'] += float(((kv - kv.mean()) ** 2).sum()) if len(kv) else 0.0
        tot['curv_n'] += int(len(kv))
        tot['flat'] += float((np.abs(kh) < 0.15).sum())
        dk = np.abs(np.gradient(kh)) * req  # d(kappa*R)/d(s/R)
        tot['dk_sum'] += float((dk[free] ** 2).sum()); tot['dk_n'] += int(free.sum())
        per.append({'P': P, 'straight': st, 'long': long_mask, 'arc': arc, 'corners': [(x, y, a) for (_, x, y, a) in cpts]})
    return tot, corners, runs, per


def _corners(P, th, closed):
    n = len(P)
    a, b = CORNER_A, CORNER_B
    if n < 2 * b + 3:
        return []
    if closed:
        Ta = _wrapdiff(th, a)
        Tb = _wrapdiff(th, b)
    else:
        Ta = np.full(n, 0.0); Tb = np.full(n, 0.0)
        Ta[a:n - a] = th[2 * a:] - th[:n - 2 * a]
        Tb[b:n - b] = th[2 * b:] - th[:n - 2 * b]
    A = np.degrees(np.abs(Ta)); B = np.degrees(np.abs(Tb))
    cand = (A >= CORNER_MIN) & (A >= CORNER_CONC * np.maximum(B, 1e-6))
    out = []
    if not cand.any():
        return out
    # non-max suppression within +-6 px
    order = np.argsort(-A)
    taken = np.zeros(n, bool)
    for i in order:
        if not cand[i] or taken[i]:
            continue
        lo, hi = i - 6, i + 7
        if closed:
            idx = np.arange(lo, hi) % n
        else:
            idx = np.arange(max(lo, 0), min(hi, n))
        taken[idx] = True
        ang = 180.0 - min(B[i], 179.0)
        out.append((int(i), float(P[i, 0]), float(P[i, 1]), float(ang)))
    return out


def _wrapdiff(th, b):
    """theta(i+b) - theta(i-b) on a closed contour, continuous across the seam (the loop's total turn added)."""
    n = len(th)
    total = th[-1] - th[0] + _seam(th)
    ext = np.concatenate([th[-b:] - total, th, th[:b] + total])
    return ext[2 * b:2 * b + n] - ext[:n]


def _seam(th):
    """The step that closes the loop: the angle difference from the last to the first point."""
    return float(np.angle(np.exp(1j * (th[0] - th[-1]))))


# ----------------------------------------------------------------------------------------------------------------
# edge profiles: the 10-90 % width and the step across each boundary


def _bilinear(img: np.ndarray, x: np.ndarray, y: np.ndarray) -> np.ndarray:
    H, W = img.shape[:2]
    x = np.clip(x, 0, W - 1.001); y = np.clip(y, 0, H - 1.001)
    x0 = np.floor(x).astype(int); y0 = np.floor(y).astype(int)
    fx = (x - x0)[..., None]; fy = (y - y0)[..., None]
    a = img[y0, x0]; b = img[y0, x0 + 1]; c = img[y0 + 1, x0]; d = img[y0 + 1, x0 + 1]
    return a * (1 - fx) * (1 - fy) + b * fx * (1 - fy) + c * (1 - fx) * fy + d * fx * fy


def edge_profiles(lab: np.ndarray, contours, every: float = 4.0, reach: float = 20.0, side: float = 8.0,
                  min_step: float = 4.0, max_points: int = 1500):
    """For points every `every` px along the boundaries: sample the CIELAB profile across the edge (+-reach px, three
    parallel lines averaged), project it on the colour difference between the two sides (means over side..reach),
    and fit an erf: the 10-90 % width = 2.563 sigma. Returns arrays (x, y, step dE, width px, fit rms, kind) where
    kind 0 = step edge, 1 = ridge/line (a thin shape: the profile goes and comes back), 2 = no edge (step < min_step)."""
    H, W = lab.shape[:2]
    pts = []; nrm = []
    for c in contours:
        P = smooth_pts(resample(c['pts'], c['closed'], 1.0), c['closed'], 1.5)
        if len(P) < 8:
            continue
        d = np.gradient(P, axis=0)
        nn = np.stack([-d[:, 1], d[:, 0]], 1)
        nn /= np.maximum(np.hypot(nn[:, 0], nn[:, 1]), 1e-9)[:, None]
        k = max(int(every), 1)
        sel = np.arange(k // 2, len(P), k)
        pts.append(P[sel]); nrm.append(nn[sel])
    if not pts:
        return None
    pts = np.concatenate(pts); nrm = np.concatenate(nrm)
    # keep points whose profile stays inside the crop
    inside = ((pts[:, 0] - reach * np.abs(nrm[:, 0]) > 1) & (pts[:, 0] + reach * np.abs(nrm[:, 0]) < W - 2) &
              (pts[:, 1] - reach * np.abs(nrm[:, 1]) > 1) & (pts[:, 1] + reach * np.abs(nrm[:, 1]) < H - 2))
    pts = pts[inside]; nrm = nrm[inside]
    if len(pts) > max_points:
        sel = np.linspace(0, len(pts) - 1, max_points).astype(int)
        pts = pts[sel]; nrm = nrm[sel]
    t = np.arange(-reach, reach + 0.01, 0.5)
    tan = np.stack([nrm[:, 1], -nrm[:, 0]], 1)
    prof = 0
    for off in (-1.0, 0.0, 1.0):
        X = pts[:, 0:1] + nrm[:, 0:1] * t[None] + tan[:, 0:1] * off
        Y = pts[:, 1:2] + nrm[:, 1:2] * t[None] + tan[:, 1:2] * off
        prof = prof + _bilinear(lab, X, Y)
    prof = prof / 3.0   # (N, T, 3)
    left = prof[:, t <= -side].mean(1); right = prof[:, t >= side].mean(1)
    dv = right - left
    step = np.linalg.norm(dv, axis=1)
    u = dv / np.maximum(step, 1e-9)[:, None]
    p = ((prof - left[:, None]) * u[:, None]).sum(-1) / np.maximum(step, 1e-9)[:, None]   # ~0 -> 1
    widths = np.full(len(pts), np.nan); rms = np.full(len(pts), np.nan); kind = np.zeros(len(pts), int)
    for i in range(len(pts)):
        if step[i] < min_step:
            kind[i] = 2
            continue
        w, r = _fit_erf(t, p[i])
        widths[i] = w; rms[i] = r
        # a ridge: the profile overshoots well past both sides (a thin line / a sliver between two edges)
        if r > 0.12 or p[i].max() > 1.6 or p[i].min() < -0.6:
            kind[i] = 1
    return {'x': pts[:, 0], 'y': pts[:, 1], 'step': step, 'width': widths, 'rms': rms, 'kind': kind}


def _fit_erf(t, p):
    """Least squares p ~ a + b * Phi((t - t0) / s) over a coarse grid of (t0, s), a and b solved linearly."""
    best = (np.inf, 1.0, 0.0)
    s_grid = np.exp(np.linspace(np.log(0.25), np.log(14.0), 34))
    t0_grid = np.arange(-6.0, 6.01, 0.5)
    for s in s_grid:
        Z = (t[None, :] - t0_grid[:, None]) / s
        Phi = 0.5 * (1 + erf(Z / math.sqrt(2)))
        # linear fit a + b Phi for each t0
        m = Phi.mean(1, keepdims=True)
        pm = p.mean()
        cov = ((Phi - m) * (p - pm)).sum(1)
        var = ((Phi - m) ** 2).sum(1) + 1e-12
        b = cov / var
        a = pm - b * m[:, 0]
        res = ((a[:, None] + b[:, None] * Phi - p[None]) ** 2).mean(1)
        j = int(np.argmin(res))
        if res[j] < best[0]:
            best = (res[j], s, t0_grid[j])
    # refine s around the best with a finer local grid
    s0, t00 = best[1], best[2]
    for s in s0 * np.exp(np.linspace(-0.12, 0.12, 9)):
        for t0 in t00 + np.linspace(-0.5, 0.5, 9):
            Phi = 0.5 * (1 + erf((t - t0) / s / math.sqrt(2)))
            m = Phi.mean(); pm = p.mean()
            b = ((Phi - m) * (p - pm)).sum() / (((Phi - m) ** 2).sum() + 1e-12)
            a = pm - b * m
            r = ((a + b * Phi - p) ** 2).mean()
            if r < best[0]:
                best = (r, s, t0)
    return 2.563 * best[1], math.sqrt(best[0])


# ----------------------------------------------------------------------------------------------------------------
# regions: symmetry, repetition, spacing, size ladder, divider dimension, roughness spectrum


def region_table(labels: np.ndarray):
    H, W = labels.shape
    props = measure.regionprops(labels + 1)
    rows = []
    for p in props:
        rid = p.label - 1
        y0, x0, y1, x1 = p.bbox
        touches = y0 == 0 or x0 == 0 or y1 == H or x1 == W
        rows.append({'rid': rid, 'area': int(p.area), 'cy': p.centroid[0], 'cx': p.centroid[1], 'bbox': p.bbox,
                     'touches': touches, 'req': math.sqrt(p.area / math.pi), 'image': p.image,
                     'solidity': float(p.solidity) if p.area > 3 else 1.0})
    return rows


def mirror_symmetry(mask: np.ndarray, step_deg: float = 7.5) -> float:
    """Best IoU of a shape with its own mirror image over axes through its centroid (0 = none, 1 = perfect)."""
    m = np.pad(mask.astype(np.uint8), 4)
    ys, xs = np.nonzero(m)
    if len(xs) < 10:
        return float('nan')
    cx, cy = xs.mean(), ys.mean()
    # put the centroid at the centre of a square canvas big enough for any reflection
    R = int(math.ceil(max(np.hypot(xs - cx, ys - cy)))) + 3
    S = 2 * R + 1
    M = np.float32([[1, 0, R - cx], [0, 1, R - cy]])
    c = cv2.warpAffine(m, M, (S, S), flags=cv2.INTER_NEAREST)
    best = 0.0
    a_tot = float(c.sum())
    for deg in np.arange(0, 180, step_deg):
        t = math.radians(2 * deg)
        # reflection about the line through (R, R) at angle deg
        A = np.float32([[math.cos(t), math.sin(t)], [math.sin(t), -math.cos(t)]])
        off = np.float32([R, R]) - A @ np.float32([R, R])
        Mr = np.hstack([A, off[:, None]])
        r = cv2.warpAffine(c, Mr, (S, S), flags=cv2.INTER_NEAREST)
        inter = float((c & r).sum()); uni = float((c | r).sum())
        if uni > 0:
            best = max(best, inter / uni)
    return best


def _norm_mask(img: np.ndarray, size: int = 40) -> np.ndarray:
    """A region scaled to equal area (R_eq = size/4) on a size x size canvas, centred on its centroid."""
    m = img.astype(np.uint8)
    ys, xs = np.nonzero(m)
    cx, cy = xs.mean(), ys.mean()
    req = math.sqrt(m.sum() / math.pi)
    k = (size / 4.0) / max(req, 1e-6)
    M = np.float32([[k, 0, size / 2 - k * cx], [0, k, size / 2 - k * cy]])
    return cv2.warpAffine(m, M, (size, size), flags=cv2.INTER_LINEAR) > 0


def _best_iou(a: np.ndarray, b: np.ndarray, rot_step: float = 15.0) -> float:
    S = a.shape[0]
    best = 0.0
    bu = b.astype(np.uint8)
    for deg in np.arange(0, 360, rot_step):
        M = cv2.getRotationMatrix2D((S / 2, S / 2), float(deg), 1.0)
        r = cv2.warpAffine(bu, M, (S, S), flags=cv2.INTER_NEAREST) > 0
        inter = (a & r).sum(); uni = (a | r).sum()
        if uni:
            best = max(best, inter / uni)
    return float(best)


def repetition(rows, min_area: int = 80, k: int = 6):
    """For every region (>= min_area, not cut by the crop), its most alike neighbour among the k nearest regions of a
    similar size (area ratio 0.6-1.67): the IoU of the two shapes at equal area, best over rotations. Returns
    (median similarity, twin share = share with a neighbour >= 0.85 alike and >= 0.8 in area, per-region list)."""
    R = [r for r in rows if r['area'] >= min_area and not r['touches']]
    if len(R) < 3:
        return float('nan'), float('nan'), []
    C = np.array([[r['cx'], r['cy']] for r in R]); A = np.array([r['area'] for r in R], float)
    norms = [_norm_mask(r['image']) for r in R]
    sims = []; twins = 0
    for i in range(len(R)):
        d = np.hypot(*(C - C[i]).T)
        ratio = np.minimum(A, A[i]) / np.maximum(A, A[i])
        cand = [j for j in np.argsort(d) if j != i and ratio[j] >= 0.6][:k]
        best = 0.0; bestj = None
        for j in cand:
            s = _best_iou(norms[i], norms[j])
            if s > best:
                best, bestj = s, j
        sims.append(best)
        if bestj is not None and best >= 0.85 and ratio[bestj] >= 0.8:
            twins += 1
    return float(np.median(sims)), twins / len(R), sims


def spacing_cv(rows, min_area: int = 80) -> float:
    """CV of the distance from each region to its nearest neighbour of a similar size (area ratio 0.5-2): ~0 on a grid,
    ~0.5 for a random scatter (Poisson), above for clumps."""
    R = [r for r in rows if r['area'] >= min_area]
    if len(R) < 5:
        return float('nan')
    C = np.array([[r['cx'], r['cy']] for r in R]); A = np.array([r['area'] for r in R], float)
    nn = []
    for i in range(len(R)):
        ratio = np.minimum(A, A[i]) / np.maximum(A, A[i])
        d = np.hypot(*(C - C[i]).T)
        d[i] = np.inf; d[ratio < 0.5] = np.inf
        if np.isfinite(d.min()):
            nn.append(d.min())
    nn = np.array(nn)
    return float(nn.std() / nn.mean()) if len(nn) >= 5 else float('nan')


def size_ladder(rows, crop_area: int, min_area: int = 25):
    """Big / medium / small: the area shares of the largest shape, of the next 3 and of the rest; the mean ratio of
    neighbouring sizes among the 12 largest (1 = all equal, the 'necklace'; ~0.5 a steep ladder); the spread of
    log2 areas (octaves, p10-p90); and the Pareto tail exponent (Hill) of the size distribution."""
    A = np.sort(np.array([r['area'] for r in rows if r['area'] >= min_area], float))[::-1]
    if len(A) < 4:
        return {}
    tot = A.sum()
    top = A[:12]
    ratios = top[1:] / top[:-1]
    la = np.log2(A)
    tail = A[A >= min_area]
    alpha = (len(tail)) / np.sum(np.log(tail / min_area)) if len(tail) > 3 else float('nan')
    return {'n': int(len(A)), 'big': float(A[0] / tot), 'medium': float(A[1:4].sum() / tot),
            'small': float(A[4:].sum() / tot), 'ladder': float(ratios.mean()), 'equal_pairs': float((ratios >= 0.85).mean()),
            'octaves': float(np.percentile(la, 90) - np.percentile(la, 10)), 'alpha': float(alpha),
            'per_mpx': float(len(A) / crop_area * 1e6)}


def divider_dimension(P: np.ndarray, closed: bool, rulers=(2, 3, 4, 6, 8, 12, 16)) -> float:
    """Richardson's divider dimension: walk the contour with rulers of each length; D = 1 - slope(log L, log r).
    1.0 = a smooth or straight line; natural coastlines ~1.1-1.3."""
    Q = resample(P, closed, 0.25)
    if closed:
        Q = np.vstack([Q, Q[:1]])
    per = float(np.hypot(*np.diff(Q, axis=0).T).sum())
    rs = [r for r in rulers if r <= per / 10]
    if len(rs) < 3:
        return float('nan')
    Ls = []
    for r in rs:
        i = 0; n = 0; cur = Q[0]
        N = len(Q)
        while True:
            d = np.hypot(Q[i:, 0] - cur[0], Q[i:, 1] - cur[1])
            j = np.argmax(d >= r)
            if d[j] < r:
                rem = d[-1]
                break
            i = i + j; cur = Q[i]; n += 1
        Ls.append(n * r + rem)
    slope = np.polyfit(np.log(rs), np.log(Ls), 1)[0]
    return float(1 - slope)


BANDS = (1, 2, 4, 8, 16, 32, 64)   # contour smoothing scales (px of arc)


def roughness_spectrum(P: np.ndarray, closed: bool):
    """The silhouette's wiggle per octave: smooth the contour at sigma = 1, 2, 4 ... 64 px of arc; the band between two
    scales is the normal displacement between the two smoothed copies (a Laplacian pyramid of the outline). Returns
    the RMS displacement (px) per band; band k covers wavelengths of ~2*pi*sigma_k-1 .. 2*pi*sigma_k."""
    Q = resample(P, closed, 1.0)
    n = len(Q)
    out = []
    prev = smooth_pts(Q, closed, BANDS[0])
    for s in BANDS[1:]:
        if s * 3 > n and closed or s * 6 > n:
            out.append(np.nan)
            continue
        cur = smooth_pts(Q, closed, s)
        d = np.gradient(cur, axis=0)
        nn = np.stack([-d[:, 1], d[:, 0]], 1)
        nn /= np.maximum(np.hypot(nn[:, 0], nn[:, 1]), 1e-9)[:, None]
        disp = ((prev - cur) * nn).sum(1)
        if not closed:
            m = int(2 * s)
            disp = disp[m:-m] if len(disp) > 2 * m + 4 else disp[:0]
        out.append(float(np.sqrt(np.mean(disp ** 2))) if len(disp) else np.nan)
        prev = cur
    return np.array(out)


# ----------------------------------------------------------------------------------------------------------------
# notan: the 2-value masses and how their boundaries are found or lost


def notan(lab: np.ndarray, blur: float = 2.0, min_frac: float = 0.002):
    """The 2-value design: the first principal component of CIELAB (mostly value), blurred, split at Otsu's threshold;
    specks under min_frac of the crop are absorbed. Returns a bool mask (the lighter mass)."""
    X = lab.reshape(-1, 3).astype(np.float64)
    Xc = X - X.mean(0)
    w, V = np.linalg.eigh(np.cov(Xc.T))
    pc = Xc @ V[:, -1]
    if V[0, -1] < 0:
        pc = -pc
    pc = pc.reshape(lab.shape[:2]).astype(np.float32)
    pcb = ndi.gaussian_filter(pc, blur)
    lo, hi = np.percentile(pcb, [0.5, 99.5])
    u8 = np.clip((pcb - lo) / max(hi - lo, 1e-6) * 255, 0, 255).astype(np.uint8)
    thr, m = cv2.threshold(u8, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    m = m > 0
    amin = int(min_frac * m.size)
    for val in (True, False):
        lab_, n = ndi.label(m == val)
        if n:
            sizes = ndi.sum(np.ones_like(lab_), lab_, index=np.arange(1, n + 1))
            for i, s in enumerate(sizes, 1):
                if s < amin:
                    m[lab_ == i] = not val
    return m


def lost_found(prof, crisp: float = 2.0, firm: float = 6.0, soft: float = 16.0):
    """Shares of boundary samples: crisp (10-90 % <= 2 px), firm (2-6), soft (6-16), lost (wider than 16 px, or a
    step under 4 dE); thin lines are counted as found (crisp)."""
    if prof is None or len(prof['kind']) == 0:
        return {}
    k = prof['kind']; w = prof['width']
    n = len(k)
    lost = (k == 2) | ((k == 0) & (w > soft))
    crisp_m = ((k == 0) & (w <= crisp)) | (k == 1)
    firm_m = (k == 0) & (w > crisp) & (w <= firm)
    soft_m = (k == 0) & (w > firm) & (w <= soft)
    return {'crisp': float(crisp_m.mean()), 'firm': float(firm_m.mean()), 'soft': float(soft_m.mean()),
            'lost': float(lost.mean()), 'n': n,
            'median_width': float(np.nanmedian(np.where(k == 0, w, np.nan))) if (k == 0).any() else float('nan')}


def parallel_share(runs, max_dist: float = 30.0, min_dist: float = 3.0, ang_tol: float = 3.0) -> float:
    """Share of straight-run length that has another straight run within 3 deg of its direction, 3-30 px away and
    overlapping it by half the shorter length ('parallel'). Duplicates (the two sides of one edge) are under 3 px."""
    if len(runs) < 2:
        return float('nan')
    R = np.array(runs)
    a = np.arctan2(R[:, 3] - R[:, 1], R[:, 2] - R[:, 0])
    L = R[:, 4]
    has = np.zeros(len(R), bool)
    for i in range(len(R)):
        u = np.array([math.cos(a[i]), math.sin(a[i])])
        nrm = np.array([-u[1], u[0]])
        for j in range(len(R)):
            if i == j:
                continue
            da = abs(math.degrees(np.angle(np.exp(1j * 2 * (a[i] - a[j])))) / 2)
            if da > ang_tol:
                continue
            mid_j = (R[j, :2] + R[j, 2:4]) / 2
            dist = abs(float((mid_j - R[i, :2]) @ nrm))
            if dist < min_dist or dist > max_dist:
                continue
            pi0, pi1 = 0.0, float((R[i, 2:4] - R[i, :2]) @ u)
            pj0, pj1 = sorted([float((R[j, :2] - R[i, :2]) @ u), float((R[j, 2:4] - R[i, :2]) @ u)])
            lo, hi = sorted([pi0, pi1])
            ov = min(hi, pj1) - max(lo, pj0)
            if ov >= 0.5 * min(hi - lo, pj1 - pj0):
                has[i] = True
                break
    return float((L * has).sum() / L.sum())
