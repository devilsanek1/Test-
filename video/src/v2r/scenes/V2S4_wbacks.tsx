// V2S4_wbacks.tsx (lane L3, V2S4 WORLD helpers): the BACKS plane (0.6x) at the 17.96 pose, in plane px.
//   left        the back of a canal warehouse (arched windows, stacked loading doors and the hoist beam)
//   the gap     the sun's column stays low: an allotment yard (a greenhouse, a shed, a water butt, bean poles,
//               sunflowers gone to seed, an apple tree) so the sun, the gasholders and the viaduct read over it
//   terrace     five house backs: slate roofs (two with box dormers), party-wall stacks with pots and aerials, rear
//               sashes (a few warmly lit, one coming on, a neighbour reading at one), back extensions with lean-to
//               roofs, skylights and French doors, drainpipes, a soil stack, flues, a dish, ivy, window boxes; a
//               washing line that flaps, two garden trees in autumn leaf, pigeons on an extension, smoke from two
//               stacks blown east
// Nothing tops y 604; the sun's column (plane-x sunClear(0.6)) stays below y 716.
// Batch z-order inside one layer follows each colour's FIRST use: every stacking step opens a new layer (passes).
import React, {useMemo} from 'react';
import {CM, INK_PX} from '../palette';
import {useTime} from '../../lib/time';
import {line} from '../../lib/sketch';
import {Batch, Paint, P, rng, ovalPath, lobes, leafPath, lerp, frac, r1} from '../kit/canal/core';
import {litAt, Puffs} from '../kit/canal/life';
import {WindowPerson} from '../kit/cast';
import {ROW, PLANE_X, sunClear, WIND} from './V2S4_wcore';

const K = 0.6;
const [X0, X1] = PLANE_X(K);
const CLEAR = sunClear(K);
const HAIR = INK_PX.hair;
const GROUND = ROW.wallTop + 2; // everything below is behind the garden walls

// ---------------------------------------------------------------- the warehouse (left)

function warehouseInto(b: Batch) {
  const x0 = X0;
  const x1 = Math.min(CLEAR[0] - 8, 166);
  const top = 630;
  const cols = [x0 + 18, x0 + 62, x0 + 152, x0 + 196].filter((cx) => cx + 14 <= x1 - 4);
  const lx = x0 + 107;
  const arch = (cx: number, wy: number, ww: number, wh: number, o: number) =>
    `M${P(cx - ww / 2 - o, wy + wh + o)}L${P(cx - ww / 2 - o, wy + ww / 2)}A${r1(ww / 2 + o)} ${r1(ww / 2 + o)} 0 0 1 ${P(cx + ww / 2 + o, wy + ww / 2)}L${P(cx + ww / 2 + o, wy + wh + o)}Z`;
  // L0 the wall
  b.rect(CM.brickDeep, x0, top, x1 - x0, GROUND - top);
  b.layer();
  // L1 bands, window and door surrounds, the drainpipe
  b.rect(CM.limestone, x0, top - 5, x1 - x0 + 4, 7);
  b.rect(CM.brick, x0, top + 2, x1 - x0, 5);
  b.rect(CM.limestone, x0, top + 92, x1 - x0, 4);
  b.rect(CM.limestone, x0, top + 170, x1 - x0, 4);
  for (const cx of cols) for (let rr = 0; rr < 3; rr++) b.fill(CM.limestone, arch(cx, top + 22 + rr * 80, 22, 44, 3));
  for (let rr = 0; rr < 3; rr++) b.rect(CM.limestone, lx - 18, top + 17 + rr * 80, 36, 56);
  b.rect(CM.shadeCool, x1 - 10, top + 6, 3, GROUND - top - 6);
  b.layer();
  // L2 glass (one lit), door leaves, the hoist beam
  for (const cx of cols) for (let rr = 0; rr < 3; rr++) b.fill(rr === 1 && cx === cols[1] ? CM.lamp : CM.paneUnlit, arch(cx, top + 22 + rr * 80, 22, 44, 0));
  for (let rr = 0; rr < 3; rr++) b.rect(rr === 0 ? CM.coatSlate : CM.line, lx - 15, top + 20 + rr * 80, 30, 50);
  b.rect(CM.anchor, lx - 3, top - 2, 6, 16);
  b.rect(CM.anchor, lx - 2, top + 4, 30, 4);
  b.layer();
  // L3 glazing bars, the doors' split
  for (const cx of cols) {
    for (let rr = 0; rr < 3; rr++) {
      const wy = top + 22 + rr * 80;
      b.rect(CM.limestone, cx - 0.8, wy + 2, 1.6, 42);
      b.rect(CM.limestone, cx - 11, wy + 24, 22, 1.6);
    }
  }
  for (let rr = 0; rr < 3; rr++) b.rect(CM.shadeWarm, lx - 0.7, top + 20 + rr * 80, 1.4, 50);
  b.ink(`M${P(lx + 26, top + 8)}L${P(lx + 26, top + 40)}`, 1, CM.ink);
  b.ink(line(x1, top - 4, x1, GROUND, {seed: 's4ware/r', over: 'small'}) + line(x0, top - 5, x1 + 4, top - 5, {seed: 's4ware/t', over: 'small'}), HAIR);
}

