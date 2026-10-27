// dc/terrace.tsx: the public viewpoint terrace on the Arlington heights (TREATMENT section 6, K7), in END coordinates
// (the screen when the crane lands; the DECK plane scales it up about the stranger for the start).
//
//   DECK  the stone balustrade (the one level line), the paving seen from the crane's height (broken joints in true
//         perspective, petal drifts), the stranger's bench at the balustrade, a second bench, a bin, a stroller, a
//         tulip bed, a drinking fountain: busy edges, a calm centre. Nothing here is taller than the crane, so nothing
//         ever crosses the caption band.
//   TREE  the blossoming terrace tree that lands as the LEFT frame (its own box: it slides in from the left).
//   LAMP  the terrace lamppost that lands as the RIGHT frame (base cut by the bottom-right; its own box).
//   WIPE  the lamppost with a hanging flower basket that sweeps across the backs at the move's peak (crane.ts drives
//         it; the tiny drawings swap behind it). Low enough that its finial never reaches y 600.
//   PETALS near the lens, drifting down (life, never in the band).
// The DECK camera: level, horizon y 800, f 1000 px, 9.2 m above the floor (the contract's end stranger: seated 62 px
// with feet at y 1238 -> 47.7 px/m there), the balustrade 21.6 m out. People are K4's; Pip is K5's; the news box and
// the plaque are K3's (slots below).

import React, {useMemo} from 'react';
import {CM} from '../../palette';
import {useTime} from '../../../lib/time';
import {line as skLine} from '../../../lib/sketch';
import {Batch, Paint, mix, crownD, ellD, lineD, polyD, rng, rand, frac, blossomD, burstScale, smoothClosed, circleD, type Pt} from './core';
import {BloomCrowns, BLOOM_NEAR, type CrownSpec} from './bloom';

// ---------------------------------------------------------------- the deck camera

export const DECK_CAM = {f: 1000, h: 9.2, horizon: 800, vpx: 420, railD: 21.6};
/** Screen point of a floor point at lateral x (m, + right) and depth d (m), height z (m). */
export const deckPt = (x: number, d: number, z = 0): Pt => [DECK_CAM.vpx + (DECK_CAM.f * x) / d, DECK_CAM.horizon + (DECK_CAM.f * (DECK_CAM.h - z)) / d];
/** Depth (m) of a floor point at screen y. */
export const deckD = (y: number) => (DECK_CAM.f * DECK_CAM.h) / Math.max(1, y - DECK_CAM.horizon);
/** px per metre at a floor screen y. */
export const deckPxPerM = (y: number) => DECK_CAM.f / deckD(y);

/** The terrace's key lines in END coords. */
export const TERRACE = {
  railTop: deckPt(0, DECK_CAM.railD, 1.0)[1], // ~1180
  railBase: deckPt(0, DECK_CAM.railD, 0)[1], // ~1226
  /** The stranger's bench (from the contract's start bench through the deck plane). */
  /** (its backrest top sits 0.6 of the seated stranger's height above the feet: their head and shoulders show) */
  bench: {x0: 289, x1: 384, y0: 1196, y1: 1240},
  /** K3's news box (end position of the contract's start box). */
  newsBox: {x0: 388, y0: 1095, x1: 516, y1: 1240},
  /** A mount for K3's plaque on the balustrade, right of the figures (the plaque pops on "Pentagon", 22.43). */
  plaqueMount: {x0: 560, y0: 1120, x1: 760, y1: 1226},
};

// ---------------------------------------------------------------- tones (the deck: plane 0, ink full)

export const TT = {
  paving: CM.paving,
  pavingLit: mix(CM.paving, CM.paper, 0.45),
  pavingShade: mix(CM.paving, CM.shadeWarm, 0.18),
  pavingWorn: mix(CM.paving, CM.brickLight, 0.3),
  joint: mix(CM.paving, CM.line, 0.62),
  shadowFloor: mix(CM.paving, CM.shadeWarm, 0.4),
  shaft: mix(CM.paving, CM.shadeWarm, 0.17),
  hedge: mix(CM.sage, CM.anchor, 0.42),
  hedgeLit: mix(CM.sage, CM.anchor, 0.12),
  hedgeDeep: mix(CM.sage, CM.anchor, 0.6),
  stone: CM.limestone,
  stoneLit: CM.paper,
  stoneShade: CM.stoneShade,
  stoneDeep: mix(CM.stoneShade, CM.shadeWarm, 0.3),
  wood: CM.brick,
  woodShade: CM.brickDeep,
  iron: CM.anchor,
  ironLit: mix(CM.anchor, CM.paneUnlit, 0.5),
  petal: CM.blossom,
  petalShade: mix(CM.blossom, CM.shadeWarm, 0.3),
  tulip: [CM.box, CM.blossom, CM.coatMustard, CM.paper],
  leaf: CM.sage,
  leafShade: mix(CM.sage, CM.shadeWarm, 0.35),
  soil: mix(CM.brickDeep, CM.anchor, 0.35),
  bark: CM.anchor,
  barkLit: mix(CM.anchor, CM.brickDeep, 0.45),
  crown: mix(CM.shadeWarm, CM.sage, 0.3),
  crownShade: mix(CM.shadeWarm, CM.anchor, 0.35),
  crownLit: mix(CM.brickLight, CM.blossom, 0.4),
  lampGlass: CM.lampCore,
  basketLeaf: mix(CM.sage, CM.shadeWarm, 0.2),
  ink: CM.ink,
};

