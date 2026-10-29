"""The Peel, refined (the owner's pick, 2026-10-29: "I like the peel yes"). Stills only.

A speech bubble with its corner peeled back: what everyone's talking about, opened up.

    cd video/brand/logo && python3 peel_final.py
    -> svg/peel/*.svg, ../../deliverables/brand/peel/*.png (the export pack), ../../deliverables/brand/logo_peel_v1.png
"""
import itertools
import math
import os
import subprocess
import tempfile

import numpy as np

from logo_lib import poly_d, svg_doc

HERE = os.path.dirname(os.path.abspath(__file__))
VIDEO = os.path.abspath(os.path.join(HERE, '..', '..'))
SVG_DIR = os.path.join(HERE, 'svg', 'peel')
PACK = os.path.join(VIDEO, 'deliverables', 'brand', 'peel')
SHEET = os.path.join(VIDEO, 'deliverables', 'brand', 'logo_peel_v1.png')
COVERS = [os.path.join(VIDEO, p) for p in ('deliverables/v3/cover.png', 'deliverables/v2/v2r_cover.png',
                                            'deliverables/cover.png')]

INK, CORAL, CORAL_SHADE, FLAP, WHITE, CREAM = '#1F1630', '#F0643C', '#C64B27', '#F8ECE0', '#FFFFFF', '#F7EDE3'
INK_SHADE = '#0C0716'
# THE FINAL (owner, 2026-10-29: "Okay pick one and give me the final one"): coral ground, ink bubble, cream peel, the
# fold shadow. On dark grounds the bubble turns coral (an ink bubble vanishes on black).
FINAL = dict(bg=CORAL, body=INK, flap=FLAP, shade=INK_SHADE)
ON_DARK = dict(bg=INK, body=CORAL, flap=FLAP, shade=CORAL_SHADE)
LIGHT = dict(bg=CREAM, body=INK, flap=CORAL, shade=INK_SHADE)  # on light grounds the peel turns coral (cream vanishes on cream)
SCHEMES = [  # the colour exploration: name, ground, bubble, peel, shadow
    ('ink + coral', INK, CORAL, FLAP, CORAL_SHADE),
    ('coral + cream, ink peel', CORAL, '#FFF4EA', INK, '#E9D8C8'),
    ('coral + cream, sun peel', CORAL, '#FFF4EA', '#FFC24B', '#E9D8C8'),
    ('violet + coral', '#5B4CF0', '#FF6B45', '#FFF1E6', '#D24E2C'),
    ('deep teal + coral', '#0D3B3C', CORAL, FLAP, CORAL_SHADE),
    ('cream + ink, coral peel', CREAM, INK, CORAL, INK_SHADE),
    ('sun + ink', '#FFC24B', INK, '#FFF4EA', INK_SHADE),
    ('plum + periwinkle', '#2A1F3D', '#8B8FF0', '#FFE3D4', '#6C70D8'),
    ('coral + ink', CORAL, INK, FLAP, INK_SHADE),
]
FINAL_INDEX = 8
_ids = itertools.count(1)


def _uid(p):
    return f'{p}{next(_ids)}'


# ---------------------------------------------------------------- geometry (unit circle at the origin, y down)
U = np.array([math.cos(math.radians(-45)), math.sin(math.radians(-45))])  # towards the peeled corner (upper right)


def _arc(a0, a1, n=240, r=1.0):
    a = np.radians(np.linspace(a0, a1, n))
    return np.stack([r * np.cos(a), r * np.sin(a)], 1)


def _quad(p0, c, p1, n=40):
    t = np.linspace(0, 1, n)[:, None]
    return (1 - t) ** 2 * p0 + 2 * (1 - t) * t * c + t ** 2 * p1


def bubble_poly(tail=(118, 152, 135, 1.45)):
    """The bubble exactly as picked in round 6: the unit circle and a straight tail between two angles, its tip at
    (angle, distance)."""
    a_in, a_out, a_tip, L = tail
    tip = np.array([L * math.cos(math.radians(a_tip)), L * math.sin(math.radians(a_tip))])
    ring = _arc(a_out, a_in + 360, 720)  # from the tail's outer root round the top to its inner root
    return np.concatenate([ring, [tip]])


def clip_half(poly, u, d, keep_below=True):
    """Clip a polygon by the half-plane p.u <= d (Sutherland-Hodgman)."""
    out = []
    n = len(poly)
    for i in range(n):
        p, q = poly[i], poly[(i + 1) % n]
        fp, fq = np.dot(p, u) - d, np.dot(q, u) - d
        if not keep_below:
            fp, fq = -fp, -fq
        if fp <= 0:
            out.append(p)
        if fp * fq < 0:
            t = fp / (fp - fq)
            out.append(p + t * (q - p))
    return np.array(out)


