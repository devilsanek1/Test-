// V2S4_wboat.tsx (lane L3, V2S4 WORLD helpers): OUR NARROWBOAT, the bottom third, screen-fixed (it glides with the
// camera), and the NEAR WATER below it (the 2.0x plane). Same boat, same livery as V2S3's moored boat (conform_L3 §4:
// the boat's design kept): a sage cabin, ONE plum gunwale stripe, cream portholes, the painted door panels, herb pots,
// a folded bike, a coiled rope, the stove chimney.
//   roof (y 1222-1290, seen a little from above): grab rails on stanchions; on it, back to front: a boat pole, a plank and
//        a mop on the far rail, brass mushroom vents, a coiled rope, a watering can, a bucket, herb pots, Pip's clear
//        spot x 410-530, a solar panel and a folded bike (low: never above y 1090 under her), a lifebuoy, the stove
//        chimney (its smoke: the shot's one smoke), a log pile
//   cabin side (y 1290-1640): a brick cantrail painted with diamonds and brass vents, cream coach lines framing the
//        sage panels, portholes (cream rims, brass rings and dogs, curtains; a pot plant behind one), a window box, the
//        side doors painted with roses with brass handles, a castle panel; rope fenders hanging from cleats under the
//        cantrail, ending ABOVE the gunwale (so the cantrail and the plum stripe stay unbroken bands: S3's lesson, no
//        dark-fill corners for the line count)
//   hull: the ONE plum gunwale stripe, a slate strip with a rubbing strake down to the waterline ~1700
//   near water (2.0x): the isolated flat placeholder (V2S4_water S4Water 'near'; the glints are V2S4_particles')
// TIER C (environment: flat, no line), plane -1 (one near value step: planeBatch(-1)). The boat's wood (rails,
// stanchions, the door frame, the plank, the logs, the hook) is lifted to a mid oak and its small dark fittings to a mid
// slate (on the near plane a thin dark fitting reads as a line: CRAFT §c; S3's boat did the same); the plum stays on the
// gunwale stripe and the stove chimney only. Everything is still (curtains, herbs, fenders) but the boat's slow bob
// (Pip rides it) and the stove's smoke. LIGHT (V2S4_light): contact and cast shadows of the roof's things on the roof,
// in one ShadowLayer that rides the bob.
import React, {useMemo} from 'react';
import {CM} from '../palette';
import {useTime} from '../../lib/time';
import {XG, mat} from '../../lib/xf';
import {Batch, Paint, P, rng, ovalPath, domePath, lobes, leafPath, r1, Pt} from '../kit/canal/core';
import {puffs} from '../../lib/idle';
import {mixHex, ShadowLayer, ContactShadow, CastShadow} from '../../lib/light';
import {rideAt} from '../kit/pip/motion';
import {ROW, WIND, clamp01} from './V2S4_wcore';
import {S4_PLANE, planeBatch} from './V2S4_depth';
import {S4Water} from './V2S4_water';
import {S4_PIP} from './V2S4_rig';
import type {Stander} from './V2S4_light';

/** The boat's wood lifted to a mid oak and its small dark fittings to a mid slate (S3's BOAT_WOOD / FITTING). */
const BOAT_WOOD = mixHex(CM.line, CM.coatOat, 0.45);
const FITTING = '#9399AD';
/** The portholes' glass reflection: a soft lighter streak (a dark triangle's sharp tips read as line marks). */
const PORT_GLINT = '#E3EEEC';
/** A rounded rect (made objects get soft corners: CRAFT §c). */
const rrect = (x: number, y: number, w: number, h: number, r: number) => {
  const k = Math.min(r, w / 2, h / 2);
  return `M${P(x + k, y)}L${P(x + w - k, y)}Q${P(x + w, y)} ${P(x + w, y + k)}L${P(x + w, y + h - k)}Q${P(x + w, y + h)} ${P(x + w - k, y + h)}L${P(x + k, y + h)}Q${P(x, y + h)} ${P(x, y + h - k)}L${P(x, y + k)}Q${P(x, y)} ${P(x + k, y)}Z`;
};

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