// ---------------------------------------------------------------- the allotment yard in the sun's gap

const YARD = {gx: 186, gw: 92, ge: 812, gr: 790, sx: 292, sw: 62, st: 800, bx: 376, ax: 486};
const SUNFLOWERS: [number, number][] = [[408, 742], [428, 756], [446, 748]];

function yardInto(b: Batch, t: number) {
  const g = GROUND;
  const {gx, gw, ge, gr, sx, sw, st, bx, ax} = YARD;
  const sway = (i: number) => Math.sin(t * 1.1 + i * 1.3) * 1.2;
  // L0 the yard's back wall
  b.rect(CM.brickLight, CLEAR[0] - 10, 818, CLEAR[1] - CLEAR[0] + 20, g - 818);
  b.layer();
  // L1 coping; greenhouse glass, the shed, the water butt, the apple trunk
  b.rect(CM.limestone, CLEAR[0] - 10, 815, CLEAR[1] - CLEAR[0] + 20, 4);
  b.poly(CM.glass, [[gx, g], [gx, ge], [gx + gw / 2, gr], [gx + gw, ge], [gx + gw, g]]);
  b.rect(CM.line, sx, st, sw, g - st);
  b.rect(CM.sage, sx - 20, 832, 16, g - 832);
  b.rect(CM.line, ax - 3, 800, 6, g - 800);
  b.layer();
  // L2 tomato plants in the greenhouse, the shed's roof / window / door, the butt lid, the apple crown, leaves
  b.fill(CM.sage, lobes(gx + 6, gx + gw - 6, g, 34, 's4gh/tom', 4));
  b.poly(CM.paneUnlit, [[sx - 5, st + 2], [sx + sw + 5, st - 7], [sx + sw + 5, st - 2], [sx - 5, st + 7]]);
  b.rect(CM.glass, sx + 8, st + 14, 18, 14);
  b.rect(CM.coatSlate, sx + 34, st + 14, 20, g - st - 14);
  b.rect(CM.coatSlate, sx - 21, 830, 18, 3);
  b.fill(CM.sage, lobes(ax - 34, ax + 30, 812, 70, 's4yard/apple', 4));
  for (const [i, [x, y]] of SUNFLOWERS.entries()) b.fill(CM.sage, leafPath(x - 6 + sway(i) * 0.3, y + 40, 14, 4.5, 30));
  b.fill(CM.sage, leafPath(bx - 8, 800, 16, 5, 70));
  b.fill(CM.sage, leafPath(bx + 2, 820, 14, 5, 40));
  b.layer();
  // L3 tomatoes, the greenhouse's top glass, latch, apples and the gold of the crown, the bean leaves, sunflower heads
  for (let k = 0; k < 5; k++) b.fill(CM.leafRust, ovalPath(gx + 14 + k * 16, g - 14 - (k % 2) * 8, 2.6, 2.6));
  b.poly(CM.glass, [[gx + 4, ge + 3], [gx + gw / 2, gr + 4], [gx + gw / 2, gr + 14], [gx + 4, ge + 12]]);
  b.rect(CM.coatMustard, sx + 50, st + 34, 2.4, 2.4);
  b.fill(CM.leafGold, lobes(ax - 14, ax + 26, 800, 40, 's4yard/apple2', 3));
  b.fill(CM.leafGold, leafPath(bx + 7, 786, 14, 5, -60));
  b.fill(CM.leafGold, leafPath(bx - 4, 772, 12, 4, -30));
  for (const [i, [x, y]] of SUNFLOWERS.entries()) b.fill(CM.coatMustard, ovalPath(x + 3 + sway(i), y + 2, 9, 7.5));
  b.layer();
  for (const [dx, dy] of [[-18, -40], [6, -54], [16, -30], [-4, -22]]) b.fill(CM.leafRust, ovalPath(ax + dx, 812 + dy, 2.6, 2.6));
  for (const [i, [x, y]] of SUNFLOWERS.entries()) b.fill(CM.line, ovalPath(x + 4.5 + sway(i), y + 3, 5, 4.4));
  // the lines: the greenhouse frame, planks, bean poles, sunflower stalks
  let gl = '';
  for (let k = 0; k <= 4; k++) gl += `M${P(gx + (gw * k) / 4, k === 0 || k === 4 ? ge : lerp(ge, gr, 1 - Math.abs(k - 2) / 2))}L${P(gx + (gw * k) / 4, g)}`;
  gl += `M${P(gx, ge)}L${P(gx + gw / 2, gr)}L${P(gx + gw, ge)}M${P(gx, 836)}L${P(gx + gw, 836)}`;
  for (const dx of [-14, -5, 5, 14]) gl += `M${P(bx + dx, g)}L${P(bx + dx * 0.15, 758)}`;
  b.ink(gl, 1.2, CM.line);
  let pl = '';
  for (let x = sx + 6; x < sx + sw; x += 7) pl += `M${P(x, st + 2)}L${P(x, g)}`;
  b.ink(pl, 0.7, CM.shadeWarm);
  let stalks = '';
  for (const [i, [x, y]] of SUNFLOWERS.entries()) stalks += `M${P(x - 2, g)}Q${P(x - 4, (y + g) / 2)} ${P(x + sway(i), y + 4)}`;
  b.ink(stalks, 1.5, CM.sage);
}

