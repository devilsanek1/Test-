"""Attention-hierarchy measurements per sample.
Static: Lab luminance contrast (centre-surround), chroma, colour contrast -> salience map; hot-spot count, concentration,
subject lift. Lines (1080-wide native frame): black-hat dark strokes, density / darkness / width, subject vs rest.
Motion: 0.5 s burst at 30 fps, ECC-affine camera removal, |diff| masks -> mover blobs (size, speed, contrast, chroma).
Boxes are fractions (x0,y0,x1,y1). Caption boxes are excluded from every statistic."""
import json, sys, numpy as np, cv2

D = '/tmp/claude-0/-home-user-Test-/e0b06496-a313-5ced-bf0f-bc634eb12744/scratchpad/retro/hierarchy/'
CAP_V3 = [(0, 0.11, 1, 0.305)]
CFG = {
 'v3_O1': dict(subj=[(0.25, 0.52, 0.70, 0.88)], cap=CAP_V3),
 'v3_S4': dict(subj=[(0.22, 0.32, 0.92, 0.68)], cap=CAP_V3),
 'v3_S5': dict(subj=[(0.18, 0.30, 0.78, 0.62)], cap=CAP_V3),
 'v3_S6': dict(subj=[(0.22, 0.32, 0.92, 0.68)], cap=CAP_V3),
 'v3_S7': dict(subj=[(0.28, 0.33, 0.80, 0.66)], cap=CAP_V3),
 'v3_S8': dict(subj=[(0.15, 0.43, 0.85, 0.60)], cap=CAP_V3),
 'v3_S9': dict(subj=[(0.55, 0.33, 1.0, 0.56), (0.40, 0.62, 0.56, 0.74)], cap=CAP_V3),
 'v3_S10': dict(subj=[(0.40, 0.44, 0.70, 0.58), (0.05, 0.62, 0.35, 0.74)], cap=CAP_V3),
 'v3_S11': dict(subj=[(0.12, 0.33, 0.70, 0.68)], cap=CAP_V3),
 'v3_S12': dict(subj=[(0.30, 0.60, 0.80, 0.80)], cap=CAP_V3),
 'v3_S13': dict(subj=[(0.15, 0.34, 0.58, 0.68)], cap=CAP_V3),
 'v3_S14': dict(subj=[(0.25, 0.32, 0.75, 0.62)], cap=CAP_V3),
 'v3_S15': dict(subj=[(0.30, 0.58, 0.72, 0.90)], cap=CAP_V3),
 'v3_S16': dict(subj=[(0.30, 0.48, 0.90, 0.70)], cap=CAP_V3),
 'r1_03': dict(subj=[(0.10, 0.38, 0.80, 0.70)], cap=[(0.05, 0.76, 0.95, 0.97)]),
 'r1_09': dict(subj=[(0.18, 0.25, 0.52, 0.52)], cap=[(0.05, 0.76, 0.95, 0.97)]),
 'r1_16': dict(subj=[(0.50, 0.60, 0.95, 0.73)], cap=[(0.05, 0.76, 0.95, 0.97)]),
 'r1_24': dict(subj=[(0.22, 0.27, 0.55, 0.66)], cap=[(0.05, 0.76, 0.95, 0.97)]),
 'v1_08': dict(subj=[(0.15, 0.38, 0.88, 0.88)], cap=[(0, 0.12, 1, 0.29)]),
 'v1_25': dict(subj=[(0.15, 0.56, 0.50, 0.70)], cap=[(0, 0.12, 1, 0.29)]),
 'v1_47': dict(subj=[(0.55, 0.56, 0.82, 0.72)], cap=[(0, 0.12, 1, 0.29)]),
 'c2_a': dict(subj=[], cap=[]), 'c2_b': dict(subj=[], cap=[]),
 'c3_a': dict(subj=[], cap=[]), 'c3_b': dict(subj=[], cap=[]),
}
PIP = np.array([[66.0, 25, -30], [55, 27, -33]])  # approx Lab of #A983C9 / #8C68AE (filled in below)


