// S09 Part B, fix round 2b: the PEAK-3 HILLSIDE, drawn by the scene in place of TerraceHill's 'hill' layer (the set keeps
// its street, house #4, the flag, the fixed door and the people). The set stacks each row's base right on the row below's
// roof, every row a perfectly horizontal band: at phone size it read as a wall / shelving unit of facades. Here:
//   - TERRACES (HROWS): row 0 is the set's (house #4 and the hidden match untouched); from row 1 up every row sits 14 house
//     units higher than the set's, and the gap is a terrace seen from below: the upper row's thin RAIL (top rail + posts)
//     over its facade feet, a light COPING (the walkway's edge, an ink lip), the stone retaining WALL face (tan / brown,
//     joints), and the lower row's dark ROOF SLIVER, so each row steps back.
//   - the BOW: every row from 1 up rises toward the frame's sides, house by house (-A_k ((x - 540) / 540)^2, A 18 -> 42 px,
//     the haze bands 46-54): the rows curve round the hill like an amphitheatre town; where the bow opens the gap wider the
//     wall face simply grows. Row 0 (the street front) is straight.
//   - three zig-zag STAIR flights (x ~170 / ~612 / ~910, polish A1: rows 1-3 only, 0.42 of a house wide, in a lighter
//     slot): a stepped cream flight with a stringer and a hand rail, climbing from a row's walkway across the terrace gap
//     onto the next coping (the landing), alternating direction; round teal SHRUBS on the landings.
//   - the RIDGE: the three haze bands (the set's playbook ladder), bowed, a water tower and two trees in silhouette in
//     front of the sun (peach rims on their sun side).
//   - rows 4-7 at a calm far LOD (three flat tones, roof slab, door); rows 1-3 with the set's per-house detail; row 0 at
//     near LOD (browser window with chrome, glazed door, elephant plaque, the OLD lock) from the 'to' build on.
//   - the EMPTY check-box tag wave (white cards, ink box, hung at small angles) and door #4's ONE ticked tag.
// Timing: the rows reveal as the caption floor (screen y 570) passes their HIGHEST visible top (the bowed sides), the
// frame-edge pieces extend on 'server', the terrace ink + stairs draw on on 'every'.

import React from 'react';
import {Fill, Ink, palette, useTime, line, rect as sketchRect, rand, rng, mat, XG, misreg, springAt, springs, clamp} from '../../lib';
import {PathBuf, mix} from '../../lib/cine/util';
import {atmos} from '../../lib/cine/atmosphere';
import {TERRACE, TERRACE_HAZE, FacadeDoor, HALF} from '../shared/sets';
import type {TerraceRow} from '../shared/sets';
import {ChromeSlot, PlaqueSlot} from '../shared/sets/propSlots';
import {Lock} from '../shared/props';
import {B} from './beats';
import {camAt} from './camera';
import {GHOST} from './matchcut';

const SEED = 'terr';
const COLORS = [palette.cream, palette.sand, palette.tan, palette.mintPale];
const HAZE = TERRACE.hazeFrom; // 8: rows 0-7 are houses, then three haze bands
/** Only what an S09 frame can see (the rest frame is world x 0..1080; the pull-back only narrows it). */
const EXT: [number, number] = [-150, 1230];
const f2 = (n: number) => n.toFixed(2);

// ---------------------------------------------------------------- the rows (the set's, with terrace gaps)

/** The terrace gap added between rows (house units of the upper row), on top of the set's 3. */
const GAP = 14;
/** The terrace pieces in the gap (house units of the row they belong to). */
const COPING = 3.5;
const SLIVER = 3.5;
const RAIL = 8.5;

/** Row 0 = the set's (base 1500); row k >= 1: base = the row below's top - (3 + GAP) s, s = 0.8^k; x0 the set's. */
export const HROWS: TerraceRow[] = (() => {
  const rows: TerraceRow[] = [];
  let base = 1500;
  for (let k = 0; k < 30; k++) {
    const s = Math.pow(0.8, k);
    const w = 90 * s;
    const h = 158 * s;
    if (k > 0) base = rows[k - 1].top - (3 + GAP) * s;
    const top = base - h;
    rows.push({k, s, w, h, base, top, x0: 527.5 - w / 2 + (k % 2 ? w / 2 : 0)});
    if (top < 690) break;
  }
  return rows;
})();
const ROWS = HROWS;

// ---------------------------------------------------------------- the bow

/** The rise at the frame's sides per row (px at rest). A1 FR2 (reviewer: the bow on every row read as a stadium bowl, not
 *  a hillside climbing to a ridge): only the near terraces 1-3 curve up a little toward the frame sides (16 / 11 / 6),
 *  rows 4-7 are level, and the haze bands + ridge are gently CONVEX (negative: the crest is highest behind the sun and
 *  falls 10-18 px toward the sides). Row 0 (the street front) straight. */
export const BOW = (k: number) => (k <= 0 ? 0 : k <= 3 ? [16, 11, 6][k - 1] : k < HAZE ? 0 : -(10 + 4 * Math.min(k - HAZE, 2)));
/** Row k's vertical offset at world x (negative = up). */
export const bowAt = (k: number, x: number) => {
  const u = Math.max(-1.3, Math.min(1.3, (x - 540) / 540));
  return -BOW(k) * u * u;
};

// ---------------------------------------------------------------- the set's numbers, mirrored

const halfW = (k: number) => 610 - Math.min(1, k / 16) * 300;
const setStairX = (k: number) => 612 + (k % 2 ? 1 : -1) * 6 * Math.pow(0.8, k);
const SCREEN_INK = [3.4, 2.2, 1.6, 1.6];
const WORLD_INK = [0.85, 0.6, 0.55, 0.5, 0.45, 0.4];
/** World stroke width of row k at this zoom (0 = none): on screen max(world x zoom, the screen ladder), dropped < 1.2. */
export const rowInk = (k: number, zoom: number) => {
  const scr = Math.max((WORLD_INK[k] ?? 0) * zoom, SCREEN_INK[k] ?? 0);
  return scr < 1.2 ? 0 : scr / zoom;
};
const tint = (c: string, k: number) => (k <= 2 ? c : atmos(c, Math.min(1, k / (HAZE + 3)), 'day', {clear: 0.2}));

/** Stair columns: the set's (x ~612) and two more. Polish A1 (reviewer: the flights sliced the hill into four columns of
 *  heavy '/\\' wedges that read as cracks or rafters): rows 1-3 only (the far rows 4+ stay a calm field of houses). */
const MY_STAIRS = [168, 912];
const STAIR_ROWS = 3;
const stairJ = (k: number, tx: number) => Math.round((tx - ROWS[k].x0 - ROWS[k].w / 2) / ROWS[k].w);

// ---------------------------------------------------------------- per-house cells

export type Cell = {j: number; x: number; cx: number; ci: number; stair: boolean; d: number; core: boolean; jy: number; brk: number};