/** A painted rose: one flat oval (its swirl strokes are gone: a C piece draws no line). */
function roseInto(b: Batch, x: number, y: number, R: number, c: string) {
  b.fill(c, ovalPath(x, y, R, R * 0.86));
}

function cabinInto(b: Batch) {
  // L0: the hull, the cabin side, the cantrail, the stripe (ONE plum band, never cut by a fender)
  b.rect(CM.paneUnlit, XL, GW + 12, XR - XL, WL - GW - 8);
  b.rect(CM.sage, XL, CT, XR - XL, GW - CT + 2);
  b.rect(CM.brickDeep, XL, CT, XR - XL, 30);
  b.rect(CM.anchor, XL, GW, XR - XL, 16);
  b.layer();
  // L1: lines and bands on those: the coach line, the stripe's mustard edge, the strake, the waterline lip
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
    b.poly(c, [[x, CT + 9.5], [x + 7.5, CT + 15], [x, CT + 20.5], [x - 7.5, CT + 15]]);
  }
  // T-studs on the gunwale (a mid slate fitting: no dark specks on the stripe)
  for (const x of [52, 588, 1066]) b.fill(FITTING, `M${P(x - 10, GW - 18)}L${P(x + 10, GW - 18)}L${P(x + 10, GW - 13)}L${P(x + 5, GW - 13)}L${P(x + 5, GW)}L${P(x - 5, GW)}L${P(x - 5, GW - 13)}L${P(x - 10, GW - 13)}Z`);
  // the beading moulding above the gunwale
  b.rect(CM.limestone, XL, GW - 20, XR - XL, 3);
  // a boat hook clipped along the cabin side under the cantrail (mid oak, brass clips)
  b.rect(BOAT_WOOD, XL, CT + 38, 290, 6);
  b.layer();
  for (const x of [26, 190]) b.rect(CM.coatMustard, x - 4, CT + 36, 8, 10);
  b.layer();
  // L2: porthole rims, the door frame, the castle oval, the window box
  for (const p of PORTS) b.fill(CM.coatOat, ovalPath(p.x, PORT_Y, PORT_R + 12, PORT_R + 12));
  const {x0, x1, y0, y1} = DOORS;
  b.rect(BOAT_WOOD, x0 - 9, y0 - 9, x1 - x0 + 18, y1 - y0 + 12);
  b.fill(CM.coatOat, ovalPath(CASTLE.x, CASTLE.y, CASTLE.rx + 6, CASTLE.ry + 6));
  b.layer();
  // L3: brass rings, the door leaves, the castle's paper ground
  for (const p of PORTS) b.fill(CM.coatMustard, ovalPath(p.x, PORT_Y, PORT_R + 4, PORT_R + 4));
  const mid = (x0 + x1) / 2;
  b.rect(CM.brickDeep, x0, y0, mid - 2 - x0, y1 - y0);
  b.rect(CM.brickDeep, mid + 2, y0, x1 - mid - 2, y1 - y0);
  b.fill(CM.stucco, ovalPath(CASTLE.x, CASTLE.y, CASTLE.rx, CASTLE.ry));
  b.layer();
  // L4: glass, the door panels (a mustard border), the castle's lake and hills
  for (const p of PORTS) b.fill(CM.glass, ovalPath(p.x, PORT_Y, PORT_R, PORT_R));
  for (const [a, c] of [[x0, mid - 2], [mid + 2, x1]] as [number, number][]) b.fill(CM.coatMustard, ringRR(a + 10, y0 + 12, c - 10, y1 - 12, 10, 3));
  for (const [a, c] of [[x0, mid - 2], [mid + 2, x1]] as [number, number][]) b.fill(CM.stucco, rrect(a + 12.5, y0 + 14.5, c - a - 25, y1 - y0 - 29, 8));
  const cs = CASTLE.rx / 50;
  b.fill(CM.water, `M${P(CASTLE.x - 46 * cs, CASTLE.y + 26 * cs)}Q${P(CASTLE.x, CASTLE.y + 18 * cs)} ${P(CASTLE.x + 46 * cs, CASTLE.y + 26 * cs)}Q${P(CASTLE.x, CASTLE.y + 44 * cs)} ${P(CASTLE.x - 46 * cs, CASTLE.y + 26 * cs)}Z`);
  b.fill(CM.sage, lobes(CASTLE.x - 50 * cs, CASTLE.x - 8 * cs, CASTLE.y + 24 * cs, 18 * cs, 'castleHillA', 2));
  b.fill(CM.sage, lobes(CASTLE.x + 10 * cs, CASTLE.x + 50 * cs, CASTLE.y + 24 * cs, 15 * cs, 'castleHillB', 2));
  b.layer();
  // L5: what sits on the glass and the panels: the glass's reflection, the plant behind a porthole, the castle, the
  // bouquets' leaves
  for (const p of PORTS) {
    b.fill(PORT_GLINT, `M${P(p.x - PORT_R * 0.62, PORT_Y - PORT_R * 0.62)}Q${P(p.x - PORT_R * 0.2, PORT_Y - PORT_R * 0.92)} ${P(p.x + PORT_R * 0.12, PORT_Y - PORT_R * 0.86)}Q${P(p.x - PORT_R * 0.5, PORT_Y - PORT_R * 0.5)} ${P(p.x - PORT_R * 0.86, PORT_Y + PORT_R * 0.1)}Q${P(p.x - PORT_R * 0.9, PORT_Y - PORT_R * 0.3)} ${P(p.x - PORT_R * 0.62, PORT_Y - PORT_R * 0.62)}Z`);
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
  // L6: roses (over the leaves), daisies, the castle's door and lit windows, the plant's leaves
  for (const [a, c] of [[x0, mid - 2], [mid + 2, x1]] as [number, number][]) {
    const cx = (a + c) / 2;
    const cy = (y0 + y1) / 2 - 22;
    const w = c - a - 40;
    roseInto(b, cx, cy, w * 0.18, CM.brick);
    roseInto(b, cx - w * 0.24, cy + w * 0.2, w * 0.12, CM.box);
    roseInto(b, cx + w * 0.24, cy + w * 0.16, w * 0.12, CM.blossom);
    roseInto(b, cx + w * 0.05, cy - w * 0.28, w * 0.1, CM.coatMustard);
    roseInto(b, cx - 16, y1 - 56, 10, CM.box);
    roseInto(b, cx + 16, y1 - 60, 9, CM.coatMustard);
    const rr = rng(`s4daisy${a}`);
    for (let k = 0; k < 4; k++) {
      const dx = cx + rr.range(-w * 0.38, w * 0.38);
      const dy = cy + rr.range(-w * 0.1, w * 0.5);
      for (let q = 0; q < 5; q++) b.fill(CM.paper, ovalPath(dx + Math.cos((q * 6.28) / 5) * 3.6, dy + Math.sin((q * 6.28) / 5) * 3.6, 2.6, 2.6));
    }
  }
  b.rect(BOAT_WOOD, CASTLE.x - 4 * cs, CASTLE.y + 8 * cs, 8 * cs, 14 * cs);
  b.rect(CM.lamp, CASTLE.x - 23 * cs, CASTLE.y - 16 * cs, 4 * cs, 5 * cs);
  b.rect(CM.lamp, CASTLE.x + 19 * cs, CASTLE.y - 12 * cs, 4 * cs, 5 * cs);
  const pp = PORTS.find((p) => p.plant)!;
  b.fill(CM.sage, lobes(pp.x - 26, pp.x + 26, PORT_Y + 14, 44, 's4portplant', 4));
  // brass: the door knobs and hinges, the porthole dogs, the cantrail vents (plain brass boxes)
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
  // a window box under one porthole: a mid-oak trough of flowers trailing
  const wb = PORTS.find((p) => p.box)!;
  b.rect(BOAT_WOOD, wb.x - 52, PORT_Y + 62, 104, 24);
  b.layer();
  b.fill(CM.leafGold, lobes(wb.x - 54, wb.x + 54, PORT_Y + 64, 30, 's4wbox', 5));
  b.fill(CM.leafRust, leafPath(wb.x - 46, PORT_Y + 92, 22, 6, 70));
  b.fill(CM.leafGold, leafPath(wb.x + 42, PORT_Y + 96, 26, 6, 100));
  b.fill(CM.leafRust, leafPath(wb.x - 30, PORT_Y + 98, 18, 5, 80));
  b.layer();
  for (let k = 0; k < 7; k++) b.fill([CM.box, CM.blossom, CM.paper, CM.coatMustard][k % 4], ovalPath(wb.x - 42 + k * 14, PORT_Y + 46 + (k % 3) * 6, 5, 4.6));
}

