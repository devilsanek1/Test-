#!/usr/bin/env python3
"""build_captions.py: the film's words on screen per docs/look/TYPE_GUIDE.md (PICKED 2026-10-30), for src/lib/captions2.

  python3 scripts/captions2/build_captions.py scripts/captions2/v4_groups.txt          # groups file -> captions2.json
  python3 scripts/captions2/build_captions.py --propose public/v4/voice_words.json [--hints h.txt] [--out g.txt]

BUILD reads a short groups file (below), aligns its words to the voice's words (every voice word exactly once, in order),
resolves each group's recipe from src/lib/captions2/recipes.json (sizes, rows, seats), times it (a piece pops 2 frames
before its build chunk's first word; a group leaves when the next pops, or holds up to 36 frames into a pause; a
sentence end before a pause >= 0.4 s leaves soft), lays it out on Chromium-measured metrics (scripts/captions2/
measure.mjs, the same measure and rules as src/lib/captions2/layout.ts), picks the free seats (the walk: L, R, C ...,
never the same seat three times running, moves <= 220 px), runs the guide's checks (section f) and writes the caption
file (default: the file's @out). Exit 1 on an error (a voice word missing or out of order, ink outside the type frame,
a line over 830 px, a row gap under 20 px, two lit words in a group, three groups over 20 cps in a row); warnings are
the guide's soft numbers (2-4 words, >= 0.8 s, <= 20 cps, <= 7 words on screen, a built word >= 0.35 s on screen).

PROPOSE writes a groups file from the voice alone, by the guide's rules: groups of 2-4 words, >= 0.8 s, <= 20 cps,
never across a sentence, a phrase shorter than 0.8 s joining the next as a build, lines broken by Netflix's rules
(never an article from its noun, an adjective from its noun, a preposition from its object, a verb from its pronoun or
auxiliary; prefer a break after punctuation and before a conjunction or a preposition) into a bottom-heavy pair, one line
when it fits 760 px; the recipes it can tell from the words: R2 the film's first two groups, R3 a spoken number (as
numerals, with the next word as its unit), R4 a word the take writes in capitals, R9 the last sentence (with --key or
@key: the core line's key word); a hints file names the rest (lines: `@key heat`, `@r5 hot.`, `@r6 That's a lot of
tea.`, `@r8 19.26-23.46`, `@shot S2 4.28`, `@keep data centers`: a phrase never broken). Review the proposal by eye: it
is a draft (no grammar parser: compounds and fixed phrases come from @keep).

GROUPS FILE: '#' comments; header lines `@film v4`, `@words <voice_words.json>`, `@out <captions2.json>`, `@tone dark|light`
(the sky's tone: dark = dusk / night: warm white and honey; light = day: plum), `@key <word>`, `@shot <name> <start s>
[<type>]` (groups after it belong to that shot: seats walk within a shot), `@world R7 <text> at=<s|word> until=<s>
width=<object px> object="<what it sits on>"`, `@cover <rows with / and *key*>`. One group per line:

  <recipe>[.<part>] [opts] | <words, rows split by " / ">

recipe R1-R9 (R9.last = the payoff's last group); opts: seat=L|C|R|auto, step=<px>, x=<px>[,<px>...] (anchored rows'
ink start), tone=dark|light, enter=pop|soft, leave=auto|cut|soft, out=<s> (leave at), hold=<frames>, track=<em> (an
exception: tightens a group the frame cannot hold; warned), id=<name>. Words: `+word` starts a build chunk (it and the
words after it pop on its time; no `+` = the group pops whole); `*word*` is the stressed word (R4 / R9 landing, R5
lift); `[70,000](seventy thousand)` draws numerals for spoken words. Spelling and case are the picture's (the take's
"WANTS" is set "wants"); words are matched to the voice by their letters.
"""
import argparse
import json
import math
import os
import re
import subprocess
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
VIDEO = HERE.parent.parent
RECIPES = json.loads((VIDEO / 'src/lib/captions2/recipes.json').read_text())
FPS = RECIPES['fps']
LEAD = RECIPES['lead']
CACHE = VIDEO / 'node_modules/.cache/captions2/metrics.json'


def norm(s):
    return re.sub(r'[^a-z0-9]', '', s.lower())


# ------------------------------------------------------------------------------------------------ metrics (Chromium)

class Metrics:
    """Ink metrics from Chromium's canvas (scripts/captions2/measure.mjs), cached; PIL estimates only as a fallback."""

    def __init__(self, allow_browser=True):
        self.cache = {}
        self.allow = allow_browser
        self.estimated = False
        if CACHE.exists():
            try:
                self.cache = json.loads(CACHE.read_text())
            except Exception:
                self.cache = {}

    @staticmethod
    def key(t, w, size, track):
        return f'{w}|{size:g}|{track:g}|{t}'

    def need(self, items):
        missing = [it for it in items if self.key(*it) not in self.cache]
        missing = list({self.key(*it): it for it in missing}.values())
        if not missing:
            return
        if self.allow:
            tmp = CACHE.parent
            tmp.mkdir(parents=True, exist_ok=True)
            fin, fout = tmp / 'measure_in.json', tmp / 'measure_out.json'
            fin.write_text(json.dumps({'items': [{'t': t, 'w': w, 'size': s, 'track': tr} for t, w, s, tr in missing]}))
            try:
                subprocess.run(['node', str(HERE / 'measure.mjs'), str(fin), str(fout)], check=True, cwd=VIDEO,
                               stdout=subprocess.DEVNULL, stderr=subprocess.PIPE, timeout=180)
                for it in json.loads(fout.read_text())['items']:
                    self.cache[self.key(it['t'], it['w'], it['size'], it['track'])] = [it['adv'], it['left'], it['right'], it['asc'], it['desc']]
                CACHE.write_text(json.dumps(self.cache))
                return
            except Exception as e:  # no node / browser: estimate
                print(f'[captions2] WARNING: Chromium measure failed ({e}); using PIL estimates', file=sys.stderr)
                self.allow = False
        from PIL import ImageFont
        self.estimated = True
        for t, w, s, tr in missing:
            f = ImageFont.truetype(str(VIDEO / f'public/fonts/Gaegu-{w}.woff2'), max(1, int(round(s))))
            adv = f.getlength(t) + tr * s * len(t)
            x0, y0, x1, y1 = f.getbbox(t, anchor='ls')
            self.cache[self.key(t, w, s, tr)] = [adv, x0, x1 + tr * s * max(0, len(t) - 1) - tr * s, -y0, y1]

    def get(self, t, w, size, track):
        k = self.key(t, w, size, track)
        if k not in self.cache:
            self.need([(t, w, size, track)])
        a = self.cache[k]
        return {'adv': a[0], 'left': a[1], 'right': a[2], 'asc': a[3], 'desc': a[4]}


# ------------------------------------------------------------------------------------------------ layout (= layout.ts)

