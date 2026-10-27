// V2S4_wboat.tsx (lane L3, V2S4 WORLD helpers): OUR NARROWBOAT, the bottom third, screen-fixed (it glides with the
// camera), and the NEAR WATER below it (the 2.0x plane). Same boat, same livery as V2S3's moored boat: a sage cabin,
// ONE plum gunwale stripe, cream portholes, the painted flower panel, herb pots, a bike, a coiled rope.
//   roof (y 1222-1290, seen a little from above): grab rails on stanchions; on it, back to front: a boat pole, a mop
//        and a plank on the far rail, brass mushroom vents, a coiled rope, a watering can, a bucket, herb pots (they
//        flutter east, and flinch when Pip lands at 14.95), Pip's clear spot x 410-530, a solar panel and a folded bike
//        (low: never above y 1090 under her), a lifebuoy, the stove chimney (smoke blown east), a log pile, a coal sack
//   cabin side (y 1290-1640): a brick cantrail painted with diamonds and brass vents, cream coach lines framing the
//        sage panels, portholes (cream rims, brass rings and dogs, curtains that sway; a pot plant behind one), a
//        window box, the side doors painted with roses (no lettering) with brass handles, a castle panel; rope
//        fenders hanging from the roof rail over the side
//   hull: the ONE plum gunwale stripe, a slate strip with a rubbing strake down to the waterline ~1700
//   near water (2.0x): the hull's broken reflection (slate, plum, sage, the portholes' cream), a foam line along the
//        hull, diverging wake lines and ripples streaming right, glints, leaves; after the stop the wake calms, the
//        water never stops
// The whole boat bobs with Pip's ride (kit/pip rideAt(t, 1.6, 0.55): the same bob, so Pip stays seated on it).
// Batch z-order inside one layer follows each colour's FIRST use, so every stacking step opens a new layer.
import React, {useMemo} from 'react';
import {CM, INK_PX} from '../palette';
import {useTime} from '../../lib/time';
import {XG, mat} from '../../lib/xf';
import {line, circle as circleInk} from '../../lib/sketch';
import {Batch, Paint, P, rng, ovalPath, domePath, lobes, leafPath, lerp, frac, r1, Pt} from '../kit/canal/core';
import {bikeInto} from '../kit/canal/towpath';
import {puffs} from '../../v3/film/kit/idle';
import {rideAt} from '../kit/pip/motion';
import {S4_BEATS, s4PathSpeed, s4PlaneDx, S4_K, S4_TRUCK} from './V2S4_rig';
import {ROW, PLANE_X, WIND, clamp01, CLEAN, WINK} from './V2S4_wcore';

const FRONT = INK_PX.front;
const MID = INK_PX.mid;
const RF = ROW.roofFar; // 1222: the roof's far edge
const RN = 1284; // the roof's near edge (the rolled lip runs to the cabin top)
const CT = ROW.cabinTop; // 1290
const GW = ROW.gunwale; // 1640
const WL = ROW.waterline; // 1700
const XL = -40;
const XR = 1120;

/** The bob shared with Pip's ride. */
export const boatBob = (t: number) => rideAt(t, 1.6, 0.55).dy;

/** A rounded-rect RING (outer clockwise, inner counter-clockwise: a hole under the nonzero rule). */
function ringRR(x0: number, y0: number, x1: number, y1: number, r: number, w: number): string {
  const rr = (a: number, b: number, c: number, d: number, k: number, ccw: boolean) => {
    if (!ccw) return `M${P(a + k, b)}L${P(c - k, b)}Q${P(c, b)} ${P(c, b + k)}L${P(c, d - k)}Q${P(c, d)} ${P(c - k, d)}L${P(a + k, d)}Q${P(a, d)} ${P(a, d - k)}L${P(a, b + k)}Q${P(a, b)} ${P(a + k, b)}Z`;
    return `M${P(a + k, b)}Q${P(a, b)} ${P(a, b + k)}L${P(a, d - k)}Q${P(a, d)} ${P(a + k, d)}L${P(c - k, d)}Q${P(c, d)} ${P(c, d - k)}L${P(c, b + k)}Q${P(c, b)} ${P(c - k, b)}Z`;
  };
  return rr(x0, y0, x1, y1, r, false) + rr(x0 + w, y0 + w, x1 - w, y1 - w, Math.max(1, r - w), true);
}

// ---------------------------------------------------------------- cabin side, hull

const PORT_Y = 1446;
const PORT_R = 40;
const PORTS = [
  {x: -14, curtain: CM.coatMustard},
  {x: 128, curtain: CM.box},
  {x: 612, curtain: CM.leafRust, plant: true},
  {x: 740, curtain: CM.blossom, box: true},
  {x: 1022, curtain: CM.coatMustard},
];
const DOORS = {x0: 270, x1: 514, y0: 1336, y1: 1622};
const CASTLE = {x: 890, y: PORT_Y + 2, rx: 66, ry: 62};

function roseInto(b: Batch, x: number, y: number, R: number, c: string, seed: string, swirl: string[]) {
  const r = rng(seed);
  b.fill(c, ovalPath(x, y, R, R * 0.86));
  let d = '';
  for (let k = 0; k < 3; k++) {
    const a = r.range(0, 6.28);
    d += `M${P(x + Math.cos(a) * R * 0.2, y + Math.sin(a) * R * 0.18)}A${r1(R * 0.62)} ${r1(R * 0.5)} 0 0 1 ${P(x + Math.cos(a + 2.2) * R * 0.72, y + Math.sin(a + 2.2) * R * 0.6)}`;
  }
  swirl.push(d);
}

