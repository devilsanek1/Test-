"""light_s1 bake, shared pieces (light_proof.md §2): colour conversions, the seeded generators, the parts renders'
alphas, which slot's map carries each pixel (the carrier) and what surface each pixel is (the label).

Everything is deterministic: the seeds are sha256 of a name (PAINT_RECIPES §3 C16), no global state."""
import hashlib
import os

import cv2
import numpy as np

W, H = 1080, 1920
T_STILL = 1.0
#: the caption band (LAYOUT.md) and the light's guard outside it (light.md §5.4: every layer stops 10 px outside it)
BAND = (290, 600)
BAND_GUARD = 10

# ------------------------------------------------------------------------------------------------ colour

def to_lin(s):
    s = np.asarray(s, np.float32)
    return np.where(s <= 0.04045, s / 12.92, ((s + 0.055) / 1.055) ** 2.4).astype(np.float32)


def to_srgb(l):
    l = np.clip(np.asarray(l, np.float32), 0, None)
    return np.where(l <= 0.0031308, 12.92 * l, 1.055 * np.power(l, 1 / 2.4) - 0.055).astype(np.float32)


def hex_rgb(h):
    h = h.lstrip('#')
    return np.array([int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)], np.float32)


def lin_hex(h):
    return to_lin(hex_rgb(h))


_M = np.array([[0.4124564, 0.3575761, 0.1804375], [0.2126729, 0.7151522, 0.072175], [0.0193339, 0.119192, 0.9503041]], np.float32)
_MI = np.linalg.inv(_M).astype(np.float32)
_WN = np.array([0.95047, 1.0, 1.08883], np.float32)


def lin_to_lab(l):
    xyz = l @ _M.T / _WN
    e = 216 / 24389
    k = 24389 / 27
    f = np.where(xyz > e, np.cbrt(np.maximum(xyz, 0)), (k * xyz + 16) / 116)
    L = 116 * f[..., 1] - 16
    a = 500 * (f[..., 0] - f[..., 1])
    b = 200 * (f[..., 1] - f[..., 2])
    return np.stack([L, a, b], -1).astype(np.float32)


def lab_to_lin(lab):
    L, a, b = lab[..., 0], lab[..., 1], lab[..., 2]
    fy = (L + 16) / 116
    fx = fy + a / 500
    fz = fy - b / 200
    e = 216 / 24389
    k = 24389 / 27
    xr = np.where(fx ** 3 > e, fx ** 3, (116 * fx - 16) / k)
    yr = np.where(L > k * e, fy ** 3, L / k)
    zr = np.where(fz ** 3 > e, fz ** 3, (116 * fz - 16) / k)
    xyz = np.stack([xr, yr, zr], -1) * _WN
    return (xyz @ _MI.T).astype(np.float32)


def srgb_to_lab(s):
    return lin_to_lab(to_lin(s))


def Lstar(s):
    return srgb_to_lab(s)[..., 0]


# ------------------------------------------------------------------------------------------------ seeded

def seed_of(name):
    return int.from_bytes(hashlib.sha256(name.encode()).digest()[:8], 'little')


def rng(name):
    return np.random.default_rng(seed_of(name))


def gblur(a, s):
    if s <= 0:
        return a
    k = int(max(3, round(s * 3)) * 2 + 1)
    return cv2.GaussianBlur(a, (k, k), s, borderType=cv2.BORDER_REPLICATE)


def smoothstep(e0, e1, x):
    t = np.clip((x - e0) / (e1 - e0), 0, 1)
    return t * t * (3 - 2 * t)


def value_noise(name, shape, cell, octaves=3, gain=0.5, aniso=(1.0, 1.0)):
    """Seeded smooth noise in [-1, 1] (bicubic-upsampled lattices, `octaves` halving the cell): deterministic."""
    h, w = shape
    out = np.zeros(shape, np.float32)
    amp = 1.0
    tot = 0.0
    r = rng(name)
    c = float(cell)
    for _ in range(octaves):
        gh = int(np.ceil(h / (c * aniso[1]))) + 3
        gw = int(np.ceil(w / (c * aniso[0]))) + 3
        g = r.uniform(-1, 1, (gh, gw)).astype(np.float32)
        up = cv2.resize(g, (int(gw * c * aniso[0]), int(gh * c * aniso[1])), interpolation=cv2.INTER_CUBIC)
        out += amp * up[:h, :w]
        tot += amp
        amp *= gain
        c /= 2
    return np.clip(out / tot, -1, 1)


# ------------------------------------------------------------------------------------------------ the parts renders

def load_srgb(path):
    im = cv2.imread(path, cv2.IMREAD_COLOR)
    if im is None:
        raise SystemExit(f'missing {path}')
    return im[..., ::-1].astype(np.float32) / 255


