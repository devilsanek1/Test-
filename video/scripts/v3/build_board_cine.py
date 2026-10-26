"""build_board_cine.py: board v3 of video 3's G3 animatic, the cinematography put back into the board
(docs/v3/camera_plan_g3.md with the supervisor's changes) plus the new literal opening O1 ("the tag ticks up as the
memory leaves"). Board house style: docs/look/STORYBOARD_STYLE.md (§0 signal per drawing, §7 cinematography).

  python3 scripts/v3/build_board_cine.py public/v3/animatic.json public/v3/animatic.json
  python3 scripts/v3/board_lint.py public/v3/animatic.json

SRC gives the locked parts (words, audio, sfx, frame0, frame0Until, durationSec, every shot's times and transition) and
the frozen panels (S4, S11: drawings copied as they are; only the notes strip is rewritten). Every other panel is
redrawn here, so the script is idempotent (it can run on its own output). World coords = the end frame (camera.to);
1080 x 1920, caption band y 290-600, read zone y 600-1250, notes strip from y 1680.
Reusable patterns (copy them for the next film):
  - home base: the ROOM = one far flat mid rect over the whole frame (wall, shelf and desk in one tone), so the ONE
    window (light glass) is the lightest thing around it and reads as an opening, not a picture on paper; window = ONE
    closed light shape whose outline also draws the mullion and the sill (zero-area spikes), so window + mullion + sill
    cost 1 element; lamp shade + a paper pool on the mid desk. Every home-base panel (POV, objective, close-ups at the
    desk) starts from the same room() tone and lamp, so the place visibly returns.
  - a matched frame (S4 = S6, S10 = S14, O1's end = S15) is built from ONE element list plus the changes, never redrawn.
  - a scale panel sets shot "scale": true (board-lint then wants its subject >= 60 % of the frame or cut by both sides).
  - notes = "line 1\nline 2": line 1 = shot type, COZY / SCALE, the move; line 2 = the one idea (SketchReel's strip).
  - a ticker = icons that carry their own text (one number visible at a time; struck old price as a text element).
  - reuse an element for a second flight: teleport it off screen and back with 0.008 s moves placed between 60 fps
    frames (snap()), since an element has one `in` and one `out`.
  - a rise-over in board mode: a small camera rise + the near ledge's own move with ease 'outSine' (peak speed pi/2 x
    the average); check the on-screen speed (<= 15 px per 30 fps frame) with the loop at the bottom.
"""
import copy
import json
import math
import sys

SRC, DST = sys.argv[1], sys.argv[2]
d = json.load(open(SRC))
SRC_SHOTS = {s['id']: s for s in d['shots']}
NODRAW = [99, 0.01]   # fill-only shape: its stroke never draws
NEVER = 99            # a fillIn that never arrives (bare lines)
FROZEN = ['S4', 'S11']


def hold():
    return {'from': {'x': 540, 'y': 960, 'z': 1}, 'to': {'x': 540, 'y': 960, 'z': 1}}


def snap(t):
    """an instant (0.008 s) move starts here: between two 60 fps frames, so no frame (30 or 60 fps) lands mid-jump"""
    return round(math.floor(t * 60 + 1e-9) / 60 + 0.004, 4)


def r2(v):
    return round(v, 2)


def icon(name, x, y, w, h=None, role='mid', **kw):
    e = {'t': 'icon', 'name': name, 'x': x, 'y': y, 'w': w, 'role': role}
    if h is not None:
        e['h'] = h
    e.update(kw)
    return e


def text(x, y, s, size=64, role='mid', **kw):
    e = {'t': 'text', 'x': x, 'y': y, 'text': s, 'size': size, 'role': role}
    e.update(kw)
    return e


def rect(x, y, w, h, fill=None, role='mid', **kw):
    e = {'t': 'rect', 'x': x, 'y': y, 'w': w, 'h': h, 'role': role}
    if fill:
        e['fill'] = fill
    e.update(kw)
    return e


def ell(cx, cy, rx, ry, fill=None, role='mid', **kw):
    e = {'t': 'ellipse', 'cx': cx, 'cy': cy, 'rx': rx, 'ry': ry, 'role': role}
    if fill:
        e['fill'] = fill
    e.update(kw)
    return e


def line(pts, role='mid', **kw):
    e = {'t': 'line', 'pts': [list(p) for p in pts], 'role': role}
    e.update(kw)
    return e


def shape(pts, fill, role='mid', **kw):
    return line(pts, role, closed=True, fill=fill, **kw)


