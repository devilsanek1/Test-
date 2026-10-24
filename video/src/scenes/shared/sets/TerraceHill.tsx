// TerraceHill (a.k.a. SeaOfDoors) — S8 (S10 Part B "twenty-two million doors", PEAK 3). Canvas coords at rest.
//
// mode 'hill' (default, storyboard JSON): terraces of identical frontal website facades climbing a hill, looked UP at
// from the street, with NO overlap:
//   w_k = 90 * 0.8^k, h_k = 158 * 0.8^k, base_0 = 1500, base_k = top_(k-1) - 3 * 0.8^k   (bases 1500 ... ridge ~700).
// Rows 0..HAZE-1 (default 8) are houses; rows from `hazeFrom` on collapse into 3 flat HAZE BANDS on the playbook ladder
// (#84B09C -> #98C0AE -> #A2C8B6 -> the day sky): stepped skyline silhouettes with a few window dots, never per-house
// rects under ~6 px (style_bible_ref2 8). Zig-zag stairs climb rows 1-6.
// mode 'flat' (the md's "doors to the horizon"): the same houses in rows on a ONE-POINT ground plane converging to
// TERRACE_FLAT.vp: row k at scale 0.74^k (base = horizon + 650 s), streets between the rows, an avenue every 7 houses
// (gaps on rays to the VP), haze bands from row 6 up to the horizon y 850, where the sun sits half-set.
//
// INK BY DEPTH (screen space): row 0 3.4 px, row 1 2.2, rows 2-3 1.6, then fill-only; structure (broken roof lines with
// overshoot, wall edges) plus window / door frames, built from sketch lines like SiteFacade. For the zoom-6 hidden match
// the ink keeps a WORLD-unit floor (row 0 0.85, rows 1-5 0.6 -> 0.4): width = max(world * zoom, screen) on screen, so the
// two regimes meet without a pop (crossover ~zoom 2-4). Fill misregistration is SCREEN space (/ zoom).
//
// ROW 0 HOUSE #4 is the hidden-match object: facade x 482.5-572.5 (y 1342-1500), window (500, 1372, 55, 35), door (515,
// 1439.5, 30, 50), lock centred (540, 1464.5) 8.5 x 10.5; at the Part B start camera (540, 1407) zoom 6.0 it lands exactly
// where Part A's door #4, window, lock and cornice line (screen y 570) were. It is THE FIXED DOOR: from `fixedAt`
// (default = flagAt) it carries one colour accent (a stepped sage glow arch + a sage door) and the cream check flag on its
// cornice, flying over the (tan) house above it.
// Rows pop in as the caption floor (screen y 570, `revealFloor`) passes their tops during the pull-back. Waves: plaque
// dots row 0 -> ridge (the haze bands blink sand plaque specks), Bit silhouettes in every near lock; the edges extend
// outward (`extendAt`). Beat overlays live OUTSIDE the set: <TerraceRings/> (the 12 target rings, TERRACE.rings).
//
//   <TerraceHill revealFloor={570} plaqueWaveAt={50.6} bitWaveAt={52.2} flagAt={51.9} extendAt={52.9}
//     house4Lock={{state: 'fixed'}} sun={<Sun .../>} />
//   <TerraceRings at={53.5} />                       // scene overlay, same camera
//   TERRACE.rows[k] = {base, top, w, h, s}; terraceDoor(k, j) / TERRACE.house4 / TERRACE.rings / stairPoint(k)
//   TERRACE_FLAT = {horizon, vp, sun, rows, avenue}   // mode 'flat' anchors

import React from 'react';
import {palette, misreg, skies} from '../../../lib/theme';
import {useTime} from '../../../lib/time';
import {Ink} from '../../../lib/Ink';
import {Fill} from '../../../lib/Fill';
import {line, rect as sketchRect, Pt} from '../../../lib/sketch';
import {mat, useXf, XG} from '../../../lib/xf';
import {rand, rng, Seed} from '../../../lib/rng';
import {PathBuf, mix} from '../../../lib/cine/util';
import {atmos} from '../../../lib/cine/atmosphere';
import {LayerWrap, noWrap, SetPlace} from './common';
import {ChromeSlot, CheckFlagSlot, LockProps, PlaqueSlot, TargetRingSlot} from './propSlots';
import {Lock} from '../props';
import {FacadeDoor, shadeOf} from './SiteFacade';

type Mode = 'hill' | 'flat';

// ---------------------------------------------------------------- the row formulas

export type TerraceRow = {k: number; s: number; w: number; h: number; base: number; top: number; x0: number};

/** Flat-mode ground plane: horizon, camera height at scale 1 (base_0 - horizon), row ratio. */
const FLAT = {horizon: 850, cam: 650, ratio: 0.74, avenueEvery: 7, avenueAt: 3} as const;

