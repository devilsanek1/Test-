#!/usr/bin/env python3
"""php2shell mixer: VO + music bed (side-chain ducked) + SFX cues -> mastered, loop-safe stereo mix.

Usage
  python3 audio/mix.py --music pizzicato --out audio/mix.wav                 # uses audio/cues.json if present
  python3 audio/mix.py --music lofi --cues my_cues.json --out /tmp/x.wav
  python3 audio/mix.py --music none --out audio/vo_sfx_only.wav
  python3 audio/mix.py --make-cues audio/cues_placeholder.json               # cue list from assets/timing.json

Cue file (JSON list):  [{"t": 35.35, "sfx": "pop_mid", "gain_db": -12, "pan": 0}, ...]
  t        seconds on the video timeline (0 = first VO sample). A cue whose tail runs past the loop
           point is wrapped onto the start (disable with --no-wrap).
  sfx      file stem in audio/sfx/ (or a path to any audio file)
  gain_db  applied to the file (all kit files peak at -6 dBFS). With the default +9 dB SFX bus make-up,
           -12 puts a pop ~15 dB under the voice (momentary loudness); -10..-20 is the useful range
  pan      -1 (left) .. +1 (right), constant-power
Optional per-cue keys: "offset" (s, skip into the file), "dur" (s, truncate with a 20 ms fade),
  "prio" (A = core, B = optional; filter with --prio A), "why" (free text, ignored).

Signal flow
  VO (audio/vo_clean.wav, mono, centred)
  music bed -> static level (6 LU under the voice) -> side-chain duck from the VO (look-ahead 20 ms,
              attack 30 ms, release 250 ms, 200 ms hold, default -12 dB) -> margin guard (extra smoothed
              reduction only where the bed would still come within 12 dB of the voice)
  SFX bus   -> gentle 2.5 kHz dip + -3 dB duck while the voice speaks + 9 dB make-up (sits under the VO)
  master    -> 25 Hz HPF -> glue comp (1.5:1, circular so the loop seam is seamless)
            -> loudness to -14 LUFS -> true-peak limiter (4x oversampled detector) <= -1.0 dBTP
The whole chain is circular: the duck envelope, SFX tails and the master dynamics all wrap around
70.7 s, so the mix loops without a click or a level jump.
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

import numpy as np
import scipy.signal as ss
import soxr

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE / "tools"))
from common import (SR, N_TOTAL, VIDEO_DUR, ASSETS, load, save, lufs, true_peak_db, db2a, a2db,  # noqa: E402
                    short_term_lufs, words)

BEDS = {"pizzicato": HERE / "music_pizzicato.wav", "lofi": HERE / "music_lofi.wav",
        "marimba": HERE / "music_marimba.wav"}


# ---------------------------------------------------------------------------- utilities
def fit(x, n=N_TOTAL):
    if len(x) >= n:
        return x[:n]
    pad = [(0, n - len(x))] + [(0, 0)] * (x.ndim - 1)
    return np.pad(x, pad)


def one_pole_db(target_db, att_ms, rel_ms, fs, circular=True):
    """Smooth a gain curve in dB: falling (more reduction) uses attack, rising uses release.
    Circular: run twice so the state at t=0 equals the state at the loop end."""
    a_att = np.exp(-1.0 / (att_ms * 1e-3 * fs)); a_rel = np.exp(-1.0 / (rel_ms * 1e-3 * fs))
    y = np.empty_like(target_db)
    s = target_db[-1] if circular else target_db[0]
    for _ in range(2 if circular else 1):
        for i, v in enumerate(target_db):
            a = a_att if v < s else a_rel
            s = a * s + (1 - a) * v
            y[i] = s
    return y


def speech_envelope(vo, hold_s=0.20, lookahead_s=0.02, fs_env=1000):
    """0..1 voice activity at 1 kHz control rate (circular)."""
    hop = SR // fs_env
    n = len(vo) // hop
    fr = vo[: n * hop].reshape(n, hop)
    lvl = 10 * np.log10((fr ** 2).mean(axis=1) + 1e-12)
    # smooth 20 ms RMS
    k = int(0.02 * fs_env)
    lvl = 10 * np.log10(np.convolve(10 ** (lvl / 10), np.ones(k) / k, mode="same") + 1e-12)
    speech_med = np.median(lvl[lvl > np.percentile(lvl, 40)])
    thr = max(-50.0, speech_med - 24.0)
    act = (lvl > thr).astype(float)
    # hold (circular) + look-ahead
    h = int(hold_s * fs_env)
    act = np.maximum.reduce([np.roll(act, j) for j in range(0, h + 1)])
    act = np.roll(act, -int(lookahead_s * fs_env))
    return act, hop


def ctrl_to_audio(c, hop, n):
    t = np.arange(n) / hop
    return np.interp(t, np.arange(len(c)), c, period=len(c))


def pan_stereo(x, pan):
    if x.ndim == 1:
        x = np.stack([x, x], axis=1)
    th = (np.clip(pan, -1, 1) + 1) * np.pi / 4
    return x * np.array([np.cos(th), np.sin(th)]) * np.sqrt(2)


def circular(y, fn, preroll_s=3.0):
    p = int(preroll_s * SR)
    z = np.concatenate([y[-p:], y], axis=0)
    return fn(z)[p:p + len(y)]


def glue(y):
    from pedalboard import Pedalboard, Compressor, HighpassFilter
    b = Pedalboard([HighpassFilter(25), Compressor(threshold_db=-18, ratio=1.5, attack_ms=20, release_ms=200)])
    return b(y.T.astype(np.float32), SR).T.astype(np.float64)


def tp_limit(y, ceiling_db=-1.0, release_ms=80.0, look_ms=1.5):
    """Look-ahead limiter with a 4x-oversampled (true-peak) detector."""
    c = db2a(ceiling_db)
    up = soxr.resample(y, SR, SR * 4, quality="HQ")
    pk = np.abs(up).max(axis=1)
    n = len(y)
    pk = pk[: n * 4].reshape(-1, 4).max(axis=1)
    pk = np.pad(pk, (0, n - len(pk)), mode="edge")
    need = np.minimum(1.0, c / np.maximum(pk, 1e-9))
    L = max(1, int(look_ms * 1e-3 * SR))
    from scipy.ndimage import minimum_filter1d, uniform_filter1d
    g = minimum_filter1d(need, size=2 * L + 1, mode="wrap")      # look-ahead (centred window)
    g = uniform_filter1d(g, size=L, mode="wrap")                    # smooth the attack
    g = np.minimum(g, need)
    # release (circular, decimated for speed)
    dec = 16
    gd = 20 * np.log10(np.maximum(g[::dec], 1e-6))
    gd = one_pole_db(gd, 0.01, release_ms, SR / dec)
    g2 = db2a(np.interp(np.arange(n), np.arange(0, n, dec), gd, period=n))
    g = np.minimum(g2, g)
    return y * g[:, None]


def load_cues(path):
    if path is None or not Path(path).exists():
        return []
    cues = json.loads(Path(path).read_text())
    return cues["cues"] if isinstance(cues, dict) else cues


def render_sfx(cues, wrap=True):
    bus = np.zeros((N_TOTAL, 2))
    cache = {}
    for c in cues:
        name = c["sfx"]
        p = Path(name) if Path(name).suffix else HERE / "sfx" / f"{name}.wav"
        if p not in cache:
            cache[p] = load(p)
        x = cache[p]
        off = int(c.get("offset", 0) * SR)
        x = x[off:]
        if "dur" in c:
            m = int(c["dur"] * SR); x = x[:m].copy()
            f = min(len(x), int(0.02 * SR)); x[-f:] *= np.linspace(1, 0, f)[:, None]
        x = pan_stereo(x, c.get("pan", 0.0)) * db2a(c.get("gain_db", -12.0))
        i = int(round(c["t"] * SR))
        if i < 0:
            if wrap:
                i += N_TOTAL
            else:
                x = x[-i:]; i = 0
        for k in range(len(x)):  # write with wrap (chunked)
            break
        end = i + len(x)
        if end <= N_TOTAL:
            bus[i:end] += x
        else:
            first = N_TOTAL - i
            bus[i:] += x[:first]
            if wrap:
                rest = x[first:]
                while len(rest):
                    m = min(len(rest), N_TOTAL)
                    bus[:m] += rest[:m]; rest = rest[m:]
    return bus


# ---------------------------------------------------------------------------- placeholder cues
def make_placeholder_cues(path):
    """Demo spotting from assets/timing.json: a soft pop on stressed numbers, a quiet swish in the
    sentence gaps (a card flip in the long ones), and the leak riser into 'Cloudflare'."""
    tj = ASSETS / "timing.json"
    cues = []
    if tj.exists():
        d = json.loads(tj.read_text())
        nums = [h for h in d["hits"] if h.get("number")]
        pops = ["pop_mid", "pop_high", "pop_low"]
        for k, h in enumerate(nums):
            cues.append({"t": round(h["s"] + 0.02, 3), "sfx": pops[k % 3], "gain_db": -14,
                         "pan": [-0.2, 0.2, 0.0][k % 3], "why": f"number '{h['w']}'"})
        for p in d["pauses"]:
            if p["kind"] != "sentence":
                continue
            big = p["dur"] >= 0.3
            cues.append({"t": round(p["s"] + 0.01, 3), "sfx": "card_flip" if big else "whoosh_soft",
                         "gain_db": -18 if big else -22, "pan": 0, "why": f"sentence boundary ({p['dur']:.2f}s gap)"})
    else:  # fall back to raw ASR words
        ws = words(prefer_refined=False)
        for k, w in enumerate(ws):
            if any(ch.isdigit() for ch in w["w"]) or w["w"].strip(".,").lower() in ("four", "two", "millions", "thousands"):
                cues.append({"t": w["s"], "sfx": ["pop_mid", "pop_high", "pop_low"][k % 3], "gain_db": -14, "pan": 0})
            if w["w"][-1] in ".?" and k + 1 < len(ws):
                cues.append({"t": w["e"], "sfx": "whoosh_soft", "gain_db": -22, "pan": 0})
    cues.append({"t": round(35.35 - 3.64, 3), "sfx": "riser_leak", "gain_db": -16, "pan": 0,
                 "why": "leak build peaking on 'Cloudflare' (35.35-35.6)"})
    cues.sort(key=lambda c: c["t"])
    Path(path).write_text(json.dumps(cues, indent=1))
    print(f"wrote {len(cues)} placeholder cues -> {path}")
    return cues


# ---------------------------------------------------------------------------- main mix
def mix(music, cues, vo_path, out, duck_db=12.0, music_db="auto", target_lufs=-14.0, ceiling=-1.0,
        sfx_duck_db=3.0, wrap=True, stems=False, report=True, min_gap_db=12.0, base_lu=6.0, sfx_bus_db=9.0):
    vo = fit(load(vo_path, mono=True))
    act, hop = speech_envelope(vo)
    env_ctrl = one_pole_db(-duck_db * act, 30.0, 250.0, SR / hop)          # dB, circular
    duck = db2a(ctrl_to_audio(env_ctrl, hop, N_TOTAL))
    sfx_duck = db2a(ctrl_to_audio(env_ctrl * (sfx_duck_db / max(duck_db, 1e-6)), hop, N_TOTAL))

    vo_st = np.stack([vo, vo], axis=1)
    if music and music != "none":
        mp = BEDS.get(music, Path(music))
        m = fit(load(mp))
        m = m * db2a(lufs(vo_st) - base_lu - lufs(m))      # bed sits `base_lu` LU under the voice
        if music_db != "auto":
            m *= db2a(float(music_db))
        m_d = m * duck[:, None]
        # margin guard: extra, smoothed reduction wherever the ducked bed would still come within
        # `min_gap_db` of the voice (e.g. the leak crescendo) -> >= 12 dB under the voice everywhere
        guard = np.ones(N_TOTAL)
        for _ in range(3):
            gfix = margin_guard(vo_st, m_d * guard[:, None], min_gap_db + 0.8)
            guard *= gfix
        m_d = m_d * guard[:, None]
        guard_db = a2db(guard)
    else:
        m_d = np.zeros((N_TOTAL, 2))

    sfx = render_sfx(cues, wrap=wrap)
    if np.any(sfx):
        from pedalboard import Pedalboard, PeakFilter
        sfx = Pedalboard([PeakFilter(2500, -2.0, 0.8)])(sfx.T.astype(np.float32), SR).T.astype(np.float64)
        sfx = sfx * sfx_duck[:, None] * db2a(sfx_bus_db)

    pre = vo_st + m_d + sfx
    y = circular(pre, glue)
    # loudness + true peak (iterate: limiter lowers loudness a little)
    g = db2a(target_lufs - lufs(y))
    for _ in range(4):
        z = tp_limit(y * g, ceiling_db=ceiling - 0.2)
        L = lufs(z)
        if abs(L - target_lufs) < 0.1:
            break
        g *= db2a(target_lufs - L)
    tp = true_peak_db(z)
    if tp > ceiling:  # last-resort trim
        z *= db2a(ceiling - tp - 0.05)
    save(out, z)
    res = {"file": str(out), "lufs_I": round(lufs(z), 2), "true_peak_dBTP": round(true_peak_db(z), 2),
           "sample_peak_dBFS": round(float(a2db(np.abs(z).max())), 2), "duration_s": round(len(z) / SR, 3)}
    if music and music != "none":
        gap = speech_gap(vo_st, m_d)
        res.update({"voice_over_music_median_dB": round(float(np.median(gap)), 1),
                    "voice_over_music_p5_dB": round(float(np.percentile(gap, 5)), 1),
                    "voice_over_music_min_dB": round(float(gap.min()), 1),
                    "duck_depth_dB": duck_db,
                    "margin_guard_extra_dB_max": round(float(-guard_db.min()), 1),
                    "margin_guard_active_pct": round(float((guard_db < -0.5).mean() * 100), 1)})
    if stems:
        gm = g  # same master gain (pre-limiter) for reference stems
        save(Path(out).with_name(Path(out).stem + "_stem_vo.wav"), vo_st * gm)
        save(Path(out).with_name(Path(out).stem + "_stem_music.wav"), m_d * gm)
        save(Path(out).with_name(Path(out).stem + "_stem_sfx.wav"), sfx * gm)
    if report:
        print(json.dumps(res, indent=1))
    return res


def margin_guard(vo_st, music, min_gap, hop_s=0.05):
    tv, lv = short_term_lufs(vo_st, win=0.4, hop=hop_s)
    tm, lm = short_term_lufs(music, win=0.4, hop=hop_s)
    k = min(len(lv), len(lm))
    lv, lm, tv = lv[:k], lm[:k], tv[:k]
    sp = lv > (lufs(vo_st) - 6)
    need = np.where(sp, np.maximum(0.0, min_gap - (lv - lm)), 0.0)
    # spread over the 400 ms window that produced it, then smooth (fast attack, slow release)
    from scipy.ndimage import maximum_filter1d
    need = maximum_filter1d(need, size=max(1, int(0.4 / hop_s)), mode="wrap")
    env = one_pole_db(-need, 60.0, 500.0, 1.0 / hop_s)
    t = np.arange(N_TOTAL) / SR
    return db2a(np.interp(t, tv, env))


def speech_gap(vo_st, music):
    """K-weighted 400 ms (momentary) loudness of voice minus music, over frames where the voice is
    clearly speaking (momentary voice loudness within 6 LU of its integrated level). Frames that
    straddle a sentence pause are excluded: there the bed is meant to breathe up."""
    tv, lv = short_term_lufs(vo_st, win=0.4, hop=0.1)
    tm, lm = short_term_lufs(music, win=0.4, hop=0.1)
    k = min(len(lv), len(lm))
    sp = lv[:k] > (lufs(vo_st) - 6)
    return lv[:k][sp] - lm[:k][sp]


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--music", default="pizzicato", help="pizzicato | lofi | marimba | none | path.wav")
    ap.add_argument("--out", default=str(HERE / "mix.wav"))
    ap.add_argument("--cues", default=str(HERE / "cues.json"))
    ap.add_argument("--vo", default=str(HERE / "vo_clean.wav"))
    ap.add_argument("--duck-db", type=float, default=12.0, help="music duck depth under speech (10-14)")
    ap.add_argument("--music-db", default="auto", help="'auto' or a dB trim on top of --music-lu")
    ap.add_argument("--music-lu", type=float, default=6.0,
                    help="un-ducked bed level in LU under the voice (before duck + margin guard)")
    ap.add_argument("--min-gap", type=float, default=12.0, help="voice-over-music margin to guarantee (dB)")
    ap.add_argument("--sfx-duck-db", type=float, default=3.0)
    ap.add_argument("--sfx-bus-db", type=float, default=9.0,
                    help="SFX bus make-up: with it a pop at gain_db -12 lands ~15 dB under the voice")
    ap.add_argument("--lufs", type=float, default=-14.0)
    ap.add_argument("--ceiling", type=float, default=-1.0, help="true-peak ceiling dBTP")
    ap.add_argument("--no-wrap", action="store_true", help="do not wrap SFX tails onto the start")
    ap.add_argument("--stems", action="store_true", help="also write _stem_vo/_stem_music/_stem_sfx wavs")
    ap.add_argument("--prio", default=None, help="only use cues whose 'prio' is in this set, e.g. A or AB")
    ap.add_argument("--make-cues", metavar="JSON", help="write placeholder cues from assets/timing.json and exit")
    a = ap.parse_args()
    if a.make_cues:
        make_placeholder_cues(a.make_cues)
        return
    cues = load_cues(a.cues)
    if a.prio:
        cues = [c for c in cues if str(c.get("prio", "A")) in a.prio]
    mix(a.music, cues, a.vo, a.out, duck_db=a.duck_db, music_db=a.music_db, target_lufs=a.lufs,
        ceiling=a.ceiling, sfx_duck_db=a.sfx_duck_db, wrap=not a.no_wrap, stems=a.stems,
        min_gap_db=a.min_gap, base_lu=a.music_lu, sfx_bus_db=a.sfx_bus_db)


if __name__ == "__main__":
    main()
