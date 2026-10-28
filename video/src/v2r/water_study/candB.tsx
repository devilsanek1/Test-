// WATER STUDY, candidate B: "DESIGNED EDITORIAL" (the owner on v5's water, 2026-10-28: "it's just looking way too
// cheap, not clean or premium quality or refined. Just lazy and cheap. I mean that about the water"). S1's canal drawn
// like a refined editorial / poster print: fewer, better shapes, every one designed and every one the water's answer to
// something that stands over it. The engine (film-agnostic, pure TS) is candB_lib.ts; this file is S1's SPEC (its
// camera, sky, sources, lights, sun, ripples, wake) and the two components the study seam takes. The design, its numbers
// and the shared-component sketch: docs/v2/water/cand_B.md.
//
// LAYERS, bottom to top (all raw SVG with computed colours: the clean pen's tier pull never re-tints them; inside S1's
// water plane group, so the float carries them, each reflection counter-shifted onto its THING's plane):
//   1 the RAMP       S1_EVENING mirrored, compressed and toned toward the body (lib/sky <Sky>: its eased OKLab curve
//                    and blue-noise dither; the brief's one allowed gradient): warm under the far bank, a pale cream
//                    crossing, the canal's teal body toward us (the frame's one cool field)
//   2 REFLECTIONS    one simplified shape per mass, mirrored about its own waterline: the bridge (rose spandrels, its
//                    arch's bowl, the pilaster, the deck), Google's wing (brick, the light corner pier, the glass slit),
//                    the lamp posts and bollards, her and the row, the boats' hulls and cabins: solid at the base, then
//                    level slices on the shared perspective grid, breaking and thinning toward us
//   3 LIGHT COLUMNS  the lit lobby's gold under the glass doors: a warm column of slices as wide as the door
//   4 THE QUAY BAND  the far coping's face mirrored: one cool band under the far towpath's dark waterline strip
//   5 RIPPLES        a few long tapered lines in two tones on the perspective rows, drifting with the westerly
//   6 THE GLITTER    one narrow column under the low sun of nested slivers (gold lens, warm-white core) over a bed of
//                    short gold slices: the sun's path, never four-point stars
// The duck (CandDuck): the kit's mallard as it was, now gliding east at 7 px/s, its reflection under it and a clean,
// very flat Kelvin V behind it (2.5 deg per arm at its row), tapered, its tails breaking into dashes.
// Motion (R12): the masses, the ramp and the quay band hold; only the slices sway (+-1.3 px far -> +-4.2 px near, two
// sines of 4.6 s and 2.9 s whose phase travels toward us at ~0.3 m/s: ~3 px/s far, ~13 px/s near); ripple lines drift
// east 6-16 px/s and live 2.6-4.6 s; slivers live 0.3-0.7 s; the duck 7 px/s. Frame 0: the water lands PALE (mixed
// S1_PALE toward the paper, the masses only) and floods in with the front from SUN0 (f5-f12). Deterministic: lib/rng
// seeds and pure functions of t.
import React, {useId, useMemo} from 'react';
import {Sky, type SkySpec} from '../../lib/sky';
import {bob} from '../../lib/idle';
import {CM} from '../palette';
import * as MAP from '../world/map';
import {S1_EVENING} from '../world/skies';
import {S1_PLANE} from '../scenes/V2S1_float';
import {Batch, P, Paint, ovalPath, rand, rng} from '../kit/canal/core';
import {tiered} from '../kit/tiers';
import {BOATS, DUCK, FLOOD_ORIGIN, PAPER, REFLECTORS, S1_PALE, S1W_CAM, SUN, floatOf, floodRadius, reflTop, rowAt, waterBottom, waterPolygon, waterTop} from './geometry';
import {
  barPath,
  buildMass,
  cie,
  depthAt,
  fromOk,
  glitterAt,
  lensPath,
  okLch,
  paleOf,
  pxPerMDeep,
  rampColour,
  rampKeys,
  reflectTone,
  ripplesAt,
  sliceGrid,
  swayAt,
  waterStep,
  pushRun,
  type Glitter,
  type Mass,
  type RampSpec,
  type Ripples,
  type Runs,
  type Sway,
  type WaterCam,
} from './candB_lib';

// ================================================================= S1's camera, ramp and grid

const CAM: WaterCam = {hz: S1W_CAM.horizon, f: S1W_CAM.f, eye: S1W_CAM.eyeOverWater};
const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const sstep = (a: number, b: number, v: number) => {
  const u = clamp01((v - a) / (b - a));
  return u * u * (3 - 2 * u);
};

/** THE WATER'S BODY (what shows where it mirrors little: the near rows): the canal's teal, CM.water at y 1180, a step
 *  lighter under the far bank and a step deeper at our feet (Fresnel: the near water shows its own colour). */
