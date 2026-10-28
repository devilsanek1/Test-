// V2S5_deck_props.tsx (lane L4, TERRACE): the terrace's built things in END coords (deck plane), each a static Batch
// with the screen y of its foot (for depth sorting with the people) and its LIGHT (lib/light, drawn by S5Deck in the
// deck's ONE ShadowLayer: contact strips, casts along the rig's sun, the shade under a seat; never a hand-picked dark fill):
//   the BALUSTRADE (the one level line, authored x -1100..2200: past both edges at every p), the STRANGER'S BENCH in
//   two parts (UNDER the figures: the top rail's right half, Pip's perch; OVER the figures: the top rail's left half
//   across the stranger's back, the iron ends, the seat's back edge), park benches (one family: plum cast-iron ends, a
//   brick top rail, an OPEN back), a bin, a drinking fountain, raised tulip beds (calm colour drifts), a crabapple
//   planter, a bike leaning on the balustrade (its frame and wheels ARE lines: `thing`), a viewpoint lectern (no words),
//   the stranger's tote. Tier C (V2S5_set wraps the deck in the environment tier): no outlines; lines that are the
//   thing stay as hairlines.
import {CM} from '../palette';
import {Batch, mix, crownD, ellD, lineD, polyD, rng, smoothClosed, blossomD, type Pt} from '../kit/dc/core';
import {CAM, dpt, pxmD, RAIL, DT, SPOT} from './V2S5_deck_cam';

/** A prop's light (END coords): contact strips (an ellipse footprint, or a path), casts (a footprint swept along the
 *  rig's sun, `h` px tall), extra flat shade shapes (the floor under a seat). */
export type PropLight = {
  contact?: {x: number; y: number; w: number; h?: number; k?: number; d?: string}[];
  cast?: {x: number; y: number; w: number; h: number; depth?: number; pts?: Pt[]}[];
  shade?: {d: string; tint?: 'cast' | 'contact' | 'form'; soft?: number}[];
};
export type Prop = {y: number; b: Batch; key: string; light?: PropLight};

// ---------------------------------------------------------------- the balustrade

/** The balustrade: plinth, vase balusters every 0.3 m, piers every 3.6 m (one behind the news box, one behind the
 *  plaque), a coping with a lit top. Authored x -1100..2200 at the rail depth. Part of the set: drawn before the
 *  deck's shadows (they fall on its plinth too). */
export function balustrade(): Batch {
  const B = new Batch();
  const d = RAIL.d;
  const k = pxmD(d);
  const x0 = -1100;
  const x1 = 2200;
  const yTop = RAIL.top;
  const yCopB = RAIL.coping;
  const yPl = RAIL.plinth;
  const yBase = RAIL.base;
  // the plinth (its face toward us in shade, a lit top edge)
  B.rect(DT.stoneMid, x0, yPl, x1 - x0, yBase - yPl + 1);
  B.rect(DT.stone, x0, yPl - 1.2, x1 - x0, 2.2);
  B.layer();
  // piers (X every 3.6 m from -1.8: just left of the bench, behind the news box, behind the plaque, ...)
  const pierX: number[] = [];
  for (let X = -1.8 - 3.6 * 30; X < 60; X += 3.6) {
    const sx = CAM.vpx + (CAM.f * X) / d;
    if (sx > x0 - 30 && sx < x1 + 30) pierX.push(sx);
  }
  const pw = 0.42 * k;
  const isPier = (x: number) => pierX.some((p) => Math.abs(x - p) < pw * 0.5 + 0.12 * k);
  // balusters: a vase shape (flat), lit right, shade left
  const bw = 0.13 * k;
  const step = 0.34 * k;
  let lit = '';
  let shd = '';
  for (let x = x0; x < x1; x += step) {
    const cx = x + step / 2;
    if (isPier(cx)) continue;
    const yb = yCopB + 0.02 * k;
    const ye = yPl - 0.01 * k;
    const h = ye - yb;
    lit += smoothClosed([
      [cx - bw * 0.3, yb],
      [cx + bw * 0.3, yb],
      [cx + bw * 0.22, yb + h * 0.22],
      [cx + bw * 0.55, yb + h * 0.62],
      [cx + bw * 0.42, ye],
      [cx - bw * 0.42, ye],
      [cx - bw * 0.55, yb + h * 0.62],
      [cx - bw * 0.22, yb + h * 0.22],
    ]);
    shd += polyD([
      [cx - bw * 0.55, yb + h * 0.5],
      [cx - bw * 0.05, yb + h * 0.42],
      [cx - bw * 0.05, ye],
      [cx - bw * 0.42, ye],
    ]);
  }
  B.fill(DT.stone, lit);
  B.fill(DT.stoneMid, shd);
  B.layer();
  // piers: a block with its shade side left, a cap over the coping
  let pl = '';
  let ps = '';
  let pc = '';
  for (const px of pierX) {
    pl += polyD([[px - pw / 2, yTop], [px + pw / 2, yTop], [px + pw / 2, yBase], [px - pw / 2, yBase]]);
    ps += polyD([[px - pw / 2, yTop], [px - pw * 0.12, yTop], [px - pw * 0.12, yBase], [px - pw / 2, yBase]]);
    pc += polyD([[px - pw * 0.62, yTop - 0.09 * k], [px + pw * 0.62, yTop - 0.09 * k], [px + pw * 0.62, yTop + 0.02 * k], [px - pw * 0.62, yTop + 0.02 * k]]);
  }
  B.fill(DT.stone, pl);
  B.fill(DT.stoneMid, ps);
  // the coping: front face, lit top, a shade strip under it
  B.rect(DT.stone, x0, yTop, x1 - x0, yCopB - yTop);
  B.rect(DT.stoneLit, x0, yTop - 1.4, x1 - x0, 2.6);
  B.rect(DT.stoneShade, x0, yCopB, x1 - x0, Math.max(1.2, 0.03 * k));
  B.fill(DT.stoneLit, pc);
  return B;
}

