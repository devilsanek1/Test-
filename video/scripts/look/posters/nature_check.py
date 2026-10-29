#!/usr/bin/env python3
"""nature_check.py -- the nature lane's meter for the 7 s look test (city-poster study, STUDY.md §10 items 8-9; notes
docs/studies/2026-10-28_city_posters/test/ENGINE_NATURE.md). Two modes:

  still   pro_3_nature.py's per-sample metrics (its own functions, so the numbers compare with the study's posters and
          v2's tree) on a box of a rendered still, the foliage masked by CIE colour (greens h 115-200, C* >= 6, plus the
          autumn leaves h 40-90 C* >= 25), and CRAFT §e's local contrast (mean |L* - Gaussian(L*, 16)| at 1080 wide)
          inside the box. Targets (pro_3 N1): near: 4 tones in 6-10 L* steps, range <= 30, mean L* 42-55, roughness
          >= 1.3, local contrast <= 9; mid: 3-4 tones, mean 45-60, <= 7; far: 2-3 tones, >= 40 % straight edge, <= 4.

            python3 -I scripts/look/posters/nature_check.py still --img f.png --box 0 600 760 1320 --band near

  motion  twinkle and boil on a PNG sequence rendered at 1:1 (a scaled render turns 2 px into 1 px and fakes a
          twinkle). TWINKLE (the details lens's measure, details.md §3): a thin feature's CORE contrast swings as it
          straddles pixels; per 64 px tile, the core contrast is the p99 of the thin-feature map (a 5 x 5 morphological
          top-hat of L*, bright + dark) and the twinkle is its swing over time ((p95 - p5) / mean, after removing the slow
          trend of the motion itself); the VISIBLE swing is twinkle x the core contrast (L*: keep it <= ~2 on anything that
          floats). BOIL: frame-to-frame change spikes (max / median of the mean |dL*| per frame) and, with --still DIR (the
          same window rendered with the wind and the float off), any pixel that changes at all.
          --cal x0 y0 x1 y1 [x0 y0 x1 y1 ...] names calibration boxes (the check composition draws a 1 px and a 2 px
          line moving like the near plane) so the foliage's numbers read against a known twinkle.

            python3 -I scripts/look/posters/nature_check.py motion --frames DIR [--still DIR] [--cal ...] [--out json]

  twinkle the clean test (motion cannot confound it): the same still frame moved by pure sub-pixel translations,
          0-1 px in 0.1 px steps along x (frames 0-10) then y (11-21) (the demo's NatureTwinkle). Per 32 px tile the
          core contrast (p99 of the 5 x 5 top-hat, the tile's 3 px border left out) across the 11 phases of each axis:
          twinkle = (max - min) / mean, visible = max - min (L*). Calibrated by the same --cal boxes (1 px line ~0.5-0.6,
          2 px line 0).

            python3 -I scripts/look/posters/nature_check.py twinkle --frames DIR [--cal ...] [--out json]
"""
import argparse
import glob
import importlib.util
import json
import os

import numpy as np
import cv2
from PIL import Image
from skimage import color as skcolor

HERE = os.path.dirname(os.path.abspath(__file__))


def _pro3():
    spec = importlib.util.spec_from_file_location('pro_3_nature', os.path.join(HERE, 'pro_3_nature.py'))
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def lab_of(path):
    rgb = np.asarray(Image.open(path).convert('RGB')).astype(np.float32) / 255.0
    return rgb, skcolor.rgb2lab(rgb)


def foliage_mask(lab, rule='nature'):
    L, a, b = lab[..., 0], lab[..., 1], lab[..., 2]
    C = np.hypot(a, b)
    h = (np.degrees(np.arctan2(b, a)) + 360) % 360
    green = (h >= 115) & (h <= 200) & (C >= 6) & (L < 82)
    autumn = (h >= 40) & (h <= 90) & (C >= 25) & (L < 82)
    if rule == 'green':
        return green
    return green | autumn


def local_contrast(L):
    """CRAFT §e: mean |L* - Gaussian(L*, sigma 16)| (1080 wide)."""
    return np.abs(L - cv2.GaussianBlur(L, (0, 0), 16))


