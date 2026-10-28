// WATER STUDY, candidate A ("TRUE REFLECTION"): S1'S WATER SPEC. Every reflection is DERIVED from S1's own geometry
// (the wing's plane map and bays, the door and the lobby, the bridge and its arch, the far tower and roofs, the lamp
// posts, the bollards, the coping, the two moored boats, her and the row, the bus, the duck): each thing's polygon is
// mirrored about ITS OWN waterline under S1's one level camera (water_study/geometry.ts: things on the front line
// about the far edge, things set back about the lens line, far things about the horizon, the boats and the duck about
// their own waterlines), simplified to masses, verticals and lights (research R5) and coloured from what the clean pen
// shows on screen. The engine (candA_core.ts) slices, sways and tones them. Read-only imports of S1; nothing is edited.
import * as G from './geometry';
import * as MAP from '../world/map';
import {CM} from '../palette';
import {S1_WING_PLANE as PM, S1_WING_V_PLINTH as V_PLINTH, S1_WING_HM as HM, s1WingBaseY, s1DoorOpen} from '../scenes/V2S1_set_wing';
import {BRIDGE, HAZE_K, S1_BUS, s1BusX} from '../scenes/V2S1_set_far';
import {S1_HAZE, S1_IRON} from '../scenes/V2S1_set_core';
import {BOAT_A, BOAT_B, S1_DUCK, S1_FAR_LAMPS, S1_BOLLARDS, S1_PATH, s1Bend} from '../scenes/V2S1_set_life';
import {S1_PLANE} from '../scenes/V2S1_float';
import {HER_COAT_AT, s1HerXAt} from '../scenes/V2S1_clock';
import {boatGeom, BoatOpts} from '../kit/canal/boat';
import {atmos, backing} from '../../lib/depth';
import {tierFill} from '../../lib/pen';
import {multiply, fromLch} from '../../lib/light';
import {bob} from '../../lib/idle';
import {rand} from '../../lib/rng';
import {fromOklch, mixOklab, oklabToHex, oklch, skyColorAt, toOklab, type SkySpec} from '../../lib/sky';
import {S1_EVENING} from '../world/skies';
import {TINT_CANAL} from '../world/rigs';
import {
  clamp01,
  ellipsePoly,
  lerp,
  makeRows,
  quadPts,
  smooth,
  withBox,
  type Gaps,
  type Glitter,
  type Ragged,
  type Poly,
  type Pt,
  type Row,
  type Src,
  type Sway,
  type ToneOpts,
  type WaterCam,
} from './candA_core';

// ================================================================= the camera, the rows, the motion

/** S1's lens over the water (geometry.ts S1W_CAM): horizon 965, focal 1400, the eye 1.45 m over the water. */
export const CAM: WaterCam = {horizon: G.S1W_CAM.horizon, f: G.S1W_CAM.f, eye: G.S1W_CAM.eyeOverWater};
/** The ripple rows: equal real spacing 0.33 m (+-30 %) from the bend's far water (y 1056) past our edge's tuck: 3.4 px
 *  far (y 1111) -> 7.7 px at y 1215 -> 15 px at y 1290 (research R6: ~5x thicker near). Nearness 0 at the far edge
 *  (y 1111), 1 at our edge on the right (y 1290). */
export const ROWS = makeRows(CAM, {yTop: 1054, yBot: 1336, dz: 0.33, jitter: 0.3, seed: 41, nearFrom: 1111, nearTo: 1290});
/** The sway (R6, R12): +-1.6 px far -> +-5.5 px near; two waves travelling toward us (2.2 m / 5.0 s and 1.4 m / 3.6 s:
 *  0.44 and 0.39 m/s, i.e. ~4.5 px/s along the far quay, ~13 px/s at y 1215, ~22 px/s at our edge on screen); a
 *  slice's peak sideways speed ~2 px/s far, ~7 px/s near. Neighbouring rows differ by 54 deg of the long wave: a gentle
 *  zigzag that ripples toward us, never a sawtooth. */
export const SWAY: Sway = {
  ampFar: 1.6,
  ampNear: 5.5,
  waves: [
    {lambda: 2.2, period: 5.0, w: 0.7},
    {lambda: 1.4, period: 3.6, w: 0.3},
  ],
  jitter: 0.12,
  seed: 4101,
};
/** The ragged edges: every mirrored piece's ends recede 1.5 px (far) -> 3.5 px (near) in a square, irregular zigzag
 *  on top of the sway; from nearness 0.45 (y ~1192) on up to 18 px more at our edge, rounded (the near end breaking into
 *  fragments); each end breathes on its own 3-6 s cycle; a narrow thing loses at most a fifth of its width per side. */
