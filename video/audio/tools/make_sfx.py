"""SFX kit for the hand-drawn explainer -> audio/sfx/<name>.wav (48 kHz, 24-bit stereo, trimmed,
peak-normalised to -6 dBFS, 2 ms fade-in / 15-40 ms fade-out, DC-free).

Most sounds are synthesised here from first principles (filtered noise, modal resonators, chirps),
so they are original and licence-free. Some layers use real CC0 recordings (VCSL / VSCO-2-CE):
cajon (door knock), hand chimes (alert ping), glockenspiel + triangle (ding), bass drum (power-off body),
suspended-cymbal crescendo (riser). The crowd murmur is built from the project's own VO (reversed,
pitch-shifted, muffled -> unintelligible babble)."""
import sys
from pathlib import Path

import numpy as np
import scipy.signal as ss
import soxr

sys.path.insert(0, str(Path(__file__).parent))
from common import SR, AUDIO, SAMPLES, ASSETS, load, save, db2a, a2db, click_report  # noqa: E402

OUT = AUDIO / "sfx"
rng = np.random.default_rng(2026)
VCSL_I = SAMPLES / "VCSL" / "Idiophones" / "Struck Idiophones"


# ------------------------------------------------------------------ helpers
def t_(dur):
    return np.arange(int(dur * SR)) / SR


def noise(dur, seed=None):
    r = np.random.default_rng(seed) if seed is not None else rng
    return r.standard_normal(int(dur * SR))


def bp(x, lo, hi, order=2):
    return ss.sosfilt(ss.butter(order, [lo, hi], "bandpass", fs=SR, output="sos"), x)


def lp(x, f, order=2):
    return ss.sosfilt(ss.butter(order, f, "lowpass", fs=SR, output="sos"), x)


def hp(x, f, order=2):
    return ss.sosfilt(ss.butter(order, f, "highpass", fs=SR, output="sos"), x)


def adsr(n, a, d, s_lvl=0.0, r=0.0, curve=3.0):
    """attack seconds, exponential decay time-constant d (s) to s_lvl"""
    t = np.arange(n) / SR
    e = np.where(t < a, (t / max(a, 1e-6)) ** 0.7, s_lvl + (1 - s_lvl) * np.exp(-(t - a) / max(d, 1e-6)))
    return e


def bell_env(n, peak=0.5, sharp=2.0):
    """smooth swell: rises to a peak at fraction `peak`, falls after (raised-cosine-ish)"""
    x = np.linspace(0, 1, n)
    up = np.clip(np.sin(0.5 * np.pi * np.clip(x / peak, 0, 1)), 0, 1) ** sharp
    dn = np.clip(np.cos(0.5 * np.pi * np.clip((x - peak) / (1 - peak), 0, 1)), 0, 1) ** sharp
    return np.where(x < peak, up, dn)


