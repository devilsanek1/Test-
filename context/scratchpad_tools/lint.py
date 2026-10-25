"""Lint docs/storyboard_v3.json: resolve {w, dt} anchors against the timing file and check the director's rules."""
import json, re, sys
ROOT = '/home/user/Test-/video'
SB = json.load(open(f'{ROOT}/docs/storyboard_v3.json'))
TM = json.load(open(f'{ROOT}/assets/timing_est_v3.json'))
W = TM['words']; WS = [w['s'] for w in W]
WORDS = SB['wordsRef'].split()
issues = []
def issue(sev, where, msg):
    issues.append((sev, where, msg)); print(f'[{sev}] {where}: {msg}')
def isA(x): return isinstance(x, dict) and set(x.keys()) == {'w', 'dt'}
def R(a): return WS[a['w']] + a['dt']
# 0. every anchor valid + no stray seconds in time fields
TIMEKEYS = {'t', 't0', 't1', 's', 'e', 'start', 'end', 'at', 'out', 'duration', 'coverFrame', 'captionAt'}
def walk(o, path):
    if isinstance(o, dict):
        if isA(o):
            if not (0 <= o['w'] < len(WORDS)): issue('blocker', path, f'w out of range {o}')
            return
        for k, v in o.items():
            if k in ('est',): continue
            if k in TIMEKEYS and isinstance(v, (int, float)) and not isinstance(v, bool):
                issue('blocker', path + '.' + k, f'numeric time {v} (must be an anchor)')
            walk(v, path + '.' + k)
    elif isinstance(o, list):
        for i, v in enumerate(o): walk(v, f'{path}[{i}]')
walk(SB, 'root')
assert SB['wordsRef'] == TM['wordsRef'] and len(WORDS) == 178
sc = SB['scenes']; DUR = R(SB['duration'])
print('== TILING')
if abs(R(sc[0]['start'])) > 1e-6: issue('blocker', 'S01', f"start {R(sc[0]['start'])}")
for a, b in zip(sc, sc[1:]):
    if a['end'] != b['start']: issue('blocker', f"{a['id']}/{b['id']}", 'end != next start (anchors differ)')
if abs(R(sc[-1]['end']) - DUR) > 1e-6: issue('blocker', 'last', 'end != duration')
for s in sc:
    d = R(s['end']) - R(s['start'])
    ok = (3.5 <= d <= 8.0) or s['id'] in SB['acceptedShortScenes'] + SB['acceptedLongScenes']
    if not ok: issue('minor', s['id'], f'duration {d:.2f}')
    if d < 1.8: issue('major', s['id'], f'duration {d:.2f} < 1.8')
    a0, a1 = s['words']
    if not (WS[a0] >= R(s['start']) - 0.6 and (a1 == 177 or WS[a1 + 1] >= R(s['end']) - 0.05)):
        issue('major', s['id'], 'words range vs start/end')
print(f'  {len(sc)} scenes, {DUR:.2f} s')
print('== BOUNDARIES (pauses)')
P = TM['pauses']
for a, b in zip(sc, sc[1:]):
    t = R(a['end'])
    hit = [p for p in P if p['s'] - 1e-6 <= t <= p['e'] + 1e-6]
    if not hit and b['id'] not in SB['acceptedPhraseBoundaries']: issue('major', f"{a['id']}/{b['id']} {t:.2f}", 'not inside a pause')
    tr = b['transitionIn']
    if not (R(tr['t0']) - 1e-6 <= R(b['start']) <= R(tr['t1']) + 1e-6): issue('minor', b['id'], 'transition window does not contain the cut')
print('== CAPTIONS')
try:
    from fontTools.ttLib import TTFont
    f = TTFont(f'{ROOT}/node_modules/@fontsource/patrick-hand/files/patrick-hand-latin-400-normal.woff')
    cm, hm, upm = f.getBestCmap(), f['hmtx'], f['head'].unitsPerEm
    def tw(s, size): return sum(hm[cm[ord(c)]][0] if ord(c) in cm else upm * 0.5 for c in s) * size / upm
