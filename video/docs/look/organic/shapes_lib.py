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
  along_boundaries()  lost and found ALONG the notan's outlines (they run on where the edge is lost): found / soft /
                      lost / broken shares, and how often one outline alternates between found and lost
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
    for _ in range(3):
        seg = _absorb_slivers(lab64, seg)
    seg = _absorb_small(lab64, seg, min_area)
    _, seg = np.unique(seg, return_inverse=True)
    return seg.reshape(lab.shape[:2]).astype(np.int32)


def _absorb_slivers(lab: np.ndarray, seg: np.ndarray, line_dl: float = 6.0) -> np.ndarray:
    """Codec and anti-aliasing slivers are not shapes: a region at most ~2 px thick (no pixel more than 0.5 px inside
    it) whose lightness lies between its neighbours' (an anti-aliased blend, or JPEG's 4:2:0 chroma ring) joins the
    neighbour closest in colour (lightness weighted twice: the codec smears chroma). A thin region darker or lighter
    than all its neighbours by >= line_dl L* is a real drawn line (a bar, a wire) and stays."""
    ids, inv = np.unique(seg, return_inverse=True)
    inv = inv.reshape(seg.shape)
    n = len(ids)
    inner = segmentation.find_boundaries(inv, mode='inner')
    edt = ndi.distance_transform_edt(~inner)
    depth = ndi.maximum(edt, inv, index=np.arange(n))
    thin = np.where(np.asarray(depth) <= 0.5)[0]
    if len(thin) == 0:
        return inv
    cnt = np.bincount(inv.ravel(), minlength=n).astype(float)
    means = np.stack([np.bincount(inv.ravel(), lab[..., c].ravel(), minlength=n) for c in range(3)], 1) / np.maximum(cnt, 1)[:, None]
    a = np.concatenate([inv[:, :-1].ravel(), inv[:-1, :].ravel()])
    b = np.concatenate([inv[:, 1:].ravel(), inv[1:, :].ravel()])
    m = a != b
    pairs = np.unique(np.stack([a[m], b[m]], 1), axis=0)
    nbrs: dict[int, set] = {}
    for p, q in pairs:
        nbrs.setdefault(int(p), set()).add(int(q)); nbrs.setdefault(int(q), set()).add(int(p))
    remap = np.arange(n)
    w = np.array([2.0, 1.0, 1.0])
    for t in sorted(thin, key=lambda k: cnt[k]):
        nb = [k for k in nbrs.get(int(t), ()) if remap[k] == k and k not in thin]
        if not nb:
            continue
        Ls = means[nb, 0]
        L = means[t, 0]
        if L < Ls.min() - line_dl or L > Ls.max() + line_dl:
            continue   # a real line
        d = np.sqrt((((means[nb] - means[t]) * w) ** 2).sum(1))
        remap[t] = nb[int(np.argmin(d))]
    return remap[inv]


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
LINE_TOL = 0.06       # ... within 0.06 px RMS of a line (the codec's noise on a ruler edge: 0.02), and every
LINE_DEV = 0.4        # run within 0.4 px (or 0.6 % of its length) of ONE line
LONG_RUN = 60         # a "ruler line": a straight run of >= 60 px
ARC_H = 15            # compass arcs: 31 px of arc ...
ARC_TOL = 0.12        # ... within 0.12 px RMS of a circle, every run within ARC_DEV of ONE circle, turning >= 25 deg
ARC_DEV = 0.6
ARC_TURN = 25.0
ARC_RMIN, ARC_RMAX = 4.0, 600.0
CORNER_MIN = 35.0     # a corner turns >= 35 deg ...
CORNER_A, CORNER_B = 3, 8   # ... within +-3 px, and most of its +-8 px turn happens there
CORNER_CONC = 0.6
AXIS_TOL = 2.0        # deg from horizontal / vertical
MIN_CHAIN = 16        # px: shorter edge chains are texture, not shape


# ---------------------------------------------------------------- edges: a colour Canny with sub-pixel chains


CHROMA_SIGMA = 2.0    # px: the codec keeps chroma at half resolution (4:2:0), so chroma edges are read at twice the scale
CHROMA_WEIGHT = 0.7   # and count a little less (shape is read mostly through value)


