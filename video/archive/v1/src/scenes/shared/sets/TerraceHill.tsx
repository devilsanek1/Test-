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
// (default = flagAt) it carries the colour accent (two opaque stepped glow rings, cream + peach, a sage door, a cream path
// strip down the street) and the 60 px cream check flag on its cornice, flying over the (tan) house above it. Two
// back-view standers on the near street look up the hill (`people`).
// Rows pop in as the caption floor (screen y 570, `revealFloor`) passes their tops during the pull-back. Waves: plaque
// dots row 0 -> ridge (the haze bands blink sand plaque specks), Bit silhouettes in every near lock; the edges extend
// outward (`extendAt`). Beat overlays live OUTSIDE the set: <TerraceRings/> (the 12 target rings, TERRACE.rings).
//
//   <TerraceHill revealFloor={570} plaqueWaveAt={50.6} bitWaveAt={52.2} flagAt={51.9} extendAt={52.9}
//     house4Lock={{state: 'fixed'}} sun={<Sun .../>} />
//   <TerraceRings at={53.5} />                       // scene overlay, same camera
//   TERRACE.rows[k] = {base, top, w, h, s}; terraceDoor(k, j) / TERRACE.house4 / TERRACE.rings / stairPoint(k)
//   TERRACE_FLAT = {horizon, vp, sun, rows, avenue}   // mode 'flat' anchors

import React, {useId} from 'react';
import {palette, misreg, skies} from '../../../lib/theme';
import {springAt, springs, useTime} from '../../../lib/time';
import {Ink} from '../../../lib/Ink';
import {Fill} from '../../../lib/Fill';
import {line, polyPath, rect as sketchRect, Pt} from '../../../lib/sketch';
import {mat, useXf, XG} from '../../../lib/xf';
import {rand, rng, Seed} from '../../../lib/rng';
import {PathBuf, mix} from '../../../lib/cine/util';
import {atmos} from '../../../lib/cine/atmosphere';
import {GlowDiscs, LayerWrap, noWrap, SetPlace} from './common';
import {BitSlot, CheckBoxTagSlot, ChromeSlot, CheckFlagSlot, KeeperSlot, LockProps, PlaqueSlot, TargetRingSlot} from './propSlots';
import {Lock} from '../props';
import {FacadeDoor} from './SiteFacade';
import {Foreground, ForegroundSpec} from './ground';
import {People, PeopleSpec, WalkerAnchor} from './life';

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
  /** The check flag: pole foot on house #4's cornice; the flag flies over the (tan) house above, flag 60 wide (the
   *  storyboard's 60 px legibility floor). */
  flag: {x: 548, y: 1342, pole: 90, size: 60},
  /** THE FIXED DOOR's light: two opaque stepped glow rings (SunGlowSteps language) centred on door #4, and a cream path
   *  strip from the door down the near street. */
  fixedGlow: {x: 530, y: 1464, r: [62, 46] as [number, number]},
  /** People layer (life.tsx): two back-view standers on the near street flanking the path, looking up the hill
   *  (heads in the visible band, feet under the platform UI); clear of house #4 and the row-0 rings. */
  walkers: [
    {x: 372, y: 1690, h: 236, go: 'stand', body: palette.teal, hair: 'short', acc: ['scarf']},
    {x: 700, y: 1660, h: 206, go: 'stand', body: palette.sand, hair: 'bun', acc: ['backpack']},
  ] as WalkerAnchor[],
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
  // ---- storyboard v3 (S09 Part B)
  /** Bit on house #4's right door jamb (the hidden-cut match object: 3 px at rest -> 18 px at the zoom-6 match, screen
   *  (570, 1230)); he climbs the jamb (rot -90: head up). */
  bit: {x: 545, y: 1452, size: 3, rot: -90},
  /** The keeper speck (>= 40 px at rest, KNEELING too): beside door #4 at the hidden match, walking to door #5 on a
   *  dotted path; 48 px standing, `crouch` 0.86 when he kneels = 41 px (the storyboard holds the kneel at rest). */
  keeper: {from: [581, 1500] as Pt, to: [662, 1500] as Pt, h: 48, crouch: 0.86, pathY: 1513},
  /** The check-box tag over every door (house-local units at row scale u = w / 90): the props-lane CheckBoxTag design (a
   *  cream card hanging from (47.5, 64) on a tealDark loop, an EMPTY ink check box), `size` 19 = the base unit; drawn at
   *  `k` x size (kit v3b: 1.4 -> 26.6 px on row 0, 13.6 on row 3 at rest) and never under `minScreen[k]` ON-SCREEN px
   *  (rows 0-3: 22 / 17 / 13 / 10) whatever the zoom; batched per row. Door #4's is the only TICKED one (props
   *  CheckBoxTag, same size). */
  checkBox: {hang: [47.5, 64] as [number, number], size: 19, k: 1.4, minScreen: [22, 17, 13, 10] as readonly number[]},
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

