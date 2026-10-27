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
// 1570-1584 · hull 1584-1616 (waterline). x from -70 to 1170 (S3_BLEED). Low sun at left (96, 652): cast shadows on
// the roof fall right and toward us, as colour (stone shade), never grey.
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


// ---------------------------------------------------------------- small path helpers

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
/** A shadow lying on the roof (a horizontal surface seen at a grazing angle): it runs RIGHT from an item's foot,
 *  away from the low sun at left, dipping only a few px toward us, never past the roof's near edge. */
const roofShadow = (b: Batch, x: number, y: number, w: number, len: number) => {
  const y0 = Math.min(y, NB.roofNear - 10);
  const dip = Math.min(5, NB.roofNear - 8 - y0);
  b.poly(CM.stoneShade, [[x - w * 0.15, y0 - 3], [x + len, y0 - 3 + dip * 0.6], [x + len - 4, y0 + dip], [x - w * 0.1, y0 + 2]]);
};
/** A tapered pot (terracotta), base centre (x, y), top width w, height h. */
const potPath = (x: number, y: number, w: number, h: number) => `M${P(x - w / 2, y - h)}L${P(x + w / 2, y - h)}L${P(x + w * 0.37, y)}L${P(x - w * 0.37, y)}Z`;

// ---------------------------------------------------------------- the static boat (memoised once)

type Porthole = {x: number; y: number; r: number; curtain: [string, string]; inside: 'plant' | 'walker' | 'shelf' | 'kettle' | 'lamp'};
export const PORTHOLES: Porthole[] = [
  {x: 34, y: 1440, r: 25, curtain: [CM.box, CM.box], inside: 'plant'},
  {x: 394, y: 1440, r: 25, curtain: [CM.blossom, CM.blossom], inside: 'walker'},
  {x: 776, y: 1440, r: 25, curtain: [CM.coatMustard, CM.coatMustard], inside: 'shelf'},
  {x: 1012, y: 1440, r: 25, curtain: [CM.leafRust, CM.leafRust], inside: 'kettle'},
];
/** The rectangular saloon window cut by the right edge. */
const SALOON = {x0: 1092, x1: 1214, y0: 1384, y1: 1488};
/** The painted flower panel (an oval on the cabin side), the side doors. */
const PANEL = {x: 566, y: 1452, rx: 94, ry: 62};
const DOORS = {x0: 166, x1: 306, y0: 1362, y1: 1556};

