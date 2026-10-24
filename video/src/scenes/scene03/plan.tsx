// S03 scene-owned overlays on the shared BlueprintStreet (injected through the set's `wrap` layers, so they sit at the
// right depth): the far plain + horizon skyline that the bare plan runs to before the city springs up, the ten inked
// FOOTPRINTS (cream lots, solid ink, door swings, lot marks), S02's teal frame band on the plan sheet + the dog-ear
// fold, the side rows re-coloured (S03 replaces the set's 'sides' layer with the same rows: mint / peach facades,
// no tiny plaques, no PHP lock on the three non-PHP doors), the per-building COUNT BADGES (30-44 px plaques over the
// doors), awnings, the browser-screen states (unlit sage glass until their beat, a 2-frame peach glow pop, then a lit
// page: peach header + text rows, an ink elephant on the seven PHP sites), the count pings and the roof-vent puffs.
//
// The side-building geometry is the set's own layout, rebuilt here with the SAME inputs (quadRowLayout is pure and
// memoised): LX / RX / lTop / lBase / rTop / rBase and the sheet edge (yF, lB, rB, inset) are copied from
// sets/BlueprintStreet.tsx. If that set's geometry changes, update them.

import React from 'react';
import {palette} from '../../lib/theme';
import {ease as E, prog, useTime} from '../../lib/time';
import {Ink} from '../../lib/Ink';
import {Fill} from '../../lib/Fill';
import {crown, crownTicks, line, polyPath, rect, Pt} from '../../lib/sketch';
import {mat, XG} from '../../lib/xf';
import {rng} from '../../lib/rng';
import {Quad} from '../../lib/persp';
import {BLUEPRINT, PerspRow, PopUp, quadRowLayout, RowHouse, SI, SideId, BlueprintId} from '../shared/sets';
import {chromeScreen, ElephantEmblem, ElephantPlaque} from '../shared/props';

// ---------------------------------------------------------------- the set's side-building layout (copied inputs)

const LX = [-140, 0, 95, 175, 240, 300, 360];
const RX = [1220, 1080, 985, 905, 840, 760];
const lTop = (x: number) => 560 + ((800 - 560) * x) / 360;
const lBase = (x: number) => 1560 - ((1560 - 1180) * x) / 360;
const rTop = (x: number) => 560 + ((800 - 560) * (1080 - x)) / 320;
const rBase = (x: number) => 1560 - ((1560 - 1180) * (1080 - x)) / 320;

const leftQuads: Quad[] = LX.slice(0, -1).map((x0, i) => {
  const x1 = LX[i + 1];
  return [
    [x0, lTop(x0)],
    [x1, lTop(x1)],
    [x1, lBase(x1)],
    [x0, lBase(x0)],
  ] as Quad;
});
const rightQuads: Quad[] = RX.slice(0, -1).map((x0, i) => {
  const x1 = RX[i + 1];
  return [
    [x1, rTop(x1)],
    [x0, rTop(x0)],
    [x0, rBase(x0)],
    [x1, rBase(x1)],
  ] as Quad;
});
const LEFT_IDS: (SideId | null)[] = [null, 'L1', 'L2', 'L3', 'L4', 'L5'];
const RIGHT_IDS: (SideId | null)[] = [null, 'R1', 'R2', 'R3', 'R4'];
const isBlank = (id: SideId | null) => id !== null && BLUEPRINT.blank.includes(id);
/** Fix round 1 palette: the set's rows were ~70 % one brown family. Same rows, re-coloured: L2 / R2 mintPale, L4 peach,
 *  L3 tan (was mint, next to L2), R3 cream; the bleed slivers and L1 / L5 / R1 / R4 keep the set's colours. The tiny
 *  side plaques are dropped (`plaque: false`): the count badges over the doors carry the count instead. */
const LEFT_COLORS = [palette.sand, palette.cream, palette.mintPale, palette.tan, palette.peach, palette.cream];
const RIGHT_COLORS = [palette.cream, palette.tan, palette.mintPale, palette.cream, palette.sand];
const LEFT = quadRowLayout({quads: leftQuads, side: 'left', storeys: 4, colors: LEFT_COLORS, plaque: () => false, seed: 'bpL', plaqueK: 0.16});
const RIGHT = quadRowLayout({quads: rightQuads, side: 'right', storeys: 4, colors: RIGHT_COLORS, plaque: () => false, seed: 'bpR', plaqueK: 0.16});

