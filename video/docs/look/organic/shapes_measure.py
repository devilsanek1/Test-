#!/usr/bin/env python3
"""shapes_measure.py: measure WHY our design reads "too square and proper" (shapes.md §1-2).

For every crop of shapes_crops.py (ours and the references, at the phone's width, through the same JPEG codec):
  edges   a colour Canny at sigma 1 (visible edges), linked into sub-pixel chains: straight runs, compass arcs, free
          curves; corners and their angles; curvature variance; axis alignment; parallel pairs; the 10-90 % width of
          each edge (an erf fit across it)
  masses  the same at sigma 3 (the big value masses' boundaries): the share of their length that is crisp, firm,
          soft or lost (the lost-and-found measure)
  regions the visible shapes (Felzenszwalb + a 6 dE merge): mirror symmetry, repetition (how alike neighbouring shapes
          are), spacing regularity, the size ladder (big / medium / small), the divider dimension and the roughness
          spectrum of their outlines (wiggle per octave)

Usage (from video/):  python3 docs/look/organic/shapes_measure.py [--only id,id] [--out DIR]
Writes DIR/shapes_data.json (all numbers) and DIR/overlays/<crop>.png (the edge classes drawn on the crop).
Deterministic: the same numbers on every run. numpy, SciPy, OpenCV, scikit-image only (BSD-3 / Apache-2.0).
"""
from __future__ import annotations

import argparse
import json
import math
import os
import sys
import time

import cv2
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import shapes_lib as S  # noqa: E402
from shapes_crops import CROPS, SRC, GROUP_OF  # noqa: E402

# overlay colours (edge classes): straight runs, compass arcs, free curves; corners: right angles / other
COL_STRAIGHT = (227, 73, 72)    # red
COL_ARC = (237, 161, 0)         # amber
COL_FREE = (27, 175, 122)       # aqua-green
COL_RIGHT = (227, 73, 72)
COL_CORNER = (98, 80, 214)      # violet

_norm_cache: dict[str, np.ndarray] = {}


def norm_src(key: str) -> np.ndarray:
    if key not in _norm_cache:
        bgr = cv2.imread(SRC[key], cv2.IMREAD_COLOR)
        _norm_cache[key] = S.normalize_image(bgr)
    return _norm_cache[key]


