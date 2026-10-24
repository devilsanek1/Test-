#!/usr/bin/env python3
"""Quick geometry preview of the paint blocks: geom.py paint.json out.png (colour = teal, ink reach = pale blue,
caption block red, rail blue, phone UI lines amber)."""
import json, sys
from PIL import Image, ImageDraw
d = json.load(open(sys.argv[1]))
sc = 0.25
w, h = int(1080 * sc), int(1920 * sc)
seeds = []
for x in d:
    if x['seed'] not in seeds:
        seeds.append(x['seed'])
S = Image.new('RGB', (3 * (w + 20) + 20, len(seeds) * (h + 40) + 20), (40, 40, 40))
for i, x in enumerate(d):
    si = seeds.index(x['seed']); vi = i % 3
    im = Image.new('RGB', (w, h), (255, 255, 255))
    dr = ImageDraw.Draw(im)
    for p in x['ink']:
        dr.polygon([(q[0] * sc, q[1] * sc) for q in p], fill=(222, 232, 250))
    for p in x['colour']:
        dr.polygon([(q[0] * sc, q[1] * sc) for q in p], fill=(110, 150, 140))
    dr.rectangle((50 * sc, 258 * sc, 991 * sc, 594 * sc), outline=(200, 60, 60))
    dr.rectangle((950 * sc, 900 * sc, 1080 * sc, 1500 * sc), outline=(60, 60, 200))
    dr.line((0, 180 * sc, w, 180 * sc), fill=(200, 150, 0)); dr.line((0, 1520 * sc, w, 1520 * sc), fill=(200, 150, 0))
    S.paste(im, (20 + vi * (w + 20), 20 + si * (h + 40)))
    ImageDraw.Draw(S).text((20 + vi * (w + 20), 20 + si * (h + 40) + h + 5), f"{x['seed']} {x['variant']} {x['roles']}", fill=(230, 230, 230))
S.save(sys.argv[2])
