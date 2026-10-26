"""Sounds for v3's opening shot (the data center outgrows the window): audio/sfx/v3_<name>.wav, synthesised with
make_sfx's helpers (original, licence-free). Crane clunks rise in pitch like a roller-coaster chain lift, the floors
slam on "pricier" with a stamp, a tiny LED tick sets up tension, and a low "thoom" lands on "centers"."""
import sys
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).parent))
from make_sfx import SR, CATALOG, adsr, finalize, hp, lp, metal_click, modal, noise, place, stereo  # noqa: E402


def thump(f0, dur, decay, seed):
    n = int(dur * SR); t = np.arange(n) / SR
    f = f0 * (1 + 0.6 * np.exp(-t / 0.02))  # a little pitch drop on the hit
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / decay)
    burst = lp(noise(dur, seed), 900) * np.exp(-t / 0.012) * 0.5
    return body + burst


def crane_clunk(k):
    # chain-lift clunk: metal click + a short low knock; pitch rises with k
    out = np.zeros(int(0.25 * SR))
    place(out, metal_click(10 + k, bright=0.55 + 0.12 * k), 0.0, 0.7)
    place(out, thump(95 + 18 * k, 0.2, 0.05, 20 + k), 0.004, 0.8)
    return finalize(f'v3_crane_clunk_{k}', stereo(out, width=0.2), desc=f'crane chain clunk {k} (rising)')


def floor_slam():
    out = np.zeros(int(0.5 * SR))
    place(out, thump(62, 0.45, 0.12, 31), 0.0, 1.0)
    place(out, metal_click(32, bright=0.4), 0.002, 0.35)
    return finalize('v3_floor_slam', stereo(out, width=0.25), fade_out_ms=60, desc='heavy floor slam (four in a row on "pricier")')


def stamp():
    out = np.zeros(int(0.3 * SR))
    place(out, thump(140, 0.18, 0.03, 41), 0.0, 0.9)
    n = int(0.06 * SR)
    place(out, hp(noise(0.06, 42), 1500) * adsr(n, 0.0005, 0.02) * 0.6, 0.0, 1.0)  # paper slap
    return finalize('v3_stamp', stereo(out), desc='rubber stamp: "$$$"')


def led_tik():
    y = modal([5200, 7900], [0.008, 0.004], [1.0, 0.4], 0.04, exc_ms=0.15, seed=51)
    return finalize('v3_led_tik', stereo(y, width=0.1), desc='tiny LED tick (out of step)')


def thoom():
    dur = 1.4; n = int(dur * SR); t = np.arange(n) / SR
    sub = np.sin(2 * np.pi * 48 * t) * adsr(n, 0.02, 1.1, curve=2.5)
    air = lp(noise(dur, 61), 400) * adsr(n, 0.15, 1.0) * 0.35
    return finalize('v3_thoom', stereo(sub + air, width=0.35), fade_out_ms=200, desc='low thoom: the data center wakes up')


if __name__ == '__main__':
    for k in range(1, 5):
        crane_clunk(k)
    floor_slam()
    stamp()
    led_tik()
    thoom()
    for name, dur, clicks, desc in CATALOG:
        print(f'{name:20s} {dur:5.2f}s clicks={clicks} {desc}')
