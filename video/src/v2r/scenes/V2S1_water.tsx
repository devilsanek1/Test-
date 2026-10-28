// V2S1 (lane L1): THE CANAL, drawn by the film's one shared water (src/lib/water.tsx; how-to src/lib/WATER.md; the
// rules CRAFT §f.7). The owner on the G4 look clip v5 (2026-10-28): "I don't like the water too much, leafs are great"
// ... "It's just looking way too cheap, not clean or premium quality or refined. Just lazy and cheap. I mean that about
// the water." The design is the water study's verdict (docs/v2/water/JUDGE.md: candidate A's true reflection and cool
// colour, candidate B's drawing language grafted in). This file is S1's SPEC (data): the canal's geometry and S1's
// one level camera (docs/v2/water/DIAGNOSIS.md §2), and every reflection DERIVED from S1's own geometry and the clean
// pen's own colours: the far roofs and the far tower (about the horizon), the road bridge and its arch (about the far
// water under it), Google's ground storey with the lit lobby's gold column and the sliding door leaves (about the lens
// line under the wing's base), the lamp posts, her and the row (about the far edge), the bollards, the coping's own
// face, the two moored boats (about their waterlines), the bus on the bridge. It also draws the duck: the kit's mallard
// exactly (its approved sway, no V), its contact lens and its mirrored underside.
import React, {useMemo} from 'react';
import {useTime} from '../../lib/time';
import {Fill} from '../../lib/Fill';
import {Water, floaterWater, waterColourAt, waterKAt, waterSwayAt, ellipsePoly, quadPts, lerp, type Axis, type Poly, type Pt, type WaterSource, type WaterSpec} from '../../lib/water';
import {atmos, backing, parallaxK} from '../../lib/depth';
import {tierFill} from '../../lib/pen';
import {multiply} from '../../lib/light';
import {bob} from '../../lib/idle';
import {rand} from '../../lib/rng';
import {CM} from '../palette';
import * as MAP from '../world/map';
import {S1_EVENING, S1_AIR} from '../world/skies';
import {TINT_CANAL} from '../world/rigs';
import {P, ovalPath} from '../kit/canal/core';
import {boatGeom, type BoatOpts} from '../kit/canal/boat';
import {BOAT_A, BOAT_B, S1_BOLLARDS, S1_DUCK, S1_FAR_LAMPS, S1_PATH, s1Bend} from './V2S1_set_life';
import {BANK, edgeY} from './V2S1_steps_stone';
import {S1_PLANE, s1Float} from './V2S1_float';
import {FLOOD, FLOOD_ORIGIN, S1_PALE, s1HerXAt} from './V2S1_clock';
import {BRIDGE, HAZE_K, S1_BUS, s1BusX} from './V2S1_set_far';
import {S1_HAZE, S1_IRON} from './V2S1_set_core';
import {herSpec, ghostSpec} from './V2S1_row';
import {S1_WING_PLANE as PM, S1_WING_V_PLINTH as V_PLINTH, S1_WING_HM as HM, s1WingBaseY} from './V2S1_set_wing';

// ================================================================= S1's water geometry (DIAGNOSIS §2)

/** S1's lens over the water: level, horizon 965, focal 1400 px; the eye 1.3 m over the far towpath, 1.45 m over the
 *  water (the far coping's foot, the waterline, is y 1110-1111 at her line, 14 m away). */
export const S1W_CAM = {horizon: MAP.S1_LENS.horizonY, f: MAP.S1_LENS.focalPx, eye: 1.45} as const;
const H0 = S1W_CAM.horizon;
/** The water's FAR edge: the far coping's foot (y 1111 on the straight, rising to 1068 at x 0 round the bend). */
export const s1WaterTop = (x: number): number => S1_PATH.edge + s1Bend(x);
/** Where the far quay's reflections begin: under the coping's face mirrored (15 px). */
export const s1ReflTop = (x: number): number => s1WaterTop(x) + S1_PATH.coping;
/** The water's NEAR edge: our coping's top (to the steps' vanishing point): 1144 at x 0, 1215 at 540, 1286 at 1080. */
export const s1WaterBottom = (x: number): number => edgeY(BANK.coping[0], x);
/** The water is this many times farther below the eye than the far towpath (1.45 / 1.3). */
const K_WATER = S1W_CAM.eye / MAP.S1_LENS.eyeHeightM;
const lensLine = (yFoot: number): number => H0 + (yFoot - H0) * K_WATER;
/** THE MIRROR LINE of a thing on the far towpath whose base is at screen y (R1): a thing on the front line (her, the
 *  row, the bollards) mirrors about the drawn far edge; a thing set back (the wing, the lamps at the path's back) about
 *  the lens's line under it, shifted onto the drawn edge, so its foot hides behind the mirrored coping as it should. */
