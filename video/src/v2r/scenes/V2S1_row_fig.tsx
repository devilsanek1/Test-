// V2S1 helper (lane L1): THE ROW FIGURE. ONE drawing for her, every ghost (G1-G6) and the three bare outlines (O1-O3),
// so the copies are visibly her (TREATMENT sections 3-4; STYLE section 4; critic round 0 must #1: "white gowns /
// shrouds"). A small woman in a long belted coat walking away-left down the towpath, rear 3/4, from behind:
//   a round head that IS the hair, a LOW BUN at the back of it (lower right: it also says which way she faces), a
//   turned-up collar at the nape, slim shoulders (0.225 H; ~0.25 H drawn, with the line), a belted waist with a knot at the back, sleeves as wide as
//   an arm swinging a little with the stride (no hands: the sleeve ends at the cuff), a centre back vent that opens and
//   a hem that flares with the stride, the hem at mid-calf so the legs and shoes walk clearly below it.
// Legs: a near-profile scissor (forward foot screen-left and a touch higher = further away, back foot on its toes), so
// BOTH contact poses (x.5) are equally wide (~27 px between the feet at 170 px): the kit's rear-3/4 legs crossed on
// one phase. Feet are planted through stance (the foot moves back under the hip at the walking speed).
// Geometry is built once per drawing at a canonical 170 px and placed with a scale (h / 170); ink widths are given in
// SCREEN px and divided by the scale, so every size has the same model sheet and the depth ladder's line weight.
// Colours: CM tokens only; each line its own fill's deep shade under the clean pen (thin coloured details are fills). Nothing fades: pops are pen draw-ons
// and snap fills; the un-build is the engine's (one ExitSync per figure).
import React, {useId} from 'react';
import {Fill} from '../../lib/Fill';
import {Ink, parseInk} from '../../lib/Ink';
import {ExitSync} from '../../lib/exit';
import {mat, XG} from '../../lib/xf';
import {ease, useTime} from '../../lib/time';
import {rng} from '../../lib/rng';
import {CM} from '../palette';
import {penLoop, ellipsePath, circlePath, type Pt} from '../kit/cast/parts';

/** The canonical drawing height (local px); every figure is this drawing scaled to its height. */
export const FIG_H = 170;

// ---------------------------------------------------------------- path helpers (pure)

const fx = (n: number) => (Math.round(n * 10) / 10).toString();
const PT = (p: Pt) => `${fx(p[0])} ${fx(p[1])}`;
const polyPath = (pts: Pt[], closed = true) => pts.map((p, i) => `${i ? 'L' : 'M'}${PT(p)}`).join('') + (closed ? 'Z' : '');
const smooth = (u: number) => {
  const c = Math.max(0, Math.min(1, u));
  return c * c * (3 - 2 * c);
};
const deg = (a: number) => (a * Math.PI) / 180;
/** Rotate p about c by a (rad); a > 0 lifts points to the RIGHT of c (screen y down). */
const rotP = (p: Pt, c: Pt, a: number): Pt => {
  const dx = p[0] - c[0];
  const dy = p[1] - c[1];
  const ca = Math.cos(a);
  const sa = Math.sin(a);
  return [c[0] + dx * ca + dy * sa, c[1] - dx * sa + dy * ca];
};

/** Catmull-Rom segments through pts (no leading M): appended after a path already at pts[0]. */
function crSegs(pts: Pt[], tension = 0.5): string {
  const n = pts.length;
  if (n < 2) return '';
  const k = tension / 3;
  const g = (i: number): Pt => pts[Math.max(0, Math.min(n - 1, i))];
  let d = '';
  for (let i = 0; i < n - 1; i++) {
    const p0 = g(i - 1);
    const p1 = g(i);
    const p2 = g(i + 1);
    const p3 = g(i + 2);
    d += `C${PT([p1[0] + (p2[0] - p0[0]) * k, p1[1] + (p2[1] - p0[1]) * k])} ${PT([p2[0] - (p3[0] - p1[0]) * k, p2[1] - (p3[1] - p1[1]) * k])} ${PT(p2)}`;
  }
  return d;
}
const crOpen = (pts: Pt[], tension = 0.5) => (pts.length ? `M${PT(pts[0])}${crSegs(pts, tension)}` : '');
/** A closed smooth loop through pts. */
function crClosed(pts: Pt[], tension = 0.5): string {
  const n = pts.length;
  const k = tension / 3;
  const g = (i: number): Pt => pts[((i % n) + n) % n];
  let d = `M${PT(pts[0])}`;
  for (let i = 0; i < n; i++) {
    const p0 = g(i - 1);
    const p1 = g(i);
    const p2 = g(i + 1);
    const p3 = g(i + 2);
    d += `C${PT([p1[0] + (p2[0] - p0[0]) * k, p1[1] + (p2[1] - p0[1]) * k])} ${PT([p2[0] - (p3[0] - p1[0]) * k, p2[1] - (p3[1] - p1[1]) * k])} ${PT(p2)}`;
  }
  return d + 'Z';
}

