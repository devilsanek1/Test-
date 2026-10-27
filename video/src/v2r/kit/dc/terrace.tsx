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

// ---------------------------------------------------------------- the deck camera

export const DECK_CAM = {f: 1000, h: 9.2, horizon: 800, vpx: 540, railD: 21.6};
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
  bench: {x0: 289, x1: 384, y0: 1170, y1: 1240},
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
  joint: mix(CM.paving, CM.line, 0.45),
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
  crown: mix(CM.sage, CM.shadeWarm, 0.25),
  crownShade: mix(CM.shadeWarm, CM.anchor, 0.2),
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

/** Paving: broken joints in true perspective (rows parallel to the balustrade, joints converging on the VP),
 *  lit and shade slabs scattered, petal drifts along the plinth and the joints. */
function paving(B: Batch, seed: string) {
  const r = rng(seed);
  const yTop = TERRACE.railBase;
  // the floor slab (to the frame bottom and beyond: the deck's start scale needs y up to ~1700 only)
  B.rect(TT.paving, -1100, yTop - 2, 3300, 2200 - yTop);
  // slabs a step lighter / darker (a few, never a grid)
  B.layer();
  const rows: number[] = [];
  for (let d = DECK_CAM.railD - 0.4; d > 4.5; d -= 1.2) rows.push(d);
  for (let i = 0; i < rows.length - 1; i++) {
    const d0 = rows[i];
    const d1 = rows[i + 1];
    for (let xm = -16; xm < 16; xm += 1.2) {
      const k = r.next();
      if (k > 0.2) continue;
      const off = i % 2 ? 0.6 : 0;
      const a = deckPt(xm + off, d0);
      const b2 = deckPt(xm + off + 1.2, d0);
      const c = deckPt(xm + off + 1.2, d1);
      const dd = deckPt(xm + off, d1);
      B.poly(k < 0.1 ? TT.pavingLit : TT.pavingShade, [a, b2, c, dd]);
    }
  }
  // joints: rows (broken), and the cross joints (staggered per row, broken)
  B.layer();
  for (let i = 0; i < rows.length; i++) {
    const d = rows[i];
    const y = deckPt(0, d)[1];
    const w = Math.min(3.4, 1.2 + (y - 1200) / 260);
    let x = -1100 + r.range(0, 40);
    while (x < 2200) {
      const len = r.range(120, 340);
      B.ink(lineD([[x, y + r.range(-1, 1)], [x + len, y + r.range(-1, 1)]]), w, TT.joint);
      x += len + r.range(14, 60);
    }
    if (i < rows.length - 1) {
      const d1 = rows[i + 1];
      const off = i % 2 ? 0.6 : 0;
      for (let xm = -16; xm < 16; xm += 1.2) {
        if (r.chance(0.3)) continue;
        B.ink(lineD([deckPt(xm + off, d), deckPt(xm + off, d1)]), w * 0.85, TT.joint);
      }
    }
  }
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
    B.layer();
    balustrade(B);
    // ---- (the stranger's bench is <StrangerBench/>: drawn OVER the seated figures, its backrest hides their backs)
    B.layer();
    // ---- a second bench, empty, nearer, right of centre (a paper cup on it)
    const sb0 = deckPt(1.0, 14.6);
    const sb1 = deckPt(2.9, 14.6);
    const sbT = deckPt(1.0, 14.6, 0.85);
    benchBack(B, sb0[0], sb1[0], sbT[1], sb0[1], 3.4);
    B.rect(TT.stoneLit, sb0[0] + 22, sbT[1] - 12, 10, 14);
    // ---- a bin (iron, with a lid) right of the bench
    const bi = deckPt(4.6, 16.4);
    const biT = deckPt(4.6, 16.4, 0.95);
    const bw = deckPxPerM(bi[1]) * 0.55;
    B.rect(TT.iron, bi[0] - bw / 2, biT[1], bw, bi[1] - biT[1]);
    B.rect(TT.ironLit, bi[0] - bw / 2, biT[1], bw * 0.3, bi[1] - biT[1]);
    B.rect(TT.iron, bi[0] - bw * 0.62, biT[1] - 6, bw * 1.24, 7);
    B.ink(lineD([[bi[0] - bw / 2, bi[1]], [bi[0] - bw / 2, biT[1]], [bi[0] + bw / 2, biT[1]], [bi[0] + bw / 2, bi[1]]]), 3.4, TT.ink);
    // ---- a stroller (its parent is K4's), left of centre, nearer
    const st = deckPt(-1.4, 12.4);
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
    const tb0 = deckPt(-5.6, 10.6);
    const tb1 = deckPt(-3.0, 10.6);
    const tb2 = deckPt(-3.0, 13.4);
    const tb3 = deckPt(-5.6, 13.4);
    B.poly(TT.stoneShade, [tb3, tb2, tb1, tb0]);
    const ins = (p: Pt, q: Pt, k: number): Pt => [p[0] + (q[0] - p[0]) * k, p[1] + (q[1] - p[1]) * k];
    B.poly(TT.soil, [ins(tb3, tb1, 0.06), ins(tb2, tb0, 0.06), ins(tb1, tb3, 0.06), ins(tb0, tb2, 0.06)]);
    const r = rng(`${seed}/tul`);
    let leaves = '';
    const heads: Map<string, string> = new Map();
    for (let dm = 10.9; dm < 13.2; dm += 0.32) {
      for (let xm = -5.4; xm < -3.2; xm += 0.26) {
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
    // ---- a drinking fountain (a stone post with a bowl) right of centre, mid-depth
    const df = deckPt(3.4, 12.0);
    const dfT = deckPt(3.4, 12.0, 0.95);
    const dw = deckPxPerM(df[1]) * 0.42;
    B.rect(TT.stone, df[0] - dw / 2, dfT[1], dw, df[1] - dfT[1]);
    B.rect(TT.stoneShade, df[0] - dw / 2, dfT[1], dw * 0.32, df[1] - dfT[1]);
    B.fill(TT.stoneLit, ellD(df[0], dfT[1], dw * 0.85, dw * 0.28));
    B.ink(lineD([[df[0] - dw / 2, df[1]], [df[0] - dw / 2, dfT[1]], [df[0] + dw / 2, dfT[1]], [df[0] + dw / 2, df[1]]]), 3.4, TT.ink);
    return B;
  }, [seed]);
  return <Paint b={b} seed={seed} misreg={3} />;
};

