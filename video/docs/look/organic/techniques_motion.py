"""The motion check behind docs/look/organic/techniques.md §3.13 (research, 2026-10-30).

A 540 x 540 crop of the v6 still under the parallax float (3 x 1.5 px sine, 4 s, 60 fps, bilinear like the browser's
image draw), encoded with x264 CRF 18; prints kbit/s per variant: v6 as is, the techniques by intent (baked, locked),
the light edge strokes (baked), an LIC texture everywhere, and the same edges re-seeded every frame (boil). From video/:
  python3 docs/look/organic/techniques_motion.py [--out /tmp/organic_motion]
"""
import argparse, json, os, subprocess, sys
import numpy as np, cv2
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import techniques_demo as D

N, FPS, S = 240, 60, 540


def moved(img, i):
    t = i / FPS
    dx, dy = 3.0 * np.sin(2 * np.pi * t / 4.0), 1.5 * np.sin(2 * np.pi * t / 4.0 + 1.0)
    return cv2.warpAffine(img, np.float32([[1, 0, dx], [0, 1, dy]]), (S, S), flags=cv2.INTER_LINEAR,
                          borderMode=cv2.BORDER_REFLECT)


def encode(path, frames):
    p = subprocess.Popen(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'bgr24', '-s', f'{S}x{S}',
                          '-r', str(FPS), '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '18',
                          '-pix_fmt', 'yuv420p', '-threads', '1', path], stdin=subprocess.PIPE)
    for f in frames:
        p.stdin.write(f.tobytes())
    p.stdin.close(); p.wait()
    return os.path.getsize(path) * 8 / (N / FPS) / 1000.0


if __name__ == '__main__':
    ap = argparse.ArgumentParser(); ap.add_argument('--out', default='/tmp/organic_motion'); a = ap.parse_args()
    os.makedirs(a.out, exist_ok=True)
    still = D.load(D.STILL)
    x0, y0, x1, y1 = D.NEAR
    near = still[y0:y1, x0:x1].copy()
    lbl = D.clean_regions(near, k=20, seed=3)
    fx, fy = D.flow_field(near, 17.0)
    variants = {'a_v6': near, 'b_by_intent': D.near_by_intent(near), 'e_edge_strokes': D.near_strokes(near, 14),
                'c_lic_everywhere': D.brush_texture(D.colour_oscillation(near, 9, 0.02, 0.008, 70), 11, fx, fy,
                                                    amp=0.03, length=14, lbl=lbl)}
    res = {}
    for name, img in variants.items():
        res[name] = round(encode(os.path.join(a.out, name + '.mp4'), [D.to8(moved(img, i)) for i in range(N)]))
    res['d_boil'] = round(encode(os.path.join(a.out, 'd_boil.mp4'),
                                 [D.to8(D.edge_teeth_maps(moved(near, i), 1000 + i, 17.0, 8.0, 0.8, 0.5)[0]) for i in range(N)]))
    print(json.dumps(res, indent=1))
