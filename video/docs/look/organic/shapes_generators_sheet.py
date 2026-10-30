#!/usr/bin/env python3
"""shapes_generators_sheet.py: before / after panels for the shape rules (shapes.md §4), measured with the same code as
the references (shapes_measure.measure_crop). Each panel is drawn at the frame's scale (phone px), flat colours only
(the measures here are about shape and edge, not paint), round-tripped through the same JPEG codec.

  cloud     before: a union of circles (our billow design)          after: shapes_gen.cumulus + edge_alpha
  bank      before: constant-width bars with round ends (our streaks) after: shapes_gen.streak / bank
  tree      before: a scalloped crown of equal bumps (sketch.crown)  after: shapes_gen.crown (masses, holes)
  facade    before: a rectangle with a window grid                   after: hand_cut + vary_rects + lost shade edge
  paving    before: ruler joints, even spacing                       after: broken_line joints, varied spacing

Usage (from video/): python3 docs/look/organic/shapes_generators_sheet.py [--out DIR]
Writes DIR/shapes_generators.json and the sheet docs/look/organic/shapes_generators.png (when --sheet)."""
from __future__ import annotations

import argparse
import json
import math
import os
import sys

import cv2
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import shapes_gen as G  # noqa: E402
import shapes_lib as S  # noqa: E402
from shapes_measure import measure_crop, overlay, _clean  # noqa: E402

PW, PH = 460, 330          # one panel, px of the frame
SKY = (214, 205, 230)
CLOUD_LIT = (248, 222, 200); CLOUD_SHADE = (178, 160, 204)
LEAF_LIT = (126, 150, 84); LEAF_SHADE = (70, 98, 72)
WALL_LIT = (226, 178, 150); WALL_SHADE = (184, 136, 128); GLASS = (64, 78, 96); LIT_WIN = (250, 214, 140)
PAVE = (180, 128, 110); JOINT = (140, 94, 86)


def canvas(col=SKY):
    return np.full((PH, PW, 3), col, np.float32)


def put(img, cov, col):
    a = np.clip(cov, 0, 1)[..., None]
    img[:] = img * (1 - a) + np.array(col, np.float32) * a


def jpeg(img):
    u8 = np.clip(img, 0, 255).astype(np.uint8)
    ok, b = cv2.imencode('.jpg', cv2.cvtColor(u8, cv2.COLOR_RGB2BGR), [cv2.IMWRITE_JPEG_QUALITY, 85])
    return cv2.cvtColor(cv2.imdecode(b, 1), cv2.COLOR_BGR2RGB)


def circle_pts(cx, cy, r, n=180):
    a = np.linspace(0, 2 * math.pi, n, endpoint=False)
    return np.stack([cx + r * np.cos(a), cy + r * np.sin(a)], 1)


def ss_fill(shape_fn, ss=4):
    """Rasterise with anti-aliasing: shape_fn(mask_hi, ss) draws at ss x."""
    hi = np.zeros((PH * ss, PW * ss), np.uint8)
    shape_fn(hi, ss)
    return cv2.resize(hi, (PW, PH), interpolation=cv2.INTER_AREA).astype(np.float32) / 255.0


# ---------------------------------------------------------------- panels


def cloud_before():
    img = canvas()
    circles = [(232, 214, 74), (160, 236, 52), (300, 232, 56), (196, 168, 50), (270, 160, 44), (114, 252, 32),
               (352, 254, 30)]

    def draw(m, ss):
        for (x, y, r) in circles:
            cv2.circle(m, (int(x * ss), int(y * ss)), int(r * ss), 255, -1, cv2.LINE_AA)
        m[int(272 * ss):, :] = 0
    cov = ss_fill(draw)
    put(img, cov, CLOUD_SHADE)

    def lit(m, ss):
        for (x, y, r) in circles:
            cv2.circle(m, (int((x - r * 0.18) * ss), int((y - r * 0.2) * ss)), int(r * 0.86 * ss), 255, -1, cv2.LINE_AA)
    put(img, np.minimum(cov, ss_fill(lit)), CLOUD_LIT)
    return img


def cloud_after():
    img = canvas()
    P, R = G.cumulus('sheet/cloud', 232, 272, 330, 230)
    cov = G.fill_outline(P, (PH, PW))
    a = G.edge_alpha(cov, 'sheet/cloud/e', light=(-0.75, -0.65), found=0.4, lost=0.3, teeth_dir_deg=-8)
    put(img, a, CLOUD_SHADE)
    # the lit mass: the same outline, moved toward the light, cut by a wavy terminator (never a crescent)
    cov2 = G.fill_outline(P - [4, 6], (PH, PW))
    yy, xx = np.mgrid[0:PH, 0:PW]
    term = 226 + 0.45 * (xx - 232) + 14 * G.noise2d((PH, PW), 55, 'sheet/cloud/t', 3)
    litm = np.minimum(cov2, np.clip((term - yy) / 3.0 + 0.5, 0, 1))
    put(img, np.minimum(litm, a), CLOUD_LIT)
    return img