export const s1MirrorLine = (x: number, yBase: number): number =>
  yBase >= MAP.s1TowpathFeetY(x) - 0.5 ? s1WaterTop(x) : lensLine(yBase) + (s1WaterTop(x) - lensLine(MAP.s1TowpathFeetY(x)));
/** A reflection's counter-shift inside the water's plane group: the shot's float x (its thing's share - the water's). */
const WATER_K = parallaxK(S1_PLANE.water);
export const s1WaterFloat = (plane: number, t: number): Pt => {
  const f = s1Float(t);
  const k = parallaxK(plane) - WATER_K;
  return [f[0] * k, f[1] * k];
};
const PAPER = '#FBF3E6';

// ================================================================= the clean pen's on-screen colours

const env = (c: string) => tierFill(c, 'environment');
const shaded = (c: string) => multiply(env(c), TINT_CANAL.form);
const hazed = (c: string, k: number) => env(atmos(c, k, S1_HAZE));
/** The far tower's field as the set draws it (V2S1_set_far CalmTower: backing() against the wing's lit corner). */
const towerField = () => env(backing(tierFill(CM.limestone, 'environment'), atmos('#8F93AE', HAZE_K.near, S1_HAZE), {tier: 'environment', min: 15}));

// ================================================================= the things over the water

/** Reflection layers (higher = nearer, drawn later). */
const LAYER = {roofs: 0, bridge: 1, ring: 2, opening: 3, bus: 4, posts: 5, wall: 10, wing: 11, lamps: 13, people: 20, leaves: 21, bollards: 30, coping: 31, boats: 40, boatsFront: 41} as const;

/** The wing's axis: the lens line under its base, at every x (its lowest ~21 px hide behind the mirrored coping). */
const WING_AXIS: Axis = {line: (x: number) => s1MirrorLine(x, s1WingBaseY(x))};
/** The road bridge beyond the bend mirrors about the far water under its arch (drawn at 1042-1056). */
const BRIDGE_AXIS = 1050;

const A = BRIDGE.arch;
function archY(x: number, grow = 0): number {
  const half = A.half + grow;
  const rise = A.spring - A.crown + grow;
  const R = (half * half + rise * rise) / (2 * rise);
  const yc = A.spring - rise + R;
  return yc - Math.sqrt(Math.max(0, R * R - (x - A.cx) * (x - A.cx)));
}
/** The arch's intrados (grown by `grow` px: the voussoir ring) down to `bottom`, as a polygon. */
const archPoly = (grow: number, bottom: number): Poly => {
  const half = A.half + grow;
  const pts: Poly = [[A.cx - half, bottom]];
  for (let k = 0; k <= 32; k++) {
    const x = A.cx - half + (2 * half * k) / 32;
    pts.push([x, archY(x, grow)]);
  }
  pts.push([A.cx + half, bottom]);
  return pts;
};
const rect = (x0: number, y0: number, x1: number, y1: number): Poly => [
  [x0, y0],
  [x1, y0],
  [x1, y1],
  [x0, y1],
];

/** The door (the wing's facade, local metres). The visible reflection reaches ~2.1 m up the ground storey. */
const DU0 = PM.uAt(MAP.S1_SHEET.door.x0, HM * 0.6);
const DU1 = PM.uAt(MAP.S1_SHEET.door.x1, HM * 0.6);
const DV0 = PM.vAt(MAP.S1_SHEET.door.y0, (DU0 + DU1) / 2);
const V_LO = HM - 2.1;
/** The door's frame (m a side): the lit glass inside it is the light. */
const DOOR_FRAME = 0.09;

