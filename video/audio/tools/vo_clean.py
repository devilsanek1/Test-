"""VO restoration + treatment: assets/vo.mp3 -> audio/vo_clean.wav (mono, 48 kHz, 24-bit, 70.7 s).

v2 (after "the voice sounds pretty low quality"). Measured problems of the 192 kbps MP3 (speech frames,
dB relative to the 300 Hz-3 kHz average; reference 2 in brackets): boxy 400-800 Hz +6.1 [+3.8], recessed
presence 3-5 kHz -15.0 [-10.7], a sibilant 5-8 kHz bump -10.8 [-14.5], dull top 8-12 kHz -25.0 [-19.7],
12-16 kHz -39.1 [-31.4], and nothing above 15.2 kHz (MP3 low-pass).

Chain (`--chain full`, the default; `eq` = the same without the air stage; `basic` = the v1 chain):
  1. decode (ffmpeg; encoder delay removed -> same t=0 as timing.json) + soxr VHQ to 48 kHz, DC removal
  2. high-pass 70 Hz (4th order)
  3. tone EQ, from 1/3-octave LTAS vs. BOTH references: the low-mid excess is boxiness at 500-650 Hz
     (+2.5..+3 dB), not 150-300 Hz (that region is 5-8 dB LIGHTER than the references, so cutting it would thin
     the voice): -2.5 dB @ 560 Hz (Q 1); +1 dB @ 1.15 kHz; presence +3.5 dB @ 3.5 kHz (Q 1);
     sibilant bump -3.5 dB @ 5.8 kHz (Q 1.3); +3 dB @ 10 kHz (Q 1.1)
  4. air (bandwidth extension): a harmonic exciter fed ONLY from the cleanly coded 2.5-7.5 kHz band, level-
     compressed first so sibilants do not dominate, rectified + cubic (2nd/3rd harmonics), band-passed to
     8.5-16.5 kHz and mixed in so 12-16 kHz rises to about -29.5 dB before the de-esser (about -31, the reference-2 level, after it). The MP3's own 12-15 kHz
     content (where swirl lives) is never boosted, so artefacts are not exaggerated.
  5. split-band de-esser (after the exciter, so it also governs the new air): >5 kHz band only, 4:1 above the
     91st percentile of 5-10 kHz energy, max 6 dB, 1 ms / 60 ms
  6. light RMS leveler: 2:1 above -15 dBFS, 6 dB knee, 15 ms / 200 ms (no pumping: mean GR ~1.5 dB)
  7. loudness -17 LUFS (mono; ~-14 LUFS centred in stereo), true-peak safety limit -1.5 dBTP, padded to 70.7 s

Usage: python3 vo_clean.py [--src assets/vo.mp3] [--chain full|eq|basic] [--out audio/vo_clean.wav] [--ab]
  --ab also writes loudness-matched 20 s A/B files to review/audio/ (original / EQ-only / EQ + air).
  A wide-band source (e.g. a future assets/vo_hq.wav with content above 16 kHz) automatically skips the
  air stage: it would only add what is already there.
"""
import argparse
import sys
from pathlib import Path

import numpy as np
import scipy.signal as ss
from pedalboard import Pedalboard, PeakFilter

sys.path.insert(0, str(Path(__file__).parent))
from common import SR, N_TOTAL, ASSETS, AUDIO, ROOT, load, save, lufs, true_peak_db, db2a, a2db  # noqa: E402


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


def smooth_gain(gr_db, att_ms, rel_ms, dec=16):
    s = env_follow(gr_db[::dec], att_ms, rel_ms, sr=SR / dec)
    return np.interp(np.arange(len(gr_db)), np.arange(0, len(gr_db), dec), s)


def band_rel_db(x, lo, hi):
    """Long-term level of [lo,hi) relative to the 300 Hz-3 kHz average (speech frames)."""
    f, P = ss.welch(x, SR, nperseg=4096)
    ref = P[(f >= 300) & (f < 3000)].mean()
    return 10 * np.log10(P[(f >= lo) & (f < hi)].mean() / ref + 1e-20)


def has_air(x):
    """True if the source already carries real content above 16 kHz (not an MP3-band-limited file)."""
    return band_rel_db(x, 16000, 20000) > -60.0


def tone_eq(x):
    # Targets come from 1/3-octave LTAS vs. both references (section docstring): boxy 500-650 Hz +3 dB,
    # 1-1.3 kHz -3 dB, presence 3.2-4 kHz -6 dB, sibilant 5-6.4 kHz +3.5 dB, 10 kHz -6..-10 dB.
    b = Pedalboard([PeakFilter(560, -2.5, 1.0), PeakFilter(1150, 1.0, 1.0), PeakFilter(3500, 3.5, 1.0),
                    PeakFilter(5800, -3.5, 1.3), PeakFilter(10000, 3.0, 1.1)])
    return b(x[None, :].astype(np.float32), SR)[0].astype(np.float64)


