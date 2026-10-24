"""Drop-in for a better voice source.

    python3 audio/tools/swap_vo.py NEW_FILE [--apply] [--remix] [--ref assets/vo.mp3] [--out assets/vo_hq.wav]

1. Aligns NEW_FILE to the current timeline (assets/vo.mp3, decoded exactly like the rest of the pipeline):
   a global GCC-PHAT lag, then windowed normalised cross-correlation, both on the 150 Hz-4 kHz band. This is robust to level, EQ, codec and sample-rate
   differences.
2. Measures the local lag in 3 s windows (1.5 s hop) and fits lag(t) = offset + drift * t:
     - constant offset (residual < 0.5 ms, drift < 0.5 ms over the film)  -> SAME EDIT
     - linear drift (clock / sample-rate mismatch), residual small         -> SAME EDIT, drift corrected
     - steps in the lag, or windows whose content does not correlate        -> DIFFERENT EDIT: it prints where
       (timeline seconds and words from assets/timing.json), because the timing would have to be redone.
3. With --apply and a match, it writes assets/vo_hq.wav (48 kHz mono, 24-bit). The file is offset- and
   drift-corrected so it lines up sample-accurately with the old timeline, padded or trimmed to the same length.
   It then reruns the voice chain (audio/tools/vo_clean.py --src assets/vo_hq.wav). The chain skips its air
   stage automatically if the new file really has content above 16 kHz. With --remix it also re-renders
   audio/mix.wav with the recommended bed.
Exit code: 0 = same edit, 2 = different edit, 1 = error.
"""
from __future__ import annotations

import argparse
import json
import subprocess
import sys
from pathlib import Path

import numpy as np
import scipy.signal as ss
import soxr

sys.path.insert(0, str(Path(__file__).parent))
from common import SR, ASSETS, AUDIO, load, save, lufs  # noqa: E402

WIN, HOP = 3.0, 1.5


def band(x, sr=SR):
    return ss.sosfiltfilt(ss.butter(4, [150, 4000], "bandpass", fs=sr, output="sos"), x)


def gcc_phat(a, b, max_lag):
    """Lag (samples, float, parabolic-refined) by which b is delayed relative to a, plus the PHAT peak."""
    n = len(a) + len(b)
    nfft = 1 << (n - 1).bit_length()
    A = np.fft.rfft(a, nfft); B = np.fft.rfft(b, nfft)
    R = B * np.conj(A)
    R /= np.abs(R) + 1e-12
    cc = np.fft.irfft(R, nfft)
    cc = np.concatenate([cc[-max_lag:], cc[: max_lag + 1]])
    k = int(np.argmax(cc))
    frac = 0.0
    if 0 < k < len(cc) - 1:
        y0, y1, y2 = cc[k - 1], cc[k], cc[k + 1]
        d = y0 - 2 * y1 + y2
        frac = 0.5 * (y0 - y2) / d if d != 0 else 0.0
    return k - max_lag + frac, float(cc[k])


def ncc_search(seg, cand):
    """Normalised cross-correlation of `seg` at every position where it fits inside `cand` ('valid').
    Returns (best position, float with parabolic refinement; best ncc)."""
    num = ss.correlate(cand, seg, mode="valid", method="fft")
    c2 = np.concatenate([[0.0], np.cumsum(cand ** 2)])
    w = len(seg)
    den = np.sqrt((c2[w:] - c2[:-w]) * np.dot(seg, seg)) + 1e-12
    r = num / den
    k = int(np.argmax(r))
    frac = 0.0
    if 0 < k < len(r) - 1:
        y0, y1, y2 = r[k - 1], r[k], r[k + 1]
        d = y0 - 2 * y1 + y2
        frac = 0.5 * (y0 - y2) / d if d != 0 else 0.0
    return k + frac, float(r[k])


def ncc(a, b):
    return float(np.dot(a, b) / (np.sqrt(np.dot(a, a) * np.dot(b, b)) + 1e-12))


