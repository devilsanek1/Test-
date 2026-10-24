#!/usr/bin/env python3
"""Paint edge comparison sheets (review/edges/loose/).

  loose_sheets.py grid      -> paint_sheet.png      rows trim / paint-subtle / paint-medium / paint-loose x the three
                                                    shots, full frames on a dark phone bezel, labelled
  loose_sheets.py corners   -> paint_corners.png    per shot and row: top-left, top-right, left edge (mid), bottom-left,
                                                    bottom-right, 300 px crops from the full-res stills (1:1)
  loose_sheets.py ref       -> paint_vs_ref.png     reference 1 (f_5.5, f_9.0) panel-edge crops next to paint-loose /
                                                    paint-medium crops at the same scale
  loose_sheets.py seeds     -> paint_seeds.png      paint-medium on the street for 6 scene seeds (separate paintings)
  loose_sheets.py labels    -> tools/sbs_labels.png the label bar for the side-by-side clip
"""
import os
import sys

from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.dirname(HERE)
ST = os.path.join(OUT, 'stills')
REF = os.path.join(OUT, '..', '..', '..', 'assets', 'ref')
BG = (246, 243, 238)
INK = (43, 27, 10)
MUTED = (110, 96, 82)
BEZEL = (24, 24, 26)
ROWS = ['trim', 'paint-subtle', 'paint-medium', 'paint-loose']
SHOTS = [('street', 'KitDemo street, dusk'), ('monument', 'CineDemo monument (crane)'), ('vista', 'CineDemo vista (peak sun)')]
NOTES = {
    'trim': 'THE PICK (round 2).\nHand-trimmed slivers,\nbottom open. For\nreference.',
    'paint-subtle': 'PAINT, SUBTLE\n(looseness 0.5).\nWhite paper, colour laid\non as 2 flat blocks: the\nmargin wanders 8-40 px,\none small unpainted\ncorner, one lip, a shelf,\nthe ground runs off the\nbottom once. Ink runs\n14-34 px into the white.',
    'paint-medium': 'PAINT, MEDIUM (1.0).\n3 blocks stepping in and\nout, notches, an unpainted\ncorner, a bleed corner,\nshelves, two tongues out\nto the edge. Ink 24-58 px\npast the colour, ending\nin the white on ~60 %\nof stretches.',
    'paint-loose': 'PAINT, LOOSE (1.6).\nAs messy as reference 1\ndares: 4 blocks, deep\nnotches, two corners left\nas line art, the bottom\nbroken up under the app\nUI. Ink 30-66 px past\nthe colour.',
}
CROPS = [
    ('top-left', (0, 0, 300, 300)),
    ('top-right', (780, 0, 1080, 300)),
    ('left edge, y 760-1060', (0, 760, 300, 1060)),
    ('bottom-left', (0, 1620, 300, 1920)),
    ('bottom-right', (780, 1620, 1080, 1920)),
]


def font(size, bold=False):
    f = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf' if bold else '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
    return ImageFont.truetype(f, size) if os.path.exists(f) else ImageFont.load_default()


def grid(rows=ROWS, out='paint_sheet.png'):
    w, h = 432, 768
    lab, head, gap = 290, 64, 30
    W = lab + len(SHOTS) * (w + gap) + gap
    H = head + len(rows) * (h + gap) + gap + 40
    S = Image.new('RGB', (W, H), BG)
    d = ImageDraw.Draw(S)
    for j, (_, name) in enumerate(SHOTS):
        d.text((lab + gap + j * (w + gap), 24), name, fill=INK, font=font(22, True))
    for i, r in enumerate(rows):
        y = head + gap + i * (h + gap)
        d.text((18, y + 6), r, fill=INK, font=font(30, True))
        yy = y + 56
        for ln in NOTES.get(r, '').split('\n'):
            d.text((18, yy), ln, fill=MUTED, font=font(17))
            yy += 25
        for j, (s, _) in enumerate(SHOTS):
            im = Image.open(os.path.join(ST, f'{r}_{s}.png')).convert('RGB').resize((w, h), Image.LANCZOS)
            x = lab + gap + j * (w + gap)
            d.rounded_rectangle((x - 9, y - 9, x + w + 9, y + h + 9), radius=14, fill=BEZEL)
            S.paste(im, (x, y))
    d.text((18, H - 34), 'Full frames, 1080x1920 shown at 0.4 on a dark phone bezel. Captions render above the treatment. Seed "film", amount 1 (the preset).', fill=MUTED, font=font(17))
    p = os.path.join(OUT, out)
    S.save(p)
    print(p, S.size)


