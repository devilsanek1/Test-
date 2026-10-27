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
//   <S1WingLife />                pigeons on the canopy (shuffle 0.15) and on a sill
// Kit defects worked around here (kit/canal/wing.tsx WingFront): coloured strokes (the plant blades in CM.line, the
// brick ticks in CM.brickDeep, W's plant ring in CM.line), leaves hidden in pockets, W a flat plum slab.
import React, {useMemo} from 'react';
import {CM, INK_PX} from '../palette';
import {useTime, clamp} from '../../lib/time';
import {line, poly, glint, ellipse} from '../../lib/sketch';
import {Batch, PlaneMap, P, Pt, rng, ovalPath, lobes, lerp, leafPath, domePath} from '../kit/canal/core';
import {s1Layout} from '../kit/canal/wing';
import {litAt, Pigeons} from '../kit/canal/life';
import {HandLetteredGoogle} from '../kit/canal/lettering';
import * as MAP from '../world/map';
import {CellPaint, barPath, Under, UnderPaint} from './V2S1_set_core';

// ---------------------------------------------------------------- the layout (local metres: u east, v down)

const LAY = s1Layout();
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

function facadeStatic(): Batch {
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
  // brick coursing hints: short tick fills in clusters on the solid brick (piers, the corner panel, the door piers)
  const solid: [number, number, number, number][] = [
    [CORNER + 0.04, V_HEAD + 0.1, 0.2, V_SILL - V_HEAD - 0.2],
    [PIER_L.u0 + 0.05, V_FLOOR + 0.25, PIER_L.u1 - PIER_L.u0 - 0.1, V_PLINTH - V_FLOOR - 0.4],
    [PIER_R.u0 + 0.05, V_FLOOR + 0.25, PIER_R.u1 - PIER_R.u0 - 0.1, V_PLINTH - V_FLOOR - 0.4],
    [UPPER[2].u1 + 0.02, V_HEAD + 0.12, WU0 - UPPER[2].u1 - 0.04, V_SILL - V_HEAD - 0.25],
  ];
  for (const [u0, v0, w, h] of solid) {
    const n = Math.max(2, Math.round((w * h) / 0.35));
    for (let k = 0; k < n; k++) {
      const uu = u0 + r.range(0, w);
      const vv = v0 + r.range(0, h);
      for (let j = 0; j < r.int(2, 3); j++) {
        const [x, y] = p(uu + (j % 2) * 0.13, vv + j * 0.075);
        b.rect(j % 2 ? CM.brick : CM.stucco, x, y, 8, 2.2);
      }
    }
  }
  b.layer();
  // the coping cap, the band between the storeys (W's sill course), the plinth, each in strips
  for (let k = 0; k < strips.length - 1; k++) {
    const a = strips[k] - 0.01;
    const w = strips[k + 1] - strips[k] + 0.02;
    b.poly(CM.limestone, q(a, -0.02, w, 0.05));
    b.poly(CM.limestone, q(a, V_SILL, w, V_FLOOR - V_SILL));
    b.poly(CM.stoneShade, q(a, V_FLOOR - 0.025, w, 0.025));
    b.poly(CM.limestone, q(a, V_PLINTH, w, HM - V_PLINTH));
    b.poly(CM.stoneShade, q(a, V_PLINTH, w, 0.05));
  }
  // the west corner pier (limestone) with its shade return
  b.poly(CM.limestone, q(0, 0, CORNER, HM));
  b.poly(CM.stoneShade, q(CORNER - 0.07, 0.03, 0.07, HM - 0.03));
  // a downpipe on the corner panel
  b.poly(CM.shadeCool, q(CORNER + 0.1, 0.02, 0.06, HM - 0.02));
  for (let k = 0; k < 4; k++) b.poly(CM.paneUnlit, q(CORNER + 0.085, 0.5 + k * 1.15, 0.09, 0.05));
  b.layer();
  // window reveals (a shade strip on the left: the low sun is west = screen left) + slim stone sills / lintels
  for (const bay of UPPER) {
    b.poly(CM.stoneShade, q(bay.u0 - 0.06, V_HEAD, 0.06, V_SILL - V_HEAD));
    b.poly(CM.shadeWarm, q(bay.u0 - 0.03, V_HEAD, 0.03, V_SILL - V_HEAD));
  }
  for (const bay of LOWER) {
    b.poly(CM.stoneShade, q(bay.u0 - 0.06, V_FLOOR + 0.1, 0.06, V_PLINTH - V_FLOOR - 0.1));
    b.poly(CM.limestone, q(bay.u0 - 0.06, V_FLOOR + 0.04, bay.u1 - bay.u0 + 0.12, 0.07));
  }
  // the door bay: a stone surround (jambs + head), the shade in its left reveal
  b.poly(CM.limestone, q(DU0 - 0.12, DV0 - 0.1, 0.12, HM - DV0 + 0.1));
  b.poly(CM.limestone, q(DU1, DV0 - 0.1, 0.12, HM - DV0 + 0.1));
  b.poly(CM.stoneShade, q(DU0, DV0, 0.07, HM - DV0));
  b.layer();
  // ---- fins: slim limestone, a warm shadow strip to their right (the sun is west)
  for (const [u, full] of FINS) {
    const v1 = full ? V_PLINTH : V_SILL;
    b.poly(CM.limestone, q(u - 0.065, 0.02, 0.13, v1 - 0.02));
    b.poly(CM.shadeWarm, q(u + 0.065, 0.06, 0.05, v1 - 0.06));
  }
  // ---- the canopy slab: soffit shadow under the fascia, the fascia (sign face), its top band
  const F = S.canopyFascia;
  b.rect(CM.shadeWarm, F.x0 - 6, F.y1, F.x1 - F.x0 + 12, 8);
  b.rect(CM.stoneShade, F.x0 - 6, F.y1 + 8, F.x1 - F.x0 + 12, 3);
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
    b.poly(CM.paneUnlit, q(bay.u0, va, bay.u1 - bay.u0, fw));
    b.poly(CM.paneUnlit, q(bay.u0, vb - fw * 1.4, bay.u1 - bay.u0, fw * 1.4));
    b.poly(CM.paneUnlit, q(bay.u0, va, fw, vb - va));
    b.poly(CM.paneUnlit, q(bay.u1 - fw, va, fw, vb - va));
    if (bay.split) b.poly(CM.paneUnlit, q(bay.u0 + (bay.u1 - bay.u0) * bay.split - 0.025, va, 0.05, vb - va));
    if (bay.transom) b.poly(CM.paneUnlit, q(bay.u0, va + (vb - va) * bay.transom, bay.u1 - bay.u0, 0.035));
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
function paneInto(b: Batch, ink: string[], u0: number, v0: number, w: number, h: number, lit: boolean, seed: string, kind: number) {
  const r = rng(seed);
  const qq = (a: number, c: number, ww: number, hh: number) => q(u0 + a * w, v0 + c * h, ww * w, hh * h);
  const pp = (a: number, c: number) => p(u0 + a * w, v0 + c * h);
  if (!lit) {
    b.poly(CM.glass, qq(0, 0, 1, 1));
    const lo = r.range(0.52, 0.66);
    b.poly(CM.shadeCool, [pp(0, lo), pp(1, lo - r.range(0.08, 0.2)), pp(1, 1), pp(0, 1)]);
    b.poly(CM.paneUnlit, qq(0, 0.86, 1, 0.14));
    b.poly(CM.skyHigh, [pp(0.18, 0), pp(0.5, 0), pp(0.06, 0.42), pp(0, 0.42), pp(0, 0.26)]);
    b.poly(CM.paper, [pp(0.62, 0), pp(0.7, 0), pp(0.44, 0.28), pp(0.38, 0.28)]);
    return;
  }
  b.poly(CM.lamp, qq(0, 0, 1, 1));
  b.poly(CM.lampCore, qq(0.08, 0.1, 0.84, 0.46));
  if (kind === 0) {
    // a pendant lamp over a long table
    b.poly(CM.anchor, [pp(0.36, 0.3), pp(0.64, 0.3), pp(0.56, 0.21), pp(0.44, 0.21)]);
    b.poly(CM.paper, qq(0.46, 0.3, 0.08, 0.03));
    b.poly(CM.brickLight, qq(0, 0.72, 1, 0.07));
    b.poly(CM.line, qq(0.1, 0.79, 0.04, 0.21));
    b.poly(CM.line, qq(0.86, 0.79, 0.04, 0.21));
    ink.push(line(...pp(0.5, 0), ...pp(0.5, 0.21), {seed: `${seed}/cord`, over: 'none'}));
  } else if (kind === 1) {
    // a shelf of books and a plant
    b.poly(CM.line, qq(0.05, 0.44, 0.9, 0.035));
    for (let k = 0; k < 6; k++) b.poly(r.pick([CM.brick, CM.sage, CM.coatMustard, CM.paneUnlit, CM.box, CM.leafRust]), qq(0.08 + k * 0.12, 0.3 + r.range(0, 0.03), 0.08, 0.14));
    const [cx, cy] = pp(0.74, 0.9);
    const s = PM.pxPerM(u0) * w * 0.2;
    b.fill(CM.brickDeep, `M${P(cx - s * 0.5, cy)}L${P(cx + s * 0.5, cy)}L${P(cx + s * 0.4, cy + s * 0.5)}L${P(cx - s * 0.4, cy + s * 0.5)}Z`);
    b.fill(CM.sage, lobes(cx - s, cx + s, cy, s * 1.7, `${seed}/pl`, 3));
    ink.push(line(...pp(0.05, 0.44), ...pp(0.95, 0.44), {seed: `${seed}/sh`, over: 'small'}));
  } else if (kind === 2) {
    // a big plant against the glass + a framed picture
    const [cx, cy] = pp(0.28, 1);
    const s = PM.pxPerM(u0) * w * 0.3;
    b.fill(CM.sage, lobes(cx - s, cx + s, cy - s * 0.3, s * 2.1, `${seed}/bp`, 4));
    b.poly(CM.brickDeep, qq(0.17, 0.84, 0.24, 0.16));
    b.poly(CM.paper, qq(0.58, 0.22, 0.28, 0.22));
    b.poly(CM.coatPlum, qq(0.62, 0.26, 0.2, 0.06));
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

// ---------------------------------------------------------------- W, her office window

/** W's lamp clicks off (the first picture of "quit"). */
export const W_LAMP_OFF = MAP.S1_CLOCK.wLampOff;

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
    for (let k = 0; k < 3; k++) b.poly(CM.coatPlum, qq(0.07 + k * 0.085, 0.15, 0.06, 0.12));
    b.poly(CM.coatPlum, qq(0, 0.78, 1, 0.03));
    b.fill(CM.coatPlum, `M${P(...pp(0.14, 1))}L${P(...pp(0.14, 0.64))}Q${P(...pp(0.24, 0.56))} ${P(...pp(0.34, 0.64))}L${P(...pp(0.34, 0.78))}L${P(...pp(0.3, 0.78))}L${P(...pp(0.3, 1))}Z`);
    b.fill(CM.coatPlum, `M${P(...pp(0.74, 0.78))}L${P(...pp(0.86, 0.78))}L${P(...pp(0.84, 0.75))}L${P(...pp(0.76, 0.75))}Z`);
    b.fill(CM.coatPlum, barPath(pp(0.8, 0.76), pp(0.86, 0.6), 3));
    b.fill(CM.coatPlum, barPath(pp(0.86, 0.6), pp(0.76, 0.5), 3));
    b.fill(CM.coatPlum, `M${P(...pp(0.7, 0.5))}L${P(...pp(0.79, 0.44))}L${P(...pp(0.82, 0.53))}Z`);
    // a glint: the glass still catches the sky at the top-right corner
    b.poly(CM.paneUnlit, [pp(0.98, 0.02), pp(0.98, 0.2), pp(0.8, 0.02)]);
    b.poly(CM.skyHigh, [pp(0.98, 0.03), pp(0.98, 0.09), pp(0.92, 0.03)]);
  } else {
    // lamp-lit: her desk lamp on (a flat pool on the desk, never a glow), the shelf of box files, the chair back
    b.poly(CM.lamp, qq(0, 0, 1, 1));
    b.poly(CM.lampCore, qq(0.36, 0.08, 0.58, 0.62));
    b.poly(CM.line, qq(0.05, 0.27, 0.3, 0.025));
    for (let k = 0; k < 3; k++) b.poly([CM.brick, CM.paneUnlit, CM.coatMustard][k], qq(0.07 + k * 0.085, 0.15, 0.06, 0.12));
    b.poly(CM.brickLight, qq(0, 0.78, 1, 0.03));
    b.poly(CM.lampCore, [pp(0.62, 0.78), pp(0.96, 0.78), pp(0.9, 0.7), pp(0.7, 0.7)]);
    b.fill(CM.coatSlate, `M${P(...pp(0.14, 1))}L${P(...pp(0.14, 0.64))}Q${P(...pp(0.24, 0.56))} ${P(...pp(0.34, 0.64))}L${P(...pp(0.34, 0.78))}L${P(...pp(0.3, 0.78))}L${P(...pp(0.3, 1))}Z`);
    b.fill(CM.anchor, `M${P(...pp(0.74, 0.78))}L${P(...pp(0.86, 0.78))}L${P(...pp(0.84, 0.75))}L${P(...pp(0.76, 0.75))}Z`);
    b.fill(CM.anchor, barPath(pp(0.8, 0.76), pp(0.86, 0.6), 3));
    b.fill(CM.anchor, barPath(pp(0.86, 0.6), pp(0.76, 0.5), 3));
    b.fill(CM.anchor, `M${P(...pp(0.7, 0.5))}L${P(...pp(0.79, 0.44))}L${P(...pp(0.82, 0.53))}Z`);
    b.fill(CM.paper, ovalPath(...pp(0.765, 0.53), 3.5, 2.5));
    b.poly(CM.glass, [pp(0.98, 0.02), pp(0.98, 0.18), pp(0.82, 0.02)]);
  }
  // the glazing: two slim stone mullions near the sides (kept out of the dive's centre) as fills; their lines in ink
  b.layer();
  for (const a of [0.12, 0.88]) b.poly(CM.limestone, qq(a - 0.022, 0, 0.044, 1));
  b.poly(CM.limestone, qq(0, 0.94, 1, 0.06));
  // the sill: a projecting stone sill with its shadow, and the RING her plant left (a stain ring + a dropped leaf)
  b.poly(CM.limestone, q(u0 - 0.14, v0 + h, w + 0.28, 0.1));
  b.poly(CM.stoneShade, q(u0 - 0.14, v0 + h + 0.085, w + 0.28, 0.035));
  b.layer();
  // the ring her plant left: a dark stain ring with a pale dust-free centre, a few soil crumbs and a dropped leaf;
  // sized to read at 216 px (~44 x 12 px), every line in ink (the kit drew it in CM.line)
  const [rx, ry] = pp(0.42, 1.04);
  const s = PM.pxPerM(u0 + w * 0.42);
  const RX = s * 0.24;
  const RY = s * 0.066;
  b.fill(CM.shadeWarm, `M${P(rx - RX, ry)}A${RX.toFixed(1)} ${RY.toFixed(1)} 0 1 0 ${P(rx + RX, ry)}A${RX.toFixed(1)} ${RY.toFixed(1)} 0 1 0 ${P(rx - RX, ry)}Z`);
  b.fill(CM.paper, ovalPath(rx, ry - 0.3, RX * 0.7, RY * 0.52));
  for (const [dx, dy, sz] of [[1.25, -0.3, 2.2], [1.45, 0.35, 1.6], [-1.3, 0.3, 2], [-1.12, -0.5, 1.4], [1.1, 0.8, 1.3]] as [number, number, number][]) b.fill(CM.brickDeep, ovalPath(rx + dx * RX, ry + dy * RY, sz, sz * 0.7));
  b.fill(CM.sage, leafPath(rx + RX * 1.75, ry - 1.5, 16, 5, -18));
  inkM.push(ellipse(rx, ry, RX, RY, {seed: 's1W/ring', wobble: 0.02, overlap: 16}));
  inkF.push(ellipse(rx, ry - 0.3, RX * 0.7, RY * 0.52, {seed: 's1W/ring2', wobble: 0.03, overlap: 6}));
  // W's lines: the frame (closed), the glass edge, the mullions, the sill, the chair and the lamp
  inkM.push(poly(qq(0, 0, 1, 1), {closed: true, over: 'small', seed: 's1W/frame'}));
  inkF.push(line(...pp(0.12 - 0.022, 0.01), ...pp(0.12 - 0.022, 0.99), {seed: 's1W/m1', over: 'none'}));
  inkF.push(line(...pp(0.88 + 0.022, 0.01), ...pp(0.88 + 0.022, 0.99), {seed: 's1W/m2', over: 'none'}));
  inkF.push(line(...p(u0 - 0.14, v0 + h), ...p(u0 + w + 0.14, v0 + h), {seed: 's1W/sill', over: 'small'}));
  inkF.push(line(...pp(0.05, 0.27), ...pp(0.35, 0.27), {seed: 's1W/shelf', over: 'none'}));
  inkF.push(`M${P(...pp(0.14, 0.94))}L${P(...pp(0.14, 0.64))}Q${P(...pp(0.24, 0.56))} ${P(...pp(0.34, 0.64))}L${P(...pp(0.34, 0.78))}`);
  inkF.push(`M${P(...pp(0.8, 0.76))}L${P(...pp(0.86, 0.6))}L${P(...pp(0.76, 0.5))}M${P(...pp(0.7, 0.5))}L${P(...pp(0.79, 0.44))}L${P(...pp(0.82, 0.53))}`);
}

// ---------------------------------------------------------------- the lobby behind the door

function lobbyStatic(): Batch {
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
  b.poly(CM.line, q(du0 + 0.42, dv1 - 1.12, 0.62, 0.72));
  b.poly(CM.leafGold, q(du0 + 0.42, dv1 - 1.12, 0.62, 0.07));
  const [plx, ply] = p(du0 + 0.2, dv1 - 0.42);
  const pls = PM.pxPerM(du0);
  b.fill(CM.brickDeep, `M${P(plx - pls * 0.16, ply)}L${P(plx + pls * 0.16, ply)}L${P(plx + pls * 0.12, ply - pls * 0.34)}L${P(plx - pls * 0.12, ply - pls * 0.34)}Z`);
  b.fill(CM.sage, lobes(plx - pls * 0.3, plx + pls * 0.3, ply - pls * 0.34, pls * 1.05, 's1lobby/plant', 3));
  for (let j = 0; j < 3; j++) {
    const [lx, ly] = p(du0 + (du1 - du0) * (0.22 + j * 0.28), dv0 + 0.34);
    b.fill(CM.anchor, domePath(lx, ly, 7, 6));
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
function doorFrameStatic(): Batch {
  const b = new Batch();
  b.poly(CM.paneUnlit, q(DU0, DV0, DU1 - DU0, 0.07));
  b.poly(CM.paneUnlit, q(DU0, DV0, 0.05, HM - DV0));
  b.poly(CM.paneUnlit, q(DU1 - 0.05, DV0, 0.05, HM - DV0));
  b.poly(CM.stoneShade, q(DU0 - 0.12, HM - 0.05, DU1 - DU0 + 0.24, 0.05));
  b.ink(poly(q(DU0, DV0, DU1 - DU0, HM - DV0), {over: 'small', seed: 's1w/dooropen'}), INK_PX.mid);
  return b;
}

// ---------------------------------------------------------------- the wing

export const S1Wing: React.FC<{behindDoor?: React.ReactNode}> = ({behindDoor}) => {
  const t = useTime();
  const stat = useMemo(() => facadeStatic(), []);
  const lobby = useMemo(() => lobbyStatic(), []);
  const frame = useMemo(() => doorFrameStatic(), []);
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
  // the frame-0 drawing of the panes (their fills are paper until the flood): a room line, a desk or a sill line and a
  // glass glint per pane, each pane's group gone on the frame its colour lands (the bare-line state reads dense)
  const under = useMemo(() => {
    const u = new Under();
    panes.forEach(([u0, v0, w, h], k) => {
      const r = rng(`s1paneU/${k}`);
      const pp = (a: number, c: number) => p(u0 + a * w, v0 + c * h);
      const [cx, cy] = pp(0.5, 0.5);
      const lo = r.range(0.56, 0.68);
      let d = `M${P(...pp(0.04, lo))}L${P(...pp(0.96, lo - r.range(0.06, 0.16)))}`;
      d += `M${P(...pp(0.12, 0.86))}L${P(...pp(0.88, 0.86))}`;
      d += `M${P(...pp(0.62, 0.04))}L${P(...pp(0.42, 0.3))}M${P(...pp(0.74, 0.04))}L${P(...pp(0.56, 0.26))}`;
      u.add(cx, cy, d, INK_PX.hair);
    });
    return u;
  }, []);
  panes.forEach(([u0, v0, w, h], k) => {
    const lit = litAt(t, 's1wing', k, panes.length, {litFrac: 0.55});
    paneInto(dyn, inkP, u0, v0, w, h, lit, `s1pane/${k}/${lit ? 'L' : 'U'}`, k % 4);
  });
  dyn.ink(inkP.join(''), INK_PX.hair);
  // W: lamp-lit, then plum dark from the lamp click (one frame)
  const wb = new Batch();
  const wInkF: string[] = [];
  const wInkM: string[] = [];
  wInto(wb, wInkF, wInkM, t >= W_LAMP_OFF);
  wb.ink(wInkF.join(''), INK_PX.far);
  wb.ink(wInkM.join(''), INK_PX.mid);
  const F = S.canopyFascia;
  return (
    <>
      <CellPaint b={stat} seed="s1wing/stat" cell={110} />
      <CellPaint b={dyn} seed="s1wing/panes" cell={110} live />
      <UnderPaint u={under} seed="s1wing/paneU" />
      <CellPaint b={wb} seed="s1wing/W" cell={400} live />
      <CellPaint b={lobby} seed="s1wing/lobby" cell={400} />
      {behindDoor}
      <CellPaint b={frame} seed="s1wing/doorframe" cell={400} misreg={0.5} />
      <HandLetteredGoogle cx={(F.x0 + F.x1) / 2} baseline={F.y0 + (F.y1 - F.y0) * 0.8} cap={Math.min(S.canopyLetterPx, (F.y1 - F.y0) * 0.84)} at={MAP.S1_CLOCK.steppingOut} each={0.06} />
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
    b.poly(CM.paneUnlit, q(a, v0, st, v1 - v0));
    b.poly(CM.paneUnlit, q(e - st, v0, st, v1 - v0));
    b.poly(CM.paneUnlit, q(a, v0, leafW, rail));
    b.poly(CM.paneUnlit, q(a, v1 - kick, leafW, kick));
    b.poly(CM.coatSlate, q(a + st, v1 - kick + 0.04, leafW - 2 * st, 0.025));
    // the handle: a brass pull bar on the meeting side
    const hu = side ? a + st + 0.06 : e - st - 0.1;
    b.poly(CM.coatMustard, q(hu, v0 + (v1 - v0) * 0.36, 0.04, (v1 - v0) * 0.26));
    b.poly(CM.line, q(hu, v0 + (v1 - v0) * 0.36, 0.04, 0.025));
    outer += poly(q(a, v0, leafW, v1 - v0), {closed: true, over: 'small', seed: `s1leaf${side}/o`});
    inner += poly(q(a + st, v0 + rail, leafW - 2 * st, v1 - v0 - rail - kick), {closed: true, over: 'none', seed: `s1leaf${side}/i`});
    // the glint: two ink strokes in the upper glass (above her head at f0)
    const [gx, gy] = p(a + st + 0.14, v0 + rail + 0.68);
    inner += glint(gx, gy, 30, {seed: `s1leaf${side}/g`, angle: -58, gap: 8});
  }
  b.ink(outer, INK_PX.mid);
  b.ink(inner, INK_PX.far);
  return <CellPaint b={b} seed="s1leaves" cell={400} misreg={0.6} live />;
};

// ---------------------------------------------------------------- life on the wing

export const S1WingLife: React.FC = () => {
  const F = S.canopyFascia;
  const [x0, x1] = [s1WingX(UPPER[2].u0) + 14, s1WingX(UPPER[2].u1) - 14];
  const [, ys] = p((UPPER[2].u0 + UPPER[2].u1) / 2, V_SILL);
  return (
    <>
      <Pigeons ledge={[F.x0 + 4, F.x1 - 4, F.y0 - 7]} n={4} size={17} seed="s1canopy" shuffleAt={[MAP.S1_CLOCK.voiceShe + 0.03]} />
      <Pigeons ledge={[x0, x1, ys]} n={2} size={15} seed="s1sill2" />
    </>
  );
};

export {PM as S1_WING_PLANE, UPPER as S1_WING_UPPER, LOWER as S1_WING_LOWER, V_SILL as S1_WING_V_SILL, V_PLINTH as S1_WING_V_PLINTH, HM as S1_WING_HM};
export const s1WingBaseY = (x: number) => p(uAt(x), HM)[1];
export const s1WingTopY = (x: number) => p(uAt(x), 0)[1];
export {clamp, lerp};