type RowChunk = {facades: string[]; shade: string; screens: string; bars: string; barDots: string; doors: string; plaques: string; locks: string; bits: string; ink: string; detail: string; stairs: string; stairInk: string; tagHangs: number[]};

const COLORS = [palette.cream, palette.sand, palette.tan, palette.mintPale];
const f2 = (n: number) => n.toFixed(2);

function rowChunks(mode: Mode, R: TerraceRow, half: [number, number], ext: [number, number], seed: string): {core: RowChunk; left: RowChunk; right: RowChunk} {
  const mk = () => ({pb: COLORS.map(() => new PathBuf(2)), shade: new PathBuf(2), screens: new PathBuf(2), bars: new PathBuf(2), barDots: new PathBuf(2), doors: new PathBuf(2), plaques: new PathBuf(2), locks: new PathBuf(2), bits: new PathBuf(2), ink: '', detail: '', stairs: new PathBuf(2), stairInk: '', tagHangs: [] as number[]});
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
      // rows 0-1: the three cream dots on the bar (the bar alone does not say "browser" on a phone)
      if (k <= 1) for (let d = 0; d < 3; d++) P.barDots.circle(x + (22.5 + d * 6) * u, R.top + 34.75 * u, 2.2 * u);
    } else P.screens.rect(x + 17.5 * u, R.top + 30 * u, 55 * u, 35 * u);
    P.doors.rect(x + 32.5 * u, R.top + 97.5 * u, 30 * u, 50 * u);
    // v3 check-box tag over the door: its hang point (the tags are built per frame by RowTags: their size has an
    // on-screen floor and each row springs in)
    P.tagHangs.push(x + TERRACE.checkBox.hang[0] * u, R.top + TERRACE.checkBox.hang[1] * u);
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
  const fin = (p: ReturnType<typeof mk>): RowChunk => ({facades: p.pb.map((b) => b.d), shade: p.shade.d, screens: p.screens.d, bars: p.bars.d, barDots: p.barDots.d, doors: p.doors.d, plaques: p.plaques.d, locks: p.locks.d, bits: p.bits.d, ink: p.ink, detail: p.detail, stairs: p.stairs.d, stairInk: p.stairInk, tagHangs: p.tagHangs});
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

