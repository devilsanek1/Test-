"""The comparison sheet: each library's cumulus and tree crown beside our v6 piece and a reference crop, at full size
(1:1 in the 1080 x 1920 frame) and at phone width (the frame shown 400 px wide), plus the whole still at 400 px with
each library's two pieces swapped in. Writes /home/user/Test-/video/docs/look/organic/libraries_sheet.png"""
import json, sys, numpy as np
from PIL import Image, ImageDraw, ImageFont
sys.path.insert(0, '/tmp/organic/libraries/src')
import context as CX
L = '/tmp/organic/libraries'
OUT = '/home/user/Test-/video/docs/look/organic/libraries_sheet.png'
R = '/home/user/Test-/video/docs/look/'
FB = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 22)
FR = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 17)
FS = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 15)
TERRA = (185, 128, 106)
SKY = Image.open(f'{L}/inputs/cloud_sky_v6.png').convert('RGBA')
PHONE = 400 / 1080          # our frame at phone width
PHONE_REF = 400 / 1206      # the owner's screenshots fill the same width


def p5_rgba(path, bg):
    """p5.brush paints on an opaque ground: its layer = where it differs from that ground."""
    im = np.asarray(Image.open(path).convert('RGB')).astype(np.int16)
    g = np.asarray(bg.convert('RGB')).astype(np.int16) if isinstance(bg, Image.Image) else np.array(bg, np.int16)
    a = np.clip((np.abs(im - g).max(-1) - 3) / 10.0, 0, 1)
    return Image.fromarray(np.dstack([im.astype(np.uint8), (a * 255).astype(np.uint8)]), 'RGBA')


COLS = [  # key, header lines, cloud source, tree source
    ('ref', ['Reference crop', "owner's model 02", '(learn the method, never copy)'], None, None),
    ('v6', ['v6, our painter today', 'paint.py v6 recipes', 'cloud 1.7 s, tree 1.6 s'], f'{L}/inputs/cloud_v6.png', f'{L}/inputs/tree_v6.png'),
    ('mypaint', ['MyPaint engine', 'peinten (MIT, libmypaint ISC port)', '+ CC0 brushes; ~1 s, Node'], f'{L}/out/mypaint/cloud.png', f'{L}/out/mypaint/tree.png'),
    ('stack', ['MyPaint + FastNoiseLite', 'warped design -> brushes', '-> lost/found; ~1.3 s'], f'{L}/out/stack/cloud.png', f'{L}/out/stack/tree.png'),
    ('skia', ['Skia (CanvasKit, BSD-3)', '+ SkSL + perfect-freehand', '(MIT); ~1.5 s, Node'], f'{L}/out/skia/cloud.png', f'{L}/out/skia/tree.png'),
    ('noise', ['FastNoiseLite (MIT)', 'warp + lost/found pass', 'on v6; 0.3 s, Python'], f'{L}/out/noise/cloud.png', f'{L}/out/noise/tree.png'),
    ('p5', ['p5.brush (MIT)', 'watercolour fills + marker', 'strokes; 60-90 s CPU WebGL'], 'P5', 'P5'),
    ('opencv', ['OpenCV xphoto (Apache-2)', 'oilPainting on v6', '(a filter); 0.02 s'], f'{L}/out/opencv/cloud_v6_oil_painting.png', f'{L}/out/opencv/tree_v6_oil_painting.png'),
]


def tile(key, subject, src):
    if key == 'ref':
        if subject == 'cloud':
            return Image.open(f'{R}refs_human_scale/02_bus_stop_night.jpg').convert('RGB').crop((420, 0, 940, 345)), PHONE_REF
        return Image.open(f'{R}refs_human_scale/02_bus_stop_night.jpg').convert('RGB').crop((0, 200, 420, 350)), PHONE_REF
    if src == 'P5':
        return Image.open(f'{L}/out/p5brush/final_{subject}.png').convert('RGB'), PHONE
    piece = Image.open(src).convert('RGBA')
    bg = SKY.copy() if subject == 'cloud' else Image.new('RGBA', piece.size, TERRA + (255,))
    bg.alpha_composite(piece)
    return bg.convert('RGB'), PHONE


def in_context(key, cloud, tree):
    if key == 'ref':
        a = Image.open(f'{R}refs_human_scale/02_bus_stop_night.jpg').convert('RGB')
        b = Image.open(f'{R}refs_human_scale/03_beach_dusk.jpg').convert('RGB')
        a = a.resize((400, round(a.height * 400 / a.width)), Image.LANCZOS)
        b = b.resize((400, round(b.height * 400 / b.width)), Image.LANCZOS)
        im = Image.new('RGB', (400, 711), (255, 255, 255)); im.paste(a, (0, 0)); im.paste(b, (0, a.height + 12)); return im
    if cloud == 'P5':
        c = Image.open(f'{L}/out/p5brush/final_cloud.png').convert('RGBA')          # painted on the same sky crop
        t = p5_rgba(f'{L}/out/p5brush/final_tree.png', TERRA)
        c.save(f'{L}/out/p5brush/final_cloud_rgba.png'); t.save(f'{L}/out/p5brush/final_tree_rgba.png')
        cloud, tree = f'{L}/out/p5brush/final_cloud_rgba.png', f'{L}/out/p5brush/final_tree_rgba.png'
    full = CX.compose(cloud, tree)
    full.save(f'{L}/out/context_{key}.png')
    return full.resize((400, 711), Image.LANCZOS)


