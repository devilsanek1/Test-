"""Bed 2 "lofi": lo-fi nylon plucks + tine electric piano + upright bass + soft brushed kick.
F minor, 71.29 BPM, swung 16ths. 22 bars: 4/4 except two 2/4 'hiccup' bars (bar 11 = the beat before
"Cloudflare", bar 15 = the breath "So now comes step two") so every story beat lands on a downbeat:
bar 10 = 30.30 s (leak), bar 12 = 35.35 s (Cloudflare), bar 14 beat 2 = 42.93 s (suspension),
bar 15 = 45.45 s (breath), bar 17 = 50.5 s (rebuild), bar 20 = 60.6 s (close)."""
import sys
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).parent))
from bedkit import (Bed, Grid, chord, tones, nearest, automation, fx, reverb_send, voice_carve, finish, TAIL,
                    HighpassFilter, LowpassFilter, HighShelfFilter, LowShelfFilter, PeakFilter, Compressor)  # noqa
from common import AUDIO, SR, VIDEO_DUR, db2a  # noqa: E402
from sampler import load_instrument  # noqa: E402

BPB = [4] * 10 + [2] + [4] * 3 + [2] + [4] * 7
g = Grid(BPB)
bed = Bed("lofi", g, seed=5)
NB = len(BPB)

CH = {1: "Fm9", 2: "Dbmaj7", 3: "Bbm9", 4: "Fm9", 5: "Dbmaj7", 6: "Bbm9", 7: "Abmaj7", 8: "Ebadd9/G", 9: "Dbmaj7",
      10: "Bbm9", 11: "C7b9", 12: "Fm9", 13: "Dbmaj7", 14: "Bbm9", 15: "Dbmaj7", 16: "Abmaj7", 17: "Fm9",
      18: "Dbmaj7", 19: "Abmaj7", 20: "Bbm9", 21: "Dbmaj7", 22: "C7sus4"}
CH2 = {3: (2, "C7sus4"), 6: (2, "C7"), 9: (2, "C7sus4"), 14: (1, "C7sus4"), 16: (2, "Ebadd9/G"), 19: (2, "Ebadd9/G")}


def ch(bar, beat=0.0):
    if bar in CH2 and beat >= CH2[bar][0]:
        return chord(CH2[bar][1])
    return chord(CH[bar])


def sec(bar):
    if bar <= 3: return "intro"
    if bar <= 6: return "groove"
    if bar <= 9: return "discover"
    if bar <= 11: return "leak"
    if bar <= 13: return "urgency"
    if bar == 14: return "susp"
    if bar <= 16: return "breath"
    if bar <= 19: return "rebuild"
    return "close"


SW = 0.08  # swing: offbeat 16ths pushed late by this many beats


def sw(beat):
    """swing offbeat 16ths"""
    q = round(beat * 4)
    return beat + (SW if q % 2 == 1 and abs(beat * 4 - q) < 1e-6 else 0.0)


ep, pluck, bass, drum = [], [], [], []
# ------------------------------------------------------------------ electric piano chords
for bar in range(1, NB + 1):
    s = sec(bar); nb = BPB[bar - 1]
    changes = [0.0] + ([CH2[bar][0]] if bar in CH2 else [])
    for i, c0 in enumerate(changes):
        c1 = changes[i + 1] if i + 1 < len(changes) else nb
        _, pcs, _ = ch(bar, c0)
        vo = tones(pcs, 56, 72)[:4]
        if s in ("intro", "breath", "susp", "close") or (s == "leak" and bar == 10):
            vel = (46 if bar == 1 else 50) if s != "breath" else (36 if bar == 15 else 42)
            for k, p in enumerate(vo):
                ep.append((bar, c0 + 0.02 * k, c1 - c0 - 0.05, p, vel - 2 * k))
        elif s == "urgency":   # off-beat stabs
            for beat in np.arange(c0 + 0.5, c1, 1.0):
                for p in vo:
                    ep.append((bar, sw(beat), 0.35, p, 46))
        else:  # groove: chord on 1 + anticipation on the 'a' of 2
            for (beat, d, v) in [(c0, 1.6, 52), (c0 + 1.75, c1 - c0 - 1.8, 44)]:
                if beat < c1:
                    for p in vo:
                        ep.append((bar, sw(beat), d, p, v))
        if s == "leak" and bar == 11:  # tension: repeated stabs
            for beat in (0.0, 0.5, 1.0, 1.5):
                for p in vo:
                    ep.append((bar, beat, 0.4, p, 42 + int(beat * 8)))

