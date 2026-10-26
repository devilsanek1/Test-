"""Cut unwanted bits out of an ElevenLabs take: keep the given [start, end] ranges (seconds, from the word timings), snap
each cut to the quietest 20 ms window near it, and join with 15 ms crossfades.
Usage: python3 scripts/voice/clean_take.py IN.wav OUT.wav '[[0,3.2],[6.08,10.24]]' [gap_s]
"""
import json
import sys

import numpy as np
import soundfile as sf


def quietest(y, sr, t, lo, hi):
    """time of the quietest 20 ms window in [t+lo, t+hi]"""
    w = int(0.02 * sr)
    a, b = max(0, int((t + lo) * sr)), min(len(y) - w, int((t + hi) * sr))
    if b <= a:
        return t
    e = np.convolve(y[a:b + w] ** 2, np.ones(w), 'valid')
    return (a + int(np.argmin(e)) + w // 2) / sr


def main():
    src, dst, ranges = sys.argv[1], sys.argv[2], json.loads(sys.argv[3])
    gap = float(sys.argv[4]) if len(sys.argv) > 4 else 0.0
    y, sr = sf.read(src)
    mono = y if y.ndim == 1 else y.mean(axis=1)
    xf = int(0.015 * sr)
    parts = []
    for s, e in ranges:
        s2 = 0.0 if s <= 0 else quietest(mono, sr, s, -0.3, 0.05)
        e2 = len(y) / sr if e >= len(y) / sr else quietest(mono, sr, e, -0.45, 0.05)
        parts.append(y[int(s2 * sr):int(e2 * sr)].copy())
        print(f'keep {s2:.3f}-{e2:.3f}')
    out = parts[0]
    for p in parts[1:]:
        if gap > 0:
            out = np.concatenate([out, np.zeros((int(gap * sr),) + out.shape[1:])])
        ramp = np.linspace(0, 1, xf)
        if out.ndim > 1:
            ramp = ramp[:, None]
        mix = out[-xf:] * (1 - ramp) + p[:xf] * ramp
        out = np.concatenate([out[:-xf], mix, p[xf:]])
    sf.write(dst, out, sr, subtype='PCM_24')
    print(f'{dst}: {len(out) / sr:.2f} s')


if __name__ == '__main__':
    main()
