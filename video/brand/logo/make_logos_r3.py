"""Studio logo, round 3: abstract and premium, no text (owner, 2026-10-29: "No, more abstract more premium").

    cd video/brand/logo && python3 make_logos_r3.py
    -> svg/r3/*.svg and ../../deliverables/brand/logo_options_v3.png
"""
import os
import subprocess
import tempfile

from logo_lib import PAL
import marks_r3 as R
from make_logos import COVERS, VIDEO, avatar_inline, inline, phone_mock, square, tile
from make_logos_r2 import CSS2

HERE = os.path.dirname(os.path.abspath(__file__))
SVG_DIR = os.path.join(HERE, 'svg', 'r3')
OUT_PNG = os.path.join(VIDEO, 'deliverables', 'brand', 'logo_options_v3.png')
P = PAL
UI_LIGHT, UI_DARK = '#FFFFFF', '#000000'


def fold():
    return dict(
        key='1_the_fold', title='1 · The Fold',
        line='A speech bubble, folded along its diagonal into a lit face and a shade face: everyone’s talking '
             'about it, and we unfold it. Our films’ light and shade, in one shape.',
        mark_light=R.fold(P['plum_lit'], P['plum']), mark_dark=R.fold(P['cream'], P['peach_fold']),
        mono=lambda c: R.fold(c, c),
        alt=('teal', R.fold(P['teal'], P['teal_deep'])),
        avatar=(P['plum'], R.fold(P['cream'], P['peach_fold'], s=1.18, cx=520, cy=480)),
        wm=lambda c: R.fold(c, c),
    )


def eclipse():
    return dict(
        key='2_the_eclipse', title='2 · The Eclipse',
        line='Two circles, what you heard and what you understand; where they overlap, the point lights up. The '
             'moment it all lines up.',
        mark_light=R.eclipse(P['plum'], P['terra']), mark_dark=R.eclipse(P['cream'], P['terra']),
        mono=lambda c: _eclipse_mono(c),
        alt=('periwinkle', R.eclipse(P['peri_deep'], P['terra'])),
        avatar=(P['teal'], R.eclipse(P['cream'], P['terra'], s=1.12)),
        wm=lambda c: _eclipse_mono(c),
    )


def _eclipse_mono(c, s=1.0, gap=26):
    """One colour: the same disc, the overlap parted from the rest by a cut along the first circle's arc (never a
    lone crescent)."""
    import marks_r3 as RR
    r, off, g = 270 * s, 150 * s, gap * s
    c1, c2 = (500 - off / 2, 500), (500 + off / 2, 500)
    mid = f'em{next(RR._ids)}'
    return (f'<defs><mask id="{mid}" maskUnits="userSpaceOnUse" x="0" y="0" width="1000" height="1000">'
            f'<circle cx="{c2[0]:.2f}" cy="{c2[1]:.2f}" r="{r:.2f}" fill="white"/>'
            f'<circle cx="{c1[0]:.2f}" cy="{c1[1]:.2f}" r="{r + g / 2:.2f}" fill="none" stroke="black" '
            f'stroke-width="{g:.2f}"/></mask></defs>'
            f'<rect width="1000" height="1000" fill="{c}" mask="url(#{mid})"/>')


def question():
    return dict(
        key='3_the_question', title='3 · The Question',
        line='The question mark reduced to its two parts, an open ring and the point: cut flat, no stem, so it '
             'reads as a symbol before it reads as a sign.',
        mark_light=R.question(P['plum'], P['terra']), mark_dark=R.question(P['cream'], P['terra']),
        mono=lambda c: R.question(c, c),
        alt=('teal', R.question(P['teal'], P['terra'])),
        avatar=(P['plum'], R.question(P['cream'], P['terra'], s=0.98, cy=420)),
        wm=lambda c: R.question(c, c),
    )


DIRS = [fold(), eclipse(), question()]


def write_svgs():
    os.makedirs(SVG_DIR, exist_ok=True)
    files = {}
    for d in DIRS:
        k = d['key']
        files[f'{k}_mark.svg'] = square(d['mark_light'], title=d['title'])
        files[f'{k}_mark_dark.svg'] = square(d['mark_dark'], bg=P['plum'], title=d['title'])
        files[f'{k}_mark_one_colour.svg'] = square(d['mono'](P['plum']), title=d['title'])
        files[f'{k}_mark_{d["alt"][0]}.svg'] = square(d['alt'][1], title=d['title'])
        files[f'{k}_avatar.svg'] = square(d['avatar'][1], bg=d['avatar'][0], title=d['title'])
    for name, s in files.items():
        with open(os.path.join(SVG_DIR, name), 'w') as f:
            f.write(s)
    return files


