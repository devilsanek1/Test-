// V2S3_water.tsx (lane L3; the water swap, 2026-10-28): S3's WATER, drawn by the film's ONE shared water (src/lib/water.tsx;
// how-to src/lib/WATER.md, S3's recipe; the rules CRAFT §f.7). The owner on the G4 look clip v5 (2026-10-28): "way too
// cheap, not clean or premium quality or refined, just lazy and cheap"; the flat two-value placeholder that stood here is
// gone. Every reflection is DERIVED from S3's own geometry (V2S3_tHouses, V2S3_tLife, V2S3_tWest, V2S3_nboat) and its
// own colours as the clean pen draws them (the terrace's tier, bg CM.brick), its sky (S3_SUNSET) and air (S3_AIR), the
// rig's water tint (RIG_CANAL): never S1's numbers. Two specs, drawn at their places in the z-order (the boat between):
//   'canal'   the canal between her coping (its foot, the waterline, y 1130) and our moored boat's roof (y 1262, the
//             water runs on under it to 1300): her terrace's ground storey mirrored (each house one mass, its doors and
//             her lace window as masses, the three lit neighbours' windows as LIGHT ON WATER), the garden wall and the
//             tree's trunk in the west gap, her towpath's bench, bollards, bin and lamp post, the coping's own face as
//             one crisp band, the heron's post (it stands in the water); the far walker's legs; SUN3's glitter column
//             (x 96: the water's own bed and slivers; the four-point star glints of V2S3_particles are retired, CRAFT
//             §f.7e "never stars"); 9 ripple lines
//   'sliver'  the strip under our hull (y 1616-1631): a steep near view (ladder k 0.70-0.80, mostly body), the hull's
//             slate mirrored WHOLE as its one mass (a near mirror)
// The camera: the canal's own eye level is the shot's World horizon (y 1000), not S3_CAM's towpath VP (y 1150 lies
// below the canal's far edge at 1130: no level water can lie above its horizon); f 1400; the eye 1.5 m over the water
// (her coping's drawn face is 9 px over the 130 px from the horizon to the waterline: t / e = 0.069, the coping ~0.1 m
// over the water; her terrace then stands ~20 m off at ~71 px/m). Things on her towpath mirror about the lens line
// under their base (R1): yb -> 1000 + (yb - 1000) x 1.074; the terrace's foot (1100) about y 1107.4, so its first
// ~15 px hide behind the mirrored coping as they should. The visible canal shows the facade's rows 1085 -> 949.
// FILM seconds (V2S3.tsx wraps the shot in <TimeShift by={-S3_START}>); screen px at the float's rest (the 12.98 match).
import React from 'react';
import {CM} from '../palette';
import {useTime} from '../../lib/time';
import {tierFill} from '../../lib/pen';
import {multiply} from '../../lib/light';
import {parallaxOffset} from '../../lib/depth';
import {Water, lensD, waterColourAt, waterStep, type Poly, type Pt, type WaterSource, type WaterSpec} from '../../lib/water';
import {S3_AIR, S3_SUNSET} from '../world/skies';
import {TINT_CANAL} from '../world/rigs';
import * as MAP from '../world/map';
import {S3_PLANE, S3_START, s3Float} from './V2S3_rig';
import {HOUSES, TL} from './V2S3_tHouses';
import {BENCH, BIN, BOLLARDS, BOLLARD_H, LAMP, PATH, WALKER} from './V2S3_tLife';
import {S3_IRON} from './V2S3_tParts';
import {S3_GARDEN, S3_TREE, SUN3} from './V2S3_tWest';
import {NB} from './V2S3_nboat';

/** Everything the shot's other code needs about S3's water (world px at the 12.98 match = screen px at the float's rest):
 *  its regions, its edges, what stands in it (the heron's post) and the sun's column (S3W_SUN). */