export const RAGGED: Ragged = {small: [1.5, 3.5], big: 18, from: 0.45, round: 4.5, period: [3, 6], seed: 4105};
/** The ripple gaps (R6, R9, R2 by coverage): ~1.1 thin light cut lines per 1000 px per far row (0.22 of the row tall,
 *  50-230 px long), up to 7 row-tall gaps per 1000 px near (60-240 px): the reflection intact along the far quay,
 *  breaking into fragments toward us, where the water's own teal shows. Each lens lives 3.2-6.8 s (grows along its
 *  length, shrinks out, comes back elsewhere). */
export const GAPS: Gaps = {
  slots: [0.8, 5.0],
  len: [
    [40, 200],
    [50, 190],
  ],
  thick: [0.22, 1.0],
  minH: 0.9,
  period: [3.4, 7.0],
  pillFrom: 0.55,
  seed: 4102,
};
/** The sun's glitter column (R8): straight under SUN0 (x 196), densest at its still-water mirror point (y 1158),
 *  half-width from 3.4 deg slopes: ~20 px at the far edge, ~24 near (a narrow column, ~3.5x taller than wide here,
 *  where the bridge's reflection fills the water); a still gold bed of level lenses (CandWater) and 6 sliver slots,
 *  each sliver living 0.42-0.9 s (it grows in and out along its length, never a fade): ~4 alive, at most 6, 18 -> 34 px
 *  long at 8.5:1, warm white L* 97 (CRAFT §f.6: glints 20-36 px, 4-6 at once, L* +15..+25; S1 keeps <= 16 particles
 *  alive with the motes and the leaves). Born from 0.30 s (after the frame-0 flood). */
export const GLITTER: Glitter = {
  x: MAP.SUN0.x,
  mirrorY: G.SUN.mirror.y,
  sigma: 22,
  slope: 0.06,
  elev: (G.SUN.elevationDeg * Math.PI) / 180,
  slots: 6,
  life: [0.42, 0.9],
  len: [18, 34],
  aspect: 8.5,
  t0: 0.3,
  seed: 4103,
};

// ================================================================= colour

/** The water's own colour (the near water's body, R2): CM.water as the clean pen shows it, a step deeper. */
export const BODY = '#9CC3BC';
/** The reflections' toning (R3-R4): L* toward 76 by k; the water's hue family at that value: h 182 at L* 76, 0.9 deg
 *  bluer per L* deeper (L* 62: h 195, C* 14.5; the deep water), greener and paler when lighter (L* 84: h 175, C* 7.4). */
export const TONE: ToneOpts = {waterL: 76, waterH: 182, waterC: 10, hueSlope: 0.9, chromaSlope: 0.32, cMin: 6.5, cMax: 16};
/** The Fresnel ladder: k 0.40 along the far quay (R 0.53) -> 0.70 at our edge (R 0.26), in 7 flat steps of 0.05, one per
 *  row: a reflection keeps about half its strength toward us. */
export const kOf = (row: Row) => Math.round(lerp(0.4, 0.72, row.n) * 20) / 20;
/** The glitter's still gold bed (the sun's reflected light, R8) and its warm-white slivers (L* ~97, never #FFFFFF). */
export const BED = fromLch(85.5, 30, 72);
export const SLIVER = fromLch(97, 8, 82);
export const PAPER = G.PAPER;

/** The open water's colour at screen y (the base ramp's keys): S1_EVENING mirrored about the horizon (water y shows the
 *  sky of 1930 - y: the warm horizon far, the pale light band, the mint), its value toned a little darker toward us
 *  (R3), and from the mid water on pulled toward the water's own teal body (R2: the near water shows its body) in
 *  OKLab, where the sky is already light: the crossing stays light (L* >= 84), never khaki or grey (R4). */