function cabinInto(b: Batch) {
  // L0: the hull, the cabin side, the cantrail, the stripe
  b.rect(CM.paneUnlit, XL, GW + 12, XR - XL, WL - GW - 8);
  b.rect(CM.sage, XL, CT, XR - XL, GW - CT + 2);
  b.rect(CM.brickDeep, XL, CT, XR - XL, 30);
  b.rect(CM.anchor, XL, GW, XR - XL, 16);
  b.layer();
  // L1: lines and bands on those: the coach lines, the strake, the waterline lip, the stripe's mustard edge
  b.rect(CM.coatOat, XL, CT + 30, XR - XL, 3.5);
  b.rect(CM.coatMustard, XL, GW + 15, XR - XL, 2.5);
  b.rect(CM.shadeCool, XL, GW + 36, XR - XL, 5);
  b.rect(CM.waterDeep, XL, WL - 3, XR - XL, 5);
  b.rect(CM.stoneShade, XL, GW - 8, XR - XL, 8);
  // cream coach-line frames round the sage panels
  for (const [x0, x1] of [[-30, 238], [532, 828], [956, 1160]] as [number, number][]) b.fill(CM.coatOat, ringRR(x0, CT + 50, x1, GW - 24, 18, 4));
  // diamonds painted along the cantrail
  for (let x = 20; x < XR; x += 58) {
    const c = Math.round(x / 58) % 2 ? CM.coatMustard : CM.paper;
    b.poly(c, [[x, CT + 7], [x + 9, CT + 15], [x, CT + 23], [x - 9, CT + 15]]);
  }
  // T-studs on the gunwale
  for (const x of [52, 588, 1066]) {
    b.rect(CM.anchor, x - 5, GW - 14, 10, 14);
    b.rect(CM.anchor, x - 10, GW - 18, 20, 5);
  }
  // the beading moulding above the gunwale, rivets along the hull
  b.rect(CM.limestone, XL, GW - 20, XR - XL, 3);
  b.rect(CM.shadeCool, XL, GW - 17, XR - XL, 2);
  for (let x = XL + 8; x < XR; x += 22) b.fill(CM.shadeCool, ovalPath(x, GW + 27, 2.2, 2.2));
  // a boat hook clipped along the cabin side under the cantrail (brass clips, the hook at its end)
  b.rect(CM.line, XL, CT + 38, 290, 6);
  b.layer();
  for (const x of [26, 190]) b.rect(CM.coatMustard, x - 4, CT + 36, 8, 10);
  b.ink(`M${P(250, CT + 41)}L${P(262, CT + 41)}Q${P(272, CT + 41)} ${P(272, CT + 49)}Q${P(272, CT + 56)} ${P(264, CT + 55)}`, 2.6, CM.coatMustard);
  b.layer();
  // L2: porthole rims, the door frame, the castle oval, the window box
  for (const p of PORTS) b.fill(CM.coatOat, ovalPath(p.x, PORT_Y, PORT_R + 12, PORT_R + 12));
  const {x0, x1, y0, y1} = DOORS;
  b.rect(CM.line, x0 - 9, y0 - 9, x1 - x0 + 18, y1 - y0 + 12);
  b.fill(CM.coatOat, ovalPath(CASTLE.x, CASTLE.y, CASTLE.rx + 6, CASTLE.ry + 6));
  b.layer();
  // L3: brass rings, the door leaves, the castle's paper ground
  for (const p of PORTS) b.fill(CM.coatMustard, ovalPath(p.x, PORT_Y, PORT_R + 4, PORT_R + 4));
  const mid = (x0 + x1) / 2;
  b.rect(CM.brickDeep, x0, y0, mid - 2 - x0, y1 - y0);
  b.rect(CM.brickDeep, mid + 2, y0, x1 - mid - 2, y1 - y0);
  b.fill(CM.stucco, ovalPath(CASTLE.x, CASTLE.y, CASTLE.rx, CASTLE.ry));
  b.layer();
  // L4: glass, the door panels (cream border), the castle's lake and hills
  for (const p of PORTS) b.fill(CM.glass, ovalPath(p.x, PORT_Y, PORT_R, PORT_R));
  for (const [a, c] of [[x0, mid - 2], [mid + 2, x1]] as [number, number][]) b.fill(CM.coatMustard, ringRR(a + 10, y0 + 12, c - 10, y1 - 12, 10, 3));
  for (const [a, c] of [[x0, mid - 2], [mid + 2, x1]] as [number, number][]) b.rect(CM.stucco, a + 14, y0 + 16, c - a - 28, y1 - y0 - 32);
  const cs = CASTLE.rx / 50;
  b.fill(CM.water, `M${P(CASTLE.x - 46 * cs, CASTLE.y + 26 * cs)}Q${P(CASTLE.x, CASTLE.y + 18 * cs)} ${P(CASTLE.x + 46 * cs, CASTLE.y + 26 * cs)}Q${P(CASTLE.x, CASTLE.y + 44 * cs)} ${P(CASTLE.x - 46 * cs, CASTLE.y + 26 * cs)}Z`);
  b.fill(CM.sage, lobes(CASTLE.x - 50 * cs, CASTLE.x - 8 * cs, CASTLE.y + 24 * cs, 18 * cs, 'castleHillA', 2));
  b.fill(CM.sage, lobes(CASTLE.x + 10 * cs, CASTLE.x + 50 * cs, CASTLE.y + 24 * cs, 15 * cs, 'castleHillB', 2));
  b.layer();
  // L5: what sits on the glass and the panels: the plant behind a porthole, the castle, the bouquets
  const sw: string[] = [];
  for (const p of PORTS) {
    b.poly(CM.paneUnlit, [[p.x - PORT_R * 0.7, PORT_Y - PORT_R * 0.72], [p.x + PORT_R * 0.1, PORT_Y - PORT_R * 0.98], [p.x - PORT_R * 0.98, PORT_Y + PORT_R * 0.1]]);
    if (p.plant) {
      b.poly(CM.brick, [[p.x - 15, PORT_Y + 12], [p.x + 15, PORT_Y + 12], [p.x + 11, PORT_Y + 34], [p.x - 11, PORT_Y + 34]]);
      b.fill(CM.leafGold, leafPath(p.x + 12, PORT_Y - 14, 18, 6, -40));
    }
  }
  b.rect(CM.brickLight, CASTLE.x - 22 * cs, CASTLE.y - 8 * cs, 44 * cs, 30 * cs);
  b.rect(CM.brickLight, CASTLE.x - 27 * cs, CASTLE.y - 24 * cs, 12 * cs, 46 * cs);
  b.rect(CM.brickLight, CASTLE.x + 15 * cs, CASTLE.y - 20 * cs, 12 * cs, 42 * cs);
  b.poly(CM.brick, [[CASTLE.x - 29 * cs, CASTLE.y - 24 * cs], [CASTLE.x - 21 * cs, CASTLE.y - 37 * cs], [CASTLE.x - 13 * cs, CASTLE.y - 24 * cs]]);
  b.poly(CM.brick, [[CASTLE.x + 13 * cs, CASTLE.y - 20 * cs], [CASTLE.x + 21 * cs, CASTLE.y - 33 * cs], [CASTLE.x + 29 * cs, CASTLE.y - 20 * cs]]);
  for (const [a, c] of [[x0, mid - 2], [mid + 2, x1]] as [number, number][]) {
    const cx = (a + c) / 2;
    const cy = (y0 + y1) / 2 - 22;
    const w = c - a - 40;
    for (let k = 0; k < 8; k++) {
      const an = (k / 8) * Math.PI * 2 + 0.3;
      b.fill(CM.sage, leafPath(cx + Math.cos(an) * w * 0.32, cy + Math.sin(an) * w * 0.36, w * 0.32, w * 0.1, (an * 180) / Math.PI));
    }
    b.fill(CM.sage, leafPath(cx - 6, y1 - 46, 26, 7, 14));
    b.fill(CM.sage, leafPath(cx + 14, y1 - 52, 22, 6, -30));
  }
  b.layer();
  // L6: roses (over the leaves), the castle's door and lit windows, the plant's leaves
  for (const [a, c] of [[x0, mid - 2], [mid + 2, x1]] as [number, number][]) {
    const cx = (a + c) / 2;
    const cy = (y0 + y1) / 2 - 22;
    const w = c - a - 40;
    roseInto(b, cx, cy, w * 0.18, CM.brick, `s4rose${a}a`, sw);
    roseInto(b, cx - w * 0.24, cy + w * 0.2, w * 0.12, CM.box, `s4rose${a}b`, sw);
    roseInto(b, cx + w * 0.24, cy + w * 0.16, w * 0.12, CM.blossom, `s4rose${a}c`, sw);
    roseInto(b, cx + w * 0.05, cy - w * 0.28, w * 0.1, CM.coatMustard, `s4rose${a}d`, sw);
    roseInto(b, cx - 16, y1 - 56, 10, CM.box, `s4posy${a}`, sw);
    roseInto(b, cx + 16, y1 - 60, 9, CM.coatMustard, `s4posy2${a}`, sw);
    // daisies
    const rr = rng(`s4daisy${a}`);
    for (let k = 0; k < 4; k++) {
      const dx = cx + rr.range(-w * 0.38, w * 0.38);
      const dy = cy + rr.range(-w * 0.1, w * 0.5);
      for (let q = 0; q < 5; q++) b.fill(CM.paper, ovalPath(dx + Math.cos((q * 6.28) / 5) * 3.6, dy + Math.sin((q * 6.28) / 5) * 3.6, 2.6, 2.6));
    }
  }
  b.rect(CM.anchor, CASTLE.x - 4 * cs, CASTLE.y + 8 * cs, 8 * cs, 14 * cs);
  b.rect(CM.lamp, CASTLE.x - 23 * cs, CASTLE.y - 16 * cs, 4 * cs, 5 * cs);
  b.rect(CM.lamp, CASTLE.x + 19 * cs, CASTLE.y - 12 * cs, 4 * cs, 5 * cs);
  const pp = PORTS.find((p) => p.plant)!;
  b.fill(CM.sage, lobes(pp.x - 26, pp.x + 26, PORT_Y + 14, 44, 's4portplant', 4));
  // brass: the door knobs, hinges, porthole dogs, cantrail vents
  for (const hy of [y0 + 36, y1 - 36]) {
    b.rect(CM.coatMustard, x0 - 7, hy - 4, 16, 8);
    b.rect(CM.coatMustard, x1 - 9, hy - 4, 16, 8);
  }
  b.fill(CM.coatMustard, ovalPath(mid - 12, (y0 + y1) / 2 + 34, 6, 6));
  b.fill(CM.coatMustard, ovalPath(mid + 12, (y0 + y1) / 2 + 34, 6, 6));
  for (const p of PORTS) {
    for (let k = 0; k < 4; k++) {
      const a = (k / 4) * Math.PI * 2 + 0.4;
      b.fill(CM.coatMustard, ovalPath(p.x + Math.cos(a) * (PORT_R + 8), PORT_Y + Math.sin(a) * (PORT_R + 8), 3.4, 3.4));
    }
  }
  for (const x of [196, 566, 956]) {
    b.rect(CM.coatMustard, x - 12, CT + 6, 24, 15);
    b.rect(CM.line, x - 8, CT + 10, 16, 2.2);
    b.rect(CM.line, x - 8, CT + 14, 16, 2.2);
  }
  // a window box under one porthole: a wooden trough of flowers trailing
  const wb = PORTS.find((p) => p.box)!;
  b.rect(CM.line, wb.x - 50, PORT_Y + 64, 100, 22);
  b.rect(CM.brickDeep, wb.x - 52, PORT_Y + 62, 104, 5);
  b.layer();
  b.fill(CM.leafGold, lobes(wb.x - 54, wb.x + 54, PORT_Y + 64, 30, 's4wbox', 5));
  b.fill(CM.leafRust, leafPath(wb.x - 46, PORT_Y + 92, 22, 6, 70));
  b.fill(CM.leafGold, leafPath(wb.x + 42, PORT_Y + 96, 26, 6, 100));
  b.fill(CM.leafRust, leafPath(wb.x - 30, PORT_Y + 98, 18, 5, 80));
  b.layer();
  for (let k = 0; k < 7; k++) b.fill([CM.box, CM.blossom, CM.paper, CM.coatMustard][k % 4], ovalPath(wb.x - 42 + k * 14, PORT_Y + 46 + (k % 3) * 6, 5, 4.6));
  b.ink(lobes(wb.x - 54, wb.x + 54, PORT_Y + 64, 30, 's4wbox', 5).replace(/Z$/, ''), 1.4, CM.ink, 0.35);
  b.ink(sw.join(''), 1.4, CM.ink);
}

