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
//     reaches 0 = S01's frame 0 (the bottom of the press, govB's screen the bright line) at 2.880 (first drawn f87) and
//     holds it: the last frame IS frame 0 (0 px). The camera, Bit's walk home, S11's note, the glyph swaps and Pip's
//     reversed hop (pipClockR) run on their own clocks.
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
  // fix round 1: the apex is just BEFORE the cut, so the first frame is already falling (S11 hands him off rising; the
  // wide picks him up over the top of the arc, drifting right onto the bollard)
  pipApex: -0.03,
  // 'some' w166: the lettered 'back soon' tags swing once (govB, then govA, 0.05 s apart): these ones did it
  tagSwing: [W.some - 0.04, W.some + 0.01],
  // 'those' w168: two pigeons land on the dark lamp crossbar (touch-down ON the word; the fly-in leads it)
  pigeonsLand: [W.those - 0.02, W.those + 0.05],
  pigeonFly: 0.34, // fly-in duration
  // w168+0.20: a citizen (sB) points at govB; lowers it before 'did' (fix round 1: 1.10 -> down by 1.30 = 53.46, one
  // frame before Pip's nod and the 'did' tags / sparkles, so it no longer competes with them; was 1.24 -> 53.60)
  point: L(53.005) - 0.05,
  pointDown: 1.1,
  // 'governments' w169: the citizens lower their phones: fA just before the word; [1] unused; the big left edge
  // onlooker's phone (the largest move in the frame) leads it like a big build (rule 5: -0.25..-0.40 completes on the
  // word; -0.17 + its 0.22 s ease lands at 'governments' + 0.05). Fix round 1: was +0.06, so f20-f28 after the
  // pigeons' touch-down were dead / near-dead; now its arm fills f21-f27)
  phonesDown: [W.governments - 0.05, W.governments + 0.03, W.governments - 0.17],
  // heads turn back to the plaza after the phones are down (back-view before the rewind starts)
  headsBack: [W.governments + 0.2, W.governments + 0.26, W.governments + 0.32, W.governments + 0.38],
  // w169+0.25: a pigeon flaps (a flutter-hop on the bar); govA's tag twirls once more (a second swing; fix round 1: at
  // w169+0.12, so it fills the lull after the phones and the point, f30-f33; the flap keeps +0.25)
  pigeonFlap: L(53.265),
  tagTwirlA: W.governments + 0.12,
  // S11's sticky note (carried into the wide) curls its corner in the breeze on 'of' and after 'governments'
  noteCurl: [W.of - 0.04, W.governments + 0.3],
  // the near observer leans in toward govB on 'those' and straightens on the tail of 'governments' (A1 fix round 1,
  // review: f28-f38 after the phones were near-still, 700-3,700 px^2 / frame; the largest figure in the frame now moves
  // over f31-f37, staggered with the pigeon's flutter-hop f34-f36, so 'did' keeps its own focal: tags, sparkles, Pip's
  // nod; was did - 0.06)
  nearLean: W.those - 0.1,
  nearBack: W.governments + 0.18,
  // A1 fix round 1: the crossbar pigeon's flap on 'governments' + 0.25 is a wings-open flutter-hop (3 frames in the air,
  // cast.tsx PigeonP + FlapFlyer), not the 6 px shuffle hop of a ~25 px bird
  pigeonFlapDur: 0.1,
  // 'did' w170: Pip nods (sit-back squash pulse +0.08 -> 0, 0.2 s); the padlocks glint at once
  nod: W.did - 0.02,
  glint: W.did,
  // fix round 1, the phone-readable 'did' focal: both lettered tags kick together (pendulum 14 deg, 0.5 s) and a big
  // cream sparkle pops on each padlock, ON the word
  tagDid: W.did - 0.03,
  sparkle: W.did - 0.02,
  // 'before' w172: THE REWIND glyph swap. Fix round 2 (review: 1-frame double-glyph smudge at f48, the REWIND glyph
  // only full on f49, 0.036 s after the word): the two glyphs NEVER share a frame. The power glyph shrinks out (0.12 s
  // in-cubic: 0.99 / 0.87 / 0.51 on f42-f44) and is gone by f45; the REWIND glyph is first drawn on f45 (`rewindShow`)
  // already mid-pop (its spring origin `rewindIn` is 2 frames earlier: 0.51 / 0.79 / 0.97 / 1.05 on f45-f48), so it is
  // full by f47 (53.73) and at its overshoot peak ON 'before' (f48, 53.76). The tape (R0) still starts at 53.71.
  rewindShow: W.before - 0.1,
  rewindIn: W.before - 0.1 - 0.066,
  powerOut: W.before - 0.1 - 0.125,
  rewindNudge: [W.there - 0.02, W.was - 0.02, W.even - 0.02],
  // 'fix.' w177: the rewind glyph pops back to the bold power glyph, the same sequenced swap: the rewind glyph shrinks
  // out (0.99 / 0.86 / 0.48 on f71-f73), the power glyph is first drawn on f74 mid-pop (0.52 / 0.80 / 0.97 / 1.05 on
  // f74-f77): full by f76, overshoot peak ON 'fix.' (f77, 54.73)
  powerShow: W.fix - 0.1,
  powerIn: W.fix - 0.1 - 0.066,
  rewindOut: W.fix - 0.1 - 0.125,
  // after the power glyph's pop has settled, the scene hands the glyph back to S01's own (S01Glyph in the S01 clock)
  // so the last frame is S01's frame 0 to the pixel
  powerHandBack: W.fix + 0.42,
  // END-0.55 .. END-0.04: Bit walks BACKWARDS along govA's cornice to his frame-0 spot (the film's last motion)
  bitWalk: [DUR - 0.55, DUR - 0.04] as [number, number],
} as const;

