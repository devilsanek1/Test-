// V2S1 world (lane L1): THE WEST GAP x 0-330 (TREATMENT section 4, map S1_SHEET.westGap): far London roofs in three
// flat depth steps (a gasholder frame and cool stone blocks far, light brick and stucco terraces, then brick terrace
// backs with chimney stacks, pots, aerials and sash windows; tops y ~790), SUN0 (200, 690) r 80 ON TOP of them (ref 1's
// sun), the road bridge (deck y ~960: an iron railing, a stone string course, brick spandrels and a segmental arch)
// with its traffic seen through the railing: a double-decker crossing once on 1.10; the five birds on the railing that
// lift at 1.40 and wheel west ACROSS THE SUN. Tier C (V2S1_set wraps it in <Tier tier="environment">): flat 2-tone
// shapes, no line; frame 0 shows them as pale shapes (the Look cascade's `pale`), no underdrawing.
import React, {useMemo} from 'react';
import {CM, INK_PX} from '../palette';
import {useTime} from '../../lib/time';
import {line, poly, rect as rectInk, arc} from '../../lib/sketch';
import {Fill} from '../../lib/Fill';
import {Tier} from '../../lib/tier';
import {Batch, P, Pt, rng, ovalPath, lobes, lerp, domePath, r1} from '../kit/canal/core';
import {litAt} from '../kit/canal/life';
import {Person} from '../kit/cast';
import * as MAP from '../world/map';
import {CellPaint, Under, barPath, ringPath, S1_IRON, S1_HAZE, S1_ATM, hazeBatch} from './V2S1_set_core';
import {atmos, backing, recede, toneOnTone} from '../../lib/depth';
import {tierFill} from '../../lib/pen';
import {fromLch, lch, mixHex} from '../../lib/light';
import {floodAt, S1_PALE} from './V2S1_clock';
import {S1Plane, S1_PLANE} from './V2S1_float';

const S = MAP.S1_SHEET;
/** The bridge (screen px at zoom 1.00). */
export const BRIDGE = {x0: -60, x1: 350, railTop: 934, deck: 958, course: 972, base: 1056, arch: {cx: 110, half: 148, spring: 1030, crown: 984}} as const;
/** The far block behind the wing's west edge (before the haze: ~L* 72 after it, cool, no detail). */
const CALM_FIELD = '#8F93AE';
/** THE FIELD BEHIND THE WING'S WEST EDGE (CRAFT §f.3; conform_L1 §11 "the corner"): a calm far tower rising behind the
 *  wing's lit limestone corner up to its roofline, one flat shape of its own plane (+3), its value set by lib/depth
 *  `backing` so the corner parts from it by >= 15 L* as SHOWN (the clean pen's environment pull included). Before, the
 *  corner stood on a sky step of its own value (check_depth: melts, median 4.4). */
const TOWER = {x0: 258, x1: 346, top: 598};
/** (computed at render: the clean pen's tier pull is known only once the film's pen is set) */
const towerField = () => backing(tierFill(CM.limestone, 'environment'), atmos(CALM_FIELD, HAZE_K.near, S1_HAZE), {tier: 'environment', min: 15});
const CalmTower: React.FC = () => {
  const field = towerField();
  const {x0, x1, top} = TOWER;
  const step = top + 26;
  // its window rows: tone-on-tone (lib/depth toneOnTone, dE <= 6), in a few rows of three: a far office tower, calm
  const win = toneOnTone(field, {dE: 5});
  let wins = '';
  for (let y = step + 22; y < FOOT - 60; y += 34) for (const x of [x0 + 12, x0 + 34, x0 + 56]) wins += `M${x} ${y}h14v18h-14Z`;
  // its sun edge (the left: the low sun is west) one lit step; its foot warmed toward the horizon (the air near the
  // ground is the sky's lowest colour): atmos's step toward the haze for its value, the hue turned 50 deg the warm way
  // round (lavender -> rose -> peach), C* >= 10 (atmos alone keeps a cool hue under a warm air; a straight mix greys)
  const lit = atmos(field, 0.18, '#FFFFFF');
  const f0 = lch(atmos(field, 0.35, S1_HAZE));
  const foot = fromLch(f0.L, Math.max(10, f0.C), (f0.h + 50) % 360);
  return (
    <>
      {/* the body with a stepped top: a set-back crown and a small plant box on it */}
      <Fill d={`M${x0} ${FOOT}L${x0} ${step}L${x0 + 14} ${step}L${x0 + 14} ${top}L${x1} ${top}L${x1} ${FOOT}Z`} color={field} offset={false} seed="s1farTower" />
      <Fill d={`M${x0 + 22} ${top}L${x0 + 22} ${top - 8}L${x0 + 52} ${top - 8}L${x0 + 52} ${top}Z`} color={atmos(CM.sage, HAZE_K.near, S1_HAZE)} offset={false} seed="s1farTowerGarden" />
      <Fill d={wins} color={win} offset={false} seed="s1farTowerWin" />
      <Fill d={`M${x0} ${step}L${x0 + 5} ${step}L${x0 + 5} ${FOOT}L${x0} ${FOOT}Z M${x0 + 14} ${top}L${x0 + 19} ${top}L${x0 + 19} ${step}L${x0 + 14} ${step}Z`} color={lit} offset={false} seed="s1farTowerLit" />
      <Fill d={`M${x0} ${FOOT - 56}L${x1} ${FOOT - 56}L${x1} ${FOOT}L${x0} ${FOOT}Z`} color={foot} offset={false} seed="s1farTowerFoot" />
    </>
  );
};
/** Every far building's hidden foot (behind the bridge railing). */
const FOOT = 944;
/** How far each far plane mixes toward S1_HAZE (V2S1_set_core): each a clear step, the bridge the nearest. */
export const HAZE_K = {far: 0.8, mid: 0.62, near: 0.46, bridge: 0.3, rail: 0.36, bus: 0.58} as const;