/** A1 FR2 (reviewer: rows 4-7 read as a procedural texture): rows 3-6 get a +-3.5 px roof-height jitter per house and a
 *  hand-drawn BREAK every 6-8 houses (1 chimney, 2 aerial, 3 tree; 0 none). */
const JITTER_ROWS = [3, 6];
const breakOf = (k: number, j: number) => {
  if (k < JITTER_ROWS[0] || k > JITTER_ROWS[1]) return 0;
  const period = 6 + Math.floor(rand(SEED, `brkP${k}`) * 3);
  const phase = Math.floor(rand(SEED, `brkO${k}`) * period);
  if (((j - phase) % period + period) % period !== 0) return 0;
  return 1 + Math.floor(rand(SEED, `brk${k}/${j}`) * 3);
};

function cellsOf(k: number): Cell[] {
  const R = ROWS[k];
  const out: Cell[] = [];
  const j0 = Math.floor((EXT[0] - R.x0) / R.w) - 1;
  const j1 = Math.ceil((EXT[1] - R.x0) / R.w) + 1;
  for (let j = j0; j <= j1; j++) {
    const x = R.x0 + j * R.w;
    const cx = x + R.w / 2;
    if (cx < EXT[0] || cx > EXT[1]) continue;
    const setStair = k >= 1 && k <= STAIR_ROWS && Math.abs(cx - setStairX(k)) < R.w * 0.5;
    const mine = k >= 1 && k <= STAIR_ROWS && MY_STAIRS.some((tx) => stairJ(k, tx) === j);
    const ci = k === 1 && j === 0 ? 2 : Math.floor(rand(SEED, `hill/${k}/${j}`) * COLORS.length);
    const jy = k >= JITTER_ROWS[0] && k <= JITTER_ROWS[1] ? (rand(SEED, `jy${k}/${j}`) - 0.5) * 7 : 0;
    out.push({j, x, cx, ci, stair: setStair || mine, d: bowAt(k, cx), core: Math.abs(cx - 540) <= halfW(k), jy, brk: setStair || mine ? 0 : breakOf(k, j)});
  }
  return out;
}
export const CELLS = ROWS.slice(0, HAZE).map((_, k) => cellsOf(k));

// ---------------------------------------------------------------- static per-row geometry (core / edge chunks)

type RowGeo = {
  wall: string;
  /** The stair column's full-height wall face (drawn with the houses, never ahead of its flight). */
  slotWall: string;
  joints: string;
  fac: string[]; // rows 0-3: by colour; rows 4-7: three flat tones
  roofs: string;
  shade: string;
  screens: string;
  bars: string;
  barDots: string;
  doors: string;
  plaques: string;
  locks: string;
  ink: string;
  detail: string;
  sliver: string;
  coping: string;
  lip: string;
  rail: string;
  flight: string;
  flightInk: string;
  shrubs: string;
  shrubInk: string;
  /** A1 FR2: the frontal flight's risers (one haze step under cream; the treads are the flight fill) + its cheek lines. */
  risers: string;
  /** A1 FR2: roof breaks: chimney stacks, aerial masts, tree crowns (+ trunks). */
  chim: string;
  aer: string;
  crowns: string;
};

