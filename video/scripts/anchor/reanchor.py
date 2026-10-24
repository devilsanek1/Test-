#!/usr/bin/env python3
"""Re-anchor a word-anchored storyboard onto a slightly different script (a word added, removed or changed).

  python3 scripts/anchor/reanchor.py docs/storyboard_v3.json --timing assets/timing_v3.json -o docs/storyboard_v3.json
  python3 scripts/anchor/reanchor.py SB.json --script recorded.txt --dry-run      # report only
  python3 scripts/anchor/reanchor.py SB.json --words "Governments all over ..." -o SB_new.json --report rep.json

The storyboard's `wordsRef` (the script it was anchored to) is aligned with the new words by difflib on normalized
tokens (case, punctuation, apostrophes and hyphens ignored, "45" == "forty-five"). Then every anchor {"w", "dt"} and
every integer word-index field (`"word": 17`, e.g. sunKeys) is moved to the same word in the new script:
  equal          the word survived (maybe at a new index): moved silently.
  split / merge  same letters, different tokenization ("heads-up" -> "heads up", "forty-five" -> "forty five"):
                 moved proportionally, reported as info.
  CHANGED        the anchor's word was replaced ("about" -> "some"): moved proportionally inside the replaced span
                 and REPORTED (check the beat still makes sense).
  DELETED        the anchor's word is gone: moved to the next surviving word (--deleted prev: the previous one)
                 and REPORTED.
  inserted words get no anchors; they are listed (everything after them shifts with the voice anyway).
`dt` is never changed. Anchors that carry a "word" text check get the new word's text. Caption lines are rebuilt from
the new words over their (mapped) spans and every changed line is reported. `wordsRef` becomes the new words.
Exit code: 0 = nothing landed on a changed word, 3 = some anchors were flagged (the file is still written).
"""
import argparse
import difflib
import json
import os
import re
import sys

sys.dont_write_bytecode = True
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import anchorlib as A  # noqa: E402


def build_map(old, new, deleted='next'):
    """old index -> (new index, status); status in same, moved, split, changed, deleted. Also returns opcodes."""
    ak, bk = [A.key(w) for w in old], [A.key(w) for w in new]
    ops = difflib.SequenceMatcher(None, ak, bk, autojunk=False).get_opcodes()
    m = [None] * len(old)
    st = [None] * len(old)
    for tag, i1, i2, j1, j2 in ops:
        if tag == 'equal':
            for k in range(i2 - i1):
                m[i1 + k] = j1 + k
                st[i1 + k] = 'same' if i1 + k == j1 + k else 'moved'
        elif tag == 'replace':
            equiv = (''.join(ak[i1:i2]) == ''.join(bk[j1:j2])
                     or ''.join(A.spelled(w) for w in old[i1:i2]) == ''.join(A.spelled(w) for w in new[j1:j2]))
            for k in range(i2 - i1):
                m[i1 + k] = j1 + (k * (j2 - j1)) // (i2 - i1)
                st[i1 + k] = 'split' if equiv else 'changed'
        elif tag == 'delete':
            if deleted == 'prev':
                tgt = j1 - 1 if j1 > 0 else 0
            else:
                tgt = j1 if j1 < len(new) else len(new) - 1
            for k in range(i1, i2):
                m[k] = tgt
                st[k] = 'deleted'
    return m, st, ops


FLAG = ('changed', 'deleted')


def _caption_lines(sb):
    """[(scene_idx, page_idx, line_idx, start_w, line)] in script order, skipping an explicit final loop page."""
    pages = [(si, pi, c) for si, sc in enumerate(sb.get('scenes', [])) for pi, c in enumerate(sc.get('captions') or [])]
    if len(pages) > 1:
        first = (pages[0][2].get('lines') or [{}])[0].get('text')
        last = pages[-1][2]
        if len(last.get('lines') or []) == 1 and last['lines'][0].get('text') == first:
            pages = pages[:-1]
    out, wi = [], 0
    for si, pi, c in pages:
        for li, l in enumerate(c.get('lines') or []):
            s = l.get('s')
            start = s['w'] if A.is_anchor(s) and isinstance(s['w'], int) else wi
            out.append([si, pi, li, start, l])
            wi = start + len(A.split_words(l.get('text', '')))
    return out


