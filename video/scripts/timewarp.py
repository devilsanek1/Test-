#!/usr/bin/env python3
"""Map times from the v1 VO timeline to the v2 VO timeline (or back) and rewrite JSON files.

The warp is piecewise-linear between anchor pairs [old_time, new_time] taken from
assets/timewarp_v1_to_v2.json (every word start and end of both takes, plus file start and end).
A time inside a v1 pause therefore lands proportionally inside the matching v2 pause.
Before the first anchor the map is the identity offset, after the last anchor it continues with slope 1.

Where v1 had no gap between two words but v2 inserted a pause, the map jumps.
The value at that instant is the later side (the next word's start) so starts, captions and
"until the next beat" ends stay exact. Keys listed in --end-keys take the earlier side instead
(use it for word-end style fields, e.g. --end-keys e).

Usage:
  python3 scripts/timewarp.py IN.json -o OUT.json          # rewrite time fields, write OUT
  python3 scripts/timewarp.py IN.json --in-place           # overwrite IN
  python3 scripts/timewarp.py IN.json --dry-run            # print a diff of changed fields, write nothing
  python3 scripts/timewarp.py --t 9.18 30.6 41.05          # map single times
  python3 scripts/timewarp.py assets/timing_v1.json --compare assets/timing.json   # self-test
Options:
  --keys s,e,...     replace the set of time keys (default: s,e,t,t0,t1,start,end,at,time,dur)
  --add-keys k1,k2   add keys to the default set (e.g. duration,voStart,voEnd)
  --inverse          map v2 -> v1
  --precision N      decimals of rewritten values (default 3)
"dur" is not warped as a time: it is recomputed as end-start from the warped start/end keys of the
same object (s/start/t0/at/time and e/end/t1). With only a start key it becomes
warp(start+dur)-warp(start). With neither, it is left unchanged and a warning is printed.
Everything that is not a number (or a list of numbers) under a time key is left untouched.
"""
import argparse
import bisect
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
DEFAULT_WARP = os.path.join(HERE, '..', 'assets', 'timewarp_v1_to_v2.json')
DEFAULT_KEYS = ['s', 'e', 't', 't0', 't1', 'start', 'end', 'at', 'time', 'dur']
START_KEYS = ['s', 'start', 't0', 'at', 'time', 't']
END_KEYS = ['e', 'end', 't1']


class Warp:
    def __init__(self, anchors, inverse=False):
        pts = [(float(b), float(a)) if inverse else (float(a), float(b)) for a, b in anchors]
        pts.sort()
        self.x = [p[0] for p in pts]
        self.y = [p[1] for p in pts]
        for i in range(1, len(pts)):
            if self.y[i] < self.y[i - 1] - 1e-9:
                raise ValueError(f'anchors are not monotonic near {pts[i - 1]} -> {pts[i]}')

    def __call__(self, t, side='right'):
        x, y = self.x, self.y
        if t <= x[0]:
            return y[0] + (t - x[0])
        if t >= x[-1]:
            return y[-1] + (t - x[-1])
        i = bisect.bisect_right(x, t) if side == 'right' else bisect.bisect_left(x, t)
        # segment [i-1, i]; with duplicate x values bisect picks the latest (right) / earliest (left) anchor
        if side == 'right':
            x0, y0, x1, y1 = x[i - 1], y[i - 1], x[i], y[i]
        else:
            if x[i] == t:
                return y[i]
            x0, y0, x1, y1 = x[i - 1], y[i - 1], x[i], y[i]
        if x1 == x0:
            return y1 if side == 'right' else y0
        return y0 + (y1 - y0) * (t - x0) / (x1 - x0)


def is_num(v):
    return isinstance(v, (int, float)) and not isinstance(v, bool)


def rewrite(doc, warp, keys, end_keys, prec, changes, warnings, path='$'):
    """Return a rewritten copy of doc; append (path, old, new) to changes."""
    if isinstance(doc, list):
        return [rewrite(v, warp, keys, end_keys, prec, changes, warnings, f'{path}[{i}]') for i, v in enumerate(doc)]
    if not isinstance(doc, dict):
        return doc
    out = {}
    for k, v in doc.items():
        p = f'{path}.{k}'
        if k in keys and k != 'dur':
            side = 'left' if k in end_keys else 'right'
            if is_num(v):
                nv = round(warp(v, side), prec)
                out[k] = nv
                if abs(nv - v) > 1e-12:
                    changes.append((p, v, nv))
            elif isinstance(v, list) and v and all(is_num(z) for z in v):
                nv = [round(warp(z, side), prec) for z in v]
                out[k] = nv
                if nv != v:
                    changes.append((p, v, nv))
            else:
                out[k] = rewrite(v, warp, keys, end_keys, prec, changes, warnings, p)
        else:
            out[k] = rewrite(v, warp, keys, end_keys, prec, changes, warnings, p)
    if 'dur' in keys and is_num(doc.get('dur')):
        s_key = next((k for k in START_KEYS if k in keys and is_num(doc.get(k))), None)
        e_key = next((k for k in END_KEYS if k in keys and is_num(doc.get(k))), None)
        old = doc['dur']
        if s_key and e_key:
            nd = round(out[e_key] - out[s_key], prec)
        elif s_key:
            nd = round(warp(doc[s_key] + old, 'left') - warp(doc[s_key]), prec)
        else:
            nd = old
            warnings.append(f'{path}.dur: no start/end key in the same object, left unchanged')
        out['dur'] = nd
        if abs(nd - old) > 1e-12:
            changes.append((f'{path}.dur', old, nd))
    return out


