// V2S4_wboat.tsx (lane L3, V2S4 WORLD helpers): OUR NARROWBOAT, the bottom third, screen-fixed (it glides with the
// camera), and the NEAR WATER below it (the 2.0x plane). Same boat, same livery as V2S3's moored boat: a sage cabin,
// ONE plum gunwale stripe, cream portholes, the painted flower panel, herb pots, a bike, a coiled rope.
//   roof (y 1222-1288, seen a little from above): a grab rail on stanchions each side; on it, back to front: a boat
//        pole, a mop and a plank on the far rail, a coiled rope, a watering can, herb pots (they flutter, and flinch
//        when Pip lands at 14.95), Pip's clear spot x 410-530, a folded bike and a solar panel (low: never above
//        y 1090 under her), a lifebuoy, the stove chimney (smoke blown east), brass mushroom vents, a log pile
//   cabin side (y 1290-1640): a brick cantrail band, cream coach lines on panels with beading, portholes with cream
//        rims and brass rings and curtains that sway (a pot plant behind one), the side doors with painted roses
//        (no lettering), brass handles; rope fenders hanging over the side
//   hull: the plum gunwale stripe (the ONE plum stripe), a slate strip with a rubbing strake to the waterline ~1700
//   near water (2.0x): the hull's broken reflection, ripples and wake lines streaming right, glints, leaves; after
//        the stop the wake calms but the water never stops
// The whole boat bobs with Pip's ride (kit/pip rideAt(t, 1.6, 0.55): the same bob, so Pip stays seated on it).
import React, {useMemo} from 'react';
import {CM, INK_PX} from '../palette';
import {useTime} from '../../lib/time';
import {XG, mat} from '../../lib/xf';
import {line, circle as circleInk} from '../../lib/sketch';
import {Batch, Paint, P, rng, ovalPath, domePath, lobes, leafPath, lerp, frac, r1, Pt} from '../kit/canal/core';
import {bikeInto} from '../kit/canal/towpath';
import {puffs} from '../../v3/film/kit/idle';
import {rideAt} from '../kit/pip/motion';
import {S4_BEATS, s4PathSpeed, s4PlaneDx, S4_K} from './V2S4_rig';
import {ROW, PLANE_X, WIND, clamp01} from './V2S4_wcore';

const FRONT = INK_PX.front;
const MID = INK_PX.mid;
const RF = ROW.roofFar; // 1222: the roof's far edge
const RN = 1286; // the roof's near edge
const CT = ROW.cabinTop; // 1290
const GW = ROW.gunwale; // 1640
const WL = ROW.waterline; // 1700
const XL = -40;
const XR = 1120;

/** The bob shared with Pip's ride. */
export const boatBob = (t: number) => rideAt(t, 1.6, 0.55).dy;

// ---------------------------------------------------------------- cabin side, hull

const PORTS = [{x: 132, curtain: CM.box}, {x: 612, curtain: CM.leafRust, plant: true}, {x: 744, curtain: CM.blossom}, {x: 1000, curtain: CM.coatMustard}];
const PORT_Y = 1438;
const PORT_R = 40;
const DOORS = {x0: 262, x1: 518, y0: 1322, y1: 1626};
const PANEL = {x0: 828, x1: 950};

function roseInto(b: Batch, x: number, y: number, R: number, c: string, seed: string) {
  const r = rng(seed);
  b.fill(c, ovalPath(x, y, R, R * 0.86));
  b.fill(c === CM.paper ? CM.blossom : CM.paper, ovalPath(x - R * 0.12, y - R * 0.1, R * 0.42, R * 0.34));
  let d = '';
  for (let k = 0; k < 3; k++) {
    const a = r.range(0, 6.28);
    d += `M${P(x + Math.cos(a) * R * 0.25, y + Math.sin(a) * R * 0.2)}A${r1(R * 0.6)} ${r1(R * 0.5)} 0 0 1 ${P(x + Math.cos(a + 2) * R * 0.7, y + Math.sin(a + 2) * R * 0.6)}`;
  }
  b.ink(d, 1.4, CM.ink);
}

