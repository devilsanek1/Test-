"""v2 sound cues for the G3 board (and later gates) -> public/v2/v2_<name>.wav, all synthesised here with the shared
sfx kit (audio/tools/make_sfx.py: filtered noise, modal resonators, chirps), so every sound is our own: no platform
or system sound is copied. 48 kHz, 24-bit stereo, peak -6 dBFS; the animatic's sfx gains set the levels.

  python3 scripts/v2/make_sfx.py

The first-second positive phone sound (owner, 2026-10-25) is the "signed!" chime: two bright rising notes (E6 -> A6,
0.14 s apart, ~0.35 s) as her signature lands on her job contract on frame 0."""
import sys
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / 'audio' / 'tools'))
import make_sfx as K  # noqa: E402
from make_sfx import (SR, CATALOG, adsr, bell_env, bp, bubble, finalize, hp, lp, metal_click, modal, noise, pencil, place,  # noqa: E402
                      pop, stereo, swish, tv_filter)
from common import db2a, save  # noqa: E402

OUT = ROOT / 'public' / 'v2'
K.OUT = OUT  # finalize() writes here


def bed(name, y, fade_in=0.25, fade_out=0.6, desc=''):
    """an ambience of an exact length: no trim, soft fades, DC-free, peak -6 dBFS"""
    y = np.asarray(y, dtype=np.float64)
    if y.ndim == 1:
        y = stereo(y, width=0.5)
    y = y - y.mean(axis=0)
    fi, fo = int(fade_in * SR), int(fade_out * SR)
    y[:fi] *= np.linspace(0, 1, fi)[:, None]
    y[-fo:] *= (np.linspace(1, 0, fo) ** 2)[:, None]
    y = y / (np.abs(y).max() + 1e-12) * db2a(-6.0)
    save(OUT / f'{name}.wav', y)
    CATALOG.append((name, len(y) / SR, 0, desc))
    return y


def thump(f0, dur, decay, seed):
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = f0 * (1 + 0.6 * np.exp(-t / 0.02))
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / decay)
    burst = lp(noise(dur, seed), 900) * np.exp(-t / 0.012) * 0.5
    return body + burst


def chime_note(f, dur=0.32, seed=0):
    """one bright, glassy phone-UI note: a struck bar (fundamental + 2.76x + 5.4x partials) with a soft sine core"""
    n = int(dur * SR)
    t = np.arange(n) / SR
    bar = modal([f, f * 2.76, f * 5.40], [0.16, 0.05, 0.02], [1.0, 0.32, 0.12], dur, exc_ms=0.35, seed=seed)
    core = np.sin(2 * np.pi * f * t) * adsr(n, 0.004, 0.11) * 0.55
    return bar + core


def signed_chime():
    out = np.zeros(int(0.5 * SR))
    place(out, chime_note(1318.5, seed=1), 0.0, 0.8)    # E6
    place(out, chime_note(1760.0, seed=2), 0.14, 1.0)   # A6: up a fourth, "done!"
    place(out, hp(noise(0.03, 3), 5000) * adsr(int(0.03 * SR), 0.0005, 0.006) * 0.25, 0.14, 1.0)  # a tiny sparkle tick
    return finalize('v2_signed_chime', stereo(out, width=0.3), fade_out_ms=80, desc='"signed!" chime: E6 then A6, bright and rising')


def badge_clack():
    out = np.zeros(int(0.3 * SR))
    place(out, metal_click(7, bright=0.75) * 0.6, 0.0)   # the plastic card's tick
    place(out, modal([210, 470, 980], [0.05, 0.03, 0.012], [1.0, 0.5, 0.25], 0.2, exc_ms=2.0, seed=8), 0.004, 0.9)  # cardboard knock
    return finalize('v2_badge_clack', stereo(out, width=0.2), desc='work badge dropped into a cardboard box')


def marker_squeak():
    dur = 0.32
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = 2150 + 500 * t / dur + 90 * np.sin(2 * np.pi * 23 * t)  # a felt tip dragging: a wavering rising squeal
    tone = np.sin(2 * np.pi * np.cumsum(f) / SR) * bell_env(n, 0.3, 1.2) * 0.5
    rub = tv_filter(noise(dur, 21), 2600 + 1400 * bell_env(n, 0.4, 1.0), bw_oct=0.5) * bell_env(n, 0.25, 1.0)
    return finalize('v2_marker_squeak', stereo(tone + rub * 0.8, width=0.2), desc='marker squeak along one line')


def unroll(name, dur, seed, desc):
    """paper unrolling: a rising, crackly hiss that ends dead (the room then goes quiet)"""
    n = int(dur * SR)
    t = np.arange(n) / n
    r = np.random.default_rng(seed)
    hiss = tv_filter(r.standard_normal(n), 1400 + 3200 * t, bw_oct=0.9) * (0.25 + 0.75 * t ** 1.5)
    crk = (r.random(n) < 1400 / SR) * r.uniform(-1, 1, n)
    crk = bp(np.convolve(crk, np.exp(-np.arange(50) / 10.0))[:n], 1500, 7000) * (0.2 + 0.8 * t) * 0.9
    steps = np.zeros(n)
    for k in range(int(dur / 0.15)):  # a soft tick each time the page steps out (every 0.15 s)
        place(steps, modal([900, 2100], [0.01, 0.006], [1, 0.5], 0.03, exc_ms=0.3, seed=seed + k) * 0.5, k * 0.15)
    y = hiss + crk + steps
    return finalize(name, stereo(y, width=0.45), fade_out_ms=25, desc=desc)


