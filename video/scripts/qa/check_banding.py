#!/usr/bin/env python3
"""check_banding.py: BANDING in a sky (docs/look/CRAFT.md §g "Check"; lib/sky.tsx), on a rendered frame (PNG) or a
video (mp4: decoded at 16 bits with its own colour tags, so the measurement adds no rounding of its own), before and
after any encode. It finds the sky's vertical profile in narrow strips and looks for a STAIRCASE: flat plateaus with
sudden steps, the thing the eye reads as bands (a smooth or properly dithered gradient changes a little on every row).

  python3 -I scripts/qa/check_banding.py frame.png --region 0,0,330,790
  python3 -I scripts/qa/check_banding.py clip.mp4 --region 0,0,330,790 --times 0.5,1.5,2.5 --json out.json
  python3 -I scripts/qa/check_banding.py frame.png --region 0,0,1080,600 --band 317,556 --max-dl 1.5 --plot prof.png

The measures (canvas px at 1080 wide; CIE L*, a*, b* D65; Y = relative luminance):
  profile    per strip (default 64 px wide) and row, the mean colour of the SKY pixels (within 2.5 L* of the row's
             median: caption ink, objects and their edges are left out); a row change over 5 L* or 8 dE76 splits the
             profile (an object edge: a roofline, the sun's disc; never a band).
  step       a local peak of the 3-row colour change (dE76), at least max(0.12, 2.5x the local median change): with a
             flat run on each side it is a band edge. Its size: dL*, dE00 and the luminance contrast c = dY / Y of the
             plateaus.
  plateau    the run between two steps (px). Short plateaus (< 8 px) are a fine texture the eye averages away.
  visible    a step at or over the JND with plateaus >= 8 px on both sides. The JND is CAMBI's (Netflix, libvmaf):
             c >= 0.019 (its tvi_threshold, a Weber fraction on a BT.1886 display; ~0.6 L* at L* 85), or dE00 >= 1.0
             (a chroma band: CAMBI reads luma only).
  weak       c >= 0.010 or dE00 >= 0.5 with plateaus >= 16 px: below the JND on a calm display, near it on a phone at full
             brightness in the dark (one 8-bit code at L* 85 is c ~0.013).
  staircase  the share of the profile's total change that happens in its steps (0 smooth, 1 pure steps).
  grain      the std of the sky pixels' L* round their row mean: the dither's visible amplitude (<= 0.6 L*: invisible).
  band       the caption band's flatness: the range of its rows' sky L* (budget --max-dl, default 1.5: CRAFT §g).
Verdict: FAIL if any visible step or the band over its budget; WARN if 3+ weak steps in a strip, or grain > 0.6 L*;
else PASS. Exit 1 on FAIL. Several frames: the worst counts.
"""
from __future__ import annotations

import argparse
import json
import math
import subprocess
import sys

import cv2
import numpy as np
from scipy.ndimage import gaussian_filter1d, median_filter

sys.dont_write_bytecode = True

JND_C = 0.019  # CAMBI tvi_threshold (libvmaf cambi.c DEFAULT_CAMBI_TVI)
JND_DE = 1.0
WEAK_C = 0.010
WEAK_DE = 0.5
MIN_PLATEAU = 8
WEAK_PLATEAU = 16
GRAIN_MAX = 0.6


# ---------------------------------------------------------------- colour

def srgb_to_lin(c: np.ndarray) -> np.ndarray:
    return np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)


def rgb_to_lab_y(rgb: np.ndarray) -> tuple[np.ndarray, np.ndarray]:
    """sRGB 0..1 float (H, W, 3) -> CIE Lab D65 (H, W, 3) and relative luminance Y (H, W)."""
    lin = srgb_to_lin(rgb)
    X = (lin @ np.array([0.4124564, 0.3575761, 0.1804375])) / 0.95047
    Y = lin @ np.array([0.2126729, 0.7151522, 0.0721750])
    Z = (lin @ np.array([0.0193339, 0.1191920, 0.9503041])) / 1.08883

    def f(t):
        return np.where(t > 216 / 24389, np.cbrt(t), (24389 / 27 * t + 16) / 116)

    fy = f(Y)
    lab = np.stack([116 * fy - 16, 500 * (f(X) - fy), 200 * (fy - f(Z))], -1)
    return lab, Y