// ---------------------------------------------------------------- the deck

/** The balustrade: coping, balusters every ~0.3 m, plinth; running past both edges (and the deck plane's start 2.42x
 *  scale: authored x -1100..2200). */
function balustrade(B: Batch) {
  const d = DECK_CAM.railD;
  const top = TERRACE.railTop;
  const base = TERRACE.railBase;
  const pxm = DECK_CAM.f / d;
  const x0 = -1100;
  const x1 = 2200;
  // the terrace beyond the balustrade is gone (the drop); the plinth, balusters, coping
  B.rect(TT.stoneShade, x0, base - 0.18 * pxm, x1 - x0, 0.18 * pxm + 6);
  B.layer();
  const step = 0.3 * pxm;
  const bw = 0.13 * pxm;
  let ix = 0;
  for (let x = x0; x < x1; x += step, ix++) {
    // a pier every 12 balusters
    if (ix % 12 === 0) {
      B.rect(TT.stone, x - bw * 0.8, top, bw * 2.6, base - top);
      B.rect(TT.stoneShade, x - bw * 0.8, top, bw * 0.8, base - top);
      continue;
    }
    // a vase-shaped baluster: a slim shaft with a bulb (flat), lit right, shade left
    const yb = top + 0.12 * pxm;
    const ye = base - 0.2 * pxm;
    const cx = x + bw / 2;
    B.fill(TT.stone, smoothClosed([
      [cx - bw * 0.32, yb],
      [cx + bw * 0.32, yb],
      [cx + bw * 0.22, yb + (ye - yb) * 0.3],
      [cx + bw * 0.55, yb + (ye - yb) * 0.7],
      [cx + bw * 0.4, ye],
      [cx - bw * 0.4, ye],
      [cx - bw * 0.55, yb + (ye - yb) * 0.7],
      [cx - bw * 0.22, yb + (ye - yb) * 0.3],
    ]));
    B.rect(TT.stoneShade, cx - bw * 0.4, yb + (ye - yb) * 0.45, bw * 0.28, (ye - yb) * 0.5);
  }
  B.layer();
  // the coping: a flat stone band with a lit top
  B.rect(TT.stone, x0, top - 2, x1 - x0, 0.14 * pxm + 2);
  B.rect(TT.stoneLit, x0, top - 2, x1 - x0, 3);
  // ink: the coping's front edge and the plinth line (long, broken), pier edges
  B.ink(skLine(x0, top + 0.14 * pxm, x1, top + 0.14 * pxm, {seed: 'rail/c'}), 2.6, TT.ink, 0.1);
  B.ink(skLine(x0, base - 0.18 * pxm, x1, base - 0.18 * pxm, {seed: 'rail/p'}), 2.2, TT.ink, 0.2);
}

/** Paving seen from the crane's height: a band of long border slabs along the balustrade, then a field of 0.6 m setts
 *  in running bond (broken joints converging on the deck's VP, over the figures), a darker drain channel, scattered
 *  lit / worn setts; then the big tree's dappled shadow pool falling toward us (the sun is beyond the view). */
