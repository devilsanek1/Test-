"""build_proposal_pullback.py: the S5 pull-back proposal for v3 (docs/v3/proposal_pullback.md).

Copies the locked board (public/v3/animatic.json) to public/v3/proposal_pullback.json and replaces S9 + S9b
(19.40-22.68) with ONE panel: the S5 pull-back crane (CINEMATIC_GUIDE S5, the owner's favourite, Arcane #55's shape at
3.5x its speed). Every other panel, word and cue stays identical, so the proposal plays in context (composition
AnimaticProposal in src/entry-v3.tsx).

The move is element moves on ONE ease, cubic-bezier(0.55, 0.03, 0.50, 1.0), 19.40-21.98 (155 f at 60 fps), then a hold
to 22.68 (42 f). Each plane is a scale move (SketchReel moves[].s / o / lin): far, mid and deck are geometric with the
plane's pivot moving on a straight line; the clutter (stack, vent) goes from its start box to its end box on straight
lines; the chimney pot is its own linear crossing. Elements are designed in END-frame coordinates (except the close
"you", drawn at its start size) and authored at their START positions.

  python3 scripts/v3/build_proposal_pullback.py && python3 scripts/v3/board_lint.py public/v3/proposal_pullback.json
"""
import copy
import json
import math
import os
import random

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..')
SRC = os.path.join(ROOT, 'public', 'v3', 'animatic.json')
OUT = os.path.join(ROOT, 'public', 'v3', 'proposal_pullback.json')

S, E = 19.40, 22.68           # the panel: cut in on "And", out on "They"
DUR = round(E - S, 2)
MOVE = 155 / 60               # 19.40-21.98, then the hold (42 f at 60 fps)
EASE = [0.55, 0.03, 0.50, 1.0]
SWAP = 1.30                   # 20.70: the close "you" hands over to tiny you behind the pot
LAND_IN = 1.37                # 20.77: the hall + mountain + sign come in, still behind the stack and the pot


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


def p_at(t):
    """the move's progress p at t s after the panel start"""
    return EASE_F(min(1.0, max(0.0, t / MOVE)))


# ---- the planes (end coords -> start coords) ----------------------------------------------------------------------
FAR_O, FAR_OFF, FAR_K = (540, 880), (1080, 0), 1.11      # far: 1 W slide from the right, scale 1.11 -> 1, horizon held
MID_O, MID_OFF, MID_K = (480, 1000), (920, -300), 2.0     # mid: from 920 right and 300 higher, x0.5
DECK_O, DECK_K = (480, 1430), 5.0                          # deck: pinned on its pivot, x0.2, no sideways move


def plane(o, off, k):
    os_ = (o[0] + off[0], o[1] + off[1])
    to_start = lambda x, y: (os_[0] + k * (x - o[0]), os_[1] + k * (y - o[1]))
    move = {'dx': -off[0], 'dy': -off[1], 's': round(1 / k, 6), 'o': [os_[0], os_[1]]}
    return to_start, move


FAR, FAR_MV = plane(FAR_O, FAR_OFF, FAR_K)
MID, MID_MV = plane(MID_O, MID_OFF, MID_K)
DECK, DECK_MV = plane(DECK_O, (0, 0), DECK_K)


def box_move(start_tl, k, end_tl):
    """linear box move (every point on a straight line): start top-left -> end top-left, size x k"""
    return {'dx': end_tl[0] - start_tl[0], 'dy': end_tl[1] - start_tl[1], 's': round(k, 6), 'o': list(start_tl), 'lin': True}


R = lambda v: round(v, 1)


def pts_to(f, pts):
    return [[R(a) for a in f(x, y)] for x, y in pts]


def rect_to(f, k, x, y, w, h):
    x0, y0 = f(x, y)
    return {'x': R(x0), 'y': R(y0), 'w': R(w * k), 'h': R(h * k)}


# ---- the far town roofline (end coords): a hill town on the left (the only view out at the start), low roofs at the
# hall's foot so the whole hall shows, and a row of ~26 px houses in front of the mountain's foot (the ruler)
def roof_y(x):
    if x <= -250:
        return 860
    if x < 250:
        return 860 + (x + 250) / 500 * 135
    if x <= 640:
        return 1042
    return 992


