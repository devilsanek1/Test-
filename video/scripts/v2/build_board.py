"""Build video 2's G3 board animatic (SketchReel board mode) -> public/v2/animatic.json.

  python3 scripts/v2/build_board.py && python3 scripts/v3/board_lint.py public/v2/animatic.json

Concept: "the line that never ends" (contract lens), with the judges' grafts: a high 3/4 desk (the page visibly pours
over the desk edge), the eye-level nook as the home base, backlit anonymous staff with NAME WITHHELD, a hard cut out of
her room (never through her window) to the one S1 rise-over onto the Pentagon, the full oversight clause held through
the veto beat, Google's page on its own neutral panel, and her own voice (a speech bubble) for the turn.
Panels and reasons: docs/v2/storyboard_g3.md. World coords = each shot's end frame (camera.to).

Words come from public/v2/voice_words.json with two caption fixes: the merged token "can'tveto" is split (can't
26.36-26.70, veto 26.70-27.08), and the quoted spans get quote marks (her quote in BBC spelling, "criticising")."""
import copy
import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
VW = json.load(open(os.path.join(ROOT, 'public', 'v2', 'voice_words.json')))
DST = os.path.join(ROOT, 'public', 'v2', 'animatic.json')

NODRAW = [99, 0.01]   # fill-only shape: its stroke never draws
NEVER = 99            # a fillIn that never arrives (bare lines)
DUR = 39.5            # voice 39.08 s + 0.42 s of room tone for the loop
BBC = 'Source: BBC News, 21 Oct 2026'


def r2(x):
    return round(x, 2)


def cam(x=540, y=960, z=1.0, x2=None, y2=None, z2=None, **kw):
    c = {'from': {'x': x, 'y': y, 'z': z}, 'to': {'x': x if x2 is None else x2, 'y': y if y2 is None else y2, 'z': z if z2 is None else z2}}
    c.update(kw)
    return c


def shot(id_, s, e, note, tr_label, els, camera=None, moves=None, tr='cut', dur=None, credit=None):
    t = {'type': tr, 'label': tr_label}
    if dur:
        t['dur'] = dur
    out = {'id': id_, 's': s, 'e': e, 'note': note, 'transition': t, 'camera': camera or cam(), 'els': els}
    if moves:
        out['moves'] = moves
    if credit:
        out['credit'] = credit
    return out


def icon(name, x, y, w, h=None, role='mid', **kw):
    e = {'t': 'icon', 'name': name, 'x': x, 'y': y, 'w': w, 'role': role}
    if h is not None:
        e['h'] = h
    e.update(kw)
    return e


def rect(x, y, w, h, fill=None, role='mid', **kw):
    e = {'t': 'rect', 'x': x, 'y': y, 'w': w, 'h': h, 'role': role}
    if fill:
        e['fill'] = fill
    e.update(kw)
    return e


def line(pts, role='mid', **kw):
    e = {'t': 'line', 'pts': pts, 'role': role}
    e.update(kw)
    return e


def ell(cx, cy, rx, ry, fill=None, role='mid', **kw):
    e = {'t': 'ellipse', 'cx': cx, 'cy': cy, 'rx': rx, 'ry': ry, 'role': role}
    if fill:
        e['fill'] = fill
    e.update(kw)
    return e


def fig(x, y, h, pose='sit', facing='r', role='subject', **kw):
    e = {'t': 'figure', 'x': x, 'y': y, 'h': h, 'pose': pose, 'facing': facing, 'role': role}
    e.update(kw)
    return e


def head_of(x, y, h, facing='r'):
    """the centre and radius of a seated figure's head (POSES.sit.H in SketchReel.tsx)"""
    s = -1 if facing == 'l' else 1
    return x + s * 0.04 * h, y - 0.755 * h, 0.09 * h


def squiggles(v0, v1, n, width=0.84):
    return '\n'.join(f'{r2(v0 + (v1 - v0) * i / max(1, n - 1))}|~|{width if i % 3 else width - 0.06}' for i in range(n))


def steps(el, total, t0, n, gap, dur=0.06, accel=False):
    """el moves down by `total` in n short steps from t0 (paper stepping out); accel = growing steps (pouring)"""
    w = [1 + (k if accel else 0) for k in range(n)]
    return [{'el': el, 'dx': 0, 'dy': r2(total * wk / sum(w)), 'at': r2(t0 + k * gap), 'dur': dur if not accel else r2(gap)} for k, wk in enumerate(w)]