// ---------------------------------------------------------------- the far roofs

type Roof = 'pitch' | 'mansard' | 'flat' | 'gable' | 'shed';
type Bld = {
  x0: number;
  x1: number;
  top: number;
  wall: string;
  roof: Roof;
  roofCol?: string;
  /** Chimney stacks: [x, height]. */
  stacks?: [number, number][];
  /** Window grid: size, columns' gap, first row offset; lit windows switch. */
  win?: {w: number; h: number; gx: number; gy: number; arch?: boolean};
  /** A roof garden or a water tank on a flat roof. */
  garden?: boolean;
  tank?: boolean;
  /** Aerials on stacks (x list). */
  aerial?: number[];
};

const FAR: Bld[] = [
  {x0: -30, x1: 28, top: 770, wall: CM.stoneShade, roof: 'flat'},
  // under the sun ONE near-level roof edge cuts the disc (the art director: a V notch between this flat roof and the
  // gable left an orange tooth under the disc, a speech bubble): the flat roof runs on over the gable's eave, and the
  // gable keeps no chimneys
  {x0: 118, x1: 216, top: 758, wall: CM.limestone, roof: 'flat', win: {w: 4, h: 5, gx: 9, gy: 11}},
  {x0: 196, x1: 300, top: 774, wall: CM.stoneShade, roof: 'pitch', roofCol: CM.stoneShade},
  {x0: 300, x1: 370, top: 752, wall: CM.limestone, roof: 'flat', win: {w: 4, h: 5, gx: 10, gy: 11}},
];
const MID: Bld[] = [
  {x0: -30, x1: 46, top: 790, wall: CM.stucco, roof: 'mansard', stacks: [[30, 20]], win: {w: 7, h: 10, gx: 16, gy: 20}},
  {x0: 46, x1: 118, top: 798, wall: CM.brickLight, roof: 'pitch', roofCol: CM.shadeWarm, stacks: [[62, 22], [104, 18]], win: {w: 7, h: 10, gx: 16, gy: 20}},
  {x0: 118, x1: 186, top: 786, wall: CM.limestone, roof: 'flat', stacks: [[132, 16], [170, 20]], win: {w: 7, h: 10, gx: 15, gy: 19}},
  {x0: 186, x1: 260, top: 782, wall: CM.brickLight, roof: 'gable', roofCol: CM.shadeWarm, win: {w: 7, h: 10, gx: 16, gy: 20}},
  {x0: 260, x1: 352, top: 794, wall: CM.stucco, roof: 'pitch', roofCol: CM.shadeCool, stacks: [[280, 24], [330, 20]], win: {w: 7, h: 10, gx: 16, gy: 20}},
];
const NEAR: Bld[] = [
  {x0: -30, x1: 62, top: 814, wall: CM.brick, roof: 'pitch', roofCol: CM.brickDeep, stacks: [[40, 26]], win: {w: 11, h: 17, gx: 24, gy: 30}},
  {x0: 62, x1: 152, top: 808, wall: CM.stucco, roof: 'mansard', stacks: [[84, 24], [138, 22]], win: {w: 11, h: 17, gx: 25, gy: 30}},
  {x0: 152, x1: 222, top: 826, wall: CM.brick, roof: 'flat', tank: true, win: {w: 12, h: 18, gx: 23, gy: 30, arch: true}},
  {x0: 222, x1: 292, top: 818, wall: CM.brickLight, roof: 'pitch', roofCol: CM.brick, stacks: [[248, 26]], win: {w: 11, h: 17, gx: 24, gy: 30}},
  // right behind the wing's west edge: a calm cool block (no windows, no garden), so the wing's pale pier reads
  // against a clear, darker field (the owner's separation note)
  {x0: 292, x1: 356, top: 786, wall: CALM_FIELD, roof: 'flat'},
];
/** The far window that lights on 1.80 (TREATMENT f108): the near stucco terrace, top row, second window. */
const FAR_LIGHT = {row: 'near', bld: 1, k: 1, at: 1.8};

type WinRef = {x: number; y: number; w: number; h: number; arch: boolean; key: string};

