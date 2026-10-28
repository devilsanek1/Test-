// V2S5_far_tones.ts (lane L4, SKY & FAR): the colours of the S5 sky pieces, far plane and river plane. Every tone is a
// palette role (CM) or a flat mix of roles (kit/dc/core `mix`), one fixed value per job: no gradient, no opacity.
// THE AIR (conform_L4 §10; CRAFT §f; V2S5_depth): every far and river tone is its MATERIAL receded through S5's one
// atmosphere (`rc(material, plane)`: lib/depth recede toward S5_AIR, the April gold at the horizon; never the old sRGB mix
// toward the mint, which went tan, grey and olive): the far city's back rows, the hills and the infinity strip at +4 (65 %),
// its front rows at +3 (40 %), the river plane at +2.6 (it lies between the city and the Pentagon's valley at +2). A far
// plane holds few values: each ROLE (lit walls, shade walls, roofs, trees) is merged to one value on its plane
// (lib/depth planePalette per role, as S1's far rows merge per layer), so the far city is a calm band of a few soft
// values in the air's own hue (peach-lit walls, a warm rose-peach shade one value step down, rose roofs, sage trees:
// never one grey-beige). THE FAR SHADE is warm (QA 2026-10-28, check_depth "no air" at 21.0: the old lilac-blue stone
// shade, h ~305 across from the gold air, kept its hue at C* 8 and averaged the far band to dE 13.9 from the air, no
// closer than the terrace): far shade faces and the hills are the lit stone in the shade of a gold haze, so their
// material is the lit stone stepped toward the rig's warm shade (+4: one step within dE 5 of the lit walls, CRAFT §f.2;
// +3: two steps within dE 12).
// The landmarks keep their separation: the obelisk one step nearer than its row (its shade face the darkest far shape),
// the Capitol in the back rows.
import {CM} from '../palette';
import {mix} from '../kit/dc/core';
import {rc, rcPalette} from './V2S5_depth';

const S = CM.sky;

/** One role on a plane: its materials receded and merged to `values` values (1: one flat value for the role). */
function role<K extends string>(plane: number, mats: Record<K, string>, values = 1): Record<K, string> {
  const pal = rcPalette(Object.values(mats) as string[], plane, values);
  const out = {} as Record<K, string>;
  for (const k of Object.keys(mats) as K[]) out[k] = pal[mats[k]] ?? rc(mats[k], plane);
  return out;
}

/** The sky's own pieces: the top-gutter clouds, the hero bank, the April bands (the bands are retired: S5_SKY). */
export const SKY = {
  /** Top-gutter clouds (in the sky's hue: far = the sky's colour). */
  cloudCrown: CM.paper,
  cloudBody: mix(CM.skyHigh, CM.paper, 0.45),
  cloudBelly: mix(S, CM.shadeCool, 0.13),
  /** The hero bank on the horizon, lit warm by the low morning sun: the palest, brightest mass (the light burst). */
  bankCrown: CM.paper,
  bankBody: mix(CM.stucco, CM.bandGold, 0.32),
  bankBelly: mix(mix(mix(CM.stucco, CM.bandGold, 0.32), CM.blossom, 0.4), CM.shadeWarm, 0.08),
  /** The April morning's flat bands near the horizon (retired: the sky is world/skies S5_SKY). */
  bandHigh: CM.skyHigh,
  bandGold: CM.bandGold,
};

/** The far stone in shade: the lit stone a warm step down (receded, +4: L* ~85 beside the lit walls' ~89, dE ~4 from
 *  the air; +3: L* ~82 / ~78 beside ~91), never the lilac-blue stone shade of the near planes. */
const SHADE_STONE = mix(CM.limestone, CM.shadeWarm, 0.7);
const SHADE_STONE_3 = mix(CM.limestone, CM.shadeWarm, 0.5);
/** The far plane: hills, the infinity strip, the low white city, the landmarks (receded per role, see the header). */
const BACK_LIT = role(4, {infLit: CM.paper, backLit: CM.paper, backStone: CM.limestone, capLit: CM.paper});
const BACK_SHADE = role(4, {hill: SHADE_STONE, hillFar: SHADE_STONE, infShade: SHADE_STONE, backShade: SHADE_STONE, backSlate: SHADE_STONE, capShade: SHADE_STONE});
const BACK_TREE = role(4, {infTree: mix(CM.sage, CM.shadeCool, 0.15), backTree: mix(CM.sage, CM.shadeCool, 0.1)});
const FRONT_LIT = role(3, {lit: CM.paper, stone: CM.limestone, warm: mix(CM.stucco, CM.bandGold, 0.5), roofLit: CM.paper});
const FRONT_SHADE = role(3, {shade: SHADE_STONE_3, shadeDeep: SHADE_STONE, roofSlate: SHADE_STONE}, 2);
const FRONT_ROOF = role(3, {roofPink: mix(CM.brickLight, CM.blossom, 0.45), roofBrick: CM.brick, brick: CM.brick, brickShade: mix(CM.brick, CM.shadeWarm, 0.35), blossom: CM.blossom}, 2);
const FRONT_TREE = role(3, {tree: mix(CM.sage, CM.anchor, 0.2), treeLit: mix(CM.sage, CM.paper, 0.15), treeDark: mix(CM.sage, CM.anchor, 0.3), roofCopper: mix(CM.sage, CM.water, 0.4)}, 2);

