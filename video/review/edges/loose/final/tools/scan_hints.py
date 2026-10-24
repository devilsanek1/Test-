#!/usr/bin/env python3
"""Measure a shot's edge hints (src/lib/edges/hints.ts) from CLEAN renders of it.

  scan_hints.py name frame1.png [frame2.png ...]   -> prints one EDGE_HINTS entry (TypeScript) + a per-region table

For each region the paint edge may leave bare (the four corners, the visible left side, the right side between the
caption and the rail, the bottom middle) it measures the share of LINE-ART pixels (the ink colour #2B1B0A, anti-aliased:
RGB distance < 70) and maps it to 0-1 (DENSE = 1). A region is only left bare by 'paint' when there is drawing to show
there: a flat sky corner scores ~0. Over several frames (a camera move) it takes the MINIMUM per region (the corner
must hold drawing for the whole shot).

It also finds the mascot (its body / shade colours) and returns its bounding box, padded, as a keep rect: the paint
edge never cuts it, and the ground under it stays painted (it would look perched on a ledge). Hero figures and other
key props are added by hand (their colours are not unique).
"""
import json
import sys

from PIL import Image
import numpy as np

INK = np.array([43, 27, 10])
MASCOT = [np.array([141, 144, 204]), np.array([115, 119, 181])]
# region -> (x0, y0, x1, y1) in screen px (1080 x 1920)
REGIONS = {
    'tl': (0, 0, 340, 230),
    'tr': (740, 0, 1080, 230),
    'br': (680, 1440, 1080, 1920),
    'bl': (0, 1440, 400, 1920),
    'left': (0, 860, 180, 1460),
    'right': (880, 630, 1080, 860),
    'bottom': (300, 1700, 780, 1920),
}
DENSE = 0.05  # ink-pixel share that counts as fully drawn (a crowd of line-art people, branches: 5-9 %)


def scan(path):
    im = np.asarray(Image.open(path).convert('RGB')).astype(np.int32)
    if im.shape[1] != 1080:
        raise SystemExit(f'{path}: expected a 1080 px wide full-res frame')
    ink = (np.abs(im - INK).sum(axis=2) < 70)
    out = {}
    for k, (x0, y0, x1, y1) in REGIONS.items():
        out[k] = float(ink[y0:y1, x0:x1].mean())
    m = np.zeros(ink.shape, bool)
    for c in MASCOT:
        m |= np.abs(im - c).sum(axis=2) < 24
    box = None
    if m.sum() > 400:
        ys, xs = np.nonzero(m)
        box = [int(xs.min()), int(ys.min()), int(xs.max()), int(ys.max())]
    return out, box


def main():
    name, *frames = sys.argv[1:]
    dens = None
    boxes = []
    for f in frames:
        d, b = scan(f)
        dens = d if dens is None else {k: min(dens[k], d[k]) for k in d}
        if b:
            boxes.append(b)
    norm = {k: round(min(1.0, v / DENSE), 2) for k, v in dens.items()}
    # one keep rect per mascot position (frames of one continuous shot overlap and merge; a cut does not)
    pad = 36
    keep = []
    for b in boxes:
        r = [max(0, b[0] - pad), max(0, b[1] - pad), min(1080, b[2] + pad), min(1920, b[3] + pad + 60)]  # + the ground
        for k in keep:
            if r[0] < k[2] and k[0] < r[2] and r[1] < k[3] and k[1] < r[3]:
                k[:] = [min(k[0], r[0]), min(k[1], r[1]), max(k[2], r[2]), max(k[3], r[3])]
                break
        else:
            keep.append(r)
    print('region   ink px %   hint')
    for k in REGIONS:
        print(f'{k:8s} {100 * dens[k]:7.2f}   {norm[k]:.2f}')
    print(f"  '{name}': {{ink: {json.dumps(norm).replace(chr(34), '')}, keep: {json.dumps(keep)}}},")


if __name__ == '__main__':
    main()
