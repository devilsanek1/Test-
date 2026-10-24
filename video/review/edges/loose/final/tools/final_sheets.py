#!/usr/bin/env python3
"""Paint edge FINAL sheets (review/edges/loose/final/, round 3 refined).

  final_sheets.py grid      -> paint_sheet.png      rows trim / paint-subtle / paint-medium / paint-loose x the three
                                                    shots, full frames on a dark phone bezel, labelled
  final_sheets.py phone     -> paint_phone.png      the same with the phone app UI drawn on top (status bar + header
                                                    180 px, description block 400 px, the right action rail): what a
                                                    viewer actually sees of the edge
  final_sheets.py corners   -> paint_corners.png    per shot and row: top-left, top-right, left edge (y 800-1100),
                                                    bottom-left, bottom-right, 300 px crops from the full-res stills (1:1)
  final_sheets.py ref       -> paint_vs_ref.png     reference 1 (f_5.5, f_9.0, f_12.0) panel-edge crops next to
                                                    paint-medium / paint-loose crops at the same scale
  final_sheets.py seeds     -> paint_seeds.png      paint-medium on the street for 6 scene seeds (separate paintings)
  final_sheets.py labels    -> tools/sbs_labels.png the label bar for the 4-panel side-by-side clip
"""
import os
import sys

from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.dirname(HERE)
ST = os.path.join(OUT, 'stills')
REF = os.path.join(OUT, '..', '..', '..', '..', 'assets', 'ref')
BG = (246, 243, 238)
INK = (43, 27, 10)
MUTED = (110, 96, 82)
BEZEL = (24, 24, 26)
ROWS = ['trim', 'paint-subtle', 'paint-medium', 'paint-loose']
SHOTS = [('street', 'KitDemo street, dusk'), ('monument', 'CineDemo monument (crane)'), ('vista', 'CineDemo vista (peak sun)')]
NOTES = {
    'trim': 'ROUND 2 PICK.\nHand-trimmed slivers,\nbottom open. For\nreference.',
    'paint-subtle': 'PAINT, SUBTLE (0.6).\nTrim, painted: each side\none long tilted edge, one\nclear step. ONE bare\ncorner where the scene\nhas drawing (else a bite\nin the ground\'s drawing).\nInk runs 18-38 px on.',
    'paint-medium': 'PAINT, MEDIUM (1.0).\nThree blocks, clear\nsteps; a bare corner and\na partly bare top corner\nwhere there is drawing,\na bleed corner, one left\nbite with line art in it.\nInk runs 26-56 px on.',
    'paint-loose': 'PAINT, LOOSE (1.6).\nTwo bare corners, a deep\nleft bite and a right bite\nin the visible zone, the\nbottom broken up under\nthe UI, the ruled crossing\nat a painted corner.\nInk runs 32-66 px on.',
}
CROPS = [
    ('top-left', (0, 0, 300, 300)),
    ('top-right', (780, 0, 1080, 300)),
    ('left edge, y 800-1100', (0, 800, 300, 1100)),
    ('bottom-left', (0, 1620, 300, 1920)),
    ('bottom-right', (780, 1620, 1080, 1920)),
]


def font(size, bold=False):
    f = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf' if bold else '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
    return ImageFont.truetype(f, size) if os.path.exists(f) else ImageFont.load_default()


def grid(rows=ROWS, out='paint_sheet.png', ui=False):
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
            im = Image.open(os.path.join(ST, f'{r}_{s}.png')).convert('RGB')
            if ui:
                im = phone_ui(im)
            im = im.resize((w, h), Image.LANCZOS)
            x = lab + gap + j * (w + gap)
            d.rounded_rectangle((x - 9, y - 9, x + w + 9, y + h + 9), radius=14, fill=BEZEL)
            S.paste(im, (x, y))
    d.text((18, H - 34), ('Phone app UI drawn on top (status bar + header 180 px, description 400 px, action rail). ' if ui else '') + 'Seed "film", amount 1; each shot with its EDGE_HINTS (line-art density, keep rects).', fill=MUTED, font=font(17))
    p = os.path.join(OUT, out)
    S.save(p)
    print(p, S.size)


def phone_ui(im):
    """A 9:16 short-video app's UI over a full-res frame: status bar + header (top 180 px), the description / sound /
    progress block (bottom 400 px) on a dark scrim, white text bars, the action rail (x > 950, y 900-1500)."""
    im = im.convert('RGBA')
    ov = Image.new('RGBA', im.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(ov)
    for y in range(0, 180):
        d.line((0, y, 1080, y), fill=(0, 0, 0, int(110 * (1 - y / 180))))
    for y in range(1520, 1920):
        d.line((0, y, 1080, y), fill=(0, 0, 0, int(140 * (y - 1520) / 400)))
    W_ = (255, 255, 255, 235)
    d.rounded_rectangle((40, 30, 150, 60), 8, fill=W_)
    d.rounded_rectangle((900, 30, 1040, 60), 8, fill=W_)
    d.rounded_rectangle((330, 110, 750, 140), 10, fill=W_)
    for i, w in enumerate([380, 620, 300]):
        d.rounded_rectangle((40, 1640 + i * 62, 40 + w, 1676 + i * 62), 10, fill=W_)
    d.rectangle((0, 1880, 1080, 1886), fill=W_)
    for i in range(5):
        cy = 960 + i * 120
        d.ellipse((985, cy - 38, 1061, cy + 38), outline=W_, width=6)
    return Image.alpha_composite(im, ov).convert('RGB')


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
    w, h = 432, 56
    items = [('trim', 'round 2'), ('paint-subtle', '0.6'), ('paint-medium', '1'), ('paint-loose', '1.6')]
    S = Image.new('RGB', (len(items) * w, h), BG)
    d = ImageDraw.Draw(S)
    for i, (r, sub) in enumerate(items):
        d.text((i * w + 16, 12), r, fill=INK, font=font(26, True))
        d.text((i * w + 16 + d.textlength(r, font=font(26, True)) + 10, 18), sub, fill=MUTED, font=font(19))
    p = os.path.join(HERE, 'sbs_labels.png')
    S.save(p)
    print(p, S.size)


if __name__ == '__main__':
    {'grid': grid, 'phone': lambda: grid(out='paint_phone.png', ui=True), 'corners': corners, 'ref': ref, 'seeds': seeds, 'labels': labels}[sys.argv[1]]()