def colour_gradient(lab: np.ndarray, sigma: float):
    """Di Zenzo's colour gradient of CIELAB at scale sigma (chroma at max(sigma, CHROMA_SIGMA), weighted
    CHROMA_WEIGHT): magnitude (delta-E per px) and direction (radians)."""
    Jxx = Jyy = Jxy = 0
    for c in range(3):
        s = sigma if c == 0 else max(sigma, CHROMA_SIGMA)
        w = 1.0 if c == 0 else CHROMA_WEIGHT
        gx = w * ndi.gaussian_filter(lab[..., c], s, order=(0, 1))
        gy = w * ndi.gaussian_filter(lab[..., c], s, order=(1, 0))
        Jxx = Jxx + gx * gx; Jyy = Jyy + gy * gy; Jxy = Jxy + gx * gy
    lam = (Jxx + Jyy) / 2 + np.sqrt(((Jxx - Jyy) / 2) ** 2 + Jxy ** 2)
    return np.sqrt(lam), 0.5 * np.arctan2(2 * Jxy, Jxx - Jyy)


def edge_chains(lab: np.ndarray, sigma: float = 1.0, high: float = 2.0, low: float = 1.0, min_len: int = MIN_CHAIN):
    """A colour Canny: non-maximum suppression across the edge with a parabolic sub-pixel peak, hysteresis (high /
    low in delta-E per px at this sigma: a crisp step of ~5.5 dE passes `high`), thinning, then the edge pixels
    linked into chains (junctions cut). Returns a list of dicts {pts: N x 2 sub-pixel x y, closed}."""
    from skimage.filters import apply_hysteresis_threshold
    from skimage.morphology import thin
    mag, th = colour_gradient(lab, sigma)
    H, W = mag.shape
    c, s = np.cos(th), np.sin(th)
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    m1 = _bilinear(mag[..., None], xx + c, yy + s)[..., 0]
    m0 = _bilinear(mag[..., None], xx - c, yy - s)[..., 0]
    nms = (mag >= m1) & (mag >= m0) & (mag > low)
    den = m0 - 2 * mag + m1
    off = np.zeros_like(mag)
    np.divide(0.5 * (m0 - m1), den, out=off, where=np.abs(den) > 1e-9)
    off = np.clip(off, -0.5, 0.5)
    sx = xx + off * c; sy = yy + off * s
    e = apply_hysteresis_threshold(np.where(nms, mag, 0), low, high)
    e = thin(e)
    e[:2, :] = e[-2:, :] = False; e[:, :2] = e[:, -2:] = False
    e = _clean_skeleton(e)
    chains = _link(e, sx, sy, min_len)
    edge_chains.last_map = e
    return chains, mag


def _nbcount(e):
    k = np.ones((3, 3), np.float32); k[1, 1] = 0
    return cv2.filter2D(e.astype(np.float32), -1, k, borderType=cv2.BORDER_CONSTANT).round().astype(int)


def _clean_skeleton(e, spur: int = 3):
    """Make the skeleton a clean 8-connected curve set: drop staircase-corner pixels (a pixel whose only two
    neighbours are 4-neighbours of it and diagonal to each other), then prune spurs up to `spur` px."""
    e = e.copy()
    for _ in range(2):
        cnt = _nbcount(e)
        Np = np.zeros_like(e); Sp = np.zeros_like(e); Wp = np.zeros_like(e); Ep = np.zeros_like(e)
        Np[1:] = e[:-1]; Sp[:-1] = e[1:]; Wp[:, 1:] = e[:, :-1]; Ep[:, :-1] = e[:, 1:]
        red = e & (cnt == 2) & ((Np & Ep) | (Np & Wp) | (Sp & Ep) | (Sp & Wp))
        # never remove two touching redundant pixels in one pass
        red &= ~ndi.binary_dilation(red, structure=np.array([[0, 1, 0], [1, 0, 1], [0, 1, 0]]))
        e &= ~red
    for _ in range(spur):
        cnt = _nbcount(e)
        junction_near = ndi.binary_dilation(e & (cnt >= 3), iterations=spur + 1)
        ends = e & (cnt == 1) & junction_near
        if not ends.any():
            break
        e &= ~ends
    return e


_NB = [(-1, -1), (-1, 0), (-1, 1), (0, -1), (0, 1), (1, -1), (1, 0), (1, 1)]


