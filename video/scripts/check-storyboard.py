#!/usr/bin/env python3
"""Mechanical checks for docs/storyboard.json (director's lint).

  python3 -I scripts/check-storyboard.py [--sb docs/storyboard.json] [--timing assets/timing_v1.json]

The timing file defaults to the one whose duration matches the storyboard's `duration`
(assets/timing_v1.json for the v1 timeline the storyboard is authored on, assets/timing.json after a timewarp).

Checks: scene tiling and lengths; captions reproduce the transcript word for word; line / page / highlight times
against word starts; line count, characters and measured width (Patrick Hand at the sky-caption size); page
lengths; scene boundaries inside pauses; transition windows; element ids (incl. `inheritsElements` and
`contains`), persist ids, beat id references; camera segments (sequence, continuity, labels, coverage, cuts);
match-cuts (`transitionIn.match`: the match object keeps screen position and size across the cut);
SKY CEILING (every `ceiling` item and every `sunKeys` disc projected through every camera keyframe must stay
at screen y >= 560 inside x 90-990); sun character beats on their word (+-0.05 s); mascot poses vs docs/mascot.md;
beat gaps. Exit code 1 on any blocker/major.
"""
import argparse
import json
import os
import re
import sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
ap = argparse.ArgumentParser()
ap.add_argument('--sb', default=os.path.join(ROOT, 'docs/storyboard.json'))
ap.add_argument('--timing', default=None)
ap.add_argument('--quiet', action='store_true')
args = ap.parse_args()

SB = json.load(open(args.sb))
if args.timing:
    TM = json.load(open(args.timing))
else:
    TM = None
    for cand in ('assets/timing_v1.json', 'assets/timing.json'):
        p = os.path.join(ROOT, cand)
        if os.path.exists(p):
            t = json.load(open(p))
            if abs(t['duration'] - SB.get('duration', 0)) < 1e-3:
                TM = t
                print('timing:', cand)
                break
    if TM is None:
        sys.exit('no timing file matches the storyboard duration; pass --timing')
MASCOT_MD = open(os.path.join(ROOT, 'docs/mascot.md')).read()

CEIL_Y = 560          # nothing but flat sky above this screen y inside x 90-990 (caption clip 280-570)
BAND_X = (90, 990)
TOL = 0.05
DUR = TM['duration']
W = TM['words']
issues = []


def issue(sev, where, problem):
    issues.append((sev, where, problem))
    print(f'[{sev}] {where}: {problem}')


def norm(tok):
    tok = tok.lower().replace('’', "'")
    return re.sub(r"[^a-z0-9'\-]", '', tok).strip("'-")


wnorm = [norm(w['w']) for w in W]
scenes = SB['scenes']
byid = {s['id']: s for s in scenes}

# optional measured caption width (Patrick Hand)
try:
    from fontTools.ttLib import TTFont
    _f = TTFont(os.path.join(ROOT, 'node_modules/@fontsource/patrick-hand/files/patrick-hand-latin-400-normal.woff'))
    _cmap, _hmtx, _upm = _f.getBestCmap(), _f['hmtx'], _f['head'].unitsPerEm

    def textw(s, size):
        return sum(_hmtx[_cmap[ord(c)]][0] if ord(c) in _cmap else _upm * 0.5 for c in s) * size / _upm
except Exception:  # noqa: BLE001
    textw = None

band = SB.get('captionBand', {})
CAP_SIZE = band.get('size', 98)
CAP_MAX = band.get('maxWidth', 850)
WIDE_OK = set(band.get('acceptedWide', []))
SHORT_OK = set(SB.get('acceptedShortPages', []))
LONG_OK = set(SB.get('acceptedLongScenes', []))

print('=' * 20, 'TILING')
if abs(scenes[0]['start']) > 1e-6:
    issue('blocker', scenes[0]['id'], 'first scene must start at 0')
for a, b in zip(scenes, scenes[1:]):
    if abs(a['end'] - b['start']) > 1e-6:
        issue('blocker', f"{a['id']}/{b['id']}", f"gap/overlap {a['end']} vs {b['start']}")