/** A limb (sleeve, trouser leg) along a joint chain with half-widths: one closed outline, round ends. */
function limb(P: Pt[], w: number[]): string {
  const n = P.length;
  const nrm: Pt[] = [];
  for (let i = 0; i < n; i++) {
    const a = P[Math.max(0, i - 1)];
    const b = P[Math.min(n - 1, i + 1)];
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const l = Math.hypot(dx, dy) || 1;
    nrm.push([-dy / l, dx / l]);
  }
  const left = P.map((p, i): Pt => [p[0] + nrm[i][0] * w[i], p[1] + nrm[i][1] * w[i]]);
  const right = P.map((p, i): Pt => [p[0] - nrm[i][0] * w[i], p[1] - nrm[i][1] * w[i]]).reverse();
  const we = w[n - 1];
  const w0 = w[0];
  return `M${PT(left[0])}${crSegs(left, 0.4)}A${fx(we)} ${fx(we)} 0 0 0 ${PT(right[0])}${crSegs(right, 0.4)}A${fx(w0)} ${fx(w0)} 0 0 0 ${PT(left[0])}Z`;
}

/** The part of circle b that lies outside circle c, as one open curve (the bun's line: never a line inside the head). */
function outsideArc(b: Pt, br: number, c: Pt, cr: number): string {
  const n = 48;
  const pts: Pt[] = [];
  const out: boolean[] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const p: Pt = [b[0] + Math.cos(a) * br, b[1] + Math.sin(a) * br];
    pts.push(p);
    out.push(Math.hypot(p[0] - c[0], p[1] - c[1]) > cr * 0.99);
  }
  const s0 = out.indexOf(false);
  if (s0 < 0) return crOpen([...pts, pts[0]]);
  let best: Pt[] = [];
  let cur: Pt[] = [];
  for (let k = 1; k <= n; k++) {
    const i = (s0 + k) % n;
    if (out[i]) cur.push(pts[i]);
    else {
      if (cur.length > best.length) best = cur;
      cur = [];
    }
  }
  if (cur.length > best.length) best = cur;
  return best.length >= 2 ? crOpen(best, 0.5) : '';
}

/** Two-bone IK: the knee (or elbow) between root and end with segment lengths a, b, bending toward `dir` (-1 = the
 *  joint points screen-left, i.e. forward for a figure facing left). */
function ik(root: Pt, end: Pt, a: number, b: number, dir: -1 | 1 = -1): Pt {
  const dx = end[0] - root[0];
  const dy = end[1] - root[1];
  const D = Math.min(Math.hypot(dx, dy), a + b - 1e-3);
  const cosA = Math.max(-1, Math.min(1, (a * a + D * D - b * b) / (2 * a * D)));
  const base = Math.atan2(dy, dx);
  const ang = base + (dir < 0 ? 1 : -1) * Math.acos(cosA);
  return [root[0] + a * Math.cos(ang), root[1] + a * Math.sin(ang)];
}

// ---------------------------------------------------------------- the walk

/** One leg's gait at step count `step` (1 step = one foot forward; contact poses at x.5, passing at whole numbers).
 *  The NEAR leg leads on even x.5 (0.5, 2.5, ...), the far leg on odd x.5 (1.5, 3.5, ...): pass `step + 1` for it.
 *  f = forward offset of the foot from the hip (px, + = forward = screen left), lift = swing lift (px), heel / toe =
 *  foot rotation (deg): heel up at push-off, toe up at heel strike. */
export type LegGait = {f: number; lift: number; heel: number; toe: number};
export function legGait(step: number, d: number, liftMax: number): LegGait {
  const p = ((step % 2) + 2) % 2;
  if (p >= 0.5 && p < 1.5) {
    // stance: the foot planted, moving back under the hip at the walking speed
    const u = p - 0.5;
    return {f: d * (1 - 2 * u), lift: 0, heel: u > 0.62 ? 26 * Math.pow((u - 0.62) / 0.38, 1.4) : 0, toe: u < 0.2 ? 12 * (1 - u / 0.2) : 0};
  }
  // swing: toe-off, the knee forward, the foot passing, reaching for the heel strike
  const u = p >= 1.5 ? p - 1.5 : p + 0.5;
  return {
    f: -d + 2 * d * smooth(u),
    lift: liftMax * Math.sin(Math.PI * Math.min(1, u * 1.08)),
    heel: u < 0.32 ? 26 * (1 - u / 0.32) : 0,
    toe: u > 0.78 ? 12 * ((u - 0.78) / 0.22) : 0,
  };
}

