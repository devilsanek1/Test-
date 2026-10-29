// V2S1 world (lane L1): GOOGLE'S CANAL WING, frontal and close (TREATMENT section 4 layout, map S1_SHEET): light brick,
// slim limestone fins, tall slate-framed glass, TWO storeys under a planted roof terrace (planting never above y 575,
// the parapet 600 -> 640), the glass double door x 540-720 y 848-1082 under a canopy fascia 520-740 x 800-845
// hand-lettered "Google" (ink, no logo; letters pop one by one from 0.97), and W = her office window (860, 700)
// 150 x 170 EXACT: lamp-lit until 0.40, then plum dark, still reading as her office (stone frame, glazing bars in ink,
// her switched-off anglepoise, a chair back and a shelf one step lighter than the plum, a glint, and the RING her potted
// plant left on the sill: the plant is under her arm). ~10 other panes switch on the seeded clock (every 0.6-1.5 s).
// Drawn flat in metres on the facade plane (the kit's S1 homography, s1Layout) so the slight 3/4 is true.
//   <S1Wing behindDoor={...} />   the facade + the lobby + (behindDoor) + the door's fixed frame
//   <S1DoorLeaves />              the two sliding glass leaves (after the wing): slide out 0.45 -> open 0.52, settle
//                                 0.58, PARKED over the brick door piers (still visible), shut behind her 0.97 -> 1.10
//   <S1WingLife />                pigeons at rest on the canopy and on a sill
// Kit defects worked around here (kit/canal/wing.tsx WingFront): coloured strokes (the plant blades in CM.line, the
// brick ticks in CM.brickDeep, W's plant ring in CM.line), leaves hidden in pockets, W a flat plum slab.
import React, {useMemo} from 'react';
import {CM, INK_PX} from '../../v2r/palette';
import {useTime, clamp} from '../../lib/time';
import {line, poly, glint} from '../../lib/sketch';
import {Batch, PlaneMap, P, Pt, rng, ovalPath, lobes, lerp, leafPath, domePath} from '../../v2r/kit/canal/core';
import {s1Layout} from '../../v2r/kit/canal/wing';
import {litAt, Pigeons} from '../../v2r/kit/canal/life';
import {HandLetteredGoogle} from '../../v2r/kit/canal/lettering';
import * as MAP from '../../v2r/world/map';
import {CellPaint, barPath, S1_IRON} from './V2S1_set_core';
import {Tier} from '../../lib/tier';
import {Fill} from '../../lib/Fill';
import {S1_DRAW, s1Bold, wIsSubject, doorIsSubject} from './V2S1_clock';
import {InkScale} from '../../lib/inkComp';
import {useSwitches} from './switches';
import {DARK, dark} from './darks';
import {LINE_UNTIL, lineOn} from './engine';
import {Look} from '../../lib/exit';

// ---------------------------------------------------------------- the layout (local metres: u east, v down)

/** The wing's lens, a touch steeper than the kit's (the art director, v3: the wing read dead level on a perspective
 *  floor): the coping falls 600 -> 656 and the base 1090 -> 1072 toward the left vanishing side, so the facade recedes
 *  with the ground; W's corners move <= 1.7 px (its map spot and the S2 push-through match hold), the door's spot too. */
const LAY0 = s1Layout();
const wingTop = (x: number) => 600 + (56 / 750) * (1080 - x);
const wingBase = (x: number) => 1090.2 - (18 / 750) * (1080 - x);
const LAY = {...LAY0, quad: [[330, wingTop(330)], [1104, wingTop(1104)], [1104, wingBase(1104)], [330, wingBase(330)]] as typeof LAY0.quad};
const PM = new PlaneMap(LAY.wM, LAY.hM, LAY.quad);
const uAt = (x: number) => PM.uAt(x, LAY.hM * 0.6);
const S = MAP.S1_SHEET;
const W = MAP.W;

/** Her window W in local metres (exact screen spot -> plane). */
const WU0 = uAt(W.x - W.w / 2);
const WU1 = uAt(W.x + W.w / 2);
const WV0 = PM.vAt(W.y - W.h / 2, (WU0 + WU1) / 2);
const WV1 = PM.vAt(W.y + W.h / 2, (WU0 + WU1) / 2);
/** The door (exact) and the canopy fascia. */
const DU0 = uAt(S.door.x0);
const DU1 = uAt(S.door.x1);
const DV0 = PM.vAt(S.door.y0, (DU0 + DU1) / 2);
const HM = LAY.hM;
/** Storeys: the first-storey glass from W's head to W's sill; the band to the ground storey top (y 794 at W). */
const V_HEAD = WV0;
const V_SILL = WV1;
const V_FLOOR = PM.vAt(S.groundStorey.y0, (WU0 + WU1) / 2);
const V_PLINTH = HM - 0.3;
const PITCH = WU1 - WU0 + 0.28;

type Bay = {u0: number; u1: number; split?: number; transom?: number};
/** First-storey bays (W excluded): the corner stair slit, two bays left of W, one right of W (cut by the edge). */
const UPPER: Bay[] = [
  {u0: 0.74, u1: 1.3},
  {u0: WU0 - 2 * PITCH, u1: WU1 - 2 * PITCH, split: 0.5, transom: 0.16},
  {u0: WU0 - PITCH, u1: WU1 - PITCH, split: 0.5, transom: 0.16},
  {u0: WU0 + PITCH, u1: WU1 + PITCH, split: 0.5, transom: 0.16},
];
/** Ground-storey bays: the corner slit, under W, right of it (the door piers are solid brick: the leaves park there). */
const PIER_L = {u0: 1.3, u1: DU0};
const PIER_R = {u0: DU1, u1: 5.6};
const LOWER: Bay[] = [
  {u0: 0.74, u1: 1.3, transom: 0.22},
  {u0: 5.6, u1: WU1, split: 0.5, transom: 0.22},
  {u0: WU1 + 0.28, u1: WU1 + 0.28 + (WU1 - WU0), split: 0.5, transom: 0.22},
];
/** Fins: u centre + whether it runs the full height (the one over the door stops at the band). */
const FINS: [number, boolean][] = [
  [(1.3 + UPPER[1].u0) / 2, true],
  [(UPPER[1].u1 + UPPER[2].u0) / 2, false],
  [(UPPER[2].u1 + WU0) / 2, true],
  [(WU1 + UPPER[3].u0) / 2, true],
];
const CORNER = 0.5;

const q = (u: number, v: number, w: number, h: number) => PM.q(u, v, w, h);
const p = (u: number, v: number) => PM.p(u, v);
/** Screen x of local u (along the facade's middle). */
export const s1WingX = (u: number) => p(u, HM * 0.6)[0];

