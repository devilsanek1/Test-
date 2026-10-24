#!/usr/bin/env python3
"""Contact sheets for the edge lab.

  sheet.py grid <dir> <out.png> --rows clean,panel,... --cols street,monument,vista [--w 360] [--notes notes.json]
      full frames <dir>/<row>_<col>.png, rows = variants, columns = shots, labelled
  sheet.py corners <dir> <out.png> --rows ... --col street [--crop 300] [--zoom 1.0]
      per variant: the top-left and bottom-right corners of <dir>/<row>_<col>.png (full-res renders), side by side
"""
import argparse
import json
import os

from PIL import Image, ImageDraw, ImageFont

BG = (246, 243, 238)
INK = (43, 27, 10)
MUTED = (120, 105, 90)


def font(size):
    for f in ['/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', '/usr/share/fonts/dejavu/DejaVuSans.ttf']:
        if os.path.exists(f):
            return ImageFont.truetype(f, size)
    return ImageFont.load_default()


def bold(size):
    for f in ['/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', '/usr/share/fonts/dejavu/DejaVuSans-Bold.ttf']:
        if os.path.exists(f):
            return ImageFont.truetype(f, size)
    return font(size)


def grid(a):
    rows = a.rows.split(',')
    cols = a.cols.split(',')
    notes = json.load(open(a.notes)) if a.notes else {}
    colnames = json.load(open(a.colnames)) if a.colnames else {}
    w = a.w
    sample = Image.open(os.path.join(a.dir, f'{rows[0]}_{cols[0]}.png'))
    h = round(w * sample.height / sample.width)
    lab = 250
    head = 70
    gap = 16
    W = lab + len(cols) * (w + gap) + gap
    H = head + len(rows) * (h + gap) + gap
    S = Image.new('RGB', (W, H), BG)
    d = ImageDraw.Draw(S)
    for j, c in enumerate(cols):
        d.text((lab + gap + j * (w + gap), 24), colnames.get(c, c), fill=INK, font=bold(22))
    for i, r in enumerate(rows):
        y = head + gap + i * (h + gap)
        d.text((16, y + 8), r, fill=INK, font=bold(30))
        note = notes.get(r, '')
        yy = y + 52
        for ln in note.split('\n'):
            d.text((16, yy), ln, fill=MUTED, font=font(17))
            yy += 24
        for j, c in enumerate(cols):
            p = os.path.join(a.dir, f'{r}_{c}.png')
            if not os.path.exists(p):
                continue
            im = Image.open(p).convert('RGB').resize((w, h), Image.LANCZOS)
            S.paste(im, (lab + gap + j * (w + gap), y))
    S.save(a.out)
    print(a.out, S.size)


def corners(a):
    rows = a.rows.split(',')
    c = a.crop
    z = a.zoom
    cw = round(c * z)
    lab = 230
    gap = 14
    head = 60
    cols = a.col.split(',')
    W = lab + len(cols) * 2 * (cw + gap) + gap
    H = head + len(rows) * (cw + gap) + gap
    S = Image.new('RGB', (W, H), BG)
    d = ImageDraw.Draw(S)
    for j, col in enumerate(cols):
        x = lab + gap + j * 2 * (cw + gap)
        d.text((x, 20), f'{col}: top-left', fill=INK, font=bold(20))
        d.text((x + cw + gap, 20), f'{col}: bottom-right', fill=INK, font=bold(20))
    for i, r in enumerate(rows):
        y = head + gap + i * (cw + gap)
        d.text((16, y + 8), r, fill=INK, font=bold(28))
        for j, col in enumerate(cols):
            p = os.path.join(a.dir, f'{r}_{col}.png')
            if not os.path.exists(p):
                continue
            im = Image.open(p).convert('RGB')
            k = im.width / 1080
            cc = round(c * k)
            tl = im.crop((0, 0, cc, cc)).resize((cw, cw), Image.LANCZOS)
            br = im.crop((im.width - cc, im.height - cc, im.width, im.height)).resize((cw, cw), Image.LANCZOS)
            x = lab + gap + j * 2 * (cw + gap)
            S.paste(tl, (x, y))
            S.paste(br, (x + cw + gap, y))
    S.save(a.out)
    print(a.out, S.size)


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('mode')
    ap.add_argument('dir')
    ap.add_argument('out')
    ap.add_argument('--rows')
    ap.add_argument('--cols', default='street,monument,vista')
    ap.add_argument('--col', default='street')
    ap.add_argument('--w', type=int, default=360)
    ap.add_argument('--crop', type=int, default=300)
    ap.add_argument('--zoom', type=float, default=1.0)
    ap.add_argument('--notes')
    ap.add_argument('--colnames')
    a = ap.parse_args()
    grid(a) if a.mode == 'grid' else corners(a)
