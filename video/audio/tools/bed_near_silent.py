"""Bed "near_silent": the restrained option, closest to the voice-only references.
A constant, loop-perfect room tone (broadband, slightly LF-weighted, like reference 2's -67 dBFS floor
plus a breath of air), and only these events:
  - two soft scale accents: a gentle low swell + soft sub into Cloudflare (35.35) and across the loop
    point (close -> hook at 0.0),
  - a light-shaft shimmer on the breath (45.45),
  - three felt-piano 'dots' for human scale: 'found it' (24.9), the breath (45.45), the close (60.6).
Levels are absolute (normalize=False), set for the -17 LUFS (mono) vo_clean stem; mix.py plays it as-is."""
import sys
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).parent))
from bedkit import (Bed, Grid, fx, reverb_send, finish, TAIL, HighpassFilter, LowpassFilter, HighShelfFilter,  # noqa
                    LowShelfFilter, PeakFilter)
from common import AUDIO, SR, VIDEO_DUR, N_TOTAL, db2a  # noqa: E402
import instruments as I  # noqa: E402
import make_sfx as SFX  # noqa: E402

ROOM_DBFS = -66.0     # room-tone RMS in the bed (about -63 dBFS after mastering; reference 2 floor: -67)
EVENT_LUFS = -33.0    # loudest 1 s of the swells/impacts (about 16-19 LU under the voice after mastering)
PIANO_LUFS = -38.0    # loudest 1 s of the felt-piano dots
g = Grid([4] * 28)
bed = Bed("near_silent", g, seed=41)
pno = I.get("piano")
for n_ in ("piano", "fx"):
    bed.track(n_, 0)

# three felt-piano dots (open fifths / single notes: no harmonic context to clash with)
for (t, notes, vel) in [(24.9, [83], 34), (45.45, [71, 78], 32), (60.6, [74], 30)]:
    for k, p in enumerate(notes):
        bed.tracks["piano"].add(pno.render(p, vel, 3.0), t + 0.09 * k)
        bed.midi["piano"].append((t + 0.09 * k, 3.0, p, vel))

swell, imp, shim = SFX.low_swell(36.7, 46.25), SFX.sub_impact(46.25), SFX.light_shimmer()
for arr in (swell, imp, shim):
    arr /= np.abs(arr).max()
for t_hit in (g.t(15), VIDEO_DUR):
    bed.tracks["fx"].add(swell * 0.8, t_hit - len(swell) / SR)
    bed.tracks["fx"].add(imp * 0.6, t_hit)
bed.tracks["fx"].add(shim * 0.45, 45.3)

T = bed.tracks
n = len(T["piano"].buf)
piano = fx(T["piano"].buf, [HighpassFilter(80), LowpassFilter(3500), HighShelfFilter(1600, -3, 0.7)])
fxs = fx(T["fx"].buf, [HighpassFilter(28)])
from common import short_term_lufs  # noqa: E402
wet_p = reverb_send(piano, room=0.8, damp=0.5, post_lp=6000)
wet_f = reverb_send(fxs, room=0.8, damp=0.5, post_lp=6000)
pn, fz = piano + wet_p * 0.5, fxs + wet_f * 0.15
_, st_p = short_term_lufs(pn, win=1.0, hop=0.1)
_, st_f = short_term_lufs(fz, win=1.0, hop=0.1)
events = pn * db2a(PIANO_LUFS - st_p.max()) + fz * db2a(EVENT_LUFS - st_f.max())

# loop-perfect room tone over exactly 70.7 s (FFT-circular), zero in the render tail
room = np.zeros((n, 2))
for ch in range(2):
    base = SFX.circ_noise(N_TOTAL, 40, 7000, 500 + ch, tilt_db_oct=-3.0)
    air = SFX.circ_noise(N_TOTAL, 3000, 10000, 510 + ch) * 0.25
    drift = 1 + 0.12 * SFX.periodic_env(N_TOTAL, [(3, 0.6), (7, 0.3)], 520 + ch)
    room[:N_TOTAL, ch] = (base + air) * drift
room *= db2a(ROOM_DBFS) / np.sqrt((room[:N_TOTAL] ** 2).mean())

mix = room + events

if __name__ == "__main__":
    finish(bed, mix, AUDIO / "music_near_silent.wav", normalize=False, glue=False)
    bed.write_midi(AUDIO / "music_near_silent.mid", [(4, 4, 0.0)])