// ---------------------------------------------------------------- the static facade

function facadeStatic(darks = false): Batch {
  const b = new Batch();
  const r = rng('s1wing');
  // ---- the roof-terrace planting over the coping (never above y 575): shrubs, grasses with seed heads, small trees
  const plant = new Batch();
  let u = 0.1;
  let i = 0;
  while (u < LAY.wM + 0.3) {
    const [x, y] = p(u, 0.0);
    const s = PM.pxPerM(Math.min(u, LAY.wM));
    const room = y - 577;
    const kind = r.int(0, 4);
    const wdt = s * r.range(0.4, 0.9);
    const hgt = Math.min(room, s * (kind === 4 ? r.range(0.34, 0.46) : kind === 3 ? r.range(0.26, 0.36) : r.range(0.14, 0.26)));
    if (hgt > 5) {
      const col = [CM.sage, CM.leafGold, CM.sage, CM.leafRust, CM.sage][(i + kind) % 5];
      if (kind === 4) {
        // a small multi-stem tree: two stems (thin fills) + a lobed crown
        b.fill(CM.line, barPath([x - 2, y + 1], [x - 4, y - hgt * 0.55], 2.2));
        b.fill(CM.line, barPath([x + 2, y + 1], [x + 5, y - hgt * 0.5], 2));
        b.fill(col, lobes(x - wdt * 0.62, x + wdt * 0.62, y - hgt * 0.42, hgt * 0.62, `s1plant/t${i}`, 3));
      } else if (kind === 2) {
        // ornamental grass: thin blade fills fanning up, oat seed heads
        for (let k = 0; k < 6; k++) {
          const bx = x - wdt * 0.35 + (k * wdt * 0.7) / 5;
          const tx = bx + (k - 2.5) * 2.2 + r.jitter(2);
          const ty = y - hgt * r.range(0.8, 1.05);
          b.fill(k % 2 ? CM.sage : CM.leafGold, leafPath((bx + tx) / 2, (y + ty) / 2, Math.hypot(tx - bx, ty - y), 1.6, (Math.atan2(ty - y, tx - bx) * 180) / Math.PI));
          if (k % 2 === 0) b.fill(CM.coatOat, leafPath(tx, ty, 7, 2.2, -80 + r.jitter(12)));
        }
      } else {
        b.fill(col, lobes(x - wdt / 2, x + wdt / 2, y + 2, hgt, `s1plant/${i}`, kind === 3 ? 3 : 2));
        plant.ink(lobeTop(x - wdt / 2, x + wdt / 2, y + 2, hgt, `s1plant/${i}`, kind === 3 ? 3 : 2), INK_PX.hair);
      }
    }
    u += r.range(0.32, 0.7);
    i++;
  }
  b.layer();
  // ---- the brick wall, in strips (the flood ripples across the facade), and its stone
  const strips = [0, CORNER, 1.3, UPPER[1].u0, UPPER[1].u1, UPPER[2].u0, UPPER[2].u1, WU0, WU1, UPPER[3].u0, LAY.wM];
  for (let k = 0; k < strips.length - 1; k++) {
    const a = strips[k];
    const c = strips[k + 1];
    b.poly(CM.brickLight, q(a - 0.01, 0, c - a + 0.02, HM));
  }
  b.layer();
  // (no brick coursing ticks: CRAFT §c, big areas flat)
  b.layer();
  // the coping cap, the band between the storeys (W's sill course), the plinth, each in strips
  for (let k = 0; k < strips.length - 1; k++) {
    const a = strips[k] - 0.01;
    const w = strips[k + 1] - strips[k] + 0.02;
    b.poly(CM.limestone, q(a, -0.02, w, 0.05));
    b.poly(CM.limestone, q(a, V_SILL, w, V_FLOOR - V_SILL));
    b.poly(darks ? dark('eave') : CM.stoneShade, q(a, V_FLOOR - 0.025, w, 0.025));
    b.poly(CM.limestone, q(a, V_PLINTH, w, HM - V_PLINTH));
    b.poly(darks ? dark('eave') : CM.stoneShade, q(a, V_PLINTH, w, 0.05));
    // (the look test's darks) the coping's drip shadow on the brick under the cap, the band's underside
    if (darks) b.poly(dark('eave'), q(a, 0.03, w, 0.035));
  }
  // the west corner pier (limestone) with its shade return
  b.poly(CM.limestone, q(0, 0, CORNER, HM));
  b.poly(CM.stoneShade, q(CORNER - 0.07, 0.03, 0.07, HM - 0.03));
  // a downpipe on the corner panel
  b.poly(darks ? dark('iron') : CM.shadeCool, q(CORNER + 0.1, 0.02, 0.06, HM - 0.02));
  for (let k = 0; k < 4; k++) b.poly(darks ? dark('deep') : CM.paneUnlit, q(CORNER + 0.085, 0.5 + k * 1.15, 0.09, 0.05));
  // (the look test's darks) cast-iron air bricks in the plinth, one under each pier, and the downpipe's shoe
  if (darks) {
    for (const u of [0.95, (1.3 + UPPER[1].u0) / 2, PIER_L.u0 + 0.4, PIER_L.u0 + 1.25, PIER_R.u0 + 0.42, PIER_R.u0 + 1.3, (WU1 + LOWER[2].u0) / 2, LOWER[2].u1 + 0.2, LOWER[1].u0 + 0.5, LOWER[2].u0 + 0.6]) b.poly(dark('iron'), q(u - 0.13, V_PLINTH + 0.1, 0.26, 0.11));
    b.poly(dark('deep'), q(CORNER + 0.06, HM - 0.16, 0.14, 0.1));
    // a pair of dark wall lanterns on the door piers, and the entry intercom on the right one
    for (const u of [DU0 - 0.34, DU1 + 0.22]) {
      b.poly(dark('iron'), q(u, V_FLOOR + 1.0, 0.13, 0.3));
      b.poly(dark('deep'), q(u - 0.02, V_FLOOR + 0.96, 0.17, 0.05));
    }
    b.poly(dark('iron'), q(DU1 + 0.24, V_FLOOR + 1.45, 0.1, 0.17));
  }
  b.layer();
  // window reveals (a shade strip on the left: the low sun is west = screen left) + slim stone sills / lintels
  for (const bay of UPPER) {
    b.poly(CM.stoneShade, q(bay.u0 - 0.06, V_HEAD, 0.06, V_SILL - V_HEAD));
    b.poly(darks ? dark('eave') : CM.shadeWarm, q(bay.u0 - (darks ? 0.045 : 0.03), V_HEAD, darks ? 0.045 : 0.03, V_SILL - V_HEAD));
  }
  for (const bay of LOWER) {
    b.poly(CM.stoneShade, q(bay.u0 - 0.06, V_FLOOR + 0.1, 0.06, V_PLINTH - V_FLOOR - 0.1));
    if (darks) b.poly(dark('eave'), q(bay.u0 - 0.045, V_FLOOR + 0.11, 0.045, V_PLINTH - V_FLOOR - 0.11));
    b.poly(CM.limestone, q(bay.u0 - 0.06, V_FLOOR + 0.04, bay.u1 - bay.u0 + 0.12, 0.07));
  }
  // the door bay: a stone surround (jambs + head), the shade in its left reveal
  b.poly(CM.limestone, q(DU0 - 0.12, DV0 - 0.1, 0.12, HM - DV0 + 0.1));
  b.poly(CM.limestone, q(DU1, DV0 - 0.1, 0.12, HM - DV0 + 0.1));
  b.poly(darks ? dark('eave') : CM.stoneShade, q(DU0, DV0, 0.07, HM - DV0));
  b.layer();
  // ---- fins: slim limestone (their short shades to the right are the light layer's: s1WingShadows)
  for (const [u, full] of FINS) {
    const v1 = full ? V_PLINTH : V_SILL;
    b.poly(CM.limestone, q(u - 0.065, 0.02, 0.13, v1 - 0.02));
  }
  // ---- the canopy slab: soffit shadow under the fascia, the fascia (sign face), its top band
  const F = S.canopyFascia;
  // the soffit is limestone; its one Shade step is the light layer's (s1WingShadows)
  // (the look test's darks: the canopy's underside, the awning's dark strip over the door)
  // (the look test's darks: the canopy's underside, the awning's dark strip over the door; a 3 px stone lip under the
  // fascia keeps the letters' descenders off it)
  b.rect(CM.limestone, F.x0 - 6, F.y1, F.x1 - F.x0 + 12, darks ? 3 : 8);
  if (darks) b.rect(dark('eave'), F.x0 - 6, F.y1 + 3, F.x1 - F.x0 + 12, 6);
  b.rect(darks ? dark('deep') : CM.stoneShade, F.x0 - 6, F.y1 + 8, F.x1 - F.x0 + 12, darks ? 4 : 3);
  b.rect(CM.paper, F.x0, F.y0, F.x1 - F.x0, F.y1 - F.y0);
  b.rect(CM.limestone, F.x0 - 10, F.y0 - 7, F.x1 - F.x0 + 20, 8);
  b.layer();
  // ---- window frames (slate, slim) for every bay, mullions + transoms as thin slate fills
  const frames: [Bay, number, number][] = [
    ...UPPER.map((bay) => [bay, V_HEAD + 0.02, V_SILL - 0.02] as [Bay, number, number]),
    ...LOWER.map((bay) => [bay, V_FLOOR + 0.12, V_PLINTH] as [Bay, number, number]),
  ];
  for (const [bay, va, vb] of frames) {
    const fw = 0.045;
    b.poly(S1_IRON, q(bay.u0, va, bay.u1 - bay.u0, fw));
    b.poly(S1_IRON, q(bay.u0, vb - fw * 1.4, bay.u1 - bay.u0, fw * 1.4));
    b.poly(S1_IRON, q(bay.u0, va, fw, vb - va));
    b.poly(S1_IRON, q(bay.u1 - fw, va, fw, vb - va));
    if (bay.split) b.poly(S1_IRON, q(bay.u0 + (bay.u1 - bay.u0) * bay.split - 0.025, va, 0.05, vb - va));
    if (bay.transom) b.poly(S1_IRON, q(bay.u0, va + (vb - va) * bay.transom, bay.u1 - bay.u0, 0.035));
  }
  // ---- the ink: coping, band, plinth, corner, fins, window frames + bars, canopy, door surround (loose, open)
  let st = '';
  const lineL = (a: Pt, c: Pt, seed: string, over: [number, number] | 'small' | 'medium' = 'medium') => line(a[0], a[1], c[0], c[1], {seed, over});
  st += lineL(p(0, -0.02), p(LAY.wM, -0.02), 's1w/cop', [26, 6]);
  st += lineL(p(0, V_SILL), p(LAY.wM, V_SILL), 's1w/band0');
  st += lineL(p(0, V_PLINTH), p(LAY.wM, V_PLINTH), 's1w/plinth');
  st += line(...p(0, -0.04), ...p(0, HM), {seed: 's1w/corner', over: [4, 20]});
  b.ink(st, INK_PX.mid);
  let fr = '';
  fr += lineL(p(0, V_FLOOR), p(LAY.wM, V_FLOOR), 's1w/band1', 'small');
  fr += line(...p(CORNER, 0.06), ...p(CORNER, HM - 0.02), {seed: 's1w/corner2', over: 'small'});
  FINS.forEach(([u, full], k) => {
    const v1 = full ? V_PLINTH : V_SILL;
    fr += line(...p(u - 0.065, 0.05), ...p(u - 0.065, v1), {seed: `s1w/fin${k}`, over: 'small'});
    if (k % 2 === 0) fr += line(...p(u + 0.065, 0.12), ...p(u + 0.065, v1 - 0.1), {seed: `s1w/finr${k}`, over: 'small'});
  });
  for (const [bay, va, vb] of frames) {
    fr += poly(q(bay.u0, va, bay.u1 - bay.u0, vb - va), {closed: true, over: 'small', seed: `s1w/fr${bay.u0.toFixed(2)}/${va.toFixed(2)}`});
    // the sill line under each upper bay
  }
  // the canopy fascia + its top band (open at the lower right: 20-40 % open contours)
  fr += poly(
    [
      [F.x0 - 10, F.y0 - 7],
      [F.x1 + 10, F.y0 - 7],
      [F.x1 + 10, F.y0 + 1],
    ],
    {over: 'small', seed: 's1w/canopyTop'},
  );
  fr += poly(
    [
      [F.x1, F.y0 + 1],
      [F.x1, F.y1],
      [F.x0, F.y1],
      [F.x0, F.y0 + 1],
    ],
    {over: 'small', seed: 's1w/fascia'},
  );
  // the door surround
  fr += poly([p(DU0 - 0.12, HM), p(DU0 - 0.12, DV0 - 0.1), p(DU1 + 0.12, DV0 - 0.1), p(DU1 + 0.12, HM)], {over: 'small', seed: 's1w/doorsur'});
  b.ink(fr, INK_PX.far);
  let bars = '';
  for (const [bay, va, vb] of frames) {
    if (bay.split) {
      const um = bay.u0 + (bay.u1 - bay.u0) * bay.split;
      bars += line(...p(um, va + 0.02), ...p(um, vb - 0.02), {seed: `s1w/mu${bay.u0.toFixed(2)}${va.toFixed(1)}`, over: 'none'});
    }
    if (bay.transom) {
      const vt = va + (vb - va) * bay.transom;
      bars += line(...p(bay.u0 + 0.02, vt), ...p(bay.u1 - 0.02, vt), {seed: `s1w/tr${bay.u0.toFixed(2)}${va.toFixed(1)}`, over: 'none'});
    }
  }
  b.ink(bars, INK_PX.hair);
  b.add(plant);
  return b;
}