export const FAR = {
  // +4 (the hills, the infinity strip, the two back rows, the Capitol)
  ...BACK_LIT,
  ...BACK_SHADE,
  ...BACK_TREE,
  backRoof: rc(mix(CM.brickLight, CM.blossom, 0.5), 4),
  // +3 (the front rows of the city)
  ...FRONT_LIT,
  ...FRONT_SHADE,
  ...FRONT_ROOF,
  ...FRONT_TREE,
  // the obelisk: one step nearer than its row, the darkest far shape (its shade face) on the palest cloud
  obLit: rc(CM.paper, 2.5),
  obShade: rc(mix(CM.stoneShade, CM.shadeCool, 0.7), 2.2),
  obLine: rc(mix(mix(CM.stoneShade, CM.shadeCool, 0.7), CM.shadeWarm, 0.18), 2.2),
};

/** The river plane (+2.6): the far shore, the Potomac, the bridges, the near bank, the parkway, the deep parkland. */
const R = 2.6;
export const RIV = {
  shoreBlossom: rc(CM.blossom, R),
  shoreBlossomLit: rc(mix(CM.blossom, CM.paper, 0.45), R),
  shoreTree: rc(mix(CM.sage, CM.anchor, 0.1), R),
  shoreTreeLit: rc(mix(CM.sage, CM.paper, 0.2), R),
  wall: rc(CM.limestone, R),
  wallShade: rc(mix(CM.stoneShade, CM.shadeCool, 0.3), R),
  water: rc(mix(CM.water, CM.glass, 0.3), R),
  waterDeep: rc(mix(CM.water, CM.shadeCool, 0.2), R),
  waterLit: rc(mix(CM.glass, CM.paper, 0.35), R),
  glint: CM.paper,
  /** bridges: a lit deck edge (paper) over a face in shade (the sun is ahead: the faces toward us are shaded) */
  bridge: rc(mix(CM.stoneShade, CM.shadeCool, 0.15), R),
  bridgeLit: rc(CM.paper, R),
  bridgeShade: rc(mix(CM.stoneShade, CM.shadeCool, 0.45), R),
  arch: rc(mix(CM.water, CM.shadeCool, 0.55), R),
  temple: rc(CM.paper, R),
  templeShade: rc(mix(CM.stoneShade, CM.shadeCool, 0.3), R),
  park: rc(mix(CM.sage, CM.paper, 0.1), R),
  parkLit: rc(mix(CM.sage, CM.paper, 0.4), R),
  parkShade: rc(mix(CM.sage, CM.shadeCool, 0.2), R),
  /** the deep parkland's lawn (nearer than the river: a little greener) */
  parkDeep: rc(mix(CM.sage, CM.paper, 0.08), R),
  tree: rc(mix(CM.sage, CM.anchor, 0.18), R),
  treeLit: rc(mix(CM.sage, CM.leafGold, 0.12), R),
  treeDark: rc(mix(CM.sage, CM.anchor, 0.34), R),
  blossom: rc(CM.blossom, R),
  blossomWhite: rc(mix(CM.paper, CM.blossom, 0.25), R),
  road: rc(mix(CM.paving, CM.paper, 0.35), R),
  roadEdge: rc(mix(CM.stoneShade, CM.shadeCool, 0.2), R),
  path: rc(CM.paper, R),
  hull: rc(CM.paper, R),
  sail: rc(CM.paper, R),
  rower: rc(CM.coatSlate, R),
  dock: rc(CM.line, R),
  carCols: [CM.coatSlate, CM.coatMustard, CM.paper, CM.coatPlum, CM.brick, CM.coatOat, CM.paneUnlit, CM.paper].map((c) => rc(c, R)),
};
