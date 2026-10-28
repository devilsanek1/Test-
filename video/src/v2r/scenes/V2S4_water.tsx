// V2S4_water.tsx (lane L3; the water swap, 2026-10-28): S4's WATER, drawn by the film's ONE shared water (src/lib/water.tsx;
// how-to src/lib/WATER.md, the S4 / S8 recipe; the rules CRAFT §f.7). The owner on the G4 look clip v5 (2026-10-28):
// "way too cheap, not clean or premium quality or refined, just lazy and cheap": the flat placeholder that stood here
// is gone. Every reflection is DERIVED from S4's own geometry (V2S4_wpath, V2S4_wboat, V2S4_wcore) and colours as the
// clean pen draws them (her towpath's tier, bg CM.paving), its sky (S4_SKY) and air (S4_AIR), the rig's water tint
// (RIG_CANAL): never S1's numbers. Two specs, drawn at their places in the z-order:
//   'canal'  the canal strip between her coping (its lip, the waterline, y 1082) and our boat's roof (y 1222; the water
//            runs on under it to 1240), in the canal plane's group (1.0x: it trucks with her towpath): the coping's own
//            face as one crisp band, the garden walls and gates mirrored (one mass a segment), the terrace backs above
//            them as one pale mass (the 0.6x plane: its reflection slides at its own speed, counter-shifted), the three
//            lamp posts, the fingerpost and the bollards; SUN1's glitter column (x 250, screen-fixed: the water's own bed
//            and slivers; the four-point star glints of V2S4_particles are retired, CRAFT §f.7e "never stars"); 8 ripple
//            lines. No reflection of her, ever (L3's rule: she is the subject; R5 "never a second her")
//   'near'   the water in front of our hull (y 1700 to the frame's foot), streaming at 2.0x under the screen-fixed boat
//            (its own group slides 2.0x; the boat's mirror, the ramp and the sky hold still on screen): our boat mirrored
//            WHOLE (a near mirror: the slate hull, the plum gunwale stripe, the sage cabin side), a steep near view
//            (ladder k 0.70-0.80, mostly body); 7 ripple lines streaming with the water
// The camera is S4_CAM's (horizon 760 = the sky's, focal 1400); the eye 3.22 m over the water (her coping's drawn face is
// 12 px over the 322 px from the horizon to the waterline: t / e = 0.037; her 100 px/m at her feet, 1070, puts the eye
// 3.10 m over her towpath, so e = 3.10 / (1 - 0.037)). Things on her towpath mirror about the lens line under their base
// (R1): yb -> 760 + (yb - 760) x 1.0387 (her feet's line, 1070, onto the waterline 1082 exactly).
// FILM seconds (V2S4.tsx wraps the shot in <TimeShift by={-S4_START}>); plane px at the 17.96 pose (= screen px at rest).
import React from 'react';
import {CM} from '../palette';
import {useTime} from '../../lib/time';
import {tierFill} from '../../lib/pen';
import {multiply} from '../../lib/light';
import {Water, type Poly, type Pt, type WaterSource, type WaterSpec} from '../../lib/water';
import {S4_AIR, S4_SKY} from '../world/skies';
import {TINT_CANAL} from '../world/rigs';
import {ROW, PLANE_X, SUN} from './V2S4_wcore';
import {S4_CAM, S4_PLANE} from './V2S4_depth';
import {S4_END, S4_K, S4_START, s4PlaneDx} from './V2S4_rig';
import {BOLLARDS, GATE_SLATE, LAMPS, LAMP_FOOT, SEGS} from './V2S4_wpath';
import {S4_IRON} from './V2S4_wcast';

const [CX0, CX1] = PLANE_X(S4_K.canal);
const [NX0, NX1] = PLANE_X(S4_K.near);

/** Everything the shot's other code needs about S4's water (plane px at the 17.96 pose; the canal and the near water
 *  truck with their planes: V2S4_rig s4PlaneDx(S4_K.canal / S4_K.near, t)). */
