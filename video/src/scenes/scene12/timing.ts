// S12 beat sheet + the rewind's time warp. Every S12 time here is SCENE-LOCAL seconds (local = film - S12_START).
// Word starts: assets/timing.json (recorded take, w165..w177); beats: docs/storyboard_v3_resolved.json (S12), with the
// ENGINE rule-5 leads where a motion must LAND on its word.
//
// How the scene works (docs/scenes/S12.md): S12 replays S01's own plaza code (scene01/*: the set, the shutters,
// padlocks, tags, screens, citizens, pigeons, Pip, the sun) through a TimeProvider whose clock is an "S01 clock" W(t):
//   P phase (cut -> 'before'): W = P_W0 + t runs FORWARD in S01's settled tail (every S01 event is done by 4.45 s), so
//     the plaza sits in the state S01 left while its idle life runs; S12's own beats (tags swing, pigeons land, phones
//     lower, a point, Pip lands and nods, padlocks glint) are extra events placed in that clock.
//   R phase ('before' -> END): W runs BACKWARDS through S01 (4.45 -> 0) as a TAPE: one S01 time per 12-fps step (every
//     pose held 2-3 frames), each step a readable pose of a reversed S01 beat, placed on its S12 word (R_STEPS). It
//     reaches 0 = S01's frame 0 (the bottom of the press, govB's screen the bright line) at 2.963 and holds it: the
//     last frame IS frame 0 (0 px). The camera, Bit's walk home, S11's note and the glyph swaps run on own clocks.
import {B as S01} from '../scene01/timing';

/** S12's start on the film timeline (src/data/scenes.json). */
export const S12_START = 52.163;
/** S12's end = the voice's duration (the loop seam). */
export const S12_END = 55.36;
export const DUR = S12_END - S12_START; // 3.197

/** Film seconds -> S12-local seconds. */
const L = (abs: number) => +(abs - S12_START).toFixed(4);

/** Word starts (assets/timing.json), local. */
export const W = {
  and: L(52.43),
  some: L(52.51),
  of: L(52.675),
  those: L(52.805),
  governments: L(53.015),
  did: L(53.51),
  it: L(53.645),
  before: L(53.76),
  there: L(54.065),
  was: L(54.225),
  even: L(54.395),
  a: L(54.565),
  fix: L(54.725),
  fixEnd: L(55.235),
} as const;

/** Beats (local). */
export const B = {
  // 'And' w165: Pip lands on his bollard (from S11's leap toward the lens), scale 1.0
  pipLand: W.and,
  pipApex: 0.05,
  // 'some' w166: the lettered 'back soon' tags swing once (govB, then govA, 0.05 s apart): these ones did it
  tagSwing: [W.some - 0.04, W.some + 0.01],
  // 'those' w168: two pigeons land on the dark lamp crossbar (touch-down ON the word; the fly-in leads it)
  pigeonsLand: [W.those - 0.02, W.those + 0.05],
  pigeonFly: 0.34, // fly-in duration
  // w168+0.20: a citizen (sB) points at govB; lowers it before 'did' (fix round 1: down by ~53.40, so it does not
  // compete with Pip's nod and the 'did' beat)
  point: L(53.005) - 0.05,
  pointDown: 1.12,
  // 'governments' w169: the citizens lower their phones (fA on the word; [1] unused; the big left edge onlooker's phone
  // leads it by rule 5's small-element lead (fix round 1: it is the largest move, so it fills the gap after 'those'))
  phonesDown: [W.governments - 0.05, W.governments + 0.03, W.governments - 0.085],
  // heads turn back to the plaza after the phones are down (back-view before the rewind starts)
  headsBack: [W.governments + 0.2, W.governments + 0.26, W.governments + 0.32, W.governments + 0.38],
  // w169+0.25: a pigeon flaps (a flutter-hop on the bar); govA's tag twirls once more (a second swing)
  pigeonFlap: L(53.265),
  tagTwirlA: L(53.265) - 0.02,
  // S11's sticky note (carried into the wide) curls its corner in the breeze on 'of' and after 'governments'
  noteCurl: [W.of - 0.04, W.governments + 0.3],
  // the near observer leans in toward govB on 'those', straightens on 'did'
  nearLean: W.those - 0.1,
  nearBack: W.did - 0.06,
  // 'did' w170: Pip nods (sit-back squash pulse +0.08 -> 0, 0.2 s); the padlocks glint at once
  nod: W.did - 0.02,
  glint: W.did,
  // 'before' w172-0.05: THE REWIND. The power glyph shrinks out, the bold cream REWIND glyph pops in; S01 starts
  // playing backwards (the R phase below)
  powerOut: L(53.71) - 0.06,
  rewindIn: L(53.71),
  rewindNudge: [W.there - 0.02, W.was - 0.02, W.even - 0.02],
  // 'fix.' w177: the rewind glyph pops back to the bold power glyph
  // (fix round 1: the same lead as the 'before' swap, so the power glyph is full size by ~W.fix + 0.03)
  rewindOut: W.fix - 0.11,
  powerIn: W.fix - 0.05,
  // after the power glyph's pop has settled, the scene hands the glyph back to S01's own (S01Glyph in the S01 clock)
  // so the last frame is S01's frame 0 to the pixel
  powerHandBack: W.fix + 0.42,
  // END-0.55 .. END-0.04: Bit walks BACKWARDS along govA's cornice to his frame-0 spot (the film's last motion)
  bitWalk: [DUR - 0.55, DUR - 0.04] as [number, number],
} as const;