/** Half the distance between the feet at a contact pose for a figure of height h with stride factor k: 27 px between
 *  the feet at 170 px (STYLE / brief: a visible ~25-30 px scissor). Her stroll step is 23.8 px (map), so the planted
 *  foot slips ~0.1 px per frame: invisible, and the scissor reads at 216 px. */
export const STRIDE_HALF_PX = 13.5;

// ---------------------------------------------------------------- the model

export type FigKind = 'her' | 'ghost' | 'outline';
export type FigSpec = {
  kind: FigKind;
  /** Coat, collar, sleeves (undefined = no fill: the bare outline). */
  coat?: string;
  head?: string;
  legs?: string;
  shoes?: string;
  /** Her cheek crescent when she looks back (skin, no features). */
  skin?: string;
  /** G4+: a scarf in this colour (a band at the neck, one end thrown back over the right shoulder). */
  scarf?: string;
  /** 0..1: a slightly softer back (rounder shoulders), G4+; never a stoop. */
  soft?: number;
  /** Her cream tote on the right shoulder. */
  tote?: string;
  /** Her potted desk plant tucked under her left arm (pot, leaves). */
  plant?: {pot: string; leaf: string};
};
export type FigPose = {
  /** Step count (s1Step: the row's ONE lockstep number). */
  step: number;
  /** Stride factor (1 = 27 px between the feet at 170 px; G4 0.9, G5-G6 0.78). */
  stride?: number;
  /** 0..1 her head turning back over her right shoulder (5.59). */
  turn?: number;
};

export type FigPart = {
  k: string;
  d?: string;
  fill?: string;
  ink?: string;
  /** Ink width multiplier. */
  w?: number;
  /** No misregistration (the bun over the head, tiny details). */
  exact?: boolean;
  /** Taper the stroke ends (her long open strokes). */
  taper?: boolean;
};

const R = 0.102 * FIG_H; // head radius 17.3
/** The torso's width factor: shoulders 0.225 H (38.3 px at 170; with the 2.2 px ink, anti-aliasing and the small fill
 *  offset the drawn silhouette is ~43 px = 0.25 H, the brief's "0.24-0.26 x h"), so the row's measured gaps are >= ~16 px
 *  on the straight (rowgaps.py on RowOnly) and the bend's far end keeps a visible gap. */
const WK = 0.9;
const X = (v: number) => v * WK;

