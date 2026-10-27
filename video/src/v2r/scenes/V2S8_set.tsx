// V2S8 set (lane L6, builder A): THE WORLD of her lane at sunset, looking WEST down her towpath (TREATMENT section 5,
// row S8 + its bottom third; plan_L6.md sections 1-4; V2S8_clock.ts is the contract). Everything but her house row at
// the bend, the board, the people and Pip. Every part draws at the LANDING pose (35.60) and shifts by its plane's
// offset; the seam push about W (V2S8.tsx) and the un-build (Fill / Ink read the exit) wrap it all.
//   S8Sky    the low sun SUN8 (420, 640) r 40: the ONE orange                                       sky (no shift)
//   S8Far    beyond the bend: KX gasholder frames, a brick viaduct with ONE train (before the truck), a canal
//            warehouse + works chimney, terrace roofs with stacks and pots, smoke, windows switching, the far-windows
//            ripple of the lamp run, a small flock wheeling; only a calm low skyline under the sun     far 24
//   S8South  the far bank across the basin, receding to the VP: warehouses, terrace backs, blocks, autumn trees,
//            windows switching, the far towpath with tiny walkers, benches and tiny lamps               south 60
//   S8Water  the canal (the far wall + coping, reflections, ripples, glints, floating leaves, two ducks) AND THE
//            HOUSE BAND (the towpath beyond the bend, her forecourt setts, the coping to the VP with rings), drawn
//            here, UNDER S8House, so her door steps and the forecourt objects stand ON it          water 110 / house 160
//   S8Boat   the cafe boat moored along our coping (its x 0-150 strip shows at the landing: the serving hatch, a
//            chalk menu card, herb pots, the lit pigeon box, the stove chimney + smoke, bunting, the roof lights)   250
//   S8Ground the board band (towpath flagstones, the coping, a ring + the boat's rope, a drain, her house's shade)
//            and the near band (slabs, cracks with weeds, a drain, a puddle, leaves, the near lamp's pool)  250 / 320
//   S8Front  the cafe deck (planks, two little tables with chairs, mugs + steam, a folded chair, a potted bay, a
//            coiled rope, a crate of apples, a dog's bowl), the planter, the near lamp-post, big leaves drifting   320
// The lens: one camera model in metres (focal 935 px, eye 1.3 m over the towpath, VP (600, 948)) so the coping,
// the paving, the boat and the deck all recede to the lane's VP; the far bank stands 41 m off across the basin.
// The ink rule (STYLE section 3): ink #2B1B0A only, only where it carries form, never on ground, water or far
// planes; joints, lane marks and cracks are tone-on-tone FILL slivers.
import React, {useMemo} from 'react';
import {CM, INK_PX} from '../palette';
import {Fill} from '../../lib/Fill';
import {useTime} from '../../lib/time';
import {rng, rand} from '../../lib/rng';
import type {Rng} from '../../lib/rng';
import {line} from '../../lib/sketch';
import type {Pt} from '../../lib/sketch';
import {XG, mat} from '../../lib/xf';
import * as MAP from '../world/map';
import {Batch, Paint, P, r1, ovalPath, domePath, lobes, leafPath, lerp, frac, PlaneMap} from '../kit/canal/core';
import type {Quad} from '../kit/canal/core';
import {litAt, Puffs, Ducks} from '../kit/canal/life';
import {FarCrowd} from '../kit/cast/Crowd';
import type {FarSpot} from '../kit/cast/Crowd';
import {L, LANE, KERB_Y, NEAR_Y, SKYLINE_MIN_Y, lampRunAt, planeOffset} from './V2S8_clock';
import type {PlaneId} from './V2S8_clock';
import {EarlyExit} from './V2S8_exit';

// ---------------------------------------------------------------- colour: CM tokens and flat mixes of two

const rgbOf = (h: string): [number, number, number] => {
  const n = parseInt(h.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
/** A flat mix of two CM tokens (STYLE: every fill is a CM token or a flat mix of two). */
const mix = (a: string, b: string, k: number): string => {
  const A = rgbOf(a);
  const B = rgbOf(b);
  return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * k).toString(16).padStart(2, '0')).join('');
};
const TONE = {
  dab: mix(CM.paving, CM.brickLight, 0.36), // a stone one value darker
  dabPale: mix(CM.paving, CM.paper, 0.55), // a pale stone
  joint: mix(CM.paving, CM.brick, 0.4), // joints / lane marks on the sunlit paving
  shadeJoint: mix(CM.stoneShade, CM.shadeCool, 0.26),
  shadeDab: mix(CM.stoneShade, CM.glass, 0.45),
  copeJoint: mix(CM.limestone, CM.stoneShade, 0.75),
  wood: mix(CM.leafGold, CM.box, 0.42), // the cafe deck: honey boards
  wood2: mix(CM.leafGold, CM.coatMustard, 0.5),
  woodJoint: mix(CM.leafGold, CM.line, 0.5),
  woodShade: mix(CM.leafGold, CM.leafRust, 0.62),
  timber: mix(CM.line, CM.brickDeep, 0.3), // planter boards, edge boards
  timberJoint: mix(CM.line, CM.anchor, 0.35),
  sett1: mix(CM.stucco, CM.paving, 0.5),
  sett2: mix(CM.limestone, CM.stoneShade, 0.28),
  farIron: mix(CM.shadeCool, CM.stoneShade, 0.25), // gasholder iron, far
  farIron2: mix(CM.shadeCool, CM.stoneShade, 0.6),
  puddle: mix(CM.glass, CM.sky, 0.4),
};

// ---------------------------------------------------------------- the lane lens (landing pose, metres)

/** Focal length (px): her door 2.1 m = 180 px at the house front (y 1060, Z 10.85 m). */
const F = 935;
/** Eye height above the towpath (m). */
const EYE = 1.3;
const VX = LANE.vp.x;
const HY = LANE.horizonY;
/** Screen point (landing pose) of a lane point: X m right of the lens axis (- = toward the canal), h m above the
 *  towpath, Z m ahead. */
const cam = (X: number, h: number, Z: number): Pt => [VX + (F * X) / Z, HY + (F * (EYE - h)) / Z];
/** Depth (m) of the towpath under screen y; lateral X (m) of the towpath point under screen (x, y). */
const zAt = (y: number) => (F * EYE) / Math.max(0.5, y - HY);
const xAt = (x: number, y: number) => ((x - VX) * zAt(y)) / F;
/** Our coping: its water edge is the contract line (0, 1290) -> VP; the stones are 0.36 m wide. */
const COPE_X = xAt(0, LANE.copingY0);
const COPE_IN = COPE_X + 0.36;
/** The low sun ahead-left: its azimuth as dX/dZ. Shadows run toward the lens, a little right. */
const SUN_DX = (MAP.SUN8.x - VX) / F;
/** Her house's left corner on the ground (B's row starts at x ~648, ground y 1060): her house's shade line. */
const CORNER = {X: xAt(648, LANE.houseGround), Z: zAt(LANE.houseGround)};
const shadeX = (Z: number) => CORNER.X + SUN_DX * (Z - CORNER.Z);
/** Band depths. */
const Z_KERB = zAt(KERB_Y);
const Z_NEAR = zAt(NEAR_Y);
const Z_HOUSE = zAt(LANE.houseGround);
/** A ground quad (towpath level h): X0..X1 across, Zf (far) .. Zn (near). */
const gq = (X0: number, X1: number, Zf: number, Zn: number, h = 0): Pt[] => [cam(X0, h, Zf), cam(X1, h, Zf), cam(X1, h, Zn), cam(X0, h, Zn)];
/** Points along a line of constant X (a line to the VP) from Za to Zb. */
const runX = (X: number, Za: number, Zb: number, n = 12, h = 0): Pt[] => Array.from({length: n + 1}, (_, i) => cam(X, h, Za + ((Zb - Za) * i) / n));
const yOf = (Z: number) => HY + (F * EYE) / Z;

const LEAVES = [CM.leafGold, CM.leafRust, CM.coatMustard, CM.leafGold, CM.leafRust] as const;

/** Moves its children with a plane of the multiplane truck. */
const OnPlane: React.FC<{p: PlaneId; children?: React.ReactNode}> = ({p, children}) => {
  const t = useTime();
  return <XG m={mat.translate(planeOffset(p, t), 0)}>{children}</XG>;
};

/** A thin filled stroke along a polyline, tapered at its ends: joints, lane marks, cracks, stems (never ink). */
function sliver(b: Batch, col: string, pts: Pt[], w: number) {
  if (pts.length < 2) return;
  let ps = pts;
  if (ps.length === 2) ps = [ps[0], [(ps[0][0] + ps[1][0]) / 2, (ps[0][1] + ps[1][1]) / 2], ps[1]];
  const n = ps.length;
  const Lh: Pt[] = [];
  const Rh: Pt[] = [];
  for (let i = 0; i < n; i++) {
    const a = ps[Math.max(0, i - 1)];
    const c = ps[Math.min(n - 1, i + 1)];
    const dx = c[0] - a[0];
    const dy = c[1] - a[1];
    const m = Math.hypot(dx, dy) || 1;
    const wi = (w / 2) * (0.35 + 0.65 * Math.sin((Math.PI * i) / (n - 1)));
    Lh.push([ps[i][0] - (dy / m) * wi, ps[i][1] + (dx / m) * wi]);
    Rh.push([ps[i][0] + (dy / m) * wi, ps[i][1] - (dx / m) * wi]);
  }
  b.poly(col, [...Lh, ...Rh.reverse()]);
}

/** A flat lens leaf lying on the ground (foreshortened), a midrib sliver on the big ones. */
function groundLeaf(b: Batch, x: number, y: number, len: number, deg: number, col: string) {
  b.fill(col, leafPath(x, y, len, len * 0.2, deg));
  if (len > 20) b.fill(col === CM.leafRust ? CM.line : CM.leafRust, leafPath(x, y, len * 0.78, len * 0.022, deg));
}

/** Leaves scattered on the towpath between depths Zf..Zn and laterals X0(Z)..X1(Z); sizes in metres. */
function scatterLeaves(b: Batch, r: Rng, n: number, Zf: number, Zn: number, X0: (Z: number) => number, X1: (Z: number) => number, size: [number, number], keep?: (x: number, y: number) => boolean) {
  for (let i = 0; i < n; i++) {
    const y = lerp(yOf(Zf), yOf(Zn), r.next());
    const Z = zAt(y);
    const X = lerp(X0(Z), X1(Z), r.next());
    const [x] = cam(X, 0, Z);
    const len = r.range(size[0], size[1]) * (F / Z);
    const deg = r.range(-38, 38);
    const col = r.pick(LEAVES);
    if (keep && !keep(x, y)) continue;
    groundLeaf(b, x, y, len, deg, col);
  }
}

// ---------------------------------------------------------------- paving (courses of stones)

type Course = {Zf: number; Zn: number};
/** Courses across the lane from Zfar to Znear; each depth in metres (seeded). */
function courses(seed: string, Zfar: number, Znear: number, d: [number, number]): Course[] {
  const r = rng(seed);
  const out: Course[] = [];
  let z = Zfar;
  let guard = 0;
  while (z > Znear + 1e-6 && guard++ < 300) {
    let zn = z - r.range(d[0], d[1]);
    if (zn - Znear < d[0] * 0.6) zn = Znear;
    out.push({Zf: z, Zn: zn});
    z = zn;
  }
  return out;
}

type Seg = [Pt, Pt];
type PaveOut = {dabs: {q: Pt[]; c: [number, number]; pale: boolean}[]; joints: {s: Seg; c: [number, number]}[]};

/** Lays stones in courses between X0(Z)..X1(Z): returns dabs (some stones one value darker / paler, inset) and joint
 *  segments (each stone's far edge and left edge, broken), drawn later as fill slivers in sun or shade tones. */
function pave(seed: string, cs: Course[], X0: (Z: number) => number, X1: (Z: number) => number, w: [number, number], dabShare = 0.32): PaveOut {
  const r = rng(`${seed}/stones`);
  const out: PaveOut = {dabs: [], joints: []};
  for (const c of cs) {
    const Xa = Math.min(X0(c.Zn), X0(c.Zf)) - 0.05;
    const Xb = Math.max(X1(c.Zn), X1(c.Zf)) + 0.05;
    let X = Xa - r.range(0, w[1]);
    const zm = (c.Zf + c.Zn) / 2;
    while (X < Xb) {
      const sw = r.range(w[0], w[1]);
      const X2 = X + sw;
      const ctr = cam(X + sw / 2, 0, zm);
      const k = r.next();
      const lo = Math.max(X, X0(zm));
      const hi = Math.min(X2, X1(zm));
      if (hi > lo && k < dabShare) {
        const ix = Math.min(0.05, sw * 0.12) + r.range(0, 0.04);
        const iz = Math.min(0.05, (c.Zf - c.Zn) * 0.14) + r.range(0, 0.03);
        const q = gq(lo + ix, hi - ix * r.range(0.6, 1.4), c.Zf - iz, c.Zn + iz * r.range(0.6, 1.3));
        out.dabs.push({q, c: ctr, pale: k < dabShare * 0.35});
      }
      // the far edge (a short run, broken) and the left edge (a short run toward the VP)
      const e0 = Math.max(X, X0(c.Zf));
      const e1 = Math.min(X2, X1(c.Zf));
      if (e1 > e0 && r.chance(0.78)) {
        const a = cam(e0 + (e1 - e0) * r.range(0.03, 0.2), 0, c.Zf);
        const z = cam(e0 + (e1 - e0) * r.range(0.78, 0.97), 0, c.Zf);
        out.joints.push({s: [a, z], c: [(a[0] + z[0]) / 2, a[1]]});
      }
      if (X > X0(c.Zn) && X < X1(c.Zn) && r.chance(0.7)) {
        const a = cam(X, 0, c.Zf - (c.Zf - c.Zn) * r.range(0.05, 0.2));
        const z = cam(X, 0, c.Zn + (c.Zf - c.Zn) * r.range(0.04, 0.18));
        out.joints.push({s: [a, z], c: [(a[0] + z[0]) / 2, (a[1] + z[1]) / 2]});
      }
      X = X2;
    }
  }
  return out;
}

