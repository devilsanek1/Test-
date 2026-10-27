#!/usr/bin/env python3
"""Video 2 ("One Small Window") sound effects, all designed NEW for this film -> public/v2r/sfx/*.wav, and the cue
sheet public/v2r/cues.json ([{src, t, gain, note}], the bed first at t 0).

    python3 audio/v2r/sfx.py            # render every sound + write cues.json (~20 s)

Every sound is synthesised here from first principles (filtered noise, modal resonators, glides, impulse trains):
no samples, no house kit, no platform sounds. Families (TREATMENT s7): one positive phone sound (the exit ding,
two rising bell notes a fourth apart, C6 -> F6, the bed's key) + a sent-swoosh tail; one wooden tick at ONE pitch
for every ghost; ONE board clack and ONE pen for all three statement boards (A5: Google's and hers identical); a
pop / hop family for Pip; paper and graphite for the drawn world; glass for light. Files: 48 kHz, 24-bit stereo,
peak -1 dBFS, trimmed, DC-free; the level in the film is the cue's `gain` (sheet.py "under" -> measured gain).
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from dsp import (SR, PUBLIC, VOICE, N_FILM, np, bp, lp, hp, peak_eq, env_ad, env_bell, modal, chirp, tv_bandpass,  # noqa
                 place, pan, pan_sweep, widen, st, noise, rng, n_of, tt, finish_sfx, db2a, load, short_term_lufs,
                 click_report, frame_t, FPS, FILM_DUR)
import sheet  # noqa: E402
import measure as M  # noqa: E402

OUT = PUBLIC / "sfx"
SOUNDS = {}


def sound(fn):
    SOUNDS[fn.__name__] = fn
    return fn


def buf(dur, stereo=True):
    return np.zeros((n_of(dur), 2)) if stereo else np.zeros(n_of(dur))


def put(dst, src, t, gain=1.0, p=0.0):
    """place mono (panned) or stereo src into a stereo dst."""
    s = pan(src, p) if src.ndim == 1 else src
    return place(dst, s, t, gain)


# ------------------------------------------------------------------ primitives
def graphite(dur, seed, speed=None, bright=1.0, grain=0.07):
    """Pencil on paper: band-limited hiss + sparse 'tooth' grains (brighter with speed) + a quiet paper body."""
    n = n_of(dur); r = rng(seed)
    sp = np.ones(n) if speed is None else speed
    hiss = bp(r.standard_normal(n), 1800, 7800, 2)
    g = (r.random(n) < grain) * r.standard_normal(n)
    tooth = bp(g, 2600, 9500, 2)
    body = bp(r.standard_normal(n), 320, 1300, 2)
    y = (0.55 * hiss + 0.9 * tooth) * sp ** 1.5 * bright + 0.22 * body * sp
    return y


def stroke_env(n, att=0.006, rel=0.018):
    e = np.ones(n)
    a = min(n // 3, int(att * SR)); r_ = min(n // 3, int(rel * SR))
    e[:a] = np.sin(0.5 * np.pi * np.linspace(0, 1, a)) ** 2
    e[n - r_:] = np.cos(0.5 * np.pi * np.linspace(0, 1, r_)) ** 2
    return e


def felt_pen(n_strokes, seed, total=None):
    """ONE pen for every drawn board line: felt tip on enamel, short strokes, a faint squeak that follows speed."""
    r = rng(seed)
    segs = []; t = 0.0
    for k in range(n_strokes):
        d = r.uniform(0.045, 0.11); g = r.uniform(0.018, 0.045)
        segs.append((t, d)); t += d + g
    if total:
        segs = [(s * total / t, d * total / t) for (s, d) in segs]; t = total
    out = np.zeros(n_of(t + 0.05))
    for k, (s, d) in enumerate(segs):
        n = n_of(d); tl = np.arange(n) / SR
        speed = 0.65 + 0.35 * np.sin(np.pi * tl / d) ** 0.7
        fib = bp(r.standard_normal(n), 2200, 7500, 2) * 0.6 + bp(r.standard_normal(n), 500, 1000, 1) * 0.08
        grains = bp((r.random(n) < 0.03) * r.standard_normal(n), 4000, 10000, 2) * 0.5
        f_sq = r.uniform(4200, 5000) * (0.92 + 0.12 * speed)
        squeak = np.sin(2 * np.pi * np.cumsum(f_sq) / SR) * 0.05 * speed
        tap = np.zeros(n); tap[: n_of(0.012)] = modal([3100, 5200], [0.003, 0.002], [1, .4], 0.012, 0.15, seed + k)
        y = (fib + grains) * speed * stroke_env(n, 0.005, 0.015) + squeak * stroke_env(n, 0.01, 0.02) + 0.35 * tap
        place(out, y, s, r.uniform(0.8, 1.0))
    return lp(out, 9000, 2)


def thud(f0=110, f1=70, dur=0.09, dec=0.024, seed=0):
    t = tt(dur)
    y = chirp(f0, f1, dur, 1.0) * np.exp(-t / dec)
    y += 0.5 * lp(noise(dur, seed), 420) * np.exp(-t / 0.008)
    return y


def popper(f0, f1, dur, dec, seed=0, puff=0.15):
    """the pop family: a short downward glide with a felt attack + a breath of air."""
    t = tt(dur)
    y = chirp(f0, f1, dur, 1.6) * env_ad(len(t), 0.0015, dec)
    y += puff * bp(noise(dur, seed), 900, 5000) * env_ad(len(t), 0.001, dec * 0.5)
    return y


def wood(freqs, decs, amps, dur, exc=0.5, seed=0):
    return modal(freqs, decs, amps, dur, exc_ms=exc, seed=seed)


def glass_tink(f=4698.6, seed=0):
    return modal([f, 1.503 * f, 2.01 * f], [0.020, 0.010, 0.006], [1, .35, .12], 0.09, exc_ms=0.15, seed=seed)


def flap(dur, lo, hi, seed, att=0.004, dec=0.010):
    return bp(noise(dur, seed), lo, hi, 2) * env_ad(n_of(dur), att, dec)


# ------------------------------------------------------------------ V2S1 (0.00-6.10)
@sound
def pencil_flood():
    """f0: three quick hatch strokes, then the colour wash floods out from the sun (0.06-0.40), a tiny glint at
    0.30 when her teal coat arrives last (f18)."""
    out = buf(0.62)
    for k, (s, d, p) in enumerate([(0.00, 0.07, -0.25), (0.075, 0.06, 0.05), (0.14, 0.08, 0.3)]):
        n = n_of(d)
        sp = 0.7 + 0.3 * np.sin(np.pi * np.arange(n) / n)
        put(out, graphite(d, 100 + k, sp) * stroke_env(n, 0.004, 0.015), s, 0.55, p)
    d = 0.34; n = n_of(d)                     # the wash is done by ~0.40, before the lamp click and the ding
    wash = tv_bandpass(noise(d, 7), np.geomspace(480, 2600, n), bw_oct=1.0) * env_bell(n, 0.40, 1.6)
    out[n_of(0.06): n_of(0.06) + n] += widen(wash, 0.6) * 0.55
    gl = (np.sin(2 * np.pi * 2093.0 * tt(0.12)) + 0.5 * np.sin(2 * np.pi * 3136.0 * tt(0.12))) * env_ad(n_of(0.12), 0.003, 0.03)
    put(out, gl, 0.30, 0.10, 0.25)
    return out


@sound
def lamp_click():
    """a small rocker switch, press + release 14 ms apart, with a little body (W, right of frame)."""
    out = buf(0.09)
    for k, (s, g) in enumerate([(0.0, 1.0), (0.014, 0.55)]):
        c = wood([2300 * (1 + .04 * k), 3900, 6100, 1250], [0.004, 0.003, 0.002, 0.006], [1, .7, .4, .5], 0.03, 0.15, 30 + k)
        c[: n_of(0.03)] += 0.4 * np.sin(2 * np.pi * 190 * tt(0.03)) * np.exp(-tt(0.03) / 0.010)
        put(out, c, s, g, 0.35)
    return out


@sound
def exit_ding():
    """OUR positive phone sound: two soft glass-bell notes rising a fourth (C6 -> F6, the bed's key) + a short
    sent-swoosh rising away (~0.35 s). Never Apple's or Instagram's."""
    out = buf(1.30)

    def bell(f, seed):
        y = modal([f, 2.0 * f, 3.01 * f, 4.17 * f], [0.42, 0.20, 0.09, 0.05], [1, .22, .07, .03], 1.15, 0.9, seed)
        y += 0.18 * np.sin(2 * np.pi * f / 2 * tt(1.15)) * env_ad(n_of(1.15), 0.004, 0.12)
        return y
    put(out, bell(1046.50, 41), 0.000, 1.0, -0.15)
    put(out, bell(1396.91, 42), 0.085, 0.95, 0.15)
    d = 0.27; n = n_of(d)
    sw = tv_bandpass(noise(d, 43), np.geomspace(2600, 8000, n), bw_oct=0.7) * env_bell(n, 0.7, 1.5)
    out[n_of(0.10): n_of(0.10) + n] += pan_sweep(sw, -0.3, 0.5) * 0.22
    return out


@sound
def door_glide():
    """the glass doors slide apart (0.07 s to open), a soft stop, a breath of air."""
    out = buf(0.36); d = 0.32; n = n_of(d); t = tt(d)
    e = np.where(t < 0.07, (t / 0.07) ** 0.8, np.exp(-(t - 0.07) / 0.06))
    hiss = bp(noise(d, 51), 300, 2200) * e
    roll = lp(noise(d, 52), 140) * (0.5 + 0.5 * np.sin(2 * np.pi * 23 * t)) * e * 0.6
    put(out, hiss + roll, 0.0, 1.0, 0.15)
    put(out, wood([95, 210], [0.03, 0.02], [1, .4], 0.08, 1.0, 53), 0.075, 0.35, 0.15)
    return out


@sound
def step_thup():
    """she steps out onto the towpath: a soft heel on stone + a little grit."""
    y = thud(115, 72, 0.10, 0.022, 61)
    y[: n_of(0.02)] += 0.06 * hp(noise(0.02, 62), 2500) * np.exp(-tt(0.02) / 0.005)
    return pan(y, 0.1)


@sound
def letter_pops():
    """the six canopy letters fill-pop one by one: tiny bubble pops, one pitch, 45 ms apart."""
    out = buf(0.36); r = rng(70)
    for k in range(6):
        f = 1900 * r.uniform(0.98, 1.02)
        put(out, popper(f, f * 0.58, 0.022, 0.006, 70 + k, 0.08), 0.045 * k, r.uniform(0.85, 1.0), 0.02 + 0.035 * k)
    return out


@sound
def wings():
    """five birds lift off and wheel west: wing-clap starts, flap trains at 8.5-11 Hz fading as they go."""
    out = buf(1.35); r = rng(80)
    for b, s in enumerate([0.0, 0.04, 0.09, 0.14, 0.21]):
        rate = r.uniform(8.5, 11.0); nfl = r.integers(7, 11); c = r.uniform(0.85, 1.2)
        p0 = r.uniform(-0.1, 0.25)
        for k in range(nfl):
            g = np.exp(-k / (nfl * 0.45)) * (1.4 if k < 2 else 1.0)
            f = flap(0.034, 420 * c, 3300 * c, 800 + 13 * b + k, 0.003, 0.009)
            if k < 2:                       # the take-off wing clap: a soft-edged little crack, not a click
                cl = hp(noise(0.006, 900 + b), 1200) * np.sin(np.pi * np.arange(n_of(0.006)) / n_of(0.006)) ** 2
                f[: len(cl)] += 0.35 * cl
            put(out, f, s + k / rate + r.normal(0, 0.004), g * r.uniform(0.8, 1.0), p0 - 0.06 * k)
    return out


@sound
def ghost_tick():
    """ONE soft wooden tick, ONE pitch (C6 main mode): felt mallet on a small hard-wood block."""
    y = wood([1046.5, 2721.0, 4605.0], [0.022, 0.008, 0.004], [1.0, 0.12, 0.03], 0.12, exc=1.6, seed=91)
    y += 0.55 * np.sin(2 * np.pi * 523.25 * tt(0.12)) * np.exp(-tt(0.12) / 0.016)
    y[: n_of(0.003)] += 0.06 * lp(noise(0.003, 92), 2500)
    return pan(lp(y, 3000, 2), -0.1)


@sound
def outline_pops():
    """'life': three bare ink outlines pop in down the bending towpath: airy, the same pitch, softer as they recede."""
    out = buf(0.24)
    for k, (g, p) in enumerate([(1.0, -0.2), (0.78, -0.32), (0.6, -0.44)]):
        d = 0.05; n = n_of(d)
        puff = bp(noise(d, 110 + k), 2500, 8000) * env_ad(n, 0.002, 0.012) * 0.6
        puff += 0.25 * lp(noise(d, 115 + k), 700) * env_ad(n, 0.002, 0.010)
        blip = np.sin(2 * np.pi * 4186.0 * tt(d)) * env_ad(n, 0.001, 0.009) * 0.5
        put(out, puff + blip, 0.06 * k, g, p)
    return out


@sound
def ear_flap():
    """Pip's two big leaf ears fold over its head: two soft leathery flaps."""
    out = buf(0.16)
    for k, (s, g) in enumerate([(0.0, 1.0), (0.055, 0.85)]):
        d = 0.07; n = n_of(d); t = tt(d)
        y = hp(lp(noise(d, 120 + k), 1400), 180) * env_ad(n, 0.006, 0.022) * (0.75 + 0.25 * np.sin(2 * np.pi * 70 * t))
        put(out, y, s, g, 0.2)
    return out


@sound
def whoosh_dive():
    """the push-through into her dark window: air rising then settling, a muffled 'through the glass' bump."""
    d = 0.44; n = n_of(d)
    c = np.concatenate([np.geomspace(350, 1600, int(n * 0.62)), np.geomspace(1600, 900, n - int(n * 0.62))])
    y = tv_bandpass(noise(d, 130), c, bw_oct=1.1) * env_bell(n, 0.62, 1.6)
    y += 0.35 * lp(noise(d, 131), 220) * env_bell(n, 0.6, 2.0)
    out = widen(y, 0.5)
    put(out, wood([140, 330], [0.05, 0.03], [1, .4], 0.14, 1.2, 132), 0.30, 0.3, 0.0)
    return out


# ------------------------------------------------------------------ V2S2 (6.10-12.98)
@sound
def pencil_ring():
    """an ink ring drawn round her dark window: one continuous circular graphite stroke, a lift at the end."""
    d = 0.44; n = n_of(d); t = tt(d)
    sp = 0.72 + 0.28 * np.sin(2 * np.pi * 2.3 * t + 0.6)
    y = graphite(d, 140, sp, 1.0) * stroke_env(n, 0.008, 0.035)
    return pan(y, -0.3)


@sound
def board_clack():
    """THE board sound (all three statement A-boards + the deal board): legs touch, then a warm hollow wooden clack."""
    out = buf(0.40)
    put(out, wood([1750, 2900], [0.006, 0.004], [1, .6], 0.03, 0.2, 150), 0.0, 0.35, -0.15)
    b = wood([196, 457, 861, 1404, 2240, 3310], [0.10, 0.06, 0.04, 0.025, 0.014, 0.008], [1, .7, .5, .35, .2, .1],
             0.36, 0.5, 151)
    b[: n_of(0.02)] += 0.4 * bp(noise(0.02, 152), 600, 5000) * env_ad(n_of(0.02), 0.001, 0.006)
    put(out, b, 0.016, 1.0, -0.15)
    return out


@sound
def light_clicks():
    """'staff': the five windows round hers turn a cooler white: five tiny clicks, left of frame."""
    out = buf(0.22); r = rng(160)
    for k, (s, p) in enumerate(zip([0, 0.035, 0.08, 0.12, 0.165], [-0.38, -0.14, -0.65, -0.39, -0.15])):
        f = r.uniform(0.95, 1.05)
        put(out, wood([2600 * f, 4300 * f], [0.003, 0.002], [1, .5], 0.02, 0.12, 160 + k), s, r.uniform(0.8, 1.0), p)
    return out


@sound
def notebook_flap():
    """'BBC': the reporter's notebook opens: a papery flap with a little crinkle."""
    d = 0.22; n = n_of(d); r = rng(170)
    y = bp(noise(d, 171), 700, 5500) * env_ad(n, 0.018, 0.05)
    cr = bp((r.random(n) < 0.02) * r.standard_normal(n), 2000, 8000) * np.exp(-tt(d) / 0.05) * 0.6
    y += cr + 0.3 * lp(noise(d, 172), 300) * env_ad(n, 0.01, 0.03)
    return pan(y, 0.2)


def slat_rattle(dur, seed, rate=72.0, dense=1.0):
    """a blind's slats knocking down: an irregular impulse train through a short slat resonance."""
    n = n_of(dur); r = rng(seed)
    imp = np.zeros(n); t = 0.0
    while t < dur:
        imp[min(n - 1, n_of(t))] += r.uniform(0.4, 1.0)
        t += r.uniform(0.6, 1.4) / (rate * dense)
    ir = wood([1650, 2900, 5200, 900], [0.004, 0.003, 0.002, 0.006], [.8, .4, .3, .6], 0.02, 0.3, seed + 1)
    y = np.convolve(imp, ir)[:n]
    return y * env_ad(n, 0.01, dur * 0.6)


@sound
def blinds_five():
    """'scared': five blinds drop to half one by one (10.26-10.60), each ending on a soft rail tap; left of frame."""
    out = buf(0.62)
    for k, (s, p) in enumerate(zip([0, 0.085, 0.17, 0.255, 0.34], [-0.38, -0.14, -0.65, -0.39, -0.15])):
        y = np.zeros(n_of(0.18))
        place(y, slat_rattle(0.11, 180 + 7 * k), 0.0)
        place(y, wood([240, 620], [0.02, 0.01], [1, .4], 0.06, 0.6, 190 + k), 0.105, 0.5)
        put(out, y, s, 0.9 + 0.025 * k, p)
    return out


@sound
def blind_thump():
    """'contracts': W2's blind comes fully down: a short rattle into the bottom rail's thump."""
    out = buf(0.36)
    put(out, slat_rattle(0.16, 200, 80, 1.2), 0.0, 0.8, -0.38)
    t_ = wood([160, 410, 980], [0.045, 0.02, 0.01], [1, .5, .25], 0.16, 0.8, 201)
    t_[: n_of(0.004)] += 0.3 * hp(noise(0.004, 202), 1500)
    put(out, t_, 0.15, 1.0, -0.38)
    return out


@sound
def notebook_clap():
    """the notebook claps shut: a soft paper clap, a whisper of pages."""
    d = 0.16; n = n_of(d)
    y = hp(lp(noise(d, 210), 4500), 300) * env_ad(n, 0.001, 0.018)
    y += 0.5 * np.sin(2 * np.pi * 240 * tt(d)) * env_ad(n, 0.001, 0.015)
    y += 0.12 * bp(noise(d, 211), 2000, 6000) * env_bell(n, 0.35, 1.5)
    return pan(y, 0.2)


# ------------------------------------------------------------------ V2S3 / V2S4 (12.98-20.55)
@sound
def swap_pop():
    """the window match-cut: one soft round pop."""
    y = popper(1000, 480, 0.06, 0.018, 220, 0.2)
    return pan(y, -0.25)


@sound
def pip_land():
    """Pip's teddy-bear soles land: a soft padded 'pmf'."""
    d = 0.09; n = n_of(d)
    y = hp(lp(noise(d, 230), 900), 120) * env_ad(n, 0.004, 0.02)
    y += 0.5 * np.sin(2 * np.pi * 150 * tt(d)) * env_ad(n, 0.003, 0.02)
    return pan(y, 0.0)


@sound
def pip_hop():
    """Pip hops: a small springy upward glide and a breath of air (the hop half of the pop family)."""
    d = 0.11; n = n_of(d)
    f = np.concatenate([np.geomspace(420, 980, n_of(0.075)), np.full(n - n_of(0.075), 980.0)])
    y = 0.8 * np.sin(2 * np.pi * np.cumsum(f) / SR) * env_ad(n, 0.006, 0.035)
    y += 0.12 * np.sin(2 * np.pi * np.cumsum(np.geomspace(840, 1960, n)) / SR) * env_ad(n, 0.006, 0.025)
    y += 0.25 * bp(noise(d, 240), 1000, 5000) * env_ad(n, 0.002, 0.015)
    return pan(y, 0.0)


@sound
def pop_high():
    """a small bright pop: a tag or a line landing."""
    return pan(popper(2600, 1700, 0.035, 0.008, 250, 0.2), 0.0)


@sound
def pop():
    """the mid pop: a line popping on."""
    return pan(popper(1400, 760, 0.05, 0.014, 260, 0.15), 0.0)


@sound
def pop_low():
    """the low pop: a plaque landing."""
    y = popper(760, 380, 0.07, 0.02, 270, 0.1)
    y += 0.3 * np.sin(2 * np.pi * 190 * tt(0.07)) * env_ad(n_of(0.07), 0.002, 0.02)
    return pan(y, 0.0)


@sound
def pen_tick():
    """the tag's second build: the pen touches and makes one short stroke."""
    return pan(felt_pen(2, 280, total=0.14), 0.25)


@sound
def steps_stop():
    """her last two steps on the towpath paving; the second (at +0.30 s = 17.96) plants and stops, a tiny scuff."""
    out = buf(0.52)
    put(out, thud(105, 70, 0.08, 0.016, 290) * 0.7, 0.0, 1.0, 0.3)
    s = thud(120, 74, 0.10, 0.022, 291)
    s[: n_of(0.04)] += 0.05 * hp(noise(0.04, 292), 1500) * np.exp(-tt(0.04) / 0.012)
    put(out, s, 0.30, 1.0, 0.3)
    sc = bp(noise(0.08, 293), 1000, 5000) * env_bell(n_of(0.08), 0.3, 1.5) * 0.06
    put(out, sc, 0.33, 1.0, 0.3)
    return out


@sound
def plate_knock():
    """'military': the DEC 2025 plate builds on the fingerpost: a small hollow wood knock + a pop."""
    out = buf(0.24)
    put(out, wood([520, 1180, 2050, 3300], [0.05, 0.025, 0.012, 0.006], [1, .55, .3, .12], 0.18, 0.4, 300), 0.0, 1.0, -0.3)
    put(out, popper(1500, 900, 0.035, 0.01, 301, 0.1), 0.035, 0.45, -0.3)
    return out


@sound
def pen_short():
    """THE pen, a short line (0.38 s): the APR plate, 'AI principles'."""
    return pan(felt_pen(4, 310, total=0.38), -0.15)


@sound
def pen_long():
    """THE pen, a long line (1.30 s): 'of any kind' on Google's board, her quote on hers (identical)."""
    return pan(felt_pen(12, 320, total=1.30), -0.15)


@sound
def glass_tone():
    """the sun match-cuts: a soft singing-glass tone on A5 (the bed's key), slow beating, a breath of air."""
    d = 1.7; n = n_of(d); t = tt(d)
    e = env_ad(n, 0.06, 0.75)
    y = (np.sin(2 * np.pi * 880.0 * t) + 0.8 * np.sin(2 * np.pi * 881.3 * t + 1.1)) * e
    y += 0.25 * np.sin(2 * np.pi * 1318.5 * t + 0.4) * env_ad(n, 0.08, 0.5)
    y += 0.06 * np.sin(2 * np.pi * 880.0 * 2.71 * t) * env_ad(n, 0.01, 0.15)
    y += 0.03 * hp(noise(d, 330), 6000) * env_bell(n, 0.2, 2.0)
    return widen(y * 0.5, 0.35) * np.array([1.1, 0.9])


# ------------------------------------------------------------------ V2S5 / V2S6 (20.55-28.06)
@sound
def calendar_flip():
    """'April': the sun flips into a calendar page and back by 21.20: a paper flip, a softer flip back."""
    out = buf(0.66); r = rng(340)
    for k, (s, g) in enumerate([(0.0, 1.0), (0.40, 0.6)]):
        d = 0.17; n = n_of(d)
        y = bp(noise(d, 341 + k), 700, 6500) * env_bell(n, 0.25, 1.2)
        y += bp((r.random(n) < 0.015) * r.standard_normal(n), 2500, 9000) * np.exp(-tt(d) / 0.05) * 0.5
        y += 0.25 * lp(noise(d, 343 + k), 400) * env_ad(n, 0.01, 0.03)
        put(out, y, s, g, -0.4)
    return out


@sound
def blossom_pops():
    """the slot's trees burst into blossom in 4 frames: a scatter of tiny petal pops and a breath of air."""
    out = buf(0.30); r = rng(350)
    for k in range(16):
        f = r.uniform(2400, 4200); d = 0.02
        y = np.sin(2 * np.pi * f * tt(d)) * np.exp(-tt(d) / 0.004) + 0.2 * hp(noise(d, 351 + k), 3000) * np.exp(-tt(d) / 0.002)
        put(out, y, r.uniform(0, 0.13), r.uniform(0.3, 1.0), r.uniform(-0.8, 0.2))
    d = 0.18
    put(out, bp(noise(d, 370), 1500, 7000) * env_bell(n_of(d), 0.3, 1.5) * 0.25, 0.0, 1.0, -0.3)
    return out


@sound
def wipe_air():
    """the lamppost wipes the backs at the crane's peak speed: a close, quick air pass, right to left."""
    d = 0.30; n = n_of(d)
    c = np.concatenate([np.geomspace(300, 1800, n // 2), np.geomspace(1800, 600, n - n // 2)])
    y = tv_bandpass(noise(d, 380), c, bw_oct=1.0) * env_bell(n, 0.5, 1.4)
    y += 0.3 * lp(noise(d, 381), 250) * env_bell(n, 0.5, 2.0)
    return pan_sweep(y, 0.7, -0.7)


@sound
def window_ticks():
    """windows warm on along a wing / a facade, one by one: seven tiny far switch ticks, never accelerating."""
    out = buf(0.66); r = rng(390)
    for k, s in enumerate([0, 0.09, 0.19, 0.27, 0.38, 0.47, 0.58]):
        y = wood([2200, 3700], [0.0035, 0.0022], [1, .45], 0.015, 0.15, 391 + k)
        put(out, lp(y, 6000), s, r.uniform(0.7, 1.0), -0.5 + k / 6)
    return out


# ------------------------------------------------------------------ V2S7 / V2S8 (28.06-39.08)
@sound
def lamp_run():
    """lights coming on in a run (Google's string lights 30.04 = her lane's lamps 37.18, identical): eight small
    glass tinks at one pitch (D8, above the voice's diction band), evenly spaced, panning across; never the ding."""
    out = buf(0.66)
    for k in range(8):
        put(out, glass_tink(4698.6 * (1 + 0.003 * ((k % 3) - 1)), 400 + k), 0.075 * k, 1.0 - 0.04 * k, -0.4 + 0.8 * k / 7)
    return out


@sound
def boat_chug():
    """the narrowboat wipes the frame: a soft diesel putter passing close (6.2 Hz) and its bow wash, left to right."""
    d = 1.0; n = n_of(d); t = tt(d)
    y = np.zeros(n)
    for k in range(int(d * 6.2)):
        p = np.sin(2 * np.pi * 62 * tt(0.08)) * np.exp(-tt(0.08) / 0.03)
        p += 0.3 * np.sin(2 * np.pi * 124 * tt(0.08)) * np.exp(-tt(0.08) / 0.02)
        p += 0.5 * lp(noise(0.08, 410 + k), 300) * np.exp(-tt(0.08) / 0.02)
        place(y, p, k / 6.2)
    y *= env_bell(n, 0.45, 1.5)
    y += 0.35 * hp(lp(noise(d, 430), 900), 150) * env_bell(n, 0.55, 1.6)
    return pan_sweep(y, -0.6, 0.6)


@sound
def door_latch():
    """her teal door shuts behind her down the lane: a soft wooden close, the latch, a little of the street."""
    out = buf(0.70)
    th = wood([92, 185, 340], [0.06, 0.035, 0.02], [1, .6, .3], 0.42, 1.0, 440)
    th[: n_of(0.06)] += 0.4 * lp(noise(0.06, 441), 600) * np.exp(-tt(0.06) / 0.025)
    put(out, th, 0.0, 1.0, 0.25)
    put(out, wood([2450, 4100, 5900], [0.006, 0.004, 0.003], [1, .6, .3], 0.03, 0.1, 442), 0.035, 0.5, 0.25)
    irs = [noise(0.25, 443 + k) * np.exp(-tt(0.25) / 0.06) for k in range(2)]
    wet = np.stack([np.convolve(out[:, k], irs[k])[: len(out)] for k in range(2)], 1)
    return out + wet / (np.abs(wet).max() + 1e-9) * np.abs(out).max() * 0.12


@sound
def cloth_wipe():
    """'her words': the café owner wipes the board clean in ONE stroke: cloth on enamel, left to right."""
    d = 0.40; n = n_of(d); t = tt(d)
    g = lp(noise(d, 450), 60)
    grain = np.clip(1.0 + 0.3 * g / (np.std(g) + 1e-12), 0.3, 1.6)
    y = bp(noise(d, 451), 400, 4500) * env_bell(n, 0.45, 1.3) * grain
    y += 0.03 * np.sin(2 * np.pi * 1900 * t) * env_bell(n, 0.5, 2.0)
    return pan_sweep(y, -0.5, 0.2)


@sound
def pencil_reverse():
    """the un-build: a pencil scribble played backwards, swelling INTO the loop seam (it ends exactly on the film's
    last frame and meets 0.00's pencil flood). Exactly 16 frames long."""
    d = 16 / FPS; n = n_of(d); t = tt(d)
    sp = 0.6 + 0.4 * np.abs(np.sin(2 * np.pi * 9 * t))
    y = graphite(d, 460, sp, 1.0) * env_ad(n, 0.004, 0.09)
    y = y[::-1].copy()
    return pan(y, 0.0)


# ------------------------------------------------------------------ measurement + cue sheet
LOCAL_UNDER = 9.0      # house: every SFX >= 8 dB under the voice where it lands (broadband, momentary), + 1 dB margin
#                        (the bus guard holds the same 9 dB for the cues that sound together)
BAND_UNDER = 6.0       # and >= 6 dB under the voice's own 1-4 kHz (diction) where it lands (noise-like sounds)
BAND_UNDER_TONAL = 0.0  # tonal sounds (sheet.TONAL): never above the voice's 1-4 kHz where it lands


def gain_for(V, t, under, lv_ev, lb_ev, dur, tonal):
    """the cue's gain (dB): `under` the voice's speech level, and, where it lands on speech, LOCAL_UNDER under the
    voice there and BAND_UNDER under its 1-4 kHz there. Returns (gain_db, the rule that set it)."""
    rules = {"sheet": V["vref"] - under - lv_ev}
    here = M.local_voice(V, t, dur)
    if here is not None:
        rules["local"] = here[0] - LOCAL_UNDER - lv_ev
        rules["band"] = here[1] - (BAND_UNDER_TONAL if tonal else BAND_UNDER) - lb_ev
    k = min(rules, key=rules.get)
    return rules[k], k


def bus_guard(rows, arrs, V, iters=8, hop=0.05):
    """The cues as one bus: wherever the SFX that sound TOGETHER come within 9 dB of the speaking voice (broadband)
    or reach its 1-4 kHz level (with the bed's own 1-4 kHz counted), the supporting sounds of that moment come down
    (never the moment's lead, the loudest cue right there, unless it plays alone), a whole file at a time so
    every relation in the sheet holds. Returns {file: extra dB}."""
    bed = load(PUBLIC / "music_bed.wav")[:N_FILM] if (PUBLIC / "music_bed.wav").exists() else np.zeros((N_FILM, 2))
    k5 = int(round(hop / M.HOP))
    tv, lv, lb, sp = V["t"][::k5], V["lv"][::k5], V["lb"][::k5], V["sp"][::k5]
    tb_, bb = M.band_rms(bed, hop=hop)
    n = min(len(tv), len(bb)); tv, lv, lb, sp, bb = tv[:n], lv[:n], lb[:n], sp[:n], bb[:n]
    trk = []
    for r in rows:
        one = np.zeros((N_FILM, 2)); place(one, arrs[r["name"]], frame_t(r["t"]))
        _, l = short_term_lufs(one, win=0.4, hop=hop); _, b = M.band_rms(one, hop=hop)
        trk.append((np.maximum(l[:n], -120.0), np.maximum(b[:n], -150.0)))
    extra = {r["name"]: 0.0 for r in rows}
    for _ in range(iters):
        g = np.array([r["g_db"] + extra[r["name"]] for r in rows])
        pl = np.array([10 ** ((l + gi) / 10) for (l, b), gi in zip(trk, g)])
        pb = np.array([10 ** ((b + gi) / 10) for (l, b), gi in zip(trk, g)])
        tot_l = 10 * np.log10(pl.sum(0) + 1e-30)
        tot_b = 10 * np.log10(pb.sum(0) + 10 ** (bb / 10) + 1e-30)
        need = np.maximum(LOCAL_UNDER - (lv - tot_l), -(lb - tot_b) + 0.5)
        bad = np.where(sp & (need > 0.05) & (tot_l > -90))[0]
        if len(bad) == 0:
            break
        cut = {}
        for f in bad:
            act = [i for i in range(len(rows)) if 10 * np.log10(pl[i, f] + 1e-30) > tot_l[f] - 6]
            if not act:
                continue
            lead = max(act, key=lambda i: pl[i, f])             # what the ear hears as the event right there
            for i in (act if len(act) == 1 else [i for i in act if i != lead]):
                nm = rows[i]["name"]
                cut[nm] = max(cut.get(nm, 0.0), float(need[f]))
        for nm, d in cut.items():
            extra[nm] = max(extra[nm] - d, -12.0)
    return extra


def build(write=True):
    OUT.mkdir(parents=True, exist_ok=True)
    used = sorted({c[1] for c in sheet.CUES})
    missing = [u for u in used if u not in SOUNDS]
    assert not missing, f"cue sheet names sounds that do not exist: {missing}"
    files, arrs = {}, {}
    for name in used:
        y = SOUNDS[name]()
        trim = name != "pencil_reverse"
        y = finish_sfx(y, name, OUT, trim=trim, fade_out_ms=3.0 if not trim else 25.0)
        arrs[name] = y
        c, _ = click_report(y)
        ev, eb = M.cue_levels(y)
        files[name] = {"dur": round(len(y) / SR, 3), "event_lufs": round(ev, 2), "band_db": round(eb, 2), "clicks": c}
    V = M.voice_tracks()
    vref = V["vref"]
    # 1. each cue's own limit (sheet / local / band), 2. one common step per file (same idea = same level relation,
    # A5's equal boards), 3. the bus guard (cues that sound together), again a whole file at a time
    rows = []
    for (t, name, under, note) in sheet.CUES:
        f = files[name]
        g_db, rule = gain_for(V, frame_t(t), under, f["event_lufs"], f["band_db"], f["dur"], name in sheet.TONAL)
        rows.append({"t": t, "name": name, "under": under, "note": note, "lim": g_db, "rule": rule,
                     "g_sheet": vref - under - f["event_lufs"]})
    step = {}
    for r in rows:
        step[r["name"]] = min(step.get(r["name"], 0.0), r["lim"] - r["g_sheet"])
    for r in rows:
        r["g_db"] = r["g_sheet"] + step[r["name"]]
        if abs(r["g_db"] - r["lim"]) > 0.05:
            r["rule"] = "group"
    extra = bus_guard(rows, arrs, V)
    cues = [{"src": "v2r/music_bed.wav", "t": 0.0, "gain": 1.0,
             "note": "the bed 'Towpath' (music + canal / Arlington air, pre-ducked under the locked voice): play as is"}]
    for r in rows:
        g_db = r["g_db"] + extra[r["name"]]
        rule = r["rule"] if extra[r["name"]] > -0.05 else f"bus {extra[r['name']]:+.1f}"
        g = float(db2a(g_db))
        if g > 1.0:
            print(f"WARNING {r['name']} @{r['t']}: gain {g:.2f} > 1: clipped to 1", file=sys.stderr)
            g = 1.0
        cues.append({"src": f"v2r/sfx/{r['name']}.wav", "t": r["t"], "gain": round(g, 4), "note": r["note"],
                     "under_db": r["under"], "set_by": rule})
    if write:
        (PUBLIC / "cues.json").write_text(json.dumps(cues, indent=1, ensure_ascii=False) + "\n")
    print(f"voice speech level {vref:.2f} LUFS (momentary median); {len(files)} sounds, {len(cues) - 1} cues -> "
          f"{OUT} + {PUBLIC / 'cues.json'}")
    for k, v in files.items():
        print(f"  {k:16s} {v['dur']:5.2f} s  event {v['event_lufs']:6.1f} LUFS  1-4 kHz {v['band_db']:6.1f} dB  "
              f"clicks {v['clicks']}")
    for c in cues[1:]:
        if c["set_by"] != "sheet":
            print(f"  {c['t']:6.2f} {c['src'].split('/')[-1]:20s} gain {c['gain']:.4f}  set by {c['set_by']}")
    return cues, files, vref


if __name__ == "__main__":
    build()
