// V2S2 helper (lane L2): the shot's gentle PARALLAX float (owner, 2026-10-28; DIRECTION rule 8, COZY_AND_SCALE 3b.5;
// lib/depth floatAt / parallaxOffset; the pattern of V2S1_float). S2's camera pulls out of her dark window (the
// push-through's 12 % ease-out about M, 6.10-6.70), rests through the A outline's pop on "one" (6.82), then floats in five
// straight legs (each ramps its speed in and out: <= ~10 px/s at the near ground, the net offset within 12 px) and is home
// again at 12.80, so the B window match at 12.98 lands M exactly on (335, 785) from rest. Each plane shows its share of
// the float: our towpath 0.85, the bench / board / kiosk and the wall's near bays 0.6, the receding wall 0.45, the tiers
// 0.35, the far end of the canal 0.15, the sky and the captions nothing. Shadows and particles ride their plane's group.
import React from 'react';
import {useTime} from '../../lib/time';
import {floatAt, parallaxOffset, PARALLAX_SKY, type FloatLeg} from '../../lib/depth';

/** The float's legs (near-ground px from home, FILM seconds): rest to 7.00 (after the pull-back lands at 6.70 and the
 *  outline pops at 6.82), home from 12.80 (>= 0.15 s before the 12.98 match). */
export const S2_FLOAT_LEGS: FloatLeg[] = [
  {t0: 7.0, t1: 8.2, to: [-8, -3]},
  {t0: 8.2, t1: 9.4, to: [-3, -9]},
  {t0: 9.4, t1: 10.6, to: [5, -7]},
  {t0: 10.6, t1: 11.7, to: [6, 0]},
  {t0: 11.7, t1: 12.8, to: [0, 0]},
];
/** Home at these times (floatProblems): the push-through join, the pull-back's landing, the outline's pop, the match. */
export const S2_FLOAT_REST = [6.1, 6.7, 6.82, 12.8, 12.98];

/** The planes of S2 (lib/depth parallax planes; conform_L2 §10, THROUGHLINE §5b). */
export const S2_PLANE = {
  sky: PARALLAX_SKY,
  farEnd: 3,
  tiers: 2,
  wall: 1,
  subject: 0,
  towpath: -1,
} as const;

/** The near-ground float at film time t. */
export const s2Float = (t: number): [number, number] => floatAt(t, S2_FLOAT_LEGS) as [number, number];

/** One plane's group: translated by its share of the float (sub-pixel, never rounded); translate(0 0) at rest (the same
 *  tree every frame: nothing remounts when the float starts or stops). */
export const S2Plane: React.FC<{plane: number; children?: React.ReactNode}> = ({plane, children}) => {
  const t = useTime();
  const [dx, dy] = parallaxOffset(s2Float(t), plane);
  return <g transform={`translate(${dx.toFixed(3)} ${dy.toFixed(3)})`}>{children}</g>;
};