function makeRows(mode: Mode, n = 30): TerraceRow[] {
  const rows: TerraceRow[] = [];
  let base = 1500;
  for (let k = 0; k < n; k++) {
    if (mode === 'hill') {
      const s = Math.pow(0.8, k);
      const w = 90 * s;
      const h = 158 * s;
      if (k > 0) base = rows[k - 1].top - 3 * s;
      const top = base - h;
      // row 0: house #4 spans 482.5-572.5 (x0 = 32.5 + 90 j); higher rows alternate by half a facade
      const x0 = 527.5 - w / 2 + (k % 2 ? w / 2 : 0);
      rows.push({k, s, w, h, base, top, x0});
      if (h < 1.6 || top < 690) break;
    } else {
      const s = Math.pow(FLAT.ratio, k);
      const w = 90 * s;
      const h = 158 * s;
      const b = FLAT.horizon + FLAT.cam * s;
      // the house columns converge on the VP: world column X (at s = 1) lands at 540 + (X - 540) s
      rows.push({k, s, w, h, base: b, top: b - h, x0: 540 + (482.5 - 540) * s});
      if (h < 1.4) break;
    }
  }
  return rows;
}

const ROWS_HILL = makeRows('hill');
const ROWS_FLAT = makeRows('flat');
const rowsOf = (mode: Mode) => (mode === 'hill' ? ROWS_HILL : ROWS_FLAT);

/** Rows from here on are drawn as haze bands (per mode). */
const HAZE_FROM: Record<Mode, number> = {hill: 8, flat: 6};

export const TERRACE = {
  rows: ROWS_HILL,
  /** The hidden-match house (row 0). */
  house4: {facade: [482.5, 1342, 90, 158] as [number, number, number, number], window: [500, 1372, 55, 35] as [number, number, number, number], door: [515, 1439.5, 30, 50] as [number, number, number, number], lock: {x: 540, y: 1464.5, w: 8.5, h: 10.5}},
  /** Part B start camera (world point at screen centre, zoom) and the cornice line it lands at. */
  matchCam: {x: 540, y: 1407, zoom: 6, corniceScreenY: 570},
  ridge: 700,
  /** Rest sun: behind the ridge, cresting it (the scene moves it). */
  sun: {x: 700, y: 720, r: 150},
  /** Rows from here collapse into haze bands. */
  hazeFrom: HAZE_FROM.hill,
  /** The check flag: pole foot on house #4's cornice; the flag flies between the window and the door of the (tan) house
   *  above, pole 76, flag 40 wide. */
  flag: {x: 548, y: 1342, pole: 76, size: 40},
  /** 12 "could be hit" target rings (x <= 930), [x, y, r]; index 7 = the dive target (row 7, r7). Drawn by
   *  <TerraceRings/> (a scene overlay), not by the set. */
  rings: [
    [182, 1460, 25],
    [858, 1466, 24],
    [322, 1290, 20],
    [742, 1300, 19],
    [430, 1180, 15],
    [862, 1190, 15],
    [262, 1083, 12],
    [600, 858, 7],
    [690, 1010, 10],
    [148, 960, 10],
    [905, 905, 8],
    [455, 940, 8],
  ] as [number, number, number][],
  /** Screen floor the rows reveal under during the pull-back (the caption band floor). */
  revealFloor: 570,
} as const;

/** Mode 'flat' anchors: the horizon the haze bands sit on, the VP the house columns / avenues converge to, the sun
 *  half-set on the horizon (r240: its top stays at y 610, under the caption block), the rows and the avenue columns. */
export const TERRACE_FLAT = {
  horizon: FLAT.horizon,
  vp: [540, FLAT.horizon] as Pt,
  sun: {x: 540, y: FLAT.horizon, r: 240},
  rows: ROWS_FLAT,
  hazeFrom: HAZE_FROM.flat,
  /** World columns (house index j in row 0 units) that are avenues: j = 3 + 7 n (row 0: x 752.5-842.5, 122.5-212.5). */
  avenue: (j: number) => (((j - FLAT.avenueAt) % FLAT.avenueEvery) + FLAT.avenueEvery) % FLAT.avenueEvery === 0,
  /** The avenue right of house #4 (j = 3): its centre column at scale 1. */
  avenueX: 482.5 + 90 * 3 + 45,
} as const;

/** Door centre (world) of house j in row k (j = 0 at the row's x0; negative j to the left). */
export function terraceDoor(k: number, j: number, mode: Mode = 'hill'): {door: [number, number, number, number]; lock: Pt; plaque: Pt; overDoor: Pt} {
  const R = rowsOf(mode)[k];
  const u = R.w / 90;
  const x = R.x0 + j * R.w;
  return {door: [x + 32.5 * u, R.top + 97.5 * u, 30 * u, 50 * u], lock: [x + 57.5 * u, R.top + 122.5 * u], plaque: [x + 18 * u, R.top + 110 * u], overDoor: [x + 47.5 * u, R.top + 86 * u]};
}

