// WATER STUDY: S1's WATER GEOMETRY as numbers and functions, DERIVED from the S1 sources (never retyped), for the two
// candidate waters (candA.tsx, candB.tsx). Read-only for the designers: import it, or copy what you need into your own
// file. Every number is explained in docs/v2/water/DIAGNOSIS.md §2. Pure TS (no React): it also runs from node QA.
//
// THE CAMERA: S1's lens (map S1_LENS; lib/depth's S1 groundCam): a LEVEL pinhole, horizon y 965, focal 1400 px, the
// vanishing point x 540; the eye 1.3 m over the far towpath and 1.45 m over the water (the far coping's foot, the water
// line, is y 1110-1111 at her line, 14 m away). Reflection in a flat water seen by a level camera: a point at screen
// (x, y) of a thing whose water line (the water surface right under it, at its depth) is y_m shows at (x, 2 y_m - y);
// things at infinity (the sky, the sun) mirror about the horizon (y' = 1930 - y).
import * as MAP from '../world/map';
import {BOAT_A, BOAT_B, S1_BOLLARDS, S1_DUCK, S1_FAR_LAMPS, S1_PATH, s1Bend} from '../scenes/V2S1_set_life';
import {BANK, edgeY} from '../scenes/V2S1_steps_stone';
import {S1_PLANE, s1Float} from '../scenes/V2S1_float';
import {FLOOD, FLOOD_ORIGIN, S1_PALE, floodAt} from '../scenes/V2S1_clock';
import {BRIDGE} from '../scenes/V2S1_set_far';
import {boatGeom} from '../kit/canal/boat';
import {parallaxK} from '../../lib/depth';
import {CM} from '../palette';
import {S1_AIR, S1_EVENING} from '../world/skies';
import {S1_IRON} from '../scenes/V2S1_set_core';

/** S1's lens over the water (see the header). */
export const S1W_CAM = {horizon: MAP.S1_LENS.horizonY, f: MAP.S1_LENS.focalPx, vpx: 540, eyeOverPath: MAP.S1_LENS.eyeHeightM, eyeOverWater: 1.45} as const;
const H0 = S1W_CAM.horizon;
const EW = S1W_CAM.eyeOverWater;
/** The water is this many times farther below the eye than the towpath (1.45 / 1.3). */
const K_WATER = EW / S1W_CAM.eyeOverPath;

// ---------------------------------------------------------------- the water plane

/** Depth (m) of the water's surface at screen y. */
export const waterZ = (y: number): number => (S1W_CAM.f * EW) / Math.max(1e-6, y - H0);
/** Screen y of the water's surface at depth z (m). */
export const waterYAt = (z: number): number => H0 + (S1W_CAM.f * EW) / Math.max(1e-6, z);
/** px per metre ACROSS (screen x) on the water at screen y (100 at the far edge, ~224 at our coping on the right). */
export const waterPxPerM = (y: number): number => (y - H0) / EW;
/** px per metre of DEPTH (screen y) on the water at screen y: the foreshortening. A flat round ripple of the water is
 *  `foreshorten(y)` as tall as it is wide: 0.10 at the far edge, 0.18 at y 1215, 0.23 at y 1290. */
export const waterPxPerMDeep = (y: number): number => ((y - H0) * (y - H0)) / (S1W_CAM.f * EW);
export const foreshorten = (y: number): number => (y - H0) / S1W_CAM.f;
/** The view's depression angle (deg) at screen y: 6.0 at the far edge, 13.1 at y 1290. Fresnel (water n 1.333,
 *  unpolarised) at those angles: the far water reflects ~0.53, y 1200 ~0.37, y 1290 ~0.26 (`fresnel`): reflections
 *  weaken toward us, where the water shows more of its own deep body colour. */
export const depressionDeg = (y: number): number => (Math.atan((y - H0) / S1W_CAM.f) * 180) / Math.PI;
/** Fresnel reflectance of the water (n 1.333, unpolarised) seen at screen y: how much of the mirrored world shows there
 *  (the rest is the water's own body colour). 0.53 at the far edge, 0.45 at y 1150, 0.37 at 1200, 0.30 at 1250. */
export function fresnel(y: number, n = 1.333): number {
  const ti = Math.PI / 2 - Math.atan((y - H0) / S1W_CAM.f);
  const tt = Math.asin(Math.sin(ti) / n);
  const rs = ((Math.cos(ti) - n * Math.cos(tt)) / (Math.cos(ti) + n * Math.cos(tt))) ** 2;
  const rp = ((Math.cos(tt) - n * Math.cos(ti)) / (Math.cos(tt) + n * Math.cos(ti))) ** 2;
  return (rs + rp) / 2;
}

// ---------------------------------------------------------------- the visible region

