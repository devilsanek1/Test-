"""Contact sheets for shot-by-shot analysis: after measure_camera.py, take 3 frames per shot (10 %, 50 %, 90 % of the
shot) and tile them, a fixed number of shots per sheet, labelled with shot number, time and the measured move. Analysis
agents look at one sheet each next to camera.json.

Copyrighted references stay out of the repo: write sheets to the scratchpad, commit only the written analysis.
Usage: python3 scripts/look/shot_sheets.py VIDEO CAMERA_JSON OUTDIR [--per 12] [--width 300]
"""
import argparse
import json
from pathlib import Path

import cv2
import numpy as np


def grab(cap, t, box, width):
    cap.set(cv2.CAP_PROP_POS_MSEC, t * 1000)
    ok, f = cap.read()
    if not ok:
        return None
    if box:
        f = f[box[1]:box[3], box[0]:box[2]]
    h = int(f.shape[0] * width / f.shape[1])
    return cv2.resize(f, (width, h), interpolation=cv2.INTER_AREA)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('video')
    ap.add_argument('camera')
    ap.add_argument('out')
    ap.add_argument('--per', type=int, default=12)
    ap.add_argument('--width', type=int, default=300)
    a = ap.parse_args()
    cam = json.loads(Path(a.camera).read_text())
    box = cam.get('crop')
    out = Path(a.out)
    out.mkdir(parents=True, exist_ok=True)
    cap = cv2.VideoCapture(a.video)
    rows, sheets = [], []
    for s in cam['shots']:
        t0, d = s['start_s'], s['dur_s']
        frames = [grab(cap, t0 + d * p, box, a.width) for p in (0.1, 0.5, 0.9)]
        frames = [f for f in frames if f is not None]
        if not frames:
            continue
        strip = np.hstack(frames + [np.full_like(frames[0], 255)] * (3 - len(frames)))
        bar = np.full((34, strip.shape[1], 3), 255, np.uint8)
        cv2.putText(bar, f"#{s['shot']}  {t0:.2f}s  {d:.2f}s  {s['move']}  zoom {s['zoom_pct']}%", (6, 23),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.55, (0, 0, 0), 1, cv2.LINE_AA)
        rows.append(np.vstack([bar, strip]))
        if len(rows) == a.per:
            sheets.append(rows)
            rows = []
    if rows:
        sheets.append(rows)
    for i, rs in enumerate(sheets, 1):
        w = max(r.shape[1] for r in rs)
        rs = [np.hstack([r, np.full((r.shape[0], w - r.shape[1], 3), 255, np.uint8)]) for r in rs]
        cols = 2
        pairs = [np.hstack(rs[k:k + cols] + [np.full_like(rs[0], 255)] * (cols - len(rs[k:k + cols]))) for k in range(0, len(rs), cols)]
        cv2.imwrite(str(out / f'sheet_{i:02d}.jpg'), np.vstack(pairs), [cv2.IMWRITE_JPEG_QUALITY, 82])
    print(f'{len(cam["shots"])} shots -> {len(sheets)} sheets in {out}')


if __name__ == '__main__':
    main()
