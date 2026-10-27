// V2S3_nboat.tsx (lane L3, V2S3 NEAR helper; WORLD px at the 12.98 match, inside V2S3's camera): OUR moored
// narrowboat, the bottom third's main mass, cut by both edges. The SAME boat as V2S4's foreground boat (TREATMENT §5
// S3 / S4; plan_L3 §1-2): a SAGE cabin side lined out in cream (panels, beading, fancy corners), ONE plum gunwale
// stripe, cream portholes warmly lit inside at sunset with curtains (a pot plant behind one, someone passing behind
// another), slate side doors with brass ports, a painted flower panel in the roses-and-castles spirit (NO lettering),
// a slate hull with its rubbing strake, rope fenders; the roof seen from a little above (the towpath is higher than
// the water) and dressed: a boat pole and a plank, herb pots, the pigeon box, a coiled rope, a folded bike, the stove
// chimney (smoke, clamped under the band), a watering can, a painted Buckby can, a lifebuoy, mushroom vents and a
// geranium trough cut by the right edge. Life: smoke, curtains, herbs, the passer-by inside, a slow moored bob.
//
// Layout (world y): roof far edge 1262 · roof 1262-1326 · cant 1326-1340 · cabin side 1340-1570 · plum stripe
// 1570-1584 · hull 1584-1616 (waterline). x from -70 to 1170 (S3_BLEED). Low sun at left: cast shadows on the roof
// run right, as colour (stone shade), never grey.
//
// Stacking: a Batch draws ONE fill per colour per layer (colours in first-use order), then that layer's ink. Shapes
// that overlap therefore go on separate LEVELS (Levels below): each level is its own run of layers, in order.
import React, {useMemo} from 'react';
import {CM, INK_PX} from '../palette';
import {useTime} from '../../lib/time';
import {XG, mat} from '../../lib/xf';
import {line, circle as circleInk, ellipse as ellipseInk, arc as arcInk} from '../../lib/sketch';
import {Batch, Paint, P, rng, ovalPath, domePath, lobes, leafPath, lerp} from '../kit/canal/core';
import type {Pt} from '../kit/canal/core';
import {Puffs} from '../kit/canal/life';

/** The boat's lines (world px at the match). */
export const NB = {
  x0: -70,
  x1: 1170,
  roofFar: 1262,
  roofNear: 1326,
  cant: 1340,
  cabin1: 1570,
  gun1: 1584,
  water: 1616,
  /** Stove chimney: centre x, base on the roof, pipe top (smoke leaves under the cap). */
  chimney: {x: 706, base: 1306, top: 1206},
  /** The mooring dolly on the gunwale (the rope to our coping's ring starts here). */
  dolly: [118, 1572] as Pt,
  /** Fenders hang from the gunwale at these x. */
  fenders: [474, 1046],
} as const;

// ---------------------------------------------------------------- levels + small path helpers

/** Ordered drawing levels: everything on level k draws over everything on level k-1 (fills then ink per level). */
export class Levels {
  bs: Batch[] = [];
  at(k: number): Batch {
    while (this.bs.length <= k) this.bs.push(new Batch());
    return this.bs[k];
  }
  merge(): Batch {
    const out = new Batch();
    for (const b of this.bs) out.add(b);
    return out;
  }
}

const rr = (x: number, y: number, w: number, h: number, r: number) => {
  const k = Math.min(r, w / 2, h / 2);
  return `M${P(x + k, y)}L${P(x + w - k, y)}Q${P(x + w, y)} ${P(x + w, y + k)}L${P(x + w, y + h - k)}Q${P(x + w, y + h)} ${P(x + w - k, y + h)}L${P(x + k, y + h)}Q${P(x, y + h)} ${P(x, y + h - k)}L${P(x, y + k)}Q${P(x, y)} ${P(x + k, y)}Z`;
};
/** Lining-out with "fancy corners": a rectangle whose corners are notched by small quarter circles (concave). */
const fancy = (x: number, y: number, w: number, h: number, k: number) =>
  `M${P(x + k, y)}L${P(x + w - k, y)}Q${P(x + w - k, y + k)} ${P(x + w, y + k)}L${P(x + w, y + h - k)}Q${P(x + w - k, y + h - k)} ${P(x + w - k, y + h)}L${P(x + k, y + h)}Q${P(x + k, y + h - k)} ${P(x, y + h - k)}L${P(x, y + k)}Q${P(x + k, y + k)} ${P(x + k, y)}Z`;
/** An oval wound the other way (a HOLE when appended to an ovalPath under the nonzero rule). */
export const holePath = (cx: number, cy: number, rx: number, ry: number) =>
  `M${P(cx - rx, cy)}A${rx.toFixed(1)} ${ry.toFixed(1)} 0 1 1 ${P(cx + rx, cy)}A${rx.toFixed(1)} ${ry.toFixed(1)} 0 1 1 ${P(cx - rx, cy)}Z`;
/** A ring (annulus) as one fill path. */
export const ringPath = (cx: number, cy: number, rx: number, ry: number, ix: number, iy: number) => `${ovalPath(cx, cy, rx, ry)}${holePath(cx, cy, ix, iy)}`;
/** A tapered pot (terracotta), base centre (x, y), top width w, height h. */
const potPath = (x: number, y: number, w: number, h: number) => `M${P(x - w / 2, y - h)}L${P(x + w / 2, y - h)}L${P(x + w * 0.37, y)}L${P(x - w * 0.37, y)}Z`;
/** A shadow lying on the roof (a horizontal surface seen at a grazing angle): it runs RIGHT from an item's foot,
 *  away from the low sun at left, dipping only a few px toward us, never past the roof's near edge. */
