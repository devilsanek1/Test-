// V2S5_deck_props.tsx (lane L4, TERRACE): the terrace's built things in END coords (deck plane), each a static Batch
// with the screen y of its foot (for depth sorting with the people):
//   the BALUSTRADE (the one level line, authored x -1100..2200: past both edges at every p), the STRANGER'S BENCH in
//   two parts (UNDER the figures: the top rail's right half, Pip's perch, and the shadow; OVER the figures: the top
//   rail's left half across the stranger's back, the iron ends, the seat's back edge), park benches (one family: plum
//   cast-iron ends, a brick top rail, an OPEN back), a bin, a drinking fountain, raised tulip beds, a crabapple planter,
//   a bike leaning on the balustrade, a viewpoint lectern (a panorama relief, no words), the stranger's tote.
// Light: the low morning sun is beyond the view (right): tops and right sides lit, faces toward us in shade, cast
// shadows toward us. Ink by depth on the deck (front 3.4 at the near things, 2.2-1.6 at the rail).
import React from 'react';
import {CM} from '../palette';
import {Batch, mix, crownD, ellD, lineD, polyD, rng, smoothClosed, circleD, blossomD, type Pt} from '../kit/dc/core';
import {CAM, dpt, pxmD, RAIL, DT, SPOT} from './V2S5_deck_cam';

export type Prop = {y: number; b: Batch; key: string};

const P2 = (a: Pt, b: Pt): Pt => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];

// ---------------------------------------------------------------- the balustrade

/** The balustrade: plinth, vase balusters every 0.3 m, piers every 3.6 m (one behind the news box, one behind the
 *  plaque), a coping with a lit top. Authored x -1100..2200 at the rail depth. */
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
  const bw = 0.12 * k;
  const step = 0.3 * k;
  let lit = '';
  let shd = '';
  for (let x = x0; x < x1; x += step) {
    const cx = x + step / 2;
    if (isPier(cx)) continue;
    const yb = yCopB + 0.02 * k;
    const ye = yPl - 0.01 * k;
    const h = ye - yb;
    const body = smoothClosed([
      [cx - bw * 0.3, yb],
      [cx + bw * 0.3, yb],
      [cx + bw * 0.22, yb + h * 0.22],
      [cx + bw * 0.55, yb + h * 0.62],
      [cx + bw * 0.42, ye],
      [cx - bw * 0.42, ye],
      [cx - bw * 0.55, yb + h * 0.62],
      [cx - bw * 0.22, yb + h * 0.22],
    ]);
    lit += body;
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
  let pInk = '';
  for (const px of pierX) {
    pl += polyD([[px - pw / 2, yTop], [px + pw / 2, yTop], [px + pw / 2, yBase], [px - pw / 2, yBase]]);
    ps += polyD([[px - pw / 2, yTop], [px - pw * 0.12, yTop], [px - pw * 0.12, yBase], [px - pw / 2, yBase]]);
    pc += polyD([[px - pw * 0.62, yTop - 0.09 * k], [px + pw * 0.62, yTop - 0.09 * k], [px + pw * 0.62, yTop + 0.02 * k], [px - pw * 0.62, yTop + 0.02 * k]]);
    pInk += lineD([[px - pw / 2, yTop + 0.04 * k], [px - pw / 2, yBase]]) + lineD([[px + pw / 2, yTop + 0.04 * k], [px + pw / 2, yPl]]);
  }
  B.fill(DT.stone, pl);
  B.fill(DT.stoneMid, ps);
  // the coping: front face, lit top, a shadow line under it
  B.rect(DT.stone, x0, yTop, x1 - x0, yCopB - yTop);
  B.rect(DT.stoneLit, x0, yTop - 1.4, x1 - x0, 2.6);
  B.rect(DT.stoneShade, x0, yCopB, x1 - x0, Math.max(1.2, 0.03 * k));
  B.fill(DT.stoneLit, pc);
  B.layer();
  B.ink(lineD([[x0, yCopB], [x1, yCopB]]), 1.8, DT.ink, 0.12);
  B.ink(lineD([[x0, yTop - 0.4], [x1, yTop - 0.4]]), 1.5, DT.ink, 0.3);
  B.ink(lineD([[x0, yPl], [x1, yPl]]), 1.4, DT.ink, 0.35);
  B.ink(pInk, 1.4, DT.ink, 0.2);
  return B;
}