// ---------------------------------------------------------------- the terrace backs

type House = {x0: number; x1: number; brick: string; ridge: number; eave: number; roof: string; dormer?: boolean; ext: 'left' | 'right'; extTop: number; ivy?: boolean; render?: boolean};
export const HOUSES: House[] = [
  {x0: 512, x1: 676, brick: CM.brickLight, ridge: 618, eave: 660, roof: CM.paneUnlit, ext: 'left', extTop: 776, render: true},
  {x0: 676, x1: 846, brick: CM.brick, ridge: 616, eave: 656, roof: CM.shadeCool, dormer: true, ext: 'right', extTop: 770},
  {x0: 846, x1: 1012, brick: CM.brickDeep, ridge: 620, eave: 662, roof: CM.paneUnlit, ext: 'left', extTop: 782, ivy: true},
  {x0: 1012, x1: 1182, brick: CM.brickLight, ridge: 615, eave: 655, roof: CM.shadeCool, dormer: true, ext: 'right', extTop: 772},
  {x0: 1182, x1: X1, brick: CM.brick, ridge: 619, eave: 660, roof: CM.paneUnlit, ext: 'left', extTop: 778},
];
const extOf = (h: House) => {
  const w = h.x1 - h.x0;
  return h.ext === 'left' ? {x0: h.x0, x1: h.x0 + w * 0.48} : {x0: h.x0 + w * 0.52, x1: h.x1};
};