// ---------------------------------------------------------------- benches (one family)

type BenchO = {x0: number; x1: number; yRail: number; yFeet: number; d: number; part?: 'all' | 'under' | 'over'; split?: number; yBack?: number};

/** A park bench seen from behind (its back toward us): plum cast-iron ends, a brick top rail, an OPEN back (the
 *  sitters' whole backs show), the seat's back edge. Screen box x0..x1, the top rail's top at yRail, the back legs'
 *  feet at yFeet. `part` splits it for the stranger's bench. Its light: `benchLight`. */
export function benchBack(B: Batch, o: BenchO) {
  const {x0, x1, yRail, yFeet, d} = o;
  const part = o.part ?? 'all';
  const k = pxmD(d);
  const endW = Math.max(2.2, 0.07 * k);
  const railH = Math.max(2.6, 0.11 * k);
  const seatY = yFeet - 0.45 * k;
  const seatFrontY = seatY - 0.14 * k;
  const split = o.split ?? x1;
  const under = part === 'all' || part === 'under';
  const over = part === 'all' || part === 'over';
  if (under) {
    // under the seat: a stretcher and a middle leg (the floor's shade there is the light layer's: benchLight)
    B.rect(DT.iron, x0 + endW * 0.5, yFeet - 0.17 * k, x1 - x0 - endW, Math.max(1, 0.025 * k));
    const xm = (x0 + x1) / 2;
    B.rect(DT.iron, xm - Math.max(1, 0.025 * k), seatY, Math.max(2, 0.05 * k), yFeet - seatY);
    // the seat's top (seen from above-behind, beyond its back edge: lit, thin)
    B.poly(DT.woodLit, [[x0 + endW * 0.6, seatFrontY], [x1 - endW * 0.6, seatFrontY], [x1 - endW * 0.6, seatY], [x0 + endW * 0.6, seatY]]);
    // the top rail's part UNDER the figures (Pip's perch): from the split to the right end
    if (split < x1) {
      B.rect(DT.wood, split, yRail, x1 - endW * 0.5 - split, railH);
      B.rect(DT.woodLit, split, yRail - 0.4, x1 - endW * 0.5 - split, Math.max(1, railH * 0.3));
    }
  }
  if (over) {
    B.layer();
    // the seat's back edge (the plank nearest us, at the sitters' hips)
    B.rect(DT.wood, x0 + endW * 0.6, seatY - Math.max(1.4, 0.06 * k), x1 - x0 - endW * 1.2, Math.max(2.2, 0.085 * k));
    // the top rail's part over the figures (across the stranger's back)
    const xr = Math.min(split, x1 - endW * 0.5);
    B.rect(DT.wood, x0 + endW * 0.5, yRail, xr - x0 - endW * 0.5, railH);
    B.rect(DT.woodLit, x0 + endW * 0.5, yRail - 0.4, xr - x0 - endW * 0.5, Math.max(1, railH * 0.3));
    // the cast-iron ends: leg + armrest + the back upright (seen from behind: a slim S), lit edge right
    for (const ex of [x0, x1 - endW]) {
      const arm = seatY - 0.24 * k;
      B.poly(DT.iron, [
        [ex, yFeet],
        [ex + endW, yFeet],
        [ex + endW * 0.9, seatY],
        [ex + endW * 1.15, arm],
        [ex + endW, yRail - 0.02 * k],
        [ex, yRail - 0.02 * k],
        [ex - endW * 0.15, arm],
        [ex + endW * 0.1, seatY],
      ]);
      B.rect(DT.ironLit, ex + endW * 0.62, yRail + railH, endW * 0.3, yFeet - yRail - railH);
    }
  }
}