// ---------------------------------------------------------------- benches (one family)

/** A park bench seen from behind (its back toward us): plum cast-iron ends, a brick top rail, an OPEN back (the
 *  sitters' whole backs show), the seat's back edge, the shadow under it. Screen box x0..x1, the top rail's top at
 *  yRail, the back legs' feet at yFeet. `part` splits it for the stranger's bench. */
export function benchBack(B: Batch, o: {x0: number; x1: number; yRail: number; yFeet: number; d: number; ink: number; part?: 'all' | 'under' | 'over'; split?: number; shadow?: boolean}) {
  const {x0, x1, yRail, yFeet, d, ink} = o;
  const part = o.part ?? 'all';
  const k = pxmD(d);
  const H = yFeet - yRail;
  const endW = Math.max(2.2, 0.07 * k);
  const railH = Math.max(2.6, 0.11 * k);
  const seatY = yFeet - 0.45 * k;
  const seatFrontY = seatY - 0.2 * k;
  const split = o.split ?? x1;
  const under = part === 'all' || part === 'under';
  const over = part === 'all' || part === 'over';
  if (under) {
    // the dark gap under the seat (the floor in the bench's own shade, between the legs) + a contact shadow strip
    if (o.shadow !== false) {
      // the floor under the seat in the bench's own shade, the darkest right under the seat's edge, a stretcher bar
      B.fill(DT.deep, polyD([[x0 + endW * 0.5, seatY], [x1 - endW * 0.5, seatY], [x1 - endW * 0.2, yFeet + 0.015 * k], [x0 + endW * 0.2, yFeet + 0.015 * k]]));
      B.fill(DT.under, polyD([[x0 + endW * 0.5, seatY], [x1 - endW * 0.5, seatY], [x1 - endW * 0.5, seatY + 0.09 * k], [x0 + endW * 0.5, seatY + 0.13 * k]]));
      B.fill(DT.deep, polyD([[x0 - 0.03 * k, yFeet], [x1 + 0.06 * k, yFeet], [x1 - 0.02 * k, yFeet + 0.06 * k], [x0 - 0.1 * k, yFeet + 0.07 * k]]));
      B.rect(DT.iron, x0 + endW * 0.5, yFeet - 0.17 * k, x1 - x0 - endW, Math.max(1, 0.025 * k));
    }
    // the seat's top (seen from above-behind, beyond its back edge: lit) and a slat line
    B.poly(DT.woodLit, [[x0 + endW * 0.6, seatFrontY], [x1 - endW * 0.6, seatFrontY], [x1 - endW * 0.6, seatY], [x0 + endW * 0.6, seatY]]);
    B.ink(lineD([[x0 + endW, (seatFrontY + seatY) / 2], [x1 - endW, (seatFrontY + seatY) / 2]]), Math.max(0.6, ink * 0.3), DT.wood);
    // the top rail's part UNDER the figures (Pip's perch): from the split to the right end
    if (split < x1) {
      B.rect(DT.wood, split, yRail, x1 - endW * 0.5 - split, railH);
      B.rect(DT.woodLit, split, yRail - 0.4, x1 - endW * 0.5 - split, Math.max(1, railH * 0.3));
      B.ink(lineD([[split, yRail], [x1 - endW * 0.4, yRail]]), ink, DT.ink);
      B.ink(lineD([[split, yRail + railH], [x1 - endW * 0.4, yRail + railH]]), ink * 0.7, DT.ink);
    }
  }
  if (over) {
    B.layer();
    // the seat's back edge (the plank nearest us, at the sitters' hips)
    B.rect(DT.wood, x0 + endW * 0.6, seatY - Math.max(1.4, 0.06 * k), x1 - x0 - endW * 1.2, Math.max(2.2, 0.085 * k));
    B.ink(lineD([[x0 + endW, seatY + Math.max(0.8, 0.025 * k)], [x1 - endW, seatY + Math.max(0.8, 0.025 * k)]]), ink * 0.6, DT.ink);
    // the top rail's part over the figures (across the stranger's back)
    const xr = Math.min(split, x1 - endW * 0.5);
    B.rect(DT.wood, x0 + endW * 0.5, yRail, xr - x0 - endW * 0.5, railH);
    B.rect(DT.woodLit, x0 + endW * 0.5, yRail - 0.4, xr - x0 - endW * 0.5, Math.max(1, railH * 0.3));
    B.ink(lineD([[x0 + endW * 0.4, yRail], [xr, yRail]]), ink, DT.ink);
    B.ink(lineD([[x0 + endW * 0.4, yRail + railH], [xr, yRail + railH]]), ink * 0.7, DT.ink);
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
    B.ink(lineD([[x0, yFeet], [x0 + endW * 0.1, seatY], [x0 - endW * 0.15, seatY - 0.24 * k], [x0, yRail]]), ink * 0.8, DT.ink);
    B.ink(lineD([[x1, yFeet], [x1 - endW * 0.1, seatY], [x1 + endW * 0.15, seatY - 0.24 * k], [x1, yRail]]), ink * 0.8, DT.ink);
  }
  void H;
}

