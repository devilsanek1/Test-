// V2S5_far_tones.ts (lane L4, SKY & FAR): the colours of the S5 sky, far plane and river plane. Every tone is a palette
// role (CM) or a flat mix of roles (kit/dc/core `mix`), one fixed value per job: no gradient, no opacity.
// Atmospheric steps (CINEMATIC_GUIDE Scale cues 5): the far city's back rows and the hills at ~65 % toward the sky, its
// front rows and the river at ~40 %. A plain sRGB mix of a WARM colour toward the mint passes through grey / tan /
// olive (checked in CIELAB, 2026-10-27: brickLight at 40 % = #D3BDA7 tan, blossom at 65 % = grey), so warm notes are
// first lifted toward paper / blossom and only then stepped toward the sky; cool shades lean to the dusty blue
// (warm near, dusty-cool far). NO TEAL anywhere (no cyan-blue mid tones); orange only on the sun disc and its page.
import {CM} from '../palette';
import {mix} from '../kit/dc/core';

const S = CM.sky;

/** The sky's own pieces: the top-gutter clouds, the hero bank, the April bands. */
export const SKY = {
  /** Top-gutter clouds (in the sky's hue: far = the sky's colour). */
  cloudCrown: CM.paper,
  cloudBody: mix(CM.skyHigh, CM.paper, 0.45),
  cloudBelly: mix(S, CM.shadeCool, 0.13),
  /** The hero bank on the horizon, lit warm by the low morning sun: the palest, brightest mass (the light burst). */
  bankCrown: CM.paper,
  bankBody: mix(CM.stucco, CM.bandGold, 0.32),
  bankBelly: mix(mix(mix(CM.stucco, CM.bandGold, 0.32), CM.blossom, 0.4), CM.shadeWarm, 0.08),
  /** The April morning's flat bands near the horizon (below y 600 only; mostly behind the bank). */
  bandHigh: CM.skyHigh,
  bandGold: CM.bandGold,
};

/** The far plane: hills, the infinity strip, the low white city, the landmarks. Values are spread wide enough to read
 *  as packed rows at 216 px (lit L ~89-93, shade sides L ~74, roofs L 64-80, street trees L ~71) while every far value
 *  stays lighter than the obelisk's shade face. */
export const FAR = {
  // ~65 % (the hills, the infinity strip, the two back rows)
  hill: mix(mix(CM.stoneShade, CM.shadeCool, 0.45), S, 0.38),
  hillFar: mix(mix(CM.stoneShade, CM.shadeCool, 0.3), S, 0.5),
  infLit: mix(CM.paper, S, 0.5),
  infShade: mix(mix(CM.stoneShade, CM.shadeCool, 0.3), S, 0.4),
  infTree: mix(mix(CM.sage, CM.shadeCool, 0.15), S, 0.42),
  backLit: mix(CM.paper, S, 0.45),
  backStone: mix(CM.limestone, S, 0.47),
  backShade: mix(mix(CM.stoneShade, CM.shadeCool, 0.3), S, 0.38),
  backRoof: mix(mix(CM.brickLight, CM.blossom, 0.5), S, 0.35),
  backSlate: mix(mix(CM.coatSlate, CM.stoneShade, 0.4), S, 0.45),
  backTree: mix(mix(CM.sage, CM.shadeCool, 0.1), S, 0.38),
  // ~40 % (the front rows of the city)
  lit: mix(CM.paper, S, 0.3),
  stone: mix(CM.limestone, S, 0.3),
  warm: mix(mix(CM.stucco, CM.bandGold, 0.5), S, 0.25),
  shade: mix(mix(CM.stoneShade, CM.shadeCool, 0.35), S, 0.22),
  shadeDeep: mix(mix(CM.stoneShade, CM.shadeCool, 0.55), S, 0.2),
  roofPink: mix(mix(CM.brickLight, CM.blossom, 0.45), S, 0.2),
  roofSlate: mix(mix(CM.coatSlate, CM.stoneShade, 0.25), S, 0.3),
  roofCopper: mix(mix(CM.sage, CM.water, 0.4), S, 0.25),
  roofBrick: mix(CM.brick, S, 0.3),
  roofLit: mix(CM.paper, S, 0.2),
  tree: mix(mix(CM.sage, CM.anchor, 0.2), S, 0.25),
  treeLit: mix(mix(CM.sage, CM.paper, 0.15), S, 0.25),
  treeDark: mix(mix(CM.sage, CM.anchor, 0.3), S, 0.24),
  blossom: mix(CM.blossom, S, 0.22),
  brick: mix(CM.brick, S, 0.22),
  brickShade: mix(mix(CM.brickDeep, CM.shadeWarm, 0.3), S, 0.26),
  // the obelisk: one step nearer than its plane, the darkest far shape (its shade face) on the palest cloud
  obLit: mix(CM.paper, S, 0.14),
  obShade: mix(mix(CM.stoneShade, CM.shadeCool, 0.55), S, 0.12),
  obLine: mix(mix(CM.stoneShade, CM.shadeCool, 0.7), CM.shadeWarm, 0.18),
  // the Capitol: one step paler than the city (a tiny second landmark on the horizon)
  capLit: mix(CM.paper, S, 0.4),
  capShade: mix(mix(CM.stoneShade, CM.shadeCool, 0.3), S, 0.4),
};