// ---------------------------------------------------------------- the S01 clock W(t)

/** The rewind starts on 'before' (w172-0.05). */
export const R0 = B.rewindIn;
/** The tape's step rate: every reversed pose is held 2-3 frames at 30 fps. */
export const REWIND_FPS = 12;
/** P phase: S01's settled tail (every S01 event, the onlooker's phone and Pip's look-back included, is done by 4.45 s;
 *  the lock ring 4.185 and Pip's exit 4.35 are not drawn by S12). */
export const P_W0 = 4.45;

/** The R phase as a TAPE: one S01 time per 12-fps step (k = 0 on 'before'), each picked so the step shows a readable
 *  pose of an S01 beat in reverse and lands on its S12 word (storyboard S12 beats; ENGINE rule 5: a step leads its word
 *  by <= 0.02). Expressed through S01's own beat table (scene01/timing.ts), so a retimed S01 keeps the rewind in step.
 *  Fix round 1: 18 steps (was 19: the lamp no longer has a step of its own, govB's dome lantern relights WITH Pip's
 *  reversed hop on 'there', the lamp with govC's half shutter), so every pose after 'was' sits on its word and frame 0
 *  arrives at 2.963 (film 55.13; 7 frames held to the seam).
 *    k  local  film   word      W     the pose
 *    0  1.547  53.71  'before'  4.45  the plaza as S01 left it (the rewind glyph pops in)
 *    1  1.630  53.79            3.80  the tags swing back UP (govA's shrinking, govB's swinging)
 *    2  1.713  53.88            3.72  govB's tag a small swinging pop, govA's gone
 *    3  1.797  53.96            3.42  the padlocks pop off (govB's in its overshoot, govA's small, govC's gone)
 *    4  1.880  54.04  'there'   2.96  Pip's startle hop backwards: mid-air at the apex (+ startle ticks); fA's phone up
 *                                     again; govB's dome lantern relit (DOME_LANTERN_R 2.97)
 *    5  1.963  54.13            2.32  Pip back on the bollard; the lamp + govA's door lanterns relit; govC's shutter
 *                                     half way up (its 0.113 s fall)
 *    6  2.047  54.21  'was'     1.93  govC's shutter up; govA's half way (0.7 of its 0.16 s ease-in slam)
 *    7  2.130  54.29            1.66  govA's up (govA one step lighter); govB's half way
 *    8  2.213  54.38  'even'    1.36  govB's up; the far civic silhouettes relight right to left (two lit)
 *    9  2.297  54.46            1.20  five lit
 *   10  2.380  54.54  'a'       0.98  all lit; govC's screen un-collapses (dot); the first pigeon lifts off backwards
 *   11  2.463  54.63            0.82  govC's screen lit; the pigeons fly backwards off the crossbar
 *   12  2.547  54.71  'fix.'    0.70  govA's screen comes back as the bright line
 *   13  2.630  54.79            0.55  govA's screen lit
 *   14  2.713  54.88            0.40  heads swap back, the walker walks backwards
 *   15  2.797  54.96            0.24  Pip's look at govB undone; govB's screen still dark
 *   16  2.880  55.04  END-0.32  0.02  ONE STEP BEFORE THE PRESS: govB's dot grows back to the line, the sun squashes
 *                                     DOWN (release scale ~0.93, half way to 0.88), the ripple contracts
 *   17  2.963  55.13            0     frame 0: the bottom of the press (0.88), ripple + press ticks at their emission
 *                                     radius; held to the seam (only Bit and the caption roll move)
 */
export const R_STEPS: number[] = [
  P_W0,
  S01.tags[1] + 0.055,
  S01.tags[0] + 0.025,
  S01.padlocks[1] + 0.015,
  (S01.pipHop + S01.pipLand) / 2,
  S01.slamC + 0.08,
  S01.slamA + 0.112,
  S01.slamB + 0.112,
  S01.civicOff[0] + 0.205,
  S01.civicOff[0] + 0.045,
  S01.crtC + 0.095,
  S01.crtC - 0.065,
  S01.crtA + 0.07,
  S01.crtA - 0.08,
  S01.heads + 0.06,
  0.24,
  0.02,
  0,
];
/** govB's dome lantern: S01 switches it off on 'PURPOSE' (3.955); the S12 rewind relights it on 'there' WITH Pip's
 *  reversed hop (step 4, W 2.96), one step before the lamp (storyboard: "govB's dome lantern, then the lamp"). Frame 0
 *  is unaffected (lit either way). */
export const DOME_LANTERN_R = (S01.pipHop + S01.pipLand) / 2 + 0.01;

/** The tape step index at S12-local t (0 on 'before'). */
export const stepIndex = (t: number) => Math.floor((t - R0) * REWIND_FPS + 1e-6);

/** True from 'before' on (the R phase). */
export const inRewind = (t: number) => t >= R0;

/** The S01 clock at S12-local t. */
export function s01Clock(t: number): number {
  if (t < R0) return P_W0 + t;
  return R_STEPS[Math.min(R_STEPS.length - 1, stepIndex(t))];
}

/** S12-local t -> the P-phase S01 clock (for placing S12's own beats in it). */
export const pClock = (t: number) => P_W0 + t;
