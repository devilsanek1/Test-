// V2S3_rig.ts (lane L3): the clock, the camera (a parallax float, no zoom) and Pip's seat for V2S3 "Her window". FILM seconds
// (V2S3.tsx wraps the shot in <TimeShift by={-S3_START}>). Pure numbers: nothing here draws.
//
//   12.98  the B match: S2's dark office window at M = her lit home window at M (133 x 164; blind up, lamp on, her
//          silhouette on the phone), same screen spot and size; Pip in the same spot (590, 1050) on both sides
//   13.10-14.50  a gentle parallax float (two legs), home on the match and before the push-through
//   Pip sits on her terrace railing (590, 1050) from the first frame (S2's spot) · 13.90 "she": Pip turns to her (its one
//   reaction) · 14.28 "talking": her free hand · from 14.56 she stands still at x 330, head on (330, 742)
//   14.71-15.01  the A push-through into her head (centred 14.86, zoom 12, the plum bridge) into V2S4
import * as MAP from '../world/map';
import {floatAt, PARALLAX_SKY, type FloatLeg} from '../../lib/depth';

export const S3_START = 12.98;
export const S3_END = 14.86;

/** Heard word onsets (film s). */
export const S3_WORDS = {So: 13.16, why: 13.48, is: 13.72, she: 13.96, talking: 14.28, talkingEnd: 14.64} as const;

export const S3_BEATS = {
  match: S3_START,
  pipTurn: 13.9, // turns to her on "she" (13.96)
  hand: MAP.S3.handMovesAt, // 14.28
  still: MAP.S3.stillFrom, // 14.60
  pushT0: 14.71, // the push-through into her (14.71-15.01, centred on the cut)
} as const;

// ---------------------------------------------------------------- the camera (conform_L3 §1, DIRECTION rule 8)

/** The 5 % ease-back is RETIRED (no zoom in a hold): map S3.camera.easeBack is 1.00 -> 1.00; kept as 1. */
export const s3Zoom = (_t: number): number => 1;

/** The gentle PARALLAX float (lib/depth floatAt / parallaxOffset; S1's V2S1_float.tsx is the model): home on the B
 *  match frame (12.98: M exact), two straight legs (near-ground px; trapezoid speed, peak <= ~9.5 px/s, net <= 5 px),
 *  home again by 14.50 so the A push-through into her (14.71-15.01) starts from rest with her head on (330, 742). Each
 *  plane shows its share (lib/depth PARALLAX_K: near ground 1, the boat 0.85, the terrace 0.6, roofs 0.45, the far
 *  city 0.35-0.15, the sky and the captions 0). */
export const S3_FLOAT_LEGS: FloatLeg[] = [
  {t0: 13.1, t1: 13.8, to: [-4.5, -2]},
  {t0: 13.8, t1: 14.5, to: [0, 0]},
];
/** Home at these times (floatProblems): the match, from the float's end to the push-through. */
export const S3_FLOAT_REST = [12.98, 14.5, 14.6, 14.71, 14.86];
/** The near-ground float at film t. */
export const s3Float = (t: number): [number, number] => floatAt(t, S3_FLOAT_LEGS) as [number, number];

/** S3's parallax planes (THROUGHLINE §5b; lib/depth indices, fractional ones interpolate). */
export const S3_PLANE = {sky: PARALLAX_SKY, farCity: 2, roofs: 1, terrace: 0, water: -0.6, boat: -1, towpath: -2} as const;

/** The world must cover the frame plus the float's overscan (>= 40 px past every edge). */
export const S3_BLEED = {x0: -60, y0: -60, x1: 1160, y1: 2010} as const;

// ---------------------------------------------------------------- Pip (conform_L3 §1: seated, one turn, no hops)

/** Pip sits on her terrace's front railing below and right of her window at S2's screen spot (590, 1050) from the
 *  first frame: the same Pip on both sides of the B match (V2S3_pip continues L2's PIP_S2 track: its seed, size and
 *  last pose), turns to her on "she" (13.90, its one reaction), and stays: the push-through sweeps it. */
export const S3_PIP = {seat: [MAP.S3.pipSeat.x, MAP.S3.pipSeat.y] as [number, number]} as const;

/** Her silhouette in the French window (map S3): feet on the room floor y 862, 140 px (>= 137); from `stillFrom` she
 *  stands still at x `stillX` (her head on map S3.pushFrom (330, 742): the push-through's point). */
export const S3_HER = {
  x0: MAP.S3.pacingX[0],
  x1: MAP.S3.pacingX[1],
  y: MAP.S3.silhouette.feetY,
  h: MAP.S3.silhouette.h,
  stillFrom: MAP.S3.stillFrom,
  /** Her feet x when still: the phoneEar profile's head centre sits 1.5 px left of her feet (measured at full size,
   *  14.65: head x 314-343, y 724-752), so her head is centred on x 330; (330, 742) lies 4 px below its centre. */
  stillX: MAP.S3.pushFrom.x + 1.5,
  head: MAP.S3.pushFrom,
} as const;
