#!/usr/bin/env python3
"""colour_meter.py: the COLOUR-JOB METER. Per PNG still, the share of pixels near the HERO colour, near the POP colour,
and DARK (CIE L* < 30), so a lane can put measured colour jobs on its sheet (G5_BLOCKING section 8, lesson 3: "a hero
% / dark % meter per panel": v3's S8 dark budget was a number nobody had).

  python3 -I scripts/qa/colour_meter.py frame1.png frame2.png ...
  python3 -I scripts/qa/colour_meter.py out/*.png --hero '#3F7FE0' --pop '#EC6B2E' --tol 18 --json meter.json

Defaults are video 2's Cream & Cobalt jobs (docs/v2/LOOK.md): hero cobalt #3F7FE0 (HER only: 5-15 % of a frame where
she is the subject), pop orange #EC6B2E (ONE pop: the highlighted clause and FOR LIFE, 1-3 %), dark anchor budget ~5 %
(L* < 30: hair, the lamp shade, the mic, the near roofs). "Near" = CIE76 delta E in Lab under --tol (default 18), so a
misregistered fill edge or a shade step one notch off still counts, and the dusk blues of the window (#4D5C99, L* ~40)
do not count as the hero.
Regions: --band y0,y1 leaves a horizontal band out (e.g. 290,600 = the caption band, in 1080-wide canvas px; scaled
to the image), --ignore y0,y1 likewise (default none). Numbers are a WARNING signal, never a quota.
Output: one line per file: `<file>  hero  4.2 %  pop  0.9 %  dark  6.3 %  (WxH)`; exit 0 (2 on bad input).
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

import numpy as np
from PIL import Image

sys.dont_write_bytecode = True


def hex_rgb(h: str) -> np.ndarray:
    h = h.strip().lstrip('#')
    if len(h) != 6:
        raise ValueError(f'bad hex colour: {h!r}')
    return np.array([int(h[i:i + 2], 16) for i in (0, 2, 4)], dtype=np.float64)


def srgb_to_lab(rgb: np.ndarray) -> np.ndarray:
    """rgb: (..., 3) in 0..255 -> CIE Lab (D65)."""
    c = rgb / 255.0
    c = np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)
    m = np.array([[0.4124564, 0.3575761, 0.1804375], [0.2126729, 0.7151522, 0.0721750], [0.0193339, 0.1191920, 0.9503041]])
    xyz = c @ m.T
    xyz = xyz / np.array([0.95047, 1.0, 1.08883])
    e = 216 / 24389
    k = 24389 / 27
    f = np.where(xyz > e, np.cbrt(xyz), (k * xyz + 16) / 116)
    L = 116 * f[..., 1] - 16
    a = 500 * (f[..., 0] - f[..., 1])
    b = 200 * (f[..., 1] - f[..., 2])
    return np.stack([L, a, b], axis=-1)


def meter(path: Path, hero: np.ndarray, pop: np.ndarray, tol: float, dark_l: float, cut: list[tuple[float, float]]) -> dict:
    im = Image.open(path).convert('RGB')
    w, h = im.size
    arr = np.asarray(im, dtype=np.float64)
    keep = np.ones((h, w), dtype=bool)
    for y0, y1 in cut:
        a = int(round(y0 * w / 1080))
        z = int(round(y1 * w / 1080))
        keep[max(0, a):max(0, min(h, z)), :] = False
    lab = srgb_to_lab(arr)[keep]
    n = max(1, lab.shape[0])
    hero_lab = srgb_to_lab(hero[None, :])[0]
    pop_lab = srgb_to_lab(pop[None, :])[0]
    d_hero = np.linalg.norm(lab - hero_lab, axis=-1)
    d_pop = np.linalg.norm(lab - pop_lab, axis=-1)
    return {
        'file': str(path),
        'size': [w, h],
        'hero': round(100.0 * float((d_hero < tol).sum()) / n, 2),
        'pop': round(100.0 * float((d_pop < tol).sum()) / n, 2),
        'dark': round(100.0 * float((lab[:, 0] < dark_l).sum()) / n, 2),
    }


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('files', nargs='+')
    ap.add_argument('--hero', default='#3F7FE0', help='hero colour (default v2 cobalt #3F7FE0)')
    ap.add_argument('--pop', default='#EC6B2E', help='pop colour (default v2 orange #EC6B2E)')
    ap.add_argument('--tol', type=float, default=18.0, help='delta E (CIE76) that counts as "near" (default 18)')
    ap.add_argument('--dark', type=float, default=30.0, help='L* below this is dark (default 30)')
    ap.add_argument('--band', default='', help='leave out a canvas-px band y0,y1 (e.g. 290,600)')
    ap.add_argument('--ignore', default='', help='leave out another canvas-px band y0,y1')
    ap.add_argument('--json', default='', help='also write the numbers to this JSON file')
    a = ap.parse_args()
    try:
        hero = hex_rgb(a.hero)
        pop = hex_rgb(a.pop)
    except ValueError as e:
        print(e, file=sys.stderr)
        return 2
    cut: list[tuple[float, float]] = []
    for spec in (a.band, a.ignore):
        if spec:
            y0, y1 = (float(v) for v in spec.split(','))
            cut.append((y0, y1))
    out = []
    for f in a.files:
        p = Path(f)
        if not p.is_file():
            print(f'missing: {f}', file=sys.stderr)
            return 2
        r = meter(p, hero, pop, a.tol, a.dark, cut)
        out.append(r)
        print(f"{r['file']}  hero {r['hero']:5.1f} %  pop {r['pop']:5.1f} %  dark {r['dark']:5.1f} %  ({r['size'][0]}x{r['size'][1]})")
    if a.json:
        Path(a.json).write_text(json.dumps(out, indent=1))
    return 0


if __name__ == '__main__':
    sys.exit(main())
