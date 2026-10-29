"""Sound-off cold-read sheet for a board animatic: one frame per panel at its middle, plus the opening at fixed times,
each labelled only with a number (the notes strip is cropped off so the director's notes don't give the answer).
STORYBOARD_STYLE §3 sampling: a sample never lands inside a caption page's 2-frame pop (it moves to 0.08 s after the
page starts), and a scale panel with an animated camera (shot "scale": true) gives its start AND landing frames.

  python3 scripts/v2/coldread_sheet.py [public/v2/animatic.json] [out_dir]

Writes <out_dir>/sheet.jpg and <out_dir>/index.json ({"n": {"panel": id, "t": seconds, "what": ...}}). Renders with
scripts/render-frames.mjs (one bundle, one browser) from src/entry-v2.tsx at 0.25 scale.

It does not run since 2026-10-29: src/entry-v2.tsx is archived in archive/v2-first/src/. Give it --entry and an
animatic argument before any reuse (F2 in docs/retro/2026-10-28_streamline/codebase.md)."""
import json
import os
import subprocess
import sys
import tempfile

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SRC = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, 'public', 'v2', 'animatic.json')
OUT = sys.argv[2] if len(sys.argv) > 2 else '/tmp/claude-0/-home-user-Test-/59905704-1101-50eb-baa8-b5e4e9d5d2d2/scratchpad/v2coldread'
OPENING = [0.3, 1.2, 2.0, 3.0, 5.0]
SCALE = 0.25
NOTES_TOP = 1680  # the notes strip (cropped off)

d = json.load(open(SRC))
frames = [{'t': t, 'panel': d['shots'][0]['id'], 'what': f'opening at {t} s'} for t in OPENING]
o1 = d['shots'][0]
mid0 = round((o1['s'] + o1['e']) / 2, 2)
near = min(frames, key=lambda f: abs(f['t'] - mid0))
if abs(near['t'] - mid0) < 0.2:  # the opening already has a frame at O1's middle
    near['what'] += f' (= {o1["id"]} middle)'
else:
    frames.append({'t': mid0, 'panel': o1['id'], 'what': 'panel middle'})
for s in d['shots'][1:]:
    cam = s.get('camera', {})
    if s.get('scale') and cam.get('from') != cam.get('to'):
        land = min(s['e'] - 0.05, cam.get('end', s['e']) + 0.1)
        frames.append({'t': round(s['s'] + 0.1, 2), 'panel': s['id'], 'what': 'big move: start frame'})
        frames.append({'t': round(land, 2), 'panel': s['id'], 'what': 'big move: landing frame'})
    else:
        frames.append({'t': round((s['s'] + s['e']) / 2, 2), 'panel': s['id'], 'what': 'panel middle'})


def page_starts(words, max_chars=16):
    """caption page start times, paged like SketchReel's pages() (16 chars, a new page after a sentence end)"""
    out, cur = [], []
    for w in words:
        n = sum(len(x['w']) + 1 for x in cur) + len(w['w'])
        if cur and (n > max_chars or cur[-1]['w'][-1:] in '.?!'):
            out.append(cur[0]['s'])
            cur = []
        cur.append(w)
    if cur:
        out.append(cur[0]['s'])
    return out[1:]  # the first page shows from frame 0 without a pop


POPS = page_starts(d['words'])
for f in frames:
    hit = [p for p in POPS if f['t'] - 0.07 < p <= f['t']]
    if hit:
        f['t'] = round(max(hit) + 0.08, 2)
frames.sort(key=lambda f: f['t'])

os.makedirs(OUT, exist_ok=True)
with tempfile.TemporaryDirectory() as tmp:
    times = ','.join(f'{f["t"]:.3f}' for f in frames)
    # v2's first entry, archived since 2026-10-29 in archive/v2-first/src/ (see the docstring)
    res = subprocess.run(['node', 'scripts/render-frames.mjs', 'Animatic', tmp, times, f'--scale={SCALE}', '--entry=src/entry-v2.tsx'],
                         cwd=ROOT, capture_output=True, text=True, check=True)
    files = [ln.split()[2] for ln in res.stdout.splitlines() if len(ln.split()) == 3 and ln.split()[2].endswith(('.png', '.jpeg', '.jpg'))]
    assert len(files) == len(frames), (len(files), len(frames), res.stdout[-500:])
    args = []
    for i, (f, path) in enumerate(zip(frames, files), 1):
        crop = os.path.join(tmp, f'c{i:02d}.png')
        subprocess.run(['convert', path, '-crop', f'{int(1080 * SCALE)}x{int(NOTES_TOP * SCALE)}+0+0', '+repage', crop], check=True)
        args += ['-label', str(i), crop]
    sheet = os.path.join(OUT, 'sheet.jpg')
    subprocess.run(['montage', *args, '-tile', '7x', '-geometry', '+6+6', '-pointsize', '22', '-background', 'white', '-quality', '88', sheet],
                   check=True)
index = {str(i): {'panel': f['panel'], 't': f['t'], 'what': f['what']} for i, f in enumerate(frames, 1)}
json.dump(index, open(os.path.join(OUT, 'index.json'), 'w'), indent=1)
print('wrote', sheet, len(frames), 'frames')
