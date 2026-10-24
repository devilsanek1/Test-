"""Finish the beat-lock that scripts/qa/beatsync.py --fit-tempo starts.

beatsync anchors every cut it can on a BEAT, within +-8 % of the base tempo. A cut that no beat can reach is
DROPPED. On the final cut list that is S07 (foreground-wipe centre, 22.000 s): it sits 2.20 s after S06 and 2.11 s
before S08, i.e. 3.5 + 3.4 beats at 96 BPM, so no whole beat count fits within +-8 %.
This tool puts every dropped cut on the nearest HALF-beat (the '&' of a beat, an eighth note) instead. It re-solves
the per-beat durations of the segment between the two neighbouring anchors (the same smoothness objective as
beatsync, +-8 % bounds, exact at both anchors and at the cut), keeps every other beat of the fit untouched, and writes
the MIDI: the same notes and ticks, one set_tempo per beat.

    python3 audio/tools/beatlock.py [--proposal audio/tempo_map_proposal.json] [--midi audio/music_cinematic.mid]
                                    [--out audio/music_cinematic_retimed.mid] [--map-out audio/tempo_map_beatlocked.json]
Then verify:  python3 scripts/qa/beatsync.py --midi audio/music_cinematic_retimed.mid  (and --grid half)
"""
from __future__ import annotations

import argparse
import json
import math
import sys
from pathlib import Path

import mido
import numpy as np
from scipy.optimize import minimize

sys.path.insert(0, str(Path(__file__).parent))
from common import AUDIO  # noqa: E402


def solve_segment(d_prev, d_next, n_beats, total, h, tc, p0, max_dev):
    """Per-beat durations x[0..n_beats-1]: sum = total, time at half-beat h (beats from segment start) = tc,
    within +-max_dev of p0, smooth (incl. continuity with the neighbouring beats d_prev / d_next)."""
    lo, hi = p0 / (1 + max_dev), p0 / (1 - max_dev)
    k = int(math.floor(h))
    row_tot = np.ones(n_beats)
    row_cut = np.zeros(n_beats); row_cut[:k] = 1.0; row_cut[k] = h - k
    A = np.vstack([row_tot, row_cut]); b = np.array([total, tc])
    x0 = np.full(n_beats, total / n_beats)

    def f(x):
        xx = np.concatenate([[d_prev], x, [d_next]]) / p0
        return float(np.sum(np.diff(xx) ** 2) + 0.02 * np.sum((x / p0 - 1) ** 2))
    res = minimize(f, x0, method="SLSQP", bounds=[(lo, hi)] * n_beats,
                   constraints=[{"type": "eq", "fun": lambda x: A @ x - b}], options={"maxiter": 500, "ftol": 1e-14})
    return res.x, bool(res.success), float(np.max(np.abs(A @ res.x - b)))


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--proposal", default=str(AUDIO / "tempo_map_proposal.json"))
    ap.add_argument("--midi", default=str(AUDIO / "music_cinematic.mid"))
    ap.add_argument("--out", default=str(AUDIO / "music_cinematic_retimed.mid"))
    ap.add_argument("--map-out", default=str(AUDIO / "tempo_map_beatlocked.json"))
    a = ap.parse_args()
    P = json.loads(Path(a.proposal).read_text())
    ev = P["tempo_events"]
    t = np.array([e["t"] for e in ev] + [P["end_time"]])       # beat start times (+ the end)
    d = np.diff(t)                                                 # per-beat durations of the fit
    p0 = 60.0 / P["base_bpm"]
    max_dev = P["max_dev"]
    anchors = sorted([(0, 0.0)] + [(x["beat_index"], x["t"]) for x in P["anchors"]] + [(len(d), P["end_time"])])
    report = []
    for cut in P["dropped"]:
        name = cut.get("cut", cut.get("name", "?")); tc = float(cut["t"])
        (n0, t0) = max(x for x in anchors if x[1] < tc)
        (n1, t1) = min(x for x in anchors if x[1] > tc)
        best = None
        for k in range(n0, n1):
            h = k + 0.5 - n0
            pre, post = (tc - t0) / h, (t1 - tc) / (n1 - n0 - h)
            dev = max(abs(pre / p0 - 1), abs(post / p0 - 1))
            if best is None or dev < best[0]:
                best = (dev, h)
        dev, h = best
        x, ok, err = solve_segment(d[n0 - 1] if n0 > 0 else p0, d[n1] if n1 < len(d) else p0, n1 - n0, t1 - t0, h,
                                   tc - t0, p0, max_dev)
        d[n0:n1] = x
        report.append({"cut": name, "t": tc, "half_beat": round(n0 + h, 1), "segment_beats": [n0, n1],
                       "tempo_bpm_range": [round(60 / x.max(), 2), round(60 / x.min(), 2)], "solver_ok": ok,
                       "constraint_err_ms": round(err * 1000, 3)})
    newt = np.concatenate([[0.0], np.cumsum(d)])
    # MIDI: same tracks / notes / ticks, tempo track replaced by one set_tempo per beat (all meters here are x/4)
    src = mido.MidiFile(a.midi)
    ppq = src.ticks_per_beat
    out = mido.MidiFile(type=src.type, ticks_per_beat=ppq)
    for ti, tr in enumerate(src.tracks):
        msgs, tt = [], 0
        for m in tr:
            tt += m.time
            if m.type != "set_tempo":
                msgs.append((tt, m))
        if ti == 0:
            msgs += [(n * ppq, mido.MetaMessage("set_tempo", tempo=int(round(dd * 1e6)))) for n, dd in enumerate(d)]
            msgs.sort(key=lambda p: (p[0], 0 if p[1].type == "set_tempo" else 1))
        nt, prev = mido.MidiTrack(), 0
        for (tt, m) in msgs:
            nt.append(m.copy(time=tt - prev)); prev = tt
        out.tracks.append(nt)
    out.save(a.out)
    bpm = 60 / d
    Path(a.map_out).write_text(json.dumps({
        "generated_by": "audio/tools/beatlock.py (after scripts/qa/beatsync.py --fit-tempo)",
        "source_proposal": a.proposal, "base_bpm": P["base_bpm"], "max_dev": max_dev, "end_time": P["end_time"],
        "half_beat_locks": report, "bpm_range": [round(float(bpm.min()), 2), round(float(bpm.max()), 2)],
        "max_step_pct_per_beat": round(float(np.max(np.abs(np.diff(d) / d[:-1])) * 100), 2),
        "beat_times": [round(float(x), 5) for x in newt]}, indent=1))
    print(json.dumps(report, indent=1))
    print(f"tempo {bpm.min():.2f}-{bpm.max():.2f} BPM, max step {np.max(np.abs(np.diff(d) / d[:-1])) * 100:.2f} %/beat"
          f" -> {a.out}, {a.map_out}")


if __name__ == "__main__":
    main()