export const S4_WATER = {
  /** The canal strip: its region (plane px) and depth plane; the far edge is her coping's lip. */
  canal: {x0: CX0, x1: CX1, y0: ROW.edge, y1: ROW.roofFar + 18, plane: S4_PLANE.canal, truckK: S4_K.canal},
  /** The water in front of our hull (its own 2.0x group; our boat glides with us, the water streams past). */
  near: {x0: NX0, x1: NX1, y0: ROW.waterline, y1: 1944, plane: S4_PLANE.near, truckK: S4_K.near},
  /** The lines that bound the water: her coping (its lip at y 1082, a 12 px face above it), our boat's roof (its far
   *  edge hides the canal from y 1222), our hull's waterline (y 1700). */
  edges: {herCoping: {y: ROW.edge, face: ROW.edge - ROW.copingTop}, boatRoofFar: ROW.roofFar, hullWaterline: ROW.waterline},
  /** What stands in the water or above its edge: the angler's float, the ducks, our hull. Plane px at the pose. */
  standing: [
    {what: "the angler's float (still)", x: 226, y: 1136, w: 8},
    {what: 'two ducks paddling west (24 px/s in the canal plane)', x: 1040, y: 1168, w: 32},
    {what: 'our hull (the waterline of the near water)', y: ROW.waterline},
  ],
  /** SUN1's glitter column, on the CANAL (the water's own bed and slivers, screen-fixed under the sun; the canal is the
   *  water nearest the sun's mirror point, y 870: the near water's 88-140 px bands hold no CRAFT-sized bed) and the
   *  colour under it at the pose (the ramp there). */
  glitter: {x: SUN.x, yFar: ROW.edge + 8, yNear: ROW.roofFar - 2, on: '#A9C9C3'},
  /** The shot's camera and air (V2S4_depth). */
  camera: {horizon: S4_CAM.horizon, vpx: S4_CAM.vpx},
  air: S4_AIR,
} as const;

// ================================================================= the water's camera and mirror lines

/** S4's water camera (the header). */
export const S4W_CAM = {horizon: S4_CAM.horizon, f: 1400, eye: 3.22} as const;
const K_LENS = 1 / (1 - (ROW.edge - ROW.copingTop) / (ROW.edge - S4W_CAM.horizon));
/** THE MIRROR LINE of a thing standing on her towpath with its base at screen y (R1: the lens line under it). */
export const s4MirrorLine = (yBase: number): number => S4W_CAM.horizon + (yBase - S4W_CAM.horizon) * K_LENS;
const PAPER = '#FBF3E6';

/** A plane's truck factor (S4_K) from its depth plane (S4_PLANE). */
const truckK = (plane: number): number => {
  if (!Number.isFinite(plane)) return S4_K.sun;
  if (plane === S4_PLANE.far) return S4_K.far;
  if (plane === S4_PLANE.backs) return S4_K.backs;
  if (plane === S4_PLANE.path || plane === S4_PLANE.canal) return S4_K.path;
  return S4_K.boat; // our boat (screen-fixed)
};
/** A reflection's counter-shift inside a water group that trucks at `k` (its thing's truck - the water's). */
const truckIn = (k: number) => (plane: number, t: number): Pt => [s4PlaneDx(truckK(plane), t) - s4PlaneDx(k, t), 0];

// ================================================================= the clean pen's on-screen colours

/** Her towpath's tier (V2S4.tsx: environment, bg CM.paving). */
const env4 = (c: string) => tierFill(c, 'environment', CM.paving);
const rect = (x0: number, y0: number, x1: number, y1: number): Poly => [
  [x0, y0],
  [x1, y0],
  [x1, y1],
  [x0, y1],
];
/** The terrace backs above the garden walls as drawn (the 0.6x plane, hazed toward S4_AIR: measured on the 17.97
 *  still), and the sun's clear column through them above y 716 (V2S4_wcore sunClear(0.6)). */