def town_pts():
    rnd = random.Random(7)
    pts = [[-1300, 1300]]
    x = -1300
    while x < 1900:
        e = roof_y(x) + rnd.uniform(-5, 5)
        pts += [[x, R(e)], [x + 13, R(e - 13)]]
        x += 26
    pts += [[x, R(roof_y(x))], [x, 1300]]
    return pts


def mid_pts():
    pts = [[-900, 1760]]
    x = -900
    while x < 1700:
        if 860 <= x < 1080:  # the chimney stacks that frame the right (x 880-1080, tops >= 1050)
            # shafts with a cap and pots (flat notches read as a castle's battlements, v3 G3 cold read)
            pts += [[860, 1105], [892, 1105], [892, 1072], [886, 1072], [886, 1064], [898, 1064], [898, 1050], [910, 1050], [910, 1064],
                    [918, 1064], [918, 1050], [930, 1050], [930, 1064], [942, 1064], [942, 1072], [936, 1072], [936, 1105],
                    [990, 1105], [990, 1078], [984, 1078], [984, 1070], [1010, 1070], [1010, 1052], [1026, 1052], [1026, 1070],
                    [1056, 1070], [1056, 1078], [1050, 1078], [1050, 1105]]
            x = 1080
            continue
        pts += [[x, 1105], [x + 60, 1088]]
        x += 120
    pts += [[x, 1105], [x, 1760]]
    return pts


def far_screen(pe, t):
    """screen position at t of a far-plane point whose end-frame position is pe"""
    p = p_at(t)
    k = FAR_K ** (1 - p)
    return FAR_O[0] + (1 - p) * FAR_OFF[0] + k * (pe[0] - FAR_O[0]), FAR_O[1] + k * (pe[1] - FAR_O[1])


def stack_box(t):
    p = p_at(t)
    lerp = lambda a, b: a + (b - a) * p
    return lerp(600, -90), lerp(640, 980), lerp(1700, 250), lerp(2100, 1431)


def vent_right(t):
    p = p_at(t)
    return 240 + (150 - 240) * p, 780 + (1600 - 780) * p


# ---- the streams: three sticks, a new one every 0.2 s, each on a 0.6 s loop (far plane, end coords).
# Before the burst they rise from the roofs in the slot and streak right behind the stack's edge (where to?); after it,
# they rise from the town at the hall's foot and dive into its roof. Each loop resets while hidden (behind the stack,
# the town or the hall's wall), so one element makes many trips.
STICK_W = 46


def stick_trips(phase):
    trips = []
    tk = phase
    side = 0
    while tk < DUR:
        if tk < 0.85:
            # creep: start just left of the stack's edge, inside the opening
            sl, st, _, _ = stack_box(tk)
            vr, vt = vent_right(tk)
            left = vr if vt < 900 else 0
            target_sx = max(left + 50, sl - 230)
            p = p_at(tk)
            kk = FAR_K ** (1 - p)
            xe = FAR_O[0] + (target_sx - FAR_O[0] - (1 - p) * FAR_OFF[0]) / kk
            ry = roof_y(xe)
            # rise out of the roofs, streak right, dip behind the stack's edge (below its top, which drops with the move)
            path = [(0.0, xe, ry + 18), (0.14, xe + 6, ry - 48), (0.40, xe + 420, ry - 60), (0.50, xe + 560, ry - 15)]
        else:
            # pour: from the town at the hall's foot, over and into the hall's roof
            if side % 3 == 2:
                xo = 790
                path = [(0.0, xo, roof_y(xo) + 18), (0.15, xo + 6, roof_y(xo) - 44), (0.36, 520, 842), (0.48, 490, 950)]
            else:
                xo = 262 + 18 * (side % 2)
                path = [(0.0, xo, roof_y(xo) + 18), (0.15, xo + 8, roof_y(xo) - 46), (0.36, 400, 842), (0.48, 430, 950)]
            side += 1
        trips.append((tk, path))
        tk += 0.6
    return trips