def lab(rgb):
    f = cv2.cvtColor(rgb.astype(np.float32) / 255, cv2.COLOR_RGB2LAB)
    return f


def boxmask(shape, boxes):
    m = np.zeros(shape[:2], bool)
    H, W = shape[:2]
    for x0, y0, x1, y1 in boxes:
        m[int(y0 * H):int(y1 * H), int(x0 * W):int(x1 * W)] = True
    return m


def salience(L, a, b):
    lc = 0.5 * (np.abs(L - cv2.GaussianBlur(L, (0, 0), 8)) + np.abs(L - cv2.GaussianBlur(L, (0, 0), 32)))
    ab = np.dstack([a, b])
    cc = np.linalg.norm(ab - cv2.GaussianBlur(ab, (0, 0), 24), axis=2)
    C = np.hypot(a, b)
    s = lc / 15 + cc / 15 + C / 60  # 15 L* step = 1, 15 colour step = 1, chroma 60 = 1
    return cv2.GaussianBlur(s, (0, 0), 10), lc, cc, C


def hotspots(S, valid, W):
    v = S.copy(); v[~valid] = 0
    p = np.percentile(v[valid], 99.5)
    m = (v > 0.6 * p).astype(np.uint8)
    n, lab_, st, _ = cv2.connectedComponentsWithStats(m)
    area = st[1:, cv2.CC_STAT_AREA]
    return int((area > 0.002 * valid.sum()).sum())


def lines(rgb1080, subj, cap):
    labf = lab(rgb1080); L = labf[..., 0]
    k = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (17, 17))
    bh = cv2.morphologyEx(L, cv2.MORPH_BLACKHAT, k)
    m = (bh > 12).astype(np.uint8)
    dt = cv2.distanceTransform(m, cv2.DIST_L2, 3)
    sk = cv2.ximgproc.thinning(m * 255) > 0 if hasattr(cv2, 'ximgproc') else (dt >= cv2.dilate(dt, np.ones((3, 3))) ) & (m > 0)
    capm = boxmask(L.shape, cap); sm = boxmask(L.shape, subj) & ~capm; rm = ~boxmask(L.shape, subj) & ~capm
    out = {}
    for nm, reg in (('subj', sm), ('rest', rm)):
        if reg.sum() == 0:
            continue
        lm = (m > 0) & reg; skr = sk & reg
        w = 2 * dt[skr] if skr.sum() else np.array([0])
        out[nm] = dict(cov=float(lm.mean() if False else lm.sum() / reg.sum() * 100),
                       len_per_kpx=float(skr.sum() / reg.sum() * 1000),
                       dark=float(np.median(bh[lm])) if lm.sum() else 0,
                       Lline=float(np.median(L[lm])) if lm.sum() else 0,
                       width=float(np.median(w)), width90=float(np.percentile(w, 90)))
    return out, bh


def align(prev, cur):
    g0 = cv2.resize(cv2.cvtColor(prev, cv2.COLOR_RGB2GRAY), None, fx=0.5, fy=0.5).astype(np.float32)
    g1 = cv2.resize(cv2.cvtColor(cur, cv2.COLOR_RGB2GRAY), None, fx=0.5, fy=0.5).astype(np.float32)
    w = np.eye(2, 3, dtype=np.float32)
    try:
        _, w = cv2.findTransformECC(g0, g1, w, cv2.MOTION_AFFINE,
                                    (cv2.TERM_CRITERIA_EPS | cv2.TERM_CRITERIA_COUNT, 60, 1e-5), None, 5)
    except cv2.error:
        pass
    w[:, 2] *= 2
    H, W = prev.shape[:2]
    return cv2.warpAffine(cur, w, (W, H), flags=cv2.INTER_LINEAR | cv2.WARP_INVERSE_MAP, borderMode=cv2.BORDER_REPLICATE), w


