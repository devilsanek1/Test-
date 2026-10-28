// V2S5_deck_floor.tsx (lane L4, TERRACE): the terrace FLOOR in END coords (drawn in the deck plane; 2.42x at the start).
// ONE calm lit paving (tier C: low contrast, no ink, the paving's own colours; CRAFT §b-§c, §f.4):
//   band      a limestone BORDER BAND along the balustrade (long slabs, a step lighter: the slot's lit strip under the
//             pair at the start), then a HEADER COURSE as one calm rose band (no brick joints).
//   field     stone flags in COLUMNS whose joints run straight to the deck's VP above the pair (the lines lead up to
//             them), staggered cross joints, three close tones (+-2 L*). Joints are TONE BANDS (fills, never ink: the
//             environment tier drops ink), |dL*| >= 6 to every flag, narrowing with distance.
//   drifts    petals as a FEW flat shapes: short drifts against the plinth and the kerbs, a dozen single petals; sized to
//             read at the end (2.42x at the start), never a speckle field.
//   shade     DECK_SHADE: the large soft shade shapes (the canopy's shade over the start's floor and the terrace tree's at
//             the end, the corner crown's bottom-right). Drawn by S5Deck as `Shadow` in the deck's ONE ShadowLayer (the
//             rig's tint family multiplied, a two-step soft edge): never a hand-picked darker copy of the floor.
// Every floor fill is a BACKDROP with its calm colour authored here (shown exactly; the tier never recolours it by the
// size of a merged path). Nothing moves.
import React, {useMemo} from 'react';
import {Fill} from '../../lib/Fill';
import {fromLch} from '../../lib/light';
import {polyD, rng, smoothClosed, type Pt} from '../kit/dc/core';
import {CAM, dpt, dAt, pxmY, RAIL, SPOT} from './V2S5_deck_cam';

/** The floor's extent (END coords): beyond both edges and below the frame at every p. */
const FX0 = -80;
const FX1 = 1160;
const FY1 = 2000;
const D_NEAR = dAt(FY1);
/** Lateral metres spanned at depth d (with a margin). */
const xRange = (d: number): [number, number] => [((FX0 - CAM.vpx) * d) / CAM.f, ((FX1 - CAM.vpx) * d) / CAM.f];

/** The floor's calm colours (shown as authored: backdrops). L* 87 lit paving, flags +-2, joints -8.6 (>= 6 to every
 *  flag, lit or under the shade's multiply), the border band a step lighter, the header course a rose band. */
export const FLOOR = {
  base: fromLch(87.0, 12.5, 70),
  light: fromLch(89.0, 11.5, 74),
  dark: fromLch(85.4, 13.5, 66),
  joint: fromLch(78.4, 15.5, 56),
  band: fromLch(90.2, 8.0, 82),
  bandJoint: fromLch(82.0, 10.5, 66),
  header: fromLch(80.6, 16.0, 50),
  petal: fromLch(82.6, 17.0, 6),
  petalDeep: fromLch(78.6, 19.0, 2),
  petalPale: fromLch(86.4, 12.5, 14),
};

/** The courses (depths in metres): the border band, the header course, then the field. */
export const COURSES = (() => {
  const band0 = CAM.railD - 0.04;
  const band1 = band0 - 1.5;
  const head1 = band1 - 0.32;
  return {band0, band1, head1};
})();

/** Joint width (m) and the on-screen floor of a cross joint's thickness (px at the end: never a sub-pixel hairline). */
const JOINT = 0.035;
const MIN_PX = 1.3;
/** The field's columns: 0.9 m wide, a joint at X = 0.45 + k 0.9 (the VP column is a flag's middle: the pair sits between
 *  two lines that lead up to them). */
const COL_W = 0.9;
const COL_X0 = 0.45;

const quad = (X0: number, X1: number, d0: number, d1: number) => polyD([dpt(X0, d0), dpt(X1, d0), dpt(X1, d1), dpt(X0, d1)]);
const rectD = (x0: number, y0: number, x1: number, y1: number) => polyD([[x0, y0], [x1, y0], [x1, y1], [x0, y1]]);

type Layer = [string, string][];

