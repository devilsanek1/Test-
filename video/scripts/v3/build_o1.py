"""Build shot O1 (the opening, 0-5.8 s, one continuous shot) and the LOOP tail into public/v3/animatic.json.
Winner concept "The window can't hold it" + the judge's grafts. World coords = the end frame (camera lands at identity)."""
import json, random, sys

SRC = sys.argv[1]
DST = sys.argv[2]
d = json.load(open(SRC))

els, moves, names = [], [], {}
NODRAW = [99, 0.01]  # fill-only shape: the stroke never draws


def add(e, name=None):
    els.append(e)
    i = len(els) - 1
    if name:
        names[name] = i
    return i


def mv(idxs, dx, dy, at, dur):
    for i in (idxs if isinstance(idxs, list) else [idxs]):
        moves.append({'el': i, 'dx': dx, 'dy': dy, 'at': round(at, 3), 'dur': round(dur, 3)})


OUT = 0.6     # outside world through the glass
PH = 1.15     # phone + hand + tag (foreground)

# ------------------------------------------------------------------ OUTSIDE (f 0.6)
add({'t': 'rect', 'x': 318, 'y': 608, 'w': 676, 'h': 562, 'fill': 'cold', 'fillIn': 0.23, 'draw': NODRAW, 'f': OUT})  # night sky
add({'t': 'line', 'pts': [[318, 1060], [420, 1046], [560, 1057], [700, 1043], [860, 1055], [994, 1045], [994, 1170], [318, 1170]],
     'closed': True, 'fill': 'paper', 'fillIn': 0.24, 'draw': NODRAW, 'f': OUT})  # snow ground
add({'t': 'line', 'pts': [[330, 1059], [420, 1046], [560, 1057], [700, 1043], [860, 1055], [985, 1046]], 'draw': [-0.08, 0.24], 'f': OUT})  # snow line
HOUSES = [(410, 470), (490, 550), (570, 630), (680, 740), (884, 950)]
house_win = []
for k, (x0, x1) in enumerate(HOUSES):
    add({'t': 'line', 'pts': [[x0, 1054], [x0, 1012], [(x0 + x1) / 2, 984], [x1, 1012], [x1, 1054]], 'closed': True,
         'fill': 'dark', 'fillIn': 0.25, 'draw': [-0.07 + 0.025 * k, 0.16], 'f': OUT})
add({'t': 'line', 'pts': [[612, 992], [606, 972], [618, 952], [608, 930], [616, 912]], 'draw': [0.95, 0.3], 'f': OUT})  # chimney smoke, house 3
for k, (x0, x1) in enumerate(HOUSES):
    house_win.append(add({'t': 'rect', 'x': (x0 + x1) / 2 - 8, 'y': 1022, 'w': 16, 'h': 16, 'fill': 'warm', 'draw': NODRAW,
                          'in': round(1.08 + 0.10 * k, 2), 'f': OUT}))
for k, (x0, x1) in enumerate(HOUSES):  # the hold before the slam: the house lights dip once
    add({'t': 'rect', 'x': (x0 + x1) / 2 - 9, 'y': 1021, 'w': 18, 'h': 18, 'fill': 'dark', 'draw': NODRAW, 'in': 2.47, 'out': 2.55, 'f': OUT})
# the crane's first floors: a chain lift that speeds up (1.88, 2.12, 2.30, 2.42)
LIFT = [1.88, 2.12, 2.30, 2.42]
for k, t in enumerate(LIFT):
    add({'t': 'rect', 'x': 756 - 4 * k, 'y': 954 - 36 * k, 'w': 118 + 8 * k, 'h': 36, 'fill': 'dark', 'in': t, 'f': OUT})
# second block, 'data' (4.44): 9 floors ratchet up the left panes in 0.25 s, rows already lit
for j in range(9):
    t = round(4.42 + 0.03 * j, 2)
    y = 1056 - 47 * (j + 1)
    add({'t': 'rect', 'x': 334, 'y': y, 'w': 320, 'h': 47, 'fill': 'dark', 'in': t, 'f': OUT})
    add({'t': 'rect', 'x': 350, 'y': y + 17, 'w': 290, 'h': 12, 'fill': 'paper', 'draw': NODRAW, 'in': t, 'f': OUT})
