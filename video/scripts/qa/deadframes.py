#!/usr/bin/env python3
"""deadframes.py: find DEAD frames (nothing on screen moves once the camera is compensated), count motion EVENTS and
score every scene's life 0-10. Writes a per-scene bar chart (green alive, red dead), JSON and Markdown.

  python3 scripts/qa/deadframes.py <frames_dir_or_video> [--fps 30] [--scenes src/data/scenes.json|auto|none]
         [--t0 0] [--only S05] [--out report_dir] [--caption-band 280,600] [--dead-limit 0.40] [--allow holds.json]
  (--scenes auto read v1's src/data/scenes.json, archived since 2026-10-29 in archive/v1/src/data/: it takes the
  detected cuts now; pass --scenes src/<film>/film/scenes.json)

How a frame is measured (docs/QA.md has the full story and the calibration):
 1. The camera is estimated between consecutive frames: ORB features + RANSAC similarity (scale, rotation, shift)
    over the whole frame minus the caption band, plus a second "parallax layer" similarity when a wide set of
    features moves differently but in a camera-like way (multiplane pushes).
 2. Tolerant differencing: a pixel CHANGED when no hypothesis explains it, neither a static camera nor any camera
    model: |cur - warp(prev)| > tau0 + 2 * delta * |gradient|. Camera drift, zooms and pans are therefore NOT life.
 3. Changed blobs smaller than --min-blob canvas px^2 are noise. The caption band is measured separately (captions
    alone do not make a frame alive). LIFE ENERGY = changed canvas px^2 outside the band.
 4. DEAD frame: life energy < --dead-px. DEAD RUN: consecutive dead frames; flagged when longer than --dead-limit s
    (default 0.40 s, the reference's own maximum) unless allow-listed (--allow) or inside a transition window.
 5. EVENT: a space-time change blob (linked frame to frame while it keeps changing) of >= --event-vox
    canvas px^2*frames; counted at its onset frame.
 6. LIFE SCORE = 10 * (0.45 * D + 0.35 * V + 0.20 * G), with
      D = min(1, events per s / --target-rate)            (density; target 5 events/s)
      V = 1 - (frames in flagged dead runs) / frames       (coverage)
      G = 1 if the longest gap between events <= 1.0 s, falling linearly to 0 at 2.0 s (gap)
    PASS = score >= 8 and no flagged dead run.
"""
from __future__ import annotations

import argparse
import csv
import json
import math
import os
import sys
import time
from collections import deque

import cv2
import numpy as np

sys.dont_write_bytecode = True   # keep scripts/qa free of __pycache__
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import qalib as Q  # noqa: E402

SCORE_W = (0.45, 0.35, 0.20)
GAP_OK, GAP_ZERO = 1.0, 2.0
PASS_SCORE = 8.0


# ---------------------------------------------------------------- analysis

