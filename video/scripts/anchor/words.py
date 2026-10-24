#!/usr/bin/env python3
"""Word-index helper for authoring anchors.

  python3 scripts/anchor/words.py                       # table: index, word, start, end, pause after (v3 timing)
  python3 scripts/anchor/words.py --find purpose half   # where are these words? (normalized match)
  python3 scripts/anchor/words.py --at 4.2 12.31        # seconds on this timing -> {"w", "dt"} (nearest word start)
  python3 scripts/anchor/words.py --anchor 14 -0.1      # an anchor -> seconds on this timing
  python3 scripts/anchor/words.py --pages               # the timing's caption paging as storyboard caption pages
                                                        # (text only: resolve.py fills every time from the words)
  python3 scripts/anchor/words.py --timing assets/timing.json ...   # any timing / raw ASR file

The timing defaults to the one resolve.py uses (assets/timing_v3.json if present, else assets/timing_est_v3.json).
"""
import argparse
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import anchorlib as A  # noqa: E402


def to_anchor(t, words):
    """Nearest word start: {"w": i, "dt": t - s_i} (dt may be negative: a lead before the word)."""
    i = min(range(len(words)), key=lambda k: (abs(words[k]['s'] - t), k))
    return {'w': i, 'dt': round(t - words[i]['s'], 3), 'word': words[i]['w']}


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--timing')
    ap.add_argument('--find', nargs='+')
    ap.add_argument('--at', nargs='+', type=float)
    ap.add_argument('--anchor', nargs=2)
    ap.add_argument('--pages', action='store_true')
    a = ap.parse_args()
    path = a.timing
    if not path:
        real = os.path.join(A.ROOT, 'assets/timing_v3.json')
        path = real if os.path.exists(real) else os.path.join(A.ROOT, 'assets/timing_est_v3.json')
    tm = A.load_timing(path)
    W = tm['words']
    if a.find:
        want = {A.key(x) for x in a.find}
        for w in W:
            if A.key(w['w']) in want:
                print(f"w{w['i']:<4} {w['w']:<14} s {w['s']:.3f}")
        return
    if a.at:
        for t in a.at:
            print(f'{t:.3f} -> {json.dumps(to_anchor(t, W))}')
        return
    if a.anchor:
        w = a.anchor[0]
        anc = {'w': int(w) if w.lstrip('-').isdigit() else w, 'dt': float(a.anchor[1])}
        print(f'{json.dumps(anc)} -> {A.anchor_time(anc, tm):.3f} s')
        return
    if a.pages:
        rows = [{'lines': [{'text': l['text']} for l in c['lines']],
                 'highlights': [{'text': h['text']} for h in c.get('highlights') or []]} for c in tm.get('captions') or []]
        print('[\n' + ',\n'.join('  ' + json.dumps(r, ensure_ascii=False) for r in rows) + '\n]')
        return
    pauses = {p['after']: p for p in tm.get('pauses', [])}
    print(f"# {A.rel(path)}{' (ESTIMATED)' if tm.get('estimated') else ''}: {len(W)} words, {tm['duration']} s")
    for w in W:
        p = pauses.get(w['i'])
        print(f"w{w['i']:<4} {w['s']:7.3f} {w['e']:7.3f}  {w['w']:<14}" + (f"  | {p['kind']} {p['dur']:.2f}" if p else ''))


if __name__ == '__main__':
    main()
