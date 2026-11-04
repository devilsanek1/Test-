"""C_sheet.png: the 12 frames in beat order (C-B1..C-B12), then the alternates (C-B1alt ...). python3 -I sheet.py"""
import os
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, '..', 'C_sheet.png')
TW, TH = 300, 533
GAP, PADX, HEAD, LAB = 18, 30, 118, 64
BEATS = [('B1', 'The snow wakes warm'), ('B2', 'A street of computers'), ('B3', 'The heat climbs'),
         ('B4', 'Forty kettles inside'), ('B5', 'The tea cosy'), ('B6', 'Thrown into the night'),
         ('B7', 'The street opens a way'), ('B8', 'A plan in chalk'), ('B9', 'A door in the plan'),
         ('B10', 'Blue in, gold out'), ('B11', 'Warm under the snow'), ('B12', 'Your chat, her warm window')]
ALTS = [('B1alt', 'From your balcony'), ('B5alt', 'The teapot computer'), ('B7alt', 'The city reaches back')]


def font(sz, bold=False):
    for p in ('/usr/share/fonts/truetype/dejavu/DejaVuSans%s.ttf' % ('-Bold' if bold else ''),):
        if os.path.exists(p):
            return ImageFont.truetype(p, sz)
    return ImageFont.load_default()


cols = 6
rows = 3
Wd = PADX * 2 + cols * TW + (cols - 1) * GAP
Ht = HEAD + rows * (TH + LAB) + (rows - 1) * GAP + 50
sheet = Image.new('RGB', (Wd, Ht), (20, 22, 32))
d = ImageDraw.Draw(sheet)
d.text((PADX, 24), 'Imagination C  ·  THE WARM CURRENT: one night\'s trip of a little heat, from a question answered to a warm home',
       fill=(255, 226, 168), font=font(27, True))
d.text((PADX, 68), 'Value sketches in the night\'s cold values; the heat is the one warm thing, and it travels frame to frame. '
       'Rows 1-2: the film in beat order. Row 3: the alternates.', fill=(200, 204, 222), font=font(21))


def place(i, fid, title, row, col):
    x = PADX + col * (TW + GAP)
    y = HEAD + row * (TH + LAB + GAP)
    im = Image.open(os.path.join(HERE, 'frames', fid + '.jpg')).convert('RGB').resize((TW, TH), Image.LANCZOS)
    sheet.paste(im, (x, y))
    d.text((x, y + TH + 8), 'C-' + fid, fill=(255, 213, 140), font=font(24, True))
    d.text((x, y + TH + 38), title, fill=(214, 218, 232), font=font(18))


for k, (fid, title) in enumerate(BEATS):
    place(k, fid, title, k // 6, k % 6)
for k, (fid, title) in enumerate(ALTS):
    place(k, fid, title, 2, k)
d.text((PADX + 3 * (TW + GAP) + 10, HEAD + 2 * (TH + LAB + GAP) + 40),
       'Alternates for the three beats I am least sure of:\nB1 (the hook), B5 (the joke), B7 (the turn).\n\n'
       'Round 2 took the tea cosy and the street into the film;\nthe teapot computer and the roof reach are now\n'
       'their beats\' alternates, kept as drawn.\n\n'
       'Each is drawn whole (world, light, people, words)\nand is a chapter of the same concept.', fill=(190, 194, 214), font=font(20))
sheet.save(OUT, optimize=True)
print('wrote', os.path.normpath(OUT), sheet.size)
