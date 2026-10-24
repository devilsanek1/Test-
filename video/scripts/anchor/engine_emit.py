"""Python port of scripts/gen-scenes.mjs and scripts/gen-captions.mjs --storyboard (same rules, same file format).

Differences from the node scripts, all opt-in by the storyboard (a storyboard without them gives byte-identical
output, checked by selftest.py against the node scripts):
  * the timing (and therefore the voice duration of the guard) is passed in instead of read from assets/timing.json,
    and the guard checks the captions being written instead of the ones on disk;
  * transitionIn may carry explicit engine params: `dir` / `element` (strings) win over the ones parsed from the notes,
    and an `engine: {...}` object is merged last (e.g. {"amount": 1.1, "focus": [540, 900]});
  * caption `toneAt` keys keep `wipe` / `dur` (ENGINE.md: give a tone key the same wipe as its sky key);
  * the loop un-build can be structured: the last scene's `transitionOut` ({t0, t1} or {dur}, captionAt) or a
    top-level `loop: {t0, t1, captionAt}` (resolved anchors); the free-text "un-build (a-b) ... rolled in (c-" note
    of the old storyboards still works.
"""
import math
import re

import anchorlib as A

r3 = A.r3


# ---------------------------------------------------------------- captions (gen-captions.mjs --storyboard)

def _norm(w):
    return re.sub(r"[^a-z0-9']", '', w.lower())


def word_start(words, text, near):
    first = _norm(re.split(r'\s+', text)[0] if text is not None else '')
    best = None
    for w in words:
        if abs(w['s'] - near) > 1.5:
            continue
        nw = _norm(w['w'])
        if nw == first or nw.startswith(first) or first.startswith(nw):
            if best is None or abs(w['s'] - near) < abs(best['s'] - near):
                best = w
    return best['s'] if best else near


def caption_rows(sb, timing, overrides=None, hook=True, log=print):
    words = timing['words']
    overrides = overrides or {}
    pages = [c for sc in sb['scenes'] for c in (sc.get('captions') or [])]
    if not pages and timing.get('captions'):
        # no paging in the storyboard yet: gen-captions.mjs's default mode, the timing file's own pages
        log('[captions] the storyboard has no caption pages: using the timing\'s own paging')
        out = [{'s': r3(c['s']), 'e': r3(c['e']), 'lines': [{'text': l['text'], 's': r3(l['s'])} for l in c['lines']],
                'highlights': [{'text': h['text'], 's': r3(h['s'])} for h in (c.get('highlights') or [])]}
               for c in timing['captions']]
        return _finish(out, overrides, hook, log)
    first = pages[0]['lines'][0]['text'] if pages and pages[0].get('lines') else None
    if len(pages) > 1 and len(pages[-1]['lines']) == 1 and pages[-1]['lines'][0]['text'] == first:
        pages = pages[:-1]
    out = []
    for c in pages:
        lines = [{'text': l['text'], 's': r3(word_start(words, l['text'], max(l['s'], 0.05)))} for l in c['lines']]
        hls = []
        for h in c.get('highlights') or []:
            ws = word_start(words, h['text'], h['s'])
            if abs(ws - h['s']) > 0.06:
                log(f'[captions] highlight "{h["text"]}": storyboard {h["s"]} -> word start {r3(ws)}')
            hls.append({'text': h['text'], 's': r3(ws)})
        out.append({'s': r3(lines[0]['s']), 'e': r3(c['e']), 'lines': lines, 'highlights': hls})
    return _finish(out, overrides, hook, log)


def _finish(out, overrides, hook, log):
    for i, beat in enumerate(out):
        if i == 0 and hook:
            beat['style'] = 'hook'
        ov = overrides.get(str(i))
        if ov:
            beat.update(ov)
    for i, b in enumerate(out):
        if i > 0 and b['s'] < out[i - 1]['s']:
            raise ValueError(f'caption {i} starts before caption {i - 1}')
        for l in b['lines']:
            if l['s'] < b['s'] - 1e-6 or l['s'] > b['e'] + 1e-6:
                log(f'[captions] caption {i}: line "{l["text"]}" at {l["s"]} outside [{b["s"]}, {b["e"]}]')
    return out


