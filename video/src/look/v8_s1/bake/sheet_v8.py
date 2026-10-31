#!/usr/bin/env python3
"""sheet_v8.py: compare_v8.jpg (paint_test/NOTES.md "v8"): v7 and v8 side by side at full size, then both at phone width
(390 px, the owner's screen), each under the one line "the feeling it gives" (THE FRAME LOOP: judged by eye first, at
phone width). From video/:
    python3 -B src/look/v8_s1/bake/sheet_v8.py <v8 still> <out.jpg> --v7-line "..." --v8-line "..." """
import argparse
import os

from PIL import Image, ImageDraw, ImageFont

VIDEO = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..', '..'))
V7 = os.path.join(VIDEO, 'docs/studies/2026-10-28_city_posters/paint_test/paint_still_v7.png')


def font(size, bold=False):
    for p in ('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf' if bold else '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
              '/usr/share/fonts/dejavu/DejaVuSans.ttf'):
        if os.path.exists(p):
            return ImageFont.truetype(p, size)
    return ImageFont.load_default()


def wrap(d, text, f, width):
    words, lines, cur = text.split(), [], ''
    for w in words:
        t = (cur + ' ' + w).strip()
        if d.textlength(t, font=f) > width and cur:
            lines.append(cur)
            cur = w
        else:
            cur = t
    if cur:
        lines.append(cur)
    return lines


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('v8')
    ap.add_argument('out')
    ap.add_argument('--v7-line', required=True)
    ap.add_argument('--v8-line', required=True)
    a = ap.parse_args()
    v7 = Image.open(V7).convert('RGB')
    v8 = Image.open(a.v8).convert('RGB')
    W, H = v7.size
    gap, head, cap = 40, 150, 215
    pw = 390
    ph = round(H * pw / W)
    total_h = head + H + cap + 80 + ph + cap + 40
    sheet = Image.new('RGB', (2 * W + 3 * gap, total_h), '#2B2533')
    d = ImageDraw.Draw(sheet)
    ft, fl, fs = font(54, True), font(34), font(30, True)
    d.text((gap, 40), 'Scene 1, "She quit Google.": v7 (left) and v8 (right), feeling first', font=ft, fill='#F3E6D6')
    for i, (im, name, line) in enumerate(((v7, 'v7', a.v7_line), (v8, 'v8', a.v8_line))):
        x = gap + i * (W + gap)
        sheet.paste(im, (x, head))
        y = head + H + 18
        d.text((x, y), f'{name}: the feeling it gives', font=fs, fill='#FFD7A0')
        for k, ln in enumerate(wrap(d, line, fl, W - 10)):
            d.text((x, y + 44 + k * 42), ln, font=fl, fill='#F3E6D6')
    y0 = head + H + cap + 80
    d.text((gap, y0 - 60), 'At phone width (390 px, as the owner sees it)', font=fs, fill='#F3E6D6')
    for i, (im, name, line) in enumerate(((v7, 'v7', a.v7_line), (v8, 'v8', a.v8_line))):
        x = gap + i * (pw + gap)
        sheet.paste(im.resize((pw, ph), Image.LANCZOS), (x, y0))
    tx = gap + 2 * (pw + gap) + 20
    for i, (name, line) in enumerate((('v7', a.v7_line), ('v8', a.v8_line))):
        y = y0 + i * 300
        d.text((tx, y), f'{name}: the feeling it gives', font=fs, fill='#FFD7A0')
        for k, ln in enumerate(wrap(d, line, fl, 2 * W + 3 * gap - tx - gap)):
            d.text((tx, y + 44 + k * 42), ln, font=fl, fill='#F3E6D6')
    sheet.save(a.out, quality=88)
    print(a.out, sheet.size)


if __name__ == '__main__':
    main()
