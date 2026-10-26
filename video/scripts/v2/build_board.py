"""Build video 2's G3 board animatic (SketchReel board mode) -> public/v2/animatic.json.

  python3 scripts/v2/build_board.py && python3 scripts/v3/board_lint.py public/v2/animatic.json

Board v2 (2026-10-26): the fix round after board v1's sound-off cold read, cinematography check and standards check.
Concept "the line that never ends" (contract lens). Panels, reasons and the camera plan: docs/v2/storyboard_g3.md.
House style: docs/look/STORYBOARD_STYLE.md (§0 signal per drawing, §3 notes strip, §7 cinematography); the reusable
patterns come from scripts/v3/build_board_cine.py (room tone, one-shape window, matched frames, two-layer rise-over).
World coords = each shot's end frame (camera.to); 1080 x 1920, caption band y 290-600, notes strip from y 1680.

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
LOOP_LEN = round(DUR - 39.08, 2)
BBC = 'Source: BBC News, 21 Oct 2026'
HER = 'Her account to BBC News, 21 Oct 2026'          # her clause is REPORTED (FL 5.2): no outlet has seen the contract
TI = 'Source: The Information via Japan Times, 28 Apr 2026'


def r2(x):
    return round(x, 2)


def hold():
    return {'from': {'x': 540, 'y': 960, 'z': 1}, 'to': {'x': 540, 'y': 960, 'z': 1}}


def icon(name, x, y, w, h=None, role='mid', **kw):
    e = {'t': 'icon', 'name': name, 'x': r2(x), 'y': r2(y), 'w': r2(w), 'role': role}
    if h is not None:
        e['h'] = r2(h)
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
    e = {'t': 'line', 'pts': [[r2(x), r2(y)] for x, y in pts], 'role': role}
    e.update(kw)
    return e


def shape(pts, fill, role='mid', **kw):
    return line(pts, role, closed=True, fill=fill, **kw)


def fig(x, y, h, pose='sit', facing='r', role='subject', **kw):
    e = {'t': 'figure', 'x': r2(x), 'y': r2(y), 'h': r2(h), 'pose': pose, 'facing': facing, 'role': role}
    e.update(kw)
    return e


def room(**kw):
    """the home-base room: one far flat mid tone over the whole frame (wall, shelf, desk); lighter things sit on it"""
    return rect(-20, -20, 1120, 1720, 'mid', role='far', **kw)


def window_shape(l, t, r, b, mullion, sill_b, lip, **kw):
    """landscape glass + frame + ONE vertical mullion + sill as one closed light shape (the bar and the glass's bottom
    edge are zero-area spikes in the outline): the room's one opening, the lightest thing in the nook"""
    pts = [(l, t), (mullion, t), (mullion, b), (mullion, t), (r, t), (r, b), (r + lip, b), (r + lip, sill_b),
           (l - lip, sill_b), (l - lip, b), (l, b), (r, b), (l, b)]
    return shape(pts, 'light', **kw)


def xform(el, s, dx, dy):
    """the element scaled by s about the origin, then moved by (dx, dy): a drawing redrawn at another size (line
    weights stay the role's, unlike a camera zoom)"""
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


def below_band(el, top=605):
    """clip an element's top to the read zone (a window or shelf cut by the caption band's edge in a closer size)"""
    e = copy.deepcopy(el)
    if e['t'] == 'line':
        e['pts'] = [[x, max(top, y)] for x, y in e['pts']]
    elif e['t'] == 'icon' and e['y'] < top:
        h = e.get('h', e['w'] * 2.4)
        e['h'], e['y'] = r2(h - (top - e['y'])), top
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
        m = {'el': self.ix[name], 'dx': r2(dx), 'dy': r2(dy), 'at': r2(at), 'dur': r2(dur)}
        if ease:
            m['ease'] = ease
        self.moves.append(m)


def settled(el, dx=0, dy=0):
    """the element as it stands at the end of its shot (moved by dx, dy), held, no timing: for a callback frame"""
    e = copy.deepcopy(el)
    if e['t'] == 'line':
        e['pts'] = [[x + dx, y + dy] for x, y in e['pts']]
    elif e['t'] == 'ellipse':
        e['cx'] += dx
        e['cy'] += dy
    else:
        e['x'] = r2(e['x'] + dx)
        e['y'] = r2(e['y'] + dy)
    for k in ('in', 'out', 'fillIn'):
        e.pop(k, None)
    if e.get('draw') != NODRAW:
        e.pop('draw', None)
    return e