const RowNode: React.FC<{mode: Mode; k: number; zoom: number; reveal: number; extended: boolean; plaques: boolean; bits: boolean; tagsAt?: number; seed: string}> = ({mode, k, zoom, reveal, extended, plaques, bits, tagsAt, seed}) => {
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
          {c.barDots ? <Fill d={c.barDots} color={palette.cream} offset={false} mode="snap" seed={`${seed}/bd${k}/${i}`} /> : null}
          {c.doors ? <Fill d={c.doors} color={door} offset={false} mode="snap" seed={`${seed}/d${k}/${i}`} /> : null}
          {plaques && c.plaques ? <Fill d={c.plaques} color={palette.sand} offset={false} mode="snap" seed={`${seed}/p${k}/${i}`} /> : null}
          {c.locks ? <Fill d={c.locks} color={palette.sand} offset={false} mode="snap" seed={`${seed}/l${k}/${i}`} /> : null}
          {bits && c.bits ? <Fill d={c.bits} color={palette.ink} offset={false} mode="snap" seed={`${seed}/bit${k}/${i}`} /> : null}
          {iw > 0 && c.ink ? <Ink d={c.ink} width={iw} taper={false} vary={0.05} seed={`${seed}/i${k}/${i}`} /> : null}
          {dw > 0 && c.detail ? <Ink d={c.detail} width={dw} taper={false} vary={0.05} seed={`${seed}/di${k}/${i}`} /> : null}
          {c.stairInk && iw > 0 ? <Ink d={c.stairInk} width={iw * 0.8} taper={false} vary={0} seed={`${seed}/si${k}/${i}`} /> : null}
        </React.Fragment>
      ))}
      {tagsAt !== undefined ? <RowTags k={k} u={R.w / 90} zoom={zoom} at={tagsAt} hangs={sets.map((c) => c.tagHangs)} seed={`${seed}/tg${k}`} /> : null}
    </>
  );
  return revealXf(reveal, R.base, inner);
};

/** On-screen tag width (px) of row k at rest scale: max(k x size x u x zoom, the row's floor). World width back. */
function tagSize(k: number, u: number, zoom: number): number {
  const CB = TERRACE.checkBox;
  return Math.max(CB.k * CB.size * u, (CB.minScreen[k] ?? 0) / zoom, 4);
}

/** One row's EMPTY check-box tags (kit v3b), batched: cream cards (the props CheckBoxTag outline: a slightly skewed card
 *  hanging from its loop), on rows 0-3 an ink card outline (1.6 px on screen), a ~2 px ink check box (1.6 from row 2)
 *  and a tealDark loop; rows 4+ a cream card + a sand box (no ink: the haze ladder). The whole row springs in about each
 *  tag's hang point with the 7 % pop spring (springs.pop: 0 -> 1.07 -> 1), no fades. */