const BACKS = '#DBB093';
const BACKS_GAP: [number, number] = [189, 497];

/** Reflection layers (higher = nearer, drawn later; >= 30 over the glitter). */
const LAYER = {backs: 4, wall: 10, gate: 11, lamps: 13, post: 14, bollards: 30, coping: 31} as const;

/** A heritage lamp post's plinth and column (V2S4_wpath lampInto; its lantern mirrors past the canal's end). */
function lampPoly(x: number, y: number, h: number): Poly {
  const cw = Math.max(2.5, h * 0.034);
  return [[x - 1.6 * cw, y], [x - 1.2 * cw, y - 0.08 * h], [x - 0.7 * cw, y - 0.08 * h], [x - 0.45 * cw, y - 0.8 * h], [x + 0.45 * cw, y - 0.8 * h], [x + 0.7 * cw, y - 0.08 * h], [x + 1.2 * cw, y - 0.08 * h], [x + 1.6 * cw, y]];
}
/** A mooring bollard (V2S4_wpath bollardD) as one polygon. */
function bollardPoly(x: number, y: number, h: number): Poly {
  const w = h * 0.9;
  return [[x - 0.42 * w, y], [x - 0.3 * w, y - 0.55 * h], [x - 0.44 * w, y - 0.77 * h], [x - 0.33 * w, y - 0.93 * h], [x, y - 1.04 * h], [x + 0.33 * w, y - 0.93 * h], [x + 0.44 * w, y - 0.77 * h], [x + 0.3 * w, y - 0.55 * h], [x + 0.42 * w, y]];
}

/** Every static thing over S4's canal (plane px at the pose; built once: the clean pen's colours are known then). */
function canalSources(): WaterSource[] {
  const out: WaterSource[] = [];
  const P0 = S4_PLANE.path;
  const AXW = s4MirrorLine(ROW.wallFoot);
  // ---- the terrace backs above the garden walls: ONE pale far mass (R5), its lens line under their hidden foot (y ~900
  // behind the walls), the sun's clear column cut through it above y 716; it slides at 0.6x
  const [g0, g1] = BACKS_GAP;
  out.push({id: 'backs', thing: [[X_BACKS[0], 604], [g0, 604], [g0, 716], [g1, 716], [g1, 604], [X_BACKS[1], 604], [X_BACKS[1], ROW.wallTop], [X_BACKS[0], ROW.wallTop]], axis: s4MirrorLine(900), color: BACKS, layer: LAYER.backs, plane: S4_PLANE.backs, breakup: 0.4, narrow: 0.08});
  // ---- the garden walls: one mass a segment (ivy, pots, trellis slats and panels one plane simpler); a gate is its
  // leaf's colour between its two piers
  for (const s of SEGS) {
    const gate = s.kind === 'gate';
    out.push({id: `wall/${s.x0}`, thing: rect(s.x0, ROW.wallTop, s.x1, ROW.wallFoot), axis: AXW, color: env4(gate ? s.c : s.c), layer: LAYER.wall, plane: P0, breakup: 0.45, narrow: 0.1});
    if (gate) out.push({id: `gate/${s.x0}`, thing: rect(s.x0 + 14, ROW.wallTop + 8, s.x1 - 14, ROW.wallFoot), axis: AXW, color: env4(s.gate === GATE_SLATE ? GATE_SLATE : s.gate ?? s.c), layer: LAYER.gate, plane: P0, breakup: 0.2, narrow: 0.08});
  }
  // ---- the lamp posts (off): long thin verticals, whole for 70 %, two bars at most
  for (const l of LAMPS) out.push({id: `lamp${l.x}`, thing: lampPoly(l.x, LAMP_FOOT, l.h), axis: s4MirrorLine(LAMP_FOOT), color: env4(S4_IRON), layer: LAYER.lamps, plane: P0, breakup: 0, narrow: 0.2, taper: 1.2, solid: 0.7, maxBars: 2});
  // ---- the fingerpost (V2S4_post: the post, x 563-588, its foot at the lamps' line; its plates are lettering, one
  // plane simpler): one dark plum vertical, two bars at most
  out.push({id: 'post', thing: rect(563, 730, 588, LAMP_FOOT), axis: s4MirrorLine(LAMP_FOOT), color: CM.anchor, layer: LAYER.post, plane: P0, breakup: 0, narrow: 0.12, taper: 1.2, solid: 0.7, maxBars: 2});
  // ---- the bollards on the coping: dome-capped stubs
  for (const x of BOLLARDS) {
    const y = ROW.copingTop + 2;
    out.push({id: `bollard${x}`, thing: bollardPoly(x, y, 24), axis: s4MirrorLine(y), color: env4(S4_IRON), layer: LAYER.bollards, plane: P0, draw: 'stub'});
  }
  // ---- the coping's own face, mirrored: ONE crisp cool band along the far edge (R10), 2 px over the reflections'
  // start; still
  const face = ROW.edge - ROW.copingTop;
  const top: Pt[] = [];
  const bot: Pt[] = [];
  for (let x = CX0 - 20; x <= CX1 + 20; x += 20) {
    top.push([x, ROW.edge - 2]);
    bot.push([x, ROW.edge + face + 2]);
  }
  out.push({id: 'coping', refl: [...top, ...bot.reverse()], color: multiply(env4(CM.stoneShade), TINT_CANAL.form), layer: LAYER.coping, plane: P0, draw: 'crisp'});
  return out;
}
/** The backs plane's x span (V2S4_wcore PLANE_X(0.6)). */
const X_BACKS = PLANE_X(S4_K.backs);