def room(**kw):
    """the home-base room: one far flat mid tone over the whole frame (wall + shelf + desk); lighter things sit on it"""
    return rect(-20, -20, 1120, 1720, 'mid', role='far', **kw)


def xform(el, s, dx, dy):
    """the element scaled by s about the origin, then moved by (dx, dy): to reuse a drawing at another size"""
    e = copy.deepcopy(el)
    if e['t'] == 'line':
        e['pts'] = [[r2(x * s + dx), r2(y * s + dy)] for x, y in e['pts']]
    elif e['t'] == 'ellipse':
        e.update(cx=r2(e['cx'] * s + dx), cy=r2(e['cy'] * s + dy), rx=r2(e['rx'] * s), ry=r2(e['ry'] * s))
    else:
        e.update(x=r2(e['x'] * s + dx), y=r2(e['y'] * s + dy))
        for k in ('w', 'h', 'size'):
            if k in e:
                e[k] = r2(e[k] * s)
    return e


def drawn(p0, dur):
    """draw-on that is p0 (0..1) done at the shot start and finishes after dur s (frame 0: the scene being drawn)"""
    return [r2(-p0 * dur), dur]


class Panel:
    def __init__(self):
        self.els, self.moves, self.ix = [], [], {}

    def add(self, name, el):
        self.ix[name] = len(self.els)
        self.els.append(el)
        return el

    def move(self, name, dx, dy, at, dur, ease=None):
        m = {'el': self.ix[name], 'dx': dx, 'dy': dy, 'at': r2(at) if dur > 0.01 else at, 'dur': dur}
        if ease:
            m['ease'] = ease
        self.moves.append(m)


def shift(el, dy):
    """the element dy px lower (y, pts or the line ends)"""
    e = copy.deepcopy(el)
    if e['t'] == 'line':
        e['pts'] = [[x, y + dy] for x, y in e['pts']]
    elif e['t'] == 'ellipse':
        e['cy'] += dy
    else:
        e['y'] += dy
    return e


def settled(el, dy=0):
    """the element as it stands at the end of its shot, held (no timing): for a callback frame"""
    e = shift(el, dy)
    for k in ('in', 'out', 'fillIn'):
        e.pop(k, None)
    if e.get('draw') != NODRAW:
        e.pop('draw', None)
    if 'strike' in e:
        e['strike'] = True
    return e


# ===================================================================== O1: the new opening (0-5.80, one shot)
# HOME BASE nook, POV from your desk chair. The cause outside the window (memory sticks leave for the AI data center),
# the effect in your hand (the tag ticks up one step per stick), both landing on "pricier" (2.60). No growth metaphor.
O1_CAM = {'from': {'x': 540, 'y': 960, 'z': 1.05}, 'to': {'x': 540, 'y': 960, 'z': 1.0}, 'ease': 'inQuad'}
WIN_L, WIN_T, WIN_R, WIN_B = 180, 630, 900, 1060   # the glass (top at screen y 613 at z 1.05: the band stays clear)
MULLION = 830          # one vertical bar in the clear glass right of the building (never across the sign or the rows)
SILL_B, LIP = 1086, 25
DESK = 1086            # the desk top, right under the sill
HORIZON = 950
DC = dict(x=322, y=645, w=436, h=305)               # 436 * 1.05 = 458 <= 460 at the start camera
SIGN_BOX = dict(x=357, y=729, w=366, h=49)           # the icon's sign: u 0.08-0.92, v 0.275-0.435
DROP = 140             # "Well," (3.64-4.00): you lower the phone and look out of the window
TICKS = [(None, ' $999 '), (1.88, '$1,019'), (2.18, '$1,039'), (2.40, '$1,059'), (2.60, '$1,079'), (2.72, '$1,099')]
TAG = dict(x=360, y=1262, w=360)                    # h 216; the heaviest line until 4.04
STICK = dict(x=425, y=1080, w=130)                  # rises off the listing's laptop
STICK_LEGS = [(-240, -100, 0.0, 0.2), (0, -310, 0.1, 0.28), (145, -5, 0.32, 0.16)]   # (dx, dy, at, dur) of one flight


def window_shape(l, t, r, b, mullion, sill_b, lip, crossbar=None, **kw):
    """glass + frame + one vertical mullion (+ an optional crossbar) + sill as ONE closed light shape: the bars and the
    glass's bottom edge are zero-area spikes in the outline, so they draw as lines without changing the fill"""
    pts = [(l, t), (mullion, t), (mullion, b), (mullion, t), (r, t), (r, b), (r + lip, b), (r + lip, sill_b),
           (l - lip, sill_b), (l - lip, b), (l, b), (r, b), (l, b)]
    if crossbar:
        pts += [(l, crossbar), (r, crossbar), (l, crossbar)]
    return shape(pts, 'light', **kw)


