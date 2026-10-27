#!/usr/bin/env python3
"""check_light.py: the LIGHT AND SHADOW gate (docs/look/CRAFT.md §d "Check"), on an A/B pair of the SAME frame: the
light layers OFF (A) and ON (B). Any composition renders its A side with the input prop {"lightOff": true}
(src/v3/film/kit/Light.tsx: every light layer of every composition switches off), so the diff finds every light pixel
(lighter than A) and every shadow / ambient pixel (darker than A, by a gentle multiply: all three channels down by
similar ratios; a pixel that changed into another colour is not a shadow).

  node scripts/render-frames.mjs Film3-S7 /tmp/s7on 1.0 --entry=src/entry-v3-film.tsx
  node scripts/render-frames.mjs Film3-S7 /tmp/s7off 1.0 --entry=src/entry-v3-film.tsx --props='{"lightOff":true}'
  python3 -I scripts/qa/check_light.py /tmp/s7off/f00060.png /tmp/s7on/f00060.png --subject 330,860,750,1240 --interior
  python3 -I scripts/qa/check_light.py off.png on.png --crop 1080,0,2160,1920 --subject 700,1430,830,1705 --exterior

Checks (FAIL = exit 1): (1) the brightest 5 % of the frame, the sky (its exact colour in A), the caption band and any
--exclude rect left out, is centred within 0.15 H of the --subject box; (2) no shadow pixel greyed (C* < 8 where A had
>= 8) or under L* 35 off an anchor-dark surface (A >= 45), beyond 0.05 % of the frame; a shadow lying on a light shape (a
pool, a spill: A has bare ground there) is greyed when under C* 8 and under 0.9x that light's own chroma; (3) the light layer adds ONE
value across the caption band (its dL* spread p5-p95 <= 1.5: no light or shadow edge crosses it); (4) every light
shape (a connected lighter region >= 0.2 % of the frame: a pool, a spill) sits >= 4 L* over the ground just round it.
Reported (CRAFT §d.10 ranges, never a quota): the shares of lit, ambient (one step down) and shadow shapes (deeper than
0.86x), and the warm-lit share. Px are canvas px at 1080 wide (scaled to the image); --map writes a debug picture
(yellow lighter, blue one step down, magenta deeper, white the brightest 5 %).
"""
from __future__ import annotations

import argparse
import json
import sys

import cv2
import numpy as np

sys.dont_write_bytecode = True