export const S3_WATER = {
  /** The canal: its region and edges; the far edge is her towpath's coping (its stone face stands just above it). */
  canal: {x0: -80, x1: 1180, y0: 1130, y1: 1262, bottom: 1300, plane: -0.6},
  /** The water under our hull: between the hull's waterline and our coping's lip (both stand above it). */
  sliver: {x0: -70, x1: 1170, y0: 1604, y1: 1634, waterline: 1616, lip: 1631, plane: -1},
  /** The lines that bound the water: her coping (the far edge, a 9 px stone band above y 1130), our hull's
   *  waterline (the plum gunwale stripe and the slate hull above it) and our coping's lip (limestone below it). */
  edges: {herCoping: {y: 1130, h: 9}, hullWaterline: 1616, ourLip: 1631, boatRoofFar: 1262},
  /** What stands in the water or above its edge: the heron's mooring post (its waterline y 1236). */
  standing: [{what: 'the heron on its mooring post', x: 1046, top: 1150, bottom: 1236, w: 12}],
  /** What the water mirrors (x ranges on the far bank; colours as drawn): the sun, her lit window, the terrace, the
   *  heritage lamp, the tree past her end wall. */
  reflected: [
    {what: 'the sun (SUN3)', x0: 50, x1: 142, color: CM.sun},
    {what: 'her lit window (M)', x0: MAP.W2_CUT.x - MAP.W2_CUT.w / 2, x1: MAP.W2_CUT.x + MAP.W2_CUT.w / 2, color: CM.lamp},
    {what: 'the terrace', x0: 165, x1: 1180, color: CM.brick},
    {what: 'the lit heritage lamp', x0: 980, x1: 992, color: CM.lamp},
    {what: 'the autumn tree and the garden wall', x0: -80, x1: 152, color: CM.sage},
  ],
  /** The low sun's glitter column on the canal (lib/water's own bed and slivers under SUN3) and the colour under it. */
  glitter: {x: 96, yFar: 1142, yNear: 1215, wFar: 40, wNear: 80, on: CM.water},
  /** The shot's camera and air (V2S3_depth): the towpath's vanishing point (540, 1150), the far air. */
  camera: {horizon: 1150, vpx: 540},
  air: S3_AIR,
} as const;

// ================================================================= the water's camera and mirror lines

/** S3's water camera (the header): level, horizon 1000, focal 1400, the eye 1.5 m over the water. */
export const S3W_CAM = {horizon: 1000, f: 1400, eye: 1.5} as const;
/** eye over the water / eye over her towpath, from the coping's drawn face (9 px) and the waterline's 130 px. */
const K_LENS = 1 / (1 - PATH.coping / (PATH.edge - S3W_CAM.horizon));
/** THE MIRROR LINE of a thing standing on her towpath with its base at screen y (R1: the lens line under it). */
export const s3MirrorLine = (yBase: number): number => S3W_CAM.horizon + (yBase - S3W_CAM.horizon) * K_LENS;
/** The terrace's (and the garden wall's) mirror line: y 1107.4. */
const AX_T = s3MirrorLine(TL.ground);
/** The canal's near end as the engine sees it (the roof's far edge + 4) and the facade row it mirrors (~949): a thing
 *  is cut there, so its reflection's block and bars end inside the visible water (S1's wing: "the visible reflection
 *  reaches ~2.1 m up the ground storey"). */
const Y_NEAR = S3_WATER.canal.y1;
const Y_CUT = 2 * AX_T - (Y_NEAR + 4);
const PAPER = '#FBF3E6';

/** A reflection's counter-shift inside the canal's plane group (the shot's float: its thing's share - the canal's). */
const floatIn = (group: number) => (plane: number, t: number): Pt => {
  const f = s3Float(t);
  const a = parallaxOffset(f, plane);
  const b = parallaxOffset(f, group);
  return [a[0] - b[0], a[1] - b[1]];
};

// ================================================================= the clean pen's on-screen colours