def bank_before():
    img = canvas()

    def draw(m, ss):
        for (x0, x1, y, t) in [(40, 420, 90, 16), (80, 380, 150, 12), (30, 300, 205, 10), (150, 440, 255, 9)]:
            cv2.line(m, (int(x0 * ss), int(y * ss)), (int(x1 * ss), int(y * ss)), 255, int(t * ss), cv2.LINE_AA)
    put(img, ss_fill(draw), CLOUD_SHADE)
    return img


def bank_after():
    img = canvas()
    P, R = G.bank('sheet/bank', 238, 112, 400, 46)
    put(img, G.edge_alpha(G.fill_outline(P, (PH, PW)), 'sheet/bank/e', light=(0.2, 1.0), found=0.35, lost=0.35,
                          teeth_dir_deg=0), CLOUD_SHADE)
    for i, (x0, x1, y, t) in enumerate([(70, 360, 175, 11), (20, 250, 232, 8), (190, 450, 268, 7)]):
        Q = G.streak(f'sheet/streak{i}', x0, x1, y, t, sag=G.seeded(i).uniform(-3, 3))
        put(img, G.edge_alpha(G.fill_outline(Q, (PH, PW)), f'sheet/streak{i}/e', light=(0.2, 1.0), found=0.3,
                              lost=0.4, teeth_dir_deg=0, slow_px=90), CLOUD_SHADE)
    return img


def tree_before():
    img = canvas()
    # sketch.ts crown(): equal bumps on an ellipse, round 0.62 (arcs through jittered points)
    r = G.seeded('sheet/tree/b')
    cx, cy, rx, ry = 230, 160, 120, 100
    n = 14
    pts = []
    a0 = r.uniform(0, 2 * math.pi)
    for i in range(n):
        a = a0 + (i + r.uniform(-0.22, 0.22)) / n * 2 * math.pi
        f = 1 + r.uniform(-0.06, 0.06)
        pts.append((cx + math.cos(a) * rx * f, cy + math.sin(a) * ry * f))
    out = []
    for i in range(n):
        p, q = np.array(pts[i]), np.array(pts[(i + 1) % n])
        chord = np.hypot(*(q - p)); rad = chord * 0.62
        mid = (p + q) / 2; h = math.sqrt(max(rad * rad - (chord / 2) ** 2, 0))
        nrm = np.array([q[1] - p[1], -(q[0] - p[0])]) / max(chord, 1e-9)
        if nrm @ (mid - [cx, cy]) < 0:
            nrm = -nrm
        c = mid - nrm * h
        a1 = math.atan2(p[1] - c[1], p[0] - c[0]); a2 = math.atan2(q[1] - c[1], q[0] - c[0])
        # the minor arc, the one whose middle points outward (an SVG 'A r r 0 0 1' bump)
        da = (a2 - a1 + math.pi) % (2 * math.pi) - math.pi
        am = a1 + da / 2
        if math.cos(am) * nrm[0] + math.sin(am) * nrm[1] < 0:
            da = da - math.copysign(2 * math.pi, da)
        for t in np.linspace(0, 1, 24, endpoint=False):
            aa = a1 + da * t
            out.append((c[0] + rad * math.cos(aa), c[1] + rad * math.sin(aa)))
    P = np.array(out)
    cov = G.fill_outline(P, (PH, PW))

    def trunk(m, ss):
        cv2.rectangle(m, (int(222 * ss), int(240 * ss)), (int(240 * ss), int(330 * ss)), 255, -1, cv2.LINE_AA)
    put(img, ss_fill(trunk), (96, 74, 70))
    put(img, cov, LEAF_SHADE)
    put(img, np.minimum(cov, G.fill_outline(P * 0.86 + [230 * 0.14 - 14, 160 * 0.14 - 16], (PH, PW))), LEAF_LIT)
    return img


