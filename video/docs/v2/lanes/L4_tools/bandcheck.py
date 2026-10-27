#!/usr/bin/env python3
"""bandcheck.py (lane L4 scratch tool): is the caption band clean in EVERY frame of V2S5?
Renders Film2RBare (no captions / labels) frames of the shot as PNGs (one bundle) and counts, per frame, the pixels
that are not the flat mint sky inside:
  band    y 317-556  (nothing drawn, ever)                         -> must be 0
  margin  y 290-317 and 556-600 (the band margin: flat sky; the sun disc alone may reach up to y 575) -> must be 0
  (the sun disc is found per frame from its orange pixels and its circle + 4 px is left out)
Usage: python3 bandcheck.py [--scale 0.5] [--f0 1233] [--f1 1439] [--step 1] [--dir DIR] [--no-render]
Run from video/. Prints the worst frames; exit 1 if any frame fails.
"""
import argparse, os, subprocess, sys, glob
import numpy as np
from PIL import Image

SKY = np.array([0xBC, 0xDC, 0xCF], dtype=np.int16)
SKYHI = np.array([0xCF, 0xE6, 0xDC], dtype=np.int16)
SUN = np.array([0xEE, 0x6A, 0x2E], dtype=np.int16)

ap = argparse.ArgumentParser()
ap.add_argument('--scale', type=float, default=0.5)
ap.add_argument('--f0', type=int, default=1233)
ap.add_argument('--f1', type=int, default=1439)
ap.add_argument('--step', type=int, default=1)
ap.add_argument('--dir', default=None)
ap.add_argument('--no-render', action='store_true')
ap.add_argument('--tol', type=int, default=26)
ap.add_argument('--comp', default='Film2RBare')
a = ap.parse_args()
d = a.dir or os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'bandcheck')
d = os.path.abspath(d)
os.makedirs(d, exist_ok=True)
frames = list(range(a.f0, a.f1 + 1, a.step))
if not a.no_render:
    for f in glob.glob(os.path.join(d, '*.png')):
        os.remove(f)
    times = ','.join(f'{f/60:.6f}' for f in frames)
    env = dict(os.environ, GL='angle')
    r = subprocess.run(['node', 'scripts/render-frames.mjs', a.comp, d, times, '--entry=src/entry-v2r-film.tsx', f'--scale={a.scale}'], env=env, capture_output=True, text=True)
    if r.returncode != 0:
        print(r.stdout[-2000:], r.stderr[-4000:])
        sys.exit(2)
files = sorted(glob.glob(os.path.join(d, 'f*.png')))
s = a.scale
def rows(y0, y1):
    return int(round(y0 * s)), int(round(y1 * s))
bad = []
worst = []
for fp in files:
    im = np.asarray(Image.open(fp).convert('RGB')).astype(np.int16)
    fr = int(os.path.basename(fp)[1:-4])
    # the sun: orange pixels anywhere above y 900 -> its circle
    top = im[: int(900 * s)]
    sm = np.abs(top - SUN).max(axis=2) < 30
    sun = None
    if sm.sum() > 30:
        ys, xs = np.nonzero(sm)
        cx, cy = xs.mean(), ys.mean()
        rr = max(xs.max() - xs.min(), ys.max() - ys.min()) / 2
        sun = (cx, cy, rr + 8 * s)
    def nonsky(y0, y1, allow_sun=False):
        r0, r1 = rows(y0, y1)
        reg = im[r0:r1]
        dsky = np.abs(reg - SKY).max(axis=2)
        dhi = np.abs(reg - SKYHI).max(axis=2)
        m = (dsky > a.tol) & (dhi > a.tol)
        yy, xx = np.mgrid[r0:r1, 0:reg.shape[1]]
        if allow_sun and sun is not None:
            m &= (xx - sun[0]) ** 2 + (yy - sun[1]) ** 2 > sun[2] ** 2
        if allow_sun and fr / 60 - 20.55 < 0.76:
            # the held start: SUN1's calendar page (APRIL 2026, 20.76-21.20) may reach y 575 (like the disc)
            m &= ~((xx >= 180 * s) & (xx <= 320 * s) & (yy >= 575 * s))
        if m.any():
            xs = np.nonzero(m)[1] / s
            spans.append(f'y{y0}-{y1}: x {int(xs.min())}-{int(xs.max())}')
        return int(m.sum() / (s * s))
    spans = []
    b = nonsky(317, 556)
    mg = nonsky(290, 317) + nonsky(556, 600, allow_sun=True)
    sz = 0
    fr = int(os.path.basename(fp)[1:-4])
    worst.append((b, mg, sz, fr))
    if b > 0 or mg > 0 or sz > 0:
        bad.append((b, mg, sz, fr, '; '.join(spans)))
print(f'bandcheck {len(files)} frames ({a.comp}, scale {s}): {len(bad)} frames with non-sky pixels (canvas px)')
for b, mg, sz, fr, sp in sorted(bad, key=lambda x: -(x[0] * 100 + x[1] * 10 + x[2]))[:25]:
    print(f'  f{fr} (film {fr/60:.3f}, scene t {fr/60-20.55:.3f}): band {b}  margin {mg}   [{sp}]')
sys.exit(1 if bad else 0)
