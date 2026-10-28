#!/usr/bin/env python3
"""judge_metrics.py: the water judge's measurements (docs/v2/water/JUDGE.md), so a fix pass can re-measure its
must-fixes the same way. S1 only (the water region is S1's, from geometry.ts / DIAGNOSIS §2.2).

Render the same frames of the baseline and of the new water with scripts/render-frames.mjs (one folder each,
f00060.png ...). The study entry is gone (2026-10-28: the water is src/lib/water.tsx): the v5 baseline is Film2R at a
commit before the build (e.g. 5506f34; its f150 / f300 sha256 are DIAGNOSIS §4's), the new water is Film2R now
(--entry=src/entry-v2r-film.tsx --props='{"draftLabel":false}'). Then:

  python3 -I docs/v2/water/judge_metrics.py --dirs v5=/tmp/wsBase,A=/tmp/wsA,B=/tmp/wsB --frames 60,150,228,300
  # motion (60 consecutive frames in every folder, e.g. 150-209 = 2.50-3.48 s):
  python3 -I docs/v2/water/judge_metrics.py --dirs v5=/tmp/mBase,A=/tmp/mA --motion 150-209

The colour numbers on the delivered MASTER (khaki rows at the lit door, cool / warm / house-band shares, median C*,
paving-like px: the critic's must-fix 4, docs/v2/water/CRITIC.md) are master_check.py's (this folder).

The first folder is the baseline. The water mask is S1's water polygon minus every pixel that is identical in ALL the
given folders at that frame (what is drawn over the water the same way: Pip, the boats, the leaves), so pass at least
the baseline and one candidate. Numbers (per 1000 water px where it says so):
  cool %        water px with CIE h 150-250 and C* > 4 (the canal as the frame's cool field)
  warm %        water px with h < 110 or > 300 and C* > 8
  low cool %    the whole frame below y 950 (the world under the sky), cool as above
  dx / dy edges 3-px steps |dL*| > 2 across x (piece ends, stair steps) / across y (stripes, slice gaps), per 1000 px
  marks         thin light marks: components <= 4 px tall, >= 8 px long, >= 5 L* over the px 3 above AND 3 below
  glitter       gold px (L* >= 78, C* >= 20, h 50-95) and core px (L* >= 93) in x 130-270, y 1080-1180
  Pip dE        median CIE76 dE between Pip's body colour and the water px in a 2-3 px ring round him
  motion        mean px changing > 3 L* per frame; px with a quick toggle (a > 3 L* change reversed within 6 frames)
"""
from __future__ import annotations

import argparse
import json
import os
import sys

import cv2
import numpy as np
from PIL import Image

sys.dont_write_bytecode = True

Y0, Y1 = 1060, 1290
# DIAGNOSIS §2.2: the far edge (waterTop) and our coping (waterBottom), screen px at rest
TOP = [(0, 1067.9), (100, 1076.7), (196, 1085.2), (300, 1095.0), (400, 1104.4), (470, 1111), (1080, 1111)]
BOT = [(0, 1144.2), (100, 1157.3), (196, 1169.9), (300, 1183.5), (400, 1196.6), (470, 1205.8), (540, 1215), (700, 1236), (930, 1266), (1080, 1286)]
PIP = np.array([0x99, 0x9A, 0xC2], np.uint8)


def lab(rgb: np.ndarray):
    c = rgb.astype(np.float64) / 255.0
    c = np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)
    m = np.array([[0.4124564, 0.3575761, 0.1804375], [0.2126729, 0.7151522, 0.0721750], [0.0193339, 0.1191920, 0.9503041]])
    xyz = (c @ m.T) / np.array([0.95047, 1.0, 1.08883])
    f = np.where(xyz > (6 / 29) ** 3, np.cbrt(xyz), xyz / (3 * (6 / 29) ** 2) + 4 / 29)
    L = 116 * f[..., 1] - 16
    a = 500 * (f[..., 0] - f[..., 1])
    b = 200 * (f[..., 1] - f[..., 2])
    return L, a, b


def geo_mask() -> np.ndarray:
    xs = np.arange(1080)
    top = np.interp(xs, *zip(*TOP)) + 9  # under the far towpath's own 8 px strip (drawn over the water)
    bot = np.interp(xs, *zip(*BOT)) - 2
    yy = np.arange(Y0, Y1)[:, None]
    return (yy >= top[None, :]) & (yy <= bot[None, :])


def load(d: str, f: int) -> np.ndarray:
    p = os.path.join(d, f'f{f:05d}.png')
    if not os.path.exists(p):
        sys.exit(f'missing {p}')
    return np.asarray(Image.open(p).convert('RGB'))


def water_mask(frames: list[np.ndarray]) -> np.ndarray:
    same = np.ones(frames[0].shape[:2], bool)
    for im in frames[1:]:
        same &= np.all(im == frames[0], -1)
    return geo_mask() & ~same[Y0:Y1]


