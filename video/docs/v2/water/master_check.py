#!/usr/bin/env python3
"""master_check.py: CRAFT §f.7's colour numbers on the DELIVERED MASTER, not only on lossless frames (the water critic,
docs/v2/water/CRITIC.md must-fix 4: the master's 4:2:0 chroma turns every thin gap and every gold-on-teal rim khaki, so a
water that passes on PNG frames can fail on the phone). S1 only (S1's water mask, as judge_metrics.py).

    python3 -I docs/v2/water/master_check.py deliverables/v2/v2r_G4_look_v6.mp4 deliverables/v2/v2r_G4_look_v5.mp4
    # optional: --times 1,2,3,4,5 (seconds; default) --tmp /dev/shm/mc

The second clip is the baseline the critic masked against (v5's master): the water mask is S1's geometric water minus
every px within 6 codes of the baseline (what is drawn over the water the same way: Pip, the leaves, the boats).
Frames are decoded BT.709, TV range to full (the critic's decode). Per time, with its target:
  khaki rows   rows of the lit door's column box (x 556-640, y 1150-1232) more than half khaki   <= 2
  cool %       water px with CIE h 150-250 and C* > 4 (the canal as the frame's one cool field)  >= 83
  warm %       water px with h < 110 or > 300 and C* > 8                                         <= 15
  house %      water px in the house's beige (h 55-95, C* 6-18, L* < 86) + olive (h 95-118, C* 6-30) bands <= 1.5
  median C*    the water's median chroma (the approved Canal Mint: v5 13.2)                       >= 12.5
  paving px    water px within dE76 5 of our paving as drawn (#F1D2B3), mask minus the baseline  0 (info: the raw mask)
Khaki is the critic's class: beige, or h 95-150 at C* 6-30 (the olive band plus the yellow-green it shades into).
Exit status 1 when a target fails.
"""
from __future__ import annotations

import argparse
import os
import subprocess
import sys
import tempfile

import numpy as np
from PIL import Image

sys.dont_write_bytecode = True

TOP = [(0, 1067.9), (100, 1076.7), (196, 1085.2), (300, 1095.0), (400, 1104.4), (470, 1111), (1080, 1111)]
BOT = [(0, 1144.2), (100, 1157.3), (196, 1169.9), (300, 1183.5), (400, 1196.6), (470, 1205.8), (540, 1215), (700, 1236), (930, 1266), (1080, 1286)]
Y0, Y1 = 1060, 1300
PAVING = (0xF1, 0xD2, 0xB3)


def masks() -> tuple[np.ndarray, np.ndarray]:
    xs = np.arange(1080)
    top = np.interp(xs, *zip(*TOP)) + 9  # under the far towpath's own strip
    yy = np.arange(Y0, Y1)[:, None]
    geo = (yy >= top[None, :]) & (yy <= (np.interp(xs, *zip(*BOT)) - 2)[None, :])
    geo3 = (yy >= top[None, :]) & (yy <= (np.interp(xs, *zip(*BOT)) - 3)[None, :])
    return geo, geo3


def lab(rgb: np.ndarray):
    c = rgb.astype(np.float64) / 255.0
    c = np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)
    m = np.array([[0.4124564, 0.3575761, 0.1804375], [0.2126729, 0.7151522, 0.0721750], [0.0193339, 0.1191920, 0.9503041]])
    xyz = (c @ m.T) / np.array([0.95047, 1.0, 1.08883])
    f = np.where(xyz > (6 / 29) ** 3, np.cbrt(xyz), xyz / (3 * (6 / 29) ** 2) + 4 / 29)
    return 116 * f[..., 1] - 16, 500 * (f[..., 0] - f[..., 1]), 200 * (f[..., 1] - f[..., 2])


def frames(clip: str, times: list[float], out: str) -> list[np.ndarray]:
    ims = []
    for t in times:
        p = os.path.join(out, f'{os.path.basename(clip)}_{t:.3f}.png')
        n = int(round(t * 60))
        subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', clip, '-vf', f"select='eq(n\\,{n})',scale=in_color_matrix=bt709:in_range=tv:out_range=pc:flags=accurate_rnd+full_chroma_int,format=rgb24", '-vsync', '0', '-frames:v', '1', p], check=True)
        ims.append(np.asarray(Image.open(p).convert('RGB')))
    return ims