def squiggles(v0, v1, n, width=0.84):
    return '\n'.join(f'{r2(v0 + (v1 - v0) * i / max(1, n - 1))}|~|{width if i % 3 else width - 0.06}' for i in range(n))


def steps(total, t0, n, gap, first=4):
    """(dy, at, dur) for a pour in n growing steps (weights first .. first+n-1), each one gap long: faster and faster"""
    w = [first + k for k in range(n)]
    return [(r2(total * wk / sum(w)), r2(t0 + k * gap), r2(gap)) for k, wk in enumerate(w)]


# ===================================================================== HOME BASE 1: her desk, high 3/4 (O1, P12, LOOP)
# One room tone (wall, shelf, desk), so the paper pool and her paper contract are the light; the desk reads in 3/4 by
# its back edge, its front face and its right end with one leg and the floor line beyond it (board v1's full-width
# light band read top-down). Two edge-cut masses: the shelf (left) and the lamp head (right, below the band).
O1_CAM = {'from': {'x': 540, 'y': 960, 'z': 1.05}, 'to': {'x': 540, 'y': 960, 'z': 1.0}, 'ease': 'inQuad'}
DESK_BACK, DESK_EDGE, FRONT_B = 650, 1310, 1390
PAGE = dict(x=340, y=700, w=400, h=480)                # her job contract (bottom 1180)
PAGE_B = PAGE['y'] + PAGE['h']
ROW1, ROW2 = 0.59, 0.68                                # "no criticizing" / "Google": the clause, in words
TXT_L = 378                                            # the rows' left edge (margin 0.08 + the sheet's 3/4 inset)
SIGNATURE = [[382, 1076], [396, 1052], [410, 1074], [404, 1082], [428, 1060], [446, 1078], [466, 1056], [478, 1076],
             [506, 1066], [540, 1070]]
FLAT_H = 130                                           # the run-on on the desk: page bottom -> desk edge
HANG_H = 650                                           # the run-on over the desk edge (hidden behind the desk top first)
YEARS = [2040, 2050, 2060, 2070, 2080]


def page_rows(bands=()):
    """her contract: header, 4 lines of squiggles, the clause in words (her account, under SHE SAYS), the signature
    rule; bands = highlighter bands behind the clause rows [(v, frac)]"""
    rows = ['0.09|#52|JOB CONTRACT', squiggles(0.21, 0.45, 4)]
    rows += [f'{v}|=|{frac}|50' for v, frac in bands]
    rows += [f'{ROW1}|>46|no criticizing', f'{ROW2}|>46|Google', '0.88|-|0.5']
    return '\n'.join(rows)


def runon_rows(h, years, pad=0):
    """the run-on: a year at the left of every other row (2040, 2050, ... downwards), squiggles after it and between;
    pad = plain squiggle rows above the first year (px)"""
    rows, vs = ['0|m|0.08'], []
    step = (h - pad) / len(years)
    for k, y in enumerate(years):
        v = (pad + step * (k + 0.5)) / h
        vs.append(v)
        rows.append(f'{r2(v)}|>48|{y}')
    rows.append('0|m|0.36')
    rows += [f'{r2(v)}|~|0.85' for v in vs]
    rows.append('0|m|0.08')
    rows += [f'{r2(v - step / 2 / h)}|~|0.8' for v in vs if v - step / 2 / h > 0.03]
    rows += [f'{r2(v / h)}|~|0.8' for v in range(40, pad, 60)]
    return '\n'.join(rows)


def arm_pts(hx, hy):
    """her sleeve from the left edge to a mitten at (hx, hy)"""
    return [(hx - 1300, hy - 40), (hx - 40, hy - 26), (hx - 10, hy - 30), (hx + 22, hy - 14), (hx + 26, hy + 12),
            (hx + 6, hy + 30), (hx - 40, hy + 28), (hx - 1300, hy + 56)]


