"""The type stills' contact sheet: every still in docs/look/type/stills/ at the guide's glance scale (0.25: 270 x 480),
7 per row, labelled, -> docs/look/type/stills/contact_sheet.jpg.

    python3 scripts/type/contact_sheet.py      # from video/
"""
import glob, os
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
DOC = os.path.join(HERE, '..', '..', 'docs', 'look', 'type', 'stills')
LABELS = {'01': '01 BEFORE (now)', '02': '02 R4 landing word', '03': '03 the hand, 3 ways', '04': '04 R1 everyday',
          '05': '05 R2 hook', '06': '06 R3 big number', '07': '07 R5 quiet stress', '08': '08 R6 lettered phrase',
          '09': '09 R7 word in the world', '10': '10 R9 payoff', '11': '11 R10 cover', '12': '12 R10 caps (posters)',
          '13': '13 seats walking', '14': '14 R4 bloom (mid)', '15': '15 stress options: dusk',
          '16': '16 stress options: night', '17': '17 number options'}


def font(size):
    for p in ('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', '/usr/share/fonts/dejavu/DejaVuSans.ttf'):
        if os.path.exists(p):
            return ImageFont.truetype(p, size)
    return ImageFont.load_default()


def main():
    files = sorted(f for f in glob.glob(os.path.join(DOC, '[0-9][0-9]_*.png')))
    tw, th, lab, gap, cols = 270, 480, 34, 12, 7
    rows = (len(files) + cols - 1) // cols
    W, H = cols * tw + (cols + 1) * gap, rows * (th + lab) + (rows + 1) * gap
    sheet = Image.new('RGB', (W, H), (246, 242, 236))
    d = ImageDraw.Draw(sheet)
    f = font(17)
    for i, p in enumerate(files):
        r, c = divmod(i, cols)
        x, y = gap + c * (tw + gap), gap + r * (th + lab + gap)
        im = Image.open(p).convert('RGB').resize((tw, th), Image.LANCZOS)
        sheet.paste(im, (x, y))
        n = os.path.basename(p)[:2]
        d.text((x + 2, y + th + 7), LABELS.get(n, os.path.basename(p)), fill=(43, 27, 10), font=f)
    out = os.path.join(DOC, 'contact_sheet.jpg')
    sheet.save(out, quality=86)
    print('wrote', os.path.relpath(out), sheet.size)


if __name__ == '__main__':
    main()
