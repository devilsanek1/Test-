// V2S4_wbacks.tsx (lane L3, V2S4 WORLD helpers): the BACKS plane (0.6x) at the 17.96 pose, in plane px.
//   left        the back of a canal warehouse (arched windows, a loading door and its hoist beam)
//   the gap     the sun's column stays low: an allotment yard (a greenhouse, a shed, bean poles, sunflowers gone to
//               seed, an apple tree, a water butt) so the sun, the gasholders and the viaduct read over it
//   terrace     five house backs: slate roofs (two with box dormers), party-wall stacks with pots and aerials, rear
//               sashes (a few warmly lit, one switching, a neighbour at one), back extensions with lean-to roofs and
//               French doors, drainpipes, a soil stack, a flue, ivy, window boxes; a washing line that flaps, an
//               autumn tree that sheds leaves, pigeons on an extension ridge, smoke from two stacks blown east
// Nothing tops y 604; the sun's column (plane-x sunClear(0.6)) stays below y 716.
import React, {useMemo} from 'react';
import {CM, INK_PX} from '../palette';
import {useTime} from '../../lib/time';
import {line, rect as rectInk} from '../../lib/sketch';
import {Batch, Paint, P, rng, ovalPath, domePath, lobes, leafPath, lerp, frac, r1} from '../kit/canal/core';
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
  b.rect(CM.brickDeep, x0, top, x1 - x0, GROUND - top);
  b.rect(CM.limestone, x0, top - 5, x1 - x0 + 4, 7);
  b.rect(CM.brick, x0, top + 2, x1 - x0, 5);
  b.rect(CM.limestone, x0, top + 92, x1 - x0, 4);
  b.rect(CM.limestone, x0, top + 170, x1 - x0, 4);
  // arched windows in three rows (cast-iron glazing), the loading-door column
  const cols = [x0 + 18, x0 + 62, x0 + 152, x0 + 196];
  for (const cx of cols) {
    if (cx + 14 > x1 - 4) continue;
    for (let rr = 0; rr < 3; rr++) {
      const wy = top + 22 + rr * 80;
      const ww = 22;
      const wh = 44;
      b.fill(CM.limestone, `M${P(cx - ww / 2 - 3, wy + wh + 3)}L${P(cx - ww / 2 - 3, wy + ww / 2)}A${r1(ww / 2 + 3)} ${r1(ww / 2 + 3)} 0 0 1 ${P(cx + ww / 2 + 3, wy + ww / 2)}L${P(cx + ww / 2 + 3, wy + wh + 3)}Z`);
      b.fill(rr === 1 && cx === cols[1] ? CM.lamp : CM.paneUnlit, `M${P(cx - ww / 2, wy + wh)}L${P(cx - ww / 2, wy + ww / 2)}A${r1(ww / 2)} ${r1(ww / 2)} 0 0 1 ${P(cx + ww / 2, wy + ww / 2)}L${P(cx + ww / 2, wy + wh)}Z`);
      b.rect(CM.glass, cx - ww / 2, wy + ww / 2, ww, 3);
      b.rect(CM.limestone, cx - 0.8, wy + 2, 1.6, wh - 2);
    }
  }
  // loading doors stacked in the middle column + the hoist beam
  const lx = x0 + 107;
  for (let rr = 0; rr < 3; rr++) {
    const wy = top + 20 + rr * 80;
    b.rect(CM.limestone, lx - 18, wy - 3, 36, 56);
    b.rect(rr === 0 ? CM.coatSlate : CM.line, lx - 15, wy, 30, 50);
    b.rect(CM.shadeWarm, lx - 0.7, wy, 1.4, 50);
  }
  b.rect(CM.anchor, lx - 3, top - 2, 6, 16);
  b.rect(CM.anchor, lx - 2, top + 4, 30, 4);
  b.ink(`M${P(lx + 26, top + 8)}L${P(lx + 26, top + 40)}`, 1, CM.ink);
  b.rect(CM.shadeCool, x1 - 10, top + 6, 3, GROUND - top - 6);
  b.ink(line(x1, top - 4, x1, GROUND, {seed: 's4ware/r', over: 'small'}) + line(x0, top - 5, x1 + 4, top - 5, {seed: 's4ware/t', over: 'small'}), HAIR);
}