function cabinInto(b: Batch) {
  const {x0, x1} = NB;
  // ---- backing water behind the roof (closes any seam with the far canal), then the roof seen from above
  b.rect(CM.water, x0, NB.roofFar - 8, x1 - x0, 30);
  b.rect(CM.coatOat, x0, NB.roofFar, x1 - x0, NB.roofNear - NB.roofFar);
  // the far grab rail (a wooden rail along the far roof edge) and the near one
  b.rect(CM.line, x0, NB.roofFar + 2, x1 - x0, 4);
  b.rect(CM.limestone, x0, NB.roofNear - 9, x1 - x0, 5);
  // the camber: a light strip down the roof's middle where the low sun catches it
  b.rect(CM.paper, x0, NB.roofFar + 22, x1 - x0, 6);
  // ---- the cant (red oxide band at the roof's edge) and the cabin side
  b.rect(CM.brickDeep, x0, NB.roofNear, x1 - x0, NB.cant - NB.roofNear);
  b.rect(CM.sage, x0, NB.cant, x1 - x0, NB.cabin1 - NB.cant);
  // the shadow under the cant's overhang (cool, a colour, never grey)
  b.rect(CM.shadeCool, x0, NB.cant, x1 - x0, 4);
  // ---- gunwale stripe (ONE plum stripe) and the slate hull with its rubbing strake
  b.rect(CM.anchor, x0, NB.cabin1, x1 - x0, NB.gun1 - NB.cabin1);
  b.rect(CM.paneUnlit, x0, NB.gun1, x1 - x0, NB.water - NB.gun1 + 2);
  b.rect(CM.shadeCool, x0, NB.gun1 + 14, x1 - x0, 4);
  b.layer();
  // ---- the cabin's beading (a light bead over a cool shadow, top and bottom) and the lining-out panels
  b.rect(CM.paper, x0, NB.cant + 8, x1 - x0, 2.4);
  b.rect(CM.shadeCool, x0, NB.cant + 10.4, x1 - x0, 1.6);
  b.rect(CM.paper, x0, NB.cabin1 - 12, x1 - x0, 2.4);
  b.rect(CM.shadeCool, x0, NB.cabin1 - 9.6, x1 - x0, 1.6);
  const panels: [number, number][] = [
    [x0 - 30, DOORS.x0 - 16],
    [DOORS.x1 + 16, 694],
    [710, x1 + 40],
  ];
  for (const [a, c] of panels) {
    b.ink(fancy(a, 1360, c - a, 182, 12), 3, CM.coatOat);
    b.ink(fancy(a + 8, 1368, c - a - 16, 166, 9), 1.4, CM.coatMustard);
  }
  // ---- the side doors: two slate leaves, cream lining, a small brass port each, brass handles, a diamond
  const dw = (DOORS.x1 - DOORS.x0 - 4) / 2;
  for (let k = 0; k < 2; k++) {
    const dx = DOORS.x0 + k * (dw + 4);
    b.fill(CM.paneUnlit, rr(dx, DOORS.y0, dw, DOORS.y1 - DOORS.y0, 6));
    b.ink(fancy(dx + 8, DOORS.y0 + 60, dw - 16, DOORS.y1 - DOORS.y0 - 72, 6), 2, CM.coatOat);
    // a painted diamond on each leaf (mustard with a peach heart)
    const cx = dx + dw / 2;
    const cy = DOORS.y0 + 126;
    b.poly(CM.coatMustard, [[cx, cy - 26], [cx + 15, cy], [cx, cy + 26], [cx - 15, cy]]);
    b.poly(CM.box, [[cx, cy - 13], [cx + 7.5, cy], [cx, cy + 13], [cx - 7.5, cy]]);
    // the handle
    const hx = k === 0 ? dx + dw - 10 : dx + 10;
    b.fill(CM.coatMustard, ovalPath(hx, DOORS.y0 + 100, 4.2, 4.2));
  }
  // the brass sill / step under the doors
  b.rect(CM.coatMustard, DOORS.x0 - 6, DOORS.y1 - 3, DOORS.x1 - DOORS.x0 + 12, 6);
  // ---- the painted flower panel: a slate oval, a mustard lining, roses-and-castles flowers (no lettering)
  flowerPanelInto(b);
  // ---- the saloon window cut by the right edge: cream frame, lamp-lit glass, a valance, plants on the sill
  b.fill(CM.coatOat, rr(SALOON.x0 - 9, SALOON.y0 - 9, SALOON.x1 - SALOON.x0 + 18, SALOON.y1 - SALOON.y0 + 18, 16));
  b.fill(CM.lamp, rr(SALOON.x0, SALOON.y0, SALOON.x1 - SALOON.x0, SALOON.y1 - SALOON.y0, 10));
  b.rect(CM.lampCore, SALOON.x0 + 10, SALOON.y0 + 26, 34, 50);
  // a shelf inside with jars and a lamp shade
  b.rect(CM.line, SALOON.x0 + 4, SALOON.y0 + 44, 110, 4);
  for (const [jx, jh, jc] of [[SALOON.x0 + 52, 16, CM.brick], [SALOON.x0 + 66, 11, CM.coatSlate], [SALOON.x0 + 80, 19, CM.sage]] as [number, number, string][]) b.rect(jc, jx, SALOON.y0 + 44 - jh, 10, jh);
  b.fill(CM.box, `M${P(SALOON.x0 + 18, SALOON.y0 + 12)}L${P(SALOON.x0 + 36, SALOON.y0 + 12)}L${P(SALOON.x0 + 42, SALOON.y0 + 26)}L${P(SALOON.x0 + 12, SALOON.y0 + 26)}Z`);
  // valance
  b.fill(CM.box, `M${P(SALOON.x0, SALOON.y0)}L${P(SALOON.x1, SALOON.y0)}L${P(SALOON.x1, SALOON.y0 + 16)}Q${P(SALOON.x0 + 60, SALOON.y0 + 26)} ${P(SALOON.x0, SALOON.y0 + 16)}Z`);
  // plants on the sill
  b.fill(CM.brick, potPath(SALOON.x0 + 30, SALOON.y1 - 2, 26, 18));
  b.fill(CM.sage, lobes(SALOON.x0 + 10, SALOON.x0 + 52, SALOON.y1 - 18, 30, 's3nb/sal1', 3));
  b.fill(CM.coatOat, potPath(SALOON.x0 + 82, SALOON.y1 - 2, 20, 14));
  b.fill(CM.sage, lobes(SALOON.x0 + 68, SALOON.x0 + 98, SALOON.y1 - 14, 22, 's3nb/sal2', 3));
  b.layer();
  // ---- brass mushroom vents on the roof (near edge) and the roof's cast shadows from the dressing
  for (const vx of [256, 652, 936]) {
    roofShadow(b, vx + 6, NB.roofNear - 12, 18, 26);
    b.fill(CM.coatMustard, domePath(vx, NB.roofNear - 12, 11, 8));
    b.rect(CM.line, vx - 7, NB.roofNear - 12, 14, 3);
  }
  // ---- ink: the boat's main contours (loose, open, overshooting)
  const front = INK_PX.front;
  const mid = INK_PX.mid;
  b.ink(line(x0, NB.roofNear, x1, NB.roofNear, {seed: 's3nb/cantTop', over: 'medium'}), front, CM.ink, 0.22);
  b.ink(line(x0, NB.cabin1, x1, NB.cabin1, {seed: 's3nb/cabBase', over: 'medium'}), front, CM.ink, 0.25);
  b.ink(line(x0, NB.cant, x1, NB.cant, {seed: 's3nb/cantBot', over: 'small'}), mid * 0.7, CM.ink, 0.45);
  b.ink(line(x0, NB.roofFar, x1, NB.roofFar, {seed: 's3nb/roofFar', over: 'small'}), mid, CM.ink, 0.35);
  b.ink(line(x0, NB.water, x1, NB.water, {seed: 's3nb/water', over: 'small'}), mid, CM.ink, 0.4);
  b.ink(line(x0, NB.gun1, x1, NB.gun1, {seed: 's3nb/gun', over: 'small'}), mid * 0.8, CM.ink, 0.5);
  // the doors' edges and the panel's oval
  let dd = '';
  for (let k = 0; k < 2; k++) {
    const dx = DOORS.x0 + k * (dw + 4);
    dd += line(dx, DOORS.y0, dx, DOORS.y1, {seed: `s3nb/dl${k}`, over: 'small'}) + line(dx + dw, DOORS.y0, dx + dw, DOORS.y1, {seed: `s3nb/dr${k}`, over: 'small'});
  }
  dd += line(DOORS.x0, DOORS.y0, DOORS.x1, DOORS.y0, {seed: 's3nb/dt', over: 'small'});
  b.ink(dd, mid, CM.ink, 0.2);
  b.ink(ellipseInk(PANEL.x, PANEL.y, PANEL.rx + 6, PANEL.ry + 6, {seed: 's3nb/panelInk', wobble: 0.02}), INK_PX.far, CM.ink, 0.25);
  b.ink(line(SALOON.x0 - 9, SALOON.y0 - 9, SALOON.x0 - 9, SALOON.y1 + 9, {seed: 's3nb/salL', over: 'small'}) + line(SALOON.x0 - 9, SALOON.y1 + 9, SALOON.x1 + 20, SALOON.y1 + 9, {seed: 's3nb/salB', over: 'small'}), INK_PX.far, CM.ink, 0.2);
}