def piece_shape(M, p):
    one = M.get(p['t'], p['weight'], p['size'], p['track'])
    if not p.get('tuck') or ',' not in p['t']:
        return [(p['t'], 0.0)], one
    toks = [x for x in re.split(r'(,)', p['t']) if x]
    parts, ox, prev_right, asc, desc = [], 0.0, 0.0, 0.0, 0.0
    left = right = adv = 0.0
    for i, tok in enumerate(toks):
        m = M.get(tok, p['weight'], p['size'], p['track'])
        if i > 0:
            g = (p['tuck'][0] if tok == ',' else p['tuck'][1]) * p['size']
            ox = prev_right + g - m['left']
        else:
            left = m['left']
        parts.append((tok, ox))
        prev_right = ox + m['right']
        right, adv = prev_right, ox + m['adv']
        asc, desc = max(asc, m['asc']), max(desc, m['desc'])
    return parts, {'adv': adv, 'left': left, 'right': right, 'asc': asc, 'desc': desc}


def row_shape(M, row):
    out, left, right, asc, desc = [], math.inf, -math.inf, 0.0, 0.0
    for j, p in enumerate(row['pieces']):
        parts, m = piece_shape(M, p)
        ox = 0.0
        if j > 0:
            pparts, pm, pox = out[j - 1]
            pp = row['pieces'][j - 1]
            if p.get('gap') is not None:
                ox = pox + pm['right'] + p['gap'] - m['left']
            else:
                ox = pox + pm['adv'] + M.get(' ', pp['weight'], pp['size'], pp['track'])['adv']
        out.append((parts, m, ox))
        left, right = min(left, ox + m['left']), max(right, ox + m['right'])
        asc, desc = max(asc, m['asc']), max(desc, m['desc'])
    return {'pieces': out, 'left': left, 'right': right, 'asc': asc, 'desc': desc}


def layout_group(M, g):
    shapes = [row_shape(M, r) for r in g['rows']]
    shift = []
    if g.get('seat'):
        step = g.get('step', RECIPES['step']['default'])
        offs = [r['dx'] if r.get('dx') is not None else i * step for i, r in enumerate(g['rows'])]
        widths = [s['right'] - s['left'] for s in shapes]
        left = min(offs)
        right = max(d + w for d, w in zip(offs, widths))
        x0 = RECIPES['seats'][g['seat']] - (left + right) / 2
        shift = [x0 + offs[i] - s['left'] for i, s in enumerate(shapes)]
    else:
        for r, s in zip(g['rows'], shapes):
            x, a = r.get('x', 0), r.get('anchor', 'start')
            shift.append(x - s['left'] if a == 'start' else x - s['right'] if a == 'end' else x - (s['left'] + s['right']) / 2)
    placed = []
    for i, r in enumerate(g['rows']):
        for j, (parts, m, ox) in enumerate(shapes[i]['pieces']):
            o = shift[i] + ox
            p = r['pieces'][j]
            boxes = []
            for tok, dx in parts:
                pm = M.get(tok, p['weight'], p['size'], p['track']) if len(parts) > 1 else m
                boxes.append({'x0': o + dx + pm['left'], 'x1': o + dx + pm['right'], 'top': r['baseline'] - pm['asc'], 'bottom': r['baseline'] + pm['desc']})
            placed.append({'row': i, 'index': j, 't': p['t'], 'lit': p['lit'], 'y': r['baseline'], 'parts': boxes,
                           'x0': o + m['left'], 'x1': o + m['right'], 'top': r['baseline'] - m['asc'], 'bottom': r['baseline'] + m['desc']})
    rows = []
    for i, r in enumerate(g['rows']):
        ps = [p for p in placed if p['row'] == i]
        rows.append({'x0': min(p['x0'] for p in ps), 'x1': max(p['x1'] for p in ps), 'top': min(p['top'] for p in ps), 'bottom': max(p['bottom'] for p in ps)})
    box = {'x0': min(p['x0'] for p in placed), 'x1': max(p['x1'] for p in placed), 'y0': min(p['top'] for p in placed), 'y1': max(p['bottom'] for p in placed)}
    box['cx'] = (box['x0'] + box['x1']) / 2
    return placed, rows, box


def frame_errors(placed):
    F = RECIPES['frame']
    errs = []
    for p in placed:
        lim = F['x1'] if p['bottom'] <= F['yLow'] else F['x1Low']
        if p['x0'] < F['x0'] - 0.5 or p['x1'] > lim + 0.5:
            errs.append(f'"{p["t"]}" ink x {p["x0"]:.0f}-{p["x1"]:.0f} outside x {F["x0"]}-{lim}')
        if p['top'] < F['y0'] - 0.5 or p['bottom'] > F['y1'] + 0.5:
            errs.append(f'"{p["t"]}" ink y {p["top"]:.0f}-{p["bottom"]:.0f} outside y {F["y0"]}-{F["y1"]}')
        if p['y'] <= 600 and p['bottom'] > F['bandFloor'] + 0.5:
            errs.append(f'"{p["t"]}" ink bottom {p["bottom"]:.0f} below the band floor {F["bandFloor"]}')
    return errs


# ------------------------------------------------------------------------------------------------ the groups file

TOKEN = re.compile(r'\[([^\]]*)\]\(([^)]*)\)|(\S+)')


def parse_tokens(text):
    """'+a *b* [70,000](seventy thousand) / c' -> rows of tokens {disp, voice (letters to match), build, stress}."""
    rows, cur = [], []
    for m in TOKEN.finditer(text):
        if m.group(3) == '/':
            rows.append(cur)
            cur = []
            continue
        if m.group(1) is not None:
            disp, voice, build, stress = m.group(1), m.group(2), False, False
            # a build mark may sit before the bracket: "+[40](FORTY)"
            pre = text[max(0, m.start() - 1):m.start()]
            build = pre == '+'
        else:
            raw = m.group(3)
            build = raw.startswith('+')
            raw = raw.lstrip('+')
            if raw.startswith('[') and '](' in raw:
                continue  # handled by the bracket alternative (a '+' prefix glued on)
            stress = raw.startswith('*') and raw.rstrip('.,?!;:').endswith('*') and len(raw) > 2
            disp = raw.replace('*', '') if stress else raw
            voice = disp
        cur.append({'disp': disp, 'voice': voice, 'build': build, 'stress': stress})
    rows.append(cur)
    return [r for r in rows if r]


def fix_plus_brackets(text):
    # "+[70,000](seventy thousand)" -> the regex sees '+' as part of \S+ only if glued; normalise to "+ [..](..)" marker
    return re.sub(r'\+\[', ' +[', text)