function cabinInk(b: Batch) {
  b.layer();
  let d = '';
  d += line(XL, CT, XR, CT, {...CLEAN, seed: 's4cab/top'});
  d += line(XL, GW, XR, GW, {...CLEAN, seed: 's4cab/gw'});
  b.ink(d, WINK.boat, CM.ink, 0.1);
  let m = '';
  const {x0, x1, y0, y1} = DOORS;
  m += line(x0 - 9, y0 - 9, x1 + 9, y0 - 9, {...CLEAN, seed: 's4door/t'}) + line(x0 - 9, y0 - 9, x0 - 9, y1 + 3, {...CLEAN, seed: 's4door/l'}) + line(x1 + 9, y0 - 9, x1 + 9, y1 + 3, {...CLEAN, seed: 's4door/r'});
  m += line((x0 + x1) / 2, y0, (x0 + x1) / 2, y1, {...CLEAN, seed: 's4door/m'});
  for (const p of PORTS) m += circleInk(p.x, PORT_Y, PORT_R + 12, {seed: `s4port${p.x}`, wobble: 0.004});
  m += `M${P(CASTLE.x - CASTLE.rx - 6, CASTLE.y)}A${r1(CASTLE.rx + 6)} ${r1(CASTLE.ry + 6)} 0 0 1 ${P(CASTLE.x + CASTLE.rx + 6, CASTLE.y)}`;
  b.ink(m, WINK.boatFine, CM.ink, 0.12);
}