/** A moored boat: its hull + gunwale as ONE dark mass with the raked bow's sweep (R5: the plum stripe is too thin to
 *  survive a rippled mirror); the pale cabin and the cratch are left to the water (a pale thing reflects weakly in the
 *  near water, R2, and their slices and the cratch's long diagonal only fragmented the boat): every boat is doubled by
 *  one dark band. About its own waterline. */
function boatThings(o: BoatOpts, id: string): WaterSource[] {
  const g = boatGeom(o);
  const {X} = g;
  const bowLift = o.h * 0.42;
  const hullTop = g.gunTop + g.gunH;
  const hull: Poly = [[X(0), o.water], [X(0), g.gunTop], [X(0.86), g.gunTop], ...quadPts([X(0.86), g.gunTop], [X(0.95), g.gunTop - bowLift * 0.3], [X(1) + o.dir * 3, g.gunTop - bowLift], 8), [X(1), hullTop - bowLift + g.gunH * 0.4], [X(0.985), o.water]];
  const dark = env(CM.paneUnlit);
  // each about its own waterline: the reflection starts right under the hull (S1BoatStrips covers the seam)
  const axis = o.water;
  return [
    {id: `${id}/hull`, thing: hull, axis, color: dark, layer: LAYER.boats, plane: S1_PLANE.boats, breakup: 0, narrow: 0.04, solid: 0.75},
  ];
}
/** A heritage lamp post's plinth and column (the lantern sits far below our edge in the water). */
function lampPoly(x: number, y: number, h: number): Poly {
  const cw = Math.max(2.2, h * 0.034);
  return [[x - 1.6 * cw, y], [x - 1.2 * cw, y - 0.08 * h], [x - 0.7 * cw, y - 0.08 * h], [x - 0.45 * cw, y - 0.8 * h], [x + 0.45 * cw, y - 0.8 * h], [x + 0.7 * cw, y - 0.08 * h], [x + 1.2 * cw, y - 0.08 * h], [x + 1.6 * cw, y]];
}
/** A mooring bollard (V2S1_set_life s1BollardInto: body and dome) as one polygon. */
function bollardPoly(x: number, y: number, h: number): Poly {
  const w = h * 0.9;
  return [[x - 0.42 * w, y], [x - 0.3 * w, y - 0.55 * h], [x - 0.44 * w, y - 0.77 * h], [x - 0.33 * w, y - 0.93 * h], [x, y - 1.02 * h], [x + 0.33 * w, y - 0.93 * h], [x + 0.44 * w, y - 0.77 * h], [x + 0.3 * w, y - 0.55 * h], [x + 0.42 * w, y]];
}