def band(d):
    mk = lambda body, bg, w=254: inline(square(body, bg=bg), w, w)
    hero = (f'<div class="tile big" style="background:{P["cream"]}">{mk(d["mark_light"], None, 520)}'
            f'<div class="tl">mark</div></div>')
    avbig = (f'<div class="tile avbig" style="width:254px;height:254px;background:{P["cream"]}">'
             f'{avatar_inline(d, 196)}<div class="tl">avatar (the circle crop)</div></div>')
    g22 = ('<div class="g22">' + avbig
           + tile('on dark', mk(d['mark_dark'], P['plum']), P['plum'], 254, 254)
           + tile('one colour', mk(d['mono'](P['plum']), None), P['cream'], 254, 254)
           + tile(f'in {d["alt"][0]}', mk(d['alt'][1], None), P['cream'], 254, 254)
           + '</div>')
    av = lambda bgc, lab: (f'<div class="avs" style="background:{bgc}">'
                           f'<div class="avc">{avatar_inline(d, 110)}<span>110 px</span></div>'
                           f'<div class="avc">{avatar_inline(d, 40)}<span>40 px</span></div>'
                           f'<div class="avl">{lab}</div></div>')
    cover = (f'<div class="tile" style="width:250px;height:250px">'
             f'<img src="file://{COVERS[1]}" style="width:100%;height:100%;object-fit:cover;object-position:50% 46%"/>'
             f'<div style="position:absolute;right:12px;top:12px">{avatar_inline(d, 46)}</div>'
             f'<div class="tl" style="color:#fff;text-shadow:0 1px 3px rgba(0,0,0,.5)">corner of a cover</div></div>')
    wm = inline(square(d['wm'](P['cream'])), 58, 58)
    water = (f'<div class="tile" style="width:250px;height:250px">'
             f'<img src="file://{COVERS[0]}" style="width:100%;height:100%;object-fit:cover;object-position:50% 78%"/>'
             f'<div style="position:absolute;left:12px;top:10px">{wm}</div>'
             f'<div class="tl" style="color:#fff;text-shadow:0 1px 3px rgba(0,0,0,.6)">watermark on a frame</div></div>')
    return f'''
<section class="band">
  <div class="left">
    <h2>{d['title']}</h2><p class="desc">{d['line']}</p>
    <div class="hero">{hero}{g22}</div>
    <div class="row">{av(UI_LIGHT, 'avatar on a light app')}{av(UI_DARK, 'avatar on a dark app')}{cover}{water}</div>
  </div>
  <div class="right">{phone_mock(d)}<div class="cap">profile mock (the circle crop at real phone size)</div></div>
</section>'''


SW = [('cream', 'page'), ('plum', 'ink, dark ground'), ('plum_lit', 'plum, lit face'), ('peach_fold', 'peach shade'),
      ('teal', 'canal teal'), ('peri_deep', 'periwinkle'), ('terra', 'terracotta: the point')]


def build_sheet():
    sw = ''.join(f'<div><i style="background:{P[k]}"></i><b>{P[k]}</b><br>{lab}</div>' for k, lab in SW)
    html = f'''<!doctype html><html><head><meta charset="utf-8"><style>{CSS2}
.sw div{{width:170px}}</style></head><body>
<header><h1>What’s All the Fuss About? — studio logo, round 3: abstract</h1>
<p class="note">Your note on round 2: <q>More premium!! No, more abstract more premium</q>. So: no character, no face, no
text; a few precise shapes, two colours at most, one accent.</p>
<div class="sw">{sw}</div></header>
{''.join(band(d) for d in DIRS)}
<footer>All shapes drawn in code from exact circles and straight cuts; no letters, no fonts, nothing traced. Sources:
video/brand/logo/ (make_logos_r3.py, marks_r3.py, svg/r3/). Notes: video/docs/brand/LOGO.md.</footer>
</body></html>'''
    tmp = tempfile.mkdtemp(prefix='logo_sheet_r3_')
    hp = os.path.join(tmp, 'sheet.html')
    with open(hp, 'w') as f:
        f.write(html)
    subprocess.run(['node', os.path.join(HERE, 'render.cjs'), hp, OUT_PNG, '1800', '1'], check=True)
    return hp


if __name__ == '__main__':
    files = write_svgs()
    hp = build_sheet()
    print(f'{len(files)} svgs -> {SVG_DIR}\nsheet -> {OUT_PNG}\nhtml -> {hp}')
