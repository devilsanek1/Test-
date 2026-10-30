"""merge_panels.py: land drawn panels into a film's board JSON without lanes overwriting each other (G3_ANIMATIC §5
step 4: one agent per 3-5 panels, ~4 lanes in parallel). Each lane writes ITS panels to its own file; this script
replaces the board's shots by id, merges the sets and the sfx, and keeps everything else (words, times, the loop join).

  python3 -I scripts/g3/merge_panels.py public/v4/animatic.json public/v4/g3/panels_*.json            # in place
  python3 -I scripts/g3/merge_panels.py public/v4/animatic.json public/v4/g3/panels_a.json --out x.json --check

A panel file is {"shots": [shot, ...], "sets"?: {id: set}, "sfx"?: [cue, ...]} (or one shot object). A shot must keep its
id and its times (s, e: the take's clock; a change there reopens the visual script) unless --retime. A set defined in
two files must be identical (the set is shared: one lane owns it, the others reference it); a set in a file replaces
the board's. sfx cues are merged by (src, t). After it: python3 -I scripts/g3/board_lint.py <board>.
"""
import argparse
import json
import sys


def main(argv):
    ap = argparse.ArgumentParser()
    ap.add_argument('board')
    ap.add_argument('panels', nargs='+')
    ap.add_argument('--out')
    ap.add_argument('--retime', action='store_true', help='allow a panel to change its s / e')
    ap.add_argument('--check', action='store_true', help='report only, write nothing')
    a = ap.parse_args(argv[1:])
    board = json.load(open(a.board))
    ids = [s['id'] for s in board['shots']]
    pos = {sid: i for i, sid in enumerate(ids)}
    sets_from = {}
    replaced = []
    problems = []
    for path in a.panels:
        d = json.load(open(path))
        shots = d['shots'] if 'shots' in d else [d]
        for sh in shots:
            sid = sh.get('id')
            if sid not in pos:
                problems.append(f'{path}: shot {sid} is not on the board')
                continue
            old = board['shots'][pos[sid]]
            if not a.retime and (abs(old['s'] - sh['s']) > 1e-6 or abs(old['e'] - sh['e']) > 1e-6):
                problems.append(f'{path}: {sid} moves its times {old["s"]}-{old["e"]} -> {sh["s"]}-{sh["e"]} (--retime to allow)')
                continue
            if sid in replaced:
                problems.append(f'{path}: {sid} is drawn by two files')
                continue
            board['shots'][pos[sid]] = sh
            replaced.append(sid)
        for name, st in (d.get('sets') or {}).items():
            if name in sets_from and json.dumps(sets_from[name][1], sort_keys=True) != json.dumps(st, sort_keys=True):
                problems.append(f'{path}: set "{name}" differs from the one in {sets_from[name][0]} (one lane owns a set)')
                continue
            sets_from[name] = (path, st)
            board.setdefault('sets', {})[name] = st
        cues = {(c['src'], round(c['t'], 3)): c for c in board.get('sfx') or []}
        for c in d.get('sfx') or []:
            cues[(c['src'], round(c['t'], 3))] = c
        board['sfx'] = sorted(cues.values(), key=lambda c: c['t'])
    left = [s['id'] for s in board['shots'] if s.get('placeholder')]
    print(f'merged {len(replaced)} panels ({", ".join(replaced) or "none"}); placeholders left: {", ".join(left) or "none"}')
    if not left and board.get('draft'):
        print('every panel is drawn: set "draft": false for the owner-facing reel (the lint then applies the owner rules)')
    for p in problems:
        print('  PROBLEM', p)
    if problems:
        return 1
    if not a.check:
        with open(a.out or a.board, 'w') as f:
            json.dump(board, f, indent=1)
            f.write('\n')
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv))
