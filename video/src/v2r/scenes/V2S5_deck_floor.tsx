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
import {Batch, Paint, crownD, lineD, polyD, rng, smoothClosed, type Pt} from '../kit/dc/core';
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

/** One fleck / spot: lobed, wider than deep (the floor is seen at a slant). */
const fleck = (x: number, y: number, rx: number, seed: string, k = 0.42) => crownD(x, y, rx, rx * k, seed, 5, 0.1);

/** A lobed region bounded by a ragged outline through `pts` (closed, smooth). */
const lobed = (pts: Pt[]) => smoothClosed(pts);

/** The shade zones' outlines (END coords) and their edges toward the light (with the outward normal): the edges get
 *  a dappled penumbra (dark spots outside, sun flecks inside), so a shadow's edge breaks up like leaves'. */
type Zone = {pts: Pt[]; edges: {pts: Pt[]; n: Pt}[]};
const ZONES: Zone[] = (() => {
  const r = rng('s5deck/zones');
  const out: Zone[] = [];
  const bandY1 = dpt(0, COURSES.band1)[1];
  // (a) the canopy's shade round the pair: from the rail (below the lit slot pool under the bench and the news box)
  //     down to a lobed edge at y ~1470-1545, from beyond the left edge to x ~640-700
  {
    const pts: Pt[] = [];
    const xL = FX0 - 20;
    const xR = 670;
    pts.push([xL, RAIL.base - 1]);
    for (let x = xL; x <= SPOT.bench.x0 - 30; x += 30) pts.push([x, RAIL.base - 1]);
    pts.push([SPOT.bench.x0 - 22, bandY1 + 2]);
    for (let x = SPOT.bench.x0; x <= SPOT.newsBox.x1 + 10; x += 20) pts.push([x, bandY1 + 10 + 8 * Math.sin(x * 0.05) + r.range(0, 10)]);
    pts.push([SPOT.newsBox.x1 + 24, RAIL.base - 1]);
    pts.push([xR - 30, RAIL.base - 1]);
    const right: Pt[] = [];
    for (let y = RAIL.base + 10; y <= 1500; y += 23) right.push([xR + 30 * Math.sin(y * 0.026 + 0.4) + 12 * Math.sin(y * 0.071) + 7 * Math.sin(y * 0.19) + r.range(-3, 3), y]);
    const bottom: Pt[] = [];
    for (let x = xR; x >= xL; x -= 20) bottom.push([x, 1505 + 34 * Math.sin(x * 0.016 + 0.7) + 14 * Math.sin(x * 0.043 + 2) + 6 * Math.sin(x * 0.17) + r.range(-3, 3)]);
    out.push({pts: [...pts, ...right, ...bottom], edges: [{pts: right, n: [1, 0]}, {pts: bottom, n: [0, 1]}]});
  }
  // (b) the terrace tree's shade: a strip down the left and the near-left corner
  {
    const side: Pt[] = [];
    for (let y = 1480; y <= 1700; y += 22) side.push([200 + 26 * Math.sin(y * 0.045) + 6 * Math.sin(y * 0.2) + r.range(-3, 3), y]);
    const top: Pt[] = [];
    for (let x = 220; x <= 480; x += 22) top.push([x, 1735 + 34 * Math.sin(x * 0.028 + 1) + 6 * Math.sin(x * 0.18) + r.range(-3, 3)]);
    out.push({pts: [[FX0 - 20, 1480], ...side, ...top, [500, FY1 + 10], [FX0 - 20, FY1 + 10]], edges: [{pts: side, n: [1, 0]}, {pts: top, n: [0, -1]}]});
  }
  // (c) the corner crown's shade, bottom-right
  {
    const side: Pt[] = [];
    for (let y = 1600; y <= 1780; y += 22) side.push([900 - (y - 1600) * 0.6 + 8 * Math.sin(y * 0.15) + r.range(-4, 4), y]);
    const top: Pt[] = [];
    for (let x = 790; x >= 700; x -= 22) top.push([x, 1805 + 10 * Math.sin(x * 0.12) + r.range(0, 12)]);
    out.push({pts: [[FX1 + 20, 1580], ...side, ...top, [690, FY1 + 10], [FX1 + 20, FY1 + 10]], edges: [{pts: side, n: [-0.8, -0.6]}, {pts: top, n: [-0.3, -0.95]}]});
  }
  return out;
})();

/** Dappled penumbra spots along a zone's edges: outside (dark: to the shade clip) or inside (lit: to the flecks). */
function penumbra(side: 1 | -1, seed: string): string {
  const r = rng(seed);
  let d = '';
  ZONES.forEach((z, zi) =>
    z.edges.forEach((e, ei) => {
      for (let i = 0; i < e.pts.length; i++) {
        const [x, y] = e.pts[i];
        const k = pxmY(y);
        const n = r.int(1, 3);
        for (let j = 0; j < n; j++) {
          const u = k * r.range(0.06, 0.55);
          const px = x + e.n[0] * u * side + r.jitter(k * 0.15);
          const py = y + e.n[1] * u * side * 0.4 + r.jitter(k * 0.05);
          const s = k * r.range(0.05, 0.16) * (1 - (u / (k * 0.55)) * 0.55);
          d += fleck(px, py, Math.max(1.8, s), `${seed}/${zi}/${ei}/${i}/${j}`);
        }
      }
    }),
  );
  return d;
}