const roofShadow = (b: Batch, x: number, y: number, w: number, len: number) => {
  const y0 = Math.min(y, NB.roofNear - 10);
  const dip = Math.min(5, NB.roofNear - 8 - y0);
  b.poly(CM.stoneShade, [[x - w * 0.15, y0 - 3], [x + len, y0 - 3 + dip * 0.6], [x + len - 4, y0 + dip], [x - w * 0.1, y0 + 2]]);
};
/** A long hand-drawn line that stays parallel to its edge (low drift): the boat's long contours. */
const longLine = (x0: number, y0: number, x1: number, y1: number, seed: string, over: 'small' | 'medium' = 'small') => line(x0, y0, x1, y1, {seed, over, drift: 0.06, bow: 1.2});

// ---------------------------------------------------------------- the cabin side, hull and roof surface (static)

type Porthole = {x: number; y: number; r: number; curtain: string; inside: 'plant' | 'walker' | 'shelf' | 'kettle'};
export const PORTHOLES: Porthole[] = [
  {x: 34, y: 1440, r: 26, curtain: CM.box, inside: 'plant'},
  {x: 394, y: 1440, r: 26, curtain: CM.blossom, inside: 'walker'},
  {x: 776, y: 1440, r: 26, curtain: CM.coatMustard, inside: 'shelf'},
  {x: 1012, y: 1440, r: 26, curtain: CM.leafRust, inside: 'kettle'},
];
/** The rectangular saloon window cut by the right edge; the painted flower panel; the side doors. */
const SALOON = {x0: 1092, x1: 1214, y0: 1386, y1: 1490};
const PANEL = {x: 566, y: 1452, rx: 94, ry: 62};
const DOORS = {x0: 166, x1: 306, y0: 1362, y1: 1556};
const DW = (DOORS.x1 - DOORS.x0 - 4) / 2;

