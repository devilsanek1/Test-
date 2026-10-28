// V2S8 house (lane L6, builder B): HER HOUSE AT THE BEND, her window W, her door, the lamps and most of the lamp run.
// Everything here rides the HOUSE plane (planeOffset('house', t), dx 160) and is drawn at the LANDING pose (screen px =
// map px at 35.60); V2S8.tsx adds the seam push about W. Contract: V2S8_clock.ts; brief: docs/v2/lanes/plan_L6.md.
//
//   S8House    the terrace at the bend, frontal, facing down the lane: her house (light brick, the parapet just over W,
//              her teal door 680-770 x 880-1060 under a fanlight and a hood, the stair window over it, the downstairs
//              flat's window under W with a neighbour watering its box), her neighbour (a lower parapet with pigeons,
//              a slate door with its carriage lamp, a balcony with string lights and a reader, a neighbour on the
//              phone behind lace, a satellite dish, bins), one more house; BEYOND THE BEND (seen pre-truck in the gap
//              between the board and her house): a smaller row receding west on the street above the towpath, its
//              corner cafe, a tree, a street lamp, chimney smoke; the two canal-side lamps whose heads show over the
//              board; the forecourt (her steps and pots, a bay tree, her area railings, a bike, a boot scraper, the
//              bins) and the heritage lamp right of her house; the hall behind her door while it is open (lit: a
//              runner, a coat on its hook, the stair, a pendant).
//              Life: windows switching (litAt), the waterer (tips 33.5 / 36.3), the reader, the phone, steam from a
//              vent, smoke beyond the bend, pigeons (one shuffles 34.3, one flutters onto the heritage lamp 36.0), her
//              stair light following her up (34.80-35.40), the knocker's jolt on the latch (34.75).
//   THE LAMP RUN on "facts" (lampRunAt): 'houseLamp', 'carriageR', 'festoon' (16 bulbs strung right -> left under the
//              first-floor sills, 0.03 s apart, the first one IN FRAME lighting at its slot), 'carriageL', 'canalLamp1',
//              'canalLamp2' (and the far street lamp after them): each switches on ONCE (STYLE.md flash safety), unlit glass before, all alike.
//   S8Window   W (LateExit: it un-builds last): TerraceRow's French window for her house on exactly W (860, 700)
//              150 x 170 (its frame's head trimmed to 7 px so the 1.05 push keeps it under the band): dim until 34.95,
//              the lamp clicks on (3 frames), lamp-lit after (blind up, the standard lamp, the shelf, plants); from
//              35.85 her silhouette (HerWindow's model: plum, 140 px) walks in from behind the left wall and paces,
//              phone at her ear, the free hand on 36.9: S3's picture, caught up with.
//   S8DoorLeaf the teal leaf while it swings SHUT over her (34.66-34.75). The shut leaf and the opening swing are drawn
//              in S8House, under her, so she is never behind her own shut door.
import React, {useId, useMemo} from 'react';
import {CM, INK_PX} from '../palette';
import {clamp, useTime} from '../../lib/time';
import {ExitSync} from '../../lib/exit';
import {XG, mat} from '../../lib/xf';
import {line, rect as rectInk} from '../../lib/sketch';
import * as MAP from '../world/map';
import {Batch, Paint, P, Pt, r1, rand, ovalPath, domePath, lobes, lerp, PlaneMap} from '../kit/canal/core';
import {litAt, StringLights, Puffs} from '../kit/canal/life';
import {sashInto, potsInto} from '../kit/canal/terrace';
import {railingInto, bikeInto, treeInto, Lamp} from '../kit/canal/towpath';
import {Person, HER, WindowPerson, drawn} from '../kit/cast';
import {Tier} from '../../lib/tier';
import type {Tier as TierT} from '../../lib/tier';
import {Shade} from '../../lib/light';
import {recede} from '../../lib/depth';
import {S1_IRON} from './V2S1_set_core';
import {S8T, L, lampRunAt, doorOpenK, LANE, SKYLINE_MIN_Y} from './V2S8_clock';
import {LateExit, EarlyExit} from './V2S8_exit';
import {S8Plane, S8_ATM} from './V2S8_depth';

/** Tier C iron (V2S1_set_core S1_IRON: the film's slate iron for lamps, railings, rails, bins' wheels; never plum). */
const IRON = S1_IRON;
/** Recolour a batch's fills in place (each layer's colours through `f`); `ink` false drops its ink. */
function remap(b: Batch, f: (c: string) => string, ink = true): Batch {
  for (const l of b.layers) {
    const fills = new Map<string, string[]>();
    l.fills.forEach((ds, c) => {
      const m = f(c);
      const a = fills.get(m);
      if (a) a.push(...ds);
      else fills.set(m, [...ds]);
    });
    l.fills = fills;
    if (!ink) l.inks = new Map();
  }
  return b;
}
/** Plum iron -> slate (tier C: lamps, railings, the boot scraper, wheels). */
const slate = (c: string) => (c === CM.anchor ? IRON : c);
/** Beyond the bend (depth +1: one step toward the air; lit panes keep their lamp colour). */
const plus1 = (c: string) => (c === CM.lamp || c === CM.lampCore ? c : recede(c === CM.anchor ? IRON : c, 1, S8_ATM));

// ---------------------------------------------------------------- geometry (landing pose, house plane)

const G = LANE.houseGround; // 1060: her sill, the terrace's ground line
const VP = LANE.vp; // (600, 948): the lane's vanishing point; her hall runs straight down the lane too
/** Her facade's distance (m) and scale (px/m): a 1.6 m eye height 112 px under the horizon at a 1300 px focal. Used
 *  for depths INTO the house (the hall, the door's swing). */
const HALL_D = 18.6;
const PXM = 70;
/** The highest nominal top of a misregistered fill (misregistration can lift a fill 2 px; the push 1.05 about W lifts
 *  y 606 to 601). */
const TOP = SKYLINE_MIN_Y + 3;

const W8 = MAP.S8.w;
const WX0 = W8.x - W8.w / 2; // 785
const WY0 = W8.y - W8.h / 2; // 615
const WFR = W8.w * 0.07; // 10.5: TerraceRow's frame band
const W_HEAD = TOP - 1; // 608: the frame's head (TerraceRow's 10.5 px band trimmed to 7 px under the skyline)
const D = MAP.S8.door; // 680-770 x 880-1060
const DW = D.x1 - D.x0;
const DH = D.y1 - D.y0;

/** Her house, her neighbour (a lower parapet: pigeons sit on it), and one more house (the pre-truck right edge). */
const HH = {x0: 640, x1: 972, top: TOP};
const NB = {x0: 972, x1: 1290, top: 640};
const TH = {x0: 1290, x1: 1480, top: 618};
/** The first-floor string course, one line along the terrace. */
const FIRST = 797;

type Box = {x: number; y: number; w: number; h: number};
const STAIR: Box = {x: 684, y: 648, w: 68, h: 118}; // her stair window, over her door
const GWIN: Box = {x: 808, y: 886, w: 104, h: 118}; // the downstairs flat's window, under W
const NB_DOOR: Box = {x: 981, y: 892, w: 48, h: G - 892}; // the neighbour's slate door
const NB_GWIN: Box = {x: 1066, y: 896, w: 98, h: 108};
const NB_BAL: Box = {x: 1098, y: 670, w: 64, h: 122}; // the neighbour's balcony door
const NB_SASH: Box = {x: 1210, y: 678, w: 54, h: 104};
const TH_SASH: Box = {x: 1330, y: 666, w: 56, h: 110};

/** The heritage lamp right of her house (its cap clears W's frame by ~6 px; it stands in the rail as a mass). */
export const HOUSE_LAMP = {x: 992, y: 1078, h: 450};
/** The canal-side lamps beyond the board (feet behind it): only their heads show over its frame (the StatementBoard's
 *  top rail is at y 680), each with a little post under the lantern. They stand in the sky's free gaps at the landing,
 *  clear of SUN8 and of the set's far-windows ripple (the warehouse's arched windows x 244-312, the terrace's x 548-
 *  606): one between the sun and the far terrace, one left of the warehouse; the run sweeps right -> left (west). */
export const CANAL_LAMPS = [
  {id: 'canalLamp1' as const, x: 494, y: 887, h: 270},
  {id: 'canalLamp2' as const, x: 196, y: 887, h: 270},
];
/** Her carriage lamp (lantern top centre), right of her door (the neighbour's, right of its door, is retired: at the
 *  landing it stacked under the near lamp's lantern). */
const CARRIAGE_L = {x: 793, y: 868};
/** The festoon: swags between hooks under the first-floor sills, right -> left (bulbs per swag). */
const FESTOON: {from: Pt; to: Pt; n: number; sag: number}[] = [
  {from: [1180, 811], to: [1290, 812], n: 3, sag: 9},
  {from: [1045, 812], to: [1180, 811], n: 3, sag: 11},
  {from: [955, 811], to: [1045, 812], n: 2, sag: 8},
  {from: [790, 812], to: [955, 811], n: 4, sag: 13},
  {from: [645, 811], to: [790, 812], n: 4, sag: 12},
];
const FESTOON_STEP = 0.03;
/** Bulbs right of the first one in frame at the landing (x < ~1050): those light before the slot, off screen. */
const FESTOON_FIRST_IN_FRAME = 6;

