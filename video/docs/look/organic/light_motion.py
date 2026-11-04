#!/usr/bin/env python3
"""light_motion.py: the PROPER LIGHT motion proof (light.md §6.4): v6 beside the relit frames, 1.0-2.4 s at 30 fps, as
an MP4, plus the light's temporal checks (does the static light hold still on its plane, does the light on her follow
her smoothly, does anything flicker).
    python3 light_motion.py <renders_dir> <lit_dir> [<lit_dir2> ...] --out=<light_motion.mp4> [--metrics=<json>]
renders_dir holds cap/ and base/ (f%05d.png named by the 60 fps frame); each lit_dir holds lit_fXXXXX_d1.png
(light_demo.py --doses=1.0). Deterministic: the frames are pure functions of the inputs; ffmpeg encodes them (libx264,
crf 18, yuv420p, bt709)."""
import glob
import json
import os
import re
import subprocess
import sys
import tempfile

import cv2
import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import light_demo as LD  # noqa: E402

args = [a for a in sys.argv[1:] if not a.startswith('--')]
opt = dict(a[2:].split('=', 1) for a in sys.argv[1:] if a.startswith('--'))
R, LITS = args[0], args[1:]
OUT = opt['out']
lit = {}
for d in LITS:
    for p in glob.glob(os.path.join(d, 'lit_f*_d1.png')):
        lit[int(re.search(r'lit_f(\d+)_d1\.png', p).group(1))] = p
frames = sorted(lit)
if not frames:
    raise SystemExit('no lit frames')


def label(img, text):
    out = img.copy()
    cv2.rectangle(out, (0, 0), (out.shape[1], 30), (255, 255, 255), -1)
    cv2.putText(out, text, (10, 21), cv2.FONT_HERSHEY_SIMPLEX, 0.62, (40, 30, 30), 1, cv2.LINE_AA)
    return out


# ---- the temporal checks (L* deltas: lit - v6; both carry the captions: v6 = cap/)
H, W = LD.H, LD.W
yy, xx = np.mgrid[0:H, 0:W]
zones = {
    'near_bank': (yy > 1450) & ~((xx < 420) & (yy > 1240)),     # our bank under the canopy (the tree left out)
    'facade': (yy > 650) & (yy < 1070) & (xx > 760) & (xx < 1060),  # the wing right of the door (no mover crosses it)
    'sky_by_sun': ((xx - LD.SUN[0]) ** 2 + (yy - LD.SUN[1]) ** 2 < 60 ** 2),
}
series = {k: [] for k in zones}
series['her'] = []
series['t'] = []
prev_delta = prev_b = None
flicker, flicker_b = [], []
for f in frames:
    v6 = LD.load(f'{R}/cap/f{f:05d}.png')
    li = LD.load(lit[f])
    dL = LD.lstar(li) - LD.lstar(v6)
    for k, m in zones.items():
        series[k].append(round(float(dL[m].mean()), 2))
    # her: the row difference near her x (as light_demo's masks do), from base vs norow
    t = f / 60.0
    hx = 680 - 40.06 * (min(t, 4.54) - 0.97) + LD.offset(t, 'subject')[0]     # her x (light_demo's masks)
    try:
        base = LD.load(f'{R}/base/f{f:05d}.png')
        norow = LD.load(f'{R}/norow/f{f:05d}.png')
        row = (np.abs(base - norow).max(-1) > 3 / 255) & (yy < LD.FEET_Y - 4) & (np.abs(xx - hx - 14) < 48)
        series['her'].append(round(float(dL[row].mean()), 2) if row.any() else None)
    except SystemExit:
        series['her'].append(None)
    series['t'].append(round(f / 60.0, 3))
    # flicker: the frame-to-frame change of the light's delta, away from what moves (her box, the water, the flock/sky)
    still = (yy > 1330) | ((yy > 640) & (yy < 1080) & (np.abs(xx - hx) > 90))
    dLb = cv2.blur(dL.astype(np.float32), (5, 5))            # the proof's per-frame dither (+-0.5 code) averaged out
    if prev_delta is not None:
        flicker.append(float(np.percentile(np.abs(dL - prev_delta)[still], 99)))
        flicker_b.append(float(np.percentile(np.abs(dLb - prev_b)[still], 99)))
    prev_delta, prev_b = dL, dLb
res = {'frames': len(frames), 't0': series['t'][0], 't1': series['t'][-1], 'series': series,
       'zone_range_L': {k: round(max(series[k]) - min(series[k]), 2) for k in zones},
       'her_max_step_L': round(max(abs(a - b) for a, b in zip(series['her'][1:], series['her'][:-1]) if a is not None and b is not None), 2),
       'flicker_p99_max_L': round(max(flicker), 2), 'flicker_p99_median_L': round(float(np.median(flicker)), 2),
       'flicker_blur5_p99_max_L': round(max(flicker_b), 2), 'flicker_blur5_p99_median_L': round(float(np.median(flicker_b)), 2)}
if 'metrics' in opt:
    with open(opt['metrics'], 'w') as fh:
        json.dump(res, fh, indent=1)
print(json.dumps({k: v for k, v in res.items() if k != 'series'}))
print('her', series['her'])

# ---- the MP4: v6 | relit, each at 540 x 960, labelled
with tempfile.TemporaryDirectory() as tmp:
    for i, f in enumerate(frames):
        a = cv2.resize(cv2.imread(f'{R}/cap/f{f:05d}.png'), (540, 960), interpolation=cv2.INTER_AREA)
        b = cv2.resize(cv2.imread(lit[f]), (540, 960), interpolation=cv2.INTER_AREA)
        frame = np.hstack([label(a, f'v6 as is   {f / 60:.2f} s'), np.full((960, 8, 3), 246, np.uint8), label(b, 'proper light, dose 1.0')])
        frame = np.vstack([frame, np.full((8, frame.shape[1], 3), 246, np.uint8)])          # even height for yuv420p
        cv2.imwrite(os.path.join(tmp, f'{i:04d}.png'), frame)
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-framerate', '30', '-i', os.path.join(tmp, '%04d.png'),
                    '-c:v', 'libx264', '-crf', '18', '-pix_fmt', 'yuv420p', '-colorspace', 'bt709', '-color_primaries', 'bt709',
                    '-color_trc', 'bt709', '-movflags', '+faststart', OUT], check=True)
print('mp4', OUT, os.path.getsize(OUT))
