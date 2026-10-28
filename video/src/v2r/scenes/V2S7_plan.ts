// V2S7_plan.ts (lane L5): the PLAN of V2S7 "Google says": ONE camera and where everything stands on the forecourt, in
// metres, so the set, the near things, the life and the light agree (CRAFT §f.4-§f.5: one camera per shot, sizes by
// distance; DIRECTION rule 2). WORLD px = the screen at the 30.04 pose (the 4 % push landed, float zero).
//
// THE CAMERA: an eye 1.6 m over the forecourt, looking level and north at the wing. The wing (frontal, the canal kit's
// 72 px/m, coping y 606, base y 1012) puts that eye at y 1012 - 1.6 x 72 = 897: horizon 897, VP (540, 897), f 1800 px
// (the wing 25 m away). The old VP (540, 560) put the eye ~8.8 m up (two cameras: CRAFT §f "Two cameras"); the sky's
// horizon (skies.ts S7_SUNSET, horizonY 897) is this one. Every ground thing is sized from S7_CAM (k = px per metre
// per 100 px under the horizon = 100 / 1.6 = 62.5 for everything on the forecourt's level).
// Plan axes: x metres right of the lens axis, z metres ahead, levels in metres over the forecourt.
//
//   the wing        z 25, x -2.61 .. 7.92 (screen 352-1110), two storeys (coping 5.64 m), floor 0.30 m (two low
//                   steps along the frontage), the canopy "Google" 1.2 m proud of it (map S7.canopyGoogle)
//   Google's board  map B: its feet on the forecourt at z 8.16 (y 1250), x -1.95 .. 0.59 (2.6 m tall: a big
//                   freestanding enamel A-board)
//   Pip's bollard   map BOARD_BOLLARD: cap 1205, base 1274 (z 7.63, x 0.68)
//   the right plane z 16.6, x 4.57 (screen 1036): the young London plane with the festoon
//   the basin       bottom right: the west end at x 0.95, z 4.4 .. 6.6, a 0.45 m limestone rim, three steady jets
//   the cafe        bottom left: a bistro table (z 3.45) with two chairs, things on it, a coat over a chair back,
//                   a low planter of grasses in front (cropped by the corner)
//   the west strip  x 0-110 on screen, left of the board: a clipped hedge on a low wall at z 25, two people at rest
//                   at a cafe table (z 19.5), the far street's plane trees (+2) and roofs (+3) on the sunset band
// Nothing nearer than the board rises over its bottom rail where it stands in front of it (h <= 1.6 - 0.196 z m).
import {groundCam, makeAtmosphere, planePalette, recede, type GroundCam} from '../../lib/depth';
import {PEN, isClean} from '../../lib/pen';
import {fromLch, lab, lch} from '../../lib/light';
import {S7_AIR} from '../world/skies';
import {B, BOARD_BOLLARD, B_LEGS_Y1, S7} from '../world/map';

export type P2 = [number, number];

/** The eye-level horizon (= S7_SUNSET's horizonY) and the camera. */
export const S7_HORIZON = 897;
export const S7_EYE = 1.6;
export const S7_F = 1800;
export const S7_CAM: GroundCam = groundCam({horizon: S7_HORIZON, vpx: 540, f: S7_F, height: S7_EYE});
export const S7_VP: P2 = [540, S7_HORIZON];

/** The forecourt's ONE atmosphere (lib/depth): the air = the sunset sky's lowest colour under SUN2 (skies.ts S7_AIR). */
export const S7_ATM = makeAtmosphere({name: 'forecourt at sunset', air: S7_AIR});

/** Screen point of a plan point (x m right, z m ahead, level m up). */
export const pt = (x: number, z: number, level = 0): P2 => S7_CAM.pt(x, z, level) as P2;
/** Screen y of the forecourt at depth z (level 0), and back. */
export const yAt = (z: number, level = 0) => S7_CAM.y(z, level);
export const zAt = (y: number, level = 0) => S7_CAM.z(y, level);
/** px per metre of a thing at depth z. */
export const kz = (z: number) => S7_F / z;
/** px per metre of a thing whose base stands at screen y (level 0). */
export const ky = (y: number) => S7_CAM.pxPerM(y);
/** Plan x of a screen x at depth z. */
export const xAt = (sx: number, z: number) => ((sx - 540) * z) / S7_F;

