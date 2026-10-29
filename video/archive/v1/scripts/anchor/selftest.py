#!/usr/bin/env python3
"""Self-tests for the word-anchor tools.   python3 -I scripts/anchor/selftest.py [-v]

Toy storyboard: scripts/anchor/fixtures/toy_storyboard.json (22 words), toy timings toy_timing.json (the same words)
and toy_timing_recorded.json (the "recorded" script: 2 words added, 1 changed, 1 removed). Also checks the Python
engine emitter against the node generators (byte-identical on the current storyboards) and the v3 estimate.
Writes only to a temporary directory.
"""
import json
import os
import shutil
import subprocess
import sys
import tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
sys.dont_write_bytecode = True
sys.path.insert(0, HERE)
import anchorlib as A  # noqa: E402
import engine_emit as E  # noqa: E402
import estimate_timing as ET  # noqa: E402
import reanchor as R  # noqa: E402
from words import to_anchor  # noqa: E402

FIX = os.path.join(HERE, 'fixtures')
TOY = os.path.join(FIX, 'toy_storyboard.json')
TOY_T = os.path.join(FIX, 'toy_timing.json')
TOY_R = os.path.join(FIX, 'toy_timing_recorded.json')
VERBOSE = '-v' in sys.argv
results = []


def check(name, cond, detail=''):
    results.append((name, bool(cond)))
    print(f"{'PASS' if cond else 'FAIL'}  {name}" + (f'  ({detail})' if detail and (VERBOSE or not cond) else ''))


def run(script, *args):
    p = subprocess.run([sys.executable, '-I', os.path.join(HERE, script), *args], capture_output=True, text=True)
    if VERBOSE:
        print(p.stdout, p.stderr)
    return p.returncode, p.stdout + p.stderr


def close(a, b, tol=1e-6):
    return abs(a - b) <= tol


def main():
    tmp = tempfile.mkdtemp(prefix='anchor_selftest_')
    try:
        tests(tmp)
    finally:
        shutil.rmtree(tmp, ignore_errors=True)
    n_fail = sum(1 for _, ok in results if not ok)
    print(f'\n{len(results) - n_fail}/{len(results)} passed')
    sys.exit(1 if n_fail else 0)


