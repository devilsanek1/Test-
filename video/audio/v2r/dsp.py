"""Small DSP helpers for video 2's sound (audio/v2r). Deterministic: every random draw takes an explicit seed.

All signals are float64 numpy at 48 kHz, mono (n,) or stereo (n, 2). The film's clock: 2345 frames at 60 fps
= 39.0833 s (the voice take is 39.08 s; the last 3.3 ms are silence), so the bed and the mix are exactly one film
long and loop with the video without a gap.
"""
from __future__ import annotations

import os
import sys
from pathlib import Path

os.environ["SOUND_VIDEO_DUR"] = str(2345 / 60)        # before importing the house tools (common.N_TOTAL)
HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]                                  # /home/user/Test-/video
sys.path.insert(0, str(ROOT / "audio" / "tools"))
sys.path.insert(0, str(ROOT / "audio"))

import numpy as np  # noqa: E402
import scipy.signal as ss  # noqa: E402

from common import SR, db2a, a2db, save, load, lufs, true_peak_db, short_term_lufs, click_report  # noqa: E402,F401

FPS = 60
FILM_FRAMES = 2345
FILM_DUR = FILM_FRAMES / FPS                           # 39.0833 s
N_FILM = int(round(FILM_DUR * SR))                     # 1,876,000 samples
PUBLIC = ROOT / "public" / "v2r"
VOICE = ROOT / "public" / "v2" / "voice.wav"
SCRATCH = Path("/tmp/claude-0/-home-user-Test-/59905704-1101-50eb-baa8-b5e4e9d5d2d2/scratchpad/v2r/sound")


def frame_t(t):
    """Remotion places a cue at round(t * fps) frames: the premix does the same."""
    return round(t * FPS) / FPS


def n_of(dur):
    return int(round(dur * SR))


def tt(dur):
    return np.arange(n_of(dur)) / SR


def rng(seed):
    return np.random.default_rng(seed)


def noise(dur, seed):
    return rng(seed).standard_normal(n_of(dur))


def sos(kind, f, order=2):
    return ss.butter(order, f, kind, fs=SR, output="sos")


def bp(x, lo, hi, order=2):
    return ss.sosfilt(sos("bandpass", [lo, hi], order), x, axis=0)


def lp(x, f, order=2):
    return ss.sosfilt(sos("lowpass", f, order), x, axis=0)


def hp(x, f, order=2):
    return ss.sosfilt(sos("highpass", f, order), x, axis=0)


def peak_eq(x, f0, gain_db, q=1.0):
    """RBJ peaking biquad."""
    A = 10 ** (gain_db / 40); w = 2 * np.pi * f0 / SR; al = np.sin(w) / (2 * q)
    b = np.array([1 + al * A, -2 * np.cos(w), 1 - al * A]); a = np.array([1 + al / A, -2 * np.cos(w), 1 - al / A])
    return ss.lfilter(b / a[0], a / a[0], x, axis=0)


def env_ad(n, att, dec, curve=1.0):
    """attack (s, sine-shaped) then exponential decay with time constant dec (s)."""
    t = np.arange(n) / SR
    a = np.clip(t / max(att, 1e-6), 0, 1)
    up = np.sin(0.5 * np.pi * a) ** curve
    return np.where(t < att, up, np.exp(-(t - att) / max(dec, 1e-6)))


def env_bell(n, peak=0.5, sharp=2.0):
    """smooth swell up to `peak` (fraction of n), then down; 0 at both ends."""
    x = np.linspace(0, 1, n)
    up = np.sin(0.5 * np.pi * np.clip(x / peak, 0, 1)) ** sharp
    dn = np.cos(0.5 * np.pi * np.clip((x - peak) / max(1 - peak, 1e-6), 0, 1)) ** sharp
    return np.where(x < peak, up, dn)


