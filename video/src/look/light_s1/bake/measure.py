#!/usr/bin/env python3
"""measure.py: the light proof's numbers (light_proof.md §4), on the engine's renders of the three stills. From video/:
    python3 -B src/look/light_s1/bake/measure.py <stills_dir> <parts_dir> <out.json>
<stills_dir> holds n1_v6 / n2_light / n3_full (captions off) and s1_v6 / s2_light / s3_full (captions on).
Measured: CIE L* (D65) region means by surface label; the darks; the brightest 5 % below the sky against her; the
caption band's calm and the ink's contrast; the paper's grain (high-pass L* std on flat fields); the colour key (the
share of colour outside the dusk family's hue arc, where the most saturated warm light sits); and the organic lane's
three numbers (techniques.md §1: crisp edges, long straight runs, dead-flat area; its method re-implemented here at
the same thresholds). Deterministic."""
import json
import os
import sys

import cv2
import numpy as np

sys.dont_write_bytecode = True
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import BAND, H, W, all_alphas, load_srgb, srgb_to_lab  # noqa: E402
from labels import labels  # noqa: E402

LOOKS = [('v6', 'n1_v6', 's1_v6'), ('light', 'n2_light', 's2_light'), ('full', 'n3_full', 's3_full')]
#: the words' block (captions off: its ground; on: the ink)
WORDS = (150, 317, 800, 556)


def techniques_three(img_srgb):
    """techniques.md §1's crisp / straight / flat31 (its --measure method: 1080 wide, JPEG q85, Canny 20/50 on L*,
    steps >= 8 L*, width = step / gradient, Hough runs >= 60 px, flat31 = 31 px windows with L* std < 0.35)."""
    im = (np.clip(img_srgb, 0, 1) * 255).astype(np.uint8)[..., ::-1]
    im = cv2.imdecode(cv2.imencode('.jpg', im, [cv2.IMWRITE_JPEG_QUALITY, 85])[1], 1)
    L = cv2.cvtColor(im.astype(np.float32) / 255.0, cv2.COLOR_BGR2Lab)[..., 0]
    valid = np.ones(L.shape, np.uint8)
    valid = cv2.erode(valid, np.ones((9, 9), np.uint8)).astype(bool)
    Ls = cv2.GaussianBlur(L, (0, 0), 0.7)
    g = np.hypot(cv2.Sobel(Ls, cv2.CV_32F, 1, 0, ksize=3), cv2.Sobel(Ls, cv2.CV_32F, 0, 1, ksize=3)) / 8.0
    step = cv2.dilate(L, np.ones((9, 9), np.uint8)) - cv2.erode(L, np.ones((9, 9), np.uint8))
    can = cv2.Canny(np.clip(L * 2.55, 0, 255).astype(np.uint8), 20, 50, L2gradient=True) > 0
    E = can & (step >= 8.0) & valid
    width = step[E] / np.maximum(g[E], 1e-3)
    crisp = float((width < 3.0).mean())
    em = (E * 255).astype(np.uint8)
    lines = cv2.HoughLinesP(em, 1, np.pi / 360, 40, minLineLength=60, maxLineGap=3)
    lm = np.zeros_like(em)
    if lines is not None:
        for x0, y0, x1, y1 in lines.reshape(-1, 4):
            cv2.line(lm, (int(x0), int(y0)), (int(x1), int(y1)), 255, 3)
    straight = float(((lm > 0) & E).sum() / max(E.sum(), 1))
    interior = valid & (cv2.dilate(can.astype(np.uint8), np.ones((9, 9), np.uint8)) == 0)
    n1 = cv2.blur(L, (31, 31))
    n2 = cv2.blur(L * L, (31, 31))
    flat31 = float((np.sqrt(np.maximum(n2 - n1 * n1, 0))[interior] < 0.35).mean())
    return dict(crisp=round(crisp * 100, 1), straight=round(straight * 100, 1), flat31=round(flat31 * 100, 1))