function rampAt(y: number): string {
  const s = oklch(skyColorAt(S1_EVENING, 2 * CAM.horizon - y));
  const n = (y - 1111) / (1290 - 1111);
  const sky = toOklab({l: s.l - 0.02 - 0.015 * clamp01(n), c: s.c * (0.95 - 0.1 * clamp01(n)), h: s.h});
  // the body's light veil: the water's own teal at the light band's value, then the body itself (R2)
  const veil = toOklab({l: oklch(BODY).l + 0.085, c: 0.018, h: oklch(BODY).h});
  const body = toOklab(BODY);
  const a = smooth(0.1, 0.4, n);
  const b = smooth(0.32, 0.86, n);
  return oklabToHex(mixOklab(mixOklab(sky, veil, a), body, b * 0.92));
}
/** THE ONE ALLOWED GRADIENT (the brief): the shot's own sky seen in the water, as a lib/sky spec over the water's box
 *  (keys every 16 px; the eased OKLab curve; lib/sky's blue-noise dither). The far water mirrors the warm horizon
 *  (L* 86.5), crosses to the water's own pale veil at L* ~86 by y ~1165 (light, never beige, khaki or grey) and settles
 *  on the teal body (L* 76) from y ~1250: the near water shows its body (R2). No mirrored sun warmth: its ellipse sat
 *  right on the crossing and turned it khaki (skyCheck C* 7.6); the glitter column carries the sun. */
export function waterRamp(): SkySpec {
  const keys: {y: number; color: string}[] = [];
  for (let y = 1046; y <= 1338; y += 16) keys.push({y, color: rampAt(y)});
  return {keys, band: null, x: -60, width: 1200, top: 1040, bottom: 1340, sun: null};
}

// on-screen colours (what the clean pen shows: the environment tier's calm pull, the far planes' haze, the ground
// storey's shade); computed at render time, once
const env = (c: string) => tierFill(c, 'environment');
const shaded = (c: string) => multiply(env(c), TINT_CANAL.form);
const hazed = (c: string, k: number) => env(atmos(c, k, S1_HAZE));

// ================================================================= mirrors (geometry.ts, DIAGNOSIS §2.1-2.4)

const H0 = CAM.horizon;
/** A point of the wing (set back 1.5 m behind the coping): about the lens line under its base (its foot hides). */
const wingM = (x: number, y: number): Pt => [x, 2 * G.mirrorLine(x, s1WingBaseY(x)) - y];
const wq = (u: number, v: number, w: number, h: number): Poly => PM.q(u, v, w, h).map(([x, y]) => wingM(x, y));
/** The road bridge beyond the bend: about the far water under its arch (y 1050). */
const BRIDGE_LINE = G.REFLECTORS.bridge.waterLine;
const bm = (x: number, y: number): Pt => [x, 2 * BRIDGE_LINE - y];
/** Far things (the far tower, the far roofs, the sky): about the horizon. */
const im = (x: number, y: number): Pt => [x, 2 * H0 - y];

const A = BRIDGE.arch;
function archY(x: number, grow = 0): number {
  const half = A.half + grow;
  const rise = A.spring - A.crown + grow;
  const R = (half * half + rise * rise) / (2 * rise);
  const yc = A.spring - rise + R;
  return yc - Math.sqrt(Math.max(0, R * R - (x - A.cx) * (x - A.cx)));
}
const archPoly = (grow: number, bottom: number): Pt[] => {
  const half = A.half + grow;
  const pts: Pt[] = [[A.cx - half, bottom]];
  for (let k = 0; k <= 32; k++) {
    const x = A.cx - half + (2 * half * k) / 32;
    pts.push([x, archY(x, grow)]);
  }
  pts.push([A.cx + half, bottom]);
  return pts;
};

// ================================================================= the static reflections

/** Layers (higher = nearer, drawn later). Far things first, then the wing, the people, the bollards, the coping's own
 *  face, the boats, the duck. */
export const LAYER = {roofs: 0, bridge: 1, ring: 2, opening: 3, bus: 4, posts: 5, wall: 10, wing: 11, lobby: 12, lamps: 13, people: 20, leaves: 21, bollards: 30, coping: 31, boats: 40, boatsFront: 41, duck: 42} as const;

/** The wing's facade in local metres (V2S1_set_wing's layout, read-only): the door. */
const DU0 = PM.uAt(MAP.S1_SHEET.door.x0, HM * 0.6);
const DU1 = PM.uAt(MAP.S1_SHEET.door.x1, HM * 0.6);
const DV0 = PM.vAt(MAP.S1_SHEET.door.y0, (DU0 + DU1) / 2);
/** The visible reflection of the wing reaches ~1.8 m up its ground storey (the water is ~100-160 px deep under it). */
const V_LO = HM - 2.1;

