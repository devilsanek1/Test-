// canal/wing.tsx: Google's CANAL WING seen from the front (TREATMENT §2 A, §4; map.ts S1_SHEET, S7).
// Light brick, slim limestone fins on brick piers, tall glass, TWO storeys under a planted roof terrace (the planting
// peeks over the coping, never above y 575; the coping never above y 600), a stone band between the storeys, a stone
// plinth, glass double doors under a canopy whose fascia is hand-lettered "Google" in ink (no logo, no logo colours).
// Window states: lit (lamp-warm interior, 40-70 % of the pane), unlit (slate interior + a sky reflection), switching on
// a seeded clock (one pane somewhere every 0.6-1.5 s), dark (plum: her window after its lamp clicks off), and her W.
// Drawn flat in metres on the facade plane and mapped onto its screen quad (a homography), so S1's slight 3/4 is true
// and every map target (door, canopy, W) lands where the contract puts it.
//
//   <WingS1 lampOffAt={0.40} doorKeys={...} lettersAt={0.97} behindDoor={<Her .../>} />     S1, frontal and close
//   <WingS7 />                                                                             S7, the forecourt view
// Both are made from <WingFront> with a layout; the receding S2 wall is wall.tsx.

import React, {useMemo} from 'react';
import {CM, INK_PX} from '../../palette';
import {useTime} from '../../../lib/time';
import {poly, line, wallTicks} from '../../../lib/sketch';
import {Batch, Paint, PlaneMap, P, Pt, Quad, rng, rand, ovalPath, lobes, lerp, clamp01, leafPath} from './core';
import {litAt} from './life';
import {HandLetteredGoogle} from './lettering';
import * as MAP from '../../world/map';
import {tiered, TierPart, Slot} from '../tiers';
import type {TierName} from '../tiers';

// ---------------------------------------------------------------- layout

export type Bay = {u0: number; u1: number; split?: number};
export type WingLayout = {
  /** The facade plane: local metres (u east from the west corner, v DOWN from the coping top) onto a screen quad. */
  quad: Quad;
  wM: number;
  hM: number;
  /** v of the first floor level (the ground storey's top) and of the plinth top. */
  floorV: number;
  plinthV: number;
  /** Coping band depth and the stone band between storeys (metres). */
  copingM: number;
  bandM: number;
  /** West corner pier width (metres; 0 = the facade runs off the left edge). */
  cornerM: number;
  /** First-storey window bays (u ranges) and ground-storey glazing bays. */
  upper: Bay[];
  lower: Bay[];
  /** Her window W (first storey): a screen spot (exact), or null. */
  w?: MAP.Spot | null;
  /** The glass double door (screen rect) and the canopy fascia (screen rect). */
  door: MAP.Rect;
  fascia: MAP.Rect;
  /** Letter cap height on the fascia. */
  letterPx: number;
  /** Fins (u centres) in front of the piers. */
  fins: number[];
  /** Ink weight of the structure. */
  ink: number;
  seed: string;
};

/** S1: the wing frontal and close, slightly 3/4 (right bays nearest), x 330 -> past the right edge (map S1_SHEET). */
export function s1Layout(): WingLayout {
  // the S1 lens (map S1_LENS): the coping falls 600 (x 1080) -> 640 (x 330); the base 1090 -> 1076.5: both meet on the
  // horizon y 965 far to the left, so the facade recedes leftward exactly as the scale sheet says.
  const topY = (x: number) => 600 + (40 / 750) * (1080 - x);
  const baseY = (x: number) => 1090.2 - (13.7 / 750) * (1080 - x);
  const x0 = 330;
  const x1 = 1104;
  const quad: Quad = [
    [x0, topY(x0)],
    [x1, topY(x1)],
    [x1, baseY(x1)],
    [x0, baseY(x0)],
  ];
  const hM = 5.09;
  const pm0 = new PlaneMap(8.5, hM, quad);
  const u = (x: number) => pm0.uAt(x, hM * 0.6);
  const S = MAP.S1_SHEET;
  const W = S.w;
  const wl = u(W.x - W.w / 2);
  const wr = u(W.x + W.w / 2);
  const pitch = wr - wl + 0.28;
  const upper: Bay[] = [
    {u0: 0.62, u1: wl - 2 * pitch - 0.28 > 0.9 ? wl - 2 * pitch - 0.28 : 1.0},
    {u0: wl - 2 * pitch, u1: wl - pitch - 0.28, split: 0.5},
    {u0: wl - pitch, u1: wl - 0.28, split: 0.5},
    {u0: wr + 0.28, u1: wr + 0.28 + (wr - wl), split: 0.5},
  ];
  const dl = u(S.door.x0);
  const dr = u(S.door.x1);
  const lower: Bay[] = [
    {u0: 0.5, u1: dl - 0.36, split: 0.5},
    {u0: dr + 0.3, u1: wl - 0.28 + 0.0},
    {u0: wl, u1: wr, split: 0.5},
    {u0: wr + 0.28, u1: wr + 0.28 + (wr - wl), split: 0.5},
  ];
  const fins = [0.45, wl - 2 * pitch - 0.14, wl - pitch - 0.14, wl - 0.14, wr + 0.14];
  return {quad, wM: 8.5, hM, floorV: hM - 3.2, plinthV: hM - 0.3, copingM: 0.16, bandM: 0.14, cornerM: 0.45, upper, lower, w: W, door: S.door, fascia: S.canopyFascia, letterPx: S.canopyLetterPx, fins, ink: INK_PX.mid, seed: 'wingS1'};
}

