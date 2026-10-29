#!/usr/bin/env python3
"""look_test_row.py: the city-poster look test's "before" / "after" row (STUDY.md §10, build item 1 and item 11).

One row = the study's five measuring scripts on three stills of S1 (1.0, 3.0, 5.2 s), run exactly as the study ran them
on v2 (no new measures here: this only calls their own code with their v2 settings, so the after row is comparable):
  pro_4_colour.py   measure(frame, 'v2'): phone scale (540 px wide), the caption band y 290-600 left out
  pro_1_depth.py    value_structure(): the value groups (L* < 40 / 40-65 / 65-80 / >= 80, band out), the bottom quarter
  check_depth.py    the frame against its depth sheet (scripts/qa/depth_sheets/v2_s1_t{1.0,3.0,5.2}.json or --sheets)
  details.py        measure: edges, busy / structure / calm tiles, the median edge step, thin features
  pro_2_hierarchy   analyse() + box_stats() on the S1 boxes of its V2 table (her + the door A, the facade B, the near
                    props and the canal C near, the far city C far): the same boxes on all three frames (the float moves
                    the frame by <= 12 px) unless --boxes gives others
  composition.py    frame --subject (the S1 subject box [470, 780, 740, 1090] unless --subject)

  python3 -I video/scripts/look/posters/look_test_row.py --label before --frames t1.png t3.png t5.png \
      --out video/docs/studies/2026-10-28_city_posters/test/before_row.json
Frames: 1080 x 1920 stills of the three times, in that order (render: G5_BLOCKING / v2 BUILD.md, `render-frames.mjs`).
Prints the headline table (markdown) and writes every number to --out. Deterministic; writes nothing else.
"""
from __future__ import annotations

import argparse
import json
import os
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
VIDEO = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
sys.path.insert(0, HERE)
sys.dont_write_bytecode = True

TIMES = ['1.0', '3.0', '5.2']
S1_SUBJECT = [470, 780, 740, 1090]  # composition.py V2 'S1' (her + the Google door)
BAND = (290, 600)


def run(cmd: list[str]) -> str:
    r = subprocess.run(cmd, cwd=VIDEO, capture_output=True, text=True)
    if r.returncode not in (0, 1):  # check_depth exits 1 on a FAIL: still a measurement
        raise SystemExit(f'{cmd[2]} failed ({r.returncode}): {r.stderr[-800:]}')
    return r.stdout


def colour(path: str) -> dict:
    import pro_4_colour as P4
    from pathlib import Path
    return P4.measure(Path(path), 'v2')


def values(path: str) -> dict:
    import numpy as np
    import pro_1_depth as P1
    L = P1.labimg(path)
    mask = np.ones(L.shape[:2], bool)
    mask[BAND[0]:BAND[1]] = False
    return P1.value_structure(L, mask)


def depth(path: str, sheet: str, tmp: str) -> dict:
    out = os.path.join(tmp, os.path.basename(path) + '.depth.json')
    text = run([sys.executable, '-I', 'scripts/qa/check_depth.py', path, '--sheet', sheet, '--json', out])
    d = json.load(open(out))
    os.remove(out)
    d['_verdict'] = [l for l in text.splitlines() if l.startswith(('FAIL', 'WARN', 'DEPTH:'))]
    return d


def details(path: str, tmp: str) -> dict:
    out = os.path.join(tmp, os.path.basename(path) + '.details.json')
    run([sys.executable, '-I', 'scripts/look/posters/details.py', 'measure', path, '--json', out])
    d = json.load(open(out))[0]
    os.remove(out)
    return d


def hierarchy(path: str, boxes) -> dict:
    import numpy as np
    import pro_2_hierarchy as P2
    a, valid, _, _ = P2.load(path, None)
    valid[P2.CAPTION_BAND[0]:P2.CAPTION_BAND[1]] = False
    m = P2.analyse(a, valid)
    tm, _ = P2.tile_map(m)
    pal = P2.ab_palette(m, boxes)
    return {'top10_share': float(P2.top10_share(tm)), 'mean_fine': float(np.nanmean(tm)),
            'boxes': {f'{P2.GROUP[t]}: {lab}': P2.box_stats(m, b, pal) for lab, t, b in boxes}}


def composition(path: str, subject) -> dict:
    text = run([sys.executable, '-I', 'scripts/look/posters/composition.py', 'frame', path, '--subject', ','.join(str(v) for v in subject)])
    return json.loads(text[text.index('{'):])


def plane(dp: dict, name_start: str):
    for p in dp.get('planes', []):
        if str(p.get('name', '')).startswith(name_start):
            return p
    return None