/** The boat's side as drawn (V2S4_wboat, the boat's plane: measured on the 17.97 still): the sage cabin side
 *  (1290-1638), the plum gunwale stripe (1640-1654), the slate hull (1656-1700). */
const BOAT_BANDS: [string, number, number, string][] = [
  ['boat/cabin', ROW.cabinTop, 1638, '#ABBCA5'],
  ['boat/stripe', ROW.gunwale, 1654, '#453348'],
  ['boat/hull', 1656, ROW.waterline, '#677588'],
];
/** Our boat mirrored WHOLE in the near water about its waterline (a near mirror), each band its own mass; its sides are
 *  past the frame. Screen-fixed (the boat glides with the camera). */
function nearSources(): WaterSource[] {
  return BOAT_BANDS.map(([id, y0, y1, c], i) => ({id, thing: rect(-140, y0, 1220, y1), axis: ROW.waterline, color: c, layer: 10 + i, plane: S4_PLANE.boat, solid: 1}));
}

// ================================================================= the specs

/** The film seconds the shot's fields run from (steady: running before the cut, so nothing is born at 14.86). */
const FIELD_T0 = 14.0;

const S4_CANAL: WaterSpec = {
  id: 'S4 canal',
  seed: 's4canal',
  cam: {...S4W_CAM},
  region: {top: () => ROW.edge, bottom: () => ROW.roofFar, x0: CX0, x1: CX1, tuckTop: 0, tuckBottom: S4_WATER.canal.y1 - ROW.roofFar, step: 20},
  sky: S4_SKY,
  air: S4_AIR,
  // the lit ground beside the water as drawn: her towpath's flagstones
  notLike: [{name: 'her towpath', hex: env4(CM.paving)}],
  body: '#9CC3BC',
  tint: TINT_CANAL.water,
  tier: 'environment',
  ramp: {yFar: ROW.edge, yNear: ROW.roofFar},
  ladder: {k: [0.4, 0.72], y: [ROW.edge, ROW.roofFar], step: 0.05},
  grid: {dz: 0.45, minPitch: 3, gap: [0.16, 0.26]},
  sources: [],
  // SUN1 (screen-fixed: the sky's plane): its column over the strip's whole depth
  sun: {x: SUN.x, y: SUN.y, slope: 0.06, rows: [S4_WATER.glitter.yFar, S4_WATER.glitter.yNear], t0: FIELD_T0, slots: 6, life: [0.5, 0.8], len: [20, 34], sigma: 22, plane: S4_PLANE.sky},
  // ripple lines: 8 slots along the strip (plane px), clear of the sun's column at the stop and of the angler's float
  ripples: {
    slots: 8,
    x: [CX0 + 30, CX1 - 30],
    y: [ROW.edge + 10, ROW.roofFar + 4],
    avoid: [
      [180, ROW.edge, 320, ROW.roofFar + 10],
      [200, 1120, 252, 1150],
    ],
    len: [40, 150],
    thick: [1.5, 3],
    drift: [6, 16],
    life: [2.6, 4.6],
    t0: FIELD_T0,
  },
  float: truckIn(S4_K.canal),
  skyPlane: S4_PLANE.sky,
  // the shot never opens the film: its water is whole from its first frame (a front at film 0, long crossed)
  flood: {origin: [SUN.x, SUN.y], t0: 0, speed: 6000, pale: 0.7, paper: PAPER},
  joins: [S4_START, S4_END],
};

