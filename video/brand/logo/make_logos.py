"""Studio logo, round 1: writes the SVG sources (svg/) and the options sheet.

    cd video/brand/logo && python3 make_logos.py
    -> svg/*.svg and ../../deliverables/brand/logo_options_v1.png

Needs the fonts and uharfbuzz (setup in logo_lib.py) and the pre-installed Playwright Chromium (render.cjs).
"""
import os
import subprocess
import tempfile

from logo_lib import PAL, svg_doc
import marks as M

HERE = os.path.dirname(os.path.abspath(__file__))
VIDEO = os.path.abspath(os.path.join(HERE, '..', '..'))
SVG_DIR = os.path.join(HERE, 'svg')
OUT_PNG = os.path.join(VIDEO, 'deliverables', 'brand', 'logo_options_v1.png')
P = PAL
UI_LIGHT, UI_DARK = '#FFFFFF', '#000000'


# ---------------------------------------------------------------- the three directions, as data
def d1():
    mark = lambda c, dot: M.mono_fq(c, dot, size=640, gap=0.025)
    return dict(
        key='1_wordmark', title='1 · The Wordmark',
        line='“fuss about?” set big in a soft, warm serif under a tracked kicker, like a poster title; '
             'the avatar is the monogram f? (two hooks that rhyme), its dot the one terracotta “point”.',
        lockup=lambda c, dot, k=None: M.lockup_wordmark(c, dot, k),
        lockup_args_light=(P['plum'], P['terra']), lockup_args_dark=(P['cream'], P['terra']),
        mark_light=mark(P['plum'], P['terra']), mark_dark=mark(P['cream'], P['terra']),
        mono=lambda c: mark(c, c), mono_lockup=lambda c: M.lockup_wordmark(c, c),
        avatar=(P['plum'], M.mono_fq(P['cream'], P['terra'], size=560, cy=506, gap=0.025)),
    )


def d2():
    mark = lambda c, dot, s=0.92: M.mark_point(c, dot, scale=s)
    return dict(
        key='2_the_point', title='2 · The Point',
        line='A question that goes round in circles, straightens out and lands on its dot: the fuss, then the '
             'point. One stroke, so it can draw itself on in an end card.',
        lockup=lambda c, dot, t=None: M.lockup_point(c, dot, t or P['plum']),
        lockup_args_light=(P['teal'], P['terra'], P['plum']), lockup_args_dark=(P['cream'], P['terra'], P['cream']),
        mark_light=mark(P['teal'], P['terra']), mark_dark=mark(P['cream'], P['terra']),
        mono=lambda c: mark(c, c), mono_lockup=lambda c: M.lockup_point(c, c, c),
        avatar=(P['teal'], M.mark_point(P['cream'], P['terra'], scale=0.70, cy=504)),
    )


def d3():
    pip = lambda s=1.0, cx=500, cy=500: M.mark_pip(P['peri'], P['peri_deep'], P['peach'], P['plum'], s=s, cx=cx,
                                                    cy=cy)
    bb = M.PIP_BB
    cxb, cyb = (bb[0] + bb[2]) / 2, (bb[1] + bb[3]) / 2

    def placed(s, cy=500, mono=None):
        # centre the visual bbox on (500, cy)
        cx0 = 500 - (cxb - 500) * s
        cy0 = cy - (cyb - 500) * s
        if mono:
            return M.mark_pip_mono(mono, s=s, cx=cx0, cy=cy0)
        return pip(s, cx0, cy0)
    dark_pip = lambda s, cy=500: M.mark_pip(P['peri_lite'], P['peri'], P['peach'], P['plum'], s=s,
                                            cx=500 - (cxb - 500) * s, cy=cy - (cyb - 500) * s)
    return dict(
        key='3_pip', title='3 · Pip',
        line='Our elephant, rebuilt from circles: the biggest ears (heard it all) and a memory that never '
             'forgets; two flat tones of periwinkle, no outline, the name in our caption hand.',
        lockup=lambda c, dot, t=None: M.lockup_pip(P['peri'], P['peri_deep'], P['peach'], P['plum'],
                                                   t or P['plum'], dot),
        lockup_args_light=(P['plum'], P['terra']), lockup_args_dark=(P['cream'], P['terra'], P['cream']),
        mark_light=placed(0.98), mark_dark=dark_pip(0.98),
        mono=lambda c: placed(0.98, mono=c), mono_lockup=None,
        avatar=(P['cream'], placed(1.06, cy=520)),
        extra=('Pose B: the trunk asks the question',
               M.pip_question(P['peri'], P['peri_deep'], P['peach'], P['plum'], s=0.92, cy=488)),
    )


