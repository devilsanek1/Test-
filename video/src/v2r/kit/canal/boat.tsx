// canal/boat.tsx: narrowboats. One side-view model at every size (a far moored boat ~120 px tall, S4's cabin side
// filling y 1290-1660): a slate hull with ONE plum gunwale stripe (never a whole plum hull: the anchor budget), a
// sage (or oat / brick / stone) cabin, cream portholes with curtains, a painted flower panel (no lettering), rope
// fenders, the tiller, a cratch at the bow, and the roof seen from a little above (topView): herb pots, a bike, a
// coiled rope, a watering can and the stove chimney with its smoke. The cafe boat adds a serving hatch, bunting and
// its stern deck (S8), and BoatWiper is S7's foreground wipe (a boat gliding right past the lens). Never teal.

import React, {useMemo} from 'react';
import {CM, INK_PX} from '../../palette';
import {useTime} from '../../../lib/time';
import {line, circle as circleInk, rect as rectInk} from '../../../lib/sketch';
import type {WiperProps} from '../../../lib/Film';
import {Batch, Paint, P, r1, rng, inkFor, ovalPath, domePath, lobes, leafPath, lerp, Pt} from './core';
import {bikeInto} from './towpath';
import {Puffs} from './life';

export type BoatOpts = {
  /** Screen x of the STERN end and the bow end follows `dir`: the boat spans [x, x + len] (dir +1: bow right). */
  x: number;
  /** Waterline y. */
  water: number;
  len: number;
  /** Cabin side height (gunwale top to roof edge), px. Hull and roof scale from it. */
  h: number;
  dir: 1 | -1;
  seed: string;
  cabin?: string;
  /** Roof surface seen from above (px tall; 0 = level view). */
  topView?: number;
  /** Roof dressing: herb pots, bike, rope, can (default true when topView > 0). */
  roofItems?: boolean;
  /** Stove chimney at this fraction from the stern (0..1; default 0.22). Its smoke is <BoatSmoke>. */
  chimney?: number;
  panel?: boolean;
  fenders?: boolean;
  /** Lit portholes (sunset). */
  lit?: boolean;
  /** Cafe boat: serving hatch + bunting. */
  cafe?: boolean;
  /** Ink scale (front boats 4.8, far 2.2...). Default by h. */
  ink?: number;
};

const CABINS = [CM.sage, CM.coatOat, CM.brickLight, CM.stoneShade];

/** Geometry helpers of a boat (screen px). */
export function boatGeom(o: BoatOpts) {
  const hullH = o.h * 0.3;
  const gunH = Math.max(3, o.h * 0.075);
  const roofH = Math.max(3, o.h * 0.07);
  const gunTop = o.water - hullH - gunH;
  const roofY = gunTop - o.h;
  const X = (u: number) => (o.dir > 0 ? o.x + u * o.len : o.x + o.len - u * o.len);
  // cabin spans from the stern deck to the bow well
  const c0 = 0.08;
  const c1 = 0.84;
  return {hullH, gunH, roofH, gunTop, roofY, X, c0, c1};
}