/** The stranger's bench at the rail: top rail's top = Pip's seat, feet at y 1240 (contract). The split sits between
 *  the stranger's paper (START x <= 350) and Pip's left ear (START x >= 360): START x 354 = END 340.5. */
export const STRANGER_BENCH = {x0: SPOT.bench.x0, x1: SPOT.bench.x1, yRail: SPOT.pipSeat[1], yFeet: SPOT.bench.y1, split: 340.5};
export function strangerBench(part: 'under' | 'over'): Batch {
  const B = new Batch();
  const sb = STRANGER_BENCH;
  const d = (CAM.f * CAM.h) / (sb.yFeet - CAM.hz);
  if (part === 'under') {
    // the stranger's tote leaning on the left iron end (on the floor), its strap
    const tx = sb.x0 - 15;
    const ty = sb.yFeet - 1;
    B.poly(CM.coatOat, [[tx, ty], [tx + 1.2, ty - 13], [tx + 13.5, ty - 13.5], [tx + 14.5, ty]]);
    B.poly(mix(CM.coatOat, CM.shadeWarm, 0.3), [[tx, ty], [tx + 1.2, ty - 13], [tx + 4, ty - 13.2], [tx + 3.6, ty]]);
    B.fill(DT.deep, ellD(tx + 6, ty + 1.2, 10, 2));
    B.ink(`M${tx + 3.6} ${ty - 13.2}q4 -8 8.4 0`, 1.1, DT.ink);
    B.ink(lineD([[tx, ty], [tx + 1.2, ty - 13], [tx + 13.5, ty - 13.5], [tx + 14.5, ty]]), 1.0, DT.ink, 0.2);
  }
  benchBack(B, {x0: sb.x0, x1: sb.x1, yRail: sb.yRail, yFeet: sb.yFeet, d, ink: 1.9, part, split: sb.split});
  return B;
}

// ---------------------------------------------------------------- small things on the terrace

/** A park bench facing the view at depth d (backrest toward us), from X0 to X1 (m). */
export function parkBench(X0: number, X1: number, d: number, extra?: (B: Batch, a: Pt, b: Pt, k: number) => void): Prop {
  const B = new Batch();
  const k = pxmD(d);
  const a = dpt(X0, d);
  const b = dpt(X1, d);
  const yRail = dpt(X0, d, 0.92)[1];
  benchBack(B, {x0: a[0], x1: b[0], yRail, yFeet: a[1], d, ink: k > 75 ? 2.6 : 2.2, part: 'all'});
  if (extra) {
    B.layer();
    extra(B, a, b, k);
  }
  return {y: a[1], b: B, key: `bench${X0}`};
}