/** A painted bouquet (roses-and-castles spirit): roses, daisies, leaves on a cream ground. No lettering. */
function bouquetInto(b: Batch, cx: number, cy: number, w: number, h: number, seed: string) {
  const r = rng(seed);
  for (let k = 0; k < 7; k++) {
    const a = (k / 7) * Math.PI * 2 + r.next();
    b.fill(CM.sage, leafPath(cx + Math.cos(a) * w * 0.3, cy + Math.sin(a) * h * 0.3, w * 0.3, w * 0.09, (a * 180) / Math.PI));
  }
  roseInto(b, cx, cy, w * 0.16, CM.brick, `${seed}/r0`);
  roseInto(b, cx - w * 0.22, cy + h * 0.16, w * 0.11, CM.box, `${seed}/r1`);
  roseInto(b, cx + w * 0.22, cy + h * 0.12, w * 0.11, CM.blossom, `${seed}/r2`);
  roseInto(b, cx + w * 0.04, cy - h * 0.26, w * 0.09, CM.coatMustard, `${seed}/r3`);
  for (let k = 0; k < 5; k++) {
    const dx = cx + r.range(-w * 0.36, w * 0.36);
    const dy = cy + r.range(-h * 0.36, h * 0.36);
    for (let p = 0; p < 5; p++) b.fill(CM.paper, ovalPath(dx + Math.cos((p * 6.28) / 5) * 3.4, dy + Math.sin((p * 6.28) / 5) * 3.4, 2.4, 2.4));
    b.fill(CM.coatMustard, ovalPath(dx, dy, 1.8, 1.8));
  }
}

/** A little painted castle (the roses-and-castles tradition) on the long panel: towers, a bridge, a lake. */
function castleInto(b: Batch, cx: number, cy: number, w: number) {
  const s = w / 100;
  b.fill(CM.water, `M${P(cx - 46 * s, cy + 22 * s)}Q${P(cx, cy + 16 * s)} ${P(cx + 46 * s, cy + 22 * s)}Q${P(cx, cy + 34 * s)} ${P(cx - 46 * s, cy + 22 * s)}Z`);
  b.fill(CM.sage, lobes(cx - 46 * s, cx - 10 * s, cy + 20 * s, 14 * s, 'castleHill', 2));
  b.fill(CM.sage, lobes(cx + 12 * s, cx + 46 * s, cy + 20 * s, 12 * s, 'castleHill2', 2));
  b.rect(CM.brickLight, cx - 22 * s, cy - 8 * s, 44 * s, 26 * s);
  b.rect(CM.brickLight, cx - 26 * s, cy - 22 * s, 12 * s, 40 * s);
  b.rect(CM.brickLight, cx + 14 * s, cy - 18 * s, 12 * s, 36 * s);
  b.poly(CM.brick, [[cx - 28 * s, cy - 22 * s], [cx - 20 * s, cy - 34 * s], [cx - 12 * s, cy - 22 * s]]);
  b.poly(CM.brick, [[cx + 12 * s, cy - 18 * s], [cx + 20 * s, cy - 30 * s], [cx + 28 * s, cy - 18 * s]]);
  b.rect(CM.anchor, cx - 4 * s, cy + 6 * s, 8 * s, 12 * s);
  b.rect(CM.lamp, cx - 22 * s, cy - 14 * s, 4 * s, 5 * s);
  b.rect(CM.lamp, cx + 18 * s, cy - 10 * s, 4 * s, 5 * s);
}