// ---------------------------------------------------------------- the S01 clock W(t)

/** The rewind starts on 'before' (w172-0.05 = 53.71, the storyboard time; independent of the glyph's own clock). */
export const R0 = L(53.71);
/** The tape's step rate: every reversed pose is held 2-3 frames at 30 fps. */
export const REWIND_FPS = 12;
/** P phase: S01's settled tail (every S01 event, the onlooker's phone and Pip's look-back included, is done by 4.45 s;
 *  the lock ring 4.185 and Pip's exit 4.35 are not drawn by S12). */
export const P_W0 = 4.45;

/** The R phase as a TAPE: one S01 time per 12-fps step (k = 0 on 'before'), each picked so the step shows a readable
 *  pose of an S01 beat in reverse and lands on its S12 word (storyboard S12 beats; ENGINE rule 5: a step leads its word
 *  by <= 0.02). Expressed through S01's own beat table (scene01/timing.ts), so a retimed S01 keeps the rewind in step.
 *  Fix round 1: 18 steps (was 19: the lamp no longer has a step of its own, govB's dome lantern relights WITH Pip's
 *  reversed hop on 'there', the lamp with govC's half shutter), so every pose after 'was' sits on its word.
 *  Fix round 2: 17 steps (old steps 14 'heads swap back' + 15 'Pip's look undone' merged into one W 0.30 step: the
 *  heads, the walker, the pigeons and Pip's look all reverse on it), so the step one before the press lands on f84
 *  (54.96, was 55.04) and frame 0 on f87 (film 55.063, +1.6 frames from the storyboard's 55.01, was +3.6), held 9 frames.
 *  Pip's reversed startle hop runs on its own 3-pose tape from 'there' (PIP_R_STEPS below), so steps 4-5 only carry
 *  the rest of the plaza.
 *  Fix round 3: step 14 is W 0.115 (was 0.30, S01's ripple was already gone, so the ring and the press ticks popped in
 *  on f84 near their emission radius): f82 shows the ring out at ~r185 with the sun nearly released, f84 (W 0.02)
 *  ~r160 / ~0.93, f87 (W 0) r155 / 0.88: a three-pose reversed press. The crossbar pigeons and the front walker fC run
 *  on their own stepped clocks (PIGEON_R_STEPS from 'even', WALKER_R_STEPS from 'a', below), so their reversed beats
 *  land on their storyboard words instead of following the tape's S01 order.
 *    k  local  film   word      W     the pose
 *    0  1.547  53.71  'before'  4.45  the plaza as S01 left it (the rewind glyph pops in)
 *    1  1.630  53.79            3.80  the tags swing back UP (govA's shrinking, govB's swinging)
 *    2  1.713  53.88            3.72  govB's tag a small swinging pop, govA's gone
 *    3  1.797  53.96            3.42  the padlocks pop off (govB's in its overshoot, govA's small, govC's gone)
 *    4  1.880  54.04  'there'   2.96  fA's phone up again; govB's dome lantern relit (DOME_LANTERN_R 2.97); Pip's own
 *                                     tape starts (PIP_R_STEPS: low, apex, lift-off, f57-f63)
 *    5  1.963  54.13            2.32  the lamp + govA's door lanterns relit; govC's shutter half way up (its 0.113 s
 *                                     fall)
 *    6  2.047  54.21  'was'     1.93  govC's shutter up; govA's half way (0.7 of its 0.16 s ease-in slam)
 *    7  2.130  54.29            1.66  govA's up (govA one step lighter); govB's half way
 *    8  2.213  54.38  'even'    1.36  govB's up; the far civic silhouettes relight right to left (two lit)
 *    9  2.297  54.46            1.20  five lit
 *   10  2.380  54.54  'a'       0.98  all lit; govC's screen un-collapses (dot) (the front walker's own tape starts:
 *                                     WALKER_R_STEPS)
 *   11  2.463  54.63            0.82  govC's screen lit
 *   12  2.547  54.71  'fix.'    0.70  govA's screen comes back as the bright line
 *   13  2.630  54.79            0.55  govA's screen lit
 *   14  2.713  54.88            0.115 heads swap back, Pip's look at govB undone; govB's screen the dot; the ripple
 *                                     ring out at ~r185, the sun nearly released (fix round 3: was 0.30)
 *   15  2.797  54.96  END-0.40  0.02  ONE STEP BEFORE THE PRESS: govB's dot grows back to the line, the sun squashes
 *                                     DOWN (release scale ~0.93, half way to 0.88), the ripple contracts to ~r160, the
 *                                     press ticks back
 *   16  2.880  55.04            0     frame 0 (first drawn f87, 55.063): the bottom of the press (0.88), ripple + press
 *                                     ticks at their emission radius; held 9 frames to the seam (only Bit and the
 *                                     caption roll move)
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
  S01.pipFlinch - 0.005,
  0.02,
  0,
];
/** govB's dome lantern: S01 switches it off on 'PURPOSE' (3.955); the S12 rewind relights it on 'there' WITH Pip's
 *  reversed hop (step 4, W 2.96), one step before the lamp (storyboard: "govB's dome lantern, then the lamp"). Frame 0
 *  is unaffected (lit either way). */