def parse_groups_file(path):
    hdr = {'film': None, 'words': None, 'out': None, 'tone': 'dark', 'key': None, 'world': [], 'cover': None}
    groups, shot = [], None
    for ln_no, raw in enumerate(Path(path).read_text(encoding='utf8').splitlines(), 1):
        line = raw.split(' #')[0].rstrip() if not raw.lstrip().startswith('#') else ''
        line = line.strip()
        if not line:
            continue
        if line.startswith('@'):
            k, _, v = line[1:].partition(' ')
            v = v.strip()
            if k == 'shot':
                parts = v.split()
                shot = {'name': parts[0], 'start': float(parts[1]) if len(parts) > 1 else None, 'type': ' '.join(parts[2:])}
            elif k == 'world':
                hdr['world'].append(v)
            elif k in hdr:
                hdr[k] = v
            else:
                raise SystemExit(f'{path}:{ln_no}: unknown header @{k}')
            continue
        if '|' not in line:
            raise SystemExit(f'{path}:{ln_no}: a group line is "<recipe> [opts] | <words>"')
        left, text = line.split('|', 1)
        parts = left.split()
        recipe, _, part = parts[0].partition('.')
        opts = {}
        for o in parts[1:]:
            if '=' not in o:
                raise SystemExit(f'{path}:{ln_no}: option "{o}" is not key=value')
            k, v = o.split('=', 1)
            opts[k] = v
        groups.append({'recipe': recipe, 'part': part or None, 'opts': opts, 'text': text.strip(), 'shot': shot, 'line': ln_no,
                       'rows_tok': parse_tokens(fix_plus_brackets(text.strip()))})
    return hdr, groups


# ------------------------------------------------------------------------------------------------ alignment

def align(groups, words):
    """Assign voice word indices to every token, in order, each voice word exactly once. Errors are fatal."""
    wi = 0
    vn = [norm(w['w']) for w in words]
    for g in groups:
        for row in g['rows_tok']:
            for tok in row:
                want = norm(tok['voice'])
                got, acc = [], ''
                while wi < len(words) and len(acc) < len(want):
                    acc += vn[wi]
                    got.append(wi)
                    wi += 1
                if acc != want:
                    ctx = ' '.join(w['w'] for w in words[max(0, (got[0] if got else wi) - 2):(got[0] if got else wi) + 4])
                    raise SystemExit(f'[captions2] ERROR line {g["line"]}: "{tok["disp"]}" does not match the voice here ("{ctx}")')
                tok['words'] = got
    if wi != len(words):
        raise SystemExit(f'[captions2] ERROR: the voice goes on after the last group: "{" ".join(w["w"] for w in words[wi:wi + 8])}"')


# ------------------------------------------------------------------------------------------------ resolve recipes

def style(name, tone):
    st = RECIPES['styles'][name]
    size = st['size'][tone] if isinstance(st['size'], dict) else st['size']
    weight = st['weight'] if st['weight'] is not None else RECIPES['tones'][tone]['weight']
    out = {'style': name, 'size': size, 'weight': weight, 'track': st['track'], 'lit': bool(st['lit'])}
    if st.get('tuck'):
        out['tuck'] = st['tuck']
    return out


def resolve(g, tone, words, first_group):
    """Rows of pieces with styles, places and build times, from the recipe and the group's options."""
    R = RECIPES['recipes'][g['recipe']]
    rec, part, opts = g['recipe'], g['part'], g['opts']
    if rec == 'R9' and part == 'last':
        R = dict(R['last'], name=R['name'] + ' (the last group)')
    toks = g['rows_tok']
    nrows = len(toks)
    track_over = float(opts['track']) if 'track' in opts else None

    # the build chunks: a token with '+' starts a chunk; the first token starts the first
    at = None
    first_tok = toks[0][0]
    for row in toks:
        for tok in row:
            if at is None or tok['build']:
                at = 0.0 if (first_group and tok is first_tok) else words[tok['words'][0]]['s']
            tok['at'] = at

    def mk(tok, sty):
        s = style(sty, tone)
        if track_over is not None:
            s['track'] = track_over
        ws = tok['words']
        return dict(t=tok['disp'], words=ws, s=words[ws[0]]['s'], e=words[ws[-1]]['e'], at=round(tok['at'], 4), **s)

    rows, seat, step = [], None, None
    stress = None
    place = R.get('place')
    if place == 'seat':
        base = R['one'] if nrows == 1 else R['two']
        if nrows > len(R['two']):
            raise SystemExit(f'[captions2] ERROR line {g["line"]}: {rec} takes at most 2 rows')
        anchored_x = opts.get('x')
        if rec == 'R2' and first_group and not anchored_x and 'seat' not in opts:
            anchored_x = ','.join(str(r['x']) for r in R['firstRows'][:nrows])
        for i, row in enumerate(toks):
            pcs = []
            for tok in row:
                sty = R['style']
                if tok['stress']:
                    sty = 'lift' if R.get('stress') == 'lift' or rec in ('R1', 'R8') else 'landing'
                    stress = {'kind': 'lift' if sty == 'lift' else 'landing', 't': tok['disp'], 'piece': [i, len(pcs)]}
                pcs.append(mk(tok, sty))
            rows.append({'baseline': base[i], 'pieces': pcs})
        if anchored_x:
            xs = [float(v) for v in anchored_x.split(',')]
            for i, r in enumerate(rows):
                r['x'], r['anchor'] = xs[min(i, len(xs) - 1)], opts.get('anchor', 'start')
        else:
            seat = opts.get('seat', R.get('seat', 'auto'))
            step = float(opts.get('step', RECIPES['step']['default']))
    else:
        spec = R['rows']
        if rec == 'R3':
            if nrows != 2:
                raise SystemExit(f'[captions2] ERROR line {g["line"]}: R3 is the number on row 1 and its unit on row 2')
        if nrows > len(spec):
            raise SystemExit(f'[captions2] ERROR line {g["line"]}: {rec} takes at most {len(spec)} rows')
        xs = [float(v) for v in opts['x'].split(',')] if 'x' in opts else None
        for i, row in enumerate(toks):
            rs = spec[i]
            pcs = []
            for j, tok in enumerate(row):
                sty = rs['style']
                gap = None
                if rec == 'R6' and rs.get('last') and j == len(row) - 1 and len(row) > 1:
                    sty, gap = rs['last'], rs['lastGap'] * RECIPES['styles'][rs['style']]['size']
                if tok['stress']:
                    sty = 'landing'
                    stress = {'kind': 'landing', 't': tok['disp'], 'piece': [i, j]}
                    if rs.get('keyGap') is not None and j > 0:
                        gap = rs['keyGap']
                if rec == 'R3' and i == 0:
                    stress = {'kind': 'number', 't': tok['disp'], 'piece': [i, j]}
                p = mk(tok, sty)
                if gap is not None:
                    p['gap'] = gap
                pcs.append(p)
            r = {'baseline': rs['baseline'], 'x': xs[i] if xs and i < len(xs) else rs['x'], 'anchor': opts.get('anchor', rs['anchor']), 'pieces': pcs}
            rows.append(r)
        if rec == 'R4' and (len(toks) != 3 or len(toks[1]) != 1 or not stress):
            raise SystemExit(f'[captions2] ERROR line {g["line"]}: R4 is three rows with the *landing word* alone on row 2')
    return rows, seat, step, stress


# ------------------------------------------------------------------------------------------------ build

def shown_text(g):
    """A group's words as drawn, rows split by ' / '."""
    return ' / '.join(' '.join(p['t'] for p in r['pieces']) for r in g['rows'])


def pop_frame(at):
    return 0 if at <= 0 else max(0, math.floor(at * FPS + 1e-6) - LEAD)