/** Draws a narrowboat into a batch (hull, stripe, cabin, windows, panel, roof, dressing). */
export function boatInto(b: Batch, o: BoatOpts, t = 0) {
  const r = rng(o.seed);
  const g = boatGeom(o);
  const {X} = g;
  const w = o.ink ?? inkFor(o.h * 2.4);
  const cabin = o.cabin ?? CABINS[Math.floor(r.next() * CABINS.length) % CABINS.length];
  const hullCol = CM.paneUnlit;
  const s = o.h / 100; // scale unit: 1 = a 100 px cabin side
  // ---- hull: the stern counter, the long side, the bow sweeping up to a point
  const bowLift = o.h * 0.42;
  const sternX = X(0);
  const bowX = X(1);
  const hullTop = g.gunTop + g.gunH;
  b.fill(hullCol, `M${P(sternX, o.water + 4)}L${P(sternX, hullTop)}L${P(X(0.86), hullTop)}Q${P(X(0.95), hullTop - bowLift * 0.3)} ${P(bowX, hullTop - bowLift)}L${P(X(0.985), o.water + 4)}Z`);
  // the gunwale stripe (plum anchor) following the sheer up to the bow
  b.fill(CM.anchor, `M${P(sternX - o.dir * 2, g.gunTop)}L${P(X(0.86), g.gunTop)}Q${P(X(0.95), g.gunTop - bowLift * 0.3)} ${P(bowX + o.dir * 3, g.gunTop - bowLift)}L${P(bowX, hullTop - bowLift + g.gunH * 0.4)}Q${P(X(0.95), hullTop - bowLift * 0.3)} ${P(X(0.86), hullTop)}L${P(sternX, hullTop)}Z`);
  // rubbing strake + a waterline lip
  b.rect(CM.shadeCool, Math.min(sternX, X(0.9)), o.water - g.hullH * 0.45, Math.abs(X(0.9) - sternX), Math.max(1.5, g.hullH * 0.07));
  b.rect(CM.waterDeep, Math.min(sternX, X(0.98)), o.water - 2, Math.abs(X(0.98) - sternX), 4);
  b.layer();
  // ---- cabin side
  const cx0 = X(g.c0);
  const cx1 = X(g.c1);
  const L = Math.min(cx0, cx1);
  const R = Math.max(cx0, cx1);
  b.rect(cabin, L, g.roofY, R - L, g.gunTop - g.roofY);
  // a thin painted coach line under the roof
  b.rect(CM.coatMustard, L + 4 * s, g.roofY + g.roofH + 4 * s, R - L - 8 * s, Math.max(1.4, 2.4 * s));
  // roof edge (overhanging a little) and the roof seen from above
  b.rect(CM.limestone, L - 3 * s, g.roofY - g.roofH, R - L + 6 * s, g.roofH + 1);
  if (o.topView && o.topView > 0) b.rect(CM.stucco, L - 3 * s, g.roofY - g.roofH - o.topView, R - L + 6 * s, o.topView);
  // the cratch at the bow well: a triangular board with a canvas cover
  const crA = X(g.c1);
  const crB = X(0.94);
  b.fill(CM.coatSlate, `M${P(crA, g.roofY + (g.gunTop - g.roofY) * 0.25)}L${P(crB, g.gunTop - bowLift * 0.2)}L${P(crA, g.gunTop)}Z`);
  // stern: the tiller arm and a brass pin
  const tx = X(0.02);
  b.layer();
  b.ink(`M${P(tx, g.gunTop)}Q${P(tx - o.dir * 6 * s, g.roofY - 4 * s)} ${P(tx + o.dir * 34 * s, g.roofY - 22 * s)}`, Math.max(1.6, w * 0.9), CM.ink);
  b.fill(CM.coatMustard, ovalPath(tx + o.dir * 34 * s, g.roofY - 22 * s, 3.5 * s, 3.5 * s));
  // ---- windows: portholes (cream rims, curtains) and a few rectangular windows; the painted panel
  const nW = Math.max(3, Math.round((R - L) / (40 * s + 36)));
  const panelAt = o.panel ? Math.floor(nW * 0.55) : -1;
  for (let k = 0; k < nW; k++) {
    const u = (k + 0.5) / nW;
    const wx = lerp(L + 18 * s, R - 18 * s, u);
    const wy = g.roofY + (g.gunTop - g.roofY) * 0.46;
    if (k === panelAt) {
      const pw = 44 * s;
      const ph = 30 * s;
      b.fill(CM.stucco, ovalPath(wx, wy, pw, ph));
      b.fill(CM.sage, leafPath(wx - pw * 0.3, wy + ph * 0.1, pw * 0.5, ph * 0.22, -20));
      b.fill(CM.sage, leafPath(wx + pw * 0.32, wy + ph * 0.05, pw * 0.5, ph * 0.22, 25));
      for (const [dx, dy, c] of [[-0.25, -0.1, CM.box], [0.1, -0.2, CM.leafRust], [0.35, 0.2, CM.box], [-0.05, 0.3, CM.coatMustard]] as [number, number, string][]) {
        b.fill(c, ovalPath(wx + dx * pw, wy + dy * ph, 7 * s, 7 * s));
      }
      continue;
    }
    const round = k % 3 !== 1;
    if (round) {
      const rr = 13 * s;
      b.fill(CM.coatOat, ovalPath(wx, wy, rr * 1.32, rr * 1.32));
      b.fill(o.lit ? CM.lamp : CM.glass, ovalPath(wx, wy, rr, rr));
      // curtains: two drapes tied back
      const cc = [CM.box, CM.blossom, CM.coatMustard, CM.leafRust][k % 4];
      b.fill(cc, `M${P(wx - rr, wy - rr * 0.6)}Q${P(wx - rr * 0.2, wy - rr)} ${P(wx - rr * 0.3, wy + rr * 0.6)}L${P(wx - rr, wy + rr * 0.4)}Z`);
      b.fill(cc, `M${P(wx + rr, wy - rr * 0.6)}Q${P(wx + rr * 0.2, wy - rr)} ${P(wx + rr * 0.3, wy + rr * 0.6)}L${P(wx + rr, wy + rr * 0.4)}Z`);
      if (w > 0) b.ink(circleInk(wx, wy, rr * 1.32, {seed: `${o.seed}/ph${k}`}), Math.max(1.2, w * 0.55));
    } else {
      const ww = 46 * s;
      const wh = 30 * s;
      b.rect(CM.coatOat, wx - ww / 2 - 3 * s, wy - wh / 2 - 3 * s, ww + 6 * s, wh + 6 * s);
      b.rect(o.lit ? CM.lamp : CM.glass, wx - ww / 2, wy - wh / 2, ww, wh);
      b.rect(CM.box, wx - ww / 2, wy - wh / 2, ww, wh * 0.28);
      // a plant on the inside sill
      b.fill(CM.sage, lobes(wx - ww * 0.25, wx + ww * 0.1, wy + wh / 2, wh * 0.45, `${o.seed}/wp${k}`, 2));
    }
  }
  // the cabin's stern doors
  const dx0 = X(g.c0 + 0.005);
  b.rect(CM.line, Math.min(dx0, dx0 + o.dir * 34 * s), g.roofY + 6 * s, 34 * s, g.gunTop - g.roofY - 6 * s);
  b.rect(CM.coatMustard, Math.min(dx0, dx0 + o.dir * 34 * s) + 15 * s, g.roofY + (g.gunTop - g.roofY) * 0.5, 4 * s, 4 * s);
  // the cafe's serving hatch with a striped awning and a counter
  if (o.cafe) {
    const hx = X(0.42);
    const hw = 120 * s;
    const hy = g.roofY + 14 * s;
    const hh = (g.gunTop - g.roofY) * 0.5;
    b.rect(CM.lampCore, hx - hw / 2, hy, hw, hh);
    b.rect(CM.line, hx - hw / 2 - 4 * s, hy + hh, hw + 8 * s, 7 * s);
    for (let k = 0; k < 6; k++) b.rect(k % 2 ? CM.paper : CM.box, hx - hw / 2 - 8 * s + (k * (hw + 16 * s)) / 6, hy - 16 * s, (hw + 16 * s) / 6 + 0.5, 14 * s);
    // cups and a cake stand on the counter
    for (let k = 0; k < 3; k++) b.rect(CM.paper, hx - hw * 0.35 + k * 18 * s, hy + hh - 12 * s, 9 * s, 12 * s);
    b.fill(CM.box, domePath(hx + hw * 0.28, hy + hh, 14 * s, 12 * s));
  }
  b.layer();
  // ---- roof dressing (seen from above)
  const roofTop = g.roofY - g.roofH;
  const ch = o.chimney ?? 0.22;
  const chX = X(ch);
  const items = o.roofItems ?? (o.topView ?? 0) > 0;
  const small = o.h < 130;
  const depth = o.topView ?? 0;
  const onRoof = (u: number, k: number) => [X(u), roofTop - depth * (0.25 + 0.5 * k)] as Pt;
  if (items) {
    // herb pots (terracotta) with tufts
    for (let k = 0; k < (small ? 2 : 4); k++) {
      const [px, py] = onRoof(0.36 + k * 0.045, r.next());
      const pw = 14 * s;
      b.fill(CM.brickDeep, `M${P(px - pw / 2, py - pw)}L${P(px + pw / 2, py - pw)}L${P(px + pw * 0.38, py)}L${P(px - pw * 0.38, py)}Z`);
      b.fill(k % 2 ? CM.sage : CM.leafGold, lobes(px - pw * 0.7, px + pw * 0.7, py - pw, pw * 1.3, `${o.seed}/herb${k}`, 2));
    }
    // a coiled rope
    const [rx, ry] = onRoof(0.62, 0.4);
    b.fill(CM.coatOat, ovalPath(rx, ry - 5 * s, 18 * s, 7 * s));
    b.fill(CM.line, ovalPath(rx, ry - 5 * s, 9 * s, 3.4 * s));
    if (small) return finishBoat();
    // a watering can
    const [cx, cy] = onRoof(0.7, 0.7);
    b.rect(CM.coatSlate, cx - 9 * s, cy - 14 * s, 18 * s, 14 * s);
    b.fill(CM.coatSlate, `M${P(cx + 9 * s, cy - 8 * s)}L${P(cx + 22 * s, cy - 18 * s)}L${P(cx + 22 * s, cy - 15 * s)}L${P(cx + 9 * s, cy - 4 * s)}Z`);
    // a bike lying along the roof
    const [bx, by] = onRoof(0.53, 0.1);
    bikeInto(b, bx, by, 12 * s, `${o.seed}/rb`, CM.brickDeep, o.dir);
    // a plank and a pole
    const [pkx, pky] = onRoof(0.78, 0.5);
    b.rect(CM.line, Math.min(pkx, pkx + o.dir * 90 * s), pky - 4 * s, 90 * s, 5 * s);
  }
  function finishBoat() {
  // the stove chimney: a pipe with a brass band and a cap
    const cw = 9 * s;
    const chTop = roofTop - depth * 0.5 - 40 * s;
    b.rect(CM.anchor, chX - cw / 2, chTop, cw, roofTop - depth * 0.5 - chTop);
    b.rect(CM.coatMustard, chX - cw / 2 - 1, chTop + 10 * s, cw + 2, 4 * s);
    b.fill(CM.anchor, domePath(chX, chTop, cw * 0.9, 5 * s));
    // fenders: rope balls at the bow and stern
    if (o.fenders ?? true) {
      for (const u of [0.04, 0.3, 0.6, 0.9]) {
        const fx = X(u);
        b.fill(CM.coatOat, ovalPath(fx, o.water - g.hullH * 0.45, 9 * s, 12 * s));
        if (w > 0) b.ink(`M${P(fx, g.gunTop)}L${P(fx, o.water - g.hullH * 0.45 - 12 * s)}`, Math.max(1.2, w * 0.45), CM.line);
      }
    }
    // bunting along the cafe boat's roof
    if (o.cafe) {
      const n = 12;
      let d = '';
      for (let k = 0; k <= n; k++) {
        const u = lerp(g.c0, g.c1, k / n);
        const px = X(u);
        const py = roofTop - 24 * s + Math.sin(k * 0.9) * 2 * s;
        d += `${k ? 'L' : 'M'}${P(px, py)}`;
        if (k < n) b.fill([CM.box, CM.sage, CM.coatMustard, CM.paper][k % 4], `M${P(px, py)}L${P(X(lerp(g.c0, g.c1, (k + 1) / n)), py)}L${P((px + X(lerp(g.c0, g.c1, (k + 1) / n))) / 2, py + 14 * s)}Z`);
      }
      b.ink(d, Math.max(1.2, w * 0.5));
    }
    // ---- ink: the cabin's top and ends, the hull sheer (loose, open)
    if (w > 0) {
      b.ink(line(L, g.roofY, R, g.roofY, {seed: `${o.seed}/rt`, over: 'small'}) + line(cx0, g.roofY - g.roofH, cx0, g.gunTop, {seed: `${o.seed}/ce0`, over: 'small'}) + line(cx1, g.roofY - g.roofH, cx1, g.gunTop, {seed: `${o.seed}/ce1`, over: 'small'}), w, CM.ink, 0.15);
      b.ink(`M${P(sternX, hullTop)}L${P(X(0.86), hullTop)}Q${P(X(0.95), hullTop - bowLift * 0.3)} ${P(bowX, hullTop - bowLift)}`, w, CM.ink, 0.2);
      b.ink(line(sternX, hullTop, sternX, o.water, {seed: `${o.seed}/st`, over: 'small'}), w * 0.8);
    }
  }
  finishBoat();
}

