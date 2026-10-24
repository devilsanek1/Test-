"""Shared helpers for the php2shell sound pipeline (sound lane).

All audio is float32/float64 numpy, shape (n,) mono or (n, 2) stereo, 48 kHz.
"""
from __future__ import annotations

import json
import os
import subprocess
from pathlib import Path

import numpy as np
import pyloudnorm as pyln
import scipy.signal as ss
import soundfile as sf
import soxr

SR = 48000
VIDEO_DUR = 70.7  # seconds, the video (and loop) length
N_TOTAL = int(round(VIDEO_DUR * SR))  # 3,393,600 samples

ROOT = Path(__file__).resolve().parents[2]  # /home/user/Test-/video
AUDIO = ROOT / "audio"
ASSETS = ROOT / "assets"
# Downloaded sample libraries / SoundFont (not committed; see docs/sound_credits.md)
SAMPLES = Path(os.environ.get(
    "SOUND_SAMPLES",
    "/tmp/claude-0/-home-user-Test-/59905704-1101-50eb-baa8-b5e4e9d5d2d2/scratchpad/sound/dl"))


def db2a(db):
    return 10.0 ** (np.asarray(db) / 20.0)


def a2db(a, floor=1e-12):
    return 20.0 * np.log10(np.maximum(np.abs(a), floor))


def load(path, sr=SR, mono=False):
    """Load any audio file (wav via soundfile, others via ffmpeg) resampled to sr."""
    path = str(path)
    try:
        x, fs = sf.read(path, dtype="float64", always_2d=True)
    except Exception:
        raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-f", "f32le", "-ac", "2",
                              "-ar", str(sr), "-"], capture_output=True, check=True).stdout
        x = np.frombuffer(raw, dtype=np.float32).astype(np.float64).reshape(-1, 2)
        fs = sr
    if fs != sr:
        x = soxr.resample(x, fs, sr, quality="VHQ")
    if mono:
        return x.mean(axis=1)
    if x.shape[1] == 1:
        x = np.repeat(x, 2, axis=1)
    return x


def save(path, x, sr=SR, subtype="PCM_24"):
    Path(path).parent.mkdir(parents=True, exist_ok=True)
    sf.write(str(path), np.asarray(x, dtype=np.float64), sr, subtype=subtype)


def to_stereo(x):
    x = np.asarray(x)
    return np.stack([x, x], axis=1) if x.ndim == 1 else x


def lufs(x, sr=SR):
    """Integrated loudness (BS.1770). Mono input is measured as ONE channel (a centred mono
    VO in a stereo file measures ~3 dB louder)."""
    meter = pyln.Meter(sr)
    return float(meter.integrated_loudness(np.asarray(x, dtype=np.float64)))


def true_peak_db(x, sr=SR):
    """ITU-R BS.1770-4 style true peak: 4x oversampled absolute max, in dBTP."""
    x = to_stereo(x)
    up = soxr.resample(x, sr, sr * 4, quality="VHQ")
    return float(a2db(np.max(np.abs(up))))


def sample_peak_db(x):
    return float(a2db(np.max(np.abs(x))))


def short_term_lufs(x, sr=SR, win=3.0, hop=0.1):
    """Return (times, short-term loudness) using K-weighting (pyloudnorm filters)."""
    meter = pyln.Meter(sr)
    xs = to_stereo(x).astype(np.float64)
    y = xs.copy()
    for _, f in meter._filters.items():
        y = f.apply_filter(y)
    p = (y ** 2).sum(axis=1)
    w = int(win * sr); h = int(hop * sr)
    c = np.concatenate([[0], np.cumsum(p)])
    idx = np.arange(0, len(p) - w, h)
    ms = (c[idx + w] - c[idx]) / w
    return (idx + w / 2) / sr, -0.691 + 10 * np.log10(ms + 1e-12)


def click_report(x, sr=SR, thresh=8.0):
    """Find clicks = isolated discontinuities: |second difference| far above the local level AND
    not followed by sustained high-frequency energy (a drum/hat/pluck onset keeps |d2| high for
    several ms; a click/dropout does not). Returns (count, worst [(time, ratio)])."""
    from scipy.ndimage import median_filter, maximum_filter1d
    m = to_stereo(x).mean(axis=1)
    d2 = np.abs(np.diff(m, 2))
    if d2.max() <= 0:
        return 0, []
    k = int(0.02 * sr) | 1
    dec = 8
    loc = median_filter(d2[::dec], size=max(3, k // dec), mode="wrap")
    loc = np.repeat(loc, dec)[: len(d2)] + 1e-7
    ratio = d2 / loc
    amp = maximum_filter1d(np.abs(m), int(0.01 * sr))[1:-1] + 1e-6
    cand = np.where((ratio > thresh * 6) & (d2 > 0.05 * amp))[0]
    out = []
    a, b = int(0.0005 * sr), int(0.005 * sr)
    for i in cand:
        before = np.median(d2[max(0, i - b):max(1, i - a)]) + 1e-7
        after = np.median(d2[i + a:i + b]) if i + b < len(d2) else 0.0
        if after / before < 3.0:  # nothing sustained after the spike -> genuine click
            out.append((round(i / sr, 4), round(float(ratio[i]), 1)))
    # merge hits within 2 ms
    merged = []
    for t_, r_ in out:
        if merged and t_ - merged[-1][0] < 0.002:
            if r_ > merged[-1][1]:
                merged[-1] = (t_, r_)
        else:
            merged.append((t_, r_))
    worst = sorted(merged, key=lambda t: -t[1])[:5]
    return int(len(merged)), worst


def band_energy_db(x, sr=SR, bands=((20, 60), (60, 120), (120, 250), (250, 500), (500, 1000), (1000, 2000),
                                     (2000, 4000), (4000, 8000), (8000, 16000), (16000, 24000))):
    m = to_stereo(x).mean(axis=1)
    f, P = ss.welch(m, sr, nperseg=8192)
    tot = P[(f >= 20)].sum() + 1e-20
    return {f"{lo}-{hi}": round(10 * np.log10(P[(f >= lo) & (f < hi)].sum() / tot + 1e-20), 1) for lo, hi in bands}


def words(prefer_refined=True):
    """Word timings. Uses assets/timing.json when present (refined), else vo_words_raw.json.
    Returns list of dicts with w, s, e."""
    tj = ASSETS / "timing.json"
    if prefer_refined and tj.exists():
        try:
            d = json.loads(tj.read_text())
            ws = d.get("words", d) if isinstance(d, dict) else d
            out = []
            for w in ws:
                text = w.get("w") or w.get("word") or w.get("text")
                s = w.get("s", w.get("start")); e = w.get("e", w.get("end"))
                if text is not None and s is not None:
                    out.append({"w": text, "s": float(s), "e": float(e if e is not None else s + 0.2)})
            if out:
                return out
        except Exception:
            pass
    d = json.loads((ASSETS / "vo_words_raw.json").read_text())
    return d["words"]