def analyse(ref, new):
    """Return a dict describing how `new` maps onto `ref` (both mono at SR)."""
    rb, nb = band(ref), band(new)
    # global lag at 8 kHz (fast), search +-15 s, then refine at 48 kHz
    dec = 6
    g_lag, _ = gcc_phat(rb[::dec], nb[::dec], int(15 * SR / dec))
    g_lag = int(round(g_lag * dec))
    rows = []
    w, h, search = int(WIN * SR), int(HOP * SR), int(0.6 * SR)
    for s in range(0, len(rb) - w, h):
        seg = rb[s:s + w]
        if np.sqrt(np.mean(seg ** 2)) < 1e-4:          # silent window: nothing to compare
            continue
        c0 = s + g_lag - search
        c1 = s + g_lag + w + search
        if c0 < 0 or c1 > len(nb):
            rows.append({"t": s / SR, "lag_ms": None, "ncc": 0.0})
            continue
        cand = nb[c0:c1]
        k, corr = ncc_search(seg, cand)
        pos = c0 + k                       # matched start of this window inside `new`
        rows.append({"t": round(s / SR, 2), "lag_ms": (pos - s) / SR * 1000, "ncc": round(corr, 3)})
    good = [r for r in rows if r["lag_ms"] is not None and r["ncc"] >= 0.5]
    res = {"global_lag_ms": g_lag / SR * 1000, "windows": len(rows), "matched_windows": len(good)}
    if len(good) < max(3, 0.5 * len(rows)):
        res.update({"verdict": "different", "reason": "content does not correlate (different take or recording)",
                    "rows": rows})
        return res
    # the lag measured on a window describes its CENTRE (matters when there is drift)
    t = np.array([r["t"] + WIN / 2 for r in good]); lag = np.array([r["lag_ms"] for r in good])
    # robust line fit (Theil-Sen style via median of pairwise slopes on a subsample)
    idx = np.arange(len(t))
    pairs = [(i, j) for i in idx[::2] for j in idx[1::2] if t[j] - t[i] > 5]
    slope = float(np.median([(lag[j] - lag[i]) / (t[j] - t[i]) for i, j in pairs])) if pairs else 0.0
    icpt = float(np.median(lag - slope * t))
    resid = lag - (icpt + slope * t)
    dur = len(ref) / SR
    unmatched = [r["t"] for r in rows if r["lag_ms"] is None or r["ncc"] < 0.5]
    steps = []
    for k in range(1, len(good)):
        if abs((good[k]["lag_ms"] - good[k - 1]["lag_ms"])) > 2.0:
            steps.append({"between_s": [good[k - 1]["t"], good[k]["t"] + WIN],
                          "lag_before_ms": round(good[k - 1]["lag_ms"], 1), "lag_after_ms": round(good[k]["lag_ms"], 1)})
    res.update({"offset_ms": round(icpt, 3), "drift_ppm": round(slope / 1000 * 1e6, 2),
                "drift_over_film_ms": round(slope * dur, 3), "residual_ms_max": round(float(np.max(np.abs(resid))), 3),
                "median_ncc": round(float(np.median([r["ncc"] for r in good])), 3), "unmatched_windows_at_s": unmatched,
                "lag_steps": steps})
    if steps or res["residual_ms_max"] > 0.5 or len(unmatched) > 0.1 * len(rows):
        res["verdict"] = "different"
        res["reason"] = "the lag changes along the timeline (cuts/inserts/re-timed phrases)"
    elif abs(res["drift_over_film_ms"]) > 0.5:
        res["verdict"] = "same_edit_with_drift"
    else:
        res["verdict"] = "same_edit"
    res["rows"] = rows
    return res


def words_near(t0, t1):
    try:
        d = json.loads((ASSETS / "timing.json").read_text())
        return " ".join(w["w"] for w in d["words"] if t0 - 0.2 <= w["s"] <= t1 + 0.2)
    except Exception:
        return ""