def de2000(a: np.ndarray, b: np.ndarray) -> np.ndarray:
    """CIEDE2000 between Lab arrays (..., 3) (Sharma, Wu, Dalal 2005)."""
    L1, a1, b1 = a[..., 0], a[..., 1], a[..., 2]
    L2, a2, b2 = b[..., 0], b[..., 1], b[..., 2]
    C1 = np.hypot(a1, b1)
    C2 = np.hypot(a2, b2)
    Cm = (C1 + C2) / 2
    G = 0.5 * (1 - np.sqrt(Cm ** 7 / (Cm ** 7 + 25 ** 7)))
    a1p, a2p = (1 + G) * a1, (1 + G) * a2
    C1p, C2p = np.hypot(a1p, b1), np.hypot(a2p, b2)
    h1p = np.degrees(np.arctan2(b1, a1p)) % 360
    h2p = np.degrees(np.arctan2(b2, a2p)) % 360
    dLp = L2 - L1
    dCp = C2p - C1p
    dh = h2p - h1p
    dh = np.where(C1p * C2p == 0, 0, np.where(dh > 180, dh - 360, np.where(dh < -180, dh + 360, dh)))
    dHp = 2 * np.sqrt(C1p * C2p) * np.sin(np.radians(dh / 2))
    Lpm = (L1 + L2) / 2
    Cpm = (C1p + C2p) / 2
    hs = h1p + h2p
    hpm = np.where(C1p * C2p == 0, hs, np.where(np.abs(h1p - h2p) <= 180, hs / 2, np.where(hs < 360, (hs + 360) / 2, (hs - 360) / 2)))
    T = 1 - 0.17 * np.cos(np.radians(hpm - 30)) + 0.24 * np.cos(np.radians(2 * hpm)) + 0.32 * np.cos(np.radians(3 * hpm + 6)) - 0.20 * np.cos(np.radians(4 * hpm - 63))
    dth = 30 * np.exp(-(((hpm - 275) / 25) ** 2))
    Rc = 2 * np.sqrt(Cpm ** 7 / (Cpm ** 7 + 25 ** 7))
    Sl = 1 + 0.015 * (Lpm - 50) ** 2 / np.sqrt(20 + (Lpm - 50) ** 2)
    Sc = 1 + 0.045 * Cpm
    Sh = 1 + 0.015 * Cpm * T
    Rt = -np.sin(np.radians(2 * dth)) * Rc
    return np.sqrt((dLp / Sl) ** 2 + (dCp / Sc) ** 2 + (dHp / Sh) ** 2 + Rt * (dCp / Sc) * (dHp / Sh))


# ---------------------------------------------------------------- input

def probe(path: str) -> dict:
    out = subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries',
                          'stream=width,height,pix_fmt,color_space,color_range,color_transfer,color_primaries,r_frame_rate:format=duration',
                          '-of', 'json', path], capture_output=True, text=True, check=True)
    j = json.loads(out.stdout)
    s = j['streams'][0]
    s['duration'] = float(j.get('format', {}).get('duration', 0) or 0)
    return s


def decode(path: str, t: float, info: dict) -> np.ndarray:
    """One frame at t s as sRGB float 0..1, through ffmpeg at 16 bits: the stream's own matrix and range (untagged =
    BT.601, like Remotion's 'default'; yuvj = full range)."""
    cs = (info.get('color_space') or '').lower()
    matrix = 'bt709' if cs == 'bt709' else 'bt2020' if cs.startswith('bt2020') else 'bt601'
    pf = info.get('pix_fmt', '')
    full = pf.startswith('yuvj') or (info.get('color_range') == 'pc')
    vf = f"scale=in_color_matrix={matrix}:in_range={'pc' if full else 'tv'}:out_range=pc:flags=bicubic+accurate_rnd+full_chroma_int,format=rgb48le"
    w, h = int(info['width']), int(info['height'])
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-ss', f'{t:.4f}', '-i', path, '-frames:v', '1', '-vf', vf, '-f', 'rawvideo', '-pix_fmt', 'rgb48le', '-'],
                         capture_output=True, check=True).stdout
    if len(raw) < w * h * 6:
        raise SystemExit(f'could not decode {path} at {t} s')
    return np.frombuffer(raw[: w * h * 6], dtype='<u2').reshape(h, w, 3).astype(np.float64) / 65535.0