/** One building into the fill batch + its underdrawing (region = the building's centre). Returns its windows. */
function bldInto(b: Batch, u: Under, o: Bld, key: string, inkW: number, ceil = 590, detail = true): WinRef[] {
  const r = rng(`s1far/${key}`);
  const {x0, x1, top} = o;
  const w = x1 - x0;
  const rh = Math.min(w * 0.3, 30);
  const cx = (x0 + x1) / 2;
  const cy = (top + FOOT) / 2;
  b.rect(o.wall, x0, top, w + 0.6, FOOT - top);
  let sil = '';
  const roofCol = o.roofCol ?? CM.shadeCool;
  if (o.roof === 'pitch') {
    b.poly(roofCol, [[x0 - 2, top], [x0 + w * 0.14, top - rh * 0.75], [x1 - w * 0.14, top - rh * 0.75], [x1 + 2, top]]);
    sil += poly([[x0 - 2, top], [x0 + w * 0.14, top - rh * 0.75], [x1 - w * 0.14, top - rh * 0.75], [x1 + 2, top]], {seed: `s1farR/${key}`, over: 'small'});
  } else if (o.roof === 'mansard') {
    b.poly(CM.shadeCool, [[x0 - 1, top], [x0 + w * 0.08, top - rh], [x1 - w * 0.08, top - rh], [x1 + 1, top]]);
    b.rect(CM.stoneShade, x0 + w * 0.08, top - rh - 2.5, w * 0.84, 2.5);
    const nd = Math.max(1, Math.floor(w / 30));
    for (let k = 0; k < nd; k++) {
      const dx = x0 + w * 0.14 + (k * (w * 0.72)) / Math.max(1, nd - 1 || 1) - (nd === 1 ? -w * 0.22 : 0);
      b.rect(CM.stucco, dx - 1, top - rh * 0.78, 11, rh * 0.62);
      b.rect(S1_IRON, dx + 1.5, top - rh * 0.66, 6, rh * 0.44);
      sil += rectInk(dx - 1, top - rh * 0.78, 11, rh * 0.62, {seed: `s1farD/${key}${k}`, over: 'none', open: 0.3});
    }
    sil += poly([[x0 - 1, top], [x0 + w * 0.08, top - rh], [x1 - w * 0.08, top - rh], [x1 + 1, top]], {seed: `s1farM/${key}`, over: 'small'});
  } else if (o.roof === 'gable') {
    b.poly(roofCol, [[x0 - 3, top], [cx, top - rh * 1.1], [x1 + 3, top]]);
    sil += poly([[x0 - 3, top], [cx, top - rh * 1.1], [x1 + 3, top]], {seed: `s1farG/${key}`, over: 'small'});
  } else {
    // flat: a parapet coping
    b.rect(CM.limestone, x0 - 1.5, top - 4, w + 3, 4);
    sil += line(x0 - 1.5, top - 4, x1 + 1.5, top - 4, {seed: `s1farF/${key}`, over: 'small'});
  }
  sil += line(x0, top, x0, FOOT, {seed: `s1farL/${key}`, over: 'none'});
  // chimney stacks with pots, aerials
  for (const [sx, sh] of o.stacks ?? []) {
    const sw = r.range(11, 17);
    const base = o.roof === 'pitch' || o.roof === 'mansard' ? top - rh * 0.55 : top - 4;
    const st = Math.max(ceil + 10, base - sh);
    b.rect(o.wall === CM.brickLight ? CM.brick : CM.brickLight, sx - sw / 2, st, sw, base - st + 1);
    b.rect(CM.stoneShade, sx - sw / 2 - 1.5, st, sw + 3, 2.5);
    // chimney pots (2-5 px) only on the near row: a far plane draws no part under 12 px (lib/depth planeLod)
    const pots = detail ? Math.max(2, Math.round(sw / 5)) : 0;
    for (let k = 0; k < pots; k++) b.rect(k % 2 ? CM.brick : CM.brickLight, sx - sw / 2 + 1 + (k * (sw - 2)) / pots, st - 5, Math.max(2.4, (sw - 2) / pots - 1.4), 5);
    sil += rectInk(sx - sw / 2, st, sw, base - st, {seed: `s1farS/${key}${sx}`, over: 'none', edges: 'tlr'});
    for (let k = 0; k < pots; k++) {
      const px = sx - sw / 2 + 1 + (k * (sw - 2)) / pots + 1;
      sil += `M${P(px, st)}L${P(px, st - 5)}`;
    }
  }
  for (const ax of o.aerial ?? []) {
    const stack = (o.stacks ?? []).find(([sx]) => sx === ax);
    const base = (o.roof === 'pitch' || o.roof === 'mansard' ? top - rh * 0.55 : top - 4) - (stack ? stack[1] : 0) - 5;
    const at = Math.max(ceil + 4, base - 20);
    b.fill(S1_IRON, barPath([ax, base], [ax, at], 1.6));
    b.fill(S1_IRON, barPath([ax - 8, at + 4], [ax + 8, at + 4], 1.4));
    b.fill(S1_IRON, barPath([ax - 5, at + 9], [ax + 5, at + 9], 1.4));
    sil += `M${P(ax, base)}L${P(ax, at)}M${P(ax - 8, at + 4)}L${P(ax + 8, at + 4)}`;
  }
  if (o.tank) {
    b.rect(CM.stoneShade, x0 + w * 0.6, top - 20, 18, 16);
    b.rect(S1_IRON, x0 + w * 0.6 - 1, top - 22, 20, 3);
    sil += rectInk(x0 + w * 0.6, top - 20, 18, 16, {seed: `s1farT/${key}`, over: 'none', edges: 'tlr'});
  }
  if (o.garden) {
    b.fill(CM.sage, lobes(x0 + 4, x0 + w * 0.6, top - 3, 16, `s1farGd/${key}`, 3));
    b.fill(CM.leafGold, lobes(x0 + w * 0.55, x1 - 4, top - 3, 11, `s1farGd2/${key}`, 2));
  }
  u.add(cx, cy, sil, inkW);
  // windows
  const wins: WinRef[] = [];
  if (o.win) {
    const W = o.win;
    const cols = Math.max(1, Math.floor((w - 6) / W.gx));
    const left = x0 + (w - (cols - 1) * W.gx - W.w) / 2;
    let row = 0;
    for (let y = top + (o.roof === 'flat' ? 10 : 8); y + W.h < FOOT - 6; y += W.gy) {
      for (let c = 0; c < cols; c++) wins.push({x: left + c * W.gx, y, w: W.w, h: W.h, arch: !!W.arch, key: `${key}/${row}/${c}`});
      row++;
    }
  }
  return wins;
}

