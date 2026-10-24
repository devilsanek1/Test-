#!/usr/bin/env python3
"""Resolve a word-anchored storyboard into seconds, and emit the engine's scenes.json / captions.json.

  python3 scripts/anchor/resolve.py                              # docs/storyboard_v3.json + the v3 timing
  python3 scripts/anchor/resolve.py SB.json --timing assets/timing_v3.json
  python3 scripts/anchor/resolve.py SB.json --no-engine -o /tmp/resolved.json      # storyboard only
  python3 scripts/anchor/resolve.py SB.json --reanchor           # the recorded words differ slightly: re-map first

Inputs
  STORYBOARD   word-anchored storyboard (default docs/storyboard_v3.json). Every time is an anchor
               {"w": <word index in wordsRef>, "dt": <s>} (also "edge": "e", "gap": 0..1, "word": "<text check>", w = "START" /
               "END" / "VO_START" / "VO_END"); top-level "wordsRef" = the plain script it was anchored to (string or
               list of words). Plain numbers stay as they are (positions, sizes, zooms, durations): a plain number
               under a time key (s, e, t, t0, t1, start, end, at, time, captionAt, coverFrame) is reported as
               UN-ANCHORED. "dur": "auto" next to two anchored ends (t0/t1, s/e, start/end) becomes end - start.
               Caption pages may leave times out: a line without "s" starts at its first word (running through the
               script in caption order), a page "s" = its first line, a page "e" = the next page's start (the last
               page: END), a highlight "s" = its first word in the page.
  --timing     timing JSON, timing.json schema (default: assets/timing_v3.json if it exists, else the estimate
               assets/timing_est_v3.json). Its words[].w must match wordsRef (normalized: case, punctuation,
               apostrophes, hyphens, "45" == "forty-five"); otherwise a word-level diff is printed and nothing is
               written (exit 2) unless --reanchor.
Outputs
  -o           the resolved storyboard, every anchor replaced by seconds (3 decimals), top-level `duration` = the
               timing's, plus a `resolved` block (default docs/storyboard_v3_resolved.json). Lint it with
               python3 -I scripts/check-storyboard.py --sb <out> --timing <timing>.
  --scenes-out / --captions-out   engine files (default src/data/scenes.json, src/data/captions.json), same rules and
               byte format as scripts/gen-scenes.mjs and scripts/gen-captions.mjs --storyboard (+ their
               src/data/*.overrides.json unless --no-overrides). Guard as in gen-scenes: the cut list and the captions
               must end on the timing's duration, else the engine files are not written (exit 1) unless --force.
               --no-engine skips them.
Exit codes: 0 ok, 1 errors (bad anchors / guard), 2 wordsRef does not match the timing.
"""
import argparse
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import anchorlib as A  # noqa: E402
import engine_emit as E  # noqa: E402
import reanchor as R  # noqa: E402


class Log:
    def __init__(self, quiet=False):
        self.errors, self.warnings, self.notes = [], [], []
        self.quiet = quiet

    def error(self, msg):
        self.errors.append(msg)
        print(f'ERROR {msg}')

    def warn(self, msg):
        self.warnings.append(msg)
        if not self.quiet:
            print(f'warn  {msg}')

    def note(self, msg):
        self.notes.append(msg)
        if not self.quiet:
            print(f'note  {msg}')


def default_timing():
    real = os.path.join(A.ROOT, 'assets/timing_v3.json')
    return real if os.path.exists(real) else os.path.join(A.ROOT, 'assets/timing_est_v3.json')


# ---------------------------------------------------------------- word check

def check_words(ref, tw, log):
    """True when wordsRef and the timing's words match (normalized)."""
    if [A.key(w) for w in ref] == [A.key(w) for w in tw]:
        cos = A.cosmetic_diffs(ref, tw)
        if cos:
            log.note(f'{len(cos)} word(s) differ only in spelling/punctuation, e.g. '
                     + ', '.join(f'w{i} {a!r}/{b!r}' for i, a, b in cos[:5]))
        return True
    lines, _ = A.word_diff(ref, tw)
    print('wordsRef does not match the timing words:')
    print('\n'.join('  ' + ln for ln in lines))
    return False


# ---------------------------------------------------------------- captions: fill + lint (on the anchored doc)

