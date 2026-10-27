// V2S3_rig.ts (lane L3): the clock, the camera and Pip's two leaps for V2S3 "Her window". FILM seconds throughout
// (V2S3.tsx wraps the shot in <TimeShift by={-S3_START}>). Pure numbers: nothing here draws.
//
//   12.98  the window match-cut: S2's staff window W2 (blind down) = her French window W2_CUT (blind UP, lamp on, her
//          silhouette pacing with the phone), same screen spot and size; Pip mid-hop on PIP_HOP_S2_S3 (L2's arc)
//   13.00-13.60  the 5 % ease-back about W2 (1.00 -> 0.95, ease-out); a 10 px/s float WEST (the world slides right)
//          eases in from 13.30, so the camera never stops
//   13.10  Pip lands on her window box (462, 878) · 13.96 "she": Pip turns to her · 14.28 "talking": her free hand
//   14.70  Pip leaps up-LEFT out through the left edge (x 0-120, y 620-700 at the cut) · 14.86 cut on action into V2S4
import * as MAP from '../world/map';

export const S3_START = 12.98;
export const S3_END = 14.86;

/** Heard word onsets (film s). */
export const S3_WORDS = {So: 13.16, why: 13.48, is: 13.72, she: 13.96, talking: 14.28, talkingEnd: 14.64} as const;

export const S3_BEATS = {
  match: S3_START,
  pipLand: MAP.PIP_HOP_S2_S3.t1, // 13.10
  pipTurn: 13.9, // turns to her on "she" (13.96)
  hand: MAP.S3.handMovesAt, // 14.28
  pipLeap: 14.7,
} as const;

// ---------------------------------------------------------------- the camera

/** The ease-back: 1.00 -> 0.95 about W2 over 13.00-13.60, ease-out (map S3.camera.easeBack). */
export const s3Zoom = (t: number): number => MAP.zoomAt(MAP.S3.camera.easeBack, t);

/** The float: 10 px/s, the world sliding RIGHT (the camera drifts west, the way she will walk), easing in over
 *  13.30-13.70 so the ease-back hands over to it without a stop. 0 at the match. */
export const S3_FLOAT = {v: 10, t0: 13.3, ramp: 0.4} as const;
export const s3FloatDx = (t: number): number => {
  const s = t - S3_FLOAT.t0;
  if (s <= 0) return 0;
  const r = S3_FLOAT.ramp;
  return S3_FLOAT.v * (s <= r ? (s * s) / (2 * r) : r / 2 + (s - r));
};

/** World (the 12.98 pose = screen px at the match) -> screen at film t: the float after the ease-back about W2. */
export const s3Screen = (p: MAP.XY, t: number): MAP.XY => {
  const q = MAP.scaleAbout(p, MAP.S3.camera.easeBack.anchor, s3Zoom(t));
  return {x: q.x + s3FloatDx(t), y: q.y};
};

/** The world must cover the frame at the widest moment (z 0.95 + the float): draw sets over at least this rect. */
export const S3_BLEED = {x0: -60, y0: -60, x1: 1160, y1: 2010} as const;

// ---------------------------------------------------------------- Pip (WORLD px; the camera is 1.00 at the match)

/** In: L2's PIP_HOP_S2_S3 continued. At 12.98 the S3 camera is identity, so WORLD = SCREEN and the same hop spec
 *  (from the S2 seat at the 1.06 push, to the window box, apex 50, take-off 12.85, 0.25 s) puts Pip exactly where S2
 *  left it. Size 106 = S2's 100 px Pip under S2's 1.06 push (100.7 px after the ease-back). Seed 'pipS2' = S2's idle.
 *  Out: a 0.30 s leap up-left from the box toward (-292, 640): at the cut (k 0.53) Pip is at ~(60, 660) world =
 *  ~(87, 667) screen, inside the contract rect (x 0-120, y 620-700); the arc's top stays at y >= 600. */
export const S3_PIP = {
  size: 106,
  seed: 'pipS2',
  from: [MAP.PIP_HOP_S2_S3.from.x, MAP.PIP_HOP_S2_S3.from.y] as [number, number],
  inHop: {t0: MAP.PIP_HOP_S2_S3.t0, to: [MAP.S3.pipSeat.x, MAP.S3.pipSeat.y] as [number, number], height: MAP.PIP_HOP_S2_S3.apexPx, dur: MAP.PIP_HOP_S2_S3.t1 - MAP.PIP_HOP_S2_S3.t0},
  outLeap: {t0: S3_BEATS.pipLeap, to: [-292, 640] as [number, number], height: 91, dur: 0.3},
} as const;

/** Her silhouette in the French window (map S3): feet on the room floor y 862, >= 137 px at the match. */
export const S3_HER = {x0: MAP.S3.pacingX[0], x1: MAP.S3.pacingX[1], y: MAP.S3.silhouette.feetY, h: MAP.S3.silhouette.h} as const;
