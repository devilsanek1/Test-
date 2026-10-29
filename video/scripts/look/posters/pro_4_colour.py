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
    # a masked band across the sky (v2's caption band): the field right under it is the same sky (the horizon bands)
    rv = valid.mean(1) > 0.5
    for y in range(top + 1, len(rv)):
        if rv[y] and not rv[y - 1]:
            top_ids |= set(np.unique(cc[y:y + 4])) - {0}
            break
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



# ------------------------------------------------------------------------------------------------------ the v2 gamut mask
# A gamut mask (Gurney, Color and Light, 2010; Gurney Journey "Gamut Masking Method", 2011-09) built around Canal Mint's
# roles, in CIE LCh: the most chroma a fill may carry at each hue. Three lobes (warm terracotta-gold, canal teal-mint,
# slate-plum), olive (h 95-118) held to near-neutral (the owner's never-olive rule), leaf sage (h 130-165) at C* <= 18-32, the pop alone
# outside (<= 3 % of the frame: the sun disc). The VALUE-CHROMA envelope scales it by lightness: lights stay calm paper.
MASK_HUE = [(0, 28), (20, 40), (35, 52), (60, 50), (85, 44), (95, 7), (118, 7), (130, 18), (150, 22), (165, 32),
            (185, 38), (205, 24), (240, 18), (270, 26), (300, 26), (330, 24), (360, 28)]


def mask_cmax(h):
    hs = np.array([a for a, _ in MASK_HUE], float)
    cs = np.array([c for _, c in MASK_HUE], float)
    return np.interp(np.asarray(h, float) % 360, hs, cs)


def envelope(L):
    """The value-chroma envelope: the share of the hue mask a fill may use at lightness L* (1 in the mids)."""
    return np.interp(np.asarray(L, float), [0, 15, 72, 80, 88, 96, 101], [0.7, 0.8, 1.0, 0.55, 0.3, 0.22, 0.2])


def mask_report(lab, valid) -> dict:
    L, C, h = S.lch(lab)
    lim = mask_cmax(h) * envelope(L)
    over = valid & (C > lim + 1.0)
    pop = over & (C >= 50)
    return {'outside_pct': r1(100 * over.sum() / valid.sum(), 1), 'outside_not_pop_pct': r1(100 * (over & ~pop).sum() / valid.sum(), 1),
            'hue_only_outside_pct': r1(100 * (valid & (C > mask_cmax(h) + 1.0)).sum() / valid.sum(), 1)}


def cmd_mask(a) -> None:
    import re
    src = (VIDEO / 'src/v2r/palette.ts').read_text()
    blk = src[src.index('export const CM = {'):src.index('};', src.index('export const CM = {'))]
    rows = []
    for m in re.finditer(r"(\w+): '(#[0-9A-Fa-f]{6})'", blk):
        k, hx = m.groups()
        L, C, h = S.lch(S.hex_lab(hx))
        lim = float(mask_cmax(h) * envelope(L))
        rows.append((k, hx, r1(L), r1(C), r1(h, 0), r1(lim), 'OUT' if C > lim + 1 else ''))
    for r in rows:
        print('%-12s %s L %5.1f C %5.1f h %4.0f  limit %5.1f %s' % r)
    J = json.loads(Path(a.json).read_text()) if a.json and Path(a.json).exists() else None
    out = {'roles': rows}
    for kind, paths in (('poster', [REFS / n for n in S.POSTERS]), ('v2', pull(V2_MASTER, V2_TIMES, 'v2', SCR / 'frames'))):
        res = []
        for p in paths:
            _, valid, lab, _ = prep(p, kind)
            res.append(mask_report(lab, valid))
        out[kind] = res
        print(kind, 'outside the mask x envelope %:', [r['outside_pct'] for r in res],
              '| not the pop:', [r['outside_not_pop_pct'] for r in res], '| hue mask only:', [r['hue_only_outside_pct'] for r in res])
    Path(SCR / 'mask.json').write_text(json.dumps(out, indent=1, default=float))


