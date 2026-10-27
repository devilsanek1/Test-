#!/usr/bin/env python3
"""Video 2 premix: voice (public/v2/voice.wav) + the bed (public/v2r/music_bed.wav) + every cue in
public/v2r/cue_sheet.json, summed exactly as Film would play them (cue at round(t * 60) frames, linear gain; a cue that
runs past the film's end wraps onto its start, as the loop plays it), then measured and mastered to -14 LUFS / -1 dBTP.

    python3 audio/v2r/premix.py          # -> scratchpad v2r/sound/premix.wav + premix_report.json + premix.png,
                                         #    public/v2r/mix.wav (the master) and public/v2r/cues.json =
                                         #    {"audio": "v2r/mix.wav", "sfx": []}: Film2R plays the master in place of
                                         #    the voice (the browser's own sum of voice + bed + cues peaks over 0 dBTP)

Measured (speech = the voiced spans in sheet.py, momentary 400 ms K-weighted loudness unless noted):
  integrated loudness + true peak of the master; the voice over the bed / the music / the air / the SFX bus while it
  speaks (median, p5, min); every cue's own gap to the voice at its moment (house: >= 8 dB); the 1-4 kHz balance;
  THE HIT WORDS (review item 1): the voice >= 6 dB over everything else at 1-4 and 4-10 kHz on every word of
  sheet.HIT_WORDS (raw energy; the two opening words count a measured-tonal masker 10 dB less, raw reported); every
  other word reported; the cue onsets against the word onsets (review item 11); the mono fold-down (review item 7);
  the arc on full range and through a phone-speaker model, and the music's swell in each pause (items 4, 5); the loop
  seam: sample step, level, and the 2-8 kHz level and the deepest 5 ms dip across it (item 10); THE JOINS
  (THROUGHLINE s3): each carrier's loudest 20 ms against its midpoint, and nothing else (cue, life, bird, note) starting
  in a join's window; clicks, each checked against the voice's own edges (its plosives); the raw sum.
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from dsp import (SR, PUBLIC, VOICE, SCRATCH, N_FILM, FILM_DUR, FPS, np, ss, bp, db2a, a2db, save, load, lufs,  # noqa
                 true_peak_db, short_term_lufs, click_report, frame_t, n_of, st)
import sheet  # noqa: E402
import measure as M  # noqa: E402
import mix as HM  # noqa: E402  (audio/mix.py: circular glue + the true-peak limiter)

MIX_OUT = PUBLIC / "mix.wav"
WORD_MIN = 6.0


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
        one = np.zeros((N_FILM, 2))
        M.place_wrapped(one, x, frame_t(c["t"]))           # the loop: what runs past the end plays from frame 0
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


# ---------------------------------------------------------------- the review's checks
BANDS = {"1-4k": (1000.0, 4000.0), "4-10k": (4000.0, 10000.0)}


def band_frames(x, band, win=0.03, hop=0.01):
    m = st(x).mean(axis=1)
    b = ss.sosfiltfilt(ss.butter(4, band, "bandpass", fs=SR, output="sos"), m)
    w, h = n_of(win), n_of(hop)
    c = np.concatenate([[0.0], np.cumsum(b ** 2)])
    idx = np.arange(0, max(1, len(b) - w), h)
    return (idx + w / 2) / SR, (c[idx + w] - c[idx]) / w


def tonality(y):
    import sfx
    return sfx.tonality(y)


def word_check(v, bed, per, words):
    """every word: the voice over (bed + SFX) at 1-4 and 4-10 kHz over its active frames (energy) and its worst
    30 ms frame; hit words flagged. For sheet.TONAL_RELAXED words the measured-tonal SFX count 10 dB less."""
    Ev, Er, Ert = {}, {}, {}
    tonal_bus = np.zeros((N_FILM, 2)); other_bus = np.zeros((N_FILM, 2))
    cache = {}
    for c, one in per:
        src = c["src"]
        if src not in cache:
            cache[src] = tonality(load(PUBLIC.parent / src)) >= 0.85
        if cache[src]:
            tonal_bus += one
        else:
            other_bus += one
    for bn, band in BANDS.items():
        tv, Ev[bn] = band_frames(v, band)
        _, eb = band_frames(bed + other_bus, band)
        _, et = band_frames(tonal_bus, band)
        Er[bn] = eb + et
        Ert[bn] = eb + et * db2a(-sheet.TONAL_MASKING_DB) ** 2
    hits = {(w, s) for (w, s) in sheet.HIT_WORDS}
    rows = []
    for x in words:
        w, s = x["w"], x["s"]
        span = (s - sheet.WORD_PAD, x["e"] + sheet.WORD_PAD)
        row = {"word": w, "t": s, "hit": (w, s) in hits}
        relaxed = (w, s) in sheet.TONAL_RELAXED
        for bn in BANDS:
            m = (tv >= span[0]) & (tv <= span[1])
            lv = 10 * np.log10(Ev[bn] + 1e-30)
            act = m & (lv >= lv[m].max() - 12.0) & (lv > -75.0) if m.any() else m
            if not act.any():
                row[bn] = None; continue
            R = Ert[bn] if relaxed else Er[bn]
            row[bn] = round(float(10 * np.log10(Ev[bn][act].sum() / (R[act].sum() + 1e-30))), 1)
            row[bn + "_min"] = round(float(np.min(10 * np.log10(Ev[bn][act] / (R[act] + 1e-30)))), 1)
            if relaxed:
                row[bn + "_raw"] = round(float(10 * np.log10(Ev[bn][act].sum() / (Er[bn][act].sum() + 1e-30))), 1)
        rows.append(row)
    return rows


def onsets_vs_words(cues, words):
    """each cue's first audible sample (-30 dB of its peak envelope) against the nearest heard word onset (json and
    the voiced-span starts): the review's item 11 (no SFX landing 0-12 ms after a word onset)."""
    ons = sorted({w["s"] for w in words} | {a for (a, b) in sheet.VOICED})
    rows = []
    for c in cues:
        if c["src"].endswith("music_bed.wav"):
            continue
        x = load(PUBLIC.parent / c["src"]).mean(axis=1)
        e = np.sqrt(np.convolve(x ** 2, np.ones(240) / 240, "same"))
        on = int(np.argmax(e > e.max() * db2a(-30)))
        t_on = frame_t(c["t"]) + on / SR
        near = min(ons, key=lambda o: abs(o - t_on))
        rows.append({"t": c["t"], "src": c["src"].split("/")[-1][:-4], "onset": round(t_on, 3),
                     "vs_word_ms": round(1000 * (t_on - near))})
    after = [r for r in rows if 0 <= r["vs_word_ms"] <= 12]
    within = [r for r in rows if abs(r["vs_word_ms"]) <= 20]
    return rows, after, within


