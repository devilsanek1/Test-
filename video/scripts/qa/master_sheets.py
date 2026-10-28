#!/usr/bin/env python3
"""master_sheets.py: contact sheets and join strips FROM A RENDERED MP4 (the master), time-stamped, as JPEG under a size
cap; and exact full-size frames for the image checks (check_depth, check_light's B side is a PNG render, never this).
Frames are decoded with the master's own colour tags (BT.709, limited range -> full-range RGB, accurate rounding), so
what the sheet shows is what a viewer's player shows.

  # one frame every 0.5 s at 0.25 scale, 10 per row:
  python3 -I scripts/qa/master_sheets.py sheet deliverables/v2/v2r_G5_assembly_v1.mp4 out.jpg --every 0.5 --scale 0.25 --cols 10
  #   (a whole 40 s film at 0.25 is ~1 MB at q 50: split it, --from 0 --to 19.5 and --from 20 --to 39.5)
  # one row per join, its frames given as seconds or fN (a frame number), "label=t,t,t;label=t,t,t":
  python3 -I scripts/qa/master_sheets.py strip master.mp4 joins.jpg --scale 0.3 --rows "J1 S1>S2=6.00,6.10,6.20;loop=38.95,f2344,f0"
  # full-size PNGs (canvas px) at these seconds, named f%05d.png:
  python3 -I scripts/qa/master_sheets.py frames master.mp4 /dev/shm/frames 3.0,5.4,7.0
Time t is frame round(t * fps) (Remotion's frame of a second; BUILD.md section 2). --max-kb (default 1000) lowers the JPEG
quality step by step (95 -> 50) until the file fits; it says so when even q 50 is over the cap.
"""
from __future__ import annotations

import argparse
import json
import os
import subprocess
import sys
import tempfile

from PIL import Image, ImageDraw, ImageFont

sys.dont_write_bytecode = True
DECODE = 'scale={w}:{h}:in_color_matrix=bt709:in_range=tv:out_range=pc:flags=accurate_rnd+full_chroma_int+lanczos,format=rgb24'


def probe(mp4: str) -> tuple[int, int, float, int]:
    out = subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-count_packets', '-show_entries',
                          'stream=width,height,r_frame_rate,nb_read_packets', '-of', 'json', mp4],
                         capture_output=True, text=True, check=True).stdout
    s = json.loads(out)['streams'][0]
    num, den = (int(v) for v in s['r_frame_rate'].split('/'))
    return int(s['width']), int(s['height']), num / den, int(s['nb_read_packets'])


def frame_of(tok: str, fps: float, n: int) -> int:
    tok = tok.strip()
    f = int(tok[1:]) if tok.startswith('f') else int(round(float(tok) * fps))
    return max(0, min(n - 1, f))


def extract(mp4: str, frames: list[int], scale: float, outdir: str) -> dict[int, str]:
    """Decode exactly these frame numbers (one ffmpeg pass) to PNGs in outdir; returns {frame: path}."""
    w, h, _, _ = probe(mp4)
    want = sorted(set(frames))
    sel = '+'.join(f'eq(n\\,{f})' for f in want)
    tw, th = int(round(w * scale / 2) * 2), int(round(h * scale / 2) * 2)
    vf = f"select='{sel}'," + DECODE.format(w=tw, h=th)
    pattern = os.path.join(outdir, 'x%05d.png')
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', mp4, '-vf', vf, '-fps_mode', 'passthrough', '-start_number', '0',
                    pattern], check=True)
    got = sorted(p for p in os.listdir(outdir) if p.startswith('x'))
    if len(got) != len(want):
        raise SystemExit(f'expected {len(want)} frames, decoded {len(got)}')
    out = {}
    for f, p in zip(want, got):
        dst = os.path.join(outdir, f'f{f:05d}.png')
        os.replace(os.path.join(outdir, p), dst)
        out[f] = dst
    return out


def font(px: int):
    try:
        return ImageFont.load_default(size=px)
    except TypeError:
        return ImageFont.load_default()


