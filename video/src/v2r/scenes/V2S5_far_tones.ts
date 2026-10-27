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
  bankBelly: mix(CM.stoneShade, CM.blossom, 0.22),
  /** The April morning's flat bands near the horizon (below y 600 only; mostly behind the bank). */
  bandHigh: CM.skyHigh,
  bandGold: CM.bandGold,
};

/** The far plane: hills, the infinity strip, the low white city, the landmarks. */
export const FAR = {
  // 65 % (the hills, the infinity strip, the two back rows)
  hill: mix(mix(CM.stoneShade, CM.shadeCool, 0.3), S, 0.45),
  hillFar: mix(CM.stoneShade, S, 0.55),
  infLit: mix(CM.paper, S, 0.5),
  infShade: mix(mix(CM.stoneShade, CM.shadeCool, 0.25), S, 0.42),
  infTree: mix(mix(CM.sage, CM.shadeCool, 0.15), S, 0.45),
  backLit: mix(CM.paper, S, 0.48),
  backStone: mix(CM.limestone, S, 0.5),
  backShade: mix(mix(CM.stoneShade, CM.shadeCool, 0.28), S, 0.4),
  backRoof: mix(mix(CM.brickLight, CM.blossom, 0.5), S, 0.4),
  backSlate: mix(mix(CM.coatSlate, CM.stoneShade, 0.45), S, 0.5),
  backTree: mix(mix(CM.sage, CM.shadeCool, 0.1), S, 0.42),
  // 40 % (the front rows of the city)
  lit: mix(CM.paper, S, 0.36),
  stone: mix(CM.limestone, S, 0.34),
  warm: mix(mix(CM.stucco, CM.bandGold, 0.5), S, 0.3),
  shade: mix(mix(CM.stoneShade, CM.shadeCool, 0.25), S, 0.28),
  shadeDeep: mix(mix(CM.stoneShade, CM.shadeCool, 0.45), S, 0.3),
  roofPink: mix(mix(CM.brickLight, CM.blossom, 0.5), S, 0.25),
  roofSlate: mix(mix(CM.coatSlate, CM.stoneShade, 0.3), S, 0.4),
  roofCopper: mix(mix(CM.sage, CM.glass, 0.35), S, 0.25),
  roofLit: mix(CM.paper, S, 0.2),
  tree: mix(mix(CM.sage, CM.anchor, 0.12), S, 0.36),
  treeLit: mix(mix(CM.sage, CM.paper, 0.18), S, 0.3),
  treeDark: mix(mix(CM.sage, CM.anchor, 0.28), S, 0.34),
  blossom: mix(CM.blossom, S, 0.26),
  brick: mix(CM.brick, S, 0.25),
  brickShade: mix(mix(CM.brickDeep, CM.shadeWarm, 0.3), S, 0.3),
  // the obelisk: one step nearer than its plane, the darkest far shape (its shade face) on the palest cloud
  obLit: mix(CM.paper, S, 0.14),
  obShade: mix(mix(CM.stoneShade, CM.shadeCool, 0.45), S, 0.15),
  obLine: mix(mix(CM.stoneShade, CM.shadeCool, 0.62), CM.shadeWarm, 0.18),
  // the Capitol: one step paler than the city (a tiny second landmark on the horizon)
  capLit: mix(CM.paper, S, 0.42),
  capShade: mix(mix(CM.stoneShade, CM.shadeCool, 0.3), S, 0.42),
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
