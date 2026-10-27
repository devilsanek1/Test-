// V2S5_deck_floor.tsx (lane L4, TERRACE): the terrace FLOOR in END coords (drawn in the deck plane; 2.42x at the start).
//
//   paving    a limestone BORDER BAND along the balustrade (long slabs), a brick HEADER course, then a field of stone
//             FLAGS in random bond (courses parallel to the rail; the longitudinal joints converge on the deck's VP above
//             the pair: the lines lead up to them), a band of brick setts across the terrace, drain grates.
//   light     2 values, STATIC (STYLE section 3: no boil, no sway): the whole floor is drawn twice, in the canopy's shade
//             tones and in sunlit tones, and the sunlit copy is clipped to the LIGHT shapes: lobed sun flecks everywhere
//             (sparse and small round the pair: the start's warm-dark floor), long lobed shafts from beyond the rail on the
//             right (they fan from the low morning sun's azimuth), and a few pools in the near zone.
//   drifts    petals along the plinth, against the kerbs and bench legs, in the joints, scattered (sized to read at both
//             scales: 2-4 px at the end = 5-10 px at the start).
// Joints are drawn in the paving's own darker tone, never in ink (STYLE: no ink on the ground).
import React, {useMemo} from 'react';
import {Batch, Paint, crownD, ellD, lineD, polyD, rng, smoothClosed, type Pt} from '../kit/dc/core';
import {CAM, dpt, dAt, pxmD, pxmY, RAIL, DT, START_WIN} from './V2S5_deck_cam';

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
  // the field: courses 0.6-0.95 m deep, toward the camera, until beyond the frame's bottom
  const r = rng('s5deck/courses');
  const field: number[] = [head1];
  let d = head1;
  while (d > D_NEAR - 0.6) {
    d -= r.range(0.62, 0.92);
    field.push(d);
  }
  // the brick sett band across the terrace (two courses of setts), between field courses ~4.6 m from the rail
  const setts = {d0: head1 - 4.45, d1: head1 - 4.45 - 0.42};
  return {band0, band1, head1, field, setts};
})();

type Tone = 'lit' | 'shade';

/** Picks a floor tone for a course / slab in the lit or shade version. */
const T = (tone: Tone) =>
  tone === 'lit'
    ? {base: DT.lit, var: [DT.litHi, DT.litWarm, DT.litCool], joint: DT.jointLit, band: DT.band, bandJoint: DT.jointLit, header: DT.header, sett: DT.brickSett, sett2: DT.brickSettLight}
    : {base: DT.shade, var: [DT.shadeHi, DT.shadeLo, DT.shadeCool], joint: DT.jointShade, band: DT.bandShade, bandJoint: DT.jointShade, header: DT.headerShade, sett: DT.brickSettShade, sett2: DT.shadeLo};