/** hill: a point on stair flight k (0..), t 0..1 along it. flat: a point on the avenue's centre line between row k's base
 *  (t 0) and row k+1's base (t 1). */
export function stairPoint(k: number, t = 0, mode: Mode = 'hill'): Pt {
  const rows = rowsOf(mode);
  const R = rows[Math.min(k, rows.length - 1)];
  if (mode === 'flat') {
    const R1 = rows[Math.min(k + 1, rows.length - 1)];
    const s = R.s + (R1.s - R.s) * t;
    return [540 + (TERRACE_FLAT.avenueX - 540) * s, FLAT.horizon + FLAT.cam * s];
  }
  const sx = stairX(k);
  const dir = k % 2 ? -1 : 1;
  return [sx + dir * (t - 0.5) * R.w * 0.5, R.base - t * R.h];
}
const stairX = (k: number) => 612 + (k % 2 ? 1 : -1) * 6 * Math.pow(0.8, k);

// ---------------------------------------------------------------- ink ladder

/** On-screen ink (px) per row: row 0 3.4, row 1 2.2, rows 2-3 1.6, then none. */
const SCREEN_INK = [3.4, 2.2, 1.6, 1.6];
/** World-unit floor (the zoom-6 match): row 0 0.85, rows 1-5 0.6 -> 0.4. */
const WORLD_INK = [0.85, 0.6, 0.55, 0.5, 0.45, 0.4];
/** World stroke width for row k at this zoom (0 = no ink): on screen max(world * zoom, screen), dropped under 1.2 px. */
export function terraceInk(k: number, zoom: number): number {
  const scr = Math.max((WORLD_INK[k] ?? 0) * zoom, SCREEN_INK[k] ?? 0);
  return scr < 1.2 ? 0 : scr / zoom;
}
const INK_ROWS = 6;

// ---------------------------------------------------------------- per-row batched geometry

type RowChunk = {facades: string[]; shade: string; screens: string; bars: string; doors: string; plaques: string; locks: string; bits: string; ink: string; detail: string; stairs: string; stairInk: string};

const COLORS = [palette.cream, palette.sand, palette.tan, palette.mintPale];
const f2 = (n: number) => n.toFixed(2);

