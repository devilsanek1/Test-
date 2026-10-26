"""Side-by-side check sheets for the cinematic guidebook: each shot type's 9:16 sketch (our drawing) next to the reference
frames it was translated from, so the owner can see what we index on. The reference frames come from copyrighted
footage: sheets go to the scratchpad and to the owner in chat only, never into the repo.
Usage: python3 scripts/look/sketch_debug.py SKETCHES_JSON SKETCH_PNG_DIR REFERENCE_VIDEO OUTDIR [--per 3]
(sketch PNGs named <id>.png, e.g. V1.png; each sketch's "refs" field holds "@<seconds>" timestamps)
"""
import argparse
import json
import re
from pathlib import Path

import cv2
import numpy as np

H = 760  # row height


def frame_at(cap, t, w):
    cap.set(cv2.CAP_PROP_POS_MSEC, t * 1000)
    ok, f = cap.read()
    if not ok:
        return np.full((int(w / 2.36), w, 3), 230, np.uint8)
    return cv2.resize(f, (w, int(f.shape[0] * w / f.shape[1])), interpolation=cv2.INTER_AREA)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('sketches')
    ap.add_argument('pngs')
    ap.add_argument('video')
    ap.add_argument('out')
    ap.add_argument('--per', type=int, default=3)
    a = ap.parse_args()
    data = json.loads(Path(a.sketches).read_text())['sketches']
    cap = cv2.VideoCapture(a.video)
    out = Path(a.out)
    out.mkdir(parents=True, exist_ok=True)
    rows = []
    for sk in data:
        sid = sk['shot']['id']
        img = cv2.imread(str(Path(a.pngs) / f'{sid}.png'))
        if img is None:
            continue
        sw = int(img.shape[1] * H / img.shape[0])
        sketch = cv2.resize(img, (sw, H), interpolation=cv2.INTER_AREA)
        times = [float(x) for x in re.findall(r'@\s*([\d.]+)', sk.get('refs', ''))][:2]
        rw = 900
        refs = [frame_at(cap, t + 0.5, rw) for t in times] or [np.full((380, rw, 3), 230, np.uint8)]
        right = np.full((H, rw, 3), 255, np.uint8)
        y = 40
        for t, r in zip(times or [0], refs):
            h = min(r.shape[0], H - y - 10)
            right[y:y + h] = r[:h]
            cv2.putText(right, f'Arcane ref @ {t:.1f} s', (8, y - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 0, 0), 2, cv2.LINE_AA)
            y += h + 50
        cv2.putText(right, sk['name'], (8, H - 20), cv2.FONT_HERSHEY_SIMPLEX, 1.0, (40, 40, 160), 2, cv2.LINE_AA)
        rows.append(np.hstack([sketch, np.full((H, 20, 3), 255, np.uint8), right]))
    for i in range(0, len(rows), a.per):
        chunk = rows[i:i + a.per]
        w = max(r.shape[1] for r in chunk)
        chunk = [np.hstack([r, np.full((H, w - r.shape[1], 3), 255, np.uint8)]) for r in chunk]
        sheet = np.vstack([np.vstack([r, np.full((24, w, 3), 200, np.uint8)]) for r in chunk])
        cv2.imwrite(str(out / f'check_{i // a.per + 1:02d}.jpg'), sheet, [cv2.IMWRITE_JPEG_QUALITY, 85])
    print(f'{len(rows)} rows -> {out}')


if __name__ == '__main__':
    main()