def opening():
    p = Panel()
    # refuge: the room (wall, shelf and desk) is one flat mid tone around the window, so the light glass is the lightest
    # thing in the nook and reads as the ONE opening (role far: the only shape allowed through the caption band); the
    # paper pool reads as light on it
    p.add('room', room(fillIn=0.04))
    p.add('window', window_shape(WIN_L, WIN_T, WIN_R, WIN_B, MULLION, SILL_B, LIP, draw=drawn(0.6, 0.5), fillIn=0.08))
    # the horizon with 2 small houses (the data center ~4x their height), one far line
    p.add('horizon', line([(WIN_L, HORIZON), (205, HORIZON), (205, 905), (240, 874), (275, 905), (275, HORIZON),
                           (762, HORIZON), (762, 910), (792, 882), (822, 910), (822, HORIZON), (WIN_R, HORIZON)],
                          role='far', draw=drawn(0.7, 0.3)))
    p.add('dc', icon('datacenter', DC['x'], DC['y'], DC['w'], DC['h'], role='mid', fill='paper', text=' ', draw=drawn(0.55, 0.45),
                     fillIn=0.14, out=4.14))
    p.add('dc_dark', icon('datacenter', DC['x'], DC['y'], DC['w'], DC['h'], role='subject', fill='dark', text=' ', **{'in': 4.04}))
    p.add('sign', text(540, 773, 'AI DATA CENTER', 56, **{'in': 0.25}))
    p.add('pool', ell(200, 1200, 160, 55, 'paper', role='far', sw=0, fillIn=0.2))             # the lamp's pool on the desk
    p.add('shade', shape([(150, 1000), (250, 1000), (280, DESK), (120, DESK)], 'paper', draw=drawn(0.6, 0.25), fillIn=0.1))
    p.add('phone', icon('phone', 340, 980, 400, draw=drawn(0.7, 0.35), fillIn=0.06))
    p.add('screen', rect(382, 1052, 316, 700, 'paper', draw=NODRAW, fillIn=-0.2))      # opaque from frame 0: no app grid
    p.add('laptop', icon('laptop', 455, 1062, 170, draw=drawn(0.6, 0.3), fillIn=0.12))
    p.add('was', text(540, 1236, '$999', 56, **{'in': 1.88}, strike=1.88))
    tags = []
    for k, (t, price) in enumerate(TICKS):
        e = icon('pricetag', TAG['x'], TAG['y'], TAG['w'], role='subject', text=price)
        if t is None:       # complete on frame 0 with its $999 (the expected thing), so the tag never reads as "no price"
            e.update(fillIn=0.16)
        else:
            e['in'] = t
        # the next tag draws over this one; this one leaves once that one is opaque (no see-through frame)
        e['out'] = r2(TICKS[k + 1][0] + 0.1) if k + 1 < len(TICKS) else 4.04
        tags.append(p.add(f'tag{k}', e))
    p.add('tag_mid', icon('pricetag', TAG['x'], TAG['y'] + DROP, TAG['w'], text='$1,099', **{'in': 3.96}))
    p.add('cart', icon('cart', 507, 1500, 66, draw=drawn(0.6, 0.25), fillIn=0.07))
    thumb = [[564, 1508], [588, 1490], [618, 1496], [640, 1522], [780, 1676], [690, 1696], [574, 1554], [558, 1528]]
    p.add('thumb', shape(thumb, 'light', draw=drawn(0.9, 0.3), fillIn=0.03))
    p.move('thumb', -4, 8, 0.0, 0.06)
    p.move('thumb', 4, -8, 0.14, 0.12)
    # memory sticks: off the listing's laptop, left round the building, up the clear glass, onto the roof; each
    # launch = one tick of the tag. A, B relaunch for the burst (teleported off screen and back).
    flights = {'stickA': [1.88, 2.60], 'stickB': [2.18, 2.72], 'stickC': [2.40]}
    for name, ts in flights.items():
        p.add(name, icon('ram', STICK['x'], STICK['y'], STICK['w'], **{'in': ts[0]}))
        fx, fy = sum(l[0] for l in STICK_LEGS), sum(l[1] for l in STICK_LEGS)
        for j, t in enumerate(ts):
            if j:
                p.move(name, 2000 - fx, -fy, snap(t - 0.03), 0.008)   # back to the launch spot, unseen
            for dx, dy, at, dur in STICK_LEGS:                        # left round the building, up the glass, onto the roof
                p.move(name, dx, dy, t + at, dur)
            p.move(name, -2000, 0, snap(t + 0.49), 0.008)             # gone into the building
    p.add('mark', {'t': 'mark', 'kind': 'circle', **SIGN_BOX, 'in': 4.04, 'draw': [4.04, 0.3]})
    for name in ['phone', 'screen', 'laptop', 'was', 'cart', 'thumb'] + [f'tag{k}' for k in range(len(TICKS))]:
        p.move(name, 0, DROP, 3.64, 0.36)
    return p


