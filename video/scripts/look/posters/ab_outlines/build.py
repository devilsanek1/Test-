#!/usr/bin/env python3
"""Build the owner's A vs B picture: docs/studies/2026-10-28_city_posters/img/AB_outlines.jpg.

    python3 video/scripts/look/posters/ab_outlines/build.py

Writes the scene SVGs (scene.py: one geometry, modes A / B / B0) and page.html next to this script, cuts the two real
reference crops (v2's G7 master at 13.6 s with ffmpeg; the Reykjavik poster with Pillow) into the same folder, renders
the page with the pre-installed Chromium (render.cjs, Playwright) to /tmp/posters-ab/page.png and saves the JPEG (q90).
"""
from __future__ import annotations

import os
import subprocess
import sys

from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import scene  # noqa: E402

VIDEO = os.path.abspath(os.path.join(HERE, '..', '..', '..', '..'))  # <repo>/video
OUT_JPG = os.path.join(VIDEO, 'docs/studies/2026-10-28_city_posters/img/AB_outlines.jpg')
MASTER = os.path.join(VIDEO, 'deliverables/v2/v2r_G7_master_v1.mp4')
POSTER = os.path.join(VIDEO, 'docs/look/poster_refs/02_reykjavik.jpg')
SCRATCH = '/tmp/posters-ab'

PAGE_W = 1800
COL_W = 860  # each column: 1800 = 2 x 860 + 3 x 26 (gutters) + 2

INK = '#2B1B0A'
PAPER = '#FBF3E6'
RULE = '#E6D3B5'

# ---------------------------------------------------------------------------------------- the reference crops
V2_T = 13.6  # S3 "her window": her lit French window (tier A, the 3 px outline) and Pip (its thin line)
V2_BOX = (226, 632, 664, 924)  # x0, y0, x1, y1 in the 1080 x 1920 frame
RVK_BOX = (0, 1232, 560, 1522)  # Reykjavik's houses (clear of ui_mask.json's boxes)


def crops():
    os.makedirs(SCRATCH, exist_ok=True)
    frame = os.path.join(SCRATCH, f'v2_t{V2_T}.png')
    subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-ss', str(V2_T), '-i', MASTER, '-frames:v', '1', frame],
                   check=True)
    im = Image.open(frame).convert('RGB').crop(V2_BOX)
    im = im.resize((COL_W, round(COL_W * im.height / im.width)), Image.LANCZOS)
    im.save(os.path.join(HERE, 'ref_v2_S3_t13.6.jpg'), quality=90)
    pr = Image.open(POSTER).convert('RGB').crop(RVK_BOX)
    pr = pr.resize((COL_W, round(COL_W * pr.height / pr.width)), Image.LANCZOS)
    pr.save(os.path.join(HERE, 'ref_reykjavik.jpg'), quality=90)
    return im.size, pr.size


# ---------------------------------------------------------------------------------------- markers on the close-ups
def zoom_xy(wx, wy, w_px=COL_W):
    x, y, w, h = scene.VIEW_ZOOM
    s = w_px / w
    return (wx - x) * s, (wy - y) * s


def markers(items, w_px, h_px):
    """Numbered markers: a short leader from the badge to the exact point. items: (n, (wx, wy), (dx, dy))."""
    out = [f'<svg class="ov" width="{w_px}" height="{h_px}" viewBox="0 0 {w_px} {h_px}">']
    for n, (wx, wy), (dx, dy) in items:
        tx, ty = zoom_xy(wx, wy, w_px)
        bx, by = tx + dx, ty + dy
        out.append(f'<line x1="{bx:.1f}" y1="{by:.1f}" x2="{tx:.1f}" y2="{ty:.1f}" stroke="{INK}" stroke-width="5" '
                   f'stroke-linecap="round"/>')
        out.append(f'<circle cx="{tx:.1f}" cy="{ty:.1f}" r="7" fill="{INK}"/>')
        out.append(f'<circle cx="{bx:.1f}" cy="{by:.1f}" r="30" fill="#FFFFFF" stroke="{INK}" stroke-width="5"/>')
        out.append(f'<text x="{bx:.1f}" y="{by + 13:.1f}" text-anchor="middle" font-size="38" font-weight="800" '
                   f'fill="{INK}">{n}</text>')
    out.append('</svg>')
    return ''.join(out)


