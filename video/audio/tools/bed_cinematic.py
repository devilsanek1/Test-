"""Bed "cinematic" (nuanced): a warm, modern explainer with a touch of space. B minor / D major, 95.05 BPM,
4/4, 28 bars on the shared grid (story beats on bar lines: 30.30 leak, 35.35 Cloudflare, 42.93 suspension,
45.45 breath, 50.5 rebuild, 60.6 close).

Core: a soft felt-piano 8th-note pulse (TikTok momentum) + a felt-piano motif (human scale).
Space: warm, quiet low strings (contrabass non-vibrato + cello, gentle bar-length dynamics, no big swells),
pianissimo high violins / bowed vibraphone as air, celesta glints. Leak/urgency: the piano pulse stops on
"Except", soft string spiccato takes over, then both drive the numbers. Exactly two soft 'scale' accents
(gentle low swell + soft sub impact): into Cloudflare and across the loop point (close -> hook).
No trailer drums, no orchestral swells; low-mids kept clean (cello/bass low-passed, 160 Hz dip)."""
import sys
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).parent))
from bedkit import (Bed, Grid, chord, tones, nearest, automation, fx, reverb_send, voice_carve, finish, TAIL,
                    HighpassFilter, LowpassFilter, HighShelfFilter, LowShelfFilter, PeakFilter, Compressor)  # noqa
from common import AUDIO, SR, VIDEO_DUR, db2a  # noqa: E402
import instruments as I  # noqa: E402
import make_sfx as SFX  # noqa: E402

g = Grid([4] * 28)
bed = Bed("cinematic", g, seed=31)

CH = {1: "Bmadd9", 2: "Gmaj7", 3: "D/F#", 4: "Asus4", 5: "Bm", 6: "Gmaj7", 7: "D", 8: "A", 9: "G", 10: "D/F#",
      11: "Em7", 12: "Asus4", 13: "Gmaj7", 14: "F#sus4", 15: "Bm", 16: "Bm/A", 17: "Gmaj7", 18: "F#7sus4",
      19: "Gmaj9", 20: "Em9", 21: "Bm", 22: "Gmaj7", 23: "D", 24: "A", 25: "Em7", 26: "Gmaj7", 27: "Em9",
      28: "F#sus4"}
CH2 = {4: (2, "A"), 12: (2, "A"), 14: (2, "F#7")}

PIANO_DB, PULSE_DB, LOW_DB, AIR_DB, SPIC_DB, CEL_DB, ACC_DB = 9.0, 3.0, -2.0, -5.0, -2.0, 0.0, -7.0


def ch(bar, beat=0.0):
    if bar in CH2 and beat >= CH2[bar][0]:
        return chord(CH2[bar][1])
    return chord(CH[bar])


def sec(bar):
    for name, (a, b) in {"S1": (1, 4), "S2": (5, 8), "S3": (9, 12), "S4": (13, 14), "S5": (15, 17), "S6": (18, 18),
                         "S7": (19, 20), "S8": (21, 24), "S9": (25, 28)}.items():
        if a <= bar <= b:
            return name


pno, cbs, vcs, vls, vib = I.get("piano"), I.get("cb_sus"), I.get("vc_sus"), I.get("vln_sus"), I.get("vibes_bowed")
vcp, vlp = I.get("vc_spic"), I.get("vla_spic")
for n_, prog, pan in [("motif", 0, 0.12), ("pulse", 0, -0.1), ("low", 43, 0.0), ("cello", 42, -0.2),
                      ("air", 48, 0.0), ("spic", 48, 0.15), ("accent", 0, 0.0), ("breath", 0, 0.0)]:
    bed.track(n_, prog, pan=pan)

# ------------------------------------------------------------------ felt-piano pulse (8ths, 3+3+2 accents)
for bar in range(1, 29):
    s = sec(bar)
    if s in ("S4", "S6", "S7"):
        continue
    for k in range(8):
        _, pcs, _ = ch(bar, k / 2)
        ts = tones(pcs, 62, 74)
        lo_, hi_ = ts[0], ts[min(2, len(ts) - 1)]
        acc = 7 if k in (0, 3, 6) else 0
        base = {"S1": 30, "S2": 32, "S3": 34, "S5": 38, "S8": 33, "S9": 30}[s]
        if s == "S9" and bar >= 27:
            base -= 2
        bed.note("pulse", pno, lo_ if k % 2 == 0 else hi_, base + acc, bar, k / 2, 0.45)