def corners():
    c, gap, lab, head = 300, 16, 190, 70
    W = lab + len(CROPS) * (c + gap) + gap
    rows = [(s, sn, r) for s, sn in SHOTS for r in ROWS]
    H = head + len(rows) * (c + gap) + len(SHOTS) * 34 + gap
    S = Image.new('RGB', (W, H), BG)
    d = ImageDraw.Draw(S)
    for k, (name, _) in enumerate(CROPS):
        d.text((lab + gap + k * (c + gap), 26), name, fill=INK, font=font(20, True))
    y = head
    for s, sn in SHOTS:
        d.text((16, y + 4), sn, fill=MUTED, font=font(18, True))
        y += 34
        for r in ROWS:
            im = Image.open(os.path.join(ST, f'{r}_{s}.png')).convert('RGB')
            d.text((16, y + 8), r, fill=INK, font=font(22, True))
            for k, (_, box) in enumerate(CROPS):
                x = lab + gap + k * (c + gap)
                d.rectangle((x - 4, y - 4, x + c + 4, y + c + 4), fill=BEZEL)
                S.paste(im.crop(box), (x, y))
            y += c + gap
    p = os.path.join(OUT, 'paint_corners.png')
    S.save(p)
    print(p, S.size)


def ref():
    """Reference 1's panel edges (its card is 1080x1350; the panel ~770 px wide, so ~1.4x our 1080 px frame's scale
    for the same drawing) next to ours, 1:1 pixels, so the edge character can be compared."""
    c, gap, lab, head = 300, 16, 190, 70
    refcrops = [
        ('f_5.5 top-left', 'f_5.5.png', (60, 60, 360, 360)),
        ('f_5.5 bottom-left', 'f_5.5.png', (60, 700, 360, 1000)),
        ('f_5.5 bottom-right', 'f_5.5.png', (720, 700, 1020, 1000)),
        ('f_9.0 top-left', 'f_9.0.png', (60, 100, 360, 400)),
        ('f_12.0 bottom-right', 'f_12.0.png', (720, 680, 1020, 980)),
    ]
    rows = [('reference 1', None)] + [(r, s) for r in ['paint-medium', 'paint-loose'] for s in ['street', 'vista']]
    W = lab + len(CROPS) * (c + gap) + gap
    H = head + len(rows) * (c + gap + 26) + gap
    S = Image.new('RGB', (W, H), BG)
    d = ImageDraw.Draw(S)
    y = head
    for r, s in rows:
        d.text((16, y + 8), r if s is None else f'{r}\n{s}', fill=INK, font=font(20, True))
        for k in range(len(CROPS)):
            x = lab + gap + k * (c + gap)
            if s is None:
                name, f, box = refcrops[k]
                im = Image.open(os.path.join(REF, f)).convert('RGB').crop(box)
            else:
                name, box = CROPS[k]
                im = Image.open(os.path.join(ST, f'{r}_{s}.png')).convert('RGB').crop(box)
            d.text((x, y - 22), name, fill=MUTED, font=font(15))
            d.rectangle((x - 4, y - 4, x + c + 4, y + c + 4), fill=BEZEL)
            S.paste(im, (x, y))
        y += c + gap + 26
    p = os.path.join(OUT, 'paint_vs_ref.png')
    S.save(p)
    print(p, S.size)


def seeds():
    names = ['film', 'scene-01', 'scene-02', 'scene-03', 'scene-04', 'scene-05']
    w, h, gap = 324, 576, 24
    W = gap + len(names) * (w + gap)
    H = 70 + h + gap + 40
    S = Image.new('RGB', (W, H), BG)
    d = ImageDraw.Draw(S)
    d.text((gap, 20), 'paint-medium, street: one seed per scene = a separate painting each time (same looseness)', fill=INK, font=font(20, True))
    for i, n in enumerate(names):
        x = gap + i * (w + gap)
        im = Image.open(os.path.join(ST, 'seeds', f'paint-medium_{n}.png')).convert('RGB').resize((w, h), Image.LANCZOS)
        d.rounded_rectangle((x - 7, 70 - 7, x + w + 7, 70 + h + 7), radius=10, fill=BEZEL)
        S.paste(im, (x, 70))
        d.text((x, 70 + h + 12), f'seed "{n}"', fill=MUTED, font=font(17))
    p = os.path.join(OUT, 'paint_seeds.png')
    S.save(p)
    print(p, S.size)


def labels():
    w, h = 540, 56
    items = [('paint-subtle', 'looseness 0.5'), ('paint-medium', 'looseness 1'), ('paint-loose', 'looseness 1.6')]
    S = Image.new('RGB', (len(items) * w, h), BG)
    d = ImageDraw.Draw(S)
    for i, (r, sub) in enumerate(items):
        d.text((i * w + 20, 12), r, fill=INK, font=font(28, True))
        d.text((i * w + 20 + d.textlength(r, font=font(28, True)) + 14, 19), sub, fill=MUTED, font=font(20))
    p = os.path.join(HERE, 'sbs_labels.png')
    S.save(p)
    print(p, S.size)


if __name__ == '__main__':
    {'grid': grid, 'corners': corners, 'ref': ref, 'seeds': seeds, 'labels': labels}[sys.argv[1]]()