DIRS = [d1(), d2(), d3()]


# ---------------------------------------------------------------- SVG files
def square(body, bg=None, size=1000, title=None):
    return svg_doc(size, size, body, bg=bg, title=title)


def lockup_svg(lk, bg=None, pad=0.08, title=None):
    body, w, h = lk
    p = pad * max(w, h)
    W, H = w + 2 * p, h + 2 * p
    inner = f'<g transform="translate({p:.1f} {p:.1f})">{body}</g>'
    return svg_doc(round(W), round(H), inner, bg=bg, title=title)


def write_svgs():
    os.makedirs(SVG_DIR, exist_ok=True)
    files = {}
    for d in DIRS:
        k = d['key']
        files[f'{k}_lockup.svg'] = lockup_svg(d['lockup'](*d['lockup_args_light']), title=d['title'])
        files[f'{k}_lockup_dark.svg'] = lockup_svg(d['lockup'](*d['lockup_args_dark']), bg=P['plum'],
                                                   title=d['title'])
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
def inline(svg, w, h):
    """Re-size an svg document string for inline use."""
    head, rest = svg.split('>', 1)
    import re
    head = re.sub(r' width="[^"]+" height="[^"]+"', f' width="{w}" height="{h}"', head)
    return head + '>' + rest


def lockup_inline(lk, box_w, box_h, bg=None, pad=0.0):
    body, w, h = lk
    s = min(box_w * (1 - 2 * pad) / w, box_h * (1 - 2 * pad) / h)
    ox, oy = (box_w - w * s) / 2, (box_h - h * s) / 2
    b = f'<rect width="{box_w}" height="{box_h}" fill="{bg}"/>' if bg else ''
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {box_w} {box_h}" width="{box_w}" '
            f'height="{box_h}">{b}<g transform="translate({ox:.1f} {oy:.1f}) scale({s:.5f})">{body}</g></svg>')


def avatar_inline(d, px):
    bg, body = d['avatar']
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" width="{px}" height="{px}" '
            f'style="border-radius:50%;display:block"><rect width="1000" height="1000" fill="{bg}"/>{body}</svg>')


COVERS = [os.path.join(VIDEO, p) for p in ('deliverables/v3/cover.png', 'deliverables/v2/v2r_cover.png',
                                            'deliverables/cover.png')]


def phone_mock(d):
    av = avatar_inline(d, 86)
    grid = ''.join(f'<div class="cell"><img src="file://{c}"/></div>' for c in COVERS)
    
    return f'''
<div class="phone">
  <div class="sb"><b>9:41</b><span>●●● ▮</span></div>
  <div class="top"><b>what.the.fuss.is.about</b><span>☰</span></div>
  <div class="prow">{av}
    <div class="stat"><b>3</b><span>posts</span></div><div class="stat"><b>–</b><span>followers</span></div>
    <div class="stat"><b>–</b><span>following</span></div></div>
  <div class="bio"><b>What’s All the Fuss About?</b><br><span class="cat">Education</span><br>
    You’ve heard about it. Now actually understand it.</div>
  <div class="btns"><div>Follow</div><div>Message</div></div>
  <div class="tabs"><span class="on">▦</span><span>▷</span><span>◎</span></div>
  <div class="grid">{grid}</div>
</div>'''


def tile(label, svg, bg, w=250, h=250):
    return (f'<div class="tile" style="background:{bg};width:{w}px;height:{h}px">{svg}'
            f'<div class="tl" style="color:{"#F7EDE3" if bg in (P["plum"], UI_DARK, P["teal"]) else "#6d5f66"}">'
            f'{label}</div></div>')


