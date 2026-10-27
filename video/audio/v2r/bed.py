#!/usr/bin/env python3
"""Video 2 ("One Small Window") bed "Towpath": composed NEW for this cut -> public/v2r/music_bed.wav (48 kHz stereo,
2345 frames = 39.0833 s, circular) + audio/v2r/music_bed.mid (every note on the film's beat grid).

    python3 audio/v2r/field.py          # once: fetch + verify the CC0 field recordings the air is composed from
    python3 audio/v2r/bed.py            # compose + render + pre-duck + carve + measure (~2-3 min)

THE IDEA. One small window: her motif is a rising fourth on a felt upright piano (C -> F), the same interval as the
film's exit ding at 0.45 s, so the first sound she makes going out is the tune she comes home to. F major, its
relative D minor for the staff's fear, B-flat lydian for the vast. Real CC0 instruments (VSCO 2 CE, VCSL) played by
this script: felt piano, string pizzicato, low strings (contrabass + cello), pp violins and bowed vibraphone for air.

THE ARC (TREATMENT s7, on heard times):
  0.00-6.28   NO music: the canal's air only (water laps, a far city, the life on screen); 4.54-4.79 the air dips
  6.28        two dry violin pizzicato notes, C5 -> F5 (the ding's fourth): false relief on "You'd think..."
  8.44-12.81  "But": the pulse steadies, D minor (A4/D5 ostinato over a moving pizz bass + its cello octave), thins to
              quarters on "scared", the last note decays out by 12.81 (silence 12.81-13.16)
  13.16       air (pp violins C6 + bowed vibes A5) and ONE high piano C6 on "she" (13.96): the question, un-ducked
  15.07-17.96 her walk: the motif (C6 F6 E6 C6) over a walking pizz bass (F E D C Bb) in tenths; the walk stops
              with her on "objected" (17.96)
  18.92       "military": a low D minor sustain, weight without drama; it lets go on "heading"
  20.55-21.30 April morning air (bowed vibes, B-flat maj7 colours); 21.30 low strings open with the crane and swell
  22.43       soft accent 1 on the landing ("Pentagon"): B-flat lydian bloom, lows and highs only, a felt low bloom
  24.00-27.82 the pulse, level and thinned under the clause (C5/F5 fourths, pizz bass Bb A G C + its cello octave)
  28.31-32.70 the SAME pulse, instruments, harmony, humanize and level for Google's side (no minor turn, no sting)
  33.16-36.18 the motif alone, quieter (C5 F5 E5 C5); held breath 36.18-36.54
  37.18       soft accent 2: E5 -> F5, it resolves on "facts" (F add9: piano high, strings low, vibes, low bloom)
  38.82-      a circular tail: the chord thins into the hook's air (gone by ~0.5 s into the loop)

OUT OF THE VOICE'S WAY. The male narrator (f0 ~120 Hz) owns ~120 Hz-4 kHz. Sustained notes live below ~110 Hz or
above ~800 Hz; the only mid-register notes are short pizzicati and a few soft piano notes; a static carve (-4 dB
around 2.2 kHz). Then the bed is PRE-DUCKED against the locked voice (public/v2/voice.wav): -8 dB on the music with a
500 ms hold (a pause under 0.6 s never lets the music swell: no pumping), the music level set so its median sits ~27 dB
under the speaking voice, a guard on the whole bed so it stays >= 12 dB under every word, and on every hit word
(sheet.HIT_WORDS) a band carve so the bed sits >= 12 dB under the voice's own 1-4 and 4-10 kHz there.
Play music_bed.wav at gain 1 (cues.json), no further ducking.

ON A PHONE (review item 4): every pizz bass note has its cello octave, the low strings are lightly saturated (their
harmonics carry the arc through a 350 Hz speaker), and the air sits 4 dB lower wherever music plays.

THE AIR (review item 6) is composed from CC0 field-recording grains (field.py): hollow laps under a boardwalk and on a
wooden hull, a far city from a rooftop, a parkway, robins, a wren, a cardinal, spring birds, a gull, rustling leaves, a
fountain, a narrowboat engine, a bus, a bicycle, ducks, a dog's collar; every grain placed by this script (sheet.LIFE
sounds the life on screen). The leaves' and grains' spectra overlap: no band crossover cliffs.
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from dsp import (SR, ROOT, PUBLIC, VOICE, SCRATCH, N_FILM, FILM_DUR, np, ss, bp, lp, hp, env_ad, env_bell, place,  # noqa
                 pan, st, noise, rng, n_of, tt, circ_noise, smooth_rand, chirp, db2a, a2db, save, load, lufs,
                 true_peak_db, short_term_lufs, click_report, body_noise, contact)
import sheet  # noqa: E402
import field as FLD  # noqa: E402
import instruments as I  # noqa: E402  (audio/tools: the CC0 sample players)
from sampler import Track  # noqa: E402
from bedkit import fx, reverb_send, voice_carve  # noqa: E402
from pedalboard import HighpassFilter, LowpassFilter, HighShelfFilter, LowShelfFilter, PeakFilter, Compressor  # noqa
import pretty_midi  # noqa: E402

import mix as HM  # noqa: E402  (audio/mix.py: speech envelope, circular smoothing, margin guard)

MIDI_OUT = Path(__file__).resolve().parent / "music_bed.mid"
BED_OUT = PUBLIC / "music_bed.wav"
TAIL = 5.0
NT = N_FILM + n_of(TAIL)

# ---------------------------------------------------------------- the beat grid (voice seconds)
# (start, end, beats). The pulse runs ~92 BPM (84-100) wherever it plays; the silences are rubato. Every anchor is a
# heard time: 6.28 "You'd", 8.44 "But", 12.81 "contracts." ends, 15.07 "She worked", 18.92 "military", 22.43
# "Pentagon", 24.00 the cut into the clause, 27.82 / 28.31 the side switch, 32.70 "kind." ends, 33.16 "She says",
# 37.18 "facts". 17.96 ("objected") falls on the walk's half beat (15.07 + 4.5 beats).
SEG = [(0.00, 6.28, 10), (6.28, 8.44, 3), (8.44, 12.81, 7), (12.81, 15.07, 3), (15.07, 18.92, 6),
       (18.92, 22.43, 5), (22.43, 24.00, 2), (24.00, 27.82, 6), (27.82, 28.31, 1), (28.31, 32.70, 7),
       (32.70, 33.16, 1), (33.16, 37.18, 6), (37.18, FILM_DUR, 3)]


def beat(seg, k):
    a, b, n = SEG[seg]
    return a + k * (b - a) / n


def blen(seg):
    a, b, n = SEG[seg]
    return (b - a) / n


# ---------------------------------------------------------------- the score
# track -> (instrument, pan, group): group = how it is pre-ducked (DUCK)
TRACKS = {"pizz": ("vln_pizz", 0.18, "mid"), "inner": ("vla_pizz", -0.2, "mid"), "bass": ("cb_pizz", -0.05, "low"),
          "bass8": ("vc_pizz", -0.1, "mid"), "motif": ("piano", 0.1, "mid"), "air_vln": ("vln_sus", -0.3, "air"),
          "air_vib": ("vibes_bowed", 0.3, "air"), "low_cb": ("cb_sus", 0.0, "low"), "low_vc": ("vc_sus", -0.15, "low")}
PROGRAMS = {"pizz": 45, "inner": 45, "bass": 45, "bass8": 45, "motif": 0, "air_vln": 48, "air_vib": 11, "low_cb": 43,
            "low_vc": 42, "bloom": 38}
GAINS = {"pizz": -2.0, "inner": -6.0, "bass": 1.0, "bass8": -6.0, "motif": 10.0, "air_vln": -8.0, "air_vib": -7.0,
         "low_cb": 0.0, "low_vc": -5.0, "bloom": -40.0}
SENDS = {"pizz": 0.30, "inner": 0.30, "bass": 0.15, "bass8": 0.2, "motif": 0.50, "air_vln": 0.8, "air_vib": 0.8,
         "low_cb": 0.2, "low_vc": 0.3, "bloom": 0.1}
SATURATE = {"bass": 2.6, "low_cb": 3.4, "low_vc": 3.4, "bass8": 1.8}     # review item 4: harmonics a phone can play
PMAX = 42      # the felt piano stays in its soft velocity layer

# ONE seeded humanize, applied IDENTICALLY to the clause's pulse and Google's (review item 9; A5: the same pulse):
# note k of either pulse gets the same timing offset (s) and velocity offset.
_H = rng(9024)
HUMANIZE = [(float(np.clip(_H.normal(0, 0.006), -0.012, 0.012)), int(np.clip(round(_H.normal(0, 2.2)), -4, 4)))
            for _ in range(32)]


def compose(seed=2610):
    r = rng(seed)
    notes = []          # (track, t, dur, pitch, vel)

    def N(track, t, pitch, vel, dur, human=True):
        dt = r.normal(0, 0.004) if human else 0.0
        v = int(np.clip(vel + (r.normal(0, 2) if human else 0), 1, PMAX if track == "motif" else 63))
        notes.append((track, max(0.0, t + dt), dur, int(pitch), v))

    # 6.28 false relief: two dry pizz notes, the ding's rising fourth
    N("pizz", 6.28, 72, 50, 0.3); N("pizz", 6.28 + 0.33, 77, 46, 0.3)

    # 8.44-12.81 the staff pulse: D minor, A4/D5 ostinato over D Bb G A (+ the cello octave); quarters from "scared"
    s = 2; e = blen(s) / 2
    for k in range(14):
        t = beat(s, k / 2)
        thin = k >= 6
        if thin and k % 2 == 1:
            continue
        pitch = 69 if k % 2 == 0 else 74
        vel = (50 if k % 2 == 0 else 44) if not thin else (44 if k < 12 else 38)
        N("pizz", t, pitch, vel, e)
        if k in (1, 5):
            N("inner", t, 65, 40, e)
    for k, p in ((0, 38), (4, 34), (8, 31), (12, 33)):
        N("bass", beat(s, k / 2), p, 58 if k < 12 else 46, 2 * e)
        N("bass8", beat(s, k / 2), p + 12, 40 if k < 12 else 34, 2 * e)

    # 13.16 the question: air + one high piano note on "she" 13.96 (un-ducked in DUCK_WINDOWS)
    N("air_vln", 13.16, 84, 36, 2.4, False); N("air_vib", 13.22, 81, 46, 2.2, False)
    N("motif", 13.96, 84, 40, 1.2, False)

    # 15.07-17.96 her walk: walking pizz bass F E D C Bb, upper tenths A G F E D (an octave up), the motif
    s = 4
    for k, (pb, pu) in enumerate([(41, 81), (40, 79), (38, 77), (36, 76), (34, 74)]):
        N("bass", beat(s, k), pb, 50, blen(s) * 0.6)
        N("bass8", beat(s, k), pb + 12, 38, blen(s) * 0.5)
        N("pizz", beat(s, k + 0.5), pu, 36 if k < 4 else 32, blen(s) * 0.5)
    for (k, p, d, v) in ((0.5, 84, 0.6, 41), (1.0, 89, 1.0, 42), (2.0, 88, 0.5, 34), (2.5, 84, 1.6, 33)):
        N("motif", beat(s, k), p, v, d * blen(s))

    # 18.92 "military": a low D minor sustain (contrabass D2; cellos D3 F3 A3: a phone hears the cellos), let go on
    # "heading" 19.80
    N("low_cb", 18.92, 38, 46, 1.15, False)
    N("low_vc", 18.95, 50, 40, 1.1, False); N("low_vc", 18.97, 53, 38, 1.05, False); N("low_vc", 18.99, 57, 32, 1.0, False)

    # S5: April air from 20.60 (B-flat maj7 colours: D6, A5), 21.30 low strings open (Bb1 + F2) and swell,
    # 22.43 accent 1: lydian bloom (vibes C6 + E6, violins D6), the felt low bloom (added in render)
    N("air_vib", 20.60, 86, 36, 3.6, False); N("air_vib", 20.66, 81, 34, 3.5, False)
    N("low_cb", 21.30, 34, 44, 3.0, False); N("low_vc", 21.32, 41, 38, 2.9, False)
    N("air_vln", 21.30, 86, 30, 2.9, False)
    N("air_vib", 22.43, 84, 42, 1.9, False); N("air_vib", 22.45, 88, 38, 1.8, False)

    # 24.00-27.82 and 28.31-32.70: THE SAME level pulse (C5/F5 fourths, pizz bass Bb A G C + its cello octave),
    # humanized by the ONE shared table (note k of both pulses moves the same way)
    for s, nb in ((7, 6), (9, 7)):
        e = blen(s) / 2
        for k in range(2 * nb):
            dt, dv = HUMANIZE[k]
            N("pizz", beat(s, k / 2) + dt, 72 if k % 2 == 0 else 77, (30 if k % 2 == 0 else 27) + dv, e, human=False)
        for j, (k, p) in enumerate(((0, 34), (4, 33), (8, 31), (10, 36)) + (((12, 36),) if nb == 7 else ())):
            dt, dv = HUMANIZE[16 + j]
            N("bass", beat(s, k / 2) + dt, p, 44 + dv, 2 * e, human=False)
            N("bass8", beat(s, k / 2) + dt, p + 12, 34 + dv, 2 * e, human=False)

    # 33.16-36.18 the motif alone, quieter: C5 F5 E5 C5 (released before the held breath at 36.18)
    s = 11
    for (k, p, d, v) in ((0, 72, 1.4, 24), (1.5, 77, 1.0, 24), (2.5, 76, 0.5, 22), (3.0, 72, 1.5, 22)):
        N("motif", beat(s, k), p, v, d * blen(s))
    # 36.51 the pickup E5, 37.18 accent 2: it resolves on "facts" (F5 + C6 high; F1 + C2 low; vibes A5 + G5; air C6)
    N("motif", 36.51, 76, 24, 0.6, False)
    N("motif", 37.18, 77, 34, 1.7, False); N("motif", 37.19, 84, 30, 1.6, False)
    N("low_cb", 37.18, 29, 40, 1.75, False); N("low_vc", 37.20, 36, 34, 1.7, False)
    N("air_vib", 37.18, 81, 38, 1.9, False); N("air_vib", 37.22, 79, 34, 1.85, False)
    N("air_vln", 37.25, 84, 28, 1.7, False)
    return notes


BLOOMS = [(22.43, 58.27, 1.0), (37.18, 43.65, 0.9)]      # (t, Hz, gain): Bb1, F1: felt, never a boom


# ---------------------------------------------------------------- MIDI (the film's beat grid as a tempo map)
def write_midi(notes, path=MIDI_OUT, ppq=960):
    pm = pretty_midi.PrettyMIDI(resolution=ppq, initial_tempo=120.0)
    scales, tick = [], 0
    for (a, b, n) in SEG:
        spb = (b - a) / n
        scales.append((tick, spb / ppq))
        tick += n * ppq
    pm._tick_scales = scales
    pm._update_tick_to_time(tick + ppq)
    for name in list(TRACKS) + ["bloom"]:
        ins = pretty_midi.Instrument(program=PROGRAMS[name], name=name)
        for (tr, t, d, p, v) in notes:
            if tr == name:
                ins.notes.append(pretty_midi.Note(velocity=v, pitch=p, start=t, end=t + max(d, 0.05)))
        if name == "bloom":
            for (t, f, g) in BLOOMS:
                ins.notes.append(pretty_midi.Note(velocity=int(80 * g), pitch=int(round(69 + 12 * np.log2(f / 440))),
                                                  start=t, end=t + 0.9))
        pm.instruments.append(ins)
    pm.time_signature_changes = [pretty_midi.TimeSignature(4, 4, 0.0)]
    pm.write(str(path))
    beats = pm.get_beats()
    return pm, beats


# ---------------------------------------------------------------- the world's air (CC0 grains, circular)
LONDON = [(0.00, 20.55), (28.06, FILM_DUR)]
ARL = [(20.55, 28.06)]


def place_c(y, g, t, gain=1.0, p=None):
    """add a grain (mono -> panned, or stereo) at t, wrapping round the film (the air is circular)."""
    s = pan(g, p if p is not None else 0.0) if g.ndim == 1 else g
    n = len(y); i = n_of(t) % n
    k = min(len(s), n - i)
    y[i:i + k] += s[:k] * gain
    if k < len(s):
        y[: len(s) - k] += s[k:] * gain
    return y


def unit_rms(g, win=0.05):
    """scale a grain so its loudest 50 ms sits at RMS 1 (every grain's gain then means the same thing)."""
    m = st(g).mean(axis=1); w = n_of(win)
    e = np.sqrt(np.convolve(m ** 2, np.ones(w) / w, "same").max() + 1e-20)
    return g / e


def gain_curve(points, n=N_FILM, ramp=0.06):
    """step levels (dB) per span with short ramps at the edges; circular (the value at the end = at 0)."""
    t = np.arange(n) / SR
    out = np.full(n, -120.0)
    for (a, b, db) in points:
        a = -1.0 if a <= 0 else a
        b = n / SR + 1.0 if b >= n / SR - 1e-6 else b
        m = (t >= a - ramp / 2) & (t < b + ramp / 2)
        w = np.clip(np.minimum((t - (a - ramp / 2)) / ramp, ((b + ramp / 2) - t) / ramp), 0, 1)
        lin = np.where(m, w * db2a(db), 0)
        out = np.maximum(out, 20 * np.log10(np.maximum(lin, 1e-6)))
    return db2a(out)


# water laps: (source, band for detection, rise dB, span, weight)
LAP_SOURCES = [(758858, (100, 3000), 8, (0.0, 70.0), 0.62), (480838, (150, 3000), 8, (15.8, 22.3), 0.22),
               (318064, (150, 3000), 8, None, 0.16)]
# laps per second by scene (the canal under our steps, the wall's towpath, her terrace, our boat, the forecourt, the
# lane); none in Arlington
LAP_RATE = [(0.00, 6.10, 2.4), (6.10, 12.98, 1.7), (12.98, 14.86, 1.9), (14.86, 20.55, 2.0), (28.06, 32.93, 1.1),
            (32.93, FILM_DUR, 1.2)]
QUIET = [(4.48, 4.86), (36.16, 36.56)]        # the "..." stop and the held breath: the water holds too

# birds: (film t, source, grain a, b, dB, pan, lowpass Hz, why). London robins / a wren / London birds; Arlington
# cardinal, American robin (one channel: its stereo is phasey), spring birds far, a gull. Mostly in the voice's pauses.
BIRDS = [
    (1.50, 409145, 6.92, 7.17, -6, -0.5, 9000, "the bridge birds' calls as they lift (with the wings SFX)"),
    (1.74, 409145, 7.42, 7.79, -8, -0.35, 9000, ""),
    (8.10, 418425, 12.59, 12.95, -3, 0.6, 9000, "a robin in the pause before 'But'"),
    (14.66, 418425, 13.11, 13.50, -4, -0.6, 9000, "her terrace: a robin on the aerials (the pause after 'talking?')"),
    (15.30, 409145, 14.60, 15.30, -11, 0.7, 7000, "far, under 'worked on'"),
    (20.12, 418425, 17.12, 17.52, -6, 0.5, 9000, "the last robin before the match-cut (pause 20.10-20.67)"),
    (20.58, (616969, 0), 0.01, 0.62, -12, -0.4, 8000, "April morning: an American robin under the canopy"),
    (22.95, 626652, 7.13, 9.15, -6, 0.5, 8000, "spring birds far below the terrace (the view)"),
    (25.62, 147594, 5.23, 5.77, -3, 0.6, 9000, "a cardinal's 'cheer' in the pause after 'purpose.'"),
    (26.70, (616969, 0), 4.13, 4.76, -15, -0.6, 7000, "far, by the gate"),
    (28.90, 409145, 19.04, 19.60, -11, -0.6, 7000, "the forecourt's plane trees, far"),
    (35.02, 418425, 6.07, 6.48, -4, -0.7, 9000, "a robin on the sunset lane (the pause 34.99-35.45)"),
]


def bird_grain(src, a, b, lp_hz, ch=None):
    x = FLD.load(src)
    g = FLD.cut(x, a, b, 0.02)
    g = g[:, ch] if ch is not None else g.mean(axis=1)
    g = hp(g, 1400, 2)
    g = lp(g, lp_hz, 2)
    return unit_rms(g)


def lap_pool():
    pool = []
    for (src, band, rise, span, w) in LAP_SOURCES:
        x = FLD.load(src)
        ev = FLD.events(x, band[0], band[1], rise_db=rise, min_gap=0.3, post=0.9, span=span)
        ev = [(a, b) for (a, b, pk) in ev if b - a >= 0.12]
        pool.append((src, ev, w))
    return pool


def water_laps(n, seed=513):
    """the canal: laps scattered at the scene's rate, from three sources (hollow under-boardwalk gulps, plops on a
    wooden hull, lighter laps on stones); each lap its own level, distance (low-pass) and place across the water."""
    r = rng(seed); y = np.zeros((n, 2)); T = n / SR
    pool = lap_pool(); ws = np.array([w for (_, _, w) in pool]); ws /= ws.sum()
    t = 0.0
    while t < T:
        rate = next((rt for (a, b, rt) in LAP_RATE if a <= t < b), 0.0)
        if rate <= 0:
            t += 0.05; continue
        t += r.exponential(1.0 / rate) * (0.4 if r.random() < 0.18 else 1.0)       # some laps come in pairs
        if t >= T or any(a <= t <= b for (a, b) in QUIET):
            continue
        k = r.choice(len(pool), p=ws); src, ev, _ = pool[k]
        a, b = ev[r.integers(len(ev))]
        x = FLD.load(src)
        g = FLD.cut(x, a, min(b, a + 0.9), 0.012).mean(axis=1)
        g = lp(hp(g, 90, 2), r.uniform(2200, 5500), 2)
        g = unit_rms(g) * db2a(r.uniform(-9, 0))
        place_c(y, g, t, 1.0, float(r.uniform(-0.8, 0.8)))
    return y


def loop_bed(src, a, lo, hi, n=N_FILM):
    x = FLD.load(src)
    dur = min(FILM_DUR, len(x) / SR - a - 1.2)
    y = FLD.loop_excerpt(x, a, dur, n, xfade=1.0)
    return lp(hp(y, lo, 2), hi, 2)


def segment(src, a, b, t, n=N_FILM, fade=0.15):
    """a stretch of a recording placed at film time t (stereo), with fades."""
    y = np.zeros((n, 2))
    g = FLD.cut(FLD.load(src), a, b, fade)
    return place_c(y, g, t)


def paws(t0, n_steps, rate, seed, level=1.0):
    """a dog's paws on stone: soft padded taps at a trot (a padded body and a claw tick, never a sine)."""
    r = rng(seed); out = np.zeros(n_of(n_steps / rate + 0.3))
    for k in range(n_steps):
        d = 0.06
        p = 0.8 * body_noise([180 * r.uniform(0.9, 1.1), 420], [0.012, 0.006], [1, .4], d, seed + k, q=4.0)
        p = p / (np.abs(p).max() + 1e-12)
        c = contact(0.01, 2500, 9000, 0.0008, seed + 50 + k)
        p[: len(c)] += 0.25 * c / (np.abs(c).max() + 1e-12)
        place(out, p, k / rate + r.normal(0, 0.008), r.uniform(0.6, 1.0) * level)
    return out


def train_far(dur=4.2, seed=5150):
    """a train on the far viaduct: a low rumble that swells and fades, the wheel-joint pairs (da-dum) very soft."""
    n = n_of(dur); t = tt(dur); r = rng(seed)
    y = lp(r.standard_normal(n), 520, 2) * env_bell(n, 0.5, 1.2)
    for k in range(int(dur / 0.95)):
        for j, dt in enumerate((0.0, 0.11)):
            c = body_noise([95, 210], [0.03, 0.015], [1, .5], 0.12, seed + 10 * k + j, q=3.0)
            place(y, 0.5 * c / (np.abs(c).max() + 1e-12) * env_bell(n, 0.5, 1.2)[min(n - 1, n_of(k * 0.95))],
                  k * 0.95 + dt + 0.2)
    return lp(y, 700, 2)


def life_layer(n):
    """sheet.LIFE: the life already on screen, each from its own grains (levels relative to the water laps)."""
    y = np.zeros((n, 2)); rep = []
    for (t, kind, p, note) in sheet.LIFE:
        if kind == "bike":            # a far cyclist entering from the right: tyre whirr, then a few freewheel ticks
            g = FLD.cut(FLD.load(276001), 1.0, 4.6, 0.3).mean(axis=1)
            g = lp(hp(g, 150, 2), 2600, 2)
            place_c(y, unit_rms(g) * db2a(-14), t, 1.0, p)
            tk = FLD.cut(FLD.load(156996), 1.94, 2.62, 0.02).mean(axis=1)
            place_c(y, unit_rms(lp(tk, 7000, 2)) * db2a(-20), 1.52, 1.0, p - 0.3)
        elif kind == "bus":            # far, on the road bridge in the west gap: a low diesel swell going left
            g = FLD.cut(FLD.load(138247), 7.6, 13.4, 0.6).mean(axis=1)
            g = lp(hp(g, 60, 2), 1300, 2)
            place_c(y, unit_rms(g) * db2a(-12), t, 1.0, p)
        elif kind == "duck_land":      # a mallard comes down on the canal: wings and water
            g = FLD.cut(FLD.load(263104), 60.95, 62.15, 0.04).mean(axis=1)
            place_c(y, unit_rms(lp(hp(g, 150, 2), 6000, 2)) * db2a(-10), t, 1.0, p)
        elif kind == "dog":            # trotting: the collar's jingle and the paws on stone
            j = FLD.cut(FLD.load(611827), 2.08 if t < 5 else 6.10, 2.72 if t < 5 else 6.70, 0.03).mean(axis=1)
            place_c(y, unit_rms(lp(hp(j, 1800, 2), 7000, 2)) * db2a(-20 if t < 5 else -22), t + 0.05, 1.0, p)
            place_c(y, unit_rms(paws(t, 6, 4.2, int(t * 100))) * db2a(-13 if t < 5 else -17), t, 1.0, p)
        elif kind == "boat_pass":      # S2: a narrowboat comes up the canal from the vanishing point
            d = 5.9; g = FLD.cut(FLD.load(576577), 3.0, 3.0 + d, 0.8).mean(axis=1)
            k_ = np.linspace(0, 1, len(g))
            g = lp(hp(g, 70, 2), 900, 2) * (0.35 + 0.65 * k_) + lp(hp(g, 900, 2), 1800, 2) * 0.35 * k_ ** 2
            place_c(y, unit_rms(g) * db2a(-11), t, 1.0, p)
        elif kind == "boat_ride":      # S4: our narrowboat's engine at idle-ahead beside us, its bow wash
            d = 20.55 - t + 0.3; g = FLD.cut(FLD.load(576577), 14.0, 14.0 + d, 0.25).mean(axis=1)
            g = lp(hp(g, 75, 2), 1500, 2)
            place_c(y, unit_rms(g) * db2a(-19), t - 0.15, 1.0, 0.05)
            w = FLD.cut(FLD.load(318064), 30.0, 30.0 + d, 0.25)
            place_c(y, unit_rms(lp(hp(w, 200, 2), 3200, 2)) * db2a(-19), t - 0.15)
        elif kind == "train":
            place_c(y, unit_rms(train_far()) * db2a(-17), t, 1.0, p)
        elif kind == "gulls":
            g = FLD.cut(FLD.load(73497), 0.02, 1.38, 0.03).mean(axis=1)
            g = lp(hp(g, 500, 2), 3200, 2)
            g = g + 0.25 * np.convolve(g, np.exp(-tt(0.4) / 0.12) * rng(77).standard_normal(n_of(0.4)) * 0.02)[: len(g)]
            place_c(y, unit_rms(g) * db2a(-16), t, 1.0, p)
        elif kind == "fountain":      # S7: the forecourt fountain jets, the whole shot
            d = 32.93 - 28.06 + 0.2; g = FLD.cut(FLD.load(415027), 5.0, 5.0 + d, 0.12)
            place_c(y, unit_rms(lp(hp(g, 220, 2), 8000, 2)) * db2a(-14), t - 0.1)
        elif kind == "pigeons":
            continue                   # the first second belongs to the flood and the ding
        rep.append((t, kind))
    return y, rep


# the air's layers (review item 6): each normalised to its own level (integrated LUFS over where it plays, dB
# relative to the laps), then shaped by its scene curve. The laps are the canal's events and sit well above the far
# city's floor; the birds and the life are events too; the beds are a floor, never a hiss.
AIR_LEVEL = {"laps": 0.0, "city": -8.0, "parkway": -5.0, "water_bed": -13.0, "leaves": -14.0, "birds": -1.0,
             "life": -2.0}


def level_to(x, curve, target):
    """scale x so its integrated loudness where `curve` is on (>= -20 dB) is `target` LUFS."""
    m = curve > db2a(-20.0)
    if m.sum() < SR:
        return x
    L = lufs(x[m])
    return x * db2a(target - L) if np.isfinite(L) else x


def world_air():
    """The canal (S1-S4, S7-S8) and the April morning in Arlington (S5-S6), as one circular stereo track composed from
    CC0 grains. Returns (air, {layer: stereo}, the life sounded) at relative levels (the global level is set against
    the voice in main)."""
    n = N_FILM
    gust = smooth_rand(n, 0.22, 509, 0.15, 1.0)
    birds = np.zeros((n, 2))
    for (t, src, a, bb, gdb, p, lph, why) in BIRDS:
        ch = None
        if isinstance(src, tuple):
            src, ch = src
        place_c(birds, bird_grain(src, a, bb, lph, ch) * db2a(gdb), t, 1.0, p)
    life, rep = life_layer(n)
    L = {"city": (loop_bed(426894, 46.0, 45, 9000),
                  [(0.00, 12.98, 0), (12.98, 14.86, -3), (14.86, 20.55, -2), (28.06, 32.93, -1), (32.93, FILM_DUR, -3)]),
         "parkway": (loop_bed(208502, 34.0, 55, 7000), [(20.55, 28.06, 0)]),
         "water_bed": (lp(loop_bed(318064, 18.0, 150, 2600), 2600, 2),
                       [(0.00, 14.86, 0), (14.86, 20.55, 0), (28.06, 32.93, -6), (32.93, FILM_DUR, -1)]),
         "leaves": (loop_bed(347557, 0.0, 1500, 8000) * gust[:, None] ** 1.5,
                    [(0.00, 20.55, 0), (20.55, 28.06, 0), (28.06, FILM_DUR, -1)]),
         "laps": (water_laps(n), [(0.00, 20.55, 0), (28.06, FILM_DUR, 0)]),
         "birds": (birds, [(0.00, FILM_DUR, 0)]),
         "life": (life, [(0.00, FILM_DUR, 0)])}
    REF = -30.0
    layers = {}
    y = np.zeros((n, 2))
    for k, (x, pts) in L.items():
        c = gain_curve(pts)
        layers[k] = level_to(x, c, REF + AIR_LEVEL[k]) * c[:, None]
        y += layers[k]
    # the "..." (4.54-4.79): the air dips 12 dB (down in 40 ms, back over 150 ms); the picture's life goes on
    t = np.arange(n) / SR
    dip = db2a(np.interp(t, [0, 4.50, 4.54, 4.79, 4.94, FILM_DUR], [0, 0, -12, -12, 0, 0]))
    # wherever music plays the air steps back 4 dB (review item 4); the hook and the seam keep the full air
    mus = db2a(np.interp(t, [0, 6.05, 6.35, 38.55, 39.0, FILM_DUR], [0, 0, -4, -4, 0, 0]))
    y *= (dip * mus)[:, None]
    for k in layers:
        layers[k] = layers[k] * (dip * mus)[:, None]
    return y, layers, rep


# ---------------------------------------------------------------- render
def bloom(f, dur=1.6):
    """the felt low bloom under an accent: a soft sine + octave, 40 ms attack, ~0.6 s decay. Never a boom."""
    t = tt(dur)
    y = (np.sin(2 * np.pi * f * t) + 0.35 * np.sin(2 * np.pi * 2 * f * t + 0.3)) * env_ad(len(t), 0.04, 0.55)
    return st(y)


def saturate(x, drive, bias=0.18, mix=0.6):
    """light tube-like saturation (review item 4): an asymmetric tanh on the stem normalised to its peak (even and odd
    harmonics, so a phone speaker hears the low strings' notes), blended with the clean stem at the same level."""
    pk = np.abs(x).max() + 1e-12
    z = x / pk
    y = np.tanh(drive * (z + bias)) - np.tanh(drive * bias)
    y = hp(y, 30, 2)
    y *= np.sqrt(np.mean(z ** 2) / (np.mean(y ** 2) + 1e-20))
    return pk * ((1 - mix) * z + mix * y)


def render(notes):
    tracks = {k: Track(FILM_DUR + TAIL, pan=TRACKS[k][1]) for k in TRACKS}
    tracks["bloom"] = Track(FILM_DUR + TAIL, pan=0.0)
    insts = {k: I.get(v[0]) for k, v in TRACKS.items()}
    for (tr, t, d, p, v) in notes:
        tracks[tr].add(insts[tr].render(p, v, d), t)
    for (t, f, g) in BLOOMS:
        tracks["bloom"].add(bloom(f) * g, t)
    felt = [HighpassFilter(90), LowpassFilter(4200), HighShelfFilter(2500, -3, 0.7), LowShelfFilter(250, -3)]
    chains = {"pizz": [HighpassFilter(260), LowpassFilter(6000), PeakFilter(2200, -2, 0.8)],
              "inner": [HighpassFilter(200), LowpassFilter(3500)],
              "bass": [HighpassFilter(32), LowpassFilter(1400), PeakFilter(160, -3, 1.0)],
              "bass8": [HighpassFilter(70), LowpassFilter(1800), PeakFilter(250, -3, 1.0)],
              "motif": felt + [Compressor(-34, 2.5, 5, 200)],
              "air_vln": [HighpassFilter(1000), LowpassFilter(9000)],
              "air_vib": [HighpassFilter(700), LowpassFilter(9500)],
              "low_cb": [HighpassFilter(30), LowpassFilter(900)],
              "low_vc": [HighpassFilter(45), LowpassFilter(1000), PeakFilter(240, -3, 1.0)],
              "bloom": [HighpassFilter(28), LowpassFilter(240)]}
    stems = {}
    for k, tr in tracks.items():
        x = tr.buf[:NT]
        if k in SATURATE and np.abs(x).max() > 0:
            x = saturate(x, SATURATE[k])
        stems[k] = fx(x, chains[k]) * db2a(GAINS.get(k, 0.0))
    # a soft swell for the crane (21.30 -> 22.43), the hold after it, and the tail's fade into the hook
    t = np.arange(NT) / SR
    swell = db2a(np.interp(t, [0, 21.30, 22.43, 23.2, 24.0, NT / SR], [0, -10, 0, -2, -3, -3]))
    for k in ("low_cb", "low_vc", "air_vln"):
        stems[k] = stems[k] * np.where((t > 21.0) & (t < 24.6), swell, 1.0)[:, None]
    lift = db2a(np.interp(t, [0, 37.05, 37.25, NT / SR], [0, 0, 4.0, 4.0]))       # "facts": the resolution, a touch up
    for k in ("motif", "low_cb", "low_vc", "air_vib", "air_vln", "bloom"):
        stems[k] = stems[k] * lift[:, None]
    tail = db2a(np.interp(t, [0, 38.70, FILM_DUR, FILM_DUR + 0.5, NT / SR], [0, 0, -8, -60, -90]))
    for k in stems:
        stems[k] = stems[k] * tail[:, None]
    wet = reverb_send(sum(stems[k] * SENDS[k] for k in stems), room=0.72, damp=0.5, post_lp=7000) * 0.55
    wet = wet * tail[:, None]
    groups = {"mid": np.zeros((NT, 2)), "low": np.zeros((NT, 2)), "air": np.zeros((NT, 2))}
    for k, x in stems.items():
        groups[TRACKS[k][2] if k in TRACKS else "low"] += x
    groups["mid"] += wet
    groups["mid"] = voice_carve(groups["mid"])
    groups["air"] = voice_carve(groups["air"], -3.0)
    return {g: wrap(x) for g, x in groups.items()}, {k: wrap(x) for k, x in stems.items()}


def wrap(y):
    out = y[:N_FILM].copy()
    rest = y[N_FILM:]
    out[: len(rest)] += rest
    return out


# ---------------------------------------------------------------- pre-duck against the locked voice
def voice_stereo():
    v = load(VOICE, mono=True)
    v = np.pad(v, (0, max(0, N_FILM - len(v))))[:N_FILM]
    return v, np.stack([v, v], 1)


# Review item 5: an 8 dB duck (it was 14) with a 500 ms hold, so a pause under 0.6 s never lets the music swell;
# the static level is trimmed so the median still sits ~27 dB under the voice. The two story swells (the crane under
# "...a deal letting the Pentagon use its AI for", and "facts" inside the payoff line) and the question (13.16-14.64,
# review item 4) duck less, so they are heard; the >= 12 dB guard still holds every word.
DUCK = {"mid": 8.0, "air": 8.0, "low": 5.0}
DUCK_WINDOWS = [(13.05, 15.10, {"mid": 1.0, "air": 1.0, "low": 0.0}),
                (21.20, 24.05, {"mid": 4.0, "air": 3.0, "low": 1.0}),
                (37.05, FILM_DUR, {"mid": 4.0, "air": 3.0, "low": 1.0})]
HOLD = 0.5


def held_activity(v):
    """the voice's activity (house speech envelope: 20 ms look-ahead, 200 ms hold) held a further HOLD seconds, so
    the duck never lets go in a pause shorter than ~0.6 s (circular)."""
    act, hop = HM.speech_envelope(v)
    k = int(HOLD * (SR / hop))
    held = act.copy()
    for j in range(1, k + 1):
        np.maximum(held, np.roll(act, j), out=held)
    return held, hop


def duck_curve(v, group, depth_db=None):
    act, hop = held_activity(v)
    tc = np.arange(len(act)) / (SR / hop)
    depth = np.full(len(act), DUCK[group] if depth_db is None else depth_db)
    if depth_db is None:
        for (a, b, d) in DUCK_WINDOWS:
            w = np.clip(np.minimum((tc - a) / 0.15, (b - tc) / 0.15), 0, 1)       # 150 ms ramps into the windows
            depth = depth * (1 - w) + d[group] * w
    env = HM.one_pole_db(-depth * act, 30.0, 250.0, SR / hop)
    return db2a(HM.ctrl_to_audio(env, hop, N_FILM))


def speech_frames(tv):
    sp = np.zeros(len(tv), bool)
    for (a, b) in sheet.VOICED:
        sp |= (tv >= a + 0.2) & (tv <= b - 0.2)
    return sp


def gap_stats(vs, x, hop=0.05, present=True):
    """voice minus x (momentary 400 ms loudness) over the frames where the voice speaks (and x plays)."""
    tv, lv = short_term_lufs(vs, win=0.4, hop=hop)
    _, lm = short_term_lufs(x, win=0.4, hop=hop)
    k = min(len(lv), len(lm))
    sp = speech_frames(tv[:k])
    if present:
        sp &= lm[:k] > -70.0
    d = (lv[:k] - lm[:k])[sp]
    return d, tv[:k][sp]


def guard(vs, x, min_gap=12.8, hop=0.05):
    """extra smoothed reduction (60 / 500 ms) wherever x would come within `min_gap` dB of the voice while it speaks
    (momentary 400 ms loudness, the VOICED spans): the voice stays on top at every word."""
    from scipy.ndimage import maximum_filter1d
    tv, lv = short_term_lufs(vs, win=0.4, hop=hop)
    _, lm = short_term_lufs(x, win=0.4, hop=hop)
    k = min(len(lv), len(lm)); tv, lv, lm = tv[:k], lv[:k], lm[:k]
    need = np.where(speech_frames(tv), np.maximum(0.0, min_gap - (lv - lm)), 0.0)
    need = maximum_filter1d(need, size=int(0.4 / hop), mode="wrap")
    env = HM.one_pole_db(-need, 60.0, 500.0, 1.0 / hop)
    return db2a(np.interp(np.arange(N_FILM) / SR, tv, env))


def guard_spans(gdb, thr=-1.0):
    """where the >= 12 dB guard had to pull the bed down (start, end, deepest dB)."""
    g = gdb[:: SR // 100]; on = g < thr; out = []; i = 0
    while i < len(on):
        if on[i]:
            j = i
            while j < len(on) and on[j]:
                j += 1
            out.append((round(i / 100, 2), round(j / 100, 2), round(float(g[i:j].min()), 1))); i = j
        else:
            i += 1
    return out


# ---------------------------------------------------------------- the hit-word band carve
CARVE_BANDS = {"1-4k": (1000.0, 4000.0), "4-10k": (4000.0, 10000.0)}
CARVE_MARGIN = 12.0       # the bed >= 12 dB under the voice's own band on a hit word (the SFX get the rest)
CARVE_MARGIN_OTHER = 9.0  # and >= 9 dB under it on every other word (the voice on top everywhere)


def band_power(x, band, win=0.03, hop=0.01):
    m = st(x).mean(axis=1)
    b = ss.sosfiltfilt(ss.butter(4, band, "bandpass", fs=SR, output="sos"), m)
    w, h = n_of(win), n_of(hop)
    c = np.concatenate([[0.0], np.cumsum(b ** 2)])
    idx = np.arange(0, max(1, len(b) - w), h)
    return (idx + w / 2) / SR, (c[idx + w] - c[idx]) / w


def carve_plan(v, bed):
    """per word and band: how many dB the bed must give (over the word's active frames) to sit CARVE_MARGIN (a hit
    word) or CARVE_MARGIN_OTHER (any other word) under the voice there. Returns [(t0, t1, band, dB, word)]."""
    plan = []
    hits = set(sheet.HIT_WORDS)
    for bn, band in CARVE_BANDS.items():
        tv, ev = band_power(v, band); _, eb = band_power(bed, band)
        lv = 10 * np.log10(ev + 1e-30)
        for x in sheet.WORDS:
            w, s = x["w"], x["s"]
            a, b = s - sheet.WORD_PAD, x["e"] + sheet.WORD_PAD
            m = (tv >= a) & (tv <= b)
            if not m.any():
                continue
            act = m & (lv >= lv[m].max() - 12.0) & (lv > -75.0)
            if not act.any():
                continue
            need = CARVE_MARGIN if (w, s) in hits else CARVE_MARGIN_OTHER
            margin = 10 * np.log10(ev[act].sum() / (eb[act].sum() + 1e-30))
            if margin < need:
                plan.append((a, b, bn, float(need - margin), w))
    return plan


def carve(xs, plan, nfft=2048, hop=256):
    """apply the plan to each stem in xs (same mask for all, so the stems still sum to the bed): STFT-domain gains,
    the band with half-octave skirts, the word's span with 40 ms ramps."""
    if not plan:
        return xs
    f = np.fft.rfftfreq(nfft, 1 / SR)
    nfr = 1 + (N_FILM + nfft) // hop
    tf = (np.arange(nfr) * hop) / SR
    G = np.zeros((len(f), nfr))
    lf = np.log2(np.maximum(f, 1.0))
    for (a, b, bn, d, _w) in plan:
        lo, hi = CARVE_BANDS[bn]
        wf = np.clip(np.minimum((lf - np.log2(lo)) / 0.5 + 1, (np.log2(hi) - lf) / 0.5 + 1), 0, 1)
        wt = np.clip(np.minimum((tf - (a - 0.04)) / 0.04, ((b + 0.04) - tf) / 0.04), 0, 1)
        G = np.minimum(G, -d * np.outer(wf, wt))
    gain = db2a(G)
    out = []
    for x in xs:
        y = np.zeros_like(x)
        for ch in range(2):
            _, _, Z = ss.stft(x[:, ch], SR, nperseg=nfft, noverlap=nfft - hop, boundary="even", padded=True)
            k = min(Z.shape[1], gain.shape[1])
            Z[:, :k] *= gain[:, :k]
            _, z = ss.istft(Z, SR, nperseg=nfft, noverlap=nfft - hop, boundary=True)
            y[:, ch] = z[: len(x)] if len(z) >= len(x) else np.pad(z, (0, len(x) - len(z)))
        out.append(y)
    return out


# ---------------------------------------------------------------- reports
def phone(x):
    """a phone speaker, roughly: 350 Hz high-pass 24 dB/oct, 12 kHz low-pass."""
    y = ss.sosfilt(ss.butter(4, 350, "highpass", fs=SR, output="sos"), x, axis=0)
    return ss.sosfilt(ss.butter(2, 12000, "lowpass", fs=SR, output="sos"), y, axis=0)


ARC = [("pizz 6.28-8.08", 6.28, 8.08), ("staff 8.44-12.81", 8.44, 12.81), ("question 13.16-14.64", 13.16, 14.64),
       ("walk 15.07-17.96", 15.07, 17.96), ("military 18.92-20.10", 18.92, 20.10), ("crane 21.30-22.43", 21.30, 22.43),
       ("landing 22.43-24.00", 22.43, 24.0), ("clause 24.00-27.82", 24.0, 27.82), ("google 28.31-32.70", 28.31, 32.70),
       ("alone 33.16-36.18", 33.16, 36.18), ("facts 37.18-38.82", 37.18, 38.82)]
GAPS = [(8.08, 8.44), (11.36, 11.57), (14.64, 15.07), (20.10, 20.67), (21.24, 21.37), (25.60, 26.08), (27.82, 28.31),
        (32.70, 33.16), (34.99, 35.45), (36.18, 36.54)]


def arc_report(vs, music, air):
    out = {}
    for lab, f in (("full", lambda z: z), ("phone", phone)):
        tv, lv = short_term_lufs(f(vs), win=0.4, hop=0.05)
        _, lm = short_term_lufs(f(music), win=0.4, hop=0.05)
        _, la = short_term_lufs(f(air), win=0.4, hop=0.05)
        k = min(len(tv), len(lm), len(la)); tv, lv, lm, la = tv[:k], lv[:k], lm[:k], la[:k]
        sp = speech_frames(tv)
        rows = {}
        for nm, a, b in ARC:
            m = (tv >= a) & (tv <= b)
            Lm = 10 * np.log10(np.mean(10 ** (lm[m] / 10)))
            La = 10 * np.log10(np.mean(10 ** (la[m] / 10)))
            ms = m & sp
            Lv = 10 * np.log10(np.mean(10 ** (lv[ms] / 10))) if ms.any() else float("nan")
            rows[nm] = {"music": round(float(Lm), 1), "under_voice": round(float(Lv - Lm), 1),
                        "over_air": round(float(Lm - La), 1)}
        out[lab] = rows
    t1, l1 = short_term_lufs(music, win=0.1, hop=0.01)
    pumps = {}
    for a, b in GAPS:
        m = (t1 >= a) & (t1 <= b - 0.05); pre = (t1 >= a - 1.0) & (t1 <= a - 0.05)
        pumps[f"{a:.2f}-{b:.2f}"] = round(float(l1[m].max() - l1[pre].max()), 1)
    # the music's loudest 100 ms inside each pause minus its loudest 100 ms in the second of speech before: a swell
    # the duck lets through shows as > 0 (a note the score places in the pause shows too: 8.08 is the pulse's entry)
    out["pause_swell_dB"] = pumps
    return out


def main():
    SCRATCH.mkdir(parents=True, exist_ok=True)
    notes = compose()
    pm, beats = write_midi(notes)
    groups, stems = render(notes)
    v, vs = voice_stereo()
    # music: pre-duck by group (8 dB, 500 ms hold), then level so the median under speech is ~27 dB
    ducked = sum(groups[k] * duck_curve(v, k)[:, None] for k in ("mid", "air", "low"))
    d, _ = gap_stats(vs, ducked)
    music = ducked * db2a(np.median(d) - 27.0)
    # A5: Google's side (28.31-32.70) plays the clause's pulse (24.00-27.82) at the SAME measured level
    tq, lq = short_term_lufs(music, win=0.4, hop=0.05)
    trim = float(np.median(lq[(tq >= 24.2) & (tq < 27.6)]) - np.median(lq[(tq >= 28.5) & (tq < 32.5)]))
    tt_ = np.arange(N_FILM) / SR
    music = music * db2a(np.interp(tt_, [0, 28.20, 28.30, 32.75, 32.85, FILM_DUR], [0, 0, trim, trim, 0, 0]))[:, None]
    air, air_layers, life_rep = world_air()
    # the air: ~19 dB under the speaking voice before its own 3 dB duck (with the same hold); 4 dB less under music
    tv, lv = short_term_lufs(vs, win=0.4, hop=0.05)
    vref = float(np.median(lv[speech_frames(tv)]))
    th, la = short_term_lufs(air, win=0.4, hop=0.05)
    hook = (th < 6.0)
    air_gain = db2a(vref - 19.2 - float(np.median(la[hook])))
    air = air * air_gain
    air_layers = {k: x * air_gain for k, x in air_layers.items()}
    aduck = duck_curve(v, "air", depth_db=3.0)[:, None]
    air = air * aduck
    air_layers = {k: x * aduck for k, x in air_layers.items()}
    g = np.ones(N_FILM)                       # the guard on the whole bed (music + air): >= 12 dB under every word
    for _ in range(4):
        g *= guard(vs, (music + air) * g[:, None])
    music, air = music * g[:, None], air * g[:, None]
    air_layers = {k: x * g[:, None] for k, x in air_layers.items()}
    plan = carve_plan(v, music + air)
    music, air = carve([music, air], plan)
    bed = music + air
    tp = true_peak_db(bed)
    if tp > -3.0:
        bed *= db2a(-3.0 - tp); music *= db2a(-3.0 - tp); air *= db2a(-3.0 - tp)
    save(BED_OUT, bed + (rng(77).random(bed.shape) - rng(78).random(bed.shape)) / 32768.0, subtype="PCM_16")
    save(SCRATCH / "bed_music.wav", music); save(SCRATCH / "bed_air.wav", air)
    for k, x in air_layers.items():
        save(SCRATCH / f"air_{k}.wav", x)
    # report
    dm, tm = gap_stats(vs, music); dall, _ = gap_stats(vs, bed); da, _ = gap_stats(vs, air)
    t1, l1 = short_term_lufs(music, win=1.0, hop=0.25)
    tm_, lm_ = short_term_lufs(music, win=0.4, hop=0.05)
    rep = {"file": str(BED_OUT), "dur_s": round(len(bed) / SR, 4), "lufs_I_bed": round(lufs(bed), 2),
           "true_peak_dBTP": round(true_peak_db(bed), 2), "voice_speech_level_LUFS": round(vref, 2),
           "music_under_voice_median_dB": round(float(np.median(dm)), 1),
           "music_under_voice_p5_dB": round(float(np.percentile(dm, 5)), 1),
           "music_under_voice_min_dB": round(float(dm.min()), 1),
           "air_under_voice_median_dB": round(float(np.median(da)), 1),
           "bed_under_voice_median_dB": round(float(np.median(dall)), 1),
           "bed_under_voice_min_dB": round(float(dall.min()), 1),
           "google_side_trim_dB": round(trim, 2),
           "guard_extra_dB_max": round(float(-a2db(g).min()), 1),
           "guard_active_s": guard_spans(a2db(g)),
           "word_carve": [(w_, round(a, 2), round(b, 2), bn, round(dd, 1)) for (a, b, bn, dd, w_) in plan],
           "life_sounded": life_rep,
           "clicks": click_report(bed)[0],
           "seam_step": float(np.abs(bed[0] - bed[-1]).max()),
           "music_momentary_median_LUFS": {nm: round(float(np.median(lm_[(tm_ >= a) & (tm_ < b)])), 1) for (nm, a, b) in
                                           [("walk 15.1-17.9", 15.1, 17.9), ("hold 20.6-21.3", 20.6, 21.3),
                                            ("crane 21.3-22.4", 21.3, 22.4), ("landing 22.4-24.0", 22.4, 24.0),
                                            ("clause 24.0-27.8", 24.0, 27.8), ("google 28.3-32.7", 28.3, 32.7),
                                            ("motif alone 33.2-36.2", 33.2, 36.2), ("facts 37.2-38.8", 37.2, 38.8)]},
           "arc": arc_report(vs, music, air),
           "tempo_bpm": [round(60 * n / (b - a), 1) for (a, b, n) in SEG]}
    (SCRATCH / "bed_report.json").write_text(json.dumps(rep, indent=1))
    print(json.dumps(rep, indent=1))
    print(f"MIDI -> {MIDI_OUT} ({len(beats)} beats); stems -> {SCRATCH}")


if __name__ == "__main__":
    main()
