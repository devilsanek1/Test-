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
//   - three zig-zag STAIR flights (x ~170 / ~612 / ~910, rows 1-6): a stepped cream flight with a stringer and a hand
//     rail, climbing from a row's walkway across the terrace gap onto the next coping (the landing), alternating
//     direction; round teal SHRUBS on five landings.
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

/** The rise at the frame's sides per row (px at rest): row 0 (the street front) straight, then 18 -> 42, bands 46-54. */
export const BOW = (k: number) => (k <= 0 ? 0 : 14 + 4 * Math.min(k, 10));
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

/** Stair columns: the set's (x ~612, rows 1-6) and two more (rows 1-5). */
const MY_STAIRS = [168, 912];
const STAIR_ROWS = 6;
const stairJ = (k: number, tx: number) => Math.round((tx - ROWS[k].x0 - ROWS[k].w / 2) / ROWS[k].w);

// ---------------------------------------------------------------- per-house cells

export type Cell = {j: number; x: number; cx: number; ci: number; stair: boolean; d: number; core: boolean};

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
    const mine = k >= 1 && k <= 5 && MY_STAIRS.some((tx) => stairJ(k, tx) === j);
    const ci = k === 1 && j === 0 ? 2 : Math.floor(rand(SEED, `hill/${k}/${j}`) * COLORS.length);
    out.push({j, x, cx, ci, stair: setStair || mine, d: bowAt(k, cx), core: Math.abs(cx - 540) <= halfW(k)});
  }
  return out;
}
export const CELLS = ROWS.slice(0, HAZE).map((_, k) => cellsOf(k));

// ---------------------------------------------------------------- static per-row geometry (core / edge chunks)

type RowGeo = {
  wall: string;
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
};

