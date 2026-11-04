"""bench_render.py: the organic proof's render cost per frame (docs/look/organic/organic_proof.md "Cost"). The same
composition (src/look/organic_s1 OrganicS1) with the four organic pieces off (v6's frame) and on, rendered by the film's
own path (scripts/render-frames.mjs, the headless shell, GL=angle as the paint stills, concurrency 1), alternating so a
shared machine's drift falls on both; ms per frame as render-frames reports it (page setup amortised over the frames).
  python3 scripts/look/organic/bench_render.py [frames=40] [rounds=2]           -> $OC_SCRATCH/cost.json
  python3 scripts/look/organic/bench_render.py 40 2 --split                     -> $OC_SCRATCH/cost_split.json (each piece
     on its own: which piece costs what; the cloud and the tree replace v6's own images, the facade and the paving add)"""
from __future__ import annotations

import json
import os
import re
import subprocess
import sys
import tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import oc_lib as L  # noqa: E402


def run(props, times):
    d = tempfile.mkdtemp(dir=L.SCRATCH)
    env = dict(os.environ, GL='angle')
    r = subprocess.run(['node', 'scripts/render-frames.mjs', 'OrganicS1', d, times, '--entry=src/look/organic_s1/entry.tsx',
                        '--concurrency=1', '--props=' + json.dumps(props)], cwd=L.VIDEO, env=env, capture_output=True, text=True)
    subprocess.run(['rm', '-rf', d])
    m = re.search(r'(\d+) frames in ([\d.]+)s \((\d+) ms/frame', r.stderr)
    if not m:
        raise RuntimeError(r.stderr[-1500:])
    return int(m.group(3)), float(m.group(2)), int(m.group(1))


def main():
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    split = '--split' in sys.argv
    n = int(args[0]) if len(args) > 0 else 40
    rounds = int(args[1]) if len(args) > 1 else 2
    times = ','.join(f'{1.0 + i / 60:.4f}' for i in range(n))
    out = {'frames': n, 'from_s': 1.0, 'runs': []}
    variants = [('v6', {'organic': False}), ('organic', {'organic': True})]
    if split:
        variants = [('v6', {'organic': False}), ('cloud+tree', {'organic': True, 'only': ['cloud', 'tree']}),
                    ('facade', {'organic': True, 'only': ['facade']}), ('paving', {'organic': True, 'only': ['paving']}),
                    ('organic', {'organic': True})]
    for k in range(rounds):
        for name, props in variants:
            ms, sec, nf = run(props, times)
            out['runs'].append({'variant': name, 'round': k, 'ms_per_frame': ms, 'seconds': sec, 'frames': nf})
            print(name, k, ms, 'ms/frame', flush=True)
    for name, _ in variants:
        out[name + '_ms'] = [r['ms_per_frame'] for r in out['runs'] if r['variant'] == name]
    out['load'] = os.getloadavg()
    json.dump(out, open(os.path.join(L.SCRATCH, 'cost_split.json' if split else 'cost.json'), 'w'), indent=1)
    print(json.dumps({k: v for k, v in out.items() if k.endswith('_ms') or k == 'load'}))


if __name__ == '__main__':
    main()
