#!/usr/bin/env python3
"""capcheck.py — caption legibility check (used by scripts/capcheck.mjs and scripts/sheet.sh).

Input: a list file with lines "<seconds> <frame> <frame.png> <mask.png>" where frame.png is the normal render and
mask.png the same frame rendered with input props {"capcheck": "mask"} (SkyCaptions draws a black frame with code
colours: dark-tone text #FF0000, light-tone text #00FF00, highlight boxes #0000FF).

For every frame: inside the caption band (x 90-990, y 280-570 at full res) take the BACKGROUND pixels (not glyph, not
highlight box, dilated a little against anti-aliasing), give each the tone of its nearest glyph, and measure the WCAG
contrast between that tone's text colour (ink #2B1B0A or white) and the background pixel.
  near = background within 0.3 em of a glyph (what the eye reads the letters against)
  band = every background pixel of the band columns the text spans
A frame FAILS when more than --thresh (default 5 %) of its near background is below 3:1; band > thresh is a WARN.
Prints one line per frame and a summary; exit code 1 if any frame failed.

  python3 scripts/capcheck.py list.txt [--scale=0.5] [--thresh=0.05] [--quiet] [--viz=dir]
  --viz writes the band of each frame with failing background pixels painted magenta (pale: band only).
"""
import sys

import numpy as np
from PIL import Image
from scipy import ndimage

INK = (0x2B, 0x1B, 0x0A)
WHITE = (0xFF, 0xFF, 0xFF)
BAND = (90, 990, 280, 570)
EM = 98  # skyCaption.size


def lum(rgb):
    c = rgb.astype(np.float64) / 255.0
    c = np.where(c <= 0.03928, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)
    return 0.2126 * c[..., 0] + 0.7152 * c[..., 1] + 0.0722 * c[..., 2]


def lum1(t):
    return float(lum(np.array([[t]], dtype=np.uint8))[0, 0])


L_INK = lum1(INK)
L_WHITE = lum1(WHITE)


def check(frame_path, mask_path, scale, viz=None):
    f = np.asarray(Image.open(frame_path).convert('RGB'))
    m = np.asarray(Image.open(mask_path).convert('RGB')).astype(np.int16)
    h, w = f.shape[:2]
    if m.shape[:2] != (h, w):
        m = np.asarray(Image.open(mask_path).convert('RGB').resize((w, h), Image.NEAREST)).astype(np.int16)
    s = w / 1080.0 if scale is None else scale
    x0, x1, y0, y1 = [int(round(v * s)) for v in BAND]
    R, G, B = m[..., 0], m[..., 1], m[..., 2]
    box = (B > 48) & (B >= R) & (B >= G)
    dark = (R > 48) & (R > G) & ~box
    light = (G > 48) & (G >= R) & ~box
    glyph = dark | light
    band = np.zeros((h, w), bool)
    band[y0:y1, x0:x1] = True
    if not (glyph & band).any():
        return None
    rad = max(1, int(round(3 * s)))
    excl = ndimage.binary_dilation(glyph | box, iterations=rad)
    dist, (iy, ix) = ndimage.distance_transform_edt(~glyph, return_indices=True)
    tone_dark = dark[iy, ix]  # tone of the nearest glyph
    bg = band & ~excl
    # columns the text spans (+0.3 em)
    cols = np.where((glyph & band).any(axis=0))[0]
    pad = int(round(0.3 * EM * s))
    colmask = np.zeros(w, bool)
    colmask[max(0, cols.min() - pad):min(w, cols.max() + pad + 1)] = True
    bg_band = bg & colmask[None, :]
    near = bg & (dist <= 0.3 * EM * s)
    Lb = lum(f)
    Lt = np.where(tone_dark, L_INK, L_WHITE)
    ratio = (np.maximum(Lb, Lt) + 0.05) / (np.minimum(Lb, Lt) + 0.05)
    bad = ratio < 3.0
    fn = float(bad[near].mean()) if near.any() else 0.0
    fb = float(bad[bg_band].mean()) if bg_band.any() else 0.0
    if viz:
        out = f.copy()
        out[near & bad] = (255, 0, 255)
        out[bg_band & bad & ~near] = (255, 160, 255)
        Image.fromarray(out[max(0, y0 - 20):y1 + 20]).save(viz)
    tones = ('dark' if dark[band].any() else '') + ('+' if dark[band].any() and light[band].any() else '') + ('light' if light[band].any() else '')
    return fn, fb, tones


def main():
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    opt = dict(a[2:].split('=', 1) if '=' in a else (a[2:], '1') for a in sys.argv[1:] if a.startswith('--'))
    if not args:
        print(__doc__)
        sys.exit(2)
    scale = float(opt['scale']) if 'scale' in opt else None
    thresh = float(opt.get('thresh', 0.05))
    quiet = 'quiet' in opt
    fails, warns, n = [], [], 0
    for line in open(args[0]):
        parts = line.split()
        if len(parts) < 4:
            continue
        sec, fr, fp, mp = parts[0], parts[1], parts[2], parts[3]
        viz = None
        if 'viz' in opt:
            import os
            os.makedirs(opt['viz'], exist_ok=True)
            viz = os.path.join(opt['viz'], f'cc_{float(sec):07.3f}.png')
        r = check(fp, mp, scale, viz)
        if r is None:
            continue
        n += 1
        fn, fb, tones = r
        tag = 'FAIL' if fn > thresh else 'warn' if fb > thresh else 'ok'
        if tag == 'FAIL':
            fails.append(float(sec))
        elif tag == 'warn':
            warns.append(float(sec))
        if not quiet or tag != 'ok':
            print(f'[capcheck] {float(sec):7.3f}s f{fr:>5} {tag:4}  near<3:1 {fn * 100:5.1f}%  band<3:1 {fb * 100:5.1f}%  tone {tones}')
    print(f'[capcheck] {n} caption frames: {len(fails)} FAIL (near background > {thresh * 100:.0f}% below 3:1), {len(warns)} warn (band)'
          + (f'  FAIL at {", ".join(f"{t:.2f}s" for t in fails)}' if fails else ''))
    sys.exit(1 if fails else 0)


if __name__ == '__main__':
    main()
