"""Composition toolkit: time grid, harmony helpers, note recording (audio + MIDI), effects, loop-safe bounce."""
from __future__ import annotations

import sys
from pathlib import Path

import numpy as np
import pretty_midi
from pedalboard import (Pedalboard, Reverb, HighpassFilter, LowpassFilter, PeakFilter, LowShelfFilter,
                        HighShelfFilter, Compressor, Chorus, Delay, Gain, Limiter)

sys.path.insert(0, str(Path(__file__).parent))
from common import SR, VIDEO_DUR, N_TOTAL, db2a, a2db, lufs, true_peak_db, save  # noqa: E402
from sampler import Track, render_sf2  # noqa: E402

TAIL = 8.0  # seconds rendered past the loop point, then wrapped onto the start

PCS = {"C": 0, "C#": 1, "Db": 1, "D": 2, "D#": 3, "Eb": 3, "E": 4, "F": 5, "F#": 6, "Gb": 6, "G": 7,
       "G#": 8, "Ab": 8, "A": 9, "A#": 10, "Bb": 10, "B": 11}
QUAL = {"": [0, 4, 7], "m": [0, 3, 7], "7": [0, 4, 7, 10], "m7": [0, 3, 7, 10], "maj7": [0, 4, 7, 11],
        "sus4": [0, 5, 7], "7sus4": [0, 5, 7, 10], "m6": [0, 3, 7, 9], "m9": [0, 3, 7, 10, 14],
        "add9": [0, 4, 7, 14], "madd9": [0, 3, 7, 14], "maj9": [0, 4, 7, 11, 14], "7b9": [0, 4, 7, 10, 13],
        "dim": [0, 3, 6], "m7b5": [0, 3, 6, 10], "maj7#11": [0, 4, 7, 11, 18], "6": [0, 4, 7, 9],
        "sus2": [0, 2, 7], "add11": [0, 4, 7, 17], "5": [0, 7]}


def chord(sym):
    """'Dm', 'Bbmaj7', 'C/E' -> (root_pc, [pcs], bass_pc)"""
    bass = None
    if "/" in sym:
        sym, b = sym.split("/"); bass = PCS[b]
    r = sym[:2] if len(sym) > 1 and sym[1] in "#b" else sym[:1]
    q = sym[len(r):]
    root = PCS[r]
    pcs = [(root + i) % 12 for i in QUAL[q]]
    return root, pcs, (root if bass is None else bass)


def tones(pcs, lo, hi):
    return [m for m in range(lo, hi + 1) if m % 12 in pcs]


def nearest(pc, center):
    """MIDI note of pitch class pc closest to center."""
    c = center - ((center - pc) % 12)
    return c if center - c <= 6 else c + 12


class Grid:
    """Bars of variable length (in beats); bar numbers are 1-based; beat positions 0-based floats."""

    def __init__(self, beats_per_bar: list[float], total=VIDEO_DUR):
        self.bpb = beats_per_bar
        self.beat = total / sum(beats_per_bar)
        self.starts = np.concatenate([[0], np.cumsum(beats_per_bar)])
        self.bpm = 60.0 / self.beat

    def t(self, bar, beat=0.0):
        return (self.starts[bar - 1] + beat) * self.beat


