// V2S1 helper (lane L1, our bank): the THINGS on our steps (TREATMENT section 5 "the bottom third"; STYLE section 5:
// 8+ specific items). Drawn NEW as K4 Parts (fill + ink per piece, misregistered per object), in WORLD px. Ink is
// CM.ink only (STYLE section 3): a bike frame, a pram's handle, a ring or a strap is an ink stroke; a thin coloured
// element (a guitar neck, a cup sleeve, a stripe, a saddle) is a thin FILL. Things lying on a tread are foreshortened
// (the lens looks down the steps), standing things are not.
import React from 'react';
import {CM} from '../palette';
import {capsule, circlePath, curve, ellipsePath, FigureG, Parts, polyline, type Part, type Pt} from '../kit/cast/parts';
import {cupParts} from './V2S1_steps_figs';

const f1 = (n: number) => (Math.round(n * 10) / 10).toString();
const P = (x: number, y: number) => `${f1(x)} ${f1(y)}`;
/** Foreshortening of things lying flat on a tread. */
const FLAT = 0.42;

/** Render a list of world-space parts as one object (one misregistration, one un-build window). */
export const Prop: React.FC<{parts: Part[]; ink: number; seed: string; off?: [number, number] | false}> = ({parts, ink, seed, off}) => (
  <FigureG x={0} y={0} seed={seed}>
    <Parts parts={parts} inkPx={ink} offset={off === undefined ? [1.6 + (seed.length % 3) * 0.5, 1.1 - (seed.length % 2) * 1.8] : off} seed={seed} />
  </FigureG>
);

const rot = (c: Pt, a: number) => (p: Pt): Pt => {
  const s = Math.sin((a * Math.PI) / 180);
  const k = Math.cos((a * Math.PI) / 180);
  const dx = p[0] - c[0];
  const dy = (p[1] - c[1]) / FLAT;
  return [c[0] + dx * k - dy * s, c[1] + (dx * s + dy * k) * FLAT];
};

/** A takeaway cup standing on a tread (base centre x, y; height in px). */
export const cup = (k: string, x: number, y: number, ch: number): Part[] => cupParts(k, x, y, ch, true, ch >= 14);

/** A tote bag set down on the tread, slumped a little, its handles up. */
export function tote(k: string, x: number, y: number, s: number, color: string, slump = 0.08): Part[] {
  const w = 36 * s;
  const h = 34 * s;
  const d = curve([[x - w * 0.5, y], [x - w * 0.46, y - h * 0.55], [x - w * 0.4 + w * slump, y - h], [x + w * 0.42 + w * slump, y - h * 0.96], [x + w * 0.5, y - h * 0.5], [x + w * 0.52, y]], true, 0.25);
  const handle = `M${P(x - w * 0.22 + w * slump, y - h * 0.98)}Q${P(x + w * 0.02 + w * slump, y - h - 24 * s)} ${P(x + w * 0.26 + w * slump, y - h * 0.97)}`;
  return [
    {k: `${k}b`, d, fill: color, ink: d, w: 0.85},
    {k: `${k}h`, ink: handle, w: 0.8},
  ];
}

/** A backpack standing on the tread (a rounded box, its flap and a top loop). */
export function backpack(k: string, x: number, y: number, s: number, color: string, flap = CM.coatOat): Part[] {
  const w = 34 * s;
  const h = 38 * s;
  const d = curve([[x - w * 0.5, y], [x - w * 0.52, y - h * 0.7], [x - w * 0.3, y - h], [x + w * 0.3, y - h], [x + w * 0.52, y - h * 0.7], [x + w * 0.5, y]], true, 0.3);
  const fl = curve([[x - w * 0.42, y - h * 0.78], [x - w * 0.25, y - h * 0.98], [x + w * 0.25, y - h * 0.98], [x + w * 0.42, y - h * 0.78], [x, y - h * 0.62]], true, 0.4);
  const pocket = polyline([[x - w * 0.28, y - h * 0.36], [x + w * 0.28, y - h * 0.36], [x + w * 0.26, y - h * 0.08], [x - w * 0.26, y - h * 0.08]], true);
  return [
    {k: `${k}p`, d, fill: color, ink: d, w: 0.9},
    {k: `${k}f`, d: fl, fill: flap, ink: fl, w: 0.75},
    {k: `${k}k`, d: pocket, fill: color, ink: pocket, w: 0.65},
    {k: `${k}l`, ink: `M${P(x - w * 0.12, y - h * 0.99)}Q${P(x, y - h - 10 * s)} ${P(x + w * 0.12, y - h * 0.99)}`, w: 0.75},
  ];
}

