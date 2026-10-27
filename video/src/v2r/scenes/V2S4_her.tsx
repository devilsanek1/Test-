// V2S4_her.tsx (lane L3, V2S4 STORY part): HER, screen-fixed at x 720 while the world trucks (TREATMENT §3, §5 S4;
// plan_L3 §1). She walks LEFT (west) in profile, 170 px, her steps clocked by the truck's travel (V2S4_rig): the
// planted foot moves with the paving, the steps slow as the truck slows, and on "objected" (17.96) she stops in the
// passing position (one foot comes down: a tiny settle, never a pop of the figure). 18.06 her head lifts to the post
// and its plates (west, along the arrows); when the APR plate starts (19.48) her eyes come down a line to read it.
// Never a protest gesture; she never touches the post. She is the ONLY teal in the frame (the kit's HER model sheet).
//
// Honest feet. body.ts swings the planted leg as fx = hip - L sin(A sin(pi step)): fed a step count that is linear in
// the travel, that foot first lags the paving, then overtakes it (up to ~40 % off at mid-stance). `honestStep` warps
// the count inside each stance so the planted foot moves LINEARLY with the ground (exactly one 62 px step per stance),
// and each 12/s drawing samples the travel at the MIDDLE of its hold (the residual slip is +-4.6 px, never one-sided).
import React, {useMemo} from 'react';
import {useTime} from '../../lib/time';
import {XG, mat} from '../../lib/xf';
import {CM} from '../palette';
import {HER, Person, strideFor} from '../kit/cast';
import {Batch, Paint} from '../kit/canal/core';
import {S4_BEATS, S4_HER, S4_TRUCK, s4Travel} from './V2S4_rig';

/** Her stride factor (the feet never slide: one step = 62 px at 170 px tall). */
export const HER_STRIDE = strideFor(S4_HER.stepPx, S4_HER.h);
/** body.ts profile leg swing amplitude (22 deg x stride). */
const SWING = ((22 * Math.PI) / 180) * HER_STRIDE;

/** Warp a travel-linear step count so the planted foot tracks the ground linearly (see header). Identity at every
 *  half step (contact, passing position, toe-off), monotone in between. */
export function honestStep(s: number): number {
  const sp = s - 0.5; // stances run n + 0.5 -> n + 1.5
  const n = Math.floor(sp);
  const u = sp - n;
  const g = Math.asin((1 - 2 * u) * Math.sin(SWING)) / SWING; // the planted leg's swing phase for linear travel
  return n + 0.5 + Math.acos(Math.max(-1, Math.min(1, g))) / Math.PI;
}

/** Her step count at film t: 12 drawings/s, each sampled at the middle of its hold, capped at the stop (5.0 = the
 *  passing position, where one foot comes down into the stand). */
export function herStepAt(t: number): number {
  const tq = Math.floor(t * 12 + 1e-6) / 12;
  const travel = s4Travel(Math.min(tq + 1 / 24, S4_BEATS.stop));
  return honestStep(Math.min(S4_TRUCK.steps, travel / S4_HER.stepPx));
}

/** Her head after the stop, stepped at 12 drawings/s: level -> lifts to the post and the DEC plate (18.06) -> down a
 *  line to the APR plate as it pens (19.48). Degrees, + = UP for her left-facing profile: body.ts rotates the head with
 *  y-down maths, so its "- = up" note (and Her.tsx stopLook's -9) is inverted for a figure facing left. */
export function herTilt(t: number): number {
  const tq = Math.floor(t * 12 + 1e-6) / 12;
  const k = (a: number, d: number) => {
    const u = Math.max(0, Math.min(1, (tq - a) / d));
    return 1 - (1 - u) * (1 - u) * (1 - u);
  };
  return 18 * k(S4_BEATS.lookUp, 0.24) - 9 * k(19.48, 0.25);
}

/** The model as Her.tsx draws it (cheek crescent on, the cream tote). */
const MODEL = {...HER, cheek: true};

/** Her shadow on the paving (STYLE §2: one sun low in the west, shadows are colour, flat, SHORT: <= ~40 px past the
 *  object): the same east-falling quad the world's walkers get (V2S4_wcore SHADOW), so one light rules the frame. */
const HerShadow: React.FC = () => {
  const b = useMemo(() => {
    const x = S4_HER.x;
    const y = S4_HER.feetY;
    const w = S4_HER.h * 0.22;
    const len = 34;
    const s = new Batch();
    s.poly(CM.stoneShade, [
      [x - w * 0.5, y - 1],
      [x + w * 0.5, y - 2],
      [x + w * 0.5 + len, y + 4],
      [x - w * 0.3 + len * 0.9, y + 6],
    ]);
    return s;
  }, []);
  return <Paint b={b} seed="s4herShadow" misreg={false} />;
};

/** The stop: she arrives at step 5.0, the passing position (both legs plumb under the hip, the far foot lifted). The
 *  walk pose is HELD there and its stride eases to 0 over three drawings, so the lifted foot comes down and the knee
 *  straightens with no slide (at step 5.0 the leg angles are 0 whatever the stride): no switch, no pop. */
export function herStrideAt(t: number): number {
  if (t < S4_BEATS.stop) return HER_STRIDE;
  const tq = Math.floor(t * 12 + 1e-6) / 12;
  const u = Math.max(0, Math.min(1, (tq - S4_BEATS.stop + 1 / 12) / 0.25));
  return HER_STRIDE * (1 - u * u * (3 - 2 * u));
}

/** Looking up at a tall sign she leans back a hair from the ankles (degrees, + = back for her left-facing profile),
 *  with the head lift; it eases off a little when her eyes come down to the APR plate. Stepped at 12/s like the pose. */
export function herLean(t: number): number {
  const tq = Math.floor(t * 12 + 1e-6) / 12;
  const k = (a: number, d: number) => {
    const u = Math.max(0, Math.min(1, (tq - a) / d));
    return u * u * (3 - 2 * u);
  };
  return 1.6 * k(S4_BEATS.lookUp + 0.04, 0.3) - 0.7 * k(19.5, 0.3);
}

export const S4Her: React.FC = () => {
  const t = useTime();
  const {x, feetY: y, h} = S4_HER;
  const stopped = t >= S4_BEATS.stop;
  const lean = stopped ? herLean(t) : 0;
  return (
    <>
      <HerShadow />
      <XG m={lean ? mat.about(mat.rotate(lean), x, y) : mat.I}>
      <Person
        x={x}
        y={y}
        h={h}
        seed="s4her"
        exact
        ink={3.4}
        model={MODEL}
        traits={HER}
        pose="walk"
        view="profile"
        step={stopped ? S4_TRUCK.steps : herStepAt(t)}
        stride={herStrideAt(t)}
        tilt={stopped ? herTilt(t) : 0}
      />
      </XG>
    </>
  );
};