def mirror(poly, u, d):
    """Reflect points over the line p.u = d."""
    k = (poly @ u - d)[:, None]
    return poly - 2 * k * u


def peel_shapes(depth=0.56, tail=(118, 152, 135, 1.45)):
    """The body (the bubble minus the cap beyond the fold) and the flap (that cap, folded over)."""
    bub = bubble_poly(tail)
    body = clip_half(bub, U, depth, True)
    circle = _arc(0, 360, 720)
    cap = clip_half(circle, U, depth, False)
    flap = mirror(cap, U, depth)
    return body, flap


def _xf(poly, s, cx, cy):
    return poly * s + np.array([cx, cy])


def mark(s=330, cx=500, cy=500, body=CORAL, flap=FLAP, shade=None, depth=0.56, fold_shadow=0.05):
    """The mark at scale s (the bubble's radius in px), its bubble centred on (cx, cy)."""
    b, f = peel_shapes(depth)
    B, F = _xf(b, s, cx, cy), _xf(f, s, cx, cy)
    out = f'<path d="{poly_d(B, close=True)}" fill="{body}"/>'
    if shade:
        cid = _uid('pc')
        sh = F - U * fold_shadow * s  # the flap's shadow on the body, a crisp sliver along its curved edge
        out += (f'<defs><clipPath id="{cid}"><path d="{poly_d(B, close=True)}"/></clipPath></defs>'
                f'<g clip-path="url(#{cid})"><path d="{poly_d(sh, close=True)}" fill="{shade}"/></g>')
    out += f'<path d="{poly_d(F, close=True)}" fill="{flap}"/>'
    return out


def mark_mono(col, s=330, cx=500, cy=500, depth=0.56, gap=0.085):
    """One colour: the body and the flap, parted by a gap along the flap's edge; real knock-outs."""
    b, f = peel_shapes(depth)
    B, F = _xf(b, s, cx, cy), _xf(f, s, cx, cy)
    mid = _uid('pm')
    g = gap * s
    m = (f'<mask id="{mid}" maskUnits="userSpaceOnUse" x="-2000" y="-2000" width="6000" height="6000">'
         f'<path d="{poly_d(B, close=True)}" fill="white"/>'
         f'<path d="{poly_d(F, close=True)}" fill="black" stroke="black" stroke-width="{g:.1f}" stroke-linejoin="round"/>'
         f'<path d="{poly_d(F, close=True)}" fill="white"/></mask>')
    return f'<defs>{m}</defs><rect x="-2000" y="-2000" width="6000" height="6000" fill="{col}" mask="url(#{mid})"/>'


def bbox(depth=0.56):
    b, f = peel_shapes(depth)
    pts = np.concatenate([b, f])
    return pts.min(0), pts.max(0)


def placed(size, fill_frac, **kw):
    """Centre the mark's bounding box in a square of side size, the box filling fill_frac of it; a hair of optical
    lift (the tail is light, the body heavy)."""
    lo, hi = bbox(kw.get('depth', 0.56))
    span = max(hi - lo)
    s = fill_frac * size / span
    c = (lo + hi) / 2
    cx, cy = size / 2 - c[0] * s, size / 2 - c[1] * s
    return s, cx, cy


# ---------------------------------------------------------------- the assets
def avatar(size=1000, shadow=True, sc=FINAL, fill=0.60):
    s, cx, cy = placed(size, fill)
    return svg_doc(size, size, f'<rect width="{size}" height="{size}" fill="{sc["bg"]}"/>' +
                   mark(s, cx, cy, sc['body'], sc['flap'], sc['shade'] if shadow else None))


def mark_svg(size=1000, shadow=True, sc=FINAL, fill=0.86):
    s, cx, cy = placed(size, fill)
    return svg_doc(size, size, mark(s, cx, cy, sc['body'], sc['flap'], sc['shade'] if shadow else None))


def mono_svg(col, size=1000, fill=0.86, bg=None):
    s, cx, cy = placed(size, fill)
    return svg_doc(size, size, mark_mono(col, s, cx, cy), bg=bg)


def end_card(w=1080, h=1920, shadow=True, sc=FINAL):
    s, cx, cy = placed(w, 0.42)
    return svg_doc(w, h, f'<rect width="{w}" height="{h}" fill="{sc["bg"]}"/>' +
                   mark(s, cx, cy + (h - w) / 2, sc['body'], sc['flap'], sc['shade'] if shadow else None))