function cabinInto(L: Levels) {
  const {x0, x1} = NB;
  const W = x1 - x0;
  // ---- level 0: the bands, top to bottom (adjacent, no overlap but the backing water under the roof's far edge)
  const b0 = L.at(0);
  b0.rect(CM.water, x0, NB.roofFar - 8, W, 30);
  b0.rect(CM.coatOat, x0, NB.roofFar, W, NB.roofNear - NB.roofFar);
  b0.rect(CM.brickDeep, x0, NB.roofNear, W, NB.cant - NB.roofNear);
  b0.rect(CM.sage, x0, NB.cant, W, NB.cabin1 - NB.cant);
  b0.rect(CM.anchor, x0, NB.cabin1, W, NB.gun1 - NB.cabin1);
  b0.rect(CM.paneUnlit, x0, NB.gun1, W, NB.water - NB.gun1 + 2);
  // ---- level 1: on the bands (rails, camber, the tumblehome catching the sky, the cant's shadow, the strake)
  const b1 = L.at(1);
  b1.rect(CM.line, x0, NB.roofFar + 2, W, 4);
  b1.rect(CM.limestone, x0, NB.roofNear - 9, W, 5);
  b1.rect(CM.paper, x0, NB.roofFar + 22, W, 5);
  b1.rect(CM.glass, x0, NB.cant + 4, W, 12);
  b1.rect(CM.shadeCool, x0, NB.cant, W, 4);
  b1.rect(CM.shadeCool, x0, NB.gun1 + 13, W, 4);
  b1.rect(CM.brick, x0, NB.roofNear + 2, W, 3);
  // ---- level 2: beading, lining-out panels (ink), the door leaves, the panel's border, the saloon frame
  const b2 = L.at(2);
  b2.rect(CM.paper, x0, NB.cant + 16, W, 2.4);
  b2.rect(CM.paper, x0, NB.cabin1 - 12, W, 2.4);
  b2.rect(CM.shadeCool, x0, NB.cabin1 - 9.6, W, 1.6);
  const panels: [number, number][] = [
    [x0 - 30, DOORS.x0 - 16],
    [DOORS.x1 + 16, 694],
    [710, x1 + 40],
  ];
  for (const [a, c] of panels) {
    b2.ink(fancy(a, 1362, c - a, 180, 12), 3, CM.coatOat);
    b2.ink(fancy(a + 8, 1370, c - a - 16, 164, 9), 1.4, CM.coatMustard);
  }
  for (let k = 0; k < 2; k++) b2.fill(CM.paneUnlit, rr(DOORS.x0 + k * (DW + 4), DOORS.y0, DW, DOORS.y1 - DOORS.y0, 6));
  b2.fill(CM.coatMustard, ovalPath(PANEL.x, PANEL.y, PANEL.rx + 7, PANEL.ry + 7));
  b2.fill(CM.coatOat, rr(SALOON.x0 - 9, SALOON.y0 - 9, SALOON.x1 - SALOON.x0 + 18, SALOON.y1 - SALOON.y0 + 18, 16));
  b2.rect(CM.coatMustard, DOORS.x0 - 6, DOORS.y1 - 3, DOORS.x1 - DOORS.x0 + 12, 6);
  // ---- level 3: door lining + diamonds + handles, the panel's slate ground, the saloon's lamp-lit glass
  const b3 = L.at(3);
  for (let k = 0; k < 2; k++) {
    const dx = DOORS.x0 + k * (DW + 4);
    b3.ink(fancy(dx + 8, DOORS.y0 + 62, DW - 16, DOORS.y1 - DOORS.y0 - 74, 6), 2, CM.coatOat);
    const cx = dx + DW / 2;
    const cy = DOORS.y0 + 128;
    b3.poly(CM.coatMustard, [[cx, cy - 26], [cx + 15, cy], [cx, cy + 26], [cx - 15, cy]]);
    b3.fill(CM.coatMustard, ovalPath(k === 0 ? dx + DW - 10 : dx + 10, DOORS.y0 + 100, 4.2, 4.2));
  }
  b3.fill(CM.paneUnlit, ovalPath(PANEL.x, PANEL.y, PANEL.rx, PANEL.ry));
  b3.fill(CM.lamp, rr(SALOON.x0, SALOON.y0, SALOON.x1 - SALOON.x0, SALOON.y1 - SALOON.y0, 10));
  // ---- level 4: diamond hearts, the panel's leaves, the saloon's interior (light, shelf, jars, lamp shade)
  const b4 = L.at(4);
  for (let k = 0; k < 2; k++) {
    const cx = DOORS.x0 + k * (DW + 4) + DW / 2;
    const cy = DOORS.y0 + 128;
    b4.poly(CM.box, [[cx, cy - 13], [cx + 7.5, cy], [cx, cy + 13], [cx - 7.5, cy]]);
  }
  for (const [dx, dy, Lf, a] of PANEL_LEAVES) b4.fill(CM.sage, leafPath(PANEL.x + dx, PANEL.y + dy, Lf, Lf * 0.32, a));
  b4.ink(PANEL_LEAVES.map(([dx, dy, Lf, a]) => {
    const ar = (a * Math.PI) / 180;
    return `M${P(PANEL.x + dx - Math.cos(ar) * Lf * 0.42, PANEL.y + dy - Math.sin(ar) * Lf * 0.42)}L${P(PANEL.x + dx + Math.cos(ar) * Lf * 0.42, PANEL.y + dy + Math.sin(ar) * Lf * 0.42)}`;
  }).join(''), 1.2, CM.coatMustard);
  b4.ink(ellipseInk(PANEL.x, PANEL.y, PANEL.rx - 8, PANEL.ry - 8, {seed: 's3nb/pl2', wobble: 0.01, overlap: 4}), 1.6, CM.coatMustard);
  b4.rect(CM.lampCore, SALOON.x0 + 10, SALOON.y0 + 26, 34, 50);
  b4.rect(CM.line, SALOON.x0 + 4, SALOON.y0 + 44, 110, 4);
  for (const [jx, jh, jc] of [[SALOON.x0 + 52, 16, CM.brick], [SALOON.x0 + 66, 11, CM.coatSlate], [SALOON.x0 + 80, 19, CM.sage]] as [number, number, string][]) b4.rect(jc, jx, SALOON.y0 + 44 - jh, 10, jh);
  b4.fill(CM.box, `M${P(SALOON.x0 + 18, SALOON.y0 + 12)}L${P(SALOON.x0 + 36, SALOON.y0 + 12)}L${P(SALOON.x0 + 42, SALOON.y0 + 26)}L${P(SALOON.x0 + 12, SALOON.y0 + 26)}Z`);
  // ---- level 5: roses (outer), the valance, the sill pots
  const b5 = L.at(5);
  for (const [dx, dy, R, c0] of PANEL_ROSES) b5.fill(c0, ovalPath(PANEL.x + dx, PANEL.y + dy, R, R * 0.84));
  b5.fill(CM.box, `M${P(SALOON.x0, SALOON.y0)}L${P(SALOON.x1, SALOON.y0)}L${P(SALOON.x1, SALOON.y0 + 16)}Q${P(SALOON.x0 + 60, SALOON.y0 + 26)} ${P(SALOON.x0, SALOON.y0 + 16)}Z`);
  b5.fill(CM.brick, potPath(SALOON.x0 + 30, SALOON.y1 - 2, 26, 18));
  b5.fill(CM.coatOat, potPath(SALOON.x0 + 82, SALOON.y1 - 2, 20, 14));
  // ---- level 6: roses (inner), daisies, the sill plants
  const b6 = L.at(6);
  for (const [dx, dy, R, , c1] of PANEL_ROSES) b6.fill(c1, ovalPath(PANEL.x + dx + R * 0.08, PANEL.y + dy + R * 0.06, R * 0.55, R * 0.46));
  for (const [dx, dy] of PANEL_DAISIES) {
    for (let k = 0; k < 6; k++) {
      const a = (k / 6) * Math.PI * 2;
      b6.fill(CM.coatMustard, ovalPath(PANEL.x + dx + Math.cos(a) * 5.5, PANEL.y + dy + Math.sin(a) * 5, 3.4, 3.4));
    }
  }
  for (const [dx, dy] of [[-76, 6], [78, -22], [-36, -48], [34, 50], [-70, 38], [74, 34]] as [number, number][]) b6.fill(CM.paper, ovalPath(PANEL.x + dx, PANEL.y + dy, 2.2, 2.2));
  b6.fill(CM.sage, lobes(SALOON.x0 + 10, SALOON.x0 + 52, SALOON.y1 - 18, 30, 's3nb/sal1', 3));
  b6.fill(CM.sage, lobes(SALOON.x0 + 68, SALOON.x0 + 98, SALOON.y1 - 14, 22, 's3nb/sal2', 3));
  // ---- level 7: rose hearts + highlight strokes, daisy hearts
  const b7 = L.at(7);
  for (const [dx, dy, R, c0] of PANEL_ROSES) b7.fill(c0, ovalPath(PANEL.x + dx + R * 0.12, PANEL.y + dy + R * 0.1, R * 0.24, R * 0.2));
  for (const [dx, dy] of PANEL_DAISIES) b7.fill(CM.leafRust, ovalPath(PANEL.x + dx, PANEL.y + dy, 2.6, 2.6));
  let hl = '';
  for (const [dx, dy, R] of PANEL_ROSES) hl += arcInk(PANEL.x + dx, PANEL.y + dy, R * 0.78, R * 0.66, 200, 300, {seed: `s3nb/rh${dx}`}) + arcInk(PANEL.x + dx, PANEL.y + dy, R * 0.5, R * 0.42, 20, 120, {seed: `s3nb/rh2${dx}`});
  b7.ink(hl, 1.8, CM.paper);
}

const PANEL_LEAVES: [number, number, number, number][] = [
  [-58, -6, 34, -150], [-50, 22, 32, 160], [-6, -36, 30, -100], [30, 30, 32, 60], [62, -14, 34, -20], [58, 20, 30, 25], [-28, 40, 28, 120], [16, -40, 26, -70],
];
const PANEL_ROSES: [number, number, number, string, string][] = [
  [-24, 2, 26, CM.box, CM.leafRust],
  [24, -8, 22, CM.blossom, CM.brick],
  [6, 26, 17, CM.leafRust, CM.brickDeep],
];
const PANEL_DAISIES: [number, number][] = [[-62, -24], [66, 2], [-46, 30], [44, 34], [-6, -44]];

