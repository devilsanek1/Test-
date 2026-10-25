# min distance (px, full-res) between the sun disc (#EC6B2E) and Pip (body #8D90CC + any dark ink touching it) per frame
import sys, glob, os
import numpy as np
from PIL import Image
from scipy import ndimage
d = sys.argv[1]; sc = float(sys.argv[2]) if len(sys.argv) > 2 else 1.0
for f in sorted(glob.glob(os.path.join(d, 'f*.png'))):
    a = np.asarray(Image.open(f).convert('RGB')).astype(int)
    sun = (abs(a[..., 0] - 0xEC) < 18) & (abs(a[..., 1] - 0x6B) < 22) & (abs(a[..., 2] - 0x2E) < 22)
    pip = (abs(a[..., 0] - 0x8D) < 20) & (abs(a[..., 1] - 0x90) < 20) & (abs(a[..., 2] - 0xCC) < 20)
    ink = (a.sum(-1) < 200)
    if pip.sum() < 20 or sun.sum() < 20:
        print(os.path.basename(f), 'n/a'); continue
    # Pip silhouette incl. his outline: dark ink within 8 px of the body fill (label the ink blob touching it)
    near = ndimage.binary_dilation(pip, iterations=int(8 * sc))
    sil = pip | (ink & near)
    dt = ndimage.distance_transform_edt(~sun)
    ys, xs = np.nonzero(sil)
    i = dt[ys, xs].argmin()
    print(os.path.basename(f), 'gap px (full res):', round(dt[ys[i], xs[i]] / sc, 1), 'at', (int(xs[i] / sc), int(ys[i] / sc)), 'fill-only:', round(dt[pip].min() / sc, 1))