def banner(w=2560, h=1440, shadow=True, sc=FINAL):
    # YouTube: the safe area is the central 1546 x 423; the mark sits in it
    s, cx, cy = placed(423, 0.80)
    ox, oy = (w - 423) / 2, (h - 423) / 2
    return svg_doc(w, h, f'<rect width="{w}" height="{h}" fill="{sc["bg"]}"/>' +
                   mark(s, cx + ox, cy + oy, sc['body'], sc['flap'], sc['shade'] if shadow else None))


def render(svg, out_png, width, height=None, transparent=False):
    """Rasterise an SVG with the pre-installed Chromium at its own size."""
    tmp = tempfile.mkdtemp(prefix='peel_')
    sp = os.path.join(tmp, 'a.svg')
    with open(sp, 'w') as f:
        f.write(svg)
    hp = os.path.join(tmp, 'a.html')
    with open(hp, 'w') as f:
        bg = 'transparent' if transparent else '#fff'
        f.write(f'<html><body style="margin:0;background:{bg}"><img src="a.svg" width="{width}" height="{height or width}" '
                f'style="display:block"></body></html>')
    subprocess.run(['node', os.path.join(HERE, 'render.cjs'), hp, out_png, str(width), '1', '1',
                    '1' if transparent else '0'], check=True, env={**os.environ})
    from PIL import Image
    im = Image.open(out_png)
    im.crop((0, 0, width, height or width)).save(out_png)


def write_pack(shadow=True):
    os.makedirs(SVG_DIR, exist_ok=True)
    os.makedirs(PACK, exist_ok=True)
    files = {
        'peel_avatar.svg': avatar(shadow=shadow),
        'peel_avatar_on_dark.svg': avatar(shadow=shadow, sc=ON_DARK),
        'peel_mark.svg': mark_svg(shadow=shadow, sc=LIGHT),
        'peel_avatar_on_light.svg': avatar(shadow=shadow, sc=LIGHT),
        'peel_mark_on_dark.svg': mark_svg(shadow=shadow, sc=ON_DARK),
        'peel_one_colour_ink.svg': mono_svg(INK),
        'peel_one_colour_white.svg': mono_svg(WHITE),
        'peel_end_card.svg': end_card(shadow=shadow),
        'peel_banner.svg': banner(shadow=shadow),
    }
    for n, s in files.items():
        with open(os.path.join(SVG_DIR, n), 'w') as f:
            f.write(s)
    render(files['peel_avatar.svg'].replace('width="1000" height="1000"', 'width="1080" height="1080"', 1),
           os.path.join(PACK, 'peel_avatar_1080.png'), 1080)
    render(files['peel_end_card.svg'], os.path.join(PACK, 'peel_end_card_1080x1920.png'), 1080, 1920)
    render(files['peel_banner.svg'], os.path.join(PACK, 'peel_banner_2560x1440.png'), 2560, 1440)
    render(mono_svg(WHITE).replace('width="1000" height="1000"', 'width="512" height="512"', 1),
           os.path.join(PACK, 'peel_watermark_white_512.png'), 512, transparent=True)
    render(mark_svg(shadow=shadow, sc=LIGHT).replace('width="1000" height="1000"', 'width="1024" height="1024"', 1),
           os.path.join(PACK, 'peel_mark_1024.png'), 1024, transparent=True)
    render(mark_svg(shadow=shadow, sc=ON_DARK).replace('width="1000" height="1000"', 'width="1024" height="1024"', 1),
           os.path.join(PACK, 'peel_mark_on_dark_1024.png'), 1024, transparent=True)
    return files


def _sized(svg, px, radius='50%'):
    s = svg.replace('width="1000" height="1000"', f'width="{px}" height="{px}"', 1)
    return f'<div style="border-radius:{radius};overflow:hidden;width:{px}px;height:{px}px;flex:none">{s}</div>'