/** A bench's light: the floor (and the plinth behind, for a bench at the rail) under its seat one cast step down, a
 *  contact strip along its feet, its cast (the seat-and-back block swept along the sun). */
export function benchLight(o: BenchO): PropLight {
  const {x0, x1, yFeet, d} = o;
  const k = pxmD(d);
  const endW = Math.max(2.2, 0.07 * k);
  const seatY = yFeet - 0.45 * k;
  const yTop = o.yBack !== undefined ? seatY : seatY + 0.04 * k;
  const under = polyD([[x0 + endW * 0.5, yTop], [x1 - endW * 0.5, yTop], [x1 - endW * 0.3, yFeet + 0.01 * k], [x0 + endW * 0.3, yFeet + 0.01 * k]]);
  // the footprint: the back feet's line (nearest us) to the front feet 0.45 m deeper (higher on screen)
  const yFront = CAM.hz + (CAM.f * CAM.h) / ((CAM.f * CAM.h) / Math.max(1, yFeet - CAM.hz) + 0.45);
  const pts: Pt[] = [[x0, yFeet], [x1, yFeet], [x1 - 0.02 * k, yFront], [x0 + 0.02 * k, yFront]];
  return {
    shade: [{d: under, tint: 'cast'}],
    contact: [{x: (x0 + x1) / 2, y: yFeet - 0.5, w: x1 - x0, h: Math.max(5, Math.min(12, 0.16 * k))}],
    cast: [{x: (x0 + x1) / 2, y: (yFeet + yFront) / 2, w: x1 - x0, h: 0.86 * k, pts}],
  };
}

/** The stranger's bench at the rail: top rail's top = Pip's seat, feet at y 1240 (contract). The split sits between
 *  the stranger's paper (START x <= 350) and Pip's left ear (START x >= 360): START x 354 = END 340.5. */
export const STRANGER_BENCH = {x0: SPOT.bench.x0, x1: SPOT.bench.x1, yRail: SPOT.pipSeat[1], yFeet: SPOT.bench.y1, split: 340.5};
const strangerO = (part: 'under' | 'over'): BenchO => {
  const sb = STRANGER_BENCH;
  const d = (CAM.f * CAM.h) / (sb.yFeet - CAM.hz);
  return {x0: sb.x0, x1: sb.x1, yRail: sb.yRail, yFeet: sb.yFeet, d, part, split: sb.split, yBack: RAIL.base};
};
/** The stranger's tote leaning on the bench's left iron end (on the floor). */
const TOTE = {x: STRANGER_BENCH.x0 - 15, y: STRANGER_BENCH.yFeet - 1};
export function strangerBench(part: 'under' | 'over'): Batch {
  const B = new Batch();
  if (part === 'under') {
    const {x: tx, y: ty} = TOTE;
    B.poly(CM.coatOat, [[tx, ty], [tx + 1.2, ty - 13], [tx + 13.5, ty - 13.5], [tx + 14.5, ty]]);
    B.poly(mix(CM.coatOat, CM.shadeWarm, 0.3), [[tx, ty], [tx + 1.2, ty - 13], [tx + 4, ty - 13.2], [tx + 3.6, ty]]);
    // its strap IS a line (a hairline on the environment tier)
    B.ink(`M${tx + 3.6} ${ty - 13.2}q4 -8 8.4 0`, 1.1, mix(CM.coatOat, CM.shadeWarm, 0.45), 0, {thing: true});
  }
  benchBack(B, strangerO(part));
  return B;
}
/** The stranger's bench's light (and the tote's contact strip). */
export function strangerBenchLight(): PropLight {
  const L = benchLight(strangerO('under'));
  L.contact = [...(L.contact ?? []), {x: TOTE.x + 7, y: TOTE.y + 0.5, w: 14.5, h: 4}];
  return L;
}

