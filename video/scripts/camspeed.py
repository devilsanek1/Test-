#!/usr/bin/env python3
"""camspeed.py: on-screen SPEED and VELOCITY-CONTINUITY check of a real render (any composition: Main, S01..S13, dev).

Flat inked art strobes above ~15-20 px / frame (MOTION.camera.peakPxPerFrame, src/lib/spec.ts), and gate 1 says a move
keeps its velocity across segments and cuts (no stall, no slam, no whip). The cine `camSpeed()` covers CineCamera keys
in code only; this tool measures what is actually on screen, so it also covers World push, ShotCam layers, Film
transitions, Person moves and anything hand-animated:

  camera   per frame pair, the global camera (qalib.Camera: tracked corners + RANSAC similarity, + a second parallax
           layer when there is one): the largest displacement of the frame grid, canvas px / frame
  fastest  dense optical flow (Farneback) on inked edges: the 99th percentile of edge motion, canvas px / frame
           (a foreground layer, a person, a wiper: whatever moves fastest)
  dv       frame-to-frame change of the camera speed (canvas px / frame per frame): a step = a stall, a slam or a whip

FAIL (exit 1) when, OUTSIDE the allow-listed windows, the camera runs above --limit (default peakPxPerFrame = 18) for
--min-run frames or more, or the camera speed steps by more than --dv-limit (default 2.5). Fast LOCAL motion above the
limit is a WARN (a designed rise moves 50 % of its height in frame 1; --strict-edges makes it fail). Film transitions are allow-listed automatically (push-through runs > 100 px / frame by design): for Main
from src/data/scenes.json, for a per-scene composition S07 its own transitionIn window at its start. Add your own with
--allow=t0-t1[,t0-t1...] (composition seconds).

  scripts/camspeed.py S07                         # the whole scene (renders every frame at --scale 0.5)
  scripts/camspeed.py Main 30 38                  # a range of the film
  scripts/camspeed.py CineDemo 15.7 22 --allow=15.6-16.3
  scripts/camspeed.py --frames out/frames/S07 --fps 30 --t0 0   # analyse frames you already rendered
  ... --chart out.png --json out.json
"""
from __future__ import annotations

import argparse
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile

import cv2
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..'))
sys.path.insert(0, os.path.join(HERE, 'qa'))
import qalib as Q  # noqa: E402  (read-only use of the QA lane's camera estimator)


def spec_peak(default=18.0) -> float:
    try:
        txt = open(os.path.join(ROOT, 'src/lib/spec.ts')).read()
        m = re.search(r'peakPxPerFrame:\s*([\d.]+)', txt)
        return float(m.group(1)) if m else default
    except OSError:
        return default


def comp_duration(comp: str) -> float | None:
    """Duration (s) of a composition: Main / Sxx from scenes.json, dev compositions from src/dev/registry.ts."""
    try:
        scenes = json.load(open(os.path.join(ROOT, 'src/data/scenes.json')))
        if comp == 'Main':
            return max(s['end'] for s in scenes)
        for s in scenes:
            if s['id'] == comp:
                return s['end'] - s['start']
    except (OSError, ValueError, KeyError):
        pass
    try:
        reg = open(os.path.join(ROOT, 'src/dev/registry.ts')).read()
        m = re.search(r"id:\s*'%s'\s*,\s*component:\s*\w+\s*,\s*durationSeconds:\s*([\d.]+)" % re.escape(comp), reg)
        if m:
            return float(m.group(1))
    except OSError:
        pass
    return None


def transition_windows(comp: str) -> list[tuple[float, float, str]]:
    """Allow-listed windows in COMPOSITION seconds (Film transitions)."""
    try:
        scenes = json.load(open(os.path.join(ROOT, 'src/data/scenes.json')))
    except (OSError, ValueError):
        return []
    wins = Q.film_transition_windows(scenes)
    if comp == 'Main':
        return [(a, b, f'{ty} -> {sid}') for (a, b, ty, sid) in wins]
    for s in scenes:
        if s['id'] == comp:
            st = float(s['start'])
            out = []
            for (a, b, ty, sid) in wins:
                if sid == comp or (a < s['end'] and b > s['start']):
                    out.append((a - st, b - st, f'{ty} ({sid})'))
            return out
    return []


def render(comp: str, t0: float, t1: float, scale: float, out_dir: str, props: str | None) -> None:
    f0, f1 = round(t0 * 30), round(t1 * 30)
    times = ','.join(f'{f / 30:.4f}' for f in range(f0, f1 + 1))
    cmd = ['node', os.path.join(ROOT, 'scripts/render-frames.mjs'), comp, out_dir, times, f'--scale={scale}']
    if props:
        cmd.append(f'--props={props}')
    print(f'[camspeed] rendering {comp} {t0:.2f}-{t1:.2f} s ({f1 - f0 + 1} frames, scale {scale}) ...', file=sys.stderr)
    subprocess.run(cmd, check=True, cwd=ROOT, stdout=subprocess.DEVNULL)


