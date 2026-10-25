// S03 scene-owned overlays on the shared BlueprintStreet (injected through the set's `wrap` layers, so they sit at the
// right depth): the far plain (paper, the plan's grid running to a bare horizon) that the bare plan runs to before the
// city springs up, the ten inked FOOTPRINTS (lots, solid ink, door swings, lot marks), S02's teal frame band on the
// plan sheet + the dog-ear fold, the side rows re-coloured (S03 replaces the set's 'sides' layer with the same rows:
// mint / peach facades, no tiny plaques, no PHP lock on the three non-PHP doors), awnings, flower boxes, the
// browser-screen states, which ARE the street's count (polish round 1: one encoding, no blade signs): unlit sage glass
// until 'seven', when the six side PHP screens light near -> far with the elephant page and an orange ping (the press
// house counts first with its plaque); the three non-PHP screens blink and go dark on 'ten'; the PHP pages
// re-pulse on 'websites'), the bird wire, S03's roof vent (moved off the sun's edge) and its puffs.
//
// The side-building geometry is the set's own layout, rebuilt here with the SAME inputs (quadRowLayout is pure and
// memoised): LX / RX / lTop / lBase / rTop / rBase and the sheet edge (yF, lB, rB, inset) are copied from
// sets/BlueprintStreet.tsx. If that set's geometry changes, update them.

import React from 'react';
import {palette} from '../../lib/theme';
import {ease as E, prog, springAt, springs, useTime} from '../../lib/time';
import {Ink} from '../../lib/Ink';
import {Fill} from '../../lib/Fill';
import {circle, crown, crownTicks, line, polyPath, rect, Pt} from '../../lib/sketch';
import {mat, XG} from '../../lib/xf';
import {rng} from '../../lib/rng';
import {Quad} from '../../lib/persp';
import {BLUEPRINT, PerspRow, PopUp, quadRowLayout, RowHouse, SI, SideId, BlueprintId} from '../shared/sets';
import {chromeScreen, ElephantEmblem} from '../shared/props';
import {Bird} from '../../lib/kit';

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
/** S03's three non-PHP sites. Fix round 2b (finding: with L1 / R1 / L5 blank the street read 'every visible building
 *  is PHP': L1 is cut by the left frame edge, R1 sits under the right UI rail, L5 is the smallest): the storyboard's
 *  MID-DEPTH blanks L3, R4, L5, all clear of the frame edges and the rail (screen x 169-213, 774-828, 298-339). L1 and
 *  R1 are PHP sites (a partly hidden elephant page does not hurt a majority). The blanks stay UNLIT glass and go dark
 *  (tealDark) on 'ten', so 7 bright elephant pages vs 3 dark panes read as a 7:3 split at phone size. */
export const S03_BLANK: SideId[] = ['L3', 'R4', 'L5'];
const isBlank = (id: SideId | null) => id !== null && S03_BLANK.includes(id);
/** Fix round 1 palette: the set's rows were ~70 % one brown family. Same rows, re-coloured: L2 / R2 mintPale, L4 peach,
 *  L3 tan (was mint, next to L2), R3 cream; the bleed slivers and L1 / L5 / R1 / R4 keep the set's colours. The tiny
 *  side plaques are dropped (`plaque: false`): the screens carry the count instead. */
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

// ---------------------------------------------------------------- the far plain: the plan sheet runs to the horizon

const HORIZON = BLUEPRINT.vp[1]; // 950

/** Polish round 1 (finding: beyond the near sheet the bare plan read as a tan desert with long construction rays and a
 *  sage skyline that gave the pop-up away): the whole ground is PAPER before the city springs up. The far plain is
 *  cream (one step darker only as an 8 px sand band at the horizon), and the plan's perspective grid runs on to the
 *  horizon over it: the sheet's own rays continued (the same rays, every second one up to y 1060, every fourth one up to
 *  y 990, so the fan thins with distance instead of knotting at the VP) and six cross lines spaced by the sheet's own
 *  depth law, all in inkHair 1.6. No skyline: the horizon is bare apart from the sun (the set's far peeks pop with the
 *  street). The sand street (GroundS03 `streetAt`) covers the plain's near part once the city is up. */
// Fix round 2b (finding: the bare plan read as a CAD / tiled-floor template, half flat sky, half evenly ruled grid): the
// far field is THINNED so the footprints are the figure and the grid the ground: every FOURTH sheet ray only (was every
// second), starting 110-170 px below the horizon (so the band toward the horizon is plain cream), drawn as broken
// strokes; two of the six far cross lines, broken.
/** A loose broken stroke from (x0, y0) to (x1, y1): 2-3 pieces with wide gaps (24-70 px), the far piece sometimes left
 *  out: a few broken strokes, not a ruled line. */
function sparse(x0: number, y0: number, x1: number, y1: number, seed: string, dropFar = false): string {
  const r = rng(seed);
  const L = Math.hypot(x1 - x0, y1 - y0);
  const n = L > 500 ? 3 : 2;
  let d = '';
  let a = 0;
  for (let i = 0; i < n; i++) {
    const b = i === n - 1 ? 1 : a + ((1 - a) / (n - i)) * r.range(0.7, 1.15);
    const g = i ? r.range(24, 70) / L : 0;
    if (!(dropFar && i === 0) && b - (a + g) > 0.04) d += line(x0 + (x1 - x0) * (a + g), y0 + (y1 - y0) * (a + g), x0 + (x1 - x0) * b, y0 + (y1 - y0) * b, {seed: `${seed}/${i}`, over: 0, breaks: false, drift: 0.15});
    a = b;
  }
  return d;
}

