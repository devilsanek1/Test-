#!/usr/bin/env python3
"""sheet_v7.py: compare_v7a.jpg (NOTES.md "v7a"; with --v7: compare_v7.jpg, NOTES.md "v7", v6 | v7a | v7): still v6 and still v7a at FULL SIZE, then both at phone width (400 px)
beside the owner's two painting-style models (refs_human_scale/03_beach_dusk.jpg, 02_bus_stop_night.jpg, 400 px wide),
labelled, with the checks' numbers. The references are shown, never used. From video/:
    python3 -B src/look/v7_s1/bake/sheet_v7.py <scratch dir>   (reads stills/ and check.json; writes the sheet and the
    deliverables: paint_test/compare_v7a.jpg, paint_still_v7a.png, deliverables/tests/painted_scene1_still_v7a.png, and
    the step checkpoints v7a_step1.png, v7a_step2.png)"""
import json
import os
import shutil
import sys

from PIL import Image, ImageDraw, ImageFont

VIDEO = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '../../../..'))
REFS = os.path.join(VIDEO, 'docs/look/refs_human_scale')
OUT = os.path.join(VIDEO, 'docs/studies/2026-10-28_city_posters/paint_test')
DELIV = os.path.join(VIDEO, 'deliverables/tests')
FONT = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
FONT_B = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
BG = (244, 241, 236)
INK = (40, 34, 44)
GREY = (104, 98, 108)


def font(px, bold=False):
    try:
        return ImageFont.truetype(FONT_B if bold else FONT, px)
    except OSError:
        return ImageFont.load_default()


def lines_for(q):
    c = q['composition']
    calls = {r['check']: r['value'] for r in c['rows']}
    v = next((val for k, val in calls.items() if 'calls' in k and 'value' in k), '').replace(' calls, ', ' (').replace(' rivals', ')')
    col = next((val for k, val in calls.items() if 'calls' in k and 'colour' in k), '').replace(' calls, ', ' (').replace(' rivals', ')')
    e = q['edges_with_captions']
    return [
        f"under L* 40: {q['darks_L40_pct']:.0f} %  ·  median L* {q['L_median']:.0f}",
        f"facade {q['facade_L']:.0f} · door {q['lobby_p95_L']:.0f} · quay {q['quay_L']:.0f} · water {q['water_L']:.0f}",
        f"off-family {q['offfamily_below_band_pct']:.1f} %  ·  hot light at the door {q['hottest1pct_at_door_pct']:.0f} %",
        f"calls: value {v} · colour {col}",
        f"composition: {c['warns']} WARNs of 10",
        f"razor {e['crisp']:.0f} % · straight {e['straight']:.0f} % · flat {e['flat31']:.0f} %",
    ]


