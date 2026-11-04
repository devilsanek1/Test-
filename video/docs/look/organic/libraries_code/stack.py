"""The recommended stack, end to end: FastNoiseLite warps OUR DESIGN (silhouette and zone edges stop being circles),
the shared plan is made on the warped design, MyPaint brushes paint it (peinten's libmypaint port), then a FastNoiseLite
lost-and-found pass (no second warp). Writes out/stack/{cloud,tree}.png."""
import json, subprocess, sys, numpy as np
from PIL import Image
sys.path.insert(0, '/tmp/organic/libraries/src')
import noise_organic as NO
from mypaint_paint import BRUSH, ORDER
from rawio import to_raw, from_raw
L = '/tmp/organic/libraries'
import os; os.makedirs(f'{L}/out/stack', exist_ok=True)
WARP = {'cloud': dict(NO.P['cloud'], band=0, melt=0.0, warp=(9.0, 1.2), freq=(1 / 70, 1 / 16)),
        'tree': dict(NO.P['tree'], band=0, warp=(3.0, 0.8), freq=(1 / 55, 1 / 9))}
for name in ['cloud', 'tree']:
    seed = 31 if name == 'cloud' else 32
    des = np.asarray(Image.open(f'{L}/inputs/{name}_design.png').convert('RGBA'))
    Image.fromarray(NO.organic(des, NO.LIGHT[name], WARP[name], seed), 'RGBA').save(f'{L}/inputs/{name}_design_warped.png')
    if name == 'tree':   # the wood warped by the same field, so the trunk mask still matches
        wd = np.asarray(Image.open(f'{L}/inputs/tree_wood.png').convert('RGBA'))
        Image.fromarray(NO.organic(wd, NO.LIGHT[name], WARP[name], seed), 'RGBA').save(f'{L}/inputs/tree_wood_warped.png')
subprocess.run([f'{L}/venv/bin/python', '-B', f'{L}/src/plan.py', 'warped'], check=True)
for name in ['cloud', 'tree']:
    plan = json.load(open(f'{L}/plans/{name}_w.json'))
    w, h = plan['size']
    to_raw(plan['design'], f'{L}/out/stack/{name}_base.rgba')
    B = BRUSH[name]; out = []
    for kind in ORDER:
        for i, s in enumerate(st for st in plan['strokes'] if st['kind'] == kind):
            seed = 1000 * ORDER.index(kind) + i + 1
            if kind == 'edge' and s.get('lost'):
                out.append(dict(s, brush=B['fringe'], seed=seed, opacity=s['opacity'] * 0.8))
                out.append(dict(s, brush=B['lost'], seed=seed + 500000, width=s['width'] * 1.8, opacity=0.9))
                continue
            out.append(dict(s, brush=B[kind], seed=seed))
    job = {'size': [w, h], 'base': f'{L}/out/stack/{name}_base.rgba', 'out': f'{L}/out/stack/{name}_mp.rgba', 'strokes': out}
    json.dump(job, open(f'{L}/out/stack/{name}_job.json', 'w'))
    r = subprocess.run(['node', f'{L}/src/mypaint_render.mjs', f'{L}/out/stack/{name}_job.json'], capture_output=True, text=True)
    print(r.stdout.strip(), r.stderr[-1500:])
    mp = from_raw(job['out'], w, h, f'{L}/out/stack/{name}_mp.png')
    P = dict(NO.P[name], warp=(0.0, 0.0))
    if name == 'tree': P = dict(P, band=0)          # the tree's edge is already leafy: no second pass
    res = NO.organic(np.asarray(mp), NO.LIGHT[name], P, 41 if name == 'cloud' else 42)
    Image.fromarray(res, 'RGBA').save(f'{L}/out/stack/{name}.png')
