import json
ROOT = '/home/user/Test-/video'
T = json.load(open(f'{ROOT}/assets/timing_est_v3.json'))
WS = [w['s'] for w in T['words']]
WORDS = T['wordsRef'].split()
END_DT = round(T['duration'] - WS[177], 3)


def A(w, dt=0.0):
    return {'w': w, 'dt': round(float(dt), 3)}


def est(a):
    return round(WS[a['w']] + a['dt'], 3)


START = A(0, -WS[0])   # = 0 s: the film starts leadIn before word 0
END = A(177, END_DT)   # = voEnd + tail


def B(a, action, events=1, **kw):
    d = {'t': a, 'action': action, 'events': events}
    d.update(kw)
    return d


def S(a, sound, notes=''):
    return {'t': a, 'sound': sound, 'notes': notes}


def page(s, e, lines, hl=None, tone='dark', **kw):
    d = {'s': s, 'e': e, 'lines': [{'text': t, 's': a} for t, a in lines], 'highlights': [] if not hl else [{'text': hl[0], 's': hl[1]}], 'tone': tone}
    d.update(kw)
    return d


def cam(t0, t1, move, f, t, ease, why, **kw):
    d = {'t0': t0, 't1': t1, 'move': move, 'from': {'x': f[0], 'y': f[1], 'zoom': f[2]}, 'to': {'x': t[0], 'y': t[1], 'zoom': t[2]}, 'ease': ease, 'why': why}
    d.update(kw)
    return d


def sk(a, kind, x, y, r, note='', **kw):
    d = {'t': a, 'kind': kind, 'x': x, 'y': y, 'r': r}
    d.update(kw)
    if note:
        d['note'] = note
    return d


def el(id_, what, where, style=''):
    return {'id': id_, 'what': what, 'where': where, 'style': style}


def label(id_, text, lines, at, out, on, where, size=40, style='tag', mandatory=True, **kw):
    d = {'id': id_, 'text': text, 'lines': lines, 'at': at, 'out': out, 'on': on, 'where': where, 'size': size, 'style': style, 'mandatory': mandatory}
    d.update(kw)
    return d
