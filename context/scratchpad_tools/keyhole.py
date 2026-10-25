# keyhole blob size per frame: the dark connected component nearest the lock centre (560,1150)
import sys, glob, os
import numpy as np
from PIL import Image
from scipy import ndimage
prev = None
for f in sorted(glob.glob(os.path.join(sys.argv[1], 'f*.png'))):
    a = np.asarray(Image.open(f).convert('RGB')).astype(int)
    ink = a.sum(-1) < 160
    lab, n = ndimage.label(ink)
    best = None
    for i in range(1, n + 1):
        ys, xs = np.nonzero(lab == i)
        if len(ys) < 15: continue
        cy, cx = ys.mean(), xs.mean()
        h = ys.max() - ys.min() + 1; w = xs.max() - xs.min() + 1
        if h > 200 or w > 200: continue
        dd = np.hypot(cx - 560, cy - 1150)
        fill = len(ys) / (h * w)
        if fill < 0.35: continue  # solid blob (keyhole), not a stroke
        if best is None or dd < best[0]: best = (dd, cx, cy, h, w, len(ys))
    if best:
        r = '' if prev is None else f'ratio {best[3] / prev:.3f}'
        print(os.path.basename(f), f'keyhole centre ({best[1]:.0f},{best[2]:.0f}) h {best[3]} w {best[4]} area {best[5]}', r)
        prev = best[3]
