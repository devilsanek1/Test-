#!/usr/bin/env python3
"""make_assets.py: the light bench's inputs (light.md §7), from the proof's own maps at one frame, written OUTSIDE the
repo as a generated TS module (data URIs), so nothing big is committed:
    python3 make_assets.py <renders_dir> <out_dir: e.g. /tmp/organic/light/proto_gen> [--t 1.6]
Writes <out_dir>/assets.ts: SHADE (1/4-res multiply map), LIGHT (full-res screen map: pool, rims, wrap, lift), GLOW
(1/4-res screen map: blooms, shafts), DOORBLUR (the door's light blurred, door box only), HER (her silhouette as an SVG
path at t, from the rowHidden difference) and HER_BOX; the same maps cropped to their boxes (SHADE_C, LIGHT_C, GLOW_C,
LG_C = light + glow merged); and, from the lightoff render, SHADE_ALL (the new shade x v6's static shadows: one
multiply map) and LG_SOLVED (the screen map solved for the browser's blend, light.md §4.11), with solved_target.npy
(the proof's linear result, 8-bit) for the end-to-end check. The maps other than LG_SOLVED are encoded the naive way
(the bench measures cost)."""
import base64
import os
import sys

import cv2
import numpy as np

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
import light_demo as LD  # noqa: E402


def png_uri(img8):
    ok, buf = cv2.imencode('.png', img8, [cv2.IMWRITE_PNG_COMPRESSION, 9])
    assert ok
    return 'data:image/png;base64,' + base64.b64encode(buf.tobytes()).decode()