def main():
    S, P, out = sys.argv[1], sys.argv[2], sys.argv[3]
    A = all_alphas(P)
    base = load_srgb(f'{P}/base_static.png')
    L, vis = labels(P, A, base)
    her = A['her'] > 0.5
    ys, xs = np.nonzero(her)
    her_c = (xs.mean(), ys.mean())
    yy, xx = np.mgrid[0:H, 0:W]
    sun = (195.0, 744.0)
    regions = {
        'facade (wall)': L['wall'] > 0.6, 'glass': L['glass'] > 0.6, 'lit panes': L['litwin'] > 0.6,
        'lobby': L['lobby'] > 0.6, 'W': L['W'] > 0.6,
        'pool (towpath before the door)': (L['towpath'] > 0.6) & (xx > 560) & (xx < 700) & (yy > 1080) & (yy < 1104),
        'towpath (rest, in shade)': (L['towpath'] > 0.6) & ((xx > 800) | (xx < 500)) & (xx > 420),
        'towpath (the sunlit gap)': (L['towpath'] > 0.6) & (xx < 110),
        'water': L['water'] > 0.6,
        'water (the door column)': (L['water'] > 0.6) & (xx > 575) & (xx < 690) & (yy > 1115),
        'our bank': L['bank'] > 0.6, 'near things': L['near'] > 0.6,
        'far roofs': L['farroofs'] > 0.6, 'far tower': L['fartower'] > 0.6, 'bridge': L['bridge'] > 0.6,
        'sky by the sun (r 20-70 px)': (L['sky'] > 0.6) & (np.hypot(xx - sun[0], yy - sun[1]) > 20) & (np.hypot(xx - sun[0], yy - sun[1]) < 70),
        'her': her, 'boats': L['boats'] > 0.6,
    }
    res = {'regions': {}, 'looks': {}}
    # the flattest window per surface on the 'light' still (no grain there): where the grain's added std is read
    ref = srgb_to_lab(load_srgb(f'{S}/n2_light.png'))[..., 0]
    m1 = cv2.blur(ref, (41, 41))
    sd = np.sqrt(np.maximum(cv2.blur(ref * ref, (41, 41)) - m1 * m1, 0))
    flat_windows = {}
    for name, m in (('sky above the band', (L['sky'] > 0.99) & (yy > 120) & (yy < 260)),
                    ('band ground', (yy > 330) & (yy < 360) & (xx > 160) & (xx < 790)),
                    ('facade', L['wall'] > 0.99), ('our bank (shade)', (L['bank'] > 0.99) & (yy > 1500)),
                    ('water', L['water'] > 0.99)):
        inner = cv2.erode(m.astype(np.uint8), np.ones((41, 41), np.uint8)) > 0
        if not inner.any():
            continue
        cand = np.where(inner, sd, 1e9)
        y0, x0 = np.unravel_index(np.argmin(cand), cand.shape)
        flat_windows[name] = (slice(y0 - 20, y0 + 21), slice(x0 - 20, x0 + 21))
    res['grain_windows'] = {k: [int(v[1].start), int(v[0].start), 41, 41] for k, v in flat_windows.items()}
    for look, n_off, n_on in LOOKS:
        im = load_srgb(f'{S}/{n_off}.png')
        imc = load_srgb(f'{S}/{n_on}.png')
        lab = srgb_to_lab(im)
        Lv = lab[..., 0]
        C = np.hypot(lab[..., 1], lab[..., 2])
        h = np.degrees(np.arctan2(lab[..., 2], lab[..., 1])) % 360
        r = {}
        for k, m in regions.items():
            r[k] = round(float(Lv[m].mean()), 1)
        res['regions'][look] = r
        q = {}
        q['darks_L40_pct'] = round(float((Lv < 40).mean() * 100), 1)
        q['L_median'] = round(float(np.median(Lv)), 1)
        q['L_p2_p98'] = [round(float(np.percentile(Lv, 2)), 1), round(float(np.percentile(Lv, 98)), 1)]
        # the brightest 5 % below the sky (sky, clouds and the far planes +3 and beyond left out: light.md §9 D-L5)
        below = (L['sky'] + L['cloud'] + L['farroofs'] + L['fartower'] < 0.5) & (yy > BAND[1])
        thr = np.percentile(Lv[below], 95)
        top = below & (Lv >= thr)
        ty, tx = np.nonzero(top)
        q['brightest5_centroid'] = [round(float(tx.mean())), round(float(ty.mean()))]
        q['brightest5_to_her_H'] = round(float(np.hypot(tx.mean() - her_c[0], ty.mean() - her_c[1]) / H), 3)
        q['brightest5_within_0.1H_of_her_pct'] = round(float((np.hypot(tx - her_c[0], ty - her_c[1]) < 0.1 * H).mean() * 100), 1)
        # the caption band: its ground (captions off) and the words' contrast (captions on)
        x0, y0, x1, y1 = WORDS
        band = Lv[y0:y1, x0:x1]
        q['band_ground_L_mean'] = round(float(band.mean()), 1)
        q['band_ground_spread_p2_p98'] = round(float(np.percentile(band, 98) - np.percentile(band, 2)), 2)
        Lc = srgb_to_lab(imc)[..., 0][y0:y1, x0:x1]
        ink = Lc < 40
        q['ink_L'] = round(float(Lc[ink].mean()), 1) if ink.any() else None
        q['ink_contrast_dL'] = round(float(band[ink].mean() - Lc[ink].mean()), 1) if ink.any() else None
        # the paper's grain: the high-pass L* std (minus a 3 px blur) on the flattest 41 x 41 field of each surface
        # (chosen once on the 'light' still, the same windows for every look)
        hp = Lv - cv2.GaussianBlur(Lv, (0, 0), 3)
        q['grain_hp_std'] = {k: round(float(hp[s].std()), 2) for k, s in flat_windows.items()}
        # the colour key: colour outside the dusk family's arc (h 90-282 deg: greens, teals, blues) among coloured px
        col = C > 8
        off = col & (h > 90) & (h < 282) & ~her
        q['offfamily_colour_pct_of_coloured'] = round(float(off.sum() / max(col.sum(), 1) * 100), 1)
        q['offfamily_colour_pct_below_band'] = round(float((off & (yy > BAND[1])).sum() / max((col & (yy > BAND[1])).sum(), 1) * 100), 1)
        warm = (h < 95) | (h > 340)
        hot = warm & (Lv > 60) & ~her
        t99 = np.percentile(C[hot], 99)
        hy, hx = np.nonzero(hot & (C >= t99))
        q['hottest_1pct_warm_centroid'] = [round(float(hx.mean())), round(float(hy.mean()))]
        q['hottest_1pct_in_door_pct'] = round(float(((hx > 520) & (hx < 760) & (hy > 830) & (hy < 1230)).mean() * 100), 1)
        q['techniques_three'] = techniques_three(im)
        res['looks'][look] = q
    with open(out, 'w') as fh:
        json.dump(res, fh, indent=1)
    print(json.dumps(res, indent=1))


if __name__ == '__main__':
    main()
