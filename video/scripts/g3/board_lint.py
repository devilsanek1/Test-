"""board_lint.py: the shared G3 board lint (docs/G3_ANIMATIC.md §5 step 6, §6, §7 tier 1; STORYBOARD_STYLE.md §6;
CRAFT.md §a). Run it before every render of a G3 reel drawn by the shared kit (src/lib/g3/):

  python3 -I scripts/g3/board_lint.py public/v4/animatic.json            # owner-facing rules (a draft JSON relaxes them)
  python3 -I scripts/g3/board_lint.py public/v4/animatic.json --draft    # an internal interim draft
  python3 -I scripts/g3/board_lint.py public/v4/animatic.json -v --json out/v4/lint.json

ERROR = FAIL (exit 1): the board does not show its signal (CRAFT's intro: completeness checks keep their FAIL) or breaks a
house FAIL. WARN = a number from two films or a fuzzy read: resolve it at the 1x watch or declare the exception. TODO = a
placeholder panel's missing signal in a draft (the skeleton's to-do list). INFO = what was measured.

Per panel (a SET PANEL is a shot with `set`):
  - a tier per element (A / B / C; a dress element is C) [ERROR]
  - the five values per camera move: word, duration, start / end (keys), anchor, ease or peak [ERROR]; eases in AND out
    [WARN]; the zoom within a panel at most 2x [ERROR] (over 1.6x [WARN])
  - the speed budget: peak on-screen px/frame (camera + own moves + ambient life) vs ~15 px/frame at the render rate,
    over moves lasting >= 2 frames (snap() / pops exempt); whip / carry joins exempt, linted for direction + speed
    match instead [WARN]
  - set panel: the set's rig (key side, the one shadow value) [ERROR], planes and vp [ERROR], 2-3 ambient moves (zero
    [ERROR], one or over three [WARN]; more than one periodic prop [WARN]), the ground's lines to the VP [WARN], a pool
    when the rig names pools [WARN], a dress layer on a home-base or wide panel [WARN]
  - `life:` coverage: one placeholder element per life item [ERROR]; a placeholder naming an item not in the list [WARN]
  - the emptiness check (G3_ANIMATIC §6, at the panel's resting end frame): 6 x 10 grid, the caption band, notes strip,
    `negative` zones, the subject's 80 px ring and the 120 px edge margins exempt; >= 4 contiguous undeclared cells each
    >= 97 % paper [ERROR]; over ~55 % bare stage on a set panel [WARN]. Geometric (from the element shapes), so it
    reads a filled shape, a scribble, a dress mass, an icon, a figure, a window grid, a pipe as covering; lines don't
  - the mover budget: a declared `movers` over 4, or over 4 noticeable (> 0.3 % of the frame) non-A movers at once,
    falling weather aside [WARN]
  - v3's house rules (STORYBOARD_STYLE §6): elements <= 25 (dress exempt; over 30 [ERROR]), one subject group (tier A)
    [ERROR], its staging (x 380-700, 270-460 px wide; tall by height; charts; a scale panel BIG) [ERROR / WARN; line
    and pipe subjects exempt], at most 1 label and 1 mark [ERROR], 1 number [WARN], text >= 48 px [ERROR], fills from
    the board palette [ERROR], nothing across the caption band (y 290-600) but a flat tier-C / far fill or a declared
    negative field, checked at the panel's start, middle, end and every camera key [ERROR]
  - red marks: case (1) a planned move not animated, (3) an un-animated path arrow FAIL on an owner-facing board
    [ERROR; draft WARN]; case (2) out within 0.4 s [WARN]
  - a placeholder panel [ERROR on an owner-facing board; draft: its completeness checks become TODO]
Film:
  - shots tile the voice (0 to durationSec, no gaps or overlaps) [ERROR]; the voice file's length [WARN]
  - a carrier letter per join [ERROR] and at most 2 plain cuts (F) [ERROR]; each F on a "But" turn, the thread on both
    sides, >= 20 % size or a declared >= 30 deg angle [WARN]; device vs carrier [WARN]; a dissolve / dip / flash only as
    the declared time-passing exception [ERROR], 0.2-2 s [WARN]; the loop's join declared [WARN]
  - per-device checks: B thread-match (the declared `match` boxes within +-8 % spot, +-20 % size at the join) [WARN],
    A push-through (`subframe` 15-30 % of the frame) [WARN], C continuous (the camera continuous across the join when
    both panels share the set's world; else a declared `match`) [WARN]
  - each join's midpoint on a word's start (+-0.05 s) that begins a sentence [WARN]; nothing entering, popping or
    starting a move in the 0.4 s round a join but the carrier [WARN]
  - thread coverage >= 80 % with no gap over 3 s, counted outside the declared scale reveal and fairness stretch [ERROR]
  - pacing: shots average >= 3.5 s; three near-equal (within 10 % of their mean) in a row [WARN]
  - sfx: each cue a `type` and an `event` (SOUND_SYNC §4, the sync check list item 1) [WARN]
  - the camera-plan cross-check against docs/<film>/camera_plan_g3.md when it exists: every plan row's shot exists
    [ERROR], its carrier = the board's [ERROR], its move words, tier letters, rig key side and life items in the board
    [WARN] (a tolerant markdown-table read; a cell it cannot read is INFO)
Figure boxes come from POSES / SMEAR in src/lib/g3/figure.ts and icon sizes from ICON_ASPECT in src/lib/g3/SketchIcons.tsx
(both parsed, so they stay in step). The clock math mirrors src/lib/g3/motion.ts (eases, the peaked ease, geometric zoom,
the pivot, moves in list order, loops).
"""
import argparse
import ast
import json
import math
import os
import re
import sys

W, H = 1080, 1920
BAND = (290, 600)
STAGE_BOTTOM = 1680
STAGE_X = (380, 700)
SUBJECT_W = (270, 460)
SCALE_MIN_W = 0.6 * W
CHART_W = (456, 760)
TALL_H = (300, 650)
TOUCH = 40
PALETTE = {'paper', 'light', 'mid', 'dark', 'pop'}
LEGACY = {'warm', 'cold'}
YEAR = re.compile(r'(19|20)\d\d')
SPEED_LIMIT = 15.0          # px per frame at the render rate (PIPELINE_V2 "Frame rate")
NOTICEABLE = 0.003 * W * H  # a mover over 0.3 % of the frame (CRAFT §b)
CARRIERS = set('ABCDEF')
DEVICE_CARRIER = {
    'push-through': 'A', 'pull-back': 'A', 'thread-match': 'B', 'match-cut': 'B', 'match-zoom': 'B', 'morph': 'B',
    'continuous': 'C', 'object-carry': 'D', 'wipe': 'D', 'whip': 'D', 'carry': 'D', 'card-flip': 'E', 'swipe': 'E',
    'plain-cut': 'F', 'cut-on-action': 'F',
}
EXCEPTIONS = {'dissolve', 'dip', 'flash'}
MOVE_WORDS = ['PUSH IN', 'PUSH OUT', 'PULL BACK', 'PULL OUT', 'PAN L', 'PAN R', 'PAN LEFT', 'PAN RIGHT', 'RISE', 'TILT UP',
              'TILT DOWN', 'FOLLOW', 'DIVE', 'CRANE', 'DOLLY', 'HOLD', 'TRACK', 'BOOM']
MOVE_SYNONYMS = [{'PULL BACK', 'PULL OUT', 'PUSH OUT'}, {'PAN L', 'PAN LEFT'}, {'PAN R', 'PAN RIGHT'}, {'PUSH IN', 'DOLLY'}]
VIDEO = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
KIT = os.path.join(VIDEO, 'src', 'lib', 'g3')


# ------------------------------------------------------------------------------------------------ tables from the kit
def js_literal(text):
    """a plain JS object literal (unquoted keys, numbers, arrays, true/false) -> Python"""
    text = re.sub(r'//[^\n]*', '', text)
    text = re.sub(r'([{,]\s*)([A-Za-z_]\w*)\s*:', r'\1"\2":', text)
    text = re.sub(r'\btrue\b', 'True', re.sub(r'\bfalse\b', 'False', text))
    return ast.literal_eval(text)


def load_tables():
    with open(os.path.join(KIT, 'SketchIcons.tsx')) as f:
        icons = f.read()
    m = re.search(r'ICON_ASPECT: Record<IconName, number> = (\{.*?\});', icons, re.S)
    aspect = js_literal(m.group(1)) if m else {}
    with open(os.path.join(KIT, 'figure.ts')) as f:
        fig = f.read()
    m = re.search(r'export const POSES: Record<string, PoseDef> = (\{.*?\n\});', fig, re.S)
    poses = js_literal(m.group(1)) if m else {}
    m = re.search(r'export const SMEAR = (\{[^}]*\});', fig)
    smear = js_literal(m.group(1)) if m else {'sx': 1.7, 'sy': 0.94, 'skew': 12, 'lead': 0.2, 'trail': 0.55}
    return aspect, poses, smear


ASPECT, POSES, SMEAR = load_tables()


# ------------------------------------------------------------------------------------------------ the clock (motion.ts)
def _bezier(x1, y1, x2, y2):
    def f(x):
        lo, hi = 0.0, 1.0
        for _ in range(40):
            m = (lo + hi) / 2
            bx = 3 * (1 - m) ** 2 * m * x1 + 3 * (1 - m) * m * m * x2 + m ** 3
            lo, hi = (m, hi) if bx < x else (lo, m)
        m = (lo + hi) / 2
        return 3 * (1 - m) ** 2 * m * y1 + 3 * (1 - m) * m * m * y2 + m ** 3
    return f


def _trapezoid(a, d):
    v = 1 / (1 - a / 2 - d / 2)
    return lambda u: v * u * u / (2 * a) if u < a else v * (u - a / 2) if u <= 1 - d else 1 - v * (1 - u) ** 2 / (2 * d)