const RowTags: React.FC<{k: number; u: number; zoom: number; at: number; hangs: number[][]; seed: string}> = ({k, u, zoom, at, hangs, seed}) => {
  const t = useTime();
  if (t < at) return null;
  const pop = at < 0 ? 1 : springAt(t, at, springs.pop);
  if (pop <= 0.02) return null;
  const s = tagSize(k, u, zoom) * pop;
  const inked = k <= 3;
  let body = '';
  let outline = '';
  let boxes = '';
  let loops = '';
  for (const hs of hangs) {
    for (let i = 0; i < hs.length; i += 2) {
      const hx = hs[i];
      const hy = hs[i + 1];
      const q: Pt[] = [[hx - s * 0.46, hy + s * 0.22], [hx + s * 0.5, hy + s * 0.12], [hx + s * 0.47, hy + s * 0.98], [hx - s * 0.5, hy + s * 1.02]];
      const qd = `M${q.map((p) => `${f2(p[0])} ${f2(p[1])}`).join('L')}Z`;
      body += qd;
      const b = s * 0.25;
      const by = hy + s * 0.58;
      const box = `M${f2(hx - b)} ${f2(by - b)}h${f2(2 * b)}v${f2(2 * b)}h${f2(-2 * b)}Z`;
      if (inked) {
        outline += qd;
        boxes += box;
        // the loop: the hanging string as a caret from the nail down to the card's top edge (its top edge runs from
        // y + 0.22 s at the left to y + 0.12 s at the right)
        loops += `M${f2(hx - s * 0.2)} ${f2(hy + s * 0.18)}L${f2(hx)} ${f2(hy - s * 0.06)}L${f2(hx + s * 0.2)} ${f2(hy + s * 0.14)}`;
      } else if (2 * b * zoom >= 2) boxes += box;
    }
  }
  const sc = (px: number) => px / zoom;
  return (
    <>
      <Fill d={body} color={palette.cream} offset={false} mode="snap" seed={`${seed}/b`} />
      {inked ? (
        <>
          <Ink d={loops} width={sc(1.6)} color={palette.tealDark} taper={false} vary={0} seed={`${seed}/lp`} />
          <Ink d={outline} width={sc(1.6)} taper={false} vary={0} seed={`${seed}/o`} />
          <Ink d={boxes} width={sc(k <= 1 ? 2 : 1.6)} taper={false} vary={0} seed={`${seed}/x`} />
        </>
      ) : boxes ? (
        <Fill d={boxes} color={palette.sand} offset={false} mode="snap" seed={`${seed}/x`} />
      ) : null}
    </>
  );
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
  /** Storyboard v3: EMPTY cream check-box tags pop over every door, row 0 -> the last house row (row k at
   *  checkBoxWaveAt + k * checkBoxStep: 0.6 s over rows 0-7 by default); door #4's tag is the only TICKED one (with row 0).
   *  -1 = all there. Omit = none. */
  checkBoxWaveAt?: number;
  checkBoxStep?: number;
  /** Storyboard v3: Bit on house #4's door jamb (TERRACE.bit, 3 px at rest = 18 px at the zoom-6 match). true = there;
   *  {at, outAt} = pops on / off (1 frame); {x, y, size, rot, flip} overrides the pose. Default none. */
  bit?: boolean | {at?: number; outAt?: number; x?: number; y?: number; size?: number; rot?: number; flip?: boolean};
  /** Storyboard v3: the keeper speck (props Keeper, TERRACE.keeper: 48 px at rest beside door #4) walking to door #5 on
   *  a dotted path that draws on behind him, then kneeling to work. true = standing at door #4. Default none. */
  keeper?: boolean | {at?: number; walkAt?: number; walkDur?: number; kneelAt?: number; outAt?: number};
  /** Rows from here are haze bands (default hill 8, flat 6). */
  hazeFrom?: number;
  /** Foreground framing on the near street (ground.tsx presets, world coords: it slides out of frame during the pull-back
   *  zoom). Default none: S10's bollard + kerb are screen-space scene props. */
  foreground?: ForegroundSpec;
  /** Back-view standers on TERRACE.walkers (life.tsx). Default on in 'hill', off in 'flat'; false = nobody. */
  people?: PeopleSpec;
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

export const TerraceHill: React.FC<TerraceHillProps> = ({mode = 'hill', revealFloor, plaqueWaveAt, bitWaveAt, waveStep = 0.06, extendAt, flagAt, fixedAt, house4Lock = {}, checkBoxWaveAt, checkBoxStep = 0.085, bit, keeper, hazeFrom, foreground, people, sun, wrap = noWrap, x = 0, y = 0, scale = 1, outAt, outDur, seed = 'terr'}) => {
  const t = useTime();
  const m = useXf();
  const zoom = Math.sqrt(Math.abs(m[0] * m[3] - m[1] * m[2])) * scale || 1;
  const rows = rowsOf(mode);
  const haze = Math.min(rows.length, hazeFrom ?? HAZE_FROM[mode]);
  const sd = String(seed);
  const glowClip = 'tg' + useId().replace(/[^a-zA-Z0-9]/g, '');
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
    const tagsAt = checkBoxWaveAt === undefined ? undefined : checkBoxWaveAt < 0 ? -1 : checkBoxWaveAt + k * checkBoxStep;
    nodes.push(<RowNode key={k} mode={mode} k={k} zoom={zoom} reveal={reveal} extended={extendedAt(k)} plaques={plaquesAt(k)} bits={bits} tagsAt={tagsAt} seed={sd} />);
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
      <defs>
        <clipPath id={glowClip} clipPathUnits="userSpaceOnUse">
          <rect x={-2000} y={-3000} width={5000} height={3000 + r0.base} />
        </clipPath>
      </defs>
      <Fill rect={H4.facade} color={palette.sand} offset={[misreg.dx / zoom, misreg.dy / zoom]} seed={`${sd}/h4f`} />
      <Fill rect={[H4.facade[0], H4.facade[1], H4.facade[2] * 0.22, H4.facade[3]]} color={palette.tan} offset={false} seed={`${sd}/h4s`} />
      {fixed ? (
        <g clipPath={`url(#${glowClip})`}>
          <GlowDiscs cx={TERRACE.fixedGlow.x} cy={TERRACE.fixedGlow.y} steps={[[TERRACE.fixedGlow.r[0], palette.cream], [TERRACE.fixedGlow.r[1], palette.peach]]} />
        </g>
      ) : null}
      <Ink d={line(H4.facade[0], H4.facade[1], H4.facade[0] + H4.facade[2], H4.facade[1], {seed: `${sd}/h4c`, over: [5, 3], breaks: false}) + line(H4.facade[0], H4.facade[1], H4.facade[0], r0.base, {seed: `${sd}/h4l`, over: [0, 1], breaks: false}) + line(H4.facade[0] + H4.facade[2], H4.facade[1], H4.facade[0] + H4.facade[2], r0.base, {seed: `${sd}/h4r`, over: [0, 1], breaks: false})} width={w0} taper={false} vary={0} />
      <ChromeSlot x={H4.window[0]} y={H4.window[1]} w={H4.window[2]} h={H4.window[3]} width={wd} seed={`${sd}/h4w`} />
      <FacadeDoor r={H4.door} color={fixed ? palette.sage : palette.teal} width={wd} seed={`${sd}/h4d`} />
      <PlaqueSlot x={H4.facade[0] + 18} y={H4.facade[1] + 110} size={8} width={Math.max(0.4, 1 / zoom)} seed={`${sd}/h4p`} />
      <Lock x={H4.lock.x} y={H4.lock.y} size={H4.lock.h} state="fixed" ink={Math.max(0.6, 1.2 / zoom)} seed={`${sd}/h4lock`} {...house4Lock} />
      {flagAt !== undefined ? <CheckFlagSlot x={F.x} y={F.y} size={F.size} raiseAt={flagAt < 0 ? undefined : flagAt} at={flagAt < 0 ? undefined : flagAt} width={Math.max(1.6, 2.2 / zoom)} seed={`${sd}/flag`} /> : null}
      {checkBoxWaveAt !== undefined && (checkBoxWaveAt < 0 || t >= checkBoxWaveAt) ? <House4Tag at={checkBoxWaveAt < 0 ? undefined : checkBoxWaveAt} zoom={zoom} ink={Math.max(0.6, 2.2 / zoom)} seed={sd} /> : null}
      <House4Bit spec={bit} seed={sd} />
    </>
  );
  // the near street (screen-flat field) with a few seeded specks; flat mode adds the ground plane behind the rows
  const street = (
    <>
      <Fill rect={[-700, r0.base, 2480, 700]} color={palette.mintPale} offset={false} mode="snap" seed={`${sd}/street`} />
      <Fill rect={[-700, r0.base, 2480, 10]} color={palette.sand} offset={false} mode="snap" seed={`${sd}/kerbF`} />
      <Ink d={line(-700, r0.base + 10, 1780, r0.base + 10, {seed: `${sd}/k1`, over: 0}) + line(-40, r0.base + 34, 1120, r0.base + 35, {seed: `${sd}/k2`, over: 0})} width={Math.max(0.85, 3.4 / zoom)} taper={false} vary={0} seed={`${sd}/kerb`} />
      <Ink d={STREET_SPECKS} width={Math.max(0.6, 2.2 / zoom)} taper={false} vary={0} seed={`${sd}/specks`} />
      {fixed && mode === 'hill' ? <Fill d={FIXED_PATH} color={palette.cream} offset={false} mode="snap" seed={`${sd}/fpath`} /> : null}
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
      {keeper ? wrap('keeper', 0.6, <KeeperSpeck spec={keeper} zoom={zoom} seed={sd} />) : null}
      {wrap('people', 0.95, <People anchors={TERRACE.walkers} vp={[540, 1440]} spec={people} def={mode === 'hill'} seed={`${sd}/ppl`} />)}
      {foreground ? wrap('foreground', 1.0, <Foreground spec={foreground} seed={`${sd}/fg`} />) : null}
    </SetPlace>
  );
};