if abs(scenes[-1]['end'] - DUR) > 1e-6:
    issue('blocker', scenes[-1]['id'], f"last end {scenes[-1]['end']} != {DUR}")
for s in scenes:
    d = s['end'] - s['start']
    if not (3.5 - 1e-6 <= d <= 8.0 + 1e-6) and s['id'] not in LONG_OK:
        issue('minor', s['id'], f'duration {d:.2f}s outside 3.5-8 s')
print(f'  {len(scenes)} scenes')

print('=' * 20, 'CAPTIONS')
caps = [(s, ci, c) for s in scenes for ci, c in enumerate(s['captions'])]
wi = 0
line_words = {}
for s, ci, c in caps:
    for li, l in enumerate(c['lines']):
        toks = [norm(t) for t in l['text'].split() if norm(t)]
        idxs = []
        for t in toks:
            if wi < len(W) and wnorm[wi] == t:
                idxs.append(wi)
                wi += 1
            else:
                idxs.append(None)
        if any(i is None for i in idxs):
            issue('blocker', f"{s['id']} caption[{ci}] line[{li}] '{l['text']}'", f'does not match the transcript at word {wi}')
        line_words[(s['id'], ci, li)] = idxs
if wi != len(W):
    issue('blocker', 'captions', f'{wi}/{len(W)} words covered')
else:
    print(f'  all {len(W)} words covered once, in order')
for s, ci, c in caps:
    allidx = []
    for li, l in enumerate(c['lines']):
        idxs = line_words[(s['id'], ci, li)]
        if idxs and idxs[0] is not None:
            ws = W[idxs[0]]['s']
            if abs(l['s'] - ws) > TOL:
                issue('major', f"{s['id']} caption[{ci}] line[{li}]", f"s={l['s']} vs word start {ws}")
        allidx += [i for i in idxs if i is not None]
        if len(l['text']) > 26:
            issue('major', f"{s['id']} caption[{ci}] '{l['text']}'", f"{len(l['text'])} chars > 26")
        if textw:
            wpx = textw(l['text'], CAP_SIZE)
            if wpx > CAP_MAX + 0.5 and l['text'] not in WIDE_OK:
                issue('major', f"{s['id']} caption[{ci}] '{l['text']}'", f'{wpx:.0f} px > {CAP_MAX} at {CAP_SIZE} px')
    if len(c['lines']) > 2:
        issue('blocker', f"{s['id']} caption[{ci}]", '> 2 lines')
    if not allidx:
        continue
    if abs(c['s'] - W[allidx[0]]['s']) > TOL or abs(c['s'] - c['lines'][0]['s']) > 1e-6:
        issue('minor', f"{s['id']} caption[{ci}] page s", f"{c['s']} vs first word {W[allidx[0]]['s']}")
    if c['e'] < W[allidx[-1]]['e'] - 0.02:
        issue('major', f"{s['id']} caption[{ci}]", f"ends {c['e']} before its last word ends")
    hl = c.get('highlights', [])
    if len(hl) > 1:
        issue('major', f"{s['id']} caption[{ci}]", f'{len(hl)} highlights')
    for h in hl:
        ht = [norm(t) for t in h['text'].split() if norm(t)]
        pos = next((allidx[k] for k in range(len(allidx) - len(ht) + 1) if [wnorm[i] for i in allidx[k:k + len(ht)]] == ht), None)
        if pos is None:
            issue('blocker', f"{s['id']} caption[{ci}] highlight '{h['text']}'", 'not in page')
            continue
        if abs(h['s'] - W[pos]['s']) > TOL:
            issue('major', f"{s['id']} caption[{ci}] highlight '{h['text']}'", f"s={h['s']} vs word {W[pos]['s']} ({h['s'] - W[pos]['s']:+.3f})")
        if not any(h['text'] in l['text'] for l in c['lines']):
            issue('major', f"{s['id']} caption[{ci}] highlight '{h['text']}'", 'spans two lines')
    dur = c['e'] - c['s']
    key = ' / '.join(l['text'] for l in c['lines'])
    if dur < 1.4 - 1e-6 and key not in SHORT_OK:
        issue('minor', f"{s['id']} caption[{ci}] '{key}'", f'page {dur:.2f} s < 1.4 s')
