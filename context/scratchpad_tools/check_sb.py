#!/usr/bin/env python3
"""Mechanical sync & completeness checker for docs/storyboard.json vs assets/timing.json."""
import json, re, sys
from collections import defaultdict

ROOT = '/home/user/Test-/video'
SB = json.load(open(f'{ROOT}/docs/storyboard.json'))
TM = json.load(open(f'{ROOT}/assets/timing.json'))
MASCOT_MD = open(f'{ROOT}/docs/mascot.md').read()
SB_MD = open(f'{ROOT}/docs/storyboard.md').read()

TOL = 0.05
DUR = TM['duration']
W = TM['words']
issues = []


def issue(sev, where, problem, fix):
    issues.append((sev, where, problem, fix))
    print(f'[{sev}] {where}: {problem}\n      FIX: {fix}')


def norm(tok):
    tok = tok.lower().replace('’', "'")
    return re.sub(r"[^a-z0-9'\-]", '', tok).strip("'-")


wnorm = [norm(w['w']) for w in W]
scenes = SB['scenes']

print('=' * 20, '(1) TILING')
if abs(scenes[0]['start']) > 1e-6:
    issue('blocker', scenes[0]['id'], f"first scene starts at {scenes[0]['start']}", 'set start 0.0')
for a, b in zip(scenes, scenes[1:]):
    if abs(a['end'] - b['start']) > 1e-6:
        issue('blocker', f"{a['id']}/{b['id']}", f"gap/overlap {a['end']} vs {b['start']}", f"set {b['id']}.start = {a['end']}")
if abs(scenes[-1]['end'] - DUR) > 1e-6:
    issue('blocker', scenes[-1]['id'], f"last end {scenes[-1]['end']} != {DUR}", f'set end {DUR}')
if abs(SB.get('duration', 0) - DUR) > 1e-6:
    issue('major', 'root.duration', f"{SB.get('duration')} != {DUR}", f'set {DUR}')
for s in scenes:
    d = s['end'] - s['start']
    print(f"  {s['id']} {s['start']:.3f}-{s['end']:.3f} dur {d:.2f}")
    if not (3.5 - 1e-6 <= d <= 8.0 + 1e-6):
        issue('minor', s['id'], f'duration {d:.2f}s outside 3.5-8 s', 'rebalance boundary into a neighbouring pause')
print('  scene count', len(scenes))

print('=' * 20, '(2) CAPTION WORD COVERAGE')
caps = []
for s in scenes:
    for ci, c in enumerate(s['captions']):
        caps.append((s, ci, c))
# map every caption line to word indices by sequential consumption
wi = 0
line_map = []  # (scene, ci, li, line, [word idx])
seq_ok = True
for s, ci, c in caps:
    for li, l in enumerate(c['lines']):
        toks = [norm(t) for t in l['text'].split() if norm(t)]
        idxs = []
        for t in toks:
            if wi < len(W) and wnorm[wi] == t:
                idxs.append(wi); wi += 1
            else:
                # tolerate loop-preroll duplicate (caption that repeats the opening at the end)
                idxs.append(None)
        line_map.append((s, ci, li, l, idxs, toks))
        if any(i is None for i in idxs):
            seq_ok = False
            # loop pre-roll check: does this line equal the first caption's first line?
            first_toks = [norm(t) for t in caps[0][2]['lines'][0]['text'].split()]
            if toks == first_toks and s is scenes[-1]:
                issue('major', f"{s['id']} caption[{ci}] line[{li}] '{l['text']}' s={l['s']}",
                      'a 3rd caption page re-speaks the opening line "Government websites" at 70.48 although the VO says no word there; '
                      'the concatenated captions therefore contain "Government websites" twice (transcript words not exactly once) and the '
                      'preceding page is cut at 70.48 instead of holding until the end of the video',
                      'delete this caption object from S13.captions and model the loop pre-roll outside the word track, e.g. add '
                      '"loopPreroll": {"text": "Government websites", "s": 70.48, "tone": "dark"} to the root "loop" spec (Captions engine renders it as page 0 '
                      'rolling in); set the previous page "or hope the hosting / company sorts it out." e = 70.687 (timing.json value). '
                      'Note also motion_spec loop recipe #5: the page scroll to the opening caption starts +0.67 s after the last word, which here is 70.445+... '
                      '= past the end; 70.48 is fine as the pre-roll time.')
            else:
                issue('blocker', f"{s['id']} caption[{ci}] line[{li}] '{l['text']}'", f'tokens {toks} do not match transcript at word {wi} ({wnorm[wi:wi+4]})', 'retype to transcript')
