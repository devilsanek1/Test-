import json, sys, numpy as np
from PIL import Image, ImageDraw, ImageFont
sys.path.insert(0, '/tmp/organic/libraries/src')
from plan import rgb2ok, ok2rgb, hexof
L = '/tmp/organic/libraries'
km = json.load(open(f'{L}/out/spectral/km.json'))
F = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 15)
cw, rh = 46, 34
img = Image.new('RGB', (180 + 11 * cw, len(km) * (2 * rh + 14) + 10), (255, 255, 255)); d = ImageDraw.Draw(img)
hx = lambda h: np.array([int(h[i:i + 2], 16) / 255 for i in (1, 3, 5)])
y = 6
for row in km:
    a, b = hx(row['a']), hx(row['b'])
    d.text((6, y + 4), row['label'], fill=(0, 0, 0), font=F); d.text((6, y + rh + 4), 'OKLab | KM', fill=(110, 110, 110), font=F)
    for i in range(11):
        t = i / 10
        ok = hexof(ok2rgb(rgb2ok(a) * (1 - t) + rgb2ok(b) * t))
        d.rectangle([180 + i * cw, y, 180 + (i + 1) * cw - 2, y + rh - 2], fill=ok)
        d.rectangle([180 + i * cw, y + rh, 180 + (i + 1) * cw - 2, y + 2 * rh - 2], fill=row['km'][i])
    y += 2 * rh + 14
img.save(f'{L}/out/spectral/strips.png')