/** Every static thing over S1's water, at the camera's rest (built once: the clean pen's colours are known then). */
function s1Sources(): WaterSource[] {
  const out: WaterSource[] = [];
  const P0 = S1_PLANE.subject;
  // ---- the far roofs (+4) through and under the bridge's railing: one hazy band under the deck, its lower edge the
  // roofline turned upside down (about the horizon)
  const roofline: Pt[] = [[-70, 772], [40, 770], [46, 798], [56, 782], [108, 782], [118, 798], [118, 754], [210, 754], [222, 751], [286, 751], [300, 752], [372, 752]];
  out.push({id: 'roofs', thing: [[-70, 793], [372, 793], ...roofline.slice().reverse()], axis: 'horizon', color: hazed(CM.stucco, 0.7), layer: LAYER.roofs, plane: S1_PLANE.farRoofs, breakup: 0.3, narrow: 0.05});
  // ---- the far tower (+3), behind the bridge
  out.push({id: 'tower', thing: rect(258, 598, 346, 944), axis: 'horizon', color: towerField(), layer: LAYER.bridge, plane: S1_PLANE.farTower, breakup: 0.2, narrow: 0.1});
  // ---- the road bridge (+2): the brick spandrels, the limestone deck, the pilaster, the voussoir ring and inside it the
  // arch's soffit in shade seen from below: the arch and its reflection close into one ellipse across the far towpath;
  // the soffit's bowl keeps a clear value step under the ring (G7: >= 6 L*)
  // (the bridge's foot below its waterline is under water: each thing stops at the axis)
  const {x0, x1, deck, course} = BRIDGE;
  out.push({id: 'br/brick', thing: rect(x0, course, x1, BRIDGE_AXIS), axis: BRIDGE_AXIS, color: hazed(CM.brick, HAZE_K.bridge), layer: LAYER.bridge, plane: S1_PLANE.bridge, breakup: 0.35, narrow: 0.06});
  out.push({id: 'br/deck', thing: rect(x0, deck, x1, course), axis: BRIDGE_AXIS, color: hazed(CM.limestone, HAZE_K.bridge), layer: LAYER.bridge, plane: S1_PLANE.bridge, breakup: 0.35, narrow: 0.06});
  out.push({id: 'br/pilaster', thing: rect(268, course, 284, BRIDGE_AXIS), axis: BRIDGE_AXIS, color: hazed(CM.limestone, HAZE_K.bridge), layer: LAYER.ring, plane: S1_PLANE.bridge, breakup: 0, narrow: 0});
  out.push({id: 'br/ring', thing: archPoly(11, BRIDGE_AXIS), axis: BRIDGE_AXIS, color: hazed(CM.limestone, HAZE_K.bridge), layer: LAYER.ring, plane: S1_PLANE.bridge, breakup: 0, narrow: 0.04});
  out.push({id: 'br/soffit', thing: archPoly(0, BRIDGE_AXIS), axis: BRIDGE_AXIS, color: hazed(CM.stoneShade, HAZE_K.bridge), layer: LAYER.opening, plane: S1_PLANE.bridge, breakup: 0, narrow: 0.04, sep: {from: 'br/ring', dL: -6.5}});
  // (the railing, its 4.4 px posts and 1.6 px bars, is dropped: one plane simpler than the bridge, R5; at the far
  // bend its posts read as a comb, not as water)
  // ---- Google's wing (the subject's plane): its ground storey in the shade of the far city (V2S1_light's ground
  // Shade), from the plinth up ~2 m; one plane simpler than the facade (R5): the fins and the plinth merge into the wall
  out.push({id: 'wing/wall', thing: PM.q(-0.05, V_LO, PM.wM + 0.4, HM - V_LO), axis: WING_AXIS, color: shaded(CM.brickLight), layer: LAYER.wall, plane: P0, breakup: 0.5, narrow: 0.14});
  // the west end wall (lit stone) and the corner pier
  const [xs] = PM.p(0, HM);
  const pier = PM.pxPerM(0.25) * 0.5;
  out.push({id: 'wing/pier', thing: [[xs - 16, s1WingBaseY(xs) - 3], [xs + pier, s1WingBaseY(xs)], [xs + pier, PM.p(0, V_LO)[1]], [xs - 16, PM.p(0, V_LO)[1]]], axis: WING_AXIS, color: shaded(CM.limestone), layer: LAYER.wing, plane: P0, breakup: 0, narrow: 0});
  // the corner slit bay (unlit: one value)
  out.push({id: 'wing/slit', thing: PM.q(0.74, V_LO, 0.56, V_PLINTH - V_LO), axis: WING_AXIS, color: shaded(S1_IRON), layer: LAYER.wing, plane: P0, breakup: 0, narrow: 0.08});
  // the door bay, kept lit: the lobby's gold, THE light in the water (R7): a column as wide as the lit glass (the
  // door's frame, ~0.09 m a side, stays with the wall)
  out.push({id: 'wing/lobby', thing: PM.q(DU0 + DOOR_FRAME, Math.max(DV0, V_LO), DU1 - DU0 - 2 * DOOR_FRAME, HM - Math.max(DV0, V_LO)), axis: WING_AXIS, color: CM.lamp, kind: 'light', layer: LAYER.wing, plane: P0, breakup: 0.3, narrow: 0.16, taper: 5, solid: 0.55});
  // ---- the lamp posts at the path's back (off, slate iron): long thin verticals, whole for 70 %, then a few dashes
  for (const L of S1_FAR_LAMPS) {
    if (L.x > 900) continue; // behind boat A
    const k = MAP.s1FigureHAt(L.x) / MAP.S1_SHEET.herH;
    const h = L.h || 350 * k;
    const y = S1_PATH.top + 6 + s1Bend(L.x);
    out.push({id: `lamp${L.x}`, thing: lampPoly(L.x, y, h), axis: s1MirrorLine(L.x, y), color: env(S1_IRON), layer: LAYER.lamps, plane: P0, breakup: 0, narrow: 0.2, taper: 1.2, solid: 0.7});
  }
  // ---- the bollards on the coping: dome-capped stubs hanging from the coping's reflection (G6)
  for (const x of S1_BOLLARDS) {
    const k = MAP.s1FigureHAt(x) / MAP.S1_SHEET.herH;
    const y = S1_PATH.edge - S1_PATH.coping * 0.5 + s1Bend(x) - 2;
    out.push({id: `bollard${x}`, thing: bollardPoly(x, y, 22 * k), axis: s1WaterTop(x), color: env(S1_IRON), layer: LAYER.bollards, plane: P0, draw: 'stub'});
  }
  // ---- the coping's own face, mirrored (the far edge down to reflTop): ONE crisp cool band along the far quay (R10,
  // G6), its first 8 px under the far towpath's own waterDeep strip; still (a contact band never sways)
  const top: Pt[] = [];
  const bot: Pt[] = [];
  for (let x = -70; x <= 1150; x += 10) {
    top.push([x, s1WaterTop(x) - 2]);
    // 2 px over the reflections' start: the feet of the row stand 1 px above the coping's top (no seam of light)
    bot.push([x, s1ReflTop(x) + 2]);
  }
  out.push({id: 'coping', refl: [...top, ...bot.reverse()], color: multiply(env(CM.stoneShade), TINT_CANAL.form), layer: LAYER.coping, plane: P0, draw: 'crisp'});
  // ---- the two moored boats (their own waterlines 1140 / 1196): boat B (nearer) after boat A
  out.push(...boatThings(BOAT_A, 'boatA'), ...boatThings(BOAT_B, 'boatB'));
  return out;
}