def align(new, res, n_out):
    """Map `new` onto the ref timeline: ref time t  <->  new time t + offset + drift*t."""
    k = 1.0 + res["drift_ppm"] * 1e-6           # new runs k times 'slower' than ref
    y = new
    if abs(k - 1.0) > 1e-7:
        y = soxr.resample(new, SR * k, SR, quality="VHQ")   # compress/stretch so drift becomes 0
    off = int(round(res["offset_ms"] / 1000 * SR))
    if off >= 0:
        y = y[off:]
    else:
        y = np.concatenate([np.zeros(-off), y])
    out = np.zeros(n_out)
    m = min(n_out, len(y))
    out[:m] = y[:m]
    return out


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("new")
    ap.add_argument("--ref", default=str(ASSETS / "vo.mp3"))
    ap.add_argument("--out", default=str(ASSETS / "vo_hq.wav"))
    ap.add_argument("--apply", action="store_true", help="write the aligned file and rerun the voice chain")
    ap.add_argument("--remix", action="store_true", help="with --apply: also re-render audio/mix.wav")
    ap.add_argument("--json", help="write the full analysis here")
    ap.add_argument("--vo-out", default=str(AUDIO / "vo_clean.wav"), help="where the voice chain writes")
    a = ap.parse_args()
    ref = load(a.ref, SR, mono=True)
    new = load(a.new, SR, mono=True)
    res = analyse(ref, new)
    rows = res.pop("rows")
    if a.json:
        Path(a.json).write_text(json.dumps({**res, "rows": rows}, indent=1))
    print(f"new: {a.new}  ({len(new) / SR:.3f} s)   ref: {a.ref}  ({len(ref) / SR:.3f} s)")
    print(json.dumps(res, indent=1))
    if res["verdict"] == "different":
        print("\nDIFFERENT EDIT - timing must be redone. Where it differs (timeline seconds):")
        for st in res.get("lag_steps", []):
            t0, t1 = st["between_s"]
            print(f"  lag {st['lag_before_ms']:+.1f} -> {st['lag_after_ms']:+.1f} ms between {t0:.1f} and {t1:.1f} s"
                  f"  [{words_near(t0, t1)}]")
        un = res.get("unmatched_windows_at_s", [])
        if un:
            print(f"  non-matching windows ({WIN:.0f} s each) start at: {un}")
        sys.exit(2)
    print(f"\nSAME EDIT: offset {res['offset_ms']:+.2f} ms, drift {res['drift_ppm']:+.2f} ppm "
          f"({res['drift_over_film_ms']:+.3f} ms over the film), residual <= {res['residual_ms_max']:.3f} ms, "
          f"median correlation {res['median_ncc']}")
    if not a.apply:
        print("dry run: add --apply to write the aligned file and rerun the voice chain")
        return
    aligned = align(new, res, len(ref))
    chk = analyse(ref, aligned)
    fix = int(round(chk.get("offset_ms", 0.0) / 1000 * SR)) if chk["verdict"] != "different" else 0
    if fix:                                       # second pass: remove any whole-sample residual
        aligned = np.roll(aligned, -fix)
        if fix > 0:
            aligned[-fix:] = 0.0
        else:
            aligned[:-fix] = 0.0
        chk = analyse(ref, aligned)
    print(f"check after alignment: offset {chk.get('offset_ms')} ms, drift {chk.get('drift_ppm')} ppm, "
          f"verdict {chk['verdict']}")
    save(a.out, aligned)
    print(f"wrote {a.out}  ({len(aligned) / SR:.3f} s, {lufs(aligned):.2f} LUFS)")
    tools = Path(__file__).parent
    subprocess.run([sys.executable, str(tools / "vo_clean.py"), "--src", a.out, "--out", a.vo_out], check=True)
    if a.remix:
        subprocess.run([sys.executable, str(AUDIO / "mix.py"), "--music", "cinematic", "--out",
                        str(AUDIO / "mix.wav")], check=True)


if __name__ == "__main__":
    main()