/** A book lying open on the tread (two pages, a cover edge). */
export function bookOpen(k: string, x: number, y: number, s: number, cover: string, a = -8): Part[] {
  const R = rot([x, y], a);
  const w = 26 * s;
  const h = 30 * s;
  const cov = polyline(([[x - w - 2 * s, y - h / 2 - 2 * s], [x + w + 2 * s, y - h / 2 - 2 * s], [x + w + 2 * s, y + h / 2 + 2 * s], [x - w - 2 * s, y + h / 2 + 2 * s]] as Pt[]).map(R), true);
  const pl = polyline(([[x - w, y - h / 2 + 1 * s], [x - 1 * s, y - h / 2 + 3 * s], [x - 1 * s, y + h / 2], [x - w, y + h / 2 - 1 * s]] as Pt[]).map(R), true);
  const pr = polyline(([[x + 1 * s, y - h / 2 + 3 * s], [x + w, y - h / 2 + 1 * s], [x + w, y + h / 2 - 1 * s], [x + 1 * s, y + h / 2]] as Pt[]).map(R), true);
  return [
    {k: `${k}c`, d: cov, fill: cover, ink: cov, w: 0.7},
    {k: `${k}l`, d: pl, fill: CM.paper, ink: pl, w: 0.6},
    {k: `${k}r`, d: pr, fill: CM.paper, ink: pr, w: 0.6},
  ];
}

/** A jacket taken off and laid on the tread (body + one sleeve thrown out). */
export function jacket(k: string, x: number, y: number, s: number, color: string, a = 10): Part[] {
  const R = rot([x, y], a);
  const body = curve(([[x - 34 * s, y - 20 * s], [x + 26 * s, y - 24 * s], [x + 36 * s, y + 14 * s], [x - 30 * s, y + 20 * s]] as Pt[]).map(R), true, 0.35);
  const sl = curve(([[x + 22 * s, y - 18 * s], [x + 66 * s, y - 30 * s], [x + 72 * s, y - 14 * s], [x + 30 * s, y - 2 * s]] as Pt[]).map(R), true, 0.4);
  const col = ([[x - 10 * s, y - 22 * s], [x + 6 * s, y - 23 * s], [x + 2 * s, y - 8 * s]] as Pt[]).map(R);
  return [
    {k: `${k}s`, d: sl, fill: color, ink: sl, w: 0.75},
    {k: `${k}b`, d: body, fill: color, ink: body, w: 0.85},
    {k: `${k}c`, d: polyline(col, true), fill: CM.coatOat, exact: true},
  ];
}

/** A striped picnic cloth on the tread (a perspective quad: near edge y1, far edge y0), its stripes as fills. */
export function cloth(k: string, x0: number, x1: number, y0: number, y1: number, cols: [string, string, string] = [CM.paper, CM.box, CM.sage]): Part[] {
  const skew = 10;
  const q: Pt[] = [[x0 + skew, y0], [x1 + skew * 0.4, y0 + 2], [x1, y1], [x0 - skew * 0.6, y1 + 3]];
  const d = polyline(q, true);
  const out: Part[] = [{k: `${k}c`, d, fill: cols[0], ink: d, w: 0.75}];
  const n = 7;
  const lerp = (a: Pt, b: Pt, u: number): Pt => [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u];
  for (let i = 0; i < n; i++) {
    if (i % 2) continue;
    const u0 = (i + 0.18) / n;
    const u1 = (i + 0.82) / n;
    const s = polyline([lerp(q[0], q[1], u0), lerp(q[0], q[1], u1), lerp(q[3], q[2], u1), lerp(q[3], q[2], u0)], true);
    out.push({k: `${k}s${i}`, d: s, fill: i % 4 === 0 ? cols[1] : cols[2], exact: true});
  }
  // a cross band (a check, not a flag)
  const v0 = 0.42;
  const v1 = 0.6;
  out.push({k: `${k}x`, d: polyline([lerp(q[0], q[3], v0), lerp(q[1], q[2], v0), lerp(q[1], q[2], v1), lerp(q[0], q[3], v1)], true), fill: cols[1], exact: true});
  return out;
}

