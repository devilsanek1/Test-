#!/usr/bin/env python3
"""check_depth.py: the DEPTH AND SEPARATION check (docs/look/CRAFT.md §f "Check"; the owner on v2's G4 look clip,
2026-10-27: "the foreground and the main focus still blurs with the background ... no distance effect nor perspective
... the bottom part ... little to no perspective or depth"). One still and its DEPTH SHEET (JSON: the shot's planes,
the air behind them, the subject silhouettes, the grounds and their vanishing points, things of known size; sheets live
in scripts/qa/depth_sheets/, README there), measured in CIE Lab (OpenCV float RGB, D65):

  python3 -I scripts/qa/check_depth.py frame.png --sheet scripts/qa/depth_sheets/v2_g4_look_s1.json
  python3 -I scripts/qa/check_depth.py frame.png --sheet sheet.json --json out.json --map debug.png

FAIL (exit 1) on the three signatures of the owner's note, everything else a WARN with its number (CRAFT's thresholds
come from a few films: warnings with a declared exception):
  "no air"      the farthest plane is no closer to its air than the subject's plane (distance shows no colour at all)
  "melts"       a silhouette's median fill step under |dL*| 6, or >= 50 % of it at one value along an unlined run > 100 px
  "elevation"   a ground the camera looks down on with >= 70 % of its visible lines level and < 10 % receding
PLANES (each: L*, C*, C90, hue, darks L* p5, range p5-p95, local contrast, visible edges, values, dE76 to its air; drawn
dark lines are left out: our environment draws none) WARN: the planes behind the subject not stepping >= 3 closer to the
air each, the farthest over dE 10 from it, the subject's plane < dE 12 from the plane behind it, the farthest plane's
darks > 20 under the air, its range > 15 or values > 4, its contrast > 0.5x the subject plane's (or > 4) or its visible
edges > 0.5x, its C* < 8 (grey), an environment plane over CRAFT §b's tier-C contrast 7 on its own.
SEPARATION (fill 2-8 px inside against fill 2-10 px outside along the silhouette, sampled every 4 px at 540) WARN: a
tier-A subject under median |dL*| 15, over 20 % at one value (|dL*| < 5) or an unlined one-value run over 60 px; a mass
under 12 / 25 % / 100 px. GROUND (Canny + Hough on L* at 1080, segments >= 36 px; walls' verticals left out; "visible" =
|dL*| >= 6 across the line) WARN: over 60 % level, under 20 % to the vanishing point(s), receding lines that exist but
under |dL*| 6 ("invisible perspective"), row spacing growing < 2x from far to near, a texture no finer far than near.
SIZE (things of known size, `y` = their base) WARN: a size inversion, k's spread over +-15 % on one level.
Numbers are at 540 px wide unless said (local contrast sigma 8 = CRAFT §e's 16 at 1080); px in the report are 1080-wide.
"""
from __future__ import annotations

import argparse
import json
import math
import sys

import cv2
import numpy as np

sys.dont_write_bytecode = True
cv2.setNumThreads(1)

W540 = 540
T = dict(  # = lib/depth.ts DEPTH_TARGETS (CRAFT §f)
    ladder=3.0, far_air=10.0, subject_step=12.0, far_darks=20.0, far_range=15.0, far_values=4, far_lc_k=0.5, far_lc=4.0,
    far_edges_k=0.5, far_chroma=8.0, env_lc=7.0,
    sep_a=(15.0, 0.20, 60), sep_mass=(12.0, 0.25, 100), melt_median=6.0, melt_same=0.50, melt_run=100,
    ground_level=0.60, ground_recede=0.20, elev_level=0.70, elev_recede=0.10, visible=6.0, spacing=2.0, cam_tol=0.15,
)


# ---------------------------------------------------------------- image, units, masks

class Img:
    def __init__(self, path: str, width: int):
        bgr = cv2.imread(path)
        if bgr is None:
            print(f'cannot read {path}', file=sys.stderr)
            sys.exit(2)
        self.full_w = bgr.shape[1]
        h, w = bgr.shape[:2]
        if w != width:
            bgr = cv2.resize(bgr, (width, int(round(h * width / w))), interpolation=cv2.INTER_AREA)
        self.bgr = bgr
        self.lab = cv2.cvtColor(bgr[:, :, ::-1].astype(np.float32) / 255, cv2.COLOR_RGB2LAB)
        self.H, self.W = self.lab.shape[:2]