/** The further row beyond the bend: a plane receding west, its near end hidden behind her house's left edge. Its base
 *  sits on the street above the towpath (y ~944, over the canal's far reach), so the lane's ground never covers it. */
const FR_W = 22;
const FR_H = 9.5;
const FR_QUAD: [Pt, Pt, Pt, Pt] = [
  [300, 810],
  [652, 745],
  [652, 944],
  [300, 945.5],
];

// ---------------------------------------------------------------- small helpers

/** On from `at`, ONCE (STYLE.md flash safety: a lamp, bulb or window switches on once; the kit Lamp's 3-frame flicker is dropped). */
const flickOn = (t: number, at: number) => t >= at;
const smooth01 = (u: number) => {
  const c = clamp(u);
  return c * c * (3 - 2 * c);
};
/** 0 -> 1 -> 0 centred on c over d seconds. */
const bump = (t: number, c: number, d: number) => (Math.abs(t - c) >= d / 2 ? 0 : Math.cos(((t - c) / d) * Math.PI));
type R4 = [number, number, number, number];
const hits = (x: number, y: number, r: R4, pad: number) => x > r[0] - pad && x < r[2] + pad && y > r[1] - pad && y < r[3] + pad;

/** Points of an ellipse rotated by deg (a dish, a tilted oval). */
function ellipsePts(cx: number, cy: number, rx: number, ry: number, deg: number, n = 18): Pt[] {
  const a = (deg * Math.PI) / 180;
  const out: Pt[] = [];
  for (let i = 0; i < n; i++) {
    const u = (i / n) * Math.PI * 2;
    const x = Math.cos(u) * rx;
    const y = Math.sin(u) * ry;
    out.push([cx + x * Math.cos(a) - y * Math.sin(a), cy + x * Math.sin(a) + y * Math.cos(a)]);
  }
  return out;
}
const ellipseInk = (cx: number, cy: number, rx: number, ry: number, deg: number) => {
  const p = ellipsePts(cx, cy, rx, ry, deg, 14);
  return p.slice(0, 11).map(([x, y], i) => `${i ? 'L' : 'M'}${P(x, y)}`).join('');
};

/** A keystone lintel over an opening (x0..x1 at y). */
function lintelInto(b: Batch, x0: number, x1: number, y: number, h: number) {
  b.rect(CM.limestone, x0, y - h, x1 - x0, h);
  const c = (x0 + x1) / 2;
  b.poly(CM.stucco, [
    [c - 7, y - h - 3],
    [c + 7, y - h - 3],
    [c + 5, y + 2],
    [c - 5, y + 2],
  ]);
  b.rect(CM.stoneShade, x0 + 2, y, x1 - x0 - 4, 2);
}

/** A sill under an opening. */
function sillInto(b: Batch, x0: number, x1: number, y: number) {
  b.rect(CM.limestone, x0 - 4, y, x1 - x0 + 8, 6);
  b.rect(CM.stoneShade, x0 - 2, y + 6, x1 - x0 + 4, 2.5);
}

/** A four-panel door leaf (screen rect), brass knocker, knob and letterbox. jolt = the knocker's latch jolt (px).
 *  Each colour that sits ON another gets its own layer (a Batch paints a colour once per layer). */
function panelDoorInto(b: Batch, x: number, y: number, w: number, h: number, color: string, jolt = 0) {
  b.layer();
  b.rect(color, x, y, w, h);
  const pw = w * 0.32;
  const panels = [
    [x + w * 0.12, y + h * 0.07, h * 0.36],
    [x + w * 0.56, y + h * 0.07, h * 0.36],
    [x + w * 0.12, y + h * 0.54, h * 0.38],
    [x + w * 0.56, y + h * 0.54, h * 0.38],
  ];
  b.layer();
  for (const [px, py, ph] of panels) b.rect(CM.shadeWarm, px, py, pw, ph);
  b.layer();
  for (const [px, py, ph] of panels) b.rect(color, px + 2.5, py + 2.5, pw - 5, ph - 5);
  // letterbox, knob, the knocker ring (on the middle rail)
  b.layer();
  b.rect(CM.coatMustard, x + w * 0.34, y + h * 0.475, w * 0.32, Math.max(2, h * 0.022));
  b.fill(CM.coatMustard, ovalPath(x + w * 0.86, y + h * 0.52, w * 0.045, w * 0.045));
  const kx = x + w * 0.5 + jolt * 0.5;
  const ky = y + h * 0.31 - jolt;
  b.fill(CM.coatMustard, ovalPath(kx, ky, w * 0.075, w * 0.085));
  b.fill(CM.coatMustard, ovalPath(kx, ky - w * 0.09, w * 0.03, w * 0.03));
  b.layer();
  b.fill(color, ovalPath(kx, ky + w * 0.01, w * 0.04, w * 0.05));
}

/** A small wall lantern on a bracket (lantern top centre x, y; s = height). Unlit glass, or lamp-lit. */
function carriageInto(b: Batch, x: number, y: number, s: number, lit: boolean, seed: string) {
  const w = s * 0.62;
  b.layer();
  // the back plate and the swan bracket
  b.rect(IRON, x - 2, y - s * 0.42, 4, s * 0.3);
  b.ink(`M${P(x, y - s * 0.3)}Q${P(x + s * 0.28, y - s * 0.3)} ${P(x + s * 0.2, y - s * 0.12)}Q${P(x + s * 0.12, y - s * 0.02)} ${P(x, y)}`, INK_PX.hair, IRON, 0, {thing: true});
  // cap, glass, the cup
  b.poly(IRON, [
    [x - w * 0.62, y + s * 0.12],
    [x, y - s * 0.06],
    [x + w * 0.62, y + s * 0.12],
  ]);
  b.poly(lit ? CM.lampCore : CM.glass, [
    [x - w * 0.5, y + s * 0.12],
    [x + w * 0.5, y + s * 0.12],
    [x + w * 0.36, y + s * 0.8],
    [x - w * 0.36, y + s * 0.8],
  ]);
  if (lit)
    b.poly(CM.lamp, [
      [x - w * 0.22, y + s * 0.3],
      [x + w * 0.22, y + s * 0.3],
      [x + w * 0.16, y + s * 0.72],
      [x - w * 0.16, y + s * 0.72],
    ]);
  b.layer();
  b.poly(IRON, [
    [x - w * 0.42, y + s * 0.8],
    [x + w * 0.42, y + s * 0.8],
    [x + w * 0.12, y + s * 0.98],
    [x - w * 0.12, y + s * 0.98],
  ]);
  void seed;
}

/** A pigeon perched at (x, y feet): the canal kit's pigeon (grey body, darker head, peach feet), nodding. */
function pigeonInto(b: Batch, x: number, y: number, s: number, face: 1 | -1, t: number, ph: number) {
  const nod = Math.max(0, Math.sin(t * 1.6 + ph) - 0.6) * s * 0.18;
  const by = y - s * 0.34;
  b.fill(CM.stoneShade, ovalPath(x, by, s * 0.46, s * 0.3));
  b.fill(CM.shadeCool, ovalPath(x - face * s * 0.08, by - s * 0.06, s * 0.3, s * 0.16));
  b.fill(CM.shadeCool, ovalPath(x + face * (s * 0.38 + nod * 0.5), by - s * 0.28 + nod * 0.4, s * 0.15, s * 0.15));
  b.fill(CM.shadeCool, `M${P(x - face * s * 0.36, by)}L${P(x - face * s * 0.7, by + s * 0.08)}L${P(x - face * s * 0.34, by + s * 0.16)}Z`);
}

/** A pigeon in flight (wings at flap -1..1). */
function pigeonFlyInto(b: Batch, x: number, y: number, s: number, face: 1 | -1, flap: number) {
  const wx = s * 0.7;
  const wy = s * 0.5 * flap;
  b.fill(CM.stoneShade, `M${P(x - wx, y - wy)}Q${P(x, y - s * 0.1)} ${P(x + wx, y - wy)}L${P(x + s * 0.25, y + s * 0.18)}L${P(x - s * 0.25, y + s * 0.18)}Z`);
  b.fill(CM.shadeCool, ovalPath(x + face * s * 0.3, y - s * 0.02, s * 0.13, s * 0.12));
}

// ---------------------------------------------------------------- beyond the bend (static)

/** The further row (a plane receding west), its corner cafe, a tree: depth +1 (one step toward the air), its windows
 *  STATIC (a fixed lit pattern: nothing beyond the bend switches), no lines. */