function boatSrcs(o: BoatOpts, cabin: string): Src[] {
  const g = boatGeom(o);
  const {X} = g;
  const bowLift = o.h * 0.42;
  const hullTop = g.gunTop + g.gunH;
  const m = (p: Pt): Pt => [p[0], 2 * o.water - p[1]];
  // hull + gunwale as ONE dark mass (research R5: one value per object, the plum stripe too thin to survive), the cabin
  // the second value; portholes and the roof's thin edge dropped
  const hull: Pt[] = [[X(0), o.water + 4], [X(0), g.gunTop], [X(0.86), g.gunTop], ...quadPts([X(0.86), g.gunTop], [X(0.95), g.gunTop - bowLift * 0.3], [X(1) + o.dir * 3, g.gunTop - bowLift], 8), [X(1), hullTop - bowLift + g.gunH * 0.4], [X(0.985), o.water + 4]];
  const cab: Pt[] = [[X(g.c0), g.roofY], [X(g.c1), g.roofY], [X(g.c1), g.gunTop + 0.5], [X(g.c0), g.gunTop + 0.5]];
  const cratch: Pt[] = [[X(g.c1), g.roofY + (g.gunTop - g.roofY) * 0.25], [X(0.94), g.gunTop - bowLift * 0.2], [X(g.c1), g.gunTop]];
  const dark = env(CM.paneUnlit);
  return [
    {p: hull.map(m), col: dark, layer: LAYER.boats, plane: S1_PLANE.boats},
    {p: cab.map(m), col: env(cabin), layer: LAYER.boats, plane: S1_PLANE.boats},
    {p: cratch.map(m), col: dark, layer: LAYER.boatsFront, plane: S1_PLANE.boats},
  ];
}

/** A heritage lamp post's plinth and column (V2S1_set_life lampInto: the lantern sits far below our edge in the
 *  water), as one polygon in screen px. */
function lampPoly(x: number, y: number, h: number): Pt[] {
  const cw = Math.max(2.2, h * 0.034);
  return [[x - 1.6 * cw, y], [x - 1.2 * cw, y - 0.08 * h], [x - 0.7 * cw, y - 0.08 * h], [x - 0.45 * cw, y - 0.8 * h], [x + 0.45 * cw, y - 0.8 * h], [x + 0.7 * cw, y - 0.08 * h], [x + 1.2 * cw, y - 0.08 * h], [x + 1.6 * cw, y]];
}
/** A mooring bollard (V2S1_set_life s1BollardInto: body and dome) as one polygon. */
function bollardPoly(x: number, y: number, h: number): Pt[] {
  const w = h * 0.9;
  return [[x - 0.42 * w, y], [x - 0.3 * w, y - 0.55 * h], [x - 0.44 * w, y - 0.77 * h], [x - 0.33 * w, y - 0.93 * h], [x, y - 1.02 * h], [x + 0.33 * w, y - 0.93 * h], [x + 0.44 * w, y - 0.77 * h], [x + 0.3 * w, y - 0.55 * h], [x + 0.42 * w, y]];
}

/** The far tower's field as the set draws it (V2S1_set_far CalmTower: backing() against the wing's lit corner). */
const towerField = () => env(backing(tierFill(CM.limestone, 'environment'), atmos('#8F93AE', HAZE_K.near, S1_HAZE), {tier: 'environment', min: 15}));

