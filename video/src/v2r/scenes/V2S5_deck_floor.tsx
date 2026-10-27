// V2S5_deck_floor.tsx (lane L4, TERRACE): the terrace FLOOR in END coords (drawn in the deck plane; 2.42x at the start).
//
//   paving    a limestone BORDER BAND along the balustrade (long slabs), a brick HEADER course, then a field of stone
//             FLAGS in random bond (courses parallel to the rail; the longitudinal joints converge on the deck's VP above
//             the pair: the lines lead up to them; a few worn / patched flags), a band of brick setts across the terrace.
//   light     2 values, STATIC (STYLE section 3: no boil, no sway): the whole floor is drawn twice, in the canopy's warm
//             shade and in sun, and the sunlit copy is clipped to the LIGHT shapes: a pool of the slot's light under the
//             bench and the news box (the start's lit patch, the end pair's light ground), the border band lit on the
//             right, clusters of lobed sun flecks (a few small ones round the pair: the start's warm-dark floor), broad
//             lit pools on the right; the near corners stay dark (the terrace tree and the corner crown).
//   drifts    petals (small teardrops at any angle) along the plinth, caught in the joints, heaped against kerbs and
//             legs, scattered; sized to read at both scales (2-4 px at the end = 5-10 px at the start).
// Joints are drawn in the paving's own darker tone, never in ink (STYLE: no ink on the ground).
import React, {useMemo} from 'react';
import {Batch, Paint, crownD, lineD, polyD, rng, type Pt} from '../kit/dc/core';
import {CAM, dpt, dAt, pxmD, pxmY, RAIL, DT, START_WIN, SPOT} from './V2S5_deck_cam';

/** The floor's extent (END coords): beyond both edges and below the frame at every p. */
const FX0 = -80;
const FX1 = 1160;
const FY1 = 1990;
const D_NEAR = dAt(FY1);
/** Lateral metres spanned at depth d (with a margin). */
const xRange = (d: number): [number, number] => [((FX0 - CAM.vpx) * d) / CAM.f, ((FX1 - CAM.vpx) * d) / CAM.f];

/** The courses: the border band, the header course, then the field. Depths in metres. */
export const COURSES = (() => {
  const band0 = CAM.railD - 0.04;
  const band1 = band0 - 1.5;
  const head1 = band1 - 0.32;
  const r = rng('s5deck/courses');
  const field: number[] = [head1];
  let d = head1;
  while (d > D_NEAR - 0.6) {
    d -= r.range(0.48, 0.72);
    field.push(d);
  }
  // the brick sett band across the terrace (two courses of setts), ~4.4 m in from the header
  const setts = {d0: head1 - 4.4, d1: head1 - 4.4 - 0.42};
  return {band0, band1, head1, field, setts};
})();

type Tone = 'lit' | 'shade';

const T = (tone: Tone) =>
  tone === 'lit'
    ? {base: DT.lit, var: [DT.litHi, DT.litWarm, DT.litCool], patch: DT.litWarm, joint: DT.jointLit, band: DT.band, bandJoint: DT.jointLit, header: DT.header, headerJoint: DT.headerShade, sett: DT.brickSett, sett2: DT.brickSettLight}
    : {base: DT.shade, var: [DT.shadeHi, DT.shadeLo, DT.shadeCool], patch: DT.shadeLo, joint: DT.jointShade, band: DT.bandShade, bandJoint: DT.jointShade, header: DT.headerShade, headerJoint: DT.deep, sett: DT.brickSettShade, sett2: DT.shadeLo};