/** The far roofs: static fills per building (flooding building by building), windows that switch, the underdrawing. */
const FarRoofs: React.FC = () => {
  const t = useTime();
  const {stat, under, wins} = useMemo(() => {
    const stat = new Batch();
    const under = new Under();
    // the farthest step: cool stone blocks only (the gasholder's 1-3 px lattice is gone: nothing under 12 px on +4,
    // lib/depth planeLod; its bars were the far plane's busiest edges)
    FAR.forEach((o, i) => bldInto(stat, under, o, `F${i}`, INK_PX.hair, 590, false));
    stat.layer();
    const wins: {w: WinRef; row: string; bld: number; k: number}[] = [];
    // the two far planes are simpler: no windows (only the near row keeps its sash windows)
    MID.forEach((o, i) => bldInto(stat, under, o, `M${i}`, INK_PX.hair, 590, false));
    stat.layer();
    NEAR.forEach((o, i) => bldInto(stat, under, o, `N${i}`, INK_PX.far).forEach((w, k) => wins.push({w, row: 'near', bld: i, k})));
    // atmospheric perspective: three clear steps toward the haze (the farthest plane nearly the air itself)
    hazeBatch(stat, [HAZE_K.far, HAZE_K.mid, HAZE_K.near], S1_HAZE, {planes: [4, 4, 3]});
    // window outlines in the underdrawing (near row only: the bare-line state reads as a street of sash windows)
    for (const {w, row, bld} of wins) {
      if (row !== 'near') continue;
      const o = NEAR[bld];
      under.add((o.x0 + o.x1) / 2, (o.top + FOOT) / 2, w.arch ? `M${P(w.x, w.y + w.h)}L${P(w.x, w.y + w.w / 2)}A${r1(w.w / 2)} ${r1(w.w / 2)} 0 0 1 ${P(w.x + w.w, w.y + w.w / 2)}L${P(w.x + w.w, w.y + w.h)}` : rectInk(w.x, w.y, w.w, w.h, {seed: `s1farW/${w.key}`, over: 'none', open: 0.35}), INK_PX.hair);
    }
    return {stat, under, wins};
  }, []);
  // windows (per frame: a few lit, switching on the far rows' slower clock; the 1.80 window lights for good)
  const wb = new Batch();
  const n = wins.length;
  wins.forEach(({w, row, bld, k}, i) => {
    const forced = row === FAR_LIGHT.row && bld === FAR_LIGHT.bld && k === FAR_LIGHT.k;
    // the life budget: ONE window switch at a time, >= 2 s apart in the whole shot (this one 1.80, the wing's 3.90):
    // every other far window holds its frame-0 state
    const on = forced ? t >= FAR_LIGHT.at : litAt(0, 's1farwin', i, n, {litFrac: 0.2, gap: [0.7, 1.6]});
    // a +3 window: tone-on-tone on its own receded wall (CRAFT §f.2: within dE 6, never a dark speck or the lamp
    // colour; the one story window that lights at 1.80 one soft step lighter)
    const col = toneOnTone(recede(NEAR[bld].wall, 3, S1_ATM), {lit: on});
    if (w.arch) wb.fill(col, `M${P(w.x, w.y + w.h)}L${P(w.x, w.y + w.w / 2)}A${r1(w.w / 2)} ${r1(w.w / 2)} 0 0 1 ${P(w.x + w.w, w.y + w.w / 2)}L${P(w.x + w.w, w.y + w.h)}Z`);
    else wb.rect(col, w.x, w.y, w.w, w.h);
    if (row === 'near') wb.rect(recede(CM.limestone, 3, S1_ATM), w.x - 1.5, w.y + w.h, w.w + 3, 2.5);
  });
  return (
    <>
      <CellPaint b={stat} seed="s1far/stat" cell={70} misreg={0.6} />
      <CellPaint b={wb} seed="s1far/win" cell={70} misreg={0} live />
    </>
  );
};