function cabinInto(b: Batch) {
  // the hull and the gunwale first (the stripe sits over the hull top)
  b.rect(CM.paneUnlit, XL, GW + 14, XR - XL, WL - GW - 10);
  b.rect(CM.shadeCool, XL, WL - 22, XR - XL, 4);
  b.rect(CM.waterDeep, XL, WL - 3, XR - XL, 6);
  // the cabin side (sage), its cantrail band (brick), cream coach lines, beading
  b.rect(CM.sage, XL, CT, XR - XL, GW - CT + 2);
  b.rect(CM.brickDeep, XL, CT, XR - XL, 30);
  b.rect(CM.coatOat, XL, CT + 30, XR - XL, 3.5);
  b.rect(CM.limestone, XL, CT - 4, XR - XL, 6);
  // the ONE plum gunwale stripe
  b.rect(CM.anchor, XL, GW, XR - XL, 16);
  b.rect(CM.coatMustard, XL, GW + 15, XR - XL, 2.5);
  // panels with rounded coach lines (cream) and a beading shadow under them
  const panels: [number, number][] = [[-30, 246], [534, 812], [966, 1150]];
  for (const [x0, x1] of panels) {
    const y0 = CT + 52;
    const y1 = GW - 26;
    const rr = 16;
    const rp = (o: number) => `M${P(x0 + rr + o, y0 + o)}L${P(x1 - rr - o, y0 + o)}Q${P(x1 - o, y0 + o)} ${P(x1 - o, y0 + rr + o)}L${P(x1 - o, y1 - rr - o)}Q${P(x1 - o, y1 - o)} ${P(x1 - rr - o, y1 - o)}L${P(x0 + rr + o, y1 - o)}Q${P(x0 + o, y1 - o)} ${P(x0 + o, y1 - rr - o)}L${P(x0 + o, y0 + rr + o)}Q${P(x0 + o, y0 + o)} ${P(x0 + rr + o, y0 + o)}Z`;
    b.fill(CM.coatOat, rp(0));
    b.fill(CM.sage, rp(4));
    b.fill(CM.shadeCool, `M${P(x0 + 10, y1 + 4)}L${P(x1 - 10, y1 + 4)}L${P(x1 - 12, y1 + 8)}L${P(x0 + 12, y1 + 8)}Z`);
  }
  // the long panel's painted castle (between the last two portholes)
  b.fill(CM.coatOat, ovalPath((PANEL.x0 + PANEL.x1) / 2, PORT_Y, (PANEL.x1 - PANEL.x0) / 2, 62));
  b.fill(CM.paper, ovalPath((PANEL.x0 + PANEL.x1) / 2, PORT_Y, (PANEL.x1 - PANEL.x0) / 2 - 5, 57));
  castleInto(b, (PANEL.x0 + PANEL.x1) / 2, PORT_Y + 4, 104);
  // the side doors: two leaves, painted roses on cream panels, brass handles and hinges
  const {x0, x1, y0, y1} = DOORS;
  const mid = (x0 + x1) / 2;
  b.rect(CM.line, x0 - 8, y0 - 8, x1 - x0 + 16, y1 - y0 + 12);
  for (const [a, c] of [[x0, mid - 2], [mid + 2, x1]] as [number, number][]) {
    b.rect(CM.brickDeep, a, y0, c - a, y1 - y0);
    b.rect(CM.coatOat, a + 12, y0 + 14, c - a - 24, y1 - y0 - 28);
    b.rect(CM.paper, a + 16, y0 + 18, c - a - 32, y1 - y0 - 36);
    bouquetInto(b, (a + c) / 2, (y0 + y1) / 2 - 18, c - a - 40, y1 - y0 - 120, `s4door${a}`);
    // a smaller posy low on each leaf
    roseInto(b, (a + c) / 2 - 18, y1 - 54, 9, CM.box, `s4posy${a}`);
    roseInto(b, (a + c) / 2 + 14, y1 - 50, 8, CM.coatMustard, `s4posy2${a}`);
    b.fill(CM.sage, leafPath((a + c) / 2 - 2, y1 - 42, 22, 6, 10));
  }
  b.fill(CM.coatMustard, ovalPath(mid - 12, (y0 + y1) / 2 + 30, 6, 6));
  b.fill(CM.coatMustard, ovalPath(mid + 12, (y0 + y1) / 2 + 30, 6, 6));
  for (const hy of [y0 + 34, y1 - 34]) {
    b.rect(CM.coatMustard, x0 - 6, hy - 4, 16, 8);
    b.rect(CM.coatMustard, x1 - 10, hy - 4, 16, 8);
  }
  // portholes: cream rim, brass ring, glass (the sky in it), curtains drawn in the dynamic layer
  for (const p of PORTS) {
    b.fill(CM.coatOat, ovalPath(p.x, PORT_Y, PORT_R + 12, PORT_R + 12));
    b.fill(CM.coatMustard, ovalPath(p.x, PORT_Y, PORT_R + 4, PORT_R + 4));
    b.fill(CM.glass, ovalPath(p.x, PORT_Y, PORT_R, PORT_R));
    if (p.plant) {
      b.poly(CM.brick, [[p.x - 16, PORT_Y + 14], [p.x + 16, PORT_Y + 14], [p.x + 12, PORT_Y + 36], [p.x - 12, PORT_Y + 36]]);
      b.fill(CM.sage, lobes(p.x - 26, p.x + 26, PORT_Y + 16, 44, 's4portplant', 4));
      b.fill(CM.leafGold, leafPath(p.x + 12, PORT_Y - 14, 18, 6, -40));
    }
    // brass dogs (the screw clamps) round the rim
    for (let k = 0; k < 4; k++) {
      const a = (k / 4) * Math.PI * 2 + 0.4;
      b.fill(CM.coatMustard, ovalPath(p.x + Math.cos(a) * (PORT_R + 9), PORT_Y + Math.sin(a) * (PORT_R + 9), 3.2, 3.2));
    }
  }
  // brass vents / pigeon boxes along the cantrail
  for (const x of [60, 560, 870, 1060]) {
    b.rect(CM.coatMustard, x - 10, CT + 8, 20, 12);
    b.rect(CM.line, x - 6, CT + 11, 12, 2);
  }
}

