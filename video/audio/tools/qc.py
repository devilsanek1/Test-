"""Listen-proof by analysis: python3 qc.py file.wav [--loop] [--plot out.png] [--vo audio/vo_clean.wav]"""
import argparse
import sys
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).parent))
from common import SR, load, lufs, true_peak_db, sample_peak_db, short_term_lufs, click_report, band_energy_db, a2db  # noqa

MARKS = [(0, "open"), (10.1, "setup"), (20.2, "discover"), (30.6, "leak"), (35.6, "cloudflare"), (43.2, "susp"),
         (45.5, "breath"), (50.5, "rebuild"), (60.6, "close")]


def seam(x, ms=200):
    n = int(ms * 1e-3 * SR)
    a, b = x[-n:], x[:n]
    ra, rb = np.sqrt((a ** 2).mean()), np.sqrt((b ** 2).mean())
    joint = np.concatenate([x[-n:], x[:n]])
    d = np.abs(np.diff(joint.mean(axis=1)))
    jump = abs(x[0].mean() - x[-1].mean())
    return {"rms_end_db": round(float(a2db(ra)), 1), "rms_start_db": round(float(a2db(rb)), 1),
            "rms_diff_db": round(float(a2db(rb) - a2db(ra)), 2), "sample_jump": float(jump),
            "jump_vs_typical_step": round(float(jump / (np.median(d) + 1e-9)), 2),
            "max_step_at_seam_vs_p999": round(float(d[n - 3:n + 3].max() / (np.percentile(d, 99.9) + 1e-9)), 2)}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("wav"); ap.add_argument("--loop", action="store_true"); ap.add_argument("--plot")
    ap.add_argument("--vo")
    a = ap.parse_args()
    x = load(a.wav)
    print(f"{a.wav}: {len(x) / SR:.3f}s  I={lufs(x):.2f} LUFS  TP={true_peak_db(x):.2f} dBTP  "
          f"peak={sample_peak_db(x):.2f} dBFS  DC=({x[:, 0].mean():.2e},{x[:, 1].mean():.2e})  "
          f"clipped={int((np.abs(x) >= 0.999).sum())}")
    c, worst = click_report(x)
    print("clicks:", c, worst)
    print("bands (dB rel total):", band_energy_db(x))
    t, st = short_term_lufs(x, win=1.0, hop=0.5)
    secs = []
    for i, (t0, nm) in enumerate(MARKS):
        t1 = MARKS[i + 1][0] if i + 1 < len(MARKS) else len(x) / SR
        m = (t >= t0) & (t < t1)
        secs.append(f"{nm}:{np.mean(st[m]):.1f}")
    print("section loudness (1s short-term, LUFS):", "  ".join(secs))
    if a.loop:
        print("loop seam:", seam(x))
    if a.vo:
        vo = load(a.vo, mono=True)
        n = min(len(vo), len(x))
        speech_rel(x[:n], vo[:n])
    if a.plot:
        plot(x, a.plot, a.wav)


def speech_rel(music, vo):
    """Music vs voice level during speech (K-weighted 400 ms momentary, speech frames only)."""
    tm, lm = short_term_lufs(music, win=0.4, hop=0.1)
    tv, lv = short_term_lufs(vo, win=0.4, hop=0.1)
    k = min(len(lm), len(lv))
    sp = lv[:k] > -35
    d = lv[:k][sp] - lm[:k][sp]
    print(f"voice-over-music during speech: median {np.median(d):.1f} dB, p5 {np.percentile(d, 5):.1f} dB, "
          f"min {d.min():.1f} dB, frames <12 dB: {(d < 12).mean() * 100:.1f}%")
    return d


def plot(x, out, title):
    import librosa
    import librosa.display
    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt
    m = x.mean(axis=1)
    S = librosa.amplitude_to_db(np.abs(librosa.stft(m, n_fft=4096, hop_length=1024)), ref=np.max)
    fig, ax = plt.subplots(2, 1, figsize=(22, 9), gridspec_kw={"height_ratios": [3, 1]})
    librosa.display.specshow(S, sr=SR, hop_length=1024, x_axis="time", y_axis="log", ax=ax[0], vmin=-80, vmax=0,
                             cmap="magma")
    t, st = short_term_lufs(x, win=0.4, hop=0.05)
    ax[1].plot(t, st); ax[1].set_xlim(0, len(x) / SR); ax[1].set_ylim(-60, -5); ax[1].grid(alpha=.3)
    for t0, nm in MARKS:
        for a_ in ax:
            a_.axvline(t0, color="c", lw=1)
        ax[1].text(t0 + 0.2, -8, nm)
    ax[0].set_title(title)
    plt.tight_layout(); plt.savefig(out, dpi=55)


if __name__ == "__main__":
    main()