/** Draws a paving's dabs and joint slivers, in shade tones where inShade(x, y). Joint width grows with depth. */
function paveInto(b: Batch, pv: PaveOut, inShade: (x: number, y: number) => boolean, jw: (y: number) => number) {
  for (const d of pv.dabs) {
    const sh = inShade(d.c[0], d.c[1]);
    b.poly(sh ? TONE.shadeDab : d.pale ? TONE.dabPale : TONE.dab, d.q);
  }
  for (const j of pv.joints) sliver(b, inShade(j.c[0], j.c[1]) ? TONE.shadeJoint : TONE.joint, j.s, jw(j.c[1]));
}

/** A drain grate on the ground: an iron frame and its slots (fills), foreshortened; x, y = centre of its far edge. */
function grateInto(b: Batch, cx: number, Zf: number, wM: number, dM: number, seed: string) {
  const X = xAt(cx, yOf(Zf));
  const q = gq(X - wM / 2, X + wM / 2, Zf, Zf - dM);
  b.poly(CM.paneUnlit, q);
  const n = 7;
  for (let k = 0; k < n; k++) {
    const a = X - wM / 2 + (wM * (k + 0.25)) / n;
    b.poly(CM.stoneShade, gq(a, a + (wM / n) * 0.45, Zf - dM * 0.12, Zf - dM * 0.88));
  }
  b.poly(TONE.dab, gq(X - wM / 2 - 0.03, X + wM / 2 + 0.03, Zf - dM - 0.0, Zf - dM - 0.035));
  void seed;
}

// ================================================================= S8Sky (the sun, the ONE orange)

/** The disc sits 15 px higher than map SUN8 (420, 640): L5's StatementBoard frame tops out at y 680 (20 px above B), so
 *  SUN8's bottom (680) touched it; TREATMENT: the S8 sun never touches her board (REQUEST K2: SUN8 -> (420, 625)). Top
 *  585 (the named sun exception, >= 575; 579 under the 1.05 push). */
export const S8_SUN = {x: MAP.SUN8.x, y: 625, r: MAP.SUN8.r} as const;
export const S8Sky: React.FC = () => <Fill d={ovalPath(S8_SUN.x, S8_SUN.y, S8_SUN.r, S8_SUN.r)} color={CM.sun} offset={false} seed="s8sun" />;

// ================================================================= S8Far (beyond the bend; far plane 24)

type Win = {x: number; y: number; w: number; h: number; arch?: boolean};

/** The calm zone round the sun (far-plane x at the landing AND before the truck, -24): only the low far skyline. */
const CALM: [number, number] = [346, 532];

/** One row of far buildings: walls, slate / brick roofs (pitched, mansard with dormers, gable, flat with a coping),
 *  chimney stacks with pots, window grids (returned: their lit state is drawn per frame). Never above SKYLINE_MIN_Y. */
function farRowInto(
  b: Batch,
  o: {x0: number; x1: number; base: number; top: (x: number) => number; seed: string; walls: string[]; roofs: string[]; w: [number, number]; win: number; winTo: number; stack: number; skip?: [number, number]},
): Win[] {
  const r = rng(o.seed);
  const wins: Win[] = [];
  let x = o.x0 - r.range(0, o.w[1] * 0.5);
  let i = 0;
  while (x < o.x1) {
    const w = r.range(o.w[0], o.w[1]);
    if (o.skip && x + w > o.skip[0] && x < o.skip[1]) {
      x = Math.max(x + 4, o.skip[1]);
      continue;
    }
    const kind = r.weighted([
      ['pitch', 4],
      ['mansard', 2],
      ['flat', 2],
      ['gable', 1],
    ] as const);
    const rh = Math.min(w * 0.3, 19);
    const apex = kind === 'gable' ? rh * 1.15 : kind === 'flat' ? 3 : rh;
    const top = Math.max(o.top(x + w / 2) + r.jitter(4), SKYLINE_MIN_Y + 3 + apex);
    const wall = o.walls[i % o.walls.length];
    const roof = r.pick(o.roofs);
    b.rect(wall, x, top, w + 0.8, o.base - top);
    if (kind === 'pitch') b.poly(roof, [[x - 1.5, top], [x + w * 0.13, top - rh], [x + w * 0.87, top - rh], [x + w + 1.5, top]]);
    else if (kind === 'mansard') {
      b.poly(roof, [[x - 1, top], [x + w * 0.09, top - rh], [x + w * 0.91, top - rh], [x + w + 1, top]]);
      const nd = Math.max(1, Math.floor(w / 20));
      for (let k = 0; k < nd; k++) b.rect(CM.paper, x + (w * (k + 0.5)) / nd - w * 0.05, top - rh * 0.72, Math.max(3, w * 0.1), rh * 0.5);
    } else if (kind === 'gable') b.poly(roof, [[x - 2, top], [x + w / 2, top - rh * 1.15], [x + w + 2, top]]);
    else b.rect(CM.limestone, x - 1.5, top - 3, w + 3, 3);
    if (o.stack > 0 && kind !== 'flat') {
      const ns = r.chance(0.45) ? 2 : 1;
      for (let k = 0; k < ns; k++) {
        const cx = x + w * (ns === 1 ? r.range(0.3, 0.7) : k ? r.range(0.72, 0.88) : r.range(0.12, 0.28));
        const cw = r.range(0.7, 1.15) * o.stack;
        const chh = r.range(0.9, 1.5) * o.stack;
        const ct = Math.max(SKYLINE_MIN_Y + 7, top - rh * 0.75 - chh);
        b.rect(wall === CM.brick ? CM.brickLight : CM.brick, cx - cw / 2, ct, cw, top - ct);
        b.rect(CM.limestone, cx - cw / 2 - 1, ct, cw + 2, Math.max(1.5, o.stack * 0.2));
        const pots = Math.max(1, Math.round(cw / 5));
        for (let p = 0; p < pots; p++) b.rect(r.chance(0.5) ? CM.leafRust : CM.brickDeep, cx - cw / 2 + 1 + (p * (cw - 2)) / pots, Math.max(SKYLINE_MIN_Y + 1, ct - 4), Math.max(1.6, (cw - 2) / pots - 1.2), 4);
      }
    }
    if (o.win > 0) {
      const ww = o.win;
      const cols = Math.max(1, Math.floor((w - ww) / (ww * 2.3)));
      for (let wy = top + ww * 1.1; wy + ww * 1.5 < Math.min(o.base, o.winTo); wy += ww * 2.6) {
        for (let c = 0; c < cols; c++) wins.push({x: x + (w - cols * ww * 2.3) / 2 + c * ww * 2.3 + ww * 0.65, y: wy, w: ww, h: ww * 1.5});
      }
    }
    x += w;
    i++;
  }
  return wins;
}

/** A King's-Cross gasholder guide frame seen from below and far off: columns round a circle (cosine spacing), ring
 *  girders as flat ellipses (the near arc on top), a lattice in each tier, the drum inside if any. Fills only. */
function gasholderOwn(b: Batch, cx: number, top: number, base: number, r: number, seed: string, o: {drum?: number; tiers?: number} = {}) {
  const tiers = o.tiers ?? 4;
  const ry = r * 0.09;
  const cw = Math.max(2.4, r * 0.05);
  const gw = Math.max(2.2, r * 0.042);
  const H = base - top;
  const ringY = (k: number) => top + (H * k) / (tiers + 0.35);
  if (o.drum) {
    const dt = base - H * o.drum;
    b.poly(CM.limestone, [[cx - r * 0.93, dt], [cx + r * 0.93, dt], [cx + r * 0.93, base], [cx - r * 0.93, base]]);
    b.fill(CM.stucco, ovalPath(cx, dt, r * 0.93, ry * 0.9));
    b.rect(CM.stoneShade, cx + r * 0.52, dt, r * 0.41, base - dt);
  }
  // the back arcs of the rings (thin, paler) behind everything
  for (let k = 0; k <= tiers; k++) {
    const y = ringY(k);
    const pts: Pt[] = [];
    for (let a = 0; a <= 20; a++) pts.push([cx + Math.cos((a / 20) * Math.PI) * r, y + Math.sin((a / 20) * Math.PI) * ry]);
    sliver(b, TONE.farIron2, pts, gw * 0.7);
  }
  // columns (front and back coincide in x: one bar each), the two edge columns doubled
  const n = 12;
  for (let k = 0; k <= n / 2; k++) {
    const x = cx - Math.cos((k / (n / 2)) * Math.PI) * r;
    const edge = k === 0 || k === n / 2;
    b.rect(TONE.farIron, x - (edge ? cw * 0.7 : cw / 2), top - ry * 0.4, edge ? cw * 1.4 : cw, base - top + ry * 0.4);
  }
  // the lattice: one diagonal pair per bay per tier (front bays only)
  const r2 = rng(seed);
  for (let k = 0; k < tiers; k++) {
    const y0 = ringY(k);
    const y1 = ringY(k + 1);
    for (let j = 0; j < n / 2; j++) {
      const xa = cx - Math.cos((j / (n / 2)) * Math.PI) * r;
      const xb = cx - Math.cos(((j + 1) / (n / 2)) * Math.PI) * r;
      const sag = (a: number) => -Math.sin(a) * ry;
      const ya = sag((j / (n / 2)) * Math.PI);
      const yb = sag(((j + 1) / (n / 2)) * Math.PI);
      if (r2.chance(0.92)) sliver(b, TONE.farIron2, [[xa, y0 + ya], [xb, y1 + yb]], Math.max(1.2, cw * 0.42));
      if (r2.chance(0.92)) sliver(b, TONE.farIron2, [[xb, y0 + yb], [xa, y1 + ya]], Math.max(1.2, cw * 0.42));
    }
  }
  // the front arcs of the rings (on top), the crown ring heavier
  for (let k = 0; k <= tiers; k++) {
    const y = ringY(k);
    const pts: Pt[] = [];
    for (let a = 0; a <= 24; a++) pts.push([cx - Math.cos((a / 24) * Math.PI) * (r + cw * 0.5), y - Math.sin((a / 24) * Math.PI) * ry]);
    sliver(b, TONE.farIron, pts, k === 0 ? gw * 1.5 : gw);
  }
}

/** The canal warehouse beyond the bend (left of the calm zone): brick, a stone cornice, arched windows, the
 *  loading-door column with a hoist beam; and the slim works chimney beside it (it smokes). */
const WARE = {x0: 244, x1: 330, top: 624, col: [256, 281, 306] as const, rows: [640, 671, 702, 733] as const, chim: {x: 338, w: 10, top: 650}};

/** The far-windows ripple (lampRunAt('farWindows') + 0.04 s each, spreading from the lane's end outward): six sash
 *  windows of the terrace right of the sun, clear of the board's top and of the lamp heads above it. */
const RIPPLE: Win[] = [
  {x: 621, y: 664, w: 8, h: 12},
  {x: 601, y: 668, w: 8, h: 12},
  {x: 581, y: 662, w: 8, h: 12},
  {x: 561, y: 666, w: 8, h: 12},
  {x: 543, y: 660, w: 8, h: 12},
  {x: 543, y: 684, w: 8, h: 11},
];
const archPath = (x: number, y: number, w: number, h: number) => `M${P(x, y + h)}L${P(x, y + w / 2)}A${r1(w / 2)} ${r1(w / 2)} 0 0 1 ${P(x + w, y + w / 2)}L${P(x + w, y + h)}Z`;
const rectPathS = (x: number, y: number, w: number, h: number) => `M${P(x, y)}H${r1(x + w)}V${r1(y + h)}H${r1(x)}Z`;
/** No generated window under a ripple window (they are drawn on their own). */
const clearOfRipple = (w: Win) => !RIPPLE.some((q) => w.x < q.x + q.w + 3 && w.x + w.w > q.x - 3 && w.y < q.y + q.h + 3 && w.y + w.h > q.y - 3);

/** The one train over the viaduct: crosses left -> right before the truck, into the warehouse's lee (clipped). */
const VIA = {x0: -140, x1: 244, deck: 668, base: 772, pitch: 34};
const TRAIN = {x0: -140, x1: 244, h: 10, t0: L(33.25), speed: 150};

type FarLayout = {back: Batch; front: Batch; fb: Win[]; fm: Win[]; fn: Win[]};