def rect(s: str, k: float):
    return [int(round(float(v) * k)) for v in s.split(',')]


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__.split('\n')[0])
    ap.add_argument('off', help='the A side: the frame with {"lightOff": true}')
    ap.add_argument('on', help='the B side: the same frame lit')
    ap.add_argument('--subject', required=True, help='x0,y0,x1,y1: the beat\'s subject (canvas px)')
    ap.add_argument('--crop', default='', help='x0,y0,x1,y1 of one frame inside a sheet (image px)')
    ap.add_argument('--band', default='95,290,945,600', help='the caption band x0,y0,x1,y1 (canvas px)')
    ap.add_argument('--exclude', default='', help='x0,y0,x1,y1[;...] left out of the brightest 5 %% and the shares (a window view)')
    ap.add_argument('--sky', default='#5B6A94', help='the sky colour (exact, in A) left out of the brightest 5 %%')
    ap.add_argument('--interior', action='store_true', help='report the night-interior shares')
    ap.add_argument('--exterior', action='store_true', help='report the night-exterior shares')
    ap.add_argument('--map', default='', help='write a debug picture here')
    ap.add_argument('--json', default='', help='write the numbers here')
    a = ap.parse_args()

    def load(p):
        im = cv2.imread(p)
        if im is None:
            print(f'cannot read {p}', file=sys.stderr)
            sys.exit(2)
        im = cv2.cvtColor(im, cv2.COLOR_BGR2RGB)
        if a.crop:
            x0, y0, x1, y1 = map(int, a.crop.split(','))
            im = im[y0:y1, x0:x1]
        return im

    off, on = load(a.off), load(a.on)
    if off.shape != on.shape:
        print('A and B differ in size', file=sys.stderr)
        return 2
    H, W = on.shape[:2]
    k = W / 1080.0
    lab = lambda im: cv2.cvtColor(im.astype(np.float32) / 255, cv2.COLOR_RGB2Lab)
    Lo, ao, bo = cv2.split(lab(off))
    Ln, an, bn = cv2.split(lab(on))
    Co, Cn = np.hypot(ao, bo), np.hypot(an, bn)
    hn = np.degrees(np.arctan2(bn, an)) % 360
    dL = Ln - Lo
    band = np.zeros((H, W), bool)
    bx = rect(a.band, k)
    band[bx[1]:bx[3], bx[0]:bx[2]] = True
    ex = np.zeros((H, W), bool)
    for r in filter(None, a.exclude.split(';')):
        x0, y0, x1, y1 = rect(r, k)
        ex[y0:y1, x0:x1] = True
    sk = np.array([int(a.sky.lstrip('#')[i:i + 2], 16) for i in (0, 2, 4)])
    sky = np.all(np.abs(off.astype(int) - sk) <= 3, axis=2)
    text = band & ((Ln < 40) | (Ln > 97))
    sx0, sy0, sx1, sy1 = rect(a.subject, k)
    res: dict = {}
    lines: list[str] = []
    fails = 0

    # (1) the brightest 5 % (sky, caption band, excluded out): centred near the subject
    m = ~sky & ~band & ~ex
    thr = float(np.percentile(Ln[m], 95))
    ys, xs = np.nonzero(m & (Ln >= thr))
    cy, cx = float(ys.mean()), float(xs.mean())
    dist = float(np.hypot(max(sx0 - cx, 0, cx - sx1), max(sy0 - cy, 0, cy - sy1)) / H)
    ok = dist <= 0.15
    fails += not ok
    res['brightest'] = {'threshold': thr, 'centroid': [cx / k, cy / k], 'dist_H': dist, 'ok': ok}
    lines.append(f'brightest 5 % (L* >= {thr:.1f}): centred ({cx / k:.0f}, {cy / k:.0f}), {dist:.3f} H from the subject  [{"OK" if ok else "FAIL"} <= 0.15]')

    # light shapes (pools, spills, panes) with whatever lies inside them filled in: a shadow ON a light shape is judged
    # against that light (A has bare ground there)
    lit = (dL > 1.5) & ~ex
    n, lab_ids, stats, _ = cv2.connectedComponentsWithStats(lit.astype(np.uint8), 8)
    full = np.zeros((H, W), np.uint8)
    cont, _ = cv2.findContours(lit.astype(np.uint8), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    cv2.drawContours(full, cont, -1, 1, thickness=cv2.FILLED)
    full = full.astype(bool)
    c_lit = np.zeros((H, W), np.float32)
    for i in range(1, n):
        reg = lab_ids == i
        c_lit[reg] = float(np.median(Cn[reg]))
    c_lit = cv2.dilate(c_lit, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (int(41 * k) | 1, int(41 * k) | 1)))

    # (2) shadow pixels: a gentle multiply (every channel down by a similar ratio), never grey, never too dark
    rat = (on.astype(np.float32) + 1) / (off.astype(np.float32) + 1)
    mult = np.all((rat >= 0.5) & (rat <= 1.02), axis=2) & ((rat.max(axis=2) - rat.min(axis=2)) <= 0.3)
    sh = (dL < -1.5) & mult
    on_light = full & ~lit
    sh = sh | (on_light & (dL < 1.5))
    grey = int((sh & ~full & (Cn < 8) & (Co >= 8)).sum() + (sh & on_light & (Cn < 8) & (Cn < 0.9 * c_lit)).sum())
    dark = int((sh & (Ln < 35) & (Lo >= 45)).sum())
    ok = grey <= 0.0005 * H * W and dark <= 0.0005 * H * W
    fails += not ok
    res['shadow_px'] = {'share': float(sh.mean()), 'greyed': grey, 'too_dark': dark, 'ok': ok}
    lines.append(f'shadow pixels {sh.mean() * 100:.1f} %: greyed {grey} px, under L* 35 off anchor-dark {dark} px  [{"OK" if ok else "FAIL"}]')

    # (3) the caption band: one light value
    bm = band & ~text
    p5, p95 = (float(v) for v in np.percentile(dL[bm], [5, 95]))
    ok = p95 - p5 <= 1.5
    fails += not ok
    res['band'] = {'dL_p5': p5, 'dL_p95': p95, 'ok': ok}
    lines.append(f'caption band: the light layer\'s dL* {p5:.1f}..{p95:.1f} (spread {p95 - p5:.1f})  [{"OK" if ok else "FAIL"} <= 1.5]')

    # (4) light shapes over their ground: each connected lighter region >= 0.2 % of the frame vs the ring round it
    ker = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (int(25 * k) | 1, int(25 * k) | 1))
    pools = []
    for i in range(1, n):
        if stats[i, cv2.CC_STAT_AREA] < 0.002 * H * W:
            continue
        reg = lab_ids == i
        ring = cv2.dilate(reg.astype(np.uint8), ker).astype(bool) & ~reg & ~lit & ~sky
        if ring.sum() < 50:
            continue
        inside, ground = float(np.median(Ln[reg])), float(np.median(Ln[ring]))
        x, y, w, h = (int(v) for v in stats[i, :4])
        pools.append({'box': [x / k, y / k, (x + w) / k, (y + h) / k], 'L': inside, 'ground': ground, 'ok': inside >= ground + 4})
    bad = [p for p in pools if not p['ok']]
    fails += bool(bad)
    res['light_shapes'] = pools
    lines.append(f'light shapes: {len(pools)} (' + ', '.join(f'L* {p["L"]:.0f} on {p["ground"]:.0f}' for p in pools) + f')  [{"OK" if not bad else "FAIL"} each >= ground + 4]')

    # shares (CRAFT §d.10, reported)
    keep = ~ex
    tot = keep.sum()
    ratio = np.where(Lo > 1, Ln / np.maximum(Lo, 1), 1)
    lit_s = float((lit & keep).sum() / tot * 100)
    kept_s = float(((np.abs(dL) <= 1.5) & keep).sum() / tot * 100)
    deep = sh & (ratio < 0.86) & keep
    amb = sh & ~deep & keep
    amb_s, deep_s = float(amb.sum() / tot * 100), float(deep.sum() / tot * 100)
    warm = (Ln >= 80) & (hn > 35) & (hn < 110) & (Cn > 6)
    res['shares'] = {'lighter': lit_s, 'kept': kept_s, 'ambient': amb_s, 'shadow_shapes': deep_s, 'warm_lit': float(warm.mean() * 100)}
    lines.append(f'shares: lighter {lit_s:.1f} %, kept {kept_s:.1f} %, one step down {amb_s:.1f} %, shadow shapes {deep_s:.1f} %, warm-lit {warm.mean() * 100:.1f} %')
    if a.interior:
        lines.append(f'  night interior: lit zone (lighter + kept) {lit_s + kept_s:.1f} % [CRAFT 20-30], ambient {amb_s:.1f} % [45-60], shadow shapes {deep_s:.1f} % [10-20]')
    if a.exterior:
        lines.append(f'  night exterior: warm-lit {warm.mean() * 100:.1f} % [CRAFT 8-15]')

    if a.map:
        vis = (on.astype(np.float32) * 0.35).astype(np.uint8)
        vis[lit] = (255, 210, 60)
        vis[amb] = (90, 120, 200)
        vis[deep] = (200, 40, 160)
        vis[m & (Ln >= thr)] = (255, 255, 255)
        cv2.imwrite(a.map, cv2.cvtColor(vis, cv2.COLOR_RGB2BGR))
    if a.json:
        with open(a.json, 'w') as f:
            json.dump(res, f, indent=1)
    print('\n'.join(lines))
    print('LIGHT: ' + ('OK' if not fails else f'{fails} FAIL'))
    return 1 if fails else 0


if __name__ == '__main__':
    sys.exit(main())