const PLAIN = (() => {
  const VP = BLUEPRINT.vp;
  const xAt = (xb: number, y: number) => VP[0] + ((xb - VP[0]) * (y - VP[1])) / (2060 - VP[1]);
  let rays = '';
  for (let i = -6; i <= 32; i += 4) {
    const xb = -1500 + i * 190; // the sheet's rays (ground.tsx: xb = -1500 + i * 190 at y 2060)
    const y0 = i % 8 === 2 ? 1060 : 1120;
    // clip to the frame (+ bleed): solve x = -160 / 1240 for y
    let y1 = 2060;
    for (const xe of [-160, 1240]) {
      if ((xb - VP[0]) * (xe - VP[0]) > 0 && Math.abs(xb - VP[0]) > Math.abs(xe - VP[0])) y1 = Math.min(y1, VP[1] + ((xe - VP[0]) * (2060 - VP[1])) / (xb - VP[0]));
    }
    if (y1 <= y0 + 10) continue;
    rays += sparse(xAt(xb, y0), y0, xAt(xb, y1), y1, `s03/pr${i}`, i % 8 === 6);
  }
  let cross = '';
  [4.0, 2.7].forEach((k, j) => {
    const y = VP[1] + (2060 - VP[1]) * Math.pow(k / 10, 1.6);
    cross += sparse(-140, y, 1220, y, `s03/pc${j}`);
  });
  return {rays, cross};
})();
const HLINE = line(-120, HORIZON, 1200, HORIZON, {seed: 's03/hz', over: 0});
/** Fix round 3 (finding: the band between the horizon and the caption floor was empty mint with no edge): a 1 px RULER
 *  along the horizon: minor ticks (4 px) every 24 px rising from the horizon line, major ticks (10 px) every 120 px, and
 *  a dashed 1 px line along the major ticks' tops (dash 12, gap 7): the plan's scale bar, the bare band's edge. */
const RULER = (() => {
  let ticks = '';
  for (let x = -96, i = 0; x <= 1176; x += 24, i++) {
    const hgt = i % 5 === 0 ? 10 : 4;
    ticks += `M${x} ${HORIZON - 0.5}L${(x + 0.4).toFixed(1)} ${HORIZON - hgt}`;
  }
  let dash = '';
  for (let x = -96; x < 1176; x += 19) dash += `M${x} ${HORIZON - 10}L${Math.min(x + 12, 1176)} ${HORIZON - 10.3}`;
  return {ticks, dash};
})();

/** The bare plan's far half: cream paper from the horizon down (under the ground layer), the sand horizon band, the
 *  horizon line and the plan's grid running to it (inked from the cut). */
