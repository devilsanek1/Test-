"""Measure the camera language of a reference video, shot by shot (for turning reference moves into our 2D camera presets).

For each shot: start / duration, the camera move fitted frame to frame (optical flow -> similarity transform: pan, tilt,
zoom, roll), its speed profile and easing, and parallax (do foreground and background move at different speeds?).
Writes <out>/camera.json, <out>/camera.md (table) and <out>/shots.png (one thumbnail per shot with its speed curve).

Copyrighted references (e.g. Arcane) stay out of the repo: write outputs to the scratchpad, commit only the numbers.
Usage: python3 scripts/look/measure_camera.py VIDEO OUTDIR [--width 360] [--cut 0.55]
"""
import argparse
import json
import math
from pathlib import Path

import cv2
import numpy as np


def frames(path, width):
    cap = cv2.VideoCapture(str(path))
    fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
    while True:
        ok, f = cap.read()
        if not ok:
            break
        h = int(f.shape[0] * width / f.shape[1])
        yield fps, cv2.resize(f, (width, h), interpolation=cv2.INTER_AREA)
    cap.release()


def hist(f):
    hsv = cv2.cvtColor(f, cv2.COLOR_BGR2HSV)
    h = cv2.calcHist([hsv], [0, 1], None, [32, 16], [0, 180, 0, 256])
    return cv2.normalize(h, h).flatten()


def step(prev, cur):
    """similarity transform prev -> cur: (dx, dy, log scale, rotation deg, inlier flows for parallax)"""
    pts = cv2.goodFeaturesToTrack(prev, maxCorners=400, qualityLevel=0.01, minDistance=7)
    if pts is None or len(pts) < 12:
        return None
    nxt, st, _ = cv2.calcOpticalFlowPyrLK(prev, cur, pts, None, winSize=(21, 21), maxLevel=3)
    good = st.ravel() == 1
    p0, p1 = pts[good].reshape(-1, 2), nxt[good].reshape(-1, 2)
    if len(p0) < 12:
        return None
    m, inl = cv2.estimateAffinePartial2D(p0, p1, method=cv2.RANSAC, ransacReprojThreshold=1.5)
    if m is None:
        return None
    s = math.hypot(m[0, 0], m[1, 0])
    rot = math.degrees(math.atan2(m[1, 0], m[0, 0]))
    return m[0, 2], m[1, 2], math.log(s), rot, p0, p1, inl.ravel().astype(bool)