# ------------------------------------------------------------------------------------------------------ sheets
INK = (34, 30, 28)
MUTED = (110, 104, 98)
PAPER = (250, 247, 242)
VGREYS = [38, 82, 122, 162, 204, 242]


def value_map(lab, valid):
    L = lab[..., 0]
    idx = np.digitize(L, L_EDGES[1:-1])
    g = np.array(VGREYS, np.uint8)[idx]
    out = np.stack([g, g, g], -1)
    out[~valid] = (214, 196, 214)
    return out


def role_map(rgb_s, lab, valid):
    L, C, h = S.lch(lab)
    g = np.array(VGREYS, np.uint8)[np.digitize(L, L_EDGES[1:-1])].astype(np.float32)
    out = np.stack([g, g, g], -1) * 0.55 + 0.45 * 180
    pastel = (L >= 75) & (C >= 10)
    paper = (L >= 75) & (C < 6)
    soft = (L >= 75) & (C >= 6) & (C < 10)
    acc = C >= 35
    out[pastel] = (243, 150, 178)
    out[soft] = (236, 214, 224)
    out[paper] = (255, 255, 255)
    out[acc] = rgb_s[acc]
    out[~valid] = (214, 196, 214)
    return out.astype(np.uint8)


def fit_h(arr, h):
    im = Image.fromarray(arr) if isinstance(arr, np.ndarray) else arr
    return im.resize((max(1, int(round(im.width * h / im.height))), h), Image.LANCZOS)


def sheet_value_chroma(J, out_dir: Path) -> None:
    picks = [('01_singapore.jpg', 'poster', 'Singapore'), ('04_buenos_aires.jpg', 'poster', 'Buenos Aires'),
             ('05_cape_town.jpg', 'poster', 'Cape Town'), ('07_kyoto.jpg', 'poster', 'Kyoto'),
             ('v2_t5.2.png', 'v2', 'v2 S1 cover 5.2 s'), ('v2_t9.0.png', 'v2', 'v2 S2 9.0 s'),
             ('v2_t17.5.png', 'v2', 'v2 S4 17.5 s'), ('v2_t26.0.png', 'v2', 'v2 S6 26.0 s')]
    byname = {m['file']: m for m in J['items']}
    Hrow = 400
    cols = []
    for fn, kind, title in picks:
        p = REFS / fn if kind == 'poster' else SCR / 'frames' / fn
        rgb_s, valid, lab, _ = prep(p, kind)
        shown = rgb_s.copy()
        shown[~valid] = (shown[~valid] * 0.3 + 150).astype(np.uint8)
        m = byname[fn]
        cols.append((title, [fit_h(shown, Hrow), fit_h(value_map(lab, valid), Hrow), fit_h(role_map(rgb_s, lab, valid), Hrow)], m))
    gap = 14
    W = sum(c[1][0].width for c in cols) + gap * (len(cols) + 1)
    top = 64
    H = top + 3 * (Hrow + 34) + 170
    im = Image.new('RGB', (W, H), PAPER)
    d = ImageDraw.Draw(im)
    d.text((gap, 10), 'Value plan and where the colour lives: four posters vs four v2 frames (phone scale; UI, title and caption band masked)',
           fill=INK, font=S.font(24, True))
    d.text((gap, 38), 'row 1 the frame; row 2 value map (L* <30 / 30-45 / 45-60 / 60-75 / 75-88 / >=88); row 3 colour jobs: '
           'PINK = pastel (L*>=75, C*>=10), white = calm paper (L*>=75, C*<6), own colour = accents (C*>=35), grey = the rest by value',
           fill=MUTED, font=S.font(16))
    x = gap
    for title, ims, m in cols:
        y = top
        for k, tile in enumerate(ims):
            im.paste(tile, (x, y))
            if k == 0:
                d.text((x, y + Hrow + 4), title, fill=INK, font=S.font(18, True))
            y += Hrow + 34
        v, c, fl = m['value'], m['chroma'], m['fields']
        lines = [f"L* p5 {v['pct']['p5']:.0f}  p25 {v['pct']['p25']:.0f}  p50 {v['pct']['p50']:.0f}",
                 f"dark <45: {v['groups']['dark_lt45']:.0f} %  ({v['darks']['parts_ge4px']} pieces)",
                 f"pastel {c['pastel_pct']:.0f} %  paper {c['paper_pct']:.0f} %",
                 f"C*-weighted L* {c['C_weighted_L']:.0f}",
                 f"accents C*>=35: {c['accents_c35']['share_pct']:.1f} %",
                 f"empty fields below sky {fl['big_fields_below_sky_pct']:.0f} %"]
        for i, t in enumerate(lines):
            d.text((x, y + 2 + 22 * i), t, fill=INK if i in (0, 2) else MUTED, font=S.font(15))
        x += ims[0].width + gap
    S.save_sheet(im, out_dir / 'pro_4_colour_value_chroma.jpg')