function beyondInto() {
  const pm = new PlaneMap(FR_W, FR_H, FR_QUAD);
  const b = new Batch();
  const wins: {q: Pt[]; near: boolean}[] = [];
  const houses = [
    {u0: 0, u1: 5.6, wall: CM.stucco},
    {u0: 5.6, u1: 11, wall: CM.brickLight},
    {u0: 11, u1: 16.6, wall: CM.limestone},
    {u0: 16.6, u1: FR_W, wall: CM.brick},
  ];
  // walls, parapets, string courses, stacks on the party walls
  houses.forEach((h, j) => {
    const w = h.u1 - h.u0;
    const top = j === 1 ? 0.5 : 0;
    b.poly(h.wall, pm.q(h.u0, top, w, FR_H - top));
    b.poly(CM.limestone, pm.q(h.u0 - 0.05, top, w + 0.1, 0.35));
    b.poly(CM.stoneShade, pm.q(h.u0, top + 0.35, w, 0.12));
    for (const v of [3.05, 6.1]) b.poly(CM.limestone, pm.q(h.u0, v, w, 0.16));
    // a stack on the left party wall: brick, a cap, pots
    const su = h.u0 + 0.3;
    b.poly(j % 2 ? CM.brickDeep : CM.brick, pm.q(su, top - 1.0, 0.9, 1.0));
    b.poly(CM.limestone, pm.q(su - 0.08, top - 1.1, 1.06, 0.14));
    b.poly(CM.leafRust, pm.q(su + 0.12, top - 1.4, 0.22, 0.3));
    b.poly(CM.brickDeep, pm.q(su + 0.5, top - 1.32, 0.22, 0.22));
  });
  b.layer();
  // windows: two upper floors x two bays per house (lit states per frame), ground floors
  houses.forEach((h, j) => {
    for (const [v0, vh] of [
      [0.95, 1.5],
      [3.6, 1.9],
    ]) {
      for (const du of [1.0, 3.4]) {
        const u = h.u0 + du;
        b.poly(CM.paper, pm.q(u - 0.1, v0 - 0.1, 1.3, vh + 0.2));
        b.poly(CM.limestone, pm.q(u - 0.18, v0 + vh + 0.05, 1.46, 0.16));
        wins.push({q: pm.q(u, v0, 1.1, vh), near: j === 3});
      }
    }
    if (j < 3) {
      // a door and a ground window
      b.poly(CM.paper, pm.q(h.u0 + 0.7, 6.6, 1.3, 2.9));
      b.poly([CM.coatSlate, CM.brickDeep, CM.sage][j], pm.q(h.u0 + 0.85, 6.9, 1.0, 2.6));
      b.poly(CM.paper, pm.q(h.u0 + 2.7, 6.9, 2.0, 1.8));
      wins.push({q: pm.q(h.u0 + 2.8, 7.0, 1.8, 1.6), near: false});
    }
  });
  // the corner cafe on the near house: fascia, striped awning, a lit shop window with the counter, the door
  const c0 = 16.75;
  const c1 = 21.7;
  b.poly(CM.anchor, pm.q(c0, 6.25, c1 - c0, 0.55));
  b.poly(CM.coatMustard, pm.q(c0 + 0.6, 6.35, 2.6, 0.35));
  b.poly(CM.lamp, pm.q(c0 + 0.1, 7.25, 3.3, 2.0));
  b.poly(CM.lampCore, pm.q(c0 + 0.5, 7.4, 1.9, 1.0));
  b.poly(CM.line, pm.q(c0 + 0.2, 8.65, 3.1, 0.6));
  for (let k = 0; k < 3; k++) b.poly([CM.box, CM.paper, CM.sage][k], pm.q(c0 + 0.5 + k * 0.8, 8.3, 0.35, 0.35));
  b.poly(CM.paper, pm.q(c0 + 3.7, 7.1, 1.1, 2.4));
  b.poly(CM.shadeWarm, pm.q(c0 + 3.8, 7.25, 0.9, 2.25));
  b.layer();
  for (let k = 0; k < 9; k++) {
    const u = c0 - 0.15 + k * ((c1 - c0 + 0.3) / 9);
    b.poly(k % 2 ? CM.paper : CM.sage, [pm.p(u, 6.8), pm.p(u + (c1 - c0 + 0.3) / 9, 6.8), pm.p(u + (c1 - c0 + 0.3) / 9 + 0.05, 7.55), pm.p(u + 0.05, 7.55)]);
  }
  // the railing along the street's edge (above the towpath) and a tree at the bend
  b.layer();
  const rail: Pt[] = [];
  for (let u = 9; u <= FR_W; u += 0.5) rail.push(pm.p(u, FR_H));
  for (let i = 0; i < rail.length - 1; i++) {
    const [x0, y0] = rail[i];
    const [x1, y1] = rail[i + 1];
    b.poly(CM.anchor, [
      [x0, y0 - 9],
      [x1, y1 - 9.5],
      [x1, y1 - 8],
      [x0, y0 - 7.5],
    ]);
    b.rect(CM.anchor, x0 - 0.6, y0 - 9, 1.2, 9);
  }
  treeInto(b, 524, 952, 142, 's8h/bendTree', 0, true);
  b.layer();
  wins.forEach((w, k) => b.poly(rand('s8h/frWin', k) < 0.45 ? CM.lamp : CM.glass, w.q));
  return {b: remap(b, plus1, false), wins};
}

// ---------------------------------------------------------------- the terrace (static)

