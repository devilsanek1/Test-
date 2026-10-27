// V2S4_wfar.tsx (lane L3, V2S4 WORLD helpers): the FAR plane (0.3x) drawn at the 17.96 pose in plane px.
//   gasholders   a King's-Cross-like cluster of three cast-iron guide frames: paired columns, ring girders that bow
//                with the eye (front arc up), ink lattice bracing; the left one holds a drum of flats. G1 stands in
//                front of SUN1: its lattice slides across the disc during the truck (the parallax cue).
//   far roofs    two rows in flat depth steps (stone far, light brick near): pitched, mansard, flat and gable roofs,
//                chimney stacks with pots, aerials, rows of tiny windows (a few warmly lit, one switching)
//   viaduct      a brick viaduct, arches, a parapet and overhead-line masts with their wire; a train crosses once
//   birds        a flock perched on G1's top ring lifts on "heading" (19.78) and flies WEST across the disc
// The sun's column (plane-x `sunClear(0.3)`) is kept below y 716 by everything but the lattice and the birds.
import React, {useMemo} from 'react';
import {CM} from '../palette';
import {useTime} from '../../lib/time';
import {Batch, Paint, P, rng, ovalPath, lerp, frac, r1} from '../kit/canal/core';
import {litAt} from '../kit/canal/life';
import {ROW, PLANE_X, SUN, sunClear, clamp01, smooth01} from './V2S4_wcore';

const K = 0.3;
const [X0, X1] = PLANE_X(K);
const CLEAR = sunClear(K);
/** The highest y (smallest) an element spanning [xa, xb] may reach on this plane. */
const topAt = (xa: number, xb: number) => (xb > CLEAR[0] && xa < CLEAR[1] ? 716 : ROW.top);

// ---------------------------------------------------------------- gasholders

type Gas = {cx: number; top: number; r: number; base: number; seed: string; drum?: boolean; tiers?: number};
export const GAS: Gas[] = [
  {cx: 104, top: 648, r: 78, base: 860, seed: 'g3', drum: true, tiers: 3},
  {cx: 468, top: 636, r: 92, base: 860, seed: 'g2', tiers: 3},
  {cx: 292, top: 618, r: 124, base: 860, seed: 'g1', tiers: 4},
];

/** One guide frame: columns at the cylinder's visible stations, ring girders (front arc bows UP: we look up at it),
 *  X-bracing in every bay of every tier, a cap on each column. Members are flat shade-cool fills; the lattice is ink. */