/** Rope fenders hanging from cleats under the cantrail down the cabin side (still), ending above the gunwale's beading:
 *  the rope a thin cream strip that never crosses a dark band (the cantrail and the stripe stay unbroken), the fender a
 *  cream bolster. */
const FENDERS = [236, 548, 966];
const FENDER = {top: GW - 92, bottom: GW - 24};
function fendersInto(b: Batch) {
  for (const x of FENDERS) b.rect(CM.coatOat, x - 1.6, CT + 30, 3.2, FENDER.top - CT - 26);
  b.layer();
  for (const x of FENDERS) b.fill(CM.coatOat, `M${P(x - 15, FENDER.top)}L${P(x + 15, FENDER.top)}Q${P(x + 18, (FENDER.top + FENDER.bottom) / 2)} ${P(x + 14, FENDER.bottom)}L${P(x - 14, FENDER.bottom)}Q${P(x - 18, (FENDER.top + FENDER.bottom) / 2)} ${P(x - 15, FENDER.top)}Z`);
}

/** Curtains in the portholes: tied back (still). */
function curtainsInto(b: Batch) {
  PORTS.forEach((p, i) => {
    const sw = Math.sin(i * 1.3) * 2;
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
  // the long things on the far rail: a boat pole with a brass end, a plank, a mop
  b.layer();
  b.rect(CM.coatOat, XL, RF - 20, 440, 5);
  b.rect(BOAT_WOOD, XL, RF - 12, 300, 7);
  b.rect(BOAT_WOOD, 160, RF - 28, 170, 4);
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

/** Herb pots: terracotta, the herbs leaning east (still). */
const HERBS: {x: number; base: number; w: number; kind: 'rosemary' | 'basil' | 'chives' | 'thyme' | 'geranium'}[] = [
  {x: 296, base: RN - 20, w: 40, kind: 'rosemary'},
  {x: 346, base: RN - 30, w: 34, kind: 'geranium'},
  {x: 390, base: RN - 12, w: 34, kind: 'chives'},
  {x: 552, base: RN - 26, w: 34, kind: 'thyme'},
  {x: 598, base: RN - 12, w: 40, kind: 'basil'},
];

/** The roof's things that stand on it (roof px, before the bob): their ground for the light layer's shadows. */
export const ROOF_STANDERS: Stander[] = [
  {x: 78, y: RN - 12, w: 112, h: 18, w2: 100},
  {x: 150, y: RN - 6, w: 40, h: 36},
  {x: 214, y: RN - 14, w: 52, h: 46},
  ...HERBS.map((h) => ({x: h.x, y: h.base, w: h.w * 0.8, h: h.w * 1.6})),
  {x: 740, y: RN - 10, w: 90, h: 50, w2: 70},
  {x: 860, y: RN - 8, w: 60, h: 72, w2: 40},
  {x: 944, y: RN - 12, w: 30, h: RN - 12 - (RF - 116), w2: 20},
  {x: 1036, y: RN - 6, w: 120, h: 56, w2: 100},
  {x: S4_PIP.seat[0], y: S4_PIP.seat[1], w: 74, h: 0},
];

function roofItemsInto(b: Batch) {
  // the grab rails (mid oak) on stanchions, far and near: over the roof things' shadows (a shaded thin rail reads as a
  // line mark: S3's lesson)
  for (const [y, h] of [[RF + 3, 10], [RN - 6, 12]] as [number, number][]) {
    b.rect(BOAT_WOOD, XL, y - h, XR - XL, 4);
    for (let x = XL + 30; x < XR; x += 120) b.rect(BOAT_WOOD, x, y - h, 4, h);
  }
  b.layer();
  // a coiled rope (left): a cream coil round its mid-oak core
  const rx = 78;
  const ry = RN - 22;
  b.fill(CM.coatOat, ovalPath(rx, ry, 56, 16));
  b.layer();
  b.fill(BOAT_WOOD, ovalPath(rx, ry - 1, 24, 6.5));
  // a watering can and a bucket (a mid slate can, a stone bucket)
  const cx = 214;
  const cy = RN - 14;
  b.layer();
  b.poly(FITTING, [[cx - 26, cy], [cx - 24, cy - 46], [cx + 22, cy - 46], [cx + 24, cy]]);
  b.poly(FITTING, [[cx + 20, cy - 30], [cx + 64, cy - 64], [cx + 68, cy - 56], [cx + 20, cy - 18]]);
  b.fill(FITTING, ovalPath(cx + 67, cy - 61, 8, 4.6));
  b.poly(CM.stoneShade, [[cx - 80, cy - 4], [cx - 84, cy - 40], [cx - 44, cy - 40], [cx - 48, cy - 4]]);
  b.layer();
  b.fill(CM.limestone, ovalPath(cx - 64, cy - 40, 20, 5));
  // a solar panel lying flat (low) and the folded bike in front of it (low: never above y 1090 under her)
  b.layer();
  b.poly(CM.paneUnlit, [[604, RF + 18], [712, RF + 18], [717, RF + 40], [598, RF + 40]]);
  b.layer();
  // the folded bike: two wheels as rings, the frame and the saddle as flat shapes (a mid slate; no line)
  const bw = 34;
  for (const wx of [740 + bw * 1.25, 740 - bw * 1.25]) b.fill(FITTING, `${ovalPath(wx, RN - 10 - bw, bw, bw)}M${P(wx - bw + 4, RN - 10 - bw)}A${bw - 4} ${bw - 4} 0 1 1 ${P(wx + bw - 4, RN - 10 - bw)}A${bw - 4} ${bw - 4} 0 1 1 ${P(wx - bw + 4, RN - 10 - bw)}Z`);
  b.fill(CM.brick, `M${P(740 - bw * 1.25, RN - 10 - bw - 2)}L${P(740, RN - 10 - bw - 2)}L${P(740 - bw * 0.35, RN - 10 - bw * 2.15)}L${P(740 - bw * 0.35 - 4, RN - 10 - bw * 2.15)}L${P(740 - 6, RN - 10 - bw + 3)}L${P(740 - bw * 1.25, RN - 10 - bw + 3)}Z`);
  b.fill(FITTING, ovalPath(740 - bw * 0.35, RN - 10 - bw * 2.2, bw * 0.3, bw * 0.09));
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
  // the stove chimney: a plum pipe (the boat's one other plum), its brass foot, its coolie hat (soft ends)
  const chx = 944;
  b.layer();
  b.rect(CM.anchor, chx - 11, RF - 100, 22, RN - 12 - (RF - 100));
  b.fill(CM.anchor, rrect(chx - 26, RF - 112, 52, 12, 6));
  b.layer();
  b.rect(CM.coatMustard, chx - 14, RN - 20, 28, 8);
  // the log pile (mid-oak bark, pale ends)
  b.layer();
  for (let k = 0; k < 12; k++) {
    const col = k % 4;
    const row = Math.floor(k / 4);
    b.fill(BOAT_WOOD, ovalPath(992 + col * 26 + (row % 2) * 13, RN - 12 - row * 22, 13, 11));
  }
  b.layer();
  for (let k = 0; k < 12; k++) {
    const col = k % 4;
    const row = Math.floor(k / 4);
    b.fill(row === 1 ? CM.leafGold : CM.coatOat, ovalPath(992 + col * 26 + (row % 2) * 13, RN - 12 - row * 22, 9, 7.6));
  }
}

function herbsInto(b: Batch) {
  // L0 pots and their rims
  HERBS.forEach((h) => {
    const ph = h.w * 0.9;
    b.poly(CM.brick, [[h.x - h.w / 2, h.base - ph], [h.x + h.w / 2, h.base - ph], [h.x + h.w * 0.38, h.base], [h.x - h.w * 0.38, h.base]]);
  });
  b.layer();
  HERBS.forEach((h) => b.fill(CM.brickLight, rrect(h.x - h.w / 2 - 2, h.base - h.w * 0.9 - 3, h.w + 4, 7, 3)));
  b.layer();
  // L1 the herbs (leaning east in the canal breeze; still); the grassy ones' blades are things that ARE lines
  const blades: string[] = [];
  const thyme: string[] = [];
  HERBS.forEach((h, i) => {
    const {x, w} = h;
    const sway = WIND * (2.4 + Math.sin(i * 1.7) * 2.0);
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
  b.ink(blades.join(''), 2.4, CM.sage, 0, {thing: true, tone: CM.sage});
  b.ink(thyme.join(''), 2.8, CM.leafGold, 0, {thing: true, tone: CM.leafGold});
}

/** The stove's smoke: a long puff train blown east (the shot's one smoke; it fades by shrinking at ~y 776, far under
 *  the caption band). */
function smokeInto(b: Batch, t: number) {
  const x = 944;
  const y = RF - 116;
  const ps = puffs(t, {n: 9, life: 3.6, rise: 330, drift: WIND * 150, r0: 7, r1: 21, wobble: 7, seed: 's4boatsmoke', ceil: 600}, y);
  ps.forEach((p, i) => {
    const c = p.k < 0.25 ? CM.stoneShade : i % 2 ? CM.paving : CM.limestone;
    b.fill(c, ovalPath(x + p.x, y + p.y, p.r, p.r * 0.8));
    b.fill(c, ovalPath(x + p.x + p.r * 0.7, y + p.y + p.r * 0.2, p.r * 0.62, p.r * 0.5));
    b.fill(c, ovalPath(x + p.x - p.r * 0.55, y + p.y + p.r * 0.28, p.r * 0.5, p.r * 0.42));
  });
}

/** The roof's shadows (one multiply layer on the roof, riding the bob): contact under each thing, casts along the low
 *  sun (right and a little toward us), Pip's contact. */
const RoofShadows: React.FC = () => (
  <ShadowLayer>
    {ROOF_STANDERS.map((s, i) => (
      <React.Fragment key={i}>
        <ContactShadow x={s.x} y={s.y} w={s.w} k={s.k ?? 1.1} />
        {s.h > 0 ? <CastShadow x={s.x} y={s.y} w={s.w2 ?? s.w * 0.8} h={s.h} /> : null}
      </React.Fragment>
    ))}
  </ShadowLayer>
);

// ---------------------------------------------------------------- the boat

export const Boat: React.FC = () => {
  const t = useTime();
  const bob = boatBob(t);
  const hull = useMemo(() => {
    const b = new Batch();
    cabinInto(b);
    b.layer();
    curtainsInto(b);
    b.layer();
    fendersInto(b);
    b.layer();
    roofInto(b);
    return planeBatch(b, S4_PLANE.boat, {keep: [CM.lamp]});
  }, []);
  const things = useMemo(() => {
    const b = new Batch();
    roofItemsInto(b);
    b.layer();
    herbsInto(b);
    return planeBatch(b, S4_PLANE.boat);
  }, []);
  const smoke = new Batch();
  smokeInto(smoke, t);
  return (
    <>
      <S4Water part="near" />
      <XG m={mat.translate(0, bob)}>
        <Paint b={hull} seed="s4boatHull" misreg={false} />
        <RoofShadows />
        <Paint b={things} seed="s4boatThings" misreg={false} />
      </XG>
      <Paint b={smoke} seed="s4boatSmoke" misreg={false} />
    </>
  );
};

export {clamp01};
export type {Pt};
