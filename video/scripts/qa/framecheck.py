#!/usr/bin/env python3
"""framecheck.py: automated per-frame sanity checks; writes the list of frames a human (or agent) should look at.

  python3 scripts/qa/framecheck.py <frames_dir_or_video> [--fps 30] [--out report_dir] [--scenes src/data/scenes.json]
         [--t0 0] [--caption-band 280,600] [--no-ui-zones]

Checks (severity in brackets):
  blank      [ERROR] blank or near-uniform frame (luma std < 4 or one colour >= 98 % of the frame). A run of <= 3 such
             frames at a scene cut is a deliberate bridge (push-through / match frame) and only a WARNING.
  flash      [ERROR] 1- or 2-frame flash or glitch: the frame(s) differ from both neighbours (>= 2 % of pixels) while
             the neighbours agree with each other (difference <= 35 % of that), and it is not at a scene cut.
  caption    [ERROR/WARN] caption-band legibility. Caption glyphs are found by colour (ink #2B1B0F or white) and shape
             (stroke width, size); their local background (a ring 0.3 em around the glyphs, highlight boxes excluded)
             is measured: share of background pixels below 3:1 WCAG contrast against the glyph colour (ERROR > 5 %,
             WARN > 2 %, the same rule as scripts/capcheck.py) and BUSYNESS = edge density of that background
             (WARN > 6 %: detail behind the words).
  ui-zone    [WARN] something important in the platform UI zones (top 180 px, bottom 400 px, right rail x > 950 for
             y 900-1500): a NEW element (camera-compensated change blob >= 1,500 canvas px^2, mostly inside the zone)
             or strong edges in the right rail.
Exit code 1 when there is any ERROR.
"""
from __future__ import annotations

import argparse
import json
import math
import os
import sys
import time

import cv2
import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import qalib as Q  # noqa: E402

INK = np.array([0x2B, 0x1B, 0x0F], np.float64)       # caption ink (RGB)
PEACH = [np.array([0xF0, 0xB3, 0x94], np.float64), np.array([0xF6, 0xB8, 0x92], np.float64)]
EM = 98.0                                           # caption font size, canvas px
ZONES = {'top': (0, 0, 1080, 180), 'bottom': (0, 1520, 1080, 1920), 'rail': (950, 900, 1080, 1500)}


# ---------------------------------------------------------------- helpers

def small(img, w=270):
    h = int(round(img.shape[0] * w / img.shape[1]))
    return cv2.resize(img, (w, h), interpolation=cv2.INTER_AREA)


def diff_frac(a, b, thr=40):
    return float((cv2.absdiff(a, b).max(axis=2) > thr).mean())


def is_blank(img):
    g = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    std = float(g.std())
    q = (img >> 3).astype(np.int32)
    key = (q[..., 0] << 10) | (q[..., 1] << 5) | q[..., 2]
    top = float(np.bincount(key.ravel()).max()) / key.size
    return (std < 4.0 or top >= 0.98), std, top


def text_components(mask, a, kind):
    """Keep caption-glyph-like components of a colour mask (analysis res)."""
    em = EM * a
    n, lab, st, _ = cv2.connectedComponentsWithStats(mask.astype(np.uint8), connectivity=8)
    if n <= 1:
        return np.zeros_like(mask)
    dist = cv2.distanceTransform(mask.astype(np.uint8), cv2.DIST_L2, 3)
    maxd = np.zeros(n, np.float32)
    np.maximum.at(maxd, lab.ravel(), dist.ravel())
    keep = np.zeros(n, bool)
    for j in range(1, n):
        x, y, w, h, ar = st[j]
        if ar < max(4, 0.004 * em * em):
            continue
        if h > 1.35 * em or w > 3.2 * em or (w > 1.6 * em and h < 0.12 * em):
            continue
        sw = 2 * float(maxd[j])
        if not (0.025 * em <= sw <= 0.17 * em):
            continue
        fill = ar / float(w * h)
        if fill > 0.75 and min(w, h) > 0.2 * em:
            continue
        keep[j] = True
    # words and lines: a glyph has at least 2 other glyphs on its line within 1.6 em (drops stray ink fragments)
    idx = np.nonzero(keep)[0]
    if len(idx):
        cx = st[idx, 0] + st[idx, 2] / 2.0
        cy = st[idx, 1] + st[idx, 3] / 2.0
        for k, j in enumerate(idx):
            nb = np.sum((np.abs(cy - cy[k]) < 0.45 * em) & (np.abs(cx - cx[k]) < 1.6 * em)) - 1
            if nb < 2:
                keep[j] = False
    return keep[lab]


