#!/usr/bin/env python3
"""The AI-paint test's img2img INIT images (docs/studies/2026-10-28_city_posters/ai_paint/NOTES.md): OUR design, which
the model only paints. Built from our painter's v4 DESIGN stage (`paint.py --design`: public/paint/v2s1_v4design/ and
the stage render paint_test/stage_v4_design.png), never from the reference images.

  sky plate   768 x 1344 (SDXL-native portrait) = frame rows 0..1890 at one uniform scale (0.7111): the designed dusk sky,
              its 4 cloud planes (far to near), the far city haze (roofs, tower) and the crisp sun disc copied from the
              stage, all in the scene's draw order. The scene covers the sky below y 1100 (water, quay), so those rows
              are a calm mirrored reflection of the sky: context the model can read as "sky over water"; never used.
  tree        768 x 768 = the stage around the tree, x 0..340, y 1215..1555 (scale 2.2588): the designed lit and shade
              masses in their own surroundings. Only the tree's own alpha is kept afterwards.

    python3 scripts/look/aipaint/make_inits.py [outdir]     # default out/aipaint/init
Writes sky_init.png, tree_init.png and geometry.json (the frame <-> plate mapping the cut-out uses).
"""
import json, os, sys
import numpy as np
from PIL import Image, ImageFilter

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
DESIGN = os.path.join(ROOT, 'public/paint/v2s1_v4design')
STAGE = os.path.join(ROOT, 'docs/studies/2026-10-28_city_posters/paint_test/stage_v4_design.png')
FW, FH = 1080, 1920

SKY_PLATE = {'size': [768, 1344], 'frame_rect': [0, 0, 1080, 1890]}   # uniform 768/1080 = 1344/1890
TREE_PLATE = {'size': [768, 768], 'frame_rect': [0, 1215, 340, 340]}
SKY_PIECES = ['sky', 'clouds_p0', 'clouds_p1', 'clouds_p2', 'clouds_p3', 'farroofs', 'fartower']   # draw order
SKY_BOTTOM = 1100   # the sky piece's box ends here


def piece_layer(piece):
    im = Image.open(os.path.join(ROOT, 'public', piece['src'])).convert('RGBA')
    x, y, w, h = piece['box']
    if im.size != (w, h):
        im = im.resize((w, h), Image.LANCZOS)
    layer = Image.new('RGBA', (FW, FH), (0, 0, 0, 0))
    layer.paste(im, (x, y), im)
    return layer


def main(out):
    os.makedirs(out, exist_ok=True)
    man = json.load(open(os.path.join(DESIGN, 'manifest.json')))
    pieces = {p['id'].split('/')[-1]: p for p in man['pieces']}
    stage = Image.open(STAGE).convert('RGB')
    st = np.asarray(stage).astype(np.float32)

    # ---- sky plate: our sky pieces in draw order + the stage's sun disc
    can = Image.new('RGBA', (FW, FH), (0, 0, 0, 0))
    for name in SKY_PIECES:
        can = Image.alpha_composite(can, piece_layer(pieces[name]))
    a = np.asarray(can).astype(np.float32)
    rgb = a[..., :3].copy()
    # the sun: the stage's saturated orange half-disc on the haze (x 120..280, y 690..790)
    r, g, b = st[..., 0], st[..., 1], st[..., 2]
    sun = (r > 200) & (r - b > 110) & (g < 150)
    zone = np.zeros_like(sun); zone[690:790, 120:280] = True
    sun &= zone
    rgb[sun] = st[sun]
    # below the sky: a calm mirrored reflection (slightly darker, cooler, softer)
    for y in range(SKY_BOTTOM, FH):
        sy = int(SKY_BOTTOM - 1 - (y - SKY_BOTTOM) * 0.85)
        sy = max(sy, 0)
        rgb[y] = rgb[sy] * np.array([0.86, 0.87, 0.93])
    refl = Image.fromarray(np.clip(rgb[SKY_BOTTOM:], 0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(3))
    rgb[SKY_BOTTOM:] = np.asarray(refl).astype(np.float32)
    sky_full = Image.fromarray(np.clip(rgb, 0, 255).astype(np.uint8))
    x, y, w, h = SKY_PLATE['frame_rect']
    sky_init = sky_full.crop((x, y, x + w, y + h)).resize(tuple(SKY_PLATE['size']), Image.LANCZOS)
    sky_init.save(os.path.join(out, 'sky_init.png'))
    sky_full.save(os.path.join(out, 'sky_init_frame.png'))

    # ---- tree: the stage around the tree
    x, y, w, h = TREE_PLATE['frame_rect']
    tree_init = stage.crop((x, y, x + w, y + h)).resize(tuple(TREE_PLATE['size']), Image.LANCZOS)
    tree_init.save(os.path.join(out, 'tree_init.png'))

    geo = {'frame': [FW, FH], 'sky': SKY_PLATE, 'tree': TREE_PLATE, 'sky_pieces': SKY_PIECES,
           'design_manifest': 'public/paint/v2s1_v4design/manifest.json', 'stage': os.path.relpath(STAGE, ROOT),
           'sun_px': int(sun.sum())}
    json.dump(geo, open(os.path.join(out, 'geometry.json'), 'w'), indent=1)
    print(json.dumps(geo))


if __name__ == '__main__':
    main(sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, 'out/aipaint/init'))