def load_png(path: str) -> np.ndarray:
    im = cv2.imread(path, cv2.IMREAD_UNCHANGED)
    if im is None:
        raise SystemExit(f'cannot read {path}')
    if im.ndim == 2:
        im = np.stack([im] * 3, -1)
    im = im[..., :3][..., ::-1]
    scale = 65535.0 if im.dtype == np.uint16 else 255.0
    return im.astype(np.float64) / scale


# ---------------------------------------------------------------- the measures

def sky_profile(lab: np.ndarray, Y: np.ndarray):
    """Rows -> mean Lab / Y of the sky pixels (within 2.5 L* of the row median); valid = >= 60 % of the row is sky."""
    L = lab[..., 0]
    med = np.median(L, axis=1, keepdims=True)
    ok = np.abs(L - med) <= 2.5
    n = ok.sum(1)
    valid = n >= 0.6 * L.shape[1]
    nn = np.maximum(n, 1)[:, None]
    prof = (lab * ok[..., None]).sum(1) / nn
    yp = (Y * ok).sum(1) / nn[:, 0]
    resid = np.where(ok, L - prof[:, :1], np.nan)
    return prof, yp, valid, resid


def segments(prof: np.ndarray, valid: np.ndarray, min_len: int = 24):
    """Runs of valid rows without an object edge (a row change over 5 L* or 8 dE76: a roofline, the sun's disc; a band
    edge, even a coarse flat step of 4-6 dE, stays inside the run and is measured)."""
    d = np.zeros(len(prof), bool)
    d[1:] = (np.abs(np.diff(prof[:, 0])) > 5) | (np.linalg.norm(np.diff(prof, axis=0), axis=1) > 8)
    out = []
    s = None
    for i in range(len(prof)):
        if not valid[i] or d[i]:
            if s is not None and i - s >= min_len:
                out.append((s, i))
            s = i if valid[i] else None
        elif s is None:
            s = i
    if s is not None and len(prof) - s >= min_len:
        out.append((s, len(prof)))
    return out


def steps_in(prof: np.ndarray, yp: np.ndarray, y0: int):
    """Steps of one segment: [(y, dL, dE00, c, plateau_before, plateau_after)], the total change and the stepped change."""
    Ps = gaussian_filter1d(prof, 0.8, axis=0, mode='nearest')
    Ls = Ps[:, 0]
    n = len(Ls)
    if n < 12:
        return [], 0.0, 0.0
    # the 3-row colour change (dE76 in Lab: a hue band with little dL* counts too), d3[i] spans rows i .. i+3
    ad = np.linalg.norm(Ps[3:] - Ps[:-3], axis=1)
    floor = median_filter(ad, size=49, mode='nearest')
    thr = np.maximum(0.12, 2.5 * floor)
    cand = [i for i in range(1, len(ad) - 1) if ad[i] >= thr[i] and ad[i] >= ad[i - 1] and ad[i] >= ad[i + 1]]
    merged: list[int] = []
    for i in cand:
        if merged and i - merged[-1] <= 4:
            if ad[i] > ad[merged[-1]]:
                merged[-1] = i
        else:
            merged.append(i)
    centres = [i + 2 for i in merged]  # the row just after the change
    out = []
    stepped = 0.0
    for k, c in enumerate(centres):
        prev = centres[k - 1] if k else 0
        nxt = centres[k + 1] if k + 1 < len(centres) else n
        lo0, lo1 = max(prev + 2, c - 14), c - 2
        hi0, hi1 = c + 1, min(nxt - 2, c + 14)
        if lo1 - lo0 < 2 or hi1 - hi0 < 2:
            continue
        a = prof[lo0:lo1].mean(0)
        b = prof[hi0:hi1].mean(0)
        ya, yb = yp[lo0:lo1].mean(), yp[hi0:hi1].mean()
        dL = float(b[0] - a[0])
        dE = float(de2000(a, b))
        cc = float(abs(yb - ya) / max(min(ya, yb), 1e-6))
        out.append((y0 + c, dL, dE, cc, c - prev, nxt - c))
        stepped += float(np.linalg.norm(b - a))
    total = float(np.sum(np.linalg.norm(np.diff(Ps, axis=0), axis=1)))
    return out, total, stepped