function paving(B: Batch, seed: string) {
  const r = rng(seed);
  const yTop = TERRACE.railBase;
  B.rect(TT.paving, -1100, yTop - 2, 3300, 2200 - yTop);
  // the border band (1.4 m of long pale slabs) and the drain channel behind it
  const bandD = DECK_CAM.railD - 1.4;
  const yBand = deckPt(0, bandD)[1];
  B.rect(TT.pavingLit, -1100, yTop, 3300, yBand - yTop);
  const ch = deckPt(0, bandD - 0.25)[1];
  B.rect(TT.joint, -1100, yBand, 3300, Math.max(2, ch - yBand));
  // setts: rows every 0.6 m, running bond; a few lit / worn ones
  B.layer();
  const rows: number[] = [];
  for (let d = bandD - 0.25; d > 3.8; d -= 0.6) rows.push(d);
  for (let i = 0; i < rows.length - 1; i++) {
    const d0 = rows[i];
    const d1 = rows[i + 1];
    const off = i % 2 ? 0.3 : 0;
    for (let xm = -24; xm < 24; xm += 0.6) {
      const k = r.next();
      if (k > 0.2) continue;
      const q = [deckPt(xm + off, d0), deckPt(xm + off + 0.6, d0), deckPt(xm + off + 0.6, d1), deckPt(xm + off, d1)];
      B.poly(k < 0.07 ? TT.pavingLit : k < 0.14 ? TT.pavingShade : TT.pavingWorn, q);
    }
  }
  // the slope trees' dappled shade over the terrace (the low morning sun is beyond the view: their shadows run 20 m
  // toward us), with sunlit shafts between them and flecks; it ends in a ragged edge near the bottom
  B.layer();
  const edge: Pt[] = [[-1100, yTop - 1]];
  for (let x = -1100; x <= 2200; x += 60) edge.push([x, yTop - 1]);
  const near: Pt[] = [];
  for (let x = 2200; x >= -1100; x -= 50) near.push([x, 1660 + 40 * Math.sin(x * 0.009) + 20 * Math.sin(x * 0.023 + 1)]);
  B.poly(TT.shadowFloor, [...edge, ...near]);
  // its near edge is the crowns' shadows: rounded dapple lobes, never a sawtooth
  let lobes = '';
  for (let x = -1100; x < 2200; x += r.range(70, 130)) {
    const y = 1660 + 40 * Math.sin(x * 0.009) + 20 * Math.sin(x * 0.023 + 1);
    lobes += crownD(x, y + r.range(10, 40), r.range(60, 120), r.range(26, 48), `${seed}/lb${Math.round(x)}`, 7, 0.1);
  }
  B.fill(TT.shadowFloor, lobes);
  B.layer();
  // sunlit shafts: long slanted patches between the trees' shadows (toward us-left), a few small pools
  let shafts = '';
  for (let i = 0; i < 7; i++) {
    const x0 = -150 + i * 205 + r.range(-60, 60);
    const y0 = yTop + r.range(30, 90);
    const len = r.range(220, 420);
    const w0 = r.range(14, 30);
    const w1 = w0 * r.range(2.2, 3.6);
    const dx = -len * 0.42;
    shafts += polyD([
      [x0 - w0 / 2, y0],
      [x0 + w0 / 2, y0],
      [x0 + dx + w1 / 2, y0 + len],
      [x0 + dx - w1 / 2, y0 + len],
    ]);
  }
  B.fill(TT.shaft, shafts);
  let fl = '';
  for (let i = 0; i < 40; i++) {
    const x = r.range(-200, 1250);
    const y = r.range(yTop + 20, 1720);
    const s = deckPxPerM(y) * r.range(0.08, 0.2);
    fl += crownD(x, y, s * r.range(1.2, 2.6), s * r.range(0.5, 0.9), `${seed}/fl${i}`, 5, 0.2);
  }
  B.fill(TT.paving, fl);
  // joints over everything (darker in the pool by their own colour)
  B.layer();
  for (let i = 0; i < rows.length; i++) {
    const d = rows[i];
    const y = deckPt(0, d)[1];
    const w = Math.min(2.6, 1.0 + (y - 1200) / 380);
    let x = -1100 + r.range(0, 40);
    while (x < 2200) {
      const len = r.range(160, 420);
      B.ink(lineD([[x, y + r.range(-0.8, 0.8)], [x + len, y + r.range(-0.8, 0.8)]]), w, TT.joint);
      x += len + r.range(10, 40);
    }
    if (i < rows.length - 1) {
      const d1 = rows[i + 1];
      const off = i % 2 ? 0.3 : 0;
      let cross = '';
      for (let xm = -24; xm < 24; xm += 0.6) {
        if (r.chance(0.35)) continue;
        cross += lineD([deckPt(xm + off, d), deckPt(xm + off, d1)]);
      }
      B.ink(cross, w * 0.8, TT.joint);
    }
  }
  B.ink(skLine(-1100, yBand, 2200, yBand, {seed: 'band'}), 2.2, TT.ink, 0.25);
}

/** The planted border along the bottom edge (cut by it): a clipped box hedge with blossoming shrubs and tulips on its
 *  crest, the near dark mass under the platform UI (END coords; off-screen at the start). */
function hedgeBorder(B: Batch, seed: string) {
  const r = rng(seed);
  B.layer();
  const top = 1772;
  const pts: Pt[] = [[90, 2000]];
  for (let x = 90; x <= 950; x += 22) pts.push([x, top + Math.sin(x * 0.05) * 3 + r.range(-3, 3)]);
  pts.push([950, 2000]);
  B.poly(TT.hedge, pts);
  B.rect(TT.hedgeLit, 90, top - 2, 860, 14);
  let tufts = '';
  for (let x = 98; x < 945; x += r.range(14, 26)) tufts += crownD(x, top + r.range(24, 120), r.range(9, 16), r.range(6, 9), `${seed}/t${Math.round(x)}`, 5, 0.3);
  B.fill(TT.hedgeDeep, tufts);
  // blossoming shrubs rising from the hedge's crest (pink masses), and a run of tulips
  let shrubs = '';
  let bl = '';
  for (let x = 140; x < 920; x += r.range(120, 190)) {
    const rr = r.range(42, 64);
    shrubs += crownD(x, top - rr * 0.35, rr, rr * 0.62, `${seed}/sh${Math.round(x)}`, 8, 0.4);
    for (let k = 0; k < 9; k++) bl += blossomD(x + r.range(-0.8, 0.8) * rr, top - rr * 0.35 + r.range(-0.5, 0.4) * rr * 0.62, r.range(7, 11), `${seed}/b${Math.round(x)}${k}`, 4);
  }
  B.fill(BLOOM_NEAR.mid, shrubs);
  B.fill(TT.petal, bl);
  let tul = '';
  for (let x = 110; x < 940; x += r.range(16, 26)) tul += ellD(x, top - 8 + r.range(-4, 4), 7, 9);
  B.fill(CM.box, tul);
  B.ink(lineD(pts.slice(1, -1)), 4.8, TT.ink, 0.2);
}

