#!/usr/bin/env python3
"""shapes_sheet.py: draw docs/look/organic/shapes_sheet.png from a shapes_measure.py run (the numbers and overlays).

Usage (from video/): python3 docs/look/organic/shapes_sheet.py [--run DIR] [--out PNG]
Needs matplotlib (a sheet-only dependency; PSF-style Matplotlib licence)."""
from __future__ import annotations

import argparse
import json
import math
import os

import cv2
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt  # noqa: E402
from matplotlib.lines import Line2D  # noqa: E402

HERE = os.path.dirname(os.path.abspath(__file__))

# colours: series (dataviz reference palette, slots 2 and 1), text ink, surface
C_OURS = '#eb6834'
C_REF = '#2a78d6'
INK = '#1d1c1a'; INK2 = '#52514e'; MUTED = '#8a8984'; SURF = '#fcfcfb'; GRID = '#e4e3df'

ELEMENTS = [
    ('sky', 'Sky', ['ours_sky', 'ours_sky_low', 'hs03_sky', 'hs02_sky', 'p01_sky', 'c02_sky']),
    ('cloud', 'Cloud', ['ours_cloud', 'hs03_cloud', 'hs02_cloud', 'hs04_cloud', 'p02_cloud']),
    ('tree', 'Tree', ['ours_tree', 'hs02_trees_l', 'c03_tree', 'c07_pine', 'c05_domes']),
    ('building', 'Building', ['ours_facade', 'ours_far_city', 'hs02_shelter', 'p02_tower', 'hs01_towers', 'c06_houses']),
    ('ground', 'Ground', ['ours_paving', 'ours_near', 'hs02_ground', 'p01_ground', 'p02_ground', 'c05_road']),
    ('people', 'People', ['ours_her', 'ours_man', 'hs03_couple', 'hs01_people', 'hs04_girl', 'c03_rider']),
]

MEASURES = [
    ('clear.geometric_density', 'Clear geometric edge\npx per 100 x 100 px', 'log'),
    ('edges.straight', 'Straight runs\nshare of edge length', 'lin'),
    ('edges.long', 'Ruler lines (runs >= 60 px)\nshare of edge length', 'lin'),
    ('edges.arc', 'Compass arcs\nshare of edge length', 'lin'),
    ('edges.right_angle', 'Right-angle corners\nshare of corners', 'lin'),
    ('edges.parallel', 'Parallel straight runs\nshare of straight length', 'lin'),
    ('mass_edges.lost_of_clean', 'Lost mass edges\nshare of mass boundary', 'lin'),
    ('mass_edges.busy', 'Broken / textured edges\nshare of mass boundary', 'lin'),
    ('symmetry.median', 'Mirror symmetry\nmedian shape IoU', 'lin'),
    ('repetition.median_sim', 'Neighbour likeness\nmedian IoU', 'lin'),
    ('edge_width.median_width', 'Edge width (gradient), 10-90 %\nmedian px, visible edges', 'logw'),
    ('edges.curv_var', 'Curvature variance\nfree curves, x size', 'cvar'),
    ('divider_D', 'Divider dimension D\n1.0 = ruler-smooth', 'dim'),
    ('sizes.big', 'Biggest shape\nshare of all shape area', 'lin'),
    ('@angles', 'Corner angles, all crops pooled\nshare of corners per 15 deg', 'hist'),
]


def get(d, path):
    for k in path.split('.'):
        if not isinstance(d, dict):
            return None
        d = d.get(k)
    return d


def thumb(path, h, ov=False, scale_from=1.0):
    im = cv2.imread(path)
    if im is None:
        return None
    im = cv2.cvtColor(im, cv2.COLOR_BGR2RGB)
    f = h / im.shape[0]
    if ov and f < 0.7:
        k = max(1, int(round(0.7 / f)))
        im = cv2.erode(im, np.ones((k, k), np.uint8))   # keep the drawn lines readable when shrunk
    return cv2.resize(im, (max(1, int(im.shape[1] * f)), h), interpolation=cv2.INTER_AREA)