def band(d):
    lk_l = d['lockup'](*d['lockup_args_light'])
    lk_d = d['lockup'](*d['lockup_args_dark'])
    big = lockup_inline(lk_l, 1040, 400, pad=0.09)
    small_dark = lockup_inline(lk_d, 515, 250, bg=P['plum'], pad=0.10)
    if d['mono_lockup']:
        mono_lk = lockup_inline(d['mono_lockup'](P['plum']), 515, 250, pad=0.10)
    else:
        mono_lk = lockup_inline(_pip_mono_lockup(P['plum']), 515, 250, pad=0.10)
    mk = lambda body, bg: inline(square(body, bg=bg), 250, 250)
    tiles = (tile('mark', mk(d['mark_light'], None), P['cream'])
             + tile('mark on dark', mk(d['mark_dark'], P['plum']), P['plum'])
             + tile('one colour', mk(d['mono'](P['plum']), None), P['cream'])
             + tile('one colour, reversed', mk(d['mono'](P['cream']), P['teal']), P['teal']))
    row2 = (f'<div class="tile" style="width:515px;height:250px">{small_dark}'
            f'<div class="tl" style="color:#F7EDE3">lockup on dark</div></div>'
            f'<div class="tile" style="width:515px;height:250px;background:{P["cream"]}">{mono_lk}'
            f'<div class="tl">lockup, one colour</div></div>')
    av = lambda bgc, lab: (f'<div class="avs" style="background:{bgc}">'
                           f'<div class="avc">{avatar_inline(d, 110)}<span>110 px</span></div>'
                           f'<div class="avc">{avatar_inline(d, 40)}<span>40 px</span></div>'
                           f'<div class="avl">{lab}</div></div>')
    cover = (f'<div class="tile" style="width:250px;height:250px">'
             f'<img src="file://{COVERS[1]}" style="width:100%;height:100%;object-fit:cover;object-position:50% 46%"/>'
             f'<div style="position:absolute;right:12px;top:12px">{avatar_inline(d, 46)}</div>'
             f'<div class="tl" style="color:#fff;text-shadow:0 1px 3px rgba(0,0,0,.5)">corner of a cover</div></div>')
    extra = ''
    if d.get('extra'):
        extra = (f'<div class="tile" style="width:250px;height:250px;background:{P["cream"]}">'
                 f'{inline(square(d["extra"][1]), 250, 250)}<div class="tl">{d["extra"][0]}</div></div>')
    return f'''
<section class="band">
  <div class="left">
    <h2>{d['title']}</h2><p class="desc">{d['line']}</p>
    <div class="tile" style="width:1040px;height:400px;background:{P['cream']}">{big}<div class="tl">full lockup</div></div>
    <div class="row">{row2}</div>
    <div class="row">{tiles}</div>
    <div class="row">{av(UI_LIGHT, 'avatar on a light app')}{av(UI_DARK, 'avatar on a dark app')}{cover}{extra}</div>
  </div>
  <div class="right">{phone_mock(d)}<div class="cap">profile mock (the circle crop at real phone size)</div></div>
</section>'''


def _pip_mono_lockup(c):
    """Pip lockup in one colour: the knock-out Pip beside the name."""
    body, w, h = M.lockup_pip(P['peri'], P['peri_deep'], P['peach'], P['plum'], c, c)
    # swap the two-tone mark (the first <g>) for the knock-out one
    g_end = body.index('</g>') + 4
    g_head = body[:body.index('>') + 1]
    mono = g_head + M.mark_pip_mono(c) + '</g>'
    return mono + body[g_end:], w, h


SWATCHES = [('cream', 'page'), ('plum', 'ink, dark ground'), ('peri', 'Pip periwinkle'),
            ('peri_deep', 'periwinkle shade'), ('teal', 'canal teal'), ('terra', 'terracotta: the point'),
            ('peach', 'peach')]

