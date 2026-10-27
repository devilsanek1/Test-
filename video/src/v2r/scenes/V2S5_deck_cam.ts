// V2S5_deck_cam.ts (lane L4, TERRACE): the S5 DECK camera, re-fit to the shot's far horizon, plus the terrace's key
// lines, spots and tones (END coords = the screen when the crane lands). No drawing here.
//
// The deck camera is LEVEL, its horizon = the far plane's (FAR_END.horizon: never hard-coded, the far builder may move
// it). The contract fixes the scale on the floor at the pair: the end stranger sits 62 px tall (1.3 m seated) with the
// feet at y 1238, so a floor point at screen y has (y - horizon) / h px per metre: the camera height h (m) follows from
// the horizon (~10.2 m at a horizon of 750: the crane is high; see L4_spec section 3). f only labels depths (m).
// The vanishing point sits on the horizon ABOVE THE PAIR (x 342, between the stranger and Pip): every longitudinal
// paving joint leads up to them. The balustrade's base is held at y 1228.
// Import rule: never import V2S5_rig / V2S5_set / V2S5_figs (the rig imports the deck).
import {CM} from '../palette';
import {mix} from '../kit/dc/core';
import {DECK} from '../kit/dc/crane';
import {FAR_END} from './V2S5_far';
import type {Pt} from '../../lib/sketch';

/** The deck camera (END coords). */
export const CAM = (() => {
  const f = 1000;
  const hz = FAR_END.horizon;
  const feetY = 1238;
  const pxmFeet = 62 / 1.3;
  const h = (feetY - hz) / pxmFeet;
  const railBase = 1228;
  return {f, hz, h, vpx: 342, railBase, railD: (f * h) / (railBase - hz)};
})();

/** Screen point of a terrace point: X metres right of the VP column, d metres deep, z metres above the floor. */
export const dpt = (X: number, d: number, z = 0): Pt => [CAM.vpx + (CAM.f * X) / d, CAM.hz + (CAM.f * (CAM.h - z)) / d];
/** Depth (m) of the floor at screen y. */
export const dAt = (y: number) => (CAM.f * CAM.h) / Math.max(1, y - CAM.hz);
/** Screen px per metre at depth d (lateral and vertical sizes of things standing there). */
export const pxmD = (d: number) => CAM.f / d;
/** Screen px per metre on the floor at screen y. */
export const pxmY = (y: number) => (y - CAM.hz) / CAM.h;
/** Lateral metres of the floor point at screen (x, y). */
export const Xat = (x: number, y: number) => ((x - CAM.vpx) * dAt(y)) / CAM.f;
/** Floor point at screen x for depth d (inverse helper). */
export const XofScreen = (x: number, d: number) => ((x - CAM.vpx) * d) / CAM.f;

/** The contract's spots (END screen coords). */
export const SPOT = {
  /** The stranger's feet and Pip's seat at the end (the deck plane's pivot; the start seat (415, 1120) through it). */
  stranger: {x: 318, feetY: 1238},
  pipSeat: [DECK.o[0] + (415 - DECK.o[0] - (DECK.off ?? [0, 0])[0]) / DECK.k, DECK.o[1] + (1120 - DECK.o[1] - (DECK.off ?? [0, 0])[1]) / DECK.k] as Pt,
  /** The stranger's bench (x 289-384, feet 1240; its top rail's top = Pip's seat). */
  bench: {x0: 289, x1: 384, y1: 1240},
  /** The news box at the end (the contract's start box through the deck), and the plaque's pedestal (the FIGURES &
   *  TEXT builder draws both): keep these clear. */
  newsBox: {x0: 388, y0: 1095, x1: 516, y1: 1240},
  plaque: {x0: 450, y0: 1140, x1: 760, y1: 1246},
};

/** The START window: the part of the deck (END coords) the held start frame shows at 2.42x (x 194-640, y 732-1525).
 *  No terrace people in it (they would be 2.4x at the start); it is the canopy's shade zone. */
