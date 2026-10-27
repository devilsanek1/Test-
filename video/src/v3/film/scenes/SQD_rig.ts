// SQD_rig (REVEAL lane): the numbers of SQD's ONE pull-back (docs/v3/flow_v2.md §4 SQD, §6 J3 / J4). Pure maths, no
// drawing: every map is a function of FILM seconds, so the picture never depends on which builder draws it.
//
// Coordinates: H2 px = the outside at rest (`outside.tsx`'s frame: horizon y 930, the DC x 230-560, the summit of the
// mountain (800, 640), the town 930-1040, our street 1040-1250, the sill 1250-1292).
// The move ends on J4's start state (entryCam at 22.35: far x1.03, street x1.12, window x3.0, all about (540, 1100)),
// so the hold and the pull back through our window (22.35-22.95) continue the same camera.
//   far    (sky, clouds, the mountain, the DC, the far field): planeMat {o: the summit, off: (540, 870) - o, k: 27}
//   town   (930-1040): rises from below the frame (it enters at p ~0.3)
//   street (1040-1250): rises last (enters at p ~0.55)
//   window (the sill and the room): the nearest plane, rises last of all to its x3 (J4's entry) state
import {mat, type Mat} from '../../../lib/xf';
import {ease, clamp} from '../../../lib/time';
import {planeMat, s5Ease, applyMat, matScale, type PullPlane} from '../kit/Pullback';
import type {Pt} from '../kit/util';

export const SQD_START = 19.4;
export const SQD_END = 22.68;
/** The move: 155 f on the S5 ease, 19.40-21.98; then the hold (S9's birds) to 22.35; J4's entry 22.35-22.95. */
export const MOVE = 155 / 60;
export const MOVE_END = SQD_START + MOVE;
export const ENTRY: [number, number] = [22.35, 22.95];
/** "mountain." (VO 21.72): the thoom (p 0.985). */
export const THOOM = 21.72;

/** The summit of the mountain (H2 px) and THE stick lying on it (the same MemoryStick SQC lifts out of the laptop). */
export const SUMMIT: Pt = [800, 640];
export const J3_STICK = {x: 540, y: 870, w: 700, rot: -4};
export const K0 = 27;
/** The summit stick in H2 px: 25.9 px wide, lying on the summit point (its centre half its height above it). */
export const SUMMIT_STICK = {x: SUMMIT[0], y: SUMMIT[1] - (J3_STICK.w / K0) * 0.155, w: J3_STICK.w / K0, rot: J3_STICK.rot};
const STICK_C: Pt = [SUMMIT_STICK.x, SUMMIT_STICK.y];

// ---- J4's entry (STAND-IN until `h2_window.tsx` exports entryCam: flow_v2 §6 J4's numbers, inOutCubic 22.35-22.95)
export const ENTRY_PIVOT: Pt = [540, 1100];
export const ENTRY_K = {far: 1.03, town: 1.075, street: 1.12, window: 3.0};
export type PlaneKey = keyof typeof ENTRY_K;
const about = (c: Pt, k: number): Mat => mat.compose(mat.translate(c[0], c[1]), mat.scale(k), mat.translate(-c[0], -c[1]));
/** Entry progress (0 at 22.35, 1 at 22.95). */
export const entryU = (T: number) => ease.inOutCubic(clamp((T - ENTRY[0]) / (ENTRY[1] - ENTRY[0])));
/** A plane's entry map at film time T (a geometric scale k^(1-u) about (540, 1100)). */
export const entryMat = (key: PlaneKey, T: number): Mat => about(ENTRY_PIVOT, Math.pow(ENTRY_K[key], 1 - entryU(T)));

// ---- the pull-back (19.40-21.98), authored on top of the entry's start state
/** The move's progress at film time T. */
export const pullP = (T: number) => s5Ease((T - SQD_START) / MOVE);
const E0 = (key: PlaneKey) => about(ENTRY_PIVOT, ENTRY_K[key]);
const SUMMIT_END = applyMat(E0('far'), STICK_C);
/** The far plane: x27 on the summit stick at t 0 (the summit stick at (540, 870), 700 px), x1.03 at the end. */
export const FAR_PLANE: PullPlane = {o: SUMMIT_END, off: [J3_STICK.x - SUMMIT_END[0], J3_STICK.y - SUMMIT_END[1]], k: K0 / ENTRY_K.far};
/** The near planes rise from below the frame: their pivot starts `off` lower, k = their extra start scale. */
export const TOWN_PLANE: PullPlane = {o: [540, 985], off: [-60, 1500], k: 3};
export const STREET_PLANE: PullPlane = {o: [540, 1140], off: [-120, 2300], k: 5};
export const WINDOW_PLANE: PullPlane = {o: [540, 1660], off: [-160, 2600], k: 2.2};
const PLANES: Record<PlaneKey, PullPlane> = {far: FAR_PLANE, town: TOWN_PLANE, street: STREET_PLANE, window: WINDOW_PLANE};

/** A plane's full camera at film time T: the pull (to 21.98), the hold, then J4's entry. Maps H2 px -> screen px. */
export function sqdMat(key: PlaneKey, T: number): Mat {
  if (T >= ENTRY[0]) return entryMat(key, T);
  return mat.mul(planeMat(PLANES[key], pullP(T)), E0(key));
}
/** The far plane's screen scale at T (x27 -> x1.03). */
export const farScale = (T: number) => matScale(sqdMat('far', T));
export {applyMat, matScale};