def reanchor_doc(sb, new_words, deleted='next'):
    old = A.words_from_ref(sb['wordsRef'])
    m, st, ops = build_map(old, new_words, deleted)
    report = {'old': len(old), 'new': len(new_words), 'edits': [], 'anchors': 0, 'moved': 0, 'flagged': [],
              'info': [], 'captions': []}
    for tag, i1, i2, j1, j2 in ops:
        if tag != 'equal':
            report['edits'].append({'op': tag, 'old': [i1, i2 - 1], 'new': [j1, j2 - 1],
                                    'from': ' '.join(old[i1:i2]), 'to': ' '.join(new_words[j1:j2])})

    def fn(node, path):
        if A.is_anchor(node):
            w = node['w']
            if not isinstance(w, int):
                return node, False
            report['anchors'] += 1
            if not 0 <= w < len(old):
                report['flagged'].append({'path': path, 'status': 'out-of-range', 'old': w, 'new': w})
                return node, False
            nw, s = m[w], st[w]
            out = dict(node)
            out['w'] = nw
            if 'word' in out:
                out['word'] = new_words[nw]
            if nw != w:
                report['moved'] += 1
            row = {'path': path, 'status': s, 'old': w, 'oldWord': old[w], 'new': nw, 'newWord': new_words[nw]}
            if s in FLAG:
                report['flagged'].append(row)
            elif s == 'split':
                report['info'].append(row)
            return out, False
        if isinstance(node, dict) and isinstance(node.get('word'), int) and not isinstance(node.get('word'), bool):
            w = node['word']
            out = dict(node)
            if 0 <= w < len(old):
                out['word'] = m[w]
                row = {'path': path + '.word', 'status': st[w], 'old': w, 'oldWord': old[w], 'new': m[w],
                       'newWord': new_words[m[w]]}
                if st[w] in FLAG:
                    report['flagged'].append(row)
            return out, True
        return node, True

    # caption spans BEFORE the anchors move (spans are in old indices)
    lines = _caption_lines(sb)
    new_sb = A.walk(sb, fn)
    starts_old = [ln[3] for ln in lines] + [len(old)]
    drop = []
    for k, (si, pi, li, start, line) in enumerate(lines):
        a_old, b_old = starts_old[k], starts_old[k + 1]
        # words inserted at a line boundary join the line BEFORE it; words inserted before the first word join line 1
        a_new = 0 if k == 0 else (m[a_old] if a_old < len(old) else len(new_words))
        b_new = m[b_old] if b_old < len(old) else len(new_words)
        text_new = ' '.join(new_words[a_new:b_new])
        tgt = new_sb['scenes'][si]['captions'][pi]['lines'][li]
        if k == 0:
            page = new_sb['scenes'][si]['captions'][pi]
            for holder in (tgt, page):
                if A.is_anchor(holder.get('s')) and isinstance(holder['s']['w'], int) and holder['s']['w'] != a_new \
                        and A.is_anchor(line.get('s')) and holder['s']['w'] == m[line['s']['w']]:
                    holder['s'] = {**holder['s'], 'w': a_new}
                    if 'word' in holder['s']:
                        holder['s']['word'] = new_words[a_new]
        if not text_new:
            drop.append((si, pi, li))
            report['captions'].append({'scene': sb['scenes'][si].get('id'), 'page': pi, 'line': li,
                                       'from': line.get('text'), 'to': '', 'note': 'all its words are gone: line removed'})
        elif text_new != line.get('text'):
            report['captions'].append({'scene': sb['scenes'][si].get('id'), 'page': pi, 'line': li,
                                       'from': line.get('text'), 'to': text_new})
            tgt['text'] = text_new
    # remove emptied lines, then emptied pages (back to front so indices stay valid)
    for si, pi, li in sorted(drop, reverse=True):
        del new_sb['scenes'][si]['captions'][pi]['lines'][li]
    for si, sc in enumerate(new_sb.get('scenes', [])):
        caps = sc.get('captions') or []
        for pi in range(len(caps) - 1, -1, -1):
            if not caps[pi].get('lines'):
                del caps[pi]
                report['captions'].append({'scene': sc.get('id'), 'page': pi, 'note': 'page removed (no words left)'})
    # highlights whose words are no longer in their page: retarget an anchored one to its (moved) word if that word is
    # in the page, else drop it
    for si, sc in enumerate(new_sb.get('scenes', [])):
        for pi, c in enumerate(sc.get('captions') or []):
            page_keys = [A.key(t) for l in c.get('lines') or [] for t in A.split_words(l.get('text', ''))]
            keep = []
            for hi, h in enumerate(c.get('highlights') or []):
                hk = [A.key(t) for t in A.split_words(h.get('text', ''))]
                if not hk or any(page_keys[x:x + len(hk)] == hk for x in range(len(page_keys))):
                    keep.append(h)
                    continue
                hs = h.get('s')
                word = re.sub(r"[^\w'\-]+$", '', new_words[hs['w']]) if A.is_anchor(hs) and isinstance(hs['w'], int) else None
                if word and A.key(word) in page_keys:
                    report['captions'].append({'scene': sc.get('id'), 'page': pi, 'highlight': hi,
                                               'note': f"highlight '{h.get('text')}' -> '{word}' (its anchored word)"})
                    keep.append({**h, 'text': word})
                else:
                    report['captions'].append({'scene': sc.get('id'), 'page': pi, 'highlight': hi,
                                               'note': f"highlight '{h.get('text')}' removed (its word is gone from the page)"})
            if 'highlights' in c:
                c['highlights'] = keep
    ref = sb['wordsRef']
    new_sb['wordsRef'] = ' '.join(new_words) if isinstance(ref, str) else (
        {**ref, 'words': list(new_words)} if isinstance(ref, dict) and 'words' in ref else
        ({**ref, 'text': ' '.join(new_words)} if isinstance(ref, dict) else list(new_words)))
    return new_sb, report