/** The paving in one light (the same geometry for both: seeds fixed). */
function paving(B: Batch, tone: Tone) {
  const C = T(tone);
  const {band0, band1, head1, field, setts} = COURSES;
  B.rect(C.base, FX0, RAIL.base - 3, FX1 - FX0, FY1 - RAIL.base + 3);
  // the border band (limestone, long slabs 1.6-2.2 m along the rail)
  {
    const y0 = dpt(0, band0)[1];
    const y1 = dpt(0, band1)[1];
    B.rect(C.band, FX0, y0 - 1, FX1 - FX0, y1 - y0 + 1);
    const r = rng('s5deck/band');
    const [xa, xb] = xRange(band0);
    let j = '';
    for (let X = xa; X < xb; X += r.range(1.6, 2.2)) j += lineD([dpt(X, band0), dpt(X, band1)]);
    B.layer();
    B.ink(j, 1.3, C.bandJoint);
    B.ink(lineD([[FX0, y1], [FX1, y1]]), 1.5, C.bandJoint);
  }
  // the header course (brick on edge)
  {
    const y0 = dpt(0, band1)[1];
    const y1 = dpt(0, head1)[1];
    B.rect(C.header, FX0, y0, FX1 - FX0, y1 - y0);
    const [xa, xb] = xRange(band1);
    let j = '';
    for (let X = xa; X < xb; X += 0.22) j += lineD([dpt(X, band1), dpt(X, head1)]);
    B.ink(j, 0.8, C.headerJoint);
  }
  // the field: flags in random bond, a few tinted, a few worn (a lighter / darker corner patch)
  B.layer();
  const r = rng('s5deck/flags');
  const tints = new Map<string, string>();
  const addTint = (col: string, d: string) => tints.set(col, (tints.get(col) ?? '') + d);
  let trans = '';
  let longi = '';
  let cracks = '';
  for (let i = 0; i < field.length - 1; i++) {
    const d0 = field[i];
    const d1 = field[i + 1];
    const [xa, xb] = xRange(d1);
    const yA = dpt(0, d0)[1];
    trans += lineD([[FX0, yA], [FX1, yA]]);
    let X = xa - r.range(0, 1.2);
    while (X < xb) {
      const w = r.range(0.6, 1.05);
      const k = r.next();
      if (k < 0.22) {
        const col = C.var[Math.floor(k * 13.7) % C.var.length];
        addTint(col, polyD([dpt(X + 0.035, d0 - 0.03), dpt(X + w - 0.035, d0 - 0.03), dpt(X + w - 0.035, d1 + 0.03), dpt(X + 0.035, d1 + 0.03)]));
      } else if (k < 0.3) {
        // a worn corner patch
        const u = r.range(0.35, 0.65);
        addTint(C.patch, polyD([dpt(X + 0.035, d0 - 0.03), dpt(X + w * u, d0 - 0.03), dpt(X + 0.035, d0 - (d0 - d1) * r.range(0.4, 0.8))]));
      } else if (k < 0.34) {
        // a hairline crack across the flag
        cracks += lineD([dpt(X + w * r.range(0.1, 0.4), d0 - 0.02), dpt(X + w * r.range(0.4, 0.6), (d0 + d1) / 2), dpt(X + w * r.range(0.6, 0.9), d1 + 0.02)]);
      }
      X += w;
      longi += lineD([dpt(X, d0), dpt(X, d1)]);
    }
  }
  tints.forEach((d, col) => B.fill(col, d));
  // the brick sett band (two courses, staggered)
  {
    const {d0, d1} = setts;
    const y0 = dpt(0, d0)[1];
    const y1 = dpt(0, d1)[1];
    B.rect(C.sett, FX0, y0, FX1 - FX0, y1 - y0);
    const dm = (d0 + d1) / 2;
    const [xa, xb] = xRange(d1);
    let j = '';
    for (let X = xa; X < xb; X += 0.21) {
      j += lineD([dpt(X, d0), dpt(X, dm)]);
      j += lineD([dpt(X + 0.105, dm), dpt(X + 0.105, d1)]);
    }
    B.layer();
    B.ink(j, 0.9, C.joint);
    B.ink(lineD([[FX0, dpt(0, dm)[1]], [FX1, dpt(0, dm)[1]]]), 0.9, C.joint);
    B.ink(lineD([[FX0, y0], [FX1, y0]]) + lineD([[FX0, y1], [FX1, y1]]), 1.5, C.joint);
  }
  B.layer();
  B.ink(trans, 1.5, C.joint);
  B.ink(longi, 1.25, C.joint);
  B.ink(cracks, 0.8, C.joint);
}

/** Drain grates: small iron gratings in the field (static). */
function grates(B: Batch) {
  const spots: [number, number][] = [
    [1.5, 18.1],
    [8.4, 15.3],
    [-0.3, 12.1],
    [5.2, 10.4],
  ];
  for (const [X, d] of spots) {
    const a = dpt(X - 0.3, d + 0.25);
    const b = dpt(X + 0.3, d + 0.25);
    const c = dpt(X + 0.3, d - 0.25);
    const e = dpt(X - 0.3, d - 0.25);
    B.poly(DT.iron, [a, b, c, e]);
    let bars = '';
    for (let k = 1; k < 6; k++) {
      const u = k / 6;
      bars += lineD([[a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u], [e[0] + (c[0] - e[0]) * u, e[1] + (c[1] - e[1]) * u]]);
    }
    B.ink(bars, Math.max(0.8, pxmD(d) * 0.025), DT.ironLit);
  }
}

// ---------------------------------------------------------------- the light: 2-value static dapple

const inWin = (x: number, y: number) => x > START_WIN.x0 - 30 && x < START_WIN.x1 + 20 && y < START_WIN.y1 + 20;

