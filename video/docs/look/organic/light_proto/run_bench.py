#!/usr/bin/env python3
"""run_bench.py: the light bench's cost table (light.md §7). For each kind, renders the same NF frames (env NF,
default 30: 1.0 s on, every other 60 fps frame) of LightBench at concurrency 1 through scripts/render-frames.mjs and
reads its ms/frame; then checks determinism (the frame at 1.6 s rendered twice, in fresh renders, gives the same
bytes). From video/:
    NF=60 python3 docs/look/organic/light_proto/run_bench.py /tmp/organic/light/bench [kind=n ...]
"""
import hashlib
import json
import os
import re
import subprocess
import sys
import time

OUT = sys.argv[1]
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../../..'))
ENTRY = 'docs/look/organic/light_proto/entry.tsx'
NF = int(os.environ.get('NF', '30'))
TIMES = ','.join(f'{1.0 + i * 2 / 60:.4f}' for i in range(NF))
RUNS = [a.split('=') for a in sys.argv[2:]] or [
    ['none', '1'], ['svgEmpty', '1'], ['mapImg', '1'], ['gradPool', '1'], ['bloomLive', '1'], ['bloomLiveFull', '1'],
    ['rimMask', '1'], ['rimFilter', '1'], ['wrap', '1'], ['shadowProj', '1'], ['shafts', '1'], ['dither', '1'],
    ['rimMask', '4'], ['bloomLive', '4'], ['mapImg', '4'], ['all', '1'], ['none', '1']]


def render(kind, n, times, sub, gl='angle'):
    d = os.path.join(OUT, sub)
    env = dict(os.environ, GL=gl)
    pr = {'kind': kind, 'n': int(n)}
    if kind == 'lightOff':                       # v6 with lib/light's layers off (its own input prop)
        pr = {'kind': 'none', 'n': 1, 'lightOff': True}
    if kind in ('proposal', 'solved'):           # lib/light's live layers off, the baked maps (+ her live layers) on
        pr = {'kind': kind, 'n': 1, 'lightOff': True}
    props = json.dumps(pr)
    p = subprocess.run(['node', 'scripts/render-frames.mjs', 'LightBench', d, times, f'--entry={ENTRY}', '--concurrency=1',
                        f'--props={props}'], cwd=ROOT, env=env, capture_output=True, text=True)
    m = re.search(r'(\d+) frames in ([\d.]+)s \((\d+) ms/frame', p.stderr)
    if not m:
        print(p.stderr[-2000:])
        raise SystemExit('render failed')
    return int(m.group(1)), float(m.group(2)), int(m.group(3)), d


def md5(path):
    return hashlib.md5(open(path, 'rb').read()).hexdigest()


res = []
for kind, n in RUNS:
    load0 = os.getloadavg()[0]
    nf, secs, msf, d = render(kind, n, TIMES, f'{kind}_{n}')
    # determinism: frame 1.6 s twice in two fresh renders
    _, _, _, d1 = render(kind, n, '1.6', f'det_{kind}_{n}_a')
    _, _, _, d2 = render(kind, n, '1.6', f'det_{kind}_{n}_b')
    same = md5(os.path.join(d1, 'f00096.png')) == md5(os.path.join(d2, 'f00096.png'))
    row = {'kind': kind, 'n': int(n), 'frames': nf, 'secs': secs, 'ms_per_frame': msf, 'deterministic': same,
           'load_before': round(load0, 2)}
    res.append(row)
    print(json.dumps(row), flush=True)
with open(os.path.join(OUT, 'bench.json'), 'w') as fh:
    json.dump(res, fh, indent=1)