class Bed:
    def __init__(self, name, grid: Grid, seed=1):
        self.name = name
        self.g = grid
        self.T = VIDEO_DUR
        self.tracks: dict[str, Track] = {}
        self.midi: dict[str, list] = {}
        self.programs: dict[str, tuple] = {}
        self.rng = np.random.default_rng(seed)

    def track(self, name, program=0, is_drum=False, pan=0.0):
        if name not in self.tracks:
            self.tracks[name] = Track(self.T + TAIL, pan=pan)
            self.midi[name] = []
            self.programs[name] = (program, is_drum)
        return self.tracks[name]

    def note(self, tname, inst, pitch, vel, bar, beat, dur_beats, pan=None, human=True, gain_db=0.0):
        t0 = self.g.t(bar, beat)
        dt = self.rng.normal(0, 0.005) if human else 0.0
        v = int(np.clip(vel + (self.rng.normal(0, 3) if human else 0), 1, 127))
        dur = dur_beats * self.g.beat
        tr = self.tracks[tname]
        tr.add(inst.render(pitch, v, dur), max(0.0, t0 + dt), pan, gain_db)
        self.midi[tname].append((t0, dur, int(round(pitch)), v))

    def sf2_track(self, tname, notes_bt, program, bank=0, is_drum=False, gain_db=0.0):
        """notes_bt: list of (bar, beat, dur_beats, pitch, vel) rendered with GeneralUser GS."""
        tr = self.track(tname, program, is_drum)
        notes = []
        for (bar, beat, db_, p, v) in notes_bt:
            t0 = self.g.t(bar, beat) + self.rng.normal(0, 0.004)
            v = int(np.clip(v + self.rng.normal(0, 3), 1, 127))
            notes.append((max(0.0, t0), db_ * self.g.beat, p, v))
            self.midi[tname].append((self.g.t(bar, beat), db_ * self.g.beat, int(p), v))
        y = render_sf2(notes, self.T + TAIL, program, bank=bank, is_drum=is_drum)
        tr.buf[: len(y)] += y * db2a(gain_db)

    # ---------------------------------------------------------------- export
    def write_midi(self, path, time_sigs=None, quarter_bpm=None):
        """quarter_bpm: MIDI tempo is in quarter notes; pass beat_bpm*1.5 for compound (x/8) meters."""
        pm = pretty_midi.PrettyMIDI(initial_tempo=quarter_bpm or self.g.bpm)
        if time_sigs:
            pm.time_signature_changes = [pretty_midi.TimeSignature(n, d, t) for (n, d, t) in time_sigs]
        for name, notes in self.midi.items():
            prog, drum = self.programs[name]
            ins = pretty_midi.Instrument(program=prog, is_drum=drum, name=name)
            for (t0, dur, p, v) in notes:
                ins.notes.append(pretty_midi.Note(velocity=v, pitch=int(np.clip(p, 0, 127)), start=t0,
                                                  end=min(t0 + max(dur, 0.05), self.T + TAIL)))
            pm.instruments.append(ins)
        pm.write(str(path))


def automation(n, points, sr=SR):
    """points: [(t_seconds, dB)] -> gain curve (linear) of length n (held at ends)."""
    ts = np.array([p[0] for p in points]); ds = np.array([p[1] for p in points], dtype=float)
    t = np.arange(n) / sr
    return db2a(np.interp(t, ts, ds))


def fx(x, plugins):
    board = Pedalboard(plugins)
    return board(x.T.astype(np.float32), SR).T.astype(np.float64)


def reverb_send(x, room=0.6, damp=0.5, width=1.0, pre_hp=200.0, post_lp=7000.0):
    return fx(x, [HighpassFilter(pre_hp), Reverb(room_size=room, damping=damp, wet_level=1.0, dry_level=0.0,
                                                 width=width), LowpassFilter(post_lp)])


def voice_carve(x, depth_db=-4.0):
    """Static 'pocket' for the narrator: wide dip centred ~2.2 kHz (covers ~1-4 kHz) plus a
    gentle dip where a male voice's f0/low formants live, so the bed never masks diction."""
    return fx(x, [PeakFilter(2200, depth_db, 0.55), PeakFilter(1200, depth_db * 0.4, 1.0),
                  PeakFilter(3800, depth_db * 0.5, 1.2), PeakFilter(160, -1.5, 1.0), HighpassFilter(32)])


def loop_wrap(y, T=VIDEO_DUR):
    """Fold everything rendered past T back onto the start -> perfectly circular audio."""
    n = int(round(T * SR))
    out = y[:n].copy()
    tail = y[n:]
    k = 0
    while k < len(tail):
        m = min(n, len(tail) - k)
        out[:m] += tail[k:k + m]
        k += m
    return out


def circular_process(y, plugins, preroll=3.0):
    """Run a stateful/dynamic chain on circular audio: prepend the last `preroll` s so the
    processor state at t=0 equals its state at the loop end."""
    p = int(preroll * SR)
    z = np.concatenate([y[-p:], y], axis=0)
    z = fx(z, plugins)
    return z[p:p + len(y)]


def finish(bed: Bed, mixdown, out_wav, target_lufs=-20.0, normalize=True, glue=True):
    """mixdown: stereo (T+TAIL). Wrap, glue, normalise, report. normalize=False keeps absolute levels
    (used by the near-silent bed, whose level is set relative to the -17 LUFS VO stem)."""
    y = loop_wrap(mixdown)
    if glue:
        y = circular_process(y, [Compressor(threshold_db=-22, ratio=1.6, attack_ms=30, release_ms=250),
                                 Limiter(threshold_db=-3.0, release_ms=150)])
    if normalize:
        y = y * db2a(target_lufs - lufs(y))
    tp = true_peak_db(y)
    if tp > -2.0:
        y = y * db2a(-2.0 - tp)
    save(out_wav, y)
    print(f"{bed.name}: {len(y) / SR:.3f}s  {lufs(y):.2f} LUFS  TP {true_peak_db(y):.2f} dBTP  -> {out_wav}")
    return y