// ---------------------------------------------------------------- the wing (frontal, +1)

/** The wing's facade: frontal at z 25, 72 px/m, screen px. `floorY` = its ground floor (0.30 m: two low steps). */
export const S7_WING = {
  z: 25,
  pxm: 72,
  x0: 352,
  x1: 1110,
  top: 606,
  base: 1012.2,
  floorY: 990.4,
  /** The coping band, the stone band under the first-floor sills, the plinth (screen y). */
  coping: [606, 617.5] as P2,
  band: [743.5, 754] as P2,
  /** Upper storey panes: y range; the bays (screen x) as the kit's s7Layout (u 0.7 + 1.75 k, 1.4 m wide). */
  upperY: [625.5, 737.5] as P2,
  upper: [0, 1, 2, 3, 4, 5].map((k) => [402.4 + 126 * k, 503.2 + 126 * k] as P2),
  /** Ground storey glazing (screen x) left of the canopy (behind the board) and right of it. */
  lowerY: [770, 990.4] as P2,
  lower: [[395.2, 638.4], [921.6, 1124]] as P2[],
  /** The west corner pier. */
  pier: [352, 388] as P2,
  /** The canopy fascia (map S7.canopyGoogle) and how far it stands proud of the facade (m). */
  fascia: S7.canopyGoogle,
  canopyDepth: 1.2,
  /** The glass doors (the kit's s7Layout: the fascia inset 34 px, down to the floor). */
  door: {x0: S7.canopyGoogle.x0 + 34, y0: S7.canopyGoogle.y1 + 6, x1: S7.canopyGoogle.x1 - 34, y1: 990.4},
} as const;

/** Two low steps along the frontage (0.15 m each): riser 1 at z 24.3, riser 2 at z 24.65, the floor at z 25. */
export const S7_STEPS = {z: [24.3, 24.65, 25] as const, rise: 0.15};

// ---------------------------------------------------------------- the board, Pip

/** Google's board (map B): its front feet on the forecourt line y 1250 = z 8.16. */
export const S7_BOARD = {face: B, legsY: B_LEGS_Y1, z: zAt(B_LEGS_Y1), frame: {x0: B.x0 - 40, x1: B.x1 + 40, top: B.y0 - 20}} as const;
/** Pip's stone bollard (map BOARD_BOLLARD: cap 1205), its base on the forecourt at y 1274. */
export const S7_BOLLARD = {x: BOARD_BOLLARD.x, cap: BOARD_BOLLARD.y, base: 1274, w: 60} as const;

// ---------------------------------------------------------------- the right plane tree and the festoon

/** The young London plane (z 16.6): trunk base on screen (1036, 1070.5), crown in y 618-872 (it never reaches the
 *  caption band), its iron grate on the forecourt. */
export const S7_TREE = {x: xAt(1036, 16.6), z: 16.6, sx: 1036, base: yAt(16.6), trunkTop: 846, trunkW: 30, crown: {x0: 944, x1: 1132, y0: 618, y1: 872}} as const;

/** The festoon: ONE string from a fixing on the wing (above the canopy's left end) to the plane's left limb, hanging
 *  clear of the canopy's letters (its bulbs end >= 6 px above the canopy cap, y 754), in THREE groups of bulbs that
 *  switch on together on film frames 1812 / 1836 / 1848 (map S7.boardBeats: the sound lane's request). */
export const S7_FESTOON = {from: [712, 722] as P2, to: [962, 700] as P2, sag: 24, n: 15, groups: 3, bulb: 4.6} as const;

// ---------------------------------------------------------------- the basin (bottom right)

/** The fountain basin: its west end at x 0.95, the near rim at z 4.4, the far rim at z 6.6; a low rim (0.32 m) with a
 *  0.22 m coping, the water at 0.24 m (plain and flat, as S1's: the owner on v5); three steady jets in a row running
 *  into the picture (x 1.36, z 5.0 / 5.55 / 6.1), 0.55 m over the water. Its far-left corner (screen x ~799) stays
 *  right of Pip's bollard (x <= 730). */
