"""Studio logo, round 2: marks only, no text (owner, 2026-10-29: "The logo should not contain any text btw").

    cd video/brand/logo && python3 make_logos_r2.py
    -> svg/r2/*.svg and ../../deliverables/brand/logo_options_v2.png
"""
import os
import subprocess
import tempfile

from logo_lib import PAL
import marks as M
from make_logos import CSS, COVERS, SWATCHES, VIDEO, avatar_inline, inline, phone_mock, square, tile

HERE = os.path.dirname(os.path.abspath(__file__))
SVG_DIR = os.path.join(HERE, 'svg', 'r2')
OUT_PNG = os.path.join(VIDEO, 'deliverables', 'brand', 'logo_options_v2.png')
P = PAL
UI_LIGHT, UI_DARK = '#FFFFFF', '#000000'


def _centre(bb, s, cy=500):
    """cx, cy that put a mark's visual bbox centre on (500, cy) at scale s."""
    cxb, cyb = (bb[0] + bb[2]) / 2, (bb[1] + bb[3]) / 2
    return 500 - (cxb - 500) * s, cy - (cyb - 500) * s


# ---------------------------------------------------------------- the three directions
def point():
    mk = lambda c, dot, s=0.92, cy=500: M.mark_point(c, dot, scale=s, cy=cy)
    return dict(
        key='1_the_point', title='1 · The Point',
        line='A question that goes round in circles, straightens out and lands on its dot: the fuss, then the '
             'point. Drawn, not typed; one stroke an end card can draw on.',
        mark_light=mk(P['teal'], P['terra']), mark_dark=mk(P['cream'], P['terra']),
        mono=lambda c: mk(c, c),
        avatar=(P['plum'], mk(P['cream'], P['terra'], s=0.80, cy=506)),
        wm=lambda c: mk(c, c, s=0.9),
    )


def pip():
    bb = M.PIP2_BB

    def mk(s=0.98, cy=500, dark=False):
        cx0, cy0 = _centre(bb, s, cy)
        if dark:
            return M.mark_pip2(P['peri_lite'], P['peri_mid_dk'], P['peri'], P['peach'], P['plum'], s=s, cx=cx0,
                               cy=cy0)
        return M.mark_pip2(P['peri'], P['peri_mid'], P['peri_deep'], P['peach'], P['plum'], s=s, cx=cx0, cy=cy0)

    def mono(c, s=0.98, cy=500):
        cx0, cy0 = _centre(bb, s, cy)
        return M.mark_pip2_mono(c, s=s, cx=cx0, cy=cy0)
    return dict(
        key='2_pip', title='2 · Pip',
        line='Our elephant rebuilt from circles and lit from one side like the films’ volumes (a lit face, a '
             'shade face, no outline): the biggest ears, heard it all; a memory that never forgets.',
        mark_light=mk(), mark_dark=mk(dark=True), mono=mono,
        avatar=(P['teal'], mk(1.08, 520)),
        wm=lambda c: mono(c, 0.98),
        extra=('Pose B: the trunk asks the question',
               M.pip_question2(P['peri'], P['peri_mid'], P['peri_deep'], P['peach'], P['plum'], s=0.92, cy=488)),
    )


def peek():
    def mk(R=440, clip=True):
        return M.badge_peek(P['sky'], P['terra'], P['terra_lite'], P['peri'], P['peri_mid'], P['peri_deep'],
                            P['peach'], P['plum'], R=R, clip=clip)

    def mono(c, R=440):
        return M.badge_peek_mono(c, R=R)
    return dict(
        key='3_pip_peeking', title='3 · Pip, hidden on purpose',
        line='A round badge: Pip peeks over the ground, the trunk hooked over the edge: curious about the fuss, '
             'and the “find Pip” of every film in one picture. In one colour, Pip is cut out of the disc.',
        mark_light=mk(), mark_dark=mk(), mono=mono,
        avatar=(P['sky'], mk(R=500, clip=False)),
        wm=lambda c: mono(c, 470),
    )


DIRS = [point(), pip(), peek()]


# ---------------------------------------------------------------- SVG files
def write_svgs():
    os.makedirs(SVG_DIR, exist_ok=True)
    files = {}
    for d in DIRS:
        k = d['key']
        files[f'{k}_mark.svg'] = square(d['mark_light'], title=d['title'])
        files[f'{k}_mark_dark.svg'] = square(d['mark_dark'], bg=P['plum'], title=d['title'])
        files[f'{k}_mark_one_colour.svg'] = square(d['mono'](P['plum']), title=d['title'])
        files[f'{k}_avatar.svg'] = square(d['avatar'][1], bg=d['avatar'][0], title=d['title'])
        if d.get('extra'):
            files[f'{k}_pose_b.svg'] = square(d['extra'][1], title=d['extra'][0])
    for name, s in files.items():
        with open(os.path.join(SVG_DIR, name), 'w') as f:
            f.write(s)
    return files


