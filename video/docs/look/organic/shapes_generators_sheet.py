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
CLOUD_LIT = (248, 222, 200); CLOUD_BODY = (208, 182, 208); CLOUD_SHADE = (170, 150, 198)
LEAF_LIT = (140, 160, 88); LEAF_MID = (98, 124, 78); LEAF_SHADE = (66, 90, 70); TRUNK = (96, 74, 70)
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
    P, R = G.cumulus('sheet/cloud/v5', 232, 272, 370, 205)
    cov = G.fill_outline(P, (PH, PW))
    a = G.edge_alpha(cov, 'sheet/cloud/e', light=(-0.75, -0.65), found=0.4, lost=0.3, crisp_w=1.4, soft_w=(4.0, 9.0),
                     lost_w=(14.0, 24.0), teeth_px=(2.0, 4.0), teeth_dir_deg=0, slow_px=110, broken=0.15)
    lit, shade = G.shade3(cov, 'sheet/cloud/l', light=(-0.75, -0.65), scale=R / 20, big=R / 4, big_w=0.25,
                          lit_t=0.0, shade_t=-0.3, wander=0.08, wander_px=40)
    # the belly: a band over the flat base, its top wavy (the billows hang into it): the cumulus's own shade
    yy, xx = np.mgrid[0:PH, 0:PW]
    band = 272 - 205 * 0.2 + 9 * G.noise2d((PH, PW), 45, 'sheet/cloud/belly', 4, gain=0.6)   # a short octave too: never an arc
    belly = np.clip((yy - band) / 2.0 + 0.5, 0, 1) * cov
    shade = np.maximum(shade, belly)
    lit = np.minimum(lit, 1 - belly)
    put(img, a, CLOUD_BODY)
    put(img, np.minimum(lit, a), CLOUD_LIT)
    put(img, np.minimum(shade, a), CLOUD_SHADE)
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
    for i, (cx, base, L, h) in enumerate([(250, 92, 420, 40), (190, 176, 300, 22)]):
        for j, (P, R) in enumerate(G.bank(f'sheet/bank{i}', cx, base, L, h)):
            put(img, G.edge_alpha(G.fill_outline(P, (PH, PW)), f'sheet/bank{i}/{j}/e', light=(0.2, 1.0), found=0.35,
                                  lost=0.35, crisp_w=1.4, soft_w=(3.0, 6.0), lost_w=(10.0, 16.0), teeth_dir_deg=0,
                                  slow_px=90), CLOUD_SHADE)
    for i, (x0, x1, y, t) in enumerate([(20, 260, 236, 8), (210, 450, 272, 7), (60, 330, 300, 5)]):
        Q = G.streak(f'sheet/streak{i}', x0, x1, y, t, sag=G.seeded(i).uniform(-3, 3))
        put(img, G.edge_alpha(G.fill_outline(Q, (PH, PW)), f'sheet/streak{i}/e', light=(0.2, 1.0), found=0.3,
                              lost=0.4, crisp_w=1.2, soft_w=(2.5, 5.0), lost_w=(8.0, 12.0), teeth_dir_deg=0, slow_px=90),
            CLOUD_SHADE)
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
    cov, (x0, y0), P = G.crown('sheet/tree', 232, 120, 280, 200)
    full = _paste(cov, x0, y0)
    cols = np.where(full[:, 200:260].max(1) > 0.5)[0]
    yb = int(cols.max()) if len(cols) else 220          # the crown's underside over the trunk
    ty = yb - 22                                         # the fork sits inside the crown, never under it

    # the trunk and two limbs: tapered, bowed, rooted, entering the crown (never a ruler-straight post)
    for k, (p0, p1, w0, w1) in enumerate([((231, 334), (229, ty + 40), 19, 11), ((229, ty + 52), (258, ty), 10, 4),
                                           ((230, ty + 56), (205, ty + 6), 9, 4)]):
        put(img, G.fill_outline(G.limb(f'sheet/tree/limb{k}', p0, p1, w0, w1, bend=0.05), (PH, PW)), TRUNK)
    a = G.edge_alpha(full, 'sheet/tree/e', light=(-0.7, -0.7), found=0.55, lost=0.15, crisp_w=1.0, soft_w=(2.0, 4.0),
                     lost_w=(5.0, 8.0), teeth_px=(2.0, 3.0), teeth_dir_deg=-60, slow_px=60, broken=0.12)
    R = math.sqrt(full.sum() / math.pi)
    lit, shade = G.shade3(full, 'sheet/tree/l', light=(-0.7, -0.7), scale=R / 12, big=R / 3, big_w=0.4, lit_t=0.08,
                          shade_t=-0.12, wander=0.06, wander_px=30)
    put(img, a, LEAF_MID)
    put(img, np.minimum(lit, a), LEAF_LIT)
    put(img, np.minimum(shade, a), LEAF_SHADE)
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


