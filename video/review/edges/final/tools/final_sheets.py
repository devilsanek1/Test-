#!/usr/bin/env python3
"""Final edge comparison sheets (review/edges/final/).

  final_sheets.py grid     -> edges_final_sheet.png    rows clean / trim / panel x the three shots, full frames, labelled
  final_sheets.py corners  -> edges_final_corners.png  per shot and variant: top-left, top-right, left edge (mid),
                                                       bottom-left, cropped 300 px from the full-res stills (1:1)
  final_sheets.py labels   -> tools/sbs_labels.png     the label bar for the side-by-side clip
"""
import os
import sys

from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
FINAL = os.path.dirname(HERE)
ST = os.path.join(FINAL, 'stills')
BG = (246, 243, 238)
INK = (43, 27, 10)
MUTED = (110, 96, 82)
ROWS = ['clean', 'trim', 'panel']
SHOTS = [('street', 'KitDemo street, dusk'), ('monument', 'CineDemo monument (crane)'), ('vista', 'CineDemo vista (peak sun)')]
BEZEL = (24, 24, 26)
NOTES = {
    'clean': 'CONTROL. Full-bleed,\nno treatment, one render.\nKeep it for very dark or\nvery fast-cut moments.',
    'trim': 'THE QUIET ONE.\nHand-cut paper slivers:\nleft 28-32 px (drifting out\nto 36-40 once), right 22-26,\ntop 12-16. Bottom open:\nthe ground runs off in\ncolour. One sharp scissor\nsnip top-right, one ruled\nink corner top-left. The\nscene\'s own lines cross\nthe slivers and run off.',
    'panel': 'THE SKETCH RUNS OUT.\nReference 1\'s panel:\nleft 36-42 px, right 18-22,\ntop 14-18. The left cut\nsnips out to the frame\nedge near the bottom.\nLine art continues into\nthe white and STOPS there\n(6-20 px short of the edge\non some stretches). Ruled\nink at both top corners.',
}
CROPS = [('top-left', (0, 0, 300, 300)), ('top-right', (780, 0, 1080, 300)), ('left edge, y 640-940', (0, 640, 300, 940)), ('bottom-left', (0, 1460, 300, 1760))]


def font(size, bold=False):
    f = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf' if bold else '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
    return ImageFont.truetype(f, size) if os.path.exists(f) else ImageFont.load_default()


def grid():
    w, h = 432, 768
    lab, head, gap = 280, 64, 30
    W = lab + len(SHOTS) * (w + gap) + gap
    H = head + len(ROWS) * (h + gap) + gap + 40
    S = Image.new('RGB', (W, H), BG)
    d = ImageDraw.Draw(S)
    for j, (_, name) in enumerate(SHOTS):
        d.text((lab + gap + j * (w + gap), 24), name, fill=INK, font=font(22, True))
    for i, r in enumerate(ROWS):
        y = head + gap + i * (h + gap)
        d.text((18, y + 6), r, fill=INK, font=font(34, True))
        yy = y + 60
        for ln in NOTES[r].split('\n'):
            d.text((18, yy), ln, fill=MUTED, font=font(17))
            yy += 25
        for j, (s, _) in enumerate(SHOTS):
            im = Image.open(os.path.join(ST, f'{r}_{s}.png')).convert('RGB').resize((w, h), Image.LANCZOS)
            x = lab + gap + j * (w + gap)
            d.rounded_rectangle((x - 9, y - 9, x + w + 9, y + h + 9), radius=14, fill=BEZEL)
            S.paste(im, (x, y))
    d.text((18, H - 34), 'Full frames, 1080x1920 shown at 0.4 on a dark phone bezel (the paper edge reads against it, as on a phone). Captions render above the treatment. Seed "film", amount 1.', fill=MUTED, font=font(17))
    out = os.path.join(FINAL, 'edges_final_sheet.png')
    S.save(out)
    print(out, S.size)


def corners():
    c, gap, lab, head = 300, 16, 150, 70
    W = lab + len(CROPS) * (c + gap) + gap
    rows = [(s, sn, r) for s, sn in SHOTS for r in ROWS]
    H = head + len(rows) * (c + gap) + len(SHOTS) * 34 + gap
    S = Image.new('RGB', (W, H), BG)
    d = ImageDraw.Draw(S)
    for k, (name, _) in enumerate(CROPS):
        d.text((lab + gap + k * (c + gap), 26), name, fill=INK, font=font(20, True))
    y = head
    for si, (s, sn) in enumerate(SHOTS):
        d.text((16, y + 4), sn, fill=MUTED, font=font(18, True))
        y += 34
        for r in ROWS:
            im = Image.open(os.path.join(ST, f'{r}_{s}.png')).convert('RGB')
            d.text((16, y + 8), r, fill=INK, font=font(26, True))
            for k, (_, box) in enumerate(CROPS):
                x = lab + gap + k * (c + gap)
                d.rectangle((x - 4, y - 4, x + c + 4, y + c + 4), fill=BEZEL)
                S.paste(im.crop(box), (x, y))
            y += c + gap
    out = os.path.join(FINAL, 'edges_final_corners.png')
    S.save(out)
    print(out, S.size)


def labels():
    w, h = 540, 56
    S = Image.new('RGB', (3 * w, h), BG)
    d = ImageDraw.Draw(S)
    for i, (r, sub) in enumerate([('clean', 'control'), ('trim', 'the quiet one'), ('panel', 'the sketch runs out')]):
        d.text((i * w + 20, 12), r, fill=INK, font=font(28, True))
        d.text((i * w + 20 + d.textlength(r, font=font(28, True)) + 14, 19), sub, fill=MUTED, font=font(20))
    out = os.path.join(HERE, 'sbs_labels.png')
    S.save(out)
    print(out, S.size)


if __name__ == '__main__':
    {'grid': grid, 'corners': corners, 'labels': labels}[sys.argv[1]]()
