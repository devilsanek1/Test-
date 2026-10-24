"""Bed "cinematic" (nuanced): a warm, modern explainer with a touch of space. B minor / D major.
v3 = fitted to the NEW voice (assets/vo_v2_eleven.wav, 78.0 s loop): 95.4 BPM, 28 bars with phrase-end 5/4 and 6/4
bars so section lines land on the new word times (leak 32.71, Cloudflare 38.37, suspension 46.55, breath 49.69,
rebuild 55.36, close 66.68). v3 is also subtler: the hook (bars 1-4, 0-10.7 s) is air only, the pulse enters softly
at bar 5, the close thins back to air only, and only the Cloudflare accent remains (softened).

Core: a soft felt-piano 8th-note pulse (TikTok momentum) + a felt-piano motif (human scale).
Space: warm, quiet low strings (contrabass non-vibrato + cello, gentle bar-length dynamics, no big swells),
pianissimo high violins / bowed vibraphone as air, celesta glints. Leak/urgency: the piano pulse stops on
"Except", soft string spiccato takes over, then both drive the numbers. One soft 'scale' accent
(gentle low swell + soft sub impact) into Cloudflare; no accent at the loop point.
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

# v3 (new ElevenLabs voice, 78.0 s loop): constant 95.4 BPM; the extra beats sit at phrase ends (5/4, 6/4
# bars) so the section lines land on the new word times: leak 32.71 (Except 33.12), Cloudflare 38.37
# (38.72), suspension 46.55 (evening. 46.72), breath 49.69 (So 49.76), rebuild 55.36, close 66.68 (And 66.88).
BPB = [4, 4, 4, 5, 4, 4, 4, 6, 4, 4, 4, 5, 4, 5, 4, 4, 5, 5, 4, 5, 4, 4, 4, 6, 4, 4, 4, 6]
g = Grid(BPB)


PMAX = 42   # keep every piano note in the soft (felt) velocity layer: the next layer is ~12 dB louder


def nb(bar):
    return BPB[bar - 1]


def locate(t):
    """time (s) -> (bar, beat) on the grid"""
    beats = t / g.beat
    bar = int(np.searchsorted(g.starts, beats, side="right"))
    return bar, beats - g.starts[bar - 1]
bed = Bed("cinematic", g, seed=31)

CH = {1: "Bmadd9", 2: "Gmaj7", 3: "D/F#", 4: "Asus4", 5: "Bm", 6: "Gmaj7", 7: "D", 8: "A", 9: "G", 10: "D/F#",
      11: "Em7", 12: "Asus4", 13: "Gmaj7", 14: "F#sus4", 15: "Bm", 16: "Bm/A", 17: "Gmaj7", 18: "F#7sus4",
      19: "Gmaj9", 20: "Em9", 21: "Bm", 22: "Gmaj7", 23: "D", 24: "A", 25: "Em7", 26: "Gmaj7", 27: "Em9",
      28: "F#sus4"}
CH2 = {4: (2, "A"), 12: (2, "A"), 14: (2, "F#7")}

PIANO_DB, PULSE_DB, LOW_DB, AIR_DB, SPIC_DB, CEL_DB, ACC_DB = 9.0, 3.0, -2.0, -5.0, -2.0, 0.0, -12.0


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
# v3: no pulse in the hook (bars 1-4 = air only); it enters softly at bar 5 (10.69 s, under "...websites.",
# just before "Fixing a bug") and leaves during the close (bars 25-26) so the loop seam is air -> air.
for bar in range(1, 29):
    s = sec(bar)
    if s in ("S1", "S4", "S6", "S7") or bar >= 27:
        continue
    n8 = int(nb(bar) * 2)
    accents = {8: (0, 3, 6), 10: (0, 3, 6, 8), 12: (0, 3, 6, 9)}[n8]
    for k in range(n8):
        _, pcs, _ = ch(bar, k / 2)
        ts = tones(pcs, 62, 74)
        lo_, hi_ = ts[0], ts[min(2, len(ts) - 1)]
        acc = 7 if k in accents else 0
        base = {"S2": 32, "S3": 34, "S5": 38, "S8": 33, "S9": 30}[s]
        base += {5: -7, 6: -3, 25: -3, 26: -7}.get(bar, 0)
        bed.note("pulse", pno, lo_ if k % 2 == 0 else hi_, base + acc, bar, k / 2, 0.45, vmax=PMAX)

# ------------------------------------------------------------------ felt-piano motif (human scale)
MOTIF = [  # (bar, beat, midi, dur_beats, vel)
    (6, 2, 83, 1, 44), (6, 3, 81, .5, 40), (6, 3.5, 78, 1.5, 40), (7, 2, 81, 1, 40), (7, 3, 78, 1, 38),
    (8, 0, 76, 2, 40), (8, 2, 81, 2, 40),
    (9, 0, 86, 1.5, 46), (9, 1.5, 83, .5, 42), (9, 2, 81, 2, 42), (10, 0, 78, 1.5, 42), (10, 1.5, 81, .5, 40),
    (10, 2, 86, 2, 44), (11, 0, 88, 1, 46), (11, 1, 86, .5, 42), (11, 1.5, 83, .5, 40), (11, 2, 79, 2, 40),
    (12, 0, 81, 2, 42), (12, 2, 85, 2, 44),
    (18, 0, 83, 2, 40), (18, 2, 85, 2, 38),
    (19, 2, 81, 1, 32), (19, 3, 83, 1, 32), (20, 0, 86, 2, 32), (20, 2, 83, 2, 30),
    (22, 2, 83, 1, 42), (22, 3, 81, .5, 38), (22, 3.5, 78, 1.5, 38), (23, 2, 81, 1, 40), (23, 3, 78, 1, 38),
    (24, 0, 76, 2, 40), (24, 2, 81, 2, 40),
    (25, 0, 83, 1.5, 36), (25, 1.5, 81, .5, 34), (25, 2, 79, 2, 34), (26, 0, 78, 2, 33), (26, 2, 74, 2, 32),
    (27, 0, 76, 2, 31), (27, 2, 78, 1, 30), (27, 3, 79, 2, 30)]
for (bar, beat, p, d, v) in MOTIF:
    bed.note("motif", pno, p, v, bar, beat, d, vmax=PMAX)
# breath: one rolled chord, the only thing besides the air
for k, p in enumerate(tones(ch(19)[1], 62, 76)[:4]):
    bed.note("breath", pno, p, 30 - k, 19, 0.12 * k, nb(19) - 0.2)
for k, p in enumerate(tones(ch(20)[1], 62, 76)[:4]):
    bed.note("breath", pno, p, 28 - k, 20, 0.12 * k, nb(20) - 0.2)

# ------------------------------------------------------------------ warm low strings (quiet, sustained)
for bar in range(1, 29):
    s = sec(bar)
    _, pcs, bass = ch(bar)
    if (s in ("S2", "S3", "S5", "S8") or bar in (13, 14, 25, 26)) and bar != 5:   # bar 5: the pulse enters alone
        v = 46 if s in ("S5",) or bar in (13, 14) else 36 if bar in (5, 26) else 40
        bed.note("low", cbs, nearest(bass, 36), v, bar, 0, nb(bar))
    if s in ("S3", "S5", "S8") or bar in (13, 14):
        fifth = tones(pcs, 50, 62)
        bed.note("cello", vcs, fifth[len(fifth) // 2], 40, bar, 0, nb(bar))
    if bar == 18:
        bed.note("low", cbs, nearest(6, 36), 40, bar, 0, nb(bar) - 0.4)
    if bar == 19:
        bed.note("low", cbs, nearest(7, 36), 34, bar, 0, nb(19) + nb(20) - 0.4)

# ------------------------------------------------------------------ air: pp high violins + bowed vibraphone
# the hook (bars 1-4) and the close (bars 27-28) are air only: the loop seam is air -> air
for bar in (1, 3, 9, 11, 15, 17, 21, 23, 25, 27):
    _, pcs, _ = ch(bar)
    hi = tones(pcs, 78, 90)
    two = nb(bar) + nb(bar + 1) - 0.2
    bed.note("air", vls, hi[-1], 30 if bar in (1, 3, 27) else 34, bar, 0, two, pan=-0.35)
    if bar in (9, 15, 21):
        bed.note("air", vls, hi[max(0, len(hi) - 3)], 32, bar, 0, two, pan=0.35)
for bar in (1, 5, 19, 25, 27):
    _, pcs, _ = ch(bar)
    bed.note("air", vib, tones(pcs, 76, 88)[-1], 38 if bar in (1, 27) else 44, bar, 0, nb(bar) + nb(bar + 1) - 0.5,
             pan=0.3)

# ------------------------------------------------------------------ spiccato: leak creep -> urgency pulse
for bar in (13, 14, 15, 16, 17):
    step = 0.5 if bar in (13, 15, 16) else 0.25 if bar == 14 else 0.5
    start = 2.0 if bar == 13 else 0.0
    for k, beat in enumerate(np.arange(start, nb(bar), step)):
        _, pcs, bass = ch(bar, beat)
        root = nearest(bass, 47)
        v = 36 + (k * 1.5 if bar in (13, 14) else (6 if beat % 1 == 0 else 0)) + (bar - 13) * 2
        bed.note("spic", vcp, root, v, bar, beat, step)
        if bar >= 14:
            up = tones(pcs, 62, 71)
            bed.note("spic", vlp, up[k % len(up)], v - 4, bar, beat, step, pan=0.3)

# ------------------------------------------------------------------ celesta glints (GeneralUser GS)
fb, fbeat = locate(27.20)             # "found" in the new take
cel = [(fb, fbeat, 2.0, 90, 50), (fb, fbeat, 2.0, 95, 44), (9, 0, 1.5, 98, 34), (11, 0.5, 1, 100, 32),
       (21, 0, 1.5, 98, 34), (25, 0, 2, 95, 30)]
bed.sf2_track("celesta", cel, program=8, gain_db=0)

# ------------------------------------------------------------------ one soft scale accent (v3)
# Only Cloudflare keeps a (softened) swell + sub; the loop-point thump at 0.0 is gone (it fought the hook).
swell, imp = SFX.low_swell(36.7, 46.25), SFX.sub_impact(46.25)  # in-key sub (F#1)
for t_hit in (g.t(15),):
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
arc = automation(n, [(0, -4), (g.t(5), -3), (g.t(7), 0), (g.t(13), -1.5), (g.t(15), 1.0), (g.t(18), -0.5),
                     (g.t(19), -2.5), (g.t(21), 0), (g.t(25), -1), (g.t(27), -3), (VIDEO_DUR, -4),
                     (VIDEO_DUR + TAIL, -4)])
mix = voice_carve((dry + wet * 0.6) * arc[:, None])

if __name__ == "__main__":
    for k, v in stems.items():
        print(f"  stem {k:8s} rms {20 * np.log10(np.sqrt((v ** 2).mean()) + 1e-12):6.1f} dBFS")
    finish(bed, mix, AUDIO / "music_cinematic.wav")
    sigs, prev = [], None
    for b_, n_ in enumerate(BPB, start=1):
        if n_ != prev:
            sigs.append((n_, 4, g.t(b_)))
            prev = n_
    bed.write_midi(AUDIO / "music_cinematic.mid", sigs)
