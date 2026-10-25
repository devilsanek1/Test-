import sys
from PIL import Image
# usage: cells.py in.png out.png scale "c,r,span" ...
src, out, scale = sys.argv[1], sys.argv[2], float(sys.argv[3])
im = Image.open(src).convert('RGB')
tiles = []
for spec in sys.argv[4:]:
    c, r, span = map(int, spec.split(','))
    t = im.crop((c*216, 84+r*196, c*216+216*span, 84+r*196+196))
    t = t.resize((int(t.width*scale), int(t.height*scale)), Image.LANCZOS)
    tiles.append(t)
W = sum(t.width for t in tiles) + 8*(len(tiles)-1)
H = max(t.height for t in tiles)
o = Image.new('RGB', (W, H), 'white'); x = 0
for t in tiles:
    o.paste(t, (x, 0)); x += t.width + 8
o.save(out)
