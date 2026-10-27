"""build_showcase.py: the 3.2 s G3 animated-sketchbook SHOWCASE (owner ask, 2026-10-27): one continuous shot in the
house's best grammar — the cozy home base pulling back into the S5 pull-back crane reveal (CINEMATIC_GUIDE S5, the
owner's favourite; scale cues; STORYBOARD_STYLE board style; G3_ANIMATIC motion rules).

Story: frame 0 draws your lamp-lit window live; a figure stands looking out; one bezier pull-back leaves the room
through its own window, the facade swallows it, rooftops slide past (a foreground stack wipes the hand-off), the far
town lands and a dark ridge-city rises over the horizon as the move settles. Birds, drifting clouds and a window
lighting up carry the hold. The lit window with the tiny figure stays the anchor.

Mechanics mirror scripts/v3/build_proposal_pullback.py: elements are DESIGNED in end-frame coordinates and AUTHORED at
their start positions; each plane is one geometric scale move (moves[].s about o) on the ONE ease
cubic-bezier(0.55, 0.03, 0.50, 1.0). Prints the per-plane peak screen speeds (budget ~15 px/frame at 60 fps).

  python3 scripts/g3demo/build_showcase.py && python3 scripts/v3/board_lint.py public/g3demo/showcase.json
"""
import json
import os

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..')
OUT = os.path.join(ROOT, 'public', 'g3demo', 'showcase.json')

DUR = 3.2
MOVE_AT = 0.42            # the creep starts here (frame 1 of the move is at 3 % of peak: never still)
MOVE = 1.95               # lands at 2.37; hold 2.37-3.2
EASE = [0.55, 0.03, 0.50, 1.0]
FPS = 60


def bezier(x1, y1, x2, y2):
    def f(x):
        lo, hi = 0.0, 1.0
        for _ in range(50):
            m = (lo + hi) / 2
            bx = 3 * (1 - m) ** 2 * m * x1 + 3 * (1 - m) * m * m * x2 + m ** 3
            lo, hi = (m, hi) if bx < x else (lo, m)
        m = (lo + hi) / 2
        return 3 * (1 - m) ** 2 * m * y1 + 3 * (1 - m) * m * m * y2 + m ** 3
    return f


EASE_F = bezier(*EASE)
p_at = lambda t: EASE_F(min(1.0, max(0.0, (t - MOVE_AT) / MOVE)))


def t_of_p(p):
    """time at which the move's progress reaches p"""
    lo, hi = MOVE_AT, MOVE_AT + MOVE
    for _ in range(50):
        m = (lo + hi) / 2
        lo, hi = (m, hi) if p_at(m) < p else (lo, m)
    return (lo + hi) / 2


R = lambda v: round(v, 1)


def plane(o, off, k):
    """design in END coords; author at START = end scaled k about o and shifted off. Returns (to_start, move)."""
    os_ = (o[0] + off[0], o[1] + off[1])
    to_start = lambda x, y: (os_[0] + k * (x - o[0]), os_[1] + k * (y - o[1]))
    move = {'dx': -off[0], 'dy': -off[1], 's': round(1 / k, 6), 'o': [os_[0], os_[1]],
            'at': MOVE_AT, 'dur': MOVE, 'ease': EASE}
    return to_start, move


# pivots: NEAR = the window (ends lower-left; starts filling the frame), MID biased toward the right roofs,
# FAR holds the horizon within 0.02 H (an orbit, not a truck)
NEAR, NEAR_MV = plane((205, 1095), (335, -105), 8.0)
MID, MID_MV = plane((800, 1010), (300, -120), 2.2)
FAR, FAR_MV = plane((540, 880), (260, -20), 1.15)

T_SWAP = t_of_p(0.50)          # the wipe hides the hand-off (big room out, seen-from-outside window in)
T_RIDGE = t_of_p(0.72)         # the ridge-city starts rising over the roofline...
T_LAND = t_of_p(0.96)          # ...and lands as the camera slows

els, moves = [], []


def add(el, *mv):
    els.append(el)
    for m in mv:
        moves.append({'el': len(els) - 1, **m})


