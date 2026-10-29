"""Studio logo, round 4: from scratch, premium (owner, 2026-10-29: "Nope from scratch I don't like none of them",
"More premium"). Emblems in the city posters' language: light at dusk, depth, a hidden detail; no text.

    cd video/brand/logo && python3 make_logos_r4.py
    -> svg/r4/*.svg and ../../deliverables/brand/logo_options_v4.png
"""
import os
import subprocess
import tempfile

import marks_r4 as R
from logo_lib import svg_doc
from make_logos import COVERS, VIDEO

HERE = os.path.dirname(os.path.abspath(__file__))
SVG_DIR = os.path.join(HERE, 'svg', 'r4')
OUT_PNG = os.path.join(VIDEO, 'deliverables', 'brand', 'logo_options_v4.png')
CREAM, PLUM = '#F7EDE3', '#2E2138'

DIRS = [
    dict(key='1_elephant_and_sun', title='The Elephant and the Sun',
         line='A calm elephant walking into a low sun: memory, patience, and the light coming up on a story. Today’s '
              'Pip-and-sun avatar, grown up; the sun only rims its back.',
         art=R.elephant_sun, mono=R.elephant_sun_mono),
    dict(key='2_window', title='The Window',
         line='One lit window at dusk: a small window onto a big story, our films’ cozy light. Look twice: a little '
              'elephant stands on the inner sill.',
         art=R.window_emblem, mono=R.window_mono),
    dict(key='3_seal', title='The Seal',
         line='A terracotta wax seal with the elephant pressed in it: made by hand, checked, signed. The promise that we '
              'did the reading for you.',
         art=R.seal, mono=R.seal_mono),
]


def doc(body):
    return svg_doc(1000, 1000, body)


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


def sized(svg, px, round_=True):
    s = svg.replace('width="1000" height="1000"', f'width="{px}" height="{px}"', 1)
    st = 'border-radius:50%;' if round_ else ''
    return f'<div style="{st}overflow:hidden;width:{px}px;height:{px}px;flex:none">{s}</div>'


def phone(d):
    av = sized(doc(d['art']()), 86)
    grid = ''.join(f'<div class="cell"><img src="file://{c}"/></div>' for c in COVERS)
    return f'''<div class="phone"><div class="sb"><b>9:41</b><span>●●● ▮</span></div>
<div class="top"><b>what.the.fuss.is.about</b><span>☰</span></div>
<div class="prow">{av}<div class="stat"><b>3</b><span>posts</span></div><div class="stat"><b>–</b><span>followers</span></div>
<div class="stat"><b>–</b><span>following</span></div></div>
<div class="bio"><b>What’s All the Fuss About?</b><br><span class="cat">Education</span><br>You’ve heard about it. Now actually understand it.</div>
<div class="btns"><div>Follow</div><div>Message</div></div><div class="grid">{grid}</div></div>'''


def band(i, d):
    art = doc(d['art']())
    mono_l = doc(d['mono'](PLUM))
    mono_d = doc(d['mono'](CREAM))
    return f'''<section class="band">
  <div class="hero">{sized(art, 620)}</div>
  <div class="mid">
    <div class="num">0{i + 1}</div><h2>{d['title']}</h2><p>{d['line']}</p>
    <div class="row">
      <div class="app light">{sized(art, 110)}{sized(art, 40)}<span>110 · 40 px</span></div>
      <div class="app dark">{sized(art, 110)}{sized(art, 40)}<span>110 · 40 px</span></div>
    </div>
    <div class="row">
      <div class="mono" style="background:{CREAM}">{sized(mono_l, 150, False)}<span>one colour</span></div>
      <div class="mono" style="background:{PLUM}">{sized(mono_d, 150, False)}<span style="color:#cbbfc6">reversed</span></div>
    </div>
  </div>
  <div class="right">{phone(d)}</div>
</section>'''