function farLayout(): FarLayout {
  const back = new Batch();
  // FB: the low far skyline across the whole width (stone shade, no ink), very low under the sun
  const fb = farRowInto(back, {
    x0: -110,
    x1: 760,
    base: 962,
    top: (x) => (x > CALM[0] - 10 && x < CALM[1] + 10 ? 700 : x < CALM[0] ? 690 : 676),
    seed: 's8far/fb',
    walls: [CM.stoneShade, CM.stoneShade, mix(CM.stoneShade, CM.limestone, 0.5), CM.stoneShade],
    roofs: [mix(CM.stoneShade, CM.shadeCool, 0.25)],
    w: [18, 44],
    win: 3,
    winTo: 950,
    stack: 4,
  });
  back.layer();
  // the King's-Cross gasholder triplet (one with its drum), behind the viaduct
  gasholderOwn(back, -46, 622, 820, 54, 's8gas3');
  gasholderOwn(back, 74, 612, 830, 64, 's8gas1', {drum: 0.62});
  gasholderOwn(back, 196, 630, 820, 46, 's8gas2', {tiers: 4});
  back.layer();
  // the brick viaduct (fills: deck, stone coping, piers, arches whose openings show the far skyline through)
  const {x0, x1, deck, base, pitch} = VIA;
  const dh = 11;
  back.rect(CM.brick, x0, deck, x1 - x0, dh);
  back.rect(CM.limestone, x0, deck - 3, x1 - x0, 3);
  back.rect(CM.brickDeep, x0, deck + dh - 2, x1 - x0, 2);
  for (let x = x0; x < x1; x += pitch) {
    const pw = pitch * 0.26;
    back.rect(CM.brick, x, deck + dh - 1, pw, base - deck - dh + 1);
    const ax = x + pw;
    const aw = pitch - pw;
    back.fill(CM.brick, `M${P(ax, deck + dh - 1)}L${P(ax + aw, deck + dh - 1)}L${P(ax + aw, deck + dh + aw * 0.55)}A${r1(aw / 2)} ${r1(aw / 2)} 0 0 0 ${P(ax, deck + dh + aw * 0.55)}Z`);
    back.rect(CM.brickDeep, x + pw * 0.15, deck + dh + aw * 0.5, pw * 0.7, 2);
  }
  const front = new Batch();
  // FM: mid buildings (limestone / stucco / light brick), small windows
  const fm = farRowInto(front, {
    x0: 236,
    x1: 760,
    base: 962,
    top: (x) => 652 + Math.sin(x * 0.07) * 6,
    seed: 's8far/fm',
    walls: [CM.limestone, CM.stucco, CM.brickLight, CM.stucco],
    roofs: [CM.stoneShade, CM.shadeCool, CM.brickLight],
    w: [26, 54],
    win: 5,
    winTo: 800,
    stack: 7,
    skip: CALM,
  });
  front.layer();
  // the canal warehouse + the works chimney
  front.rect(CM.brickDeep, WARE.x0, WARE.top, WARE.x1 - WARE.x0, 962 - WARE.top);
  front.rect(CM.limestone, WARE.x0 - 3, WARE.top - 4, WARE.x1 - WARE.x0 + 6, 5);
  front.rect(CM.brick, WARE.x0, WARE.top + 1, WARE.x1 - WARE.x0, 7);
  front.rect(CM.stucco, WARE.x0 + 9, WARE.top + 9, WARE.x1 - WARE.x0 - 18, 5);
  for (const y of WARE.rows) {
    front.rect(CM.line, WARE.col[1] - 1, y - 1, 14, 22); // loading doors
    front.rect(CM.coatMustard, WARE.col[1], y + 9, 12, 2);
    for (const cx of [WARE.col[0], WARE.col[2]]) front.rect(CM.limestone, cx - 1.5, y + 19, 14, 2.4);
  }
  front.rect(CM.anchor, WARE.col[1] + 4, WARE.top - 1, 4, 10); // hoist beam + its chain
  front.rect(CM.anchor, WARE.col[1] + 4, WARE.top + 3, 16, 3);
  front.rect(CM.anchor, WARE.col[1] + 17.5, WARE.top + 6, 1.2, 16);
  const c = WARE.chim;
  front.poly(CM.brick, [[c.x - c.w / 2, c.top], [c.x + c.w / 2, c.top], [c.x + c.w / 2 + 2, 962], [c.x - c.w / 2 - 2, 962]]);
  front.rect(CM.limestone, c.x - c.w / 2 - 1, c.top + 6, c.w + 2, 3);
  front.rect(CM.brickDeep, c.x - c.w / 2 - 1, c.top, c.w + 2, 4);
  front.layer();
  // FN right: the terrace right of the sun (brick, slate, stacks + pots)
  const fn = farRowInto(front, {
    x0: CALM[1],
    x1: 760,
    base: 962,
    top: (x) => 640 + Math.sin(x * 0.05) * 6,
    seed: 's8far/fn',
    walls: [CM.brick, CM.brickLight, CM.brickDeep, CM.brick, CM.stucco],
    roofs: [CM.shadeCool, CM.brickDeep, CM.shadeCool],
    w: [30, 50],
    win: 8,
    winTo: 800,
    stack: 9,
  });
  // one taller stack that smokes (x 594)
  front.rect(CM.brickLight, 589, 628, 11, 22);
  front.rect(CM.limestone, 588, 628, 13, 2);
  for (let p = 0; p < 2; p++) front.rect(p ? CM.leafRust : CM.brickDeep, 590 + p * 5, 623, 4, 5);
  return {back, front, fb, fm, fn};
}

/** Windows into a batch at t: lit (lamp, a few core-bright) or unlit (slate pane with a pale sky glint). */
function winsInto(b: Batch, wins: Win[], t: number, seed: string, litFrac: number, o: {unlit?: boolean; gap?: [number, number]; keep?: (w: Win) => boolean} = {}) {
  const n = wins.length;
  for (let k = 0; k < n; k++) {
    const w = wins[k];
    if (o.keep && !o.keep(w)) continue;
    const on = litAt(t, seed, k, n, {litFrac, gap: o.gap ?? [0.5, 1.4]});
    const d = w.arch ? archPath(w.x, w.y, w.w, w.h) : rectPathS(w.x, w.y, w.w, w.h);
    if (on) b.fill(rand(seed, `c${k}`) < 0.25 ? CM.lampCore : CM.lamp, d);
    else if (o.unlit !== false) {
      b.fill(CM.paneUnlit, d);
      if (w.w >= 5) b.rect(CM.glass, w.x, w.y + (w.arch ? w.w / 2 : 0), w.w, Math.max(1, w.h * 0.22));
    }
  }
}

/** A small flock wheeling low over the gasholders (left of the sun; flat, wings flapping). */
function flockInto(b: Batch, t: number) {
  for (let i = 0; i < 5; i++) {
    const ph = rand('s8flock', i) * 6.28;
    const a = (t / 7.2) * 2 * Math.PI + i * 0.62;
    const x = 150 + Math.cos(a) * 60 + Math.sin(a * 2 + ph) * 7;
    const y = 638 + Math.sin(a) * 12 + Math.cos(a * 3 + ph) * 3;
    const s = 6.5 + rand('s8flock', `s${i}`) * 2.5;
    const f = Math.sin(t * 12.5 + ph);
    b.fill(CM.shadeWarm, `M${P(x - s, y - f * s * 0.5)}Q${P(x - s * 0.4, y - s * 0.12)} ${P(x, y + s * 0.14)}Q${P(x + s * 0.4, y - s * 0.12)} ${P(x + s, y - f * s * 0.5)}L${P(x + s * 0.42, y - f * s * 0.2 + s * 0.16)}L${P(x, y + s * 0.34)}L${P(x - s * 0.42, y - f * s * 0.2 + s * 0.16)}Z`);
  }
}

/** The train: five cars (stone, slate window band, a mustard lead car), clipped to the viaduct's visible run. */
function trainInto(b: Batch, t: number) {
  const {x0, x1, h, t0, speed} = TRAIN;
  const deck = VIA.deck - 3;
  const cw = h * 3.6;
  const gap = 2.2;
  const n = 5;
  const head = x0 + (t - t0) * speed;
  if (t < t0 || head - n * (cw + gap) > x1) return;
  for (let k = 0; k < n; k++) {
    const f = head - k * (cw + gap);
    const a = Math.max(x0, f - cw);
    const z = Math.min(x1, f);
    if (z <= a) continue;
    b.rect(k === 0 ? CM.coatMustard : CM.limestone, a, deck - h, z - a, h - 1);
    const wa = Math.max(a, f - cw + 3);
    const wz = Math.min(z, f - 3);
    if (wz > wa) b.rect(CM.paneUnlit, wa, deck - h * 0.74, wz - wa, h * 0.32);
    b.rect(CM.shadeCool, a, deck - 1.4, z - a, 1.4);
  }
}

export const S8Far: React.FC = () => {
  const t = useTime();
  const lay = useMemo(farLayout, []);
  const backEl = useMemo(() => <Paint b={lay.back} seed="s8far/back" misreg={false} />, [lay]);
  const frontEl = useMemo(() => <Paint b={lay.front} seed="s8far/front" />, [lay]);
  // per frame: the train, the windows (switching), the ripple, the flock
  const tr = new Batch();
  trainInto(tr, t);
  const wb = new Batch();
  winsInto(wb, lay.fb, t, 's8far/fbw', 0.18, {unlit: false, gap: [0.6, 1.6]});
  const wm = new Batch();
  winsInto(wm, lay.fm, t, 's8far/fmw', 0.42, {keep: clearOfRipple});
  const wn = new Batch();
  winsInto(wn, lay.fn, t, 's8far/fnw', 0.45, {keep: clearOfRipple});
  const ware: Win[] = [];
  for (const y of WARE.rows) for (const cx of [WARE.col[0], WARE.col[2]]) ware.push({x: cx, y, w: 11, h: 19, arch: true});
  winsInto(wn, ware, t, 's8far/warew', 0.4);
  const rip0 = lampRunAt('farWindows');
  RIPPLE.forEach((w, i) => {
    const on = t >= rip0 + i * 0.04;
    wn.rect(CM.paper, w.x - 1, w.y - 1, w.w + 2, w.h + 2);
    wn.fill(on ? (i % 2 ? CM.lamp : CM.lampCore) : CM.paneUnlit, rectPathS(w.x, w.y, w.w, w.h));
    if (!on) wn.rect(CM.glass, w.x, w.y, w.w, w.h * 0.22);
    wn.rect(CM.limestone, w.x - 1.5, w.y + w.h, w.w + 3, 1.8);
  });
  const fl = new Batch();
  flockInto(fl, t);
  return (
    <OnPlane p="far">
      {backEl}
      <Paint b={wb} seed="s8far/fbwin" misreg={false} />
      <Paint b={tr} seed="s8far/train" misreg={false} />
      {frontEl}
      <Paint b={wm} seed="s8far/fmwin" misreg={false} />
      <Paint b={wn} seed="s8far/fnwin" misreg={false} />
      <EarlyExit>
        <Puffs x={WARE.chim.x} y={WARE.chim.top - 2} seed="s8far/smoke1" kind="smoke" scale={0.42} drift={-20} ceil={610} />
        <Puffs x={594} y={622} seed="s8far/smoke2" kind="smoke" scale={0.3} drift={-14} ceil={610} />
        <Paint b={fl} seed="s8far/flock" misreg={false} />
      </EarlyExit>
    </OnPlane>
  );
};

// ================================================================= S8South (the far bank across the basin; 60)

/** The far bank's facade line stands D m off to the left, its towpath a little above our eye: base y at screen x,
 *  px per metre at screen x, screen x of depth Z. */
const SB_D = 41;
const sbBase = (x: number) => HY - 10 * ((VX - x) / VX);
const sbS = (x: number) => Math.max(0.05, (VX - x) / SB_D);
const sbX = (Z: number) => VX - (F * SB_D) / Z;
const kOf = (x: number) => Math.max(0, (VX - x) / VX);

type SBld = {x0: number; x1: number; w: number; H: number; kind: 'ware' | 'terr' | 'block'; wall: string; pm: PlaneMap; seed: string};
type STree = {x: number; y: number; s: number; seed: string};
type SLamp = {x: number; y: number; s: number};

/** The far bank's layout (screen px at the landing, south plane): buildings along the bank from x -260 to the VP. */
const SOUTH = (() => {
  const r = rng('s8south/layout');
  const blds: SBld[] = [];
  const trees: STree[] = [];
  const lamps: SLamp[] = [];
  let Z = 44;
  let i = 0;
  while (Z < 2400) {
    const kind = r.weighted([
      ['ware', 3],
      ['terr', 5],
      ['block', 2],
    ] as const);
    const w = kind === 'ware' ? r.range(11, 16) : kind === 'terr' ? r.range(5.2, 7.4) : r.range(9, 12);
    const H = kind === 'ware' ? r.range(13, 15.5) : kind === 'terr' ? r.range(10, 12) : r.range(11, 13.5);
    const x0 = sbX(Z);
    const x1 = sbX(Z + w);
    const quad: Quad = [
      [x0, sbBase(x0) - H * sbS(x0)],
      [x1, sbBase(x1) - H * sbS(x1)],
      [x1, sbBase(x1)],
      [x0, sbBase(x0)],
    ];
    const wall = kind === 'ware' ? r.pick([CM.brickDeep, CM.brick]) : kind === 'terr' ? r.pick([CM.brickLight, CM.brick, CM.brickLight, CM.stucco]) : r.pick([CM.stucco, CM.limestone]);
    blds.push({x0, x1, w, H, kind, wall, pm: new PlaneMap(w, H, quad), seed: `s8sb${i}`});
    Z += w;
    i++;
  }
  // autumn trees on the far towpath every ~20 m (some skipped), tiny lamps every 24 m
  for (let z = 50; z < 900; z += r.range(16, 26)) {
    if (r.chance(0.35)) continue;
    const x = sbX(z);
    trees.push({x, y: sbBase(x), s: sbS(x), seed: `s8sbt${Math.round(z)}`});
  }
  for (let z = 47; z < 1200; z += 24) {
    const x = sbX(z);
    lamps.push({x, y: sbBase(x), s: sbS(x)});
  }
  return {blds, trees, lamps};
})();