def _pool(kind_paths, fn):
    acc = None
    for p, kind in kind_paths:
        rgb_s, valid, lab, _ = prep(p, kind)
        r = fn(rgb_s, lab, valid)
        acc = r if acc is None else [a + b for a, b in zip(acc, r)]
    return acc


def _lc_hist(rgb_s, lab, valid):
    L, C, h = S.lch(lab)
    m = valid & (C < 60)
    li = np.clip(L[m].astype(int), 0, 99)
    ci = np.clip((C[m] * 2).astype(int), 0, 119)
    w = 1.0 / m.sum()
    cnt = np.zeros((100, 120))
    np.add.at(cnt, (li, ci), w)
    col = np.zeros((100, 120, 3))
    for k in range(3):
        np.add.at(col[..., k], (li, ci), rgb_s[m][:, k] * w)
    return [cnt, col]


def _ab_hist(rgb_s, lab, valid):
    a, b = lab[..., 1], lab[..., 2]
    m = valid
    ai = np.clip(((a[m] + 60) / 1.0).astype(int), 0, 139)
    bi = np.clip(((b[m] + 60) / 1.0).astype(int), 0, 139)
    w = 1.0 / m.sum()
    cnt = np.zeros((140, 140))
    np.add.at(cnt, (bi, ai), w)
    col = np.zeros((140, 140, 3))
    for k in range(3):
        np.add.at(col[..., k], (bi, ai), rgb_s[m][:, k] * w)
    return [cnt, col]


def _density_image(cnt, col, scale):
    meanc = col / np.maximum(cnt[..., None], 1e-12)
    dens = np.log10(np.maximum(cnt / cnt.sum(), 1e-7))
    alpha = np.clip((dens + 6.0) / 4.0, 0, 1)[..., None]
    img = PAPER_ARR = np.array(PAPER, float)[None, None, :] * (1 - alpha) + meanc * alpha
    img = np.clip(img, 0, 255).astype(np.uint8)
    return Image.fromarray(img).resize((img.shape[1] * scale[0], img.shape[0] * scale[1]), Image.NEAREST)