o1 = opening()
O1 = {n: o1.els[i] for n, i in o1.ix.items()}

# S15: the callback = O1's end frame, held (no mark: the sign is already named)
s15_els = [settled(O1[n]) for n in ['room', 'window', 'horizon', 'dc_dark', 'sign', 'pool', 'shade']]
s15_els += [settled(O1[n], DROP) for n in ['phone', 'screen', 'laptop', 'was']]
s15_els += [settled(O1['tag_mid'])]
s15_els += [settled(O1[n], DROP) for n in ['cart', 'thumb']]

# LOOP: O1's frame-0 lines, drawing on slowly so each stroke ends at exactly its frame-0 progress (seamless rewatch)
loop_els = []
for n in ['window', 'horizon', 'dc', 'shade', 'phone', 'screen', 'laptop', 'tag0', 'cart', 'thumb']:
    e = copy.deepcopy(O1[n])
    if n == 'screen':                     # the blank phone screen: a paper fill, already there on frame 0
        loop_els.append(e)
        continue
    p0 = max(0.0, min(1.0, -e['draw'][0] / e['draw'][1])) if 'draw' in e else 1.0
    if p0 < 1:
        e['draw'] = [r2(0.3 - p0 * 1.2), 1.2]
    e['fillIn'] = NEVER
    e.pop('out', None)
    e.pop('in', None)
    loop_els.append(e)
loop_cam = {'from': dict(O1_CAM['from']), 'to': dict(O1_CAM['from'])}

# ===================================================================== S5: MEDIUM, waist-up, the face beat
# Right after you buy one, a BETTER one (bigger, labelled) comes out at the same $999; your face goes "aw, man"
# (worried), not shock: the cold read took shock for "something bad happened" (v3 G3 board v3).
FIG5 = dict(t='figure', x=330, y=1952, h=1200, pose='hold', facing='r', role='subject')   # head r 108: ~1.9x board v2
s5_els = [
    line([(470, 910), (860, 910)]),                                                   # the shop shelf, upper right
    dict(FIG5, face='happy', out=0.72),
    dict(FIG5, face='worried', **{'in': 0.72}),
    rect(-20, 1395, 1120, 400, 'light'),                                              # the shop counter: waist-up
    icon('laptop', 426, 1032, 300),                                                   # yours, just bought
    icon('pricetag', 470, 1250, 190, text='$999'),
    icon('laptop', 490, 672, 340, **{'in': 0.72}),                                    # the BETTER one: bigger
    icon('pricetag', 690, 900, 190, text='$999', **{'in': 0.72}),
    text(660, 662, 'BETTER', 56, **{'in': 0.72}),
]

# ===================================================================== S6: INSERT, the exact S4 frame + the turn
S4_ELS = SRC_SHOTS['S4']['els']
s6_els = [copy.deepcopy(e) for e in S4_ELS[:3]]                                      # axes, title, "2005": as in S4
s6_els += [settled(dict(S4_ELS[3], role='mid'))]                                      # the old line, settled, 5 px
s6_els += [
    line([(700, 1110), (712, 1086), (738, 978)], role='subject', draw=[1.44, 1.2]),  # the hook up, on "US"
    text(596, 966, '+9.7%', 120, role='subject', **{'in': 3.36}),                     # on "almost 10%"
]

# ===================================================================== S7: CLOSE at your desk (home base)
# The room tone and O1's lamp shade (cut by the left edge) say "the same nook"; the pool is paper on the mid desk.
s7_els = [
    room(),
    line([(-20, 1000), (1100, 1000)]),                                                # the desk's back edge
    shape([(-60, 790), (110, 790), (160, 930), (-110, 930)], 'paper'),                # O1's lamp shade, cut by the left edge
    ell(540, 1150, 320, 110, 'paper', role='far', sw=0),                              # the lamp pool, 640 wide
    icon('laptop', 330, 860, 420, role='subject'),
    line([(650, 1100), (676, 842)], **{'in': 0.64}),                                  # see-inside bubble on "your"
    ell(680, 728, 112, 112, 'paper', **{'in': 0.64}),
    icon('ram', 595, 702, 170, **{'in': 0.64}),
]