/** A facade's windows in local metres: rows of arched (warehouse), sash (terrace) or wide (block) windows. */
function sbWindows(bl: SBld): {q: Pt[]; arch: boolean}[] {
  const out: {q: Pt[]; arch: boolean}[] = [];
  const st = bl.kind === 'terr' ? 3.0 : bl.kind === 'ware' ? 3.3 : 2.9;
  const ww = bl.kind === 'block' ? 1.6 : bl.kind === 'ware' ? 1.15 : 0.95;
  const wh = bl.kind === 'block' ? 1.3 : bl.kind === 'ware' ? 1.75 : 1.55;
  const bay = bl.kind === 'block' ? 2.6 : bl.kind === 'ware' ? 2.5 : 2.3;
  const cols = Math.max(1, Math.floor((bl.w - 0.6) / bay));
  const u0 = (bl.w - cols * bay) / 2 + (bay - ww) / 2;
  for (let v = bl.H - 1.0 - wh; v > 1.3; v -= st) {
    for (let c = 0; c < cols; c++) {
      if (bl.kind === 'ware' && c === Math.floor(cols / 2)) continue; // the loading doors
      out.push({q: bl.pm.q(u0 + c * bay, v, ww, wh), arch: bl.kind === 'ware'});
    }
  }
  return out;
}

/** Is a far-bank span ever on screen? (the strip left of the board near the landing, the gap before the truck) */
const sbSeen = (x0: number, x1: number) => x1 > -60 && (x0 < 170 || x1 > 425);
const SB_SEEN_WINS = (() => {
  const out: {q: Pt[]; arch: boolean}[] = [];
  for (const bl of SOUTH.blds) if (bl.x0 < VX - 2 && sbSeen(bl.x0, bl.x1) && sbS(bl.x0) > 1.5) out.push(...sbWindows(bl));
  return out;
})();

export const S8South: React.FC = () => {
  const t = useTime();
  const stat = useMemo(() => {
    const b = new Batch();
    // facades, far first (the near ones overlap them toward the VP)
    for (let k = SOUTH.blds.length - 1; k >= 0; k--) {
      const bl = SOUTH.blds[k];
      if (bl.x0 > VX - 2) continue;
      const pm = bl.pm;
      b.poly(bl.wall, pm.q(0, 0, bl.w, bl.H));
      const s = sbS(bl.x0);
      if (bl.kind === 'ware') {
        b.poly(CM.limestone, pm.q(-0.1, 0, bl.w + 0.2, 0.45));
        b.poly(CM.stucco, pm.q(bl.w * 0.15, 0.8, bl.w * 0.7, 0.7));
        b.poly(CM.line, pm.q(bl.w / 2 - 0.65, 1.0, 1.3, bl.H - 1.0)); // loading doors column
        b.poly(CM.anchor, pm.q(bl.w / 2 - 0.08, 0.4, 0.16, 0.9));
        b.poly(CM.anchor, pm.q(bl.w / 2 - 0.08, 0.5, 1.4, 0.18));
      } else if (bl.kind === 'terr') {
        // the eaves, two chimney stacks on the party walls with pots, a drainpipe
        b.poly(CM.stoneShade, pm.q(-0.1, 0, bl.w + 0.2, 0.3));
        for (const u of [0.15, bl.w - 0.85]) {
          b.poly(bl.wall === CM.brick ? CM.brickLight : CM.brick, pm.q(u, -1.3, 0.7, 1.3));
          if (s > 3) {
            b.poly(CM.leafRust, pm.q(u + 0.08, -1.55, 0.22, 0.28));
            b.poly(CM.brickDeep, pm.q(u + 0.42, -1.5, 0.22, 0.24));
          }
        }
        b.poly(CM.paneUnlit, pm.q(bl.w - 0.3, 0.3, 0.1, bl.H - 0.3));
      } else {
        // a block with balconies (slab + rail) on each floor
        b.poly(CM.limestone, pm.q(-0.1, 0, bl.w + 0.2, 0.4));
        for (let v = 2.7; v < bl.H - 1; v += 2.9) {
          b.poly(CM.limestone, pm.q(0.4, v, bl.w - 0.8, 0.22));
          b.poly(CM.line, pm.q(0.4, v - 0.85, bl.w - 0.8, 0.07));
        }
      }
      // windows off the screen strips: a fixed lit pattern (static)
      if (!sbSeen(bl.x0, bl.x1) && s > 1.5) {
        sbWindows(bl).forEach((w, j) => b.poly(rand(bl.seed, j) < 0.35 ? CM.lamp : CM.paneUnlit, w.q));
      }
    }
    b.layer();
    // the far towpath strip (a thin pale band) under the facades
    const tp: Pt[] = [];
    for (let x = -280; x <= VX; x += 40) tp.push([x, sbBase(x) - 1.5 * kOf(x)]);
    for (let x = VX; x >= -280; x -= 40) tp.push([x, sbBase(x) + 4.5 * kOf(x)]);
    b.poly(CM.paving, tp);
    // trees in front (crowns of sage / gold / rust lobes on a trunk)
    for (const tr of SOUTH.trees) {
      if (tr.x > VX - 6) continue;
      const s = tr.s;
      const R = 2.6 * s;
      const cy = tr.y - 6.6 * s;
      const r = rng(tr.seed);
      b.poly(CM.line, [[tr.x - 0.18 * s, tr.y], [tr.x - 0.1 * s, cy], [tr.x + 0.1 * s, cy], [tr.x + 0.18 * s, tr.y]]);
      const cols = [CM.sage, CM.leafGold, CM.leafRust, CM.sage];
      b.fill(r.pick(cols), lobes(tr.x - R, tr.x + R, cy + R * 0.85, R * 1.7, `${tr.seed}/a`, 4));
      b.fill(r.pick([CM.leafGold, CM.coatMustard, CM.leafRust]), lobes(tr.x - R * 0.75, tr.x + R * 0.2, cy + R * 0.2, R * 0.95, `${tr.seed}/b`, 3));
    }
    // benches on the far towpath in the strip
    for (const z of [58, 81]) {
      const x = sbX(z);
      const s = sbS(x);
      const y = sbBase(x);
      b.rect(CM.line, x - 0.8 * s, y - 0.5 * s, 1.6 * s, 0.12 * s);
      b.rect(CM.line, x - 0.8 * s, y - 0.9 * s, 1.6 * s, 0.1 * s);
    }
    return b;
  }, []);
  const statEl = useMemo(() => <Paint b={stat} seed="s8south" misreg={false} />, [stat]);
  // per frame: the windows on screen switch; the tiny lamps light after the far-windows ripple
  const wb = new Batch();
  const n = SB_SEEN_WINS.length;
  SB_SEEN_WINS.forEach((w, k) => {
    const on = litAt(t, 's8south/win', k, n, {litFrac: 0.38, gap: [0.45, 1.2]});
    wb.poly(on ? (rand('s8sbw', k) < 0.3 ? CM.lampCore : CM.lamp) : CM.paneUnlit, w.q);
  });
  const lamp0 = lampRunAt('farWindows') + RIPPLE.length * 0.04 + 0.04;
  const lb = new Batch();
  SOUTH.lamps.forEach((lp, i) => {
    if (lp.x > VX - 8) return;
    const s = lp.s;
    const lit = t >= lamp0 + i * 0.03;
    lb.rect(CM.anchor, lp.x - Math.max(0.7, 0.07 * s), lp.y - 3.6 * s, Math.max(1.4, 0.14 * s), 3.6 * s);
    lb.fill(lit ? CM.lampCore : CM.glass, ovalPath(lp.x, lp.y - 3.75 * s, Math.max(1.2, 0.2 * s), Math.max(1.4, 0.26 * s)));
    lb.rect(CM.anchor, lp.x - Math.max(0.9, 0.18 * s), lp.y - 4.05 * s, Math.max(1.8, 0.36 * s), Math.max(0.8, 0.08 * s));
  });
  const walkers: FarSpot[] = [
    {x: 26, y: sbBase(26) + 1.5, h: 22, vx: 7, wrap: [-50, 200], seed: 's8sbw/1'},
    {x: 138, y: sbBase(138) + 1.5, h: 19, vx: -5.5, wrap: [-50, 200], seed: 's8sbw/2'},
    {x: sbX(58), y: sbBase(sbX(58)) - 0.45 * sbS(sbX(58)), h: 12, sit: true, seed: 's8sbw/3'},
    {x: 470, y: sbBase(470) + 1, h: 6, vx: 3, wrap: [430, 590], seed: 's8sbw/4'},
  ];
  return (
    <OnPlane p="south">
      {statEl}
      <Paint b={wb} seed="s8south/win" misreg={false} />
      <Paint b={lb} seed="s8south/lamps" misreg={false} />
      <EarlyExit>
        <FarCrowd spots={walkers} />
      </EarlyExit>
    </OnPlane>
  );
};

// ================================================================= S8Water (the canal; 110) + the house band (160)

/** The far wall of the basin (water plane): its coping (limestone), its brick face, the waterline; y at screen x. */
const farWall = (x: number) => {
  const k = kOf(x);
  const b = sbBase(x);
  return {top: b + 2.5 * k, cope: b + 6.5 * k, foot: b + 18 * k};
};
const WATER = {x0: -300, x1: 820, y1: 1450};

export const S8Water: React.FC = () => {
  const t = useTime();
  const stat = useMemo(() => {
    const b = new Batch();
    b.rect(CM.water, WATER.x0, HY - 6, WATER.x1 - WATER.x0, WATER.y1 - HY + 6);
    b.layer();
    const xs: number[] = [];
    for (let x = WATER.x0; x <= VX; x += 30) xs.push(x);
    xs.push(VX);
    const band = (f: (x: number) => number, g: (x: number) => number): Pt[] => [...xs.map((x) => [x, f(x)] as Pt), ...xs.slice().reverse().map((x) => [x, g(x)] as Pt)];
    b.poly(CM.waterDeep, band((x) => farWall(x).foot - 1, (x) => farWall(x).foot + 7 * kOf(x)));
    b.poly(CM.brick, band((x) => farWall(x).cope - 0.5, (x) => farWall(x).foot));
    b.poly(CM.limestone, band((x) => farWall(x).top, (x) => farWall(x).cope));
    b.poly(CM.stoneShade, band((x) => farWall(x).cope - 0.6, (x) => farWall(x).cope + 0.9 * kOf(x)));
    return b;
  }, []);
  const statEl = useMemo(() => <Paint b={stat} seed="s8water" misreg={false} />, [stat]);
  // per frame: broken reflections of the far bank, ripples drifting, glints switching, leaves afloat
  const w = new Batch();
  const r = rng('s8water/life');
  for (const bl of SOUTH.blds) {
    if (!sbSeen(bl.x0, bl.x1) || bl.x0 > VX - 4) continue;
    const x0 = Math.max(bl.x0, -60);
    const x1 = Math.min(bl.x1, VX);
    if (x1 <= x0) continue;
    const k = kOf((x0 + x1) / 2);
    const top = farWall((x0 + x1) / 2).foot + 7 * k;
    const depth = 34 * k;
    for (let row = 0; row < 6; row++) {
      const y = top + (row / 6) * depth;
      let x = x0 + r.range(0, 10);
      while (x < x1) {
        const len = r.range(6, 22) * (1 - row * 0.1);
        if (r.chance(0.6 - row * 0.06)) {
          const xx = x + Math.sin(t * 1.3 + row * 0.9 + x * 0.05) * (1.2 + row * 0.5);
          const col = r.chance(0.18) ? CM.lamp : bl.wall;
          w.fill(col, `M${P(xx, y)}L${P(xx + len, y)}L${P(xx + len - 1, y + 1.6 + row * 0.2)}L${P(xx + 1, y + 1.6 + row * 0.2)}Z`);
        }
        x += len + r.range(4, 12);
      }
    }
  }
  // ripple dashes + glints where the water is ever seen (the strip x -40..175, the far reach x 430..600)
  const zones: [number, number][] = [
    [-40, 175],
    [430, 600],
  ];
  for (let i = 0; i < 46; i++) {
    const zn = zones[i % 2];
    const span = zn[1] - zn[0];
    const x = zn[0] + frac(r.range(0, 1) + (-5 * t) / span) * span;
    const top = farWall(x).foot + 4;
    const bot = Math.min(top + 120, LANE.copingY0 + (HY - LANE.copingY0) * (x / VX));
    const v = r.next();
    const y = lerp(top, bot, v * v);
    const s = 0.5 + (y - HY) / 110;
    const ww = r.range(10, 26) * s;
    w.fill(CM.waterDeep, `M${P(x - ww / 2, y)}Q${P(x, y - 1.6 * s)} ${P(x + ww / 2, y)}Q${P(x, y + 1.6 * s)} ${P(x - ww / 2, y)}Z`);
    const per = r.range(1.2, 2.6);
    if (frac(t / per + r.next()) < 0.4) {
      const gy = lerp(top, bot, r.next() * 0.7);
      const gs = 0.5 + (gy - HY) / 120;
      const gx = zn[0] + r.next() * span + Math.sin(t * 0.9 + i) * 3;
      w.fill(r.chance(0.5) ? CM.paper : r.chance(0.5) ? CM.lampCore : CM.bandSunset, `M${P(gx - 5 * gs, gy)}L${P(gx + 5 * gs, gy - 0.6)}L${P(gx + 4 * gs, gy + 1.4 * gs)}L${P(gx - 4 * gs, gy + 1.4 * gs)}Z`);
    }
  }
  for (let i = 0; i < 14; i++) {
    const zn = zones[i % 2];
    const span = zn[1] - zn[0];
    const x = zn[0] + frac(r.next() + (-4 * t) / span) * span;
    const top = farWall(x).foot + 3;
    const y = top + r.range(2, 40) * kOf(x) * 1.4;
    const s = 4 + (y - HY) * 0.12;
    w.fill(LEAVES[i % LEAVES.length], leafPath(x, y + Math.sin(t * 1.4 + i) * 0.8, s, s * 0.24, r.range(-20, 20)));
  }
  return (
    <>
      <OnPlane p="water">
        {statEl}
        <Paint b={w} seed="s8water/life" misreg={false} />
        <EarlyExit>
          <Ducks ducks={[{x: 112, y: 985, size: 19, vx: -2.6, drake: true}, {x: 138, y: 991, size: 17, vx: -2.4}]} seed="s8ducks" x0={-60} x1={220} />
        </EarlyExit>
      </OnPlane>
      <OnPlane p="house">
        <HouseBand />
      </OnPlane>
    </>
  );
};