function gasFrameInto(b: Batch, g: Gas) {
  const {cx, top, r, base, seed} = g;
  const tiers = g.tiers ?? 3;
  const n = 12;
  const xs: number[] = [];
  for (let k = 0; k <= n / 2; k++) xs.push(cx + r * Math.cos((2 * Math.PI * k) / n));
  xs.sort((a, c) => a - c);
  const bow = r * 0.06; // the front arc's lift at the centre
  const ringY = (i: number) => top + ((base - top) * i) / (tiers + 0.35);
  const frontY = (y: number, x: number) => y - bow * Math.sqrt(Math.max(0, 1 - ((x - cx) / r) ** 2));
  const backY = (y: number, x: number) => y + bow * 0.7 * Math.sqrt(Math.max(0, 1 - ((x - cx) / r) ** 2));
  // the drum of flats inside (left frame): a stone cylinder with window bands, a lit window or two
  if (g.drum) {
    const dt = top + 26;
    const dr = r * 0.8;
    b.rect(CM.limestone, cx - dr, dt, dr * 2, base - dt);
    b.fill(CM.limestone, `M${P(cx - dr, dt)}Q${P(cx, dt - 9)} ${P(cx + dr, dt)}Z`);
    b.rect(CM.stoneShade, cx + dr * 0.55, dt, dr * 0.45, base - dt);
    const rr = rng(`${seed}/drum`);
    for (let y = dt + 10; y < base - 6; y += 13) {
      b.rect(CM.stoneShade, cx - dr, y + 6, dr * 2, 1.6);
      for (let x = cx - dr + 5; x < cx + dr - 6; x += 9) {
        const c = rr.next();
        b.rect(c < 0.08 ? CM.lamp : c < 0.6 ? CM.paneUnlit : CM.glass, x, y, 4.2, 5.2);
      }
    }
  }
  b.layer();
  const col = CM.shadeCool;
  let lat = '';
  // ring girders: an upper and a lower chord per ring, both arcs; zig-zag lattice between the chords
  for (let i = 0; i <= tiers; i++) {
    const y = ringY(i);
    const h = i === 0 ? 7 : 5;
    const front: [number, number][] = [];
    const back: [number, number][] = [];
    for (let k = 0; k <= 24; k++) {
      const x = cx - r + (2 * r * k) / 24;
      front.push([x, frontY(y, x)]);
      back.push([x, backY(y, x)]);
    }
    // chords as thin filled ribbons (front) and a hairline (back, seen through)
    const ribbon = (pts: [number, number][], w: number) => {
      let d = `M${P(pts[0][0], pts[0][1])}`;
      for (const [x, yy] of pts.slice(1)) d += `L${P(x, yy)}`;
      for (const [x, yy] of pts.slice().reverse()) d += `L${P(x, yy + w)}`;
      return d + 'Z';
    };
    b.fill(col, ribbon(front, 2.2));
    b.fill(col, ribbon(front.map(([x, yy]) => [x, yy + h]), 1.8));
    b.fill(col, ribbon(back, 1.4));
    for (let k = 0; k < 24; k++) {
      const [xa, ya] = front[k];
      const [xb, yb] = front[k + 1];
      lat += `M${P(xa, ya + 2)}L${P((xa + xb) / 2, (ya + yb) / 2 + h)}L${P(xb, yb + 2)}`;
    }
    // the bays' X-bracing below this ring (front face), between visible column stations
    if (i < tiers) {
      const y2 = ringY(i + 1);
      for (let k = 0; k < xs.length - 1; k++) {
        const xa = xs[k];
        const xb = xs[k + 1];
        if (xb - xa < 9 || (k + i) % 2 === 1) continue;
        lat += `M${P(xa, frontY(y, xa) + h)}L${P(xb, frontY(y2, xb))}M${P(xb, frontY(y, xb) + h)}L${P(xa, frontY(y2, xa))}`;
      }
    }
  }
  // columns: paired thin shafts with caps above the top ring
  xs.forEach((x, k) => {
    const edge = k === 0 || k === xs.length - 1;
    const w = edge ? 3.4 : 2.6;
    b.rect(col, x - w / 2, frontY(top, x) - 5, w, base - top + 5);
    b.rect(col, x - w / 2 - 1.4, frontY(top, x) - 7, w + 2.8, 2.6);
  });
  b.ink(lat, 0.9, CM.ink);
}

// ---------------------------------------------------------------- far roof rows

type RowOpts = {x0: number; x1: number; base: number; top: number; spread: number; seed: string; walls: string[]; roofs: string[]; w: [number, number]; win: number; lit: number};
type Win = {x: number; y: number; w: number; h: number; k: number};

/** One row of far buildings: wall, roof (pitched / mansard / flat / gable / shed), chimney stacks and pots, aerials,
 *  window rows. Everything respects `topAt` (the sun column). Returns its windows (the lit ones switch). */
