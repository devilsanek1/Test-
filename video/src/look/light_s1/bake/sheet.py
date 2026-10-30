#!/usr/bin/env python3
"""sheet.py: docs/look/organic/light_proof.png (light_proof.md): the three stills (v6; v6 + proper light; + the paper
grain and the one colour key) at FULL SIZE, then at phone width (400 px) beside the owner's two painting-style models
(refs_human_scale/03_beach_dusk.jpg, 02_bus_stop_night.jpg, 400 px wide). The references are shown, never used. From
video/:
    python3 -B src/look/light_s1/bake/sheet.py <stills_dir> <measure.json> docs/look/organic/light_proof.png"""
import json
import os
import sys

from PIL import Image, ImageDraw, ImageFont

VIDEO = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '../../../..'))
REFS = os.path.join(VIDEO, 'docs/look/refs_human_scale')
FONT = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
FONT_B = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
BG = (244, 241, 236)
INK = (40, 34, 44)
GREY = (110, 104, 114)


def font(px, bold=False):
    try:
        return ImageFont.truetype(FONT_B if bold else FONT, px)
    except OSError:
        return ImageFont.load_default()


def main():
    S, M, out = sys.argv[1], sys.argv[2], sys.argv[3]
    meas = json.load(open(M))
    stills = [Image.open(os.path.join(S, f'{n}.png')).convert('RGB') for n in ('s1_v6', 's2_light', 's3_full')]
    big_labels = ['1. v6 as sent (paint_still_v6)',
                  '2. + PROPER LIGHT: the low October sun the key, the lit doorway the story light',
                  '3. + ONE PAPER GRAIN and ONE COLOUR KEY (a dusk family; the doorway’s gold the hot accent)']
    small_labels = ['1. v6', '2. + light', '3. + grain + key']
    m = 28
    gap = 28
    Wb, Hb = 1080, 1920
    ws, hs = 400, 711
    width = 3 * Wb + 2 * gap + 2 * m
    title_h, lab_h, sec_h, num_h = 74, 52, 70, 92
    height = m + title_h + lab_h + Hb + sec_h + lab_h + hs + num_h + m
    sheet = Image.new('RGB', (width, height), BG)
    d = ImageDraw.Draw(sheet)
    d.text((m, m), 'Light and texture proof: scene 1 ("She quit Google.") at 1.0 s, rendered by the engine (src/look/light_s1)', font=font(40, True), fill=INK)
    y = m + title_h
    for i, im in enumerate(stills):
        x = m + i * (Wb + gap)
        d.text((x, y + 6), big_labels[i], font=font(27, True), fill=INK)
        sheet.paste(im, (x, y + lab_h))
    y += lab_h + Hb + 18
    d.text((m, y + 8), 'At phone width (400 px), beside the owner’s two painting-style models (400 px wide)', font=font(34, True), fill=INK)
    y += sec_h
    for i, im in enumerate(stills):
        x = m + i * (ws + gap)
        d.text((x, y + 8), small_labels[i], font=font(26, True), fill=INK)
        sheet.paste(im.resize((ws, hs), Image.LANCZOS), (x, y + lab_h))
        look = ('v6', 'light', 'full')[i]
        q = meas['looks'][look]
        r = meas['regions'][look]
        lines = [f"darks (L* < 40) {q['darks_L40_pct']:.0f} %  ·  median L* {q['L_median']:.0f}",
                 f"facade {r['facade (wall)']:.0f}  ·  lobby {r['lobby']:.0f}  ·  bank {r['our bank']:.0f}  (L*)",
                 f"off-family colour {q['offfamily_colour_pct_below_band']:.0f} % below the band"]
        for j, t in enumerate(lines):
            d.text((x, y + lab_h + hs + 10 + j * 26), t, font=font(19), fill=GREY)
    xr = m + 3 * (ws + gap)
    r03 = Image.open(os.path.join(REFS, '03_beach_dusk.jpg')).convert('RGB')
    r02 = Image.open(os.path.join(REFS, '02_bus_stop_night.jpg')).convert('RGB')
    a = r03.resize((ws, round(r03.height * ws / r03.width)), Image.LANCZOS)
    b = r02.resize((ws, round(r02.height * ws / r02.width)), Image.LANCZOS)
    d.text((xr, y + 8), 'ref 03 (top), ref 02 (below)', font=font(26, True), fill=INK)
    sheet.paste(a, (xr, y + lab_h))
    sheet.paste(b, (xr, y + lab_h + a.height + 14))
    yt = y + lab_h + a.height + 14 + b.height + 16
    for j, t in enumerate(['refs_human_scale/03_beach_dusk.jpg,', '02_bus_stop_night.jpg: shown, never used', '(the owner’s phone screenshots)']):
        d.text((xr, yt + j * 26), t, font=font(19), fill=GREY)
    # a note on what is where, right of the refs
    xn = xr + ws + gap + 10
    notes = ['How each still is made (light_proof.md):',
             '• all three are the engine’s own renders',
             '• 2: per-plane baked light maps riding each plane’s',
             '   float + live light on her and Pip',
             '• 3: the same maps also carry the colour key and',
             '   the paper grain; the movers carry the grain live',
             '• the caption band: no light, the grain at 30 %']
    for j, t in enumerate(notes):
        d.text((xn, y + lab_h + j * 30), t, font=font(21, j == 0), fill=INK if j == 0 else GREY)
    os.makedirs(os.path.dirname(out) or '.', exist_ok=True)
    sheet.save(out, optimize=True)
    print(out, sheet.size, os.path.getsize(out))


if __name__ == '__main__':
    main()