def voice_edge(v, t, win=0.003, ratio=40.0):
    """does the voice alone have a click-like edge (|2nd difference| >= `ratio` x its 20 ms median) within +-win of t?"""
    i0, i1 = max(2, n_of(t - 0.02)), min(len(v) - 2, n_of(t + 0.02))
    d2 = np.abs(np.diff(v[i0 - 2:i1 + 2], 2))
    loc = np.median(d2) + 1e-9
    k0, k1 = n_of(t - win) - i0, n_of(t + win) - i0
    return bool(d2[max(0, k0):max(1, k1)].max() / loc >= ratio)


def join_check(per):
    """THROUGHLINE s3 / DIRECTION rule 1 for sound: each join's carrier sound peaks on the midpoint (its loudest 20 ms
    as placed in the film), and nothing but the carrier STARTS in [midpoint - 0.2, midpoint + 0.12): no other cue
    (first audible sample, -30 dB of its peak), no life sound or bird (sheet.LIFE / sheet.BIRDS)."""
    rows = []
    for (j, mid, carrier, span, snd) in sheet.JOINS:
        stem = sheet.file_stem(snd)
        lo, hi = mid - sheet.JOIN_BEFORE, mid + sheet.JOIN_AFTER
        car = [(c, one) for c, one in per if c["src"].endswith(f"/{stem}.wav") and lo - 0.4 <= frame_t(c["t"]) <= hi]
        row = {"join": j, "midpoint": mid, "carrier": snd}
        if car:
            c, one = car[0]
            m = one.mean(axis=1); w = n_of(0.02)
            i0 = max(0, n_of(frame_t(c["t"])) - w); i1 = min(len(m), n_of(frame_t(c["t"])) + n_of(1.2))
            e = np.sqrt(np.convolve(m[i0:i1] ** 2, np.ones(w) / w, "same")) + 1e-12
            ipk = int(np.argmax(e)); imid = n_of(mid) - i0
            row["peak_t"] = round((i0 + ipk) / SR, 3)
            row["peak_vs_mid_ms"] = int(round(1000 * ((i0 + ipk) / SR - mid)))
            row["at_mid_vs_peak_dB"] = round(float(a2db(e[min(len(e) - 1, max(0, imid))] / e[ipk])), 1)
        others = []
        for c, one in per:
            if c["src"].endswith(f"/{stem}.wav"):
                continue
            x = load(PUBLIC.parent / c["src"]).mean(axis=1)
            env = np.sqrt(np.convolve(x ** 2, np.ones(240) / 240, "same"))
            t_on = frame_t(c["t"]) + int(np.argmax(env > env.max() * db2a(-30))) / SR
            if lo <= t_on < hi:
                others.append((c["src"].split("/")[-1][:-4], round(t_on, 3)))
        for (t, kind, pn, note) in sheet.LIFE:
            t_ = t + (sheet.JOIN_AFTER if kind in ("boat_ride", "fountain") else 0.0)
            if lo <= t_ < hi:
                others.append(("life:" + kind, t_))
        for b_ in sheet.BIRDS:
            if lo <= b_[0] < hi:
                others.append(("bird", b_[0]))
        row["others_starting_in_window"] = others
        rows.append(row)
    return rows