function cabinInk(b: Batch) {
  let d = '';
  d += line(XL, CT, XR, CT, {seed: 's4cab/top', over: 'none'});
  d += line(XL, GW, XR, GW, {seed: 's4cab/gw', over: 'none'});
  d += line(XL, WL - 1, XR, WL, {seed: 's4cab/wl', over: 'none'});
  b.ink(d, FRONT, CM.ink, 0.25);
  let m = '';
  const {x0, x1, y0, y1} = DOORS;
  m += line(x0 - 8, y0 - 8, x1 + 8, y0 - 8, {seed: 's4door/t', over: 'small'}) + line(x0 - 8, y0 - 8, x0 - 8, y1 + 4, {seed: 's4door/l', over: 'small'}) + line(x1 + 8, y0 - 8, x1 + 8, y1 + 4, {seed: 's4door/r', over: 'small'});
  m += line((x0 + x1) / 2, y0, (x0 + x1) / 2, y1, {seed: 's4door/m', over: 'none'});
  for (const p of PORTS) m += circleInk(p.x, PORT_Y, PORT_R + 12, {seed: `s4port${p.x}`});
  m += `M${P(PANEL.x0, PORT_Y)}A${r1((PANEL.x1 - PANEL.x0) / 2)} 62 0 0 1 ${P(PANEL.x1, PORT_Y)}`;
  b.ink(m, MID, CM.ink, 0.3);
}

/** Rope fenders hanging over the side from the roof rail. */
function fendersInto(b: Batch, t: number) {
  for (const [i, x] of [[0, 224], [1, 566], [2, 948]] as [number, number][]) {
    const sw = Math.sin(t * 1.1 + i * 1.9) * 1.6;
    const fy = GW - 8;
    b.ink(`M${P(x, RN - 2)}Q${P(x + 3 + sw * 0.4, (RN + fy) / 2)} ${P(x + sw, fy)}`, 3, CM.coatOat);
    b.ink(`M${P(x, RN - 2)}Q${P(x + 3 + sw * 0.4, (RN + fy) / 2)} ${P(x + sw, fy)}`, 1.2, CM.line);
    // the fender: a rope tube over the gunwale
    const fx = x + sw;
    b.fill(CM.coatOat, `M${P(fx - 14, fy)}L${P(fx + 14, fy)}Q${P(fx + 17, fy + 30)} ${P(fx + 13, fy + 62)}L${P(fx - 13, fy + 62)}Q${P(fx - 17, fy + 30)} ${P(fx - 14, fy)}Z`);
    let rope = '';
    for (let k = 1; k < 7; k++) rope += `M${P(fx - 15, fy + k * 9)}Q${P(fx, fy + k * 9 + 4)} ${P(fx + 15, fy + k * 9)}`;
    b.ink(rope, 1.3, CM.line);
    b.ink(`M${P(fx - 14, fy)}Q${P(fx - 17, fy + 30)} ${P(fx - 13, fy + 62)}`, MID, CM.ink, 0.3);
  }
}

// ---------------------------------------------------------------- the roof and its dressing

function roofInto(b: Batch) {
  // the roof top seen a little from above, a darker band at the far edge, the near edge rolled
  b.rect(CM.stucco, XL, RF, XR - XL, RN - RF);
  b.rect(CM.stoneShade, XL, RF, XR - XL, 6);
  b.rect(CM.limestone, XL, RN - 6, XR - XL, 6);
  // the grab rails (wood) on stanchions, far and near
  for (const [y, h] of [[RF + 2, 10], [RN - 8, 12]] as [number, number][]) {
    b.rect(CM.line, XL, y - h, XR - XL, 4);
    for (let x = XL + 30; x < XR; x += 120) b.rect(CM.line, x, y - h, 4, h);
  }
  // the long things on the far rail: a boat pole, a mop, a plank (from the left edge)
  b.rect(CM.coatOat, XL, RF - 18, 420, 4);
  b.rect(CM.coatMustard, 376, RF - 19, 8, 6);
  b.rect(CM.line, XL, RF - 12, 300, 6);
  b.rect(CM.brickDeep, 180, RF - 26, 160, 3.4);
  b.fill(CM.paper, `M${P(338, RF - 30)}Q${P(362, RF - 34)} ${P(372, RF - 22)}Q${P(358, RF - 16)} ${P(338, RF - 22)}Z`);
  // mushroom vents (brass), a water filler
  for (const x of [178, 640, 884]) {
    b.rect(CM.coatMustard, x - 4, RF + 22, 8, 10);
    b.fill(CM.coatMustard, domePath(x, RF + 24, 15, 10));
  }
  b.fill(CM.coatMustard, ovalPath(1050, RN - 18, 9, 3.4));
}

