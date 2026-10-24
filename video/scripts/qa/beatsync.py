#!/usr/bin/env python3
"""beatsync.py: how far is every cut from the music's beat grid, and a tempo map that puts beats ON the cuts.

  python3 scripts/qa/beatsync.py [--cuts scenes|storyboard|frames:<dir|video>|json:<file>|list:t1,t2]
         [--midi audio/music_cinematic.mid | --audio file.wav] [--grid beat|downbeat|half] [--tol-ms 25]
         [--warp auto|none|v1-to-v2|v2-to-v1] [--out report_dir]
  python3 scripts/qa/beatsync.py --fit-tempo [--anchor auto|downbeat|beat] [--max-dev 0.08]
         [--tempo-out audio/tempo_map_proposal.json] [--write-midi retimed.mid]

CUTS. `scenes` (default) = src/data/scenes.json: every scene start after the first (Film switches scenes there,
for every transition type), quantised to the first frame that shows the new scene (ceil(start * fps) / fps; turn
off with --no-quantize). `storyboard` = docs/storyboard_v2voice.json scene starts. `frames:` = the cut detector of
deadframes run on rendered frames. `json:` = a deadframes.json (its detected cuts) or a JSON list of seconds.
WARP. scenes.json may still be on the v1 voice timeline (70.69 s) while the music is on v2 (78 s); --warp auto maps
v1 -> v2 through assets/timewarp_v1_to_v2.json when the cut list ends on the v1 length and the music does not.
GRID. From the MIDI's tempo map and time signatures (pretty_midi), or from librosa beat tracking of an audio file.
Every cut gets its signed offset (cut - grid point) in ms to the nearest beat, downbeat and half-beat; the summary
counts cuts within --tol-ms of the chosen --grid.

--fit-tempo: the VOICE decides the cuts and the MUSIC bends. Each cut is assigned to a downbeat (or a beat) by
dynamic programming so that the average tempo between consecutive anchors stays within +-max-dev (8 %) of the base
tempo; anchors that cannot be reached are dropped and reported. Then the per-beat durations are solved as a smooth
curve (minimise the squared change of beat length beat to beat, plus a small pull to the base tempo) that passes
EXACTLY through every anchor (start 0, the kept cuts, and the music's end so the loop length is kept), with every
beat inside +-max-dev. Writes the proposal JSON (per-beat tempo events and an old->new time map for the sound
stream) and, with --write-midi, the MIDI with that tempo map (same ticks, new set_tempo events).
"""
from __future__ import annotations

import argparse
import datetime as dt
import json
import math
import os
import sys

import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import qalib as Q  # noqa: E402

FILM = os.path.join(Q.ROOT, 'src', 'data', 'scenes.json')
STORY = os.path.join(Q.ROOT, 'docs', 'storyboard_v2voice.json')
WARPF = os.path.join(Q.ROOT, 'assets', 'timewarp_v1_to_v2.json')
MIDI = os.path.join(Q.ROOT, 'audio', 'music_cinematic.mid')


# ---------------------------------------------------------------- beat grids

class Grid:
    def __init__(self, beats, downbeats, end, base_bpm, source, ppq=None, beat_ticks=None):
        self.beats = np.asarray(beats, float)          # beat onsets (s), last one < end
        self.down = np.asarray(downbeats, float)
        self.end = float(end)                          # end of the last bar (the loop point)
        self.base_bpm = base_bpm
        self.source = source
        self.ppq = ppq
        self.beat_ticks = beat_ticks
        # bar / beat labels
        di = np.searchsorted(self.beats, self.down - 1e-6)
        self.bar_of = np.zeros(len(self.beats), int)
        self.beat_in_bar = np.zeros(len(self.beats), int)
        for k, b in enumerate(self.beats):
            j = int(np.searchsorted(self.down, b + 1e-6)) - 1
            self.bar_of[k] = j + 1
            self.beat_in_bar[k] = k - int(di[j]) + 1 if j >= 0 else k + 1
        self.is_down = np.isin(np.arange(len(self.beats)), di)

    def points(self, kind):
        if kind == 'downbeat':
            return self.down
        if kind == 'half':
            b = np.append(self.beats, self.end)
            return np.sort(np.concatenate([self.beats, (b[:-1] + b[1:]) / 2]))
        return self.beats

    def label(self, n):
        if n >= len(self.beats):
            return 'end'
        return f'{self.bar_of[n]}.{self.beat_in_bar[n]}'