// ================================================================= the reflections that move

const POP_FILL = MAP.GHOST_POP.outlineS + MAP.GHOST_POP.fillDelayF / 60;
/** A walking figure, simplified (R5): what the water shows of it is its LEGS under the mid-calf hem (V2S1_row_fig:
 *  the hem at 0.25 h), their lower 0.19 h: ONE slim wavering vertical in the legs' value hanging from its own mirror
 *  line, its end rounded (a walking reflection in bars flickered as its slices passed; the coat beyond is left to
 *  Fresnel: a flat coat block read as a box). The row reads as a rhythm of slim verticals under the row; her
 *  reflection is environment, never a second her (R5). */
function figureThing(id: string, x: number, feetY: number, h: number, legs: string): WaterSource {
  const s = h / 170;
  const f = (dx: number, dy: number): Pt => [x + dx * s, feetY + dy * s];
  return {id, thing: [f(-8.5, 0), f(8.5, 0), f(9.3, -32), f(-9.3, -32)], axis: s1MirrorLine(x, feetY), color: legs, kind: 'figure', layer: LAYER.people, plane: S1_PLANE.subject, breakup: 0, narrow: 0, taper: 1.6, solid: 1};
}

/** Every reflection that moves at t: her (behind the glass, then on the towpath), the ghosts from their fill, the bus
 *  on the bridge. */
function s1Moving(t: number): WaterSource[] {
  const out: WaterSource[] = [];
  const poses = MAP.s1RowAt(Math.max(0, t));
  MAP.S1_ROW.forEach((mem, i) => {
    const p = poses[i];
    if (mem.kind === 'her') {
      out.push(figureThing('fig/her', s1HerXAt(t), p.feetY, p.h, herSpec(CM.hero).legs ?? CM.hero));
      return;
    }
    // the bare outlines (O1-O3: no fill) reflect nothing: lines do not survive a rippled mirror (R5)
    if (mem.popT === null || mem.kind === 'outline' || t < mem.popT + POP_FILL) return;
    const age = Number(mem.id.slice(1));
    out.push(figureThing(`fig/${mem.id}`, p.x, p.feetY, p.h, ghostSpec(age).legs ?? CM.coatOat));
  });
  // (the door's glass leaves and their slate stiles are left to the set: in the water the lit door is ONE gold column,
  // one plane simpler than the facade, R5, R7)
  // the double-decker on the bridge (behind the railing, in front of the far roofs; hidden by the wing past x 330)
  const bx = s1BusX(t);
  const L = S1_BUS.len;
  const y1 = BRIDGE.deck - 2;
  const y0 = y1 - S1_BUS.h;
  const xa = Math.max(-70, bx - L / 2);
  const xb = Math.min(330, bx + L / 2);
  if (xb - xa > 2) {
    out.push({id: 'bus', thing: rect(xa, y0, xb, y1), axis: BRIDGE_AXIS, color: hazed(CM.brick, HAZE_K.bus), layer: LAYER.bus, plane: S1_PLANE.bridge, breakup: 0, narrow: 0.05});
    if (xb - xa > 20) out.push({id: 'bus/glass', thing: rect(xa + 8, y0 + S1_BUS.h * 0.56, xb - 8, y0 + S1_BUS.h * 0.8), axis: BRIDGE_AXIS, color: hazed(CM.glass, HAZE_K.bus), layer: LAYER.bus, plane: S1_PLANE.bridge, breakup: 0, narrow: 0.05});
  }
  return out;
}

