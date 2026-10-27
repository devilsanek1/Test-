// V2S3_nboat.tsx (lane L3, V2S3 NEAR helper; WORLD px at the 12.98 match, inside V2S3's camera): OUR moored
// narrowboat, the bottom third's main mass, cut by both edges. The SAME boat as V2S4's foreground boat
// (V2S4_wboat.tsx: its livery is mapped onto this view, see the cabin section): a SAGE cabin side under a brick
// cantrail painted with diamonds, cream coach-line frames, ONE plum gunwale stripe with a mustard edge, cream
// portholes with brass rings, lamp-lit inside at sunset with curtains (a pot plant behind one, a window box under
// another, someone passing behind a third), the side doors painted with roses (no lettering), the castle medallion,
// T-studs, rope fenders hanging from the roof rail, a slate hull with its rubbing strake; the roof seen from a little
// above (the towpath is higher than the water) with grab rails, dressed: a boat pole and a plank, herb pots, the
// pigeon box, a coiled rope, a folded bike, the stove chimney (smoke, clamped under the band), a watering can, a
// painted Buckby can, a lifebuoy, mushroom vents and a geranium trough cut by the right edge. Life: smoke, curtains,
// herbs, the passer-by inside, the fenders, a slow moored bob.
//
// Layout (world y): roof far edge 1262 · roof 1262-1326 · cantrail 1326-1346 · cabin side 1346-1570 · plum stripe
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
  /** The mooring T-stud on the gunwale (the rope to our coping's ring starts here; S4's left T-stud, mapped). */
  dolly: [22, 1561] as Pt,
  /** Rope fenders hang from the roof's near rail down the cabin side at these x (S4's three, mapped, + one more). */
  fenders: [144, 350, 625, 1062],
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
// The livery follows V2S4_wboat.tsx (the same boat, seen bigger in V2S4): S4's cabin section is mapped onto this one at
// S3's scale (S4 x -> 166 + (x - 270) * 0.66; S4's 350 px cabin side = S3's 230 px), so the brick cantrail painted with
// diamonds, the cream coach-line frames, the rose-painted side doors, the castle medallion, the brass-ringed portholes
// (a pot plant behind one, a window box under another) and the T-studs sit where S4 shows them; S3 sees more of the
// boat to the right (two more portholes, the saloon window cut by the edge). At sunset the glass is lamp-lit.
const SK = 0.66;
const s4x = (x4: number) => 166 + (x4 - 270) * SK;
const CANT1 = NB.roofNear + 20; // the cantrail band (S4's 30 px)

type Porthole = {x: number; y: number; r: number; curtain: string; inside: 'plant' | 'walker' | 'shelf' | 'kettle' | 'lamp'; box?: boolean};
export const PORTHOLES: Porthole[] = [
  {x: s4x(128), y: 1442, r: 26, curtain: CM.box, inside: 'lamp'},
  {x: s4x(612), y: 1442, r: 26, curtain: CM.leafRust, inside: 'plant'},
  {x: s4x(740), y: 1442, r: 26, curtain: CM.blossom, inside: 'shelf', box: true},
  {x: s4x(1022), y: 1442, r: 26, curtain: CM.coatMustard, inside: 'kettle'},
  {x: 812, y: 1442, r: 26, curtain: CM.box, inside: 'walker'},
  {x: 1012, y: 1442, r: 26, curtain: CM.leafRust, inside: 'shelf'},
];
/** The porthole someone passes behind (13.42-14.12). */
const WALKER_PORT = 4;
/** The rectangular saloon window cut by the right edge; the castle medallion; the side doors (S4's, mapped). */
const SALOON = {x0: 1092, x1: 1214, y0: 1388, y1: 1492};
const CASTLE = {x: s4x(890), y: 1444, rx: 66 * SK, ry: 62 * SK};
const DOORS = {x0: s4x(270), x1: s4x(514), y0: 1370, y1: 1558};
const DMID = (DOORS.x0 + DOORS.x1) / 2;
const LEAVES: [number, number][] = [[DOORS.x0, DMID - 1.5], [DMID + 1.5, DOORS.x1]];