/** A vacuum flask standing (a cylinder with a cup cap). */
export function flask(k: string, x: number, y: number, h: number, color = CM.coatSlate): Part[] {
  const w = h * 0.34;
  const body = polyline([[x - w / 2, y - h * 0.82], [x + w / 2, y - h * 0.82], [x + w / 2, y], [x - w / 2, y]], true);
  const cap = polyline([[x - w * 0.56, y - h], [x + w * 0.56, y - h], [x + w * 0.52, y - h * 0.8], [x - w * 0.52, y - h * 0.8]], true);
  return [
    {k: `${k}b`, d: body, fill: color, ink: body, w: 0.75},
    {k: `${k}c`, d: cap, fill: CM.anchor, ink: cap, w: 0.7},
    {k: `${k}r`, d: polyline([[x - w / 2, y - h * 0.34], [x + w / 2, y - h * 0.34], [x + w / 2, y - h * 0.26], [x - w / 2, y - h * 0.26]], true), fill: CM.paper, exact: true},
  ];
}

/** A paper bag (folded top) and an apple beside it: the picnic. */
export function paperBag(k: string, x: number, y: number, h: number): Part[] {
  const w = h * 0.62;
  const d = polyline([[x - w / 2, y - h], [x + w / 2, y - h * 0.96], [x + w * 0.54, y], [x - w * 0.52, y]], true);
  const fold = polyline([[x - w / 2, y - h], [x + w / 2, y - h * 0.96], [x + w * 0.5, y - h * 0.8], [x - w * 0.5, y - h * 0.83]], true);
  return [
    {k: `${k}b`, d, fill: CM.coatOat, ink: d, w: 0.75},
    {k: `${k}f`, d: fold, fill: CM.leafGold, ink: undefined, exact: true},
  ];
}
export function apple(k: string, x: number, y: number, r: number): Part[] {
  const d = circlePath(x, y - r, r);
  return [
    {k: `${k}a`, d, fill: CM.brick, ink: d, w: 0.7},
    {k: `${k}l`, d: ellipsePath(x + r * 0.5, y - r * 2.05, r * 0.42, r * 0.2), fill: CM.sage, exact: true},
  ];
}

/** A guitar case lying on the tread (a pear: body + neck end), its handle and two latches. */
export function guitarCase(k: string, x: number, y: number, L: number, color = CM.coatPlum, a = -6): Part[] {
  const R = rot([x, y], a);
  const b = L * 0.21;
  const pts: Pt[] = [
    [x - L * 0.5, y - L * 0.06],
    [x - L * 0.1, y - L * 0.085],
    [x + L * 0.08, y - b * 0.85],
    [x + L * 0.3, y - b],
    [x + L * 0.5, y - b * 0.55],
    [x + L * 0.52, y + b * 0.35],
    [x + L * 0.3, y + b * 0.8],
    [x + L * 0.08, y + b * 0.65],
    [x - L * 0.1, y + L * 0.075],
    [x - L * 0.5, y + L * 0.05],
  ];
  const d = curve(pts.map(R), true, 0.4);
  const handle = `M${P(...R([x + L * 0.02, y - b * 0.3]))}Q${P(...R([x + L * 0.09, y - b * 0.95]))} ${P(...R([x + L * 0.16, y - b * 0.35]))}`;
  const latch = (u: number, v: number) => polyline(([[x + L * u - L * 0.015, y + v - L * 0.012], [x + L * u + L * 0.015, y + v - L * 0.012], [x + L * u + L * 0.015, y + v + L * 0.012], [x + L * u - L * 0.015, y + v + L * 0.012]] as Pt[]).map(R), true);
  return [
    {k: `${k}c`, d, fill: color, ink: d, w: 0.9},
    {k: `${k}h`, ink: handle, w: 0.85},
    {k: `${k}l1`, d: latch(0.42, b * 0.3), fill: CM.leafGold, exact: true},
    {k: `${k}l2`, d: latch(-0.35, 0), fill: CM.leafGold, exact: true},
  ];
}

/** A pram in profile (facing left, the handle at the right): hood, carrycot, wheels, handle; cut by the frame
 *  edge where the lane puts it. (x, y) = the ground under its middle; h = the hood top above the ground. */
