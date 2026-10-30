"""FastNoiseLite (MIT; pyfastnoiselite) as an ORGANIC PASS on our own painted pieces (v6, unchanged code): one seeded
domain warp (two octaves of OpenSimplex2 fbm as offsets: the silhouette and the zone edges stop being circles and arcs),
lost-and-found edges (soft where the edge turns from the light, broken up by noise so lost and found alternate), and
a few 'melts' inside the mass (a zone edge softened where the light leaves it). Deterministic: every field is seeded.
usage: venv/bin/python -B src/noise_organic.py"""
import json, numpy as np, cv2
from scipy import ndimage as ndi
from PIL import Image
import pyfastnoiselite.pyfastnoiselite as F
L = '/tmp/organic/libraries'


def fbm(h, w, freq, seed, octaves=3):
    n = F.FastNoiseLite(seed)
    n.noise_type = F.NoiseType.NoiseType_OpenSimplex2
    n.fractal_type = F.FractalType.FractalType_FBm
    n.fractal_octaves = octaves
    n.frequency = freq
    ys, xs = np.mgrid[0:h, 0:w].astype(np.float32)
    v = n.gen_from_coords(np.stack([xs.ravel(), ys.ravel()]).astype(np.float32))
    return v.reshape(h, w).astype(np.float32)          # about -1..1


def smooth(e0, e1, x):
    t = np.clip((x - e0) / (e1 - e0), 0, 1); return t * t * (3 - 2 * t)


def organic(rgba, light, P, seed):
    h, w = rgba.shape[:2]
    a = rgba[..., 3:4].astype(np.float32) / 255
    pm = np.concatenate([rgba[..., :3].astype(np.float32) / 255 * a, a], -1)        # premultiplied
    # 1. the domain warp: big wobble + a fine ragged edge
    dx = P['warp'][0] * fbm(h, w, P['freq'][0], seed) + P['warp'][1] * fbm(h, w, P['freq'][1], seed + 1, 2)
    dy = P['warp'][0] * fbm(h, w, P['freq'][0], seed + 2) + P['warp'][1] * fbm(h, w, P['freq'][1], seed + 3, 2)
    ys, xs = np.mgrid[0:h, 0:w].astype(np.float32)
    pm = cv2.remap(pm, xs + dx, ys + dy, cv2.INTER_LINEAR, borderMode=cv2.BORDER_CONSTANT, borderValue=0)
    a = pm[..., 3]
    # 2. lost and found: the outward normal of the mass, how it faces the light, broken by noise
    sm = ndi.gaussian_filter(a, 3)
    gx, gy = ndi.sobel(sm, 1), ndi.sobel(sm, 0)
    g = np.hypot(gx, gy) + 1e-6
    facing = (-gx / g) * light[0] + (-gy / g) * light[1]
    brk = smooth(-0.25, 0.35, fbm(h, w, P['brk_freq'], seed + 4, 2))
    lost = smooth(P['lost_from'], 0.55, -facing) * (0.3 + 0.7 * brk)
    near = ndi.gaussian_filter((ndi.distance_transform_edt(a > 0.5) < P['band']).astype(np.float32) * (a > 0.02), 2)
    wl = np.clip(lost * near * 1.4, 0, 1)[..., None]
    if P['mode'] == 'soft':
        soft = cv2.GaussianBlur(pm, (0, 0), P['sigma'])
        pm = pm * (1 - wl) + soft * wl
    else:   # foliage: a lost edge is BROKEN (notches and holes on the shade side), never blurred
        holes = (fbm(h, w, P['hole_freq'], seed + 5, 1) > P['hole_thr']).astype(np.float32)
        cut = 1 - wl[..., 0] * holes
        pm = pm * cut[..., None]
    # 3. melts: inside the mass, soften a few internal edges where the light leaves them
    if P.get('melt'):
        lum = (pm[..., :3].sum(-1) / np.maximum(pm[..., 3], 1e-4)) / 3
        lx, ly = ndi.sobel(ndi.gaussian_filter(lum, 1.5), 1), ndi.sobel(ndi.gaussian_filter(lum, 1.5), 0)
        lg = np.hypot(lx, ly) + 1e-6
        away = smooth(-0.1, 0.6, -((lx / lg) * light[0] + (ly / lg) * light[1]))   # lum falls toward the light? no: away
        edge = smooth(0.02, 0.10, lg)
        mm = np.clip(edge * away * smooth(-0.1, 0.4, fbm(h, w, P['melt_freq'], seed + 6, 2)), 0, 1) * (pm[..., 3] > 0.9)
        mm = ndi.gaussian_filter(mm, 2)[..., None] * P['melt']
        pm = pm * (1 - mm) + cv2.GaussianBlur(pm, (0, 0), P['melt_sigma']) * mm
    a = np.clip(pm[..., 3], 0, 1)
    rgb = np.where(a[..., None] > 1e-4, pm[..., :3] / np.maximum(a[..., None], 1e-4), 0)
    return np.dstack([np.clip(rgb * 255 + 0.5, 0, 255), np.clip(a * 255 + 0.5, 0, 255)]).astype(np.uint8)


P = {
    'cloud': dict(warp=(6.0, 1.6), freq=(1 / 85, 1 / 13), brk_freq=1 / 45, lost_from=-0.15, band=22, mode='soft', sigma=7.0,
                  melt=0.85, melt_freq=1 / 60, melt_sigma=5.0),
    'tree': dict(warp=(3.0, 1.2), freq=(1 / 60, 1 / 8), brk_freq=1 / 30, lost_from=-0.2, band=8, mode='break',
                 hole_freq=1 / 5, hole_thr=0.05, melt=0.0),
}
LIGHT = {'cloud': (-0.95, 0.31), 'tree': (-0.75, -0.66)}
if __name__ == '__main__':
    import time
    for name in ['cloud', 'tree']:
        src = np.asarray(Image.open(f'{L}/inputs/{name}_v6.png').convert('RGBA'))
        t0 = time.time()
        out = organic(src, LIGHT[name], P[name], 21 if name == 'cloud' else 22)
        Image.fromarray(out, 'RGBA').save(f'{L}/out/noise/{name}.png')
        # the same pass on the design flat (what the warp alone does to our shapes)
        des = np.asarray(Image.open(f'{L}/inputs/{name}_design.png').convert('RGBA'))
        Image.fromarray(organic(des, LIGHT[name], P[name], 21 if name == 'cloud' else 22), 'RGBA').save(f'{L}/out/noise/{name}_design.png')
        print(name, f'{time.time() - t0:.2f} s (two pieces)')