/** Every side house with its id (near -> far per side). */
export const SIDE_HOUSES: {id: SideId; h: RowHouse}[] = [
  ...LEFT.houses.map((h, i) => ({id: LEFT_IDS[i], h})),
  ...RIGHT.houses.map((h, i) => ({id: RIGHT_IDS[i], h})),
].filter((e): e is {id: SideId; h: RowHouse} => e.id !== null);

/** The set's two side rows (same layout, seeds, pop-ups and ink as BlueprintStreet's 'sides' layer), re-coloured; the
 *  three non-PHP doors carry no PHP lock. Replaces the set's 'sides' node. */
export const SideRows: React.FC<{popAt: Record<SideId, number>; seed?: string}> = ({popAt, seed = 'bp'}) => {
  const pop = (ids: (SideId | null)[]) => (i: number) => (ids[i] ? popAt[ids[i] as SideId] : undefined);
  const lock = (ids: (SideId | null)[]) => (i: number) => (isBlank(ids[i]) ? false : 'closed');
  return (
    <>
      <PerspRow layout={LEFT} popAt={pop(LEFT_IDS)} lock={lock(LEFT_IDS)} ink={[SI.mid, SI.far]} seed={`${seed}/L`} propMin={6} />
      <PerspRow layout={RIGHT} popAt={pop(RIGHT_IDS)} lock={lock(RIGHT_IDS)} ink={[SI.mid, SI.far]} seed={`${seed}/R`} propMin={6} />
    </>
  );
};

// ---------------------------------------------------------------- far plain + horizon skyline (the bare plan's horizon)

const HORIZON = BLUEPRINT.vp[1]; // 950
const SKY_FAR = '#98C0AE'; // day haze ladder (style_bible_ref2 8): farther tier
const SKY_NEAR = '#84B09C'; //                                      nearer tier

const FAR = (() => {
  const r = rng('s03/far');
  let far = '';
  let near = '';
  // farther tier: tall thin blocks with set-back tops; nearer tier: low long blocks (all fill-only, no ink)
  for (let x = -200; x < 1300; ) {
    const w = r.range(40, 95);
    const h = r.range(28, 62);
    far += polyPath([
      [x, HORIZON + 4],
      [x, HORIZON - h],
      [x + w * 0.3, HORIZON - h],
      [x + w * 0.3, HORIZON - h - r.range(6, 16)],
      [x + w * 0.62, HORIZON - h - r.range(6, 16)],
      [x + w * 0.62, HORIZON - h],
      [x + w, HORIZON - h],
      [x + w, HORIZON + 4],
    ]);
    x += w + r.range(-8, 22);
  }
  for (let x = -220; x < 1320; ) {
    const w = r.range(70, 150);
    const h = r.range(12, 30);
    near += polyPath([
      [x, HORIZON + 6],
      [x, HORIZON - h],
      [x + w, HORIZON - h],
      [x + w, HORIZON + 6],
    ]);
    x += w + r.range(10, 50);
  }
  return {far, near};
})();

/** The far construction lines of the bare plan: the horizon and rays from the vanishing point (hidden under the street
 *  and the buildings below y 1180 / once the city is up). */
const RAYS = (() => {
  let d = '';
  for (let i = 0; i <= 14; i++) {
    const xb = -900 + i * 205;
    if (Math.abs(xb - 560) < 60) continue;
    d += line(BLUEPRINT.vp[0], BLUEPRINT.vp[1], BLUEPRINT.vp[0] + (xb - BLUEPRINT.vp[0]) * 1.0, 1200, {seed: `s03/ray${i}`, over: 0, breaks: false, drift: 0.2});
  }
  return d;
})();
const HLINE = line(-120, HORIZON, 1200, HORIZON, {seed: 's03/hz', over: 0});

/** The plain from the horizon down to the street (sand, like the set's street), a low hazy far city on it, and the
 *  plan's horizon + construction rays (drawn on with the grid). */