/** THE HOUSE BAND (house plane 160, y < 1100): the towpath beyond the bend (X COPE_IN .. her corner's X, to the VP),
 *  the towpath in front of the terrace (X < 0), her forecourt setts (X > 0, y 1060-1100), the coping to the VP with
 *  two mooring rings, her house's shade, leaves. Drawn under S8House. */
const HouseBand: React.FC = () => {
  const el = useMemo(() => {
    const b = new Batch();
    const zFar = 420;
    // the towpath (paving) right of the coping, to the bend line X = CORNER.X, and the forecourt strip to x 1350
    const base: Pt[] = [...runX(COPE_IN, Z_KERB, zFar, 16), [VX + 0.5, HY + 0.6], ...runX(CORNER.X, zFar, Z_HOUSE, 10), [1350, LANE.houseGround - 1], [1350, KERB_Y + 3], [cam(COPE_IN, 0, Z_KERB)[0], KERB_Y + 3]];
    b.poly(CM.paving, base);
    // the coping (limestone stones)
    b.poly(CM.limestone, [...runX(COPE_X, Z_KERB, zFar, 16), ...runX(COPE_IN, zFar, Z_KERB, 16)]);
    b.layer();
    // forecourt setts (x > 600): courses of small setts in two tones
    const r = rng('s8house/setts');
    const sc = courses('s8house/sc', Z_HOUSE, Z_KERB, [0.34, 0.42]);
    for (const c of sc) {
      let X = -r.range(0, 0.3);
      const Xmax = xAt(1350, yOf(c.Zn));
      while (X < Xmax) {
        const w = r.range(0.22, 0.32);
        if (X + w > 0) b.poly(r.chance(0.5) ? TONE.sett1 : TONE.sett2, gq(Math.max(0, X) + 0.025, X + w - 0.025, c.Zf - 0.03, c.Zn + 0.03));
        X += w;
      }
    }
    // flagstones of the towpath (X < 0 in front of the terrace; to the bend beyond it)
    const pv = pave('s8house/f', courses('s8house/fc', 60, Z_KERB, [0.55, 0.85]), () => COPE_IN, (Z) => (Z > Z_HOUSE ? CORNER.X : 0), [0.5, 0.85], 0.3);
    b.layer();
    // her house's shade on the forecourt (right of her shade line), the boat's thin shade along the coping
    b.poly(CM.stoneShade, [cam(shadeX(Z_HOUSE), 0, Z_HOUSE), [1350, LANE.houseGround - 1], [1350, KERB_Y + 3], [cam(shadeX(Z_KERB), 0, Z_KERB)[0] + 2, KERB_Y + 3]]);
    b.poly(CM.stoneShade, [...runX(COPE_IN, Z_KERB, 18, 6), ...runX(COPE_IN + 0.1, 18, Z_KERB, 6)]);
    b.layer();
    paveInto(b, pv, () => false, (y) => 1 + (y - HY) * 0.012);
    // the coping's cross joints and its water lip (fills), two iron rings
    for (let z = Z_KERB + 0.6; z < 40; z += 0.95) sliver(b, TONE.copeJoint, [cam(COPE_X + 0.03, 0, z), cam(COPE_IN - 0.02, 0, z)], 1 + 8 / z);
    b.poly(CM.stoneShade, [...runX(COPE_X, Z_KERB, 80, 10), ...runX(COPE_X + 0.035, 80, Z_KERB, 10)]);
    for (const z of [9.4, 13.6]) {
      const [x, y] = cam(COPE_X + 0.16, 0, z);
      const s = F / z;
      b.fill(CM.anchor, ovalPath(x, y, 0.08 * s, 0.035 * s));
      b.fill(CM.limestone, ovalPath(x, y, 0.055 * s, 0.02 * s));
    }
    // the kerb between the forecourt and the towpath flagstones (horizontal: it slides along itself)
    b.rect(CM.limestone, 600, KERB_Y - 3, 750, 3);
    b.layer();
    const lr = rng('s8house/leaves');
    scatterLeaves(b, lr, 16, 24, Z_KERB, () => COPE_IN + 0.1, (Z) => (Z > Z_HOUSE ? CORNER.X : 4), [0.09, 0.13]);
    return <Paint b={b} seed="s8house/band" />;
  }, []);
  return el;
};

// ================================================================= S8Boat (the cafe boat; boat plane 250)

/** The boat's side plane stands 0.24 m off our coping; its stern is near (L 0 at Z 2.4 m, off the left edge), its
 *  bow far (L 18.6, behind the board). Heights in m above the towpath. Only L ~1.4-2.8 m ever shows (x 0-150). */
const BOAT = {X: COPE_X - 0.24, Z0: 2.4, len: 18.6, hull: -0.32, gun0: -0.03, gun1: 0.07, roof: 1.07, trim: 1.12};
const bp = (Lm: number, h: number, inn = 0): Pt => cam(BOAT.X - inn, h, BOAT.Z0 + Lm);
/** A rectangle on the boat's side: along L0..L1, up h0..h1 (inn = metres in from the side, - = toward us). */
const bq = (L0: number, L1: number, h0: number, h1: number, inn = 0): Pt[] => [bp(L0, h1, inn), bp(L1, h1, inn), bp(L1, h0, inn), bp(L0, h0, inn)];
/** An ellipse on the side (portholes): centre L, h, radius m. */
const bOval = (Lc: number, hc: number, rad: number, inn = 0): Pt[] =>
  Array.from({length: 14}, (_, i) => {
    const a = (i / 14) * Math.PI * 2;
    return bp(Lc + Math.cos(a) * rad, hc + Math.sin(a) * rad, inn);
  });
/** The roof lights: a wire on posts along the roof's near edge, bulbs every 0.45 m (near -> far). */
const BULBS = (() => {
  const out: {L: number; h: number}[] = [];
  const posts = [1.15, 4.1, 7.05, 10.0, 12.95];
  for (let p = 0; p < posts.length - 1; p++) {
    const a = posts[p];
    const c = posts[p + 1];
    for (let Lm = a + 0.3; Lm < c - 0.1; Lm += 0.45) {
      const u = (Lm - a) / (c - a);
      out.push({L: Lm, h: 1.75 - Math.sin(u * Math.PI) * 0.17});
    }
  }
  return {posts, bulbs: out};
})();
/** The bunting: a line from a stern pole to a pole far along, small flags hanging. */
const BUNT = {L0: 0.5, L1: 7.6, h0: 2.0, h1: 1.92, sag: 0.2, n: 18};
const buntAt = (u: number): Pt => bp(lerp(BUNT.L0, BUNT.L1, u), lerp(BUNT.h0, BUNT.h1, u) - Math.sin(u * Math.PI) * BUNT.sag, 0.02);