/** An iron litter bin with a domed lid at (X, d). */
export function bin(X: number, d: number): Prop {
  const B = new Batch();
  const k = pxmD(d);
  const [x, y] = dpt(X, d);
  const w = 0.5 * k;
  const h = 0.95 * k;
  B.fill(DT.deep, ellD(x - 0.1 * k, y + 0.06 * k, w * 0.75, 0.12 * k));
  B.layer();
  B.rect(DT.iron, x - w / 2, y - h, w, h);
  B.rect(DT.ironLit, x + w * 0.18, y - h + 2, w * 0.22, h - 2);
  B.fill(DT.iron, `M${x - w * 0.56} ${y - h}Q${x} ${y - h - 0.22 * k} ${x + w * 0.56} ${y - h}Z`);
  B.rect(mix(DT.iron, CM.paper, 0.15), x - w * 0.56, y - h - 1.5, w * 1.12, 3);
  // bands
  B.rect(DT.ironLit, x - w / 2, y - h * 0.82, w, Math.max(1.2, 0.03 * k));
  B.rect(DT.ironLit, x - w / 2, y - h * 0.18, w, Math.max(1.2, 0.03 * k));
  const ink = k > 75 ? 2.6 : 2.2;
  B.ink(lineD([[x - w / 2, y], [x - w / 2, y - h], [x + w / 2, y - h], [x + w / 2, y]]), ink, DT.ink, 0.2);
  // a paper cup on the lid's edge... no: a petal or two on the lid
  B.fill(DT.petal, ellD(x - w * 0.1, y - h - 0.05 * k, 0.04 * k, 0.02 * k));
  return {y, b: B, key: `bin${X}`};
}

/** A stone drinking fountain (a fluted column, a round bowl, a step) at (X, d). */
export function fountain(X: number, d: number): Prop {
  const B = new Batch();
  const k = pxmD(d);
  const [x, y] = dpt(X, d);
  B.fill(DT.deep, ellD(x - 0.15 * k, y + 0.08 * k, 0.55 * k, 0.14 * k));
  B.layer();
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
  // the spout (iron) and a thin arc of water
  B.rect(DT.iron, x - 0.025 * k, y - 1.02 * k, 0.05 * k, 0.1 * k);
  const ink = k > 75 ? 2.6 : 2.2;
  B.ink(lineD([[x - cw / 2, y - 0.12 * k], [x - cw / 2, y - 0.86 * k]]) + lineD([[x + cw / 2, y - 0.12 * k], [x + cw / 2, y - 0.86 * k]]), ink, DT.ink, 0.15);
  B.ink(`M${x - bw / 2} ${y - 0.9 * k}Q${x} ${y - 0.72 * k} ${x + bw / 2} ${y - 0.9 * k}`, ink, DT.ink);
  return {y, b: B, key: `fountain${X}`};
}

/** A tulip bed at ground level: a low stone edging, soil, broad leaves and tulips planted in colour DRIFTS (a few
 *  strays), heights varying, inside a low iron HOOP fence (ink-only hoops: thin lines); (X0..X1) x (dNear..dFar). */