function rowChunks(mode: Mode, R: TerraceRow, half: [number, number], ext: [number, number], seed: string): {core: RowChunk; left: RowChunk; right: RowChunk} {
  const mk = () => ({pb: COLORS.map(() => new PathBuf(2)), shade: new PathBuf(2), screens: new PathBuf(2), bars: new PathBuf(2), doors: new PathBuf(2), plaques: new PathBuf(2), locks: new PathBuf(2), bits: new PathBuf(2), ink: '', detail: '', stairs: new PathBuf(2), stairInk: ''});
  const parts = {core: mk(), left: mk(), right: mk()};
  const u = R.w / 90;
  const k = R.k;
  const sx = stairX(k);
  const jFrom = Math.floor((ext[0] - R.x0) / R.w) - 1;
  const jTo = Math.ceil((ext[1] - R.x0) / R.w) + 1;
  const inked = k < INK_ROWS;
  const detailInk = k <= 2;
  for (let j = jFrom; j <= jTo; j++) {
    const x = R.x0 + j * R.w;
    const cx = x + R.w / 2;
    if (cx < ext[0] || cx > ext[1]) continue;
    // house #4 (row 0, j 0) is drawn in full detail by the set
    if (k === 0 && j === 0) continue;
    const P = cx < half[0] ? parts.left : cx > half[1] ? parts.right : parts.core;
    const hs = `${seed}/${mode}/${k}/${j}`;
    // flat: avenues (gaps on rays to the VP); the ground plane shows through
    if (mode === 'flat' && TERRACE_FLAT.avenue(j)) {
      if (inked) P.ink += line(x, R.base, x, R.top + R.h * 0.1, {seed: `${hs}/av`, over: [0, 2 * u], breaks: false});
      continue;
    }
    // hill: the stair gap (rows 1-6): no house where the stair climbs
    if (mode === 'hill' && k >= 1 && k <= 6 && Math.abs(cx - sx) < R.w * 0.5) {
      const dir = k % 2 ? -1 : 1;
      const xa = sx - dir * R.w * 0.3;
      const xb = sx + dir * R.w * 0.3;
      P.stairs.rect(x, R.top, R.w, R.h);
      let st = `M${f2(xa)} ${f2(R.base)}L${f2(xb)} ${f2(R.top)}M${f2(xa + dir * R.w * 0.14)} ${f2(R.base)}L${f2(xb + dir * R.w * 0.14)} ${f2(R.top)}`;
      for (let s = 1; s < 8; s++) {
        const q = s / 8;
        st += `M${f2(xa + (xb - xa) * q)} ${f2(R.base - R.h * q)}l${f2(dir * R.w * 0.14)} 0`;
      }
      P.stairInk += st;
      continue;
    }
    // the house above #4 (hill row 1, j 0) is tan: the cream check flag flies over it
    const ci = mode === 'hill' && k === 1 && j === 0 ? 2 : Math.floor(rand(seed, `${mode}/${k}/${j}`) * COLORS.length);
    P.pb[ci].rect(x, R.top, R.w, R.h);
    if (k <= 5 && COLORS[ci] !== palette.tan) P.shade.rect(x, R.top, R.w * 0.18, R.h);
    if (k <= 6) {
      P.screens.rect(x + 17.5 * u, R.top + 39.5 * u, 55 * u, 25.5 * u);
      P.bars.rect(x + 17.5 * u, R.top + 30 * u, 55 * u, 9.5 * u);
    } else P.screens.rect(x + 17.5 * u, R.top + 30 * u, 55 * u, 35 * u);
    P.doors.rect(x + 32.5 * u, R.top + 97.5 * u, 30 * u, 50 * u);
    // dots never under 3 px at rest (no sub-pixel noise)
    const pq = Math.max(8 * u, 3);
    P.plaques.rect(x + 18 * u - pq / 2, R.top + 110 * u - pq / 2, pq, pq);
    if (k <= 5) {
      const lw = Math.max(8.5 * u, 3);
      const lh = Math.max(10.5 * u, 3.6);
      P.locks.rect(x + 57.5 * u - lw / 2, R.top + 122.5 * u - lh / 2, lw, lh);
      P.bits.circle(x + 57.5 * u, R.top + 121 * u, Math.max(2.6 * u, 1.4));
    }
    if (inked) {
      // structure: a per-house roof line with overshoot (sometimes broken), a doubled cornice on the near rows, the left
      // wall edge (left out on ~1 in 6: unclosed contours)
      const r = rng(`${hs}/i`);
      const ov = (a: number, b: number) => [r.range(a, b) * u, r.range(a, b) * u] as [number, number];
      if (r.chance(0.3)) {
        const cut = x + R.w * r.range(0.35, 0.7);
        P.ink += line(x, R.top, cut - 4 * u, R.top, {seed: `${hs}/r1`, over: ov(2, 7), breaks: false}) + line(cut + 3 * u, R.top, x + R.w, R.top, {seed: `${hs}/r2`, over: ov(1, 8), breaks: false});
      } else P.ink += line(x, R.top, x + R.w, R.top, {seed: `${hs}/r`, over: ov(2, 9), breaks: false});
      if (k <= 1 && r.chance(0.75)) P.ink += line(x + 3 * u, R.top + 8 * u, x + R.w - 3 * u, R.top + 8 * u, {seed: `${hs}/c`, over: ov(0, 4), breaks: false});
      if (r.chance(0.84)) P.ink += line(x, R.base, x, R.top, {seed: `${hs}/w`, over: [0, r.range(1, 5) * u], breaks: false});
      if (detailInk) {
        // window (one side left open) + door frame (top, left, right)
        P.detail += sketchRect(x + 17.5 * u, R.top + 30 * u, 55 * u, 35 * u, {seed: `${hs}/wi`, edges: r.chance(0.5) ? 'tlb' : 'tlr', over: 5 * u});
        P.detail += sketchRect(x + 32.5 * u, R.top + 97.5 * u, 30 * u, 50 * u, {seed: `${hs}/di`, edges: 'tlr', over: 4 * u});
      }
    }
  }
  const fin = (p: ReturnType<typeof mk>): RowChunk => ({facades: p.pb.map((b) => b.d), shade: p.shade.d, screens: p.screens.d, bars: p.bars.d, doors: p.doors.d, plaques: p.plaques.d, locks: p.locks.d, bits: p.bits.d, ink: p.ink, detail: p.detail, stairs: p.stairs.d, stairInk: p.stairInk});
  return {core: fin(parts.core), left: fin(parts.left), right: fin(parts.right)};
}

/** The initial hill (narrower toward the ridge); extended rows run far past the frame. */
const halfW = (k: number) => 610 - Math.min(1, k / 16) * 300;
const EXT: [number, number] = [-700, 1780];

const CHUNKS = new Map<string, ReturnType<typeof rowChunks>>();
function chunksFor(mode: Mode, k: number, seed: string) {
  const key = `${mode}/${k}/${seed}`;
  let v = CHUNKS.get(key);
  if (!v) {
    const hw = halfW(k);
    v = rowChunks(mode, rowsOf(mode)[k], [540 - hw, 540 + hw], EXT, seed);
    CHUNKS.set(key, v);
  }
  return v;
}

// ---------------------------------------------------------------- haze bands (rows >= hazeFrom)

/** The playbook's day haze ladder (style_bible_ref2 8): near -> far, toward the day sky #ACD1BF. */
export const TERRACE_HAZE = ['#84B09C', '#98C0AE', mix('#98C0AE', skies.day, 0.5)] as const;