/** The scalloped top of lobes() as an open ink stroke (the outline of a shrub's crown, no base line). */
function lobeTop(x0: number, x1: number, base: number, hMax: number, seed: string, n: number): string {
  const d = lobes(x0, x1, base, hMax, seed, n);
  // lobes() = M base L ... A ... L base Z: keep the arcs (drop the base and the closing)
  const m = d.match(/^M[^L]*L([^A]*)(A.*)L[^L]*Z$/);
  if (!m) return '';
  return `M${m[1]}${m[2]}`;
}

// ---------------------------------------------------------------- panes (per frame: they switch)

/** One pane's interior on the plane (u0, v0, w, h in metres). Lit: warm, 40-70 % of the pane, a few things in it;
 *  unlit: the golden-hour glass mirroring the sky, the room as a slate band low; plus a few interior lines in ink. */
function paneInto(b: Batch, ink: string[], u0: number, v0: number, w: number, h: number, lit: boolean, seed: string, kind: number, darks = false) {
  const r = rng(seed);
  const qq = (a: number, c: number, ww: number, hh: number) => q(u0 + a * w, v0 + c * h, ww * w, hh * h);
  const pp = (a: number, c: number) => p(u0 + a * w, v0 + c * h);
  if (darks) {
    darkPaneInto(b, qq, pp, lit, seed, kind);
    return;
  }
  if (!lit) {
    b.poly(CM.glass, qq(0, 0, 1, 1));
    const lo = r.range(0.52, 0.66);
    // tier C: the room's tones stay mid (never a thin near-dark bar in a narrow pane)
    b.poly(S1_IRON, [pp(0, lo), pp(1, lo - r.range(0.08, 0.2)), pp(1, 1), pp(0, 1)]);
    b.poly('#868FA4', qq(0, 0.86, 1, 0.14));
    b.poly(CM.skyHigh, [pp(0.18, 0), pp(0.5, 0), pp(0.06, 0.42), pp(0, 0.42), pp(0, 0.26)]);
    b.poly(CM.paper, [pp(0.62, 0), pp(0.7, 0), pp(0.44, 0.28), pp(0.38, 0.28)]);
    return;
  }
  // one flat lamp value (no brighter core): the lit panes stay a step under W, the thread (critic G4)
  b.poly(CM.lamp, qq(0, 0, 1, 1));
  if (kind === 0) {
    // a pendant lamp over a long table
    b.poly(S1_IRON, [pp(0.36, 0.3), pp(0.64, 0.3), pp(0.56, 0.21), pp(0.44, 0.21)]);
    b.poly(CM.paper, qq(0.46, 0.3, 0.08, 0.03));
    b.poly(CM.brickLight, qq(0, 0.72, 1, 0.07));
    ink.push(line(...pp(0.5, 0), ...pp(0.5, 0.21), {seed: `${seed}/cord`, over: 'none'}));
  } else if (kind === 1) {
    // a shelf of books and a plant
    b.poly(CM.brickLight, qq(0.05, 0.44, 0.9, 0.035));
    for (let k = 0; k < 6; k++) b.poly(r.pick([CM.brickLight, CM.sage, CM.coatMustard, CM.glass, CM.box, CM.leafGold]), qq(0.08 + k * 0.12, 0.3 + r.range(0, 0.03), 0.08, 0.14));
    const [cx, cy] = pp(0.74, 0.9);
    const s = PM.pxPerM(u0) * w * 0.2;
    b.fill(CM.brick, `M${P(cx - s * 0.5, cy)}L${P(cx + s * 0.5, cy)}L${P(cx + s * 0.4, cy + s * 0.5)}L${P(cx - s * 0.4, cy + s * 0.5)}Z`);
    b.fill(CM.sage, lobes(cx - s, cx + s, cy, s * 1.7, `${seed}/pl`, 3));
    ink.push(line(...pp(0.05, 0.44), ...pp(0.95, 0.44), {seed: `${seed}/sh`, over: 'small'}));
  } else if (kind === 2) {
    // a big plant against the glass + a framed picture
    const [cx, cy] = pp(0.28, 1);
    const s = PM.pxPerM(u0) * w * 0.3;
    b.fill(CM.sage, lobes(cx - s, cx + s, cy - s * 0.3, s * 2.1, `${seed}/bp`, 4));
    b.poly(CM.brick, qq(0.17, 0.84, 0.24, 0.16));
    b.poly(CM.paper, qq(0.58, 0.22, 0.28, 0.22));
    b.poly(CM.leafGold, qq(0.62, 0.26, 0.2, 0.06));
    b.poly(CM.sage, qq(0.62, 0.33, 0.12, 0.07));
    ink.push(poly(qq(0.58, 0.22, 0.28, 0.22), {closed: true, over: 'none', seed: `${seed}/pic`}));
  } else {
    // a blind half down (slats as thin fills)
    const k = r.range(0.32, 0.5);
    b.poly(CM.coatOat, qq(0, 0, 1, k));
    for (let j = 1; j < 5; j++) b.poly(CM.stucco, qq(0, (k * j) / 5, 1, 0.012));
    b.poly(CM.line, qq(0, k - 0.02, 1, 0.025));
    ink.push(line(...pp(0.02, k), ...pp(0.98, k), {seed: `${seed}/bl`, over: 'none'}));
  }
  b.poly(CM.glass, [pp(1, 0), pp(1, 0.16), pp(0.84, 0)]);
}