def measure_crop(rgb: np.ndarray) -> tuple[dict, dict]:
    """All measures of one crop. Returns (numbers, drawing data)."""
    H, W = rgb.shape[:2]
    lab = S.to_lab(rgb)
    out: dict = {'w': W, 'h': H}
    # ---------------- edges (sigma 1): the visible edges' geometry and sharpness
    chains, _ = S.edge_chains(lab, sigma=1.0, high=2.0, low=1.0)
    emap = S.edge_chains.last_map.copy()
    geos = [S.curve_geometry(c['pts'], c['closed']) for c in chains]
    geos = [g for g in geos if g is not None]
    tot, angles = S.geometry_totals(geos)
    out['edges'] = tot
    out['edge_density'] = tot['length'] / (W * H) * 1000.0        # px of visible edge per 1000 px^2
    out['corner_angles'] = [round(float(a), 1) for a in angles]
    prof = S.edge_profiles(lab, chains, every=3.0, edge_map=emap)
    out['edge_width'] = S.lost_found(prof)
    # clear geometry: edge samples that are straight or compass-arc AND clearly seen (a clean step of >= 12 dE whose
    # 10-90 % width is <= 6 px): "I can see shapes and angles very clearly", as one number
    clear_pts = None
    if prof is not None and len(prof['x']) and geos:
        from scipy.spatial import cKDTree
        GP = np.concatenate([g['P'] for g in geos]); GC = np.concatenate([g['straight'] | g['arc'] for g in geos])
        GS = np.concatenate([g['straight'] for g in geos])
        tree = cKDTree(GP)
        d, idx = tree.query(np.stack([prof['x'], prof['y']], 1))
        ok = d <= 2.5
        geo = GC[idx] & ok; stg = GS[idx] & ok
        clear = (((prof['kind'] == 0) & (np.nan_to_num(prof['width'], nan=99) <= 6.0) & (prof['step'] >= 12.0)) |
                 ((prof['kind'] == 3) & (prof['ridge'] >= 12.0)))
        n = len(clear)
        out['clear'] = {'share': float(clear.mean()), 'geometric_share': float((clear & geo).mean()),
                        'straight_share': float((clear & stg).mean()),
                        'geometric_density': float((clear & geo).sum() * 3.0 / (W * H) * 1e4),
                        'clear_density': float(clear.sum() * 3.0 / (W * H) * 1e4),
                        'of_geometric_clear': float((clear & geo).sum() / max(geo.sum(), 1))}
        # per geometry point: is the nearest profile sample clear? (for the overlay's line weight)
        ptree = cKDTree(np.stack([prof['x'], prof['y']], 1))
        dd, pi_ = ptree.query(GP)
        clear_pts = clear[pi_] & (dd <= 3.0)
    else:
        out['clear'] = {}
    # ---------------- masses (sigma 3): found and lost along the big shapes' boundaries
    mchains, _ = S.edge_chains(lab, sigma=3.0, high=0.75, low=0.4, min_len=24)
    mmap = S.edge_chains.last_map.copy()
    mprof = S.edge_profiles(lab, mchains, every=3.0, reach=28.0, edge_map=mmap)
    out['mass_edges'] = S.lost_found(mprof)
    mgeos = [S.curve_geometry(c['pts'], c['closed']) for c in mchains]
    mgeos = [g for g in mgeos if g is not None]
    mtot, mang = S.geometry_totals(mgeos)
    out['mass_geometry'] = mtot
    out['mass_corner_angles'] = [round(float(a), 1) for a in mang]
    out['mass_edge_len'] = float(sum(len(S.resample(c['pts'], c['closed'], 1.0)) for c in mchains))
    # ---------------- regions: the visible shapes
    labels = S.segment(lab)
    rows = S.region_table(labels)
    out['n_regions'] = len(rows)
    syms = [S.mirror_symmetry(r['image']) for r in rows if r['area'] >= 300 and not r['touches']]
    syms = [s for s in syms if np.isfinite(s)]
    out['symmetry'] = {'median': float(np.median(syms)) if syms else float('nan'), 'n': len(syms),
                       'share_ge_0.9': float(np.mean(np.array(syms) >= 0.9)) if syms else float('nan')}
    rep_med, rep_twins, _ = S.repetition(rows)
    out['repetition'] = {'median_sim': rep_med, 'twins': rep_twins}
    out['spacing_cv'] = S.spacing_cv(rows)
    out['sizes'] = S.size_ladder(rows, W * H)
    # outlines of the regions: divider dimension, roughness spectrum by size class
    req = {r['rid']: r['req'] for r in rows}
    cons = S.region_contours(labels, min_area=60)
    divs, specs = [], {'small': [], 'medium': [], 'large': []}
    for c in cons:
        if not c['closed']:
            continue
        P = c['pts']
        per = float(np.hypot(*np.diff(np.vstack([P, P[:1]]), axis=0).T).sum())
        if per < 80:
            continue
        rq = req.get(c['rid'], per / (2 * math.pi))
        if per >= 150:
            divs.append(S.divider_dimension(P, True))
        cls = 'small' if rq < 15 else 'medium' if rq < 45 else 'large'
        sp = S.roughness_spectrum(P, True)
        specs[cls].append((sp, rq))
    out['divider_D'] = float(np.nanmedian(divs)) if divs else float('nan')
    out['divider_n'] = len(divs)
    out['roughness'] = {}
    for cls, L in specs.items():
        if len(L) < 3:
            continue
        A = np.array([s for s, _ in L]); R = np.array([r for _, r in L])
        out['roughness'][cls] = {'n': len(L), 'req_median': float(np.median(R)),
                                 'band_rms_px': [None if not np.isfinite(v) else round(float(v), 3) for v in np.nanmedian(A, 0)],
                                 'band_rms_rel': [None if not np.isfinite(v) else round(float(v), 4) for v in np.nanmedian(A / R[:, None], 0)]}
    draw = {'geos': geos, 'mgeos': mgeos, 'labels': labels, 'mprof': mprof, 'clear_pts': clear_pts}
    return out, draw