type BandChunk = {fill: string; dots: string; plaques: string};
type Band = {i: number; from: number; to: number; top: number; bottom: number; color: string; dot: string; chunks: {core: BandChunk; left: BandChunk; right: BandChunk}};

const BANDS = new Map<string, Band[]>();
function bandsFor(mode: Mode, hazeFrom: number, seed: string): Band[] {
  const key = `${mode}/${hazeFrom}/${seed}`;
  const hit = BANDS.get(key);
  if (hit) return hit;
  const rows = rowsOf(mode);
  const last = rows.length - 1;
  const groups: [number, number][] = [
    [hazeFrom, Math.min(last, hazeFrom + 1)],
    [hazeFrom + 2, Math.min(last, hazeFrom + 3)],
    [hazeFrom + 4, last],
  ].filter(([a, b]) => a <= last && a <= b) as [number, number][];
  const out: Band[] = groups.map(([a, b], i) => {
    const near = rows[a];
    const far = rows[b];
    const r = rng(`${seed}/band/${mode}/${i}`);
    const parts = {core: {fill: new PathBuf(2), dots: new PathBuf(2), plaques: new PathBuf(2)}, left: {fill: new PathBuf(2), dots: new PathBuf(2), plaques: new PathBuf(2)}, right: {fill: new PathBuf(2), dots: new PathBuf(2), plaques: new PathBuf(2)}};
    const hw = halfW(a);
    const which = (x: number) => (x < 540 - hw ? parts.left : x > 540 + hw ? parts.right : parts.core);
    // the band reaches down under the nearer row's top (hidden there); flat mode's far band reaches up to the horizon
    const bottom = (a > 0 ? rows[a - 1].top : near.base) + 3;
    const baseTop = mode === 'flat' && i === groups.length - 1 ? FLAT.horizon : far.top;
    // stepped skyline: blocks 2-5 far houses wide (never under 12 px), a step of 0-35 % of a far house, a few towers
    const step = Math.max(12, far.w);
    let top = baseTop;
    for (let x = EXT[0]; x < EXT[1]; ) {
      const bw = step * r.int(2, 5);
      const lift = r.chance(0.12) ? far.h * r.range(0.6, 1.1) + 3 : far.h * r.range(0, 0.35);
      top = baseTop - lift;
      which(x + bw / 2).fill.rect(x, top, bw + 0.5, bottom - top);
      x += bw;
    }
    // window dots (darker step) and plaque specks (sand, they blink with the wave), >= 3 px, sparse
    for (let k = a; k <= Math.min(b, a + 1); k++) {
      const R = rows[k];
      const u = R.w / 90;
      const dw = Math.max(3, 30 * u);
      const dh = Math.max(3, 18 * u);
      const pitch = Math.max(R.w, 9);
      for (let x = R.x0 + Math.floor((EXT[0] - R.x0) / pitch) * pitch; x < EXT[1]; x += pitch) {
        if (mode === 'flat' && TERRACE_FLAT.avenue(Math.round((x - R.x0) / R.w))) continue;
        if (r.chance(i === 0 ? 0.2 : i === 1 ? 0.1 : 0)) which(x).dots.rect(x + 22 * u, R.top + 34 * u, dw, dh);
        if (i === 0 && r.chance(0.1)) which(x).plaques.rect(x + 16 * u, R.top + 104 * u, 3, 3);
      }
    }
    const fin = (p: typeof parts.core): BandChunk => ({fill: p.fill.d, dots: p.dots.d, plaques: p.plaques.d});
    return {i, from: a, to: b, top: baseTop - far.h * 1.1 - 3, bottom, color: TERRACE_HAZE[i], dot: i === 0 ? palette.sage : TERRACE_HAZE[i - 1], chunks: {core: fin(parts.core), left: fin(parts.left), right: fin(parts.right)}};
  });
  BANDS.set(key, out);
  return out;
}

// ---------------------------------------------------------------- render

const revealXf = (reveal: number, y: number, node: React.ReactNode) => (reveal >= 1 ? node : reveal <= 0 ? null : <XG m={mat.about(mat.scale(1, reveal), 540, y)}>{node}</XG>);

