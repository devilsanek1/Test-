import sys, os
from PIL import Image, ImageDraw, ImageFont
# usage: mk.py framesdir out.png f0 f1 step [crop x0,y0,x1,y1 in half-scale px] [cols] [t0]
d, out, f0, f1, step = sys.argv[1], sys.argv[2], int(sys.argv[3]), int(sys.argv[4]), int(sys.argv[5])
crop = tuple(int(v) for v in sys.argv[6].split(',')) if len(sys.argv) > 6 and sys.argv[6] != '-' else None
cols = int(sys.argv[7]) if len(sys.argv) > 7 else 6
t0 = float(sys.argv[8]) if len(sys.argv) > 8 else 45.618
fs = list(range(f0, f1 + 1, step))
ims = []
for f in fs:
    im = Image.open(os.path.join(d, f'f{f:05d}.png')).convert('RGB')
    if crop: im = im.crop(crop)
    ims.append((f, im))
w, h = ims[0][1].size
rows = (len(ims) + cols - 1) // cols
sheet = Image.new('RGB', (cols * w, rows * (h + 18)), 'white')
dr = ImageDraw.Draw(sheet)
for i, (f, im) in enumerate(ims):
    x, y = (i % cols) * w, (i // cols) * (h + 18)
    sheet.paste(im, (x, y + 18))
    dr.text((x + 3, y + 3), f'f{f} L{f/30:.2f} F{t0+f/30:.3f}', fill='black')
sheet.save(out)
print(out, sheet.size)
