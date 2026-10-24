#!/usr/bin/env python3
"""Quick paint-edge simulator (no Chrome): composites a CLEAN still with the colour / ink clips from dump-paint.ts.

  sim.py paint.json out.png [--scale=0.3] [--keep] [--seed=film] [--variants=paint-medium,paint-loose]

Colour region -> the clean pixel; ink region -> the clean still's line-art pixels (ink colour) and actor pixels (the
mascot, the sun) on white paper; elsewhere white paper; ruled strokes in ink. Rows: variants, columns: shots. An
approximation of EdgeTreatment's two layers (the real ink layer also keeps white-tombstone outlines etc.), good
enough to judge where the paint stops and what the white areas hold.
"""
import json
import os
import re
import sys

import numpy as np
from PIL import Image, ImageDraw

HERE = os.path.dirname(os.path.abspath(__file__))
ST = os.path.join(os.path.dirname(HERE), 'stills')
INK = np.array([43, 27, 10])
ACTORS = [np.array(c) for c in [(141, 144, 204), (115, 119, 181), (236, 107, 46)]]


def mask(polys, w=1080, h=1920):
    im = Image.new('L', (w, h), 0)
    d = ImageDraw.Draw(im)
    for p in polys or []:
        if len(p) >= 3:
            d.polygon([(float(x), float(y)) for x, y in p], fill=255)
    return np.asarray(im) > 127


def render(entry, clean, keep=False):
    c = clean
    ink_px = np.abs(c - INK).sum(axis=2) < 110
    actor = np.zeros(ink_px.shape, bool)
    for a in ACTORS:
        actor |= np.abs(c - a).sum(axis=2) < 30
    col = mask(entry['colour'])
    ink = mask(entry['ink']) if entry['ink'] else np.ones_like(col)
    out = np.full(c.shape, 255, np.uint8)
    lay = ink & (ink_px | actor)
    out[lay] = c[lay]
    out[col] = c[col]
    im = Image.fromarray(out)
    d = ImageDraw.Draw(im)
    for s in entry['strokes']:
        n = [float(v) for v in re.findall(r'-?\d+(?:\.\d+)?', s)]
        pts = list(zip(n[0::2], n[1::2]))
        if len(pts) >= 2:
            d.line(pts, fill=(43, 27, 10), width=3)
    if keep:
        for k in entry.get('keep', []):
            d.rectangle(k, outline=(255, 0, 80), width=3)
    return im


def main():
    src, out, *opt = sys.argv[1:]
    o = dict(a[2:].split('=', 1) if '=' in a else (a[2:], '1') for a in opt)
    sc = float(o.get('scale', 0.3))
    seed = o.get('seed', 'film')
    data = [e for e in json.load(open(src)) if e['seed'] == seed]
    if 'variants' in o:
        data = [e for e in data if e['variant'] in o['variants'].split(',')]
    variants = list(dict.fromkeys(e['variant'] for e in data))
    shots = list(dict.fromkeys(e['shot'] for e in data))
    w, h = int(1080 * sc), int(1920 * sc)
    gap = 14
    S = Image.new('RGB', (gap + len(shots) * (w + gap), gap + len(variants) * (h + gap + 18)), (34, 34, 36))
    dr = ImageDraw.Draw(S)
    cleans = {s: np.asarray(Image.open(os.path.join(ST, f'clean_{s}.png')).convert('RGB')).astype(np.int32) for s in shots}
    for e in data:
        i = variants.index(e['variant'])
        j = shots.index(e['shot'])
        im = render(e, cleans[e['shot']], 'keep' in o).resize((w, h), Image.LANCZOS)
        x = gap + j * (w + gap)
        y = gap + i * (h + gap + 18)
        S.paste(im, (x, y))
        roles = e['meta']['roles'] if e.get('meta') else ''
        dr.text((x, y + h + 3), f"{e['variant']} {e['shot']} {roles}", fill=(220, 220, 220))
    S.save(out)
    print(out, S.size)


if __name__ == '__main__':
    main()