def motion(burst, valid):
    H, W = burst.shape[1:3]
    E = np.zeros((H, W), np.float32); hits = np.zeros((H, W), np.float32); flowmag = np.zeros((H, W), np.float32)
    cam = []
    for i in range(1, len(burst)):
        cur, w = align(burst[i - 1], burst[i])
        cam.append(float(np.hypot(w[0, 2], w[1, 2])) + abs(w[0, 0] - 1) * W / 2)
        d = np.abs(cur.astype(np.int16) - burst[i - 1].astype(np.int16)).max(2).astype(np.float32)
        d[:6] = d[-6:] = 0; d[:, :6] = d[:, -6:] = 0
        E += d; hits += d > 14
        g0 = cv2.cvtColor(burst[i - 1], cv2.COLOR_RGB2GRAY); g1 = cv2.cvtColor(cur, cv2.COLOR_RGB2GRAY)
        fl = cv2.calcOpticalFlowFarneback(g0, g1, None, 0.5, 3, 15, 3, 5, 1.2, 0)
        mg = np.hypot(fl[..., 0], fl[..., 1]); mg[d < 14] = 0
        flowmag = np.maximum(flowmag, mg)
    n = len(burst) - 1
    E /= n; hits /= n
    E[~valid] = 0; hits[~valid] = 0
    mask = (hits > 0).astype(np.uint8)
    mask = cv2.dilate(mask, np.ones((5, 5), np.uint8))
    nb, lb, st, cen = cv2.connectedComponentsWithStats(mask)
    movers = []
    for k in range(1, nb):
        ar = st[k, cv2.CC_STAT_AREA]
        if ar < 0.0003 * valid.sum():
            continue
        reg = lb == k
        movers.append(dict(k=k, area=float(ar / valid.sum() * 100), energy=float(E[reg].sum()),
                           speed=float(np.percentile(flowmag[reg], 90) * 30 / W * 100),
                           box=[int(st[k, 0]), int(st[k, 1]), int(st[k, 0] + st[k, 2]), int(st[k, 1] + st[k, 3])]))
    return E, hits, lb, movers, float(np.median(cam) * 30 / W * 100)


def mover_look(m, labf, lbl):
    reg = lbl == m['k']
    ring = cv2.dilate(reg.astype(np.uint8), np.ones((15, 15), np.uint8)).astype(bool) & ~reg
    L, a, b = labf[..., 0], labf[..., 1], labf[..., 2]
    m['dL'] = float(abs(np.median(L[reg]) - np.median(L[ring])))
    m['dLmax'] = float(np.percentile(np.abs(L[reg] - np.median(L[ring])), 90))
    m['C'] = float(np.percentile(np.hypot(a[reg], b[reg]), 90))