def tests(tmp):
    T = A.load_json(TOY_T)
    W = T['words']
    s = lambda i: W[i]['s']  # noqa: E731

    # ---------------------------------------------------------------- 1. anchors resolve to word times
    out, sc, ca, mp = (os.path.join(tmp, f) for f in ('res.json', 'scenes.json', 'captions.json', 'map.json'))
    code, log = run('resolve.py', TOY, '--timing', TOY_T, '-o', out, '--scenes-out', sc, '--captions-out', ca,
                    '--anchor-map', mp)
    check('resolve toy: exit 0, no warnings', code == 0 and '0 warning(s)' in log, log[-300:])
    r = A.load_json(out)
    s1, s2, s3 = r['scenes']
    check('START / w+dt / END', s1['start'] == 0 and close(s1['end'], s(7) - 0.1) and close(s3['end'], T['duration']),
          f"{s1['start']} {s1['end']} {s3['end']}")
    check('negative dt = lead before the word', close(s1['beats'][0]['t'], s(1) - 0.1))
    check('edge "e" = the word end + dt', close(s1['camera'][0]['t1'], W[2]['e']) and close(s3['beats'][3]['t'], W[21]['e'] + 0.05))
    check('dur "auto" = t1 - t0', close(s2['transitionIn']['dur'], 1.0) and close(s2['transitionIn']['t0'], s(7) - 0.6))
    check('top-level anchors (coverFrame, loop) + duration', close(r['coverFrame'], s(6) + 0.1) and
          close(r['loop']['t0'], T['duration'] - 0.5) and r['duration'] == T['duration'])
    check('integer "word" index fields are kept', s1['sunKeys'][0]['word'] == 6 and close(s1['sunKeys'][0]['t'], s(6)))
    check('resolved block says recorded/estimated', r['resolved']['estimated'] is False and r['resolved']['anchors'] == 48)
    amap = A.load_json(mp)
    check('anchor map lists every anchor', len(amap) == 48 and amap['$.scenes[0].end'] == {'w': 7, 'dt': -0.1, 't': A.r3(s(7) - 0.1)})

    # ---------------------------------------------------------------- 2. captions auto-filled from the text
    p0, p1 = s1['captions']
    check('caption line s = its first word', close(p0['lines'][0]['s'], s(0)) and close(p0['lines'][1]['s'], s(3)))
    check('page s = first line, e = next page s', close(p0['s'], s(0)) and close(p0['e'], s(5)) and close(p1['e'], s(7)))
    check('highlight s = its word', close(p0['highlights'][0]['s'], s(1)) and close(p1['highlights'][0]['s'], s(6)))
    check('last page e = END', close(s3['captions'][0]['e'], T['duration']))

    # ---------------------------------------------------------------- 3. engine files (gen-scenes / gen-captions format)
    scenes_txt = open(sc).read()
    caps = A.load_json(ca)
    rows = A.load_json(sc)
    check('scenes.json layout = node generators', scenes_txt.startswith('[\n  {"id":"T01","start":0,') and scenes_txt.endswith('}\n]\n'))
    check('loop-start -> cut; notes -> camera dir; right-to-left wipe',
          rows[0]['transitionIn'] == {'type': 'cut'} and rows[1]['transitionIn'] == {'type': 'camera-continuous', 'dur': 1, 'dir': 'right'}
          and rows[2]['transitionIn'] == {'type': 'foreground-wipe', 'dur': 0.4, 'element': 'scene', 'dir': 'left'})
    check('captionTone scene-local, toneAt keeps wipe', rows[1]['captionTone'] == [
        {'t': 0, 'tone': 'dark'}, {'t': A.r3(s(12) - s(7) + 0.1), 'tone': 'light'},
        {'t': A.r3(s(13) - s(7) + 0.1), 'tone': 'dark', 'wipe': 'down', 'dur': 0.4}], json.dumps(rows[1]['captionTone']))
    check('structured loop -> transitionOut', rows[2]['transitionOut'] == {'type': 'unbuild', 'dur': 0.5, 'loop': True,
                                                                           'captionAt': A.r3(T['duration'] - 0.2)})
    check('captions.json: 5 pages, hook style, word starts', len(caps) == 5 and caps[0].get('style') == 'hook'
          and caps[-1]['e'] == T['duration'] and close(caps[4]['lines'][1]['s'], s(18)))

    # ---------------------------------------------------------------- 4. errors and guards
    bad = json.load(open(TOY))
    bad['scenes'][0]['beats'][1]['t']['word'] = 'bug'
    bad['scenes'][1]['beats'][0]['t'] = 3.9
    bp = os.path.join(tmp, 'bad.json')
    json.dump(bad, open(bp, 'w'))
    code, log = run('resolve.py', bp, '--timing', TOY_T, '-o', os.path.join(tmp, 'bad_res.json'), '--no-engine')
    check('"word" text check catches a wrong index (exit 1)', code == 1 and "anchor says word 'bug'" in log, log[-300:])
    check('un-anchored time is reported', 'UN-ANCHORED' in log and '$.scenes[1].beats[0].t' in log)
    check('nothing written on error', not os.path.exists(os.path.join(tmp, 'bad_res.json')))

    short = json.load(open(TOY))
    short['scenes'][2]['end'] = {'w': 21, 'dt': 0}
    sp = os.path.join(tmp, 'short.json')
    json.dump(short, open(sp, 'w'))
    sc2, ca2 = os.path.join(tmp, 'sc2.json'), os.path.join(tmp, 'ca2.json')
    code, log = run('resolve.py', sp, '--timing', TOY_T, '-o', os.path.join(tmp, 'short_res.json'), '--scenes-out', sc2,
                    '--captions-out', ca2)
    check('guard: film must end on the voice (exit 1, engine files not written)',
          code == 1 and 'engine files NOT written' in log and not os.path.exists(sc2), log[-300:])
    code, _ = run('resolve.py', sp, '--timing', TOY_T, '-o', os.path.join(tmp, 'short_res.json'), '--scenes-out', sc2,
                  '--captions-out', ca2, '--force')
    check('--force writes anyway', code == 0 and os.path.exists(sc2))

    # ---------------------------------------------------------------- 5. wordsRef vs a different recording
    code, log = run('resolve.py', TOY, '--timing', TOY_R, '-o', os.path.join(tmp, 'x.json'), '--no-engine')
    check('mismatch: exit 2 with a word-level diff', code == 2 and '{+own+}' in log and '[-somebody-] {+someone+}' in log
          and '[-single-]' in log, log[-500:])

    # ---------------------------------------------------------------- 6. reanchor
    re_out, rep = os.path.join(tmp, 'reanchored.json'), os.path.join(tmp, 'rep.json')
    code, log = run('reanchor.py', TOY, '--timing', TOY_R, '-o', re_out, '--report', rep)
    rp = A.load_json(rep)
    ra = A.load_json(re_out)
    flagged = {(f['path'], f['status']) for f in rp['flagged']}
    check('reanchor exit 3 when anchors land on changed words', code == 3, log[-300:])
    check('flags: changed word (somebody -> someone) and deleted word (single)',
          ('$.scenes[2].beats[0].t', 'changed') in flagged and ('$.scenes[2].beats[2].t', 'deleted') in flagged
          and len(flagged) == 2, str(flagged))
    b = ra['scenes']
    check('surviving words keep their anchor across inserts', b[1]['beats'][0]['t'] == {'w': 10, 'dt': -0.1, 'word': 'bug'}
          and b[2]['beats'][3]['t']['w'] == 22 and b[0]['sunKeys'][0]['word'] == 7)
    check('deleted word -> next surviving word, dt kept', b[2]['beats'][2]['t'] == {'w': 22, 'dt': 0, 'word': 'server.'})
    check('caption lines rebuilt from the new words', b[0]['captions'][0]['lines'][1]['text'] == 'their own sites,'
          and b[1]['captions'][0]['lines'][1]['text'] == 'hid for about' and b[2]['captions'][0]['lines'][1]['text'] == 'fix every server.'
          and b[2]['captions'][0]['lines'][0]['text'] == 'Now someone has to')
    check('wordsRef updated', A.words_from_ref(ra['wordsRef']) == [w['w'] for w in A.load_json(TOY_R)['words']])
    code, log = run('resolve.py', re_out, '--timing', TOY_R, '-o', os.path.join(tmp, 're_res.json'), '--no-engine')
    rr = A.load_json(os.path.join(tmp, 're_res.json'))
    WR = A.load_json(TOY_R)['words']
    check('re-anchored storyboard resolves cleanly on the recording', code == 0 and '0 warning(s)' in log
          and close(rr['scenes'][1]['beats'][0]['t'], WR[10]['s'] - 0.1), log[-300:])
    code, log = run('resolve.py', TOY, '--timing', TOY_R, '--reanchor', '-o', os.path.join(tmp, 're2.json'), '--no-engine')
    check('resolve --reanchor does the same in memory', code == 0 and
          A.load_json(os.path.join(tmp, 're2.json'))['scenes'] == rr['scenes'], log[-300:])

    m, st, _ = R.build_map(['a', 'heads-up,', 'but', 'forty-five', 'minutes'], ['a', 'heads', 'up,', 'but', '45', 'minutes'])
    check('split tokens and digits are not "changed"', st == ['same', 'split', 'moved', 'moved', 'moved'] and m == [0, 1, 3, 4, 5],
          f'{m} {st}')

    # ---------------------------------------------------------------- 7. raw ASR timings (glued digits) + helpers
    raw = os.path.join(tmp, 'raw.json')
    json.dump({'text': 'x', 'duration': 3.0, 'words': [{'w': 'about7', 's': 0.0, 'e': 0.8}, {'w': 'websites.', 's': 0.8, 'e': 1.4}]},
              open(raw, 'w'))
    rt = A.load_timing(raw)
    check('raw ASR: digit glue split, schema filled', [w['w'] for w in rt['words']] == ['about', '7', 'websites.']
          and rt['words'][1]['s'] == 0.4 and A.key('7') == A.key('seven'))
    check('gap anchor = a fraction of the pause after the word',
          close(A.anchor_time({'w': 6, 'dt': 0, 'gap': 0.5}, T), W[6]['e'] + 0.25) and
          close(A.anchor_time({'w': 4, 'dt': 0.01, 'gap': 1}, T), W[5]['s'] + 0.01))
    check('words.py --at round trip', all(close(A.anchor_time(to_anchor(t, W), T), t) for t in (0.0, 1.234, 5.5, 9.4)))
    check('JS number format', A.js_compact({'a': 2.0, 'b': 0.1, 'c': -0.0, 'd': 'é'}) == '{"a":2,"b":0.1,"c":0,"d":"é"}')

    # ---------------------------------------------------------------- 8. parity with the node generators
    node = shutil.which('node')
    if node:
        tm = A.load_json(os.path.join(A.ROOT, 'assets/timing.json'))
        warp = A.load_json(os.path.join(A.ROOT, 'assets/timewarp_v1_to_v2.json'))
        for sbp in ('docs/storyboard_v2voice.json', 'docs/storyboard.json'):
            full = os.path.join(A.ROOT, sbp)
            if not os.path.exists(full):
                continue
            nc, ns = os.path.join(tmp, 'node_caps.json'), os.path.join(tmp, 'node_scenes.json')
            subprocess.run([node, os.path.join(A.ROOT, 'scripts/gen-captions.mjs'), f'--storyboard={full}', f'--out={nc}'],
                           capture_output=True)
            subprocess.run([node, os.path.join(A.ROOT, 'scripts/gen-scenes.mjs'), f'--storyboard={full}', f'--out={ns}', '--force'],
                           capture_output=True)
            sb = A.load_json(full)
            ov_c = os.path.join(A.ROOT, 'src/data/captions.overrides.json')
            ov_s = os.path.join(A.ROOT, 'src/data/scenes.overrides.json')
            prow = E.caption_rows(sb, tm, A.load_json(ov_c) if os.path.exists(ov_c) else {}, log=lambda m: None)
            srow, _ = E.scene_rows(sb, float(tm['duration']), None, A.load_json(ov_s) if os.path.exists(ov_s) else {},
                                   warp, log=lambda m: None)
            check(f'captions.json byte-identical to gen-captions.mjs ({sbp})', A.js_rows(prow) == open(nc).read())
            check(f'scenes.json byte-identical to gen-scenes.mjs ({sbp})', A.js_rows(srow) == open(ns).read())
    else:
        print('skip  node not found: parity with the node generators not checked')

    # ---------------------------------------------------------------- 9. the v3 estimate
    script = os.path.join(A.ROOT, 'docs/script/final_script.md')
    cued = os.path.join(A.ROOT, 'docs/script/final_script_elevenlabs.txt')
    doc, _ = ET.build(script, cued, os.path.join(A.ROOT, 'assets/timing.json'))
    ws = doc['words']
    plain = A.plain_script(script)
    check('estimate: words == plain script (178, index = position)', [w['w'] for w in ws] == plain and len(ws) == 178
          and all(w['i'] == k for k, w in enumerate(ws)))
    check('estimate: monotonic, contiguous inside phrases, pauses after punctuation',
          all(w['e'] > w['s'] for w in ws) and all(ws[k + 1]['s'] >= ws[k]['e'] for k in range(len(ws) - 1))
          and all(ws[k + 1]['s'] == ws[k]['e'] for k in range(len(ws) - 1) if not A.punct_kind(ws[k]['w']))
          and {p['after'] for p in doc['pauses']} == {k for k in range(len(ws) - 1) if A.punct_kind(ws[k]['w'])})
    ell = [p for p in doc['pauses'] if p['kind'] == 'ellipsis']
    check('estimate: the ellipsis after "PHP" is its own, longer pause', len(ell) == 1 and ws[ell[0]['after']]['w'] == 'PHP,'
          and doc['estimate']['model']['pauses']['comma'] < ell[0]['dur'] < doc['estimate']['model']['pauses']['sentence'])
    check('estimate: flagged estimated, schema keys of timing.json', doc['estimated'] is True and
          set(A.load_json(os.path.join(A.ROOT, 'assets/timing.json'))) <= set(doc))
    check('estimate: caption pages tile the script', [i for c in doc['captions'] for i in range(c['words'][0], c['words'][1] + 1)]
          == list(range(178)) and doc['captions'][-1]['e'] == doc['duration'])
    check('estimate: CAPS stress words from the cued text', doc['estimate']['cuedCaps'] == ['purpose,', 'already', 'still', 'half'])
    v2 = A.load_json(os.path.join(A.ROOT, 'assets/timing.json'))
    v2w = [w['w'] for w in v2['words']]
    own = ET.estimate(v2w, v2w, ET.Pace(v2))
    check('estimate: in-sample, the v2 script re-estimated from its own pace lands within 2 %',
          abs(own[4] - v2['duration']) / v2['duration'] < 0.02, f"{own[4]} vs {v2['duration']}")
    disk = os.path.join(A.ROOT, 'assets/timing_est_v3.json')
    if os.path.exists(disk):
        d = A.load_json(disk)
        check('assets/timing_est_v3.json is current (same words and times as a fresh build)',
              [(w['w'], w['s'], w['e']) for w in d['words']] == [(w['w'], w['s'], w['e']) for w in ws])
    # an anchored storyboard on the estimate: resolve the toy's anchors onto the real script length works end to end
    est_sb = {'wordsRef': ' '.join(plain), 'scenes': [
        {'id': 'S01', 'title': 'Hook', 'start': {'w': 'START', 'dt': 0}, 'end': {'w': 29, 'dt': -0.2},
         'transitionIn': {'type': 'loop-start'}, 'beats': [{'t': {'w': 14, 'dt': -0.1, 'word': 'purpose,'}, 'action': 'press'}]},
        {'id': 'S02', 'title': 'Rest', 'start': {'w': 29, 'dt': -0.2}, 'end': {'w': 'END', 'dt': 0},
         'transitionIn': {'type': 'cut'}, 'transitionOut': {'t0': {'w': 'END', 'dt': -0.5}, 't1': {'w': 'END', 'dt': 0}}}]}
    ep = os.path.join(tmp, 'est_sb.json')
    json.dump(est_sb, open(ep, 'w'))
    code, log = run('resolve.py', ep, '--timing', disk, '-o', os.path.join(tmp, 'est_res.json'),
                    '--scenes-out', os.path.join(tmp, 'est_sc.json'), '--captions-out', os.path.join(tmp, 'est_ca.json'))
    er = A.load_json(os.path.join(tmp, 'est_res.json')) if code == 0 else {}
    check('a storyboard on the v3 estimate resolves (ESTIMATED flag carried)', code == 0 and 'ESTIMATED' in log
          and er['resolved']['estimated'] is True and close(er['scenes'][0]['beats'][0]['t'], ws[14]['s'] - 0.1), log[-400:])


if __name__ == '__main__':
    main()