/** The items standing on the roof (static parts). */
function roofItemsInto(b: Batch) {
  // a coiled rope (left)
  const rx = 74;
  const ry = RN - 22;
  b.fill(CM.coatOat, ovalPath(rx, ry, 52, 15));
  b.fill(CM.line, ovalPath(rx, ry - 1, 22, 6));
  let coil = '';
  for (let k = 0; k < 4; k++) coil += `M${P(rx - 50 + k * 7, ry)}A${r1(50 - k * 7)} ${r1(14 - k * 2)} 0 0 0 ${P(rx + 50 - k * 7, ry)}`;
  b.ink(coil, 1.4, CM.line);
  b.ink(`M${P(rx - 52, ry)}A52 15 0 0 0 ${P(rx + 52, ry)}`, MID, CM.ink, 0.3);
  // a watering can
  const cx = 222;
  const cy = RN - 14;
  b.poly(CM.coatSlate, [[cx - 22, cy], [cx - 20, cy - 36], [cx + 18, cy - 36], [cx + 20, cy]]);
  b.poly(CM.coatSlate, [[cx + 18, cy - 24], [cx + 54, cy - 52], [cx + 56, cy - 46], [cx + 18, cy - 14]]);
  b.fill(CM.coatSlate, ovalPath(cx + 57, cy - 50, 7, 4));
  b.ink(`M${P(cx - 14, cy - 36)}Q${P(cx, cy - 58)} ${P(cx + 12, cy - 36)}`, 2.6, CM.coatSlate);
  b.ink(`M${P(cx - 22, cy)}L${P(cx - 20, cy - 36)}L${P(cx + 18, cy - 36)}`, MID, CM.ink, 0.3);
  // the folded bike under her (low): two small wheels and the folded frame
  const bx = 708;
  const by = RN - 12;
  b.layer();
  bikeInto(b, bx, by, 24, 's4fold', CM.brickDeep, -1);
  // a solar panel lying flat behind it (low)
  b.poly(CM.paneUnlit, [[600, RF + 16], [690, RF + 16], [694, RF + 34], [596, RF + 34]]);
  let sp = '';
  for (let k = 1; k < 5; k++) sp += `M${P(600 + k * 18, RF + 16)}L${P(598 + k * 19, RF + 34)}`;
  sp += `M${P(598, RF + 25)}L${P(692, RF + 25)}`;
  b.ink(sp, 0.9, CM.glass);
  // a lifebuoy leaning on the chimney's stay
  const lx = 862;
  const ly = RN - 40;
  for (let q = 0; q < 4; q++) {
    const a0 = (q * Math.PI) / 2 + 0.3;
    const a1 = a0 + Math.PI / 2;
    const R = 30;
    const ri = 16;
    b.fill(q % 2 ? CM.paper : CM.box, `M${P(lx + Math.cos(a0) * R, ly + Math.sin(a0) * R)}A${R} ${R} 0 0 1 ${P(lx + Math.cos(a1) * R, ly + Math.sin(a1) * R)}L${P(lx + Math.cos(a1) * ri, ly + Math.sin(a1) * ri)}A${ri} ${ri} 0 0 0 ${P(lx + Math.cos(a0) * ri, ly + Math.sin(a0) * ri)}Z`);
  }
  b.ink(circleInk(lx, ly, 30, {seed: 's4roofbuoy'}), MID, CM.ink);
  // the stove chimney: a plum pipe, a brass band, its coolie hat; the chain
  const chx = 944;
  b.rect(CM.anchor, chx - 10, RF - 96, 20, RN - 16 - (RF - 96));
  b.rect(CM.coatMustard, chx - 11, RF - 64, 22, 7);
  b.rect(CM.coatMustard, chx - 13, RN - 22, 26, 8);
  b.poly(CM.anchor, [[chx - 24, RF - 96], [chx, RF - 112], [chx + 24, RF - 96]]);
  b.rect(CM.anchor, chx - 2, RF - 100, 4, 6);
  b.ink(line(chx - 10, RN - 18, chx - 10, RF - 96, {seed: 's4chim', over: 'small'}), MID, CM.ink);
  // the log pile and a coal sack (cut by the right edge)
  const lgx = 1000;
  for (let k = 0; k < 9; k++) {
    const col = k % 3;
    const row = Math.floor(k / 3);
    const x = lgx + col * 26 + (row % 2) * 13;
    const y = RN - 14 - row * 22;
    b.fill(CM.line, ovalPath(x, y, 13, 11));
    b.fill(row === 1 ? CM.leafGold : CM.coatOat, ovalPath(x, y, 9, 7.6));
    b.ink(circleInk(x, y, 4, {seed: `s4log${k}`}), 0.9, CM.line);
  }
  b.poly(CM.coatSlate, [[1064, RN - 8], [1070, RN - 58], [1112, RN - 62], [1120, RN - 8]]);
}