except Exception as e:
    tw = None; print('no font', e)
wi = 0; pages = []
for s in sc:
    for ci, c in enumerate(s['captions']):
        pages.append((s, ci, c))
        if len(c['lines']) > 2: issue('blocker', f"{s['id']} cap{ci}", '>2 lines')
        if len(c['highlights']) > 1: issue('major', f"{s['id']} cap{ci}", '>1 highlight')
        pw = []
        for li, l in enumerate(c['lines']):
            toks = l['text'].split()
            if l['s']['w'] != wi or l['s']['dt'] != 0: issue('major', f"{s['id']} cap{ci} line{li}", f"line s {l['s']} != word {wi}")
            for t in toks:
                if wi >= 178 or WORDS[wi] != t: issue('blocker', f"{s['id']} cap{ci}", f"'{t}' != word {wi} '{WORDS[wi] if wi < 178 else None}'")
                pw.append(wi); wi += 1
            if tw and tw(l['text'], 98) > 850.5: issue('major', f"{s['id']} cap{ci}", f"'{l['text']}' {tw(l['text'], 98):.0f} px")
        if c['s'] != c['lines'][0]['s']: issue('minor', f"{s['id']} cap{ci}", 'page s != line 1 s')
        for h in c['highlights']:
            ht = h['text'].split()
            pos = next((pw[k] for k in range(len(pw) - len(ht) + 1) if WORDS[pw[k]:pw[k] + len(ht)] == ht), None)
            if pos is None: issue('blocker', f"{s['id']} cap{ci}", f"highlight '{h['text']}' not in page"); continue
            if h['s'] != {'w': pos, 'dt': 0.0}: issue('major', f"{s['id']} cap{ci}", f"highlight s {h['s']} != word {pos}")
            if not any(h['text'] in l['text'] for l in c['lines']): issue('major', f"{s['id']} cap{ci}", 'highlight spans lines')
        d = R(c['e']) - R(c['s']); key = ' / '.join(l['text'] for l in c['lines'])
        if d < 1.4 and key not in SB['acceptedShortPages'] and c['lines'][0]['text'] not in SB['acceptedShortPages']: issue('minor', f"{s['id']} cap{ci}", f"'{key}' {d:.2f} s")
if wi != 178: issue('blocker', 'captions', f'{wi}/178 words')
else: print('  all 178 words covered once, in order')
for (s1, i1, c1), (s2, i2, c2) in zip(pages, pages[1:]):
    if c1['e'] != c2['s']: issue('minor', f"{s1['id']}[{i1}]", 'page e != next s')
if pages[-1][2]['e'] != SB['duration']: issue('major', 'last page', 'e != duration')
print(f'  {len(pages)} pages, widest line {max(tw(l["text"], 98) for _, _, c in pages for l in c["lines"]):.0f} px')
print('== CAMERA / MATCH / CEILING')
def proj(cam, x, y): z = cam['zoom']; return (x - cam['x']) * z + 540, (y - cam['y']) * z + 960
LABEL = {'push-in': lambda dz, dx, dy: dz > 0, 'pull-back': lambda dz, dx, dy: dz < 0, 'truck-right': lambda dz, dx, dy: dx > 0, 'tilt-up': lambda dz, dx, dy: dy < 0,
         'crane-up': lambda dz, dx, dy: dy < 0, 'hold': lambda dz, dx, dy: abs(dz) <= 0.05 and abs(dx) <= 5 and abs(dy) <= 5}
def chk_match(where, ca, cb, m):
    pa, pb = m['prev'], m['next']; tol = m.get('tol', 0.05)
    if m.get('prevSpace') == 'screen': xa, ya, za = pa['cx'], pa['cy'], 1
    else: (xa, ya), za = proj(ca, pa['cx'], pa['cy']), ca['zoom']
    if m.get('nextSpace') == 'screen': xb, yb, zb = pb['cx'], pb['cy'], 1
    else: (xb, yb), zb = proj(cb, pb['cx'], pb['cy']), cb['zoom']
    wa, wb, ha, hb = pa['w'] * za, pb['w'] * zb, pa.get('h', pa['w']) * za, pb.get('h', pb['w']) * zb
    d = ((xa - xb) ** 2 + (ya - yb) ** 2) ** 0.5; rel = max(abs(wa - wb) / wa, abs(ha - hb) / ha)
    msg = f"'{m['id']}' ({xa:.0f},{ya:.0f}) {wa:.1f}x{ha:.1f} -> ({xb:.0f},{yb:.0f}) {wb:.1f}x{hb:.1f}"
    if d > 14 or rel > tol: issue('major', where, msg + f' off {d:.1f}px {rel*100:.0f}%')
    else: print('  ok', where, msg)