export type BackWin = {x: number; y: number; w: number; h: number; seed: string; i: number};

/** The windows of the terrace (first-floor pairs and a kitchen window each), in a fixed order. */
export const BACK_WINS: BackWin[] = (() => {
  const out: BackWin[] = [];
  HOUSES.forEach((h, i) => {
    const w = h.x1 - h.x0;
    const wy = h.eave + 22;
    out.push({x: h.x0 + w * 0.2, y: wy, w: 32, h: 54, seed: `s4hw${i}0`, i: out.length});
    out.push({x: h.x0 + w * 0.62, y: wy, w: 32, h: 54, seed: `s4hw${i}1`, i: out.length});
    out.push({x: h.ext === 'left' ? h.x0 + w * 0.66 : h.x0 + w * 0.16, y: 800, w: 38, h: 52, seed: `s4hg${i}`, i: out.length});
  });
  return out;
})();
/** House 2's kitchen comes on mid-truck; house 4's left sash is lit (the neighbour reading there). */
export const BACK_WIN_FORCE = [{i: 5, t: 16.2, on: true}, {i: 9, t: 0, on: true}];

function housesInto(b: Batch) {
  const stacksInk: string[] = [];
  const aer: string[] = [];
  const pipes: string[] = [];
  const slates: string[] = [];
  // P0: roofs, rear walls
  HOUSES.forEach((h) => {
    const w = h.x1 - h.x0;
    b.poly(h.roof, [[h.x0 - 3, h.eave], [h.x0 + 4, h.ridge], [h.x1 - 4, h.ridge], [h.x1 + 3, h.eave]]);
    b.rect(h.render ? CM.stucco : h.brick, h.x0, h.eave, w, GROUND - h.eave);
  });
  b.layer();
  // P1: ridge tiles, the render's plinth band, gutters' fascias, dormer bodies, sparse brick ticks, back extensions
  HOUSES.forEach((h, i) => {
    const w = h.x1 - h.x0;
    const r = rng(`s4house/${i}`);
    const e = extOf(h);
    b.rect(CM.stoneShade, h.x0 + 4, h.ridge - 3, w - 8, 3.5);
    let sl = '';
    for (let y = h.ridge + 9; y < h.eave - 3; y += 9) sl += `M${P(h.x0 + 6, y)}L${P(h.x1 - 6, y + r.jitter(0.6))}`;
    slates.push(sl);
    if (h.render) b.rect(CM.stoneShade, h.x0, h.eave, w, 6);
    b.rect(CM.limestone, h.x0 - 3, h.eave - 1, w + 6, 4);
    if (h.dormer) b.rect(CM.stucco, h.x0 + w * 0.3, h.ridge + 4, w * 0.42, h.eave - h.ridge - 4);
    if (!h.render) {
      for (let k = 0; k < 16; k++) {
        const tx = r.range(h.x0 + 6, h.x1 - 16);
        const ty = r.range(h.eave + 8, GROUND - 10);
        if (tx + 12 > e.x0 && tx < e.x1 && ty > h.extTop - 6) continue;
        b.rect(h.brick === CM.brickDeep ? CM.brick : CM.brickDeep, tx, ty, r.range(7, 12), 2);
      }
    }
    b.rect(h.brick === CM.brickLight ? CM.brick : CM.brickLight, e.x0, h.extTop + 14, e.x1 - e.x0, GROUND - h.extTop - 14);
  });
  b.layer();
  // P2: gutters (plum), dormer caps and windows, bathroom windows, extension roofs, door frames, pipes, flues, boxes
  HOUSES.forEach((h, i) => {
    const w = h.x1 - h.x0;
    const r = rng(`s4house2/${i}`);
    const e = extOf(h);
    const wy = h.eave + 22;
    b.rect(CM.anchor, h.x0 - 3, h.eave + 3, w + 6, 2.2);
    if (h.dormer) {
      const dx = h.x0 + w * 0.3;
      const dw = w * 0.42;
      b.rect(CM.stoneShade, dx - 2, h.ridge + 2, dw + 4, 3);
      b.rect(r.chance(0.5) ? CM.lamp : CM.paneUnlit, dx + 6, h.ridge + 11, dw - 12, h.eave - h.ridge - 18);
    }
    const bwx = h.x0 + w * 0.45;
    b.rect(CM.paper, bwx - 2, wy + 6, 18, 24);
    b.poly(CM.paneUnlit, [[e.x0 - 3, h.extTop + 16], [e.x0 - 3, h.extTop + (h.ext === 'left' ? 6 : -4)], [e.x1 + 3, h.extTop + (h.ext === 'left' ? -4 : 6)], [e.x1 + 3, h.extTop + 16]]);
    const fdx = lerp(e.x0, e.x1, 0.3);
    b.rect(CM.paper, fdx - 3, h.extTop + 28, 46, GROUND - h.extTop - 28);
    const px = h.x1 - 8;
    b.rect(CM.anchor, px, h.eave + 4, 2.4, GROUND - h.eave - 4);
    b.rect(CM.anchor, px - 2, h.eave + 4, 6, 4);
    pipes.push(`M${P(px + 1.2, h.eave + 8)}L${P(px + 1.2, GROUND)}`);
    if (i % 2 === 0) b.rect(CM.shadeCool, h.x0 + w * 0.42, h.eave + 4, 5, h.extTop - h.eave + 8);
    b.rect(CM.paper, h.x0 + w * 0.08, wy + 30, 8, 6);
    if (i === 1 || i === 4) b.fill(CM.paper, ovalPath(h.x0 + w * 0.88, h.eave + 16, 7, 8));
    b.rect(CM.line, h.x0 + w * 0.2 - 3, wy + 60, 38, 6);
  });
  b.layer();
  // P3: dormer bars, bathroom glass, skylights, French door glass, window-box flowers, ivy, the stacks
  HOUSES.forEach((h, i) => {
    const w = h.x1 - h.x0;
    const r = rng(`s4house3/${i}`);
    const e = extOf(h);
    const wy = h.eave + 22;
    if (h.dormer) b.rect(CM.paper, h.x0 + w * 0.3 + w * 0.21 - 0.7, h.ridge + 11, 1.4, h.eave - h.ridge - 18);
    const bwx = h.x0 + w * 0.45;
    b.rect(CM.glass, bwx, wy + 8, 14, 20);
    b.rect(CM.glass, lerp(e.x0, e.x1, 0.35), h.extTop + (h.ext === 'left' ? 0 : 1), 18, 5);
    const fdx = lerp(e.x0, e.x1, 0.3);
    b.rect(r.chance(0.5) ? CM.glass : CM.paneUnlit, fdx, h.extTop + 31, 40, GROUND - h.extTop - 31);
    for (let k = 0; k < 4; k++) b.fill(k % 2 ? CM.sage : CM.box, ovalPath(h.x0 + w * 0.2 + 1 + k * 8, wy + 58, 3.5, 3.2));
    if (h.ivy) {
      for (let k = 0; k < 9; k++) {
        const iy = GROUND - k * 24 - r.range(0, 10);
        const ix = h.x0 + w * 0.06 + Math.sin(k * 1.3) * 8;
        b.fill(k % 3 === 2 ? CM.leafGold : CM.sage, lobes(ix - 14, ix + 14, iy, 22, `s4ivy${k}`, 3));
      }
    }
    // the party-wall stack (on the boundary at x0) with its cap
    const cw = 22;
    const ctop = Math.max(ROW.top + 6, h.ridge - 16 - r.range(0, 4));
    b.rect(i % 2 ? CM.brickLight : CM.brick, h.x0 - cw / 2, ctop, cw, h.ridge - ctop + 6);
    stacksInk.push(line(h.x0 - cw / 2, ctop, h.x0 - cw / 2, h.ridge + 4, {seed: `s4stk${i}`, over: 'small'}));
    if (i !== 2) {
      const ay = Math.max(ROW.top, ctop - 18);
      aer.push(`M${P(h.x0 + 4, ctop - 4)}L${P(h.x0 + 4, ay)}M${P(h.x0 - 6, ay + 3)}L${P(h.x0 + 14, ay + 3)}M${P(h.x0 - 3, ay + 7)}L${P(h.x0 + 11, ay + 7)}`);
    }
  });
  b.layer();
  // P4: the stacks' caps and pots, the bathroom blind, the French doors' bar; the ink
  HOUSES.forEach((h, i) => {
    const w = h.x1 - h.x0;
    const e = extOf(h);
    const r = rng(`s4house3/${i}`);
    const cw = 22;
    const ctop = Math.max(ROW.top + 6, h.ridge - 16 - r.range(0, 4));
    b.rect(CM.limestone, h.x0 - cw / 2 - 2, ctop, cw + 4, 3.5);
    for (let p = 0; p < 3; p++) b.rect(p === 1 ? CM.leafRust : CM.brickDeep, h.x0 - cw / 2 + 2 + p * 6.5, Math.max(ROW.top, ctop - 5), 5, 5);
    b.rect(CM.stoneShade, h.x0 + w * 0.45, h.eave + 30, 14, 7);
    const fdx = lerp(e.x0, e.x1, 0.3);
    b.rect(CM.paper, fdx + 19, h.extTop + 31, 2, GROUND - h.extTop - 31);
  });
  b.ink(slates.join(''), 0.7, CM.shadeCool);
  b.ink(HOUSES.map((h, i) => line(h.x0 - 3, h.eave, h.x1 + 3, h.eave, {seed: `s4eave${i}`, over: 'small'})).join(''), HAIR);
  b.ink(stacksInk.join(''), HAIR);
  b.ink(aer.join(''), 1.0, CM.ink);
  b.ink(pipes.join(''), 0.6, CM.ink);
}