// ---------------------------------------------------------------- small things on the terrace

/** A park bench facing the view at depth d (backrest toward us), from X0 to X1 (m). */
export function parkBench(X0: number, X1: number, d: number, extra?: (B: Batch, a: Pt, b: Pt, k: number) => void): Prop {
  const B = new Batch();
  const k = pxmD(d);
  const a = dpt(X0, d);
  const b = dpt(X1, d);
  const yRail = dpt(X0, d, 0.92)[1];
  const o: BenchO = {x0: a[0], x1: b[0], yRail, yFeet: a[1], d, part: 'all'};
  benchBack(B, o);
  if (extra) {
    B.layer();
    extra(B, a, b, k);
  }
  return {y: a[1], b: B, key: `bench${X0}`, light: benchLight(o)};
}

/** An iron litter bin with a domed lid at (X, d). */
export function bin(X: number, d: number): Prop {
  const B = new Batch();
  const k = pxmD(d);
  const [x, y] = dpt(X, d);
  const w = 0.5 * k;
  const h = 0.95 * k;
  B.rect(DT.iron, x - w / 2, y - h, w, h);
  B.rect(DT.ironLit, x + w * 0.18, y - h + 2, w * 0.22, h - 2);
  B.fill(DT.iron, `M${x - w * 0.56} ${y - h}Q${x} ${y - h - 0.22 * k} ${x + w * 0.56} ${y - h}Z`);
  B.rect(mix(DT.iron, CM.paper, 0.15), x - w * 0.56, y - h - 1.5, w * 1.12, 3);
  // bands
  B.rect(DT.ironLit, x - w / 2, y - h * 0.82, w, Math.max(1.2, 0.03 * k));
  B.rect(DT.ironLit, x - w / 2, y - h * 0.18, w, Math.max(1.2, 0.03 * k));
  return {y, b: B, key: `bin${X}`, light: {contact: [{x, y, w}], cast: [{x, y: y - 0.12 * k, w, depth: 0.12 * k, h: h + 0.1 * k}]}};
}

/** A stone drinking fountain (a fluted column, a round bowl, a step) at (X, d). */
export function fountain(X: number, d: number): Prop {
  const B = new Batch();
  const k = pxmD(d);
  const [x, y] = dpt(X, d);
  // the step
  B.rect(DT.stoneMid, x - 0.38 * k, y - 0.12 * k, 0.76 * k, 0.12 * k);
  B.rect(DT.stone, x - 0.38 * k, y - 0.14 * k, 0.76 * k, 0.04 * k);
  // the column
  const cw = 0.32 * k;
  B.rect(DT.stone, x - cw / 2, y - 0.86 * k, cw, 0.74 * k);
  B.rect(DT.stoneMid, x - cw / 2, y - 0.86 * k, cw * 0.4, 0.74 * k);
  B.rect(DT.stoneLit, x + cw * 0.22, y - 0.86 * k, cw * 0.16, 0.74 * k);
  // the bowl (seen from above: an ellipse, water inside)
  const bw = 0.62 * k;
  B.fill(DT.stone, `M${x - bw / 2} ${y - 0.9 * k}Q${x} ${y - 0.72 * k} ${x + bw / 2} ${y - 0.9 * k}Z`);
  B.fill(DT.stoneLit, ellD(x, y - 0.92 * k, bw / 2, 0.08 * k));
  B.fill(CM.water, ellD(x + 0.02 * k, y - 0.925 * k, bw * 0.36, 0.05 * k));
  // the spout (iron)
  B.rect(DT.iron, x - 0.025 * k, y - 1.02 * k, 0.05 * k, 0.1 * k);
  return {y, b: B, key: `fountain${X}`, light: {contact: [{x, y, w: 0.76 * k}], cast: [{x, y: y - 0.1 * k, w: 0.76 * k, depth: 0.14 * k, h: 1.0 * k}]}};
}