export const FarPlain: React.FC = () => (
  <>
    <Fill rect={[-260, HORIZON, 1600, 2200 - HORIZON]} color={palette.cream} offset={false} mode="none" seed="s03/plain" />
    <Fill rect={[-260, HORIZON, 1600, 8]} color={palette.sand} offset={false} mode="none" seed="s03/plainH" />
    <Ink d={HLINE} width={1.6} taper={false} seed="s03/hzi" />
    <Ink d={RULER.ticks + RULER.dash} width={1} taper={false} vary={0} seed="s03/ruler" />
    <Ink d={PLAIN.rays + PLAIN.cross} width={1.6} taper={false} seed="s03/plainG" />
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

/** Fix round 2b (finding: 2.2 px outlines on cream were ~0.8 px at phone width, so the buildings appeared from nowhere):
 *  the lots are the bare plan's FIGURE. Each lot is a flat SAND fill (one palette step darker than the paper,
 *  misregistered 3 px), its near and street-side edges inked at 3.4 px (the press lot: near + both sides), its back and
 *  far edges at 2.2, a thin inner wall line, and the door swing + lot cross at 2.2. Each lot's outline is stored on its
 *  own so it can 'tick' (a 2-frame heavy stroke) as its building pops up on it. */
const LOT_GEO = (() => {
  let fill = '';
  let heavy = '';
  let light = '';
  let inner = '';
  const outline: string[] = [];
  const marks: string[] = [];
  LOTS.forEach((l, i) => {
    fill += polyPath(l.quad);
    const q = l.quad;
    const w = insetQuad(q, 7 * Math.max(0.5, l.s));
    inner += polyPath(w);
    const e = [
      line(q[0][0], q[0][1], q[1][0], q[1][1], {seed: `s03/lot${i}a`, over: [2, 2], breaks: false}),
      line(q[1][0], q[1][1], q[2][0], q[2][1], {seed: `s03/lot${i}b`, over: [2, 3], breaks: false}),
      line(q[2][0], q[2][1], q[3][0], q[3][1], {seed: `s03/lot${i}c`, over: [3, 2], breaks: false}),
      line(q[3][0], q[3][1], q[0][0], q[0][1], {seed: `s03/lot${i}d`, over: [2, 2], breaks: false}),
    ];
    // side lots: q0-q1 the street edge, q1-q2 the near edge (heavy); press lot (i 0): q0-q1 near, q1-q2 / q3-q0 sides
    const hv = i === 0 ? [0, 1, 3] : [0, 1];
    e.forEach((d, k) => (hv.includes(k) ? (heavy += d) : (light += d)));
    outline.push(e.join(''));
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
  return {fill, heavy, light, inner, outline, marks: marks.join('')};
})();

/** The ten footprints, there from the hard cut: flat sand lots (3 px misregistered fill), near / street edges 3.4 px,
 *  back / far edges 2.2, a thin inner wall line, door swings and lot crosses 2.2. `tickAt[i]` (lot order: P, L1, R1,
 *  L2, R2, L3, R3, L4, R4, L5 = the pop order): that lot's outline ticks heavy (4.8 px, 2 frames) as its building pops
 *  up on it, so the plan-to-street link reads. */
export const Footprints: React.FC<{tickAt?: number[]}> = ({tickAt = []}) => {
  const t = useTime();
  const ticking = LOT_GEO.outline.filter((_, i) => tickAt[i] !== undefined && t >= tickAt[i] && t < tickAt[i] + GLOW).join('');
  return (
    <>
      <Fill d={LOT_GEO.fill} color={palette.tan} offset={[3, 2]} mode="none" seed="s03/lots" />
      <Ink d={LOT_GEO.inner} width={1.4} taper={false} seed="s03/footw" />
      <Ink d={LOT_GEO.light} width={2.2} taper={false} seed="s03/footL" />
      <Ink d={LOT_GEO.heavy} width={3.4} taper={false} seed="s03/foot" />
      <Ink d={LOT_GEO.marks} width={2.2} taper={false} seed="s03/footm" />
      {ticking ? <Ink d={ticking} width={4.8} taper={false} seed="s03/footT" /> : null}
    </>
  );
};

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

// ---------------------------------------------------------------- construction elevations (the bare plan's top half)

/** An open-cornered hairline edge from a to b: it stops `gap` px short of both corners (ref 1's construction lines never
 *  close a corner) and a long edge is drawn as two pieces with a small break. Drawn from a toward b. */
function openEdge(a: Pt, b: Pt, seed: string, gap = 7): string {
  const L = Math.hypot(b[0] - a[0], b[1] - a[1]);
  const r = rng(seed);
  const at = (u: number): Pt => [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u];
  const piece = (u0: number, u1: number, k: string) => {
    const p = at(u0);
    const q = at(u1);
    return line(p[0], p[1], q[0], q[1], {seed: `${seed}/${k}`, over: 0, breaks: false, drift: 0.25});
  };
  const g0 = gap / L;
  const g1 = 1 - (gap * r.range(0.6, 1.4)) / L;
  if (L < 240) return piece(g0, g1, 'a');
  const m = r.range(0.4, 0.62);
  const hg = r.range(9, 20) / L;
  return piece(g0, m - hg / 2, 'a') + piece(m + hg / 2, g1, 'b');
}

/** Fix round 3 (finding: the bare-plan opener (f0-f32, 18 % of the scene) was the weakest composition: an empty mint
 *  band over a dead-centre horizon, a beige floor at phone size): reference 1's grammar, linework first, fills later.
 *  From the cut, HAIRLINE (1.4 px) construction elevations draw UP from the footprints, outline only, broken and
 *  open-cornered: the press house's gable (both walls bottom -> top, then the eaves and roof slopes, then its door and
 *  browser-window outlines) and the first two bays of each side row (L1 L2, R1 R2: their walls' verticals, then the
 *  rooflines toward the VP and one storey line). The 1.07 s pop-up fills and solidifies them: each building rises over
 *  its own outline, which is dropped once that building is fully up (covered: never a fade). */
const ELEV = (() => {
  const P = BLUEPRINT.press;
  const [wx, wy, ww, wh] = BLUEPRINT.window;
  const [dx, dy, dw, dh] = BLUEPRINT.door;
  // every edge is its own path (drawn on as one pen stroke, its broken pieces in sequence: never a floating piece)
  const press = {
    walls: [openEdge([P.x0, P.base], [P.x0, P.eaves], 's03/ce/pw0'), openEdge([P.x1, P.base], [P.x1, P.eaves], 's03/ce/pw1')],
    roof: [openEdge([P.x0 - 16, P.eaves + 6], P.apex, 's03/ce/pr0'), openEdge([P.x1 + 16, P.eaves + 6], P.apex, 's03/ce/pr1'), openEdge([P.x0, P.eaves], [P.x1, P.eaves], 's03/ce/pe')],
    openings: [
      openEdge([dx, dy + dh], [dx, dy], 's03/ce/pd0', 5) + openEdge([dx, dy], [dx + dw, dy], 's03/ce/pd1', 5) + openEdge([dx + dw, dy], [dx + dw, dy + dh], 's03/ce/pd2', 5),
      openEdge([wx, wy + wh], [wx, wy], 's03/ce/pq0', 5) + openEdge([wx, wy], [wx + ww, wy], 's03/ce/pq1', 5) + openEdge([wx + ww, wy], [wx + ww, wy + wh], 's03/ce/pq2', 5) + openEdge([wx + ww, wy + wh], [wx, wy + wh], 's03/ce/pq3', 5),
    ],
  };
  // side bays: L1 = leftQuads[1], L2 = leftQuads[2], R1 = rightQuads[1], R2 = rightQuads[2]
  const bay = (q: Quad, left: boolean, id: string) => {
    // each bay draws its street-side (far) vertical only (left row: q[1]-q[2]; right row: q[0]-q[3]): the second bay's
    // near vertical IS the first bay's far one, and the first bay's near edge is the frame edge
    const farTop = left ? q[1] : q[0];
    const farBot = left ? q[2] : q[3];
    const nearTop = left ? q[0] : q[1];
    const nearBot = left ? q[3] : q[2];
    const storey = (v: number, k: string) => {
      const s0: Pt = [nearTop[0] + (nearBot[0] - nearTop[0]) * v, nearTop[1] + (nearBot[1] - nearTop[1]) * v];
      const s1: Pt = [farTop[0] + (farBot[0] - farTop[0]) * v, farTop[1] + (farBot[1] - farTop[1]) * v];
      return openEdge(s0, s1, `s03/ce/${id}${k}`, 9);
    };
    return {
      wall: openEdge(farBot, farTop, `s03/ce/${id}v`),
      roof: openEdge(nearTop, farTop, `s03/ce/${id}r`, 5),
      storeys: storey(0.28, 's1') + storey(0.52, 's2'),
    };
  };
  return {press, L1: bay(leftQuads[1], true, 'L1'), L2: bay(leftQuads[2], true, 'L2'), R1: bay(rightQuads[1], false, 'R1'), R2: bay(rightQuads[2], false, 'R2')};
})();
const CE_W = 1.4;

/** One construction edge drawn on as a single pen stroke (its pieces in sequence) from `at` over `dur`. */
const CE: React.FC<{d: string; at: number; dur: number; w?: number; seed: string}> = ({d, at, dur, w = CE_W, seed}) => (
  <Ink d={d} at={at} dur={dur} order="seq" pace="free" width={w} taper={false} seed={seed} />
);

/** The press house's construction elevation (render in the press layer, before the set's node): walls bottom -> top
 *  from -0.10, the roof slopes (eaves -> apex) and the eaves line from 0.10, door + window from 0.18; dropped once the
 *  house is fully up (pressAt + 0.22). */
export const PressElevation: React.FC<{pressAt: number}> = ({pressAt}) => {
  const t = useTime();
  if (t >= pressAt + 0.22) return null;
  const E0 = ELEV.press;
  return (
    <>
      {E0.walls.map((d, i) => <CE key={`w${i}`} d={d} at={-0.1 + i * 0.03} dur={0.22} seed={`s03/ce/pW${i}`} />)}
      {E0.roof.map((d, i) => <CE key={`r${i}`} d={d} at={0.1 + i * 0.03} dur={0.14} seed={`s03/ce/pR${i}`} />)}
      {E0.openings.map((d, i) => <CE key={`o${i}`} d={d} at={0.18 + i * 0.04} dur={0.16} w={1.2} seed={`s03/ce/pO${i}`} />)}
    </>
  );
};

/** The first two bays of each side row (render in the sides layer, before the rows): the walls draw up from the
 *  footprints (L1 / R1 from -0.06, L2 / R2 0.04 s later), then the rooflines (from the frame edge toward the VP) and two
 *  storey lines; each bay is dropped once its building is up (popAt + 0.22). */
export const SideElevations: React.FC<{popAt: Record<SideId, number>}> = ({popAt}) => {
  const t = useTime();
  const ids: ('L1' | 'R1' | 'L2' | 'R2')[] = ['L1', 'R1', 'L2', 'R2'];
  return (
    <>
      {ids.map((id, i) => {
        if (t >= popAt[id] + 0.22) return null;
        const B = ELEV[id];
        const d0 = i < 2 ? -0.06 : -0.02;
        return (
          <React.Fragment key={id}>
            <CE d={B.wall} at={d0} dur={0.24} seed={`s03/ce/${id}W`} />
            <CE d={B.roof} at={0.16 + i * 0.02} dur={0.14} seed={`s03/ce/${id}R`} />
            <CE d={B.storeys} at={0.24 + i * 0.02} dur={0.18} w={1.2} seed={`s03/ce/${id}S`} />
          </React.Fragment>
        );
      })}
    </>
  );
};

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

/** Where a PHP page's elephant (and the count ping) sits in its screen, per site (default: centred, u 0.5). Fix round
 *  2b: R2's screen (x 926-980 on screen) is half under the right UI rail (x > 950): its elephant shrinks to 0.8 and
 *  shifts toward the street (u 0.4), its ping ring is centred at u 0.25 (~13 px further left), so the tick's centroid
 *  moves off the rail. */
const PAGE_AT: Partial<Record<SideId, {u: number; k: number; pingU: number; v?: number; pingV?: number}>> = {
  R2: {u: 0.4, k: 0.8, pingU: 0.25},
  // fix round 3 (finding: R1's page and ping sat entirely under the right UI rail, x 1012-1076 on screen): R1's elephant
  // and ping are pulled to its screen's street-side top corner (u 0.2, the elephant raised to v 0.5, the ping centred
  // at v 0.25: screen ~(1020, 900)), so the tick's ring rises above the rail's top (y 900) as it expands
  R1: {u: 0.22, k: 0.8, pingU: 0.15, v: 0.52, pingV: 0.22},
  // L1 (cut by the left frame edge, x -7..57 on screen; the film's paint edge eats the outer ~30 px): its elephant and
  // ping sit at the street side of its screen (u 0.72)
  L1: {u: 0.72, k: 0.85, pingU: 0.72},
};

/** A lit PHP page in a side screen: a peach header across the top and a BIG solid ink elephant filling the page width
 *  (>= 36 px on screen), popping in with the 7 % spring from `at` (the count tick). */
const Page: React.FC<{q: Q4; at: number; u?: number; v?: number; k?: number; seed: string}> = ({q, at, u = 0.5, v = 0.64, k: ks = 1, seed}) => {
  const t = useTime();
  const w = Math.hypot(q[1][0] - q[0][0], q[1][1] - q[0][1]);
  const h = Math.hypot(q[3][0] - q[0][0], q[3][1] - q[0][1]);
  const c = bil(q, u, v);
  const es = Math.min(w * 0.92, h * 0.62) * ks;
  const k = Math.max(0.001, springAt(t, at, springs.pop));
  return (
    <>
      <Fill d={sub(q, 0.08, 0.08, 0.92, 0.26)} color={palette.peach} offset={false} mode="none" seed={`${seed}/hd`} />
      <XG m={mat.about(mat.scale(k), c[0], c[1])}>
        <ElephantEmblem x={c[0]} y={c[1]} size={es} mode="solid" color={palette.ink} seed={`${seed}/el`} />
      </XG>
    </>
  );
};

/** A dark (switched-off) pane: tealDark glass with one white glint pair (fix round 2b: the non-PHP screens; a blank
 *  cream page differed from an elephant page only by a ~15 px glyph on a phone). */
const DarkPane: React.FC<{q: Q4; seed: string}> = ({q, seed}) => {
  const a = bil(q, 0.62, 0.16);
  const b = bil(q, 0.86, 0.4);
  const c = bil(q, 0.72, 0.2);
  const d = bil(q, 0.88, 0.32);
  return (
    <>
      <Fill d={polyPath(q)} color={palette.tealDark} offset={false} mode="none" seed={`${seed}/bg`} />
      <Ink d={`M${a[0].toFixed(1)} ${a[1].toFixed(1)}L${b[0].toFixed(1)} ${b[1].toFixed(1)}M${c[0].toFixed(1)} ${c[1].toFixed(1)}L${d[0].toFixed(1)} ${d[1].toFixed(1)}`} width={1.6} color={palette.white} taper={false} seed={`${seed}/gl`} />
    </>
  );
};

/** One side screen: unlit sage glass until `onAt` (never, when `onAt` is undefined). PHP sites: peach for two frames at
 *  it (the glow pop), then the elephant page; re-pulses peach for two frames at `pulseAt` ('websites'). Non-PHP sites
 *  (fix round 2b): on 'ten' a 2-frame cream blink, then the screen goes DARK (tealDark pane + glint) and stays dark. */
const ScreenState: React.FC<{d: string; onAt?: number; pulseAt?: number; php: boolean; page?: {u: number; k: number; v?: number}; seed: string}> = ({d, onAt, pulseAt, php, page, seed}) => {
  const t = useTime();
  if (onAt === undefined || t < onAt) return <Fill d={d} color={palette.sage} offset={false} mode="none" seed={seed} />;
  if (!php) {
    if (t < onAt + GLOW) return <Fill d={d} color={palette.cream} offset={false} mode="none" seed={`${seed}/b`} />;
    return <DarkPane q={quadOf(d)} seed={`${seed}/dk`} />;
  }
  if (t < onAt + GLOW || (pulseAt !== undefined && t >= pulseAt && t < pulseAt + GLOW)) return <Fill d={d} color={palette.peach} offset={false} mode="none" seed={`${seed}/p`} />;
  return <Page q={quadOf(d)} at={onAt} u={page?.u} v={page?.v} k={page?.k} seed={`${seed}/pg`} />;
};

// ---------------------------------------------------------------- flower boxes (static detail, ride the pop-ups)

/** A point on a side facade at local (u along the facade near -> far as seen, v down from the roofline), bilinear on
 *  the facade quad (close enough to the homography at this size). */
function facadeAt(h: RowHouse, u: number, v: number): Pt {
  const q = quadOf(h.g.facade);
  return bil(q, u, v);
}

/** Window-box planters under top-storey windows (local column c: 0.14 / 0.6; storey s 0 = top): a tan box on the wall
 *  under the sill and sage leaf blobs spilling over it with two peach flowers. */
function flowerBox(h: RowHouse, c: number, s: number, seed: string, right: boolean) {
  const sill = 0.045 + s * 0.2375 + 0.2375 * 0.22 + 0.2375 * 0.5;
  const u0 = right ? 1 - (c + 0.26) : c - 0.03;
  const u1 = right ? 1 - (c - 0.03) : c + 0.27;
  const a = facadeAt(h, u0, sill + 0.004);
  const b = facadeAt(h, u1, sill + 0.004);
  const bh = h.h * 0.022;
  const box = polyPath([a, b, [b[0], b[1] + bh], [a[0], a[1] + bh]]);
  const r = rng(seed);
  let leaves = '';
  let flowers = '';
  const n = 4;
  for (let i = 0; i < n; i++) {
    const k = (i + 0.5) / n;
    const x = a[0] + (b[0] - a[0]) * k + r.range(-1.5, 1.5);
    const y = a[1] + (b[1] - a[1]) * k - bh * r.range(0.25, 0.6);
    const rr = Math.abs(b[0] - a[0]) * r.range(0.16, 0.22);
    leaves += `M${(x - rr).toFixed(1)} ${y.toFixed(1)}a${rr.toFixed(1)} ${(rr * 0.85).toFixed(1)} 0 1 0 ${(2 * rr).toFixed(1)} 0a${rr.toFixed(1)} ${(rr * 0.85).toFixed(1)} 0 1 0 ${(-2 * rr).toFixed(1)} 0Z`;
    if (i === 1 || i === 3) flowers += `M${(x - 2.6).toFixed(1)} ${(y - rr * 0.4).toFixed(1)}a2.6 2.6 0 1 0 5.2 0a2.6 2.6 0 1 0 -5.2 0Z`;
  }
  return {box, leaves, flowers};
}

const FLOWERS = (() => {
  const pick = (id: SideId) => SIDE_HOUSES.find((e) => e.id === id)!.h;
  const out = [flowerBox(pick('L2'), 0.14, 0, 's03/fbA', false), flowerBox(pick('L2'), 0.6, 0, 's03/fbB', false), flowerBox(pick('R3'), 0.6, 0, 's03/fbC', true)];
  return {
    L2: {box: out[0].box + out[1].box, leaves: out[0].leaves + out[1].leaves, flowers: out[0].flowers + out[1].flowers},
    R3: out[2],
  } as Partial<Record<SideId, {box: string; leaves: string; flowers: string}>>;
})();

/** Centre and width (world) of a side house's screen: the count ping's anchor. */
function screenCentre(h: RowHouse, u = 0.5, v = 0.5): {c: Pt; w: number} {
  const q = quadOf(h.g.screen);
  return {c: bil(q, u, v), w: Math.hypot(q[1][0] - q[0][0], q[1][1] - q[0][1])};
}

/** Per side house: its screen state + page (+ the count's orange ping on the PHP screens), an awning (L2 / R2), window
 *  boxes (L2, R3). `onAt`: the PHP screens light on 'seven' (the count: polish round 1, the screens ARE the street's
 *  count, no blade signs), the three non-PHP screens go dark on 'ten'; `pulseAt`: the PHP pages re-pulse on 'websites'. */
export const SideOverlays: React.FC<{popAt: Record<SideId, number>; onAt: Partial<Record<SideId, number>>; pulseAt: Partial<Record<SideId, number>>; awnings?: SideId[]}> = ({popAt, onAt, pulseAt, awnings = ['L2', 'R2']}) => (
  <>
    {SIDE_HOUSES.map(({id, h}) => {
      const php = !isBlank(id);
      const fb = FLOWERS[id];
      const pa = PAGE_AT[id];
      const sc = screenCentre(h, pa?.pingU, pa?.pingV);
      const on = onAt[id];
      return (
        <PopUp key={id} at={popAt[id]} x={h.base[0]} y={h.base[1]}>
          <ScreenState d={h.g.screen} onAt={on} pulseAt={php ? pulseAt[id] : undefined} php={php} page={pa} seed={`s03/scr${id}`} />
          {awnings.includes(id) && h.g.awning ? (
            <>
              <Fill d={h.g.awning} color={palette.peach} seed={`s03/aw${id}`} />
              <Ink d={h.g.awning} width={1.6} taper={false} seed={`s03/awi${id}`} />
            </>
          ) : null}
          {fb ? (
            <>
              <Fill d={fb.box} color={palette.tan} offset={false} mode="none" seed={`s03/fbx${id}`} />
              <Fill d={fb.leaves} color={palette.sage} offset={false} mode="none" seed={`s03/fbl${id}`} />
              <Fill d={fb.flowers} color={palette.peach} offset={false} mode="none" seed={`s03/fbf${id}`} />
              <Ink d={fb.box + fb.leaves} width={1.3} taper={false} seed={`s03/fbi${id}`} />
            </>
          ) : null}
          {php && on !== undefined ? <CountPing x={sc.c[0]} y={sc.c[1]} r={sc.w * 0.8} at={on} color={palette.sun} /> : null}
        </PopUp>
      );
    })}
  </>
);

/** The press house's screen (BrowserChrome screen rect under its bar): unlit, peach pop, the set's page; re-pulses
 *  (peach, 2 frames) at each `pulseAt` (its count tick on 'seven', 'websites'). */
export const PressScreen: React.FC<{lightAt: number; pulseAt?: number[]}> = ({lightAt, pulseAt = []}) => {
  const t = useTime();
  const [wx, wy, ww, wh] = BLUEPRINT.window;
  const s = chromeScreen(wx, wy, ww, wh);
  const d = `M${s.x} ${s.y}H${s.x + s.w}V${s.y + s.h}H${s.x}Z`;
  const pulse = pulseAt.some((p) => t >= p && t < p + GLOW);
  if (t < lightAt) return <Fill d={d} color={palette.sage} offset={false} mode="none" seed="s03/scrP" />;
  if (t < lightAt + GLOW || pulse) return <Fill d={d} color={palette.peach} offset={false} mode="none" seed="s03/scrPp" />;
  return null;
};

// ---------------------------------------------------------------- count pings

/** A ring that pops at r and expands to 1.8 r while thinning to nothing (0.32 s): a count "tick" (ink, or orange). */
export const CountPing: React.FC<{x: number; y: number; r: number; at: number; width?: number; color?: string}> = ({x, y, r, at, width = 3.4, color = palette.ink}) => {
  const t = useTime();
  if (t < at) return null;
  const p = prog(t, at, 0.32, E.outCubic);
  if (p >= 1) return null;
  return <circle cx={x} cy={y} r={r * (1 + 0.8 * p)} fill="none" stroke={color} strokeWidth={width * (1 - p * 0.85) + 0.01} />;
};

// ---------------------------------------------------------------- S03's roof vent (moved off the sun's edge)

/** Fix round 2: the set's vent (BLUEPRINT.vent (652, 816), right roof slope) poked its cap into the sun disc's lower-left
 *  edge (a tangent: the sun seemed to rest on the chimney, right where the 7/10 pie is drawn). S03 hides it (VENT_HIDE
 *  clips it out of the set's press layer, VentPatch redraws the roof band and its ink line there, from the set's own
 *  path) and puts the same vent on the LEFT slope next to the apex, clear of the disc by > 40 px. */
const PR = BLUEPRINT.press;
const roofTopR = (x: number) => PR.apex[1] + ((x - PR.apex[0]) * (PR.eaves + 6 - PR.apex[1])) / (PR.x1 + 16 - PR.apex[0]);
const roofBotR = (x: number) => PR.apex[1] + 12 + ((x - PR.apex[0]) * (PR.eaves + 16 - PR.apex[1] - 12)) / (PR.x1 + 16 - PR.apex[0]);
const roofTopL = (x: number) => PR.apex[1] + ((PR.apex[0] - x) * (PR.eaves + 6 - PR.apex[1])) / (PR.apex[0] - (PR.x0 - 16));
const VW: [number, number] = [624, 684];
/** The hidden window of the set's press layer (sky above the right slope, the roof band and an 8 px strip of the gable
 *  under it, where the old vent's ink overshoots; x 624-684). Scale it with the press house's pop-up (it is applied
 *  outside the set's PopUp). */
export const VENT_HIDE = polyPath([[VW[0], 700], [VW[1], 700], [VW[1], roofBotR(VW[1]) + 8], [VW[0], roofBotR(VW[0]) + 8]]);
/** The set's right roof-slope ink stroke (BlueprintStreet G.pressInk 'g2': same call, same seed). */
const G2 = line(PR.apex[0], PR.apex[1], PR.x1 + 24, PR.eaves + 12, {seed: 'bps/g2', over: [2, 6]});
/** S03's vent: on the left slope, 30 px from the apex. */
export const VENT: Pt = [530, Math.round(roofTopL(530) + 1)];

/** The roof band + its ink line redrawn inside VENT_HIDE (render inside the press house's PopUp, after the set's node). */
export const VentPatch: React.FC = () => {
  const band = polyPath([[VW[0] - 1, roofTopR(VW[0] - 1)], [VW[1] + 1, roofTopR(VW[1] + 1)], [VW[1] + 1, roofBotR(VW[1] + 1)], [VW[0] - 1, roofBotR(VW[0] - 1)]]);
  const gable = polyPath([[VW[0] - 1, roofBotR(VW[0] - 1) - 2], [VW[1] + 1, roofBotR(VW[1] + 1) - 2], [VW[1] + 1, roofBotR(VW[1] + 1) + 9], [VW[0] - 1, roofBotR(VW[0] - 1) + 9]]);
  return (
    <>
      <Fill d={gable} color={palette.sand} offset={false} mode="none" seed="s03/vpg" />
      <Fill d={band} color={palette.teal} offset={false} mode="none" seed="s03/vpb" />
      <g clipPath="url(#s03ventWin)">
        <Ink d={G2} width={SI.mid} seed="s03/vpi" />
      </g>
      <defs>
        <clipPath id="s03ventWin" clipPathUnits="userSpaceOnUse">
          <path d={VENT_HIDE} />
        </clipPath>
      </defs>
    </>
  );
};

/** Fix round 2b (finding: the set's small gable window (BlueprintStreet `sw5`, an unglazed 44 x 36 frame at (538, 822))
 *  read as a hand-lettered 'E' above the sticker at phone size): S03 paints the gable over it (sand) and draws a ROUND
 *  ATTIC VENT instead: a tan disc r 15 with a 2.2 px ink ring and two slats. Render inside the press house's PopUp,
 *  after the set's node. */
export const AtticVent: React.FC = () => {
  const [cx, cy, r] = [560, 841, 15];
  const disc = `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0Z`;
  return (
    <>
      <Fill rect={[526, 808, 68, 60]} color={palette.sand} offset={false} mode="none" seed="s03/atticP" />
      <Fill d={disc} color={palette.tan} offset={[2, 1]} mode="none" seed="s03/atticF" />
      <Ink d={circle(cx, cy, r, {seed: 's03/atticI', overlap: 10})} width={2.2} taper={false} seed="s03/atticI" />
      <Ink d={`M${cx - 10} ${cy - 4}L${cx + 10} ${cy - 4}M${cx - 10} ${cy + 4}L${cx + 10} ${cy + 4}`} width={2.2} taper={false} seed="s03/atticS" />
    </>
  );
};

/** S03's vent box (the set's recipe: tealDark box + cap, ink on top / left / right). */
export const VentS03: React.FC = () => {
  const [x, y] = VENT;
  const d = `M${x - 12} ${y - 22}h24v26h-24Z` + `M${x - 17} ${y - 28}h34v7h-34Z`;
  return (
    <>
      <Fill d={d} color={palette.tealDark} seed="s03/vent" />
      <Ink d={rect(x - 12, y - 22, 24, 26, {seed: 's03/vI', over: 'small', edges: 'tlr'}) + rect(x - 17, y - 28, 34, 7, {seed: 's03/vcI', over: 'small'})} width={SI.mid} seed="s03/ventI" />
    </>
  );
};

/** Paper sheets (22 x 27) puffed out of S03's roof vent at each time (n sheets, 0.08 s apart), up-left over the sky left
 *  of the press house, never near the sun's disc. Fix round 2b (findings: on outCubic over 0.9 s they parked in a clump
 *  beside the sign for ~0.4 s, then blinked out one per frame, the second puff's blink-outs landing on the card flip
 *  and the pie): each sheet flies 0.6 s on outQuad plus a linear tail (still >= ~50 px/s at the end, never parked),
 *  then shrinks out about its centre in 0.12 s (in-quad) while still drifting; the three end points are spread ~45-80 px
 *  apart (left-low, middle-high, right-mid) so they never overlap; apex below screen y ~610 (caption floor 570). The
 *  second puff (end(loves)) is gone by ~12.49, before the card flip (12.505). */
const PUFF = {fly: 0.6, out: 0.12, gap: 0.08, ends: [[-148, 98], [-104, 140], [-64, 112]] as [number, number][]};
export const VentPuffs: React.FC<{times: number[]; n?: number; seed?: string}> = ({times, n = 3, seed = 's03/vent'}) => {
  const t = useTime();
  const V = VENT;
  const out: React.ReactNode[] = [];
  times.forEach((at, j) => {
    const r = rng(`${seed}/${j}`);
    for (let i = 0; i < n; i++) {
      const t0 = at + i * PUFF.gap;
      const e = PUFF.ends[i % PUFF.ends.length];
      const dx = e[0] + r.range(-6, 6);
      const rise = e[1] + r.range(-5, 5);
      if (t < t0) continue;
      const tau = t - t0;
      if (tau >= PUFF.fly + PUFF.out) continue;
      const u = tau / PUFF.fly;
      // outQuad over the flight + a linear tail (the end velocity stays ~0.25 x the mean, never zero)
      const p = 0.75 * E.outQuad(Math.min(1, u)) + 0.25 * u;
      const k = tau <= PUFF.fly ? 1 : 1 - E.inQuad((tau - PUFF.fly) / PUFF.out);
      if (k <= 0.02) continue;
      const x = V[0] + dx * p + Math.sin(u * 6 + i + j) * 5;
      const y = V[1] - 30 - rise * p;
      const rot = -50 * p + Math.sin(u * 8 + i) * 16;
      out.push(
        <XG key={`${j}/${i}`} m={mat.compose(mat.about(mat.scale(k), x, y), mat.about(mat.rotate(rot), x, y))}>
          <Fill rect={[x - 11, y - 13.5, 22, 27]} color={palette.white} offset={false} mode="snap" seed={`${seed}/f${j}${i}`} />
          <Ink d={rect(x - 11, y - 13.5, 22, 27, {seed: `${seed}/i${j}${i}`, over: 'small'}) + `M${x - 7} ${y - 6}L${x + 6} ${y - 6}M${x - 7} ${y}L${x + 7} ${y}M${x - 7} ${y + 6}L${x + 3} ${y + 6}`} width={1.6} taper={false} seed={`${seed}/k${j}${i}`} />
        </XG>,
      );
    }
  });
  return <>{out}</>;
};

// ---------------------------------------------------------------- the bird wire (static pauser detail)

/** A wire from L3's cornice to the pen-nib sign's pole top (sagging over the sky left of the sun, screen y ~700-725),
 *  two small birds on it; the first one hops and turns round at `hopAt` (polish round 1: life in the calm after the
 *  pop-up), the second one turns round at `turnAt`. */
const WIRE = {a: [190, 690] as Pt, b: [438, 706] as Pt, sag: 16};
const wireAt = (u: number): Pt => {
  const {a, b, sag} = WIRE;
  return [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u + 4 * sag * u * (1 - u)];
};
/** Fix round 2b (finding: solid-ink bird silhouettes the size and colour of Bit, 40-80 px from him, were decoys in the
 *  'find Bit' game, and off style): the kit's wire bird (lib/kit Bird: white fill, ink outline, dot eye, an orange
 *  beak tick) at s 0.62 = ~28 x 15 px (style bible 7: pigeons 28 x 14, white / sand fill, ink outline, dot eye), 20 px
 *  apart. Bit is the only solid-ink critter in the frame. */
const BIRD_S = 0.62;
export const BirdWire: React.FC<{drawAt?: number; turnAt?: number; hopAt?: number}> = ({drawAt, turnAt, hopAt}) => {
  const t = useTime();
  const {a, b, sag} = WIRE;
  const mid: Pt = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2 + 2 * sag];
  const wire = `M${a[0]} ${a[1]}Q${mid[0]} ${mid[1]} ${b[0]} ${b[1]}`;
  const p1 = wireAt(0.5);
  const p2 = wireAt(0.6);
  const turned = turnAt !== undefined && t >= turnAt;
  // the hop: 0.2 s, 9 px up, turning round at its top
  const hp = hopAt !== undefined && t >= hopAt ? Math.min(1, (t - hopAt) / 0.2) : 0;
  const lift = 9 * 4 * hp * (1 - hp);
  const flip1 = hp >= 0.5;
  const on = drawAt === undefined || t >= drawAt + 0.12;
  return (
    <>
      <Ink d={wire} at={drawAt} width={2.1} taper={false} seed="s03/wire" />
      {on ? (
        <>
          <Bird x={p1[0]} y={p1[1] - lift + 1} s={BIRD_S} color={palette.white} flip={flip1} seed="s03/bird1" />
          <Bird x={p2[0]} y={p2[1] + 1} s={BIRD_S} color={palette.white} flip={!turned} seed="s03/bird2" />
        </>
      ) : null}
    </>
  );
};

export type {BlueprintId};

// ---------------------------------------------------------------- the pen-nib sign, made visible

/** The set's pen-nib sign hangs at BLUEPRINT.sign (795, 930), which is entirely BEHIND building R4 in this framing (R4's
 *  facade covers x 760-840 from y 800 down). S03 hangs the same sign (cream disc + ink nib, r 32) from a little iron
 *  pole on the press house's left roof slope instead, against the sky, where it can swing and Bit can ride it (the
 *  set's own sign is switched off: BlueprintStreet sign={false}). */
export const ROOF_SIGN = {pole: [438, 832] as Pt, top: 704, hook: [392, 712] as Pt, x: 392, y: 762, r: 32};

/** The pen-nib sign's swing about its hook at `swingAt` (end(loves)). Polish round 1 (finding: the old -16 e^-5t cos 12.5t
 *  jumped to -14 deg in one frame and was back to ~0 in 0.1 s: a twitch): it starts at 0 with a velocity kick (sine),
 *  peaks at about -11 deg at +0.18 s and swings visibly for ~0.9 s (period ~0.74 s); Bit (BitOnSign) rides it. */
export const signAngle = (t: number, swingAt: number) => (t >= swingAt ? -14 * Math.exp(-2.6 * (t - swingAt)) * Math.sin((t - swingAt) * 8.5) : 0);

export const RoofSign: React.FC<{swingAt?: number; seed?: string}> = ({swingAt, seed = 's03/nib'}) => {
  const t = useTime();
  const S = ROOF_SIGN;
  const a = swingAt !== undefined ? signAngle(t, swingAt) : 0;
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

// ---------------------------------------------------------------- sign joke J2: the scribbled '?'

/** The pauser's '?' beside the 'I [heart] PHP' sticker (fix round 2: the sticker's own '?' is a ~7 px hairline curl on a
 *  phone and the doubt was lost): a separate hand-scribble in 2.2 px ink (on screen), 30 px tall, tilted +10 deg, just
 *  outside the sticker's right edge, between the press house's right windows. Static: it rides the house's pop-up. */
export const QuestionScribble: React.FC<{x: number; y: number; h?: number; width?: number; seed?: string}> = ({x, y, h = 30, width = 2.1, seed = 's03/q'}) => {
  const s = h / 30;
  const hook = `M${-7.5} ${-8}C${-8.5} ${-15.5} ${-2} ${-17.5} ${2.5} ${-16.5}C${8.5} ${-15} ${9.5} ${-8} ${4.5} ${-4.5}C${0.8} ${-2} ${-0.6} ${0} ${-0.2} ${5.2}`;
  return (
    <XG m={mat.compose(mat.translate(x, y), mat.rotate(10), mat.scale(s))}>
      <Ink d={hook} width={width / s} taper={false} seed={`${seed}/h`} />
      <Fill d={`M${-2.3} ${11.5}a2.4 2.4 0 1 0 4.8 0a2.4 2.4 0 1 0 -4.8 0Z`} color={palette.ink} offset={false} mode="none" seed={`${seed}/d`} />
    </XG>
  );
};
