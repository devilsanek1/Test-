"""board_lint.py: the storyboard house-style lint for a SketchReel animatic (docs/look/STORYBOARD_STYLE.md §6). Run it
before every render of a board-mode animatic:

  python3 scripts/v3/board_lint.py public/v3/animatic.json

Per shot (screen positions are checked at BOTH camera ends, start positions with camera.from, end positions after the
moves with camera.to; both end frames must pass as panels):
  - elements: at most 25 (WARN), over 30 = split the panel (ERROR)
  - exactly one subject group: the elements with role 'subject' (or fill 'pop'), touching within 40 px; two groups on
    screen at the same time, or none, is an ERROR
  - at most 1 label (a `label` prop or a text without digits) and 1 mark (ERROR); more than 1 unstruck number (WARN)
  - text at least 48 px (ERROR)
  - fills from the board palette only: paper / light / mid / dark / pop (a #hex or unknown name is an ERROR; the sketch
    names warm / cold WARN: use light)
  - nothing crossing the caption band (y 290-600) except a far flat fill (a role-far rect / ellipse / closed line / hatch
    with a fill and no sw) (ERROR)
  - the subject's box centred in x 380-700 (ERROR) and 270-460 px wide (ERROR; a chart subject may span 456-760; a tall
    subject, taller than 1.3x its width like a standing figure, is measured by its height instead: 300-650 px, WARN)
  - the camera zoom changing at most 2x within a shot (ERROR; over 1.6x WARN: a push-in is at most 1.6x)
Exit code 1 if there is any ERROR.

Figure boxes come from the POSES table in src/v3/SketchReel.tsx and icon sizes from ICON_ASPECT in
src/v3/SketchIcons.tsx (both parsed, so they stay in sync).
"""
import ast
import json
import math
import os
import re
import sys

W, H = 1080, 1920
BAND = (290, 600)
STAGE_X = (380, 700)
SUBJECT_W = (270, 460)
CHART_W = (456, 760)
TALL_H = (300, 650)
TOUCH = 40
PALETTE = {'paper', 'light', 'mid', 'dark', 'pop'}
LEGACY = {'warm', 'cold'}
SRC = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'src', 'v3')


def js_literal(text):
    """a plain JS object literal (unquoted keys, numbers, arrays, true/false) -> Python"""
    text = re.sub(r'//[^\n]*', '', text)
    text = re.sub(r'([{,]\s*)([A-Za-z_]\w*)\s*:', r'\1"\2":', text)
    text = re.sub(r'\btrue\b', 'True', re.sub(r'\bfalse\b', 'False', text))
    return ast.literal_eval(text)


def load_tables():
    with open(os.path.join(SRC, 'SketchIcons.tsx')) as f:
        icons = f.read()
    m = re.search(r'ICON_ASPECT: Record<IconName, number> = (\{.*?\});', icons, re.S)
    aspect = js_literal(m.group(1)) if m else {}
    with open(os.path.join(SRC, 'SketchReel.tsx')) as f:
        reel = f.read()
    m = re.search(r'const POSES: Record<Pose, PoseDef> = (\{.*?\n\});', reel, re.S)
    poses = js_literal(m.group(1)) if m else {}
    return aspect, poses


ASPECT, POSES = load_tables()


def role_of(el):
    if el.get('role'):
        return el['role']
    if el.get('fill') == 'pop':
        return 'subject'
    f = el.get('f')
    return 'far' if f is not None and f < 0.5 else 'mid'


def figure_box(el):
    pose = POSES.get(el.get('pose', 'stand')) or POSES.get('stand')
    x, y, h = el['x'], el['y'], el['h']
    s = -1 if el.get('facing') == 'l' else 1
    us, vs = [], []
    hu, hv = pose['H']
    us += [hu - 0.09, hu + 0.09]
    vs += [hv + 0.09]
    for e, hand in pose['arms']:
        us += [e[0], hand[0] - 0.032, hand[0] + 0.032]
        vs += [e[1], hand[1] + 0.032]
    for k, foot in pose['legs']:
        us += [k[0], foot[0], foot[0] + 0.055]
    if pose.get('finger'):
        us.append(pose['arms'][1][1][0] + 0.075)
    us += [pose['S'][0] - 0.085, pose['S'][0] + 0.085]
    xs = [x + s * u * h for u in us]
    return min(xs), y - max(vs) * h, max(xs), y


def text_box(el, board):
    size = el.get('size', 64 if board else 48)
    w = 0.5 * size * len(el.get('text', ''))
    return el['x'] - w / 2, el['y'] - 0.75 * size, el['x'] + w / 2, el['y'] + 0.2 * size