def sheet_maps(out_dir: Path) -> None:
    posters = [(REFS / n, 'poster') for n in S.POSTERS]
    v2 = [(p, 'v2') for p in pull(V2_MASTER, V2_TIMES, 'v2', SCR / 'frames')]
    lcP, lcV = _pool(posters, _lc_hist), _pool(v2, _lc_hist)
    abP, abV = _pool(posters, _ab_hist), _pool(v2, _ab_hist)
    sx, sy = 5, 6  # L-C: C* 0-60 (120 half-unit bins) -> 600 px; L* 0-100 -> 600 px
    pw = 620
    W = 2 * pw + 3 * 40 + 2 * 600
    H = 900
    im = Image.new('RGB', (W, H), PAPER)
    d = ImageDraw.Draw(im)
    d.text((40, 12), 'Where the colour lives (L* against C*, pooled: 7 posters | 10 v2 frames) and the gamut (a* b*, with the proposed Canal Mint mask)',
           fill=INK, font=S.font(24, True))
    d.text((40, 42), 'Each cell shows the mean colour of its pixels; opacity = log density. Boxes: PASTEL (L*>=75, C*>=10), PAPER (L*>=75, C*<6), '
           'ACCENT (C*>=35), DARK (L*<40).', fill=MUTED, font=S.font(16))
    for k, ((cnt, col), name) in enumerate(((lcP, '7 posters'), (lcV, 'v2, 10 frames'))):
        x0, y0 = 40 + k * (600 + 40), 110
        tile = _density_image(cnt[::-1], col[::-1], (sx, sy))  # L* up
        im.paste(tile, (x0, y0))
        def P(C, L):
            return (x0 + C * 10, y0 + (100 - L) * 6)
        d.rectangle([P(0, 100), P(60, 0)], outline=MUTED)
        d.rectangle([P(10, 100), P(60, 75)], outline=(214, 60, 110), width=3)
        d.rectangle([P(0, 100), P(6, 75)], outline=(60, 110, 200), width=3)
        d.line([P(35, 100), P(35, 0)], fill=(230, 120, 30), width=2)
        d.line([P(0, 40), P(60, 40)], fill=(80, 80, 80), width=2)
        for c in (0, 10, 20, 30, 40, 50, 60):
            d.text((P(c, 0)[0] - 6, P(c, 0)[1] + 4), str(c), fill=MUTED, font=S.font(14))
        for L in (0, 20, 40, 60, 80, 100):
            d.text((x0 - 30, P(0, L)[1] - 8), str(L), fill=MUTED, font=S.font(14))
        d.text((x0, y0 - 28), f'{name}: L* (up) vs C* (right)', fill=INK, font=S.font(18, True))
        d.text((P(11, 99)[0] + 4, P(11, 99)[1] + 2), 'PASTEL', fill=(214, 60, 110), font=S.font(15, True))
        d.text((P(0, 74)[0] + 2, P(0, 74)[1] + 2), 'PAPER', fill=(60, 110, 200), font=S.font(15, True))
        d.text((P(36, 70)[0], P(36, 70)[1]), 'ACCENT', fill=(230, 120, 30), font=S.font(15, True))
        d.text((P(45, 39)[0], P(45, 39)[1] + 2), 'DARK', fill=(80, 80, 80), font=S.font(15, True))
    # a*b*: 140 bins of 1 unit (-60..80) -> 4 px each = 560 px
    import re
    src = (VIDEO / 'src/v2r/palette.ts').read_text()
    blk = src[src.index('export const CM = {'):src.index('};', src.index('export const CM = {'))]
    roles = {k: hx for k, hx in re.findall(r"(\w+): '(#[0-9A-Fa-f]{6})'", blk)}
    show = ['sky', 'stucco', 'paving', 'brick', 'brickDeep', 'water', 'hero', 'anchor', 'pop', 'leafGold', 'sage', 'pipBody', 'shadeWarm', 'paneUnlit']
    for k, ((cnt, col), name) in enumerate(((abP, '7 posters'), (abV, 'v2 + the mask'))):
        x0, y0 = 40 + 2 * 640 + k * (600 + 20), 110
        tile = _density_image(cnt[::-1], col[::-1], (4, 4))  # b* up
        im.paste(tile, (x0, y0))
        def Q(a, b):
            return (x0 + (a + 60) * 4, y0 + (80 - b) * 4)
        d.rectangle([Q(-60, 80), Q(80, -60)], outline=MUTED)
        d.line([Q(-60, 0), Q(80, 0)], fill=(200, 196, 190))
        d.line([Q(0, -60), Q(0, 80)], fill=(200, 196, 190))
        for r in (20, 40, 60):
            d.ellipse([Q(-r, r), Q(r, -r)], outline=(215, 210, 205))
        d.text((x0, y0 - 28), f'{name}: a* (right) vs b* (up); rings C* 20 / 40 / 60', fill=INK, font=S.font(18, True))
        # the mask polygon (mids: envelope 1)
        hh = np.arange(0, 361, 3)
        cm = mask_cmax(hh)
        pts = [Q(c * math.cos(math.radians(t)), c * math.sin(math.radians(t))) for t, c in zip(hh, cm)]
        d.line(pts + [pts[0]], fill=(30, 30, 30), width=3)
        if k == 1:
            for nm in show:
                lab_ = S.hex_lab(roles[nm])
                px = Q(lab_[1], lab_[2])
                d.ellipse([px[0] - 9, px[1] - 9, px[0] + 9, px[1] + 9], fill=roles[nm], outline=(0, 0, 0))
                d.text((px[0] + 11, px[1] - 9), nm, fill=INK, font=S.font(14))
        d.text((x0 + 6, y0 + 566), 'black line: the proposed hue mask (max C* per hue, in the mids)', fill=MUTED, font=S.font(14))
    S.save_sheet(im, out_dir / 'pro_4_colour_maps.jpg')


