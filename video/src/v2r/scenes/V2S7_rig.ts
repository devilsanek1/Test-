// V2S7_rig.ts (lane L5): the CLOCK of V2S7 "Google says" in ONE place, so the set, the life, the board, Pip and the
// wiper agree. Times are SHOT-local seconds = film - S7_T0 (28.10, V2S7_pip; shifted -0.04 from the old 28.06 start on
// 2026-10-28, so every beat keeps its FILM time) unless a name says film. Where things stand (the camera, the plan of
// the forecourt) is V2S7_plan.ts.
import {S7_T0} from './V2S7_pip';

export const S7_DUR = 4.83;
/** The scene stays visible under the narrowboat wipe until 33.16 (local 5.06). */
export const S7_END_VISIBLE = 5.06;
export const filmOf = (t: number) => S7_T0 + t;

/** Heard word times (local s): public/v2r/voice_words_heard.json minus S7_T0 (28.10). */
export const W7 = {
  but: 0.21,
  google: 0.26,
  says: 0.66,
  follows: 0.98,
  its: 1.38,
  ai: 1.54,
  principles: 1.94,
  and: 2.54,
  bans: 2.74,
  retaliation: 3.06,
  of: 3.98,
  any: 4.1,
  kind: 4.42,
  kindEnd: 4.6,
  she: 5.06,
} as const;

/** The glass doors: [t, open 0..1]. In at 0.58-1.58 (a staffer goes in), out at 2.82-3.80 (one comes out). */
export const DOOR_KEYS: [number, number][] = [
  [0.58, 0],
  [0.82, 1],
  [1.34, 1],
  [1.58, 0],
  [2.82, 0],
  [3.06, 1],
  [3.56, 1],
  [3.8, 0],
];

const hexRgb = (h: string): [number, number, number] => {
  const s = h.replace('#', '');
  return [parseInt(s.slice(0, 2), 16), parseInt(s.slice(2, 4), 16), parseInt(s.slice(4, 6), 16)];
};
/** A flat sRGB mix of two palette colours (k 0 = a): a colour step (the wiper's door panels), never a gradient. */
export const mixHex = (a: string, b: string, k: number): string => {
  const A = hexRgb(a);
  const C = hexRgb(b);
  return '#' + A.map((v, i) => Math.round(v + (C[i] - v) * k).toString(16).padStart(2, '0')).join('').toUpperCase();
};