type PaneQ = (a: number, c: number, ww: number, hh: number) => Pt[];
type PaneP = (a: number, c: number) => Pt;

/** (the look test's darks: pro_4_colour.md §3.1, §4) A pane the way the posters draw a window, a dark recess: unlit, the
 *  room is dark (10b's pane dark) under the glass's reflection of the sky, its sill a step lighter; lit, the lamp-lit
 *  room keeps its furniture in silhouette (one or two dark shapes, kept low and off W's centre: the lit panes stay a
 *  step under W); every pane carries the lintel's shadow at its head (the window's depth). */
function darkPaneInto(b: Batch, qq: PaneQ, pp: PaneP, lit: boolean, seed: string, kind: number) {
  const r = rng(`${seed}/dark`);
  if (!lit) {
    b.poly(CM.glass, qq(0, 0, 1, 1));
    const lo = r.range(0.32, 0.44);
    b.poly(dark('pane'), [pp(0, lo), pp(1, lo - r.range(0.06, 0.14)), pp(1, 1), pp(0, 1)]);
    // the sill inside (a desk edge catching the light): one step up from the room
    b.poly(CM.paneUnlit, qq(0, 0.88, 1, 0.05));
    b.poly(CM.skyHigh, [pp(0.18, 0), pp(0.5, 0), pp(0.1, lo * 0.92), pp(0, lo * 0.92), pp(0, 0.24)]);
    b.poly(CM.paper, [pp(0.62, 0), pp(0.7, 0), pp(0.5, lo * 0.66), pp(0.44, lo * 0.66)]);
  } else {
    b.poly(CM.lamp, qq(0, 0, 1, 1));
    // a small thing on the inside sill against the light (a mug, a pot)
    b.poly(dark('wood'), qq(0.78, 0.86, 0.1, 0.08));
    if (kind === 0) {
      // a pendant over a long table, two chair backs at it
      b.poly(dark('iron'), [pp(0.36, 0.3), pp(0.64, 0.3), pp(0.56, 0.21), pp(0.44, 0.21)]);
      b.poly(dark('wood'), qq(0, 0.72, 1, 0.07));
      b.poly(dark('wood'), qq(0.14, 0.6, 0.16, 0.24));
      b.poly(dark('wood'), qq(0.7, 0.62, 0.15, 0.22));
    } else if (kind === 1) {
      // a shelf of files and the back of a desk chair
      b.poly(dark('wood'), qq(0.05, 0.44, 0.9, 0.04));
      for (let k = 0; k < 3; k++) b.poly(k === 1 ? dark('eave') : dark('pane'), qq(0.12 + k * 0.16, 0.3 + r.range(0, 0.03), 0.12, 0.14));
      b.poly(dark('iron'), [pp(0.3, 1), pp(0.32, 0.7), pp(0.42, 0.62), pp(0.62, 0.62), pp(0.7, 0.7), pp(0.72, 1)]);
    } else if (kind === 2) {
      // a big plant against the glass in its pot, a dark picture frame
      b.poly(dark('wood'), qq(0.17, 0.84, 0.24, 0.16));
      const [cx, cy] = pp(0.29, 0.84);
      const [ex] = pp(0.52, 0.84);
      const s = Math.abs(ex - cx) * 0.9;
      b.fill(dark('leaf'), lobes(cx - s, cx + s, cy, s * 2.2, `${seed}/dbp`, 4));
      b.poly(dark('eave'), qq(0.58, 0.22, 0.28, 0.24));
      b.poly(CM.paper, qq(0.62, 0.27, 0.2, 0.14));
    } else {
      // a blind half down (its slats one fill), the room under it dark
      const k = r.range(0.32, 0.5);
      b.poly(CM.coatOat, qq(0, 0, 1, k));
      b.poly(dark('wood'), qq(0, k - 0.02, 1, 0.03));
      b.poly(dark('pane'), qq(0, 0.7, 1, 0.3));
    }
  }
  // the lintel's shadow on the glass, and the glass's corner glint under it
  b.poly(dark('eave'), qq(0, 0, 1, 0.07));
  b.poly(CM.glass, [pp(1, 0.07), pp(1, 0.2), pp(0.86, 0.07)]);
}