/** The river plane (40 %): the far shore, the Potomac, the bridges, the near bank, the parkway, the deep parkland. */
export const RIV = {
  shoreBlossom: mix(CM.blossom, S, 0.22),
  shoreBlossomLit: mix(mix(CM.blossom, CM.paper, 0.45), S, 0.18),
  shoreTree: mix(mix(CM.sage, CM.anchor, 0.1), S, 0.36),
  shoreTreeLit: mix(mix(CM.sage, CM.paper, 0.2), S, 0.3),
  wall: mix(CM.limestone, S, 0.3),
  wallShade: mix(mix(CM.stoneShade, CM.shadeCool, 0.3), S, 0.3),
  water: mix(mix(CM.water, CM.glass, 0.3), S, 0.32),
  waterDeep: mix(mix(CM.water, CM.shadeCool, 0.2), S, 0.3),
  waterLit: mix(CM.glass, CM.paper, 0.35),
  glint: CM.paper,
  bridge: mix(CM.limestone, S, 0.28),
  bridgeLit: mix(CM.paper, S, 0.22),
  bridgeShade: mix(mix(CM.stoneShade, CM.shadeCool, 0.35), S, 0.28),
  arch: mix(mix(CM.water, CM.shadeCool, 0.42), S, 0.25),
  temple: mix(CM.paper, S, 0.2),
  templeShade: mix(mix(CM.stoneShade, CM.shadeCool, 0.3), S, 0.25),
  park: mix(mix(CM.sage, CM.paper, 0.18), S, 0.34),
  parkLit: mix(mix(CM.sage, CM.paper, 0.4), S, 0.28),
  parkShade: mix(mix(CM.sage, CM.shadeCool, 0.2), S, 0.32),
  /** the deep parkland's lawn (nearer than the river: a little greener) */
  parkDeep: mix(mix(CM.sage, CM.paper, 0.08), S, 0.26),
  tree: mix(mix(CM.sage, CM.anchor, 0.14), S, 0.32),
  treeLit: mix(mix(CM.sage, CM.leafGold, 0.12), S, 0.28),
  treeDark: mix(mix(CM.sage, CM.anchor, 0.3), S, 0.3),
  blossom: mix(CM.blossom, S, 0.2),
  blossomWhite: mix(CM.paper, CM.blossom, 0.25),
  road: mix(CM.paving, CM.paper, 0.35),
  roadEdge: mix(mix(CM.stoneShade, CM.shadeCool, 0.2), S, 0.3),
  path: mix(CM.paper, S, 0.25),
  hull: CM.paper,
  sail: CM.paper,
  rower: mix(CM.coatSlate, S, 0.25),
  dock: mix(CM.line, S, 0.35),
  carCols: [CM.coatSlate, CM.coatMustard, CM.paper, CM.coatPlum, CM.brick, CM.coatOat, CM.paneUnlit, CM.paper].map((c) => mix(c, S, 0.3)),
};
