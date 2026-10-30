"""Studio logo, round 6: modern marks (owner, 2026-10-29: "I said no elephant", "Too many details who would use this
logo", "No from scratch pick up the modern logos and do it again"). Stills only; no text.

    cd video/brand/logo && python3 make_logos_r6.py
    -> svg/r6/*.svg and ../../deliverables/brand/logo_options_v6.png
"""
import os
import subprocess
import tempfile

import marks_r6 as M
from logo_lib import svg_doc
from make_logos import COVERS, VIDEO

HERE = os.path.dirname(os.path.abspath(__file__))
SVG_DIR = os.path.join(HERE, 'svg', 'r6')
OUT_PNG = os.path.join(VIDEO, 'deliverables', 'brand', 'logo_options_v6.png')


def tile(body, bg, scale=0.74):
    return svg_doc(1000, 1000, f'<rect width="1000" height="1000" fill="{bg}"/>'
                   f'<g transform="translate(500 500) scale({scale}) translate(-500 -500)">{body}</g>')


DIRS = [
    dict(key='1_two_voices', title='Two Voices',
         line='Two speech bubbles, two sides of a story; where they overlap, it gets clear. Built like the modern '
              'overlap marks (two shapes, a third colour where they meet).',
         art=lambda: tile(M.two_voices(), M.CREAM), mark=lambda: M.two_voices(),
         mono=lambda c: M.two_voices_mono(c), bg=M.CREAM),
    dict(key='2_the_peel', title='The Peel',
         line='A speech bubble with its corner peeled back: what everyone’s talking about, opened up. Your fold, '
              'now clearly a bubble; one shape and one cut.',
         art=lambda: tile(M.peel2(), M.INK), mark=lambda: M.peel2(), mono=lambda c: M.peel2_mono(c), bg=M.INK),
    dict(key='3_play_the_talk', title='Play the Talk',
         line='A speech bubble with a play button inside: short videos about what everyone’s talking about. Says '
              'what we are in one glance, like the best app icons.',
         art=lambda: tile(M.play2(), M.CORAL), mark=lambda: M.play2(), mono=lambda c: M.play2_mono(c), bg=M.CORAL),
]


def write_svgs():
    os.makedirs(SVG_DIR, exist_ok=True)
    files = {}
    for d in DIRS:
        files[f'{d["key"]}_avatar.svg'] = d['art']()
        files[f'{d["key"]}_mark.svg'] = svg_doc(1000, 1000, d['mark']())
        files[f'{d["key"]}_mark_one_colour.svg'] = svg_doc(1000, 1000, d['mono'](M.INK))
    for n, s in files.items():
        with open(os.path.join(SVG_DIR, n), 'w') as f:
            f.write(s)
    return files


def sized(svg, px, radius='50%'):
    s = svg.replace('width="1000" height="1000"', f'width="{px}" height="{px}"', 1)
    return f'<div style="border-radius:{radius};overflow:hidden;width:{px}px;height:{px}px;flex:none">{s}</div>'


def phone(d):
    av = sized(d['art'](), 86)
    grid = ''.join(f'<div class="cell"><img src="file://{c}"/></div>' for c in COVERS)
    return f'''<div class="phone"><div class="sb"><b>9:41</b><span>●●● ▮</span></div>
<div class="top"><b>what.the.fuss.is.about</b><span>☰</span></div>
<div class="prow">{av}<div class="stat"><b>3</b><span>posts</span></div><div class="stat"><b>–</b><span>followers</span></div>
<div class="stat"><b>–</b><span>following</span></div></div>
<div class="bio"><b>What’s All the Fuss About?</b><br><span class="cat">Education</span><br>You’ve heard about it. Now actually understand it.</div>
<div class="btns"><div>Follow</div><div>Message</div></div><div class="grid">{grid}</div></div>'''


def band(i, d):
    art = d['art']()
    mono_l = svg_doc(1000, 1000, f'<rect width="1000" height="1000" fill="#FFFFFF"/><g transform="translate(500 500) scale(0.74) translate(-500 -500)">{d["mono"](M.INK)}</g>')
    mono_d = svg_doc(1000, 1000, f'<rect width="1000" height="1000" fill="{M.INK}"/><g transform="translate(500 500) scale(0.74) translate(-500 -500)">{d["mono"]("#FFFFFF")}</g>')
    cover = (f'<div class="sq" style="overflow:hidden"><img src="file://{COVERS[1]}" style="position:absolute;inset:0;width:100%;'
             f'height:100%;object-fit:cover;object-position:50% 46%"/><div style="position:absolute;right:10px;top:10px">{sized(art, 44)}</div>'
             f'<span style="color:#fff;text-shadow:0 1px 3px rgba(0,0,0,.6)">cover corner</span></div>')
    return f'''<section class="band">
  <div class="hero">{sized(art, 520, '116px')}</div>
  <div class="mid">
    <div class="num">0{i + 1}</div><h2>{d['title']}</h2><p>{d['line']}</p>
    <div class="row">
      <div class="app light">{sized(art, 110)}{sized(art, 40)}<span>110 · 40 px</span></div>
      <div class="app dark">{sized(art, 110)}{sized(art, 40)}<span>110 · 40 px</span></div>
    </div>
    <div class="row">
      <div class="sq">{sized(mono_l, 150, '0')}<span>one colour</span></div>
      <div class="sq">{sized(mono_d, 150, '0')}<span style="color:#aaa">reversed</span></div>
      {cover}
    </div>
  </div>
  <div class="right">{phone(d)}</div>
</section>'''