def _link(e: np.ndarray, sx: np.ndarray, sy: np.ndarray, min_len: int):
    k = np.ones((3, 3), np.uint8); k[1, 1] = 0
    cnt = cv2.filter2D(e.astype(np.uint8), -1, k, borderType=cv2.BORDER_CONSTANT)
    junction = e & (cnt >= 3)
    # a junction pixel and its 8 neighbours that are junctions too form one blob: cut them all
    path = e & ~junction
    lab_, n = ndi.label(path, structure=np.ones((3, 3)))
    chains = []
    if n == 0:
        return chains
    objs = ndi.find_objects(lab_)
    for i, sl in enumerate(objs, 1):
        if sl is None:
            continue
        sub = lab_[sl] == i
        ys, xs = np.nonzero(sub)
        if len(xs) < min_len:
            continue
        ys = ys + sl[0].start; xs = xs + sl[1].start
        pix = {(int(y), int(x)) for y, x in zip(ys, xs)}
        # neighbour counts inside the component
        def nbrs(p):
            return [(p[0] + dy, p[1] + dx) for dy, dx in _NB if (p[0] + dy, p[1] + dx) in pix]
        ends = [p for p in pix if len(nbrs(p)) == 1]
        start = min(ends) if ends else min(pix)
        order = [start]; seen = {start}; cur = start
        while True:
            nb = [q for q in nbrs(cur) if q not in seen]
            if not nb:
                break
            # prefer 4-neighbours (straight steps) to keep the walk on the curve
            nb.sort(key=lambda q: abs(q[0] - cur[0]) + abs(q[1] - cur[1]))
            cur = nb[0]; order.append(cur); seen.add(cur)
        if len(order) < min_len:
            continue
        closed = (not ends) and len(order) == len(pix) and max(abs(order[0][0] - order[-1][0]), abs(order[0][1] - order[-1][1])) <= 1
        oy = np.array([p[0] for p in order]); ox = np.array([p[1] for p in order])
        pts = np.stack([sx[oy, ox], sy[oy, ox]], 1).astype(np.float64)
        chains.append({'pts': pts, 'closed': bool(closed), 'rid': -1})
    return chains


# ---------------------------------------------------------------- geometry along a curve


def _runs(mask: np.ndarray, closed: bool, start: int = 0):
    n = len(mask)
    if not mask.any():
        return []
    if mask.all():
        return [np.r_[start:n, 0:start]] if closed else [np.arange(n)]
    order = np.r_[np.where(~mask)[0][0]:n, 0:np.where(~mask)[0][0]] if closed else np.arange(n)
    runs, cur = [], []
    for i in order:
        if mask[i]:
            cur.append(i)
        elif cur:
            runs.append(np.array(cur)); cur = []
    if cur:
        runs.append(np.array(cur))
    return runs


def _tls_dev(Q: np.ndarray):
    m = Q.mean(0)
    X = Q - m
    w, V = np.linalg.eigh(X.T @ X)
    nrm = V[:, 0]
    return np.abs(X @ nrm)


def _split_line(P, idx, min_len):
    """Douglas-Peucker: keep a run if all its points lie within LINE_DEV of one (total least squares) line, else
    split it where it strays farthest from its chord."""
    if len(idx) < min_len:
        return []
    Q = P[idx]
    dev = _tls_dev(Q)
    if dev.max() <= max(LINE_DEV, 0.006 * len(idx)):
        return [idx]
    a, b = Q[0], Q[-1]
    ab = b - a
    L = np.hypot(*ab)
    if L < 1e-6:
        dch = np.hypot(*(Q - a).T)
    else:
        dch = np.abs((Q[:, 0] - a[0]) * ab[1] - (Q[:, 1] - a[1]) * ab[0]) / L
    k = int(np.argmax(dch[1:-1])) + 1
    return _split_line(P, idx[:k + 1], min_len) + _split_line(P, idx[k:], min_len)


def _kasa(Q: np.ndarray):
    m = Q.mean(0)
    x, y = (Q - m).T
    A = np.stack([x, y, np.ones_like(x)], 1)
    b = -(x * x + y * y)
    sol, *_ = np.linalg.lstsq(A, b, rcond=None)
    D, E, F = sol
    cx, cy = -D / 2, -E / 2
    r = math.sqrt(max(cx * cx + cy * cy - F, 1e-12))
    dev = np.abs(np.hypot(x - cx, y - cy) - r)
    return r, dev