/** The terrace's tier (V2S3.tsx: environment, bg CM.brick): her towpath and its furniture draw in it too. */
const env3 = (c: string) => tierFill(c, 'environment', CM.brick);
/** The canal's tier (environment, the pen's bg): the heron's post. */
const envW = (c: string) => tierFill(c, 'environment');
const rect = (x0: number, y0: number, x1: number, y1: number): Poly => [
  [x0, y0],
  [x1, y0],
  [x1, y1],
  [x0, y1],
];

/** Reflection layers (higher = nearer, drawn later; >= 30 over the glitter). */
const LAYER = {trunk: 8, wall: 10, opening: 11, light: 12, people: 20, furniture: 22, bollards: 30, coping: 31, post: 32} as const;

/** A heritage lamp post's plinth and column (V2S3_tLife lampBatch; the lit lantern sits far beyond the canal's end). */
function lampPoly(x: number, y: number, h: number): Poly {
  const cw = h * 0.034;
  return [[x - 1.6 * cw, y], [x - 1.2 * cw, y - 0.08 * h], [x - 0.7 * cw, y - 0.08 * h], [x - 0.45 * cw, y - 0.8 * h], [x + 0.45 * cw, y - 0.8 * h], [x + 0.7 * cw, y - 0.08 * h], [x + 1.2 * cw, y - 0.08 * h], [x + 1.6 * cw, y]];
}
/** A mooring bollard (V2S3_tLife bollardD + its dome) as one polygon. */
function bollardPoly(x: number, y: number, h: number): Poly {
  const w = h * 0.9;
  return [[x - 0.42 * w, y], [x - 0.3 * w, y - 0.55 * h], [x - 0.44 * w, y - 0.77 * h], [x - 0.33 * w, y - 0.93 * h], [x, y - 1.02 * h], [x + 0.33 * w, y - 0.93 * h], [x + 0.44 * w, y - 0.77 * h], [x + 0.3 * w, y - 0.55 * h], [x + 0.42 * w, y]];
}

/** The ground storey's colour per house as drawn (the stock-brick and the stucco houses have stucco / sage ground floors). */
const GROUND_FLOOR: Record<string, string> = {her: CM.brick, stock: CM.stucco, deep: CM.brickDeep, stucco: CM.sage};