/** Rear sashes in three passes (frames, glass and curtains, bars and sills): lit (curtains, a lamp) or unlit. */
function sashesInto(b: Batch, wins: BackWin[], lit: (w: BackWin) => boolean) {
  for (const w of wins) b.rect(CM.paper, w.x - 3, w.y - 3, w.w + 6, w.h + 5);
  b.layer();
  for (const w of wins) {
    if (lit(w)) b.rect(CM.lamp, w.x, w.y, w.w, w.h);
    else b.rect(CM.paneUnlit, w.x, w.y, w.w, w.h);
  }
  b.layer();
  for (const w of wins) {
    const r = rng(w.seed);
    if (lit(w)) {
      b.rect(CM.lampCore, w.x + w.w * 0.22, w.y + w.h * 0.12, w.w * 0.5, w.h * 0.36);
      const c = r.pick([CM.box, CM.coatMustard, CM.blossom, CM.sage, CM.leafRust]);
      b.rect(c, w.x, w.y, w.w * 0.2, w.h);
      b.rect(c, w.x + w.w * 0.8, w.y, w.w * 0.2, w.h);
    } else {
      b.poly(CM.glass, [[w.x, w.y], [w.x + w.w * 0.7, w.y], [w.x, w.y + w.h * 0.42]]);
      if (r.chance(0.5)) b.rect(CM.coatOat, w.x, w.y, w.w, w.h * r.range(0.18, 0.4));
    }
  }
  b.layer();
  for (const w of wins) {
    b.rect(CM.paper, w.x, w.y + w.h * 0.48, w.w, 2.2);
    b.rect(CM.paper, w.x + w.w / 2 - 0.8, w.y, 1.6, w.h);
    b.rect(CM.limestone, w.x - 5, w.y + w.h + 2, w.w + 10, 4);
  }
}

