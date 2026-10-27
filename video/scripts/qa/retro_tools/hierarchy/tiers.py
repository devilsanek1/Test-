"""Per-tier look at 1080 wide: subject box / Pip / foreground band (bottom 28 %, outside the subject) / environment.
Per tier: L* p5-p95 range, local luminance contrast (|L - blur8|), chroma p50/p90, line coverage %, line length per kpx,
line width (precise distance transform at ridge points, mean), line darkness (black-hat L*)."""
import sys, json, numpy as np, cv2
sys.path.insert(0, '/tmp/claude-0/-home-user-Test-/e0b06496-a313-5ced-bf0f-bc634eb12744/scratchpad/retro/hierarchy/tools')
from analyse import CFG, D, boxmask, lab
R = json.load(open(D + 'maps/results.json'))
out = {}
for sid in CFG:
    nat = cv2.cvtColor(cv2.imread(D + 'frames/%s.png' % sid), cv2.COLOR_BGR2RGB)
    nat = cv2.resize(nat, (1080, int(1080 * nat.shape[0] / nat.shape[1])), interpolation=cv2.INTER_AREA if nat.shape[1] > 1080 else cv2.INTER_CUBIC)
    lf = lab(nat); L = lf[..., 0]; C = np.hypot(lf[..., 1], lf[..., 2]); H, W = L.shape
    lc = np.abs(L - cv2.GaussianBlur(L, (0, 0), 16))
    bh = cv2.morphologyEx(L, cv2.MORPH_BLACKHAT, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (17, 17)))
    m = (bh > 12).astype(np.uint8)
    dt = cv2.distanceTransform(m, cv2.DIST_L2, cv2.DIST_MASK_PRECISE)
    ridge = (m > 0) & (dt >= cv2.dilate(dt, np.ones((3, 3), np.uint8)) - 1e-3) & (dt > 0)
    cap = boxmask(L.shape, CFG[sid]['cap']); valid = ~cap
    subj = boxmask(L.shape, CFG[sid]['subj']) & valid
    pip = np.zeros_like(subj)
    if 'pip' in R[sid]:
        x0, y0, x1, y1 = [v * 2 for v in R[sid]['pip']['box']]; pip[y0:y1, x0:x1] = True; pip &= valid
    fore = np.zeros_like(subj); fore[int(0.72 * H):] = True; fore &= valid & ~subj & ~pip
    env = valid & ~subj & ~pip & ~fore
    res = {}
    for nm, reg in (('subj', subj & ~pip), ('pip', pip), ('fore', fore), ('env', env)):
        if reg.sum() < 500:
            continue
        lm = (m > 0) & reg; rg = ridge & reg
        res[nm] = dict(area=round(float(reg.sum() / valid.sum() * 100), 1),
                       Lr=round(float(np.percentile(L[reg], 95) - np.percentile(L[reg], 5)), 1),
                       Lmin=round(float(np.percentile(L[reg], 2)), 1),
                       lc=round(float(lc[reg].mean()), 2),
                       C50=round(float(np.median(C[reg])), 1), C90=round(float(np.percentile(C[reg], 90)), 1),
                       cov=round(float(lm.sum() / reg.sum() * 100), 2),
                       w=round(float(2 * dt[rg].mean()), 2) if rg.sum() else 0,
                       dark=round(float(np.median(bh[lm])), 1) if lm.sum() > 50 else 0,
                       Lline=round(float(np.median(L[lm])), 1) if lm.sum() > 50 else 0)
    out[sid] = res
    print(sid, ' | '.join('%s a%.0f Lr%.0f lc%.1f C%.0f/%.0f cov%.1f w%.1f dk%.0f' % (k, v['area'], v['Lr'], v['lc'], v['C50'], v['C90'], v['cov'], v['w'], v['dark']) for k, v in res.items()))
json.dump(out, open(D + 'maps/tiers.json', 'w'), indent=1)
