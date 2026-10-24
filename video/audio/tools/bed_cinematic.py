"""Bed "cinematic" v4: MIDI-driven, fitted to the FINAL voice (assets/vo_v3_final.wav, 55.36 s; loop 55.5 s).

Approved character (user): warm, modern explainer with a touch of space, NEAR-SILENT hook, subtle overall.
B minor / D major, felt-piano 8th pulse + felt-piano motif, quiet low strings, pp violin / bowed-vibraphone air,
celesta glint, soft spiccato for the tension, ONE soft scale accent (Cloudflare), quiet loop-safe close.

TWO STAGES, so the tempo can be bent later without touching the music:
  1. compose  -> audio/music_cinematic.mid  (all notes in TICKS on a 96.2 BPM grid, 22 bars of 3/4..6/4, ppq 960)
                 audio/music_cinematic.json (structure: bars, sections, loop end in beats, level arc, routing)
  2. render   <- ANY MIDI with those tracks: note times come from the MIDI's own tempo map (pretty_midi), so a
                 tempo-bent MIDI (scripts/qa/beatsync.py --fit-tempo --write-midi X.mid) renders with every
                 note, the accent, the level arc and the loop point following the new beat times.

    python3 audio/tools/bed_cinematic.py                      # compose + render
    python3 audio/tools/bed_cinematic.py --render-only --midi audio/music_cinematic_retimed.mid
    python3 audio/tools/bed_cinematic.py --compose-only

Section lines on the base grid (96.22 BPM), next to the measured voice pauses / raw word times:
  hook 0-14.34 (air only) | entrance 14.34 "This bug was in there" (14.32) | 19.95 "They gave" (19.84)
  | leak 21.83 "but word got out" (22.00) | Cloudflare 26.19 (pause 26.31-26.79, word 26.64: the one accent)
  | suspension 32.43 "and millions within a day" | breath 34.30 "But even with the fix out" (34.72)
  | rebuild 39.29 "Plus" (39.68) | close 52.38 "And some of those governments" (52.32) | loop 55.5.
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

import numpy as np
import pretty_midi

sys.path.insert(0, str(Path(__file__).parent))
from bedkit import (chord, tones, nearest, automation, fx, reverb_send, voice_carve, loop_wrap, circular_process,  # noqa
                    TAIL, HighpassFilter, LowpassFilter, HighShelfFilter, LowShelfFilter, PeakFilter, Compressor,
                    Limiter)
from common import AUDIO, SR, VIDEO_DUR, db2a, lufs, true_peak_db, save  # noqa: E402
from sampler import Track, render_sf2  # noqa: E402

MIDI_PATH = AUDIO / "music_cinematic.mid"
META_PATH = AUDIO / "music_cinematic.json"
PPQ = 960

# ---------------------------------------------------------------- structure (beats per bar, 22 bars, 89 beats)
SECTIONS = {"S1_hook": (1, 6), "S2_entrance": (7, 8), "S3_heads_up": (9, 9), "S4_leak": (10, 11),
            "S5_cloudflare": (12, 13), "S6_suspension": (14, 14), "S7_breath": (15, 16), "S8_rebuild": (17, 21),
            "S9_close": (22, 22)}
BPB = [4, 4, 4, 4, 4, 3, 4, 5, 3, 4, 3, 4, 6, 3, 4, 4, 4, 4, 4, 4, 5, 5]
LOOP_BEATS = sum(BPB)                      # 89
BASE_LOOP = VIDEO_DUR                      # 55.5 s at the base tempo
BEAT = BASE_LOOP / LOOP_BEATS              # 0.6236 s -> 96.22 BPM
STARTS = np.concatenate([[0], np.cumsum(BPB)])

CH = {1: "Bmadd9", 2: "Bmadd9", 3: "Gmaj7", 4: "Gmaj7", 5: "D/F#", 6: "Asus4", 7: "Bm", 8: "Gmaj7", 9: "D/F#",
      10: "Em7", 11: "F#sus4", 12: "Bm", 13: "Bm/A", 14: "F#7sus4", 15: "Gmaj9", 16: "Em9", 17: "Bm", 18: "Gmaj7",
      19: "D", 20: "A", 21: "Em7", 22: "F#sus4"}
CH2 = {11: (1.5, "F#7"), 13: (3, "Gmaj7"), 6: (2, "A")}
PMAX = 42  # piano stays in the soft (felt) velocity layer; the next layer is ~12 dB louder

# level arc (bar, beat, dB): near-silent hook, entrance, ..., quiet close == quiet start (loop-safe)
ARC = [(1, 0, -4), (7, 0, -3), (9, 0, 0), (10, 0, -1.5), (12, 0, 1.0), (14, 0, -0.5), (15, 0, -2.5), (17, 0, 0),
       (21, 0, -1.5), (22, 0, -3), ("END", 0, -4)]

# mix trims (dB) + routing: track -> (instrument, pan, fx key, gain, reverb send)
GAINS = {"motif": 13.0, "pulse": 5.0, "breath": -8.0, "low": 0.0, "cello": -6.0, "air_vln_L": -7.0, "air_vln_R": -7.0,
         "air_vib": -7.0, "spic_vc": -4.0, "spic_vla": -4.0, "celesta": 0.0, "accent": -28.0}
PANS = {"motif": 0.12, "pulse": -0.1, "breath": 0.0, "low": 0.0, "cello": -0.2, "air_vln_L": -0.35, "air_vln_R": 0.35,
        "air_vib": 0.3, "spic_vc": 0.15, "spic_vla": 0.3, "celesta": 0.0, "accent": 0.0}
SENDS = {"breath": 0.5, "motif": 0.45, "pulse": 0.25, "low": 0.2, "cello": 0.35, "air_vln_L": 0.8, "air_vln_R": 0.8,
         "air_vib": 0.8, "spic_vc": 0.25, "spic_vla": 0.25, "celesta": 0.6, "accent": 0.2}
PROGRAMS = {"motif": 0, "pulse": 0, "breath": 0, "low": 43, "cello": 42, "air_vln_L": 48, "air_vln_R": 48,
            "air_vib": 11, "spic_vc": 48, "spic_vla": 48, "celesta": 8, "accent": 116}


def ch(bar, beat=0.0):
    if bar in CH2 and beat >= CH2[bar][0]:
        return chord(CH2[bar][1])
    return chord(CH[bar])


def nb(bar):
    return BPB[bar - 1]


def sec(bar):
    for k, (a, b) in SECTIONS.items():
        if a <= bar <= b:
            return k.split("_")[0]


def gbeat(bar, beat=0.0):
    return STARTS[bar - 1] + beat


# ================================================================ 1. COMPOSE (beats -> MIDI ticks)
def compose(seed=44):
    rng = np.random.default_rng(seed)
    notes = {k: [] for k in GAINS}

    def add(track, pitch, vel, bar, beat, dur, human=True, vmax=127):
        b0 = gbeat(bar, beat) + (rng.normal(0, 0.005) / BEAT if human else 0.0)
        v = int(np.clip(vel + (rng.normal(0, 3) if human else 0), 1, vmax))
        b1 = min(gbeat(bar, beat) + dur, LOOP_BEATS)          # never past the loop point (render rings on)
        notes[track].append((max(0.0, b0), b1, int(pitch), v))

    # -------- felt-piano pulse (8ths, 3+3+2 accents): enters at the entrance, leaves before the close
    base = {7: 25, 8: 29, 9: 32, 12: 36, 13: 37, 17: 31, 18: 32, 19: 32, 20: 30, 21: 27}
    for bar, b in base.items():
        n8 = nb(bar) * 2
        acc = {6: (0, 3), 8: (0, 3, 6), 10: (0, 3, 6, 8), 12: (0, 3, 6, 9)}[n8]
        for k in range(n8):
            ts = tones(ch(bar, k / 2)[1], 62, 74)
            lo_, hi_ = ts[0], ts[min(2, len(ts) - 1)]
            add("pulse", lo_ if k % 2 == 0 else hi_, b + (7 if k in acc else 0), bar, k / 2, 0.45, vmax=PMAX)
    # -------- felt-piano motif (human scale)
    motif = [(8, 2, 83, 1, 40), (8, 3, 81, .5, 36), (8, 3.5, 78, 1.5, 36), (9, 0, 86, 2, 37),
             (15, 2, 81, 1, 28), (15, 3, 83, 1, 28), (16, 0, 86, 2, 28), (16, 2, 83, 2, 26),
             (18, 2, 83, 1, 40), (18, 3, 81, .5, 36), (18, 3.5, 78, 1.5, 36), (19, 2, 81, 1, 38), (19, 3, 78, 1, 36),
             (20, 0, 76, 2, 36), (20, 2, 81, 2, 36),
             (21, 0, 83, 1.5, 34), (21, 1.5, 81, .5, 32), (21, 2, 79, 3, 32)]
    for (bar, beat, p, d, v) in motif:
        add("motif", p, v, bar, beat, d, vmax=PMAX)
    for bar, v0 in ((15, 30), (16, 28)):           # the breath: rolled chords
        for k, p in enumerate(tones(ch(bar)[1], 62, 76)[:4]):
            add("breath", p, v0 - k, bar, 0.12 * k, nb(bar) - 0.2, human=False)
    # -------- warm low strings (quiet)
    for bar in range(1, 23):
        s = sec(bar)
        _, pcs, bass = ch(bar)
        if s in ("S3", "S4", "S5", "S8") or bar == 8:
            v = 46 if s in ("S4", "S5") else 34 if bar in (8, 21) else 40
            add("low", nearest(bass, 36), v, bar, 0, nb(bar))
        if s in ("S4", "S5") or bar in (17, 18, 19, 20):
            fifth = tones(pcs, 50, 62)
            add("cello", fifth[len(fifth) // 2], 40, bar, 0, nb(bar))
    add("low", nearest(6, 36), 40, 14, 0, nb(14) - 0.3)                    # suspension: F#
    add("low", nearest(7, 36), 30, 15, 0, nb(15) + nb(16) - 0.4)           # breath: one long G
    # -------- air: pp high violins + bowed vibraphone (the hook and the close are air only)
    for bar, two in ((1, True), (3, True), (5, True), (12, True), (17, True), (19, True), (22, False)):
        _, pcs, _ = ch(bar)
        hi = tones(pcs, 78, 90)
        dur = (nb(bar) + nb(bar + 1) - 0.2) if two else nb(bar)
        add("air_vln_L", hi[-1], 28 if bar in (1, 3, 5, 22) else 34, bar, 0, dur)
        if bar in (12, 17):
            add("air_vln_R", hi[max(0, len(hi) - 3)], 32, bar, 0, dur)
    for bar, v in ((1, 36), (15, 38), (22, 36)):
        _, pcs, _ = ch(bar)
        add("air_vib", tones(pcs, 76, 88)[-1], v, bar, 0, (nb(bar) + (nb(bar + 1) if bar < 22 else 0)) - 0.3)
    # -------- spiccato: leak creep -> Cloudflare urgency
    for bar in (10, 11, 12, 13):
        step = 0.25 if bar == 11 else 0.5
        start = 2.0 if bar == 10 else 0.0
        for k, beat in enumerate(np.arange(start, nb(bar), step)):
            _, pcs, bass = ch(bar, beat)
            v = 36 + (k * 1.5 if bar in (10, 11) else (6 if beat % 1 == 0 else 0)) + (bar - 10) * 2
            add("spic_vc", nearest(bass, 47), v, bar, beat, step)
            if bar >= 11:
                up = tones(pcs, 62, 71)
                add("spic_vla", up[k % len(up)], v - 4, bar, beat, step)
    # -------- celesta glint on "figured out" (18.16 s in the raw words) + the rebuild
    fb = 18.16 / BEAT
    bar_f = int(np.searchsorted(STARTS, fb, side="right"))
    for p, v in ((90, 46), (95, 40)):
        add("celesta", p, v, bar_f, fb - STARTS[bar_f - 1], 2.0, human=False)
    add("celesta", 98, 32, 17, 0, 1.5, human=False)
    # -------- the one soft scale accent: Cloudflare; the note is a trigger for the renderer
    # v5: on bar 12's SECOND beat (after the beat-lock ~26.6 s): inside the voice pause before "Cloudflare" and on
    # the storyboard's reveal (dome arc 26.54 / board rises 26.64), not on top of "...use it."
    add("accent", 30, 100, 12, 1.0, 1.0, human=False)

    # -------- write MIDI (ticks are the truth; tempo = base grid) + sidecar
    bpm = 60.0 / BEAT
    pm = pretty_midi.PrettyMIDI(resolution=PPQ, initial_tempo=bpm)
    prev = None
    for b, n in enumerate(BPB, start=1):
        if n != prev:
            pm.time_signature_changes.append(pretty_midi.TimeSignature(n, 4, gbeat(b) * BEAT))
            prev = n
    for name, lst in notes.items():
        ins = pretty_midi.Instrument(program=PROGRAMS[name], name=name)
        for (b0, b1, p, v) in lst:
            ins.notes.append(pretty_midi.Note(velocity=v, pitch=p, start=b0 * BEAT, end=max(b1, b0 + 0.05) * BEAT))
        pm.instruments.append(ins)
    pm.write(str(MIDI_PATH))
    meta = {"what": "structure of audio/music_cinematic.mid (render with audio/tools/bed_cinematic.py)",
            "voice": "assets/vo_v3_final.wav", "ppq": PPQ, "base_bpm": round(bpm, 4), "beats_per_bar": BPB,
            "loop_end_beats": LOOP_BEATS, "base_loop_s": BASE_LOOP, "sections_bars": SECTIONS,
            "level_arc_bar_beat_db": ARC, "accent": "track 'accent': swell ends on the note, soft sub on it",
            "provisional": "tempo map not final: bend with scripts/qa/beatsync.py --fit-tempo --write-midi"}
    META_PATH.write_text(json.dumps(meta, indent=1))
    print(f"composed {MIDI_PATH} ({bpm:.2f} BPM, {len(BPB)} bars, {LOOP_BEATS} beats, {BASE_LOOP:.3f} s) + {META_PATH.name}")


# ================================================================ 2. RENDER (MIDI tempo map -> audio)
def render(midi_path=MIDI_PATH, out=AUDIO / "music_cinematic.wav", target_lufs=-20.0):
    import instruments as I
    import make_sfx as SFX
    pm = pretty_midi.PrettyMIDI(str(midi_path))
    meta = json.loads(META_PATH.read_text())
    ppq = pm.resolution
    starts = np.concatenate([[0], np.cumsum(meta["beats_per_bar"])])

    def bt(beats):                                        # beat index -> seconds, through the MIDI tempo map
        return float(pm.tick_to_time(int(round(beats * ppq))))
    loop_end = bt(meta["loop_end_beats"])
    n = int(round((loop_end + TAIL) * SR))
    inst = {"motif": I.get("piano"), "pulse": I.get("piano"), "breath": I.get("piano"), "low": I.get("cb_sus"),
            "cello": I.get("vc_sus"), "air_vln_L": I.get("vln_sus"), "air_vln_R": I.get("vln_sus"),
            "air_vib": I.get("vibes_bowed"), "spic_vc": I.get("vc_spic"), "spic_vla": I.get("vla_spic")}
    tracks = {}
    for ins in pm.instruments:
        name = ins.name
        tr = Track(loop_end + TAIL, pan=PANS.get(name, 0.0))
        if name in inst:
            for nt in ins.notes:
                tr.add(inst[name].render(nt.pitch, nt.velocity, nt.end - nt.start), nt.start)
        elif name == "celesta":
            y = render_sf2([(nt.start, nt.end - nt.start, nt.pitch, nt.velocity) for nt in ins.notes],
                           loop_end + TAIL, 8)
            tr.buf[: len(y)] += y
        elif name == "accent":
            swell, imp = SFX.low_swell(36.7, 46.25), SFX.sub_impact(46.25)        # in key (F#1)
            for nt in ins.notes:
                g = nt.velocity / 127.0
                tr.add(swell * g, nt.start - len(swell) / SR)
                tr.add(imp * g, nt.start)
        tracks[name] = tr
    felt = [HighpassFilter(70), LowpassFilter(3000), HighShelfFilter(1400, -4, 0.7), LowShelfFilter(220, -3)]
    chains = {"motif": [HighpassFilter(70), LowpassFilter(4500), HighShelfFilter(2500, -2, 0.7), LowShelfFilter(220, -3),
                        Compressor(-34, 3.0, 4, 200)],
              "pulse": felt + [LowpassFilter(2200)], "breath": felt,
              "low": [HighpassFilter(36), LowpassFilter(600)],
              "cello": [HighpassFilter(70), LowpassFilter(900), PeakFilter(250, -3, 1.0)],
              "air_vln_L": [HighpassFilter(900), LowpassFilter(9000)], "air_vln_R": [HighpassFilter(900), LowpassFilter(9000)],
              "air_vib": [HighpassFilter(900), LowpassFilter(9000)],
              "spic_vc": [HighpassFilter(80), LowpassFilter(3500)], "spic_vla": [HighpassFilter(80), LowpassFilter(3500)],
              "celesta": [HighpassFilter(500), LowpassFilter(9000)], "accent": [HighpassFilter(28)]}
    stems = {k: fx(t.buf, chains[k]) * db2a(GAINS[k]) for k, t in tracks.items()}
    dry = sum(stems.values())
    wet = reverb_send(sum(stems[k] * SENDS[k] for k in stems), room=0.78, damp=0.45, post_lp=6500)
    pts = [((loop_end if b == "END" else bt(starts[b - 1] + beat)), db) for (b, beat, db) in meta["level_arc_bar_beat_db"]]
    pts.append((loop_end + TAIL, pts[-1][1]))
    arc = automation(n, pts)
    mix = voice_carve((dry + wet * 0.6)[:n] * arc[:, None])
    y = loop_wrap(mix, T=loop_end)
    y = circular_process(y, [Compressor(threshold_db=-22, ratio=1.6, attack_ms=30, release_ms=250),
                             Limiter(threshold_db=-3.0, release_ms=150)])
    y = y * db2a(target_lufs - lufs(y))
    tp = true_peak_db(y)
    if tp > -2.0:
        y = y * db2a(-2.0 - tp)
    save(out, y)
    if abs(loop_end - VIDEO_DUR) > 0.02:
        print(f"NOTE: the MIDI loop ends at {loop_end:.3f} s but VIDEO_DUR is {VIDEO_DUR:.3f} s: "
              f"set SOUND_VIDEO_DUR={loop_end:.3f} for the mix", file=sys.stderr)
    tempos = pm.get_tempo_changes()[1]
    print(f"rendered {out} from {Path(midi_path).name}: {len(y) / SR:.3f} s, {lufs(y):.2f} LUFS, TP {true_peak_db(y):.2f} "
          f"dBTP, tempo {tempos.min():.1f}-{tempos.max():.1f} BPM")
    return y


if __name__ == "__main__":
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--midi", default=str(MIDI_PATH))
    ap.add_argument("--out", default=str(AUDIO / "music_cinematic.wav"))
    ap.add_argument("--compose-only", action="store_true")
    ap.add_argument("--render-only", action="store_true")
    a = ap.parse_args()
    if not a.render_only:
        compose()
    if not a.compose_only:
        render(a.midi, Path(a.out))