/** A tulip bed at ground level: a low stone edging, soil, and the tulips as calm colour DRIFTS (CRAFT §c: big areas
 *  flat): each drift a lobed leaf mass with a few larger heads in ONE hue at close values, no white sparks; (X0..X1) x
 *  (dNear..dFar). Its light: a contact strip along the near edging. */
export function tulipBed(X0: number, X1: number, dNear: number, dFar: number, seed: string): Prop {
  const B = new Batch();
  const kz = 0.08;
  const kw = 0.12;
  const pt = (X: number, d: number, z = 0) => dpt(X, d, z);
  const bt0 = pt(X0, dFar, kz);
  const bt1 = pt(X1, dFar, kz);
  const ft0 = pt(X0, dNear, kz);
  const ft1 = pt(X1, dNear, kz);
  const fb0 = pt(X0, dNear);
  const fb1 = pt(X1, dNear);
  const bb0 = pt(X0, dFar);
  // the edging (its near face toward us, a lit top) and the soil
  B.poly(DT.stoneMid, [fb0, fb1, ft1, ft0]);
  B.poly(DT.stone, [ft0, ft1, bt1, bt0]);
  B.poly(DT.soil, [pt(X0 + kw, dNear - kw, kz), pt(X1 - kw, dNear - kw, kz), pt(X1 - kw, dFar + kw, kz), pt(X0 + kw, dFar + kw, kz)]);
  B.layer();
  const r = rng(`s5deck/tul/${seed}`);
  // ONE leaf mass over the whole soil (raised: the plants' height), its near face a lobed step down (in the shade
  // toward us: the sun is beyond), the heads in colour drifts on it (no stripes between drifts)
  const base: Pt[] = [];
  const n = 12;
  for (let j = 0; j <= n; j++) base.push(pt(X0 + kw * 0.6 + ((X1 - X0 - kw * 1.2) * j) / n, dFar + kw * 0.6, kz + 0.22 + r.range(0, 0.1)));
  base.push(pt(X1 - kw * 0.6, dNear - kw * 0.6, kz + 0.04));
  base.push(pt(X0 + kw * 0.6, dNear - kw * 0.6, kz + 0.04));
  B.fill(DT.leaf, smoothClosed(base));
  const face: Pt[] = [];
  for (let j = 0; j <= n; j++) face.push(pt(X0 + kw * 0.6 + ((X1 - X0 - kw * 1.2) * j) / n, dNear - kw * 0.6 + 0.12 + r.range(0, 0.1), kz + 0.12 + r.range(0, 0.08)));
  face.push(pt(X1 - kw * 0.6, dNear - kw * 0.6, kz + 0.04));
  face.push(pt(X0 + kw * 0.6, dNear - kw * 0.6, kz + 0.04));
  B.fill(DT.leafShade, smoothClosed(face));
  const nD = Math.max(3, Math.round((X1 - X0) / 0.75));
  const hues = [DT.tulipRose, DT.tulipCream, DT.tulipGold, DT.tulipCoral];
  const heads = new Map<string, string>();
  const headsLit = new Map<string, string>();
  for (let i = 0; i < nD; i++) {
    const xa = X0 + kw + ((X1 - X0 - 2 * kw) * i) / nD;
    const xb = X0 + kw + ((X1 - X0 - 2 * kw) * (i + 1)) / nD;
    const col = hues[(i + (seed === 'nearR' ? 1 : 0)) % hues.length];
    // the heads: scattered (never a grid), 0.26-0.34 m apart, larger than life (they read at the end)
    for (let d = dFar + kw - 0.1 - r.range(0, 0.12); d > dNear - kw + 0.12; d -= r.range(0.26, 0.34)) {
      const k = pxmD(d);
      for (let X = xa + r.range(0.04, 0.2); X < xb - 0.06; X += r.range(0.26, 0.36)) {
        const [x, y] = pt(X + r.jitter(0.07), d + r.jitter(0.05), kz);
        const hgt = r.range(0.3, 0.46) * k;
        const hw = 0.06 * k;
        const hx = x;
        const hy = y - hgt;
        const hd = `M${hx - hw} ${hy}Q${hx - hw} ${hy - hw * 2.1} ${hx - hw * 0.3} ${hy - hw * 2.3}L${hx} ${hy - hw * 1.7}L${hx + hw * 0.3} ${hy - hw * 2.3}Q${hx + hw} ${hy - hw * 2.1} ${hx + hw} ${hy}Q${hx} ${hy + hw * 0.8} ${hx - hw} ${hy}Z`;
        heads.set(col, (heads.get(col) ?? '') + hd);
        if (k > 70) headsLit.set(col, (headsLit.get(col) ?? '') + ellD(hx + hw * 0.36, hy - hw * 1.2, hw * 0.3, hw * 0.62));
      }
    }
  }
  B.layer();
  heads.forEach((d, col) => B.fill(col, d));
  headsLit.forEach((d, col) => B.fill(mix(col, CM.paper, 0.2), d));
  // the contact strip along the near edging (where the bed meets the paving)
  const strip = polyD([[fb0[0] - 2, fb0[1] - 1], [fb1[0] + 2, fb1[1] - 1], [fb1[0] + 1, fb1[1] + 5], [fb0[0] - 1, fb0[1] + 5]]);
  return {y: bb0[1], b: B, key: `bed${seed}`, light: {shade: [{d: strip, tint: 'contact', soft: 2.5}]}};
}

