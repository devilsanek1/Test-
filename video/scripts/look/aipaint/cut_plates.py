#!/usr/bin/env python3
"""Cut the AI-painted plates into the ENGINE's pieces (docs/studies/2026-10-28_city_posters/ai_paint/NOTES.md), so they
go into the scene through lib/paint like any bake: one RGBA PNG per piece, in the SAME box as our v4 design piece and
under that piece's own alpha (our silhouettes, our layout), plus manifest.json. Each piece then sits in its own plane's
group (the sky, the 4 cloud planes in the 'clouds' group, the far roofs and the tower on the far plane, the tree on the
near plane) and the scene draws everything that is ours (her, the people, the door and its sign, Pip, the captions) on
top, crisp.

    python3 scripts/look/aipaint/cut_plates.py --sky out/aipaint/sky/sky_s0.55_seed1029.png \\
        --tree out/aipaint/tree/tree_s0.55_seed1029.png --set v2s1_ai1

Upscaling is Lanczos (PIL). The pier stays our design (v4design's PNG, listed so the set is complete).
--keep-design a,b: those pieces stay OUR design's PNG (the owner's pick, 0.70 without structure control, turned the far
roofs and the tower into a cloud: so the far city stays ours and the AI gives the sky and the clouds).
--edge-repair N: the frame's top N rows of the sky take row N (the model paints a thin darker rim along a canvas edge;
the rule: no paper edge at the top of the frame). The proper fix for production: paint each plate with a bleed margin
beyond the frame, so the model's edge falls outside it.
"""
import argparse, json, os, sys
import numpy as np
from PIL import Image

sys.path.insert(0, os.path.dirname(__file__))
import make_inits as G   # the plate <-> frame geometry (one source)

ROOT = G.ROOT


def crop_padded(img, x, y, w, h):
    """img.crop that repeats the edge where the box leaves the frame (a cloud plane starts at x -40)."""
    a = np.asarray(img)
    H, W = a.shape[:2]
    ys = np.clip(np.arange(y, y + h), 0, H - 1)
    xs = np.clip(np.arange(x, x + w), 0, W - 1)
    return a[ys][:, xs]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--sky', required=True)
    ap.add_argument('--tree')
    ap.add_argument('--set', default='v2s1_ai1')
    ap.add_argument('--edge-repair', type=int, default=0, help='top rows of the sky replaced by the next row')
    ap.add_argument('--keep-design', default='', help='pieces kept from our design, e.g. farroofs,fartower')
    a = ap.parse_args()
    out = os.path.join(ROOT, 'public/paint', a.set)
    os.makedirs(out, exist_ok=True)
    man = json.load(open(os.path.join(G.DESIGN, 'manifest.json')))

    # the plates back at frame scale
    sx, sy, sw, sh = G.SKY_PLATE['frame_rect']
    sky = Image.open(a.sky).convert('RGB').resize((sw, sh), Image.LANCZOS)
    frame = Image.new('RGB', (G.FW, G.FH))
    frame.paste(sky, (sx, sy))
    if a.edge_repair:
        f = np.asarray(frame).copy()
        f[:a.edge_repair] = f[a.edge_repair]
        frame = Image.fromarray(f)
    tree_frame = None
    if a.tree:
        tx, ty, tw, th = G.TREE_PLATE['frame_rect']
        tree_frame = Image.new('RGB', (G.FW, G.FH))
        tree_frame.paste(Image.open(a.tree).convert('RGB').resize((tw, th), Image.LANCZOS), (tx, ty))

    meta_sky = json.load(open(os.path.splitext(a.sky)[0] + '.json')) if os.path.exists(os.path.splitext(a.sky)[0] + '.json') else {}
    meta_tree = json.load(open(os.path.splitext(a.tree)[0] + '.json')) if a.tree and os.path.exists(os.path.splitext(a.tree)[0] + '.json') else {}
    pieces = []
    for p in man['pieces']:
        name = p['id'].split('/')[-1]
        q = dict(p)
        q['id'] = 'v2s1/' + name
        x, y, w, h = p['box']
        src = Image.open(os.path.join(ROOT, 'public', p['src'])).convert('RGBA')
        if src.size != (w, h):
            src = src.resize((w, h), Image.LANCZOS)
        alpha = np.asarray(src)[..., 3]
        if name in a.keep_design.split(','):
            q['painter'] = 'ours (v4 design), kept'
            pieces.append(q)
            continue
        if name in G.SKY_PIECES:
            rgb, m = crop_padded(frame, x, y, w, h), meta_sky
            q['reveal'] = 'wash' if (name == 'sky' or p.get('group')) else 'haze'
        elif name == 'tree' and tree_frame is not None:
            rgb, m = crop_padded(tree_frame, x, y, w, h), meta_tree
            q['reveal'] = 'dab'
        else:
            pieces.append(q)   # ours, unchanged (the pier): the design's own PNG
            continue
        Image.fromarray(np.dstack([rgb, alpha]).astype(np.uint8), 'RGBA').save(os.path.join(out, name + '.png'))
        q['src'] = f'paint/{a.set}/{name}.png'
        q['seed'] = m.get('seed', p['seed'])
        cn = f" + {m['controlnet']} {m['controlnet_conditioning_scale']}" if m.get('controlnet') else ''
        q['painter'] = f"{m.get('model', '?')} img2img strength {m.get('strength', '?')}{cn} seed {m.get('seed', '?')}"
        pieces.append(q)
    json.dump({'film': a.set, 'from_design': 'public/paint/v2s1_v4design/manifest.json',
               'spec': 'scripts/look/aipaint (make_inits.py, sdxl_paint.py, cut_plates.py)', 'pieces': pieces},
              open(os.path.join(out, 'manifest.json'), 'w'), indent=1)
    print(f'{len(pieces)} pieces -> public/paint/{a.set}/')


if __name__ == '__main__':
    main()
