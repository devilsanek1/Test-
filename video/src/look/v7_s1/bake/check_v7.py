#!/usr/bin/env python3
"""check_v7.py: the numbers ORGANIC.md §6's checks give, on still v6 and on v7's stills (NOTES.md "v7a", "v7"). From video/:
    python3 -B src/look/v7_s1/bake/check_v7.py <scratch dir>  > <scratch>/check.json          (the first half)
    python3 -B src/look/v7_s1/bake/check_v7.py <scratch> --parts <v7 parts> --labels <v7a parts> --stills v6,v7a,v7
        (the second half: the surface labels from the flat parts; each still measured with its own her: v7a's figure for
        v6 and v7a, the people overhaul's for v7)
<scratch> holds parts/ (v7's parts renders: the labels and her mask) and stills/ (cut, key, v7a, each with _nocap, and
v6 / v6_nocap: the light proof's look 'v6', pixel-identical to paint_still_v6.png). Measured, per still:
  darks       the share under L* 40, the median and p2-p98 (the T3 plan: 45 % under 40)
  colour      off-family colour below the band (h 90-282 at C* > 8, her out: ORGANIC §4.3 <= 3 %); where the 1 % most
              saturated warm light sits (at the door: ORGANIC step 1, 100 %); palette_v7's problems()
  focal       the brightest 5 % below the band, the sky, the clouds and the far planes (+3, +4) left out: its centroid
              to her (H; 0.07-0.15) and its share within 0.1 H of her; the lobby over the facade (L*; >= +25)
  quiet       docs/look/organic/composition_study.py frame (R1-R10: masses, pieces, calls, quiet, the dark mass)
  edges       techniques.md §1's three (crisp under 3 px, straight runs >= 60 px, dead-flat over 31 px), the whole
              still with its captions (ORGANIC §2's numbers) and with her box and the caption block left out
  the band    its ground (L* mean, p2-p98 spread; <= 1.5) and the words' contrast
Deterministic."""
import json
import os
import re
import subprocess
import sys

import cv2
import numpy as np

sys.dont_write_bytecode = True
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
VIDEO = os.path.abspath(os.path.join(HERE, '..', '..', '..', '..'))

from v7common import BAND, H, W, all_alphas, load_srgb, srgb_to_lab  # noqa: E402
from v7labels import labels  # noqa: E402

WORDS = (150, 317, 800, 556)
CAPTION_BLOCK = (95, 299, 985, 560)
SUBJECT_FRAC = (0.495, 0.435, 0.675, 0.567)


def techniques_three(img_srgb, exclude=None):
    """techniques.md §1's crisp / straight / flat31 (light_s1 measure.py's re-implementation: 1080 wide, JPEG q85, Canny
    20/50 on L*, steps >= 8 L*, width = step / gradient, Hough runs >= 60 px, flat31 = 31 px windows with L* std < 0.35),
    with `exclude` boxes (x0, y0, x1, y1) left out of every count."""
    im = (np.clip(img_srgb, 0, 1) * 255).astype(np.uint8)[..., ::-1]
    im = cv2.imdecode(cv2.imencode('.jpg', im, [cv2.IMWRITE_JPEG_QUALITY, 85])[1], 1)
    L = cv2.cvtColor(im.astype(np.float32) / 255.0, cv2.COLOR_BGR2Lab)[..., 0]
    valid = cv2.erode(np.ones(L.shape, np.uint8), np.ones((9, 9), np.uint8)).astype(bool)
    for (x0, y0, x1, y1) in (exclude or []):
        valid[max(0, y0):y1, max(0, x0):x1] = False
    Ls = cv2.GaussianBlur(L, (0, 0), 0.7)
    g = np.hypot(cv2.Sobel(Ls, cv2.CV_32F, 1, 0, ksize=3), cv2.Sobel(Ls, cv2.CV_32F, 0, 1, ksize=3)) / 8.0
    step = cv2.dilate(L, np.ones((9, 9), np.uint8)) - cv2.erode(L, np.ones((9, 9), np.uint8))
    can = cv2.Canny(np.clip(L * 2.55, 0, 255).astype(np.uint8), 20, 50, L2gradient=True) > 0
    E = can & (step >= 8.0) & valid
    width = step[E] / np.maximum(g[E], 1e-3)
    crisp = float((width < 3.0).mean()) if E.any() else 0.0
    em = ((can & (step >= 8.0)) * 255).astype(np.uint8)
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


