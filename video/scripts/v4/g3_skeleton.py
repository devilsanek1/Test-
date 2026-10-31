"""g3_skeleton.py: video 4's G3 board SKELETON (public/v4/animatic.json): the 12 shots of the locked visual script on
the take's clock, each a placeholder panel with its name, so the reel plays end to end with the voice before the
panels are drawn (phase B replaces each placeholder with its drawing; the lint lists what each still needs as TODO).

  python3 -I scripts/v4/g3_skeleton.py && python3 -I scripts/g3/board_lint.py public/v4/animatic.json
  node scripts/render-media.mjs G3Reel out/v4/g3_skeleton.mp4 --entry=src/entry-v4.tsx --scale=0.5

Read from docs/v4/visual/VISUAL_SCRIPT.md (never edited here): each block's id and times (### S1 · 0.00-4.28 s), the
at-a-glance line (its name and its join out), the Camera line (the shot type, the move words, the lead frame device and
the move's code), the Join line (the carrier letter, the join's code, what carries it) and the Notes' life list; the
loop's join from "## The loop back to frame 0". Words from public/v4/voice_words.json. The board is a draft
("draft": true) until every placeholder is drawn. Re-runnable: it overwrites the skeleton, so never run it over a drawn
board (it refuses when a shot is no longer a placeholder, unless --force).
"""
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
VIDEO = os.path.normpath(os.path.join(HERE, '..', '..'))
sys.path.insert(0, os.path.join(VIDEO, 'scripts', 'g3'))
import g3kit as k  # noqa: E402

VS = os.path.join(VIDEO, 'docs', 'v4', 'visual', 'VISUAL_SCRIPT.md')
PLAN = os.path.join(VIDEO, 'docs', 'v4', 'camera_plan_g3.md')
WORDS = os.path.join(VIDEO, 'public', 'v4', 'voice_words.json')
OUT = os.path.join(VIDEO, 'public', 'v4', 'animatic.json')
MOVES = ['PUSH IN', 'PULL BACK', 'PULL OUT', 'DOLLY IN', 'DOLLY BACK', 'TILT DOWN', 'TILT UP', 'FOLLOW', 'HOLD', 'RISE', 'PAN L',
         'PAN R', 'DIVE', 'CRANE', 'SETTLE']
JOIN_DEVICE = {'RJ4': 'continuous', 'RM3': 'continuous', 'RJ2': 'plain-cut', 'RJ3': 'thread-match', 'J2': 'push-through',
               'J3': 'match-cut'}


def wrap(s, n):
    out, cur = [], ''
    for w in s.split():
        if cur and len(cur) + 1 + len(w) > n:
            out.append(cur)
            cur = w
        else:
            cur = f'{cur} {w}'.strip()
    if cur:
        out.append(cur)
    return out


def parse():
    text = open(VS).read()
    version = re.search(r'^# .*?\((v\d+)[^)]*\)', text, re.M)
    glance = {}
    for m in re.finditer(r'^- (S\d+) · ([\d.]+)-([\d.]+) · (.+?) · ([A-F])\b', text, re.M):
        glance[m.group(1)] = {'s': float(m.group(2)), 'e': float(m.group(3)), 'name': m.group(4).strip(), 'out': m.group(5)}
    blocks = {}
    heads = list(re.finditer(r'^### (S\d+) · ([\d.]+)-([\d.]+) s[^\n]*$', text, re.M))
    for i, h in enumerate(heads):
        body = text[h.end(): heads[i + 1].start() if i + 1 < len(heads) else text.find('\n## ', h.end())]
        sid = h.group(1)
        cam = re.search(r'^- \*\*Camera:\*\* (.+)$', body, re.M)
        join = re.search(r'^- \*\*Join:\*\* (.+)$', body, re.M)
        notes = re.search(r'^- \*\*Notes:\*\* (.+)$', body, re.M)
        cam_t = cam.group(1) if cam else ''
        typ = cam_t.split(' · ')[0].strip()
        mv = cam_t[cam_t.find('move:') + 5:] if 'move:' in cam_t else cam_t
        words = [w for w in MOVES if re.search(r'\b' + w + r'\b', mv.split('·')[0].upper())]
        if not words and re.search(r'\b(locked|held|at rest)\b', mv, re.I):
            words = ['HOLD']
        lead = re.search(r'\blead (?:\*\*)?([A-Z]\d+)', cam_t)
        mcode = re.search(r'\b(RM\d+|I\d+)\b', mv)
        j = join.group(1) if join else ''
        jm = re.search(r'->\s*(S\d+)[^:]*:\s*([A-F])\b,?\s*((?:RJ|RM|J)\d+)?', j)
        what = re.search(r'carried by ([^:;.,]+)', j)
        life = re.search(r'life:\s*([^;]+)', notes.group(1)) if notes else None
        blocks[sid] = {
            's': float(h.group(2)), 'e': float(h.group(3)), 'type': typ, 'moves': words or ['HOLD'],
            'lead': lead.group(1) if lead else None, 'mcode': mcode.group(1) if mcode else None,
            'to': jm.group(1) if jm else None, 'carrier': jm.group(2) if jm else None, 'jcode': jm.group(3) if jm else None,
            'what': what.group(1).strip() if what else None,
            'life': [x.strip() for x in re.split(r',| and ', life.group(1)) if x.strip()] if life else [],
            'scale': 'one scale shot' in h.group(0),
        }
    loop = re.search(r'\*\*Join -> S1 on "[^"]*" \(([\d.]+)\):\*\* ([A-F]), ((?:RJ|RM|J)\d+)', text)
    return (version.group(1) if version else '?'), glance, blocks, loop


