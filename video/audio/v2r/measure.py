"""How far a sound sits under the narration, measured the same way in sfx.py (to set each cue's gain) and premix.py
(to check the result): broadband = K-weighted momentary loudness (400 ms); band = 1-4 kHz RMS (400 ms), where the
voice's diction lives (a male voice has ~15 dB less energy there than in its 120-1000 Hz body, so a click that is
15 dB under the voice broadband can still sit ON the voice in 1-4 kHz)."""
from __future__ import annotations

import numpy as np

from dsp import SR, VOICE, N_FILM, bp, load, short_term_lufs, n_of, st
import sheet

HOP = 0.01
BAND = (1000.0, 4000.0)


def speech_mask(t):
    sp = np.zeros(len(t), bool)
    for (a, b) in sheet.VOICED:
        sp |= (t >= a + 0.2) & (t <= b - 0.2)
    return sp


def band_rms(x, win=0.4, hop=HOP, band=BAND):
    m = st(x).mean(axis=1)
    b = bp(m, band[0], band[1], 4)
    w, h = n_of(win), n_of(hop)
    c = np.concatenate([[0.0], np.cumsum(b ** 2)])
    idx = np.arange(0, max(1, len(b) - w), h)
    e = 10 * np.log10((c[idx + w] - c[idx]) / w + 1e-20)
    return (idx + w / 2) / SR, e


def voice_tracks():
    v = load(VOICE, mono=True)
    v = np.pad(v, (0, max(0, N_FILM - len(v))))[:N_FILM]
    vs = np.stack([v, v], 1)
    t, lv = short_term_lufs(vs, win=0.4, hop=HOP)
    tb, lb = band_rms(vs)
    k = min(len(t), len(tb))
    t, lv, lb = t[:k], lv[:k], lb[:k]
    sp = speech_mask(t)
    return {"vs": vs, "t": t, "lv": lv, "lb": lb, "sp": sp, "vref": float(np.median(lv[sp])),
            "bref": float(np.median(lb[sp]))}


def cue_levels(y):
    """a cue's loudest 400 ms: broadband (momentary LUFS) and in the 1-4 kHz band (dB RMS), at gain 1."""
    z = np.concatenate([np.zeros((n_of(0.4), 2)), st(y), np.zeros((n_of(0.4), 2))])
    _, l = short_term_lufs(z, win=0.4, hop=HOP)
    _, b = band_rms(z)
    return float(l.max()), float(b.max())


def local_voice(V, t0, dur):
    """the voice's mean level (broadband, band) over the speech frames the cue overlaps; None = the cue is in a pause."""
    m = (V["t"] >= t0 - 0.05) & (V["t"] <= t0 + min(dur, 0.6)) & V["sp"]
    if not m.any():
        return None
    return float(np.mean(V["lv"][m])), float(np.mean(V["lb"][m]))