def composition(still):
    """composition_study.py frame on a captioned still (its own captions taken out): the WARN / ok lines."""
    cmd = [sys.executable, '-B', os.path.join(VIDEO, 'docs/look/organic/composition_study.py'), 'frame', still, '--caption',
           '--subject', ','.join(str(v) for v in SUBJECT_FRAC)]
    out = subprocess.run(cmd, cwd=VIDEO, capture_output=True, text=True, check=True).stdout
    rows = []
    for line in out.splitlines():
        m = re.match(r'\s+(ok|WARN|info)\s+(R\d+)?\s*(.*?)\s{2,}(.*)$', line)
        if m:
            rows.append({'status': m.group(1), 'rule': m.group(2) or '', 'check': m.group(3).strip(), 'value': m.group(4).strip()})
    return {'warns': sum(r['status'] == 'WARN' for r in rows), 'rows': rows}


def palette_problems(scr):
    """palette_v7's problems() and its keyed roles, through esbuild + node (bake/palette_check.ts; the bundle in scr)."""
    js = os.path.join(scr, 'palette_check.js')
    subprocess.run([os.path.join(VIDEO, 'node_modules/.bin/esbuild'), os.path.join(HERE, 'palette_check.ts'), '--bundle', '--platform=node',
                    '--log-level=error', f'--outfile={js}', '--loader:.png=file'], cwd=VIDEO, check=True)
    return json.loads(subprocess.run(['node', js], cwd=VIDEO, capture_output=True, text=True, check=True).stdout)


def measure(still_cap, still_nocap, L, her_c, her_box):
    im = load_srgb(still_nocap)
    imc = load_srgb(still_cap)
    lab = srgb_to_lab(im)
    Lv = lab[..., 0]
    C = np.hypot(lab[..., 1], lab[..., 2])
    h = np.degrees(np.arctan2(lab[..., 2], lab[..., 1])) % 360
    yy, xx = np.mgrid[0:H, 0:W]
    her = np.zeros((H, W), bool)
    hx0, hy0, hx1, hy1 = her_box
    her[hy0:hy1, hx0:hx1] = True
    q = {}
    q['darks_L40_pct'] = round(float((Lv < 40).mean() * 100), 1)
    q['L_median'] = round(float(np.median(Lv)), 1)
    q['L_p2_p98'] = [round(float(np.percentile(Lv, 2)), 1), round(float(np.percentile(Lv, 98)), 1)]
    below = (L['sky'] + L['cloud'] + L['farroofs'] + L['fartower'] < 0.5) & (yy > BAND[1] + 10)
    thr = np.percentile(Lv[below], 95)
    ty, tx = np.nonzero(below & (Lv >= thr))
    q['brightest5_to_her_H'] = round(float(np.hypot(tx.mean() - her_c[0], ty.mean() - her_c[1]) / H), 3)
    q['brightest5_within_0.1H_pct'] = round(float((np.hypot(tx - her_c[0], ty - her_c[1]) < 0.1 * H).mean() * 100), 1)
    lob, wall = L['lobby'] > 0.6, L['wall'] > 0.6
    q['lobby_L'] = round(float(Lv[lob].mean()), 1)
    q['lobby_p95_L'] = round(float(np.percentile(Lv[lob], 95)), 1)
    q['facade_L'] = round(float(Lv[wall].mean()), 1)
    q['lobby_over_facade'] = round(q['lobby_L'] - q['facade_L'], 1)
    q['quay_L'] = round(float(Lv[(L['bank'] > 0.6) & (yy > 1300)].mean()), 1)
    q['water_L'] = round(float(Lv[L['water'] > 0.6].mean()), 1)
    q['her_L'] = round(float(np.median(Lv[her & (Lv < 60)])), 1) if (her & (Lv < 60)).any() else None
    col = C > 8
    off = col & (h > 90) & (h < 282) & ~her
    q['offfamily_below_band_pct'] = round(float((off & (yy > BAND[1])).sum() / max((col & (yy > BAND[1])).sum(), 1) * 100), 1)
    warm = (h < 95) | (h > 340)
    hot = warm & (Lv > 60) & ~her & (yy > BAND[1])
    t99 = np.percentile(C[hot], 99)
    hy, hx = np.nonzero(hot & (C >= t99))
    q['hottest1pct_at_door_pct'] = round(float(((hx > 520) & (hx < 760) & (hy > 830) & (hy < 1230)).mean() * 100), 1)
    x0, y0, x1, y1 = WORDS
    band = Lv[y0:y1, x0:x1]
    q['band_L'] = round(float(band.mean()), 1)
    q['band_spread_p2_p98'] = round(float(np.percentile(band, 98) - np.percentile(band, 2)), 2)
    Lc = srgb_to_lab(imc)[..., 0][y0:y1, x0:x1]
    ink = Lc < 40
    q['ink_contrast_dL'] = round(float(band[ink].mean() - Lc[ink].mean()), 1) if ink.any() else None
    q['edges_with_captions'] = techniques_three(imc)
    q['edges_without_her_and_captions'] = techniques_three(imc, [her_box, CAPTION_BLOCK])
    q['composition'] = composition(still_cap)
    return q