if wi != len(W):
    issue('blocker', 'captions', f'only {wi}/{len(W)} transcript words covered; missing from "{" ".join(wnorm[wi:])}"', 'add caption lines')
else:
    print(f'  all {len(W)} words covered in order (seq_ok={seq_ok})')

print('=' * 20, '(3) LINE / HIGHLIGHT TIMES')
for s, ci, li, l, idxs, toks in line_map:
    if not idxs or idxs[0] is None:
        continue
    ws = W[idxs[0]]['s']
    if abs(l['s'] - ws) > TOL:
        issue('major' if abs(l['s'] - ws) > 0.1 else 'minor', f"{s['id']} caption[{ci}] line[{li}] '{l['text']}'",
              f"line s={l['s']} but first word '{W[idxs[0]]['w']}' starts {ws} (diff {l['s']-ws:+.3f})", f'set s = {ws}')
# caption page s/e
cap_word_ranges = defaultdict(list)
for s, ci, li, l, idxs, toks in line_map:
    cap_word_ranges[(s['id'], ci)] += [i for i in idxs if i is not None]
for s, ci, c in caps:
    idxs = cap_word_ranges[(s['id'], ci)]
    if not idxs:
        continue
    ws = W[idxs[0]]['s']
    if abs(c['s'] - ws) > TOL:
        issue('minor', f"{s['id']} caption[{ci}] page s", f"page s={c['s']} vs first word start {ws}", f'set page s = {ws} (and line[0].s)')
    if abs(c['lines'][0]['s'] - c['s']) > 1e-6:
        issue('minor', f"{s['id']} caption[{ci}]", f"page s {c['s']} != line0 s {c['lines'][0]['s']}", 'make equal')
    # highlights
    hl = c.get('highlights', [])
    if len(hl) > 1:
        issue('major', f"{s['id']} caption[{ci}]", f'{len(hl)} highlights', 'keep one')
    for h in hl:
        htoks = [norm(t) for t in h['text'].split() if norm(t)]
        # find the sub-sequence in this caption's words
        pos = None
        for k in range(len(idxs) - len(htoks) + 1):
            if [wnorm[i] for i in idxs[k:k + len(htoks)]] == htoks:
                pos = idxs[k]; break
        if pos is None:
            issue('blocker', f"{s['id']} caption[{ci}] highlight '{h['text']}'", 'text not found in the caption', 'fix text')
            continue
        ws = W[pos]['s']
        if abs(h['s'] - ws) > TOL:
            issue('major', f"{s['id']} caption[{ci}] highlight '{h['text']}'",
                  f"highlight s={h['s']} but word '{W[pos]['w']}' (#{pos}) starts {ws} (diff {h['s']-ws:+.3f})",
                  f'set s = {ws}')
        # highlight must sit within one line
        inline = any(h['text'] in l['text'] for l in c['lines'])
        if not inline:
            issue('major', f"{s['id']} caption[{ci}] highlight '{h['text']}'", 'highlight spans two lines', 'shorten to one line')