# ------------------------------------------------------------------ felt-piano motif (human scale)
MOTIF = [  # (bar, beat, midi, dur_beats, vel)
    (2, 2, 83, 1, 44), (2, 3, 81, .5, 40), (2, 3.5, 78, 1.5, 40), (3, 2, 74, 1, 38), (3, 3, 76, 1, 40),
    (4, 0, 76, 2, 40), (4, 2, 73, 2, 38),
    (6, 2, 83, 1, 44), (6, 3, 81, .5, 40), (6, 3.5, 78, 1.5, 40), (7, 2, 81, 1, 40), (7, 3, 78, 1, 38),
    (8, 0, 76, 2, 40), (8, 2, 81, 2, 40),
    (9, 0, 86, 1.5, 46), (9, 1.5, 83, .5, 42), (9, 2, 81, 2, 42), (10, 0, 78, 1.5, 42), (10, 1.5, 81, .5, 40),
    (10, 2, 86, 2, 44), (11, 0, 88, 1, 46), (11, 1, 86, .5, 42), (11, 1.5, 83, .5, 40), (11, 2, 79, 2, 40),
    (12, 0, 81, 2, 42), (12, 2, 85, 2, 44),
    (18, 0, 83, 2, 40), (18, 2, 85, 2, 38),
    (19, 2, 81, 1, 32), (19, 3, 83, 1, 32), (20, 0, 86, 2, 32), (20, 2, 83, 2, 30),
    (22, 2, 83, 1, 42), (22, 3, 81, .5, 38), (22, 3.5, 78, 1.5, 38), (23, 2, 81, 1, 40), (23, 3, 78, 1, 38),
    (24, 0, 76, 2, 40), (24, 2, 81, 2, 40),
    (25, 0, 83, 1.5, 40), (25, 1.5, 81, .5, 38), (25, 2, 79, 2, 38), (26, 0, 78, 2, 38), (26, 2, 74, 2, 36),
    (27, 0, 76, 2, 36), (27, 2, 78, 1, 36), (27, 3, 79, 1, 36), (28, 0, 85, 2, 38), (28, 2, 83, 1, 36),
    (28, 3, 78, 1, 36)]
for (bar, beat, p, d, v) in MOTIF:
    bed.note("motif", pno, p, v, bar, beat, d)
# breath: one rolled chord, the only thing besides the air
for k, p in enumerate(tones(ch(19)[1], 62, 76)[:4]):
    bed.note("breath", pno, p, 30 - k, 19, 0.12 * k, 3.8)
for k, p in enumerate(tones(ch(20)[1], 62, 76)[:4]):
    bed.note("breath", pno, p, 28 - k, 20, 0.12 * k, 3.8)