class Units:
    """Sheet coordinates -> image px: 'frac' (fractions of the image's width and height) or 'px' (canvas px of a
    1080-wide frame: both axes scale by W / 1080)."""

    def __init__(self, units: str, W: int, H: int):
        self.units, self.W, self.H = units, W, H

    def x(self, v):
        return v * self.W if self.units == 'frac' else v * self.W / 1080

    def y(self, v):
        return v * self.H if self.units == 'frac' else v * self.W / 1080

    def box(self, b):
        return int(round(self.x(b[0]))), int(round(self.y(b[1]))), int(round(self.x(b[2]))), int(round(self.y(b[3])))

    def pt(self, p):
        return [self.x(p[0]), self.y(p[1])]


def boxmask(shape, boxes, u: Units):
    m = np.zeros(shape[:2], bool)
    for b in boxes or []:
        x0, y0, x1, y1 = u.box(b)
        m[max(0, y0):max(0, y1), max(0, x0):max(0, x1)] = True
    return m


def polymask(shape, poly, u: Units):
    m = np.zeros(shape[:2], np.uint8)
    cv2.fillPoly(m, [np.array([u.pt(p) for p in poly], np.int32)], 1)
    return m.astype(bool)


def hexlab(h: str):
    h = h.lstrip('#')
    rgb = np.array([[[int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]]], np.float32)
    return cv2.cvtColor(rgb, cv2.COLOR_RGB2LAB)[0, 0]


def linemask(lab):
    """Drawn dark lines (the references' ink; our tier-A outline): black-hat on L* (9 px ellipse at 540) > 12, L* < 55."""
    L = lab[..., 0]
    bh = cv2.morphologyEx(L, cv2.MORPH_BLACKHAT, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (9, 9)))
    return (bh > 12) & (L < 55)


def grad_de(lab):
    g = 0
    for c in range(3):
        gx = cv2.Sobel(lab[..., c], cv2.CV_32F, 1, 0, ksize=3) / 4
        gy = cv2.Sobel(lab[..., c], cv2.CV_32F, 0, 1, ksize=3) / 4
        g = g + gx * gx + gy * gy
    return np.sqrt(g)


def hue_deg(a, b):
    return math.degrees(math.atan2(b, a)) % 360


def hue_diff(h1, h2):
    return abs((h1 - h2 + 180) % 360 - 180)


# ---------------------------------------------------------------- planes

def plane_stats(im: Img, m, air, lc_map, grad):
    """A plane's numbers over all its pixels (drawn lines included, as the research measured them: a lined far plane
    is a busier far plane; our clean pen draws no line on tier C)."""
    if m.sum() < 30:
        return None
    lab = im.lab
    L, a, b = lab[..., 0][m], lab[..., 1][m], lab[..., 2][m]
    C = np.hypot(a, b)
    mean = np.array([L.mean(), a.mean(), b.mean()])
    hist, _ = np.histogram(L, bins=np.arange(0, 102, 6))
    out = dict(L=float(L.mean()), C=float(C.mean()), C90=float(np.percentile(C, 90)), h=hue_deg(a.mean(), b.mean()),
               Lp5=float(np.percentile(L, 5)), Lp95=float(np.percentile(L, 95)), LC=float(lc_map[m].mean()),
               edges=float((grad[m] > 6).mean()), values=int((hist >= 0.03 * m.sum()).sum()), n=int(m.sum()))
    out['range'] = out['Lp95'] - out['Lp5']
    out['dEair'] = float(np.linalg.norm(mean - air))
    out['air_L'] = float(air[0])
    out['air_h'] = hue_deg(air[1], air[2])
    out['mean'] = [float(v) for v in mean]
    return out