function facadeInto(): Batch {
  const b = new Batch();
  // ---- her house: the end-of-terrace side wall receding to the lane VP, the wall, parapet, string course, plinth
  const sideK = HALL_D / (HALL_D + 8);
  b.poly(CM.brick, [
    [HH.x0, HH.top + 3],
    [VP.x + (HH.x0 - VP.x) * sideK, VP.y + (HH.top + 3 - VP.y) * sideK],
    [VP.x + (HH.x0 - VP.x) * sideK, VP.y + (G - VP.y) * sideK],
    [HH.x0, G],
  ]);
  b.rect(CM.brickLight, HH.x0, HH.top + 3, HH.x1 - HH.x0, G - HH.top - 3);
  // the neighbour: brick upstairs, rusticated stucco below; one more house in deep brick
  b.rect(CM.brick, NB.x0, NB.top + 2, NB.x1 - NB.x0, FIRST - NB.top);
  b.rect(CM.stucco, NB.x0, FIRST, NB.x1 - NB.x0, G - FIRST);
  b.rect(CM.brickDeep, TH.x0, TH.top + 2, TH.x1 - TH.x0, G - TH.top - 2);
  b.layer();
  b.layer();
  // ---- parapets, cornices, the string course, plinths, party-wall pilasters, quoins
  b.rect(CM.limestone, HH.x0 - 4, HH.top, HH.x1 - HH.x0 + 8, 8);
  b.rect(CM.stucco, HH.x0 - 2, HH.top + 8, HH.x1 - HH.x0 + 4, 7);
  b.rect(CM.stoneShade, HH.x0 - 2, HH.top + 15, HH.x1 - HH.x0 + 4, 3);
  b.rect(CM.limestone, NB.x0 - 2, NB.top, NB.x1 - NB.x0 + 4, 8);
  b.rect(CM.stucco, NB.x0, NB.top + 8, NB.x1 - NB.x0, 7);
  b.rect(CM.stoneShade, NB.x0, NB.top + 15, NB.x1 - NB.x0, 3);
  b.rect(CM.limestone, TH.x0 - 2, TH.top, TH.x1 - TH.x0 + 4, 9);
  b.rect(CM.stoneShade, TH.x0, TH.top + 9, TH.x1 - TH.x0, 3);
  b.rect(CM.limestone, HH.x0 - 4, FIRST, TH.x1 - HH.x0 + 4, 9);
  b.rect(CM.stoneShade, HH.x0 - 2, FIRST + 9, TH.x1 - HH.x0, 2.5);
  b.rect(CM.stucco, HH.x0, 1040, HH.x1 - HH.x0, G - 1040);
  b.rect(CM.stoneShade, HH.x0, 1040, HH.x1 - HH.x0, 2.5);
  b.rect(CM.stoneShade, NB.x0, 1042, NB.x1 - NB.x0, G - 1042);
  for (const x of [HH.x1, NB.x1]) b.rect(CM.brickDeep, x - 2, NB.top + 2, 4, G - NB.top - 2);
  for (let y = HH.top + 22, k = 0; y < 1030; y += 27, k++) b.rect(CM.limestone, HH.x0, y, k % 2 ? 11 : 18, 21);
  // her rainwater pipe with its hopper; the neighbour's (slate, 4-5 px: a thing, not a line)
  b.rect(IRON, HH.x1 - 15, HH.top + 24, 10, 9);
  b.rect(IRON, HH.x1 - 12, HH.top + 33, 5, 1040 - HH.top - 33);
  b.rect(IRON, NB.x1 - 14, NB.top + 22, 5, 1042 - NB.top - 22);
  // the neighbour's chimney stack (its pots stay under the skyline) and her satellite dish
  b.rect(CM.brickDeep, 1150, 616, 36, NB.top - 616);
  b.rect(CM.limestone, 1147, 612, 42, 5);
  b.rect(CM.leafRust, 1153, TOP, 8, 4);
  b.rect(CM.brick, 1166, TOP + 0.5, 8, 3.5);
  b.rect(CM.brickDeep, 1177, TOP, 7, 4);
  b.layer();
  // ---- openings: lintels and sills (the panes are per frame)
  lintelInto(b, STAIR.x - 6, STAIR.x + STAIR.w + 6, STAIR.y - 2, 10);
  sillInto(b, STAIR.x, STAIR.x + STAIR.w, STAIR.y + STAIR.h);
  lintelInto(b, GWIN.x - 8, GWIN.x + GWIN.w + 8, GWIN.y - 2, 11);
  sillInto(b, GWIN.x, GWIN.x + GWIN.w, GWIN.y + GWIN.h);
  lintelInto(b, NB_GWIN.x - 6, NB_GWIN.x + NB_GWIN.w + 6, NB_GWIN.y - 2, 10);
  sillInto(b, NB_GWIN.x, NB_GWIN.x + NB_GWIN.w, NB_GWIN.y + NB_GWIN.h);
  lintelInto(b, NB_SASH.x - 6, NB_SASH.x + NB_SASH.w + 6, NB_SASH.y - 2, 9);
  sillInto(b, NB_SASH.x, NB_SASH.x + NB_SASH.w, NB_SASH.y + NB_SASH.h);
  lintelInto(b, NB_BAL.x - 8, NB_BAL.x + NB_BAL.w + 8, NB_BAL.y - 2, 10);
  lintelInto(b, TH_SASH.x - 6, TH_SASH.x + TH_SASH.w + 6, TH_SASH.y - 2, 9);
  sillInto(b, TH_SASH.x, TH_SASH.x + TH_SASH.w, TH_SASH.y + TH_SASH.h);
  // her stair window's box of trailing ivy, the air bricks at her plinth, the bell push by her door
  b.rect(CM.brickDeep, STAIR.x + 2, STAIR.y + STAIR.h - 9, STAIR.w - 4, 9);
  b.fill(CM.sage, lobes(STAIR.x + 3, STAIR.x + STAIR.w - 3, STAIR.y + STAIR.h - 8, 13, 's8h/stairBox', 4));
  // ---- her door: pilasters, the arch round the fanlight, the hood (the leaf and the fanlight's glass come later)
  b.rect(CM.stucco, D.x0 - 13, 826, 13, G - 826);
  b.rect(CM.stucco, D.x1, 826, 13, G - 826);
  b.rect(CM.paper, D.x0 - 15, 821, 17, 6);
  b.rect(CM.paper, D.x1 - 2, 821, 17, 6);
  b.fill(CM.stucco, domePath((D.x0 + D.x1) / 2, D.y0, DW / 2 + 12, DW / 2 + 11));
  b.rect(CM.limestone, D.x0 - 20, 811, DW + 40, 8);
  b.rect(CM.stoneShade, D.x0 - 18, 819, DW + 36, 2.5);
  // the neighbour's door: pilasters, arch, hood and its slate leaf (milk on the step: forecourt)
  const nc = NB_DOOR.x + NB_DOOR.w / 2;
  b.rect(CM.paper, NB_DOOR.x - 7, NB_DOOR.y - 30, 7, G - NB_DOOR.y + 30);
  b.rect(CM.paper, NB_DOOR.x + NB_DOOR.w, NB_DOOR.y - 30, 7, G - NB_DOOR.y + 30);
  b.fill(CM.paper, domePath(nc, NB_DOOR.y, NB_DOOR.w / 2 + 7, NB_DOOR.w / 2 + 6));
  b.rect(CM.limestone, NB_DOOR.x - 11, NB_DOOR.y - 38, NB_DOOR.w + 22, 7);
  b.layer();
  panelDoorInto(b, NB_DOOR.x, NB_DOOR.y, NB_DOOR.w, NB_DOOR.h, CM.coatSlate);
  // the third house's door (pre-truck right edge only)
  b.rect(CM.paper, 1398, 862, 64, G - 862);
  panelDoorInto(b, 1404, 890, 52, G - 890, CM.brickDeep);
  // the neighbour's balcony door frame (its glass and the reader are per frame)
  b.rect(CM.paper, NB_BAL.x - 6, NB_BAL.y - 6, NB_BAL.w + 12, NB_BAL.h + 6);
  // ---- the satellite dish on the neighbour's first floor (under the heritage lamp's crossarm)
  b.layer();
  b.rect(CM.stoneShade, 1024, 748, 9, 3);
  b.rect(CM.stoneShade, 1025, 744, 5, 10);
  b.layer();
  b.poly(CM.paper, ellipsePts(1037, 744, 10, 13, -24));
  b.layer();
  b.poly(CM.stoneShade, ellipsePts(1039.5, 743, 5, 9.5, -24));
  // ---- structure ink: loose architectural lines (no upward overshoot near the skyline)
  let s = '';
  s += line(HH.x0 - 5, HH.top + 1, HH.x1 + 6, HH.top + 1, {seed: 's8h/i/top', over: [0, 0], drift: 0.08, jitter: 0.4});
  s += line(NB.x0, NB.top + 1, NB.x1 + 14, NB.top + 1, {seed: 's8h/i/nbTop', over: [0, 8], drift: 0.08, jitter: 0.4});
  s += line(HH.x0 - 8, FIRST, TH.x0 + 30, FIRST, {seed: 's8h/i/first', over: [0, 30]});
  s += line(HH.x0, HH.top + 2, HH.x0, G, {seed: 's8h/i/corner', over: [0, 12]});
  s += line(HH.x1, HH.top + 3, HH.x1, G, {seed: 's8h/i/party', over: [0, 8]});
  s += line(NB.x1, NB.top + 2, NB.x1, G, {seed: 's8h/i/party2', over: [0, 8]});
  s += line(HH.x0 - 4, 1040, HH.x1 + 40, 1040, {seed: 's8h/i/plinth', over: [0, 8]});
  b.ink(s, INK_PX.mid);
  let d = '';
  d += line(D.x0 - 22, 811, D.x1 + 22, 811, {seed: 's8h/i/hood', over: 'small'});
  d += line(D.x0 - 13, 826, D.x0 - 13, G, {seed: 's8h/i/pilL', over: [0, 6]});
  d += line(D.x1 + 13, 826, D.x1 + 13, G, {seed: 's8h/i/pilR', over: [0, 6]});
  d += `M${P(D.x0 - 12, D.y0)}A${DW / 2 + 12} ${DW / 2 + 11} 0 0 1 ${P(D.x1 + 12, D.y0)}`;
  d += rectInk(NB_DOOR.x - 7, NB_DOOR.y - 30, NB_DOOR.w + 14, G - NB_DOOR.y + 30, {seed: 's8h/i/nbDoor', over: 'small', open: 0.4});
  d += rectInk(NB_BAL.x - 6, NB_BAL.y - 6, NB_BAL.w + 12, NB_BAL.h + 6, {seed: 's8h/i/nbBal', over: 'small', open: 0.3});
  b.ink(d, INK_PX.far);
  return b;
}

// ---------------------------------------------------------------- the forecourt (static, in front of the facade)

function forecourtInto(): Batch {
  const b = new Batch();
  // her door steps, the neighbour's step
  b.rect(CM.limestone, D.x0 - 18, G, DW + 36, 8);
  b.rect(CM.stoneShade, D.x0 - 20, G + 8, DW + 40, 2.5);
  b.rect(CM.limestone, D.x0 - 24, G + 10, DW + 48, 8);
  b.rect(CM.stoneShade, D.x0 - 26, G + 18, DW + 52, 3);
  b.rect(CM.limestone, NB_DOOR.x - 9, G, NB_DOOR.w + 18, 7);
  b.rect(CM.stoneShade, NB_DOOR.x - 11, G + 7, NB_DOOR.w + 22, 2.5);
  b.ink(line(D.x0 - 24, G + 10, D.x1 + 24, G + 10, {seed: 's8h/i/step', over: 'small'}), INK_PX.hair);
  b.layer();
  // her area railings (short, horizontal) and the neighbour's, behind its bins; the corner railing with the bike
  railingInto(b, GWIN.x + 4, HH.x1 - 8, G + 2, 40, 's8h/area', {pitch: 20, bars: 2, color: IRON});
  railingInto(b, 1056, NB.x1 + 40, G, 38, 's8h/nbArea', {pitch: 21, bars: 2, color: IRON});
  railingInto(b, 600, 664, G + 6, 34, 's8h/corner', {pitch: 16, bars: 2, color: IRON});
  b.layer();
  bikeInto(b, 628, G + 10, 19, 's8h/bike', CM.brickDeep, -1);
  // pots and herbs on her step, a boot scraper, milk on the neighbour's step
  potsInto(b, D.x0 - 18, D.x0 + 6, G, 13, 's8h/potsL');
  potsInto(b, D.x1 - 4, D.x1 + 20, G, 13, 's8h/potsR');
  b.rect(IRON, 648, G - 2, 4, 12);
  b.rect(IRON, 660, G - 2, 4, 12);
  b.rect(IRON, 646, G + 2, 20, 4);
  // the bay tree in a lead tub right of her door
  const bx = 802;
  b.poly(CM.stoneShade, [
    [bx - 13, G - 26],
    [bx + 13, G - 26],
    [bx + 10, G + 2],
    [bx - 10, G + 2],
  ]);
  b.rect(CM.limestone, bx - 15, G - 29, 30, 4);
  b.rect(CM.line, bx - 1.5, G - 66, 3, 38);
  b.fill(CM.sage, ovalPath(bx, G - 86, 22, 22));
  b.fill(CM.sage, lobes(bx - 20, bx + 20, G - 72, 30, 's8h/bay', 4));
  b.fill(CM.leafGold, lobes(bx - 16, bx + 4, G - 96, 22, 's8h/bayLit', 3));
  // two wheelie bins in front of the neighbour's railings
  for (const [x, c] of [
    [1092, CM.coatSlate],
    [1140, CM.sage],
  ] as [number, string][]) {
    b.poly(c, [
      [x - 22, G - 58],
      [x + 22, G - 58],
      [x + 19, G + 2],
      [x - 19, G + 2],
    ]);
    b.rect(c, x - 25, G - 64, 50, 8);
    b.fill(IRON, ovalPath(x - 15, G + 2, 5, 5));
  }
  return remap(b, slate);
}