export const S8Boat: React.FC = () => {
  const t = useTime();
  const stat = useMemo(() => {
    const b = new Batch();
    const {gun0, gun1, roof, trim, hull} = BOAT;
    // hull (slate), the plum gunwale stripe, the bow sweeping up
    b.poly(CM.paneUnlit, [...bq(0, 17.1, hull, gun0)]);
    b.poly(CM.paneUnlit, [bp(17.1, gun0), bp(18.5, gun1 + 0.22), bp(18.6, gun1 + 0.3), bp(18.3, hull), bp(17.1, hull)]);
    b.poly(CM.anchor, [...bq(0, 17.1, gun0, gun1)]);
    b.poly(CM.anchor, [bp(17.1, gun1), bp(18.62, gun1 + 0.34), bp(18.55, gun1 + 0.22), bp(17.1, gun0)]);
    b.poly(CM.shadeCool, bq(0, 17.1, hull + 0.12, hull + 0.15));
    b.layer();
    // the cabin (oat), a mustard coach line, a brick waist line, the roof trim
    b.poly(CM.coatOat, bq(1.0, 15.1, gun1, roof));
    b.poly(CM.coatMustard, bq(1.05, 15.05, roof - 0.12, roof - 0.085));
    b.poly(CM.brickDeep, bq(1.05, 15.05, gun1 + 0.06, gun1 + 0.1));
    b.poly(CM.limestone, bq(0.94, 15.16, roof, trim));
    b.poly(CM.paper, bq(0.94, 15.16, trim - 0.02, trim));
    // the cratch at the bow well, the stern deck's counter
    b.poly(CM.coatSlate, [bp(15.1, roof - 0.1), bp(16.9, gun1 + 0.2), bp(15.1, gun1)]);
    b.poly(CM.line, bq(0.2, 1.0, gun1, gun1 + 0.12));
    b.layer();
    // portholes along the cabin (lit, curtained): far ones behind the board, every 1.25 m; a painted panel
    for (let Lm = 3.3; Lm < 14.6; Lm += 1.25) {
      if (Math.abs(Lm - 8.3) < 0.7) {
        b.poly(CM.stucco, bOval(Lm, 0.6, 0.3));
        b.poly(CM.box, bOval(Lm - 0.1, 0.62, 0.08));
        b.poly(CM.leafRust, bOval(Lm + 0.1, 0.55, 0.07));
        continue;
      }
      b.poly(CM.coatMustard, bOval(Lm, 0.62, 0.19));
      b.poly(CM.lamp, bOval(Lm, 0.62, 0.14));
      b.poly(CM.box, [bp(Lm - 0.14, 0.72), bp(Lm - 0.03, 0.7), bp(Lm - 0.07, 0.5), bp(Lm - 0.14, 0.52)]);
    }
    // ---- the strip (x 0-150 at the landing): the chalk menu card, the serving hatch, a lit porthole
    b.poly(CM.line, bq(1.43, 1.69, 0.26, 0.82));
    b.poly(CM.anchor, bq(1.46, 1.66, 0.3, 0.78));
    // chalk scribbles (illegible: short wavy paper slivers)
    for (let k = 0; k < 5; k++) {
      const hh = 0.72 - k * 0.09;
      const L1 = 1.49 + 0.12 - (k % 2) * 0.04;
      sliver(b, CM.paper, [bp(1.49, hh), bp((1.49 + L1) / 2, hh + 0.012), bp(L1, hh - 0.006)], 1.6);
    }
    // the hatch: brick frame, a warm lit interior, a back shelf with jars, a pendant lamp, a counter with cups
    b.poly(CM.brickDeep, bq(1.76, 2.66, 0.36, 1.0));
    b.poly(CM.lamp, bq(1.82, 2.6, 0.43, 0.95));
    b.poly(CM.lampCore, bq(2.02, 2.42, 0.6, 0.9));
    b.poly(CM.line, bq(1.82, 2.6, 0.7, 0.73));
    for (let k = 0; k < 6; k++) {
      const Lj = 1.88 + k * 0.12;
      b.poly([CM.sage, CM.box, CM.paper, CM.leafRust, CM.coatMustard, CM.paper][k], bq(Lj, Lj + 0.07, 0.73, 0.73 + 0.06 + (k % 3) * 0.025));
    }
    b.poly(CM.stoneShade, bq(2.3, 2.52, 0.45, 0.66)); // the coffee machine
    b.poly(CM.limestone, bq(2.32, 2.5, 0.63, 0.66));
    b.poly(CM.anchor, bq(2.14, 2.16, 0.85, 0.95)); // the pendant
    b.poly(CM.lampCore, [bp(2.08, 0.85), bp(2.22, 0.85), bp(2.19, 0.81), bp(2.11, 0.81)]);
    b.poly(CM.line, bq(1.72, 2.7, 0.37, 0.44)); // the counter
    for (let k = 0; k < 3; k++) {
      const Lc = 1.86 + k * 0.13;
      b.poly(CM.paper, bq(Lc, Lc + 0.07, 0.44, 0.52));
      b.poly(CM.box, bq(Lc, Lc + 0.07, 0.49, 0.52));
    }
    b.poly(CM.paper, bq(2.24, 2.5, 0.44, 0.46)); // the cake stand
    b.poly(CM.box, [bp(2.27, 0.46), bp(2.47, 0.46), bp(2.43, 0.56), bp(2.31, 0.56)]);
    // the striped awning over the hatch (it leans out toward us)
    for (let k = 0; k < 8; k++) {
      const a = 1.7 + k * 0.125;
      b.poly(k % 2 ? CM.paper : CM.box, [bp(a, 1.1, 0), bp(a + 0.125, 1.1, 0), bp(a + 0.125, 0.97, -0.22), bp(a, 0.97, -0.22)]);
    }
    // a lit porthole past the hatch
    b.poly(CM.coatMustard, bOval(2.86, 0.66, 0.13));
    b.poly(CM.lamp, bOval(2.86, 0.66, 0.095));
    // the rope's T-stud on the gunwale
    b.poly(CM.anchor, bq(2.18, 2.3, gun1, gun1 + 0.05, -0.04));
    b.layer();
    // ---- the roof (only its near edge shows): herb pots, the pigeon box (lit), a watering can, the stove chimney,
    // a crate of apples, a bike far along, the light posts
    const pot = (Lm: number, inn: number, hgt: number, green: string, seed: string) => {
      const a = bp(Lm - 0.09, trim, inn);
      const c = bp(Lm + 0.09, trim, inn);
      const top = bp(Lm, trim + hgt, inn)[1];
      const wpx = c[0] - a[0];
      b.poly(CM.brickDeep, [[a[0] - wpx * 0.12, top], [c[0] + wpx * 0.12, top], [c[0], a[1]], [a[0], a[1]]]);
      b.fill(green, lobes(a[0] - wpx * 0.3, c[0] + wpx * 0.3, top + 1, wpx * 1.1, seed, 3));
    };
    pot(1.5, 0.06, 0.17, CM.sage, 's8boat/p1');
    pot(1.74, 0.14, 0.14, CM.leafGold, 's8boat/p2');
    pot(2.62, 0.08, 0.16, CM.sage, 's8boat/p3');
    // the pigeon box: a little skylight, its side panes lit
    b.poly(CM.line, [bp(2.0, trim, 0.25), bp(2.36, trim, 0.25), bp(2.32, trim + 0.17, 0.3), bp(2.04, trim + 0.17, 0.3)]);
    b.poly(CM.lampCore, [bp(2.06, trim + 0.03, 0.25), bp(2.3, trim + 0.03, 0.25), bp(2.28, trim + 0.13, 0.28), bp(2.08, trim + 0.13, 0.28)]);
    b.poly(CM.limestone, [bp(1.98, trim + 0.17, 0.3), bp(2.38, trim + 0.17, 0.3), bp(2.36, trim + 0.2, 0.32), bp(2.0, trim + 0.2, 0.32)]);
    // a watering can
    b.poly(CM.coatSlate, [bp(1.93, trim, 0.36), bp(2.08, trim, 0.36), bp(2.08, trim + 0.17, 0.36), bp(1.93, trim + 0.17, 0.36)]);
    b.poly(CM.coatSlate, [bp(1.9, trim + 0.12, 0.36), bp(1.78, trim + 0.24, 0.36), bp(1.79, trim + 0.26, 0.36), bp(1.92, trim + 0.16, 0.36)]);
    // the stove chimney (plum pipe, a brass band, a cap)
    const ch0 = bp(2.47, trim, 0.13);
    const ch1 = bp(2.47, 1.66, 0.13);
    const cw = (0.055 * F) / (BOAT.Z0 + 2.47);
    b.rect(CM.anchor, ch0[0] - cw / 2, ch1[1], cw, ch0[1] - ch1[1]);
    b.rect(CM.coatMustard, ch0[0] - cw / 2 - 1, ch1[1] + (ch0[1] - ch1[1]) * 0.3, cw + 2, cw * 0.35);
    b.fill(CM.anchor, domePath(ch0[0], ch1[1] + 1, cw * 0.95, cw * 0.55));
    // a crate of apples on the roof past the strip
    b.poly(CM.line, [bp(3.0, trim, 0.1), bp(3.4, trim, 0.1), bp(3.4, trim + 0.24, 0.1), bp(3.0, trim + 0.24, 0.1)]);
    b.poly(CM.leafRust, [bp(3.03, trim + 0.24, 0.1), bp(3.37, trim + 0.24, 0.1), bp(3.33, trim + 0.3, 0.1), bp(3.07, trim + 0.3, 0.1)]);
    // light posts and the bunting poles
    for (const Lp of BULBS.posts) {
      const a = bp(Lp, trim, 0.04);
      const z = bp(Lp, 1.8, 0.04);
      b.rect(CM.line, a[0] - 1.2, z[1], 2.4, a[1] - z[1]);
    }
    for (const Lp of [BUNT.L0, BUNT.L1]) {
      const a = bp(Lp, trim, 0.02);
      const z = bp(Lp, Lp === BUNT.L0 ? BUNT.h0 + 0.04 : BUNT.h1 + 0.04, 0.02);
      b.rect(CM.line, a[0] - 1.4, z[1], 2.8, a[1] - z[1]);
    }
    b.layer();
    // ink where it carries form: the roof edge, the hull sheer, the hatch frame, the card's edge, a bike far along
    b.ink(line(...bp(0.94, trim), ...bp(6, trim), {seed: 's8boat/rt', over: 'small'}), INK_PX.mid, CM.ink, 0.15);
    b.ink(line(...bp(0, gun1 + 0.01), ...bp(5, gun1 + 0.01), {seed: 's8boat/sh', over: 'small'}), INK_PX.mid, CM.ink, 0.2);
    b.ink(`M${P(...bp(1.76, 1.0))}L${P(...bp(2.66, 1.0))}L${P(...bp(2.66, 0.36))}M${P(...bp(1.76, 0.36))}L${P(...bp(1.76, 0.98))}`, INK_PX.far, CM.ink, 0.25);
    b.ink(line(...bp(1.43, 0.82), ...bp(1.43, 0.26), {seed: 's8boat/card', over: 'small'}), INK_PX.hair, CM.ink, 0.2);
    const bk = bp(5.4, trim + 0.35, 0.2);
    const bks = F / (BOAT.Z0 + 5.4);
    b.ink(`M${P(bk[0] - 0.85 * bks, bk[1])}A${r1(0.3 * bks)} ${r1(0.3 * bks)} 0 1 0 ${P(bk[0] - 0.85 * bks, bk[1] + 0.01)}M${P(bk[0] + 0.25 * bks, bk[1])}A${r1(0.3 * bks)} ${r1(0.3 * bks)} 0 1 0 ${P(bk[0] + 0.25 * bks, bk[1] + 0.01)}`, INK_PX.hair, CM.ink);
    return b;
  }, []);
  const statEl = useMemo(() => <Paint b={stat} seed="s8boat" />, [stat]);
  // per frame: bunting (flutters), the roof lights (bulb by bulb inside their run slot)
  const f = new Batch();
  const n = BUNT.n;
  for (let k = 0; k < n; k++) {
    const [x, y] = buntAt(k / n);
    const [x2, y2] = buntAt((k + 0.82) / n);
    const s = F / (BOAT.Z0 + lerp(BUNT.L0, BUNT.L1, k / n));
    const sw = Math.sin(t * 3.1 + k * 1.3) * 0.018 * s;
    f.fill([CM.box, CM.sage, CM.coatMustard, CM.paper, CM.blossom][k % 5], `M${P(x, y)}L${P(x2, y2)}L${P((x + x2) / 2 + sw, (y + y2) / 2 + 0.1 * s)}Z`);
  }
  const lightsAt = lampRunAt('boatLights');
  BULBS.bulbs.forEach((q, i) => {
    const [x, y] = bp(q.L, q.h - 0.03, 0.04);
    const s = F / (BOAT.Z0 + q.L);
    const lit = t >= lightsAt + i * 0.012;
    f.fill(lit ? (i % 3 ? CM.lamp : CM.lampCore) : CM.paper, ovalPath(x, y + 0.035 * s, 0.03 * s + 0.6, 0.04 * s + 0.6));
  });
  const wires = useMemo(() => {
    const wb = new Batch();
    let bl = '';
    for (let k = 0; k <= 24; k++) {
      const [x, y] = buntAt(k / 24);
      bl += `${k ? 'L' : 'M'}${P(x, y)}`;
    }
    let wire = '';
    BULBS.posts.forEach((Lp, p) => {
      if (p === BULBS.posts.length - 1) return;
      const c = BULBS.posts[p + 1];
      for (let k = 0; k <= 8; k++) {
        const u = k / 8;
        const [x, y] = bp(lerp(Lp, c, u), 1.8 - Math.sin(u * Math.PI) * 0.17, 0.04);
        wire += `${k ? 'L' : 'M'}${P(x, y)}`;
      }
    });
    wb.ink(bl + wire, 1.1, CM.ink);
    return <Paint b={wb} seed="s8boat/wires" misreg={false} />;
  }, []);
  const chim = bp(2.47, 1.66, 0.13);
  const hatch = bp(1.95, 0.95);
  return (
    <OnPlane p="boat">
      {statEl}
      {wires}
      <EarlyExit>
        <Puffs x={chim[0]} y={chim[1] - 2} seed="s8boat/smoke" kind="smoke" scale={0.62} drift={-34} ceil={610} bursts={[L(34.2), L(36.9)]} />
        <Puffs x={hatch[0]} y={hatch[1] + 6} seed="s8boat/steam" kind="steam" scale={0.34} drift={-10} ceil={610} />
        <Paint b={f} seed="s8boat/life" misreg={false} />
      </EarlyExit>
    </OnPlane>
  );
};

// ================================================================= S8Ground (the board band 250 + the near band 320)

/** The mooring ring on our coping (left of the board's legs) and the boat's rope to it. */
const RING = {Z: 3.9, X: COPE_X + 0.17};
const inHouseShade = (x: number, y: number) => x > cam(shadeX(zAt(y)), 0, zAt(y))[0];

const BoardBand: React.FC = () => {
  const el = useMemo(() => {
    const b = new Batch();
    const Xr = (Z: number) => xAt(1360, yOf(Z));
    // paving right of the coping (the kerb line at y 1100 is horizontal: it slides along itself)
    b.poly(CM.paving, [...runX(COPE_IN, Z_KERB, Z_NEAR, 10), [1360, NEAR_Y + 2], [1360, KERB_Y]]);
    b.poly(CM.limestone, [...runX(COPE_X - 0.02, Z_KERB, Z_NEAR - 0.3, 10), ...runX(COPE_IN, Z_NEAR - 0.3, Z_KERB, 10)]);
    const pv = pave('s8board/f', courses('s8board/c', Z_KERB, Z_NEAR, [0.42, 0.6]), () => COPE_IN, Xr, [0.4, 0.68], 0.3);
    b.layer();
    // shade: her house's (right of the shade line) and the boat's thin strip along the coping
    b.poly(CM.stoneShade, [cam(shadeX(Z_KERB), 0, Z_KERB), [1360, KERB_Y], [1360, NEAR_Y + 2], cam(shadeX(Z_NEAR), 0, Z_NEAR - 0.02)]);
    b.poly(CM.stoneShade, [...runX(COPE_IN, Z_KERB, Z_NEAR, 6), ...runX(COPE_IN + 0.09, Z_NEAR, Z_KERB, 6)]);
    b.layer();
    paveInto(b, pv, inHouseShade, (y) => 1.2 + (y - HY) * 0.008);
    // the coping: cross joints, the water lip
    for (let z = Z_NEAR + 0.2; z < Z_KERB; z += 0.9) sliver(b, TONE.copeJoint, [cam(COPE_X + 0.03, 0, z), cam(COPE_IN - 0.02, 0, z)], 1.2 + 10 / z);
    b.poly(CM.stoneShade, [...runX(COPE_X - 0.02, Z_KERB, Z_NEAR - 0.3, 8), ...runX(COPE_X + 0.04, Z_NEAR - 0.3, Z_KERB, 8)]);
    // the mooring ring (iron)
    const [rx, ry] = cam(RING.X, 0, RING.Z);
    const rs = F / RING.Z;
    b.fill(CM.anchor, ovalPath(rx, ry, 0.1 * rs, 0.045 * rs));
    b.fill(CM.limestone, ovalPath(rx, ry, 0.07 * rs, 0.026 * rs));
    // a drain grate below the board
    grateInto(b, 438, zAt(1288), 0.42, 0.26, 's8board/drain');
    b.layer();
    const lr = rng('s8board/leaves');
    scatterLeaves(b, lr, 30, Z_KERB, Z_NEAR + 0.05, () => COPE_IN + 0.05, (Z) => xAt(1180, yOf(Z)), [0.09, 0.14]);
    return <Paint b={b} seed="s8board/band" />;
  }, []);
  // the boat's rope from its T-stud to the ring (the boat rides the board band: same plane)
  const rope = useMemo(() => {
    const b = new Batch();
    const a = bp(2.24, BOAT.gun1 + 0.03, -0.05);
    const z = cam(RING.X, 0.02, RING.Z);
    const pts: Pt[] = [];
    for (let k = 0; k <= 10; k++) {
      const u = k / 10;
      pts.push([lerp(a[0], z[0], u) + Math.sin(u * Math.PI) * 4, lerp(a[1], z[1], u) + Math.sin(u * Math.PI) * 9]);
    }
    sliver(b, CM.coatOat, pts, 4.2);
    b.ink(pts.map(([x, y], i) => `${i ? 'L' : 'M'}${P(x, y + 1.8)}`).join(''), INK_PX.hair, CM.ink, 0.35);
    return <Paint b={b} seed="s8board/rope" misreg={false} />;
  }, []);
  return (
    <>
      {el}
      {rope}
    </>
  );
};