METRICS = {}


def build():
    import metrics as MT
    for k, _, c, t in COLS:
        for subject, src in (('cloud', c), ('tree', t)):
            if src and src != 'P5':
                METRICS[(k, subject)] = MT.measure(src)
            elif src == 'P5':
                bg = SKY if subject == 'cloud' else TERRA
                rg = p5_rgba(f'{L}/out/p5brush/final_{subject}.png', bg)
                rg.save(f'{L}/out/p5brush/final_{subject}_layer.png')
                METRICS[(k, subject)] = MT.measure(f'{L}/out/p5brush/final_{subject}_layer.png')
    json.dump({f'{k}/{s_}': v for (k, s_), v in METRICS.items()}, open(f'{L}/out/metrics.json', 'w'), indent=1)
    G, PAD, HEAD = 14, 30, 96
    rows = []
    for subject in ['cloud', 'tree']:
        tiles = [tile(k, subject, c if subject == 'cloud' else t) for k, _, c, t in COLS]
        rows.append((subject, tiles))
    colw = [max(rows[0][1][i][0].width, rows[1][1][i][0].width) for i in range(len(COLS))]
    W = PAD * 2 + 150 + sum(colw) + G * (len(COLS) - 1)
    ctx = [in_context(k, c, t) for k, _, c, t in COLS]
    H = (PAD + 120 + HEAD + rows[0][1][1][0].height + G + 22 + 140 + G * 2 + rows[1][1][1][0].height + G + 22 + 120 + G * 2
         + 40 + 711 + PAD + 60)
    sheet = Image.new('RGB', (W, H), (250, 249, 247)); d = ImageDraw.Draw(sheet)
    d.text((PAD, PAD), 'Libraries on the same test: our designed flats (v6 design stage) painted by each library', fill=(20, 20, 20), font=FB)
    d.text((PAD, PAD + 32), 'Scene 1 (v2, "She quit Google."), the near cumulus (520 x 345) and the near tree (420 x 300). '
           'Rows: full size (1:1 in the 1080 x 1920 frame), then phone width (the frame at 400 px), then the whole still at 400 px '
           'with that column\'s two pieces swapped in.', fill=(60, 60, 60), font=FR)
    d.text((PAD, PAD + 56), 'MyPaint, Skia and p5.brush painted the SAME shared stroke plan (plans/*.json) from the SAME design; FastNoiseLite and OpenCV '
           'process v6\'s own painting. All seeded; MyPaint, Skia, FastNoiseLite, OpenCV byte-identical on a re-run. Under each 1:1 tile: '
           'silhouette on near-perfect arcs / edges crisp-soft-lost / hard internal seams.', fill=(60, 60, 60), font=FR)
    y = PAD + 120
    xs = []; x = PAD + 150
    for i, (k, head, _, _) in enumerate(COLS):
        xs.append(x)
        for j, line in enumerate(head):
            d.text((x, y + j * 24), line, fill=(20, 20, 20) if j == 0 else (80, 80, 80), font=FB if j == 0 else FS)
        x += colw[i] + G
    y += HEAD
    for subject, tiles in rows:
        hfull = max(t[0].height for t in tiles)
        d.text((PAD, y + 10), f'{subject}\n1:1', fill=(20, 20, 20), font=FB)
        for i, (im, sc) in enumerate(tiles):
            sheet.paste(im, (xs[i], y))
            m = METRICS.get((COLS[i][0], subject))
            if m:
                e = m['edges'] or {}
                d.text((xs[i], y + im.height + 4), f"arcs {m['arc_share_pct']:.0f}% | edges {e.get('crisp', 0):.0f}/{e.get('soft', 0):.0f}/{e.get('lost', 0):.0f}% | seams {m['sharp_internal_pct']:.1f}%",
                       fill=(50, 50, 50), font=FS)
        y += hfull + G + 22
        d.text((PAD, y + 10), f'{subject}\nphone', fill=(20, 20, 20), font=FB)
        hs = 0
        for i, (im, sc) in enumerate(tiles):
            sm = im.resize((max(1, round(im.width * sc)), max(1, round(im.height * sc))), Image.LANCZOS)
            sheet.paste(sm, (xs[i], y)); hs = max(hs, sm.height)
        y += hs + G * 2
    d.text((PAD, y), 'In context at phone width (the whole still, 400 px wide; first column: the owner\'s two painting-style models at the same width)',
           fill=(20, 20, 20), font=FB)
    y += 40
    x = PAD + 150
    for i, im in enumerate(ctx):
        sheet.paste(im, (xs[i], y))
    y += 711 + 16
    d.text((PAD, y), 'Not shown: open-watercolor-sim, p5.brush fills alone, cv2.stylization, SLIC facets, MyPaint smudge-only pass, Spectral.js mixing '
           '(libraries_sheet_extra.png). Scratch and code: /tmp/organic/libraries/.', fill=(80, 80, 80), font=FS)
    sheet = sheet.crop((0, 0, W, y + 40))
    sheet.save(OUT, optimize=True)
    print('sheet', sheet.size, OUT)


if __name__ == '__main__':
    build()