for k, s in enumerate(sc):
    cams = s['camera']
    if cams[0]['t0'] != s['start'] or cams[-1]['t1'] != s['end']: issue('minor', s['id'], 'camera does not cover the scene')
    for c in cams:
        if R(c['t1']) <= R(c['t0']): issue('major', s['id'], f"empty camera seg {c['move']}")
        dz, dx, dy = c['to']['zoom'] - c['from']['zoom'], c['to']['x'] - c['from']['x'], c['to']['y'] - c['from']['y']
        if not LABEL.get(c['move'], lambda *a: True)(dz, dx, dy): issue('minor', s['id'], f"camera label {c['move']} {c['from']}->{c['to']}")
    for a, b in zip(cams, cams[1:]):
        if a['t1'] != b['t0']: issue('major', s['id'], 'camera gap')
        if a['to'] != b['from'] and not b.get('cut'): issue('major', s['id'], f"camera jump without cut at {b['move']}")
        for m in b.get('match', []): chk_match(f"{s['id']} cut", a['to'], b['from'], m)
    prev = sc[k - 1] if k else sc[-1]
    for m in s['transitionIn'].get('match', []): chk_match(f"{prev['id']}->{s['id']}", prev['camera'][-1]['to'], cams[0]['from'], m)
    if k and s['transitionIn']['type'] == 'camera-continuous' and prev['camera'][-1]['to'] != cams[0]['from'] and not s['transitionIn'].get('match'):
        issue('major', s['id'], 'camera-continuous jump')
    keys = []
    for c in cams:
        if c.get('transition'): continue
        keys += [(R(c['t0']), c['from']), (R(c['t1']), c['to'])]
    for it in s.get('ceiling', []):
        t0 = R(it['t0']) if 't0' in it else -1; t1 = R(it['t1']) if 't1' in it else 1e9
        for t, cm_ in keys:
            if not (t0 - 1e-6 <= t <= t1 + 1e-6): continue
            if cm_['zoom'] >= 3: continue  # hidden-match frames show only house #4 (checked by the set)
            z = cm_['zoom']; x0, x1 = (it['x0'] - cm_['x']) * z + 540, (it['x1'] - cm_['x']) * z + 540
            if x1 < 90 or x0 > 990: continue
            sy = (it['top'] - cm_['y']) * z + 960
            if sy < 559.5: issue('major', f"{s['id']} ceiling '{it['id']}' t={t:.2f}", f'screen y {sy:.0f} (cam {cm_})')
    for kk in s['sunKeys']:
        top = kk['y'] - kk['r'] * max(1, kk.get('scale', 1))
        if top < 559.5 and not kk.get('hidden'): issue('major', f"{s['id']} sun", f'top {top:.0f} at {kk}')
        if 'word' in kk and kk['kind'] in ('land', 'pulse', 'press', 'set-step', 'rise'):
            if kk['t'] != {'w': kk['word'], 'dt': 0.0}: issue('minor', f"{s['id']} sun {kk['kind']}", f"not on word {kk['word']}: {kk['t']}")
