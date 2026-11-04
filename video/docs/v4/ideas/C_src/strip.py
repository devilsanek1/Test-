"""Phone-size strip of rendered frames: python3 -I strip.py out.jpg B1 B2 ..."""
import sys
from PIL import Image
out_path, ids = sys.argv[1], sys.argv[2:]
ims = [Image.open('frames/%s.jpg' % i).convert('RGB').resize((360, 640), Image.LANCZOS) for i in ids]
out = Image.new('RGB', (len(ims) * 370, 640), (30, 30, 30))
for k, im in enumerate(ims):
    out.paste(im, (k * 370, 0))
out.save(out_path, quality=88)