/** Petal drifts: along the plinth, in joints, a few heaps (flat pink specks), deterministic. */
function drifts(B: Batch, seed: string) {
  const r = rng(seed);
  B.layer();
  // along the balustrade's base
  let d1 = '';
  let d2 = '';
  for (let x = -1100; x < 2200; x += r.range(6, 16)) {
    const y = TERRACE.railBase + r.range(0, 9);
    const s = r.range(2.2, 4.2);
    (r.chance(0.6) ? (d1 += ellD(x, y, s, s * 0.55)) : (d2 += ellD(x, y, s, s * 0.55)));
  }
  // drifts: clumps of petals (round the benches, in the corners of setts, in the shade), bigger toward us
  for (let c = 0; c < 26; c++) {
    const cy = r.range(TERRACE.railBase + 10, 1880);
    const cx = r.range(-200, 1250);
    const n = r.int(8, 22);
    const sp = deckPxPerM(cy) * r.range(0.4, 0.9);
    for (let i = 0; i < n; i++) {
      const x = cx + r.range(-1, 1) * sp;
      const y = cy + r.range(-0.35, 0.35) * sp;
      const s = 1.6 + deckPxPerM(y) * 0.04 * r.range(0.6, 1.3);
      (r.chance(0.5) ? (d1 += ellD(x, y, s, s * 0.6)) : (d2 += ellD(x, y, s, s * 0.6)));
    }
  }
  // scattered on the floor (bigger toward us)
  for (let i = 0; i < 520; i++) {
    const y = r.range(TERRACE.railBase + 8, 2100);
    const x = r.range(-1100, 2200);
    const s = 1.6 + deckPxPerM(y) * 0.045 * r.range(0.6, 1.3);
    (r.chance(0.55) ? (d1 += ellD(x, y, s, s * 0.6)) : (d2 += ellD(x, y, s, s * 0.6)));
  }
  B.fill(TT.petal, d1);
  B.fill(TT.petalShade, d2);
}

/** A park bench seen from behind (the backrest toward us): slats, two iron ends. x0..x1 = its width on screen. */
export function benchBack(B: Batch, x0: number, x1: number, yTop: number, yFeet: number, ink = 3.4) {
  const w = x1 - x0;
  const h = yFeet - yTop;
  const end = w * 0.07;
  // iron ends (legs + armrests)
  for (const ex of [x0, x1 - end]) {
    B.rect(TT.iron, ex, yTop + h * 0.08, end, h * 0.92);
  }
  // the seat (seen as a thin band above the legs) and three backrest slats
  B.rect(TT.woodShade, x0 + end * 0.6, yTop + h * 0.52, w - end * 1.2, h * 0.09);
  for (let k = 0; k < 3; k++) {
    const y = yTop + h * (0.06 + k * 0.15);
    B.rect(k === 0 ? TT.wood : mix(TT.wood, TT.woodShade, 0.4), x0 + end * 0.5, y, w - end, h * 0.1);
  }
  B.ink(lineD([[x0, yTop + h * 0.06], [x1, yTop + h * 0.06]]), ink, TT.ink);
  B.ink(lineD([[x0 + end * 0.5, yFeet], [x0 + end * 0.5, yTop + h * 0.1]]), ink, TT.ink);
  B.ink(lineD([[x1 - end * 0.5, yFeet], [x1 - end * 0.5, yTop + h * 0.1]]), ink, TT.ink);
}

export type TerraceProps = {seed?: string};