// ---------------------------------------------------------------- the roof dressing (static)

type HerbPot = {x: number; y: number; w: number; h: number; kind: 'rosemary' | 'basil' | 'thyme' | 'chilli'};
export const HERB_POTS: HerbPot[] = [
  {x: 52, y: 1318, w: 30, h: 28, kind: 'rosemary'},
  {x: 104, y: 1313, w: 38, h: 32, kind: 'basil'},
  {x: 158, y: 1320, w: 26, h: 22, kind: 'thyme'},
  {x: 210, y: 1315, w: 34, h: 30, kind: 'chilli'},
];
const PIGEON = {x0: 300, x1: 372, y: 1312, h: 26};
const COIL: Pt = [446, 1300];
const BIKE: Pt = [566, 1318];
const WCAN: Pt = [800, 1316];
const BUCKBY: Pt = [872, 1312];
const BUOY = {x: 996, y: 1294, rx: 52, ry: 16};

function roofInto(L: Levels) {
  const w2 = INK_PX.far;
  const hair = INK_PX.hair;
  const s1 = L.at(1); // shadows on the roof
  const a = L.at(2); // item bodies
  const c = L.at(3); // details on the bodies
  const d = L.at(4); // small details
  // ---- the boat pole and the plank along the far side of the roof (cut by the left edge)
  a.poly(CM.line, [[-90, 1271], [262, 1265], [263, 1271], [-90, 1278]]);
  a.fill(CM.anchor, `M${P(262, 1263)}L${P(282, 1262)}Q${P(292, 1267)} ${P(282, 1273)}L${P(262, 1272)}Z`);
  a.poly(CM.leafGold, [[-90, 1290], [150, 1286], [154, 1298], [-90, 1303]]);
  c.poly(CM.line, [[-90, 1303], [154, 1298], [154, 1301], [-90, 1306]]);
  c.ink(longLine(-90, 1290, 152, 1286, 's3nb/plank') + longLine(-90, 1271, 262, 1265, 's3nb/pole'), hair);
  // ---- herb pots (terracotta, rims, a shade side, their shadows) - the herbs themselves sway: herbsInto()
  for (const p of HERB_POTS) {
    roofShadow(s1, p.x + p.w * 0.3, p.y, p.w * 0.8, p.w * 1.9);
    a.fill(CM.brick, potPath(p.x, p.y, p.w, p.h));
    c.fill(CM.brickDeep, `M${P(p.x - p.w / 2 - 2, p.y - p.h)}L${P(p.x + p.w / 2 + 2, p.y - p.h)}L${P(p.x + p.w / 2 + 1, p.y - p.h + 7)}L${P(p.x - p.w / 2 - 1, p.y - p.h + 7)}Z`);
    c.fill(CM.shadeWarm, `M${P(p.x + p.w * 0.18, p.y - p.h + 7)}L${P(p.x + p.w / 2 - 1, p.y - p.h + 7)}L${P(p.x + p.w * 0.37, p.y)}L${P(p.x + p.w * 0.12, p.y)}Z`);
    d.ink(`M${P(p.x - p.w / 2, p.y - p.h)}L${P(p.x - p.w * 0.37, p.y)}L${P(p.x + p.w * 0.37, p.y)}`, w2, CM.ink, 0.2);
  }
  // ---- the pigeon box: a raised sage box with a cream lid and two little lit ports
  const pb = PIGEON;
  roofShadow(s1, pb.x1 - 4, pb.y, 30, 58);
  a.rect(CM.sage, pb.x0, pb.y - pb.h, pb.x1 - pb.x0, pb.h);
  c.poly(CM.coatOat, [[pb.x0 - 4, pb.y - pb.h], [pb.x1 + 4, pb.y - pb.h], [pb.x1 - 2, pb.y - pb.h - 14], [pb.x0 + 2, pb.y - pb.h - 14]]);
  for (const px of [pb.x0 + 20, pb.x1 - 20]) {
    c.fill(CM.coatMustard, ovalPath(px, pb.y - pb.h / 2, 8, 8));
    d.fill(CM.lamp, ovalPath(px, pb.y - pb.h / 2, 5.4, 5.4));
  }
  d.ink(`M${P(pb.x0, pb.y - pb.h - 1)}L${P(pb.x0, pb.y)}L${P(pb.x1, pb.y)}L${P(pb.x1, pb.y - pb.h)}`, w2, CM.ink, 0.25);
  // ---- the coiled rope (cream, a spiral of twists)
  roofShadow(s1, COIL[0] + 30, COIL[1] + 10, 30, 30);
  a.fill(CM.coatOat, ovalPath(COIL[0], COIL[1], 44, 14));
  c.fill(CM.line, ovalPath(COIL[0] + 2, COIL[1] - 1, 12, 4));
  let coil = '';
  for (let k = 0; k < 4; k++) coil += ellipseInk(COIL[0] + k * 0.6, COIL[1] - k * 0.2, 44 - k * 9, 14 - k * 2.6, {seed: `s3nb/coil${k}`, wobble: 0.03, overlap: 30});
  c.ink(coil, hair, CM.line);
  // ---- the folded bike (mustard frame, two small wheels side by side, saddle on top)
  const g = BIKE;
  roofShadow(s1, g[0] + 30, g[1], 60, 84);
  const R = 23;
  const wA: Pt = [g[0] - 14, g[1] - R];
  const wB: Pt = [g[0] + 16, g[1] - R + 1];
  for (const [wx, wy] of [wA, wB]) a.fill(CM.coatSlate, ringPath(wx, wy, R, R, R - 4.5, R - 4.5));
  let spokes = '';
  for (const [wx, wy] of [wA, wB]) for (let k = 0; k < 4; k++) {
    const ang = (k / 4) * Math.PI + 0.3;
    spokes += `M${P(wx - Math.cos(ang) * (R - 5), wy - Math.sin(ang) * (R - 5))}L${P(wx + Math.cos(ang) * (R - 5), wy + Math.sin(ang) * (R - 5))}`;
  }
  a.ink(spokes, 1, CM.stoneShade);
  for (const [wx, wy] of [wA, wB]) c.fill(CM.coatMustard, ovalPath(wx, wy, 3.2, 3.2));
  c.ink(`M${P(wA[0], wA[1])}L${P(g[0] + 2, g[1] - 44)}L${P(wB[0], wB[1])}M${P(g[0] + 2, g[1] - 44)}L${P(g[0] - 2, g[1] - 86)}M${P(g[0] + 2, g[1] - 44)}L${P(g[0] + 22, g[1] - 70)}L${P(g[0] + 34, g[1] - 72)}`, 5, CM.coatMustard);
  d.fill(CM.anchor, `M${P(g[0] - 16, g[1] - 88)}Q${P(g[0] - 2, g[1] - 96)} ${P(g[0] + 12, g[1] - 89)}L${P(g[0] + 10, g[1] - 84)}L${P(g[0] - 14, g[1] - 84)}Z`);
  d.fill(CM.anchor, ovalPath(g[0] + 36, g[1] - 72, 5, 3));
  d.ink(circleInk(wA[0], wA[1], R, {seed: 's3nb/bwA', wobble: 0.02}) + circleInk(wB[0], wB[1], R, {seed: 's3nb/bwB', wobble: 0.02}), hair, CM.ink, 0.3);
  // ---- the stove chimney (plum pipe, two brass bands, a hat) - smoke: <Puffs> in S3Boat
  const ch = NB.chimney;
  roofShadow(s1, ch.x + 10, ch.base, 26, 96);
  a.fill(CM.anchor, `M${P(ch.x - 15, ch.base)}L${P(ch.x - 12, ch.base - 12)}L${P(ch.x + 12, ch.base - 12)}L${P(ch.x + 15, ch.base)}Z`);
  a.rect(CM.anchor, ch.x - 9, ch.top, 18, ch.base - 12 - ch.top);
  a.fill(CM.anchor, `M${P(ch.x - 21, ch.top - 8)}Q${P(ch.x, ch.top - 26)} ${P(ch.x + 21, ch.top - 8)}L${P(ch.x + 16, ch.top - 4)}L${P(ch.x - 16, ch.top - 4)}Z`);
  a.rect(CM.anchor, ch.x - 2, ch.top - 6, 4, 6);
  c.rect(CM.coatMustard, ch.x - 10, ch.top + 22, 20, 6);
  c.rect(CM.coatMustard, ch.x - 10, ch.base - 34, 20, 5);
  c.rect(CM.coatPlum, ch.x + 3, ch.top + 30, 4, ch.base - 46 - ch.top - 30);
  d.ink(line(ch.x - 9, ch.top, ch.x - 9, ch.base - 12, {seed: 's3nb/chim', over: 'small', drift: 0.1}), w2, CM.ink);
  // ---- the watering can (slate)
  roofShadow(s1, WCAN[0] + 16, WCAN[1], 34, 52);
  a.fill(CM.coatSlate, rr(WCAN[0] - 22, WCAN[1] - 30, 40, 30, 7));
  a.poly(CM.coatSlate, [[WCAN[0] + 14, WCAN[1] - 14], [WCAN[0] + 40, WCAN[1] - 38], [WCAN[0] + 44, WCAN[1] - 34], [WCAN[0] + 18, WCAN[1] - 8]]);
  a.fill(CM.coatSlate, ovalPath(WCAN[0] + 44, WCAN[1] - 38, 6, 4));
  c.rect(CM.shadeCool, WCAN[0] + 6, WCAN[1] - 28, 10, 27);
  d.ink(arcInk(WCAN[0] - 2, WCAN[1] - 30, 18, 14, 180, 360, {seed: 's3nb/wch'}) + `M${P(WCAN[0] - 22, WCAN[1] - 26)}L${P(WCAN[0] - 22, WCAN[1])}`, w2, CM.ink);
  // ---- the painted Buckby can (plum-mauve, a brass band, a rose)
  const bc = BUCKBY;
  roofShadow(s1, bc[0] + 14, bc[1], 30, 62);
  a.fill(CM.coatPlum, rr(bc[0] - 16, bc[1] - 50, 32, 50, 5));
  a.fill(CM.coatPlum, `M${P(bc[0] - 12, bc[1] - 50)}L${P(bc[0] - 8, bc[1] - 60)}L${P(bc[0] + 8, bc[1] - 60)}L${P(bc[0] + 12, bc[1] - 50)}Z`);
  c.rect(CM.coatMustard, bc[0] - 16, bc[1] - 42, 32, 4);
  c.fill(CM.box, ovalPath(bc[0] - 4, bc[1] - 24, 7, 6.4));
  d.fill(CM.brick, ovalPath(bc[0] - 3, bc[1] - 23, 3.2, 2.8));
  d.fill(CM.paper, ovalPath(bc[0] + 8, bc[1] - 20, 3.2, 3.2));
  d.fill(CM.sage, leafPath(bc[0] + 4, bc[1] - 32, 10, 3, -30));
  d.ink(arcInk(bc[0], bc[1] - 60, 12, 12, 180, 360, {seed: 's3nb/bch'}) + `M${P(bc[0] + 16, bc[1] - 48)}L${P(bc[0] + 16, bc[1])}`, w2, CM.ink);
  // ---- the lifebuoy lying flat (a paper ring with four rust bands; the roof shows through its hole)
  const lb = BUOY;
  roofShadow(s1, lb.x + 44, lb.y + 14, 40, 26);
  a.fill(CM.paper, ringPath(lb.x, lb.y, lb.rx, lb.ry, lb.rx * 0.6, lb.ry * 0.5));
  for (const a0 of [20, 110, 200, 290]) {
    const pts: Pt[] = [];
    for (let k = 0; k <= 6; k++) {
      const ang = ((a0 + (k / 6) * 34) * Math.PI) / 180;
      pts.push([lb.x + Math.cos(ang) * lb.rx, lb.y + Math.sin(ang) * lb.ry]);
    }
    for (let k = 6; k >= 0; k--) {
      const ang = ((a0 + (k / 6) * 34) * Math.PI) / 180;
      pts.push([lb.x + Math.cos(ang) * lb.rx * 0.6, lb.y + Math.sin(ang) * lb.ry * 0.5]);
    }
    c.poly(CM.leafRust, pts);
  }
  d.ink(ellipseInk(lb.x, lb.y, lb.rx, lb.ry, {seed: 's3nb/lb', wobble: 0.02}), w2, CM.ink, 0.25);
  // ---- the geranium trough cut by the right edge (flowers sway with the herbs)
  a.poly(CM.brickDeep, [[1066, 1296], [1200, 1296], [1200, 1318], [1070, 1318]]);
  c.rect(CM.brick, 1066, 1296, 134, 6);
  d.ink(`M${P(1066, 1296)}L${P(1070, 1318)}L${P(1200, 1318)}`, w2, CM.ink, 0.2);
  // ---- brass mushroom vents along the roof's near edge
  for (const vx of [256, 652, 936]) {
    roofShadow(s1, vx + 6, NB.roofNear - 12, 18, 26);
    a.fill(CM.coatMustard, domePath(vx, NB.roofNear - 12, 11, 8));
    a.rect(CM.line, vx - 7, NB.roofNear - 12, 14, 3);
    c.fill(CM.leafGold, domePath(vx - 3, NB.roofNear - 14, 4, 3));
  }
}

