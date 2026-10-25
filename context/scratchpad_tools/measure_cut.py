import sys, numpy as np, cv2, glob, os
d = sys.argv[1]
for f in sorted(glob.glob(os.path.join(d, 'f007[12]*.png'))):
    im = cv2.imread(f)[:, :, ::-1].astype(int)  # RGB, half scale
    fr = int(os.path.basename(f)[1:-4])
    # sun: saturated orange
    r, g, b = im[..., 0], im[..., 1], im[..., 2]
    orange = (r > 200) & (g > 70) & (g < 140) & (b < 90)
    ys, xs = np.nonzero(orange[:700])
    sun = (xs.mean() * 2, ys.mean() * 2, ys.min() * 2) if len(xs) else None
    # wires at screen x 520 (half 260): dark ink pixels in y 380..560 half
    col = im[300:600, 260]
    dark = np.nonzero(col.sum(1) < 200)[0] + 300
    # group runs
    runs = []
    for y in dark:
        if runs and y - runs[-1][-1] <= 1: runs[-1].append(y)
        else: runs.append([y])
    wires = [round(np.mean(rn) * 2, 1) for rn in runs]
    print(fr, f'{fr/30:.3f}', 'sun cx,cy,top', None if sun is None else tuple(round(v, 1) for v in sun), 'ink@x520', wires)
