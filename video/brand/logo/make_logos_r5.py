"""Studio logo, round 5: the city view, made ours (owner, 2026-10-29: "I like the city view but it's too generic
like why is it relevant to us"). Stills only (owner: "No video yet"); no text.

    cd video/brand/logo && python3 make_logos_r5.py
    -> svg/r5/*.svg and ../../deliverables/brand/logo_options_v5.png
"""
import os
import subprocess
import tempfile

import marks_r5 as R
from make_logos import COVERS, VIDEO
from make_logos_r4 import CSS, PLUM, CREAM, doc, sized, phone

HERE = os.path.dirname(os.path.abspath(__file__))
SVG_DIR = os.path.join(HERE, 'svg', 'r5')
OUT_PNG = os.path.join(VIDEO, 'deliverables', 'brand', 'logo_options_v5.png')

DIRS = [
    dict(key='1_talk_of_the_town', title='Talk of the Town',
         line='The city at dusk, seen inside a speech bubble: the story everyone’s talking about, opened up as a '
              'place you can walk into. Our films’ world, framed by the talk.',
         art=R.talk_of_the_town, mono=R.talk_of_the_town_mono),
    dict(key='2_the_city_is_talking', title='The City Is Talking',
         line='Speech bubbles rise from the rooftops like lanterns, and one glows brighter than the rest: the whole '
              'city is talking about it, and one voice makes it clear.',
         art=R.city_is_talking, mono=R.city_is_talking_mono),
    dict(key='3_the_question_lamp', title='The Question Lamp',
         line='On a street corner, a lantern’s iron bracket bends into a question mark, and the lit lantern is its '
              'dot: the question everyone’s asking, with the light right there. Pip stands on the quay, looking up.',
         art=R.question_lamp, mono=R.question_lamp_mono),
]


def write_svgs():
    os.makedirs(SVG_DIR, exist_ok=True)
    files = {}
    for d in DIRS:
        files[f'{d["key"]}.svg'] = doc(d['art']())
        files[f'{d["key"]}_one_colour.svg'] = doc(d['mono'](PLUM))
    for n, s in files.items():
        with open(os.path.join(SVG_DIR, n), 'w') as f:
            f.write(s)
    return files


def band(i, d):
    art = doc(d['art']())
    mono_l = doc(d['mono'](PLUM))
    mono_d = doc(d['mono'](CREAM))
    cover = (f'<div class="mono" style="overflow:hidden"><img src="file://{COVERS[1]}" style="position:absolute;inset:0;'
             f'width:100%;height:100%;object-fit:cover;object-position:50% 46%"/><div style="position:absolute;right:12px;top:12px">'
             f'{sized(art, 50)}</div><span style="color:#fff;text-shadow:0 1px 3px rgba(0,0,0,.6)">cover corner</span></div>')
    return f'''<section class="band">
  <div class="hero">{sized(art, 620)}</div>
  <div class="mid">
    <div class="num">0{i + 1}</div><h2>{d['title']}</h2><p>{d['line']}</p>
    <div class="row">
      <div class="app light">{sized(art, 110)}{sized(art, 40)}<span>110 · 40 px</span></div>
      <div class="app dark">{sized(art, 110)}{sized(art, 40)}<span>110 · 40 px</span></div>
    </div>
    <div class="row">
      <div class="mono" style="background:{CREAM};width:160px">{sized(mono_l, 120, False)}<span>one colour</span></div>
      <div class="mono" style="background:{PLUM};width:160px">{sized(mono_d, 120, False)}<span style="color:#cbbfc6">reversed</span></div>
      <div style="width:168px;flex:none">{cover.replace('class="mono"', 'class="mono" ', 1).replace('style="overflow:hidden"', 'style="overflow:hidden;width:168px"')}</div>
    </div>
  </div>
  <div class="right">{phone(d)}</div>
</section>'''


def build_sheet():
    html = f'''<!doctype html><html><head><meta charset="utf-8"><style>{CSS}</style></head><body>
<header><div class="kick">What’s All the Fuss About? · studio logo · round 5</div>
<h1>The city view, made ours</h1>
<p>Your note: <q>I like the city view but it’s too generic like why is it relevant to us</q>. So one dusk city in the
posters’ language (far skyline, lit windows, the sun on the river, Pip hidden on the quay), and three ways it says
what we do: the talk, the fuss, the question.</p></header>
{''.join(band(i, d) for i, d in enumerate(DIRS))}
<footer>Stills only (your note to the orchestrator: “No video yet”). Drawn in code from shapes and gradients; no
text, nothing traced, no image generation. Sources: video/brand/logo/ (make_logos_r5.py, marks_r5.py, svg/r5/). Notes:
video/docs/brand/LOGO.md.</footer></body></html>'''
    tmp = tempfile.mkdtemp(prefix='logo_sheet_r5_')
    hp = os.path.join(tmp, 'sheet.html')
    with open(hp, 'w') as f:
        f.write(html)
    subprocess.run(['node', os.path.join(HERE, 'render.cjs'), hp, OUT_PNG, '1800', '1'], check=True)
    return hp


if __name__ == '__main__':
    files = write_svgs()
    hp = build_sheet()
    print(f'{len(files)} svgs -> {SVG_DIR}\nsheet -> {OUT_PNG}')