export const START_WIN = (() => {
  const off = DECK.off ?? [0, 0];
  const inv = (X: number, Y: number): Pt => [DECK.o[0] + (X - DECK.o[0] - off[0]) / DECK.k, DECK.o[1] + (Y - DECK.o[1] - off[1]) / DECK.k];
  const a = inv(0, 0);
  const b = inv(1080, 1920);
  return {x0: a[0], y0: a[1], x1: b[0], y1: b[1], inv};
})();

/** The rail (balustrade) lines. */
export const RAIL = (() => {
  const d = CAM.railD;
  const top = dpt(0, d, 1.02)[1];
  const base = CAM.railBase;
  return {d, top, base, coping: dpt(0, d, 0.88)[1], plinth: dpt(0, d, 0.16)[1], pxm: pxmD(d)};
})();

// ---------------------------------------------------------------- tones (plane 0: full ink; shadows are colour)

const sh = (c: string, k: number) => mix(c, CM.shadeWarm, k);
export const DT = {
  ink: CM.ink,
  // the floor: sun and the canopy's shade (2 values, the shade warm-dark, hue turned to plum) + the deepest shade
  lit: CM.paving,
  litHi: mix(CM.paving, CM.paper, 0.32),
  litWarm: mix(CM.paving, CM.brickLight, 0.16),
  litCool: mix(CM.paving, CM.limestone, 0.6),
  shade: mix(sh(CM.paving, 0.68), CM.brickDeep, 0.25),
  shadeHi: mix(sh(CM.paving, 0.58), CM.brickDeep, 0.16),
  shadeLo: mix(sh(CM.paving, 0.8), CM.brickDeep, 0.2),
  shadeCool: mix(sh(CM.paving, 0.7), CM.stoneShade, 0.22),
  deep: mix(sh(CM.paving, 0.9), CM.anchor, 0.15),
  under: mix(CM.shadeWarm, CM.anchor, 0.35),
  jointLit: mix(CM.paving, CM.line, 0.5),
  jointShade: mix(sh(CM.paving, 0.96), CM.anchor, 0.12),
  // the border band (limestone slabs along the balustrade) and the brick header course
  band: CM.limestone,
  bandShade: mix(sh(CM.limestone, 0.62), CM.brickDeep, 0.08),
  header: CM.brickDeep,
  headerShade: mix(CM.brickDeep, CM.shadeWarm, 0.35),
  brickSett: CM.brick,
  brickSettShade: mix(CM.brick, CM.shadeWarm, 0.4),
  brickSettLight: CM.brickLight,
  // stone (balustrade, planters, the fountain): lit from beyond (the right / the tops), faces toward us in shade
  stone: CM.limestone,
  stoneLit: CM.paper,
  stoneMid: mix(CM.limestone, CM.stoneShade, 0.45),
  stoneShade: CM.stoneShade,
  stoneDeep: mix(CM.stoneShade, CM.shadeWarm, 0.32),
  // wood, iron
  wood: CM.brick,
  woodLit: mix(CM.brick, CM.brickLight, 0.55),
  woodShade: CM.brickDeep,
  iron: CM.anchor,
  ironLit: mix(CM.anchor, CM.coatPlum, 0.55),
  // planting
  soil: mix(CM.brickDeep, CM.anchor, 0.42),
  leaf: CM.sage,
  leafWarm: mix(CM.sage, CM.shadeWarm, 0.18),
  leafShade: mix(CM.sage, CM.anchor, 0.18),
  leafDeep: mix(CM.sage, CM.anchor, 0.3),
  tulips: [CM.brick, CM.blossom, CM.coatMustard, CM.paper, CM.coatPlum, mix(CM.blossom, CM.brick, 0.45)] as string[],
  petal: CM.blossom,
  petalShade: mix(CM.blossom, CM.shadeWarm, 0.3),
  petalLit: mix(CM.blossom, CM.paper, 0.4),
  // glass of an unlit lantern (April morning: lamps off)
  lanternGlass: mix(CM.glass, CM.paper, 0.35),
};
