"""S1 before / after: the G4 look clip (what the owner saw), the G4 look clip v2 (L1's depth pass) and the current code
(a 0.4-scale still render), all measured at 432 px wide with the same boxes.
python3 -I run_compare.py <frames_dir> <out_dir> <tools_dir> <t> [<t> ...]"""
import json, sys
import numpy as np
sys.path.insert(0, sys.argv[3])
import depth_measure as dm

dm.FR, OUT = sys.argv[1], sys.argv[2]
TIMES = sys.argv[4:] or ['5.4']
WID = 432
SUN = dm.hexlab('#EE6A2E')
AIR = [(0.0, 0.315, 0.10, 0.378), (0.265, 0.315, 0.30, 0.385)]
PLANES = [
    ('near bank (bottom)', [(0.45, 0.87, 1.0, 1.0), (0.0, 0.87, 0.45, 0.955)]),
    ('mid bank (treads)', [(0.0, 0.685, 1.0, 0.865)]),
    ('landing (seated public)', [(0.0, 0.64, 0.60, 0.68), (0.74, 0.64, 1.0, 0.68)]),
    ('canal water', [(0.0, 0.59, 0.70, 0.628)]),
    ('far towpath + row', [(0.0, 0.49, 0.72, 0.565)]),
    ('wing facade', [(0.31, 0.315, 1.0, 0.49)]),
    ('far city front row', [(0.035, 0.43, 0.30, 0.484)]),
    ('far city back rows', [(0.035, 0.392, 0.30, 0.425)]),
]
WING = [(0.3046, 0.30), (1.0, 0.30), (1.0, 0.565), (0.3046, 0.565)]
EDGES = [('wing west edge (all)', (0.25, 0.318, 0.36, 0.484)), ('below the far roofs', (0.25, 0.395, 0.36, 0.484)),
         ('against the band', (0.25, 0.318, 0.36, 0.395))]
res = {}
for t in TIMES:
    for state in ('look', 'lookv2', 'now'):
        name = f'{state}_{t}'
        try:
            bgr, lab = dm.load(name, width=WID)
        except Exception as e:  # noqa
            print('skip', name, e)
            continue
        sunm = np.linalg.norm(lab - SUN, axis=2) < 25
        air = lab[dm.boxmask(lab.shape, AIR) & ~sunm].mean(0)
        r = {'planes': {}, 'edges': {}}
        for pn, boxes in PLANES:
            r['planes'][pn] = dm.stats(lab, dm.boxmask(lab.shape, boxes) & ~sunm, air)
        near = dm.polymask(lab.shape, WING)
        for en, box in EDGES:
            r['edges'][en] = dm.separation(lab, near, dm.boxmask(lab.shape, [box]))
        vps = [(540, 965)] if state != 'now' else [(-1100, 1000), (2600, 1000)]  # the bank's VPs as built (BANK.vp; GROUND_VP, GROUND_VP2)
        g = dm.ground(name, (0.0, 0.635, 1.0, 1.0), width=WID, out_png=f'{OUT}/cmp_ground_{name}.png', vps=vps)
        r['ground'] = {k: g[k] for k in ('horizontal', 'vertical', 'converging', 'oblique_other', 'vis_horizontal', 'vis_converging', 'vis_oblique_other', 'conv_contrast_med', 'vis_to_declared', 'vis_to_any_declared')}
        r['ground']['vp1080'] = None if not g['vp'] else [g['vp'][0] * 1080 / WID, g['vp'][1] * 1080 / WID]
        res[name] = r
json.dump(res, open(f'{OUT}/compare.json', 'w'), indent=1, default=float)
for t in TIMES:
    print(f'\n=== t {t} s (432 px) ===')
    print(f"{'plane':26s} " + ' | '.join(f'{s:^34s}' for s in ('G4 look (owner saw)', 'G4 look v2 (L1 depth pass)', 'code now (0.4 render)')))
    print(f"{'':26s} " + ' | '.join(f"{'L':>5}{'C':>5}{'Lrng':>6}{'LC':>6}{'edge':>6}{'dEair':>6}" for _ in range(3)))
    for pn, _ in PLANES:
        row = []
        for state in ('look', 'lookv2', 'now'):
            p = res.get(f'{state}_{t}', {}).get('planes', {}).get(pn)
            row.append(f"{p['L']:5.1f}{p['C']:5.1f}{p['Lrange']:6.1f}{p['LC']:6.2f}{p['edge']:6.2f}{p['dEair']:6.1f}" if p else ' ' * 34)
        print(f'{pn:26s} ' + ' | '.join(row))
    for en, _ in EDGES:
        row = []
        for state in ('look', 'lookv2', 'now'):
            e = res.get(f'{state}_{t}', {}).get('edges', {}).get(en)
            row.append(f"|dL| {e['dL_med']:5.1f} same {e['same_value']:4.2f} run {e['longest_same_run_px']:3d}px" if e else ' ' * 34)
        print(f'{en:26s} ' + ' | '.join(f'{x:34s}' for x in row))
    row = []
    for state in ('look', 'lookv2', 'now'):
        g = res.get(f'{state}_{t}', {}).get('ground')
        row.append(f"hor {g['vis_horizontal']:.2f} to declared VPs {g['vis_to_any_declared']:.2f}" if g else '')
    print(f"{'bank lines (visible)':26s} " + ' | '.join(f'{x:34s}' for x in row))
    row = []
    for state in ('look', 'lookv2', 'now'):
        g = res.get(f'{state}_{t}', {}).get('ground')
        row.append(f"vp {g['vp1080']}" if g and g['vp1080'] is None else (f"vp ({g['vp1080'][0]:.0f},{g['vp1080'][1]:.0f}) conCon {g['conv_contrast_med']:.1f}" if g else ''))
    print(f"{'bank VP (1080 px)':26s} " + ' | '.join(f'{x:34s}' for x in row))