/** The paving as [colour, path] in draw order (static). */
function paving(): Layer {
  const {band0, band1, head1} = COURSES;
  const out: Layer = [];
  const yBand0 = RAIL.base - 3;
  const yBand1 = dpt(0, band1)[1];
  const yHead1 = dpt(0, head1)[1];
  // the border band (limestone slabs 1.6-2.2 m long along the rail) and the header course
  out.push([FLOOR.band, rectD(FX0, yBand0, FX1, yBand1)]);
  out.push([FLOOR.header, rectD(FX0, yBand1, FX1, yHead1)]);
  {
    const r = rng('s5deck/band');
    const [xa, xb] = xRange(band0);
    let j = '';
    for (let X = xa + r.range(0, 1); X < xb; X += r.range(1.6, 2.2)) j += quad(X - JOINT / 2, X + JOINT / 2, band0, band1);
    out.push([FLOOR.bandJoint, j]);
  }
  // the field: columns to the VP, staggered cross joints, three close tones
  out.push([FLOOR.base, rectD(FX0, yHead1, FX1, FY1 + 10)]);
  const r = rng('s5deck/flags');
  const [xa] = xRange(head1);
  const [, xb] = xRange(head1);
  const k0 = Math.floor((xa - COL_X0) / COL_W) - 1;
  const k1 = Math.ceil((xb - COL_X0) / COL_W) + 1;
  let light = '';
  let dark = '';
  let joints = '';
  for (let k = k0; k <= k1; k++) {
    const Xa = COL_X0 + k * COL_W;
    const Xb = Xa + COL_W;
    // the long joint (its far end at the header course, its near end below the frame)
    joints += quad(Xa - JOINT / 2, Xa + JOINT / 2, head1, D_NEAR - 0.3);
    // flags along the column, the first one cut by the header course at a random length
    let d0 = head1;
    let d1 = head1 - r.range(0.3, 1.5);
    while (d0 > D_NEAR - 0.3) {
      const u = r.next();
      if (u < 0.2) light += quad(Xa, Xb, d0, d1);
      else if (u < 0.4) dark += quad(Xa, Xb, d0, d1);
      // the cross joint at d1: JOINT wide, never thinner than MIN_PX on screen
      const t = Math.max(JOINT, (MIN_PX * d1 * d1) / (CAM.f * CAM.h));
      joints += quad(Xa, Xb, d1 + t / 2, d1 - t / 2);
      d0 = d1;
      d1 = d0 - r.range(0.95, 1.55);
    }
  }
  out.push([FLOOR.light, light]);
  out.push([FLOOR.dark, dark]);
  out.push([FLOOR.joint, joints]);
  return out;
}

// ---------------------------------------------------------------- petals: a few flat shapes

/** A petal: a small teardrop at angle a (s = its half-length), flattened by the floor's slant. */
const petalD = (x: number, y: number, s: number, a: number) => {
  const c = Math.cos(a);
  const sn = Math.sin(a);
  const P = (u: number, v: number) => `${(x + u * c - v * sn).toFixed(1)} ${(y + (u * sn + v * c) * 0.6).toFixed(1)}`;
  return `M${P(-s, 0)}Q${P(-s * 0.1, -s * 0.75)} ${P(s, 0)}Q${P(-s * 0.1, s * 0.75)} ${P(-s, 0)}Z`;
};

/** A drift: ONE flat lobed shape along a kerb from x0 to x1 at y (its base on the kerb line), `th` px thick at most. */
function driftD(x0: number, x1: number, y: number, th: number, seed: string): string {
  const r = rng(seed);
  const n = Math.max(4, Math.round((x1 - x0) / Math.max(6, th * 1.6)));
  const top: Pt[] = [];
  for (let i = 0; i <= n; i++) {
    const u = i / n;
    const env = Math.sin(Math.PI * u) ** 0.7;
    top.push([x0 + (x1 - x0) * u, y - th * env * r.range(0.6, 1)]);
  }
  const bot: Pt[] = [
    [x1, y + th * 0.12],
    [(x0 + x1) / 2, y + th * 0.3],
    [x0, y + th * 0.12],
  ];
  return smoothClosed([...top, ...bot]);
}