CSS = '''
body{margin:0;background:#17111F;color:#F7EDE3;font-family:Inter,system-ui,sans-serif;width:1800px}
header{padding:70px 80px 30px}
.kick{font-size:15px;letter-spacing:.32em;text-transform:uppercase;color:#C9A98F}
h1{font-size:46px;font-weight:600;margin:10px 0 10px;letter-spacing:-.01em}
header p{font-size:20px;color:#BDB0B8;margin:0;max-width:1400px;line-height:1.45}
header q{color:#F7EDE3}
.band{display:flex;gap:56px;padding:46px 80px;border-top:1px solid #2C2236;align-items:center}
.hero{flex:none;filter:drop-shadow(0 24px 50px rgba(0,0,0,.45))}
.mid{width:520px;flex:none}
.num{font-size:15px;letter-spacing:.3em;color:#C9A98F}
h2{font-size:40px;font-weight:600;margin:8px 0 10px;letter-spacing:-.01em}
.mid p{font-size:18px;line-height:1.5;color:#CFC3CA;margin:0 0 24px}
.row{display:flex;gap:16px;margin-top:16px}
.app{width:252px;height:170px;border-radius:18px;display:flex;align-items:center;justify-content:center;gap:20px;position:relative}
.app.light{background:#fff}.app.dark{background:#000;box-shadow:inset 0 0 0 1px #2C2236}
.app span,.mono span{position:absolute;left:14px;bottom:9px;font-size:12px;color:#8E8290}
.mono{width:252px;height:190px;border-radius:18px;display:flex;align-items:center;justify-content:center;position:relative}
.mono span{color:#7d6f78}
.right{flex:none}
.phone{width:360px;background:#fff;border-radius:44px;padding:14px 0 0;box-shadow:0 0 0 9px #2b2230,0 24px 60px rgba(0,0,0,.5);
  overflow:hidden;font-size:13px;color:#111}
.sb{display:flex;justify-content:space-between;padding:4px 28px 8px;font-size:14px}
.top{display:flex;justify-content:space-between;padding:6px 16px 10px;font-size:18px}
.prow{display:flex;align-items:center;padding:4px 16px 10px}.prow>div:first-child{margin-right:22px}
.stat{flex:1;display:flex;flex-direction:column;align-items:center;font-size:12px}.stat b{font-size:16px}
.bio{padding:0 16px 10px;line-height:1.35}.cat{color:#737373}
.btns{display:flex;gap:8px;padding:2px 16px 12px}.btns div{flex:1;background:#efefef;border-radius:8px;text-align:center;padding:7px 0;font-weight:600}
.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:2px}.cell{aspect-ratio:3/4;overflow:hidden}
.cell img{width:100%;height:100%;object-fit:cover;object-position:50% 30%}
footer{padding:30px 80px 60px;border-top:1px solid #2C2236;font-size:15px;color:#8E8290;line-height:1.5}
'''


def build_sheet():
    html = f'''<!doctype html><html><head><meta charset="utf-8"><style>{CSS}</style></head><body>
<header><div class="kick">What’s All the Fuss About? · studio logo · round 4</div>
<h1>From scratch, premium</h1>
<p>Your note: <q>Nope from scratch I don’t like none of them. More premium</q>. The flat icons read as stock. These are
emblems in the language of the city posters you love: light at dusk, depth, and one detail you find on a second look.</p></header>
{''.join(band(i, d) for i, d in enumerate(DIRS))}
<footer>Drawn in code from curves and gradients; no text, nothing traced, no image generation. Sources: video/brand/logo/
(make_logos_r4.py, marks_r4.py, svg/r4/). Notes: video/docs/brand/LOGO.md.</footer></body></html>'''
    tmp = tempfile.mkdtemp(prefix='logo_sheet_r4_')
    hp = os.path.join(tmp, 'sheet.html')
    with open(hp, 'w') as f:
        f.write(html)
    subprocess.run(['node', os.path.join(HERE, 'render.cjs'), hp, OUT_PNG, '1800', '1'], check=True)
    return hp


if __name__ == '__main__':
    files = write_svgs()
    hp = build_sheet()
    print(f'{len(files)} svgs -> {SVG_DIR}\nsheet -> {OUT_PNG}')