def check_planes(im: Img, sheet, u: Units, res, report):
    lab = im.lab
    sun = hexlab(sheet.get('sun', '#EE6A2E'))
    sunm = np.linalg.norm(lab - sun, axis=2) < 25
    air_boxes = sheet.get('air')
    if sheet.get('air_hex'):  # the air as the code draws it (the sky's lowest step behind the planes)
        air = hexlab(sheet['air_hex'])
    elif air_boxes:
        air = lab[boxmask(lab.shape, air_boxes, u) & ~sunm].mean(0)
    else:
        return 0
    L = lab[..., 0]
    lc_map = np.abs(L - cv2.GaussianBlur(L, (0, 0), 8 * im.W / W540))
    grad = grad_de(lab)
    rows = []
    for p in sheet.get('planes', []):
        m = boxmask(lab.shape, p.get('boxes'), u) & ~boxmask(lab.shape, p.get('exclude'), u) & ~sunm
        if p.get('poly'):
            m |= polymask(lab.shape, p['poly'], u) & ~sunm
        pa = air
        if p.get('air'):
            pm = boxmask(lab.shape, p['air'], u) & ~sunm
            if pm.sum() > 20:
                pa = lab[pm].mean(0)
        st = plane_stats(im, m, pa, lc_map, grad)
        if st is None:
            report.append(('WARN', f"plane '{p['name']}': too few pixels to measure"))
            continue
        st.update(name=p['name'], plane=float(p.get('plane', 0)), role=p.get('role', 'env'), ladder=p.get('ladder', p.get('role', 'env') != 'ground'))
        rows.append(st)
    res['air'] = [float(v) for v in air]
    res['planes'] = rows
    fails = 0
    subj = [r for r in rows if r['role'] == 'subject'] or [r for r in rows if r['plane'] == 0 and r['ladder']]
    behind = sorted([r for r in rows if r['plane'] > 0 and r['ladder']], key=lambda r: r['plane'])
    for r in rows:
        report.append(('INFO', f"  plane {r['plane']:+.1f} {r['name'][:34]:34s} L* {r['L']:5.1f} C* {r['C']:4.1f} C90 {r['C90']:4.1f} h {r['h']:3.0f}  "
                               f"darks {r['Lp5']:4.1f} range {r['range']:4.1f} values {r['values']}  contrast {r['LC']:4.1f} edges {r['edges']:.2f}  dE air {r['dEair']:4.1f}"))
    s = subj[0] if subj else None
    if not (s and behind):
        return 0
    far = behind[-1]
    if far['dEair'] >= s['dEair']:
        fails += 1
        report.append(('FAIL', f"no air: the farthest plane '{far['name']}' is dE {far['dEair']:.1f} from its air, the subject's plane '{s['name']}' {s['dEair']:.1f}: distance shows no colour (the farthest must be the closest to the air)"))
    falls = True
    prev = s
    for r in behind:
        if r['plane'] > prev['plane'] and r['dEair'] > prev['dEair'] - T['ladder'] and prev is not s:
            falls = False
            report.append(('WARN', f"ladder: plane {r['plane']:+.0f} '{r['name']}' dE {r['dEair']:.1f} from the air, not >= {T['ladder']:.0f} closer than plane {prev['plane']:+.0f} ({prev['dEair']:.1f})"))
        prev = r
    if round(far['dEair']) > T['far_air']:
        report.append(('WARN', f"the farthest plane '{far['name']}' is dE {far['dEair']:.1f} from its air (<= {T['far_air']:.0f}; references 5.9-10.4)"))
    step = float(np.linalg.norm(np.array(s['mean']) - np.array(behind[0]['mean'])))
    res['subject_step'] = step
    vista = len(behind) >= 3 and falls
    if step < T['subject_step'] and not vista:
        report.append(('WARN', f"subject's plane -> plane {behind[0]['plane']:+.0f}: dE {step:.1f} between their means (>= {T['subject_step']:.0f}; references 11-22.6): one clear step"))
    else:
        report.append(('OK', f"subject's plane -> plane {behind[0]['plane']:+.0f}: dE {step:.1f}" + (" (a vista: its ladder falls toward the air plane by plane)" if step < T['subject_step'] else '')))
    # every plane behind the subject: calmer than the subject's plane, inside the tier-C budget on its own
    for r in behind:
        k = r['LC'] / max(1e-6, s['LC'])
        if r is not far and k > 0.6:
            report.append(('WARN', f"plane {r['plane']:+.0f} '{r['name']}': contrast {r['LC']:.1f} is {k:.2f}x the subject plane's (<= 0.6x behind the subject)"))
        if r['LC'] > T['env_lc']:
            report.append(('WARN', f"plane {r['plane']:+.0f} '{r['name']}': local contrast {r['LC']:.1f} > {T['env_lc']:.0f}, CRAFT §b's tier-C budget, on its own plane"))
    # the farthest plane: simpler, calmer, its darks lifted toward the air (a far plane, +3 and beyond, in full)
    k = far['LC'] / max(1e-6, s['LC'])
    ke = far['edges'] / max(1e-6, s['edges'])
    res['far_contrast_k'], res['far_edges_k'] = k, ke
    if k > T['far_lc_k'] or (far['plane'] >= 3 and far['LC'] > T['far_lc']):
        report.append(('WARN', f"the farthest plane's contrast {far['LC']:.1f} is {k:.2f}x the subject plane's (<= {T['far_lc_k']}x{' and <= 4' if far['plane'] >= 3 else ''}; v1 0.14-0.44x)"))
    if ke > T['far_edges_k']:
        report.append(('WARN', f"the farthest plane's visible edges are {ke:.2f}x the subject plane's (<= {T['far_edges_k']}x: the busiest region must not be the one meant to recede)"))
    if far['plane'] >= 3:
        if far['air_L'] - far['Lp5'] > T['far_darks']:
            report.append(('WARN', f"the farthest plane's darks L* {far['Lp5']:.0f} sit {far['air_L'] - far['Lp5']:.0f} under its air (<= {T['far_darks']:.0f}: no dark specks far away)"))
        if round(far['range']) > T['far_range'] or far['values'] > T['far_values']:
            report.append(('WARN', f"the farthest plane holds L* range {far['range']:.0f} and {far['values']} values (<= {T['far_range']:.0f} and <= {T['far_values']}: simpler with distance)"))
        if far['C'] < T['far_chroma']:
            report.append(('WARN', f"the farthest plane is grey (C* {far['C']:.1f} < {T['far_chroma']:.0f})"))
        if not sheet.get('backlit') and hue_diff(far['h'], far['air_h']) > 30 and far['C'] >= 6:
            report.append(('WARN', f"the farthest plane's hue {far['h']:.0f} is {hue_diff(far['h'], far['air_h']):.0f} deg off its air's {far['air_h']:.0f} (<= 30, or the rig's shade family when backlit)"))
    return fails