// ---------------------------------------------------------------- W, her office window

/** W's lamp clicks off (the first picture of "quit"). */
export const W_LAMP_OFF = MAP.S1_CLOCK.wLampOff;
/** From the lamp click W's plum pane (and its plum details) is in full colour at once, before the flood reaches the
 *  wing (~0.56): the first colour after the sun is W going dark (REVIEW_1 MUST 2: the click reads in the pale state). */
const W_DARK_FULL = [CM.anchor, CM.coatPlum] as const;

function wInto(b: Batch, inkF: string[], inkM: string[], dark: boolean) {
  const u0 = WU0;
  const v0 = WV0;
  const w = WU1 - WU0;
  const h = WV1 - WV0;
  const qq = (a: number, c: number, ww: number, hh: number) => q(u0 + a * w, v0 + c * h, ww * w, hh * h);
  const pp = (a: number, c: number) => p(u0 + a * w, v0 + c * h);
  // the stone surround and the deep reveal (the shade on the left and under the head)
  b.poly(CM.limestone, q(u0 - 0.1, v0 - 0.035, w + 0.2, h + 0.035));
  b.layer();
  if (dark) {
    b.poly(CM.anchor, qq(0, 0, 1, 1));
    // one step lighter than the plum: the shelf + box files, the chair back, the desk edge, the anglepoise she
    // switched off (arm up, shade tipped); all kept off W's very centre (the dive goes through it)
    b.poly(CM.coatPlum, qq(0.05, 0.27, 0.3, 0.025));
    // the box files as one stepped block (the dark slivers between them read as ticks)
    for (let k = 0; k < 3; k++) b.poly(CM.coatPlum, qq(0.07 + k * 0.085, 0.15 + [0, 0.015, 0.006][k], 0.086, 0.12 - [0, 0.015, 0.006][k]));
    b.poly(CM.coatPlum, qq(0, 0.78, 1, 0.03));
    b.fill(CM.coatPlum, `M${P(...pp(0.14, 1))}L${P(...pp(0.14, 0.64))}Q${P(...pp(0.24, 0.56))} ${P(...pp(0.34, 0.64))}L${P(...pp(0.34, 0.78))}L${P(...pp(0.3, 0.78))}L${P(...pp(0.3, 1))}Z`);
    b.fill(CM.coatPlum, `M${P(...pp(0.7, 0.78))}L${P(...pp(0.82, 0.78))}L${P(...pp(0.8, 0.75))}L${P(...pp(0.72, 0.75))}Z`);
    b.fill(CM.coatPlum, barPath(pp(0.76, 0.76), pp(0.8, 0.6), 3));
    b.fill(CM.coatPlum, barPath(pp(0.8, 0.6), pp(0.7, 0.5), 3));
    b.fill(CM.coatPlum, `M${P(...pp(0.64, 0.5))}L${P(...pp(0.73, 0.44))}L${P(...pp(0.76, 0.53))}Z`);
  } else {
    // lamp-lit: her desk lamp on (a flat pool on the desk, never a glow), the shelf of box files, the chair back
    b.poly(CM.lamp, qq(0, 0, 1, 1));
    b.poly(CM.lampCore, qq(0.36, 0.08, 0.58, 0.62));
    b.poly(CM.line, qq(0.05, 0.27, 0.3, 0.025));
    for (let k = 0; k < 3; k++) b.poly([CM.brick, CM.paneUnlit, CM.coatMustard][k], qq(0.07 + k * 0.085, 0.15 + [0, 0.015, 0.006][k], 0.086, 0.12 - [0, 0.015, 0.006][k]));
    b.poly(CM.brickLight, qq(0, 0.78, 1, 0.03));
    b.poly(CM.lampCore, [pp(0.62, 0.78), pp(0.96, 0.78), pp(0.9, 0.7), pp(0.7, 0.7)]);
    b.fill(CM.coatSlate, `M${P(...pp(0.14, 1))}L${P(...pp(0.14, 0.64))}Q${P(...pp(0.24, 0.56))} ${P(...pp(0.34, 0.64))}L${P(...pp(0.34, 0.78))}L${P(...pp(0.3, 0.78))}L${P(...pp(0.3, 1))}Z`);
    b.fill(CM.coatSlate, `M${P(...pp(0.7, 0.78))}L${P(...pp(0.82, 0.78))}L${P(...pp(0.8, 0.75))}L${P(...pp(0.72, 0.75))}Z`);
    b.fill(CM.coatSlate, barPath(pp(0.76, 0.76), pp(0.8, 0.6), 3));
    b.fill(CM.coatSlate, barPath(pp(0.8, 0.6), pp(0.7, 0.5), 3));
    b.fill(CM.coatSlate, `M${P(...pp(0.64, 0.5))}L${P(...pp(0.73, 0.44))}L${P(...pp(0.76, 0.53))}Z`);
    b.fill(CM.paper, ovalPath(...pp(0.705, 0.53), 3.5, 2.5));
  }
  // the glazing: two slim stone mullions near the sides (kept out of the dive's centre) as fills; their lines in ink
  b.layer();
  for (const a of [0.12, 0.88]) b.poly(CM.limestone, qq(a - 0.022, 0, 0.044, 1));
  b.poly(CM.limestone, qq(0, 0.94, 1, 0.06));
  // the sill: a projecting stone sill with its shadow, and the RING her plant left (a stain ring + a dropped leaf)
  b.poly(CM.limestone, q(u0 - 0.14, v0 + h, w + 0.28, 0.1));
  b.poly(CM.stoneShade, q(u0 - 0.14, v0 + h + 0.085, w + 0.28, 0.035));
  b.layer();
  // the ring her plant left: a stain ring one step darker than the sill with a pale dust-free centre and a dropped
  // leaf; sized to read at 216 px (~44 x 12 px), flat fills only (an inked ring read as a halo, critic G4)
  const [rx, ry] = pp(0.42, 1.04);
  const s = PM.pxPerM(u0 + w * 0.42);
  const RX = s * 0.24;
  const RY = s * 0.066;
  // (the ring itself is gone: under W it read as a pink lifebuoy / a halo ring, the art director on v3)
  b.fill(CM.sage, leafPath(rx + RX * 1.75, ry - 1.5, 16, 5, -18));
  // W's line: the frame, one closed path with no corner overshoot; the mullions, the sill, the shelf, the chair and the
  // lamp are flat fills (their lines and the overshoot ticks broke the short-stroke budget, critic G4)
  inkM.push(poly(qq(0, 0, 1, 1), {closed: true, over: 'none', seed: 's1W/frame'}));
}