def _paste(cov, x0, y0):
    full = np.zeros((PH, PW), np.float32)
    h, w = cov.shape
    ya, xa = max(y0, 0), max(x0, 0); yb, xb = min(y0 + h, PH), min(x0 + w, PW)
    full[ya:yb, xa:xb] = cov[ya - y0:yb - y0, xa - x0:xb - x0]
    return full


def facade_after():
    img = canvas()
    # two faces in a slight two-point view (no corner of the picture at 90 deg +- 7), each side hand-cut
    front = G.hand_cut(np.array([[54, 48], [316, 40], [318, 330], [52, 330]], float), 'sheet/facade/f')
    side = G.hand_cut(np.array([[316, 40], [402, 62], [404, 330], [318, 330]], float), 'sheet/facade/s')
    fa = G.edge_alpha(G.fill_outline(front, (PH, PW)), 'sheet/facade/fe', light=(-1.0, -0.3), found=0.7, lost=0.05,
                      crisp_w=1.3, soft_w=(2.0, 3.5), lost_w=(6.0, 10.0), teeth_px=(2.0, 3.0), teeth_dir_deg=90,
                      slow_px=160, broken=0.1)
    # the shade face meets the evening air at a close value: its far edge is LOST over a third of its length
    sa = G.edge_alpha(G.fill_outline(side, (PH, PW)), 'sheet/facade/se', light=(-1.0, -0.3), found=0.25, lost=0.35,
                      crisp_w=1.3, soft_w=(3.0, 6.0), lost_w=(10.0, 18.0), teeth_px=(2.0, 3.0), teeth_dir_deg=90,
                      slow_px=120, broken=0.15)
    put(img, sa, WALL_SHADE)
    put(img, fa, WALL_LIT)
    # windows: no template (sizes +-5-12 %, states lit / dark / sky, never the same state twice running), hand-cut
    rects = []
    for j, (y0, hgt) in enumerate([(70, 62), (160, 60), (250, 58)]):
        for i, (x0, wid) in enumerate([(78, 50), (152, 46), (230, 52)]):
            rects.append((x0, y0 - 1.5 * i, x0 + wid, y0 - 1.5 * i + hgt))
    for k, (x0, y0, x1, y1, st) in enumerate(G.vary_rects('sheet/facade/w', rects, states=('lit', 'dark', 'dark', 'sky'))):
        Q = G.hand_cut(np.array([[x0, y0], [x1, y0], [x1, y1], [x0, y1]], float), f'sheet/facade/w{k}',
                       side_turn=(0.5, 1.5), bow=(0.002, 0.006), round_px=(2.0, 3.5))
        col = {'lit': LIT_WIN, 'dark': GLASS, 'sky': (150, 160, 190)}[st]
        win = G.fill_outline(Q, (PH, PW))
        put(img, win, col)
        rr = G.seeded(f'sheet/facade/wa{k}')
        w_, h_ = x1 - x0, y1 - y0
        if st == 'lit':      # a curtain drawn to one side, its edge hanging in a soft curve
            side_ = rr.choice([-1, 1]); cw = w_ * rr.uniform(0.22, 0.38)
            xe = x0 + cw if side_ < 0 else x1 - cw
            yy_ = np.linspace(y0, y1, 40)
            edge = xe + side_ * 3 * np.sin(np.linspace(0, np.pi, 40)) * rr.uniform(0.5, 1.0)
            cur = np.vstack([np.stack([np.full(40, x0 if side_ < 0 else x1), yy_], 1), np.stack([edge, yy_], 1)[::-1]])
            put(img, np.minimum(G.fill_outline(cur, (PH, PW)), win), (214, 150, 110))
        elif st == 'dark':   # the sky's reflection across one upper corner
            a0 = rr.uniform(0.3, 0.55)
            gl = np.array([[x0, y0 + h_ * a0], [x0 + w_ * a0 * 0.8, y0], [x0 + w_ * (a0 * 0.8 + 0.18), y0],
                           [x0, y0 + h_ * (a0 + 0.22)]]) if rr.uniform() < 0.5 else \
                np.array([[x1, y0 + h_ * a0], [x1 - w_ * a0 * 0.8, y0], [x1 - w_ * (a0 * 0.8 + 0.18), y0],
                          [x1, y0 + h_ * (a0 + 0.22)]])
            put(img, np.minimum(G.fill_outline(gl, (PH, PW)), win) * 0.55, (120, 132, 160))
        else:                # a blind pulled down to a different height in each
            bh = h_ * rr.uniform(0.18, 0.45)
            put(img, np.minimum(G.fill_outline(np.array([[x0, y0], [x1, y0], [x1, y0 + bh + rr.uniform(-2, 2)],
                                                          [x0, y0 + bh]]), (PH, PW)), win), (196, 170, 150))
    for k, (y0, hgt) in enumerate([(84, 54), (172, 52), (258, 50)]):     # the side face's windows, foreshortened
        Q = G.hand_cut(np.array([[338, y0 + 4], [366, y0 + 10], [366, y0 + hgt + 6], [338, y0 + hgt]], float),
                       f'sheet/facade/sw{k}', side_turn=(0.5, 1.2))
        put(img, G.fill_outline(Q, (PH, PW)) * 0.85, GLASS)
    # overlaps break the silhouette: a branch over the top corner, a shrub over the base (never tangent to either)
    cov, (x0, y0), _ = G.crown('sheet/facade/branch', 404, 58, 92, 64, holes=1)
    put(img, _paste(cov, x0, y0), LEAF_SHADE)
    cov, (x0, y0), _ = G.crown('sheet/facade/shrub', 104, 322, 120, 52, holes=0)
    put(img, _paste(cov, x0, y0), LEAF_MID)
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
    # a tree's cast shadow lies across the ground: the crown's own lobes, flattened by the low sun, with sun gaps;
    # its near edge found, its far edge lost
    cov, (x0, y0), _ = G.crown('sheet/paving/sh', 250, 150, 300, 210, holes=2)
    flat = cv2.resize(cov, (cov.shape[1], max(1, int(cov.shape[0] * 0.38))), interpolation=cv2.INTER_AREA)
    sh = _paste(flat, x0, 228 - flat.shape[0] // 2)
    a = G.edge_alpha(sh, 'sheet/paving/she', light=(0.0, 1.0), found=0.4, lost=0.3, crisp_w=1.4, soft_w=(3.0, 6.0),
                     lost_w=(10.0, 16.0), teeth_px=(2.0, 3.0), slow_px=90, teeth_dir_deg=10, broken=0.1)
    img[:] = img * (1 - 0.2 * a[..., None])
    return img


PANELS = [('cloud', cloud_before, cloud_after), ('bank', bank_before, bank_after), ('tree', tree_before, tree_after),
          ('facade', facade_before, facade_after), ('paving', paving_before, paving_after)]


def _crown_cov(seed):
    cov, (x0, y0), _ = G.crown(seed, 232, 150, 280, 200)
    return _paste(cov, x0, y0)


SEED_CHECK = [  # every seed, not a picked one: the generator's own silhouettes, one flat value on the sky
    ('cumulus', lambda k: G.fill_outline(G.cumulus(f'check/cu{k}', 232, 272, 370, 205)[0], (PH, PW))),
    ('crown', lambda k: _crown_cov(f'check/cr{k}')),
    ('bank', lambda k: np.clip(sum(G.fill_outline(P, (PH, PW)) for P, _ in G.bank(f'check/bk{k}', 232, 165, 420, 46)), 0, 1)),
]
CHECK_KEYS = [('straight', 'edges.straight'), ('ruler', 'edges.long'), ('arc', 'edges.arc'), ('free', 'edges.free'),
              ('right', 'edges.right_angle'), ('sym', 'symmetry.median'), ('D', 'divider_D')]


def _get(d, path):
    for k in path.split('.'):
        d = d.get(k) if isinstance(d, dict) else None
    return d


def seed_check(n=6):
    out = {}
    for name, fn in SEED_CHECK:
        rows = []
        for k in range(n):
            img = canvas()
            put(img, fn(k), (120, 100, 150))
            m, _ = measure_crop(jpeg(img))
            rows.append({key: _get(m, path) for key, path in CHECK_KEYS})
        out[name] = {key: [r[key] for r in rows] for key, _ in CHECK_KEYS}
        print(name, {key: (round(float(np.nanmin(np.array(v, float))), 3), round(float(np.nanmax(np.array(v, float))), 3))
                     for key, v in out[name].items()}, flush=True)
    return out


def compose(res, out_dir, out_png):
    """The proof sheet: per row, before and after with their edge-class overlays and the measured numbers."""
    import matplotlib
    matplotlib.use('Agg')
    import matplotlib.pyplot as plt
    INK = '#1d1c1a'; INK2 = '#52514e'; SURF = '#fcfcfb'; C_OURS = '#eb6834'; C_REF = '#2a78d6'
    rows = [n for n, _, _ in PANELS]
    W_IN, DPI = 24, 100
    ROW_IN = 3.3
    H_IN = 1.6 + ROW_IN * len(rows) + 1.1
    fig = plt.figure(figsize=(W_IN, H_IN), dpi=DPI, facecolor=SURF)
    fig.text(0.012, 1 - 0.3 / H_IN, 'Shapes: the generators, before and after, measured with the references\' code',
             fontsize=24, color=INK, weight='bold', va='top')
    fig.text(0.012, 1 - 0.85 / H_IN, 'Left: our current way (a union of circles, constant-width bars, a scalloped crown, '
             'a rectangle grid, ruler joints). Right: shapes_gen.py (flat values only: the measures are about shape and '
             'edge, not paint). Overlays as on shapes_sheet.png: straight (red), compass arc (amber), free (green), '
             'corners (dots; red = a right angle). Thick = clearly seen.', fontsize=12.5, color=INK2, va='top', wrap=True)
    labels = {'cloud': 'Cumulus', 'bank': 'Banks and streaks', 'tree': 'Tree crown', 'facade': 'Facade', 'paving': 'Paving'}
    KEYS = [('clear geometric', 'clear.geometric_density', '{:.0f}'), ('straight', 'edges.straight', '{:.0%}'),
            ('ruler lines', 'edges.long', '{:.0%}'), ('compass arcs', 'edges.arc', '{:.0%}'),
            ('right angles', 'edges.right_angle', '{:.0%}'), ('parallels', 'edges.parallel', '{:.0%}'),
            ('lost (mass edges)', 'mass_edges.lost_of_clean', '{:.0%}'), ('broken', 'mass_edges.busy', '{:.0%}'),
            ('crisp (visible edges)', 'edge_width.crisp_of_clean', '{:.0%}'),
            ('outline alternates', 'along.alternating', '{:.0%}'), ('symmetry', 'symmetry.median', '{:.2f}'),
            ('divider D', 'divider_D', '{:.3f}')]
    for ri, name in enumerate(rows):
        top = 1.6 + ri * ROW_IN
        fig.text(0.012, 1 - top / H_IN, labels[name], fontsize=18, weight='bold', color=INK, va='top')
        for ci, (tag, sub) in enumerate((('before', ''), ('before', '_ov'), ('after', ''), ('after', '_ov'))):
            im = cv2.cvtColor(cv2.imread(os.path.join(out_dir, f'{name}_{tag}{sub}.png')), cv2.COLOR_BGR2RGB)
            w_in = 3.85; h_in = w_in * im.shape[0] / im.shape[1]
            left = 0.012 + (2.3 + ci * (w_in + 0.12) + (0.25 if ci >= 2 else 0)) / W_IN
            ax = fig.add_axes([left, 1 - (top + 0.15 + h_in) / H_IN, w_in / W_IN, h_in / H_IN])
            ax.imshow(im); ax.set_xticks([]); ax.set_yticks([])
            for s_ in ax.spines.values():
                s_.set_color(C_OURS if tag == 'before' else C_REF); s_.set_linewidth(2.5)
            if sub == '':
                ax.set_title('before (our way)' if tag == 'before' else 'after (shapes_gen.py)', fontsize=12,
                             color=C_OURS if tag == 'before' else C_REF, loc='left')
        # the numbers
        b = res[f'{name}_before']; a_ = res[f'{name}_after']
        lines = []
        for lab, path, fmt in KEYS:
            vb, va = _get(b, path), _get(a_, path)
            f = lambda v: '-' if v is None else fmt.format(v)
            lines.append(f'{lab:22s} {f(vb):>6s} -> {f(va):>6s}')
        fig.text(0.012 + (2.3 + 4 * 3.97 + 0.45) / W_IN, 1 - (top + 0.2) / H_IN, '\n'.join(lines), fontsize=11.5,
                 family='monospace', color=INK2, va='top', linespacing=1.35)
    fig.text(0.012, 0.85 / H_IN, 'Every panel through the same JPEG q85 codec as the references; numbers from '
             'shapes_measure.measure_crop. Seeds are fixed (the same bytes on every run); the seed check in '
             'shapes_generators.json measures six unpicked seeds of each natural generator.\nRerun (from video/): '
             'python3 docs/look/organic/shapes_generators_sheet.py --sheet', fontsize=11.5, color=INK2, va='top',
             linespacing=1.45)
    fig.savefig(out_png, dpi=DPI, facecolor=SURF)
    print('wrote', out_png)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--out', default='/tmp/organic/shapes/gen_run')
    ap.add_argument('--sheet', action='store_true', help='also compose docs/look/organic/shapes_generators.png')
    ap.add_argument('--no-seeds', action='store_true')
    ap.add_argument('--compose-only', action='store_true', help='redraw the sheet from DIR/shapes_generators.json')
    args = ap.parse_args()
    os.makedirs(args.out, exist_ok=True)
    if args.compose_only:
        compose(json.load(open(os.path.join(args.out, 'shapes_generators.json'))), args.out,
                os.path.join(HERE, 'shapes_generators.png'))
        return
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
    if not args.no_seeds:
        res['seed_check'] = _clean(seed_check())
    elif os.path.exists(os.path.join(args.out, 'shapes_generators.json')):   # keep the last seed check
        res['seed_check'] = json.load(open(os.path.join(args.out, 'shapes_generators.json'))).get('seed_check')
    json.dump(res, open(os.path.join(args.out, 'shapes_generators.json'), 'w'), indent=1)
    if args.sheet:
        compose(res, args.out, os.path.join(HERE, 'shapes_generators.png'))


if __name__ == '__main__':
    main()
