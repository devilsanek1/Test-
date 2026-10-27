"""Extract a 0.5 s burst (30 fps, 540 px wide) + one native-res mid frame per sample.
Out: frames/<id>_burst.npy (N,H,W,3 uint8 RGB), frames/<id>.png (native mid frame)."""
import subprocess, json, sys, os
import numpy as np

V = '/home/user/Test-/video'
SP = '/tmp/claude-0/-home-user-Test-/e0b06496-a313-5ced-bf0f-bc634eb12744/scratchpad'
OUT = SP + '/retro/hierarchy/frames'
SRC = {
    'v3': V + '/deliverables/v3/v3_g5b.mp4',
    'r1': V + '/assets/ref/reference.mp4',
    'v1': V + '/deliverables/v1/php2shell_final.mp4',
    'c2': SP + '/cozy2/ref.mov',
    'c3': SP + '/cozy3/ref.mov',
}
# crop (fraction l,t,r,b) to drop surrounds: cozy2 photo surround, cozy3 torn mat
CROP = {'c2': (0.06, 0.04, 0.04, 0.03), 'c3': (0.04, 0.03, 0.04, 0.03)}
scenes = json.load(open(V + '/src/v3/film/scenes.json'))
SAMPLES = [('v3_' + s['id'], 'v3', round((s['start'] + s['end']) / 2, 2)) for s in scenes]
SAMPLES += [('r1_%02d' % t, 'r1', t) for t in (3, 9, 16, 24)]
SAMPLES += [('v1_%02d' % t, 'v1', t) for t in (8, 25, 47)]
SAMPLES += [('c2_a', 'c2', 2.0), ('c2_b', 'c2', 5.5), ('c3_a', 'c3', 1.0), ('c3_b', 'c3', 3.2)]


def probe(f):
    o = subprocess.check_output(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries',
                                 'stream=width,height', '-of', 'csv=p=0', f]).decode().strip().split(',')
    return int(o[0]), int(o[1])


def crop_filter(src, w, h):
    if src not in CROP:
        return ''
    l, t, r, b = CROP[src]
    cw, ch = int(w * (1 - l - r)) // 2 * 2, int(h * (1 - t - b)) // 2 * 2
    return 'crop=%d:%d:%d:%d,' % (cw, ch, int(w * l), int(h * t))


def burst(sid, src, t):
    f = SRC[src]
    w, h = probe(f)
    cf = crop_filter(src, w, h)
    # output size: 540 wide, keep aspect
    l, tt, r, b = CROP.get(src, (0, 0, 0, 0))
    cw, ch = w * (1 - l - r), h * (1 - tt - b)
    H = int(round(540 * ch / cw / 2)) * 2
    cmd = ['ffmpeg', '-v', 'error', '-ss', str(max(0, t - 0.25)), '-i', f, '-t', '0.5',
           '-vf', cf + 'fps=30,scale=540:%d:flags=area' % H, '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-']
    raw = subprocess.check_output(cmd)
    arr = np.frombuffer(raw, np.uint8).reshape(-1, H, 540, 3)
    np.save(OUT + '/%s_burst.npy' % sid, arr)
    subprocess.check_call(['ffmpeg', '-v', 'error', '-y', '-ss', str(t), '-i', f, '-frames:v', '1',
                           '-vf', (cf[:-1] if cf else 'null'), OUT + '/%s.png' % sid])
    return arr.shape


if __name__ == '__main__':
    meta = {}
    for sid, src, t in SAMPLES:
        sh = burst(sid, src, t)
        meta[sid] = {'src': src, 't': t, 'shape': list(sh)}
        print(sid, t, sh)
    json.dump(meta, open(OUT + '/meta.json', 'w'), indent=1)
