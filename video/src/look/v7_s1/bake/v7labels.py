"""v7_s1 bake: what SURFACE each pixel of the static picture is (light_s1/bake/labels.py on v7's segments). Float masks
(the visible share of a surface at the pixel), from the parts renders' alphas (exact geometry) and, inside the wing,
the keyed colours, the scale sheet's geometry, the lobby's own segment, and the marker render (the lit panes drawn pure
green: v7's calm cream sits too close to the limestone piers to pick by colour)."""
import cv2
import numpy as np

from v7common import H, W, STATIC, far_split, gblur, load_srgb, srgb_to_lab, visible

#: the door's opening between its frame's posts (light_s1 labels.py OPENING, measured in the render)
OPENING = (553, 850, 705, 1076)
DOOR_FRAME = (540, 844, 721, 1082)
FASCIA = (520, 800, 740, 846)
#: W, her office window (S1_SHEET.w: the plum-dark pane), measured
W_RECT = (788, 606, 940, 780)


def lit_panes(parts_dir, wing):
    """The lit panes: the marker render's green, each pane filled to its bounding box (its shelves and bottles are the
    lit room too)."""
    mk = load_srgb(f'{parts_dir}/marker_wing.png')
    green = (mk[..., 1] > 0.75) & (mk[..., 0] < 0.35) & (mk[..., 2] < 0.35)
    n, cc, st, _ = cv2.connectedComponentsWithStats(green.astype(np.uint8), 8)
    out = np.zeros((H, W), bool)
    for i in range(1, n):
        x, y, w, h, area = st[i]
        if area < 200:
            continue
        out[y:y + h, x:x + w] = True
    return out & (wing > 0.02)


def labels(parts_dir, A, base):
    vis = visible(A)
    roofs, tower, bridge = far_split(parts_dir, A)
    wg = vis['westgap']
    L = {}
    L['sky'] = vis['sky']
    L['cloud'] = vis['clouds']
    tot = np.maximum(roofs + tower + bridge, 1e-6)
    L['farroofs'] = wg * roofs / tot
    L['fartower'] = wg * tower / tot
    L['bridge'] = wg * bridge / tot + vis['farlife']
    L['water'] = vis['water']
    L['towpath'] = vis['fartowpath'] + vis['towpathshadows']
    L['lamps'] = vis['pathfurniture']
    L['pigeons'] = vis['winglife']
    L['leaves'] = vis['doorleaves']
    L['boats'] = vis['boats'] + vis['boatstrips']
    L['bank'] = vis['bank']
    L['near'] = vis['near']
    # the wing (with the lobby's own segment: the wing drawn again inside the opening through the accent map)
    wing = vis['wing'] + vis['lobby']
    lab = srgb_to_lab(base)
    Ls, a, b = lab[..., 0], lab[..., 1], lab[..., 2]
    yy, xx = np.mgrid[0:H, 0:W]
    inR = lambda r: (xx >= r[0]) & (xx <= r[2]) & (yy >= r[1]) & (yy <= r[3])
    opening = inR(OPENING) | (vis['lobby'] > 0.5)
    frame = inR(DOOR_FRAME) & ~opening & (Ls < 32)
    fascia = inR(FASCIA) & (Ls > 80)
    win_W = inR(W_RECT)
    litwin = lit_panes(parts_dir, vis['wing']) & ~win_W & ~inR(DOOR_FRAME)
    planting = (yy < 660) & (((a < -4) & (b > 3)) | ((a > 8) & (b > 6) & (Ls < 62)))
    # the glass: the keyed slate-violet (cool: b* under -3) and its sky reflections, outside the lights
    glass = (b < -3) & ~litwin & ~opening & ~planting
    used = opening | frame | fascia | win_W | litwin | glass | planting
    f = lambda m: wing * m.astype(np.float32)
    L['lobby'] = f(opening)
    L['doorframe'] = f(frame)
    L['sign'] = f(fascia & ~opening & ~frame)
    L['W'] = f(win_W & ~litwin)
    L['litwin'] = f(litwin)
    L['glass'] = f(glass & ~fascia & ~win_W)
    L['planting'] = f(planting & ~litwin & ~glass)
    L['wall'] = f(~used)
    # the rest (the slab between two planes): the nearest label by a small blur
    s = sum(L.values())
    rest = np.clip(1 - s, 0, 1)
    if rest.max() > 0.01:
        names = list(L.keys())
        stack = np.stack([gblur(L[k], 3) for k in names], 0)
        best = np.argmax(stack, 0)
        for i, k in enumerate(names):
            L[k] = L[k] + rest * (best == i)
    return L, vis