# 'pricier' (2.60): the widened base swallows houses 4-5 and the first floors
add({'t': 'rect', 'x': 668, 'y': 810, 'w': 326, 'h': 246, 'fill': 'dark', 'in': 2.55, 'f': OUT}, 'baseA')
# the toy data center stays on top as the giant's ground floor
add({'t': 'rect', 'x': 760, 'y': 990, 'w': 110, 'h': 64, 'fill': 'dark', 'fillIn': 0.26, 'f': OUT}, 'toy')
add({'t': 'rect', 'x': 784, 'y': 999, 'w': 62, 'h': 34, 'fill': 'warm', 'fillIn': 0.27, 'f': OUT})  # its sign
add({'t': 'text', 'x': 815, 'y': 1028, 'text': 'AI', 'size': 36, 'f': OUT})
add({'t': 'rect', 'x': 846, 'y': 1040, 'w': 16, 'h': 7, 'f': OUT})  # the one sleepy LED (unlit outline)
for a, b in [(0.90, 1.00), (1.22, 1.30), (1.44, None)]:  # it blinks out of step with the houses
    e = {'t': 'rect', 'x': 846, 'y': 1039, 'w': 17, 'h': 9, 'fill': 'paper', 'draw': NODRAW, 'in': a, 'f': OUT}
    if b:
        e['out'] = b
    add(e)
add({'t': 'line', 'pts': [[772, 990], [762, 978]], 'in': 1.64, 'out': 1.92, 'f': OUT})  # 'AI's': the sign sparks
add({'t': 'line', 'pts': [[858, 990], [868, 978]], 'in': 1.64, 'out': 1.92, 'f': OUT})
# the slam floors (2.60-2.75, one every ~1.5 frames), then it keeps stacking and leaves through the top
SLAM = [(2.60, 774), (2.65, 738), (2.70, 702), (2.75, 666), (2.90, 630), (3.05, 594)]
for t, y in SLAM:
    add({'t': 'rect', 'x': 668, 'y': y, 'w': 326, 'h': 36, 'fill': 'dark', 'in': round(t - 0.05, 2), 'f': OUT})
# 'Well,' holds its breath (<= 0.3 s): the bottom row flickers at 3.90; 'AI' (4.04): rows light bottom-up every 0.06 s
add({'t': 'rect', 'x': 684, 'y': 966, 'w': 300, 'h': 12, 'fill': 'paper', 'draw': NODRAW, 'in': 3.88, 'out': 3.96, 'f': OUT})
for i in range(11):
    y = 966 - 36 * i
    add({'t': 'rect', 'x': 684, 'y': y, 'w': 300, 'h': 12, 'fill': 'paper', 'draw': NODRAW, 'in': round(4.02 + 0.06 * i, 2), 'f': OUT})
# 'centers' (4.76): the brass plate names it
add({'t': 'rect', 'x': 698, 'y': 852, 'w': 250, 'h': 54, 'fill': 'warm', 'in': 4.70, 'f': OUT})
add({'t': 'text', 'x': 823, 'y': 890, 'text': 'AI DATA CENTER', 'size': 32, 'in': 4.70, 'f': OUT})
add({'t': 'line', 'pts': [[940, 838], [940, 866], [940, 852], [926, 852], [954, 852]], 'in': 4.82, 'out': 5.15, 'f': OUT})  # flat glint
# the crane: draws on 'AI's', rides every floor, leaves through the top; only its hook cable dangles
crane = add({'t': 'line', 'pts': [[858, 990], [858, 930], [792, 930]], 'draw': [1.66, 0.14], 'f': OUT})
hook = add({'t': 'line', 'pts': [[800, 930], [800, 1000]], 'draw': [1.78, 0.08], 'f': OUT})
for t in LIFT:
    mv([crane, hook], 0, -36, t, 0.06)
