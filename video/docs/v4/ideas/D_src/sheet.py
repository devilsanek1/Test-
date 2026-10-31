"""Lay out imagination D's sheet: the 12 beats in order (D-B1 ... D-B12), then the alternates (D-B<n>alt).

python3 sheet.py [out.png] [--tile 360]  (reads out/<id>.jpg from render_all.sh; writes ../D_sheet.png by default)
"""
import os
import sys

from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
BEATS = ['D-B%d' % i for i in range(1, 13)]
TITLES = {
    'D-B1': 'The frost clears onto 70,000 windows',
    'D-B2': "Her chat's other end: a city of machines",
    'D-B3': "The building the snow can't touch",
    'D-B4': 'Forty kettles in her kitchen',
    'D-B5': 'Tea for one',
    'D-B6': 'Out her window, up into the night',
    'D-B7': 'The whole block reaches',
    'D-B8': 'Across the bay, a plan',
    'D-B9': "The plan's door opens",
    'D-B10': 'Blue in, honey out',
    'D-B11': 'Up her street, under the snow',
    'D-B12': 'Socks on a warm radiator',
    'D-B2alt': 'Her armchair among the giants',
    'D-B7alt': 'She leans out and catches it',
    'D-B8alt': 'Her window, seen from the plan',
    'D-B11alt': "The house opened like a doll's house",
}


def font(size, bold=False):
    for p in ('/usr/share/fonts/truetype/dejavu/DejaVuSans%s.ttf' % ('-Bold' if bold else ''),
              '/usr/share/fonts/dejavu/DejaVuSans%s.ttf' % ('-Bold' if bold else '')):
        if os.path.exists(p):
            return ImageFont.truetype(p, size)
    return ImageFont.load_default()


def main():
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    out = args[0] if args else os.path.join(HERE, '..', 'D_sheet.png')
    tw = 360
    if '--tile' in sys.argv:
        tw = int(sys.argv[sys.argv.index('--tile') + 1])
    th = tw * 16 // 9
    alts = sorted([f[:-4] for f in os.listdir(os.path.join(HERE, 'out')) if f.endswith('alt.jpg')],
                  key=lambda s: int(s.split('B')[1].replace('alt', '')))
    per_row = 6
    gap, lab = 22, 64
    rows = [BEATS[:6], BEATS[6:12]] + ([alts] if alts else [])
    head = 110
    Wd = per_row * tw + (per_row + 1) * gap
    Hd = head + len(rows) * (th + lab + gap) + gap + 40
    sheet = Image.new('RGB', (Wd, Hd), '#17181c')
    d = ImageDraw.Draw(sheet)
    d.text((gap, 26), 'Video 4 ideas, imagination D: "The warmth comes home" (one home, one person)', fill='#efe9df', font=font(34, True))
    d.text((gap, 70), 'value sketches, the one warm accent = the heat and the home; the caption seat a light band; beats in order, then the alternates',
           fill='#b9b3aa', font=font(20))
    y = head
    for r, row in enumerate(rows):
        if r == 2:
            d.text((gap, y - 4), 'ALTERNATES (the beats I am least sure of)', fill='#e9c27a', font=font(22, True))
            y += 30
        for c, fid in enumerate(row):
            x = gap + c * (tw + gap)
            p = os.path.join(HERE, 'out', fid + '.jpg')
            d.text((x, y + 4), fid, fill='#f6c46f' if 'alt' in fid else '#ffffff', font=font(26, True))
            d.text((x, y + 36), TITLES.get(fid, ''), fill='#cfc8bd', font=font(17))
            if os.path.exists(p):
                im = Image.open(p).convert('RGB').resize((tw, th), Image.LANCZOS)
                sheet.paste(im, (x, y + lab))
            else:
                d.rectangle([x, y + lab, x + tw, y + lab + th], outline='#555555')
        y += th + lab + gap
    sheet.save(out, optimize=True)
    print('wrote', os.path.abspath(out), sheet.size)


if __name__ == '__main__':
    main()