def fill_captions(sb, ref, log, strict=False):
    keys = [A.key(w) for w in ref]
    pages = [(sc.get('id'), c) for sc in sb.get('scenes', []) for c in (sc.get('captions') or [])]
    loop_page = None
    if len(pages) > 1:
        first = (pages[0][1].get('lines') or [{}])[0].get('text')
        last = pages[-1][1]
        if len(last.get('lines') or []) == 1 and last['lines'][0].get('text') == first:
            loop_page = last
            pages = pages[:-1]
    bad = log.error if strict else log.warn
    wi = 0
    filled = 0
    for pi, (sid, c) in enumerate(pages):
        page_words = []
        for li, l in enumerate(c.get('lines') or []):
            toks = A.split_words(l.get('text', ''))
            s = l.get('s')
            where = f"{sid} page {pi} line {li} '{l.get('text')}'"
            if s is None:
                l['s'] = {'w': wi, 'dt': 0}
                filled += 1
            elif A.is_anchor(s):
                if isinstance(s['w'], int) and s['w'] != wi:
                    bad(f'{where}: anchored at w{s["w"]} ({ref[s["w"]] if 0 <= s["w"] < len(ref) else "?"}) but the '
                        f'captions reach w{wi} ({ref[wi] if wi < len(ref) else "END"}) here')
                    wi = s['w'] if isinstance(s['w'], int) and 0 <= s['w'] < len(ref) else wi
                if s.get('dt', 0) != 0:
                    log.warn(f'{where}: dt {s["dt"]} on a caption line (caption times are WORD STARTS; the engine '
                             'applies its own leads)')
            else:
                log.warn(f'{where}: un-anchored line time {s!r}')
            if len(l.get('text', '')) > 26:
                log.warn(f'{where}: {len(l["text"])} characters (> 26: too long for one caption line)')
            got = [A.key(t) for t in toks]
            if got != keys[wi:wi + len(toks)]:
                bad(f"{where}: text does not match the script at w{wi}: expected '{' '.join(ref[wi:wi + len(toks)])}'")
            page_words.append((wi, toks))
            wi += len(toks)
        if c.get('s') is None and c.get('lines'):
            c['s'] = dict(c['lines'][0]['s']) if A.is_anchor(c['lines'][0]['s']) else c['lines'][0]['s']
            filled += 1
        # highlights
        flat = [(i0 + k, A.key(t)) for i0, toks in page_words for k, t in enumerate(toks)]
        for hi, h in enumerate(c.get('highlights') or []):
            hk = [A.key(t) for t in A.split_words(h.get('text', ''))]
            pos = next((flat[x][0] for x in range(len(flat) - len(hk) + 1) if [f[1] for f in flat[x:x + len(hk)]] == hk), None)
            where = f"{sid} page {pi} highlight '{h.get('text')}'"
            if pos is None:
                bad(f'{where}: not among the page words')
                continue
            if h.get('s') is None:
                h['s'] = {'w': pos, 'dt': 0}
                filled += 1
            elif A.is_anchor(h['s']) and isinstance(h['s']['w'], int) and h['s']['w'] != pos:
                log.warn(f'{where}: anchored at w{h["s"]["w"]} but the word is w{pos}')
    # page ends: the next page's start, the last page runs to END
    for k, (sid, c) in enumerate(pages):
        if c.get('e') is None:
            nxt = pages[k + 1][1].get('s') if k + 1 < len(pages) else {'w': 'END', 'dt': 0}
            c['e'] = dict(nxt) if isinstance(nxt, dict) else nxt
            filled += 1
    if loop_page is not None:
        for key_, val in (('s', {'w': 'END', 'dt': 0}), ('e', {'w': 'END', 'dt': 0})):
            if loop_page.get(key_) is None:
                loop_page[key_] = val
        for l in loop_page.get('lines') or []:
            if l.get('s') is None:
                l['s'] = {'w': 'END', 'dt': 0}
    if pages and wi != len(ref):
        bad(f'captions cover {wi}/{len(ref)} words of wordsRef')
    return filled


# ---------------------------------------------------------------- anchors: validate, lint, resolve