/** Roses-and-castles spirit, no lettering: a slate oval, mustard lining, three big roses (peach, pink, rust) with
 *  paper highlight strokes, daisies, leaves with veins, a scatter of dots. */
function flowerPanelInto(b: Batch) {
  const {x, y, rx, ry} = PANEL;
  b.fill(CM.coatMustard, ovalPath(x, y, rx + 6, ry + 6));
  b.fill(CM.paneUnlit, ovalPath(x, y, rx, ry));
  b.ink(ellipseInk(x, y, rx - 8, ry - 8, {seed: 's3nb/pl2', wobble: 0.01, overlap: 4}), 1.6, CM.coatMustard);
  // leaves first (behind the roses): sage leaf pairs fanning out
  const leaves: [number, number, number, number][] = [
    [-58, -6, 34, -150], [-50, 22, 32, 160], [-6, -36, 30, -100], [30, 30, 32, 60], [62, -14, 34, -20], [58, 20, 30, 25], [-28, 40, 28, 120], [16, -40, 26, -70],
  ];
  for (const [dx, dy, L, a] of leaves) {
    b.fill(CM.sage, leafPath(x + dx, y + dy, L, L * 0.32, a));
  }
  // roses: concentric petals (outer colour, inner darker, a paper highlight comma)
  const roses: [number, number, number, string, string][] = [
    [-24, 2, 26, CM.box, CM.leafRust],
    [24, -8, 22, CM.blossom, CM.brick],
    [6, 26, 17, CM.leafRust, CM.brickDeep],
  ];
  for (const [dx, dy, R, c0, c1] of roses) {
    b.fill(c0, ovalPath(x + dx, y + dy, R, R * 0.84));
    b.fill(c1, ovalPath(x + dx + R * 0.08, y + dy + R * 0.06, R * 0.55, R * 0.46));
    b.fill(c0, ovalPath(x + dx + R * 0.12, y + dy + R * 0.1, R * 0.24, R * 0.2));
  }
  // daisies (mustard petals, a rust heart) and dots
  for (const [dx, dy] of [[-62, -24], [66, 2], [-46, 30], [44, 34], [-6, -44]] as [number, number][]) {
    for (let k = 0; k < 6; k++) {
      const a = (k / 6) * Math.PI * 2;
      b.fill(CM.coatMustard, ovalPath(x + dx + Math.cos(a) * 5.5, y + dy + Math.sin(a) * 5, 3.4, 3.4));
    }
    b.fill(CM.leafRust, ovalPath(x + dx, y + dy, 2.6, 2.6));
  }
  for (const [dx, dy] of [[-76, 6], [78, -22], [-36, -48], [34, 50], [-70, 38], [74, 34]] as [number, number][]) b.fill(CM.paper, ovalPath(x + dx, y + dy, 2.2, 2.2));
  // rose highlight strokes and leaf veins (fine paint strokes)
  let hl = '';
  for (const [dx, dy, R] of roses) hl += arcInk(x + dx, y + dy, R * 0.78, R * 0.66, 200, 300, {seed: `s3nb/rh${dx}`}) + arcInk(x + dx, y + dy, R * 0.5, R * 0.42, 20, 120, {seed: `s3nb/rh2${dx}`});
  b.ink(hl, 1.8, CM.paper);
  let veins = '';
  for (const [dx, dy, L, a] of leaves) {
    const ar = (a * Math.PI) / 180;
    veins += `M${P(x + dx - Math.cos(ar) * L * 0.42, y + dy - Math.sin(ar) * L * 0.42)}L${P(x + dx + Math.cos(ar) * L * 0.42, y + dy + Math.sin(ar) * L * 0.42)}`;
  }
  b.ink(veins, 1.2, CM.coatMustard);
}