/** Every static thing over S3's canal, at the float's rest (built once: the clean pen's colours are known then). */
function canalSources(): WaterSource[] {
  const out: WaterSource[] = [];
  const P0 = S3_PLANE.terrace;
  // ---- the west gap: the garden wall past her end wall (one mass: its coping, gate and ivy are one plane simpler,
  // R5) and the tree's trunk behind it (its crown mirrors past the canal's end)
  out.push({id: 'west/wall', thing: rect(S3_GARDEN.x0 - 10, S3_GARDEN.top, S3_GARDEN.x1, S3_GARDEN.foot), axis: AX_T, color: env3(CM.brickLight), layer: LAYER.wall, plane: P0, breakup: 0.4, narrow: 0.1});
  out.push({id: 'west/trunk', thing: rect(S3_TREE.x - 10, Y_CUT, S3_TREE.x + 11, S3_GARDEN.foot), axis: AX_T, color: env3(CM.line), layer: LAYER.trunk, plane: P0, breakup: 0, narrow: 0.1, taper: 1.2, solid: 0.7, maxBars: 2});
  // ---- her terrace's ground storey: each house ONE mass (its piers, railings, steps and the bay's mouldings are one
  // plane simpler), cut at the row the canal's near end mirrors
  for (const h of HOUSES) {
    out.push({id: `house/${h.id}`, thing: rect(h.x0, Y_CUT, h.x1, TL.ground), axis: AX_T, color: env3(GROUND_FLOOR[h.id] ?? h.wall), layer: LAYER.wall, plane: P0, breakup: 0.45, narrow: 0.12});
  }
  // ---- the openings: the three front doors (their fanlights mirror past the canal's end) and her lace window
  const doors: [string, number, number, string][] = [
    ['door/her', 184, 246, CM.hero],
    ['door/stock', 690, 752, CM.coatMustard],
    ['door/deep', 792, 852, CM.sage],
  ];
  for (const [id, x0, x1, c] of doors) out.push({id, thing: rect(x0, Y_CUT, x1, 1066), axis: AX_T, color: env3(c), layer: LAYER.opening, plane: P0, breakup: 0.2, narrow: 0.08});
  // her ground-floor window behind lace nets (the tripartite glass, unlit: one value)
  out.push({id: 'glass/her', thing: rect(300, Y_CUT, 464, 1034), axis: AX_T, color: '#90A0AA', layer: LAYER.opening, plane: P0, breakup: 0.2, narrow: 0.08});
  // ---- the lit neighbours' ground-floor windows: LIGHT ON WATER (lib/water LightOpts: a block <= 35 % of the visible
  // length with a rippled bottom, then 2 leaf slivers; a step under the lit glass, CM.lamp as drawn); as wide as the
  // lit panes (the curtains and frames stay with the wall). Two slivers, not three: three lights share the canal and
  // her window (above, not in the water) is the shot's one read
  const lights: [string, number, number, number][] = [
    ['lit/stock', 578, 634, 1012],
    ['lit/deep', 898, 982, 1033],
    ['lit/stucco', 1046, 1144, 1031],
  ];
  for (const [id, x0, x1, y1] of lights) out.push({id, thing: rect(x0, Y_CUT, x1, y1), axis: AX_T, color: CM.lamp, kind: 'light', layer: LAYER.light, plane: P0, light: {solid: 0.33, slivers: 2, step: 6, fall: 1.3}});
  // ---- her towpath's furniture, each about the lens line under its own feet: the bench (one wood mass), the bin, the
  // lamp post (a long thin vertical: whole for 70 %, two bars at most), the bollards (dome-capped stubs)
  out.push({id: 'path/bench', thing: rect(BENCH.x - BENCH.w / 2, BENCH.y - 50, BENCH.x + BENCH.w / 2, BENCH.y), axis: s3MirrorLine(BENCH.y), color: env3('#C09474'), layer: LAYER.furniture, plane: P0, breakup: 0.2, narrow: 0.06, solid: 0.75});
  out.push({id: 'path/bin', thing: rect(BIN.x - BIN.h * 0.31, BIN.y - BIN.h, BIN.x + BIN.h * 0.31, BIN.y), axis: s3MirrorLine(BIN.y), color: env3(S3_IRON), layer: LAYER.furniture, plane: P0, breakup: 0, narrow: 0.06, solid: 0.8, maxBars: 2});
  out.push({id: 'path/lamp', thing: lampPoly(LAMP.x, LAMP.y, LAMP.h), axis: s3MirrorLine(LAMP.y), color: env3(S3_IRON), layer: LAYER.furniture, plane: P0, breakup: 0, narrow: 0.2, taper: 1.2, solid: 0.7, maxBars: 2});
  for (const x of BOLLARDS) {
    const y = PATH.edge - 4;
    out.push({id: `bollard${x}`, thing: bollardPoly(x, y, BOLLARD_H), axis: s3MirrorLine(y), color: env3(S3_IRON), layer: LAYER.bollards, plane: P0, draw: 'stub'});
  }
  // ---- the coping's own face, mirrored: ONE crisp cool band along the far edge (R10), 2 px over the reflections'
  // start (no seam of light); still (a contact band never sways)
  const top: Pt[] = [];
  const bot: Pt[] = [];
  for (let x = -100; x <= 1200; x += 20) {
    top.push([x, PATH.edge - 2]);
    bot.push([x, PATH.edge + PATH.coping + 2]);
  }
  out.push({id: 'coping', refl: [...top, ...bot.reverse()], color: multiply(env3(CM.stoneShade), TINT_CANAL.form), layer: LAYER.coping, plane: P0, draw: 'crisp'});
  // ---- the heron's mooring post: it stands IN the canal (its own waterline), its reflection hangs from its foot
  const post = S3_WATER.standing[0];
  out.push({id: 'post', thing: rect(post.x - post.w / 2, post.top, post.x + post.w / 2, post.bottom), axis: post.bottom, color: envW(POST_WOOD), layer: LAYER.post, plane: S3_PLANE.water, breakup: 0, narrow: 0.1, taper: 1.2, solid: 1});
  return out;
}
/** The heron's post's weathered timber (V2S3_tCanal). */
export const POST_WOOD = '#9C8676';