/** The deck (END coords): balustrade, paving, drifts, benches, bin, stroller, tulip bed, fountain. */
export const Terrace: React.FC<TerraceProps> = ({seed = 'deck'}) => {
  const b = useMemo(() => {
    const B = new Batch();
    paving(B, `${seed}/pav`);
    drifts(B, `${seed}/dr`);
    hedgeBorder(B, `${seed}/hedge`);
    B.layer();
    balustrade(B);
    // ---- (the stranger's bench is <StrangerBench/>: drawn OVER the seated figures, its backrest hides their backs)
    B.layer();
    // ---- a second bench, empty, nearer, right of centre (a paper cup on it)
    const sb0 = deckPt(2.9, 14.6);
    const sb1 = deckPt(4.8, 14.6);
    const sbT = deckPt(2.9, 14.6, 0.85);
    benchBack(B, sb0[0], sb1[0], sbT[1], sb0[1], 3.4);
    B.rect(TT.stoneLit, sb0[0] + 22, sbT[1] - 12, 10, 14);
    // ---- a bin (iron, with a lid) right of the bench
    const bi = deckPt(5.6, 16.4);
    const biT = deckPt(5.6, 16.4, 0.95);
    const bw = deckPxPerM(bi[1]) * 0.55;
    B.rect(TT.iron, bi[0] - bw / 2, biT[1], bw, bi[1] - biT[1]);
    B.rect(TT.ironLit, bi[0] - bw / 2, biT[1], bw * 0.3, bi[1] - biT[1]);
    B.rect(TT.iron, bi[0] - bw * 0.62, biT[1] - 6, bw * 1.24, 7);
    B.ink(lineD([[bi[0] - bw / 2, bi[1]], [bi[0] - bw / 2, biT[1]], [bi[0] + bw / 2, biT[1]], [bi[0] + bw / 2, bi[1]]]), 3.4, TT.ink);
    // ---- a stroller (its parent is K4's), left of centre, nearer
    const st = deckPt(7.4, 13.4);
    const pxm = deckPxPerM(st[1]);
    const sx = st[0];
    const sy = st[1];
    const hood: Pt[] = [
      [sx - 0.42 * pxm, sy - 0.52 * pxm],
      [sx - 0.3 * pxm, sy - 0.98 * pxm],
      [sx + 0.18 * pxm, sy - 1.02 * pxm],
      [sx + 0.36 * pxm, sy - 0.6 * pxm],
    ];
    B.poly(mix(CM.coatSlate, CM.paper, 0.15), [...hood, [sx + 0.36 * pxm, sy - 0.42 * pxm], [sx - 0.42 * pxm, sy - 0.42 * pxm]]);
    B.rect(CM.coatOat, sx - 0.4 * pxm, sy - 0.46 * pxm, 0.76 * pxm, 0.12 * pxm);
    for (const wx of [sx - 0.34 * pxm, sx + 0.3 * pxm]) B.fill(TT.iron, circleD(wx, sy - 0.1 * pxm, 0.11 * pxm));
    B.ink(lineD([[sx + 0.36 * pxm, sy - 0.6 * pxm], [sx + 0.62 * pxm, sy - 1.05 * pxm]]), 3.4, TT.ink);
    B.ink(lineD(hood), 3.4, TT.ink);
    // ---- the tulip bed (left, by the tree): a kerbed bed with rows of tulips
    const tb0 = deckPt(-4.4, 10.4);
    const tb1 = deckPt(-2.2, 10.4);
    const tb2 = deckPt(-2.2, 12.4);
    const tb3 = deckPt(-4.4, 12.4);
    B.poly(TT.stoneShade, [tb3, tb2, tb1, tb0]);
    const ins = (p: Pt, q: Pt, k: number): Pt => [p[0] + (q[0] - p[0]) * k, p[1] + (q[1] - p[1]) * k];
    B.poly(TT.soil, [ins(tb3, tb1, 0.06), ins(tb2, tb0, 0.06), ins(tb1, tb3, 0.06), ins(tb0, tb2, 0.06)]);
    const r = rng(`${seed}/tul`);
    let leaves = '';
    const heads: Map<string, string> = new Map();
    for (let dm = 10.7; dm < 12.2; dm += 0.3) {
      for (let xm = -4.2; xm < -2.4; xm += 0.24) {
        const p = deckPt(xm + r.range(-0.05, 0.05), dm);
        const s = deckPxPerM(p[1]);
        leaves += polyD([[p[0] - 0.05 * s, p[1]], [p[0], p[1] - 0.32 * s], [p[0] + 0.05 * s, p[1]]]);
        const col = TT.tulip[Math.floor(((xm + 6) * 3.1 + dm) % TT.tulip.length)];
        heads.set(col, (heads.get(col) ?? '') + ellD(p[0], p[1] - 0.36 * s, 0.07 * s, 0.09 * s));
      }
    }
    B.layer();
    B.fill(TT.leaf, leaves);
    heads.forEach((d, col) => B.fill(col, d));
    // ---- a low square planter of tulips left-front of the stranger's bench (it frames the start's bottom-left)
    {
      const q0 = deckPt(0.5, 13.0);
      const q1 = deckPt(1.5, 13.0);
      const qT = deckPt(0.5, 13.0, 0.42);
      const qw = q1[0] - q0[0];
      B.rect(TT.stone, q0[0], qT[1], qw, q0[1] - qT[1]);
      B.rect(TT.stoneShade, q0[0], qT[1], qw * 0.28, q0[1] - qT[1]);
      B.rect(TT.stoneLit, q0[0] - 3, qT[1] - 4, qw + 6, 6);
      B.rect(TT.soil, q0[0] + 3, qT[1] - 2, qw - 6, 4);
      let lv = '';
      const hd = new Map<string, string>();
      const g = rng(`${seed}/pt`);
      for (let x = q0[0] + 5; x < q1[0] - 4; x += 6.5) {
        const hh = g.range(16, 26);
        lv += `M${x - 2} ${qT[1]}L${x} ${qT[1] - hh * 0.8}L${x + 2} ${qT[1]}Z`;
        const col = TT.tulip[Math.floor(g.range(0, TT.tulip.length))];
        hd.set(col, (hd.get(col) ?? '') + ellD(x, qT[1] - hh, 3, 4));
      }
      B.fill(TT.leaf, lv);
      hd.forEach((d, col) => B.fill(col, d));
      B.ink(lineD([[q0[0], q0[1]], [q0[0], qT[1] - 4], [q1[0], qT[1] - 4], [q1[0], q0[1]]]), 2.2, TT.ink);
    }
    // ---- a near bench (empty, a dropped scarf on it), left of centre: at the start it is the warm mass across the
    //      bottom-left (the deck plane magnifies it 2.42x), at the end one more bench on the terrace
    {
      const n0 = deckPt(-2.8, 13.0);
      const n1 = deckPt(-0.7, 13.0);
      const nT = deckPt(-2.8, 13.0, 0.85);
      benchBack(B, n0[0], n1[0], nT[1], n0[1], 3.4);
      B.poly(CM.coatMustard, [[n0[0] + 30, nT[1] + 4], [n0[0] + 52, nT[1] + 2], [n0[0] + 50, nT[1] + 26], [n0[0] + 38, nT[1] + 30]]);
      B.fill(TT.shadowFloor, castShadowD((n0[0] + n1[0]) / 2, n0[1], n1[0] - n0[0]));
    }
    // ---- a stone planter with a small blossoming crabapple (right, mid-depth): its crown stays under the crane
    const pl = deckPt(5.8, 12.6);
    const plT = deckPt(5.8, 12.6, 0.55);
    const pw = deckPxPerM(pl[1]) * 1.6;
    B.rect(TT.stone, pl[0] - pw / 2, plT[1], pw, pl[1] - plT[1]);
    B.rect(TT.stoneShade, pl[0] - pw / 2, plT[1], pw * 0.3, pl[1] - plT[1]);
    B.rect(TT.stoneLit, pl[0] - pw / 2 - 4, plT[1] - 5, pw + 8, 8);
    B.ink(lineD([[pl[0] - pw / 2, pl[1]], [pl[0] - pw / 2, plT[1] - 5], [pl[0] + pw / 2, plT[1] - 5], [pl[0] + pw / 2, pl[1]]]), 3.4, TT.ink);
    const trT = deckPt(5.8, 12.6, 2.9);
    const crR = deckPxPerM(pl[1]) * 1.15;
    B.rect(TT.bark, pl[0] - 5, trT[1] + crR * 0.3, 10, plT[1] - trT[1] - crR * 0.3);
    B.fill(TT.crownShade, crownD(pl[0], trT[1] + crR * 0.15, crR, crR * 0.85, `${seed}/pc0`, 11, 0.15));
    B.fill(TT.crown, crownD(pl[0] + crR * 0.2, trT[1], crR * 0.7, crR * 0.62, `${seed}/pc1`, 9, 0.15));
    B.fill(TT.crownLit, crownD(pl[0] + crR * 0.42, trT[1] - crR * 0.12, crR * 0.32, crR * 0.28, `${seed}/pc2`, 6, 0.15));
    let pb = '';
    let ps = '';
    const pr = rng(`${seed}/pcb`);
    for (let i = 0; i < 34; i++) {
      const a = pr.range(0, Math.PI * 2);
      const d = Math.sqrt(pr.next()) * 0.9;
      const d2 = blossomD(pl[0] + Math.cos(a) * crR * d, trT[1] + crR * 0.1 + Math.sin(a) * crR * 0.8 * d, pr.range(6, 11), `${seed}/pcb${i}`, 4);
      if (Math.cos(a) > 0.1) pb += d2;
      else ps += d2;
    }
    B.fill(TT.petalShade, ps);
    B.fill(TT.petal, pb);
    B.ink(crownD(pl[0], trT[1] + crR * 0.15, crR, crR * 0.85, `${seed}/pc0`, 11, 0.15), 3.4, TT.ink, 0.4);

    return B;
  }, [seed]);
  return <Paint b={b} seed={seed} misreg={3} />;
};