/** A rounded-rect RING (outer clockwise, inner counter-clockwise: a hole under the nonzero rule). */
function ringRR(x0: number, y0: number, x1: number, y1: number, r: number, w: number): string {
  const one = (a: number, b: number, c: number, d: number, k: number, ccw: boolean) => {
    if (!ccw) return `M${P(a + k, b)}L${P(c - k, b)}Q${P(c, b)} ${P(c, b + k)}L${P(c, d - k)}Q${P(c, d)} ${P(c - k, d)}L${P(a + k, d)}Q${P(a, d)} ${P(a, d - k)}L${P(a, b + k)}Q${P(a, b)} ${P(a + k, b)}Z`;
    return `M${P(a + k, b)}Q${P(a, b)} ${P(a, b + k)}L${P(a, d - k)}Q${P(a, d)} ${P(a + k, d)}L${P(c - k, d)}Q${P(c, d)} ${P(c, d - k)}L${P(c, b + k)}Q${P(c, b)} ${P(c - k, b)}Z`;
  };
  return one(x0, y0, x1, y1, r, false) + one(x0 + w, y0 + w, x1 - w, y1 - w, Math.max(1, r - w), true);
}

/** A painted rose (S4's recipe): a disc, three swirl strokes into `swirl`. */
function roseInto(b: Batch, x: number, y: number, R: number, c: string, seed: string, swirl: string[]) {
  const r = rng(seed);
  b.fill(c, ovalPath(x, y, R, R * 0.86));
  let d = '';
  for (let k = 0; k < 3; k++) {
    const a = r.range(0, 6.28);
    d += `M${P(x + Math.cos(a) * R * 0.2, y + Math.sin(a) * R * 0.18)}A${(R * 0.62).toFixed(1)} ${(R * 0.5).toFixed(1)} 0 0 1 ${P(x + Math.cos(a + 2.2) * R * 0.72, y + Math.sin(a + 2.2) * R * 0.6)}`;
  }
  swirl.push(d);
}