EASES = {
    'inout': lambda x: -(math.cos(math.pi * x) - 1) / 2, 'out': lambda x: 1 - (1 - x) ** 3, 'in': lambda x: x ** 3,
    'linear': lambda x: x, 'unveil': _trapezoid(0.1, 0.6), 'inQuad': lambda x: x * x,
    'outSine': lambda x: math.sin(x * math.pi / 2),
}


def ease_fn(e):
    return _bezier(*e) if isinstance(e, list) else EASES.get(e or 'inout', EASES['inout'])


def eases_both(e, peak=None):
    """does the ease start AND end still? (G3_ANIMATIC §4: every move eases in and out)"""
    if peak is not None:
        return True
    if e is None or e in ('inout', 'unveil'):
        return True
    if isinstance(e, list) and len(e) == 4:
        x1, y1, x2, y2 = e
        s0 = y1 / x1 if x1 > 1e-6 else (0 if y1 <= 1e-6 else 99)
        s1 = (1 - y2) / (1 - x2) if (1 - x2) > 1e-6 else (0 if (1 - y2) <= 1e-6 else 99)
        return s0 < 0.5 and s1 < 0.5
    return False


def peaked(t, t0, t1, tp):
    if t <= t0:
        return 0.0
    if t >= t1:
        return 1.0
    T = t1 - t0
    p = max(t0 + T * 0.02, min(t1 - T * 0.02, tp))
    up = (p - t0) / T
    if t < p:
        return up * (1 - math.cos(math.pi / 2 * ((t - t0) / (p - t0))))
    return up + (1 - up) * math.sin(math.pi / 2 * ((t - p) / (t1 - p)))


def progress(t, t0, t1, ease=None, peak=None):
    if t1 <= t0:
        return 1.0 if t >= t0 else 0.0
    if peak is not None:
        return peaked(t, t0, t1, peak)
    return ease_fn(ease)(min(1.0, max(0.0, (t - t0) / (t1 - t0))))


def cam_keys(cam, shot):
    if cam.get('keys'):
        return sorted(cam['keys'], key=lambda k: k['t'])
    frm = cam.get('from') or cam.get('to') or {'x': 540, 'y': 960, 'z': 1}
    to = cam.get('to') or frm
    s0 = cam.get('start', shot['s'])
    k0 = dict(frm, t=s0)
    k1 = dict(to, t=max(s0 + 0.01, cam.get('end', shot['e'])))
    for a in ('ease', 'peak', 'word', 'anchor', 'pivot'):
        if cam.get(a) is not None:
            k1[a] = cam[a]
    return [k0, k1]


def cam_at(keys, t):
    if not keys:
        return {'x': W / 2, 'y': H / 2, 'z': 1.0}
    if t <= keys[0]['t']:
        return {'x': keys[0]['x'], 'y': keys[0]['y'], 'z': keys[0]['z']}
    if t >= keys[-1]['t']:
        return {'x': keys[-1]['x'], 'y': keys[-1]['y'], 'z': keys[-1]['z']}
    i = 0
    while i < len(keys) - 2 and t >= keys[i + 1]['t']:
        i += 1
    a, b = keys[i], keys[i + 1]
    u = progress(t, a['t'], b['t'], b.get('ease'), b.get('peak'))
    z = a['z'] * (b['z'] / a['z']) ** u
    if b.get('pivot'):
        px, py = b['pivot']
        s0 = ((px - a['x']) * a['z'], (py - a['y']) * a['z'])
        s1 = ((px - b['x']) * b['z'], (py - b['y']) * b['z'])
        sx = s0[0] + (s1[0] - s0[0]) * u
        sy = s0[1] + (s1[1] - s0[1]) * u
        return {'x': px - sx / z, 'y': py - sy / z, 'z': z}
    return {'x': a['x'] + (b['x'] - a['x']) * u, 'y': a['y'] + (b['y'] - a['y']) * u, 'z': z}


def to_screen_pt(c, p):
    return ((p[0] - c['x']) * c['z'] + W / 2, (p[1] - c['y']) * c['z'] + H / 2)


def to_world_pt(c, p):
    return ((p[0] - W / 2) / c['z'] + c['x'], (p[1] - H / 2) / c['z'] + c['y'])


def to_screen(b, c):
    x0, y0 = to_screen_pt(c, (b[0], b[1]))
    x1, y1 = to_screen_pt(c, (b[2], b[3]))
    return x0, y0, x1, y1


def move_u(m, local):
    l = local
    if m.get('loop'):
        P = max(1e-3, m['dur'] + m.get('gap', 0))
        l = m['at'] + (((local - m['at']) % P) + P) % P
    return progress(l, m['at'], m['at'] + m['dur'], m.get('ease'), m.get('peak'))


def move_point(p, moves, T):
    """a world point through the element's moves at film time T (moves = [(move, base)], applied in list order)"""
    x, y = p
    for m, base in moves:
        u = move_u(m, T - base)
        s = m.get('s', 1)
        if s is not None and s != 1:
            S = 1 + (s - 1) * u if m.get('lin') else s ** u
            ox, oy = m.get('o', [0, 0])
            x = ox + m['dx'] * u + S * (x - ox)
            y = oy + m['dy'] * u + S * (y - oy)
        else:
            x += m['dx'] * u
            y += m['dy'] * u
    return x, y


def move_affine(moves, T):
    """the moves' total transform as (S, tx, ty): p -> S p + t (uniform scale and translation only)"""
    p0 = move_point((0.0, 0.0), moves, T)
    p1 = move_point((1.0, 0.0), moves, T)
    return p1[0] - p0[0], p0[0], p0[1]


def keyed(keys, local, dflt):
    if not keys:
        return dflt
    k = sorted(keys, key=lambda a: a[0])
    if local <= k[0][0]:
        return k[0][1]
    for i in range(len(k) - 1):
        if local < k[i + 1][0]:
            f = (local - k[i][0]) / max(1e-6, k[i + 1][0] - k[i][0])
            return k[i][1] + (k[i + 1][1] - k[i][1]) * f
    return k[-1][1]


def draw_progress(el, c):
    u = 1.0
    d = el.get('draw')
    if d:
        u = progress(c, d[0], d[0] + max(0.01, d[1]), d[2] if len(d) > 2 else 'linear')
    ud = el.get('undraw')
    if ud:
        u *= 1 - progress(c, ud[0], ud[0] + max(0.01, ud[1]), ud[2] if len(ud) > 2 else 'linear')
    return u


# ------------------------------------------------------------------------------------------------ elements
def tier_of(el, overrides=None):
    if el.get('id') and overrides and el['id'] in overrides:
        return overrides[el['id']]
    if el.get('tier'):
        return el['tier']
    if el.get('role') == 'dress':
        return 'C'
    if el.get('fill') == 'pop':
        return 'A'
    return None


def v3_role(el):
    r = el.get('role')
    if r and r != 'dress':
        return r
    if el.get('fill') == 'pop':
        return 'subject'
    f = el.get('f')
    return 'far' if f is not None and f < 0.5 else 'mid'


def is_subject(el, overrides):
    t = tier_of(el, overrides)
    return t == 'A' if t else v3_role(el) == 'subject'


def pts_box(pts):
    xs = [p[0] for p in pts]
    ys = [p[1] for p in pts]
    return min(xs), min(ys), max(xs), max(ys)


def figure_box(el):
    pose = POSES.get(el.get('pose', 'stand')) or POSES.get('stand')
    x, y, h = el['x'], el['y'], el['h']
    s = -1 if el.get('facing') == 'l' else 1
    us = [pose['H'][0] - 0.09, pose['H'][0] + 0.09, pose['S'][0] - 0.085, pose['S'][0] + 0.085]
    top = pose['H'][1] + 0.09
    for e, hand in pose['arms']:
        us += [e[0], hand[0] - 0.032, hand[0] + 0.032]
        top = max(top, e[1], hand[1] + 0.032)
    for kn, foot in pose['legs']:
        us += [kn[0], foot[0], foot[0] + 0.055]
    xs = [x + s * u * h for u in us]
    if el.get('pose') == 'smear':
        fx = x + s * SMEAR['lead'] * h
        xs = [fx + (v - fx) * SMEAR['sx'] for v in xs]
        xs += [x - s * (0.12 + SMEAR['trail']) * h * SMEAR['sx'], x + s * top * h * math.tan(math.radians(SMEAR['skew']))]
        top *= SMEAR['sy']
    return min(xs), y - top * h, max(xs), y


def box(el):
    """world bounding box (x0, y0, x1, y1) of an element before its moves (elements.tsx elBox)"""
    t = el.get('t')
    if t in ('rect', 'hatch', 'scribble'):
        return el['x'], el['y'], el['x'] + el['w'], el['y'] + el['h']
    if t in ('ellipse', 'pool'):
        return el['cx'] - el['rx'], el['cy'] - el['ry'], el['cx'] + el['rx'], el['cy'] + el['ry']
    if t == 'shade':
        if el.get('pts'):
            return pts_box(el['pts'])
        return el.get('cx', 0) - el.get('rx', 0), el.get('cy', 0) - el.get('ry', 0), el.get('cx', 0) + el.get('rx', 0), el.get('cy', 0) + el.get('ry', 0)
    if t == 'line':
        return pts_box(el['pts'])
    if t == 'pipe':
        b = pts_box(el['pts'])
        r = el.get('bore', 26) / 2 + 9
        return b[0] - r, b[1] - r, b[2] + r, b[3] + r
    if t == 'arrow' or (t == 'mark' and el.get('kind') == 'arrow'):
        return min(el['x1'], el['x2']), min(el['y1'], el['y2']), max(el['x1'], el['x2']), max(el['y1'], el['y2'])
    if t == 'figure':
        return figure_box(el)
    if t == 'text':
        size = el.get('size', 64)
        w = 0.5 * size * len(el.get('text', ''))
        return el['x'] - w / 2, el['y'] - 0.75 * size, el['x'] + w / 2, el['y'] + 0.2 * size
    if t == 'icon':
        h = el.get('h') or el['w'] * ASPECT.get(el.get('name'), 1)
        return el['x'], el['y'], el['x'] + el['w'], el['y'] + h
    if t == 'mark':
        x, y, w, h = el['x'], el['y'], el['w'], el['h']
        pad = {'circle': 22, 'underline': 14, 'frame': 12 + max(50, min(120, 0.18 * min(w, h))) * 0.71}.get(el.get('kind'), 0)
        if el.get('kind') == 'underline':
            return x - 8, y + h, x + w + 8, y + h + pad
        return x - pad, y - pad, x + w + pad, y + h + pad
    if t == 'ground':
        return min(el['x0'], el['x1']), el['y0'], max(el['x0'], el['x1']), el['y1']
    if t == 'ambient':
        kit = el.get('kit')
        if kit == 'water':
            return pts_box(el['pts'])
        if kit == 'steam':
            w = el.get('w', 160)
            return el['x'] - w / 2, el['y'] - el.get('h', 260), el['x'] + w / 2, el['y']
        return el['x'], el['y'], el['x'] + el['w'], el['y'] + el['h']
    return None