export const FarPlain: React.FC<{gridAt?: number}> = ({gridAt}) => (
  <>
    <Fill d={FAR.far} color={SKY_FAR} offset={false} mode="none" seed="s03/farA" />
    <Fill d={FAR.near} color={SKY_NEAR} offset={false} mode="none" seed="s03/farB" />
    <Fill rect={[-260, HORIZON, 1600, 1200 - HORIZON + 10]} color={palette.sand} offset={false} mode="none" seed="s03/plain" />
    <Ink d={HLINE} width={1.6} taper={false} seed="s03/hzi" />
    <Ink d={RAYS} at={gridAt} dur={0.25} order="all" width={1.3} taper={false} seed="s03/rays" />
  </>
);

// ---------------------------------------------------------------- the ten footprints (inked lots on the bare plan)

/** Street-side base lines of the two rows (x at screen depth y) and the lots' back lines (toward the VP). */
const baseL = (y: number) => ((1560 - y) * 360) / 380;
const baseR = (y: number) => 1080 - ((1560 - y) * 320) / 380;
const DEPTH = 0.52; // lot depth per px below the horizon
const backL = (y: number) => baseL(y) - (y - HORIZON) * DEPTH;
const backR = (y: number) => baseR(y) + (y - HORIZON) * DEPTH;

type Lot = {quad: Pt[]; door: [Pt, Pt, Pt]; mark: Pt; s: number};

const LOTS: Lot[] = (() => {
  const out: Lot[] = [];
  const persp = (y: number) => (y - HORIZON) / (1560 - HORIZON); // 1 at the nearest lot, ~0.38 at the far ones
  // the press house lot first (it pops first), then the side lots near -> far, alternating (the pop order)
  {
    const k = (1120 - HORIZON) / (1180 - HORIZON);
    const bx0 = 560 + (360 - 560) * k;
    const bx1 = 560 + (760 - 560) * k;
    const s = persp(1176);
    out.push({quad: [[366, 1176], [754, 1176], [bx1 - 4, 1122], [bx0 + 4, 1122]], door: [[500, 1176], [500, 1176 - 34], [538, 1176]], mark: [600, 1146], s});
  }
  const sideLot = (x0: number, x1: number, left: boolean): Lot => {
    // x0 near, x1 far (left: x0 < x1; right: x0 > x1); lots inset a little so the parcels show gaps
    const yb = left ? lBase : rBase;
    const y0 = yb(x0);
    const y1 = yb(x1);
    const g = 3 * persp(y0);
    const ya = y0 - g;
    const yz = y1 + g;
    const base = left ? baseL : baseR;
    const back = left ? backL : backR;
    const inS = left ? -4 : 4;
    const quad: Pt[] = [[base(yz) + inS, yz], [base(ya) + inS, ya], [back(ya), ya], [back(yz), yz]];
    // the door: an opening on the street edge at 0.5-0.74 along the facade (near -> far), with a quarter swing
    const yd0 = ya + (yz - ya) * 0.5;
    const yd1 = ya + (yz - ya) * 0.74;
    const r = Math.abs(yd1 - yd0);
    const hinge: Pt = [base(yd0) + inS, yd0];
    const open: Pt = [hinge[0] + (left ? -r * 1.25 : r * 1.25), yd0];
    const jamb: Pt = [base(yd1) + inS, yd1];
    const s = persp(y0);
    const my = (ya + yz) / 2;
    return {quad, door: [hinge, open, jamb], mark: [(base(my) + back(my)) / 2, my], s};
  };
  const L = LX.slice(1).map((x, i) => (i < LX.length - 2 ? sideLot(x, LX[i + 2], true) : null)).filter((l): l is Lot => !!l);
  const R = RX.slice(1).map((x, i) => (i < RX.length - 2 ? sideLot(x, RX[i + 2], false) : null)).filter((l): l is Lot => !!l);
  for (let i = 0; i < Math.max(L.length, R.length); i++) {
    if (L[i]) out.push(L[i]);
    if (R[i]) out.push(R[i]);
  }
  return out;
})();

/** A convex quad inset by d (each edge moved toward the centroid, consecutive edges intersected): the plan's inner wall
 *  line (double-line walls read as an architect's footprint, not a slab). */