// ---------------------------------------------------------------- per-frame: windows and lights

/** A kit sash plus its glazing bars on top (the kit's own bars share the frame's paper and fall under the pane). */
function sashWithBars(b: Batch, w: Box, lit: boolean, seed: string, ink: number = INK_PX.hair) {
  b.layer();
  sashInto(b, w.x, w.y, w.w, w.h, lit, seed, ink);
  b.layer();
  b.rect(CM.paper, w.x, w.y + w.h * 0.48, w.w, Math.max(2, w.h * 0.035));
  b.rect(CM.paper, w.x + w.w * 0.48, w.y, Math.max(1.6, w.w * 0.04), w.h);
}

/** The downstairs flat's window (under W): lamp-lit, lace on the upper sash, the lower sash raised. */
function laceWindowInto(b: Batch, w: Box, seed: string) {
  const {x, y} = w;
  b.rect(CM.paper, x - 6, y - 6, w.w + 12, w.h + 7);
  b.rect(CM.lamp, x, y, w.w, w.h);
  b.rect(CM.lampCore, x + w.w * 0.18, y + w.h * 0.46, w.w * 0.5, w.h * 0.3);
  // the room: a picture, a shade, a shelf with a plant
  b.rect(CM.line, x + w.w * 0.62, y + w.h * 0.55, w.w * 0.22, w.h * 0.14);
  b.rect(CM.box, x + w.w * 0.645, y + w.h * 0.575, w.w * 0.17, w.h * 0.095);
  b.fill(CM.coatMustard, domePath(x + w.w * 0.22, y + w.h * 0.6, w.w * 0.08, w.h * 0.06));
  // lace on the upper sash: a paper panel with a scalloped hem and a pattern of dots
  b.layer();
  const lh = w.h * 0.4;
  let hem = `M${P(x, y)}L${P(x + w.w, y)}L${P(x + w.w, y + lh)}`;
  const n = 7;
  for (let i = n; i > 0; i--) {
    const xa = x + (w.w * i) / n;
    const xb = x + (w.w * (i - 1)) / n;
    hem += `Q${P((xa + xb) / 2, y + lh + 7)} ${P(xb, y + lh)}`;
  }
  b.fill(CM.paper, hem + 'Z');
  // the raised lower sash's frame, the glazing bar
  b.layer();
  b.rect(CM.paper, x, y + lh + 6, w.w, 5);
  b.rect(CM.paper, x + w.w * 0.49, y, 3, lh + 8);
  b.ink(rectInk(x - 6, y - 6, w.w + 12, w.h + 7, {seed: `${seed}/f`, over: 'small', open: 0.3}), INK_PX.hair);
}

/** Her window box on the downstairs sill (in front of the waterer). */
function windowBoxInto(b: Batch, w: Box) {
  const y = w.y + w.h;
  b.rect(CM.brickDeep, w.x + 2, y - 12, w.w - 4, 13);
  b.rect(CM.leafRust, w.x + 2, y - 12, w.w - 4, 3);
  b.fill(CM.sage, lobes(w.x + 4, w.x + w.w - 4, y - 11, 19, 's8h/box', 6));
  b.fill(CM.blossom, lobes(w.x + 14, w.x + w.w * 0.55, y - 13, 12, 's8h/boxFlowers', 3));
}

/** The neighbour's balcony: slab, railing with pots, in front of the reader. */
function balconyInto(b: Batch) {
  const y = NB_BAL.y + NB_BAL.h;
  b.rect(CM.limestone, NB_BAL.x - 18, y, NB_BAL.w + 36, 7);
  b.rect(CM.stoneShade, NB_BAL.x - 16, y + 7, NB_BAL.w + 32, 3);
  railingInto(b, NB_BAL.x - 16, NB_BAL.x + NB_BAL.w + 16, y, 34, 's8h/bal', {pitch: 16, bars: 2, color: IRON});
  potsInto(b, NB_BAL.x - 14, NB_BAL.x + 14, y, 13, 's8h/balPots');
  potsInto(b, NB_BAL.x + NB_BAL.w - 12, NB_BAL.x + NB_BAL.w + 14, y, 12, 's8h/balPots2');
}

/** The facade's windows, STATIC (CRAFT §b: one window changing at a time at most; THROUGHLINE §4: no switch in film
 *  36.80-38.30; W's 34.95 is the shot's one window switch): her stair window unlit, her fanlight lit (the hall), the
 *  downstairs flat lamp-lit, the neighbour's fanlight and second sash lit, the third house's sash dim, its fanlight lit. */
function windowsInto(): Batch {
  const b = new Batch();
  sashWithBars(b, STAIR, false, 's8h/stairWin');
  const fc = (D.x0 + D.x1) / 2;
  b.fill(CM.lamp, domePath(fc, D.y0, DW / 2, DW / 2));
  for (let k = 0; k < 5; k++) {
    const a = Math.PI * (0.1 + k * 0.2);
    b.ink(`M${P(fc + Math.cos(a) * DW * 0.13, D.y0 - Math.sin(a) * DW * 0.13)}L${P(fc + Math.cos(a) * DW * 0.48, D.y0 - Math.sin(a) * DW * 0.48)}`, 1.6, CM.paper, 0, {thing: true});
  }
  b.layer();
  laceWindowInto(b, GWIN, 's8h/gwin');
  b.layer();
  b.fill(CM.lamp, domePath(NB_DOOR.x + NB_DOOR.w / 2, NB_DOOR.y, NB_DOOR.w / 2, NB_DOOR.w / 2));
  sashWithBars(b, NB_SASH, true, 's8h/nbSash');
  sashWithBars(b, TH_SASH, false, 's8h/thSash');
  b.layer();
  b.fill(CM.lamp, domePath(1430, 890, 26, 26));
  b.rect(CM.lamp, NB_GWIN.x, NB_GWIN.y, NB_GWIN.w, NB_GWIN.h);
  b.rect(CM.lamp, NB_BAL.x, NB_BAL.y, NB_BAL.w, NB_BAL.h);
  b.rect(CM.coatOat, NB_BAL.x, NB_BAL.y, NB_BAL.w, NB_BAL.h * 0.08);
  return b;
}
/** The lit panes on the facade (holes in its Shade: a lit pane is unshaded). */
const LIT_PANES: [number, number, number, number][] = [
  [GWIN.x, GWIN.y, GWIN.w, GWIN.h],
  [NB_GWIN.x, NB_GWIN.y, NB_GWIN.w, NB_GWIN.h],
  [NB_BAL.x, NB_BAL.y, NB_BAL.w, NB_BAL.h],
  [NB_SASH.x, NB_SASH.y, NB_SASH.w, NB_SASH.h],
];
/** Lit fanlights (domes: centre x, base y, radius). */
const LIT_DOMES: [number, number, number][] = [
  [(D.x0 + D.x1) / 2, D.y0, DW / 2],
  [NB_DOOR.x + NB_DOOR.w / 2, NB_DOOR.y, NB_DOOR.w / 2],
  [1430, 890, 26],
];
const lerpPt = (a: Pt, c: Pt, u: number): Pt => [lerp(a[0], c[0], u), lerp(a[1], c[1], u)];