/** Door #4's check-box tag: the only TICKED one (props CheckBoxTag), the row-0 size, springing in with row 0. */
const House4Tag: React.FC<{at?: number; zoom: number; ink: number; seed: string}> = ({at, zoom, ink, seed}) => {
  const CB = TERRACE.checkBox;
  return <CheckBoxTagSlot x={TERRACE.house4.facade[0] + CB.hang[0]} y={TERRACE.house4.facade[1] + CB.hang[1]} size={tagSize(0, 1, zoom)} ticked at={at} ink={ink} seed={`${seed}/h4tag`} />;
};

/** Bit on house #4's door jamb (v3 hidden-cut match object). */
const House4Bit: React.FC<{spec: TerraceHillProps['bit']; seed: string}> = ({spec, seed}) => {
  const t = useTime();
  if (!spec) return null;
  const o = spec === true ? {} : spec;
  if (o.at !== undefined && t < o.at) return null;
  if (o.outAt !== undefined && t >= o.outAt) return null;
  const B = TERRACE.bit;
  const bx = o.x ?? B.x;
  const by = o.y ?? B.y;
  const rot = o.rot ?? B.rot;
  const bit = <BitSlot x={bx} y={by} size={o.size ?? B.size} flip={o.flip} seed={`${seed}/h4bit`} />;
  return rot ? <XG m={mat.about(mat.rotate(rot), bx, by)}>{bit}</XG> : bit;
};

