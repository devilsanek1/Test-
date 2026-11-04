"""The 'also tried' sheet: the other libraries and passes at 1:1, the MyPaint CC0 brush catalogue through peinten, and
Spectral.js mixing against our OKLab mix. Writes /home/user/Test-/video/docs/look/organic/libraries_sheet_extra.png"""
from PIL import Image, ImageDraw, ImageFont
L = '/tmp/organic/libraries'
OUT = '/home/user/Test-/video/docs/look/organic/libraries_sheet_extra.png'
FB = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 20)
FS = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 15)
SKY = Image.open(f'{L}/inputs/cloud_sky_v6.png').convert('RGBA')
TERRA = (185, 128, 106, 255)
def on(subject, path, opaque=False):
    im = Image.open(path).convert('RGBA')
    if opaque: return im.convert('RGB')
    bg = SKY.copy() if subject == 'cloud' else Image.new('RGBA', im.size, TERRA)
    bg.alpha_composite(im); return bg.convert('RGB')
ITEMS = [
    ('open-watercolor-sim (Apache-2, Taichi CPU)', 'zones as wet washes on white paper, multiplied over the sky', 'cloud', f'{L}/out/watercolor/cloud_multiply.png', True),
    ('open-watercolor-sim', 'tree: edge-darkening lines = outlines; drips', 'tree', f'{L}/out/watercolor/tree_multiply.png', True),
    ('p5.brush fills only', 'watercolour fills over the sky: washes cannot cover', 'cloud', f'{L}/out/p5brush/p5_cloud_fills.png', True),
    ('MyPaint smudge-only pass on v6', 'blending knife + smudge strokes, no new paint', 'cloud', f'{L}/out/mypaint/cloud_smudge.png', False),
    ('cv2.stylization (Apache-2)', 'edge-aware smoothing + dark edge lines', 'cloud', f'{L}/out/opencv/cloud_v6_stylization.png', False),
    ('pykuwahara gaussian (GPL-3: tool only)', 'flattens; keeps the silhouette', 'cloud', f'{L}/out/opencv/cloud_v6_kuwahara_gauss.png', False),
    ('scikit-image SLIC (BSD-3)', 'average-colour facets: a "low poly" far tier?', 'tree', f'{L}/out/opencv/tree_v6_slic_mosaic.png', False),
    ('pykuwahara gaussian', 'tree: simplifies the leaf confetti', 'tree', f'{L}/out/opencv/tree_v6_kuwahara_gauss.png', False),
]
tiles = [(t, sub, on(s_, p, o)) for (t, sub, s_, p, o) in ITEMS]
G, PAD = 16, 28
cols = 4
cw = max(im.width for _, _, im in tiles); ch = max(im.height for _, _, im in tiles)
bt = Image.open(f'{L}/out/mypaint/brushtest/brushtest.png').convert('RGB')
sp = Image.open(f'{L}/out/spectral/strips.png').convert('RGB')
W = max(PAD * 2 + cols * cw + (cols - 1) * G, PAD * 2 + bt.width + G + sp.width)
rows = (len(tiles) + cols - 1) // cols
H = PAD + 40 + rows * (ch + 56 + G) + 40 + max(bt.height, sp.height) + PAD
S = Image.new('RGB', (W, H), (250, 249, 247)); d = ImageDraw.Draw(S)
d.text((PAD, PAD), 'Also tried (1:1): the libraries and passes that did not make the main sheet, why, and the raw material', fill=(20, 20, 20), font=FB)
y = PAD + 40
for i, (t, sub, im) in enumerate(tiles):
    x = PAD + (i % cols) * (cw + G); yy = y + (i // cols) * (ch + 56 + G)
    d.text((x, yy), t, fill=(20, 20, 20), font=FS); d.text((x, yy + 18), sub, fill=(90, 90, 90), font=FS)
    S.paste(im, (x, yy + 40))
y += rows * (ch + 56 + G) + 8
d.text((PAD, y), 'MyPaint CC0 brushes (mypaint-brushes 2.0.2) through peinten: one stroke at 26 px and one at 10 px over two flats', fill=(20, 20, 20), font=FS)
d.text((PAD + bt.width + G, y), 'Spectral.js (Kubelka-Munk) vs our OKLab mix: KM greys the complementary dusk pairs', fill=(20, 20, 20), font=FS)
S.paste(bt, (PAD, y + 24)); S.paste(sp, (PAD + bt.width + G, y + 24))
S.save(OUT, optimize=True); print('extra', S.size)