/** After the window people: the lace window's box, the balcony, the neighbour's ground window lace (in front). */
function frontsInto(): Batch {
  const b = new Batch();
  windowBoxInto(b, GWIN);
  balconyInto(b);
  // the neighbour's ground window: a lace cafe curtain over its lower half, the frame and the glazing bars
  const w = NB_GWIN;
  const lh = w.h * 0.46;
  let hem = `M${P(w.x, w.y + w.h)}L${P(w.x, w.y + w.h - lh)}`;
  for (let i = 0; i < 6; i++) {
    const xa = w.x + (w.w * i) / 6;
    const xb = w.x + (w.w * (i + 1)) / 6;
    hem += `Q${P((xa + xb) / 2, w.y + w.h - lh - 6)} ${P(xb, w.y + w.h - lh)}`;
  }
  b.fill(CM.paper, hem + `L${P(w.x + w.w, w.y + w.h)}Z`);
  b.rect(CM.paper, w.x - 6, w.y - 6, w.w + 12, 6);
  b.rect(CM.paper, w.x - 6, w.y - 6, 6, w.h + 6);
  b.rect(CM.paper, w.x + w.w, w.y - 6, 6, w.h + 6);
  b.rect(CM.paper, w.x, w.y + w.h * 0.46, w.w, 4);
  b.rect(CM.paper, w.x + w.w * 0.49, w.y, 3, w.h);
  // the balcony door's glazing bars
  b.rect(CM.paper, NB_BAL.x + NB_BAL.w * 0.48, NB_BAL.y, 3, NB_BAL.h);
  b.rect(CM.paper, NB_BAL.x, NB_BAL.y + NB_BAL.h * 0.36, NB_BAL.w, 3);
  return b;
}

// ---------------------------------------------------------------- her door: the hall, the leaf

/** A point at facade-plane (x, y) pushed `m` metres INTO the house (toward the lane VP). */
const deep = (x: number, y: number, m: number): Pt => {
  const k = HALL_D / (HALL_D + m);
  return [VP.x + (x - VP.x) * k, VP.y + (y - VP.y) * k];
};

/** The lit hall seen through the open door (clipped to the opening by the caller). */
function hallInto(): Batch {
  const b = new Batch();
  const xl = D.x0 - 6;
  const xr = D.x1 + 12;
  const yc = 855;
  const back = 4.4;
  const [bxl, byt] = deep(xl, yc, back);
  const [bxr, byb] = deep(xr, G, back);
  // the right wall (lit by the pendant), the floor, the back wall
  b.poly(CM.lamp, [[xr, yc], deep(xr, yc, back), deep(xr, G, back), [xr, G]]);
  b.poly(CM.paving, [[xl, G], [xr, G], deep(xr, G, back), deep(xl, G, back)]);
  b.poly(CM.lampCore, [
    [bxl, byt],
    [bxr, byt],
    [bxr, byb],
    [bxl, byb],
  ]);
  b.layer();
  // the stair rising along the right wall toward the back: its string and treads
  const s0 = deep(xr - 2, G - 2, 1.6);
  const s1 = deep(xr - 2, G - 150, back - 0.2);
  b.poly(CM.paper, [s0, s1, [s1[0], s1[1] + 12], [s0[0], s0[1] + 4]]);
  for (let k = 1; k < 7; k++) {
    const p = lerpPt(s0, s1, k / 7);
    b.rect(CM.line, p[0] - 7, p[1] + 1, 7, 2);
  }
  // an inner glazed door on the back wall, a picture, the runner on the floor, a coat on its hook
  const iw = (bxr - bxl) * 0.34;
  const ix = bxl + (bxr - bxl) * 0.3;
  b.rect(CM.line, ix, byb - (byb - byt) * 0.78, iw, (byb - byt) * 0.78);
  b.rect(CM.lamp, ix + 3, byb - (byb - byt) * 0.74, iw - 6, (byb - byt) * 0.4);
  b.rect(CM.paper, bxl + 4, byt + 26, 14, 11);
  b.rect(CM.brick, bxl + 6.5, byt + 28.5, 9, 6);
  b.poly(CM.brick, [deep(D.x0 + 18, G, 0.05), deep(D.x1 - 22, G, 0.05), deep(D.x1 - 22, G, back - 0.2), deep(D.x0 + 18, G, back - 0.2)]);
  b.poly(CM.coatMustard, [deep(D.x0 + 22, G, 0.05), deep(D.x0 + 26, G, 0.05), deep(D.x0 + 26, G, back - 0.2), deep(D.x0 + 22, G, back - 0.2)]);
  b.poly(CM.coatMustard, [deep(D.x1 - 30, G, 0.05), deep(D.x1 - 26, G, 0.05), deep(D.x1 - 26, G, back - 0.2), deep(D.x1 - 30, G, back - 0.2)]);
  const hook = deep(xr - 1, 935, 2.4);
  b.fill(CM.sage, `M${P(hook[0] - 2, hook[1])}L${P(hook[0] + 3, hook[1] + 4)}L${P(hook[0] + 5, hook[1] + 58)}L${P(hook[0] - 9, hook[1] + 60)}L${P(hook[0] - 8, hook[1] + 6)}Z`);
  b.rect(CM.coatMustard, hook[0] - 6, hook[1] + 4, 4, 34);
  b.fill(CM.coatOat, ovalPath(hook[0] - 1, hook[1] - 4, 6, 4));
  // the pendant
  const pend = deep((D.x0 + D.x1) / 2 + 4, 893, 2.2);
  b.ink(`M${P(pend[0], D.y0 - 2)}L${P(pend[0], pend[1] - 4)}`, 1.2, CM.line);
  b.fill(CM.coatMustard, domePath(pend[0], pend[1], 8, 7));
  b.fill(CM.lampCore, ovalPath(pend[0], pend[1] + 1.5, 4, 2));
  b.ink(`M${P(deep(xr, G, back)[0], deep(xr, G, back)[1])}L${P(xr, G)}`, 1.2, CM.line);
  return b;
}

/** The leaf's swing (0 shut .. 1 open). Opening: doorOpenK. Closing (doorOpenK's own window 34.66-34.75): a
 *  door-closer curve, most of the swing in the first frames, so the leaf covers her doorway the frame she is through
 *  (herIn 34.68: the cast stops drawing her), then it settles onto the latch. */
const CLOSE_T0 = L(34.66);
const CLOSE_KEYS: [number, number][] = [
  [0, 1],
  [0.07, 0.955],
  [0.26, 0.33],
  [0.45, 0.16],
  [0.63, 0.07],
  [0.82, 0.02],
  [1, 0],
];
function swingAt(t: number): number {
  const k = doorOpenK(t);
  if (t < CLOSE_T0 || k <= 0) return k;
  const p = clamp((t - CLOSE_T0) / (S8T.doorShuts - CLOSE_T0));
  for (let i = 0; i < CLOSE_KEYS.length - 1; i++) {
    const [p0, v0] = CLOSE_KEYS[i];
    const [p1, v1] = CLOSE_KEYS[i + 1];
    if (p <= p1) return lerp(v0, v1, (p - p0) / (p1 - p0));
  }
  return 0;
}

/** The leaf as a quad at swing k (0 shut .. 1 open): hinged on the left jamb, swinging IN; its free edge goes deeper
 *  (toward the lane VP), so the quad narrows and the free edge shortens. null once it is edge-on behind the jamb. */
function leafQuad(k: number): [Pt, Pt, Pt, Pt] | null {
  const th = (k * Math.PI) / 2;
  const m = (DW / PXM) * Math.sin(th);
  const [xf, yt] = deep(D.x0 + DW * Math.cos(th), D.y0, m);
  const [, yb] = deep(D.x0 + DW * Math.cos(th), D.y1, m);
  if (xf < D.x0 + 3) return null;
  return [
    [D.x0, D.y0],
    [xf, yt],
    [xf, yb],
    [D.x0, D.y1],
  ];
}

/** Her teal leaf: four panels, the brass knocker, knob and letterbox, mapped onto the swing quad. */
function leafInto(k: number, jolt: number): Batch {
  const b = new Batch();
  const q = leafQuad(k);
  if (!q) return b;
  const pm = new PlaneMap(DW, DH, q);
  const R = (u: number, v: number, w: number, h: number) => pm.q(u, v, w, h);
  b.poly(CM.hero, R(0, 0, DW, DH));
  const panels = [
    [0.12, 0.07, 0.36],
    [0.56, 0.07, 0.36],
    [0.12, 0.54, 0.38],
    [0.56, 0.54, 0.38],
  ];
  b.layer();
  for (const [u, v, h] of panels) b.poly(CM.shadeWarm, R(DW * u, DH * v, DW * 0.32, DH * h));
  b.layer();
  for (const [u, v, h] of panels) b.poly(CM.hero, R(DW * u + 3, DH * v + 3, DW * 0.32 - 6, DH * h - 6));
  b.layer();
  b.poly(CM.coatMustard, R(DW * 0.34, DH * 0.475, DW * 0.32, 4));
  const kn = pm.p(DW * 0.86, DH * 0.52);
  const sx = Math.max(0.15, (q[1][0] - q[0][0]) / DW);
  b.fill(CM.coatMustard, ovalPath(kn[0], kn[1], 4 * sx, 4));
  const kc = pm.p(DW * 0.5 + jolt * 0.5, DH * 0.31 - jolt);
  b.fill(CM.coatMustard, ovalPath(kc[0], kc[1], 6.8 * sx, 7.6));
  b.fill(CM.coatMustard, ovalPath(kc[0], kc[1] - 8, 2.7 * sx, 2.7));
  b.layer();
  b.fill(CM.hero, ovalPath(kc[0], kc[1] + 1, 3.6 * sx, 4.5));
  // ink: the free edge and the hinge edge, the panel mouldings (loose)
  let d = line(q[1][0], q[1][1], q[2][0], q[2][1], {seed: 's8h/leaf/free', over: [2, 6]});
  d += line(q[0][0] + 1, q[0][1], q[3][0] + 1, q[3][1], {seed: 's8h/leaf/hinge', over: [0, 4]});
  b.ink(d, INK_PX.far);
  return b;
}