// ---------------------------------------------------------------- the lobby behind the door

function lobbyStatic(darks = false): Batch {
  const b = new Batch();
  const du0 = DU0;
  const du1 = DU1;
  const dv0 = DV0;
  const dv1 = HM;
  b.poly(CM.lamp, q(du0, dv0, du1 - du0, dv1 - dv0));
  b.poly(CM.lampCore, q(du0 + 0.25, dv0, du1 - du0 - 0.5, (dv1 - dv0) * 0.46));
  b.poly(CM.stucco, q(du0, dv1 - 0.42, du1 - du0, 0.42));
  b.poly(CM.paving, q(du0, dv1 - 0.42, du1 - du0, 0.06));
  // the reception counter (wood) on the left, a tall plant in the left corner, three pendants
  b.poly(darks ? dark('wood') : CM.line, q(du0 + 0.42, dv1 - 1.12, 0.62, 0.72));
  b.poly(CM.leafGold, q(du0 + 0.42, dv1 - 1.12, 0.62, 0.07));
  const [plx, ply] = p(du0 + 0.2, dv1 - 0.42);
  const pls = PM.pxPerM(du0);
  b.fill(darks ? dark('wood') : CM.brickDeep, `M${P(plx - pls * 0.16, ply)}L${P(plx + pls * 0.16, ply)}L${P(plx + pls * 0.12, ply - pls * 0.34)}L${P(plx - pls * 0.12, ply - pls * 0.34)}Z`);
  b.fill(CM.sage, lobes(plx - pls * 0.3, plx + pls * 0.3, ply - pls * 0.34, pls * 1.05, 's1lobby/plant', 3));
  for (let j = 0; j < 3; j++) {
    const [lx, ly] = p(du0 + (du1 - du0) * (0.22 + j * 0.28), dv0 + 0.34);
    b.fill(darks ? dark('iron') : S1_IRON, domePath(lx, ly, 7, 6));
    b.fill(CM.lampCore, ovalPath(lx, ly + 1.5, 4.5, 2));
  }
  let d = '';
  for (let j = 0; j < 3; j++) {
    const [lx, ly] = p(du0 + (du1 - du0) * (0.22 + j * 0.28), dv0 + 0.34);
    const [, ty] = p(du0 + (du1 - du0) * (0.22 + j * 0.28), dv0);
    d += `M${P(lx, ty)}L${P(lx, ly - 6)}`;
  }
  b.ink(d, INK_PX.hair);
  b.ink(line(...p(du0 + 0.4, dv1 - 1.12), ...p(du0 + 1.06, dv1 - 1.12), {seed: 's1lobby/counter', over: 'small'}) + line(...p(du0, dv1 - 0.42), ...p(du1, dv1 - 0.42), {seed: 's1lobby/skirt', over: 'none'}), INK_PX.hair);
  return b;
}

/** The door's fixed frame: the head transom, the jambs, the threshold (slate), drawn over the lobby and her. */
function doorFrameStatic(darks = false): Batch {
  const b = new Batch();
  // (the look test's darks: the door's slate frame dark iron, its threshold the deepest; the subject's tier draws them
  // as authored, so they are DARK's shown values, not forTier's)
  const frame = darks ? DARK.iron : CM.paneUnlit;
  b.poly(frame, q(DU0, DV0, DU1 - DU0, 0.07));
  b.poly(frame, q(DU0, DV0, 0.05, HM - DV0));
  b.poly(frame, q(DU1 - 0.05, DV0, 0.05, HM - DV0));
  b.poly(darks ? DARK.deep : CM.stoneShade, q(DU0 - 0.12, HM - 0.05, DU1 - DU0 + 0.24, 0.05));
  b.ink(poly(q(DU0, DV0, DU1 - DU0, HM - DV0), {over: 'small', seed: 's1w/dooropen'}), INK_PX.mid);
  return b;
}