const RowNode: React.FC<{mode: Mode; k: number; zoom: number; reveal: number; extended: boolean; plaques: boolean; bits: boolean; seed: string}> = ({mode, k, zoom, reveal, extended, plaques, bits, seed}) => {
  const R = rowsOf(mode)[k];
  const C = chunksFor(mode, k, seed);
  const depth = Math.min(1, k / (HAZE_FROM[mode] + 3));
  const off: [number, number] = [misreg.dx / zoom, misreg.dy / zoom];
  const tint = (c: string) => (k <= 2 ? c : atmos(c, depth, 'day', {clear: 0.2}));
  const cols = COLORS.map(tint);
  const wall = tint(palette.sand);
  const door = k <= 4 ? palette.teal : tint(palette.teal);
  const iw = terraceInk(k, zoom);
  const dw = k <= 2 && iw > 0 ? Math.max(1.5 / zoom, iw * 0.66) : 0;
  const sets: RowChunk[] = extended ? [C.core, C.left, C.right] : [C.core];
  const inner = (
    <>
      {/* retaining wall strip under the row (hill) */}
      {mode === 'hill' ? <Fill rect={[EXT[0], R.base, EXT[1] - EXT[0], Math.max(0.6, 3 * R.s + 0.5)]} color={wall} offset={false} mode="snap" seed={`${seed}/w${k}`} /> : null}
      {sets.map((c, i) => (
        <React.Fragment key={i}>
          {c.facades.map((d, ci) => (d ? <Fill key={ci} d={d} color={cols[ci]} offset={k <= 3 ? off : false} mode="snap" seed={`${seed}/f${k}/${i}/${ci}`} /> : null))}
          {c.shade ? <Fill d={c.shade} color={k <= 2 ? palette.sand : tint(palette.sand)} offset={false} mode="snap" seed={`${seed}/sh${k}/${i}`} /> : null}
          {c.stairs ? <Fill d={c.stairs} color={wall} offset={false} mode="snap" seed={`${seed}/st${k}/${i}`} /> : null}
          {c.screens ? <Fill d={c.screens} color={palette.cream} offset={false} mode="snap" seed={`${seed}/s${k}/${i}`} /> : null}
          {c.bars ? <Fill d={c.bars} color={palette.tealDark} offset={false} mode="snap" seed={`${seed}/b${k}/${i}`} /> : null}
          {c.doors ? <Fill d={c.doors} color={door} offset={false} mode="snap" seed={`${seed}/d${k}/${i}`} /> : null}
          {plaques && c.plaques ? <Fill d={c.plaques} color={palette.sand} offset={false} mode="snap" seed={`${seed}/p${k}/${i}`} /> : null}
          {c.locks ? <Fill d={c.locks} color={palette.sand} offset={false} mode="snap" seed={`${seed}/l${k}/${i}`} /> : null}
          {bits && c.bits ? <Fill d={c.bits} color={palette.ink} offset={false} mode="snap" seed={`${seed}/bit${k}/${i}`} /> : null}
          {iw > 0 && c.ink ? <Ink d={c.ink} width={iw} taper={false} vary={0.05} seed={`${seed}/i${k}/${i}`} /> : null}
          {dw > 0 && c.detail ? <Ink d={c.detail} width={dw} taper={false} vary={0.05} seed={`${seed}/di${k}/${i}`} /> : null}
          {c.stairInk && iw > 0 ? <Ink d={c.stairInk} width={iw * 0.8} taper={false} vary={0} seed={`${seed}/si${k}/${i}`} /> : null}
        </React.Fragment>
      ))}
    </>
  );
  return revealXf(reveal, R.base, inner);
};

const BandNode: React.FC<{band: Band; reveal: number; extended: boolean; plaques: boolean; seed: string}> = ({band, reveal, extended, plaques, seed}) => {
  const sets = extended ? [band.chunks.core, band.chunks.left, band.chunks.right] : [band.chunks.core];
  const inner = (
    <>
      {sets.map((c, i) => (
        <React.Fragment key={i}>
          {c.fill ? <Fill d={c.fill} color={band.color} offset={false} mode="snap" seed={`${seed}/hz${band.i}/${i}`} /> : null}
          {c.dots ? <Fill d={c.dots} color={band.dot} offset={false} mode="snap" seed={`${seed}/hzd${band.i}/${i}`} /> : null}
          {plaques && c.plaques ? <Fill d={c.plaques} color={palette.sand} offset={false} mode="snap" seed={`${seed}/hzp${band.i}/${i}`} /> : null}
        </React.Fragment>
      ))}
    </>
  );
  return revealXf(reveal, band.bottom, inner);
};

/** The fixed door's colour accent: a stepped sage glow arch (sage, then mintPale) around door #4 + a sage door. */
function glowArch(x: number, y: number, w: number, bottom: number): string {
  const r = w / 2;
  return `M${x} ${bottom}V${y + r}A${r} ${r} 0 0 1 ${x + w} ${y + r}V${bottom}Z`;
}