/** Trees in the back gardens: a big autumn plane (house 3) and a smaller one (house 5). */
const TREES = [
  {x: 930, base: GROUND, h: 190, seed: 's4tree1'},
  {x: 1250, base: GROUND, h: 150, seed: 's4tree2'},
];

function treesInto(b: Batch, t: number) {
  const geo = TREES.map((tr) => {
    const r = rng(tr.seed);
    return {...tr, sw: Math.sin(t * 0.8 + r.next() * 6) * 1.2, R: tr.h * 0.42, cy: tr.base - tr.h * 0.62};
  });
  for (const g of geo) b.fill(CM.line, `M${P(g.x - 6, g.base)}L${P(g.x - 3, g.cy + g.R * 0.2)}L${P(g.x + 3, g.cy + g.R * 0.2)}L${P(g.x + 6, g.base)}Z`);
  b.layer();
  for (const g of geo) b.fill(CM.sage, lobes(g.x - g.R + g.sw, g.x + g.R + g.sw, g.cy + g.R * 0.75, g.R * 1.6, `${g.seed}/a`, 5));
  b.layer();
  for (const g of geo) {
    b.fill(CM.leafGold, lobes(g.x - g.R * 0.75 + g.sw, g.x + g.R * 0.2 + g.sw, g.cy + g.R * 0.3, g.R * 1.0, `${g.seed}/b`, 3));
    b.fill(CM.leafRust, lobes(g.x + g.R * 0.05 + g.sw, g.x + g.R * 0.85 + g.sw, g.cy + g.R * 0.62, g.R * 0.8, `${g.seed}/c`, 3));
  }
  b.layer();
  for (const g of geo) b.fill(CM.coatMustard, lobes(g.x - g.R * 0.3 + g.sw, g.x + g.R * 0.35 + g.sw, g.cy - g.R * 0.25, g.R * 0.6, `${g.seed}/d`, 2));
  b.ink(geo.map((g) => `M${P(g.x, g.cy + g.R * 0.5)}L${P(g.x - g.R * 0.35, g.cy - g.R * 0.05)}M${P(g.x, g.cy + g.R * 0.35)}L${P(g.x + g.R * 0.32, g.cy)}`).join(''), 1.4, CM.line);
}

