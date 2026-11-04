"""v8_s1 bake: the ONE camera and the sun (src/look/v8_s1/scene.json, shared with the engine). A pinhole on the
canal-side street at a seated person's eye height, looking along the canal (+Z) to the low sun; its principal point
shifted right of the frame's centre so the canal's vanishing point sits a little right of her. Metres: X right, Y up,
Z forward. Screen px at 1080 x 1920, y down."""
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

_az = math.radians(SCENE['sun']['az_deg'])
_el = math.radians(SCENE['sun']['el_deg'])
#: the unit vector TOWARD the sun (world)
SUN_DIR = np.array([math.sin(_az) * math.cos(_el), math.sin(_el), math.cos(_az) * math.cos(_el)])
#: the sun's disc in the picture (a point at infinity: the direction projected)
SUN_IMG = (CX + F * SUN_DIR[0] / SUN_DIR[2], CY - F * SUN_DIR[1] / SUN_DIR[2])


def proj(P):
    """World point(s) (..., 3) -> screen (..., 2)."""
    P = np.asarray(P, np.float64)
    X, Y, Z = P[..., 0], P[..., 1], P[..., 2]
    return np.stack([CX + F * X / Z, CY - F * (Y - HC) / Z], -1)


def ray(x, y):
    """The view ray (not normalised, Z = 1) through screen px."""
    return np.stack([(np.asarray(x, np.float64) - CX) / F, -(np.asarray(y, np.float64) - CY) / F, np.ones_like(np.asarray(x, np.float64))], -1)


def ground_xy(X, Z, Y=0.0):
    return proj(np.stack([np.asarray(X, np.float64), np.full_like(np.asarray(X, np.float64), Y), np.asarray(Z, np.float64)], -1))


def ground_at(x, y, Y=0.0):
    """Screen px -> the point on the horizontal plane at height Y (X, Z); only below the horizon for Y < HC."""
    r = ray(x, y)
    t = (Y - HC) / r[..., 1]
    return r[..., 0] * t, r[..., 2] * t


def size_px(metres, Z):
    return F * metres / Z


def her_screen():
    """Her feet (screen) and her drawn height (px) from scene.json."""
    h = SCENE['her']
    feet = proj([h['X'], 0.0, h['Z']])
    return (float(feet[0]), float(feet[1])), F * h['height_m'] / h['Z']


if __name__ == '__main__':
    print('sun img', SUN_IMG, 'sun dir', SUN_DIR)
    print('her', her_screen())