def collect(doc, keys, path='$', acc=None):
    acc = {} if acc is None else acc
    if isinstance(doc, list):
        for i, v in enumerate(doc):
            collect(v, keys, f'{path}[{i}]', acc)
    elif isinstance(doc, dict):
        for k, v in doc.items():
            p = f'{path}.{k}'
            if k in keys and is_num(v):
                acc[p] = v
            else:
                collect(v, keys, p, acc)
    return acc


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('input', nargs='?')
    ap.add_argument('-o', '--output')
    ap.add_argument('--in-place', action='store_true')
    ap.add_argument('--warp', default=DEFAULT_WARP)
    ap.add_argument('--keys')
    ap.add_argument('--add-keys')
    ap.add_argument('--end-keys', default='', help='keys that take the earlier side at a jump (e.g. "e")')
    ap.add_argument('--inverse', action='store_true')
    ap.add_argument('--precision', type=int, default=3)
    ap.add_argument('--dry-run', action='store_true')
    ap.add_argument('--t', nargs='+', type=float, help='map these times and exit')
    ap.add_argument('--compare', help='after warping, compare time fields under --compare-path with this JSON')
    ap.add_argument('--compare-path', default='$.captions')
    ap.add_argument('--tol', type=float, default=0.03)
    a = ap.parse_args()

    wj = json.load(open(a.warp))
    warp = Warp(wj['anchors'], inverse=a.inverse)
    keys = set(a.keys.split(',')) if a.keys else set(DEFAULT_KEYS)
    if a.add_keys:
        keys |= set(a.add_keys.split(','))
    end_keys = set(k for k in a.end_keys.split(',') if k)

    if a.t:
        for t in a.t:
            print(f'{t:.3f} -> {warp(t):.3f}')
        return
    if not a.input:
        ap.error('input JSON required (or use --t)')
    doc = json.load(open(a.input))
    changes, warnings = [], []
    out = rewrite(doc, warp, keys, end_keys, a.precision, changes, warnings)
    for w in warnings:
        print('warning:', w, file=sys.stderr)

    if a.compare:
        ref = json.load(open(a.compare))
        ck = keys - {'dur'}
        got = {p: v for p, v in collect(out, ck).items() if p.startswith(a.compare_path)}
        exp = {p: v for p, v in collect(ref, ck).items() if p.startswith(a.compare_path)}
        common = sorted(set(got) & set(exp))
        missing = sorted(set(got) ^ set(exp))
        errs = [(p, got[p], exp[p], abs(got[p] - exp[p])) for p in common]
        worst = max(errs, key=lambda z: z[3]) if errs else None
        bad = [z for z in errs if z[3] > a.tol]
        print(f'compared {len(common)} time fields under {a.compare_path}; structural mismatches: {len(missing)}')
        if worst:
            print(f'max |warped - reference| = {worst[3]:.4f} s at {worst[0]} ({worst[1]} vs {worst[2]})')
        for p, g, e, d in bad[:20]:
            print(f'  FAIL {p}: warped {g} vs reference {e} (diff {d:.3f})')
        ok = not bad and not missing
        print('PASS' if ok else 'FAIL', f'(tolerance {a.tol} s)')
        sys.exit(0 if ok else 1)

    if a.dry_run:
        for p, o, n in changes:
            print(f'{p}: {o} -> {n}')
        print(f'{len(changes)} field(s) would change', file=sys.stderr)
        return
    text = json.dumps(out, indent=1, ensure_ascii=False) + '\n'
    if a.in_place:
        open(a.input, 'w').write(text)
    elif a.output:
        open(a.output, 'w').write(text)
    else:
        sys.stdout.write(text)
    print(f'{len(changes)} field(s) changed', file=sys.stderr)


if __name__ == '__main__':
    main()
