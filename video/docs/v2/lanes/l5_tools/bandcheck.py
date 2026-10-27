#!/usr/bin/env python3
"""Caption-band check: for every frame of a video (or a frames dir), count pixels inside the caption band
(y 317-556 at 1080x1920, scaled to the input) that are NOT flat sky (#BCDCCF mint or #CFE6DC high step, +-tol).
Use a Film2RBare render (no captions). Prints frames with intrusions and a summary.
  python3 -I bandcheck.py <video.mp4> [--t0 23.80] [--tol 18] [--y0 317 --y1 556]
"""
import sys, argparse
import numpy as np
import cv2

ap = argparse.ArgumentParser()
ap.add_argument('src')
ap.add_argument('--t0', type=float, default=0.0, help='film time of the first frame (for the report)')
ap.add_argument('--fps', type=float, default=60.0)
ap.add_argument('--tol', type=float, default=18.0)
ap.add_argument('--y0', type=float, default=317)
ap.add_argument('--y1', type=float, default=556)
ap.add_argument('--min', type=int, default=4, help='pixels (at input res) to report a frame')
a = ap.parse_args()
SKY = np.array([[0xBC, 0xDC, 0xCF], [0xCF, 0xE6, 0xDC]], dtype=np.float32)  # RGB
cap = cv2.VideoCapture(a.src)
i = 0
bad = []
while True:
    ok, fr = cap.read()
    if not ok:
        break
    h, w = fr.shape[:2]
    s = h / 1920.0
    y0, y1 = int(round(a.y0 * s)), int(round(a.y1 * s))
    band = fr[y0:y1, :, ::-1].astype(np.float32)
    d = np.min(np.stack([np.abs(band - c).max(axis=2) for c in SKY]), axis=0)
    n = int((d > a.tol).sum())
    if n >= a.min:
        ys, xs = np.nonzero(d > a.tol)
        bad.append((i, n, int(xs.min() / s), int((ys.min() + y0) / s), int(xs.max() / s), int((ys.max() + y0) / s)))
    i += 1
for (f, n, x0, yy0, x1, yy1) in bad:
    print(f'frame {f} (film {a.t0 + f / a.fps:.3f}): {n} px  bbox x {x0}-{x1} y {yy0}-{yy1}')
print(f'{len(bad)} of {i} frames with band intrusions (tol {a.tol}, min {a.min} px)')