/** Rope fenders hanging over the side from the roof rail (they swing a little with the boat). */
function fendersInto(b: Batch, t: number) {
  const spots: [number, number][] = [[0, 236], [1, 548], [2, 966]];
  const fy = GW - 10;
  for (const [i, x] of spots) {
    const sw = Math.sin(t * 1.1 + i * 1.9) * 1.8;
    b.ink(`M${P(x, RN - 4)}Q${P(x + 3 + sw * 0.4, (RN + fy) / 2)} ${P(x + sw, fy)}`, 3.4, CM.coatOat);
  }
  b.layer();
  for (const [, x] of spots) b.ink(`M${P(x - 1, RN - 4)}L${P(x - 1, RN + 8)}`, 1.2, CM.line);
  b.layer();
  const rope: string[] = [];
  for (const [i, x] of spots) {
    const sw = Math.sin(t * 1.1 + i * 1.9) * 1.8;
    const fx = x + sw;
    b.fill(CM.coatOat, `M${P(fx - 15, fy)}L${P(fx + 15, fy)}Q${P(fx + 18, fy + 32)} ${P(fx + 14, fy + 64)}L${P(fx - 14, fy + 64)}Q${P(fx - 18, fy + 32)} ${P(fx - 15, fy)}Z`);
    let rp = '';
    for (let k = 1; k < 7; k++) rp += `M${P(fx - 16, fy + k * 9)}Q${P(fx, fy + k * 9 + 4)} ${P(fx + 16, fy + k * 9)}`;
    rope.push(rp);
    b.ink(`M${P(fx - 15, fy)}Q${P(fx - 18, fy + 32)} ${P(fx - 14, fy + 64)}`, WINK.boatFine, CM.ink, 0.1);
  }
  b.ink(rope.join(''), 1.3, CM.line);
}

/** Curtains in the portholes: tied back, swaying with the boat. */
function curtainsInto(b: Batch, t: number) {
  PORTS.forEach((p, i) => {
    const sw = Math.sin(t * 1.25 + i * 1.3) * 3.4 + Math.sin(t * 2.9 + i) * 1.2;
    const R = PORT_R;
    const x = p.x;
    const y = PORT_Y;
    b.fill(p.curtain, `M${P(x - R * 0.98, y - R * 0.3)}Q${P(x - R * 0.5, y - R * 1.02)} ${P(x - R * 0.14 + sw, y - R * 0.62)}Q${P(x - R * 0.44 + sw * 0.6, y)} ${P(x - R * 0.32 + sw * 0.3, y + R * 0.72)}L${P(x - R * 0.82, y + R * 0.6)}Z`);
    if (!p.plant) b.fill(p.curtain, `M${P(x + R * 0.98, y - R * 0.3)}Q${P(x + R * 0.5, y - R * 1.02)} ${P(x + R * 0.14 + sw, y - R * 0.62)}Q${P(x + R * 0.44 + sw * 0.6, y)} ${P(x + R * 0.32 + sw * 0.3, y + R * 0.72)}L${P(x + R * 0.82, y + R * 0.6)}Z`);
  });
  b.layer();
  for (const p of PORTS) b.rect(CM.coatMustard, p.x - PORT_R * 0.9, PORT_Y - PORT_R * 0.68, PORT_R * 1.8, 3);
}

// ---------------------------------------------------------------- the roof and its dressing