def stick_element(idx, phase):
    """one ram icon (far plane): its flight moves (start-plane units) first, then the far plane's move"""
    trips = stick_trips(phase)
    x0e, y0e = trips[0][1][0][1], trips[0][1][0][2]
    sx, sy = FAR(x0e, y0e)
    el = {'t': 'icon', 'name': 'ram', 'x': R(sx), 'y': R(sy), 'w': R(STICK_W * FAR_K), 'role': 'mid', 'fill': 'light', 'sw': 3}
    moves = []
    cur = (x0e, y0e)
    report = []
    for n, (tk, path) in enumerate(trips):
        if n > 0:
            # the reset: jump from where the last trip ended to this trip's start (hidden)
            moves.append({'el': idx, 'dx': R((path[0][1] - cur[0]) * FAR_K), 'dy': R((path[0][2] - cur[1]) * FAR_K),
                          'at': round(tk - 0.01, 3), 'dur': 0.01, 'ease': 'linear'})
            cur = (path[0][1], path[0][2])
        for (ta, xa, ya), (tb, xb, yb) in zip(path, path[1:]):
            if tk + ta >= DUR:
                break
            moves.append({'el': idx, 'dx': R((xb - xa) * FAR_K), 'dy': R((yb - ya) * FAR_K), 'at': round(tk + ta, 3),
                          'dur': round(tb - ta, 3), 'ease': 'linear'})
            cur = (xb, yb)
        end_t = tk + path[-1][0]
        report.append((round(tk, 2), [round(v) for v in far_screen(cur, min(end_t, DUR))]))
    moves.append({'el': idx, 'at': 0, 'dur': round(MOVE, 4), 'ease': EASE, **FAR_MV})
    return el, moves, report