/** One fleck: a lobed spot, wider than deep (the floor is seen at a slant). */
const fleck = (x: number, y: number, rx: number, seed: string) => crownD(x, y, rx, rx * 0.42, seed, 5, 0.1);

/** The sunlit shapes (END coords) as one path: the lit copy of the floor is clipped to it. */
export function lightShapes(): string {
  const r = rng('s5deck/light');
  let d = '';
  const bandY0 = RAIL.base + 2;
  const bandY1 = dpt(0, COURSES.band1)[1];
  // 1. the slot's light: broken lit patches on the border band round the news box's feet and beside the bench (the
  //    box stands in the slot's light; the pair's ground is light at the end), ending in flecks toward us
  {
    const patches: [number, number, number][] = [
      [SPOT.newsBox.x0 + 12, SPOT.newsBox.x0 + 58, 0.9],
      [SPOT.newsBox.x0 + 70, SPOT.newsBox.x1 + 14, 1],
      [SPOT.bench.x1 - 30, SPOT.bench.x1 + 6, 0.55],
      [SPOT.bench.x0 + 4, SPOT.bench.x0 + 34, 0.5],
    ];
    patches.forEach(([x0, x1, k], i) => {
      const pts: Pt[] = [];
      for (let x = x0; x <= x1; x += 9) pts.push([x, bandY0 + r.range(0, 3)]);
      for (let x = x1; x >= x0; x -= 8) pts.push([x + r.jitter(3), bandY0 + (bandY1 - bandY0) * k * r.range(0.75, 1) + 5 * Math.sin(x * 0.11 + i)]);
      d += polyD(pts);
    });
    for (let i = 0; i < 14; i++) d += fleck(r.range(SPOT.bench.x0 - 10, SPOT.newsBox.x1 + 30), r.range(bandY1 - 6, bandY1 + 34), r.range(3, 8), `s5deck/sl${i}`);
  }
  // 2. the border band lit on the right (sun over the balustrade between the slope's crowns), broken by the piers'
  //    shadows (wedges) and ragged toward us
  {
    const pierXs: number[] = [];
    for (let X = -1.8 - 3.6 * 30; X < 60; X += 3.6) pierXs.push(CAM.vpx + (CAM.f * X) / RAIL.d);
    let x = 668;
    const segs: [number, number][] = [];
    for (const px of pierXs.filter((p) => p > 668).sort((a, b) => a - b)) {
      segs.push([x, px - 4]);
      x = px + 22;
    }
    segs.push([x, FX1]);
    segs.forEach(([a, b], i) => {
      if (b - a < 8) return;
      const pts: Pt[] = [[a, bandY0], [b, bandY0]];
      for (let xx = b; xx >= a; xx -= 18) pts.push([xx - 6, bandY1 + r.range(-3, 8) + (i % 2) * 3]);
      d += polyD(pts);
    });
  }
  // 3. broad lit pools on the right (between the slope crowns' shadows), lobed, with satellite flecks
  const pools: [number, number, number, number][] = [
    [770, 1300, 92, 20],
    [960, 1338, 120, 26],
    [880, 1420, 70, 18],
    [1060, 1470, 110, 28],
    [700, 1478, 60, 15],
    [560, 1572, 70, 16],
    [470, 1840, 120, 30],
  ];
  pools.forEach(([x, y, rx, ry], i) => {
    d += crownD(x, y, rx, ry, `s5deck/pool${i}`, 8, 0.1);
    for (let j = 0; j < 6; j++) d += fleck(x + r.jitter(rx * 1.5), y + r.jitter(ry * 1.4), rx * r.range(0.06, 0.16), `s5deck/pf${i}/${j}`);
  });
  // 4. the canopy's dapple: clusters of merging lobed flecks (sizes 0.1-0.45 m), their density by zone: ~30 % lit round
  //    the pair (the start window: warm-dark, yet a dappled floor), more on the open terrace, none in the near-left
  //    corner (the terrace tree's shade), little under the corner crown
  const weight = (x: number, y: number) => {
    if (x < 300 && y > 1560) return 0;
    if (x < 150) return 0.1;
    if (x > 880 && y > 1600) return 0.15;
    if (inWin(x, y)) return 0.65;
    return 1;
  };
  let placed = 0;
  for (let i = 0; i < 400 && placed < 70; i++) {
    const cx = r.range(FX0 + 30, FX1 - 10);
    const cy = r.range(RAIL.base + 40, FY1 - 10);
    if (r.next() > weight(cx, cy)) continue;
    placed++;
    const k = pxmY(cy);
    const n = 5 + r.int(0, 9);
    const sp = k * r.range(0.6, 1.3);
    for (let j = 0; j < n; j++) {
      const x = cx + r.jitter(sp);
      const y = cy + r.jitter(sp * 0.28);
      const fall = 1 - Math.min(1, Math.abs(x - cx) / (sp + 1)) * 0.6;
      d += fleck(x, y, Math.max(2, pxmY(y) * r.range(0.1, 0.36) * fall), `s5deck/fc${i}/${j}`);
    }
  }
  return d;
}