def grid_from_midi(path):
    import pretty_midi
    pm = pretty_midi.PrettyMIDI(path)
    tt, bpm = pm.get_tempo_changes()
    ppq = pm.resolution
    end_t = pm.get_end_time()
    # beats (quarter notes for x/4 meters) from the tempo map, until the end of the last bar
    ts = sorted(pm.time_signature_changes, key=lambda x: x.time) or [pretty_midi.TimeSignature(4, 4, 0.0)]

    def tick_to_time(tick):
        return pm.tick_to_time(int(round(tick)))
    # walk bars in ticks
    beat_ticks = []
    down_ticks = []
    tick = 0
    k = 0
    last_tick = pm.time_to_tick(end_t)
    while True:
        while k + 1 < len(ts) and pm.time_to_tick(ts[k + 1].time) <= tick:
            k += 1
        num, den = ts[k].numerator, ts[k].denominator
        q = ppq * 4 / den
        down_ticks.append(tick)
        for b in range(num):
            beat_ticks.append(tick + b * q)
        tick += num * q
        if tick >= last_tick - ppq * 0.05:
            break
    end_tick = tick
    # pretty_midi extrapolates past the last event at the last tempo
    beats = [tick_to_time(t) for t in beat_ticks]
    downs = [tick_to_time(t) for t in down_ticks]
    end = tick_to_time(end_tick)
    base = float(np.median(bpm)) if len(bpm) else 120.0
    g = Grid(beats, downs, end, base, f'MIDI {os.path.relpath(path, Q.ROOT)} ({base:.2f} BPM, {len(beats)} beats, {len(downs)} bars, end {end:.3f} s)',
             ppq=ppq, beat_ticks=beat_ticks + [end_tick])
    g.pm = pm
    return g


def grid_from_audio(path):
    import librosa
    y, sr = librosa.load(path, sr=22050, mono=True)
    tempo, bt = librosa.beat.beat_track(y=y, sr=sr, units='time', tightness=200)
    tempo = float(np.atleast_1d(tempo)[0])
    beats = np.asarray(bt, float)
    end = len(y) / sr
    # downbeats: every 4th beat, phase chosen by the strongest onset envelope
    env = librosa.onset.onset_strength(y=y, sr=sr)
    et = librosa.times_like(env, sr=sr)
    strength = [np.mean([env[min(len(env) - 1, np.searchsorted(et, b))] for b in beats[p::4]]) for p in range(4)]
    p = int(np.argmax(strength))
    return Grid(beats, beats[p::4], end, tempo, f'audio {os.path.relpath(path, Q.ROOT)} (librosa beat tracking, {tempo:.1f} BPM, '
                f'{len(beats)} beats; downbeats assumed every 4th beat)')


# ---------------------------------------------------------------- cuts

def load_warp(direction):
    sys.path.insert(0, os.path.join(Q.ROOT, 'scripts'))
    from timewarp import Warp  # scripts/timewarp.py (timing stream)
    d = json.load(open(WARPF))
    return Warp(d['anchors'], inverse=(direction == 'v2-to-v1')), d


def cuts_from_scenes(path):
    d = json.load(open(path))
    if isinstance(d, dict):
        d = d.get('scenes', [])
    d = sorted(d, key=lambda s: float(s['start']))
    cuts = []
    for s in d[1:]:
        tr = s.get('transitionIn') or {}
        cuts.append({'id': s['id'], 't_nominal': float(s['start']), 'type': tr.get('type', 'cut') if isinstance(tr, dict) else 'cut'})
    end = max(float(s['end']) for s in d)
    return cuts, end