# caption page continuity
allcaps = [(s, ci, c) for s, ci, c in caps]
for (s1, c1i, c1), (s2, c2i, c2) in zip(allcaps, allcaps[1:]):
    if abs(c1['e'] - c2['s']) > 1e-6:
        issue('minor', f"{s1['id']} caption[{c1i}] -> {s2['id']} caption[{c2i}]", f"page e {c1['e']} != next s {c2['s']}", f"set e = {c2['s']}")
last = allcaps[-1][2]
print('  last page', last['lines'][0]['text'], last['s'], last['e'])
# caption page vs scene ownership
for s, ci, c in caps:
    if c['s'] < s['start'] - 0.2 or c['s'] > s['end']:
        issue('minor', f"{s['id']} caption[{ci}]", f"page s {c['s']} outside scene {s['start']}-{s['end']}", 'move page to owning scene')
    # last word end vs page end
    idxs = cap_word_ranges[(s['id'], ci)]
    if idxs:
        we = W[idxs[-1]]['e']
        if c['e'] < we - 0.02:
            issue('major', f"{s['id']} caption[{ci}]", f"page ends {c['e']} before its last word ends {we}", f'set e >= {we}')

print('=' * 20, '(4) LINE LENGTH / COUNT')
for s, ci, c in caps:
    if len(c['lines']) > 2:
        issue('blocker', f"{s['id']} caption[{ci}]", f"{len(c['lines'])} lines", 'split page')
    for li, l in enumerate(c['lines']):
        if len(l['text']) > 26:
            issue('major', f"{s['id']} caption[{ci}] line[{li}] '{l['text']}'", f"{len(l['text'])} chars > 26", 'rebreak')
    if len(c['lines']) == 2 and c['lines'][1]['s'] < c['lines'][0]['s']:
        issue('blocker', f"{s['id']} caption[{ci}]", 'line2 before line1', 'fix')

print('=' * 20, '(5) BOUNDARIES IN PAUSES')
P = TM['pauses']
for a, b in zip(scenes, scenes[1:]):
    t = a['end']
    hit = [p for p in P if p['s'] - 1e-6 <= t <= p['e'] + 1e-6]
    if not hit:
        # which word is being spoken?
        sp = [w for w in W if w['s'] < t < w['e']]
        issue('major', f"{a['id']}/{b['id']} boundary {t}", f"not in a pause; inside word {sp[0]['w'] if sp else '?'}", 'move into nearest pause')
    else:
        p = hit[0]
        print(f"  {t:.3f} in pause {p['s']}-{p['e']} ({p['kind']}, after '{W[p['after']]['w']}')")
        if p['kind'] != 'sentence':
            issue('minor', f"{a['id']}/{b['id']} boundary {t}", f"pause is a '{p['kind']}' pause (after '{W[p['after']]['w']}'), not a sentence end", 'accept (camera-continuous, no cut) or document')
    tr = b['transitionIn']
    # parse "a-b" window from notes
    m = re.match(r'\s*(\d+\.\d+)\s*-\s*(\d+\.\d+)', tr.get('notes', ''))
    if m:
        t0, t1 = float(m.group(1)), float(m.group(2))
        if abs((t1 - t0) - tr['dur']) > 0.03:
            issue('minor', f"{b['id']}.transitionIn", f"notes window {t0}-{t1} ({t1-t0:.2f}s) != dur {tr['dur']}", f'set dur = {t1-t0:.2f}')
        print(f"     transition {tr['type']} window {t0}-{t1}")

print('=' * 20, '(6) ELEMENT IDS')
GLOBAL = {'sun', 'pip', 'bit', 'snail', 'transitionIn', 'scaleX', 'scaleY', 'inkHair', 'inOut', 'tealDark'}
all_ids = {}
for s in scenes:
    ids = [e['id'] for e in s['elements']]
    dup = {i for i in ids if ids.count(i) > 1}
    if dup:
        issue('minor', s['id'], f'duplicate element ids {dup}', 'rename')
    all_ids[s['id']] = set(ids)