/** The water's FAR edge as drawn: the far coping's foot (S1FarTowpath: S1_PATH.edge + the bend). y 1111 on the straight
 *  (x >= 470), rising to 1067.9 at x 0 where the towpath bends away. The far towpath draws its own 8 px CM.waterDeep strip
 *  (y waterTop .. +8) and the limestone coping (15 px over it) ABOVE the water slot. */
export const waterTop = (x: number): number => S1_PATH.edge + s1Bend(x);
/** The coping's top (= the far towpath's front line, her feet line): 15 px over the water's far edge. */
export const copingTop = (x: number): number => waterTop(x) - S1_PATH.coping;
/** Where reflections of the far quay BEGIN: under the mirrored coping face (15 px under the far edge, as drawn). Between
 *  waterTop and reflTop the water shows the coping's own face, mirrored. */
export const reflTop = (x: number): number => waterTop(x) + S1_PATH.coping;
/** The water's visible NEAR edge: our coping's top, a line to the steps' vanishing point (V2S1_steps_stone GROUND_VP):
 *  y 1144 at x 0, 1215 at x 540, 1286 at x 1080. Our bank is drawn over the water: run the water >= 16 px under it. */
export const waterBottom = (x: number): number => edgeY(BANK.coping[0], x);
/** The region a candidate must cover (screen px at rest; the float moves the water group <= ~7 px and the planes around
 *  it 1-2 px relative to it): x -40..1120, from 4 px above the far edge (tucked under the coping) to 24 px under our edge. */
export const WATER_REGION = {x0: -40, x1: 1120, tuckTop: 4, tuckBottom: 24} as const;
/** The visible water as one closed polygon (with the tucks), sampled every `step` px. */
export function waterPolygon(step = 10): string {
  const {x0, x1, tuckTop, tuckBottom} = WATER_REGION;
  const top: string[] = [];
  const bot: string[] = [];
  for (let x = x0; x <= x1 + 1e-6; x += step) {
    top.push(`${x.toFixed(1)} ${(waterTop(x) - tuckTop).toFixed(1)}`);
    bot.push(`${x.toFixed(1)} ${(waterBottom(x) + tuckBottom).toFixed(1)}`);
  }
  return `M${top.join('L')}L${bot.reverse().join('L')}Z`;
}

// ---------------------------------------------------------------- reflections

/** The far towpath's FRONT line (her feet line; map S1_TOWPATH_FEET): y 1095 on the straight, 1052 at x 0. */
export const feetLine = (x: number): number => MAP.s1TowpathFeetY(x);
/** The lens's water line under a foot at screen y on the far towpath level (0.15 m over the water). */
const lensLine = (yFoot: number): number => H0 + (yFoot - H0) * K_WATER;
/** THE MIRROR LINE of a thing standing on the far towpath, its base at screen y `yBase` (at screen x): the water surface
 *  right under it. A thing ON THE FRONT LINE (its base at or in front of the feet line: her, the row, the bollards on
 *  the coping) mirrors about the drawn far edge, waterTop(x), and its reflection hangs from reflTop(x) as long as the
 *  thing is tall; a thing SET BACK (the wing's base, the lamps at the path's back) mirrors about the lens's line, shifted
 *  onto the drawn edge (+1 px on the straight, +6 px at x 0, where the bend's coping is drawn 15 px tall for the lens's
 *  ~10), so its foot hides behind the mirrored coping as it should. Her line -> 1111; the wing's base (1077 at x 540) ->
 *  1091 (its lowest ~21 px never show); a lamp base at the path's back (1074) -> 1088. */
export const mirrorLine = (x: number, yBase: number): number =>
  yBase >= feetLine(x) - 0.5 ? waterTop(x) : lensLine(yBase) + (waterTop(x) - lensLine(feetLine(x)));
/** A point's reflection about its mirror line. */
export const mirrorY = (y: number, line: number): number => 2 * line - y;
/** Things at infinity (the sky, the sun, the far roofs to a pixel): mirror about the horizon. The water at screen y
 *  shows the sky of y' = 1930 - y: the far edge (1111) the warm horizon (819), our edge on the right (1290) the light band
 *  (640). */
export const skyMirrorY = (y: number): number => 2 * H0 - y;
/** The SVG transform that mirrors a world group (the sky, a set piece) about the screen line `line`. */
export const mirrorTransform = (line: number): string => `matrix(1 0 0 -1 0 ${(2 * line).toFixed(2)})`;

/** The sun (map SUN0) and where its mirror image would sit in a perfectly still water (behind the bridge's reflection
 *  but for its lowest sliver: the glitter path is where ripples catch it). */
export const SUN = {...MAP.SUN0, mirror: {x: MAP.SUN0.x, y: skyMirrorY(MAP.SUN0.y)}, elevationDeg: (Math.atan((H0 - MAP.SUN0.y) / S1W_CAM.f) * 180) / Math.PI} as const;