# ===================================================================== her desk (O1, P12, LOOP): high 3/4 insert
PAGE = dict(x=340, y=700, w=400, h=470)                  # her job contract
CLAUSE_Y = 1003                                          # v 0.645
TXT_L, TXT_R = 377, 703
HL_X = 712                                               # the running line's x (the page's right margin)
DESK_EDGE = 1390
PAGE_TEXT = '\n'.join(['0.09|#56|JOB CONTRACT', squiggles(0.22, 0.54, 5), '0.645|~|0.86', '0.86|-|0.5'])
SIGNATURE = [[382, 1096], [396, 1072], [410, 1094], [404, 1102], [428, 1080], [446, 1098], [466, 1076], [478, 1096], [506, 1086], [540, 1090]]
FLAT = dict(x=344, w=392, h=220)                          # the tail on the desk (1170 -> the desk edge)
HANG_H = 710                                              # the tail over the desk edge


def desk_base(frame0=True):
    """the desk, shelf corner, lamp pool, box and mug (frame-0 draw-on and tone flood when frame0)"""
    d = (lambda a, b: {'draw': [a, b]}) if frame0 else (lambda a, b: {})
    f = (lambda t: {'fillIn': t}) if frame0 else (lambda t: {})
    # frame 0 is already 55-75 % drawn, so the LOOP tail (0.42 s earlier in the same draw-on) reads as the scene
    front = rect(-40, DESK_EDGE, 1160, 80, 'mid', **d(-0.35, 0.5), **f(0.08))
    top = rect(-40, 640, 1160, DESK_EDGE - 640, 'light', **d(-0.4, 0.55), **f(0.05))
    shelf = icon('bookshelf', -100, 630, 220, 560, **d(-0.4, 0.6), **f(0.2))
    pool = ell(540, 950, 400, 290, 'paper', draw=NODRAW, **f(0.12))
    box = icon('box', 140, 700, 170, **d(-0.35, 0.5), **f(0.18))
    mug = icon('mug', 800, 690, 90, **d(-0.3, 0.45), **f(0.25))
    return front, top, shelf, pool, box, mug


def page_el(frame0=True):
    e = icon('page', role='subject', text=PAGE_TEXT, **PAGE)
    if frame0:
        e.update(draw=[-0.45, 0.6], fillIn=0.03)
    return e


def hang_text(h):
    return squiggles(0.03, 0.97, max(4, int(h / 40)), 0.8)


