"""build_selftest.py: the shared G3 kit's self-test board (public/g3kit/selftest.json, 8 s, two panels of one set
joined by a continuous camera): every tier-1 delta on screen at once, so a render shows the kit works.

  python3 -I scripts/g3/build_selftest.py && python3 -I scripts/g3/board_lint.py public/g3kit/selftest.json
  node scripts/render-frames.mjs G3KitTest out/g3kit 0.5,1.9,3.4,5.2,7.5 --entry=src/entry-g3kit.tsx --scale=0.5

What it shows: tiers A / B / C at their grey weights; planes -1 ... +3 as grey steps; the rig (key left: every auto
shadow falls right; one shadow value; a window pool); the ground's lines to the VP; a dress layer; the ambient kit
(snow, steam thickening then stopping, a window grid lighting in a wave and one window cycling, a cloud, birds, water
in a channel); a ferry's looping set move; a pipe drawn on with a pen tip, its water front and flow, un-drawn in panel
2; the pose test with one smear; a multi-key camera push with a peak, continued across the join.
"""
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import g3kit as k  # noqa: E402

VIDEO = os.path.join(HERE, '..', '..')
OUT = os.path.join(VIDEO, 'public', 'g3kit', 'selftest.json')

RUN = [[-40, 1520], [300, 1520], [470, 1520], [470, 1330], [520, 1330]]   # the pipe: under the street, up the block's wall
DUR = 10.2   # public/g3demo/silence.wav

set_els = [
    k.rect(-60, -60, 1200, 760, 'paper', tier='C', negative=True, id='sky', name='the sky (a quiet field)'),
    k.ambient('cloud', x=-200, y=90, w=1480, h=150, rw=320, rh=110, speed=14, tier='C', plane=3, id='cloud', life='clouds'),
    k.rect(-60, 1000, 1200, 130, 'light', tier='C', plane=3, id='far', name='far city', promise='far city roofs, lights tone-on-tone'),
    k.rect(-60, 1130, 1200, 60, 'light', tier='C', plane=2, id='harbour', name='harbour'),
    k.rect(-200, 1140, 120, 30, 'paper', tier='B', plane=2, id='ferry', life='ferry', promise='the ferry crossing'),
    k.rect(-60, 1190, 1200, 220, 'light', tier='C', id='street', name='the snowy street'),
    k.ground(-40, 1120, 1190, 1410, n=7, tier='C', id='street-lines'),
    k.rect(-60, 1410, 1200, 300, 'light', tier='C', plane=-1, id='cut', name='the cut ground'),
    k.dress(640, 1430, 400, 220, id='dress-cut', promise='cut earth texture'),
    k.rect(380, 700, 420, 490, 'light', tier='B', id='block', name='the block'),
    k.ambient('window', x=400, y=720, w=380, h=380, cols=4, rows=4, pane=[46, 56], wave=[0.6, 2.6], tier='B', id='blocklights',
              life='block windows'),
    k.rect(860, 760, 260, 430, 'light', tier='C', plane=1, id='block2', shadow=True, name='the next block'),
    k.rect(560, 960, 80, 96, 'paper', tier='B', id='window', name='the one window'),
    k.pool(600, 1205, 120, 22, id='spill', name='window spill'),
    k.pipe(RUN, bore=24, tier='A', thread=True, id='pipe', draw=[0.2, 1.4], tip=True, water=[[1.0, 0], [3.4, 1]], flow=70,
           undraw=[8.4, 1.3], name='the warm run'),
    k.ambient('snow', x=-40, y=700, w=1160, h=720, n=36, r=5, speed=55, tier='C', id='snow', life='snow'),
]

# K1: the pipe is the subject (a line: tier A); the computer and the window are supporting (B)
p1 = k.Panel('K1', 0.0, 4.0, note='WIDE, the home view · SET street\ntiers, planes, rig, ambient kit, pipe drawn on', set='street',
             type='WIDE', home=True, life=['snow', 'ferry', 'block windows', 'steam', 'clouds'], movers=3,
             comp={'frame': 'T', 'move': 'RM4', 'join': 'RJ4'})
