"""light_s1 bake: ONE UNIFYING TEXTURE, the paper (the owner, 2026-10-30, on point 9 "an overall texture": "that seems
solvable too?"; the playbook's Texture: VERY subtle, "a fine grain and gentle mottling in the big flats"). One material
for the whole frame, so the vector flats, the painted pieces and the people read as one surface:
  tooth     a fine paper tooth (1-2 px), the visible grain at full size
  fibres    a little medium grain, barely stretched along one fibre direction (-24 deg, 2 x 1 px): never a streak
  mottle    a gentle blotch (40-90 px), the "paint density" of a wash
applied as SOFT-LIGHT around mid-grey (neutral at 50 %: a lift and a darkening of equal weight, strongest in the
mid-tones, so the darks keep their depth and the lights never grey), at ~0.9 L* std on a mid-tone; in the caption band
at 30 % (the words' ground stays calm: light_proof.md §4 measures it). Static plane by plane: baked into each slot's
maps (it rides its plane's float: never a screen-fixed "shower door", never re-seeded per frame); on the movers a tile
of the same material, locked to them (lib/light2 GrainOn). Seeded (sha256 of a name): the same bytes on every run."""
import numpy as np
import cv2

from common import BAND, H, W, rng, smoothstep, value_noise

AMP = 0.022           # the soft-light offset per unit of the field (std 1): ~0.9 L* on a mid-tone
BAND_K = 0.3          # its share in the caption band


def field(name, shape, aniso_deg=-24.0):
    """The paper's field: std 1, zero mean (deterministic)."""
    h, w = shape
    r = rng(f'light_s1/paper/{name}/tooth')
    tooth = r.standard_normal((h, w)).astype(np.float32)
    tooth = cv2.GaussianBlur(tooth, (0, 0), 0.7)
    # fibres: noise stretched along one direction (rotate, stretch, rotate back)
    big = int(np.ceil(np.hypot(h, w))) + 8
    r2 = rng(f'light_s1/paper/{name}/fibres')
    f = r2.standard_normal((big, big)).astype(np.float32)
    f = cv2.GaussianBlur(f, (0, 0), sigmaX=2.4, sigmaY=1.2)
    M = cv2.getRotationMatrix2D((big / 2, big / 2), aniso_deg, 1.0)
    f = cv2.warpAffine(f, M, (big, big), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)
    oy, ox = (big - h) // 2, (big - w) // 2
    fib = f[oy:oy + h, ox:ox + w]
    mot = value_noise(f'light_s1/paper/{name}/mottle', (h, w), 70, octaves=2, gain=0.55)
    z = lambda a: (a - a.mean()) / (a.std() + 1e-6)
    g = 0.58 * z(tooth) + 0.2 * z(fib) + 0.36 * z(mot)
    return z(g).astype(np.float32)


def soft_light(cb, cs):
    """W3C soft-light, per channel (what the browser's mix-blend-mode does)."""
    d = np.where(cb <= 0.25, ((16 * cb - 12) * cb + 4) * cb, np.sqrt(np.clip(cb, 0, 1)))
    return np.where(cs <= 0.5, cb - (1 - 2 * cs) * cb * (1 - cb), cb + (2 * cs - 1) * (d - cb))


_FIELD = {}


def frame_field():
    if 'f' not in _FIELD:
        _FIELD['f'] = field('frame', (H, W))
    return _FIELD['f']


def grain_static(T, L):
    """The paper on the static picture (sRGB float), the band at 30 %."""
    g = frame_field()
    yy = np.mgrid[0:H, 0:W][0].astype(np.float32)
    inband = smoothstep(BAND[0] - 40, BAND[0], yy) * (1 - smoothstep(BAND[1], BAND[1] + 40, yy))
    k = AMP * (1 - (1 - BAND_K) * inband)
    cs = np.clip(0.5 + (g * k)[..., None], 0, 1)
    return np.clip(soft_light(T, cs), 0, 1).astype(np.float32)


def grain_tile(size=256):
    """The movers' tile: the same material (mid-grey + the field), soft-light in the engine."""
    g = field('mover', (size, size))
    t = np.clip(0.5 + g * AMP, 0, 1)
    return np.repeat(t[..., None], 3, -1).astype(np.float32), size
