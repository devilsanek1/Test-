"""Three numbers per result (how organic, not how pretty): the silhouette's edge widths along its normal (crisp <= 2 px,
soft 2-8, lost > 8), the share of the silhouette lying on a near-perfect circular arc (a local circle fit over 31 px
with an RMS residual < 0.35 px: 'I can see shapes and angles very clearly'), and the share of the mass covered by sharp
internal value steps (> 5 L* across 2 px: zones meeting in hard seams)."""
import json, sys, numpy as np, cv2
from scipy import ndimage as ndi
from PIL import Image
sys.path.insert(0, '/tmp/organic/libraries/src')
from plan import rgb2ok


def edge_widths(a):
    sm = ndi.gaussian_filter(a, 1.0)
    cs, _ = cv2.findContours((a > 0.5).astype(np.uint8), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
    gx, gy = ndi.sobel(ndi.gaussian_filter(a, 2.5), 1), ndi.sobel(ndi.gaussian_filter(a, 2.5), 0)
    h, w = a.shape
    out = []
    for c in cs:
        c = c[:, 0, :]
        if len(c) < 40: continue
        for (x, y) in c[::4]:
            g = np.hypot(gx[y, x], gy[y, x])
            if g < 1e-4: continue
            nx, ny = -gx[y, x] / g, -gy[y, x] / g        # outward
            t = np.arange(-30, 30.5, 0.5)
            xs, ys = x + nx * t, y + ny * t
            ok = (xs >= 0) & (xs < w - 1) & (ys >= 0) & (ys < h - 1)
            if ok.sum() < len(t) * 0.8: continue          # cut by the piece's box: skip
            prof = ndi.map_coordinates(a, [ys, xs], order=1, mode='nearest')
            i90 = np.where(prof >= 0.9)[0]; i10 = np.where(prof <= 0.1)[0]
            if len(i90) == 0 or len(i10) == 0: continue
            # last >= 0.9 before the first <= 0.1 going outward
            j10 = i10[i10 > i90.min()]
            if len(j10) == 0: continue
            j10 = j10.min(); j90 = i90[i90 < j10].max()
            out.append((j10 - j90) * 0.5)
    e = np.array(out)
    if len(e) == 0: return None
    return {'n': int(len(e)), 'crisp': round(float((e <= 2).mean() * 100), 1), 'soft': round(float(((e > 2) & (e <= 8)).mean() * 100), 1),
            'lost': round(float((e > 8).mean() * 100), 1), 'median_px': round(float(np.median(e)), 2)}


def arc_share(a, win=31, tol=0.35):
    cs, _ = cv2.findContours((a > 0.5).astype(np.uint8), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
    h, w = a.shape
    on, tot = 0, 0
    for c in cs:
        c = c[:, 0, :].astype(float)
        if len(c) < win * 2: continue
        # sub-pixel contour: the 0.5 isoline, approximated by smoothing the pixel chain lightly
        cx = ndi.gaussian_filter1d(c[:, 0], 1.0, mode='wrap'); cy = ndi.gaussian_filter1d(c[:, 1], 1.0, mode='wrap')
        n = len(cx)
        for i in range(0, n, 3):
            idx = np.arange(i - win // 2, i + win // 2 + 1) % n
            X, Y = cx[idx], cy[idx]
            if (X <= 1).any() or (X >= w - 2).any() or (Y <= 1).any() or (Y >= h - 2).any(): continue
            A = np.column_stack([X, Y, np.ones_like(X)]); b = -(X * X + Y * Y)
            sol, *_ = np.linalg.lstsq(A, b, rcond=None)
            xc, yc = -sol[0] / 2, -sol[1] / 2; r = np.sqrt(max(xc * xc + yc * yc - sol[2], 1e-9))
            res = np.sqrt(np.mean((np.hypot(X - xc, Y - yc) - r) ** 2))
            tot += 1; on += res < tol and r < 400
    return round(on / max(tot, 1) * 100, 1)


def sharp_internal(rgba):
    a = rgba[..., 3].astype(float) / 255
    ok = rgb2ok(rgba[..., :3].astype(float) / 255)[..., 0] * 100
    inside = ndi.binary_erosion(a > 0.95, iterations=3)
    d = np.maximum(np.abs(ok[:, 2:] - ok[:, :-2])[1:-1, :], 0)
    dv = np.abs(ok[2:, :] - ok[:-2, :])[:, 1:-1]
    m = np.maximum(d[:, :dv.shape[1]], dv[:d.shape[0], :]) > 5
    ins = inside[1:-1, 1:-1][:m.shape[0], :m.shape[1]]
    return round(float((m & ins).sum() / max(ins.sum(), 1) * 100), 2)


def measure(path):
    rgba = np.asarray(Image.open(path).convert('RGBA'))
    a = rgba[..., 3].astype(float) / 255
    return {'edges': edge_widths(a), 'arc_share_pct': arc_share(a), 'sharp_internal_pct': sharp_internal(rgba)}


if __name__ == '__main__':
    res = {}
    for p in sys.argv[1:]:
        res[p] = measure(p); print(p.split('/libraries/')[-1], json.dumps(res[p]))
