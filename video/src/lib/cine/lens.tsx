// cine/lens.tsx — LensFigure: the backlit back-view figure right at the lens (Arcane's signature shot: a head and
// shoulders silhouetted against the sun / a light field), drawn by hand rather than as a stock "user" icon: an irregular
// skull with hair clumps (or a bun / cap / hood / long hair), ONE ear showing on the turned side (the other a nub), a
// collar / hood ridge behind the neck, one shoulder lower than the other, a fill misregistered from its rim sliver, and
// 1-2 ink fold strokes. Fill-only otherwise (silhouettes carry no outline ink, style_bible_ref2 8).
//
//   <LensFigure x={300} y={1520} r={120} hair="short" turn={0.4} light="right" />     // head centre, head radius
//   <LensFigure x={860} y={1640} r={150} hair="cap" turn={-0.5} lean={-1} crop={1990} turns={[{t: 3.6, to: 0.2}]} />
//
// x, y = the head's centre (layer px), r = the head radius (shoulders reach ~2.9 r either side, the body runs down to
// `crop`, normally past the frame bottom). Light: `light` = which side the sun is on (the rim sliver sits inside the
// outline on that side and along the top). Life: a slow breath (`idle` px), head turns (`turns`). States: paper /
// before the cascade = white fill + ink outline (line art); un-build = it sinks into the frame bottom.

import React, {useId} from 'react';
import {palette, stroke} from '../theme';
import {ease as E, osc, prog} from '../time';
import type {Pt} from '../sketch';
import {rng} from '../rng';
import {r1} from './util';
import {deep} from './atmosphere';
import {exitScale, inkOn, isPaper, useCineState} from './state';

export type LensHair = 'short' | 'bun' | 'cap' | 'hood' | 'long';

export type LensFigureProps = {
  x: number;
  y: number;
  /** Head radius (px). Default 120. */
  r?: number;
  hair?: LensHair;
  /** Head turn -1 (left) .. 1 (right): shifts the skull, shows the ear on that side. Default 0.35. */
  turn?: number;
  /** Head turns over time: [{t, to}] (0.35 s out-cubic each). */
  turns?: {t: number; to: number}[];
  /** Which shoulder drops: 1 = the right one is lower, -1 = the left. Default 1. */
  lean?: number;
  /** Bottom of the body (crop line; put it past the frame bottom). Default y + 7 r. */
  crop?: number;
  /** Silhouette fill (default deep.teal78). */
  color?: string;
  /** Rim colour (default peach) and the sun's side. */
  rim?: string;
  light?: 'left' | 'right';
  /** Rim sliver width (px; default r * 0.055, >= 4). */
  rimW?: number;
  /** Ink fold strokes (collar fold + one crease). Default true. */
  folds?: boolean;
  /** Breathing bob amplitude (px). Default r * 0.02. */
  idle?: number;
  seed?: string;
};

type Geo = {outline: string; folds: string; hairInk: string};
const GEO = new Map<string, Geo>();