def _best_flat_window(lab, valid, y_min, y_max=None, win=28):
    g = cv2.GaussianBlur(lab.astype(np.float32), (0, 0), 0.7)
    gx = cv2.Sobel(g, cv2.CV_32F, 1, 0, ksize=3) / 8
    gy = cv2.Sobel(g, cv2.CV_32F, 0, 1, ksize=3) / 8
    G = np.sqrt((gx ** 2 + gy ** 2).sum(-1))
    flat = (G < 2.0) & valid
    ii = cv2.integral(flat.astype(np.uint8))
    H, W = flat.shape
    y_max = H - win if y_max is None else min(H - win, y_max)
    best, bxy = -1, (0, y_min)
    for y in range(y_min, y_max, 2):
        for x in range(0, W - win, 2):
            s_ = ii[y + win, x + win] - ii[y, x + win] - ii[y + win, x] + ii[y, x]
            if s_ > best:
                best, bxy = s_, (x, y)
    return bxy, best / win / win


def _stretch(crop, k=8.0):
    cl = S.srgb_to_lab(crop.astype(np.float64))
    mu = np.median(cl.reshape(-1, 3), 0)
    st = mu + (cl - mu) * k
    return S.lab_to_srgb(st).astype(np.uint8)


def sheet_fields(out_dir: Path) -> None:
    picks = [('01_singapore.jpg', 'poster', 'Singapore'), ('04_buenos_aires.jpg', 'poster', 'Buenos Aires'),
             ('07_kyoto.jpg', 'poster', 'Kyoto'), ('v2_t5.2.png', 'v2', 'v2 S1 cover'), ('v2_t17.5.png', 'v2', 'v2 S4'),
             ('v2_t36.0.png', 'v2', 'v2 S8')]
    Hrow, T, win = 560, 150, 28
    tiles = []
    for fn, kind, title in picks:
        p = REFS / fn if kind == 'poster' else SCR / 'frames' / fn
        rgb_s, valid, lab, f = prep(p, kind)
        fl = fields(lab, valid)
        cc, big_ids, top_ids = fl.pop('_map')
        ov = rgb_s.astype(np.float32).copy()
        for i in big_ids:
            m = cc == i
            colr = np.array((70, 120, 230) if i in top_ids else (235, 50, 60), np.float32)
            ov[m] = ov[m] * 0.45 + colr * 0.55
        ov[~valid] = 200
        sky_y = int((S.POSTERS[fn]['skyline'] if kind == 'poster' else 1000) / f)
        sky_top = int((S.POSTERS[fn]['sky'][1] if kind == 'poster' else 40) / f)
        sky_bot = int((S.POSTERS[fn]['sky'][3] if kind == 'poster' else 280) / f)
        (bx, by), _ = _best_flat_window(lab, valid, sky_y, None, win)
        (sx, sy), _ = _best_flat_window(lab, valid, sky_top, sky_bot, win)
        full = np.asarray(Image.open(p).convert('RGB'))
        crops = []
        for (x_, y_) in ((bx, by), (sx, sy)):
            X0, Y0, n = int(x_ * f), int(y_ * f), int(win * f)
            crops.append(full[Y0:Y0 + n, X0:X0 + n])
        tiles.append((title, ov.astype(np.uint8), crops, fl, ((bx, by), (sx, sy))))
    gap = 16
    tw = [max(fit_h(t[1], Hrow).width, 2 * T + 6) for t in tiles]
    W = sum(tw) + gap * (len(tiles) + 1)
    H = 74 + Hrow + 34 + 2 * (T + 26) + 80
    im = Image.new('RGB', (W, H), PAPER)
    d = ImageDraw.Draw(im)
    d.text((gap, 10), 'Empty fields and in-shape variation. BLUE = the big edge-free sky field; RED = big edge-free fields '
           'below it (each >= 2 % of the frame); grey = masked (UI, title, caption band)', fill=INK, font=S.font(22, True))
    d.text((gap, 40), 'Under each: a ~62 px window inside ONE shape below the sky (raw | variation x8) and a sky window (x8). '
           'Yellow boxes mark them. The posters\' fills breathe; v2\'s are dead flat (its sky carries only the invisible encode dither).',
           fill=MUTED, font=S.font(16))
    x = gap
    for (title, ov, crops, fl, wins), w in zip(tiles, tw):
        t = fit_h(ov, Hrow)
        im.paste(t, (x, 74))
        sc = Hrow / ov.shape[0]
        for (x_, y_) in wins:
            d.rectangle([x + x_ * sc, 74 + y_ * sc, x + (x_ + win) * sc, 74 + (y_ + win) * sc], outline=(255, 196, 0), width=3)
        d.text((x, 74 + Hrow + 6), title, fill=INK, font=S.font(18, True))
        y = 74 + Hrow + 34
        d.text((x, y), 'one shape: raw | x8', fill=MUTED, font=S.font(13))
        im.paste(Image.fromarray(crops[0]).resize((T, T), Image.NEAREST), (x, y + 16))
        im.paste(Image.fromarray(_stretch(crops[0])).resize((T, T), Image.NEAREST), (x + T + 6, y + 16))
        y2 = y + T + 26
        d.text((x, y2), 'sky: x8', fill=MUTED, font=S.font(13))
        im.paste(Image.fromarray(_stretch(crops[1])).resize((T, T), Image.NEAREST), (x, y2 + 16))
        lines = [f"fields below sky {fl['big_fields_below_sky_pct']:.0f} %",
                 f"mottle L* {fl.get('mottle_L_std', 0):.2f} / ab {fl.get('mottle_ab_std', 0):.2f}",
                 f"drift {fl.get('drift_L', 0):.1f} L*"]
        for i, s_ in enumerate(lines):
            d.text((x + T + 8, y2 + 22 + 20 * i), s_, fill=INK if i == 0 else MUTED, font=S.font(14))
        x += w + gap
    S.save_sheet(im, out_dir / 'pro_4_colour_fields.jpg')


