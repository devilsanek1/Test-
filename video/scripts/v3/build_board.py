"""Re-board v3's animatic in the storyboard house style (docs/look/STORYBOARD_STYLE.md).
World coords = the end frame (camera.to). Writes public/v3/animatic.json; keeps words, audio, sfx, frame0, frame0Until, durationSec."""
import json
import sys

SRC = sys.argv[1]
DST = sys.argv[2]
d = json.load(open(SRC))
NODRAW = [99, 0.01]   # fill-only shape: its stroke never draws
NEVER = 99            # fillIn that never arrives (bare lines)
HOLD = {'from': {'x': 540, 'y': 960, 'z': 1}, 'to': {'x': 540, 'y': 960, 'z': 1}}


def r2(x):
    return round(x, 2)


def shot(id_, s, e, note, tr_label, els, camera=None, moves=None, tr='cut', dur=None):
    t = {'type': tr, 'label': tr_label}
    if dur:
        t['dur'] = dur
    out = {'id': id_, 's': s, 'e': e, 'note': note, 'transition': t, 'camera': camera or json.loads(json.dumps(HOLD)), 'els': els}
    if moves:
        out['moves'] = moves
    return out


def icon(name, x, y, w, h=None, role='mid', **kw):
    e = {'t': 'icon', 'name': name, 'x': x, 'y': y, 'w': w, 'role': role}
    if h is not None:
        e['h'] = h
    e.update(kw)
    return e


ASPECT = {'datacenter': 0.7, 'house': 0.92, 'laptop': 0.7, 'phone': 2, 'cart': 0.82, 'truck': 0.58, 'ram': 0.3, 'pricetag': 0.6,
          'factory': 0.72, 'calendar': 1, 'pile': 0.58}

# ===================================================================== O1: the opening (0-5.8, one shot)
GROUND = 1040
DCS = [  # (in, w, h): the data center grows on each crane clunk, then slams up on 'pricier'
    (None, 270, 189), (1.88, 310, 240), (2.12, 350, 290), (2.30, 385, 340), (2.42, 415, 380), (2.60, 436, 420)]


def dc(k, role='subject', text='AI DATA CENTER'):
    _, w, h = DCS[k]
    return icon('datacenter', r2(540 - w / 2), GROUND - h, w, h, role=role, text=text)


HOUSES = [(130, 0.55), (280, 0.80), (690, 1.05), (840, 1.30)]  # (x, pop time): the expected little town fills in
PH = dict(x=380, y=1070, w=320)  # the phone (h 640)
PHONE_DROP = 140


def phone_els(t_old_strike=None, final=False):
    """the phone in your hand: a laptop listing, its price and the Add-to-cart button"""
    els = [
        icon('phone', PH['x'], PH['y'], PH['w']),
        {'t': 'rect', 'x': 414, 'y': 1112, 'w': 252, 'h': 560, 'fill': 'paper', 'role': 'mid', 'draw': NODRAW},
        icon('laptop', 440, 1145, 200),
    ]
    return els