def plan_life():
    """each shot's life list from the camera plan (the G3 contract draft) when it exists: '- **life:** a · b · c'"""
    if not os.path.exists(PLAN):
        return {}
    sys.path.insert(0, os.path.join(VIDEO, 'scripts', 'g3'))
    import board_lint as bl  # noqa: E402
    out = {}
    for sid, d in bl.md_blocks(open(PLAN).read()).items():
        cells = d.get('life (block)')
        if cells:
            c = re.sub(r'\([^)]*\)', '', bl.plain(cells[0]))
            out[sid] = [x.strip().rstrip('.').strip() for x in c.split('·') if x.strip().rstrip('.').strip()]
    return out


def main(argv):
    force = '--force' in argv
    if os.path.exists(OUT) and not force:
        old = json.load(open(OUT))
        drawn = [s['id'] for s in old.get('shots', []) if not s.get('placeholder')]
        if drawn:
            print(f'{os.path.relpath(OUT, VIDEO)} has drawn panels ({", ".join(drawn)}): not overwriting (use --force)')
            return 1
    version, glance, blocks, loop = parse()
    plife = plan_life()
    for sid, items in plife.items():
        if sid in blocks:
            blocks[sid]['life'] = items
    voice = json.load(open(WORDS))
    words = voice['words']
    dur = voice['durationSec']
    ids = [sid for sid in sorted(blocks, key=lambda x: blocks[x]['s'])]
    shots = []
    for n, sid in enumerate(ids):
        b = blocks[sid]
        g = glance.get(sid, {})
        prev = blocks[ids[n - 1]] if n else None
        p = k.Panel(sid, b['s'], b['e'],
                    note=f'{b["type"].upper()} · planned: {" + ".join(b["moves"])}\n{g.get("name", "")}',
                    name=g.get('name'), type=b['type'].upper(), placeholder=True, life=b['life'],
                    comp={k_: v for k_, v in (('frame', b['lead']), ('move', b['mcode']),
                                               ('join', b['jcode'])) if v})
        if b['scale']:
            p.extra['reveal'] = True
        dur_s = b['e'] - b['s']
        # the placeholder: a light panel frame, the shot id big, its name, a line that draws across the shot's time
        p.add(k.rect(110, 640, 860, 1000, tier='B', negative=True, promise='the drawn panel goes here'), 'frame')
        p.add(k.text(540, 840, sid, size=180, tier='A'), 'id')
        for i, ln in enumerate(wrap(g.get('name', ''), 24)[:4]):
            p.add(k.text(540, 990 + i * 78, ln, size=62, tier='B'), f'name{i}')
        p.add(k.line([[200, 1400], [880, 1400]], tier='B', curve='joined', draw=[0, round(dur_s, 3)], tip=True,
                     promise='the shot\'s time, drawn across it'), 'clock')
        p.add(k.text(540, 1500, f'{b["s"]:.2f}-{b["e"]:.2f} s · {b["type"].split(",")[0]}', size=52, tier='B'), 'times')
        tr = prev and {'carrier': prev['carrier'], 'code': prev['jcode'], 'what': prev['what']}
        if n == 0:
            transition = k.join('B', 'thread-match', what='frame 0: the loop', label='frame 0')
        else:
            dev = JOIN_DEVICE.get(tr['code'] or '', k.DEVICE_OF.get(tr['carrier']))
            transition = k.join(tr['carrier'], dev, what=tr['what'] or tr['code'])
        shots.append(p.shot(transition=transition))
    last = blocks[ids[-1]]
    loop_join = k.join(loop.group(2) if loop else (last['carrier'] or 'B'), JOIN_DEVICE.get(loop.group(3) if loop else 'RJ3', 'thread-match'),
                       what='the run\'s start and the brush tip at frame 0' if loop else None)
    reveal = next(([blocks[s]['s'], blocks[s]['e']] for s in ids if blocks[s]['scale']), None)
    data = k.animatic('v4', f'v4 G3 SKELETON (visual script {version}: 12 placeholder panels)', 'v4/voice.wav', words, shots, dur,
                      draft=True, loopJoin=loop_join,
                      throughline={'thread': 'the heat: warm water in a pipe, the melt over it, the steam where it is let go',
                                   'home': 'the one window and its radiator', **({'reveal': reveal} if reveal else {})})
    k.write(OUT, data)
    print(f'life lists from {"the camera plan" if plife else "the visual script"}')
    print(f'wrote {os.path.relpath(OUT, VIDEO)}: {len(shots)} placeholder panels from VISUAL_SCRIPT {version}, '
          f'{dur} s; joins in: ' + ', '.join(f'{s["id"]} {s["transition"]["carrier"]}' for s in shots) +
          f'; loop {loop_join["carrier"]}')
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv))