/** The stranger's bench at the balustrade (END coords). Draw it AFTER the seated stranger and Pip. */
export const StrangerBench: React.FC<{seed?: string}> = ({seed = 'sbench'}) => {
  const b = useMemo(() => {
    const B = new Batch();
    const bn = TERRACE.bench;
    benchBack(B, bn.x0, bn.x1, bn.y0 + 8, bn.y1, 2.6);
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
  const t = useTime();
  const {stat, clusters} = useMemo(() => {
    const B = new Batch();
    const {crown: C, trunk: T} = TREE_LEFT;
    // trunk and limbs
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
    // roots cut by the bottom-left
    B.poly(TT.bark, [[T.x - 140, 1990], [T.x - 60, 1880], [T.x - 40, 1990]]);
    B.layer();
    // crown masses: shade (left/lower) first, then mid, then lit (upper right)
    const masses: [number, number, number, number, string][] = [
      [C.x0 + 120, 1080, 230, 170, TT.crownShade],
      [C.x0 + 250, 1150, 170, 110, TT.crownShade],
      [C.x0 + 150, 900, 250, 190, TT.crown],
      [C.x0 + 330, 960, 150, 140, TT.crown],
      [C.x0 + 260, 770, 190, 130, mix(TT.crown, CM.sage, 0.5)],
      [C.x0 + 390, 830, 80, 90, mix(TT.crown, CM.sage, 0.5)],
    ];
    masses.forEach(([cx, cy, rx, ry, col], i) => B.fill(col, crownD(cx, cy, rx, ry, `${seed}/m${i}`, 10, 0.25)));
    B.ink(crownD(C.x0 + 260, 770, 190, 130, `${seed}/m4`, 10, 0.25), 3.4, TT.ink, 0.35);
    // clusters of blossom over the crown (more on the lit side)
    const r = rng(`${seed}/bl`);
    const cl: {x: number; y: number; r: number; lit: boolean; i: number}[] = [];
    let i = 0;
    for (const [cx, cy, rx, ry] of masses) {
      const n = Math.round((rx * ry) / 260);
      for (let k = 0; k < n; k++, i++) {
        const a = r.range(0, Math.PI * 2);
        const d = Math.sqrt(r.next()) * 0.9;
        const x = cx + Math.cos(a) * rx * d;
        const y = cy + Math.sin(a) * ry * d;
        if (y < C.y0 + 8) continue;
        cl.push({x, y, r: r.range(9, 18), lit: x > cx - rx * 0.2 && y < cy + ry * 0.2, i});
      }
    }
    return {stat: B, clusters: cl};
  }, [seed]);
  let lit = '';
  let sh = '';
  for (const c of clusters) {
    const s = burstScale(t, burstAt, c.i);
    if (s <= 0) continue;
    const d = blossomD(c.x, c.y, c.r * s, `${seed}c${c.i}`, 5);
    if (c.lit) lit += d;
    else sh += d;
  }
  return (
    <>
      <Paint b={stat} seed={seed} misreg={3} />
      <path d={sh} fill={TT.petalShade} />
      <path d={lit} fill={TT.petal} />
    </>
  );
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