# ------------------------------------------------------------------------------------------------------ the fix ladder
# A SIMULATION on a finished v2 frame, to show the direction of each colour fix and to measure what it closes. It is a
# post-process (a value curve, a chroma scale, a noise field), never how a film is built: the real fixes are palette
# and drawing decisions (pro_4_colour.md section 3). The sky (the big field touching the top and the horizon bands
# under the caption band) and the caption band itself are left as they are, except where a step says otherwise.
VALUE_CURVE = [(0, 0), (30, 20), (40, 27), (50, 35), (60, 45), (70, 56), (75, 63), (80, 70), (85, 77), (90, 84),
               (95, 93), (100, 100)]


def _noise(shape, sigma, seed):
    rng = np.random.default_rng(seed)
    n = cv2.GaussianBlur(rng.standard_normal(shape).astype(np.float32), (0, 0), sigma)
    return n / max(1e-6, n.std())


def fix_ladder(p: Path):
    full = np.asarray(Image.open(p).convert('RGB')).astype(np.float64)
    H, W = full.shape[:2]
    lab0 = S.srgb_to_lab(full)
    rgb_s, valid, lab_s, f = prep(p, 'v2')
    fl = fields(lab_s, valid)
    cc, big_ids, top_ids = fl.pop('_map')
    sky_s = np.isin(cc, [i for i in big_ids if i in top_ids])
    sky = cv2.resize(sky_s.astype(np.uint8), (W, H), interpolation=cv2.INTER_NEAREST).astype(bool)
    sky = ndi.binary_dilation(sky, iterations=3)
    band = np.zeros((H, W), bool)
    band[int(CAPTION_BAND[0] * H / 1920):int(CAPTION_BAND[1] * H / 1920)] = True
    world = ~sky & ~band
    xs, ys = zip(*VALUE_CURVE)
    steps = {}
    # 1. the value plan: a mid-tone world under the calm light sky (the lower half of the range opened)
    lab1 = lab0.copy()
    lab1[..., 0] = np.where(world, np.interp(lab0[..., 0], xs, ys), lab0[..., 0])
    steps['1 value plan'] = lab1
    # 2. the chroma plan: calm lights (paper: C* x0.65 at L* >= 86 in the world; the mint sky x0.7), colour in the mids
    #    (x1.1), and NO beige: a warm fill under L* 86 (h 30-100) never sits at C* 6-18 (the owner's never band): it
    #    takes C* 18 (apricot, terracotta), hue kept. A uniform chroma cut on the warm mid-lights made them beige.
    lab2 = lab1.copy()
    L2 = lab2[..., 0]
    C2 = np.hypot(lab2[..., 1], lab2[..., 2])
    h2 = np.degrees(np.arctan2(lab2[..., 2], lab2[..., 1])) % 360
    k = np.where(world & (L2 >= 86), 0.65, np.where(world & (L2 >= 40) & (L2 < 86), 1.1, 1.0))
    beige = world & (L2 < 86) & (L2 >= 40) & (h2 >= 30) & (h2 <= 100) & (C2 * 1.1 >= 6) & (C2 * 1.1 < 18)
    k = np.where(beige, 18.0 / np.maximum(C2, 1e-6), k)
    k = np.where(sky, 0.7, k)
    lab2[..., 1:] *= k[..., None]
    steps['2 + chroma plan'] = lab2
    # 3. materiality: a VERY subtle world-locked paper mottle (0.55 L*, 0.35 a*b*, ~30 px blotches) + a fine grain
    #    (0.25 L*, 0.8 px), everywhere but the caption band (rule 10 keeps it one calm field)
    lab3 = lab2.copy()
    keep = (~band)[..., None]
    mot = np.stack([0.55 * _noise((H, W), 14, 1), 0.35 * _noise((H, W), 14, 2), 0.35 * _noise((H, W), 14, 3)], -1)
    grn = 0.25 * _noise((H, W), 0.8, 4)
    lab3 = lab3 + keep * mot
    lab3[..., 0] += (~band) * grn
    steps['3 + paper mottle'] = lab3
    return lab0, steps


