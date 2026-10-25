# For S07 frames: compute the clip edge's screen x from the camera and report the colour step in the door rows.
import sys, math, re
import numpy as np
from PIL import Image
def ios(u): return (1-math.cos(math.pi*max(0,min(1,u))))/2
def cam(t):
    p0, p1 = 0.21, 23.205-21.985
    q = ios((t-p0)/(p1-p0))
    z = math.exp(q*math.log(1.06)); x = 540-60*q; y = 960-10*q
    return x, y, z
scale = float(sys.argv[1])
for f in sys.argv[2:]:
    fr = int(re.search(r'f(\d+)', f).group(1)); t = fr/30
    x, y, z = cam(t)
    sx = (846-x)*z+540
    a = np.asarray(Image.open(f).convert('RGB')).astype(int)
    # door rows world 1180..1440 -> screen
    ys = [int(((wy-y)*z+960)*scale) for wy in range(int(sys.argv[1+0]) if False else 900, 1460, 3)]
    c0 = int(sx*scale)
    best = 0
    for c in range(c0-3, c0+3):
        d = np.abs(a[ys, c]-a[ys, c-1]).sum(1); e = np.abs(a[ys, c]-a[ys, c+1]).sum(1); g = np.abs(a[ys, c-1]-a[ys, c+1]).sum(1)
        n = int(((d > 20) & (e > 20) & (g < 12)).sum())
        best = max(best, n)
    print(f't {t:.3f} edge sx {sx:.2f} seam rows {best}/{len(ys)}')