def cuts_from_frames(src, fps):
    import deadframes as DF
    fs = Q.FrameSource(src, fps=fps)
    rows, _, _ = DF.analyze(fs, dict(Q.DEFAULTS), (280, 600), progress=False)
    new = [max(r['new1'], r['new4']) for r in rows]
    frac = [r['frac'] for r in rows]
    cuts = Q.detect_cuts(new, frac, fs.fps)
    return [{'id': f'cut{k + 1}', 't_nominal': c['frame'] / fs.fps, 'type': 'detected', 'frame': c['frame']} for k, c in enumerate(cuts)], len(rows) / fs.fps


def get_cuts(args, grid):
    spec = args.cuts
    end = None
    if spec == 'scenes' or spec.startswith('scenes:'):
        path = spec.split(':', 1)[1] if ':' in spec else FILM
        cuts, end = cuts_from_scenes(path)
        src = os.path.relpath(path, Q.ROOT)
    elif spec == 'storyboard' or spec.startswith('storyboard:'):
        path = spec.split(':', 1)[1] if ':' in spec else STORY
        cuts, end = cuts_from_scenes(path)
        src = os.path.relpath(path, Q.ROOT)
    elif spec.startswith('frames:'):
        cuts, end = cuts_from_frames(spec.split(':', 1)[1], args.fps)
        src = f"cut detector on {spec.split(':', 1)[1]}"
    elif spec.startswith('json:'):
        path = spec.split(':', 1)[1]
        d = json.load(open(path))
        if isinstance(d, dict) and 'cuts_detected' in d:
            cuts = [{'id': f'cut{k + 1}', 't_nominal': float(c['t']), 'type': 'detected'} for k, c in enumerate(d['cuts_detected'])]
            end = d.get('duration')
        else:
            cuts = [{'id': f'cut{k + 1}', 't_nominal': float(t), 'type': 'list'} for k, t in enumerate(d)]
        src = path
    elif spec.startswith('list:'):
        cuts = [{'id': f'cut{k + 1}', 't_nominal': float(t), 'type': 'list'} for k, t in enumerate(spec[5:].split(',')) if t.strip()]
        src = 'command line'
    else:
        raise SystemExit(f'unknown --cuts {spec}')
    # time warp
    warp_note = 'none'
    wmode = args.warp
    if wmode == 'auto':
        wmode = 'none'
        if end and os.path.exists(WARPF) and (spec == 'scenes' or spec.startswith('scenes')):
            wd = json.load(open(WARPF))
            if abs(end - wd['from']['duration']) < 0.3 and abs(grid.end - end) > 2.0:
                wmode = 'v1-to-v2'
    if wmode in ('v1-to-v2', 'v2-to-v1'):
        w, wd = load_warp(wmode)
        for c in cuts:
            c['t_v1' if wmode == 'v1-to-v2' else 't_v2'] = c['t_nominal']
            c['t_nominal'] = w(c['t_nominal'])
        end = w(end) if end else end
        warp_note = f'{wmode} via assets/timewarp_v1_to_v2.json (the cut list is on the {"v1" if wmode == "v1-to-v2" else "v2"} voice timeline)'
    for c in cuts:
        if args.no_quantize or c['type'] == 'detected':
            c['t'] = c['t_nominal']
        else:
            c['t'] = math.ceil(c['t_nominal'] * args.fps - 1e-6) / args.fps   # first frame showing the new scene
    cuts = [c for c in cuts if 0 < c['t'] < grid.end - 1e-3]
    return cuts, end, src, warp_note


# ---------------------------------------------------------------- offsets

def nearest(points, t):
    i = int(np.searchsorted(points, t))
    best = None
    for j in (i - 1, i):
        if 0 <= j < len(points):
            d = t - points[j]
            if best is None or abs(d) < abs(best[1]):
                best = (j, d)
    return best


def offsets(cuts, grid, kind, tol_ms):
    pts = grid.points(kind)
    rows = []
    for c in cuts:
        jb, db = nearest(grid.beats, c['t'])
        jd, dd = nearest(grid.down, c['t'])
        jh, dh = nearest(grid.points('half'), c['t'])
        jg, dg = nearest(pts, c['t'])
        rows.append({**c, 'grid_t': round(float(pts[jg]), 4), 'off_ms': round(dg * 1000, 1),
                     'beat': grid.label(jb), 'off_beat_ms': round(db * 1000, 1), 'off_downbeat_ms': round(dd * 1000, 1),
                     'off_half_ms': round(dh * 1000, 1), 'on_grid': abs(dg * 1000) <= tol_ms})
    return rows