function insetQuad(q: Pt[], d: number): Pt[] {
  const n = q.length;
  const cx = q.reduce((a, p) => a + p[0], 0) / n;
  const cy = q.reduce((a, p) => a + p[1], 0) / n;
  const L = q.map((a, i) => {
    const b = q[(i + 1) % n];
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const len = Math.hypot(dx, dy) || 1;
    let nx = -dy / len;
    let ny = dx / len;
    if (nx * (cx - a[0]) + ny * (cy - a[1]) < 0) {
      nx = -nx;
      ny = -ny;
    }
    return {p: [a[0] + nx * d, a[1] + ny * d] as Pt, v: [dx, dy] as Pt};
  });
  return q.map((_, i) => {
    const A = L[(i + n - 1) % n];
    const B = L[i];
    const den = A.v[0] * B.v[1] - A.v[1] * B.v[0];
    if (Math.abs(den) < 1e-9) return B.p;
    const u = ((B.p[0] - A.p[0]) * B.v[1] - (B.p[1] - A.p[1]) * B.v[0]) / den;
    return [A.p[0] + A.v[0] * u, A.p[1] + A.v[1] * u] as Pt;
  });
}

const LOT_GEO = (() => {
  let fill = '';
  let ink = '';
  let inner = '';
  const marks: string[] = [];
  LOTS.forEach((l, i) => {
    fill += polyPath(l.quad);
    const q = l.quad;
    const w = insetQuad(q, 6 * Math.max(0.5, l.s));
    inner += polyPath(w);
    ink += line(q[0][0], q[0][1], q[1][0], q[1][1], {seed: `s03/lot${i}a`, over: [2, 2], breaks: false}) + line(q[1][0], q[1][1], q[2][0], q[2][1], {seed: `s03/lot${i}b`, over: [2, 3], breaks: false}) + line(q[2][0], q[2][1], q[3][0], q[3][1], {seed: `s03/lot${i}c`, over: [3, 2], breaks: false}) + line(q[3][0], q[3][1], q[0][0], q[0][1], {seed: `s03/lot${i}d`, over: [2, 2], breaks: false});
    // door swing: the leaf (hinge -> open) and its quarter arc back to the jamb; a lot mark (a small cross)
    const [hg, op, jb] = l.door;
    const rr = Math.hypot(op[0] - hg[0], op[1] - hg[1]);
    const sweep = op[0] < hg[0] ? (jb[1] < hg[1] ? 1 : 0) : jb[1] < hg[1] ? 0 : 1;
    const c = 7 * Math.max(0.55, l.s);
    marks.push(
      `M${hg[0].toFixed(1)} ${hg[1].toFixed(1)}L${op[0].toFixed(1)} ${op[1].toFixed(1)}A${rr.toFixed(1)} ${rr.toFixed(1)} 0 0 ${sweep} ${jb[0].toFixed(1)} ${jb[1].toFixed(1)}` +
        `M${(l.mark[0] - c).toFixed(1)} ${(l.mark[1] - c * 0.6).toFixed(1)}L${(l.mark[0] + c).toFixed(1)} ${(l.mark[1] + c * 0.6).toFixed(1)}M${(l.mark[0] + c).toFixed(1)} ${(l.mark[1] - c * 0.6).toFixed(1)}L${(l.mark[0] - c).toFixed(1)} ${(l.mark[1] + c * 0.6).toFixed(1)}`,
    );
  });
  return {fill, ink, inner, marks: marks.join('')};
})();

/** The ten footprints, there from the hard cut: cream lots (3 px misregistered fill) inked solid at 2.2 px with a thin
 *  inner wall line, each with a door swing and a lot cross. */
export const Footprints: React.FC = () => (
  <>
    <Fill d={LOT_GEO.fill} color={palette.cream} offset={[3, 2]} mode="none" seed="s03/lots" />
    <Ink d={LOT_GEO.ink} width={2.2} taper={false} seed="s03/foot" />
    <Ink d={LOT_GEO.inner} width={1.2} taper={false} seed="s03/footw" />
    <Ink d={LOT_GEO.marks} width={1.6} taper={false} seed="s03/footm" />
  </>
);

// ---------------------------------------------------------------- the plan sheet: S02's teal frame band + the dog-ear