const BODY: [number, string][] = [
  [1120, '#B4D6CD'],
  [1180, CM.water],
  [1300, '#8CBAB3'],
];

/** THE RAMP (the brief's one allowed gradient: the shot's own sky seen in the water). S1_EVENING mirrored about the
 *  horizon and COMPRESSED 3.5x about y 1080 (declared art cheat, "teal-forward": the sky's whole lower ramp, horizon ->
 *  light band -> caption mint, lands in the far third of the strip, so the near two thirds show the body), toned toward
 *  the body by an art-directed Fresnel (0.9 of the sky at the far bank -> 0.2 at our feet; R2's 0.63 -> 0.26 pushed
 *  wider so the far band reads as the sky and the near water as the canal). Away from the sun (x 700): the sun's own
 *  warmth in the water is the glitter's bed. */
const RAMP: RampSpec = {
  sky: S1_EVENING,
  hz: CAM.hz,
  anchor: 1080,
  compress: 3.5,
  x: 700,
  body: BODY,
  mirror: (y) => 0.9 + (0.2 - 0.9) * sstep(1070, 1250, y),
  at: [1060, 1080, 1095, 1105, 1115, 1125, 1135, 1145, 1155, 1165, 1180, 1200, 1230, 1260, 1300],
};
const RAMP_SKY: SkySpec = {keys: rampKeys(RAMP), band: null, sun: null, x: -60, width: 1200, top: 1050, bottom: 1330};
const RAMP_PALE: SkySpec = {...RAMP_SKY, keys: RAMP_SKY.keys.map((k) => ({y: k.y, color: paleOf(k.color as string, S1_PALE, PAPER)})), dither: false};
/** The water's own colour at a row (what a slice gap shows; a ripple line's base). */
const waterAt = (y: number) => rampColour(RAMP, y);

/** THE SLICE GRID (R6): rows at 0.32 m of water, projected: 3.4 px at the far edge, 8.7 at y 1200, 16.6 at our feet;
 *  every row's gap (its trough, the ramp showing through) 16 % of its pitch far -> 34 % near. */
const ROWS = (() => {
  const out: number[] = [];
  let y = 1056;
  while (y < 1330) {
    out.push(y);
    y += Math.max(2.6, pxPerMDeep(CAM, y) * 0.32);
  }
  return out;
})();
const GRID = sliceGrid(ROWS, [0.16, 0.34], 1100, 1290);

/** THE SWAY (R6, R12): +-1.3 px at the far bank -> +-4.2 px at our feet; 4.6 s and 2.9 s, wavelengths 1.5 m and 0.8 m,
 *  the phase travelling toward us (~0.3 m/s). */
const SWAY: Sway = {amp: [1.3, 4.2], yFar: 1090, yNear: 1290, T: [4.6, 2.9], lambda: [1.5, 0.8], seed: 's1b'};

// ================================================================= colours (R3-R4: toned in OKLCH, never mixed in RGB)

/** Fresnel in three flat steps (R2): a reflection at full design strength under the far bank (k 0.3 toward the water's
 *  body), a step weaker from y 1150, the near third from y 1195 (k 0.6). */
const STEPS = [1150, 1195];
const tone3 = (src: string, k: [number, number, number] = [0.3, 0.45, 0.6]) => k.map((v) => reflectTone(src, v, CM.water));
/** On-screen source colours (sampled at 1.0 s, after the clean pen; DIAGNOSIS §2.4). */
const SRC = {
  bridgeBrick: '#DAA28E',
  bridgeSoffit: '#D0CCD8',
  bridgeStone: '#EEDCCB',
  wingBrick: '#CD9985',
  wingStone: '#D5C5BB',
  wingGlass: '#93949F',
  lobby: CM.lamp,
  iron: '#9DA3B3',
  hull: '#707E92',
  sage: '#B5C7AF',
  oat: '#E4D3BA',
  herLegs: '#5A3C4E',
  herCoat: CM.hero,
} as const;
const COL = {
  bridgeBrick: tone3(SRC.bridgeBrick, [0.32, 0.45, 0.6]),
  bridgeSoffit: tone3(SRC.bridgeSoffit, [0.25, 0.4, 0.55]),
  bridgeStone: tone3(SRC.bridgeStone, [0.25, 0.4, 0.55]),
  wingBrick: tone3(SRC.wingBrick),
  wingStone: tone3(SRC.wingStone, [0.25, 0.4, 0.55]),
  wingGlass: tone3(SRC.wingGlass),
  // a light keeps its gold (R7: L* 80-83 at C* >= 35): lights tone less
  lobby: [0, 1, 2].map((i) => reflectTone(SRC.lobby, [0.16, 0.26, 0.36][i], CM.water, {rose: 2, chroma: 0.98})),
  iron: tone3(SRC.iron, [0.3, 0.42, 0.55]),
  hull: tone3(SRC.hull, [0.3, 0.42, 0.55]),
  sage: tone3(SRC.sage, [0.35, 0.5, 0.62]),
  oat: tone3(SRC.oat, [0.4, 0.55, 0.65]),
  herLegs: tone3(SRC.herLegs, [0.45, 0.55, 0.65]),
  // the hero colour is hers only: her reflection calmed to tier C (C* <= 25)
  herCoat: tone3(SRC.herCoat, [0.55, 0.62, 0.7]).map((c) => {
    const o = okLch(c);
    return fromOk(o.l, Math.min(o.c, 0.062), o.h);
  }),
};
/** A ghost's whole-figure value (its head colour, MAP.S1_ROW: they age by value G1 -> G6) toned. */
const ghostCol = (hex: string) => tone3(hex, [0.4, 0.5, 0.6]);