def still(args):
    p3 = _pro3()
    rgb, lab = lab_of(args.img)
    scale = 1080.0 / rgb.shape[1]
    x0, y0, x1, y1 = args.box
    sub = lab[y0:y1, x0:x1]
    L = sub[..., 0].astype(np.float32)
    mask = p3.clean(foliage_mask(sub, args.rule))
    out = {'img': args.img, 'box': args.box, 'band': args.band, 'mask_px': int(mask.sum())}
    if mask.sum() < 400:
        out['error'] = 'mask too small'
        print(json.dumps(out, indent=1))
        return out
    m = p3.sample_metrics(L, mask, y0, scale)
    c = p3.contour_metrics(mask, scale) or {}
    lc = local_contrast(lab[..., 0].astype(np.float32))[y0:y1, x0:x1]
    m.update({k: round(v, 3) if isinstance(v, float) else v for k, v in c.items()})
    m['local_contrast_mask'] = round(float(lc[mask].mean()), 2)
    m['local_contrast_box'] = round(float(lc.mean()), 2)
    out.update(m)
    tgt = {'near': dict(tones=(4, 6), steps=(6, 10), range=30, mean=(42, 55), rough=1.3, lc=9),
           'mid': dict(tones=(3, 4), steps=(6, 10), range=30, mean=(45, 60), rough=1.15, lc=7),
           'far': dict(tones=(2, 3), steps=(4, 6), range=15, mean=(45, 80), rough=None, lc=4)}[args.band]
    notes = []
    if not (tgt['tones'][0] <= len(m['values']) <= tgt['tones'][1]):
        notes.append(f"tones {len(m['values'])} (want {tgt['tones'][0]}-{tgt['tones'][1]})")
    if m['steps'] and (min(m['steps']) < tgt['steps'][0] - 1 or max(m['steps']) > tgt['steps'][1] + 1):
        notes.append(f"steps {m['steps']} (want {tgt['steps'][0]}-{tgt['steps'][1]})")
    if m['range'] > tgt['range'] + 1:
        notes.append(f"range {m['range']} (<= {tgt['range']})")
    if not (tgt['mean'][0] <= m['L_mean'] <= tgt['mean'][1]):
        notes.append(f"mean L* {m['L_mean']} (want {tgt['mean'][0]}-{tgt['mean'][1]})")
    if tgt['rough'] and c and c.get('rough', 9) < tgt['rough']:
        notes.append(f"roughness {c['rough']:.2f} (>= {tgt['rough']})")
    if m['local_contrast_mask'] > tgt['lc']:
        notes.append(f"local contrast {m['local_contrast_mask']} (<= {tgt['lc']})")
    out['warn'] = notes
    print(json.dumps(out, indent=1))
    return out


def thin_map(L):
    """Bright and dark features up to ~4 px wide: a 5 x 5 top-hat of L* (white + black). (A 3 x 3 element under-reads a
    2 px line whenever it straddles three rows, and fakes a twinkle on it.)"""
    k = np.ones((5, 5), np.uint8)
    return (L - cv2.morphologyEx(L, cv2.MORPH_OPEN, k)) + (cv2.morphologyEx(L, cv2.MORPH_CLOSE, k) - L)