def cmd_simulate(a) -> None:
    p = Path(a.frame)
    lab0, steps = fix_ladder(p)
    J = json.loads(Path(a.json).read_text())
    P = [m for m in J['items'] if m['kind'] == 'poster']
    out_dir = SCR / 'sim'
    out_dir.mkdir(parents=True, exist_ok=True)
    variants = [('0 as shipped', p)]
    for name, lab in steps.items():
        q = out_dir / f'{p.stem}_{name.split()[0]}.png'
        Image.fromarray(S.lab_to_srgb(lab).round().astype(np.uint8)).save(q)
        variants.append((name, q))
    rows = []
    for name, q in variants:
        m = measure(q, 'v2')
        inside, gaps = 0, 0.0
        for label, path in KEYS:
            pv = np.array([get(x, path) for x in P if get(x, path) is not None], float)
            v = get(m, path)
            if v is None or not len(pv):
                continue
            inside += int(pv.min() <= v <= pv.max())
            gaps += abs(v - np.median(pv)) / max(1e-6, (pv.max() - pv.min()) / 2)
        rows.append((name, q, m, inside, gaps))
        print(f"{name:20s} metrics inside the posters' range: {inside}/{len(KEYS)}  sum|gap| {gaps:6.1f}  "
              f"p5 {m['value']['pct']['p5']} p25 {m['value']['pct']['p25']} dark<45 {m['value']['groups']['dark_lt45']} "
              f"pastel {m['chroma']['pastel_pct']} CwL {m['chroma']['C_weighted_L']} Cp50 {m['chroma']['pct']['p50']} "
              f"mottle {m['fields'].get('mottle_L_std')} colours {m['colours']['n_ge05pct']}")
    # the sheet
    Hh = 960
    gap = 16
    W = 4 * 540 + 5 * gap
    im = Image.new('RGB', (W, Hh + 300), PAPER)
    d = ImageDraw.Draw(im)
    d.text((gap, 10), f'The fix ladder on v2 {p.stem} (a SIMULATION by post-process: the direction of each fix, never the build)',
           fill=INK, font=S.font(24, True))
    d.text((gap, 42), 'Sky, horizon bands and caption band kept. 1: a mid-tone world (L* curve under the sky). 2: calm lights, colour in the mids, '
           'no beige (paper C* x0.65 at L*>=86, sky x0.7, mids x1.1, warm mids out of C* 6-18). 3: a VERY subtle world-locked paper mottle.',
           fill=MUTED, font=S.font(16))
    x = gap
    for name, q, m, inside, gaps in rows:
        t = Image.open(q).convert('RGB').resize((540, Hh), Image.LANCZOS)
        im.paste(t, (x, 76))
        v, c, fl, co = m['value'], m['chroma'], m['fields'], m['colours']
        lines = [name, f"inside the posters' range: {inside}/{len(KEYS)} metrics",
                 f"L* p5 {v['pct']['p5']:.0f}  p25 {v['pct']['p25']:.0f}  dark<45 {v['groups']['dark_lt45']:.0f} %",
                 f"pastel {c['pastel_pct']:.0f} %   C* p50 {c['pct']['p50']:.1f}   C*-weighted L* {c['C_weighted_L']:.0f}",
                 f"mottle L* {fl.get('mottle_L_std', 0):.2f}   colours >=0.5 %: {co['n_ge05pct']}",
                 f"empty fields below sky {fl['big_fields_below_sky_pct']:.0f} %"]
        for i, s_ in enumerate(lines):
            d.text((x, 76 + Hh + 8 + 24 * i), s_, fill=INK if i < 2 else MUTED, font=S.font(18 if i == 0 else 16, i == 0))
        x += 540 + gap
    S.save_sheet(im, Path(a.img) / 'pro_4_colour_fixes.jpg')
    Path(out_dir / 'ladder.json').write_text(json.dumps([{'step': n, 'inside': i, 'sum_gap': g, 'm': m} for n, q, m, i, g in rows],
                                                        indent=1, default=float))


def cmd_sheets(a) -> None:
    J = json.loads(Path(a.json).read_text())
    out = Path(a.img)
    sheet_value_chroma(J, out)
    sheet_maps(out)
    sheet_fields(out)


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest='cmd', required=True)
    m = sub.add_parser('measure')
    m.add_argument('--images', nargs='*')
    m.add_argument('--out', default=str(SCR / 'm.json'))
    m.set_defaults(fn=cmd_measure)
    sh = sub.add_parser('sheets')
    sh.add_argument('--json', default=str(SCR / 'm.json'))
    sh.add_argument('--img', default=str(SCR / 'img'))
    sh.set_defaults(fn=cmd_sheets)
    mk = sub.add_parser('mask')
    mk.add_argument('--json', default=str(SCR / 'm.json'))
    mk.set_defaults(fn=cmd_mask)
    si = sub.add_parser('simulate')
    si.add_argument('--frame', default=str(SCR / 'frames' / 'v2_t5.2.png'))
    si.add_argument('--json', default=str(SCR / 'm.json'))
    si.add_argument('--img', default=str(SCR / 'img'))
    si.set_defaults(fn=cmd_simulate)
    a = ap.parse_args()
    a.fn(a)


if __name__ == '__main__':
    main()