# ===================================================================== S8: EXTREME CLOSE, cut-in on S7's axis
# SCALE ladder, the small end: ONE stick rises out of the keyboard, in front of the bezel and the keys (never inside the
# screen, which read as "a picture on the display"), and is the biggest whole thing in the frame (700 px = 65 % W).
s8_els = [
    room(),
    ell(540, 1630, 420, 70, 'paper', role='far', sw=0),                               # the lamp pool continues
    icon('laptop', -160, 610, 1400),                                                  # redrawn at size: keys cut by both edges
    rect(71, 664, 938, 480, 'paper', draw=NODRAW),                                    # a plain screen
    icon('ram', 190, 1490, 700, role='subject'),                                      # ONE stick, across bezel + keys
]
s8_moves = [{'el': 4, 'dx': 0, 'dy': -380, 'at': 0.0, 'dur': 0.4}]   # lands on the hinge: over the bezel and keys

# ===================================================================== S9: SCALE, rise-over reveal (the one big move)
# The camera lands on "centers" (20.8) with the reveal ease (unveil: soft start, long landing); the ledge's own move runs
# outSine over the whole panel: together <= 15 px per 30 fps frame on screen. The data center is a wide hall cut by BOTH
# side edges at both ends (too big to take in: CINEMATIC_GUIDE S1, COZY_AND_SCALE §1.2), not a centred building on paper;
# the ledge reads as OUR ROOF (parapet lip + one vent), not as ground.
S9_CAM = {'from': {'x': 540, 'y': 1080, 'z': 1.0}, 'to': {'x': 540, 'y': 960, 'z': 1.04}, 'ease': 'unveil',
          'start': 19.4, 'end': 20.8, 'word': 'RISE'}
S9_DC = dict(x=-80, y=740, w=1240, h=500)    # 1290 px on screen at the landing; top at screen 620 at the start, 731 at the landing
LEDGE_Y, LEDGE_DROP = 1040, 373              # lip top on screen 880 -> 1390 (camera + own move); own move: outSine over the panel
LIP_H = 40
town = [(-40, 1340)]                         # house roofs just under the data center's base: its door stays clear
for k in range(12):
    x0 = -40 + 100 * k
    town += [(x0, 1310), (x0, 1272), (x0 + 40, 1238), (x0 + 80, 1272), (x0 + 80, 1310)]
town += [(1120, 1310), (1120, 1340)]
s9 = Panel()
S9_STICKS = [0.55 + 0.13 * k for k in range(7)]
for k, t in enumerate(S9_STICKS):                                                     # arc in from the side edges
    left = k % 2 == 0
    name = f'stick{k}'
    s9.add(name, icon('ram', -190 if left else 1100, 705, 150, **{'in': r2(t), 'out': r2(t + 0.6)}))   # just over the roof units
    s9.move(name, 560 if left else -560, 0, t, 0.55)
    s9.move(name, 0, 100, t + 0.3, 0.25)                                              # down into the roof (behind it)
s9.add('dc', icon('datacenter', S9_DC['x'], S9_DC['y'], S9_DC['w'], S9_DC['h'], role='subject', text='AI DATA CENTER'))
s9.add('town', shape(town, 'paper', role='far', sw=3))                              # the houses at its foot (house scale)
s9.add('ledge', rect(-40, LEDGE_Y, 1160, 1400, 'mid'))                               # OUR ROOF: the parapet wall ...
s9.add('lip', rect(-40, LEDGE_Y - LIP_H, 1160, LIP_H, 'light'))                      # ... its coping lip ...
s9.add('vent', shape([(190, LEDGE_Y - LIP_H), (190, LEDGE_Y - LIP_H - 62), (176, LEDGE_Y - LIP_H - 62),
                      (176, LEDGE_Y - LIP_H - 84), (264, LEDGE_Y - LIP_H - 84), (264, LEDGE_Y - LIP_H - 62),
                      (250, LEDGE_Y - LIP_H - 62), (250, LEDGE_Y - LIP_H)], 'mid'))    # ... and one roof vent (roof tone)
for n in ('ledge', 'lip', 'vent'):
    s9.move(n, 0, LEDGE_DROP, 0.0, 1.92, ease='outSine')