function headRadius(a: number, R: number, hair: LensHair, turn: number, ph: number[]): number {
  const t = (a * Math.PI) / 180;
  // an irregular, slightly egg-shaped skull (never a circle)
  let r = R * (1 + 0.03 * Math.sin(3 * t + ph[0]) + 0.017 * Math.sin(5 * t + ph[1]) + 0.01 * Math.sin(11 * t + ph[2]));
  r *= 1 + 0.06 * Math.pow(Math.sin(t), 2) * (Math.sin(t) < 0 ? 1 : 0.35);
  const up = Math.sin(t) < -0.15; // upper part of the head (y up)
  const angDist = (x: number, c: number) => ((x - c + 540) % 360) - 180;
  if (hair === 'short' || hair === 'bun') {
    // hair clumps: a few irregular tufts over the crown (not a ruffle all round), bigger toward the sun-side back
    const k = -Math.sin(t); // 1 at the top
    if (k > 0.25) r += R * (0.018 + 0.03 * Math.abs(Math.sin(2.5 * t + ph[3]))) * Math.pow(Math.abs(Math.sin(6 * t + ph[4])), 1.4) * Math.min(1, (k - 0.25) * 2.5);
  }
  if (hair === 'bun') {
    const d = angDist(a, 258 - turn * 10);
    if (Math.abs(d) < 20) r += R * 0.3 * Math.pow(Math.cos((d / 20) * (Math.PI / 2)), 0.8);
  }
  if (hair === 'cap') {
    // a flatter crown and a cap edge a touch wider than the skull, the button on top, the brim on the turned side
    if (up) r = r * (0.98 - 0.06 * Math.pow(Math.sin(t), 4)) + R * 0.05;
    const b = angDist(a, 270 + turn * 6);
    if (Math.abs(b) < 4) r += R * 0.06;
    const br = angDist(a, turn >= 0 ? 350 : 190);
    if (Math.abs(br) < 11 && Math.abs(turn) > 0.1) r += R * 0.45 * Math.min(1, Math.abs(turn) * 1.6) * Math.pow(Math.cos((br / 11) * (Math.PI / 2)), 0.5);
  }
  if (hair === 'hood') {
    r *= 1.2;
    const d = angDist(a, 262 - turn * 8);
    if (Math.abs(d) < 30) r += R * 0.12 * Math.cos((d / 30) * (Math.PI / 2));
  }
  if (hair === 'long') {
    if (up) r += R * 0.03 * Math.abs(Math.sin(7 * t + ph[3]));
    r *= 1.06;
  }
  // ears: the turned side shows a real ear, the other only a nub (never a symmetric pair)
  if (hair !== 'hood' && hair !== 'long') {
    const main = turn >= 0 ? 10 : 170;
    const d1 = angDist(a, main);
    if (Math.abs(d1) < 15) r += R * 0.19 * Math.pow(Math.cos((d1 / 15) * (Math.PI / 2)), 1.4);
    const d2 = angDist(a, turn >= 0 ? 172 : 8);
    if (Math.abs(d2) < 10) r += R * 0.06 * Math.cos((d2 / 10) * (Math.PI / 2));
  }
  return r;
}

