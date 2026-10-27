"""Line-quality metrics on a frame, normalised to a 1080-px-wide canvas.
usage: python3 -I measure.py out.json name=path[@x0,y0,x1,y1 crop in native px][#mask y0-y1 canvas] ...
"""
import sys, json, numpy as np, cv2
from scipy import ndimage as ndi

def lab(img):
    l = cv2.cvtColor(img, cv2.COLOR_BGR2LAB).astype(np.float32)
    l[..., 0] *= 100 / 255; l[..., 1] -= 128; l[..., 2] -= 128
    return l

def zhang_suen(b):
    """skeletonise a bool mask (vectorised Zhang-Suen)."""
    img = b.astype(np.uint8).copy()
    img = np.pad(img, 1)
    changed = True
    while changed:
        changed = False
        for step in (0, 1):
            P = img
            p2 = P[:-2, 1:-1]; p3 = P[:-2, 2:]; p4 = P[1:-1, 2:]; p5 = P[2:, 2:]
            p6 = P[2:, 1:-1]; p7 = P[2:, :-2]; p8 = P[1:-1, :-2]; p9 = P[:-2, :-2]
            c = P[1:-1, 1:-1]
            nb = [p2, p3, p4, p5, p6, p7, p8, p9]
            B = sum(x.astype(np.int32) for x in nb)
            seq = nb + [p2]
            A = sum(((seq[i] == 0) & (seq[i + 1] == 1)).astype(np.int32) for i in range(8))
            if step == 0:
                m = (c == 1) & (B >= 2) & (B <= 6) & (A == 1) & (p2 * p4 * p6 == 0) & (p4 * p6 * p8 == 0)
            else:
                m = (c == 1) & (B >= 2) & (B <= 6) & (A == 1) & (p2 * p4 * p8 == 0) & (p2 * p6 * p8 == 0)
            if m.any():
                changed = True
                inner = img[1:-1, 1:-1]
                inner[m] = 0
    return img[1:-1, 1:-1].astype(bool)

def metrics(path, crop=None, mask_band=None):
    img = cv2.imread(path)
    if crop:
        x0, y0, x1, y1 = crop; img = img[y0:y1, x0:x1]
    h, w = img.shape[:2]
    s = 1080 / (crop and (1080 if path.endswith('.png') and img.shape[1] < 1080 and 'v3' in path else None) or (w if not crop else 1080)) if False else None
    return img

def run(path, scale, crop=None, band=None):
    """scale = canvas px per native px (1080 / native width of the full frame)."""
    img = cv2.imread(path)
    if crop:
        x0, y0, x1, y1 = crop; img = img[y0:y1, x0:x1]
    h, w = img.shape[:2]
    L = lab(img)
    Lc = L[..., 0]
    k = max(5, int(round(9 / scale)) | 1)
    se = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (k, k))
    bh = cv2.morphologyEx(Lc, cv2.MORPH_BLACKHAT, se)
    line = (bh > 14) & (Lc < 55)
    valid = np.ones((h, w), bool)
    if band:  # exclude caption band (canvas y range)
        y0, y1 = [int(v / scale) for v in band]
        valid[max(0, y0 - (crop[1] if crop else 0)):max(0, y1 - (crop[1] if crop else 0))] = False
    line &= valid
    line = ndi.binary_opening(line, iterations=0) if False else line
    # drop specks < 3 px area (codec noise)
    lab_cc, n = ndi.label(line, structure=np.ones((3, 3)))
    sizes = ndi.sum(line, lab_cc, range(1, n + 1))
    keep = np.zeros(n + 1, bool); keep[1:] = sizes >= 4
    line = keep[lab_cc]
    area_mpx = valid.sum() * scale * scale / 1e6
    sk = zhang_suen(line)
    sk_len = sk.sum() * scale
    # endpoints: skeleton px with exactly one neighbour
    nbc = ndi.convolve(sk.astype(np.uint8), np.ones((3, 3), np.uint8), mode='constant') - sk
    ends = (sk & (nbc == 1)).sum()
    junc = (sk & (nbc >= 3)).sum()
    # widths: 2*DT at skeleton
    dt = ndi.distance_transform_edt(line)
    wid = (2 * dt[sk] - 1).clip(1) * scale
    # components: short strokes (ticks/specks): skeleton length < 40 canvas px
    lab_cc, n = ndi.label(line, structure=np.ones((3, 3)))
    sklen = ndi.sum(sk, lab_cc, range(1, n + 1)) * scale
    short = int((sklen < 40).sum())
    # colour boundaries with/without a dark seam: remove lines by closing, then edges
    k2 = max(5, int(round(11 / scale)) | 1)
    closed = cv2.morphologyEx(img, cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (k2, k2)))
    closed = cv2.medianBlur(closed, 5)
    Lb = lab(closed)
    gx = sum(np.abs(cv2.Sobel(Lb[..., c], cv2.CV_32F, 1, 0, ksize=3)) for c in range(3))
    gy = sum(np.abs(cv2.Sobel(Lb[..., c], cv2.CV_32F, 0, 1, ksize=3)) for c in range(3))
    g = np.hypot(gx, gy)
    edges = (g > 60) & valid
    edges = zhang_suen(edges) if edges.sum() < 4e5 else edges
    near = ndi.binary_dilation(line, iterations=max(2, int(round(4 / scale))))
    seam = (edges & near).sum() / max(1, edges.sum())
    # line contrast: line core L vs ring
    ring = ndi.binary_dilation(line, iterations=max(2, int(round(5 / scale)))) & ~ndi.binary_dilation(line, iterations=1) & valid
    out = dict(
        line_px_pct=round(100 * line.sum() / valid.sum(), 2),
        skel_len_per_mpx=int(sk_len / area_mpx),
        ends_per_1000px=round(1000 * ends / max(1, sk.sum()), 1),
        ends_per_mpx=int(ends / area_mpx),
        junctions_per_1000px=round(1000 * junc / max(1, sk.sum()), 1),
        width_p10=round(float(np.percentile(wid, 10)), 2), width_med=round(float(np.median(wid)), 2),
        width_p90=round(float(np.percentile(wid, 90)), 2),
        width_spread=round(float(np.percentile(wid, 90) / max(0.5, np.percentile(wid, 10))), 2),
        short_strokes_per_mpx=int(short / area_mpx),
        strokes_per_mpx=int(n / area_mpx),
        seam_pct=round(100 * seam, 1),
        line_L=round(float(np.median(Lc[line])), 1), ring_L=round(float(np.median(Lc[ring])), 1),
    )
    return out, line, sk

if __name__ == '__main__':
    res = {}
    for spec in sys.argv[2:]:
        name, rest = spec.split('=', 1)
        band = None; crop = None
        if '#' in rest:
            rest, b = rest.split('#'); band = [int(v) for v in b.split('-')]
        if '@' in rest:
            rest, c = rest.split('@'); crop = [int(v) for v in c.split(',')]
        fullw = cv2.imread(rest).shape[1]
        out, line, sk = run(rest, 1080 / fullw, crop, band)
        res[name] = out
        cv2.imwrite(f'masks/{name}.png', (~line * 255).astype(np.uint8))
        print(name, json.dumps(out))
    json.dump(res, open(sys.argv[1], 'w'), indent=1)