def rect_to(f, k, x, y, w, h, **kw):
    x0, y0 = f(x, y)
    return {'t': 'rect', 'x': R(x0), 'y': R(y0), 'w': R(w * k), 'h': R(h * k), **kw}


def pts_to(f, pts):
    return [[R(a) for a in f(x, y)] for x, y in pts]


# ---- FAR plane (end coords): haze band, the town roofline + its window scribble, the ridge-city, two big clouds -----
add(rect_to(FAR, 1.15, -80, 745, 1240, 135, fill='light', role='far'), FAR_MV)                      # haze: the world keeps going
town = [[-150, 880]]
x, step = -150, 0
heights = [795, 838, 812, 858, 800, 845, 822, 862, 806, 850, 816, 840]
while x < 1250:
    h = heights[step % len(heights)]
    town += [[x, h], [x + 58, h - 14], [x + 58, 880] if step % 3 == 2 else [x + 58, h - 14]]
    x += 116
    step += 1
town += [[x, 880]]
add({'t': 'line', 'pts': pts_to(FAR, town), 'role': 'far'}, FAR_MV)                                  # the town roofline
add({**rect_to(FAR, 1.15, -60, 812, 1180, 60), 't': 'scribble', 'gap': 24, 'jitter': 6}, FAR_MV)     # its windows as marks
ridge = [[-120, 800], [-120, 756], [40, 756], [40, 716], [120, 716], [120, 748], [250, 748], [250, 700], [262, 700],
         [268, 664], [274, 700], [330, 700], [330, 736], [470, 736], [470, 690], [560, 690], [560, 722], [700, 722],
         [700, 676], [712, 676], [718, 660], [724, 676], [820, 676], [820, 712], [960, 712], [960, 742], [1100, 742],
         [1100, 770], [1250, 770], [1250, 800]]
ridge_low = [[x, y + 175] for x, y in ridge]  # authored hidden behind the town band; the rise lifts it to the design
add({'t': 'line', 'pts': pts_to(FAR, ridge_low), 'closed': True, 'fill': 'dark', 'role': 'subject', 'sw': 5,
     'in': round(T_RIDGE - 0.02, 2)},
    FAR_MV, {'dx': 0, 'dy': R(-175 * 1.15), 'at': round(T_RIDGE, 2), 'dur': round(T_LAND - T_RIDGE, 2), 'ease': 'outSine'})
for cx, cy, rx, ry in ((260, 430, 150, 42),):                                                        # a huge cloud (flat, band-legal)
    sx, sy = FAR(cx, cy)
    add({'t': 'ellipse', 'cx': R(sx), 'cy': R(sy), 'rx': R(rx * 1.15), 'ry': R(ry * 1.15), 'fill': 'light', 'role': 'far'},
        FAR_MV, {'dx': -45, 'dy': 0, 'at': 0, 'dur': DUR, 'ease': 'linear'})

# ---- MID plane: the right rooftops, the city falling away below us (the drop), the street canyon ------------------
roof_r = [[1170, 1920], [1170, 1004], [1005, 958], [938, 1006], [852, 1042], [852, 1920]]
add({'t': 'line', 'pts': pts_to(MID, roof_r), 'closed': True, 'fill': 'light', 'role': 'mid'}, MID_MV)
row2 = [[310, 1120], [310, 1010], [400, 1010], [400, 968], [470, 968], [470, 1010], [590, 1038], [590, 996],
        [700, 996], [700, 1050], [820, 1072], [890, 1046], [890, 1120]]
add({'t': 'line', 'pts': pts_to(MID, row2), 'closed': True, 'fill': 'light', 'role': 'far', 'in': round(T_SWAP, 2)}, MID_MV)  # far block row (flat)
row1 = [[300, 1560], [300, 1220], [410, 1220], [410, 1160], [430, 1160], [430, 1220], [560, 1260], [560, 1180],
        [700, 1180], [700, 1240], [790, 1292], [900, 1258], [900, 1560]]