export const S7_BASIN = {x0: 0.95, x1: 6, zN: 4.4, zF: 6.6, rim: 0.32, coping: 0.22, water: 0.24, jets: {x: 1.36, z: [5.0, 5.55, 6.1], h: 0.55, r: 0.045}} as const;

// ---------------------------------------------------------------- the cafe (bottom left)

/** The bistro table (a round marble top 0.6 m across, 0.75 m high) with two bentwood chairs pushed back from it, their
 *  backs to us: chair A to the left with a coat over it, cut by the left edge; chair B to the right. The table's
 *  things: two cups on saucers, a folded newspaper. */
export const S7_CAFE = {
  table: {x: -0.55, z: 3.5, r: 0.3, h: 0.75},
  chairA: {x: -0.88, z: 3.05, seat: 0.46, back: 0.88, w: 0.42, d: 0.4},
  chairB: {x: -0.02, z: 3.42, seat: 0.46, back: 0.88, w: 0.42, d: 0.4},
} as const;

// ---------------------------------------------------------------- the west strip and the far street

/** The forecourt's west edge (flush with the wing): a low limestone wall with a clipped hedge, z 25. */
export const S7_WEST = {z: 25, wall: 0.42, hedge: 0.95} as const;
/** Two people at rest at a small cafe table in the west strip (mid ground, z 19.5): seat x (m). */
export const S7_CAFE_PAIR = {z: 19.5, table: -5.5, seats: [-5.95, -5.05]} as const;
/** The far street's plane trees (+2, z ~55 m) and roofs (+3, z ~95-130 m) beyond the hedge, seen in x 0-110. */
export const S7_FAR = {treeZ: 55, roofZ: [95, 130] as P2} as const;

// ---------------------------------------------------------------- bikes on the frontage, people's lanes

/** Two Sheffield stands with two bikes along the frontage right of the doors (z 23.2). */
export const S7_BIKES = {z: 23.2, stands: [4.75, 5.75], bikes: [{x: 5.05, dir: 1 as 1 | -1}, {x: 6.0, dir: -1 as 1 | -1}]} as const;
/** The cyclist's lane (z 15.5: behind the board, in front of the plane tree) and the staff's door path. */
export const S7_LANES = {cyclist: 15.5, staffIn: {x: [2.7, 2.25] as P2, z: [21.8, 24.55] as P2}, staffOut: {z: 23.7, x: [2.25, 7.6] as P2}} as const;

/** A person of real height `m` whose feet stand at depth z: on-screen height (px). */
export const heightAt = (z: number, m: number) => m * kz(z);

/** The 7x window round SUN2 at the S6 -> S7 push-through's midpoint (28.10, screen px): what shows there is the sun,
 *  the sky and the board's top rail only (no branch, festoon or roof crosses it). Plan x of its edges at the board. */
export const S7_SUN_WINDOW = {x0: 183, x1: 337, y0: 483, y1: 757} as const;

// ---------------------------------------------------------------- colour on a plane, as SHOWN


/** The colour to AUTHOR on the environment tier so that the clean pen SHOWS `target`: its value pull toward the scope's
 *  bg and its chroma x0.85 inverted (lib/pen tierFill). The far planes' receded colours then land exactly on their step
 *  toward the air (lib/depth `backing` pre-compensates the same way). Identity under the sketch pen. */
export function envAuthor(target: string, bg: string = S7_AIR): string {
  if (!isClean()) return target;
  const s = PEN.tiers.environment;
  const t = lch(target);
  const gL = lab(bg)[0];
  const L = Math.min(99, Math.max(1, (t.L - gL * s.pull) / Math.max(1e-6, 1 - s.pull)));
  const C = t.C >= s.chromaMax ? t.C : t.C / Math.max(1e-6, s.chromaK);
  return fromLch(L, C, t.h);
}

/** A palette receded to `plane` (lib/depth planePalette: simpler with distance) and pre-compensated for the pen: what
 *  is drawn on that plane, keyed by the source colour. */
export function farPalette(colors: string[], plane: number): Record<string, string> {
  const pp = planePalette(colors, plane, S7_ATM);
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(pp)) out[k] = envAuthor(v);
  return out;
}

/** One colour receded to `plane`, pre-compensated for the pen (the wing's +1, the tree's +0.5). */
export const onPlane = (c: string, plane: number) => envAuthor(recede(c, plane, S7_ATM));
