#!/usr/bin/env python3
"""Video 2 premix: voice (public/v2/voice.wav) + the bed (public/v2r/music_bed.wav) + every cue in
public/v2r/cues.json, summed exactly as Film plays them (cue at round(t * 60) frames, linear gain, cut at the film's
end), then measured and mastered to -14 LUFS / -1 dBTP.

    python3 audio/v2r/premix.py          # -> scratchpad v2r/sound/premix.wav + premix_report.json + premix.png
                                         #    and public/v2r/mix.wav (the mastered draft: Film audioSrc, sfx dropped)

Measured (speech = the voiced spans in sheet.py, momentary 400 ms K-weighted loudness unless noted):
  integrated loudness + true peak of the master; the voice over the bed / the music / the air / the SFX bus while it
  speaks (median, p5, min); every cue's own gap to the voice at its moment (house: >= 8 dB); the 1-4 kHz balance
  (voice vs everything else, band-limited 400 ms RMS, while it speaks); the loop seam; clicks; and the peak of the
  raw sum the browser would play (voice + cues at their gains, no master).
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from dsp import (SR, PUBLIC, VOICE, SCRATCH, N_FILM, FILM_DUR, FPS, np, bp, db2a, a2db, save, load, lufs,  # noqa
                 true_peak_db, short_term_lufs, click_report, frame_t, n_of)
import sheet  # noqa: E402
import mix as HM  # noqa: E402  (audio/mix.py: circular glue + the true-peak limiter)

MIX_OUT = PUBLIC / "mix.wav"


def speech_mask(t):
    sp = np.zeros(len(t), bool)
    for (a, b) in sheet.VOICED:
        sp |= (t >= a + 0.2) & (t <= b - 0.2)
    return sp


def gap(vs, x, hop=0.05, present=True):
    tv, lv = short_term_lufs(vs, win=0.4, hop=hop)
    _, lx = short_term_lufs(x, win=0.4, hop=hop)
    k = min(len(lv), len(lx))
    m = speech_mask(tv[:k])
    if present:
        m &= lx[:k] > -70
    d = (lv[:k] - lx[:k])[m]
    return d


def stats(d):
    if len(d) == 0:
        return None
    return {"median": round(float(np.median(d)), 1), "p5": round(float(np.percentile(d, 5)), 1),
            "min": round(float(d.min()), 1)}


def band_gap(vs, x, lo=1000, hi=4000, win=0.4, hop=0.05):
    """1-4 kHz: voice minus the rest (band-limited RMS in 400 ms windows) while the voice speaks."""
    bv = bp(vs.mean(1), lo, hi, 4); bx = bp(x.mean(1), lo, hi, 4)
    w, h = n_of(win), n_of(hop)
    cv = np.concatenate([[0], np.cumsum(bv ** 2)]); cx = np.concatenate([[0], np.cumsum(bx ** 2)])
    idx = np.arange(0, len(bv) - w, h)
    ev = 10 * np.log10((cv[idx + w] - cv[idx]) / w + 1e-20); ex = 10 * np.log10((cx[idx + w] - cx[idx]) / w + 1e-20)
    t = (idx + w / 2) / SR
    m = speech_mask(t) & (ex > -100)
    return (ev - ex)[m], t[m]


def build_sfx(cues):
    bus = np.zeros((N_FILM, 2)); per = []
    cache = {}
    for c in cues:
        if c["src"].endswith("music_bed.wav"):
            continue
        p = PUBLIC.parent / c["src"]
        if p not in cache:
            cache[p] = load(p)
        x = cache[p] * c["gain"]
        i = int(round(frame_t(c["t"]) * SR))
        n = min(len(x), N_FILM - i)
        one = np.zeros((N_FILM, 2)); one[i:i + n] = x[:n]
        bus += one
        per.append((c, one))
    return bus, per


def master(y, target=-14.0, ceiling=-1.0):
    z0 = HM.circular(y, HM.glue)
    g = db2a(target - lufs(z0))
    for _ in range(6):
        z = HM.tp_limit(z0 * g, ceiling_db=ceiling - 0.25)
        L = lufs(z)
        if abs(L - target) < 0.05:
            break
        g *= db2a(target - L)
    tp = true_peak_db(z)
    if tp > ceiling - 0.05:
        z *= db2a(ceiling - 0.05 - tp)
    return z


def tpdf16(y, seed=7):
    r = np.random.default_rng(seed)
    q = 1.0 / 32768
    return y + (r.random(y.shape) - r.random(y.shape)) * q


def plot(vs, bed, sfx, mixed, out):
    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt
    import librosa
    import librosa.display
    fig, ax = plt.subplots(2, 1, figsize=(24, 10), gridspec_kw={"height_ratios": [3, 2]})
    S = librosa.amplitude_to_db(np.abs(librosa.stft(mixed.mean(1), n_fft=4096, hop_length=512)), ref=np.max)
    librosa.display.specshow(S, sr=SR, hop_length=512, x_axis="time", y_axis="log", ax=ax[0], vmin=-90, vmax=0,
                             cmap="magma")
    for nm, x, col in (("voice", vs, "k"), ("bed", bed, "tab:blue"), ("sfx", sfx, "tab:orange")):
        t, l = short_term_lufs(x, win=0.4, hop=0.02)
        ax[1].plot(t, l, col, lw=1.2, label=nm)
    for (sid, a, b) in sheet.SHOTS:
        for a_ in ax:
            a_.axvline(a, color="c", lw=1)
        ax[1].text(a + 0.1, -8, sid)
    for c in sheet.CUES:
        ax[1].axvline(c[0], color="tab:orange", lw=0.4, alpha=0.5)
    ax[1].set_ylim(-75, -5); ax[1].set_xlim(0, FILM_DUR); ax[1].grid(alpha=0.3); ax[1].legend(loc="lower right")
    ax[0].set_title("v2 premix: spectrogram (top), momentary loudness 400 ms: voice / bed / SFX (bottom)")
    plt.tight_layout(); plt.savefig(out, dpi=50); plt.close(fig)


def main():
    SCRATCH.mkdir(parents=True, exist_ok=True)
    cues = json.loads((PUBLIC / "cues.json").read_text())
    v = load(VOICE, mono=True); v = np.pad(v, (0, max(0, N_FILM - len(v))))[:N_FILM]
    vs = np.stack([v, v], 1)
    bed = load(PUBLIC / "music_bed.wav")[:N_FILM]
    bed_gain = next(c["gain"] for c in cues if c["src"].endswith("music_bed.wav"))
    bed = bed * bed_gain
    sfx, per = build_sfx(cues)
    raw = vs + bed + sfx                                # what the browser plays (Film audioSrc voice + sfx cues)
    mixed = master(raw)
    save(SCRATCH / "premix.wav", mixed)
    save(MIX_OUT, tpdf16(mixed), subtype="PCM_16")
    rep = {"premix": str(SCRATCH / "premix.wav"), "public_mix": str(MIX_OUT),
           "duration_s": round(len(mixed) / SR, 4), "frames": FILM_DUR * FPS,
           "lufs_I": round(lufs(mixed), 2), "true_peak_dBTP": round(true_peak_db(mixed), 2),
           "raw_sum_true_peak_dBTP": round(true_peak_db(raw), 2), "raw_sum_lufs_I": round(lufs(raw), 2),
           "voice_lufs_I_as_played": round(lufs(vs), 2)}
    comp = {"bed": bed, "sfx_bus": sfx, "bed+sfx": bed + sfx}
    for nm in ("bed_music", "bed_air"):
        p = SCRATCH / f"{nm}.wav"
        if p.exists():
            comp[nm] = load(p)[:N_FILM] * bed_gain
    rep["voice_over"] = {k: stats(gap(vs, x)) for k, x in comp.items()}
    bg, bt = band_gap(vs, bed + sfx)
    rep["band_1_4kHz_voice_over_rest"] = stats(bg)
    rep["band_1_4kHz_worst"] = [(round(float(t), 2), round(float(d), 1)) for d, t in sorted(zip(bg, bt))[:5]]
    # every cue's own gap to the voice (the cue's loudest 400 ms vs the voice's momentary level at that moment)
    tv, lv = short_term_lufs(vs, win=0.4, hop=0.01)
    vref = float(np.median(lv[speech_mask(tv)]))
    rows = []
    for c, one in per:
        a = frame_t(c["t"])
        seg = one[max(0, n_of(a) - n_of(0.2)): n_of(a) + n_of(1.0)]
        if not np.any(seg):
            continue
        _, lc = short_term_lufs(np.concatenate([np.zeros((n_of(0.4), 2)), seg, np.zeros((n_of(0.4), 2))]),
                                win=0.4, hop=0.01)
        ev = float(lc.max())
        m = (tv >= a - 0.1) & (tv <= a + 0.5) & speech_mask(tv)
        vloc = float(lv[m].max()) if m.any() else None
        rows.append({"t": c["t"], "src": c["src"].split("/")[-1][:-4], "gain": c["gain"],
                     "under_speech_level": round(vref - ev, 1),
                     "under_voice_here": (round(vloc - ev, 1) if vloc is not None else "pause")})
    rep["cues"] = rows
    rep["cues_closer_than_8dB"] = [r for r in rows if isinstance(r["under_voice_here"], float) and r["under_voice_here"] < 8]
    rep["clicks_master"] = click_report(mixed)[0]
    import qc as QC
    rep["loop_seam"] = QC.seam(mixed)
    t1, l1 = short_term_lufs(mixed, win=1.0, hop=0.25)
    rep["section_LUFS_1s"] = {sid: round(float(np.mean(l1[(t1 >= a) & (t1 < b)])), 1) for (sid, a, b) in sheet.SHOTS}
    (SCRATCH / "premix_report.json").write_text(json.dumps(rep, indent=1))
    plot(vs, bed, sfx, mixed, SCRATCH / "premix.png")
    short = {k: v for k, v in rep.items() if k != "cues"}
    print(json.dumps(short, indent=1))
    print("cues (t, file, gain, dB under the speech level, dB under the voice at that moment):")
    for r in rows:
        print(f"  {r['t']:6.2f} {r['src']:15s} {r['gain']:.4f} {r['under_speech_level']:6.1f} {r['under_voice_here']}")


if __name__ == "__main__":
    main()
