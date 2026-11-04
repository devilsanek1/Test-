"""The MyPaint test: our stroke plan (plans/<name>.json) painted with real MyPaint brushes over our designed flat."""
import json, subprocess, sys, time, numpy as np
from PIL import Image
sys.path.insert(0, '/tmp/organic/libraries/src')
from rawio import to_raw, from_raw
L = '/tmp/organic/libraries'
BRUSH = {
    'cloud': {'wash': 'ramon/wet_round', 'form': 'tanda/acrylic-04-paint', 'accent': 'deevad/brush',
              'blend': 'classic/blending_knife', 'edge': 'tanda/acrylic-04-paint', 'lost': 'classic/smudge',
              'fringe': 'deevad/large_watercolor_fringe'},
    'tree': {'wash': 'ramon/wet_round', 'form': 'tanda/acrylic-04-paint', 'accent': 'deevad/brush',
             'blend': 'classic/blending_knife', 'edge': 'tanda/acrylic-04-paint', 'lost': 'classic/smudge',
             'fringe': 'deevad/chalk', 'dab': 'tanda/acrylic-04-paint', 'leafy': 'tanda/acrylic-04-paint'},
}
ORDER = ['wash', 'form', 'blend', 'edge', 'dab', 'leafy', 'accent']


def job_of(name, variant='a'):
    plan = json.load(open(f'{L}/plans/{name}.json'))
    w, h = plan['size']
    if variant == 'smudge':
        to_raw(f'{L}/inputs/{name}_v6.png', f'{L}/out/mypaint/{name}_base.rgba')
        out = []
        for i, s in enumerate(st for st in plan['strokes'] if st['kind'] in ('blend', 'edge') or (st['kind'] == 'form' and name == 'cloud')):
            if s['kind'] == 'edge' and not s.get('lost'): continue
            br = 'classic/smudge' if s['kind'] == 'edge' else 'classic/blending_knife'
            wd = s['width'] * (1.8 if s['kind'] == 'edge' else 1.2)
            out.append(dict(s, brush=br, seed=i + 1, width=wd, opacity=0.9 if s['kind'] != 'form' else 0.5))
        return {'size': [w, h], 'base': f'{L}/out/mypaint/{name}_base.rgba', 'out': f'{L}/out/mypaint/{name}_smudge.rgba', 'strokes': out}, (w, h)
    to_raw(plan['design'], f'{L}/out/mypaint/{name}_base.rgba')
    B = BRUSH[name]
    out = []
    for kind in ORDER:
        for i, s in enumerate(st for st in plan['strokes'] if st['kind'] == kind):
            seed = 1000 * ORDER.index(kind) + i + 1
            if kind == 'edge' and s.get('lost'):
                # a lost edge: the zone colour feathered, then a smudge dragged OUT across the silhouette
                out.append(dict(s, brush=B['fringe'], seed=seed, opacity=s['opacity'] * 0.8))
                p = np.array(s['pts'])
                out.append(dict(s, brush=B['lost'], seed=seed + 500000, width=s['width'] * 1.8, pts=p.tolist(), opacity=0.9))
                continue
            out.append(dict(s, brush=B[kind], seed=seed))
    job = {'size': [w, h], 'base': f'{L}/out/mypaint/{name}_base.rgba', 'out': f'{L}/out/mypaint/{name}.rgba', 'strokes': out}
    if variant == 'nopigment':
        job['paintMode'] = 0.0; job['out'] = f'{L}/out/mypaint/{name}_nopigment.rgba'
    return job, (w, h)


if __name__ == '__main__':
    for name in ['cloud', 'tree']:
        for variant in ['a', 'smudge', 'nopigment']:
            job, (w, h) = job_of(name, variant)
            jp = f'{L}/out/mypaint/{name}_{variant}_job.json'
            json.dump(job, open(jp, 'w'))
            t0 = time.time()
            r = subprocess.run(['node', f'{L}/src/mypaint_render.mjs', jp], capture_output=True, text=True)
            print(r.stdout.strip(), r.stderr[-2000:], f'(wall {time.time() - t0:.1f} s)')
            from_raw(job['out'], w, h, f'{L}/out/mypaint/{name}' + ('' if variant == 'a' else '_' + variant) + '.png')
