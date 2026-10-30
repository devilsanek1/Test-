"""shapes_gen.py: generators for organic silhouettes (shapes.md §4). The reference implementation: numpy, SciPy and
OpenCV only (BSD-3 / BSD-3 / Apache-2.0), every function a pure function of its seed (the same bytes on every run).
Lengths are px of the 1080 x 1920 frame; a shape's size is its equivalent radius R = sqrt(area / pi).

  seeded(seed)                      a numpy Generator from a string seed (sha256, as the paint recipes do)
  loop_noise(n, octaves, seed)      periodic 1-D value noise along a closed outline: octaves = [(wavelength px, amp px)]
  displace(P, octaves, seed, ...)   push a closed outline along its normals: the noise-displaced outline; billow=True
                                    turns one octave into convex bumps with sharp inward cusps (a cumulus)
  ellipse_cluster(...)              a union of jittered ellipses on a size ladder: a cloud or a foliage mass
  billows(...), raster_union(...)   ellipses along a skyline (sizes from a function, overlapping, never kissing)
  cumulus(...)                      towers on a ladder over a tapering skirt, billows in three levels, a flat base
  crown(...)                        a tree crown in three levels (lobes, clumps, small clumps), flat underside, sky gaps
  bank(...)                         a flat cloud bank: humps on a ladder, ends dragged at two rates, sometimes pinched
  hand_cut(corners, seed, ...)      a man-made outline: off-square corners, bowed and broken sides, never parallel
  limb(seed, p0, p1, w0, w1)        a trunk, branch or stem: a bowed centre line, a taper with a root flare, a wobble
  edge_alpha(mask, seed, ...)       lost-and-found edges for a raster piece: found / broken / lost stretches along the
                                    outline by the light and a slow noise; dry-brush teeth along the brush direction
  shade3(cov, seed, ...)            flat lit / body / shade values read from the silhouette itself (a wandering terminator)
  size_ladder(n, seed, ...)         big / medium / small sizes, never two alike
  place(...)                        Poisson-disk placement that never makes tangents, never repeats an interval
  checks: tangents(), parallels(), interval_cv()

Every numeric default comes from the reference measurements (shapes.md §2-3) and is re-measured by
shapes_generators_sheet.py with the same code as the references (shapes_measure.py)."""
from __future__ import annotations

import hashlib
import math

import cv2
import numpy as np
from scipy import ndimage as ndi

# ----------------------------------------------------------------------------------------------------------------
# seeds and noise


def seeded(seed) -> np.random.Generator:
    h = hashlib.sha256(str(seed).encode()).digest()
    return np.random.default_rng(int.from_bytes(h[:8], 'little'))


def _periodic_cubic(vals: np.ndarray, n: int) -> np.ndarray:
    """Catmull-Rom interpolation of k periodic control values to n samples."""
    k = len(vals)
    t = np.arange(n) * k / n
    i = np.floor(t).astype(int)
    f = t - i
    p0 = vals[(i - 1) % k]; p1 = vals[i % k]; p2 = vals[(i + 1) % k]; p3 = vals[(i + 2) % k]
    return 0.5 * ((2 * p1) + (-p0 + p2) * f + (2 * p0 - 5 * p1 + 4 * p2 - p3) * f * f + (-p0 + 3 * p1 - 3 * p2 + p3) * f ** 3)


def loop_noise(n: int, octaves, seed, length: float | None = None) -> np.ndarray:
    """Periodic 1-D value noise on n samples of a loop `length` px long (default n): the sum of octaves, each a
    wavelength (px) and an amplitude (px, the octave's RMS). Value noise, not sines: no octave repeats exactly."""
    L = float(length if length is not None else n)
    r = seeded(seed)
    out = np.zeros(n)
    for (lam, amp) in octaves:
        k = max(3, int(round(L / lam)))
        v = r.uniform(-1, 1, k)
        v -= v.mean()
        o = _periodic_cubic(v, n)
        s = o.std()
        out += (o / s * amp) if s > 1e-9 else 0
    return out


def line_noise(n: int, octaves, seed, length: float | None = None) -> np.ndarray:
    """The same along an open line (no wrap)."""
    L = float(length if length is not None else n)
    r = seeded(seed)
    out = np.zeros(n)
    for (lam, amp) in octaves:
        k = max(3, int(round(L / lam))) + 3
        v = r.uniform(-1, 1, k)
        o = np.interp(np.linspace(1, k - 2, n), np.arange(k), v)
        o = ndi.gaussian_filter1d(o, max(lam * n / L / 4.0, 0.5), mode='nearest')
        o -= o.mean()
        s = o.std()
        out += (o / s * amp) if s > 1e-9 else 0
    return out


def noise2d(shape, cell: float, seed, octaves: int = 3, gain: float = 0.5) -> np.ndarray:
    """Smooth 2-D value noise (bicubic upsampled random grids), fractal over `octaves`, ~unit RMS."""
    H, W = shape
    r = seeded(seed)
    out = np.zeros((H, W), np.float32)
    amp = 1.0; c = cell
    for _ in range(octaves):
        gh = int(math.ceil(H / c)) + 3; gw = int(math.ceil(W / c)) + 3
        g = r.uniform(-1, 1, (gh, gw)).astype(np.float32)
        up = cv2.resize(g, (int(gw * c), int(gh * c)), interpolation=cv2.INTER_CUBIC)
        oy, ox = int(c), int(c)
        out += amp * up[oy:oy + H, ox:ox + W]
        amp *= gain; c /= 2.0
        if c < 1.5:
            break
    return out / max(float(out.std()), 1e-6)


# ----------------------------------------------------------------------------------------------------------------
# outlines


def resample_closed(P: np.ndarray, step: float = 1.0) -> np.ndarray:
    Q = np.vstack([P, P[:1]])
    d = np.hypot(*np.diff(Q, axis=0).T)
    s = np.r_[0, np.cumsum(d)]
    n = max(int(s[-1] / step), 8)
    t = np.linspace(0, s[-1], n, endpoint=False)
    return np.stack([np.interp(t, s, Q[:, 0]), np.interp(t, s, Q[:, 1])], 1)


def normals_closed(P: np.ndarray) -> np.ndarray:
    d = (np.roll(P, -1, 0) - np.roll(P, 1, 0)) / 2
    n = np.stack([d[:, 1], -d[:, 0]], 1)
    n /= np.maximum(np.hypot(n[:, 0], n[:, 1]), 1e-9)[:, None]
    # outward: the signed area tells the winding
    area = 0.5 * np.sum(P[:, 0] * np.roll(P[:, 1], -1) - np.roll(P[:, 0], -1) * P[:, 1])
    return n if area > 0 else -n


