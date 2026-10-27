// V2S3_nground.tsx (lane L3, V2S3 NEAR helper; WORLD px at the 12.98 match, inside V2S3's camera): the ground of the
// bottom third, nearest the lens. The sliver of shaded water between our hull and the bank (ripples, the hull's
// broken reflection, glints that switch), OUR coping (limestone blocks with joints, a lip, two iron mooring rings: the
// boat's rope tied through one, its tail coiled on the stones), OUR towpath y 1652-2016 (slabs in a gentle perspective,
// running bond, several stone tones, cracks, grit, a drift of October leaves along the kerb, a drain grate, leaves that
// skitter in the breeze), and the near heritage lamp-post cut by the bottom-right: its fluted plinth, the column and
// the swan-neck arm leaving the frame on the right (masses only in the rail; lamps are ON but the lantern is out of
// frame). Line only where it carries form: the coping lip, the lamp, the rope; the paving joints are thin warm lines.
// Overlapping shapes sit on separate Levels (a Batch draws one fill per colour per layer).
import React, {useMemo} from 'react';
import {CM, INK_PX} from '../palette';
import {useTime} from '../../lib/time';
import {line, ellipse as ellipseInk} from '../../lib/sketch';
import {Batch, Paint, P, rng, frac, ovalPath, leafPath, lerp} from '../kit/canal/core';
import {groundShadow} from './V2S3_ndress';
import type {Pt} from '../kit/canal/core';
import {NB, boatBob, ringPath, Levels} from './V2S3_nboat';

/** Ground lines (world px). */
export const NG = {
  x0: -70,
  x1: 1170,
  waterTop: 1604,
  lip: 1631,
  copingNear: 1652,
  bottom: 2016,
  /** Vanishing point of the paving's side joints (the eye's horizon above the boat). */
  vp: [540, 1150] as Pt,
  ringRope: [252, 1641] as Pt,
  ringSpare: [858, 1641] as Pt,
  lampX: 912,
} as const;

const LEAF = [CM.leafGold, CM.leafRust, CM.coatMustard, CM.leafGold, CM.brick];

// ---------------------------------------------------------------- the static ground

function waterInto(L: Levels) {
  L.at(0).rect(CM.waterDeep, NG.x0, NG.waterTop, NG.x1 - NG.x0, NG.lip - NG.waterTop + 3);
  // the hull's broken reflection just under the waterline (slate dashes) and the plum stripe's, lower and sparser
  const b = L.at(1);
  const r = rng('s3ng/refl');
  let x = NG.x0;
  while (x < NG.x1) {
    const Lr = r.range(30, 90);
    if (r.chance(0.7)) b.poly(CM.paneUnlit, [[x, NB.water], [x + Lr, NB.water], [x + Lr - 4, NB.water + r.range(4, 7)], [x + 3, NB.water + r.range(4, 7)]]);
    x += Lr + r.range(10, 40);
  }
  x = NG.x0 + 20;
  while (x < NG.x1) {
    const Lr = r.range(16, 44);
    if (r.chance(0.5)) b.rect(CM.anchor, x, NB.water + 9, Lr, 2.2);
    x += Lr + r.range(30, 90);
  }
}

function copingInto(L: Levels) {
  const r = rng('s3ng/coping');
  const {x0, x1, lip, copingNear} = NG;
  L.at(0).rect(CM.limestone, x0, lip, x1 - x0, copingNear - lip);
  const b = L.at(1);
  b.rect(CM.paper, x0, lip + 2, x1 - x0, 3);
  b.rect(CM.stoneShade, x0, copingNear - 5, x1 - x0, 5);
  // block joints (each block 96-150 px), a few chipped corners
  let j = '';
  let x = x0 + r.range(10, 60);
  while (x < x1) {
    j += `M${P(x, lip + 1)}L${P(x + r.jitter(1.5) - 1, copingNear - 1)}`;
    if (r.chance(0.3)) b.poly(CM.stoneShade, [[x + 2, lip], [x + 12, lip], [x + 4, lip + 6]]);
    x += r.range(96, 150);
  }
  b.ink(j, INK_PX.far * 0.8, CM.line);
  // the lip toward the water (front weight, open) and the step down onto the paving (thin)
  b.ink(line(x0, lip, x1, lip, {seed: 's3ng/lip', over: 'medium', drift: 0.06, bow: 1.2}), INK_PX.front, CM.ink, 0.28);
  b.ink(line(x0, copingNear, x1, copingNear, {seed: 's3ng/kerb', over: 'small', drift: 0.06, bow: 1}), INK_PX.far, CM.ink, 0.55);
  // the mooring rings (iron, lying on the stones) with their staples
  const c = L.at(2);
  for (const [rx, ry] of [NG.ringRope, NG.ringSpare]) {
    c.rect(CM.anchor, rx - 4, ry - 9, 8, 6);
    c.fill(CM.anchor, ringPath(rx, ry, 14, 6.5, 9.5, 3.4));
  }
  c.ink(ellipseInk(NG.ringSpare[0], NG.ringSpare[1], 14, 6.5, {seed: 's3ng/ring2', wobble: 0.03}), INK_PX.hair, CM.ink, 0.2);
}