/** The quay band (the far coping's face mirrored, in shade): one cool step of the water, between the far towpath's dark
 *  waterline strip and the reflections. */
const QUAY = waterStep(CM.water, 0.0, 0.85);
/** Ripple tones (R9): a crest catching the sky (lighter), a trough showing the body (darker). */
const rippleCol = (y: number, tone: number) => waterStep(waterAt(y), tone > 0 ? 0.035 : -0.045, tone > 0 ? 0.8 : 1.1);
/** The glitter: the bed (the sun's reflected gold, flat), the slivers' gold and their warm-white cores (never #FFFFFF). */
const GLIT = {bed: fromOk(0.905, 0.058, 76), gold: fromOk(0.935, 0.07, 82), core: fromOk(0.975, 0.025, 85)};

// ================================================================= S1's sources (what stands over the water), at rest

const rect = (x0: number, x1: number) => () => [x0, x1] as [number, number];

// ---- the road bridge beyond the bend (its waterline ~1050: y' = 2100 - y)
const BR = REFLECTORS.bridge;
const BRW = BR.waterLine;
const archHalfAt = (yArch: number, grow = 0): number => {
  // the segmental intrados (V2S1_set_far archY): a circle through the springs and the crown
  const half = BR.arch.half + grow;
  const rise = BR.arch.spring - BR.arch.crown + grow;
  const R = (half * half + rise * rise) / (2 * rise);
  const yc = BR.arch.spring - rise + R;
  const v = R * R - (yc - yArch) * (yc - yArch);
  return yArch > BR.arch.spring ? half : v > 0 ? Math.min(half, Math.sqrt(v)) : 0;
};
const bowlSpan = (grow: number) => (y: number): [number, number] | null => {
  const yArch = 2 * BRW - y;
  if (yArch < BR.arch.crown - grow) return null;
  const hw = archHalfAt(yArch, grow);
  return hw > 0.5 ? [BR.arch.cx - hw, BR.arch.cx + hw] : null;
};
const bridgeMasses = (): Mass[] => [
  // the spandrels' brick (one value) down to the string course mirrored (972 -> 1128)
  {id: 'br/brick', span: rect(BR.x0, BR.x1), y0: 1058, solid: 1112, y1: 2 * BRW - BR.course, colors: COL.bridgeBrick, steps: STEPS, breakup: 0.25, narrow: 0.05},
  // the voussoir ring (limestone, 11 px) and the arch's bowl (the soffit in shade, seen from below)
  {id: 'br/ring', span: bowlSpan(11), y0: 1058, solid: 1106, y1: 2 * BRW - (BR.arch.crown - 11), colors: COL.bridgeStone, steps: STEPS, breakup: 0, narrow: 0.05},
  {id: 'br/bowl', span: bowlSpan(0), y0: 1058, solid: 1104, y1: 2 * BRW - BR.arch.crown, colors: COL.bridgeSoffit, steps: STEPS, breakup: 0, narrow: 0.05},
  // the abutment pilaster (a vertical survives)
  {id: 'br/pil', span: rect(268, 282), y0: 1058, solid: 1110, y1: 2 * BRW - BR.course, colors: COL.bridgeStone, steps: STEPS, breakup: 0, narrow: 0},
  // the deck and string course (limestone) 958-972 -> 1128-1142: a light band of slices
  {id: 'br/deck', span: rect(BR.x0, BR.x1), y0: 2 * BRW - BR.course, solid: 2 * BRW - BR.course, y1: 2 * BRW - BR.deck, colors: COL.bridgeStone, steps: STEPS, breakup: 0.3, narrow: 0.04},
];