/** A King's-Cross-like gasholder guide frame seen side-on: columns, ring girders, lattice (thin stone fills). */
function gasholderInto(b: Batch, u: Under, cx: number, base: number, r: number, h: number) {
  const col = CM.stoneShade;
  const top = Math.max(600, base - h);
  const n = 9;
  const xs: number[] = [];
  for (let k = 0; k < n; k++) xs.push(cx - Math.cos((Math.PI * k) / (n - 1)) * r);
  let d = '';
  for (const x of xs) {
    b.fill(col, barPath([x, top], [x, base], 2.4));
    d += `M${P(x, top)}L${P(x, base)}`;
  }
  const rings = 4;
  for (let k = 0; k <= rings; k++) {
    const y = top + ((base - top) * k) / (rings + 0.8);
    b.fill(col, barPath([cx - r - 2, y], [cx + r + 2, y], 2.6));
    d += `M${P(cx - r - 2, y)}L${P(cx + r + 2, y)}`;
    if (k < rings) {
      const y2 = top + ((base - top) * (k + 1)) / (rings + 0.8);
      for (let j = 0; j < n - 1; j++) {
        b.fill(col, barPath([xs[j], y], [xs[j + 1], y2], 1.2));
        b.fill(col, barPath([xs[j + 1], y], [xs[j], y2], 1.2));
      }
    }
  }
  // a column cap row (the frame's crown)
  for (const x of xs) b.fill(col, ovalPath(x, top - 1.5, 2.4, 2));
  u.add(cx, (top + base) / 2, d, INK_PX.hair);
}

// ---------------------------------------------------------------- SUN0

/** SUN0: the film's one pop colour, flat, no ink, no glow: an EVENING sun low in the warm sky (whose warmth round it is
 *  lib/sky's: no halo), setting BEHIND the far roofs (drawn before them). Frame 0
 *  (before the flood): the lower-left half in colour (the colour already pouring in from the low left), the rest a flat
 *  pale shape like everything else, no halo (the sky is still paper). */
const SunDisc: React.FC = () => {
  const t = useTime();
  const {x, y, r} = S.sun;
  const disc = ovalPath(x, y, r, r);
  if (t < MAP.S1_CLOCK.flood.t0) {
    const a0 = (200 * Math.PI) / 180;
    const half = `M${x + r * Math.cos(a0 - Math.PI)} ${y + r * Math.sin(a0 - Math.PI)}A${r} ${r} 0 0 1 ${x + r * Math.cos(a0)} ${y + r * Math.sin(a0)}Z`;
    return (
      <>
        <Fill d={disc} color={mixHex(CM.sun, CM.white, S1_PALE)} offset={false} lookExempt exit={false} seed="s1sunpale" />
        <Fill d={half} color={CM.sun} offset={false} lookExempt exit={false} seed="s1sunhalf" />
      </>
    );
  }
  // the sky carries the low sun's warmth (lib/sky): the disc alone, flat, no halo (CRAFT §g.2)
  return <Fill d={disc} color={CM.sun} offset={false} seed="s1sun" />;
};

// ---------------------------------------------------------------- the road bridge

const A = BRIDGE.arch;
/** The arch intrados at x (segmental): y on the curve, or null outside the span. */
const archY = (x: number, grow = 0): number | null => {
  const half = A.half + grow;
  if (Math.abs(x - A.cx) > half) return null;
  const rise = A.spring - A.crown + grow;
  const R = (half * half + rise * rise) / (2 * rise);
  const yc = A.spring - rise + R;
  return yc - Math.sqrt(Math.max(0, R * R - (x - A.cx) * (x - A.cx)));
};
const archPath = (grow = 0, close = true) => {
  const pts: Pt[] = [];
  const half = A.half + grow;
  for (let k = 0; k <= 24; k++) {
    const x = A.cx - half + (2 * half * k) / 24;
    pts.push([x, archY(x, grow) ?? A.spring]);
  }
  let d = `M${P(A.cx - half, close ? BRIDGE.base : A.spring)}`;
  for (const [x, y] of pts) d += `L${P(x, y)}`;
  return close ? d + `L${P(A.cx + half, BRIDGE.base)}Z` : d;
};

/** The arch opening (closed), cut at y <= yMax: what shows through the bridge (the far jogger is clipped to it). */
export const s1ArchOpening = (yMax: number): string => {
  const half = A.half;
  let d = `M${P(A.cx - half, yMax)}`;
  for (let k = 0; k <= 24; k++) {
    const x = A.cx - half + (2 * half * k) / 24;
    d += `L${P(x, Math.min(yMax, archY(x) ?? A.spring))}`;
  }
  return d + `L${P(A.cx + half, yMax)}Z`;
};

