#!/usr/bin/env python3
"""style.py: the city-poster study's VISUAL STYLE measurements (look lens 2; report:
docs/studies/2026-10-28_city_posters/style.md). Reusable on any still: a poster, a reference, a film frame.

  python3 -I scripts/look/posters/style.py measure --out /tmp/x/style.json          # the seven posters + our frames
  python3 -I scripts/look/posters/style.py measure --images a.png b.jpg --out x.json  # any stills (no regions)
  python3 -I scripts/look/posters/style.py sheets --json x.json --img docs/studies/2026-10-28_city_posters/img
  python3 -I scripts/look/posters/style.py encode-test --frame v2.png --out /tmp/x/enc   # texture through H.264
  python3 -I scripts/look/posters/style.py dna --palettes p.json                   # palettes.json's DNA check

Run from `video/`. The Instagram UI burned into the owner's screenshots is masked with
docs/look/poster_refs/ui_mask.json in every measurement (content rows, the page counter, the mute button).

The measures (CIE L*a*b* D65 from sRGB; C* = chroma, h = CIE hue in degrees; dE = CIE76):
  colour     k-means (k 12) in CIELAB on the masked image, 2x area-downsampled (the grain averaged away): each cluster's
             share, L*, C*, h, where it sits (y centroid); the sky / ground / hero colours (region medians); the dark
             anchor (L* < 40), pops (C* >= 50, the house DNA's pop), hero-level chroma (C* >= 30); warm / cool shares by
             hue (warm h 330-95, green-olive 95-150, cool 150-300, violet 300-330, neutral C* < 6), measured on the 4x
             area-downsampled image (what a phone shows); the house NEVER bands (lib/water.tsx `neverBand`: beige h
             55-95 at C* 6-18 under L* 86; olive h 95-118 at C* 6-30; grey C* < 4 under L* 85); the chroma strategy
             (saturated pixels C* >= 35 as connected parts: confetti or fields).
  texture    GRAIN: in flat windows (no colour edge within 6 px), L* minus its Gaussian blur (sigma 4 px) -> std (L*),
             the same for a*, b* (coloured or mono), its size as the autocorrelation's half-width (FWHM, px) and the
             radial power spectrum's centroid period; MOTTLING: inside the open sky box, L* minus a quadratic surface,
             then blurred (sigma 4 px) -> std (L*) and its scale (the autocorrelation's 1/e radius, px).
  line       scripts/qa/retro_tools/line/measure.py's metrics (the numbers behind CRAFT §c's budgets): dark-line pixels
             (black-hat 9 px at 1080 > 14 L*, L* < 55), strokes and short strokes per Mpx, colour edges that carry a line.
  sky        per-row medians of L*, C*, h down the open sky column (title, UI and objects out), smoothed.
  title      the poster title: letters as connected parts; cap height, letter gap and pitch as % of the cap height,
             stroke / cap height, width as % of the frame, y as % of the content height, colour.
  patch      the geometric patchwork per region: Felzenszwalb segments on the smoothed image; block widths as % of the
             frame width, rectangularity (area / bbox), neighbouring blocks' dE and |dL*| (shared edge >= 12 px), and
             edge orientation (share of edge pixels within 7.5 deg of level, plumb, the two diagonals).
  light      lit / shade pairs (boxes): dL*, C* ratio, hue turn (shade minus lit).
  overlap    translucent planes: from A (ground), A' (ground under the plane), B, B' -> alpha and the plane colour
             (alpha-over in linear RGB), and the multiply model's error.
  water      reflection: the column profile of the source above the waterline against the water below (correlation),
             horizontal vs vertical edge energy, the bar height (autocorrelation down the water).
Every box is [x0, y0, x1, y1] in image px. Scratch defaults to the session scratchpad; nothing here writes outside
--out / --img. Deterministic (seeded k-means and samples).
"""
from __future__ import annotations

import argparse
import json
import math
import os
import subprocess
import sys
from pathlib import Path

import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont
from scipy import ndimage as ndi

sys.dont_write_bytecode = True

HERE = Path(__file__).resolve().parent
VIDEO = HERE.parents[2]  # scripts/look/posters -> video
REFS = VIDEO / 'docs/look/poster_refs'
STUDY = VIDEO / 'docs/studies/2026-10-28_city_posters'

# ----------------------------------------------------------------------------------------------- the posters' regions
# Hand-placed on the 1206-px screenshots (checked on gridded copies). 'sky' = open sky only (no title, cloud, object);
# 'sky_col' = the column for the sky profile (x0, x1) from the content top down to 'skyline' (y); 'title' = the title
# band; 'hero' = the landmark's box; 'regions' = the patchwork planes; 'light' = lit / shade pairs; 'overlap' =
# translucent planes; 'water' = {'box', 'src'} pairs; 'flat' = extra flat patches for the grain.
POSTERS: dict[str, dict] = {
    '01_singapore.jpg': {
        'light': {'tower side vs front': [[400, 800, 460, 900], [348, 800, 358, 900]]},
        'planes': [['x', 450, 0, 330], ['y', 60, 250, 1000]],
        'water': {'far shore mirror': {'box': [190, 1150, 700, 1240], 'src': [190, 1060, 700, 1145]},
                  'boat': {'box': [275, 1286, 465, 1310], 'src': [275, 1245, 465, 1282]}},
        'city': 'Singapore', 'sky': [150, 250, 960, 560], 'sky_col': [300, 900], 'skyline': 655,
        'title': [400, 175, 800, 228], 'hero': [350, 700, 850, 1040], 'ground': [0, 1300, 1206, 1625],
        'regions': {'sky edges': [0, 270, 300, 1000], 'far city': [0, 820, 360, 1040],
                    'water': [190, 1150, 700, 1420], 'near patchwork': [0, 1250, 520, 1625],
                    'near houses': [500, 1300, 1080, 1625]},
    },
    '02_reykjavik.jpg': {
        'light': {'spire left vs right': [[243, 520, 265, 590], [275, 520, 297, 590]]},
        'planes': [['y', 90, 380, 900]],
        'water': {'harbour': {'box': [640, 1300, 1000, 1390]},
                  'ship': {'box': [1010, 1300, 1206, 1340], 'src': [1010, 1250, 1206, 1298]}},
        'city': 'Reykjavik', 'sky': [400, 210, 1000, 540], 'sky_col': [450, 950], 'skyline': 880,
        'title': [430, 145, 790, 195], 'hero': [180, 395, 420, 1115], 'ground': [0, 1400, 1206, 1605],
        'regions': {'sky planes': [0, 380, 640, 900], 'far mountains': [400, 890, 1206, 1000],
                    'mid patchwork': [0, 1110, 640, 1290], 'water': [640, 1290, 1206, 1420],
                    'near houses': [0, 1290, 1206, 1605]},
    },
    '03_hanoi.jpg': {
        'light': {'pillar right vs left': [[945, 1250, 990, 1340], [880, 1250, 925, 1340]]},
        'planes': [],
        'water': {'lake under the bridge': {'box': [240, 1180, 600, 1290], 'src': [240, 1070, 600, 1175]},
                  'pond': {'box': [700, 1395, 870, 1430]}},
        'city': 'Hanoi', 'sky': [330, 280, 1100, 540], 'sky_col': [500, 950], 'skyline': 560,
        'title': [480, 215, 740, 268], 'hero': [680, 860, 1190, 1380], 'ground': [0, 1400, 1206, 1610],
        'regions': {'far city': [400, 570, 1206, 800], 'right patchwork': [1000, 840, 1206, 1100],
                    'water': [240, 1170, 900, 1420], 'near patchwork': [400, 1330, 800, 1610]},
    },
    '04_buenos_aires.jpg': {
        'light': {'obelisk right vs left': [[612, 700, 640, 950], [576, 700, 597, 950]]},
        'planes': [],
        'water': {'river (far)': {'box': [440, 862, 1206, 900]}},
        'city': 'Buenos Aires', 'sky': [680, 200, 1150, 780], 'sky_col': [700, 1150], 'skyline': 800,
        'title': [360, 125, 860, 172], 'hero': [560, 400, 670, 1060], 'ground': [0, 1400, 1206, 1579],
        'regions': {'far city left': [250, 740, 560, 960], 'far city right': [760, 900, 1206, 1000],
                    'water': [440, 855, 1206, 905], 'mid-near patchwork': [280, 1150, 700, 1579]},
    },
    '05_cape_town.jpg': {
        'light': {'house front vs side': [[975, 1095, 1130, 1150], [942, 1100, 964, 1290]],
                  'lighthouse left vs right': [[228, 1030, 238, 1080], [244, 1030, 254, 1080]]},
        'planes': [],
        'water': {'bay': {'box': [0, 1110, 400, 1200], 'src': [0, 1020, 400, 1105]}},
        'city': 'Cape Town', 'sky': [100, 270, 1000, 500], 'sky_col': [100, 900], 'skyline': 600,
        'title': [420, 205, 790, 250], 'hero': [330, 630, 1010, 870], 'ground': [0, 1400, 1206, 1605],
        'regions': {'far city': [480, 840, 1100, 1090], 'water': [0, 940, 520, 1200],
                    'mid patchwork': [0, 1180, 560, 1330], 'near houses': [760, 830, 1206, 1550]},
    },
    '06_copenhagen.jpg': {
        'light': {'round tower left vs right': [[622, 950, 655, 1060], [700, 950, 730, 1060]],
                  'dome left vs right': [[875, 995, 905, 1030], [965, 995, 995, 1030]]},
        'planes': [['y', 560, 780, 1010], ['x', 975, 420, 700]],
        'water': {'canal patchwork': {'box': [660, 1270, 800, 1345], 'src': [660, 1150, 800, 1265]},
                  'canal wide': {'box': [0, 1300, 1206, 1530]}},
        'city': 'Copenhagen', 'sky': [350, 300, 1150, 650], 'sky_col': [400, 1150], 'skyline': 800,
        'title': [280, 190, 940, 255], 'hero': [0, 860, 760, 1200], 'ground': [0, 1530, 1206, 1625],
        'regions': {'sky planes': [500, 800, 1206, 1140], 'facades': [0, 860, 760, 1170],
                    'water': [0, 1250, 1206, 1530], 'ground': [0, 1500, 1206, 1625]},
    },
    '07_kyoto.jpg': {
        'light': {'pavilion front vs side': [[880, 945, 1080, 990], [700, 950, 760, 990]],
                  'rock top vs base': [[630, 1112, 680, 1125], [630, 1138, 680, 1150]]},
        'planes': [['x', 725, 600, 1206], ['x', 690, 600, 1206]],
        'water': {'pond mirror': {'box': [650, 1130, 1180, 1300], 'src': [650, 950, 1180, 1120]}},
        'city': 'Kyoto', 'sky': [330, 260, 1150, 600], 'sky_col': [450, 1150], 'skyline': 640,
        'title': [480, 195, 730, 245], 'hero': [630, 740, 1180, 1110], 'ground': [0, 1450, 1206, 1618],
        'regions': {'far mountains': [400, 640, 1206, 800], 'mid patchwork': [300, 980, 620, 1450],
                    'water': [600, 1120, 1206, 1400], 'left planes': [0, 700, 300, 1100]},
    },
}