/** The far quay's reflectors (screen px at rest; colours on screen in docs/v2/water/DIAGNOSIS.md §2). `line` = its
 *  mirror line; a reflection is visible only below reflTop(x) and above waterBottom(x) (and not behind a boat). */
export const REFLECTORS = {
  /** Google's canal wing: x 330 -> past the right edge, its base slanting 1072 (x 330) -> 1090 (x 1080) (= V2S1_set_wing
   *  wingBase), the ground storey from y 794; the glass double door x 540-720 (y 848 to the base), the lit lobby behind it. */
  wing: {x0: MAP.S1_SHEET.wing.x0, x1: MAP.S1_SHEET.wing.x1, base: (x: number) => 1090.2 - (18 / 750) * (1080 - x), groundStoreyTop: MAP.S1_SHEET.groundStorey.y0, door: MAP.S1_SHEET.door},
  /** The far towpath's bollards on the coping: x, foot y, height. */
  bollards: S1_BOLLARDS.map((x) => ({x, foot: S1_PATH.edge - S1_PATH.coping * 0.5 + s1Bend(x) - 2, h: (22 * MAP.s1FigureHAt(x)) / MAP.S1_SHEET.herH})),
  /** The heritage lamp posts at the path's back (off): x, base y, height. */
  lamps: S1_FAR_LAMPS.map((L) => ({x: L.x, base: S1_PATH.top + 6 + s1Bend(L.x), h: L.h || (350 * MAP.s1FigureHAt(L.x)) / MAP.S1_SHEET.herH})),
  /** The road bridge BEYOND the bend (the far towpath runs in front of its foot): its water line ~y 1050 (the far water
   *  under the arch is drawn at 1042-1056), the deck 958, the railing top 934, the arch crown 984 / spring 1030. */
  bridge: {...BRIDGE, waterLine: 1050},
} as const;

/** Her and the row at scene time t (map s1RowAt): x, feet y, height, visible; mirror each about mirrorLine(x, feetY). */
export const rowAt = (t: number) => MAP.s1RowAt(t).map((p, i) => ({id: MAP.S1_ROW[i].id, x: p.x, feetY: p.feetY, h: p.h, visible: p.visible}));

/** The moored boats (mirror about their own water line): hull top / gunwale / cabin roof y, bow x (the sterns are off
 *  the right edge). */
const boat = (o: typeof BOAT_A) => {
  const g = boatGeom(o);
  return {water: o.water, hullTop: g.gunTop + g.gunH, gunTop: g.gunTop, roofY: g.roofY, bowX: g.X(1), sternX: g.X(0), bowTipY: g.gunTop + g.gunH - o.h * 0.42};
};
export const BOATS = {A: boat(BOAT_A), B: boat(BOAT_B)} as const;
/** The duck (its water line y 1136; the kit sways it +-6 px: x = 396 + 6 sin(0.3 t + phase)). */
export const DUCK = S1_DUCK;

// ---------------------------------------------------------------- motion and the flood

/** The water group's float (px) at t: the near-ground float x the water plane's share (0.725). Home before 1.10 and
 *  from 5.80. A reflection that should ride its THING's plane (the wing and the row 0.6, the bridge 0.35, the boats
 *  0.7375) can counter-shift inside the slot by (thingK - 0.725) x s1Float(t). */
export const WATER_K = parallaxK(S1_PLANE.water);
export const floatOf = (plane: number, t: number): [number, number] => {
  const f = s1Float(t);
  const k = parallaxK(plane) - WATER_K;
  return [f[0] * k, f[1] * k];
};

/** Frame 0 and the flood (V2S1_clock): before the front from SUN0's screen spot reaches a fill's bbox centre, a <Fill>
 *  shows PALE (its colour mixed S1_PALE = 0.7 toward the paper #FBF3E6; a `backdrop` Fill shows plain paper); the front
 *  leaves at FLOOD.t0 0.02 s at 5800 px/s, so the water floods f5 (x ~196) .. f12 (the right end). Raw SVG (a mirrored
 *  <Sky>, a pattern) ignores the Look: clip it to floodRadius(t) round FLOOD_ORIGIN over a pale copy. */
export const FLOOD_AT = floodAt;
export const floodRadius = (t: number): number => Math.max(0, (t - FLOOD.t0) * FLOOD.speed);
export {FLOOD_ORIGIN, S1_PALE};
export const PAPER = '#FBF3E6';
/** sRGB mix of a hex toward the paper by S1_PALE (exactly lib/Fill's pale state). */
export function palePaint(hex: string, k = S1_PALE, paper = PAPER): string {
  const a = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  const b = [1, 3, 5].map((i) => parseInt(paper.slice(i, i + 2), 16));
  return '#' + a.map((v, i) => Math.round(v + (b[i] - v) * k).toString(16).padStart(2, '0')).join('');
}