/** Herb pots: terracotta, the herbs leaning east and fluttering; the ones by Pip flinch when it lands. */
const HERBS: {x: number; base: number; w: number; kind: 'rosemary' | 'basil' | 'chives' | 'thyme'; flinch: boolean}[] = [
  {x: 292, base: RN - 14, w: 34, kind: 'rosemary', flinch: false},
  {x: 338, base: RN - 24, w: 30, kind: 'basil', flinch: true},
  {x: 382, base: RN - 12, w: 30, kind: 'chives', flinch: true},
  {x: 556, base: RN - 20, w: 30, kind: 'thyme', flinch: true},
  {x: 600, base: RN - 10, w: 34, kind: 'basil', flinch: true},
];

function herbsInto(b: Batch, t: number) {
  const land = t - S4_BEATS.pipLand;
  const fl = land > 0 && land < 0.7 ? Math.sin(land * 30) * 6 * Math.exp(-land * 5) : 0;
  HERBS.forEach((h, i) => {
    const {x, base, w} = h;
    const sway = WIND * (2.2 + Math.sin(t * 3.1 + i * 1.7) * 2.0 + Math.sin(t * 7.3 + i) * 0.8) + (h.flinch ? fl : 0);
    const ph = w * 0.9;
    b.poly(CM.brick, [[x - w / 2, base - ph], [x + w / 2, base - ph], [x + w * 0.38, base], [x - w * 0.38, base]]);
    b.rect(CM.brickDeep, x - w / 2 - 2, base - ph - 2, w + 4, 6);
    const top = base - ph - 2;
    if (h.kind === 'basil') {
      b.fill(CM.sage, `M${P(x - w * 0.62, top)}Q${P(x - w * 0.7 + sway * 0.6, top - w * 0.9)} ${P(x + sway, top - w * 1.2)}Q${P(x + w * 0.7 + sway * 0.6, top - w * 0.9)} ${P(x + w * 0.62, top)}Z`);
      for (let k = 0; k < 5; k++) b.fill(k % 2 ? CM.sage : CM.leafGold, leafPath(x - w * 0.3 + k * w * 0.15 + sway * 0.8, top - w * (0.5 + (k % 3) * 0.2), w * 0.36, w * 0.14, -30 + k * 20 + sway * 4));
    } else {
      // spiky herbs: blades fluttering east
      let d = '';
      const n = h.kind === 'chives' ? 11 : 8;
      for (let k = 0; k < n; k++) {
        const bx = x - w * 0.36 + (w * 0.72 * k) / (n - 1);
        const L = w * (h.kind === 'rosemary' ? 1.4 : h.kind === 'chives' ? 1.25 : 0.8) * (0.75 + ((k * 37) % 10) / 30);
        const tip = sway * (0.6 + (k % 3) * 0.25);
        d += `M${P(bx, top)}Q${P(bx + tip * 0.4, top - L * 0.5)} ${P(bx + tip, top - L)}`;
      }
      b.ink(d, h.kind === 'thyme' ? 2.6 : 2.2, h.kind === 'thyme' ? CM.leafGold : CM.sage);
      if (h.kind === 'chives') for (let k = 0; k < 3; k++) b.fill(CM.blossom, ovalPath(x - w * 0.3 + k * w * 0.3 + sway * 0.8, top - w * 1.1 - (k % 2) * 6, 4, 4));
      if (h.kind === 'rosemary') for (let k = 0; k < 6; k++) b.fill(CM.sage, leafPath(x - w * 0.3 + k * w * 0.12 + sway * 0.5, top - w * (0.4 + (k % 3) * 0.3), 8, 2.4, -70 + sway * 6));
    }
    b.ink(`M${P(x - w / 2 - 2, base - ph - 2)}L${P(x - w * 0.38, base)}L${P(x + w * 0.38, base)}`, MID * 0.7, CM.ink, 0.3);
  });
}