def opening():
    p = Panel()
    p.add('room', room(fillIn=0.04))
    p.add('front', line([(-40, DESK_EDGE), (1015, DESK_EDGE), (1015, FRONT_B), (-40, FRONT_B)], draw=drawn(0.85, 0.7)))
    # the run-on over the edge: hidden behind the opaque desk top until it pours down over the front face and the floor
    p.add('hang', icon('page', PAGE['x'], DESK_EDGE - HANG_H, PAGE['w'], HANG_H, sw=9, text=runon_rows(HANG_H, YEARS),
                       **{'in': 3.5}))
    p.add('top', shape([(-40, DESK_BACK), (975, DESK_BACK), (1015, DESK_EDGE), (-40, DESK_EDGE)], 'mid',
                       draw=drawn(0.85, 0.8), fillIn=0.04))
    p.add('leg', line([(995, FRONT_B), (995, 1700)], draw=drawn(0.8, 0.5)))
    p.add('floor', line([(1001, 1080), (1100, 1080)], draw=drawn(0.8, 0.4)))      # the floor meets the wall, past the desk
    p.add('shelf', icon('bookshelf', -150, 625, 280, 430, fill='mid', draw=drawn(0.85, 0.8), fillIn=0.2))
    p.add('pool', ell(560, 975, 370, 270, 'paper', role='far', sw=0, draw=NODRAW, fillIn=0.12))   # 740 wide on the desk
    p.add('flat', icon('page', PAGE['x'], PAGE_B - FLAT_H, PAGE['w'], FLAT_H, sw=9,
                       text='0|m|0.08\n0.5|>48|2030\n0|m|0.36\n0.5|~|0.85', **{'in': 2.95}))
    p.add('page', icon('page', role='subject', text=page_rows(), draw=drawn(0.85, 0.8), fillIn=0.03, **PAGE))
    # "her CONTRACT": the clause gets highlighted (a light band UNDER the words: board v1's dark bar read as crossed out)
    for k, (t, bands) in enumerate([(2.74, [(ROW1, 0.5)]), (2.86, [(ROW1, 0.95)]), (2.96, [(ROW1, 0.95), (ROW2, 0.45)])]):
        p.add(f'hl{k}', icon('page', role='subject', text=page_rows(bands), **{'in': t}, **PAGE))
    p.add('sign', line(SIGNATURE, sw=5, draw=[-0.05, 0.30]))                       # signed on frame 0 (the chime)
    p.add('box', icon('box', 70, 770, 250, fill='light', draw=drawn(0.85, 0.7), fillIn=0.18))
    p.add('badge', icon('badge', -420, 640, 170, text='GOOGLE'))
    p.add('boxfront', rect(80, 838, 230, 128, 'light', draw=drawn(0.85, 0.5), fillIn=0.18))   # the badge drops behind it
    p.add('mug', icon('mug', 770, 990, 90, draw=drawn(0.85, 0.6), fillIn=0.25))
    p.add('shade', shape([(1060, 625), (1110, 690), (985, 860), (885, 760)], 'paper', draw=drawn(0.85, 0.5), fillIn=0.1))
    p.add('marker', icon('marker', TXT_L - 930, 1000 - 17 - 150, 150, 150))
    p.add('arm', shape(arm_pts(-335, 640), 'light'))
    # "She quit Google.": her sleeve brings the badge to the centre, then drops it into the box (clack 0.92), comes back
    # and carries the box out; "her CONTRACT": it brings a highlighter to the clause and sweeps it (2.60-2.92)
    for n in ('arm', 'badge'):
        p.move(n, 875, 0, 0.36, 0.22)
        p.move(n, -355, 20, 0.70, 0.12)
        p.move(n, 0, 27, 0.84, 0.08)
    p.move('arm', -745, 0, 0.98, 0.20)
    p.move('arm', 650, 213, 1.24, 0.18)
    for n in ('arm', 'badge', 'box', 'boxfront'):
        p.move(n, -560, 0, 1.48, 0.34)
    for n in ('arm', 'marker'):
        p.move(n, 930, 17, 1.90, 0.26)
        p.move(n, 297, 0, 2.60, 0.32)
        p.move(n, -1300, 0, 3.02, 0.30)
    # the line keeps going: the page steps out past its own edge (3.00-3.50), then pours over the desk edge, faster
    # and faster, the years running down (3.55-6.05)
    for k in range(5):
        p.move('flat', 0, FLAT_H / 5, 3.0 + 0.11 * k, 0.07)
    for dy, at, dur in steps(HANG_H, 3.55, 9, 0.278):
        p.move('hang', 0, dy, at, dur)
    return p


o1 = opening()
O1 = {n: o1.els[i] for n, i in o1.ix.items()}