/** The keeper speck: beside door #4, walks to door #5 (walkAt, walkDur) on a dotted path that draws on behind him, then
 *  kneels (a TERRACE.keeper.crouch 0.86 crouch about his feet: 41 px at rest) and works (installAt). His ink holds a
 *  world floor through the pull-back. */
const KeeperSpeck: React.FC<{spec: NonNullable<TerraceHillProps['keeper']>; zoom: number; seed: string}> = ({spec, zoom, seed}) => {
  const t = useTime();
  if (spec === false) return null;
  const o = spec === true ? {} : spec;
  if (o.at !== undefined && t < o.at) return null;
  if (o.outAt !== undefined && t >= o.outAt) return null;
  const K = TERRACE.keeper;
  const walkAt = o.walkAt;
  const dur = o.walkDur ?? 1.6;
  const q = walkAt === undefined ? 0 : Math.max(0, Math.min(1, (t - walkAt) / dur));
  const kx = K.from[0] + (K.to[0] - K.from[0]) * q;
  const kneelAt = o.kneelAt ?? (walkAt !== undefined ? walkAt + dur : undefined);
  const kneel = kneelAt !== undefined && t >= kneelAt;
  // the figure is drawn larger and scaled down so its ink (props ladder 'hair' at that size) lands near a 0.85 world /
  // 1.6 screen floor whatever the zoom
  const kk = Math.max(1, Math.min(3, 1.6 / Math.max(0.85, 1.6 / zoom)));
  const fig = (
    <KeeperSlot
      x={K.from[0] * kk}
      y={K.from[1] * kk}
      h={K.h * kk}
      depth="hair"
      walk={walkAt !== undefined ? {at: walkAt, to: [K.to[0] * kk, K.to[1] * kk], dur, hz: 2.4} : undefined}
      installAt={kneel ? kneelAt : undefined}
      installDur={1.5}
      seed={`${seed}/keeper`}
    />
  );
  const scaled = <XG m={mat.scale(1 / kk)}>{fig}</XG>;
  const dash = Math.max(1.2, 6 / zoom);
  return (
    <>
      {q > 0.02 ? <Ink d={`M${K.from[0]} ${K.pathY}L${kx.toFixed(2)} ${K.pathY}`} width={Math.max(0.5, 2.2 / zoom)} dash={`${dash} ${dash * 1.4}`} taper={false} vary={0} seed={`${seed}/kpath`} /> : null}
      {kneel ? <XG m={mat.about(mat.scale(1, K.crouch), K.to[0], K.to[1])}>{scaled}</XG> : scaled}
    </>
  );
};

/** The cream path strip from the fixed door down the near street (hill mode). */
const FIXED_PATH = polyPath([[516, 1500], [544, 1500], [612, 2080], [448, 2080]]);

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