# ---------------------------------------------------------------- scenes (gen-scenes.mjs)

_CAM = [
    ('in', r'push(es|ing)?[- ]in|pushes|dolly in|dives? in|zoom(s|ing)? in'),
    ('right', r'truck(s|ing)? right|pans? right'),
    ('left', r'truck(s|ing)? left|pans? left'),
    ('up', r'tilt(s|ing)? up|crane(s|ing)? up'),
    ('down', r'tilt(s|ing)? down|crane(s|ing)? down'),
    ('out', r'pull(s|ing)?[- ]back|zoom(s|ing)? out'),
]
CAM_DIRS = {'in', 'out', 'up', 'down', 'left', 'right'}


def cam_dir(notes=''):
    n = (notes or '').lower()
    best = ('in', math.inf)
    for d, pat in _CAM:
        m = re.search(pat, n)
        if m and m.start() < best[1]:
            best = (d, m.start())
    return best[0]


def wipe_dir(notes=''):
    return 'left' if re.search(r'right[- ]to[- ]left', (notes or '').lower()) else 'right'


def _truthy(v):
    return v not in (None, 0, 0.0, '', False)


def transition(tr):
    if not tr:
        return {'type': 'cut'}
    t = 'cut' if tr.get('type') == 'loop-start' else tr.get('type')
    out = {'type': t}
    if _truthy(tr.get('dur')) and t not in ('cut', 'matchcut') and A.is_num(tr.get('dur')):
        out['dur'] = r3(tr['dur'])
    if t == 'camera-continuous':
        out['dir'] = tr['dir'] if tr.get('dir') in CAM_DIRS else cam_dir(tr.get('notes'))
    if t == 'foreground-wipe':
        out['element'] = tr['element'] if isinstance(tr.get('element'), str) else 'scene'
        out['dir'] = tr['dir'] if tr.get('dir') in ('left', 'right') else wipe_dir(tr.get('notes'))
    if isinstance(tr.get('engine'), dict):
        out.update(tr['engine'])
    return out


class Warp:
    """v1 -> v2 piecewise-linear warp (assets/timewarp_v1_to_v2.json), as in gen-scenes.mjs."""

    def __init__(self, doc):
        pts = sorted((float(a), float(b)) for a, b in doc['anchors'])
        self.x = [p[0] for p in pts]
        self.y = [p[1] for p in pts]

    def __call__(self, t, side='right'):
        x, y = self.x, self.y
        if t <= x[0]:
            return y[0] + (t - x[0])
        if t >= x[-1]:
            return y[-1] + (t - x[-1])
        if side == 'right':
            i = next(k for k, v in enumerate(x) if v > t)
        else:
            i = next(k for k, v in enumerate(x) if v >= t)
            if x[i] == t:
                return y[i]
        x0, y0, x1, y1 = x[i - 1], y[i - 1], x[i], y[i]
        if x1 == x0:
            return y1 if side == 'right' else y0
        return y0 + ((y1 - y0) * (t - x0)) / (x1 - x0)


def _js_json(o):
    return A.js_compact(o)