def validate(sb, ref, timing, log):
    n = 0
    for node, path in A.iter_anchors(sb):
        n += 1
        extra = set(node) - A.ANCHOR_KEYS
        if extra:
            log.warn(f'{path}: unknown anchor keys {sorted(extra)}')
        w = node['w']
        if isinstance(w, int):
            if not 0 <= w < len(ref):
                log.error(f'{path}: word index {w} out of range 0..{len(ref) - 1}')
                continue
            if isinstance(node.get('word'), str) and A.key(node['word']) != A.key(ref[w]):
                log.error(f"{path}: w{w} is '{ref[w]}' but the anchor says word '{node['word']}'")
        try:
            A.anchor_time(node, timing)
        except ValueError as e:
            log.error(f'{path}: {e}')
    for node, path in A.iter_nodes(sb):
        if isinstance(node, dict) and not A.is_anchor(node):
            for k, v in node.items():
                if k in A.TIME_KEYS and A.is_num(v) and (path.startswith('$.scenes') or k == 'coverFrame'):
                    log.warn(f'{path}.{k} = {v}: UN-ANCHORED time (plain seconds will not follow the voice)')
            if isinstance(node.get('word'), int) and not isinstance(node.get('word'), bool):
                wi = node['word']
                if not 0 <= wi < len(ref):
                    log.error(f'{path}.word = {wi}: word index out of range')
                t = node.get('t')
                if A.is_anchor(t) and isinstance(t['w'], int) and t['w'] != wi:
                    log.warn(f'{path}: word {wi} ({ref[wi] if 0 <= wi < len(ref) else "?"}) disagrees with its t anchor w{t["w"]}')
    return n


def resolve_doc(sb, timing, log):
    amap = {}

    def fn(node, path):
        if A.is_anchor(node):
            try:
                t = A.r3(A.anchor_time(node, timing))
            except ValueError:
                return None, False
            amap[path] = {'w': node['w'], 'dt': node.get('dt', 0), 't': t}
            if node.get('edge') == 'e':
                amap[path]['edge'] = 'e'
            return t, False
        return node, True

    out = A.walk(sb, fn)

    def fix_dur(node, path):
        if isinstance(node, dict) and node.get('dur') == 'auto':
            s_key = next((k for k in A.START_KEYS if A.is_num(node.get(k))), None)
            e_key = next((k for k in A.END_KEYS if A.is_num(node.get(k))), None)
            if s_key and e_key:
                node = {**node, 'dur': A.r3(node[e_key] - node[s_key])}
            else:
                log.error(f'{path}.dur = "auto" needs a resolved start (s/start/t0) and end (e/end/t1) in the same object')
        return node, True

    out = A.walk(out, fix_dur)
    return out, amap