export type TerraceHillProps = {
  mode?: Mode;
  /** Rows appear as their top passes below this SCREEN y (the caption floor, 570) — a 14 px spatial pop. Omit = all. */
  revealFloor?: number;
  /** Plaque dots blink on row 0 -> ridge (row k at plaqueWaveAt + k * waveStep; the haze bands blink sand specks). */
  plaqueWaveAt?: number;
  /** A Bit silhouette pops into every lock (rows 0-5), row by row. Omit = none. */
  bitWaveAt?: number;
  waveStep?: number;
  /** The terraces extend at the edges (row k at extendAt + k * 0.03). Omit = already extended. */
  extendAt?: number;
  /** The check flag on house #4 rises. Omit = none; -1 = up. */
  flagAt?: number;
  /** House #4's fixed accent (sage glow arch + sage door) pops on. Default = flagAt; -1 = on; omit both = off (the
   *  zoom-6 match frame must stay plain). */
  fixedAt?: number;
  /** House #4's lock (props-lane Lock props; default the FIXED lock: Part A installed it). */
  house4Lock?: Partial<LockProps>;
  /** Rows from here are haze bands (default hill 8, flat 6). */
  hazeFrom?: number;
  sun?: React.ReactNode;
  wrap?: LayerWrap;
  x?: number;
  y?: number;
  scale?: number;
  /** Un-build just this set from here (s), over outDur (default 0.5). */
  outAt?: number;
  outDur?: number;
  seed?: Seed;
};

export const TerraceHill: React.FC<TerraceHillProps> = ({mode = 'hill', revealFloor, plaqueWaveAt, bitWaveAt, waveStep = 0.06, extendAt, flagAt, fixedAt, house4Lock = {}, hazeFrom, sun, wrap = noWrap, x = 0, y = 0, scale = 1, outAt, outDur, seed = 'terr'}) => {
  const t = useTime();
  const m = useXf();
  const zoom = Math.sqrt(Math.abs(m[0] * m[3] - m[1] * m[2])) * scale || 1;
  const rows = rowsOf(mode);
  const haze = Math.min(rows.length, hazeFrom ?? HAZE_FROM[mode]);
  const sd = String(seed);
  const screenY = (wy: number) => m[1] * 540 + m[3] * (wy * scale + y) + m[5];
  const revealOf = (top: number) => (revealFloor === undefined ? 1 : Math.max(0, Math.min(1, (screenY(top) - revealFloor) / 14 + 1)));
  const plaquesAt = (k: number) => plaqueWaveAt === undefined || t >= plaqueWaveAt + k * waveStep;
  const extendedAt = (k: number) => extendAt === undefined || t >= extendAt + k * 0.03;
  const nodes: React.ReactNode[] = [];
  // far -> near: haze bands, then the house rows
  const bands = bandsFor(mode, haze, sd);
  for (let i = bands.length - 1; i >= 0; i--) {
    const b = bands[i];
    const reveal = revealOf(b.top);
    if (reveal > 0) nodes.push(<BandNode key={`b${i}`} band={b} reveal={reveal} extended={extendedAt(b.from)} plaques={plaquesAt(b.from)} seed={sd} />);
  }
  for (let k = haze - 1; k >= 0; k--) {
    const reveal = revealOf(rows[k].top);
    if (reveal <= 0) continue;
    const bits = bitWaveAt !== undefined && t >= bitWaveAt + k * waveStep;
    nodes.push(<RowNode key={k} mode={mode} k={k} zoom={zoom} reveal={reveal} extended={extendedAt(k)} plaques={plaquesAt(k)} bits={bits} seed={sd} />);
  }
  // house #4 in full detail (the hidden-match object, THE fixed door)
  const H4 = TERRACE.house4;
  const r0 = rows[0];
  const fx = fixedAt ?? flagAt;
  const fixed = fx !== undefined && (fx < 0 || t >= fx);
  // ink: the world floor of the match (0.85) or the row-0 screen ladder, whichever is heavier on screen
  const w0 = terraceInk(0, zoom);
  const wd = Math.max(0.85, 1.9 / zoom);
  const F = TERRACE.flag;
  const house4 = (
    <>
      <Fill rect={H4.facade} color={palette.sand} offset={[misreg.dx / zoom, misreg.dy / zoom]} seed={`${sd}/h4f`} />
      <Fill rect={[H4.facade[0], H4.facade[1], H4.facade[2] * 0.22, H4.facade[3]]} color={palette.tan} offset={false} seed={`${sd}/h4s`} />
      {fixed ? (
        <>
          <Fill d={glowArch(498, 1406, 64, r0.base)} color={palette.sage} offset={false} mode="snap" seed={`${sd}/h4g1`} />
          <Fill d={glowArch(507, 1420, 46, r0.base)} color={palette.mintPale} offset={false} mode="snap" seed={`${sd}/h4g2`} />
        </>
      ) : null}
      <Ink d={line(H4.facade[0], H4.facade[1], H4.facade[0] + H4.facade[2], H4.facade[1], {seed: `${sd}/h4c`, over: [5, 3], breaks: false}) + line(H4.facade[0], H4.facade[1], H4.facade[0], r0.base, {seed: `${sd}/h4l`, over: [0, 1], breaks: false}) + line(H4.facade[0] + H4.facade[2], H4.facade[1], H4.facade[0] + H4.facade[2], r0.base, {seed: `${sd}/h4r`, over: [0, 1], breaks: false})} width={w0} taper={false} vary={0} />
      <ChromeSlot x={H4.window[0]} y={H4.window[1]} w={H4.window[2]} h={H4.window[3]} width={wd} seed={`${sd}/h4w`} />
      <FacadeDoor r={H4.door} color={fixed ? palette.sage : palette.teal} width={wd} seed={`${sd}/h4d`} />
      <PlaqueSlot x={H4.facade[0] + 18} y={H4.facade[1] + 110} size={8} width={Math.max(0.4, 1 / zoom)} seed={`${sd}/h4p`} />
      <Lock x={H4.lock.x} y={H4.lock.y} size={H4.lock.h} state="fixed" ink={Math.max(0.6, 1.2 / zoom)} seed={`${sd}/h4lock`} {...house4Lock} />
      {flagAt !== undefined ? <CheckFlagSlot x={F.x} y={F.y} size={F.size} raiseAt={flagAt < 0 ? undefined : flagAt} at={flagAt < 0 ? undefined : flagAt} width={Math.max(1.6, 2.2 / zoom)} seed={`${sd}/flag`} /> : null}
    </>
  );
  // the near street (screen-flat field) with a few seeded specks; flat mode adds the ground plane behind the rows
  const street = (
    <>
      <Fill rect={[-700, r0.base, 2480, 700]} color={palette.mintPale} offset={false} mode="snap" seed={`${sd}/street`} />
      <Fill rect={[-700, r0.base, 2480, 10]} color={palette.sand} offset={false} mode="snap" seed={`${sd}/kerbF`} />
      <Ink d={line(-700, r0.base + 10, 1780, r0.base + 10, {seed: `${sd}/k1`, over: 0}) + line(-40, r0.base + 34, 1120, r0.base + 35, {seed: `${sd}/k2`, over: 0})} width={Math.max(0.85, 3.4 / zoom)} taper={false} vary={0} seed={`${sd}/kerb`} />
      <Ink d={STREET_SPECKS} width={Math.max(0.6, 2.2 / zoom)} taper={false} vary={0} seed={`${sd}/specks`} />
    </>
  );
  const ground =
    mode === 'flat' ? (
      <>
        <Fill rect={[-700, FLAT.horizon - 1, 2480, r0.base - FLAT.horizon + 2]} color={palette.mintPale} offset={false} mode="snap" seed={`${sd}/plane`} />
        <Fill d={AVENUES} color={palette.cream} offset={false} mode="snap" seed={`${sd}/avenues`} />
      </>
    ) : null;
  return (
    <SetPlace x={x} y={y} scale={scale} outAt={outAt} outDur={outDur}>
      {sun ? wrap('sun', 0.05, sun) : null}
      {wrap('street', 0.9, street)}
      {wrap(
        'hill',
        0.6,
        <>
          {ground}
          {nodes}
        </>,
      )}
      {wrap('house4', 0.6, house4)}
    </SetPlace>
  );
};

