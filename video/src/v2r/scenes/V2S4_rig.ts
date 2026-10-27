// V2S4_rig.ts (lane L3): the clock, the truck, the push and the beats every V2S4 part shares. FILM seconds throughout
// (V2S4.tsx wraps the shot in <TimeShift by={-S4_START}>, so useTime() inside it is film time and map.ts lands as written).
// Pure numbers: nothing here draws.
//
//   14.86  the cut on Pip's leap (Pip mid-air at ~(580, 1000), descending down-left, LEFT of her)
//   14.95  Pip lands on the boat roof (470, 1218), then rides it (bob + roll)
//   15.07  "She": the name tag, build 1 (name + role) · 16.60 build 2 (3 years · resigned Oct 2026 + the BBC source)
//   to 17.36 the truck runs west at her pace (planes slide RIGHT on screen), 17.36-17.96 it slows to a stop
//   17.96  "objected": she stops by the post (x 575) and looks west along it · 18.40-20.10 the 6 % push about SUN1
//   18.80  the tag pops off · 18.92 "military": the DEC 2025 plate builds · 19.45-19.80 the APR 2026 plate pen-reveals
//   19.55  Pip turns west · 19.80 "heading": birds fly west into the sun · 20.25 Pip leaps into the sun (mid-air at the cut)
//   20.55  the sun match-cut into V2S5: SUN1 (250, 650) r 65 on screen
import * as MAP from '../world/map';

export const S4_START = 14.86;
export const S4_END = 20.55;

/** Heard word onsets (public/v2r/voice_words_heard.json), film s. */
export const S4_WORDS = {
  She: 15.07,
  worked: 15.24,
  Googles: 15.64,
  AI: 16.12,
  and: 16.67,
  told: 16.76,
  BBC: 17.08,
  she: 17.72,
  objected: 17.96,
  military: 18.92,
  work: 19.4,
  was: 19.64,
  heading: 19.8,
  headingEnd: 20.1,
  In: 20.67,
} as const;

/** Every story beat of the shot (film s). */
export const S4_BEATS = {
  pipLand: 14.95,
  tagBuild1: MAP.S4.nameTagBuilds[0], // 15.07
  tagBuild2: MAP.S4.nameTagBuilds[1], // 16.60
  stopT0: MAP.S4.camera.stop.t0, // 17.36: the truck starts to slow
  stop: MAP.S4.stopAt, // 17.96: she stops ("objected")
  lookUp: 18.06, // her head lifts to the post's plates (stopLook)
  pushT0: MAP.S4.camera.push.t0, // 18.40
  pushT1: MAP.S4.camera.push.t1, // 20.10
  tagOff: MAP.S4.nameTagOffAt, // 18.80
  decPlate: MAP.S4.decPlateAt, // 18.92 ("military")
  aprPenT0: MAP.S4.aprPlatePen[0], // 19.45
  aprPenT1: MAP.S4.aprPlatePen[1], // 19.80 (complete on "heading")
  pipTurnWest: 19.55,
  birdsWest: MAP.S4.birdsWestAt, // 19.80
  pipLeap: 20.25,
} as const;

// ---------------------------------------------------------------- the truck (the camera trucks WEST with her)

/** Plane speed factors (x the path plane): the sun is fixed (infinity), far roofs 0.3, terrace backs 0.6, her
 *  towpath (and the post on it) 1.0, the canal strip between her coping and our boat 1.0, the near water below our
 *  boat 2.0. Our narrowboat glides WITH the camera: screen-fixed (0). */
export const S4_K = {sun: 0, far: 0.3, backs: 0.6, path: 1.0, canal: 1.0, near: 2.0, boat: 0} as const;

/** The path plane's truck: constant V px/s to 17.36, then a linear speed fall to 0 at 17.96. Distance D = 2.8 V.
 *  V = 110.7 px/s = 1.1 m/s at 100 px/m: exactly 5 of her 62 px steps (D = 310). */
export const HER_STEP_PX = 62;
export const S4_TRUCK = {v: (5 * HER_STEP_PX) / 2.8, steps: 5, D: 5 * HER_STEP_PX} as const;