function rowGeo(k: number, pick: (c: Cell) => boolean): RowGeo {
  const R = ROWS[k];
  const u = R.s;
  const g: RowGeo = {wall: '', slotWall: '', joints: '', fac: ['', '', '', ''], roofs: '', shade: '', screens: '', bars: '', barDots: '', doors: '', plaques: '', locks: '', ink: '', detail: '', sliver: '', coping: '', lip: '', rail: '', flight: '', flightInk: '', shrubs: '', shrubInk: '', risers: '', chim: '', aer: '', crowns: ''};
  const cells = CELLS[k].filter(pick);
  if (!cells.length) return g;
  const P = {wall: new PathBuf(2), slotWall: new PathBuf(2), fac: [0, 1, 2, 3].map(() => new PathBuf(2)), roofs: new PathBuf(2), shade: new PathBuf(2), screens: new PathBuf(2), bars: new PathBuf(2), barDots: new PathBuf(2), doors: new PathBuf(2), plaques: new PathBuf(2), locks: new PathBuf(2), flight: new PathBuf(2), sliver: new PathBuf(2), coping: new PathBuf(2), shrubs: new PathBuf(2), risers: new PathBuf(2), chim: new PathBuf(2), aer: new PathBuf(2), crowns: new PathBuf(2)};
  const near = k <= 3;
  const inked = k <= 3;
  for (const c of cells) {
    const top = R.top + c.d;
    const base = R.base + c.d;
    // the lower row's roof sliver on top of every house (row 0's too: the set draws house #4's facade from its top down)
    const rt = top + c.jy; // the jittered roofline (rows 3-6); doors / windows keep the row's top
    if (!c.stair) P.sliver.rect(c.x - 0.2, rt - SLIVER * u, R.w + 0.4, SLIVER * u + 0.6);
    if (k === 0) continue; // row 0's houses: NearLodRow0 (and the set's house #4)
    const hs = `${SEED}/s9h/${k}/${c.j}`;
    const r = rng(`${hs}/i`);
    // the retaining wall face under the row: from its feet down past the lower row's roof (the lower row covers the
    // rest); it shows in the terrace gap, taller where the bow opens it
    // (fix round 3: only as deep as the gap down to the lower row's bowed top + a few px, so a strip that pops ahead of
    // the lower row's outer houses is a thin band, never a slab hanging into their empty slots)
    const bowGap = Math.max(bowAt(k - 1, c.x) - bowAt(k, c.x), bowAt(k - 1, c.x + R.w) - bowAt(k, c.x + R.w), 0);
    P.wall.rect(c.x - 0.2, base, R.w + 0.4, (3 + GAP) * u + bowGap + 6);
    if (inked && k <= 3) {
      // stone joints: short vertical ticks in the wall band, ~2 per house
      for (let i = 0; i < 2; i++) {
        if (rand(hs, `jt${i}`) < 0.3) continue;
        const jx = c.x + R.w * (0.2 + 0.45 * i + 0.15 * rand(hs, `jx${i}`));
        g.joints += `M${f2(jx)} ${f2(base + (COPING + 1.5) * u)}V${f2(base + (COPING + 8) * u)}`;
      }
    }
    // the coping (the walkway's front edge) right under the facade feet, its ink lip under it
    P.coping.rect(c.x - 0.3, base - 1.5 * u, R.w + 0.6, (COPING + 1.5) * u);
    if (inked) g.lip += line(c.x, base + COPING * u, c.x + R.w, base + COPING * u, {seed: `${hs}/lp`, over: [r.range(1, 5) * u, r.range(1, 5) * u], breaks: false, drift: 0.3});
    if (c.stair) {
      // the stair column: wall face top to bottom + a zig-zag flight from this row's walkway up to the next coping
      P.slotWall.rect(c.x - 0.2, top - 2 * u, R.w + 0.4, R.h + 2 * u);
      // A1 FR2 (reviewer: the zig-zag flights read as cracks / ropes at phone size): a FRONTAL flight climbing straight up
      // the hill from this row's walkway to the next row's coping, 0.6 of a house wide, tapering a little with distance:
      // flat cream treads over risers one haze step darker (horizontal stripes: unmistakably steps), one cheek line
      // (stringer) down each side. dir only places the landing shrub.
      const dir = c.cx < 540 ? 1 : -1;
      const yA = base - 1.5 * u;
      const yB = top - (3 + GAP) * u * 0.8 - 1.5 * u; // the upper row's coping (its walkway)
      const wA = R.w * 0.62;
      const wB = R.w * 0.5;
      const n = 8;
      const stepH = (yA - yB) / n;
      const xb = c.cx + dir * wB * 0.5;
      P.flight.poly([
        [c.cx - wA / 2, yA],
        [c.cx - wB / 2, yB],
        [c.cx + wB / 2, yB],
        [c.cx + wA / 2, yA],
      ]);
      for (let i = 0; i < n; i++) {
        const y0 = yA - i * stepH;
        const q = (i + 0.5) / n;
        const hw = (wA + (wB - wA) * q) / 2;
        // the riser: the lower ~62 % of each step
        P.risers.rect(c.cx - hw, y0 - stepH * 0.62, hw * 2, stepH * 0.62);
      }
      if (inked) g.flightInk += `M${f2(c.cx - wA / 2)} ${f2(yA)}L${f2(c.cx - wB / 2)} ${f2(yB)}M${f2(c.cx + wA / 2)} ${f2(yA)}L${f2(c.cx + wB / 2)} ${f2(yB)}`;
      // a round shrub on the upper landing (rows 1-4), beside the flight's top
      if (k <= 4) {
        const sx = xb + dir * R.w * 0.16;
        const sy = yB + 1;
        const r1 = 9.5 * u;
        P.shrubs.circle(sx, sy - r1 * 0.8, r1).circle(sx + dir * r1 * 0.95, sy - r1 * 0.55, r1 * 0.72);
        if (inked) g.shrubInk += `M${f2(sx - r1)} ${f2(sy - r1 * 0.7)}a${f2(r1)} ${f2(r1)} 0 0 1 ${f2(2 * r1)} 0` + `M${f2(sx + dir * r1 * 0.95 - r1 * 0.72)} ${f2(sy - r1 * 0.5)}a${f2(r1 * 0.72)} ${f2(r1 * 0.72)} 0 0 1 ${f2(1.44 * r1)} 0`;
      }
      continue;
    }
    // the house
    const ci = c.ci;
    if (near) {
      P.fac[ci].rect(c.x, rt, R.w + 0.3, R.h - c.jy);
      if (COLORS[ci] !== palette.tan) P.shade.rect(c.x, rt, R.w * 0.18, R.h - c.jy);
      P.screens.rect(c.x + 17.5 * u, top + 39.5 * u, 55 * u, 25.5 * u);
      P.bars.rect(c.x + 17.5 * u, top + 30 * u, 55 * u, 9.5 * u);
      if (k <= 1) for (let dd = 0; dd < 3; dd++) P.barDots.circle(c.x + (22.5 + dd * 6) * u, top + 34.75 * u, 2.2 * u);
      P.doors.rect(c.x + 32.5 * u, top + 97.5 * u, 30 * u, 50 * u);
      const pq = Math.max(8 * u, 3);
      P.plaques.rect(c.x + 18 * u - pq / 2, top + 110 * u - pq / 2, pq, pq);
      const lw = Math.max(8.5 * u, 3);
      const lh = Math.max(10.5 * u, 3.6);
      P.locks.rect(c.x + 57.5 * u - lw / 2, top + 122.5 * u - lh / 2, lw, lh);
    } else {
      // far LOD: three flat tones (the set's per-house colour pick), a roof slab, the door
      const tone = COLORS[ci] === palette.tan ? 2 : COLORS[ci] === palette.sand ? 1 : 0;
      P.fac[tone].rect(c.x, rt, R.w + 0.4, R.h - c.jy);
      P.roofs.rect(c.x, rt, R.w * (0.55 + 0.3 * rand(SEED, `rf${k}/${c.j}`)), 6 * u);
      P.doors.rect(c.x + 34 * u, top + 97.5 * u, 26 * u, 50 * u);
    }
    if (c.brk === 1) {
      // a chimney stack (+ its cap) on the roof
      const cx0 = c.x + R.w * (0.2 + 0.45 * rand(hs, 'chx'));
      const cw = Math.max(2.4, R.w * 0.13);
      const ch = Math.max(4, R.h * 0.13);
      P.chim.rect(cx0, rt - ch, cw, ch + 1).rect(cx0 - cw * 0.18, rt - ch - Math.max(1.2, cw * 0.25), cw * 1.36, Math.max(1.2, cw * 0.25));
    } else if (c.brk === 2) {
      // an aerial: a mast and two cross bars
      const ax = c.x + R.w * (0.3 + 0.4 * rand(hs, 'ax'));
      const ah = Math.max(7, R.h * 0.3);
      const lw = Math.max(1.3, 1.6 * u);
      P.aer.rect(ax - lw / 2, rt - ah, lw, ah).rect(ax - R.w * 0.18, rt - ah * 0.82, R.w * 0.36, lw).rect(ax - R.w * 0.11, rt - ah * 0.55, R.w * 0.22, lw);
    } else if (c.brk === 3) {
      // a round tree in front of the house's corner, its crown over the roofline
      const tx = c.x + (rand(hs, 'tx') < 0.5 ? R.w * 0.08 : R.w * 0.92);
      const cr = Math.max(4, R.w * 0.26);
      P.crowns.circle(tx, rt - cr * 0.25, cr).circle(tx + cr * 0.7, rt + cr * 0.2, cr * 0.72);
      P.chim.rect(tx - Math.max(1, cr * 0.12), rt + cr * 0.5, Math.max(2, cr * 0.24), R.h * 0.5);
    }
    if (inked) {
      const ov = (a: number, b: number) => [r.range(a, b) * u, r.range(a, b) * u] as [number, number];
      if (r.chance(0.3)) {
        const cut = c.x + R.w * r.range(0.35, 0.7);
        g.ink += line(c.x, rt, cut - 4 * u, rt, {seed: `${hs}/r1`, over: ov(2, 7), breaks: false}) + line(cut + 3 * u, rt, c.x + R.w, rt, {seed: `${hs}/r2`, over: ov(1, 8), breaks: false});
      } else g.ink += line(c.x, rt, c.x + R.w, rt, {seed: `${hs}/r`, over: ov(2, 9), breaks: false});
      if (k <= 1 && r.chance(0.75)) g.ink += line(c.x + 3 * u, top + 9 * u, c.x + R.w - 3 * u, top + 9 * u, {seed: `${hs}/c`, over: ov(0, 4), breaks: false});
      if (r.chance(0.84)) g.ink += line(c.x, base, c.x, rt, {seed: `${hs}/w`, over: [0, r.range(1, 5) * u], breaks: false});
      if (k <= 2) {
        g.detail += sketchRect(c.x + 17.5 * u, top + 30 * u, 55 * u, 35 * u, {seed: `${hs}/wi`, edges: r.chance(0.5) ? 'tlb' : 'tlr', over: 5 * u});
        g.detail += sketchRect(c.x + 32.5 * u, top + 97.5 * u, 30 * u, 50 * u, {seed: `${hs}/di`, edges: 'tlr', over: 4 * u});
      }
      // the rail in front of the facade feet: a top rail + posts (every quarter house)
      const ry = base - RAIL * u;
      g.rail += line(c.x, ry, c.x + R.w, ry, {seed: `${hs}/rl`, over: [r.range(0, 3) * u, r.range(0, 3) * u], breaks: false, drift: 0.2});
      for (let q = 0; q < 4; q++) {
        const px = c.x + R.w * (0.125 + 0.25 * q);
        g.rail += `M${f2(px)} ${f2(ry)}V${f2(base - 1.5 * u)}`;
      }
    }
  }
  g.wall = P.wall.d;
  g.slotWall = P.slotWall.d;
  g.fac = P.fac.map((b) => b.d);
  g.roofs = P.roofs.d;
  g.shade = P.shade.d;
  g.screens = P.screens.d;
  g.bars = P.bars.d;
  g.barDots = P.barDots.d;
  g.doors = P.doors.d;
  g.plaques = P.plaques.d;
  g.locks = P.locks.d;
  g.flight = P.flight.d;
  g.sliver = P.sliver.d;
  g.coping = P.coping.d;
  g.shrubs = P.shrubs.d;
  g.risers = P.risers.d;
  g.chim = P.chim.d;
  g.aer = P.aer.d;
  g.crowns = P.crowns.d;
  return g;
}
/** Fix round 3 (no one-frame 1080 x 430 block): the near rows' houses pop in RINGS from the centre outward, one frame
 *  apart (|cx - 540| < 100, < 200, beyond), after their terrace strip (wall face, coping, rail), which pops as ITS top
 *  (the rail) passes the caption floor, a few frames before the row's own top. */