/** A square stone planter with a small blossoming crabapple (the crown stays under the crane: low). */
export function crabPlanter(X: number, d: number, seed: string): Prop {
  const B = new Batch();
  const k = pxmD(d);
  const w = 1.15;
  const hz = 0.55;
  const a = dpt(X - w / 2, d);
  const b = dpt(X + w / 2, d);
  const at = dpt(X - w / 2, d, hz);
  const bt = dpt(X + w / 2, d, hz);
  const ct = dpt(X - w / 2, d + w, hz);
  const dt = dpt(X + w / 2, d + w, hz);
  B.poly(DT.stoneShade, [a, b, bt, at]);
  B.poly(DT.stoneDeep, [a, [a[0] + (b[0] - a[0]) * 0.3, a[1]], [at[0] + (bt[0] - at[0]) * 0.3, at[1]], at]);
  B.poly(X > 0 ? DT.stoneDeep : DT.stoneMid, X > 0 ? [a, dpt(X - w / 2, d + w), ct, at] : [b, dpt(X + w / 2, d + w), dt, bt]);
  B.poly(DT.stone, [at, bt, dt, ct]);
  B.poly(DT.soil, [dpt(X - w / 2 + 0.1, d + 0.1, hz), dpt(X + w / 2 - 0.1, d + 0.1, hz), dpt(X + w / 2 - 0.1, d + w - 0.1, hz), dpt(X - w / 2 + 0.1, d + w - 0.1, hz)]);
  // trunk + crown (2.0-3.4 m up): calm (a mid mauve mass, blossom close in value)
  const [tx, ty] = dpt(X, d + w / 2, hz);
  const top = dpt(X, d + w / 2, 3.3);
  const crR = 0.95 * k;
  B.layer();
  B.rect(DT.iron, tx - 0.05 * k, top[1] + crR * 0.6, 0.1 * k, ty - top[1] - crR * 0.6);
  const cy = top[1] + crR * 0.55;
  B.fill(DT.crown, crownD(tx, cy, crR, crR * 0.8, `s5deck/cr${seed}0`, 11, 0.2));
  B.fill(DT.crownMid, crownD(tx + crR * 0.12, cy - crR * 0.08, crR * 0.78, crR * 0.62, `s5deck/cr${seed}1`, 9, 0.2));
  B.fill(DT.crownLit, crownD(tx + crR * 0.36, cy - crR * 0.28, crR * 0.42, crR * 0.32, `s5deck/cr${seed}2`, 7, 0.2));
  let fl = '';
  let fs = '';
  const pr = rng(`s5deck/crf${seed}`);
  for (let i = 0; i < 22; i++) {
    const ang = pr.range(0, Math.PI * 2);
    const dd = Math.sqrt(pr.next()) * 0.86;
    const fx = tx + Math.cos(ang) * crR * dd;
    const fy = cy + Math.sin(ang) * crR * 0.78 * dd;
    const s = blossomD(fx, fy, crR * pr.range(0.1, 0.15), `s5deck/crb${seed}${i}`, 3);
    if (Math.cos(ang) * 0.6 - Math.sin(ang) * 0.8 > -0.1) fl += s;
    else fs += s;
  }
  B.fill(DT.crownMid, fs);
  B.fill(DT.crownFlower, fl);
  const pts: Pt[] = [a, b, dpt(X + w / 2, d + w), dpt(X - w / 2, d + w)];
  return {y: a[1], b: B, key: `planter${seed}`, light: {contact: [{x: (a[0] + b[0]) / 2, y: a[1], w: b[0] - a[0]}], cast: [{x: (a[0] + b[0]) / 2, y: a[1], w: b[0] - a[0], h: (hz + 0.6) * k, pts}]}};
}