idre = re.compile(r"\b([a-z]+[A-Z][A-Za-z0-9]*)\b")
for k, s in enumerate(scenes):
    ids = all_ids[s['id']]
    for b in s['beats']:
        for m in idre.findall(b['action']):
            if m not in ids and m not in GLOBAL:
                other = [sid for sid, v in all_ids.items() if m in v]
                issue('minor', f"{s['id']} beat t={b['t']}", f"references '{m}' not in this scene's elements (found in {other or 'no scene'})",
                      f"add element '{m}' to {s['id']}.elements or rename the reference")
    # persist ids
    tr = s['transitionIn']
    prev = scenes[k - 1] if k > 0 else scenes[-1]
    for pid in tr.get('persist', []):
        here = pid in ids or pid in GLOBAL
        there = pid in all_ids[prev['id']] or pid in GLOBAL
        if not here or not there:
            issue('minor', f"{s['id']}.transitionIn.persist '{pid}'",
                  f"id missing from {'this scene' if not here else ''}{' and ' if (not here and not there) else ''}{prev['id'] if not there else ''} elements",
                  f"add an element with id '{pid}' (or rename to the existing id)")
    # global ids present as elements?
    for g in ('sun', 'pip'):
        if g not in ids:
            issue('minor', f"{s['id']}.elements", f"no '{g}' element entry", f"add '{g}' element (position, scale) so persist/beat refs resolve")
    # beat times
    ts = [b['t'] for b in s['beats']]
    if ts != sorted(ts):
        issue('minor', f"{s['id']}.beats", 'beats not sorted by t', 'sort')
    for b in s['beats']:
        if b['t'] < s['start'] - 0.5 or b['t'] > s['end'] + 0.01:
            issue('minor', f"{s['id']} beat t={b['t']}", f"outside scene {s['start']}-{s['end']}", 'move to owning scene')

print('=' * 20, '(7) CAMERA')
for k, s in enumerate(scenes):
    cam = s['camera']
    for c in cam:
        if c['t0'] < s['start'] - 1e-6 or c['t1'] > s['end'] + 1e-6:
            issue('major', f"{s['id']} camera {c['t0']}-{c['t1']}", f"outside scene {s['start']}-{s['end']}", 'clip to scene')
        if c['t1'] <= c['t0']:
            issue('major', f"{s['id']} camera {c['t0']}-{c['t1']}", 'empty/negative', 'fix')
        mv, f, t = c['move'], c['from'], c['to']
        dz, dx, dy = t['zoom'] - f['zoom'], t['x'] - f['x'], t['y'] - f['y']
        bad = None
        if mv == 'push-in' and dz <= 0: bad = 'zoom does not increase'
        if mv == 'pull-back' and dz >= 0: bad = 'zoom does not decrease'
        if mv == 'truck-right' and dx <= 0: bad = f'x decreases ({f["x"]}->{t["x"]})'
        if mv == 'truck-left' and dx >= 0: bad = 'x increases'
        if mv == 'tilt-up' and dy >= 0: bad = 'y does not decrease'
        if mv == 'tilt-down' and dy <= 0: bad = 'y does not increase'
        if mv == 'crane-up' and dy >= 0: bad = 'y does not decrease'
        if mv == 'hold' and (abs(dz) > 0.05 or abs(dx) > 5 or abs(dy) > 5): bad = f'hold moves ({f}->{t})'
        if bad:
            issue('minor', f"{s['id']} camera {c['t0']}-{c['t1']} '{mv}'", bad, 'relabel the move or fix from/to')
    for a, b in zip(cam, cam[1:]):
        if b['t0'] < a['t1'] - 1e-6:
            issue('major', f"{s['id']} camera", f"segments overlap {a['t0']}-{a['t1']} / {b['t0']}-{b['t1']}", 'make sequential')
        if a['to'] != b['from']:
            issue('major', f"{s['id']} camera {a['t1']} -> {b['t0']}",
                  f"discontinuity {a['to']} -> {b['from']} (gap {b['t0']-a['t1']:.2f}s)", 'add a cut note/segment or make from == previous to')
        elif b['t0'] - a['t1'] > 1e-6:
            print(f"  note {s['id']}: implicit hold {a['t1']}-{b['t0']}")
    if cam and cam[0]['t0'] > s['start'] + 1e-6:
        issue('minor', f"{s['id']} camera", f"no segment for {s['start']}-{cam[0]['t0']}", f"add hold {s['start']}-{cam[0]['t0']} at {cam[0]['from']}")
    if cam and cam[-1]['t1'] < s['end'] - 1e-6:
        issue('minor', f"{s['id']} camera", f"no segment for {cam[-1]['t1']}-{s['end']}", f"add hold {cam[-1]['t1']}-{s['end']} at {cam[-1]['to']}")
    # cross-scene continuity for camera-continuous
    if k > 0 and s['transitionIn']['type'] == 'camera-continuous':
        pa = scenes[k - 1]['camera'][-1]['to']
        nb = cam[0]['from']
        if pa != nb:
            issue('major', f"{scenes[k-1]['id']}->{s['id']} camera-continuous",
                  f"camera jumps {pa} -> {nb} across a 'camera-continuous' boundary", 'make S(n).camera[0].from equal previous to, or state the world-coordinate remap explicitly')