const RING_R = [100, 200];
const NRING = 3;
const ringOf = (k: number, c: Cell) => (k >= 1 && k <= 3 ? RING_R.filter((r) => Math.abs(c.cx - 540) >= r).length : 0);
const GEO = ROWS.slice(0, HAZE).map((_, k) => ({
  rings: Array.from({length: NRING}, (_, i) => rowGeo(k, (c) => c.core && ringOf(k, c) === i)),
  edge: rowGeo(k, (c) => !c.core),
}));

// ---------------------------------------------------------------- the haze bands (rows >= 8), bowed

type BandChunk = {fill: string; dots: string};
type Band = {i: number; from: number; top: number; bottom: number; color: string; dot: string; core: BandChunk; edge: BandChunk};

const BANDS: Band[] = (() => {
  const last = ROWS.length - 1;
  const groups: [number, number][] = [
    [HAZE, Math.min(last, HAZE + 1)],
    [HAZE + 2, Math.min(last, HAZE + 3)],
    [HAZE + 4, last],
  ].filter(([a, b]) => a <= last && a <= b) as [number, number][];
  return groups.map(([a, b], i) => {
    const far = ROWS[b];
    const r = rng(`${SEED}/band/hill/${i}`);
    const parts = {core: {fill: new PathBuf(2), dots: new PathBuf(2)}, edge: {fill: new PathBuf(2), dots: new PathBuf(2)}};
    const hw = halfW(a);
    const which = (x: number) => (Math.abs(x - 540) > hw ? parts.edge : parts.core);
    const kb = HAZE + i;
    const bottom = ROWS[a - 1].top + 30;
    const baseTop = far.top;
    const step = Math.max(12, far.w);
    for (let x = EXT[0] - 60; x < EXT[1] + 60; ) {
      const bw = step * r.int(2, 5);
      const lift = r.chance(0.12) ? far.h * r.range(0.6, 1.1) + 3 : far.h * r.range(0, 0.35);
      const top = baseTop - lift + bowAt(kb, x + bw / 2);
      which(x + bw / 2).fill.rect(x, top, bw + 0.5, bottom - top);
      x += bw;
    }
    for (let k = a; k <= Math.min(b, a + 1); k++) {
      const R = ROWS[k];
      const u = R.w / 90;
      const dw = Math.max(3, 30 * u);
      const dh = Math.max(3, 18 * u);
      const pitch = Math.max(R.w, 9);
      for (let x = R.x0 + Math.floor((EXT[0] - R.x0) / pitch) * pitch; x < EXT[1]; x += pitch) {
        if (r.chance(i === 0 ? 0.2 : i === 1 ? 0.1 : 0)) which(x).dots.rect(x + 22 * u, R.top + 34 * u + bowAt(kb, x), dw, dh);
      }
    }
    const fin = (p: typeof parts.core): BandChunk => ({fill: p.fill.d, dots: p.dots.d});
    return {i, from: a, top: baseTop - far.h * 1.1 - 3, bottom, color: TERRACE_HAZE[i], dot: i === 0 ? palette.sage : TERRACE_HAZE[i - 1], core: fin(parts.core), edge: fin(parts.edge)};
  });
})();

// ---------------------------------------------------------------- the ridge silhouettes (against the sun)

/** The ridge line under the silhouettes (the far band's base top, bowed). */
const RIDGE_Y = (x: number) => ROWS[ROWS.length - 1].top + bowAt(HAZE + 2, x) + 2;
/** The sun's crest (world): centre y so its top sits at screen 625 at rest (>= 600 under the captions), ~120 px of
 *  disc above the ridge. */
export const SUN_CREST = {x: TERRACE.sun.x, y: 705, r: TERRACE.sun.r};
/** A water tower (x 792) and two round trees (x 598, 626) standing on the ridge in front of the sun, fill-only in the
 *  far band's tone, each with a peach rim strip on its sun side (the rims live on visible silhouettes only). */
