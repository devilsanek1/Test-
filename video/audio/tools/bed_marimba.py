"""Bed 3 "marimba": minimal kalimba + marimba ostinato in 12/8 (dotted quarter = 95.05), E minor, 28 bars.
Interlocking mbira-style kalimba (low 'pulse' thumb + high 'answer' thumb), soft marimba bass,
cello drone for the leak/urgency, real shaker + bass-drum heartbeat for the Cloudflare numbers."""
import sys
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).parent))
from bedkit import (Bed, Grid, chord, tones, nearest, automation, fx, reverb_send, voice_carve, finish, TAIL,
                    HighpassFilter, LowpassFilter, HighShelfFilter, LowShelfFilter, PeakFilter, Compressor)  # noqa
from common import AUDIO, SR, VIDEO_DUR, db2a  # noqa: E402
from sampler import load_instrument  # noqa: E402
import instruments as I  # noqa: E402

g = Grid([4] * 28)  # 4 dotted-quarter beats per 12/8 bar
bed = Bed("marimba", g, seed=23)
CH = {1: "Emadd9", 2: "Cmaj7", 3: "G", 4: "D/F#", 5: "Emadd9", 6: "Cmaj7", 7: "G", 8: "D", 9: "C", 10: "G/B",
      11: "Am7", 12: "Dsus4", 13: "Cmaj7", 14: "B7sus4", 15: "Em", 16: "Em/D", 17: "Cmaj7#11", 18: "B7sus4",
      19: "Cmaj7", 20: "Am9", 21: "Emadd9", 22: "Cmaj7", 23: "G", 24: "D", 25: "Am7", 26: "Cmaj7", 27: "Am7",
      28: "Bsus4"}
CH2 = {12: (2, "D"), 14: (2, "B7")}


def ch(bar, beat=0.0):
    if bar in CH2 and beat >= CH2[bar][0]:
        return chord(CH2[bar][1])
    return chord(CH[bar])


def sec(bar):
    for name, (a, b) in {"S1": (1, 4), "S2": (5, 8), "S3": (9, 12), "S4": (13, 14), "S5": (15, 17), "S6": (18, 18),
                         "S7": (19, 20), "S8": (21, 24), "S9": (25, 28)}.items():
        if a <= bar <= b:
            return name


kal, mar, vcs, glk = I.get("kalimba"), I.get("marimba"), I.get("vc_sus"), I.get("glock")
shk = load_instrument("shaker", "VCSL/Idiophones/Struck Idiophones/Shaker, Small/Mid_ShakerLowFaster_*.wav",
                      lambda n: (60, 1, 1 + n.count("Up")), release=0.05, max_len=0.6)
kick = load_instrument("kick", "VCSL/Membranophones/Struck Membranophones/Bass Drum 1/BDrumNew_hit_v*_rr*_Sum.wav",
                       lambda n: (36, int(n.split("_v")[1][0]), int(n.split("rr")[1][0])), release=0.2, max_len=1.2)
for n_, prog, pan in [("kal_lo", 108, -0.2), ("kal_hi", 108, 0.3), ("mar", 12, 0.0), ("vc_sus", 42, -0.1),
                      ("glock", 9, 0.4), ("shaker", 70, 0.4), ("kick", 0, 0.0)]:
    bed.track(n_, prog, is_drum=False, pan=pan)

E8 = 1 / 3  # one eighth in beats
LO = [0, 3, 6, 9]                      # pulse thumb (dotted quarters)
HI_SPARSE = [(2, 1), (4, 2), (8, 1), (10, 3)]
HI_FULL = [(1, 1), (2, 2), (4, 3), (5, 2), (7, 1), (8, 3), (10, 2), (11, 4)]
HI_ANSWER = [(1, 2), (2, 3), (4, 4), (5, 3), (7, 2), (8, 4), (10, 3), (11, 1)]