def save_srgb(path, s):
    os.makedirs(os.path.dirname(path) or '.', exist_ok=True)
    cv2.imwrite(path, np.clip(np.round(np.asarray(s) * 255), 0, 255).astype(np.uint8)[..., ::-1], [cv2.IMWRITE_PNG_COMPRESSION, 9])


SEGMENTS = ['sky', 'clouds', 'spray', 'westgap', 'farroofs', 'fartower', 'farlife', 'water', 'fartowpath', 'wing',
            'doorleaves', 'winglife', 'towpathshadows', 'pathfurniture', 'her', 'boatstrips', 'boats', 'duck', 'bank',
            'nearunder', 'near', 'nearover', 'pipshadows', 'pip', 'particles']
MOVERS = ['her', 'pip', 'pipshadows', 'particles']
STATIC = [s for s in SEGMENTS if s not in MOVERS and s not in ('farroofs', 'fartower')]

#: the slots in drawing order and the segments drawn before each (since the previous slot); the three far slots share
#: one position (right after the west gap and the bridge's far life) and split its pixels by label
SLOT_SEGS = [
    ('sky', ['sky', 'clouds']),
    ('spray', ['spray']),
    ('far', ['westgap', 'farlife']),
    ('water', ['water']),
    ('subject', ['fartowpath', 'wing', 'doorleaves', 'winglife', 'towpathshadows', 'pathfurniture']),
    ('boats', ['boatstrips', 'boats', 'duck']),
    ('bank', ['bank']),
    ('near', ['nearunder', 'near', 'nearover']),
]
SLOTS = ['sky', 'spray', 'farroofs', 'fartower', 'bridge', 'water', 'subject', 'boats', 'bank', 'near']
#: each slot's plane (S1_PLANE): what its float is
SLOT_PLANE = {'sky': 'sky', 'spray': -2, 'farroofs': 4, 'fartower': 3, 'bridge': 2, 'water': -0.5, 'subject': 0,
              'boats': -0.55, 'bank': -1, 'near': -2}


def seg_alpha(parts_dir, seg):
    """A segment's coverage from its black- and white-slab renders (the classic two-background matte): exact for normal
    drawing; a multiply layer drawn alone reads as partial coverage (enough to say it touches the pixel)."""
    k = load_srgb(f'{parts_dir}/seg_{seg}_k.png')
    w = load_srgb(f'{parts_dir}/seg_{seg}_w.png')
    a = np.clip(1 - (w - k).mean(-1), 0, 1)
    return a, k


def all_alphas(parts_dir):
    return {s: seg_alpha(parts_dir, s)[0] for s in SEGMENTS}


def carriers(A, eps=1.5 / 255):
    """Which slot's maps carry each pixel's light: the LAST slot whose segments (drawn since the slot before) touch the
    pixel. Everything drawn after a pixel's carrier leaves the pixel alone (movers aside: they draw over the light with
    their own), so the composite under the carrier's maps there is exactly the static base render: the bake solves the
    maps against it (light.md §4.11's solve, made exact for every plane). Returns an int map into SLOT_SEGS (-1: none:
    the slab showing between two planes) and the far group's split."""
    car = np.full((H, W), -1, np.int8)
    for i, (_, segs) in enumerate(SLOT_SEGS):
        touch = np.zeros((H, W), bool)
        for s in segs:
            touch |= A[s] > eps
        car[touch] = i
    return car


def far_split(parts_dir, A):
    """The west gap's three planes (paint_s1's S1WestGap draws them in one go): the far roofs (+4) and the calm tower (+3)
    from their own renders, the bridge (+2) and its far life = what the west gap shows that the roofs and the tower
    alone do not (their composite over black differs: the bridge covers them there). Returns three float masks."""
    k_wg = load_srgb(f'{parts_dir}/seg_westgap_k.png')
    k_r = load_srgb(f'{parts_dir}/seg_farroofs_k.png')
    k_t = load_srgb(f'{parts_dir}/seg_fartower_k.png')
    a_r, a_t, a_wg = A['farroofs'], A['fartower'], A['westgap']
    k_rt = k_t + (1 - a_t)[..., None] * k_r
    a_rt = a_t + (1 - a_t) * a_r
    diff = np.abs(k_wg - k_rt).max(-1)
    bridge = np.clip(np.maximum(a_wg - a_rt, np.where(diff > 3 / 255, a_wg, 0)), 0, 1)
    bridge = np.maximum(bridge, A['farlife'])
    tower = a_t * (1 - bridge)
    roofs = a_r * (1 - a_t) * (1 - bridge)
    return roofs, tower, bridge


def visible(A, order_segs, seg):
    """A segment's VISIBLE share in the static picture: its alpha times what every later static segment leaves."""
    v = A[seg].copy()
    later = order_segs[order_segs.index(seg) + 1:]
    for s in later:
        v *= 1 - A[s]
    return v