def box(el, board):
    """world bounding box (x0, y0, x1, y1) of an element, or None"""
    t = el.get('t')
    if t in ('rect', 'hatch'):
        return el['x'], el['y'], el['x'] + el['w'], el['y'] + el['h']
    if t == 'ellipse':
        return el['cx'] - el['rx'], el['cy'] - el['ry'], el['cx'] + el['rx'], el['cy'] + el['ry']
    if t == 'line':
        xs = [p[0] for p in el['pts']]
        ys = [p[1] for p in el['pts']]
        return min(xs), min(ys), max(xs), max(ys)
    if t == 'arrow' or (t == 'mark' and el.get('kind') == 'arrow'):
        return min(el['x1'], el['x2']), min(el['y1'], el['y2']), max(el['x1'], el['x2']), max(el['y1'], el['y2'])
    if t == 'figure':
        return figure_box(el)
    if t == 'text':
        return text_box(el, board)
    if t == 'icon':
        h = el.get('h') or el['w'] * ASPECT.get(el.get('name'), 1)
        return el['x'], el['y'], el['x'] + el['w'], el['y'] + h
    if t == 'mark':
        x, y, w, h = el['x'], el['y'], el['w'], el['h']
        pad = {'circle': 22, 'underline': 14, 'frame': 12 + max(50, min(120, 0.18 * min(w, h))) * 0.71}.get(el.get('kind'), 0)
        if el.get('kind') == 'underline':
            return x - 8, y + h, x + w + 8, y + h + pad
        return x - pad, y - pad, x + w + pad, y + h + pad
    return None


def moved(b, el_index, shot, at_end):
    if b is None or not at_end:
        return b
    dx = sum(m['dx'] for m in shot.get('moves', []) if m['el'] == el_index)
    dy = sum(m['dy'] for m in shot.get('moves', []) if m['el'] == el_index)
    return b[0] + dx, b[1] + dy, b[2] + dx, b[3] + dy


def to_screen(b, cam):
    z = cam['z']
    return ((b[0] - cam['x']) * z + W / 2, (b[1] - cam['y']) * z + H / 2,
            (b[2] - cam['x']) * z + W / 2, (b[3] - cam['y']) * z + H / 2)


def union(bs):
    return min(b[0] for b in bs), min(b[1] for b in bs), max(b[2] for b in bs), max(b[3] for b in bs)


def near(a, b, tol):
    return a[0] - tol <= b[2] and b[0] - tol <= a[2] and a[1] - tol <= b[3] and b[1] - tol <= a[3]


def window(el, dur):
    return el.get('in', 0) or 0, el.get('out', dur) if el.get('out') is not None else dur


def is_far_flat(el):
    if role_of(el) != 'far' or el.get('sw'):
        return False
    t = el.get('t')
    if t == 'hatch':
        return True
    has_fill = el.get('fill') not in (None, 'paper')
    return has_fill and (t in ('rect', 'ellipse') or (t == 'line' and el.get('closed')))