// ---- Google's wing: its ground storey's lowest ~1.2 m (the facade above y ~1056 mirrored about ~1091), simplified to
// one brick mass with the light corner pier and the glass slit; the lit lobby is a LIGHT (its column, below)
const WING_TOP = 1096;
const wingMasses = (): Mass[] => [
  {id: 'wing/brick', span: rect(326, 796), y0: WING_TOP, solid: 1150, y1: 1218, colors: COL.wingBrick, steps: STEPS, breakup: 0.6, narrow: 0.14},
  {id: 'wing/pier', span: rect(330, 351), y0: WING_TOP, solid: 1150, y1: 1206, colors: COL.wingStone, steps: STEPS, breakup: 0, narrow: 0},
  {id: 'wing/glass', span: rect(392, 428), y0: WING_TOP, solid: 1150, y1: 1206, colors: COL.wingGlass, steps: STEPS, breakup: 0, narrow: 0.08},
];
/** The lit lobby through the glass doors (x 540-720, the lobby's gold; R7): a column as wide as the door, through the
 *  whole strip (its mirror spans the water), solid under the far bank, then slices, thinning toward our feet. */
const LOBBY: Mass = {id: 'lobby', span: rect(544, 716), y0: WING_TOP, solid: 1160, y1: 1252, colors: COL.lobby, steps: STEPS, breakup: 0.32, narrow: 0.12, taper: 4};

// ---- verticals: the lamp posts (off, slate iron) and the bollards on the coping (R5: verticals survive)
const lampMasses = (): Mass[] =>
  REFLECTORS.lamps
    // x 1046 stands behind the boats; the others hang from the quay band to our edge (their mirror lines, 1045-1088,
    // lie above it: R1)
    .filter((L) => L.x < 780)
    .map((L) => {
      const cw = Math.max(2.2, L.h * 0.034) * 0.62;
      return {id: `lamp/${L.x}`, span: rect(L.x - cw, L.x + cw), y0: 1058, solid: Math.min(waterBottom(L.x) - 34, 1160), y1: waterBottom(L.x) + 4, colors: COL.iron, steps: STEPS, breakup: 0, narrow: 0, taper: 1.2};
    });

// ---- the moored boats (each about its own waterline)
type BoatRefl = {hull: Mass; cabin: Mass};
const boatMasses = (o: typeof BOATS.A, opts: {bowX: number; x86: number; x95: number; x985: number; cabinX: number; clipX?: number}, id: string): BoatRefl => {
  const w = o.water;
  const m = (y: number) => 2 * w - y;
  const hullTopR = m(o.hullTop);
  const tipY = m(o.bowTipY);
  // the hull's sheer near the bow (quadratic from x86 at the hull top to the bow tip), mirrored
  const sheerX = (yr: number): number => {
    // yr between hullTopR (x86) and tipY (bowX): invert the quadratic numerically
    let best = opts.x86;
    let bd = Infinity;
    for (let i = 0; i <= 40; i++) {
      const s = i / 40;
      const x = (1 - s) * (1 - s) * opts.x86 + 2 * (1 - s) * s * opts.x95 + s * s * opts.bowX;
      const y = (1 - s) * (1 - s) * hullTopR + 2 * (1 - s) * s * m(o.hullTop - (o.hullTop - o.bowTipY) * 0.3) + s * s * tipY;
      if (Math.abs(y - yr) < bd) {
        bd = Math.abs(y - yr);
        best = x;
      }
    }
    return best;
  };
  // boat A's reflection gives way to boat B's (nearer) from B's waterline, at B's bow
  const right = (y: number) => (opts.clipX !== undefined && y > BOATS.B.water - 2 ? opts.clipX : 1120);
  const hull: Mass = {
    id: `${id}/hull`,
    span: (y) => {
      if (y < w - 2 || y > tipY) return null;
      const front = opts.bowX + (opts.x985 - opts.bowX) * clamp01((tipY - y) / (tipY - m(w + 4)));
      if (y <= hullTopR + 5.5) return [front, right(y)];
      return [front, sheerX(y)];
    },
    y0: w - 2,
    solid: hullTopR + 2,
    y1: tipY,
    colors: COL.hull,
    steps: STEPS,
    breakup: 0.15,
    narrow: 0.05,
  };
  const cabin: Mass = {
    id: `${id}/cabin`,
    span: (y) => (y < hullTopR + 5.5 ? null : [opts.cabinX, right(y)]),
    y0: hullTopR + 5.5,
    solid: hullTopR + 18,
    y1: m(o.roofY) - 4,
    colors: id === 'boatA' ? COL.sage : COL.oat,
    steps: STEPS,
    breakup: 0.55,
    narrow: 0.1,
  };
  return {hull, cabin};
};
const BOAT_A_R = boatMasses(BOATS.A, {bowX: 786, x86: 864.4, x95: 814, x985: 794.4, cabinX: 875.6, clipX: 930}, 'boatA');
const BOAT_B_R = boatMasses(BOATS.B, {bowX: 930, x86: 1002.8, x95: 956, x985: 937.8, cabinX: 1013}, 'boatB');

