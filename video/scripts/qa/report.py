#!/usr/bin/env python3
"""report.py <report_dir> <CompId>: combine deadframes / framecheck / beatsync results into <report_dir>/REPORT.md and
apply the QA gate (docs/QA.md):
  1. every scene: life score >= 8/10 and no dead run over the limit unless allow-listed   (deadframes)
  2. no framecheck ERRORS                                                                (framecheck)
  3. Main only: every cut within 25 ms of a beat of the music as it is now (i.e. after the tempo fit has been
     applied to the bed); the fit proposal is listed so the sound stream can apply it   (beatsync)
Exit code 0 = gate PASS, 1 = FAIL.
"""
import json
import os
import sys


def load(p):
    try:
        return json.load(open(p))
    except Exception:
        return None


def main():
    out, comp = sys.argv[1], sys.argv[2]
    df = load(os.path.join(out, 'deadframes.json'))
    fc = load(os.path.join(out, 'framecheck.json'))
    bs = load(os.path.join(out, 'beatsync', 'beatsync.json'))
    bsd = load(os.path.join(out, 'beatsync_detected', 'beatsync.json'))
    tm = load(os.path.join(out, 'tempo_map_proposal.json'))
    L = [f'# QA report: {comp}', '']
    gates = []
    if df:
        bad = [s for s in df['scenes'] if not s['pass']]
        ok = not bad
        gates.append(('life (deadframes)', ok, f"{df['passed']}/{len(df['scenes'])} scenes pass" + (': failing ' + ', '.join(
            f"{s['id']} {s['score']:.1f}/10" + (f" ({s['flagged_runs']} dead run{'s' if s['flagged_runs'] != 1 else ''} over {df['options']['dead_limit']:.2f} s)" if s['flagged_runs'] else '')
            for s in bad) if bad else '')))
    if not df:
        gates.append(('life (deadframes)', False, 'deadframes did not produce deadframes.json (see deadframes.log)'))
    if not fc:
        gates.append(('frames (framecheck)', False, 'framecheck did not produce framecheck.json (see framecheck.log)'))
    if comp == 'Main' and not bs:
        gates.append(('beat sync (beatsync)', False, 'beatsync did not produce beatsync/beatsync.json'))
    if fc:
        e = fc['summary']['errors']
        gates.append(('frames (framecheck)', e == 0, f"{e} errors, {fc['summary']['warnings']} warnings " + json.dumps(fc['summary']['by_kind'])))
    if bs:
        worst = max([abs(c['off_ms']) for c in bs['cuts']], default=0)
        ok = worst <= bs['tol_ms']
        msg = f"now: {bs['summary']}"
        if tm:
            msg += f"; fit proposal: {tm['stats']['after']} ({tm['stats']['anchors_kept']} anchors, {tm['stats']['anchors_dropped']} dropped, " \
                   f"tempo {tm['stats']['bpm_min']:.1f}-{tm['stats']['bpm_max']:.1f} BPM)"
        gates.append(('beat sync (beatsync)', ok, msg))
    allok = all(g[1] for g in gates) if gates else False
    L += [f"**QA gate: {'PASS' if allok else 'FAIL'}**", '', '| check | result | detail |', '|---|---|---|']
    for name, ok, msg in gates:
        L.append(f"| {name} | {'PASS' if ok else 'FAIL'} | {msg} |")
    L += ['']
    if df:
        L += ['## Life per scene (deadframes)', '', f"Chart: `deadframes.png`. {df['frames']} frames, {df['events_per_s']:.2f} events/s overall, scenes from {df['scenes_from']}.", '',
              '| scene | score | events/s | max gap (s) | dead frames | longest dead (s) | flagged runs | verdict |', '|---|---|---|---|---|---|---|---|']
        for s in df['scenes']:
            L.append(f"| {s['id']} | {s['score']:.1f} | {s['events_per_s']:.2f} | {s['max_gap_s']:.2f} | {s['dead_frames']} | {s['longest_dead_s']:.2f} | {s['flagged_runs']} | {'PASS' if s['pass'] else 'FAIL'} |")
        fl = [(s['id'], r) for s in df['scenes'] for r in s['dead_runs'] if r['flagged']]
        if fl:
            L += ['', 'Flagged dead runs (look at these frames; allow-list a deliberate hold in scripts/qa/holds.json):', '']
            for sid, r in fl:
                L.append(f"- {sid}: {r['frames']} dead frames, scene f{r['local_f0']}-f{r['local_f1']} (film {r['t0']:.2f}-{r['t1']:.2f} s)")
        L.append('')
    if fc:
        L += ['## Frame checks (framecheck)', '', f"Details: `framecheck.md`; flagged frames: `framecheck_frames.png`.", '']
        for r in fc['issues'][:40]:
            fr = f"f{r['f0']}" if r['f0'] == r['f1'] else f"f{r['f0']}-f{r['f1']}"
            L.append(f"- {r['severity'].upper()} {r['kind']} {fr} ({r['t0']:.2f} s): {r['msg']}")
        if len(fc['issues']) > 40:
            L.append(f"- ... {len(fc['issues']) - 40} more in framecheck.md")
        L.append('')
    if bs:
        L += ['## Beat sync (beatsync)', '', f"Grid: {bs['grid']}. Cuts: {bs['cuts_source']} (warp: {bs['warp']}).", '',
              f"- now: {bs['summary']}"]
        if tm:
            L.append(f"- tempo fit proposal (`tempo_map_proposal.json`, retimed MIDI `music_retimed.mid`): {tm['stats']['after']}; "
                     f"tempo {tm['stats']['bpm_min']:.2f}-{tm['stats']['bpm_max']:.2f} BPM ({tm['stats']['dev_min_pct']:+.1f}..{tm['stats']['dev_max_pct']:+.1f} %), "
                     f"max change {tm['stats']['max_step_pct_per_beat']:.2f} %/beat; dropped anchors: {', '.join(d['cut'] for d in tm['dropped']) or 'none'}")
        if bsd:
            L.append(f"- cross-check with the cuts DETECTED in the rendered frames: {bsd['summary']}")
        L += ['', 'Details: `beatsync/beatsync.md`.', '']
    with open(os.path.join(out, 'REPORT.md'), 'w') as fh:
        fh.write('\n'.join(L) + '\n')
    print('\n'.join(L[:8 + len(gates)]))
    return 0 if allok else 1


if __name__ == '__main__':
    sys.exit(main())