export function tulipBed(X0: number, X1: number, dNear: number, dFar: number, seed: string): Prop {
  const B = new Batch();
  const kz = 0.08;
  const kw = 0.12;
  const pt = (X: number, d: number, z = 0) => dpt(X, d, z);
  const bt0 = pt(X0, dFar, kz);
  const bt1 = pt(X1, dFar, kz);
  const ft0 = pt(X0, dNear, kz);
  const ft1 = pt(X1, dNear, kz);
  const bb0 = pt(X0, dFar);
  // the edging and the soil
  B.poly(DT.stoneMid, [ft0, ft1, bt1, bt0]);
  B.poly(DT.soil, [pt(X0 + kw, dNear - kw, kz), pt(X1 - kw, dNear - kw, kz), pt(X1 - kw, dFar + kw, kz), pt(X0 + kw, dFar + kw, kz)]);
  B.rect(DT.stone, bt0[0], bt0[1] - 1.2, bt1[0] - bt0[0], 2.2);
  B.layer();
  const r = rng(`s5deck/tul/${seed}`);
  // the hoop fence along the far edge and both sides (behind the tulips), as ink hoops
  const hoops = (Xa: number, da: number, Xb: number, db: number) => {
    let h = '';
    const n = Math.max(2, Math.round(Math.hypot(Xb - Xa, db - da) / 0.42));
    for (let i = 0; i < n; i++) {
      const u0 = i / n;
      const u1 = (i + 1) / n;
      const A = pt(Xa + (Xb - Xa) * u0, da + (db - da) * u0);
      const Bp = pt(Xa + (Xb - Xa) * u1, da + (db - da) * u1);
      const k = pxmD(da + (db - da) * (u0 + u1) / 2);
      h += `M${A[0].toFixed(1)} ${A[1].toFixed(1)}Q${((A[0] + Bp[0]) / 2).toFixed(1)} ${((A[1] + Bp[1]) / 2 - 0.62 * k).toFixed(1)} ${Bp[0].toFixed(1)} ${Bp[1].toFixed(1)}`;
    }
    return h;
  };
  const kInk = pxmD(dNear) > 75 ? 1.8 : 1.5;
  B.ink(hoops(X0 - 0.06, dFar + 0.06, X1 + 0.06, dFar + 0.06), kInk, DT.iron);
  // colour drifts along the bed
  const drifts: {X: number; d: number; col: string}[] = [];
  for (let i = 0; i < Math.max(3, Math.round((X1 - X0) / 0.5)); i++) drifts.push({X: r.range(X0, X1), d: r.range(dNear, dFar), col: DT.tulips[(i * 3 + r.int(0, 2)) % DT.tulips.length]});
  const colAt = (X: number, d: number) => {
    let best = drifts[0];
    let bd = 1e9;
    for (const q of drifts) {
      const dd = (q.X - X) ** 2 + ((q.d - d) * 1.6) ** 2;
      if (dd < bd) {
        bd = dd;
        best = q;
      }
    }
    return r.chance(0.08) ? r.pick(DT.tulips) : best.col;
  };
  const leafA: string[] = [];
  const leafB: string[] = [];
  const stems: string[] = [];
  const heads = new Map<string, string>();
  const headsLit = new Map<string, string>();
  const plants: {x: number; y: number; k: number; hgt: number; col: string}[] = [];
  for (let d = dFar + kw - 0.06; d > dNear - kw + 0.05; d -= r.range(0.1, 0.16)) {
    const k = pxmD(d);
    for (let X = X0 + kw + r.range(0, 0.12); X < X1 - kw - 0.03; X += r.range(0.11, 0.2)) {
      const [x, y] = pt(X + r.jitter(0.04), d, kz);
      plants.push({x, y, k, hgt: r.range(0.3, 0.5) * k, col: colAt(X, d)});
    }
  }
  for (const p of plants) {
    const {x, y, k, hgt} = p;
    const lean = r.jitter(0.04) * k;
    (r.chance(0.5) ? leafA : leafB).push(polyD([[x - 0.05 * k, y], [x - 0.12 * k + lean, y - hgt * 0.45], [x - 0.01 * k, y - hgt * 0.18]]));
    (r.chance(0.5) ? leafA : leafB).push(polyD([[x + 0.04 * k, y], [x + 0.11 * k + lean, y - hgt * 0.52], [x + 0.01 * k, y - hgt * 0.22]]));
    stems.push(lineD([[x, y - hgt * 0.15], [x + lean * 0.5, y - hgt]]));
    const hw = 0.048 * k;
    const hx = x + lean * 0.5;
    const hy = y - hgt;
    const hd = `M${hx - hw} ${hy}Q${hx - hw} ${hy - hw * 2.2} ${hx - hw * 0.3} ${hy - hw * 2.4}L${hx} ${hy - hw * 1.7}L${hx + hw * 0.3} ${hy - hw * 2.4}Q${hx + hw} ${hy - hw * 2.2} ${hx + hw} ${hy}Q${hx} ${hy + hw * 0.8} ${hx - hw} ${hy}Z`;
    heads.set(p.col, (heads.get(p.col) ?? '') + hd);
    if (k > 60) headsLit.set(p.col, (headsLit.get(p.col) ?? '') + ellD(hx + hw * 0.38, hy - hw * 1.25, hw * 0.28, hw * 0.62));
  }
  B.fill(DT.leafShade, leafB.join(''));
  B.fill(DT.leaf, leafA.join(''));
  B.ink(stems.join(''), Math.max(0.8, pxmD(dNear) * 0.012), DT.leafShade);
  B.layer();
  heads.forEach((d, col) => B.fill(col, d));
  headsLit.forEach((d, col) => B.fill(mix(col, CM.paper, 0.45), d));
  B.layer();
  // the side hoops (in front of the side tulips)
  B.ink(hoops(X0 - 0.06, dFar + 0.06, X0 - 0.06, dNear - 0.3) + hoops(X1 + 0.06, dFar + 0.06, X1 + 0.06, dNear - 0.3), kInk, DT.iron);
  return {y: bb0[1], b: B, key: `bed${seed}`};
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
  B.fill(DT.deep, polyD([a, b, [b[0] - 0.2 * k, b[1] + 0.4 * k], [a[0] - 0.3 * k, a[1] + 0.4 * k]]));
  B.layer();
  B.poly(DT.stoneShade, [a, b, bt, at]);
  B.poly(DT.stoneDeep, [a, [a[0] + (b[0] - a[0]) * 0.3, a[1]], [at[0] + (bt[0] - at[0]) * 0.3, at[1]], at]);
  B.poly(X > 0 ? DT.stoneDeep : DT.stoneMid, X > 0 ? [a, dpt(X - w / 2, d + w), ct, at] : [b, dpt(X + w / 2, d + w), dt, bt]);
  B.poly(DT.stone, [at, bt, dt, ct]);
  B.poly(DT.soil, [dpt(X - w / 2 + 0.1, d + 0.1, hz), dpt(X + w / 2 - 0.1, d + 0.1, hz), dpt(X + w / 2 - 0.1, d + w - 0.1, hz), dpt(X - w / 2 + 0.1, d + w - 0.1, hz)]);
  // trunk + crown (2.0-3.4 m up)
  const [tx, ty] = dpt(X, d + w / 2, hz);
  const top = dpt(X, d + w / 2, 3.3);
  const crR = 0.95 * k;
  B.layer();
  B.rect(DT.iron, tx - 0.05 * k, top[1] + crR * 0.6, 0.1 * k, ty - top[1] - crR * 0.6);
  B.rect(mix(DT.iron, CM.brickDeep, 0.4), tx + 0.01 * k, top[1] + crR * 0.6, 0.03 * k, ty - top[1] - crR * 0.6);
  const cy = top[1] + crR * 0.55;
  B.fill(mix(CM.shadeWarm, CM.anchor, 0.42), crownD(tx, cy, crR, crR * 0.8, `s5deck/cr${seed}0`, 11, 0.2));
  B.fill(mix(CM.shadeWarm, CM.blossom, 0.35), crownD(tx + crR * 0.12, cy - crR * 0.08, crR * 0.78, crR * 0.62, `s5deck/cr${seed}1`, 9, 0.2));
  B.fill(mix(CM.blossom, CM.brickLight, 0.15), crownD(tx + crR * 0.36, cy - crR * 0.28, crR * 0.42, crR * 0.32, `s5deck/cr${seed}2`, 7, 0.2));
  let fl = '';
  let fs = '';
  let fw = '';
  const pr = rng(`s5deck/crf${seed}`);
  for (let i = 0; i < 46; i++) {
    const ang = pr.range(0, Math.PI * 2);
    const dd = Math.sqrt(pr.next()) * 0.92;
    const fx = tx + Math.cos(ang) * crR * dd;
    const fy = cy + Math.sin(ang) * crR * 0.78 * dd;
    const s = blossomD(fx, fy, crR * pr.range(0.07, 0.12), `s5deck/crb${seed}${i}`, 3);
    const lit = Math.cos(ang) * 0.6 - Math.sin(ang) * 0.8;
    if (lit > 0.5 && pr.chance(0.4)) fw += s;
    else if (lit > -0.1) fl += s;
    else fs += s;
  }
  B.fill(mix(CM.blossom, CM.shadeWarm, 0.32), fs);
  B.fill(CM.blossom, fl);
  B.fill(CM.paper, fw);
  const ink = k > 75 ? 2.6 : 2.2;
  B.ink(crownD(tx, cy, crR, crR * 0.8, `s5deck/cr${seed}0`, 11, 0.2), ink, DT.ink, 0.45);
  B.ink(lineD([a, at, bt, b]), ink, DT.ink, 0.2);
  return {y: a[1], b: B, key: `planter${seed}`};
}