# P12: the callback = O1's end frame (her contract, highlighted, its run-on down the desk), held; on "can't" it pours
# on by 200 px (a longer run-on whose top 200 px start hidden behind the desk top). The box and her sleeve are gone.
MORE = 200
p12 = Panel()
for n in ('room', 'front'):
    p12.add(n, settled(O1[n]))
p12.add('hang', icon('page', PAGE['x'], DESK_EDGE - MORE, PAGE['w'], HANG_H + MORE, sw=9,
                     text=runon_rows(HANG_H + MORE, YEARS, pad=MORE)))
for n in ('top', 'leg', 'floor', 'shelf', 'pool'):
    p12.add(n, settled(O1[n]))
p12.add('flat', settled(O1['flat'], dy=FLAT_H))
p12.add('page', settled(O1['hl2']))
for n in ('sign', 'mug', 'shade'):
    p12.add(n, settled(O1[n]))
for dy, at, dur in steps(MORE, 0.64, 4, 0.12, first=2):
    p12.move('hang', 0, dy, at, dur)

# LOOP: O1's frame-0 lines, drawing on slowly so each stroke ends at exactly its frame-0 progress (seamless rewatch);
# frame 0 is ~85 % drawn, so the 0.42 s tail shows the desk scene 50-85 % sketched (board v1's tail read as "erased")
loop_els = []
for n, e in O1.items():
    if 'draw' not in e or e['draw'] == NODRAW or e.get('in') is not None:
        continue
    c = copy.deepcopy(e)
    p0 = max(0.0, min(1.0, -c['draw'][0] / c['draw'][1]))
    c['draw'] = [r2(LOOP_LEN - p0 * 1.2), 1.2]
    c['fillIn'] = NEVER
    c.pop('out', None)
    loop_els.append(c)
loop_cam = {'from': dict(O1_CAM['from']), 'to': dict(O1_CAM['from'])}

# ===================================================================== HOME BASE 2: her nook (P2 wide, P13, P4)
# One room tone; the ONE opening = landscape glass (660 x 470 = 15 % of the frame) with a sill, one mullion and far
# roofs; the shelf cut by the left edge and the curtain by the right; a soffit edge over the caption band; the lamp
# shade and its paper pool on the desk; her the only dark mass. P13 and P4 are the same nook REDRAWN at 1.2x and 1.4x
# (line weights stay), so the home base returns at three sizes.
WL, WT, WR, WB = 290, 620, 950, 1090
NOOK = {
    'soffit': shape([(-20, -20), (760, -20), (760, 230), (-20, 230)], 'mid'),
    'shelf': icon('bookshelf', -150, 640, 330, 900, fill='mid'),
    'curtain': shape([(1000, 600), (1100, 600), (1100, 1540), (1030, 1540), (1010, 1300), (990, 1000)], 'mid'),
    'window': window_shape(WL, WT, WR, WB, 740, WB + 26, 25),
    'view': line([(WL, 1010), (330, 1010), (330, 976), (360, 950), (390, 976), (390, 1010), (560, 1010), (560, 984),
                  (600, 960), (640, 984), (640, 1010), (820, 1010), (820, 978), (850, 978), (850, 1010), (WR, 1010)],
                 role='far'),
    'desk': line([(250, 1310), (1100, 1310), (1100, 1345), (250, 1345), (250, 1310)]),
    'shade': shape([(800, 1222), (890, 1222), (920, 1310), (770, 1310)], 'paper'),
    'pool': ell(845, 1332, 160, 24, 'paper', role='far', sw=0),
    'mug': icon('mug', 680, 1255, 50),
    'floor': line([(-20, 1540), (1100, 1540)]),
    'chair': line([(330, 1270), (330, 1600), (330, 1430), (450, 1430), (450, 1600)]),
}
NOOK_ORDER = ['soffit', 'shelf', 'curtain', 'window', 'view', 'desk', 'shade', 'pool', 'mug', 'floor', 'chair']
SEATED = dict(x=420, y=1600, h=600)                    # her at the desk (head centre (444, 1147), hands on the desk)


def nook(s=1.0, dx=0.0, dy=0.0):
    """the nook redrawn at size s (x' = s x + dx); anything that would reach into the caption band is cut at its edge,
    anything that leaves the frame is dropped"""
    out = [room()]
    for n in NOOK_ORDER:
        e = xform(NOOK[n], s, dx, dy) if s != 1 or dx or dy else copy.deepcopy(NOOK[n])
        if n == 'soffit':
            if max(y for _, y in e['pts']) > 290:
                continue
        else:
            e = below_band(e)
        out.append(e)
    return out