# ---------------------------------------------------------------- the sheet
CSS2 = CSS + '''
.hero{display:flex;gap:13px}
.g22{display:grid;grid-template-columns:254px 254px;gap:13px}
.big{width:520px;height:520px}
.avbig{display:flex;align-items:center;justify-content:center}
.note{font-size:20px;margin:0 0 22px;color:#5d4f57}
.note q{color:#2E2138;font-weight:600}
'''


def band(d):
    mk = lambda body, bg, w=254: inline(square(body, bg=bg), w, w)
    hero = (f'<div class="tile big" style="background:{P["cream"]}">{mk(d["mark_light"], None, 520)}'
            f'<div class="tl">mark</div></div>')
    avbig = (f'<div class="tile avbig" style="width:254px;height:254px;background:{P["cream"]}">'
             f'{avatar_inline(d, 196)}<div class="tl">avatar (the circle crop)</div></div>')
    g22 = ('<div class="g22">' + avbig
           + tile('mark on dark', mk(d['mark_dark'], P['plum']), P['plum'], 254, 254)
           + tile('one colour', mk(d['mono'](P['plum']), None), P['cream'], 254, 254)
           + tile('one colour, reversed', mk(d['mono'](P['cream']), P['teal']), P['teal'], 254, 254)
           + '</div>')
    av = lambda bgc, lab: (f'<div class="avs" style="background:{bgc}">'
                           f'<div class="avc">{avatar_inline(d, 110)}<span>110 px</span></div>'
                           f'<div class="avc">{avatar_inline(d, 40)}<span>40 px</span></div>'
                           f'<div class="avl">{lab}</div></div>')
    cover = (f'<div class="tile" style="width:250px;height:250px">'
             f'<img src="file://{COVERS[1]}" style="width:100%;height:100%;object-fit:cover;object-position:50% 46%"/>'
             f'<div style="position:absolute;right:12px;top:12px">{avatar_inline(d, 46)}</div>'
             f'<div class="tl" style="color:#fff;text-shadow:0 1px 3px rgba(0,0,0,.5)">corner of a cover</div></div>')
    if d.get('extra'):
        last = (f'<div class="tile" style="width:250px;height:250px;background:{P["cream"]}">'
                f'{inline(square(d["extra"][1]), 250, 250)}<div class="tl">{d["extra"][0]}</div></div>')
    else:
        wm = inline(square(d['wm'](P['cream'])), 58, 58)
        last = (f'<div class="tile" style="width:250px;height:250px">'
                f'<img src="file://{COVERS[0]}" style="width:100%;height:100%;object-fit:cover;object-position:50% 78%"/>'
                f'<div style="position:absolute;left:12px;top:10px">{wm}</div>'
                f'<div class="tl" style="color:#fff;text-shadow:0 1px 3px rgba(0,0,0,.6)">watermark on a frame</div></div>')
    return f'''
<section class="band">
  <div class="left">
    <h2>{d['title']}</h2><p class="desc">{d['line']}</p>
    <div class="hero">{hero}{g22}</div>
    <div class="row">{av(UI_LIGHT, 'avatar on a light app')}{av(UI_DARK, 'avatar on a dark app')}{cover}{last}</div>
  </div>
  <div class="right">{phone_mock(d)}<div class="cap">profile mock (the circle crop at real phone size)</div></div>
</section>'''


SWATCHES2 = [('cream', 'page'), ('plum', 'ink, dark ground'), ('peri', 'Pip periwinkle (lit)'),
             ('peri_mid', 'periwinkle shade face'), ('peri_deep', 'periwinkle deep (ears)'), ('teal', 'canal teal'),
             ('terra', 'terracotta: the point'), ('peach', 'peach'), ('sky', 'warm sky')]


def build_sheet():
    sw = ''.join(f'<div><i style="background:{P[k]}"></i><b>{P[k]}</b><br>{lab}</div>' for k, lab in SWATCHES2)
    html = f'''<!doctype html><html><head><meta charset="utf-8"><style>{CSS2}
.sw div{{width:170px}}</style></head><body>
<header><h1>What’s All the Fuss About? — studio logo, round 2: no text</h1>
<p class="note">Your note on round 1: <q>The logo should not contain any text btw</q>. So: marks only. The Wordmark and
every name lockup are gone; The Point and Pip are refined, and Pip peeking is new.</p>
<div class="sw">{sw}</div></header>
{''.join(band(d) for d in DIRS)}
<footer>All shapes drawn in code from circles, arcs and curves; no letters, no fonts, nothing traced. The question mark in
1 is a drawn shape, not a typed character. Sources: video/brand/logo/ (make_logos_r2.py, svg/r2/). Notes:
video/docs/brand/LOGO.md.</footer>
</body></html>'''
    tmp = tempfile.mkdtemp(prefix='logo_sheet_r2_')
    hp = os.path.join(tmp, 'sheet.html')
    with open(hp, 'w') as f:
        f.write(html)
    subprocess.run(['node', os.path.join(HERE, 'render.cjs'), hp, OUT_PNG, '1800', '1'], check=True)
    return hp


if __name__ == '__main__':
    files = write_svgs()
    hp = build_sheet()
    print(f'{len(files)} svgs -> {SVG_DIR}\nsheet -> {OUT_PNG}\nhtml -> {hp}')