def lint_shot(shot, board):
    out = []

    def err(msg):
        out.append(('ERROR', msg))

    def warn(msg):
        out.append(('WARN', msg))

    els = shot.get('els', [])
    dur = shot['e'] - shot['s']
    n = len(els)
    if n > 30:
        err(f'{n} elements: split the panel (one idea, 12-25 elements)')
    elif n > 25:
        warn(f'{n} elements (max 25; over 30 the panel gets split)')

    cam = shot['camera']
    ends = [(cam['from'], False, 'start'), (cam['to'], True, 'end')]

    # labels, numbers, marks, text size, fills
    labels = [i for i, e in enumerate(els) if e.get('label')]
    labels += [i for i, e in enumerate(els) if e.get('t') == 'text' and not re.search(r'\d', e.get('text', ''))]
    if len(labels) > 1:
        err(f'{len(labels)} labels (els {sorted(labels)}): at most 1, 56-72 px, only when the picture cannot say it')
    numbers = [i for i, e in enumerate(els) if e.get('t') == 'text' and re.search(r'\d', e.get('text', '')) and not e.get('strike')]
    if len(numbers) > 1:
        warn(f'{len(numbers)} numbers (els {numbers}): one per panel (a change = the old one struck through + the new one)')
    marks = [i for i, e in enumerate(els) if e.get('t') == 'mark']
    if len(marks) > 1:
        err(f'{len(marks)} marks (els {marks}): at most 1 red mark per panel')
    for i, e in enumerate(els):
        if e.get('t') == 'text':
            size = e.get('size', 64 if board else 48)
            if size < 48:
                err(f'el {i} text "{e.get("text")}" is {size} px (min 48; labels 56-72)')
        fill = e.get('fill')
        if fill is None or (e.get('t') == 'icon' and fill == 'none'):
            continue
        if fill in LEGACY:
            warn(f"el {i} fill '{fill}' is a sketch name: use 'light'")
        elif fill not in PALETTE:
            err(f"el {i} fill '{fill}' is not a board tone (paper / light / mid / dark / pop)")

    # caption band
    crossing = set()
    for i, e in enumerate(els):
        if is_far_flat(e):
            continue
        for c, at_end, _ in ends:
            b = moved(box(e, board), i, shot, at_end)
            if b is None:
                continue
            sb = to_screen(b, c)
            if sb[1] < BAND[1] and sb[3] > BAND[0] and sb[0] < W and sb[2] > 0:
                crossing.add(i)
    if crossing:
        err(f'els {sorted(crossing)} cross the caption band (y {BAND[0]}-{BAND[1]}): only a far flat fill may')

    # subject group(s)
    subj = [i for i, e in enumerate(els) if e.get('t') != 'mark' and role_of(e) == 'subject' and box(e, board)]
    if not subj:
        err("no subject: give the subject's elements role 'subject' (or fill 'pop')")
    else:
        end_box = {i: to_screen(moved(box(els[i], board), i, shot, True), cam['to']) for i in subj}
        parent = {i: i for i in subj}

        def find(a):
            while parent[a] != a:
                parent[a] = parent[parent[a]]
                a = parent[a]
            return a
        for a in subj:
            for b in subj:
                if a < b and near(end_box[a], end_box[b], TOUCH):
                    parent[find(a)] = find(b)
        groups = {}
        for i in subj:
            groups.setdefault(find(i), []).append(i)
        groups = list(groups.values())
        spans = [(min(window(els[i], dur)[0] for i in g), max(window(els[i], dur)[1] for i in g)) for g in groups]
        clash = [(a, b) for a in range(len(groups)) for b in range(a + 1, len(groups))
                 if spans[a][0] < spans[b][1] and spans[b][0] < spans[a][1]]
        if clash:
            err(f'{len(groups)} subject groups on screen together ({", ".join(str(sorted(g)) for g in groups)}): one subject per panel')
        for g in groups:
            chart = any(els[i].get('t') == 'icon' and els[i].get('name') == 'chart' for i in g)
            lo, hi = CHART_W if chart else SUBJECT_W
            for c, at_end, which in ends:
                sb = union([to_screen(moved(box(els[i], board), i, shot, at_end), c) for i in g])
                cx = (sb[0] + sb[2]) / 2
                w = sb[2] - sb[0]
                h = sb[3] - sb[1]
                if not STAGE_X[0] <= cx <= STAGE_X[1]:
                    err(f'subject {sorted(g)} centred at x {cx:.0f} at the {which} (centre axis x {STAGE_X[0]}-{STAGE_X[1]})')
                if h > 1.3 * w and not chart:
                    if not TALL_H[0] <= h <= TALL_H[1]:
                        warn(f'tall subject {sorted(g)} is {h:.0f} px high at the {which} ({TALL_H[0]}-{TALL_H[1]})')
                elif not lo <= w <= hi:
                    err(f'subject {sorted(g)} is {w:.0f} px wide at the {which} ({lo}-{hi}{", chart" if chart else ""})')

    # camera zoom
    z0, z1 = cam['from']['z'], cam['to']['z']
    ratio = max(z0, z1) / max(1e-6, min(z0, z1))
    if ratio > 2:
        err(f'camera zoom changes {ratio:.2f}x in the shot: over 2x becomes a cut to a closer panel')
    elif ratio > 1.6:
        warn(f'camera zoom changes {ratio:.2f}x: a push-in is at most 1.6x')
    return out


def main(argv):
    if len(argv) < 2:
        print(__doc__)
        return 2
    path = argv[1]
    with open(path) as f:
        data = json.load(f)
    style = data.get('style', 'board')
    board = style == 'board'
    shots = data.get('shots', [])
    print(f'board_lint: {path} (style {style}, {len(shots)} shots)')
    if not board:
        print("  WARN  style is 'sketch': set \"style\": \"board\" for the house look")
    errors = warnings = 0
    clean = []
    for shot in shots:
        issues = lint_shot(shot, board)
        if not issues:
            clean.append(shot['id'])
        for sev, msg in issues:
            print(f'  {shot["id"]:<6} {sev:<5}  {msg}')
            errors += sev == 'ERROR'
            warnings += sev == 'WARN'
    if clean:
        print(f'  clean: {", ".join(clean)}')
    print(f'{errors} errors, {warnings} warnings in {len(shots) - len(clean)} of {len(shots)} shots')
    return 1 if errors else 0


if __name__ == '__main__':
    sys.exit(main(sys.argv))
