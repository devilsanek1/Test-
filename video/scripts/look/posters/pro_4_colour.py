#!/usr/bin/env python3
"""pro_4_colour.py: the city-poster study, pro-practice researcher 4 (the owner's feeling 4: "very vibrant and
coherently fit together"; why v2 "still feels cheap and lazy"). Report: docs/studies/2026-10-28_city_posters/pro_4_colour.md.
Reusable on any still: a poster, a reference, a film frame, a G4 look-clip frame.

  python3 -I scripts/look/posters/pro_4_colour.py measure --out /tmp/posters-pro_4_colour/m.json   # 7 posters + v2 (+ v1)
  python3 -I scripts/look/posters/pro_4_colour.py measure --images a.png b.png --out x.json          # any stills
  python3 -I scripts/look/posters/pro_4_colour.py sheets --json /tmp/posters-pro_4_colour/m.json --img <dir>
  python3 -I scripts/look/posters/pro_4_colour.py simulate --frame <v2 png> --img <dir>              # the fix ladder
  python3 -I scripts/look/posters/pro_4_colour.py mask                                               # the v2 gamut mask

Run from `video/`. It reuses style.py's helpers (Lab, the UI mask, the poster regions, fonts). Every measure runs at
PHONE SCALE: the image area-averaged to 540 px wide (what a phone shows of a 1080 frame; the posters' JPEG grain
averaged away). The Instagram UI (ui_mask.json) and each poster's title box are left out; v2's caption band (y 290-600 of
1920) is left out (rule 10 makes it one flat field on purpose: it adds ~16 % of flat field to every v2 frame).

The measures (CIE L*a*b* D65; C* chroma, h hue in degrees; dE = dE76):
  value     L* percentiles; shares in L* bands <30 / 30-45 / 45-60 / 60-75 / 75-88 / >=88; the darks (L* < 40): share,
            parts (>= 4 px at 540, ~16 px at 1080), the largest part, where they sit (y centroid, thirds of the content,
            the share of a 4 x 4 grid's cells holding darks).
  chroma    C* percentiles and bands; PASTEL = light AND tinted (L* >= 75 and C* >= 10), PAPER = light and calm
            (L* >= 75, C* < 6); the C*-weighted mean L* (where the colour lives in value); mean C* per L* band;
            accents C* >= 35 (share, parts, largest, top third).
  harmony   the C*-weighted hue histogram (C* >= 6): resultant length R (1 = one hue), entropy (12 bins of 30 deg, bits),
            hue families >= 3 %; the fit to Matsuda's hue templates as used by Cohen-Or et al. 2006 ("Color
            Harmonization", ACM TOG 25(3)): the mean arc distance (deg) by which the image's chroma falls outside the
            best rotation of each template (i 18; V 93.6; L 18 + 79.2 at 90; I 18 + 18 opposite; T 180; Y 93.6 + 18;
            X 93.6 + 93.6), lower = more harmonious; the overall cast (mean a*, b*); the paper tint (median of light,
            calm pixels); the gamut hull in a*b* (98 % of the pixels at C* >= 4): area, centroid.
  fields    EMPTY FIELDS: pixels with no colour edge (gradient of a lightly smoothed Lab under 2 dE/px), connected; the
            share of the frame in fields of >= 2 % each, with and without the field touching the top (the sky);
            INSIDE them: the mottle (L* minus its sigma-12 px local mean, smoothed 1 px: std), its colour (a*b* std), and
            the drift (p95 - p5 of the local mean: a colour shift across one shape).
  colours   distinct flat colours: a 5 px median (texture and hairlines out), Felzenszwalb segments, merged greedily
            (largest first) into colours at dE < 8: how many cover 90 / 95 % of the frame, how many hold >= 0.5 %.
Deterministic. Scratch: /tmp/posters-pro_4_colour (the study brief); nothing writes outside --out / --img.
"""
from __future__ import annotations

import argparse
import json
import math
import subprocess
import sys
from pathlib import Path

import cv2
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage as ndi
from scipy.spatial import ConvexHull

sys.dont_write_bytecode = True
HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
import style as S  # noqa: E402  (the shared helpers: Lab, the UI mask, the poster regions, fonts)