FOOT = (
    'Definitions (shapes.md §1). Visible edges: a colour Canny at sigma 1 px (a step of >= ~5.5 dE), linked into '
    'sub-pixel chains. Straight run: >= 21 px within 0.06 px RMS of a line and the whole run within 0.4 px of '
    'one line. Ruler line: a straight run >= 60 px. Compass arc: >= 31 px within 0.12 px RMS of one circle, '
    'turning >= 25 deg. Corner: >= 35 deg of turn within +-3 px (its angle is the interior angle; < 20 deg = a line end '
    'or a spike).\nParallel: another straight run within 3 deg, 3-30 px away, overlapping by half. Mass edges: the same '
    'detector at sigma 3 px (the big value masses); lost = a 10-90 % width over 16 px or a step under 4 dE; broken = no '
    'clean step across the edge (dry brush, texture). Edge width: an erf fit across each edge (three parallel profiles, '
    'stopped short of the next edge).\nClear geometric edge: straight or arc AND a step >= 12 dE with a 10-90 % width '
    '<= 6 px, in px of edge per 100 x 100 px of picture. Curvature variance: of the free and arc points (corners and '
    'straight runs left out), curvature x the curve\'s size. Divider dimension: Richardson\'s, rulers 2-16 px, on the '
    'outlines of the visible shapes (1.0 = smooth or ruled; coastlines 1.1-1.3).\nVisible shapes: Felzenszwalb on CIELAB, '
    'regions under 6 dE merged. Symmetry: the best mirror IoU of each shape over all axes. Neighbour likeness: each shape '
    'against its 6 nearest of a similar size, at equal area, best over rotations. Biggest shape: the largest shape\'s '
    'share of the crop\'s shape area.\nCalibrated on synthetic shapes through the same codec (shapes.md §1.3). The '
    'references are phone screenshots; the gaps measured are far larger than that softening. Rerun: shapes_measure.py, '
    'then shapes_sheet.py.')


def _footer_lines():
    import textwrap
    lines = []
    for para in FOOT.split('\n'):
        lines += textwrap.wrap(para, 250)
    return lines


ANGLE_BINS = np.arange(0, 181, 15)


