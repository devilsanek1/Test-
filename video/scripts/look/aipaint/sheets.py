#!/usr/bin/env python3
"""The AI-paint test's sheets (docs/studies/2026-10-28_city_posters/ai_paint/): small labelled jpgs, no new data.
    python3 scripts/look/aipaint/sheets.py trials  out/aipaint                # trial_sky_s*.jpg + trials_sky.jpg
    python3 scripts/look/aipaint/sheets.py compare <v2flat.png>               # compare.jpg (v2 flat, v4, AI, refs)
    python3 scripts/look/aipaint/sheets.py strip   <f0.png> <f1.png> <f2.png> <f3.png>   # reveal_strip.jpg
"""
import glob, json, os, sys
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
OUT = os.path.join(ROOT, 'docs/studies/2026-10-28_city_posters/ai_paint')
PAPER = (245, 240, 234)
INK = (40, 34, 30)
FONT = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'


def font(px):
    try:
        return ImageFont.truetype(FONT, px)
    except OSError:
        return ImageFont.load_default()


def fit_w(im, w):
    return im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)


def fit_h(im, h):
    return im.resize((round(im.width * h / im.height), h), Image.LANCZOS)


def sheet(panels, labels, gap=16, top=42, size=19):
    """Panels side by side, each with a label above (panels are already sized)."""
    H = max(p.height for p in panels) + top + gap
    W = sum(p.width for p in panels) + gap * (len(panels) + 1)
    s = Image.new('RGB', (W, H), PAPER)
    d = ImageDraw.Draw(s)
    x = gap
    for p, lab in zip(panels, labels):
        d.text((x + 2, 12), lab, fill=INK, font=font(size))
        s.paste(p, (x, top))
        x += p.width + gap
    return s


def trials(d):
    init = Image.open(os.path.join(ROOT, 'out/aipaint/init/sky_init.png')).convert('RGB')
    rows = round(1100 * 1344 / 1890)   # the sky's rows in the plate (frame y 0..1100)
    panels, labels = [fit_w(init.crop((0, 0, 768, rows)), 384)], ['our design (init)']
    runs = [f for f in glob.glob(os.path.join(d, 'sky*', 'sky_s[0-9].[0-9][0-9]_seed*.png')) if 'preview' not in f]
    runs.sort(key=lambda f: ('_cn' in f, f.split('_s')[1]))
    for f in runs:
        m = json.load(open(f[:-4] + '.json'))
        im = fit_w(Image.open(f).convert('RGB').crop((0, 0, 768, rows)), 384)
        cn = f" + canny {m['controlnet_conditioning_scale']}" if m.get('controlnet') else ''
        lab = f"strength {m['strength']:.2f}{cn}  seed {m['seed']}"
        sub = f"{m['steps_run']} steps, {m['minutes_total']:.1f} min" + ('' if 'nosun' in m['init'] else ', trial init')
        one = sheet([im], [lab])
        one2 = Image.new('RGB', (one.width, one.height + 26), PAPER)
        one2.paste(one, (0, 0))
        ImageDraw.Draw(one2).text((18, one.height - 6), sub, fill=INK, font=font(16))
        name = os.path.basename(f)[:-4]
        one2.save(os.path.join(OUT, f'trial_{name}.jpg'), quality=86)
        panels.append(im)
        labels.append(f"{m['strength']:.2f}{' + canny' if cn else ''} ({m['minutes_total']:.1f} min)")
    sheet(panels, labels).save(os.path.join(OUT, 'trials_sky.jpg'), quality=86)
    print('trials ->', OUT)


def compare(v2flat):
    pt = os.path.join(ROOT, 'docs/studies/2026-10-28_city_posters/paint_test')
    refs = os.path.join(ROOT, 'docs/look/refs_human_scale')
    stills = [(v2flat, '1. v2 S1 (flat, as shipped)'), (os.path.join(pt, 'paint_still_v4.png'), '2. our painter: paint_still_v4'),
              (os.path.join(OUT, 'ai_still_v1.png'), '3. AI (SDXL 0.70, local): ai_still_v1')]
    W = 380
    panels = [fit_w(Image.open(p).convert('RGB'), W) for p, _ in stills]
    H = panels[0].height
    i3 = Image.open(os.path.join(refs, '03_beach_dusk.jpg')).convert('RGB')
    i2 = Image.open(os.path.join(refs, '02_bus_stop_night.jpg')).convert('RGB')
    rw = int((H - 40) / (i3.height / i3.width + i2.height / i2.width))   # the refs' column: both fit the stills' height
    r3, r2 = fit_w(i3, rw), fit_w(i2, rw)
    col = Image.new('RGB', (rw, H), PAPER)
    d = ImageDraw.Draw(col)
    col.paste(r3, (0, 0))
    d.text((2, r3.height + 8), '5. ref 02_bus_stop_night', fill=INK, font=font(19))
    col.paste(r2, (0, r3.height + 40))
    s = sheet(panels + [col], [l for _, l in stills] + ['4. ref 03_beach_dusk'])
    s.save(os.path.join(OUT, 'compare.jpg'), quality=88)
    print('compare ->', os.path.join(OUT, 'compare.jpg'), s.size)


def strip(frames):
    labels = ['1. our flat design', '2. painting on: 1/3', '3. painting on: 2/3', '4. painted (done)']
    panels = [fit_w(Image.open(f).convert('RGB'), 400) for f in frames]
    s = sheet(panels, labels)
    s2 = Image.new('RGB', (s.width, s.height + 34), PAPER)
    s2.paste(s, (0, 0))
    ImageDraw.Draw(s2).text((18, s.height - 4), 'Stills only (no video yet). The same scene at 1.0 s; only the paint-on changes: '
                            'brush strokes in painting order, the sky washes, then the far haze, then the tree.',
                            fill=INK, font=font(16))
    s2.save(os.path.join(OUT, 'reveal_strip.jpg'), quality=88)
    print('strip ->', os.path.join(OUT, 'reveal_strip.jpg'), s2.size)


if __name__ == '__main__':
    cmd = sys.argv[1]
    if cmd == 'trials':
        trials(sys.argv[2])
    elif cmd == 'compare':
        compare(sys.argv[2])
    elif cmd == 'strip':
        strip(sys.argv[2:6])