def opening():
    els, moves = [], []

    def add(e):
        els.append(e)
        return len(els) - 1
    add({'t': 'line', 'pts': [[120, GROUND], [960, GROUND]], 'role': 'far', 'draw': [-0.25, 0.3]})
    for k, (x, t) in enumerate(HOUSES):
        e = icon('house', x, GROUND - 101, 110, role='far', **{'in': t})
        if k in (1, 2):
            e['out'] = 2.6   # swallowed by the data center
        add(e)
    # the data center (THE subject): house-sized first (expected), then it outgrows the town
    for k, (t, w, h) in enumerate(DCS):
        e = dc(k, text=' ' if k == 5 else 'AI DATA CENTER')
        if t is not None:
            e['in'] = t
        if k < 5:
            e['out'] = r2(DCS[k + 1][0] + 0.06)
        if k == 0:
            e['draw'] = [-0.2, 0.4]
            e['fillIn'] = 0.18
        add(e)
    add({'t': 'text', 'x': 540, 'y': 790, 'text': 'AI DATA CENTER', 'size': 56, 'role': 'mid', 'in': 2.6})
    # the phone in your hand
    p = phone_els()
    p[0].update(draw=[-0.3, 0.35], fillIn=0.09)
    p[1].update(fillIn=0.1)
    p[2].update(draw=[-0.15, 0.3], fillIn=0.13)
    phone_idx = [add(e) for e in p]
    phone_idx.append(add({'t': 'text', 'x': 540, 'y': 1365, 'text': '$999', 'size': 72, 'role': 'mid', 'in': 0.2, 'strike': 2.6}))
    phone_idx.append(add({'t': 'text', 'x': 540, 'y': 1450, 'text': '$1,099', 'size': 72, 'role': 'mid', 'in': 2.62}))
    add({'t': 'arrow', 'x1': 632, 'y1': 1305, 'x2': 632, 'y2': 1372, 'role': 'mid', 'in': 1.08, 'draw': [1.08, 0.25], 'out': 1.64})
    add({'t': 'arrow', 'x1': 632, 'y1': 1372, 'x2': 632, 'y2': 1305, 'role': 'mid', 'in': 1.64, 'out': 2.6})
    phone_idx.append(add({'t': 'rect', 'x': 430, 'y': 1488, 'w': 220, 'h': 90, 'fill': 'light', 'role': 'mid', 'draw': [-0.25, 0.3], 'fillIn': 0.05}))
    phone_idx.append(add(icon('cart', 502, 1502, 76, draw=[-0.1, 0.25], fillIn=0.07)))
    th = add({'t': 'line', 'closed': True, 'fill': 'light', 'role': 'mid', 'draw': [-0.4, 0.3], 'fillIn': 0.03,
              'pts': [[574, 1532], [598, 1514], [628, 1520], [650, 1546], [790, 1700], [700, 1720], [584, 1578], [568, 1552]]})
    moves += [{'el': th, 'dx': -4, 'dy': 8, 'at': 0.0, 'dur': 0.06}, {'el': th, 'dx': 4, 'dy': -8, 'at': 0.14, 'dur': 0.12}]
    # 'centers' (4.76, thoom): you lower the phone and look at the real thing
    moves += [{'el': i, 'dx': 0, 'dy': PHONE_DROP, 'at': 4.76, 'dur': 0.35} for i in phone_idx + [th]]
    cam = {'from': {'x': 540, 'y': 960, 'z': 1.04}, 'to': {'x': 540, 'y': 960, 'z': 1.0}, 'ease': 'inQuad'}
    return els, moves, cam


o1_els, o1_moves, o1_cam = opening()

# ===================================================================== the chart (S4, S6)
AXES = {'t': 'line', 'pts': [[260, 690], [260, 1180], [800, 1180]], 'role': 'mid'}
TITLE = {'t': 'text', 'x': 530, 'y': 655, 'text': 'US computer prices', 'size': 60, 'role': 'mid'}
OLD = [[290, 760], [372, 850], [454, 935], [536, 1010], [600, 1062], [618, 1040], [640, 1075], [700, 1110]]
HOOK = [[700, 1110], [712, 1086], [738, 978]]

s4_els = [AXES, TITLE,
          {'t': 'text', 'x': 300, 'y': 1248, 'text': '2005', 'size': 56, 'role': 'mid'},
          {'t': 'line', 'pts': OLD, 'role': 'subject', 'draw': [0.1, 2.3]}]
s6_els = [AXES, TITLE,
          {'t': 'line', 'pts': OLD, 'role': 'mid'},
          {'t': 'line', 'pts': HOOK, 'role': 'subject', 'draw': [1.44, 1.2]},
          {'t': 'text', 'x': 596, 'y': 966, 'text': '+9.7%', 'size': 120, 'role': 'subject', 'in': 3.36}]

# ===================================================================== S5: the joke
FIG5 = dict(t='figure', x=380, y=1420, h=560, pose='hold', facing='r', role='subject')
s5_els = [
    {'t': 'line', 'pts': [[150, 1420], [930, 1420]], 'role': 'far'},
    {'t': 'line', 'pts': [[520, 862], [790, 862]], 'role': 'mid'},                        # the shop shelf
    dict(FIG5, face='happy', out=0.72),
    dict(FIG5, face='shock', **{'in': 0.72}),
    icon('laptop', 420, 992, 220, role='subject'),                                        # yours, just bought
    icon('pricetag', 500, 1150, 150, text='$999'),
    icon('laptop', 548, 706, 220, **{'in': 0.72}),                                        # the newer one
    icon('pricetag', 610, 872, 150, text='$999', **{'in': 0.72}),
    {'t': 'text', 'x': 658, 'y': 692, 'text': 'NEW', 'size': 60, 'role': 'mid', 'in': 0.72},
]

# ===================================================================== S7: your laptop
s7_els = [
    {'t': 'line', 'pts': [[170, 1108], [910, 1108]], 'role': 'mid'},
    icon('laptop', 320, 800, 440, role='subject'),
]