def kal_bar(bar, density, vel=58, lo_vel=None):
    lo_vel = vel + 2 if lo_vel is None else lo_vel
    for slot in LO if density != "breath" else [0, 6]:
        _, pcs, bass = ch(bar, slot * E8)
        lo = tones(pcs, 57, 69)
        bed.note("kal_lo", kal, lo[(slot // 3) % len(lo)], lo_vel - (6 if slot % 6 else 0), bar, slot * E8, 0.8)
    pat = {"sparse": HI_SPARSE, "full": HI_FULL if bar % 2 else HI_ANSWER, "breath": [(3, 2), (9, 1)]}[density]
    for slot, idx in pat:
        hi = tones(ch(bar, slot * E8)[1], 69, 88)
        bed.note("kal_hi", kal, hi[min(idx, len(hi) - 1)], vel - 4, bar, slot * E8, 0.6)


for bar in range(1, 29):
    s = sec(bar)
    # ---------------- kalimba
    if s == "S1":
        kal_bar(bar, "sparse" if bar < 4 else "full", 56)
    elif s == "S2":
        kal_bar(bar, "full", 56)
    elif s == "S3":
        kal_bar(bar, "full", 60)
    elif s == "S4" and bar == 14:
        for k in range(12):
            hi = tones(ch(bar, k * E8)[1], 69, 88)
            bed.note("kal_hi", kal, hi[[1, 2, 3, 2][k % 4]], 48 + k * 2, bar, k * E8, 0.4)
    elif s == "S5":
        kal_bar(bar, "full", 58)
    elif s == "S6":
        for slot, idx in [(0, 2), (3, 1)]:
            hi = tones(ch(bar)[1], 69, 88)
            bed.note("kal_hi", kal, hi[idx], 58 - slot * 2, bar, slot * E8, 0.8)
    elif s == "S7":
        kal_bar(bar, "breath", 50, 46)
    elif s == "S8":
        kal_bar(bar, "sparse" if bar < 23 else "full", 54)
    elif s == "S9":
        kal_bar(bar, "full" if bar < 27 else "sparse", 52 - (bar - 25) * 2)

    # ---------------- marimba (soft mallets): bass + colour
    _, pcs, bass = ch(bar)
    root = nearest(bass, 43)
    if s in ("S1",):
        bed.note("mar", mar, root, 58, bar, 0, 2)
    elif s in ("S2", "S8"):
        bed.note("mar", mar, root, 64, bar, 0, 2); bed.note("mar", mar, root + 7, 52, bar, 2, 1)
        bed.note("mar", mar, root + 12, 46, bar, 3, 1)
    elif s == "S3":
        for k, slot in enumerate([0, 3, 5, 6, 9, 11]):
            ts = tones(ch(bar, slot * E8)[1], root, root + 19)
            bed.note("mar", mar, ts[[0, 2, 1, 0, 2, 3][k] % len(ts)], 60 - (k % 3) * 4, bar, slot * E8, 0.5)
    elif s == "S4":
        start = 6 if bar == 13 else 0  # silence on "Except," then a creeping repeated note
        for k, slot in enumerate(range(start, 12)):
            bed.note("mar", mar, 59, 44 + (k + (0 if bar == 13 else 6)) * 2, bar, slot * E8, 0.3)
            if bar == 14:
                bed.note("mar", mar, 47, 40 + k * 2, bar, slot * E8, 0.3)
    elif s == "S5":
        for slot in range(12):
            p = root if slot % 3 == 0 else root + 12 if slot % 3 == 1 else root + 7
            bed.note("mar", mar, p, 70 if slot % 3 == 0 else 54, bar, slot * E8, 0.3)
    elif s == "S6":
        for p in tones(pcs, 52, 66)[:3]:
            bed.note("mar", mar, p, 58, bar, 0, 3)
        bed.note("mar", mar, nearest(11, 40), 66, bar, 0, 3)
    elif s == "S7":
        bed.note("mar", mar, root, 50, bar, 0, 3)
    elif s == "S9":
        bed.note("mar", mar, root, 58 - (bar - 25) * 2, bar, 0, 2)
        if bar == 28:  # pickup across the loop point
            for k, p in enumerate([59, 62, 64]):
                bed.note("mar", mar, p, 46 + 3 * k, bar, 3 + k * E8, 0.3)

    # ---------------- shaker + heartbeat kick (urgency); a lighter shaker in discovery
    if s in ("S5",) or (s == "S4" and bar == 14):
        for slot in range(12):
            bed.note("shaker", shk, 60, 64 if slot % 3 == 0 else 46, bar, slot * E8, 0.15)
    if s == "S3":
        for slot in range(0, 12, 3):
            bed.note("shaker", shk, 60, 44, bar, (slot + 2) * E8, 0.15)
    if s == "S5":
        for beat in (0, 2):
            bed.note("kick", kick, 36, 50 if beat == 0 else 40, bar, beat, 0.5)
    if s == "S6":
        bed.note("kick", kick, 36, 56, bar, 0, 0.5)

# cello drone: leak -> urgency -> suspension (E2 pedal = tonic pedal under shifting chords)
bed.note("vc_sus", vcs, 40, 48, 13, 2, 6.0)
bed.note("vc_sus", vcs, 40, 58, 15, 0, 12.0)
bed.note("vc_sus", vcs, 47, 50, 18, 0, 3.7)
# glock sparkles
bed.note("glock", glk, 91, 40, 10, 3.67, 1.0); bed.note("glock", glk, 95, 34, 10, 3.67, 1.0)
bed.note("glock", glk, 88, 34, 25, 0, 1.0)

T = bed.tracks
n = len(T["mar"].buf)
T["vc_sus"].buf *= automation(n, [(g.t(13, 2), -14), (g.t(15, 0), -1), (g.t(18, 0), -3), (g.t(18, 4), -30)])[:, None]
stems = {
    "kal_lo": fx(T["kal_lo"].buf, [HighpassFilter(150), LowpassFilter(6000)]) * db2a(-7),
    "kal_hi": fx(T["kal_hi"].buf, [HighpassFilter(250), LowpassFilter(8000)]) * db2a(-5),
    "mar": fx(T["mar"].buf, [HighpassFilter(45), LowpassFilter(5000)]) * db2a(17),
    "vc_sus": fx(T["vc_sus"].buf, [LowpassFilter(1500)]) * db2a(2),
    "glock": fx(T["glock"].buf, [LowpassFilter(9000)]) * db2a(2),
    "shaker": fx(T["shaker"].buf, [HighpassFilter(1500), LowpassFilter(9000)]) * db2a(4),
    "kick": fx(T["kick"].buf, [LowpassFilter(1200)]) * db2a(8),
}
sends = {"kal_lo": 0.3, "kal_hi": 0.45, "mar": 0.25, "vc_sus": 0.3, "glock": 0.6, "shaker": 0.15, "kick": 0.05}
dry = sum(stems.values())
wet = reverb_send(sum(stems[k] * sends[k] for k in stems), room=0.6, damp=0.5)
arc = automation(n, [(0, -1), (g.t(5), 0), (g.t(13), -1), (g.t(15), 1.5), (g.t(18), 0), (g.t(19), -3),
                     (g.t(21), 0), (g.t(25), -0.5), (VIDEO_DUR, -1), (VIDEO_DUR + TAIL, -1)])
mix = voice_carve((dry + wet * 0.55) * arc[:, None])

if __name__ == "__main__":
    for k, v in stems.items():
        print(f"  stem {k:7s} rms {20 * np.log10(np.sqrt((v ** 2).mean()) + 1e-12):6.1f} dBFS")
    finish(bed, mix, AUDIO / "music_marimba.wav")
    bed.write_midi(AUDIO / "music_marimba.mid", [(12, 8, 0.0)], quarter_bpm=g.bpm * 1.5)