def static(im: np.ndarray, mask: np.ndarray) -> dict:
    L, a, b = lab(im)
    C = np.hypot(a, b)
    h = (np.degrees(np.arctan2(b, a)) + 360) % 360
    w = (slice(Y0, Y1), slice(0, 1080))
    Lw, Cw, hw = L[w], C[w], h[w]
    cool = (hw >= 150) & (hw <= 250) & (Cw > 4)
    warm = ((hw < 110) | (hw > 300)) & (Cw > 8)
    low = (h[950:] >= 150) & (h[950:] <= 250) & (C[950:] > 4)
    out = {'cool %': round(100 * cool[mask].mean(), 1), 'warm %': round(100 * warm[mask].mean(), 1), 'low cool %': round(100 * low.mean(), 1)}
    dx = np.abs(Lw[:, 3:] - Lw[:, :-3])
    mx = mask[:, 3:] & mask[:, :-3]
    dy = np.abs(Lw[3:] - Lw[:-3])
    my = mask[3:] & mask[:-3]
    out['dx edges'] = round(1000 * float((mx & (dx > 2)).sum()) / mx.sum(), 1)
    out['dy edges'] = round(1000 * float((my & (dy > 2)).sum()) / my.sum(), 1)
    light = (Lw - np.roll(Lw, 3, 0) >= 5) & (Lw - np.roll(Lw, -3, 0) >= 5) & mask
    n, _, st, _ = cv2.connectedComponentsWithStats(light.astype(np.uint8), connectivity=8)
    out['marks'] = int(sum(1 for i in range(1, n) if st[i, 3] <= 4 and st[i, 2] >= 8))
    g = (slice(1080, 1180), slice(130, 270))
    out['glitter gold px'] = int(((L[g] >= 78) & (C[g] >= 20) & (h[g] >= 50) & (h[g] <= 95)).sum())
    out['glitter core px'] = int((L[g] >= 93).sum())
    return out


def pip_de(ims: list[np.ndarray], mask: np.ndarray) -> list[float]:
    """Median dE between Pip's body colour and the water just round him, per image."""
    pl = np.array(lab(PIP[None, None, :])).reshape(3)
    sub = [im[Y0:Y1] for im in ims]
    same = np.ones(sub[0].shape[:2], bool)
    for s in sub[1:]:
        same &= np.all(s == sub[0], -1)
    box = np.zeros_like(same)
    box[1110 - Y0:1290 - Y0, 630:780] = True
    L, a, b = lab(sub[0])
    body = box & same & (np.sqrt((L - pl[0]) ** 2 + (a - pl[1]) ** 2 + (b - pl[2]) ** 2) < 14)
    body = cv2.morphologyEx(body.astype(np.uint8), cv2.MORPH_OPEN, np.ones((3, 3), np.uint8))
    ring = cv2.dilate(body, np.ones((7, 7), np.uint8)).astype(bool) & ~cv2.dilate(body, np.ones((3, 3), np.uint8)).astype(bool) & mask
    out = []
    for s in sub:
        L, a, b = lab(s)
        d = np.sqrt((L - pl[0]) ** 2 + (a - pl[1]) ** 2 + (b - pl[2]) ** 2)[ring]
        out.append(round(float(np.median(d)), 1) if d.size else float('nan'))
    return out


def motion(d: str, f0: int, f1: int, mask: np.ndarray) -> dict:
    Ls = np.stack([lab(load(d, f)[Y0:Y1])[0] for f in range(f0, f1 + 1)]).astype(np.float32)
    dd = np.diff(Ls, axis=0)
    chg = (np.abs(dd) > 3) & mask[None]
    sig = np.sign(dd) * (np.abs(dd) > 3)
    tog = np.zeros(mask.shape, bool)
    last = np.zeros(mask.shape, np.float32)
    lastt = np.full(mask.shape, -99)
    for t in range(sig.shape[0]):
        s = sig[t]
        nz = s != 0
        tog |= nz & (last != 0) & (s == -last) & ((t - lastt) <= 6)
        last = np.where(nz, s, last)
        lastt = np.where(nz, t, lastt)
    return {'px changing/frame %': round(100 * float(chg.sum((1, 2)).mean()) / mask.sum(), 2), 'px quick toggle %': round(100 * float(tog[mask].mean()), 2)}


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__.split('\n')[0])
    ap.add_argument('--dirs', required=True, help='label=folder,label=folder,... (the first is the baseline)')
    ap.add_argument('--frames', default='', help='comma list of frames for the still measures')
    ap.add_argument('--motion', default='', help='f0-f1: consecutive frames for the motion measures')
    a = ap.parse_args()
    dirs = [tuple(p.split('=', 1)) for p in a.dirs.split(',')]
    res: dict = {}
    for f in [int(v) for v in a.frames.split(',') if v]:
        ims = [load(d, f) for _, d in dirs]
        mask = water_mask(ims)
        pd = pip_de(ims, mask)
        for (lb, _), im, p in zip(dirs, ims, pd):
            r = static(im, mask)
            r['Pip dE'] = p
            res.setdefault(lb, {})[f'f{f}'] = r
    if a.motion:
        f0, f1 = (int(v) for v in a.motion.split('-'))
        mask = water_mask([load(d, f0) for _, d in dirs])
        for lb, d in dirs:
            res.setdefault(lb, {})[f'motion {f0}-{f1}'] = motion(d, f0, f1, mask)
    print(json.dumps(res, indent=1))
    return 0


if __name__ == '__main__':
    sys.exit(main())
