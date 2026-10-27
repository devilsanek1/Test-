"""Depth analysis (docs/look/research/2026-10-27_depth_analysis.md): planes, separation, ground perspective.
Frames 540 px wide, CIE Lab (OpenCV float, D65). Boxes are fractions (x0, y0, x1, y1) of the frame.
Usage: imported by run_*.py in this folder (see extract_frames.sh); run Python with -I on reference frames."""
import json, sys, math
import numpy as np, cv2

FR, OUT = (sys.argv[1], sys.argv[2]) if __name__ == '__main__' else ('', '')
W540 = 540


def load(name, width=W540):
    bgr = cv2.imread(f'{FR}/{name}.png')
    h, w = bgr.shape[:2]
    if width and w != width:
        bgr = cv2.resize(bgr, (width, int(round(h * width / w))), interpolation=cv2.INTER_AREA)
    rgb = bgr[:, :, ::-1].astype(np.float32) / 255
    return bgr, cv2.cvtColor(rgb, cv2.COLOR_RGB2LAB)


def hexlab(h):
    h = h.lstrip('#')
    rgb = np.array([[[int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]]], np.float32)
    return cv2.cvtColor(rgb, cv2.COLOR_RGB2LAB)[0, 0]


def boxmask(shape, boxes):
    m = np.zeros(shape[:2], bool)
    H, W = shape[:2]
    for x0, y0, x1, y1 in boxes:
        m[int(y0 * H):int(y1 * H), int(x0 * W):int(x1 * W)] = True
    return m


def polymask(shape, poly):
    H, W = shape[:2]
    m = np.zeros(shape[:2], np.uint8)
    pts = np.array([[x * W, y * H] for x, y in poly], np.int32)
    cv2.fillPoly(m, [pts], 1)
    return m.astype(bool)


def linemask(lab):
    """Dark drawn lines: black-hat on L* (9 px ellipse at 540) > 12 and L* < 55."""
    L = lab[..., 0]
    k = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (9, 9))
    bh = cv2.morphologyEx(L, cv2.MORPH_BLACKHAT, k)
    return (bh > 12) & (L < 55)


def grad_de(lab):
    """Per-pixel colour step (dE76 units per px) from Sobel on L, a, b."""
    g = 0
    for c in range(3):
        gx = cv2.Sobel(lab[..., c], cv2.CV_32F, 1, 0, ksize=3) / 4
        gy = cv2.Sobel(lab[..., c], cv2.CV_32F, 0, 1, ksize=3) / 4
        g = g + gx * gx + gy * gy
    return np.sqrt(g)


def stats(lab, m, air=None):
    L, a, b = lab[..., 0][m], lab[..., 1][m], lab[..., 2][m]
    C = np.hypot(a, b)
    hue = math.degrees(math.atan2(b.mean(), a.mean())) % 360  # hue of the mean colour
    Lf = lab[..., 0]
    lc_map = np.abs(Lf - cv2.GaussianBlur(Lf, (0, 0), 8))
    g = grad_de(lab)
    out = dict(L=float(L.mean()), C=float(C.mean()), C90=float(np.percentile(C, 90)), h=float(hue),
               a=float(a.mean()), b=float(b.mean()),
               Lp5=float(np.percentile(L, 5)), Lp95=float(np.percentile(L, 95)),
               LC=float(lc_map[m].mean()), edge=float((g[m] > 6).mean()), n=int(m.sum()))
    out['Lrange'] = out['Lp95'] - out['Lp5']
    if air is not None:
        mean = np.array([L.mean(), a.mean(), b.mean()])
        out['dEair'] = float(np.linalg.norm(mean - air))
        out['dLair'] = float(air[0] - L.mean())
    return out