for k, (t, y) in enumerate(SLAM):
    mv([crane, hook], 0, -72 if k == 0 else -36, t - 0.05, 0.06)  # the base slams in with the first floor
cable = add({'t': 'line', 'pts': [[800, 560], [800, 700]], 'in': 3.0, 'f': OUT})  # the crane has left; its hook cable dangles
mv(hook, 18, 0, 1.96, 0.1)    # swings back for the next floor
mv(hook, -18, 0, 2.06, 0.06)
mv(hook, 0, -8, 2.45, 0.06)   # hesitates
mv(hook, 0, 8, 2.51, 0.04)
for k in range(5):            # dangling sway
    mv(cable, 6 if k % 2 == 0 else -6, 0, 3.05 + 0.5 * k, 0.5)
# snow puff off the new roof (2.22)
for k, (x, y) in enumerate([(770, 900), (800, 892), (830, 898)]):
    i = add({'t': 'line', 'pts': [[x - 5, y - 5], [x + 5, y + 5], [x, y], [x + 5, y - 5], [x - 5, y + 5]], 'in': 2.22, 'out': 2.7, 'f': OUT})
    mv(i, -6 + 6 * k, -22, 2.22, 0.45)
# snow: a new flake every 0.1 s from 0.5 s, each drifting ~1.8 s
rnd = random.Random(7)
t = 0.50
while t < 5.75:
    x, y = rnd.uniform(352, 958), rnd.uniform(648, 990)
    if abs(x - 655) < 14:
        x += 30
    i = add({'t': 'line', 'pts': [[round(x - 6), round(y - 6)], [round(x + 6), round(y + 6)], [round(x), round(y)], [round(x + 6), round(y - 6)], [round(x - 6), round(y + 6)]],
             'in': round(t, 2), 'out': round(min(t + 1.8, 9), 2), 'f': OUT})
    mv(i, rnd.uniform(-14, -4), rnd.uniform(40, 60), t, 1.8)
    t += 0.1 if t < 3.0 else 0.14

# ------------------------------------------------------------------ ROOM (f 1)
# steam fogs the glass at the end (hand-off to S4's fogged pane)
add({'t': 'hatch', 'x': 662, 'y': 916, 'w': 306, 'h': 232, 'in': 5.45})  # below the brass plate, which stays readable
add({'t': 'hatch', 'x': 342, 'y': 916, 'w': 306, 'h': 232, 'in': 5.58})
add({'t': 'hatch', 'x': 342, 'y': 637, 'w': 626, 'h': 190, 'in': 5.68})
# the wall around the window (fill-only, floods last; it also masks the outside plane)
for x, y, w, h in [(-40, -40, 1160, 632), (-40, 590, 342, 600), (1008, 590, 112, 600)]:
    add({'t': 'rect', 'x': x, 'y': y, 'w': w, 'h': h, 'fill': 'paper', 'fillIn': 0.29, 'draw': NODRAW})
add({'t': 'line', 'pts': [[770, -40], [900, -40], [1120, 82], [1120, 152]], 'closed': True, 'fill': 'warm', 'fillIn': 0.29})  # ceiling beam
add({'t': 'line', 'pts': [[700, -40], [1120, 196]]})
# bookshelf (left), its spines still drawing on frame 0
add({'t': 'line', 'pts': [[122, -40], [122, 1188]]})
for y in [292, 600, 880, 1160]:
    add({'t': 'line', 'pts': [[-40, y], [122, y]]})
BOOKS = [(78, 292, [(4, 28), (32, 56), (60, 84), (88, 112)]), (650, 600, [(4, 30), (34, 56)]), (930, 880, [(4, 28), (32, 58), (62, 86), (90, 114)]),
         (1180, 1160, [])]
k = 0
for top, bottom, spines in BOOKS:
    for (x0, x1) in spines:
        add({'t': 'rect', 'x': x0, 'y': top + (k % 3) * 8, 'w': x1 - x0, 'h': bottom - top - (k % 3) * 8,
             'fill': ['dark', 'warm', 'paper'][k % 3], 'fillIn': round(0.26 + 0.005 * k, 3), 'draw': [-0.14 + 0.02 * k, 0.24]})
        k += 1