def summary_line(rows, kind, tol_ms):
    if not rows:
        return 'cuts: 0'
    mx = max(abs(r['off_ms']) for r in rows)
    mean = float(np.mean([abs(r['off_ms']) for r in rows]))
    on = sum(r['on_grid'] for r in rows)
    return f"cuts: {len(rows)}, on-{kind} (<= {tol_ms:g} ms): {on}, max off-{kind}: {mx:.0f} ms, mean |offset|: {mean:.0f} ms"


# ---------------------------------------------------------------- tempo fit

def fit_tempo(cuts, grid, anchor='auto', max_dev=0.08, end_time=None, lam=0.02):
    """Assign cuts to beats (DP), then solve smooth per-beat durations through the anchors."""
    from scipy.optimize import minimize
    B = len(grid.beats)                      # beats 0..B-1; the grid end is beat index B
    orig = np.append(grid.beats, grid.end)
    p0 = 60.0 / grid.base_bpm
    lo, hi = p0 / (1 + max_dev), p0 / (1 - max_dev)
    T_end = float(end_time) if end_time else float(grid.end)
    down_idx = set(int(i) for i in np.nonzero(grid.is_down)[0])
    # candidates per cut: (beat index, cost)
    cands = []
    for c in cuts:
        jb = int(np.argmin(np.abs(grid.beats - c['t'])))
        cs = []
        for n in range(max(1, jb - 6), min(B, jb + 7)):
            isd = n in down_idx
            if anchor == 'downbeat' and not isd:
                continue
            base = 0.0 if isd else (0.1 if anchor == "auto" else 0.0)   # auto: a downbeat is worth ~3 % of tempo bend
            cs.append((n, base + 0.05 * abs(n - jb)))
        cands.append(cs)
    K = len(cuts)
    DROP = 50.0

    def seg_cost(t0, n0, t1, n1):
        if n1 <= n0:
            return None
        per = (t1 - t0) / (n1 - n0)
        if per < lo - 1e-9 or per > hi + 1e-9:
            return None
        return 100.0 * math.log(per / p0) ** 2
    # DP over (anchor, candidate); state carries the last KEPT anchor
    INF = float('inf')
    states = {(-1, 0): (0.0, None)}           # key: (last kept cut index or -1 for start, beat) -> (cost, back)
    last_t = {-1: 0.0}
    for k in range(K):
        new_states = dict(states)              # dropping cut k keeps every state as is (+DROP)
        for key in list(new_states):
            c0, b0 = new_states[key]
            new_states[key] = (c0 + DROP, ('drop', key))
        for (n, cc) in cands[k]:
            best = (INF, None)
            for key, (c0, _) in states.items():
                kk, n0 = key
                t0 = 0.0 if kk < 0 else cuts[kk]['t']
                sc = seg_cost(t0, n0, cuts[k]['t'], n)
                if sc is None:
                    continue
                v = c0 + sc + cc
                if v < best[0]:
                    best = (v, ('keep', key))
            if best[1] is not None:
                key = (k, n)
                if key not in new_states or best[0] < new_states[key][0]:
                    new_states[key] = best
        states = new_states
    # close at the end anchor
    best = (INF, None)
    for key, (c0, _) in states.items():
        kk, n0 = key
        t0 = 0.0 if kk < 0 else cuts[kk]['t']
        sc = seg_cost(t0, n0, T_end, B)
        if sc is None:
            continue
        if c0 + sc < best[0]:
            best = (c0 + sc, key)
    if best[1] is None:
        raise SystemExit('tempo fit: the end anchor is unreachable within the tempo range')
    # backtrack: rebuild the per-cut decisions by replaying the DP with stored back-pointers
    # (states only keep the final layer; recompute layers to backtrack)
    layers = []
    states = {(-1, 0): (0.0, None)}
    for k in range(K):
        new_states = {key: (c0 + DROP, ('drop', key)) for key, (c0, _) in states.items()}
        for (n, cc) in cands[k]:
            bst = (INF, None)
            for key, (c0, _) in states.items():
                kk, n0 = key
                t0 = 0.0 if kk < 0 else cuts[kk]['t']
                sc = seg_cost(t0, n0, cuts[k]['t'], n)
                if sc is None:
                    continue
                if c0 + sc + cc < bst[0]:
                    bst = (c0 + sc + cc, ('keep', key))
            if bst[1] is not None and ((k, n) not in new_states or bst[0] < new_states[(k, n)][0]):
                new_states[(k, n)] = bst
        layers.append(new_states)
        states = new_states
    assign = {}
    key = best[1]
    for k in range(K - 1, -1, -1):
        c0, back = layers[k][key]
        if key[0] == k:            # cut k kept with beat key[1]
            assign[k] = key[1]
        key = back[1]
    # anchors
    anchors = [(0, 0.0)] + [(assign[k], cuts[k]['t']) for k in sorted(assign)] + [(B, T_end)]
    # smooth per-beat durations through the anchors (SLSQP)
    A_eq = []
    b_eq = []
    for (n, t) in anchors[1:]:
        row = np.zeros(B)
        row[:n] = 1.0
        A_eq.append(row)
        b_eq.append(t)
    A_eq = np.array(A_eq)
    b_eq = np.array(b_eq)
    # initial guess: piecewise-constant segment tempos
    x0 = np.zeros(B)
    for (n0, t0), (n1, t1) in zip(anchors[:-1], anchors[1:]):
        x0[n0:n1] = (t1 - t0) / (n1 - n0)
    sc = 1.0 / p0

    def f(x):
        d = np.diff(x) * sc
        return float(np.sum(d * d) + lam * np.sum(((x - p0) * sc) ** 2))

    def g(x):
        d = np.diff(x) * sc
        gr = np.zeros_like(x)
        gr[:-1] -= 2 * d * sc
        gr[1:] += 2 * d * sc
        gr += 2 * lam * (x - p0) * sc * sc
        return gr
    res = minimize(f, x0, jac=g, method='SLSQP', bounds=[(lo, hi)] * B,
                   constraints=[{'type': 'eq', 'fun': lambda x: A_eq @ x - b_eq, 'jac': lambda x: A_eq}],
                   options={'maxiter': 500, 'ftol': 1e-12})
    x = res.x if res.success else x0
    x = np.clip(x, lo, hi)
    newb = np.concatenate([[0.0], np.cumsum(x)])
    err = max(abs(newb[n] - t) for (n, t) in anchors)
    dropped = [k for k in range(K) if k not in assign]
    return {'per_beat': x, 'new_beats': newb, 'orig_beats': orig, 'assign': assign, 'dropped': dropped, 'anchors': anchors,
            'solver': {'success': bool(res.success), 'message': str(res.message), 'max_anchor_err_ms': round(err * 1000, 3)},
            'lo': lo, 'hi': hi, 'p0': p0, 'T_end': T_end}


