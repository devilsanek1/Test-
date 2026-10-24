"""Objective voice-quality metrics (used for the VO restoration A/B).

python3 vo_metrics.py file1 [file2 ...]  [--t0 0 --t1 70.7]
Reports, for speech frames only:
  * long-term spectrum per band, in dB relative to the 300 Hz-3 kHz average (same metric as the review)
  * effective bandwidth: highest frequency whose long-term level is within 60 dB of the 300-3k average
  * sibilance: p99 of the 5-10 kHz band envelope minus p99 of the 200 Hz-3 kHz body (higher = hissier)
  * HF artifact index: normalised positive spectral flux in 8-16 kHz (frame-to-frame 'swirl'; scale-invariant,
    so a plain EQ boost does not change it, but added noise/warble does)
  * loudness / true peak
"""
from __future__ import annotations

import argparse
import sys
from pathlib import Path

import numpy as np
import scipy.signal as ss

sys.path.insert(0, str(Path(__file__).parent))
from common import SR, load, lufs, true_peak_db  # noqa: E402

BANDS = [(60, 100), (100, 200), (150, 300), (200, 400), (400, 800), (1000, 2000), (2000, 3000), (3000, 5000),
         (5000, 8000), (8000, 12000), (12000, 16000), (16000, 20000)]


def speech_mask(x, hop):
    n = len(x) // hop
    fr = x[: n * hop].reshape(n, hop)
    db = 10 * np.log10((fr ** 2).mean(axis=1) + 1e-14)
    return db > (np.percentile(db, 90) - 25)


def metrics(x, sr=SR):
    nfft, hop = 2048, 512
    f, t, Z = ss.stft(x, sr, nperseg=nfft, noverlap=nfft - hop, boundary=None, padded=False)
    P = np.abs(Z) ** 2
    m = speech_mask(x, hop)[: P.shape[1]]
    m = np.pad(m, (0, P.shape[1] - len(m)))
    Ps = P[:, m].mean(axis=1)
    ref = Ps[(f >= 300) & (f < 3000)].mean()
    out = {}
    for lo, hi in BANDS:
        out[f"{lo / 1000:g}-{hi / 1000:g}k"] = round(float(10 * np.log10(Ps[(f >= lo) & (f < hi)].mean() / ref + 1e-20)), 1)
    rel = 10 * np.log10(Ps / ref + 1e-20)
    sm = np.convolve(rel, np.ones(9) / 9, mode="same")
    above = np.where(sm > -60)[0]
    out["bandwidth_kHz(-60dB)"] = round(float(f[above[-1]] / 1000), 1)
    # sibilance (same definition as the earlier analysis)
    w = int(0.03 * sr)

    def env(y):
        return 10 * np.log10(ss.fftconvolve(y ** 2, np.ones(w) / w, mode="same")[::480] + 1e-12)
    sib = env(ss.sosfiltfilt(ss.butter(4, [5000, 10000], "bandpass", fs=sr, output="sos"), x))
    body = env(ss.sosfiltfilt(ss.butter(4, [200, 3000], "bandpass", fs=sr, output="sos"), x))
    full = env(x)
    sp = full > np.percentile(full, 90) - 25
    out["sibilance_p99_minus_body_p99_dB"] = round(float(np.percentile(sib[sp], 99) - np.percentile(body[sp], 99)), 1)
    # HF artifact index: normalised positive flux 8-16 kHz on speech frames
    hb = (f >= 8000) & (f < 16000)
    A = np.sqrt(P[hb])
    dA = np.maximum(A[:, 1:] - A[:, :-1], 0).sum(axis=0) / (A[:, 1:].sum(axis=0) + 1e-12)
    out["hf_flux_8-16k"] = round(float(np.median(dA[m[1:]])), 3)
    # dynamics: crest factor (p99.95 |x| over speech RMS) and momentary-loudness spread
    from common import short_term_lufs
    spx = np.repeat(speech_mask(x, 480), 480)[: len(x)]
    xs = x[: len(spx)][spx]
    out["crest_dB"] = round(float(20 * np.log10(np.percentile(np.abs(xs), 99.95) / (np.sqrt(np.mean(xs ** 2)) + 1e-12))), 1)
    tm, lm = short_term_lufs(x, win=0.4, hop=0.1)
    sp4 = lm > np.percentile(lm, 90) - 15
    out["momentary_std_LU"] = round(float(np.std(lm[sp4])), 2)
    # plosive pops: 20-90 Hz band peaks (10 ms) relative to the median speech level
    lfb = ss.sosfiltfilt(ss.butter(4, [20, 90], "bandpass", fs=sr, output="sos"), x)
    lf = 10 * np.log10(ss.fftconvolve(lfb ** 2, np.ones(480) / 480, mode="same")[::240] + 1e-14)
    sp_med = np.median(full[sp])
    out["plosive_LF_peak_rel_dB"] = round(float(lf.max() - sp_med), 1)
    out["tonal_dist_to_refavg_dB"] = None
    out["LUFS"] = round(lufs(x), 2)
    out["TP_dBTP"] = round(true_peak_db(x), 2)
    return out


def third_oct(x, sr=SR):
    nfft, hop = 4096, 1024
    f, t, Z = ss.stft(x, sr, nperseg=nfft, noverlap=nfft - hop, boundary=None, padded=False)
    P = np.abs(Z) ** 2
    m = speech_mask(x, hop)[: P.shape[1]]
    m = np.pad(m, (0, P.shape[1] - len(m)))
    Ps = P[:, m].mean(axis=1)
    cs = np.array([100 * 2 ** (k / 3) for k in range(0, 24)])
    lv = np.array([10 * np.log10(Ps[(f >= c * 2 ** (-1 / 6)) & (f < c * 2 ** (1 / 6))].sum() + 1e-20) for c in cs])
    return cs, lv - 10 * np.log10(Ps[(f >= 300) & (f < 3000)].sum())


def tonal_distance(x, refs):
    """RMS dB difference (125 Hz-10 kHz, 1/3 octave) between x and the average of the reference curves."""
    cs, a = third_oct(x)
    r = np.mean([third_oct(y)[1] for y in refs], axis=0)
    sel = (cs >= 125) & (cs <= 10200)
    return float(np.sqrt(np.mean((a[sel] - r[sel]) ** 2)))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("files", nargs="+")
    ap.add_argument("--t0", type=float, default=0.0)
    ap.add_argument("--t1", type=float, default=None)
    ap.add_argument("--refs", nargs="*", default=[], help="reference files for the tonal-distance metric")
    a = ap.parse_args()
    rows = []
    for fpath in a.files:
        x = load(fpath, mono=True)
        x = x[int(a.t0 * SR): int(a.t1 * SR) if a.t1 else None]
        mtr = metrics(x)
        if a.refs:
            refs = [load(r, mono=True) for r in a.refs]
            mtr["tonal_dist_to_refavg_dB"] = round(tonal_distance(x, refs), 2)
        rows.append((Path(fpath).name, mtr))
    keys = list(rows[0][1].keys())
    print(f"{'metric':34s}" + "".join(f"{n[:22]:>24s}" for n, _ in rows))
    for k in keys:
        print(f"{k:34s}" + "".join(f"{r[k]:>24}" for _, r in rows))


if __name__ == "__main__":
    main()
