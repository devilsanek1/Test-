// V2S3_tWest.tsx (lane L3, V2S3 FAR helper): the west gap beyond her end-of-terrace house, WORLD px at the 12.98 match.
// Back to front: a King's-Cross-like gasholder frame, a far roof row whose ridges and stacks hide the low sun's lower
// half (the sun itself is S3Sun, drawn first), the brick viaduct with a train that slides out from behind her house
// heading WEST, a canal warehouse, a big autumn tree (leaves falling) and a garden wall with a gate and ivy. Far
// planes are fill only (no ink); the tree and the wall are at the terrace's depth (2.2 px ink). All tops >= 600.
import React, {useMemo} from 'react';
import {CM} from '../palette';
import {useTime} from '../../lib/time';
import {crown, crownTicks} from '../../lib/sketch';
import {Paint, frac} from '../kit/canal/core';
import {FallingLeaves} from '../kit/canal/life';
import {Batch, TK, quadP, archP, line, ovalPath, lobes, leafPath, rng, P, rectInk} from './V2S3_tParts';

export const SUN3 = {x: 96, y: 652, r: 46} as const;
const XL = -80;
const XR = 180;

// ---------------------------------------------------------------- far: gasholder + the roof row in front of the sun

function farBatch(): Batch {
  const b = new Batch();
  const r = rng('s3west');
  // the gasholder guide frame (cut by the left edge): columns, ring girders, lattice (thin, cool, no ink)
  {
    const cx = -40;
    const R = 92;
    const top = 616;
    const base = 760;
    const col = CM.shadeCool;
    const xs: number[] = [];
    for (let k = 0; k < 9; k++) xs.push(cx - Math.cos((Math.PI * k) / 8) * R);
    for (const x of xs) b.rect(col, x - 1.6, top, 3.2, base - top);
    for (let k = 0; k < 4; k++) {
      const y = top + ((base - top) * k) / 3.6;
      b.rect(col, cx - R - 3, y, R * 2 + 6, 3);
    }
    let lat = '';
    for (let k = 0; k < 3; k++) {
      const y0 = top + ((base - top) * k) / 3.6;
      const y1 = top + ((base - top) * (k + 1)) / 3.6;
      for (let j = 0; j < 8; j++) lat += `M${P(xs[j], y0)}L${P(xs[j + 1], y1)}M${P(xs[j + 1], y0)}L${P(xs[j], y1)}`;
    }
    b.ink(lat, 1.1, col);
    // the drum inside (a pale cylinder face)
    b.rect(CM.limestone, cx - R * 0.8, 690, R * 1.6, base - 690);
  }
  b.layer();
  // the far roof row: walls in stone / limestone, slate roofs; ridges and stacks cross the sun's lower half
  const roofs: {x0: number; x1: number; top: number; kind: 'pitch' | 'mansard' | 'gable' | 'flat'; wall: string}[] = [
    {x0: XL, x1: -28, top: 676, kind: 'pitch', wall: CM.stoneShade},
    {x0: -28, x1: 30, top: 670, kind: 'mansard', wall: CM.limestone},
    {x0: 30, x1: 92, top: 662, kind: 'pitch', wall: CM.stoneShade},
    {x0: 92, x1: 146, top: 664, kind: 'gable', wall: CM.limestone},
    {x0: 146, x1: XR, top: 672, kind: 'flat', wall: CM.stoneShade},
  ];
  for (const f of roofs) {
    const w = f.x1 - f.x0;
    b.rect(f.wall, f.x0, f.top, w + 1, 800 - f.top);
    if (f.kind === 'pitch') b.poly(CM.shadeCool, [[f.x0 - 2, f.top], [f.x0 + w * 0.16, f.top - 14], [f.x1 - w * 0.16, f.top - 14], [f.x1 + 2, f.top]]);
    if (f.kind === 'mansard') b.poly(CM.shadeCool, [[f.x0 - 1, f.top], [f.x0 + 6, f.top - 16], [f.x1 - 6, f.top - 16], [f.x1 + 1, f.top]]);
    if (f.kind === 'gable') b.poly(CM.shadeCool, [[f.x0 - 3, f.top], [(f.x0 + f.x1) / 2, f.top - 24], [f.x1 + 3, f.top]]);
    if (f.kind === 'flat') b.rect(CM.stoneShade, f.x0, f.top - 5, w, 5);
    // tiny far windows (a few lit)
    for (let wy = f.top + 12; wy < 790; wy += 22) {
      for (let wx = f.x0 + 7; wx < f.x1 - 8; wx += 15) {
        const on = r.chance(0.35);
        b.rect(on ? CM.lamp : CM.shadeCool, wx, wy, 6, 9);
      }
    }
  }
  // stacks and pots in silhouette across the disc (one in front of the sun: the low sun behind the chimneys)
  const stacks: [number, number, number][] = [[-8, 650, 14], [58, 640, 12], [113, 630, 14], [160, 654, 12]];
  for (const [x, top, w] of stacks) {
    b.rect(CM.stoneShade, x, top, w, 680 - top);
    b.rect(CM.limestone, x - 2, top - 2, w + 4, 3);
    for (let k = 0; k < Math.round(w / 6); k++) b.rect(CM.shadeCool, x + 1 + k * 6, top - 7, 4, 6);
  }
  b.ink(`M${P(66, 640)}L${P(66, 624)}M${P(58, 628)}L${P(76, 628)}M${P(60, 633)}L${P(73, 633)}`, 1.2, CM.shadeCool);
  b.layer();
  // the viaduct: a deck on brick arches (far: fill only), the far town through the arches
  const deck = 726;
  b.rect(CM.brickLight, XL, deck, XR - XL, 16);
  b.rect(CM.stoneShade, XL, deck - 3, XR - XL, 3);
  b.rect(CM.brickLight, XL, deck + 16, XR - XL, 90);
  for (let x = XL + 4; x < XR; x += 48) b.fill(CM.stoneShade, archP(x + 9, deck + 26, 30, 80));
  for (let x = XL + 4; x < XR; x += 48) b.rect(CM.brick, x + 2, deck + 18, 5, 88);
  return b;
}

