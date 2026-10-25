"""Positive phone-sound family -> audio/sfx/phone_<name>.wav (owner, 2026-10-25: "effects people associate with something
positive on their phone ... as early as possible"). All synthesised here with make_sfx's helpers, so they evoke a like
pop / notification ding / message-sent swoosh / added-to-cart pop without copying any platform's real sound."""
import sys
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).parent))
from make_sfx import SR, CATALOG, adsr, bubble, finalize, modal, place, pop, stereo, swish  # noqa: E402


def sparkle(dur=0.22, base=2650.0, seed=3):
    """two soft high partials with a fast decay: the 'glint' on top of a pop"""
    n = int(dur * SR); t = np.arange(n) / SR
    y = 0.55 * np.sin(2 * np.pi * base * t) * np.exp(-t / 0.045)
    y += 0.30 * np.sin(2 * np.pi * base * 1.5 * t + 0.7) * np.exp(-t / 0.03)
    return y * adsr(n, 0.002, dur * 0.9)


def like_pop():
    out = np.zeros(int(0.32 * SR))
    place(out, pop(720, ratio=1.8, dur=0.11), 0.0, 0.9)
    place(out, bubble(950, dur=0.06), 0.012, 0.55)
    place(out, sparkle(), 0.035, 0.35)
    return finalize('phone_like_pop', stereo(out, width=0.25), desc='like / heart pop: round pop + soft glint')


def notify_ding():
    out = np.zeros(int(0.9 * SR))
    a = modal([1046.5, 2093.0, 3140.0], [0.35, 0.18, 0.08], [1.0, 0.35, 0.12], 0.8, exc_ms=0.5, seed=5)
    b = modal([1568.0, 3136.0, 4704.0], [0.40, 0.2, 0.08], [1.0, 0.3, 0.1], 0.8, exc_ms=0.5, seed=6)
    place(out, a, 0.0, 0.8)
    place(out, b, 0.095, 0.7)
    return finalize('phone_notify_ding', stereo(out, width=0.3), fade_out_ms=60, desc='two-note notification ding (C6, G6)')


def sent_swoosh():
    y = swish(0.26, 900, 5200, peak=0.6, seed=11)
    return finalize('phone_sent_swoosh', stereo(y, width=0.4), desc='message-sent swoosh, rising')


def cart_add():
    out = np.zeros(int(0.45 * SR))
    place(out, pop(560, ratio=2.0, dur=0.1), 0.0, 0.8)
    t = modal([2349.0, 4698.0], [0.12, 0.05], [1.0, 0.25], 0.35, exc_ms=0.4, seed=9)
    place(out, t, 0.06, 0.45)
    return finalize('phone_cart_add', stereo(out, width=0.25), desc='added-to-cart: soft pop + bright tick (D7)')


if __name__ == '__main__':
    for f in (like_pop, notify_ding, sent_swoosh, cart_add):
        f()
    for name, dur, clicks, desc in CATALOG:
        print(f'{name:22s} {dur:5.2f}s clicks={clicks} {desc}')