# ===================================================================== O1: the opening (0-6.12, one continuous shot)
def opening():
    els, moves = [], []

    def add(e):
        els.append(e)
        return len(els) - 1
    front, top, shelf, pool, box, mug = desk_base()
    add(front)
    hang = add(icon('page', 340, DESK_EDGE - HANG_H, 400, HANG_H, sw=9, text=hang_text(HANG_H), **{'in': 4.84}))
    hang_hl = add(line([[HL_X, DESK_EDGE - HANG_H], [HL_X, DESK_EDGE]], sw=22, **{'in': 4.84}))
    for e in (top, shelf, pool, box, mug):
        add(e)
    flat = add(icon('page', FLAT['x'], 1170 - FLAT['h'], FLAT['w'], FLAT['h'], sw=9, text=squiggles(0.1, 0.95, 6, 0.8), **{'in': 3.48}))
    flat_hl = add(line([[HL_X, 1170 - FLAT['h']], [HL_X, 1170]], sw=22, **{'in': 3.48}))
    add(page_el())
    add(line(SIGNATURE, sw=5, draw=[-0.05, 0.30]))
    add(line([[TXT_L, CLAUSE_Y], [TXT_R, CLAUSE_Y]], role='subject', sw=24, draw=[2.60, 0.88]))
    add(line([[TXT_R, CLAUSE_Y], [HL_X, CLAUSE_Y + 13], [HL_X, 1170]], role='subject', sw=22, draw=[3.48, 0.25]))
    # 'She quit Google.': her sleeve brings her work badge in from the left and drops it into the box (clack 0.92)
    badge = add(icon('badge', 180 - 560, 626, 100, text='GOOGLE'))
    sleeve = add(line([[-820, 616], [-348, 618], [-348, 666], [-820, 688]], closed=True, fill='mid'))
    hand = add(ell(-330, 636, 26, 26, 'paper'))
    for i in (badge, sleeve, hand):
        moves.append({'el': i, 'dx': 560, 'dy': 0, 'at': 0.40, 'dur': 0.40})
        moves.append({'el': i, 'dx': 0, 'dy': 24, 'at': 0.84, 'dur': 0.08})
    for i in (sleeve, hand):
        moves.append({'el': i, 'dx': -620, 'dy': 0, 'at': 1.00, 'dur': 0.40})
    moves.append({'el': badge, 'dx': 0, 'dy': 6, 'at': 1.50, 'dur': 0.2})      # the lanyard settles
    # 'her CONTRACT': a marker touches the clause line (2.20), sweeps it, wraps down the margin, then lifts off while
    # the line keeps running by itself
    mk = add(icon('marker', TXT_L, CLAUSE_Y - 150, 150, 150, **{'in': 2.20, 'out': 4.10}))
    for k in range(6):
        moves.append({'el': mk, 'dx': r2((TXT_R - TXT_L) / 6), 'dy': 0, 'at': r2(2.60 + k * 0.88 / 6), 'dur': r2(0.88 / 6)})
    moves.append({'el': mk, 'dx': HL_X - TXT_R, 'dy': 1170 - CLAUSE_Y, 'at': 3.48, 'dur': 0.25})
    moves.append({'el': mk, 'dx': 300, 'dy': -150, 'at': 3.80, 'dur': 0.30})
    # the page outgrows its own edge in short steps (3.48-4.84), then pours over the desk edge, faster and faster
    for i in (flat, flat_hl):
        moves += steps(i, FLAT['h'], 3.48, 9, 0.15)
    for i in (hang, hang_hl):
        moves += steps(i, HANG_H, 4.84, 8, 0.16, accel=True)
    camera = cam(540, 960, 1.06, z2=1.0, ease='inQuad')
    return els, moves, camera


o1_els, o1_moves, o1_cam = opening()


# ===================================================================== the nook (P2 wide, P4/P13 medium, P6 closer)
def nook_contract(x0, y_top, hang_to, role='mid', w=180, tail_w=66, lines=False):
    """her contract on the desk with its tail over the desk's front and down (the running line); a narrow tail is a
    plain strip (squiggles on a narrow strip read as a ladder)"""
    tx = x0 + w - tail_w - 4
    return [
        line([[x0, y_top], [x0 + w, y_top], [x0 + w + 8, y_top + 14], [x0 - 8, y_top + 14]], role=role, closed=True, fill='paper'),
        icon('page', r2(tx), y_top + 14, tail_w, hang_to - y_top - 14, role=role, sw=5 if role == 'mid' else None,
             text=hang_text(hang_to - y_top) if lines else ''),
        line([[r2(tx + tail_w - 16), y_top + 14], [r2(tx + tail_w - 16), hang_to]], role=role, sw=20 if tail_w > 90 else 12),
    ]


def clean(e):
    return {k: v for k, v in e.items() if v is not None}


p2_els = [clean(e) for e in [
    icon('bookshelf', -80, 640, 300, 1060),                                          # shelf cut by the left edge
    icon('window', 560, 650, 400, 470),                                              # the one opening
    rect(380, 1280, 740, 70, 'light'),                                               # desk
    line([[420, 1350], [420, 1600]]), line([[1040, 1350], [1040, 1600]]),
    line([[-40, 1600], [1120, 1600]], role='far'),                                   # floor
    icon('lamp', 800, 1071, 190),
    icon('mug', 720, 1214, 60),
    line([[322, 1150], [322, 1600]]), line([[322, 1402], [452, 1402], [452, 1600]]),  # chair
    fig(400, 1600, 600),                                                             # her, 3/4 back, facing the window
    *nook_contract(470, 1284, 1514, role='subject', w=230, tail_w=110),
    *[line([[x0, 1600 - 22 * k], [x0 + 170, 1600 - 22 * k], [x0 + 160, 1578 - 22 * k], [x0 - 10, 1578 - 22 * k]], role='subject',
           closed=True, fill='paper') for k, x0 in enumerate((560, 580, 556, 584))],  # the tail folded up on the floor
]]


