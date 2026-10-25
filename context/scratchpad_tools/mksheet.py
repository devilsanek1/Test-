import sys
from PIL import Image, ImageDraw
d, out, f0, f1 = sys.argv[1], sys.argv[2], int(sys.argv[3]), int(sys.argv[4])
cols = int(sys.argv[5]) if len(sys.argv) > 5 else 6
w = int(sys.argv[6]) if len(sys.argv) > 6 else 270
crop = sys.argv[7] if len(sys.argv) > 7 else None
ims = []
for i in range(f0, f1 + 1):
    try:
        im = Image.open(f'{d}/f{i:05d}.png').convert('RGB')
    except FileNotFoundError:
        continue
    if crop:
        x, y, cw, ch = map(int, crop.split(','))
        im = im.crop((x, y, x + cw, y + ch))
    h = int(im.height * w / im.width)
    im = im.resize((w, h))
    dr = ImageDraw.Draw(im)
    dr.rectangle([0, 0, w, 14], fill=(0, 0, 0))
    dr.text((3, 2), f'f{i} {i/30:.3f}', fill=(255, 255, 0))
    ims.append(im)
rows = (len(ims) + cols - 1) // cols
S = Image.new('RGB', (cols * w, rows * ims[0].height), 'white')
for k, im in enumerate(ims):
    S.paste(im, ((k % cols) * w, (k // cols) * im.height))
S.save(out)
print(out, len(ims))
