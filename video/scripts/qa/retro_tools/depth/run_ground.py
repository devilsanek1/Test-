"""Ground perspective: line directions in the lower ground region (full res 1080 wide).
python3 -I run_ground.py <frames_dir> <out_dir> <tools_dir>"""
import json, sys
import numpy as np
sys.path.insert(0, sys.argv[3])
import depth_measure as dm

dm.FR, OUT = sys.argv[1], sys.argv[2]
CASES = [
    ('look_5.4', 'our bank: the steps (bottom third)', (0.0, 0.635, 1.0, 1.0)),
    ('look_0.5', 'our bank: the steps (bottom third)', (0.0, 0.635, 1.0, 1.0)),
    ('look_1.2', 'our bank: the steps (bottom third)', (0.0, 0.635, 1.0, 1.0)),
    ('look_3.0', 'our bank: the steps (bottom third)', (0.0, 0.635, 1.0, 1.0)),
    ('look_5.4', 'far bank + water (towpath, canal)', (0.0, 0.53, 1.0, 0.635)),
    ('r1_1.0', 'the street (one-point)', (0.28, 0.37, 0.75, 0.68)),
    ('r1_6.0', 'the street with the crowd', (0.28, 0.37, 0.75, 0.68)),
    ('r1_15.5', 'the plaza (frontal)', (0.14, 0.46, 0.86, 0.69)),
    ('v1_10.0', 'the square (one-point)', (0.0, 0.62, 1.0, 1.0)),
    ('v1_20.5', 'the side street', (0.0, 0.60, 1.0, 1.0)),
    ('v1_1.0', 'the plaza', (0.0, 0.76, 1.0, 1.0)),
    ('v1_38.5', 'the near ground', (0.03, 0.82, 0.85, 1.0)),
    ('v1_25.5', 'the parapet + heads (frontal foreground)', (0.0, 0.70, 1.0, 1.0)),
    ('v1_45.5', 'the street foreground', (0.0, 0.76, 1.0, 1.0)),
]
res = []
for i, (name, label, roi) in enumerate(CASES):
    r = dm.ground(name, roi, out_png=f'{OUT}/ground_{i}_{name}.png')
    r.update(frame=name, label=label)
    res.append(r)
json.dump(res, open(f'{OUT}/ground.json', 'w'), indent=1)
print(f"{'frame':9s} {'segs':>4} {'len/Mpx':>7} {'horiz':>5} {'vert':>5} {'conv':>5} {'oblq':>5} | {'vis/Mpx':>7} {'vHor':>5} {'vConv':>5} {'vObl':>5} | {'conCon':>6} {'horCon':>6}  vp  label")
for r in res:
    vp = 'none' if not r['vp'] else f"({r['vp'][0]:.0f},{r['vp'][1]:.0f})"
    print(f"{r['frame']:9s} {r['n']:4d} {r['len_per_mpx']:7.0f} {r['horizontal']:5.2f} {r['vertical']:5.2f} {r['converging']:5.2f} {r['oblique_other']:5.2f} | {r['vis_len_per_mpx']:7.0f} {r['vis_horizontal']:5.2f} {r['vis_converging']:5.2f} {r['vis_oblique_other']:5.2f} | {r['conv_contrast_med']:6.1f} {r['horiz_contrast_med']:6.1f}  {vp}  {r['label']}")
    print('          horizontal rows y:', r['h_rows'][:24])