/** The towpath: rows of slabs in running bond whose side joints lean toward the VP (a gentle perspective). */
function pavingInto(L: Levels) {
  const r = rng('s3ng/paving');
  const {x0, x1, copingNear, bottom, vp} = NG;
  L.at(0).rect(CM.paving, x0, copingNear, x1 - x0, bottom - copingNear);
  const tints = L.at(1);
  const grit = L.at(2);
  // a band of granite setts along the coping (two courses of small stones, as on S2's stretch of our bank)
  const SETTS = 34;
  for (let c = 0; c < 2; c++) {
    let x = x0 - r.range(0, 20) - c * 13;
    while (x < x1) {
      const w = r.range(22, 30);
      tints.rect(r.pick([CM.stoneShade, CM.limestone, CM.coatOat, CM.stoneShade, CM.stucco]), x + 1.5, copingNear + 2 + c * 16, w - 3, 13);
      x += w;
    }
  }
  const rows: number[] = [copingNear + SETTS];
  let h = 28;
  while (rows[rows.length - 1] < bottom) {
    rows.push(rows[rows.length - 1] + h);
    h *= 1.23;
  }
  let joints = '';
  let cracks = '';
  for (let k = 0; k < rows.length - 1; k++) {
    const ya = rows[k];
    const yb = rows[k + 1];
    const ym = (ya + yb) / 2;
    const s = (ym - vp[1]) / (copingNear + 14 - vp[1]);
    const w = 124 * s;
    // the row's horizontal joint (broken; a pen line now and then)
    let xx = x0;
    while (xx < x1) {
      const Lj = r.range(80, 260);
      if (r.chance(0.78)) joints += `M${P(xx, yb + r.jitter(0.8))}L${P(xx + Lj, yb + r.jitter(1.2))}`;
      xx += Lj + r.range(6, 30);
    }
    // the slabs across the row
    let xm = x0 - r.range(0, w) + (k % 2) * w * 0.5;
    while (xm < x1 + w) {
      const xa = xm;
      const xb = xm + w * r.range(0.9, 1.1);
      const at = (xMid: number, y: number) => vp[0] + (xMid - vp[0]) * ((y - vp[1]) / (ym - vp[1]));
      if (r.chance(0.86)) joints += `M${P(at(xb, ya + 1), ya + 1)}L${P(at(xb, yb - 1), yb - 1)}`;
      // a tinted slab (inset from its joints): stone tones, never one slab of colour
      const pick = r.next();
      const tint = pick < 0.24 ? CM.stucco : pick < 0.34 ? CM.limestone : pick < 0.4 ? CM.coatOat : pick < 0.44 ? CM.stoneShade : null;
      if (tint) {
        const i = 2.5;
        tints.poly(tint, [[at(xa, ya + i) + i, ya + i], [at(xb, ya + i) - i, ya + i], [at(xb, yb - i) - i, yb - i], [at(xa, yb - i) + i, yb - i]]);
      }
      if (r.chance(0.12)) {
        const cx = lerp(xa, xb, r.range(0.2, 0.8));
        const cy = lerp(ya, yb, r.range(0.2, 0.5));
        cracks += `M${P(cx, cy)}L${P(cx + r.jitter(10), cy + (yb - ya) * 0.25)}L${P(cx + r.jitter(14), cy + (yb - ya) * 0.45)}`;
      }
      for (let g = 0; g < 2; g++) grit.fill(CM.stoneShade, ovalPath(lerp(xa, xb, r.next()), lerp(ya + 4, yb - 4, r.next()), r.range(1.2, 2.6) * s, r.range(0.8, 1.6) * s));
      xm = xb;
    }
  }
  tints.ink(joints, 2, CM.line, 0.12);
  tints.ink(cracks, 1.2, CM.line);
  // long golden-hour shadows reaching in from things out of frame at left (posts, a bollard): they run right and a
  // little toward us, away from the low sun; flat stone shade, tapering, never grey
  for (const [ya, yb, xEnd, wa, wb] of [[1700, 1716, 372, 15, 9], [1884, 1910, 286, 26, 14], [1772, 1781, 150, 11, 7]] as [number, number, number, number, number][]) {
    grit.poly(CM.stoneShade, [[x0, ya - wa / 2], [xEnd, yb - wb / 2], [xEnd + 10, yb], [xEnd, yb + wb / 2], [x0, ya + wa / 2]]);
  }
  // a puddle mirroring the evening sky: the mint, a streak of the sunset band, a leaf afloat
  const pu = {x: 812, y: 1784, w: 176};
  L.at(3).fill(CM.glass, `M${P(pu.x - pu.w / 2, pu.y)}Q${P(pu.x - pu.w * 0.25, pu.y - pu.w * 0.11)} ${P(pu.x + pu.w * 0.08, pu.y - pu.w * 0.08)}Q${P(pu.x + pu.w / 2, pu.y - pu.w * 0.07)} ${P(pu.x + pu.w * 0.46, pu.y + pu.w * 0.04)}Q${P(pu.x + pu.w * 0.1, pu.y + pu.w * 0.13)} ${P(pu.x - pu.w * 0.2, pu.y + pu.w * 0.08)}Q${P(pu.x - pu.w * 0.5, pu.y + pu.w * 0.06)} ${P(pu.x - pu.w / 2, pu.y)}Z`);
  L.at(4).poly(CM.bandSunset, [[pu.x - pu.w * 0.32, pu.y - pu.w * 0.03], [pu.x + pu.w * 0.26, pu.y - pu.w * 0.05], [pu.x + pu.w * 0.22, pu.y - pu.w * 0.01], [pu.x - pu.w * 0.28, pu.y + pu.w * 0.01]]);
  L.at(4).poly(CM.sky, [[pu.x - pu.w * 0.18, pu.y + pu.w * 0.035], [pu.x + pu.w * 0.3, pu.y + pu.w * 0.02], [pu.x + pu.w * 0.26, pu.y + pu.w * 0.05], [pu.x - pu.w * 0.14, pu.y + pu.w * 0.06]]);
  L.at(5).fill(CM.leafRust, leafPath(pu.x + 34, pu.y + 2, 22, 7.5, 24));
  // the drain grate (perspective trapezoid, iron frame, slots)
  const dg = {x: 404, y: 1774, w: 92, h: 30};
  L.at(3).poly(CM.paneUnlit, [[dg.x - dg.w / 2 - 6, dg.y - 4], [dg.x + dg.w / 2 + 6, dg.y - 4], [dg.x + dg.w / 2 + 9, dg.y + dg.h + 4], [dg.x - dg.w / 2 - 9, dg.y + dg.h + 4]]);
  const gr = L.at(4);
  gr.poly(CM.stoneShade, [[dg.x - dg.w / 2, dg.y], [dg.x + dg.w / 2, dg.y], [dg.x + dg.w / 2 + 3, dg.y + dg.h], [dg.x - dg.w / 2 - 3, dg.y + dg.h]]);
  let slots = '';
  for (let k = 1; k < 8; k++) {
    const u = k / 8;
    slots += `M${P(lerp(dg.x - dg.w / 2, dg.x + dg.w / 2, u), dg.y + 4)}L${P(lerp(dg.x - dg.w / 2 - 3, dg.x + dg.w / 2 + 3, u), dg.y + dg.h - 4)}`;
  }
  gr.ink(slots, 3, CM.shadeCool);
  gr.ink(line(dg.x - dg.w / 2 - 6, dg.y - 4, dg.x + dg.w / 2 + 6, dg.y - 4, {seed: 's3ng/drain', over: 'small', drift: 0.1}), INK_PX.far, CM.ink, 0.3);
  // a drift of leaves along the kerb, and leaves scattered over the slabs (bigger toward us)
  const lv = L.at(5);
  for (let i = 0; i < 26; i++) {
    const lx = r.range(x0, x1);
    const ly = NG.copingNear + 3 + r.range(0, 12);
    lv.fill(LEAF[i % LEAF.length], leafPath(lx, ly, r.range(11, 16), r.range(3.4, 5), r.range(-40, 40)));
  }
  let stems = '';
  for (let i = 0; i < 30; i++) {
    const ly = r.range(NG.copingNear + 20, bottom - 30);
    const s = lerp(13, 26, (ly - NG.copingNear) / (bottom - NG.copingNear));
    const lx = r.range(x0, x1);
    const a = r.range(0, 180);
    lv.fill(LEAF[(i + 2) % LEAF.length], leafPath(lx, ly, s, s * 0.34, a));
    if (s > 18) {
      const ar = (a * Math.PI) / 180;
      stems += `M${P(lx - Math.cos(ar) * s * 0.45, ly - Math.sin(ar) * s * 0.45)}L${P(lx + Math.cos(ar) * s * 0.62, ly + Math.sin(ar) * s * 0.62)}`;
    }
  }
  lv.ink(stems, 1.2, CM.line);
}