def modal(freqs, decays, amps, dur, exc_ms=0.6, seed=0):
    """Decaying partials struck by a short Hann-shaped noise burst (a mallet / knuckle / felt). The partials rise over
    ~exc_ms (a raised-cosine onset, so a soft mallet never clicks) and the buffer's last 4 ms fade out (no step)."""
    t = tt(dur); r = rng(seed)
    y = np.zeros_like(t)
    for f, d, a in zip(freqs, decays, amps):
        y += a * np.sin(2 * np.pi * f * t + r.uniform(0, 2 * np.pi)) * np.exp(-t / d)
    na = min(len(t), max(8, int(max(exc_ms, 0.3) * 1e-3 * SR)))
    y[:na] *= np.sin(0.5 * np.pi * np.linspace(0, 1, na)) ** 2
    k = max(4, int(exc_ms * 1e-3 * SR))
    exc = r.standard_normal(k) * np.hanning(k)
    y = ss.fftconvolve(y, exc / (np.abs(exc).sum() + 1e-12))[: len(t)] * 8
    nf = min(len(y) // 4, int(0.004 * SR))
    y[len(y) - nf:] *= np.cos(0.5 * np.pi * np.linspace(0, 1, nf)) ** 2
    return y


def chirp(f0, f1, dur, shape=2.0):
    """sine glide f0 -> f1 (exponential-ish), unit amplitude."""
    t = tt(dur); x = (t / dur) ** (1 / shape) if shape != 1 else t / dur
    f = f0 * (f1 / f0) ** x
    return np.sin(2 * np.pi * np.cumsum(f) / SR)


def tv_bandpass(x, centers, bw_oct=0.8, nfft=1024):
    """Time-varying band-pass (STFT domain); centers = array of centre Hz, one per sample."""
    f, t, Z = ss.stft(x, SR, nperseg=nfft, noverlap=nfft * 3 // 4)
    c = np.interp(t, np.arange(len(x)) / SR, centers)
    lf = np.log2(np.maximum(f, 20))[:, None]
    W = np.exp(-0.5 * ((lf - np.log2(c)[None, :]) / bw_oct) ** 2)
    _, y = ss.istft(Z * W, SR, nperseg=nfft, noverlap=nfft * 3 // 4)
    y = y[: len(x)]
    return np.pad(y, (0, len(x) - len(y)))


def place(dst, src, t, gain=1.0):
    i = int(round(t * SR))
    if i < 0:
        src = src[-i:]; i = 0
    n = min(len(src), len(dst) - i)
    if n > 0:
        dst[i:i + n] += src[:n] * gain
    return dst


def pan(x, p):
    """mono -> stereo, constant power (0 = centre at unity in both channels)."""
    th = (np.clip(p, -1, 1) + 1) * np.pi / 4
    return np.stack([x * np.cos(th), x * np.sin(th)], axis=1) * np.sqrt(2)


def pan_sweep(x, p0, p1):
    th = (np.clip(np.linspace(p0, p1, len(x)), -1, 1) + 1) * np.pi / 4
    return np.stack([x * np.cos(th), x * np.sin(th)], axis=1) * np.sqrt(2)


def decor(fn, seed, width=0.6):
    """Noise-built sound -> stereo with NO comb filter: `fn(seed)` renders the mono sound from its noise seed; L and R
    share a common render and each adds its own independently seeded render (width 0 = mono, 1 = fully independent).
    The mono fold-down is a smooth level change, never a notch (a sub-millisecond copy would comb: review item 7)."""
    th = 0.5 * np.pi * float(np.clip(width, 0, 1))
    c = fn(seed); l_ = fn(seed + 7919); r_ = fn(seed + 15887)
    n = min(len(c), len(l_), len(r_))
    L = np.cos(th) * c[:n] + np.sin(th) * l_[:n]
    R = np.cos(th) * c[:n] + np.sin(th) * r_[:n]
    return np.stack([L, R], axis=1)


def contact(dur, lo, hi, dec, seed, rise=0.0002):
    """the contact noise of an impact: a band-limited noise burst, near-instant rise, exponential decay (s)."""
    n = n_of(dur); t = np.arange(n) / SR
    e = np.minimum(1.0, t / max(rise, 1e-6)) * np.exp(-t / max(dec, 1e-6))
    return bp(rng(seed).standard_normal(n), lo, min(hi, 0.45 * SR), 2) * e


def body_noise(freqs, decays, amps, dur, seed, q=18.0):
    """the noisy body of a struck object: noise rung through narrow resonances at its main modes, each decaying with
    its mode (what a real block adds around its partials: they are never bare sines)."""
    n = n_of(dur); t = np.arange(n) / SR; r = rng(seed); y = np.zeros(n)
    for f, d, a in zip(freqs, decays, amps):
        if f >= 0.45 * SR:
            continue
        bw = f / q
        y += a * bp(r.standard_normal(n), max(20.0, f - bw / 2), min(0.45 * SR, f + bw / 2), 1) * np.exp(-t / d)
    return y


def struck(freqs, decays, amps, dur, seed, exc_ms=0.6, noise_body=0.35, contact_amp=0.25, contact_band=(600, 9000),
           contact_dec=0.0015, spread=0.012, n_extra=2):
    """A struck object that does not sound synthetic: its modes (with a few weak, fast neighbours around each, as a
    real block has), their noisy body, and the contact noise of the hit itself. Unit-ish peak."""
    r = rng(seed)
    F, D, A = list(freqs), list(decays), list(amps)
    for f, d, a in zip(freqs, decays, amps):
        for _ in range(n_extra):
            F.append(f * (1 + r.uniform(-spread, spread) * 3)); D.append(d * r.uniform(0.25, 0.55))
            A.append(a * r.uniform(0.08, 0.22))
    y = modal(F, D, A, dur, exc_ms=exc_ms, seed=seed)
    y = y / (np.abs(y).max() + 1e-12)
    nb = body_noise(freqs, decays, amps, dur, seed + 1)
    y += noise_body * nb / (np.abs(nb).max() + 1e-12)
    if contact_amp:
        c = contact(min(dur, 0.03), contact_band[0], contact_band[1], contact_dec, seed + 2)
        y[: len(c)] += contact_amp * c / (np.abs(c).max() + 1e-12)
    nf = min(len(y) // 4, int(0.004 * SR))
    y[len(y) - nf:] *= np.cos(0.5 * np.pi * np.linspace(0, 1, nf)) ** 2
    return y


def _slap_ir():
    """THE film's one outdoor slap (review item 9): the canal walls, the facades across the water: three early
    reflections per side at 40-80 ms, each duller than the last, and a short diffuse tail. Stereo, deterministic."""
    n = n_of(0.24); ir = np.zeros((n, 2))
    taps = {0: [(0.043, -11.0), (0.061, -15.0), (0.078, -19.0)], 1: [(0.047, -12.0), (0.066, -15.5), (0.083, -20.0)]}
    for ch, tl in taps.items():
        for k, (d, g) in enumerate(tl):
            i = n_of(d); ir[i, ch] += db2a(g)
        ir[:, ch] = lp(ir[:, ch], 5200 - 700 * ch, 2)
    t = np.arange(n) / SR
    for ch in range(2):
        tail = rng(9100 + ch).standard_normal(n) * np.exp(-np.maximum(t - 0.07, 0) / 0.045) * (t > 0.07) * db2a(-27)
        ir[:, ch] += lp(hp(tail, 180), 4200, 2)
    return hp(ir, 150, 2)


SLAP_IR = None


def slap(y, send_db=-4.0):
    """y (mono or stereo) + the shared outdoor slap at `send_db` (the reflections sit ~15 dB and more under)."""
    global SLAP_IR
    if SLAP_IR is None:
        SLAP_IR = _slap_ir()
    y = st(y)
    m = y.mean(axis=1)
    wet = np.stack([ss.fftconvolve(m, SLAP_IR[:, k]) for k in range(2)], axis=1)
    out = np.zeros((len(wet), 2)); out[: len(y)] += y
    return out + wet * db2a(send_db)


def st(x):
    return x if x.ndim == 2 else np.stack([x, x], axis=1)


def circ_noise(n, lo, hi, seed, tilt_db_oct=0.0):
    """Perfectly circular band-limited noise (FFT domain), unit RMS: loops with no seam."""
    r = rng(seed)
    X = r.standard_normal(n // 2 + 1) + 1j * r.standard_normal(n // 2 + 1)
    f = np.fft.rfftfreq(n, 1 / SR)
    lf = np.log2(np.maximum(f, 1.0))
    g = np.clip((lf - np.log2(lo)) / 0.3 + 0.5, 0, 1) * np.clip((np.log2(hi) - lf) / 0.3 + 0.5, 0, 1)
    g[0] = 0.0
    if tilt_db_oct:
        g = g * (np.maximum(f, 1) / 1000.0) ** (tilt_db_oct / 6.02)
    y = np.fft.irfft(X * g, n)
    return y / (np.std(y) + 1e-12)


def smooth_rand(n, rate_hz, seed, lo=0.0, hi=1.0):
    """slow random curve in [lo, hi] (circular), for gusts and swells."""
    k = max(4, int(n / SR * rate_hz))
    pts = rng(seed).uniform(0, 1, k)
    xs = np.linspace(0, n, k, endpoint=False)
    y = np.interp(np.arange(n), np.concatenate([xs, [n]]), np.concatenate([pts, pts[:1]]))
    y = ss.sosfiltfilt(sos("lowpass", max(0.2, rate_hz), 1), y) if n > 1000 else y
    y = (y - y.min()) / (np.ptp(y) + 1e-12)
    return lo + (hi - lo) * y


def finish_sfx(y, name, out_dir, peak_db=-1.0, fade_in_ms=1.5, fade_out_ms=25.0, trim=True, thr_db=-62.0):
    """Trim the silent tail (never the head: a file's first sample is its cue time, and the join carriers peak on
    their midpoint at a designed offset from it), short fades, DC-free, stereo, normalised to `peak_db` dBFS, 48 kHz
    24-bit."""
    y = st(np.asarray(y, dtype=np.float64))
    y = hp(y, 18.0, 2)
    if trim:
        a = np.abs(y).max(axis=1)
        on = np.where(a > a.max() * db2a(thr_db))[0]
        y = y[: on[-1] + 1]
    fi = min(len(y) // 4, int(fade_in_ms * 1e-3 * SR)); fo = min(len(y) // 3, int(fade_out_ms * 1e-3 * SR))
    if fi > 0:
        y[:fi] *= np.linspace(0, 1, fi)[:, None]
    if fo > 0:
        y[-fo:] *= (np.linspace(1, 0, fo) ** 2)[:, None]
    y = y / (np.abs(y).max() + 1e-12) * db2a(peak_db)
    out = Path(out_dir) / f"{name}.wav"
    save(out, y)
    return y
