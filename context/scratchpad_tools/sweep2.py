import sys, numpy as np
sys.path.insert(0, '/home/user/Test-/video/scripts/qa')
import qalib as Q
def load(p):
    d = np.load(p); h, w = d['shape']; a = float(d['a']); n = int(d['n'])
    return [(int(i), np.unpackbits(m)[:h*w].reshape(h, w).astype(bool)) for i, m in zip(d['idx'], d['masks'])], a, float(d['fps']), n
data = {k: load(f'{k}.npz') for k in ('mk_ref1', 'mk_ref2', 'mk_kit')}
tr1 = [(7.43,8.03),(13.33,14.2),(19.63,20.63),(23.13,24.23),(26.93,28.2),(30.77,31.53)]
for hold in (1, 2):
    for merge in (6, 8, 10):
        res = {}
        for k, (ms, a, fps, n) in data.items():
            t = Q.EventTracker(link=2, merge=merge, hold=hold)
            for i, m in ms:
                t.add(i, m, 1/(a*a), a)
            res[k] = (t, n, fps)
        for vox in (2000, 3000, 5000):
            out = []
            for k, (t, n, fps) in res.items():
                ev = [e['onset'] for e in t.events(vox)]
                rate = len(ev) / (n / fps)
                med = float(np.median(np.diff(ev))) if len(ev) > 1 else 0
                s = f'{k[3:]} {rate:5.2f}/s med {med:.0f}'
                if k == 'mk_ref1':
                    pts = [0] + ev + [n]
                    g = [(pts[j+1]-pts[j])/fps for j in range(len(pts)-1) if not any(a_<=pts[j]/fps<=b or a_<=pts[j+1]/fps<=b for a_,b in tr1)]
                    s += f' gap {max(g):.2f}'
                out.append(s)
            print(f'hold={hold} merge={merge} vox={vox} | ' + ' | '.join(out), flush=True)