function farRowInto(b: Batch, o: RowOpts): Win[] {
  const r = rng(o.seed);
  const wins: Win[] = [];
  let x = o.x0 - r.range(0, o.w[1] * 0.5);
  let i = 0;
  let aer = '';
  while (x < o.x1) {
    const w = r.range(o.w[0], o.w[1]);
    const kind = r.weighted([['pitch', 4], ['mansard', 2], ['flat', 2], ['gable', 2], ['shed', 1]] as const);
    const lim = topAt(x - 4, x + w + 4);
    const rh = Math.min(w * 0.3, 26);
    const wallTop = Math.max(lim + (kind === 'flat' ? 4 : rh), o.top + r.jitter(o.spread));
    const wall = o.walls[i % o.walls.length];
    const roof = o.roofs[(i + r.int(0, 2)) % o.roofs.length];
    b.rect(wall, x, wallTop, w + 0.8, o.base - wallTop);
    if (kind === 'pitch') b.poly(roof, [[x - 2, wallTop], [x + w * 0.14, wallTop - rh * 0.75], [x + w * 0.86, wallTop - rh * 0.75], [x + w + 2, wallTop]]);
    if (kind === 'mansard') {
      b.poly(roof, [[x - 1, wallTop], [x + w * 0.07, wallTop - rh], [x + w * 0.93, wallTop - rh], [x + w + 1, wallTop]]);
      for (let k = 0; k < Math.floor(w / 26); k++) b.rect(CM.paper, x + w * 0.14 + k * 26, wallTop - rh * 0.72, 7, rh * 0.42);
    }
    if (kind === 'flat') {
      b.rect(CM.stoneShade, x - 1, wallTop - 4, w + 2, 4);
      if (r.chance(0.5)) b.rect(CM.limestone, x + w * 0.2, wallTop - 4 - 7, w * 0.22, 7); // a roof box
    }
    if (kind === 'gable') b.poly(roof, [[x - 2, wallTop], [x + w / 2, wallTop - rh * 1.05], [x + w + 2, wallTop]]);
    if (kind === 'shed') {
      const n = Math.max(2, Math.round(w / 24));
      const pts: [number, number][] = [[x, wallTop]];
      for (let k = 0; k < n; k++) {
        pts.push([x + ((k + 0.8) * w) / n, wallTop - rh * 0.55]);
        pts.push([x + ((k + 1) * w) / n, wallTop]);
      }
      b.poly(roof, pts);
    }
    // stacks with pots on the pitched kinds
    if (kind !== 'flat' && kind !== 'shed') {
      const ns = r.int(1, 2);
      for (let k = 0; k < ns; k++) {
        const cx = x + w * (ns === 1 ? r.range(0.25, 0.75) : k === 0 ? r.range(0.12, 0.3) : r.range(0.7, 0.88));
        const cw = r.range(8, 14);
        const ch = r.range(10, 20);
        const ct = Math.max(topAt(cx - cw, cx + cw) + 5, wallTop - rh * 0.75 - ch);
        b.rect(wall === CM.brickLight ? CM.brick : CM.brickLight, cx - cw / 2, ct, cw, wallTop - ct);
        b.rect(CM.stoneShade, cx - cw / 2 - 1.5, ct, cw + 3, 2.2);
        const pots = Math.max(1, Math.round(cw / 5));
        for (let p = 0; p < pots; p++) b.rect(r.chance(0.5) ? CM.leafRust : CM.brickDeep, cx - cw / 2 + 1.2 + (p * (cw - 2.4)) / pots, ct - 4, Math.max(2, (cw - 2.4) / pots - 1.2), 4);
        if (r.chance(0.4)) {
          const ay = Math.max(topAt(cx - 8, cx + 8) + 1, ct - r.range(12, 20));
          aer += `M${P(cx + cw * 0.2, ct - 4)}L${P(cx + cw * 0.2, ay)}M${P(cx + cw * 0.2 - 6, ay + 3)}L${P(cx + cw * 0.2 + 6, ay + 3)}M${P(cx + cw * 0.2 - 4, ay + 6.5)}L${P(cx + cw * 0.2 + 4, ay + 6.5)}`;
        }
      }
    }
    // tiny windows in rows
    const ww = o.win;
    const cols = Math.max(1, Math.floor((w - ww) / (ww * 2.3)));
    for (let rr = 0; rr < 4; rr++) {
      const wy = wallTop + ww * 0.9 + rr * ww * 2.5;
      if (wy + ww * 1.5 > o.base - 4) break;
      for (let c = 0; c < cols; c++) wins.push({x: x + (w - cols * ww * 2.3) / 2 + c * ww * 2.3 + ww * 0.6, y: wy, w: ww, h: ww * 1.45, k: wins.length});
    }
    x += w + (r.chance(0.15) ? r.range(2, 8) : 0);
    i++;
  }
  if (aer) b.ink(aer, 0.9, CM.shadeCool);
  return wins;
}

/** The windows of a row: unlit panes (glass / unlit), a few warm lit ones switching on the shared clock. */
function winsInto(b: Batch, wins: Win[], seed: string, lit: number, t: number) {
  const r = rng(`${seed}/wc`);
  const n = wins.length;
  for (const w of wins) {
    const v = r.next();
    const on = lit > 0 && litAt(t, seed, w.k, n, {litFrac: lit, gap: [0.9, 2.6]});
    b.rect(on ? CM.lamp : v < 0.5 ? CM.paneUnlit : v < 0.85 ? CM.glass : CM.shadeCool, w.x, w.y, w.w, w.h);
  }
}

// ---------------------------------------------------------------- the viaduct

const VIA = {deck: 748, base: 862, pitch: 66, x0: X0, x1: X1};