export const RIDGE = (() => {
  const fill = new PathBuf(2);
  const rim = new PathBuf(2);
  // the water tower: four legs + a cross brace, the tank, a cone roof
  const tx = 792;
  const ty = RIDGE_Y(tx);
  const legH = 34;
  const tankW = 36;
  const tankH = 24;
  fill.poly([[tx - 15, ty], [tx - 11, ty - legH], [tx - 7, ty - legH], [tx - 10, ty]]);
  fill.poly([[tx + 15, ty], [tx + 11, ty - legH], [tx + 7, ty - legH], [tx + 10, ty]]);
  fill.rect(tx - 13, ty - legH * 0.55, 26, 3);
  fill.rect(tx - tankW / 2, ty - legH - tankH, tankW, tankH);
  fill.poly([[tx - tankW / 2 - 3, ty - legH - tankH], [tx, ty - legH - tankH - 13], [tx + tankW / 2 + 3, ty - legH - tankH]]);
  rim.rect(tx - tankW / 2 - 4, ty - legH - tankH + 2, 4, tankH - 2);
  rim.rect(tx - 15 - 3.5, ty - legH + 4, 3.5, legH - 6);
  // the trees: a trunk + a round crown each
  const trees: [number, number][] = [
    [598, 21],
    [628, 15],
  ];
  for (const [x, cr] of trees) {
    const y = RIDGE_Y(x);
    fill.rect(x - 2.5, y - cr * 1.3, 5, cr * 1.3 + 2);
    fill.circle(x, y - cr * 1.5, cr);
    // the rim on the sun side (right of centre: the trees stand left of the sun's centre): a thin crescent outside
    rim.poly([[x + cr * 0.45, y - cr * 2.45], [x + cr * 1.18, y - cr * 1.5], [x + cr * 0.5, y - cr * 0.5], [x + cr * 0.95, y - cr * 1.5]]);
  }
  return {fill: fill.d, rim: rim.d, top: ty - legH - tankH - 13};
})();

/** Fix round 3: the silhouettes one haze step DARKER than the far band (in the palest tone they read as holes punched
 *  in the orange disc, not as things standing in front of it). */
const RIDGE_FILL = '#84B09C';

// ---------------------------------------------------------------- camera helpers

/** The highest visible top of row k (its bowed sides at the frame edges) on screen. */
const visTop = (t: number, wy: number, k: number) => {
  const c = camAt(t);
  const xe = Math.min(1.3 * 540, 540 / c.zoom);
  return (wy + Math.min(0, bowAt(k, 540 + xe)) - c.y) * c.zoom + 960;
};
const revealOf = (t: number, wy: number, k: number) => clamp((visTop(t, wy, k) - TERRACE.revealFloor) / 14 + 1);
/** The terraces extend at the frame's side edges: row k at EXTEND_AT + k * 0.03, so the last (row 7 + the bands)
 *  lands ON 'server'. */
export const EXTEND_AT = B.server - 0.24;
const extendedAt = (t: number, k: number) => t >= EXTEND_AT + Math.min(k, 8) * 0.03;
const revealXf = (reveal: number, y: number, node: React.ReactNode) => (reveal >= 1 ? node : reveal <= 0 ? null : <XG m={mat.about(mat.scale(1, reveal), 540, y)}>{node}</XG>);
/** The terrace ink (lips, rails) draws on row by row on 'every', the flights 0.02 s after. */
const DRAW_AT = B.every;

// ---------------------------------------------------------------- the check-box tags (the empty wave + door #4's tick)

const TAG_STEP = 0.075;
/** Fix round 3 (the one tick among hundreds must read at phone size): tag widths at rest (screen px = world px at the
 *  rest zoom 1): row 0 44, row 1 32, then ~0.75 per row down to an 8 px floor (the kit's TerraceHill boxes are >= 22 px
 *  on the near rows; these hang on the scene's own bowed rows, so the scene keeps its own wave). */
const TAG_PX = [44, 32, 24, 18, 14, 11, 9, 8];
const tagSize = (k: number, zoom: number) => Math.max(TAG_PX[k] ?? 8, (TERRACE.checkBox.minScreen[k] ?? 0) / zoom);
/** Screen ink of the inked rows' tags: [card outline, box]. */
const TAG_INK: [number, number][] = [
  [2.6, 2.4],
  [2.2, 2.0],
  [2.0, 1.8],
  [1.6, 1.4],
];
/** A1 FR2 (reviewer: ~250 pure-white tags with 3.4 px outlines made a high-contrast noise field competing with the flag
 *  and the sun): the EMPTY tags are cream cards (HALF.cream on the uninked far rows) with thinner ink; door #4's ticked
 *  tag stays the one pure-white card (1.3x, a sage box behind its tick): flag > ticked tag > field. */
const TAG_FILL = (k: number) => (k <= 3 ? palette.cream : HALF.cream);
const rot = (hx: number, hy: number, a: number) => {
  const c = Math.cos(a);
  const sn = Math.sin(a);
  return (dx: number, dy: number) => `${f2(hx + dx * c - dy * sn)} ${f2(hy + dx * sn + dy * c)}`;
};
const tagQuad = (hx: number, hy: number, s: number, a = 0) => {
  const P = rot(hx, hy, a);
  return `M${P(-s * 0.46, s * 0.22)}L${P(s * 0.5, s * 0.12)}L${P(s * 0.47, s * 0.98)}L${P(-s * 0.5, s * 1.02)}Z`;
};
const tagBox = (hx: number, hy: number, s: number, a = 0) => {
  const P = rot(hx, hy, a);
  const b = s * 0.25;
  const by = s * 0.58;
  return `M${P(-b, by - b)}L${P(b, by - b)}L${P(b, by + b)}L${P(-b, by + b)}Z`;
};
const tagLoop = (hx: number, hy: number, s: number, a = 0) => {
  const P = rot(hx, hy, a);
  return `M${P(-s * 0.2, s * 0.18)}L${P(0, -s * 0.06)}L${P(s * 0.2, s * 0.14)}`;
};
const swingOf = (k: number, j: number) => (rand('s9tag', `${k}/${j}`) - 0.5) * 0.24;

const RowTags: React.FC<{k: number; zoom: number; extended: boolean}> = ({k, zoom, extended}) => {
  const t = useTime();
  const at = B.tags + k * TAG_STEP;
  if (t < at) return null;
  const pop = springAt(t, at, springs.pop);
  if (pop <= 0.02) return null;
  const s = tagSize(k, zoom) * pop;
  const inked = k <= 3;
  const R = ROWS[k];
  let body = '';
  let box = '';
  let loop = '';
  for (const c of CELLS[k]) {
    if (c.stair || (k === 0 && c.j === 0)) continue;
    if (!extended && !c.core) continue;
    if (c.cx < -60 || c.cx > 1140) continue;
    const hx = c.x + TERRACE.checkBox.hang[0] * R.s;
    const hy = R.top + c.d + TERRACE.checkBox.hang[1] * R.s;
    const a = swingOf(k, c.j);
    body += tagQuad(hx, hy, s, a);
    box += tagBox(hx, hy, s, a);
    if (inked) loop += tagLoop(hx, hy, s, a);
  }
  const sc = (px: number) => px / zoom;
  return (
    <>
      <Fill d={body} color={TAG_FILL(k)} offset={false} mode="snap" seed={`s9tg${k}/b`} />
      {inked ? null : <Fill d={box} color={tint(palette.sand, k)} offset={false} mode="snap" seed={`s9tg${k}/x`} />}
      {inked ? (
        <>
          <Ink d={loop} width={sc(k <= 1 ? 1.8 : 1.4)} color={palette.tealDark} taper={false} vary={0} seed={`s9tg${k}/lp`} />
          <Ink d={body} width={sc(TAG_INK[k][0])} taper={false} vary={0} seed={`s9tg${k}/o`} />
          <Ink d={box} width={sc(TAG_INK[k][1])} taper={false} vary={0} seed={`s9tg${k}/xi`} />
        </>
      ) : null}
    </>
  );
};