// ---- her and the row (dynamic; on the front line: mirrored about the far edge, hanging from it as long as they are
// tall). Simplified (R5): her legs and the coat's hem as one calm vertical each, the ghosts' legs; the bare outlines
// (O1-O3: no fill) reflect nothing.
const figureMasses = (t: number): Mass[] => {
  const out: Mass[] = [];
  const poses = rowAt(t);
  MAP.S1_ROW.forEach((m, i) => {
    const p = poses[i];
    if (!p.visible || m.kind === 'outline') return;
    // her: only once she is out on the towpath (behind the glass before 0.97)
    if (m.kind === 'her' && t < MAP.S1_CLOCK.steppingOut) return;
    // a ghost's reflection grows in with its pop (0.12 s)
    const grow = m.popT === null ? 1 : sstep(0, 0.12, t - m.popT);
    if (grow <= 0) return;
    const top = 2 * waterTop(p.x) - p.feetY - 1;
    const legW = p.h * 0.05;
    const legs = p.h * 0.46 * grow;
    const col = m.kind === 'her' ? COL.herLegs : ghostCol(m.headHex ?? '#A9A5B5');
    out.push({id: `fig/${m.id}`, span: rect(p.x - legW, p.x + legW), y0: top - 30, solid: top + legs * 0.55, y1: top + legs, colors: col, steps: STEPS, breakup: 0, narrow: 0.1, taper: 1.5});
    if (m.kind === 'her') {
      const cw = p.h * 0.12;
      out.push({id: `fig/${m.id}/coat`, span: rect(p.x - cw, p.x + cw), y0: top + legs + 1, solid: top + legs + 4, y1: top + legs + p.h * 0.3 * grow, colors: COL.herCoat, steps: STEPS, breakup: 0.2, narrow: 0.2, taper: 3});
    }
  });
  return out;
};

// ---- the bollards on the coping: short slate stubs under the quay band, their caps (the dome) mirrored round
const bollardStubs = (): {x: number; y0: number; y1: number; w: number}[] =>
  REFLECTORS.bollards.map((b) => {
    const line = waterTop(b.x);
    return {x: b.x, y0: line - 4, y1: 2 * line - (b.foot - b.h), w: b.h * 0.9 * 0.84};
  });

// ---- the sun's glitter column (R8): straight under SUN0 (x 196), over the whole water there (y 1100 -> 1172), densest
// at its still-water mirror point (y 1158), 14 -> 30 px half-width (the low sun at 7.8 deg: a narrow column)
const GLITTER: Glitter = {x: SUN.x, yTop: reflTop(SUN.x) + 1, yBot: waterBottom(SUN.x) + 2, w: [13, 30], peak: SUN.mirror.y, slots: 16, bed: GLIT.bed, gold: GLIT.gold, core: GLIT.core, seed: 's1sun', t0: 0.24};

// ---- ripple lines (R9): 11 alive, mostly in the open near water, clear of the glitter column and Pip's seat
const RIPPLES: Ripples = {
  slots: 11,
  seed: 's1rip',
  x: [-30, 1110],
  y: [1132, 1292],
  avoid: [
    [140, 1080, 252, 1190],
    [636, 1110, 764, 1300],
  ],
  len: [34, 120],
  thick: [1.3, 2.6],
  drift: [6, 16],
  life: [2.6, 4.6],
  t0: 0.24,
};

// ================================================================= drawing

/** One <path> per colour run, in order. */
const RunPaths: React.FC<{runs: Runs; k: string}> = ({runs, k}) => (
  <>
    {Array.from(runs.entries()).map(([c, ds], i) => (
      <path key={`${k}${i}`} d={ds.join('')} fill={c} />
    ))}
  </>
);
const runsOf = (masses: Mass[], sway: (y: number) => number, paint?: (c: string) => string): Runs[] =>
  masses.map((m) => {
    const r: Runs = new Map();
    buildMass(paint ? {...m, colors: m.colors.map(paint)} : m, GRID, sway, r);
    return r;
  });