/** The figure's parts, back to front, in local px (feet line y 0, the hips' centre x 0, facing LEFT). */
export function figParts(spec: FigSpec, pose: FigPose): FigPart[] {
  const out: FigPart[] = [];
  const st = pose.stride ?? 1;
  const d = STRIDE_HALF_PX * st;
  const liftMax = 7.4 * Math.sqrt(st);
  const turn = Math.max(0, Math.min(1, pose.turn ?? 0));
  const closed = spec.kind !== 'her';
  const soft = spec.soft ?? 0;

  // ---- gait: both legs, the bob, the spread
  const gN = legGait(pose.step, d, liftMax);
  const gF = legGait(pose.step + 1, d, liftMax);
  const spread = Math.min(1, Math.abs(gN.f - gF.f) / (2 * Math.max(1e-3, d))); // 1 at contact, 0 passing
  const bob = -2.1 * Math.abs(Math.cos(Math.PI * pose.step)) * Math.sqrt(st);
  const sY = -FIG_H + 2 * R + 6.8 + bob; // shoulder line (the head top stays at -FIG_H)
  const bY = -97.5 + bob * 0.85; // belt
  const hY = -43 + bob * 0.5; // hem: below the knee, so the legs walk clearly under it
  const hipY = -85 + bob;
  const lat = 2.4 * (1 - spread); // legs apart sideways only at passing (both contact poses are symmetric)

  // ---- legs (far first), shoes under the trouser legs
  const leg = (g: LegGait, side: 1 | -1, key: string) => {
    const hip: Pt = [side * lat, hipY];
    const gx = side * lat * 0.6 - g.f;
    const gy = -g.lift - 0.12 * g.f; // the forward foot a touch higher: further away
    const heelPt: Pt = [gx + 4.8, gy];
    const toePt: Pt = [gx - 8.6, gy];
    const shoeFlat: Pt[] = [
      [gx + 4.8, gy],
      [gx + 5.5, gy - 3.0],
      [gx + 3.0, gy - 6.6],
      [gx - 2.8, gy - 6.1],
      [gx - 7.4, gy - 3.5],
      [gx - 9.3, gy - 1.3],
      [gx - 8.0, gy],
    ];
    let shoe = shoeFlat;
    let ankle: Pt = [gx - 0.4, gy - 4.8];
    if (g.heel > 0) {
      shoe = shoeFlat.map((p) => rotP(p, toePt, deg(g.heel)));
      ankle = rotP(ankle, toePt, deg(g.heel));
    } else if (g.toe > 0) {
      shoe = shoeFlat.map((p) => rotP(p, heelPt, -deg(g.toe)));
      ankle = rotP(ankle, heelPt, -deg(g.toe));
    }
    const knee = ik(hip, ankle, 42, 39.6, -1);
    const shoeD = crClosed(shoe, 0.42);
    out.push({k: `shoe${key}`, d: shoeD, fill: spec.shoes, ink: shoeD, w: 0.8, exact: true});
    const legD = limb([hip, knee, ankle], [6.6, 5.5, 4.5]);
    out.push({k: `leg${key}`, d: legD, fill: spec.legs, ink: legD, w: 0.9});
  };
  leg(gF, 1, 'F');
  leg(gN, -1, 'N');

  // ---- arms (rear 3/4, from behind). The near (left) sleeve hangs at the side over the coat and swings mostly IN
  // DEPTH: on its forward and back swings the cuff rises a little (foreshortened) and on the back swing it moves in
  // over the back, so the silhouette never widens past the shoulder line (the row's gaps: STYLE / brief "0.24-0.26 h").
  // The far (right) arm is hidden by the back: a seam line inside the coat's right side swings with it.
  const ampA = 0.6 + 0.4 * st; // a shorter stride swings less
  const sgN = gF.f / Math.max(1e-3, d); // the near arm swings with the FAR leg: +1 forward, -1 back
  const sgF = gN.f / Math.max(1e-3, d);
  const nearArm = (): FigPart[] => {
    const P: Pt = [X(-15.6), sY + 6.2];
    const back = Math.max(0, -sgN) * ampA;
    const fwd = Math.max(0, sgN) * ampA;
    const C: Pt = [P[0] - 0.2 + 2.8 * back - 0.25 * fwd, P[1] + 46 - 2.6 * (back + fwd)];
    const E: Pt = [P[0] + (C[0] - P[0]) * 0.5 + 0.7 * fwd - 0.5 * back, P[1] + (C[1] - P[1]) * 0.52];
    const dd = limb([P, E, C], [X(5.7), X(5.2), X(5.3)]);
    const L = Math.hypot(C[0] - E[0], C[1] - E[1]) || 1;
    const ux = (C[0] - E[0]) / L;
    const uy = (C[1] - E[1]) / L;
    const c0: Pt = [C[0] - ux * 4.4, C[1] - uy * 4.4];
    return [
      {k: 'armN', d: dd, fill: spec.coat, ink: dd},
      {k: 'cuffN', ink: `M${PT([c0[0] - uy * 5.4, c0[1] + ux * 5.4])}L${PT([c0[0] + uy * 5.4, c0[1] - ux * 5.4])}`, w: 0.6},
    ];
  };
  const farSeam: FigPart = {
    k: 'seamF',
    ink: `M${PT([X(14.6), sY + 9.5])}Q${PT([X(16.4) - 0.6 * sgF * ampA, sY + 30])} ${PT([X(16.9) - 1.4 * sgF * ampA, -79.5 + bob - 1.6 * Math.abs(sgF) * ampA])}`,
    w: 0.6,
  };

  // her tote hangs at the right hip from the right shoulder, over the coat's side (nothing walks behind her)
  let toteStraps: FigPart | null = null;
  let tote: FigPart | null = null;
  if (spec.tote) {
    const sw = deg(1.4 * Math.sin(Math.PI * pose.step));
    const piv: Pt = [16.5, sY + 1];
    const bag: Pt[] = [
      [12.4, -94.5],
      [30.2, -94.0],
      [32.0, -70.5],
      [11.2, -71.2],
    ].map((p) => rotP([p[0], p[1] + bob * 0.8], piv, sw));
    const bd = crClosed([bag[0], [21.3, bag[0][1] - 0.3], bag[1], [31.6, (bag[1][1] + bag[2][1]) / 2], bag[2], [21.6, bag[2][1] + 0.6], bag[3], [11.6, (bag[3][1] + bag[0][1]) / 2]], 0.2);
    tote = {k: 'tote', d: bd, fill: spec.tote, ink: bd, w: 0.85};
    const s1: Pt = rotP([15.2, -94.3 + bob * 0.8], piv, sw);
    const s2: Pt = rotP([27.0, -94.1 + bob * 0.8], piv, sw);
    toteStraps = {k: 'toteStraps', ink: `M${PT(s1)}Q${PT([13.0, sY + 14])} ${PT([12.6, sY + 0.6])}M${PT(s2)}Q${PT([21.5, sY + 12])} ${PT([17.4, sY + 1.4])}`, w: 0.8};
  }

  // ---- the coat: slim shoulders, a belted waist, a gently flared hem below the knee with a centre back vent; every
  // point inside +-0.127 H (the shoulder line) so neighbours keep their gap
  const flL = 0.2 + 0.95 * spread;
  const flR = 0.1 + 0.45 * spread;
  const yL = -1.2 * spread;
  const yR = -0.7 * spread;
  const left: Pt[] = [
    [X(-9.6), sY - 1.4],
    [X(-16.8 + soft * 0.8), sY + 0.4 + soft * 1.6],
    [X(-20.6 + soft * 0.3), sY + 5.4 + soft * 2.6],
    [X(-21.25), sY + 13],
    [X(-20.5), sY + 24],
    [X(-18.0), bY],
    [X(-18.9), bY + 15],
    [X(-19.3), hY - 15],
    [X(-19.3 - flL), hY + yL],
  ];
  const right: Pt[] = left.map(([x, y], i): Pt => (i === left.length - 1 ? [X(19.3 + flR), hY + yR] : [-x, y]));
  const vx = 2.2;
  const vo = 0.5 + 2.6 * spread;
  const vn = 2.4 + 6.6 * spread;
  const hem: Pt[] = [
    [X(-10.5), hY + 1.7],
    [vx - vo, hY + 2.1],
    [vx, hY + 2.1 - vn],
    [vx + vo, hY + 2.1],
    [X(11.5), hY + 1.6],
  ];
  const rightUp = [...right].reverse();
  const coatD = `M${PT(left[0])}${crSegs(left, 0.5)}${hem.map((p) => `L${PT(p)}`).join('')}L${PT(rightUp[0])}${crSegs(rightUp, 0.5)}Z`;
  let coatInk: string;
  if (closed) coatInk = coatD;
  else {
    // her: the house hand, open in places (the right shoulder top and the hem corners)
    const leftInk = crOpen(left.slice(1), 0.5);
    const hemInk = `M${PT([left[left.length - 1][0] + 2.2, left[left.length - 1][1] + 0.6])}${hem.map((p) => `L${PT(p)}`).join('')}L${PT([rightUp[0][0] - 2.4, rightUp[0][1] + 0.4])}`;
    const rightInk = crOpen(rightUp.slice(0, rightUp.length - 2), 0.5);
    coatInk = leftInk + hemInk + rightInk;
  }
  out.push({k: 'coat', d: coatD, fill: spec.coat, ink: coatInk, taper: !closed});
  out.push(farSeam);
  if (tote) out.push(tote);
  // the vent's slit above the notch, the belt (two edges, a knot and two tails at the back)
  out.push({k: 'vent', ink: `M${PT([vx, hY + 2.1 - vn])}L${PT([vx + 0.3, hY - 17])}`, w: 0.62});
  const belt = `M${PT([X(-18.1), bY - 2.6])}Q${PT([0, bY - 1.2])} ${PT([X(18.1), bY - 2.6])}M${PT([X(-18.3), bY + 2.7])}Q${PT([0, bY + 4.1])} ${PT([X(18.3), bY + 2.7])}`;
  out.push({k: 'belt', ink: belt, w: 0.62});
  const kx = vx + 1.0;
  const ky = bY + 0.9;
  const t1 = polyPath([
    [kx - 1.2, ky + 1.4],
    [kx + 1.0, ky + 1.8],
    [kx - 1.4, ky + 10.5],
    [kx - 3.7, ky + 9.9],
  ]);
  const t2 = polyPath([
    [kx + 0.5, ky + 1.8],
    [kx + 2.7, ky + 1.3],
    [kx + 6.0, ky + 9.4],
    [kx + 3.9, ky + 10.2],
  ]);
  out.push({k: 'tail1', d: t1, fill: spec.coat, ink: t1, w: 0.58});
  out.push({k: 'tail2', d: t2, fill: spec.coat, ink: t2, w: 0.58});
  const knot = ellipsePath(kx, ky, 2.9, 2.5);
  out.push({k: 'knot', d: knot, fill: spec.coat, ink: knot, w: 0.6});

  // ---- the near arm: swinging (ghosts, outlines) or carrying her desk plant against her left hip
  if (spec.plant) {
    // the left arm hangs a little forward to cradle the pot; pot and leaves sit in front of the sleeve ("she cleared
    // her desk"), compact: the leaves stay within ~4 px of her shoulder line, so G1's gap stays ~15 px
    const pb = bob * 0.6;
    const piv: Pt = [X(-15.6), sY + 6.0];
    const elbow: Pt = [X(-17.0), -96.0 + pb];
    const cuff: Pt = [X(-18.8), -81.5 + pb];
    const ad = limb([piv, elbow, cuff], [X(5.7), X(5.2), X(5.2)]);
    out.push({k: 'armN', d: ad, fill: spec.coat, ink: ad});
    const PX = 2.6; // the plant sits 2.6 px in from the first sheet: its leaves set G1's gap
    const pot = polyPath([
      [-24.2 + PX, -90.4 + pb],
      [-12.9 + PX, -90.4 + pb],
      [-14.2 + PX, -77.2 + pb],
      [-22.9 + PX, -77.2 + pb],
    ]);
    out.push({k: 'pot', d: pot, fill: spec.plant.pot, ink: pot, w: 0.8});
    const rim = polyPath([
      [-24.9 + PX, -93.4 + pb],
      [-12.2 + PX, -93.4 + pb],
      [-12.4 + PX, -90.2 + pb],
      [-24.7 + PX, -90.2 + pb],
    ]);
    out.push({k: 'potRim', d: rim, fill: spec.plant.pot, ink: rim, w: 0.75});
    const leafs: [number, number, number][] = [
      // four broad round-tipped leaves (a small desk plant, not a fern: the sage fill has to show inside the line)
      [-25.0 + PX, -106.5, 4.7],
      [-21.0 + PX, -117.0, 5.1],
      [-14.6 + PX, -118.0, 5.0],
      [-10.6 + PX, -107.0, 4.3],
    ];
    const base: Pt = [-18.6 + PX, -92.6 + pb];
    leafs.forEach(([tx, ty, hw], i) => {
      const tip: Pt = [tx + Math.sin(pose.step * 1.7 + i * 1.3) * 0.5, ty + pb];
      const mx = base[0] + (tip[0] - base[0]) * 0.6;
      const my = base[1] + (tip[1] - base[1]) * 0.6;
      const L = Math.hypot(tip[0] - base[0], tip[1] - base[1]) || 1;
      const nx = -(tip[1] - base[1]) / L;
      const ny = (tip[0] - base[0]) / L;
      const ld = crClosed([base, [mx + nx * hw, my + ny * hw], tip, [mx - nx * hw, my - ny * hw]], 0.55);
      out.push({k: `leaf${i}`, d: ld, fill: spec.plant!.leaf, ink: ld, w: 0.42});
      out.push({k: `vein${i}`, ink: `M${PT([base[0] + (tip[0] - base[0]) * 0.38, base[1] + (tip[1] - base[1]) * 0.38])}L${PT([base[0] + (tip[0] - base[0]) * 0.7, base[1] + (tip[1] - base[1]) * 0.7])}`, w: 0.3});
    });
  } else {
    out.push(...nearArm());
  }
  if (toteStraps) out.push(toteStraps);

  // ---- the turned-up collar at the nape (its tips stand out past the head's sides)
  const collar = crClosed(
    [
      [X(-15.4), sY + 2.4],
      [X(-16.4), sY - 4.0],
      [X(-15.8), sY - 8.8],
      [-6, sY - 6.6],
      [6, sY - 6.8],
      [X(16.4), sY - 8.6],
      [X(16.8), sY - 3.6],
      [X(15.8), sY + 2.4],
      [1.6, sY + 5.8],
    ],
    0.32,
  );
  out.push({k: 'collar', d: collar, fill: spec.coat, ink: collar, w: 0.9});

  // ---- G4+: the scarf over the collar, one end thrown back over the right shoulder
  if (spec.scarf) {
    const band = `M${PT([X(-16.6), sY - 6.4])}Q${PT([0, sY - 10.2])} ${PT([X(17.0), sY - 6.0])}L${PT([X(16.6), sY + 2.6])}Q${PT([1, sY + 5.6])} ${PT([X(-16.0), sY + 2.4])}Z`;
    const tail = polyPath([
      [5.2, sY + 1.0],
      [12.8, sY + 0.2],
      [15.4, sY + 23.8],
      [8.2, sY + 25.0],
    ]);
    out.push({k: 'scarfTail', d: tail, fill: spec.scarf, ink: tail, w: 0.75});
    out.push({k: 'scarfFringe', ink: `M${PT([9.6, sY + 25])}L${PT([9.4, sY + 28.4])}M${PT([12.0, sY + 24.6])}L${PT([12.2, sY + 28.0])}M${PT([14.3, sY + 24.2])}L${PT([14.8, sY + 27.4])}`, w: 0.55});
    out.push({k: 'scarfBand', d: band, fill: spec.scarf, ink: band, w: 0.8});
  }

  // ---- the head (the hair, from behind) and the low bun at the back of it
  const hc: Pt = [-4.5, sY - 6.8 - R];
  const headD = circlePath(hc[0], hc[1], R);
  out.push({k: 'head', d: headD, fill: spec.head, ink: closed ? ellipsePath(hc[0], hc[1], R, R) : penLoop(hc[0], hc[1], R, R, 'row/her/head', 14)});
  if (turn > 0.15 && spec.skin) {
    // looking back over her right shoulder: a skin crescent on the turned side (no features, ever)
    const span = 40 + 50 * Math.min(1, turn);
    const a0 = 10 - span / 2 + 25;
    const a1 = 10 + span / 2 + 25;
    const arc: Pt[] = [];
    for (let i = 0; i <= 10; i++) {
      const a = deg(a0 + ((a1 - a0) * i) / 10);
      arc.push([hc[0] + Math.cos(a) * R, hc[1] + Math.sin(a) * R]);
    }
    const inner: Pt = [hc[0] + R * (0.95 - 0.5 * Math.min(1, turn)), hc[1] + R * 0.25];
    out.push({k: 'cheek', d: crClosed([...arc, inner], 0.45), fill: spec.skin, exact: true});
  }
  // the low bun: big enough to read as a bun at 216 px (a clear second round on the head's lower back)
  const br = 0.56 * R;
  const bc: Pt = [hc[0] + R * (0.76 - 1.06 * turn), hc[1] + R * (0.62 + 0.04 * turn)];
  out.push({k: 'bun', d: circlePath(bc[0], bc[1], br), fill: spec.head, ink: outsideArc(bc, br, hc, R), exact: true});
  return out;
}