# ===================================================================== S9b: SCALE CUT to a WORM'S-EYE, tiny you
# Ground-level camera: the horizon low (y 1500), the pile of memory sticks runs past both side edges and up to just under
# the caption band (880 px = 10:1 over the 86 px figure, K7); the data center small at its foot (theirs).
G9B = 1500
s9b_els = [
    line([(-20, G9B), (1100, G9B)], role='far'),                                      # the horizon, low
    icon('pile', -200, 620, 1480, G9B - 620, role='subject', fill='light'),          # THE mountain of memory sticks
    icon('datacenter', 600, G9B - 168, 240, 168),                                     # their data center, at its foot
    {'t': 'figure', 'x': 250, 'y': G9B + 90, 'h': 86, 'pose': 'hold', 'role': 'mid'},  # tiny you, on the paper ground in
    icon('ram', 256, G9B + 30, 30),                                                   # front (against the pile it vanished)
]

# ===================================================================== S10 = S14: the queue at the chip factory
# MEDIUM-WIDE from slightly above, looking up the line: the road runs from the van (near, big, bottom left) to the chip
# factory's door (far, upper right). The data center is first at the door and gets the sticks; the laptop van waits
# behind it (waiting dots). A side-on row read as "three buildings side by side" (cold read). S14 is this exact frame
# plus the changes (the chip maker speaks, 2027, a second data center cuts in, the van is pushed back).
Q_DC = dict(x=435, y=860, w=330, h=231)
q_els = [
    shape([(805, 842), (925, 842), (407, 1640), (-20, 1640), (-20, 1410)], 'light', role='far'),   # the road, up the line
    icon('factory', 634, 626, 300),                                                    # the chip factory (far), door at x 826-904
]
Q_STICKS = [0.1 + 0.35 * k for k in range(6)]
for t in Q_STICKS:                                                                     # door -> the data center's roof
    q_els.append(icon('ram', 820, 780, 90, **{'in': r2(t), 'out': r2(t + 0.8)}))
q_els += [
    icon('datacenter', Q_DC['x'], Q_DC['y'], Q_DC['w'], Q_DC['h'], role='subject', fill='dark', text=' '),   # FIRST in line
    text(600, 960, 'AI DATA CENTER', 48),
    icon('truck', 70, 1200, 380),                                                      # the laptop van, waiting behind
    icon('laptop', 100, 1222, 190),                                                    # ... with a laptop on its side
    ell(372, 1166, 11, 11, 'dark'),                                                    # waiting dots over its cab
    ell(408, 1150, 11, 11, 'dark'),
    ell(444, 1134, 11, 11, 'dark'),
]
Q_IX = {'dc': 2 + len(Q_STICKS), 'van': 4 + len(Q_STICKS)}
q_moves = []
for k, t in enumerate(Q_STICKS):
    q_moves += [{'el': 2 + k, 'dx': -110, 'dy': -70, 'at': r2(t), 'dur': 0.4},
                {'el': 2 + k, 'dx': -110, 'dy': 110, 'at': r2(t + 0.4), 'dur': 0.4}]
s10_els, s10_moves = copy.deepcopy(q_els), copy.deepcopy(q_moves)

s14_els, s14_moves = copy.deepcopy(q_els), copy.deepcopy(q_moves)
s14_els[Q_IX['dc']]['out'] = 1.36                                                      # the first one steps back to mid
s14_els += [
    shape([(560, 772), (600, 800), (770, 752)], 'paper', **{'in': 0.16}),              # bubble tail -> the chip maker
    ell(450, 720, 170, 112, 'paper', **{'in': 0.16}),                                  # "chip makers say ..."
    icon('calendar', 365, 632, 170, text='2026', fill='dark', out=1.2, **{'in': 0.16}),
    icon('calendar', 365, 632, 170, text='2027', fill='dark', **{'in': 1.2}),          # on "next"
    {'t': 'figure', 'x': 790, 'y': 842, 'h': 112, 'pose': 'point', 'facing': 'l', 'role': 'mid', 'in': 0.16},   # the chip maker
    icon('datacenter', Q_DC['x'], Q_DC['y'], Q_DC['w'], Q_DC['h'], fill='dark', text=' ', **{'in': 1.36}),
    icon('datacenter', 308, 1020, 300, 210, role='subject', fill='dark', text='AI DATA CENTER', **{'in': 1.36}),  # cuts in
]
for i in range(Q_IX['van'], Q_IX['van'] + 5):                                          # the van (+ laptop, dots) pushed back
    s14_moves.append({'el': i, 'dx': -190, 'dy': 170, 'at': 1.2, 'dur': 0.3})