# loop: last camera vs first
la, fa = scenes[-1]['camera'][-1]['to'], scenes[0]['camera'][0]['from']
print('  loop cam', la, fa)
if la != fa:
    issue('major', 'loop camera', f'end {la} != start {fa}', 'end at frame-0 camera')

print('=' * 20, '(8) MASCOT POSES')
poses = set(re.findall(r"^\| `([a-z\-]+)` \|", MASCOT_MD, re.M))
print('  poses in mascot.md:', sorted(poses))
exprs = {'neutral', 'happy', 'wide', 'worried', 'meh', 'closed'}
cand = re.compile(r"\b((?:sit|stand|walk|trunk|ears|ear|lie|look|wave|peek|hold|shrug|sleep|run|jump|hop|nod)-[a-z]+)\b")
for s in scenes:
    texts = [('mascot', s['mascot'])] + [(f"beat t={b['t']}", b['action']) for b in s['beats']] + [('transitionIn', s['transitionIn'].get('notes', ''))]
    for where, txt in texts:
        for m in set(cand.findall(txt)):
            if m not in poses and m not in ('push-through', 'look-to', 'trunk-tip'):
                issue('major', f"{s['id']} {where}", f"pose '{m}' not in docs/mascot.md", 'use an existing pose')
        for m in re.findall(r"expression[: ]+'?([a-z]+)", txt):
            if m not in exprs:
                issue('minor', f"{s['id']} {where}", f"expression '{m}' not in mascot API", f'use one of {sorted(exprs)}')
for m in set(cand.findall(SB['mascot']['design'])):
    if m not in poses:
        print('  root mascot.design mentions non-API pose:', m)

print('=' * 20, 'EXTRA: beat density / gaps')
bt = sorted(b['t'] for s in scenes for b in s['beats'])
print('  beats', len(bt), 'per s', len(bt) / DUR)
for a, b in zip(bt, bt[1:]):
    if b - a > 1.0:
        sc = [s['id'] for s in scenes if s['start'] <= a < s['end']]
        print(f'  GAP {a:.2f}->{b:.2f} = {b-a:.2f}s in {sc}')
print('=' * 20, 'EXTRA: caption tone vs timeOfDay')
for s in scenes:
    tones = {c['tone'] for c in s['captions']}
    print(f"  {s['id']} {s['timeOfDay']:7s} tones {tones} toneAt {[c.get('toneAt') for c in s['captions'] if c.get('toneAt')]}")

print('\nTOTAL issues', len(issues))
