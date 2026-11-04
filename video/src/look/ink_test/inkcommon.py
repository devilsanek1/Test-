"""The ink-line look test, shared pieces (docs/look/ink_test/NOTES.md). Colour maths and the two-slab matte come from the
light proof's tools (src/look/light_s1/bake/common.py, imported through v7's v7common, never copied or edited)."""
import os
import sys

import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
V7_BAKE = os.path.abspath(os.path.join(HERE, '..', 'v7_s1', 'bake'))
if V7_BAKE not in sys.path:
    sys.path.append(V7_BAKE)

from v7common import LC, H, W, BAND, srgb_to_lab, load_srgb, save_srgb, to_lin, to_srgb, lin_to_lab, lab_to_lin  # noqa: E402,F401

#: the segments rendered alone for the line geometry (v7's context.tsx names), with their PLANE (0 near .. 4 far) and
#: their TIER role: 'A' the beat's subject, 'B' supporting life, 'C' the environment. The sky and the particles get no
#: line in any treatment and are not rendered.
LINED = ['clouds', 'westgap', 'farroofs', 'fartower', 'farlife', 'water', 'fartowpath', 'wing', 'lobby', 'doorleaves',
         'winglife', 'towpathshadows', 'pathfurniture', 'her', 'boatstrips', 'boats', 'pip', 'bank', 'near']

#: plane per segment: 0 near (the table, the chair, the leaves), 1 our bank, 2 the subject plane (the wing, its life,
#: her, the boat and Pip in front of it), 3 the canal and the far towpath, 4 the bridge and the far city, 5 the sky
PLANE = {'near': 0, 'bank': 1, 'wing': 2, 'lobby': 2, 'doorleaves': 2, 'winglife': 2, 'pathfurniture': 2, 'her': 2,
         'boats': 2, 'boatstrips': 2, 'pip': 2, 'towpathshadows': 2, 'fartowpath': 3, 'water': 3, 'farlife': 4,
         'westgap': 4, 'farroofs': 4, 'fartower': 4, 'clouds': 5}
TIER = {'her': 'A', 'lobby': 'A', 'doorleaves': 'A', 'pip': 'B', 'winglife': 'B', 'farlife': 'C'}


def tier(seg):
    return TIER.get(seg, 'C')


def seg_rgba(rdir, seg):
    """A segment's straight colour (sRGB 0..1) and alpha from its black- and white-slab renders (the two-slab matte)."""
    k = load_srgb(os.path.join(rdir, f'seg_{seg}_k.png'))
    w = load_srgb(os.path.join(rdir, f'seg_{seg}_w.png'))
    a = np.clip(1.0 - (w - k).mean(-1), 0.0, 1.0)
    col = np.where(a[..., None] > 1e-3, k / np.maximum(a[..., None], 1e-3), 0.0)
    return np.clip(col, 0, 1), a