function lensGeo(R: number, hair: LensHair, turn: number, lean: number, crop: number, seed: string): Geo {
  const key = `${Math.round(R)}|${hair}|${turn.toFixed(2)}|${lean}|${Math.round(crop)}|${seed}`;
  const hit = GEO.get(key);
  if (hit) return hit;
  const rr = rng(`lens/${seed}`);
  const ph = [0, 1, 2, 3, 4].map(() => rr.range(0, 6.28));
  // local frame: the head centre at (0, 0); the skull sits shifted toward the turn
  const hx = turn * R * 0.12;
  const hp = (a: number): Pt => {
    const r = headRadius(a, R, hair, turn, ph);
    const t = (a * Math.PI) / 180;
    return [hx + Math.cos(t) * r, Math.sin(t) * r];
  };
  const neckY = R * 0.92;
  const collarY = R * 1.36;
  const shY = R * 2.05;
  const SW = R * 2.4;
  const drop = R * 0.16 * lean; // + = the right shoulder is lower
  const yL = shY - drop / 2;
  const yR = shY + drop / 2;
  const pts: Pt[] = [];
  const q = (a: Pt, c: Pt, b: Pt, n: number) => {
    for (let i = 1; i <= n; i++) {
      const u = i / n;
      pts.push([(1 - u) * (1 - u) * a[0] + 2 * (1 - u) * u * c[0] + u * u * b[0], (1 - u) * (1 - u) * a[1] + 2 * (1 - u) * u * c[1] + u * u * b[1]]);
    }
  };
  // ONE closed outline, clockwise on screen: left side up, over the head, right side down
  // arms hang a touch wider than the deltoids (the body never ends in a vertical box edge)
  pts.push([-SW - R * 0.22, crop], [-SW - R * 0.08, yL + R * 1.6], [-SW, yL + R * 0.62]);
  // left deltoid (convex), then the trapezius sloping UP and in to the collar (concave)
  q([-SW, yL + R * 0.62], [-SW + R * 0.04, yL - R * 0.1], [-SW + R * 0.62, yL - R * 0.16], 8);
  const hood = hair === 'hood';
  const long = hair === 'long';
  if (hood) {
    q([-SW + R * 0.62, yL - R * 0.16], [-R * 1.35, collarY + R * 0.05], [-R * 1.18, R * 0.55], 10);
  } else {
    q([-SW + R * 0.62, yL - R * 0.16], [-R * 1.15, collarY + R * 0.18], [-R * 0.9, collarY - R * 0.02], 8);
    // collar ridge, then the neck (or the long hair falling over it: tips over the collar, then up the side)
    pts.push([-R * 0.84, collarY - R * 0.12]);
    if (long) pts.push([-R * 1.0, collarY + R * 0.22], [-R * 1.16, R * 1.1], [-R * 1.12, R * 0.62]);
    else pts.push([-R * 0.5 + hx * 0.4, collarY - R * 0.2], [-R * 0.44 + hx * 0.5, neckY]);
  }
  const a0 = hood ? 150 : long ? 162 : 118;
  const a1 = hood ? 390 : long ? 378 : 420;
  for (let a = a0; a <= a1; a += 3) pts.push(hp(a));
  if (hood) {
    q(pts[pts.length - 1], [R * 1.4, collarY + R * 0.02], [SW - R * 0.62, yR - R * 0.16], 10);
  } else {
    if (long) pts.push([R * 1.12, R * 0.66], [R * 1.18, R * 1.14], [R * 1.02, collarY + R * 0.26]);
    else pts.push([R * 0.46 + hx * 0.5, neckY + R * 0.02], [R * 0.52 + hx * 0.4, collarY - R * 0.18]);
    pts.push([R * 0.86, collarY - R * 0.1]);
    q([R * 0.86, collarY - R * 0.1], [R * 1.18, collarY + R * 0.2], [SW - R * 0.62, yR - R * 0.16], 8);
  }
  q([SW - R * 0.62, yR - R * 0.16], [SW - R * 0.04, yR - R * 0.1], [SW, yR + R * 0.62], 8);
  pts.push([SW + R * 0.08, yR + R * 1.6], [SW + R * 0.22, crop]);
  const outline = pts.map(([a, b], i) => `${i ? 'L' : 'M'}${r1(a)} ${r1(b)}`).join('') + 'Z';
  // folds: the collar's fold under the nape (overshooting the ridge) + one crease from the lower shoulder
  const cr = (dx: number) => r1(dx);
  // the collar fold: two broken strokes (one longer, overshooting the ridge), never a full necklace arc
  const s1 = lean >= 0 ? -1 : 1;
  const folds =
    `M${cr(s1 * R * 1.0)} ${cr(collarY - R * 0.04)}Q${cr(s1 * R * 0.55)} ${cr(collarY + R * 0.26)} ${cr(-s1 * R * 0.05)} ${cr(collarY + R * 0.24)}` +
    `M${cr(-s1 * R * 0.32)} ${cr(collarY + R * 0.2)}Q${cr(-s1 * R * 0.6)} ${cr(collarY + R * 0.16)} ${cr(-s1 * R * 0.78)} ${cr(collarY + R * 0.04)}` +
    (hair === 'hood' ? `M${cr(hx - R * 0.1)} ${cr(-R * 1.2)}Q${cr(hx + R * 0.12)} ${cr(-R * 0.2)} ${cr(hx * 0.4)} ${cr(R * 0.95)}` : '') +
    (hair === 'cap' ? `M${cr(hx - R * 0.98)} ${cr(R * 0.02)}Q${cr(hx)} ${cr(R * 0.16)} ${cr(hx + R * 0.98)} ${cr(R * 0.0)}M${cr(hx - R * 0.16)} ${cr(R * 0.1)}q${cr(R * 0.16)} ${cr(-R * 0.2)} ${cr(R * 0.32)} 0` : '') +
    (lean >= 0
      ? `M${cr(SW - R * 0.55)} ${cr(yR + R * 0.55)}Q${cr(SW - R * 1.0)} ${cr(yR + R * 1.4)} ${cr(SW - R * 1.55)} ${cr(yR + R * 1.95)}`
      : `M${cr(-SW + R * 0.55)} ${cr(yL + R * 0.55)}Q${cr(-SW + R * 1.0)} ${cr(yL + R * 1.4)} ${cr(-SW + R * 1.55)} ${cr(yL + R * 1.95)}`);
  // hair: two clump strokes from the crown whorl (short / bun / long)
  const crown: Pt = [hx + R * 0.15, -R * 0.55];
  const clump = (ang: number, len: number, bend: number) => {
    const t = (ang * Math.PI) / 180;
    const e: Pt = [crown[0] + Math.cos(t) * len, crown[1] + Math.sin(t) * len];
    const c: Pt = [(crown[0] + e[0]) / 2 - Math.sin(t) * bend, (crown[1] + e[1]) / 2 + Math.cos(t) * bend];
    return `M${r1(crown[0] + Math.cos(t) * R * 0.08)} ${r1(crown[1] + Math.sin(t) * R * 0.08)}Q${r1(c[0])} ${r1(c[1])} ${r1(e[0])} ${r1(e[1])}`;
  };
  // a crown whorl hook + ONE long strand sweeping down the back toward the nape (asymmetric: a symmetric pair of arcs
  // over the crown read as closed eyes on the paper version)
  const sd = turn >= 0 ? 1 : -1;
  const whorl = `M${r1(crown[0] - sd * R * 0.1)} ${r1(crown[1] + R * 0.02)}q${r1(sd * R * 0.12)} ${r1(-R * 0.14)} ${r1(sd * R * 0.22)} ${r1(R * 0.02)}`;
  const hairInk = hair === 'short' || hair === 'bun' || hair === 'long' ? whorl + clump(sd > 0 ? 118 : 62, R * 0.95, sd * R * 0.16) : '';
  const g = {outline, folds, hairInk};
  if (GEO.size > 120) GEO.clear();
  GEO.set(key, g);
  return g;
}

