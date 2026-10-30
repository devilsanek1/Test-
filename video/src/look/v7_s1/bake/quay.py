"""v7_s1 bake: OUR QUAY, shared by the painter (piece_quay.py: the material) and the light (v7light.py: the reflections),
so the door's light and the sky land exactly on the painted puddles. Pure numpy (the light bake's python has no
FastNoiseLite): the geometry of src/look/paint_s1/V2S1_steps_stone.tsx (the bank in two-point perspective: every edge
along the canal runs to GROUND_VP, the cross joints to GROUND_VP2; the coping, the landing, five treads with their lips,
the terrace), and THE WET FIELD: the stone after the evening's rain, a damp glossy film everywhere (patchy) and puddles
lying on the treads (natural shapes: ellipses in the ground's own coordinates, long along the tread, their outlines
displaced by noise; never on a lip). Deterministic (seeded by name). Frame px."""
import numpy as np

from v7common import H, W, gblur, rng, smoothstep, value_noise

VP = (-1100.0, 1000.0)            # GROUND_VP: the bank's edges along the canal
VP2 = (2600.0, 1000.0)            # GROUND_VP2: the cross joints
COPING = (1215.0, 1234.0)         # y at x 540 (BANK.coping)
#: band k (0 the landing, 1-5 the treads, 6 the terrace): its top edge and bottom edge (y at x 540) and its lip's height
BAND_Y0 = (1234.0, 1290.0, 1362.0, 1456.0, 1580.0, 1745.0, 1990.0)
BAND_Y1 = (1290.0, 1362.0, 1456.0, 1580.0, 1745.0, 1990.0, 3600.0)
LIPS = (0.0, 5.0, 8.0, 11.0, 15.0, 21.0, 28.0)

_G = {}


def grid():
    if 'g' not in _G:
        yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
        _G['g'] = (yy, xx)
    return _G['g']


def edge_y(y540, x):
    """The y of the bank edge whose y at x 540 is y540 (V2S1_steps_stone edgeY)."""
    return VP[1] + (y540 - VP[1]) * (x - VP[0]) / (540.0 - VP[0])


def y540_of(x, y):
    """The band coordinate: which edge through GROUND_VP a pixel lies on (its y at x 540)."""
    return VP[1] + (y - VP[1]) * (540.0 - VP[0]) / (x - VP[0])


def ground_scale(x, y):
    """V2S1_steps_stone groundScale: 1 at x 540 on the line y540 = 1500; things shrink toward the vanishing point."""
    return ((x - VP[0]) / (540.0 - VP[0])) * (np.maximum(y - VP[1], 1.0) / (1500.0 - VP[1])) ** 0.5


def regions():
    """Masks (bool, frame px) of the quay's faces, from the geometry: 'coping', 'landing', 'tread' (k -> mask), 'lip'
    (k -> mask), and the band index of every pixel (-1 above the coping)."""
    if 'r' in _G:
        return _G['r']
    yy, xx = grid()
    Y = y540_of(xx, yy)
    out = {'Y540': Y, 'coping': (Y >= COPING[0]) & (Y < BAND_Y0[0]), 'tread': {}, 'lip': {}}
    band = np.full((H, W), -1, np.int8)
    for k in range(7):
        y0, y1, lip = BAND_Y0[k], BAND_Y1[k], LIPS[k]
        inb = (Y >= y0) & (Y < y1)
        band[inb] = k
        out['lip'][k] = inb & (Y < y0 + lip)
        out['tread'][k] = inb & (Y >= y0 + lip)
    out['landing'] = out['tread'][0]
    out['band'] = band
    _G['r'] = out
    return out


def wet_field():
    """The quay's wetness, 0..1 (frame px), and the puddles alone: a damp glossy film everywhere (0.14-0.42, patchy at
    ~150 px) and 2-4 puddles per tread (and on the landing and the terrace's corner), each an ellipse in (x, y540): long
    along its tread (the foreshortened ground), lying toward the tread's back half, its outline displaced by noise at
    two octaves (free curves, never a compass ellipse), sharpening to a water edge 2-4 px wide."""
    if 'w' in _G:
        return _G['w']
    yy, xx = grid()
    R = regions()
    Y = R['Y540']
    r = rng('v7/quay/wet')
    damp = 0.28 + 0.14 * value_noise('v7/quay/damp', (H, W), 150, octaves=3, gain=0.55)
    edge_n = value_noise('v7/quay/puddle_edge', (H, W), 26, octaves=3, gain=0.5)
    puddles = np.zeros((H, W), np.float32)
    plan = []
    for k in range(7):
        y0, y1, lip = BAND_Y0[k], BAND_Y1[k], LIPS[k]
        depth = (min(y1, 2300.0) - (y0 + lip))
        n = int(r.integers(2, 5)) if k < 6 else 2
        for _ in range(n):
            cx = float(r.uniform(-40, 1120))
            cy = y0 + lip + depth * float(r.uniform(0.3, 0.85))
            ay = depth * float(r.uniform(0.1, 0.26))
            f = (cx - VP[0]) / (540.0 - VP[0])
            ax = ay * f * float(r.uniform(3.2, 7.5))
            s = float(r.uniform(0.7, 1.0))
            plan.append((k, cx, cy, ax, ay, s))
    for (k, cx, cy, ax, ay, s) in plan:
        # the bounding box in frame px (generous), to keep the work local
        x0, x1 = int(max(0, cx - 1.6 * ax)), int(min(W, cx + 1.6 * ax))
        ys = edge_y(np.array([cy - 1.6 * ay, cy + 1.6 * ay]), np.array([x0, x1, x0, x1])[:, None])
        y0p, y1p = int(max(0, ys.min() - 4)), int(min(H, ys.max() + 4))
        if x1 <= x0 or y1p <= y0p:
            continue
        sl = (slice(y0p, y1p), slice(x0, x1))
        e = ((xx[sl] - cx) / ax) ** 2 + ((Y[sl] - cy) / ay) ** 2 + 0.55 * edge_n[sl]
        p = (1 - smoothstep(0.72, 0.98, e)) * s
        p *= R['tread'][k][sl]
        puddles[sl] = np.maximum(puddles[sl], p)
    puddles = gblur(puddles, 0.8)
    wet = np.clip(damp + puddles * (1 - damp), 0, 1).astype(np.float32)
    _G['w'] = (wet, puddles.astype(np.float32), plan)
    return _G['w']