/** Leaves falling from the garden trees (they drift east as they fall; the path plane catches more). */
function treeLeavesInto(b: Batch, t: number) {
  const r = rng('s4backleaves');
  for (let i = 0; i < 10; i++) {
    const tr = TREES[i % 2];
    const per = r.range(3.4, 5.2);
    const u = frac(t / per + r.next());
    const x = tr.x + r.range(-tr.h * 0.35, tr.h * 0.35) + WIND * u * 50 + Math.sin(u * 9 + i) * 10;
    const y = lerp(tr.base - tr.h * 0.6, GROUND + 4, u);
    b.fill(i % 2 ? CM.leafGold : CM.leafRust, leafPath(x, y, 8, 3 * Math.abs(Math.cos(t * 5 + i)) + 0.7, t * 140 + i * 40));
  }
}

/** A washing line across house 2's garden: pegged clothes that swing and flap in the east wind. */
const WASH = {x0: 690, y0: 790, x1: 806, y1: 784, sag: 9};
function washingInto(b: Batch, t: number) {
  const {x0, y0, x1, y1, sag} = WASH;
  b.rect(CM.line, x1 - 1.5, y1, 3, GROUND - y1);
  const at = (u: number): [number, number] => [lerp(x0, x1, u), lerp(y0, y1, u) + sag * 4 * u * (1 - u)];
  let d = '';
  for (let k = 0; k <= 12; k++) {
    const [x, y] = at(k / 12);
    d += `${k ? 'L' : 'M'}${P(x, y)}`;
  }
  b.ink(d, 0.9, CM.ink);
  b.layer();
  const items: [number, number, number, string][] = [
    [0.1, 16, 22, CM.paper],
    [0.28, 22, 30, CM.coatSlate],
    [0.46, 10, 14, CM.box],
    [0.58, 12, 16, CM.coatMustard],
    [0.76, 20, 26, CM.blossom],
    [0.92, 9, 13, CM.paper],
  ];
  items.forEach(([u, w, h, c], i) => {
    const [x, y] = at(u);
    const fl = Math.sin(t * 5.2 + i * 1.7) * 0.5 + Math.sin(t * 8.3 + i) * 0.2;
    const lean = WIND * (3 + fl * 4);
    b.poly(c, [[x - w / 2, y], [x + w / 2, y], [x + w / 2 + lean, y + h * (0.92 + fl * 0.06)], [x - w / 2 + lean * 0.8, y + h]]);
  });
  b.layer();
  items.forEach(([u, w]) => {
    const [x, y] = at(u);
    b.rect(CM.line, x - w / 2 + 1, y - 2, 2, 4);
    b.rect(CM.line, x + w / 2 - 3, y - 2, 2, 4);
  });
}