/** Roof dressing that does not move (pots, box, rope, bike, chimney, cans, lifebuoy, trough, pole, plank). */
function roofInto(b: Batch) {
  const w2 = INK_PX.far;
  const hair = INK_PX.hair;
  // ---- the boat pole and the plank along the far side of the roof (cut by the left edge)
  
  b.poly(CM.line, [[-90, 1271], [262, 1265], [263, 1271], [-90, 1278]]);
  b.fill(CM.anchor, `M${P(262, 1263)}L${P(282, 1262)}Q${P(292, 1267)} ${P(282, 1273)}L${P(262, 1272)}Z`);
  b.poly(CM.leafGold, [[-90, 1290], [150, 1286], [154, 1298], [-90, 1303]]);
  b.poly(CM.line, [[-90, 1303], [154, 1298], [154, 1301], [-90, 1306]]);
  b.ink(line(-90, 1290, 152, 1286, {seed: 's3nb/plank', over: 'small'}), hair);
  b.ink(line(-90, 1271, 262, 1265, {seed: 's3nb/pole', over: 'small'}), hair);
  b.layer();
  // ---- herb pots (terracotta, rims, shadows) - the herbs themselves sway: herbsInto()
  for (const p of HERB_POTS) {
    roofShadow(b, p.x + p.w * 0.3, p.y, p.w * 0.8, p.w * 1.9);
    b.fill(CM.brick, potPath(p.x, p.y, p.w, p.h));
    b.fill(CM.brickDeep, `M${P(p.x - p.w / 2 - 2, p.y - p.h)}L${P(p.x + p.w / 2 + 2, p.y - p.h)}L${P(p.x + p.w / 2 + 1, p.y - p.h + 7)}L${P(p.x - p.w / 2 - 1, p.y - p.h + 7)}Z`);
    b.fill(CM.shadeWarm, `M${P(p.x + p.w * 0.18, p.y - p.h + 7)}L${P(p.x + p.w / 2 - 1, p.y - p.h + 7)}L${P(p.x + p.w * 0.37, p.y)}L${P(p.x + p.w * 0.12, p.y)}Z`);
    b.ink(`M${P(p.x - p.w / 2, p.y - p.h)}L${P(p.x - p.w * 0.37, p.y)}L${P(p.x + p.w * 0.37, p.y)}`, w2, CM.ink, 0.2);
  }
  // ---- the pigeon box: a raised sage box with a cream lid and two little lit ports
  const pb = {x0: 300, x1: 372, y: 1312, h: 26};
  roofShadow(b, pb.x1 - 4, pb.y, 30, 58);
  b.rect(CM.sage, pb.x0, pb.y - pb.h, pb.x1 - pb.x0, pb.h);
  b.poly(CM.coatOat, [[pb.x0 - 4, pb.y - pb.h], [pb.x1 + 4, pb.y - pb.h], [pb.x1 - 2, pb.y - pb.h - 14], [pb.x0 + 2, pb.y - pb.h - 14]]);
  for (const px of [pb.x0 + 20, pb.x1 - 20]) {
    b.fill(CM.coatMustard, ovalPath(px, pb.y - pb.h / 2, 8, 8));
    b.fill(CM.lamp, ovalPath(px, pb.y - pb.h / 2, 5.4, 5.4));
  }
  b.ink(`M${P(pb.x0, pb.y - pb.h - 1)}L${P(pb.x0, pb.y)}L${P(pb.x1, pb.y)}L${P(pb.x1, pb.y - pb.h)}`, w2, CM.ink, 0.25);
  // ---- the coiled rope (cream, a spiral of twists)
  const rc: Pt = [446, 1300];
  roofShadow(b, rc[0] + 30, rc[1] + 10, 30, 30);
  b.fill(CM.coatOat, ovalPath(rc[0], rc[1], 44, 14));
  b.fill(CM.line, ovalPath(rc[0] + 2, rc[1] - 1, 12, 4));
  let coil = '';
  for (let k = 0; k < 4; k++) coil += ellipseInk(rc[0] + k * 0.6, rc[1] - k * 0.2, 44 - k * 9, 14 - k * 2.6, {seed: `s3nb/coil${k}`, wobble: 0.03, overlap: 30});
  b.ink(coil, hair, CM.line);
  // ---- the folded bike (mustard frame, two small wheels side by side, saddle on top)
  bikeInto(b);
  // ---- the stove chimney (plum pipe, two brass bands, a hat) - smoke: <Puffs> in S3Boat
  const ch = NB.chimney;
  roofShadow(b, ch.x + 10, ch.base, 26, 96);
  b.fill(CM.anchor, `M${P(ch.x - 15, ch.base)}L${P(ch.x - 12, ch.base - 12)}L${P(ch.x + 12, ch.base - 12)}L${P(ch.x + 15, ch.base)}Z`);
  b.rect(CM.anchor, ch.x - 9, ch.top, 18, ch.base - 12 - ch.top);
  b.rect(CM.coatMustard, ch.x - 10, ch.top + 22, 20, 6);
  b.rect(CM.coatMustard, ch.x - 10, ch.base - 34, 20, 5);
  b.fill(CM.anchor, `M${P(ch.x - 21, ch.top - 8)}Q${P(ch.x, ch.top - 26)} ${P(ch.x + 21, ch.top - 8)}L${P(ch.x + 16, ch.top - 4)}L${P(ch.x - 16, ch.top - 4)}Z`);
  b.rect(CM.anchor, ch.x - 2, ch.top - 6, 4, 6);
  b.ink(line(ch.x - 9, ch.top, ch.x - 9, ch.base - 12, {seed: 's3nb/chim', over: 'small'}), w2, CM.ink);
  // ---- the watering can (slate) and the painted Buckby can (plum-mauve with a rose band)
  const wc: Pt = [800, 1316];
  roofShadow(b, wc[0] + 16, wc[1], 34, 52);
  b.fill(CM.coatSlate, rr(wc[0] - 22, wc[1] - 30, 40, 30, 7));
  b.poly(CM.coatSlate, [[wc[0] + 14, wc[1] - 14], [wc[0] + 40, wc[1] - 38], [wc[0] + 44, wc[1] - 34], [wc[0] + 18, wc[1] - 8]]);
  b.fill(CM.coatSlate, ovalPath(wc[0] + 44, wc[1] - 38, 6, 4));
  b.ink(arcInk(wc[0] - 2, wc[1] - 30, 18, 14, 180, 360, {seed: 's3nb/wch'}) + `M${P(wc[0] - 22, wc[1] - 26)}L${P(wc[0] - 22, wc[1])}`, w2, CM.ink);
  const bc: Pt = [872, 1312];
  roofShadow(b, bc[0] + 14, bc[1], 30, 62);
  b.fill(CM.coatPlum, rr(bc[0] - 16, bc[1] - 50, 32, 50, 5));
  b.fill(CM.coatPlum, `M${P(bc[0] - 12, bc[1] - 50)}L${P(bc[0] - 8, bc[1] - 60)}L${P(bc[0] + 8, bc[1] - 60)}L${P(bc[0] + 12, bc[1] - 50)}Z`);
  b.rect(CM.coatMustard, bc[0] - 16, bc[1] - 42, 32, 4);
  b.fill(CM.box, ovalPath(bc[0] - 4, bc[1] - 26, 6.5, 6));
  b.fill(CM.paper, ovalPath(bc[0] + 7, bc[1] - 22, 4, 4));
  b.fill(CM.coatMustard, ovalPath(bc[0] + 3, bc[1] - 32, 3, 3));
  b.ink(arcInk(bc[0], bc[1] - 60, 12, 12, 180, 360, {seed: 's3nb/bch'}) + `M${P(bc[0] + 16, bc[1] - 48)}L${P(bc[0] + 16, bc[1])}`, w2, CM.ink);
  // ---- the lifebuoy lying flat (paper ring with four rust bands)
  const lb = {x: 996, y: 1294, rx: 52, ry: 16};
  roofShadow(b, lb.x + 44, lb.y + 14, 40, 26);
  b.fill(CM.paper, ringPath(lb.x, lb.y, lb.rx, lb.ry, lb.rx * 0.6, lb.ry * 0.5));
  for (const a0 of [20, 110, 200, 290]) {
    const pts: Pt[] = [];
    for (let k = 0; k <= 6; k++) {
      const a = ((a0 + (k / 6) * 34) * Math.PI) / 180;
      pts.push([lb.x + Math.cos(a) * lb.rx, lb.y + Math.sin(a) * lb.ry]);
    }
    for (let k = 6; k >= 0; k--) {
      const a = ((a0 + (k / 6) * 34) * Math.PI) / 180;
      pts.push([lb.x + Math.cos(a) * lb.rx * 0.6, lb.y + Math.sin(a) * lb.ry * 0.5]);
    }
    b.poly(CM.leafRust, pts);
  }
  b.fill(CM.water, ovalPath(lb.x, lb.y, lb.rx * 0.6 - 1, lb.ry * 0.5 - 1));
  b.ink(ellipseInk(lb.x, lb.y, lb.rx, lb.ry, {seed: 's3nb/lb', wobble: 0.02}), w2, CM.ink, 0.25);
  // ---- the geranium trough cut by the right edge (flowers sway with the herbs)
  
  b.poly(CM.brickDeep, [[1066, 1296], [1200, 1296], [1200, 1318], [1070, 1318]]);
  b.rect(CM.brick, 1066, 1296, 134, 6);
  b.ink(`M${P(1066, 1296)}L${P(1070, 1318)}L${P(1200, 1318)}`, w2, CM.ink, 0.2);
}

