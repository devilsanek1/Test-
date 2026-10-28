// V2S7_rig.ts (lane L5): the numbers of V2S7 "Google says" in ONE place, so the set, the life, the board, Pip and the
// wiper agree. WORLD px = the screen at the 30.04 pose (the 4 % push landed, float zero; map.ts S7, B, BOARD_BOLLARD).
// Times are SHOT-local seconds (film - 28.06) unless a name says film.
//
// The vantage: the wing's west-end forecourt looking north from the top of the forecourt's steps (a little above
// eye level): the wing frontal at ~72 px/m (kit s7Layout: x 352-1110, coping 606, base 1012), the ground's vanishing
// point VP (540, 560) hidden behind the wing. Ground scale k(y) = px per metre on the ground at screen y (linear in y).
// The near band is drawn at a PEOPLE scale a little under k (kp: the owner's people rule keeps near head-backs <= ~140
// px wide, STYLE.md section 4), and its furniture is sized to the people who use it, so nothing reads as a giant.
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

// ---------------------------------------------------------------- ground perspective

export const VP = {x: 540, y: 560} as const;
/** px per metre on the ground at screen y (0 at the horizon y 560; 72 at the wing's base 1012). */
export const kAt = (y: number) => (72 * (y - VP.y)) / (1012 - VP.y);
/** A point on a receding ground line through (x0, y0) toward VP, at screen y. */
export const alongVP = (x0: number, y0: number, y: number) => VP.x + ((x0 - VP.x) * (y - VP.y)) / (y0 - VP.y);

// ---------------------------------------------------------------- the set (world px)

export const WING = {x0: 352, x1: 1110, top: 606, base: 1012, plinth: 990.4, door: {x0: 694, x1: 866, y0: 816, y1: 990.4}, canopy: {x0: 660, x1: 900, y0: 760, y1: 810}} as const;
/** Nothing world-drawn above this y: with the float (dy >= -5) it lands at screen y >= 600. */
export const SKY_CLIP_Y = 605;
/** The wing's front steps (three low treads along the frontage, right of the board). */
export const STEPS = {y0: WING.base, treads: [1012, 1021, 1031, 1042] as const};
/** Walking lanes (feet y) across the forecourt; heights of a 1.7 m walker there. */
export const LANE = {A: 1058, B: 1098, C: 1142} as const;
export const walkerH = (feetY: number) => 1.7 * kAt(feetY);

/** Two young London planes (~5 m, crowns kept in y 606-880), mottled bark. */
export const TREE_R = {x: 1036, base: 1070, top: 618, crown: {x0: 948, x1: 1130, y0: 618, y1: 872}} as const;
export const TREE_L = {x: 50, base: 1084, top: 624, crown: {x0: -78, x1: 172, y0: 624, y1: 884}} as const;

/** Festoons: the wing's west corner pier -> the right plane; a short one off the right edge. */
export const FESTOON_A = {from: [370, 652] as [number, number], to: [968, 680] as [number, number], sag: 46, n: 22};
export const FESTOON_B = {from: [1046, 664] as [number, number], to: [1124, 650] as [number, number], sag: 12, n: 4};

/** Pip's stone bollard: the cap top is map BOARD_BOLLARD (700, 1205). */
export const BOLLARD = {x: 700, cap: 1205, base: 1274, w: 60} as const;

/** The fountain basin (right of the board, mid to near): far rim front edge, near rim top edge, the near rim's face
 *  foot, its left end receding to the VP (the far-left corner sits just below Pip's bollard). */
export const BASIN = {farY: 1302, nearY: 1540, faceY: 1612, x1: 1140, leftNear: 764} as const;
export const basinLeftAt = (y: number) => alongVP(BASIN.leftNear, BASIN.nearY, y);
/** The jets: a row along the basin's middle (nozzle y), rhythmic. */
export const JETS = {y: 1422, xs: [806, 872, 938, 1004, 1070], hMin: 168, hMax: 300} as const;