/** Path-plane travel (px) since the cut at film time t (extrapolates linearly before the cut; 0 at 14.86, D at 17.96). */
export const s4Travel = (t: number): number => {
  const {v} = S4_TRUCK;
  const a = S4_BEATS.stopT0;
  const b = S4_BEATS.stop;
  if (t <= a) return v * (t - S4_START);
  const s = Math.min(t, b) - a;
  return v * (a - S4_START) + v * (s - (s * s) / (2 * (b - a)));
};

/** The path plane's offset at film t: -D at the cut -> 0 at the stop (every V2S4 set is drawn at the 17.96 pose:
 *  the post at x 575). + = the plane has moved RIGHT on screen. */
export const s4PathDx = (t: number): number => s4Travel(t) - S4_TRUCK.D;

/** Any plane's offset (k from S4_K). */
export const s4PlaneDx = (k: number, t: number): number => k * s4PathDx(t);

/** Her screen speed is 0 (screen-fixed at x 720): her ground speed is the plane's. Speed of the path plane (px/s). */
export const s4PathSpeed = (t: number): number => {
  const {v} = S4_TRUCK;
  if (t <= S4_BEATS.stopT0) return v;
  if (t >= S4_BEATS.stop) return 0;
  return v * (1 - (t - S4_BEATS.stopT0) / (S4_BEATS.stop - S4_BEATS.stopT0));
};

/** Her step count at film t on the 12 drawings/s clock: the feet never slide (steps = travel / step length). 5.0 at
 *  the stop (the passing position: one foot comes down into stopLook). */
export const s4HerSteps = (t: number): number => {
  const tq = Math.floor(t * 12 + 1e-6) / 12;
  return Math.min(S4_TRUCK.steps, s4Travel(tq) / HER_STEP_PX);
};

// ---------------------------------------------------------------- the push (6 % about SUN1, soft landing at 20.10)

/** The push curve between the contract's endpoints (18.40 -> 20.10): it gathers like an ease-in and lands softly
 *  (no dead stop), then the camera is locked through the 20.10-20.67 pause to the sun match-cut. */
export const S4_PUSH_EASE = MAP.cubicBezier(0.55, 0.0, 0.35, 1.0);
export const s4Zoom = (t: number): number => {
  const k = MAP.S4.camera.push;
  const u = Math.min(1, Math.max(0, (t - k.t0) / (k.t1 - k.t0)));
  return k.from + (k.to - k.from) * S4_PUSH_EASE(u);
};
/** World (the 17.96 pose, screen px at zoom 1) -> screen at film t: the push about SUN1 (its centre stays put). */
export const s4Screen = (p: MAP.XY, t: number): MAP.XY => MAP.scaleAbout(p, MAP.S4.camera.push.anchor, s4Zoom(t));

// ---------------------------------------------------------------- her, the tag, the post, Pip

/** Her (screen-fixed while the world trucks): x 720, feet 1070, 170 px, walking LEFT in profile. */
export const S4_HER = {...MAP.S4.her, stepPx: HER_STEP_PX} as const;
/** Her head (for Pip's gaze and the tag's leader), world px at the pose. */
export const S4_HER_HEAD: MAP.XY = {x: S4_HER.x - 6, y: S4_HER.feetY - S4_HER.h + 18};

/** Pip's S4 track in WORLD px (inside the push camera; the push is 1.00 until 18.40).
 *  In: a leap from the upper right that is mid-air at the cut at ~(580, 1000), descending down-left LEFT of her (map
 *  MATCHES rect x 520-640, y 940-1060), landing on the boat roof (470, 1218) at 14.95.
 *  Out: a leap toward the sun from 20.25 (0.45 s), mid-air at the cut at ~(293, 721) on screen, over the sun's lower
 *  right; the arc never rises above y 600 and Pip's ears stay below the band (y > 556). */
export const S4_PIP = {
  size: 100,
  inLeap: {from: [1020, 820] as [number, number], t0: S4_BEATS.pipLand - 0.45, dur: 0.45, height: 216},
  seat: [MAP.S4.pipSeat.x, MAP.S4.pipSeat.y] as [number, number],
  outLeap: {t0: S4_BEATS.pipLeap, to: [200, 600] as [number, number], dur: 0.45, height: 100},
} as const;