def analyse(rgb: np.ndarray, region, strip: int, band, max_dl: float) -> dict:
    H, W = rgb.shape[:2]
    k = W / 1080.0
    x0, y0, x1, y1 = [int(round(v * k)) for v in region]
    x0, x1 = max(0, x0), min(W, x1)
    y0, y1 = max(0, y0), min(H, y1)
    lab, Y = rgb_to_lab_y(rgb[y0:y1, x0:x1])
    sw = max(8, int(round(strip * k)))
    strips = []
    all_steps = []
    grains = []
    for sx in range(0, x1 - x0, sw):
        if x1 - x0 - sx < sw // 2:
            break
        prof, yp, valid, resid = sky_profile(lab[:, sx:sx + sw], Y[:, sx:sx + sw])
        g = np.nanstd(resid[valid]) if valid.any() else float('nan')
        grains.append(g)
        st = []
        total = stepped = 0.0
        for s0, s1 in segments(prof, valid):
            ss, t, sp = steps_in(prof[s0:s1], yp[s0:s1], y0 + s0)
            st += ss
            total += t
            stepped += sp
        vis = [s for s in st if (s[3] >= JND_C or s[2] >= JND_DE) and min(s[4], s[5]) >= MIN_PLATEAU * k]
        weak = [s for s in st if (s[3] >= WEAK_C or s[2] >= WEAK_DE) and min(s[4], s[5]) >= WEAK_PLATEAU * k and s not in vis]
        plateaus = [s[4] for s in st]
        strips.append({
            'x': int(round((x0 + sx) / k)),
            'steps': len(st),
            'visible': len(vis),
            'weak': len(weak),
            'max_dL': max([abs(s[1]) for s in st], default=0.0),
            'max_dE00': max([s[2] for s in st], default=0.0),
            'max_c': max([s[3] for s in st], default=0.0),
            'median_plateau': float(np.median(plateaus)) / k if plateaus else 0.0,
            'staircase': stepped / total if total > 1e-6 else 0.0,
            'grain': float(g),
            'visible_at': [int(round(s[0] / k)) for s in vis][:12],
        })
        all_steps += st
    res = {'region': list(region), 'strips': strips}
    # the caption band: the whole width of the region, rows band[0]..band[1]
    if band and band[1] > band[0]:
        b0, b1 = int(round(band[0] * k)), int(round(band[1] * k))
        b0, b1 = max(b0, y0), min(b1, y1)
        if b1 - b0 > 4:
            prof, _, valid, _ = sky_profile(lab[b0 - y0:b1 - y0, :], Y[b0 - y0:b1 - y0, :])
            pv = prof[valid]
            if len(pv):
                m = pv.mean(0)
                res['band'] = {'y': [band[0], band[1]], 'dL': float(pv[:, 0].max() - pv[:, 0].min()), 'max_dE00': float(de2000(pv, m[None, :]).max()), 'L': float(m[0]), 'max_dl': max_dl}
    vis = sum(s['visible'] for s in strips)
    weak_worst = max([s['weak'] for s in strips], default=0)
    grain = float(np.nanmedian(grains)) if grains else float('nan')
    res['grain'] = grain
    res['visible'] = vis
    res['weak_worst_strip'] = weak_worst
    res['staircase_median'] = float(np.median([s['staircase'] for s in strips])) if strips else 0.0
    res['max_dL'] = max([s['max_dL'] for s in strips], default=0.0)
    res['max_c'] = max([s['max_c'] for s in strips], default=0.0)
    res['max_dE00'] = max([s['max_dE00'] for s in strips], default=0.0)
    res['median_plateau'] = float(np.median([s['median_plateau'] for s in strips if s['steps']])) if any(s['steps'] for s in strips) else 0.0
    verdict = 'PASS'
    why = []
    if vis:
        verdict = 'FAIL'
        why.append(f'{vis} visible step(s)')
    if 'band' in res and res['band']['dL'] > max_dl + 1e-9:
        verdict = 'FAIL'
        why.append(f"caption band dL* {res['band']['dL']:.2f} > {max_dl}")
    if verdict == 'PASS' and weak_worst >= 3:
        verdict = 'WARN'
        why.append(f'{weak_worst} weak steps in one strip')
    if verdict == 'PASS' and grain == grain and grain > GRAIN_MAX:
        verdict = 'WARN'
        why.append(f'grain {grain:.2f} L* > {GRAIN_MAX}')
    res['verdict'] = verdict
    res['why'] = why
    return res