/** Curtains in the portholes: tied back, swaying with the boat. */
function curtainsInto(b: Batch, t: number) {
  PORTS.forEach((p, i) => {
    const sw = Math.sin(t * 1.25 + i * 1.3) * 3.2 + Math.sin(t * 2.9 + i) * 1.1;
    const R = PORT_R;
    const c = p.curtain;
    const x = p.x;
    const y = PORT_Y;
    b.fill(c, `M${P(x - R * 0.98, y - R * 0.3)}Q${P(x - R * 0.5, y - R * 1.0)} ${P(x - R * 0.12 + sw, y - R * 0.6)}Q${P(x - R * 0.42 + sw * 0.6, y)} ${P(x - R * 0.3 + sw * 0.3, y + R * 0.7)}L${P(x - R * 0.8, y + R * 0.6)}Z`);
    if (!p.plant) b.fill(c, `M${P(x + R * 0.98, y - R * 0.3)}Q${P(x + R * 0.5, y - R * 1.0)} ${P(x + R * 0.12 + sw, y - R * 0.6)}Q${P(x + R * 0.42 + sw * 0.6, y)} ${P(x + R * 0.3 + sw * 0.3, y + R * 0.7)}L${P(x + R * 0.8, y + R * 0.6)}Z`);
    b.rect(CM.coatMustard, x - R * 0.9, y - R * 0.66, R * 1.8, 3);
  });
}

/** The stove's smoke: a long puff train blown east (it never rises above y 590 world). */
function smokeInto(b: Batch, t: number) {
  const x = 944;
  const y = RF - 112;
  const ps = puffs(t, {n: 8, life: 3.8, rise: 360, drift: WIND * 170, r0: 8, r1: 25, wobble: 7, seed: 's4boatsmoke', ceil: ROW.ceil}, y);
  ps.forEach((p, i) => b.fill(p.k < 0.35 ? CM.stoneShade : i % 2 ? CM.paving : CM.limestone, ovalPath(x + p.x, y + p.y, p.r, p.r * 0.84)));
}

// ---------------------------------------------------------------- the near water (2.0x)

const [NX0, NX1] = PLANE_X(2);
const NY0 = WL;
const NY1 = 1940;

/** What hangs over the near water at each screen x (for the hull's broken reflection). */
const reflColour = (sx: number): string => {
  for (const p of PORTS) if (Math.abs(sx - p.x) < PORT_R + 10) return CM.coatOat;
  if (sx > DOORS.x0 && sx < DOORS.x1) return CM.brickDeep;
  return CM.sage;
};