function roofInto(b: Batch) {
  // L0: the roof top seen a little from above; the rolled near edge
  b.rect(CM.stucco, XL, RF, XR - XL, CT - RF);
  b.layer();
  b.rect(CM.stoneShade, XL, RF, XR - XL, 7);
  b.rect(CM.limestone, XL, RN - 2, XR - XL, CT - RN + 2);
  // L1: the grab rails (wood) on stanchions, far and near
  b.layer();
  for (const [y, h] of [[RF + 3, 10], [RN - 6, 12]] as [number, number][]) {
    b.rect(CM.line, XL, y - h, XR - XL, 4);
    for (let x = XL + 30; x < XR; x += 120) b.rect(CM.line, x, y - h, 4, h);
  }
  // the long things on the far rail: a boat pole with a brass end, a plank, a mop
  b.layer();
  b.rect(CM.coatOat, XL, RF - 20, 440, 5);
  b.rect(CM.line, XL, RF - 12, 300, 7);
  b.rect(CM.brickDeep, 160, RF - 28, 170, 3.6);
  b.layer();
  b.rect(CM.coatMustard, 394, RF - 21, 9, 7);
  b.fill(CM.paper, `M${P(328, RF - 33)}Q${P(356, RF - 38)} ${P(368, RF - 24)}Q${P(352, RF - 17)} ${P(328, RF - 23)}Z`);
  // mushroom vents (brass) and the water filler
  for (const x of [176, 646, 872]) {
    b.rect(CM.coatMustard, x - 4, RF + 24, 8, 10);
    b.fill(CM.coatMustard, domePath(x, RF + 26, 15, 10));
  }
  b.fill(CM.coatMustard, ovalPath(1040, RN - 14, 10, 3.6));
}

/** The items standing on the roof (static parts, back to front). */
/** Short east shadows on the roof top (the low sun is west): flat stone-shade shapes past each standing thing. */
function roofShadowsInto(b: Batch) {
  const sh = (x0: number, x1: number, y: number, len: number, d = 5) => b.poly(CM.stoneShade, [[x0, y - 2], [x1, y - 2], [x1 + len, y + d], [x0 + len * 0.7, y + d]]);
  sh(26, 132, RN - 18, 18, 7); // the coiled rope
  sh(130, 182, RN - 8, 16); // the bucket
  sh(190, 240, RN - 12, 22); // the can
  for (const h of HERBS) sh(h.x - h.w * 0.38, h.x + h.w * 0.38, h.base, 16, 4);
  sh(700, 790, RN - 10, 20); // the bike
  sh(830, 896, RN - 10, 24); // the lifebuoy
  sh(934, 956, RN - 12, 40, 6); // the chimney
  sh(980, 1120, RN - 8, 14); // the logs
}

function roofItemsInto(b: Batch) {
  roofShadowsInto(b);
  b.layer();
  const inks: string[] = [];
  // a coiled rope (left)
  const rx = 78;
  const ry = RN - 22;
  b.fill(CM.coatOat, ovalPath(rx, ry, 56, 16));
  b.layer();
  b.fill(CM.line, ovalPath(rx, ry - 1, 24, 6.5));
  let coil = '';
  for (let k = 0; k < 4; k++) coil += `M${P(rx - 54 + k * 7.5, ry)}A${r1(54 - k * 7.5)} ${r1(15 - k * 2.2)} 0 0 0 ${P(rx + 54 - k * 7.5, ry)}`;
  b.ink(coil, 1.4, CM.line);
  inks.push(`M${P(rx - 56, ry)}A56 16 0 0 0 ${P(rx + 56, ry)}`);
  // a watering can and a bucket
  const cx = 214;
  const cy = RN - 14;
  b.layer();
  b.poly(CM.coatSlate, [[cx - 26, cy], [cx - 24, cy - 46], [cx + 22, cy - 46], [cx + 24, cy]]);
  b.poly(CM.coatSlate, [[cx + 20, cy - 30], [cx + 64, cy - 64], [cx + 66, cy - 57], [cx + 20, cy - 16]]);
  b.fill(CM.coatSlate, ovalPath(cx + 67, cy - 61, 8, 4.6));
  b.poly(CM.stoneShade, [[cx - 80, cy - 4], [cx - 84, cy - 40], [cx - 44, cy - 40], [cx - 48, cy - 4]]);
  b.layer();
  b.fill(CM.limestone, ovalPath(cx - 64, cy - 40, 20, 5));
  b.rect(CM.shadeCool, cx - 26, cy - 34, 50, 4);
  b.ink(`M${P(cx - 18, cy - 46)}Q${P(cx, cy - 72)} ${P(cx + 16, cy - 46)}`, 3, CM.coatSlate);
  b.ink(`M${P(cx - 82, cy - 38)}Q${P(cx - 64, cy - 62)} ${P(cx - 46, cy - 38)}`, 1.4, CM.ink);
  inks.push(`M${P(cx - 26, cy)}L${P(cx - 24, cy - 46)}L${P(cx + 22, cy - 46)}M${P(cx - 84, cy - 40)}L${P(cx - 80, cy - 4)}`);
  // a solar panel lying flat (low) and the folded bike in front of it (low: never above y 1090 under her)
  b.layer();
  b.poly(CM.paneUnlit, [[604, RF + 18], [712, RF + 18], [717, RF + 40], [598, RF + 40]]);
  let sp = '';
  for (let k = 1; k < 6; k++) sp += `M${P(604 + k * 18, RF + 18)}L${P(601 + k * 19.4, RF + 40)}`;
  sp += `M${P(601, RF + 29)}L${P(714, RF + 29)}`;
  b.ink(sp, 1, CM.glass);
  b.layer();
  bikeInto(b, 740, RN - 10, 34, 's4fold', CM.brickDeep, -1);
  b.rect(CM.anchor, 700, RN - 84, 30, 6);
  // a lifebuoy leaning on the chimney
  const lx = 860;
  const ly = RN - 44;
  b.layer();
  for (let q = 0; q < 4; q++) {
    const a0 = (q * Math.PI) / 2 + 0.3;
    const a1 = a0 + Math.PI / 2;
    const R = 36;
    const ri = 19;
    b.fill(q % 2 ? CM.paper : CM.box, `M${P(lx + Math.cos(a0) * R, ly + Math.sin(a0) * R)}A${R} ${R} 0 0 1 ${P(lx + Math.cos(a1) * R, ly + Math.sin(a1) * R)}L${P(lx + Math.cos(a1) * ri, ly + Math.sin(a1) * ri)}A${ri} ${ri} 0 0 0 ${P(lx + Math.cos(a0) * ri, ly + Math.sin(a0) * ri)}Z`);
  }
  inks.push(circleInk(lx, ly, 36, {seed: 's4roofbuoy'}));
  // the stove chimney: a plum pipe, brass bands, its coolie hat; a brass chain
  const chx = 944;
  b.layer();
  b.rect(CM.anchor, chx - 11, RF - 100, 22, RN - 12 - (RF - 100));
  b.poly(CM.anchor, [[chx - 26, RF - 100], [chx, RF - 116], [chx + 26, RF - 100]]);
  b.rect(CM.anchor, chx - 2, RF - 104, 4, 6);
  b.layer();
  b.rect(CM.coatMustard, chx - 12, RF - 68, 24, 7);
  b.rect(CM.coatMustard, chx - 14, RN - 20, 28, 8);
  inks.push(line(chx - 11, RN - 14, chx - 11, RF - 100, {...CLEAN, seed: 's4chim'}));
  // the log pile and a coal sack (cut by the right edge)
  b.layer();
  for (let k = 0; k < 12; k++) {
    const col = k % 4;
    const row = Math.floor(k / 4);
    b.fill(CM.line, ovalPath(992 + col * 26 + (row % 2) * 13, RN - 12 - row * 22, 13, 11));
  }
  b.layer();
  for (let k = 0; k < 12; k++) {
    const col = k % 4;
    const row = Math.floor(k / 4);
    const x = 992 + col * 26 + (row % 2) * 13;
    const y = RN - 12 - row * 22;
    b.fill(row === 1 ? CM.leafGold : CM.coatOat, ovalPath(x, y, 9, 7.6));
  }
  b.ink(Array.from({length: 12}, (_, k) => circleInk(992 + (k % 4) * 26 + (Math.floor(k / 4) % 2) * 13, RN - 12 - Math.floor(k / 4) * 22, 4, {seed: `s4log${k}`})).join(''), 0.9, CM.line);
  b.ink(inks.join(''), WINK.boatFine, CM.ink, 0.12);
}