// ---------------------------------------------------------------- rendering

export type FigDrawProps = {
  parts: FigPart[];
  /** Ink px ON SCREEN (the depth ladder: 3.4 her, 2.2 the ghosts and outlines). */
  inkPx: number;
  /** Local -> screen scale (h / FIG_H). */
  scale: number;
  /** Pop: the outline draws from `at` over `inkDur`, every stroke at once (the ghosts' 0.10 s). */
  at?: number;
  inkDur?: number;
  /** The fills snap in at `fillAt` (default: already there). */
  fillAt?: number;
  /** Ink only, each part's line masked by the shapes in front of it (the bare outlines). */
  knockout?: boolean;
  /** Fill misregistration in SCREEN px (false = exact). */
  offset: [number, number] | false;
  seed: string;
  /** ONE moving pen (frame 0's draw-on, REVIEW_1 MUST 2): the parts draw one after another at one steady speed over
   *  `inkDur` (each part's strokes in sequence, its window its share of the ink length), a pen tip of this radius
   *  (x the line width) on the head. Without it: every part at once (the pops). */
  pen?: number;
  /** Line tone per fill colour (the subject's line in its FINAL colour's shade while its fill is still paper: her coat
   *  draws on in the teal's deep shade, at full contrast, before the flood colours it). */
  lineTone?: Record<string, string>;
};