/** S7: the wing at human size from its west-end forecourt, frontal (~72 px/m), the canopy right of board B. */
export function s7Layout(): WingLayout {
  const F = MAP.S7.canopyGoogle; // x 660-900, y 760-810
  const pxm = 72;
  const base = 1012;
  const top = 606;
  const x0 = 352;
  const x1 = 1110;
  const quad: Quad = [
    [x0, top],
    [x1, top],
    [x1, base],
    [x0, base],
  ];
  const wM = (x1 - x0) / pxm;
  const hM = (base - top) / pxm;
  const u = (x: number) => (x - x0) / pxm;
  const door: MAP.Rect = {x0: F.x0 + 34, y0: F.y1 + 6, x1: F.x1 - 34, y1: base - 0.3 * pxm};
  const upper: Bay[] = [];
  for (let k = 0; k < 6; k++) upper.push({u0: 0.7 + k * 1.75, u1: 0.7 + k * 1.75 + 1.4, split: k % 2 ? 0.5 : undefined});
  const lower: Bay[] = [
    {u0: 0.6, u1: u(F.x0) - 0.3, split: 0.5},
    {u0: u(F.x1) + 0.3, u1: wM + 0.2, split: 0.5},
  ];
  const fins = upper.map((b) => b.u0 - 0.17);
  // the ground storey's top sits just above the canopy fascia (map S7: fascia y 760-810)
  const floorV = (F.y0 - 6 - top) / pxm;
  for (const bay of upper) bay.u1 = Math.min(bay.u1, wM);
  return {quad, wM, hM, floorV, plinthV: hM - 0.3, copingM: 0.16, bandM: 0.14, cornerM: 0.5, upper, lower, w: null, door, fascia: F, letterPx: 40, fins, ink: INK_PX.mid, seed: 'wingS7'};
}

// ---------------------------------------------------------------- pane drawing (local metres on the plane)

export type PaneState = 'lit' | 'unlit' | 'dark' | 'cool';

/** One pane's interior: a lit pane is warm for 40-70 % of its area (a pendant, a plant, a shelf), an unlit one slate
 *  with a sky reflection, a dark one plum (with one reflection streak so it still reads as glass). */