/** Herb pots: terracotta, the herbs leaning east and fluttering; the ones by Pip flinch when it lands. */
const HERBS: {x: number; base: number; w: number; kind: 'rosemary' | 'basil' | 'chives' | 'thyme' | 'geranium'; flinch: boolean}[] = [
  {x: 296, base: RN - 20, w: 40, kind: 'rosemary', flinch: false},
  {x: 346, base: RN - 30, w: 34, kind: 'geranium', flinch: true},
  {x: 390, base: RN - 12, w: 34, kind: 'chives', flinch: true},
  {x: 552, base: RN - 26, w: 34, kind: 'thyme', flinch: true},
  {x: 598, base: RN - 12, w: 40, kind: 'basil', flinch: true},
];

function herbsInto(b: Batch, t: number) {
  const land = t - S4_BEATS.pipLand;
  const fl = land > 0 && land < 0.7 ? Math.sin(land * 30) * 7 * Math.exp(-land * 5) : 0;
  const pots: string[] = [];
  // L0 pots
  HERBS.forEach((h) => {
    const ph = h.w * 0.9;
    b.poly(CM.brick, [[h.x - h.w / 2, h.base - ph], [h.x + h.w / 2, h.base - ph], [h.x + h.w * 0.38, h.base], [h.x - h.w * 0.38, h.base]]);
    pots.push(`M${P(h.x - h.w / 2 - 2, h.base - ph - 2)}L${P(h.x - h.w * 0.38, h.base)}L${P(h.x + h.w * 0.38, h.base)}`);
  });
  b.layer();
  HERBS.forEach((h) => b.rect(CM.brickDeep, h.x - h.w / 2 - 2, h.base - h.w * 0.9 - 3, h.w + 4, 7));
  b.layer();
  // L1 the herbs
  const blades: string[] = [];
  const thyme: string[] = [];
  HERBS.forEach((h, i) => {
    const {x, w} = h;
    const sway = WIND * (2.4 + Math.sin(t * 2.0 + i * 1.7) * 2.0 + Math.sin(t * 4.3 + i) * 0.7) + (h.flinch ? fl : 0);
    const top = h.base - w * 0.9 - 3;
    if (h.kind === 'basil' || h.kind === 'geranium') {
      b.fill(CM.sage, `M${P(x - w * 0.62, top)}Q${P(x - w * 0.72 + sway * 0.6, top - w * 0.95)} ${P(x + sway, top - w * 1.25)}Q${P(x + w * 0.72 + sway * 0.6, top - w * 0.95)} ${P(x + w * 0.62, top)}Z`);
      for (let k = 0; k < 5; k++) b.fill(k % 2 ? CM.sage : CM.leafGold, leafPath(x - w * 0.3 + k * w * 0.15 + sway * 0.8, top - w * (0.5 + (k % 3) * 0.2), w * 0.36, w * 0.14, -30 + k * 20 + sway * 4));
      if (h.kind === 'geranium') for (let k = 0; k < 4; k++) b.fill(k % 2 ? CM.box : CM.blossom, ovalPath(x - w * 0.3 + k * w * 0.2 + sway * 0.9, top - w * (1.05 + (k % 2) * 0.18), 5.4, 5));
    } else {
      let d = '';
      const n = h.kind === 'chives' ? 12 : 9;
      for (let k = 0; k < n; k++) {
        const bx = x - w * 0.36 + (w * 0.72 * k) / (n - 1);
        const L = w * (h.kind === 'rosemary' ? 1.45 : h.kind === 'chives' ? 1.3 : 0.85) * (0.75 + ((k * 37) % 10) / 30);
        const tip = sway * (0.6 + (k % 3) * 0.25);
        d += `M${P(bx, top)}Q${P(bx + tip * 0.4, top - L * 0.5)} ${P(bx + tip, top - L)}`;
      }
      (h.kind === 'thyme' ? thyme : blades).push(d);
      if (h.kind === 'chives') for (let k = 0; k < 3; k++) b.fill(CM.blossom, ovalPath(x - w * 0.3 + k * w * 0.3 + sway * 0.9, top - w * 1.2 - (k % 2) * 6, 4.4, 4.4));
      if (h.kind === 'rosemary') for (let k = 0; k < 7; k++) b.fill(CM.sage, leafPath(x - w * 0.32 + k * w * 0.11 + sway * 0.5, top - w * (0.4 + (k % 3) * 0.32), 9, 2.6, -70 + sway * 6));
    }
  });
  b.ink(blades.join(''), 2.4, CM.sage);
  b.ink(thyme.join(''), 2.8, CM.leafGold);
  b.ink(pots.join(''), WINK.boatFine * 0.8, CM.ink, 0.12);
}