def tree_after():
    img = canvas()

    def trunk(m, ss):
        pts = np.array([[220, 330], [238, 330], [236, 268], [252, 236], [246, 232], [230, 258], [214, 232], [208, 236],
                        [224, 268]], float)
        cv2.fillPoly(m, [np.round(pts * ss * 16).astype(np.int32)], 255, cv2.LINE_AA, shift=4)
    put(img, ss_fill(trunk), (96, 74, 70))
    cov, (x0, y0), P = G.crown('sheet/tree', 232, 178, 175, 120, masses=5)
    full = np.zeros((PH, PW), np.float32)
    h, w = cov.shape
    ya, xa = max(y0, 0), max(x0, 0); yb, xb = min(y0 + h, PH), min(x0 + w, PW)
    full[ya:yb, xa:xb] = cov[ya - y0:yb - y0, xa - x0:xb - x0]
    a = G.edge_alpha(full, 'sheet/tree/e', light=(-0.7, -0.7), found=0.55, lost=0.15, crisp_w=1.0, soft_w=(2.0, 4.0),
                     lost_w=(6.0, 10.0), teeth_px=(2.0, 4.0), teeth_dir_deg=-60, slow_px=60)
    put(img, a, LEAF_SHADE)
    # the lit side: masses lit from the upper left, an organic terminator
    yy, xx = np.mgrid[0:PH, 0:PW]
    term = (xx - 236) * 0.8 + (yy - 150) * 1.0 + 26 * G.noise2d((PH, PW), 40, 'sheet/tree/t', 3)
    put(img, np.minimum(a, np.clip((-term) / 4.0 + 0.5, 0, 1)), LEAF_LIT)
    return img


def facade_before():
    img = canvas()

    def wall(m, ss):
        cv2.rectangle(m, (int(60 * ss), int(40 * ss)), (int(400 * ss), int(330 * ss)), 255, -1, cv2.LINE_AA)
    put(img, ss_fill(wall), WALL_LIT)
    for j in range(3):
        for i in range(4):
            x0, y0 = 84 + i * 80, 64 + j * 88

            def win(m, ss, x0=x0, y0=y0):
                cv2.rectangle(m, (int(x0 * ss), int(y0 * ss)), (int((x0 + 48) * ss), int((y0 + 62) * ss)), 255, -1,
                              cv2.LINE_AA)
            put(img, ss_fill(win), GLASS if (i + j) % 3 else LIT_WIN)
    return img


def facade_after():
    img = canvas()
    P = G.hand_cut(np.array([[60, 40], [400, 40], [400, 330], [60, 330]], float), 'sheet/facade')
    wall = G.fill_outline(P, (PH, PW))
    # the shade side (right) loses its edge into the evening air: a lost stretch, not a ruler edge
    a = G.edge_alpha(wall, 'sheet/facade/e', light=(-1.0, -0.2), found=0.6, lost=0.2, crisp_w=1.4, soft_w=(3.0, 5.0),
                     lost_w=(10.0, 16.0), teeth_px=(2.0, 3.0), teeth_dir_deg=90, slow_px=160, broken=0.15)
    put(img, a, WALL_LIT)
    yy, xx = np.mgrid[0:PH, 0:PW]
    shade = np.clip((xx - 330 - 10 * G.noise2d((PH, PW), 90, 'sheet/facade/s', 2)) / 6.0, 0, 1)
    put(img, np.minimum(a, shade), WALL_SHADE)
    rects = [(84 + i * 80, 64 + j * 88, 84 + i * 80 + 48, 64 + j * 88 + 62) for j in range(3) for i in range(4)]
    for k, (x0, y0, x1, y1, st) in enumerate(G.vary_rects('sheet/facade/w', rects, states=('lit', 'dark', 'dark', 'sky'))):
        Q = G.hand_cut(np.array([[x0, y0], [x1, y0], [x1, y1], [x0, y1]], float), f'sheet/facade/w{k}',
                       side_turn=(0.5, 1.5), bow=(0.002, 0.006), round_px=(0.8, 1.6))
        col = {'lit': LIT_WIN, 'dark': GLASS, 'sky': (150, 160, 190)}[st]
        put(img, G.fill_outline(Q, (PH, PW)) * (0.92 if st == 'sky' else 1.0), col)
    # an overlap breaks the silhouette: a branch of the near tree crosses the corner (never tangent to it)
    cov, (x0, y0), _ = G.crown('sheet/facade/branch', 452, 70, 80, 56, masses=3, holes=1)
    full = np.zeros((PH, PW), np.float32)
    h, w = cov.shape
    ya, xa = max(y0, 0), max(x0, 0); yb, xb = min(y0 + h, PH), min(x0 + w, PW)
    full[ya:yb, xa:xb] = cov[ya - y0:yb - y0, xa - x0:xb - x0]
    put(img, full, LEAF_SHADE)
    return img