VIDEO = S.VIDEO
REFS = S.REFS
SCR = Path('/tmp/posters-pro_4_colour')
PHONE_W = 540
CAPTION_BAND = (290, 600)  # v2's caption band, in 1920-px frame rows
V2_MASTER = 'deliverables/v2/v2r_G7_master_v1.mp4'
V2_TIMES = [1.0, 3.0, 5.2, 9.0, 14.0, 17.5, 22.0, 26.0, 30.5, 36.0]
V2_SHOT = {1.0: 'S1', 3.0: 'S1', 5.2: 'S1 cover', 9.0: 'S2', 14.0: 'S3', 17.5: 'S4', 22.0: 'S5', 26.0: 'S6',
           30.5: 'S7', 36.0: 'S8'}
V1_MASTER = 'deliverables/v1/php2shell_final.mp4'
V1_TIMES = [20.5, 38.5]
L_EDGES = [0, 30, 45, 60, 75, 88, 101]
C_EDGES = [0, 6, 15, 30, 45, 200]
TEMPLATES = {'i': [(0, 18.0)], 'V': [(0, 93.6)], 'L': [(0, 18.0), (90, 79.2)], 'I': [(0, 18.0), (180, 18.0)],
             'T': [(0, 180.0)], 'Y': [(0, 93.6), (180, 18.0)], 'X': [(0, 93.6), (180, 93.6)]}


# ------------------------------------------------------------------------------------------------------ loading
def pull(master: str, times, tag: str, dest: Path) -> list[Path]:
    dest.mkdir(parents=True, exist_ok=True)
    out = []
    for t in times:
        p = dest / f'{tag}_t{t}.png'
        if not p.exists():
            subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', str(t), '-i', str(VIDEO / master), '-frames:v', '1',
                            str(p)], check=True)
        out.append(p)
    return out


def prep(path: Path, kind: str):
    """-> rgb (phone scale, uint8), valid, lab, scale factor (source px per phone px)."""
    ms = S.load_mask_spec()
    rgb, valid = S.load_image(path, ms)
    H, W = valid.shape
    if kind == 'poster' and path.name in S.POSTERS:
        x0, y0, x1, y1 = S.POSTERS[path.name]['title']
        valid[y0:y1, x0:x1] = False
    elif kind == 'v2':
        a, b = CAPTION_BAND
        s = H / 1920
        valid[int(a * s):int(b * s)] = False
    f = W / PHONE_W
    h2 = int(round(H / f))
    rgb_s = cv2.resize(rgb, (PHONE_W, h2), interpolation=cv2.INTER_AREA)
    valid_s = cv2.resize(valid.astype(np.float32), (PHONE_W, h2), interpolation=cv2.INTER_AREA) > 0.999
    lab = S.srgb_to_lab(rgb_s.astype(np.float64))
    return rgb_s, valid_s, lab, f


def r1(x, n=1):
    return round(float(x), n)