CSS = f'''
body{{margin:0;background:#EFE4D9;font-family:Inter,system-ui,sans-serif;color:{P['plum']};width:1800px}}
header{{padding:48px 60px 20px}}
h1{{font-size:44px;margin:0 0 6px;letter-spacing:-.01em}}
header p{{font-size:20px;margin:0 0 22px;color:#5d4f57}}
.sw{{display:flex;gap:14px}}
.sw div{{width:200px;font-size:14px;line-height:1.35}}
.sw i{{display:block;height:64px;border-radius:12px;margin-bottom:6px}}
.band{{display:flex;gap:40px;padding:34px 60px 40px;border-top:2px solid #e2d3c5}}
.left{{width:1040px}}
h2{{font-size:34px;margin:0 0 6px}}
.desc{{font-size:18px;margin:0 0 16px;color:#5d4f57;max-width:1040px;line-height:1.4}}
.row{{display:flex;gap:13px;margin-top:13px}}
.tile{{position:relative;border-radius:16px;overflow:hidden;flex:none}}
.tile svg{{display:block}}
.tl{{position:absolute;left:14px;bottom:10px;font-size:13px;color:#6d5f66}}
.avs{{position:relative;width:250px;height:250px;border-radius:16px;display:flex;align-items:center;
      justify-content:center;gap:22px;box-shadow:inset 0 0 0 1px #e2d3c5;flex:none}}
.avc{{display:flex;flex-direction:column;align-items:center;gap:8px;font-size:12px;color:#8a7b82}}
.avl{{position:absolute;left:14px;bottom:10px;font-size:13px;color:#8a7b82}}
.right{{width:600px;display:flex;flex-direction:column;align-items:center;padding-top:58px}}
.cap{{font-size:14px;color:#6d5f66;margin-top:10px}}
.phone{{width:390px;background:#fff;border-radius:44px;padding:14px 0 0;box-shadow:0 0 0 10px #2b2230,
        0 20px 50px rgba(46,33,56,.25);overflow:hidden;font-size:14px;color:#111}}
.sb{{display:flex;justify-content:space-between;padding:4px 30px 8px;font-size:15px}}
.top{{display:flex;justify-content:space-between;padding:6px 16px 10px;font-size:20px}}
.prow{{display:flex;align-items:center;padding:4px 16px 10px;gap:0}}
.prow svg{{margin-right:26px}}
.stat{{flex:1;display:flex;flex-direction:column;align-items:center;font-size:13px}}
.stat b{{font-size:17px}}
.bio{{padding:0 16px 10px;line-height:1.35}}
.cat{{color:#737373}}
.btns{{display:flex;gap:8px;padding:2px 16px 12px}}
.btns div{{flex:1;background:#efefef;border-radius:8px;text-align:center;padding:7px 0;font-weight:600}}
.tabs{{display:flex;justify-content:space-around;border-top:1px solid #eee;padding:8px 0;color:#999;font-size:18px}}
.tabs .on{{color:#111}}
.grid{{display:grid;grid-template-columns:repeat(3,1fr);gap:2px}}
.cell{{aspect-ratio:3/4;overflow:hidden;background:#f2f2f2}}
.cell img{{width:100%;height:100%;object-fit:cover;object-position:50% 30%}}
.ph{{background:#f4f0ec}}
footer{{padding:26px 60px 50px;border-top:2px solid #e2d3c5;font-size:16px;color:#5d4f57;line-height:1.5}}
'''


def build_sheet():
    sw = ''.join(f'<div><i style="background:{P[k]}"></i><b>{P[k]}</b><br>{lab}</div>' for k, lab in SWATCHES)
    html = f'''<!doctype html><html><head><meta charset="utf-8"><style>{CSS}</style></head><body>
<header><h1>What’s All the Fuss About? — studio logo, round 1</h1>
<p>Three directions, one palette. Each: the full lockup, the mark alone (light, dark, one colour), the avatar circle at
110 px and 40 px (real pixels) on a light and a dark app, and a profile mock.</p>
<div class="sw">{sw}</div></header>
{''.join(band(d) for d in DIRS)}
<footer>Type, all SIL Open Font License 1.1, outlined to paths in the SVGs: Fraunces (Soft 100, opsz 144, wght 760),
Jost 500, Bricolage Grotesque (wght 800), Patrick Hand. Sources: video/brand/logo/ (make_logos.py, svg/).
Notes: video/docs/brand/LOGO.md.</footer>
</body></html>'''
    tmp = tempfile.mkdtemp(prefix='logo_sheet_')
    hp = os.path.join(tmp, 'sheet.html')
    with open(hp, 'w') as f:
        f.write(html)
    os.makedirs(os.path.dirname(OUT_PNG), exist_ok=True)
    subprocess.run(['node', os.path.join(HERE, 'render.cjs'), hp, OUT_PNG, '1800', '1'], check=True)
    return hp


if __name__ == '__main__':
    files = write_svgs()
    hp = build_sheet()
    print(f'{len(files)} svgs -> {SVG_DIR}\nsheet -> {OUT_PNG}\nhtml -> {hp}')