def caption_check(img, a, band, thr_low=3.0):
    """Legibility of the caption in the band. Returns None when no caption glyphs are found."""
    y0, y1 = int(round(band[0] * a)), int(round(band[1] * a))
    x0, x1 = int(round(60 * a)), int(round(1020 * a))
    crop = img[y0:y1, x0:x1]
    if crop.size == 0:
        return None
    rgb = crop[..., ::-1].astype(np.float64)
    lum = Q.wcag_lum(crop[..., ::-1])
    em = EM * a
    dark = (np.abs(rgb - INK).max(axis=2) <= 55) & (lum < 0.06)
    light = (rgb.min(axis=2) >= 228) & ((rgb.max(axis=2) - rgb.min(axis=2)) <= 22)
    box = np.zeros(dark.shape, bool)
    for p in PEACH:
        box |= np.abs(rgb - p).max(axis=2) <= 22
    box = cv2.morphologyEx(box.astype(np.uint8), cv2.MORPH_OPEN, np.ones((3, 3), np.uint8)) > 0
    res = []
    for tone, m in (('dark', dark), ('light', light)):
        t = text_components(m, a, tone)
        area = int(t.sum())
        if area < 0.6 * em * em * 0.05 * 3:   # fewer than ~3 letters: no caption of this tone
            continue
        core = cv2.erode(t.astype(np.uint8), np.ones((2, 2), np.uint8)) > 0
        tl = float(np.median(lum[core])) if core.any() else float(np.median(lum[t]))
        r = max(2, int(round(0.3 * em)))
        ring = cv2.dilate(t.astype(np.uint8), cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (2 * r + 1, 2 * r + 1))) > 0
        near = cv2.dilate(t.astype(np.uint8), np.ones((5, 5), np.uint8)) > 0
        boxd = cv2.dilate(box.astype(np.uint8), np.ones((5, 5), np.uint8)) > 0
        bg = ring & ~near & ~boxd
        if bg.sum() < 50:
            continue
        c = Q.contrast(lum[bg], tl)
        low = float((c < thr_low).mean())
        g = cv2.cvtColor(crop, cv2.COLOR_BGR2GRAY)
        ed = cv2.Canny(g, 60, 140) > 0
        busy = float(ed[bg].mean())
        res.append({'tone': tone, 'glyph_px': area, 'text_lum': round(tl, 4), 'median_contrast': round(float(np.median(c)), 2),
                    'low_frac': round(low, 4), 'busy': round(busy, 4)})
    return res or None


# ---------------------------------------------------------------- main