add({'t': 'line', 'pts': pts_to(MID, row1), 'closed': True, 'fill': 'light', 'role': 'mid', 'in': round(T_SWAP, 2)}, MID_MV)  # nearer row below us
add({**rect_to(MID, 2.2, 320, 1030, 560, 480), 't': 'scribble', 'gap': 44, 'jitter': 14, 'role': 'far', 'in': round(T_SWAP, 2)}, MID_MV)
add(rect_to(MID, 2.2, -60, 1580, 1240, 170, fill='light', role='mid', **{'in': round(T_SWAP, 2)}), MID_MV)                       # the street, far below

# ---- NEAR plane: the facade around the window hole (the slot), the glass, the room, the hand-off -------------------
for (sx, sy, sw, sh) in ((20, 930, 150, 750), (240, 930, 160, 750), (20, 930, 380, 120), (20, 1140, 380, 540)):
    add(rect_to(NEAR, 8.0, sx, sy, sw, sh, fill='light', role='far'), NEAR_MV)                       # wall strips; hole = the window
add({**rect_to(NEAR, 8.0, 32, 1165, 346, 480), 't': 'scribble', 'gap': 160, 'jitter': 48, 'role': 'far',
     'in': round(T_SWAP, 2)}, NEAR_MV)                                                               # facade windows (from outside)
add(rect_to(NEAR, 8.0, 170, 1050, 70, 90, fill='paper', role='mid', **{'in': round(T_SWAP, 2)}), NEAR_MV)  # the lit glass
dx_, dy_ = NEAR(218, 1086)
add({'t': 'ellipse', 'cx': R(dx_), 'cy': R(dy_), 'rx': 56, 'ry': 72, 'fill': 'dark', 'role': 'mid',
     'in': round(T_SWAP, 2)}, NEAR_MV)                                                               # tiny you at the glass
add(rect_to(NEAR, 8.0, 168, 1048, 74, 94, role='mid'), NEAR_MV)                                      # window frame
add({'t': 'line', 'pts': pts_to(NEAR, [[205, 1052], [205, 1138]]), 'role': 'mid'}, NEAR_MV)          # ONE mullion
px_, py_ = NEAR(205, 1133)
add({'t': 'ellipse', 'cx': R(px_), 'cy': R(py_), 'rx': R(26 * 8), 'ry': R(5.5 * 8), 'fill': 'paper', 'role': 'mid',
     'out': round(T_SWAP, 2)}, NEAR_MV)                                                              # the lamp pool on the floor
fx_, fy_ = NEAR(225, 1136)
add({'t': 'figure', 'x': R(fx_), 'y': R(fy_), 'h': R(58 * 8), 'pose': 'lookup', 'facing': 'l', 'role': 'mid',
     'fill': 'dark', 'out': round(T_SWAP, 2)}, NEAR_MV)                                              # you, looking out (suspense)
add(rect_to(NEAR, 8.0, 328, 986, 26, 34, fill='paper', role='mid', **{'in': 2.7}), NEAR_MV)          # a neighbour's light comes on

# ---- the foreground wipe (hides the hand-off at peak speed) and the bird ladder (life in the hold) ------------------
wipe = [[0, 980], [60, 940], [60, 760], [130, 760], [130, 930], [320, 900], [320, 680], [350, 680], [350, 640],
        [410, 640], [410, 680], [440, 680], [440, 890], [600, 870], [600, 740], [668, 740], [668, 860], [700, 905]]
wipe = [[x + 1240, y] for x, y in wipe] + [[1940, 1920], [1240, 1920]]
add({'t': 'line', 'pts': wipe, 'closed': True, 'fill': 'mid', 'role': 'far',
     'in': round(T_SWAP - 0.24, 2), 'out': round(T_SWAP + 0.26, 2)},
    {'dx': -2740, 'dy': 0, 'at': round(T_SWAP - 0.23, 2), 'dur': 0.47, 'ease': 'linear'})            # a passing stack, ~97 px/f (own window)
