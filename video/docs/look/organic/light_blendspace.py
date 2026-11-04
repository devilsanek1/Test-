#!/usr/bin/env python3
"""light_blendspace.py: the blend-space check (light.md §4.11). The proof composites in LINEAR light
(out = base*E + G); the browser's mix-blend-mode multiply / screen / plus-lighter work on sRGB-ENCODED values. How far
is each way of shipping the light as two 8-bit images (one multiply map, one light map) from the linear result, in L*?
    python3 light_blendspace.py <renders_dir> [frame=96] [dose=1.0]
renders_dir as light_demo.py's (the 0.1 s-later row needs base/f<frame+6>.png, e.g. the motion renders).
The end-to-end check in the browser (light.md §4.11, §7): the bench's `solved` frame (lightOff + the multiply map +
the solved screen map, rendered by Chrome) against the proof's linear result, outside her, the row and the band:
    python3 light_blendspace.py <renders_dir> 96 --browser=<solved/f00096.png> --target=<proto_gen/solved_target.npy>
"""
import json
import os
import sys

import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import light_demo as LD  # noqa: E402

opt = dict(a[2:].split('=', 1) for a in sys.argv[1:] if a.startswith('--'))
pos = [a for a in sys.argv[1:] if not a.startswith('--')]
R = pos[0]
f = int(pos[1]) if len(pos) > 1 else 96
dose = float(pos[2]) if len(pos) > 2 else 1.0
if 'browser' in opt:
    import cv2
    P = LD.load(opt['browser'])
    T = np.load(opt['target']).astype(np.float32) / 255
    M = LD.masks(R, f)
    yy, xx = np.mgrid[0:LD.H, 0:LD.W]
    excl = np.zeros((LD.H, LD.W), bool)
    excl[LD.BAND[0] - 10:LD.BAND[1] + 11] = True
    excl |= M['cap_m']
    excl |= cv2.dilate((M['her'] | M['others']).astype(np.uint8), np.ones((13, 13), np.uint8)) > 0   # her light is live
    excl |= (yy > 1085) & (yy < 1125) & (xx > 600) & (xx < 720)      # her door shadow (live in production)
    m = ~excl & (yy > 600)
    lit = (np.abs(T - M['base']).max(-1) > 2 / 255) & m
    d = np.abs(LD.lstar(P) - LD.lstar(T))
    print(json.dumps({'compared_px_%': round(float(m.mean() * 100), 1), 'changed_by_light_px_%': round(float(lit.mean() * 100), 1),
                      'all': {'mean': round(float(d[m].mean()), 2), 'p99': round(float(np.percentile(d[m], 99)), 2), 'max': round(float(d[m].max()), 1)},
                      'changed': {'mean': round(float(d[lit].mean()), 2), 'p99': round(float(np.percentile(d[lit], 99)), 2)},
                      'px_over_2L_%': round(float((d[m] > 2).mean() * 100), 3)}, indent=1))
    sys.exit(0)
out8, M, maps, T = LD.light_frame(R, f, dose=dose)
b = M['base']                                   # sRGB 0..1
lin = LD.to_lin(b)
S, E, G = maps['S'], maps['E'], maps['G'] * LD.band_mask()[..., None]


def knee(x, k=0.9):
    over = np.clip(x - k, 0, None)
    return np.where(x > k, k + over / (1 + over / (1.0 - k + 0.08)), x)


target = np.clip(LD.to_srgb(knee(lin * E + G)), 0, 1)   # the linear model, no dither (a clean reference), displayable
q8 = lambda a: np.round(np.clip(a, 0, 1) * 255) / 255     # an 8-bit map, as a PNG ships it
H, W = b.shape[:2]
band = np.zeros((H, W), bool)
band[LD.BAND[0] - 10:LD.BAND[1] + 11] = True
lift = (lin * (E - S) + G).max(-1)
lit_px = (lift > 0.002) & ~band                 # where the light layer does something
shade_px = (S.min(-1) < 0.995) & ~band          # where the shade layer does something


def dl(a, m):
    d = np.abs(LD.lstar(a) - LD.lstar(target))[m]
    return {'mean': round(float(d.mean()), 2), 'p99': round(float(np.percentile(d, 99)), 2), 'max': round(float(d.max()), 1)}


res = {'frame': f, 'dose': dose, 'lit_px_%': round(float(lit_px.mean() * 100), 1), 'shade_px_%': round(float(shade_px.mean() * 100), 1)}
# 1. the multiply map alone, encoded with the sRGB curve (multiply is almost gamma-invariant: a power law is)
m1 = q8(LD.to_srgb(S))
b1 = b * m1
t_shade = LD.to_srgb(lin * S)
d = np.abs(LD.lstar(b1) - LD.lstar(t_shade))[shade_px]
res['multiply_encoded_sRGB'] = {'mean': round(float(d.mean()), 2), 'p99': round(float(np.percentile(d, 99)), 2), 'max': round(float(d.max()), 1)}
# 2a. naive light map: the linear lift encoded with the sRGB curve, screened
m2 = q8(LD.to_srgb(np.clip(lin * (E - S) + G, 0, 1)))
res['screen_naive_sRGB_encoded'] = dl(1 - (1 - b1) * (1 - m2), lit_px)
# 2b. naive light map, linear values (no curve), screened
m2 = q8(np.clip(lin * (E - S) + G, 0, 1))
res['screen_naive_linear_values'] = dl(1 - (1 - b1) * (1 - m2), lit_px)
# 2c. the map SOLVED against the plane's own base (the bake knows it): screen
m2 = q8(np.clip(1 - (1 - target) / np.maximum(1 - b1, 1e-4), 0, 1))
res['screen_solved'] = dl(1 - (1 - b1) * (1 - m2), lit_px)
m2s = m2
# 2d. solved for plus-lighter (an add in the encoded space): m = target - b1
m2 = q8(np.clip(target - b1, 0, 1))
res['plus_lighter_solved'] = dl(np.clip(b1 + m2, 0, 1), lit_px)
# 3. robustness: the screen map solved at f, applied over the base 6 frames (0.1 s) later: her and the water's shimmer
#    moved under it (the float moves the planes < 1 px in 0.1 s here; in production the map rides its plane anyway)
try:
    b_late = LD.load(f'{R}/base/f{f + 6:05d}.png')
    late = 1 - (1 - b_late * m1) * (1 - m2s)
    lin_late = LD.to_lin(b_late)
    t_late = np.clip(LD.to_srgb(knee(lin_late * E + G)), 0, 1)
    d = np.abs(LD.lstar(late) - LD.lstar(t_late))[lit_px]
    res['screen_solved_applied_6_frames_later'] = {'mean': round(float(d.mean()), 2), 'p99': round(float(np.percentile(d, 99)), 2)}
except SystemExit:
    pass
print(json.dumps(res, indent=1))