def mono_fold(x):
    """the mix's mono fold-down against a coherent reference, 1/6 octave, 200 Hz-12 kHz: the deepest notch (dB)."""
    nf = 1 << 20
    seg = x[: min(len(x), nf)]
    Lm = np.abs(np.fft.rfft(seg[:, 0], nf)) ** 2; Rm = np.abs(np.fft.rfft(seg[:, 1], nf)) ** 2
    Mm = np.abs(np.fft.rfft(seg.mean(axis=1), nf)) ** 2
    f = np.fft.rfftfreq(nf, 1 / SR)
    worst = (0.0, 0.0)
    for fc in np.geomspace(200, 12000, 80):
        w = (f >= fc / 2 ** (1 / 12)) & (f < fc * 2 ** (1 / 12))
        ref = 0.25 * (Lm[w].sum() + Rm[w].sum()) + 0.5 * np.sqrt(Lm[w].sum() * Rm[w].sum())
        d = 10 * np.log10((Mm[w].sum() + 1e-30) / (ref + 1e-30))
        if d < worst[0]:
            worst = (round(float(d), 1), round(float(fc)))
    return worst


def seam_check(x):
    """across the loop seam: the 2-8 kHz level in the 60 ms before vs after, and the deepest 5 ms RMS within +-40 ms
    of it against the median 5 ms RMS of the 0.4 s around it (a dropout shows as a deep dip)."""
    H = n_of(0.4)
    z = np.concatenate([x[-H:], x[:H]]).mean(axis=1)
    b = ss.sosfiltfilt(ss.butter(4, [2000, 8000], "bandpass", fs=SR, output="sos"), z)
    w = n_of(0.06)
    before = 10 * np.log10(np.mean(b[H - w:H] ** 2) + 1e-20); after = 10 * np.log10(np.mean(b[H:H + w] ** 2) + 1e-20)
    k = n_of(0.005)
    e = 10 * np.log10(np.convolve(z ** 2, np.ones(k) / k, "same") + 1e-20)
    near = e[H - n_of(0.04): H + n_of(0.04)]
    return {"band_2_8k_before_dB": round(float(before), 1), "band_2_8k_after_dB": round(float(after), 1),
            "band_2_8k_step_dB": round(float(after - before), 1),
            "deepest_5ms_dip_vs_median_dB": round(float(near.min() - np.median(e)), 1)}


