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

PER WORD (--words; src/lib/captions2, docs/look/TYPE_GUIDE.md section f.3: every word >= 4.5:1): the mask is the
captions2 mask ({"capcheck": "mask"}: each piece drawn in rgb(255, id x 8, tone code x 40); the codes: 1 warm white
#FFF0DE, 2 honey #FFD58C, 3-5 plum #3A2B48; only fully covered pixels, R 255, are decoded) and the list's frame must be
the BARE render ({"capcheck": "bg"}, the words hidden); each word's colour
is measured against the bare frame's pixels 2-20 px from its own glyphs (scripts/type/check_stills.py's ring), reported as
the 5th percentile and the share under --min (default 4.5); a word FAILS when more than --thresh of its ring is under.
scripts/captions2/render_test.mjs --capcheck writes such a list.
  python3 scripts/capcheck.py list.txt --words [--min=4.5] [--thresh=0.05] [--captions=public/v4/captions2.json]
  --captions names each word (the caption file the frames were rendered from).
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


# captions2 masks (src/lib/captions2/Captions2.tsx CAPTIONS2_MASK): R 255, G the piece id, B the tone code
WORD_COLOURS = {1: (0xFF, 0xF0, 0xDE), 2: (0xFF, 0xD5, 0x8C), 3: (0x3A, 0x2B, 0x48), 4: (0x3A, 0x2B, 0x48), 5: (0x3A, 0x2B, 0x48)}
WORD_KIND = {1: 'running', 2: 'lit', 3: 'running', 4: 'lit', 5: 'world'}


def caption_words(captions, sec):
    """The pieces of the group on screen at `sec` (in the component's id order), or None."""
    if not captions:
        return None
    fps = captions.get('fps', 60)
    fr = int(round(sec * fps))
    for g in captions['groups']:
        if int(round(g['start'] * fps)) <= fr < int(round(g['end'] * fps)):
            return [p['t'] for r in g['rows'] for p in r['pieces']]
    return None


def check_words(frame_path, mask_path, need, thresh, names=None):
    """Per word: (id, text, kind, colour, p5, share under `need`) against the bare frame's pixels 2-20 px from its glyphs."""
    f = np.asarray(Image.open(frame_path).convert('RGB')).astype(np.float64)
    m = np.asarray(Image.open(mask_path).convert('RGB')).astype(np.int16)
    h, w = f.shape[:2]
    if m.shape[:2] != (h, w):
        m = np.asarray(Image.open(mask_path).convert('RGB').resize((w, h), Image.NEAREST)).astype(np.int16)
    R, G, B = m[..., 0], m[..., 1], m[..., 2]
    ids = np.rint(G / 8.0).astype(np.int16)
    codes = np.rint(B / 40.0).astype(np.int16)
    solid = (R == 255) & (ids >= 1) & (ids <= 31) & (codes >= 1) & (codes <= 5)
    out = []
    for wid in sorted(set(ids[solid].tolist())):
        core = solid & (ids == wid)
        code = int(np.bincount(codes[core].ravel()).argmax())
        ys, xs = np.nonzero(core)
        y0, y1, x0, x1 = max(0, ys.min() - 24), min(h, ys.max() + 25), max(0, xs.min() - 24), min(w, xs.max() + 25)
        mk = core[y0:y1, x0:x1]
        ring = ndimage.binary_dilation(mk, iterations=20) & ~ndimage.binary_dilation(mk, iterations=3)
        px = f[y0:y1, x0:x1][ring]
        lt = lum1(WORD_COLOURS[code])
        lb = lum(px)
        cr = (np.maximum(lt, lb) + 0.05) / (np.minimum(lt, lb) + 0.05)
        p5 = float(np.percentile(cr, 5)) if len(cr) else float('nan')
        under = float((cr < need).mean()) if len(cr) else 0.0
        text = names[wid - 1] if names and 0 < wid <= len(names) else f'id {wid}'
        out.append((wid, text, WORD_KIND[code], '#%02X%02X%02X' % WORD_COLOURS[code], p5, under, (int(xs.min()), int(xs.max()), int(ys.min()), int(ys.max()))))
    return out


def is_captions2_list(list_path):
    """True when the list's first mask with glyphs is a captions2 mask (exact rgb(255, 8k, 40c) codes; the old
    SkyCaptions mask is pure #FF0000 / #00FF00 / #0000FF)."""
    for line in open(list_path):
        parts = line.split()
        if len(parts) < 4:
            continue
        m = np.asarray(Image.open(parts[3]).convert('RGB')).astype(np.int16)
        full = m[..., 0] == 255
        if not full.any():
            continue
        G, B = m[..., 1][full], m[..., 2][full]
        coded = (G > 0) & (G % 8 == 0) & (G <= 248) & (B > 0) & (B % 40 == 0) & (B <= 200)
        return bool(coded.mean() > 0.5)
    return False


def main_words(args, opt):
    need = float(opt.get('min', 4.5))
    thresh = float(opt.get('thresh', 0.05))
    quiet = 'quiet' in opt
    captions = None
    if 'captions' in opt:
        import json
        captions = json.load(open(opt['captions']))
    fails, n = [], 0
    for line in open(args[0]):
        parts = line.split()
        if len(parts) < 4:
            continue
        sec, fr, fp, mp = float(parts[0]), parts[1], parts[2], parts[3]
        for wid, text, kind, col, p5, under, box in check_words(fp, mp, need, thresh, caption_words(captions, sec)):
            n += 1
            tag = 'FAIL' if under > thresh else 'ok'
            if tag == 'FAIL':
                fails.append(f'{sec:.2f}s "{text}"')
            if not quiet or tag != 'ok':
                print(f'[capcheck] {sec:7.3f}s f{fr:>5} {tag:4}  "{text}" ({kind} {col})  p5 {p5:4.1f}:1  under {need}:1 {under * 100:5.1f}%  ink x {box[0]}-{box[1]} y {box[2]}-{box[3]}')
    print(f'[capcheck] {n} words: {len(fails)} FAIL (more than {thresh * 100:.0f}% of the ring 2-20 px from the glyphs under {need}:1)'
          + (f'  FAIL: {", ".join(fails)}' if fails else ''))
    sys.exit(1 if fails else 0)


def main():
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    opt = dict(a[2:].split('=', 1) if '=' in a else (a[2:], '1') for a in sys.argv[1:] if a.startswith('--'))
    if not args:
        print(__doc__)
        sys.exit(2)
    if 'words' in opt:
        return main_words(args, opt)
    if is_captions2_list(args[0]):
        print('[capcheck] a captions2 mask (src/lib/captions2): checking every word at 4.5:1 (--words)')
        return main_words(args, opt)
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