// ---------------------------------------------------------------- the allotment yard in the sun's gap

function yardInto(b: Batch, t: number) {
  const g = GROUND;
  // a paling fence along the yard's back, the yard's far wall (low brick)
  b.rect(CM.brickLight, CLEAR[0] - 10, 818, CLEAR[1] - CLEAR[0] + 20, g - 818);
  b.rect(CM.limestone, CLEAR[0] - 10, 815, CLEAR[1] - CLEAR[0] + 20, 4);
  // greenhouse: a wooden frame, glass, tomato plants inside
  const gx = 186;
  const gw = 92;
  const ge = 812;
  const gr = 790;
  b.poly(CM.glass, [[gx, g], [gx, ge], [gx + gw / 2, gr], [gx + gw, ge], [gx + gw, g]]);
  b.fill(CM.sage, lobes(gx + 6, gx + gw - 6, g, 34, 's4gh/tom', 4));
  for (let k = 0; k < 5; k++) b.fill(CM.leafRust, ovalPath(gx + 14 + k * 16, g - 14 - (k % 2) * 8, 2.6, 2.6));
  b.poly(CM.glass, [[gx + 4, ge + 3], [gx + gw / 2, gr + 4], [gx + gw / 2, gr + 14], [gx + 4, ge + 12]]);
  let gl = '';
  for (let k = 0; k <= 4; k++) gl += `M${P(gx + (gw * k) / 4, k === 0 || k === 4 ? ge : lerp(ge, gr, 1 - Math.abs(k - 2) / 2))}L${P(gx + (gw * k) / 4, g)}`;
  gl += `M${P(gx, ge)}L${P(gx + gw / 2, gr)}L${P(gx + gw, ge)}M${P(gx, 836)}L${P(gx + gw, 836)}`;
  b.ink(gl, 1.2, CM.line);
  // shed: planks, a felt roof, a window, a door with a latch
  const sx = 292;
  const sw = 62;
  const st = 800;
  b.rect(CM.line, sx, st, sw, g - st);
  b.poly(CM.paneUnlit, [[sx - 5, st + 2], [sx + sw + 5, st - 7], [sx + sw + 5, st - 2], [sx - 5, st + 7]]);
  b.rect(CM.glass, sx + 8, st + 14, 18, 14);
  b.rect(CM.coatSlate, sx + 34, st + 14, 20, g - st - 14);
  b.rect(CM.coatMustard, sx + 50, st + 34, 2.4, 2.4);
  let pl = '';
  for (let x = sx + 6; x < sx + sw; x += 7) pl += `M${P(x, st + 2)}L${P(x, g)}`;
  b.ink(pl, 0.7, CM.shadeWarm);
  // a water butt and a wheelbarrow tipped against the shed
  b.rect(CM.sage, sx - 20, 832, 16, g - 832);
  b.rect(CM.coatSlate, sx - 21, 830, 18, 3);
  // bean poles (a teepee) with the season's last growth
  const bx = 376;
  let bp = '';
  for (const dx of [-14, -5, 5, 14]) bp += `M${P(bx + dx, g)}L${P(bx + dx * 0.15, 758)}`;
  b.ink(bp, 1.3, CM.line);
  b.fill(CM.sage, leafPath(bx - 8, 800, 16, 5, 70));
  b.fill(CM.leafGold, leafPath(bx + 7, 786, 14, 5, -60));
  b.fill(CM.sage, leafPath(bx + 2, 820, 14, 5, 40));
  b.fill(CM.leafGold, leafPath(bx - 4, 772, 12, 4, -30));
  // sunflowers gone to seed, nodding east
  const sun = [[408, 742], [428, 756], [446, 748]] as [number, number][];
  sun.forEach(([x, y], i) => {
    const sw2 = Math.sin(t * 1.1 + i * 1.3) * 1.2;
    b.ink(`M${P(x - 2, g)}Q${P(x - 4, (y + g) / 2)} ${P(x + sw2, y + 4)}`, 1.5, CM.sage);
    b.fill(CM.sage, leafPath(x - 6, y + 40, 14, 4.5, 30));
    b.fill(CM.coatMustard, ovalPath(x + 3 + sw2, y + 2, 9, 7.5));
    b.fill(CM.line, ovalPath(x + 4.5 + sw2, y + 3, 5, 4.4));
  });
  // a little apple tree at the gap's east end (kept low: the sun's column)
  const ax = 486;
  b.rect(CM.line, ax - 3, 800, 6, g - 800);
  b.fill(CM.sage, lobes(ax - 34, ax + 30, 812, 70, 's4yard/apple', 4));
  b.fill(CM.leafGold, lobes(ax - 14, ax + 26, 800, 40, 's4yard/apple2', 3));
  for (const [dx, dy] of [[-18, -40], [6, -54], [16, -30], [-4, -22]]) b.fill(CM.leafRust, ovalPath(ax + dx, 812 + dy, 2.6, 2.6));
}