def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('src')
    ap.add_argument('--fps', type=float, default=None)
    ap.add_argument('--out', default=None)
    ap.add_argument('--name', default=None)
    ap.add_argument('--scenes', default='auto', help='scenes JSON for known cuts ("auto" = src/data/scenes.json when the clip is the film, "none")')
    ap.add_argument('--t0', type=float, default=0.0, help='film time of frame 0')
    ap.add_argument('--caption-band', default='280,600', help='y0,y1 canvas px (0,0 = skip the caption check)')
    ap.add_argument('--canvas-width', type=int, default=Q.CANVAS_W)
    ap.add_argument('--no-ui-zones', action='store_true', help='skip the platform UI-zone check (non-9:16 sources)')
    ap.add_argument('--busy-warn', type=float, default=0.06)
    ap.add_argument('--low-err', type=float, default=0.05)
    ap.add_argument('--low-warn', type=float, default=0.02)
    ap.add_argument('--zone-px', type=float, default=1500.0, help='new-element area (canvas px^2) that counts in a UI zone')
    ap.add_argument('--sheet', type=int, default=24, help='tile up to N flagged frames into framecheck_frames.png (0 = none)')
    ap.add_argument('--quiet', action='store_true')
    args = ap.parse_args(argv)

    src = Q.FrameSource(args.src, fps=args.fps)
    fps = src.fps
    a = src.a
    name = args.name or os.path.splitext(os.path.basename(os.path.normpath(args.src)))[0]
    out = args.out or os.path.join(Q.ROOT, 'out', 'qa', f'framecheck-{name}')
    os.makedirs(out, exist_ok=True)
    band = tuple(int(float(v)) for v in args.caption_band.split(','))
    # known cuts (frame indices on this clip)
    cut_frames = set()
    sc_path = None
    film = os.path.join(Q.ROOT, 'src', 'data', 'scenes.json')
    if args.scenes == 'auto':
        if os.path.exists(film):
            d = json.load(open(film))
            fdur = max(s['end'] for s in d)
            if abs(fdur - (src.n / fps + args.t0)) < 0.6 or args.t0 > 0:
                sc_path = film
    elif args.scenes != 'none':
        sc_path = args.scenes
    trans_frames = set()
    if sc_path:
        scenes, wins = Q.load_scenes(sc_path, src.n / fps, t0=args.t0)
        for s in scenes[1:]:
            cut_frames.add(int(round(s.start * fps)))
        for (w0, w1, ty, sid) in wins:
            for f in range(int(math.floor(w0 * fps)) - 1, int(math.ceil(w1 * fps)) + 2):
                trans_frames.add(f)

    # pass 1: per-frame measurements
    aw, ah = src.aw, src.ah
    bm = np.zeros((ah, aw), bool)
    if band[1] > band[0]:
        bm[int(band[0] * a):int(band[1] * a)] = True
    cam = Q.Camera(aw, ah, (~bm).astype(np.uint8) * 255)
    zmask = {}
    for z, (x0, y0, x1, y1) in ZONES.items():
        m = np.zeros((ah, aw), bool)
        m[int(y0 * a):int(y1 * a), int(x0 * a):int(x1 * a)] = True
        zmask[z] = m
    smalls, blanks, caps, zones = [], [], [], []
    edge_new = []
    prev = pf = pg = pe = None
    opt = dict(Q.DEFAULTS)
    min_px = max(1, int(math.ceil(opt['min_blob'] * a * a)))
    t_s = time.time()
    for i, img in src:
        smalls.append(small(img))
        b, std, top = is_blank(img)
        blanks.append((b, std, top))
        caps.append(caption_check(img, a, band) if band[1] > band[0] else None)
        g = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        f = cam.features(g)
        e = Q.edges(img)
        gm = Q.grad_mag(img)
        zrow = {}
        if not args.no_ui_zones:
            for z, m in zmask.items():
                zrow[z] = {'edges': float(e[m].mean()), 'new_px': 0.0}
            if prev is not None:
                ms, _ = cam.models(pf, f)
                r = Q.residual(prev, img, ms, opt, gprev=pg)
                mm, lab, st, n = Q.drop_small(r.changed, min_px)
                if n:
                    for z, m in zmask.items():
                        inz = np.bincount(lab[m].ravel(), minlength=n + 1)
                        tot = st[:, cv2.CC_STAT_AREA]
                        sel = (inz[1:] >= 0.6 * tot[1:]) & (inz[1:] / (a * a) >= args.zone_px)
                        if sel.any():
                            zrow[z]['new_px'] = float(inz[1:][sel].max() / (a * a))
                nw, _ = Q.edge_newness(pe, e, r.M, ~bm)
                edge_new.append(nw)
            else:
                edge_new.append(0.0)
        zones.append(zrow)
        prev, pf, pg, pe = img, f, gm, e
        if not args.quiet and i and i % 300 == 0:
            print(f'  [framecheck] frame {i}  {(time.time() - t_s) / i * 1000:.0f} ms/frame', file=sys.stderr)
    n = len(smalls)
    # detected cuts also excuse flashes
    if not args.no_ui_zones and edge_new:
        for c in Q.detect_cuts(edge_new, [0.5] * len(edge_new), fps):
            cut_frames.add(c['frame'])
    near_cut = lambda f: any(abs(f - c) <= 1 for c in cut_frames)  # noqa: E731

    issues = []

    def add(kind, sev, f0, f1, msg, **kw):
        issues.append({'kind': kind, 'severity': sev, 'f0': f0, 'f1': f1, 't0': round(f0 / fps + args.t0, 3),
                       't1': round((f1 + 1) / fps + args.t0, 3), 'msg': msg, **kw})

    # blank runs
    for (s, e_) in Q.runs([b[0] for b in blanks]):
        L = e_ - s + 1
        bridge = L <= 3 and (near_cut(s) or near_cut(e_) or s in trans_frames)
        sev = 'warning' if bridge else 'error'
        why = 'bridge frame(s) at a cut' if bridge else ('frame 0 is blank: the hook must show' if s == 0 else 'blank / near-uniform frame')
        add('blank', sev, s, e_, f"{why} ({L} f, luma std {min(blanks[k][1] for k in range(s, e_ + 1)):.1f}, top colour {100 * max(blanks[k][2] for k in range(s, e_ + 1)):.0f} %)")
    # flashes: 1-frame and 2-frame
    d = lambda x, y: diff_frac(smalls[x], smalls[y])  # noqa: E731
    for t in range(1, n - 1):
        d1, d2 = d(t - 1, t), d(t, t + 1)
        m = min(d1, d2)
        if m >= 0.02:
            d0 = d(t - 1, t + 1)
            if d0 <= 0.35 * m and not near_cut(t) and not blanks[t][0]:
                add('flash', 'error', t, t, f"1-frame flash/glitch: differs from both neighbours ({100 * d1:.1f} % / {100 * d2:.1f} % of pixels) "
                    f"while they agree ({100 * d0:.1f} %)", diff=round(m, 4))
        if t + 2 < n:
            d1, d3 = d(t - 1, t), d(t + 1, t + 2)
            m = min(d1, d3)
            if m >= 0.02 and d(t, t + 1) <= 0.35 * m:
                d0 = d(t - 1, t + 2)
                if d0 <= 0.35 * m and not near_cut(t) and not near_cut(t + 1) and not blanks[t][0]:
                    add('flash', 'error', t, t + 1, f"2-frame flash/glitch ({100 * m:.1f} % of pixels; neighbours agree within {100 * d0:.1f} %)", diff=round(m, 4))
    # captions
    capf = []
    for i, c in enumerate(caps):
        if not c:
            capf.append(None)
            continue
        worst = max(c, key=lambda r: (r['low_frac'], r['busy']))
        sev = None
        reasons = []
        if worst['low_frac'] > args.low_err:
            sev = 'error'
            reasons.append(f"{100 * worst['low_frac']:.0f} % of the background below 3:1")
        elif worst['low_frac'] > args.low_warn:
            sev = 'warning'
            reasons.append(f"{100 * worst['low_frac']:.0f} % of the background below 3:1")
        busy = max(r['busy'] for r in c)
        if busy > args.busy_warn:
            sev = sev or 'warning'
            reasons.append(f"busy background (edge density {100 * busy:.1f} %)")
        capf.append((sev, '; '.join(reasons), worst))
    k = 0
    while k < n:
        if capf[k] and capf[k][0]:
            j = k
            while j + 1 < n and capf[j + 1] and capf[j + 1][0]:
                j += 1
            run = [capf[x] for x in range(k, j + 1)]
            sev = 'error' if any(r[0] == 'error' for r in run) else 'warning'
            w = max(run, key=lambda r: (r[2]['low_frac'], r[2]['busy']))
            add('caption', sev, k, j, f"caption legibility: {w[1]} (tone {w[2]['tone']}, median contrast {w[2]['median_contrast']}:1)",
                low_frac=w[2]['low_frac'], busy=max(r[2]['busy'] for r in run))
            k = j + 1
        else:
            k += 1
    # UI zones
    if not args.no_ui_zones:
        for z in ZONES:
            flags = [bool(zr.get(z, {}).get('new_px', 0) > 0) and i not in trans_frames for i, zr in enumerate(zones)]
            merged = []
            for (s, e_) in Q.runs(flags):
                if merged and s - merged[-1][1] <= int(round(0.5 * fps)):
                    merged[-1][1] = e_
                else:
                    merged.append([s, e_])
            for (s, e_) in merged:
                mx = max(zones[x][z]['new_px'] for x in range(s, e_ + 1))
                add('ui-zone', 'warning', s, e_, f"new element(s) in the {z} UI zone (largest {mx:.0f} px²): anything important there? "
                    f"the platform UI covers it", zone=z, px=round(mx))
        rail = np.array([zr.get('rail', {}).get('edges', 0) for zr in zones])
        for (s, e_) in Q.runs(list(rail > 0.08)):
            if e_ - s + 1 >= int(0.5 * fps):
                add('ui-zone', 'warning', s, e_, f"strong edges in the right rail (edge density up to {100 * rail[s:e_ + 1].max():.0f} %): keep key detail left of x 950", zone='rail')
    issues.sort(key=lambda r: (r['severity'] != 'error', r['f0']))
    errs = sum(1 for r in issues if r['severity'] == 'error')
    warns = len(issues) - errs
    by_kind = {}
    for r in issues:
        by_kind.setdefault(r['kind'], {'error': 0, 'warning': 0})[r['severity']] += 1
    capvals = [c for c in caps if c]
    summary = {'frames': n, 'fps': fps, 'errors': errs, 'warnings': warns, 'by_kind': by_kind,
               'caption_frames': len(capvals),
               'caption_low_frac_p95': round(float(np.percentile([max(r['low_frac'] for r in c) for c in capvals], 95)), 4) if capvals else None,
               'caption_busy_p95': round(float(np.percentile([max(r['busy'] for r in c) for c in capvals], 95)), 4) if capvals else None,
               'cuts_known': sorted(cut_frames), 'seconds': round(time.time() - t_s, 1)}
    rep = {'tool': 'framecheck', 'name': name, 'source': os.path.abspath(args.src), 'options': vars(args), 'summary': summary, 'issues': issues}
    Q.write_json(os.path.join(out, 'framecheck.json'), rep)
    L = [f"# Frame check: {name}", '', f"{n} frames @ {fps:g} fps. **{errs} errors, {warns} warnings.** "
         f"Caption glyphs found in {len(capvals)} frames (p95 low-contrast share {summary['caption_low_frac_p95']}, p95 busyness {summary['caption_busy_p95']}).", '',
         '## Frames to look at', '']
    if not issues:
        L.append('- none')
    for r in issues:
        fr = f"f{r['f0']}" if r['f0'] == r['f1'] else f"f{r['f0']}–f{r['f1']}"
        L.append(f"- **{r['severity'].upper()}** {r['kind']} {fr} ({r['t0']:.2f}-{r['t1']:.2f} s): {r['msg']}")
    with open(os.path.join(out, 'framecheck.md'), 'w') as fh:
        fh.write('\n'.join(L) + '\n')
    # contact sheet of flagged frames
    if args.sheet and issues and src.is_dir:
        picks = []
        for r in issues:
            f = (r['f0'] + r['f1']) // 2
            if f not in [p[0] for p in picks]:
                picks.append((f, f"{r['severity'][0].upper()} {r['kind']} f{f} {f / fps + args.t0:.2f}s"))
            if len(picks) >= args.sheet:
                break
        tiles = []
        for f, lab in picks:
            im = small(src.full_res(f), 216)
            pad = np.full((24, im.shape[1], 3), 43, np.uint8)
            cv2.putText(pad, lab[:34], (4, 17), cv2.FONT_HERSHEY_SIMPLEX, 0.38, (240, 240, 240), 1, cv2.LINE_AA)
            tiles.append(np.vstack([pad, im]))
        cols = 6
        while len(tiles) % cols:
            tiles.append(np.full_like(tiles[0], 43))
        rows_ = [np.hstack(tiles[k:k + cols]) for k in range(0, len(tiles), cols)]
        cv2.imwrite(os.path.join(out, 'framecheck_frames.png'), np.vstack(rows_))
    print(f"framecheck {name}: {n} frames, {errs} errors, {warns} warnings ({json.dumps(by_kind)})  {summary['seconds']} s")
    for r in issues[:12]:
        print(f"  {r['severity'].upper():7s} {r['kind']:8s} f{r['f0']}-f{r['f1']} {r['t0']:.2f}s: {r['msg']}")
    if len(issues) > 12:
        print(f"  ... {len(issues) - 12} more in {out}/framecheck.md")
    print(f"  report: {out}/framecheck.md")
    return 1 if errs else 0


if __name__ == '__main__':
    sys.exit(main())