/** The far coping's face mirrored (the quay band): from the water's far edge to where the quay's reflections start. */
const QUAY_D = (() => {
  const top: string[] = [];
  const bot: string[] = [];
  for (let x = -60; x <= 1140; x += 10) {
    top.push(`${x} ${(waterTop(x) - 3).toFixed(1)}`);
    bot.push(`${x} ${reflTop(x).toFixed(1)}`);
  }
  return `M${top.join('L')}L${bot.reverse().join('L')}Z`;
})();

/** Bollard stubs: a short bar whose lower end is the bollard's dome, mirrored (a round cap, never a square end). */
const stubPath = (x: number, y0: number, y1: number, w: number) => {
  const r = w / 2;
  const yc = Math.max(y0 + 1, y1 - r * 0.55);
  return `M${(x - r).toFixed(1)} ${y0.toFixed(1)}L${(x + r).toFixed(1)} ${y0.toFixed(1)}L${(x + r).toFixed(1)} ${yc.toFixed(1)}Q${(x + r).toFixed(1)} ${y1.toFixed(1)} ${x.toFixed(1)} ${y1.toFixed(1)}Q${(x - r).toFixed(1)} ${y1.toFixed(1)} ${(x - r).toFixed(1)} ${yc.toFixed(1)}Z`;
};

const tr = (v: [number, number]) => `translate(${v[0].toFixed(3)} ${v[1].toFixed(3)})`;

/** The whole canal at t, coloured. */
const WaterBody: React.FC<{t: number}> = ({t}) => {
  const sway = (y: number) => swayAt(SWAY, CAM, y, t);
  // the reflections, each on its thing's plane (counter-shifted inside the water's group)
  const bridge = runsOf(bridgeMasses(), sway);
  const wing = runsOf([...wingMasses(), ...lampMasses(), ...figureMasses(t)], sway);
  const lobby = runsOf([LOBBY], sway);
  const boats = runsOf([BOAT_A_R.cabin, BOAT_A_R.hull, BOAT_B_R.cabin, BOAT_B_R.hull], sway);
  // bollard stubs (the iron's first step)
  const stubs = bollardStubs()
    .map((s) => stubPath(s.x + sway(s.y1) * 0.6, s.y0, s.y1, s.w))
    .join('');
  // ripple lines
  const rip: Runs = new Map();
  for (const l of ripplesAt(RIPPLES, t, (x) => [reflTop(x) + 4, waterBottom(x)])) pushRun(rip, rippleCol(l.y, l.tone), lensPath(l.x, l.y, l.len, l.h));
  // the glitter: its bed (short gold slices on the rows, static, swaying) and the live slivers
  const bed: string[] = [];
  for (let i = 0; i + 1 < ROWS.length; i++) {
    const ya = ROWS[i];
    const yb = ROWS[i + 1];
    if (ya < GLITTER.yTop + 6 || yb > GLITTER.yBot + 6) continue;
    const u = (ya - GLITTER.yTop) / (GLITTER.yBot - GLITTER.yTop);
    const rr = rng(`s1sunbed/${i}`);
    const r = rr.next();
    if (r < 0.28) continue;
    const hw = (GLITTER.w[0] + (GLITTER.w[1] - GLITTER.w[0]) * u) * (0.45 + 0.4 * rr.next());
    const cx = GLITTER.x + (rr.next() - 0.5) * 8 + sway((ya + yb) / 2) * 0.8;
    const g = GRID.gap(ya, yb);
    bed.push(barPath(cx - hw, cx + hw, ya + g, yb, 3 + u * 6));
  }
  const gold: string[] = [];
  const core: string[] = [];
  for (const s of glitterAt(GLITTER, CAM, t)) {
    if (s.k <= 0.02) continue;
    gold.push(lensPath(s.x, s.y, s.len * s.k, s.h, -1));
    core.push(lensPath(s.x + s.len * 0.06, s.y + s.h * 0.08, s.len * s.k * 0.46, s.h * 0.55, -1));
  }
  return (
    <>
      <Sky spec={RAMP_SKY} />
      <g transform={tr(floatOf(S1_PLANE.bridge, t))}>
        {bridge.map((r, i) => (
          <RunPaths key={`b${i}`} runs={r} k={`b${i}`} />
        ))}
      </g>
      <g transform={tr(floatOf(S1_PLANE.boats, t))}>
        {boats.map((r, i) => (
          <RunPaths key={`o${i}`} runs={r} k={`o${i}`} />
        ))}
      </g>
      <g transform={tr(floatOf(S1_PLANE.subject, t))}>
        {wing.map((r, i) => (
          <RunPaths key={`w${i}`} runs={r} k={`w${i}`} />
        ))}
        {lobby.map((r, i) => (
          <RunPaths key={`l${i}`} runs={r} k={`l${i}`} />
        ))}
        <path d={stubs} fill={COL.iron[0]} />
        <path d={QUAY_D} fill={QUAY} />
      </g>
      <RunPaths runs={rip} k="rip" />
      <g transform={tr(floatOf(S1_PLANE.farRoofs, t))}>
        <path d={bed.join('')} fill={GLIT.bed} />
        <path d={gold.join('')} fill={GLIT.gold} />
        <path d={core.join('')} fill={GLIT.core} />
      </g>
    </>
  );
};