// ---------------------------------------------------------------- the terrace backs

type House = {x0: number; x1: number; brick: string; ridge: number; eave: number; roof: string; dormer?: boolean; ext: 'left' | 'right'; extTop: number; ivy?: boolean; render?: boolean};
const HOUSES: House[] = [
  {x0: 512, x1: 676, brick: CM.brickLight, ridge: 618, eave: 660, roof: CM.paneUnlit, ext: 'left', extTop: 776, render: true},
  {x0: 676, x1: 846, brick: CM.brick, ridge: 616, eave: 656, roof: CM.shadeCool, dormer: true, ext: 'right', extTop: 770},
  {x0: 846, x1: 1012, brick: CM.brickDeep, ridge: 620, eave: 662, roof: CM.paneUnlit, ext: 'left', extTop: 782, ivy: true},
  {x0: 1012, x1: 1182, brick: CM.brickLight, ridge: 615, eave: 655, roof: CM.shadeCool, dormer: true, ext: 'right', extTop: 772},
  {x0: 1182, x1: X1, brick: CM.brick, ridge: 619, eave: 660, roof: CM.paneUnlit, ext: 'left', extTop: 778},
];

/** Rear sash: frame, sashes, glazing bar; lit (curtains, a lamp) or unlit (the sky's reflection). */
function rearSash(b: Batch, x: number, y: number, w: number, h: number, lit: boolean, seed: string) {
  const r = rng(seed);
  b.rect(CM.paper, x - 3, y - 3, w + 6, h + 5);
  if (lit) {
    b.rect(CM.lamp, x, y, w, h);
    b.rect(CM.lampCore, x + w * 0.2, y + h * 0.12, w * 0.5, h * 0.36);
    const c = r.pick([CM.box, CM.coatMustard, CM.blossom, CM.sage, CM.leafRust]);
    b.rect(c, x, y, w * 0.2, h);
    b.rect(c, x + w * 0.8, y, w * 0.2, h);
  } else {
    b.rect(CM.paneUnlit, x, y, w, h);
    b.poly(CM.glass, [[x, y], [x + w * 0.7, y], [x, y + h * 0.42]]);
    if (r.chance(0.5)) b.rect(CM.coatOat, x, y, w, h * r.range(0.18, 0.4));
  }
  b.rect(CM.paper, x, y + h * 0.48, w, 2.2);
  b.rect(CM.paper, x + w / 2 - 0.8, y, 1.6, h);
  b.rect(CM.limestone, x - 5, y + h + 2, w + 10, 4);
}

type BackWin = {x: number; y: number; w: number; h: number; seed: string; i: number};