/** The paving in one light (the same geometry for both: seeds fixed). */
function paving(B: Batch, tone: Tone) {
  const C = T(tone);
  const {band0, band1, head1, field, setts} = COURSES;
  // base
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
    B.ink(j, 1.4, C.bandJoint);
    B.ink(lineD([[FX0, y1], [FX1, y1]]), 1.6, C.bandJoint);
  }
  // the header course (brick on edge, small units)
  {
    const y0 = dpt(0, band1)[1];
    const y1 = dpt(0, head1)[1];
    B.rect(C.header, FX0, y0, FX1 - FX0, y1 - y0);
    const [xa, xb] = xRange(band1);
    let j = '';
    for (let X = xa; X < xb; X += 0.22) j += lineD([dpt(X, band1), dpt(X, head1)]);
    B.ink(j, 0.8, mix2(C.header, C.joint));
  }
  // the field: flags in random bond
  B.layer();
  const r = rng('s5deck/flags');
  const tints = new Map<string, string>();
  const addTint = (col: string, d: string) => tints.set(col, (tints.get(col) ?? '') + d);
  let trans = '';
  let longi = '';
  for (let i = 0; i < field.length - 1; i++) {
    const d0 = field[i];
    const d1 = field[i + 1];
    // skip the sett band's courses (drawn below)
    const [xa, xb] = xRange(d1);
    const yA = dpt(0, d0)[1];
    trans += lineD([[FX0, yA], [FX1, yA]]);
    let X = xa - r.range(0, 1.2);
    while (X < xb) {
      const w = r.range(0.85, 1.45);
      const k = r.next();
      if (k < 0.24) {
        const col = C.var[Math.floor(k * 12.5) % C.var.length];
        addTint(col, polyD([dpt(X + 0.04, d0 - 0.03), dpt(X + w - 0.04, d0 - 0.03), dpt(X + w - 0.04, d1 + 0.03), dpt(X + 0.04, d1 + 0.03)]));
      }
      X += w;
      longi += lineD([dpt(X, d0), dpt(X, d1)]);
    }
  }
  tints.forEach((d, col) => B.fill(col, d));
  // the brick sett band (two courses of setts) across the field
  {
    const {d0, d1} = setts;
    const y0 = dpt(0, d0)[1];
    const y1 = dpt(0, d1)[1];
    B.rect(C.sett, FX0, y0, FX1 - FX0, y1 - y0);
    const dm = (d0 + d1) / 2;
    B.rect(C.sett2, FX0, dpt(0, dm)[1] - 0.6, FX1 - FX0, 1.2);
    const [xa, xb] = xRange(d1);
    let j = '';
    for (let X = xa; X < xb; X += 0.21) {
      j += lineD([dpt(X, d0), dpt(X, dm)]);
      j += lineD([dpt(X + 0.105, dm), dpt(X + 0.105, d1)]);
    }
    B.layer();
    B.ink(j, 0.9, C.joint);
    B.ink(lineD([[FX0, y0], [FX1, y0]]) + lineD([[FX0, y1], [FX1, y1]]), 1.5, C.joint);
  }
  B.layer();
  // joints: width grows toward us (thin far, ~2.4 px at the bottom)
  B.ink(trans, 1.5, C.joint);
  B.ink(longi, 1.3, C.joint);
}

/** sRGB mix 50/50 (helper for a joint between two tones). */
function mix2(a: string, b: string): string {
  const h = (s: string) => [1, 3, 5].map((i) => parseInt(s.slice(i, i + 2), 16));
  const A = h(a);
  const Bc = h(b);
  return '#' + A.map((v, i) => Math.round((v + Bc[i]) / 2).toString(16).padStart(2, '0')).join('').toUpperCase();
}