/** The bridge body (behind the traffic): the string course, spandrels, the arch and what shows through it. */
function bridgeBody(): {b: Batch; u: Under} {
  const b = new Batch();
  const u = new Under();
  const {x0, x1, deck, course, base} = BRIDGE;
  // spandrel walls (brick), in strips so the flood ripples along
  for (let x = x0; x < x1; x += 70) b.rect(CM.brick, x - 0.5, course, 71, base - course);
  // the arch: the shaded soffit, the far water and a sliver of the far bank through it, the stone ring
  b.layer();
  b.fill(CM.stoneShade, archPath(0));
  b.rect(CM.waterDeep, A.cx - A.half, base - 14, 2 * A.half, 14);
  b.rect(CM.water, A.cx - A.half, base - 14, 2 * A.half, 3);
  b.fill(CM.shadeCool, `M${P(A.cx - A.half, A.spring + 6)}L${P(A.cx + A.half, A.spring + 6)}L${P(A.cx + A.half, base - 14)}L${P(A.cx - A.half, base - 14)}Z`);
  b.fill(CM.paving, `M${P(A.cx + 40, base - 14)}L${P(A.cx + A.half, base - 14)}L${P(A.cx + A.half, base - 22)}L${P(A.cx + 60, base - 20)}Z`);
  b.layer();
  // the voussoir ring (limestone) + keystone, the abutment pilaster, the string course under the deck
  b.fill(CM.limestone, archPath(11, true) + '');
  b.fill(CM.stoneShade, archPath(0));
  b.fill(CM.limestone, `M${P(A.cx - 7, A.crown - 13)}L${P(A.cx + 7, A.crown - 13)}L${P(A.cx + 5, A.crown + 2)}L${P(A.cx - 5, A.crown + 2)}Z`);
  b.rect(CM.limestone, 268, course, 14, base - course);
  b.rect(CM.stoneShade, 280, course, 4, base - course);
  b.rect(CM.limestone, x0, deck, x1 - x0, course - deck);
  b.rect(CM.stoneShade, x0, course - 3, x1 - x0, 4);
  // the underdrawing: deck lines, the arch and its ring, the pilaster
  u.add(110, 990, line(x0, deck, x1, deck, {seed: 's1br/deck', over: 'small'}) + line(x0, course, x1, course, {seed: 's1br/course', over: 'small'}), INK_PX.far);
  u.add(110, 1010, archPath(0, false) + archPath(11, false) + `M${P(A.cx - 7, A.crown - 13)}L${P(A.cx - 5, A.crown + 2)}M${P(A.cx + 7, A.crown - 13)}L${P(A.cx + 5, A.crown + 2)}`, INK_PX.far);
  u.add(275, 1010, line(268, course, 268, base, {seed: 's1br/pil', over: 'none'}), INK_PX.hair);
  return {b, u};
}

/** The bridge railing (in front of the traffic): posts with ball finials, top + bottom rails, thin bars; two lamp
 *  standards. Thin iron = thin FILLS in colour; its f0 underdrawing in ink. */
function bridgeRail(): {b: Batch; u: Under} {
  const b = new Batch();
  const u = new Under();
  const {x0, x1, railTop, deck} = BRIDGE;
  const iron = S1_IRON;
  b.rect(iron, x0, railTop, x1 - x0, 3);
  b.rect(iron, x0, deck - 4, x1 - x0, 2.4);
  let bars = '';
  for (let x = x0 + 4; x < x1; x += 8.5) {
    b.rect(iron, x, railTop + 2, 1.6, deck - railTop - 3);
    if (Math.round(x) % 17 < 9) bars += `M${P(x + 0.8, railTop + 3)}L${P(x + 0.8, deck - 2)}`;
  }
  let posts = '';
  for (let x = x0 + 30; x < x1; x += 62) {
    b.rect(iron, x - 2.2, railTop - 5, 4.4, deck - railTop + 5);
    b.fill(iron, ovalPath(x, railTop - 7, 3, 3));
    posts += `M${P(x, railTop - 4)}L${P(x, deck)}`;
  }
  // two lamp standards on posts (off: the golden state keeps lamps off)
  for (const lx of [x0 + 30 + 62 * 1, x0 + 30 + 62 * 4]) {
    b.fill(iron, barPath([lx, railTop - 6], [lx, railTop - 44], 2.6));
    b.fill(CM.glass, `M${P(lx - 3.5, railTop - 44)}L${P(lx - 5.5, railTop - 54)}L${P(lx + 5.5, railTop - 54)}L${P(lx + 3.5, railTop - 44)}Z`);
    b.fill(iron, `M${P(lx - 6.5, railTop - 54)}L${P(lx, railTop - 59)}L${P(lx + 6.5, railTop - 54)}Z`);
    posts += `M${P(lx, railTop - 6)}L${P(lx, railTop - 44)}M${P(lx - 3.5, railTop - 44)}L${P(lx - 5.5, railTop - 54)}L${P(lx + 5.5, railTop - 54)}L${P(lx + 3.5, railTop - 44)}`;
  }
  u.add(80, 946, line(x0, railTop, x1, railTop, {seed: 's1br/rail', over: 'small'}) + posts, INK_PX.far);
  u.add(200, 946, bars, INK_PX.hair);
  return {b, u};
}

// ---------------------------------------------------------------- the traffic on the deck (seen through the railing)

export const S1_BUS = {cx: 120, at: 1.1, speed: 260, h: 84, len: 200} as const;
export const s1BusX = (t: number) => S1_BUS.cx + S1_BUS.speed * (t - S1_BUS.at);

