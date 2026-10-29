// The look test's "low poly" PATCHWORK (STUDY.md §10 item 6, lane PT's lib/patchwork: test/ENGINE_PT.md; owner,
// 2026-10-29: decision 3 (a), CRAFT §b "Tier C's build"): our bank's paving cut into flat facets that RECEDE (projected
// through the bank's one camera, never level bands), and the far city's walls as frontal blocks; never on the subject,
// nothing in the caption band, every facet locked to its plane (drawn inside its float group) and static.
//   the bank   v2's two-point bank (V2S1_steps_stone: GROUND_VP (-1100, 1000), GROUND_VP2 (2600, 1000)) is exactly lane
//              PT's twoPointCam; 4 m reproduces v2's ~1.2 m blocks at ~125 px/m on the near tread. Each tread is laid
//              out from its screen corners (groundAt) and cut on a 0.3 m paving module, its tones the tread's own stone
//              (v2's, or the near world's mid-tones under the darks switch) as SHOWN through the tier-C pull.
//   far city   each wall of the far rows (V2S1_set_far FAR / MID / NEAR) as frontal blocks from its receded colour,
//              under the windows; +4 two values, +3 three (PT's far steps).
import React, {useMemo} from 'react';
import {Fill} from '../../lib/Fill';
import {tierFill} from '../../lib/pen';
import {groundAt, groundPatchwork, frontalBlocks, markShape, patchPaths, patchTones, patchworkProblems, twoPointCam, type Patchwork, type Pt} from '../../lib/patchwork';
import {paletteKey} from './engine';

/** Our bank's one camera (lane PT: v2 S1's two VPs; 4 m gives v2's block scale). */
export const BANK_CAM = twoPointCam({horizon: 1000, vpL: -1100, vpR: 2600, height: 4});
const shown = (c: string) => tierFill(c, 'environment');

const CACHE = new Map<string, Patchwork>();

/** One tread's patchwork: its screen polygon (corners in screen px, all under the horizon) laid onto the ground and cut
 *  on the paving module; `base` its stone. Cached per tread, stone and palette. */
export function treadPatch(k: number, screenPoly: Pt[], base: string): Patchwork | null {
  const key = `tread|${k}|${base}|${paletteKey()}`;
  const hit = CACHE.get(key);
  if (hit) return hit;
  const poly = screenPoly.map(([x, y]) => groundAt(BANK_CAM, x, y)).filter((p): p is Pt => !!p);
  if (poly.length < 3) return null;
  const pw = groundPatchwork(BANK_CAM, {
    seed: `s1bank/patch/${k}`,
    poly,
    cell: 0.9,
    grid: 0.3,
    plane: -1,
    tones: patchTones(base, {plane: -1, shown}),
    shown,
    // the low sun is west (screen left), a little behind
    key: [-1, -0.25],
    marks: 14,
  });
  CACHE.set(key, pw);
  return pw;
}

/** Draws a patchwork: its base (it fills every seam), the facets by 160 px cell (the frame-0 flood ripples cell by
 *  cell), then its identity marks (a drain, a hatch). */
export const PatchFill: React.FC<{pw: Patchwork; seed: string; marks?: 'square' | 'slot' | 'pair' | 'band' | false}> = ({pw, seed, marks = 'square'}) => {
  const paths = useMemo(() => patchPaths(pw, {by: 'cell'}), [pw]);
  const markD = useMemo(() => (marks ? pw.facets.filter((f) => f.mark).map((f) => markShape(pw, f, marks)).filter((m): m is {d: string; color: string} => !!m) : []), [pw, marks]);
  return (
    <>
      <Fill d={pw.base.d} color={pw.base.color} offset={false} seed={`${seed}/base`} />
      {paths.map((p) => (
        <Fill key={p.key} d={p.d} color={p.color} offset={false} seed={`${seed}/${p.key}`} />
      ))}
      {markD.map((m, i) => (
        <Fill key={`m${i}`} d={m.d} color={m.color} offset={false} seed={`${seed}/mark${i}`} />
      ))}
    </>
  );
};

/** A far row's wall as frontal blocks (screen px): `wall` its colour as receded to its plane; 2 values on +4, 3 on +3. */
export function wallPatch(key: string, rect: [number, number, number, number], wall: string, plane: number): Patchwork {
  const k = `wall|${key}|${wall}|${plane}|${paletteKey()}`;
  const hit = CACHE.get(k);
  if (hit) return hit;
  const [x0, y0, w, h] = rect;
  const pw = frontalBlocks({
    seed: `s1far/patch/${key}`,
    poly: [[x0, y0], [x0 + w, y0], [x0 + w, y0 + h], [x0, y0 + h]],
    plane,
    tones: patchTones(wall, {plane, n: plane >= 4 ? 2 : 3, shown}),
    shown,
    key: [-1, -0.2],
    marks: false,
  });
  CACHE.set(k, pw);
  return pw;
}

/** The lint for the scene's problems(): every patchwork built so far (empty = OK). */
export const s1PatchProblems = (): string[] => Array.from(CACHE.entries()).flatMap(([k, pw]) => patchworkProblems(pw, k));