def exciter(x, target_12_16=-29.5):
    """Harmonic exciter from the 2.5-7.5 kHz band -> 8.5-16.5 kHz, level-calibrated on 12-16 kHz."""
    src = ss.sosfiltfilt(ss.butter(4, [2500, 7500], "bandpass", fs=SR, output="sos"), x)
    lvl = rms_db(src, 3)
    thr = np.percentile(lvl, 60)
    gr = np.maximum(lvl - thr, 0) * 0.6            # ~2.5:1 above the median-ish level
    src = src * db2a(-smooth_gain(gr, 1.0, 40.0))
    s = src / (np.percentile(np.abs(src), 99.9) + 1e-9)
    nl = np.abs(s) + 0.35 * s ** 3
    h = ss.sosfiltfilt(ss.butter(6, 8500, "highpass", fs=SR, output="sos"), nl)
    h = ss.sosfiltfilt(ss.butter(8, 16500, "lowpass", fs=SR, output="sos"), h)
    # calibrate: how much air to add so that 12-16 kHz of (x + g*h) hits the target
    base = band_rel_db(x, 12000, 16000)
    best, g = None, 0.0
    for gdb in np.arange(-60, 0.5, 0.5):
        v = band_rel_db(x + db2a(gdb) * h, 12000, 16000)
        if v >= target_12_16:
            best = gdb
            break
    g = db2a(best if best is not None else -20.0)
    return x + g * h, {"air_gain_db": None if best is None else float(best), "12-16k_before": round(base, 1),
                       "12-16k_after": round(band_rel_db(x + g * h, 12000, 16000), 1)}


def deess(x, report):
    lo = ss.sosfiltfilt(ss.butter(4, 5000, "lowpass", fs=SR, output="sos"), x)
    hi = x - lo
    det = ss.sosfiltfilt(ss.butter(4, [5000, 10000], "bandpass", fs=SR, output="sos"), x)
    det_db = rms_db(det, 5)
    speech = rms_db(x, 30) > -40
    thr = np.percentile(det_db[speech], 91)
    gr = np.minimum(np.maximum(det_db - thr, 0) * (1 - 1 / 4.0), 6.0)
    gr = smooth_gain(gr, 1.0, 60.0)
    report["deess"] = {"active_pct": round(float(np.mean(gr[speech] > 0.5) * 100), 1),
                       "mean_when_active_db": round(float(gr[gr > 0.5].mean()), 2), "max_db": round(float(gr.max()), 2)}
    return lo + hi * db2a(-gr)


def leveler(x, report):
    lvl = rms_db(x, 20)
    thr_c, ratio, knee = -15.0, 2.0, 6.0
    over = lvl - thr_c
    gr = np.where(over <= -knee / 2, 0.0,
                  np.where(over >= knee / 2, over * (1 - 1 / ratio),
                           (1 - 1 / ratio) * (over + knee / 2) ** 2 / (2 * knee)))
    gr = smooth_gain(gr, 15.0, 200.0)
    sp = lvl > -40
    report["leveler"] = {"mean_gr_db": round(float(gr[sp].mean()), 2), "p95_gr_db": round(float(np.percentile(gr[sp], 95)), 2),
                         "max_gr_db": round(float(gr.max()), 2)}
    return x * db2a(-gr)


def process(x, chain="full", report=None):
    report = {} if report is None else report
    x = x - x.mean()
    x = ss.sosfilt(ss.butter(4, 70, "highpass", fs=SR, output="sos"), x)
    if chain in ("full", "eq"):
        x = tone_eq(x)
    if chain == "full":
        if has_air(x):
            report["air"] = "skipped: source already has content above 16 kHz"
        else:
            x, info = exciter(x)
            report["air"] = info
    x = deess(x, report)
    x = leveler(x, report)
    return x, report


def finalize(y, n_total=N_TOTAL, target=-17.0, ceiling=-1.5):
    y = y * db2a(target - lufs(y))
    if true_peak_db(y) > ceiling:               # rare plosive/sibilant overs after the presence lift
        sys.path.insert(0, str(AUDIO))
        from mix import tp_limit
        y = tp_limit(np.stack([y, y], axis=1), ceiling_db=ceiling - 0.2, release_ms=60.0)[:, 0]
    out = np.zeros(n_total)
    n = min(len(y), n_total)
    out[:n] = y[:n]
    f = int(0.003 * SR)
    out[:f] *= np.linspace(0, 1, f); out[n - f:n] *= np.linspace(1, 0, f)
    return out


def write_ab(src):
    """20 s loudness-matched A/B set (-16 LUFS mono), 24-bit WAV, into review/audio/."""
    d = ROOT / "review" / "audio"
    d.mkdir(parents=True, exist_ok=True)
    n = int(20.0 * SR)
    seg = src[: n + SR]                      # 1 s extra so filters settle; trimmed after
    versions = {"vo_ab_1_original": seg - seg.mean(),
                "vo_ab_2_eq": process(seg, "eq")[0],
                "vo_ab_3_eq_air": process(seg, "full")[0]}
    paths = []
    for name, y in versions.items():
        y = y[:n]
        y = y * db2a(-16.0 - lufs(y))
        f = int(0.01 * SR); y[-f:] *= np.linspace(1, 0, f)
        p = d / f"{name}.wav"
        save(p, y)
        paths.append(p)
        print(f"  A/B {p}  {lufs(y):.2f} LUFS  TP {true_peak_db(y):.2f}")
    return paths


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--src", default=str(ASSETS / "vo.mp3"))
    ap.add_argument("--chain", default="full", choices=["full", "eq", "basic"])
    ap.add_argument("--out", default=str(AUDIO / "vo_clean.wav"))
    ap.add_argument("--ab", action="store_true")
    a = ap.parse_args()
    src = load(a.src, SR, mono=True)
    print(f"source {a.src}: {len(src) / SR:.3f} s, {lufs(src):.2f} LUFS, TP {true_peak_db(src):.2f} dBTP, "
          f"air present: {has_air(src)}")
    y, rep = process(src, a.chain)
    for k, v in rep.items():
        print(f"  {k}: {v}")
    out = finalize(y)
    save(a.out, out)
    print(f"vo_clean ({a.chain}): {lufs(out):.2f} LUFS, TP {true_peak_db(out):.2f} dBTP -> {a.out}")
    if a.ab:
        write_ab(src)


if __name__ == "__main__":
    main()