/** Every static reflection of S1, built once at render time (the clean pen's colours are known then). */
export function staticSources(): Src[] {
  const out: Src[] = [];
  const add = (s: Src) => out.push(withBox({...s, id: out.length + 1}));
  const P0 = S1_PLANE.subject;

  // ---- the far roofs (+4) through and under the bridge's railing: one hazy band under the deck, its lower edge the
  // roofline turned upside down (about the horizon); below it the mirrored sky (the base ramp) shows
  const sky: [number, number][] = [[-70, 772], [40, 770], [46, 798], [56, 782], [108, 782], [118, 798], [118, 754], [210, 754], [222, 751], [286, 751], [300, 752], [372, 752]];
  add({p: [[-70, 1137] as Pt, [372, 1137] as Pt, ...sky.slice().reverse().map(([x, y]) => im(x, y))].map((q) => q as Pt), col: hazed(CM.stucco, 0.7), layer: LAYER.roofs, plane: S1_PLANE.farRoofs});
  // ---- the far tower (+3) in front of the roofs, behind the bridge: its calm field, about the horizon
  add({p: [im(258, 944), im(346, 944), im(346, 598), im(258, 598)], col: towerField(), layer: LAYER.bridge, plane: S1_PLANE.farTower});
  // ---- the road bridge (+2), about the far water under its arch: the brick spandrels and the limestone deck, the
  // pilaster, the voussoir ring and, inside it, the arch's shaded soffit seen from below (the arch and its reflection
  // close into one shape across the far towpath)
  const {x0, x1, deck, course, base} = BRIDGE;
  add({p: [bm(x0, course), bm(x1, course), bm(x1, base + 2), bm(x0, base + 2)], col: hazed(CM.brick, HAZE_K.bridge), layer: LAYER.bridge, plane: S1_PLANE.bridge});
  add({p: [bm(x0, deck), bm(x1, deck), bm(x1, course), bm(x0, course)], col: hazed(CM.limestone, HAZE_K.bridge), layer: LAYER.bridge, plane: S1_PLANE.bridge});
  add({p: [bm(268, course), bm(284, course), bm(284, base + 2), bm(268, base + 2)], col: hazed(CM.limestone, HAZE_K.bridge), layer: LAYER.ring, plane: S1_PLANE.bridge});
  add({p: archPoly(11, base + 2).map(([x, y]) => bm(x, y)), col: hazed(CM.limestone, HAZE_K.bridge), layer: LAYER.ring, plane: S1_PLANE.bridge});
  add({p: archPoly(0, base + 2).map(([x, y]) => bm(x, y)), col: hazed(CM.stoneShade, HAZE_K.bridge), layer: LAYER.opening, plane: S1_PLANE.bridge});
  // the railing's posts (4.4 px verticals survive; the 1.6 px bars and the rails do not: R5)
  for (let x = x0 + 30; x < x1; x += 62) add({p: [bm(x - 2.2, BRIDGE.railTop - 5), bm(x + 2.2, BRIDGE.railTop - 5), bm(x + 2.2, deck + 1), bm(x - 2.2, deck + 1)], col: hazed(S1_IRON, HAZE_K.rail), layer: LAYER.posts, plane: S1_PLANE.bridge});

  // ---- Google's wing (the subject's plane), set back: its ground storey (in the shade of the far city: V2S1_light's
  // ground Shade) from the plinth up ~2 m, about the lens line under its base (its lowest ~21 px hide behind the
  // coping's reflection)
  add({p: wq(-0.05, V_LO, PM.wM + 0.4, HM - V_LO), col: shaded(CM.brickLight), layer: LAYER.wall, plane: P0});
  // the west end wall (lit stone) and the corner pier
  const [xs] = PM.p(0, HM);
  add({p: [wingM(xs - 16, s1WingBaseY(xs) - 3), wingM(xs + 0.5 * PM.pxPerM(0.25), s1WingBaseY(xs)), wingM(xs + 0.5 * PM.pxPerM(0.25), PM.p(0, V_LO)[1]), wingM(xs - 16, PM.p(0, V_LO)[1])], col: shaded(CM.limestone), layer: LAYER.wing, plane: P0});
  // the corner slit bay (unlit: the room's slate band low; one value: R5)
  add({p: wq(0.74, V_LO, 0.56, V_PLINTH - V_LO), col: shaded(S1_IRON), layer: LAYER.wing, plane: P0});
  // the door bay (kept lit): the lit lobby's gold, THE light in the water (R7); its stone jambs, the floor, the counter
  // and the plant are dropped (small parts and thin lines do not survive a rippled mirror: R5), and the fins, the plinth
  // merge into the wall (one value per mass): the reflection is one plane simpler than the facade
  add({p: wq(DU0, Math.max(DV0, V_LO), DU1 - DU0, HM - Math.max(DV0, V_LO)), col: CM.lamp, layer: LAYER.wing, plane: P0, kind: 'light'});

  // ---- the lamp posts at the path's back (off, slate iron): long thin streaks from the coping to our edge
  for (const L of S1_FAR_LAMPS) {
    const k = MAP.s1FigureHAt(L.x) / MAP.S1_SHEET.herH;
    const h = L.h || 350 * k;
    const y = S1_PATH.top + 6 + s1Bend(L.x);
    if (L.x > 900) continue; // behind boat A
    const m = G.mirrorLine(L.x, y);
    add({p: lampPoly(L.x, y, h).map(([x, yy]) => [x, 2 * m - yy] as Pt), col: env(S1_IRON), layer: LAYER.lamps, plane: P0});
  }
  // ---- the bollards on the coping (the front line): stubs hanging from the coping's reflection
  for (const x of S1_BOLLARDS) {
    const k = MAP.s1FigureHAt(x) / MAP.S1_SHEET.herH;
    const y = S1_PATH.edge - S1_PATH.coping * 0.5 + s1Bend(x) - 2;
    const m = G.waterTop(x);
    add({p: bollardPoly(x, y, 22 * k).map(([px, py]) => [px, 2 * m - py] as Pt), col: env(S1_IRON), layer: LAYER.bollards, plane: P0});
  }
  // ---- the coping's own face, mirrored (the far edge down to reflTop): the darkest calm band along the far quay (R10),
  // its first 8 px under the far towpath's own waterDeep strip
  const top: Pt[] = [];
  const bot: Pt[] = [];
  for (let x = -70; x <= 1150; x += 20) {
    top.push([x, G.waterTop(x) - 2]);
    bot.push([x, G.reflTop(x)]);
  }
  add({p: [...top, ...bot.reverse()], col: multiply(env(CM.stoneShade), TINT_CANAL.form), layer: LAYER.coping, plane: P0, crisp: true});

  // ---- the two moored boats (their own waterlines 1140 / 1196)
  for (const s of boatSrcs(BOAT_A, CM.sage)) add(s);
  for (const s of boatSrcs(BOAT_B, CM.coatOat)) add(s);
  return out;
}