# ------------------------------------------------------------------ warm low strings (quiet, sustained)
for bar in range(1, 29):
    s = sec(bar)
    _, pcs, bass = ch(bar)
    if s in ("S1", "S2", "S3", "S5", "S8", "S9") or bar in (13, 14):
        bed.note("low", cbs, nearest(bass, 36), 46 if s in ("S5",) or bar in (13, 14) else 40, bar, 0, 4.0)
    if s in ("S3", "S5", "S8") or bar in (13, 14):
        fifth = tones(pcs, 50, 62)
        bed.note("cello", vcs, fifth[len(fifth) // 2], 40, bar, 0, 4.0)
    if bar == 18:
        bed.note("low", cbs, nearest(6, 36), 40, bar, 0, 3.6)
    if bar == 19:
        bed.note("low", cbs, nearest(7, 36), 34, bar, 0, 7.6)

# ------------------------------------------------------------------ air: pp high violins + bowed vibraphone
for bar in (1, 3, 9, 11, 15, 17, 21, 23, 25, 27):
    _, pcs, _ = ch(bar)
    hi = tones(pcs, 78, 90)
    bed.note("air", vls, hi[-1], 34, bar, 0, 7.8, pan=-0.35)
    if bar in (9, 15, 21):
        bed.note("air", vls, hi[max(0, len(hi) - 3)], 32, bar, 0, 7.8, pan=0.35)
for bar in (1, 5, 19, 25):
    _, pcs, _ = ch(bar)
    bed.note("air", vib, tones(pcs, 76, 88)[-1], 44, bar, 0, 7.5, pan=0.3)

# ------------------------------------------------------------------ spiccato: leak creep -> urgency pulse
for bar in (13, 14, 15, 16, 17):
    step = 0.5 if bar in (13, 15, 16) else 0.25 if bar == 14 else 0.5
    start = 2.0 if bar == 13 else 0.0
    for k, beat in enumerate(np.arange(start, 4, step)):
        _, pcs, bass = ch(bar, beat)
        root = nearest(bass, 47)
        v = 36 + (k * 1.5 if bar in (13, 14) else (6 if beat % 1 == 0 else 0)) + (bar - 13) * 2
        bed.note("spic", vcp, root, v, bar, beat, step)
        if bar >= 14:
            up = tones(pcs, 62, 71)
            bed.note("spic", vlp, up[k % len(up)], v - 4, bar, beat, step, pan=0.3)

# ------------------------------------------------------------------ celesta glints (GeneralUser GS)
cel = [(10, 3.5, 2.0, 90, 50), (10, 3.5, 2.0, 95, 44), (9, 0, 1.5, 98, 34), (11, 0, 1, 100, 32),
       (21, 0, 1.5, 98, 34), (25, 0, 2, 95, 34)]
bed.sf2_track("celesta", cel, program=8, gain_db=0)

# ------------------------------------------------------------------ two soft scale accents
swell, imp = SFX.low_swell(36.7, 46.25), SFX.sub_impact(46.25)  # in-key sub (F#1 / E1)
for t_hit in (g.t(15), VIDEO_DUR):
    bed.tracks["accent"].add(swell, t_hit - len(swell) / SR)
    bed.tracks["accent"].add(imp, t_hit)

# ------------------------------------------------------------------ mix
T = bed.tracks
n = len(T["pulse"].buf)
felt = [HighpassFilter(70), LowpassFilter(3000), HighShelfFilter(1400, -4, 0.7), LowShelfFilter(220, -3)]
stems = {
    "motif": fx(T["motif"].buf, [HighpassFilter(70), LowpassFilter(4500), HighShelfFilter(2500, -2, 0.7),
                                 LowShelfFilter(220, -3), Compressor(-34, 3.0, 4, 200)]) * db2a(4 + PIANO_DB),
    "pulse": fx(T["pulse"].buf, felt + [LowpassFilter(2200)]) * db2a(2 + PULSE_DB),
    "breath": fx(T["breath"].buf, felt) * db2a(-4),
    "low": fx(T["low"].buf, [HighpassFilter(36), LowpassFilter(600)]) * db2a(2 + LOW_DB),
    "cello": fx(T["cello"].buf, [HighpassFilter(70), LowpassFilter(900), PeakFilter(250, -3, 1.0)]) * db2a(-4 + LOW_DB),
    "air": fx(T["air"].buf, [HighpassFilter(900), LowpassFilter(9000)]) * db2a(-2 + AIR_DB),
    "spic": fx(T["spic"].buf, [HighpassFilter(80), LowpassFilter(3500)]) * db2a(-2 + SPIC_DB),
    "celesta": fx(T["celesta"].buf, [HighpassFilter(500), LowpassFilter(9000)]) * db2a(0 + CEL_DB),
    "accent": fx(T["accent"].buf, [HighpassFilter(28)]) * db2a(-16 + ACC_DB),
}
sends = {"breath": 0.5, "motif": 0.45, "pulse": 0.25, "low": 0.2, "cello": 0.35, "air": 0.8, "spic": 0.25, "celesta": 0.6,
         "accent": 0.2}
dry = sum(stems.values())
wet = reverb_send(sum(stems[k] * sends[k] for k in stems), room=0.78, damp=0.45, post_lp=6500)
arc = automation(n, [(0, -1), (g.t(5), 0), (g.t(13), -1.5), (g.t(15), 1.0), (g.t(18), -0.5), (g.t(19), -2.5),
                     (g.t(21), 0), (g.t(25), -0.5), (VIDEO_DUR, -1), (VIDEO_DUR + TAIL, -1)])
mix = voice_carve((dry + wet * 0.6) * arc[:, None])

if __name__ == "__main__":
    for k, v in stems.items():
        print(f"  stem {k:8s} rms {20 * np.log10(np.sqrt((v ** 2).mean()) + 1e-12):6.1f} dBFS")
    finish(bed, mix, AUDIO / "music_cinematic.wav")
    bed.write_midi(AUDIO / "music_cinematic.mid", [(4, 4, 0.0)])