for bx, by, s_, t0 in ((1010, 700, 1.0, 2.46), (870, 790, 0.47, 2.58)):                              # 2x bird ladder, smaller lower
    add({'t': 'line', 'pts': [[bx, by], [bx + 30 * s_, by - 16 * s_], [bx + 60 * s_, by]], 'role': 'far', 'in': t0},
        {'dx': R(-330 * s_), 'dy': R(-26 * s_), 'at': t0, 'dur': round(DUR - t0, 2), 'ease': 'linear'})

# ---- speed budget check (G3_ANIMATIC §4: ~15 px/frame at the render rate; the wipe has its own ~90 px/f window) -----
def peak(f, k, pts, mv):
    """peak on-screen speed of the given END-design points (authored at start; geometric scale (1/k)^p about the
    sliding pivot). Only frames where the point is near the visible frame count."""
    worst = 0.0
    for (ex, ey) in pts:
        sx, sy = f(ex, ey)
        prev = None
        for fr in range(int(DUR * FPS)):
            p = p_at(fr / FPS)
            kk = (1 / k) ** p
            x = (mv['o'][0] + p * mv['dx']) + kk * (sx - mv['o'][0])
            y = (mv['o'][1] + p * mv['dy']) + kk * (sy - mv['o'][1])
            vis = -100 <= x <= 1180 and -100 <= y <= 2020
            if prev and vis and prev[2]:
                worst = max(worst, ((x - prev[0]) ** 2 + (y - prev[1]) ** 2) ** 0.5)
            prev = (x, y, vis)
    return worst


for name, f, k, mv, pts in (('near', NEAR, 8.0, NEAR_MV, [(240, 930), (20, 1680), (205, 1095)]),
                            ('mid', MID, 2.2, MID_MV, [(1170, 1004), (-80, 985)]),
                            ('far', FAR, 1.15, FAR_MV, [(-150, 880), (1250, 756)])):
    print(f'{name} peak {peak(f, k, pts, mv):.1f} px/frame (budget ~15)')

data = {
    'style': 'board',
    'label': 'G3 SHOWCASE · pull-back crane',
    'audio': 'g3demo/silence.wav',
    'durationSec': DUR,
    'frame0': 'Above it all.',
    'frame0Until': 0.55,
    'words': [{'w': 'Above', 's': 2.48, 'e': 2.66}, {'w': 'it', 's': 2.66, 'e': 2.76}, {'w': 'all.', 's': 2.76, 'e': 3.0}],
    'sfx': [{'src': 'v3/v3_led_tik.wav', 't': 0.3, 'gain': 0.4},
            {'src': 'v3/phone_sent_swoosh.wav', 't': round(MOVE_AT + 0.05, 2), 'gain': 0.5},
            {'src': 'v3/v3_floor_slam.wav', 't': round(MOVE_AT + MOVE - 0.04, 2), 'gain': 0.45},
            {'src': 'v3/phone_like_pop.wav', 't': 2.7, 'gain': 0.3}],
    'shots': [{
        'id': 'SC1', 's': 0, 'e': DUR, 'scale': True,
        'note': 'SHOWCASE · HOME BASE -> S5 PULL-BACK CRANE (one ease)\nYour lamp to the whole city; the lit window stays the anchor',
        'transition': {'type': 'cut'},
        'camera': {'from': {'x': 540, 'y': 960, 'z': 1.0}, 'to': {'x': 540, 'y': 960, 'z': 1.0}, 'word': 'PULL-BACK CRANE'},
        'els': els,
        'moves': moves,
    }],
}

# frame 0 is the scene being drawn: lines on over the first 0.28 s, tones flooding at 0.3 (playbook, The opening)
for i, el in enumerate(data['shots'][0]['els']):
    if 'in' not in el:
        el['draw'] = [round(0.02 * (i % 6), 2), 0.26]
        if el.get('fill'):
            el['fillIn'] = round(0.28 + 0.015 * (i % 5), 3)

with open(OUT, 'w') as f:
    json.dump(data, f, indent=1)
print(f'wrote {OUT}: {len(els)} elements, {len(moves)} moves; swap {T_SWAP:.2f}s, ridge {T_RIDGE:.2f}-{T_LAND:.2f}s, land {MOVE_AT + MOVE:.2f}s')