/** People scale (px per metre) in the near band: k under the owner's cap (0.8 k at T1, 0.72 k at the frame bottom). */
export const kpAt = (y: number) => kAt(y) * (y <= 1100 ? 1 : 1 - Math.min(0.28, ((y - 1100) / 820) * 0.28));
/** Seated height (seat to head top) of a person at seat line y: the kit's seated proportion (0.95 x kp). */
export const seatedH = (y: number) => 0.95 * kpAt(y);
/** The cafe (left): T0 cut by the left edge, T1 with two seated backs, T2 near with two head-backs cut by the bottom. */
export const CAFE = {
  t0: {x: 28, top: 1356, rx: 44},
  t1: {x: 300, top: 1352, rx: 46},
  t2: {x: 288, top: 1706, rx: 70},
  /** Seated backs at T1 and T0 (seat line y, seated height px). */
  s1: [
    {x: 244, seat: 1430, h: 116, seed: 's7/cafe/a'},
    {x: 358, seat: 1436, h: 110, seed: 's7/cafe/b'},
  ],
  s0: {x: 74, seat: 1438, h: 112, seed: 's7/cafe/c'},
} as const;

/** The front row: head-backs cut by the frame bottom (hv <= 150: <= ~140 px wide at the shoulders), two at the near
 *  cafe table, two watching the fountain. */
export const NEAR_BACKS = [
  {x: 158, hv: 146, seed: 's7/near/a'},
  {x: 414, hv: 140, seed: 's7/near/b'},
  {x: 846, hv: 142, seed: 's7/near/c'},
  {x: 1012, hv: 136, seed: 's7/near/d'},
] as const;

/** Two people sitting on the basin's near rim, backs to us, watching the jets. */
export const RIM_SITTERS = [
  {x: 868, seat: 1546, seed: 's7/rim/a'},
  {x: 996, seat: 1548, seed: 's7/rim/b'},
] as const;

/** A person at rest left of the board (on the phone), in front of the left plane's trunk. */
export const STANDER = {x: 66, feet: 1200, h: 160} as const;

/** The bike rack (Sheffield stands) and the planter of grasses (bottom centre). */
export const RACK = {base: 1548, xs: [470, 590] as const, w: 104, h: 120, R: 45} as const;
export const PLANTER = {x0: 492, x1: 706, base: 1892, h: 100} as const;

// ---------------------------------------------------------------- light and colour helpers

/** The sun is screen-left (west): shadows fall right and a little toward us, short (<= ~40 px past the object). */
export const LIGHT = {x: 260, y: 620} as const;
export const SHADOW_LEN = 34;

const hexRgb = (h: string): [number, number, number] => {
  const s = h.replace('#', '');
  return [parseInt(s.slice(0, 2), 16), parseInt(s.slice(2, 4), 16), parseInt(s.slice(4, 6), 16)];
};
/** A flat sRGB mix of two palette colours (k 0 = a): a colour step (shadows), never drawn as a gradient. */
export const mixHex = (a: string, b: string, k: number): string => {
  const A = hexRgb(a);
  const C = hexRgb(b);
  return '#' + A.map((v, i) => Math.round(v + (C[i] - v) * k).toString(16).padStart(2, '0')).join('').toUpperCase();
};

// ---------------------------------------------------------------- the lamp run on "principles" (A5: mirrors S8's on "facts")

/** ONE run on Google's key word, 0.06 s apart like S8's (V2S8_clock LAMP_RUN_STEP), the festoon bulb by bulb at
 *  0.03 s: the first bulb lights ON "principles" (30.04 = local 1.94). Then one twinkle at a time. */
export const RUN_STEP = 0.06;
export const BULB_STEP = 0.03;
export const RUN_ORDER = ['festoonA', 'festoonB', 'treeLights', 'basinLights', 'cafeLights'] as const;
export type RunId = (typeof RUN_ORDER)[number];
export const runAt = (id: RunId) => W7.principles + RUN_STEP * RUN_ORDER.indexOf(id);

// ---------------------------------------------------------------- life schedule (local s)

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
