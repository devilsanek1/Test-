"""Bed 1 "pizzicato": curious string pizzicato + felt piano. D minor, 95.05 BPM, 4/4, 28 bars = 70.7 s.

Arc (bar: time):  1-4 intrigue (0-10.1) | 5-8 setup | 9-12 discovery (F major colour) |
13-14 leak build (30.3, "Except") | 15-17 urgency (35.35 "Cloudflare") | 18 suspension (42.9) |
19-20 breath (45.45 "So now comes step two") | 21-24 steady rebuild | 25-28 unresolved close (A sus4 -> loops to Dm).
"""
import sys
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).parent))
from bedkit import (Bed, Grid, chord, tones, nearest, automation, fx, reverb_send, voice_carve, finish, TAIL,
                    HighpassFilter, LowpassFilter, HighShelfFilter, LowShelfFilter, PeakFilter, Compressor)  # noqa
from common import AUDIO, SR, db2a  # noqa: E402
import instruments as I  # noqa: E402

g = Grid([4] * 28)
bed = Bed("pizzicato", g, seed=11)

CH = {1: "Dm", 2: "Bb", 3: "Gm", 4: "Asus4", 5: "Dm", 6: "Bb", 7: "Gm", 8: "A", 9: "F", 10: "C/E", 11: "Dm",
      12: "Bb", 13: "Gm", 14: "A7sus4", 15: "Dm", 16: "Bb", 17: "Gm6/E", 18: "A7sus4", 19: "Bbmaj7", 20: "Gm9",
      21: "Dm", 22: "Bbmaj7", 23: "F", 24: "C", 25: "Gm7", 26: "Bbmaj7", 27: "Gm6", 28: "Asus4"}
CH2 = {4: "A", 14: "A7b9", 8: "A7"}  # second half of bar


def ch(bar, beat=0):
    s = CH2.get(bar) if beat >= 2 and bar in CH2 else CH[bar]
    return chord(s)


def section(bar):
    for name, (a, b) in {"S1": (1, 4), "S2": (5, 8), "S3": (9, 12), "S4": (13, 14), "S5": (15, 17), "S6": (18, 18),
                         "S7": (19, 20), "S8": (21, 24), "S9": (25, 28)}.items():
        if a <= bar <= b:
            return name


vln, vla, vc, cb = I.get("vln_pizz"), I.get("vla_pizz"), I.get("vc_pizz"), I.get("cb_pizz")
pno, vcs, trem, glk = I.get("piano"), I.get("vc_sus"), I.get("vla_trem"), I.get("glock")
for n, prog, pan in [("vln", 45, -0.35), ("vla", 45, 0.3), ("vc", 45, 0.2), ("cb", 45, 0.0), ("piano", 0, 0.1),
                     ("vc_sus", 42, -0.15), ("trem", 44, 0.3), ("glock", 9, 0.4)]:
    bed.track(n, prog, pan=pan)


def cell(bar, beat=0, center=72, n=5):
    _, pcs, _ = ch(bar, beat)
    ts = tones(pcs, center - 5, center + 14)
    return ts[:n]


TIPTOE = [(0, 0, 66), (2, 1, 60), (3, 2, 64), (6, 1, 58)]
TIPTOE2 = [(0, 0, 70), (2, 1, 60), (3, 2, 63), (5, 3, 60), (6, 2, 58)]
QUESTION = [(0, 0, 70), (2, 1, 60), (4, 2, 64), (6, 3, 66), (7, 4, 60)]
WALK = [(0, 0, 72), (1, 1, 54), (2, 2, 58), (3, 0, 68), (4, 1, 54), (5, 2, 58), (6, 3, 66), (7, 2, 54)]