/** The near heritage lamp-post: fluted plinth cut by the bottom, the column, a brass band, the swan-neck arm
 *  leaving the frame on the right (the lantern hangs out of frame). */
function lampInto(L: Levels) {
  const x = NG.lampX;
  const top = 1222;
  const col = CM.anchor;
  // its long shadow on the paving (to the right, away from the low sun)
  groundShadow(L.at(0), x - 30, x + 30, 1930, 190, 30);
  const b = L.at(1);
  // plinth: base block, a moulding, the fluted drum, a collar
  b.poly(col, [[x - 44, 2030], [x + 44, 2030], [x + 40, 1952], [x - 40, 1952]]);
  b.poly(col, [[x - 37, 1952], [x + 37, 1952], [x + 31, 1926], [x - 31, 1926]]);
  b.rect(col, x - 26, 1872, 52, 56);
  b.poly(col, [[x - 31, 1880], [x + 31, 1880], [x + 27, 1866], [x - 27, 1866]]);
  // the column (tapering) up to the collar and the swan neck
  b.poly(col, [[x - 13, 1868], [x + 13, 1868], [x + 10.5, top], [x - 10.5, top]]);
  b.poly(col, [[x - 17, top + 16], [x + 17, top + 16], [x + 14, top - 8], [x - 14, top - 8]]);
  b.fill(col, `M${P(x - 9, top - 6)}Q${P(x - 12, top - 70)} ${P(x + 60, top - 92)}Q${P(x + 150, top - 112)} ${P(1200, top - 140)}L${P(1200, top - 122)}Q${P(x + 150, top - 94)} ${P(x + 62, top - 74)}Q${P(x + 8, top - 58)} ${P(x + 9, top - 6)}Z`);
  b.fill(col, `M${P(x + 8, top - 30)}Q${P(x + 40, top - 34)} ${P(x + 52, top - 62)}L${P(x + 46, top - 64)}Q${P(x + 36, top - 42)} ${P(x + 8, top - 40)}Z`);
  // brass bands, flutes, the shade side (warm), the lit edge (the low sun from the left)
  const c = L.at(2);
  c.rect(CM.coatMustard, x - 12.5, 1592, 25, 8);
  c.rect(CM.coatMustard, x - 16, top + 4, 32, 5);
  c.rect(CM.shadeWarm, x + 4, top + 18, 7, 1866 - top - 18);
  c.rect(CM.shadeWarm, x + 10, 1878, 12, 46);
  c.rect(CM.shadeWarm, x + 20, 1956, 20, 70);
  for (const fx of [-14, -4, 6]) c.rect(CM.coatPlum, x + fx, 1882, 3.2, 40);
  c.rect(CM.coatPlum, x - 9, top + 20, 3, 1866 - top - 24);
  // ink: the column's lit edge and the plinth's top edges (front weight, loose), the arm's upper edge
  c.ink(line(x - 13, 1868, x - 10.5, top, {seed: 's3ng/lampL', over: 'small', drift: 0.05, bow: 0.8}) + line(x - 44, 1952, x + 44, 1952, {seed: 's3ng/plinthT', over: 'small', drift: 0.1}) + line(x - 31, 1880, x + 31, 1880, {seed: 's3ng/plinth2', over: 'small', drift: 0.1}), INK_PX.front, CM.ink, 0.2);
  c.ink(`M${P(x - 9, top - 6)}Q${P(x - 12, top - 70)} ${P(x + 60, top - 92)}Q${P(x + 150, top - 112)} ${P(1200, top - 140)}`, INK_PX.mid, CM.ink, 0.25);
}