def nook_medium(bubble_in=None, bubble=None, extra=()):
    els = [
        icon('bookshelf', -80, 640, 260, 1060),
        icon('window', 600, 650, 400, 460),
        rect(330, 1330, 790, 80, 'light'),                                           # desk
        icon('lamp', 820, 1121, 190),
        icon('mug', 730, 1268, 56),
        line([[280, 1180], [280, 1700]]), line([[280, 1429], [400, 1429]]),          # chair
        fig(340, 1640, 640),                                                         # her (head at y ~1157)
        icon('mic', 480, 1160, 100),                                                 # the interview mic
        *nook_contract(560, 1334, 1690),
    ]
    if bubble:
        b = dict(bubble)
        if bubble_in is not None:
            b['in'] = bubble_in
        els.append(b)
    els += list(extra)
    return [clean(e) for e in els]


BUBBLE4 = icon('speech', 430, 660, 400, 264, pts=[[0.0, 1.7]])
p4_els = nook_medium(0.72, BUBBLE4)                                                 # pops on 'SHE' (13.96)

# P13: the same set-up; her bubble pops on 'talking', and on 'FACTS' its words become the stamped deal page
p13_els = nook_medium(1.12, dict(BUBBLE4, out=1.78), extra=[                      # (1.78: fully swapped on 'FACTS', 37.16)
    icon('speech', 430, 660, 400, 264, pts=[[0.0, 1.7]], text=' ', **{'in': 1.78}),
    icon('page', 560, 690, 140, 180, text='0.14|>30|DEAL\n' + squiggles(0.32, 0.62, 4, 0.8) + '\n0.84|@|0.45', **{'in': 1.78}),
    icon('stamp', 600, 760, 120, **{'in': 1.78}),
])
p13_cam = cam(540, 960, 1.0, x2=540, y2=980, z2=1.04, ease='out', start=35.32, end=38.60)

# ===================================================================== P3: staff told the BBC (backlit, anonymous)
hx, hy, hr = head_of(430, 1560, 600)
sx, sy, sr = head_of(760, 1520, 520, 'l')
p3_els = [
    rect(140, 650, 800, 600, 'light'),                                               # the bright window behind them
    fig(760, 1520, 520, facing='l', role='mid', fill='mid'),                         # a second staffer, half hidden
    ell(r2(sx), r2(sy), r2(sr), r2(sr), 'mid'),                                       # ... faceless
    fig(430, 1560, 600),                                                             # the staffer who spoke (silhouette)
    ell(r2(hx), r2(hy), r2(hr), r2(hr), 'dark', role='subject'),                     # backlit: no face
    icon('badge', 452, 1150, 66),                                                    # a staff badge on a lanyard
    rect(40, 1280, 1000, 260, 'light'),                                              # table top
    rect(40, 1540, 1000, 90, 'mid'),                                                 # table front
    icon('page', 330, 1320, 360, 190, text='0.14|#40|CONTRACT\n' + squiggles(0.36, 0.68, 3, 0.85) + '\n0.88|-|0.5'),
    line([[362, 1462], [600, 1462]], sw=5, draw=[3.84, 0.3], **{'in': 3.84}),       # 'contracts': an ordinary underline
    {'t': 'text', 'x': r2(hx), 'y': r2(hy - hr - 30), 'text': 'NAME WITHHELD', 'size': 52, 'role': 'mid'},
]

# ===================================================================== P5: over her shoulder, Google's AI
p5_els = [
    rect(-40, 980, 1160, 760, 'light'),                                              # desk top
    icon('lamp', 800, 771, 180),
    ell(560, 1190, 420, 170, 'paper', draw=NODRAW),                                  # lamp pool
    icon('laptop', 300, 760, 460, role='subject'),
    icon('nodes', 392, 786, 276, 160),                                               # the AI on her screen
    {'t': 'text', 'x': 530, 'y': 888, 'text': 'AI', 'size': 64, 'role': 'mid'},
    fig(110, 1600, 1100, role='mid', fill='mid'),                                    # her shoulder and head, close
]

# ===================================================================== P6: closer, she told the BBC she objected
p6_els = [clean(e) for e in [
    icon('bookshelf', -120, 640, 230, 1100),
    icon('window', 640, 650, 380, 470),
    rect(360, 1340, 760, 90, 'light'),
    line([[252, 1100], [252, 1700]]),
    fig(330, 1700, 760, face='worried'),
    icon('mic', 500, 1153, 110),
    *nook_contract(600, 1344, 1690),
    icon('speech', 440, 650, 420, 270, pts=[[0.0, 1.59]], **{'in': 0.16}),           # 'told'
]]

