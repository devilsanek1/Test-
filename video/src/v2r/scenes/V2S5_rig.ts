// V2S5_rig.ts (lane L4): the S5 crane rig as the shot uses it: the CAMERA. ONE progress p (kit/dc/crane.ts `craneP`,
// the contract's re-fit ease cubicBezier(0.35, 0.03, 0.45, 1.0) over 21.30-23.40) drives every plane. The rig says
// where each plane is at p; the slot files own the DRAWINGS and the few shape numbers the camera needs from them:
//   V2S5_far.tsx      FAR_END (the end horizon, the end sun)  -> FAR_S5 here: its sun lands EXACTLY on SUN1 at p 0
//   V2S5_river.tsx    RIVER_PL        V2S5_mid.tsx   MID_PLANE        V2S5_nearmid.tsx   NEARMID_PLANE (start coords)
//   V2S5_deck.tsx     TREE_BOX (the left frame's slide-in), RIGHT_BOX (the right frame's)
// The deck plane (the terrace, pinned on the stranger's feet: k = 150 / 62) and the lamppost wipe across the backs
// (with `swapAt`, when the tiny drawings swap in behind it) stay the kit's (kit/dc/crane.ts).
//   END coords = the screen when the crane lands (p 1); START coords = the screen of the held start (p 0).
// Import rule (no cycles): slot files never import this file; this file imports them.
import {S5, SUN1} from '../world/map';
import {CRANE_T, craneP, DECK, WIPE, wipeAt, wipeMat, swapAt, planeMat, startMat, boxMat, applyMat, matScale, type PullPlane, type PullBox} from '../kit/dc/crane';
import type {Pt} from '../../lib/sketch';
import {FAR_END} from './V2S5_far';
import {RIVER_PL} from './V2S5_river';
import {MID_PLANE} from './V2S5_mid';
import {NEARMID_PLANE} from './V2S5_nearmid';
import {TREE_BOX, RIGHT_BOX} from './V2S5_deck';

export {CRANE_T, craneP, DECK, WIPE, wipeAt, wipeMat, swapAt, planeMat, startMat, boxMat, applyMat, matScale};
export type {PullPlane, PullBox};

/** The far plane, re-pinned on the shot's end sun: at p 0 the sun lands on SUN1 exactly (centre and radius). The
 *  scale k turns the end sun's radius into SUN1's (~1.08); the pivot sits on the end horizon; the slide makes the
 *  centre match. Everything above the sun moves UP at the start by (k - 1) x its height above the pivot. */
export const FAR_S5: PullPlane = (() => {
  const s = FAR_END.sun;
  const k = SUN1.r / s.r;
  const o: Pt = [540, FAR_END.horizon];
  return {o, k, off: [SUN1.x - o[0] - k * (s.x - o[0]), SUN1.y - o[1] - k * (s.y - o[1])]};
})();

/** Every camera plane of the shot (the QA reads these). */
export const PLANES = {far: FAR_S5, river: RIVER_PL, mid: MID_PLANE, nearmid: NEARMID_PLANE, deck: DECK, tree: TREE_BOX, right: RIGHT_BOX};

/** End coords of a START-coords point riding the deck (the inverse of the deck's p 0 map). */
export const deckEndOf = (q: Pt): Pt => {
  const off = DECK.off ?? [0, 0];
  return [DECK.o[0] + (q[0] - DECK.o[0] - off[0]) / DECK.k, DECK.o[1] + (q[1] - DECK.o[1] - off[1]) / DECK.k];
};
/** Start coords of an END-coords deck point (the deck's p 0 map). */
export const deckStartOf = (q: Pt): Pt => applyMat(planeMat(DECK, 0), q);

/** The figures. START: the contract's stranger (feet (300, 1225), 150 px feet-to-head) and Pip's seat (415, 1120: the
 *  bench backrest's top). END: the same points through the deck (stranger feet (318, 1238), Pip (366, 1195)). */
export const FIG = {
  start: {stranger: S5.start.stranger, pip: S5.start.pipSeat, pipSize: 108},
  end: {stranger: S5.end.stranger, pip: deckEndOf([S5.start.pipSeat.x, S5.start.pipSeat.y]), pipSize: 108 / DECK.k},
};

/** Scene times (0 = film 20.55). */
export const S5_T0 = 20.55;
export const T5 = {
  ...CRANE_T,
  /** "Pentagon" (heard 22.44): the plaque pops a frame before. */
  pentagon: 22.43 - S5_T0,
  swap: swapAt,
};

/** Is the crane past the swap (the tiny drawings shown)? */
export const swappedAt = (t: number) => t >= swapAt;
/** The progress at which the swap happens (for stills driven by p). */
export const SWAP_P = craneP(swapAt);

void startMat;
void boxMat;
void matScale;