export function paneInto(b: Batch, pm: PlaneMap, u0: number, v0: number, w: number, h: number, state: PaneState, seed: string) {
  const r = rng(seed);
  const q = (a: number, c: number, ww: number, hh: number) => pm.q(u0 + a * w, v0 + c * h, ww * w, hh * h);
  if (state === 'dark') {
    b.poly(CM.anchor, q(0, 0, 1, 1));
    b.poly(CM.paneUnlit, [pm.p(u0 + w * 0.08, v0 + h * 0.05), pm.p(u0 + w * 0.3, v0 + h * 0.05), pm.p(u0 + w * 0.08, v0 + h * 0.3)]);
    return;
  }
  if (state === 'cool') {
    b.poly(CM.paper, q(0, 0, 1, 1));
    b.poly(CM.glass, q(0, 0.82, 1, 0.18));
    return;
  }
  if (state === 'unlit') {
    // golden hour: an unlit pane mostly mirrors the bright sky; the room shows as a slate band low in the glass
    b.poly(CM.glass, q(0, 0, 1, 1));
    const lo = r.range(0.5, 0.68);
    b.poly(CM.shadeCool, [pm.p(u0, v0 + h * lo), pm.p(u0 + w, v0 + h * (lo - r.range(0.12, 0.3))), pm.p(u0 + w, v0 + h), pm.p(u0, v0 + h)]);
    b.poly(CM.paneUnlit, q(0, 0.86, 1, 0.14));
    b.poly(CM.skyHigh, [pm.p(u0 + w * 0.15, v0), pm.p(u0 + w * 0.42, v0), pm.p(u0 + w * 0.05, v0 + h * 0.4), pm.p(u0, v0 + h * 0.4), pm.p(u0, v0 + h * 0.22)]);
    return;
  }
  // lit: warm interior with a few things in it
  b.poly(CM.lamp, q(0, 0, 1, 1));
  b.poly(CM.lampCore, q(0.1, 0.12, 0.8, 0.5));
  const kind = r.int(0, 3);
  if (kind === 0) {
    // a pendant lamp + a desk edge
    b.poly(CM.line, q(0.48, 0, 0.02, 0.22));
    b.fill(CM.anchor, `M${P(...pm.p(u0 + w * 0.36, v0 + h * 0.3))}L${P(...pm.p(u0 + w * 0.64, v0 + h * 0.3))}L${P(...pm.p(u0 + w * 0.56, v0 + h * 0.22))}L${P(...pm.p(u0 + w * 0.44, v0 + h * 0.22))}Z`);
    b.poly(CM.brickLight, q(0, 0.74, 1, 0.08));
  } else if (kind === 1) {
    // a shelf of books + a plant
    b.poly(CM.line, q(0.05, 0.42, 0.9, 0.04));
    for (let k = 0; k < 6; k++) b.poly(r.pick([CM.brick, CM.sage, CM.coatMustard, CM.paneUnlit, CM.box]), q(0.08 + k * 0.12, 0.3, 0.08, 0.12));
    const [cx, cy] = pm.p(u0 + w * 0.75, v0 + h * 0.86);
    const s = pm.pxPerM(u0) * w * 0.18;
    b.fill(CM.sage, lobes(cx - s, cx + s, cy, s * 1.6, `${seed}/pl`, 3));
  } else if (kind === 2) {
    // a big plant against the glass
    const [cx, cy] = pm.p(u0 + w * 0.3, v0 + h);
    const s = pm.pxPerM(u0) * w * 0.3;
    b.fill(CM.sage, lobes(cx - s, cx + s, cy, s * 2.2, `${seed}/bp`, 4));
    b.poly(CM.brickDeep, q(0.18, 0.86, 0.24, 0.14));
  } else {
    // a blind half down
    b.poly(CM.coatOat, q(0, 0, 1, r.range(0.3, 0.5)));
    for (let k = 1; k < 4; k++) b.poly(CM.stucco, q(0, k * 0.1, 1, 0.012));
  }
  // the glass catches the sky at one corner
  b.poly(CM.glass, [pm.p(u0 + w, v0), pm.p(u0 + w, v0 + h * 0.18), pm.p(u0 + w * 0.82, v0)]);
}

// ---------------------------------------------------------------- the front

export type WingFrontProps = {
  layout: WingLayout;
  /** Her window W: lamp-lit until this time, then plum dark (S1 0.40). Omit = lit throughout; `wDark` = dark always. */
  lampOffAt?: number;
  wDark?: boolean;
  /** The glass doors: [t, open 0..1] keys (linear between). Default: shut. */
  doorKeys?: [number, number][];
  /** Canopy letters pop one by one from this time (S1 0.97). Omit = already there. */
  lettersAt?: number;
  /** Panes switching: share lit and the seed (default 0.55). 'sunset' rows light more. */
  litFrac?: number;
  /** Force pane states from a time: {i, t, on}. Pane indices: upper bays first (left to right, split panes count 2). */
  force?: {i: number; t: number; on: boolean}[];
  /** Drawn between the lobby interior and the door glass (her figure behind the door at f0). */
  behindDoor?: React.ReactNode;
  /** Build: the whole front draws on from this time (ink), fills pop (lanes' t < 0 states use Look instead). */
  at?: number;
  /** Tier of her window W (the clean pen): default 'support' (the story's window off its beat) inside the environment
   *  wing; 'subject' on the beats it carries (S1's lamp going off). */
  wTier?: TierName;
};