# ------------------------------------------------------------------ nylon plucks (melody / arps)
MOT = [(0.0, 3, 62), (0.75, 2, 52), (1.5, 1, 56), (2.5, 2, 50), (3.0, 0, 54)]      # descending 'sigh'
MOT2 = [(0.5, 1, 52), (1.0, 2, 56), (1.75, 3, 58), (2.5, 4, 54), (3.25, 3, 50)]   # rising 'question'
for bar in range(1, NB + 1):
    s = sec(bar); nb = BPB[bar - 1]
    def cellp(beat, center=74):
        return tones(ch(bar, beat)[1], center - 6, center + 12)
    pat = []
    if s in ("intro", "close"):
        pat = MOT if bar % 2 == 1 else MOT2
        if bar == 22:
            pat = MOT2
    elif s in ("groove", "rebuild"):
        pat = MOT2 if bar % 2 == 0 else [(0.75, 2, 50), (2.25, 3, 52), (3.5, 1, 48)]
    elif s == "discover":
        pat = [(0.0, 3, 60), (0.5, 4, 54), (1.0, 3, 52), (1.75, 2, 56), (2.5, 3, 56), (3.0, 4, 58), (3.5, 2, 50)]
    elif s == "leak":
        pat = [(b, 2, 44 + int(b * 4)) for b in np.arange(1.0 if bar == 10 else 0.0, nb, 0.5)]
    elif s == "urgency":
        pat = [(k / 4, [0, 2, 1, 3][k % 4], 46 + (8 if k % 4 == 0 else 0)) for k in range(int(nb * 4))]
    elif s == "susp":
        pat = [(1.0, 3, 54), (2.5, 2, 46)]
    elif bar == 16:
        pat = [(1.0, 3, 46), (2.0, 2, 44), (3.0, 1, 46), (3.5, 2, 48)]
    for (beat, idx, v) in pat:
        if beat >= nb:
            continue
        c = cellp(beat)
        pluck.append((bar, sw(beat), 0.6, c[min(idx, len(c) - 1)], v))
# loop hand-over: soft chord re-strike + pickup into bar 1
pluck.append((22, 3.5, 0.3, 77, 48)); pluck.append((22, 3.75 + SW, 0.4, 79, 52))
for k, p in enumerate(tones(chord("C7sus4")[1], 56, 72)[:4]):
    ep.append((22, 2.0 + 0.02 * k, 1.95, p, 40))

# ------------------------------------------------------------------ upright bass
for bar in range(1, NB + 1):
    s = sec(bar); nb = BPB[bar - 1]
    def bn(beat, vel, d=0.9, pc=None, oct=0):
        _, pcs, b = ch(bar, beat)
        bass.append((bar, sw(beat), d, nearest(b if pc is None else pc, 36) + 12 * oct, vel))
    if s in ("groove", "discover", "rebuild"):
        bn(0, 92, 1.4); bn(1.75, 70, 0.5); bn(2.0, 84, 1.2)
        if bar in CH2: bn(CH2[bar][0], 82, 1.2)
        bn(3.5, 66, 0.4, pc=(ch(bar, 3.5)[0] + 7) % 12)
    elif s == "urgency":
        for k in range(nb * 2):
            bn(k / 2, 84 if k % 2 == 0 else 66, 0.4, oct=1 if k % 4 == 3 else 0)
    elif s == "leak":
        if bar == 10:
            bn(0, 80, 3.5)
        else:
            for k in range(4):
                bn(k / 2, 70 + 4 * k, 0.4, pc=0)
    elif s in ("intro", "close", "susp", "breath"):
        if bar != 15:
            bn(0, 74 if s != "breath" else 54, min(3.0, nb - 0.1))
        if bar == 22:
            bn(2.0, 60, 1.9)

# ------------------------------------------------------------------ drums (GeneralUser 'Jazz' kit): kick + side stick + hats
KICK, RIM, HAT, PHAT = 36, 37, 42, 44
for bar in range(1, NB + 1):
    s = sec(bar); nb = BPB[bar - 1]
    if s in ("groove", "discover", "rebuild") or (s == "close" and bar == 20):
        v = 0 if s != "close" else -8
        for (beat, vel) in [(0, 96), (1.75, 70), (2.5, 84)]:
            drum.append((bar, sw(beat), 0.2, KICK, vel + v))
        for beat in (1, 3):
            drum.append((bar, beat, 0.2, RIM, 70 + v))
        for k in range(8):
            drum.append((bar, sw(k / 2), 0.1, HAT if s != "discover" or k % 2 else PHAT, (48 if k % 2 else 58) + v))
    elif s == "intro" and bar >= 2:
        drum.append((bar, 0, 0.2, KICK, 66))
    elif s == "urgency":
        for beat in range(nb):
            drum.append((bar, beat, 0.2, KICK, 88 if beat % 2 == 0 else 72))
        for beat in (1, 3):
            drum.append((bar, beat, 0.2, RIM, 72))
        for k in range(nb * 4):
            drum.append((bar, sw(k / 4), 0.05, HAT, 40 + (14 if k % 4 == 0 else 0)))
    elif s == "susp":
        drum.append((bar, 0, 0.2, KICK, 92))
    elif s == "close" and bar == 21:
        drum.append((bar, 0, 0.2, KICK, 64))

bed.sf2_track("ep", ep, program=4, gain_db=0)
bed.sf2_track("pluck", pluck, program=24, gain_db=0)
bed.sf2_track("bass", bass, program=32, gain_db=0)
bed.sf2_track("drums", drum, program=32, bank=128, is_drum=True, gain_db=0)