export const DOME_LANTERN_R = (S01.pipHop + S01.pipLand) / 2 + 0.01;

/** Pip's reversed startle hop on his OWN tape (fix round 2, review: on the shared tape the hop was one 2-frame apex
 *  pose, unreadable as a hop): from 'there' - 0.02, three S01 poses at 12 fps (2-3 frames each, f57-f63 in the air):
 *  low before the landing (8 px up, startle ticks full), the apex (34 px), just after the lift-off (22 px); then the
 *  shared tape again (sit-back, the hop undone). */
export const PIP_R0 = W.there - 0.02;
export const PIP_R_STEPS: number[] = [S01.pipLand - 0.01, (S01.pipHop + S01.pipLand) / 2, S01.pipHop + 0.03];

/** A stepped own clock for one actor (12 fps from `r0`, one S01 time per step); after its last step it follows the shared
 *  tape but never runs back up past that step (min), so it lands on W 0 with everything else. */
function ownTape(t: number, r0: number, steps: number[]): number {
  if (t < r0) return s01Clock(t);
  const k = Math.floor((t - r0) * REWIND_FPS + 1e-6);
  return k < steps.length ? steps[k] : Math.min(steps[steps.length - 1], s01Clock(t));
}

/** Fix round 3 (review: on the shared tape the pigeons' reversed landing played on 'a' / 'fix.' and the walker's on step
 *  14, 5-15 frames after their storyboard words, because the tape replays S01's true event order). The crossbar pigeons
 *  get their OWN tape from 'even' - 0.02 (f67): wings out on the perch (W 0.85, S01's last instant of the fly-in), mid
 *  flight back along the arc (0.5), at the left edge (0.2), gone (0.02: no pigeon before S01's landAt 0.12). */
export const PIGEON_R0 = W.even - 0.02;
export const PIGEON_R_STEPS: number[] = [S01.pigeonsLand - 0.035, 0.5, 0.2, 0.02];
export const pigeonClockR = (t: number) => ownTape(t, PIGEON_R0, PIGEON_R_STEPS);
/** The front walker fC (S01: walking away at frame 0, slows 0.26, stops 0.38 on 'Governments' with a 3/4 head toward
 *  govB) gets his own tape from 'a' - 0.02 (f72): un-stopped, head back to the back view, leaning upright (0.30), then
 *  two walk-cycle poses backwards (0.15, 0.02); W 0 with the rest on f87. */
export const WALKER_SEED = 's01/fC';
export const WALKER_R0 = W.a - 0.02;
export const WALKER_R_STEPS: number[] = [S01.heads - 0.04, 0.15, 0.02];
export const walkerClockR = (t: number) => ownTape(t, WALKER_R0, WALKER_R_STEPS);

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

/** Pip's S01 clock in the R phase: the shared tape, except his own 3 hop poses from PIP_R0. */
export function pipClockR(t: number): number {
  const k = Math.floor((t - PIP_R0) * REWIND_FPS + 1e-6);
  return k >= 0 && k < PIP_R_STEPS.length ? PIP_R_STEPS[k] : s01Clock(t);
}