def plot(rgb: np.ndarray, region, strip: int, path: str):
    import matplotlib
    matplotlib.use('Agg')
    import matplotlib.pyplot as plt
    H, W = rgb.shape[:2]
    k = W / 1080.0
    x0, y0, x1, y1 = [int(round(v * k)) for v in region]
    lab, Y = rgb_to_lab_y(rgb[y0:y1, x0:x1])
    sw = max(8, int(round(strip * k)))
    fig, ax = plt.subplots(2, 1, figsize=(9, 6), sharex=True)
    for sx in range(0, x1 - x0, sw * max(1, (x1 - x0) // sw // 4)):
        prof, _, valid, _ = sky_profile(lab[:, sx:sx + sw], Y[:, sx:sx + sw])
        ys = np.arange(y0, y1) / k
        p = np.where(valid, prof[:, 0], np.nan)
        ax[0].plot(ys, p, lw=0.8, label=f'x {int((x0 + sx) / k)}')
        ax[1].plot(ys[1:], np.diff(p), lw=0.6)
    ax[0].set_ylabel('sky L*')
    ax[1].set_ylabel('dL* per row')
    ax[1].set_xlabel('y (canvas px)')
    ax[0].legend(fontsize=7)
    fig.tight_layout()
    fig.savefig(path, dpi=110)


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__.split('\n')[0])
    ap.add_argument('input', help='a PNG frame or a video')
    ap.add_argument('--region', default='0,0,1080,800', help='the sky: x0,y0,x1,y1 (canvas px at 1080 wide)')
    ap.add_argument('--strip', type=int, default=64, help='strip width (px)')
    ap.add_argument('--band', default='317,556', help="the caption band y0,y1 ('' = none)")
    ap.add_argument('--max-dl', type=float, default=1.5, help='the band flatness budget (dL*)')
    ap.add_argument('--times', default='', help='video: seconds to sample (default 3 spread over the clip)')
    ap.add_argument('--json', default='', help='write the numbers here')
    ap.add_argument('--plot', default='', help='write the profiles of 4 strips here (PNG)')
    ap.add_argument('--quiet', action='store_true')
    a = ap.parse_args()
    region = [float(v) for v in a.region.split(',')]
    band = [float(v) for v in a.band.split(',')] if a.band else None
    frames = []
    if a.input.lower().endswith(('.png', '.jpg', '.jpeg', '.tif', '.tiff')):
        frames.append(('frame', load_png(a.input)))
    else:
        info = probe(a.input)
        dur = info['duration'] or 1.0
        ts = [float(t) for t in a.times.split(',')] if a.times else [dur * f for f in (0.2, 0.5, 0.8)]
        for t in ts:
            frames.append((f'{t:.2f}s', decode(a.input, t, info)))
    results = []
    for name, rgb in frames:
        r = analyse(rgb, region, a.strip, band, a.max_dl)
        r['frame'] = name
        results.append(r)
        if a.plot and len(results) == 1:
            plot(rgb, region, a.strip, a.plot)
    order = {'PASS': 0, 'WARN': 1, 'FAIL': 2}
    worst = max(results, key=lambda r: (order[r['verdict']], r['visible'], r['weak_worst_strip'], r['max_c']))
    if not a.quiet:
        for r in results:
            b = r.get('band')
            bs = f" | band dL* {b['dL']:.2f} dE00 {b['max_dE00']:.2f} (L* {b['L']:.1f})" if b else ''
            print(f"{r['verdict']:4s} {a.input} @ {r['frame']}: visible {r['visible']}, weak (worst strip) {r['weak_worst_strip']}, "
                  f"max step dL* {r['max_dL']:.2f} c {r['max_c']:.4f} dE00 {r['max_dE00']:.2f}, plateau {r['median_plateau']:.0f} px, "
                  f"staircase {r['staircase_median']:.2f}, grain {r['grain']:.2f} L*{bs}" + (f"  [{'; '.join(r['why'])}]" if r['why'] else ''))
    if a.json:
        with open(a.json, 'w') as f:
            json.dump({'input': a.input, 'verdict': worst['verdict'], 'frames': results}, f, indent=1)
    return 1 if worst['verdict'] == 'FAIL' else 0


if __name__ == '__main__':
    sys.exit(main())