function housesInto(b: Batch, wins: BackWin[]) {
  let stacks = '';
  let aer = '';
  let pipes = '';
  let wi = 0;
  HOUSES.forEach((h, i) => {
    const w = h.x1 - h.x0;
    const r = rng(`s4house/${i}`);
    // roof slope, ridge tiles, the rear wall
    b.poly(h.roof, [[h.x0 - 3, h.eave], [h.x0 + 4, h.ridge], [h.x1 - 4, h.ridge], [h.x1 + 3, h.eave]]);
    b.rect(CM.stoneShade, h.x0 + 4, h.ridge - 3, w - 8, 3.5);
    let sl = '';
    for (let y = h.ridge + 9; y < h.eave - 3; y += 9) sl += `M${P(h.x0 + 6, y)}L${P(h.x1 - 6, y + r.jitter(0.6))}`;
    b.ink(sl, 0.7, h.roof === CM.paneUnlit ? CM.shadeCool : CM.paneUnlit);
    b.rect(h.render ? CM.stucco : h.brick, h.x0, h.eave, w, GROUND - h.eave);
    if (h.render) b.rect(CM.stoneShade, h.x0, h.eave, w, 6);
    // gutter (plum) and fascia
    b.rect(CM.limestone, h.x0 - 3, h.eave - 1, w + 6, 4);
    b.rect(CM.anchor, h.x0 - 3, h.eave + 3, w + 6, 2.2);
    // a box dormer on the slope (a loft conversion)
    if (h.dormer) {
      const dx = h.x0 + w * 0.3;
      const dw = w * 0.42;
      b.rect(CM.stucco, dx, h.ridge + 4, dw, h.eave - h.ridge - 4);
      b.rect(CM.stoneShade, dx - 2, h.ridge + 2, dw + 4, 3);
      const lit = r.chance(0.5);
      b.rect(lit ? CM.lamp : CM.paneUnlit, dx + 6, h.ridge + 11, dw - 12, h.eave - h.ridge - 18);
      b.rect(CM.paper, dx + dw / 2 - 0.7, h.ridge + 11, 1.4, h.eave - h.ridge - 18);
    }
    // brick ticks (sparse) on bare brick
    if (!h.render) {
      for (let k = 0; k < 14; k++) {
        const tx = r.range(h.x0 + 6, h.x1 - 16);
        const ty = r.range(h.eave + 8, GROUND - 10);
        b.rect(h.brick === CM.brickDeep ? CM.brick : CM.brickDeep, tx, ty, r.range(7, 12), 2);
      }
    }
    // first-floor sashes (two) + a small bathroom window, the extension below one of them
    const wy = h.eave + 22;
    const sw = 32;
    const sh = 54;
    const xs = [h.x0 + w * 0.2, h.x0 + w * 0.62];
    xs.forEach((x, k) => wins.push({x, y: wy, w: sw, h: sh, seed: `s4hw${i}${k}`, i: wi++}));
    const bwx = h.x0 + w * 0.45;
    b.rect(CM.paper, bwx - 2, wy + 6, 18, 24);
    b.rect(CM.glass, bwx, wy + 8, 14, 20);
    b.rect(CM.stoneShade, bwx, wy + 8, 14, 7);
    // ground floor glimpses: a kitchen window, mostly behind the extension / garden walls
    const ex0 = h.ext === 'left' ? h.x0 : h.x0 + w * 0.52;
    const ex1 = h.ext === 'left' ? h.x0 + w * 0.48 : h.x1;
    const gwx = h.ext === 'left' ? h.x0 + w * 0.66 : h.x0 + w * 0.16;
    wins.push({x: gwx, y: 800, w: 38, h: 52, seed: `s4hg${i}`, i: wi++});
    // the back extension: wall, lean-to roof sloping away from the main wall, French doors / a window, a skylight
    b.rect(h.brick === CM.brickLight ? CM.brick : CM.brickLight, ex0, h.extTop + 14, ex1 - ex0, GROUND - h.extTop - 14);
    b.poly(CM.paneUnlit, [[ex0 - 3, h.extTop + 16], [ex0 - 3, h.extTop + 6], [ex1 + 3, h.extTop - 4], [ex1 + 3, h.extTop + 16]]);
    b.rect(CM.glass, lerp(ex0, ex1, 0.35), h.extTop + 1, 18, 5);
    const fdx = lerp(ex0, ex1, 0.3);
    b.rect(CM.paper, fdx - 3, h.extTop + 28, 46, GROUND - h.extTop - 28);
    b.rect(r.chance(0.5) ? CM.glass : CM.paneUnlit, fdx, h.extTop + 31, 40, GROUND - h.extTop - 31);
    b.rect(CM.paper, fdx + 19, h.extTop + 31, 2, GROUND - h.extTop - 31);
    // drainpipe from the gutter, a soil stack on alternate houses, a flue, a satellite dish now and then
    const px = h.x1 - 8;
    b.rect(CM.anchor, px, h.eave + 4, 2.4, GROUND - h.eave - 4);
    b.rect(CM.anchor, px - 2, h.eave + 4, 6, 4);
    pipes += `M${P(px + 1.2, h.eave + 8)}L${P(px + 1.2, GROUND)}`;
    if (i % 2 === 0) b.rect(CM.shadeCool, h.x0 + w * 0.42, h.eave + 4, 5, GROUND - h.eave - 4);
    if (r.chance(0.6)) b.rect(CM.paper, h.x0 + w * 0.08, wy + 30, 8, 6);
    if (i === 1 || i === 4) b.fill(CM.paper, ovalPath(h.x0 + w * 0.88, h.eave + 16, 7, 8));
    // window box with geraniums under the first sash
    const bx = xs[0] - 3;
    b.rect(CM.line, bx, wy + sh + 6, sw + 6, 6);
    for (let k = 0; k < 4; k++) b.fill(k % 2 ? CM.sage : CM.box, ovalPath(bx + 4 + k * 8, wy + sh + 4, 3.5, 3.2));
    // ivy climbing the wall
    if (h.ivy) {
      for (let k = 0; k < 9; k++) {
        const iy = GROUND - k * 24 - r.range(0, 10);
        const ix = h.x0 + w * 0.08 + Math.sin(k * 1.3) * 10;
        b.fill(k % 3 === 2 ? CM.leafGold : CM.sage, lobes(ix - 14, ix + 16, iy, 22, `s4ivy${k}`, 3));
      }
    }
    // party-wall stack with pots (on the boundary at x0), an aerial on some
    const cx = h.x0;
    const cw = 22;
    const ctop = Math.max(ROW.top + 6, h.ridge - 16 - r.range(0, 4));
    b.rect(i % 2 ? CM.brickLight : CM.brick, cx - cw / 2, ctop, cw, h.ridge - ctop + 6);
    b.rect(CM.limestone, cx - cw / 2 - 2, ctop, cw + 4, 3.5);
    for (let p = 0; p < 3; p++) b.rect(p === 1 ? CM.leafRust : CM.brickDeep, cx - cw / 2 + 2 + p * 6.5, Math.max(ROW.top, ctop - 5), 5, 5);
    stacks += line(cx - cw / 2, ctop, cx - cw / 2, h.ridge + 4, {seed: `s4stk${i}`, over: 'small'});
    if (i !== 2) {
      const ay = Math.max(ROW.top, ctop - 18);
      aer += `M${P(cx + 4, ctop - 4)}L${P(cx + 4, ay)}M${P(cx - 6, ay + 3)}L${P(cx + 14, ay + 3)}M${P(cx - 3, ay + 7)}L${P(cx + 11, ay + 7)}`;
    }
  });
  // the outline: eaves, the ends, a few open window frames
  let st = '';
  HOUSES.forEach((h, i) => {
    st += line(h.x0 - 3, h.eave, h.x1 + 3, h.eave, {seed: `s4eave${i}`, over: 'small'});
  });
  b.ink(st, HAIR);
  b.ink(stacks, HAIR);
  b.ink(aer, 1.0, CM.ink);
  b.ink(pipes, 0.6, CM.ink);
}

