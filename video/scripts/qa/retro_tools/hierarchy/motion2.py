"""Motion v2: every burst frame aligned to the mid frame (ECC affine, full 540 res, chained init), blur s=1,
consecutive aligned diffs; 'edge residual' killed by an opening (3x3) + threshold. Reports movers per sample.
usage: motion2.py [ids]  -> maps/motion2.json, maps/<id>_M.npy (hit fraction map)"""
import sys, json, numpy as np, cv2
sys.path.insert(0, '/tmp/claude-0/-home-user-Test-/e0b06496-a313-5ced-bf0f-bc634eb12744/scratchpad/retro/hierarchy/tools')
from analyse import CFG, D, boxmask, lab
THR = int(sys.argv[1]) if len(sys.argv) > 1 and sys.argv[1].isdigit() else 24
ids = [a for a in sys.argv[1:] if not a.isdigit()] or list(CFG)


def ecc(ref, img, init):
    g0 = cv2.GaussianBlur(cv2.cvtColor(ref, cv2.COLOR_RGB2GRAY).astype(np.float32), (0, 0), 1.2)
    g1 = cv2.GaussianBlur(cv2.cvtColor(img, cv2.COLOR_RGB2GRAY).astype(np.float32), (0, 0), 1.2)
    w = init.copy()
    try:
        _, w = cv2.findTransformECC(g0, g1, w, cv2.MOTION_AFFINE, (cv2.TERM_CRITERIA_EPS | cv2.TERM_CRITERIA_COUNT, 80, 1e-6), None, 1)
        ok = True
    except cv2.error:
        ok = False
    return w, ok


def run(sid):
    b = np.load(D + 'frames/%s_burst.npy' % sid); n = len(b); mid = n // 2
    H, W = b.shape[1:3]
    cfg = CFG[sid]; valid = ~boxmask((H, W), cfg['cap']); sm = boxmask((H, W), cfg['subj']) & valid
    al = [None] * n; al[mid] = b[mid]; fails = 0
    for direction in (range(mid + 1, n), range(mid - 1, -1, -1)):
        w = np.eye(2, 3, dtype=np.float32)
        for k in direction:
            w, ok = ecc(b[mid], b[k], w); fails += (not ok)
            al[k] = cv2.warpAffine(b[k], w, (W, H), flags=cv2.INTER_LINEAR | cv2.WARP_INVERSE_MAP, borderMode=cv2.BORDER_REPLICATE)
    # residual check on the mid-frame neighbours
    hits = np.zeros((H, W), np.float32); E = np.zeros((H, W), np.float32)
    ker = np.ones((3, 3), np.uint8); FM = np.zeros((H, W), np.float32)
    for k in range(1, n):
        d = np.abs(cv2.GaussianBlur(al[k], (0, 0), 1).astype(np.int16) - cv2.GaussianBlur(al[k - 1], (0, 0), 1).astype(np.int16)).max(2)
        m = (d > THR).astype(np.uint8)
        m = cv2.morphologyEx(m, cv2.MORPH_OPEN, ker)
        m[:8] = m[-8:] = 0; m[:, :8] = m[:, -8:] = 0
        hits += m; E += d * m
        g0 = cv2.cvtColor(al[k - 1], cv2.COLOR_RGB2GRAY); g1 = cv2.cvtColor(al[k], cv2.COLOR_RGB2GRAY)
        fl = cv2.calcOpticalFlowFarneback(g0, g1, None, 0.5, 3, 15, 3, 5, 1.2, 0)
        mg = np.hypot(fl[..., 0], fl[..., 1]); mg[m == 0] = 0; FM = np.maximum(FM, mg)
    hits /= n - 1; E /= n - 1
    hits[~valid] = 0; E[~valid] = 0
    mask = cv2.dilate((hits > 0).astype(np.uint8), np.ones((7, 7), np.uint8))
    nb, lb, st, _ = cv2.connectedComponentsWithStats(mask)
    labf = lab(b[mid]); L = labf[..., 0]; C = np.hypot(labf[..., 1], labf[..., 2])
    mv = []
    for k in range(1, nb):
        reg = (lb == k) & (hits > 0)
        ar = reg.sum() / valid.sum() * 100
        if ar < 0.004:
            continue
        x, y, w_, h_ = st[k, :4]
        bb = np.zeros_like(reg); bb[y:y + h_, x:x + w_] = True
        ring = cv2.dilate(bb.astype(np.uint8), np.ones((21, 21), np.uint8)).astype(bool) & ~bb
        mv.append(dict(area=round(float(ar), 3), bbox_area=round(float(w_ * h_ / valid.sum() * 100), 3), e=float(E[reg].sum()),
                       dL=round(float(abs(np.percentile(L[bb], 50) - np.percentile(L[ring], 50))), 1),
                       C90=round(float(np.percentile(C[bb], 90)), 1),
                       Lrange=round(float(np.percentile(L[reg], 95) - np.percentile(L[reg], 5)), 1),
                       Cmean=round(float(C[reg].mean()), 1),
                       speed=round(float(np.percentile(FM[reg], 75) * 30 / W * 100), 1),
                       in_subj=bool(sm[y + h_ // 2, x + w_ // 2]) if sm.sum() else False, box=[int(x), int(y), int(x + w_), int(y + h_)]))
    mv.sort(key=lambda m: -m['e'])
    tot = sum(m['e'] for m in mv) + 1e-6
    for m in mv:
        m['share'] = round(m['e'] / tot * 100, 1)
    r = dict(fails=fails, motion_px=round(float((hits > 0)[valid].mean() * 100), 2),
             movers=len(mv), movers_big=sum(m['bbox_area'] > 0.3 for m in mv), movers_mid=sum(0.03 < m['bbox_area'] <= 0.3 for m in mv),
             movers_tiny=sum(m['bbox_area'] <= 0.03 for m in mv),
             top_share=mv[0]['share'] if mv else 0, second_over_top=round(mv[1]['e'] / mv[0]['e'], 2) if len(mv) > 1 else 0,
             n_for_80=int(np.searchsorted(np.cumsum([m['share'] for m in mv]), 80) + 1) if mv else 0,
             subj_share=round(sum(m['share'] for m in mv if m['in_subj']), 1),
             top=[{k: v for k, v in m.items() if k != 'e'} for m in mv[:8]])
    np.save(D + 'maps/%s_M.npy' % sid, hits.astype(np.float16))
    return r


if __name__ == '__main__':
    try:
        allr = json.load(open(D + 'maps/motion2.json'))
    except Exception:
        allr = {}
    for i in ids:
        r = run(i); allr[i] = r
        print(i, {k: v for k, v in r.items() if k != 'top'})
    json.dump(allr, open(D + 'maps/motion2.json', 'w'), indent=1)