# ------------------------------------------------------------------ violins (pizz ostinato)
for bar in range(1, 29):
    s = section(bar)
    pat, center, vofs = None, 72, 0
    if s == "S1":
        pat = {1: TIPTOE, 2: TIPTOE2, 3: TIPTOE, 4: QUESTION}[bar]
    elif s == "S2":
        pat = WALK if bar < 8 else QUESTION; vofs = -2
    elif s == "S3":
        pat, center, vofs = WALK, 75, 0
    elif s == "S8":
        pat, vofs = (TIPTOE if bar < 23 else WALK), -4
    elif s == "S9":
        pat, vofs = {25: WALK, 26: WALK, 27: TIPTOE, 28: QUESTION}[bar], {25: -6, 26: -8, 27: -6, 28: -2}[bar]
    if pat:
        for (slot, idx, v) in pat:
            c = cell(bar, slot / 2, center)
            bed.note("vln", vln, c[min(idx, len(c) - 1)], v + vofs, bar, slot / 2, 0.5)
    if s == "S4":
        if bar == 13:  # "Except," -> silence, then repeated D5 creeping in
            for k, slot in enumerate(range(4, 8)):
                bed.note("vln", vln, 74, 46 + 5 * k, bar, slot / 2, 0.5)
        else:  # 16ths, crescendo, alternating sus4 tones
            for k in range(16):
                p = [74, 76][k % 2] if k < 8 else [73, 76][k % 2]
                bed.note("vln", vln, p, 58 + k * 1.6, bar, k / 4, 0.25)
    if s == "S5":
        for k in range(16):
            c = cell(bar, k / 4, 71, 4)
            idx = [0, 2, 1, 2][k % 4]
            acc = 8 if k in (0, 6, 12) else 0
            bed.note("vln", vln, c[idx], 54 + acc + (bar - 15) * 2, bar, k / 4, 0.25)
    if s == "S6":
        bed.note("vln", vln, 74, 70, bar, 0, 0.5); bed.note("vln", vln, 76, 56, bar, 1.5, 0.5)
    if bar == 20:  # soft tiptoe re-entry leading into the rebuild
        for (slot, idx, v) in [(4, 0, 46), (6, 1, 50), (7, 2, 54)]:
            c = cell(bar, slot / 2, 72)
            bed.note("vln", vln, c[idx], v, bar, slot / 2, 0.5)
    if bar == 28:  # pickup 16ths that hand over to bar 1 across the loop point
        for k, p in enumerate([72, 74, 76]):
            bed.note("vln", vln, p, 52 + 3 * k, bar, 3.25 + k * 0.25, 0.25)

# ------------------------------------------------------------------ contrabass (pizz bass)
for bar in range(1, 29):
    s = section(bar)
    def b(beat, vel, octave=0, pc=None):
        _, pcs, bass = ch(bar, beat)
        p = nearest(bass if pc is None else pc, 38) + 12 * octave
        bed.note("cb", cb, p, vel, bar, beat, 1.0)
    root5 = lambda beat: (ch(bar, beat)[1][2] if len(ch(bar, beat)[1]) > 2 else ch(bar, beat)[0])
    if s == "S1":
        b(0, 70 if bar == 1 else 80)
        if bar in (2, 4): b(2.5 if bar == 2 else 2, 64)
    elif s in ("S2", "S8"):
        b(0, 84); b(2, 70, pc=root5(2)); b(3.5, 58)
    elif s == "S3":
        b(0, 84); b(1.5, 60); b(2, 72, pc=root5(2)); b(3, 62)
    elif s == "S4":
        pc = 7 if bar == 13 else 9
        for k, beat in enumerate(np.arange(2 if bar == 13 else 0, 4, 0.5)):
            b(beat, 58 + k * 3 + (12 if bar == 14 else 0), pc=pc)
    elif s == "S5":
        for k in range(8):
            b(k / 2, 84 if k in (0, 3, 6) else 64, octave=1 if k in (3, 7) else 0)
    elif s == "S6":
        b(0, 88, pc=9)
    elif s == "S7":
        b(0, 66 if bar == 19 else 58)
    elif s == "S9":
        b(0, 76 - (bar - 25) * 2); b(2, 60, pc=root5(2))

