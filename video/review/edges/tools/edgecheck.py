#!/usr/bin/env python3
"""Edge stability check: does the colour contour of an EdgeLab clip stay fixed on screen in every frame?

  edgecheck.py variant.mp4 clean.mp4 [--side left right top bottom]

Both clips render the same shot with the same camera; `clean` has no treatment. Inside the colour contour the two are
identical (same scene), in the paper margin they differ (paper + line art vs the coloured scene). For every frame and
scanline (left / right: rows, top / bottom: columns) the contour is where the LAST pixel that differs from the clean
clip lies (searched in the outer 15 % of the frame; ink lines and white objects are identical in both, so they never
fake an edge further in). Prints per side: the median contour position, the share of samples within +-2 px of their
scanline's median, and the largest drift of the per-frame mean contour (a fixed edge: ~0 px; an edge riding the camera
would drift by the camera's motion, tens of px).
"""
import argparse
import subprocess

import warnings

import numpy as np

warnings.filterwarnings("ignore")


def frames(path):
    probe = subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height', '-of', 'csv=p=0', path], capture_output=True, text=True).stdout.strip().split(',')
    w, h = int(probe[0]), int(probe[1])
    p = subprocess.Popen(['ffmpeg', '-loglevel', 'error', '-i', path, '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], stdout=subprocess.PIPE)
    n = w * h * 3
    while True:
        b = p.stdout.read(n)
        if len(b) < n:
            break
        yield np.frombuffer(b, np.uint8).reshape(h, w, 3)


def orient(a, side):
    if side == 'right':
        return a[:, ::-1]
    if side == 'top':
        return a.transpose(1, 0, 2)
    if side == 'bottom':
        return a.transpose(1, 0, 2)[:, ::-1]
    return a


def contour(v, c, side):
    a = orient(v, side).astype(np.int16)
    b = orient(c, side).astype(np.int16)
    lim = int(a.shape[1] * 0.15)
    diff = np.abs(a[:, :lim] - b[:, :lim]).max(axis=2) > 40
    # last differing pixel (+1) per scanline; -1 if none
    return np.where(diff.any(axis=1), lim - np.argmax(diff[:, ::-1], axis=1), -1)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('clip')
    ap.add_argument('clean')
    ap.add_argument('--side', nargs='*', default=['left', 'right', 'top', 'bottom'])
    a = ap.parse_args()
    data = {s: [] for s in a.side}
    for v, c in zip(frames(a.clip), frames(a.clean)):
        for s in a.side:
            data[s].append(contour(v, c, s))
    for s in a.side:
        P = np.array(data[s]).astype(float)
        P[P < 0] = np.nan
        with np.errstate(all='ignore'):
            valid = ~np.isnan(P)
            if valid.mean() < 0.2:
                print(f'{s:6s}: no margin (full-bleed colour on this side)')
                continue
            med = np.nanmedian(P, axis=0)
            near = np.abs(P - med[None, :]) <= 2
            Q = np.where(near, P, np.nan)
            fm = np.nanmean(Q, axis=1)
            drift = np.nanmax(np.abs(fm - np.nanmean(fm)))
            share = near[valid].mean() * 100
            print(f'{s:6s}: contour at {np.nanmedian(med):5.1f} px | samples within 2 px of their scanline median: {share:5.1f}% | per-frame mean contour drift: {drift:.2f} px')


if __name__ == '__main__':
    main()