/** The drifts and single petals as [colour, path] (static). */
function petals(): Layer {
  const r = rng('s5deck/petals');
  const k = (y: number) => pxmY(y);
  let a = '';
  let b = '';
  let c = '';
  // drifts against the plinth (a few, never a continuous line): left of the bench by the tote, right of the news box,
  // and along the right; and against the kerbs (the near bench's feet, the bin, the tulip beds' edging, the tree pit)
  const yb = RAIL.base + 1;
  const plinth: [number, number][] = [
    [-60, 40],
    [SPOT.bench.x0 - 52, SPOT.bench.x0 - 18],
    [SPOT.newsBox.x1 + 8, SPOT.newsBox.x1 + 70],
    [800, 870],
    [1010, 1110],
  ];
  plinth.forEach(([x0, x1], i) => (i % 2 ? (b += driftD(x0, x1, yb, 4.2, `s5deck/dp${i}`)) : (a += driftD(x0, x1, yb, 4.6, `s5deck/dp${i}`))));
  const kerbs: [number, number, number, number][] = [
    [150, 232, 1702, 7.5],
    [452, 520, 1704, 7.0],
    [104, 168, 1676, 6.5],
    [560, 650, 1810, 8.5],
    [150, 290, 1908, 10.0],
    [980, 1060, 1640, 7.0],
  ];
  kerbs.forEach(([x0, x1, y, th], i) => (i % 2 ? (a += driftD(x0, x1, y, th, `s5deck/dk${i}`)) : (b += driftD(x0, x1, y, th, `s5deck/dk${i}`))));
  // single petals: a dozen and a half, more toward the trees (left, bottom-right) and a few round the pair
  const spots: [number, number][] = [
    [230, 1262], [405, 1258], [470, 1290], [262, 1318], [560, 1352], [330, 1395], [610, 1300],
    [120, 1450], [205, 1540], [68, 1600], [300, 1610], [440, 1760], [260, 1850],
    [760, 1520], [880, 1600], [930, 1700], [820, 1880], [1040, 1820],
  ];
  for (const [x, y] of spots) {
    const s = 2.2 + 0.034 * k(y) * r.range(0.85, 1.15);
    const e = petalD(x + r.jitter(8), y + r.jitter(4), s, r.range(0, Math.PI));
    const u = r.next();
    if (u < 0.5) a += e;
    else if (u < 0.75) b += e;
    else c += e;
  }
  return [
    [FLOOR.petal, a],
    [FLOOR.petalDeep, b],
    [FLOOR.petalPale, c],
  ];
}

// ---------------------------------------------------------------- the large soft shade shapes (for the ShadowLayer)

/** A lobed edge through control points: gentle lobes (`amp` px, every ~`per` px), smooth (closed later). */
function lobedEdge(ctrl: Pt[], amp: number, per: number, seed: string): Pt[] {
  const r = rng(seed);
  const out: Pt[] = [];
  for (let i = 0; i < ctrl.length - 1; i++) {
    const [ax, ay] = ctrl[i];
    const [bx, by] = ctrl[i + 1];
    const len = Math.hypot(bx - ax, by - ay);
    const n = Math.max(1, Math.round(len / (per / 2)));
    const nx = -(by - ay) / len;
    const ny = (bx - ax) / len;
    for (let j = 0; j < n; j++) {
      const u = j / n;
      const s = (out.length % 2 ? -0.55 : 1) * amp * r.range(0.6, 1);
      out.push([ax + (bx - ax) * u + nx * s, ay + (by - ay) * u + ny * s]);
    }
  }
  out.push(ctrl[ctrl.length - 1]);
  return out;
}

/** The deck's large soft shade shapes (END coords), static:
 *  A  the canopy's shade over the start's floor below the slot's lit strip (the pair and the news box stand in the
 *     light), which at the end is the terrace tree's shade over the floor's left third down to the bottom-left corner;
 *  B  the corner crown's shade, bottom-right (toward us and left of it). */
export const DECK_SHADE: string[] = (() => {
  const A = lobedEdge(
    [
      [-140, 1304],
      [180, 1300],
      [500, 1314],
      [560, 1334],
      [606, 1384],
      [612, 1440],
      [578, 1494],
      [520, 1546],
      [458, 1600],
      [404, 1664],
      [368, 1738],
      [352, 1816],
      [366, 1896],
      [408, 1966],
      [430, 2030],
    ],
    11,
    92,
    's5deck/shadeA',
  );
  const B = lobedEdge(
    [
      [1200, 1688],
      [1090, 1708],
      [990, 1738],
      [890, 1782],
      [800, 1832],
      [722, 1890],
      [676, 1952],
      [660, 2030],
    ],
    12,
    96,
    's5deck/shadeB',
  );
  return [smoothClosed([...A, [-140, 2030]]), smoothClosed([...B, [1200, 2030]])];
})();

/** Renders a list of [colour, path] as exact backdrop fills (no misregistration; the colours are already calm). */
const FlatFills: React.FC<{fills: Layer; seed: string}> = ({fills, seed}) => (
  <>
    {fills.map(([color, d], i) => (d ? <Fill key={i} d={d} color={color} offset={false} backdrop seed={`${seed}/${i}`} /> : null))}
  </>
);

/** The floor (END coords): the paving, then the petals. Static. */
export const DeckFloor: React.FC = () => {
  const fills = useMemo(() => [...paving(), ...petals()], []);
  return <FlatFills fills={fills} seed="s5deck/floor" />;
};