/** The near lamp's pool on the paving (lights first in the lamp run, a 3-frame flicker): an organic flat shape. */
const POOL = {x: 930, y: 1640, rx: 170, ry: 40};
const poolPath = (k: number) => {
  const pts: Pt[] = [];
  for (let i = 0; i < 28; i++) {
    const a = (i / 28) * Math.PI * 2;
    const wob = 1 + Math.sin(a * 3 + 0.7) * 0.06 + Math.sin(a * 5 + 2.1) * 0.04;
    pts.push([POOL.x + Math.cos(a) * POOL.rx * k * wob, POOL.y + Math.sin(a) * POOL.ry * k * wob]);
  }
  return pts.map(([x, y], i) => `${i ? 'L' : 'M'}${P(x, y)}`).join('') + 'Z';
};

const NearBand: React.FC = () => {
  const t = useTime();
  const el = useMemo(() => {
    const b = new Batch();
    b.rect(CM.paving, -40, NEAR_Y - 2, 1480, 1960 - NEAR_Y + 2);
    const pv = pave('s8near/f', courses('s8near/c', Z_NEAR, zAt(1990), [0.42, 0.56]), (Z) => xAt(-40, yOf(Z)), (Z) => xAt(1440, yOf(Z)), [0.42, 0.7], 0.34);
    b.layer();
    // her house's shade reaches the near band's right end (it shows in the rail before the truck)
    b.poly(CM.stoneShade, [cam(shadeX(Z_NEAR), 0, Z_NEAR), [1440, NEAR_Y - 2], [1440, yOf(2.3)], cam(shadeX(2.3), 0, 2.3)]);
    b.layer();
    paveInto(b, pv, inHouseShade, (y) => 1.6 + (y - NEAR_Y) * 0.006);
    // a puddle reflecting the sky (a leaf afloat in it)
    b.fill(TONE.puddle, `M${P(616, 1752)}Q${P(640, 1728)} ${P(700, 1732)}Q${P(760, 1726)} ${P(790, 1744)}Q${P(800, 1762)} ${P(746, 1768)}Q${P(690, 1778)} ${P(640, 1770)}Q${P(606, 1766)} ${P(616, 1752)}Z`);
    b.fill(CM.sky, `M${P(650, 1748)}Q${P(700, 1738)} ${P(748, 1744)}Q${P(722, 1752)} ${P(670, 1754)}Z`);
    // cracks with tiny weeds (fill slivers, sage tufts)
    const cr = rng('s8near/cracks');
    for (const [x, y, n] of [
      [650, 1395, 5],
      [1004, 1470, 4],
      [846, 1868, 5],
    ] as [number, number, number][]) {
      const pts: Pt[] = [[x, y]];
      let cx = x;
      let cy = y;
      for (let k = 0; k < n; k++) {
        cx += cr.range(12, 26);
        cy += cr.jitter(7);
        pts.push([cx, cy]);
      }
      sliver(b, TONE.joint, pts, 3.2);
      for (let k = 0; k < 4; k++) b.fill(CM.sage, leafPath(x + 4 + k * 8, y - 6 - (k % 2) * 4, 13 + k * 2, 3.2, -75 + k * 45));
      b.fill(CM.sage, lobes(x - 6, x + 20, y + 3, 10, `s8weed${x}`, 3));
    }
    // a drain grate on the near paving
    grateInto(b, 742, zAt(1494), 0.36, 0.2, 's8near/drain');
    b.layer();
    // leaves: a drift along the deck's edge, more round the planter, a scatter between
    const lr = rng('s8near/leaves');
    scatterLeaves(b, lr, 26, Z_NEAR, zAt(1950), (Z) => xAt(560, yOf(Z)), (Z) => xAt(1420, yOf(Z)), [0.05, 0.075], (x, y) => !(x > 600 && x < 800 && y > 1720 && y < 1780));
    for (let i = 0; i < 14; i++) {
      const y = lr.range(1360, 1900);
      const x = 575 + (y - 1350) * -0.04 + lr.range(0, 40);
      groundLeaf(b, x, y, lr.range(16, 30), lr.range(-50, 50), lr.pick(LEAVES));
    }
    for (let i = 0; i < 10; i++) groundLeaf(b, lr.range(830, 1120), lr.range(1780, 1840), lr.range(18, 30), lr.range(-40, 40), lr.pick(LEAVES));
    groundLeaf(b, 712, 1750, 22, 18, CM.leafRust);
    // pebbles and specks
    for (let i = 0; i < 40; i++) {
      const y = lr.range(NEAR_Y + 10, 1920);
      const x = lr.range(560, 1420);
      const s = 1.2 + (y - NEAR_Y) * 0.006;
      b.fill(lr.chance(0.5) ? CM.stoneShade : CM.brickLight, ovalPath(x, y, s * 1.4, s));
    }
    return <Paint b={b} seed="s8near/band" />;
  }, []);
  const at = lampRunAt('nearPool');
  const lit = t >= at && !(t >= at + 1 / 60 && t < at + 3 / 60);
  const pool = new Batch();
  if (lit) {
    pool.fill(CM.lampCore, poolPath(1));
    pool.fill(CM.lamp, poolPath(0.62));
  }
  // a ripple ring in the puddle now and then (a drip from the planter's leaves)
  const rp = frac((t + 0.6) / 2.3);
  if (rp < 0.45) {
    const k = rp / 0.45;
    const rr = 6 + k * 34;
    pool.fill(CM.paper, `M${P(704 - rr, 1752)}A${r1(rr)} ${r1(rr * 0.28)} 0 0 0 ${P(704 + rr, 1752)}A${r1(rr - 2.2)} ${r1(rr * 0.28 - 1.2)} 0 0 1 ${P(704 - rr + 2.2, 1752)}Z`);
  }
  return (
    <>
      {el}
      <Paint b={pool} seed="s8near/pool" misreg={false} />
    </>
  );
};

export const S8Ground: React.FC = () => (
  <>
    <OnPlane p="board">
      <BoardBand />
    </OnPlane>
    <OnPlane p="near">
      <NearBand />
    </OnPlane>
  </>
);

// ================================================================= S8Front (the near band's objects; near 320)

/** The cafe deck: a timber platform on the towpath at the bottom-left (boards to the lane's VP), its furniture small
 *  (scaled to the readers who stand on it, about her size) and seen a little from above, as the kit's CafeDeck;
 *  standing room for the two readers at x 140-300 / feet ~1500. */
const DECK = {h: 0.12, Zfar: zAt(1350) * ((EYE - 0.12) / EYE), Xr: -0.05, Xl: -2.6};
const deckP = (X: number, Z: number): Pt => cam(X, DECK.h, Z);

const Deck: React.FC = () => {
  const el = useMemo(() => {
    const b = new Batch();
    const zN = 1.05;
    const zF = DECK.Zfar;
    // boards: honey wood, a slightly deeper tone on every third, joints as darker slivers, butt ends staggered
    b.poly(TONE.wood, [deckP(DECK.Xl, zF), deckP(DECK.Xr, zF), deckP(DECK.Xr, zN), deckP(DECK.Xl, zN)]);
    const r = rng('s8deck/planks');
    const pw = 0.062;
    for (let X = DECK.Xl, i = 0; X < DECK.Xr - 0.02; X += pw, i++) {
      if (i % 3 === 1) b.poly(TONE.wood2, [deckP(X, zF), deckP(X + pw, zF), deckP(X + pw, zN), deckP(X, zN)]);
      sliver(b, TONE.woodJoint, [deckP(X, zF), deckP(X, (zF + zN) / 2), deckP(X, zN)], 1.2 + (i % 2) * 0.5);
      for (let zz = zF - r.range(0.1, 0.9); zz > zN; zz -= r.range(0.7, 1.3)) sliver(b, TONE.woodJoint, [deckP(X + 0.004, zz), deckP(X + pw - 0.004, zz)], 1.4);
    }
    // the deck's edge boards: the far edge (horizontal) and the right edge (to the VP)
    b.poly(TONE.timber, [deckP(DECK.Xl, zF), deckP(DECK.Xr + 0.04, zF), deckP(DECK.Xr + 0.04, zF - 0.06), deckP(DECK.Xl, zF - 0.06)]);
    b.poly(TONE.timber, [deckP(DECK.Xr - 0.04, zF), deckP(DECK.Xr + 0.03, zF), deckP(DECK.Xr + 0.03, zN), deckP(DECK.Xr - 0.04, zN)]);
    b.layer();
    b.ink(line(...deckP(DECK.Xr + 0.03, zF - 0.06), ...deckP(DECK.Xr + 0.03, 1.25), {seed: 's8deck/edge', over: 'small'}), INK_PX.front, CM.ink, 0.2);
    b.ink(line(...deckP(-0.6, zF - 0.06), ...deckP(DECK.Xr + 0.04, zF - 0.06), {seed: 's8deck/back', over: 'small'}), INK_PX.mid, CM.ink, 0.25);
    b.layer();
    // shadows on the boards (toward the lens, a little right): darker wood, short
    const shadow = (x: number, y: number, w: number, len: number) => {
      b.poly(TONE.woodShade, [[x - w / 2, y], [x + w / 2, y], [x + w / 2 + len * 0.22, y + len], [x - w / 2 + len * 0.18, y + len]]);
    };
    shadow(60, 1522, 64, 30);
    shadow(405, 1782, 90, 40);
    shadow(512, 1384, 50, 24);
    shadow(560, 1442, 26, 22);
    shadow(-6, 1548, 40, 24);
    shadow(128, 1552, 40, 24);
    shadow(330, 1806, 52, 30);
    shadow(486, 1812, 52, 30);
    b.layer();
    // a potted bay (small lollipop) at the back-right corner
    b.poly(CM.brickDeep, [[490, 1324], [534, 1324], [529, 1384], [495, 1384]]);
    b.rect(CM.brick, 488, 1324, 48, 6);
    b.rect(CM.line, 510, 1282, 4, 44);
    b.fill(CM.sage, lobes(484, 540, 1298, 46, 's8deck/bay', 4));
    b.fill(CM.coatMustard, ovalPath(498, 1268, 4, 3));
    // the folded chair leaning on the deck's edge
    b.poly(CM.line, [[540, 1300], [556, 1298], [574, 1440], [558, 1442]]);
    b.poly(CM.coatOat, [[543, 1310], [554, 1309], [566, 1404], [555, 1406]]);
    b.ink(line(538, 1304, 560, 1444, {seed: 's8deck/ch1', over: 'small'}) + line(556, 1300, 576, 1440, {seed: 's8deck/ch2', over: 'small'}), INK_PX.far, CM.ink, 0.15);
    // bistro chairs (seat + back hoop + legs), seen from behind, at the two tables
    const chair = (x: number, y: number, s: number, col: string) => {
      b.rect(CM.anchor, x - 18 * s, y - 26 * s, 2.4 * s, 26 * s);
      b.rect(CM.anchor, x + 15.6 * s, y - 26 * s, 2.4 * s, 26 * s);
      b.rect(CM.anchor, x - 12 * s, y - 24 * s, 2.2 * s, 22 * s);
      b.rect(CM.anchor, x + 10 * s, y - 24 * s, 2.2 * s, 22 * s);
      b.fill(col, ovalPath(x, y - 27 * s, 20 * s, 6.5 * s));
      b.fill(CM.anchor, `M${P(x - 17 * s, y - 28 * s)}Q${P(x - 18 * s, y - 62 * s)} ${P(x, y - 62 * s)}Q${P(x + 18 * s, y - 62 * s)} ${P(x + 17 * s, y - 28 * s)}L${P(x + 13.5 * s, y - 28 * s)}Q${P(x + 14 * s, y - 57 * s)} ${P(x, y - 57 * s)}Q${P(x - 14 * s, y - 57 * s)} ${P(x - 13.5 * s, y - 28 * s)}Z`);
    };
    chair(-6, 1548, 1.0, CM.coatMustard);
    chair(128, 1552, 1.0, CM.box);
    // the tables: a pedestal, a round top seen from a little above
    const table = (x: number, y: number, R: number, hgt: number) => {
      b.rect(CM.anchor, x - 3.5, y, 7, hgt);
      b.fill(CM.anchor, ovalPath(x, y + hgt, R * 0.38, R * 0.08));
      b.fill(CM.paper, ovalPath(x, y, R, R * 0.32));
      b.fill(CM.limestone, ovalPath(x, y + 3, R * 0.95, R * 0.26));
    };
    table(60, 1448, 64, 76);
    table(405, 1700, 88, 84);
    b.layer();
    chair(330, 1806, 1.25, CM.sage);
    chair(486, 1812, 1.25, CM.coatMustard);
    // a blanket (a check throw) over the near chair's back
    b.poly(CM.blossom, [[318, 1726], [346, 1728], [352, 1770], [314, 1772]]);
    b.rect(CM.box, 316, 1740, 34, 4);
    b.rect(CM.box, 315, 1756, 36, 4);
    const mug = (x: number, y: number, col: string) => {
      b.rect(col, x - 8, y - 17, 16, 17);
      b.fill(CM.ink, ovalPath(x, y - 17, 8, 2.6));
      b.fill(col, `M${P(x + 7, y - 14)}Q${P(x + 15, y - 10)} ${P(x + 7, y - 4)}L${P(x + 7, y - 6.5)}Q${P(x + 11, y - 10)} ${P(x + 7, y - 11.5)}Z`);
    };
    mug(36, 1442, CM.box);
    mug(84, 1448, CM.coatMustard);
    mug(372, 1694, CM.sage);
    mug(432, 1706, CM.box);
    b.fill(CM.coatSlate, domePath(458, 1690, 15, 21)); // the teapot
    b.rect(CM.coatSlate, 471, 1676, 10, 4);
    b.fill(CM.paper, ovalPath(392, 1716, 19, 6)); // a plate with a slice of cake
    b.poly(CM.leafGold, [[384, 1712], [401, 1714], [393, 1706]]);
    b.fill(CM.paper, ovalPath(420, 1690, 7, 3)); // a sugar bowl
    // a dog's water bowl, a coiled rope, a crate of apples at the front-left corner (cut by the edges)
    b.fill(CM.stoneShade, ovalPath(276, 1594, 26, 9));
    b.fill(CM.water, ovalPath(276, 1592, 19, 6));
    b.fill(CM.coatOat, ovalPath(186, 1806, 70, 23));
    b.fill(TONE.woodShade, ovalPath(186, 1808, 52, 16));
    b.fill(CM.coatOat, ovalPath(186, 1806, 42, 13));
    b.fill(CM.line, ovalPath(186, 1806, 22, 7));
    b.poly(TONE.timber, [[-30, 1812], [120, 1808], [126, 1960], [-30, 1960]]);
    b.rect(CM.coatOat, -30, 1812, 150, 10);
    for (let k = 0; k < 7; k++) b.fill(k % 3 ? CM.brick : CM.leafRust, ovalPath(-8 + k * 19, 1806 - (k % 2) * 6, 11, 10));
    sliver(b, TONE.timberJoint, [[-30, 1866], [124, 1862]], 3);
    b.ink(line(-30, 1812, 122, 1808, {seed: 's8deck/cr1', over: 'small'}) + line(120, 1808, 126, 1960, {seed: 's8deck/cr2', over: 'none'}), INK_PX.mid, CM.ink, 0.2);
    b.ink(`M${P(-4, 1448)}A64 20.5 0 0 0 ${P(124, 1448)}M${P(317, 1700)}A88 28 0 0 0 ${P(493, 1700)}`, INK_PX.far, CM.ink, 0.3);
    return <Paint b={b} seed="s8deck" />;
  }, []);
  const t = useTime();
  const jar = new Batch();
  const jarLit = t >= lampRunAt('boatLights');
  jar.rect(CM.glass, 52, 1410, 15, 21);
  jar.rect(jarLit ? CM.lamp : CM.paper, 55, 1416, 9, 11);
  jar.rect(CM.anchor, 51, 1407, 17, 4);
  return (
    <>
      {el}
      <Paint b={jar} seed="s8deck/jar" misreg={false} />
      <EarlyExit>
        <Puffs x={36} y={1422} seed="s8deck/st1" kind="steam" scale={0.4} drift={-12} ceil={610} />
        <Puffs x={432} y={1686} seed="s8deck/st2" kind="steam" scale={0.46} drift={-14} ceil={610} />
        <Puffs x={372} y={1674} seed="s8deck/st3" kind="steam" scale={0.38} drift={-10} ceil={610} />
      </EarlyExit>
    </>
  );
};