const SHEET = (() => {
  const yF = 1238;
  const yN = 2080;
  const lB = (y: number) => 360 - ((360 + 140) * (y - 1180)) / (1708 - 1180);
  const rB = (y: number) => 760 + ((1226 - 760) * (y - 1180)) / (1726 - 1180);
  const inset = (y: number) => 10 + ((y - yF) / (2060 - yF)) * 34;
  const sL = (y: number) => lB(y) + inset(y);
  const sR = (y: number) => rB(y) - inset(y);
  const u = (y: number) => (y - yF) / (yN - yF);
  const gap = (y: number) => 4 + 5 * u(y);
  const bw = (y: number) => 10 + 14 * u(y);
  const yL = yF + 30; // the left band starts below the dog-ear
  const left = polyPath([[sL(yL) + gap(yL), yL], [sL(yN) + gap(yN), yN], [sL(yN) + gap(yN) + bw(yN), yN], [sL(yL) + gap(yL) + bw(yL), yL]]);
  const right = polyPath([[sR(yF) - gap(yF), yF + 3], [sR(yN) - gap(yN), yN], [sR(yN) - gap(yN) - bw(yN), yN], [sR(yF + 8) - gap(yF) - bw(yF), yF + 8]]);
  const far = polyPath([[sL(yF) + 30, yF + 3], [sR(yF) - gap(yF), yF + 3], [sR(yF + 8) - gap(yF) - bw(yF), yF + 8], [sL(yF + 8) + 30, yF + 8]]);
  const inner =
    line(sL(yL) + gap(yL) + bw(yL), yL, sL(yN) + gap(yN) + bw(yN), yN, {seed: 's03/bandL', over: 0, breaks: false}) +
    line(sR(yF + 8) - gap(yF) - bw(yF), yF + 8, sR(yN) - gap(yN) - bw(yN), yN, {seed: 's03/bandR', over: 0, breaks: false}) +
    line(sL(yF + 8) + 30, yF + 8, sR(yF + 8) - gap(yF) - bw(yF), yF + 8, {seed: 's03/bandF', over: 0, breaks: false}) +
    line(sL(yL) + gap(yL), yL, sL(yF) + 30, yF + 3, {seed: 's03/bandC', over: 0, breaks: false});
  // the dog-ear flap (the set draws it white with one open side): cream, with an ink fold line on its open side
  const A: Pt = [sL(yF) + 22, yF];
  const B: Pt = [sL(yF + 22), yF + 22];
  const C: Pt = [sL(yF) + 26, yF + 26];
  const ear = polyPath([A, B, C]);
  const earInk = line(C[0], C[1], A[0], A[1], {seed: 's03/earI', over: 0, breaks: false});
  return {band: left + right + far, inner, ear, earInk};
})();

/** S02's paper language on S03's plan: the teal frame band along the sheet's edges (inner ink line) and the dog-ear
 *  folded cream with its fold inked. */
export const SheetFrame: React.FC = () => (
  <>
    <Fill d={SHEET.band} color={palette.teal} offset={false} mode="none" seed="s03/band" />
    <Ink d={SHEET.inner} width={1.6} taper={false} seed="s03/bandI" />
    <Fill d={SHEET.ear} color={palette.cream} offset={false} mode="none" seed="s03/ear" />
    <Ink d={SHEET.earInk} width={1.6} taper={false} seed="s03/earI" />
  </>
);

// ---------------------------------------------------------------- a street tree at the near left edge (charm, colour)

const TREE = (() => {
  const cx = 18;
  const cy = 1116;
  const crownD = crown(cx, cy, 92, 100, {seed: 's03/tree', bumps: 10});
  const ticks = crownTicks(cx, cy, 92, 100, {seed: 's03/treek', n: 4, size: 12});
  const tx = 30;
  const trunk = polyPath([[tx - 8, 1200], [tx + 8, 1200], [tx + 9, 1566], [tx - 9, 1566]]);
  const trunkInk = line(tx - 8, 1205, tx - 9, 1566, {seed: 's03/tt1', over: 0}) + line(tx + 8, 1212, tx + 9, 1566, {seed: 's03/tt2', over: 0});
  return {crownD, ticks, trunk, trunkInk, base: [tx, 1566] as Pt};
})();

/** A sage street tree in front of L1, cropped by the frame's left edge (crown screen y ~1040-1240, below the caption
 *  band); it pops up with L1. */
export const EdgeTree: React.FC<{at?: number}> = ({at}) => (
  <PopUp at={at} x={TREE.base[0]} y={TREE.base[1]}>
    <Fill d={TREE.trunk} color={palette.brown} seed="s03/treeT" />
    <Ink d={TREE.trunkInk} width={SI.mid} taper={false} seed="s03/treeTi" />
    <Fill d={TREE.crownD} color={palette.sage} seed="s03/treeC" />
    <Ink d={TREE.crownD} width={SI.mid} open={0.14} seed="s03/treeCi" />
    <Ink d={TREE.ticks} width={SI.far} taper={false} seed="s03/treeK" />
  </PopUp>
);