def label_of(it):
    el = it.el
    nm = el.get('id') or el.get('name')
    return f'{"set " if it.src == "set" else ""}el {nm if nm else it.idx}'


class Item:
    """one drawn element of a panel: the set's (film clock, base 0) or the panel's own (base = the shot's start)"""

    def __init__(self, el, src, idx, base):
        self.el, self.src, self.idx, self.base = el, src, idx, base
        self.moves = []  # [(move, base)]
        self.b = box(el)

    def clock(self, T):
        return T - self.base

    def window(self):
        """film-time window (in, out) on screen (None = open)"""
        i = self.el.get('in')
        o = self.el.get('out')
        return (None if i is None else self.base + i, None if o is None else self.base + o)

    def alive(self, T):
        el = self.el
        c = T - self.base
        if el.get('in') is not None and c < el['in']:
            return False
        if el.get('out') is not None and c >= el['out']:
            return False
        if el.get('draw') or el.get('undraw'):
            if tier_of(el) == 'C' and el.get('draw') and el.get('fillIn') is None and not el.get('undraw'):
                if c < el['draw'][0] + el['draw'][1]:
                    return False
            elif draw_progress(el, c) <= 0.0005:
                return False
        if el.get('t') == 'ambient' and el.get('kit') == 'steam':
            life = el.get('h', 260) / el.get('rise', 85)
            lv = [keyed(el.get('level'), c - a, 1) for a in (0, life * 0.25, life * 0.5, life * 0.75, life)]
            if max(lv) <= 0.001:
                return False
        return True

    def water(self, T):
        """a pipe's water segment length at T (its thread is its water)"""
        el = self.el
        c = T - self.base
        front = min(draw_progress(el, c), keyed(el.get('water'), c, 0))
        tail = keyed(el.get('drain'), c, 0)
        seg = front - tail
        p = el.get('pulse')
        if p and p[0] <= c <= p[0] + p[1]:
            seg = max(seg, p[2])
        return seg

    def world_box(self, T):
        if self.b is None:
            return None
        if not self.moves:
            return self.b
        x0, y0 = move_point((self.b[0], self.b[1]), self.moves, T)
        x1, y1 = move_point((self.b[2], self.b[3]), self.moves, T)
        return min(x0, x1), min(y0, y1), max(x0, x1), max(y0, y1)

    def screen_box(self, T, cam):
        b = self.world_box(T)
        return None if b is None else to_screen(b, cam)


def panel_items(shot, data):
    sets = data.get('sets') or {}
    st = sets.get(shot.get('set')) if shot.get('set') else None
    hidden = set(shot.get('hide') or [])
    items = []
    set_items = []
    if st and st.get('els') and not shot.get('ownWorld'):
        for j, el in enumerate(st['els']):
            if el.get('id') in hidden:
                continue
            it = Item(el, 'set', j, 0.0)
            items.append(it)
            set_items.append(it)
    own = [Item(el, 'shot', i, shot['s']) for i, el in enumerate(shot.get('els') or [])]
    items += own
    by_id = {}
    for it in set_items + own:  # the panel's ids win over the set's
        if it.el.get('id'):
            by_id[it.el['id']] = it
    own_ids = {it.el['id']: it for it in own if it.el.get('id')}
    set_ids = {it.el['id']: it for it in set_items if it.el.get('id')}
    for m in shot.get('moves') or []:
        ref = m['el']
        tgt = own[ref] if isinstance(ref, int) and 0 <= ref < len(own) else own_ids.get(ref) or set_ids.get(ref) if not isinstance(ref, int) else None
        if tgt:
            tgt.moves.append((m, shot['s']))
    for m in (st or {}).get('moves') or []:
        ref = m['el']
        tgt = None
        if isinstance(ref, int):
            tgt = next((it for it in set_items if it.idx == ref), None)
        else:
            tgt = set_ids.get(ref)
        if tgt:
            tgt.moves.append((m, 0.0))
    return items, st


# ------------------------------------------------------------------------------------------------ shape tests
def point_in_poly(x, y, pts):
    inside = False
    n = len(pts)
    j = n - 1
    for i in range(n):
        xi, yi = pts[i]
        xj, yj = pts[j]
        if (yi > y) != (yj > y) and x < (xj - xi) * (y - yi) / ((yj - yi) or 1e-9) + xi:
            inside = not inside
        j = i
    return inside


def dist_to_polyline(x, y, pts):
    best = 1e18
    for (ax, ay), (bx, by) in zip(pts, pts[1:]):
        dx, dy = bx - ax, by - ay
        L = dx * dx + dy * dy
        u = 0 if L == 0 else max(0, min(1, ((x - ax) * dx + (y - ay) * dy) / L))
        px, py = ax + u * dx, ay + u * dy
        best = min(best, math.hypot(x - px, y - py))
    return best


def covers_fn(it, T):
    """a test (world x, y) -> covered, for an element that covers paper at T; None if it never does"""
    el = it.el
    t = el.get('t')
    tier = tier_of(el)
    fill = el.get('fill')
    if el.get('negative'):
        return None
    filled = (fill is not None and fill != 'paper') or (tier == 'C' and fill != 'paper')
    S, tx, ty = move_affine(it.moves, T) if it.moves else (1.0, 0.0, 0.0)
    S = S if abs(S) > 1e-9 else 1e-9

    def back(x, y):
        return (x - tx) / S, (y - ty) / S
    b = it.b
    if b is None:
        return None
    inbox = lambda x, y: b[0] <= x <= b[2] and b[1] <= y <= b[3]  # noqa: E731
    if t in ('rect',):
        return (lambda x, y: inbox(*back(x, y))) if filled else None
    if t in ('hatch', 'scribble', 'icon', 'figure', 'text', 'shade'):
        if t == 'shade' and el.get('pts'):
            return lambda x, y: point_in_poly(*back(x, y), el['pts'])
        return lambda x, y: inbox(*back(x, y))
    if t in ('ellipse', 'pool'):
        if t == 'ellipse' and not filled:
            return None
        cx, cy, rx, ry = el['cx'], el['cy'], max(1e-6, el['rx']), max(1e-6, el['ry'])

        def f(x, y):
            px, py = back(x, y)
            return ((px - cx) / rx) ** 2 + ((py - cy) / ry) ** 2 <= 1
        return f
    if t == 'line':
        if not el.get('closed') or not filled:
            return None
        return lambda x, y: point_in_poly(*back(x, y), el['pts'])
    if t == 'pipe':
        r = el.get('bore', 26) / 2 + 9
        return lambda x, y: dist_to_polyline(*back(x, y), el['pts']) <= r
    if t == 'ambient' and el.get('kit') in ('window', 'steam'):
        return lambda x, y: inbox(*back(x, y))
    return None


# ------------------------------------------------------------------------------------------------ the lint
class Report:
    def __init__(self):
        self.lines = []

    def add(self, where, sev, msg):
        self.lines.append((where, sev, msg))

    def count(self, sev):
        return sum(1 for _, s, _ in self.lines if s == sev)


def frames_of(shot, fps):
    f0 = int(math.ceil(shot['s'] * fps - 1e-9))
    f1 = int(math.ceil(shot['e'] * fps - 1e-9))
    return f0, max(f0 + 1, f1)


def word_at(words, t, tol=0.05):
    best = None
    for i, w in enumerate(words):
        if abs(w['s'] - t) <= tol and (best is None or abs(w['s'] - t) < abs(words[best]['s'] - t)):
            best = i
    return best


def subject_groups(items, overrides, T_end, cam_end, shot):
    subj = [it for it in items if it.el.get('t') != 'mark' and is_subject(it.el, overrides) and it.b is not None]
    if not subj:
        return []
    end_box = {}
    for it in subj:
        end_box[id(it)] = it.screen_box(T_end, cam_end)
    parent = {id(it): id(it) for it in subj}

    def find(a):
        while parent[a] != a:
            parent[a] = parent[parent[a]]
            a = parent[a]
        return a

    def near(a, b, tol):
        return a[0] - tol <= b[2] and b[0] - tol <= a[2] and a[1] - tol <= b[3] and b[1] - tol <= a[3]
    for a in subj:
        for b in subj:
            if id(a) < id(b) and near(end_box[id(a)], end_box[id(b)], TOUCH):
                parent[find(id(a))] = find(id(b))
    groups = {}
    for it in subj:
        groups.setdefault(find(id(it)), []).append(it)
    out = []
    for g in groups.values():
        lo = []
        hi = []
        for it in g:
            i, o = it.window()
            lo.append(shot['s'] if i is None else max(shot['s'], i))
            hi.append(shot['e'] if o is None else min(shot['e'], o))
        out.append((g, min(lo), max(hi)))
    return out