def paving_before():
    img = canvas(PAVE)

    def joints(m, ss):
        # long receding joints, evenly spaced, plus cross joints: ruler lines over the whole panel
        for k in range(8):
            y = 20 + k * 42
            cv2.line(m, (0, int(y * ss)), (int(PW * ss), int((y + 60) * ss)), 255, int(2 * ss), cv2.LINE_AA)
        for k in range(6):
            x = 30 + k * 80
            cv2.line(m, (int(x * ss), 0), (int((x - 40) * ss), int(PH * ss)), 255, int(1.5 * ss), cv2.LINE_AA)
    put(img, ss_fill(joints), JOINT)
    return img


def paving_after():
    img = canvas(PAVE)
    r = G.seeded('sheet/paving')
    yy, xx = np.mgrid[0:PH, 0:PW]
    # flags suggested by value patches (+-3 L*-ish), laid in rows that close up with distance: no drawn grid
    y = 10.0; k = 0
    while y < PH + 30:
        gap = (24 + 0.14 * y) * r.uniform(0.8, 1.3)
        x = -r.uniform(0, 60)
        while x < PW + 40:
            fw = gap * r.uniform(1.6, 3.2)
            Q = G.hand_cut(np.array([[x, y], [x + fw, y + fw * 0.13], [x + fw - 4, y + gap + fw * 0.13],
                                     [x - 4, y + gap]], float), f'sheet/paving/f{k}', side_turn=(0.5, 2.0))
            tone = r.uniform(-9, 9)
            put(img, G.fill_outline(Q, (PH, PW)) * 0.55, tuple(np.clip(np.array(PAVE) + tone, 0, 255)))
            x += fw + r.uniform(0, 3); k += 1
        y += gap
    # a few short joints, only near the viewer (the bottom third) and broken
    for k in range(7):
        x0 = r.uniform(20, PW - 120); y0 = r.uniform(PH * 0.62, PH - 12)
        for (pts, op) in G.broken_line(f'sheet/paving/j{k}', (x0, y0), (x0 + r.uniform(60, 130), y0 + r.uniform(8, 20)),
                                       width=1.6, gaps=0.3, bow=0.01):
            put(img, G.fill_outline(pts, (PH, PW)) * op * 0.8, JOINT)
    # a tree's cast shadow lies across the ground: leafy lobes, lost on the far side
    base = np.stack([250 + 170 * np.cos(np.linspace(0, 2 * math.pi, 200, endpoint=False)),
                     205 + 62 * np.sin(np.linspace(0, 2 * math.pi, 200, endpoint=False))], 1)
    shadow = G.displace(base, G.spectrum_for(100, 'foliage'), 'sheet/paving/sh', billow=1)
    a = G.edge_alpha(G.fill_outline(shadow, (PH, PW)), 'sheet/paving/she', light=(-1, -0.3), found=0.35, lost=0.35,
                     soft_w=(4, 8), lost_w=(14, 22), slow_px=90, teeth_dir_deg=10)
    img[:] = img * (1 - 0.2 * a[..., None])
    return img


PANELS = [('cloud', cloud_before, cloud_after), ('bank', bank_before, bank_after), ('tree', tree_before, tree_after),
          ('facade', facade_before, facade_after), ('paving', paving_before, paving_after)]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--out', default='/tmp/organic/shapes/gen_run')
    args = ap.parse_args()
    os.makedirs(args.out, exist_ok=True)
    res = {}
    for name, fb, fa in PANELS:
        for tag, fn in (('before', fb), ('after', fa)):
            img = jpeg(fn())
            m, draw = measure_crop(img)
            res[f'{name}_{tag}'] = _clean(m)
            cv2.imwrite(os.path.join(args.out, f'{name}_{tag}.png'), cv2.cvtColor(img, cv2.COLOR_RGB2BGR))
            cv2.imwrite(os.path.join(args.out, f'{name}_{tag}_ov.png'), cv2.cvtColor(overlay(img, draw), cv2.COLOR_RGB2BGR))
            e = m['edges']; c = m.get('clear', {}); me = m['mass_edges']
            print(f"{name:7s} {tag:6s} clrGeoD {c.get('geometric_density', float('nan')):6.1f} str {e['straight']:.2f} "
                  f"ruler {e['long']:.2f} arc {e['arc']:.2f} free {e['free']:.2f} axis {e['axis']:.2f} "
                  f"right {e['right_angle']:.2f} par {e['parallel']:.2f} | lost {me.get('lost_of_clean', float('nan')):.2f} "
                  f"crisp {me.get('crisp_of_clean', float('nan')):.2f} broken {me.get('busy', float('nan')):.2f} | "
                  f"sym {m['symmetry']['median']:.2f} rep {m['repetition']['median_sim']:.2f} D {m['divider_D']:.3f}",
                  flush=True)
    json.dump(res, open(os.path.join(args.out, 'shapes_generators.json'), 'w'), indent=1)


if __name__ == '__main__':
    main()