CSS = '''
body{margin:0;background:#FAF7F3;color:#1F1630;font-family:Inter,system-ui,sans-serif;width:1800px}
header{padding:70px 80px 34px}
.kick{font-size:15px;letter-spacing:.32em;text-transform:uppercase;color:#9A7F6B}
h1{font-size:46px;font-weight:650;margin:10px 0 10px;letter-spacing:-.015em}
header p{font-size:20px;color:#5E5560;margin:0;max-width:1450px;line-height:1.45}
header q{color:#1F1630;font-weight:600}
.band{display:flex;gap:60px;padding:48px 80px;border-top:1px solid #E9E1D8;align-items:center}
.hero{flex:none;box-shadow:0 30px 60px rgba(31,22,48,.16);border-radius:116px}
.mid{width:540px;flex:none}
.num{font-size:15px;letter-spacing:.3em;color:#9A7F6B}
h2{font-size:40px;font-weight:650;margin:8px 0 10px;letter-spacing:-.015em}
.mid p{font-size:18px;line-height:1.5;color:#5E5560;margin:0 0 22px}
.row{display:flex;gap:14px;margin-top:14px}
.app{width:262px;height:168px;border-radius:18px;display:flex;align-items:center;justify-content:center;gap:20px;position:relative}
.app.light{background:#fff;box-shadow:inset 0 0 0 1px #E9E1D8}.app.dark{background:#000}
.app span,.sq span{position:absolute;left:12px;bottom:8px;font-size:12px;color:#9A8F95}
.sq{position:relative;width:170px;height:170px;border-radius:18px;overflow:hidden;display:flex;align-items:center;justify-content:center;
  box-shadow:inset 0 0 0 1px #E9E1D8;background:#fff}
.right{flex:none}
.phone{width:350px;background:#fff;border-radius:44px;padding:14px 0 0;box-shadow:0 0 0 9px #1F1630,0 24px 60px rgba(31,22,48,.25);
  overflow:hidden;font-size:13px;color:#111}
.sb{display:flex;justify-content:space-between;padding:4px 28px 8px;font-size:14px}
.top{display:flex;justify-content:space-between;padding:6px 16px 10px;font-size:18px}
.prow{display:flex;align-items:center;padding:4px 16px 10px}.prow>div:first-child{margin-right:22px}
.stat{flex:1;display:flex;flex-direction:column;align-items:center;font-size:12px}.stat b{font-size:16px}
.bio{padding:0 16px 10px;line-height:1.35}.cat{color:#737373}
.btns{display:flex;gap:8px;padding:2px 16px 12px}.btns div{flex:1;background:#efefef;border-radius:8px;text-align:center;padding:7px 0;font-weight:600}
.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:2px}.cell{aspect-ratio:3/4;overflow:hidden}
.cell img{width:100%;height:100%;object-fit:cover;object-position:50% 30%}
footer{padding:30px 80px 60px;border-top:1px solid #E9E1D8;font-size:15px;color:#8E8590;line-height:1.5}
'''


def build_sheet():
    html = f'''<!doctype html><html><head><meta charset="utf-8"><style>{CSS}</style></head><body>
<header><div class="kick">What’s All the Fuss About? · studio logo · round 6</div>
<h1>From scratch, the way modern logos are made</h1>
<p>Your note: <q>I said no elephant. Too many details who would use this logo. No from scratch pick up the modern logos
and do it again</q>. So: no elephant, no scene, no text. One idea each, a few bold shapes, one strong colour, clear at
40 px, built with the methods of today’s best marks (an overlap, one cut, one shape that says what we do).</p></header>
{''.join(band(i, d) for i, d in enumerate(DIRS))}
<footer>Stills only. Drawn in code from exact circles and curves; nothing traced, no image generation. Dropped on the way:
a one-line bubble (read as a letter P), four bubbles in a pinwheel (a flower), a dot with three strokes (a sun). Sources:
video/brand/logo/ (make_logos_r6.py, marks_r6.py, svg/r6/). Notes: video/docs/brand/LOGO.md.</footer></body></html>'''
    tmp = tempfile.mkdtemp(prefix='logo_sheet_r6_')
    hp = os.path.join(tmp, 'sheet.html')
    with open(hp, 'w') as f:
        f.write(html)
    subprocess.run(['node', os.path.join(HERE, 'render.cjs'), hp, OUT_PNG, '1800', '1'], check=True)
    return hp


if __name__ == '__main__':
    files = write_svgs()
    hp = build_sheet()
    print(f'{len(files)} svgs -> {SVG_DIR}\nsheet -> {OUT_PNG}')