def analyze(src: Q.FrameSource, opt: dict, band=(280, 600), progress=True, dump=None):
    """Per-frame life energy, caption-band energy, camera, cut signals, and space-time events."""
    a = src.a
    aw, ah = src.aw, src.ah
    by0, by1 = int(round(band[0] * a)), int(round(band[1] * a))
    band_mask = np.zeros((ah, aw), bool)
    if band[1] > band[0]:
        band_mask[max(0, by0):min(ah, by1), :] = True
    outside = ~band_mask
    feat_mask = outside.astype(np.uint8) * 255
    cam = Q.Camera(aw, ah, feat_mask)
    px_area = 1.0 / (a * a)                     # canvas px^2 per analysis px
    min_px = max(1, int(math.ceil(opt['min_blob'] * a * a)))
    tk = dict(link=max(1, int(round(opt['event_link'] * a))), merge=int(round(opt['event_merge'] * a)), hold=int(opt['event_hold']))
    life_tr = Q.EventTracker(**tk)
    cap_tr = Q.EventTracker(**tk)
    rows = []
    hist = deque(maxlen=5)                       # (img, grad, edges, M from previous frame): the 4-frame baseline
    prev = prev_feats = prev_e = prev_g = None
    t_start = time.time()
    for i, img in src:
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        feats = cam.features(gray)
        e = Q.edges(img)
        g = Q.grad_mag(img)
        row = {'i': i, 'life': float('nan'), 'life4': float('nan'), 'band': 0.0, 'model': 'first', 's': 1.0, 'rot': 0.0, 'tx': 0.0,
               'ty': 0.0, 'new1': 0.0, 'new4': 0.0, 'frac': 1.0, 'blobs': 0}
        if prev is None:
            life_tr.break_link()
            cap_tr.break_link()
            hist.append((img, g, e, Q.IDENT.copy()))
        else:
            models, info = cam.models(prev_feats, feats)
            res = Q.residual(prev, img, models, opt, gprev=prev_g)
            ch = res.changed & outside
            m, lab, stats, n = Q.drop_small(ch, min_px)
            life_tr.add(i, m, px_area, a)
            if dump is not None:
                dump.append((i, np.packbits(m)))
            row['life'] = float(m.sum()) * px_area
            row['blobs'] = n
            cb = res.changed & band_mask
            mb, labb, statsb, nb = Q.drop_small(cb, min_px)
            cap_tr.add(i, mb, px_area, a)
            row['band'] = float(mb.sum()) * px_area
            s_, r_, tx, ty = Q.sim_params(res.M)
            row.update(model=res.model, s=s_, rot=r_, tx=tx / a, ty=ty / a)
            vo = res.valid & outside
            row['frac'] = float(ch[vo].mean()) if vo.any() else 0.0
            row['new1'], _ = Q.edge_newness(prev_e, e, res.M, outside)
            # 4-frame baseline: compose the per-frame camera transforms
            hist.append((img, g, e, models[0] if models else Q.IDENT.copy()))
            if len(hist) == 5:
                M4 = Q.IDENT.copy()
                for k in range(1, 5):
                    M4 = Q.compose(hist[k][3], M4)
                row['new4'], _ = Q.edge_newness(hist[0][2], e, M4, outside)
                # SLOW MOTION: a little change every frame (a pipe drawing on, a slow slide) that adds up over 4 frames
                if opt['dead_px'] / 8 <= row['life'] < opt['dead_px']:
                    r4 = Q.residual(hist[0][0], img, [M4], opt, gprev=hist[0][1])
                    m4, *_ = Q.drop_small(r4.changed & outside, min_px)
                    row['life4'] = float(m4.sum()) * px_area
        rows.append(row)
        prev, prev_feats, prev_e, prev_g = img, feats, e, g
        if progress and i and i % 150 == 0:
            el = time.time() - t_start
            print(f'  [deadframes] frame {i}/{len(src)}  {el / i * 1000:.0f} ms/frame', file=sys.stderr)
    return rows, life_tr, cap_tr


# ---------------------------------------------------------------- scoring

def load_allow(path):
    if not path:
        return []
    with open(path) as f:
        d = json.load(f)
    if isinstance(d, dict):
        d = d.get('holds', d.get('allow', []))
    return d


def allowed(run, scene, allow, fps, t0):
    f0, f1 = run
    a0, a1 = f0 / fps, (f1 + 1) / fps
    tol = 1.5 / fps
    for h in allow:
        if 'scene' in h:
            if h['scene'] != scene.id:
                continue
            w0, w1 = scene.start + float(h['t0']), scene.start + float(h['t1'])
        else:
            w0, w1 = float(h['t0']) - t0, float(h['t1']) - t0
        if a0 >= w0 - tol and a1 <= w1 + tol:
            return h.get('why', 'allow-listed')
    return None


def slow_motion(rows, opt):
    """Frames kept alive by SLOW, STEADY motion (a pipe drawing on, a slow slide): the last 4 single-frame energies are
    all quiet but non-zero (dead_px/8 .. dead_px) and the camera-compensated change over those 4 frames reaches
    1.5 x dead_px. Idle jitter (bobs, codec flicker) and the quiet frame right after a burst do not qualify."""
    D = opt['dead_px']
    life = np.array([r['life'] for r in rows], float)
    life4 = np.nan_to_num(np.array([r.get('life4', float('nan')) for r in rows], float), nan=0.0)
    q = (life >= D / 8) & (life < D)
    steady = np.zeros(len(rows), bool)
    for i in range(3, len(rows)):
        steady[i] = q[i - 3:i + 1].all()
    return steady & (life4 >= 1.5 * D)