def save_jpeg(img: Image.Image, out: str, max_kb: int) -> tuple[int, int]:
    for q in (95, 90, 85, 80, 75, 70, 65, 60, 55, 50):
        img.save(out, 'JPEG', quality=q, optimize=True, progressive=True)
        kb = os.path.getsize(out) // 1024
        if kb <= max_kb:
            return q, kb
    print(f'WARNING: {out} is {kb} KB at q 50 (cap {max_kb} KB): split it', file=sys.stderr)
    return 50, kb


def tile(rows: list[tuple[str, list[tuple[str, str]]]], fps: float, label_px: int) -> Image.Image:
    """rows: [(row label or '', [(tile label, png path), ...])]; every tile the same size."""
    first = Image.open(rows[0][1][0][1])
    tw, th = first.size
    lab = label_px + 8
    head = lab if any(r[0] for r in rows) else 0
    cols = max(len(r[1]) for r in rows)
    sheet = Image.new('RGB', (cols * tw + (cols - 1) * 4, len(rows) * (th + lab + head) + (len(rows) - 1) * 6), (24, 24, 28))
    d = ImageDraw.Draw(sheet)
    fnt = font(label_px)
    y = 0
    for name, tiles in rows:
        if name:
            d.text((4, y + 3), name, fill=(255, 214, 120), font=fnt)
            y += head
        for i, (text, path) in enumerate(tiles):
            x = i * (tw + 4)
            sheet.paste(Image.open(path).convert('RGB'), (x, y))
            d.text((x + 4, y + th + 3), text, fill=(235, 235, 235), font=fnt)
        y += th + lab + 6
    return sheet


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__.split('\n')[0])
    ap.add_argument('mode', choices=['sheet', 'strip', 'frames'])
    ap.add_argument('mp4')
    ap.add_argument('out')
    ap.add_argument('times', nargs='?', default='', help='frames mode: seconds or fN, comma-separated')
    ap.add_argument('--every', type=float, default=0.5, help='sheet: seconds between frames')
    ap.add_argument('--from', dest='t0', type=float, default=0.0, help='sheet: first second (a multiple of --every)')
    ap.add_argument('--to', dest='t1', type=float, default=1e9, help='sheet: last second (inclusive)')
    ap.add_argument('--scale', type=float, default=0.25)
    ap.add_argument('--cols', type=int, default=10)
    ap.add_argument('--rows', default='', help='strip: "label=t,t,t;label=t,t,t" (t in seconds or fN)')
    ap.add_argument('--label-px', type=int, default=16)
    ap.add_argument('--max-kb', type=int, default=1000)
    a = ap.parse_args()
    w, h, fps, n = probe(a.mp4)
    if a.mode == 'frames':
        os.makedirs(a.out, exist_ok=True)
        frames = [frame_of(t, fps, n) for t in a.times.split(',') if t.strip()]
        for f, p in sorted(extract(a.mp4, frames, 1.0, a.out).items()):
            print(f'{f / fps:.3f} {f} {p}')
        return 0
    with tempfile.TemporaryDirectory(dir=os.environ.get('TMPDIR')) as tmp:
        if a.mode == 'sheet':
            frames, k = [], 0
            while int(round(k * a.every * fps)) <= n - 1 and k * a.every <= a.t1 + 1e-9:
                if k * a.every >= a.t0 - 1e-9:
                    frames.append(int(round(k * a.every * fps)))
                k += 1
            paths = extract(a.mp4, frames, a.scale, tmp)
            items = [(f'{f / fps:5.2f} s  f{f}', paths[f]) for f in frames]
            rows = [('', items[i:i + a.cols]) for i in range(0, len(items), a.cols)]
        else:
            spec = [(r.split('=', 1)[0].strip(), [frame_of(t, fps, n) for t in r.split('=', 1)[1].split(',')])
                    for r in a.rows.split(';') if r.strip()]
            paths = extract(a.mp4, [f for _, fs in spec for f in fs], a.scale, tmp)
            rows = [(name, [(f'{f / fps:5.2f} s  f{f}', paths[f]) for f in fs]) for name, fs in spec]
        img = tile(rows, fps, a.label_px)
        q, kb = save_jpeg(img, a.out, a.max_kb)
        print(f'{a.out}: {img.size[0]}x{img.size[1]}, {sum(len(r[1]) for r in rows)} frames, JPEG q {q}, {kb} KB')
    return 0


if __name__ == '__main__':
    sys.exit(main())