# ---------------------------------------------------------------------------------------- the page
def page(v2_size, rvk_size):
    pw, ph = scene.VIEW_PANEL[2], scene.VIEW_PANEL[3]
    panel_h = round(COL_W * ph / pw)
    zw, zh = scene.VIEW_ZOOM[2], scene.VIEW_ZOOM[3]
    zoom_h = round(COL_W * zh / zw)
    inset_w = 560
    inset_h = round(inset_w * zh / zw)
    fx1 = scene.FX1 + scene.WFR  # the frame's outer right edge
    pip_head = (scene.PIP['x'] - 41, scene.PIP['y'] - 66)
    bay_edge = (438, 1010)  # the bay's front (lit) meets its face turned from the sun (shaded)
    a_marks = markers([(1, (fx1, 738), (88, -34)), (2, (pip_head[0], pip_head[1]), (-72, -70))], COL_W, zoom_h)
    b_marks = markers([(1, (fx1 + 9, 738), (88, -34)), (2, (pip_head[0] + 74, pip_head[1] + 40), (30, -185)),
                       (3, bay_edge, (-150, 70))], COL_W, zoom_h)
    css = f'''
    @font-face {{ font-family: InterL; src: url('file:///usr/share/fonts/opentype/inter/Inter-Regular.otf'); font-weight: 400; }}
    @font-face {{ font-family: InterL; src: url('file:///usr/share/fonts/opentype/inter/Inter-SemiBold.otf'); font-weight: 600; }}
    @font-face {{ font-family: InterL; src: url('file:///usr/share/fonts/opentype/inter/Inter-Bold.otf'); font-weight: 700; }}
    @font-face {{ font-family: InterL; src: url('file:///usr/share/fonts/opentype/inter/Inter-ExtraBold.otf'); font-weight: 800; }}
    * {{ box-sizing: border-box; margin: 0; padding: 0; }}
    html, body {{ background: {PAPER}; }}
    body {{ width: {PAGE_W}px; font-family: InterL, Inter, sans-serif; color: {INK}; padding: 44px 26px 54px; }}
    h1 {{ font-size: 70px; line-height: 1.08; font-weight: 800; letter-spacing: -0.5px; }}
    .sub {{ font-size: 42px; line-height: 1.3; margin-top: 14px; font-weight: 400; }}
    .row {{ display: flex; gap: 28px; margin-top: 34px; }}
    .col {{ width: {COL_W}px; position: relative; }}
    .tag {{ font-size: 54px; line-height: 1.1; font-weight: 800; }}
    .tag2 {{ font-size: 42px; line-height: 1.25; font-weight: 600; margin-top: 6px; min-height: 106px; }}
    .pic {{ display: block; width: {COL_W}px; border-radius: 18px; overflow: hidden; position: relative; }}
    .pic img {{ display: block; width: 100%; }}
    .ov {{ position: absolute; left: 0; top: 0; font-family: InterL, Inter, sans-serif; }}
    h2 {{ font-size: 52px; line-height: 1.15; font-weight: 800; margin-top: 44px; padding-top: 32px;
          border-top: 4px solid {RULE}; }}
    .legend {{ font-size: 42px; line-height: 1.28; margin-top: 16px; font-weight: 600; }}
    .legend div {{ display: flex; gap: 16px; margin-top: 8px; }}
    .legend b {{ display: inline-flex; width: 52px; height: 52px; flex: 0 0 52px; border-radius: 26px;
                 border: 4px solid {INK}; justify-content: center; align-items: center; font-size: 32px; font-weight: 800;
                 background: #fff; }}
    .cap {{ font-size: 42px; line-height: 1.26; margin-top: 14px; font-weight: 600; }}
    .why {{ display: flex; gap: 40px; margin-top: 30px; align-items: flex-start; }}
    .why .txt {{ font-size: 44px; line-height: 1.32; font-weight: 400; width: {PAGE_W - 52 - inset_w - 40}px; }}
    .why .txt p + p {{ margin-top: 22px; }}
    .bottom {{ margin-top: 48px; padding: 38px 44px; background: #F1E4D2; border-radius: 22px; font-size: 50px;
               line-height: 1.3; font-weight: 700; }}
    .bottom p + p {{ margin-top: 18px; }}
    '''
    return f'''<!doctype html>
<html><head><meta charset="utf-8"><title>A vs B: outlines</title><style>{css}</style></head>
<body>
  <h1>A vs B: outlines, or edges made by light and shade</h1>
  <div class="sub">Our own canal street from One Small Window: same shapes, same colours, same low sun on the left.
    Only the edges, and the light and shade they need, change.</div>

  <div class="row">
    <div class="col">
      <div class="tag">A: our line today (outlines)</div>
      <div class="tag2">a line round the main object, thin lines on Pip and people</div>
      <div class="pic"><img src="scene_A.svg" width="{COL_W}" height="{panel_h}"></div>
    </div>
    <div class="col">
      <div class="tag">B: the posters' way</div>
      <div class="tag2">no outlines: edges from light and shade</div>
      <div class="pic"><img src="scene_B.svg" width="{COL_W}" height="{panel_h}"></div>
    </div>
  </div>

  <h2>Up close: the same corner</h2>
  <div class="row" style="margin-top: 30px">
    <div class="col">
      <div class="tag" style="font-size: 46px">A</div>
      <div class="pic" style="margin-top: 10px"><img src="zoom_A.svg" width="{COL_W}" height="{zoom_h}">{a_marks}</div>
      <div class="legend">
        <div><b>1</b><span>an outline round her window (3 px, in its own dark teal)</span></div>
        <div><b>2</b><span>a thin line round Pip (and people)</span></div>
      </div>
    </div>
    <div class="col">
      <div class="tag" style="font-size: 46px">B</div>
      <div class="pic" style="margin-top: 10px"><img src="zoom_B.svg" width="{COL_W}" height="{zoom_h}">{b_marks}</div>
      <div class="legend">
        <div><b>1</b><span>no line: teal against brick, and the frame's shadow</span></div>
        <div><b>2</b><span>no line: Pip's shaded side keeps head and body apart</span></div>
        <div><b>3</b><span>the bay: a lit side next to a shaded side</span></div>
      </div>
    </div>
  </div>

  <h2>Why B needs its light and shade</h2>
  <div class="why">
    <div style="width: {inset_w}px">
      <div class="pic" style="width: {inset_w}px"><img src="zoom_B0.svg" width="{inset_w}" height="{inset_h}"></div>
      <div class="cap">B without the shade faces</div>
    </div>
    <div class="txt">
      <p>Take the light and shade away as well, and shapes of one colour run together: the bay window goes flat, Pip's
        head sinks into its body.</p>
      <p>Every edge needs a line (A) or a step of light and shade (B). The posters choose the step, which is why they
        look so crisp.</p>
    </div>
  </div>

  <h2>In our film, and in the posters</h2>
  <div class="row" style="margin-top: 30px">
    <div class="col">
      <div class="pic"><img src="ref_v2_S3_t13.6.jpg" width="{v2_size[0]}" height="{v2_size[1]}"></div>
      <div class="cap">One Small Window, 13.6 s: the outline round her window</div>
    </div>
    <div class="col">
      <div class="pic"><img src="ref_reykjavik.jpg" width="{rvk_size[0]}" height="{rvk_size[1]}"></div>
      <div class="cap">Reykjavik poster: no outlines; each house a lit side and a shaded side, thin bars only on the
        windows</div>
    </div>
  </div>

  <div class="bottom">
    <p>A draws a line round the main things.</p>
    <p>B draws no outlines: every shape is a lit side next to a shaded side, and only tiny things (window bars,
      railings) stay thin lines.</p>
  </div>
</body></html>
'''


def main():
    os.makedirs(SCRATCH, exist_ok=True)
    for m in ('A', 'B'):
        open(os.path.join(HERE, f'scene_{m}.svg'), 'w').write(scene.view_svg(m, scene.VIEW_PANEL, COL_W))
    for m in ('A', 'B', 'B0'):
        open(os.path.join(HERE, f'zoom_{m}.svg'), 'w').write(scene.view_svg(m, scene.VIEW_ZOOM, COL_W))
    v2_size, rvk_size = crops()
    html = os.path.join(HERE, 'page.html')
    open(html, 'w').write(page(v2_size, rvk_size))
    png = os.path.join(SCRATCH, 'page.png')
    subprocess.run(['node', os.path.join(HERE, 'render.cjs'), html, png, str(PAGE_W), 'full', '1'], check=True)
    im = Image.open(png).convert('RGB')
    os.makedirs(os.path.dirname(OUT_JPG), exist_ok=True)
    im.save(OUT_JPG, quality=90, optimize=True)
    print(OUT_JPG, im.size, os.path.getsize(OUT_JPG) // 1024, 'KB')


if __name__ == '__main__':
    main()