// ---------------------------------------------------------------- browser screens: unlit -> peach pop -> lit page

const GLOW = 0.067; // two frames of peach

type Q4 = [Pt, Pt, Pt, Pt];
/** The 4 corners of a quadPath (TL, TR, BR, BL as seen: the left pair swapped if needed). */
function quadOf(d: string): Q4 {
  const n = (d.match(/-?\d+(?:\.\d+)?/g) ?? []).map(Number);
  let q: Q4 = [[n[0], n[1]], [n[2], n[3]], [n[4], n[5]], [n[6], n[7]]];
  if (q[0][0] > q[1][0]) q = [q[1], q[0], q[3], q[2]];
  return q;
}
const bil = (q: Q4, u: number, v: number): Pt => {
  const a: Pt = [q[0][0] + (q[1][0] - q[0][0]) * u, q[0][1] + (q[1][1] - q[0][1]) * u];
  const b: Pt = [q[3][0] + (q[2][0] - q[3][0]) * u, q[3][1] + (q[2][1] - q[3][1]) * u];
  return [a[0] + (b[0] - a[0]) * v, a[1] + (b[1] - a[1]) * v];
};
const sub = (q: Q4, u0: number, v0: number, u1: number, v1: number) => polyPath([bil(q, u0, v0), bil(q, u1, v0), bil(q, u1, v1), bil(q, u0, v1)]);
const seg = (q: Q4, u0: number, u1: number, v: number) => {
  const a = bil(q, u0, v);
  const b = bil(q, u1, v);
  return `M${a[0].toFixed(1)} ${a[1].toFixed(1)}L${b[0].toFixed(1)} ${b[1].toFixed(1)}`;
};

/** A lit page in a side screen (the press-house page recipe scaled to the window): a peach header across the top
 *  third, hairline text rows; the PHP sites carry a small solid ink elephant (the count is about websites). */
const Page: React.FC<{q: Q4; php: boolean; seed: string}> = ({q, php, seed}) => {
  const w = Math.hypot(q[1][0] - q[0][0], q[1][1] - q[0][1]);
  const h = Math.hypot(q[3][0] - q[0][0], q[3][1] - q[0][1]);
  const rows = php ? seg(q, 0.12, 0.5, 0.5) + seg(q, 0.12, 0.42, 0.66) + seg(q, 0.12, 0.88, 0.84) : seg(q, 0.12, 0.84, 0.5) + seg(q, 0.12, 0.66, 0.66) + seg(q, 0.12, 0.8, 0.84);
  const c = bil(q, 0.73, 0.6);
  const es = Math.min(w * 0.42, h * 0.5);
  return (
    <>
      <Fill d={sub(q, 0.1, 0.1, 0.9, 0.32)} color={palette.peach} offset={false} mode="none" seed={`${seed}/hd`} />
      <Ink d={rows} width={w > 45 ? 1.4 : 1.1} taper={false} seed={`${seed}/tx`} />
      {php ? <ElephantEmblem x={c[0]} y={c[1]} size={es} mode="solid" color={palette.ink} seed={`${seed}/el`} /> : null}
    </>
  );
};

/** One screen overlay: unlit sage glass before `lightAt`, peach for two frames at it (the glow pop), then the set's lit
 *  screen with S03's page on it. */
const ScreenState: React.FC<{d: string; lightAt: number; php: boolean; seed: string}> = ({d, lightAt, php, seed}) => {
  const t = useTime();
  if (t < lightAt) return <Fill d={d} color={palette.sage} offset={false} mode="none" seed={seed} />;
  if (t < lightAt + GLOW) return <Fill d={d} color={palette.peach} offset={false} mode="none" seed={`${seed}/p`} />;
  return <Page q={quadOf(d)} php={php} seed={`${seed}/pg`} />;
};

// ---------------------------------------------------------------- count badges (a plaque over every door)

/** Badge size (world px) by the facade's on-screen height: 30-44 px on screen (>= 30 px at the far end). */
const badgeSize = (h: RowHouse) => Math.max(30, Math.min(42, h.h * 0.046));