def build_panel():
    els, moves = [], []

    def add(el, mv=None):
        els.append(el)
        i = len(els) - 1
        for m in ([mv] if isinstance(mv, dict) else mv or []):
            moves.append({'el': i, **m})
        return i

    plane_mv = lambda mv: {'at': 0, 'dur': round(MOVE, 4), 'ease': EASE, **mv}

    # sky: flat, locked (light, so the opening and the far band are the lightest things; captions sit on it)
    add({'t': 'rect', 'x': -40, 'y': -40, 'w': 1160, 'h': 1000, 'role': 'far', 'fill': 'light'})
    # FAR PLANE: the pale band (haze from the horizon down, paper)
    add({'t': 'rect', **rect_to(FAR, FAR_K, -1700, 800, 3400, 500), 'role': 'far', 'fill': 'paper', 'sw': 0}, plane_mv(FAR_MV))
    # the mountain of memory sticks (a pile pre-scaled to 0.555 so its sticks are ~65 px at the end): foot (420, 1030),
    # summit (840, 626), running on past the right edge
    pre = 0.555
    mx, my = FAR(420, 626)
    add({'t': 'icon', 'name': 'pile', 'x': R(mx), 'y': R(my), 'w': R(840 * FAR_K / pre), 'h': R(404 * FAR_K / pre),
         'role': 'subject', 'fill': 'light', 'in': LAND_IN},
        [{'dx': 0, 'dy': 0, 'at': -1, 'dur': 0.5, 's': pre, 'o': [R(mx), R(my)], 'ease': 'linear'}, plane_mv(FAR_MV)])
    # the streams (in front of the mountain, behind the hall and the town)
    reports = []
    for k, phase in enumerate((0.0, 0.2, 0.4)):
        el, mv, rep = stick_element(len(els), phase)
        els.append(el)
        moves.extend(mv)
        reports.append(rep)
    # the hall in front of the mountain's foot (the subject: the only dark mass at the end; O1's dark body + blank sign strip)
    add({'t': 'icon', 'name': 'datacenter', **rect_to(FAR, FAR_K, 300, 880, 320, 150), 'role': 'subject', 'fill': 'dark', 'text': ' ',
         'in': LAND_IN},
        plane_mv(FAR_MV))
    # its sign, as letters on the roof line (a 320 px hall's own sign box would be 20 px text)
    lx, ly = FAR(450, 860)
    add({'t': 'text', 'x': R(lx), 'y': R(ly), 'text': 'AI DATA CENTER', 'size': R(48 * FAR_K), 'role': 'subject', 'in': LAND_IN},
        plane_mv(FAR_MV))
    # the far town: ~26 px houses (the ruler; paper with far lines)
    add({'t': 'line', 'pts': pts_to(FAR, town_pts()), 'closed': True, 'role': 'far', 'fill': 'paper', 'sw': 3}, plane_mv(FAR_MV))

    # MID PLANE: the roofs (a shaded mass with gables and the right chimney stacks) and one lit street to the hall
    add({'t': 'line', 'pts': pts_to(MID, mid_pts()), 'closed': True, 'role': 'mid', 'fill': 'mid'}, plane_mv(MID_MV))
    add({'t': 'line', 'pts': pts_to(MID, [[405, 1432], [575, 1432], [471, 1104], [451, 1104]]), 'closed': True, 'role': 'mid',
         'fill': 'paper', 'sw': 3}, plane_mv(MID_MV))

    # CLUTTER: the brick stack (where the hall and mountain will land; then the left frame), start box -> end box
    stack = [[600, 700], [600, 652], [612, 640], [1700, 640], [1700, 2100], [626, 2100], [626, 700]]
    add({'t': 'line', 'pts': stack, 'closed': True, 'role': 'mid', 'fill': 'mid'},
        plane_mv(box_move((600, 640), 340 / 1100, (-90, 980))))

    # DECK (OUR ROOF): the deck, its lines converging on you, the parapet's face and its snow lip
    add({'t': 'rect', **rect_to(DECK, DECK_K, -200, 1440, 1480, 320), 'role': 'mid', 'fill': 'light'}, plane_mv(DECK_MV))
    fan = []
    for xb in (-330, 40, 330, 650, 940, 1310):
        fan += [[xb, 1700], [490, 1476]]
    add({'t': 'line', 'pts': pts_to(DECK, fan[:-1]), 'role': 'mid', 'sw': 3}, plane_mv(DECK_MV))
    add({'t': 'rect', **rect_to(DECK, DECK_K, -200, 1415, 1480, 25), 'role': 'mid', 'fill': 'mid'}, plane_mv(DECK_MV))
    add({'t': 'rect', **rect_to(DECK, DECK_K, -200, 1400, 1480, 15), 'role': 'mid', 'fill': 'paper'}, plane_mv(DECK_MV))

    # the vent on our roof (near clutter, in front of the deck): left frame at the start, bottom-left at the end
    vent = [[-260, 850], [-240, 802], [-10, 780], [220, 802], [240, 850], [190, 850], [190, 1850], [-210, 1850], [-210, 850]]
    add({'t': 'line', 'pts': vent, 'closed': True, 'role': 'mid', 'fill': 'mid'}, plane_mv(box_move((-260, 780), 0.3, (0, 1600))))

    # YOU, close (start coords; deck plane): back view 3/4, head turned right (hair and the ear side only, no face), cut at
    # the hips, raising your one stick (S8's drawing) against the stack; hands over to tiny you behind the pot
    torso = [[430, 1228], [515, 1228], [570, 1242], [628, 1266], [668, 1302], [712, 1350], [752, 1404], [772, 1380], [778, 1300],
             [776, 1236], [722, 1236], [722, 1318], [716, 1360], [652, 1404], [644, 1520], [648, 1760], [214, 1760], [200, 1540],
             [206, 1400], [232, 1322], [286, 1272], [350, 1242]]
    add({'t': 'line', 'pts': torso, 'closed': True, 'role': 'subject', 'fill': 'dark', 'out': SWAP}, plane_mv(DECK_MV))
    add({'t': 'ellipse', 'cx': 470, 'cy': 1150, 'rx': 88, 'ry': 92, 'role': 'subject', 'fill': 'paper', 'out': SWAP}, plane_mv(DECK_MV))
    hair = []
    for a in range(-58, -262, -12):
        r = math.radians(a)
        hair.append([R(470 + 97 * math.cos(r)), R(1148 + 99 * math.sin(r))])
    hair += [[462, 1244], [500, 1226], [522, 1186], [526, 1140], [520, 1090]]
    add({'t': 'line', 'pts': hair, 'closed': True, 'role': 'subject', 'fill': 'dark', 'out': SWAP}, plane_mv(DECK_MV))
    add({'t': 'icon', 'name': 'ram', 'x': 620, 'y': 1166, 'w': 262, 'role': 'subject', 'fill': 'light', 'out': SWAP}, plane_mv(DECK_MV))
    add({'t': 'ellipse', 'cx': 749, 'cy': 1214, 'rx': 30, 'ry': 32, 'role': 'subject', 'fill': 'paper', 'out': SWAP}, plane_mv(DECK_MV))

    # YOU, tiny (end coords: h 180, x ~420-560, feet y 1490), back to us at the parapet, your stick held up (~50 px)
    fx, fy = DECK(490, 1490)
    add({'t': 'figure', 'x': R(fx), 'y': R(fy), 'h': 180 * DECK_K, 'pose': 'reach', 'facing': 'r', 'role': 'mid', 'fill': 'dark',
         'in': SWAP}, plane_mv(DECK_MV))
    sx, sy = DECK(531, 1297)
    add({'t': 'icon', 'name': 'ram', 'x': R(sx), 'y': R(sy), 'w': 52 * DECK_K, 'role': 'mid', 'fill': 'paper', 'in': SWAP},
        plane_mv(DECK_MV))

    # the chimney pot: its own crossing at peak speed (90 px/f at 60 fps), a flat mass that hides the hand-over
    # (it covers you 20.67-20.83; its trailing edge is the light burst)
    v = 90 * 60
    t_in = 1.0
    left = 480 - 600 + v * (t_in - 1.35)
    pot = [[0, 2000], [0, 760], [70, 700], [1130, 700], [1200, 760], [1200, 2000]]
    add({'t': 'line', 'pts': [[R(left + x), y] for x, y in pot], 'closed': True, 'role': 'mid', 'fill': 'mid', 'in': t_in, 'out': 1.62},
        {'dx': R(v * 0.6), 'dy': 0, 'at': t_in, 'dur': 0.6, 'ease': 'linear'})

    panel = {
        'id': 'S9', 's': S, 'e': E,
        'note': "SCALE: S5 PULL-BACK CRANE (the one big move) · CUT\nYour one stick vs their mountain of memory",
        'scale': True,
        'transition': {'type': 'cut', 'label': "on 'And'"},
        'camera': {'from': {'x': 540, 'y': 960, 'z': 1}, 'to': {'x': 540, 'y': 960, 'z': 1}, 'word': 'PULL-BACK CRANE'},
        'els': els,
        'moves': moves,
    }
    return panel, reports


