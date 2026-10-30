"""light_s1 bake: the paper grain (placeholder: none until designed)."""
import numpy as np


def grain_static(T, L):
    return T


def grain_tile(size=256):
    return np.full((size, size, 3), 0.5, np.float32), size