def _angle_hist(ax, D):
    """Corner angles pooled per group: every crop's histogram normalised, then averaged (no crop dominates)."""
    for grp, gs, col, ls, lw, fill in (('ours (v6)', ('OURS',), C_OURS, '-', 2.6, False),
                                       ('painted refs', ('HS', 'PT'), C_REF, '-', 2.2, True),
                                       ('posters', ('CP',), C_REF, '--', 1.6, False)):
        H = []
        for v in D.values():
            if v['group'] not in gs:
                continue
            a = np.array(v.get('corner_angles') or [], float)
            if len(a) < 5:
                continue
            h, _ = np.histogram(a, ANGLE_BINS)
            H.append(h / h.sum())
        if not H:
            continue
        H = np.mean(H, 0)
        x = np.repeat(ANGLE_BINS, 2)[1:-1]
        y = np.repeat(H, 2)
        if fill:
            ax.fill_between(x, 0, y, color=col, alpha=0.12, lw=0)
        ax.plot(x, y, color=col, ls=ls, lw=lw, label=grp)
    ax.axvspan(83, 97, color=C_OURS, alpha=0.08, lw=0)
    ax.set_xlim(0, 180); ax.set_xticks([0, 45, 90, 135, 180])
    ax.set_ylim(0, 0.2); ax.set_yticks([0, 0.1, 0.2])
    ax.tick_params(labelsize=11, colors=INK2)
    for s_ in ('top', 'right'):
        ax.spines[s_].set_visible(False)
    ax.spines['bottom'].set_color(GRID); ax.spines['left'].set_color(GRID)
    ax.grid(color=GRID, lw=0.8); ax.set_axisbelow(True)
    ax.legend(fontsize=10, frameon=False, labelcolor=INK2, loc='upper left')


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--run', default='/tmp/organic/shapes/run2')
    ap.add_argument('--out', default=os.path.join(HERE, 'shapes_sheet.png'))
    args = ap.parse_args()
    D = json.load(open(os.path.join(args.run, 'shapes_data.json')))

    W_IN, DPI = 24, 100
    MINCOL, GAP, THMAX = 178, 16, 150
    ncol = 5
    ROW_IN = 2.55
    nrows = math.ceil(len(MEASURES) / ncol)
    SM_IN = ROW_IN * nrows
    FOOT_LINES = _footer_lines()
    FOOT_IN = 0.55 + 0.285 * len(FOOT_LINES)
    strips = []
    avail = int(0.86 * W_IN * DPI)
    for el, title, ids in ELEMENTS:
        rows = {v['id']: v for v in D.values() if v['element'] == el}
        th = THMAX
        while th > 70:   # the tallest thumbnails that fit the row (columns at least MINCOL wide for their captions)
            ws = []
            for cid in ids:
                if cid in rows:
                    im = cv2.imread(os.path.join(args.run, 'crops', cid + '.png'))
                    ws.append(max(int(im.shape[1] * th / im.shape[0]), MINCOL))
            if sum(ws) + GAP * (len(ws) - 1) <= avail:
                break
            th -= 4
        ims = []
        for cid in ids:
            if cid not in rows:
                continue
            a = thumb(os.path.join(args.run, 'crops', cid + '.png'), th)
            b = thumb(os.path.join(args.run, 'overlays', cid + '.png'), th, ov=True)
            if a is None or b is None:
                continue
            if b.shape[1] != a.shape[1]:
                b = cv2.resize(b, (a.shape[1], a.shape[0]), interpolation=cv2.INTER_AREA)
            ims.append((cid, a, b))
        col_h = max(a.shape[0] for _, a, _ in ims) * 2 + 6
        strips.append((el, title, rows, th, ims, (col_h + 14) / DPI + 0.95 + 0.25))
    STRIPS_IN = sum(x[-1] for x in strips)
    TOP_IN = 2.0
    H_IN = TOP_IN + SM_IN + 0.75 + STRIPS_IN + FOOT_IN
    fig = plt.figure(figsize=(W_IN, H_IN), dpi=DPI, facecolor=SURF)
    # ---------------- title
    fig.text(0.012, 1 - 0.32 / H_IN, 'Shapes: why our design reads "square and proper", measured at phone size',
             fontsize=26, color=INK, weight='bold', va='top')
    fig.text(0.012, 1 - 0.95 / H_IN,
             'Still v6 (orange) against the references (blue: filled = the painted references, refs_human_scale + '
             'refs_paint; hollow = the city posters), matching crops, every picture at the phone\'s width (1080 px) '
             'through the same JPEG codec.\nIn the crop overlays every visible edge is classified: straight run (red), '
             'compass arc (amber), free curve (green); dots = corners (red: a right angle, 83-97 deg; violet: any other). '
             'Thick = clearly seen (a step >= 12 dE with a 10-90 % width <= 6 px); thin = soft.',
             fontsize=13, color=INK2, va='top', linespacing=1.4)
    # ---------------- small multiples: the gap per measure
    AX_H_IN = 1.32
    for mi, (path, label, scale) in enumerate(MEASURES):
        r, c = divmod(mi, ncol)
        ax_w = 0.92 / ncol - 0.035
        left = 0.075 + c * (0.92 / ncol)
        top_in = TOP_IN + r * ROW_IN + 0.62
        ax = fig.add_axes([left, 1 - (top_in + AX_H_IN) / H_IN, ax_w, AX_H_IN / H_IN])
        ax.set_facecolor(SURF)
        if scale == 'hist':
            _angle_hist(ax, D)
            ax.set_title(label, fontsize=12.5, color=INK, loc='left', linespacing=1.15)
            continue
        lo_clip = {'log': 0.3, 'logw': 1.0}.get(scale)
        for ei, (el, title, _) in enumerate(ELEMENTS):
            yv = len(ELEMENTS) - 1 - ei
            rows = [v for v in D.values() if v['element'] == el]
            refs = [(get(v, path), v['group']) for v in rows if v['group'] != 'OURS']
            ours = [get(v, path) for v in rows if v['group'] == 'OURS']
            vals = [x for x, _ in refs if x is not None and np.isfinite(x)]
            if lo_clip:
                vals = [max(x, lo_clip) for x in vals]
            if vals:
                ax.plot([min(vals), max(vals)], [yv, yv], color=C_REF, alpha=0.18, lw=9, solid_capstyle='round')
            for x, g in refs:
                if x is None or not np.isfinite(x):
                    continue
                x = max(x, lo_clip) if lo_clip else x
                ax.plot(x, yv + 0.12, 'o', ms=7, mfc=C_REF if g in ('HS', 'PT') else SURF, mec=C_REF, mew=1.6)
            for x in ours:
                if x is None or not np.isfinite(x):
                    continue
                x = max(x, lo_clip) if lo_clip else x
                ax.plot(x, yv - 0.16, 'D', ms=8, mfc=C_OURS, mec=SURF, mew=1.2)
        ax.set_yticks(range(len(ELEMENTS)))
        ax.set_yticklabels([t for _, t, _ in ELEMENTS][::-1] if c == 0 else [''] * len(ELEMENTS), fontsize=12, color=INK2)
        ax.set_ylim(-0.6, len(ELEMENTS) - 0.4)
        if scale == 'log':
            ax.set_xscale('log'); ax.set_xlim(0.3, 400)
            ax.set_xticks([1, 10, 100]); ax.set_xticklabels(['1', '10', '100'])
        elif scale == 'logw':
            ax.set_xscale('log'); ax.set_xlim(1.0, 12)
            ax.set_xticks([1, 2, 4, 8]); ax.set_xticklabels(['1', '2', '4', '8'])
            ax.minorticks_off()
        elif scale == 'cvar':
            ax.set_xlim(-0.1, 6.0); ax.set_xticks([0, 2, 4, 6])
        elif scale == 'dim':
            ax.set_xlim(1.0, 1.26); ax.set_xticks([1.0, 1.1, 1.2])
        else:
            ax.set_xlim(-0.03, 1.03); ax.set_xticks([0, 0.5, 1])
        ax.tick_params(axis='x', labelsize=11, colors=INK2)
        ax.tick_params(axis='y', length=0)
        for s_ in ('top', 'right', 'left'):
            ax.spines[s_].set_visible(False)
        ax.spines['bottom'].set_color(GRID)
        ax.grid(axis='x', color=GRID, lw=0.8)
        ax.set_axisbelow(True)
        ax.set_title(label, fontsize=12.5, color=INK, loc='left', linespacing=1.15)
    # legend
    leg_top = TOP_IN + SM_IN + 0.05
    lg = fig.add_axes([0.075, 1 - (leg_top + 0.3) / H_IN, 0.6, 0.3 / H_IN]); lg.axis('off')
    handles = [Line2D([], [], marker='D', ls='', ms=9, mfc=C_OURS, mec=SURF, label='ours (v6 still)'),
               Line2D([], [], marker='o', ls='', ms=8, mfc=C_REF, mec=C_REF, label='painted references (human-scale, paint)'),
               Line2D([], [], marker='o', ls='', ms=8, mfc=SURF, mec=C_REF, mew=1.6, label='city posters'),
               Line2D([], [], lw=9, color=C_REF, alpha=0.18, label='range of the references')]
    lg.legend(handles=handles, loc='center left', ncol=4, frameon=False, fontsize=12, labelcolor=INK2)
    # ---------------- element strips (planned before the figure: each strip as tall as its thumbnails)
    ys_in = TOP_IN + SM_IN + 0.75
    for ei, (el, title, rows, th, ims, h_in) in enumerate(strips):
        top_y = 1 - ys_in / H_IN
        ys_in += h_in
        fig.text(0.012, top_y, title, fontsize=19, weight='bold', color=INK, va='top')
        x_px = int(0.11 * W_IN * DPI)
        for cid, a, b in ims:
            colw = max(a.shape[1], MINCOL)
            col = np.vstack([a, np.full((6, a.shape[1], 3), 252, np.uint8), b])
            xi = x_px + (colw - col.shape[1]) // 2
            ax = fig.add_axes([xi / (W_IN * DPI), top_y - (col.shape[0] + 8) / (H_IN * DPI), col.shape[1] / (W_IN * DPI),
                               col.shape[0] / (H_IN * DPI)])
            ax.imshow(col); ax.set_xticks([]); ax.set_yticks([])
            v = rows[cid]
            ours = v['group'] == 'OURS'
            for s_ in ax.spines.values():
                s_.set_color(C_OURS if ours else (C_REF if v['group'] in ('HS', 'PT') else '#9cc0ea'))
                s_.set_linewidth(3 if ours else 1.5)
            e = v['edges']; cg = get(v, 'clear.geometric_density'); lost = get(v, 'mass_edges.lost_of_clean')
            ra = e['right_angle']
            txt = (f"{cid.replace('_', ' ')}\nclear geometric {cg if cg is not None else float('nan'):.0f}\n"
                   f"straight {e['straight'] * 100:.0f} %, arc {e['arc'] * 100:.0f} %\n"
                   f"right angles {'-' if ra is None else f'{ra * 100:.0f} %'}\n"
                   f"lost {(lost or 0) * 100:.0f} %, broken {(get(v, 'mass_edges.busy') or 0) * 100:.0f} %")
            fig.text((x_px + 2) / (W_IN * DPI), top_y - (col.shape[0] + 14) / (H_IN * DPI), txt, fontsize=10,
                     color=C_OURS if ours else INK2, va='top', linespacing=1.25, weight='bold' if ours else 'normal')
            x_px += colw + GAP
    # ---------------- footer: definitions
    fig.text(0.012, (FOOT_IN - 0.25) / H_IN, '\n'.join(FOOT_LINES), fontsize=11.5, color=INK2, va='top', linespacing=1.45)
    fig.savefig(args.out, dpi=DPI, facecolor=SURF)
    print('wrote', args.out)


if __name__ == '__main__':
    main()