export type NarrowboatProps = BoatOpts & {
  /** Smoke from the chimney (default true) and its extra puffs at these times. */
  smoke?: boolean;
  bursts?: number[];
  /** Glide: px/s along `dir` (the boat moves; x is its position at t = 0). */
  speed?: number;
};

/** A narrowboat (static or gliding) with its chimney smoke. */
export const Narrowboat: React.FC<NarrowboatProps> = ({smoke = true, bursts, speed = 0, ...o}) => {
  const t = useTime();
  const x = o.x + o.dir * speed * t;
  const static_ = speed === 0;
  const memo = useMemo(() => {
    if (!static_) return null;
    const b = new Batch();
    boatInto(b, o, 0);
    return b;
  }, [static_, o.x, o.water, o.len, o.h, o.dir, o.seed, o.cabin, o.topView, o.roofItems, o.chimney, o.panel, o.fenders, o.lit, o.cafe, o.ink]);
  let b = memo;
  if (!b) {
    b = new Batch();
    boatInto(b, {...o, x}, t);
  }
  const g = boatGeom({...o, x});
  const chX = g.X(o.chimney ?? 0.22);
  const chTop = g.roofY - g.roofH - (o.topView ?? 0) * 0.5 - 40 * (o.h / 100);
  return (
    <>
      <Paint b={b} seed={`boat/${o.seed}`} />
      {smoke ? <Puffs x={chX} y={chTop - 2} seed={`${o.seed}/smoke`} kind="smoke" scale={Math.max(0.4, o.h / 110)} bursts={bursts} drift={-o.dir * 30 - 20} /> : null}
    </>
  );
};