# ===================================================================== S8: runs on memory chips (cut-in on 'memory')
s8_els = [
    {'t': 'line', 'pts': [[170, 1376], [910, 1376]], 'role': 'mid'},
    icon('laptop', 330, 1082, 420),
    icon('ram', 320, 1300, 440, role='subject'),
]
s8_moves = [{'el': 2, 'dx': 0, 'dy': -478, 'at': 0.0, 'dur': 0.4}]

# ===================================================================== S9: rise over our ledge: so do AI data centers
H9 = 1290
s9_els = [
    {'t': 'rect', 'x': -100, 'y': H9, 'w': 1280, 'h': 480, 'fill': 'light', 'role': 'far'},  # 0 the ground
    {'t': 'line', 'pts': [[120, H9], [960, H9]], 'role': 'far'},                           # 1 horizon
    icon('house', 140, H9 - 83, 90, role='far'),                                           # 2
    icon('house', 870, H9 - 83, 90, role='far'),                                           # 3
    {'t': 'rect', 'x': -40, 'y': H9 - 16, 'w': 400, 'h': 16, 'fill': 'light', 'role': 'mid'},  # 4 conveyor into its side
    icon('ram', 0, H9 - 46, 104),                                                          # 5-7 sticks ride in (behind the wall)
    icon('ram', 120, H9 - 46, 104),
    icon('ram', 240, H9 - 46, 104),
    icon('datacenter', 320, H9 - 308, 440, role='subject', text='AI DATA CENTER'),          # 8 THE subject
    {'t': 'rect', 'x': -20, 'y': 1690, 'w': 1120, 'h': 300, 'fill': 'light', 'role': 'mid'},  # 9 our roof ledge (drops out)
]
s9_moves = [{'el': i, 'dx': 220, 'dy': 0, 'at': 0.1, 'dur': 1.7} for i in (5, 6, 7)]
s9_cam = {'from': {'x': 540, 'y': 1200, 'z': 0.97}, 'to': {'x': 540, 'y': 960, 'z': 1.0}, 'ease': 'out', 'start': 19.4, 'end': 20.5, 'word': 'RISE'}

# ===================================================================== S9b: ... by the mountain (cut wide)
H9B = 1260
s9b_els = [
    {'t': 'rect', 'x': -100, 'y': H9B, 'w': 1280, 'h': 480, 'fill': 'light', 'role': 'far'},
    {'t': 'line', 'pts': [[120, H9B], [960, H9B]], 'role': 'far'},
    icon('house', 140, H9B - 51, 55, role='far'),
    icon('house', 880, H9B - 51, 55, role='far'),
    icon('pile', 310, 700, 460, 560, role='subject', fill='light'),                        # THE mountain of memory sticks
    icon('datacenter', 425, H9B - 161, 230, text='AI DATA CENTER'),                        # the data center at its foot
    {'t': 'figure', 'x': 200, 'y': H9B, 'h': 86, 'pose': 'hold', 'role': 'mid'},             # tiny you
    icon('ram', 210, H9B - 60, 26),                                                        # ... with your one stick
]

# ===================================================================== S10: first dibs
G10 = 1250
s10_els = [
    {'t': 'line', 'pts': [[120, G10], [960, G10]], 'role': 'far'},
    icon('factory', 780, G10 - 288, 400),                                                  # 1 the chip factory
    icon('truck', 420, G10 - 197, 340, role='subject'),                                    # 2 the data center's truck
    icon('datacenter', 456, 1078, 150, role='subject'),                                    # 3 ... with a data center on its side
    icon('ram', 790, 1110, 110, **{'in': 0.2, 'out': 0.78}),                               # 4 sticks load into it
    icon('ram', 790, 1110, 110, **{'in': 0.95, 'out': 1.53}),                              # 5
    icon('ram', 790, 1110, 110, **{'in': 1.7, 'out': 2.28}),                               # 6
    icon('truck', 120, G10 - 99, 170),                                                     # 7 the laptop maker's van waits
    icon('laptop', 134, G10 - 90, 78),                                                     # 8
    {'t': 'figure', 'x': 355, 'y': G10, 'h': 150, 'pose': 'shrug', 'role': 'mid'},          # 9 its driver
]
s10_moves = [{'el': i, 'dx': -290, 'dy': 0, 'at': t, 'dur': 0.55} for i, t in ((4, 0.2), (5, 0.95), (6, 1.7))]