/** A bike leaning on the balustrade (profile, facing right), wheels 0.68 m. Its frame and tyres ARE lines (`thing`:
 *  hairlines on the environment tier), its basket a flat fill. */
export function bikeAtRail(X: number): Prop {
  const B = new Batch();
  const d = RAIL.d - 0.35;
  const k = pxmD(d);
  const [x, y] = dpt(X, d);
  const r = 0.34 * k;
  const w0: Pt = [x - 0.52 * k, y - r];
  const w1: Pt = [x + 0.52 * k, y - r];
  const ring = (c: Pt) => `M${c[0] - r} ${c[1]}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0`;
  const iron = mix(CM.coatSlate, CM.anchor, 0.25);
  B.ink(ring(w0) + ring(w1), Math.max(1.4, 0.05 * k), DT.iron, 0, {thing: true});
  const seat: Pt = [x - 0.22 * k, y - 0.98 * k];
  const bar: Pt = [x + 0.38 * k, y - 1.04 * k];
  const crank: Pt = [x - 0.05 * k, y - r * 0.95];
  const frame = lineD([w0, crank, w1]) + lineD([w0, seat, crank]) + lineD([seat, [bar[0] - 0.08 * k, bar[1] + 0.12 * k], w1]) + lineD([[bar[0] - 0.08 * k, bar[1] + 0.12 * k], bar]) + lineD([[seat[0] - 0.08 * k, seat[1] - 0.02 * k], [seat[0] + 0.08 * k, seat[1] - 0.02 * k]]);
  B.ink(frame, Math.max(1.1, 0.035 * k), iron, 0, {thing: true});
  // a basket on the front (a sign of care: a few tulips in it)
  B.rect(CM.coatOat, bar[0] - 0.02 * k, bar[1] + 0.06 * k, 0.24 * k, 0.16 * k);
  B.fill(DT.tulipRose, ellD(bar[0] + 0.07 * k, bar[1] + 0.05 * k, 0.05 * k, 0.03 * k) + ellD(bar[0] + 0.15 * k, bar[1] + 0.04 * k, 0.04 * k, 0.03 * k));
  return {y, b: B, key: `bike${X}`, light: {contact: [{x: w0[0], y, w: 0.16 * k, h: 4}, {x: w1[0], y, w: 0.16 * k, h: 4}]}};
}

/** A viewpoint lectern: an iron post and a slanted panel facing up toward the visitor (us), a bronze-pale face. NO words. */
export function lectern(X: number, d: number): Prop {
  const B = new Batch();
  const k = pxmD(d);
  const [x, y] = dpt(X, d);
  B.rect(DT.iron, x - 0.05 * k, y - 0.82 * k, 0.1 * k, 0.82 * k);
  B.rect(DT.ironLit, x + 0.01 * k, y - 0.82 * k, 0.03 * k, 0.82 * k);
  B.rect(DT.iron, x - 0.16 * k, y - 0.04 * k, 0.32 * k, 0.04 * k);
  // the panel (0.8 x 0.5 m, tilted 35 deg up toward us: it shows ~0.4 of its height), plum frame, bronze-pale face
  const pw = 0.82 * k;
  const ph = 0.36 * k;
  const top = y - 1.08 * k;
  const pts: Pt[] = [[x - pw / 2, top], [x + pw / 2, top], [x + pw / 2 + 0.02 * k, top + ph], [x - pw / 2 - 0.02 * k, top + ph]];
  B.poly(DT.iron, pts);
  const fi = 0.035 * k;
  B.poly(mix(CM.limestone, CM.coatMustard, 0.25), [[x - pw / 2 + fi, top + fi], [x + pw / 2 - fi, top + fi], [x + pw / 2 - fi, top + ph - fi], [x - pw / 2 + fi, top + ph - fi]]);
  return {y, b: B, key: `lectern${X}`, light: {contact: [{x, y, w: 0.32 * k}], cast: [{x, y: y - 0.02 * k, w: 0.12 * k, depth: 0.08 * k, h: 1.08 * k}]}};
}
