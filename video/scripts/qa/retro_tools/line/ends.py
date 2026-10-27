import sys, json, numpy as np, cv2
from scipy import ndimage as ndi
from scipy.spatial import cKDTree
sys.path.insert(0, '.')
from measure import run
res = {}
for spec in sys.argv[1:]:
    name, rest = spec.split('=', 1)
    band = None; crop = None
    if '#' in rest: rest, b = rest.split('#'); band = [int(v) for v in b.split('-')]
    if '@' in rest: rest, c = rest.split('@'); crop = [int(v) for v in c.split(',')]
    fullw = cv2.imread(rest).shape[1]; sc = 1080 / fullw
    out, line, sk = run(rest, sc, crop, band)
    nbc = ndi.convolve(sk.astype(np.uint8), np.ones((3, 3), np.uint8), mode='constant') - sk
    ends = np.argwhere(sk & (nbc == 1)) * sc
    lab, n = ndi.label(sk, structure=np.ones((3, 3)))
    eid = lab[tuple((ends / sc).astype(int).T)]
    t = cKDTree(ends)
    pairs = [(i, j) for i, j in t.query_pairs(18) if eid[i] != eid[j] and np.hypot(*(ends[i] - ends[j])) >= 3]
    area = line.size * sc * sc / 1e6 if not band else (line.size - (band[1]-band[0]) / sc * line.shape[1]) * sc * sc / 1e6
    # width per component = area / skeleton length, weighted by length
    lc, m = ndi.label(line, structure=np.ones((3, 3)))
    A = ndi.sum(line, lc, range(1, m + 1)); S = ndi.sum(sk, lc, range(1, m + 1))
    ok = S > 15
    wv = (A[ok] / S[ok]) * sc; wt = S[ok]
    o = np.argsort(wv); cw = np.cumsum(wt[o]) / wt.sum()
    q = lambda p: float(wv[o][np.searchsorted(cw, p)])
    res[name] = dict(near_miss_end_pairs_per_mpx=int(len(pairs) / area), width_w_p10=round(q(.1), 2), width_w_med=round(q(.5), 2), width_w_p90=round(q(.9), 2), dL=round(out['ring_L'] - out['line_L'], 1))
    print(name, res[name])
json.dump(res, open('ends.json', 'w'), indent=1)