/** The boat's long contours, last (front weight where the form turns; open, overshooting, parallel). */
function contoursInto(b: Batch) {
  const {x0, x1} = NB;
  b.ink(longLine(x0, NB.roofNear, x1, NB.roofNear, 's3nb/cantTop', 'medium'), INK_PX.front, CM.ink, 0.22);
  b.ink(longLine(x0, NB.cabin1, x1, NB.cabin1, 's3nb/cabBase', 'medium'), INK_PX.front, CM.ink, 0.25);
  b.ink(longLine(x0, NB.roofFar, x1, NB.roofFar, 's3nb/roofFar'), INK_PX.mid, CM.ink, 0.35);
  b.ink(longLine(x0, NB.water, x1, NB.water, 's3nb/water'), INK_PX.far, CM.ink, 0.5);
  // the doors' edges and the panel's oval
  let dd = '';
  for (let k = 0; k < 2; k++) {
    const dx = DOORS.x0 + k * (DW + 4);
    dd += line(dx, DOORS.y0, dx, DOORS.y1, {seed: `s3nb/dl${k}`, over: 'small', drift: 0.1}) + line(dx + DW, DOORS.y0, dx + DW, DOORS.y1, {seed: `s3nb/dr${k}`, over: 'small', drift: 0.1});
  }
  dd += line(DOORS.x0, DOORS.y0, DOORS.x1, DOORS.y0, {seed: 's3nb/dt', over: 'small', drift: 0.1});
  b.ink(dd, INK_PX.mid, CM.ink, 0.2);
  b.ink(ellipseInk(PANEL.x, PANEL.y, PANEL.rx + 7, PANEL.ry + 7, {seed: 's3nb/panelInk', wobble: 0.015}), INK_PX.far, CM.ink, 0.25);
  b.ink(line(SALOON.x0 - 9, SALOON.y0 - 9, SALOON.x0 - 9, SALOON.y1 + 9, {seed: 's3nb/salL', over: 'small', drift: 0.1}) + line(SALOON.x0 - 9, SALOON.y1 + 9, SALOON.x1 + 20, SALOON.y1 + 9, {seed: 's3nb/salB', over: 'small', drift: 0.1}), INK_PX.far, CM.ink, 0.2);
}