# ===================================================================== P7: in April, a deal (cold insert, the stamp)
SURFACE = rect(-40, 600, 1160, 1120, 'light', role='far')
DEAL_TEXT = '\n'.join(['0.08|>60|DEAL', squiggles(0.2, 0.6, 6, 0.86), '0.8|@|0.42', '0.91|@|0.42'])
p7_els = [
    SURFACE,
    icon('page', 320, 640, 440, 600, role='subject', text=DEAL_TEXT),
    icon('stamp', 520, 650, 240, 91, role='subject', text='APRIL 2026', **{'in': 0.24}),
]
p7_moves = [{'el': 2, 'dx': 0, 'dy': 18, 'at': 0.24, 'dur': 0.06}]

# ===================================================================== P8: the rise over a low wall onto the Pentagon
LIFT = 850   # the landscape rises 850 px against the 600 px crane: the wall drops out, the Pentagon comes up over it
p8_land = [
    rect(-40, 760, 1160, 1300, 'light', role='far'),                                 # the ground to the horizon
    rect(-40, 760, 1160, 26, 'mid', role='far'),                                     # far tree line
    line([[-40, 1010], [330, 1020]], role='far'), line([[750, 1020], [1120, 1000]], role='far'),
    line([[540, 1150], [540, 1350]], role='far'),
    icon('lot', 40, 1060, 270),
    icon('lot', 770, 1060, 270),
    icon('lot', 380, 1250, 320),
    icon('pentagon', 310, 860, 460, role='subject'),
]
for e in p8_land:
    if e['t'] == 'line':
        e['pts'] = [[x, y + LIFT] for x, y in e['pts']]
    else:
        e['y'] = e['y'] + LIFT
p8_els = p8_land + [icon('stonewall', -60, 1700, 1200, 700)]
p8_moves = [{'el': i, 'dx': 0, 'dy': -LIFT, 'at': 0, 'dur': 1.53} for i in range(len(p8_land))]
p8_cam = cam(540, 1560, 1.0, y2=960, ease='inout', start=21.32, end=22.85)

# ===================================================================== P9 / P10: the clause, held; then NO VETO
PHRASE = ['for any lawful', 'government purpose']
CLAUSE = ['should not be used', 'for domestic mass', 'surveillance or', 'autonomous weapons', '(including target',
          'selection) without', 'appropriate human', 'oversight and control']
DP = dict(x=320, y=640, w=440, h=615)


def deal_text():
    """the phrase (50 px) and the full clause (48 px) under it, on narrower side margins"""
    rows, y = ['0|m|0.05'], 90
    for s_ in PHRASE:
        rows.append(f'{r2(y / DP["h"])}|>50|{s_}')
        y += 56
    y += 6
    for s_ in CLAUSE:
        rows.append(f'{r2(y / DP["h"])}|>48|{s_}')
        y += 52
    return '\n'.join(rows)


p9_els = [
    SURFACE,
    icon('page', role='subject', text=deal_text(), **DP),
    icon('stamp', 616, 610, 150, 56, text='APRIL 2026'),
]
p10_els = p9_els + [icon('stamp', 330, 605, 280, 80, role='subject', text='NO VETO', **{'in': 0.74})]
p10_moves = [{'el': 3, 'dx': 0, 'dy': 5, 'at': 0.74, 'dur': 0.05}]

# ===================================================================== P11: Google's side, its own panel
GP = dict(x=320, y=640, w=440, h=615)
G_TEXT = '\n'.join(['0|m|0.06', '0.1|#60|GOOGLE SAYS', '0.28|>52|it follows its', '0.37|>52|AI principles', '0.53|>52|bans retaliation',
                    '0.62|>52|"of any kind"', squiggles(0.78, 0.92, 3, 0.8)])
p11_els = [
    rect(334, 654, 440, 615, 'light', role='far'),                                   # its shadow on a plain ground
    icon('page', role='subject', text=G_TEXT, **GP),
    line([[360, 902], [640, 902]], sw=5, draw=[1.84, 0.3], **{'in': 1.84}),          # 'principles'
    line([[360, 1000], [700, 1000]], sw=5, draw=[2.56, 0.4], **{'in': 2.56}),         # 'bans'
]

