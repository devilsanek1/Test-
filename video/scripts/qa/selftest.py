#!/usr/bin/env python3
"""selftest.py: synthetic checks that the QA tools see what they should (no rendering needed, ~1 min).

  python3 scripts/qa/selftest.py [--keep DIR]

 A  camera only: an ink-and-fill illustration under a 6 % sine push-in + 40 px pan + 0.4 deg roll  -> every frame DEAD
 B  the same camera move + a small disc sliding 5 px/frame                                         -> frames ALIVE
 C  static frame + a slow pipe drawing on at ~1,000 px^2/frame (below the per-frame threshold)     -> ALIVE (slow-motion rule)
 D  static frames with a 1-frame flash at f20 and a blank frame at f40                              -> framecheck: flash + blank errors
Frames are drawn at 2x and downsampled (anti-aliased like the renders), 540x960 like a half-scale render.
"""
import argparse
import json
import os
import shutil
import subprocess
import sys
import tempfile

import cv2
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
W, H = 540, 960
S = 2  # supersampling


def base_art(seed=3):
    rng = np.random.default_rng(seed)
    im = np.full((H * S * 2, W * S * 2, 3), (191, 209, 172), np.uint8)    # sky #ACD1BF (BGR), drawn oversize for the camera
    hh, ww = im.shape[:2]
    cv2.rectangle(im, (0, int(hh * 0.45)), (ww, hh), (203, 225, 240), -1)
    for k in range(40):                                                   # buildings with windows
        x = int(rng.uniform(0, ww)); w = int(rng.uniform(60, 220)); h = int(rng.uniform(200, 900))
        y = int(hh * 0.45)
        col = [(146, 184, 220), (95, 96, 62), (170, 195, 230), (120, 150, 200)][k % 4]
        cv2.rectangle(im, (x, y - h), (x + w, y), col, -1)
        cv2.rectangle(im, (x, y - h), (x + w, y), (15, 27, 43), 4)
        for wy in range(y - h + 30, y - 30, 70):
            for wx in range(x + 20, x + w - 30, 50):
                cv2.rectangle(im, (wx, wy), (wx + 22, wy + 34), (15, 27, 43), 3)
    for k in range(60):                                                   # people (back view blobs)
        x = int(rng.uniform(0, ww)); y = int(rng.uniform(hh * 0.55, hh * 0.95)); r = int(rng.uniform(18, 40))
        cv2.circle(im, (x, y), r, (30, 40, 60), -1)
        cv2.ellipse(im, (x, y + 3 * r), (int(1.6 * r), int(2.2 * r)), 0, 0, 360, (95, 96, 62), -1)
        cv2.ellipse(im, (x, y + 3 * r), (int(1.6 * r), int(2.2 * r)), 0, 0, 360, (15, 27, 43), 3)
    cv2.circle(im, (ww // 2, int(hh * 0.42)), 200, (46, 107, 238), -1)  # the sun
    return im


def camera(t, T):
    p = 0.5 - 0.5 * np.cos(np.pi * min(1.0, t / T))
    return 1.0 + 0.06 * p, 40 * p, 0.4 * p   # zoom, pan px (output), roll deg


def frame_from(art, zoom, pan, roll, extra=None):
    hh, ww = art.shape[:2]
    c = (ww / 2, hh / 2)
    M = cv2.getRotationMatrix2D(c, roll, zoom * 2.0)          # art is 2x oversize relative to the supersampled frame
    M[:, 2] += np.array([W * S / 2 - c[0], H * S / 2 - c[1]]) + np.array([pan * S, 0])
    big = cv2.warpAffine(art, M, (W * S, H * S), flags=cv2.INTER_AREA if zoom < 1 else cv2.INTER_LINEAR)
    if extra:
        extra(big)
    return cv2.resize(big, (W, H), interpolation=cv2.INTER_AREA)


def write(d, frames):
    os.makedirs(d, exist_ok=True)
    for i, f in enumerate(frames):
        cv2.imwrite(os.path.join(d, f'f{i:05d}.png'), f)


def run(cmd):
    r = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
    return r.stdout


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--keep', default=None)
    args = ap.parse_args()
    root = args.keep or tempfile.mkdtemp(prefix='qa-selftest-')
    art = base_art()
    N = 60
    A = [frame_from(art, *camera(i, 45)) for i in range(N)]

    def disc(i):
        return lambda big: cv2.circle(big, (int((200 + 5 * i) * S), int(1150)), 26 * S // 2 * 2, (60, 60, 200), -1)
    B = [frame_from(art, *camera(i, 45), extra=disc(i)) for i in range(N)]
    still = frame_from(art, 1.0, 0, 0)

    def pipe(i):
        def f(big):
            L = 40 + 22 * i      # grows ~11 px/frame at 540 wide (~22 canvas px; x 10 px thick = ~1,000 canvas px^2/frame)
            cv2.line(big, (100 * S, 300 * S), (100 * S + L * S // 2, 300 * S + L * S // 6), (255, 255, 255), 6 * S)
        return f
    Cf = [frame_from(art, 1.0, 0, 0, extra=pipe(i)) for i in range(N)]
    Df = [still.copy() for _ in range(N)]
    Df[20] = frame_from(art, 1.0, 0, 0, extra=lambda big: cv2.rectangle(big, (100 * S, 900 * S), (400 * S, 1300 * S), (0, 0, 255), -1))
    Df[40] = np.full_like(still, 240)
    # E: an ink caption on flat sky (frames 0-29), then the same caption over dark busy detail (30-59)
    def cap(big, busy):
        if busy:
            for k in range(0, W * S, 14):
                cv2.line(big, (k, 330 * S // 1), (k + 60, 560 * S // 1), (60, 70, 50), 6)
        for row, text in ((387, 'Government sites'), (510, 'switched off')):
            cv2.putText(big, text, (110 * S // 2, row * S // 2), cv2.FONT_HERSHEY_DUPLEX, 2.6, (15, 27, 43), 7, cv2.LINE_AA)
    Ef = [frame_from(art, 1.0, 0, 0, extra=(lambda big, b=(i >= 30): cap(big, b))) for i in range(N)]
    for name, fr in (('A', A), ('B', B), ('C', Cf), ('D', Df), ('E', Ef)):
        write(os.path.join(root, name), fr)
    ok = True
    res = {}
    for name in ('A', 'B', 'C'):
        out = os.path.join(root, f'rep{name}')
        run([sys.executable, os.path.join(HERE, 'deadframes.py'), os.path.join(root, name), '--scenes', 'none', '--out', out, '--quiet', '--no-chart'])
        rep = json.load(open(os.path.join(out, 'deadframes.json')))
        dead = rep['scenes'][0]['dead_frames']
        res[name] = (dead, rep['frames'])
    fc_out = os.path.join(root, 'repD')
    run([sys.executable, os.path.join(HERE, 'framecheck.py'), os.path.join(root, 'D'), '--scenes', 'none', '--out', fc_out, '--quiet', '--sheet', '0'])
    fc = json.load(open(os.path.join(fc_out, 'framecheck.json')))
    kinds = sorted({(i['kind'], i['f0']) for i in fc['issues'] if i['severity'] == 'error'})
    fe_out = os.path.join(root, 'repE')
    run([sys.executable, os.path.join(HERE, 'framecheck.py'), os.path.join(root, 'E'), '--scenes', 'none', '--out', fe_out, '--quiet', '--sheet', '0', '--no-ui-zones'])
    fe = json.load(open(os.path.join(fe_out, 'framecheck.json')))
    cap_err = [(i['f0'], i['f1']) for i in fe['issues'] if i['kind'] == 'caption' and i['severity'] == 'error']
    checks = [
        ('A camera only -> all dead', res['A'][0] == res['A'][1] - 1, f"{res['A'][0]}/{res['A'][1] - 1} measured frames dead"),
        ('B camera + moving disc -> alive', res['B'][0] <= 2, f"{res['B'][0]} dead frames"),
        ('C slow pipe draw-on -> alive', res['C'][0] <= 4, f"{res['C'][0]} dead frames (the first 3 need the 4-frame window)"),
        ('D flash at f20 + blank at f40', ('flash', 20) in kinds and ('blank', 40) in kinds, f"errors: {kinds}"),
        ('E caption: clean on sky, ERROR over dark detail', cap_err == [(30, 59)] and fe['summary']['caption_frames'] == 60,
         f"caption errors {cap_err}, glyphs found in {fe['summary']['caption_frames']}/60 frames"),
    ]
    for name, good, msg in checks:
        print(f"{'PASS' if good else 'FAIL'}  {name}: {msg}")
        ok &= good
    if not args.keep:
        shutil.rmtree(root, ignore_errors=True)
    return 0 if ok else 1


if __name__ == '__main__':
    sys.exit(main())
