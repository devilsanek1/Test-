#!/usr/bin/env python3
"""particles_phone.py: the PHONE-SIZE PARTICLE TEST (CRAFT §f.6; the owner on S1's v4, 2026-10-28: "I don't see any
changes in the particles anywhere"). Three frames at 360 px wide, as a phone shows them, over the same three with every
particle ringed (leaves orange, glints gold, motes magenta, dust green, birds grey): the reader must be able to point at
each one in the top row without searching. Lanes inherit it with lib/particles.

Inputs: a folder of full-size frames named by time ("2.50.png" ...: e.g. `ffmpeg -ss 2.5 -i clip.mp4 -frames:v 1
2.50.png`), and the particles' on-screen positions at those times as JSON {"2.50": [{"kind", "x", "y", "size"}, ...]}
from lib/particles' particlesAt (add each field's plane offset when the shot floats). L1's generator, for one shot's
exported field list (V2S1_particles S1_PARTICLE_FIELDS), bundled with esbuild and run with node:

    import {particlesAt} from 'src/lib/particles';
    import {parallaxOffset} from 'src/lib/depth';
    import {s1Float} from 'src/v2r/scenes/V2S1_float';
    import {S1_PARTICLE_FIELDS} from 'src/v2r/scenes/V2S1_particles';
    const out = {};
    for (const t of process.argv.slice(2).map(Number))
      out[t.toFixed(2)] = S1_PARTICLE_FIELDS.flatMap(({plane, f}) => {
        const [dx, dy] = parallaxOffset(s1Float(t), plane);
        return particlesAt(t, f).filter((p) => p.size >= 1).map((p) => ({kind: f.kind, x: p.x + dx, y: p.y + dy, size: p.size}));
      });
    console.log(JSON.stringify(out));

    python3 -I scripts/qa/particles_phone.py <frames dir> <positions.json> <out.jpg> 2.50,3.80,5.00
"""
from __future__ import annotations

import json
import sys

import cv2
import numpy as np

sys.dont_write_bytecode = True

COL = {'leaves': (40, 90, 230), 'glints': (0, 200, 255), 'motes': (230, 60, 200), 'dust': (120, 200, 60), 'birds': (90, 90, 90)}
W, H = 360, 640


def main() -> int:
    if len(sys.argv) != 5:
        print(__doc__)
        return 2
    frames, posjson, out, times = sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4].split(',')
    pos = json.load(open(posjson))
    plain, marked = [], []
    for t in times:
        im = cv2.imread(f'{frames}/{t}.png')
        if im is None:
            print(f'cannot read {frames}/{t}.png', file=sys.stderr)
            return 2
        k = W / im.shape[1]
        sm = cv2.resize(im, (W, H), interpolation=cv2.INTER_AREA)
        plain.append(sm)
        mk = sm.copy()
        for p in pos.get(t, []):
            r = int(max(6, p['size'] * k * 0.7 + 4))
            cv2.circle(mk, (int(round(p['x'] * k)), int(round(p['y'] * k))), r, COL.get(p['kind'], (0, 0, 0)), 1, cv2.LINE_AA)
        cv2.putText(mk, f'{float(t):.1f} s', (8, 20), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (40, 40, 40), 1, cv2.LINE_AA)
        marked.append(mk)
    gap = np.full((H, 8, 3), 255, np.uint8)
    row = lambda xs: np.hstack([x for i, im in enumerate(xs) for x in ([gap, im] if i else [im])])
    top, bottom = row(plain), row(marked)
    legend = np.full((26, top.shape[1], 3), 255, np.uint8)
    x = 8
    for name in ('leaves', 'glints', 'motes'):
        cv2.circle(legend, (x + 6, 13), 6, COL[name], 1, cv2.LINE_AA)
        cv2.putText(legend, name, (x + 16, 18), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (40, 40, 40), 1, cv2.LINE_AA)
        x += 110
    cv2.putText(legend, f'top: as on a phone ({W} px wide); bottom: every particle ringed', (x + 10, 18), cv2.FONT_HERSHEY_SIMPLEX, 0.42, (40, 40, 40), 1, cv2.LINE_AA)
    img = np.vstack([legend, top, np.full((8, top.shape[1], 3), 255, np.uint8), bottom])
    cv2.imwrite(out, img, [cv2.IMWRITE_JPEG_QUALITY, 92])
    print(out, f'{img.shape[1]}x{img.shape[0]}', {t: len(pos.get(t, [])) for t in times})
    return 0


if __name__ == '__main__':
    sys.exit(main())