print('== BEATS / LIFE')
for s in sc:
    ts = [R(b['t']) for b in s['beats']]
    if ts != sorted(ts): issue('major', s['id'], 'beats not sorted: ' + str([round(x, 2) for x in ts]))
    st, en = R(s['start']), R(s['end'])
    for t in ts:
        if t < st - 0.5 or t > en + 1e-6: issue('minor', s['id'], f'beat {t:.2f} outside')
    evp = []
    for b in s['beats']:
        t0 = R(b['t']); n = max(1, b['events']); sp = b.get('span', 0.0)
        evp += [t0 + (sp * k / (n - 1) if n > 1 else 0) for k in range(n)]
    pts = [st] + sorted(evp) + [en]
    gaps = [(b - a, a) for a, b in zip(pts, pts[1:])]
    g, at = max(gaps)
    ev = sum(b['events'] for b in s['beats']); eps = ev / (en - st)
    flag = ''
    if g > 0.45: issue('major', s['id'], f'beat gap {g:.2f} s at {at:.2f}'); flag = ' <-- gap'
    if eps < 5: issue('major', s['id'], f'events/s {eps:.1f} < 5')
    print(f"  {s['id']} {st:6.2f}-{en:6.2f} ({en - st:4.2f}s) beats {len(ts):2d} events {ev:3d} = {eps:4.1f}/s, max gap {g:.2f}s{flag}")
    for x in s['sfx']:
        if not (st - 0.5 <= R(x['t']) <= en + 0.01): issue('minor', s['id'], f"sfx {x['sound']} outside")
print('== LABELS')
need = {'PHP2Shell · two linked flaws', 'no password · control of the site and its data', 'PHP · the code most websites are built with', 'of sites whose server language is known · W3Techs',
        'in the code since at least 2012', 'found with AI help · reported privately in August', 'word leaked Oct 20 · fix out Oct 21', 'Cloudflare · sits in front of about 1 in 5 websites',
        'first 45 min: tens of thousands', 'millions · within a day', "Updating WordPress won't fix it", 'Rough estimate from W3Techs data · only sites that show their version · some hosts patch old versions themselves', 'FBI · NSA · UK NCSC · CERT-EU'}
L9 = "Matthew Prince, Cloudflare CEO, on X · counted from the public announcement · Cloudflare's own count · attempts, not break-ins"
have = set(); l9parts = []
for s in sc:
    for l in s['labels']:
        have.add(l['text'])
        if l.get('partOf'): l9parts.append(l['text'])
        if ''.join(l['lines']).replace(' ', '').replace('·', '') != l['text'].replace(' ', '').replace('·', ''): issue('minor', s['id'], f"label lines != text: {l['id']}")
        hold = R(l['out']) - R(l['at'])
        if hold < 1.5 - 1e-6: issue('major', f"{s['id']} {l['id']}", f'hold {hold:.2f} s < 1.5')
        wmax = max(tw(x, l['size']) for x in l['lines']) if tw else 0
        print(f"  {s['id']} {l['id']:4s} {R(l['at']):6.2f}-{R(l['out']):6.2f} hold {hold:4.2f}s  widest line {wmax:4.0f}px @{l['size']}  {l['text'][:60]}")
miss = need - have
if miss: issue('blocker', 'labels', f'missing {miss}')
# L9 words kept in the split
seg = [x.strip() for x in L9.split(' · ')]
joined = ' · '.join(l9parts)
for x in seg:
    if x not in joined: issue('blocker', 'L9', f"segment '{x}' missing")
print('== MASCOT POSES')
md = open(f'{ROOT}/docs/mascot.md').read()
poses = set(re.findall(r"^\| `([a-z\-]+)` \|", md, re.M))
cand = re.compile(r"\b((?:sit|stand|walk|trunk|ears|hold|shrug|sleep|peek)-[a-z]+)\b")
for s in sc:
    for txt in [s['mascot']] + [b['action'] for b in s['beats']]:
        for m in set(cand.findall(txt)):
            if m not in poses and m not in ('trunk-tip',): issue('major', s['id'], f"pose '{m}'")
print('== BIT')
for s in sc:
    if not s.get('bit', {}).get('where'): issue('major', s['id'], 'no Bit spot')
print('  Bit placed in all', len(sc), 'scenes')
n = {k: sum(1 for i in issues if i[0] == k) for k in ('blocker', 'major', 'minor')}
print('TOTAL', n)
sys.exit(1 if n['blocker'] or n['major'] else 0)