// ================================================================= the reflections that move

const POP_FILL = MAP.GHOST_POP.outlineS + MAP.GHOST_POP.fillDelayF / 60;
/** A walking figure's reflection, simplified (R5): the legs under the mid-calf hem as one column, the coat as one
 *  trapezoid; hung from its own mirror line, upside down. */
function figureSrcs(id: number, x: number, feetY: number, h: number, coat: string): Src[] {
  const s = h / 170;
  const m = G.mirrorLine(x, feetY);
  const f = (dx: number, dy: number): Pt => [x + dx * s, 2 * m - (feetY + dy * s)];
  // legs under the hem, the flared hem, the coat up to the shoulders: ONE silhouette in the coat's value (R5)
  const sil = [f(-9, 0), f(9, 0), f(9, -40), f(22, -42), f(19.5, -104), f(18.5, -128), f(-18.5, -128), f(-19.5, -104), f(-22, -42), f(-9, -40)];
  return [withBox({p: sil, col: coat, layer: LAYER.people, plane: S1_PLANE.subject, kind: 'figure', id})];
}
/** The duck (V2S1_set_life S1_DUCK, the kit's mallard: x 396 +- 6 px on a 21 s sway, a +-1.9 px bob), as the kit
 *  draws it: its body and head. */
export function duckPose(t: number) {
  const d = S1_DUCK;
  const s = d.size;
  const ph = rand('s1ducks', 0) * 6.28;
  const x = d.x + Math.sin(t * 0.3 + ph) * 6;
  const by = d.y - s * 0.22 + bob(t, s * 0.03, 0.6, ph);
  return {x, by, y: d.y, s, face: 1};
}
export function duckBody(t: number): {body: Pt[]; head: Pt[]} {
  const {x, by, s, face} = duckPose(t);
  const a: Pt = [x - s * 0.55, by];
  const body: Pt[] = [a, ...quadPts(a, [x - s * 0.5, by + s * 0.32], [x, by + s * 0.3], 6), ...quadPts([x, by + s * 0.3], [x + s * 0.5, by + s * 0.3], [x + s * 0.55, by - s * 0.02], 6), ...quadPts([x + s * 0.55, by - s * 0.02], [x + face * s * 0.1, by - s * 0.3], a, 8).slice(0, -1)];
  const head = ellipsePoly(x + face * s * 0.4, by - s * 0.32, s * 0.16, s * 0.15, 14);
  return {body, head};
}

/** Every reflection that moves at time t: her (behind the glass, then on the towpath), the ghosts from their fill,
 *  the door's sliding leaves, the bus on the bridge, the duck. */