/** Per side house: its screen state + page, an awning (L2 / R2), the count badge that springs on at `badgeAt` (a sand
 *  elephant plaque on the 7 PHP sites, a blank cream plate of the same size on the 3 others) with an ink ping ring. */
export const SideOverlays: React.FC<{popAt: Record<SideId, number>; lightAt: Record<SideId, number>; badgeAt: Partial<Record<SideId, number>>; awnings?: SideId[]}> = ({popAt, lightAt, badgeAt, awnings = ['L2', 'R2']}) => (
  <>
    {SIDE_HOUSES.map(({id, h}) => {
      const php = !isBlank(id);
      const size = badgeSize(h);
      const [bx, by] = h.overDoor;
      const at = badgeAt[id];
      return (
        <PopUp key={id} at={popAt[id]} x={h.base[0]} y={h.base[1]}>
          <ScreenState d={h.g.screen} lightAt={lightAt[id]} php={php} seed={`s03/scr${id}`} />
          {awnings.includes(id) && h.g.awning ? (
            <>
              <Fill d={h.g.awning} color={palette.peach} seed={`s03/aw${id}`} />
              <Ink d={h.g.awning} width={1.6} taper={false} seed={`s03/awi${id}`} />
            </>
          ) : null}
          {at !== undefined ? (
            <>
              <ElephantPlaque x={bx} y={by - size * 0.15} size={size} variant={php ? 'plate' : 'blank'} tickOnAt={at} ink={2} seed={`s03/badge${id}`} />
              {php ? <CountPing x={bx} y={by - size * 0.15} r={size * 0.72} at={at} /> : null}
            </>
          ) : null}
        </PopUp>
      );
    })}
  </>
);

/** The press house's screen (BrowserChrome screen rect under its bar): unlit, peach pop, the set's page; re-pulses
 *  (peach, 2 frames) at `pulseAt`. */
export const PressScreen: React.FC<{lightAt: number; pulseAt?: number}> = ({lightAt, pulseAt}) => {
  const t = useTime();
  const [wx, wy, ww, wh] = BLUEPRINT.window;
  const s = chromeScreen(wx, wy, ww, wh);
  const d = `M${s.x} ${s.y}H${s.x + s.w}V${s.y + s.h}H${s.x}Z`;
  const pulse = pulseAt !== undefined && t >= pulseAt && t < pulseAt + GLOW;
  if (t < lightAt) return <Fill d={d} color={palette.sage} offset={false} mode="none" seed="s03/scrP" />;
  if (t < lightAt + GLOW || pulse) return <Fill d={d} color={palette.peach} offset={false} mode="none" seed="s03/scrPp" />;
  return null;
};

// ---------------------------------------------------------------- count pings

/** An ink ring that pops at r and expands to 1.8 r while thinning to nothing (0.32 s): a count "tick". */
export const CountPing: React.FC<{x: number; y: number; r: number; at: number; width?: number}> = ({x, y, r, at, width = 3.4}) => {
  const t = useTime();
  if (t < at) return null;
  const p = prog(t, at, 0.32, E.outCubic);
  if (p >= 1) return null;
  return <circle cx={x} cy={y} r={r * (1 + 0.8 * p)} fill="none" stroke={palette.ink} strokeWidth={width * (1 - p * 0.85) + 0.01} />;
};

// ---------------------------------------------------------------- roof vent puffs (several)

/** Paper sheets puffed out of the press-house roof vent at each time (n sheets, 0.12 s apart): they tumble UP-LEFT
 *  (dx -100..-140, rise 110-140), away from the sun's disc (its left edge is at screen x 580), ending at screen x
 *  <= ~540. Render this BEHIND the sun (in the set's 'sun' layer, before the sun): the vent sits at the disc's
 *  lower-left edge, so a sheet never crosses the 7/10 pie. */
