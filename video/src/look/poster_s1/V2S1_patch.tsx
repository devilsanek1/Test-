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
import React, {useId, useMemo} from 'react';
import {Fill} from '../../lib/Fill';
import {tierFill} from '../../lib/pen';
import {groundAt, groundPatchwork, frontalBlocks, markShape, patchPaths, patchTones, patchworkProblems, twoPointCam, type Patchwork, type Pt} from '../../lib/patchwork';
import {fromLch, lab, lch} from '../../lib/light';
import {cleanColour, neverBand, paleOf} from '../../lib/water';
import {useLook} from '../../lib/exit';
import {useTime} from '../../lib/time';
import {mat, useXf} from '../../lib/xf';
import {paletteKey} from './engine';

/** Our bank's one camera (lane PT: v2 S1's two VPs; 4 m gives v2's block scale). */
export const BANK_CAM = twoPointCam({horizon: 1000, vpL: -1100, vpR: 2600, height: 4});
const shown = (c: string) => tierFill(c, 'environment');

const CACHE = new Map<string, Patchwork>();

/** The paving's two settings (lane PT's table, ENGINE_PT.md §2 "How busy, and the calmer knobs"; all inside the dL*
 *  4-10 rule): `busy` the first pass (0.9 m cells, the near plane's 4 tones 4.6 apart: 2.7-3 % edge pixels), `calm`
 *  PT's calmest in-spec one (1.2 m cells, 2 tones 4.5 apart: 2.3 % edge pixels, local contrast 1.03). Judged at phone
 *  size on S1 (2026-10-29): the busy one read as a checkerboard over the whole bank; the decided look is `calm`. */
export const PAVING = {
  busy: {cell: 0.9, n: undefined as number | undefined, step: undefined as number | undefined},
  mid: {cell: 1.2, n: 3 as number | undefined, step: 4.5 as number | undefined},
  calm: {cell: 1.2, n: 2 as number | undefined, step: 4.5 as number | undefined},
} as const;
/** (test/REVIEW.md MUST 2, the decided paving since the fix pass) `stone`: 3 tones 5 L* apart (every pair inside the
 *  near plane's 4-10), each turned 5 deg in hue (darker toward rose, lighter toward gold: dE00 <= 6 from the base), on
 *  2.2 m cells (the near facets ~60-80 px: CRAFT §b's 3.5-7.5 % of W) at the lib's widest jitter (0.4) on a 0.6 m
 *  module, a mark about one facet in 24, the key bias kept, no facet under 10 px. 'calm' (2 tones 4.5 apart on 1.2 m cells) made near
 *  neighbours alternate, which the bank's two-point camera turned into a diamond chequer. */
export const PAVE_STONE = {cell: 2.2, n: 3, step: 5, dh: 5, jitter: 0.4, grid: 0.6, marks: 24, minPx: 10} as const;
export type PavingKind = keyof typeof PAVING | 'stone';

/** PAVE_STONE's tones: `n` steps `step` apart in L* AS SHOWN (through `shown`, the clean pen's tier pull; bisection on
 *  the authored L*, as lib/patchwork patchTones), each turned `dh` per step (darker toward rose), out of the never bands. */
export function paveTones(base: string, o: {n: number; step: number; dh: number; shown: (hex: string) => string}): string[] {
  const c = lch(base);
  const L0 = lab(o.shown(base))[0];
  const out: string[] = [];
  for (let i = 0; i < o.n; i++) {
    const k = i - (o.n - 1) / 2;
    const h = c.h + k * o.dh;
    const C = Math.max(0, c.C - k * o.step * 0.15);
    const target = L0 + k * o.step;
    let lo = 0;
    let hi = 100;
    for (let it = 0; it < 40; it++) {
      const m = (lo + hi) / 2;
      if (lab(o.shown(fromLch(m, C, h)))[0] < target) lo = m;
      else hi = m;
    }
    const hex = fromLch((lo + hi) / 2, C, h);
    out.push(neverBand(hex) ? cleanColour(hex, h) : hex);
  }
  return out;
}

/** One tread's patchwork: its screen polygon (corners in screen px, all under the horizon) laid onto the ground and cut
 *  on the paving module; `base` its stone. Cached per tread, stone, setting and palette. */