// ================================================================= the spec

/** The sun's glitter column: straight under SUN0 (x 196), densest at its still-water mirror point (y 1158). */
const SUN_ROWS: [number, number] = [s1ReflTop(MAP.SUN0.x) - 3, s1WaterBottom(MAP.SUN0.x) + 3];

/** S1's WATER (lib/water's WaterSpec). Screen px at the float's rest; scene seconds = film seconds. */
const S1_WATER: WaterSpec = {
  id: 'S1 canal',
  seed: 's1water',
  cam: {horizon: S1W_CAM.horizon, f: S1W_CAM.f, eye: S1W_CAM.eye},
  region: {top: s1WaterTop, bottom: s1WaterBottom, x0: -40, x1: 1120, tuckTop: 4, tuckBottom: 24, step: 10},
  sky: S1_EVENING,
  air: S1_AIR,
  // the water's own colour (the near water's body, R2): CM.water as the clean pen shows it, a step deeper
  body: '#9CC3BC',
  tint: TINT_CANAL.water,
  tier: 'environment',
  ramp: {yFar: 1111, yNear: 1290},
  ladder: {k: [0.4, 0.72], y: [1111, 1290], step: 0.05},
  grid: {dz: 0.45, minPitch: 3, gap: [0.16, 0.26]},
  sources: [],
  moving: s1Moving,
  sun: {x: MAP.SUN0.x, y: MAP.SUN0.y, slope: 0.06, rows: SUN_ROWS, t0: 0.3, slots: 6, life: [0.5, 0.8], len: [20, 34], sigma: 22, plane: S1_PLANE.farRoofs},
  // ripple lines: 6-11 alive, mostly in the near water, clear of the glitter column and Pip's seat (S1_PIP)
  ripples: {
    slots: 11,
    x: [-30, 1110],
    y: [1132, 1292],
    avoid: [
      [140, 1080, 252, 1190],
      [636, 1110, 764, 1300],
    ],
    len: [40, 150],
    thick: [1.5, 3],
    drift: [6, 16],
    life: [2.6, 4.6],
    // a steady field from frame 0, revealed by the flood with the rest of the water's colour (f5-f12): never a pop
    t0: 0,
  },
  float: s1WaterFloat,
  skyPlane: S1_PLANE.sky,
  flood: {origin: FLOOD_ORIGIN, t0: FLOOD.t0, speed: FLOOD.speed, pale: S1_PALE, paper: PAPER},
  joins: [6.1],
};
// the static things need the clean pen's colours: built on first use (module order: the palette first)
let built = false;
const ensure = () => {
  if (!built) {
    S1_WATER.sources = s1Sources();
    built = true;
  }
  return S1_WATER;
};
/** S1's water spec with its sources built (node QA, the lint). */
export const s1WaterSpec = (): WaterSpec => ensure();

/** THE CANAL: drawn in S1's water slot (the water's parallax plane, the environment tier, the flood's Look, RIG_CANAL). */
export const S1Water: React.FC = () => {
  const t = useTime();
  const spec = ensure();
  return <Water spec={spec} t={t} />;
};

// ================================================================= the duck

/** The duck's ring (R11: a duck at rest paddles rings, never a V): one at a time, 2.4 s every 3.4 s, growing ~28 px/s
 *  from 22 px, flattened by the water's foreshortening (ry/rx 0.12), a hairline that thins from 1.3 to 0.45 px (it grows
 *  in from nothing: never a fade), in the far water's light colour. OFF: the contact lens and the mirrored underside
 *  seat the duck, and the ring was one more mover and one more line on a calm water (the judge's "may stay"). */