def easing(speed):
    """classify a speed profile (one value per frame)"""
    if len(speed) < 6 or speed.max() < 1e-6:
        return 'static'
    sp = np.convolve(speed, np.ones(5) / 5, mode='same')
    n = len(sp)
    peak = int(np.argmax(sp)) / max(1, n - 1)
    a, b, c = sp[: n // 4].mean(), sp[n // 4: 3 * n // 4].mean(), sp[3 * n // 4:].mean()
    cv = sp.std() / (sp.mean() + 1e-9)
    if cv < 0.25:
        return 'constant'
    if a < 0.5 * b and c < 0.5 * b:
        return f'ease-in-out (peak at {peak:.0%})'
    if a < 0.6 * c:
        return 'ease-in (accelerates)'
    if c < 0.6 * a:
        return 'ease-out (settles)'
    return f'uneven (peak at {peak:.0%})'


def label(pan_x, pan_y, zoom, roll):
    """name the move from totals (image motion is opposite to camera motion for pans)"""
    parts = []
    if abs(zoom) > 0.04:
        parts.append('push-in' if zoom > 0 else 'pull-out')
    if abs(pan_x) > 0.06:
        parts.append('pan right' if pan_x < 0 else 'pan left')
    if abs(pan_y) > 0.06:
        parts.append('tilt down' if pan_y < 0 else 'tilt up / crane up')
    if abs(roll) > 2:
        parts.append(f'roll {roll:+.0f}°')
    return ' + '.join(parts) or 'locked off'


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('video')
    ap.add_argument('out')
    ap.add_argument('--width', type=int, default=360)
    ap.add_argument('--cut', type=float, default=0.55, help='histogram correlation below this = a cut')
    a = ap.parse_args()
    out = Path(a.out)
    out.mkdir(parents=True, exist_ok=True)

    shots, cur, prev_g, prev_h, fps, thumbs, idx = [], None, None, None, 30.0, [], 0
    for fps, f in frames(a.video, a.width):
        g = cv2.cvtColor(f, cv2.COLOR_BGR2GRAY)
        h = hist(f)
        cut = prev_h is None or cv2.compareHist(prev_h, h, cv2.HISTCMP_CORREL) < a.cut
        if cut and (cur is None or len(cur['steps']) >= 5):
            if cur:
                shots.append(cur)
            cur = {'start': idx, 'steps': [], 'par': []}
            thumbs.append(f.copy())
        elif prev_g is not None:
            r = step(prev_g, g)
            if r:
                dx, dy, ls, rot, p0, p1, inl = r
                W = g.shape[1]
                cur['steps'].append((dx / W, dy / W, ls, rot))
                # parallax: horizontal flow of the top vs bottom third (background vs foreground in most frames)
                fl = p1 - p0
                top, bot = p0[:, 1] < g.shape[0] / 3, p0[:, 1] > 2 * g.shape[0] / 3
                if top.sum() > 5 and bot.sum() > 5:
                    cur['par'].append((np.median(np.abs(fl[top, 0])), np.median(np.abs(fl[bot, 0]))))
            else:
                cur['steps'].append((0.0, 0.0, 0.0, 0.0))
        prev_g, prev_h = g, h
        idx += 1
    if cur:
        shots.append(cur)

    rows = []
    for i, s in enumerate(shots):
        st = np.array(s['steps']) if s['steps'] else np.zeros((1, 4))
        n = len(st) + 1
        pan_x, pan_y, zoom, roll = st[:, 0].sum(), st[:, 1].sum(), st[:, 2].sum(), st[:, 3].sum()
        speed = np.hypot(st[:, 0], st[:, 1]) + np.abs(st[:, 2])
        jitter = float(np.std(np.diff(st[:, 0])) if len(st) > 3 else 0)
        par = None
        if len(s['par']) > 5:
            t, b = np.array(s['par']).mean(axis=0)
            if max(t, b) > 0.3:
                par = round(float(b / (t + 1e-6)), 2)
        rows.append({
            'shot': i + 1, 'start_s': round(s['start'] / fps, 2), 'dur_s': round(n / fps, 2),
            'move': label(pan_x, pan_y, zoom, roll),
            'pan_x_pct_of_width': round(pan_x * 100, 1), 'pan_y_pct_of_width': round(pan_y * 100, 1),
            'zoom_pct': round((math.exp(zoom) - 1) * 100, 1), 'roll_deg': round(roll, 1),
            'easing': easing(speed), 'handheld_jitter': round(jitter * 1000, 2),
            'parallax_bottom_vs_top': par,
            'speed_curve': [round(float(v), 5) for v in speed[:: max(1, len(speed) // 40)]],
        })

    (out / 'camera.json').write_text(json.dumps({'video': str(a.video), 'fps': fps, 'shots': rows}, indent=1))
    md = ['| # | start | dur | move | pan x / y (% width) | zoom | roll | easing | parallax (fg/bg) |', '|---|---|---|---|---|---|---|---|---|']
    md += [f"| {r['shot']} | {r['start_s']} | {r['dur_s']} | {r['move']} | {r['pan_x_pct_of_width']} / {r['pan_y_pct_of_width']} | {r['zoom_pct']}% | {r['roll_deg']}° | {r['easing']} | {r['parallax_bottom_vs_top'] or '-'} |" for r in rows]
    (out / 'camera.md').write_text('\n'.join(md) + '\n')

    # contact sheet: thumbnail + speed curve per shot
    tw = 160
    tiles = []
    for t, r in zip(thumbs, rows):
        th = cv2.resize(t, (tw, int(t.shape[0] * tw / t.shape[1])))
        plot = np.full((50, tw, 3), 255, np.uint8)
        sc = np.array(r['speed_curve'] or [0])
        if sc.max() > 0:
            ys = 48 - (sc / sc.max() * 44).astype(int)
            xs = np.linspace(2, tw - 3, len(sc)).astype(int)
            for k in range(1, len(sc)):
                cv2.line(plot, (xs[k - 1], ys[k - 1]), (xs[k], ys[k]), (40, 40, 200), 1)
        cv2.putText(plot, f"{r['shot']} {r['dur_s']}s", (3, 12), cv2.FONT_HERSHEY_SIMPLEX, 0.35, (0, 0, 0), 1)
        tiles.append(np.vstack([th, plot]))
    if tiles:
        hmax = max(t.shape[0] for t in tiles)
        tiles = [np.vstack([t, np.full((hmax - t.shape[0], tw, 3), 255, np.uint8)]) for t in tiles]
        cols = 8
        rows_img = [np.hstack(tiles[k:k + cols] + [np.full((hmax, tw, 3), 255, np.uint8)] * (cols - len(tiles[k:k + cols]))) for k in range(0, len(tiles), cols)]
        cv2.imwrite(str(out / 'shots.png'), np.vstack(rows_img))
    print(f'{len(rows)} shots -> {out}/camera.md')


if __name__ == '__main__':
    main()
