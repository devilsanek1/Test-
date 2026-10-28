#!/usr/bin/env python3
"""Generate the sky's blue-noise dither tile (void-and-cluster, Ulichney 1993) and print it for src/lib/sky.tsx.

  python3 -I scripts/look/make_blue_noise.py            # prints the base64 tile + its spectrum check
  python3 -I scripts/look/make_blue_noise.py --check    # only the spectrum / histogram check

Why our own tile: a 64 x 64 blue-noise threshold map is the standard dither mask in real-time graphics (Christoph
Peters' free CC0 textures; Alan Wolfe's void-and-cluster notes). Generating it here keeps the repo free of third-party
assets and makes the embedded bytes reproducible: the same seed gives the same tile, byte for byte.

Method (Ulichney, "The void-and-cluster method for dither array generation", SPIE 1913, 1993):
  energy  = the binary pattern convolved with a toroidal Gaussian (sigma 1.5 px, Ulichney's value), so the tile wraps
            seamlessly; a "cluster" is the 1 with the highest energy, a "void" the 0 with the lowest.
  phase 0 = a seeded random pattern with 10 % ones, relaxed (move the tightest cluster into the largest void until stable).
  phase 1 = rank the initial ones: remove the tightest cluster, rank count-1 down to 0.
  phase 2 = from the initial pattern, fill the largest void, rank up to half the cells.
  phase 3 = from half to all: fill the tightest cluster of zeros (the minority), rank up to N-1.
The ranks 0..4095 become thresholds t = (rank + 0.5) / 4096, stored as 8-bit (t * 256), row-major, base64.
"""
import argparse
import base64
import sys

import numpy as np

N = 64
SIGMA = 1.5
SEED = 20261027


def gaussian_kernel(n: int, sigma: float) -> np.ndarray:
    """Toroidal Gaussian centred on (0, 0) of an n x n torus."""
    d = np.minimum(np.arange(n), n - np.arange(n)).astype(float)
    g1 = np.exp(-(d ** 2) / (2 * sigma ** 2))
    return np.outer(g1, g1)


def void_and_cluster(n: int = N, sigma: float = SIGMA, seed: int = SEED, ones: float = 0.1) -> np.ndarray:
    rng = np.random.default_rng(seed)
    K = gaussian_kernel(n, sigma)
    KF = np.fft.rfft2(K)

    def energy(p: np.ndarray) -> np.ndarray:
        return np.fft.irfft2(np.fft.rfft2(p) * KF, s=p.shape)

    def kern_at(y: int, x: int) -> np.ndarray:
        return np.roll(np.roll(K, y, axis=0), x, axis=1)

    total = n * n
    p = np.zeros((n, n))
    p.flat[rng.choice(total, int(total * ones), replace=False)] = 1
    # phase 0: relax the initial pattern
    E = energy(p)
    for _ in range(total * 4):
        e1 = np.where(p == 1, E, -np.inf)
        cy, cx = np.unravel_index(np.argmax(e1), p.shape)
        p[cy, cx] = 0
        E -= kern_at(cy, cx)
        e0 = np.where(p == 0, E, np.inf)
        vy, vx = np.unravel_index(np.argmin(e0), p.shape)
        if (vy, vx) == (cy, cx):
            p[cy, cx] = 1
            E += kern_at(cy, cx)
            break
        p[vy, vx] = 1
        E += kern_at(vy, vx)
    initial = p.copy()
    count = int(initial.sum())
    rank = np.full((n, n), -1, dtype=int)
    # phase 1: rank the initial ones, tightest cluster first (highest rank)
    p = initial.copy()
    E = energy(p)
    for r in range(count - 1, -1, -1):
        e1 = np.where(p == 1, E, -np.inf)
        y, x = np.unravel_index(np.argmax(e1), p.shape)
        p[y, x] = 0
        E -= kern_at(y, x)
        rank[y, x] = r
    # phase 2: fill the largest voids up to half
    p = initial.copy()
    E = energy(p)
    r = count
    while r < total // 2:
        e0 = np.where(p == 0, E, np.inf)
        y, x = np.unravel_index(np.argmin(e0), p.shape)
        p[y, x] = 1
        E += kern_at(y, x)
        rank[y, x] = r
        r += 1
    # phase 3: the zeros are now the minority; fill their tightest cluster
    Z = energy(1 - p)
    while r < total:
        ez = np.where(p == 0, Z, -np.inf)
        y, x = np.unravel_index(np.argmax(ez), p.shape)
        p[y, x] = 1
        Z -= kern_at(y, x)
        rank[y, x] = r
        r += 1
    assert (rank >= 0).all() and len(np.unique(rank)) == total
    return rank


def spectrum_check(t: np.ndarray) -> dict:
    """Radially averaged power spectrum of the zero-mean threshold map: blue noise keeps the low frequencies empty."""
    n = t.shape[0]
    P = np.abs(np.fft.fft2(t - t.mean())) ** 2
    fy = np.fft.fftfreq(n)[:, None]
    fx = np.fft.fftfreq(n)[None, :]
    f = np.sqrt(fx ** 2 + fy ** 2)  # cycles / px, 0 .. 0.707
    bins = [(0.0, 0.0625), (0.0625, 0.125), (0.125, 0.25), (0.25, 0.375), (0.375, 0.5), (0.5, 0.71)]
    mean_all = P[f > 0].mean()
    out = {}
    for lo, hi in bins:
        m = (f > max(lo, 1e-9)) & (f <= hi)
        out[f'{lo:.3f}-{hi:.3f}'] = float(P[m].mean() / mean_all)
    # white noise of the same histogram for comparison
    rng = np.random.default_rng(1)
    w = rng.permutation(t.ravel()).reshape(t.shape)
    Pw = np.abs(np.fft.fft2(w - w.mean())) ** 2
    m = (f > 0) & (f <= 0.125)
    out['white_low'] = float(Pw[m].mean() / Pw[f > 0].mean())
    return out


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--check', action='store_true', help='only print the spectrum and histogram check')
    a = ap.parse_args()
    rank = void_and_cluster()
    t8 = (rank * 256 // (N * N)).astype(np.uint8)  # 0..255, 16 cells per value
    spec = spectrum_check((rank + 0.5) / (N * N))
    hist = np.bincount(t8.ravel(), minlength=256)
    print(f'void-and-cluster {N}x{N}, sigma {SIGMA}, seed {SEED}: 8-bit histogram min {hist.min()} max {hist.max()} (16 = flat)')
    print('radial power / mean (blue noise: low bins << 1, white noise ~1):')
    for k, v in spec.items():
        print(f'  {k:>12}: {v:.3f}')
    if not a.check:
        b64 = base64.b64encode(t8.tobytes()).decode('ascii')
        print('BLUE_NOISE_64 =')
        for i in range(0, len(b64), 112):
            print(b64[i:i + 112])
    return 0


if __name__ == '__main__':
    sys.exit(main())