type HerbPot = {x: number; y: number; w: number; h: number; kind: 'rosemary' | 'basil' | 'thyme' | 'chilli'};
const HERB_POTS: HerbPot[] = [
  {x: 52, y: 1318, w: 30, h: 28, kind: 'rosemary'},
  {x: 104, y: 1313, w: 38, h: 32, kind: 'basil'},
  {x: 158, y: 1320, w: 26, h: 22, kind: 'thyme'},
  {x: 210, y: 1315, w: 34, h: 30, kind: 'chilli'},
];

function bikeInto(b: Batch) {
  const g: Pt = [566, 1318];
  roofShadow(b, g[0] + 30, g[1], 60, 84);
  const R = 23;
  const wA: Pt = [g[0] - 14, g[1] - R];
  const wB: Pt = [g[0] + 16, g[1] - R + 1];
  // tyres as slate rings, hubs mustard
  for (const [wx, wy] of [wA, wB]) {
    b.fill(CM.coatSlate, ringPath(wx, wy, R, R, R - 4.5, R - 4.5));
    b.fill(CM.coatMustard, ovalPath(wx, wy, 3.2, 3.2));
  }
  b.layer();
  const frame = `M${P(wA[0], wA[1])}L${P(g[0] + 2, g[1] - 44)}L${P(wB[0], wB[1])}M${P(g[0] + 2, g[1] - 44)}L${P(g[0] - 2, g[1] - 86)}M${P(g[0] + 2, g[1] - 44)}L${P(g[0] + 22, g[1] - 70)}L${P(g[0] + 34, g[1] - 72)}`;
  b.ink(frame, 5, CM.coatMustard);
  b.fill(CM.anchor, `M${P(g[0] - 16, g[1] - 88)}Q${P(g[0] - 2, g[1] - 96)} ${P(g[0] + 12, g[1] - 89)}L${P(g[0] + 10, g[1] - 84)}L${P(g[0] - 14, g[1] - 84)}Z`);
  b.fill(CM.anchor, ovalPath(g[0] + 36, g[1] - 72, 5, 3));
  let spokes = '';
  for (const [wx, wy] of [wA, wB]) for (let k = 0; k < 4; k++) {
    const a = (k / 4) * Math.PI + 0.3;
    spokes += `M${P(wx - Math.cos(a) * (R - 5), wy - Math.sin(a) * (R - 5))}L${P(wx + Math.cos(a) * (R - 5), wy + Math.sin(a) * (R - 5))}`;
  }
  b.ink(spokes, 1, CM.stoneShade);
  b.ink(circleInk(wA[0], wA[1], R, {seed: 's3nb/bwA', wobble: 0.02}) + circleInk(wB[0], wB[1], R, {seed: 's3nb/bwB', wobble: 0.02}), INK_PX.hair, CM.ink, 0.3);
}