# ===================================================================== S12: CLOSE on the tag
# The tag is the subject (the laptop keeps S7's light tones: a black laptop read as "a different, infected one"); the
# new price comes on "pass" (0.88), so it holds 1 s and the middle frame shows the change.
s12_els = [
    line([(180, 1162), (900, 1162)]),
    icon('laptop', 340, 882, 400),
    icon('ram', 150, 676, 180, out=0.55),                                             # the 5x stick goes in
    icon('pricetag', 350, 1180, 380, role='subject'),                                 # the tag (O1's object)
    text(586, 1270, '$999', 64, strike=0.56),                                         # struck on "makers"
    text(586, 1352, '$1,099', 64, **{'in': 0.88}),                                    # on "pass"
]
s12_moves = [{'el': 2, 'dx': 300, 'dy': 410, 'at': 0.05, 'dur': 0.45}]

# ===================================================================== S13: HOME BASE returns, MEDIUM-WIDE, the wait
# The frozen chair, figure, clock and bubble in O1's nook: the same room tone, O1's landscape window (0.85x, cut by the
# right edge) with its horizon and data center outline, the lamp on the desk under the window and its paper pool on the
# mid desk (on plain paper a pool read as a stain; a tall slab with a cross read as a glass door; 3 notches as a castle).
S13_S, S13_DX, S13_DY = 0.85, 470 - 0.85 * WIN_L, 640 - 0.85 * WIN_T
X13 = -40
s13_els = [room()]
s13_els += [xform(settled(O1[n]), S13_S, S13_DX, S13_DY) for n in ('window', 'horizon')]
s13_els += [dict(xform(settled(O1['dc']), S13_S, S13_DX, S13_DY), role='far', text='AI DATA CENTER')]
s13_els += [
    line([(480, 1060), (1100, 1060)]),                                                # the desk under the window
    shape([(545, 975), (640, 975), (670, 1060), (515, 1060)], 'paper'),               # O1's lamp shade, on the window's corner
    ell(650, 1086, 130, 22, 'paper', role='far', sw=0),                               # its pool on the desk
    line([(-20, 1400), (1100, 1400)]),                                                # the floor
    line([(388 + X13, 1060), (388 + X13, 1400)]),                                     # chair back + back leg
    line([(388 + X13, 1272), (510 + X13, 1272), (510 + X13, 1400)]),                  # seat + front leg
    {'t': 'figure', 'x': 450 + X13, 'y': 1400, 'h': 460, 'pose': 'sit', 'facing': 'r', 'role': 'subject'},
    ell(425, 985, 9, 9, 'paper'),                                                     # thought dots
    ell(412, 952, 12, 12, 'paper'),
    ell(330, 790, 150, 115, 'paper'),                                                 # thought bubble, on the wall
    text(330, 742, 'BETTER', 56),
    icon('laptop', 245, 755, 170),
    ell(140, 650, 46, 46, 'paper'),                                                   # wall clock
    line([(140, 618), (140, 650), (165, 663)]),
]

# ===================================================================== S16: CLOSE-UP, cut-in on S15's tag (home base)
# The same phone as S15, 1.275x on its axis (the tag 460 px, centred), in the same room tone (the lamp would land in the
# caption band at this size, so the room carries the place); the tag
# turns over at 0.86 to show the data center on its back.
C16 = 1.275


def cut16(el):
    """S15's settled element -> S16: scaled 1.275x about the tag's centre (540, 1510), the tag landing at (540, 1150)"""
    return xform(el, C16, 540 - 540 * C16, 1150 - 1510 * C16)


TAG16 = cut16(settled(O1['tag_mid']))
s16_els = [
    room(),
    cut16(settled(O1['phone'], DROP)),
    cut16(settled(O1['screen'], DROP)),
    cut16(settled(O1['laptop'], DROP)),                                               # the listing
    cut16(settled(O1['was'], DROP)),
    dict(TAG16, role='subject', out=0.86),
    dict(TAG16, role='subject', text=' ', **{'in': 0.86}),
    icon('datacenter', 430, 1060, 230, role='subject', text='AI', **{'in': 0.86}),
    cut16(settled(O1['cart'], DROP)),
]

