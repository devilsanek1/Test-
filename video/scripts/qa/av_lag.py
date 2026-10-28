#!/usr/bin/env python3
"""av_lag.py: where a reference track (the locked voice, the mix) sits inside a render's audio: the lag of the best
cross-correlation per window (mono, 8 kHz) and its normalised peak r. Lag 0 ms in every window = the track plays in
sync and does not drift; r ~1.0 = the render's audio IS that track (r 0.95-0.99 for the voice inside a mix with its bed
and cues).

  python3 -I scripts/qa/av_lag.py deliverables/v2/v2r_G5_assembly_v1.mp4 public/v2/voice.wav
  python3 -I scripts/qa/av_lag.py master.mp4 public/v2r/mix.wav --windows 0:12,12:12,26:12 --max-lag 0.5
Positive lag = the render is LATE against the reference. Loudness is ffmpeg's own meter:
  ffmpeg -nostats -i master.mp4 -vn -af ebur128=peak=true -f null - 2>&1 | grep -E "I:|LRA:|Peak:"
"""
from __future__ import annotations

import argparse
import subprocess
import sys

import numpy as np

sys.dont_write_bytecode = True
SR = 8000


def pcm(path: str, ss: float, t: float) -> np.ndarray:
    cmd = ['ffmpeg', '-v', 'error', '-ss', str(ss), '-t', str(t), '-i', path, '-vn', '-ac', '1', '-ar', str(SR), '-f', 's16le', '-']
    return np.frombuffer(subprocess.run(cmd, capture_output=True, check=True).stdout, np.int16).astype(np.float64)


def lag(a: np.ndarray, b: np.ndarray, max_lag: float) -> tuple[float, float]:
    a, b = a - a.mean(), b - b.mean()
    n = 1 << int(np.ceil(np.log2(len(a) + len(b))))
    c = np.fft.irfft(np.fft.rfft(a, n) * np.conj(np.fft.rfft(b, n)), n)
    m = int(max_lag * SR)
    cc = np.concatenate([c[-m:], c[:m + 1]])
    k = int(np.argmax(cc)) - m
    norm = np.sqrt((a * a).sum() * (b * b).sum()) or 1.0
    return k / SR * 1000, float(cc.max() / norm)


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__.split('\n')[0])
    ap.add_argument('render')
    ap.add_argument('reference')
    ap.add_argument('--windows', default='0:12,12:12,26:12', help='start:length seconds, comma-separated')
    ap.add_argument('--max-lag', type=float, default=0.5, help='seconds searched either way')
    ap.add_argument('--tol-ms', type=float, default=1000 / 60, help='FAIL beyond this lag (default one 60 fps frame)')
    a = ap.parse_args()
    bad = 0
    for w in a.windows.split(','):
        ss, t = (float(v) for v in w.split(':'))
        ms, r = lag(pcm(a.render, ss, t), pcm(a.reference, ss, t), a.max_lag)
        ok = abs(ms) <= a.tol_ms
        bad += not ok
        print(f'{"PASS" if ok else "FAIL"} window {ss:g}-{ss + t:g} s: lag {ms:+.1f} ms (r {r:.2f})')
    return 1 if bad else 0


if __name__ == '__main__':
    sys.exit(main())
