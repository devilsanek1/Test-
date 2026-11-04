"""Check the type stills against TYPE_GUIDE.md §f (the numbers, not the taste): per word, its ink box (from the
renderer's layout log, canvas-measured), the type frame (y 290-1250; x 96-944 above y 840, x 96-860 below), the gap to the
row above where they overlap in x (>= 20 px in a lockup), and the contrast of its colour against the bare frame's pixels
within 20 px of its glyphs (>= 4.5:1 running words, >= 3:1 the brush; reported as the 5th percentile and the share under).

    python3 scripts/type/check_stills.py [scripts/type/out/NN_*.png ...]     # from video/; default: every still in out/
"""
import glob, json, os, sys
import numpy as np
from PIL import Image
from scipy.ndimage import binary_dilation

HERE = os.path.dirname(os.path.abspath(__file__))


def lum(rgb):
    c = np.asarray(rgb, dtype=np.float64) / 255.0
    c = np.where(c <= 0.03928, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)
    return 0.2126 * c[..., 0] + 0.7152 * c[..., 1] + 0.0722 * c[..., 2]


def hexrgb(h):
    h = h.lstrip('#')
    return [int(h[i:i + 2], 16) for i in (0, 2, 4)]


def check(png):
    stem = png[:-4]
    if not os.path.exists(stem + '_layout.json'):
        return
    L = json.load(open(stem + '_layout.json'))
    mask = np.asarray(Image.open(stem + '_mask.png').convert('L')) > 128
    bare = np.asarray(Image.open(stem + '_bare.png').convert('RGB')).astype(np.float64)
    ys, xs = np.nonzero(mask)
    print(f'\n== {os.path.basename(png)}  all ink: x {xs.min()}-{xs.max()}, y {ys.min()}-{ys.max()}')
    for i, b in enumerate(L):
        x0, x1, top, bot = b['x0'], b['x1'], b['top'], b['bottom']
        flags = []
        if top < 290 or bot > 1250: flags.append('y outside 290-1250')
        if x0 < 96: flags.append(f'x0 {x0} < 96')
        lim = 944 if bot <= 840 else 860
        if x1 > lim: flags.append(f'x1 {x1} > {lim}')
        # gap to any earlier word above it that overlaps in x: per column, this word's highest ink minus the upper
        # word's lowest ink (each word's ink = the mask inside its own box), the minimum over the shared columns
        for a in L[:i]:
            if a['base'] < b['base'] and min(a['x1'], x1) > max(a['x0'], x0):
                c0, c1 = max(a['x0'], x0), min(a['x1'], x1)
                ma = mask[max(0, a['top'] - 2):a['bottom'] + 3, c0:c1]
                mb = mask[max(0, top - 2):bot + 3, c0:c1]
                cols = ma.any(0) & mb.any(0)
                if cols.any():
                    low_a = (max(0, a['top'] - 2) + ma.shape[0] - 1 - np.argmax(ma[::-1], 0))[cols]
                    high_b = (max(0, top - 2) + np.argmax(mb, 0))[cols]
                    gap = int((high_b - low_a).min())
                    if gap < 20: flags.append(f'gap {gap} px to "{a["t"]}"')
        # contrast against the bare frame near this word's glyphs
        yy0, yy1, xx0, xx1 = max(0, top - 22), min(1920, bot + 22), max(0, x0 - 22), min(1080, x1 + 22)
        m = mask[yy0:yy1, xx0:xx1]
        r = binary_dilation(m, iterations=20) & ~binary_dilation(m, iterations=2)
        px = bare[yy0:yy1, xx0:xx1][r]
        need = 3.0 if 'Brush' in b['font'] else 4.5
        if len(px):
            lt, lb = lum(hexrgb(b['fill'])), lum(px)
            cr = (np.maximum(lt, lb) + 0.05) / (np.minimum(lt, lb) + 0.05)
            p5, under = np.percentile(cr, 5), (cr < need).mean() * 100
            ctr = f'contrast p5 {p5:.1f}:1, {under:.1f} % < {need}'
            if under > 5: flags.append(f'CONTRAST {under:.0f} % under {need}:1')
        else:
            ctr = 'contrast n/a'
        print(f'  "{b["t"]}" {b["font"]}  x {x0}-{x1} ({x1 - x0}), y {top}-{bot} (base {b["base"]})  {ctr}' + (('  !! ' + '; '.join(flags)) if flags else ''))


if __name__ == '__main__':
    files = sys.argv[1:] or sorted(glob.glob(os.path.join(HERE, 'out', '[0-9]*.png')))
    for f in files:
        if not any(f.endswith(s) for s in ('_mask.png', '_bare.png')):
            check(f)