for (s1, i1, c1), (s2, i2, c2) in zip(caps, caps[1:]):
    if abs(c1['e'] - c2['s']) > 1e-6:
        issue('minor', f"{s1['id']}[{i1}]->{s2['id']}[{i2}]", f"page e {c1['e']} != next s {c2['s']}")
if abs(caps[-1][2]['e'] - DUR) > 1e-6:
    issue('major', 'last caption page', f"e {caps[-1][2]['e']} != {DUR}")

print('=' * 20, 'BOUNDARIES')
P = TM['pauses']
for a, b in zip(scenes, scenes[1:]):
    t = a['end']
    hit = [p for p in P if p['s'] - 1e-6 <= t <= p['e'] + 1e-6]
    if not hit:
        issue('major', f"{a['id']}/{b['id']} {t}", 'boundary not inside a pause')
    elif hit[0]['kind'] != 'sentence' and b['id'] not in set(SB.get('acceptedPhraseBoundaries', [])):
        issue('minor', f"{a['id']}/{b['id']} {t}", f"'{hit[0]['kind']}' pause, not a sentence end")
    tr = b['transitionIn']
    m = re.match(r'\s*(\d+\.\d+)\s*-\s*(\d+\.\d+)', tr.get('notes', ''))
    if m and abs((float(m.group(2)) - float(m.group(1))) - tr['dur']) > 0.03:
        issue('minor', f"{b['id']}.transitionIn", f"notes window {m.group(1)}-{m.group(2)} != dur {tr['dur']}")

print('=' * 20, 'ELEMENT IDS')
GLOBAL = {'sun', 'pip', 'bit', 'snail', 'scaleX', 'scaleY', 'inkHair', 'inOut', 'tealDark', 'mintPale'}


def ids_of(sid, seen=None):
    seen = seen or set()
    if sid in seen:
        return set()
    seen.add(sid)
    s = byid[sid]
    out = set()
    for e in s['elements']:
        out.add(e['id'])
        out |= set(e.get('contains', []))
    inh = s.get('inheritsElements')
    for h in ([inh] if isinstance(inh, str) else (inh or [])):
        out |= ids_of(h, seen)
    return out


all_ids = {s['id']: ids_of(s['id']) for s in scenes}
idre = re.compile(r"\b([a-z]+[A-Z][A-Za-z0-9]*)\b")
for k, s in enumerate(scenes):
    own = [e['id'] for e in s['elements']]
    dup = {i for i in own if own.count(i) > 1}
    if dup:
        issue('minor', s['id'], f'duplicate ids {dup}')
    ids = all_ids[s['id']]
    for b in s['beats']:
        for m in idre.findall(b['action']):
            if m not in ids and m not in GLOBAL:
                issue('minor', f"{s['id']} beat {b['t']}", f"'{m}' is not an element of this scene")
    prev = scenes[k - 1] if k else scenes[-1]
    for pid in s['transitionIn'].get('persist', []):
        if pid in GLOBAL:
            continue
        miss = [x for x, ok in ((s['id'], pid in ids), (prev['id'], pid in all_ids[prev['id']])) if not ok]
        if miss:
            issue('minor', f"{s['id']}.persist '{pid}'", f'missing in {miss}')
    for g in ('sun', 'pip'):
        if g not in ids:
            issue('minor', s['id'], f"no '{g}' element")
    ts = [b['t'] for b in s['beats']]
    if ts != sorted(ts):
        issue('minor', s['id'], 'beats not sorted')
    for b in s['beats']:
        if b['t'] < s['start'] - 0.5 or b['t'] > s['end'] + 0.01:
            issue('minor', f"{s['id']} beat {b['t']}", 'outside the scene')


def proj(cam, x, y):
    z = cam['zoom']
    return (x - cam['x']) * z + 540, (y - cam['y']) * z + 960