add({'t': 'line', 'pts': [[64, 600], [72, 548], [108, 548], [116, 600]], 'closed': True, 'fill': 'warm', 'fillIn': 0.28})  # plant pot
add({'t': 'ellipse', 'cx': 90, 'cy': 518, 'rx': 30, 'ry': 32, 'fill': 'dark', 'fillIn': 0.28})  # plant
# window frame (wood) and the mullions (still drawing on frame 0)
for x, y, w, h in [(300, 590, 710, 46), (300, 636, 42, 514), (968, 636, 42, 514)]:
    add({'t': 'rect', 'x': x, 'y': y, 'w': w, 'h': h, 'fill': 'warm', 'fillIn': 0.22})
add({'t': 'rect', 'x': 649, 'y': 636, 'w': 12, 'h': 514, 'fill': 'warm', 'fillIn': 0.22, 'draw': [-0.05, 0.2]})
add({'t': 'rect', 'x': 342, 'y': 828, 'w': 626, 'h': 12, 'fill': 'warm', 'fillIn': 0.22, 'draw': [-0.02, 0.2]})
add({'t': 'rect', 'x': 284, 'y': 1150, 'w': 742, 'h': 38, 'fill': 'warm', 'fillIn': 0.22})  # sill
# desk, lamp pool, the cold light patches ('centers'), the small pool that survives
add({'t': 'rect', 'x': -40, 'y': 1188, 'w': 1160, 'h': 800, 'fill': 'warm', 'fillIn': 0.10})
add({'t': 'ellipse', 'cx': 250, 'cy': 1322, 'rx': 300, 'ry': 112, 'fill': 'paper', 'fillIn': 0.16, 'out': 4.95, 'draw': NODRAW}, 'pool')
PATCH = [([[352, 1192], [646, 1192], [628, 1400], [250, 1400]], 4.70), ([[664, 1192], [966, 1192], [1040, 1400], [648, 1400]], 4.78),
         ([[240, 1428], [626, 1428], [600, 1990], [40, 1990]], 4.86), ([[646, 1428], [1050, 1428], [1130, 1990], [620, 1990]], 4.94)]
for pts, t in PATCH:
    add({'t': 'line', 'pts': pts, 'closed': True, 'fill': 'cold', 'draw': NODRAW, 'in': t})
add({'t': 'ellipse', 'cx': 230, 'cy': 1322, 'rx': 150, 'ry': 58, 'fill': 'paper', 'draw': NODRAW, 'in': 4.90})
# notebook + pencil (bottom left)
add({'t': 'line', 'pts': [[-40, 1600], [330, 1578], [352, 1990], [-40, 1990]], 'closed': True, 'fill': 'paper', 'fillIn': 0.20})
for y in [1660, 1720, 1780]:
    add({'t': 'line', 'pts': [[10, y], [300, y - 14]]})
add({'t': 'line', 'pts': [[60, 1960], [360, 1700]]})
# the old taped laptop in the lamp pool
add({'t': 'rect', 'x': 70, 'y': 1098, 'w': 262, 'h': 184, 'fill': 'paper', 'fillIn': 0.18})
add({'t': 'rect', 'x': 86, 'y': 1114, 'w': 230, 'h': 152, 'fill': 'dark', 'fillIn': 0.18})
add({'t': 'line', 'pts': [[60, 1282], [342, 1282], [366, 1346], [36, 1346]], 'closed': True, 'fill': 'paper', 'fillIn': 0.18})
add({'t': 'line', 'pts': [[56, 1300], [150, 1262], [160, 1280], [68, 1318]], 'closed': True, 'fill': 'paper', 'fillIn': 0.20})  # hinge tape
add({'t': 'line', 'pts': [[150, 1262], [176, 1240], [160, 1280]], 'closed': True, 'fill': 'paper', 'in': 0.70, 'out': 0.84})  # tape corner flips
for k in range(3):  # 'centers': its black screen mirrors the LED rows
    add({'t': 'rect', 'x': 110, 'y': 1140 + 34 * k, 'w': 182, 'h': 10, 'fill': 'paper', 'draw': NODRAW, 'in': round(4.78 + 0.04 * k, 2)})
