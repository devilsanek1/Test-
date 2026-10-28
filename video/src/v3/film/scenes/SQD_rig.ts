// SQD_rig (REVEAL lane): the numbers of SQD's ONE pull-back (docs/v3/flow_v2.md §4 SQD, §6 J3 / J4). Pure maths, no
// drawing: every map is a function of FILM seconds, so the picture never depends on which builder draws it.
//
// Coordinates: H2 px = the outside at rest (`outside.tsx`'s frame: horizon y 930, the DC x 230-560, the summit of the
// mountain (800, 640), the town 930-1040, our street 1040-1250, the sill 1250-1292: `h2_window.tsx`).
// The move ends EXACTLY on J4's start state (h2_window's entryCam before 22.35: far x1.03, town x1.07, street x1.12,
// window x3.0, all about (540, 1100)); from 21.98 SQD draws through h2Cams itself, so the hold, the entry (22.35-22.95)
// and SQE's first frames are one camera.
//   far    (sky, clouds, the mountain, the DC, the far field): planeMat {o: the summit stick, off: (540, 870) - o, k: K0}
//   town   (930-1040): rises from below the frame (it enters at p ~0.3)
//   street (1040-1250): rises next (enters at p ~0.55)
//   win    (the sill and the desk): the nearest plane, rises last of all to its x3 start state
import {mat, type Mat} from '../../../lib/xf';
import {planeMat, s5Ease, applyMat, matScale, type PullPlane} from '../kit/Pullback';
import {ENTRY, entryCam, h2Cams, type H2Cams} from './h2_window';
import {J3_STICK, K0, SUMMIT_STICK} from './SQD_peak';

export const SQD_START = 19.4;
export const SQD_END = 22.68;
/** The move: 155 f on the S5 ease, 19.40-21.98; then the hold (the birds) to 22.35; J4's entry 22.35-22.95. */
export const MOVE = 155 / 60;
export const MOVE_END = SQD_START + MOVE;
/** SQD's own life (streams, trucks) is in by then; from here SQD draws SQE's H2Scene (J4's seam by construction). */
export const LIFE_END = 22.25;
/** "mountain." (VO 21.72): the thoom (p 0.985). */
export const THOOM = 21.72;

/** THE stick: SQC lifts it out of the laptop to (540, 870), w 700, rot -4 (J3_STICK); SQD finds it lying on the summit
 *  (SUMMIT_STICK, 30 px wide in H2 px: outside.tsx's H2_SUMMIT is the same object), so the far plane starts at
 *  K0 = 700 / 30 = x23.3. All three live in SQD_peak (one number, every builder). */
export {J3_STICK, K0, SUMMIT_STICK};

export type PlaneKey = keyof H2Cams;
/** J4's start state (entryCam holds it before 22.35): the maps the pull-back lands on. */
export const E0: H2Cams = entryCam(ENTRY.t0);

/** The move's progress at film time T. */
export const pullP = (T: number) => s5Ease((T - SQD_START) / MOVE);
const STICK_END = applyMat(E0.far, [SUMMIT_STICK.x, SUMMIT_STICK.y]);
/** The pull, authored on top of E0 (each plane's own pivot and extra start scale). The far plane: x K0 (23.3) on the
 *  summit stick at t 0 (the stick at (540, 870), 700 px). The near planes rise from below the frame. */
export const PULL: Record<PlaneKey, PullPlane> = {
  far: {o: STICK_END, off: [J3_STICK.x - STICK_END[0], J3_STICK.y - STICK_END[1]], k: K0 / matScale(E0.far)},
  town: {o: [540, 985], off: [-60, 1500], k: 3},
  street: {o: [540, 1140], off: [-120, 2300], k: 5},
  win: {o: [540, 1660], off: [-160, 2600], k: 2.2},
};

/** Every plane's camera at film time T: the pull (to 21.98), then h2_window's h2Cams (the hold, J4's entry, SQE's). */
export function sqdCams(T: number): H2Cams {
  if (T >= MOVE_END) return h2Cams(T);
  const p = pullP(T);
  return {
    far: mat.mul(planeMat(PULL.far, p), E0.far),
    town: mat.mul(planeMat(PULL.town, p), E0.town),
    street: mat.mul(planeMat(PULL.street, p), E0.street),
    win: mat.mul(planeMat(PULL.win, p), E0.win),
  };
}
/** The ink compensation of a plane during the pull, relative to J4's start state (so it is 1 when the pull lands); from
 *  21.98 none at all: SQD then draws exactly what SQE draws. */
export const inkZoom = (key: PlaneKey, m: Mat, T: number) => (T >= MOVE_END ? {value: 1} : {zoom: matScale(m), from: matScale(E0[key]), k: 0.8});
export {applyMat, matScale};