function cabinInto(L: Levels) {
  const {x0, x1} = NB;
  const W = x1 - x0;
  // ---- level 0: the bands (backing water under the roof's far edge, roof, cantrail, cabin side, stripe, hull)
  const b0 = L.at(0);
  b0.rect(CM.water, x0, NB.roofFar - 8, W, 30);
  b0.rect(CM.stucco, x0, NB.roofFar, W, NB.roofNear - NB.roofFar);
  b0.rect(CM.brickDeep, x0, NB.roofNear, W, CANT1 - NB.roofNear);
  b0.rect(CM.sage, x0, CANT1, W, NB.cabin1 - CANT1);
  b0.rect(CM.anchor, x0, NB.cabin1, W, NB.gun1 - NB.cabin1);
  b0.rect(CM.paneUnlit, x0, NB.gun1, W, NB.water - NB.gun1 + 2);
  // ---- level 1: on the bands: the roof's far shade and rolled near edge, the camber catching the low sun, the cream
  // coach line under the cantrail, the cabin's foot shade, the stripe's mustard edge, the strake
  const b1 = L.at(1);
  b1.rect(CM.stoneShade, x0, NB.roofFar, W, 5);
  b1.rect(CM.limestone, x0, NB.roofNear - 6, W, 6);
  b1.rect(CM.paper, x0, NB.roofFar + 24, W, 4);
  b1.rect(CM.coatOat, x0, CANT1, W, 2.4);
  b1.rect(CM.stoneShade, x0, NB.cabin1 - 5, W, 5);
  b1.rect(CM.coatMustard, x0, NB.gun1 - 2, W, 1.8);
  b1.rect(CM.shadeCool, x0, NB.gun1 + 12, W, 3.4);
  // cream coach-line frames round the sage panels (S4's, mapped), and one more panel past S4's view
  for (const [a, c] of [[s4x(-30), s4x(238)], [s4x(532), s4x(828)], [s4x(956), s4x(1160)], [s4x(1190), x1 + 40]] as [number, number][]) {
    b1.fill(CM.coatOat, ringRR(a, CANT1 + 13, c, NB.cabin1 - 16, 12, 2.6));
  }
  // diamonds painted along the cantrail (mustard and paper), brass vents on it
  for (let x = s4x(20); x < x1; x += 58 * SK) {
    const c = Math.round((x - s4x(20)) / (58 * SK)) % 2 ? CM.coatMustard : CM.paper;
    const cy = NB.roofNear + 10;
    b1.poly(c, [[x, cy - 5.3], [x + 6, cy], [x, cy + 5.3], [x - 6, cy]]);
  }
  // the grab rails (wood) on stanchions, far and near
  for (const [y, h] of [[NB.roofFar + 2, 7], [NB.roofNear - 4, 8]] as [number, number][]) {
    b1.rect(CM.line, x0, y - h, W, 3);
    for (let x = x0 + 30; x < x1; x += 80) b1.rect(CM.line, x, y - h, 3, h);
  }
  // T-studs on the gunwale
  for (const x of [s4x(52), s4x(588), s4x(1066), 990]) {
    b1.rect(CM.anchor, x - 3.3, NB.cabin1 - 9, 6.6, 9);
    b1.rect(CM.anchor, x - 6.6, NB.cabin1 - 12, 13.2, 3.4);
  }
  // ---- level 2: porthole rims (cream: per frame, with the curtains), the door frame, the castle's cream ring, the saloon frame
  const b2 = L.at(2);
  b2.rect(CM.line, DOORS.x0 - 6, DOORS.y0 - 6, DOORS.x1 - DOORS.x0 + 12, DOORS.y1 - DOORS.y0 + 8);
  b2.fill(CM.coatOat, ovalPath(CASTLE.x, CASTLE.y, CASTLE.rx + 4, CASTLE.ry + 4));
  b2.fill(CM.coatOat, ringRR(SALOON.x0 - 9, SALOON.y0 - 9, SALOON.x1 + 9, SALOON.y1 + 9, 14, 9));
  for (const x of [s4x(196), s4x(566), s4x(956), 930]) {
    b2.rect(CM.coatMustard, x - 8, NB.roofNear + 4, 16, 10);
    b2.rect(CM.line, x - 5.3, NB.roofNear + 6.6, 10.6, 1.5);
    b2.rect(CM.line, x - 5.3, NB.roofNear + 9.2, 10.6, 1.5);
  }
  // ---- level 3: the door leaves (brick), the castle's paper ground, the saloon's lamp-lit glass
  const b3 = L.at(3);
  for (const [a, c] of LEAVES) b3.rect(CM.brickDeep, a, DOORS.y0, c - a, DOORS.y1 - DOORS.y0);
  b3.fill(CM.paper, ovalPath(CASTLE.x, CASTLE.y, CASTLE.rx, CASTLE.ry));
  b3.fill(CM.lamp, `M${P(SALOON.x0, SALOON.y0)}L${P(SALOON.x1, SALOON.y0)}L${P(SALOON.x1, SALOON.y1)}L${P(SALOON.x0, SALOON.y1)}Z`);
  // ---- level 4: the door panels (cream border, paper ground), the castle's lake and hills, the saloon's interior
  const b4 = L.at(4);
  for (const [a, c] of LEAVES) {
    b4.fill(CM.coatOat, ringRR(a + 6.6, DOORS.y0 + 8, c - 6.6, DOORS.y1 - 8, 6.6, 3.3));
    b4.rect(CM.paper, a + 10, DOORS.y0 + 11.3, c - a - 20, DOORS.y1 - DOORS.y0 - 22.6);
  }
  const cs = CASTLE.rx / 50;
  const CX = CASTLE.x;
  const CY = CASTLE.y;
  b4.fill(CM.water, `M${P(CX - 46 * cs, CY + 26 * cs)}Q${P(CX, CY + 18 * cs)} ${P(CX + 46 * cs, CY + 26 * cs)}Q${P(CX, CY + 44 * cs)} ${P(CX - 46 * cs, CY + 26 * cs)}Z`);
  b4.fill(CM.sage, lobes(CX - 50 * cs, CX - 8 * cs, CY + 24 * cs, 18 * cs, 'castleHillA', 2));
  b4.fill(CM.sage, lobes(CX + 10 * cs, CX + 50 * cs, CY + 24 * cs, 15 * cs, 'castleHillB', 2));
  b4.rect(CM.lampCore, SALOON.x0 + 10, SALOON.y0 + 26, 34, 50);
  b4.rect(CM.line, SALOON.x0 + 4, SALOON.y0 + 44, 110, 4);
  for (const [jx, jh, jc] of [[SALOON.x0 + 52, 16, CM.brick], [SALOON.x0 + 66, 11, CM.coatSlate], [SALOON.x0 + 80, 19, CM.sage]] as [number, number, string][]) b4.rect(jc, jx, SALOON.y0 + 44 - jh, 10, jh);
  b4.fill(CM.box, `M${P(SALOON.x0 + 18, SALOON.y0 + 12)}L${P(SALOON.x0 + 36, SALOON.y0 + 12)}L${P(SALOON.x0 + 42, SALOON.y0 + 26)}L${P(SALOON.x0 + 12, SALOON.y0 + 26)}Z`);
  // ---- level 5: leaves on the door panels, the castle (towers, walls), the valance and the sill pots
  const b5 = L.at(5);
  for (const [a, c] of LEAVES) {
    const cx = (a + c) / 2;
    const cy = (DOORS.y0 + DOORS.y1) / 2 - 14.5;
    const w = c - a - 26.4;
    for (let k = 0; k < 8; k++) {
      const an = (k / 8) * Math.PI * 2 + 0.3;
      b5.fill(CM.sage, leafPath(cx + Math.cos(an) * w * 0.32, cy + Math.sin(an) * w * 0.36, w * 0.32, w * 0.1, (an * 180) / Math.PI));
    }
    b5.fill(CM.sage, leafPath(cx - 4, DOORS.y1 - 30, 17, 4.6, 14));
    b5.fill(CM.sage, leafPath(cx + 9, DOORS.y1 - 34, 14.5, 4, -30));
  }
  b5.rect(CM.brickLight, CX - 22 * cs, CY - 8 * cs, 44 * cs, 30 * cs);
  b5.rect(CM.brickLight, CX - 27 * cs, CY - 24 * cs, 12 * cs, 46 * cs);
  b5.rect(CM.brickLight, CX + 15 * cs, CY - 20 * cs, 12 * cs, 42 * cs);
  b5.poly(CM.brick, [[CX - 29 * cs, CY - 24 * cs], [CX - 21 * cs, CY - 37 * cs], [CX - 13 * cs, CY - 24 * cs]]);
  b5.poly(CM.brick, [[CX + 13 * cs, CY - 20 * cs], [CX + 21 * cs, CY - 33 * cs], [CX + 29 * cs, CY - 20 * cs]]);
  b5.fill(CM.box, `M${P(SALOON.x0, SALOON.y0)}L${P(SALOON.x1, SALOON.y0)}L${P(SALOON.x1, SALOON.y0 + 16)}Q${P(SALOON.x0 + 60, SALOON.y0 + 26)} ${P(SALOON.x0, SALOON.y0 + 16)}Z`);
  b5.fill(CM.brick, potPath(SALOON.x0 + 30, SALOON.y1 - 2, 26, 18));
  b5.fill(CM.coatOat, potPath(SALOON.x0 + 82, SALOON.y1 - 2, 20, 14));
  // ---- level 6: roses over the leaves, the castle's door and lit windows, the sill plants, brass on the doors
  const b6 = L.at(6);
  const sw: string[] = [];
  for (const [a, c] of LEAVES) {
    const cx = (a + c) / 2;
    const cy = (DOORS.y0 + DOORS.y1) / 2 - 14.5;
    const w = c - a - 26.4;
    roseInto(b6, cx, cy, w * 0.18, CM.brick, `s3rose${a}a`, sw);
    roseInto(b6, cx - w * 0.24, cy + w * 0.2, w * 0.12, CM.box, `s3rose${a}b`, sw);
    roseInto(b6, cx + w * 0.24, cy + w * 0.16, w * 0.12, CM.blossom, `s3rose${a}c`, sw);
    roseInto(b6, cx + w * 0.05, cy - w * 0.28, w * 0.1, CM.coatMustard, `s3rose${a}d`, sw);
    roseInto(b6, cx - 10.5, DOORS.y1 - 37, 6.6, CM.box, `s3posy${a}`, sw);
    roseInto(b6, cx + 10.5, DOORS.y1 - 39.6, 6, CM.coatMustard, `s3posy2${a}`, sw);
  }
  b6.ink(sw.join(''), 1.1, CM.ink);
  b6.rect(CM.anchor, CX - 4 * cs, CY + 8 * cs, 8 * cs, 14 * cs);
  b6.rect(CM.lamp, CX - 23 * cs, CY - 16 * cs, 4 * cs, 5 * cs);
  b6.rect(CM.lamp, CX + 19 * cs, CY - 12 * cs, 4 * cs, 5 * cs);
  b6.fill(CM.sage, lobes(SALOON.x0 + 10, SALOON.x0 + 52, SALOON.y1 - 18, 30, 's3nb/sal1', 3));
  b6.fill(CM.sage, lobes(SALOON.x0 + 68, SALOON.x0 + 98, SALOON.y1 - 14, 22, 's3nb/sal2', 3));
  for (const hy of [DOORS.y0 + 24, DOORS.y1 - 24]) {
    b6.rect(CM.coatMustard, DOORS.x0 - 4.6, hy - 2.6, 10.6, 5.3);
    b6.rect(CM.coatMustard, DOORS.x1 - 6, hy - 2.6, 10.6, 5.3);
  }
  b6.fill(CM.coatMustard, ovalPath(DMID - 8, (DOORS.y0 + DOORS.y1) / 2 + 22, 4, 4));
  b6.fill(CM.coatMustard, ovalPath(DMID + 8, (DOORS.y0 + DOORS.y1) / 2 + 22, 4, 4));
  // daisies on the door panels (mustard, on the paper ground)
  for (const [a, c] of LEAVES) {
    const cx = (a + c) / 2;
    const cy = (DOORS.y0 + DOORS.y1) / 2 - 14.5;
    const w = c - a - 26.4;
    const rr = rng(`s3daisy${a}`);
    for (let k = 0; k < 4; k++) {
      const dx = cx + rr.range(-w * 0.38, w * 0.38);
      const dy = cy + rr.range(-w * 0.1, w * 0.5);
      for (let q = 0; q < 5; q++) b6.fill(CM.coatMustard, ovalPath(dx + Math.cos((q * 6.28) / 5) * 2.6, dy + Math.sin((q * 6.28) / 5) * 2.6, 1.8, 1.8));
    }
  }
}

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
  c.ink(`M${P(wA[0], wA[1])}L${P(g[0] + 2, g[1] - 44)}L${P(wB[0], wB[1])}M${P(g[0] + 2, g[1] - 44)}L${P(g[0] - 2, g[1] - 86)}M${P(g[0] + 2, g[1] - 44)}L${P(g[0] + 22, g[1] - 70)}L${P(g[0] + 34, g[1] - 72)}`, 5, CM.brickDeep);
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
  // the door frame and its middle, the castle's ring, the saloon frame (S4's strokes, mapped)
  let m = '';
  m += line(DOORS.x0 - 6, DOORS.y0 - 6, DOORS.x1 + 6, DOORS.y0 - 6, {seed: 's3door/t', over: 'small', drift: 0.1}) + line(DOORS.x0 - 6, DOORS.y0 - 6, DOORS.x0 - 6, DOORS.y1 + 2, {seed: 's3door/l', over: 'small', drift: 0.1}) + line(DOORS.x1 + 6, DOORS.y0 - 6, DOORS.x1 + 6, DOORS.y1 + 2, {seed: 's3door/r', over: 'small', drift: 0.1});
  m += line(DMID, DOORS.y0, DMID, DOORS.y1, {seed: 's3door/m', over: 'none', drift: 0.05});
  m += `M${P(CASTLE.x - CASTLE.rx - 4, CASTLE.y)}A${(CASTLE.rx + 4).toFixed(1)} ${(CASTLE.ry + 4).toFixed(1)} 0 0 1 ${P(CASTLE.x + CASTLE.rx + 4, CASTLE.y)}`;
  m += line(SALOON.x0 - 9, SALOON.y0 - 9, SALOON.x0 - 9, SALOON.y1 + 9, {seed: 's3nb/salL', over: 'small', drift: 0.1}) + line(SALOON.x0 - 9, SALOON.y1 + 9, SALOON.x1 + 20, SALOON.y1 + 9, {seed: 's3nb/salB', over: 'small', drift: 0.1});
  b.ink(m, INK_PX.mid, CM.ink, 0.3);
}

