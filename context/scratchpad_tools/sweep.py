import sys, numpy as np, cv2
sys.path.insert(0, '/home/user/Test-/video/scripts/qa')
import qalib as Q
def load(p):
    d = np.load(p); h, w = d['shape']; a = float(d['a'])
    ms = [np.unpackbits(m)[:h*w].reshape(h, w).astype(bool) for m in d['masks']]
    return ms, a, float(d['fps'])
def events(ms, a, fps, min_blob=24, merge=0, link=2, mode='union', min_vox=8000, trans=()):
    px = 1/(a*a); minpx = max(1, int(np.ceil(min_blob*a*a)))
    k_m = np.ones((2*merge+1, 2*merge+1), np.uint8) if merge else None
    k_l = np.ones((2*link+1, 2*link+1), np.uint8)
    onsets = []
    # chains: id -> [onset, vox]
    chains = {}; nxt = 0; prev_lab = None; prev_ids = None
    parent = {}
    def find(x):
        while parent[x] != x: parent[x] = parent[parent[x]]; x = parent[x]
        return x
    for i, m in enumerate(ms):
        m2, lab, st, n = Q.drop_small(m, minpx)
        if merge and n:
            md = cv2.dilate(m2.astype(np.uint8), k_m) > 0
            n2, lab2 = cv2.connectedComponents(md.astype(np.uint8), connectivity=8)
            lab = np.where(m2, lab2, 0); n = n2 - 1
            areas = np.bincount(lab.ravel(), minlength=n+1)
        else:
            areas = np.bincount(lab.ravel(), minlength=n+1) if n else np.zeros(1)
        ids = np.zeros(n+1, np.int64)
        if prev_lab is not None and n:
            pl = cv2.dilate(prev_lab.astype(np.float32), k_l).astype(np.int64)
            both = (lab > 0) & (pl > 0)
            pairs = np.unique(np.stack([lab[both], pl[both]], 1), axis=0) if both.any() else np.zeros((0,2), int)
        else:
            pairs = np.zeros((0, 2), int)
        cont = {}
        for cj, pj in pairs:
            cont.setdefault(int(cj), []).append(int(prev_ids[pj]))
        for j in range(1, n+1):
            if areas[j] == 0: continue
            if j in cont:
                cs = cont[j]
                if mode == 'union':
                    r = find(cs[0])
                    for c in cs[1:]:
                        rc = find(c)
                        if rc != r:
                            if chains[rc][0] < chains[r][0]: r, rc = rc, r
                            parent[rc] = r; chains[r][1] += chains[rc][1]
                    ids[j] = r
                else:  # track: continue the biggest chain, no merging
                    r = max((find(c) for c in cs), key=lambda c: chains[c][1])
                    ids[j] = r
                chains[ids[j]][1] += areas[j]*px
            else:
                parent[nxt] = nxt; chains[nxt] = [i, areas[j]*px]; ids[j] = nxt; nxt += 1
        prev_lab, prev_ids = lab, ids
    roots = {find(c) for c in chains}
    ev = sorted(chains[r][0] for r in roots if chains[r][1] >= min_vox)
    return ev
def stats(ev, n, fps, scenes=None):
    gaps = np.diff(ev)
    out = dict(rate=len(ev)/(n/fps), med=float(np.median(gaps)) if len(gaps) else 0)
    return out
import itertools
r1, a1, f1 = load(sys.argv[1]); r2, a2, f2 = load(sys.argv[2])
for mode in ('union', 'track'):
  for merge in (0, 3, 6):
    for mv in (2000, 4000, 8000):
        e1 = events(r1, a1, f1, merge=merge, mode=mode, min_vox=mv)
        e2 = events(r2, a2, f2, merge=merge, mode=mode, min_vox=mv)
        s1 = stats(e1, len(r1), f1); s2 = stats(e2, len(r2), f2)
        # ref1 longest gap outside transitions
        tr1 = [(7.43,8.03),(13.33,14.2),(19.63,20.63),(23.13,24.23),(26.93,28.2),(30.77,31.53)]
        pts = [0] + e1 + [len(r1)]
        g = [(pts[k+1]-pts[k])/f1 for k in range(len(pts)-1) if not any(a<=pts[k]/f1<=b or a<=pts[k+1]/f1<=b for a,b in tr1)]
        print(f'{mode:5s} merge={merge} vox={mv:5d} | ref1 {s1["rate"]:.2f}/s med {s1["med"]:.1f}f maxgap {max(g):.2f}s | ref2 {s2["rate"]:.2f}/s med {s2["med"]:.1f}f')