def room_tone(name, dur, seed, desc):
    """her room at dusk: a faint lamp hum (100 Hz + harmonics) and low-passed weather behind the glass"""
    n = int(dur * SR)
    t = np.arange(n) / SR
    hum = sum(a * np.sin(2 * np.pi * f * t) for f, a in [(100, 1.0), (200, 0.4), (300, 0.15)]) * 0.12
    r = np.random.default_rng(seed)
    knots = np.convolve(r.standard_normal(n // 9600 + 3), np.ones(3) / 3, 'same')  # a slow gust every ~0.2 s
    gust = 0.7 + 0.3 * np.interp(np.arange(n) / 9600, np.arange(len(knots)), knots)
    weather = lp(r.standard_normal(n), 700) * gust * 0.9
    return bed(name, hum + weather, desc=desc)


def cold_air():
    dur = 3.3
    n = int(dur * SR)
    r = np.random.default_rng(61)
    a = tv_filter(r.standard_normal(n), 900 + 500 * bell_env(n, 0.5, 1.0), bw_oct=1.2)
    b = hp(r.standard_normal(n), 4000) * 0.12
    return bed('v2_cold_air', a + b, fade_in=0.04, fade_out=0.5, desc='open, cold air (leaving her room)')


def rise_swell():
    dur = 1.9
    n = int(dur * SR)
    t = np.arange(n) / SR
    env = bell_env(n, 0.72, 1.4)
    sub = np.sin(2 * np.pi * np.cumsum(46 + 10 * t / dur) / SR) * env
    air = lp(noise(dur, 71), 500) * env * 0.4
    return finalize('v2_rise_swell', stereo(sub + air, width=0.35), fade_out_ms=200, desc='low, quiet swell under the rise (no drums)')


def stamp(name, f0, decay, slap, seed, desc):
    out = np.zeros(int(0.4 * SR))
    place(out, thump(f0, 0.3, decay, seed), 0.0, 1.0)
    m = int(0.06 * SR)
    place(out, hp(noise(0.06, seed + 1), 1500) * adsr(m, 0.0005, 0.02) * slap, 0.0, 1.0)  # rubber on paper
    place(out, modal([180, 390], [0.04, 0.02], [1, 0.4], 0.12, exc_ms=3, seed=seed + 2) * 0.5, 0.002)  # the desk under it
    return finalize(name, stereo(out), desc=desc)


def paper_tap():
    y = np.zeros(int(0.2 * SR))
    place(y, lp(modal([260, 610, 1500], [0.03, 0.015, 0.006], [1, 0.5, 0.2], 0.12, exc_ms=2.5, seed=91), 3000), 0)
    place(y, hp(noise(0.03, 92), 2500) * adsr(int(0.03 * SR), 0.0005, 0.006) * 0.3, 0)
    return finalize('v2_paper_tap', stereo(y, width=0.2), desc='a page lands, soft tap')


def pencil_line():
    return finalize('v2_pencil_line', pencil([(0, 0.28, 1.0)], 101), 25, desc='one pencil underline')


def like_pop():
    """the speech-bubble pop: a round pop with a soft glint (our own, phone-like)"""
    out = np.zeros(int(0.32 * SR))
    place(out, pop(760, ratio=1.8, dur=0.11), 0.0, 0.9)
    place(out, bubble(1000, dur=0.06), 0.012, 0.5)
    n = int(0.2 * SR)
    t = np.arange(n) / SR
    place(out, (0.55 * np.sin(2 * np.pi * 2700 * t) * np.exp(-t / 0.045) + 0.3 * np.sin(2 * np.pi * 4050 * t) * np.exp(-t / 0.03)) * 0.35, 0.035)
    return finalize('v2_like_pop', stereo(out, width=0.25), desc='speech-bubble pop, round + glint')


if __name__ == '__main__':
    OUT.mkdir(parents=True, exist_ok=True)
    signed_chime()
    badge_clack()
    marker_squeak()
    unroll('v2_paper_unroll', 1.36, 31, 'paper unrolling, rising hiss, ends dead')
    unroll('v2_paper_unroll_short', 0.6, 37, 'her line runs again (short unroll)')
    room_tone('v2_room_tone_2s', 2.3, 41, 'room tone, 2.3 s')
    room_tone('v2_room_tone_7s', 7.3, 43, 'room tone, 7.3 s')
    room_tone('v2_room_tone_6s', 6.5, 47, 'room tone, 6.5 s')
    cold_air()
    rise_swell()
    stamp('v2_stamp_april', 120, 0.05, 0.6, 51, 'official date stamp: APRIL 2026')
    stamp('v2_stamp_noveto', 95, 0.035, 0.9, 55, 'NO VETO stamp: drier and heavier')
    paper_tap()
    pencil_line()
    like_pop()
    for name, dur, clicks, desc in CATALOG:
        print(f'{name:24s} {dur:5.2f}s clicks={clicks} {desc}')