def headline(t: str, r: dict) -> dict:
    """The numbers the after must beat (STUDY.md §1a, §4, §5.5, P4 §3.1-3.5, P2 §3.1, DE, CO)."""
    c, v, dp, de, h, co = r['colour'], r['values'], r['depth'], r['details'], r['hierarchy'], r['composition']
    val, chm, fl, cl = c['value'], c['chroma'], c['fields'], c['colours']
    near = plane(dp, 'near treads')
    wing = plane(dp, 'the wing')
    air_L = dp.get('air', {}).get('L') if isinstance(dp.get('air'), dict) else None
    hb = h['boxes']
    g = lambda k, f: (hb.get(k) or {}).get(f)
    return {
        't': t,
        'L* p5': val['pct']['p5'], 'L*<40 %': val['darks']['lt40_pct'], 'dark parts': val['darks']['parts_ge4px'],
        'dark cells /16': val['darks']['grid_cells_with_darks'],
        'L*<65 %': v['lt40'] + v['40_65'], 'L* 65-80 %': v['65_80'], 'bottom quarter L* p50': v['bottom_p50'],
        'near treads L*': near and near.get('L'), 'wing (subject plane) L*': wing and wing.get('L'), 'air L*': air_L,
        'pastel %': chm['pastel_pct'], 'C* p50': chm['pct']['p50'], 'C* p90': chm['pct']['p90'],
        'C*-weighted L*': chm['C_weighted_L'], 'accent C>=35 %': chm['accents_c35']['share_pct'],
        'accent parts': chm['accents_c35']['parts_ge4px'],
        'big fields below sky %': fl['big_fields_below_sky_pct'], 'mottle L std': fl.get('mottle_L_std'),
        'colours n90': cl['n90'], 'colours >=0.5 %': cl['n_ge05pct'],
        'edges %': 100 * de['edge_px'], 'busy %': 100 * de['busy'], 'structure %': 100 * de['structure'],
        'median edge step L*': de['median_step_L'],
        'A fine %': g('A: her + Google door', 'fine_pct'), 'C near faces/10k': g('C near: props near', 'faces_per_10k'),
        'C near local c.': g('C near: props near', 'local_c'), 'C far faces/10k': g('C far: far city', 'faces_per_10k'),
        'sky %': co['sky'], 'calm below skyline %': co['calm_below'], 'corners BL/BR L*': [co['corners']['BL'], co['corners']['BR']],
        'subject area %': co['icons'][0]['area'] if co.get('icons') else None,
        'subject salience share %': co['icons'][0]['sal_share'] if co.get('icons') else None,
        'depth verdict': [l for l in dp['_verdict'] if l.startswith('DEPTH:')],
    }


def fmt(x) -> str:
    if x is None:
        return '-'
    if isinstance(x, list):
        return ' / '.join(fmt(y) for y in x)
    if isinstance(x, float):
        return f'{x:.1f}' if abs(x) >= 1 or x == 0 else f'{x:.2f}'
    return str(x)


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--frames', nargs=3, required=True, help='the 1.0, 3.0 and 5.2 s stills, in that order')
    ap.add_argument('--label', default='before')
    ap.add_argument('--sheets', nargs=3, default=[f'scripts/qa/depth_sheets/v2_s1_t{t}.json' for t in TIMES])
    ap.add_argument('--subject', default=','.join(str(v) for v in S1_SUBJECT))
    ap.add_argument('--boxes', default='', help='JSON file: [[label, tier, [x0, y0, x1, y1]], ...] for pro_2 (default: its S1 boxes)')
    ap.add_argument('--out', required=True)
    a = ap.parse_args()
    import pro_2_hierarchy as P2
    boxes = [tuple(b) for b in json.load(open(a.boxes))] if a.boxes else P2.V2['v2_t5.20.png']
    subject = [float(v) for v in a.subject.split(',')]
    tmp = os.path.dirname(os.path.abspath(a.out))
    os.makedirs(tmp, exist_ok=True)
    rows, raw = [], {}
    for t, f, sh in zip(TIMES, a.frames, a.sheets):
        f = os.path.abspath(f)
        r = {'frame': f, 'sheet': sh, 'colour': colour(f), 'values': values(f), 'depth': depth(f, sh, tmp),
             'details': details(f, tmp), 'hierarchy': hierarchy(f, boxes), 'composition': composition(f, subject)}
        raw[t] = r
        rows.append(headline(t, r))
        print(f'measured {t} s', file=sys.stderr)
    keys = [k for k in rows[0] if k != 't']
    print(f'| {a.label} | ' + ' | '.join(f'{r["t"]} s' for r in rows) + ' |')
    print('|---|' + '---|' * len(rows))
    for k in keys:
        print(f'| {k} | ' + ' | '.join(fmt(r[k]) for r in rows) + ' |')
    json.dump({'label': a.label, 'headline': rows, 'raw': raw}, open(a.out, 'w'), indent=1, default=float)
    print('wrote', a.out, file=sys.stderr)
    return 0


if __name__ == '__main__':
    sys.exit(main())