const Bus: React.FC = () => {
  const t = useTime();
  const x = s1BusX(t);
  const L = S1_BUS.len;
  const h = S1_BUS.h;
  if (x - L / 2 > 360 || x + L / 2 < -80) return null;
  const y1 = BRIDGE.deck - 2;
  const y0 = y1 - h;
  const b = new Batch();
  const xl = x - L / 2;
  // a flat double-decker, no livery or lettering: brick body, two glazed decks, a cream band, a destination blind
  b.fill(CM.brick, `M${P(xl, y1 - 8)}L${P(xl, y0 + 8)}Q${P(xl, y0)} ${P(xl + 8, y0)}L${P(xl + L - 10, y0)}Q${P(xl + L, y0)} ${P(xl + L, y0 + 10)}L${P(xl + L, y1 - 8)}Z`);
  b.rect(CM.coatOat, xl, y0 + h * 0.46, L, h * 0.07);
  for (const [yy, hh] of [[y0 + h * 0.12, h * 0.26], [y0 + h * 0.56, h * 0.24]] as [number, number][]) {
    for (let k = 0; k < 6; k++) {
      const wx = xl + 10 + (k * (L - 26)) / 6;
      b.rect(k === 5 && yy > y0 + h * 0.5 ? CM.paneUnlit : CM.glass, wx, yy, (L - 26) / 6 - 4, hh);
      b.rect(CM.skyHigh, wx, yy, (L - 26) / 6 - 4, hh * 0.28);
    }
  }
  b.rect(CM.box, xl + L - 24, y0 + 5, 18, 8);
  b.rect(CM.brickDeep, xl, y1 - 10, L, 3);
  for (const wx of [xl + 30, xl + L - 40]) b.fill(CM.coatSlate, ovalPath(wx, y1 - 4, 9, 9));
  // calmer than the bridge itself (the art director: it competed with the first copy at ~2.0); its time stays the
  // sound's (audio/v2r/sheet.py: the bus at 1.10)
  hazeBatch(b, [HAZE_K.bus]);
  return <CellPaint b={b} seed="s1bus" cell={1000} misreg={0} live />;
};

// ---------------------------------------------------------------- birds

type BirdSpec = {x: number; y: number; delay: number; dur: number; c1: Pt; c2: Pt; size: number; ph: number};

/** The five on the bridge railing: they lift at 2.45 (MAP.S1_CLOCK.birdsLiftBridge, after the first copy) and wheel
 *  west, low in front of the far roofs, then up off the frame's left edge, never across the sun's disc and never above
 *  y 600. Small (10-12 px) and pale (BIRD), never the plum anchor. The six on the far roofs that lifted on "life" are
 *  cut (the hit at 4.98 is the row's). */
const RAIL_BIRDS: BirdSpec[] = [
  // west, low in front of the far roofs (below the roofline y ~752 until x < 120), then up off the frame's left edge:
  // never across the sun's disc (the art director: five dark birds across the disc competed with the first copy)
  {x: 150, y: BRIDGE.railTop, delay: 0.0, dur: 1.9, c1: [40, 880], c2: [-190, 700], size: 12, ph: 0.3},
  {x: 166, y: BRIDGE.railTop, delay: 0.08, dur: 2.05, c1: [56, 896], c2: [-170, 720], size: 11, ph: 1.9},
  {x: 181, y: BRIDGE.railTop, delay: 0.04, dur: 1.95, c1: [30, 870], c2: [-210, 690], size: 12, ph: 3.1},
  {x: 197, y: BRIDGE.railTop, delay: 0.14, dur: 2.15, c1: [66, 904], c2: [-160, 736], size: 10, ph: 4.4},
  {x: 214, y: BRIDGE.railTop, delay: 0.2, dur: 2.1, c1: [50, 888], c2: [-180, 712], size: 11, ph: 5.2},
];
/** Birds are tier C, pale and small (CRAFT §f.6: far birds pale), never the plum anchor (the anchor is W's alone). */
const BIRD = atmos(CM.coatSlate, 0.55, S1_HAZE);