// ---------------------------------------------------------------- life

/** Water sliver life: ripples drifting with the current, glints switching on their own clocks. */
function waterLifeInto(b: Batch, t: number) {
  const r = rng('s3ng/wl');
  const span = NG.x1 - NG.x0;
  for (let i = 0; i < 14; i++) {
    const yy = r.range(NB.water + 4, NG.lip - 3);
    const w = r.range(26, 64);
    const x = NG.x0 + frac((r.range(0, span) - 14 * t) / span) * span;
    b.fill(CM.water, `M${P(x - w / 2, yy)}Q${P(x, yy - 2.4)} ${P(x + w / 2, yy)}Q${P(x, yy + 2.4)} ${P(x - w / 2, yy)}Z`);
  }
  b.layer();
  for (let i = 0; i < 9; i++) {
    const yy = r.range(NB.water + 5, NG.lip - 4);
    const per = r.range(1.1, 2.4);
    const on = frac(t / per + r.next()) < 0.4;
    const x = r.range(NG.x0 + 30, NG.x1 - 30) + Math.sin(t * 0.9 + i) * 5;
    if (on) b.fill(CM.paper, `M${P(x - 10, yy)}L${P(x + 10, yy - 1)}L${P(x + 8, yy + 2.2)}L${P(x - 8, yy + 2.2)}Z`);
  }
}