// ---------------------------------------------------------------- the wing

/** The life budget's window switches: one at a time, >= 2 s apart (the far terrace's at 1.80, this one at 3.90). */
const WING_SWITCH = {pane: 6, at: 3.9} as const;

export const S1Wing: React.FC<{behindDoor?: React.ReactNode}> = ({behindDoor}) => {
  const t = useTime();
  const sw = useSwitches();
  const {darks} = sw;
  const stat = useMemo(() => facadeStatic(darks), [darks]);
  const lobby = useMemo(() => lobbyStatic(darks), [darks]);
  const frame = useMemo(() => doorFrameStatic(darks), [darks]);
  // panes (per frame: one somewhere switches every 0.6-1.5 s)
  const dyn = new Batch();
  const inkP: string[] = [];
  const panes: [number, number, number, number][] = [];
  for (const bay of UPPER) {
    const va = V_HEAD + 0.065;
    const vb = V_SILL - 0.083;
    const parts = bay.split ? [[bay.u0 + 0.045, bay.u0 + (bay.u1 - bay.u0) * bay.split - 0.025], [bay.u0 + (bay.u1 - bay.u0) * bay.split + 0.025, bay.u1 - 0.045]] : [[bay.u0 + 0.045, bay.u1 - 0.045]];
    for (const [a, c] of parts) panes.push([a, va, c - a, vb - va]);
  }
  for (const bay of LOWER) {
    const va = V_FLOOR + 0.165;
    const vb = V_PLINTH - 0.063;
    const parts = bay.split ? [[bay.u0 + 0.045, bay.u0 + (bay.u1 - bay.u0) * bay.split - 0.025], [bay.u0 + (bay.u1 - bay.u0) * bay.split + 0.025, bay.u1 - 0.045]] : [[bay.u0 + 0.045, bay.u1 - 0.045]];
    for (const [a, c] of parts) panes.push([a, va, c - a, vb - va]);
  }
  panes.forEach(([u0, v0, w, h], k) => {
    const lit = k === WING_SWITCH.pane ? t >= WING_SWITCH.at : litAt(0, 's1wing', k, panes.length, {litFrac: 0.55});
    paneInto(dyn, inkP, u0, v0, w, h, lit, `s1pane/${k}/${lit ? 'L' : 'U'}`, k % 4, darks);
  });
  // tier C: the panes carry no lines (their cords, shelves and frames were short strokes, critic G4); inkP unused
  void inkP;
  // W: lamp-lit, then plum dark from the lamp click (one frame)
  const wb = new Batch();
  const wInkF: string[] = [];
  const wInkM: string[] = [];
  wInto(wb, wInkF, wInkM, t >= W_LAMP_OFF);
  // every W line in the shade of the pane it bounds (CRAFT §c: never one near-black ink): the lamp's, then the plum's
  const wTone = t >= W_LAMP_OFF ? CM.anchor : CM.lamp;
  wb.ink(wInkF.join(''), INK_PX.far, CM.ink, 0, {tone: wTone});
  wb.ink(wInkM.join(''), INK_PX.mid, CM.ink, 0, {tone: wTone});
  const F = S.canopyFascia;
  return (
    <>
      {/* the west end wall: lit (it faces the low western sun), the wing a block in the one camera */}
      <Fill d={s1SideWall()} color={SIDE_LIT} offset={false} seed="s1wing/side" />
      <CellPaint b={stat} seed="s1wing/stat" cell={110} />
      <CellPaint b={dyn} seed="s1wing/panes" cell={110} live />
      {/* W, the thread: the subject (one closed outline drawing on at frame 0) before the lamp click and from her look
          back; support otherwise (no outline, its plum anchor barely calmed) */}
      <Tier tier={wIsSubject(t) ? 'subject' : 'support'}>
        <InkScale value={s1Bold(t)}>
          {/* (the look test's no-outline switch: W's frame-0 construction line goes under its plum on the lamp click) */}
          <Look ink={lineOn(sw, t, LINE_UNTIL.w)}>
            <CellPaint b={wb} seed="s1wing/W" cell={400} live draw={S1_DRAW.w} full={t >= W_LAMP_OFF ? W_DARK_FULL : undefined} />
          </Look>
        </InkScale>
      </Tier>
      <CellPaint b={lobby} seed="s1wing/lobby" cell={400} />
      {behindDoor}
      {/* the glass door + its canopy letters: the subject from frame 0 through her step-out (the letters pop on 0.97) */}
      <Tier tier={doorIsSubject(t) ? 'subject' : 'environment'}>
        <InkScale value={s1Bold(t)}>
          {/* (the no-outline switch: the door's construction line goes under its colour as the flood reaches it) */}
          <Look ink={lineOn(sw, t, LINE_UNTIL.door)}>
            <CellPaint b={frame} seed="s1wing/doorframe" cell={400} misreg={0.5} draw={S1_DRAW.doorFrame} />
          </Look>
        </InkScale>
        <HandLetteredGoogle cx={(F.x0 + F.x1) / 2} baseline={F.y0 + (F.y1 - F.y0) * 0.8} cap={Math.min(S.canopyLetterPx, (F.y1 - F.y0) * 0.84)} at={MAP.S1_CLOCK.steppingOut} each={0.06} />
      </Tier>
    </>
  );
};

// ---------------------------------------------------------------- the sliding leaves

/** Door opening 0..1: slide 0.45 -> open (just past full) 0.52 on "quit", settle 0.58; shut behind her 0.97 -> 1.10. */
export function s1DoorOpen(t: number): number {
  const C = MAP.S1_CLOCK;
  if (t < C.doorsStart) return 0;
  if (t < C.doorsOpen) {
    const k = (t - C.doorsStart) / (C.doorsOpen - C.doorsStart);
    return 1.035 * (k * k * (3 - 2 * k));
  }
  if (t < 0.58) {
    const k = (t - C.doorsOpen) / (0.58 - C.doorsOpen);
    return 1.035 - 0.035 * (1 - Math.pow(1 - k, 2));
  }
  if (t < C.steppingOut) return 1;
  if (t < C.doorsShut) {
    const k = (t - C.steppingOut) / (C.doorsShut - C.steppingOut);
    return 1 - k * k * (3 - 2 * k);
  }
  // the two leaves meet: a 2-frame 1 % bounce
  if (t < C.doorsShut + 0.05) return 0.012 * Math.sin(((t - C.doorsShut) / 0.05) * Math.PI);
  return 0;
}