def _split_arc(P, idx, min_len):
    if len(idx) < min_len:
        return []
    r, dev = _kasa(P[idx])
    if dev.max() <= ARC_DEV and ARC_RMIN <= r <= ARC_RMAX:
        turn = math.degrees(len(idx) / r)
        return [idx] if turn >= ARC_TURN else []
    k = len(idx) // 2   # binary subdivision: robust where an arc meets a line or turns the other way
    return _split_arc(P, idx[:k + 1], min_len) + _split_arc(P, idx[k:], min_len)


def curve_geometry(pts: np.ndarray, closed: bool, req: float | None = None):
    """Classify every point of one curve (resampled every 1 px of arc): straight run, compass arc, free; corners
    with their interior angles; curvature; orientation. Returns a dict, or None for curves under MIN_CHAIN."""
    P0 = resample(pts, closed, 1.0)
    n = len(P0)
    if n < MIN_CHAIN:
        return None
    P = smooth_pts(P0, closed, 1.0)
    # straight runs: windows within LINE_TOL of a line, merged, then every run within LINE_DEV of one line
    lr = line_rms(P, closed, LINE_H)
    cov = _cover(np.nan_to_num(lr, nan=9) <= LINE_TOL, LINE_H, closed)
    straight = np.zeros(n, bool); pieces = []
    for run in _runs(cov, closed, int(np.nanargmax(np.nan_to_num(lr, nan=-1)))):
        for piece in _split_line(P, run, 2 * LINE_H + 1):
            straight[piece] = True; pieces.append(piece)
    long_ = np.zeros(n, bool)
    for run in _runs(straight, closed):
        if len(run) >= LONG_RUN:
            long_[run] = True
    # compass arcs (constant curvature, not straight)
    r, rg = circle_fit(P, closed, ARC_H)
    lr2 = line_rms(P, closed, ARC_H)
    cand = ((np.nan_to_num(rg, nan=9) <= ARC_TOL) & (np.nan_to_num(r, nan=0) >= ARC_RMIN) &
            (np.nan_to_num(r, nan=1e9) <= ARC_RMAX) & (np.nan_to_num(lr2, nan=0) > LINE_TOL))
    cov = _cover(cand, ARC_H, closed) & ~straight
    arc = np.zeros(n, bool)
    for run in _runs(cov, closed, int(np.nanargmax(np.nan_to_num(rg, nan=-1)))):
        for piece in _split_arc(P, run, 2 * ARC_H + 1):
            arc[piece] = True
    # tangent, curvature (sigma 2), orientation
    P2 = smooth_pts(P0, closed, 2.0)
    d = (np.roll(P2, -1, 0) - np.roll(P2, 1, 0)) / 2 if closed else np.gradient(P2, axis=0)
    th = np.arctan2(d[:, 1], d[:, 0])
    dth = np.angle(np.exp(1j * (np.roll(th, -1) - np.roll(th, 1)))) / 2 if closed else np.gradient(np.unwrap(th))
    kappa = dth
    ori = np.degrees(np.mod(th, math.pi))
    dax = np.minimum.reduce([np.abs(ori), np.abs(ori - 90), np.abs(ori - 180)])
    # corners
    d1 = (np.roll(P, -1, 0) - np.roll(P, 1, 0)) / 2 if closed else np.gradient(P, axis=0)
    t1 = np.unwrap(np.arctan2(d1[:, 1], d1[:, 0]))
    cps = _corners(P, t1, closed)
    cmask = np.zeros(n, bool)
    for (ci, _, _, _) in cps:
        idx = np.arange(ci - 5, ci + 6)
        idx = idx % n if closed else idx[(idx >= 0) & (idx < n)]
        cmask[idx] = True
    segs = []
    for piece in pieces:
        Q = P[piece]
        m = Q.mean(0); w, V = np.linalg.eigh((Q - m).T @ (Q - m)); u = V[:, 1]
        t = (Q - m) @ u
        segs.append((*(m + u * t.min()), *(m + u * t.max()), float(len(piece))))
    return {'P': P, 'n': n, 'straight': straight, 'long': long_, 'arc': arc, 'kappa': kappa, 'axis': dax <= AXIS_TOL,
            'corners': [(x, y, a) for (_, x, y, a) in cps], 'cmask': cmask, 'segs': segs, 'closed': closed}