# ===================================================================== S11: what's left costs 5x
G11 = 1330
s11_els = [
    {'t': 'line', 'pts': [[120, G11], [960, G11]], 'role': 'far'},
    icon('truck', 130, G11 - 116, 200),
    icon('laptop', 148, G11 - 102, 84),
    icon('ram', 290, 880, 300, role='subject'),                                            # the one stick left
    icon('pricetag', 340, 950, 400, role='subject', **{'in': 1.84}),
    {'t': 'text', 'x': 592, 'y': 1115, 'text': '5x', 'size': 140, 'role': 'subject', 'in': 1.84},
]

# ===================================================================== S12: laptop makers pass that on
s12_els = [
    {'t': 'line', 'pts': [[180, 1162], [900, 1162]], 'role': 'mid'},
    icon('laptop', 340, 882, 400, role='subject', fill='dark'),
    icon('ram', 150, 676, 180, out=0.55),                                                  # the 5x stick goes in
    {'t': 'rect', 'x': 330, 'y': 1196, 'w': 420, 'h': 130, 'fill': 'paper', 'role': 'mid'},  # the price card
    {'t': 'text', 'x': 440, 'y': 1286, 'text': '$999', 'size': 64, 'role': 'mid', 'strike': 0.56},
    {'t': 'text', 'x': 640, 'y': 1286, 'text': '$1,099', 'size': 64, 'role': 'mid', 'in': 1.44},
]
s12_moves = [{'el': 2, 'dx': 300, 'dy': 410, 'at': 0.05, 'dur': 0.45}]

# ===================================================================== S13: the old move: wait
s13_els = [
    {'t': 'line', 'pts': [[150, 1400], [930, 1400]], 'role': 'far'},
    {'t': 'line', 'pts': [[388, 1060], [388, 1400]], 'role': 'mid'},                        # chair back + back leg
    {'t': 'line', 'pts': [[388, 1272], [510, 1272], [510, 1400]], 'role': 'mid'},            # seat + front leg
    {'t': 'figure', 'x': 450, 'y': 1400, 'h': 460, 'pose': 'sit', 'facing': 'r', 'role': 'subject'},
    {'t': 'ellipse', 'cx': 506, 'cy': 1004, 'rx': 11, 'ry': 11, 'fill': 'paper', 'role': 'mid'},
    {'t': 'ellipse', 'cx': 538, 'cy': 974, 'rx': 16, 'ry': 16, 'fill': 'paper', 'role': 'mid'},
    {'t': 'ellipse', 'cx': 630, 'cy': 830, 'rx': 180, 'ry': 128, 'fill': 'paper', 'role': 'mid'},  # thought bubble
    {'t': 'text', 'x': 630, 'y': 776, 'text': 'NEW', 'size': 56, 'role': 'mid'},
    icon('laptop', 545, 790, 170),
    {'t': 'ellipse', 'cx': 236, 'cy': 820, 'rx': 70, 'ry': 70, 'fill': 'paper', 'role': 'mid'},   # wall clock
    {'t': 'line', 'pts': [[236, 772], [236, 820], [272, 838]], 'role': 'mid'},
]

# ===================================================================== S14: chip makers say next year's tighter
G14 = 1330
CAL = dict(x=470, y=640, w=290, role='subject', fill='dark')
s14_els = [
    {'t': 'line', 'pts': [[120, G14], [960, G14]], 'role': 'far'},
    icon('factory', 110, G14 - 187, 260),
    {'t': 'figure', 'x': 385, 'y': G14, 'h': 420, 'pose': 'reach', 'facing': 'r', 'face': 'worried', 'role': 'mid'},
    icon('calendar', text='2026', out=1.2, **CAL),
    icon('calendar', text='2027', **{'in': 1.2}, **CAL),
]

# ===================================================================== S15: callback, the opening's end frame
s15_els = [
    {'t': 'line', 'pts': [[120, GROUND], [960, GROUND]], 'role': 'far'},
    icon('house', 130, GROUND - 101, 110, role='far'),
    icon('house', 840, GROUND - 101, 110, role='far'),
    dc(5),
]
_ph = phone_els() + [
    {'t': 'text', 'x': 540, 'y': 1365, 'text': '$999', 'size': 72, 'role': 'mid', 'strike': True},
    {'t': 'text', 'x': 540, 'y': 1450, 'text': '$1,099', 'size': 72, 'role': 'mid'},
    {'t': 'rect', 'x': 430, 'y': 1488, 'w': 220, 'h': 90, 'fill': 'light', 'role': 'mid'},
    icon('cart', 502, 1502, 76),
]
for e in _ph:  # the phone as O1 left it (lowered)
    e['y'] = e['y'] + PHONE_DROP