// ---------------------------------------------------------------- the train (slides out from behind her house, west)

const TRAIN = {t0: 13.22, v: 150, deck: 726, carH: 15, cars: 4} as const;

function trainInto(b: Batch, t: number) {
  const L = TRAIN.carH * 3.6;
  // the front comes out from behind her house's west wall (x 165) and runs west (screen left)
  const head = 168 - (t - TRAIN.t0) * TRAIN.v;
  for (let k = 0; k < TRAIN.cars; k++) {
    const x = head + k * (L + 3);
    if (x > XR + 4 || x + L < XL) continue;
    const y = TRAIN.deck - TRAIN.carH - 1;
    b.rect(k === 0 ? CM.coatMustard : CM.limestone, x, y, L, TRAIN.carH);
    b.rect(CM.paneUnlit, x + 4, y + 4, L - 8, 5);
    for (let j = 1; j < 4; j++) b.rect(k === 0 ? CM.coatMustard : CM.limestone, x + (L * j) / 4, y + 4, 1.6, 5);
    b.rect(CM.shadeCool, x, y + TRAIN.carH - 3, L, 3);
  }
  // the overhead wire gantries along the deck (thin)
  for (let x = XL + 20; x < XR; x += 96) {
    b.rect(CM.shadeCool, x, TRAIN.deck - 30, 2, 30);
    b.rect(CM.shadeCool, x - 6, TRAIN.deck - 30, 14, 2);
  }
}

// ---------------------------------------------------------------- mid and near: warehouse, tree, garden wall

const TREE = {x: 52, base: 1004, cx: 46, cy: 872, rx: 106, ry: 92} as const;

