#!/usr/bin/env python3
"""Edge stability check for an EdgeLab clip: is the colour contour fixed on screen in every frame?

  edgecheck.py clip.mp4 [--side left|right|top|bottom ...]

For every frame and every scanline (left/right sides: rows; top/bottom: columns) it finds where the paper margin ends
(the first two pixels in a row from the frame edge that carry fill colour: chroma > 24, not dark), within the outer 15 % of the frame.
A fixed edge gives the same position in every frame; ink lines crossing the margin only move single scanlines.
Prints, per side: the median edge position, the share of (frame, scanline) samples on that scanline's usual position
(+-3 px; the rest is scene content crossing the margin), and the largest drift of the per-frame mean edge (a fixed edge
stays at ~0 px; an edge that moved with the camera would drift by many px).
"""
import argparse
import subprocess

import numpy as np


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


def edge_pos(img, side):
    a = img.astype(np.int16)
    if side == 'right':
        a = a[:, ::-1]
    elif side == 'top':
        a = a.transpose(1, 0, 2)
    elif side == 'bottom':
        a = a.transpose(1, 0, 2)[:, ::-1]
    lim = int(a.shape[1] * 0.15)
    a = a[:, :lim]
    # a flat FILL colour: chroma > 24 and not dark (paper white, ink and the grey anti-aliased ink-over-paper blends
    # are excluded), two pixels in a row
    chroma = a.max(axis=2) - a.min(axis=2)
    c1 = (chroma > 24) & (a.max(axis=2) > 110)
    colour = c1 & np.roll(c1, -1, axis=1)
    pos = np.where(colour.any(axis=1), colour.argmax(axis=1), -1)
    return pos


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('clip')
    ap.add_argument('--side', nargs='*', default=['left', 'right', 'top', 'bottom'])
    a = ap.parse_args()
    data = {s: [] for s in a.side}
    for f in frames(a.clip):
        for s in a.side:
            data[s].append(edge_pos(f, s))
    for s in a.side:
        P = np.array(data[s]).astype(float)  # frames x scanlines
        P[P < 0] = np.nan
        with np.errstate(all='ignore'):
            med = np.nanmedian(P, axis=0)  # each scanline's usual edge position
            near = np.abs(P - med[None, :]) <= 3  # content crossing the margin (lines, bulbs) moves single scanlines
            stable = np.nanmean(near, axis=0)
            Q = np.where(near, P, np.nan)
            fm = np.nanmean(Q, axis=1)  # per-frame mean edge over the scanlines that sit on the edge
            drift = np.nanmax(np.abs(fm - np.nanmean(fm)))
        print(f'{s:6s}: edge at {np.nanmedian(med):5.1f} px | scanlines on their usual edge position: {np.nanmean(stable) * 100:5.1f}% of samples | '
              f'per-frame mean edge drift: {drift:.2f} px (fixed edge ~0; a moving one >> 1)')


if __name__ == '__main__':
    main()