# ===================================================================== P12: back on her contract, the line runs again
front, top, shelf, pool, box, mug = desk_base(frame0=False)
MORE = 170
p12_els = [front,
           icon('page', 340, DESK_EDGE - MORE, 400, HANG_H + MORE, sw=9, text=hang_text(HANG_H + MORE)),
           line([[HL_X, DESK_EDGE - MORE], [HL_X, DESK_EDGE + HANG_H]], sw=22),
           top, shelf, pool, box, mug,
           icon('page', FLAT['x'], 1170, FLAT['w'], FLAT['h'], sw=9, text=squiggles(0.1, 0.95, 6, 0.8)),
           line([[HL_X, 1170], [HL_X, DESK_EDGE]], sw=22),
           page_el(frame0=False),
           line(SIGNATURE, sw=5),
           line([[TXT_L, CLAUSE_Y], [TXT_R, CLAUSE_Y]], role='subject', sw=24),
           line([[TXT_R, CLAUSE_Y], [HL_X, CLAUSE_Y + 13], [HL_X, 1170]], role='subject', sw=22),
           icon('badge', 180, 656, 100, text='GOOGLE')]
p12_moves = []
for i in (1, 2):
    p12_moves += steps(i, MORE, 0.64, 5, 0.12, accel=True)

# ===================================================================== LOOP: back to frame 0's bare lines
LOOP_LEN = r2(DUR - 39.08)
loop_els = []
for e in o1_els:
    if 'draw' in e and e['draw'] != NODRAW and e.get('in') is None and e['draw'][0] < 0.5:
        c = copy.deepcopy(e)
        c['draw'] = [r2(c['draw'][0] + LOOP_LEN), c['draw'][1]]
        c['fillIn'] = NEVER
        c.pop('out', None)
        loop_els.append(c)
loop_cam = cam(540, 960, 1.06)

# ===================================================================== the reel
shots = [
    shot('O1', 0, 6.12, "COZY desk insert, high 3/4. Signed (chime), badge in the box, then her line runs off the page and pours off the desk",
         'frame 0; the loop lands here', o1_els, o1_cam, o1_moves),
    shot('P2', 6.12, 8.36, "COZY nook, wide, eye level: the home base. One odd contract: hers, its tail heaped on the floor", "on 'You'd'", p2_els),
    shot('P3', 8.36, 13.24, 'PLAIN interview look: backlit, faceless staff; NAME WITHHELD; an ordinary underline on their contract',
         "on 'But'", p3_els, credit=BBC),
    shot('P4', 13.24, 15.0, 'COZY nook medium: so why is SHE talking? Her mic; her bubble pops on "talking"', "on 'So'", p4_els),
    shot('P5', 15.0, 16.6, 'COZY cut-in over her shoulder: she worked on Google\'s AI', "cut-in on 'She'", p5_els,
         credit='Sofia Liguori · research engineer, Google DeepMind'),
    shot('P6', 16.6, 20.52, 'COZY, closer: she told the BBC she objected (worried, speaking)', "on 'and'", p6_els, credit=BBC),
    shot('P7', 20.52, 21.32, 'PLAIN cold insert: a deal, stamped APRIL 2026 on "April". Out of her room (never through her window)',
         "hard cut on 'In'", p7_els, moves=p7_moves, credit='Source: Japan Times, 28 Apr 2026'),
    shot('P8', 21.32, 23.8, 'SCALE, the one big move (S1 rise-over): over a low wall onto the Pentagon; car lots for scale. No figures',
         "on 'that'", p8_els, p8_cam, p8_moves),
    shot('P9', 23.8, 25.96, "PLAIN insert (scale cut back in): the deal's words, with its oversight clause in full", "scale cut on 'for'",
         p9_els, credit=BBC),
    shot('P10', 25.96, 28.2, 'PLAIN insert, same frame: NO VETO stamped on "veto"; the clause stays readable', "on 'Google'", p10_els,
         moves=p10_moves, credit='Sources: BBC News, 21 Oct 2026 · Japan Times, 28 Apr 2026'),
    shot('P11', 28.2, 33.08, "PLAIN neutral: Google's own page, same size as hers; underlines read along", "on 'But'", p11_els,
         credit='Statement to the BBC, 21 Oct 2026'),
    shot('P12', 33.08, 35.32, "COZY desk insert, O1's end frame: she says she still can't; her line runs again", "on 'She'", p12_els,
         moves=p12_moves, credit=BBC),
    shot('P13', 35.32, 39.08, 'COZY nook medium, slow push: her own words; on "FACTS" her bubble holds the sourced deal page',
         "on 'But'", p13_els, p13_cam, credit=BBC),
    shot('LOOP', 39.08, DUR, "Back to frame 0's bare lines", 'to frame 0', loop_els, loop_cam, tr='dissolve', dur=0.12),
]