/** The stove's smoke: a long puff train blown east (never above world y 590). */
function smokeInto(b: Batch, t: number) {
  const x = 944;
  const y = RF - 116;
  const ps = puffs(t, {n: 9, life: 3.6, rise: 330, drift: WIND * 150, r0: 7, r1: 21, wobble: 7, seed: 's4boatsmoke', ceil: ROW.ceil}, y);
  // each puff a lumpy cluster of three flat ovals (no fade: it shrinks away)
  ps.forEach((p, i) => {
    const c = p.k < 0.25 ? CM.stoneShade : i % 2 ? CM.paving : CM.limestone;
    b.fill(c, ovalPath(x + p.x, y + p.y, p.r, p.r * 0.8));
    b.fill(c, ovalPath(x + p.x + p.r * 0.7, y + p.y + p.r * 0.2, p.r * 0.62, p.r * 0.5));
    b.fill(c, ovalPath(x + p.x - p.r * 0.55, y + p.y + p.r * 0.28, p.r * 0.5, p.r * 0.42));
  });
}

// ---------------------------------------------------------------- the near water (2.0x)

const [NX0, NX1] = PLANE_X(2);
const NY0 = WL;
const NY1 = 1944;
const NSPAN = NX1 - NX0;

/** What hangs over the near water at a screen x (for the hull's broken reflection of the cabin side). */
const reflColour = (sx: number): string => {
  for (const p of PORTS) if (Math.abs(sx - p.x) < PORT_R + 8) return CM.coatOat;
  if (sx > DOORS.x0 && sx < DOORS.x1) return CM.brickDeep;
  if (Math.abs(sx - CASTLE.x) < CASTLE.rx) return CM.paper;
  return CM.sage;
};
/** The near-water plane's offset, wrapped into the plane span (it streams right during the truck). */
const wrapX = (px: number, off: number) => NX0 + frac((px + off - NX0) / NSPAN) * NSPAN;

/** Static layout of the near water's marks (positions in the plane). */
function nearLayout() {
  const r = rng('s4near');
  const refl: {px: number; len: number; y: number; h: number; row: number; keep: number}[] = [];
  const rows = [5, 13, 22, 32, 43, 56, 71, 89, 110];
  rows.forEach((dy, k) => {
    const keep = 1 - k / rows.length;
    let px = NX0 + r.range(0, 30);
    while (px < NX1) {
      const len = r.range(22, 80) * (0.5 + keep * 0.6);
      const dens = k === 3 ? 0.35 : 0.25 + keep * 0.65;
      if (r.chance(dens)) refl.push({px, len, y: NY0 + dy + r.jitter(1.8 + k * 0.3), h: 3.6 + k * 0.6 + r.range(0, 1.4), row: k, keep});
      px += len + r.range(10, 40) * (1.4 - keep * 0.7);
    }
  });
  const rip = Array.from({length: 44}, () => {
    const v = r.next();
    return {px: r.range(NX0, NX1), y: NY0 + 34 + v * (NY1 - NY0 - 44), s: lerp(1, 2, v), w: r.range(30, 92)};
  });
  const foam = Array.from({length: 30}, () => ({px: r.range(NX0, NX1), len: r.range(24, 70), dy: r.range(-2, 5)}));
  const glints = Array.from({length: 18}, () => ({x: r.range(XL, XR), y: NY0 + 26 + r.next() * (NY1 - NY0 - 36), per: r.range(1.2, 2.6), ph: r.next()}));
  const leaves = Array.from({length: 13}, (_, i) => ({px: r.range(NX0, NX1), y: r.range(NY0 + 44, NY1 - 24), rot: r.range(-30, 30), i}));
  const twigs = Array.from({length: 2}, (_, i) => ({px: r.range(NX0, NX1), y: r.range(NY0 + 70, NY1 - 40), i}));
  return {refl, rip, foam, glints, leaves, twigs};
}

/** The diverging wake lines: fixed to the boat (screen), dashes flowing along them; they fold away after the stop. */
const WAKES = [
  {x0: -60, y0: NY0 + 6, x1: 1140, y1: NY0 + 120},
  {x0: 240, y0: NY0 + 6, x1: 1140, y1: NY0 + 96},
  {x0: 560, y0: NY0 + 5, x1: 1140, y1: NY0 + 70},
];