def build(groups_path, out_override=None, quiet=False, allow_browser=True):
    hdr, groups = parse_groups_file(groups_path)
    words_path = VIDEO / hdr['words']
    voice = json.loads(words_path.read_text())
    words = voice['words']
    dur = float(voice.get('durationSec') or words[-1]['e'])
    align(groups, words)
    tone0 = hdr['tone']
    M = Metrics(allow_browser)
    errors, warns = [], []

    # resolve every group's rows
    for gi, g in enumerate(groups):
        g['id'] = g['opts'].get('id', f'g{gi + 1:02d}')
        g['tone'] = g['opts'].get('tone', tone0)
        g['rows'], g['seat'], g['step'], g['stress'] = resolve(g, g['tone'], words, gi == 0)

    # measure everything once (pieces, number parts, spaces)
    need = set()
    for g in groups:
        for r in g['rows']:
            for p in r['pieces']:
                need.add((p['t'], p['weight'], p['size'], p['track']))
                need.add((' ', p['weight'], p['size'], p['track']))
                if p.get('tuck'):
                    for tok in re.split(r'(,)', p['t']):
                        if tok:
                            need.add((tok, p['weight'], p['size'], p['track']))
    M.need(sorted(need))

    # the band floor: a band row whose ink would dip below it (a comma, a descender on the unit row) is lifted
    for gi, g in enumerate(groups):
        for i, r in enumerate(g['rows']):
            if r['baseline'] > 600:
                continue
            desc = max(M.get(p['t'], p['weight'], p['size'], p['track'])['desc'] for p in r['pieces'])
            over = r['baseline'] + desc - RECIPES['frame']['bandFloor']
            if over > 0:
                r['baseline'] -= math.ceil(over)
                warns.append(f'{g["id"]} {g["recipe"]} "{shown_text(g)}": row {i + 1} lifted {math.ceil(over)} px to keep its ink above the band floor ({RECIPES["frame"]["bandFloor"]})')
        if 'track' in g['opts']:
            warns.append(f'{g["id"]} {g["recipe"]} "{shown_text(g)}": tracking set to {g["opts"]["track"]} em (an exception to +0.02: the frame cannot hold the line)')

    # timing: starts, ends, leaves
    for g in groups:
        ats = [p['at'] for r in g['rows'] for p in r['pieces']]
        g['first'] = min(pop_frame(a) for a in ats)
        g['last_word'] = max(w for r in g['rows'] for p in r['pieces'] for w in p['words'])
    for gi, g in enumerate(groups):
        hold = int(g['opts'].get('hold', RECIPES['recipes']['R9']['last']['hold'] if (g['recipe'] == 'R9' and g['part'] == 'last') else RECIPES['group']['hold']))
        lw = words[g['last_word']]
        hold_end = math.floor(lw['e'] * FPS + 1e-6) + hold + 1
        nxt = groups[gi + 1]['first'] if gi + 1 < len(groups) else None
        if 'out' in g['opts']:
            end = math.floor(float(g['opts']['out']) * FPS + 1e-6) - LEAD if float(g['opts']['out']) > 0 else 0
        else:
            end = hold_end if nxt is None else min(nxt, hold_end)
        end = min(end, math.ceil(dur * FPS))
        if nxt is not None and end > nxt:
            errors.append(f'{g["id"] if "id" in g else gi}: ends after the next group pops')
        g['endf'] = end
        lv = g['opts'].get('leave', 'auto')
        if lv == 'auto':
            pause = (words[g['last_word'] + 1]['s'] - lw['e']) if g['last_word'] + 1 < len(words) else 0
            sentence_end = bool(re.search(r'[.?!]["\')\]]*$', lw['w']))
            lv = 'soft' if (sentence_end and pause >= RECIPES['motion']['softOut']['minPause'] and nxt is not None) else 'cut'
        g['leave'] = lv
        g['enter'] = g['opts'].get('enter', 'pop')

    # layout: free seats walk within a shot; tighten the step only when the frame forces it
    prev_box, prev_seats, prev_shot = None, [], None
    for gi, g in enumerate(groups):
        if g['shot'] is not prev_shot:
            prev_seats = []
            prev_shot = g['shot']
        if g['seat'] is not None:
            want = g['seat']
            two_word = sum(len(r['pieces']) for r in g['rows']) <= 2
            order = ['L', 'R', 'C']
            if want == 'auto':
                seated = [x for x in prev_seats if x]
                last = seated[-1] if seated else None
                start = (order.index(last) + 1) % 3 if last else 2  # first in a shot: C
                cands = [order[(start + k) % 3] for k in range(3)]
            else:
                cands = [want]
            # every candidate seat: the widest stagger the frame holds there (the default step first)
            fits = []
            for seat in cands:
                st = g['step']
                while st >= 0:
                    placed, rows, box = layout_group(M, dict(g, seat=seat, step=st))
                    if not frame_errors(placed):
                        move = abs(box['cx'] - prev_box['cx']) if prev_box else 0
                        seated = [x for x in prev_seats if x]
                        three = len(seated) >= 2 and seated[-1] == seated[-2] == seat and two_word
                        fits.append({'seat': seat, 'st': st, 'placed': placed, 'rows': rows, 'box': box, 'ok': move <= 220 and not three})
                        break
                    if len(g['rows']) < 2:
                        break
                    st -= 2
            # the walk's order, preferring: the full stagger and the rules, then a stagger >= its minimum, then any fit
            full = g['step']
            tiers = [lambda f: f['ok'] and f['st'] >= full, lambda f: f['ok'] and f['st'] >= RECIPES['step']['min'],
                     lambda f: f['ok'], lambda f: True]
            chosen = None
            for t in (tiers if want == 'auto' else tiers[-1:]):
                hit = next((f for f in fits if t(f)), None)
                if hit:
                    chosen = (hit['seat'], hit['st'], hit['placed'], hit['rows'], hit['box'])
                    break
            if not chosen:
                # nothing fits: lay it out at C to report the overflow
                seat = 'C' if want == 'auto' else want
                placed, rows, box = layout_group(M, dict(g, seat=seat, step=g['step']))
                chosen = (seat, g['step'], placed, rows, box)
            g['seat'], g['step'], g['placed'], g['rowbox'], g['box'] = chosen
            if g['step'] < RECIPES['step']['min'] and len(g['rows']) > 1:
                warns.append(f'{g["id"]} {g["recipe"]} "{shown_text(g)}": the stagger tightened to {g["step"]:.0f} px (the frame cannot hold {RECIPES["step"]["min"]}-{RECIPES["step"]["max"]})')
            prev_seats.append(g['seat'])
        else:
            g['placed'], g['rowbox'], g['box'] = layout_group(M, g)
            prev_seats.append(None)
        prev_box = g['box']

    # the checks (TYPE_GUIDE section f)
    G = RECIPES['group']
    over20 = 0
    table = []
    for gi, g in enumerate(groups):
        tag = f'{g["id"]} {g["recipe"]}{"." + g["part"] if g["part"] else ""}'
        nwords = sum(len(p['words']) for r in g['rows'] for p in r['pieces'])
        npieces = sum(len(r['pieces']) for r in g['rows'])
        disp = ' '.join(p['t'] for r in g['rows'] for p in r['pieces'])
        lockup = g['recipe'] in ('R3', 'R4', 'R6', 'R9')
        first_word = g['rows'][0]['pieces'][0]['words'][0]
        nxt_word = groups[gi + 1]['rows'][0]['pieces'][0]['words'][0] if gi + 1 < len(groups) else None
        shown = (g['endf'] - g['first']) / FPS
        cps = len(disp) / max(1e-6, shown)  # characters (spaces included) over the time the group is on screen
        for e in frame_errors(g['placed']):
            errors.append(f'{tag}: {e}')
        for i, rb in enumerate(g['rowbox']):
            w = rb['x1'] - rb['x0']
            only_lit = all(p['lit'] for p in g['rows'][i]['pieces'])
            if w > RECIPES['line']['max'] + 0.5 and not (g['recipe'] in ('R3',) and i == 0) and not only_lit:
                errors.append(f'{tag}: row {i + 1} is {w:.0f} px (> {RECIPES["line"]["max"]})')
        # row gaps: the ink boxes of every part of row i and row i + 1 that share columns (the guide: >= 20 px)
        for i in range(1, len(g['rowbox'])):
            ua = [b for p in g['placed'] if p['row'] == i - 1 for b in p['parts']]
            ub = [b for p in g['placed'] if p['row'] == i for b in p['parts']]
            gaps = [b['top'] - a['bottom'] for a in ua for b in ub if min(a['x1'], b['x1']) > max(a['x0'], b['x0'])]
            if gaps and min(gaps) < G['rowGap']:
                (errors if lockup else warns).append(f'{tag}: rows {i}-{i + 1} {min(gaps):.0f} px apart (< {G["rowGap"]}, ink boxes)')
        lits = [p for r in g['rows'] for p in r['pieces'] if p['lit']]
        if g['recipe'] == 'R3':
            lits = lits[1:]
        if len(lits) > 1:
            errors.append(f'{tag}: {len(lits)} lit words (one at most)')
        if npieces < G['minWords'] and g['recipe'] not in ('R3',):
            warns.append(f'{tag} "{disp}": {npieces} word (2-4)')
        if nwords > (G['maxWordsLockup'] if lockup else G['maxWords']):
            warns.append(f'{tag} "{disp}": {nwords} words (2-4{", 5 in a lockup" if lockup else ""})')
        if npieces > G['maxOnScreen']:
            warns.append(f'{tag} "{disp}": {npieces} words on screen at once (<= {G["maxOnScreen"]})')
        if shown < G['minSec'] - 1e-6:
            warns.append(f'{tag} "{disp}": on screen {shown:.2f} s (>= {G["minSec"]})')
        if cps > G['maxCps'] + 1e-6:
            over20 += 1
            warns.append(f'{tag} "{disp}": {cps:.1f} cps (<= {G["maxCps"]})')
            if over20 >= 3:
                errors.append(f'{tag}: three groups over {G["maxCps"]} cps in a row')
        else:
            over20 = 0
        for r in g['rows']:
            for p in r['pieces']:
                pf = pop_frame(p['at'])
                if pf > g['first'] and (g['endf'] - pf) / FPS < G['builtMinSec'] - 1e-6:
                    warns.append(f'{tag}: "{p["t"]}" built {(g["endf"] - pf) / FPS:.2f} s before the group leaves (>= {G["builtMinSec"]})')
        table.append((g, tag, disp, cps, shown))
        if g['shot'] is not None and gi > 0 and groups[gi - 1]['shot'] is g['shot']:
            mv = abs(g['box']['cx'] - groups[gi - 1]['box']['cx'])
            if mv > 220:
                warns.append(f'{tag}: the group centre moves {mv:.0f} px within {g["shot"]["name"]} (<= 220)')
    if groups and groups[0]['first'] != 0:
        errors.append('frame 0 does not show the first spoken words')
    if M.estimated:
        warns.insert(0, 'layout from PIL ESTIMATES (Chromium unavailable): re-run with node + Playwright before trusting the checks')

    # the world words (R7) and the cover (R10)
    world = []
    for wi_, spec in enumerate(hdr['world']):
        m = re.match(r'(R7)\s+(\S+)\s*(.*)$', spec)
        if not m:
            raise SystemExit(f'[captions2] ERROR: @world "{spec}" is "R7 <text> at=.. until=.. width=.. object=".."')
        kv = dict(re.findall(r'(\w+)=("[^"]*"|\S+)', m.group(3)))
        kv = {k: v.strip('"') for k, v in kv.items()}

        def when(v):
            try:
                return float(v)
            except ValueError:
                for w in words:
                    if norm(w['w']) == norm(v):
                        return w['s']
                raise SystemExit(f'[captions2] ERROR: @world time "{v}" is neither seconds nor a voice word')
        st = RECIPES['styles']['world']
        world.append({'id': f'w{wi_ + 1}', 'recipe': 'R7', 't': m.group(2), 'at': when(kv.get('at', '0')), 'until': when(kv.get('until', str(dur))),
                      'object': kv.get('object', ''), 'objectWidth': float(kv.get('width', 280)), 'fitPad': st['fitPad'], 'ink': st['ink'],
                      'weight': st['weight'], 'track': st['track']})
    cover = None
    if hdr['cover']:
        R10 = RECIPES['recipes']['R10']
        toks = parse_tokens(hdr['cover'])
        rows = []
        for i, row in enumerate(toks):
            rs = R10['rows'][min(i, len(R10['rows']) - 1)]
            pcs = []
            for j, tok in enumerate(row):
                s = style(R10['key'] if tok['stress'] else R10['style'], tone0)
                p = dict(t=tok['disp'], words=[], s=0, e=0, at=0, **s)
                if tok['stress'] and j > 0 and rs.get('keyGap') is not None:
                    p['gap'] = rs['keyGap']
                pcs.append(p)
            rows.append({'baseline': rs['baseline'], 'x': rs['x'], 'anchor': 'start', 'pieces': pcs})
        need = {(p['t'], p['weight'], p['size'], p['track']) for r in rows for p in r['pieces']} | {(' ', p['weight'], p['size'], p['track']) for r in rows for p in r['pieces']}
        M.need(sorted(need))
        placed, _, box = layout_group(M, {'rows': rows})
        cover = {'recipe': 'R10', 'tone': tone0, 'text': hdr['cover'].replace('*', ''), 'rows': rows,
                 'est': {k: round(v, 1) for k, v in box.items()}}

    # write
    out_groups = []
    for g in groups:
        rows = []
        for r in g['rows']:
            rr = {k: r[k] for k in ('baseline', 'x', 'anchor', 'dx', 'out') if k in r and r[k] is not None}
            rr['pieces'] = r['pieces']
            rows.append(rr)
        og = {'id': g['id'], 'recipe': g['recipe']}
        if g['part']:
            og['part'] = g['part']
        if g['shot']:
            og['shot'] = g['shot']['name']
        og.update({'tone': g['tone'], 'text': ' / '.join(' '.join(p['t'] for p in r['pieces']) for r in g['rows'])})
        if g['seat']:
            og['seat'], og['step'] = g['seat'], round(g['step'], 1)
        og['stress'] = g['stress']
        og['rows'] = rows
        og['start'] = round(g['first'] / FPS, 4)
        og['end'] = round(g['endf'] / FPS, 4)
        og['enter'], og['leave'] = g['enter'], g['leave']
        og['est'] = {k: round(v, 1) for k, v in g['box'].items()}
        out_groups.append(og)
    out = {'format': 'captions2/1', 'film': hdr['film'] or '', 'fps': FPS, 'lead': LEAD, 'durationSec': dur,
           'words': hdr['words'], 'groupsFile': os.path.relpath(Path(groups_path).resolve(), VIDEO),
           'groups': out_groups, 'world': world, 'cover': cover, 'checks': {'errors': errors, 'warnings': warns}}
    out_path = VIDEO / (out_override or hdr['out'])
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps(out, indent=1, ensure_ascii=False) + '\n', encoding='utf8')

    if not quiet:
        print(f'[captions2] {len(groups)} groups -> {os.path.relpath(out_path, VIDEO)} ({"Chromium" if not M.estimated else "PIL ESTIMATE"} metrics)')
        print(f'  {"id":4} {"recipe":7} {"pop":>7} {"f":>5} {"until":>7} {"f":>5} {"on":>5} {"cps":>5}  seat  ink x       leave  words')
        for g, tag, disp, cps, shown in table:
            b = g['box']
            chunks = {}
            for r in g['rows']:
                for p in r['pieces']:
                    f = pop_frame(p['at'])
                    if f > g['first']:
                        chunks.setdefault(f, []).append(p['t'])
            builds = [f'{" ".join(v)} @{f / FPS:.3f}' for f, v in sorted(chunks.items())]
            print(f'  {g["id"]:4} {g["recipe"] + ("." + g["part"] if g["part"] else ""):7} {g["first"] / FPS:7.3f} {g["first"]:5d} {g["endf"] / FPS:7.3f} {g["endf"]:5d} '
                  f'{shown:5.2f} {cps:5.1f}  {(g["seat"] or "-"):4}  {b["x0"]:4.0f}-{b["x1"]:4.0f}  {g["leave"]:5}  {g["text"] if False else " / ".join(" ".join(p["t"] for p in r["pieces"]) for r in g["rows"])}'
                  + (f'   [builds: {"; ".join(builds)}]' if builds else ''))
        for w in world:
            print(f'  {w["id"]:4} R7      {w["at"]:7.3f}       {w["until"]:7.3f}   "{w["t"]}" on {w["object"]} (fit {w["objectWidth"] - w["fitPad"]:.0f} px)')
        if cover:
            print(f'  cover R10: {cover["text"]}  ink x {cover["est"]["x0"]:.0f}-{cover["est"]["x1"]:.0f}, y {cover["est"]["y0"]:.0f}-{cover["est"]["y1"]:.0f}')
        for w in warns:
            print(f'  warn  {w}')
        for e in errors:
            print(f'  ERROR {e}')
        print(f'[captions2] {len(errors)} errors, {len(warns)} warnings')
    return 1 if errors else 0