s15_els += _ph

# ===================================================================== S16: the tag turns over
TAG = dict(x=340, y=860, w=420, role='subject')
s16_els = [
    icon('laptop', 170, 650, 260),
    icon('pricetag', text='$1,099', out=0.86, **TAG),
    icon('pricetag', **{'in': 0.86}, **TAG),
    icon('datacenter', 498, 908, 220, role='subject', text='AI', **{'in': 0.86}),
]

# ===================================================================== LOOP: back to frame 0's bare lines
loop_els = []
for i, e in enumerate(o1_els):
    if 'draw' in e and e.get('draw') != NODRAW and e.get('in') is None and e.get('t') != 'arrow':
        c = json.loads(json.dumps(e))
        c['draw'] = [r2(c['draw'][0] + 0.3), c['draw'][1]]
        c['fillIn'] = NEVER
        c.pop('out', None)
        loop_els.append(c)
loop_cam = {'from': dict(o1_cam['from']), 'to': dict(o1_cam['from'])}

shots = [
    shot('O1', 0, 5.8, "Your tap; the town's AI data center outgrows it on 'pricier'", 'frame 0; the loop lands here', o1_els, o1_cam, o1_moves),
    shot('S4', 5.8, 9.48, 'Plain chart: 20 years of better for the same money', "on 'Which'", s4_els),
    shot('S5', 9.48, 11.48, 'The joke: right after you buy, a newer one, same price', "on 'Usually'", s5_els),
    shot('S6', 11.48, 16.6, 'This past year the line hooks UP: +9.7% (US)', "back on 'But'", s6_els),
    shot('S7', 16.6, 18.28, 'Your laptop', "on 'Mostly'", s7_els),
    shot('S8', 18.28, 19.4, 'It runs on a stick of memory chips (it rises out)', "cut-in on 'memory'", s8_els, moves=s8_moves),
    shot('S9', 19.4, 21.32, 'Rise over our ledge: sticks pour into an AI data center', "on 'And'", s9_els, s9_cam, s9_moves),
    shot('S9b', 21.32, 22.68, '... by the mountain: its stockpile dwarfs it; tiny you, one stick', "wide on 'By'", s9b_els),
    shot('S10', 22.68, 25.24, 'They pay more: the data-center truck loads first, the van waits', "on 'They'", s10_els, moves=s10_moves),
    shot('S11', 25.24, 29.4, "What's left: the last stick costs 5x", "on 'Which'", s11_els),
    shot('S12', 29.4, 31.32, 'The laptop maker passes it on: $999 to $1,099 (ding)', "on 'laptop'", s12_els, moves=s12_moves),
    shot('S13', 31.32, 33.4, 'The old move: sit and wait for the newer one', "on 'Normally'", s13_els),
    shot('S14', 33.4, 36.36, 'Chip makers hold up next year: even tighter', "on 'But'", s14_els),
    shot('S15', 36.36, 38.84, "Callback: the opening's end frame", "on 'So'", s15_els),
    shot('S16', 38.84, 40.85, 'The tag turns over: an AI data center on its back (like-pop)', "cut-in on 'next'", s16_els),
    shot('LOOP', 40.85, 41.15, "Back to frame 0's bare lines", 'to frame 0', loop_els, loop_cam, tr='dissolve', dur=0.12),
]

out = {'style': 'board', 'label': 'v3 G3 board', 'audio': d['audio'], 'durationSec': d['durationSec'], 'frame0': d['frame0'],
       'frame0Until': d['frame0Until'], 'words': d['words'], 'sfx': d['sfx'], 'shots': shots}
# tiling check
assert shots[0]['s'] == 0 and abs(shots[-1]['e'] - d['durationSec']) < 1e-6
for a_, b_ in zip(shots, shots[1:]):
    assert abs(a_['e'] - b_['s']) < 1e-6, (a_['id'], b_['id'])
starts = {w['s'] for w in d['words']}
for s_ in shots[1:-1]:
    assert s_['s'] in starts, ('cut not on a word', s_['id'], s_['s'])
json.dump(out, open(DST, 'w'), indent=1)
print('wrote', DST, len(shots), 'shots', [len(s_['els']) for s_ in shots])