// ---------------------------------------------------------------- life (per frame, few nodes)

/** Herbs and geraniums: foliage that sways in the canal breeze (tips move every frame; leaves flick). */
function herbsInto(L: Levels, t: number) {
  const breeze = (ph: number, amp: number) => amp * (0.7 * Math.sin(t * 2.3 + ph) + 0.3 * Math.sin(t * 5.1 + ph * 1.7));
  const a = L.at(0);
  const c = L.at(1);
  let stems = '';
  for (const [i, p] of HERB_POTS.entries()) {
    const top = p.y - p.h;
    const r = rng(`s3nb/herb${i}`);
    if (p.kind === 'rosemary') {
      for (let k = 0; k < 7; k++) {
        const bx = p.x - p.w * 0.32 + (p.w * 0.64 * k) / 6;
        const Lh = r.range(26, 40);
        const sw = breeze(i + k, 3.2);
        stems += `M${P(bx, top + 2)}Q${P(bx + sw * 0.4, top - Lh * 0.5)} ${P(bx + sw, top - Lh)}`;
        for (let n = 1; n < 4; n++) {
          const yy = top - (Lh * n) / 4;
          const xx = bx + (sw * n) / 4;
          c.fill(CM.sage, leafPath(xx + 4, yy, 9, 2.2, -30 + sw));
          c.fill(CM.sage, leafPath(xx - 4, yy - 2, 9, 2.2, 210 + sw));
        }
      }
    } else if (p.kind === 'basil') {
      a.fill(CM.sage, lobes(p.x - p.w * 0.62 + breeze(i, 1.2), p.x + p.w * 0.62 + breeze(i + 1, 1.2), top + 4, p.h * 1.25, `s3nb/basil${i}`, 4));
      for (let k = 0; k < 6; k++) {
        const ang = -150 + k * 24 + breeze(i + k, 8);
        c.fill(k % 2 ? CM.leafGold : CM.paper, leafPath(p.x + (k - 2.5) * 7 + breeze(i + k, 1.6), top - p.h * 0.55 + Math.abs(k - 2.5) * 4, 13, 4.4, ang));
      }
    } else if (p.kind === 'thyme') {
      a.fill(CM.sage, lobes(p.x - p.w * 0.7, p.x + p.w * 0.7, top + 3, p.h * 0.9, `s3nb/thyme${i}`, 5));
      for (let k = 0; k < 5; k++) c.fill(CM.blossom, ovalPath(p.x - 12 + k * 6 + breeze(i + k, 1), top - 10 - (k % 2) * 5, 2.2, 2.2));
    } else {
      a.fill(CM.sage, lobes(p.x - p.w * 0.66, p.x + p.w * 0.66, top + 3, p.h * 1.15, `s3nb/chil${i}`, 4));
      for (let k = 0; k < 4; k++) {
        const px = p.x - 12 + k * 8 + breeze(i + k, 1.6);
        const py = top - 12 - (k % 2) * 9;
        c.fill(CM.leafRust, leafPath(px, py + 6, 13, 3.4, 80 + breeze(k, 10)));
      }
    }
  }
  c.ink(stems, 1.6, CM.line);
  // geraniums in the trough (cut by the right edge)
  a.fill(CM.sage, lobes(1066, 1210, 1298, 34, 's3nb/ger', 6));
  for (let k = 0; k < 6; k++) {
    const gx = 1076 + k * 22 + breeze(k * 1.3, 2);
    const gy = 1268 - (k % 3) * 6 + breeze(k, 1);
    c.fill(k % 2 ? CM.blossom : CM.box, ovalPath(gx, gy, 8, 7));
  }
  const dlev = L.at(2);
  for (let k = 0; k < 6; k++) {
    const gx = 1076 + k * 22 + breeze(k * 1.3, 2);
    const gy = 1268 - (k % 3) * 6 + breeze(k, 1);
    dlev.fill(k % 2 ? CM.box : CM.brick, ovalPath(gx + 2, gy + 1, 3.4, 3));
  }
  // ink on the foliage masses (open: they carry the form against the water behind)
  let fo = '';
  for (const [i, p] of HERB_POTS.entries()) {
    if (p.kind === 'rosemary') continue;
    const top = p.y - p.h;
    fo += arcInk(p.x + breeze(i, 0.8), top + 2, p.w * 0.62, p.h * (p.kind === 'thyme' ? 0.8 : 1.1), 200, 340, {seed: `s3nb/fo${i}`});
  }
  fo += arcInk(1150, 1298, 90, 34, 200, 300, {seed: 's3nb/gerInk'});
  dlev.ink(fo, INK_PX.hair, CM.ink);
}

