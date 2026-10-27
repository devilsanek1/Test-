// V2S5_rig.ts (lane L4): the S5 crane rig as the shot uses it. The kit's rig (kit/dc/crane.ts: CRANE_T, craneP, the
// re-fit ease, DECK, T1_BOX, L2_BOX, the wipe, swapAt) is kept; the far and river planes are re-pinned here so the
// shot's own far plane (V2S5_far.tsx: its own horizon and end sun) still maps its sun EXACTLY onto SUN1 (250, 650)
// r 65 at p 0 (the S4 -> S5 match-cut), and the figures' seats come from the contract through the deck plane.
//   END coords = the screen when the crane lands (p 1); START coords = the screen of the held start (p 0).
import {S5, SUN1} from '../world/map';
import {CRANE_T, craneP, DECK, FAR, planeMat, startMat, applyMat, matScale, swapAt, type PullPlane} from '../kit/dc/crane';
import type {Pt} from '../../lib/sketch';
import {FAR_END} from './V2S5_far';

export {CRANE_T, craneP, DECK, swapAt, planeMat, startMat, applyMat, matScale};

/** The far plane, re-pinned on the shot's end sun: at p 0 the sun lands on SUN1 exactly (centre and radius). The
 *  scale k is the one that turns the end sun's radius into SUN1's; the slide makes the centre match. */
export const FAR_S5: PullPlane = (() => {
  const s = FAR_END.sun;
  const k = SUN1.r / s.r;
  const o = FAR.o;
  return {o, k, off: [SUN1.x - o[0] - k * (s.x - o[0]), SUN1.y - o[1] - k * (s.y - o[1])]};
})();


/** End coords of a START-coords point riding the deck (the inverse of the deck's p 0 map). */
export const deckEndOf = (q: Pt): Pt => {
  const off = DECK.off ?? [0, 0];
  return [DECK.o[0] + (q[0] - DECK.o[0] - off[0]) / DECK.k, DECK.o[1] + (q[1] - DECK.o[1] - off[1]) / DECK.k];
};

/** The figures. START: the contract's stranger (feet (300, 1225), 150 px feet-to-head) and Pip's seat (415, 1120).
 *  END: the same points through the deck (stranger feet (318, 1238), Pip (366, 1195): the orchestrator's end seat). */
export const FIG = {
  start: {stranger: S5.start.stranger, pip: S5.start.pipSeat, pipSize: 108},
  end: {stranger: S5.end.stranger, pip: deckEndOf([S5.start.pipSeat.x, S5.start.pipSeat.y]), pipSize: 108 / DECK.k},
};

/** Scene times (0 = film 20.55). */
export const T5 = {
  ...CRANE_T,
  /** "Pentagon" (heard 22.44): the plaque pops a frame before. */
  pentagon: 22.43 - 20.55,
  swap: swapAt,
};

/** Is the crane past the swap (the tiny drawings shown)? */
export const swapped = (t: number) => t >= swapAt;

void craneP;
void startMat;
void applyMat;
void matScale;