# P2: WIDE, eye level. "One odd contract": she stands in her nook holding her contract, and it runs down to the floor
# and on out of the frame (board v1: "just a person at a desk ... nothing odd"). Long hair: "is this her?".
p2_els = nook()
p2_els += [
    fig(560, 1640, 600, pose='hold', facing='r', hair='long'),                                    # hands ~(674-692, 1250)
    icon('page', 652, 1225, 104, 415, role='subject', text=squiggles(0.06, 0.94, 9, 0.8)),        # held up, hanging down
    shape([(647, 1640), (761, 1640), (840, 1720), (590, 1720)], 'paper', role='subject'),         # ... and on along the floor
]

# P13: the nook at 1.2x, held. Her own words: her bubble (the subject, 400 px) pops on "talking" with FACTS in it, her
# word, hand-lettered. No document in it (board v1's deal page in her mouth suggested she leaked it).
S13 = 1.2
D13 = (500 - (SEATED['x'] + 24) * S13, 1185 - 1147 * S13)
p13_els = nook(S13, *D13)
p13_els += [
    xform(fig(**SEATED, role='mid', hair='long'), S13, *D13),
    xform(icon('mic', 540, 1180, 75), S13, *D13),
    xform(shape([(560, 1600), (680, 1600), (740, 1700), (500, 1700)], 'paper'), S13, *D13),         # her contract, on the floor
    icon('speech', 270, 640, 400, 264, role='subject', text='FACTS', pts=[[0.53, 1.75]], **{'in': 1.12}),   # 'talking'
]

# P4: the nook at 1.4x (MEDIUM), held: she sits at her mic, the dark mass; her bubble pops on "SHE" (13.96)
S4 = 1.4
D4 = (520 - (SEATED['x'] + 24) * S4, 1150 - 1147 * S4)
p4_els = nook(S4, *D4)
p4_els += [
    xform(fig(**SEATED, hair='long'), S4, *D4),
    xform(icon('mic', 540, 1180, 75), S4, *D4),
    icon('speech', 250, 650, 400, 264, pts=[[0.6, 1.62]], **{'in': 0.72}),
]

# ===================================================================== P3: staff told the BBC they're scared
# MEDIUM 2-shot, the interview look: two staffers (badges, no hair: not her) behind a table, worried faces (the fear IS
# the beat; board v1's faceless backlit silhouettes didn't read as scared), NAME WITHHELD over the one who spoke, a
# plain mic, their contract on the table with an ordinary underline on "contracts" (12.20).
p3_els = [
    fig(905, 1780, 820, facing='l', role='mid', face='worried'),                      # a second staffer, half cut
    fig(640, 1780, 900, facing='l', face='worried'),                                  # the staffer who spoke (head r 81)
    icon('badge', 572, 1236, 62),                                                     # a staff badge on the lanyard
    rect(-40, 1362, 1160, 170, 'light'),                                              # the table
    rect(-40, 1532, 1160, 200, 'mid'),
    icon('page', 300, 1380, 320, 140, text='0.24|#40|CONTRACT\n' + squiggles(0.55, 0.85, 3, 0.85)),
    line([[330, 1432], [590, 1432]], sw=5, draw=[3.84, 0.3], **{'in': 3.84}),       # 'contracts': an ordinary underline
    icon('mic', 110, 1100, 150),                                                      # the interview mic (plain)
    text(604, 990, 'NAME WITHHELD', 56),
]

# ===================================================================== P5: over her shoulder, Google's AI (home base)
p5_els = [
    room(),
    line([(-20, 980), (1100, 980)]),                                                  # the desk's back edge
    ell(560, 1190, 400, 170, 'paper', role='far', sw=0),                              # the lamp pool on the mid desk
    icon('lamp', 820, 771, 180, fill='paper'),
    icon('laptop', 300, 760, 460, role='subject'),
    icon('nodes', 392, 786, 276, 160),                                                # the AI on her screen
    text(530, 888, 'AI', 64),
    fig(110, 1600, 1100, role='mid', hair='long'),                                    # her shoulder and head, close
]