# ===================================================================== assemble
# the notes strip: line 1 = shot type, COZY / SCALE and the move (48 px ink; SketchReel adds the move word when line 1
# does not name it), line 2 = the one idea (38 px ink; SketchReel adds the transition). Big words, read on a 25 % sheet.
NOTES = {
    'O1': ("HOME BASE, COZY nook · POV · PULL OUT 5%",
           "Each memory stick that flies to the AI data center = your laptop's price up one step"),
    'S4': ("INSERT chart, straight-on", "20 years: the same money bought more computer"),
    'S5': ("MEDIUM, waist-up (the face)", "Right after you buy one, a BETTER one comes out for the same $999"),
    'S6': ("INSERT, the exact S4 frame", "This year the line turns UP: +9.7%"),
    'S7': ("CLOSE at your desk, COZY lamp", "Your laptop runs on the memory stick inside it"),
    'S8': ("EXTREME CLOSE cut-in, SCALE 1/3", "ONE stick of memory chips, the biggest thing in frame"),
    'S9': ("SCALE 2/3: RISE over OUR ROOF (the big move)",
           "Grey slab = OUR ROOF dropping away; the AI data center is too big for the frame; sticks pour in"),
    'S9b': ("SCALE 3/3: CUT to WORM'S-EYE, tiny you", "Their mountain of memory towers 10:1 over you and your one stick"),
    'S10': ("MEDIUM-WIDE, slightly high: the QUEUE",
            "They pay more: the data center is first at the chip factory door; the laptop van waits behind"),
    'S11': ("INSERT bars, straight-on", "What's left costs 5x last year"),
    'S12': ("CLOSE on the tag", "Laptop makers pass it on: $999 struck, $1,099 on 'pass'"),
    'S13': ("HOME BASE returns, COZY · MEDIUM-WIDE",
            "Normally you'd sit and wait for the better one; the data center stays outside"),
    'S14': ("MEDIUM-WIDE, the exact S10 frame",
            "Chip makers: 2027 is worse. A 2nd data center cuts in; the laptop van is pushed back"),
    'S15': ("HOME BASE callback = O1's end, COZY", "That's how the AI data center ends up on your price"),
    'S16': ("CLOSE-UP cut-in on S15's tag, COZY", "The tag turns over: an AI data center on its back"),
    'LOOP': ("DISSOLVE back to frame 0 (the loop)", "The opening's bare lines redraw, so the rewatch starts seamlessly"),
}
SCALE = {'S8', 'S9', 'S9b'}      # scale panels: board-lint wants their subject >= 60 % of the frame or cut by both sides
BUILT = {
    'O1': (o1.els, O1_CAM, o1.moves),
    'S5': (s5_els, None, None),
    'S6': (s6_els, None, None),
    'S7': (s7_els, None, None),
    'S8': (s8_els, None, s8_moves),
    'S9': (s9.els, S9_CAM, s9.moves),
    'S9b': (s9b_els, None, None),
    'S10': (s10_els, None, s10_moves),
    'S12': (s12_els, None, s12_moves),
    'S13': (s13_els, None, None),
    'S14': (s14_els, None, s14_moves),
    'S15': (s15_els, None, None),
    'S16': (s16_els, None, None),
    'LOOP': (loop_els, loop_cam, None),
}
LABELS = {'O1': 'frame 0'}

shots = []
for src in d['shots']:
    sid = src['id']
    s = copy.deepcopy(src)
    s['note'] = '\n'.join(NOTES[sid])
    s.pop('scale', None)
    if sid in SCALE:
        s['scale'] = True
    if sid in LABELS:
        s['transition']['label'] = LABELS[sid]
    if sid not in FROZEN:
        els, cam, moves = BUILT[sid]
        s['els'] = els
        s['camera'] = cam or hold()
        s.pop('moves', None)
        if moves:
            s['moves'] = moves
    shots.append(s)

# the ding moves with S12's new price, from "on" (30.84) to "pass" (30.28): the price now changes on "pass"
sfx = [dict(x, t=30.28) if x['src'].endswith('phone_notify_ding.wav') else x for x in d['sfx']]
out = {'style': 'board', 'label': 'v3 G3 cine', 'audio': d['audio'], 'durationSec': d['durationSec'], 'frame0': d['frame0'],
       'frame0Until': d['frame0Until'], 'words': d['words'], 'sfx': sfx, 'shots': shots}
assert [s['id'] for s in shots] == [s['id'] for s in d['shots']]
assert all((a['s'], a['e']) == (b['s'], b['e']) for a, b in zip(shots, d['shots'])), 'shot times are locked'
json.dump(out, open(DST, 'w'), indent=1)
print('wrote', DST, len(shots), 'shots', {s['id']: len(s['els']) for s in shots})