/** Flat mode: the avenue roads (cream wedges from the near row's base to the VP), seen through the gaps and streets. */
const AVENUES = (() => {
  const pb = new PathBuf(1);
  for (let j = -60; j <= 60; j++) {
    if (!TERRACE_FLAT.avenue(j)) continue;
    const xa = 482.5 + 90 * j;
    pb.poly([[540, FLAT.horizon], [xa + 4, 1500], [xa + 86, 1500]]);
  }
  return pb.d;
})();

const STREET_SPECKS = (() => {
  const r = rng('terr/specks');
  let d = '';
  for (let i = 0; i < 14; i++) {
    const yy = 1560 + Math.pow(r.next(), 0.8) * 340;
    const xx = r.range(-20, 1100);
    const L = 4 + ((yy - 1560) / 340) * 8;
    d += `M${xx.toFixed(1)} ${yy.toFixed(1)}l${L.toFixed(1)} ${r.range(-0.5, 0.5).toFixed(1)}`;
  }
  return d;
})();

// ---------------------------------------------------------------- beat overlay (scene level)

/** The 12 "could be hit" target rings (TERRACE.rings), popping 0.05 s apart from `at`. A scene overlay: put it under
 *  the same camera as the set. `rings` overrides the anchor list (e.g. computed with terraceDoor for mode 'flat'). */
export const TerraceRings: React.FC<{at?: number; stagger?: number; rings?: readonly (readonly [number, number, number])[]; seed?: string}> = ({at, stagger = 0.05, rings = TERRACE.rings, seed = 'terr'}) => (
  <>
    {rings.map(([rx, ry, rr], i) => (
      <TargetRingSlot key={i} x={rx} y={ry} r={rr} at={at === undefined ? undefined : at + i * stagger} width={Math.max(0.8, rr * 0.12)} seed={`${seed}/ring${i}`} />
    ))}
  </>
);