# desk lamp (the arm is still drawing on frame 0)
add({'t': 'ellipse', 'cx': 404, 'cy': 1238, 'rx': 46, 'ry': 12, 'fill': 'dark', 'fillIn': 0.15})
add({'t': 'line', 'pts': [[404, 1234], [446, 1068], [372, 1006]], 'draw': [-0.04, 0.16]})
add({'t': 'line', 'pts': [[262, 1048], [350, 974], [392, 1018], [300, 1104]], 'closed': True, 'fill': 'dark', 'fillIn': 0.15})
# mug + steam
add({'t': 'ellipse', 'cx': 1022, 'cy': 1276, 'rx': 26, 'ry': 32})
add({'t': 'rect', 'x': 912, 'y': 1214, 'w': 100, 'h': 122, 'fill': 'paper', 'fillIn': 0.12})
add({'t': 'line', 'pts': [[914, 1262], [1010, 1262]]})
s1 = add({'t': 'line', 'pts': [[948, 1204], [938, 1176], [954, 1148], [942, 1118]], 'draw': [0.82, 0.28]})
s2 = add({'t': 'line', 'pts': [[976, 1204], [986, 1172], [970, 1146], [982, 1112]], 'draw': [1.10, 0.3]})
add({'t': 'line', 'pts': [[962, 1200], [950, 1170], [930, 1150], [900, 1140]], 'draw': [5.30, 0.2]})  # bends to the glass
for k in range(9):
    mv([s1, s2], 5 if k % 2 == 0 else -5, 0, 1.1 + 0.5 * k, 0.5)

# ------------------------------------------------------------------ PHONE, HAND, TAG (f 1.15)
phone = []
P = lambda e, name=None: phone.append(add(dict(e, f=PH), name)) or phone[-1]
P({'t': 'rect', 'x': 470, 'y': 1065, 'w': 420, 'h': 920, 'fill': 'dark', 'fillIn': 0.05})
P({'t': 'rect', 'x': 490, 'y': 1088, 'w': 380, 'h': 900, 'fill': 'paper', 'fillIn': 0.06})
P({'t': 'line', 'pts': [[640, 1106], [720, 1106]]})
P({'t': 'text', 'x': 584, 'y': 1156, 'text': '< Laptops', 'size': 34})
P({'t': 'line', 'pts': [[772, 1126], [786, 1126], [796, 1158], [830, 1158], [838, 1136], [790, 1136]]})  # cart
P({'t': 'ellipse', 'cx': 836, 'cy': 1118, 'rx': 20, 'ry': 20, 'fill': 'pop', 'in': 0.05, 'label': '1'})
P({'t': 'rect', 'x': 512, 'y': 1172, 'w': 336, 'h': 172})  # listing card
P({'t': 'rect', 'x': 600, 'y': 1192, 'w': 160, 'h': 102, 'fill': 'warm', 'fillIn': 0.07})  # the new laptop
P({'t': 'line', 'pts': [[582, 1300], [778, 1300], [766, 1316], [594, 1316]], 'closed': True})
P({'t': 'line', 'pts': [[792, 1196], [792, 1224], [792, 1210], [778, 1210], [806, 1210]], 'in': 0.56})  # sparkles
P({'t': 'line', 'pts': [[562, 1270], [562, 1294], [562, 1282], [550, 1282], [574, 1282]], 'in': 0.62})
P({'t': 'line', 'pts': [[522, 1364], [612, 1364]]})
P({'t': 'line', 'pts': [[522, 1384], [584, 1384]]})
P({'t': 'rect', 'x': 525, 'y': 1396, 'w': 315, 'h': 80, 'fill': 'pop', 'fillIn': 0.03})  # 'Add to cart'
P({'t': 'text', 'x': 652, 'y': 1450, 'text': 'Add to cart', 'size': 44})
for y in [1516, 1546, 1590, 1620]:
    P({'t': 'line', 'pts': [[522, y], [840 - (y % 7) * 12, y]]})
