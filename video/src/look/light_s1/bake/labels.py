"""light_s1 bake: what SURFACE each pixel of the static picture is (light_proof.md §2.2). Each label is a float mask (the
visible share of that surface at the pixel; anti-aliased edges mix two), from the parts renders' alphas (exact
geometry) and, inside the wing, the flat colours plus the scale sheet's geometry (S1_SHEET.door, the door frame found in
the render). The light and the key read these labels: a surface is lit, shaded or keyed as what it is."""
import numpy as np
import cv2

from common import H, W, STATIC, far_split, srgb_to_lab, gblur

#: the door's opening between its frame's posts, measured in the render (the posts x 544-552 / 706-720, the lintel
#: y 846-849, the threshold y 1077-1080): what the lobby's light comes through
OPENING = (553, 850, 705, 1076)
DOOR_FRAME = (540, 844, 721, 1082)
FASCIA = (520, 800, 740, 846)
#: W, her office window (S1_SHEET.w: the plum-dark pane), measured
W_RECT = (788, 606, 940, 780)


def labels(parts_dir, A, base):
    order = STATIC
    vis = {}
    for s in order:
        v = A[s].copy()
        for t in order[order.index(s) + 1:]:
            v *= 1 - A[t]
        vis[s] = v
    roofs, tower, bridge = far_split(parts_dir, A)
    wg = vis['westgap']
    # the bridge's far life draws after the west gap: its own visible share joins the bridge
    L = {}
    L['sky'] = vis['sky']
    L['cloud'] = vis['clouds']
    L['spray'] = vis['spray']
    tot = np.maximum(roofs + tower + bridge, 1e-6)
    L['farroofs'] = wg * roofs / tot
    L['fartower'] = wg * tower / tot
    L['bridge'] = wg * bridge / tot + vis['farlife']
    L['water'] = vis['water']
    L['towpath'] = vis['fartowpath'] + vis['towpathshadows']
    L['lamps'] = vis['pathfurniture']
    L['pigeons'] = vis['winglife']
    L['leaves'] = vis['doorleaves']
    L['boats'] = vis['boats'] + vis['boatstrips'] + vis['duck']
    L['bank'] = vis['bank'] + vis['nearunder']
    L['near'] = vis['near'] + vis['nearover']
    # the wing, split by what it is
    wing = vis['wing']
    lab = srgb_to_lab(base)
    Ls, a, b = lab[..., 0], lab[..., 1], lab[..., 2]
    yy, xx = np.mgrid[0:H, 0:W]
    inR = lambda r: (xx >= r[0]) & (xx <= r[2]) & (yy >= r[1]) & (yy <= r[3])
    opening = inR(OPENING)
    frame = inR(DOOR_FRAME) & ~opening & (Ls < 32)
    fascia = inR(FASCIA) & (Ls > 80)
    win_W = inR(W_RECT)
    # the lit windows: the yellow panes, each filled to its bounding box (their interiors' shelves and bottles are lit
    # rooms too); found as connected yellow regions of the wing outside the door
    yellow = (wing > 0.5) & (b > 22) & (Ls > 60) & ~inR(DOOR_FRAME)
    n, cc, st, _ = cv2.connectedComponentsWithStats(yellow.astype(np.uint8), 8)
    litwin = np.zeros((H, W), bool)
    for i in range(1, n):
        x, y, w, h, area = st[i]
        if area < 300:
            continue
        litwin[y:y + h, x:x + w] = True
    litwin &= ~win_W
    planting = (yy < 660) & (((a < -4) & (b > 3)) | ((a > 8) & (b > 6) & (Ls < 62)))
    glass = (a < -4) & ~litwin & ~opening & ~planting
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
    # the rest (the slab between two planes): the plane it most likely belongs to is the one around it; give it to the
    # nearest label by a small blur of the labels
    s = sum(L.values())
    rest = np.clip(1 - s, 0, 1)
    if rest.max() > 0.01:
        names = list(L.keys())
        stack = np.stack([gblur(L[k], 3) for k in names], 0)
        best = np.argmax(stack, 0)
        for i, k in enumerate(names):
            L[k] = L[k] + rest * (best == i)
    return L, vis


def label_preview(L):
    """A false-colour picture of the labels (for the sheet's method panel and for checking)."""
    pal = {
        'sky': (190, 200, 235), 'cloud': (230, 210, 230), 'spray': (200, 120, 40), 'farroofs': (240, 180, 160),
        'fartower': (160, 160, 200), 'bridge': (220, 120, 110), 'water': (90, 120, 200), 'towpath': (200, 190, 150),
        'lamps': (60, 60, 60), 'pigeons': (0, 0, 0), 'leaves': (120, 220, 220), 'boats': (60, 140, 90),
        'bank': (170, 110, 90), 'near': (120, 70, 50), 'lobby': (255, 240, 120), 'doorframe': (40, 20, 10),
        'sign': (255, 255, 255), 'W': (80, 30, 90), 'litwin': (250, 200, 60), 'glass': (80, 180, 180),
        'planting': (100, 180, 90), 'wall': (225, 160, 140),
    }
    out = np.zeros((H, W, 3), np.float32)
    for k, m in L.items():
        out += m[..., None] * np.array(pal.get(k, (255, 0, 255)), np.float32)[None, None] / 255
    return np.clip(out, 0, 1)
