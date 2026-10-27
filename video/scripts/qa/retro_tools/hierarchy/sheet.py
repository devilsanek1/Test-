"""Contact sheet of mid frames with a 10 % grid for picking subject boxes. usage: sheet.py out.jpg id1 id2 ..."""
import sys, numpy as np
from PIL import Image, ImageDraw
D = '/tmp/claude-0/-home-user-Test-/e0b06496-a313-5ced-bf0f-bc634eb12744/scratchpad/retro/hierarchy/frames/'
out, ids = sys.argv[1], sys.argv[2:]
W = 300
tiles = []
for i in ids:
    b = np.load(D + i + '_burst.npy')
    im = Image.fromarray(b[len(b) // 2]).resize((W, int(W * b.shape[1] / b.shape[2])))
    d = ImageDraw.Draw(im)
    for k in range(1, 10):
        x = W * k / 10; y = im.height * k / 10
        c = (255, 0, 255) if k == 5 else (0, 255, 255)
        d.line([(x, 0), (x, im.height)], fill=c, width=1)
        d.line([(0, y), (W, y)], fill=c, width=1)
        d.text((2, y - 10), str(k), fill=(255, 255, 0))
        d.text((x + 1, 1), str(k), fill=(255, 255, 0))
    d.rectangle([0, im.height - 14, W, im.height], fill=(0, 0, 0)); d.text((3, im.height - 13), i, fill=(255, 255, 255))
    tiles.append(im)
cols = min(7, len(tiles)); rows = (len(tiles) + cols - 1) // cols
Hm = max(t.height for t in tiles)
S = Image.new('RGB', (cols * (W + 4), rows * (Hm + 4)), (40, 40, 40))
for k, t in enumerate(tiles):
    S.paste(t, ((k % cols) * (W + 4), (k // cols) * (Hm + 4)))
S.save(out, quality=88)
print(S.size)