P({'t': 'rect', 'x': 470, 'y': 1065, 'w': 420, 'h': 14, 'fill': 'cold', 'draw': NODRAW, 'in': 5.10})  # cold shade, window side
for cy in [1600, 1662, 1724]:
    P({'t': 'ellipse', 'cx': 468, 'cy': cy, 'rx': 34, 'ry': 27, 'fill': 'warm', 'fillIn': 0.08})
thumb = P({'t': 'line', 'pts': [[1130, 1990], [1130, 1700], [990, 1586], [884, 1470], [838, 1418], [808, 1404], [788, 1428], [796, 1468],
                                  [880, 1600], [930, 1990]], 'closed': True, 'fill': 'warm', 'fillIn': 0.08})
nail = P({'t': 'ellipse', 'cx': 814, 'cy': 1428, 'rx': 15, 'ry': 17})
P({'t': 'ellipse', 'cx': 812, 'cy': 1432, 'rx': 40, 'ry': 34, 'draw': [-0.04, 0.12], 'out': 0.28})  # press rings ripple out
P({'t': 'ellipse', 'cx': 812, 'cy': 1432, 'rx': 64, 'ry': 54, 'draw': [0.10, 0.12], 'out': 0.36})
mv([thumb, nail], 10, 22, 0.36, 0.12)  # the thumb lifts off
tag = []
T = lambda e: tag.append(P(e)) or tag[-1]
T({'t': 'line', 'pts': [[442, 1234], [514, 1206]], 'draw': [-0.03, 0.12]})  # string to the listing
T({'t': 'line', 'pts': [[412, 1222], [472, 1222], [492, 1246], [492, 1352], [392, 1352], [392, 1246]], 'closed': True, 'fill': 'paper', 'fillIn': 0.14})
T({'t': 'ellipse', 'cx': 442, 'cy': 1240, 'rx': 7, 'ry': 7})
T({'t': 'text', 'x': 442, 'y': 1298, 'text': '$$', 'size': 50})
for k, t in enumerate(LIFT + [5.22]):  # a pencil tick per floor; the last on 'are.'
    T({'t': 'line', 'pts': [[404 + 7 * k, 1236], [404 + 7 * k, 1254]], 'in': t})
T({'t': 'line', 'pts': [[402, 1282], [482, 1288]], 'in': 2.55})  # struck
T({'t': 'rect', 'x': 398, 'y': 1304, 'w': 88, 'h': 42, 'fill': 'pop', 'in': 2.55})  # stamped
T({'t': 'text', 'x': 442, 'y': 1338, 'text': '$$$', 'size': 40, 'in': 2.55})
T({'t': 'arrow', 'x1': 374, 'y1': 1256, 'x2': 374, 'y2': 1316, 'draw': [0.60, 0.14], 'out': 1.62})  # the old deal: down
T({'t': 'arrow', 'x1': 374, 'y1': 1316, 'x2': 374, 'y2': 1256, 'draw': [1.63, 0.08]})  # 'AI's': it flips up
# tag motion: the tap's jolt and swing, a jolt per floor, the drop on 'pricier', a shudder, the pull to the window
mv(tag, -12, 0, 0.40, 0.08); mv(tag, 16, 0, 0.48, 0.26); mv(tag, -6, 0, 0.74, 0.3); mv(tag, 2, 0, 1.04, 0.3)
for t in LIFT:
    mv(tag, 4, 3, t, 0.04); mv(tag, -4, -3, t + 0.04, 0.1)
mv(tag, 0, 12, 2.56, 0.05); mv(tag, -10, 0, 2.61, 0.2); mv(tag, 14, 0, 2.81, 0.3); mv(tag, -4, 0, 3.11, 0.4)
for t in [2.85, 3.00]:
    mv(tag, 3, 2, t, 0.04); mv(tag, -3, -2, t + 0.04, 0.1)
