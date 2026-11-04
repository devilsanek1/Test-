"""The ink-line look test's comparison sheet: docs/look/ink_test/compare.png.
Row 1, phone size (360 px wide): video 1's frame (the "too rough" bar), the control (v7a, no lines), A, B, C.
Row 2, 1:1 crops: video 1's doors and the v7a doorway (her, the lamp, the windows) in each treatment.
Row 3, 1:1 crops: the boat and Pip, and the near table and chair (where the line is heaviest)."""
import glob
import os
import sys

from PIL import Image, ImageDraw, ImageFont

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from ink import OUT, TREATMENTS  # noqa: E402

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
V1 = os.path.join(ROOT, 'docs', 'look', 'ref_v1_governments_frame.png')
CW, GAP, PAD = 360, 14, 18


def font(sz):
    for f in glob.glob('/usr/share/fonts/**/DejaVuSans*.ttf', recursive=True) + glob.glob('/usr/share/fonts/**/*.ttf', recursive=True):
        try:
            return ImageFont.truetype(f, sz)
        except OSError:
            continue
    return ImageFont.load_default()


def main(scr):
    cols = [('video 1 (too rough)', Image.open(V1).convert('RGB')),
            ('control: v7a, no lines', Image.open(os.path.join(OUT, 'control_v7a.png')).convert('RGB'))]
    for T, P in TREATMENTS.items():
        cols.append((P['title'], Image.open(os.path.join(OUT, f'ink_{T}.png')).convert('RGB')))
    crops = [((440, 1180, 800, 1580), (470, 760, 830, 1160)),  # v1's doors / v7a's doorway, her, the lamp
             ((640, 1440, 1000, 1840), (720, 940, 1080, 1180))]  # v1's near plaza / v7a's boat and Pip
    crop2 = (720, 1560, 1080, 1880)  # v7a's near table and chair
    f_t, f_s = font(17), font(15)
    rows_h = [640, 400, 240, 320]
    Wd = PAD * 2 + len(cols) * CW + (len(cols) - 1) * GAP
    Hd = PAD + 34 + sum(rows_h) + 3 * GAP + 30 + PAD
    sheet = Image.new('RGB', (Wd, Hd), (246, 241, 236))
    d = ImageDraw.Draw(sheet)
    for ci, (title, im) in enumerate(cols):
        x = PAD + ci * (CW + GAP)
        y = PAD
        d.text((x, y), title, fill=(52, 34, 44), font=f_t)
        y += 34
        sheet.paste(im.resize((CW, 640), Image.LANCZOS) if im.size != (1080, 1920) else im.resize((CW, 640), Image.BOX), (x, y))
        y += rows_h[0] + GAP
        box = crops[0][0] if ci == 0 else crops[0][1]
        sheet.paste(im.crop(box), (x, y))
        y += rows_h[1] + GAP
        box = crops[1][0] if ci == 0 else crops[1][1]
        c = im.crop(box)
        sheet.paste(c.crop((0, 0, CW, rows_h[2])), (x, y))
        y += rows_h[2] + GAP
        if ci == 0:
            c = im.crop((40, 1560, 400, 1880))
        else:
            c = im.crop(crop2)
        sheet.paste(c, (x, y))
    d.text((PAD, Hd - PAD - 20), 'Row 1: phone size (360 px wide). Rows 2-4: 1:1 crops (the doorway; the boat and Pip; the near table). '
           'Lines: src/look/ink_test (trace.py where, ink.py how). Notes: docs/look/ink_test/NOTES.md', fill=(90, 70, 80), font=f_s)
    sheet.save(os.path.join(OUT, 'compare.png'), optimize=True)
    print('compare.png', sheet.size, file=sys.stderr)


if __name__ == '__main__':
    main(sys.argv[1] if len(sys.argv) > 1 else '/tmp/ink_test')