/** Head turn at time t from the keys (0.35 s out-cubic per change). */
function turnAt(t: number, base: number, keys?: {t: number; to: number}[]): number {
  let v = base;
  for (const k of keys ?? []) {
    if (t < k.t) break;
    v = v + (k.to - v) * E.outCubic(prog(t, k.t, 0.35));
  }
  return Math.round(v * 20) / 20; // quantised: the geometry cache stays small, a turn is a few clean steps
}

export const LensFigure: React.FC<LensFigureProps> = ({x, y, r = 120, hair = 'short', turn = 0.35, turns, lean = 1, crop, color = deep.teal78, rim = palette.peach, light = 'right', rimW, folds = true, idle, seed = 'lens'}) => {
  const S = useCineState();
  const id = 'lf' + useId().replace(/[^a-zA-Z0-9]/g, '');
  const bottom = crop ?? y + r * 7;
  const k = exitScale(S.e, 0.3, 0.45);
  if (k <= 0) return null;
  const tv = turnAt(S.t, turn, turns);
  const g = lensGeo(r, hair, tv, lean, bottom - y, seed);
  const bob = (idle ?? r * 0.02) * osc(S.t, 0.31, x * 0.01);
  const paper = isPaper(S, [x, y]) || S.look.fills !== 'color';
  const lead = light === 'right' ? 1 : -1;
  const w = rimW ?? Math.max(4, r * 0.055);
  const inkW = Math.max(stroke.inkBold, r * 0.03);
  const ink = inkOn(S, 0.3);
  const body = paper ? (
    <>
      {S.look.fills === 'none' ? null : <path d={g.outline} fill={palette.white} />}
      {ink ? <path d={g.outline + g.folds + g.hairInk} fill="none" stroke={palette.ink} strokeWidth={inkW} strokeLinejoin="round" strokeLinecap="round" /> : null}
    </>
  ) : (
    <>
      <defs>
        <clipPath id={id} clipPathUnits="userSpaceOnUse">
          <path d={g.outline} />
        </clipPath>
      </defs>
      {/* backlit: the rim colour fills the outline, the body is shifted away from the sun (and down a touch) inside the
          clip, so the rim shows as a sliver along the sun-facing side and the top only; the body is misregistered 3 px */}
      <g clipPath={`url(#${id})`}>
        <path d={g.outline} fill={rim} />
        <path d={g.outline} fill={color} transform={`translate(${r1(-lead * w)} ${r1(w * 0.7)})`} />
      </g>
      {ink && folds ? <path d={g.folds + g.hairInk} fill="none" stroke={palette.ink} strokeWidth={inkW * 0.8} strokeLinecap="round" /> : null}
    </>
  );
  const ty = y + bob;
  const tf = k < 1 ? `translate(${r1(x)} ${r1(bottom)}) scale(1 ${k.toFixed(4)}) translate(0 ${r1(ty - bottom)})` : `translate(${r1(x)} ${r1(ty)})`;
  return <g transform={tf}>{body}</g>;
};