p1.add(k.icon('server', 110, 900, 190, tier='B', shadow=True), 'computer')
p1.add(k.ambient('steam', x=205, y=900, w=160, h=160, rate=3, tier='B', level=[[0, 0.3], [1.5, 0.3], [2.3, 1.0]], life='steam'), 'steam')
p1.poses('walker', [(0.0, 'walk', 820, 1330), (1.1, 'stand', 760, 1330), (2.2, 'point', 760, 1330)], x=820, y=1330, h=170,
         facing='l', tier='B', smear=[(1.0, 3, 790, 1330)], shadow=True)
p1.cam_keys([k.key(0.0, 540, 960, 1.0), k.key(1.5, 540, 960, 1.0),
             k.key(3.6, 560, 1000, 1.2, peak=2.1, ease=None, word='PUSH IN', anchor='the one window', pivot=[600, 1008])])

# K2: the 2027 tag is the subject; the pipe (off its beat) is B until the pen lifts it
p2 = k.Panel('K2', 4.0, DUR, note='MEDIUM on the window · SET street\nthe tag; birds; the pen un-draws the run', set='street',
             type='MEDIUM', life=['snow', 'ferry', 'block windows', 'birds', 'clouds'], tiers={'pipe': 'B'},
             comp={'frame': 'E2', 'move': 'RM7', 'join': 'RJ4'})
p2.add(k.ambient('bird', x=-40, y=760, w=1160, h=120, n=3, speed=90, tier='C', plane=1, life='birds'), 'birds')
p2.add(k.text(600, 1300, '2027', size=120, tier='A', **{'in': 1.2, 'enter': 'grow'}), 'tag')
p2.cam_keys([k.key(4.0, 560, 1000, 1.2, word='HOLD', anchor='the one window')])

data = k.animatic('g3kit', 'G3 kit self-test', 'g3demo/silence.wav', [
    {'w': 'The', 's': 0.12, 'e': 0.3}, {'w': 'kit', 's': 0.3, 'e': 0.6}, {'w': 'self-test.', 's': 0.6, 'e': 1.2},
    {'w': 'Tiers,', 's': 1.6, 'e': 2.0}, {'w': 'planes,', 's': 2.0, 'e': 2.4}, {'w': 'rig.', 's': 2.4, 'e': 2.9},
    {'w': 'Then', 's': 4.0, 'e': 4.3}, {'w': 'the', 's': 4.3, 'e': 4.4}, {'w': 'tag.', 's': 4.4, 'e': 4.9},
    {'w': 'The', 's': 8.4, 'e': 8.6}, {'w': 'pen', 's': 8.6, 'e': 8.9}, {'w': 'lifts.', 's': 8.9, 'e': 9.5},
], [
    p1.shot(transition=k.join('B', 'thread-match', what='the pipe at frame 0')),
    p2.shot(transition=k.join('C', 'continuous', what='the push on the window')),
], DUR,
    sets={'street': {'name': 'the street (home view)', 'els': set_els,
                     'moves': [{'el': 'ferry', 'dx': 1400, 'dy': 0, 'at': 0, 'dur': 16, 'loop': True, 'ease': 'linear'}],
                     'rig': {'key': 'left', 'source': 'the low sun, left', 'shadow': 'mid', 'pools': ['window spill']},
                     'planes': [{'n': -1, 'name': 'the cut ground'}, {'n': 0, 'name': 'street + block'}, {'n': 1, 'name': 'the next block'},
                                {'n': 2, 'name': 'harbour'}, {'n': 3, 'name': 'far city + sky'}],
                     'vp': {'y': 1010, 'x': 600}}},
    throughline={'thread': 'the heat: warm water in the pipe', 'home': 'the one window'},
    loopJoin=k.join('B', 'thread-match', what='the pipe at frame 0'))

os.makedirs(os.path.dirname(OUT), exist_ok=True)
k.write(OUT, data)
print('wrote', os.path.relpath(OUT, VIDEO))
