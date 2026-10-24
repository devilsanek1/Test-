"""Instrument definitions (all real recorded instruments, CC0):
VSCO-2-CE (Versilian Studios Chamber Orchestra 2 Community Edition) and
VCSL (Versilian Community Sample Library). Both name notes with middle C = C3 (Yamaha), verified
by pitch detection (median offset +12.0 semitones vs scientific naming)."""
from __future__ import annotations

import json
import re
import sys
from functools import lru_cache
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).parent))
from sampler import load_instrument, name_to_midi  # noqa: E402

VSCO = "VSCO-2-CE"
VCSL = "VCSL"


def yam(name):  # Yamaha octave naming -> MIDI
    return name_to_midi(name, middle_c_octave=3)


def _vel_rr(name, vel_pat=r"_v(\d+)", rr_pat=r"_[Rr][Rr](\d+)"):
    v = re.search(vel_pat, name); r = re.search(rr_pat, name)
    return (int(v.group(1)) if v else 1), (int(r.group(1)) if r else 1)


def p_strings(name):
    m = yam(name)
    if m is None:
        return None
    v, r = _vel_rr(name)
    return m, v, r


def p_susvib(name):
    m = yam(name)
    v = int(re.search(r"_v(\d)_", name).group(1))
    r = int(re.search(r"_(\d)\.wav", name).group(1))
    return m, v, r


def p_piano(name):
    m = re.match(r"Player_dyn(\d)_rr(\d)_(\d{3})\.wav", name)
    if not m:
        return None
    return 21 + 2 * int(m.group(3)), int(m.group(1)), int(m.group(2))


def p_marimba(name):
    lay = {"soft": 1, "med": 2, "loud": 3}
    m = re.search(r"_([A-G]#?\d)_(soft|med|loud)_", name)
    return yam(m.group(1)), lay[m.group(2)], 1


# Kalimba (Tanzanian mbira) has its own tuning: use detected pitch per key
KALIMBA_TUNE = {}


def p_kalimba(name):
    m = re.search(r"Main_([A-G]#?\d)_k", name)
    root = yam(m.group(1))
    return root + KALIMBA_TUNE.get(name, 0.0), 1, 1


def p_glock(name):
    lay = {"soft": 1, "medium": 2, "loud": 3}
    m = re.search(r"glock_(soft|medium|loud)_([A-G]#?\d)_(\d+)", name)
    return yam(m.group(2)), lay[m.group(1)], int(m.group(3))


@lru_cache(None)
def get(name):
    L = load_instrument
    if name == "cb_pizz":
        return L(name, f"{VSCO}/Strings/Solo Contrabass/Pizz/*.wav", p_strings, release=0.15, max_len=2.5)
    if name == "vc_pizz":
        return L(name, f"{VSCO}/Strings/Cello Section/pizzT/*.wav", p_strings, release=0.12, max_len=1.8)
    if name == "vla_pizz":
        return L(name, f"{VSCO}/Strings/Viola Section/pizz/*.wav", p_strings, release=0.1, max_len=1.5)
    if name == "vln_pizz":
        return L(name, f"{VSCO}/Strings/Violin Section/Pizz/*.wav", p_strings, release=0.1, max_len=1.2)
    if name == "vc_sus":
        return L(name, f"{VSCO}/Strings/Cello Section/susvib/*.wav", p_susvib, sustained=True, release=0.9)
    if name == "vla_trem":
        return L(name, f"{VSCO}/Strings/Viola Section/trem/*.wav", p_strings, sustained=True, release=0.6)
    if name == "vln_trem":
        return L(name, f"{VSCO}/Strings/Violin Section/Trem/*.wav", p_strings, sustained=True, release=0.6)
    if name == "piano":
        return L(name, f"{VSCO}/Keys/Upright Piano/Player_dyn*_rr1_*.wav", p_piano, sustained=True, release=0.35)
    if name == "marimba":
        return L(name, f"{VCSL}/Idiophones/Struck Idiophones/Marimba/*.wav", p_marimba, release=0.2, max_len=3.0)
    if name == "kalimba":
        _tune_kalimba()
        return L(name, f"{VCSL}/Idiophones/Plucked Idiophones/Kalimba, Tanzania/*.wav", p_kalimba,
                 release=0.25, max_len=3.0)
    if name == "glock":
        return L(name, f"{VCSL}/Idiophones/Struck Idiophones/Glockenspiel/*.wav", p_glock, release=0.3, max_len=3.0)
    raise KeyError(name)


def _tune_kalimba():
    """Detect each kalimba key's real pitch once (pyin), cache to json next to the samples."""
    import glob
    import os
    from common import SAMPLES
    cache = SAMPLES / "kalimba_tuning.json"
    if cache.exists():
        KALIMBA_TUNE.update(json.loads(cache.read_text()))
        return
    import librosa
    import soundfile as sf
    for f in sorted(glob.glob(str(SAMPLES / VCSL / "Idiophones/Plucked Idiophones/Kalimba, Tanzania/*.wav"))):
        nm = os.path.basename(f)
        root = yam(re.search(r"Main_([A-G]#?\d)_k", nm).group(1))
        x, sr = sf.read(f, always_2d=True); x = x.mean(1)
        i = int(np.argmax(np.abs(x) > np.abs(x).max() * 0.1))
        seg = librosa.resample(x[i + int(0.02 * sr): i + int(0.5 * sr)], orig_sr=sr, target_sr=22050)
        f0, vf, _ = librosa.pyin(seg, fmin=40, fmax=2000, sr=22050, frame_length=2048)
        off = 0.0
        if vf.sum() > 2:
            det = float(librosa.hz_to_midi(np.nanmedian(f0[vf])))
            # accept octave errors by folding to nearest octave of the named note
            d = det - root
            d -= 12 * round(d / 12)
            if abs(d) < 1.0:
                off = round(d, 3)
        KALIMBA_TUNE[nm] = off
    cache.write_text(json.dumps(KALIMBA_TUNE, indent=1))