/** The SHADE shapes over the sunlit floor (END coords): the canopy's shade round the pair (the start window: the
 *  start's warm-dark floor) cast by the slope's crowns beyond the rail, the terrace tree's shade down the left and
 *  in the near-left corner, the corner crown's shade bottom-right, a few long crown shadows across the sunny right,
 *  leaf-shadow spots (the dapple's dark half) on the lit floor and the zones' dappled penumbra. */
export function shadeShapes(): string[] {
  const r = rng('s5deck/shade');
  const out: string[] = ZONES.map((z) => lobed(z.pts));
  let d = '';
  // long crown shadows across the sunny right and the near middle (from beyond, toward us-left)
  const blobs: [number, number, number, number][] = [
    [790, 1335, 70, 16],
    [1010, 1300, 95, 20],
    [905, 1488, 80, 18],
    [1090, 1560, 90, 24],
    [640, 1640, 100, 22],
    [560, 1760, 80, 20],
  ];
  blobs.forEach(([x, y, rx, ry], i) => (d += crownD(x, y, rx, ry, `s5deck/sb${i}`, 9, 0.1)));
  // leaf-shadow spots on the lit floor, clustered
  for (let i = 0; i < 26; i++) {
    const cx = r.range(640, FX1);
    const cy = r.range(RAIL.base + 50, 1900);
    const k = pxmY(cy);
    const n = 3 + r.int(0, 5);
    for (let j = 0; j < n; j++) d += fleck(cx + r.jitter(k * 0.9), cy + r.jitter(k * 0.25), Math.max(2, k * r.range(0.08, 0.24)), `s5deck/ls${i}/${j}`);
  }
  for (let i = 0; i < 12; i++) {
    const cx = r.range(300, 640);
    const cy = r.range(1560, 1900);
    const k = pxmY(cy);
    for (let j = 0; j < 4; j++) d += fleck(cx + r.jitter(k * 0.8), cy + r.jitter(k * 0.22), Math.max(2, k * r.range(0.08, 0.22)), `s5deck/ls2${i}/${j}`);
  }
  out.push(d);
  out.push(penumbra(1, 's5deck/penD'));
  return out;
}

/** The SUN FLECKS inside the shade (END coords): the dapple's light half in the canopy's shade (round the pair, ~25 %
 *  lit: sun spots through the blossom at the start), the zones' inner penumbra, a few in the near corners. */
export function fleckShapes(): string[] {
  const r = rng('s5deck/flecks');
  let d = '';
  // the slot pool's frayed edge: flecks just below the lit band under the bench and the box
  const bandY1 = dpt(0, COURSES.band1)[1];
  for (let i = 0; i < 16; i++) d += fleck(r.range(SPOT.bench.x0 - 10, SPOT.newsBox.x1 + 20), r.range(bandY1 + 8, bandY1 + 40), r.range(3, 8), `s5deck/sl${i}`);
  // clusters in the canopy's shade (merging spots, 0.08-0.3 m)
  let placed = 0;
  for (let i = 0; i < 300 && placed < 26; i++) {
    const cx = r.range(START_WIN.x0 - 60, 660);
    const cy = r.range(RAIL.base + 50, 1510);
    if (!inWin(cx, cy) && r.chance(0.6)) continue;
    placed++;
    const k = pxmY(cy);
    const n = 4 + r.int(0, 8);
    const sp = k * r.range(0.5, 1.1);
    for (let j = 0; j < n; j++) {
      const x = cx + r.jitter(sp);
      const y = cy + r.jitter(sp * 0.28);
      const fall = 1 - Math.min(1, Math.abs(x - cx) / (sp + 1)) * 0.6;
      d += fleck(x, y, Math.max(2, pxmY(y) * r.range(0.08, 0.3) * fall), `s5deck/fc${i}/${j}`);
    }
  }
  // a few in the near corners' shade
  for (let i = 0; i < 7; i++) {
    const x = r.range(180, 480);
    const y = r.range(1760, 1960);
    d += fleck(x, y, pxmY(y) * r.range(0.1, 0.22), `s5deck/fn${i}`);
  }
  return [d, penumbra(-1, 's5deck/penL')];
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

/** The floor (END coords): the sunlit paving, the shade copy clipped to the shade shapes, the sunlit copy again
 *  clipped to the flecks inside the shade (a static 2-value dapple), then grates and petal drifts. */
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
  const shadeD = useMemo(() => shadeShapes(), []);
  const fleckD = useMemo(() => fleckShapes(), []);
  const over = useMemo(() => {
    const B = new Batch();
    grates(B);
    B.layer();
    drifts(B);
    return B;
  }, []);
  return (
    <>
      <Paint b={lit} seed="s5deck/floorL" misreg={false} />
      <defs>
        <clipPath id="s5deck-shade" clipPathUnits="userSpaceOnUse">
          {shadeD.map((d, i) => (
            <path key={i} d={d} />
          ))}
        </clipPath>
        <clipPath id="s5deck-fleck" clipPathUnits="userSpaceOnUse">
          {fleckD.map((d, i) => (
            <path key={i} d={d} />
          ))}
        </clipPath>
      </defs>
      <g clipPath="url(#s5deck-shade)">
        <Paint b={shade} seed="s5deck/floorS" misreg={false} />
      </g>
      <g clipPath="url(#s5deck-fleck)">
        <Paint b={lit} seed="s5deck/floorL2" misreg={false} />
      </g>
      <Paint b={over} seed="s5deck/floorO" misreg={false} />
    </>
  );
};