export const NearWater: React.FC<{lay: ReturnType<typeof nearLayout>}> = ({lay}) => {
  const t = useTime();
  const dx = s4PlaneDx(S4_K.near, t);
  const go = s4PathSpeed(t) / S4_TRUCK.v; // 1 while trucking, 0 from the stop
  const calm = 0.25 + 0.75 * go;
  const drift = 6 * t; // the water's own slow drift east, always
  const b = new Batch();
  b.rect(CM.water, XL, NY0, XR - XL, NY1 - NY0);
  b.layer();
  // the hull's reflection: rows of dashes laid out in the water plane (streaming), coloured by what is above them
  for (const d of lay.refl) {
    const sx = wrapX(d.px, dx + drift * 0.3);
    if (sx + d.len < XL || sx > XR) continue;
    const c = d.row < 3 ? CM.paneUnlit : d.row === 3 ? CM.anchor : reflColour(sx + d.len / 2);
    const wob = Math.sin(t * 1.6 + d.row + d.px * 0.01) * (2 + d.row * 0.4);
    const x0 = sx + wob;
    const x1 = sx + d.len + wob;
    const ym = d.y + d.h * 0.5;
    // a lens: tapered ends, a fuller belly
    b.fill(c, `M${P(x0, ym)}Q${P(x0 + d.len * 0.18, d.y)} ${P((x0 + x1) / 2, d.y)}Q${P(x1 - d.len * 0.18, d.y)} ${P(x1, ym)}Q${P(x1 - d.len * 0.2, d.y + d.h)} ${P((x0 + x1) / 2, d.y + d.h)}Q${P(x0 + d.len * 0.2, d.y + d.h)} ${P(x0, ym)}Z`);
  }
  b.layer();
  // ripples streaming right (bigger toward us)
  for (const q of lay.rip) {
    const sx = wrapX(q.px, dx + drift);
    const w = q.w * q.s;
    const hh = 2.4 * q.s;
    b.fill(CM.waterDeep, `M${P(sx - w / 2, q.y)}Q${P(sx, q.y - hh)} ${P(sx + w / 2, q.y)}Q${P(sx, q.y + hh)} ${P(sx - w / 2, q.y)}Z`);
  }
  b.layer();
  // the foam line along the hull: broken paper dashes streaming with the water (thin and few when calm)
  for (const f of lay.foam) {
    const sx = wrapX(f.px, dx + drift);
    const len = f.len * calm;
    const th = 1.6 + 2.4 * calm;
    b.fill(CM.paper, `M${P(sx, NY0 + 2 + f.dy)}L${P(sx + len, NY0 + 1 + f.dy)}L${P(sx + len - 2, NY0 + 2 + f.dy + th)}L${P(sx + 2, NY0 + 3 + f.dy + th)}Z`);
  }
  // the diverging wake lines: dashes travelling along each line; their reach shrinks when we stop
  WAKES.forEach((w, i) => {
    const L = Math.hypot(w.x1 - w.x0, w.y1 - w.y0);
    const ux = (w.x1 - w.x0) / L;
    const uy = (w.y1 - w.y0) / L;
    const reach = L * (0.15 + 0.85 * go);
    const flow = (t * (60 + 160 * go) + i * 37) % 90;
    for (let s = -flow; s < reach; s += 90) {
      if (s < 0) continue;
      const len = Math.min(52, reach - s) * (0.6 + 0.4 * go);
      if (len < 6) continue;
      const ax = w.x0 + ux * s;
      const ay = w.y0 + uy * s;
      const th = 2.8 - (s / L) * 1.4;
      b.fill(CM.paper, `M${P(ax, ay)}L${P(ax + ux * len, ay + uy * len)}L${P(ax + ux * len - 2, ay + uy * len + th)}L${P(ax - 2, ay + th)}Z`);
    }
  });
  // glints
  for (const g of lay.glints) {
    if (frac(t / g.per + g.ph) >= 0.4) continue;
    const s = lerp(0.8, 1.4, (g.y - NY0) / (NY1 - NY0));
    const x = g.x + Math.sin(t * 0.9 + g.per) * 8;
    b.fill(CM.paper, `M${P(x - 10 * s, g.y)}L${P(x + 10 * s, g.y - 1)}L${P(x + 8 * s, g.y + 2.4 * s)}L${P(x - 8 * s, g.y + 2.4 * s)}Z`);
  }
  b.layer();
  // floating leaves riding the near water, bobbing
  for (const tw of lay.twigs) {
    const sx = wrapX(tw.px, dx + drift * 1.2);
    const y = tw.y + Math.sin(t * 1.2 + tw.i) * 1.4;
    b.poly(CM.line, [[sx - 34, y - 2], [sx + 34, y + 2], [sx + 34, y + 5], [sx - 34, y + 1]]);
    b.poly(CM.line, [[sx + 6, y + 1], [sx + 26, y - 12], [sx + 28, y - 10], [sx + 9, y + 3]]);
    b.fill(CM.leafRust, leafPath(sx + 28, y - 13, 16, 5, -30));
  }
  for (const l of lay.leaves) {
    const sx = wrapX(l.px, dx + drift * 1.4);
    const s = lerp(16, 26, (l.y - NY0) / (NY1 - NY0));
    b.fill([CM.leafGold, CM.leafRust, CM.coatMustard][l.i % 3], leafPath(sx, l.y + Math.sin(t * 1.4 + l.i) * 1.6, s, s * 0.26, l.rot + Math.sin(t + l.i) * 8));
  }
  return <Paint b={b} seed="s4nearWater" misreg={false} />;
};

// ---------------------------------------------------------------- the boat

export const Boat: React.FC = () => {
  const t = useTime();
  const bob = boatBob(t);
  const lay = useMemo(nearLayout, []);
  const stat = useMemo(() => {
    const b = new Batch();
    cabinInto(b);
    b.layer();
    roofInto(b);
    b.layer();
    roofItemsInto(b);
    cabinInk(b);
    return b;
  }, []);
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
      <NearWater lay={lay} />
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