print('=' * 20, 'CAMERA')
LABEL = {'push-in': lambda dz, dx, dy: dz > 0, 'pull-back': lambda dz, dx, dy: dz < 0, 'truck-right': lambda dz, dx, dy: dx > 0,
         'truck-left': lambda dz, dx, dy: dx < 0, 'tilt-up': lambda dz, dx, dy: dy < 0, 'tilt-down': lambda dz, dx, dy: dy > 0,
         'crane-up': lambda dz, dx, dy: dy < 0, 'hold': lambda dz, dx, dy: abs(dz) <= 0.05 and abs(dx) <= 5 and abs(dy) <= 5}
for k, s in enumerate(scenes):
    cam = s['camera']
    for c in cam:
        if c['t0'] < s['start'] - 1e-6 or c['t1'] > s['end'] + 1e-6 or c['t1'] <= c['t0']:
            issue('major', f"{s['id']} camera {c['t0']}-{c['t1']}", 'outside the scene or empty')
        f, t = c['from'], c['to']
        ok = LABEL.get(c['move'], lambda *a: True)(t['zoom'] - f['zoom'], t['x'] - f['x'], t['y'] - f['y'])
        if not ok:
            issue('minor', f"{s['id']} camera {c['t0']} '{c['move']}'", f'label does not match {f} -> {t}')
        if c.get('ease', '').startswith('linear') and c['move'] != 'hold':
            issue('minor', f"{s['id']} camera {c['t0']}", 'linear move starts from rest')
    for a, b in zip(cam, cam[1:]):
        if abs(b['t0'] - a['t1']) > 1e-6:
            issue('major', f"{s['id']} camera", f"gap/overlap {a['t1']} -> {b['t0']}")
        if a['to'] != b['from'] and not b.get('cut'):
            issue('major', f"{s['id']} camera {b['t0']}", f"jump {a['to']} -> {b['from']} without cut: true")
    if cam[0]['t0'] > s['start'] + 1e-6 or cam[-1]['t1'] < s['end'] - 1e-6:
        issue('minor', f"{s['id']} camera", 'does not cover the scene')
    tr = s['transitionIn']
    if k and tr['type'] == 'camera-continuous' and scenes[k - 1]['camera'][-1]['to'] != cam[0]['from'] and not tr.get('match'):
        issue('major', f"{s['id']} camera-continuous", 'camera jumps and no match spec')

print('=' * 20, 'MATCH-CUTS')


def check_match(where, cam_a, cam_b, m):
    sa, sb_ = m.get('prevSpace', 'world'), m.get('nextSpace', 'world')
    pa, pb = m['prev'], m['next']
    (xa, ya), za = (proj(cam_a, pa['cx'], pa['cy']) if sa == 'world' else (pa['cx'], pa['cy'])), (cam_a['zoom'] if sa == 'world' else 1)
    (xb, yb), zb = (proj(cam_b, pb['cx'], pb['cy']) if sb_ == 'world' else (pb['cx'], pb['cy'])), (cam_b['zoom'] if sb_ == 'world' else 1)
    wa, wb = pa['w'] * za, pb['w'] * zb
    ha, hb = pa.get('h', pa['w']) * za, pb.get('h', pb['w']) * zb
    d = ((xa - xb) ** 2 + (ya - yb) ** 2) ** 0.5
    rel = max(abs(wa - wb) / max(wa, 1e-6), abs(ha - hb) / max(ha, 1e-6))
    msg = f"'{m['id']}' screen ({xa:.0f},{ya:.0f}) {wa:.1f}x{ha:.1f} -> ({xb:.0f},{yb:.0f}) {wb:.1f}x{hb:.1f}"
    if d > 4 or rel > 0.05:
        issue('major', where, msg + f' (off by {d:.1f} px, {rel * 100:.0f}%)')
    elif not args.quiet:
        print('  ok', where, msg)


for k, s in enumerate(scenes):
    prev = scenes[k - 1] if k else scenes[-1]
    for m in s['transitionIn'].get('match', []):
        check_match(f"{prev['id']}->{s['id']}", prev['camera'][-1]['to'], s['camera'][0]['from'], m)
    for a, b in zip(s['camera'], s['camera'][1:]):
        for m in b.get('match', []):
            check_match(f"{s['id']} cut {b['t0']}", a['to'], b['from'], m)

print('=' * 20, 'SKY CEILING')