def write_retimed_midi(grid, per_beat, path):
    """Same notes (ticks), new tempo map: one set_tempo per beat."""
    import mido
    src = mido.MidiFile(os.path.join(Q.ROOT, 'audio', 'music_cinematic.mid') if not hasattr(grid, 'midi_path') else grid.midi_path)
    out = mido.MidiFile(type=src.type, ticks_per_beat=src.ticks_per_beat)
    ppq = src.ticks_per_beat
    for ti, tr in enumerate(src.tracks):
        absmsgs = []
        t = 0
        for m in tr:
            t += m.time
            if m.type == 'set_tempo':
                continue
            absmsgs.append((t, m))
        if ti == 0:
            for n, d in enumerate(per_beat):
                absmsgs.append((int(round(grid.beat_ticks[n] if grid.beat_ticks else n * ppq)), mido.MetaMessage('set_tempo', tempo=int(round(d * 1e6)))))
            absmsgs.sort(key=lambda p: (p[0], 0 if p[1].type == 'set_tempo' else 1))
        nt = mido.MidiTrack()
        prev = 0
        for (t, m) in absmsgs:
            nt.append(m.copy(time=t - prev))
            prev = t
        out.tracks.append(nt)
    os.makedirs(os.path.dirname(os.path.abspath(path)), exist_ok=True)
    out.save(path)