/** The porthole interiors (warm lamp-lit glass + what is inside), drawn per frame under the curtains. */
function portholesBack(L: Levels) {
  const g0 = L.at(0);
  const g1 = L.at(1);
  const g2 = L.at(2);
  for (const h of PORTHOLES) {
    const {x, y, r} = h;
    g0.fill(CM.lamp, ovalPath(x, y, r, r));
    g1.fill(CM.lampCore, ovalPath(x - r * 0.28, y - r * 0.32, r * 0.4, r * 0.34));
    if (h.inside === 'plant') {
      g1.rect(CM.line, x - r, y + r * 0.62, r * 2, 3);
      g1.fill(CM.brick, potPath(x + 6, y + r * 0.62, 16, 12));
      g2.fill(CM.sage, lobes(x - 8, x + 20, y + r * 0.62 - 10, 24, 's3nb/pp', 3));
    } else if (h.inside === 'shelf') {
      g1.rect(CM.line, x - r, y + 7, r * 2, 3);
      g2.rect(CM.coatSlate, x - 12, y - 5, 7, 12);
      g2.rect(CM.brick, x - 2, y - 9, 8, 16);
      g2.rect(CM.coatOat, x + 9, y - 2, 6, 9);
    } else if (h.inside === 'kettle') {
      g1.rect(CM.line, x - r, y + 11, r * 2, 3);
      g2.fill(CM.coatSlate, domePath(x + 4, y + 11, 11, 14));
      g2.rect(CM.coatSlate, x + 12, y - 1, 9, 3);
    } else {
      // a hanging lamp shade (the passer-by crosses behind it: walkerInto)
      g1.fill(CM.box, `M${P(x - 9, y - r * 0.55)}L${P(x + 9, y - r * 0.55)}L${P(x + 13, y - r * 0.3)}L${P(x - 13, y - r * 0.3)}Z`);
    }
  }
}

/** Curtains (their inner edges sway a little: a draught through the hatch), the rods, then the cream rims with brass
 *  dogs and the door ports. Drawn per frame over the interiors. */