/** Door #4's tag: the same white tag + empty box, its own pop at 'single' - 0.18, and the ONE tick (ink, drawn on,
 *  overshooting the box) that completes ON 'single'; the empty wave follows from single + 0.10. */
export const House4Tag: React.FC = () => {
  const t = useTime();
  const at = B.single - 0.18;
  if (t < at) return null;
  const zoom = camAt(t).zoom;
  const pop = springAt(t, at, springs.pop);
  // A1 FR2: 1.3x the row's tag, pure white (the field is cream), a sage box (the new lock's sage) behind the tick
  const s = tagSize(0, zoom) * 1.3 * pop;
  const H = TERRACE.house4.facade;
  const [hx, hy] = [H[0] + TERRACE.checkBox.hang[0], H[1] + TERRACE.checkBox.hang[1] - 4];
  const b = s * 0.25;
  const by = hy + s * 0.58;
  const tick = `M${f2(hx - b * 0.85)} ${f2(by - b * 0.05)}L${f2(hx - b * 0.2)} ${f2(by + b * 0.7)}L${f2(hx + b * 1.25)} ${f2(by - b * 1.25)}`;
  return (
    <>
      <Fill d={tagQuad(hx, hy, s)} color={palette.white} offset={false} mode="snap" seed="s9h4tag/b" />
      <Fill d={tagBox(hx, hy, s)} color={palette.sage} offset={false} mode="snap" seed="s9h4tag/x" />
      <Ink d={tagLoop(hx, hy, s)} width={2.2 / zoom} color={palette.tealDark} taper={false} vary={0} seed="s9h4tag/lp" />
      <Ink d={tagQuad(hx, hy, s)} width={3.4 / zoom} taper={false} vary={0} seed="s9h4tag/o" />
      <Ink d={tagBox(hx, hy, s)} width={3 / zoom} taper={false} vary={0} seed="s9h4tag/xi" />
      <Ink d={tick} at={B.single - 0.12} dur={0.12} width={6 / zoom} taper={false} seed="s9h4tag/tick" />
    </>
  );
};

// ---------------------------------------------------------------- one row (houses + its terrace)

/** One chunk of a row (a ring of its core houses, or its frame-edge houses) with the reveal of its houses (`rv`) and of
 *  its terrace strip (`strip`). */
type RowPart = {g: RowGeo; rv: number; strip: number; stair: boolean};

/** One row: the terrace strip's back (retaining wall face + joints) as soon as the strip is revealed; each chunk's houses
 *  with their stair slots (wall face + the flight's tread / stringer fill + the landing shrubs: fix round 3, the slot is
 *  never a blank brown column) when that chunk pops; the strip's front (coping, lip, rail) over the facade feet; the
 *  flights' ink last (it draws on on 'every'). */
const RowNode: React.FC<{k: number; zoom: number; parts: RowPart[]}> = ({k, zoom, parts}) => {
  const R = ROWS[k];
  const iw = rowInk(k, zoom);
  const depth = Math.min(1, k / (HAZE + 1));
  const wall = atmos(mix(palette.tan, palette.brown, 0.45), depth, 'day', {clear: 0.1});
  const sliver = atmos(mix(palette.tan, palette.tealDark, 0.6), depth, 'day', {clear: 0.1});
  const coping = tint(HALF.sand, k);
  // polish A1: the stair slot's wall one haze step lighter than the retaining walls (toward the coping), so a flight reads
  // as a light stair in a recess, not a brown sawtooth
  const slotWall = atmos(mix(HALF.sand, palette.tan, 0.4), depth, 'day', {clear: 0.1});
  const off: [number, number] | false = k <= 3 ? [misreg.dx / zoom, misreg.dy / zoom] : false;
  const near = k <= 3;
  const cols = near ? COLORS.map((c) => tint(c, k)) : [tint(mix(palette.cream, palette.sand, 0.25), k), tint(palette.sand, k), tint(palette.tan, k)];
  const door = k <= 4 ? palette.teal : tint(palette.teal, k);
  const dw = k <= 2 && iw > 0 ? Math.max(1.5 / zoom, iw * 0.66) : 0;
  const xf = (rv: number, node: React.ReactNode) => revealXf(rv, R.base, node);
  return (
    <>
      {parts.map((p, i) => {
        const g = p.g;
        if (p.strip <= 0 || !g.wall) return null;
        return (
          <React.Fragment key={`b${i}`}>
            {xf(
              p.strip,
              <>
                <Fill d={g.wall} color={wall} offset={false} mode="snap" seed={`s9h/w${k}/${i}`} />
                {iw > 0 && g.joints ? <Ink d={g.joints} width={iw * 0.55} taper={false} vary={0} seed={`s9h/j${k}/${i}`} /> : null}
              </>,
            )}
          </React.Fragment>
        );
      })}
      {parts.map((p, i) => {
        const g = p.g;
        if (p.rv <= 0) return null;
        return (
          <React.Fragment key={`h${i}`}>
            {xf(
              p.rv,
              <>
                {g.slotWall ? <Fill d={g.slotWall} color={slotWall} offset={false} mode="snap" seed={`s9h/sw${k}/${i}`} /> : null}
                {g.fac.map((d, ci) => (d ? <Fill key={ci} d={d} color={cols[ci]} offset={off} mode="snap" seed={`s9h/f${k}/${i}/${ci}`} /> : null))}
                {g.shade ? <Fill d={g.shade} color={tint(palette.sand, k)} offset={false} mode="snap" seed={`s9h/sh${k}/${i}`} /> : null}
                {g.roofs ? <Fill d={g.roofs} color={tint(mix(palette.tan, palette.tealDark, 0.25), k)} offset={false} mode="snap" seed={`s9h/rf${k}/${i}`} /> : null}
                {g.screens ? <Fill d={g.screens} color={palette.cream} offset={false} mode="snap" seed={`s9h/s${k}/${i}`} /> : null}
                {g.bars ? <Fill d={g.bars} color={palette.tealDark} offset={false} mode="snap" seed={`s9h/b${k}/${i}`} /> : null}
                {g.barDots ? <Fill d={g.barDots} color={palette.cream} offset={false} mode="snap" seed={`s9h/bd${k}/${i}`} /> : null}
                {g.doors ? <Fill d={g.doors} color={door} offset={false} mode="snap" seed={`s9h/d${k}/${i}`} /> : null}
                {g.plaques ? <Fill d={g.plaques} color={palette.sand} offset={false} mode="snap" seed={`s9h/p${k}/${i}`} /> : null}
                {g.locks ? <Fill d={g.locks} color={palette.sand} offset={false} mode="snap" seed={`s9h/l${k}/${i}`} /> : null}
                {iw > 0 && g.ink ? <Ink d={g.ink} width={iw} taper={false} vary={0.05} seed={`s9h/i${k}/${i}`} /> : null}
                {dw > 0 && g.detail ? <Ink d={g.detail} width={dw} taper={false} vary={0.05} seed={`s9h/di${k}/${i}`} /> : null}
                {g.sliver ? <Fill d={g.sliver} color={sliver} offset={false} mode="snap" seed={`s9h/sv${k}/${i}`} /> : null}
                {g.chim ? <Fill d={g.chim} color={tint(mix(palette.tan, palette.tealDark, 0.35), k)} offset={false} mode="snap" seed={`s9h/ch${k}/${i}`} /> : null}
                {g.aer ? <Fill d={g.aer} color={tint(mix(palette.tealDark, palette.ink, 0.3), k)} offset={false} mode="snap" seed={`s9h/ae${k}/${i}`} /> : null}
                {g.crowns ? <Fill d={g.crowns} color={tint(k <= 4 ? palette.sage : palette.teal, k)} offset={false} mode="snap" seed={`s9h/cr${k}/${i}`} /> : null}
                {p.stair && g.flight ? <Fill d={g.flight} color={tint(palette.cream, k)} offset={false} mode="snap" seed={`s9h/fl${k}/${i}`} /> : null}
                {p.stair && g.risers ? <Fill d={g.risers} color={tint(mix(palette.cream, palette.tan, 0.42), k)} offset={false} mode="snap" seed={`s9h/rs${k}/${i}`} /> : null}
                {p.stair && g.shrubs ? <Fill d={g.shrubs} color={k <= 2 ? palette.teal : tint(palette.sage, k)} offset={false} mode="snap" seed={`s9h/sb${k}/${i}`} /> : null}
              </>,
            )}
          </React.Fragment>
        );
      })}
      {parts.map((p, i) => {
        const g = p.g;
        if (p.strip <= 0 || !g.coping) return null;
        return (
          <React.Fragment key={`c${i}`}>
            {xf(
              p.strip,
              <>
                <Fill d={g.coping} color={coping} offset={off} mode="snap" seed={`s9h/cp${k}/${i}`} />
                {iw > 0 && g.lip ? <Ink d={g.lip} at={DRAW_AT + k * 0.03} order="all" width={iw} taper={false} vary={0.05} seed={`s9h/lp${k}/${i}`} /> : null}
                {iw > 0 && g.rail ? <Ink d={g.rail} at={DRAW_AT + 0.03 + k * 0.03} order="all" width={Math.max(iw * 0.62, 1.1 / zoom)} taper={false} vary={0} seed={`s9h/rl${k}/${i}`} /> : null}
              </>,
            )}
          </React.Fragment>
        );
      })}
      {parts.map((p, i) => {
        const g = p.g;
        if (p.rv < 1 || !p.stair || iw <= 0 || (!g.flightInk && !g.shrubInk)) return null;
        return (
          <React.Fragment key={`fi${i}`}>
            {g.flightInk ? <Ink d={g.flightInk} at={DRAW_AT + 0.02 + k * 0.05} order="all" width={Math.max(2.2 / zoom, Math.min(iw, 2.2 / zoom))} taper={false} vary={0} seed={`s9h/fi${k}/${i}`} /> : null}
            {g.shrubInk ? <Ink d={g.shrubInk} width={iw * 0.8} taper={false} vary={0} seed={`s9h/sbi${k}/${i}`} /> : null}
          </React.Fragment>
        );
      })}
    </>
  );
};