/** Frame 0: the water's big masses as flat PALE shapes (mixed S1_PALE toward the paper, like every <Fill> before the
 *  flood), still. */
const WaterPale: React.FC = () => {
  const runs = useMemo(() => {
    const pale = (c: string) => paleOf(c, S1_PALE, PAPER);
    const still = () => 0;
    return runsOf([...bridgeMasses().slice(0, 1), ...wingMasses().slice(0, 1), LOBBY, BOAT_A_R.hull, BOAT_B_R.hull], still, pale);
  }, []);
  return (
    <>
      <Sky spec={RAMP_PALE} />
      {runs.map((r, i) => (
        <RunPaths key={`p${i}`} runs={r} k={`p${i}`} />
      ))}
      <path d={QUAY_D} fill={paleOf(QUAY, S1_PALE, PAPER)} />
    </>
  );
};

/** When the flood's front has passed the whole water (its farthest corner from SUN0's spot): f12. */
const FLOOD_DONE = (() => {
  let r = 0;
  for (const [x, y] of [
    [-60, 1050],
    [1140, 1050],
    [-60, 1330],
    [1140, 1330],
  ] as [number, number][])
    r = Math.max(r, Math.hypot(x - FLOOD_ORIGIN[0], y - FLOOD_ORIGIN[1]));
  return r;
})();

/** CANDIDATE B's CANAL: the whole water of S1, drawn in S1Water's place (the water plane's group, the environment
 *  tier, the flood's Look, RIG_CANAL). */
export const CandWater: React.FC<{t: number}> = ({t}) => {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const clip = useMemo(() => waterPolygon(10), []);
  const r = floodRadius(t);
  const flooding = r < FLOOD_DONE;
  return (
    <>
      <defs>
        <clipPath id={`cbw${uid}`} clipPathUnits="userSpaceOnUse">
          <path d={clip} />
        </clipPath>
        {flooding ? (
          <clipPath id={`cbf${uid}`} clipPathUnits="userSpaceOnUse">
            <circle cx={FLOOD_ORIGIN[0]} cy={FLOOD_ORIGIN[1]} r={Math.max(0, r)} />
          </clipPath>
        ) : null}
      </defs>
      <g clipPath={`url(#cbw${uid})`}>
        {flooding ? <WaterPale /> : null}
        {r > 0 ? (
          <g clipPath={flooding ? `url(#cbf${uid})` : undefined}>
            <WaterBody t={t} />
          </g>
        ) : null}
      </g>
    </>
  );
};

/** Candidate B draws its own glitter (the sun's column): the v5 glint field goes. */
export const GLINTS_OFF = true;

// ================================================================= the duck: the kit's mallard, gliding, with its wake

/** The duck's glide (east, the way it faces): 7 px/s, centred on S1_DUCK at 3.0 s; the kit's bob kept. */
export const DUCK_GLIDE = {vx: 7, tMid: 3.0} as const;
const duckX = (t: number) => DUCK.x + DUCK_GLIDE.vx * (t - DUCK_GLIDE.tMid);

/** The kit's mallard body exactly as kit/canal/life draws it (the same fills, the same bob), without the paper V. */
const DuckBodyRaw: React.FC<{t: number}> = ({t}) => {
  const b = new Batch();
  const s = DUCK.size;
  const ph = rand('s1ducks', 0) * 6.28;
  const x = duckX(t);
  const y = DUCK.y;
  const face = 1;
  const by = y - s * 0.22 + bob(t, s * 0.03, 0.6, ph);
  b.layer();
  b.fill(CM.line, `M${P(x - s * 0.55, by)}Q${P(x - s * 0.5, by + s * 0.32)} ${P(x, by + s * 0.3)}Q${P(x + s * 0.5, by + s * 0.3)} ${P(x + s * 0.55, by - s * 0.02)}Q${P(x + face * s * 0.1, by - s * 0.3)} ${P(x - s * 0.55, by)}Z`);
  b.fill(CM.line, ovalPath(x + face * s * 0.4, by - s * 0.32, s * 0.16, s * 0.15));
  b.fill(CM.coatMustard, `M${P(x + face * s * 0.52, by - s * 0.33)}L${P(x + face * s * 0.72, by - s * 0.29)}L${P(x + face * s * 0.52, by - s * 0.25)}Z`);
  return <Paint b={b} seed="ducks/s1ducks" misreg={false} />;
};
const DuckBody = tiered('environment', {}, DuckBodyRaw);

