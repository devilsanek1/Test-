"""Shared helpers for the word-anchor tools (scripts/anchor/*).

A WORD ANCHOR is the only way a time is written in a word-anchored storyboard:

    {"w": <int word index>, "dt": <seconds>}            -> words[w].s + dt
    {"w": 12, "dt": 0.05, "edge": "e"}                    -> words[12].e + dt   (the word's END)
    {"w": 14, "dt": -0.1, "word": "purpose,"}             -> same as {"w": 14, "dt": -0.1}, plus a text check
    {"w": "START", "dt": 0}  {"w": "END", "dt": -0.4}     -> 0 + dt / timing.duration + dt
    {"w": "VO_START", "dt": 0}  {"w": "VO_END", "dt": 0}  -> timing.voStart + dt / timing.voEnd + dt

`w` indexes the PLAIN script split on whitespace, punctuation attached, 0-based (the storyboard's `wordsRef`).
A dict is an anchor when it has BOTH "w" and "dt" (so a match box {"cx", "cy", "w", "h"} never is).
Optional keys: "edge" ("s" | "e"), "word" (text check), "note" / "why" (ignored).
"""
import json
import math
import os
import re

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))

SPECIAL = ('START', 'END', 'VO_START', 'VO_END')
ANCHOR_KEYS = {'w', 'dt', 'edge', 'word', 'note', 'why'}
# keys that hold times in storyboards (same family as scripts/timewarp.py); a plain number under one of them in a
# word-anchored storyboard is an UN-ANCHORED time and is reported
TIME_KEYS = {'s', 'e', 't', 't0', 't1', 'start', 'end', 'at', 'time', 'captionAt', 'coverFrame'}
START_KEYS = ('s', 'start', 't0', 'at', 'time', 't')
END_KEYS = ('e', 'end', 't1')


def rel(p):
    try:
        return os.path.relpath(p, ROOT)
    except ValueError:
        return p


def load_json(p):
    with open(p, encoding='utf-8') as f:
        return json.load(f)


# ---------------------------------------------------------------- tokens

def split_words(text):
    """The plain-script word list: whitespace split, punctuation attached."""
    return text.split()


def words_from_ref(ref):
    if isinstance(ref, str):
        return split_words(ref)
    if isinstance(ref, list) and all(isinstance(x, str) for x in ref):
        return list(ref)
    if isinstance(ref, dict) and 'words' in ref:
        return words_from_ref(ref['words'])
    if isinstance(ref, dict) and 'text' in ref:
        return words_from_ref(ref['text'])
    raise ValueError('wordsRef must be a string, a list of strings, or {"words": [...]} / {"text": "..."}')


def plain_script(path):
    """Words of a script file. A final_script.md-style file -> its '## 1. Plain script' section; a .txt -> the
    whole text minus [cue] lines; a timing .json -> its words[].w."""
    if path.endswith('.json'):
        return [w['w'] for w in load_json(path)['words']]
    text = open(path, encoding='utf-8').read()
    m = re.search(r'^##\s*1\.\s*Plain script[^\n]*\n(.*?)(?=^##\s|\Z)', text, re.S | re.M)
    if m:
        text = m.group(1)
    else:
        text = '\n'.join(ln for ln in text.splitlines() if not re.match(r'^\s*\[.*\]\s*$', ln) and not ln.startswith('```'))
    return split_words(text)


_UNITS = {w: i for i, w in enumerate('zero one two three four five six seven eight nine ten eleven twelve thirteen '
                                     'fourteen fifteen sixteen seventeen eighteen nineteen'.split())}
_TENS = {w: 10 * (i + 2) for i, w in enumerate('twenty thirty forty fifty sixty seventy eighty ninety'.split())}


def number_value(tok):
    """'seven' -> 7, 'forty-five' -> 45, '45' -> 45, else None (one token only)."""
    if re.fullmatch(r'\d+', tok):
        return int(tok)
    parts = tok.split('-')
    if len(parts) == 1:
        if tok in _UNITS:
            return _UNITS[tok]
        if tok in _TENS:
            return _TENS[tok]
        return None
    if len(parts) == 2 and parts[0] in _TENS and parts[1] in _UNITS and 0 < _UNITS[parts[1]] < 10:
        return _TENS[parts[0]] + _UNITS[parts[1]]
    return None


def base_token(tok):
    t = tok.lower().replace('’', "'").replace('‘', "'").replace('…', '')
    t = re.sub(r"[^a-z0-9'\-]", '', t)
    return t.strip("'-")


def key(tok):
    """Comparison key: case, punctuation, apostrophes and hyphens ignored; number words == digits."""
    b = base_token(tok)
    n = number_value(b)
    if n is not None:
        return str(n)
    return b.replace('-', '').replace("'", '')


def spelled(tok):
    """Letters-only form for split/merge checks ('forty-five' == 'forty' + 'five', 'heads-up' == 'heads' 'up')."""
    return base_token(tok).replace('-', '').replace("'", '')


def punct_kind(tok):
    t = tok.rstrip('"\'”’)')
    if t.endswith(('…', '...')):
        return 'ellipsis'
    if t.endswith(('.', '?', '!')):
        return 'sentence'
    if t.endswith((',', ';', ':')):
        return 'comma'
    return None