def measure(im: np.ndarray, base: np.ndarray, geo: np.ndarray, geo3: np.ndarray) -> dict:
    L, a, b = lab(im)
    C = np.hypot(a, b)
    h = (np.degrees(np.arctan2(b, a)) + 360) % 360
    kh = ((h > 95) & (h < 150) & (C >= 6) & (C < 30)) | ((h >= 55) & (h <= 95) & (C >= 6) & (C < 18) & (L < 86))
    box = (slice(1150, 1232), slice(556, 640))
    rows = int((kh[box].mean(1) > 0.5).sum())
    w = slice(Y0, Y1)
    same = np.abs(base[w].astype(int) - im[w].astype(int)).max(-1) <= 6
    m = geo & ~same
    Lw, Cw, hw = L[w], C[w], h[w]
    n = m.sum()
    pct = lambda k: 100 * float((k & m).sum()) / n
    beige = (hw >= 55) & (hw <= 95) & (Cw >= 6) & (Cw < 18) & (Lw < 86)
    olive = (hw > 95) & (hw <= 118) & (Cw >= 6) & (Cw < 30)
    pl, pa, pb = (float(v) for v in np.array(lab(np.array([[PAVING]], np.uint8))).reshape(3))
    dE = np.sqrt((Lw - pl) ** 2 + (a[w] - pa) ** 2 + (b[w] - pb) ** 2)
    near = (dE < 5) & geo3
    return {
        'khaki rows': rows,
        'cool %': pct((hw >= 150) & (hw <= 250) & (Cw > 4)),
        'warm %': pct(((hw < 110) | (hw > 300)) & (Cw > 8)),
        'olive %': pct(olive),
        'beige %': pct(beige),
        'house %': pct(olive | beige),
        'median C*': float(np.median(Cw[m])),
        'median L*': float(np.median(Lw[m])),
        'paving px': int((near & ~same).sum()),
        'paving px (raw mask)': int(near.sum()),
        'gold box khaki px': int(kh[1150:1230, 540:720].sum()),
        'glitter box khaki px': int(kh[1090:1170, 150:240].sum()),
    }


TARGETS = {'khaki rows': ('<=', 2), 'cool %': ('>=', 83), 'warm %': ('<=', 15), 'house %': ('<=', 1.5), 'median C*': ('>=', 12.5), 'paving px': ('<=', 0)}


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__.split('\n')[0])
    ap.add_argument('master')
    ap.add_argument('baseline')
    ap.add_argument('--times', default='1,2,3,4,5')
    ap.add_argument('--tmp', default='')
    o = ap.parse_args()
    times = [float(v) for v in o.times.split(',')]
    geo, geo3 = masks()
    tmp = o.tmp or tempfile.mkdtemp(prefix='mc_', dir='/dev/shm' if os.path.isdir('/dev/shm') else None)
    os.makedirs(tmp, exist_ok=True)
    ims = frames(o.master, times, tmp)
    bases = frames(o.baseline, times, tmp)
    res = [measure(im, ba, geo, geo3) for im, ba in zip(ims, bases)]
    keys = list(res[0].keys())
    print('%-22s' % 'at (s)' + ''.join('%9.2f' % t for t in times) + '   target')
    bad = 0
    for k in keys:
        vals = [r[k] for r in res]
        tg = TARGETS.get(k)
        ok = ''
        if tg:
            op, lim = tg
            fails = [v for v in vals if (v > lim if op == '<=' else v < lim)]
            ok = f'   {op} {lim}: ' + ('PASS' if not fails else 'FAIL')
            bad += bool(fails)
        fmt = '%9d' if isinstance(vals[0], int) else '%9.2f'
        print('%-22s' % k + ''.join(fmt % v for v in vals) + ok)
    return 1 if bad else 0


if __name__ == '__main__':
    sys.exit(main())
