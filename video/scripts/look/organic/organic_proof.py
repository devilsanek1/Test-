"""organic_proof.py: the ORGANIC PROOF's driver (docs/look/organic/organic_proof.md). Stills only (the owner: "Again
let's start with stills", "No video yet"). Four v6 pieces repainted so they stop reading "square and proper": the near
cumulus (piece_cloud), the near tree (piece_tree), the facade by the doorway (piece_facade), the paving of our bank
(piece_paving); placed by the engine in their own slots (src/look/organic_s1), her, Pip, the props and the captions
drawn over them by the scene, crisp.
  python3 scripts/look/organic/organic_proof.py            # everything: inputs, bake, after frames, numbers, sheet
  python3 scripts/look/organic/organic_proof.py --bake     # the four pieces only (+ the engine's copies)
  python3 scripts/look/organic/organic_proof.py --sheet    # the numbers and the sheet from what is there
  python3 scripts/look/organic/organic_proof.py --check    # bake twice into the scratch, compare the bytes (md5)
Needs (outside the repo, nothing installs into it): pyfastnoiselite 0.0.7 (MIT) in a venv, peinten 1.3.0 (MIT) and
the CC0 mypaint-brushes 2.0.2 under OC_SCRATCH (default /tmp/organic/organic_proof): organic_proof.md "Rerun"."""
from __future__ import annotations

import argparse
import hashlib
import json
import os
import shutil
import subprocess
import sys
import time

import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import oc_lib as L  # noqa: E402
import piece_cloud  # noqa: E402
import piece_tree  # noqa: E402
import piece_facade  # noqa: E402
import piece_paving  # noqa: E402

ENGINE_PAINT = os.path.join(L.VIDEO, 'src', 'look', 'organic_s1', 'paint')
RENDERS = os.path.join(L.SCRATCH, 'renders')
PIECES = {'cloud': piece_cloud, 'tree': piece_tree, 'facade': piece_facade, 'paving': piece_paving}


def md5(path):
    return hashlib.md5(open(path, 'rb').read()).hexdigest()


def ensure_renders(after=False):
    need = ['v6', 'v6_cap', 'v6_groundUnlit', 'v6_noProps', 'v6_noPip', 'v6_noRow', 'flat_wing', 'flat_bands']
    if any(not os.path.exists(os.path.join(RENDERS, n + '.png')) for n in need):
        subprocess.run(['bash', os.path.join(HERE, 'render_inputs.sh'), RENDERS], check=True, cwd=L.VIDEO)
    if after:
        subprocess.run(['bash', os.path.join(HERE, 'render_inputs.sh'), RENDERS, '--after'], check=True, cwd=L.VIDEO)


def bake(out_dir, engine=True):
    os.makedirs(out_dir, exist_ok=True)
    stats = {}
    for name, mod in PIECES.items():
        t0 = time.time()
        _, st = mod.make(out_dir)
        st['bake_s'] = round(time.time() - t0, 2)
        st['md5'] = md5(os.path.join(out_dir, name + '.png'))
        stats[name] = st
        print(name, st)
    if engine:
        os.makedirs(ENGINE_PAINT, exist_ok=True)
        for name in PIECES:
            shutil.copyfile(os.path.join(out_dir, name + '.png'), os.path.join(ENGINE_PAINT, name + '.ocpaint.png'))
        man = {'about': 'the organic proof\'s four pieces (scripts/look/organic/organic_proof.py; docs/look/organic/organic_proof.md)',
               'pieces': {name: {'box': list(mod.BOX), 'md5': stats[name]['md5']} for name, mod in PIECES.items()}}
        json.dump(man, open(os.path.join(ENGINE_PAINT, 'manifest.json'), 'w'), indent=1)
    json.dump(stats, open(os.path.join(out_dir, 'bake_stats.json'), 'w'), indent=1)
    return stats


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--bake', action='store_true')
    ap.add_argument('--sheet', action='store_true')
    ap.add_argument('--check', action='store_true')
    a = ap.parse_args()
    pieces_dir = os.path.join(L.SCRATCH, 'pieces')
    if a.check:
        s1 = bake(os.path.join(L.SCRATCH, 'check_a'), engine=False)
        s2 = bake(os.path.join(L.SCRATCH, 'check_b'), engine=False)
        same = {k: s1[k]['md5'] == s2[k]['md5'] for k in s1}
        print('deterministic:', same)
        json.dump({'run_a': {k: s1[k]['md5'] for k in s1}, 'run_b': {k: s2[k]['md5'] for k in s2}, 'same': same},
                  open(os.path.join(L.SCRATCH, 'determinism.json'), 'w'), indent=1)
        return
    if a.sheet:
        import organic_sheet
        organic_sheet.main()
        return
    ensure_renders()
    bake(pieces_dir)
    if a.bake:
        return
    ensure_renders(after=True)
    import organic_sheet
    organic_sheet.main()


if __name__ == '__main__':
    main()