mv(tag, -12, 0, 5.24, 0.3)
mv(phone, 0, 140, 4.90, 0.9)  # the viewer lowers the phone and looks up

# ------------------------------------------------------------------ text-layer highlights (f 0 = screen space)
HL = [((538, 236, 266, 86), 2.55, 3.37),   # PRICIER in the frame-0 claim, on the payoff word; leaves with the claim
      ((502, 398, 90, 98), 4.04, 4.76),    # caption 'AI'  (page 'Well, AI data')
      ((597, 398, 169, 98), 4.44, 4.76),   # caption 'data'
      ((313, 398, 292, 98), 4.80, None)]   # caption 'centers' (page 'centers are.')
for (x, y, w, h), a, b in HL:
    e = {'t': 'rect', 'x': x, 'y': y, 'w': w, 'h': h, 'fill': 'warm', 'draw': NODRAW, 'in': a, 'f': 0}
    if b:
        e['out'] = b
    add(e)

O1 = {
    'id': 'O1', 's': 0, 'e': 5.8,
    'note': "OPENING, one shot: your tap makes the nook; the toy data center outgrows the window on 'pricier'",
    'transition': {'type': 'cut', 'label': 'frame 0 · bare lines (the loop lands here)'},
    'camera': {'from': {'x': 545, 'y': 943, 'z': 1.05}, 'to': {'x': 540, 'y': 960, 'z': 1}, 'ease': 'inQuad'},
    'els': els, 'moves': moves,
}

# ------------------------------------------------------------------ LOOP: O1's frame 0 as bare lines
LOOP_S, END = 40.85, d['durationSec']
FPS = 30
wrap = (int(-(-END * FPS // 1)) / FPS) - LOOP_S  # LOOP-local time that equals O1's t = 0 on the rewatch
loop_els = []
for e in els:
    if 'in' in e:
        continue
    if e.get('draw') == NODRAW:
        continue
    le = {k: v for k, v in e.items() if k not in ('fill', 'fillIn', 'out', 'label')}
    if 'draw' in e:
        a, dur = e['draw']
        if a >= 0:
            continue  # not yet on frame 0
        le['draw'] = [round(a + wrap, 3), dur]  # the last strokes draw on across the loop point
    loop_els.append(le)
LOOP = {
    'id': 'LOOP', 's': LOOP_S, 'e': END,
    'note': "LOOP: colour drains back to frame 0's bare lines",
    'transition': {'type': 'dissolve', 'label': "colour drains to bare lines (frame 0)", 'dur': 0.2},
    'camera': {'from': O1['camera']['from'], 'to': O1['camera']['to'], 'ease': 'inQuad', 'start': END + 1, 'end': END + 2},
    'els': loop_els,
}

shots = [s for s in d['shots'] if s['id'] not in ('S1', 'S2', 'S3', 'O1', 'LOOP')]
for s in shots:
    if s['id'] == 'S4':
        s['transition'] = {'type': 'cut', 'label': "cut-in on 'Which': the viewer looks up at the fogging pane"}
    if s['id'] == 'S16':
        s['e'] = LOOP_S
        s['transition']['label'] = "hard cut on 'next' · out: colour drains to frame 0 (LOOP)"
        s['note'] = "On 'laptop's price tag' the tag turns over: an AI data center on its back. Hold, then LOOP."
d['shots'] = [O1] + shots + [LOOP]
d['label'] = 'v3 G3 animatic v3 (opening O1)'
# tiling check
prev = 0
for s in d['shots']:
    assert abs(s['s'] - prev) < 1e-9, (s['id'], s['s'], prev)
    prev = s['e']
assert abs(prev - END) < 1e-9
json.dump(d, open(DST, 'w'))
print('O1 els', len(els), 'moves', len(moves), 'LOOP els', len(loop_els), 'wrap', round(wrap, 4))