// ---------------------------------------------------------------- life (per frame, few nodes)

/** Herbs and geraniums: foliage that sways in the canal breeze (tips move every frame; leaves flick). */
function herbsInto(b: Batch, t: number) {
  const breeze = (ph: number, amp: number) => amp * (0.7 * Math.sin(t * 2.3 + ph) + 0.3 * Math.sin(t * 5.1 + ph * 1.7));
  let stems = '';
  for (const [i, p] of HERB_POTS.entries()) {
    const top = p.y - p.h;
    const r = rng(`s3nb/herb${i}`);
    if (p.kind === 'rosemary') {
      // upright needled sprigs
      for (let k = 0; k < 7; k++) {
        const bx = p.x - p.w * 0.32 + (p.w * 0.64 * k) / 6;
        const L = r.range(26, 40);
        const sw = breeze(i + k, 3.2);
        stems += `M${P(bx, top + 2)}Q${P(bx + sw * 0.4, top - L * 0.5)} ${P(bx + sw, top - L)}`;
        for (let n = 1; n < 4; n++) {
          const yy = top - (L * n) / 4;
          const xx = bx + (sw * n) / 4;
          b.fill(CM.sage, leafPath(xx + 4, yy, 9, 2.2, -30 + sw));
          b.fill(CM.sage, leafPath(xx - 4, yy - 2, 9, 2.2, 210 + sw));
        }
      }
    } else if (p.kind === 'basil') {
      b.fill(CM.sage, lobes(p.x - p.w * 0.62 + breeze(i, 1.2), p.x + p.w * 0.62 + breeze(i + 1, 1.2), top + 4, p.h * 1.25, `s3nb/basil${i}`, 4));
      for (let k = 0; k < 6; k++) {
        const a = -150 + k * 24 + breeze(i + k, 8);
        b.fill(k % 2 ? CM.sage : CM.paper, leafPath(p.x + (k - 2.5) * 7 + breeze(i + k, 1.6), top - p.h * 0.55 + Math.abs(k - 2.5) * 4, 14, 5, a));
      }
    } else if (p.kind === 'thyme') {
      b.fill(CM.sage, lobes(p.x - p.w * 0.7, p.x + p.w * 0.7, top + 3, p.h * 0.9, `s3nb/thyme${i}`, 5));
      for (let k = 0; k < 5; k++) b.fill(CM.blossom, ovalPath(p.x - 12 + k * 6 + breeze(i + k, 1), top - 10 - (k % 2) * 5, 2, 2));
    } else {
      // chilli: leafy with rust pods that swing
      b.fill(CM.sage, lobes(p.x - p.w * 0.66, p.x + p.w * 0.66, top + 3, p.h * 1.15, `s3nb/chil${i}`, 4));
      for (let k = 0; k < 4; k++) {
        const px = p.x - 12 + k * 8 + breeze(i + k, 1.6);
        const py = top - 12 - (k % 2) * 9;
        b.fill(CM.leafRust, leafPath(px, py + 6, 13, 3.4, 80 + breeze(k, 10)));
      }
    }
  }
  b.ink(stems, 1.6, CM.line);
  // geraniums in the trough (cut by the right edge)
  b.fill(CM.sage, lobes(1066, 1210, 1298, 34, 's3nb/ger', 6));
  for (let k = 0; k < 6; k++) {
    const gx = 1076 + k * 22 + breeze(k * 1.3, 2);
    const gy = 1268 - (k % 3) * 6 + breeze(k, 1);
    b.fill(k % 2 ? CM.blossom : CM.box, ovalPath(gx, gy, 8, 7));
    b.fill(k % 2 ? CM.box : CM.brick, ovalPath(gx + 2, gy + 1, 3.4, 3));
  }
  // ink on the foliage masses (open, a few leaf ticks: they carry the form against the water behind)
  let fo = '';
  for (const [i, p] of HERB_POTS.entries()) {
    if (p.kind === 'rosemary') continue;
    const top = p.y - p.h;
    fo += arcInk(p.x + breeze(i, 0.8), top + 2, p.w * 0.62, p.h * (p.kind === 'thyme' ? 0.8 : 1.1), 200, 340, {seed: `s3nb/fo${i}`});
  }
  b.ink(fo, INK_PX.hair, CM.ink);
}