def build_sheet(out=None):
    """The final sheet: the logo, why these colours (the exploration), and where it lives."""
    out = out or os.path.join(VIDEO, 'deliverables', 'brand', 'logo_final.png')
    F = avatar()
    s6, cx6, cy6 = placed(1000, 0.86)
    on_light = avatar(sc=LIGHT)
    on_dark = avatar(sc=ON_DARK)
    mono_ink = svg_doc(1000, 1000, '<rect width="1000" height="1000" fill="#FFFFFF"/>' + mark_mono(INK, *placed(1000, 0.60)))
    mono_wht = svg_doc(1000, 1000, f'<rect width="1000" height="1000" fill="{INK}"/>' + mark_mono(WHITE, *placed(1000, 0.60)))
    wm = svg_doc(1000, 1000, mark_mono(WHITE, *placed(1000, 0.86)))
    ec = end_card().replace('width="1080" height="1920"', 'width="180" height="320"', 1)
    bn = banner().replace('width="2560" height="1440"', 'width="480" height="270"', 1)
    grid = ''.join(f'<div class="cell"><img src="file://{c}"/></div>' for c in COVERS)
    explo = ''
    for i, (name, bg, body, flap, shade) in enumerate(SCHEMES):
        sv = svg_doc(1000, 1000, f'<rect width="1000" height="1000" fill="{bg}"/>' + mark(*placed(1000, 0.60), body, flap, shade))
        ring = 'box-shadow:0 0 0 5px #FAF7F3,0 0 0 9px #1F1630;' if i == FINAL_INDEX else ''
        explo += (f'<div class="ex"><div style="border-radius:50%;{ring}">{_sized(sv, 118)}</div>'
                  f'<div class="exl">{"<b>" if i == FINAL_INDEX else ""}{name}{"</b>" if i == FINAL_INDEX else ""}</div></div>')

    def apps(av):
        return (f'<div class="app light">{_sized(av, 110)}{_sized(av, 40)}<span>110 \u00b7 40 px</span></div>'
                f'<div class="app dark">{_sized(av, 110)}{_sized(av, 40)}<span>110 \u00b7 40 px</span></div>')
    html = f'''<!doctype html><html><head><meta charset="utf-8"><style>
body{{margin:0;background:#FAF7F3;color:#1F1630;font-family:Inter,system-ui,sans-serif;width:1800px}}
header{{padding:66px 80px 30px}}.kick{{font-size:15px;letter-spacing:.32em;text-transform:uppercase;color:#9A7F6B}}
h1{{font-size:52px;font-weight:650;margin:10px 0 10px;letter-spacing:-.02em}}
header p{{font-size:20px;color:#5E5560;margin:0;max-width:1500px;line-height:1.45}} header q{{color:#1F1630;font-weight:600}}
section{{padding:40px 80px;border-top:1px solid #E9E1D8}} h2{{font-size:30px;font-weight:650;margin:0 0 6px}}
.sub{{font-size:17px;color:#5E5560;margin:0 0 22px;line-height:1.45;max-width:1500px}}
.row{{display:flex;gap:22px;align-items:flex-start}} .card{{display:flex;flex-direction:column;gap:12px}}
.lab{{font-size:15px;color:#5E5560}}
.ex{{display:flex;flex-direction:column;align-items:center;gap:10px;width:150px}} .exl{{font-size:13px;color:#5E5560;text-align:center}}
.app{{width:250px;height:150px;border-radius:18px;display:flex;align-items:center;justify-content:center;gap:20px;position:relative}}
.app.light{{background:#fff;box-shadow:inset 0 0 0 1px #E9E1D8}}.app.dark{{background:#000}}
.app span{{position:absolute;left:12px;bottom:8px;font-size:12px;color:#9A8F95}}
.tile{{position:relative;border-radius:18px;overflow:hidden;box-shadow:inset 0 0 0 1px #E9E1D8}}
.tile span{{position:absolute;left:12px;bottom:8px;font-size:12px;color:#fff;text-shadow:0 1px 3px rgba(0,0,0,.5)}}
.phone{{width:330px;background:#fff;border-radius:40px;padding:14px 0 0;box-shadow:0 0 0 9px #1F1630,0 20px 50px rgba(31,22,48,.25);overflow:hidden;font-size:13px;color:#111}}
.sb{{display:flex;justify-content:space-between;padding:4px 26px 8px;font-size:14px}}
.top{{display:flex;justify-content:space-between;padding:6px 16px 10px;font-size:17px}}
.prow{{display:flex;align-items:center;padding:4px 16px 10px}}.prow>div:first-child{{margin-right:20px}}
.stat{{flex:1;display:flex;flex-direction:column;align-items:center;font-size:12px}}.stat b{{font-size:16px}}
.bio{{padding:0 16px 10px;line-height:1.35}}.cat{{color:#737373}}
.grid{{display:grid;grid-template-columns:repeat(3,1fr);gap:2px}}.cell{{aspect-ratio:3/4;overflow:hidden}}
.cell img{{width:100%;height:100%;object-fit:cover;object-position:50% 30%}}
footer{{padding:28px 80px 56px;border-top:1px solid #E9E1D8;font-size:15px;color:#8E8590;line-height:1.55}}
</style></head><body>
<header><div class="kick">What\u2019s All the Fuss About? \u00b7 studio logo \u00b7 final</div>
<h1>The Peel, final</h1>
<p>Your note: <q>Maybe just play with color schemes \u2014 Okay pick one and give me the final one</q>. The pick: a coral
ground, an ink bubble, the cream peel, with the fold shadow. The same three colours you said yes to, flipped so the
logo holds on a light app and a dark one alike (the ink ground vanished in dark mode), with the boldest silhouette at
40 px.</p></header>
<section><div class="row" style="gap:60px;align-items:center">
 <div class="card"><div style="box-shadow:0 26px 60px rgba(31,22,48,.20);border-radius:50%">{_sized(F, 460)}</div></div>
 <div class="card" style="gap:18px">
  <div class="row">{apps(F)}</div>
  <div class="row">
   <div class="card">{_sized(on_light, 150)}<div class="lab">on light</div></div>
   <div class="card">{_sized(on_dark, 150)}<div class="lab">on dark</div></div>
   <div class="card">{_sized(mono_ink, 150, '16px')}<div class="lab">one colour</div></div>
   <div class="card">{_sized(mono_wht, 150, '16px')}<div class="lab">white</div></div>
  </div></div></div></section>
<section><h2>The colours I tried</h2><p class="sub">Nine schemes at real sizes on light and dark apps. A dark ground disappears
in dark mode; a coral ground holds on both, and the ink bubble on it is the clearest shape at 40 px.</p>
<div class="row" style="gap:14px">{explo}</div></section>
<section><h2>Where it lives</h2><p class="sub">The profile, the corner of a cover, a watermark on a frame, an end-card still, a banner
(the mark in YouTube\u2019s safe area). Stills only.</p>
<div class="row">
 <div class="phone"><div class="sb"><b>9:41</b><span>\u25cf\u25cf\u25cf \u25ae</span></div><div class="top"><b>what.the.fuss.is.about</b><span>\u2630</span></div>
  <div class="prow">{_sized(F, 86)}<div class="stat"><b>3</b><span>posts</span></div><div class="stat"><b>\u2013</b><span>followers</span></div><div class="stat"><b>\u2013</b><span>following</span></div></div>
  <div class="bio"><b>What\u2019s All the Fuss About?</b><br><span class="cat">Education</span><br>You\u2019ve heard about it. Now actually understand it.</div><div class="grid">{grid}</div></div>
 <div class="card"><div class="tile" style="width:250px;height:250px"><img src="file://{COVERS[1]}" style="width:100%;height:100%;object-fit:cover;object-position:50% 46%"/>
   <div style="position:absolute;right:12px;top:12px">{_sized(F, 48)}</div><span>cover corner</span></div>
  <div class="tile" style="width:250px;height:250px"><img src="file://{COVERS[0]}" style="width:100%;height:100%;object-fit:cover;object-position:50% 78%"/>
   <div style="position:absolute;left:14px;top:12px;width:56px;height:56px">{wm.replace('width="1000" height="1000"', 'width="56" height="56"', 1)}</div><span>watermark</span></div></div>
 <div class="card"><div class="tile" style="width:180px;height:320px">{ec}</div><div class="lab">end card (1080 \u00d7 1920)</div></div>
 <div class="card"><div class="tile" style="width:480px;height:270px">{bn}</div><div class="lab">banner (2560 \u00d7 1440)</div></div>
</div></section>
<footer>The export pack: video/deliverables/brand/peel/ \u2014 peel_avatar_1080.png (upload this as the profile picture on
Instagram, TikTok and YouTube), peel_mark_1024.png and peel_mark_on_dark_1024.png (transparent), peel_watermark_white_512.png
(transparent), peel_end_card_1080x1920.png, peel_banner_2560x1440.png; vectors in video/brand/logo/svg/peel/. Coral
#F0643C, ink #1F1630, peel #F8ECE0, the fold shadow #0C0716; on light the peel turns coral, on dark the bubble turns coral.</footer>
</body></html>'''
    tmp = tempfile.mkdtemp(prefix='peel_final_')
    hp = os.path.join(tmp, 'sheet.html')
    with open(hp, 'w') as f:
        f.write(html)
    subprocess.run(['node', os.path.join(HERE, 'render.cjs'), hp, out, '1800', '1'], check=True)
    return out


if __name__ == '__main__':
    files = write_pack()
    out = build_sheet()
    print(f'{len(files)} svgs -> {SVG_DIR}; pngs -> {PACK}; sheet -> {out}')
