// K4 cast: walking. A walk is a STEP COUNT (1 step = one foot forward; 2 steps = one gait cycle). Drawn poses step at
// 12 drawings/s (the house rule: drawn poses may step, ambient motion moves every frame), so the step count is sampled
// on a 12/s clock; the body's travel (x / y) is the lane's and moves every frame.
//
//   const step = stepsAt(t, [{from: 0.97, to: 4.54, rate: 1.6}, {from: 4.98, to: 5.28, rate: 3.4}]);   // walk, stop, one step
//   <Her pose="walk" step={step} ... />  <Ghost step={step} ... />   // the same number = lockstep
//   <Person pose="walk" walk={{rate: 1.8}} ... />                      // or let the figure clock itself (12/s)
//
// Stopping mid-stride freezes the pose where it is (the step count holds), which is S1's "…" stop.

/** A walking interval: `rate` steps per second between `from` and `to` (scene s). */
export type WalkSeg = {from: number; to: number; rate: number};

/** Time sampled at `fps` drawings per second. */
export const drawn = (t: number, fps = 12) => Math.floor(t * fps + 1e-6) / fps;

/** Steps taken by time t over the segments, on the 12 drawings/s clock (`fps`). `start` = steps already taken. */
export function stepsAt(t: number, segs: WalkSeg[], start = 0, fps = 12): number {
  const tq = drawn(t, fps);
  let s = start;
  for (const g of segs) {
    if (tq <= g.from) continue;
    s += g.rate * (Math.min(tq, g.to) - g.from);
  }
  return s;
}

/** Steps for a walker that clocks itself: `rate` steps/s from `t0` (default 0), phase offset `phase` (steps). */
export const selfSteps = (t: number, rate: number, t0 = 0, phase = 0, fps = 12) => phase + rate * (drawn(t, fps) - t0);

/** Distance travelled (px) for a stride length `stride` px per step: lanes keep the feet honest with it. */
export const travel = (steps: number, stride: number) => steps * stride;

/** Gait state for a step count: cycle angle (rad), which foot leads, swing lifts, body bob (fractions of H). */
export type Gait = {
  /** Cycle angle: one full turn = 2 steps. */
  a: number;
  /** sin / cos of the cycle angle. */
  s: number;
  c: number;
  /** Near (screen-front) leg swing amount 0..1 and far leg. */
  liftNear: number;
  liftFar: number;
  /** Vertical bob, -1 (highest, legs passing) .. 0. */
  bob: number;
};

export function gaitOf(step: number): Gait {
  const a = Math.PI * step;
  const s = Math.sin(a);
  const c = Math.cos(a);
  return {a, s, c, liftNear: Math.max(0, c), liftFar: Math.max(0, -c), bob: -Math.abs(c)};
}

/** Standing still (no gait). */
export const STILL: Gait = {a: 0, s: 0, c: 0, liftNear: 0, liftFar: 0, bob: 0};

/** Stride factor that keeps the feet from sliding: one step of `stepPx` screen px for a figure H px tall (the legs
 *  swing +-22 deg at stride 1 in profile; a rear 3/4 walk is foreshortened to 0.62 of that). S1: her 27 px steps
 *  (strideFor(27, 170, 'rear34') ~ 0.71) at ~1.5 steps/s = her 40 px/s stroll; S4: strideFor(34, 170) ~ 0.56. */
export function strideFor(stepPx: number, H: number, view: 'back' | 'rear34' | 'profile' = 'profile'): number {
  const L = 0.47 * H;
  const th = Math.asin(Math.min(0.9, stepPx / (2 * L)));
  const A0 = ((22 * Math.PI) / 180) * (view === 'rear34' ? 0.62 : 1);
  return th / A0;
}