def grid_disp(M, w, h, nx=7, ny=11):
    """Largest displacement (px) of a 7 x 11 grid of cell centres under M (the same grid as the cine camSpeed())."""
    xs = (np.arange(nx) + 0.5) * w / nx
    ys = (np.arange(ny) + 0.5) * h / ny
    pts = np.array([[x, y] for x in xs for y in ys], np.float64)
    q = pts @ M[:, :2].T + M[:, 2]
    return float(np.max(np.hypot(*(q - pts).T)))


def analyse(src: Q.FrameSource, band=(280, 600)):
    """Per frame pair: camera speed (canvas px / f), parallax-layer speed, fastest edge motion (p99, canvas px / f).
    Edge motion keeps only forward-backward CONSISTENT flow (a window popping on, a fill appearing is not motion) and
    leaves the caption band out (captions scroll by design: reference 1's measured page scroll)."""
    cam = Q.Camera(src.aw, src.ah)
    a = src.a  # analysis px per canvas px
    rows = []
    prev = None
    yy, xx = np.mgrid[0:src.ah, 0:src.aw].astype(np.float32)
    keep_rows = np.ones((src.ah, src.aw), bool)
    if band:
        keep_rows[int(band[0] * a):int(band[1] * a), :] = False
    for i, img in src:
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        feat = cam.features(gray)
        if prev is not None:
            pgray, pfeat = prev
            models, _ = cam.models(pfeat, feat)
            v1 = grid_disp(models[0], src.aw, src.ah) / a if models else float('nan')
            v2 = grid_disp(models[1], src.aw, src.ah) / a if len(models) > 1 else 0.0
            flow = cv2.calcOpticalFlowFarneback(pgray, gray, None, 0.5, 5, 21, 3, 7, 1.5, 0)
            back = cv2.calcOpticalFlowFarneback(gray, pgray, None, 0.5, 5, 21, 3, 7, 1.5, 0)
            bx = cv2.remap(back[..., 0], xx + flow[..., 0], yy + flow[..., 1], cv2.INTER_LINEAR)
            by = cv2.remap(back[..., 1], xx + flow[..., 0], yy + flow[..., 1], cv2.INTER_LINEAR)
            consistent = np.hypot(flow[..., 0] + bx, flow[..., 1] + by) < 1.0
            mag = np.hypot(flow[..., 0], flow[..., 1]) / a
            g = cv2.morphologyEx(pgray, cv2.MORPH_GRADIENT, np.ones((3, 3), np.uint8))
            edges = (g > max(12, np.percentile(g, 90))) & consistent & keep_rows
            fast = float(np.percentile(mag[edges], 99)) if edges.any() else 0.0
            rows.append({'i': i - 1, 'cam': v1, 'layer2': v2, 'fast': fast})
        prev = (gray, feat)
    return rows