export function pram(k: string, x: number, y: number, h: number, hood = CM.coatSlate, body = CM.coatOat): Part[] {
  const w = h * 0.95;
  const top = y - h;
  const cotTop = y - h * 0.62;
  const cotBot = y - h * 0.3;
  const cot = curve([[x - w * 0.48, cotTop], [x + w * 0.42, cotTop], [x + w * 0.4, cotBot - h * 0.03], [x + w * 0.2, cotBot], [x - w * 0.32, cotBot], [x - w * 0.5, cotTop + h * 0.12]], true, 0.35);
  const hd = curve([[x - w * 0.46, cotTop + 1], [x - w * 0.44, top + h * 0.18], [x - w * 0.18, top], [x + w * 0.06, top + h * 0.05], [x + w * 0.1, cotTop + 1]], true, 0.45);
  const ribs = `M${P(x - w * 0.36, top + h * 0.1)}Q${P(x - w * 0.24, top + h * 0.22)} ${P(x - w * 0.2, cotTop)}M${P(x - w * 0.12, top + h * 0.03)}Q${P(x - w * 0.04, top + h * 0.2)} ${P(x - w * 0.02, cotTop)}`;
  const wr = h * 0.15;
  const wheel = (cx: number) => `M${P(cx - wr, y - wr)}A${f1(wr)} ${f1(wr)} 0 1 0 ${P(cx + wr, y - wr)}A${f1(wr)} ${f1(wr)} 0 1 0 ${P(cx - wr + 0.8, y - wr - 0.6)}`;
  const chassis = `M${P(x - w * 0.3, cotBot)}L${P(x - w * 0.34, y - wr)}M${P(x + w * 0.22, cotBot)}L${P(x + w * 0.3, y - wr)}M${P(x + w * 0.4, cotTop + h * 0.04)}L${P(x + w * 0.72, top + h * 0.06)}`;
  const grip = polyline([[x + w * 0.66, top + h * 0.02], [x + w * 0.82, top + h * 0.06], [x + w * 0.8, top + h * 0.13], [x + w * 0.64, top + h * 0.09]], true);
  return [
    {k: `${k}w`, ink: wheel(x - w * 0.34) + wheel(x + w * 0.3) + chassis, w: 0.9},
    {k: `${k}c`, d: cot, fill: body, ink: cot, w: 0.9},
    {k: `${k}h`, d: hd, fill: hood, ink: hd, w: 0.9},
    {k: `${k}r`, ink: ribs, w: 0.6},
    {k: `${k}g`, d: grip, fill: CM.anchor, ink: grip, w: 0.7},
    {k: `${k}hub`, d: circlePath(x - w * 0.34, y - wr, wr * 0.22) + circlePath(x + w * 0.3, y - wr, wr * 0.22), fill: CM.stoneShade, exact: true},
  ];
}

/** A bicycle parked on its stand, in profile (ink-only frame, STYLE section 3): wheels, frame, bars, a saddle and a
 *  front basket (fills). (x, y) = the ground under the crank; R = wheel radius; dir 1 = front to the right. */