def displace(P: np.ndarray, octaves, seed, billow: int | None = None, smooth: float = 0.0,
             amp_at=None) -> np.ndarray:
    """The noise-displaced outline: resample every 1 px, push along the outward normal by loop_noise(octaves).
    billow = index of one octave that becomes |noise| (convex bumps, sharp inward cusps: the cumulus edge).
    amp_at(P, normals) -> per-point factor (e.g. more raggedness on the side away from the light)."""
    Q = resample_closed(P, 1.0)
    n = len(Q)
    N = normals_closed(Q)
    d = np.zeros(n)
    for i, (lam, amp) in enumerate(octaves):
        o = loop_noise(n, [(lam, 1.0)], f'{seed}/o{i}')
        if billow is not None and i == billow:
            o = np.abs(o)
            o = (o - o.mean()) / max(o.std(), 1e-9)
        d += amp * o
    if amp_at is not None:
        d *= amp_at(Q, N)
    out = Q + N * d[:, None]
    if smooth > 0:
        out = np.stack([ndi.gaussian_filter1d(out[:, 0], smooth, mode='wrap'),
                        ndi.gaussian_filter1d(out[:, 1], smooth, mode='wrap')], 1)
    return out


def spectrum_for(R: float, element: str) -> list[tuple[float, float]]:
    """The displacement octaves for a shape of equivalent radius R px, by element (shapes.md §3.2's table, from the
    references' measured outline spectra). Returns [(wavelength px, amplitude px)]."""
    T = SPECTRA[element]
    out = []
    for (lam_rel, amp_rel, lam_min, amp_min) in T:
        lam = max(lam_rel * R, lam_min)
        amp = max(amp_rel * R, amp_min)
        if lam < 2 * math.pi * R:          # an octave longer than the whole outline is not a wiggle
            out.append((lam, amp))
    return out


# per element: (wavelength / R, amplitude / R, min wavelength px, min amplitude px); see shapes.md §3.2
SPECTRA = {
    'cloud': [(1.6, 0.060, 40, 2.0), (0.8, 0.035, 20, 1.2), (0.4, 0.022, 10, 1.0), (0.2, 0.013, 6, 0.8),
              (0.1, 0.007, 4, 0.6)],
    'foliage': [(1.4, 0.070, 30, 2.0), (0.6, 0.045, 14, 1.4), (0.25, 0.025, 7, 1.0), (0.1, 0.012, 4, 0.7)],
    'rock': [(1.8, 0.050, 40, 1.5), (0.7, 0.020, 16, 0.8), (0.25, 0.008, 8, 0.4)],
    'shadow': [(2.0, 0.040, 60, 1.5), (0.8, 0.015, 24, 0.7)],
    'water_edge': [(2.5, 0.030, 80, 1.2), (0.6, 0.010, 20, 0.5)],
}


# ----------------------------------------------------------------------------------------------------------------
# ladders, clusters, crowns


def size_ladder(n: int, seed, top: float = 1.0, ratio=(0.55, 0.8), min_step: float = 0.1) -> np.ndarray:
    """n sizes, biggest first: each the last times U(ratio); two sizes are never within min_step (10 %) of each
    other. Default ratios give the references' measured ladder (neighbouring sizes 0.6-0.75 on average)."""
    r = seeded(seed)
    s = [top]
    while len(s) < n:
        s.append(s[-1] * r.uniform(*ratio))
    s = np.array(s)
    return s


def ellipse_cluster(seed, cx: float, cy: float, width: float, height: float, n: int = 9, kind: str = 'cumulus',
                    aspect=(0.62, 0.9), rot_deg: float = 16.0, overlap=(0.25, 0.45), ss: int = 4):
    """A union of jittered ellipses on a size ladder (a cumulus, a bank, a foliage mass). The biggest ellipse sits
    off-centre (never in the middle: asymmetry), the rest climb its shoulders on a jittered dome; each overlaps its
    neighbour by 25-45 % of the smaller radius (never tangent); widths follow the ladder, aspects and tilts vary.
    kind: 'cumulus' (flat base, billows up), 'bank' (wide, flat, low), 'foliage' (round, notched underside).
    Returns (mask bool H x W of the box [cx-w/2 .. cx+w/2] at 1x, its offset (x0, y0), the ellipses)."""
    r = seeded(seed)
    sizes = size_ladder(n, f'{seed}/ladder', top=1.0, ratio=(0.6, 0.82))
    W, H = width, height
    base = cy + H * 0.5
    ells = []
    # the anchor: the biggest, off-centre by 8-22 % of the width
    side = r.choice([-1, 1])
    ax = cx + side * W * r.uniform(0.08, 0.22)
    if kind == 'bank':
        R0 = H * 0.55
    elif kind == 'foliage':
        R0 = min(W, H) * 0.36
    else:
        R0 = min(W * 0.32, H * 0.55)
    a0 = r.uniform(*aspect)
    ells.append((ax, base - R0 * a0 * (0.85 if kind != 'foliage' else 1.6), R0, R0 * a0, r.uniform(-rot_deg, rot_deg)))
    # the rest: alternate shoulders, climbing toward the top on the anchor's far side less
    for i, s in enumerate(sizes[1:], 1):
        Ri = R0 * s
        ai = r.uniform(*aspect)
        for _ in range(60):
            j = int(r.integers(0, len(ells)))
            px, py, pr, pry, _ = ells[j]
            ang = r.uniform(math.radians(200), math.radians(340)) if kind != 'foliage' else r.uniform(0, 2 * math.pi)
            ov = r.uniform(*overlap)
            dist = pr + Ri - ov * min(pr, Ri)
            x = px + math.cos(ang) * dist * (1.0 if kind != 'bank' else 1.6)
            y = py + math.sin(ang) * dist * (pry / pr)
            if kind in ('cumulus', 'bank') and y + Ri * ai * 0.6 > base:
                y = base - Ri * ai * 0.6
            if abs(x - cx) > W * 0.52 or y < cy - H * 0.55:
                continue
            ells.append((x, y, Ri, Ri * ai, r.uniform(-rot_deg, rot_deg)))
            break
    # raster union at ss x
    x0 = int(math.floor(cx - W * 0.75)); y0 = int(math.floor(cy - H * 0.9))
    w = int(W * 1.5) + 2; h = int(H * 1.6) + 2
    m = np.zeros((h * ss, w * ss), np.uint8)
    for (x, y, rx, ry, rot) in ells:
        cv2.ellipse(m, (int(round((x - x0) * ss)), int(round((y - y0) * ss))),
                    (max(1, int(round(rx * ss))), max(1, int(round(ry * ss)))), rot, 0, 360, 255, -1, cv2.LINE_AA)
    if kind in ('cumulus', 'bank'):
        # a flat base, tilted <= 1.5 deg, cut through the union
        tilt = math.tan(math.radians(r.uniform(-1.5, 1.5)))
        yy, xx = np.mgrid[0:h * ss, 0:w * ss]
        cut = (yy / ss + y0) > (base + (xx / ss + x0 - cx) * tilt)
        m[cut] = 0
    m = cv2.resize(m, (w, h), interpolation=cv2.INTER_AREA) > 127
    return m, (x0, y0), ells