/** Each part's [start, dur] inside a one-pen draw from `at` over `dur` (the window = its share of the ink length). */
function penWindows(parts: FigPart[], at: number, dur: number): Map<string, [number, number]> {
  const lens = parts.map((p) => (p.ink ? parseInk(p.ink).total : 0));
  const total = lens.reduce((a, b) => a + b, 0) || 1;
  const out = new Map<string, [number, number]>();
  let acc = 0;
  parts.forEach((p, i) => {
    out.set(p.k, [at + (dur * acc) / total, Math.max(1e-3, (dur * lens[i]) / total)]);
    acc += lens[i];
  });
  return out;
}

export const FigDraw: React.FC<FigDrawProps> = ({parts, inkPx, scale, at, inkDur = 0.1, fillAt, knockout, offset, seed, pen, lineTone}) => {
  const win = pen !== undefined && at !== undefined ? penWindows(parts, at, inkDur) : null;
  const uid = 'rk' + useId().replace(/[^a-zA-Z0-9]/g, '');
  const out: React.ReactNode[] = [];
  const defs: React.ReactNode[] = [];
  const off: [number, number] | false = offset === false ? false : [offset[0] / scale, offset[1] / scale];
  // each line is its own fill's deep shade (CRAFT §c: the object's own shade, never one near-black ink): a part with
  // no fill of its own (a seam, the bun's outer arc) takes the fill it sits on; the bare outlines take the paper's
  let lastFill: string = CM.ghostPaper;
  parts.forEach((p, i) => {
    const tone0 = p.fill ?? lastFill;
    const tone = lineTone?.[tone0] ?? tone0;
    if (p.fill) lastFill = p.fill;
    if (!knockout && p.d && p.fill) {
      out.push(<Fill key={`f${p.k}`} d={p.d} color={p.fill} at={fillAt} mode="snap" offset={p.exact || off === false ? false : off} seed={`${seed}/${p.k}`} />);
    }
    if (p.ink && inkPx > 0) {
      const ink = (
        <Ink
          key={`i${p.k}`}
          d={p.ink}
          width={(inkPx * (p.w ?? 1)) / scale}
          color={CM.ink}
          tone={knockout ? CM.ghostPaper : tone}
          at={win ? win.get(p.k)![0] : at}
          order={win ? 'seq' : 'all'}
          pace="free"
          dur={win ? win.get(p.k)![1] : inkDur}
          ease={win ? ease.linear : undefined}
          tip={win ? pen : undefined}
          taper={p.taper ?? false}
          vary={0.04}
          seed={`${seed}/${p.k}`}
        />
      );
      const front = knockout ? parts.slice(i + 1).filter((q) => q.d) : [];
      if (front.length) {
        const id = `${uid}m${i}`;
        defs.push(
          <mask key={id} id={id} maskUnits="userSpaceOnUse" x={-400} y={-400} width={800} height={800}>
            <rect x={-400} y={-400} width={800} height={800} fill="#fff" />
            {front.map((q) => (
              <path key={q.k} d={q.d} fill="#000" />
            ))}
          </mask>,
        );
        out.push(
          <g key={`g${p.k}`} mask={`url(#${id})`}>
            {ink}
          </g>,
        );
      } else out.push(ink);
    }
  });
  return (
    <>
      {defs.length ? <defs>{defs}</defs> : null}
      {out}
    </>
  );
};