/** The stranger's bench at the balustrade (END coords). Draw it AFTER the seated stranger and Pip. */
export const StrangerBench: React.FC<{seed?: string}> = ({seed = 'sbench'}) => {
  const b = useMemo(() => {
    const B = new Batch();
    const bn = TERRACE.bench;
    benchBack(B, bn.x0, bn.x1, bn.y0, bn.y1, 2.6);
    // the stranger's tote on the ground by the bench's right end
    B.poly(CM.coatOat, [[bn.x1 + 2, bn.y1], [bn.x1 + 4, bn.y1 - 12], [bn.x1 + 16, bn.y1 - 12], [bn.x1 + 18, bn.y1]]);
    B.ink(`M${bn.x1 + 6} ${bn.y1 - 12}q4 -7 8 0`, 1.6, TT.ink);
    return B;
  }, []);
  return <Paint b={b} seed={seed} misreg={2} />;
};

// ---------------------------------------------------------------- the terrace tree (LEFT frame), END coords

export const TREE_LEFT = {
  /** Crown box (cut by the left edge), trunk to the bottom-left. Top >= 640 (never near the band). */
  crown: {x0: -170, x1: 292, y0: 642, y1: 1268},
  trunk: {x: 70, base: 1990},
};

/** The blossoming terrace tree (cherry): plum-dark trunk and limbs, a crown of pink and fresh-sage masses, lit from
 *  the right (the sun beyond the view), shadow side to the left; blossom clusters on top. Optional burst. */
export const TerraceTree: React.FC<{burstAt?: number; seed?: string}> = ({burstAt, seed = 'tree'}) => {
  const trunk = useMemo(() => {
    const B = new Batch();
    const {trunk: T} = TREE_LEFT;
    B.poly(TT.bark, [
      [T.x - 46, T.base],
      [T.x - 30, 1560],
      [T.x - 62, 1350],
      [T.x - 120, 1210],
      [T.x - 92, 1196],
      [T.x - 26, 1300],
      [T.x + 18, 1180],
      [T.x + 60, 1100],
      [T.x + 86, 1112],
      [T.x + 40, 1240],
      [T.x + 30, 1500],
      [T.x + 52, T.base],
    ]);
    B.poly(TT.barkLit, [
      [T.x + 20, T.base],
      [T.x + 14, 1520],
      [T.x + 22, 1300],
      [T.x + 34, 1250],
      [T.x + 30, 1500],
      [T.x + 52, T.base],
    ]);
    B.ink(lineD([[T.x - 46, T.base], [T.x - 30, 1560], [T.x - 62, 1350], [T.x - 120, 1210]]), 4.8, TT.ink);
    B.ink(lineD([[T.x + 52, T.base], [T.x + 30, 1500], [T.x + 40, 1240], [T.x + 86, 1112]]), 4.8, TT.ink);
    B.poly(TT.bark, [[T.x - 140, 1990], [T.x - 60, 1880], [T.x - 40, 1990]]);
    return B;
  }, []);
  const crowns = useMemo<CrownSpec[]>(() => {
    const C = TREE_LEFT.crown;
    const light: Pt = [0.82, -0.57];
    const m: [number, number, number, number][] = [
      [C.x0 + 120, 1090, 220, 160],
      [C.x0 + 260, 1150, 150, 100],
      [C.x0 + 150, 905, 245, 185],
      [C.x0 + 330, 975, 140, 130],
      [C.x0 + 250, 780, 185, 128],
      [C.x0 + 385, 845, 80, 86],
    ];
    return m.map(([cx, cy, rx, ry], i) => ({cx, cy, rx, ry, seed: `${seed}/m${i}`, light, bloom: 0.9}));
  }, [seed]);
  return (
    <>
      <Paint b={trunk} seed={`${seed}/trunk`} misreg={3} />
      <BloomCrowns crowns={crowns} burstAt={burstAt} seed={`${seed}/bl`} />
    </>
  );
};

