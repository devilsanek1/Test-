"""v7_s1 bake, shared pieces: v7's segments and slots (src/look/v7_s1/context.tsx) over the light proof's generic tools
(src/look/light_s1/bake/common.py: colour, the seeded generators, the two-slab matte), which are imported, never copied.
The light proof's own lists (its spray, duck, near props) are replaced here by v7's (the composition's cut)."""
import os
import sys

import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
LIGHT_S1_BAKE = os.path.abspath(os.path.join(HERE, '..', '..', 'light_s1', 'bake'))
if LIGHT_S1_BAKE not in sys.path:
    sys.path.append(LIGHT_S1_BAKE)

import common as LC  # noqa: E402  the light proof's generic tools (light_s1/bake/common.py)
from common import (H, W, BAND, BAND_GUARD, to_lin, to_srgb, hex_rgb, lin_hex, lin_to_lab, lab_to_lin, srgb_to_lab,  # noqa: E402,F401
                    Lstar, seed_of, rng, gblur, smoothstep, value_noise, load_srgb, save_srgb, seg_alpha, far_split)

#: v7's segments in drawing order (context.tsx SEGMENTS, without 'wingshades': off in look 'v7a')
SEGMENTS = ['sky', 'clouds', 'westgap', 'farroofs', 'fartower', 'farlife', 'water', 'fartowpath', 'wing', 'lobby',
            'doorleaves', 'winglife', 'towpathshadows', 'pathfurniture', 'her', 'boatstrips', 'boats', 'pip', 'bank',
            'near', 'particles']
MOVERS = ['her', 'pip', 'particles']
STATIC = [s for s in SEGMENTS if s not in MOVERS and s not in ('farroofs', 'fartower')]

#: the slots in drawing order and the segments drawn before each (since the previous slot); the three far slots share
#: one position (after the west gap and the bridge's far life) and split its pixels by label
SLOT_SEGS = [
    ('sky', ['sky', 'clouds']),
    ('far', ['westgap', 'farlife']),
    ('water', ['water']),
    ('subject', ['fartowpath', 'wing', 'lobby', 'doorleaves', 'winglife', 'towpathshadows', 'pathfurniture']),
    ('boats', ['boatstrips', 'boats']),
    ('bank', ['bank']),
    ('near', ['near']),
]
SLOTS = ['sky', 'farroofs', 'fartower', 'bridge', 'water', 'subject', 'boats', 'bank', 'near']
FAR_SLOTS = ('farroofs', 'fartower', 'bridge')


def all_alphas(parts_dir):
    return {s: seg_alpha(parts_dir, s)[0] for s in SEGMENTS}


def carriers(A, eps=1.5 / 255):
    """Which slot's maps carry each pixel's light: the LAST slot whose segments touch it (light_s1 common.carriers on
    v7's slot list): everything drawn after it leaves the pixel alone (the movers aside), so the composite under the
    carrier's maps is exactly the static base render, and the maps are solved against it."""
    car = np.full((H, W), -1, np.int8)
    for i, (_, segs) in enumerate(SLOT_SEGS):
        touch = np.zeros((H, W), bool)
        for s in segs:
            touch |= A[s] > eps
        car[touch] = i
    return car


def slot_pixels(car, L):
    """The pixel set each slot carries (the far group split by its three labels)."""
    out = {}
    for i, (name, _) in enumerate(SLOT_SEGS):
        m = car == i
        if name == 'far':
            stack = np.stack([L['farroofs'], L['fartower'], L['bridge']], 0)
            best = np.argmax(stack, 0)
            for j, fs in enumerate(FAR_SLOTS):
                out[fs] = m & (best == j)
        else:
            out[name] = m
    return out


def visible(A):
    """Each static segment's VISIBLE share in the static picture: its alpha times what every later one leaves."""
    vis = {}
    for s in STATIC:
        v = A[s].copy()
        for t in STATIC[STATIC.index(s) + 1:]:
            v *= 1 - A[t]
        vis[s] = v
    return vis