/** The far walker (V2S3_tLife WALKER), simplified (R5): his LEGS' lowest 0.12 h as ONE slim wedge hanging from the lens
 *  line under his feet, toned near the water (kMin 0.85: S1's figure rule; never a second figure). */
function canalMoving(t: number): WaterSource[] {
  const x = WALKER.x + WALKER.v * (t - S3_START);
  const s = WALKER.h / 170;
  const fy = WALKER.y;
  const f = (dx: number, dy: number): Pt => [x + dx * s, fy + dy * s];
  return [{id: 'fig/walker', thing: [f(-4, 0), f(4, 0), f(3.4, -6), f(2.3, -12), f(1, -17), f(0, -20), f(-1, -17), f(-2.3, -12), f(-3.4, -6)], axis: s3MirrorLine(fy), color: env3(CM.coatSlate), kind: 'figure', kMin: 0.85, layer: LAYER.people, plane: S3_PLANE.terrace, breakup: 0, narrow: 0, taper: 1.6, solid: 1}];
}

// ================================================================= the specs

/** The film seconds the shot's fields run from (steady: they were running before the cut, so nothing is born in the
 *  12.98 match's window). */
const FIELD_T0 = 12.0;
/** SUN3's glitter column (x 96): the water's own still bed and slivers on the bands of 5-8 px (y ~1153-1214, where a
 *  lens is 4-6.6 px: CRAFT §f.7e), over the garden wall's reflection. */
export const S3W_SUN_ROWS: [number, number] = [1150, 1214];

const S3_CANAL: WaterSpec = {
  id: 'S3 canal',
  seed: 's3canal',
  cam: {...S3W_CAM},
  region: {top: () => S3_WATER.canal.y0, bottom: () => Y_NEAR, x0: S3_WATER.canal.x0, x1: S3_WATER.canal.x1, tuckTop: 0, tuckBottom: S3_WATER.canal.bottom - Y_NEAR, step: 20},
  sky: S3_SUNSET,
  air: S3_AIR,
  // the lit ground beside the water as drawn: her towpath's paving (the coping's limestone is the edge itself: its own
  // mirrored face, the crisp band, parts it from the water)
  notLike: [{name: 'her towpath', hex: env3(CM.paving)}],
  body: '#9CC3BC',
  tint: TINT_CANAL.water,
  tier: 'environment',
  ramp: {yFar: S3_WATER.canal.y0, yNear: Y_NEAR},
  ladder: {k: [0.4, 0.72], y: [S3_WATER.canal.y0, Y_NEAR], step: 0.05},
  grid: {dz: 0.45, minPitch: 3, gap: [0.16, 0.26]},
  sources: [],
  moving: canalMoving,
  sun: {x: SUN3.x, y: SUN3.y, slope: 0.06, rows: S3W_SUN_ROWS, t0: FIELD_T0, slots: 6, life: [0.5, 0.8], len: [20, 34], sigma: 22, plane: S3_PLANE.sky},
  // ripple lines: 9 slots across the canal, clear of the glitter column and of the heron's post
  ripples: {
    slots: 9,
    x: [-60, 1160],
    y: [1138, 1266],
    avoid: [
      [36, 1136, 160, 1224],
      [1026, 1140, 1066, 1300],
    ],
    len: [40, 150],
    thick: [1.5, 3],
    drift: [6, 16],
    life: [2.6, 4.6],
    t0: FIELD_T0,
  },
  float: floatIn(S3_PLANE.water),
  skyPlane: S3_PLANE.sky,
  // the shot never opens the film: its water is whole from its first frame (a front at film 0, long crossed)
  flood: {origin: [SUN3.x, SUN3.y], t0: 0, speed: 6000, pale: 0.7, paper: PAPER},
  joins: [S3_START, 14.86],
};

