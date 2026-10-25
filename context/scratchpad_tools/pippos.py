# Pip's body-fill centroid / bbox per frame (full-res px)
import sys, glob, os
import numpy as np
from PIL import Image
from scipy import ndimage
sc = float(sys.argv[2]) if len(sys.argv) > 2 else 1
prev = None
for f in sorted(glob.glob(os.path.join(sys.argv[1], 'f*.png'))):
    a = np.asarray(Image.open(f).convert('RGB')).astype(int)
    pip = (abs(a[..., 0] - 0x8D) < 20) & (abs(a[..., 1] - 0x90) < 20) & (abs(a[..., 2] - 0xCC) < 20)
    lab, n = ndimage.label(pip)
    if n == 0: print(os.path.basename(f), 'none'); continue
    sizes = ndimage.sum(pip, lab, range(1, n + 1))
    k = int(np.argmax(sizes)) + 1
    ys, xs = np.nonzero(lab == k)
    c = (xs.mean() / sc, ys.mean() / sc)
    v = '' if prev is None else f'step ({c[0]-prev[0]:+.0f},{c[1]-prev[1]:+.0f})'
    print(os.path.basename(f), f'centroid ({c[0]:.0f},{c[1]:.0f}) bbox x {xs.min()/sc:.0f}-{xs.max()/sc:.0f} y {ys.min()/sc:.0f}-{ys.max()/sc:.0f}', v)
    prev = c