const S4_NEAR: WaterSpec = {
  id: 'S4 near water',
  seed: 's4near',
  cam: {...S4W_CAM},
  region: {top: () => ROW.waterline, bottom: () => S4_WATER.near.y1, x0: NX0, x1: NX1, tuckTop: 4, tuckBottom: 0, step: 40},
  sky: S4_SKY,
  air: S4_AIR,
  body: '#9CC3BC',
  tint: TINT_CANAL.water,
  tier: 'environment',
  ramp: {yFar: ROW.waterline, yNear: S4_WATER.near.y1},
  // a steep near view: mostly the water's own body (as S3's sliver)
  ladder: {k: [0.7, 0.8], y: [ROW.waterline, S4_WATER.near.y1], step: 0.05},
  grid: {dz: 0.45, minPitch: 3, gap: [0.16, 0.26]},
  sources: [],
  ripples: {
    slots: 7,
    x: [NX0 + 40, NX1 - 40],
    y: [ROW.waterline + 60, S4_WATER.near.y1 - 10],
    len: [60, 150],
    thick: [1.8, 3],
    drift: [6, 14],
    life: [2.6, 4.6],
    t0: FIELD_T0,
  },
  float: truckIn(S4_K.near),
  skyPlane: S4_PLANE.sky,
  flood: {origin: [SUN.x, SUN.y], t0: 0, speed: 6000, pale: 0.7, paper: PAPER},
  joins: [S4_START, S4_END],
};

let built = false;
const ensure = () => {
  if (!built) {
    S4_CANAL.sources = canalSources();
    S4_NEAR.sources = nearSources();
    built = true;
  }
};
/** S4's water specs with their sources built (node QA, the lint). */
export const s4WaterSpecs = (): {canal: WaterSpec; near: WaterSpec} => {
  ensure();
  return {canal: S4_CANAL, near: S4_NEAR};
};

/** S4's water, one part at its place in the z-order. The canal is drawn inside S4Canal's 1.0x group; the near water is
 *  drawn in screen space by the boat, so it carries its own 2.0x group here. */
export const S4Water: React.FC<{part: 'canal' | 'near'}> = ({part}) => {
  const t = useTime();
  ensure();
  if (part === 'canal') return <Water spec={S4_CANAL} t={t} />;
  return (
    <g transform={`translate(${s4PlaneDx(S4_K.near, t).toFixed(3)} 0)`}>
      <Water spec={S4_NEAR} t={t} />
    </g>
  );
};