/** Pigeons on house 4's extension (its high end): bob, a shuffle now and then. */
function pigeonsInto(b: Batch, t: number) {
  const h = HOUSES[3];
  const e = extOf(h);
  const birds = [0, 1, 2].map((i) => {
    const r = rng(`s4pig/${i}`);
    const x = e.x0 + 14 + i * 22 + Math.floor(frac(t / 3.4 + r.next()) * 2) * 4;
    const ey = h.extTop + 6 - (10 * (x - e.x0 + 3)) / (e.x1 - e.x0 + 6);
    return {x, ey, face: r.chance(0.5) ? 1 : -1, nod: Math.max(0, Math.sin(t * 2.2 + i * 2) - 0.5) * 2.2};
  });
  const s = 11;
  for (const p of birds) b.fill(CM.stoneShade, ovalPath(p.x, p.ey - s * 0.36, s * 0.46, s * 0.3));
  b.layer();
  for (const p of birds) {
    const by = p.ey - s * 0.36;
    b.fill(CM.shadeCool, ovalPath(p.x - p.face * s * 0.08, by - s * 0.05, s * 0.28, s * 0.14));
    b.fill(CM.shadeCool, ovalPath(p.x + p.face * (s * 0.38 + p.nod * 0.4), by - s * 0.27 + p.nod * 0.4, s * 0.15, s * 0.15));
    b.fill(CM.shadeCool, `M${P(p.x - p.face * s * 0.36, by)}L${P(p.x - p.face * s * 0.72, by + s * 0.08)}L${P(p.x - p.face * s * 0.34, by + s * 0.16)}Z`);
  }
}

// ---------------------------------------------------------------- the plane

export const BacksPlane: React.FC = () => {
  const t = useTime();
  const stat = useMemo(() => {
    const b = new Batch();
    warehouseInto(b);
    b.layer();
    housesInto(b);
    return b;
  }, []);
  const n = BACK_WINS.length;
  const lit = (w: BackWin) => litAt(t, 's4backs', w.i, n, {litFrac: 0.28, gap: [0.9, 2.2], force: BACK_WIN_FORCE});
  const dyn = new Batch();
  sashesInto(dyn, BACK_WINS, lit);
  dyn.layer();
  yardInto(dyn, t);
  dyn.layer();
  washingInto(dyn, t);
  dyn.layer();
  treesInto(dyn, t);
  dyn.layer();
  pigeonsInto(dyn, t);
  dyn.layer();
  treeLeavesInto(dyn, t);
  const nb = BACK_WINS[9];
  return (
    <>
      <Paint b={stat} seed="s4backsSt" />
      <Paint b={dyn} seed="s4backsDyn" misreg={false} />
      <WindowPerson x={nb.x + nb.w / 2} y={nb.y + nb.h} hb={26} seed="s4nbr" act="read" />
      <Puffs x={HOUSES[1].x0} y={HOUSES[1].ridge - 26} seed="s4smoke1" kind="smoke" scale={0.42} drift={34 * WIND} ceil={ROW.ceil} />
      <Puffs x={HOUSES[4].x0} y={HOUSES[4].ridge - 26} seed="s4smoke2" kind="smoke" scale={0.38} drift={30 * WIND} ceil={ROW.ceil} />
    </>
  );
};