// ---------------------------------------------------------------- life (per frame, few nodes)

/** Herbs and geraniums: foliage that sways in the canal breeze (tips move every frame; leaves flick). */
function herbsInto(L: Levels, t: number) {
  const breeze = (ph: number, amp: number) => amp * (0.7 * Math.sin(t * 2.3 + ph) + 0.3 * Math.sin(t * 5.1 + ph * 1.7));
  const a = L.at(0);
  const c = L.at(1);
  let stems = '';
  let outline = '';
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
      const lb = lobes(p.x - p.w * 0.62 + breeze(i, 1.2), p.x + p.w * 0.62 + breeze(i + 1, 1.2), top + 4, p.h * 1.25, `s3nb/basil${i}`, 4);
      a.fill(CM.sage, lb);
      outline += lb;
      for (let k = 0; k < 6; k++) {
        const ang = -150 + k * 24 + breeze(i + k, 8);
        c.fill(k % 2 ? CM.glass : CM.sage, leafPath(p.x + (k - 2.5) * 7 + breeze(i + k, 1.6), top - p.h * 0.55 + Math.abs(k - 2.5) * 4, 13, 4.4, ang));
      }
    } else if (p.kind === 'thyme') {
      const lb = lobes(p.x - p.w * 0.7 + breeze(i, 0.8), p.x + p.w * 0.7 + breeze(i + 2, 0.8), top + 3, p.h * 0.9, `s3nb/thyme${i}`, 5);
      a.fill(CM.sage, lb);
      outline += lb;
      for (let k = 0; k < 5; k++) c.fill(CM.blossom, ovalPath(p.x - 12 + k * 6 + breeze(i + k, 1), top - 10 - (k % 2) * 5, 2.2, 2.2));
    } else {
      const lb = lobes(p.x - p.w * 0.66 + breeze(i, 1), p.x + p.w * 0.66 + breeze(i + 3, 1), top + 3, p.h * 1.15, `s3nb/chil${i}`, 4);
      a.fill(CM.sage, lb);
      outline += lb;
      for (let k = 0; k < 4; k++) {
        const px = p.x - 12 + k * 8 + breeze(i + k, 1.6);
        const py = top - 12 - (k % 2) * 9;
        c.fill(CM.leafRust, leafPath(px, py + 6, 13, 3.4, 80 + breeze(k, 10)));
      }
    }
  }
  c.ink(stems, 1.6, CM.line);
  // geraniums in the trough (cut by the right edge)
  const ger = lobes(1066 + breeze(7, 1.2), 1210, 1298, 34, 's3nb/ger', 6);
  a.fill(CM.sage, ger);
  outline += ger;
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
  // ink on the foliage masses: their own lobed outline, left open in places (it carries the form against the water)
  a.ink(outline, INK_PX.hair, CM.ink, 0.4);
}

