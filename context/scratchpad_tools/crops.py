import sys, os
from PIL import Image, ImageDraw
D, out, f0, f1, box = sys.argv[1], sys.argv[2], int(sys.argv[3]), int(sys.argv[4]), sys.argv[5]
cols = int(sys.argv[6]) if len(sys.argv) > 6 else 6
zoom = float(sys.argv[7]) if len(sys.argv) > 7 else 1.0
x0, y0, x1, y1 = [int(v) // 2 for v in box.split(',')]  # full px -> half
tiles = []
for n in range(f0, f1 + 1):
    p = os.path.join(D, f'f{n:05d}.png')
    if not os.path.exists(p): continue
    im = Image.open(p).convert('RGB').crop((x0, y0, x1, y1))
    if zoom != 1: im = im.resize((int(im.width * zoom), int(im.height * zoom)), Image.LANCZOS)
    tiles.append((n, im))
W, H = tiles[0][1].size
rows = (len(tiles) + cols - 1) // cols
S = Image.new('RGB', (cols * W, rows * (H + 14)), 'white')
d = ImageDraw.Draw(S)
for k, (n, im) in enumerate(tiles):
    x = (k % cols) * W; y = (k // cols) * (H + 14)
    S.paste(im, (x, y + 14)); d.text((x + 2, y + 1), f'{n} {n/30:.3f}', fill='black')
S.save(out)