/** The beats a water must respect (scene s): nothing new may enter, pop or turn in 5.80-6.40 (the push-through into W
 *  at 5.95-6.25; a steady motion keeps its pace); the lobby's gold shows through the open doors 0.45-1.10; her
 *  step-out 0.97; the ghosts pop at 2.00 / 2.53 / 3.20 / 3.80 / 4.20 / 4.79 and the three outlines at 4.98; the stop
 *  4.54-4.98; the bus crosses the bridge from 1.10; the bridge birds lift at 2.45. */
export const BEATS = {join: [5.8, 6.4], dive: MAP.S1_CLOCK.dive, doors: [MAP.S1_CLOCK.doorsStart, MAP.S1_CLOCK.doorsShut], ghostPops: MAP.S1_CLOCK.ghostPops, life: MAP.S1_CLOCK.life, stop: MAP.S1_CLOCK.stop} as const;

// ---------------------------------------------------------------- the spec, in the lanes' vocabulary

/** Everything a water renderer needs about S1, in the shape the lanes' water consts already use (V2S3_water S3_WATER,
 *  V2S7_water S7_WATER), so the winner's lib water can take it as is. Screen px at the float's rest. */
export const S1_WATER = {
  /** The canal: its edges as functions of x (the far edge bends away left of x 470; our edge runs to the steps' VP). */
  canal: {x0: WATER_REGION.x0, x1: WATER_REGION.x1, top: waterTop, bottom: waterBottom, reflTop, plane: S1_PLANE.water},
  /** What bounds it, drawn by others over the slot: the far coping (15 px band; its foot = the far edge) with the far
   *  towpath's own CM.waterDeep strip (8 px under the edge); our coping (its top = the near edge). */
  edges: {farCoping: {h: S1_PATH.coping, strip: 8}, ourCopingY540: BANK.coping[0]},
  /** What stands IN the water (contact lines, wakes, their own reflections about their own water line). */
  standing: [
    {what: 'boat A (sage cabin, slate hull, plum gunwale; behind B)', x0: BOATS.A.bowX, x1: 1120, water: BOATS.A.water, top: BOATS.A.roofY},
    {what: 'boat B (oat cabin, slate hull, plum gunwale; the front one)', x0: BOATS.B.bowX, x1: 1120, water: BOATS.B.water, top: BOATS.B.roofY},
    {what: 'the duck (mallard, CM.line; still, swaying +-6 px)', x0: DUCK.x - 34, x1: DUCK.x + 34, water: DUCK.y, top: DUCK.y - 26},
  ],
  /** What the water mirrors (x ranges, colours as authored; on screen the clean pen calms all but CM.lamp and CM.sun). */
  reflected: [
    {what: 'the sky (S1_EVENING; at infinity: y -> 1930 - y)', x0: -40, x1: 1120, color: CM.sky},
    {what: "the sun (SUN0, mostly behind the bridge's reflection in a still mirror: its glitter path)", x0: MAP.SUN0.x - MAP.SUN0.r, x1: MAP.SUN0.x + MAP.SUN0.r, color: CM.sun},
    {what: 'the road bridge beyond the bend (limestone deck and string course, brick spandrels, the arch, iron rail)', x0: BRIDGE.x0, x1: BRIDGE.x1, color: CM.limestone},
    {what: "Google's wing (brick, limestone fins, ground-storey glass)", x0: MAP.S1_SHEET.wing.x0, x1: 1120, color: CM.brickLight},
    {what: 'the lit lobby through the glass doors (open 0.45-1.10)', x0: MAP.S1_SHEET.door.x0, x1: MAP.S1_SHEET.door.x1, color: CM.lamp},
    {what: 'her (the teal coat, hers only) and the row (oat coats, ghost heads) on the front line', x0: 40, x1: 700, color: CM.hero},
    {what: 'the lamp posts and the bollards (slate iron)', x0: -10, x1: 1060, color: S1_IRON},
  ],
  /** The low sun's glitter path: a column under SUN0 (x 196) over the whole visible water there (the far edge 1085 ->
   *  our edge 1170 at x 196), centred on the sun's still-water mirror (y 1158); half-widths as v5's glints had them. */
  glitter: {x: MAP.SUN0.x, yFar: waterTop(MAP.SUN0.x), yNear: waterBottom(MAP.SUN0.x), wFar: 40, wNear: 80, mirrorY: SUN.mirror.y},
  /** The shot's camera, air and sky. */
  camera: {horizon: S1W_CAM.horizon, vpx: S1W_CAM.vpx, f: S1W_CAM.f, eyeOverWater: S1W_CAM.eyeOverWater},
  air: S1_AIR,
  sky: S1_EVENING,
} as const;