/** The porthole interiors (warm lamp-lit glass + what is inside), static, under the curtains. */
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
      g2.fill(CM.leafGold, leafPath(x + 9, y - 6, 12, 4, -40));
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

/** Curtains, tied back; their inner edges sway a little (a draught through the hatch). Per frame. */
function curtainsInto(b: Batch, t: number) {
  for (const [i, h] of PORTHOLES.entries()) {
    const {x, y, r} = h;
    const sw = 1.6 * Math.sin(t * 1.7 + i * 1.9) + 0.8 * Math.sin(t * 3.9 + i);
    b.fill(h.curtain, `M${P(x - r - 1, y - r * 0.85)}Q${P(x - r * 0.15 + sw, y - r * 0.9)} ${P(x - r * 0.38 + sw * 0.6, y + r * 0.1)}Q${P(x - r * 0.6, y + r * 0.5)} ${P(x - r - 1, y + r * 0.62)}Z`);
    if (h.inside !== 'plant') b.fill(h.curtain, `M${P(x + r + 1, y - r * 0.85)}Q${P(x + r * 0.15 + sw * 0.7, y - r * 0.9)} ${P(x + r * 0.38 + sw * 0.4, y + r * 0.1)}Q${P(x + r * 0.6, y + r * 0.5)} ${P(x + r + 1, y + r * 0.62)}Z`);
  }
}