/** The porthole interiors (warm lamp-lit glass), the curtains that sway, someone passing behind porthole 2, the
 *  cream rims with brass dogs. Drawn per frame (a handful of shapes). */
function portholesInto(b: Batch, t: number) {
  for (const [i, h] of PORTHOLES.entries()) {
    const {x, y, r} = h;
    b.fill(CM.lamp, ovalPath(x, y, r, r));
    b.fill(CM.lampCore, ovalPath(x - r * 0.25, y - r * 0.3, r * 0.42, r * 0.36));
    // inside
    if (h.inside === 'plant') {
      b.fill(CM.brick, potPath(x + 6, y + r * 0.78, 16, 12));
      b.fill(CM.sage, lobes(x - 8, x + 20, y + r * 0.78 - 10, 26, 's3nb/pp', 3));
    } else if (h.inside === 'shelf') {
      b.rect(CM.line, x - r, y + 6, r * 2, 3);
      b.rect(CM.coatSlate, x - 12, y - 6, 7, 12);
      b.rect(CM.brick, x - 2, y - 10, 8, 16);
      b.rect(CM.coatOat, x + 9, y - 3, 6, 9);
    } else if (h.inside === 'kettle') {
      b.fill(CM.coatSlate, domePath(x + 4, y + 10, 11, 14));
      b.rect(CM.coatSlate, x + 12, y - 2, 9, 3);
      b.rect(CM.line, x - r, y + 10, r * 2, 3);
    } else if (h.inside === 'walker') {
      // someone crossing the saloon behind the curtains: a plum head-and-shoulders passes left -> right 13.42-14.12
      const k = (t - 13.42) / 0.7;
      if (k > -0.05 && k < 1.05) {
        const px = lerp(x - r * 1.9, x + r * 1.9, k);
        const bobY = Math.abs(Math.sin(k * Math.PI * 3)) * 1.2;
        const pts: Pt[] = [];
        // the body clipped to the glass circle: sample a head + shoulders silhouette inside the circle
        const head = (a: number): Pt => [px + Math.cos(a) * 9.5, y - 6 - bobY + Math.sin(a) * 10.5];
        for (let n = 0; n <= 16; n++) pts.push(head(Math.PI + (n / 16) * Math.PI * 2));
        const clipPts = (ps: Pt[]) => ps.map(([qx, qy]) => {
          const dx = qx - x;
          const dy = qy - y;
          const d = Math.hypot(dx, dy);
          return d > r - 0.5 ? ([x + (dx / d) * (r - 0.5), y + (dy / d) * (r - 0.5)] as Pt) : ([qx, qy] as Pt);
        });
        b.poly(CM.anchor, clipPts(pts));
        const sh: Pt[] = [];
        for (let n = 0; n <= 12; n++) {
          const u = n / 12;
          sh.push([px - 20 + 40 * u, y + 6 - bobY - Math.sin(u * Math.PI) * 9]);
        }
        sh.push([px + 20, y + r], [px - 20, y + r]);
        b.poly(CM.anchor, clipPts(sh));
      }
    }
    // curtains: two drapes tied back, their inner edges swaying a little (a draught through the hatch)
    const sw = 1.6 * Math.sin(t * 1.7 + i * 1.9) + 0.8 * Math.sin(t * 3.9 + i);
    const [cl, cr] = h.curtain;
    b.fill(cl, `M${P(x - r - 1, y - r * 0.85)}Q${P(x - r * 0.15 + sw, y - r * 0.9)} ${P(x - r * 0.38 + sw * 0.6, y + r * 0.1)}Q${P(x - r * 0.6, y + r * 0.5)} ${P(x - r - 1, y + r * 0.62)}Z`);
    b.fill(cr, `M${P(x + r + 1, y - r * 0.85)}Q${P(x + r * 0.15 + sw * 0.7, y - r * 0.9)} ${P(x + r * 0.38 + sw * 0.4, y + r * 0.1)}Q${P(x + r * 0.6, y + r * 0.5)} ${P(x + r + 1, y + r * 0.62)}Z`);
    b.rect(CM.line, x - r, y - r * 0.92, r * 2, 2.6);
  }
  b.layer();
  for (const [i, h] of PORTHOLES.entries()) {
    const {x, y, r} = h;
    const R = r + 9;
    b.fill(CM.coatOat, ringPath(x, y, R, R, r, r));
    for (const a of [-0.6, 1.2, 2.9]) b.fill(CM.coatMustard, ovalPath(x + Math.cos(a + i) * (R - 4.5), y + Math.sin(a + i) * (R - 4.5), 2.6, 2.6));
    b.ink(circleInk(x, y, R, {seed: `s3nb/ph${i}`, wobble: 0.02}), INK_PX.far, CM.ink, 0.2);
  }
  // the door ports (lit, brass rims)
  const dw = (DOORS.x1 - DOORS.x0 - 4) / 2;
  for (let k = 0; k < 2; k++) {
    const cx = DOORS.x0 + k * (dw + 4) + dw / 2;
    const cy = DOORS.y0 + 34;
    b.fill(CM.coatMustard, ovalPath(cx, cy, 17, 17));
    b.fill(CM.lamp, ovalPath(cx, cy, 12, 12));
    b.fill(k ? CM.box : CM.blossom, `M${P(cx - 12, cy - 8)}Q${P(cx - 4, cy - 10)} ${P(cx - 5, cy + 4)}L${P(cx - 12, cy + 6)}Z`);
    b.ink(circleInk(cx, cy, 17, {seed: `s3nb/dp${k}`, wobble: 0.02}), INK_PX.hair, CM.ink, 0.3);
  }
}