def main():
    with open(SRC) as f:
        data = json.load(f)
    out = copy.deepcopy(data)
    panel, reports = build_panel()
    shots = [s for s in out['shots'] if s['id'] not in ('S9', 'S9b')]
    k = next(i for i, s in enumerate(shots) if s['id'] == 'S10')
    shots.insert(k, panel)
    out['shots'] = shots
    out['label'] = 'v3 G3 proposal: S5 pull-back (S9 + S9b)'
    # sound: one swell peaking with the burst (20.83), a low hit on "mountain" (21.72); the voice is unchanged
    out['sfx'] = data['sfx'] + [{'src': 'v3/v3_pullback_swell.wav', 't': 19.95, 'gain': 0.5},
                                {'src': 'v3/v3_thoom.wav', 't': 21.72, 'gain': 0.5}]
    with open(OUT, 'w') as f:
        json.dump(out, f, indent=1)
        f.write('\n')
    print(f'wrote {os.path.relpath(OUT, ROOT)}: S9 = {len(panel["els"])} elements, {len(panel["moves"])} moves')
    for t in (0.0, 0.65, 1.2, 1.3, 1.43, 1.6, 1.7, 1.92, 2.28, 2.47, MOVE):
        print(f'  t {S + t:5.2f}  p {p_at(t):.3f}  stack x {stack_box(t)[0]:6.0f}-{stack_box(t)[2]:5.0f}  summit {[round(v) for v in far_screen((840, 626), t)]}')
    for n, rep in enumerate(reports):
        print(f'  stick {n}: loop ends (start t, screen at reset) {rep}')


if __name__ == '__main__':
    main()
