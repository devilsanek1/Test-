#!/usr/bin/env python3
"""Video 2 ("One Small Window") sound effects, all designed NEW for this film -> public/v2r/sfx/*.wav, and the cue
sheet public/v2r/cues.json ([{src, t, gain, note}], the bed first at t 0).

    python3 audio/v2r/sfx.py            # render every sound + derive every gain + write cues.json (~1 min)
                                        # (run bed.py first: the bus and word guards count the bed)

Every sound is synthesised here from first principles: no samples, no house kit, no platform sounds (the one exception
is boat_chug, built from CC0 grains of a narrowboat engine, see field.py). Families (TREATMENT s7): one positive phone
sound (the exit ding: two struck glass-chime notes rising a fourth, C6 -> F6, the bed's key); one wooden tick at ONE
pitch for every ghost; ONE board clack and ONE pen for the statement boards (A5: Google's and hers the same FILE); a
pop / hop family for Pip; paper and graphite for the drawn world; glass for light.

Revision 2 (music director's review): impacts are struck objects with a noise body and the contact noise of the hit,
never bare decaying sines, and they share ONE outdoor slap (dsp.slap); 2-4 round-robin variants where a sound
repeats (`name:k` in the sheet); stereo noise is decorrelated by independent seeds (dsp.decor), never a
sub-millisecond copy (no comb, a clean mono fold-down); the ding is a struck glass chime (1 ms mallet, tau 0.2 s);
the sun match-cuts are struck glass tings 30 dB down before the next word; the lamp runs and the long pen are timed
into the vowels of BOTH boards' key words (one file each); the un-build crossfades 15 ms into the flood at a matched
level. Files: 48 kHz, 24-bit stereo, peak -1 dBFS, trimmed, DC-free; the film level is the cue's `gain`.
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from dsp import (SR, PUBLIC, VOICE, SCRATCH, N_FILM, np, ss, bp, lp, hp, env_ad, env_bell, modal, chirp, tv_bandpass,  # noqa
                 place, pan, pan_sweep, st, noise, rng, n_of, tt, finish_sfx, db2a, a2db, load, save,
                 short_term_lufs, click_report, frame_t, FPS, FILM_DUR, decor, contact, body_noise, struck, slap)
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
    """place mono (panned) or stereo src into a stereo dst (grows dst's reach only within its length)."""
    s = pan(src, p) if src.ndim == 1 else src
    return place(dst, s, t, gain)


def unit(y):
    return y / (np.abs(y).max() + 1e-12)


# ------------------------------------------------------------------ primitives
def graphite(dur, seed, speed=None, bright=1.0, grain=0.07):
    """Pencil on paper: band-limited hiss + sparse 'tooth' grains (brighter with speed) + a quiet paper body."""
    n = n_of(dur); r = rng(seed)
    sp = np.ones(n) if speed is None else speed
    hiss = bp(r.standard_normal(n), 1800, 7800, 2)
    g = (r.random(n) < grain) * r.standard_normal(n)
    tooth = bp(g, 2600, 9500, 2)
    body = bp(r.standard_normal(n), 320, 1300, 2)
    return (0.55 * hiss + 0.9 * tooth) * sp ** 1.5 * bright + 0.22 * body * sp


def stroke_env(n, att=0.006, rel=0.018):
    e = np.ones(n)
    a = min(n // 3, int(att * SR)); r_ = min(n // 3, int(rel * SR))
    e[:a] = np.sin(0.5 * np.pi * np.linspace(0, 1, a)) ** 2
    e[n - r_:] = np.cos(0.5 * np.pi * np.linspace(0, 1, r_)) ** 2
    return e


def pen_stroke(d, seed, k=0):
    """one felt-tip stroke on enamel: fibre hiss + grains, a faint squeak that follows the speed."""
    r = rng(seed); n = n_of(d); tl = np.arange(n) / SR
    speed = 0.65 + 0.35 * np.sin(np.pi * tl / d) ** 0.7
    fib = bp(r.standard_normal(n), 2200, 7500, 2) * 0.6 + bp(r.standard_normal(n), 500, 1000, 1) * 0.08
    grains = bp((r.random(n) < 0.03) * r.standard_normal(n), 4000, 10000, 2) * 0.5
    f_sq = r.uniform(4200, 5000) * (0.92 + 0.12 * speed)
    squeak = np.sin(2 * np.pi * np.cumsum(f_sq) / SR) * 0.035 * speed
    return (fib + grains) * speed * stroke_env(n, 0.005, 0.015) + squeak * stroke_env(n, 0.01, 0.02)


def pen_tap(seed, g=0.35):
    """the pen tip touching the board."""
    return g * struck([3100, 5200], [0.003, 0.002], [1, .4], 0.014, seed, exc_ms=0.15, noise_body=0.2,
                      contact_amp=0.3, contact_band=(1500, 9000), contact_dec=0.0008, n_extra=0)


def felt_pen(n_strokes, seed, total=None):
    """ONE pen for every drawn board line: felt tip on enamel, short strokes."""
    r = rng(seed)
    segs = []; t = 0.0
    for k in range(n_strokes):
        d = r.uniform(0.045, 0.11); g = r.uniform(0.018, 0.045)
        segs.append((t, d)); t += d + g
    if total:
        segs = [(s * total / t, d * total / t) for (s, d) in segs]; t = total
    out = np.zeros(n_of(t + 0.05))
    for k, (s, d) in enumerate(segs):
        y = pen_stroke(d, seed + 31 * k, k)
        y[: n_of(0.014)] += pen_tap(seed + k)[: n_of(0.014)]
        place(out, y, s, r.uniform(0.8, 1.0))
    return lp(out, 9000, 2)


def thud(f=100.0, dur=0.11, dec=0.024, seed=0, grit=0.06):
    """a soft heel / paw on stone: a low noisy body (never a pure sine), the contact of the sole, a little grit."""
    y = 0.9 * unit(body_noise([f, 1.9 * f], [dec, dec * 0.6], [1, .45], dur, seed, q=5.0))
    y += 0.55 * unit(lp(noise(dur, seed + 1), 420)) * env_ad(n_of(dur), 0.002, 0.008)
    c = contact(0.012, 300, 2600, 0.0025, seed + 2)
    y[: len(c)] += 0.35 * unit(c)
    g = hp(noise(0.03, seed + 3), 2500) * env_ad(n_of(0.03), 0.001, 0.006)
    y[: len(g)] += grit * unit(g)
    return y


def popper(f0, f1, dur, dec, seed=0, puff=0.15, puff_band=(900, 5000)):
    """the pop family: a short downward glide with a felt attack + a breath of air."""
    t = tt(dur)
    y = chirp(f0, f1, dur, 1.6) * env_ad(len(t), 0.0015, dec)
    y += puff * bp(noise(dur, seed), puff_band[0], puff_band[1]) * env_ad(len(t), 0.001, dec * 0.5)
    return y


def glass(f, ratios, decays, amps, dur, seed, mallet=0.35, mallet_band=(2500, 12000), body=0.12, beat_hz=0.0):
    """a struck glass object: inharmonic partials (each a pair `beat_hz` apart for the glass shimmer), a noise
    excitation, a 1 ms mallet transient, a faint resonant noise body. Unit peak, mono."""
    t = tt(dur); r = rng(seed); y = np.zeros(len(t))
    for k, (q, d, a) in enumerate(zip(ratios, decays, amps)):
        fk = f * q
        if fk > 0.45 * SR:
            continue
        ph = r.uniform(0, 2 * np.pi)
        part = np.sin(2 * np.pi * fk * t + ph)
        if beat_hz:
            part = 0.5 * part + 0.5 * np.sin(2 * np.pi * (fk + beat_hz * (1 + k)) * t + ph + 0.7)
        y += a * part * np.exp(-t / d)
    na = max(8, n_of(0.0004))
    y[:na] *= np.sin(0.5 * np.pi * np.linspace(0, 1, na)) ** 2
    ex = r.standard_normal(n_of(0.0008)) * np.hanning(n_of(0.0008))
    y = ss.fftconvolve(y, ex / (np.abs(ex).sum() + 1e-12))[: len(t)] * 6
    y = unit(y)
    nb = body_noise([f * q for q in ratios[:2]], [d * 0.6 for d in decays[:2]], amps[:2], dur, seed + 5, q=40.0)
    y += body * unit(nb)
    m = contact(0.004, mallet_band[0], mallet_band[1], 0.0006, seed + 7, rise=0.0001)
    y[: len(m)] += mallet * unit(m)
    nf = min(len(y) // 4, n_of(0.004))
    y[len(y) - nf:] *= np.cos(0.5 * np.pi * np.linspace(0, 1, nf)) ** 2
    return unit(y)


def flap(dur, lo, hi, seed, att=0.004, dec=0.010):
    return bp(noise(dur, seed), lo, hi, 2) * env_ad(n_of(dur), att, dec)


# ------------------------------------------------------------------ V2S1 (0.00-6.10)
SEAM_XF = 0.015        # the un-build's crossfade into the flood (s)


@sound
def pencil_flood(v=1):
    """f0: three quick hatch strokes, then the colour wash floods out from the sun (0.06-0.40). It opens with a 15 ms
    fade-in: the crossfade from the un-build's reversed pencil, at a matched level (no notch at the loop seam)."""
    out = buf(0.62)
    for k, (s, d, p) in enumerate([(0.00, 0.075, -0.25), (0.08, 0.06, 0.05), (0.145, 0.08, 0.3)]):
        n = n_of(d)
        sp = 0.85 + 0.15 * np.sin(np.pi * np.arange(n) / n) if k == 0 else 0.7 + 0.3 * np.sin(np.pi * np.arange(n) / n)
        e = stroke_env(n, SEAM_XF if k == 0 else 0.004, 0.015)
        put(out, graphite(d, 100 + k, sp) * e, s, 0.55, p)
    d = 0.34; n = n_of(d)                     # the wash is done by ~0.40, before the lamp click and the ding
    wash = decor(lambda sd: tv_bandpass(noise(d, sd), np.geomspace(480, 2600, n), bw_oct=1.0) * env_bell(n, 0.40, 1.6),
                 7, 0.65)
    out[n_of(0.06): n_of(0.06) + n] += wash * 0.55
    return out


@sound
def lamp_click(v=1):
    """a small rocker switch, press + release 14 ms apart (W, right of frame): plastic contact, a little body.
    v1 = OFF at 0.40, v2 = ON at 34.95 (the callback)."""
    out = buf(0.09); s0 = 30 + 10 * v; r = rng(s0)
    for k, (s, g) in enumerate([(0.0, 1.0), (0.014 + 0.002 * (v - 1), 0.55)]):
        c = struck([2300 * (1 + .04 * k) * r.uniform(0.98, 1.02), 3900, 6100, 1250], [0.004, 0.003, 0.002, 0.006],
                   [1, .7, .4, .5], 0.03, s0 + k, exc_ms=0.15, noise_body=0.3, contact_amp=0.45,
                   contact_band=(1500, 10000), contact_dec=0.0007)
        c += 0.35 * unit(body_noise([190], [0.010], [1], 0.03, s0 + 5 + k, q=4.0))
        put(out, c, s, g, 0.35)
    return slap(out, -7.0)


@sound
def exit_ding(v=1):
    """OUR positive phone sound: two struck glass-chime notes rising a fourth (C6 -> F6, the bed's key), 85 ms apart:
    inharmonic partials, a 1 ms hard-mallet transient, the fundamental's decay constant 0.2 s; a 60 ms air flick
    lifts off with the first strike (the 'sent'). Never Apple's or Instagram's."""
    out = buf(1.10)
    ratios = [1.0, 2.405, 4.36, 6.83, 9.71]
    decs = [0.20, 0.075, 0.036, 0.018, 0.010]
    amps = [1.0, 0.30, 0.12, 0.05, 0.02]
    put(out, glass(1046.50, ratios, decs, amps, 1.05, 41, mallet=0.42, body=0.10, beat_hz=0.9), 0.000, 1.0, -0.15)
    put(out, glass(1396.91, ratios, decs, amps, 1.0, 42, mallet=0.42, body=0.10, beat_hz=0.9), 0.085, 0.92, 0.15)
    d = 0.06; n = n_of(d)
    fl = decor(lambda sd: tv_bandpass(noise(d, sd), np.geomspace(3500, 9000, n), bw_oct=0.6) * env_bell(n, 0.5, 1.4),
               43, 0.8)
    out[: n] += fl * 0.10
    return out


@sound
def door_glide(v=1):
    """the glass doors slide apart (0.07 s to open), a soft stop, a breath of air."""
    out = buf(0.36); d = 0.32; n = n_of(d); t = tt(d)
    e = np.where(t < 0.07, (t / 0.07) ** 0.8, np.exp(-(t - 0.07) / 0.06))
    hiss = decor(lambda sd: bp(noise(d, sd), 300, 2200), 51, 0.5) * e[:, None]
    roll = pan(lp(noise(d, 52), 140) * (0.5 + 0.5 * np.sin(2 * np.pi * 23 * t)) * e * 0.6, 0.15)
    out[: n] += hiss * 0.8 + roll
    stop = struck([95, 210], [0.03, 0.02], [1, .4], 0.08, 53, exc_ms=1.0, noise_body=0.4, contact_amp=0.2,
                  contact_band=(200, 3000), contact_dec=0.003)
    put(out, stop, 0.075, 0.35, 0.15)
    return out


@sound
def step_thup(v=1):
    """she steps out onto the towpath: a soft heel on stone + a little grit."""
    return slap(pan(thud(100, 0.11, 0.022, 61), 0.1), -8.0)


@sound
def letter_pops(v=1):
    """the six canopy letters fill-pop one by one: a quick ripple of tiny high pops, 25 ms apart, done in 0.15 s
    (finished before 'Google' opens its vowel)."""
    out = buf(0.17); r = rng(70)
    for k in range(6):
        f = 2600 * r.uniform(0.98, 1.02)
        put(out, popper(f, f * 0.62, 0.018, 0.005, 70 + k, 0.06, (3000, 9000)), 0.025 * k, r.uniform(0.85, 1.0),
            0.02 + 0.035 * k)
    return out


@sound
def wings(v=1):
    """five birds lift off and wheel west: wing-clap starts, flap trains at 8.5-11 Hz fading as they go."""
    out = buf(1.35); r = rng(80 + 1000 * (v - 1))
    for b, s in enumerate([0.0, 0.04, 0.09, 0.14, 0.21]):
        rate = r.uniform(8.5, 11.0); nfl = r.integers(7, 11); c = r.uniform(0.85, 1.2)
        p0 = r.uniform(-0.1, 0.25)
        for k in range(nfl):
            g = np.exp(-k / (nfl * 0.45)) * (1.4 if k < 2 else 1.0)
            f = flap(0.034, 420 * c, 3300 * c, 800 + 13 * b + k + 1000 * v, 0.003, 0.009)
            if k < 2:                       # the take-off wing clap: a soft-edged little crack, not a click
                cl = bp(noise(0.006, 900 + b + 1000 * v), 1200, 6000) * np.sin(np.pi * np.arange(n_of(0.006)) / n_of(0.006)) ** 2
                f[: len(cl)] += 0.35 * cl
            put(out, f, s + k / rate + r.normal(0, 0.004), g * r.uniform(0.8, 1.0), p0 - 0.06 * k)
    return lp(out, 8000, 2)


@sound
def ghost_tick(v=1):
    """ONE soft wooden tick, ONE pitch (C6 main mode, identical in every variant): a felt mallet on a small hard-wood
    block: its modes with their noisy body, a woody knock around 520 Hz (not a sine), the felt's contact."""
    s0 = 91 + 17 * v; r = rng(s0)
    y = struck([1046.5, 2721.0 * r.uniform(0.99, 1.01), 4605.0 * r.uniform(0.99, 1.01)], [0.022, 0.008, 0.004],
               [1.0, 0.12 * r.uniform(0.85, 1.15), 0.03], 0.12, s0, exc_ms=1.6, noise_body=0.30, contact_amp=0.22,
               contact_band=(400, 3500), contact_dec=0.0012, spread=0.004, n_extra=1)
    y += 0.45 * unit(body_noise([523.25, 830.0], [0.016, 0.008], [1, .35], 0.12, s0 + 9, q=6.0))
    return slap(pan(lp(y, 3200, 2), -0.1), -6.0)


@sound
def outline_pops(v=1):
    """'life': three bare ink outlines pop in down the bending towpath: three soft air puffs, all above 5 kHz (no tone,
    nothing in the voice's band), softer as they recede."""
    out = buf(0.20)
    for k, (g, p) in enumerate([(1.0, -0.2), (0.78, -0.32), (0.6, -0.44)]):
        d = 0.045; n = n_of(d)
        puff = hp(bp(noise(d, 110 + k), 5200, 11000, 2), 5000, 4) * env_ad(n, 0.0015, 0.010)
        put(out, puff, 0.06 * k, g, p)
    return out


@sound
def ear_flap(v=1):
    """Pip's two big leaf ears fold over its head: two soft leafy flaps (above the voice's body band)."""
    out = buf(0.16)
    for k, (s, g) in enumerate([(0.0, 1.0), (0.055, 0.85)]):
        d = 0.06; n = n_of(d)
        y = hp(lp(noise(d, 120 + k), 5000), 900, 2) * env_ad(n, 0.004, 0.016)
        cr = bp((rng(125 + k).random(n) < 0.03) * rng(126 + k).standard_normal(n), 3000, 8000) * np.exp(-tt(d) / 0.02)
        put(out, y + 0.4 * cr, s, g, 0.2)
    return out


@sound
def whoosh_dive(v=1):
    """the push-through into her dark window (5.95-6.25): air rising then settling (decorrelated L/R: no comb), a
    muffled 'through the glass' bump; gone by 6.27, before "You'd"."""
    d = 0.32; n = n_of(d)
    c = np.concatenate([np.geomspace(350, 1600, int(n * 0.62)), np.geomspace(1600, 900, n - int(n * 0.62))])

    def one(sd):
        y = tv_bandpass(noise(d, sd), c, bw_oct=1.1) * env_bell(n, 0.62, 1.6)
        return y + 0.35 * lp(noise(d, sd + 1), 220) * env_bell(n, 0.6, 2.0)
    out = decor(one, 130, 0.7)
    bump = struck([140, 330], [0.05, 0.03], [1, .4], 0.14, 132, exc_ms=1.2, noise_body=0.4, contact_amp=0.15,
                  contact_band=(150, 1500), contact_dec=0.004)
    put(out, bump, 0.20, 0.3, 0.0)
    return out


# ------------------------------------------------------------------ V2S2 (6.10-12.98)
@sound
def pencil_ring(v=1):
    """an ink ring drawn round her dark window: one continuous circular graphite stroke, a lift at the end."""
    d = 0.44; n = n_of(d); t = tt(d)
    sp = 0.72 + 0.28 * np.sin(2 * np.pi * 2.3 * t + 0.6)
    return pan(lp(graphite(d, 140, sp, 1.0), 6500, 2) * stroke_env(n, 0.008, 0.035), -0.3)


@sound
def board_clack(v=1):
    """THE board sound (the statement A-boards + the deal board): the legs touch the paving (a short scrape and tick),
    then the hollow wooden clack: the hit's contact noise, the board's modes and their noisy body, the panel flexing
    (a low thock); in the canal's slap. v1 = Google's AND her board (A5: one file), v2 = TOLD THE BBC, v3 = the deal."""
    s0 = 150 + 20 * v; r = rng(s0); k = 1.0 + 0.012 * (v - 1) * (-1) ** v
    out = buf(0.42)
    leg = contact(0.025, 1200, 7000, 0.006, s0) * 0.6
    put(out, leg, 0.0, 0.30, -0.15)
    put(out, struck([1750 * k, 2900 * k], [0.006, 0.004], [1, .6], 0.03, s0 + 1, exc_ms=0.2, noise_body=0.3,
                    contact_amp=0.3), 0.0, 0.25, -0.15)
    b = struck([196 * k, 457 * k, 861 * k, 1404 * k, 2240 * k, 3310 * k], [0.10, 0.06, 0.04, 0.025, 0.014, 0.008],
               [1, .7, .5, .35, .2, .1], 0.36, s0 + 2, exc_ms=0.5, noise_body=0.45, contact_amp=0.38,
               contact_band=(300, 7000), contact_dec=0.0025, spread=0.01, n_extra=2)
    b += 0.45 * unit(bp(noise(0.36, s0 + 3), 90, 260, 2) * env_ad(n_of(0.36), 0.002, 0.03))
    put(out, b, 0.016 + r.uniform(0, 0.002), 1.0, -0.15)
    return slap(out, -4.0)


@sound
def light_clicks(v=1):
    """'staff': the five windows round hers turn a cooler white: five tiny switch clicks, left of frame."""
    out = buf(0.22); r = rng(160)
    for k, (s, p) in enumerate(zip([0, 0.035, 0.08, 0.12, 0.165], [-0.38, -0.14, -0.65, -0.39, -0.15])):
        f = r.uniform(0.95, 1.05)
        c = struck([2600 * f, 4300 * f], [0.003, 0.002], [1, .5], 0.02, 160 + k, exc_ms=0.12, noise_body=0.3,
                   contact_amp=0.4, contact_band=(1500, 9000), contact_dec=0.0006, n_extra=1)
        put(out, c, s, r.uniform(0.8, 1.0), p)
    return slap(out, -8.0)


@sound
def notebook_flap(v=1):
    """'BBC': the reporter's notebook opens: a quick papery flap (its air peaks in the first 10 ms, ahead of the
    'B'), a little crinkle."""
    d = 0.16; n = n_of(d); r = rng(170)
    y = lp(bp(noise(d, 171), 700, 5500), 4500) * env_ad(n, 0.004, 0.028)
    cr = bp((r.random(n) < 0.02) * r.standard_normal(n), 2000, 7000) * np.exp(-tt(d) / 0.03) * 0.5
    y += cr + 0.3 * lp(noise(d, 172), 300) * env_ad(n, 0.004, 0.025)
    return pan(y, 0.2)


def slat_rattle(dur, seed, rate=72.0, dense=1.0):
    """a blind's slats knocking down: an irregular impulse train through a short slat resonance."""
    n = n_of(dur); r = rng(seed)
    imp = np.zeros(n); t = 0.0
    while t < dur:
        imp[min(n - 1, n_of(t))] += r.uniform(0.4, 1.0)
        t += r.uniform(0.6, 1.4) / (rate * dense)
    ir = struck([1650, 2900, 5200, 900], [0.004, 0.003, 0.002, 0.006], [.8, .4, .3, .6], 0.02, seed + 1, exc_ms=0.7,
                noise_body=0.35, contact_amp=0.3, n_extra=1)
    y = np.convolve(imp, ir)[:n] * env_ad(n, 0.01, dur * 0.6)
    f = min(n // 3, n_of(0.012))
    y[n - f:] *= np.cos(0.5 * np.pi * np.linspace(0, 1, f)) ** 2          # the slats settle: no cut-off step
    return y


@sound
def blinds_five(v=1):
    """'scared': five blinds drop to half one by one (10.26-10.60), each ending on a soft rail tap; left of frame."""
    out = buf(0.62)
    for k, (s, p) in enumerate(zip([0, 0.085, 0.17, 0.255, 0.34], [-0.38, -0.14, -0.65, -0.39, -0.15])):
        y = np.zeros(n_of(0.18))
        place(y, slat_rattle(0.11, 180 + 7 * k), 0.0)
        place(y, struck([240, 620], [0.02, 0.01], [1, .4], 0.06, 190 + k, exc_ms=0.6, noise_body=0.4, contact_amp=0.25,
                        contact_band=(300, 4000)), 0.105, 0.5)
        put(out, y, s, 0.9 + 0.025 * k, p)
    return slap(out, -8.0)


@sound
def blind_thump(v=1):
    """'contracts': W2's blind comes fully down: a short rattle into the bottom rail's thump."""
    out = buf(0.36)
    put(out, slat_rattle(0.16, 200, 80, 1.2), 0.0, 0.8, -0.38)
    t_ = struck([160, 410, 980], [0.045, 0.02, 0.01], [1, .5, .25], 0.16, 201, exc_ms=0.8, noise_body=0.45,
                contact_amp=0.3, contact_band=(300, 5000), contact_dec=0.002)
    put(out, t_, 0.15, 1.0, -0.38)
    return slap(out, -7.0)


@sound
def notebook_clap(v=1):
    """the notebook claps shut: a soft paper clap with a papery body, a whisper of pages."""
    d = 0.16; n = n_of(d)
    y = hp(lp(noise(d, 210), 4500), 300) * env_ad(n, 0.001, 0.018)
    y += 0.5 * unit(body_noise([240, 410], [0.015, 0.008], [1, .4], d, 212, q=4.0))
    y += 0.12 * bp(noise(d, 211), 2000, 6000) * env_bell(n, 0.35, 1.5)
    return slap(pan(y, 0.2), -7.0)


# ------------------------------------------------------------------ V2S3 / V2S4 (12.98-20.55)
@sound
def swap_pop(v=1):
    """the window match-cut: one soft round pop."""
    return pan(popper(1000, 480, 0.06, 0.018, 220, 0.2), -0.25)


@sound
def pip_land(v=1):
    """Pip's teddy-bear soles land: a soft padded 'pmf' (a padded body, not a sine)."""
    d = 0.09; n = n_of(d); s0 = 230 + 11 * v
    y = hp(lp(noise(d, s0), 900), 120) * env_ad(n, 0.004, 0.02)
    y += 0.6 * unit(body_noise([150 * (1 + 0.03 * (v - 1)), 260], [0.02, 0.012], [1, .4], d, s0 + 3, q=4.0))
    return slap(pan(y, 0.0), -10.0)


@sound
def pip_hop(v=1):
    """Pip hops: a small springy upward glide and a breath of air (the hop half of the pop family)."""
    d = 0.11; n = n_of(d); k = [1.0, 1.035, 0.97][(v - 1) % 3]; s0 = 240 + 13 * v
    f = np.concatenate([np.geomspace(420 * k, 980 * k, n_of(0.075)), np.full(n - n_of(0.075), 980.0 * k)])
    y = 0.8 * np.sin(2 * np.pi * np.cumsum(f) / SR) * env_ad(n, 0.006, 0.035)
    y += 0.12 * np.sin(2 * np.pi * np.cumsum(np.geomspace(840 * k, 1960 * k, n)) / SR) * env_ad(n, 0.006, 0.025)
    y += 0.25 * bp(noise(d, s0), 1000, 5000) * env_ad(n, 0.002, 0.015)
    return pan(y, 0.0)


@sound
def pop_high(v=1):
    """a small bright pop: a tag or a line landing."""
    k = [1.0, 0.965][(v - 1) % 2]
    return pan(popper(2600 * k, 1700 * k, 0.035, 0.008, 250 + 7 * v, 0.2), 0.0)


@sound
def pop(v=1):
    """the mid pop: a line popping on."""
    return pan(popper(1400, 760, 0.05, 0.014, 260, 0.15), 0.0)


@sound
def pop_low(v=1):
    """the low pop: a plaque landing (a small felt body under the glide)."""
    y = popper(760, 380, 0.07, 0.02, 270, 0.1)
    y += 0.3 * unit(body_noise([190], [0.02], [1], 0.07, 271, q=5.0))
    return slap(pan(y, 0.0), -10.0)


@sound
def pen_tick(v=1):
    """the tag's second build: the pen touches and makes one short stroke."""
    return pan(felt_pen(2, 280, total=0.14), 0.25)


@sound
def steps_stop(v=1):
    """her last two steps on the towpath paving; the second (at +0.30 s = 17.96) plants and stops, a tiny scuff."""
    out = buf(0.52)
    put(out, thud(95, 0.09, 0.016, 290) * 0.7, 0.0, 1.0, 0.3)
    put(out, thud(105, 0.11, 0.022, 291, grit=0.08), 0.30, 1.0, 0.3)
    sc = bp(noise(0.08, 293), 1000, 5000) * env_bell(n_of(0.08), 0.3, 1.5) * 0.06
    put(out, sc, 0.33, 1.0, 0.3)
    return slap(out, -8.0)


@sound
def plate_knock(v=1):
    """'military': the DEC 2025 plate builds on the fingerpost: a small hollow wood knock + a pop."""
    out = buf(0.24)
    put(out, struck([520, 1180, 2050, 3300], [0.05, 0.025, 0.012, 0.006], [1, .55, .3, .12], 0.18, 300, exc_ms=0.4,
                    noise_body=0.45, contact_amp=0.35, contact_band=(400, 6000), contact_dec=0.0018), 0.0, 1.0, -0.3)
    put(out, popper(1500, 900, 0.035, 0.01, 301, 0.1), 0.035, 0.45, -0.3)
    return slap(out, -6.0)


@sound
def pen_short(v=1):
    """THE pen, a short line (0.38 s): the APR plate (v1), 'AI principles' (v2)."""
    return pan(felt_pen(4, 310 + 37 * (v - 1), total=0.38), -0.15)


# THE long pen, ONE file for Google's 'of any kind' (30.73) and her quote (36.50) (A5): a tap, then three strokes,
# timed into what both lines leave free (her /t/ 36.53-36.57, /k/ 36.73-36.75, /t/ 37.03 and "facts" from 37.06;
# Google's /z/ 31.06-31.10, /t/ 31.20-31.24): nothing after +0.47 s (review item 1: the pen ends before "facts").
PEN_LONG = [("tap", 0.000, 0.012), ("stroke", 0.115, 0.090), ("stroke", 0.255, 0.050), ("stroke", 0.375, 0.070)]


@sound
def pen_long(v=1):
    """THE pen, the long line: the tip touches, then three strokes (PEN_LONG); the rest of the build is silent."""
    out = np.zeros(n_of(0.50))
    for k, (kind, s, d) in enumerate(PEN_LONG):
        if kind == "tap":
            place(out, pen_tap(320, 0.6), s)
        else:
            place(out, pen_stroke(d, 320 + 31 * k, k), s, [1.0, 0.9, 0.8][k - 1])
    return pan(lp(out, 9000, 2), -0.15)


@sound
def glass_ting(v=1):
    """the sun match-cuts: ONE struck glass ting on A6 (the bed's key): inharmonic partials, a noise excitation and a
    soft mallet; 30 dB down 0.22 s after the strike (before 'In' 20.67 / 'But' 28.31). v2 = the callback."""
    y = glass(1760.0, [1.0, 2.32, 4.25, 6.63], [0.062, 0.03, 0.016, 0.009], [1.0, 0.35, 0.14, 0.05], 0.26,
              330 + 9 * v, mallet=0.22, mallet_band=(1500, 9000), body=0.10, beat_hz=1.3)
    return slap(pan(y, 0.12 - 0.24 * (v - 1)), -9.0)


# ------------------------------------------------------------------ V2S5 / V2S6 (20.55-28.06)
@sound
def calendar_flip(v=1):
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
def blossom_pops(v=1):
    """the slot's trees burst into blossom in 4 frames: a scatter of tiny petal pops and a breath of air."""
    out = buf(0.30); r = rng(350)
    for k in range(16):
        f = r.uniform(2400, 4200); d = 0.02
        y = np.sin(2 * np.pi * f * tt(d)) * np.exp(-tt(d) / 0.004) + 0.2 * hp(noise(d, 351 + k), 3000) * np.exp(-tt(d) / 0.002)
        put(out, y, r.uniform(0, 0.13), r.uniform(0.3, 1.0), r.uniform(-0.8, 0.2))
    d = 0.18
    put(out, bp(noise(d, 370), 1500, 7000) * env_bell(n_of(d), 0.3, 1.5) * 0.15, 0.0, 1.0, -0.3)
    return out


@sound
def wipe_air(v=1):
    """the lamppost wipes the backs at the crane's peak speed: a close, quick air pass, right to left."""
    d = 0.30; n = n_of(d)
    c = np.concatenate([np.geomspace(300, 1800, n // 2), np.geomspace(1800, 600, n - n // 2)])
    y = tv_bandpass(noise(d, 380), c, bw_oct=1.0) * env_bell(n, 0.5, 1.4)
    y += 0.3 * lp(noise(d, 381), 250) * env_bell(n, 0.5, 2.0)
    return pan_sweep(y, 0.7, -0.7)


@sound
def window_ticks(v=1):
    """windows warm on along a wing / a facade, one by one: seven tiny far switch ticks, never accelerating."""
    out = buf(0.66); r = rng(390 + 50 * v)
    for k, s in enumerate([0, 0.09, 0.19, 0.27, 0.38, 0.47, 0.58]):
        y = struck([2200 * r.uniform(0.98, 1.02), 3700], [0.0035, 0.0022], [1, .45], 0.015, 391 + k + 50 * v,
                   exc_ms=0.15, noise_body=0.3, contact_amp=0.35, contact_band=(1200, 8000), contact_dec=0.0006,
                   n_extra=1)
        put(out, lp(y, 6000), s + r.normal(0, 0.004), r.uniform(0.7, 1.0), -0.5 + k / 6)
    return slap(out, -9.0)


# ------------------------------------------------------------------ V2S7 / V2S8 (28.06-39.08)
# THE lamp run, ONE file for Google's string lights (30.18) and her lane's lamps (37.23) (A5): seven small glass
# bulbs tinking on, on exact frames after the cue (the picture lights them on these frames); timed into the vowels of
# BOTH key words ("principles": /s/ 30.11-30.17, /z/ 30.45-30.55; "facts is": /ts/ 37.50-37.64, /z/ 37.76-37.84).
LAMP_RUN_FRAMES = [0, 4, 7, 11, 26, 29, 37]


@sound
def lamp_run(v=1):
    """lights coming on in a run: seven small struck glass bulbs (inharmonic, noise-excited), one pitch family around
    D8, panning across; never the ding."""
    out = buf(0.75); r = rng(400)
    for k, f_ in enumerate(LAMP_RUN_FRAMES):
        f = 4698.6 * (1 + 0.004 * r.uniform(-1, 1))
        y = glass(f, [1.0, 1.54, 2.27], [0.022, 0.011, 0.006], [1.0, 0.35, 0.12], 0.09, 400 + k, mallet=0.5,
                  mallet_band=(3000, 14000), body=0.18, beat_hz=0.0)
        put(out, y, f_ / FPS, (1.0 - 0.04 * k) * r.uniform(0.85, 1.0), -0.4 + 0.8 * k / (len(LAMP_RUN_FRAMES) - 1))
    return out


@sound
def boat_chug(v=1):
    """the narrowboat wipes the frame: a soft diesel putter passing close (6.2 Hz) and its bow wash, left to right."""
    d = 1.0; n = n_of(d)
    y = np.zeros(n)
    for k in range(int(d * 6.2)):
        p = 0.8 * unit(body_noise([62, 124, 186], [0.03, 0.02, 0.012], [1, .5, .25], 0.08, 410 + k, q=6.0))
        p += 0.5 * lp(noise(0.08, 420 + k), 300) * np.exp(-tt(0.08) / 0.02)
        p *= env_ad(len(p), 0.004, 10.0)
        place(y, p, k / 6.2)
    y *= env_bell(n, 0.45, 1.5)
    y += 0.35 * hp(lp(noise(d, 430), 900), 150) * env_bell(n, 0.55, 1.6)
    return pan_sweep(y, -0.6, 0.6)


@sound
def door_latch(v=1):
    """her teal door shuts behind her down the lane: a soft wooden close, the latch, the lane's slap."""
    out = buf(0.50)
    th = struck([92, 185, 340], [0.06, 0.035, 0.02], [1, .6, .3], 0.42, 440, exc_ms=1.0, noise_body=0.45,
                contact_amp=0.25, contact_band=(150, 3000), contact_dec=0.004)
    th[: n_of(0.06)] += 0.4 * lp(noise(0.06, 441), 600) * np.exp(-tt(0.06) / 0.025)
    put(out, th, 0.0, 1.0, 0.25)
    put(out, struck([2450, 4100, 5900], [0.006, 0.004, 0.003], [1, .6, .3], 0.03, 442, exc_ms=0.1, noise_body=0.3,
                    contact_amp=0.4, contact_band=(2000, 10000), contact_dec=0.0006), 0.035, 0.5, 0.25)
    return slap(out, -3.0)


@sound
def cloth_wipe(v=1):
    """'her words': the cafe owner wipes the board clean in ONE stroke: cloth on enamel, left to right. The stroke
    starts soft and gathers speed (its body lands on 'words', past the breathy 'her'); the cloth's grain sits low,
    the voice's 1-4 kHz and its consonants above are left free."""
    d = 0.36; n = n_of(d)
    g = lp(noise(d, 450), 60)
    grain = np.clip(1.0 + 0.3 * g / (np.std(g) + 1e-12), 0.3, 1.6)
    y = bp(noise(d, 451), 250, 4000) * env_bell(n, 0.62, 1.7) * grain
    y = M.notch_band(y, 1000.0, 4000.0, -6.0)
    return pan_sweep(lp(y, 3800, 2), -0.5, 0.2)


@sound
def pencil_reverse(v=1):
    """the un-build: a pencil scribble played backwards, swelling INTO the loop seam. It ends on the film's last frame
    at -6 dB of its swell and runs SEAM_XF on (wrapping onto frame 0 in the premix) with a fade-out, as the flood fades
    in: a 15 ms crossfade at a matched level (premix wraps cue overflow; sfx.py matches the levels)."""
    d = 16 / FPS; n = n_of(d); t = tt(d)
    sp = 0.6 + 0.4 * np.abs(np.sin(2 * np.pi * 9 * t))
    y = graphite(d, 460, sp, 1.0) * env_ad(n, 0.004, 0.09)
    y = y[::-1].copy()                                             # swells toward the seam
    w = np.interp(t, [0, d * 0.78, d], [1.0, 1.0, db2a(-6.0)])     # and eases to -6 dB as it meets the flood
    y *= w
    tail = graphite(SEAM_XF, 461, None, 1.0) * np.cos(0.5 * np.pi * np.linspace(0, 1, n_of(SEAM_XF))) ** 2
    tail *= np.sqrt(np.mean(y[-n_of(0.01):] ** 2)) / (np.sqrt(np.mean(graphite(SEAM_XF, 461) ** 2)) + 1e-12)
    return pan(np.concatenate([y, tail]), 0.0)


# ------------------------------------------------------------------ measurement + cue sheet
LOCAL_UNDER = 9.0      # house: every SFX >= 8 dB under the voice where it lands (broadband, momentary), + 1 dB margin
BAND_UNDER = 6.0       # and >= 6 dB under the voice's own 1-4 kHz (diction) where it lands (noise-like sounds)
BAND_UNDER_TONAL = 0.0  # measured-tonal sounds (tonality() >= TONAL_MIN): never above the voice's 1-4 kHz there
TONAL_MIN = 0.85       # share of a sound's 1-4 kHz energy in its strongest partials for the tonal relaxation
WORD_MIN = 6.0         # hit words: the voice >= 6 dB over bed + SFX at 1-4 and 4-10 kHz (review item 1)
WORD_MIN_OTHER = 3.0   # every other word: >= 3 dB (the voice on top everywhere; the bed is carved to >= 9 dB)
WORD_MARGIN = 0.5
BANDS = {"1-4k": (1000.0, 4000.0), "4-10k": (4000.0, 10000.0)}
UNTRIMMED = {"pencil_reverse"}                   # exact length: it ends on the film's last frame (+ the crossfade)


def tonality(y):
    """the share of a sound's 1-4 kHz energy that sits within +-1.5 % of its six strongest spectral peaks (a struck
    block's mode and its close neighbours count as one tonal component): 1 = partials, ~0.2 = noise. Replaces the
    hand list: anything with a noise puff or a noisy body in the diction band is not tonal (review item 2)."""
    m = st(y).mean(axis=1)
    nf = 1 << int(np.ceil(np.log2(max(len(m), 4096)) + 1))
    P = np.abs(np.fft.rfft(m * np.hanning(len(m)), nf)) ** 2
    f = np.fft.rfftfreq(nf, 1 / SR)
    sel = (f >= 1000) & (f <= 4000)
    Pb = P[sel]; fb = f[sel]
    if Pb.sum() <= 0:
        return 1.0
    pk, _ = ss.find_peaks(Pb, distance=max(1, int(20 / (f[1] - f[0]))))
    top = pk[np.argsort(Pb[pk])[-6:]] if len(pk) else []
    w = np.zeros(len(fb), bool)
    for i in top:
        w |= (np.abs(fb - fb[i]) <= max(6.0, 0.015 * fb[i]))
    return float(min(1.0, Pb[w].sum() / Pb.sum()))


def mono_notch_db(y):
    """deepest notch of the mono fold-down against the channels' own spectrum (1/6-octave smoothed, 200 Hz-12 kHz):
    ~0 = no comb (review item 7)."""
    y = st(y)
    if np.allclose(y[:, 0], y[:, 1]):
        return 0.0
    nf = 1 << int(np.ceil(np.log2(max(len(y), 4096))))
    Lm = np.abs(np.fft.rfft(y[:, 0], nf)) ** 2; Rm = np.abs(np.fft.rfft(y[:, 1], nf)) ** 2
    Mm = np.abs(np.fft.rfft(y.mean(axis=1), nf)) ** 2
    f = np.fft.rfftfreq(nf, 1 / SR)
    worst = 0.0
    for fc in np.geomspace(200, 12000, 60):
        w = (f >= fc / 2 ** (1 / 12)) & (f < fc * 2 ** (1 / 12))
        if not w.any():
            continue
        ref = 0.25 * (Lm[w].sum() + Rm[w].sum()) + 0.5 * np.sqrt(Lm[w].sum() * Rm[w].sum())   # a perfectly coherent pan
        d = 10 * np.log10((Mm[w].sum() + 1e-30) / (ref + 1e-30))
        worst = min(worst, d)
    return round(float(worst), 1)


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


def bus_guard(rows, arrs, V, bed, iters=8, hop=0.05):
    """The cues as one bus: wherever the SFX that sound TOGETHER come within 9 dB of the speaking voice (broadband)
    or reach its 1-4 kHz level (with the bed's own 1-4 kHz counted), the supporting sounds of that moment come down
    (never the moment's lead, the loudest cue right there, unless it plays alone; never a LEAD_SOUND), a whole sound
    at a time so every relation in the sheet holds. Returns {sound: extra dB}."""
    k5 = int(round(hop / M.HOP))
    tv, lv, lb, sp = V["t"][::k5], V["lv"][::k5], V["lb"][::k5], V["sp"][::k5]
    tb_, bb = M.band_rms(bed, hop=hop)
    n = min(len(tv), len(bb)); tv, lv, lb, sp, bb = tv[:n], lv[:n], lb[:n], sp[:n], bb[:n]
    trk = []
    for r in rows:
        y, t = arrs[r["name"]], frame_t(r["t"])
        l = local_frames(y, t, 0.4, hop, lambda z: short_term_lufs(z, win=0.4, hop=hop)[1], -120.0, n)
        b = local_frames(y, t, 0.4, hop, lambda z: M.band_rms(z, hop=hop)[1], -150.0, n)
        trk.append((np.maximum(l, -120.0), np.maximum(b, -150.0)))
    extra = {r["fam"]: 0.0 for r in rows}
    for _ in range(iters):
        g = np.array([r["g_db"] + extra[r["fam"]] for r in rows])
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
            lead_i = max(act, key=lambda i: pl[i, f])          # what the ear hears as the event right there
            for i in (act if len(act) == 1 else [i for i in act if i != lead_i]):
                fam = rows[i]["fam"]
                if fam in sheet.LEAD_SOUNDS:
                    continue
                cut[fam] = max(cut.get(fam, 0.0), float(need[f]))
        if not cut:
            break
        for fam, d in cut.items():
            extra[fam] = max(extra[fam] - d, -12.0)
    return extra


def local_frames(y, t, win, hop, fn, floor, n_frames):
    """a cue's frame track on the film's frame grid (frame j = samples [j*hop, j*hop + win)), computed only on a
    window around the cue (zeros outside it give the same values as the whole film would) and `floor` elsewhere.
    A cue that runs past the film's end is computed on the whole (wrapped) film."""
    h, w = n_of(hop), n_of(win)
    i0 = n_of(t); y = st(y)
    if i0 + len(y) > N_FILM:
        one = np.zeros((N_FILM, 2)); M.place_wrapped(one, y, t)
        v = fn(one)
        out = np.full(n_frames, floor); k = min(n_frames, len(v)); out[:k] = v[:k]
        return out
    pad = w + n_of(0.25)
    s0 = max(0, ((i0 - pad) // h) * h); s1 = min(N_FILM, i0 + len(y) + pad)
    seg = np.zeros((s1 - s0, 2)); seg[i0 - s0: i0 - s0 + len(y)] = y
    v = fn(seg)
    out = np.full(n_frames, floor)
    j0 = s0 // h; k = max(0, min(len(v), n_frames - j0))
    out[j0: j0 + k] = v[:k]
    return out


def band_track(x, band, win=0.03, hop=0.01):
    """band power (linear, mean square) of a stereo / mono signal in `win` windows every `hop` s."""
    m = st(x).mean(axis=1)
    b = ss.sosfiltfilt(ss.butter(4, band, "bandpass", fs=SR, output="sos"), m)
    w, h = n_of(win), n_of(hop)
    c = np.concatenate([[0.0], np.cumsum(b ** 2)])
    idx = np.arange(0, max(1, len(b) - w), h)
    return (idx + w / 2) / SR, (c[idx + w] - c[idx]) / w


def word_frames(tv, ev, span, act_db=12.0):
    """the frames of a word's span where the voice is active in a band (within `act_db` of its max there)."""
    m = (tv >= span[0]) & (tv <= span[1])
    if not m.any():
        return m
    lv = 10 * np.log10(ev + 1e-30)
    mx = lv[m].max()
    return m & (lv >= mx - act_db) & (lv > -75.0)


def word_metrics(Ev, Erest, tv, Erest_tonal=None):
    """per hit word and band: the voice over the rest (dB) summed over the word's active frames, and the worst
    single frame there. For the words in sheet.TONAL_RELAXED the enforced number counts measured-tonal maskers
    TONAL_MASKING_DB less (`Erest_tonal`); "raw" keeps the plain energy ratio."""
    out = []
    for (w, s) in sheet.HIT_WORDS:
        span = sheet.word_span(w, s)
        row = {"word": w, "t": s}
        relaxed = (w, s) in sheet.TONAL_RELAXED and Erest_tonal is not None
        for bn in BANDS:
            act = word_frames(tv, Ev[bn], span)
            if not act.any():
                row[bn] = None; continue
            R = Erest_tonal[bn] if relaxed else Erest[bn]
            row[bn] = round(float(10 * np.log10(Ev[bn][act].sum() / (R[act].sum() + 1e-30))), 1)
            row[bn + "_min"] = round(float(np.min(10 * np.log10(Ev[bn][act] / (R[act] + 1e-30)))), 1)
            if relaxed:
                row[bn + "_raw"] = round(float(10 * np.log10(Ev[bn][act].sum() / (Erest[bn][act].sum() + 1e-30))), 1)
        out.append(row)
    return out


def word_guard(rows, arrs, bed, extra, iters=12):
    """Review item 1: on every hit word, at 1-4 and 4-10 kHz, the voice >= WORD_MIN dB over everything else. Where a
    word falls short, the sound that masks it most there comes down (a whole sound, so A5's equal boards stay equal),
    step by step. Returns (extra, the final metrics, the words the bed alone holds under)."""
    v = load(VOICE, mono=True); v = np.pad(v, (0, max(0, N_FILM - len(v))))[:N_FILM]
    Ev, Eb, Ec = {}, {}, {}
    for bn, band in BANDS.items():
        tv, Ev[bn] = band_track(v, band)
        _, Eb[bn] = band_track(bed, band)
        Ec[bn] = []
        for r in rows:
            e = local_frames(arrs[r["name"]], frame_t(r["t"]), 0.03, 0.01,
                             lambda z, band=band: band_track(z, band)[1], 0.0, len(tv))
            Ec[bn].append(e)
    fams = [r["fam"] for r in rows]

    tw = np.array([db2a(-sheet.TONAL_MASKING_DB) ** 2 if r.get("tonal") else 1.0 for r in rows])

    def rest(bn, ex, w=None):
        g = np.array([10 ** ((r["g_db"] + ex[r["fam"]]) / 10) for r in rows])
        if w is not None:
            g = g * w
        return Eb[bn] + (g[:, None] * np.array(Ec[bn])).sum(0)
    bed_limited = set()
    for _ in range(iters):
        R = {bn: rest(bn, extra) for bn in BANDS}
        RT = {bn: rest(bn, extra, tw) for bn in BANDS}
        met = word_metrics(Ev, R, tv, RT)
        worst = None
        for row in met:
            for bn in BANDS:
                if row[bn] is None or row[bn] >= WORD_MIN + WORD_MARGIN:
                    continue
                span = sheet.word_span(row["word"], row["t"]); act = word_frames(tv, Ev[bn], span)
                share = {}
                g = {r["fam"]: 10 ** ((r["g_db"] + extra[r["fam"]]) / 10) for r in rows}
                relaxed = (row["word"], row["t"]) in sheet.TONAL_RELAXED
                for i, r in enumerate(rows):
                    e = g[r["fam"]] * Ec[bn][i][act].sum() * (tw[i] if relaxed else 1.0)
                    if e > 0:
                        share[r["fam"]] = share.get(r["fam"], 0.0) + e
                bed_e = Eb[bn][act].sum()
                if not share or max(share.values()) < 0.15 * (bed_e + sum(share.values())):
                    bed_limited.add((row["word"], row["t"], bn)); continue
                fam = max(share, key=share.get)
                short = WORD_MIN + WORD_MARGIN - row[bn]
                if worst is None or short > worst[0]:
                    worst = (short, fam, row["word"], bn)
        if worst is None:
            break
        short, fam, w, bn = worst
        extra[fam] = max(extra[fam] - min(short + 0.3, 4.0), -18.0)
    R = {bn: rest(bn, extra) for bn in BANDS}
    RT = {bn: rest(bn, extra, tw) for bn in BANDS}
    return extra, word_metrics(Ev, R, tv, RT), sorted(bed_limited)


def match_seam(rows, arrs):
    """the un-build's last 15 ms (2-8 kHz) = the flood's first 15-45 ms at their gains: the crossfade at the loop
    seam keeps one level (review item 10). Returns the dB to add to pencil_reverse."""
    def rms(x, a, b):
        z = bp(st(x).mean(axis=1), 2000, 8000, 4)[n_of(a): n_of(b)]
        return np.sqrt(np.mean(z ** 2) + 1e-30)
    gf = next(r["g_tot"] for r in rows if r["fam"] == "pencil_flood")
    gr = next(r["g_tot"] for r in rows if r["fam"] == "pencil_reverse")
    rev = arrs[next(r["name"] for r in rows if r["fam"] == "pencil_reverse")]
    flo = arrs[next(r["name"] for r in rows if r["fam"] == "pencil_flood")]
    d0 = len(rev) / SR - SEAM_XF
    lr = a2db(rms(rev, d0 - 0.015, d0)) + gr
    lf = a2db(rms(flo, SEAM_XF, SEAM_XF + 0.03)) + gf
    return float(lf - lr)


def build(write=True):
    OUT.mkdir(parents=True, exist_ok=True)
    used = sorted({c[1] for c in sheet.CUES})
    missing = [u for u in used if sheet.sound_of(u)[0] not in SOUNDS]
    assert not missing, f"cue sheet names sounds that do not exist: {missing}"
    files, arrs = {}, {}
    for name in used:
        s, v = sheet.sound_of(name)
        y = SOUNDS[s](v or 1)
        stem = sheet.file_stem(name)
        trim = s not in UNTRIMMED
        y = finish_sfx(y, stem, OUT, trim=trim, fade_out_ms=25.0 if trim else 2.0, fade_in_ms=1.5)
        arrs[name] = y
        c, _ = click_report(y)
        ev, eb = M.cue_levels(y)
        files[name] = {"file": stem, "dur": round(len(y) / SR, 3), "event_lufs": round(ev, 2), "band_db": round(eb, 2),
                       "clicks": c, "tonality": round(tonality(y), 2), "mono_notch_db": mono_notch_db(y)}
    # the stale files of the first draft go (this script owns public/v2r/sfx)
    keep = {f["file"] + ".wav" for f in files.values()}
    for p in OUT.glob("*.wav"):
        if p.name not in keep:
            p.unlink()
    V = M.voice_tracks()
    vref = V["vref"]
    bed = load(PUBLIC / "music_bed.wav")[:N_FILM] if (PUBLIC / "music_bed.wav").exists() else np.zeros((N_FILM, 2))
    # 1. each cue's own limit (sheet / local / band; the review's caps vs the draft), 2. one common step per sound
    # (same idea = same level relation, A5's equal boards), 3. the bus guard (cues that sound together), 4. the word
    # guard (every hit word wins its bands), each again a whole sound at a time
    rows = []
    first_under = {}
    for (t, name, under, note) in sheet.CUES:
        fam = sheet.sound_of(name)[0]
        f = files[name]
        first_under.setdefault(fam, under)
        g_sheet = vref - under - f["event_lufs"]
        if fam in sheet.LEAD_SOUNDS:
            lim, rule = sheet.DRAFT_LEVEL[fam] + sheet.VS_DRAFT[fam] - f["event_lufs"], "fixed (draft +4 dB)"
        else:
            lim, rule = gain_for(V, frame_t(t), under, f["event_lufs"], f["band_db"], f["dur"],
                                 f["tonality"] >= TONAL_MIN)
            if fam in sheet.VS_DRAFT:
                cap = sheet.DRAFT_LEVEL[fam] + sheet.VS_DRAFT[fam] - (under - first_under[fam]) - f["event_lufs"]
                if cap < lim:
                    lim, rule = cap, f"draft {sheet.VS_DRAFT[fam]:+.0f} dB"
        rows.append({"t": t, "name": name, "fam": fam, "under": under, "note": note, "lim": lim, "rule": rule,
                     "g_sheet": g_sheet, "tonal": f["tonality"] >= TONAL_MIN})
    step = {}
    for r in rows:
        step[r["fam"]] = min(step.get(r["fam"], 99.0), r["lim"] - r["g_sheet"])
    for r in rows:
        r["g_db"] = r["g_sheet"] + step[r["fam"]]
        if abs(r["g_db"] - r["lim"]) > 0.05:
            r["rule"] = "group"
    extra = bus_guard(rows, arrs, V, bed)
    bus_extra = dict(extra)
    extra, words, bed_limited = word_guard(rows, arrs, bed, dict(extra))
    for r in rows:
        r["g_tot"] = r["g_db"] + extra[r["fam"]]
    seam_db = match_seam(rows, arrs)
    for r in rows:
        if r["fam"] == "pencil_reverse":
            r["g_tot"] += seam_db
    cues = [{"src": "v2r/music_bed.wav", "t": 0.0, "gain": 1.0,
             "note": "the bed 'Towpath' (music + canal / Arlington air, pre-ducked under the locked voice): play as is"}]
    for r in rows:
        rule = r["rule"]
        if bus_extra[r["fam"]] < -0.05:
            rule += f", bus {bus_extra[r['fam']]:+.1f}"
        if extra[r["fam"]] - bus_extra[r["fam"]] < -0.05:
            rule += f", words {extra[r['fam']] - bus_extra[r['fam']]:+.1f}"
        if r["fam"] == "pencil_reverse":
            rule += f", seam match {seam_db:+.1f}"
        g = float(db2a(r["g_tot"]))
        if g > 1.0:
            print(f"WARNING {r['name']} @{r['t']}: gain {g:.2f} > 1: clipped to 1", file=sys.stderr)
            g = 1.0
        cues.append({"src": f"v2r/sfx/{files[r['name']]['file']}.wav", "t": round(r["t"], 4), "gain": round(g, 4),
                     "note": r["note"], "under_db": r["under"], "set_by": rule})
    if write:
        (PUBLIC / "cues.json").write_text(json.dumps(cues, indent=1, ensure_ascii=False) + "\n")
    rep = {"voice_speech_level": round(vref, 2), "files": files, "words": words, "bed_limited_words": bed_limited,
           "seam_match_db": round(seam_db, 2), "glass_ting_decay": ting_decay(arrs)}
    SCRATCH.mkdir(parents=True, exist_ok=True)
    (SCRATCH / "sfx_report.json").write_text(json.dumps(rep, indent=1))
    print(f"voice speech level {vref:.2f} LUFS (momentary median); {len(files)} files, {len(cues) - 1} cues -> "
          f"{OUT} + {PUBLIC / 'cues.json'}")
    for k, v in files.items():
        print(f"  {v['file']:16s} {v['dur']:5.2f} s  event {v['event_lufs']:6.1f} LUFS  1-4 kHz {v['band_db']:6.1f} dB  "
              f"tonal {v['tonality']:.2f}  mono notch {v['mono_notch_db']:5.1f} dB  clicks {v['clicks']}")
    for c in cues[1:]:
        print(f"  {c['t']:7.3f} {c['src'].split('/')[-1]:20s} gain {c['gain']:.4f}  set by {c['set_by']}")
    print("hit words (voice over bed + SFX, dB: 1-4 kHz [worst frame], 4-10 kHz [worst frame]):")
    for w in words:
        raw = f"  (raw {w.get('1-4k_raw')} / {w.get('4-10k_raw')})" if "1-4k_raw" in w else ""
        print(f"  {w['t']:6.2f} {w['word']:13s} {w['1-4k']} [{w.get('1-4k_min')}]  {w['4-10k']} [{w.get('4-10k_min')}]{raw}")
    print("bed-limited:", bed_limited, " seam match", round(seam_db, 2), "dB  ting decay", rep["glass_ting_decay"])
    return cues, files, vref


def ting_decay(arrs):
    """dB under its own peak (50 ms RMS) 0.22 s and 0.31 s after the strike: >= 30 before the next word."""
    out = {}
    for name, y in arrs.items():
        if not name.startswith("glass_ting"):
            continue
        m = st(y).mean(axis=1); w = n_of(0.05)
        e = np.sqrt(np.convolve(m ** 2, np.ones(w) / w, "same"))
        pk = e.max()
        out[name] = {f"{d}": round(float(a2db(e[min(len(e) - 1, n_of(d))] / pk)), 1) if n_of(d) < len(e) else -120.0
                     for d in (0.22, 0.31)}
    return out


if __name__ == "__main__":
    build()