# real shaker (VCSL, CC0) in the groove sections
shk = load_instrument("shaker", "VCSL/Idiophones/Struck Idiophones/Shaker, Small/Mid_ShakerHighFaster_*.wav",
                      lambda n: (60, 1, 1 + n.count("Up")), release=0.05, max_len=0.6)
bed.track("shaker", 70, pan=0.35)
for bar in range(1, NB + 1):
    s = sec(bar)
    if s in ("discover", "rebuild", "urgency"):
        for k in range(BPB[bar - 1] * 2):
            bed.note("shaker", shk, 60, 70 if k % 2 else 50, bar, sw(k / 2 + 0.25), 0.2)

# ------------------------------------------------------------------ lo-fi bus
T = bed.tracks
n = len(T["ep"].buf)
tt = np.arange(n) / SR


def wow(x, depth_ms=1.1, flutter_ms=0.08):
    """Tape wow/flutter as a loop-periodic fractional delay (frequencies are k/70.7 Hz)."""
    f1, f2 = 35 / VIDEO_DUR, 375 / VIDEO_DUR
    d = (2.0 + depth_ms * np.sin(2 * np.pi * f1 * tt) + flutter_ms * np.sin(2 * np.pi * f2 * tt)) * 1e-3 * SR
    idx = np.arange(n) - d
    i0 = np.floor(idx).astype(int); fr = idx - i0
    i0 = np.clip(i0, 0, n - 2)
    return x[i0] * (1 - fr)[:, None] + x[i0 + 1] * fr[:, None]


def tape(x, drive=1.6):
    return np.tanh(x * drive) / np.tanh(drive)


# 'Except' filter dip on the keys: bar 10-11 closes the low-pass, opens on Cloudflare
lp_keys = automation(n, [(g.t(10, 0), 0), (g.t(10, 0.5), -5), (g.t(11, 1.5), -2), (g.t(12, 0), 0)])
stems = {
    "ep": fx(T["ep"].buf, [HighpassFilter(120), LowpassFilter(4500), PeakFilter(400, -2, 1.0)]) * db2a(6) * lp_keys[:, None],
    "pluck": fx(T["pluck"].buf, [HighpassFilter(200), LowpassFilter(6000)]) * db2a(3),
    "bass": fx(T["bass"].buf, [HighpassFilter(35), LowpassFilter(1200), Compressor(-22, 3.0, 15, 150)]) * db2a(-7),
    "drums": fx(T["drums"].buf, [HighpassFilter(40), LowpassFilter(5000), Compressor(-20, 2.5, 5, 80)]) * db2a(2),
    "shaker": fx(T["shaker"].buf, [HighpassFilter(2000), LowpassFilter(9000)]) * db2a(-2),
}
sends = {"ep": 0.35, "pluck": 0.45, "bass": 0.0, "drums": 0.08, "shaker": 0.2}
music = sum(stems[k] for k in ("ep", "pluck", "bass"))
music = tape(wow(music) * db2a(4)) * db2a(-4)
dry = music + stems["drums"] + stems["shaker"]
wet = reverb_send(sum(stems[k] * sends[k] for k in stems), room=0.5, damp=0.7, post_lp=5000)
mix = dry + wet * 0.5

# vinyl: hiss + sparse crackle (seeded, stationary -> loop safe)
rng = np.random.default_rng(3)
hiss = rng.standard_normal((n, 2))
hiss = fx(hiss, [HighpassFilter(800), LowpassFilter(7000)]) * db2a(-66)
crk = np.zeros((n, 2))
pos = rng.integers(0, n, size=int(6 * n / SR))
crk[pos, rng.integers(0, 2, len(pos))] = rng.choice([-1, 1], len(pos)) * rng.uniform(0.02, 0.15, len(pos)) ** 2
crk = fx(crk, [HighpassFilter(1500), LowpassFilter(6000)]) * db2a(-10)
mix = fx(mix + hiss + crk, [HighpassFilter(38), LowpassFilter(9000)])
# section dynamics (loop-safe: starts and ends at the same gain)
arc = automation(n, [(0, -2), (g.t(4), 0), (g.t(10), -1), (g.t(11), 0), (g.t(12), 2), (g.t(14, 1), 2),
                     (g.t(14, 1.6), -1), (g.t(15), -4), (g.t(16, 2), -3), (g.t(17), 0), (g.t(20), -0.5),
                     (g.t(22), -1.5), (VIDEO_DUR, -2), (VIDEO_DUR + TAIL, -2)])
mix = voice_carve(mix * arc[:, None])

if __name__ == "__main__":
    for k, v in stems.items():
        print(f"  stem {k:7s} rms {20 * np.log10(np.sqrt((v ** 2).mean()) + 1e-12):6.1f} dBFS")
    finish(bed, mix, AUDIO / "music_lofi.wav")
    ts, acc = [], 0.0
    for b in BPB:
        ts.append((b, 4, acc * g.beat)); acc += b
    # keep only signature changes
    sig = [ts[0]] + [ts[i] for i in range(1, len(ts)) if ts[i][0] != ts[i - 1][0]]
    bed.write_midi(AUDIO / "music_lofi.mid", sig)