// ---------------------------------------------------------------- the hill

/** Draw in TerraceHill's 'hill' wrap INSTEAD of the set's node. From the 'to' build on (under the ghost before it). */
export const Hill: React.FC = () => {
  const t = useTime();
  if (t < GHOST.right - 0.001) return null;
  const zoom = camAt(t).zoom;
  const out: React.ReactNode[] = [];
  // the ridge silhouettes + rims, then the haze bands (far -> near)
  const rr = revealOf(t, RIDGE.top, HAZE + 2);
  if (rr > 0) {
    out.push(
      <React.Fragment key="ridge">
        {revealXf(
          rr,
          RIDGE_Y(700),
          <>
            <Fill d={RIDGE.fill} color={RIDGE_FILL} offset={false} mode="snap" seed="s9h/ridge" />
            {t >= B.server ? <Fill d={RIDGE.rim} color={palette.peach} offset={false} mode="snap" seed="s9h/ridgeRim" /> : null}
          </>,
        )}
      </React.Fragment>,
    );
  }
  for (let i = BANDS.length - 1; i >= 0; i--) {
    const b = BANDS[i];
    const rv = revealOf(t, b.top, HAZE + i);
    if (rv <= 0) continue;
    const ext = extendedAt(t, b.from);
    const sets = ext ? [b.core, b.edge] : [b.core];
    out.push(
      <React.Fragment key={`b${i}`}>
        {revealXf(
          rv,
          b.bottom,
          <>
            {sets.map((c, ci) => (
              <React.Fragment key={ci}>
                {c.fill ? <Fill d={c.fill} color={b.color} offset={false} mode="snap" seed={`s9h/hz${i}/${ci}`} /> : null}
                {c.dots ? <Fill d={c.dots} color={b.dot} offset={false} mode="snap" seed={`s9h/hzd${i}/${ci}`} /> : null}
              </React.Fragment>
            ))}
          </>,
        )}
      </React.Fragment>,
    );
  }
  // rows far -> near (each with its terrace), then the tags. Fix round 3: a row's terrace strip pops as its rail top
  // passes the caption floor; its houses pop ring by ring from the centre outward, one frame apart, as the row's top
  // (+ the gap above it) has passed it (ring i = the reveal one frame-step i later on the camera path).
  const rings = ROWS.slice(0, HAZE).map((R, k) => Array.from({length: NRING}, (_, i) => (k === 0 ? 1 : revealOf(t - i / 30, R.top - (3 + GAP) * R.s, k))));
  // a strip never floats over the row below's still-empty slots: it waits for that row's last ring
  const strip = ROWS.slice(0, HAZE).map((R, k) => (k === 0 ? 1 : rings[k - 1][NRING - 1] < 1 ? 0 : revealOf(t, R.base - RAIL * R.s, k)));
  const ext = ROWS.slice(0, HAZE).map((_, k) => extendedAt(t, k));
  // A1 FR2 (reviewer: a row-2 house popped alone with its flight already up = a staircase to nowhere): a row's flights +
  // landing shrubs pop one frame AFTER the row above completes (its last ring), so a flight always lands on a coping
  const above = (k: number) => (k + 1 >= HAZE ? 1 : revealOf(t - 1 / 30 - (NRING - 1) / 30, ROWS[k + 1].top - (3 + GAP) * ROWS[k + 1].s, k + 1));
  const stairOn = ROWS.slice(0, HAZE).map((_, k) => above(k) >= 1);
  const partsOf = (k: number): RowPart[] => {
    const ps: RowPart[] = GEO[k].rings.map((g, i) => ({g, rv: rings[k][i], strip: strip[k], stair: stairOn[k]}));
    if (ext[k] || k === 0) ps.push({g: GEO[k].edge, rv: rings[k][0], strip: strip[k], stair: stairOn[k]});
    return ps;
  };
  for (let k = HAZE - 1; k >= 1; k--) {
    if (strip[k] <= 0 && rings[k][0] <= 0) continue;
    out.push(<RowNode key={`r${k}`} k={k} zoom={zoom} parts={partsOf(k)} />);
  }
  out.push(<RowNode key="r0" k={0} zoom={zoom} parts={partsOf(0)} />);
  out.push(<NearLodRow0 key="n0" />);
  for (let k = HAZE - 1; k >= 0; k--) {
    const rv = rings[k][NRING - 1];
    if (rv <= 0) continue;
    out.push(<React.Fragment key={`tg${k}`}>{revealXf(rv, ROWS[k].base, <RowTags k={k} zoom={zoom} extended={ext[k]} />)}</React.Fragment>);
  }
  return <>{out}</>;
};

