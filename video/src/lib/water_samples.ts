// lib/water's SAMPLE SPECS (not S1's): the far strip (lod 'far', R14: an S5-like river 23 px tall) and a receding canal
// (R1's affine mirror: an S2-like sloped quay). The demo entry (src/entry-v2r-water.tsx) draws them; node QA lints them
// (waterProblems). They prove the component beyond its first shot; a lane copies the recipe, not these numbers.
import {CM} from '../v2r/palette';
import {S2_EVENING, S5_SKY} from '../v2r/world/skies';
import {TINT_CANAL} from '../v2r/world/rigs';
import type {Poly, WaterSpec} from './water';

const PAPER = '#FBF3E6';

// ================================================================= the far river (lod 'far', R14)

/** The strip: y 801-824 (23 px), a level lens high over it (the far bank 2.4 km away: rows ~0.05 px). */
export const FAR_TOP = 801;
export const FAR_BOT = 824;
const arch = (cx: number, half: number, spring: number, crown: number, bottom: number): Poly => {
  const pts: Poly = [[cx - half, bottom]];
  for (let k = 0; k <= 16; k++) {
    const a = Math.PI * (1 - k / 16);
    pts.push([cx + half * Math.cos(a), spring - (spring - crown) * Math.sin(a)]);
  }
  pts.push([cx + half, bottom]);
  return pts;
};
/** The far shore: a low band of trees and roofs standing on the waterline; a bridge of five arches across the right. */
export const FAR_SHORE: Poly = [[-40, FAR_TOP], [-40, 786], [120, 782], [260, 788], [420, 780], [620, 785], [1120, 786], [1120, FAR_TOP]];
export const WATER_FAR_SAMPLE: WaterSpec = {
  id: 'far sample (S5-like)',
  seed: 'farSample',
  cam: {horizon: 770, f: 1400, eye: 40},
  region: {top: () => FAR_TOP, bottom: () => FAR_BOT, x0: -40, x1: 1120, tuckTop: 1, tuckBottom: 2, step: 20},
  sky: S5_SKY,
  body: '#9CC3BC',
  tier: 'environment',
  ramp: {yFar: FAR_TOP, yNear: FAR_BOT},
  sources: [
    {id: 'shore', thing: FAR_SHORE, axis: FAR_TOP, color: '#B7B9A8', layer: 0, plane: 4},
    ...[0, 1, 2, 3, 4].map((i) => ({id: `pier${i}`, thing: [[600 + i * 100, 790], [640 + i * 100, 790], [640 + i * 100, FAR_TOP], [600 + i * 100, FAR_TOP]] as Poly, axis: FAR_TOP, color: '#C9BFB4', layer: 1, plane: 4})),
    ...[0, 1, 2, 3].map((i) => ({id: `arch${i}`, thing: arch(690 + i * 100, 50, FAR_TOP, 793, FAR_TOP), axis: FAR_TOP, color: '#9FB2B1', layer: 2, plane: 4})),
  ],
  sun: {x: 300, y: 610, slope: 0.08, t0: 0.3},
  lod: 'far',
  farLod: {flecks: 5, fleckLen: [2, 6], lines: 3},
  flood: {origin: [300, 610], t0: 0, speed: 6000, pale: 0.7, paper: PAPER},
};

// ================================================================= the receding canal (R1's affine mirror)

/** The far quay's waterline slopes toward the vanishing point (x 1300, y 1000): y = 1000 + 0.12 (1300 - x) on screen. */
const A0 = 1000 + 0.12 * 1300;
const S = -0.12;
export const quayY = (x: number) => A0 + S * x;
/** Our edge: a steeper line toward the same vanishing point. */
export const nearY = (x: number) => 1000 + 0.42 * (1300 - x);
const wallTop = (x: number) => 1000 - 0.62 * (1300 - x);
export const wall: Poly = [[-40, wallTop(-40)], [1080, wallTop(1080)], [1080, quayY(1080) - 6], [-40, quayY(-40) - 6]];
export const windows: Poly[] = [0, 1, 2, 3, 4].map((i) => {
  const x0 = 60 + i * 190;
  const x1 = x0 + 90;
  const m = (x: number, k: number) => quayY(x) - 6 - (quayY(x) - 6 - wallTop(x)) * k;
  return [[x0, m(x0, 0.62)], [x1, m(x1, 0.62)], [x1, m(x1, 0.3)], [x0, m(x0, 0.3)]];
});
export const WATER_AFFINE_SAMPLE: WaterSpec = {
  id: 'affine sample (S2-like)',
  seed: 'affineSample',
  cam: {horizon: 1000, f: 1400, eye: 1.6},
  region: {top: quayY, bottom: nearY, x0: -40, x1: 1120, tuckTop: 2, tuckBottom: 6, step: 10},
  sky: S2_EVENING,
  body: '#9CC3BC',
  tint: TINT_CANAL.water,
  tier: 'environment',
  ramp: {yFar: 1120, yNear: 1500},
  ladder: {k: [0.4, 0.72], y: [1120, 1500], step: 0.05},
  sources: [
    {id: 'wall', thing: wall, axis: {a0: A0, s: S}, color: '#C99683', layer: 10, plane: 0, breakup: 0.5, narrow: 0.12},
    ...windows.map((p, i) => ({id: `window${i}`, thing: p, axis: {a0: A0, s: S}, color: CM.lamp, kind: 'light' as const, layer: 11, plane: 0, breakup: 0.3, narrow: 0.14, taper: 4})),
    {id: 'lamp', thing: [[505, quayY(505) - 300], [515, quayY(505) - 300], [518, quayY(518)], [502, quayY(502)]], axis: {a0: A0, s: S}, color: '#9DA3B3', layer: 13, plane: 0, breakup: 0, narrow: 0.2, taper: 1.2, solid: 0.7},
  ],
  ripples: {slots: 9, x: [-30, 1110], y: [1180, 1560], len: [50, 160], thick: [1.5, 3], drift: [6, 16], life: [2.6, 4.6], t0: 0},
  sun: {x: 860, y: 900, slope: 0.06, t0: 0.3},
  flood: {origin: [860, 900], t0: 0, speed: 6000, pale: 0.7, paper: PAPER},
};