def motion(args):
    files = sorted(glob.glob(os.path.join(args.frames, '*.png')))
    if len(files) < 8:
        raise SystemExit(f'need a PNG sequence in {args.frames}')
    Ls = np.stack([lab_of(f)[1][..., 0].astype(np.float32) for f in files])
    T, Hh, Ww = Ls.shape
    # frame-to-frame change (boil shows as spikes; a calm sway as a low, even level)
    d = np.abs(np.diff(Ls, axis=0)).mean(axis=(1, 2))
    out = {'frames': T, 'size': [Ww, Hh], 'mean_dL_per_frame': {'median': round(float(np.median(d)), 4), 'max': round(float(d.max()), 4), 'max_over_median': round(float(d.max() / max(1e-6, np.median(d))), 2)}}
    # twinkle per 64 px tile: the core contrast (p99 of the thin map) and its swing over time, the slow trend removed
    tile = 64
    TH = np.stack([thin_map(L) for L in Ls])
    rows = []
    for ty in range(0, Hh - tile + 1, tile):
        for tx in range(0, Ww - tile + 1, tile):
            core = np.percentile(TH[:, ty:ty + tile, tx:tx + tile].reshape(T, -1), 99, axis=1)
            mean = float(core.mean())
            if mean < 1.0:
                continue
            k = 15
            trend = np.convolve(np.pad(core, (k // 2, k // 2), mode='edge'), np.ones(k) / k, mode='valid')
            res = core - trend
            swing = float(np.percentile(res, 95) - np.percentile(res, 5))
            rows.append({'tile': [tx, ty], 'core_L': round(mean, 2), 'twinkle': round(swing / mean, 3), 'visible_L': round(swing, 2)})
    rows.sort(key=lambda r: -r['visible_L'])
    out['tiles'] = len(rows)
    out['worst_tiles'] = rows[:8]
    out['tiles_visible_over_2L'] = sum(1 for r in rows if r['visible_L'] > 2.0)
    vis = [r['visible_L'] for r in rows]
    out['visible_L'] = {'p50': round(float(np.median(vis)), 3) if vis else 0, 'p95': round(float(np.percentile(vis, 95)), 3) if vis else 0, 'max': round(float(max(vis)), 3) if vis else 0}
    # calibration boxes: the same measure on known lines
    if args.cal:
        cal = []
        for i in range(0, len(args.cal), 4):
            x0, y0, x1, y1 = args.cal[i:i + 4]
            core = np.percentile(TH[:, y0:y1, x0:x1].reshape(T, -1), 99.5, axis=1)
            k = 15
            trend = np.convolve(np.pad(core, (k // 2, k // 2), mode='edge'), np.ones(k) / k, mode='valid')
            res = core - trend
            swing = float(np.percentile(res, 95) - np.percentile(res, 5))
            cal.append({'box': [x0, y0, x1, y1], 'core_L': round(float(core.mean()), 2), 'twinkle': round(swing / max(1e-6, float(core.mean())), 3), 'visible_L': round(swing, 2)})
        out['calibration'] = cal
    # boil: the same window with the wind and the float off must not change at all
    if args.still:
        sf = sorted(glob.glob(os.path.join(args.still, '*.png')))
        if sf:
            a = np.asarray(Image.open(sf[0]).convert('RGB')).astype(np.int16)
            diffs = []
            for f in sf[1:]:
                b = np.asarray(Image.open(f).convert('RGB')).astype(np.int16)
                diffs.append(int((np.abs(a - b).max(axis=2) > 0).sum()))
            out['still_changed_px'] = {'frames': len(sf), 'max': max(diffs) if diffs else 0}
    print(json.dumps(out, indent=1))
    if args.out:
        json.dump(out, open(args.out, 'w'), indent=1)
    return out


def twinkle(args):
    files = sorted(glob.glob(os.path.join(args.frames, '*.png')))
    if len(files) < 22:
        raise SystemExit(f'need the 22-frame sub-pixel sequence in {args.frames}')
    TH = np.stack([thin_map(lab_of(f)[1][..., 0].astype(np.float32)) for f in files[:22]])
    _, Hh, Ww = TH.shape
    tile, b = 32, 3

    def core_of(x0, y0, x1, y1, q=99):
        return np.percentile(TH[:, y0:y1, x0:x1].reshape(22, -1), q, axis=1)

    rows = []
    for ty in range(0, Hh - tile + 1, tile):
        for tx in range(0, Ww - tile + 1, tile):
            c = core_of(tx + b, ty + b, tx + tile - b, ty + tile - b)
            m = float(c.mean())
            if m < 2.0:
                continue
            sw = max(float(c[:11].max() - c[:11].min()), float(c[11:].max() - c[11:].min()))
            rows.append({'tile': [tx, ty], 'core_L': round(m, 2), 'twinkle': round(sw / m, 3), 'visible_L': round(sw, 2)})
    rows.sort(key=lambda r: -r['visible_L'])
    vis = [r['visible_L'] for r in rows]
    out = {'tiles': len(rows), 'visible_L': {'p50': round(float(np.median(vis)), 3), 'p90': round(float(np.percentile(vis, 90)), 3), 'p99': round(float(np.percentile(vis, 99)), 3), 'max': round(float(max(vis)), 3)},
           'tiles_visible_over_2L': sum(1 for v in vis if v > 2.0), 'worst_tiles': rows[:10]}
    if args.cal:
        cal = []
        for i in range(0, len(args.cal), 4):
            x0, y0, x1, y1 = args.cal[i:i + 4]
            c = core_of(x0, y0, x1, y1, 99.5)
            sw = max(float(c[:11].max() - c[:11].min()), float(c[11:].max() - c[11:].min()))
            cal.append({'box': [x0, y0, x1, y1], 'core_L': round(float(c.mean()), 2), 'twinkle': round(sw / max(1e-6, float(c.mean())), 3), 'visible_L': round(sw, 2)})
        out['calibration'] = cal
    print(json.dumps(out, indent=1))
    if args.out:
        json.dump(out, open(args.out, 'w'), indent=1)
    return out


def main():
    ap = argparse.ArgumentParser()
    sp = ap.add_subparsers(dest='mode', required=True)
    s = sp.add_parser('still')
    s.add_argument('--img', required=True)
    s.add_argument('--box', type=int, nargs=4, required=True)
    s.add_argument('--band', choices=['near', 'mid', 'far'], default='near')
    s.add_argument('--rule', choices=['nature', 'green'], default='nature')
    m = sp.add_parser('motion')
    m.add_argument('--frames', required=True)
    m.add_argument('--still')
    m.add_argument('--cal', type=int, nargs='*')
    m.add_argument('--out')
    w = sp.add_parser('twinkle')
    w.add_argument('--frames', required=True)
    w.add_argument('--cal', type=int, nargs='*')
    w.add_argument('--out')
    args = ap.parse_args()
    {'still': still, 'motion': motion, 'twinkle': twinkle}[args.mode](args)


if __name__ == '__main__':
    main()