function nearWaterInto(b: Batch, t: number) {
  const dx = s4PlaneDx(S4_K.near, t);
  const spd = s4PathSpeed(t) / 110.7; // 1 while trucking, falls to 0 at the stop
  const r = rng('s4near');
  b.rect(CM.water, XL, NY0, XR - XL, NY1 - NY0);
  // the hull's reflection right under the waterline: slate, then the plum stripe, then the sage cabin, broken
  const rows: [number, string | null, number][] = [
    [NY0 + 4, CM.paneUnlit, 0.95],
    [NY0 + 12, CM.paneUnlit, 0.9],
    [NY0 + 21, CM.paneUnlit, 0.8],
    [NY0 + 31, CM.anchor, 0.7],
    [NY0 + 41, null, 0.6],
    [NY0 + 53, null, 0.48],
    [NY0 + 67, null, 0.36],
    [NY0 + 83, null, 0.26],
  ];
  rows.forEach(([yy, col, keep], k) => {
    // dashes laid out in the water plane (they stream with it), coloured by what is above them on screen
    let px = NX0 + r.range(0, 30);
    while (px < NX1) {
      const len = r.range(26, 70) * (0.5 + keep * 0.6);
      const sx = px + dx;
      if (sx > XL && sx < XR && r.chance(0.25 + keep * 0.65)) {
        const c = col ?? reflColour(sx + len / 2);
        const h = 4 + k * 0.6;
        const wob = Math.sin(t * 1.6 + k + px * 0.01) * 2;
        b.fill(c, `M${P(sx + wob, yy)}L${P(sx + len + wob, yy)}L${P(sx + len - 3 + wob, yy + h)}L${P(sx + 3 + wob, yy + h)}Z`);
      } else r.next();
      px += len + r.range(10, 34) * (1.4 - keep * 0.7);
    }
  });
  b.layer();
  // ripples and wake lines streaming right; the wake fades to small calm ripples after the stop
  for (let i = 0; i < 40; i++) {
    const v = r.next();
    const yy = NY0 + 30 + v * (NY1 - NY0 - 36);
    const s = lerp(1.0, 2.0, v);
    const w = r.range(30, 90) * s;
    const px = r.range(NX0, NX1);
    const sx = NX0 + frac((px + dx + 7 * t - NX0) / (NX1 - NX0)) * (NX1 - NX0);
    const hh = 2.4 * s;
    b.fill(CM.waterDeep, `M${P(sx - w / 2, yy)}Q${P(sx, yy - hh)} ${P(sx + w / 2, yy)}Q${P(sx, yy + hh)} ${P(sx - w / 2, yy)}Z`);
  }
  // wake: diagonal paper streaks spreading from under the hull, streaming right (only while we move)
  const wk = Math.max(0, spd);
  for (let i = 0; i < 14; i++) {
    const per = r.range(1.6, 2.4);
    const ph = r.next();
    const u = frac(t / per + ph);
    const x0 = r.range(-200, 1000);
    const sx = x0 + u * 360 * (0.4 + wk * 0.6);
    const sy = NY0 + 8 + u * r.range(40, 150);
    const L = (40 + 60 * u) * (0.35 + wk * 0.65);
    const th = 2.6 * (1 - u * 0.6);
    if (L < 8) continue;
    b.fill(CM.paper, `M${P(sx, sy)}L${P(sx + L, sy + L * 0.16)}L${P(sx + L - 2, sy + L * 0.16 + th)}L${P(sx - 2, sy + th)}Z`);
  }
  // glints
  for (let i = 0; i < 18; i++) {
    const v = r.next();
    const yy = NY0 + 24 + v * (NY1 - NY0 - 30);
    const per = r.range(1.2, 2.6);
    const on = frac(t / per + r.next()) < 0.4;
    const s = lerp(1.2, 2.0, v);
    const x = r.range(XL, XR) + Math.sin(t * 0.9 + i) * 8;
    if (on) b.fill(CM.paper, `M${P(x - 10 * s, yy)}L${P(x + 10 * s, yy - 1)}L${P(x + 8 * s, yy + 2.4 * s)}L${P(x - 8 * s, yy + 2.4 * s)}Z`);
  }
  // floating leaves riding the near water (2.0x), bobbing
  for (let i = 0; i < 12; i++) {
    const y = r.range(NY0 + 40, NY1 - 20);
    const s = lerp(14, 22, (y - NY0) / (NY1 - NY0));
    const px = r.range(NX0, NX1);
    const sx = NX0 + frac((px + dx + 9 * t - NX0) / (NX1 - NX0)) * (NX1 - NX0);
    b.fill([CM.leafGold, CM.leafRust, CM.coatMustard][i % 3], leafPath(sx, y + Math.sin(t * 1.4 + i) * 1.6, s, s * 0.26, r.range(-30, 30) + Math.sin(t + i) * 8));
  }
}

// ---------------------------------------------------------------- the boat

export const Boat: React.FC = () => {
  const t = useTime();
  const bob = boatBob(t);
  const stat = useMemo(() => {
    const b = new Batch();
    cabinInto(b);
    b.layer();
    roofInto(b);
    b.layer();
    roofItemsInto(b);
    b.layer();
    cabinInk(b);
    return b;
  }, []);
  const water = new Batch();
  nearWaterInto(water, t);
  const dyn = new Batch();
  curtainsInto(dyn, t);
  dyn.layer();
  fendersInto(dyn, t);
  dyn.layer();
  herbsInto(dyn, t);
  const smoke = new Batch();
  smokeInto(smoke, t);
  return (
    <>
      <Paint b={water} seed="s4nearWater" misreg={false} />
      <XG m={mat.translate(0, bob)}>
        <Paint b={stat} seed="s4boatSt" />
        <Paint b={dyn} seed="s4boatDyn" />
      </XG>
      <Paint b={smoke} seed="s4boatSmoke" misreg={false} />
    </>
  );
};

export {clamp01};
export type {Pt};