function rowGeo(k: number, part: 'core' | 'edge'): RowGeo {
  const R = ROWS[k];
  const u = R.s;
  const g: RowGeo = {wall: '', joints: '', fac: ['', '', '', ''], roofs: '', shade: '', screens: '', bars: '', barDots: '', doors: '', plaques: '', locks: '', ink: '', detail: '', sliver: '', coping: '', lip: '', rail: '', flight: '', flightInk: '', shrubs: '', shrubInk: ''};
  const cells = CELLS[k].filter((c) => (part === 'core' ? c.core : !c.core));
  if (!cells.length) return g;
  const P = {wall: new PathBuf(2), fac: [0, 1, 2, 3].map(() => new PathBuf(2)), roofs: new PathBuf(2), shade: new PathBuf(2), screens: new PathBuf(2), bars: new PathBuf(2), barDots: new PathBuf(2), doors: new PathBuf(2), plaques: new PathBuf(2), locks: new PathBuf(2), flight: new PathBuf(2), sliver: new PathBuf(2), coping: new PathBuf(2), shrubs: new PathBuf(2)};
  const near = k <= 3;
  const inked = k <= 3;
  for (const c of cells) {
    const top = R.top + c.d;
    const base = R.base + c.d;
    // the lower row's roof sliver on top of every house (row 0's too: the set draws house #4's facade from its top down)
    if (!c.stair) P.sliver.rect(c.x - 0.2, top - SLIVER * u, R.w + 0.4, SLIVER * u + 0.6);
    if (k === 0) continue; // row 0's houses: NearLodRow0 (and the set's house #4)
    const hs = `${SEED}/s9h/${k}/${c.j}`;
    const r = rng(`${hs}/i`);
    // the retaining wall face under the row: from its feet down past the lower row's roof (the lower row covers the
    // rest); it shows in the terrace gap, taller where the bow opens it
    P.wall.rect(c.x - 0.2, base, R.w + 0.4, (3 + GAP) * u + 70 * u);
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
      P.wall.rect(c.x - 0.2, top - 2 * u, R.w + 0.4, R.h + 2 * u);
      const dir = (k % 2 ? -1 : 1) * (c.cx < 400 ? 1 : c.cx > 700 ? -1 : 1);
      const xa = c.cx - dir * R.w * 0.36;
      const xb = c.cx + dir * R.w * 0.34;
      const yA = base - 1.5 * u;
      const yB = top - (3 + GAP) * u * 0.8 - 1.5 * u; // the upper row's coping (its walkway)
      const n = 9;
      const run = (xb - xa) / n;
      const rise = (yA - yB) / n;
      const T = 12 * u;
      const pts: [number, number][] = [[xa, yA]];
      let prof = `M${f2(xa)} ${f2(yA)}`;
      for (let i = 0; i < n; i++) {
        const x0 = xa + i * run;
        const y1 = yA - (i + 1) * rise;
        pts.push([x0, y1], [x0 + run, y1]);
        prof += `V${f2(y1)}H${f2(x0 + run)}`;
      }
      pts.push([xb, yB + T], [xa + dir * 4 * u, yA]);
      P.flight.poly(pts);
      if (inked) {
        // the stringer under the flight, the hand rail above it (3 posts), the step profile
        const hr = 10 * u;
        let d = prof + `M${f2(xb)} ${f2(yB + T)}L${f2(xa + dir * 4 * u)} ${f2(yA)}`;
        d += `M${f2(xa)} ${f2(yA - hr)}L${f2(xb)} ${f2(yB - hr)}`;
        for (const q of [0.1, 0.5, 0.9]) {
          const px = xa + (xb - xa) * q;
          const py = yA + (yB - yA) * q;
          d += `M${f2(px)} ${f2(py - hr)}V${f2(py - rise * 0.5)}`;
        }
        g.flightInk += d;
      }
      // a round shrub on the upper landing (rows 1-4), beside the flight's top
      if (k <= 4) {
        const sx = xb + dir * R.w * 0.24;
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
      P.fac[ci].rect(c.x, top, R.w + 0.3, R.h);
      if (COLORS[ci] !== palette.tan) P.shade.rect(c.x, top, R.w * 0.18, R.h);
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
      P.fac[tone].rect(c.x, top, R.w + 0.4, R.h);
      P.roofs.rect(c.x, top, R.w * (0.55 + 0.3 * rand(SEED, `rf${k}/${c.j}`)), 6 * u);
      P.doors.rect(c.x + 34 * u, top + 97.5 * u, 26 * u, 50 * u);
    }
    if (inked) {
      const ov = (a: number, b: number) => [r.range(a, b) * u, r.range(a, b) * u] as [number, number];
      if (r.chance(0.3)) {
        const cut = c.x + R.w * r.range(0.35, 0.7);
        g.ink += line(c.x, top, cut - 4 * u, top, {seed: `${hs}/r1`, over: ov(2, 7), breaks: false}) + line(cut + 3 * u, top, c.x + R.w, top, {seed: `${hs}/r2`, over: ov(1, 8), breaks: false});
      } else g.ink += line(c.x, top, c.x + R.w, top, {seed: `${hs}/r`, over: ov(2, 9), breaks: false});
      if (k <= 1 && r.chance(0.75)) g.ink += line(c.x + 3 * u, top + 9 * u, c.x + R.w - 3 * u, top + 9 * u, {seed: `${hs}/c`, over: ov(0, 4), breaks: false});
      if (r.chance(0.84)) g.ink += line(c.x, base, c.x, top, {seed: `${hs}/w`, over: [0, r.range(1, 5) * u], breaks: false});
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
  return g;
}
const GEO = ROWS.slice(0, HAZE).map((_, k) => ({core: rowGeo(k, 'core'), edge: rowGeo(k, 'edge')}));

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

// ---------------------------------------------------------------- camera helpers

/** The highest visible top of row k (its bowed sides at the frame edges) on screen. */
const visTop = (t: number, wy: number, k: number) => {
  const c = camAt(t);
  const xe = Math.min(1.3 * 540, 540 / c.zoom);
  return (wy + bowAt(k, 540 + xe) - c.y) * c.zoom + 960;
};
const revealOf = (t: number, wy: number, k: number) => clamp((visTop(t, wy, k) - TERRACE.revealFloor) / 14 + 1);
/** The terraces extend at the frame's side edges: row k at EXTEND_AT + k * 0.03, so the last (row 7 + the bands)
 *  lands ON 'server'. */
export const EXTEND_AT = B.server - 0.24;
const extendedAt = (t: number, k: number) => t >= EXTEND_AT + Math.min(k, 8) * 0.03;
const revealXf = (reveal: number, y: number, node: React.ReactNode) => (reveal >= 1 ? node : reveal <= 0 ? null : <XG m={mat.about(mat.scale(1, reveal), 540, y)}>{node}</XG>);
/** The terrace ink (lips, rails) draws on row by row on 'every', the flights 0.02 s after. */
const DRAW_AT = B.every;