def format_report(rep, limit=60):
    out = [f"reanchor: {rep['old']} -> {rep['new']} words, {len(rep['edits'])} edit(s); {rep['anchors']} anchors, "
           f"{rep['moved']} moved, {len(rep['flagged'])} FLAGGED (landed on a changed/removed word), "
           f"{len(rep['info'])} on split/merged tokens, {len(rep['captions'])} caption change(s)"]
    for e in rep['edits']:
        out.append(f"  {e['op']:<7} old w{e['old'][0]}..{e['old'][1]} '{e['from']}' -> new w{e['new'][0]}..{e['new'][1]} '{e['to']}'")
    for r in rep['flagged'][:limit]:
        out.append(f"  FLAG {r['status']:<8} {r['path']}: w{r['old']} '{r.get('oldWord', '')}' -> w{r['new']} '{r.get('newWord', '')}'")
    if len(rep['flagged']) > limit:
        out.append(f"  ... {len(rep['flagged']) - limit} more")
    for r in rep['info'][:10]:
        out.append(f"  info split/merge {r['path']}: '{r['oldWord']}' -> '{r['newWord']}'")
    for c in rep['captions']:
        if 'from' in c:
            out.append(f"  caption {c['scene']} page {c['page']} line {c['line']}: '{c['from']}' -> '{c['to']}'"
                       + (f" ({c['note']})" if c.get('note') else ''))
        else:
            out.append(f"  caption {c['scene']} page {c['page']}: {c['note']}")
    return '\n'.join(out)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('storyboard')
    src = ap.add_mutually_exclusive_group(required=True)
    src.add_argument('--timing', help='timing JSON (or raw ASR word list) whose words[].w are the new script')
    src.add_argument('--script', help='script file (final_script.md plain section, or plain text / ElevenLabs paste)')
    src.add_argument('--words', help='the new script as a string')
    ap.add_argument('-o', '--out')
    ap.add_argument('--in-place', action='store_true')
    ap.add_argument('--deleted', choices=('next', 'prev'), default='next')
    ap.add_argument('--report', help='write the machine-readable report here (JSON)')
    ap.add_argument('--dry-run', action='store_true')
    a = ap.parse_args()
    sb = A.load_json(a.storyboard)
    if 'wordsRef' not in sb:
        sys.exit('the storyboard has no wordsRef: nothing to align against')
    if a.timing:
        new = [w['w'] for w in A.load_timing(a.timing)['words']]
    elif a.script:
        new = A.plain_script(a.script)
    else:
        new = A.split_words(a.words)
    new_sb, rep = reanchor_doc(sb, new, a.deleted)
    print(format_report(rep))
    if a.report:
        with open(a.report, 'w', encoding='utf-8') as f:
            json.dump(rep, f, indent=1, ensure_ascii=False)
    if not a.dry_run:
        out = a.storyboard if a.in_place else a.out
        if not out:
            sys.exit('pass -o OUT, --in-place or --dry-run')
        A.dump_pretty(new_sb, out)
        print(f'-> {A.rel(out)}')
    sys.exit(3 if rep['flagged'] else 0)


if __name__ == '__main__':
    main()