export const S1_DUCK_RING = {on: false, t0: 0.45, period: 3.4, life: 2.4, r0: 22, grow: 28, w0: 1.3, w1: 0.45} as const;

/** The kit's mallard (V2S1_set_life S1_DUCK: x 396 +- 6 px on its 21 s sway, the kit's bob), its body and head. */
export function s1DuckPose(t: number) {
  const d = S1_DUCK;
  const s = d.size;
  const ph = rand('s1ducks', 0) * 6.28;
  const x = d.x + Math.sin(t * 0.3 + ph) * 6;
  const by = d.y - s * 0.22 + bob(t, s * 0.03, 0.6, ph);
  return {x, by, y: d.y, s, face: 1};
}

/** THE DUCK: the kit's mallard exactly (its body, head and beak through <Fill>: the pen and the flood treat it as before;
 *  its approved sway; no paper V), with its water (G5): a thin dark contact lens at its waterline and its underside
 *  mirrored as three tapered bars, and one slow ring. */
export const S1Duck: React.FC = () => {
  const t = useTime();
  const spec = ensure();
  const {x, by, y, s, face} = s1DuckPose(t);
  const fw = useMemo(() => ({ringCol: waterColourAt(spec, y - 4), k: waterKAt(spec, y + 4)}), [spec, y]);
  const sw = waterSwayAt(spec, y + 6, t);
  const w = floaterWater({x, y, len: s, color: env(CM.line), k: fw.k, tone: spec.tone, sway: sw});
  const rings: React.ReactNode[] = [];
  const R = S1_DUCK_RING;
  if (R.on) {
    const fs = (y - S1W_CAM.horizon) / S1W_CAM.f;
    const u = (t - R.t0) / R.period;
    if (u >= 0) {
      const tau = (u - Math.floor(u)) * R.period;
      if (tau <= R.life) {
        const k = tau / R.life;
        const rx = R.r0 + R.grow * tau;
        const sww = lerp(R.w0, R.w1, k) * Math.min(1, tau / 0.25);
        rings.push(<ellipse key="ring" cx={x} cy={y + 1} rx={rx} ry={rx * fs} fill="none" stroke={fw.ringCol} strokeWidth={sww} />);
      }
    }
  }
  const bodyD = `M${P(x - s * 0.55, by)}Q${P(x - s * 0.5, by + s * 0.32)} ${P(x, by + s * 0.3)}Q${P(x + s * 0.5, by + s * 0.3)} ${P(x + s * 0.55, by - s * 0.02)}Q${P(x + face * s * 0.1, by - s * 0.3)} ${P(x - s * 0.55, by)}Z`;
  const headD = ovalPath(x + face * s * 0.4, by - s * 0.32, s * 0.16, s * 0.15);
  const beakD = `M${P(x + face * s * 0.52, by - s * 0.33)}L${P(x + face * s * 0.72, by - s * 0.29)}L${P(x + face * s * 0.52, by - s * 0.25)}Z`;
  return (
    <>
      <path d={w.refl} fill={w.reflColor} />
      <path d={w.contact} fill={w.contactColor} />
      {rings}
      <Fill d={bodyD + headD} color={CM.line} seed="ducks/s1ducks/1/line" offset={false} />
      <Fill d={beakD} color={CM.coatMustard} seed="ducks/s1ducks/1/mustard" offset={false} />
    </>
  );
};

/** The duck's body as a polygon (QA: the floater sits on its waterline). */
export function s1DuckBody(t: number): {body: Poly; head: Poly} {
  const {x, by, s, face} = s1DuckPose(t);
  const a: Pt = [x - s * 0.55, by];
  const body: Poly = [a, ...quadPts(a, [x - s * 0.5, by + s * 0.32], [x, by + s * 0.3], 6), ...quadPts([x, by + s * 0.3], [x + s * 0.5, by + s * 0.3], [x + s * 0.55, by - s * 0.02], 6), ...quadPts([x + s * 0.55, by - s * 0.02], [x + face * s * 0.1, by - s * 0.3], a, 8).slice(0, -1)];
  return {body, head: ellipsePoly(x + face * s * 0.4, by - s * 0.32, s * 0.16, s * 0.15, 14)};
}
