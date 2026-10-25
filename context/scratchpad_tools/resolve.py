import json,sys
d=json.load(open('/home/user/Test-/video/docs/storyboard_v3.json'))
E=json.load(open('/home/user/Test-/video/assets/timing_est_v3.json'))['words']
M=json.load(open('/home/user/Test-/video/assets/timing.json'))['words']
def R(a,W): return W[a['w']]['s']+a['dt']
print('scene  est(s-e,dur)   meas(s-e,dur)  maxgap_est maxgap_meas')
for s in d['scenes']:
    out=[]
    for W in (E,M):
        st=R(s['start'],W); en=R(s['end'],W) if 'w' in s['end'] else None
        ts=sorted([R(b['t'],W) for b in s['beats']]+[st,en])
        gaps=[(ts[i+1]-ts[i],ts[i]) for i in range(len(ts)-1)]
        g=max(gaps)
        out.append((st,en,en-st,g))
    print(s['id'], ' '.join(f'{o[0]:.2f}-{o[1]:.2f} ({o[2]:.2f}) gap {o[3][0]:.2f}@{o[3][1]:.2f}' for o in out))
print()
print('labels (meas)')
for s in d['scenes']:
    for L in s['labels']:
        a=R(L['at'],M); b=R(L['outAt'],M) if 'outAt' in L else None
        print(s['id'],L.get('id'),repr(L.get('text'))[:70], f'{a:.2f}->{b:.2f} hold {b-a:.2f}' if b else a, 'words',len(str(L.get('text')).split()))
print()
print('caption pages (meas)')
for s in d['scenes']:
    for c in s['captions']:
        a=R(c['s'],M); b=R(c['e'],M)
        print(s['id'], f'{a:6.2f}-{b:6.2f} ({b-a:.2f})', ' / '.join(l['text'] for l in c['lines']), '| HL:', [h['text'] for h in c.get('highlights',[])])
