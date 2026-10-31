"""lay imagination A's frames out as one sheet, in beat order, then the alternates: ../A_sheet.png
python3 sheet.py [--phone]   (--phone also writes a small phone-size strip for the look in order)"""
import os
import sys

from PIL import Image, ImageDraw, ImageFont

from render import OUT

HERE = os.path.dirname(os.path.abspath(__file__))
SHEET = os.path.abspath(os.path.join(HERE, '..', 'A_sheet.png'))

MAIN = [
    ('B1', 'The city wakes warm'),
    ('B2', 'A street of giant machines'),
    ('B3', 'The machines run hot'),
    ('B4', 'One computer, a whole block boiling'),
    ('B5', 'One cup'),
    ('B6', 'Warmth drifting away'),
    ('B7', 'The city throws its windows open'),
    ('B8', 'The plan, drawn in the frost'),
    ('B9', 'The frost door opens'),
    ('B10', 'Cold in, warm out'),
    ('B11', 'Home by home, up the street'),
    ('B12', 'Your chat, her window'),
]
ALTS = []  # filled in by frames.py's alternates: [(id, title)]


def font(size, bold=False):
    for p in ([f'/usr/share/fonts/truetype/dejavu/DejaVuSans{"-Bold" if bold else ""}.ttf',
               '/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf']):
        if os.path.exists(p):
            return ImageFont.truetype(p, size)
    return ImageFont.load_default()


def build(items, alts, path=SHEET, tw=300, cols=6, gap=22, label_h=70, title='A  ·  THE FROSTED CITY  (the city as the story)'):
    th = int(tw * 16 / 9)
    rows_main = (len(items) + cols - 1) // cols
    rows_alt = (len(alts) + cols - 1) // cols if alts else 0
    head = 90
    alt_head = 60 if alts else 0
    Wd = cols * tw + (cols + 1) * gap
    Ht = head + (rows_main + rows_alt) * (th + label_h + gap) + alt_head + gap
    sheet = Image.new('RGB', (Wd, Ht), (244, 242, 238))
    d = ImageDraw.Draw(sheet)
    d.text((gap, 26), title, fill=(40, 34, 52), font=font(34, True))
    note = 'value sketches · one warm accent (the heat) · the caption seat as a light band'
    d.text((Wd - gap - d.textlength(note, font=font(20)), 34), note, fill=(90, 86, 100), font=font(20))

    def place(i, ident, ttl, y0):
        r, c = divmod(i, cols)
        x = gap + c * (tw + gap)
        y = y0 + r * (th + label_h + gap)
        im = Image.open(os.path.join(OUT, f'A-{ident}.png')).convert('RGB').resize((tw, th), Image.LANCZOS)
        sheet.paste(im, (x, y))
        d.rectangle([x - 1, y - 1, x + tw, y + th], outline=(170, 166, 176))
        d.text((x, y + th + 8), f'A-{ident}', fill=(40, 34, 52), font=font(24, True))
        d.text((x, y + th + 38), ttl, fill=(70, 66, 80), font=font(17))

    y = head
    for i, (ident, ttl) in enumerate(items):
        place(i, ident, ttl, y)
    y += rows_main * (th + label_h + gap)
    if alts:
        d.text((gap, y + 14), 'ALTERNATES (the beats I am least sure of)', fill=(40, 34, 52), font=font(26, True))
        y += alt_head
        for i, (ident, ttl) in enumerate(alts):
            place(i, ident, ttl, y)
    sheet.save(path, optimize=True)
    return path


def phone_strip(items, path, tw=180):
    """the film in order at phone-thumbnail size: one row, to read as a sequence"""
    th = int(tw * 16 / 9)
    strip = Image.new('RGB', (len(items) * (tw + 8) + 8, th + 16), (20, 20, 24))
    for i, (ident, _) in enumerate(items):
        im = Image.open(os.path.join(OUT, f'A-{ident}.png')).convert('RGB').resize((tw, th), Image.LANCZOS)
        strip.paste(im, (8 + i * (tw + 8), 8))
    strip.save(path, quality=90)
    return path


if __name__ == '__main__':
    import json
    alts_file = os.path.join(HERE, 'alternates.json')
    alts = json.load(open(alts_file)) if os.path.exists(alts_file) else ALTS
    print(build(MAIN, alts))
    if '--phone' in sys.argv:
        print(phone_strip(MAIN, os.path.join(OUT, 'A_phone_strip.jpg')))