def run(sid):
    cfg = CFG[sid]
    burst = np.load(D + 'frames/%s_burst.npy' % sid)
    mid = burst[len(burst) // 2]
    labf = lab(mid); L, a, b = labf[..., 0], labf[..., 1], labf[..., 2]
    capm = boxmask(L.shape, cfg['cap']); valid = ~capm
    sm = boxmask(L.shape, cfg['subj']) & valid; rm = valid & ~sm
    S, lc, cc, C = salience(L, a, b)
    Sv = S[valid]
    top = np.sort(Sv)[::-1]
    conc10 = float(top[:len(top) // 10].sum() / top.sum() * 100)
    res = dict(id=sid, hot=hotspots(S, valid, L.shape[1]), conc10=conc10,
               S_med=float(np.median(Sv)), S_p99=float(np.percentile(Sv, 99)),
               peak_med=float(np.percentile(Sv, 99) / np.median(Sv)),
               lc_mean=float(lc[valid].mean()), C_med=float(np.median(C[valid])), C_p90=float(np.percentile(C[valid], 90)),
               hiC_share=float((C[valid] > 35).mean() * 100))
    if sm.sum():
        res.update(subj_area=float(sm.sum() / valid.sum() * 100),
                   S_lift=float(S[sm].mean() / S[rm].mean()),
                   lc_ratio=float(lc[sm].mean() / lc[rm].mean()),
                   C90_ratio=float(np.percentile(C[sm], 90) / max(1, np.percentile(C[rm], 90))),
                   hiC_in_subj=float(((C > 35) & sm).sum() / max(1, ((C > 35) & valid).sum()) * 100),
                   # luminance spread inside subject vs outside: value range p5-p95
                   Lrange_subj=float(np.percentile(L[sm], 95) - np.percentile(L[sm], 5)),
                   Lrange_rest=float(np.percentile(L[rm], 95) - np.percentile(L[rm], 5)))
    # Pip (v3 only): lavender pixels
    if sid.startswith('v3'):
        ref = lab(np.array([[[0xA9, 0x83, 0xC9], [0x8C, 0x68, 0xAE]]], np.uint8))[0]
        dE = np.minimum(np.linalg.norm(labf - ref[0], axis=2), np.linalg.norm(labf - ref[1], axis=2))
        pm = ((dE < 10) & valid).astype(np.uint8)
        nb, lb, st, _ = cv2.connectedComponentsWithStats(cv2.morphologyEx(pm, cv2.MORPH_CLOSE, np.ones((5, 5), np.uint8)))
        if nb > 1:
            k = 1 + int(np.argmax(st[1:, cv2.CC_STAT_AREA]))
            if st[k, cv2.CC_STAT_AREA] > 150:
                x, y, w, h = st[k, :4]
                pb = np.zeros_like(pm, bool); pb[y:y + h, x:x + w] = True
                res['pip'] = dict(area=float(pb.sum() / valid.sum() * 100), S=float(S[pb].mean() / S[rm].mean()),
                                  C90=float(np.percentile(C[pb], 90)), box=[int(x), int(y), int(x + w), int(y + h)],
                                  S_vs_subj=float(S[pb].mean() / S[sm].mean()) if sm.sum() else None)
    # lines at 1080 wide
    nat = cv2.cvtColor(cv2.imread(D + 'frames/%s.png' % sid), cv2.COLOR_BGR2RGB)
    nat = cv2.resize(nat, (1080, int(1080 * nat.shape[0] / nat.shape[1])), interpolation=cv2.INTER_AREA if nat.shape[1] > 1080 else cv2.INTER_CUBIC)
    res['lines'], bh = lines(nat, cfg['subj'], cfg['cap'])
    # motion
    E, hits, lbl, movers, cam = motion(burst, valid)
    for m in movers:
        mover_look(m, labf, lbl)
        bx = m['box']; cx = (bx[0] + bx[2]) / 2; cy = (bx[1] + bx[3]) / 2
        m['in_subj'] = bool(sm[int(cy), int(cx)]) if sm.sum() else False
    res['cam_pct_W_s'] = cam
    res['motion_px_pct'] = float((hits > 0)[valid].mean() * 100)
    res['n_movers'] = len(movers)
    res['n_movers_big'] = sum(m['area'] > 0.15 for m in movers)
    res['n_movers_tiny'] = sum(m['area'] <= 0.15 for m in movers)
    tot = E[valid].sum() + 1e-6
    if sm.sum():
        res['motion_in_subj'] = float(E[sm].sum() / tot * 100)
        res['motion_density_ratio'] = float((E[sm].mean() + 1e-6) / (E[rm].mean() + 1e-6))
    ms = sorted(movers, key=lambda m: -m['energy'])
    res['top_mover_share'] = float(ms[0]['energy'] / tot * 100) if ms else 0
    res['mover2_over_1'] = float(ms[1]['energy'] / ms[0]['energy']) if len(ms) > 1 else 0
    res['movers'] = [{k: (round(v, 2) if isinstance(v, float) else v) for k, v in m.items() if k != 'k'} for m in ms[:12]]
    np.save(D + 'maps/%s_S.npy' % sid, S.astype(np.float32)); np.save(D + 'maps/%s_E.npy' % sid, E.astype(np.float16))
    return res


if __name__ == '__main__':
    ids = sys.argv[1:] or list(CFG)
    allr = {}
    for i in ids:
        r = run(i); allr[i] = r
        print(i, {k: (round(v, 2) if isinstance(v, float) else v) for k, v in r.items() if k not in ('movers', 'lines', 'id')})
    old = {}
    try:
        old = json.load(open(D + 'maps/results.json'))
    except Exception:
        pass
    old.update(allr)
    json.dump(old, open(D + 'maps/results.json', 'w'), indent=1)