/** The boat's rope: from the dolly on the gunwale (it rises and falls with the boat) down across the water to the
 *  ring on our coping, a knot through the ring and the tail coiled on the stones. */
function ropeInto(L: Levels, t: number) {
  const dy = boatBob(t);
  const a: Pt = [NB.dolly[0], NB.dolly[1] + dy];
  const c: Pt = NG.ringRope;
  const sag = 16 - dy * 2;
  const mid: Pt = [(a[0] + c[0]) / 2 + 6, (a[1] + c[1]) / 2 + sag];
  const pts: Pt[] = [];
  for (let k = 0; k <= 16; k++) {
    const u = k / 16;
    pts.push([(1 - u) * (1 - u) * a[0] + 2 * (1 - u) * u * mid[0] + u * u * c[0], (1 - u) * (1 - u) * a[1] + 2 * (1 - u) * u * mid[1] + u * u * c[1]]);
  }
  const b0 = L.at(0);
  // the dolly (a short iron post on the gunwale)
  b0.rect(CM.anchor, a[0] - 6, a[1] - 14, 12, 16);
  b0.fill(CM.anchor, ovalPath(a[0], a[1] - 14, 9, 4));
  // the tail on the stones (a loose flat coil by the ring), under the rope's last turn
  b0.fill(CM.coatOat, `M${P(c[0] + 10, c[1] + 2)}Q${P(c[0] + 40, c[1] + 10)} ${P(c[0] + 58, c[1] + 2)}L${P(c[0] + 58, c[1] + 9)}Q${P(c[0] + 40, c[1] + 17)} ${P(c[0] + 10, c[1] + 9)}Z`);
  b0.fill(CM.coatOat, ovalPath(c[0] + 76, c[1] + 4, 22, 7));
  const b1 = L.at(1);
  b1.fill(CM.line, ovalPath(c[0] + 76, c[1] + 3, 9, 2.6));
  b1.ink(ellipseInk(c[0] + 76, c[1] + 4, 22, 7, {seed: 's3ng/tail', wobble: 0.04, overlap: 40}) + ellipseInk(c[0] + 76, c[1] + 4, 15, 4.6, {seed: 's3ng/tail2', wobble: 0.04}), INK_PX.hair, CM.line);
  // the rope as a ribbon (cream) with twist ticks, the knot through the ring
  const rib: Pt[] = [];
  const back: Pt[] = [];
  for (let k = 0; k < pts.length; k++) {
    const p0 = pts[Math.max(0, k - 1)];
    const p1 = pts[Math.min(pts.length - 1, k + 1)];
    const dx = p1[0] - p0[0];
    const dyy = p1[1] - p0[1];
    const m = Math.hypot(dx, dyy) || 1;
    const nx = -dyy / m;
    const ny = dx / m;
    rib.push([pts[k][0] + nx * 4.4, pts[k][1] + ny * 4.4]);
    back.unshift([pts[k][0] - nx * 4.4, pts[k][1] - ny * 4.4]);
  }
  const b2 = L.at(2);
  b2.poly(CM.coatOat, [...rib, ...back]);
  b2.fill(CM.coatOat, ovalPath(c[0] + 4, c[1] - 1, 11, 6));
  let tw = '';
  for (let k = 1; k < pts.length - 1; k++) {
    const [px, py] = pts[k];
    tw += `M${P(px - 3, py - 3)}L${P(px + 3, py + 3)}`;
  }
  b2.ink(tw, 1.4, CM.line);
  b2.ink(rib.map(([x, y], i) => `${i ? 'L' : 'M'}${P(x, y)}`).join(''), INK_PX.hair, CM.ink, 0.3);
  b2.ink(ellipseInk(c[0], c[1], 14, 6.5, {seed: 's3ng/ring1', wobble: 0.03}), INK_PX.hair, CM.ink, 0.15);
}