/** Static, over the curtains: the curtain rods, the cream rims, the brass rings and their dogs (S4's porthole). */
function portholesFront(L: Levels) {
  const rod = L.at(0);
  const rim = L.at(1);
  const dog = L.at(2);
  for (const [i, h] of PORTHOLES.entries()) {
    const {x, y, r} = h;
    rod.rect(CM.coatMustard, x - r * 0.9, y - r * 0.68, r * 1.8, 2.4);
    rim.fill(CM.coatOat, ringPath(x, y, r + 8, r + 8, r + 2.6, r + 2.6));
    rim.fill(CM.coatMustard, ringPath(x, y, r + 2.6, r + 2.6, r, r));
    for (let k = 0; k < 4; k++) {
      const a = (k / 4) * Math.PI * 2 + 0.4;
      dog.fill(CM.coatMustard, ovalPath(x + Math.cos(a) * (r + 5.3), y + Math.sin(a) * (r + 5.3), 2.3, 2.3));
    }
    dog.ink(circleInk(x, y, r + 8, {seed: `s3nb/ph${i}`, wobble: 0.02}), INK_PX.far, CM.ink, 0.2);
  }
  // the window box under the boxed porthole: a wooden trough of flowers trailing (S4's, mapped)
  const wb = PORTHOLES.find((p) => p.box)!;
  const by = wb.y + 42;
  rod.rect(CM.line, wb.x - 33, by, 66, 14.5);
  rod.rect(CM.brickDeep, wb.x - 34.3, by - 1.3, 68.6, 3.3);
  rim.fill(CM.leafGold, lobes(wb.x - 35.6, wb.x + 35.6, by, 20, 's3wbox', 5));
  rim.fill(CM.leafRust, leafPath(wb.x - 30, by + 18, 14.5, 4, 70));
  rim.fill(CM.leafGold, leafPath(wb.x + 28, by + 21, 17, 4, 100));
  for (let k = 0; k < 7; k++) dog.fill([CM.box, CM.blossom, CM.paper, CM.coatMustard][k % 4], ovalPath(wb.x - 28 + k * 9.2, by - 12 + (k % 3) * 4, 3.4, 3.1));
  dog.ink(lobes(wb.x - 35.6, wb.x + 35.6, by, 20, 's3wbox', 5).replace(/Z$/, ''), 1.2, CM.ink, 0.35);
}