def her_of(parts_dir):
    """Her centroid and box (frame px) from a parts folder's 'her' segment."""
    A = all_alphas(parts_dir)
    ys, xs = np.nonzero(A['her'] > 0.5)
    return (float(xs.mean()), float(ys.mean())), (int(xs.min()) - 6, int(ys.min()) - 6, int(xs.max()) + 7, int(ys.max()) + 7)


def main():
    import argparse
    ap = argparse.ArgumentParser()
    ap.add_argument('scr')
    ap.add_argument('--parts', default='', help="the parts of look v7 (her: the overhaul's figure)")
    ap.add_argument('--labels', default='', help="the flat parts (look v7a): the surface labels and v6/v7a's her")
    ap.add_argument('--stills', default='v6,cut,key,v7a')
    a = ap.parse_args()
    scr = a.scr
    P = a.labels or os.path.join(scr, 'parts')
    S = os.path.join(scr, 'stills')
    A = all_alphas(P)
    base = load_srgb(f'{P}/base_static.png')
    L, _ = labels(P, A, base)
    her_c, her_box = her_of(P)
    hers = {}
    if a.parts:
        hers['v7'] = her_of(a.parts)
    res = {'her_centroid': [round(v) for v in her_c], 'her_box': her_box, 'stills': {}}
    if 'v7' in hers:
        res['her_v7_centroid'] = [round(v) for v in hers['v7'][0]]
        res['her_v7_box'] = hers['v7'][1]
    for name in a.stills.split(','):
        cap, nocap = os.path.join(S, f'{name}.png'), os.path.join(S, f'{name}_nocap.png')
        if os.path.exists(cap) and os.path.exists(nocap):
            hc, hb = hers.get(name, (her_c, her_box))
            res['stills'][name] = measure(cap, nocap, L, hc, hb)
    try:
        pc = palette_problems(scr)
        res['palette_v7'] = {'problems': pc['problems'], 'accent': pc['accent']}
    except Exception as e:  # noqa: BLE001  (node or esbuild missing: the rest still stands)
        res['palette_v7'] = {'error': str(e)}
    print(json.dumps(res, indent=1))


if __name__ == '__main__':
    main()