/** The hull's slate as the boat's plane draws it (V2S3_nboat: CM.paneUnlit, on screen #616F82; measured on the 13.0
 *  still: the near plane's value step and its tier). */
const HULL = '#616F82';
const S3_SLIVER: WaterSpec = {
  id: 'S3 sliver',
  seed: 's3sliver',
  cam: {...S3W_CAM},
  region: {top: () => S3_WATER.sliver.waterline, bottom: () => S3_WATER.sliver.lip, x0: S3_WATER.sliver.x0, x1: S3_WATER.sliver.x1, tuckTop: 4, tuckBottom: 3, step: 40},
  sky: S3_SUNSET,
  air: S3_AIR,
  notLike: [{name: 'our coping', hex: '#D9D3C8'}],
  body: '#9CC3BC',
  tint: TINT_CANAL.water,
  tier: 'environment',
  // a deeper Fresnel step (OKLab L - 0.08): the mirrored zenith here is the caption band's mint, within 4 L* of the air
  ramp: {yFar: S3_WATER.sliver.waterline, yNear: S3_WATER.sliver.lip, dl: [0.08, -0.03]},
  // a steep near view: mostly the water's own body (WATER.md's S3 recipe)
  ladder: {k: [0.7, 0.8], y: [S3_WATER.sliver.waterline, S3_WATER.sliver.lip], step: 0.05},
  grid: {dz: 0.45, minPitch: 3, gap: [0.16, 0.26]},
  // the hull's slate side, mirrored WHOLE about its waterline (a near mirror: one shape), its sides past the frame
  sources: [{id: 'hull', thing: rect(NB.x0 - 30, NB.gun1, NB.x1 + 30, NB.water), axis: NB.water, color: HULL, layer: 10, plane: S3_PLANE.boat, solid: 1}],
  float: floatIn(S3_PLANE.boat),
  skyPlane: S3_PLANE.sky,
  flood: {origin: [SUN3.x, SUN3.y], t0: 0, speed: 6000, pale: 0.7, paper: PAPER},
  joins: [S3_START, 14.86],
};

let built = false;
const ensure = () => {
  if (!built) {
    S3_CANAL.sources = canalSources();
    built = true;
  }
};
/** S3's water specs with their sources built (node QA, the lint). */
export const s3WaterSpecs = (): {canal: WaterSpec; sliver: WaterSpec} => {
  ensure();
  return {canal: S3_CANAL, sliver: S3_SLIVER};
};

/** The heron's post's contact on the canal: a thin lens a step under the water as drawn at its foot (R10: never a dark
 *  strip on water), for V2S3_tCanal. */
export const s3PostContact = (): {d: string; color: string} => {
  ensure();
  const p = S3_WATER.standing[0];
  return {d: lensD(p.x, p.bottom - 1, p.w * 2.2, 2.4), color: waterStep(waterColourAt(S3_CANAL, p.bottom + 2), -0.05)};
};

/** S3's water, one part at its place in the z-order. */
export const S3Water: React.FC<{part: 'canal' | 'sliver'}> = ({part}) => {
  const t = useTime();
  ensure();
  return <Water spec={part === 'canal' ? S3_CANAL : S3_SLIVER} t={t} />;
};