// ---------------------------------------------------------------- the cafe boat's stern deck (S8 bottom-left)

/** The cafe boat's stern deck seen from the towpath, close and from above: planks converging away, two small tables
 *  with mugs (steam), a folded chair, a potted bay, a coiled rope. Region x0..x1, y0 (far edge) .. y1 (near edge). */
export const CafeDeck: React.FC<{x0: number; x1: number; y0: number; y1: number; seed: string; vp?: Pt}> = ({x0, x1, y0, y1, seed, vp = [520, 760]}) => {
  const stat = useMemo(() => {
    const b = new Batch();
    // deck boards: a trapezoid narrowing toward the VP
    const k = 0.18;
    const fx0 = lerp(x0, vp[0], k);
    const fx1 = lerp(x1, vp[0], k * 0.6);
    b.poly(CM.line, [[fx0, y0], [fx1, y0], [x1, y1], [x0 - 40, y1]]);
    let d = '';
    for (let i = 1; i < 9; i++) {
      const u = i / 9;
      d += `M${P(lerp(fx0, fx1, u), y0)}L${P(lerp(x0 - 40, x1, u), y1)}`;
    }
    b.ink(d, INK_PX.hair, CM.brickDeep);
    // the gunwale rail along the deck's outer edge (plum stripe) and the hull below
    b.poly(CM.anchor, [[fx1, y0 - 6], [fx1 + 10, y0 - 6], [x1 + 14, y1], [x1, y1]]);
    b.layer();
    // a potted bay tree (lollipop) at the back
    const bx = lerp(fx0, fx1, 0.22);
    const by = y0 + (y1 - y0) * 0.12;
    b.fill(CM.brickDeep, `M${P(bx - 22, by - 34)}L${P(bx + 22, by - 34)}L${P(bx + 16, by)}L${P(bx - 16, by)}Z`);
    b.rect(CM.line, bx - 2.5, by - 120, 5, 88);
    b.fill(CM.sage, lobes(bx - 44, bx + 44, by - 112, 80, `${seed}/bay`, 4));
    // two small round tables (tops as ellipses) with legs, mugs and a teapot
    const tables: [number, number, number][] = [
      [lerp(x0, x1, 0.3), lerp(y0, y1, 0.42), 70],
      [lerp(x0, x1, 0.72), lerp(y0, y1, 0.7), 92],
    ];
    tables.forEach(([tx, ty, R], i) => {
      b.rect(CM.anchor, tx - 3, ty, 6, R * 0.9);
      b.fill(CM.anchor, ovalPath(tx, ty + R * 0.9, R * 0.4, R * 0.08));
      b.fill(CM.paper, ovalPath(tx, ty, R, R * 0.34));
      b.fill(CM.limestone, ovalPath(tx, ty + 3, R * 0.95, R * 0.28));
      for (let m = 0; m < 2; m++) {
        const mx = tx + (m ? R * 0.35 : -R * 0.3);
        b.rect(m ? CM.coatMustard : CM.box, mx - 9, ty - 22, 18, 20);
        b.fill(CM.ink, ovalPath(mx, ty - 22, 9, 3));
      }
      if (i === 1) b.fill(CM.coatSlate, domePath(tx, ty - 6, 16, 22));
    });
    // a folded chair leaning on the cabin
    const fx = lerp(x0, x1, 0.92);
    const fy = lerp(y0, y1, 0.3);
    b.poly(CM.line, [[fx - 14, fy - 130], [fx + 10, fy - 130], [fx + 26, fy], [fx + 4, fy]]);
    b.layer();
    // a coiled rope on the boards
    b.fill(CM.coatOat, ovalPath(lerp(x0, x1, 0.12), lerp(y0, y1, 0.8), 60, 22));
    b.fill(CM.line, ovalPath(lerp(x0, x1, 0.12), lerp(y0, y1, 0.8), 32, 11));
    b.ink(`M${P(lerp(x0, x1, 0.12) - 60, lerp(y0, y1, 0.8))}A60 22 0 1 0 ${P(lerp(x0, x1, 0.12) + 60, lerp(y0, y1, 0.8))}`, INK_PX.mid, CM.ink, 0.3);
    return b;
  }, [x0, x1, y0, y1, seed, vp[0], vp[1]]);
  return (
    <>
      <Paint b={stat} seed={`deck/${seed}`} />
      <Puffs x={lerp(x0, x1, 0.3) - 21} y={lerp(y0, y1, 0.42) - 26} seed={`${seed}/st1`} kind="steam" scale={0.5} drift={-14} />
      <Puffs x={lerp(x0, x1, 0.72) + 32} y={lerp(y0, y1, 0.7) - 26} seed={`${seed}/st2`} kind="steam" scale={0.55} drift={-14} />
    </>
  );
};

// ---------------------------------------------------------------- S7 -> S8: the narrowboat foreground wipe

const WIPE_LEN = 1180;
const WIPE_H = 980;

/** A narrowboat gliding right past the lens (S7's `Wiper`): its cabin side covers y ~600-1920 around the seam, the
 *  roof and chimney above; the sky above y 556 is mint in both shots, so the seam there is invisible. Screen px,
 *  centred on the wipe edge x; dir is the travel direction (the bow leads). */
export const BoatWiper: React.FC<WiperProps> & {half?: number} = ({x, dir}) => {
  const d: 1 | -1 = dir === 'right' ? 1 : -1;
  const b = useMemo(() => {
    const b = new Batch();
    boatInto(b, {x: -WIPE_LEN / 2, water: 2010, len: WIPE_LEN, h: WIPE_H, dir: d, seed: 'wiper', cabin: CM.sage, topView: 40, roofItems: true, panel: true, fenders: true, ink: INK_PX.front}, 0);
    return b;
  }, [d]);
  return (
    <g transform={`translate(${r1(x)} 0)`}>
      <Paint b={b} seed="boatwiper" exit={false} />
    </g>
  );
};
BoatWiper.half = WIPE_LEN / 2 + 40;

export {rectInk};