/** A bike leaning on the balustrade (profile, facing right), wheels 0.68 m. Ink-only frame, flat tyres. */
export function bikeAtRail(X: number): Prop {
  const B = new Batch();
  const d = RAIL.d - 0.35;
  const k = pxmD(d);
  const [x, y] = dpt(X, d);
  const r = 0.34 * k;
  const w0: Pt = [x - 0.52 * k, y - r];
  const w1: Pt = [x + 0.52 * k, y - r];
  B.fill(DT.deep, ellD(x - 0.1 * k, y + 0.05 * k, 0.7 * k, 0.08 * k));
  B.layer();
  // tyres (flat rings: fill a ring as two circles, even-odd not available: draw thick ink)
  const ring = (c: Pt) => `M${c[0] - r} ${c[1]}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0`;
  B.ink(ring(w0) + ring(w1), Math.max(1.4, 0.05 * k), DT.iron);
  const seat: Pt = [x - 0.22 * k, y - 0.98 * k];
  const bar: Pt = [x + 0.38 * k, y - 1.04 * k];
  const crank: Pt = [x - 0.05 * k, y - r * 0.95];
  const frame = lineD([w0, crank, w1]) + lineD([w0, seat, crank]) + lineD([seat, [bar[0] - 0.08 * k, bar[1] + 0.12 * k], w1]) + lineD([[bar[0] - 0.08 * k, bar[1] + 0.12 * k], bar]) + lineD([[seat[0] - 0.08 * k, seat[1] - 0.02 * k], [seat[0] + 0.08 * k, seat[1] - 0.02 * k]]);
  B.ink(frame, Math.max(1.1, 0.035 * k), mix(CM.coatSlate, CM.anchor, 0.25));
  B.ink(lineD([[bar[0] - 0.06 * k, bar[1]], [bar[0] + 0.08 * k, bar[1] - 0.02 * k]]), Math.max(1.1, 0.035 * k), DT.ink);
  // a basket on the front (a sign of care: a few tulips in it)
  B.rect(CM.coatOat, bar[0] - 0.02 * k, bar[1] + 0.06 * k, 0.24 * k, 0.16 * k);
  B.fill(CM.blossom, ellD(bar[0] + 0.07 * k, bar[1] + 0.05 * k, 0.05 * k, 0.03 * k) + ellD(bar[0] + 0.15 * k, bar[1] + 0.04 * k, 0.04 * k, 0.03 * k));
  return {y, b: B, key: `bike${X}`};
}