def phone(x):
    y = ss.sosfilt(ss.butter(4, 350, "highpass", fs=SR, output="sos"), x, axis=0)
    return ss.sosfilt(ss.butter(2, 12000, "lowpass", fs=SR, output="sos"), y, axis=0)


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
        ax[1].text(a + 0.1, -8, sid)
    for (j, mid, carrier, span, snd) in sheet.JOINS:
        for a_ in ax:
            a_.axvline(mid, color="c", lw=1)
            a_.axvspan(mid - sheet.JOIN_BEFORE, mid + sheet.JOIN_AFTER, color="c", alpha=0.08)
    for c in sheet.CUES:
        ax[1].axvline(c[0], color="tab:orange", lw=0.4, alpha=0.5)
    ax[1].set_ylim(-75, -5); ax[1].set_xlim(0, FILM_DUR); ax[1].grid(alpha=0.3); ax[1].legend(loc="lower right")
    ax[0].set_title("v2 premix: spectrogram (top), momentary loudness 400 ms: voice / bed / SFX (bottom)")
    plt.tight_layout(); plt.savefig(out, dpi=50); plt.close(fig)


def main():
    SCRATCH.mkdir(parents=True, exist_ok=True)
    cues = json.loads((PUBLIC / "cue_sheet.json").read_text())
    words = json.loads((PUBLIC / "voice_words_heard.json").read_text())["words"]
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
    (PUBLIC / "cues.json").write_text(json.dumps(
        {"audio": "v2r/mix.wav", "sfx": [],
         "note": "the mastered mix (voice + bed + every cue of cue_sheet.json, -14 LUFS / -1 dBTP), made by "
                 "audio/v2r/premix.py; it replaces the voice (Film2R useCues), so no sfx play on top"}, indent=1) + "\n")
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
    tv_, lv_ = short_term_lufs(vs, win=0.4, hop=0.05); _, ls_ = short_term_lufs(sfx, win=0.4, hop=0.05)
    k_ = min(len(lv_), len(ls_)); m_ = speech_mask(tv_[:k_]) & (ls_[:k_] > -70)
    rep["sfx_bus_frames_within_8dB"] = [(round(float(a), 2), round(float(b), 1)) for a, b in
                                        zip(tv_[:k_][m_], (lv_[:k_] - ls_[:k_])[m_]) if b < 8]
    bg, bt = band_gap(vs, bed + sfx)
    rep["band_frames_below_0dB"] = [(round(float(t), 2), round(float(d), 1)) for d, t in zip(bg, bt) if d < 0]
    rep["band_1_4kHz_voice_over_rest"] = stats(bg)
    rep["band_1_4kHz_worst"] = [(round(float(t), 2), round(float(d), 1)) for d, t in sorted(zip(bg, bt))[:5]]
    # every cue's own gap to the voice: vs its speech level, vs the voice where it lands, and in 1-4 kHz there
    V = M.voice_tracks()
    rows = []
    for c, one in per:
        a = frame_t(c["t"])
        x = load(PUBLIC.parent / c["src"]) * c["gain"]
        ev, eb = M.cue_levels(x)
        here = M.local_voice(V, a, len(x) / SR)
        rows.append({"t": c["t"], "src": c["src"].split("/")[-1][:-4], "gain": c["gain"],
                     "under_speech_level": round(V["vref"] - ev, 1),
                     "under_voice_here": (round(here[0] - ev, 1) if here else "pause"),
                     "band_under_voice_here": (round(here[1] - eb, 1) if here else "pause")})
    rep["cues"] = rows
    rep["cues_closer_than_8dB"] = [r for r in rows if isinstance(r["under_voice_here"], float) and r["under_voice_here"] < 8]
    # review item 1: the hit words (and every other word, reported)
    wc = word_check(v, bed, per, words)
    rep["hit_words"] = [r for r in wc if r["hit"]]
    rep["hit_words_failing"] = [r for r in wc if r["hit"] and any(r[b] is not None and r[b] < WORD_MIN for b in BANDS)]
    rep["other_words_under_6dB"] = [r for r in wc if not r["hit"] and any(r[b] is not None and r[b] < WORD_MIN for b in BANDS)]
    # review item 11: the cues against the word onsets
    on, after, within = onsets_vs_words(cues, words)
    rep["cue_onsets"] = on
    rep["cues_0_12ms_after_a_word"] = after
    rep["cues_within_20ms_of_a_word"] = len(within)
    # THROUGHLINE s3: the joins (carriers on their midpoints, nothing else starting in a join's window)
    rep["joins"] = join_check(per)
    rep["joins_failing"] = [r for r in rep["joins"] if r["others_starting_in_window"]
                            or abs(r.get("peak_vs_mid_ms", 999)) > 40]
    # review item 7: the mono fold-down
    rep["mono_fold_worst_notch_dB_at_Hz"] = mono_fold(mixed)
    # review items 4-5: the arc full range / phone, the music in each pause (from bed.py's own report)
    bedrep = SCRATCH / "bed_report.json"
    if bedrep.exists():
        br = json.loads(bedrep.read_text())
        rep["arc"] = br.get("arc")
        rep["music_onsets_in_join_windows"] = br.get("music_onsets_in_join_windows")
    # review item 10: the seam
    nclk, worst = click_report(mixed)
    rep["clicks_master"] = nclk
    rep["clicks_master_worst"] = [(round(float(t_), 3), round(float(r_), 1)) for (t_, r_) in worst]
    # each flag against the voice alone: where the voice itself has a sharp edge (its second difference far above its
    # own local level, a plosive's burst) within 3 ms, the flag is the voice's consonant, not an edit of ours
    rep["clicks_master_not_the_voice"] = [w_ for w_ in rep["clicks_master_worst"] if not voice_edge(v, w_[0])]
    import qc as QC
    rep["loop_seam"] = QC.seam(mixed)
    rep["loop_seam"].update(seam_check(mixed))
    t1, l1 = short_term_lufs(mixed, win=1.0, hop=0.25)
    rep["section_LUFS_1s"] = {sid: round(float(np.mean(l1[(t1 >= a) & (t1 < b)])), 1) for (sid, a, b) in sheet.SHOTS}
    (SCRATCH / "premix_report.json").write_text(json.dumps(rep, indent=1))
    plot(vs, bed, sfx, mixed, SCRATCH / "premix.png")
    short = {k: v_ for k, v_ in rep.items() if k not in ("cues", "cue_onsets", "hit_words", "arc", "joins")}
    print("joins (carrier peak vs the midpoint; anything else starting in the window):")
    for r in rep["joins"]:
        print(f"  {r['join']} {r['midpoint']:6.2f} {r['carrier']:14s} peak {r.get('peak_vs_mid_ms')} ms, "
              f"{r.get('at_mid_vs_peak_dB')} dB at the midpoint; others {r['others_starting_in_window']}")
    print(json.dumps(short, indent=1))
    print("hit words: voice over bed + SFX (dB) 1-4 kHz [worst 30 ms], 4-10 kHz [worst 30 ms]:")
    for r in rep["hit_words"]:
        raw = f"  (raw {r.get('1-4k_raw')} / {r.get('4-10k_raw')})" if "1-4k_raw" in r else ""
        print(f"  {r['t']:6.2f} {r['word']:13s} {r['1-4k']} [{r.get('1-4k_min')}]  {r['4-10k']} [{r.get('4-10k_min')}]{raw}")
    print("cues (t, file, gain, dB under the speech level, dB under the voice where it lands, the same in 1-4 kHz):")
    for r in rows:
        print(f"  {r['t']:6.2f} {r['src']:15s} {r['gain']:.4f} {r['under_speech_level']:6.1f} {r['under_voice_here']}"
              f"  band {r['band_under_voice_here']}")


if __name__ == "__main__":
    main()