function viaductInto(b: Batch) {
  const {deck, base, pitch, x0, x1} = VIA;
  const dh = 12;
  const pierW = 15;
  // parapet + deck band + string course
  b.rect(CM.brickLight, x0, deck, x1 - x0, dh);
  b.rect(CM.limestone, x0, deck - 2.5, x1 - x0, 2.5);
  b.rect(CM.stoneShade, x0, deck + dh - 3, x1 - x0, 3);
  for (let x = x0; x < x1; x += pitch) {
    b.rect(CM.brickLight, x, deck + dh - 1, pierW, base - deck - dh + 1);
    b.rect(CM.stoneShade, x + pierW - 3, deck + dh + 4, 3, base - deck - dh - 4);
    const ax = x + pierW;
    const aw = pitch - pierW;
    const sp = deck + dh + aw * 0.42;
    b.fill(CM.brickLight, `M${P(ax - 0.5, deck + dh - 0.5)}L${P(ax + aw + 0.5, deck + dh - 0.5)}L${P(ax + aw + 0.5, sp)}A${r1(aw / 2)} ${r1(aw * 0.42)} 0 0 0 ${P(ax - 0.5, sp)}Z`);
    // the arch ring (stone)
    b.fill(CM.stoneShade, `M${P(ax, sp)}A${r1(aw / 2)} ${r1(aw * 0.42)} 0 0 1 ${P(ax + aw, sp)}L${P(ax + aw - 2.5, sp)}A${r1(aw / 2 - 2.5)} ${r1(aw * 0.42 - 2.5)} 0 0 0 ${P(ax + 2.5, sp)}Z`);
  }
  // overhead-line masts and the wire (thin lines; the sun's column keeps them low)
  let m = '';
  let wire = '';
  for (let x = x0 + 20; x < x1; x += pitch * 1.5) {
    const tp = Math.max(topAt(x - 6, x + 6) + 2, deck - 34);
    m += `M${P(x, deck - 2)}L${P(x, tp)}M${P(x - 1, tp + 3)}L${P(x + 11, tp + 3)}`;
  }
  for (let x = x0; x < x1; x += 24) wire += `${x === x0 ? 'M' : 'L'}${P(x, deck - 26 + Math.sin((x - x0) / (pitch * 1.5) * Math.PI * 2) * 1.2 + (topAt(x, x + 1) > 700 ? 4 : 0))}`;
  b.ink(m, 1.1, CM.shadeCool);
  b.ink(wire, 0.8, CM.shadeCool);
}

/** The train: four carriages crossing the viaduct ONCE (eastbound, from the left), t0 -> on its way. */
const TRAIN = {t0: 15.25, speed: 230, car: 66, h: 19};
function trainInto(b: Batch, t: number) {
  const u = t - TRAIN.t0;
  if (u < 0) return;
  const len = TRAIN.car * 4 + 6;
  const head = X0 - 40 + u * TRAIN.speed;
  if (head - len > X1) return;
  const y1 = VIA.deck - 2;
  for (let k = 0; k < 4; k++) {
    const x = head - (k + 1) * (TRAIN.car + 2);
    b.rect(CM.limestone, x, y1 - TRAIN.h, TRAIN.car, TRAIN.h);
    b.rect(CM.paneUnlit, x + 4, y1 - TRAIN.h * 0.74, TRAIN.car - 8, TRAIN.h * 0.3);
    b.rect(CM.stoneShade, x, y1 - 3, TRAIN.car, 3);
    for (let j = 1; j < 5; j++) b.rect(CM.limestone, x + 4 + ((TRAIN.car - 8) * j) / 5 - 0.6, y1 - TRAIN.h * 0.74, 1.2, TRAIN.h * 0.3);
  }
  // the yellow cab front at the head, the pantograph on the second car
  const hx = head - (TRAIN.car + 2);
  b.poly(CM.coatMustard, [[hx + TRAIN.car - 10, y1 - TRAIN.h], [hx + TRAIN.car + 2, y1 - TRAIN.h * 0.55], [hx + TRAIN.car + 2, y1], [hx + TRAIN.car - 10, y1]]);
  const px = head - 2 * (TRAIN.car + 2) + TRAIN.car * 0.5;
  b.ink(`M${P(px - 8, y1 - TRAIN.h)}L${P(px, y1 - TRAIN.h - 6)}L${P(px + 8, y1 - TRAIN.h)}`, 1, CM.ink);
}

// ---------------------------------------------------------------- birds: perched on G1, lifting west on "heading"