/** The bottom-right corner: a blossoming crown cut by the right edge and the bottom (the end lamppost stands in front
 *  of it). With the terrace tree and the hedge it frames the view in dark masses (CINEMATIC_GUIDE Scale cues 8). */
export const CORNER_TREE = {cx: 1110, cy: 1700, rx: 250, ry: 200};
export const CornerTree: React.FC<{seed?: string}> = ({seed = 'corner'}) => {
  const crowns = useMemo<CrownSpec[]>(() => {
    const C = CORNER_TREE;
    const light: Pt = [-0.3, -0.95];
    return [
      {cx: C.cx + 40, cy: C.cy + 80, rx: C.rx, ry: C.ry, seed: `${seed}/0`, light, bloom: 0.8},
      {cx: C.cx - 90, cy: C.cy - 10, rx: C.rx * 0.62, ry: C.ry * 0.6, seed: `${seed}/1`, light, bloom: 0.9},
      {cx: C.cx + 10, cy: C.cy - 90, rx: C.rx * 0.55, ry: C.ry * 0.5, seed: `${seed}/2`, light, bloom: 0.9},
    ];
  }, [seed]);
  return <BloomCrowns crowns={crowns} seed={`${seed}/bl`} />;
};

// ---------------------------------------------------------------- lampposts

/** A terrace lamppost (cast iron, a lantern head), drawn with its BASE at (0, 0), `h` px tall to the finial. Optional
 *  hanging flower basket (the wipe's mass). */
export const LampPost: React.FC<{h: number; basket?: boolean; ink?: number; seed?: string}> = ({h, basket = false, ink = 4.8, seed = 'lamp'}) => {
  const t = useTime();
  const k = h / 560; // the reference drawing is 560 px tall
  const b = useMemo(() => {
    const B = new Batch();
    const pw = 26 * k;
    // base plinth, fluted pole, collar, lantern, finial
    B.rect(TT.iron, -pw * 1.3, -60 * k, pw * 2.6, 60 * k);
    B.rect(TT.ironLit, -pw * 1.3, -60 * k, pw * 0.7, 60 * k);
    B.rect(TT.iron, -pw / 2, -470 * k, pw, 420 * k);
    B.rect(TT.ironLit, -pw / 2, -470 * k, pw * 0.3, 420 * k);
    B.rect(TT.iron, -pw * 0.9, -478 * k, pw * 1.8, 14 * k);
    // the lantern: a tapered glass box with an iron cap
    const lw = 64 * k;
    B.poly(TT.lampGlass, [[-lw * 0.42, -478 * k], [lw * 0.42, -478 * k], [lw * 0.55, -540 * k], [-lw * 0.55, -540 * k]]);
    B.rect(TT.iron, -lw * 0.05, -540 * k, lw * 0.1, 62 * k);
    B.poly(TT.iron, [[-lw * 0.62, -540 * k], [lw * 0.62, -540 * k], [lw * 0.12, -556 * k], [-lw * 0.12, -556 * k]]);
    B.fill(TT.iron, circleD(0, -558 * k, 5 * k));
    if (basket) {
      // a bracket arm and a hanging basket of flowers (a wide soft mass at the lantern's height)
      B.rect(TT.iron, 0, -452 * k, 120 * k, 7 * k);
      B.ink(lineD([[118 * k, -452 * k], [118 * k, -420 * k]]), Math.max(1.6, 2.2 * k), TT.ink);
      B.fill(TT.basketLeaf, crownD(118 * k, -380 * k, 112 * k, 58 * k, `${seed}/bk`, 9, 0.1));
      B.fill(TT.soil, `M${(118 - 70) * k} ${-372 * k}Q${118 * k} ${-310 * k} ${(118 + 70) * k} ${-372 * k}Z`);
      B.rect(TT.iron, -120 * k, -452 * k, 120 * k, 7 * k);
      B.fill(TT.basketLeaf, crownD(-118 * k, -380 * k, 112 * k, 58 * k, `${seed}/bk2`, 9, 0.1));
      B.fill(TT.soil, `M${(-118 - 70) * k} ${-372 * k}Q${-118 * k} ${-310 * k} ${(-118 + 70) * k} ${-372 * k}Z`);
    }
    B.ink(lineD([[-pw / 2, -50 * k], [-pw / 2, -470 * k]]), ink, TT.ink);
    B.ink(lineD([[pw / 2, -50 * k], [pw / 2, -470 * k]]), ink, TT.ink);
    B.ink(lineD([[-lw * 0.42, -478 * k], [-lw * 0.55, -540 * k], [lw * 0.55, -540 * k], [lw * 0.42, -478 * k], [-lw * 0.42, -478 * k]]), ink * 0.8, TT.ink);
    return B;
  }, [k, basket, ink, seed]);
  // the basket's flowers nod a little (a soft sway), deterministic
  const flowers = useMemo(() => {
    if (!basket) return [];
    const r = rng(`${seed}/fl`);
    return Array.from({length: 26}, (_, i) => ({x: (i < 13 ? 118 : -118) * k + r.range(-95, 95) * k, y: -380 * k + r.range(-50, 20) * k, rr: r.range(9, 15) * k, col: r.pick(TT.tulip), ph: r.range(0, 6)}));
  }, [basket, k, seed]);
  const fl: Map<string, string> = new Map();
  for (const f of flowers) fl.set(f.col, (fl.get(f.col) ?? '') + circleD(f.x + Math.sin(t * 1.3 + f.ph) * 1.5 * k, f.y, f.rr));
  return (
    <>
      <Paint b={b} seed={seed} misreg={2} />
      {[...fl.entries()].map(([c, d]) => (
        <path key={c} d={d} fill={c} />
      ))}
    </>
  );
};