// ---------------------------------------------------------------- one placed figure (geometry cached per drawing)

const GEO = new Map<string, FigPart[]>();
function cachedParts(key: string, build: () => FigPart[]): FigPart[] {
  let v = GEO.get(key);
  if (!v) {
    v = build();
    if (GEO.size > 4000) GEO.clear();
    GEO.set(key, v);
  }
  return v;
}

export type RowFigureProps = {
  spec: FigSpec;
  /** Feet (world px): x = the body centre, y = the sole line. */
  x: number;
  y: number;
  /** Standing height (px). */
  h: number;
  step: number;
  stride?: number;
  turn?: number;
  /** Ink px on screen. */
  inkPx: number;
  /** Pop: outline from `at` (0.10 s), fills 2 frames after the outline, a 4-frame scale settle as the fill lands. */
  at?: number;
  /** Ink only with hidden lines knocked out (O1-O3). */
  knockout?: boolean;
  /** Fill misregistration (screen px); false = exact. Default: misreg(h, seed, misregX). */
  offset?: [number, number] | false;
  /** Scale of the default misregistration's x part (the row's ghosts keep it small: their gaps are x). */
  misregX?: number;
  /** Frame 0's draw-on (instead of a pop): the fills are there (pale until the flood), the outline draws on from `at`
   *  over `dur`: every part at once, or with `tip` as ONE moving pen with a tip of that radius (x the line width). */
  draw?: {at: number; dur: number; tip?: number};
  /** FigDraw `lineTone` (frame 0: her coat's line in the teal's shade while the coat is paper). */
  lineTone?: Record<string, string>;
  seed: string;
  /** Inside a parent's ExitSync already. */
  noSync?: boolean;
};