# ------------------------------------------------------------------ cello pizz (offbeat motion)
for bar in range(1, 29):
    s = section(bar)
    if s in ("S2", "S3", "S8") or (s == "S9" and bar < 27):
        slots = [1, 3, 5, 7] if s != "S9" else [3, 7]
        for slot in slots:
            _, pcs, _ = ch(bar, slot / 2)
            ts = tones(pcs, 50, 62)
            bed.note("vc", vc, ts[(slot // 2) % 2 + 1 if len(ts) > 2 else 0], 52 if s != "S3" else 56, bar, slot / 2, 0.5)
    if s == "S5":
        for k in range(8):
            _, pcs, bass = ch(bar, k / 2)
            p = nearest(bass, 50) if k % 2 == 0 else nearest(pcs[2] if len(pcs) > 2 else bass, 55)
            bed.note("vc", vc, p, 60 if k % 2 == 0 else 52, bar, k / 2, 0.5)

# ------------------------------------------------------------------ viola pizz dyads (discovery + urgency)
for bar in range(1, 29):
    s = section(bar)
    if s == "S3":
        for beat in (1, 3):
            ts = tones(ch(bar, beat)[1], 60, 72)[:2]
            for p in ts:
                bed.note("vla", vla, p, 50, bar, beat, 0.5)
    if s == "S5":
        for beat in (0.5, 1.5, 2.5, 3.5):
            ts = tones(ch(bar, beat)[1], 62, 74)[:2]
            for p in ts:
                bed.note("vla", vla, p, 50, bar, beat, 0.5)

# ------------------------------------------------------------------ felt piano
P = lambda bar, beat, pitch, dur, vel=44: bed.note("piano", pno, pitch, vel, bar, beat, dur)


def pchord(bar, beat=0, lo=57, hi=72, vel=36, dur=3.5, roll=0.0):
    ts = tones(ch(bar, beat)[1], lo, hi)
    for k, p in enumerate(ts[:4]):
        P(bar, beat + k * roll, p, dur, vel - k)


# intrigue: answering figure / question
P(2, 2.0, 81, 1.0, 46); P(2, 3.0, 79, 0.5, 40); P(2, 3.5, 76, 1.5, 38)
P(4, 2.0, 81, 1.0, 46); P(4, 3.0, 85, 1.0, 44)
P(5, 0.0, 86, 2.0, 42)
for bar in (1, 2, 3, 4):
    pchord(bar, lo=57, hi=69, vel=27, dur=3.8)
for bar in (5, 6, 7):
    pchord(bar, vel=32)
P(8, 2.0, 81, 1.0, 44); P(8, 3.0, 85, 1.0, 42)
# discovery melody (F major colour)
for (bar, beat, p, d) in [(9, 0, 84, 1.5), (9, 1.5, 81, .5), (9, 2, 77, 1), (9, 3, 79, 1),
                          (10, 0, 76, 1.5), (10, 1.5, 79, .5), (10, 2, 84, 2),
                          (11, 0, 86, 1), (11, 1, 84, .5), (11, 1.5, 81, .5), (11, 2, 77, 2),
                          (12, 0, 74, 1.5), (12, 1.5, 77, .5), (12, 2, 82, 1), (12, 3, 81, 1)]:
    P(bar, beat, p, d, 46)
for bar in range(9, 13):
    pchord(bar, lo=53, hi=67, vel=30)
# leak: low chromatic climb (below the voice)
for k, p in enumerate([31, 32, 33, 34, 35, 36, 37]):
    bar, beat = (13, 1 + k) if k < 3 else (14, k - 3)
    P(bar, beat, p, 1.0, 40 + k * 3); P(bar, beat, p + 12, 1.0, 34 + k * 3)
# urgency: low octave weight on downbeats
for bar in (15, 16, 17):
    _, _, bass = ch(bar)
    P(bar, 0, nearest(bass, 28), 2.0, 58); P(bar, 0, nearest(bass, 40), 2.0, 50)
# suspension
pchord(18, lo=62, hi=69, vel=48, dur=3.8); P(18, 0, 33, 3.8, 50)
# breath: rolled Bbmaj7, slow melody
P(19, 0, 34, 4.0, 46)
pchord(19, lo=65, hi=76, vel=42, dur=4.0, roll=0.12)
P(19, 2.0, 86, 1.0, 40); P(19, 3.0, 84, 1.0, 38)
pchord(20, lo=62, hi=74, vel=36, dur=4.0, roll=0.12)
P(20, 0, 82, 2.0, 40); P(20, 2.0, 81, 2.0, 38)
# rebuild
for bar in range(21, 25):
    pchord(bar, vel=32)
P(22, 2.0, 81, 1.0, 42); P(22, 3.0, 79, 1.0, 40); P(24, 2.0, 84, 1.0, 42); P(24, 3.0, 79, 1.0, 40)
# close: unresolved line falling to the sus4
for (bar, beat, p, d) in [(25, 0, 86, 1.5), (25, 1.5, 84, .5), (25, 2, 82, 2), (26, 0, 81, 2), (26, 2, 77, 2),
                          (27, 0, 76, 2), (27, 2, 79, 1), (27, 3, 81, 1), (28, 0, 81, 2), (28, 2, 79, 1), (28, 3, 76, 1)]:
    P(bar, beat, p, d, 40)
for bar in range(25, 29):
    pchord(bar, vel=28, dur=4.1 if bar == 28 else 3.5)  # last chord rings across the loop point

# ------------------------------------------------------------------ sustained strings: leak -> urgency -> suspension
bed.note("vc_sus", vcs, 38, 46, 13, 2, 6.0)      # D2 pedal
bed.note("vc_sus", vcs, 38, 58, 15, 0, 12.0)
bed.note("vc_sus", vcs, 40, 56, 18, 0, 3.6)       # E2 under the sus4
bed.note("trem", trem, 69, 40, 13, 2, 6.0); bed.note("trem", trem, 74, 40, 13, 2, 6.0)
bed.note("trem", trem, 74, 50, 15, 0, 8.0); bed.note("trem", trem, 77, 46, 15, 0, 8.0)
bed.note("trem", trem, 76, 48, 17, 0, 4.0); bed.note("trem", trem, 79, 44, 17, 0, 4.0)
bed.note("trem", trem, 74, 44, 18, 0, 3.0)

# ------------------------------------------------------------------ glock sparkles ("found it", "one in three")
bed.note("glock", glk, 91, 40, 10, 3.5, 1.0); bed.note("glock", glk, 96, 34, 10, 3.5, 1.0)
bed.note("glock", glk, 86, 36, 25, 0, 1.0)

# ------------------------------------------------------------------ mix
n = len(bed.tracks["vln"].buf)
T = bed.tracks
trem_auto = automation(n, [(g.t(13, 2), -14), (g.t(15, 0), 0), (g.t(17, 4), -2), (g.t(18, 3), -30)])
vcs_auto = automation(n, [(g.t(13, 2), -12), (g.t(15, 0), -2), (g.t(18, 0), -3), (g.t(18, 4), -30)])
T["trem"].buf *= trem_auto[:, None]
T["vc_sus"].buf *= vcs_auto[:, None]

stems = {
    "vln": fx(T["vln"].buf, [HighpassFilter(180), PeakFilter(3000, -3, 1.0)]) * db2a(-1),
    "vla": fx(T["vla"].buf, [HighpassFilter(150)]) * db2a(-4),
    "vc": fx(T["vc"].buf, [HighpassFilter(70), LowpassFilter(4000)]) * db2a(-3),
    "cb": fx(T["cb"].buf, [HighpassFilter(38), LowpassFilter(2500), Compressor(-20, 2.0, 10, 120)]) * db2a(-2),
    "piano": fx(T["piano"].buf, [HighpassFilter(45), LowpassFilter(3200), HighShelfFilter(1500, -4, 0.7),
                                 LowShelfFilter(200, -2)]) * db2a(2),
    "vc_sus": fx(T["vc_sus"].buf, [LowpassFilter(1800)]) * db2a(-4),
    "trem": fx(T["trem"].buf, [HighpassFilter(250), LowpassFilter(6000)]) * db2a(-6),
    "glock": fx(T["glock"].buf, [LowpassFilter(9000)]) * db2a(-8),
}
sends = {"vln": 0.30, "vla": 0.3, "vc": 0.15, "cb": 0.05, "piano": 0.40, "vc_sus": 0.3, "trem": 0.4, "glock": 0.6}
dry = sum(stems.values())
wet = reverb_send(sum(stems[k] * sends[k] for k in stems), room=0.62, damp=0.55)
mix = voice_carve(dry + wet * 0.55)

if __name__ == "__main__":
    for k, v in stems.items():
        print(f"  stem {k:7s} rms {20 * np.log10(np.sqrt((v ** 2).mean()) + 1e-12):6.1f} dBFS")
    finish(bed, mix, AUDIO / "music_pizzicato.wav")
    bed.write_midi(AUDIO / "music_pizzicato.mid", [(4, 4, 0.0)])