export function treadPatch(k: number, screenPoly: Pt[], base: string, paving: PavingKind = 'stone'): Patchwork | null {
  const key = `tread|${k}|${base}|${paving}|${paletteKey()}`;
  const hit = CACHE.get(key);
  if (hit) return hit;
  const poly = screenPoly.map(([x, y]) => groundAt(BANK_CAM, x, y)).filter((p): p is Pt => !!p);
  if (poly.length < 3) return null;
  if (paving === 'stone') {
    const S = PAVE_STONE;
    const pw = groundPatchwork(BANK_CAM, {
      seed: `s1bank/stone/${k}`,
      poly,
      cell: S.cell,
      grid: S.grid,
      jitter: S.jitter,
      // (the landing's far end: no sliver under the plane's 8 px once the 0.6 m module snaps the jittered cuts)
      minPx: S.minPx,
      plane: -1,
      tones: paveTones(base, {n: S.n, step: S.step, dh: S.dh, shown}),
      shown,
      key: [-1, -0.25],
      marks: S.marks,
    });
    CACHE.set(key, pw);
    return pw;
  }
  const P = PAVING[paving];
  const pw = groundPatchwork(BANK_CAM, {
    seed: `s1bank/patch/${k}`,
    poly,
    cell: P.cell,
    grid: 0.3,
    plane: -1,
    tones: patchTones(base, {plane: -1, n: P.n, step: P.step, shown}),
    shown,
    // the low sun is west (screen left), a little behind
    key: [-1, -0.25],
    marks: 14,
  });
  CACHE.set(key, pw);
  return pw;
}

/** Draws a patchwork: its base (it fills every seam), the facets by 160 px cell (the frame-0 flood ripples cell by
 *  cell), then its identity marks (a drain, a hatch). `front` (REVIEW MUST 2: the paving floods under ONE circle front,
 *  as the sky does, never tile by tile): while the Look's cascade front crosses the patchwork, its pale state and its
 *  colours (both as SHOWN, so exempt from the per-shape cascade) with the colours clipped to the front's circle. */
export const PatchFill: React.FC<{pw: Patchwork; seed: string; marks?: 'square' | 'slot' | 'pair' | 'band' | false; front?: boolean}> = ({pw, seed, marks = 'square', front}) => {
  const paths = useMemo(() => patchPaths(pw, {by: 'cell'}), [pw]);
  const markD = useMemo(() => (marks ? pw.facets.filter((f) => f.mark).map((f) => markShape(pw, f, marks)).filter((m): m is {d: string; color: string} => !!m) : []), [pw, marks]);
  const look = useLook();
  const t = useTime();
  const m = useXf();
  const id = 'pf' + useId().replace(/[^a-zA-Z0-9]/g, '');
  const cs = look.cascade;
  if (front && cs) {
    const sh = pw.spec.shown;
    const o = mat.inv(m);
    const ox = o[0] * cs.origin[0] + o[2] * cs.origin[1] + o[4];
    const oy = o[1] * cs.origin[0] + o[3] * cs.origin[1] + o[5];
    const r = (t - cs.at) * (cs.speed ?? 2600);
    const all = (pale: boolean) => (
      <>
        <Fill d={pw.base.d} color={pale ? paleOf(sh(pw.base.color), cs.pale ?? 1, cs.paper ?? '#FFFFFF') : sh(pw.base.color)} offset={false} seed={`${seed}/base${pale ? 'P' : ''}`} lookExempt />
        {paths.map((p) => (
          <Fill key={p.key} d={p.d} color={pale ? paleOf(sh(p.color), cs.pale ?? 1, cs.paper ?? '#FFFFFF') : sh(p.color)} offset={false} seed={`${seed}/${p.key}${pale ? 'P' : ''}`} lookExempt />
        ))}
        {markD.map((q, i) => (
          <Fill key={`m${i}`} d={q.d} color={pale ? paleOf(sh(q.color), cs.pale ?? 1, cs.paper ?? '#FFFFFF') : sh(q.color)} offset={false} seed={`${seed}/mark${i}${pale ? 'P' : ''}`} lookExempt />
        ))}
      </>
    );
    // the farthest corner of the patchwork from the front's origin: past it, the plain colours
    const far = Math.max(...pw.facets.flatMap((f) => [Math.hypot(f.box[0] - ox, f.box[1] - oy), Math.hypot(f.box[2] - ox, f.box[1] - oy), Math.hypot(f.box[0] - ox, f.box[3] - oy), Math.hypot(f.box[2] - ox, f.box[3] - oy)]), 0);
    if (r < far) {
      return (
        <>
          {all(true)}
          {r > 0 ? (
            <>
              <defs>
                <clipPath id={id} clipPathUnits="userSpaceOnUse">
                  <circle cx={ox} cy={oy} r={r} />
                </clipPath>
              </defs>
              <g clipPath={`url(#${id})`}>{all(false)}</g>
            </>
          ) : null}
        </>
      );
    }
  }
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