/** The duck's water: its reflection (the body mirrored about its waterline, toned), a thin contact line, and the
 *  Kelvin V (R11): two tapered light lines from its chest back, 2.5 deg per arm at its row (k = (y - hz) / f), 3.3 body
 *  lengths, each breaking into dashes toward its tail; one short transverse arc inside the V near the bird. */
const DuckWater: React.FC<{t: number}> = ({t}) => {
  const s = DUCK.size;
  const x = duckX(t);
  const y = DUCK.y;
  const base = waterAt(y);
  const refl = reflectTone('#A66952', 0.45, CM.water);
  const light = waterStep(base, 0.05, 0.7);
  const dark = waterStep(base, -0.07, 1.1);
  const sw = swayAt(SWAY, CAM, y + 6, t);
  // the reflection: the body's underside mirrored (a shallow lens hanging from the waterline), in two slices
  const rd =
    barPath(x - s * 0.5 + sw * 0.5, x + s * 0.5 + sw * 0.5, y + 1.2, y + 6.2, 6) +
    barPath(x - s * 0.36 + sw, x + s * 0.4 + sw, y + 7.4, y + 10.4, 5) +
    barPath(x - s * 0.18 + sw * 1.2, x + s * 0.22 + sw * 1.2, y + 11.6, y + 13.6, 3);
  // the contact: the waterline itself a thin dark lens under the body
  const contact = lensPath(x + s * 0.02, y + 0.6, s * 1.14, 2.4);
  // the V: from the chest (x + 0.34 s), back (toward -x); arms at +-2.5 deg in screen (foreshortened Kelvin)
  const kk = (y - CAM.hz) / CAM.f;
  const tanA = kk * Math.tan((19.47 * Math.PI) / 180);
  const L = s * 3.3;
  const x0 = x + s * 0.3;
  const arms: string[] = [];
  for (const side of [-1, 1]) {
    // each arm: three tapered pieces along its length, thinning, with growing gaps (it ages into dashes)
    const pieces = [
      [0.12, 0.46, 2.2],
      [0.52, 0.74, 1.6],
      [0.8, 0.93, 1.1],
    ];
    for (const [a, b, h] of pieces) {
      const xa = x0 - L * a;
      const xb = x0 - L * b;
      const ya = y + 1 + side * (L * a * tanA + 1.2);
      const yb = y + 1 + side * (L * b * tanA + 1.2);
      const cx = (xa + xb) / 2 + swayAt(SWAY, CAM, (ya + yb) / 2, t) * 0.5;
      const cy = (ya + yb) / 2;
      arms.push(lensPath(cx, cy, xa - xb, h));
    }
  }
  // one short transverse arc inside the V, just behind the bird
  const tx = x - s * 0.62;
  const trans = lensPath(tx, y + 2.6, s * 0.34, 1.3);
  return (
    <>
      <path d={rd} fill={refl} />
      <path d={contact} fill={dark} />
      <path d={arms.join('') + trans} fill={light} />
    </>
  );
};

/** Candidate B's duck: its water (reflection, contact, the V) under the kit's own body. */
export const CandDuck: React.FC<{t: number}> | null = ({t}) => (
  <>
    <DuckWater t={t} />
    <DuckBody t={t} />
  </>
);

// ================================================================= QA hooks (node: the colours and the ramp, as cand_B.md lists them)

/** The design's colours with their CIE L*, C*, h (for the doc and the never-band check). */
export const CAND_B_PALETTE = (): {name: string; hex: string; L: number; C: number; h: number}[] => {
  const out: {name: string; hex: string; L: number; C: number; h: number}[] = [];
  const add = (name: string, hex: string) => out.push({name, hex, ...cie(hex)});
  RAMP_SKY.keys.forEach((k) => add(`ramp y${k.y}`, k.color as string));
  (Object.keys(COL) as (keyof typeof COL)[]).forEach((k) => COL[k].forEach((c, i) => add(`${k}[${i}]`, c)));
  add('quay', QUAY);
  add('glitter bed', GLIT.bed);
  add('glitter gold', GLIT.gold);
  add('glitter core', GLIT.core);
  return out;
};
/** The rows and the sway at a few y (for the doc). */
export const CAND_B_GEOMETRY = () => ({
  rows: ROWS.length,
  pitch: [1111, 1150, 1200, 1250, 1290].map((y) => ({y, pitch: +(pxPerMDeep(CAM, y) * 0.32).toFixed(1), depth: +depthAt(CAM, y).toFixed(1)})),
});