def check_resolved(rs, timing, log):
    dur = float(timing['duration'])
    scenes = rs.get('scenes') or []
    if scenes:
        if not A.is_num(scenes[0].get('start')) or abs(scenes[0]['start']) > 1e-6:
            log.warn(f"first scene starts at {scenes[0].get('start')}, not 0")
        for a, b in zip(scenes, scenes[1:]):
            if A.is_num(a.get('end')) and A.is_num(b.get('start')) and abs(a['end'] - b['start']) > 1e-6:
                log.warn(f"{a.get('id')}/{b.get('id')}: gap/overlap {a['end']} vs {b['start']}")
            if A.is_num(b.get('start')) and A.is_num(b.get('end')) and b['end'] <= b['start']:
                log.error(f"{b.get('id')}: end {b['end']} <= start {b['start']}")
        if A.is_num(scenes[-1].get('end')) and abs(scenes[-1]['end'] - dur) > 0.002:
            log.warn(f"last scene ends at {scenes[-1]['end']}, the voice at {dur} (anchor it to {{\"w\": \"END\", \"dt\": 0}})")
        for s in scenes:
            for k, x in enumerate(s.get('beats') or []):
                if isinstance(x, dict) and A.is_num(x.get('t')) and A.is_num(s.get('start')) and A.is_num(s.get('end')) \
                        and not (s['start'] - 1.0 <= x['t'] <= s['end'] + 1.0):
                    log.warn(f"{s.get('id')} beat {k} at {x['t']} is outside its scene {s['start']}-{s['end']}")


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('storyboard', nargs='?', default=os.path.join(A.ROOT, 'docs/storyboard_v3.json'))
    ap.add_argument('--timing', default=None)
    ap.add_argument('-o', '--out', default=os.path.join(A.ROOT, 'docs/storyboard_v3_resolved.json'))
    ap.add_argument('--scenes-out', default=os.path.join(A.ROOT, 'src/data/scenes.json'))
    ap.add_argument('--captions-out', default=os.path.join(A.ROOT, 'src/data/captions.json'))
    ap.add_argument('--no-engine', action='store_true', help='write only the resolved storyboard')
    ap.add_argument('--no-overrides', action='store_true', help='ignore src/data/*.overrides.json')
    ap.add_argument('--no-hook', action='store_true', help='first caption page without the hook style')
    ap.add_argument('--reanchor', action='store_true', help='if wordsRef differs from the timing words, re-map first')
    ap.add_argument('--deleted', choices=('next', 'prev'), default='next')
    ap.add_argument('--strict', action='store_true', help='caption mismatches are errors')
    ap.add_argument('--force', action='store_true', help='write the engine files even if the guard fails')
    ap.add_argument('--anchor-map', help='write {json path: {w, dt, t}} of every resolved anchor here')
    ap.add_argument('--quiet', action='store_true')
    a = ap.parse_args()
    timing_path = a.timing or default_timing()
    log = Log(a.quiet)

    sb = A.load_json(a.storyboard)
    timing = A.load_timing(timing_path)
    est = bool(timing.get('estimated'))
    print(f'storyboard {A.rel(a.storyboard)}; timing {A.rel(timing_path)} '
          f'({"ESTIMATED" if est else "recorded"}, {timing["duration"]} s, {len(timing["words"])} words)')
    if 'wordsRef' not in sb:
        log.error('the storyboard has no "wordsRef" (the plain script its anchors index)')
        sys.exit(1)
    ref = A.words_from_ref(sb['wordsRef'])
    tw = [w['w'] for w in timing['words']]
    if not check_words(ref, tw, log):
        if not a.reanchor:
            print('nothing written. Re-anchor with: python3 scripts/anchor/reanchor.py '
                  f'{A.rel(a.storyboard)} --timing {A.rel(timing_path)} -o <out>  (or pass --reanchor here)')
            sys.exit(2)
        sb, rep = R.reanchor_doc(sb, tw, a.deleted)
        print(R.format_report(rep))
        ref = A.words_from_ref(sb['wordsRef'])

    filled = fill_captions(sb, ref, log, a.strict)
    n = validate(sb, ref, timing, log)
    if log.errors:
        print(f'{len(log.errors)} error(s): nothing written')
        sys.exit(1)
    rs, amap = resolve_doc(sb, timing, log)
    if log.errors:
        print(f'{len(log.errors)} error(s): nothing written')
        sys.exit(1)
    if A.is_num(rs.get('duration')) and abs(rs['duration'] - float(timing['duration'])) > 0.002 and 'duration' in sb \
            and not A.is_anchor(sb['duration']):
        log.note(f"top-level duration {rs['duration']} replaced by the timing's {timing['duration']}")
    rs['duration'] = float(timing['duration'])
    rs['resolved'] = {
        'from': A.rel(a.storyboard), 'timing': A.rel(timing_path), 'estimated': est,
        'duration': float(timing['duration']), 'anchors': n, 'autoCaptionTimes': filled,
        'generatedBy': 'scripts/anchor/resolve.py',
        'note': 'Every time here is SECONDS on the timing above, resolved from word anchors: edit the anchored storyboard, '
                'not this file.' + (' The timing is an ESTIMATE (voice not recorded yet).' if est else ''),
    }
    check_resolved(rs, timing, log)
    A.dump_pretty(rs, a.out)
    print(f'resolved {n} anchors ({filled} caption times filled in) -> {A.rel(a.out)}')
    if a.anchor_map:
        A.dump_pretty(amap, a.anchor_map)
    if a.no_engine:
        print(f'done: {len(log.warnings)} warning(s)')
        return
    root = A.ROOT
    cap_ov = {} if a.no_overrides else _load_opt(os.path.join(root, 'src/data/captions.overrides.json'))
    sc_ov = {} if a.no_overrides else _load_opt(os.path.join(root, 'src/data/scenes.overrides.json'))
    warp = _load_opt(os.path.join(root, 'assets/timewarp_v1_to_v2.json')) or None
    try:
        caps = E.caption_rows(rs, timing, cap_ov, hook=not a.no_hook, log=log.warn)
        scenes, problems = E.scene_rows(rs, float(timing['duration']), caps, sc_ov, warp, log=log.note)
    except (KeyError, TypeError, ValueError) as e:
        print(f'ERROR engine files: {type(e).__name__}: {e}: nothing written to src/data')
        sys.exit(1)
    for p in problems:
        print(f'ERROR engine guard: {p}')
    if problems and not a.force:
        print('engine files NOT written (--force to write anyway)')
        sys.exit(1)
    for path, rows in ((a.captions_out, caps), (a.scenes_out, scenes)):
        with open(path, 'w', encoding='utf-8') as f:
            f.write(A.js_rows(rows))
    print(f'engine: {len(scenes)} scenes -> {A.rel(a.scenes_out)}, {len(caps)} caption pages -> {A.rel(a.captions_out)} '
          f'(0..{scenes[-1]["end"]} s{", ESTIMATED timing" if est else ""})')
    print(f'done: {len(log.warnings)} warning(s)')


def _load_opt(p):
    return A.load_json(p) if os.path.exists(p) else {}


if __name__ == '__main__':
    main()