def main():
    R, OUT = sys.argv[1], sys.argv[2]
    t = float(sys.argv[sys.argv.index('--t') + 1]) if '--t' in sys.argv else 1.6
    f = int(round(t * 60))
    out8, M, maps, T = LD.light_frame(R, f, dose=1.6)
    to8 = lambda a: np.clip(np.round(LD.to_srgb(np.clip(a, 0, 1)) * 255), 0, 255).astype(np.uint8)[..., ::-1]
    q = lambda a: cv2.resize(a, (LD.W // 4, LD.H // 4), interpolation=cv2.INTER_AREA)
    shade = to8(q(maps['S']))
    light = to8(np.clip(maps['A'], 0, 1))
    glow = to8(q(np.clip(maps['G'], 0, 1)))
    x0, y0, x1, y1 = LD.DOOR
    db = LD.gblur(maps['src'], 7)[y0 - 40:y1 + 20, x0 - 40:x1 + 40]
    doorblur = to8(np.clip(db[..., None] * LD.lin_hex(LD.DOOR_LIGHT), 0, 1))
    her = M['her'].astype(np.uint8)
    cs, _ = cv2.findContours(her, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
    c = max(cs, key=cv2.contourArea)[:, 0, :].astype(float)
    c = cv2.approxPolyDP(c.astype(np.float32), 0.6, True)[:, 0, :]
    d = 'M' + 'L'.join(f'{x:.1f} {y:.1f}' for x, y in c) + 'Z'
    ys, xs = np.nonzero(her)
    # the same maps cropped to the box where each one does anything (light.md §7: crop every map to its box)
    def box_of(m, thr):
        ys_, xs_ = np.nonzero(m > thr)
        return int(xs_.min()), int(ys_.min()), int(xs_.max() + 1), int(ys_.max() + 1)
    sk = 1 - maps['S'].min(-1)
    a_ = maps['A'].max(-1)
    g_ = maps['G'].max(-1)
    crops = {}
    for name, m, thr, src_img, scale in (('SHADE_C', sk, 0.004, maps['S'], 4), ('LIGHT_C', a_, 0.003, np.clip(maps['A'], 0, 1), 1),
                                          ('GLOW_C', g_, 0.002, np.clip(maps['G'], 0, 1), 4)):
        x0_, y0_, x1_, y1_ = box_of(m, thr)
        im = src_img[y0_:y1_, x0_:x1_]
        if scale > 1:
            im = cv2.resize(im, (max(1, (x1_ - x0_) // scale), max(1, (y1_ - y0_) // scale)), interpolation=cv2.INTER_AREA)
        crops[name] = (to8(im), [x0_, y0_, x1_ - x0_, y1_ - y0_])
    # one merged screen map (light + glow), full res over its box
    lg = np.clip(maps['A'] + maps['G'], 0, 1)
    x0_, y0_, x1_, y1_ = box_of(lg.max(-1), 0.003)
    crops['LG_C'] = (to8(lg[y0_:y1_, x0_:x1_]), [x0_, y0_, x1_ - x0_, y1_ - y0_])
    # the proposal's ONE multiply map: the new shade x the static shadows v6's live lib/light layers draw today (their
    # multiply factor = base / lightOff, from the lightoff render), so the live layers can be switched off (light.md §7)
    lo_path = f'{R}/lightoff/f{f:05d}.png'
    if os.path.exists(lo_path):
        lo = LD.to_lin(LD.load(lo_path))
        ratio = np.clip(LD.to_lin(M['base']) / np.maximum(lo, 1e-4), 0, 1)
        ratio[M['her'] | M['others']] = 1                                   # her own shadows stay live
        sall = maps['S'] * ratio
        x0_, y0_, x1_, y1_ = box_of(1 - sall.min(-1), 0.004)
        crops['SHADE_ALL'] = (to8(sall[y0_:y1_, x0_:x1_]), [x0_, y0_, x1_ - x0_, y1_ - y0_])
        # the light map SOLVED for the browser's blend (light.md §4.11): what lies under it in the browser is the
        # lightOff render x the multiply map as shipped (sRGB values, 8-bit); the screen map that turns that into the
        # proof's linear result is m = 1 - (1 - target) / (1 - under), per pixel (already in encoded values: no curve)
        m1 = np.round(LD.to_srgb(np.clip(sall, 0, 1)) * 255) / 255
        under = LD.load(lo_path) * m1
        lit = LD.to_lin(M['base']) * maps['E'] + maps['G']
        knee = 0.9
        over = np.clip(lit - knee, 0, None)
        target = np.clip(LD.to_srgb(np.where(lit > knee, knee + over / (1 + over / (1.0 - knee + 0.08)), lit)), 0, 1)
        m2 = np.clip(1 - (1 - target) / np.maximum(1 - under, 1e-4), 0, 1)
        m2[LD.BAND[0] - 10:LD.BAND[1] + 11] = 0                       # never in the caption band
        x0_, y0_, x1_, y1_ = box_of(m2.max(-1), 1.5 / 255)
        enc = np.round(m2[y0_:y1_, x0_:x1_] * 255).astype(np.uint8)[..., ::-1]
        crops['LG_SOLVED'] = (enc, [x0_, y0_, x1_ - x0_, y1_ - y0_])
        os.makedirs(OUT, exist_ok=True)
        np.save(os.path.join(OUT, 'solved_target.npy'), np.round(target * 255).astype(np.uint8))   # for the check
    os.makedirs(OUT, exist_ok=True)
    with open(os.path.join(OUT, 'assets.ts'), 'w') as fh:
        fh.write('// generated by docs/look/organic/light_proto/make_assets.py (never committed)\n')
        fh.write(f'export const SHADE = {png_uri(shade)!r};\n'.replace("'", '"'))
        fh.write(f'export const LIGHT = {png_uri(light)!r};\n'.replace("'", '"'))
        fh.write(f'export const GLOW = {png_uri(glow)!r};\n'.replace("'", '"'))
        fh.write(f'export const DOORBLUR = {png_uri(doorblur)!r};\n'.replace("'", '"'))
        fh.write(f'export const DOORBLUR_BOX = [{x0 - 40}, {y0 - 40}, {x1 - x0 + 80}, {y1 - y0 + 60}];\n')
        fh.write(f'export const HER = "{d}";\n')
        fh.write(f'export const HER_BOX = [{xs.min()}, {ys.min()}, {xs.max() - xs.min() + 1}, {ys.max() - ys.min() + 1}];\n')
        fh.write(f'export const HER_POINTS = {len(c)};\n')
        for name, (im, bx) in crops.items():
            fh.write(f'export const {name} = "{png_uri(im)}";\n')
            fh.write(f'export const {name}_BOX = {bx};\n')
    print('assets', os.path.getsize(os.path.join(OUT, 'assets.ts')), 'bytes; her path points', len(c))


if __name__ == '__main__':
    main()