export const FLOCK_AT = 19.78;
const G1 = GAS[2];
const FLOCK = Array.from({length: 8}, (_, i) => {
  const r = rng(`s4flock/${i}`);
  const x = lerp(G1.cx + 8, G1.cx + G1.r * 0.9, (i + r.range(0.1, 0.9)) / 8);
  const bow = G1.r * 0.06 * Math.sqrt(Math.max(0, 1 - ((x - G1.cx) / G1.r) ** 2));
  return {x, y: G1.top - bow - 6.5, face: r.chance(0.6) ? -1 : 1, ph: r.range(0, 6.28), delay: r.range(0, 0.16), vx: r.range(250, 320), cruise: r.range(628, 690), s: r.range(8.5, 11)};
});

function flockInto(b: Batch, t: number) {
  for (const f of FLOCK) {
    const ft = t - FLOCK_AT - f.delay;
    const s = f.s;
    if (ft < 0) {
      // perched on the top ring: plump body, head, tail; a peck now and then
      const peck = Math.max(0, Math.sin(t * 0.9 + f.ph) - 0.85) * 5;
      const by = f.y + Math.sin(t * 1.7 + f.ph) * 0.25;
      b.fill(CM.anchor, ovalPath(f.x, by, s * 0.4, s * 0.27));
      b.fill(CM.anchor, ovalPath(f.x + f.face * s * 0.34, by - s * 0.22 + peck * 0.25, s * 0.16, s * 0.15));
      b.fill(CM.anchor, `M${P(f.x - f.face * s * 0.28, by - s * 0.04)}L${P(f.x - f.face * s * 0.66, by + s * 0.12)}L${P(f.x - f.face * s * 0.28, by + s * 0.13)}Z`);
      continue;
    }
    // lift (a hop up), then a long glide-and-flap WEST, dropping into the sun's band (y ~628-690)
    const x = f.x - f.vx * ft * smooth01(ft / 0.25) * 0.6 - f.vx * Math.max(0, ft - 0.12) * 0.4;
    const up = Math.sin(clamp01(ft / 0.35) * Math.PI) * 14;
    const y = Math.max(ROW.ceil + 6, lerp(f.y, f.cruise, smooth01(ft / 0.7)) - up + Math.sin(ft * 3 + f.ph) * 3);
    if (x < X0 - 20) continue;
    const flap = Math.sin(ft * 24 + f.ph);
    const wx = s * 0.66;
    const wy = s * 0.5 * flap;
    b.fill(CM.anchor, `M${P(x - wx, y - wy)}Q${P(x - wx * 0.4, y - wy * 0.2 - s * 0.05)} ${P(x, y + s * 0.08)}Q${P(x + wx * 0.4, y - wy * 0.2 - s * 0.05)} ${P(x + wx, y - wy)}L${P(x + wx * 0.5, y - wy * 0.5 + s * 0.09)}L${P(x, y + s * 0.22)}L${P(x - wx * 0.5, y - wy * 0.5 + s * 0.09)}Z`);
  }
}

// ---------------------------------------------------------------- the plane

/** The far plane's static drawing (memoized by the caller) + the window lists that switch. */
export function farStatic(): Batch {
  const b = new Batch();
  for (const g of GAS) gasFrameInto(b, g);
  b.layer();
  const winsA = farRowInto(b, {x0: X0, x1: X1, base: ROW.wallTop, top: 728, spread: 10, seed: 's4farA', walls: [CM.limestone, CM.stoneShade, CM.glass, CM.limestone], roofs: [CM.stoneShade, CM.shadeCool, CM.stoneShade], w: [44, 96], win: 4, lit: 0});
  b.layer();
  winsInto(b, winsA, 's4farAw', 0, 0);
  b.layer();
  const winsB = farRowInto(b, {x0: X0, x1: X1, base: ROW.wallTop, top: 752, spread: 8, seed: 's4farB', walls: [CM.brickLight, CM.stucco, CM.limestone, CM.brickLight, CM.stoneShade], roofs: [CM.shadeCool, CM.shadeWarm, CM.paneUnlit], w: [52, 120], win: 5, lit: 0.12});
  b.layer();
  winsInto(b, winsB, 's4farBw', 0.14, 0);
  b.layer();
  viaductInto(b);
  return b;
}

export const FarPlane: React.FC = () => {
  const t = useTime();
  const st = useMemo(farStatic, []);
  const dyn = new Batch();
  trainInto(dyn, t);
  dyn.layer();
  flockInto(dyn, t);
  return (
    <>
      <Paint b={st} seed="s4farSt" misreg={false} />
      <Paint b={dyn} seed="s4farDyn" misreg={false} />
    </>
  );
};

export {frac};
