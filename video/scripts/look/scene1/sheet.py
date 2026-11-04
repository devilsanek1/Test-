"""Side-by-side sheets at 400 px wide, labelled (posters cropped to their content rows).

python3 sheet.py OUT.jpg [--grey] LABEL=PATH [LABEL=PATH ...]
"""
import json
import os
import sys

from PIL import Image, ImageDraw, ImageFont, ImageOps

REFS = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', 'docs', 'look', 'poster_refs')
FONT = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'


def load(path):
    im = Image.open(path).convert('RGB')
    name = os.path.basename(path)
    mask = os.path.join(REFS, 'ui_mask.json')
    if os.path.exists(mask):
        m = json.load(open(mask))['images']
        if name in m:
            r0, r1 = m[name]['content_rows']
            im = im.crop((0, r0, im.width, r1))
    return im


def sheet(out, items, grey=False, width=400, pad=16, label_h=34, bg=(246, 244, 240)):
    tiles = []
    for label, path in items:
        im = load(path)
        im = im.resize((width, round(im.height * width / im.width)), Image.LANCZOS)
        if grey:
            im = ImageOps.grayscale(im).convert('RGB')
        tiles.append((label, im))
    H = max(t.height for _, t in tiles) + label_h + 2 * pad
    W = len(tiles) * (width + pad) + pad
    S = Image.new('RGB', (W, H), bg)
    d = ImageDraw.Draw(S)
    try:
        ft = ImageFont.truetype(FONT, 17)
    except OSError:
        ft = ImageFont.load_default()
    for i, (label, im) in enumerate(tiles):
        x = pad + i * (width + pad)
        d.text((x, pad // 2 + 4), label, fill=(40, 40, 40), font=ft)
        S.paste(im, (x, pad + label_h - 6))
    S.save(out, quality=90)
    return out


if __name__ == '__main__':
    args = sys.argv[1:]
    out = args.pop(0)
    grey = '--grey' in args
    args = [a for a in args if a != '--grey']
    items = [a.split('=', 1) for a in args]
    print(sheet(out, items, grey=grey))