def scene_rows(sb, vo_dur, caption_rows_out=None, overrides=None, warp_doc=None, log=print):
    overrides = overrides or {}
    scenes = []
    for s in sb['scenes']:
        keys = []
        for c in s.get('captions') or []:
            if c.get('tone'):
                keys.append({'t': r3(max(0, c['s'] - s['start'])), 'tone': c['tone']})
            for k in c.get('toneAt') or []:
                row = {'t': r3(k['t'] - s['start']), 'tone': k['tone']}
                if k.get('wipe'):
                    row['wipe'] = k['wipe']
                    if A.is_num(k.get('dur')):
                        row['dur'] = r3(k['dur'])
                keys.append(row)
        keys.sort(key=lambda k: k['t'])
        tone = []
        for k in keys:
            if not tone or tone[-1]['tone'] != k['tone']:
                tone.append(k)
        if tone:
            tone[0]['t'] = 0
        scene = {'id': s['id'], 'start': r3(s['start']), 'end': r3(s['end']), 'transitionIn': transition(s.get('transitionIn')),
                 'captionTone': tone if tone else [{'t': 0, 'tone': 'dark'}]}
        if s.get('title') is not None:
            scene['note'] = s['title']
        scenes.append(scene)

    # the loop: the last scene un-builds into frame 0
    last = scenes[-1]
    last_sb = sb['scenes'][-1]
    loop = sb.get('loop')
    tout = last_sb.get('transitionOut') if isinstance(last_sb.get('transitionOut'), dict) else None
    struct = tout or (loop if isinstance(loop, dict) else None)
    if struct is not None:
        src = struct.get('unbuild') if isinstance(struct.get('unbuild'), dict) else struct
        if A.is_num(src.get('t0')) and A.is_num(src.get('t1')):
            dur = r3(src['t1'] - src['t0'])
        elif A.is_num(src.get('dur')):
            dur = r3(src['dur'])
        else:
            dur = 0.5
        last['transitionOut'] = {'type': 'unbuild', 'dur': dur, 'loop': True}
        cap_at = struct.get('captionAt', src.get('captionAt'))
        if A.is_num(cap_at):
            last['transitionOut']['captionAt'] = r3(cap_at)
    else:
        loop_text = loop if isinstance(loop, str) else _js_json(loop if loop is not None else '')
        ub = re.search(r'un-build \((\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)\)', loop_text)
        cap = re.search(r'rolled in \((\d+(?:\.\d+)?)\s*-', loop_text)
        ub0 = float(ub.group(1)) if ub else math.nan
        ub1 = float(ub.group(2)) if ub else math.nan
        cap_at = float(cap.group(1)) if cap else math.nan
        v1_end = float(warp_doc['from']['duration']) if warp_doc else math.nan
        on_v1 = bool(ub) and warp_doc is not None and abs(ub1 - last['end']) > 0.002 and abs(ub1 - v1_end) < 0.002 \
            and abs(last['end'] - float(warp_doc['to']['duration'])) < 0.002
        if on_v1:
            w = Warp(warp_doc)
            ub0, ub1 = w(ub0, 'right'), w(ub1, 'left')
            if cap:
                cap_at = w(cap_at, 'right')
            log(f'[scenes] loop note times are on v1: warped to un-build {r3(ub0)}-{r3(ub1)}, captions roll back at {r3(cap_at)}')
        last['transitionOut'] = {'type': 'unbuild', 'dur': r3(ub1 - ub0) if ub else 0.5, 'loop': True}
        if cap:
            last['transitionOut']['captionAt'] = r3(cap_at)

    for s in scenes:
        ov = overrides.get(s['id'])
        if not ov:
            continue
        for k, v in ov.items():
            if k in ('transitionIn', 'transitionOut') and isinstance(v, dict):
                s[k] = {**(s.get(k) or {}), **v}
            else:
                s[k] = v

    problems = []
    film_end = max(s['end'] for s in scenes)
    if abs(film_end - vo_dur) > 0.002:
        problems.append(f'scenes end at {film_end} s but the voice (timing duration) is {vo_dur} s')
    if caption_rows_out is not None:
        cap_end = caption_rows_out[-1]['e'] if caption_rows_out else math.nan
        if not abs(cap_end - vo_dur) <= 0.002:
            problems.append(f'captions end at {cap_end} s, the voice at {vo_dur} s')
    lt = last['transitionOut']
    if 'captionAt' in lt and (lt['captionAt'] < last['end'] - lt['dur'] - 0.5 or lt['captionAt'] > last['end']):
        problems.append(f"loop captionAt {lt['captionAt']} is outside the last scene's un-build ({r3(last['end'] - lt['dur'])}-{last['end']})")
    return scenes, problems