def mask_outline(mask: np.ndarray) -> np.ndarray:
    """The outer outline of the largest component (sub-pixel-ish: cv2 contour of the mask)."""
    cs, _ = cv2.findContours(mask.astype(np.uint8), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
    c = max(cs, key=cv2.contourArea)[:, 0, :].astype(np.float64)
    return c


def fill_outline(P: np.ndarray, shape, ss: int = 4) -> np.ndarray:
    H, W = shape
    m = np.zeros((H * ss, W * ss), np.uint8)
    pts = np.round(P * ss * 16).astype(np.int32)
    cv2.fillPoly(m, [pts], 255, cv2.LINE_AA, shift=4)
    return cv2.resize(m, (W, H), interpolation=cv2.INTER_AREA).astype(np.float32) / 255.0


def guide_dome(cx: float, base: float, width: float, height: float, lean: float = 0.15, squash: float = 2.4,
               n: int = 240) -> np.ndarray:
    """The big shape of a cumulus: a dome on a flat base, its top `lean` of the width off-centre (never symmetric),
    the shoulders a super-ellipse (squash > 2 = fuller shoulders). Closed polygon, base included."""
    t = np.linspace(0, math.pi, n)
    xs = -np.cos(t)
    ys = np.sin(t) ** (2.0 / squash)
    # lean: move the top sideways, more at the top
    xs = xs + lean * 2 * ys ** 2 * (1 - np.abs(xs)) ** 0.5
    top = np.stack([cx + xs * width / 2, base - ys * height], 1)
    return top


def billows(seed, path: np.ndarray, r_of, inset=(0.38, 0.6), spacing=(0.5, 0.82), aspect=(0.72, 0.98),
            levels: int = 2, child=(0.3, 0.55), n_child=(0, 3), arc=(200, 340), inset_of=None, outward=None):
    """Billows along an open path (left to right along the top of a guide): each an ellipse whose size comes from
    r_of(u, rng) (u = 0..1 along the path), set inside the path by `inset` of its radius so its top bulges out,
    the next one a jittered `spacing` of the two radii further on (overlapping, never kissing); adjacent radii are
    never within 10 %. Level 2 puts 0-3 smaller billows on each one's outer arc. Returns [(x, y, rx, ry, rot deg)]."""
    r = seeded(seed)
    d = np.hypot(*np.diff(path, axis=0).T)
    s = np.r_[0, np.cumsum(d)]
    Ltot = s[-1]
    out = []
    pos = 0.0
    last = None
    while pos <= Ltot:
        u = pos / Ltot
        rad = r_of(u, r)
        if last is not None and abs(rad - last) < 0.1 * last:
            rad = last * (1.12 if r.uniform() < 0.5 else 0.88)
        i = min(int(np.searchsorted(s, pos)), len(path) - 1)
        p = path[i]
        tg = path[min(i + 1, len(path) - 1)] - path[max(i - 1, 0)]
        tg = tg / max(np.hypot(*tg), 1e-9)
        nrm = np.array([tg[1], -tg[0]])          # outward (path runs left -> right over the top)
        if outward is not None:
            o = p - np.asarray(outward)
            if nrm @ o < 0:
                nrm = -nrm
        elif nrm[1] > 0:
            nrm = -nrm
        ins = inset_of(u, r) if inset_of is not None else r.uniform(*inset)
        c = p - nrm * rad * ins
        asp = r.uniform(*aspect)
        rot = math.degrees(math.atan2(tg[1], tg[0])) + r.uniform(-12, 12)
        out.append((c[0], c[1], rad, rad * asp, rot))
        if levels >= 2:
            for k in range(int(r.integers(n_child[0], n_child[1] + 1))):
                if outward is not None:
                    base_a = math.atan2(nrm[1], nrm[0])
                    a = base_a + math.radians(r.uniform(-55, 55))
                else:
                    a = math.radians(r.uniform(*arc))
                cr = rad * r.uniform(*child)
                q = c + np.array([math.cos(a) * rad, math.sin(a) * rad * asp]) * r.uniform(0.75, 0.95)
                out.append((q[0], q[1], cr, cr * r.uniform(*aspect), r.uniform(-20, 20)))
        nxt = r_of(min(u + 0.05, 1.0), r)
        pos += (rad + nxt) * r.uniform(*spacing)
        last = rad
    return out


def raster_union(ells, box, ss: int = 4, base_cut: float | None = None, poly: np.ndarray | None = None):
    """Fill ellipses (and an optional body polygon) into a mask of box (x0, y0, x1, y1) at ss x, cut below base."""
    x0, y0, x1, y1 = box
    W, H = int(x1 - x0), int(y1 - y0)
    m = np.zeros((H * ss, W * ss), np.uint8)
    if poly is not None:
        pts = np.round((poly - [x0, y0]) * ss * 16).astype(np.int32)
        cv2.fillPoly(m, [pts], 255, cv2.LINE_AA, shift=4)
    for (x, y, rx, ry, rot) in ells:
        cv2.ellipse(m, (int(round((x - x0) * ss * 16)), int(round((y - y0) * ss * 16))),
                    (max(1, int(round(rx * ss * 16))), max(1, int(round(ry * ss * 16)))), rot, 0, 360, 255, -1,
                    cv2.LINE_AA, shift=4)
    if base_cut is not None:
        m[int(round((base_cut - y0) * ss)):, :] = 0
    return cv2.resize(m, (W, H), interpolation=cv2.INTER_AREA) > 127


def _dome(x, c, w, h, p=0.62):
    q = np.clip(np.abs((x - c) / w), 0, 1)
    return h * (1 - q * q) ** p


def cumulus(seed, cx, base, width, height, lean=None, edge=True, towers=None):
    """A cumulus: 2-3 towers of different height and width (a ladder) set off-centre, over a low skirt that runs the
    full width and tapers to the base at two different rates; billows along that skyline (radius ~ local height,
    level-2 billows on the upper arcs, a few level-3 ones toward the light); the body filled under the skyline; a flat
    base tilted <= 1.5 deg; then the cloud spectrum's short octaves (quiet on the base) so no billow stays a compass
    arc. Returns (outline N x 2, R)."""
    r = seeded(seed)
    if lean is None:
        lean = r.uniform(0.02, 0.08) * r.choice([-1, 1])
    side = 1 if lean >= 0 else -1
    nt = towers or int(r.integers(2, 5))
    xs = np.linspace(cx - width * 0.5, cx + width * 0.5, 400)
    hs = size_ladder(nt, f'{seed}/th', ratio=(0.62, 0.9))
    ws = size_ladder(nt, f'{seed}/tw', ratio=(0.62, 0.85))
    prof = np.zeros_like(xs)
    # the main tower off-centre toward the lean, the others alternate sides, never evenly spaced
    pos = [cx + side * width * r.uniform(0.02, 0.1)]
    for i in range(1, nt):
        s_ = -side if i % 2 else side
        pos.append(pos[0] + s_ * width * r.uniform(0.12, 0.22) * (1 + 0.35 * ((i - 1) // 2)))
    for i in range(nt):
        tw = width * 0.3 * ws[i] * r.uniform(0.9, 1.12)
        lim = width * 0.5 - tw * 1.05
        pc = float(np.clip(pos[i], cx - lim, cx + lim))
        prof = np.maximum(prof, _dome(xs, pc, tw, height * 0.78 * hs[i], p=r.uniform(0.45, 0.7)))
    # the skirt: low, the full width, its two ends tapering at different rates
    ta, tb = r.uniform(0.06, 0.14), r.uniform(0.1, 0.22)
    if side < 0:
        ta, tb = tb, ta
    u = (xs - xs[0]) / (xs[-1] - xs[0])
    skirt = height * r.uniform(0.12, 0.2) * np.clip(u / ta, 0, 1) ** 0.6 * np.clip((1 - u) / tb, 0, 1) ** 0.8
    prof = np.maximum(prof, skirt)
    prof = ndi.gaussian_filter1d(prof, 6, mode='nearest')
    g = np.stack([xs, base - prof], 1)
    pmax = prof.max()

    def r_of(uu, rr):
        i = min(int(uu * (len(prof) - 1)), len(prof) - 1)
        h = prof[i] / pmax
        return max(height * 0.2 * (0.38 + 0.62 * h ** 0.9) * rr.uniform(0.75, 1.12), 3.0)

    ells = billows(f'{seed}/b', g, r_of, inset=(0.35, 0.55), spacing=(0.5, 0.72), aspect=(0.75, 0.98),
                     child=(0.28, 0.5), n_child=(0, 2), arc=(210, 330))
    # level 3: a few small billows on the side toward the light (upper arcs), never on the base
    l3 = []
    for (x, y, rx, ry, rot) in ells:
        if rx < height * 0.06 or r.uniform() > 0.45:
            continue
        a = math.radians(r.uniform(215, 325)) + (0.25 if side > 0 else -0.25)
        cr = rx * r.uniform(0.18, 0.3)
        l3.append((x + math.cos(a) * rx * 0.92, y + math.sin(a) * ry * 0.92, cr, cr * r.uniform(0.75, 0.95), 0.0))
    ells = ells + l3
    box = (cx - width, base - height * 1.6, cx + width, base + 4)
    body = np.vstack([g, [[g[-1, 0], base], [g[0, 0], base]]])
    tilt = math.tan(math.radians(r.uniform(-1.2, 1.2)))
    m = raster_union(ells, box, base_cut=None, poly=body)
    yy, xx = np.mgrid[0:m.shape[0], 0:m.shape[1]]
    m &= (yy + box[1]) <= (base + (xx + box[0] - cx) * tilt)
    m = ndi.binary_opening(m, iterations=1)
    lab_, n = ndi.label(m)
    if n > 1:
        sizes = ndi.sum(m, lab_, range(1, n + 1)); m = lab_ == (1 + int(np.argmax(sizes)))
    P = mask_outline(m) + [box[0], box[1]]
    R = math.sqrt(m.sum() / math.pi)
    if edge:
        oct_ = [(lam, amp) for (lam, amp) in spectrum_for(R, 'cloud') if lam <= 0.5 * R]
        quiet_base = lambda Q, N: np.where(N[:, 1] > 0.7, 0.25, 1.0)
        P = displace(P, oct_, f'{seed}/edge', amp_at=quiet_base)
    return P, R


def crown(seed, cx, cy, width, height, lean=None, holes=None):
    """A tree crown in three levels, big / medium / small: a body (a dome wider than tall, its underside flattened);
    3-5 big LOBES on a size ladder around its upper three-quarters (never evenly spaced, the biggest toward the lean);
    2-4 medium CLUMPS on each lobe's outer arc, half sunk in; small clumps on a third of those; the underside left flat
    with 1-3 shallow bites; 1-3 sky holes where lobes meet; then the foliage spectrum's short octaves (quieter under).
    Returns (coverage float H x W of the box, (x0, y0), outline)."""
    r = seeded(seed)
    if lean is None:
        lean = r.uniform(0.04, 0.14) * r.choice([-1, 1])
    side = 1 if lean >= 0 else -1
    x0, y0 = int(cx - width), int(cy - height)
    W, H = int(2 * width), int(2 * height)
    Rw, Rh = width * 0.42, height * 0.36
    bx, by = cx + lean * width * 0.25, cy + height * 0.05
    ells = [(bx, by, Rw * 0.62, Rh * 0.6, r.uniform(-6, 6))]
    nl = int(r.integers(3, 6))
    sizes = size_ladder(nl, f'{seed}/lobes', ratio=(0.6, 0.85))
    # lobe angles over the upper 3/4 (-200 .. 20 deg, 0 = right, -90 = up), uneven gaps, the biggest toward the lean
    span = np.sort(r.uniform(0, 1, nl))
    span = 0.08 + 0.84 * (span - span.min()) / max(span.max() - span.min(), 1e-6) if nl > 1 else np.array([0.5])
    angs = np.radians(-195 + 210 * span)
    order = np.argsort(np.abs(angs - math.radians(-90 + 35 * side)))     # the lobe nearest the leaning top gets the biggest
    lobes = []
    for rank, i in enumerate(order):
        lr = min(Rw, Rh * 1.3) * 0.62 * sizes[rank] * r.uniform(0.9, 1.1)
        a = angs[i] + r.uniform(-0.1, 0.1)
        d = r.uniform(0.62, 0.9)
        lx = bx + math.cos(a) * Rw * d; ly = by + math.sin(a) * Rh * d
        lobes.append((lx, ly, lr, lr * r.uniform(0.72, 0.9), math.degrees(a) + 90 + r.uniform(-10, 10)))
    ells += lobes
    # medium clumps on each lobe's outer arc; small ones on some of those
    for (lx, ly, lr, lry, rot) in lobes:
        out_a = math.atan2(ly - by, lx - bx)
        nm = int(r.integers(2, 5))
        offs = np.sort(r.uniform(-1.0, 1.0, nm))
        for o in offs:
            a = out_a + o * r.uniform(0.7, 1.0)
            mr = lr * r.uniform(0.32, 0.52)
            sink = r.uniform(0.45, 0.75)
            mx = lx + math.cos(a) * (lr - mr * sink); my = ly + math.sin(a) * (lry - mr * sink)
            if my > by + Rh * 0.45:
                continue
            ells.append((mx, my, mr, mr * r.uniform(0.72, 0.92), r.uniform(-20, 20)))
            if r.uniform() < 0.33:
                sa = a + r.uniform(-0.6, 0.6); sr = mr * r.uniform(0.28, 0.42)
                ells.append((mx + math.cos(sa) * (mr - sr * 0.4), my + math.sin(sa) * (mr - sr * 0.4), sr, sr * 0.85, 0.0))
    m = raster_union(ells, (x0, y0, x0 + W, y0 + H))
    # the underside: flattened, a slight lens, with shallow bites
    yy, xx = np.mgrid[0:H, 0:W]
    flat_y = by + Rh * r.uniform(0.42, 0.55) - y0
    lens = flat_y + Rh * 0.12 * (1 - ((xx - (bx - x0)) / (Rw * 1.1)) ** 2).clip(0, 1)
    m &= yy <= lens
    for k in range(int(r.integers(1, 4))):
        bxk = bx - x0 + r.uniform(-0.6, 0.6) * Rw; brk = Rw * r.uniform(0.06, 0.12)
        m &= ~(((xx - bxk) / brk) ** 2 + ((yy - flat_y - brk * 0.3) / (brk * 0.7)) ** 2 <= 1)
    m = ndi.binary_fill_holes(m)
    lab_, n = ndi.label(m)
    if n > 1:
        sizes_ = ndi.sum(m, lab_, range(1, n + 1)); m = lab_ == (1 + int(np.argmax(sizes_)))
    P = mask_outline(m) + [x0, y0]
    R = math.sqrt(m.sum() / math.pi)
    P = displace(P, [o for o in spectrum_for(R, 'foliage') if o[0] <= 0.25 * R], f'{seed}/edge',
                   amp_at=lambda Q, N: np.where(N[:, 1] > 0.6, 0.4, 1.0))
    cov = fill_outline(P - [x0, y0], (H, W))
    # sky holes where two lobes meet, inside the silhouette near its edge
    inside = ndi.distance_transform_edt(cov > 0.5)
    nh = holes if holes is not None else int(r.integers(1, 4))
    pairs = [(lobes[i], lobes[j]) for i in range(len(lobes)) for j in range(i + 1, len(lobes))]
    r.shuffle(pairs)
    made = 0
    for (a_, b_) in pairs:
        if made >= nh:
            break
        hx = (a_[0] + b_[0]) / 2 - x0; hy = (a_[1] + b_[1]) / 2 - y0
        if not (0 <= int(hy) < H and 0 <= int(hx) < W) or not (R * 0.06 < inside[int(hy), int(hx)] < R * 0.3):
            continue
        hr = R * r.uniform(0.05, 0.1)
        aa = np.linspace(0, 2 * math.pi, 96, endpoint=False)
        circ = np.stack([hx + hr * np.cos(aa), hy + hr * r.uniform(0.6, 0.85) * np.sin(aa)], 1)
        hole = displace(circ, [(hr * 1.6, hr * 0.14), (hr * 0.7, hr * 0.07)], f'{seed}/hole{made}')
        cov = np.minimum(cov, 1 - fill_outline(hole, (H, W)))
        made += 1
    return cov, (x0, y0), P


def bank(seed, cx, base, length, height, edge=True, split=None):
    """A flat cloud bank (a dusk deck, stratocumulus): a long thin body whose thickness swells in 2-4 humps on a ladder
    (never one symmetric hump), the two ends dragged thin at different lengths (one 10-30 %, the other 25-50 %), the
    top a row of low billows of varied size, the base nearly level (<= 1 px wobble); sometimes split in two at a thin
    point. Returns (outline N x 2, R) or, when split, the larger piece (the other in .extra)."""
    r = seeded(seed)
    n = 600
    u = np.linspace(0, 1, n)
    xs = cx - length / 2 + u * length
    nh = int(r.integers(2, 5))
    hh = size_ladder(nh, f'{seed}/h', ratio=(0.45, 0.8))
    th = np.zeros(n)
    centres = np.sort(r.uniform(0.15, 0.85, nh))
    for i, c in enumerate(r.permutation(centres)):
        wdt = r.uniform(0.08, 0.2)
        th = np.maximum(th, hh[i] * np.exp(-0.5 * ((u - c) / wdt) ** 2))
    th = 0.25 + 0.75 * th
    ta, tb = r.uniform(0.1, 0.3), r.uniform(0.25, 0.5)
    if r.uniform() < 0.5:
        ta, tb = tb, ta
    env = np.clip(u / ta, 0, 1) ** 1.6 * np.clip((1 - u) / tb, 0, 1) ** 1.2
    th = height * th * env
    if split is None:
        split = r.uniform() < 0.35
    if split:
        uk = r.uniform(0.3, 0.7); wk = r.uniform(0.02, 0.05)
        th = th * (1 - np.exp(-0.5 * ((u - uk) / wk) ** 2)) ** 1.5
    th += height * 0.06 * line_noise(n, [(length * 0.12, 1.0), (length * 0.04, 0.5)], f'{seed}/tn', length=length)
    th = np.where(th < 2.0, 0.0, th)      # a tail ends at 2 px, never as a hairline that twinkles
    below = r.uniform(0.12, 0.22)
    top = np.stack([xs, base - th * (1 - below)], 1)
    bot = np.stack([xs, base + th * below + 0.6 * line_noise(n, [(length * 0.1, 1.0)], f'{seed}/bn', length=length)], 1)
    poly = np.vstack([top, bot[::-1]])

    def r_of(uu, rr):
        k = min(int(uu * (n - 1)), n - 1)
        return max(th[k] * 0.55 * rr.uniform(0.7, 1.2), 1.5)

    ok = th > height * 0.18
    ells = []
    if ok.any():
        i0, i1 = np.where(ok)[0][[0, -1]]
        ells = billows(f'{seed}/b', top[i0:i1 + 1], r_of, inset=(0.55, 0.8), spacing=(0.55, 0.95), aspect=(0.45, 0.7),
                         levels=2, child=(0.25, 0.45), n_child=(0, 1), arc=(220, 320))
    box = (cx - length * 0.6, base - height * 2.2, cx + length * 0.6, base + height)
    m = raster_union(ells, box, poly=poly)
    yy = np.arange(m.shape[0])[:, None] + box[1]
    m &= yy <= base + th.max() * below + 1.5
    lab_, k = ndi.label(m)
    pieces = []
    for i in range(1, k + 1):
        mi = lab_ == i
        if mi.sum() < 30:
            continue
        P = mask_outline(mi) + [box[0], box[1]]
        R = math.sqrt(mi.sum() / math.pi)
        if edge:
            P = displace(P, [o for o in spectrum_for(R, 'cloud') if o[0] <= 0.6 * R],
                           f'{seed}/edge{i}', amp_at=lambda Q, N: np.where(N[:, 1] > 0.6, 0.2, 1.0))
        pieces.append((P, R))
    pieces.sort(key=lambda t: -t[1])
    return pieces


def limb(seed, p0, p1, w0: float, w1: float, bend: float = 0.06, wobble: float = 0.8) -> np.ndarray:
    """A trunk, branch, stem or post drawn by hand: the centre line bows by `bend` of its length (random side), the
    width tapers from w0 at p0 to w1 at p1 with a swell near the base, and both sides wobble +-`wobble` px at
    wavelengths of 12-60 px (a bow alone of radius >= ~300 px still measures straight in 21 px windows: the short
    wobble is what keeps a trunk off the ruler). Natural things only; a man-made post takes wobble 0 and bend <= 0.004.
    Returns a closed outline."""
    r = seeded(seed)
    p0 = np.asarray(p0, float); p1 = np.asarray(p1, float)
    L = float(np.hypot(*(p1 - p0)))
    u_ = (p1 - p0) / max(L, 1e-9); nrm = np.array([-u_[1], u_[0]])
    n = max(int(L / 1.5), 24)
    t = np.linspace(0, 1, n)
    off = bend * L * 4 * t * (1 - t) * r.choice([-1, 1]) + bend * L * 0.6 * np.sin(np.pi * t * r.uniform(1.2, 2.2)) * r.uniform(-1, 1)
    w = w0 + (w1 - w0) * t ** 0.8
    w *= 1 + 0.25 * np.exp(-t / 0.08)                     # the root flare
    c = p0[None] + (t * L)[:, None] * u_[None] + off[:, None] * nrm[None]
    oc = [(max(L * 0.3, 60), 1.0), (24, 0.55), (12, 0.35)]       # knobbly at the short end, never a ruler
    wl = wobble * line_noise(n, oc, f'{seed}/l', length=L) if wobble > 0 else 0
    wr = wobble * line_noise(n, oc, f'{seed}/r', length=L) if wobble > 0 else 0
    left = c + nrm[None] * (w / 2 + wl)[:, None]
    right = c - nrm[None] * (w / 2 + wr)[:, None]
    return np.vstack([left, right[::-1]])


def hand_cut(corners: np.ndarray, seed, side_turn=(0.8, 2.2), bow=(0.003, 0.009), cuts=(1, 3), jog=(0.3, 1.0),
             round_px=(0.6, 2.0)) -> np.ndarray:
    """A man-made outline drawn by hand (closed polygon in, dense polyline out). Every side turns 0.8-2.2 deg about
    its middle (signs chosen so no two sides of the shape end up parallel by accident: opposite sides differ by
    >= 1 deg), so each corner lands 1.5-4 deg off the template; every side bows 0.3-0.9 % of its length and is cut
    into 1-3 straight pieces whose joints jog 0.3-1 px; corners are rounded 0.6-2 px (no razor corner). Never a noise
    wobble: on man-made things a wobble reads melted (techniques.md §3.7)."""
    r = seeded(seed)
    C = np.asarray(corners, float)
    k = len(C)
    mids = [(C[i] + C[(i + 1) % k]) / 2 for i in range(k)]
    dirs = []
    turns = []
    for i in range(k):
        d = C[(i + 1) % k] - C[i]
        sgn = 1 if i % 2 == 0 else -1          # alternate: opposite sides of a quad turn opposite ways
        t = math.radians(r.uniform(*side_turn)) * sgn * r.choice([1, 1, -1])
        if i >= 2 and k == 4 and abs(t - turns[i - 2]) < math.radians(1.0):
            t = turns[i - 2] + math.radians(1.0) * (1 if t >= turns[i - 2] else -1)
        turns.append(t)
        c, s = math.cos(t), math.sin(t)
        dirs.append(np.array([d[0] * c - d[1] * s, d[0] * s + d[1] * c]))

    def meet(p1, d1, p2, d2):
        A = np.array([d1, -d2]).T
        if abs(np.linalg.det(A)) < 1e-9:
            return (p1 + p2) / 2
        t = np.linalg.solve(A, p2 - p1)
        return p1 + d1 * t[0]

    N = np.array([meet(mids[i - 1], dirs[i - 1], mids[i], dirs[i]) for i in range(k)])
    out = []
    for i in range(k):
        a, b = N[i], N[(i + 1) % k]
        L = float(np.hypot(*(b - a)))
        u = (b - a) / max(L, 1e-9); nrm = np.array([-u[1], u[0]])
        bw = r.uniform(*bow) * L * r.choice([-1, 1])
        nc = int(r.integers(cuts[0], cuts[1] + 1))
        ts = np.r_[0.0, np.sort(r.uniform(0.18, 0.82, nc - 1)), 1.0]
        offs = bw * 4 * ts * (1 - ts)
        offs[1:-1] += r.uniform(*jog, nc - 1) * r.choice([-1, 1], nc - 1)
        joints = [a + (b - a) * t + nrm * o for t, o in zip(ts, offs)]
        for j in range(len(joints) - 1):
            p, q = joints[j], joints[j + 1]
            m_ = max(int(np.hypot(*(q - p)) / 1.0), 2)
            for s in np.linspace(0, 1, m_, endpoint=False):
                out.append(p + (q - p) * s)
    P = resample_closed(np.array(out), 0.5)
    sg = r.uniform(*round_px) * 2          # px of arc at 0.5 px spacing
    return np.stack([ndi.gaussian_filter1d(P[:, 0], sg, mode='wrap'), ndi.gaussian_filter1d(P[:, 1], sg, mode='wrap')], 1)


# ----------------------------------------------------------------------------------------------------------------
# lost-and-found edges for a raster piece


def edge_alpha(cov: np.ndarray, seed, light=(-0.7, -0.7), found=0.45, lost=0.25, crisp_w=1.2, soft_w=(4.0, 9.0),
               lost_w=(16.0, 28.0), teeth_px=(2.0, 6.0), teeth_dir_deg: float = 0.0, slow_px: float = 120.0,
               broken=0.3) -> np.ndarray:
    """Re-edge a coverage mask: along its outline, stretches are FOUND (crisp, 10-90 % ~crisp_w px: where the outline
    faces the light), BROKEN (dry-brush teeth 2-6 px deep, >= 2 px wide, stretched along the brush direction) or LOST
    (a 16-28 px fade: away from the light, at the base), chosen by the light and a slow noise along the outline
    (wavelength ~slow_px) so found and lost alternate. Shares: found / lost of the outline; the rest soft or broken.
    Returns alpha float 0-1."""
    H, W = cov.shape
    inside = cov > 0.5
    din = cv2.distanceTransform(inside.astype(np.uint8), cv2.DIST_L2, 5)
    dout = cv2.distanceTransform((~inside).astype(np.uint8), cv2.DIST_L2, 5)
    sd = np.where(inside, din, -dout).astype(np.float32)     # + inside
    # facing: the outward normal from the gradient of the signed distance
    gy, gx = np.gradient(ndi.gaussian_filter(sd, 3.0))
    nx, ny = -gx, -gy
    nl = np.maximum(np.hypot(nx, ny), 1e-6)
    lx, ly = light                                              # the direction toward the light (image y down)
    ll = math.hypot(lx, ly)
    facing = (nx * lx / ll + ny * ly / ll) / nl                 # +1 = the outline faces the light
    slow = noise2d((H, W), slow_px, f'{seed}/slow', octaves=2)
    score = 0.65 * facing + 0.55 * slow                         # high = found, low = lost
    # thresholds by quantile along the outline band so the shares are what was asked
    band = np.abs(sd) < 2.0
    q_lost = np.quantile(score[band], lost) if band.any() else -1
    q_found = np.quantile(score[band], 1 - found) if band.any() else 1
    # width per pixel: found -> crisp, lost -> wide, between -> soft
    t = np.clip((score - q_lost) / max(q_found - q_lost, 1e-6), 0, 1)
    soft = soft_w[0] + (soft_w[1] - soft_w[0]) * (0.5 + 0.5 * noise2d((H, W), slow_px * 0.5, f'{seed}/sw', 1))
    lostw = lost_w[0] + (lost_w[1] - lost_w[0]) * (0.5 + 0.5 * noise2d((H, W), slow_px * 0.5, f'{seed}/lw', 1))
    w = np.where(score <= q_lost, lostw, np.where(score >= q_found, crisp_w, soft))
    w = ndi.gaussian_filter(w, 4.0)
    # dry-brush teeth in the broken stretches: anisotropic noise along the brush direction
    th = math.radians(teeth_dir_deg)
    tn = _aniso_noise((H, W), f'{seed}/teeth', th, along=14.0, across=2.4)
    brk = (np.abs(t - 0.5) < broken) & (score < q_found)
    depth = teeth_px[0] + (teeth_px[1] - teeth_px[0]) * (0.5 + 0.5 * noise2d((H, W), 40, f'{seed}/td', 1))
    sd2 = sd + np.where(brk, np.clip(tn, -1.2, 1.2) * depth, 0.0)
    # erf-like ramp of width w (10-90 %): alpha = Phi(sd2 / sigma), sigma = w / 2.563
    sig = np.maximum(w / 2.563, 0.35)
    from scipy.special import erf
    a = 0.5 * (1 + erf(sd2 / sig / math.sqrt(2)))
    return a.astype(np.float32)


def shade3(cov: np.ndarray, seed, light=(-0.7, -0.7), lz: float = 0.55, scale: float = 8.0, lit_t: float = 0.35,
           shade_t: float = -0.05, wander: float = 0.12, wander_px: float = 60.0, big: float = 0.0, big_w: float = 0.4,
           min_island: float = 0.006):
    """Flat light on a silhouette, in values the clean pen can draw: the shape read as a dome (height = sqrt of the
    distance inside), its normals at the billow scale (`scale` px), Lambert toward `light` (x, y toward the light,
    image y down) lifted by lz; LIT where it faces the light over lit_t, SHADE under shade_t, the body between. A slow
    noise moves both thresholds (+-wander) so the terminator follows the billows and wanders, never a ruler and never a
    crescent along the outline. Returns (lit, shade) coverages (float 0-1, anti-aliased)."""
    inside = (cov > 0.5).astype(np.uint8)
    d = cv2.distanceTransform(inside, cv2.DIST_L2, 5).astype(np.float32)
    L = np.array([light[0], light[1], lz], float); L /= np.linalg.norm(L)

    def lambert(sc, local=0.0):
        h = ndi.gaussian_filter(np.sqrt(d), sc)
        if local > 0:      # the billows' own relief: the height minus its own blur at the mass scale
            h = h - ndi.gaussian_filter(np.sqrt(d), local)
        gy, gx = np.gradient(h)
        k = 1.0 / max(float(np.percentile(np.hypot(gx, gy)[inside > 0], 90)), 1e-6)
        nx, ny, nz = -gx * k, -gy * k, np.ones_like(gx)
        nl = np.sqrt(nx * nx + ny * ny + nz * nz)
        lam_ = (nx * L[0] + ny * L[1] + nz * L[2]) / nl
        return lam_ - float(np.median(lam_[inside > 0]))
    # the billows' own light (`scale`), optionally over the whole mass's light (`big`): each billow its own lit cap
    lam = lambert(scale) if big <= 0 else (1 - big_w) * lambert(scale, local=big) + big_w * lambert(big)
    wob = wander * noise2d(cov.shape, wander_px, f'{seed}/wander', octaves=2)
    lit = np.clip((lam - lit_t - wob) / 0.02 + 0.5, 0, 1).astype(np.float32)
    shade = np.clip((shade_t - wob - lam) / 0.02 + 0.5, 0, 1).astype(np.float32)
    # no specks: islands of light or shade under min_island of the piece's area are dropped (a spot reads as a
    # mistake, not as form), and pinholes in them filled
    area = max(float(inside.sum()), 1.0)
    for m_ in (lit, shade):
        b = (m_ > 0.5) & (inside > 0)
        lab_, n_ = ndi.label(b)
        if n_:
            sizes = ndi.sum(b, lab_, np.arange(1, n_ + 1))
            small = np.isin(lab_, 1 + np.where(sizes < min_island * area)[0])
            m_[ndi.binary_dilation(small, iterations=2)] = 0.0      # with its anti-aliased rim: no ghost ring
        holes = ndi.binary_fill_holes(m_ > 0.5) & ~(m_ > 0.5)
        lab_, n_ = ndi.label(holes)
        if n_:
            sizes = ndi.sum(holes, lab_, np.arange(1, n_ + 1))
            fill = np.isin(lab_, 1 + np.where(sizes < min_island * area)[0])
            m_[ndi.binary_dilation(fill, iterations=2) & (inside > 0)] = 1.0
    lit = ndi.gaussian_filter(lit, 0.6) * cov; shade = ndi.gaussian_filter(shade, 0.6) * cov
    return lit, shade


def _aniso_noise(shape, seed, theta: float, along: float, across: float) -> np.ndarray:
    """Noise stretched along direction theta (teeth that follow the brush, never a random wobble)."""
    H, W = shape
    D = int(math.ceil(math.hypot(H, W))) + 4
    base = noise2d((D, D), 1.0, seed, octaves=1)
    r = seeded(seed)
    g = r.uniform(-1, 1, (int(D / across) + 4, int(D / along) + 4)).astype(np.float32)
    up = cv2.resize(g, (int(g.shape[1] * along), int(g.shape[0] * across)), interpolation=cv2.INTER_CUBIC)[:D, :D]
    M = cv2.getRotationMatrix2D((D / 2, D / 2), -math.degrees(theta), 1.0)
    rot = cv2.warpAffine(up, M, (D, D), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)
    y0 = (D - H) // 2; x0 = (D - W) // 2
    out = rot[y0:y0 + H, x0:x0 + W]
    return out / max(float(out.std()), 1e-6)


# ----------------------------------------------------------------------------------------------------------------
# placement and checks


def place(seed, box, sizes, gap=(0.12, 0.5), overlap=(0.18, 0.4), p_overlap: float = 0.35, tries: int = 400):
    """Place round-ish shapes of the given radii in box (x0, y0, x1, y1): each new one either OVERLAPS an existing one
    by 18-40 % of the smaller radius or keeps a gap of >= 12 % of the smaller radius to all: never the kissing band in
    between (a tangent). Returns [(x, y, r)]."""
    r = seeded(seed)
    x0, y0, x1, y1 = box
    out = []
    for s in sizes:
        for _ in range(tries):
            x = r.uniform(x0 + s, x1 - s); y = r.uniform(y0 + s, y1 - s)
            ok = True; touching = False
            for (px, py, ps) in out:
                d = math.hypot(x - px, y - py) - (s + ps)        # < 0 overlap, > 0 gap
                m = min(s, ps)
                if -overlap[0] * m < d < gap[0] * m:              # the tangent band
                    ok = False; break
                if d < -overlap[1] * m:
                    ok = False; break
                if d <= 0:
                    touching = True
            if ok and (touching or not out or r.uniform() > p_overlap):
                out.append((x, y, s)); break
    return out


def tangents(circles, band=(-0.15, 0.10)) -> list:
    """Pairs whose outlines kiss: the signed gap between them within band x the smaller radius."""
    bad = []
    for i in range(len(circles)):
        for j in range(i + 1, len(circles)):
            (x1, y1, r1), (x2, y2, r2) = circles[i], circles[j]
            d = math.hypot(x1 - x2, y1 - y2) - (r1 + r2)
            if band[0] * min(r1, r2) < d < band[1] * min(r1, r2):
                bad.append((i, j, round(d, 1)))
    return bad


def parallels(segs, ang_tol: float = 3.0, max_dist: float = 40.0, min_overlap: float = 0.5) -> list:
    """Pairs of straight segments (x0, y0, x1, y1) within ang_tol deg of each other, closer than max_dist px and
    overlapping by half the shorter: accidental parallels (designed ones, a window's two jambs, are allowed)."""
    bad = []
    for i in range(len(segs)):
        a = np.array(segs[i], float)
        ua = (a[2:] - a[:2]); La = np.hypot(*ua); ua = ua / max(La, 1e-9)
        for j in range(i + 1, len(segs)):
            b = np.array(segs[j], float)
            ub = (b[2:] - b[:2]); Lb = np.hypot(*ub); ub = ub / max(Lb, 1e-9)
            ang = math.degrees(math.acos(min(1.0, abs(float(ua @ ub)))))
            if ang > ang_tol:
                continue
            nrm = np.array([-ua[1], ua[0]])
            dist = abs(float(((b[:2] + b[2:]) / 2 - a[:2]) @ nrm))
            if dist > max_dist:
                continue
            p = sorted([float((b[:2] - a[:2]) @ ua), float((b[2:] - a[:2]) @ ua)])
            ov = min(La, p[1]) - max(0.0, p[0])
            if ov >= min_overlap * min(La, Lb):
                bad.append((i, j, round(ang, 2), round(dist, 1)))
    return bad


def interval_cv(xs) -> float:
    """CV of the gaps between sorted positions (0 = evenly spaced, a picket fence; the references' rows >= 0.3)."""
    x = np.sort(np.asarray(xs, float))
    g = np.diff(x)
    return float(g.std() / g.mean()) if len(g) >= 2 and g.mean() > 0 else float('nan')


# ----------------------------------------------------------------------------------------------------------------
# lines: sky streaks, joints, hand-ruled edges


def streak(seed, x0: float, x1: float, y: float, thick: float, taper=(0.15, 0.3), sag: float = 0.0,
           waviness: float = 0.25) -> np.ndarray:
    """A sky streak (a thin cloud, a dusk band): a long thin shape whose thickness swells and pinches along it
    (+-35 %), whose two ends taper over 15-30 % of the length at DIFFERENT rates (one end dragged longer), whose
    centre line bows gently (sag px) and wanders (waviness x thick). Never a constant-width ruler bar.
    Returns a closed outline."""
    r = seeded(seed)
    L = x1 - x0
    n = max(int(L), 40)
    u = np.linspace(0, 1, n)
    ta, tb = r.uniform(*taper), r.uniform(*taper) * r.uniform(1.0, 1.8)
    env = np.clip(u / ta, 0, 1) ** 0.8 * np.clip((1 - u) / min(tb, 0.6), 0, 1) ** 1.3
    th = thick * env * (1 + 0.35 * line_noise(n, [(L * 0.25, 1.0), (L * 0.08, 0.5)], f'{seed}/th', length=L) / 1.12)
    th = np.maximum(th, 0)
    cy = y + sag * 4 * u * (1 - u) + thick * waviness * line_noise(n, [(L * 0.4, 1.0)], f'{seed}/c', length=L)
    asym = r.uniform(0.35, 0.65)                           # more of the thickness above or below the centre line
    top = np.stack([x0 + u * L, cy - th * asym], 1)
    bot = np.stack([x0 + u * L, cy + th * (1 - asym)], 1)
    return np.vstack([top, bot[::-1]])


def broken_line(seed, p0, p1, width: float, gaps: float = 0.15, width_var: float = 0.3, bow: float = 0.004,
                fade_ends=(0.05, 0.2)):
    """A drawn line (a paving joint, a mullion, a rail): its width varies +-30 % along it, it bows 0.4 % of its
    length, it breaks into 2-5 pieces with lost gaps (gaps = share of the length lost: 10-25 %), its ends fade over
    5-20 % instead of stopping square. Returns a list of closed outlines (the visible pieces) and their opacities."""
    r = seeded(seed)
    p0 = np.asarray(p0, float); p1 = np.asarray(p1, float)
    L = float(np.hypot(*(p1 - p0)))
    u_ = (p1 - p0) / max(L, 1e-9); nrm = np.array([-u_[1], u_[0]])
    n = max(int(L / 1.5), 20)
    s = np.linspace(0, 1, n)
    off = bow * L * 4 * s * (1 - s) * r.choice([-1, 1])
    w = width * (1 + width_var * line_noise(n, [(max(L * 0.2, 20), 1.0)], f'{seed}/w', length=L) / 1.0)
    w = np.maximum(w, width * 0.35)
    # the gaps: a slow noise thresholded at the requested share
    g = line_noise(n, [(max(L * 0.18, 24), 1.0), (max(L * 0.06, 10), 0.4)], f'{seed}/g', length=L)
    vis = g > np.quantile(g, gaps)
    fa, fb = r.uniform(*fade_ends), r.uniform(*fade_ends)
    alpha = np.clip(s / fa, 0, 1) * np.clip((1 - s) / fb, 0, 1)
    pieces = []
    lab_, k = ndi.label(vis)
    for i in range(1, k + 1):
        idx = np.where(lab_ == i)[0]
        if len(idx) < 3:
            continue
        c = p0[None] + (s[idx, None] * L) * u_[None] + (off[idx, None]) * nrm[None]
        top = c + nrm[None] * (w[idx, None] / 2)
        bot = c - nrm[None] * (w[idx, None] / 2)
        pieces.append((np.vstack([top, bot[::-1]]), float(alpha[idx].mean())))
    return pieces


def vary_rects(seed, rects, size_var=(0.05, 0.12), pos_px=1.5, states=('lit', 'dark', 'sky', 'curtain'),
               max_twin_iou: float = 0.85):
    """Windows (or any repeated man-made element) without a template: each rect's width and height vary by 5-12 %
    (never two alike: a later one that would be a twin of a neighbour is nudged), positions jitter 1.5 px, and each
    takes a state from `states` with no two neighbours in the same state twice running. Returns
    [(x0, y0, x1, y1, state)]."""
    r = seeded(seed)
    out = []
    prev_state = None
    for i, (x0, y0, x1, y1) in enumerate(rects):
        w, h = x1 - x0, y1 - y0
        for _ in range(20):
            sw = 1 + r.uniform(*size_var) * r.choice([-1, 1]); sh = 1 + r.uniform(*size_var) * r.choice([-1, 1])
            nw, nh = w * sw, h * sh
            cx = (x0 + x1) / 2 + r.uniform(-pos_px, pos_px); cy = (y0 + y1) / 2 + r.uniform(-pos_px, pos_px)
            twin = False
            for (a0, b0, a1, b1, _) in out[-3:]:
                ow, oh = a1 - a0, b1 - b0
                iou = min(nw, ow) * min(nh, oh) / max(nw * nh + ow * oh - min(nw, ow) * min(nh, oh), 1e-9)
                if iou > max_twin_iou + 0.1:
                    twin = True
            if not twin:
                break
        st = r.choice([s for s in states if s != prev_state]) if prev_state else r.choice(states)
        prev_state = st
        out.append((cx - nw / 2, cy - nh / 2, cx + nw / 2, cy + nh / 2, st))
    return out