# ===================================================================== P6: MEDIUM CLOSE, a new angle (3/4 front)
# She faces the mic (left), the window behind her (right): the worried face is the beat (head r 99, board v1's was 68).
p6_els = [
    room(),
    icon('bookshelf', -150, 640, 290, 900, fill='mid'),
    window_shape(560, 640, 1080, 1130, 900, 1156, 25),
    line([(560, 1050), (700, 1050), (700, 1012), (735, 985), (770, 1012), (770, 1050), (1080, 1050)], role='far'),
    line([(-20, 1450), (620, 1450)]),                                                 # the desk's edge, in front of her
    ell(260, 1540, 300, 60, 'paper', role='far', sw=0),                               # the lamp pool on the desk
    icon('mic', 200, 1250, 120),
    fig(640, 1960, 1100, facing='l', face='worried', hair='long'),                    # head (596, 1130)
    icon('speech', 120, 650, 400, 264, pts=[[1.02, 1.75]], **{'in': 0.16}),          # on 'told'
]

# ===================================================================== P7: in April, a deal (cold insert, the stamp)
SURFACE = rect(-200, 600, 1480, 1300, 'light', role='far')                           # the cold desk: no lamp, no room
DEAL_TEXT = '\n'.join(['0.08|>60|DEAL', squiggles(0.2, 0.6, 6, 0.86), '0.8|@|0.42', '0.91|@|0.42'])
p7_els = [
    SURFACE,
    icon('page', 320, 640, 440, 600, role='subject', text=DEAL_TEXT),
    icon('stamp', 520, 650, 240, 91, role='subject', text='APRIL 2026', **{'in': 0.24}),
]
p7_moves = [{'el': 2, 'dx': 0, 'dy': 18, 'at': 0.24, 'dur': 0.06}]

# ===================================================================== P8: SCALE, the rise-over (the one big move)
# Two layers (STORYBOARD_STYLE §7): the camera rises a little (the world sinks 120 px, ease unveil, landing on "AI",
# 23.40) while the low wall drops on its own move (outSine over the whole panel); on screen <= ~15 px per 30 fps frame.
# The cut lands on a wide: the wall hides about half of a Pentagon that is already cut by both side edges; it lands
# with the whole five-ring building wider than the frame and rows of small identical cars (47 px, under 1/8 of P7's
# page) at its foot as the ruler. No figures, aircraft, weapons or "Google" lettering.
P8_CAM = {'from': {'x': 540, 'y': 1080, 'z': 1.0}, 'to': {'x': 540, 'y': 960, 'z': 1.04}, 'ease': 'unveil',
          'start': 21.32, 'end': 23.40, 'word': 'RISE'}
HORIZON, WALL_Y, WALL_DROP = 712, 1020, 640
p8 = Panel()
p8.add('ground', rect(-200, HORIZON, 1480, 1300, 'light', role='far'))
p8.add('trees', rect(-200, HORIZON, 1480, 20, 'mid', role='far'))
p8.add('pentagon', icon('pentagon', -210, 722, 1500, 760, role='subject', fill='paper'))   # top vertex 737, facades to 1400
p8.add('road', rect(-200, 1408, 1480, 26, 'paper', role='far', sw=0))
for k, (y, h) in enumerate([(1444, 36), (1500, 40), (1560, 44)]):
    p8.add(f'cars{k}', icon('cars', -110 - 30 * k, y, 1300 + 60 * k, h))
joints = [(-40, 1160)]
for k, x in enumerate(range(80, 1100, 160)):
    joints += [(x, 1160), (x, 1060 if k % 2 else 1270), (x, 1160)]
joints += [(1120, 1160)]
p8.add('wall', rect(-40, WALL_Y + 40, 1160, 1400, 'mid'))                            # the low stone wall we rise over ...
p8.add('lip', rect(-40, WALL_Y, 1160, 40, 'light'))                                  # ... its coping ...
p8.add('joints', line(joints))                                                       # ... and its stone courses
for n in ('wall', 'lip', 'joints'):
    p8.move(n, 0, WALL_DROP, 0.0, 2.48, ease='outSine')

# ===================================================================== P9 / P10: the deal's words; then NO VETO
# Two separate quoted blocks with a rule between them (board v1 ran them together into a sentence the deal does not
# contain): "any lawful government purpose" (58 px, the line the voice reads) and the oversight clause IN FULL (34 px).
DP = dict(x=310, y=640, w=460, h=620)
BLOCK1 = ['"any lawful', 'government', 'purpose"']
CLAUSE = ['"should not be used', 'for domestic mass', 'surveillance or', 'autonomous weapons', '(including target',
          'selection) without', 'appropriate human', 'oversight and control"']


