"""VO treatment: assets/vo.mp3 -> audio/vo_clean.wav (mono, 48 kHz, 24-bit, 70.7 s).

Chain (deliberately gentle; the source is already a clean, leveled read):
  1. decode (ffmpeg, encoder delay removed, same t=0 as the ASR timings) + soxr VHQ to 48 kHz
  2. DC removal + 4th-order Butterworth high-pass at 70 Hz (rumble / plosive LF; male f0 sits >= 85 Hz)
  3. split-band de-esser: only the >5 kHz band is turned down, only on sibilant peaks
     (detector 5-10 kHz, threshold at the 95th percentile of sibilant energy, 4:1, max 5 dB)
  4. light RMS leveler: 2:1 above -15 dBFS (RMS 20 ms), 6 dB soft knee, 15 ms attack / 150 ms release
  5. loudness-normalise the stem to -17 LUFS (mono measurement; ~-14 LUFS when centred in stereo) (mix.py does the final -14 LUFS master)
"""
import sys
from pathlib import Path

import numpy as np
import scipy.signal as ss

sys.path.insert(0, str(Path(__file__).parent))
from common import SR, N_TOTAL, ASSETS, AUDIO, load, save, lufs, true_peak_db, db2a, a2db  # noqa: E402


def env_follow(x_db, att_ms, rel_ms, sr=SR):
    """One-pole attack/release smoother on a dB gain-reduction curve (positive = reduce)."""
    a_att = np.exp(-1.0 / (att_ms * 1e-3 * sr)); a_rel = np.exp(-1.0 / (rel_ms * 1e-3 * sr))
    y = np.empty_like(x_db); s = 0.0
    for i, v in enumerate(x_db):
        a = a_att if v > s else a_rel
        s = a * s + (1 - a) * v
        y[i] = s
    return y


def rms_db(x, win_ms, sr=SR):
    w = max(1, int(win_ms * 1e-3 * sr))
    p = ss.fftconvolve(x ** 2, np.ones(w) / w, mode="same")
    return 10 * np.log10(np.maximum(p, 1e-14))


def process(x, report=True):
    x = x - x.mean()
    sos = ss.butter(4, 70, "highpass", fs=SR, output="sos")
    x = ss.sosfilt(sos, x)

    # ---- de-esser (split band, complementary so nothing changes when idle)
    lo = ss.sosfiltfilt(ss.butter(4, 5000, "lowpass", fs=SR, output="sos"), x)
    hi = x - lo
    det = ss.sosfiltfilt(ss.butter(4, [5000, 10000], "bandpass", fs=SR, output="sos"), x)
    det_db = rms_db(det, 5)
    speech = rms_db(x, 30) > -40
    thr = np.percentile(det_db[speech], 95)
    over = np.maximum(det_db - thr, 0)
    gr_ds = np.minimum(over * (1 - 1 / 4.0), 5.0)
    # decimate the smoother for speed, then interpolate back
    dec = 16
    gr_ds_s = env_follow(gr_ds[::dec], 1.0 / 1, 60.0, sr=SR / dec)
    gr_ds = np.interp(np.arange(len(x)), np.arange(0, len(x), dec), gr_ds_s)
    x = lo + hi * db2a(-gr_ds)

    # ---- light leveler
    lvl = rms_db(x, 20)
    thr_c, ratio, knee = -15.0, 2.0, 6.0
    over = lvl - thr_c
    gr = np.where(over <= -knee / 2, 0.0,
                  np.where(over >= knee / 2, over * (1 - 1 / ratio),
                           (1 - 1 / ratio) * (over + knee / 2) ** 2 / (2 * knee)))
    gr_s = env_follow(gr[::dec], 15.0, 150.0, sr=SR / dec)
    gr = np.interp(np.arange(len(x)), np.arange(0, len(x), dec), gr_s)
    y = x * db2a(-gr)
    if report:
        sp = speech
        print(f"de-ess: threshold {thr:.1f} dB, active {np.mean(gr_ds[sp] > 0.5) * 100:.1f}% of speech, "
              f"max {gr_ds.max():.1f} dB, mean-when-active {gr_ds[gr_ds > 0.5].mean():.1f} dB")
        print(f"leveler: mean GR in speech {gr[sp].mean():.2f} dB, p95 {np.percentile(gr[sp], 95):.2f} dB, "
              f"max {gr.max():.2f} dB")
    return y


def main():
    src = load(ASSETS / "vo.mp3", SR, mono=True)
    print(f"source: {len(src) / SR:.3f} s, {lufs(src):.2f} LUFS, TP {true_peak_db(src):.2f} dBTP")
    y = process(src)
    g = -17.0 - lufs(y)
    y = y * db2a(g)
    out = np.zeros(N_TOTAL)
    n = min(len(y), N_TOTAL)
    out[:n] = y[:n]
    # 3 ms fades at the file edges (source is silent there anyway)
    f = int(0.003 * SR)
    out[:f] *= np.linspace(0, 1, f); out[n - f:n] *= np.linspace(1, 0, f)
    print(f"vo_clean: {lufs(out):.2f} LUFS, TP {true_peak_db(out):.2f} dBTP, peak {a2db(np.abs(out).max()):.2f} dBFS")
    save(AUDIO / "vo_clean.wav", out)


if __name__ == "__main__":
    main()
