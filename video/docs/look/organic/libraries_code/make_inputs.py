"""Make the SAME test inputs for every library: the v6 near cumulus (plane p3) and the near tree, as our designed flats
(paint.py's design stage, never edited), plus v6's own painted pieces and the sky behind the cloud.
Writes only to /tmp/organic/libraries/inputs. Run: venv/bin/python -B src/make_inputs.py"""
import sys, os, json, hashlib
sys.dont_write_bytecode = True
import numpy as np
from PIL import Image

PAINT_DIR = '/home/user/Test-/video/scripts/look/paint'
REPO_PUB = '/home/user/Test-/video/public/paint/v2s1_v6'
OUT = '/tmp/organic/libraries/inputs'
sys.path.insert(0, PAINT_DIR)
import paint as PT  # noqa: E402
SC, FO = PT.SC, PT.FO

spec = json.load(open(os.path.join(PAINT_DIR, 'v2s1_v6.json')))
spec['out'] = OUT  # absolute: os.path.join(ROOT, OUT) == OUT, so nothing lands in the repo
cloud = next(p for p in spec['pieces'] if p['id'] == 'v2s1/clouds')
tree = next(p for p in spec['pieces'] if p['id'] == 'v2s1/tree')
skyp = PT.sky_piece_of(spec)

# ---- the cloud: design flat of the near plane (p3) + its mask, and the painted v6 sky behind it
near = dict(cloud, planes=[pl for pl in cloud['planes'] if pl['name'] == 'p3'])
PT.DESIGN = True
PT.style_cloud_planes(near, spec)            # -> OUT/clouds_p3.png (the flat design, alpha = the mass)
os.replace(os.path.join(OUT, 'clouds_p3.png'), os.path.join(OUT, 'cloud_design.png'))
PT.DESIGN = False
PT.style_cloud_planes(near, spec)            # -> OUT/clouds_p3.png (v6's painting, re-baked here)
os.replace(os.path.join(OUT, 'clouds_p3.png'), os.path.join(OUT, 'cloud_v6_rebake.png'))
sky, pal, design = PT.v6_sky(spec, skyp)
x0, y0, x1, y1 = near['planes'][0]['box']
Image.fromarray(sky.rgb(dither_seed=int(skyp['seed']))[y0:y1, x0:x1]).save(os.path.join(OUT, 'cloud_sky_v6.png'))
Image.fromarray(np.asarray(Image.open(os.path.join(REPO_PUB, 'sky.png')).convert('RGB'))[y0:y1, x0:x1]).save(
    os.path.join(OUT, 'cloud_sky_repo.png'))
Image.open(os.path.join(REPO_PUB, 'clouds_p3.png')).save(os.path.join(OUT, 'cloud_v6.png'))
# the palette the cloud uses (OKLab -> hex), for the libraries' limited palette
pal_hex = {k: PT.ok_hex(v) for k, v in pal.items()}
json.dump(pal_hex, open(os.path.join(OUT, 'cloud_palette.json'), 'w'), indent=1)

# ---- the tree: the flat value zones (foliage.py's P2 'zones' stop) over the wood, in v6's box, v6's seed
bx0, by0, bx1, by1 = tree['box']
w, h = bx1 - bx0, by1 - by0
fx, fy = tree['trunk_foot']
cr = tree['crown']
FO.LIGHT = np.array(spec.get('key', [-0.70, -0.62, 0.36]), np.float64)
FO.LIGHT /= np.linalg.norm(FO.LIGHT)

def tree_layer(stop):
    rng = np.random.default_rng(int(hashlib.sha256(f"{tree['seed']}:tree:paint".encode()).hexdigest()[:8], 16))
    return FO.paint_tree(w, h, (fx - bx0, fy - by0), (cr['c'][0] - bx0, cr['c'][1] - by0), float(cr['W']),
                         float(cr['H']), rng, plane='near', air=None, stop=stop)

def save_layer(lay, name, dl):
    a = lay.alpha(); rgb = lay.rgb()
    if dl:
        lab_ = PT.cielab(rgb); lab_[..., 0] -= dl * (a > 0); rgb = np.clip(PT.cielab_rgb_raw(lab_), 0, 1)
    rgba = np.dstack([np.clip(np.round(rgb * 255), 0, 255), np.clip(np.round(a * 255), 0, 255)]).astype(np.uint8)
    Image.fromarray(rgba, 'RGBA').save(os.path.join(OUT, name))

dl = float(tree.get('value_step', 0.0))
save_layer(tree_layer('zones'), 'tree_design.png', dl)
save_layer(tree_layer('wood'), 'tree_wood.png', dl)
Image.open(os.path.join(REPO_PUB, 'tree.png')).save(os.path.join(OUT, 'tree_v6.png'))
tpal = {k: '#%02x%02x%02x' % tuple(int(round(c * 255)) for c in FO.C(k)) for k in
        ['leaf_deep', 'leaf_shade', 'leaf_mid', 'leaf_lit', 'leaf_accent', 'leaf_amber', 'leaf_rust', 'bark_lit', 'bark_shade']}
json.dump(tpal, open(os.path.join(OUT, 'tree_palette.json'), 'w'), indent=1)
json.dump({'cloud_box': [x0, y0, x1, y1], 'tree_box': [bx0, by0, bx1, by1], 'key': spec.get('key')},
          open(os.path.join(OUT, 'boxes.json'), 'w'), indent=1)
print('ok')