function birdsInto(b: Batch, t: number, birds: BirdSpec[], liftAt: number, ceil = 600) {
  for (const s of birds) {
    const sz = s.size;
    const t0 = liftAt + s.delay;
    if (t < t0) {
      // perched: a plump body, head, tail; a peck now and then; a hop of the head
      const peck = Math.max(0, Math.sin(t * 1.3 + s.ph * 3) - 0.85) * 5;
      const by = s.y - sz * 0.3;
      const face = s.ph > 3 ? 1 : -1;
      b.fill(BIRD, ovalPath(s.x, by, sz * 0.38, sz * 0.24));
      b.fill(BIRD, ovalPath(s.x + face * sz * 0.32, by - sz * 0.2 + peck * 0.3, sz * 0.15, sz * 0.14));
      b.fill(BIRD, `M${P(s.x - face * sz * 0.28, by - sz * 0.02)}L${P(s.x - face * sz * 0.62, by + sz * 0.1)}L${P(s.x - face * sz * 0.28, by + sz * 0.12)}Z`);
      continue;
    }
    const tau = t - t0;
    const k = Math.min(1, tau / s.dur);
    if (k >= 1) continue;
    // ease: a quick climb off the perch, then the wide wheel west
    const u = 1 - Math.pow(1 - k, 1.35);
    const x = (1 - u) * (1 - u) * s.x + 2 * u * (1 - u) * s.c1[0] + u * u * s.c2[0];
    let y = (1 - u) * (1 - u) * s.y + 2 * u * (1 - u) * s.c1[1] + u * u * s.c2[1];
    y = Math.max(ceil + sz * 0.5, y);
    if (x < -40) continue;
    // heading (for the body tilt) from the curve's tangent
    const dx = 2 * (1 - u) * (s.c1[0] - s.x) + 2 * u * (s.c2[0] - s.c1[0]);
    const dy = 2 * (1 - u) * (s.c1[1] - s.y) + 2 * u * (s.c2[1] - s.c1[1]);
    const dir = dx < 0 ? -1 : 1;
    const tilt = Math.max(-0.6, Math.min(0.6, Math.atan2(dy, Math.abs(dx)) * 0.5));
    const flap = Math.sin(tau * 2 * Math.PI * 6.5 + s.ph);
    const span = sz * 1.0 * (1 - k * 0.25);
    const wy = span * 0.7 * flap;
    const bx = x;
    const by = y;
    // body (a short lens along the heading) + two wings swinging up and down + a tail
    const hx = Math.cos(tilt) * dir;
    const hy = Math.sin(tilt);
    b.fill(BIRD, `M${P(bx - hx * sz * 0.45, by - hy * sz * 0.45)}Q${P(bx - hy * sz * 0.2, by + hx * dir * sz * 0.2)} ${P(bx + hx * sz * 0.48, by + hy * sz * 0.48)}Q${P(bx + hy * sz * 0.2, by - hx * dir * sz * 0.2)} ${P(bx - hx * sz * 0.45, by - hy * sz * 0.45)}Z`);
    b.fill(BIRD, `M${P(bx - sz * 0.12, by)}Q${P(bx - span * 0.5, by - wy - sz * 0.25)} ${P(bx - span, by - wy)}L${P(bx - span * 0.55, by - wy * 0.4 + sz * 0.08)}L${P(bx + sz * 0.06, by + sz * 0.08)}Z`);
    b.fill(BIRD, `M${P(bx + sz * 0.12, by)}Q${P(bx + span * 0.5, by - wy - sz * 0.25)} ${P(bx + span, by - wy)}L${P(bx + span * 0.55, by - wy * 0.4 + sz * 0.08)}L${P(bx - sz * 0.06, by + sz * 0.08)}Z`);
  }
}

const RailBirds: React.FC = () => {
  const t = useTime();
  const b = new Batch();
  birdsInto(b, t, RAIL_BIRDS, MAP.S1_CLOCK.birdsLiftBridge);
  return <CellPaint b={b} seed="s1railbirds" cell={1000} misreg={0} live />;
};
// ---------------------------------------------------------------- two people at rest on the bridge

/** Two people at rest on the bridge's pavement, leaning on the railing (their heads and shoulders above it), at the
 *  bridge's scale (~27 px/m: the far jogger's), tier C, no lines; far from her (> 300 px), never a dark bun or a long
 *  dark coat (her look-alike rule). They replace the seated public our bank had (the orchestrator's size decision). */
const BridgePeople: React.FC = () => (
  <Tier tier="environment">
    <Person x={46} y={BRIDGE.deck} h={46} seed="s1/bridge1" ink={0} pose="stand" view="profile" flip traits={{hair: 'short', hairColor: CM.hair[3], coat: CM.sage, coatLen: 'jacket', trousers: CM.coatSlate, acc: 'none'}} />
    <Person x={238} y={BRIDGE.deck} h={44} seed="s1/bridge2" ink={0} pose="stand" view="profile" traits={{hair: 'cap', hatColor: CM.brickLight, hairColor: CM.hair[1], coat: CM.coatOat, coatLen: 'jacket', trousers: CM.line, acc: 'none'}} />
  </Tier>
);

// ---------------------------------------------------------------- the west gap

export const S1WestGap: React.FC = () => {
  const body = useMemo(() => {
    const g = bridgeBody();
    hazeBatch(g.b, [HAZE_K.bridge]);
    return g;
  }, []);
  const rail = useMemo(() => {
    const g = bridgeRail();
    hazeBatch(g.b, [HAZE_K.rail]);
    return g;
  }, []);
  return (
    <>
      <S1Plane plane={S1_PLANE.farRoofs}>
        <SunDisc />
        <FarRoofs />
      </S1Plane>
      <S1Plane plane={S1_PLANE.farTower}>
        <CalmTower />
      </S1Plane>
      <S1Plane plane={S1_PLANE.bridge}>
        <CellPaint b={body.b} seed="s1bridge/body" cell={90} misreg={0.7} />
        <Bus />
        <BridgePeople />
        <CellPaint b={rail.b} seed="s1bridge/rail" cell={90} misreg={0} />
        <RailBirds />
      </S1Plane>
    </>
  );
};

export {lerp, domePath, arc};