def main():
    scr = sys.argv[1]
    S = os.path.join(scr, 'stills')
    chk = json.load(open(os.path.join(scr, 'check.json')))
    v6 = Image.open(os.path.join(S, 'v6.png')).convert('RGB')
    v7 = Image.open(os.path.join(S, 'v7a.png')).convert('RGB')
    m, gap = 28, 28
    Wb, Hb = 1080, 1920
    ws, hs = 400, 711
    width = 2 * Wb + gap + 2 * m
    title_h, big_h, sec_h, lab_h, num_h = 92, 84, 70, 52, 160
    height = m + title_h + big_h + Hb + sec_h + lab_h + hs + num_h + m
    sheet = Image.new('RGB', (width, height), BG)
    d = ImageDraw.Draw(sheet)
    d.text((m, m), 'Painter v7a, scene 1 ("She quit Google.") at 1.0 s: steps 4, 1, 2 (the cut, the key, the story light)', font=font(36, True), fill=INK)
    d.text((m, m + 46), "T3, the references' low key; v2's frontal view; rendered by the engine (src/look/v7_s1)", font=font(24), fill=GREY)
    y = m + title_h
    for i, (im, a, b) in enumerate(((v6, 'v6 (as the owner saw it, 2026-10-30)', 'the busy frame, high-key, no story light'),
                                    (v7, 'v7a', 'the props cut, one colour key, the lit door the one place to look'))):
        x = m + i * (Wb + gap)
        d.text((x, y + 2), a, font=font(30, True), fill=INK)
        d.text((x, y + 42), b, font=font(23), fill=GREY)
        sheet.paste(im, (x, y + big_h))
    y += big_h + Hb + 18
    d.text((m, y + 8), "At phone width (400 px), beside the owner's two painting-style models (400 px wide)", font=font(32, True), fill=INK)
    y += sec_h
    for i, (im, name) in enumerate(((v6, 'v6'), (v7, 'v7a'))):
        x = m + i * (ws + gap)
        d.text((x, y + 8), name, font=font(26, True), fill=INK)
        sheet.paste(im.resize((ws, hs), Image.LANCZOS), (x, y + lab_h))
        q = chk['stills'][name]
        for j, t in enumerate(lines_for(q)):
            d.text((x, y + lab_h + hs + 10 + j * 23), t, font=font(15), fill=GREY)
    xr = m + 2 * (ws + gap)
    r03 = Image.open(os.path.join(REFS, '03_beach_dusk.jpg')).convert('RGB')
    r02 = Image.open(os.path.join(REFS, '02_bus_stop_night.jpg')).convert('RGB')
    a = r03.resize((ws, round(r03.height * ws / r03.width)), Image.LANCZOS)
    b = r02.resize((ws, round(r02.height * ws / r02.width)), Image.LANCZOS)
    d.text((xr, y + 8), 'ref 03 (top), ref 02 (below)', font=font(26, True), fill=INK)
    sheet.paste(a, (xr, y + lab_h))
    sheet.paste(b, (xr, y + lab_h + a.height + 14))
    yt = y + lab_h + a.height + 14 + b.height + 14
    for j, t in enumerate(['refs_human_scale/03_beach_dusk.jpg and', '02_bus_stop_night.jpg: shown, never used']):
        d.text((xr, yt + j * 24), t, font=font(17), fill=GREY)
    xn = xr + ws + gap
    notes = ['What v7a is (NOTES.md "v7a"):',
             '• step 4: the near props cut but one table and',
             '   one chair; one boat; Pip on its roof',
             '• step 1: ONE colour key at the source: the',
             '   world through one colour map, T3\'s sky and',
             '   dark cloud from the painter, the lobby the',
             '   one hot accent',
             '• step 2: the story light: the backlit facade',
             '   and our quay in deep shade masses with',
             '   named casters, baked per plane, her and',
             '   Pip lit live',
             '• next (step 3): organic shapes and brushwork']
    for j, t in enumerate(notes):
        d.text((xn, y + lab_h + j * 28), t, font=font(19, j == 0), fill=INK if j == 0 else GREY)
    os.makedirs(OUT, exist_ok=True)
    out = os.path.join(OUT, 'compare_v7a.jpg')
    sheet.save(out, quality=88, optimize=True)
    # the deliverables and the checkpoints
    shutil.copyfile(os.path.join(S, 'v7a.png'), os.path.join(OUT, 'paint_still_v7a.png'))
    os.makedirs(DELIV, exist_ok=True)
    shutil.copyfile(os.path.join(S, 'v7a.png'), os.path.join(DELIV, 'painted_scene1_still_v7a.png'))
    shutil.copyfile(os.path.join(S, 'key.png'), os.path.join(OUT, 'v7a_step1.png'))
    shutil.copyfile(os.path.join(S, 'v7a.png'), os.path.join(OUT, 'v7a_step2.png'))
    shutil.copyfile(os.path.join(scr, 'check.json'), os.path.join(OUT, 'v7a_checks.json'))
    print(out, sheet.size, os.path.getsize(out))


def lines_v7(q):
    """The v7 sheet's lines per still: lines_for's, plus the edges without her and the captions and her value."""
    e2 = q['edges_without_her_and_captions']
    out = lines_for(q)
    out.append(f"  (her and captions out: {e2['crisp']:.0f} · {e2['straight']:.0f} · {e2['flat31']:.0f} %)")
    out.append(f"her L* {q['her_L']:.0f}  ·  the band {q['band_L']:.0f} / {q['band_spread_p2_p98']:.2f}  ·  ink {q['ink_contrast_dL']:.0f}")
    return out