# ------------------------------------------------------------------------------------------------ propose

NUM = {'zero': 0, 'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5, 'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10,
       'eleven': 11, 'twelve': 12, 'thirteen': 13, 'fourteen': 14, 'fifteen': 15, 'sixteen': 16, 'seventeen': 17, 'eighteen': 18,
       'nineteen': 19, 'twenty': 20, 'thirty': 30, 'forty': 40, 'fifty': 50, 'sixty': 60, 'seventy': 70, 'eighty': 80, 'ninety': 90}
MULT = {'hundred': 100, 'thousand': 1000, 'million': 1000000}
ARTICLES = {'a', 'an', 'the', 'this', 'that', 'these', 'those', 'your', 'my', 'our', 'their', 'its', 'his', 'her', 'every', 'each', 'some'}
PREPS = {'in', 'on', 'at', 'to', 'into', 'onto', 'of', 'for', 'with', 'from', 'under', 'over', 'by', 'about', 'as', 'through', 'out', 'off', 'up', 'down', 'near', 'behind', 'past', 'than'}
CONJ = {'and', 'but', 'or', 'so', 'because', 'then', 'while', 'when', 'if', 'than'}
PRON = {'i', 'you', 'he', 'she', 'it', 'we', 'they'}
AUX = {'is', 'are', 'was', 'were', 'be', 'been', 'will', 'would', 'can', 'could', 'should', 'may', 'might', 'must', 'do', 'does', 'did', 'has', 'have', 'had'}
ADJ_HINT = {'big', 'new', 'giant', 'small', 'hot', 'cold', 'warm', 'old', 'young', 'huge', 'tiny', 'one', 'just', 'much', 'many', 'more', 'most'}