# --------------------------------------------------------------------------------------------------- colour helpers
def srgb_to_lab(rgb: np.ndarray) -> np.ndarray:
    """rgb (..., 3) uint8 or 0..255 float -> CIE Lab (D65)."""
    c = np.asarray(rgb, dtype=np.float64) / 255.0
    c = np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)
    m = np.array([[0.4124564, 0.3575761, 0.1804375], [0.2126729, 0.7151522, 0.0721750],
                  [0.0193339, 0.1191920, 0.9503041]])
    xyz = c @ m.T / np.array([0.95047, 1.0, 1.08883])
    e, k = 216 / 24389, 24389 / 27
    f = np.where(xyz > e, np.cbrt(xyz), (k * xyz + 16) / 116)
    return np.stack([116 * f[..., 1] - 16, 500 * (f[..., 0] - f[..., 1]), 200 * (f[..., 1] - f[..., 2])], -1)


def lab_to_srgb(lab: np.ndarray) -> np.ndarray:
    """CIE Lab (D65) -> sRGB 0..255 float (clipped)."""
    lab = np.asarray(lab, dtype=np.float64)
    fy = (lab[..., 0] + 16) / 116
    fx = fy + lab[..., 1] / 500
    fz = fy - lab[..., 2] / 200
    e, k = 216 / 24389, 24389 / 27
    def inv(f):
        return np.where(f ** 3 > e, f ** 3, (116 * f - 16) / k)
    xyz = np.stack([inv(fx), np.where(lab[..., 0] > k * e, fy ** 3, lab[..., 0] / k), inv(fz)], -1)
    xyz = xyz * np.array([0.95047, 1.0, 1.08883])
    m = np.array([[3.2404542, -1.5371385, -0.4985314], [-0.9692660, 1.8760108, 0.0415560],
                  [0.0556434, -0.2040259, 1.0572252]])
    lin = np.clip(xyz @ m.T, 0, 1)
    c = np.where(lin <= 0.0031308, 12.92 * lin, 1.055 * lin ** (1 / 2.4) - 0.055)
    return np.clip(c * 255, 0, 255)


def hexc(lab) -> str:
    r, g, b = lab_to_srgb(np.asarray(lab, dtype=np.float64)).round().astype(int).tolist()
    return f'#{r:02X}{g:02X}{b:02X}'


def hex_lab(h: str) -> np.ndarray:
    h = h.lstrip('#')
    return srgb_to_lab(np.array([int(h[i:i + 2], 16) for i in (0, 2, 4)], dtype=np.float64))


def lch(lab: np.ndarray):
    lab = np.asarray(lab, dtype=np.float64)
    C = np.hypot(lab[..., 1], lab[..., 2])
    h = np.degrees(np.arctan2(lab[..., 2], lab[..., 1])) % 360
    return lab[..., 0], C, h


def bands(L, C, h) -> dict:
    """The house NEVER bands (lib/water.tsx neverBand) + the critic's yellow-green (master_check.py's khaki rest)."""
    beige = (h >= 55) & (h <= 95) & (C >= 6) & (C < 18) & (L < 86)
    olive = (h > 95) & (h <= 118) & (C >= 6) & (C < 30)
    grey = (C < 4) & (L < 85)
    ygreen = (h > 118) & (h <= 150) & (C >= 6) & (C < 30)
    return {'beige': beige, 'olive': olive, 'grey': grey, 'yellow-green': ygreen}


def band_name(L, C, h) -> str:
    for k, v in bands(np.array([L]), np.array([C]), np.array([h])).items():
        if v[0]:
            return k
    return ''


def hue_family(C, h):
    neutral = C < 6
    warm = ~neutral & ((h >= 330) | (h < 95))
    green = ~neutral & (h >= 95) & (h < 150)
    cool = ~neutral & (h >= 150) & (h < 300)
    violet = ~neutral & (h >= 300) & (h < 330)
    return {'warm': warm, 'green-olive': green, 'cool': cool, 'violet': violet, 'neutral': neutral}


def contrast_ratio(lab1, lab2) -> float:
    def Y(lab):
        return float(lab[0] > 8 and ((lab[0] + 16) / 116) ** 3 or lab[0] / 903.3)
    y1, y2 = Y(np.asarray(lab1)), Y(np.asarray(lab2))
    hi, lo = max(y1, y2), min(y1, y2)
    return (hi + 0.05) / (lo + 0.05)


# ------------------------------------------------------------------------------------------------------ loading
def load_mask_spec(path: Path = REFS / 'ui_mask.json') -> dict:
    try:
        return json.loads(path.read_text())['images']
    except FileNotFoundError:
        return {}


def load_image(path: Path, mask_spec: dict | None = None):
    """-> rgb uint8 (H, W, 3), valid bool (H, W): the Instagram UI out when the file is in ui_mask.json."""
    rgb = np.asarray(Image.open(path).convert('RGB'))
    H, W = rgb.shape[:2]
    valid = np.ones((H, W), bool)
    spec = (mask_spec or {}).get(path.name)
    if spec:
        r0, r1 = spec['content_rows']
        valid[:r0] = False
        valid[r1:] = False
        for key in ('counter_pill_box', 'mute_button_box'):
            if key in spec:
                x0, y0, x1, y1 = spec[key]
                valid[y0:y1, x0:x1] = False
    return rgb, valid