def score_scenes(rows, scenes, events, cap_events, fps, opt, allow, t0, grace=True):
    n = len(rows)
    life = np.array([r['life'] for r in rows], float)
    band = np.array([r['band'] for r in rows], float)
    dead = np.where(np.isnan(life), False, life < opt['dead_px'])
    dead &= ~slow_motion(rows, opt)
    trans = np.zeros(n, bool)
    for sc in scenes:
        for (w0, w1, ty) in sc.trans:
            a, b = int(math.floor(w0 * fps)), int(math.ceil(w1 * fps))
            trans[max(0, a):min(n, b + 1)] = True
    # frame 0 has no predecessor and is never dead; a hard cut is alive by its own change
    out = []
    for sc in scenes:
        f0 = int(round(sc.start * fps))
        f1 = min(n, int(round(sc.end * fps)))
        if f1 <= f0:
            continue
        N = f1 - f0
        dd = dead[f0:f1].copy()
        if grace:
            dd &= ~trans[f0:f1]
        rr = []
        for (a, b) in Q.runs(list(dd)):
            ga, gb = a + f0, b + f0
            dur = (gb - ga + 1) / fps
            why = allowed((ga, gb), sc, allow, fps, t0)
            cap_only = int(np.sum(band[ga:gb + 1] >= opt['dead_px']))
            rr.append({'f0': ga, 'f1': gb, 't0': round(ga / fps + t0, 3), 't1': round((gb + 1) / fps + t0, 3),
                       'local_f0': a, 'local_f1': b, 'dur': round(dur, 3), 'frames': gb - ga + 1,
                       'over_limit': dur > opt['dead_limit'] + 1e-9, 'allow': why,
                       'flagged': dur > opt['dead_limit'] + 1e-9 and not why, 'caption_only_frames': cap_only})
        ev = [e for e in events if f0 <= e['onset'] < f1]
        cev = [e for e in cap_events if f0 <= e['onset'] < f1]
        onsets = [e['onset'] for e in ev]
        rate = len(ev) / (N / fps)
        pts = [f0] + onsets + [f1]
        gaps = np.diff(pts) / fps
        max_gap = float(gaps.max()) if len(gaps) else N / fps
        gi = int(np.argmax(gaps)) if len(gaps) else 0
        inner = np.diff(onsets) if len(onsets) > 1 else np.array([])
        med_gap = float(np.median(inner)) if len(inner) else float('nan')
        flagged_frames = sum(r['frames'] for r in rr if r['flagged'])
        D = min(1.0, rate / opt['target_rate'])
        V = 1.0 - flagged_frames / N
        G = 1.0 if max_gap <= GAP_OK else max(0.0, 1.0 - (max_gap - GAP_OK) / (GAP_ZERO - GAP_OK))
        score = 10 * (SCORE_W[0] * D + SCORE_W[1] * V + SCORE_W[2] * G)
        score = math.floor(score * 10 + 1e-6) / 10
        lv = life[f0:f1]
        cap_only_frames = int(np.sum(dead[f0:f1] & (band[f0:f1] >= opt['dead_px'])))
        flagged = [r for r in rr if r['flagged']]
        out.append({
            'id': sc.id, 'note': sc.note, 'start': round(sc.start + t0, 3), 'end': round(sc.end + t0, 3), 'f0': f0, 'f1': f1 - 1,
            'frames': N, 'dur': round(N / fps, 3),
            'events': len(ev), 'events_per_s': round(rate, 2), 'median_gap_frames': med_gap,
            'max_gap_s': round(max_gap, 3), 'max_gap_at': [round(pts[gi] / fps + t0, 3), round(pts[gi + 1] / fps + t0, 3)] if len(gaps) else None,
            'dead_frames': int(dd.sum()), 'dead_frac': round(float(dd.mean()), 3),
            'transition_frames': int(trans[f0:f1].sum()),
            'longest_dead_s': round(max([r['dur'] for r in rr], default=0.0), 3),
            'dead_runs': rr, 'flagged_runs': len(flagged), 'flagged_frames': flagged_frames,
            'caption_events': len(cev), 'caption_only_frames': cap_only_frames,
            'life_median': float(np.nanmedian(lv)) if np.isfinite(lv).any() else 0.0,
            'D': round(D, 3), 'V': round(V, 3), 'G': round(G, 3), 'score': score,
            'pass': bool(score >= PASS_SCORE and not flagged),
        })
    return out, dead, trans


