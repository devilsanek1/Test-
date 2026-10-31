"""test01_s1 bake: the ONE camera (src/look/test01_s1/scene.json, shared with the engine). A pinhole in a small boat low
on the canal, eye about a metre over the water, looking straight along the canal (+Z) at the bridge; verticals upright
(a shifted principal point instead of a tilt). Metres: X right, Y up (the water at Y 0), Z forward. Screen px at
1080 x 1920, y down. The PAPER TWIN is the street mirrored in the water: a point (X, Y, Z) has its twin at (X, -Y, Z)."""
import json
import math
import os

import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..'))
SCENE = json.load(open(os.path.join(ROOT, 'scene.json')))
W, H = SCENE['frame']
F = float(SCENE['camera']['f'])
CX = float(SCENE['camera']['cx'])
CY = float(SCENE['camera']['cy'])
HC = float(SCENE['camera']['h'])
BAND = tuple(SCENE['band'])
BR = SCENE['bridge']
CN = SCENE['canal']

_az = math.radians(SCENE['afterglow']['az_deg'])
_el = math.radians(SCENE['afterglow']['el_deg'])
#: the unit vector toward the afterglow (the set sun's side, down the canal, just under the far roofs)
GLOW_DIR = np.array([math.sin(_az) * math.cos(_el), math.sin(_el), math.cos(_az) * math.cos(_el)])
GLOW_IMG = (CX + F * GLOW_DIR[0] / GLOW_DIR[2], CY - F * GLOW_DIR[1] / GLOW_DIR[2])


def proj(P):
    """World point(s) (..., 3) -> screen (..., 2)."""
    P = np.asarray(P, np.float64)
    X, Y, Z = P[..., 0], P[..., 1], P[..., 2]
    return np.stack([CX + F * X / Z, CY - F * (Y - HC) / Z], -1)


def ray(x, y):
    """The view ray (Z = 1) through screen px."""
    x = np.asarray(x, np.float64)
    y = np.asarray(y, np.float64)
    return np.stack([(x - CX) / F, -(y - CY) / F, np.ones_like(x)], -1)


def water_at(x, y):
    """Screen px below the horizon -> the point on the water (Y 0): (X, Z)."""
    r = ray(x, y)
    t = (0.0 - HC) / np.minimum(r[..., 1], -1e-6)
    return r[..., 0] * t, r[..., 2] * t


def size_px(metres, Z):
    return F * metres / Z


def deck_y(x):
    """The bridge's deck (road) height over the water at X = x: a hump from the quays (CN quay_y) to the crown."""
    x = np.asarray(x, np.float64)
    t = np.clip(np.abs(x) / BR['deck_half'], 0, 1)
    return CN['quay_y'] + (BR['crown'] - CN['quay_y']) * np.cos(t * math.pi / 2) ** 1.6


def intrados_y(x):
    """The arch's underside at X = x (a segmental-elliptic arch springing at BR spring), None outside the span."""
    a = BR['span'] / 2
    x = np.asarray(x, np.float64)
    u = np.clip(1 - (x / a) ** 2, 0, 1)
    return BR['spring'] + BR['rise'] * np.sqrt(u)


def her_screen():
    h = SCENE['her']
    feet = proj([h['X'], BR['crown'], h['Z']])
    return (float(feet[0]), float(feet[1])), F * h['height_m'] / h['Z']


if __name__ == '__main__':
    print('glow img', GLOW_IMG)
    print('her', her_screen())
    zf = BR['zf']
    print('waterline at bridge y', proj([0, 0, zf])[1], 'arch crown y', proj([0, BR['spring'] + BR['rise'], zf])[1],
          'ring bottom y', proj([0, -(BR['spring'] + BR['rise']), zf])[1], 'ring x', proj([-BR['span'] / 2, 0, zf])[0], proj([BR['span'] / 2, 0, zf])[0])
    print('deck crown y', proj([0, BR['crown'], zf])[1], 'rail top y', proj([0, BR['crown'] + BR['rail'], zf])[1])
