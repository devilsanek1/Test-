"""Pixel mock (NOT a render) of the S1 depth spec on the G4 look frame, to size the numbers: the far city mixed toward
the gold band (sRGB, like dc/core mix()), optionally after a backlit shade multiply; optionally the wing's west fin in a
darker material. Then re-measure the far-city planes and the wing west edge.
python3 -I mock_s1.py <frames_dir> <out_dir> <tools_dir>"""
import sys, json
import numpy as np, cv2
sys.path.insert(0, sys.argv[3])
import depth_measure as dm

FR, OUT = sys.argv[1], sys.argv[2]
bgr = cv2.imread(f'{FR}/look_5.4.png')
rgb = bgr[:, :, ::-1].astype(np.float32) / 255
H, W = rgb.shape[:2]
lab = cv2.cvtColor(rgb, cv2.COLOR_RGB2LAB)
hx = lambda h: np.array([int(h[i:i + 2], 16) / 255 for i in (1, 3, 5)], np.float32)
BAND = hx('#F6D9BC')
SUN = dm.hexlab('#EE6A2E')
sunm = np.linalg.norm(lab - SUN, axis=2) < 30
yy, xx = np.mgrid[0:H, 0:W]
far = (xx >= 38) & (xx < 330) & (yy >= 735) & (yy < 930) & ~sunm
back = far & (yy < 805)
front = far & (yy >= 805)


def variant(tb, tf, shade=None, fin=None):
    o = rgb.copy()
    for m, t in ((back, tb), (front, tf)):
        c = o[m]
        if shade is not None:
            c = c * (1 - shade[1] + shade[1] * hx(shade[0]))  # multiply by mix(white, tint, k)
        o[m] = c * (1 - t) + BAND * t
    if fin is not None:
        fm = (xx >= 330) & (xx < 364) & (yy >= 640) & (yy < 1082) & (np.linalg.norm(lab - dm.hexlab('#EAE1D4'), axis=2) < 6)
        o[fm] = hx(fin)
    return o


def measure(o, tag):
    o8 = (np.clip(o, 0, 1) * 255 + 0.5).astype(np.uint8)
    b = cv2.resize(o8[:, :, ::-1], (540, 960), interpolation=cv2.INTER_AREA)
    cv2.imwrite(f'{OUT}/mock_{tag}.png', b)
    l = cv2.cvtColor(b[:, :, ::-1].astype(np.float32) / 255, cv2.COLOR_RGB2LAB)
    air = l[dm.boxmask(l.shape, [(0.0, 0.315, 0.10, 0.378), (0.265, 0.315, 0.30, 0.385)])].mean(0)
    out = {}
    for pn, box in (('wing', (0.31, 0.315, 1.0, 0.49)), ('far front', (0.035, 0.43, 0.30, 0.484)), ('far back', (0.035, 0.392, 0.30, 0.425))):
        m = dm.boxmask(l.shape, [box]) & ~(np.linalg.norm(l - SUN, axis=2) < 25)
        out[pn] = dm.stats(l, m, air)
    near = dm.polymask(l.shape, [(0.3046, 0.30), (1.0, 0.30), (1.0, 0.565), (0.3046, 0.565)])
    out['edge'] = dm.separation(l, near, dm.boxmask(l.shape, [(0.25, 0.318, 0.36, 0.484)]))
    out['edge_lowpart'] = dm.separation(l, near, dm.boxmask(l.shape, [(0.25, 0.395, 0.36, 0.484)]))
    return out


SHADE_COOL = ('#C8C3D3', 0.6)   # stoneShade, a backlit dusty-cool face
SHADE_WARM = ('#8C5E6B', 0.28)  # TINT_CANAL cast strength
V = {
    'as_is': variant(0, 0),
    'ladder_40_65': variant(0.65, 0.40),
    'ladder_40_65_cool': variant(0.65, 0.40, SHADE_COOL),
    'ladder_40_65_warm': variant(0.65, 0.40, SHADE_WARM),
    'ladder_22_40_cool': variant(0.40, 0.22, SHADE_COOL),
    'ladder_40_65_cool_finbrick': variant(0.65, 0.40, SHADE_COOL, fin='#E3A88C'),
    'ladder_40_65_finbrick': variant(0.65, 0.40, None, fin='#E3A88C'),
    'ladder_40_65_cool_findeep': variant(0.65, 0.40, SHADE_COOL, fin='#C9806A'),
}
res = {k: measure(v, k) for k, v in V.items()}
json.dump(res, open(f'{OUT}/mock.json', 'w'), indent=1, default=float)
print(f"{'variant':30s} | {'far back L/C/Lrng/LC/edge/dEair':38s} | {'far front L/C/Lrng/LC/edge/dEair':38s} | wing L/C/LC | edge |dL| med, same-value share (all / below roofs)")
for k, r in res.items():
    fb, ff, wg = r['far back'], r['far front'], r['wing']
    f = lambda s: f"{s['L']:5.1f} {s['C']:5.1f} {s['Lrange']:5.1f} {s['LC']:5.2f} {s['edge']:5.2f} {s['dEair']:5.1f}"
    print(f"{k:30s} | {f(fb):38s} | {f(ff):38s} | {wg['L']:5.1f} {wg['C']:5.1f} {wg['LC']:5.2f} | {r['edge']['dL_med']:5.1f} {r['edge']['same_value']:4.2f} / {r['edge_lowpart']['dL_med']:5.1f} {r['edge_lowpart']['same_value']:4.2f}")