/** Drain grates: small iron gratings in the field (static). */
function grates(B: Batch) {
  const spots: [number, number][] = [
    [1.4, 18.4],
    [8.6, 15.2],
    [-0.4, 12.4],
    [4.4, 10.2],
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

/** The sunlit shapes (END coords) as one path: the lit copy of the floor is clipped to it. */
export function lightShapes(): string {
  const r = rng('s5deck/light');
  let d = '';
  // the low morning sun beyond the view, right: shafts fan from its azimuth on the horizon
  const sun: Pt = [1110, CAM.hz];
  const inWin = (x: number, y: number) => x > START_WIN.x0 - 30 && x < START_WIN.x1 + 10 && y < START_WIN.y1 + 10;
  // 1. long shafts from beyond the rail (right of the start window), lobed edges
  const shaftAt = [770, 840, 905, 985, 1060, 1130];
  shaftAt.forEach((x0, i) => {
    const y0 = RAIL.base + 6;
    const w0 = r.range(10, 22);
    const len = r.range(420, 760);
    const ux = x0 - sun[0];
    const uy = y0 - sun[1];
    const n = Math.hypot(ux, uy);
    const dx = ux / n;
    const dy = uy / n;
    const L: Pt[] = [];
    const R: Pt[] = [];
    const steps = 9;
    for (let k = 0; k <= steps; k++) {
      const u = k / steps;
      const cx = x0 + dx * len * u;
      const cy = y0 + dy * len * u;
      const w = (w0 + (w0 * 2.6 - w0) * u) * (1 + 0.28 * Math.sin(u * 9 + i * 2.1)) * (k === 0 ? 0.4 : 1);
      L.push([cx - dy * w * 0.5 + r.jitter(2), cy + dx * w * 0.5]);
      R.push([cx + dy * w * 0.5 + r.jitter(2), cy - dx * w * 0.5]);
    }
    d += smoothClosed([...L, ...R.reverse()]);
  });
  // 2. sun flecks: small lobed spots, sparse and small round the pair (the start's warm-dark floor), more elsewhere
  for (let i = 0; i < 150; i++) {
    const x = r.range(FX0, FX1);
    const y = r.range(RAIL.base + 4, FY1);
    const win = inWin(x, y);
    if (win && r.chance(0.55)) continue;
    const s = pxmY(y) * (win ? r.range(0.08, 0.2) : r.range(0.1, 0.34));
    d += crownD(x, y, s * r.range(1.3, 2.2), s * r.range(0.45, 0.75), `s5deck/fl${i}`, 5, 0.15);
  }
  // 3. pools in the near zone (gaps in the near crowns' shade): lobed, wider than deep
  const pools: [number, number, number, number][] = [
    [520, 1590, 120, 30],
    [700, 1660, 150, 40],
    [330, 1780, 130, 36],
    [600, 1850, 170, 46],
  ];
  pools.forEach(([x, y, rx, ry], i) => {
    d += crownD(x, y, rx, ry, `s5deck/pool${i}`, 8, 0.12);
  });
  return d;
}

/** Petal drifts and scattered petals (static), deterministic. */
function drifts(B: Batch) {
  const r = rng('s5deck/drifts');
  let a = '';
  let b = '';
  let c = '';
  const put = (x: number, y: number, s: number, k: number) => {
    const e = ellD(x, y, s, s * 0.58);
    if (k < 0.45) a += e;
    else if (k < 0.85) b += e;
    else c += e;
  };
  // along the balustrade's plinth (a continuous drift line)
  for (let x = FX0; x < FX1; x += r.range(3, 9)) put(x, RAIL.base + r.range(0.5, 6), r.range(1.6, 2.6), r.next());
  // against the header course's far edge
  const yb = dpt(0, COURSES.band1)[1];
  for (let x = FX0; x < FX1; x += r.range(7, 20)) put(x, yb + r.range(-1, 2), r.range(1.5, 2.3), r.next());
  // clumps (in the corners of flags, round the legs of things, in the shade)
  for (let cI = 0; cI < 34; cI++) {
    const cy = r.range(RAIL.base + 14, FY1);
    const cx = r.range(FX0 + 40, FX1 - 40);
    const n = r.int(9, 24);
    const sp = pxmY(cy) * r.range(0.25, 0.6);
    for (let i = 0; i < n; i++) {
      const x = cx + r.range(-1, 1) * sp;
      const y = cy + r.range(-0.3, 0.3) * sp;
      put(x, y, 1.5 + pxmY(y) * 0.032 * r.range(0.7, 1.25), r.next());
    }
  }
  // scattered
  for (let i = 0; i < 700; i++) {
    const y = r.range(RAIL.base + 6, FY1);
    const x = r.range(FX0, FX1);
    put(x, y, 1.4 + pxmY(y) * 0.03 * r.range(0.6, 1.3), r.next());
  }
  B.fill(DT.petal, a);
  B.fill(DT.petalShade, b);
  B.fill(DT.petalLit, c);
}

/** The floor (END coords): shade copy, the sunlit copy clipped to the light shapes, grates, drifts. */
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
      <Paint b={over} seed="s5deck/floorO" misreg={2} />
    </>
  );
};
