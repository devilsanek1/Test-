#!/usr/bin/env python3
"""Video 2 ("One Small Window") bed "Towpath": composed NEW for this cut -> public/v2r/music_bed.wav (48 kHz stereo,
2345 frames = 39.0833 s, circular) + audio/v2r/music_bed.mid (every note on the film's beat grid).

    python3 audio/v2r/bed.py            # compose + render + pre-duck + measure (~1-2 min, the piano loads slowly)

THE IDEA. One small window: her motif is a rising fourth on a felt upright piano (C -> F), the same interval as the
film's exit ding at 0.45 s, so the first sound she makes going out is the tune she comes home to. F major, its
relative D minor for the staff's fear, B-flat lydian for the vast. Real CC0 instruments (VSCO 2 CE, VCSL) played by
this script: felt piano, string pizzicato, low strings (contrabass + cello), pp violins and bowed vibraphone for air.

THE ARC (TREATMENT s7, on heard times):
  0.00-6.28   NO music: canal air only (water, far city, breeze, a few far birds); 4.54-4.79 the air dips (the stop)
  6.28        two dry violin pizzicato notes, C5 -> F5 (the ding's fourth): false relief on "You'd think..."
  8.44-12.81  "But": the pulse steadies, D minor (A4/D5 ostinato over a moving pizz bass), thins to quarters on
              "scared", the last note decays out by 12.81 (silence 12.81-13.16)
  13.16       air (pp violins C6 + bowed vibes A5) and ONE high piano C6 on "she" (13.96): the question
  15.07-17.96 her walk: the motif (C6 F6 E6 C6) over a walking pizz bass (F E D C Bb) in tenths; the walk stops
              with her on "objected" (17.96)
  18.92       "military": a low D minor sustain, weight without drama; it lets go on "heading"
  20.55-21.30 April morning air (bowed vibes, B-flat maj7 colours); 21.30 low strings open with the crane and swell
  22.43       soft accent 1 on the landing ("Pentagon"): B-flat lydian bloom, lows and highs only, a felt low bloom
  24.00-27.82 the pulse, level and thinned under the clause (C5/F5 fourths, pizz bass Bb A G C)
  28.31-32.70 the SAME pulse, instruments, harmony and level for Google's side (no minor turn, no sting)
  33.16-36.18 the motif alone, quieter (C5 F5 E5 C5); held breath 36.18-36.54
  37.18       soft accent 2: E5 -> F5, it resolves on "facts" (F add9: piano high, strings low, vibes, low bloom)
  38.82-      a circular tail: the chord thins into the hook's air (gone by ~0.5 s into the loop)

OUT OF THE VOICE'S WAY. The male narrator (f0 ~120 Hz) owns ~120 Hz-4 kHz. Sustained notes live below ~110 Hz or
above ~800 Hz; the only mid-register notes are short pizzicati and a few soft piano notes; a static carve (-4 dB
around 2.2 kHz). Then the bed is PRE-DUCKED against the locked voice (public/v2/voice.wav): -14 dB on the music
(-10 on the air, -6 on the lows; less inside the two swells, SWELLS), 30 / 250 ms, the music level set so its median
sits ~27 dB under the speaking voice, and a guard on the whole bed (music + air) so it stays >= 12 dB under every word.
Play music_bed.wav at gain 1 (cues.json), no further ducking.
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from dsp import (SR, ROOT, PUBLIC, VOICE, SCRATCH, N_FILM, FILM_DUR, np, bp, lp, hp, env_ad, env_bell, place, pan,  # noqa
                 widen, st, noise, rng, n_of, tt, circ_noise, smooth_rand, chirp, db2a, a2db, save, load, lufs,
                 true_peak_db, short_term_lufs, click_report)
import sheet  # noqa: E402
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
# track -> (instrument, pan, group): group = how it is pre-ducked (mid -14 dB, low -6 dB, air -10 dB)
TRACKS = {"pizz": ("vln_pizz", 0.18, "mid"), "inner": ("vla_pizz", -0.2, "mid"), "bass": ("cb_pizz", -0.05, "low"),
          "bass8": ("vc_pizz", -0.1, "mid"), "motif": ("piano", 0.1, "mid"), "air_vln": ("vln_sus", -0.3, "air"),
          "air_vib": ("vibes_bowed", 0.3, "air"), "low_cb": ("cb_sus", 0.0, "low"), "low_vc": ("vc_sus", -0.15, "low")}
PROGRAMS = {"pizz": 45, "inner": 45, "bass": 45, "bass8": 45, "motif": 0, "air_vln": 48, "air_vib": 11, "low_cb": 43,
            "low_vc": 42, "bloom": 38}
GAINS = {"pizz": -2.0, "inner": -6.0, "bass": 1.0, "bass8": -9.0, "motif": 10.0, "air_vln": -8.0, "air_vib": -7.0,
         "low_cb": 0.0, "low_vc": -9.0, "bloom": -40.0}
SENDS = {"pizz": 0.30, "inner": 0.30, "bass": 0.15, "bass8": 0.2, "motif": 0.50, "air_vln": 0.8, "air_vib": 0.8,
         "low_cb": 0.2, "low_vc": 0.3, "bloom": 0.1}
PMAX = 42      # the felt piano stays in its soft velocity layer


def compose(seed=2610):
    r = rng(seed)
    notes = []          # (track, t, dur, pitch, vel)

    def N(track, t, pitch, vel, dur, human=True):
        dt = r.normal(0, 0.004) if human else 0.0
        v = int(np.clip(vel + (r.normal(0, 2) if human else 0), 1, PMAX if track == "motif" else 63))
        notes.append((track, max(0.0, t + dt), dur, int(pitch), v))

    # 6.28 false relief: two dry pizz notes, the ding's rising fourth
    N("pizz", 6.28, 72, 50, 0.3); N("pizz", 6.28 + 0.33, 77, 46, 0.3)

    # 8.44-12.81 the staff pulse: D minor, A4/D5 ostinato over D Bb G A; quarters from "scared" (beat 3 = 10.31)
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

    # 13.16 air + one high piano note on "she" 13.96
    N("air_vln", 13.16, 84, 30, 2.4, False); N("air_vib", 13.22, 81, 40, 2.2, False)
    N("motif", 13.96, 84, 36, 1.2, False)

    # 15.07-17.96 her walk: walking pizz bass F E D C Bb, upper tenths A G F E D (an octave up), the motif
    s = 4
    for k, (pb, pu) in enumerate([(41, 81), (40, 79), (38, 77), (36, 76), (34, 74)]):
        N("bass", beat(s, k), pb, 50, blen(s) * 0.6)
        N("bass8", beat(s, k), pb + 12, 34, blen(s) * 0.5)
        N("pizz", beat(s, k + 0.5), pu, 32 if k < 4 else 29, blen(s) * 0.5)
    for (k, p, d, v) in ((0.5, 84, 0.6, 38), (1.0, 89, 1.0, 40), (2.0, 88, 0.5, 31), (2.5, 84, 1.6, 30)):
        N("motif", beat(s, k), p, v, d * blen(s))

    # 18.92 "military": a low D minor sustain (D2 + A2), let go on "heading" 19.80
    N("low_cb", 18.92, 38, 40, 1.15, False); N("low_vc", 18.95, 45, 34, 1.1, False)

    # S5: April air from 20.60 (B-flat maj7 colours: D6, A5), 21.30 low strings open (Bb1 + F2) and swell,
    # 22.43 accent 1: lydian bloom (vibes C6 + E6, violins D6), the felt low bloom (added in render)
    N("air_vib", 20.60, 86, 36, 3.6, False); N("air_vib", 20.66, 81, 34, 3.5, False)
    N("low_cb", 21.30, 34, 44, 3.0, False); N("low_vc", 21.32, 41, 38, 2.9, False)
    N("air_vln", 21.30, 86, 30, 2.9, False)
    N("air_vib", 22.43, 84, 42, 1.9, False); N("air_vib", 22.45, 88, 38, 1.8, False)

    # 24.00-27.82 and 28.31-32.70: THE SAME level pulse (C5/F5 fourths, pizz bass Bb A G C, no accents)
    for s, nb in ((7, 6), (9, 7)):
        e = blen(s) / 2
        for k in range(2 * nb):
            N("pizz", beat(s, k / 2), 72 if k % 2 == 0 else 77, 30 if k % 2 == 0 else 27, e, human=False)
        for k, p in ((0, 34), (4, 33), (8, 31), (10, 36)) + (((12, 36),) if nb == 7 else ()):
            N("bass", beat(s, k / 2), p, 44, 2 * e, human=False)

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


# ---------------------------------------------------------------- the world's air (ambience, circular)
def lap_events(n, rate, seed, lo=250, hi=1100, level=1.0, avoid=()):
    """canal water lapping on stone / hulls: soft irregular 'plap's with a little resonance."""
    r = rng(seed); y = np.zeros((n, 2)); t = 0.0; T = n / SR
    while t < T:
        t += r.exponential(1.0 / rate)
        if any(a <= t <= b for (a, b) in avoid):
            continue
        d = r.uniform(0.06, 0.14); c = r.uniform(lo, hi)
        x = bp(r.standard_normal(n_of(d)), c * 0.6, c * 1.6, 2) * env_ad(n_of(d), r.uniform(0.006, 0.015), d * 0.3)
        x += 0.4 * np.sin(2 * np.pi * c * 0.8 * tt(d)) * env_ad(n_of(d), 0.004, d * 0.15)
        s = pan(x * r.uniform(0.3, 1.0) * level, r.uniform(-0.7, 0.7))
        i = n_of(t) % n
        k = min(len(s), n - i); y[i:i + k] += s[:k]
        if k < len(s):
            y[: len(s) - k] += s[k:]
    return y


def bird_events(n, rate, seed, kind="london", windows=((0, 1e9),), level=1.0):
    """far birds: short chirps ('twit') in London; brighter spring warbles in Arlington."""
    r = rng(seed); y = np.zeros((n, 2)); t = 0.0; T = n / SR
    while t < T:
        t += r.exponential(1.0 / rate)
        if not any(a <= t <= b for (a, b) in windows):
            continue
        if kind == "london":
            reps = r.integers(1, 4); f0 = r.uniform(3200, 4600)
            seq = [(0.09 * j, f0 * r.uniform(0.97, 1.03), f0 * r.uniform(0.7, 0.85), 0.04) for j in range(reps)]
        else:
            m = r.integers(4, 9); f0 = r.uniform(2300, 3400)
            seq = []; s = 0.0
            for j in range(m):
                a = f0 * r.uniform(0.8, 1.35); d = r.uniform(0.05, 0.11)
                seq.append((s, a, a * r.uniform(0.8, 1.25), d)); s += d + r.uniform(0.01, 0.04)
        p = r.uniform(-0.8, 0.8); g = r.uniform(0.35, 1.0) * level
        for (s, a, b, d) in seq:
            x = chirp(a, b, d, 1.0) * env_bell(n_of(d), 0.3, 1.2)
            x = hp(x, 1800, 2)
            i = n_of(t + s) % n; sx = pan(x * g, p)
            k = min(len(sx), n - i); y[i:i + k] += sx[:k]
            if k < len(sx):
                y[: len(sx) - k] += sx[k:]
    return y


def rustle(n, seed, gust, rate=70.0):
    """leaves in the wind: short dry grains (5-25 ms, 1.8-7 kHz), their density following the gusts (circular)."""
    r = rng(seed); y = np.zeros((n, 2)); t = 0.0; T = n / SR
    while t < T:
        t += r.exponential(1.0 / rate)
        i = n_of(t) % n
        if r.random() > gust[i] ** 1.5:
            continue
        d = r.uniform(0.005, 0.025); m = n_of(d)
        g = bp(r.standard_normal(m), r.uniform(1800, 3000), r.uniform(4500, 7000), 2) * np.hanning(m)
        sx = pan(g * r.uniform(0.2, 1.0), r.uniform(-0.8, 0.8))
        k = min(len(sx), n - i); y[i:i + k] += sx[:k]
        if k < len(sx):
            y[: len(sx) - k] += sx[k:]
    return y


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


LONDON = [(0.00, 20.55), (28.06, FILM_DUR)]
ARL = [(20.55, 28.06)]


def world_air():
    """The canal (S1-S4, S7-S8) and the April morning in Arlington (S5-S6), as one circular stereo track."""
    n = N_FILM
    layers = {}
    # far city: a low, slow London (and a parkway in Arlington)
    city = np.stack([circ_noise(n, 40, 450, 501, -4.5), circ_noise(n, 40, 450, 502, -4.5)], 1)
    city *= smooth_rand(n, 0.12, 503, 0.6, 1.0)[:, None]
    layers["city"] = (city * 0.20, [(0.00, 12.98, 0), (12.98, 14.86, -4), (14.86, 20.55, -3), (28.06, 32.93, -2),
                                    (32.93, FILM_DUR, -4)])
    park = np.stack([circ_noise(n, 70, 1300, 504, -3.5), circ_noise(n, 70, 1300, 505, -3.5)], 1)
    park *= smooth_rand(n, 0.35, 506, 0.45, 1.0)[:, None]
    layers["parkway"] = (park * 0.11, [(20.55, 28.06, 0)])
    # air: a breeze (gusting slowly, falling off toward the top: never a steady hiss) + the leaves it moves (dry
    # rustle grains, denser in the gusts: October plane trees in London, blossom in Arlington) + a faint open-air
    # body in the mids so the place is one continuous sound, not a rumble and a hiss with a hole between them
    gust = smooth_rand(n, 0.22, 509, 0.12, 1.0)
    air = np.stack([circ_noise(n, 2500, 9000, 507, -6), circ_noise(n, 2500, 9000, 508, -6)], 1) * gust[:, None]
    layers["air"] = (air * 0.024, [(0.00, 6.10, 0), (6.10, 20.55, -2), (20.55, 28.06, 1), (28.06, FILM_DUR, -2)])
    layers["leaves"] = (rustle(n, 520, gust) * 0.05, [(0.00, 20.55, 0), (20.55, 28.06, 2), (28.06, FILM_DUR, -1)])
    body = np.stack([circ_noise(n, 450, 2600, 521, -4), circ_noise(n, 450, 2600, 522, -4)], 1)
    layers["body"] = (body * 0.010 * (0.6 + 0.4 * gust)[:, None], [(0.00, FILM_DUR, 0)])
    # the canal: a low wash + lapping on stone (S1-S3, S7-S8); along the hull while the boat glides (S4)
    wash = np.stack([circ_noise(n, 90, 700, 510, -3), circ_noise(n, 90, 700, 511, -3)], 1)
    wash *= smooth_rand(n, 0.3, 512, 0.5, 1.0)[:, None]
    layers["wash"] = (wash * 0.10, [(0.00, 14.86, 0), (14.86, 20.55, 3), (28.06, 32.93, -3), (32.93, FILM_DUR, 0)])
    laps = lap_events(n, 2.6, 513, avoid=())
    layers["laps"] = (laps * 0.10, [(0.00, 14.86, 0), (14.86, 20.55, 2), (28.06, 32.93, -4), (32.93, FILM_DUR, 1)])
    # S7: the forecourt fountain (soft, broadband, kept low)
    ft = np.stack([circ_noise(n, 700, 7000, 514, -4), circ_noise(n, 700, 7000, 515, -4)], 1)
    ft *= (0.75 + 0.25 * smooth_rand(n, 6.0, 516))[:, None]
    layers["fountain"] = (ft * 0.030, [(28.06, 32.93, 0)])
    # birds: London far chirps (never in the hook's tick run 1.9-6.3), Arlington spring warbles
    lb = bird_events(n, 0.55, 517, "london", windows=((0.0, 1.35), (6.6, 20.4), (28.2, 38.6)))
    layers["birds_ldn"] = (lb * 0.030, [(0.00, 20.55, 0), (28.06, 32.93, -3), (32.93, FILM_DUR, -2)])
    ab = bird_events(n, 0.9, 518, "spring", windows=((20.6, 27.9),))
    layers["birds_arl"] = (ab * 0.028, [(20.55, 28.06, 0)])
    y = np.zeros((n, 2))
    s1 = {"city": 0, "air": 0, "wash": 0, "laps": 0, "birds_ldn": 0, "leaves": 0}
    for k, (x, pts) in layers.items():
        if k in s1:      # the un-build (38.82 -> the seam): S8's air turns into S1's, so the loop is one place
            pts = [(a, min(b, 38.82) if b >= FILM_DUR - 1e-6 else b, db) for (a, b, db) in pts]
            pts.append((38.82, FILM_DUR, s1[k]))
        y += x * gain_curve(pts)[:, None]
    # the "..." (4.54-4.79): the air dips 12 dB (down in 40 ms, back over 150 ms); the picture's life goes on
    t = np.arange(n) / SR
    dip = np.interp(t, [0, 4.50, 4.54, 4.79, 4.94, FILM_DUR], [0, 0, -12, -12, 0, 0])
    y *= db2a(dip)[:, None]
    # the seam: S8's air turns into S1's over the un-build (38.82 -> end), so the loop is one place
    return y


# ---------------------------------------------------------------- render
def bloom(f, dur=1.6):
    """the felt low bloom under an accent: a soft sine + octave, 40 ms attack, ~0.6 s decay. Never a boom."""
    t = tt(dur)
    y = (np.sin(2 * np.pi * f * t) + 0.35 * np.sin(2 * np.pi * 2 * f * t + 0.3)) * env_ad(len(t), 0.04, 0.55)
    return st(y)


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
              "bass": [HighpassFilter(32), LowpassFilter(900), PeakFilter(160, -3, 1.0)],
              "bass8": [HighpassFilter(70), LowpassFilter(1500), PeakFilter(250, -3, 1.0)],
              "motif": felt + [Compressor(-34, 2.5, 5, 200)],
              "air_vln": [HighpassFilter(1000), LowpassFilter(9000)],
              "air_vib": [HighpassFilter(700), LowpassFilter(9500)],
              "low_cb": [HighpassFilter(30), LowpassFilter(420)],
              "low_vc": [HighpassFilter(45), LowpassFilter(520), PeakFilter(240, -3, 1.0)],
              "bloom": [HighpassFilter(28), LowpassFilter(240)]}
    stems = {k: fx(tr.buf[:NT], chains[k]) * db2a(GAINS.get(k, 0.0)) for k, tr in tracks.items()}
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


# The two swells the story asks for happen UNDER speech (the crane 21.30-23.40 under "...a deal letting the
# Pentagon use its AI for", and "facts" 37.18 inside the payoff line), so there the lows and the air duck less and the
# swell is heard; the >= 12 dB guard still holds every word. (start, end, {group: duck dB})
SWELLS = [(21.20, 24.05, {"mid": 10.0, "air": 5.0, "low": 2.0}), (37.05, FILM_DUR, {"mid": 10.0, "air": 6.0, "low": 3.0})]
DUCK = {"mid": 14.0, "air": 10.0, "low": 6.0}


def duck_curve(v, group):
    act, hop = HM.speech_envelope(v)
    tc = np.arange(len(act)) / (SR / hop)
    depth = np.full(len(act), DUCK[group])
    for (a, b, d) in SWELLS:
        depth = np.where((tc >= a) & (tc < b), d[group], depth)
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
    """where the >= 12 dB guard had to pull the music down (start, end, deepest dB)."""
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


def main():
    SCRATCH.mkdir(parents=True, exist_ok=True)
    notes = compose()
    pm, beats = write_midi(notes)
    groups, stems = render(notes)
    v, vs = voice_stereo()
    # music: pre-duck by group, then level so the median under speech is ~27 dB, then the >= 12 dB guard
    ducked = sum(groups[k] * duck_curve(v, k)[:, None] for k in ("mid", "air", "low"))
    d, _ = gap_stats(vs, ducked)
    music = ducked * db2a(np.median(d) - 27.0)
    # A5: Google's side (28.31-32.70) plays the clause's pulse (24.00-27.82) at the SAME measured level: the voice
    # runs straight through Google's line, so the duck sits longer there; trim it back to the clause's median
    tq, lq = short_term_lufs(music, win=0.4, hop=0.05)
    trim = float(np.median(lq[(tq >= 24.2) & (tq < 27.6)]) - np.median(lq[(tq >= 28.5) & (tq < 32.5)]))
    tt_ = np.arange(N_FILM) / SR
    music = music * db2a(np.interp(tt_, [0, 28.20, 28.30, 32.75, 32.85, FILM_DUR], [0, 0, trim, trim, 0, 0]))[:, None]
    air = world_air()
    # the air: ~22 dB under the speaking voice (a touch more in the hook, where it is the only bed), ducked 3 dB
    _, la = short_term_lufs(air, win=0.4, hop=0.05)
    tv, lv = short_term_lufs(vs, win=0.4, hop=0.05)
    vref = float(np.median(lv[speech_frames(tv)]))
    air = air * db2a(vref - 19.2 - float(np.median(la)))
    act, hop = HM.speech_envelope(v)
    air = air * db2a(HM.ctrl_to_audio(HM.one_pole_db(-3.0 * act, 30.0, 250.0, SR / hop), hop, N_FILM))[:, None]
    g = np.ones(N_FILM)                       # the guard on the whole bed (music + air): >= 12 dB under every word
    for _ in range(4):
        g *= guard(vs, (music + air) * g[:, None])
    music, air = music * g[:, None], air * g[:, None]
    bed = music + air
    tp = true_peak_db(bed)
    if tp > -3.0:
        bed *= db2a(-3.0 - tp)
    save(BED_OUT, bed + (rng(77).random(bed.shape) - rng(78).random(bed.shape)) / 32768.0, subtype="PCM_16")
    save(SCRATCH / "bed_music.wav", music); save(SCRATCH / "bed_air.wav", air)
    # report
    dm, tm = gap_stats(vs, music); dall, _ = gap_stats(vs, bed); da, _ = gap_stats(vs, air)
    secs = [("hook", 0, 6.10), ("staff", 6.10, 12.98), ("her window", 12.98, 14.86), ("walk", 14.86, 20.55),
            ("crane", 20.55, 24.0), ("clause", 24.0, 28.06), ("google", 28.06, 32.93), ("her words", 32.93, FILM_DUR)]
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
           "section_music_LUFS_1s": {nm: round(float(np.mean(l1[(t1 >= a) & (t1 < b)])), 1) for (nm, a, b) in secs},
           "clicks": click_report(bed)[0],
           "seam_step": float(np.abs(bed[0] - bed[-1]).max()),
           "music_momentary_median_LUFS": {nm: round(float(np.median(lm_[(tm_ >= a) & (tm_ < b)])), 1) for (nm, a, b) in
                                           [("walk 15.1-17.9", 15.1, 17.9), ("hold 20.6-21.3", 20.6, 21.3),
                                            ("crane 21.3-22.4", 21.3, 22.4), ("landing 22.4-24.0", 22.4, 24.0),
                                            ("clause 24.0-27.8", 24.0, 27.8), ("google 28.3-32.7", 28.3, 32.7),
                                            ("motif alone 33.2-36.2", 33.2, 36.2), ("facts 37.2-38.8", 37.2, 38.8)]},
           "tempo_bpm": [round(60 * n / (b - a), 1) for (a, b, n) in SEG]}
    (SCRATCH / "bed_report.json").write_text(json.dumps(rep, indent=1))
    print(json.dumps(rep, indent=1))
    print(f"MIDI -> {MIDI_OUT} ({len(beats)} beats); stems -> {SCRATCH}")


if __name__ == "__main__":
    main()