export function bike(k: string, x: number, y: number, R: number, dir: 1 | -1 = 1, basket = CM.coatOat, saddle = CM.anchor): Part[] {
  const fx = x + dir * R * 1.22;
  const bx = x - dir * R * 1.18;
  const wy = y - R;
  const crank: Pt = [x, wy + R * 0.05];
  const seat: Pt = [x - dir * R * 0.42, wy - R * 1.05];
  const head: Pt = [x + dir * R * 0.82, wy - R * 1.08];
  const bar: Pt = [x + dir * R * 0.72, wy - R * 1.42];
  const loop = (cx: number, rr: number) => `M${P(cx - rr, wy)}A${f1(rr)} ${f1(rr)} 0 1 0 ${P(cx + rr, wy)}A${f1(rr)} ${f1(rr)} 0 1 0 ${P(cx - rr + 1.2, wy - 1)}`;
  const spokes = (cx: number) => {
    let s = '';
    for (let i = 0; i < 6; i++) {
      const a = (i * Math.PI) / 6 + 0.3;
      s += `M${P(cx - Math.cos(a) * R * 0.86, wy - Math.sin(a) * R * 0.86)}L${P(cx + Math.cos(a) * R * 0.86, wy + Math.sin(a) * R * 0.86)}`;
    }
    return s;
  };
  const frame =
    `M${P(bx, wy)}L${P(crank[0], crank[1])}L${P(seat[0] + dir * R * 0.04, seat[1] + R * 0.1)}L${P(bx, wy)}` +
    `M${P(crank[0], crank[1])}L${P(head[0], head[1] + R * 0.18)}M${P(seat[0] + dir * R * 0.04, seat[1] + R * 0.12)}L${P(head[0], head[1])}` +
    `M${P(head[0], head[1] - R * 0.05)}L${P(fx, wy)}M${P(head[0], head[1])}L${P(bar[0], bar[1])}` +
    `M${P(bar[0] - dir * R * 0.22, bar[1] + R * 0.02)}Q${P(bar[0], bar[1] - R * 0.06)} ${P(bar[0] + dir * R * 0.2, bar[1] + R * 0.08)}` +
    `M${P(seat[0], seat[1] + R * 0.1)}L${P(seat[0] - dir * R * 0.05, seat[1] - R * 0.02)}` +
    // the stand, a pedal
    `M${P(x - dir * R * 0.3, wy + R * 0.02)}L${P(x - dir * R * 0.45, y + R * 0.02)}M${P(crank[0] - R * 0.2, crank[1] + R * 0.24)}L${P(crank[0] + R * 0.14, crank[1] + R * 0.24)}`;
  const sd = curve([[seat[0] - dir * R * 0.3, seat[1] - R * 0.02], [seat[0] + dir * R * 0.12, seat[1] - R * 0.1], [seat[0] + dir * R * 0.2, seat[1] - R * 0.02], [seat[0] - dir * R * 0.26, seat[1] + R * 0.05]], true, 0.4);
  const bk = polyline([[head[0] + dir * R * 0.06, head[1] - R * 0.02], [head[0] + dir * R * 0.62, head[1] - R * 0.04], [head[0] + dir * R * 0.56, head[1] + R * 0.42], [head[0] + dir * R * 0.1, head[1] + R * 0.42]], true);
  let weave = '';
  for (let i = 1; i < 3; i++) weave += `M${P(head[0] + dir * R * 0.08, head[1] + R * 0.14 * i)}L${P(head[0] + dir * R * 0.58, head[1] + R * 0.14 * i - R * 0.01)}`;
  const guard = (cx: number) => curve([[cx - dir * R * 1.0, wy - R * 0.22], [cx - dir * R * 0.6, wy - R * 0.95], [cx, wy - R * 1.12], [cx + dir * R * 0.55, wy - R * 0.98], [cx + dir * R * 0.5, wy - R * 0.9], [cx, wy - R * 1.03], [cx - dir * R * 0.56, wy - R * 0.86], [cx - dir * R * 0.92, wy - R * 0.16]], true, 0.4);
  return [
    {k: `${k}gb`, d: guard(bx), fill: CM.stoneShade, exact: true},
    {k: `${k}gf`, d: guard(fx), fill: CM.stoneShade, exact: true},
    {k: `${k}wh`, ink: loop(bx, R) + loop(fx, R) + loop(bx, R * 0.88) + loop(fx, R * 0.88), w: 1},
    {k: `${k}sp`, ink: spokes(bx) + spokes(fx), w: 0.32},
    {k: `${k}fr`, ink: frame, w: 1.05},
    {k: `${k}sa`, d: sd, fill: saddle, ink: sd, w: 0.7},
    {k: `${k}bk`, d: bk, fill: basket, ink: bk, w: 0.8},
    {k: `${k}bw`, ink: weave, w: 0.45},
    {k: `${k}hb`, d: circlePath(bx, wy, R * 0.07) + circlePath(fx, wy, R * 0.07) + circlePath(crank[0], crank[1], R * 0.1), fill: CM.anchor, exact: true},
  ];
}