def tv_filter(x, centers_hz, bw_oct=0.8, nfft=1024):
    """Time-varying band-pass in the STFT domain. centers_hz: array (len(x)) of centre freqs."""
    f, tt, Z = ss.stft(x, SR, nperseg=nfft, noverlap=nfft * 3 // 4)
    c = np.interp(tt, np.arange(len(x)) / SR, centers_hz)
    lf = np.log2(np.maximum(f, 20))[:, None]
    W = np.exp(-0.5 * ((lf - np.log2(c)[None, :]) / bw_oct) ** 2)
    _, y = ss.istft(Z * W, SR, nperseg=nfft, noverlap=nfft * 3 // 4)
    return y[: len(x)]


def modal(freqs, decays, amps, dur, exc_ms=0.6, seed=None):
    """Sum of exponentially decaying partials, excited by a tiny noise burst (impact)."""
    t = t_(dur)
    r = np.random.default_rng(seed)
    y = np.zeros_like(t)
    for f, d, a in zip(freqs, decays, amps):
        ph = r.uniform(0, 2 * np.pi)
        y += a * np.sin(2 * np.pi * f * t + ph) * np.exp(-t / d)
    exc = r.standard_normal(max(4, int(exc_ms * 1e-3 * SR))) * np.hanning(max(4, int(exc_ms * 1e-3 * SR)))
    return ss.fftconvolve(y, exc / np.abs(exc).sum())[: len(t)] * 8


def chirp_tone(f_of_t, env):
    ph = 2 * np.pi * np.cumsum(f_of_t) / SR
    return np.sin(ph) * env


def place(dst, src, t, gain=1.0):
    i = int(t * SR)
    n = min(len(src), len(dst) - i)
    if n > 0:
        dst[i:i + n] += src[:n] * gain
    return dst


def sample(path, mono=True):
    return load(path, SR, mono=mono)


def stereo(x, width=0.0, pan=0.0, seed=0):
    """mono -> stereo; optional decorrelated width (short all-pass-ish delay) and pan."""
    if x.ndim == 2:
        return x
    L = x.copy(); R = x.copy()
    if width > 0:
        d = int(0.0007 * SR)
        R = (1 - width) * x + width * np.concatenate([np.zeros(d), x[:-d]])
        L = (1 - width) * x + width * np.concatenate([x[d:], np.zeros(d)])
    th = (pan + 1) * np.pi / 4
    return np.stack([L * np.cos(th) * np.sqrt(2), R * np.sin(th) * np.sqrt(2)], axis=1)


def finalize(name, y, fade_out_ms=30, thr_db=-60.0, keep_lead_ms=1.0, desc=""):
    y = np.asarray(y, dtype=np.float64)
    if y.ndim == 1:
        y = stereo(y)
    y = hp(y.T, 20, order=2).T  # DC / subsonic
    a = np.abs(y).max(axis=1)
    pk = a.max()
    on = np.where(a > pk * db2a(thr_db))[0]
    s = max(0, on[0] - int(keep_lead_ms * 1e-3 * SR)); e = min(len(y), on[-1] + 1)
    y = y[s:e]
    fi = min(len(y) // 4, int(0.002 * SR)); fo = min(len(y) // 3, int(fade_out_ms * 1e-3 * SR))
    y[:fi] *= np.linspace(0, 1, fi)[:, None]
    y[-fo:] *= (np.linspace(1, 0, fo) ** 2)[:, None]
    y = y / (np.abs(y).max() + 1e-12) * db2a(-6.0)
    save(OUT / f"{name}.wav", y)
    c, _ = click_report(y)
    CATALOG.append((name, len(y) / SR, c, desc))
    return y


CATALOG = []


# ------------------------------------------------------------------ pencil / pen scratch
def pencil(strokes, seed):
    """strokes: list of (start, dur, pressure). Graphite-on-paper friction: band-limited noise with
    irregular 'tooth' grain, speed-dependent brightness, plus a quiet paper-body layer."""
    r = np.random.default_rng(seed)
    total = max(s + d for s, d, _ in strokes) + 0.05
    n = int(total * SR)
    out = np.zeros(n)
    for (st, du, pr) in strokes:
        m = int(du * SR)
        x = r.standard_normal(m)
        # tooth: sparse grains (paper fibres) -> amplitude modulation
        grain = (r.random(m) < 2500 / SR).astype(float) * r.uniform(0.3, 1.0, m)
        grain = ss.fftconvolve(grain, np.exp(-np.arange(int(0.0012 * SR)) / (0.0003 * SR)))[:m]
        tooth = 0.45 + 0.55 * grain / (grain.max() + 1e-9)
        rough = lp(np.abs(r.standard_normal(m)), 90)
        rough = 0.6 + 0.4 * rough / (rough.max() + 1e-9)
        speed = bell_env(m, peak=r.uniform(0.3, 0.6), sharp=1.2)
        centers = 2600 + 2600 * speed
        fr = tv_filter(x * tooth * rough, centers, bw_oct=0.9)
        body = bp(r.standard_normal(m), 500, 1400) * 0.18
        env = bell_env(m, peak=0.25, sharp=0.8) * pr
        y = (fr + body * rough) * env
        place(out, y, st)
    return out


def make_pencils():
    finalize("pencil_scratch_short", pencil([(0, 0.22, 1.0)], 1), 25,
             desc="single quick pencil stroke (tick mark, underline flick)")
    finalize("pencil_scratch_medium", pencil([(0, 0.20, 0.9), (0.17, 0.19, 1.0), (0.33, 0.24, 0.85)], 2), 30,
             desc="three hatch strokes (~0.6 s): a shape being sketched / hatched")
    strokes, t = [], 0.0
    r = np.random.default_rng(3)
    while t < 1.45:
        d = r.uniform(0.28, 0.5); strokes.append((t, d, r.uniform(0.75, 1.0))); t += d * r.uniform(0.75, 0.9)
    finalize("pencil_scratch_long", pencil(strokes, 4), 60, desc="continuous contour line drawing (~1.7 s)")


# ------------------------------------------------------------------ pops
def pop(f_end, ratio=2.2, dur=0.12, seed=0):
    n = int(dur * SR); t = np.arange(n) / SR
    f = f_end + f_end * (ratio - 1) * np.exp(-t / 0.007)
    env = adsr(n, 0.0015, 0.035)
    y = chirp_tone(f, env)
    y += 0.25 * chirp_tone(2 * f, adsr(n, 0.001, 0.012))
    click = lp(np.random.default_rng(seed).standard_normal(n), 3000) * adsr(n, 0.0003, 0.002) * 0.25
    return y + click


def bubble(f0=1100, dur=0.07):
    n = int(dur * SR); t = np.arange(n) / SR
    f = f0 * (1 + 9.0 * t)                       # rising Minnaert resonance
    y = chirp_tone(f, adsr(n, 0.0008, 0.018))
    return y


# ------------------------------------------------------------------ air: card flip / paper flip / whoosh
def swish(dur, f_lo, f_hi, peak=0.45, flutter=0.0, seed=0, bw=0.7):
    r = np.random.default_rng(seed)
    n = int(dur * SR)
    e = bell_env(n, peak=peak, sharp=1.6)
    c = f_lo + (f_hi - f_lo) * e
    y = tv_filter(r.standard_normal(n), c, bw_oct=bw) * e
    if flutter:
        t = np.arange(n) / SR
        y *= 1 + flutter * np.sin(2 * np.pi * (28 + 12 * e) * t) * e
    return y


def card_flip():
    a = swish(0.32, 700, 4200, peak=0.5, flutter=0.35, seed=11)
    tap = lp(modal([210, 470, 1900], [0.03, 0.02, 0.008], [1, 0.5, 0.25], 0.12, exc_ms=3.0, seed=3), 2500) * 0.35
    y = np.zeros(int(0.45 * SR)); place(y, a, 0); place(y, tap, 0.29)
    return stereo(y, width=0.5)


def paper_flip():
    r = np.random.default_rng(12)
    a = swish(0.42, 900, 5200, peak=0.35, flutter=0.5, seed=12)
    n = len(a)
    crk = (r.random(n) < 900 / SR) * r.uniform(-1, 1, n)
    crk = bp(ss.fftconvolve(crk, np.exp(-np.arange(60) / 12.0))[:n], 1500, 7000) * bell_env(n, 0.3, 1.0) * 0.8
    return stereo(a + crk, width=0.6)


def whoosh():
    n = int(0.75 * SR)
    a = swish(0.75, 250, 2400, peak=0.55, seed=21, bw=0.9)
    lo = lp(np.random.default_rng(22).standard_normal(n), 400) * bell_env(n, 0.55, 2.0) * 0.6
    y = a + lo
    # L -> R movement
    p = np.linspace(-0.6, 0.6, n); th = (p + 1) * np.pi / 4
    return np.stack([y * np.cos(th), y * np.sin(th)], axis=1) * np.sqrt(2)


# ------------------------------------------------------------------ clicks, switches, keys, ticks
def click(f1=2900, f2=5400, low=950, dur=0.04, seed=0):
    y = modal([low, f1, f2], [0.004, 0.003, 0.0018], [0.5, 1.0, 0.5], dur, exc_ms=0.25, seed=seed)
    return y


def toggle():
    y = np.zeros(int(0.14 * SR))
    place(y, click(1800, 3600, 700, seed=1) * 0.8, 0)
    place(y, click(3100, 6100, 1100, seed=2), 0.045)
    body = modal([380, 820], [0.02, 0.012], [0.4, 0.2], 0.08, seed=4) * 0.6
    place(y, body, 0.045)
    return y


def key_tick(seed):
    r = np.random.default_rng(seed)
    y = modal([r.uniform(1500, 2200), r.uniform(3200, 4200), r.uniform(450, 600)],
              [0.006, 0.003, 0.015], [1.0, 0.4, 0.6], 0.05, exc_ms=0.3, seed=seed)
    return y


def typing_burst():
    r = np.random.default_rng(5)
    y = np.zeros(int(1.3 * SR)); t = 0.0
    for k in range(11):
        place(y, key_tick(100 + k) * r.uniform(0.6, 1.0), t)
        t += r.choice([0.07, 0.09, 0.11, 0.14, 0.19])
        if t > 1.2:
            break
    return y


def ticker():
    """mechanical counter: ticks accelerating (8 -> 26 /s) with rising pitch, final 'clack'."""
    y = np.zeros(int(2.1 * SR)); t = 0.0; k = 0
    while t < 1.85:
        rate = 8 + 18 * (t / 1.85) ** 1.3
        g = 0.45 + 0.4 * (t / 1.85)
        place(y, click(2600 + 900 * t / 1.85, 5200, 800, dur=0.03, seed=200 + k) * g, t)
        t += 1.0 / rate; k += 1
    place(y, toggle() * 0.9, t + 0.02)
    return y


# ------------------------------------------------------------------ power off, lock, handle, coins
def power_off():
    n = int(1.1 * SR); t = np.arange(n) / SR
    clack = toggle() * 0.9
    thump = chirp_tone(70 - 25 * (1 - np.exp(-t / 0.08)), adsr(n, 0.002, 0.16)) * 0.9
    bd = sample(SAMPLES / "VCSL/Membranophones/Struck Membranophones/Bass Drum 1/BDrumNew_hit_v3_rr1_Sum.wav")
    bd = lp(bd, 300)[: n] * 0.8
    f_h = 120 * np.exp(-t / 0.45) + 30
    hum = np.sign(np.sin(2 * np.pi * np.cumsum(f_h) / SR)) * 0.5 + np.sin(2 * np.pi * np.cumsum(f_h) / SR)
    hum = lp(hum, 900) * np.exp(-t / 0.28) * 0.18
    y = np.zeros(n)
    place(y, clack, 0); place(y, thump, 0.01); place(y, bd, 0.008); place(y, hum, 0)
    return y


def metal_click(seed, bright=1.0):
    r = np.random.default_rng(seed)
    fs = np.array([1750, 2950, 4300, 6100, 8200]) * bright * r.uniform(0.95, 1.05, 5)
    return modal(fs, [0.012, 0.009, 0.006, 0.004, 0.003], [0.6, 1.0, 0.7, 0.4, 0.25], 0.06, exc_ms=0.2, seed=seed)


def lock_click():
    y = np.zeros(int(0.22 * SR))
    place(y, metal_click(31, 1.0), 0)
    clunk = modal([240, 520, 1300], [0.03, 0.02, 0.01], [1, 0.6, 0.3], 0.1, seed=32) * 0.7
    place(y, clunk, 0.028); place(y, metal_click(33, 1.25) * 0.7, 0.03)
    return y


def handle_rattle():
    r = np.random.default_rng(41)
    y = np.zeros(int(0.65 * SR)); t = 0.0; k = 0
    while t < 0.5:
        place(y, metal_click(400 + k, r.uniform(0.85, 1.1)) * r.uniform(0.4, 1.0), t)
        t += r.uniform(0.035, 0.075); k += 1
    latch = modal([180, 410, 950], [0.05, 0.03, 0.015], [1, 0.5, 0.3], 0.15, seed=42) * 0.6
    place(y, latch, 0.0); place(y, latch * 0.7, t)
    return y


def coins():
    r = np.random.default_rng(51)
    y = np.zeros(int(0.7 * SR))
    for k, t in enumerate([0.0, 0.07, 0.115, 0.2, 0.26]):
        base = r.uniform(3800, 4600)
        fs = base * np.array([1.0, 1.62, 2.31, 2.89, 3.6])
        d = [0.18, 0.12, 0.08, 0.06, 0.04]
        c = modal(fs, d, [1, 0.8, 0.5, 0.35, 0.2], 0.4, exc_ms=0.15, seed=500 + k)
        place(y, c * r.uniform(0.5, 1.0) * (1.0 if k == 0 else 0.8), t)
    return stereo(y, width=0.4)


# ------------------------------------------------------------------ real-sample based
def door_knock():
    files = [VCSL_I / "Cajon/Cajon_hit3_p_rr1.wav", VCSL_I / "Cajon/Cajon_hit3_p_rr2.wav",
             VCSL_I / "Cajon/Cajon_hit3_mp_rr1.wav"]
    hits = [lp(hp(sample(f), 90), 2500)[: int(0.35 * SR)] for f in files]
    y = np.zeros(int(0.9 * SR))
    for (t, h, g) in [(0.0, hits[2], 1.0), (0.17, hits[0], 0.85), (0.34, hits[1], 0.95)]:
        place(y, h, t, g)
    door = modal([95, 160, 260], [0.09, 0.07, 0.05], [1, 0.6, 0.4], 0.3, seed=61) * 0.15
    for t in (0.0, 0.17, 0.34):
        place(y, door, t)
    return y


def alert_ping():
    a = sample(VCSL_I / "Hand Chimes/sus_E5_r01_main.wav", mono=False)
    b = sample(VCSL_I / "Hand Chimes/sus_A#5_r01_main.wav", mono=False)
    # tune the first chime down a semitone so the pair is a soft rising fifth (D#->A#), not a tritone
    a = soxr.resample(a, SR, SR * 2 ** (1 / 12), quality="HQ")
    n = int(1.6 * SR)
    y = np.zeros((n, 2)); place(y, a[:n] * 0.8, 0); place(y, b[:n], 0.13)
    y *= np.exp(-np.arange(n) / SR / 0.55)[:, None]
    return y


def ding():
    gl = sample(VCSL_I / "Glockenspiel/glock_medium_C6_01.wav", mono=False)
    tri = sample(VCSL_I / "Triangles/Triangle1_HitM_v1_rr2_Mid.wav", mono=False)
    n = int(1.8 * SR)
    y = np.zeros((n, 2)); place(y, gl[:n], 0); place(y, hp(tri.T, 3000).T[:n] * 0.35, 0.002)
    y *= np.exp(-np.arange(n) / SR / 0.7)[:, None]
    return y


def riser():
    cy = sample(SAMPLES / "VSCO-2-CE/Percussion/susCymb1-cresc-Median_v1.wav", mono=False)
    env = lp(np.abs(cy.mean(axis=1)), 10)
    pk = int(np.argmax(env))
    dur = 3.6
    seg = cy[max(0, pk - int(dur * SR)): pk + int(0.06 * SR)]
    n = len(seg); t = np.arange(n) / SR
    # rising filtered noise + rising tone, both tied to the same curve
    curve = (t / t[-1]) ** 2.2
    nz = tv_filter(np.random.default_rng(71).standard_normal(n), 400 + 5600 * curve, bw_oct=0.6) * curve * 0.5
    tone = chirp_tone(220 * 2 ** (2.0 * curve), curve ** 1.5) * 0.12
    tone += chirp_tone(330 * 2 ** (2.0 * curve), curve ** 1.5) * 0.06
    y = seg + stereo(nz + tone, width=0.5)
    y[-int(0.05 * SR):] *= np.linspace(1, 0, int(0.05 * SR))[:, None]
    return y


def crowd_murmur():
    """Very light babble built from the project's own VO: 14 reversed, pitch-shifted copies of random
    VO snippets, muffled (300-1800 Hz) -> unintelligible murmur. 4 s, fades in/out."""
    vo = load(ASSETS / "vo.mp3", SR, mono=True)
    r = np.random.default_rng(81)
    dur = 4.0; n = int(dur * SR)
    y = np.zeros((n, 2))
    for k in range(14):
        s = r.uniform(1, len(vo) / SR - 6)
        seg = vo[int(s * SR): int((s + dur + 1) * SR)][::-1]
        semis = r.uniform(-5, 4)
        seg = soxr.resample(seg, SR * 2 ** (semis / 12), SR, quality="HQ")[:n]
        seg = np.pad(seg, (0, n - len(seg)))
        pan = r.uniform(-0.8, 0.8); th = (pan + 1) * np.pi / 4
        g = r.uniform(0.4, 1.0)
        y[:, 0] += seg * np.cos(th) * g; y[:, 1] += seg * np.sin(th) * g
    y = bp(y.T, 300, 1800, order=2).T
    y = lp(y.T, 1500).T
    e = bell_env(n, 0.5, 0.6)
    return y * e[:, None]


# ------------------------------------------------------------------ cinematic seasoning (subtle, sparse)
VSCO_P = SAMPLES / "VSCO-2-CE" / "Percussion"
VCSL_M = SAMPLES / "VCSL" / "Membranophones" / "Struck Membranophones"


def circ_noise(n, lo, hi, seed, tilt_db_oct=0.0):
    """Circular (perfectly loopable) band-limited noise via FFT shaping of an n-sample block."""
    r = np.random.default_rng(seed)
    X = np.fft.rfft(r.standard_normal(n))
    f = np.fft.rfftfreq(n, 1 / SR)
    w = 1.0 / np.sqrt(1 + (lo / np.maximum(f, 1e-3)) ** 4) / np.sqrt(1 + (f / hi) ** 4)
    if tilt_db_oct:
        w *= (np.maximum(f, 20) / 1000.0) ** (tilt_db_oct / 6.02)
    y = np.fft.irfft(X * w, n)
    return y / (np.std(y) + 1e-12)


def periodic_env(n, cycles_amps, seed):
    """Smooth envelope that is exactly periodic over n samples (integer cycles)."""
    r = np.random.default_rng(seed)
    t = np.arange(n) / n
    e = np.zeros(n)
    for k, a in cycles_amps:
        e += a * np.sin(2 * np.pi * k * t + r.uniform(0, 2 * np.pi))
    return e


def sub_impact(f_end=41.2):
    """Soft sub impact for a scale reveal: sine gliding from 1.45x down to f_end (default E1 = 41.2 Hz;
    beds pass their own root/fifth so the 'boom' is in key), soft 8 ms attack, 2nd harmonic for phone
    speakers, real VCSL concert bass drum (pp) for body, faint air tail. Not a trailer boom."""
    n = int(2.2 * SR); t = np.arange(n) / SR
    f = f_end + 0.45 * f_end * np.exp(-t / 0.12)
    env = np.minimum(1, t / 0.008) * np.exp(-t / 0.45)
    sub = chirp_tone(f, env) + 0.25 * chirp_tone(2 * f, env * np.exp(-t / 0.25))
    bd = sample(VCSL_M / "Bass Drum 2/bassdrum_hit_pp1.wav")
    bd = lp(hp(bd, 30), 450)[:n]
    bd = np.pad(bd, (0, n - len(bd))) / (np.abs(bd).max() + 1e-9)
    air = lp(hp(np.random.default_rng(91).standard_normal(n), 200), 900) * np.minimum(1, t / 0.03) * np.exp(-t / 0.6)
    y = sub * 0.9 + bd * 0.5 + air * 0.04
    return stereo(y, width=0.3)


def low_swell(sub_from=30.9, sub_to=41.2):
    """4 s gentle low swell that peaks at its END (lead it into a reveal): bowed cymbal (real, VSCO),
    a rising filtered-noise band and a soft sub rising sub_from -> sub_to Hz (default B0 -> E1; beds pass
    in-key values). Ends with a 0.25 s settle, no hard cut."""
    dur = 4.0; n = int(dur * SR); t = np.arange(n) / SR
    curve = (t / dur) ** 2.4
    cy = sample(VSCO_P / "susCymb1-bow-1.wav", mono=False)
    seg = hp(cy[int(1.0 * SR): int(1.0 * SR) + n].T, 300).T
    seg = np.pad(seg, ((0, n - len(seg)), (0, 0))) / (np.abs(seg).max() + 1e-9)
    nz = tv_filter(np.random.default_rng(93).standard_normal(n), 220 + 1300 * curve, bw_oct=0.7)
    nz /= np.abs(nz).max() + 1e-9
    sub = chirp_tone(sub_from + (sub_to - sub_from) * curve, curve) * 0.6
    y = stereo(nz * 0.5 + sub, width=0.6) * curve[:, None] + seg * (curve ** 1.3)[:, None] * 0.45
    settle = int(0.25 * SR)
    y[-settle:] *= np.cos(np.linspace(0, np.pi / 2, settle))[:, None] ** 2
    return y


def light_shimmer():
    """Light-shaft shimmer (3 s): real bowed vibraphone + wine glass (E and B: sits in E minor, B minor,
    G and D major), high sine twinkles and 6-12 kHz air. Swells in 0.7 s, out over 1.5 s."""
    import instruments as INS
    n = int(3.0 * SR); t = np.arange(n) / SR
    env = np.minimum(1, t / 0.7) ** 1.5 * np.where(t > 1.5, np.cos(np.clip((t - 1.5) / 1.5, 0, 1) * np.pi / 2), 1.0)
    vib = INS.get("vibes_bowed").render(88, 70, 2.6)[:n]
    gl = INS.get("glass").render(83, 70, 2.6)[:n]
    vib = np.pad(vib, ((0, n - len(vib)), (0, 0))); gl = np.pad(gl, ((0, n - len(gl)), (0, 0)))
    r = np.random.default_rng(95)
    tw = np.zeros(n)
    for k in range(70):
        st = r.integers(0, n - 4000); fr = r.uniform(4500, 9500); L = r.integers(1200, 3600)
        g = np.hanning(L) * np.sin(2 * np.pi * fr * np.arange(L) / SR) * r.uniform(0.2, 1.0)
        tw[st:st + L] += g
    air = bp(r.standard_normal(n), 6000, 12000) * 0.5
    y = (vib / (np.abs(vib).max() + 1e-9) * 0.6 + gl / (np.abs(gl).max() + 1e-9) * 0.45
         + stereo(tw * 0.12 + air * 0.25, width=0.8)) * env[:, None]
    return hp(y.T, 400).T


def fg_wipe():
    """Close foreground pass (something crosses the lens): quick dark whoosh, fast L->R."""
    n = int(0.5 * SR)
    a = swish(0.5, 180, 2200, peak=0.48, seed=97, bw=0.8)
    body = lp(np.random.default_rng(98).standard_normal(n), 300) * bell_env(n, 0.5, 3.0) * 0.5
    y = a + body
    p = np.linspace(-0.9, 0.9, n) ** 3; th = (p + 1) * np.pi / 4
    return np.stack([y * np.cos(th), y * np.sin(th)], axis=1) * np.sqrt(2)


LOOP_DUR = 16.0


def air_bed():
    """Loopable 16 s air/wind bed for vast vistas: gentle broadband air with slow gusts, a faint
    whistle band and high hiss. Built circularly (FFT noise + integer-cycle envelopes): loops seamlessly."""
    n = int(LOOP_DUR * SR)
    out = np.zeros((n, 2))
    for ch in range(2):
        gust = 0.65 + 0.35 * np.tanh(1.5 * periodic_env(n, [(2, 0.6), (3, 0.35), (5, 0.2), (9, 0.1)], 300 + ch))
        a = circ_noise(n, 300, 5000, 310 + ch, tilt_db_oct=-1.5)
        b = circ_noise(n, 700, 1400, 320 + ch)
        c = circ_noise(n, 3000, 10000, 330 + ch)
        out[:, ch] = a * gust * 0.8 + b * gust ** 3 * 0.22 + c * (1.1 - 0.5 * gust) * 0.16
    # leave the narrator's 1-4 kHz pocket clear (circular: process 3 copies, keep the middle one)
    from pedalboard import Pedalboard, PeakFilter
    z = np.concatenate([out, out, out]).T.astype(np.float32)
    z = Pedalboard([PeakFilter(2200, -7.0, 0.6)])(z, SR).T.astype(np.float64)
    return z[n:2 * n]


def city_bed():
    """Loopable 16 s distant-city ambience: soft traffic rumble (HP 80 Hz, nothing muddy), far activity
    band, two distant car passes and a far, muffled murmur. Circular construction -> seamless loop."""
    n = int(LOOP_DUR * SR); t = np.arange(n) / n
    out = np.zeros((n, 2))
    vo = load(ASSETS / "vo.mp3", SR, mono=True)
    r = np.random.default_rng(401)
    mur = np.zeros(n)
    for k in range(10):
        s0 = r.uniform(1, len(vo) / SR - LOOP_DUR - 1)
        seg = vo[int(s0 * SR): int(s0 * SR) + n][::-1]
        seg = soxr.resample(seg, SR * 2 ** (r.uniform(-4, 3) / 12), SR, quality="HQ")[:n]
        mur += np.roll(np.pad(seg, (0, n - len(seg))), r.integers(0, n)) * r.uniform(0.4, 1.0)
    mur = np.fft.irfft(np.fft.rfft(mur) * (1 / np.sqrt(1 + (np.fft.rfftfreq(n, 1 / SR) / 700) ** 4))
                       * (1 / np.sqrt(1 + (250 / np.maximum(np.fft.rfftfreq(n, 1 / SR), 1)) ** 4)), n)
    mur /= np.std(mur) + 1e-9
    for ch in range(2):
        traffic = 0.7 + 0.3 * periodic_env(n, [(1, 0.5), (3, 0.3), (7, 0.15)], 410 + ch)
        rum = circ_noise(n, 80, 400, 420 + ch, tilt_db_oct=-1) * traffic
        act = circ_noise(n, 400, 3000, 430 + ch, tilt_db_oct=-2)
        # two car passes (raised-cosine bumps, circular)
        pas = np.zeros(n)
        for c0, w_ in [(0.22 + 0.03 * ch, 0.12), (0.71 - 0.02 * ch, 0.16)]:
            d = np.minimum(np.abs(t - c0), 1 - np.abs(t - c0))
            pas += np.where(d < w_, 0.5 * (1 + np.cos(np.pi * d / w_)), 0)
        car = circ_noise(n, 250, 1600, 440 + ch, tilt_db_oct=-3) * pas
        out[:, ch] = rum * 0.35 + act * 0.16 + car * 0.25 + mur * 0.12
    from pedalboard import Pedalboard, PeakFilter, HighpassFilter
    z = np.concatenate([out, out, out]).T.astype(np.float32)
    z = Pedalboard([HighpassFilter(70), PeakFilter(2200, -5.0, 0.6)])(z, SR).T.astype(np.float64)
    return z[n:2 * n]


def finalize_loop(name, y, desc=""):
    """Loopable ambience: no trimming, no fades (the file is circular); DC-free; peak -6 dBFS."""
    y = np.asarray(y, dtype=np.float64)
    y = y - y.mean(axis=0)
    y = y / (np.abs(y).max() + 1e-12) * db2a(-6.0)
    save(OUT / f"{name}.wav", y)
    seam = np.abs(y[0] - y[-1]).max() / (np.median(np.abs(np.diff(y, axis=0))) + 1e-12)
    CATALOG.append((name, len(y) / SR, 0, desc + f" [loopable; seam step {seam:.1f}x median step]"))
    return y


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    make_pencils()
    for nm, f, desc in [("pop_low", 260, "soft pop, low (A3-ish) - big object lands / appears"),
                        ("pop_mid", 400, "soft pop, mid - standard element pop-in"),
                        ("pop_high", 620, "soft pop, high - small element / label pop-in")]:
        finalize(nm, pop(f, seed=f), 40, desc=desc)
    finalize("bubble_pop", bubble(), 15, desc="tiny rising bubble 'blip' for keyword highlight boxes")
    finalize("card_flip", card_flip(), 30, desc="card swish + soft landing tap, for the 3D Y-axis card flip")
    finalize("paper_flip", paper_flip(), 40, desc="paper page-turn flutter (crinkly), alt. transition")
    finalize("whoosh_soft", whoosh(), 60, desc="soft airy whoosh, pans L->R (slides, camera moves)")
    finalize("click_light", click(), 15, desc="light UI/pen click (cursor, small toggle)")
    finalize("switch_toggle", toggle(), 20, desc="two-stage lever switch (on/off)")
    finalize("power_off_thunk", power_off(), 80, desc="lights-out: switch clack + low thump + dying hum")
    finalize("alert_ping", alert_ping(), 120, desc="gentle two-note chime (real hand chimes)")
    finalize("typing_tick", key_tick(7), 10, desc="single keyboard key tick")
    finalize("typing_burst", typing_burst(), 20, desc="1.2 s of human-timed typing")
    finalize("counter_ticker", ticker(), 30, desc="mechanical counter accelerating 8->26 ticks/s + stop clack")
    finalize("crowd_murmur", crowd_murmur(), 300, desc="very light unintelligible crowd murmur (4 s)")
    finalize("door_knock", door_knock(), 60, desc="three knuckle knocks on wood (real cajon + door body)")
    finalize("handle_rattle", handle_rattle(), 40, desc="metal door handle jiggle/rattle")
    finalize("lock_click", lock_click(), 30, desc="lock/latch click + clunk")
    finalize("coin_chink", coins(), 80, desc="a few coins clinking (cash)")
    finalize("ding", ding(), 150, desc="bright 'idea' ding (real glockenspiel, ~2.1 kHz + a touch of triangle)")
    finalize("riser_leak", riser(), 20, desc="3.6 s riser: real cymbal crescendo + rising noise/tone; peak at end")
    # cinematic seasoning (subtle, sparse)
    finalize("sub_impact", sub_impact(), 300, thr_db=-70, desc="soft sub impact for a big scale reveal (60->41 Hz, E1, + soft bass drum)")
    finalize("low_swell", low_swell(), 20, desc="4 s gentle low swell, peaks at its end (lead into a reveal)")
    finalize("light_shimmer", light_shimmer(), 200, desc="light-shaft shimmer: bowed vibes + wine glass (E/B) + twinkles + air")
    finalize("fg_wipe", fg_wipe(), 40, desc="close foreground pass / wipe transition (replaces the retired card flip)")
    finalize_loop("air_bed", air_bed(), desc="16 s air/wind for vast vistas")
    finalize_loop("city_bed", city_bed(), desc="16 s distant city ambience")
    print(f"{'name':22s} {'dur':>6s} clicks  description")
    for nm, d, c, desc in CATALOG:
        print(f"{nm:22s} {d:6.2f} {c:6d}  {desc}")


if __name__ == "__main__":
    main()