/** Trees in the back gardens: a big autumn plane (house 3) and a smaller birch-like one (house 5). */
const TREES = [
  {x: 930, base: GROUND, h: 190, seed: 's4tree1'},
  {x: 1250, base: GROUND, h: 150, seed: 's4tree2'},
];

function treeInto(b: Batch, tr: {x: number; base: number; h: number; seed: string}, t: number) {
  const r = rng(tr.seed);
  const sw = Math.sin(t * 0.8 + r.next() * 6) * 1.2;
  const R = tr.h * 0.42;
  const cy = tr.base - tr.h * 0.62;
  b.fill(CM.line, `M${P(tr.x - 6, tr.base)}L${P(tr.x - 3, cy + R * 0.2)}L${P(tr.x + 3, cy + R * 0.2)}L${P(tr.x + 6, tr.base)}Z`);
  b.fill(CM.sage, lobes(tr.x - R + sw, tr.x + R + sw, cy + R * 0.75, R * 1.6, `${tr.seed}/a`, 5));
  b.fill(CM.leafGold, lobes(tr.x - R * 0.75 + sw, tr.x + R * 0.2 + sw, cy + R * 0.3, R * 1.0, `${tr.seed}/b`, 3));
  b.fill(CM.leafRust, lobes(tr.x + R * 0.05 + sw, tr.x + R * 0.85 + sw, cy + R * 0.62, R * 0.8, `${tr.seed}/c`, 3));
  b.fill(CM.coatMustard, lobes(tr.x - R * 0.3 + sw, tr.x + R * 0.35 + sw, cy - R * 0.25, R * 0.6, `${tr.seed}/d`, 2));
  b.ink(`M${P(tr.x, cy + R * 0.5)}L${P(tr.x - R * 0.35, cy - R * 0.05)}M${P(tr.x, cy + R * 0.35)}L${P(tr.x + R * 0.32, cy)}`, 1.4, CM.line);
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
    b.rect(CM.line, x - w / 2 + 1, y - 2, 2, 4);
    b.rect(CM.line, x + w / 2 - 3, y - 2, 2, 4);
  });
}