/** Leaves that skitter across the slabs in little gusts (a few px, then rest). */
function skitterInto(b: Batch, t: number) {
  const leaves: [number, number, number, string, number][] = [
    [140, 1700, 18, CM.leafRust, 0],
    [470, 1760, 22, CM.leafGold, 0.9],
    [770, 1690, 16, CM.coatMustard, 0.45],
    [330, 1880, 26, CM.leafGold, 1.3],
  ];
  for (const [i, [x0, y0, s, c, ph]] of leaves.entries()) {
    // gusts every ~1.1 s: each moves the leaf ~16 px right (the breeze) and flips it a little
    const g = t / 1.1 + ph;
    const n = Math.floor(g);
    const u = frac(g);
    const k = u < 0.35 ? 0.5 - 0.5 * Math.cos((u / 0.35) * Math.PI) : 1;
    const travel = (n + k) * 16;
    const x = x0 + (travel % 260) - 40;
    const lift = u < 0.35 ? Math.sin((u / 0.35) * Math.PI) * 3 : 0;
    const ang = 20 + i * 47 + (n + k) * 38;
    b.fill(c, leafPath(x, y0 - lift, s, s * 0.34, ang));
  }
}

// ---------------------------------------------------------------- components

/** The water sliver (behind the hull's bottom edge): draw BEFORE the boat. */
export const S3NearWater: React.FC = () => {
  const t = useTime();
  const stat = useMemo(() => {
    const L = new Levels();
    waterInto(L);
    return L.merge();
  }, []);
  const life = new Batch();
  waterLifeInto(life, t);
  return (
    <>
      <Paint b={stat} seed="s3ngWater" misreg={false} />
      <Paint b={life} seed="s3ngWaterLife" misreg={false} />
    </>
  );
};

/** The coping, the towpath and the rope (AFTER the boat). */
export const S3Ground: React.FC = () => {
  const t = useTime();
  const stat = useMemo(() => {
    const L = new Levels();
    copingInto(L);
    const b = L.merge();
    const L2 = new Levels();
    pavingInto(L2);
    b.add(L2.merge());
    return b;
  }, []);
  const life = new Batch();
  skitterInto(life, t);
  const rope = new Levels();
  ropeInto(rope, t);
  return (
    <>
      <Paint b={stat} seed="s3ngGround" />
      <Paint b={life} seed="s3ngGroundLife" />
      <Paint b={rope.merge()} seed="s3ngRope" />
    </>
  );
};

/** The near lamp-post (nearest of all, after the head-backs). */
export const S3LampFoot: React.FC = () => {
  const stat = useMemo(() => {
    const L = new Levels();
    lampInto(L);
    return L.merge();
  }, []);
  return <Paint b={stat} seed="s3ngLamp" />;
};