/** The two glass leaves: strong slate stiles and rails (mid ink), unfilled glass (she shows through), a handle bar,
 *  an ink glint; they slide OUTWARD and stay visible parked over the brick door piers. */
export const S1DoorLeaves: React.FC = () => {
  const t = useTime();
  const sw = useSwitches();
  const {darks} = sw;
  const open = s1DoorOpen(t);
  const leafW = (DU1 - DU0) / 2;
  const b = new Batch();
  let outer = '';
  let inner = '';
  const st = 0.085;
  const rail = 0.085;
  const kick = 0.2;
  for (const side of [0, 1]) {
    const shift = open * leafW * (side ? 1 : -1);
    const a = DU0 + side * leafW + shift;
    const e = a + leafW;
    const v0 = DV0 + 0.07;
    const v1 = HM - 0.05;
    // stiles, rails, the kick rail (slate)
    const stile = darks ? DARK.iron : CM.paneUnlit;
    b.poly(stile, q(a, v0, st, v1 - v0));
    b.poly(stile, q(e - st, v0, st, v1 - v0));
    b.poly(stile, q(a, v0, leafW, rail));
    b.poly(stile, q(a, v1 - kick, leafW, kick));
    b.poly(CM.coatSlate, q(a + st, v1 - kick + 0.04, leafW - 2 * st, 0.025));
    // the handle: a brass pull bar on the meeting side
    const hu = side ? a + st + 0.06 : e - st - 0.1;
    b.poly(CM.coatMustard, q(hu, v0 + (v1 - v0) * 0.36, 0.04, (v1 - v0) * 0.26));
    b.poly(CM.line, q(hu, v0 + (v1 - v0) * 0.36, 0.04, 0.025));
    outer += poly(q(a, v0, leafW, v1 - v0), {closed: true, over: 'small', seed: `s1leaf${side}/o`});
    inner += poly(q(a + st, v0 + rail, leafW - 2 * st, v1 - v0 - rail - kick), {closed: true, over: 'none', seed: `s1leaf${side}/i`});
  }
  b.ink(outer, INK_PX.mid);
  b.ink(inner, INK_PX.far);
  // the track: the leaves slide into pockets inside the door's own opening (clipped to it), never out over the piers
  const track = poly(q(DU0, DV0, DU1 - DU0, HM - DV0), {closed: true, over: 'none', seed: 's1leaves/track'});
  return (
    <Tier tier={doorIsSubject(t) ? 'subject' : 'environment'}>
      <defs>
        <clipPath id="s1leavesTrack" clipPathUnits="userSpaceOnUse">
          <path d={track} />
        </clipPath>
      </defs>
      <g clipPath="url(#s1leavesTrack)">
        <InkScale value={s1Bold(t)}>
          <Look ink={lineOn(sw, t, LINE_UNTIL.door)}>
            <CellPaint b={b} seed="s1leaves" cell={400} misreg={0.6} live draw={S1_DRAW.leaves} />
          </Look>
        </InkScale>
      </g>
    </Tier>
  );
};

// ---------------------------------------------------------------- life on the wing

export const S1WingLife: React.FC = () => {
  const F = S.canopyFascia;
  const [x0, x1] = [s1WingX(UPPER[2].u0) + 14, s1WingX(UPPER[2].u1) - 14];
  const [, ys] = p((UPPER[2].u0 + UPPER[2].u1) / 2, V_SILL);
  return (
    <>
      <Pigeons ledge={[F.x0 + 4, F.x1 - 4, F.y0 - 7]} n={4} size={17} seed="s1canopy" />
      <Pigeons ledge={[x0, x1, ys]} n={2} size={15} seed="s1sill2" />
    </>
  );
};

/** The wing's shadow shapes for the light layer (V2S1_light): each fin's short shade falling right on the facade
 *  (the sun is west), and the canopy soffit (one Shade step). Screen px. */
export const s1WingShadows = (): {fins: string[]; soffit: string; ground: string} => {
  const toD = (pts: Pt[]) => `M${pts.map((pt) => P(pt[0], pt[1])).join('L')}Z`;
  const fins = FINS.map(([u, full]) => toD(q(u + 0.065, 0.06, 0.07, (full ? V_PLINTH : V_SILL) - 0.06)));
  const F = S.canopyFascia;
  const soffit = `M${P(F.x0 - 6, F.y1)}L${P(F.x1 + 6, F.y1)}L${P(F.x1 + 6, F.y1 + 8)}L${P(F.x0 - 6, F.y1 + 8)}Z`;
  // the ground storey in the shade of the far city and the bridge (the sun sits on their roofs: only the first storey
  // and W catch its last light), the door bay and its sign kept lit; the copies and her read against it by value
  // (the art director, v3: the oat copies melted into the yellow door and the peach wall)
  const ground = toD(q(-0.02, V_FLOOR, DU0 - 0.12 + 0.02, HM - V_FLOOR + 0.02)) + toD(q(DU1 + 0.12, V_FLOOR, LAY.wM - DU1, HM - V_FLOOR + 0.02)) + toD(sideWall(V_FLOOR));
  return {fins, soffit, ground};
};

/** The wing's WEST END WALL, a narrow strip receding from the facade's corner (its top and base continue the
 *  facade's convergence): the wing reads as a block in the one camera, not a cut-out. From `vFrom` down when given. */
function sideWall(vFrom = 0): Pt[] {
  const [xt, yt] = p(0, vFrom);
  const [xb, yb] = p(0, HM);
  const d = 16;
  const k = 0.3; // its edges keep falling toward the left (the facade's slope, a little steeper)
  return [
    [xt - d, yt + d * k * (vFrom > 0 ? 0.2 : 1)],
    [xt, yt],
    [xb, yb],
    [xb - d, yb - d * 0.18],
  ];
}
/** The west end wall's stone: the facade's limestone one light step up (it faces the low western sun). */
const SIDE_LIT = '#F3EBDF';
/** The west end wall's fill (lit: it faces the low western sun) for S1Wing. */
export const s1SideWall = (): string => {
  const pts = sideWall(0);
  return `M${pts.map((pt) => P(pt[0], pt[1])).join('L')}Z`;
};

export {PM as S1_WING_PLANE, UPPER as S1_WING_UPPER, LOWER as S1_WING_LOWER, V_SILL as S1_WING_V_SILL, V_PLINTH as S1_WING_V_PLINTH, HM as S1_WING_HM};
export const s1WingBaseY = (x: number) => p(uAt(x), HM)[1];
export const s1WingTopY = (x: number) => p(uAt(x), 0)[1];
export {clamp, lerp};