/** Someone crossing the saloon behind a porthole (13.42-14.12): a plum head-and-shoulders, clipped to the glass. */
const WALKER = {t0: 13.42, dur: 0.7};
function walkerInto(b: Batch, t: number) {
  const h = PORTHOLES[WALKER_PORT];
  const k = (t - WALKER.t0) / WALKER.dur;
  if (k < -0.05 || k > 1.05) return;
  const px = lerp(h.x - h.r * 2.2, h.x + h.r * 2.2, k);
  const steps = Math.floor(t * 12) / 12;
  const by = Math.abs(Math.sin(steps * Math.PI * 3.2)) * 1.4;
  b.fill(CM.anchor, ovalPath(px, h.y - 8 - by, 10, 11));
  b.fill(CM.anchor, `M${P(px - 24, h.y + h.r + 4)}L${P(px - 22, h.y + 10 - by)}Q${P(px, h.y - 2 - by)} ${P(px + 22, h.y + 10 - by)}L${P(px + 24, h.y + h.r + 4)}Z`);
}

/** Rope fenders hanging from the roof's near rail down the cabin side (S4's, mapped); they swing with the boat. */
function fendersInto(L: Levels, t: number) {
  const a = L.at(0);
  const c = L.at(1);
  const top = NB.roofNear - 4;
  const fy = NB.cabin1 - 7;
  const rope: string[] = [];
  for (const [i, x] of NB.fenders.entries()) {
    const sw = Math.sin(t * 1.1 + i * 1.9) * 1.2;
    a.ink(`M${P(x, top)}Q${P(x + 2 + sw * 0.4, (top + fy) / 2)} ${P(x + sw, fy)}`, 2.4, CM.coatOat);
    const fx = x + sw;
    c.fill(CM.coatOat, `M${P(fx - 10, fy)}L${P(fx + 10, fy)}Q${P(fx + 12, fy + 21)} ${P(fx + 9, fy + 42)}L${P(fx - 9, fy + 42)}Q${P(fx - 12, fy + 21)} ${P(fx - 10, fy)}Z`);
    let rp = '';
    for (let k = 1; k < 7; k++) rp += `M${P(fx - 10.5, fy + k * 6)}Q${P(fx, fy + k * 6 + 2.6)} ${P(fx + 10.5, fy + k * 6)}`;
    rope.push(rp);
    c.ink(`M${P(fx - 10, fy)}Q${P(fx - 12, fy + 21)} ${P(fx - 9, fy + 42)}`, INK_PX.far, CM.ink, 0.3);
  }
  c.ink(rope.join(''), 1.1, CM.line);
}

