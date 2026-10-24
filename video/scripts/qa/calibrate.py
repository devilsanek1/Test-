#!/usr/bin/env python3
"""calibrate.py: run deadframes (and framecheck) on the two reference videos and compare with the numbers the
analysis streams measured by hand (docs/motion_spec.md section 9, docs/style_bible_ref2.md section 6.4).

  python3 scripts/qa/calibrate.py [--out scripts/qa/calib] [--jobs 2] [--no-framecheck] [-- extra deadframes args]

Writes <out>/calibration.md + calibration.json and the reference charts (<out>/ref1/, <out>/ref2/).
The thresholds in qalib.DEFAULTS were chosen with this script; rerun it after changing any of them.
"""
from __future__ import annotations

import argparse
import csv
import json
import os
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import qalib as Q  # noqa: E402

REFS = {
    'ref1': dict(video='assets/ref/reference.mp4', scenes='scripts/qa/calib/ref1_scenes.json', band='990,1270',
                 spec={'events_per_s': 5.9, 'median_gap_f': 4, 'longest_event_gap_s': 0.97, 'dead_pct': 3.6, 'longest_dead_s': 0.2,
                       'longest_dead_3k_s': 0.4},
                 src='docs/motion_spec.md 9: medium events 5.9/s, median gap 4 f, longest gap outside transitions 0.97 s; '
                     '3.6 % of frames < 0.1 % pixels changed; longest near-static run 0.2 s (< 1,000 px) / 0.4 s (< 3,000 px)'),
    'ref2': dict(video='assets/ref2/reference2.mp4', scenes='scripts/qa/calib/ref2_scenes.json', band='280,600',
                 spec={'events_per_s': 3.6, 'dead_pct': 35.6, 'longest_dead_s': 1.53},
                 src='docs/style_bible_ref2.md 6.4: medium events 3.6/s; 36 % of frames change < 0.1 % besides the zoom; '
                     'longest near-static run 1.5 s (shot 12)'),
}


def longest_run(flags):
    best = cur = 0
    for f in flags:
        cur = cur + 1 if f else 0
        best = max(best, cur)
    return best


def summarize(name, outdir, fps=30.0):
    rep = json.load(open(os.path.join(outdir, 'deadframes.json')))
    rows = list(csv.DictReader(open(os.path.join(outdir, 'deadframes_frames.csv'))))
    life = [float(r['life_px2']) if r['life_px2'] != 'nan' else 1e12 for r in rows]
    life4 = [float(r['life4_px2']) if r['life4_px2'] != 'nan' else 0.0 for r in rows]
    tr = [int(r['transition']) for r in rows]
    th = rep['options']['dead_px']
    dead = [int(r['dead']) == 1 and not t for r, t in zip(rows, tr)]
    dead15 = [(lv < 1.5 * th and l4 < 1.5 * th) and not t for lv, l4, t in zip(life, life4, tr)]
    sc = json.load(open(os.path.join(Q.ROOT, REFS[name]['scenes'])))['scenes']
    wins = [w for s in sc for w in s.get('transitions', [])]
    on = [e['onset'] / fps for e in rep['events']]
    pts = [0.0] + on + [len(rows) / fps]
    gaps = [(pts[k + 1] - pts[k], pts[k], pts[k + 1]) for k in range(len(pts) - 1)
            if not any(a <= pts[k] <= b or a <= pts[k + 1] <= b for a, b, *_ in wins)]
    g = max(gaps) if gaps else (0, 0, 0)
    ms = {
        'events_per_s': rep['events_per_s'], 'median_gap_f': rep['median_gap_frames'],
        'longest_event_gap_s': round(g[0], 2), 'longest_event_gap_at': [round(g[1], 2), round(g[2], 2)],
        'dead_pct': round(100 * sum(dead) / len(dead), 1), 'longest_dead_s': round(longest_run(dead) / fps, 2),
        'longest_dead_3k_s': round(longest_run(dead15) / fps, 2),
        'scores': {s['id']: s['score'] for s in rep['scenes']}, 'mean_score': round(sum(s['score'] for s in rep['scenes']) / len(rep['scenes']), 2),
        'scenes_pass': f"{rep['passed']}/{len(rep['scenes'])}", 'flagged_runs': sum(s['flagged_runs'] for s in rep['scenes']),
    }
    return ms


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--out', default=os.path.join(HERE, 'calib'))
    ap.add_argument('--jobs', type=int, default=2)
    ap.add_argument('--no-framecheck', action='store_true')
    ap.add_argument('extra', nargs='*', help='extra deadframes arguments (after --)')
    args = ap.parse_args()
    procs = []
    for name, r in REFS.items():
        od = os.path.join(args.out, name)
        cmd = [sys.executable, os.path.join(HERE, 'deadframes.py'), os.path.join(Q.ROOT, r['video']), '--scenes', os.path.join(Q.ROOT, r['scenes']),
               '--caption-band', r['band'], '--name', name, '--out', od, '--quiet'] + args.extra
        procs.append((name, od, subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)))
        if len(procs) >= args.jobs:
            pass
    logs = {}
    for name, od, p in procs:
        logs[name] = p.communicate()[0]
        print(logs[name])
    fc = {}
    if not args.no_framecheck:
        for name, r in REFS.items():
            od = os.path.join(args.out, name)
            cmd = [sys.executable, os.path.join(HERE, 'framecheck.py'), os.path.join(Q.ROOT, r['video']), '--caption-band', r['band'],
                   '--out', od, '--quiet', '--scenes', os.path.join(Q.ROOT, r['scenes'])]
            if name == 'ref1':
                cmd += ['--no-ui-zones']
            out = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True).stdout
            print(out)
            try:
                fc[name] = json.load(open(os.path.join(od, 'framecheck.json')))['summary']
            except Exception:
                fc[name] = None
    res = {}
    L = ['# QA calibration on the reference videos', '',
         'Generated by `python3 scripts/qa/calibrate.py`. "measured" = the analysis streams\' hand-built measurements; '
         '"tool" = `deadframes.py` with the defaults in `scripts/qa/qalib.py`.', '']
    for name, r in REFS.items():
        ms = summarize(name, os.path.join(args.out, name))
        res[name] = {'tool': ms, 'measured': r['spec'], 'source': r['src'], 'framecheck': fc.get(name)}
        L += [f"## {name} (`{r['video']}`)", '', f"Measured: {r['src']}.", '',
              '| metric | measured | tool |', '|---|---|---|']
        for k in ('events_per_s', 'median_gap_f', 'longest_event_gap_s', 'dead_pct', 'longest_dead_s', 'longest_dead_3k_s'):
            if k in r['spec'] or k in ('dead_pct', 'longest_dead_s'):
                L.append(f"| {k} | {r['spec'].get(k, '-')} | {ms[k]} |")
        L += ['', f"Scene scores: {', '.join(f'{k} {v:.1f}' for k, v in ms['scores'].items())} (mean {ms['mean_score']:.2f}; "
              f"{ms['scenes_pass']} pass the gate; {ms['flagged_runs']} dead runs > 0.40 s).", '',
              f"Chart: `scripts/qa/calib/{name}/deadframes.png`", '']
        if fc.get(name):
            f = fc[name]
            L += [f"framecheck: {f.get('errors', 0)} errors, {f.get('warnings', 0)} warnings ({json.dumps(f.get('by_kind', {}))}).", '']
    Q.write_json(os.path.join(args.out, 'calibration.json'), res)
    with open(os.path.join(args.out, 'calibration.md'), 'w') as fh:
        fh.write('\n'.join(L))
    print('\n'.join(L))


if __name__ == '__main__':
    main()