/** The planter bottom-right: a timber box, grasses, rosemary, a small autumn shrub that drops a leaf now and then. */
const PLANTER = {x0: 860, x1: 1112, top: 1806, y: 1960};

const Planter: React.FC = () => {
  const t = useTime();
  const stat = useMemo(() => {
    const b = new Batch();
    const {x0, x1, top, y} = PLANTER;
    b.poly(TONE.timber, [[x0, top], [x1, top], [x1, y], [x0, y]]);
    b.rect(CM.brickDeep, x0 - 4, top - 6, x1 - x0 + 8, 10);
    for (let k = 1; k < 4; k++) sliver(b, TONE.timberJoint, [[x0 + 4, top + k * 38], [x1 - 4, top + k * 38 + 1]], 2.6);
    sliver(b, TONE.timberJoint, [[x0 + 84, top + 8], [x0 + 85, y]], 2.4);
    b.layer();
    b.ink(line(x0, top - 6, x0, y, {seed: 's8pl/l', over: 'small'}) + line(x0 - 4, top - 6, x1 + 4, top - 6, {seed: 's8pl/t', over: 'small'}), INK_PX.front, CM.ink, 0.2);
    b.layer();
    // soil, the shrub (rust / gold), a mound of grass behind the rosemary
    b.fill(CM.line, `M${P(x0 + 2, top)}Q${P((x0 + x1) / 2, top - 10)} ${P(x1 - 2, top)}Z`);
    b.fill(CM.sage, lobes(x0 + 92, x1 - 6, top + 2, 120, 's8pl/grass', 4));
    b.fill(mix(CM.sage, CM.coatOat, 0.35), lobes(x0 + 120, x1 - 40, top + 2, 74, 's8pl/grass2', 3));
    b.fill(CM.leafRust, lobes(x0 + 4, x0 + 112, top + 4, 100, 's8shrub/a', 4));
    b.fill(CM.leafGold, lobes(x0 + 22, x0 + 92, top - 36, 60, 's8shrub/b', 3));
    b.fill(CM.coatMustard, lobes(x0 + 12, x0 + 54, top - 2, 44, 's8shrub/c', 2));
    return b;
  }, []);
  // per frame: grass blades and seed heads swaying, rosemary sprigs
  const b = new Batch();
  const r = rng('s8pl/blades');
  const {x0, x1, top} = PLANTER;
  for (let i = 0; i < 26; i++) {
    const bx = x0 + 96 + r.range(0, x1 - x0 - 104);
    const len = r.range(70, 150);
    const sw = Math.sin(t * 1.3 + i * 0.7) * len * 0.07;
    sliver(b, i % 4 ? CM.sage : mix(CM.sage, CM.coatOat, 0.5), [[bx, top + 4], [bx + sw * 0.4, top - len * 0.5], [bx + sw + r.jitter(8), top - len]], 3.4);
    if (r.chance(0.3)) b.fill(CM.coatOat, leafPath(bx + sw + r.jitter(8), top - len, 12, 3.4, 80));
  }
  for (let k = 0; k < 7; k++) {
    const x = 1024 + k * 11;
    const sw = Math.sin(t * 1.1 + k) * 2;
    const tip: Pt = [x + sw * 1.6 + (k - 3) * 3, top - 70 - (k % 3) * 10];
    sliver(b, mix(CM.sage, CM.shadeCool, 0.25), [[x, top + 2], [x + sw, top - 36], tip], 3);
    for (let j = 0; j < 5; j++) b.fill(mix(CM.sage, CM.shadeCool, 0.18), leafPath(lerp(x, tip[0], j / 5) + 3, lerp(top - 6, tip[1], j / 5), 10, 2.2, -60 + (k % 2) * 120));
  }
  const statEl = useMemo(() => <Paint b={stat} seed="s8planter" />, [stat]);
  return (
    <>
      {statEl}
      <Paint b={b} seed="s8planter/blades" misreg={false} />
    </>
  );
};

/** The near lamp-post: a plum column at x 1068 (foot below the frame), a mustard band, a ladder bar, and the swan neck
 *  turning right BELOW her window's line (y ~806) before it rises to its arm (y ~652, off the right edge at the
 *  landing): before the truck the column stands at x ~748 and must cross neither her nor W (34.95 beat). */
const NLAMP = {x: 1068, w: 26, top: 806, arm: 654};

const NearLamp: React.FC = () => {
  const t = useTime();
  const el = useMemo(() => {
    const b = new Batch();
    const {x, w, top, arm} = NLAMP;
    const hw = w / 2;
    // the column (slight taper), a base collar below the frame, a mustard band, the ladder bar
    b.poly(CM.anchor, [[x - hw * 1.25, 1980], [x - hw, top + 30], [x + hw, top + 30], [x + hw * 1.25, 1980]]);
    b.rect(CM.anchor, x - hw * 1.45, 1790, w * 1.45, 24);
    b.rect(CM.anchor, x - hw * 1.2, 1404, w * 1.2, 14);
    b.rect(CM.coatMustard, x - hw * 1.1, 1424, w * 1.1, 8);
    b.rect(CM.anchor, x - 34, 900, 68, 6);
    b.fill(CM.anchor, ovalPath(x - 34, 903, 4.5, 4.5));
    b.fill(CM.anchor, ovalPath(x + 34, 903, 4.5, 4.5));
    // the swan neck: up from the column, a tight turn right at y ~806, then rising to the arm far right
    const ny = top;
    b.fill(
      CM.anchor,
      `M${P(x - hw, top + 34)}L${P(x - hw, ny + 6)}C${P(x - hw, ny - 22)} ${P(x + 10, ny - 30)} ${P(x + 44, ny - 30)}C${P(x + 84, ny - 30)} ${P(x + 92, arm - 12)} ${P(x + 150, arm - 12)}L${P(1480, arm - 10)}L${P(1480, arm + 3)}L${P(x + 152, arm + 2)}C${P(x + 104, arm + 2)} ${P(x + 92, ny - 16)} ${P(x + 46, ny - 16)}C${P(x + 20, ny - 16)} ${P(x + hw, ny - 8)} ${P(x + hw, ny + 12)}L${P(x + hw, top + 34)}Z`,
    );
    // the lantern on the arm, off the right edge at the landing (it shows before the truck only)
    const lx = 1310;
    b.rect(CM.anchor, lx - 2, arm + 2, 4, 14);
    b.poly(CM.anchor, [[lx - 22, arm + 16], [lx + 22, arm + 16], [lx + 12, arm + 6], [lx - 12, arm + 6]]);
    b.rect(CM.anchor, lx - 16, arm + 62, 32, 6);
    b.ink(line(x - hw, top + 16, x - hw * 1.25, 1960, {seed: 's8nlamp/l', over: 'none'}), INK_PX.front, CM.ink, 0.12);
    b.ink(`M${P(x - hw, ny + 6)}C${P(x - hw, ny - 22)} ${P(x + 10, ny - 30)} ${P(x + 44, ny - 30)}C${P(x + 84, ny - 30)} ${P(x + 92, arm - 12)} ${P(x + 150, arm - 12)}L${P(1480, arm - 10)}`, INK_PX.mid, CM.ink, 0.2);
    return b;
  }, []);
  const at = lampRunAt('nearPool');
  const lit = t >= at && !(t >= at + 1 / 60 && t < at + 3 / 60);
  const g = new Batch();
  const lx = 1310;
  const arm = NLAMP.arm;
  g.poly(lit ? CM.lampCore : CM.glass, [[lx - 15, arm + 16], [lx + 15, arm + 16], [lx + 12, arm + 62], [lx - 12, arm + 62]]);
  if (lit) g.poly(CM.lamp, [[lx - 7, arm + 18], [lx + 7, arm + 18], [lx + 5, arm + 60], [lx - 5, arm + 60]]);
  return (
    <>
      <Paint b={g} seed="s8nlamp/glass" misreg={false} />
      <Paint b={el} seed="s8nlamp" />
    </>
  );
};

/** Big near leaves: each enters at the screen's right edge (whatever the truck's pose) or drops from the shrub, and
 *  drifts down-left past the lens, spinning; one or two at a time, all in the bottom third (never over lettering). */
const DRIFT = Array.from({length: 7}, (_, i) => ({
  t0: -0.4 + i * 1.05 + rand('s8drift', i) * 0.4,
  y0: 1300 + rand('s8drift', `y${i}`) * 240,
  shrub: i % 3 === 2,
  size: 18 + rand('s8drift', `s${i}`) * 8,
  dur: 3.4 + rand('s8drift', `d${i}`) * 1.4,
  col: LEAVES[i % LEAVES.length],
}));

const NearLeaves: React.FC = () => {
  const t = useTime();
  const b = new Batch();
  for (const lf of DRIFT) {
    const u = (t - lf.t0) / lf.dur;
    if (u < 0 || u > 1) continue;
    const x0 = lf.shrub ? 930 : 1096 - planeOffset('near', lf.t0);
    const y0 = lf.shrub ? 1740 : lf.y0;
    const x = x0 - u * (lf.shrub ? 120 : 420) + Math.sin(u * 7 + lf.t0) * 26;
    const y = y0 + u * (1990 - y0) + Math.sin(u * 11) * 6;
    const spin = Math.cos(t * 4.2 + lf.t0 * 3);
    b.fill(lf.col, leafPath(x, y, lf.size, Math.max(1.4, lf.size * 0.32 * Math.abs(spin)), t * 70 + lf.t0 * 40));
  }
  return <Paint b={b} seed="s8front/leaves" misreg={false} />;
};

export const S8Front: React.FC = () => (
  <OnPlane p="near">
    <Deck />
    <Planter />
    <NearLamp />
    <EarlyExit>
      <NearLeaves />
    </EarlyExit>
  </OnPlane>
);