# ---------------------------------------------------------------- main

def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--cuts', default='scenes')
    ap.add_argument('--midi', default=None, help='MIDI beat grid (default audio/music_cinematic.mid)')
    ap.add_argument('--audio', default=None, help='beat-track an audio file instead of reading a MIDI')
    ap.add_argument('--grid', default='beat', choices=['beat', 'downbeat', 'half'])
    ap.add_argument('--tol-ms', type=float, default=25.0)
    ap.add_argument('--fps', type=float, default=30.0)
    ap.add_argument('--warp', default='auto', choices=['auto', 'none', 'v1-to-v2', 'v2-to-v1'])
    ap.add_argument('--no-quantize', action='store_true', help='use nominal scene starts, not the first frame of the new scene')
    ap.add_argument('--fit-tempo', action='store_true')
    ap.add_argument('--anchor', default='auto', choices=['auto', 'downbeat', 'beat'], help='fit: land cuts on downbeats, beats, or prefer downbeats (auto)')
    ap.add_argument('--max-dev', type=float, default=0.08, help='fit: tempo may vary within +-this fraction of the base (0.08)')
    ap.add_argument('--end-time', default='film', help='fit: where the music must end: "film" (default: the film\'s last frame, so the bed '
                    'loops with the video; falls back to the music end), "music" (keep the music length) or seconds')
    ap.add_argument('--tempo-out', default=os.path.join(Q.ROOT, 'audio', 'tempo_map_proposal.json'))
    ap.add_argument('--write-midi', default=None, help='fit: also write the retimed MIDI here')
    ap.add_argument('--out', default=None, help='report directory (beatsync.md / beatsync.json)')
    ap.add_argument('--quiet', action='store_true')
    args = ap.parse_args(argv)

    if args.audio:
        grid = grid_from_audio(args.audio)
    else:
        mp = args.midi or MIDI
        grid = grid_from_midi(mp)
        grid.midi_path = mp
    cuts, film_end, csrc, warp_note = get_cuts(args, grid)
    rows = offsets(cuts, grid, args.grid, args.tol_ms)
    summ = summary_line(rows, args.grid, args.tol_ms)
    rep = {'tool': 'beatsync', 'generated_at': dt.datetime.now().isoformat(timespec='seconds'), 'grid': grid.source, 'grid_kind': args.grid,
           'tol_ms': args.tol_ms, 'cuts_source': csrc, 'warp': warp_note, 'quantized_to_frames': not args.no_quantize, 'film_end': film_end,
           'cuts': rows, 'summary': summ}
    lines = [f'# Beat sync', '', f'Grid: {grid.source}.', f'Cuts: {csrc}; warp: {warp_note}; '
             f'{"frame-quantised (first frame of the new scene)" if not args.no_quantize else "nominal starts"}.', '',
             f'**Before: {summ}**', '',
             '| cut | type | t (s) | nearest beat | off beat (ms) | off downbeat (ms) | off half-beat (ms) |', '|---|---|---|---|---|---|---|']
    for r in rows:
        lines.append(f"| {r['id']} | {r['type']} | {r['t']:.3f} | {r['beat']} | {r['off_beat_ms']:+.0f} | {r['off_downbeat_ms']:+.0f} | {r['off_half_ms']:+.0f} |")
    print(f'beatsync: {grid.source}')
    print(f'  cuts from {csrc}; warp {warp_note}')
    for r in rows:
        print(f"  {r['id']:<6} {r['type']:<18} t={r['t']:7.3f}  beat {r['beat']:>6}  off-beat {r['off_beat_ms']:+6.0f} ms  "
              f"off-downbeat {r['off_downbeat_ms']:+6.0f} ms  off-half {r['off_half_ms']:+5.0f} ms")
    print(f'  BEFORE: {summ}')
    rc = 0
    if args.fit_tempo:
        if args.end_time == 'film':
            end_t = math.ceil(film_end * args.fps - 1e-6) / args.fps if film_end else None
            end_note = f'film end {end_t:.3f} s (music grid ends {grid.end:.3f} s)' if end_t else f'music end {grid.end:.3f} s'
        elif args.end_time == 'music':
            end_t, end_note = None, f'music end {grid.end:.3f} s'
        else:
            end_t = float(args.end_time)
            end_note = f'{end_t:.3f} s (command line)'
        fit = fit_tempo(cuts, grid, args.anchor, args.max_dev, end_t)
        newb = fit['new_beats']
        B = len(grid.beats)
        # re-measure against the new grid
        g2 = Grid(newb[:-1], [newb[i] for i in range(B) if grid.is_down[i]], newb[-1], grid.base_bpm, 'fitted')
        rows2 = offsets(cuts, g2, args.grid, args.tol_ms)
        rows2d = offsets(cuts, g2, 'downbeat', args.tol_ms)
        summ2 = summary_line(rows2, args.grid, args.tol_ms)
        bpm = 60.0 / fit['per_beat']
        steps = np.abs(np.diff(bpm)) / grid.base_bpm * 100
        anchors = []
        for k in sorted(fit['assign']):
            n = fit['assign'][k]
            c = cuts[k]
            anchors.append({'cut': c['id'], 'type': c['type'], 't': round(c['t'], 4), 'beat_index': n, 'bar_beat': grid.label(n),
                            'kind': 'downbeat' if grid.is_down[n] else 'beat', 'orig_beat_time': round(float(grid.beats[n]), 4),
                            'beat_moves_ms': round((c['t'] - float(grid.beats[n])) * 1000, 1)})
        dropped = []
        for k in fit['dropped']:
            c = cuts[k]
            jb = int(np.argmin(np.abs(grid.beats - c['t'])))
            dropped.append({'cut': c['id'], 't': round(c['t'], 4), 'nearest_beat': grid.label(jb),
                            'off_after_ms': next(r['off_ms'] for r in rows2 if r['id'] == c['id']),
                            'reason': f"no {'downbeat' if args.anchor == 'downbeat' else 'beat'} reachable with the tempo within "
                                      f"+-{100 * args.max_dev:.0f} % between its neighbours' anchors"})
        prop = {
            'generated_by': 'scripts/qa/beatsync.py --fit-tempo', 'generated_at': rep['generated_at'],
            'what': 'Tempo map proposal: the voice decides the cuts and the music bends. Beats (and, where possible, downbeats) land '
                    'exactly on the cut frames; the tempo varies smoothly within +-%.0f %% of the base tempo; the loop length is kept.' % (100 * args.max_dev),
            'grid_source': grid.source, 'cuts_source': csrc, 'warp': warp_note, 'quantized_to_frames': not args.no_quantize,
            'base_bpm': round(grid.base_bpm, 4), 'max_dev': args.max_dev, 'anchor_mode': args.anchor,
            'end_time': round(fit['T_end'], 4), 'end_anchor': end_note, 'solver': fit['solver'],
            'stats': {'bpm_min': round(float(bpm.min()), 3), 'bpm_max': round(float(bpm.max()), 3),
                      'dev_min_pct': round(float(bpm.min() / grid.base_bpm * 100 - 100), 2), 'dev_max_pct': round(float(bpm.max() / grid.base_bpm * 100 - 100), 2),
                      'max_step_pct_per_beat': round(float(steps.max()) if len(steps) else 0, 3),
                      'anchors_kept': len(anchors), 'anchors_dropped': len(dropped),
                      'after': summ2, 'after_downbeat': summary_line(rows2d, 'downbeat', args.tol_ms)},
            'anchors': anchors, 'dropped': dropped,
            'tempo_events': [{'beat_index': n, 'bar_beat': grid.label(n), 'tick': int(round(grid.beat_ticks[n])) if grid.beat_ticks else None,
                              't': round(float(newb[n]), 5), 'bpm': round(float(bpm[n]), 4)} for n in range(B)],
            'time_map': [[round(float(fit['orig_beats'][n]), 5), round(float(newb[n]), 5)] for n in range(B + 1)],
            'how_to_apply': 'MIDI: keep every note tick, replace the tempo track with tempo_events (one set_tempo per beat; '
                            'beatsync.py --write-midi does exactly this). Audio-domain renderers (audio/tools/bedkit.Grid): map a note at '
                            'original time t through time_map (piecewise-linear between beats) and scale its duration by the local '
                            'beat-length ratio.',
        }
        Q.write_json(args.tempo_out, prop)
        if args.write_midi and not args.audio:
            write_retimed_midi(grid, fit['per_beat'], args.write_midi)
            g3 = grid_from_midi(args.write_midi)
            rows3 = offsets(cuts, g3, args.grid, args.tol_ms)
            prop['stats']['verified_from_midi'] = summary_line(rows3, args.grid, args.tol_ms)
            Q.write_json(args.tempo_out, prop)
        rep['fit'] = {k: prop[k] for k in ('base_bpm', 'max_dev', 'anchor_mode', 'end_time', 'solver', 'stats', 'anchors', 'dropped')}
        rep['cuts_after'] = rows2
        rep['summary_after'] = summ2
        print(f"  FIT ({args.anchor}, +-{100 * args.max_dev:.0f} %): {len(anchors)} anchors kept, {len(dropped)} dropped; tempo "
              f"{bpm.min():.2f}-{bpm.max():.2f} BPM ({prop['stats']['dev_min_pct']:+.1f} .. {prop['stats']['dev_max_pct']:+.1f} %), "
              f"max change {prop['stats']['max_step_pct_per_beat']:.2f} %/beat; solver {fit['solver']['message']} "
              f"(anchor error {fit['solver']['max_anchor_err_ms']} ms)")
        for a in anchors:
            print(f"    {a['cut']:<6} t={a['t']:7.3f} -> {a['kind']:<8} {a['bar_beat']:>5} (that beat moves {a['beat_moves_ms']:+.0f} ms)")
        for d in dropped:
            print(f"    DROPPED {d['cut']} t={d['t']:.3f}: {d['reason']} (after the fit it sits {d['off_after_ms']:+.0f} ms off)")
        print(f'  AFTER:  {summ2}')
        if 'verified_from_midi' in prop['stats']:
            print(f"  verified from the retimed MIDI: {prop['stats']['verified_from_midi']}")
        print(f'  tempo map proposal: {args.tempo_out}')
        lines += ['', f"## Tempo fit (anchor {args.anchor}, +-{100 * args.max_dev:.0f} %)", '',
                  f"**After: {summ2}** ({len(anchors)} anchors kept, {len(dropped)} dropped; tempo {bpm.min():.2f}-{bpm.max():.2f} BPM, "
                  f"max change {prop['stats']['max_step_pct_per_beat']:.2f} % per beat). Proposal: `{os.path.relpath(args.tempo_out, Q.ROOT)}`.", '',
                  '| cut | t (s) | lands on | kind | that beat moves (ms) |', '|---|---|---|---|---|']
        for a in anchors:
            lines.append(f"| {a['cut']} | {a['t']:.3f} | {a['bar_beat']} | {a['kind']} | {a['beat_moves_ms']:+.0f} |")
        for d in dropped:
            lines.append(f"| {d['cut']} | {d['t']:.3f} | DROPPED | {d['reason']} | {d['off_after_ms']:+.0f} off after |")
        worst = max([abs(r['off_ms']) for r in rows2], default=0)
        rc = 0 if worst <= args.tol_ms else 1
    else:
        worst = max([abs(r['off_ms']) for r in rows], default=0)
        rc = 0 if worst <= args.tol_ms else 1
    if args.out:
        os.makedirs(args.out, exist_ok=True)
        Q.write_json(os.path.join(args.out, 'beatsync.json'), rep)
        with open(os.path.join(args.out, 'beatsync.md'), 'w') as fh:
            fh.write('\n'.join(lines) + '\n')
        print(f"  report: {os.path.join(args.out, 'beatsync.md')}")
    return rc


if __name__ == '__main__':
    sys.exit(main())