# ------------------------------------------------------------------------------------------------------ measures
def value_plan(lab, valid) -> dict:
    L = lab[..., 0]
    Lv = L[valid]
    nv = valid.sum()
    out = {'pct': {f'p{p}': r1(np.percentile(Lv, p)) for p in (2, 5, 10, 25, 50, 75, 90, 95, 98)}}
    out['bands'] = {f'{a}-{b}': r1(100 * ((Lv >= a) & (Lv < b)).mean()) for a, b in zip(L_EDGES[:-1], L_EDGES[1:])}
    out['groups'] = {'dark_lt45': r1(100 * (Lv < 45).mean()), 'mid_45_75': r1(100 * ((Lv >= 45) & (Lv < 75)).mean()),
                     'light_ge75': r1(100 * (Lv >= 75).mean())}
    dark = (L < 40) & valid
    cc, n = ndi.label(dark, structure=np.ones((3, 3)))
    sizes = ndi.sum(dark, cc, range(1, n + 1)) if n else np.array([0.0])
    rows = np.nonzero(valid.any(1))[0]
    t0, t1 = rows.min(), rows.max()
    yy, xx = np.nonzero(dark)
    d = {'lt40_pct': r1(100 * dark.sum() / nv), 'parts_ge4px': int((sizes >= 4).sum()),
         'largest_pct': r1(100 * sizes.max() / nv, 2)}
    if len(yy):
        rel = (yy - t0) / max(1, t1 - t0)
        d['y_centroid'] = r1(rel.mean(), 2)
        d['thirds_top_mid_bot'] = [r1(100 * ((rel >= a) & (rel < b)).mean(), 0) for a, b in
                                   ((0, 1 / 3), (1 / 3, 2 / 3), (2 / 3, 1.01))]
        # spread: how many cells of a 4 x 4 grid over the content hold darks (>= 0.5 % of the cell)
        Hh, Ww = valid.shape
        cells = 0
        for i in range(4):
            for j in range(4):
                ys = slice(t0 + (t1 - t0) * i // 4, t0 + (t1 - t0) * (i + 1) // 4)
                xs = slice(Ww * j // 4, Ww * (j + 1) // 4)
                vm = valid[ys, xs]
                if vm.sum() and dark[ys, xs].sum() / vm.sum() >= 0.005:
                    cells += 1
        d['grid_cells_with_darks'] = cells
    out['darks'] = d
    return out


def chroma_plan(lab, valid) -> dict:
    L, C, h = S.lch(lab)
    Lv, Cv = L[valid], C[valid]
    nv = valid.sum()
    out = {'pct': {f'p{p}': r1(np.percentile(Cv, p)) for p in (50, 75, 90, 98)}}
    out['bands'] = {f'{a}-{b}': r1(100 * ((Cv >= a) & (Cv < b)).mean()) for a, b in zip(C_EDGES[:-1], C_EDGES[1:])}
    out['pastel_pct'] = r1(100 * ((Lv >= 75) & (Cv >= 10)).mean())
    out['paper_pct'] = r1(100 * ((Lv >= 75) & (Cv < 6)).mean())
    out['C_weighted_L'] = r1((Cv * Lv).sum() / max(1e-9, Cv.sum()))
    byL = {}
    for a, b in ((0, 40), (40, 60), (60, 75), (75, 88), (88, 101)):
        m = (Lv >= a) & (Lv < b)
        byL[f'{a}-{b}'] = r1(Cv[m].mean()) if m.sum() > 50 else None
    out['meanC_by_L'] = byL
    acc = (C >= 35) & valid
    cc, n = ndi.label(acc, structure=np.ones((3, 3)))
    sizes = ndi.sum(acc, cc, range(1, n + 1)) if n else np.array([0.0])
    rows = np.nonzero(valid.any(1))[0]
    t0, t1 = rows.min(), rows.max()
    yy = np.nonzero(acc)[0]
    a = {'share_pct': r1(100 * acc.sum() / nv, 2), 'parts_ge4px': int((sizes >= 4).sum()),
         'largest_pct': r1(100 * sizes.max() / nv, 2)}
    if len(yy):
        rel = (yy - t0) / max(1, t1 - t0)
        a['top_third_pct'] = r1(100 * (rel < 1 / 3).mean(), 0)
    out['accents_c35'] = a
    return out


def _hist360(C, h, valid, cmin=6.0):
    m = valid & (C >= cmin)
    hist = np.bincount(np.floor(h[m]).astype(int) % 360, weights=C[m], minlength=360)
    return hist, m


def template_fit(hist) -> dict:
    hues = np.arange(360) + 0.5
    tot = hist.sum()
    out = {}
    if tot <= 0:
        return {k: None for k in TEMPLATES}
    rots = np.arange(360)
    for name, secs in TEMPLATES.items():
        dist = np.full((360, 360), np.inf)
        for off, width in secs:
            ctr = (rots[:, None] + off) % 360
            diff = np.abs((hues[None, :] - ctr + 180) % 360 - 180)
            dist = np.minimum(dist, np.maximum(0, diff - width / 2))
        cost = (dist * hist[None, :]).sum(1) / tot
        k = int(np.argmin(cost))
        out[name] = {'cost_deg': r1(cost[k], 2), 'rot': k}
    return out


def harmony(lab, valid) -> dict:
    L, C, h = S.lch(lab)
    hist, m = _hist360(C, h, valid)
    tot = hist.sum()
    out = {}
    ang = np.radians(np.arange(360) + 0.5)
    z = (hist * np.exp(1j * ang)).sum() / max(1e-9, tot)
    out['R'] = r1(abs(z), 3)
    out['mean_hue'] = r1(np.degrees(np.angle(z)) % 360, 0)
    h12 = hist.reshape(12, 30).sum(1) / max(1e-9, tot)
    p = h12[h12 > 0]
    out['entropy_bits_12'] = r1(-(p * np.log2(p)).sum(), 2)
    out['families_ge3pct'] = int((h12 >= 0.03).sum())
    out['hue12_pct'] = [r1(100 * v, 0) for v in h12]
    out['templates'] = template_fit(hist)
    nv = valid.sum()
    out['chromatic_pct_c6'] = r1(100 * m.sum() / nv)
    ab = lab[..., 1:][valid]
    ma = ab.mean(0)
    out['cast'] = {'a': r1(ma[0]), 'b': r1(ma[1]), 'C': r1(np.hypot(*ma)), 'h': r1(np.degrees(np.arctan2(ma[1], ma[0])) % 360, 0)}
    pm = valid & (L >= 70) & (C < 12)
    if pm.sum() > 100:
        pa = np.median(lab[pm][:, 1:], 0)
        out['paper_tint'] = {'a': r1(pa[0]), 'b': r1(pa[1]), 'C': r1(np.hypot(*pa)), 'h': r1(np.degrees(np.arctan2(pa[1], pa[0])) % 360, 0),
                             'share_pct': r1(100 * pm.sum() / nv)}
        # do the calm pixels share one lean? (R of their hues, C* 2-12)
        cm = pm & (C >= 2)
        if cm.sum() > 100:
            zz = np.exp(1j * np.radians(h[cm])).mean()
            out['paper_tint']['lean_R'] = r1(abs(zz), 2)
    # the gamut hull (98 % of the pixels at C* >= 4), a*b* bins of 2
    g = valid & (C >= 4)
    if g.sum() > 200:
        a_, b_ = lab[..., 1][g], lab[..., 2][g]
        H2, xe, ye = np.histogram2d(a_, b_, bins=[np.arange(-80, 82, 2), np.arange(-80, 102, 2)])
        flat = H2.ravel()
        order = np.argsort(-flat)
        cum = np.cumsum(flat[order]) / flat.sum()
        keep = order[:int(np.searchsorted(cum, 0.98)) + 1]
        ii, jj = np.unravel_index(keep, H2.shape)
        pts = np.stack([xe[ii] + 1, ye[jj] + 1], -1)
        if len(pts) >= 3:
            hull = ConvexHull(pts)
            poly = pts[hull.vertices]
            out['gamut'] = {'area': r1(hull.volume, 0), 'centroid': [r1(poly[:, 0].mean()), r1(poly[:, 1].mean())],
                            'max_C': r1(np.hypot(poly[:, 0], poly[:, 1]).max())}
    return out


def _local_mean(x, m, sigma):
    mf = m.astype(np.float32)
    num = cv2.GaussianBlur((x * mf).astype(np.float32), (0, 0), sigma)
    den = cv2.GaussianBlur(mf, (0, 0), sigma)
    return num / np.maximum(den, 1e-6)


def fields(lab, valid, grad_thr=2.0, big=0.02) -> dict:
    g = cv2.GaussianBlur(lab.astype(np.float32), (0, 0), 0.7)
    gx = cv2.Sobel(g, cv2.CV_32F, 1, 0, ksize=3) / 8
    gy = cv2.Sobel(g, cv2.CV_32F, 0, 1, ksize=3) / 8
    G = np.sqrt((gx ** 2 + gy ** 2).sum(-1))
    edge = ndi.binary_dilation((G > grad_thr) | ~valid, iterations=1)
    flat = ~edge & valid
    cc, n = ndi.label(flat)
    nv = valid.sum()
    sizes = ndi.sum(flat, cc, range(1, n + 1)) if n else np.array([])
    rows = np.nonzero(valid.any(1))[0]
    top = rows.min()
    top_ids = set(np.unique(cc[top:top + 4])) - {0}
    big_ids = [i + 1 for i, s in enumerate(sizes) if s >= big * nv]
    out = {'edge_free_pct': r1(100 * flat.sum() / nv), 'big_fields_n': len(big_ids)}
    bigm = np.isin(cc, big_ids)
    skym = np.isin(cc, [i for i in big_ids if i in top_ids])
    out['big_fields_pct'] = r1(100 * bigm.sum() / nv)
    out['big_fields_below_sky_pct'] = r1(100 * (bigm & ~skym).sum() / nv)
    # variation inside the big fields (area-weighted)
    L = lab[..., 0].astype(np.float32)
    mot, motc, drift, w = [], [], [], []
    for i in big_ids:
        m = cc == i
        core = ndi.binary_erosion(m, iterations=3)
        if core.sum() < 200:
            continue
        res = []
        for c in range(3):
            x = lab[..., c].astype(np.float32)
            lm = _local_mean(x, m, 12)
            r = x - lm
            r = _local_mean(r, m, 1.0)
            res.append(r[core])
            if c == 0:
                drift.append(np.percentile(lm[core], 95) - np.percentile(lm[core], 5))
        mot.append(res[0].std())
        motc.append(math.hypot(res[1].std(), res[2].std()))
        w.append(core.sum())
    if w:
        w = np.array(w, float)
        out['mottle_L_std'] = r1((np.array(mot) * w).sum() / w.sum(), 2)
        out['mottle_ab_std'] = r1((np.array(motc) * w).sum() / w.sum(), 2)
        out['drift_L'] = r1((np.array(drift) * w).sum() / w.sum(), 2)
    out['_map'] = (cc, big_ids, sorted(top_ids))
    return out


def distinct_colours(rgb_s, valid, de=8.0) -> dict:
    from skimage.segmentation import felzenszwalb
    med = cv2.medianBlur(rgb_s, 5)
    seg = felzenszwalb(med, scale=150, sigma=0.5, min_size=20)
    lab = S.srgb_to_lab(med.astype(np.float64))
    ids = seg[valid]
    n = int(seg.max()) + 1
    area = np.bincount(ids, minlength=n).astype(float)
    means = np.stack([np.bincount(ids, weights=lab[..., k][valid], minlength=n) for k in range(3)], -1) / np.maximum(area, 1)[:, None]
    order = [i for i in np.argsort(-area) if area[i] > 0]
    cs, ca = [], []
    for i in order:
        m = means[i]
        if cs:
            cm = np.array(cs) / np.array(ca)[:, None]
            d = np.linalg.norm(cm - m, axis=1)
            j = int(np.argmin(d))
            if d[j] < de:
                cs[j] = cs[j] + m * area[i]
                ca[j] += area[i]
                continue
        cs.append(m * area[i])
        ca.append(area[i])
    ca = np.array(ca)
    o = np.argsort(-ca)
    sh = ca[o] / ca.sum()
    cum = np.cumsum(sh)
    cols = (np.array(cs)[o] / ca[o][:, None])
    return {'n90': int(np.searchsorted(cum, 0.90) + 1), 'n95': int(np.searchsorted(cum, 0.95) + 1),
            'n_ge05pct': int((sh >= 0.005).sum()), 'largest_pct': r1(100 * sh[0]),
            'top3_pct': r1(100 * sh[:3].sum()),
            'top': [{'hex': S.hexc(c), 'pct': r1(100 * s)} for c, s in zip(cols[:12], sh[:12])]}


def measure(path: Path, kind: str) -> dict:
    rgb_s, valid, lab, f = prep(path, kind)
    fl = fields(lab, valid)
    fl.pop('_map')
    return {'file': path.name, 'kind': kind, 'value': value_plan(lab, valid), 'chroma': chroma_plan(lab, valid),
            'harmony': harmony(lab, valid), 'fields': fl, 'colours': distinct_colours(rgb_s, valid)}


# ------------------------------------------------------------------------------------------------------ summary
KEYS = [  # (label, path in the json, higher-is-poster-like?)
    ('L* p5', ('value', 'pct', 'p5')), ('L* p25', ('value', 'pct', 'p25')), ('L* p50', ('value', 'pct', 'p50')),
    ('L* p95', ('value', 'pct', 'p95')), ('dark <45 %', ('value', 'groups', 'dark_lt45')),
    ('mid 45-75 %', ('value', 'groups', 'mid_45_75')), ('light >=75 %', ('value', 'groups', 'light_ge75')),
    ('L*<40 %', ('value', 'darks', 'lt40_pct')), ('dark parts', ('value', 'darks', 'parts_ge4px')),
    ('dark grid cells /16', ('value', 'darks', 'grid_cells_with_darks')),
    ('C* p50', ('chroma', 'pct', 'p50')), ('C* p90', ('chroma', 'pct', 'p90')),
    ('pastel % (L>=75,C>=10)', ('chroma', 'pastel_pct')), ('paper % (L>=75,C<6)', ('chroma', 'paper_pct')),
    ('C*-weighted L*', ('chroma', 'C_weighted_L')), ('meanC L 40-60', ('chroma', 'meanC_by_L', '40-60')),
    ('meanC L 75-88', ('chroma', 'meanC_by_L', '75-88')),
    ('accent C>=35 %', ('chroma', 'accents_c35', 'share_pct')), ('accent parts', ('chroma', 'accents_c35', 'parts_ge4px')),
    ('hue R', ('harmony', 'R')), ('hue entropy bits', ('harmony', 'entropy_bits_12')),
    ('hue families', ('harmony', 'families_ge3pct')), ('tmpl V cost', ('harmony', 'templates', 'V', 'cost_deg')),
    ('tmpl X cost', ('harmony', 'templates', 'X', 'cost_deg')), ('tmpl Y cost', ('harmony', 'templates', 'Y', 'cost_deg')),
    ('cast C', ('harmony', 'cast', 'C')), ('paper tint C', ('harmony', 'paper_tint', 'C')),
    ('gamut area', ('harmony', 'gamut', 'area')),
    ('edge-free %', ('fields', 'edge_free_pct')), ('big fields %', ('fields', 'big_fields_pct')),
    ('big fields below sky %', ('fields', 'big_fields_below_sky_pct')), ('mottle L std', ('fields', 'mottle_L_std')),
    ('mottle ab std', ('fields', 'mottle_ab_std')), ('drift L', ('fields', 'drift_L')),
    ('colours n90', ('colours', 'n90')), ('colours n95', ('colours', 'n95')), ('colours >=0.5%', ('colours', 'n_ge05pct')),
    ('largest colour %', ('colours', 'largest_pct')),
]


def get(d, path):
    for k in path:
        if d is None:
            return None
        d = d.get(k) if isinstance(d, dict) else None
    return d


def summary(J: dict) -> list[dict]:
    rows = []
    P = [m for m in J['items'] if m['kind'] == 'poster']
    V = [m for m in J['items'] if m['kind'] == 'v2']
    V1 = [m for m in J['items'] if m['kind'] == 'v1']
    for label, path in KEYS:
        p = np.array([get(m, path) for m in P if get(m, path) is not None], float)
        v = np.array([get(m, path) for m in V if get(m, path) is not None], float)
        v1 = np.array([get(m, path) for m in V1 if get(m, path) is not None], float)
        if not len(p) or not len(v):
            continue
        half = max(1e-6, (p.max() - p.min()) / 2)
        gap = (np.median(v) - np.median(p)) / half
        overlap = not (v.max() < p.min() or v.min() > p.max())
        rows.append({'metric': label, 'posters': [r1(p.min(), 2), r1(np.median(p), 2), r1(p.max(), 2)],
                     'v2': [r1(v.min(), 2), r1(np.median(v), 2), r1(v.max(), 2)],
                     'v1': [r1(x, 2) for x in v1] if len(v1) else None,
                     'gap_halfranges': r1(gap, 2), 'v2_median_in_poster_range': bool(p.min() <= np.median(v) <= p.max()),
                     'ranges_overlap': overlap})
    return rows


def cmd_measure(a) -> None:
    items = []
    if a.images:
        for p in a.images:
            items.append(measure(Path(p), 'image'))
    else:
        for name in S.POSTERS:
            items.append(measure(REFS / name, 'poster'))
            print('measured', name, file=sys.stderr)
        for p in pull(V2_MASTER, V2_TIMES, 'v2', SCR / 'frames'):
            m = measure(p, 'v2')
            m['shot'] = V2_SHOT[float(p.stem.split('_t')[1])]
            items.append(m)
            print('measured', p.name, file=sys.stderr)
        for p in pull(V1_MASTER, V1_TIMES, 'v1', SCR / 'frames'):
            items.append(measure(p, 'v1'))
    J = {'items': items}
    if not a.images:
        J['summary'] = summary(J)
    Path(a.out).parent.mkdir(parents=True, exist_ok=True)
    Path(a.out).write_text(json.dumps(J, indent=1, default=float))
    if 'summary' in J:
        print(f"{'metric':28s} {'posters min/med/max':>24s} {'v2 min/med/max':>24s} {'gap':>6s} in-range")
        for r in J['summary']:
            print(f"{r['metric']:28s} {str(r['posters']):>24s} {str(r['v2']):>24s} {r['gap_halfranges']:6.2f} "
                  f"{'yes' if r['v2_median_in_poster_range'] else 'NO'}{'' if r['ranges_overlap'] else ' (no overlap)'}")
    print('wrote', a.out)


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest='cmd', required=True)
    m = sub.add_parser('measure')
    m.add_argument('--images', nargs='*')
    m.add_argument('--out', default=str(SCR / 'm.json'))
    m.set_defaults(fn=cmd_measure)
    a = ap.parse_args()
    a.fn(a)


if __name__ == '__main__':
    main()