# ===================================================================== words (captions) and sound
words = []
for w in VW['words']:
    if w['w'] == "can'tveto":
        words += [{'w': "can't", 's': w['s'], 'e': 26.70}, {'w': 'veto', 's': 26.70, 'e': w['e']}]
        continue
    words.append(dict(w))
QUOTE = {(24.04, 'any'): '"any', (25.16, 'purpose.'): 'purpose".', (31.88, 'of'): '"of', (32.52, 'kind.'): 'kind".',
         (36.44, 'talking'): '"talking', (38.12, 'criticizing.'): 'criticising".'}
for w in words:
    k = (round(w['s'], 2), w['w'])
    if k in QUOTE:
        w['w'] = QUOTE.pop(k)
assert not QUOTE, QUOTE


def sfx(name, t, gain):
    return {'src': f'v2/v2_{name}.wav', 't': t, 'gain': gain}


SFX = [
    sfx('signed_chime', 0.08, 0.55),       # the first-second positive phone sound: her signature lands (E6 -> A6)
    sfx('badge_clack', 0.92, 0.5),         # 'Google.': the badge drops into the box
    sfx('marker_squeak', 2.60, 0.4),       # 'CONTRACT': the marker starts its line
    sfx('paper_unroll', 3.48, 0.4),        # the page steps out past its edge; ends dead at 4.84 ('for life': near silence)
    sfx('room_tone_2s', 6.12, 0.2),
    sfx('pencil_line', 12.20, 0.35),       # 'contracts': an ordinary underline
    sfx('room_tone_7s', 13.24, 0.2),
    sfx('like_pop', 14.28, 0.4),           # 'talking': HER bubble pops
    sfx('like_pop', 16.76, 0.3),           # 'told'
    sfx('cold_air', 20.52, 0.25),          # out of her room
    sfx('stamp_april', 20.76, 0.55),       # 'April'
    sfx('rise_swell', 21.32, 0.35),        # under the rise; no drums
    sfx('stamp_noveto', 26.70, 0.6),       # 'veto'
    sfx('paper_tap', 28.20, 0.4),          # Google's page: a neutral paper sound
    sfx('pencil_line', 30.04, 0.3),        # 'principles'
    sfx('pencil_line', 30.76, 0.3),        # 'bans'
    sfx('room_tone_6s', 33.08, 0.2),       # home again
    sfx('paper_unroll_short', 33.72, 0.35),  # "can't": her line runs again
    sfx('like_pop', 36.44, 0.4),           # 'talking'
    sfx('paper_tap', 37.16, 0.35),         # 'FACTS': the sourced page in her bubble
]

out = {'style': 'board', 'label': 'v2 G3 board', 'audio': 'v2/voice.wav', 'durationSec': DUR,
       'frame0': 'SHE SAYS: NO CRITICIZING GOOGLE. FOR LIFE.', 'frame0Until': 4.84, 'frame0Credit': BBC,
       'words': words, 'sfx': SFX, 'shots': shots}

# checks: the shots tile the film, every cut lands on a word start, every sfx file exists
assert shots[0]['s'] == 0 and abs(shots[-1]['e'] - DUR) < 1e-6
for a_, b_ in zip(shots, shots[1:]):
    assert abs(a_['e'] - b_['s']) < 1e-6, (a_['id'], b_['id'])
starts = {round(w['s'], 2) for w in words}
for s_ in shots[1:-1]:
    assert round(s_['s'], 2) in starts, ('cut not on a word', s_['id'], s_['s'])
for x in SFX:
    assert os.path.exists(os.path.join(ROOT, 'public', x['src'])), x['src']
json.dump(out, open(DST, 'w'), indent=1)
print('wrote', DST, len(shots), 'shots', [(s_['id'], len(s_['els'])) for s_ in shots])