function midBatch(): Batch {
  const b = new Batch();
  const r = rng('s3wh');
  // a canal warehouse (dark brick, arched windows, a hoist beam)
  const wx0 = XL;
  const wx1 = 70;
  const wt = 792;
  b.rect(CM.brickDeep, wx0, wt, wx1 - wx0, 1010 - wt);
  b.rect(CM.limestone, wx0, wt - 4, wx1 - wx0 + 4, 7);
  for (let row = 0; row < 2; row++) {
    for (let x = wx0 + 10; x < wx1 - 16; x += 30) {
      const on = r.chance(0.4);
      b.fill(on ? CM.lamp : CM.paneUnlit, archP(x, wt + 18 + row * 70, 16, 34));
      b.rect(CM.limestone, x - 2, wt + 52 + row * 70, 20, 3);
    }
  }
  b.rect(CM.anchor, 30, wt + 6, 22, 4);
  b.rect(CM.anchor, 48, wt + 10, 2, 16);
  b.layer();
  // the tree: trunk and limbs, a scalloped crown, then autumn clumps (each its own loose outline), leaf ticks
  b.poly(CM.line, [[TREE.x - 10, TREE.base], [TREE.x - 6, 930], [TREE.x - 16, 900], [TREE.x - 8, 898], [TREE.x + 1, 918], [TREE.x + 9, 896], [TREE.x + 16, 900], [TREE.x + 6, 930], [TREE.x + 11, TREE.base]]);
  b.rect(CM.shadeWarm, TREE.x + 3, 930, 6, TREE.base - 930);
  b.layer();
  const cr = crown(TREE.cx, TREE.cy, TREE.rx, TREE.ry, {seed: 's3tree', bumps: 14, round: 0.6});
  b.fill(CM.sage, cr);
  b.layer();
  // limbs seen in the gaps of the crown
  b.ink(`M${P(TREE.x - 8, 900)}Q${P(TREE.x - 34, 872)} ${P(TREE.x - 62, 858)}M${P(TREE.x + 12, 898)}Q${P(TREE.x + 40, 868)} ${P(TREE.x + 70, 850)}M${P(TREE.x, 905)}Q${P(TREE.x + 4, 860)} ${P(TREE.x - 6, 820)}`, 3.2, CM.line);
  b.layer();
  // autumn clumps lit from the west: gold and mustard on the sun side, rust on the shaded east side; their contours
  // mostly open (the crown's outline carries the form)
  const clumps: [number, number, number, number, string][] = [
    [TREE.cx - 48, TREE.cy - 30, 46, 36, CM.leafGold],
    [TREE.cx - 4, TREE.cy - 62, 46, 26, CM.coatMustard],
    [TREE.cx + 54, TREE.cy + 12, 46, 40, CM.leafRust],
    [TREE.cx + 18, TREE.cy + 52, 40, 26, CM.leafRust],
    [TREE.cx - 66, TREE.cy + 26, 30, 26, CM.leafGold],
    [TREE.cx + 30, TREE.cy - 22, 26, 20, CM.leafGold],
    [TREE.cx - 22, TREE.cy + 20, 24, 18, CM.coatMustard],
  ];
  let clumpInk = '';
  clumps.forEach(([cx, cy, rx, ry, col], i) => {
    const d = crown(cx, cy, rx, ry, {seed: `s3clump${i}`, bumps: 8, round: 0.6});
    b.fill(col, d);
    clumpInk += d;
  });
  b.ink(clumpInk, TK.fine, CM.ink, 0.6);
  b.ink(cr, TK.struct, CM.ink, 0.28);
  b.ink(crownTicks(TREE.cx, TREE.cy, TREE.rx * 0.9, TREE.ry * 0.9, {seed: 's3treeT', n: 6, size: 8}), TK.fine);
  // loose single leaves round the crown's rim
  {
    const rl = rng('s3treeLeaves');
    for (let i = 0; i < 26; i++) {
      const a = rl.range(0, Math.PI * 2);
      const rr = rl.range(0.86, 1.05);
      b.fill(rl.pick([CM.leafGold, CM.leafRust, CM.coatMustard]), leafPath(TREE.cx + Math.cos(a) * TREE.rx * rr, TREE.cy + Math.sin(a) * TREE.ry * rr, rl.range(7, 10), 3.4, rl.range(0, 180)));
    }
  }
  b.layer();
  // the garden wall with a coping, a timber gate, ivy spilling over, a bin
  const g0 = 1004;
  b.rect(CM.brickLight, XL, g0 + 6, 165 - XL, 1100 - g0 - 6);
  b.rect(CM.limestone, XL, g0, 165 - XL + 2, 8);
  b.rect(CM.stoneShade, XL, g0 + 8, 165 - XL, 3);
  for (let x = XL + 6; x < 165; x += 26) b.rect(CM.brick, x, g0 + 24 + (x % 3) * 18, 12, 4);
  b.rect(CM.line, 44, g0 + 10, 46, 90);
  for (let x = 47; x < 90; x += 9) b.rect(CM.shadeWarm, x, g0 + 12, 1.6, 86);
  b.rect(CM.shadeWarm, 44, g0 + 30, 46, 3);
  b.rect(CM.shadeWarm, 44, g0 + 76, 46, 3);
  b.layer();
  // ivy spilling over the coping in three clumps (dense at the top, trailing down)
  for (const [c0, c1, drop] of [[XL + 6, 30, 46], [96, 160, 34], [-6, 26, 20]] as const) {
    for (let i = 0; i < 34; i++) {
      const x = r.range(c0, c1);
      const k = r.next();
      const y = g0 - 8 + k * k * drop + r.jitter(3);
      b.fill(r.pick([CM.sage, CM.sage, CM.sage, CM.leafGold]), leafPath(x, y, r.range(7, 10), 3.8, r.range(30, 150)));
    }
  }
  b.ink(line(XL, g0, 167, g0, {seed: 'gwall', over: 'small'}) + rectInk(44, g0 + 10, 46, 90, {seed: 'gate', over: 'small', open: 0.4}), TK.struct);
  return b;
}

// ---------------------------------------------------------------- the component

export const S3West: React.FC = () => {
  const t = useTime();
  const far = useMemo(farBatch, []);
  const mid = useMemo(midBatch, []);
  const tr = new Batch();
  trainInto(tr, t);
  // one warehouse window lights up at 13.70
  const sw = new Batch();
  if (t >= 13.7) sw.fill(CM.lamp, archP(XL + 40, 792 + 88, 16, 34));
  void frac;
  return (
    <>
      <Paint b={far} seed="s3w/far" misreg={false} />
      <Paint b={tr} seed="s3w/train" misreg={false} />
      <Paint b={mid} seed="s3w/mid" />
      <Paint b={sw} seed="s3w/sw" misreg={false} />
      <FallingLeaves box={[-60, 880, 170, 1110]} n={7} size={11} seed="s3wleaves" wind={-22} />
    </>
  );
};

export {quadP, ovalPath, lobes};