def main_v7(scr):
    """compare_v7.jpg (NOTES.md "v7"): v6, v7a and v7 at FULL SIZE, then the three at 400 px beside refs 03 and 02, with
    the checks' numbers (check_v7.json); writes v7_checks.json beside it."""
    S = os.path.join(scr, 'stills')
    chk = json.load(open(os.path.join(scr, 'check_v7.json')))
    ims = [Image.open(os.path.join(S, f'{n}.png')).convert('RGB') for n in ('v6', 'v7a', 'v7')]
    m, gap = 28, 28
    Wb, Hb = 1080, 1920
    ws, hs = 400, 711
    width = 3 * Wb + 2 * gap + 2 * m
    title_h, big_h, sec_h, lab_h, num_h = 96, 84, 70, 52, 230
    height = m + title_h + big_h + Hb + sec_h + lab_h + hs + num_h + m
    sheet = Image.new('RGB', (width, height), BG)
    d = ImageDraw.Draw(sheet)
    d.text((m, m), 'Painter v7, scene 1 ("She quit Google.") at 1.0 s: the second half (steps 3 and 5, her in the people overhaul)', font=font(38, True), fill=INK)
    d.text((m, m + 48), "The painted quay, facade, far city and kept prop through MyPaint; the light solved again against them; the one paper; rendered by the engine (src/look/v7_s1, look 'v7')", font=font(24), fill=GREY)
    y = m + title_h
    heads = (('v6 (as the owner saw it, 2026-10-30)', 'the busy frame, high-key, no story light'),
             ('v7a (the first half)', 'the cut, one colour key, the story light; the quay an empty slab'),
             ('v7', "a painted dusk quay with the door's light coming to us; the facade painted; her redrawn"))
    for i, (im, (a, b)) in enumerate(zip(ims, heads)):
        x = m + i * (Wb + gap)
        d.text((x, y + 2), a, font=font(30, True), fill=INK)
        d.text((x, y + 42), b, font=font(22), fill=GREY)
        sheet.paste(im, (x, y + big_h))
    y += big_h + Hb + 18
    d.text((m, y + 8), "At phone width (400 px), beside the owner's two painting-style models (400 px wide)", font=font(32, True), fill=INK)
    y += sec_h
    for i, (im, name) in enumerate(zip(ims, ('v6', 'v7a', 'v7'))):
        x = m + i * (ws + gap)
        d.text((x, y + 8), name, font=font(26, True), fill=INK)
        sheet.paste(im.resize((ws, hs), Image.LANCZOS), (x, y + lab_h))
        q = chk['stills'][name]
        for j, t in enumerate(lines_v7(q)):
            d.text((x, y + lab_h + hs + 10 + j * 23), t, font=font(15), fill=GREY)
    xr = m + 3 * (ws + gap)
    r03 = Image.open(os.path.join(REFS, '03_beach_dusk.jpg')).convert('RGB')
    r02 = Image.open(os.path.join(REFS, '02_bus_stop_night.jpg')).convert('RGB')
    a = r03.resize((ws, round(r03.height * ws / r03.width)), Image.LANCZOS)
    b = r02.resize((ws, round(r02.height * ws / r02.width)), Image.LANCZOS)
    d.text((xr, y + 8), 'ref 03 (top), ref 02 (below)', font=font(26, True), fill=INK)
    sheet.paste(a, (xr, y + lab_h))
    sheet.paste(b, (xr, y + lab_h + a.height + 14))
    yt = y + lab_h + a.height + 14 + b.height + 14
    for j, t in enumerate(['refs_human_scale/03_beach_dusk.jpg and', '02_bus_stop_night.jpg: shown, never used']):
        d.text((xr, yt + j * 24), t, font=font(17), fill=GREY)
    xn = xr + ws + gap + 10
    notes = ['What v7 adds to v7a (NOTES.md "v7"):',
             '• the QUAY painted (MyPaint): flags as value patches, the',
             '   lips (v7a\'s ruler lines) broken and lost in stretches,',
             '   wet stone and puddles; its light: the sky\'s violet in',
             '   the wet and the DOOR\'S GOLD coming across it to us',
             '• the FACADE painted, v2\'s frontal view kept: every window',
             '   its own state, an autumn creeper over the parapet,',
             '   lost stretches on frames and piers, colour moving',
             '   inside each face; the door, fascia and W crisp holes',
             '• the FAR CITY at its far dose (blur by plane, tops lost',
             '   by the sun, windows tone-on-tone); the table and chair',
             '   painted at the near dose; the kerb mirrored in the canal',
             '• HER: the people overhaul in use (hair v4, open eyes,',
             '   the rebuilt body), 152 px, lit live by the door',
             '• the ONE PAPER in every plane\'s maps, a grain tile on her',
             '   and Pip: invisible at 400 px, a tooth at 1:1',
             '• cost: ~655-680 ms a frame (v7a ~490-600 here)']
    for j, t in enumerate(notes):
        d.text((xn, y + lab_h + j * 27), t, font=font(19, j == 0), fill=INK if j == 0 else GREY)
    os.makedirs(OUT, exist_ok=True)
    out = os.path.join(OUT, 'compare_v7.jpg')
    sheet.save(out, quality=86, optimize=True)
    shutil.copyfile(os.path.join(scr, 'check_v7.json'), os.path.join(OUT, 'v7_checks.json'))
    print(out, sheet.size, os.path.getsize(out))


if __name__ == '__main__':
    if '--v7' in sys.argv:
        main_v7(sys.argv[1])
    else:
        main()