function portholesFront(L: Levels, t: number) {
  const cu = L.at(0);
  const rod = L.at(1);
  const rim = L.at(2);
  const dog = L.at(3);
  for (const [i, h] of PORTHOLES.entries()) {
    const {x, y, r} = h;
    const sw = 1.6 * Math.sin(t * 1.7 + i * 1.9) + 0.8 * Math.sin(t * 3.9 + i);
    cu.fill(h.curtain, `M${P(x - r - 1, y - r * 0.85)}Q${P(x - r * 0.15 + sw, y - r * 0.9)} ${P(x - r * 0.38 + sw * 0.6, y + r * 0.1)}Q${P(x - r * 0.6, y + r * 0.5)} ${P(x - r - 1, y + r * 0.62)}Z`);
    cu.fill(h.curtain, `M${P(x + r + 1, y - r * 0.85)}Q${P(x + r * 0.15 + sw * 0.7, y - r * 0.9)} ${P(x + r * 0.38 + sw * 0.4, y + r * 0.1)}Q${P(x + r * 0.6, y + r * 0.5)} ${P(x + r + 1, y + r * 0.62)}Z`);
    rod.rect(CM.line, x - r, y - r * 0.92, r * 2, 2.6);
    const R = r + 9;
    rim.fill(CM.coatOat, ringPath(x, y, R, R, r, r));
    for (const a of [-0.6, 1.2, 2.9]) dog.fill(CM.coatMustard, ovalPath(x + Math.cos(a + i) * (R - 4.5), y + Math.sin(a + i) * (R - 4.5), 2.6, 2.6));
    dog.ink(circleInk(x, y, R, {seed: `s3nb/ph${i}`, wobble: 0.02}), INK_PX.far, CM.ink, 0.2);
  }
  for (let k = 0; k < 2; k++) {
    const cx = DOORS.x0 + k * (DW + 4) + DW / 2;
    const cy = DOORS.y0 + 34;
    const sw = 1.2 * Math.sin(t * 1.9 + k * 2.4);
    rim.fill(CM.coatMustard, ringPath(cx, cy, 17, 17, 12, 12));
    cu.fill(CM.lamp, ovalPath(cx, cy, 12.5, 12.5));
    rod.fill(k ? CM.box : CM.blossom, `M${P(cx - 12, cy - 8)}Q${P(cx - 4 + sw, cy - 10)} ${P(cx - 5 + sw, cy + 4)}L${P(cx - 12, cy + 6)}Z`);
    dog.ink(circleInk(cx, cy, 17, {seed: `s3nb/dp${k}`, wobble: 0.02}), INK_PX.hair, CM.ink, 0.3);
  }
}

/** Someone crossing the saloon behind porthole 2 (13.42-14.12): a plum head-and-shoulders, clipped to the glass. */
const WALKER = {t0: 13.42, dur: 0.7};
function walkerInto(b: Batch, t: number) {
  const h = PORTHOLES[1];
  const k = (t - WALKER.t0) / WALKER.dur;
  if (k < -0.05 || k > 1.05) return;
  const px = lerp(h.x - h.r * 2.2, h.x + h.r * 2.2, k);
  const steps = Math.floor(t * 12) / 12;
  const by = Math.abs(Math.sin(steps * Math.PI * 3.2)) * 1.4;
  b.fill(CM.anchor, ovalPath(px, h.y - 8 - by, 10, 11));
  b.fill(CM.anchor, `M${P(px - 24, h.y + h.r + 4)}L${P(px - 22, h.y + 10 - by)}Q${P(px, h.y - 2 - by)} ${P(px + 22, h.y + 10 - by)}L${P(px + 24, h.y + h.r + 4)}Z`);
}

/** Rope fenders hanging from the gunwale over the hull (they swing a hair as the boat rocks). */
function fendersInto(L: Levels, t: number) {
  const a = L.at(0);
  const c = L.at(1);
  for (const [i, fx] of NB.fenders.entries()) {
    const sw = 1.4 * Math.sin(t * 1.3 + i * 2.1);
    const topY = NB.cabin1 + 6;
    const fy0 = NB.gun1 + 4;
    const fy1 = NB.water + 10;
    const cx = fx + sw;
    a.ink(`M${P(fx, topY)}L${P(cx, fy0)}`, 2.6, CM.line);
    a.fill(CM.coatOat, rr(cx - 17, fy0, 34, fy1 - fy0, 14));
    c.fill(CM.leafGold, rr(cx + 5, fy0 + 3, 9, fy1 - fy0 - 6, 5));
    let tw = '';
    for (let y = fy0 + 6; y < fy1 - 3; y += 6) tw += `M${P(cx - 14, y)}Q${P(cx, y + 3.5)} ${P(cx + 14, y)}`;
    c.ink(tw, 1.2, CM.line);
    c.ink(rr(cx - 17, fy0, 34, fy1 - fy0, 14), INK_PX.far, CM.ink, 0.3);
  }
}

/** The moored bob: a slow ~1.3 px rise and fall (the boat is alive; the coping is not). */
export const boatBob = (t: number) => 1.3 * Math.sin(t * 2.1 + 0.4) + 0.4 * Math.sin(t * 4.7);

const CLIP_ID = 's3nbWalkerClip';

/** Our narrowboat (static batch + per-frame life). WORLD px at the match. */
export const S3Boat: React.FC = () => {
  const t = useTime();
  const stat = useMemo(() => {
    const L = new Levels();
    cabinInto(L);
    roofInto(L);
    const b = L.merge();
    contoursInto(b);
    return b;
  }, []);
  const back = useMemo(() => {
    const L = new Levels();
    portholesBack(L);
    return L.merge();
  }, []);
  const walker = new Batch();
  walkerInto(walker, t);
  const front = new Levels();
  portholesFront(front, t);
  const herbs = new Levels();
  herbsInto(herbs, t);
  const fend = new Levels();
  fendersInto(fend, t);
  const dy = boatBob(t);
  const ch = NB.chimney;
  const ph = PORTHOLES[1];
  return (
    <XG m={mat.translate(0, dy)}>
      <Paint b={stat} seed="s3nboat" />
      <Paint b={back} seed="s3nbBack" misreg={false} />
      <defs>
        <clipPath id={CLIP_ID} clipPathUnits="userSpaceOnUse">
          <circle cx={ph.x} cy={ph.y} r={ph.r} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${CLIP_ID})`}>
        <Paint b={walker} seed="s3nbWalker" misreg={false} />
      </g>
      <Paint b={front.merge()} seed="s3nbFront" />
      <Paint b={herbs.merge()} seed="s3nbHerbs" />
      <Paint b={fend.merge()} seed="s3nbFend" />
      <Puffs x={ch.x} y={ch.top - 10} seed="s3nb/smoke" kind="smoke" scale={1.25} drift={26} bursts={[13.62]} />
    </XG>
  );
};