/** A viewpoint lectern: an iron post and a slanted panel facing up toward the visitor (us) with a panorama relief
 *  (the skyline's line: an obelisk spike, a dome, low roofs). NO words. */
export function lectern(X: number, d: number): Prop {
  const B = new Batch();
  const k = pxmD(d);
  const [x, y] = dpt(X, d);
  B.fill(DT.deep, ellD(x - 0.1 * k, y + 0.05 * k, 0.4 * k, 0.09 * k));
  B.layer();
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
  // the relief: a skyline line (no words)
  const ly = top + ph * 0.62;
  const L = x - pw / 2 + fi * 1.6;
  const R = x + pw / 2 - fi * 1.6;
  const sk: Pt[] = [[L, ly]];
  const r = rng('s5deck/lect');
  for (let u = 0.05; u < 0.98; u += 0.07) sk.push([L + (R - L) * u, ly - r.range(0, 0.05) * k]);
  sk.push([R, ly]);
  B.ink(lineD(sk), Math.max(0.7, 0.015 * k), mix(CM.line, CM.anchor, 0.3));
  // the obelisk spike and the dome (tiny relief marks)
  const ox = L + (R - L) * 0.32;
  B.ink(lineD([[ox - 0.01 * k, ly], [ox, ly - 0.16 * k], [ox + 0.01 * k, ly]]), Math.max(0.7, 0.015 * k), mix(CM.line, CM.anchor, 0.3));
  B.ink(`M${L + (R - L) * 0.7 - 0.04 * k} ${ly}Q${L + (R - L) * 0.7} ${ly - 0.09 * k} ${L + (R - L) * 0.7 + 0.04 * k} ${ly}`, Math.max(0.7, 0.015 * k), mix(CM.line, CM.anchor, 0.3));
  const ink = k > 75 ? 2.6 : 2.2;
  B.ink(lineD([...pts, pts[0]]), ink, DT.ink, 0.15);
  return {y, b: B, key: `lectern${X}`};
}

void circleD;
void P2;