export const POP = {outlineS: 0.1, fillDelayS: 2 / 60, settleS: 4 / 60, settleFrom: 1.06} as const;

export const RowFigure: React.FC<RowFigureProps> = ({spec, x, y, h, step, stride = 1, turn = 0, inkPx, at, knockout, offset, misregX = 1, draw, lineTone, seed, noSync}) => {
  const t = useTime();
  if (at !== undefined && t < at) return null;
  const sq = Math.round(step * 100) / 100;
  const tq = Math.round(turn * 50) / 50;
  const key = JSON.stringify([spec, sq, stride, tq]);
  const parts = cachedParts(key, () => figParts(spec, {step: sq, stride, turn: tq}));
  const fillAt = at === undefined ? undefined : at + POP.outlineS + POP.fillDelayS;
  let s = h / FIG_H;
  if (fillAt !== undefined && t >= fillAt) {
    const k = Math.min(1, (t - fillAt) / POP.settleS);
    s *= 1 + (POP.settleFrom - 1) * (1 - k) * (1 - k);
  }
  const off = offset ?? misreg(h, seed, misregX);
  const g = (
    <XG m={mat.compose(mat.translate(x, y), mat.scale(s, s))}>
      <FigDraw parts={parts} inkPx={inkPx} scale={s} at={draw ? draw.at : at} inkDur={draw ? draw.dur : POP.outlineS} fillAt={fillAt} knockout={knockout} offset={off} seed={seed} pen={draw?.tip} lineTone={lineTone} />
    </XG>
  );
  return noSync ? g : <ExitSync seed={`fig/${seed}`}>{g}</ExitSync>;
};

/** Fill misregistration for a figure (screen px): 2-3 px at 170 px, one offset per figure (seeded, mixed directions). */
export function misreg(h: number, seed: string, kx = 1): [number, number] {
  const r = rng(`row/mis/${seed}`);
  const k = Math.max(0.5, Math.min(1.2, h / 170));
  return [(2.3 + r.jitter(0.5)) * k * kx * (r.chance(0.7) ? 1 : -1), (1.5 + r.jitter(0.4)) * k];
}