// ---------------------------------------------------------------- S8House

/** The leaf is drawn in S8House (under her) before this time and after the latch; S8DoorLeaf draws it between. */
const LEAF_SPLIT = L(34.63);

/** The waterer's can: tips once, on 33.5 (film), early in her walk (never in the board's beats). */
const waterTip = (t: number) => bump(t, L(33.5), 0.9);
/** The pigeons on the neighbour's parapet: perched, a slow nod (no shuffle, no flutter: tier C life, calm). */
const PIGEONS = [1066, 1094, 1122, 1149];

/** THE FACADE'S SHADE (lib/light Shade, CRAFT §d; THROUGHLINE §5): her row faces us, away from the sun ahead, so the
 *  whole facade is one form step down (the end wall's side, turned toward the low sun, keeps its light: a lit sliver
 *  that shows the house's depth); lit panes, lit fanlights and, while the door is open, the lit hall are holes (each
 *  drawn the other way round: nonzero), and W, the lamps' glass, the festoon and the forecourt draw after it. */
function facadeShadeD(doorOpen: boolean): string {
  const rect = (x: number, y: number, w: number, h: number) => `M${P(x, y)}H${r1(x + w)}V${r1(y + h)}H${r1(x)}Z`;
  const hole = (x: number, y: number, w: number, h: number) => `M${P(x, y)}V${r1(y + h)}H${r1(x + w)}V${r1(y)}Z`;
  let d = rect(HH.x0 - 4, HH.top, HH.x1 - HH.x0 + 4, G - HH.top) + rect(NB.x0, NB.top, NB.x1 - NB.x0, G - NB.top) + rect(TH.x0, TH.top, TH.x1 - TH.x0 + 20, G - TH.top);
  for (const [x, y, w, h] of LIT_PANES) d += hole(x, y, w, h);
  for (const [cx, y, r] of LIT_DOMES) d += `M${P(cx + r, y)}A${r1(r)} ${r1(r)} 0 0 0 ${P(cx - r, y)}Z`;
  if (doorOpen) d += hole(D.x0, D.y0, DW, DH);
  return d;
}

export const S8House: React.FC = () => {
  const t = useTime();
  const hallClip = 'hc' + useId().replace(/[^a-zA-Z0-9]/g, '');
  const beyond = useMemo(() => beyondInto(), []);
  const facade = useMemo(() => facadeInto(), []);
  const fronts = useMemo(() => frontsInto(), []);
  const forecourt = useMemo(() => forecourtInto(), []);
  const wins = useMemo(() => windowsInto(), []);
  // her door: the hall while it is open; the leaf shut or opening (under her); the closing swing is S8DoorLeaf's
  const k = swingAt(t);
  const latched = t >= S8T.doorShuts;
  const jolt = latched && t < S8T.doorShuts + 2 / 60 ? 3 : 0;
  const leaf = t < LEAF_SPLIT || latched ? leafInto(latched ? 0 : k, jolt) : null;
  // the hall's light on her steps while the door is open (through the gap between the leaf's free edge and the jamb)
  let spill: Batch | null = null;
  if (k > 0) {
    const q = leafQuad(k);
    const xa = q ? q[1][0] : D.x0;
    spill = new Batch();
    spill.poly(CM.lamp, [
      [xa, G],
      [D.x1, G],
      [D.x1 + 10, G + 18],
      [xa - 4 + (D.x1 - xa) * 0.15, G + 18],
    ]);
  }
  // the pigeons on the neighbour's parapet (perched, nodding)
  const pg = new Batch();
  PIGEONS.forEach((x0, i) => pigeonInto(pg, x0, NB.top, 19, i % 2 ? -1 : 1, t, i * 1.7 + 0.4));
  // her carriage lamp (on from the start: every light but the run's), the festoon (on from the start)
  const cl = useMemo(() => {
    const b = new Batch();
    carriageInto(b, CARRIAGE_L.x, CARRIAGE_L.y, 26, true, 's8h/cL');
    return b;
  }, []);
  const festoonT0 = lampRunAt('festoon') - FESTOON_FIRST_IN_FRAME * FESTOON_STEP;
  let before = 0;
  const festoon = FESTOON.map((s, j) => {
    const at = festoonT0 + before * FESTOON_STEP;
    before += s.n;
    return <StringLights key={j} from={s.from} to={s.to} sag={s.sag} n={s.n} seed={`s8h/fest${j}`} onAt={at} step={FESTOON_STEP} runDir={-1} r={4.6} w={INK_PX.hair} />;
  });
  return (
    <Tier tier="environment">
      <S8Plane p="house">
        <defs>
          <clipPath id={hallClip} clipPathUnits="userSpaceOnUse">
            <rect x={D.x0} y={D.y0} width={DW} height={DH} />
          </clipPath>
        </defs>
        {/* beyond the bend (+1): the row, its cafe, the tree; its street lamp (on from the start) */}
        <Paint b={beyond.b} seed="s8h/beyond" misreg={false} />
        <Lamp x={622} y={943} h={84} seed="s8h/farLamp" on color={recede(IRON, 1, S8_ATM)} />
        {/* the canal-side lamps whose heads show over the board (the run's last switch-on, f2273) */}
        {CANAL_LAMPS.map((c) => (
          <Lamp key={c.id} x={c.x} y={c.y} h={c.h} seed={`s8h/${c.id}`} on={t >= lampRunAt(c.id)} color={IRON} />
        ))}
        {/* the terrace */}
        <Paint b={facade} seed="s8h/facade" misreg={false} />
        <Paint b={wins} seed="s8h/windows" misreg={false} />
        <EarlyExit>
          <WindowPerson x={896} y={GWIN.y + GWIN.h - 1} hb={46} seed="s8h/waterer" act="water" tip={waterTip(t)} traits={{hair: 'short', hairColor: CM.hair[3], coat: CM.coatMustard}} />
          <WindowPerson x={NB_BAL.x + 34} y={NB_BAL.y + NB_BAL.h - 26} hb={42} seed="s8h/reader" act="read" traits={{hair: 'curls', hairColor: CM.hair[0], coat: CM.coatOat}} />
          <WindowPerson x={NB_GWIN.x + 62} y={NB_GWIN.y + NB_GWIN.h * 0.56} hb={40} seed="s8h/phone" act="phone" view="profile" traits={{hair: 'long', hairColor: CM.hair[2], coat: CM.coatSlate}} />
        </EarlyExit>
        <Paint b={fronts} seed="s8h/fronts" misreg={false} />
        {/* her door: the lit hall (under her), the leaf shut / opening (tier B) */}
        {k > 0 ? (
          <g clipPath={`url(#${hallClip})`}>
            <Paint b={hallInto()} seed="s8h/hall" misreg={false} />
          </g>
        ) : null}
        {leaf ? (
          <Tier tier="support">
            <Paint b={leaf} seed="s8h/leaf" misreg={false} />
          </Tier>
        ) : null}
        {/* the facade turned from the sun: one form step (lit panes, fanlights, the open door are holes) */}
        <Shade d={facadeShadeD(k > 0)} />
        {/* lamps on the facade, the festoon */}
        <Paint b={cl} seed="s8h/carriage" misreg={false} />
        <EarlyExit>
          {festoon}
          <StringLights from={[NB_BAL.x - 16, NB_BAL.y + NB_BAL.h - 30]} to={[NB_BAL.x + NB_BAL.w + 16, NB_BAL.y + NB_BAL.h - 31]} sag={6} n={7} seed="s8h/balLights" on r={3.2} w={INK_PX.hair} />
        </EarlyExit>
        {/* the forecourt and the heritage lamp (nearest), then the pigeons; their contact strips are in the house
            band's shadow layer (V2S8_set HouseBand, HOUSE_CONTACTS): the forecourt lies in her house's shade, so they
            cast nothing more */}
        <Paint b={forecourt} seed="s8h/forecourt" misreg={false} />
        {spill ? <Paint b={spill} seed="s8h/spill" misreg={false} /> : null}
        <Lamp x={HOUSE_LAMP.x} y={HOUSE_LAMP.y} h={HOUSE_LAMP.h} seed="s8h/houseLamp" on={t >= lampRunAt('houseLamp')} color={IRON} />
        <EarlyExit>
          <Paint b={pg} seed="s8h/pigeons" misreg={false} />
        </EarlyExit>
      </S8Plane>
    </Tier>
  );
};