/** The moored bob: a slow ~1.3 px rise and fall (the boat is alive; the coping is not). */
export const boatBob = (t: number) => 1.3 * Math.sin(t * 2.1 + 0.4) + 0.4 * Math.sin(t * 4.7);

const CLIP_ID = 's3nbWalkerClip';

/** Our narrowboat (static batches + per-frame life). WORLD px at the match. */
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
  const rims = useMemo(() => {
    const L = new Levels();
    portholesFront(L);
    return L.merge();
  }, []);
  const walker = new Batch();
  walkerInto(walker, t);
  const curtains = new Batch();
  curtainsInto(curtains, t);
  const herbs = new Levels();
  herbsInto(herbs, t);
  const fend = new Levels();
  fendersInto(fend, t);
  const dy = boatBob(t);
  const ch = NB.chimney;
  const ph = PORTHOLES[WALKER_PORT];
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
      <Paint b={curtains} seed="s3nbCurtains" misreg={false} />
      <Paint b={rims} seed="s3nbRims" />
      <Paint b={herbs.merge()} seed="s3nbHerbs" />
      <Paint b={fend.merge()} seed="s3nbFend" />
      <Puffs x={ch.x} y={ch.top - 10} seed="s3nb/smoke" kind="smoke" scale={1.25} drift={26} bursts={[13.62]} />
    </XG>
  );
};