/** Rope fenders hanging from the gunwale over the hull (they swing a hair as the boat rocks). */
function fendersInto(b: Batch, t: number) {
  for (const [i, fx] of NB.fenders.entries()) {
    const sw = 1.4 * Math.sin(t * 1.3 + i * 2.1);
    const topY = NB.cabin1 + 6;
    const fy0 = NB.gun1 + 4;
    const fy1 = NB.water + 10;
    const cx = fx + sw;
    b.ink(`M${P(fx, topY)}L${P(cx, fy0)}`, 2.6, CM.line);
    b.fill(CM.coatOat, rr(cx - 17, fy0, 34, fy1 - fy0, 14));
    b.fill(CM.leafGold, rr(cx + 5, fy0 + 3, 9, fy1 - fy0 - 6, 5));
    let tw = '';
    for (let y = fy0 + 6; y < fy1 - 3; y += 6) tw += `M${P(cx - 14, y)}Q${P(cx, y + 3.5)} ${P(cx + 14, y)}`;
    b.ink(tw, 1.2, CM.line);
    b.ink(rr(cx - 17, fy0, 34, fy1 - fy0, 14), INK_PX.far, CM.ink, 0.3);
  }
}

/** The moored bob: a slow 1.3 px rise and fall (the boat is alive; the coping is not). */
export const boatBob = (t: number) => 1.3 * Math.sin(t * 2.1 + 0.4) + 0.4 * Math.sin(t * 4.7);

/** Our narrowboat (static batch + per-frame life). WORLD px at the match. */
export const S3Boat: React.FC = () => {
  const t = useTime();
  const stat = useMemo(() => {
    const b = new Batch();
    cabinInto(b);
    b.layer();
    roofInto(b);
    return b;
  }, []);
  const life = new Batch();
  herbsInto(life, t);
  life.layer();
  portholesInto(life, t);
  life.layer();
  fendersInto(life, t);
  const dy = boatBob(t);
  const ch = NB.chimney;
  return (
    <XG m={mat.translate(0, dy)}>
      <Paint b={stat} seed="s3nboat" />
      <Paint b={life} seed="s3nboatLife" />
      <Puffs x={ch.x} y={ch.top - 10} seed="s3nb/smoke" kind="smoke" scale={1.25} drift={26} bursts={[13.62]} />
    </XG>
  );
};