/** Contact strips for the forecourt's things (house plane, landing coords): pots on her step, the bay's tub, the bike,
 *  the boot scraper, the bins, the heritage lamp's foot. Drawn in the house band's ONE shadow layer (V2S8_set), under
 *  the things, so they never double-darken her house's cast shade. */
export const HOUSE_CONTACTS: {x: number; y: number; w: number; h?: number}[] = [
  {x: D.x0 - 6, y: G + 1, w: 24, h: 6},
  {x: D.x1 + 8, y: G + 1, w: 24, h: 6},
  {x: 802, y: G + 3, w: 24, h: 6},
  {x: 628, y: G + 11, w: 64, h: 7},
  {x: 656, y: G + 6, w: 22, h: 6},
  {x: 1092, y: G + 3, w: 40, h: 8},
  {x: 1140, y: G + 3, w: 40, h: 8},
  {x: HOUSE_LAMP.x, y: HOUSE_LAMP.y + 1, w: 50, h: 9},
];

// ---------------------------------------------------------------- S8Window: W

/** W's room: TerraceRow's French window for her house (frame, room, blind up, shelf, standard lamp, plants). */
function roomInto(lit: boolean): Batch {
  const b = new Batch();
  const F = W8;
  const fx = WX0;
  const fy = WY0;
  b.rect(CM.hero, fx - WFR, W_HEAD, F.w + 2 * WFR, F.h + fy - W_HEAD);
  if (lit) {
    // the lit room: ONE flat lamp-lit fill (CM.lamp, L* 85.1: a LitWindow value, no glow core)
    b.rect(CM.lamp, fx, fy, F.w, F.h);
  } else {
    // dim: the glass holds the dusk, the room a cool shade, its things dark shapes
    b.rect(CM.glass, fx, fy, F.w, F.h);
    b.poly(CM.shadeCool, [
      [fx, fy + F.h * 0.42],
      [fx + F.w, fy + F.h * 0.26],
      [fx + F.w, fy + F.h],
      [fx, fy + F.h],
    ]);
  }
  b.rect(CM.coatOat, fx, fy, F.w, F.h * 0.06);
  for (let s2 = 0; s2 < 2; s2++) {
    const sy = fy + F.h * (0.3 + s2 * 0.18);
    b.rect(lit ? CM.line : CM.paneUnlit, fx + F.w * 0.55, sy, F.w * 0.4, F.h * 0.02);
    for (let bk = 0; bk < 5; bk++) b.rect(lit ? [CM.brick, CM.coatMustard, CM.sage, CM.paneUnlit, CM.box][(bk + s2) % 5] : CM.paneUnlit, fx + F.w * (0.57 + bk * 0.075), sy - F.h * 0.08, F.w * 0.055, F.h * 0.08);
  }
  b.fill(lit ? CM.coatMustard : CM.paneUnlit, domePath(fx + F.w * 0.2, fy + F.h * 0.32, F.w * 0.09, F.h * 0.06));
  b.rect(CM.anchor, fx + F.w * 0.195, fy + F.h * 0.32, Math.max(1.5, F.w * 0.015), F.h * 0.6);
  b.fill(lit ? CM.sage : CM.paneUnlit, lobes(fx + F.w * 0.02, fx + F.w * 0.3, fy + F.h, F.h * 0.3, 's8w/herplant', 3));
  return b;
}

/** W's front: the glazing bars, the bottom rail and the Juliet rail over her; the frame ink (no upward overshoot). */
function wFrontInto(): Batch {
  const b = new Batch();
  const F = W8;
  const fx = WX0;
  const fy = WY0;
  b.rect(CM.hero, fx + F.w * 0.48, fy, F.w * 0.04, F.h);
  b.rect(CM.hero, fx, fy + F.h * 0.62, F.w, F.w * 0.035);
  b.rect(CM.hero, fx - WFR, fy + F.h - F.w * 0.02, F.w + 2 * WFR, F.w * 0.07);
  const ry = fy + F.h * 0.6;
  b.rect(CM.anchor, fx - F.w * 0.1, ry, F.w * 1.2, Math.max(2, F.w * 0.025));
  for (let bx = fx - F.w * 0.08; bx <= fx + F.w * 1.08; bx += F.w * 0.09) b.rect(CM.anchor, bx, ry, Math.max(1.2, F.w * 0.012), fy + F.h - ry);
  // the frame's outline: ONE closed path (CRAFT §c), authored at INK_PX.mid (the pen draws it 3.0 px on tier A, in
  // the teal's own deep shade; none on tier B)
  const x0 = fx - WFR;
  const x1 = fx + F.w + WFR;
  const y1 = fy + F.h + F.w * 0.05;
  b.layer();
  b.ink(`M${P(x0, W_HEAD + 1)}H${r1(x1)}V${r1(y1)}H${r1(x0)}Z`, INK_PX.mid, CM.ink, 0, {tone: CM.hero});
  return b;
}

/** W's tier (CRAFT §b, THROUGHLINE §4 S8): A while it is the beat (34.55-34.95: she goes in, it lights; and from "not"
 *  37.70 to the end: the film's last picture), B otherwise. */
const wTier = (t: number): TierT => ((t >= L(34.55) && t < S8T.wLights) || t >= S8T.not ? 'subject' : 'support');

/** Her silhouette's walk in W (scene s): in from behind the left wall at 35.85, a pause, a short pace back. */
const HW = {h: 140, feet: WY0 + W8.h - 4};
const HW_KEYS: [number, number][] = [
  [S8T.herInWindow, WX0 - 17],
  [S8T.herInWindow + 1.7, 870],
  [S8T.herInWindow + 2.12, 870],
  [S8T.herInWindow + 3.02, 838],
];
function herWalk(t: number): {x: number; dir: 1 | -1; moving: boolean} | null {
  if (t < HW_KEYS[0][0]) return null;
  for (let i = 0; i < HW_KEYS.length - 1; i++) {
    const [t0, x0] = HW_KEYS[i];
    const [t1, x1] = HW_KEYS[i + 1];
    if (t < t1) {
      if (x1 === x0) return {x: x0, dir: i > 0 && HW_KEYS[i - 1][1] > x0 ? -1 : 1, moving: false};
      return {x: lerp(x0, x1, smooth01((t - t0) / (t1 - t0))), dir: x1 > x0 ? 1 : -1, moving: true};
    }
  }
  const n = HW_KEYS.length;
  return {x: HW_KEYS[n - 1][1], dir: HW_KEYS[n - 1][1] > HW_KEYS[n - 2][1] ? 1 : -1, moving: false};
}

export const S8Window: React.FC = () => {
  const t = useTime();
  const clip = 'wc' + useId().replace(/[^a-zA-Z0-9]/g, '');
  const lit = flickOn(t, S8T.wLights);
  const room = useMemo(() => roomInto(lit), [lit]);
  const front = useMemo(() => wFrontInto(), []);
  const w = herWalk(t);
  const g = bump(t, L(36.9) + 0.22, 0.45);
  return (
    <LateExit>
      <Tier tier={wTier(t)}>
      <S8Plane p="house">
        <defs>
          <clipPath id={clip} clipPathUnits="userSpaceOnUse">
            <rect x={WX0} y={WY0} width={W8.w} height={W8.h} />
          </clipPath>
        </defs>
        <Paint b={room} seed="s8w/room" misreg={false} />
        {w ? (
          <g clipPath={`url(#${clip})`}>
            <ExitSync seed="fig/s8herWin">
              <Person
                x={w.x}
                y={HW.feet}
                h={HW.h}
                exact
                seed="s8herWin"
                traits={HER}
                model={{...HER, coat: CM.anchor, mono: CM.anchor, tote: undefined, vent: false}}
                pose="phoneEar"
                gesture={g}
                view="profile"
                step={w.moving ? 1.6 * drawn(t, 12) : undefined}
                stride={0.7}
                flip={w.dir > 0}
                ink={0}
                exactFill
                noSync
              />
            </ExitSync>
          </g>
        ) : null}
        <Paint b={front} seed="s8w/front" misreg={false} />
      </S8Plane>
      </Tier>
    </LateExit>
  );
};

// ---------------------------------------------------------------- S8DoorLeaf: the closing swing, over her

export const S8DoorLeaf: React.FC = () => {
  const t = useTime();
  const k = swingAt(t);
  if (t < LEAF_SPLIT || t >= S8T.doorShuts || k <= 0) return null;
  return (
    <Tier tier="support">
      <S8Plane p="house">
        <Paint b={leafInto(k, 0)} seed="s8h/leaf" misreg={false} />
      </S8Plane>
    </Tier>
  );
};