/** The END lamppost (right frame): base cut by the bottom-right, its lantern below the horizon (the crane is above
 *  it). END coords. */
export const LAMP_RIGHT = {x: 1006, base: 1990, h: 640};

// ---------------------------------------------------------------- pigeons (deck life) and cast shadows

/** A flat cast shadow on the floor under a thing at screen (x, y) of width w px (the sun is beyond: toward us-left). */
export const castShadowD = (x: number, y: number, w: number) => ellD(x - w * 0.18, y + w * 0.1, w * 0.62, w * 0.16);

/** Pigeons on the terrace floor (END coords): pecking (head bobs), one hops now and then. Life on the deck. */
export const Pigeons: React.FC<{seed?: string; spots?: [number, number][]}> = ({seed = 'pig', spots = [[-1.2, 17.5], [-0.7, 18.2], [0.2, 17.0], [1.6, 19.0], [2.2, 16.2], [-2.6, 15.4], [3.4, 18.6]]}) => {
  const t = useTime();
  let body = '';
  let head = '';
  let bar = '';
  let sh = '';
  let legs = '';
  spots.forEach(([lx, d], i) => {
    const [x0, y0] = deckPt(lx, d);
    const s = deckPxPerM(y0) * 0.34; // a pigeon ~0.34 m long
    const ph = rand(seed, `p${i}`) * 6;
    const hopT = (t + ph) % 3.4;
    const hop = hopT < 0.28 ? -s * 0.9 * 4 * (hopT / 0.28) * (1 - hopT / 0.28) : 0;
    const walk = Math.sin((t + ph) * 0.6) * s * 0.6;
    const x = x0 + walk;
    const y = y0 + hop;
    const peck = Math.max(0, Math.sin((t + ph) * 5.2)) * s * 0.28;
    const dir = i % 2 ? 1 : -1;
    sh += ellD(x - s * 0.1, y0 + s * 0.04, s * 0.48, s * 0.11);
    // plump body (breast toward the head), tail wedge, a neck rising to a small head that pecks
    body += smoothClosed([
      [x + dir * s * 0.34, y - s * 0.5],
      [x + dir * s * 0.46, y - s * 0.3],
      [x + dir * s * 0.2, y - s * 0.1],
      [x - dir * s * 0.3, y - s * 0.16],
      [x - dir * s * 0.62, y - s * 0.3],
      [x - dir * s * 0.3, y - s * 0.42],
    ]);
    head += circleD(x + dir * s * 0.44, y - s * 0.62 + peck, s * 0.13);
    bar += ellD(x - dir * s * 0.04, y - s * 0.34, s * 0.2, s * 0.06);
    legs += `M${x} ${y - s * 0.12}v${s * 0.12 - hop}M${x + dir * s * 0.1} ${y - s * 0.12}v${s * 0.12 - hop}`;
  });
  return (
    <>
      <path d={sh} fill={TT.shadowFloor} />
      <path d={body} fill={mix(CM.stoneShade, CM.paneUnlit, 0.35)} />
      <path d={bar} fill={CM.paper} />
      <path d={head} fill={CM.paneUnlit} />
      <path d={legs} stroke={CM.brickDeep} strokeWidth={1.2} fill="none" />
    </>
  );
};

// ---------------------------------------------------------------- petals near the lens (screen space)

/** Petals drifting down near the lens: born below y 600 (never in the caption band), falling 36-70 px/s with a sway,
 *  flipping (a squash, never a fade). `n` at once. */
export const NearPetals: React.FC<{n?: number; seed?: string; x0?: number; x1?: number}> = ({n = 14, seed = 'petals', x0 = -40, x1 = 1120}) => {
  const t = useTime();
  let a = '';
  let b = '';
  for (let i = 0; i < n; i++) {
    const v = 36 + rand(seed, `v${i}`) * 34;
    const span = 1500;
    const life = span / v;
    const ph = rand(seed, `p${i}`) * life;
    const k = frac((t + ph) / life);
    const y = 620 + k * span;
    const x = x0 + rand(seed, `x${i}`) * (x1 - x0) + Math.sin((t + ph) * 1.7 + i) * 26 - k * 120;
    const s = 5 + rand(seed, `s${i}`) * 5;
    const flip = Math.abs(Math.cos((t + ph) * 3.1 + i));
    const d = ellD(x, y, s, s * (0.25 + 0.55 * flip));
    if (i % 3) a += d;
    else b += d;
  }
  return (
    <>
      <path d={a} fill={TT.petal} />
      <path d={b} fill={TT.petalShade} />
    </>
  );
};