# ---------------------------------------------------------------- outputs

C = dict(surface='#fcfcfb', text='#0b0b0b', text2='#52514e', muted='#8a897f', grid='#e1e0d9', axis='#c3c2b7',
         good='#0ca30c', critical='#d03b3b', trans='#2a78d6', band='#9a9890', flag='#f6d5d5')


def chart(path, rows, scenes, dead, trans, events, fps, opt, title, t0):
    """Small multiples, one panel per scene: life energy per frame (log), green alive / red dead / blue excused
    (inside a transition), pink band = flagged dead run, ticks = event onsets, grey line = caption-band change."""
    import matplotlib
    matplotlib.use('Agg')
    import matplotlib.pyplot as plt
    from matplotlib.lines import Line2D
    from matplotlib.patches import Patch

    life = np.array([r['life'] for r in rows], float)
    life = np.where(np.isnan(life), np.nanmax(life) if np.isfinite(life).any() else 1, life)
    band = np.array([r['band'] for r in rows], float)
    ns = len(scenes)
    ncol = 1 if ns <= 3 else 2
    nrow = int(math.ceil(ns / ncol))
    W = max(9.6, 7.4 * ncol)
    ph, top_in, bot_in = 1.62, 1.1, 0.95
    H = top_in + bot_in + ph * nrow
    fig = plt.figure(figsize=(W, H), facecolor=C['surface'])
    gs = fig.add_gridspec(nrow, ncol, left=0.06 if ncol > 1 else 0.085, right=0.985, top=1 - top_in / H, bottom=(bot_in - 0.05) / H,
                          hspace=0.95, wspace=0.12)
    floor = 10.0
    ymax = max(opt['dead_px'] * 60, float(np.nanmax(life)) * 2.0 if len(life) else 1)
    for k in range(ns):
        ax = fig.add_subplot(gs[k % nrow, k // nrow]) if ncol > 1 else fig.add_subplot(gs[k, 0])
        ax.set_facecolor(C['surface'])
        sc = scenes[k]
        f0, f1 = sc['f0'], sc['f1'] + 1
        x = np.arange(f0, f1) - f0
        lv = np.maximum(life[f0:f1], floor * 3)        # a visible stub for frames where nothing changed at all
        dd = dead[f0:f1]
        tt = trans[f0:f1]
        for r in sc['dead_runs']:
            if r['flagged']:
                ax.axvspan(r['local_f0'] - 0.5, r['local_f1'] + 0.5, color=C['flag'], zorder=0, lw=0)
        rawdead = np.array([rows[i]['life'] < opt['dead_px'] if np.isfinite(rows[i]['life']) else False for i in range(f0, f1)])
        cols = np.where(tt & rawdead, C['trans'], np.where(dd, C['critical'], C['good']))
        ax.bar(x, lv, width=0.85 if len(x) < 400 else 1.0, color=cols, zorder=2, linewidth=0)
        bv = np.where(band[f0:f1] > 0, np.maximum(band[f0:f1], floor), np.nan)
        ax.plot(x, bv, color=C['band'], lw=0.8, zorder=3)
        ax.axhline(opt['dead_px'], color=C['text2'], lw=0.8, ls=(0, (3, 2)), zorder=4)
        on = [e['onset'] - f0 for e in events if f0 <= e['onset'] < f1]
        if on:
            ax.vlines(on, ymax * 0.5, ymax * 0.95, color=C['text2'], lw=0.7, zorder=4)
        ax.set_yscale('log')
        ax.set_ylim(floor, ymax)
        ax.set_xlim(-1, max(1, f1 - f0))
        ax.tick_params(colors=C['text2'], labelsize=7, length=2)
        for sp in ('top', 'right'):
            ax.spines[sp].set_visible(False)
        for sp in ('left', 'bottom'):
            ax.spines[sp].set_color(C['axis'])
        ax.grid(axis='y', color=C['grid'], lw=0.5, zorder=1)
        ax.set_yticks([100, 1000, 10000, 100000])
        ax.set_yticklabels(['100', '1k', '10k', '100k'])
        ax.minorticks_off()
        verdict = 'PASS' if sc['pass'] else 'FAIL'
        mark = '\u2713' if sc['pass'] else '\u2717'
        if sc['flagged_runs']:
            dr = f"{sc['flagged_runs']} dead run{'s' if sc['flagged_runs'] != 1 else ''} > {opt['dead_limit']:.2f}s"
        else:
            dr = f"longest dead {sc['longest_dead_s']:.2f}s"
        ax.set_title(f"{sc['id']}   {sc['score']:.1f}/10  {mark} {verdict}", loc='left', fontsize=10, color=C['text'], fontweight='bold', pad=14)
        ax.text(0, 1.035, f"{sc['events_per_s']:.1f} events/s \u00b7 max gap {sc['max_gap_s']:.2f}s \u00b7 {sc['dead_frames']} dead f \u00b7 {dr}",
                transform=ax.transAxes, fontsize=7.5, color=C['text2'], va='bottom')
        ax.set_xlabel(f"scene frame  (frame 0 = {sc['start']:.2f}s, f{sc['f0']} of the clip)", fontsize=7, color=C['text2'], labelpad=1)
        fl = [r for r in sc['dead_runs'] if r['flagged']]
        if fl:
            r = max(fl, key=lambda r: r['frames'])
            right = r['local_f1'] > 0.62 * (f1 - f0)
            ax.text(r['local_f1'] - 1 if right else r['local_f1'] + 1, ymax * 0.12, f"{r['frames']} dead f (f{r['local_f0']}\u2013f{r['local_f1']})",
                    fontsize=7.2, color=C['critical'], va='center', ha='right' if right else 'left', zorder=5, fontweight='bold')
    handles = [Patch(color=C['good'], label='alive'), Patch(color=C['critical'], label='dead'),
               Patch(color=C['trans'], label='dead, but inside a transition (excused)'),
               Patch(color=C['flag'], label=f'dead run > {opt["dead_limit"]:.2f}s (flagged)'),
               Line2D([0], [0], color=C['text2'], lw=0.8, ls=(0, (3, 2)), label=f'dead threshold {opt["dead_px"]:.0f} px\u00b2'),
               Line2D([0], [0], color=C['text2'], lw=0.8, label='event onset'),
               Line2D([0], [0], color=C['band'], lw=1, label='caption-band change (not life)')]
    fig.text(0.5, 1 - 0.3 / H, title, ha='center', va='center', fontsize=12, color=C['text'], fontweight='bold')
    fig.legend(handles=handles, loc='center', ncol=4, fontsize=7.5, frameon=False, bbox_to_anchor=(0.5, 1 - 0.68 / H),
               labelcolor=C['text'], handlelength=1.6, columnspacing=1.4)
    foot = ['Bars: camera-compensated life energy per frame (changed canvas px\u00b2 outside the caption band, log scale). Camera moves alone are not life.',
            'Score = 10 \u00d7 (0.45\u00b7density + 0.35\u00b7coverage + 0.20\u00b7gap); density = min(1, events/s \u00f7 5); coverage = 1 \u2212 flagged dead frames \u00f7 frames;',
            'gap = 1 if the longest gap between event onsets \u2264 1 s, falling to 0 at 2 s.  PASS = score \u2265 8 and no dead run over the limit.']
    for k, t in enumerate(foot):
        fig.text(0.5, (0.36 - 0.13 * k) / H, t, ha='center', fontsize=6.8, color=C['text2'])
    fig.savefig(path, dpi=125, facecolor=C['surface'])
    plt.close(fig)


def markdown(path, rep):
    o = rep['options']
    L = [f"# Dead-frame report: {rep['name']}", '',
         f"Source `{rep['source']}`: {rep['frames']} frames @ {rep['fps']:g} fps ({rep['duration']:.2f} s), scenes from {rep['scenes_from']}.",
         f"Dead = life energy < {o['dead_px']:.0f} canvas px² (camera compensated, caption band y {o['caption_band'][0]}-{o['caption_band'][1]} excluded); "
         f"flagged dead run > {o['dead_limit']:.2f} s; event >= {o['event_vox']:.0f} px²·frames; target {o['target_rate']:g} events/s.",
         '', f"**Gate: {'PASS' if rep['pass'] else 'FAIL'}** ({rep['passed']}/{len(rep['scenes'])} scenes pass; overall {rep['events_per_s']:.2f} events/s, "
         f"median gap {rep['median_gap_frames']:.1f} f, longest dead run {rep['longest_dead_s']:.2f} s).", '',
         '| scene | time | score | ev/s | med gap (f) | max gap (s) | dead f | longest dead (s) | flagged runs | caption ev | camera-only moves | verdict |',
         '|---|---|---|---|---|---|---|---|---|---|---|---|']
    for s in rep['scenes']:
        L.append(f"| {s['id']} | {s['start']:.2f}-{s['end']:.2f} | **{s['score']:.1f}** | {s['events_per_s']:.2f} | {s['median_gap_frames']:.1f} | {s['max_gap_s']:.2f} | "
                 f"{s['dead_frames']} | {s['longest_dead_s']:.2f} | {s['flagged_runs']} | {s['caption_events']} | {s.get('camera_frames', 0)} f | {'PASS' if s['pass'] else 'FAIL'} |")
    L += ['', '## Dead runs over the limit', '']
    any_ = False
    for s in rep['scenes']:
        for r in s['dead_runs']:
            if r['over_limit']:
                any_ = True
                tag = f"allow-listed ({r['allow']})" if r['allow'] else '**FLAGGED**'
                cap = f", captions change in {r['caption_only_frames']} of them" if r['caption_only_frames'] else ''
                L.append(f"- {s['id']}: {r['frames']} dead frames (scene f{r['local_f0']}–f{r['local_f1']}, film f{r['f0']}–f{r['f1']}, "
                         f"{r['t0']:.2f}-{r['t1']:.2f} s, {r['dur']:.2f} s){cap}: {tag}")
    if not any_:
        L.append('- none')
    L += ['', '## Score formula', '',
          'score = 10 x (0.45 D + 0.35 V + 0.20 G); D = min(1, events/s / target); V = 1 - frames in flagged dead runs / frames; '
          'G = 1 if the longest gap between event onsets (scene edges included) <= 1.0 s, linear to 0 at 2.0 s. '
          'A scene PASSES with score >= 8.0 and no flagged dead run. Frames inside transition windows are never dead.', '']
    with open(path, 'w') as f:
        f.write('\n'.join(L))


# ---------------------------------------------------------------- main

def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('src', help='frames directory (PNG/JPG, sorted) or a video file')
    ap.add_argument('--fps', type=float, default=None, help='frame rate (default: the video\'s, or 30 for a directory)')
    # --scenes auto: v1's src/data/scenes.json is archived since 2026-10-29 (archive/v1/src/data/): the detected cuts
    ap.add_argument('--scenes', default='auto', help='scenes JSON (src/data/scenes.json format), "auto" (scenes.json if the '
                    'clip length matches the film, else detected cuts), "cuts" (detected cuts) or "none" (one scene)')
    ap.add_argument('--t0', type=float, default=0.0, help='film time of frame 0 (for a per-scene composition: its start)')
    ap.add_argument('--only', default=None, help='keep only this scene id from the scenes JSON')
    ap.add_argument('--name', default=None, help='label for the report (default: the source name)')
    ap.add_argument('--out', default=None, help='report directory (default: out/qa/deadframes-<name>)')
    ap.add_argument('--caption-band', default=None, help='y0,y1 in canvas px of the caption band (default 280,600; 0,0 = none)')
    ap.add_argument('--canvas-width', type=int, default=Q.CANVAS_W)
    ap.add_argument('--dead-limit', type=float, default=0.40, help='longest allowed dead run, s (default 0.40)')
    ap.add_argument('--allow', default=None, help='JSON allow-list of intentional holds: [{"scene": "S05", "t0": 1.2, "t1": 2.4, "why": ".."} '
                    '(scene-local s) or {"t0": 33.0, "t1": 34.1} (film s)]')
    ap.add_argument('--target-rate', type=float, default=5.0, help='events/s target (default 5)')
    ap.add_argument('--dead-px', type=float, default=Q.DEFAULTS['dead_px'])
    ap.add_argument('--event-vox', type=float, default=Q.DEFAULTS['event_vox'])
    ap.add_argument('--tau0', type=float, default=Q.DEFAULTS['tau0'])
    ap.add_argument('--delta-cam', type=float, default=Q.DEFAULTS['delta_cam'])
    ap.add_argument('--delta-static', type=float, default=Q.DEFAULTS['delta_static'])
    ap.add_argument('--min-blob', type=float, default=Q.DEFAULTS['min_blob'])
    ap.add_argument('--analysis', type=float, default=Q.DEFAULTS['analysis'], help='analysis scale vs the 1080 canvas (default 0.5)')
    ap.add_argument('--no-transition-grace', action='store_true', help='count dead frames inside transition windows too')
    ap.add_argument('--no-chart', action='store_true')
    ap.add_argument('--dump-masks', default=None, help=argparse.SUPPRESS)   # calibration: save the per-frame life masks
    ap.add_argument('--quiet', action='store_true')
    args = ap.parse_args(argv)

    src = Q.FrameSource(args.src, fps=args.fps, analysis=args.analysis, canvas_w=args.canvas_width)
    name = args.name or os.path.splitext(os.path.basename(os.path.normpath(args.src)))[0]
    out = args.out or os.path.join(Q.ROOT, 'out', 'qa', f'deadframes-{name}')
    os.makedirs(out, exist_ok=True)
    band = (280, 600)
    if args.caption_band:
        band = tuple(int(float(v)) for v in args.caption_band.split(','))
    opt = dict(Q.DEFAULTS)
    opt.update(tau0=args.tau0, delta_cam=args.delta_cam, delta_static=args.delta_static, min_blob=args.min_blob,
               dead_px=args.dead_px, event_vox=args.event_vox, dead_limit=args.dead_limit, target_rate=args.target_rate,
               analysis=args.analysis, caption_band=list(band))
    t_a = time.time()
    dump = [] if args.dump_masks else None
    rows, life_tr, cap_tr = analyze(src, opt, band, progress=not args.quiet, dump=dump)
    if dump is not None:
        np.savez_compressed(args.dump_masks, idx=np.array([d[0] for d in dump]), masks=np.array([d[1] for d in dump]),
                            shape=(src.ah, src.aw), a=src.a, fps=src.fps, n=len(rows))
    n = len(rows)
    fps = src.fps
    dur = n / fps
    events = life_tr.events(opt['event_vox'])
    cap_events = cap_tr.events(opt['event_vox'])
    # cuts (always detected: used for --scenes cuts/auto and reported)
    new = [max(r['new1'], r['new4']) for r in rows]
    frac = [r['frac'] for r in rows]
    cuts = Q.detect_cuts(new, frac, fps)
    # scenes
    scenes_from = args.scenes
    # v1's cut list, archived since 2026-10-29 (archive/v1/src/data/): auto finds none now and takes the detected cuts
    film = os.path.join(Q.ROOT, 'src', 'data', 'scenes.json')
    sc_path = None
    if args.scenes == 'auto':
        if os.path.exists(film):
            d = json.load(open(film))
            fdur = max(s['end'] for s in d) - min(s['start'] for s in d)
            if args.only or abs(fdur - (dur + args.t0)) < 0.6 or (args.t0 > 0):
                sc_path = film
        scenes_from = 'src/data/scenes.json' if sc_path else 'detected cuts'
    elif args.scenes not in ('cuts', 'none'):
        sc_path = args.scenes
        scenes_from = args.scenes
    if sc_path:
        scenes, _ = Q.load_scenes(sc_path, dur, t0=args.t0, only=args.only)
        if not scenes:
            scenes = [Q.Scene(args.only or name, 0.0, dur)]
    elif args.scenes == 'none':
        scenes = [Q.Scene(name, 0.0, dur)]
        scenes_from = 'whole clip'
    else:
        scenes = Q.scenes_from_cuts([c['frame'] for c in cuts], n, fps)
        scenes_from = 'detected cuts'
    allow = load_allow(args.allow) if args.allow else []
    sc_rep, dead, trans = score_scenes(rows, scenes, events, cap_events, fps, opt, allow, args.t0, grace=not args.no_transition_grace)
    for s in sc_rep:
        s['camera_frames'] = int(sum(1 for r in rows[s['f0']:s['f1'] + 1] if r['model'] != 'static' and r['model'] != 'first'))
    onsets = [e['onset'] for e in events]
    gaps = np.diff(onsets) if len(onsets) > 1 else np.array([0])
    rep = {
        'tool': 'deadframes', 'name': name, 'source': os.path.abspath(args.src), 'fps': fps, 'frames': n, 'duration': round(dur, 3),
        't0': args.t0, 'scenes_from': scenes_from, 'options': opt, 'score_weights': SCORE_W,
        'events_total': len(events), 'events_per_s': round(len(events) / dur, 3) if dur else 0,
        'median_gap_frames': float(np.median(gaps)) if len(gaps) else 0.0,
        'longest_dead_s': max([s['longest_dead_s'] for s in sc_rep], default=0.0),
        'dead_frac': round(float(dead.mean()), 4),
        'caption_events_total': len(cap_events),
        'cuts_detected': [{'frame': c['frame'], 't': round(c['frame'] / fps + args.t0, 3), 'score': round(c['score'], 3)} for c in cuts],
        'scenes': sc_rep, 'passed': sum(1 for s in sc_rep if s['pass']), 'pass': all(s['pass'] for s in sc_rep),
        'events': [{'onset': e['onset'], 't': round(e['onset'] / fps + args.t0, 3), 'last': e['last'], 'vox': round(e['vox']), 'cx': round(e['cx']), 'cy': round(e['cy'])} for e in events],
        'analysis_s': round(time.time() - t_a, 1),
    }
    Q.write_json(os.path.join(out, 'deadframes.json'), rep)
    with open(os.path.join(out, 'deadframes_frames.csv'), 'w', newline='') as f:
        w = csv.writer(f)
        w.writerow(['frame', 't', 'life_px2', 'life4_px2', 'caption_px2', 'dead', 'transition', 'camera_model', 'scale', 'rot_deg', 'tx', 'ty', 'edge_new1', 'edge_new4', 'changed_frac'])
        for r, d_, t_ in zip(rows, dead, trans):
            w.writerow([r['i'], f"{r['i'] / fps + args.t0:.3f}", f"{r['life']:.0f}", f"{r['life4']:.0f}", f"{r['band']:.0f}", int(d_), int(t_), r['model'],
                        f"{r['s']:.5f}", f"{r['rot']:.4f}", f"{r['tx']:.2f}", f"{r['ty']:.2f}", f"{r['new1']:.3f}", f"{r['new4']:.3f}", f"{r['frac']:.4f}"])
    markdown(os.path.join(out, 'deadframes.md'), rep)
    if not args.no_chart:
        chart(os.path.join(out, 'deadframes.png'), rows, sc_rep, dead, trans, events, fps, opt,
              f"Life per scene: {name}  ({rep['passed']}/{len(sc_rep)} scenes pass, {rep['events_per_s']:.1f} events/s overall)", args.t0)
    # console summary
    print(f"deadframes {name}: {n} frames, {len(events)} events ({rep['events_per_s']:.2f}/s, median gap {rep['median_gap_frames']:.1f} f), "
          f"dead {100 * rep['dead_frac']:.1f}% of frames, {rep['analysis_s']} s")
    for s in sc_rep:
        fl = [r for r in s['dead_runs'] if r['flagged']]
        extra = '; '.join(f"{r['frames']} dead f (f{r['local_f0']}-f{r['local_f1']})" for r in fl)
        print(f"  {s['id']:<6} {s['score']:4.1f}/10 {'PASS' if s['pass'] else 'FAIL'}  {s['events_per_s']:5.2f} ev/s  max gap {s['max_gap_s']:.2f}s  "
              f"longest dead {s['longest_dead_s']:.2f}s{('  ' + extra) if extra else ''}")
    print(f"  report: {out}/deadframes.md  chart: {out}/deadframes.png")
    return 0 if rep['pass'] else 1


if __name__ == '__main__':
    sys.exit(main())