def overlay(rgb: np.ndarray, draw: dict, scale: int = 2) -> np.ndarray:
    """The crop, lightened and greyed, with every visible edge drawn in its class colour and the corners marked."""
    H, W = rgb.shape[:2]
    g = cv2.cvtColor(rgb, cv2.COLOR_RGB2GRAY).astype(np.float32)
    base = (g[..., None] * 0.35 + 255 * 0.65).clip(0, 255).astype(np.uint8).repeat(3, 2)
    big = cv2.resize(base, (W * scale, H * scale), interpolation=cv2.INTER_CUBIC)
    cp = draw.get('clear_pts')
    off = 0
    for gg in draw['geos']:
        P = gg['P'] * scale
        cls = np.where(gg['straight'], 0, np.where(gg['arc'], 1, 2))
        cols = [COL_STRAIGHT, COL_ARC, COL_FREE]
        n = len(P)
        clr = cp[off:off + n] if cp is not None else np.ones(n, bool)
        off += n
        idx = range(n) if gg['closed'] else range(n - 1)
        for i in idx:
            j = (i + 1) % n
            c = cols[cls[i]]
            cv2.line(big, (int(round(P[i, 0])), int(round(P[i, 1]))), (int(round(P[j, 0])), int(round(P[j, 1]))), c,
                     3 if clr[i] else 1, cv2.LINE_AA)
        for (x, y, a) in gg['corners']:
            col = COL_RIGHT if 83 <= a <= 97 else COL_CORNER
            cv2.circle(big, (int(round(x * scale)), int(round(y * scale))), 4, col, -1, cv2.LINE_AA)
            cv2.circle(big, (int(round(x * scale)), int(round(y * scale))), 5, (255, 255, 255), 1, cv2.LINE_AA)
    return big


def _clean(o):
    if isinstance(o, dict):
        return {k: _clean(v) for k, v in o.items()}
    if isinstance(o, (list, tuple)):
        return [_clean(v) for v in o]
    if isinstance(o, (np.floating, float)):
        v = float(o)
        return None if not math.isfinite(v) else round(v, 4)
    if isinstance(o, (np.integer,)):
        return int(o)
    if isinstance(o, np.bool_):
        return bool(o)
    return o


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--only', default='')
    ap.add_argument('--out', default='/tmp/organic/shapes/run')
    args = ap.parse_args()
    only = set(filter(None, args.only.split(',')))
    os.makedirs(os.path.join(args.out, 'overlays'), exist_ok=True)
    os.makedirs(os.path.join(args.out, 'crops'), exist_ok=True)
    path = os.path.join(args.out, 'shapes_data.json')
    data = json.load(open(path)) if os.path.exists(path) else {}
    for (cid, elem, src, x0, y0, x1, y1, what) in CROPS:
        if only and cid not in only:
            continue
        t0 = time.time()
        img = norm_src(src)
        crop = np.ascontiguousarray(img[y0:y1, x0:x1])
        m, draw = measure_crop(crop)
        m.update({'id': cid, 'element': elem, 'src': src, 'group': GROUP_OF(src), 'box': [x0, y0, x1, y1], 'what': what})
        data[cid] = _clean(m)
        cv2.imwrite(os.path.join(args.out, 'crops', cid + '.png'), cv2.cvtColor(crop, cv2.COLOR_RGB2BGR))
        cv2.imwrite(os.path.join(args.out, 'overlays', cid + '.png'), cv2.cvtColor(overlay(crop, draw), cv2.COLOR_RGB2BGR))
        e = m['edges']; w = m['edge_width']; me = m['mass_edges']
        print(f"{cid:16s} {elem:8s} str {e['straight']:.2f} long {e['long']:.2f} arc {e['arc']:.2f} free {e['free']:.2f} "
              f"axis {e['axis']:.2f} c/100 {e['corners_per_100px']:.2f} rt {e['right_angle']:.2f} par {e['parallel']:.2f} "
              f"| w50 {w.get('median_width', float('nan')):.1f} crisp {w.get('crisp_of_clean', float('nan')):.2f} busy {w.get('busy', float('nan')):.2f} "
              f"| mass crisp {me.get('crisp_of_clean', float('nan')):.2f} lost {me.get('lost_of_clean', float('nan')):.2f} "
              f"mstr {m['mass_geometry']['straight']:.2f} marc {m['mass_geometry']['arc']:.2f} "
              f"| sym {m['symmetry']['median']:.2f} rep {m['repetition']['median_sim']:.2f}/{m['repetition']['twins']:.2f} "
              f"sp {m['spacing_cv']:.2f} ladder {m['sizes'].get('ladder', float('nan')):.2f} D {m['divider_D']:.3f} "
              f"({time.time() - t0:.1f}s)", flush=True)
        json.dump(data, open(path, 'w'), indent=1)   # checkpoint after every crop


if __name__ == '__main__':
    main()