/** Pigeons on house 4's extension (its high end): bob, a shuffle now and then. */
function pigeonsInto(b: Batch, t: number) {
  const h = HOUSES[3];
  const ex0 = h.x0 + (h.x1 - h.x0) * 0.52;
  const ex1 = h.x1;
  for (let i = 0; i < 3; i++) {
    const r = rng(`s4pig/${i}`);
    const x = ex0 + 14 + i * 22 + Math.floor(frac(t / 3.4 + r.next()) * 2) * 4;
    const ey = h.extTop + 6 - (10 * (x - ex0 + 3)) / (ex1 - ex0 + 6);
    const face = r.chance(0.5) ? 1 : -1;
    const s = 11;
    const nod = Math.max(0, Math.sin(t * 2.2 + i * 2) - 0.5) * s * 0.2;
    const by = ey - s * 0.36 + (i === 1 ? -2 : 0);
    b.fill(CM.stoneShade, ovalPath(x, by, s * 0.46, s * 0.3));
    b.fill(CM.shadeCool, ovalPath(x - face * s * 0.08, by - s * 0.05, s * 0.28, s * 0.14));
    b.fill(CM.shadeCool, ovalPath(x + face * (s * 0.38 + nod * 0.4), by - s * 0.27 + nod * 0.4, s * 0.15, s * 0.15));
    b.fill(CM.shadeCool, `M${P(x - face * s * 0.36, by)}L${P(x - face * s * 0.72, by + s * 0.08)}L${P(x - face * s * 0.34, by + s * 0.16)}Z`);
  }
}

// ---------------------------------------------------------------- the plane

export const BACK_WIN_FORCE = [{i: 5, t: 16.2, on: true}];

export const BacksPlane: React.FC = () => {
  const t = useTime();
  const stat = useMemo(() => {
    const b = new Batch();
    warehouseInto(b);
    b.layer();
    const wins: BackWin[] = [];
    housesInto(b, wins);
    return {b, wins};
  }, []);
  // windows switch (a few warmly lit; one comes on mid-truck), the yard sways, the tree sheds, washing flaps
  const dyn = new Batch();
  const n = stat.wins.length;
  for (const w of stat.wins) {
    const on = litAt(t, 's4backs', w.i, n, {litFrac: 0.28, gap: [0.9, 2.2], force: BACK_WIN_FORCE});
    rearSash(dyn, w.x, w.y, w.w, w.h, on, w.seed);
  }
  dyn.layer();
  yardInto(dyn, t);
  dyn.layer();
  washingInto(dyn, t);
  for (const tr of TREES) treeInto(dyn, tr, t);
  pigeonsInto(dyn, t);
  return (
    <>
      <Paint b={stat.b} seed="s4backsSt" />
      <Paint b={dyn} seed="s4backsDyn" misreg={false} />
      <WindowPerson x={HOUSES[3].x0 + (HOUSES[3].x1 - HOUSES[3].x0) * 0.2 + 16} y={HOUSES[3].eave + 22 + 54} hb={26} seed="s4nbr" act="read" />
      <Puffs x={HOUSES[1].x0} y={HOUSES[1].ridge - 26} seed="s4smoke1" kind="smoke" scale={0.42} drift={34 * WIND} ceil={ROW.ceil} />
      <Puffs x={HOUSES[4].x0} y={HOUSES[4].ridge - 26} seed="s4smoke2" kind="smoke" scale={0.38} drift={30 * WIND} ceil={ROW.ceil} />
    </>
  );
};

export {domePath, rectInk};
