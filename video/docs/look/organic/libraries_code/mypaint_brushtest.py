import json, subprocess, numpy as np
from PIL import Image, ImageDraw, ImageFont
OUT = '/tmp/organic/libraries/out/mypaint/brushtest'
B = ['deevad/watercolor_glazing', 'deevad/basic_digital_brush', 'deevad/brush', 'deevad/chalk', 'deevad/large_watercolor_fringe',
     'deevad/watercolor_expressive', 'tanda/acrylic-03-with-water', 'tanda/acrylic-04-paint', 'tanda/acrylic-05-paint',
     'tanda/oil-01-paint', 'tanda/oil-03-paint', 'tanda/oil-06-paint', 'tanda/watercolor-02-paint', 'tanda/texture-06',
     'ramon/Clouds', 'ramon/Classic_Paint', 'ramon/wet_round', 'ramon/Pastel_1', 'ramon/Dirty_Noise', 'kaerhon_v1/wet_paint_sm',
     'kaerhon_v1/paint_sm', 'kaerhon_v1/paint_barrr_sm', 'kaerhon_v1/flat_bar_l', 'classic/brush', 'classic/bulk', 'classic/dry_brush',
     'classic/coarse_bulk_2', 'classic/impressionism', 'classic/knife', 'classic/wet_knife', 'classic/modelling', 'Dieterle/Flat2#1',
     'Dieterle/WateryFlatbrush', 'Dieterle/Fan#1', 'experimental/leaves', 'experimental/soft_irregular', 'classic/smudge',
     'classic/blending_knife', 'deevad/blending', 'deevad/grainy_blending', 'ramon/Smear', 'ramon/Blur_Fast', 'kaerhon_v1/Smear_sm',
     'deevad/basic_digital_brush_smudging', 'deevad/sponge_smudging', 'tanda/oil-01-clean', 'tanda/water-01', 'classic/smudge+paint',
     'classic/blend+paint', 'ramon/RS_blendOP', 'kaerhon_v1/airsmudge_a', 'deevad/basic_digital_knife_smudging']
cw, ch, cols = 230, 130, 6
rows = (len(B) + cols - 1) // cols
W, H = cw * cols, ch * rows
base = np.zeros((H, W, 4), np.uint8)
peach, lilac = (255, 213, 174), (171, 159, 194)
strokes = []
for i, b in enumerate(B):
    cx, cy = (i % cols) * cw, (i // cols) * ch
    base[cy + 4:cy + ch - 24, cx + 4:cx + cw // 2] = (*peach, 255)
    base[cy + 4:cy + ch - 24, cx + cw // 2:cx + cw - 4] = (*lilac, 255)
    for (yy, wd, col) in [(30, 26, '#f2bdb6'), (78, 10, '#9985ad')]:
        n = 40
        xs = np.linspace(cx + 18, cx + cw - 18, n); ys = cy + yy + 6 * np.sin(np.linspace(0, 3.1, n))
        t = np.linspace(0, 1, n); p = np.clip(t / 0.15, 0, 1) ** 0.6 * (1 - 0.75 * np.clip((t - 0.6) / 0.4, 0, 1) ** 1.4)
        strokes.append({'brush': b, 'pts': np.column_stack([xs, ys, np.clip(p, 0.05, 1)]).round(2).tolist(), 'color': col, 'width': wd, 'opacity': 1.0})
open(f'{OUT}/base.rgba', 'wb').write(base.tobytes())
json.dump({'size': [W, H], 'base': f'{OUT}/base.rgba', 'out': f'{OUT}/out.rgba', 'strokes': strokes}, open(f'{OUT}/job.json', 'w'))
r = subprocess.run(['node', '/tmp/organic/libraries/src/mypaint_render.mjs', f'{OUT}/job.json'], capture_output=True, text=True)
print(r.stdout, r.stderr[-3000:])
a = np.frombuffer(open(f'{OUT}/out.rgba', 'rb').read(), np.uint8).reshape(H, W, 4)
img = Image.new('RGBA', (W, H), (250, 250, 250, 255)); img.alpha_composite(Image.fromarray(a, 'RGBA'))
d = ImageDraw.Draw(img)
for i, b in enumerate(B):
    cx, cy = (i % cols) * cw, (i // cols) * ch
    d.text((cx + 6, cy + ch - 20), b, fill=(0, 0, 0, 255))
img.convert('RGB').save(f'{OUT}/brushtest.png')