def cam_at(s, t):
    for c in s['camera']:
        if c['t0'] - 1e-6 <= t <= c['t1'] + 1e-6:
            if abs(t - c['t0']) < 1e-6:
                return c['from']
            if abs(t - c['t1']) < 1e-6:
                return c['to']
    return None


for s in scenes:
    keys = []
    for c in s['camera']:
        if c.get('transition'):
            continue
        keys += [(c['t0'], c['from']), (c['t1'], c['to'])]
    for item in s.get('ceiling', []):
        t0, t1 = item.get('t0', -1), item.get('t1', 1e9)
        for t, cam in keys:
            if not (t0 - 1e-6 <= t <= t1 + 1e-6):
                continue
            z = cam['zoom']
            sx0, sx1 = (item['x0'] - cam['x']) * z + 540, (item['x1'] - cam['x']) * z + 540
            if sx1 < BAND_X[0] or sx0 > BAND_X[1]:
                continue
            sy = (item['top'] - cam['y']) * z + 960
            if sy < CEIL_Y - 0.5:
                issue('major', f"{s['id']} ceiling '{item['id']}' t={t}", f"top at screen y {sy:.0f} < {CEIL_Y} (cam {cam})")
    for sk in s.get('sunKeys', []):
        top = sk['y'] - sk['r'] * sk.get('scale', 1)
        if top < CEIL_Y - 0.5 and sk.get('hidden') is not True:
            issue('major', f"{s['id']} sun t={sk['t']}", f"top at {top:.0f} < {CEIL_Y}")
        for gr in sk.get('glow', []):
            if sk['y'] - gr < CEIL_Y - 0.5:
                issue('major', f"{s['id']} sun glow t={sk['t']}", f"glow r{gr} top {sk['y'] - gr:.0f} < {CEIL_Y}")

print('=' * 20, 'SUN SYNC')
for s in scenes:
    for sk in s.get('sunKeys', []):
        if 'word' not in sk or sk['kind'] not in ('land', 'pulse', 'press', 'touch', 'set-step'):
            continue
        idx = sk['word']
        ws = W[idx]['s']
        if abs(sk['t'] - ws) > TOL + 1e-6:
            issue('minor', f"{s['id']} sun {sk['kind']} t={sk['t']}", f"word '{W[idx]['w']}' starts {ws} ({sk['t'] - ws:+.3f})")

print('=' * 20, 'MASCOT')
poses = set(re.findall(r"^\| `([a-z\-]+)` \|", MASCOT_MD, re.M))
cand = re.compile(r"\b((?:sit|stand|walk|trunk|ears|ear|lie|look|wave|peek|hold|shrug|sleep|run|jump|hop|nod)-[a-z]+)\b")
for s in scenes:
    for where, txt in [('mascot', s['mascot'])] + [(f"beat {b['t']}", b['action']) for b in s['beats']]:
        for m in set(cand.findall(txt)):
            if m not in poses and m not in ('trunk-tip', 'look-to'):
                issue('major', f"{s['id']} {where}", f"pose '{m}' not in docs/mascot.md")
        for m in re.findall(r"expression[: ]+'?([a-z]+)", txt):
            if m not in {'neutral', 'happy', 'wide', 'worried', 'meh', 'closed'}:
                issue('minor', f"{s['id']} {where}", f"expression '{m}'")
for m in set(cand.findall(SB['mascot']['design'])):
    if m not in poses:
        issue('major', 'root mascot.design', f"pose '{m}' not in docs/mascot.md")

print('=' * 20, 'BEAT GAPS')
bt = sorted(b['t'] for s in scenes for b in s['beats'])
gaps = [(a, b) for a, b in zip(bt, bt[1:]) if b - a > 1.0]
for a, b in gaps:
    issue('minor', 'beats', f'gap {a:.2f} -> {b:.2f} ({b - a:.2f} s)')
print(f'  {len(bt)} beats, longest gap {max(b - a for a, b in zip(bt, bt[1:])):.2f} s')

n = {k: sum(1 for i in issues if i[0] == k) for k in ('blocker', 'major', 'minor')}
print(f"\nTOTAL {len(issues)} issues: {n}")
sys.exit(1 if n['blocker'] or n['major'] else 0)