def lint_panel(shot, data, rep, fps, draft, owner):
    sid = shot['id']
    ph = shot.get('placeholder')
    todo = 'TODO' if (ph and draft) else None

    # a placeholder panel in a draft is scaffolding: everything it still lacks is its to-do list
    def err(msg, completeness=False):
        rep.add(sid, todo or 'ERROR', msg)

    def warn(msg, completeness=False):
        rep.add(sid, todo or 'WARN', msg)

    def info(msg):
        rep.add(sid, 'INFO', msg)

    if ph:
        if draft:
            # scaffolding: its text and frame are not a drawing, so only its to-do list is reported
            items, st = panel_items(shot, data)
            keys = cam_keys(shot.get('camera') or {}, shot)
            rep.add(sid, 'TODO', f'placeholder panel: draw it ({shot.get("name") or shot.get("note", "").split(chr(10))[-1]})')
            for item in shot.get('life') or []:
                rep.add(sid, 'TODO', f'life item "{item}": one placeholder element (life: "{item}")')
            return items, keys
        err('placeholder panel on an owner-facing board: draw it (or mark the board "draft": true)')
    items, st = panel_items(shot, data)
    overrides = shot.get('tiers') or {}
    keys = cam_keys(shot.get('camera') or {}, shot)
    f0, f1 = frames_of(shot, fps)
    T0 = f0 / fps
    T_end = (f1 - 1) / fps
    cam0 = cam_at(keys, T0)
    cam_end = cam_at(keys, T_end)
    own = [it for it in items if it.src == 'shot']
    els = shot.get('els') or []

    # ---- element count (dress exempt), tiers
    counted = [it for it in own if it.el.get('role') != 'dress']
    n = len(counted)
    if n > 30:
        err(f'{n} elements (dress layer aside): split the panel (one idea, 12-25 elements)')
    elif n > 25:
        warn(f'{n} elements (max 25, the dress layer aside; over 30 the panel gets split)')
    untiered = [label_of(it) for it in own if it.el.get('t') != 'mark' and not tier_of(it.el, overrides)]
    if untiered:
        err(f'{len(untiered)} elements with no tier (A / B / C by story role): {", ".join(untiered[:8])}{" ..." if len(untiered) > 8 else ""}', True)

    # ---- labels, numbers, marks, text size, fills (v3 house rules, the panel's own elements)
    labels = [i for i, e in enumerate(els) if e.get('label')]
    labels += [i for i, e in enumerate(els) if e.get('t') == 'text' and not re.search(r'\d', e.get('text', ''))]
    if len(labels) > 1:
        err(f'{len(labels)} labels (els {sorted(labels)}): at most 1, 56-72 px, only when the picture cannot say it')
    numbers = [i for i, e in enumerate(els) if e.get('t') == 'text' and re.search(r'\d', e.get('text', '')) and not e.get('strike')
               and not YEAR.fullmatch(e.get('text', '').strip())]
    if len(numbers) > 1:
        warn(f'{len(numbers)} numbers (els {numbers}): one per panel (a change = the old one struck through + the new one)')
    marks = [it for it in own if it.el.get('t') == 'mark']
    if len(marks) > 1:
        err(f'{len(marks)} marks: at most 1 red mark per panel')
    for it in marks:
        e = it.el
        case = e.get('case') or (3 if e.get('kind') == 'arrow' else 1 if e.get('kind') == 'frame' else None)
        if case in (1, 3):
            msg = f'{label_of(it)}: a red mark case ({case}) ({"a planned move not animated" if case == 1 else "an un-animated path arrow"}): play the move instead'
            if owner:
                err(msg + ' (FAIL on an owner-facing board)')
            else:
                warn(msg + ' (legal only in an internal draft)')
        if case == 2:
            i, o = e.get('in', 0) or 0, e.get('out')
            if o is None or o - i > 0.41:
                warn(f'{label_of(it)}: a case (2) end-frame box is held for the first 0.4 s only (set out <= in + 0.4)')
    for it in own:
        e = it.el
        if e.get('t') == 'text' and e.get('size', 64) < 48:
            err(f'{label_of(it)} text "{e.get("text")}" is {e.get("size")} px (min 48; labels 56-72)')
        fill = e.get('fill')
        if fill is None or e.get('t') == 'ambient' or (e.get('t') == 'icon' and (fill == 'none' or str(fill).startswith('#'))):
            continue
        if fill in LEGACY:
            warn(f"{label_of(it)} fill '{fill}' is a sketch name: use 'light'")
        elif fill not in PALETTE:
            err(f"{label_of(it)} fill '{fill}' is not a board tone (paper / light / mid / dark / pop)")

    # ---- the caption band: start, middle, end and every camera key inside the panel
    probe = sorted({T0, (T0 + T_end) / 2, T_end} | {k['t'] for k in keys if T0 < k['t'] < T_end})
    crossing = {}
    for it in items:
        e = it.el
        t = e.get('t')
        tier = tier_of(e, overrides)
        flat_c = (tier == 'C' and t in ('rect', 'ellipse', 'hatch') and e.get('sw') is None) or \
                 (tier == 'C' and t == 'line' and e.get('closed')) or (tier is None and v3_role(e) == 'far' and not e.get('sw') and
                                                                       (t == 'hatch' or (e.get('fill') not in (None, 'paper') and (t in ('rect', 'ellipse') or (t == 'line' and e.get('closed'))))))
        if flat_c or e.get('negative') or t == 'mark' or it.b is None:
            continue
        for T in probe:
            if not it.alive(T):
                continue
            sb = it.screen_box(T, cam_at(keys, T))
            if sb[1] < BAND[1] and sb[3] > BAND[0] and sb[0] < W and sb[2] > 0:
                crossing.setdefault(label_of(it), []).append(round(T, 2))
    if crossing:
        err('crossing the caption band (y 290-600; only a flat tier-C fill or a declared negative field may): ' +
            '; '.join(f'{k} at {v[0]} s' for k, v in list(crossing.items())[:8]))

    # ---- the subject group(s) (tier A)
    groups = subject_groups(items, overrides, T_end, cam_end, shot)
    if not groups:
        err("no subject: give the beat's 1-3 subject objects tier 'A'", True)
    else:
        clash = [(a, b) for a in range(len(groups)) for b in range(a + 1, len(groups))
                 if groups[a][1] < groups[b][2] and groups[b][1] < groups[a][2]]
        if clash:
            names = ' / '.join('+'.join(label_of(it) for it in g[0][:3]) for g in groups)
            err(f'{len(groups)} subject groups on screen together ({names}): one subject per beat (demote the others with shot.tiers)')
        for g, g_in, g_out in groups:
            if all(it.el.get('t') in ('line', 'pipe', 'ambient', 'ground') for it in g):
                info(f'subject {"+".join(label_of(it) for it in g[:3])} is a line / pipe / life: the staging box rules skip it')
                continue
            chart = any(it.el.get('t') == 'icon' and it.el.get('name') == 'chart' for it in g)
            lo, hi = CHART_W if chart else SUBJECT_W
            ends = []
            if g_in <= T0 + 1e-6:
                ends.append((T0, cam0, 'start'))
            if g_out >= shot['e'] - 1e-6:
                ends.append((T_end, cam_end, 'end'))
            if not ends:
                ends.append((g_in, cam_at(keys, g_in), f'{g_in:.2f} s'))
            for T, cam, which in ends:
                bs = [it.screen_box(T, cam) for it in g if it.alive(T) or which != 'start']
                bs = [b for b in bs if b]
                if not bs:
                    continue
                raw = (min(b[0] for b in bs), min(b[1] for b in bs), max(b[2] for b in bs), max(b[3] for b in bs))
                sb = (max(0, raw[0]), max(0, raw[1]), min(W, raw[2]), min(STAGE_BOTTOM, raw[3]))
                cut = sb != raw
                cx = (sb[0] + sb[2]) / 2
                w = sb[2] - sb[0]
                h = sb[3] - sb[1]
                nm = '+'.join(label_of(it) for it in g[:3])
                if w <= 0 or h <= 0:
                    err(f'subject {nm} is off screen at the {which}')
                    continue
                if not STAGE_X[0] <= cx <= STAGE_X[1]:
                    err(f'subject {nm} centred at x {cx:.0f} at the {which} (the subject axis x {STAGE_X[0]}-{STAGE_X[1]})')
                if shot.get('scale'):
                    if w < SCALE_MIN_W and not (raw[0] < 0 and raw[2] > W):
                        err(f'scale subject {nm} is {w:.0f} px wide at the {which}: a scale panel needs it >= {SCALE_MIN_W:.0f} px or cut by both side edges')
                elif h > 1.3 * w and not chart and not cut:
                    if not TALL_H[0] <= h <= TALL_H[1]:
                        warn(f'tall subject {nm} is {h:.0f} px high at the {which} ({TALL_H[0]}-{TALL_H[1]})')
                elif not lo <= w <= hi:
                    err(f'subject {nm} is {w:.0f} px wide at the {which} ({lo}-{hi}{", chart" if chart else ""})')

    # ---- the camera: five values, eases, zoom
    for a, b in zip(keys, keys[1:]):
        dz = abs(math.log(max(1e-6, b['z']) / max(1e-6, a['z'])))
        dpx = math.hypot((b['x'] - a['x']) * b['z'], (b['y'] - a['y']) * b['z'])
        if dz <= 0.01 and dpx <= 4:
            continue
        missing = [nm for nm, ok in (('the move word', b.get('word')), ('the anchor', b.get('anchor')),
                                     ('the ease (or a peak)', b.get('ease') is not None or b.get('peak') is not None)) if not ok]
        dur = b['t'] - a['t']
        if dur <= 0:
            missing.append('a duration')
        if missing:
            err(f'camera move {a["t"]:.2f}-{b["t"]:.2f} s ({b["z"] / a["z"]:.2f}x, {dpx:.0f} px) misses {", ".join(missing)} (the five values)', True)
        if not eases_both(b.get('ease'), b.get('peak')):
            warn(f'camera move {a["t"]:.2f}-{b["t"]:.2f} s eases "{b.get("ease")}": every move eases in AND out (inout, unveil, a peak, or a bezier still at both ends)')
        if b.get('peak') is not None and not a['t'] < b['peak'] < b['t']:
            err(f'camera move {a["t"]:.2f}-{b["t"]:.2f} s: its peak {b["peak"]} is outside the move')
    zs = [cam_at(keys, f / fps)['z'] for f in range(f0, f1, max(1, (f1 - f0) // 60))] + [cam_end['z']]
    ratio = max(zs) / max(1e-6, min(zs))
    if ratio > 2.0001:
        err(f'the camera zooms {ratio:.2f}x inside the panel: more than 2x is a push-through (A) into the next panel')
    elif ratio > 1.6:
        warn(f'the camera zooms {ratio:.2f}x inside the panel (a push-in is at most ~1.6x; 2x is the ceiling)')

    # ---- moves: peaks inside, eases
    for m, base in [(m, shot['s']) for m in shot.get('moves') or []]:
        if m.get('peak') is not None and not m['at'] < m['peak'] < m['at'] + m['dur']:
            err(f'move on {m["el"]}: its peak {m["peak"]} is outside {m["at"]}-{m["at"] + m["dur"]}')

    # ---- the speed budget (px/frame on screen), moves >= 2 frames
    peak = (0.0, None, None)
    sx = [W * (i + 0.5) / 5 for i in range(5)]
    sy = [STAGE_BOTTOM * (j + 0.5) / 9 for j in range(9)]
    min_dur = 2.0 / fps
    for f in range(f0, f1 - 1):
        Ta, Tb = f / fps, (f + 1) / fps
        ca, cb = cam_at(keys, Ta), cam_at(keys, Tb)
        if abs(ca['z'] - cb['z']) > 1e-9 or abs(ca['x'] - cb['x']) > 1e-9 or abs(ca['y'] - cb['y']) > 1e-9:
            v = 0.0
            for x in sx:
                for y in sy:
                    wp = to_world_pt(ca, (x, y))
                    q = to_screen_pt(cb, wp)
                    v = max(v, math.hypot(q[0] - x, q[1] - y))
            if v > peak[0]:
                peak = (v, Ta, 'the camera')
        for it in items:
            ms = [(m, base) for m, base in it.moves if m['dur'] >= min_dur]
            if not ms or it.b is None or not it.alive(Ta):
                continue
            active = any(m.get('loop') or (m['at'] - 1e-9 <= Ta - base <= m['at'] + m['dur']) for m, base in ms)
            if not active:
                continue
            b = it.b
            v = 0.0
            for px in (b[0], (b[0] + b[2]) / 2, b[2]):
                for py in (b[1], (b[1] + b[3]) / 2, b[3]):
                    pa = to_screen_pt(ca, move_point((px, py), it.moves, Ta))
                    pb = to_screen_pt(cb, move_point((px, py), it.moves, Tb))
                    if not (0 <= pa[0] <= W and 0 <= pa[1] <= STAGE_BOTTOM) and not (0 <= pb[0] <= W and 0 <= pb[1] <= STAGE_BOTTOM):
                        continue
                    d = math.hypot(pb[0] - pa[0], pb[1] - pa[1])
                    if d > W:  # a loop's wrap or a snap
                        continue
                    v = max(v, d)
            if v > peak[0]:
                peak = (v, Ta, label_of(it))
    for it in items:
        e = it.el
        if e.get('t') != 'ambient':
            continue
        v = {'snow': e.get('speed', 55), 'steam': e.get('rise', 85), 'cloud': e.get('speed', 10), 'water': e.get('speed', 80),
             'bird': e.get('speed', 70)}.get(e.get('kit'), 0) * cam_end['z'] / fps
        if v > peak[0]:
            peak = (v, None, f'{label_of(it)} ({e.get("kit")})')
    whip = any((shot.get('transition') or {}).get('device') in ('whip', 'carry') for _ in [0])
    if peak[0] > SPEED_LIMIT and not whip:
        warn(f'peak speed {peak[0]:.1f} px/frame ({peak[0] * fps:.0f} px/s) at {peak[1] if peak[1] is None else round(peak[1], 2)} s, '
             f'{peak[2]}: over ~{SPEED_LIMIT:.0f} px/frame (resolve at the 1x watch, sound on)')
    elif peak[0] > 0:
        info(f'peak speed {peak[0]:.1f} px/frame ({peak[2]})')

    # ---- set panel: rig, planes, vp, ambient, dress, life, emptiness, movers
    if shot.get('set'):
        if not st:
            err(f'set "{shot["set"]}" is not in the board\'s sets', True)
        rig = (st or {}).get('rig') or {}
        if not rig.get('key'):
            err(f'no rig for set "{shot["set"]}": its key side, the one shadow value, the pools (W1)', True)
        elif not rig.get('shadow'):
            warn(f'the rig of set "{shot["set"]}" names no shadow value (default mid)')
        if not (shot.get('planes') or (st or {}).get('planes')):
            err(f'no planes for this set panel (each a grey step: 0 = the subject\'s, nearer darker, farther paler)', True)
        vp = shot.get('vp') or (st or {}).get('vp')
        if not vp or vp.get('y') is None:
            err('no vp (the horizon y and the vanishing point x) for this set panel', True)
        elif not any(it.el.get('t') == 'ground' for it in items):
            warn('no ground lines to the VP ({t: "ground"}): the ground should run into the picture', True)
        amb = []
        props = []
        for it in items:
            e = it.el
            i, o = it.window()
            if (i is not None and i >= shot['e']) or (o is not None and o <= shot['s']):
                continue
            looping = any(m.get('loop') for m, _ in it.moves)
            if e.get('t') == 'ambient' or e.get('loop') or looping:
                amb.append(label_of(it))
                if looping and e.get('t') != 'ambient':
                    props.append(label_of(it))
        if not amb:
            err('no ambient life on this set panel (2-3 micro-moves from the shared kit: snow, steam, a window, a cloud, water, birds)', True)
        elif len(amb) == 1:
            warn(f'one ambient move ({amb[0]}): a set panel carries 2-3', True)
        elif len(amb) > 3:
            info(f'{len(amb)} ambient moves ({", ".join(amb[:6])}): 2-3 is the contract, they take turns')
        if len(props) > 1:
            warn(f'{len(props)} periodic props ({", ".join(props)}): at most one of the ambient moves a periodic prop')
        if rig.get('pools') and not any(it.el.get('t') == 'pool' for it in items):
            warn(f'the rig names pools ({", ".join(rig["pools"])}) but the panel draws none ({{t: "pool"}})', True)
        wide = bool(re.search(r'WIDE|ESTABLISH|HOME', str(shot.get('type', '')).upper()))
        if (shot.get('home') or wide) and not any(it.el.get('role') == 'dress' for it in items):
            warn('a home-base / wide panel with no dress layer (role "dress": the full set sketched in light masses)', True)

    life = shot.get('life') or []
    named = {}
    for it in items:
        if it.el.get('life'):
            named.setdefault(it.el['life'], []).append(label_of(it))
    for item in life:
        if item not in named:
            err(f'life item "{item}" has no placeholder (an element with life: "{item}")', True)
    for k in named:
        if k not in life:
            warn(f'placeholder for "{k}" ({named[k][0]}) is not in the panel\'s life list')
    if shot.get('set') and not life:
        warn('no life list: name every G5 life item (crowd, traffic, steam, window lights) with one placeholder each', True)

    if shot.get('set'):
        emptiness(shot, items, groups, keys, T_end, fps, err, warn, info)

    if shot.get('movers') is not None and shot['movers'] > 4:
        warn(f'{shot["movers"]} declared supporting movers at once (3-4 noticeable at most)')
    worst = (0, None, [])
    T = T0
    while T <= T_end + 1e-9:
        cam = cam_at(keys, T)
        mv = []
        for it in items:
            e = it.el
            if tier_of(e, overrides) == 'A' or not it.alive(T) or it.b is None:
                continue
            moving = e.get('t') == 'ambient' or any(m.get('loop') or (m['at'] <= T - base <= m['at'] + m['dur']) for m, base in it.moves)
            if not moving or (e.get('t') == 'ambient' and e.get('kit') in ('snow',)):
                continue
            if e.get('t') == 'ambient' and e.get('kit') in ('water', 'bird'):
                area = NOTICEABLE  # small marks: they count once each preset
            else:
                sb = it.screen_box(T, cam)
                vis = (max(0, sb[0]), max(0, sb[1]), min(W, sb[2]), min(STAGE_BOTTOM, sb[3]))
                area = max(0, vis[2] - vis[0]) * max(0, vis[3] - vis[1])
            if area >= NOTICEABLE:
                mv.append(label_of(it))
        if len(mv) > worst[0]:
            worst = (len(mv), T, mv)
        T += 0.1
    if worst[0] > 4:
        warn(f'{worst[0]} noticeable supporting movers at once at {worst[1]:.1f} s ({", ".join(worst[2][:6])}): 3-4 at most, taking turns')
    return items, keys


def emptiness(shot, items, groups, keys, T, fps, err, warn, info):
    """G3_ANIMATIC §6: at 270 x 480, a 6 x 10 grid at the panel's resting end frame"""
    cam = cam_at(keys, T)
    cols, rows = 6, 10
    cw, ch = W / cols, H / rows
    exempt_boxes = []
    for g, g_in, g_out in groups:
        bs = [it.screen_box(T, cam) for it in g if it.b is not None]
        if bs:
            exempt_boxes.append((min(b[0] for b in bs) - 80, min(b[1] for b in bs) - 80, max(b[2] for b in bs) + 80, max(b[3] for b in bs) + 80))
    for it in items:
        if it.el.get('negative') and it.b is not None and it.alive(T):
            exempt_boxes.append(it.screen_box(T, cam))
    covers = [f for f in (covers_fn(it, T) for it in items if it.alive(T)) if f]

    def exempt(x, y):
        if BAND[0] <= y <= BAND[1] or y >= STAGE_BOTTOM or x < 120 or x > W - 120:
            return True
        return any(b[0] <= x <= b[2] and b[1] <= y <= b[3] for b in exempt_boxes)
    bare = [[False] * cols for _ in range(rows)]
    stage_pts = 0
    stage_bare = 0
    for r in range(rows):
        for c in range(cols):
            ex = 0
            cov = 0
            pts = [((c + (i + 0.5) / 6) * cw, (r + (j + 0.5) / 6) * ch) for i in range(6) for j in range(6)]
            for x, y in pts:
                wx, wy = to_world_pt(cam, (x, y))
                if exempt(x, y):
                    ex += 1
                hit = any(f(wx, wy) for f in covers)
                cov += hit
                if y < STAGE_BOTTOM and not (BAND[0] <= y <= BAND[1]):
                    stage_pts += 1
                    neg = any(b[0] <= x <= b[2] and b[1] <= y <= b[3] for b in exempt_boxes[len(groups):])
                    stage_bare += (not hit) and not neg
            if ex / 36 < 0.5 and cov / 36 <= 0.03:
                bare[r][c] = True
    seen = set()
    regions = []
    for r in range(rows):
        for c in range(cols):
            if bare[r][c] and (r, c) not in seen:
                stack = [(r, c)]
                seen.add((r, c))
                reg = []
                while stack:
                    a, b = stack.pop()
                    reg.append((a, b))
                    for da, db in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                        na, nb = a + da, b + db
                        if 0 <= na < rows and 0 <= nb < cols and bare[na][nb] and (na, nb) not in seen:
                            seen.add((na, nb))
                            stack.append((na, nb))
                regions.append(reg)
    big = [reg for reg in regions if len(reg) >= 4]
    for reg in big:
        ys = sorted({a for a, _ in reg})
        xs = sorted({b for _, b in reg})
        err(f'undeclared bare paper: {len(reg)} contiguous cells (rows {ys[0]}-{ys[-1]}, cols {xs[0]}-{xs[-1]} of 10 x 6, '
            f'y {ys[0] * ch:.0f}-{(ys[-1] + 1) * ch:.0f}) at the end frame: a placeholder mass, or `negative: true` where the final stays plain', True)
    if stage_pts and stage_bare / stage_pts > 0.55:
        warn(f'{100 * stage_bare / stage_pts:.0f} % bare stage at the end frame (over ~55 %)', True)


def check_film(data, rep, fps, draft, owner, panels, plan_path):
    shots = data.get('shots') or []
    words = data.get('words') or []
    dur = data.get('durationSec', 0)
    F = 'film'
    # tiling
    if shots and abs(shots[0]['s']) > 1e-6:
        rep.add(F, 'ERROR', f'the first shot starts at {shots[0]["s"]} s, not 0 (frame 0)')
    for a, b in zip(shots, shots[1:]):
        if abs(a['e'] - b['s']) > 1e-3:
            rep.add(F, 'ERROR', f'{a["id"]} ends at {a["e"]} but {b["id"]} starts at {b["s"]}: shots tile the voice')
        if b['s'] <= a['s']:
            rep.add(F, 'ERROR', f'{b["id"]} starts before {a["id"]}')
    if shots and abs(shots[-1]['e'] - dur) > 1e-3:
        rep.add(F, 'ERROR', f'the last shot ends at {shots[-1]["e"]}, the voice at {dur}')
    audio = data.get('audio')
    if audio:
        path = os.path.join(VIDEO, 'public', audio)
        if os.path.exists(path) and path.endswith('.wav'):
            try:
                import wave
                with wave.open(path) as wf:
                    vsec = wf.getnframes() / wf.getframerate()
                if abs(vsec - dur) > 0.05:
                    rep.add(F, 'WARN', f'durationSec {dur} vs the voice file {vsec:.3f} s (the reel takes the voice\'s length)')
            except Exception:
                pass
        elif not os.path.exists(path):
            rep.add(F, 'ERROR', f'the voice {audio} is not in public/')
    ids = [s['id'] for s in shots]
    if len(set(ids)) != len(ids):
        rep.add(F, 'ERROR', 'shot ids repeat')
    # set tiers (once per set)
    for name, st in (data.get('sets') or {}).items():
        untiered = [e.get('id') or str(j) for j, e in enumerate(st.get('els') or []) if e.get('t') != 'mark' and not tier_of(e)]
        if untiered:
            rep.add(F, 'ERROR', f'set "{name}": {len(untiered)} elements with no tier: {", ".join(untiered[:8])}')
        rig = st.get('rig')
        if rig and rig.get('key') not in ('left', 'right', 'top-left', 'top-right', 'top', 'back', 'back-left', 'back-right', 'front'):
            rep.add(F, 'ERROR', f'set "{name}": rig.key "{rig.get("key")}" is not a key side')

    # joins
    f_cuts = []
    for k, sh in enumerate(shots):
        tr = sh.get('transition') or {}
        first = k == 0
        if first:
            tr = data.get('loopJoin') or {}
            if not tr:
                rep.add(F, 'WARN', 'no loopJoin: the join from the last shot back into frame 0 (the loop) names its carrier too')
                continue
        where = f'{shots[k - 1]["id"] if not first else shots[-1]["id"]}->{sh["id"]}'
        todo = draft and (sh.get('placeholder') or (not first and shots[k - 1].get('placeholder')))
        car = tr.get('carrier')
        dev = tr.get('device')
        typ = tr.get('type', 'cut')
        if car not in CARRIERS:
            rep.add(where, 'TODO' if todo else 'ERROR', f'no carrier letter (A push-through, B thread match, C continuous camera, D object carry, E card flip, F plain cut)')
        if dev and dev in DEVICE_CARRIER and car in CARRIERS and DEVICE_CARRIER[dev] != car:
            rep.add(where, 'WARN', f'device "{dev}" is carrier {DEVICE_CARRIER[dev]}, the join says {car}')
        if typ in EXCEPTIONS or dev in EXCEPTIONS:
            if tr.get('exception') != 'time':
                rep.add(where, 'ERROR', f'a {typ if typ in EXCEPTIONS else dev} is no carrier: only the declared time-passing exception (exception: "time")')
            elif not 0.2 <= (tr.get('dur') or 0.2) <= 2.0:
                rep.add(where, 'WARN', f'a time-passing {typ} of {tr.get("dur")} s (0.2-0.4 s, up to 1-2 s)')
        if car == 'F' and not first:
            f_cuts.append((where, k))
        mid = tr.get('mid', sh['s'] if not first else 0.0)
        if not first:
            wi = word_at(words, mid)
            if wi is None:
                if words:
                    rep.add(where, 'WARN', f'the join\'s midpoint {mid:.2f} s is not on a word\'s start (+-0.05 s)')
            elif wi > 0 and not re.search(r'[.?!,;:]["\']?$', words[wi - 1]['w']):
                rep.add(where, 'INFO', f'the join lands on "{words[wi]["w"]}" mid-sentence (after "{words[wi - 1]["w"]}")')
        # per-device: B match, A subframe, C continuity
        if not first:
            prev = shots[k - 1]
            pkeys = panels.get(prev['id'], (None, None))[1]
            nkeys = panels.get(sh['id'], (None, None))[1]
            if pkeys is None or nkeys is None:
                continue
            tA = sh['s'] - 1.0 / fps
            tB = sh['s']
            cA, cB = cam_at(pkeys, tA), cam_at(nkeys, tB)
            if tr.get('match'):
                pa = to_screen(tr['match']['prev'][:2] + [tr['match']['prev'][0] + tr['match']['prev'][2], tr['match']['prev'][1] + tr['match']['prev'][3]], cA)
                pb = to_screen(tr['match']['next'][:2] + [tr['match']['next'][0] + tr['match']['next'][2], tr['match']['next'][1] + tr['match']['next'][3]], cB)
                ca_ = ((pa[0] + pa[2]) / 2, (pa[1] + pa[3]) / 2)
                cb_ = ((pb[0] + pb[2]) / 2, (pb[1] + pb[3]) / 2)
                off = max(abs(ca_[0] - cb_[0]) / W, abs(ca_[1] - cb_[1]) / H)
                sa = max(1e-6, (pa[2] - pa[0]) * (pa[3] - pa[1])) ** 0.5
                sb_ = max(1e-6, (pb[2] - pb[0]) * (pb[3] - pb[1])) ** 0.5
                if off > 0.08 or abs(sb_ / sa - 1) > 0.2:
                    rep.add(where, 'WARN', f'the carried thing moves {100 * off:.0f} % / sizes {sb_ / sa:.2f}x across the join (a match: +-8 % spot, +-20 % size)')
            elif car == 'B':
                rep.add(where, 'WARN', 'a thread match (B) without `match` boxes: declare the thread\'s box in both panels so the spot and size are checked')
            if dev == 'push-through' and tr.get('subframe'):
                sf = tr['subframe']
                cS = cam_at(pkeys, prev['s'])
                sbx = to_screen((sf[0], sf[1], sf[0] + sf[2], sf[1] + sf[3]), cS)
                frac = max(0, sbx[2] - sbx[0]) * max(0, sbx[3] - sbx[1]) / (W * H)
                if not 0.15 <= frac <= 0.30:
                    rep.add(where, 'WARN', f'the push-through\'s sub-frame is {100 * frac:.0f} % of the frame at {prev["id"]}\'s start (15-30 %)')
            if car == 'C' and not tr.get('match'):
                same = prev.get('set') and prev.get('set') == sh.get('set') and not prev.get('ownWorld') and not sh.get('ownWorld')
                if same:
                    jump = math.hypot((cA['x'] - cB['x']) * cB['z'], (cA['y'] - cB['y']) * cB['z'])
                    zr = cB['z'] / cA['z']
                    # the camera's own speed at the join (one frame), so a move at its peak isn't called a jump
                    cA2 = cam_at(pkeys, tA - 1.0 / fps)
                    step = math.hypot((cA['x'] - cA2['x']) * cA['z'], (cA['y'] - cA2['y']) * cA['z']) + abs(cA['z'] / cA2['z'] - 1) * 900
                    if jump > step + 6 or abs(math.log(zr)) > abs(math.log(cA['z'] / cA2['z'])) + 0.01:
                        rep.add(where, 'WARN', f'continuous camera (C), but the camera jumps {jump:.0f} px / {zr:.3f}x at the join: continue {prev["id"]}\'s keys in {sh["id"]}')
                elif not (sh.get('placeholder') or prev.get('placeholder')):
                    rep.add(where, 'INFO', 'continuous camera (C) between panels drawn apart: declare `match` boxes to check the hand-over')
            if dev in ('whip', 'carry') and tr.get('speed'):
                rep.add(where, 'INFO', f'{dev}: declared {tr.get("dir")} at {tr["speed"]} px/frame (the 1x watch checks the match)')
    if len(f_cuts) > 2:
        rep.add(F, 'ERROR', f'{len(f_cuts)} plain cuts (F): at most 2 per film, each on a "But" turn')
    for where, k in f_cuts:
        sh = shots[k]
        wi = word_at(words, (sh.get('transition') or {}).get('mid', sh['s']))
        if wi is None or not re.match(r'but\b', words[wi]['w'].lower()):
            rep.add(where, 'WARN', f'a plain cut (F) not on a "But" turn ({words[wi]["w"] if wi is not None else "no word"})')
        tr = sh.get('transition') or {}
        if not (tr.get('angle') and tr['angle'] >= 30):
            rep.add(where, 'INFO', 'a plain cut: the size changes >= 20 % or the angle >= 30 deg (declare `angle`), the thread on both sides')

    # nothing enters round a join but the carrier
    for k in range(1, len(shots)):
        sh = shots[k]
        M = (sh.get('transition') or {}).get('mid', sh['s'])
        ent = []
        for sid in (shots[k - 1]['id'], sh['id']):
            items = panels.get(sid, (None, None))[0] or []
            for it in items:
                e = it.el
                if e.get('carrier') or e.get('t') == 'mark':
                    continue
                if e.get('in') is not None and abs(it.base + e['in'] - M) <= 0.2:
                    ent.append(f'{sid} {label_of(it)} enters')
                for m, base in it.moves:
                    if not m.get('loop') and abs(base + m['at'] - M) <= 0.2:
                        ent.append(f'{sid} {label_of(it)} starts a move')
        if ent:
            rep.add(f'{shots[k - 1]["id"]}->{sh["id"]}', 'WARN', f'in the 0.4 s round the join ({M:.2f} s) only the carrier leads: ' + '; '.join(ent[:5]))

    # thread coverage
    thread_cov(data, rep, fps, panels)

    # pacing
    if shots:
        durs = [s['e'] - s['s'] for s in shots]
        avg = sum(durs) / len(durs)
        if avg < 3.5:
            rep.add(F, 'WARN', f'shots average {avg:.2f} s (>= 3.5 s; a C move inside a panel keeps one shot)')
        for i in range(len(durs) - 2):
            trio = durs[i:i + 3]
            mean = sum(trio) / 3
            if all(abs(d - mean) <= 0.1 * mean for d in trio):
                rep.add(F, 'WARN', f'three near-equal shots in a row ({", ".join(s["id"] for s in shots[i:i + 3])}: {", ".join(f"{d:.2f}" for d in trio)} s)')
    # sfx
    for i, cue in enumerate(data.get('sfx') or []):
        miss = [k for k in ('type', 'event') if not cue.get(k)]
        if miss:
            rep.add(F, 'WARN', f'sfx {i} ({cue.get("src")} at {cue.get("t")} s) has no {" or ".join(miss)} (SOUND_SYNC §4 item 1)')
        if not 0 <= cue.get('t', 0) <= dur:
            rep.add(F, 'ERROR', f'sfx {i} at {cue.get("t")} s is outside the reel')
        if cue.get('src') and not os.path.exists(os.path.join(VIDEO, 'public', cue['src'])):
            rep.add(F, 'ERROR', f'sfx {i}: {cue["src"]} is not in public/')

    # the camera plan
    if plan_path and os.path.exists(plan_path):
        cross_check(data, rep, plan_path, panels)
    elif plan_path:
        rep.add(F, 'INFO', f'no camera plan at {os.path.relpath(plan_path, VIDEO)}: the cross-check is skipped')


def thread_cov(data, rep, fps, panels):
    shots = data.get('shots') or []
    if not shots:
        return
    tl = data.get('throughline') or {}
    excl = []
    for key in ('reveal', 'fairness'):
        if tl.get(key):
            excl.append(tuple(tl[key]))
    for sh in shots:
        if sh.get('reveal'):
            excl.append((sh['s'], sh['e']))
    if not tl.get('home'):
        rep.add('film', 'WARN', 'the throughline names no home spot for the thread (throughline.home)')
    N = int(math.ceil(data.get('durationSec', shots[-1]['e']) * fps - 1e-9))
    vis = []
    counted = []
    any_thread = False
    k = 0
    for f in range(N):
        T = f / fps
        while k < len(shots) - 1 and T >= shots[k + 1]['s']:
            k += 1
        sh = shots[k]
        items, keys = panels.get(sh['id'], (None, None))
        ex = any(a <= T < b for a, b in excl)
        counted.append(not ex)
        on = False
        if items:
            cam = cam_at(keys, T)
            for it in items:
                if not it.el.get('thread'):
                    continue
                any_thread = True
                if not it.alive(T) or it.b is None:
                    continue
                if it.el.get('t') == 'pipe' and it.water(T) <= 0.0005:
                    continue
                sb = it.screen_box(T, cam)
                if sb[0] < W and sb[2] > 0 and sb[1] < STAGE_BOTTOM and sb[3] > 0:
                    on = True
                    break
        vis.append(on)
    if not any_thread:
        rep.add('film', 'TODO' if data.get('draft') else 'ERROR', 'no thread on the board: mark the thread object\'s elements thread: true (the through-line card)')
        return
    n_counted = sum(counted)
    n_vis = sum(1 for v, c in zip(vis, counted) if v and c)
    cov = n_vis / max(1, n_counted)
    gaps = []
    run = 0
    start = None
    for f in range(N):
        if counted[f] and not vis[f]:
            if run == 0:
                start = f
            run += 1
        else:
            if run:
                gaps.append((start / fps, run / fps))
            run = 0
    if run:
        gaps.append((start / fps, run / fps))
    long_gaps = [g for g in gaps if g[1] > 3.0]
    msg = f'thread on screen {100 * cov:.1f} % of {n_counted / fps:.1f} s counted' + (f' (outside {", ".join(f"{a:.2f}-{b:.2f}" for a, b in excl)})' if excl else '')
    sev = 'ERROR' if cov < 0.8 or long_gaps else 'INFO'
    if sev == 'ERROR' and data.get('draft') and any(s.get('placeholder') for s in shots):
        sev = 'TODO'
    rep.add('film', sev, msg + ('' if cov >= 0.8 else ': under 80 %'))
    for a, d in long_gaps:
        rep.add('film', sev, f'the thread is gone {d:.2f} s from {a:.2f} s (no gap over 3 s)')
    mid = [g for g in gaps if 1.5 < g[1] <= 3.0]
    for a, d in mid:
        rep.add('film', 'INFO', f'thread gap {d:.2f} s from {a:.2f} s')
    if gaps and len(gaps) >= 2 and gaps[0][0] == 0 and abs(gaps[-1][0] + gaps[-1][1] - N / fps) < 2 / fps and gaps[0][1] + gaps[-1][1] > 3:
        rep.add('film', 'WARN', f'the loop joins the tail gap and the head gap: {gaps[0][1] + gaps[-1][1]:.2f} s without the thread on rewatch')


# ------------------------------------------------------------------------------------------------ the camera plan
def split_row(line):
    cells = line.strip().strip('|').split('|')
    return [c.strip() for c in cells]


def md_tables(text):
    lines = text.splitlines()
    out = []
    i = 0
    while i < len(lines):
        if lines[i].lstrip().startswith('|') and i + 1 < len(lines) and re.match(r'^\s*\|[\s:|-]+\|\s*$', lines[i + 1]):
            header = [h.lower() for h in split_row(lines[i])]
            rows = []
            i += 2
            while i < len(lines) and lines[i].lstrip().startswith('|'):
                rows.append(split_row(lines[i]))
                i += 1
            out.append((header, rows))
        else:
            i += 1
    return out


def plain(s):
    return re.sub(r'[*_`]', '', s)


PROSE_KEYS = {'move': 'move (block)', 'join': 'join out (block)', 'tiers': 'tier (block)', 'tier': 'tier (block)',
              'rig': 'rig (block)', 'life': 'life (block)'}


def md_blocks(text):
    """per-shot prose blocks: '### S1 ...' then bullets '- **Label (...):** text' (continuation lines indented) ->
    {sid: {key: [text]}}"""
    out = {}
    sid = None
    cur = None
    for line in text.splitlines():
        h = re.match(r'^#{2,4}\s+(S\d+[a-z]?)\b', line)
        if h:
            sid, cur = h.group(1), None
            continue
        if line.startswith('#'):
            sid, cur = None, None
            continue
        if sid is None:
            continue
        b = re.match(r'^- \*\*([^*:(]+?)\s*(\([^)]*\))?:\*\*\s*(.*)$', line)
        if b:
            key = PROSE_KEYS.get(b.group(1).strip().lower().split(' ')[0])
            cur = None
            if key:
                # a label's own parenthesis ("Rig (W1 Rig P)") leads the text: it names the thing
                out.setdefault(sid, {}).setdefault(key, []).append(((b.group(2) or '') + ' ' + b.group(3)).strip())
                cur = (sid, key)
            continue
        if cur and line.startswith('  ') and line.strip():
            lst = out[cur[0]][cur[1]]
            lst[-1] += ' ' + line.strip()
        elif not line.strip() or line.startswith('- '):
            cur = None
    return out


JOIN_CODE_CARRIER = {'RJ4': 'C', 'RM3': 'C', 'RJ2': 'F', 'RJ3': 'B', 'J2': 'A', 'J3': 'B'}  # COMPOSITION_SHOTS join codes


def find_carrier(cell):
    """the carrier letter a plan cell names: "(C)", "carrier C", ": F (RJ2)", "C, RJ4", or a join code alone (RJ4 = C)"""
    c = plain(cell)
    end = r'(?=\s*[,;:·(]|\s+(?:RJ|RM|J)\d|\s*$)'
    for pat in (r'\(([A-F])\)', r'carrier\s*:?\s*([A-F])\b', r':\s*([A-F])' + end, r'^\s*([A-F])' + end):
        m = re.search(pat, c)
        if m:
            return m.group(1), False
    m = re.search(r'\b(RJ\d|RM3|J[23])\b', c)
    if m and m.group(1) in JOIN_CODE_CARRIER:
        return JOIN_CODE_CARRIER[m.group(1)], True
    return None, False


def cross_check(data, rep, path, panels):
    with open(path) as f:
        text = f.read()
    shots = data.get('shots') or []
    ids = [s['id'] for s in shots]
    byid = {s['id']: s for s in shots}
    rows = {}
    cols_seen = set()
    for header, trs in md_tables(text):
        for r in trs:
            if not r:
                continue
            m = re.search(r'\b(S\d+[a-z]?)\b', plain(r[0]))
            if not m:
                continue
            sid = m.group(1)
            d = rows.setdefault(sid, {})
            for hname, cell in zip(header, r):
                cols_seen.add(hname)
                d.setdefault(hname, []).append(cell)
    for sid, d in md_blocks(text).items():
        for key, cells in d.items():
            rows.setdefault(sid, {}).setdefault(key, []).extend(cells)
    rel = os.path.relpath(path, VIDEO) if os.path.abspath(path).startswith(VIDEO + os.sep) else path
    if not rows:
        rep.add('plan', 'INFO', f'{rel}: no table rows with shot ids found: the cross-check is skipped')
        return
    for sid in rows:
        if sid not in byid:
            rep.add('plan', 'ERROR', f'{rel} has a row for {sid}, the board has no such shot')
    for sid in ids:
        if sid not in rows:
            rep.add('plan', 'WARN', f'{sid} is on the board but not in {rel}')

    def col(d, *keys):
        out = []
        for h, cells in d.items():
            if any(k in h for k in keys):
                out += cells
        return out
    real_add = rep.add
    for sid, d in rows.items():
        sh = byid.get(sid)
        if not sh:
            continue
        k = ids.index(sid)
        items, keys = panels.get(sid, (None, None))
        # a placeholder panel in a draft: what the plan asks of it is its to-do list (a carrier mismatch stays an ERROR)
        if sh.get('placeholder') and data.get('draft'):
            rep.add = lambda w, sev, msg: real_add(w, 'TODO' if sev == 'WARN' else sev, msg)
        else:
            rep.add = real_add
        # move words
        board_words = set()
        for kk in (keys or []):
            if kk.get('word'):
                board_words.add(kk['word'].upper())
        if (sh.get('camera') or {}).get('word'):
            board_words.add(sh['camera']['word'].upper())
        for cell in col(d, 'move', 'camera'):
            head = re.split(r'[·,.;(:]', plain(cell), maxsplit=1)[0]   # the move word leads the cell
            want = [w for w in MOVE_WORDS if re.search(r'\b' + w + r'\b', head.upper())]
            for w in want:
                syn = next((s for s in MOVE_SYNONYMS if w in s), {w})
                if not any(any(x in bw for x in syn) for bw in board_words) and not sh.get('placeholder'):
                    rep.add(sid, 'WARN', f'the plan\'s move "{w}" is not among the board\'s camera words ({", ".join(sorted(board_words)) or "none"})')
        # carriers
        for h, cells in d.items():
            if not any(x in h for x in ('join', 'transition', 'carrier')):
                continue
            for cell in cells:
                car, by_code = find_carrier(cell)
                if not car:
                    rep.add(sid, 'INFO', f'the plan\'s "{h}" cell names no carrier letter I can read')
                    continue
                if by_code:
                    rep.add(sid, 'INFO', f'the plan\'s "{h}" cell names no letter: carrier {car} read from its join code')
                incoming = ' in' in f' {h}' or h.startswith('in')
                tgt = re.search(r'->\s*\**\s*(S\d+)', plain(cell))
                if incoming:
                    tr = sh.get('transition') if k > 0 else data.get('loopJoin')
                    where = sid
                else:
                    if tgt and tgt.group(1) in byid:
                        tsh = byid[tgt.group(1)]
                        tr = tsh.get('transition') if ids.index(tsh['id']) > 0 else data.get('loopJoin')
                    elif k + 1 < len(shots):
                        tr = shots[k + 1].get('transition')
                    else:
                        tr = data.get('loopJoin')
                    where = f'{sid}->'
                bc = (tr or {}).get('carrier')
                if bc != car:
                    rep.add(where, 'ERROR', f'the plan says carrier {car}, the board {bc or "none"} ({h})')
        # tiers
        for cell in col(d, 'tier'):
            letters = set(re.findall(r'\b([ABC])\s*[:=]', plain(cell)))
            letters |= {m.group(1) for part in plain(cell).split('·') for m in [re.match(r'\s*([ABC])\s+\S', part)] if m}
            for letter in sorted(letters):
                if items is not None and not any(tier_of(it.el, sh.get('tiers')) == letter for it in items):
                    rep.add(sid, 'WARN', f'the plan\'s tier map names {letter}, the board draws no tier-{letter} element', )
        # rig
        st = (data.get('sets') or {}).get(sh.get('set') or '') or {}
        rig = st.get('rig') or {}
        key = rig.get('key') or ''
        rname = str(rig.get('name') or sh.get('set') or '')
        for cell in col(d, 'rig', 'light'):
            c = plain(cell)
            nm = re.search(r'\bRig\s+([A-Z])\b', c)
            side = re.search(r'\bscreen\s+(left|right)\b', c, re.I) or re.search(r'\bkey\b[^.;()]*?\b(left|right|back|front|top)\b', c, re.I)
            if not rig:
                rep.add(sid, 'WARN', f'the plan names a rig ({nm.group(0) if nm else c[:30]}), the board\'s panel has none')
                continue
            if nm and rname and nm.group(1) != rname:
                rep.add(sid, 'WARN', f'the plan\'s rig is "{nm.group(0)}", the board\'s is "{rname}" (rig.name or the set\'s id)')
            if side and key and side.group(1).lower() not in key:
                rep.add(sid, 'WARN', f'the plan\'s rig key is "{side.group(1).lower()}", the board\'s set rig key is "{key}"')
        # life
        life = [x.lower() for x in (sh.get('life') or [])]
        for cell in col(d, 'life'):
            c = re.sub(r'\([^)]*\)', '', plain(cell))
            for item in re.split(r'[,;·]| and ', c):
                it = item.strip().strip('.').lower()
                if len(it) < 3 or it in ('none', '-', '—'):
                    continue
                words_ = [w for w in re.findall(r'[a-z]{3,}', it) if w not in ('the', 'and', 'far', 'one', 'its', 'with')]
                if words_ and not any(any(w in l for w in words_) for l in life):
                    rep.add(sid, 'WARN', f'the plan\'s life item "{item.strip()}" is not in the panel\'s life list')
    rep.add = real_add


# ------------------------------------------------------------------------------------------------ main
def main(argv):
    ap = argparse.ArgumentParser(description='the shared G3 board lint')
    ap.add_argument('json')
    ap.add_argument('--draft', action='store_true', help='an internal interim draft (placeholders and red marks (1)/(3) warn)')
    ap.add_argument('--plan', help='the camera plan (default docs/<film>/camera_plan_g3.md)')
    ap.add_argument('-v', '--verbose', action='store_true', help='print INFO lines too')
    ap.add_argument('--json-out', '--json', dest='json_out', help='write the report as JSON')
    a = ap.parse_args(argv[1:])
    with open(a.json) as f:
        data = json.load(f)
    fps = data.get('fps', 60)
    draft = a.draft or bool(data.get('draft'))
    owner = not draft
    film = data.get('film')
    if not film:
        m = re.search(r'public/(v\d+)/', os.path.abspath(a.json).replace(os.sep, '/'))
        film = m.group(1) if m else None
    plan = a.plan or (os.path.join(VIDEO, 'docs', film, 'camera_plan_g3.md') if film else None)
    rep = Report()
    panels = {}
    for shot in data.get('shots') or []:
        panels[shot['id']] = lint_panel(shot, data, rep, fps, draft, owner)
    check_film(data, rep, fps, draft, owner, panels, plan)
    shots = data.get('shots') or []
    print(f'board_lint (shared G3 kit): {a.json} ({len(shots)} shots, {data.get("durationSec")} s at {fps} fps, '
          f'{"DRAFT" if draft else "owner-facing"})')
    order = {s['id']: i for i, s in enumerate(shots)}

    def sort_key(line):
        w = line[0]
        base = w.split('->')[0]
        return (order.get(base, -1 if w in ('film', 'plan') else 999), w)
    clean = [s['id'] for s in shots if not any(w == s['id'] and sev in ('ERROR', 'WARN', 'TODO') for w, sev, _ in rep.lines)]
    for w, sev, msg in sorted(rep.lines, key=sort_key):
        if sev == 'INFO' and not a.verbose:
            continue
        print(f'  {w:<9} {sev:<5}  {msg}')
    if clean:
        print(f'  clean: {", ".join(clean)}')
    e, wn, td = rep.count('ERROR'), rep.count('WARN'), rep.count('TODO')
    print(f'{e} errors, {wn} warnings, {td} to-do{" (placeholder panels)" if td else ""}')
    if a.json_out:
        os.makedirs(os.path.dirname(os.path.abspath(a.json_out)), exist_ok=True)
        with open(a.json_out, 'w') as f:
            json.dump({'errors': e, 'warnings': wn, 'todo': td, 'lines': [{'where': w, 'sev': s, 'msg': m} for w, s, m in rep.lines]}, f, indent=1)
    return 1 if e else 0


if __name__ == '__main__':
    sys.exit(main(sys.argv))