/** The canal wing's front. Static parts in one memoised batch; panes, W, the doors and the letters per frame. */
const WingFrontBody: React.FC<WingFrontProps> = ({layout: L, lampOffAt, wDark = false, doorKeys = [], lettersAt, litFrac = 0.55, force, behindDoor, at, wTier}) => {
  const t = useTime();
  const pm = useMemo(() => new PlaneMap(L.wM, L.hM, L.quad), [L]);
  const uAt = (x: number) => pm.uAt(x, L.hM * 0.6);
  // ---- static: brick, stone, planting, frames, canopy slab
  const stat = useMemo(() => {
    const b = new Batch();
    const r = rng(L.seed);
    // roof-terrace planting peeking over the coping (never above y 575): grasses with seed heads, shrubs, small trees
    let u = 0.15;
    let i = 0;
    let blades = '';
    while (u < L.wM) {
      const [x, y] = pm.p(u, 0.03);
      const s = pm.pxPerM(u);
      const room = y - 576;
      const kind = r.int(0, 3);
      const wdt = s * r.range(0.35, 0.8);
      const hgt = Math.min(room, s * (kind === 3 ? r.range(0.32, 0.42) : r.range(0.16, 0.3)));
      if (hgt > 4) {
        const col = [CM.sage, CM.leafGold, CM.sage, CM.leafRust][(i + kind) % 4];
        b.fill(col, lobes(x - wdt / 2, x + wdt / 2, y + 2, hgt, `${L.seed}/plant${i}`, kind === 3 ? 3 : 2));
        if (kind === 1) for (let k = 0; k < 4; k++) blades += `M${P(x - wdt * 0.3 + k * wdt * 0.2, y)}l${(r.jitter(4)).toFixed(1)} ${(-Math.min(room, hgt * 1.3)).toFixed(1)}`;
      }
      u += r.range(0.35, 0.75);
      i++;
    }
    b.ink(blades, INK_PX.hair, CM.line, 0, {thing: true});
    b.layer();
    // the brick wall (whole plane)
    b.poly(CM.brickLight, pm.q(0, 0, L.wM, L.hM));
    // brick ticks: sparse coursing marks on the piers
    b.layer();
    // the coping, the band between storeys, the plinth
    b.poly(CM.limestone, pm.q(0, 0, L.wM, L.copingM));
    b.poly(CM.stoneShade, pm.q(0, L.copingM - 0.04, L.wM, 0.04));
    b.poly(CM.limestone, pm.q(0, L.floorV - L.bandM, L.wM, L.bandM + 0.04));
    b.poly(CM.limestone, pm.q(0, L.plinthV, L.wM, L.hM - L.plinthV));
    b.poly(CM.stoneShade, pm.q(0, L.plinthV, L.wM, 0.05));
    // the west corner pier
    if (L.cornerM > 0) {
      b.poly(CM.limestone, pm.q(0, 0, L.cornerM, L.hM));
      b.poly(CM.stoneShade, pm.q(L.cornerM - 0.08, 0, 0.08, L.hM));
    }
    // window reveals (a shade strip on the left + a sill) for every bay
    for (const bay of L.upper) {
      b.poly(CM.stoneShade, pm.q(bay.u0 - 0.05, L.copingM + 0.08, 0.07, L.floorV - L.bandM - L.copingM - 0.06));
      b.poly(CM.limestone, pm.q(bay.u0 - 0.1, L.floorV - L.bandM - 0.06, bay.u1 - bay.u0 + 0.2, 0.08));
    }
    for (const bay of L.lower) b.poly(CM.stoneShade, pm.q(bay.u0 - 0.05, L.floorV + 0.1, 0.07, L.plinthV - L.floorV - 0.1));
    // the door bay reveal
    const du0 = uAt(L.door.x0);
    const du1 = uAt(L.door.x1);
    b.poly(CM.stoneShade, pm.q(du0 - 0.3, L.floorV + 0.1, 0.08, L.hM - L.floorV - 0.1));
    // fins: slim limestone with a shadow strip to the right (the low sun is west = screen left)
    b.layer();
    for (const u of L.fins) {
      b.poly(CM.limestone, pm.q(u - 0.06, L.copingM, 0.12, L.plinthV - L.copingM));
      b.poly(CM.stoneShade, pm.q(u + 0.06, L.copingM + 0.05, 0.06, L.plinthV - L.copingM - 0.05));
    }
    // brick ticks on the piers (in screen space, sparse)
    let ticks = '';
    for (const u of L.fins) {
      const [x, y0] = pm.p(u - 0.2, L.copingM + 0.3);
      const [, y1] = pm.p(u - 0.2, L.floorV - 0.3);
      ticks += wallTicks(x - 12, y0, 22, y1 - y0, {seed: `${L.seed}/t${u.toFixed(2)}`, n: 3, size: 10});
    }
    b.ink(ticks, INK_PX.hair, CM.brickDeep);
    // a downpipe at the west end, a wall lamp beside the door, a bike stand, two clipped bay planters at the door
    b.layer();
    const [dpx] = pm.p(L.cornerM + 0.12, 0);
    const [, dpy0] = pm.p(L.cornerM + 0.12, L.copingM);
    const [, dpy1] = pm.p(L.cornerM + 0.12, L.hM);
    b.fill(CM.shadeCool, `M${P(dpx - 3, dpy0)}L${P(dpx + 3, dpy0)}L${P(dpx + 3, dpy1)}L${P(dpx - 3, dpy1)}Z`);
    for (const side of [-1, 1]) {
      const ux = side < 0 ? du0 - 0.55 : du1 + 0.55;
      const [px, py] = pm.p(ux, L.hM);
      const s = pm.pxPerM(ux);
      b.poly(CM.paneUnlit, [[px - s * 0.28, py - s * 0.55], [px + s * 0.28, py - s * 0.55], [px + s * 0.24, py], [px - s * 0.24, py]]);
      b.fill(CM.sage, ovalPath(px, py - s * 0.85, s * 0.34, s * 0.34));
      b.fill(CM.sage, lobes(px - s * 0.3, px + s * 0.3, py - s * 0.62, s * 0.3, `${L.seed}/bay${side}`, 2));
    }
    // the canopy slab (projecting): a soffit shadow under the fascia
    const F = L.fascia;
    b.layer();
    b.rect(CM.shadeWarm, F.x0 - 8, F.y1, F.x1 - F.x0 + 16, 8);
    b.rect(CM.paper, F.x0, F.y0, F.x1 - F.x0, F.y1 - F.y0);
    b.rect(CM.limestone, F.x0 - 10, F.y0 - 6, F.x1 - F.x0 + 20, 7);
    // window frames (slim metal) and mullions
    b.layer();
    const frameCol = CM.shadeCool;
    const allBays: [Bay, number, number][] = [
      ...L.upper.map((bay) => [bay, L.copingM + 0.1, L.floorV - L.bandM - 0.06] as [Bay, number, number]),
      ...L.lower.map((bay) => [bay, L.floorV + 0.12, L.plinthV] as [Bay, number, number]),
    ];
    let frames = '';
    for (const [bay, va, vb] of allBays) {
      const q = pm.q(bay.u0, va, bay.u1 - bay.u0, vb - va);
      frames += poly(q, {closed: true, over: 'small', seed: `${L.seed}/fr${bay.u0.toFixed(2)}${va.toFixed(1)}`});
      if (bay.split) {
        const um = bay.u0 + (bay.u1 - bay.u0) * bay.split;
        b.poly(frameCol, pm.q(um - 0.025, va, 0.05, vb - va));
      }
      // a transom near the top
      b.poly(frameCol, pm.q(bay.u0, va + (vb - va) * 0.16, bay.u1 - bay.u0, 0.035));
    }
    b.ink(frames, INK_PX.far);
    // structure ink: coping line, band, plinth, corner, fins (loose, open, overshooting)
    const [cx0, cy0] = pm.p(0, 0);
    const [cx1, cy1] = pm.p(L.wM, 0);
    const [bx0, by0] = pm.p(0, L.floorV - L.bandM);
    const [bx1, by1] = pm.p(L.wM, L.floorV - L.bandM);
    const [px0, py0] = pm.p(0, L.plinthV);
    const [px1, py1] = pm.p(L.wM, L.plinthV);
    let st = line(cx0, cy0, cx1, cy1, {seed: `${L.seed}/cop`, over: [30, 8], drift: 0.1}) + line(bx0, by0, bx1, by1, {seed: `${L.seed}/band`, over: 'medium'}) + line(px0, py0, px1, py1, {seed: `${L.seed}/pl`, over: 'medium'});
    if (L.cornerM > 0) {
      const [kx, ky0] = pm.p(0, 0);
      const [, ky1] = pm.p(0, L.hM);
      st += line(kx, ky0, kx, ky1, {seed: `${L.seed}/corner`, over: [4, 26]});
    }
    for (const u of L.fins) {
      const [fx, fy0] = pm.p(u - 0.06, L.copingM);
      const [, fy1] = pm.p(u - 0.06, L.plinthV);
      if (r.chance(0.7)) st += line(fx, fy0, fx, fy1, {seed: `${L.seed}/fin${u.toFixed(2)}`, over: 'small'});
    }
    st += poly([[F.x0 - 10, F.y0 - 6], [F.x1 + 10, F.y0 - 6], [F.x1 + 10, F.y1], [F.x0 - 10, F.y1]], {closed: true, over: 'small', seed: `${L.seed}/canopy`});
    b.ink(st, L.ink);
    return b;
  }, [L, pm]);

  // ---- per frame: panes, W, the lobby + doors
  const dyn = new Batch();
  let k = 0;
  const panes: [number, number, number, number][] = [];
  for (const bay of L.upper) {
    const va = L.copingM + 0.1;
    const vb = L.floorV - L.bandM - 0.06;
    const parts = bay.split ? [[bay.u0, bay.u0 + (bay.u1 - bay.u0) * bay.split], [bay.u0 + (bay.u1 - bay.u0) * bay.split, bay.u1]] : [[bay.u0, bay.u1]];
    for (const [a, c] of parts) panes.push([a, va, c - a, vb - va]);
  }
  for (const bay of L.lower) {
    const va = L.floorV + 0.12;
    const vb = L.plinthV;
    const parts = bay.split ? [[bay.u0, bay.u0 + (bay.u1 - bay.u0) * bay.split], [bay.u0 + (bay.u1 - bay.u0) * bay.split, bay.u1]] : [[bay.u0, bay.u1]];
    for (const [a, c] of parts) panes.push([a, va, c - a, vb - va]);
  }
  // W's local footprint (exact screen spot -> local metres), so W's bay never gets a generic pane
  let wLocal: [number, number, number, number] | null = null;
  if (L.w) {
    const W = L.w;
    const u0 = uAt(W.x - W.w / 2);
    const u1 = uAt(W.x + W.w / 2);
    const v0 = pm.vAt(W.y - W.h / 2, (u0 + u1) / 2);
    const v1 = pm.vAt(W.y + W.h / 2, (u0 + u1) / 2);
    wLocal = [u0, v0, u1 - u0, v1 - v0];
  }
  for (const [u0, v0, w, h] of panes) {
    if (wLocal && u0 < wLocal[0] + wLocal[2] - 0.05 && u0 + w > wLocal[0] + 0.05 && v0 < wLocal[1] + wLocal[3]) continue;
    const on = litAt(t, L.seed, k, panes.length, {litFrac, force});
    paneInto(dyn, pm, u0, v0, w, h, on ? 'lit' : 'unlit', `${L.seed}/p${k}${on ? 'L' : 'U'}`);
    k++;
  }
  // W: lamp-lit with her desk lamp; plum dark from lampOffAt (one frame): its own batch, painted right over the panes
  // in its own tier part (wTier)
  const wB = new Batch();
  if (wLocal) {
    const [u0, v0, w, h] = wLocal;
    const dark = wDark || (lampOffAt !== undefined && t >= lampOffAt);
    wB.poly(CM.limestone, pm.q(u0 - 0.08, v0 - 0.05, w + 0.16, h + 0.12));
    if (dark) paneInto(wB, pm, u0, v0, w, h, 'dark', `${L.seed}/W`);
    else {
      wB.poly(CM.lamp, pm.q(u0, v0, w, h));
      wB.poly(CM.lampCore, pm.q(u0 + w * 0.12, v0 + h * 0.15, w * 0.7, h * 0.55));
      // her desk lamp (an anglepoise) and a shelf with box files
      const lx = u0 + w * 0.68;
      wB.poly(CM.anchor, pm.q(lx, v0 + h * 0.62, w * 0.05, h * 0.3));
      wB.poly(CM.anchor, [pm.p(lx - w * 0.12, v0 + h * 0.5), pm.p(lx + w * 0.06, v0 + h * 0.46), pm.p(lx + w * 0.02, v0 + h * 0.62), pm.p(lx - w * 0.08, v0 + h * 0.6)]);
      for (let j = 0; j < 4; j++) wB.poly([CM.brick, CM.paneUnlit, CM.coatMustard, CM.sage][j], pm.q(u0 + w * (0.1 + j * 0.09), v0 + h * 0.3, w * 0.07, h * 0.16));
      wB.poly(CM.line, pm.q(u0 + w * 0.06, v0 + h * 0.46, w * 0.5, h * 0.03));
    }
    wB.poly(CM.glass, [pm.p(u0 + w, v0), pm.p(u0 + w, v0 + h * 0.16), pm.p(u0 + w * 0.84, v0)]);
    // the sill and the ring her plant left on it
    wB.poly(CM.limestone, pm.q(u0 - 0.12, v0 + h, w + 0.24, 0.1));
    const [rx, ry] = pm.p(u0 + w * 0.3, v0 + h + 0.04);
    const s = pm.pxPerM(u0);
    wB.ink(`M${P(rx - s * 0.13, ry)}A${(s * 0.13).toFixed(1)} ${(s * 0.035).toFixed(1)} 0 1 0 ${P(rx + s * 0.13, ry)}A${(s * 0.13).toFixed(1)} ${(s * 0.035).toFixed(1)} 0 1 0 ${P(rx - s * 0.13, ry)}`, INK_PX.hair, CM.line, 0, {thing: true});
    wB.ink(poly(pm.q(u0, v0, w, h), {closed: true, over: 'small', seed: `${L.seed}/Wfr`}), INK_PX.mid);
  }
  // the lobby behind the doors (warm), then (behindDoor), then the door glass and frames
  const D = L.door;
  const du0 = uAt(D.x0);
  const du1 = uAt(D.x1);
  const dv0 = pm.vAt(D.y0, (du0 + du1) / 2);
  const dv1 = L.hM;
  const lobby = new Batch();
  lobby.poly(CM.lamp, pm.q(du0, dv0, du1 - du0, dv1 - dv0));
  lobby.poly(CM.lampCore, pm.q(du0 + 0.3, dv0, du1 - du0 - 0.6, (dv1 - dv0) * 0.5));
  lobby.poly(CM.stucco, pm.q(du0, dv1 - 0.35, du1 - du0, 0.35));
  // a reception counter and a tall plant inside
  lobby.poly(CM.line, pm.q(du0 + (du1 - du0) * 0.55, dv1 - 1.05, (du1 - du0) * 0.4, 0.7));
  const [plx, ply] = pm.p(du0 + 0.35, dv1 - 0.35);
  const pls = pm.pxPerM(du0);
  lobby.fill(CM.sage, lobes(plx - pls * 0.35, plx + pls * 0.35, ply - pls * 0.4, pls * 1.1, `${L.seed}/lobbyplant`, 3));
  lobby.poly(CM.brickDeep, pm.q(du0 + 0.2, dv1 - 0.75, 0.3, 0.4));
  // pendant lights
  for (let j = 0; j < 3; j++) {
    const [lx, ly] = pm.p(du0 + (du1 - du0) * (0.25 + j * 0.25), dv0 + 0.25);
    lobby.fill(CM.lampCore, ovalPath(lx, ly, 6, 4));
  }
  const open = doorOpen(t, doorKeys);
  const leafW = (du1 - du0) / 2;
  const doors = new Batch();
  for (const side of [0, 1]) {
    // each leaf slides outward into a pocket: only the part still inside the opening is drawn
    const shift = open * leafW * (side ? 1 : -1);
    const a0 = du0 + side * leafW + shift;
    const a = Math.max(du0, a0);
    const e = Math.min(du1, a0 + leafW);
    const lw = e - a;
    if (lw <= 0.01) continue;
    const fr = 0.05;
    doors.poly(CM.paneUnlit, pm.q(a, dv0, lw, fr));
    doors.poly(CM.paneUnlit, pm.q(a, dv1 - 0.12, lw, 0.12));
    if (a0 >= du0 - 1e-3) doors.poly(CM.paneUnlit, pm.q(a, dv0, fr, dv1 - dv0));
    if (a0 + leafW <= du1 + 1e-3) doors.poly(CM.paneUnlit, pm.q(e - fr, dv0, fr, dv1 - dv0));
    const hx = side ? a0 + fr * 2 : a0 + leafW - fr * 3;
    if (hx > du0 && hx < du1) doors.poly(CM.coatOat, pm.q(hx, dv0 + (dv1 - dv0) * 0.35, 0.04, (dv1 - dv0) * 0.3));
    const g0 = a0 + leafW * 0.1;
    const g1 = a0 + leafW * 0.8;
    if (g0 > du0 && g1 < du1) doors.poly(CM.glass, [pm.p(a0 + leafW * 0.6, dv0 + 0.1), pm.p(g1, dv0 + 0.1), pm.p(a0 + leafW * 0.3, dv0 + 1.2), pm.p(g0, dv0 + 1.2)]);
  }
  // the fixed side lights
  const side = new Batch();
  side.poly(CM.glass, pm.q(du0 - 0.22, dv0, 0.22, dv1 - dv0));
  side.poly(CM.glass, pm.q(du1, dv0, 0.22, dv1 - dv0));
  side.poly(CM.paneUnlit, pm.q(du0 - 0.24, dv0, 0.04, dv1 - dv0));
  side.poly(CM.paneUnlit, pm.q(du1 + 0.2, dv0, 0.04, dv1 - dv0));
  side.ink(poly(pm.q(du0, dv0, du1 - du0, dv1 - dv0), {closed: true, over: 'small', seed: `${L.seed}/door`}), INK_PX.far);
  const F = L.fascia;
  return (
    <>
      <Paint b={stat} seed={`${L.seed}/stat`} at={at} />
      <Paint b={dyn} seed={`${L.seed}/dyn`} at={at} />
      <TierPart def="support" tier={wTier}>
        <Paint b={wB} seed={`${L.seed}/W`} at={at} />
      </TierPart>
      <Paint b={lobby} seed={`${L.seed}/lobby`} at={at} />
      <Slot>{behindDoor}</Slot>
      <Paint b={doors} seed={`${L.seed}/doors`} at={at} misreg={false} />
      <Paint b={side} seed={`${L.seed}/side`} at={at} />
      <HandLetteredGoogle cx={(F.x0 + F.x1) / 2} baseline={F.y0 + (F.y1 - F.y0) * 0.78} cap={Math.min(L.letterPx, (F.y1 - F.y0) * 0.86)} at={lettersAt} />
    </>
  );
};
export const WingFront = tiered('environment', {}, WingFrontBody);