def deal_rows(s=1.0):
    h = DP['h']
    rows = ['0|m|0.06', f'{r2(46 / h)}|#{round(40 * s)}|DEAL']
    rows += [f'{r2((140 + 62 * k) / h)}|>{round(58 * s)}|{w}' for k, w in enumerate(BLOCK1)]
    rows.append(f'{r2(312 / h)}|-|1')
    rows += [f'{r2((350 + 35 * k) / h)}|>{round(34 * s)}|{w}' for k, w in enumerate(CLAUSE)]
    return '\n'.join(rows)


p9_els = [SURFACE, icon('page', role='subject', text=deal_rows(), **DP)]
# P10: the same page redrawn at 0.85 (a pulled-back cut: the size changes at the cut, the clause stays whole) with a
# big NO VETO stamp (the subject, 330 px) landing on "veto" across the page's top edge, beside "any lawful government
# purpose" and clear of the clause block (never near "autonomous weapons (including target selection)").
S10 = 0.85
p10_page = icon('page', 540 - DP['w'] / 2 * S10, 950 - DP['h'] / 2 * S10, DP['w'] * S10, DP['h'] * S10, text=deal_rows(S10))
p10_els = [SURFACE, p10_page, icon('stamp', 378, 626, 330, 125, role='subject', text='NO VETO', **{'in': 0.74})]
p10_moves = [{'el': 2, 'dx': 0, 'dy': 5, 'at': 0.74, 'dur': 0.05}]

# ===================================================================== P11: Google's side, its own panel
# Equal weight: the deal page's size, position, ground and tone (board v1 put it on plain paper); hand-lettered
# GOOGLE SAYS, never the logo; quote marks only on the exact words; "staff can safely raise concerns" (FL 6.2,
# unquoted paraphrase) answers P3's fear. Pencil underlines read along on "principles" (30.04) and "bans" (30.76).
G_ROWS = [(52, '#44|GOOGLE SAYS'), (150, '>46|it follows its'), (208, '>46|AI principles'), (306, '>46|staff can safely'),
          (364, '>46|raise concerns'), (462, '>46|bans retaliation'), (520, '>46|"of any kind"')]
G_TEXT = '\n'.join(['0|m|0.07'] + [f'{r2(v / DP["h"])}|{s}' for v, s in G_ROWS])
p11_els = [
    SURFACE,
    icon('page', role='subject', text=G_TEXT, **DP),
    line([[345, 874], [640, 874]], sw=5, draw=[1.84, 0.3], **{'in': 1.84}),          # 'principles'
    line([[345, 1128], [700, 1128]], sw=5, draw=[2.56, 0.4], **{'in': 2.56}),         # 'bans'
]

# ===================================================================== the reel
# notes strip: line 1 = shot type, COZY / SCALE and the move (SketchReel adds the id and the move word if missing),
# line 2 = the one idea (SketchReel adds the transition)
NOTES = {
    'O1': ("HOME BASE desk, COZY · INSERT high 3/4 · PULL OUT 5%",
           "She quit: badge in the box. Her contract's line runs past its end, year after year, off the desk"),
    'P2': ("HOME BASE nook, COZY · WIDE, eye level", "One odd contract: hers runs down to the floor"),
    'P3': ("MEDIUM 2-shot, interview look", "Other staff, worried, told the BBC they're scared: their contracts"),
    'P4': ("HOME BASE nook, COZY · MEDIUM (1.4x)", "So why is SHE talking? Her bubble pops"),
    'P5': ("CLOSE over her shoulder, COZY", "She worked on Google's AI"),
    'P6': ("MEDIUM CLOSE, new angle 3/4 front, COZY", "Worried, she tells the BBC she objected"),
    'P7': ("INSERT, cold: out of her room", "April: a deal, stamped"),
    'P8': ("SCALE: RISE over a low wall (the big move)",
           "Grey band = a low wall we rise over; the Pentagon too big for the frame; car rows = the ruler"),
    'P9': ("INSERT close, straight-on (scale cut back in)", "The deal's words: 'any lawful government purpose' + the clause in full"),
    'P10': ("INSERT pulled back (0.85x), same page", "NO VETO stamped by the purpose line"),
    'P11': ("INSERT, the deal page's size and ground", "Google's side, equal weight: principles, safe channels, no retaliation"),
    'P12': ("HOME BASE callback = O1's end, COZY", "She says she still can't: her line runs on"),
    'P13': ("HOME BASE nook, COZY · MEDIUM-WIDE (1.2x)", "Her own words: talking about FACTS"),
    'LOOP': ("DISSOLVE back to frame 0 (the loop)", "The opening's bare lines redraw"),
}