def spoken_number(ws):
    """'seventy thousand' -> 70000 (None if the words are not a number)."""
    total, cur, any_ = 0, 0, False
    for w in ws:
        n = norm(w)
        if n in NUM:
            cur += NUM[n]
            any_ = True
        elif n in MULT and any_:
            cur = max(1, cur) * MULT[n]
            if MULT[n] >= 1000:
                total, cur = total + cur, 0
        elif re.fullmatch(r'\d+', n):
            cur += int(n)
            any_ = True
        else:
            return None
    return total + cur if any_ else None


def group_break(a, b):
    """The cost of ending a group between word a and word b (the reader sees the halves at different times)."""
    na, nb = norm(a), norm(b)
    if re.search(r'[,;:]["\')]*$', a):
        return -4  # after a comma: the clause's own pause
    if na in ARTICLES or re.search(r"'s$", a.lower()):
        return 20  # a determiner (or a possessive) from its noun
    if na in PREPS:
        return 12  # a preposition from its object
    if na in CONJ:
        return 10
    if na in AUX or na in PRON:
        return 6  # an auxiliary or a subject pronoun from its verb
    if na in ADJ_HINT:
        return 5  # an adjective from its noun (a word list: a guess)
    if nb in PRON or nb in ('them', 'him', 'us', 'me'):
        return 8  # an object pronoun from its verb ("use | it,")
    if nb in CONJ or nb in PREPS:
        return -2  # before a conjunction or a preposition: a phrase starts
    return 6  # between two content words: likely inside a noun phrase ("data | centers")


def line_break(a, b):
    """Netflix's line treatment: the cost of breaking a group's two lines between word a and word b."""
    na, nb = norm(a), norm(b)
    if re.search(r'[,.;:?!]["\')]*$', a):
        return -3  # after punctuation: preferred
    if na in ARTICLES or re.search(r"'s$", a.lower()):
        return 10  # never an article / determiner (or a possessive) from its noun
    if na in PRON and nb not in CONJ:
        return 5  # never a subject pronoun from its verb
    if na in AUX:
        return 4  # never an auxiliary from its verb
    if na in ADJ_HINT:
        return 4  # never an adjective from its noun (a word list: a guess)
    if na in PREPS:
        return 2  # a preposition from its object (allowed; before it is better)
    if nb in CONJ or nb in PREPS:
        return -1  # before a conjunction or a preposition: preferred
    if b[:1].isupper() and b not in ('I',) and not a[:1].isupper():
        return 1  # a name starts its own phrase
    return 3  # between two content words: likely inside a noun phrase ("data / centers")