def runs_over(vals, limit, min_run):
    out = []
    start = None
    for k, v in enumerate(vals + [0]):
        if v > limit and start is None:
            start = k
        elif not (v > limit) and start is not None:
            if k - start >= min_run:
                out.append((start, k - 1))
            start = None
    return out


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('comp', nargs='?', help='composition id (Main, S07, CineDemo, ...)')
    ap.add_argument('t0', nargs='?', type=float, default=None, help='start (composition s; default 0)')
    ap.add_argument('t1', nargs='?', type=float, default=None, help='end (default: the composition end)')
    ap.add_argument('--frames', default=None, help='analyse this frame directory instead of rendering')
    ap.add_argument('--fps', type=float, default=30.0)
    ap.add_argument('--scale', type=float, default=0.5, help='render scale (default 0.5)')
    ap.add_argument('--props', default=None, help='input props JSON for the render')
    ap.add_argument('--limit', type=float, default=None, help='px / frame limit (default MOTION.camera.peakPxPerFrame)')
    ap.add_argument('--dv-limit', type=float, default=2.5, help='max camera speed step, px / frame per frame (default 2.5)')
    ap.add_argument('--min-run', type=int, default=2, help='frames above the limit before it counts (default 2)')
    ap.add_argument('--allow', default=None, help='extra allowed windows: t0-t1[,t0-t1...] (composition s)')
    ap.add_argument('--no-transitions', action='store_true', help='do not allow-list Film transitions')
    ap.add_argument('--chart', default=None, help='write a speed chart PNG')
    ap.add_argument('--json', default=None, help='write per-frame numbers as JSON')
    ap.add_argument('--keep', action='store_true', help='keep the rendered frames (prints the directory)')
    ap.add_argument('--keep-captions', action='store_true', help='include the caption band (y 280-600) in the edge motion')
    ap.add_argument('--strict-edges', action='store_true', help='fast LOCAL motion fails too (default: a warning)')
    o = ap.parse_args(argv)
    limit = o.limit if o.limit is not None else spec_peak()
    t0 = o.t0 or 0.0
    tmp = None
    if o.frames:
        src_dir = o.frames
    else:
        if not o.comp:
            ap.error('give a composition id or --frames')
        t1 = o.t1 if o.t1 is not None else (comp_duration(o.comp) or 0) - 1 / 30
        if t1 <= t0:
            ap.error('cannot tell the composition length: pass t0 t1')
        tmp = tempfile.mkdtemp(prefix='camspeed.')
        src_dir = tmp
        render(o.comp, t0, t1, o.scale, tmp, o.props)
    src = Q.FrameSource(src_dir, fps=o.fps, analysis=0.5)
    rows = analyse(src, None if o.keep_captions else (280, 600))
    fps = src.fps
    for r in rows:
        r['t'] = t0 + r['i'] / fps
    allow = [] if o.no_transitions or not o.comp else transition_windows(o.comp)
    if o.allow:
        for part in o.allow.split(','):
            m = re.match(r'\s*(-?[\d.]+)\s*-\s*(-?[\d.]+)\s*$', part)
            if not m:
                ap.error(f'bad --allow window: {part!r} (t0-t1)')
            allow.append((float(m.group(1)), float(m.group(2)), 'allow'))
    allowed = lambda t: any(a - 1 / fps <= t <= b + 1 / fps for (a, b, _) in allow)  # noqa: E731
    cam = [r['cam'] if r['cam'] == r['cam'] else 0.0 for r in rows]
    fast = [r['fast'] for r in rows]
    problems = []
    warnings = []
    for name, vals, out in (('camera', cam, problems), ('fast local motion', fast, problems if o.strict_edges else warnings)):
        masked = [0.0 if allowed(rows[k]['t']) else v for k, v in enumerate(vals)]
        for (a, b) in runs_over(masked, limit, o.min_run):
            pk = max(vals[a:b + 1])
            why = 'flat ink strobes' if name == 'camera' else 'check it is a designed rise / pop / wipe (optical flow also misreads grids of identical windows switching)'
            out.append(f'{name} {pk:.1f} px/frame > {limit:g} at {rows[a]["t"]:.2f}-{rows[b]["t"]:.2f} s ({b - a + 1} frames): {why}')
    for k in range(1, len(cam)):
        dv = cam[k] - cam[k - 1]
        r = rows[k]
        r['dv'] = dv
        if rows[k - 1]['cam'] != rows[k - 1]['cam'] or r['cam'] != r['cam']:
            continue
        if abs(dv) > o.dv_limit and not allowed(r['t']) and not allowed(rows[k - 1]['t']):
            kind = 'slam / stall' if dv < 0 else 'whip / jolt'
            problems.append(f'camera speed step {cam[k - 1]:.1f} -> {cam[k]:.1f} px/frame at {r["t"]:.2f} s ({kind}: velocity not continuous)')
    pk_cam = max(cam) if cam else 0
    pk_fast = max(fast) if fast else 0
    print(f'[camspeed] {o.comp or src_dir} {t0:.2f}-{rows[-1]["t"] if rows else t0:.2f} s, {len(rows)} frame pairs; limit {limit:g} px/frame, dv {o.dv_limit:g}')
    print(f'  camera peak {pk_cam:.1f} px/frame, fastest edge motion peak {pk_fast:.1f} px/frame (allow-listed windows included)')
    tl = rows[-1]['t'] if rows else t0
    for (a, b, why) in allow:
        if b >= t0 and a <= tl:
            print(f'  allowed {a:.2f}-{b:.2f} s  {why}')
    for p in problems:
        print('  FAIL ' + p)
    for p in warnings:
        print('  WARN ' + p)
    if not problems:
        print('  OK: no strobing speed and no velocity step outside the allowed windows')
    if o.json:
        json.dump({'limit': limit, 'rows': rows, 'allow': allow, 'problems': problems, 'warnings': warnings}, open(o.json, 'w'), indent=1)
    if o.chart and rows:
        import matplotlib
        matplotlib.use('Agg')
        import matplotlib.pyplot as plt
        ts = [r['t'] for r in rows]
        fig, ax = plt.subplots(figsize=(12, 3.6))
        for (a, b, _) in allow:
            ax.axvspan(a, b, color='#dddddd')
        ax.plot(ts, cam, label='camera px/f', color='#3E605F')
        ax.plot(ts, [r['layer2'] for r in rows], label='parallax layer px/f', color='#709F8B', lw=0.8)
        ax.plot(ts, fast, label='fastest edges (p99) px/f', color='#EC6B2E', lw=0.8)
        ax.axhline(limit, color='#B03030', ls='--', lw=0.8)
        ax.set_xlim(ts[0], ts[-1])
        ax.set_xlabel('s')
        ax.legend(loc='upper right', fontsize=8)
        fig.tight_layout()
        fig.savefig(o.chart, dpi=110)
        print(f'  chart {o.chart}')
    if tmp:
        if o.keep:
            print(f'  frames {tmp}')
        else:
            shutil.rmtree(tmp, ignore_errors=True)
    return 1 if problems else 0


if __name__ == '__main__':
    sys.exit(main())