def _corners(P, th, closed):
    n = len(P)
    a, b = CORNER_A, CORNER_B
    if n < 2 * b + 3:
        return []
    if closed:
        Ta = _wrapdiff(th, a)
        Tb = _wrapdiff(th, b)
    else:
        Ta = np.zeros(n); Tb = np.zeros(n)
        Ta[a:n - a] = th[2 * a:] - th[:n - 2 * a]
        Tb[b:n - b] = th[2 * b:] - th[:n - 2 * b]
    A = np.degrees(np.abs(Ta)); B = np.degrees(np.abs(Tb))
    cand = (A >= CORNER_MIN) & (A >= CORNER_CONC * np.maximum(B, 1e-6)) & (B >= 0.8 * CORNER_MIN)
    out = []
    if not cand.any():
        return out
    taken = np.zeros(n, bool)
    for i in np.argsort(-A):
        if not cand[i] or taken[i]:
            continue
        idx = np.arange(i - 6, i + 7)
        idx = idx % n if closed else idx[(idx >= 0) & (idx < n)]
        taken[idx] = True
        out.append((int(i), float(P[i, 0]), float(P[i, 1]), float(180.0 - min(B[i], 179.0))))
    return out


def _wrapdiff(th, b):
    """theta(i+b) - theta(i-b) on a closed contour, continuous across the seam (the loop's total turn added)."""
    n = len(th)
    total = th[-1] - th[0] + _seam(th)
    ext = np.concatenate([th[-b:] - total, th, th[:b] + total])
    return ext[2 * b:2 * b + n] - ext[:n]


def _seam(th):
    return float(np.angle(np.exp(1j * (th[0] - th[-1]))))


def geometry_totals(curves, req_of=None):
    """Length-weighted totals over a list of curve_geometry() results."""
    t = {'len': 0.0, 'straight': 0.0, 'long': 0.0, 'arc': 0.0, 'axis': 0.0, 'axis_straight': 0.0, 'n_corners': 0}
    angles = []; kv = []; segs = []
    for g in curves:
        if g is None:
            continue
        t['len'] += g['n']; t['straight'] += g['straight'].sum(); t['long'] += g['long'].sum(); t['arc'] += g['arc'].sum()
        t['axis'] += g['axis'].sum(); t['axis_straight'] += (g['axis'] & g['straight']).sum()
        t['n_corners'] += len(g['corners']); angles += [a for (_, _, a) in g['corners']]
        req = g.get('req') or max(g['n'] / (2 * math.pi), 6.0)
        k = g['kappa'][~g['cmask'] & ~g['straight']] * req
        kv.append(k); segs += g['segs']
    L = max(t['len'], 1.0)
    ang = np.array(angles)
    kv = np.concatenate(kv) if kv else np.zeros(0)
    out = {'length': L, 'straight': t['straight'] / L, 'long': t['long'] / L, 'arc': t['arc'] / L,
           'primitive': (t['straight'] + t['arc']) / L, 'free': 1 - (t['straight'] + t['arc']) / L,
           'axis': t['axis'] / L, 'axis_of_straight': t['axis_straight'] / max(t['straight'], 1),
           'corners_per_100px': 100 * t['n_corners'] / L, 'n_corners': t['n_corners'],
           'right_angle': float(((ang >= 83) & (ang <= 97)).mean()) if len(ang) else float('nan'),
           'corner_angle_iqr': float(np.subtract(*np.percentile(ang, [75, 25]))) if len(ang) >= 4 else float('nan'),
           'curv_var': float(np.var(kv)) if len(kv) else float('nan'),
           'parallel': parallel_share(segs) if len(segs) >= 2 else float('nan')}
    return out, ang


# ----------------------------------------------------------------------------------------------------------------
# edge profiles: the 10-90 % width and the step across each boundary


