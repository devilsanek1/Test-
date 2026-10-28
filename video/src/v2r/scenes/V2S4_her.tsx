// V2S4_her.tsx (lane L3, V2S4 STORY part): HER, screen-fixed at x 720 while the world trucks (TREATMENT §3, §5 S4;
// plan_L3 §1). She walks LEFT (west) in profile, 170 px, her steps clocked by the truck's travel (V2S4_rig): the
// planted foot moves with the paving, the steps slow as the truck slows, and on "objected" (17.96) she stops in the
// passing position (the walk pose is held and its stride eases out: the lifted foot comes down over three drawings,
// never a pose switch or a pop). 18.06 her head lifts to the post and its plates (west, along the arrows) and she
// leans back a hair; when the APR plate starts (19.48) her eyes come down a line to read it.
// Never a protest gesture; she never touches the post. She is the ONLY teal in the frame (the kit's HER model sheet).
// TIER A (CRAFT §b-§c): the shot's subject with the tag and the post: her full outline at INK_PX.mid (the pen draws it
// 3.0 px in her own deep shades). LIGHT (RIG_CANAL, the low sun ahead of her at the left): her contact and cast shadows
// are the towpath's one ShadowLayer (V2S4_wpath: placed at her screen x, so they stay with her while the world trucks);
// here a form step on her far side (FormShade) and the RIM on her coat's left edge (the key side, 3.5 px inside the
// silhouette along her front, clipped to the coat: never on her hair or her legs).
//
// Honest feet. body.ts swings the planted leg as fx = hip - L sin(A sin(pi step)): fed a step count that is linear in
// the travel, that foot first lags the paving, then overtakes it (up to ~40 % off at mid-stance). `honestStep` warps
// the count inside each stance so the planted foot moves LINEARLY with the ground (exactly one 62 px step per stance),
// and each 12/s drawing samples the travel at the MIDDLE of its hold (the residual slip is +-4.6 px, never one-sided).
import React, {useId} from 'react';
import {useTime} from '../../lib/time';
import {XG, mat} from '../../lib/xf';
import {Tier} from '../../lib/tier';
import {FormShade, Rim} from '../../lib/light';
import {INK_PX} from '../palette';
import {HER, Person, strideFor} from '../kit/cast';
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

/** Her coat's band (screen px: her shoulders to her hem), where the rim may land. */
const COAT_BAND = {y0: S4_HER.feetY - S4_HER.h * 0.8, y1: S4_HER.feetY - S4_HER.h * 0.17} as const;

export const S4Her: React.FC = () => {
  const t = useTime();
  const clip = 's4herCoat' + useId().replace(/[^a-zA-Z0-9]/g, '');
  const {x, feetY: y, h} = S4_HER;
  const stopped = t >= S4_BEATS.stop;
  const lean = stopped ? herLean(t) : 0;
  const fig = (
    <Person
      x={x}
      y={y}
      h={h}
      seed="s4her"
      exact
      ink={INK_PX.mid}
      model={MODEL}
      traits={HER}
      pose="walk"
      view="profile"
      step={stopped ? S4_TRUCK.steps : herStepAt(t)}
      stride={herStrideAt(t)}
      tilt={stopped ? herTilt(t) : 0}
    />
  );
  return (
    <Tier tier="subject">
      <XG m={lean ? mat.about(mat.rotate(lean), x, y) : mat.I}>
        {fig}
        <FormShade of={fig} c={[x, y - h / 2]} size={[h * 0.36, h]} />
        <defs>
          <clipPath id={clip} clipPathUnits="userSpaceOnUse">
            <rect x={x - h * 0.4} y={COAT_BAND.y0} width={h * 0.8} height={COAT_BAND.y1 - COAT_BAND.y0} />
          </clipPath>
        </defs>
        <g clipPath={`url(#${clip})`}>
          <Rim of={fig} c={[x, y - h * 0.45]} size={[h * 0.34, h * 0.6]} width={3.5} cover={0.35} />
        </g>
      </XG>
    </Tier>
  );
};