export const VentPuffs: React.FC<{times: number[]; n?: number; seed?: string}> = ({times, n = 2, seed = 's03/vent'}) => {
  const t = useTime();
  const V = BLUEPRINT.vent;
  const out: React.ReactNode[] = [];
  times.forEach((at, j) => {
    const r = rng(`${seed}/${j}`);
    for (let i = 0; i < n; i++) {
      const t0 = at + i * 0.12;
      if (t < t0) continue;
      const p = prog(t, t0, 0.9, E.outCubic);
      if (p >= 1) continue;
      const dx = -(i % 2 ? r.range(125, 140) : r.range(100, 115));
      const rise = i % 2 ? r.range(105, 120) : r.range(130, 145);
      const x = V.x + dx * p + Math.sin(p * 6 + i + j) * 6;
      const y = V.y - 30 - rise * p;
      const rot = -50 * p + Math.sin(p * 9 + i) * 18;
      out.push(
        <XG key={`${j}/${i}`} m={mat.about(mat.rotate(rot), x, y)}>
          <Fill rect={[x - 8, y - 10, 16, 20]} color={palette.white} offset={false} mode="snap" seed={`${seed}/f${j}${i}`} />
          <Ink d={rect(x - 8, y - 10, 16, 20, {seed: `${seed}/i${j}${i}`, over: 'small'}) + `M${x - 5} ${y - 4}L${x + 4} ${y - 4}M${x - 5} ${y + 1}L${x + 5} ${y + 1}`} width={1.6} taper={false} seed={`${seed}/k${j}${i}`} />
        </XG>,
      );
    }
  });
  return <>{out}</>;
};

export type {BlueprintId};

// ---------------------------------------------------------------- the pen-nib sign, made visible

/** The set's pen-nib sign hangs at BLUEPRINT.sign (795, 930), which is entirely BEHIND building R4 in this framing (R4's
 *  facade covers x 760-840 from y 800 down). S03 hangs the same sign (cream disc + ink nib, r 32) from a little iron
 *  pole on the press house's left roof slope instead, against the sky, where it can swing and Bit can ride it (the
 *  set's own sign is switched off: BlueprintStreet sign={false}). */
export const ROOF_SIGN = {pole: [438, 832] as Pt, top: 704, hook: [392, 712] as Pt, x: 392, y: 762, r: 32};

export const RoofSign: React.FC<{swingAt?: number; seed?: string}> = ({swingAt, seed = 's03/nib'}) => {
  const t = useTime();
  const S = ROOF_SIGN;
  const a = swingAt !== undefined && t >= swingAt ? -16 * Math.exp(-5 * (t - swingAt)) * Math.cos((t - swingAt) * 12.5) : 0;
  const nib = `M${S.x} ${S.y - 19}L${S.x + 12} ${S.y + 4}L${S.x} ${S.y + 21}L${S.x - 12} ${S.y + 4}Z`;
  const pole =
    line(S.pole[0], S.pole[1] + 6, S.pole[0], S.top, {seed: `${seed}/p`, over: [0, 4], breaks: false}) +
    line(S.pole[0] + 2, S.top + 8, S.x - 22, S.top + 8, {seed: `${seed}/arm`, over: [0, 5], breaks: false}) +
    line(S.pole[0], S.top + 34, S.pole[0] - 26, S.top + 8, {seed: `${seed}/br`, over: 0, breaks: false});
  return (
    <>
      <Ink d={pole} width={3.0} taper={false} seed={`${seed}/pi`} />
      <XG m={mat.about(mat.rotate(a), S.hook[0], S.top + 8)}>
        <Ink d={`M${S.x - 15} ${S.top + 8}L${S.x - 18} ${S.y - S.r + 4}M${S.x + 15} ${S.top + 8}L${S.x + 18} ${S.y - S.r + 4}`} width={1.6} taper={false} seed={`${seed}/h`} />
        <Fill d={`M${S.x - S.r} ${S.y}a${S.r} ${S.r} 0 1 0 ${2 * S.r} 0a${S.r} ${S.r} 0 1 0 ${-2 * S.r} 0Z`} color={palette.cream} seed={`${seed}/df`} />
        <Ink d={`M${S.x - S.r} ${S.y}a${S.r} ${S.r} 0 1 0 ${2 * S.r} 0a${S.r} ${S.r} 0 1 0 ${-2 * S.r} 0`} width={3.0} taper={false} seed={`${seed}/di`} />
        <Fill d={nib} color={palette.ink} offset={false} mode="none" seed={`${seed}/nib`} />
        <Ink d={`M${S.x} ${S.y - 5}L${S.x} ${S.y + 19}`} width={2} color={palette.cream} taper={false} seed={`${seed}/slit`} />
        <circle cx={S.x} cy={S.y - 3} r={3} fill={palette.cream} />
      </XG>
    </>
  );
};