def separation(lab, near_mask, roi_mask, r_in=(2, 8), r_out=(2, 10), r_far=(10, 20), step=4, rad=10, exclude=None):
    """Silhouette separation of `near_mask` inside `roi_mask`: per boundary sample, the mean Lab of a band inside
    (r_in px) and outside (r_out px, the immediate neighbour; r_far px, the field behind), drawn lines excluded from the
    fill bands; line presence = a dark-line pixel within 3 px of the boundary on either side."""
    lines = linemask(lab)
    nm = near_mask.astype(np.uint8)
    din = cv2.distanceTransform(nm, cv2.DIST_L2, 5)
    dout = cv2.distanceTransform(1 - nm, cv2.DIST_L2, 5)
    ex = exclude if exclude is not None else np.zeros(nm.shape, bool)
    band_in = (din >= r_in[0]) & (din <= r_in[1]) & ~lines & ~ex
    band_out = (dout >= r_out[0]) & (dout <= r_out[1]) & ~lines & ~ex
    band_far = (dout >= r_far[0]) & (dout <= r_far[1]) & ~lines & ~ex
    near_line = cv2.dilate(lines.astype(np.uint8), np.ones((7, 7), np.uint8)) > 0
    cnts, _ = cv2.findContours(nm, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
    H, W = nm.shape
    yy, xx = np.mgrid[0:H, 0:W]
    rows = []
    for c in cnts:
        pts = c[:, 0, :]
        for i in range(0, len(pts), step):
            x, y = pts[i]
            if not roi_mask[y, x] or ex[y, x]:
                continue
            y0, y1, x0, x1 = max(0, y - rad - 20), min(H, y + rad + 21), max(0, x - rad - 20), min(W, x + rad + 21)
            sub = (xx[y0:y1, x0:x1] - x) ** 2 + (yy[y0:y1, x0:x1] - y) ** 2
            disc = sub <= rad * rad
            disc_far = sub <= (rad + 12) ** 2
            bi = band_in[y0:y1, x0:x1] & disc
            bo = band_out[y0:y1, x0:x1] & disc
            bf = band_far[y0:y1, x0:x1] & disc_far
            if bi.sum() < 6 or bo.sum() < 6:
                continue
            li = lab[y0:y1, x0:x1][bi].mean(0)
            lo = lab[y0:y1, x0:x1][bo].mean(0)
            lf = lab[y0:y1, x0:x1][bf].mean(0) if bf.sum() >= 6 else lo
            rows.append(dict(dL=float(li[0] - lo[0]), dC=float(np.hypot(li[1], li[2]) - np.hypot(lo[1], lo[2])),
                             dE=float(np.linalg.norm(li - lo)), dLfar=float(li[0] - lf[0]), dEfar=float(np.linalg.norm(li - lf)),
                             line=bool(near_line[y, x])))
    if not rows:
        return None
    dL = np.array([abs(r['dL']) for r in rows]); dE = np.array([r['dE'] for r in rows])
    dLf = np.array([abs(r['dLfar']) for r in rows]); dEf = np.array([r['dEfar'] for r in rows])
    ln = np.array([r['line'] for r in rows])
    same = (dL < 5) & (dE < 10)
    run = best = 0
    for v in (dL < 5):
        run = run + 1 if v else 0
        best = max(best, run)
    return dict(n=len(rows), longest_same_run_px=int(best * step), dL_med=float(np.median(dL)), dL_p25=float(np.percentile(dL, 25)), dE_med=float(np.median(dE)),
                dC_med=float(np.median([r['dC'] for r in rows])), signed_dL_med=float(np.median([r['dL'] for r in rows])),
                same_value=float((dL < 5).mean()), same_colour=float(same.mean()),
                same_value_noline=float((same & ~ln).mean()), line_share=float(ln.mean()),
                dLfar_med=float(np.median(dLf)), dEfar_med=float(np.median(dEf)), same_far=float(((dLf < 5) & (dEf < 10)).mean()))


def ground(name, roi, out_png=None, min_len=36, contrast_min=6.0, width=1080, vps=None):
    """Line directions in a ground region (1080 wide by default): Canny on L*, probabilistic Hough; per segment angle,
    length and cross-contrast (|dL*| between +-3 px along its normal); the dominant vanishing point of the obliques.
    At another width the lengths scale (min_len, the 3 px normal offset stays); results are length SHARES (+ per Mpx
    of the 1080 frame). `vps`: the shot's declared vanishing points in 1080-frame px (from its camera); the result then
    also gives each one's share of the visible line length (`vis_to_declared`)."""
    bgr, lab = load(name, width=width)
    min_len = max(10, int(round(min_len * width / 1080)))
    L = lab[..., 0]
    H, W = L.shape
    m = boxmask(L.shape, [roi])
    L8 = np.clip(L * 2.55, 0, 255).astype(np.uint8)
    e = cv2.Canny(cv2.GaussianBlur(L8, (3, 3), 0), 14, 30)
    e[~m] = 0
    segs = cv2.HoughLinesP(e, 1, np.pi / 360, threshold=30, minLineLength=min_len, maxLineGap=4)
    segs = [] if segs is None else np.asarray(segs).reshape(-1, 4)
    rows = []
    for x0, y0, x1, y1 in segs:
        dx, dy = x1 - x0, y1 - y0
        ln = math.hypot(dx, dy)
        ang = math.degrees(math.atan2(dy, dx))
        ang = (ang + 180) % 180  # 0..180, 0 = horizontal
        nx, ny = -dy / ln, dx / ln
        ts = np.linspace(0.1, 0.9, 9)
        px = x0 + dx * ts; py = y0 + dy * ts
        a = [L[int(np.clip(py[i] + ny * 3, 0, H - 1)), int(np.clip(px[i] + nx * 3, 0, W - 1))] for i in range(9)]
        b = [L[int(np.clip(py[i] - ny * 3, 0, H - 1)), int(np.clip(px[i] - nx * 3, 0, W - 1))] for i in range(9)]
        con = float(np.median(np.abs(np.array(a) - np.array(b))))
        rows.append(dict(seg=[int(x0), int(y0), int(x1), int(y1)], len=ln, ang=ang, con=con))
    def cls(r):
        a = r['ang']
        if a <= 4 or a >= 176:
            return 'horizontal'
        if 84 <= a <= 96:
            return 'vertical'
        return 'oblique'
    for r in rows:
        r['cls'] = cls(r)
    obl = [r for r in rows if r['cls'] == 'oblique']
    vp, best = None, 0
    if len(obl) >= 2:
        y_top = roi[1] * H
        cand_x = np.linspace(-1.5 * W, 2.5 * W, 161)
        cand_y = np.linspace(-0.6 * H, y_top + 0.05 * H, 81)
        for cy in cand_y:
            for cx in cand_x:
                s = 0
                for r in obl:
                    x0, y0, x1, y1 = r['seg']
                    mx, my = (x0 + x1) / 2, (y0 + y1) / 2
                    a1 = math.atan2(y1 - y0, x1 - x0)
                    a2 = math.atan2(cy - my, cx - mx)
                    d = abs((math.degrees(a1 - a2) + 90) % 180 - 90)
                    if d < 2.5:
                        s += r['len']
                if s > best:
                    best, vp = s, (float(cx), float(cy))
    for r in obl:
        x0, y0, x1, y1 = r['seg']
        mx, my = (x0 + x1) / 2, (y0 + y1) / 2
        a1 = math.atan2(y1 - y0, x1 - x0)
        a2 = math.atan2(vp[1] - my, vp[0] - mx) if vp else 0
        r['conv'] = bool(vp) and abs((math.degrees(a1 - a2) + 90) % 180 - 90) < 2.5
    tot = sum(r['len'] for r in rows) or 1
    vis = [r for r in rows if r['con'] >= contrast_min]
    totv = sum(r['len'] for r in vis) or 1
    def share(rs, t, pred):
        return sum(r['len'] for r in rs if pred(r)) / t
    res = dict(n=len(rows), total_len=tot, vp=vp,
               horizontal=share(rows, tot, lambda r: r['cls'] == 'horizontal'),
               vertical=share(rows, tot, lambda r: r['cls'] == 'vertical'),
               converging=share(rows, tot, lambda r: r['cls'] == 'oblique' and r.get('conv')),
               oblique_other=share(rows, tot, lambda r: r['cls'] == 'oblique' and not r.get('conv')),
               vis_len=sum(r['len'] for r in vis),
               vis_horizontal=share(vis, totv, lambda r: r['cls'] == 'horizontal'),
               vis_converging=share(vis, totv, lambda r: r['cls'] == 'oblique' and r.get('conv')),
               vis_oblique_other=share(vis, totv, lambda r: r['cls'] == 'oblique' and not r.get('conv')),
               conv_contrast_med=float(np.median([r['con'] for r in obl if r.get('conv')])) if any(r.get('conv') for r in obl) else 0.0,
               horiz_contrast_med=float(np.median([r['con'] for r in rows if r['cls'] == 'horizontal'])) if any(r['cls'] == 'horizontal' for r in rows) else 0.0,
               roi_area=float(m.sum()))
    if vps:
        sc = width / 1080
        def to_vp(r, vp):
            x0, y0, x1, y1 = r['seg']
            mx, my = (x0 + x1) / 2, (y0 + y1) / 2
            return abs((math.degrees(math.atan2(y1 - y0, x1 - x0) - math.atan2(vp[1] * sc - my, vp[0] * sc - mx)) + 90) % 180 - 90) < 2.5
        res['vis_to_declared'] = [share(vis, totv, lambda r, v=v: r['cls'] == 'oblique' and to_vp(r, v)) for v in vps]
        res['vis_to_any_declared'] = share(vis, totv, lambda r: r['cls'] == 'oblique' and any(to_vp(r, v) for v in vps))
    k = 1080 / width  # lengths and areas back to the 1080 frame
    res['len_per_mpx'] = tot * k / (m.sum() * k * k / 1e6)
    res['vis_len_per_mpx'] = res['vis_len'] * k / (m.sum() * k * k / 1e6)
    if out_png:
        o = bgr.copy()
        for r in rows:
            x0, y0, x1, y1 = r['seg']
            col = (0, 200, 0) if r['cls'] == 'horizontal' else (255, 0, 0) if r['cls'] == 'vertical' else ((0, 0, 255) if r.get('conv') else (0, 160, 255))
            cv2.line(o, (x0, y0), (x1, y1), col, 3 if r['con'] >= contrast_min else 1)
        if vp:
            cv2.circle(o, (int(np.clip(vp[0], 0, W - 1)), int(np.clip(vp[1], 0, H - 1))), 12, (255, 0, 255), 3)
        x0, y0, x1, y1 = roi
        cv2.rectangle(o, (int(x0 * W), int(y0 * H)), (int(x1 * W) - 1, int(y1 * H) - 1), (255, 0, 255), 2)
        cv2.imwrite(out_png, cv2.resize(o, (540, int(H * 540 / W)), interpolation=cv2.INTER_AREA))
    # horizontal edge rows (y of horizontal segments, clustered) for the spacing law
    ys = sorted(set(int(round((r['seg'][1] + r['seg'][3]) / 2)) for r in rows if r['cls'] == 'horizontal' and r['con'] >= 3))
    cl = []
    for y in ys:
        if cl and y - cl[-1][-1] <= 8:
            cl[-1].append(y)
        else:
            cl.append([y])
    res['h_rows'] = [int(np.mean(c)) for c in cl]
    return res
