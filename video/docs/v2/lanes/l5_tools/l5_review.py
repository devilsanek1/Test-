#!/usr/bin/env python3
"""L5 review files for V2S6 / V2S7 (brief_L5.md item 3). Run from /home/user/Test-/video:
  python3 -I <this> <outdir> [--skip-clip] [--only V2S6|V2S7]
Makes, per shot: stills at 6+ key times (0.5 scale) -> 216 px strip beside reference 1 / v1 frames (one montage),
one full-size 1080x1920 key frame, a motion strip (10 frames 0.1 s apart from the busiest second); then the
0.5-scale clip WITH voice (Film2R frames 23.80-32.93) and density.py + deadframes.py on it.
"""
import json, os, subprocess, sys, glob
from PIL import Image, ImageDraw

SCRATCH = '/tmp/claude-0/-home-user-Test-/5b04204c-6c47-55d3-9e18-d0defeafecc8/scratchpad'
ENTRY = 'src/entry-v2r-film.tsx'
SHOTS = {
    'V2S6': {'start': 24.0, 'keys': [0.03, 0.12, 1.2, 2.4, 2.55, 3.1, 3.5, 4.0], 'full': 2.6, 'busy': 2.4},
    'V2S7': {'start': 28.06, 'keys': [0.12, 0.3, 1.2, 1.98, 2.24, 3.2, 4.02, 4.6], 'full': 4.1, 'busy': 1.6},
}
REF1 = [5, 9, 13, 17, 21, 25]
V1 = [6, 14, 22, 30, 38, 46]


def run(cmd, env=None):
    e = dict(os.environ)
    if env:
        e.update(env)
    print('$', ' '.join(cmd), flush=True)
    r = subprocess.run(cmd, env=e, capture_output=True, text=True)
    if r.returncode != 0:
        print(r.stdout[-2000:], r.stderr[-2000:])
        raise SystemExit(f'failed: {cmd[:3]}')
    return r.stdout


def render(comp, out, times, scale):
    os.makedirs(out, exist_ok=True)
    txt = run(['node', 'scripts/render-frames.mjs', comp, out, ','.join(f'{t:.4f}' for t in times), f'--entry={ENTRY}', f'--scale={scale}'], {'GL': 'angle'})
    files = []
    for line in txt.splitlines():
        parts = line.split()
        if len(parts) == 3 and parts[2].endswith('.png'):
            files.append(parts[2])
    return files


def w216(path):
    im = Image.open(path).convert('RGB')
    return im.resize((216, round(im.height * 216 / im.width)), Image.LANCZOS)


def label(im, text):
    d = ImageDraw.Draw(im)
    d.rectangle([0, 0, im.width, 14], fill=(255, 255, 255))
    d.text((3, 1), text, fill=(0, 0, 0))
    return im


def row(images, h=None):
    h = h or max(i.height for i in images)
    W = sum(i.width for i in images) + 4 * (len(images) - 1)
    out = Image.new('RGB', (W, h), (255, 255, 255))
    x = 0
    for i in images:
        out.paste(i, (x, 0))
        x += i.width + 4
    return out


def main():
    outdir = sys.argv[1]
    skip_clip = '--skip-clip' in sys.argv
    only = sys.argv[sys.argv.index('--only') + 1] if '--only' in sys.argv else None
    os.makedirs(outdir, exist_ok=True)
    report = {}
    for sid, s in SHOTS.items():
        if only and sid != only:
            continue
        d = os.path.join(outdir, sid)
        keys = render(f'Film2R-{sid}', os.path.join(d, 'keys'), s['keys'], 0.5)
        ours = [label(w216(f), f'{sid} {t:.2f}') for f, t in zip(keys, s['keys'])]
        refs = [label(w216(f'{SCRATCH}/ref1/r_{i:03d}.png'), f'ref1 {i}s') for i in REF1]
        v1 = [label(w216(f'{SCRATCH}/v1/v_{i:03d}.png'), f'v1 {i}s') for i in V1]
        r0, r1, r2 = row(ours), row(refs), row(v1)
        W = max(r0.width, r1.width, r2.width)
        sheet = Image.new('RGB', (W, r0.height + r1.height + r2.height + 16), (255, 255, 255))
        sheet.paste(r0, (0, 0))
        sheet.paste(r1, (0, r0.height + 8))
        sheet.paste(r2, (0, r0.height + r1.height + 16))
        p216 = os.path.join(outdir, f'{sid}_216_vs_refs.png')
        sheet.save(p216)
        full = render(f'Film2R-{sid}', os.path.join(d, 'full'), [s['full']], 1.0)
        pfull = os.path.join(outdir, f'{sid}_full_{s["full"]:.2f}.png')
        os.replace(full[0], pfull)
        strip_t = [s['busy'] + 0.1 * k for k in range(10)]
        strip = render(f'Film2R-{sid}', os.path.join(d, 'strip'), strip_t, 0.5)
        ims = [label(w216(f), f'{t:.1f}') for f, t in zip(strip, strip_t)]
        pstrip = os.path.join(outdir, f'{sid}_motion_strip.png')
        row(ims).save(pstrip)
        report[sid] = {'montage_216': p216, 'full': pfull, 'strip': pstrip, 'keys': keys}
    if not skip_clip and not only:
        clip = os.path.join(outdir, 'S6S7_half_voice.mp4')
        run(['npx', 'remotion', 'render', ENTRY, 'Film2R', clip, '--frames=1428-1976', '--gl=angle', '--concurrency=2', '--scale=0.5', '--log=error'])
        scenes = os.path.join(outdir, 'clip_scenes.json')
        json.dump({'scenes': [{'id': 'V2S5', 'start': 0.0, 'end': 0.2}, {'id': 'V2S6', 'start': 0.2, 'end': 4.26}, {'id': 'V2S7', 'start': 4.26, 'end': 9.15, 'transitions': [[8.9, 9.15, 'wipe']]}]}, open(scenes, 'w'))
        dens = run(['python3', '-I', 'scripts/qa/density.py', clip, '--scenes', scenes, '--cozy', '--json', os.path.join(outdir, 'density.json')])
        open(os.path.join(outdir, 'density.txt'), 'w').write(dens)
        dead = run(['python3', '-I', 'scripts/qa/deadframes.py', clip, '--scenes', scenes, '--out', os.path.join(outdir, 'deadframes')])
        open(os.path.join(outdir, 'deadframes.txt'), 'w').write(dead)
        report['clip'] = clip
        report['density'] = os.path.join(outdir, 'density.txt')
        report['deadframes'] = os.path.join(outdir, 'deadframes.txt')
    json.dump(report, open(os.path.join(outdir, 'review.json'), 'w'), indent=1)
    print(json.dumps(report, indent=1))


if __name__ == '__main__':
    main()