export function dynamicSources(t: number): Src[] {
  const out: Src[] = [];
  // her and the row (O1-O3 are drawn as G6 copies from their pops)
  const poses = MAP.s1RowAt(Math.max(0, t));
  MAP.S1_ROW.forEach((mem, i) => {
    const p = poses[i];
    if (mem.kind === 'her') {
      const x = s1HerXAt(t);
      out.push(...figureSrcs(1000, x, p.feetY, p.h, t < HER_COAT_AT ? CM.white : CM.hero));
      return;
    }
    if (mem.popT === null || t < mem.popT + POP_FILL) return;
    const age = mem.kind === 'ghost' ? Number(mem.id.slice(1)) : 6;
    out.push(...figureSrcs(1000 + i, p.x, p.feetY, p.h, CM.coatOat));
  });
  // the door's two glass leaves (slate stiles, 0.085 m: verticals that survive), sliding with s1DoorOpen, clipped to
  // the opening (they park in pockets)
  const open = s1DoorOpen(t);
  const leafW = (DU1 - DU0) / 2;
  const st = 0.085;
  for (const side of [0, 1]) {
    const a = DU0 + side * leafW + open * leafW * (side ? 1 : -1);
    for (const [j, u0] of [a, a + leafW - st].entries()) {
      const lo = Math.max(DU0, u0);
      const hi = Math.min(DU1, u0 + st);
      if (hi - lo < 0.01) continue;
      out.push(withBox({p: wq(lo, DV0 + 0.07, hi - lo, HM - 0.05 - DV0 - 0.07), col: env(CM.paneUnlit), layer: LAYER.leaves, plane: S1_PLANE.subject, id: 2000 + side * 2 + j}));
    }
  }
  // the double-decker on the bridge (behind the railing, in front of the far roofs; hidden by the wing past x 330)
  const bx = s1BusX(t);
  const L = S1_BUS.len;
  const y1 = BRIDGE.deck - 2;
  const y0 = y1 - S1_BUS.h;
  const xa = Math.max(-70, bx - L / 2);
  const xb = Math.min(330, bx + L / 2);
  if (xb - xa > 2) {
    out.push(withBox({p: [bm(xa, y0), bm(xb, y0), bm(xb, y1), bm(xa, y1)], col: hazed(CM.brick, HAZE_K.bus), layer: LAYER.bus, plane: S1_PLANE.bridge, id: 3000}));
    const g0 = y0 + S1_BUS.h * 0.56;
    const g1 = y0 + S1_BUS.h * 0.8;
    out.push(withBox({p: [bm(xa + 8, g0), bm(xb - 8, g0), bm(xb - 8, g1), bm(xa + 8, g1)], col: hazed(CM.glass, HAZE_K.bus), layer: LAYER.bus, plane: S1_PLANE.bridge, id: 3001}));
  }
  // the duck, about its own waterline
  const dk = duckBody(t);
  const dy = S1_DUCK.y;
  out.push(withBox({p: dk.body.map(([x, y]) => [x, 2 * dy - y] as Pt), col: env(CM.line), layer: LAYER.duck, plane: S1_PLANE.boats, id: 4000}));
  out.push(withBox({p: dk.head.map(([x, y]) => [x, 2 * dy - y] as Pt), col: env(CM.line), layer: LAYER.duck, plane: S1_PLANE.boats, id: 4001}));
  return out;
}

// ================================================================= where the gaps may fall

/** A row's x-extent for the ripple gaps: the whole width below the far quay; at the bend only where the row lies
 *  under the coping's reflection (never across the coping's own dark face: R10). */
export function gapRange(row: Row): [number, number] | null {
  const y = row.yc;
  if (y >= G.reflTop(1200) + 3) return [-40, 1120];
  // reflTop rises toward the left (the bend): find the rightmost x whose reflTop + 3 is still above this row
  let lo = -40;
  let hi = 1120;
  if (G.reflTop(lo) + 3 >= y) return null;
  for (let i = 0; i < 30; i++) {
    const m = (lo + hi) / 2;
    if (G.reflTop(m) + 3 < y) lo = m;
    else hi = m;
  }
  return lo - -40 > 20 ? [-40, lo] : null;
}
/** The glitter's rows: from under the coping's reflection at the sun's x down to our edge. */
export const GLITTER_Y: [number, number] = [G.reflTop(MAP.SUN0.x) + 4, G.waterBottom(MAP.SUN0.x) + 2];

/** The base ramp colour at (x, y) as <Sky> draws it (the lenses take it: seamless with the open water). */
export const rampColorAt = (spec: SkySpec, y: number, x?: number) => skyColorAt(spec, y, x);