# ---------------------------------------------------------------- separation

def grabcut(bgr, box):
    H, W = bgr.shape[:2]
    x0, y0, x1, y1 = box
    mask = np.zeros((H, W), np.uint8)
    bg, fg = np.zeros((1, 65), np.float64), np.zeros((1, 65), np.float64)
    cv2.grabCut(bgr, mask, (x0, y0, max(2, x1 - x0), max(2, y1 - y0)), bg, fg, 6, cv2.GC_INIT_WITH_RECT)
    m = (mask == cv2.GC_FGD) | (mask == cv2.GC_PR_FGD)
    n, lab_, st, _ = cv2.connectedComponentsWithStats(m.astype(np.uint8))
    if n > 1:
        m = lab_ == 1 + int(np.argmax(st[1:, cv2.CC_STAT_AREA]))
    return cv2.morphologyEx(m.astype(np.uint8), cv2.MORPH_CLOSE, np.ones((5, 5), np.uint8)) > 0


def separation(lab, near, roi, lines, step=4, rad=10):
    nm = near.astype(np.uint8)
    din = cv2.distanceTransform(nm, cv2.DIST_L2, 5)
    dout = cv2.distanceTransform(1 - nm, cv2.DIST_L2, 5)
    band_in = (din >= 2) & (din <= 8) & ~lines
    band_out = (dout >= 2) & (dout <= 10) & ~lines
    near_line = cv2.dilate(lines.astype(np.uint8), np.ones((7, 7), np.uint8)) > 0
    cnts, _ = cv2.findContours(nm, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
    H, W = nm.shape
    rows = []
    for c in cnts:
        pts = c[:, 0, :]
        for i in range(0, len(pts), step):
            x, y = pts[i]
            if not roi[y, x]:
                rows.append(None)  # a break in the run
                continue
            y0, y1, x0, x1 = max(0, y - rad), min(H, y + rad + 1), max(0, x - rad), min(W, x + rad + 1)
            yy, xx = np.mgrid[y0:y1, x0:x1]
            disc = (xx - x) ** 2 + (yy - y) ** 2 <= rad * rad
            bi, bo = band_in[y0:y1, x0:x1] & disc, band_out[y0:y1, x0:x1] & disc
            if bi.sum() < 6 or bo.sum() < 6:
                rows.append(None)
                continue
            li, lo = lab[y0:y1, x0:x1][bi].mean(0), lab[y0:y1, x0:x1][bo].mean(0)
            rows.append(dict(dL=float(li[0] - lo[0]), dE=float(np.linalg.norm(li - lo)), line=bool(near_line[y, x])))
    ok = [r for r in rows if r]
    if not ok:
        return None
    dL = np.array([abs(r['dL']) for r in ok])
    best = run = 0
    best_unlined = run_u = 0
    for r in rows:
        same = r is not None and abs(r['dL']) < 5
        run = run + 1 if same else 0
        run_u = run_u + 1 if same and not r['line'] else 0
        best, best_unlined = max(best, run), max(best_unlined, run_u)
    return dict(n=len(ok), median=float(np.median(dL)), p25=float(np.percentile(dL, 25)), same=float((dL < 5).mean()),
                run=int(best * step), run_unlined=int(best_unlined * step), line_share=float(np.mean([r['line'] for r in ok])),
                signed=float(np.median([r['dL'] for r in ok])))


def check_separation(im: Img, sheet, u: Units, res, lines, report):
    fails = 0
    out = []
    k = 1080 / im.W  # report runs in 1080-wide px
    for s in sheet.get('silhouettes', []):
        if 'grab' in s:
            near = grabcut(im.bgr, u.box(s['grab']))
        elif 'poly' in s:
            near = polymask(im.lab.shape, s['poly'], u)
        else:
            near = boxmask(im.lab.shape, [s['rect']], u)
        roi = boxmask(im.lab.shape, s.get('roi') or [[0, 0, 1, 1] if u.units == 'frac' else [0, 0, 1080, 99999]], u) & ~boxmask(im.lab.shape, s.get('exclude'), u)
        r = separation(im.lab, near, roi, lines)
        if r is None:
            report.append(('WARN', f"silhouette '{s['name']}': nothing to sample"))
            continue
        r.update(name=s['name'], tier=s.get('tier', 'A'), run=int(r['run'] * k), run_unlined=int(r['run_unlined'] * k))
        out.append(r)
        med, same, run = T['sep_a'] if r['tier'] == 'A' else T['sep_mass']
        line = f"silhouette '{r['name']}' ({'tier A' if r['tier'] == 'A' else 'a mass'}): median |dL*| {r['median']:.1f}, one value {r['same'] * 100:.0f} %, unlined one-value run {r['run_unlined']} px (lined {r['line_share'] * 100:.0f} %)"
        if r['median'] < T['melt_median'] or (r['same'] >= T['melt_same'] and r['run_unlined'] > T['melt_run']):
            fails += 1
            report.append(('FAIL', f"melts: {line}"))
        elif r['median'] < med or r['same'] > same or r['run_unlined'] > run:
            report.append(('WARN', f"{line}  [>= {med:.0f} / <= {same * 100:.0f} % / <= {run} px]"))
        else:
            report.append(('OK', line))
    res['silhouettes'] = out
    return fails


# ---------------------------------------------------------------- ground

def ground(path, roi_box, u_units, vps, min_len=36, width=1080):
    im = Img(path, width)
    u = Units(u_units, im.W, im.H)
    L = im.lab[..., 0]
    H, W = L.shape
    m = boxmask(L.shape, [roi_box], u)
    L8 = np.clip(L * 2.55, 0, 255).astype(np.uint8)
    e = cv2.Canny(cv2.GaussianBlur(L8, (3, 3), 0), 14, 30)
    e[~m] = 0
    segs = cv2.HoughLinesP(e, 1, np.pi / 360, threshold=30, minLineLength=min_len, maxLineGap=4)
    segs = [] if segs is None else np.asarray(segs).reshape(-1, 4)
    rows = []
    for x0, y0, x1, y1 in segs:
        dx, dy = x1 - x0, y1 - y0
        ln = math.hypot(dx, dy)
        ang = (math.degrees(math.atan2(dy, dx)) + 180) % 180
        nx, ny = -dy / ln, dx / ln
        ts = np.linspace(0.1, 0.9, 9)
        px, py = x0 + dx * ts, y0 + dy * ts
        a = [L[int(np.clip(py[i] + ny * 3, 0, H - 1)), int(np.clip(px[i] + nx * 3, 0, W - 1))] for i in range(9)]
        b = [L[int(np.clip(py[i] - ny * 3, 0, H - 1)), int(np.clip(px[i] - nx * 3, 0, W - 1))] for i in range(9)]
        cls = 'horizontal' if ang <= 4 or ang >= 176 else 'vertical' if 84 <= ang <= 96 else 'oblique'
        rows.append(dict(seg=[float(x0), float(y0), float(x1), float(y1)], len=ln, ang=ang, con=float(np.median(np.abs(np.array(a) - np.array(b)))), cls=cls))

    def to_vp(r, vp):
        x0, y0, x1, y1 = r['seg']
        mx, my = (x0 + x1) / 2, (y0 + y1) / 2
        d = abs((math.degrees(math.atan2(y1 - y0, x1 - x0) - math.atan2(vp[1] - my, vp[0] - mx)) + 90) % 180 - 90)
        return d < 2.5

    obl = [r for r in rows if r['cls'] == 'oblique']
    if vps:
        vps_px = [u.pt(v) for v in vps]
    elif len(obl) >= 2:  # find the one VP most oblique length runs to (vectorised over a grid of candidates)
        S = np.array([r['seg'] for r in obl])
        mx, my = (S[:, 0] + S[:, 2]) / 2, (S[:, 1] + S[:, 3]) / 2
        a1 = np.arctan2(S[:, 3] - S[:, 1], S[:, 2] - S[:, 0])
        ln = np.array([r['len'] for r in obl])
        gx, gy = np.meshgrid(np.linspace(-1.5 * W, 2.5 * W, 161), np.linspace(-0.6 * H, 0.9 * H, 91))
        cx, cy = gx.ravel()[:, None], gy.ravel()[:, None]
        d = np.abs((np.degrees(a1[None, :] - np.arctan2(cy - my[None, :], cx - mx[None, :])) + 90) % 180 - 90)
        score = ((d < 2.5) * ln[None, :]).sum(1)
        i = int(np.argmax(score))
        vps_px = [(float(cx[i, 0]), float(cy[i, 0]))] if score[i] > 0 else []
    else:
        vps_px = []
    for r in rows:
        r['conv'] = r['cls'] == 'oblique' and any(to_vp(r, v) for v in vps_px)
    flat = [r for r in rows if r['cls'] != 'vertical']  # walls' and posts' verticals are not the ground's lines
    vis = [r for r in flat if r['con'] >= T['visible']]
    tot = sum(r['len'] for r in flat) or 1
    totv = sum(r['len'] for r in vis) or 1
    share = lambda rs, t, f: sum(r['len'] for r in rs if f(r)) / t
    res = dict(n=len(rows), vps=vps_px, vis_len=sum(r['len'] for r in vis),
               level=share(flat, tot, lambda r: r['cls'] == 'horizontal'), recede=share(flat, tot, lambda r: r['conv']),
               vis_level=share(vis, totv, lambda r: r['cls'] == 'horizontal'), vis_recede=share(vis, totv, lambda r: r['conv']),
               vis_other=share(vis, totv, lambda r: r['cls'] == 'oblique' and not r['conv']),
               recede_con=float(np.median([r['con'] for r in rows if r['conv']])) if any(r['conv'] for r in rows) else 0.0)
    # row spacing: the y of the LONG level edges (nosings, kerbs, slab rows: >= 20 % of the ROI's width; a thing's edge
    # is not a row), merged within 20 px at 1080, far -> near growth
    rx0, _, rx1, _ = u.box(roi_box)
    long_ = [r for r in rows if r['cls'] == 'horizontal' and r['con'] >= 3 and abs(r['seg'][2] - r['seg'][0]) >= 0.2 * (rx1 - rx0)]
    ys = sorted(set(int(round((r['seg'][1] + r['seg'][3]) / 2)) for r in long_))
    cl = []
    for y in ys:
        if cl and y - cl[-1][-1] <= 20 * W / 1080:
            cl[-1].append(y)
        else:
            cl.append([y])
    yr = [float(np.mean(c)) for c in cl]
    gaps = np.diff(yr) if len(yr) >= 4 else []
    res['rows'] = [round(y) for y in yr]
    res['spacing_growth'] = float(np.mean(gaps[-2:]) / max(1e-6, np.mean(gaps[:2]))) if len(gaps) >= 3 else None
    # texture: Canny crossings per 100 px along rows, in the far and near thirds of the ROI (finer far = more crossings)
    x0, y0, x1, y1 = u.box(roi_box)
    third = max(1, (y1 - y0) // 3)
    dens = []
    for a0 in (y0, y1 - third):
        band = e[a0:a0 + third, x0:x1] > 0
        cross = np.abs(np.diff(band.astype(np.int8), axis=1)).sum() / 2
        dens.append(float(cross / max(1, band.shape[0]) / max(1, band.shape[1]) * 100))
    res['texture_far'], res['texture_near'] = dens
    res['segs'] = rows
    res['size'] = (W, H)
    return res, im


def check_ground(path, sheet, report, maps):
    fails = 0
    out = []
    for g in sheet.get('ground', []):
        r, im = ground(path, g['roi'], sheet.get('units', 'frac'), g.get('vps'))
        r['name'] = g['name']
        out.append(r)
        report.append(('INFO', f"  ground '{g['name']}': visible lines level {r['vis_level'] * 100:.0f} %, to the VP(s) {r['vis_recede'] * 100:.0f} %, other {r['vis_other'] * 100:.0f} %  "
                               f"(all lines: level {r['level'] * 100:.0f} %, receding {r['recede'] * 100:.0f} % at |dL*| {r['recede_con']:.1f}); rows {r['rows'][:10]}"))
        if r['vis_level'] >= T['elev_level'] and r['vis_recede'] < T['elev_recede']:
            fails += 1
            report.append(('FAIL', f"elevation: ground '{g['name']}' is {r['vis_level'] * 100:.0f} % level and {r['vis_recede'] * 100:.0f} % receding (stacked flat bands: the ground must recede)"))
        else:
            if r['vis_level'] > T['ground_level']:
                report.append(('WARN', f"ground '{g['name']}': {r['vis_level'] * 100:.0f} % of its visible lines level (<= {T['ground_level'] * 100:.0f} %)"))
            if r['vis_recede'] < T['ground_recede']:
                report.append(('WARN', f"ground '{g['name']}': {r['vis_recede'] * 100:.0f} % of its visible lines run to the VP (>= {T['ground_recede'] * 100:.0f} %)"))
        if r['recede'] >= T['ground_recede'] and r['vis_recede'] < T['elev_recede']:
            report.append(('WARN', f"invisible perspective: ground '{g['name']}' has receding lines ({r['recede'] * 100:.0f} %) but at |dL*| {r['recede_con']:.1f} (a joint reads at >= 6, or a band >= 3 px)"))
        sg = r['spacing_growth']
        if sg is not None and sg < T['spacing']:
            report.append(('WARN', f"ground '{g['name']}': row spacing grows {sg:.1f}x from far to near (>= {T['spacing']:.0f}x: foreshortening)"))
        tf, tn = r['texture_far'], r['texture_near']
        if tn >= 1.0 and tf < tn:
            report.append(('WARN', f"ground '{g['name']}': texture no finer far ({tf:.1f} crossings / 100 px) than near ({tn:.1f}): a texture gradient gets finer with distance"))
        else:
            report.append(('INFO', f"  ground '{g['name']}': texture far {tf:.1f} / near {tn:.1f} crossings per 100 px; spacing growth {'n/a' if sg is None else f'{sg:.1f}x'}"))
        if maps is not None:
            maps.append((r, im, g))
    return fails, out


# ---------------------------------------------------------------- size

def check_size(sheet, report):
    things = sheet.get('things', [])
    hz = sheet.get('horizon')
    if not things or hz is None:
        return []
    rows = [dict(t, ppm=t['px'] / t['m'], level=t.get('level', 0)) for t in things]
    for a in rows:
        for b in rows:
            if a['y'] > b['y'] + 4 and a['ppm'] < b['ppm'] * 0.97:
                report.append(('WARN', f"size inversion: {a['name']} (base y {a['y']:.0f}, {a['ppm']:.0f} px/m) is nearer than {b['name']} (base y {b['y']:.0f}, {b['ppm']:.0f} px/m) but smaller per metre"))
    for lv in sorted(set(r['level'] for r in rows)):
        ks = [(r['ppm'] / (r['y'] - hz)) * 100 for r in rows if r['level'] == lv and r['y'] > hz + 1]
        if len(ks) >= 2 and max(ks) / min(ks) > (1 + T['cam_tol']) / (1 - T['cam_tol']):
            report.append(('WARN', f"two cameras on level {lv} m: k {min(ks):.0f}-{max(ks):.0f} (px/m per 100 px under the horizon; one camera keeps it within +-{T['cam_tol'] * 100:.0f} %)"))
    return rows


# ---------------------------------------------------------------- main

def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__.split('\n')[0])
    ap.add_argument('image', help='the still (any size; a 0.4-scale render works)')
    ap.add_argument('--sheet', required=True, help='the shot\'s depth sheet (JSON; scripts/qa/depth_sheets/README.md)')
    ap.add_argument('--json', default='', help='write the numbers here')
    ap.add_argument('--map', default='', help='write a debug picture here (planes, silhouettes, ground lines)')
    ap.add_argument('--quiet', action='store_true', help='only the verdict lines')
    a = ap.parse_args()
    with open(a.sheet) as f:
        sheet = json.load(f)
    im = Img(a.image, W540)
    u = Units(sheet.get('units', 'frac'), im.W, im.H)
    lines = linemask(im.lab)
    report: list[tuple[str, str]] = []
    res: dict = {'sheet': sheet.get('name', a.sheet), 'image': a.image}
    fails = check_planes(im, sheet, u, res, report)
    fails += check_separation(im, sheet, u, res, lines, report)
    maps = [] if a.map else None
    gf, gres = check_ground(a.image, sheet, report, maps)
    fails += gf
    res['ground'] = [{k: v for k, v in g.items() if k != 'segs'} for g in gres]
    res['things'] = check_size(sheet, report)
    warns = sum(1 for k, _ in report if k == 'WARN')
    res['fails'], res['warns'] = fails, warns
    print(f"DEPTH check: {res['sheet']}")
    for kind, line in report:
        if a.quiet and kind not in ('FAIL', 'WARN'):
            continue
        print(line if kind == 'INFO' else f"{kind:4s} {line}")
    verdict = 'FAIL' if fails else 'WARN' if warns else 'PASS'
    print(f"DEPTH: {verdict}" + (f" ({fails} FAIL, {warns} WARN)" if verdict != 'PASS' else ''))
    if a.json:
        with open(a.json, 'w') as f:
            json.dump(res, f, indent=1)
    if a.map:
        vis = im.bgr.copy()
        H, W = vis.shape[:2]
        cols = [(0, 0, 255), (0, 140, 255), (0, 200, 200), (0, 200, 0), (255, 160, 0), (255, 0, 0), (200, 0, 200), (120, 0, 120)]
        for i, p in enumerate(sheet.get('planes', [])):
            for b in p.get('boxes', []):
                x0, y0, x1, y1 = u.box(b)
                cv2.rectangle(vis, (x0, y0), (x1 - 1, y1 - 1), cols[i % len(cols)], 1)
                cv2.putText(vis, f"{p.get('plane', 0):+g}", (x0 + 2, y0 + 11), cv2.FONT_HERSHEY_SIMPLEX, 0.35, cols[i % len(cols)], 1)
        for b in sheet.get('air', []):
            x0, y0, x1, y1 = u.box(b)
            cv2.rectangle(vis, (x0, y0), (x1 - 1, y1 - 1), (255, 255, 255), 2)
        for r, gim, g in maps or []:
            k = W / gim.W
            for s in r['segs']:
                x0, y0, x1, y1 = (int(v * k) for v in s['seg'])
                col = (0, 200, 0) if s['cls'] == 'horizontal' else (255, 0, 0) if s['cls'] == 'vertical' else (0, 0, 255) if s['conv'] else (0, 160, 255)
                cv2.line(vis, (x0, y0), (x1, y1), col, 2 if s['con'] >= T['visible'] else 1)
        cv2.imwrite(a.map, vis)
    return 1 if fails else 0


if __name__ == '__main__':
    sys.exit(main())