/** A skateboard lying wheels-down on the tread (deck in perspective, the wheels peeking). */
export function skateboard(k: string, x: number, y: number, L: number, a = 4, deck = CM.brickDeep): Part[] {
  const R = rot([x, y], a);
  const w = L * 0.24;
  const d = curve(([[x - L / 2, y], [x - L * 0.42, y - w / 2], [x + L * 0.42, y - w / 2], [x + L / 2, y], [x + L * 0.42, y + w / 2], [x - L * 0.42, y + w / 2]] as Pt[]).map(R), true, 0.45);
  const wheels = ([[-0.33, -0.55], [-0.33, 0.55], [0.33, -0.55], [0.33, 0.55]] as Pt[]).map(([u, v]) => R([x + L * u, y + w * v])).map(([wx, wy]) => ellipsePath(wx, wy + 1, L * 0.045, L * 0.03)).join('');
  return [
    {k: `${k}w`, d: wheels, fill: CM.paper, ink: wheels, w: 0.55},
    {k: `${k}d`, d, fill: deck, ink: d, w: 0.85},
    {k: `${k}g`, d: curve(([[x - L * 0.36, y - w * 0.22], [x + L * 0.36, y - w * 0.22], [x + L * 0.36, y + w * 0.22], [x - L * 0.36, y + w * 0.22]] as Pt[]).map(R), true, 0.2), fill: CM.anchor, exact: true},
  ];
}

/** A folded umbrella lying on the tread (a slim tapered canopy, a J handle). */
export function umbrella(k: string, x: number, y: number, L: number, a = -10, color = CM.coatSlate): Part[] {
  const R = rot([x, y], a);
  const can = curve(([[x - L * 0.38, y], [x - L * 0.05, y - L * 0.07], [x + L * 0.34, y - L * 0.012], [x + L * 0.34, y + L * 0.012], [x - L * 0.05, y + L * 0.07]] as Pt[]).map(R), true, 0.35);
  const shaft = `M${P(...R([x - L * 0.38, y]))}L${P(...R([x - L * 0.5, y]))}`;
  const hook = `M${P(...R([x + L * 0.34, y]))}L${P(...R([x + L * 0.46, y]))}Q${P(...R([x + L * 0.56, y]))} ${P(...R([x + L * 0.54, y + L * 0.08]))}`;
  return [
    {k: `${k}c`, d: can, fill: color, ink: can, w: 0.8},
    {k: `${k}s`, ink: shaft + hook, w: 0.9},
  ];
}

/** A child's kick scooter lying on its side on the landing (deck, T-bar, two wheels). */
export function scooter(k: string, x: number, y: number, L: number, a = 0): Part[] {
  const R = rot([x, y], a);
  const deck = polyline(([[x - L * 0.42, y - L * 0.02], [x + L * 0.22, y - L * 0.02], [x + L * 0.22, y + L * 0.03], [x - L * 0.42, y + L * 0.03]] as Pt[]).map(R), true);
  const bar = `M${P(...R([x + L * 0.22, y]))}L${P(...R([x + L * 0.5, y - L * 0.06]))}M${P(...R([x + L * 0.47, y - L * 0.2]))}L${P(...R([x + L * 0.53, y + L * 0.1]))}`;
  const w1 = R([x - L * 0.42, y + L * 0.02]);
  const w2 = R([x + L * 0.26, y + L * 0.02]);
  const wh = ellipsePath(w1[0], w1[1], L * 0.07, L * 0.05) + ellipsePath(w2[0], w2[1], L * 0.07, L * 0.05);
  return [
    {k: `${k}d`, d: deck, fill: CM.box, ink: deck, w: 0.75},
    {k: `${k}b`, ink: bar, w: 0.85},
    {k: `${k}w`, d: wh, fill: CM.paper, ink: wh, w: 0.6},
  ];
}

/** A dog's water bowl (a squashed ring on the tread). */
export function bowl(k: string, x: number, y: number, r: number): Part[] {
  const d = ellipsePath(x, y, r, r * 0.42);
  return [
    {k: `${k}b`, d, fill: CM.coatSlate, ink: d, w: 0.7},
    {k: `${k}w`, d: ellipsePath(x, y - r * 0.05, r * 0.7, r * 0.26), fill: CM.water, exact: true},
  ];
}

/** A short lead lying in a loose coil (an ink-only thing). */
export function lead(k: string, x: number, y: number, s: number): Part[] {
  return [{k: `${k}l`, ink: `M${P(x, y)}C${P(x + 18 * s, y - 8 * s)} ${P(x + 30 * s, y + 6 * s)} ${P(x + 14 * s, y + 8 * s)}C${P(x, y + 9 * s)} ${P(x + 6 * s, y - 2 * s)} ${P(x + 26 * s, y - 2 * s)}`, w: 0.7}];
}

export {capsule};