/** A petal: a small teardrop at angle a (s = its half-length). */
const petalD = (x: number, y: number, s: number, a: number) => {
  const c = Math.cos(a);
  const sn = Math.sin(a);
  const P = (u: number, v: number) => `${(x + u * c - v * sn).toFixed(1)} ${(y + (u * sn + v * c) * 0.6).toFixed(1)}`;
  return `M${P(-s, 0)}Q${P(-s * 0.1, -s * 0.75)} ${P(s, 0)}Q${P(-s * 0.1, s * 0.75)} ${P(-s, 0)}Z`;
};

/** Petal drifts and scattered petals (static), deterministic. */
function drifts(B: Batch) {
  const r = rng('s5deck/drifts');
  let a = '';
  let b = '';
  let c = '';
  const put = (x: number, y: number, s: number) => {
    const k = r.next();
    const e = petalD(x, y, s, r.range(0, Math.PI));
    if (k < 0.45) a += e;
    else if (k < 0.82) b += e;
    else c += e;
  };
  const sz = (y: number) => 1.5 + pxmY(y) * 0.034 * r.range(0.75, 1.25);
  // along the balustrade's plinth: a continuous drift with heaps
  for (let x = FX0; x < FX1; x += r.range(2.5, 7)) {
    put(x, RAIL.base + r.range(0.5, 5.5), sz(RAIL.base));
    if (r.chance(0.12)) for (let i = 0; i < 6; i++) put(x + r.jitter(6), RAIL.base + r.range(1, 6), sz(RAIL.base));
  }
  // caught in the joints: runs of petals along transverse joints (the grooves hold them)
  const {field} = COURSES;
  for (let i = 1; i < field.length; i++) {
    const y = dpt(0, field[i])[1];
    let x = FX0 + r.range(0, 200);
    while (x < FX1) {
      const len = r.range(20, 90) * (pxmY(y) / 60);
      if (r.chance(0.45)) for (let u = 0; u < len; u += r.range(3, 7) * (pxmY(y) / 60)) put(x + u, y + r.jitter(1.2), sz(y));
      x += len + r.range(60, 240);
    }
  }
  // along the header course's far edge
  const yb = dpt(0, COURSES.band1)[1];
  for (let x = FX0; x < FX1; x += r.range(5, 16)) put(x, yb + r.range(-1, 2), sz(yb));
  // clumps in the corners of flags and in the shade
  for (let cI = 0; cI < 30; cI++) {
    const cy = r.range(RAIL.base + 14, FY1);
    const cx = r.range(FX0 + 40, FX1 - 40);
    const n = r.int(8, 20);
    const sp = pxmY(cy) * r.range(0.22, 0.5);
    for (let i = 0; i < n; i++) put(cx + r.range(-1, 1) * sp, cy + r.range(-0.3, 0.3) * sp, sz(cy));
  }
  // scattered
  for (let i = 0; i < 520; i++) {
    const y = r.range(RAIL.base + 6, FY1);
    put(r.range(FX0, FX1), y, sz(y) * r.range(0.8, 1.05));
  }
  B.fill(DT.petal, a);
  B.fill(DT.petalShade, b);
  B.fill(DT.petalLit, c);
}

/** The deep shade in the near corners (the terrace tree, the corner crown) is simply the shade copy: no light there. */
export const DeckFloor: React.FC = () => {
  const shade = useMemo(() => {
    const B = new Batch();
    paving(B, 'shade');
    return B;
  }, []);
  const lit = useMemo(() => {
    const B = new Batch();
    paving(B, 'lit');
    return B;
  }, []);
  const light = useMemo(() => lightShapes(), []);
  const over = useMemo(() => {
    const B = new Batch();
    grates(B);
    B.layer();
    drifts(B);
    return B;
  }, []);
  return (
    <>
      <Paint b={shade} seed="s5deck/floorS" misreg={false} />
      <defs>
        <clipPath id="s5deck-light" clipPathUnits="userSpaceOnUse">
          <path d={light} />
        </clipPath>
      </defs>
      <g clipPath="url(#s5deck-light)">
        <Paint b={lit} seed="s5deck/floorL" misreg={false} />
      </g>
      <Paint b={over} seed="s5deck/floorO" misreg={false} />
    </>
  );
};