def down(arr: np.ndarray, f: int) -> np.ndarray:
    H, W = arr.shape[:2]
    return cv2.resize(arr, (W // f, H // f), interpolation=cv2.INTER_AREA)


def down_mask(valid: np.ndarray, f: int) -> np.ndarray:
    return down(valid.astype(np.float32), f) > 0.999


def box_mask(shape, box) -> np.ndarray:
    m = np.zeros(shape[:2], bool)
    x0, y0, x1, y1 = [int(v) for v in box]
    m[max(0, y0):y1, max(0, x0):x1] = True
    return m


def stat(lab_px: np.ndarray) -> dict:
    """Median Lab of a pixel set -> hex, L*, C*, h."""
    if lab_px.size == 0:
        return {}
    med = np.median(lab_px.reshape(-1, 3), axis=0)
    L, C, h = lch(med)
    return {'hex': hexc(med), 'L': round(float(L), 1), 'C': round(float(C), 1), 'h': round(float(h)),
            'band': band_name(float(L), float(C), float(h))}


# ------------------------------------------------------------------------------------------------------- colour
def colour(rgb: np.ndarray, valid: np.ndarray, reg: dict | None, k: int = 12, seed: int = 0) -> dict:
    from sklearn.cluster import KMeans
    H, W = valid.shape
    lab2 = srgb_to_lab(down(rgb, 2).astype(np.float64))
    v2 = down_mask(valid, 2)
    X = lab2[v2]
    rng = np.random.default_rng(seed)
    sample = X[rng.choice(len(X), size=min(len(X), 80000), replace=False)]
    km = KMeans(n_clusters=k, n_init=4, random_state=seed).fit(sample)
    lab_all = km.cluster_centers_
    lbl = np.full(v2.shape, -1, int)
    lbl[v2] = km.predict(X)
    ys = np.nonzero(v2)[0]
    ytop, ybot = ys.min(), ys.max()
    clusters = []
    for i in range(k):
        m = lbl == i
        share = m.sum() / v2.sum()
        L, C, h = lch(lab_all[i])
        yy = np.nonzero(m)[0]
        clusters.append({'hex': hexc(lab_all[i]), 'share': round(100 * float(share), 1), 'L': round(float(L), 1),
                         'C': round(float(C), 1), 'h': round(float(h)), 'band': band_name(float(L), float(C), float(h)),
                         'y': round(float((yy.mean() - ytop) / max(1, ybot - ytop)), 2) if len(yy) else None})
    clusters.sort(key=lambda c: -c['share'])
    # what a phone shows: 4x area-downsampled pixels
    lab4 = srgb_to_lab(down(rgb, 4).astype(np.float64))
    v4 = down_mask(valid, 4)
    L4, C4, h4 = lch(lab4)
    n4 = v4.sum()
    fam = {k_: round(100 * float((m & v4).sum() / n4), 1) for k_, m in hue_family(C4, h4).items()}
    bnd = {k_: round(100 * float((m & v4).sum() / n4), 1) for k_, m in bands(L4, C4, h4).items()}
    out = {'clusters': clusters, 'families': fam, 'bands': bnd,
           'warm_vs_cool': round(fam['warm'] / max(0.1, fam['warm'] + fam['cool']), 2)}
    # chroma strategy
    Cv = C4[v4]
    out['chroma'] = {'p50': round(float(np.percentile(Cv, 50)), 1), 'p90': round(float(np.percentile(Cv, 90)), 1),
                     'p99': round(float(np.percentile(Cv, 99)), 1),
                     'ge30': round(100 * float((Cv >= 30).mean()), 1), 'ge40': round(100 * float((Cv >= 40).mean()), 1),
                     'ge50_pop': round(100 * float((Cv >= 50).mean()), 2)}
    sat = (C4 >= 35) & v4
    cc, n = ndi.label(sat, structure=np.ones((3, 3)))
    sizes = ndi.sum(sat, cc, range(1, n + 1)) / n4 * 100 if n else np.array([])
    yy, _ = np.nonzero(sat)
    rows = np.nonzero(v4.any(1))[0]
    t0, t1 = rows.min(), rows.max()
    third = (yy - t0) / max(1, t1 - t0)
    out['saturated_parts'] = {
        'share_c35': round(100 * float(sat.sum() / n4), 1),
        'parts_ge_0.05pct': int((sizes >= 0.05).sum()),
        'largest_pct': round(float(sizes.max()), 2) if len(sizes) else 0.0,
        'fields_ge_2pct': int((sizes >= 2).sum()),
        'thirds_top_mid_bottom': [round(100 * float(((third >= a) & (third < b)).mean()), 0) for a, b in
                                  ((0, 1 / 3), (1 / 3, 2 / 3), (2 / 3, 1.01))] if len(third) else [],
    }
    dark = (L4 < 40) & v4
    out['dark'] = {'lt40_pct': round(100 * float(dark.sum() / n4), 1),
                   'lt30_pct': round(100 * float(((L4 < 30) & v4).sum() / n4), 1),
                   'median': stat(lab4[dark]) if dark.any() else {}}
    pop = (C4 >= 50) & v4
    out['pop'] = {'pct': round(100 * float(pop.sum() / n4), 2), 'median': stat(lab4[pop]) if pop.any() else {}}
    if pop.any():
        hp = h4[pop]
        hist = np.histogram(hp, bins=12, range=(0, 360))[0]
        out['pop']['hue_bins_30deg'] = hist.tolist()
    if reg:
        f = 4
        def region(box):
            m = box_mask(v4.shape, [b // f for b in box]) & v4
            return lab4[m]
        out['sky'] = stat(region(reg['sky']))
        gm = box_mask(v4.shape, [b // f for b in reg['ground']]) & v4
        gpx = lab4[gm]
        km3 = KMeans(n_clusters=5, n_init=4, random_state=seed).fit(gpx)
        gsh = np.bincount(km3.labels_, minlength=5) / len(gpx)
        gparts = []
        for i in np.argsort(-gsh)[:3]:
            L, C, h = lch(km3.cluster_centers_[i])
            gparts.append({'hex': hexc(km3.cluster_centers_[i]), 'share': round(100 * float(gsh[i])), 'L': round(float(L), 1),
                           'C': round(float(C), 1), 'h': round(float(h)), 'band': band_name(float(L), float(C), float(h))})
        out['ground'] = gparts
        hb = region(reg['hero'])
        sky = np.median(region(reg['sky']), axis=0)
        far_from_sky = np.linalg.norm(hb - sky, axis=1) > 10
        hero = {'all': stat(hb[far_from_sky])}
        if far_from_sky.sum() > 50:
            km2 = KMeans(n_clusters=4, n_init=4, random_state=seed).fit(hb[far_from_sky])
            sh = np.bincount(km2.labels_, minlength=4) / far_from_sky.sum()
            parts = []
            for i in np.argsort(-sh):
                L, C, h = lch(km2.cluster_centers_[i])
                parts.append({'hex': hexc(km2.cluster_centers_[i]), 'share': round(100 * float(sh[i])),
                              'L': round(float(L), 1), 'C': round(float(C), 1), 'h': round(float(h)),
                              'band': band_name(float(L), float(C), float(h))})
            hero['parts'] = parts
        out['hero'] = hero
        # where the never bands sit: sky box vs the rest
        skym = box_mask(v4.shape, [0, 0, v4.shape[1], reg['skyline'] // f]) & v4
        rest = v4 & ~skym
        out['bands_where'] = {k_: {'sky_pct_of_sky': round(100 * float((m & skym).sum() / max(1, skym.sum())), 1),
                                   'below_pct_of_below': round(100 * float((m & rest).sum() / max(1, rest.sum())), 1)}
                              for k_, m in bands(L4, C4, h4).items()}
    return out


# ------------------------------------------------------------------------------------------------------ texture
def flat_map(lab: np.ndarray, valid: np.ndarray, de: float = 3.0, pad: int = 6) -> np.ndarray:
    """Pixels with no colour edge (dE76 >= `de` across 4 px of a lightly smoothed image) within `pad` px."""
    sm = cv2.GaussianBlur(lab.astype(np.float32), (0, 0), 1.6)
    d = np.zeros(valid.shape, np.float32)
    for dy, dx in ((0, 4), (4, 0)):
        a = sm[dy:, dx:] if dy or dx else sm
        b = sm[:sm.shape[0] - dy, :sm.shape[1] - dx]
        dd = np.linalg.norm(a - b, axis=-1)
        d[:dd.shape[0], :dd.shape[1]] = np.maximum(d[:dd.shape[0], :dd.shape[1]], dd)
    edge = d >= de
    edge = ndi.binary_dilation(edge, iterations=pad)
    return valid & ~edge & ndi.binary_erosion(valid, iterations=pad)


def acf_width(field: np.ndarray, level: float = 0.5) -> float:
    """Radius (px) where the radially averaged autocorrelation of `field` falls to `level` (0.5 = half-width)."""
    f = field - field.mean()
    if f.std() < 1e-6:
        return float('nan')
    F = np.fft.fft2(f, s=(2 * f.shape[0], 2 * f.shape[1]))
    ac = np.fft.ifft2(np.abs(F) ** 2).real
    ac = np.fft.fftshift(ac)
    ac /= ac.max()
    cy, cx = np.array(ac.shape) // 2
    yy, xx = np.indices(ac.shape)
    r = np.hypot(yy - cy, xx - cx).astype(int)
    prof = np.bincount(r.ravel(), ac.ravel()) / np.maximum(1, np.bincount(r.ravel()))
    below = np.nonzero(prof < level)[0]
    if not len(below):
        return float('nan')
    i = below[0]
    # linear interpolation between i-1 and i
    p0, p1 = prof[i - 1], prof[i]
    return float(i - 1 + (p0 - level) / max(1e-9, p0 - p1))


def spectrum_period(field: np.ndarray) -> float:
    """Power-weighted centroid period (px) of a high-passed patch's radial spectrum (Hann window)."""
    f = field - field.mean()
    win = np.outer(np.hanning(f.shape[0]), np.hanning(f.shape[1]))
    P = np.abs(np.fft.fftshift(np.fft.fft2(f * win))) ** 2
    cy, cx = np.array(P.shape) // 2
    yy, xx = np.indices(P.shape)
    fy = (yy - cy) / P.shape[0]
    fx = (xx - cx) / P.shape[1]
    fr = np.hypot(fy, fx)
    m = (fr > 0) & (fr <= 0.5)
    fc = float((fr[m] * P[m]).sum() / max(1e-12, P[m].sum()))
    return 1 / fc if fc > 0 else float('nan')


def grain(lab: np.ndarray, valid: np.ndarray, win: int = 64, sigma: float = 4.0, region=None) -> dict:
    """Grain in flat windows: high-pass std of L*, a*, b*; size (ACF FWHM, px) and spectral period."""
    fm = flat_map(lab, valid)
    if region is not None:
        fm &= region
    hp = lab - np.stack([cv2.GaussianBlur(lab[..., c].astype(np.float32), (0, 0), sigma) for c in range(3)], -1)
    H, W = fm.shape
    stds, fwhm, per, cstd, corr = [], [], [], [], []
    for y in range(0, H - win, win // 2):
        for x in range(0, W - win, win // 2):
            if fm[y:y + win, x:x + win].mean() < 0.98:
                continue
            p = hp[y + 4:y + win - 4, x + 4:x + win - 4]
            stds.append(p[..., 0].std())
            cstd.append(math.hypot(p[..., 1].std(), p[..., 2].std()))
            fwhm.append(2 * acf_width(p[..., 0], 0.5))
            per.append(spectrum_period(p[..., 0]))
            a = p[..., 0].ravel(); b = p[..., 2].ravel()
            corr.append(np.corrcoef(a, b)[0, 1] if a.std() > 0 and b.std() > 0 else 0)
    if not stds:
        return {'windows': 0}
    return {'windows': len(stds), 'L_std': round(float(np.median(stds)), 2),
            'L_std_p90': round(float(np.percentile(stds, 90)), 2),
            'chroma_std': round(float(np.median(cstd)), 2), 'chroma_to_L': round(float(np.median(cstd) / max(1e-6, np.median(stds))), 2),
            'L_b_corr': round(float(np.median(corr)), 2),
            'fwhm_px': round(float(np.nanmedian(fwhm)), 2), 'period_px': round(float(np.nanmedian(per)), 2),
            'flat_pct': round(100 * float(fm.sum() / max(1, valid.sum())), 1)}


def mottling(lab: np.ndarray, valid: np.ndarray, box, sigma: float = 4.0) -> dict:
    """Low-frequency variation inside an open flat box: L* (and a*, b*) minus a quadratic surface, blurred."""
    x0, y0, x1, y1 = box
    sub = lab[y0:y1, x0:x1].astype(np.float64)
    m = valid[y0:y1, x0:x1]
    h, w = sub.shape[:2]
    yy, xx = np.mgrid[0:h, 0:w]
    u, v = xx / w - 0.5, yy / h - 0.5
    A = np.stack([np.ones_like(u), u, v, u * u, v * v, u * v], -1)[m]
    out = {}
    res = np.zeros((h, w, 3))
    for c in range(3):
        coef, *_ = np.linalg.lstsq(A, sub[..., c][m], rcond=None)
        surf = (np.stack([np.ones_like(u), u, v, u * u, v * v, u * v], -1) @ coef)
        res[..., c] = sub[..., c] - surf
    res[~m] = 0
    lp = np.stack([cv2.GaussianBlur(res[..., c].astype(np.float32), (0, 0), sigma) for c in range(3)], -1)
    core = (slice(12, h - 12), slice(12, w - 12))
    Lp = lp[..., 0][core]
    out['L_std'] = round(float(Lp.std()), 2)
    out['L_p2p_p1_p99'] = round(float(np.percentile(Lp, 99) - np.percentile(Lp, 1)), 2)
    out['chroma_std'] = round(float(math.hypot(lp[..., 1][core].std(), lp[..., 2][core].std())), 2)
    out['scale_px_1e'] = round(acf_width(Lp, 1 / math.e), 1)
    out['scale_px_half'] = round(acf_width(Lp, 0.5), 1)
    # directionality: ACF anisotropy (streaks): std of row-means vs column-means
    out['row_vs_col_std'] = [round(float(Lp.mean(1).std()), 2), round(float(Lp.mean(0).std()), 2)]
    return out


# --------------------------------------------------------------------------------------------------------- line
def zhang_suen(b: np.ndarray) -> np.ndarray:
    img = np.pad(b.astype(np.uint8), 1)
    changed = True
    while changed:
        changed = False
        for step in (0, 1):
            P = img
            p2 = P[:-2, 1:-1]; p3 = P[:-2, 2:]; p4 = P[1:-1, 2:]; p5 = P[2:, 2:]
            p6 = P[2:, 1:-1]; p7 = P[2:, :-2]; p8 = P[1:-1, :-2]; p9 = P[:-2, :-2]
            c = P[1:-1, 1:-1]
            nb = [p2, p3, p4, p5, p6, p7, p8, p9]
            B = sum(x.astype(np.int32) for x in nb)
            seq = nb + [p2]
            A = sum(((seq[i] == 0) & (seq[i + 1] == 1)).astype(np.int32) for i in range(8))
            if step == 0:
                m = (c == 1) & (B >= 2) & (B <= 6) & (A == 1) & (p2 * p4 * p6 == 0) & (p4 * p6 * p8 == 0)
            else:
                m = (c == 1) & (B >= 2) & (B <= 6) & (A == 1) & (p2 * p4 * p8 == 0) & (p2 * p6 * p8 == 0)
            if m.any():
                changed = True
                img[1:-1, 1:-1][m] = 0
    return img[1:-1, 1:-1].astype(bool)


def line_metrics(rgb: np.ndarray, valid: np.ndarray, band=None) -> dict:
    """retro_tools/line/measure.py's run() (the numbers behind CRAFT §c), with a validity mask; `band` = caption
    band (y0, y1) in 1080-canvas px to leave out (our frames)."""
    H, W = valid.shape
    scale = 1080 / W
    bgr = np.ascontiguousarray(rgb[..., ::-1])
    lab = cv2.cvtColor(bgr, cv2.COLOR_BGR2LAB).astype(np.float32)
    lab[..., 0] *= 100 / 255; lab[..., 1] -= 128; lab[..., 2] -= 128
    Lc = lab[..., 0]
    k = max(5, int(round(9 / scale)) | 1)
    bh = cv2.morphologyEx(Lc, cv2.MORPH_BLACKHAT, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (k, k)))
    line = (bh > 14) & (Lc < 55)
    v = valid.copy()
    if band:
        y0, y1 = [int(b / scale) for b in band]
        v[y0:y1] = False
    v = ndi.binary_erosion(v, iterations=k)  # no fake line at a mask edge
    line &= v
    cc, n = ndi.label(line, structure=np.ones((3, 3)))
    sizes = ndi.sum(line, cc, range(1, n + 1))
    keep = np.zeros(n + 1, bool); keep[1:] = sizes >= 4
    line = keep[cc]
    area_mpx = v.sum() * scale * scale / 1e6
    sk = zhang_suen(line)
    nbc = ndi.convolve(sk.astype(np.uint8), np.ones((3, 3), np.uint8), mode='constant') - sk
    ends = int((sk & (nbc == 1)).sum())
    cc, n = ndi.label(line, structure=np.ones((3, 3)))
    sklen = ndi.sum(sk, cc, range(1, n + 1)) * scale if n else np.array([])
    short = int((np.asarray(sklen) < 40).sum())
    k2 = max(5, int(round(11 / scale)) | 1)
    closed = cv2.morphologyEx(bgr, cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (k2, k2)))
    closed = cv2.medianBlur(closed, 5)
    Lb = cv2.cvtColor(closed, cv2.COLOR_BGR2LAB).astype(np.float32)
    Lb[..., 0] *= 100 / 255; Lb[..., 1] -= 128; Lb[..., 2] -= 128
    gx = sum(np.abs(cv2.Sobel(Lb[..., c], cv2.CV_32F, 1, 0, ksize=3)) for c in range(3))
    gy = sum(np.abs(cv2.Sobel(Lb[..., c], cv2.CV_32F, 0, 1, ksize=3)) for c in range(3))
    edges = (np.hypot(gx, gy) > 60) & v
    edges = zhang_suen(edges) if edges.sum() < 4e5 else edges
    near = ndi.binary_dilation(line, iterations=max(2, int(round(4 / scale))))
    seam = (edges & near).sum() / max(1, edges.sum())
    dt = ndi.distance_transform_edt(line)
    wid = (2 * dt[sk] - 1).clip(1) * scale if sk.any() else np.array([0.0])
    return {'line_px_pct': round(100 * float(line.sum() / max(1, v.sum())), 2),
            'strokes_per_mpx': int(n / area_mpx), 'short_strokes_per_mpx': int(short / area_mpx),
            'line_len_per_mpx': int(sk.sum() * scale / area_mpx), 'ends_per_mpx': int(ends / area_mpx),
            'edges_with_line_pct': round(100 * float(seam), 1), 'width_med_px': round(float(np.median(wid)), 2),
            'line_L_med': round(float(np.median(Lc[line])), 1) if line.any() else None}, line


# ---------------------------------------------------------------------------------------------------------- sky
def sky_profile(lab: np.ndarray, valid: np.ndarray, reg: dict, step: int = 10) -> dict:
    x0, x1 = reg['sky_col']
    y_end = reg['skyline']
    rows = np.nonzero(valid[:, (x0 + x1) // 2])[0]
    y_start = int(rows.min()) + 4
    excl = np.zeros(valid.shape, bool)
    tx0, ty0, tx1, ty1 = reg['title']
    excl[ty0 - 8:ty1 + 8, tx0 - 8:tx1 + 8] = True
    prof = []
    for y in range(y_start, y_end - step, step):
        sl = lab[y:y + step, x0:x1].reshape(-1, 3)
        ok = (valid[y:y + step, x0:x1] & ~excl[y:y + step, x0:x1]).ravel()
        if ok.sum() < 50:
            continue
        sl = sl[ok]
        med = np.median(sl, axis=0)
        keep = np.abs(sl[:, 0] - med[0]) < 4
        med = np.median(sl[keep], axis=0)
        L, C, h = lch(med)
        prof.append([y + step / 2, float(L), float(C), float(h), float(med[1]), float(med[2])])
    P = np.array(prof)
    n = len(P)
    def at(frac):
        i = min(n - 1, max(0, int(frac * (n - 1))))
        y, L, C, h, a, b = P[i]
        return {'y': int(y), 'L': round(L, 1), 'C': round(C, 1), 'h': round(h), 'hex': hexc([L, a, b])}
    top = P[: max(1, n // 10)]
    bot = P[-max(1, n // 10):]
    return {'top': at(0.02), 'mid': at(0.5), 'low': at(0.98),
            'dL_top_to_low': round(float(bot[:, 1].mean() - top[:, 1].mean()), 1),
            'dC_top_to_low': round(float(bot[:, 2].mean() - top[:, 2].mean()), 1),
            'dh_top_to_low': round(float(((bot[:, 3].mean() - top[:, 3].mean()) + 180) % 360 - 180)),
            'monotone_L': bool(np.all(np.diff(ndi.median_filter(P[:, 1], 5)) >= -0.15)),
            'rows': [[round(v, 2) for v in r] for r in P.tolist()]}


# -------------------------------------------------------------------------------------------------------- title
def title_metrics(rgb: np.ndarray, lab: np.ndarray, box, content_rows) -> dict:
    x0, y0, x1, y1 = box
    sub = lab[y0:y1, x0:x1]
    bg = np.median(sub[..., 0])
    ink = sub[..., 0] < bg - 18
    ink = ndi.binary_opening(ink, iterations=1)
    cc, n = ndi.label(ink, structure=np.ones((3, 3)))
    objs = ndi.find_objects(cc)
    letters = []
    for i, sl in enumerate(objs):
        if sl is None:
            continue
        area = (cc[sl] == i + 1).sum()
        hgt = sl[0].stop - sl[0].start
        if area < 25 or hgt < 8:
            continue
        letters.append([sl[1].start, sl[0].start, sl[1].stop, sl[0].stop, i + 1])
    letters.sort()
    # merge parts that overlap horizontally (none expected in caps; safety)
    merged = []
    for l in letters:
        if merged and l[0] <= merged[-1][2] - 1:
            m = merged[-1]
            merged[-1] = [min(m[0], l[0]), min(m[1], l[1]), max(m[2], l[2]), max(m[3], l[3]), m[4]]
        else:
            merged.append(l)
    if len(merged) < 2:
        return {}
    hs = np.array([m[3] - m[1] for m in merged])
    cap = float(np.median(hs))
    gaps = np.array([merged[i + 1][0] - merged[i][2] for i in range(len(merged) - 1)])
    pitch = np.array([(merged[i + 1][0] + merged[i + 1][2]) / 2 - (merged[i][0] + merged[i][2]) / 2 for i in range(len(merged) - 1)])
    word_gap = gaps > 2.5 * np.median(gaps)
    letter_gaps = gaps[~word_gap]
    core = ndi.binary_erosion(ink, iterations=1)
    col = stat(sub[core]) if core.any() else stat(sub[ink])
    # stroke width, blur-proof: the ink COVERAGE (0 at the paper, 1 at the letter core) over the centre-line length
    sk = zhang_suen(ink)
    ink_core_L = float(np.median(sub[..., 0][core])) if core.any() else float(np.min(sub[..., 0]))
    cov = np.clip((bg - sub[..., 0]) / max(1e-6, bg - ink_core_L), 0, 1) * ndi.binary_dilation(ink, iterations=2)
    ys, xs = np.nonzero(sk)
    diag = 0.0
    if len(xs):
        skp = np.pad(sk, 1)
        n_orth = sum((skp[1 + ys + dy, 1 + xs + dx]).sum() for dy, dx in ((0, 1), (1, 0)))
        n_diag = sum((skp[1 + ys + dy, 1 + xs + dx]).sum() for dy, dx in ((1, 1), (1, -1)))
        length = n_orth + n_diag * math.sqrt(2)
        stroke = float(cov.sum() / max(1.0, length))
    else:
        stroke = float('nan')
    gx0 = x0 + merged[0][0]; gx1 = x0 + merged[-1][2]
    gy0 = y0 + min(m[1] for m in merged); gy1 = y0 + max(m[3] for m in merged)
    W = rgb.shape[1]
    r0, r1 = content_rows
    bg_lab = np.median(sub[~ndi.binary_dilation(ink, iterations=3)].reshape(-1, 3), axis=0)
    ink_lab = np.median(sub[core].reshape(-1, 3), axis=0) if core.any() else np.median(sub[ink].reshape(-1, 3), axis=0)
    return {'letters': len(merged), 'cap_px': round(cap, 1), 'cap_pct_W': round(100 * cap / W, 2),
            'letter_gap_pct_cap': round(100 * float(np.median(letter_gaps)) / cap, 0),
            'pitch_pct_cap': round(100 * float(np.median(pitch[~word_gap])) / cap, 0),
            'word_gap_pct_cap': round(100 * float(gaps[word_gap].mean()) / cap, 0) if word_gap.any() else None,
            'stroke_px': round(stroke, 1), 'stroke_pct_cap': round(100 * stroke / cap, 1),
            'width_pct_W': round(100 * (gx1 - gx0) / W, 1), 'x_centre_pct_W': round(100 * (gx0 + gx1) / 2 / W, 1),
            'y_centre_pct_content': round(100 * ((gy0 + gy1) / 2 - r0) / (r1 - r0), 1),
            'box': [int(gx0), int(gy0), int(gx1), int(gy1)], 'colour': col,
            'contrast_on_sky': round(contrast_ratio(ink_lab, bg_lab), 1), 'sky_under': stat(bg_lab[None])}


# ------------------------------------------------------------------------------------------------------ patchwork
def smooth_for_blocks(rgb: np.ndarray) -> np.ndarray:
    """Grain and mottle off, edges kept: median 5 then a light bilateral (for segmentation)."""
    s = cv2.medianBlur(rgb, 5)
    return cv2.bilateralFilter(s, 7, 18, 5)


def patchwork(rgb: np.ndarray, valid: np.ndarray, box, scale: float = 220, min_size: int = 90) -> dict:
    from skimage.segmentation import felzenszwalb
    x0, y0, x1, y1 = box
    W = rgb.shape[1]
    sub = smooth_for_blocks(rgb[y0:y1, x0:x1])
    v = valid[y0:y1, x0:x1]
    f = 2
    sm = down(sub, f)
    vm = down_mask(v, f)
    seg = felzenszwalb(sm, scale=scale, sigma=0.6, min_size=min_size // (f * f) * 2)
    lab = srgb_to_lab(sm.astype(np.float64))
    n = seg.max() + 1
    cnt = np.bincount(seg.ravel(), minlength=n)
    means = np.stack([np.bincount(seg.ravel(), lab[..., c].ravel(), minlength=n) / np.maximum(1, cnt) for c in range(3)], -1)
    widths, heights, rect, areas = [], [], [], []
    for i, sl in enumerate(ndi.find_objects(seg + 1)):
        if sl is None or cnt[i] < 12:
            continue
        if not vm[sl].mean() > 0.9:
            continue
        bw = (sl[1].stop - sl[1].start) * f
        bh = (sl[0].stop - sl[0].start) * f
        widths.append(100 * bw / W)
        heights.append(100 * bh / W)
        rect.append(cnt[i] / ((sl[1].stop - sl[1].start) * (sl[0].stop - sl[0].start)))
        areas.append(cnt[i] * f * f)
    # adjacency: shared boundary length per pair
    pairs = {}
    for a, b in ((seg[:, 1:], seg[:, :-1]), (seg[1:], seg[:-1])):
        m = a != b
        for p, q in zip(a[m].ravel(), b[m].ravel()):
            key = (min(p, q), max(p, q))
            pairs[key] = pairs.get(key, 0) + 1
    dE, dL = [], []
    for (p, q), length in pairs.items():
        if length * f < 12 or cnt[p] < 12 or cnt[q] < 12:
            continue
        d = means[p] - means[q]
        dE.append(float(np.linalg.norm(d)))
        dL.append(abs(float(d[0])))
    # edge orientation on the smoothed L*
    L = srgb_to_lab(sub.astype(np.float64))[..., 0].astype(np.float32)
    gx = cv2.Sobel(L, cv2.CV_32F, 1, 0, ksize=3)
    gy = cv2.Sobel(L, cv2.CV_32F, 0, 1, ksize=3)
    mag = np.hypot(gx, gy)
    e = (mag > 12) & ndi.binary_erosion(v, iterations=3)
    ang = (np.degrees(np.arctan2(gy[e], gx[e])) + 180) % 180  # gradient direction; edge = +90
    edge_ang = (ang + 90) % 180
    def near(a0):
        d = np.abs(((edge_ang - a0) + 90) % 180 - 90)
        return float((d <= 7.5).mean() * 100) if len(edge_ang) else 0.0
    orient = {'level': round(near(0)), 'plumb': round(near(90)), 'diag45': round(near(45) + near(135)),
              'other': None}
    orient['other'] = 100 - orient['level'] - orient['plumb'] - orient['diag45']
    rect = np.array(rect)
    return {'segments': len(widths), 'w_med_pctW': round(float(np.median(widths)), 1) if widths else None,
            'w_p25_p75_pctW': [round(float(np.percentile(widths, 25)), 1), round(float(np.percentile(widths, 75)), 1)] if widths else None,
            'h_med_pctW': round(float(np.median(heights)), 1) if heights else None,
            'rectangular_pct': round(100 * float((rect > 0.85).mean()), 0) if len(rect) else None,
            'area_weighted_rect_pct': round(100 * float(((rect > 0.85) * np.array(areas)).sum() / max(1, np.sum(areas))), 0) if len(rect) else None,
            'nb_dE_med': round(float(np.median(dE)), 1) if dE else None,
            'nb_dE_p25_p75': [round(float(np.percentile(dE, 25)), 1), round(float(np.percentile(dE, 75)), 1)] if dE else None,
            'nb_dL_med': round(float(np.median(dL)), 1) if dL else None,
            'edge_orient_pct': orient}, seg


# -------------------------------------------------------------------------------------------- light, overlap, water
def box_lab(lab: np.ndarray, box) -> np.ndarray:
    x0, y0, x1, y1 = box
    return np.median(lab[y0:y1, x0:x1].reshape(-1, 3), axis=0)


def light_pair(lab: np.ndarray, lit, shade) -> dict:
    a, b = box_lab(lab, lit), box_lab(lab, shade)
    La, Ca, ha = lch(a)
    Lb, Cb, hb = lch(b)
    return {'lit': hexc(a), 'shade': hexc(b), 'lit_LCh': [round(float(La), 1), round(float(Ca), 1), round(float(ha))],
            'shade_LCh': [round(float(Lb), 1), round(float(Cb), 1), round(float(hb))],
            'dL': round(float(Lb - La), 1), 'C_ratio': round(float(Cb / max(0.5, Ca)), 2),
            'dh': round(float(((hb - ha) + 180) % 360 - 180)), 'dE': round(float(np.linalg.norm(a - b)), 1)}


def to_lin(lab):
    rgb = lab_to_srgb(lab) / 255
    return np.where(rgb <= 0.04045, rgb / 12.92, ((rgb + 0.055) / 1.055) ** 2.4)


def overlap(lab: np.ndarray, A, A2, B=None, B2=None) -> dict:
    """A = a ground, A2 = the same ground under the translucent plane (B, B2 a second ground, optional)."""
    a, a2 = to_lin(box_lab(lab, A)), to_lin(box_lab(lab, A2))
    out = {'A': hexc(box_lab(lab, A)), 'A_under': hexc(box_lab(lab, A2)),
           'dL': round(float(box_lab(lab, A2)[0] - box_lab(lab, A)[0]), 1),
           'dE': round(float(np.linalg.norm(box_lab(lab, A2) - box_lab(lab, A))), 1)}
    if B is not None:
        b, b2 = to_lin(box_lab(lab, B)), to_lin(box_lab(lab, B2))
        da, db = a - b, a2 - b2
        alpha = 1 - float(np.dot(da, db) / max(1e-9, np.dot(da, da)))  # (1 - alpha) = |a2 - b2| / |a - b|
        P = (a2 - (1 - alpha) * a) / max(1e-6, alpha)
        mult_a, mult_b = a2 / np.maximum(1e-6, a), b2 / np.maximum(1e-6, b)
        out.update({'B': hexc(box_lab(lab, B)), 'B_under': hexc(box_lab(lab, B2)), 'alpha': round(alpha, 2),
                    'plane_lin_rgb': [round(float(x), 3) for x in P],
                    'multiply_mismatch': round(float(np.abs(mult_a - mult_b).mean()), 3)})
    return out


def water_metrics(lab: np.ndarray, valid: np.ndarray, box, src=None) -> dict:
    x0, y0, x1, y1 = box
    L = lab[y0:y1, x0:x1, 0].astype(np.float32)
    sm = cv2.GaussianBlur(L, (0, 0), 1.2)
    gx = cv2.Sobel(sm, cv2.CV_32F, 1, 0, ksize=3)
    gy = cv2.Sobel(sm, cv2.CV_32F, 0, 1, ksize=3)
    out = {'colour': stat(lab[y0:y1, x0:x1]),
           'level_vs_plumb_edge_energy': round(float(np.abs(gy).sum() / max(1e-6, np.abs(gx).sum())), 2)}
    # bar height: ACF of the row-detrended profile down the water
    colmean = sm - cv2.GaussianBlur(sm, (0, 0), 12)
    prof = colmean.mean(1)
    if len(prof) > 20:
        p = prof - prof.mean()
        ac = np.correlate(p, p, 'full')[len(p) - 1:]
        ac /= max(1e-9, ac[0])
        z = np.nonzero(ac < 0)[0]
        out['bar_half_period_px'] = int(z[0]) if len(z) else None
    if src is not None:
        sx0, sy0, sx1, sy1 = src
        s = lab[sy0:sy1, sx0:sx1, 0].mean(0)
        w = lab[y0:y1, sx0:sx1, 0].mean(0)
        out['src_vs_water_col_corr'] = round(float(np.corrcoef(s, w)[0, 1]), 2)
        sl = box_lab(lab, src); wl = box_lab(lab, [sx0, y0, sx1, y1])
        out['src'] = hexc(sl); out['refl'] = hexc(wl)
        Ls, Cs, hs = lch(sl); Lw, Cw, hw = lch(wl)
        out['refl_minus_src'] = {'dL': round(float(Lw - Ls), 1), 'C_ratio': round(float(Cw / max(0.5, Cs)), 2),
                                 'dh': round(float(((hw - hs) + 180) % 360 - 180))}
    return out


def plane_profile(lab: np.ndarray, axis: str, at: int, a0: int, a1: int, band: int = 6, step: int = 4) -> dict:
    """Plateaus along a line across translucent planes: (from, to, L*, C*, h, hex) runs where the median colour holds
    within 1.2 dE76; the steps between neighbouring plateaus (dL*, dE)."""
    vals = []
    for p in range(a0, a1, step):
        px = lab[at - band:at + band, p:p + step] if axis == 'x' else lab[p:p + step, at - band:at + band]
        vals.append((p, np.median(px.reshape(-1, 3), 0)))
    runs = []
    for p, m in vals:
        if runs and np.linalg.norm(m - runs[-1]['m']) < 1.6:
            r = runs[-1]
            r['n'] += 1
            r['m'] = r['m'] + (m - r['m']) / r['n']
            r['to'] = p + step
        else:
            runs.append({'from': p, 'to': p + step, 'm': m, 'n': 1})
    runs = [r for r in runs if r['to'] - r['from'] >= 16]  # plateaus >= 16 px
    out = []
    for r in runs:
        L, C, h = lch(r['m'])
        out.append({'from': r['from'], 'to': r['to'], 'L': round(float(L), 1), 'C': round(float(C), 1),
                    'h': round(float(h)), 'hex': hexc(r['m']), 'band': band_name(float(L), float(C), float(h))})
    steps = [{'dL': round(out[i + 1]['L'] - out[i]['L'], 1),
              'dE': round(float(np.linalg.norm(runs[i + 1]['m'] - runs[i]['m'])), 1)} for i in range(len(out) - 1)]
    return {'axis': axis, 'at': at, 'plateaus': out, 'steps': steps}


def straight_edge_steps(rgb: np.ndarray, valid: np.ndarray, box, off: int = 5) -> dict:
    """The colour step across the patchwork's STRAIGHT edges: at level / plumb edge pixels (orientation within 7.5
    deg) of the smoothed image, dE76 and |dL*| between the two sides `off` px away."""
    x0, y0, x1, y1 = box
    sub = smooth_for_blocks(rgb[y0:y1, x0:x1])
    lab = srgb_to_lab(sub.astype(np.float64)).astype(np.float32)
    v = ndi.binary_erosion(valid[y0:y1, x0:x1], iterations=off + 2)
    gx = sum(cv2.Sobel(lab[..., c], cv2.CV_32F, 1, 0, ksize=3) ** 2 for c in range(3)) ** 0.5
    gy = sum(cv2.Sobel(lab[..., c], cv2.CV_32F, 0, 1, ksize=3) ** 2 for c in range(3)) ** 0.5
    mag = np.hypot(gx, gy)
    # thin to local maxima along the gradient axis (level edges: max in y; plumb: max in x)
    lvl = (gy > 3 * gx) & (mag > 10) & (mag >= ndi.maximum_filter(mag, size=(5, 1))) & v
    plb = (gx > 3 * gy) & (mag > 10) & (mag >= ndi.maximum_filter(mag, size=(1, 5))) & v
    H, W = mag.shape
    dE, dL = [], []
    for m, (dy, dx) in ((lvl, (off, 0)), (plb, (0, off))):
        ys, xs = np.nonzero(m)
        ok = (ys - dy >= 0) & (ys + dy < H) & (xs - dx >= 0) & (xs + dx < W)
        ys, xs = ys[ok], xs[ok]
        a = lab[ys - dy, xs - dx]; b = lab[ys + dy, xs + dx]
        dE.extend(np.linalg.norm(a - b, axis=1).tolist())
        dL.extend(np.abs(a[:, 0] - b[:, 0]).tolist())
    if not dE:
        return {}
    dE = np.array(dE); dL = np.array(dL)
    return {'edge_px': int(len(dE)), 'dE_med': round(float(np.median(dE)), 1),
            'dE_p25_p75': [round(float(np.percentile(dE, 25)), 1), round(float(np.percentile(dE, 75)), 1)],
            'dL_med': round(float(np.median(dL)), 1), 'soft_lt10_pct': round(100 * float((dE < 10).mean())),
            'straight_px_per_kpx': round(1000 * float((lvl | plb).sum()) / max(1, v.sum()), 1)}


def shade_steps(rgb: np.ndarray, valid: np.ndarray, k: int = 18, seed: int = 0) -> dict:
    """retro_tools/light/shadepairs.py's proxy (a frame's modelled shade): the area of flat colour regions that sit
    next to a lighter region of the same hue family (dL* 8-45, dh < 40 or both C* < 8, C* ratio 0.4-1.4)."""
    H, W = valid.shape
    s = 360 / W
    small = cv2.resize(rgb, (360, int(H * s)), interpolation=cv2.INTER_AREA)
    vm = cv2.resize(valid.astype(np.uint8), (360, int(H * s)), interpolation=cv2.INTER_NEAREST).astype(bool)
    lab = srgb_to_lab(small.astype(np.float64)).astype(np.float32)
    X = lab[vm]
    crit = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 30, 0.5)
    cv2.setRNGSeed(seed)
    _, lb, c = cv2.kmeans(X, k, None, crit, 3, cv2.KMEANS_PP_CENTERS)
    full = np.full(vm.shape, k, np.int32)
    full[vm] = lb.ravel()
    full = cv2.medianBlur(full.astype(np.uint8), 3).astype(np.int32)
    area = np.bincount(full.ravel(), minlength=k + 1)[:k] / max(1, vm.sum())
    adj = np.zeros((k + 1, k + 1))
    for a, b in ((full[:, 1:], full[:, :-1]), (full[1:], full[:-1])):
        m = a != b
        np.add.at(adj, (a[m], b[m]), 1)
        np.add.at(adj, (b[m], a[m]), 1)
    L = c[:, 0]; C = np.hypot(c[:, 1], c[:, 2]); Hh = np.degrees(np.arctan2(c[:, 2], c[:, 1]))
    shade, dLs, dhs, crs = set(), [], [], []
    for i in range(k):
        for j in range(k):
            if i == j or adj[i, j] < 0.15 * np.sqrt(area[j] * vm.sum()) * 2:
                continue
            dL = L[i] - L[j]
            if not (8 <= dL <= 45) or L[j] < 24:
                continue
            dh = abs((Hh[i] - Hh[j] + 180) % 360 - 180)
            if not ((C[i] > 8 and C[j] > 6 and dh < 40) or (C[i] < 8 and C[j] < 8)):
                continue
            if C[i] > 8 and not (0.4 <= C[j] / C[i] <= 1.4):
                continue
            if area[i] < area[j] * 0.8:
                continue
            shade.add(j); dLs.append(dL); dhs.append((Hh[j] - Hh[i] + 180) % 360 - 180); crs.append(C[j] / max(C[i], 1))
    return {'shade_area_pct': round(100 * float(sum(area[j] for j in shade)), 1),
            'dL_med': round(float(np.median(dLs)), 1) if dLs else None,
            'dh_med': round(float(np.median(dhs))) if dhs else None,
            'C_ratio_med': round(float(np.median(crs)), 2) if crs else None}


# --------------------------------------------------------------------------------------------- our films' frames
# Full-size frames pulled from the masters (README "Inputs"): ffmpeg -ss <t> -i <master> -frames:v 1 <out>.png.
# Canvas px (1080 x 1920). The caption band (y 290-600) is the sky's quiet field: sky boxes sit under the caption line.
OURS: dict[str, dict] = {
    'v2_t1.0.png': {'film': 'v2 S1', 'sky': [40, 380, 1040, 445], 'sky_col': [300, 1000], 'skyline': 600,
                    'title': [0, 230, 1080, 375], 'ground': [0, 1300, 1080, 1900],
                    'regions': {'ground': [0, 1300, 1080, 1900], 'far city': [0, 600, 330, 900]},
                    'water': {'canal (lib/water)': {'box': [300, 1110, 900, 1200], 'src': [300, 1000, 900, 1100]}}},
    'v2_t9.0.png': {'film': 'v2 S2', 'sky': [40, 380, 1040, 445], 'title': [0, 230, 1080, 375],
                    'regions': {'ground': [0, 1300, 1080, 1900]}},
    'v2_t17.5.png': {'film': 'v2 S4', 'sky': [40, 380, 1040, 445], 'title': [0, 230, 1080, 375],
                     'regions': {'ground': [0, 1300, 1080, 1900]}},
    'v2_t22.0.png': {'film': 'v2 S5', 'sky': [40, 380, 1040, 445], 'sky_col': [100, 980], 'skyline': 600,
                     'title': [0, 230, 1080, 375], 'regions': {'ground': [0, 1300, 1080, 1900]}},
    'v2_t36.0.png': {'film': 'v2 S8', 'sky': [40, 380, 1040, 445], 'title': [0, 230, 1080, 375],
                     'regions': {'ground': [0, 1300, 1080, 1900]}},
    'v1_t20.5.png': {'film': 'v1 @20.5', 'regions': {}},
    'v1_t38.5.png': {'film': 'v1 @38.5', 'regions': {}},
    'v3_t13.0.png': {'film': 'v3 @13', 'regions': {}},
    'v3_t29.0.png': {'film': 'v3 @29', 'regions': {}},
}
FRAME_TIMES = {'v2': ('deliverables/v2/v2r_G7_master_v1.mp4', [1.0, 9.0, 17.5, 22.0, 36.0]),
               'v1': ('deliverables/v1/php2shell_final.mp4', [20.5, 38.5]),
               'v3': ('deliverables/v3/v3_final.mp4', [13.0, 29.0])}


def scratch_dir() -> Path:
    for c in (os.environ.get('CLAUDE_SCRATCH'), '/tmp/posters-style'):
        if c:
            return Path(c)
    return Path('/tmp/posters-style')


def pull_frames(dest: Path) -> None:
    """Our films' frames at full size (decoded with their own BT.709 tags)."""
    dest.mkdir(parents=True, exist_ok=True)
    for film, (master, times) in FRAME_TIMES.items():
        for t in times:
            out = dest / f'{film}_t{t}.png'
            if not out.exists():
                subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', str(t), '-i', str(VIDEO / master), '-frames:v', '1',
                                str(out)], check=True)


# ---------------------------------------------------------------------------------------------------- measure
def measure_one(path: Path, reg: dict | None, mask_spec: dict, caption_band=None) -> dict:
    rgb, valid = load_image(path, mask_spec)
    lab = srgb_to_lab(rgb.astype(np.float64))
    res: dict = {'file': path.name, 'size': [rgb.shape[1], rgb.shape[0]]}
    cr = (mask_spec.get(path.name) or {}).get('content_rows', [0, rgb.shape[0]])
    res['colour'] = colour(rgb, valid, reg if reg and 'hero' in reg else None)
    if reg and 'sky' in reg:
        sky = box_mask(valid.shape, [0, 0, rgb.shape[1], reg.get('skyline', reg['sky'][3])])
        res['grain'] = {'all': grain(lab, valid), 'sky': grain(lab, valid, region=sky),
                        'below_sky': grain(lab, valid, region=~sky)}
        res['mottling_sky'] = mottling(lab, valid, reg['sky'])
    else:
        res['grain'] = {'all': grain(lab, valid)}
    lm, _ = line_metrics(rgb, valid, band=caption_band)
    res['line'] = lm
    res['shade_steps'] = shade_steps(rgb, valid)
    if reg:
        if 'sky_col' in reg:
            res['sky_profile'] = sky_profile(lab, valid, reg)
        if 'hero' in reg and 'title' in reg:
            res['title'] = title_metrics(rgb, lab, reg['title'], cr)
        res['patch'] = {}
        for name, box in reg.get('regions', {}).items():
            pw, _ = patchwork(rgb, valid, box)
            pw['straight_steps'] = straight_edge_steps(rgb, valid, box)
            x0, y0, x1, y1 = box
            sub_valid = np.zeros_like(valid); sub_valid[y0:y1, x0:x1] = valid[y0:y1, x0:x1]
            pw['line'], _ = line_metrics(rgb, sub_valid)
            res['patch'][name] = pw
        res['light'] = {n: light_pair(lab, a, b) for n, (a, b) in reg.get('light', {}).items()}
        res['planes'] = [plane_profile(lab, *p) for p in reg.get('planes', [])]
        res['water'] = {n: water_metrics(lab, valid, w['box'], w.get('src')) for n, w in reg.get('water', {}).items()}
    return res


def cmd_measure(a) -> None:
    ms = load_mask_spec()
    out: dict = {'posters': {}, 'ours': {}}
    if a.images:
        for p in a.images:
            out['posters'][Path(p).name] = measure_one(Path(p), None, ms)
            print('measured', p, file=sys.stderr)
    else:
        for name, reg in POSTERS.items():
            out['posters'][name] = measure_one(REFS / name, reg, ms)
            print('measured', name, file=sys.stderr)
        fr = Path(a.frames)
        pull_frames(fr)
        for name, reg in OURS.items():
            band = (290, 600) if name.startswith('v2') else None
            out['ours'][name] = measure_one(fr / name, reg, ms, caption_band=band)
            print('measured', name, file=sys.stderr)
        # the cover
        cov = VIDEO / 'deliverables/v2/v2r_cover.png'
        if cov.exists():
            out['ours']['v2_cover'] = measure_one(cov, {'film': 'v2 cover', 'regions': {}}, ms)
    Path(a.out).parent.mkdir(parents=True, exist_ok=True)
    Path(a.out).write_text(json.dumps(out, indent=1, default=float))
    print('wrote', a.out)


# -------------------------------------------------------------------------------------------------------- dna
DNA = {  # scripts/look/palette_board.py's house DNA (kept in step with it)
    'bg': lambda L, C: L >= 75 and C <= 20,
    'ground': lambda L, C: L >= 60 and C <= 45,
    'disc': lambda L, C: L >= 55,
    'hero': lambda L, C: C >= 30 and 35 <= L <= 72,
    'anchor': lambda L, C: L <= 40,
    'pop': lambda L, C: C >= 50 and L >= 50,
    'ink': lambda L, C: L <= 25,
}


def dna_check(p: dict) -> list[str]:
    c = p['colors']
    issues = []
    for role, ok in DNA.items():
        L, C, h = lch(hex_lab(c[role]))
        if not ok(float(L), float(C)):
            issues.append(f'{role} {c[role]} L{float(L):.0f} C{float(C):.0f}')
    for role, hx in list(c.items()) + [(f"{k}.{i}", h) for k, v in p.get('support', {}).items() for i, h in enumerate(v['colors'])]:
        L, C, h = lch(hex_lab(hx))
        b = band_name(float(L), float(C), float(h))
        if b:
            issues.append(f'{role} {hx} in the {b} band (L{float(L):.0f} C{float(C):.0f} h{float(h):.0f})')
    if contrast_ratio(hex_lab(c['ink']), hex_lab(c['bg'])) < 7:
        issues.append(f"ink/bg contrast {contrast_ratio(hex_lab(c['ink']), hex_lab(c['bg'])):.1f} < 7")
    if contrast_ratio(hex_lab(c['hero']), hex_lab(c['bg'])) < 2.2:
        issues.append(f"hero/bg contrast {contrast_ratio(hex_lab(c['hero']), hex_lab(c['bg'])):.1f} < 2.2")
    return issues


def cmd_dna(a) -> None:
    data = json.loads(Path(a.palettes).read_text())
    for p in data['palettes'] if 'palettes' in data else [data]:
        iss = dna_check(p)
        roles = ' '.join(f"{k} {v} (L{float(lch(hex_lab(v))[0]):.0f}/C{float(lch(hex_lab(v))[1]):.0f}/h{float(lch(hex_lab(v))[2]):.0f})" for k, v in p['colors'].items())
        print(f"{p['name']}: {'OK' if not iss else 'ISSUES: ' + '; '.join(iss)}\n   {roles}")


# ------------------------------------------------------------------------------------------------------- main
def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__.split('\n')[0])
    sub = ap.add_subparsers(dest='cmd', required=True)
    m = sub.add_parser('measure', help='measure the posters and our frames (or --images)')
    m.add_argument('--out', default=str(scratch_dir() / 'style.json'))
    m.add_argument('--frames', default=str(scratch_dir() / 'frames'), help='where our films\' frames are pulled to')
    m.add_argument('--images', nargs='*', help='measure these stills instead (no regions)')
    s = sub.add_parser('sheets', help='draw the measurement sheets')
    s.add_argument('--json', default=str(scratch_dir() / 'style.json'))
    s.add_argument('--img', default=str(STUDY / 'img'))
    s.add_argument('--frames', default=str(scratch_dir() / 'frames'))
    e = sub.add_parser('encode-test', help='a texture overlay through H.264 (master and platform-like re-encode)')
    e.add_argument('--frame', required=True, help='a 1080 x 1920 still (our film)')
    e.add_argument('--out', default=str(scratch_dir() / 'enc'))
    e.add_argument('--grain', type=float, default=0.9, help='grain std (L*) to add')
    e.add_argument('--grain-px', type=float, default=1.3, help='grain size (Gaussian sigma of the noise, px)')
    e.add_argument('--mottle', type=float, default=1.5, help='mottling std (L*) to add')
    e.add_argument('--mottle-px', type=float, default=18, help='mottling scale (sigma, px)')
    e.add_argument('--seconds', type=float, default=2.0)
    d = sub.add_parser('dna', help="check palettes (palettes.json format) against the house DNA and never bands")
    d.add_argument('--palettes', required=True)
    a = ap.parse_args()
    {'measure': cmd_measure, 'dna': cmd_dna,
     'sheets': lambda a: cmd_sheets(a), 'encode-test': lambda a: cmd_encode(a)}[a.cmd](a)


if __name__ == '__main__':
    main()