// ---------------------------------------------------------------- row 0 near LOD (+ the 'to' build's plaque blinks)

/** Row 0's houses (not #4) with real detail: a browser window with chrome, a glazed door, the elephant plaque, the OLD
 *  lock. The houses right of #4 are revealed on GHOST.right, the left ones on GHOST.left: each plaque blinks (one +35 %
 *  frame, then a 2-frame settle) as its house appears. */
export const NearLodRow0: React.FC = () => {
  const t = useTime();
  const c = camAt(t);
  const zoom = c.zoom;
  const R = ROWS[0];
  const x0 = c.x - 540 / zoom - R.w;
  const x1 = c.x + 540 / zoom + R.w;
  const W = Math.max(0.85, 1.9 / zoom);
  const WS = Math.max(0.85, 3.4 / zoom);
  // fix round 3: the browser page at the near LOD like house #4's (a peach header + two text hairlines), the hairlines a
  // screen-constant 1.9 px (the kit page's hairlines are world-wide: 7-9 px black bars at zoom ~3)
  const hair = 1.9 / zoom;
  const page = ({w, h: sh}: {w: number; h: number}) => {
    const pad = Math.max(5, w * 0.07);
    const hh = sh * 0.3;
    const y1 = pad + hh + (sh - pad - hh) * 0.36;
    const y2 = pad + hh + (sh - pad - hh) * 0.7;
    return (
      <>
        <Fill rect={[pad, pad, w - pad * 2, hh]} color={palette.peach} offset={false} mode="snap" seed="s9n0/hdr" />
        <path d={`M${f2(pad)} ${f2(y1)}H${f2(pad + (w - pad * 2) * 0.84)}M${f2(pad)} ${f2(y2)}H${f2(pad + (w - pad * 2) * 0.56)}`} stroke={palette.ink} strokeWidth={hair} strokeLinecap="round" fill="none" />
      </>
    );
  };
  const out: React.ReactNode[] = [];
  for (const h of CELLS[0]) {
    if (h.j === 0 || h.x + R.w < x0 || h.x > x1) continue;
    const col = COLORS[h.ci];
    const top = R.top;
    const sd = `s9n0/${h.j}`;
    const shown = h.j > 0 ? GHOST.right : GHOST.left;
    const blinkK = t < shown + 0.034 ? 1.35 : t < shown + 0.1 ? 1.1 : 1;
    const px = h.x + 18;
    const py = top + 110;
    out.push(
      <React.Fragment key={h.j}>
        <Fill rect={[h.x, top, R.w + 0.3, R.h]} color={col} offset={[misreg.dx / zoom, misreg.dy / zoom]} mode="snap" seed={`${sd}/f`} />
        {col !== palette.tan ? <Fill rect={[h.x, top, R.w * 0.18, R.h]} color={palette.sand} offset={false} mode="snap" seed={`${sd}/s`} /> : null}
        <Ink d={line(h.x, R.base, h.x, top, {seed: `${sd}/w`, over: [0, 3]}) + line(h.x + 3, top + 8, h.x + R.w - 3, top + 8, {seed: `${sd}/c`, over: [1, 3]})} width={WS} taper={false} vary={0} seed={`${sd}/wi`} />
        <ChromeSlot x={h.x + 17.5} y={top + 30} w={55} h={35} width={W} seed={`${sd}/bw`} content={page} />
        <FacadeDoor r={[h.x + 32.5, top + 97.5, 30, 50]} width={W} seed={`${sd}/d`} />
        <XG m={mat.about(mat.scale(blinkK), px, py)}>
          <PlaqueSlot x={px} y={py} size={8} width={Math.max(0.4, 1 / zoom)} seed={`${sd}/p`} />
        </XG>
        <Lock x={h.x + 57.5} y={top + 122.5} size={10.5} ink={Math.max(0.6, 1.2 / zoom)} seed={`${sd}/l`} />
      </React.Fragment>,
    );
  }
  return <>{out}</>;
};

// ---------------------------------------------------------------- the fixed door's light at the doorstep

/** The set's cream path (TerraceHill FIXED_PATH) covered with the street (in the street's own relit tone: draw it inside
 *  the same Tod map), the kerb strip and lines re-drawn with the set's seeds on top, then a stepped peach pool on the kerb
 *  under door #4. Draw in TerraceHill's 'street' wrap, after the street, from `fixedAt`. */
export const FixedPool: React.FC = () => {
  const t = useTime();
  if (t < B.single) return null;
  const zoom = camAt(t).zoom;
  const base = ROWS[0].base;
  return (
    <>
      <Fill d={`M512 ${base}L548 ${base}L618 2090L442 2090Z`} color={palette.mintPale} offset={false} mode="snap" seed="s9pool/cover" />
      <Fill rect={[430, base, 200, 10]} color={palette.sand} offset={false} mode="snap" seed="s9pool/kerb" />
      <Ink d={line(-700, base + 10, 1780, base + 10, {seed: `${SEED}/k1`, over: 0}) + line(-40, base + 34, 1120, base + 35, {seed: `${SEED}/k2`, over: 0})} width={Math.max(0.85, 3.4 / zoom)} taper={false} vary={0} seed={`${SEED}/kerb`} />
      <Fill d="M494 1506a36 7 0 1 0 72 0a36 7 0 1 0 -72 0Z" color={palette.peach} offset={false} mode="snap" seed="s9pool/p" />
      <Fill d="M514 1505.5a16 3.2 0 1 0 32 0a16 3.2 0 1 0 -32 0Z" color={palette.cream} offset={false} mode="snap" seed="s9pool/c" />
    </>
  );
};