def propose(words_path, hints_path=None, key=None, out_path=None):
    """A groups-file draft from the voice alone (see the module docstring); a hints file adds what the words can't tell."""
    voice = json.loads(Path(words_path).read_text())
    words = voice['words']
    dur = float(voice.get('durationSec') or words[-1]['e'])
    hints = {'r5': [], 'r6': [], 'r8': [], 'shot': [], 'keep': [], 'key': key}
    if hints_path:
        for raw in Path(hints_path).read_text().splitlines():
            if raw.strip().startswith('@'):
                k, _, v = raw.strip()[1:].partition(' ')
                if k == 'key':
                    hints['key'] = v.strip()
                elif k in hints:
                    hints[k].append(v.strip())
    M = Metrics()
    N = len(words)
    W = [w['w'] for w in words]

    def disp(i):
        w = W[i]
        return w.lower() if (len(w) > 2 and w.isupper() and w != 'AI') else w

    def text(ids):
        return ' '.join(disp(i) for i in ids)

    sent_end = [bool(re.search(r'[.?!]["\')]*$', w)) for w in W]
    # @keep phrases: never broken across lines or groups (compounds the word lists can't tell: "data centers")
    kept = set()  # word index i: never break between i and i + 1
    for ph in hints['keep']:
        pn = [norm(x) for x in ph.split()]
        for i in range(N - len(pn) + 1):
            if [norm(W[i + k]) for k in range(len(pn))] == pn:
                kept.update(range(i, i + len(pn) - 1))
    sents, cur = [], []
    for i in range(N):
        cur.append(i)
        if sent_end[i]:
            sents.append(cur)
            cur = []
    if cur:
        sents.append(cur)

    # ---- the fixed units: R3 numbers (+ their unit word), R6 hinted phrases, R4 capitals, R9 the payoff
    fixed = {}  # first word index -> (last word index, kind, extra)
    r6n = [norm(h) for h in hints['r6']]
    key_n = norm(hints['key']) if hints['key'] else None
    for si, s in enumerate(sents):
        st = text(s)
        if norm(st) in r6n:
            fixed[s[0]] = (s[-1], 'R6', None)
            continue
        if si == len(sents) - 1 and key_n:
            ks = [i for i in s if norm(W[i]) == key_n]
            if ks and ks[0] - s[0] >= 2:
                fixed[s[0]] = (ks[0], 'R9', None)
                if ks[0] < s[-1]:
                    fixed[ks[0] + 1] = (s[-1], 'R9.last', None)
                continue
        caps = [i for i in s if len(W[i]) > 2 and W[i].isupper() and W[i] != 'AI' and spoken_number([W[i]]) is None]
        if caps and len(s) <= 5 and s[0] < caps[0] < s[-1]:
            fixed[s[0]] = (s[-1], 'R4', caps[0])
            continue
        a = 0
        while a < len(s):
            b = a + 1
            if spoken_number([W[s[a]]]) is not None and norm(W[s[a]]) not in ('one',):
                while b < len(s) and spoken_number([W[i] for i in s[a:b + 1]]) is not None:
                    b += 1
                if b < len(s):  # the unit word after it
                    fixed[s[a]] = (s[b], 'R3', spoken_number([W[i] for i in s[a:b]]))
                    a = b + 1
                    continue
            a = b

    # ---- measure every candidate line (spans of up to 6 words in a sentence) at 116 and 136 px
    cand = set()
    for s in sents:
        for a in range(len(s)):
            for b in range(a + 1, min(len(s), a + 6) + 1):
                for sz in (116, 136):
                    cand.add((text(s[a:b]), 300, sz, 0.02))
                    cand.add((text(s[a:b]), 300, sz, 0.0))
    cand |= {(' ', 300, 116, 0.02), (' ', 300, 136, 0.02)}
    M.need(sorted(cand))

    def width(ids, size, track=0.02):
        m = M.get(text(ids), 300, size, track)
        return m['right'] - m['left']

    LP, LM = RECIPES['line']['prefer'], RECIPES['line']['max']
    FW = RECIPES['frame']['x1'] - RECIPES['frame']['x0']

    def lines_for(ids, size=116, track=0.02, anchored=None):
        """(cost, [lines]) the best one or two lines (one line when it fits; a bottom-heavy Netflix pair otherwise);
        with nothing at +0.02 em, the hand's own spacing (track 0) at a cost (the builder warns: an exception)."""
        w1 = width(ids, size, track)
        best = (0.0, [ids]) if w1 <= LP else (0.5, [ids]) if w1 <= LM else None
        for k in range(1, len(ids)):
            l1, l2 = ids[:k], ids[k:]
            a, b = width(l1, size, track), width(l2, size, track)
            if max(a, b) > LM:
                continue
            c = 1.5 + line_break(W[l1[-1]], W[l2[0]]) + (6 if l1[-1] in kept else 0)
            if anchored and (anchored[0] + a > RECIPES['frame']['x1'] or anchored[1] + b > RECIPES['frame']['x1']):
                continue  # R2's frame-0 rows start at x 120 / 400
            c += 2.0 if (len(l1) == 1) != (len(l2) == 1) else 0  # a lone word on one line
            c += 2.0 if max(a, b + RECIPES['step']['min']) > FW else 0  # only a tight stagger fits
            c += 0.5 * (a > LP) + 0.5 * (b > LP) + (1.0 if b < 0.6 * a else 0)
            if best is None or c < best[0]:
                best = (c, [l1, l2])
        if best is None and track:
            t0 = lines_for(ids, size, 0.0, anchored)
            if t0:
                best = (t0[0] + 8.0, t0[1], 0.0)
        return best

    def gcost(ids, nxt_start, size, film_first):
        n = len(ids)
        d = nxt_start - (0.0 if film_first else words[ids[0]]['s'])
        cps = len(text(ids)) / max(1e-3, d)
        c = 0.0
        if d < 0.8:
            c += 40 + 100 * (0.8 - d)
        if cps > 20:
            c += 2 * (cps - 20) + (8 * (cps - 23) if cps > 23 else 0)
        if n < 2:
            c += 10
        if n > 4:
            c += 3 * (n - 4)
        if n > 7:
            c += 1000
        lf = lines_for(ids, size, anchored=(120, 400) if film_first else None)
        if lf is None:
            return 1e6, None
        return c + lf[0], (lf[1] if len(lf) == 2 else (lf[1], lf[2]))

    # ---- group the free runs (between fixed units, inside sentences) with a DP
    plan = []  # (kind, ids, lines or extra)
    i = 0
    while i < N:
        if i in fixed:
            last, kind, extra = fixed[i]
            plan.append((kind, list(range(i, last + 1)), extra))
            i = last + 1
            continue
        j = i
        while j < N and j not in fixed and not (j > i and sent_end[j - 1]):
            j += 1
        run = list(range(i, j))
        nxt_start = words[j]['s'] if j < N else min(dur, words[run[-1]]['e'] + 0.6)
        n = len(run)
        best = [(0.0, [])] + [(math.inf, None)] * n
        for b in range(1, n + 1):
            for a in range(max(0, b - 7), b):
                if best[a][1] is None:
                    continue
                ids = run[a:b]
                film_first = ids[0] == 0
                nxt = words[run[b]]['s'] if b < n else nxt_start
                c, lines = gcost(ids, nxt, 136 if (film_first or words[ids[0]]['s'] < 2.0) else 116, film_first)
                if lines is None:
                    continue
                brk = (group_break(W[run[b - 1]], W[run[b]]) + (25 if run[b - 1] in kept else 0)) if b < n else 0
                tot = best[a][0] + c + brk
                if tot < best[b][0]:
                    best[b] = (tot, best[a][1] + [lines])
        if best[n][1] is None:
            raise SystemExit(f'[captions2] could not group "{text(run)}"')
        for lines in best[n][1]:
            track = None
            if isinstance(lines, tuple):
                lines, track = lines
            plan.append(('free', [x for ln in lines for x in ln], (lines, track)))
        i = j

    # ---- write the groups file
    shots = sorted((float(p.split()[1]), p.split()[0], ' '.join(p.split()[2:])) for p in hints['shot'])
    r8 = [tuple(float(x) for x in h.split('-')) for h in hints['r8']]
    r5 = {norm(h) for h in hints['r5']}

    def toks(ids, builds=(), stress=None):
        out = []
        for x in ids:
            t = disp(x)
            if x == stress:
                t = f'*{t}*'
            out.append(('+' if x in builds else '') + t)
        return ' '.join(out)

    def builds_of(lines, ids):
        """A group pops whole, unless it merged a short phrase: line 2 builds when line 1 is a phrase of its own (it
        ends on punctuation or a pause, line 2 starts with a conjunction / preposition / "to", or the group has 5+
        words) shorter than 0.7 s; a word after a pause of 0.2 s or more always builds."""
        b = set()
        if ids[0] == 0 and len(lines) == 2:
            b.add(lines[1][0])  # the hook: frame 0 shows line 1 alone, line 2 builds on its word (R2)
        if len(lines) == 2:
            l1, l2 = lines[0], lines[1][0]
            cue = (re.search(r'[,;:]["\')]*$', W[l1[-1]]) or norm(W[l2]) in CONJ or norm(W[l2]) in PREPS
                   or len(ids) >= 5 or words[l2]['s'] - words[l1[-1]]['e'] >= 0.15)
            if cue and words[l2]['s'] - words[ids[0]]['s'] < 0.7:
                b.add(l2)
        for x, y in zip(ids, ids[1:]):
            if words[y]['s'] - words[x]['e'] >= 0.2:
                b.add(y)
        b.discard(ids[0])
        return b

    out, shot_i, n_r2 = [], -1, 0
    for kind, ids, extra in plan:
        t0 = words[ids[0]]['s']
        while shot_i + 1 < len(shots) and shots[shot_i + 1][0] <= t0 + 1e-6:
            shot_i += 1
            out.append(f'\n@shot {shots[shot_i][1]} {shots[shot_i][0]:.2f} {shots[shot_i][2]}'.rstrip())
        if kind == 'R3':
            num, unit = ids[:-1], ids[-1]
            out.append(f'R3 | [{extra:,}]({" ".join(W[x] for x in num)}) / +{disp(unit)}')
        elif kind == 'R6':
            k = max(1, len(ids) - 2)
            out.append(f'R6 | {toks(ids[:k])} / +{toks(ids[k:k + 1])} +{toks(ids[k + 1:])}')
        elif kind == 'R4':
            c = extra
            pre, post = [x for x in ids if x < c], [x for x in ids if x > c]
            out.append(f'R4 | {toks(pre)} / +*{disp(c)}* / +{toks(post)}')
        elif kind == 'R9':
            head, keyw = ids[:-1], ids[-1]
            cut = next((k for k, x in enumerate(head) if k > 0 and norm(W[x]) in AUX), max(1, len(head) // 2))
            out.append(f'R9 | {toks(head[:cut])} / +{toks(head[cut:])} +*{disp(keyw)}*')
        elif kind == 'R9.last':
            lf = lines_for(ids, 136)
            out.append('R9.last | ' + ' / '.join(toks(ln) for ln in (lf[1] if lf else [ids])))
        else:
            lines, track = extra
            rec, opts, stress = 'R1', ' seat=auto', None
            if ids[0] == 0 or (n_r2 == 1 and t0 < 3.0):
                rec = 'R2'
                n_r2 += 1
                opts = ' x=120,400' if ids[0] == 0 and len(lines) == 2 else ' seat=auto'
            elif any(lo <= t0 < hi for lo, hi in r8):
                rec, opts = 'R8', ''
            lifted = [x for x in ids if norm(W[x]) in r5]
            b = builds_of(lines, ids)
            if lifted and rec == 'R1':
                # R5: the line with the lifted word builds word by word, so the lift arrives on its own word
                rec, stress = 'R5', lifted[0]
                ln = next(l for l in lines if stress in l)
                b |= set(ln[ln.index(stress) if ln[0] == ids[0] else 0:]) - {ids[0]}
            if track is not None:
                opts += f' track={track:g}'
            out.append(f'{rec}{opts} | ' + ' / '.join(toks(ln, b, stress) for ln in lines))
    head = [f'# proposed by build_captions.py --propose from {words_path}{" with " + hints_path if hints_path else ""}: a draft, review by eye, then build',
            f'@words {os.path.relpath(Path(words_path).resolve(), VIDEO)}',
            '@out ' + os.path.relpath(Path(words_path).resolve().parent / 'captions2.json', VIDEO), '@tone dark']
    if hints['key']:
        head.append(f'@key {hints["key"]}')
    body = '\n'.join(head + out).replace('\n\n\n', '\n\n') + '\n'
    if out_path:
        Path(out_path).write_text(body)
        print(f'[captions2] proposal -> {out_path} ({sum(1 for l in out if "|" in l)} groups)')
    else:
        sys.stdout.write(body)
    return 0


def main():
    ap = argparse.ArgumentParser(description=__doc__.split('\n')[0])
    ap.add_argument('groups', nargs='?', help='the groups file (build)')
    ap.add_argument('--out', help='build: override @out; propose: the groups file to write')
    ap.add_argument('--propose', metavar='VOICE_WORDS', help='write a groups file proposal from the voice')
    ap.add_argument('--hints', help='propose: a hints file (@key, @r5, @r6, @r8, @shot lines)')
    ap.add_argument('--key', help="propose: the core line's key word (R9)")
    ap.add_argument('--no-browser', action='store_true', help='PIL estimates instead of Chromium (a quick look only)')
    ap.add_argument('--quiet', action='store_true')
    a = ap.parse_args()
    if a.propose:
        return propose(a.propose, a.hints, a.key, a.out)
    if not a.groups:
        ap.print_help()
        return 2
    return build(a.groups, a.out, a.quiet, not a.no_browser)


if __name__ == '__main__':
    sys.exit(main())