def _bilinear(img: np.ndarray, x: np.ndarray, y: np.ndarray) -> np.ndarray:
    H, W = img.shape[:2]
    x = np.clip(x, 0, W - 1.001); y = np.clip(y, 0, H - 1.001)
    x0 = np.floor(x).astype(int); y0 = np.floor(y).astype(int)
    fx = (x - x0)[..., None]; fy = (y - y0)[..., None]
    a = img[y0, x0]; b = img[y0, x0 + 1]; c = img[y0 + 1, x0]; d = img[y0 + 1, x0 + 1]
    return a * (1 - fx) * (1 - fy) + b * fx * (1 - fy) + c * (1 - fx) * fy + d * fx * fy


def edge_profiles(lab: np.ndarray, contours, every: float = 4.0, reach: float = 20.0, side_frac: float = 0.4,
                  min_step: float = 4.0, max_points: int = 1500, edge_map: np.ndarray | None = None):
    """For points every `every` px along the curves: sample the CIELAB profile across the edge, out to `reach` px on
    each side or to 85 % of the way to the next edge of `edge_map` on that side (whichever is nearer: in a dense
    drawing, windows and mullions, the profile never runs into the neighbouring edge), three parallel lines averaged.
    The two sides' colours are the means over the outer `side_frac` of each half; the profile is projected on their
    difference (on lightness alone where the step is mostly value: the codec halves chroma resolution) and fitted
    with an erf: the 10-90 % width = 2.563 sigma. Returns arrays (x, y, step dE, width px, fit rms, kind, ridge):
    kind 0 = step edge, 1 = busy (not one clean step: texture, or no room between edges), 2 = no edge (step <
    min_step and no ridge), 3 = a thin line (no step, a ridge of >= 6 dE: a joint, a bar, a wire)."""
    H, W = lab.shape[:2]
    pts = []; nrm = []; cid = []
    for ci, c in enumerate(contours):
        P = smooth_pts(resample(c['pts'], c['closed'], 1.0), c['closed'], 1.5)
        if len(P) < 8:
            continue
        d = np.gradient(P, axis=0)
        nn = np.stack([-d[:, 1], d[:, 0]], 1)
        nn /= np.maximum(np.hypot(nn[:, 0], nn[:, 1]), 1e-9)[:, None]
        k = max(int(every), 1)
        sel = np.arange(k // 2, len(P), k)
        pts.append(P[sel]); nrm.append(nn[sel]); cid.append(np.full(len(sel), ci))
    if not pts:
        return None
    pts = np.concatenate(pts); nrm = np.concatenate(nrm); cid = np.concatenate(cid)
    if len(pts) > max_points:
        sel = np.linspace(0, len(pts) - 1, max_points).astype(int)
        pts = pts[sel]; nrm = nrm[sel]; cid = cid[sel]
    # room on each side: up to the crop's border and to the next edge
    ks = np.arange(1, int(reach) + 1, dtype=float)
    room = np.full((len(pts), 2), reach)
    for si, sgn in enumerate((-1.0, 1.0)):
        X = pts[:, 0:1] + sgn * nrm[:, 0:1] * ks[None]
        Y = pts[:, 1:2] + sgn * nrm[:, 1:2] * ks[None]
        out_ = (X < 1) | (X > W - 2) | (Y < 1) | (Y > H - 2)
        hit = out_.copy()
        if edge_map is not None:
            xi = np.clip(np.round(X).astype(int), 0, W - 1); yi = np.clip(np.round(Y).astype(int), 0, H - 1)
            em = edge_map[yi, xi] & (ks[None] >= 2.5)
            hit |= em
        first = np.where(hit.any(1), np.argmax(hit, 1), len(ks))
        room[:, si] = np.minimum(reach, np.where(hit.any(1), ks[np.minimum(first, len(ks) - 1)] * np.where(out_[np.arange(len(pts)), np.minimum(first, len(ks) - 1)], 1.0, 0.85), reach))
    t = np.arange(-reach, reach + 0.01, 0.5)
    tan = np.stack([nrm[:, 1], -nrm[:, 0]], 1)
    prof = 0
    for off in (-1.0, 0.0, 1.0):
        X = np.clip(pts[:, 0:1] + nrm[:, 0:1] * t[None] + tan[:, 0:1] * off, 0, W - 1.001)
        Y = np.clip(pts[:, 1:2] + nrm[:, 1:2] * t[None] + tan[:, 1:2] * off, 0, H - 1.001)
        prof = prof + _bilinear(lab, X, Y)
    prof = prof / 3.0   # (N, T, 3)
    N = len(pts)
    widths = np.full(N, np.nan); rms = np.full(N, np.nan); kind = np.zeros(N, int)
    step = np.zeros(N); ridge = np.zeros(N)
    for i in range(N):
        lo, hi = room[i, 0], room[i, 1]
        if min(lo, hi) < 3.0:
            kind[i] = 1
            continue
        m = (t >= -lo) & (t <= hi)
        tt = t[m]; pr = prof[i, m]
        left = pr[tt <= -lo * (1 - side_frac)].mean(0); right = pr[tt >= hi * (1 - side_frac)].mean(0)
        dv = right - left
        st = float(np.linalg.norm(dv))
        sides = 0.5 * (left + right)
        rd = float(np.linalg.norm(pr[np.abs(tt) <= 1.5] - sides, axis=-1).max())
        step[i] = st; ridge[i] = rd
        if st < min_step:
            kind[i] = 3 if rd >= 6.0 else 2
            continue
        if abs(dv[0]) >= 0.5 * st:
            dv = np.array([dv[0], 0.0, 0.0])
        u = dv / max(np.linalg.norm(dv), 1e-9)
        pp = ((pr - left) @ u) / max(np.linalg.norm(dv), 1e-9)
        w, r = _fit_erf(tt, pp)
        widths[i] = min(w, 2.0 * min(lo, hi) * 1.28) if np.isfinite(w) else w
        rms[i] = r
        if r > 0.12 or pp.max() > 1.6 or pp.min() < -0.6:
            kind[i] = 1
    return {'x': pts[:, 0], 'y': pts[:, 1], 'step': step, 'width': widths, 'rms': rms, 'kind': kind, 'ridge': ridge,
            'room': room, 'cid': cid}


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
    """Richardson's divider dimension: walk the curve with dividers of each opening r (each step lands exactly r
    from the last, on the curve); D = 1 - slope(log L, log r). 1.0 = a smooth or straight line; natural coastlines
    ~1.1-1.3. Rulers above a tenth of the curve's length are skipped."""
    Q = resample(P, closed, 0.5)
    if closed:
        Q = np.vstack([Q, Q[:1]])
    per = float(np.hypot(*np.diff(Q, axis=0).T).sum())
    rs = [r for r in rulers if r <= per / 10]
    if len(rs) < 3:
        return float('nan')
    Ls = []
    for r in rs:
        cur = Q[0].copy(); k = 1; n = 0; N = len(Q)
        while k < N:
            d = np.hypot(Q[k:, 0] - cur[0], Q[k:, 1] - cur[1])
            hit = np.nonzero(d >= r)[0]
            if len(hit) == 0:
                break
            j = k + int(hit[0])
            a0, a1 = Q[j - 1], Q[j]
            # the point on segment a0-a1 at distance r from cur
            f = a1 - a0; g = a0 - cur
            A = f @ f; B = 2 * f @ g; C = g @ g - r * r
            disc = max(B * B - 4 * A * C, 0.0)
            t = (-B + math.sqrt(disc)) / (2 * A) if A > 1e-12 else 1.0
            t = min(max(t, 0.0), 1.0)
            cur = a0 + t * f; n += 1; k = j
        rem = float(np.hypot(*(Q[-1] - cur)))
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
    """Shares of boundary samples: crisp (10-90 % width <= 2 px, and thin drawn lines), firm (2-6), soft (6-16), lost
    (wider than 16 px, or a step under 4 dE with no line), busy (the profile is not one step: texture, two edges close
    together).
    The width shares are also given among the clean steps alone (crisp_of_steps ...)."""
    if prof is None or len(prof['kind']) == 0:
        return {}
    k = prof['kind']; w = prof['width']
    step_ok = k == 0
    lost = (k == 2) | (step_ok & (w > soft))
    crisp_m = (step_ok & (w <= crisp)) | (k == 3)
    firm_m = step_ok & (w > crisp) & (w <= firm)
    soft_m = step_ok & (w > firm) & (w <= soft)
    busy = k == 1
    clean = crisp_m | firm_m | soft_m | lost
    nc = max(int(clean.sum()), 1)
    return {'crisp': float(crisp_m.mean()), 'firm': float(firm_m.mean()), 'soft': float(soft_m.mean()),
            'lost': float(lost.mean()), 'busy': float(busy.mean()), 'line': float((k == 3).mean()), 'n': int(len(k)),
            'crisp_of_clean': float(crisp_m.sum() / nc), 'firm_of_clean': float(firm_m.sum() / nc),
            'soft_of_clean': float(soft_m.sum() / nc), 'lost_of_clean': float(lost.sum() / nc),
            'median_width': float(np.nanmedian(np.where(step_ok, w, np.nan))) if step_ok.any() else float('nan')}


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


# ----------------------------------------------------------------------------------------------------------------
# lost and found ALONG the big masses' boundaries (the notan's outlines, defined even where the edge is lost)


def notan_boundaries(mask: np.ndarray, min_len: int = 40):
    """The 2-value masses' boundaries as sub-pixel contours (marching squares on the lightly blurred mask), the crop's
    border dropped. Unlike a Canny chain, the boundary runs on where its edge is lost, so lost stretches can be seen."""
    H, W = mask.shape
    mb = ndi.gaussian_filter(mask.astype(np.float32), 0.7, mode='nearest')
    out = []
    for c in measure.find_contours(mb, 0.5):
        pts = np.stack([c[:, 1], c[:, 0]], 1)
        closed = bool(np.allclose(c[0], c[-1]))
        for part, cl in _drop_border(pts, closed, W, H):
            if len(part) >= min_len:
                out.append({'pts': part, 'closed': cl})
    return out


def along_boundaries(lab: np.ndarray, every: float = 3.0, reach: float = 28.0, run_min: int = 5):
    """Walk the notan's boundaries and read the edge every `every` px (edge_profiles at the mass scale): FOUND (a clean
    step >= 8 dE whose 10-90 % width is <= 6 px, or a drawn line), SOFT (width 6-16), LOST (width > 16, or a step under
    4 dE: the masses melt), BROKEN (no clean step: dry brush, texture). Returns the shares of boundary length, the share
    of boundary length on outlines that ALTERNATE (a found run and a soft-or-lost run of >= run_min samples each, i.e.
    >= 15 px), and the found <-> soft/lost switches per 1000 px of boundary (runs of >= 3 samples)."""
    mask = notan(lab)
    cons = notan_boundaries(mask)
    if not cons:
        return {}
    prof = edge_profiles(lab, cons, every=every, reach=reach, max_points=10 ** 7)
    if prof is None:
        return {}
    k = prof['kind']; w = np.nan_to_num(prof['width'], nan=99.0); st = prof['step']
    found = ((k == 0) & (w <= 6.0) & (st >= 8.0)) | (k == 3)
    lost = (k == 2) | ((k == 0) & (w > 16.0))
    soft = (k == 0) & ~found & ~lost
    broken = k == 1
    n = len(k)
    total_len = n * every
    alt_len = 0.0; switches = 0
    for ci in np.unique(prof['cid']):
        idx = np.where(prof['cid'] == ci)[0]
        f = found[idx]; sl = (soft | lost)[idx]
        lab_ = np.where(f, 1, np.where(sl, 2, 0))
        runs = []
        cur, ln = lab_[0], 1
        for v in lab_[1:]:
            if v == cur:
                ln += 1
            else:
                runs.append((cur, ln)); cur, ln = v, 1
        runs.append((cur, ln))
        if any(c == 1 and l >= run_min for c, l in runs) and any(c == 2 and l >= run_min for c, l in runs):
            alt_len += len(idx) * every
        sig = [c for c, l in runs if c in (1, 2) and l >= 3]
        switches += sum(1 for a_, b_ in zip(sig, sig[1:]) if a_ != b_)
    return {'found': float(found.mean()), 'soft': float(soft.mean()), 'lost': float(lost.mean()),
            'broken': float(broken.mean()), 'soft_or_lost': float((soft | lost).mean()),
            'alternating': float(alt_len / max(total_len, 1.0)), 'switch_per_1000px': float(switches / max(total_len, 1.0) * 1000),
            'length': float(total_len), 'n_outlines': int(len(cons)), 'mask_light_share': float(mask.mean())}