# ---------------------------------------------------------------- anchors

def is_anchor(d):
    if not isinstance(d, dict) or 'w' not in d or 'dt' not in d:
        return False
    w = d['w']
    return (isinstance(w, int) and not isinstance(w, bool)) or w in SPECIAL


def is_num(v):
    return isinstance(v, (int, float)) and not isinstance(v, bool)


def anchor_time(a, timing):
    """Seconds for one anchor against a timing doc. Raises ValueError on a bad anchor."""
    dt = a.get('dt', 0)
    if not is_num(dt):
        raise ValueError(f'dt must be a number, got {dt!r}')
    w = a['w']
    edge = a.get('edge', 's')
    if edge not in ('s', 'e'):
        raise ValueError(f'edge must be "s" or "e", got {edge!r}')
    if w == 'START':
        return 0.0 + dt
    if w == 'END':
        return float(timing['duration']) + dt
    if w == 'VO_START':
        return float(timing.get('voStart', timing['words'][0]['s'])) + dt
    if w == 'VO_END':
        return float(timing.get('voEnd', timing['words'][-1]['e'])) + dt
    words = timing['words']
    if not 0 <= w < len(words):
        raise ValueError(f'word index {w} out of range 0..{len(words) - 1}')
    return float(words[w][edge]) + dt


def walk(doc, fn, path='$'):
    """Depth-first map: fn(value, path) -> (replacement, descend). Returns the rewritten copy."""
    rep, descend = fn(doc, path)
    if not descend:
        return rep
    if isinstance(rep, dict):
        return {k: walk(v, fn, f'{path}.{k}') for k, v in rep.items()}
    if isinstance(rep, list):
        return [walk(v, fn, f'{path}[{i}]') for i, v in enumerate(rep)]
    return rep


def iter_nodes(doc, path='$'):
    yield doc, path
    if isinstance(doc, dict):
        if is_anchor(doc):
            return
        for k, v in doc.items():
            yield from iter_nodes(v, f'{path}.{k}')
    elif isinstance(doc, list):
        for i, v in enumerate(doc):
            yield from iter_nodes(v, f'{path}[{i}]')


def iter_anchors(doc):
    for node, path in iter_nodes(doc):
        if is_anchor(node):
            yield node, path


# ---------------------------------------------------------------- JS-compatible output

def r3(x):
    """JS Math.round(x * 1000) / 1000 (half rounds up, like the engine's generators)."""
    return math.floor(x * 1000 + 0.5) / 1000


def _jsify(o):
    if isinstance(o, float):
        if math.isfinite(o) and o == int(o):
            return int(o)
        return o
    if isinstance(o, dict):
        return {k: _jsify(v) for k, v in o.items()}
    if isinstance(o, list):
        return [_jsify(v) for v in o]
    return o


def js_compact(o):
    """JSON.stringify(o) (no spaces; integral floats print as ints)."""
    return json.dumps(_jsify(o), separators=(',', ':'), ensure_ascii=False)


def js_rows(rows):
    """The engine generators' file layout: '[\\n  row,\\n  row\\n]\\n'."""
    return '[\n' + ',\n'.join('  ' + js_compact(r) for r in rows) + '\n]\n'


def dump_pretty(o, path):
    text = json.dumps(_jsify(o), indent=1, ensure_ascii=False) + '\n'
    with open(path, 'w', encoding='utf-8') as f:
        f.write(text)


# ---------------------------------------------------------------- word diff

def word_diff(a_words, b_words, a_name='storyboard wordsRef', b_name='timing words', context=3, limit=40):
    """Human-readable word-level diff (difflib on normalized keys). Returns (lines, opcodes)."""
    import difflib
    ak = [key(w) for w in a_words]
    bk = [key(w) for w in b_words]
    sm = difflib.SequenceMatcher(None, ak, bk, autojunk=False)
    ops = sm.get_opcodes()
    out = [f'--- {a_name} ({len(a_words)} words)', f'+++ {b_name} ({len(b_words)} words)']
    shown = 0
    for tag, i1, i2, j1, j2 in ops:
        if tag == 'equal':
            continue
        shown += 1
        if shown > limit:
            out.append(f'... ({sum(1 for o in ops if o[0] != "equal") - limit} more)')
            break
        pre = ' '.join(a_words[max(0, i1 - context):i1])
        post = ' '.join(a_words[i2:i2 + context])
        old = ' '.join(a_words[i1:i2])
        new = ' '.join(b_words[j1:j2])
        if tag == 'replace':
            what = f'[-{old}-] {{+{new}+}}'
        elif tag == 'delete':
            what = f'[-{old}-]'
        else:
            what = f'{{+{new}+}}'
        out.append(f'@@ {tag} w {i1}..{i2 - 1 if i2 > i1 else i1} -> {j1}..{j2 - 1 if j2 > j1 else j1}: '
                   f'...{pre} {what} {post}...')
    return out, ops


def cosmetic_diffs(a_words, b_words):
    """Same keys, different spelling/punctuation: [(i, a, b)]."""
    return [(i, a, b) for i, (a, b) in enumerate(zip(a_words, b_words)) if a != b and key(a) == key(b)]