def shot(id_, s, e, tr_label, els, camera=None, moves=None, tr='cut', dur=None, credit=None, scale=False):
    t = {'type': tr, 'label': tr_label}
    if dur:
        t['dur'] = dur
    out = {'id': id_, 's': s, 'e': e, 'note': '\n'.join(NOTES[id_]), 'transition': t, 'camera': camera or hold(), 'els': els}
    if moves:
        out['moves'] = moves
    if credit:
        out['credit'] = credit
    if scale:
        out['scale'] = True
    return out


shots = [
    shot('O1', 0, 6.12, 'frame 0; the loop lands here', o1.els, O1_CAM, o1.moves),
    shot('P2', 6.12, 8.36, "on 'You'd'", p2_els, credit=HER),
    shot('P3', 8.36, 13.24, "on 'But'", p3_els, credit=BBC),
    shot('P4', 13.24, 15.0, "on 'So'", p4_els),
    shot('P5', 15.0, 16.6, "cut-in on 'She'", p5_els, credit='Sofia Liguori · former research engineer, Google DeepMind'),
    shot('P6', 16.6, 20.52, "on 'and'", p6_els, credit=BBC),
    shot('P7', 20.52, 21.32, "hard cut on 'In'", p7_els, moves=p7_moves, credit=TI),
    shot('P8', 21.32, 23.8, "on 'that'", p8.els, P8_CAM, p8.moves, scale=True),
    shot('P9', 23.8, 25.96, "scale cut on 'for'", p9_els, credit=BBC),
    shot('P10', 25.96, 28.2, "on 'Google'", p10_els, moves=p10_moves,
         credit='Sources: BBC News, 21 Oct 2026 · The Information via Japan Times, 28 Apr 2026'),
    shot('P11', 28.2, 33.08, "on 'But'", p11_els, credit='Statement to the BBC, 21 Oct 2026'),
    shot('P12', 33.08, 35.32, "on 'She'", p12.els, moves=p12.moves, credit=HER),
    shot('P13', 35.32, 39.08, "on 'But'", p13_els, credit=BBC),
    shot('LOOP', 39.08, DUR, 'to frame 0', loop_els, loop_cam, tr='dissolve', dur=0.12),
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
    sfx('marker_squeak', 2.60, 0.4),       # 'CONTRACT': the highlighter sweeps the clause
    sfx('paper_unroll', 3.00, 0.4),        # the page runs past its edge; ends dead at 4.36 ('for life': near silence)
    sfx('room_tone_2s', 6.12, 0.2),
    sfx('pencil_line', 12.20, 0.35),       # 'contracts': an ordinary underline
    sfx('room_tone_7s', 13.24, 0.2),
    sfx('like_pop', 13.96, 0.4),           # 'SHE': her bubble pops
    sfx('like_pop', 16.76, 0.3),           # 'told'
    sfx('cold_air', 20.52, 0.25),          # out of her room
    sfx('stamp_april', 20.76, 0.55),       # 'April'
    sfx('rise_swell', 21.32, 0.35),        # under the rise; no drums
    sfx('stamp_noveto', 26.70, 0.6),       # 'veto'
    sfx('paper_tap', 28.20, 0.4),          # Google's page: a neutral paper sound
    sfx('pencil_line', 30.04, 0.3),        # 'principles'
    sfx('pencil_line', 30.76, 0.3),        # 'bans'
    sfx('room_tone_6s', 33.08, 0.2),       # home again
    sfx('paper_unroll_short', 33.72, 0.35),  # "can't": her line runs on
    sfx('like_pop', 36.44, 0.4),           # 'talking': her FACTS bubble
]

out = {'style': 'board', 'label': 'v2 G3 board', 'audio': 'v2/voice.wav', 'durationSec': DUR,
       'frame0': 'SHE SAYS: NO CRITICIZING GOOGLE. FOR LIFE.', 'frame0Until': 6.12, 'frame0Credit': HER,
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