/** Door opening 0..1 at t from [t, open] keys (linear between keys, eased in-out). */
export function doorOpen(t: number, keys: [number, number][]): number {
  if (!keys.length) return 0;
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    if (t <= keys[i][0]) {
      const [t0, a] = keys[i - 1];
      const [t1, c] = keys[i];
      const u = clamp01((t - t0) / Math.max(1e-6, t1 - t0));
      return lerp(a, c, u * u * (3 - 2 * u));
    }
  }
  return keys[keys.length - 1][1];
}

/** S1's default door keys (TREATMENT §4): shut, slide apart 0.45 -> fully open 0.52, she steps out at 0.97,
 *  shut behind her by 1.10 (f66). */
export const S1_DOOR_KEYS: [number, number][] = [
  [0.45, 0],
  [0.52, 1],
  [0.97, 1],
  [1.1, 0],
];

/** S1: the wing frontal and close (map S1_SHEET). */
const WingS1Body: React.FC<Omit<WingFrontProps, 'layout'>> = (p) => {
  const L = useMemo(() => s1Layout(), []);
  return <WingFront layout={L} lampOffAt={0.4} doorKeys={S1_DOOR_KEYS} {...p} />;
};
export const WingS1 = tiered('environment', {}, WingS1Body);

/** S7: the wing at human size from the forecourt (map S7), plain lit windows, no silhouettes. */
const WingS7Body: React.FC<Omit<WingFrontProps, 'layout'>> = (p) => {
  const L = useMemo(() => s7Layout(), []);
  return <WingFront layout={L} litFrac={0.7} {...p} />;
};
export const WingS7 = tiered('environment', {}, WingS7Body);

/** Screen points for life on the wing (pigeon ledges etc.) for a layout: the canopy top and the first-storey sills. */
export function wingLedges(L: WingLayout): {canopy: [number, number, number]; sills: [number, number, number][]} {
  const pm = new PlaneMap(L.wM, L.hM, L.quad);
  const sills = L.upper.map((b) => {
    const [x0, y0] = pm.p(b.u0, L.floorV - L.bandM - 0.06);
    const [x1] = pm.p(b.u1, L.floorV - L.bandM - 0.06);
    return [x0, x1, y0] as [number, number, number];
  });
  return {canopy: [L.fascia.x0 - 6, L.fascia.x1 + 6, L.fascia.y0 - 6], sills};
}

export {leafPath, rand};
export type {Pt};
