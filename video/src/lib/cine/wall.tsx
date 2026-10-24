// cine/wall.tsx — WallOfWindows: a vast facade receding in perspective (a projective quad), thousands of windows
// batched into a few paths, floor bands and piers in thin ink near the camera, switch-on/off waves.
// windowQuad() gives the screen quad of any single window, so a detailed hero window can sit exactly on the grid.
//
//   const Q: Quad = [[-80, -400], [760, 620], [760, 1180], [-80, 2300]];      // TL, TR, BR, BL (near side left)
//   <WallOfWindows quad={Q} rows={80} cols={44} tod="night" initial={1}
//     events={[{at: 2, dur: 2.4, to: 'off', pattern: 'wave', origin: [0.95, 0.4], noise: 0.3}]} />
//   const hero = windowQuad(Q, 80, 44, 41, 3);                               // row 41, col 3
//   const Q2 = wallQuadVP({vp: [1000, 1180], near: [-170, -1000, 2600], farX: 690});  // edges converge on the horizon
//   <WallOfWindows ... keepDark={{y0: 260, y1: 590}} lod={{cells: [[39, 3], [39, 4]], above: 3}} />
// keepDark: windows whose SCREEN quad touches the caption band (or caption ink `boxes`) are dark. With a camera `path`
// it has HYSTERESIS: a cell that has touched a box at any time <= t stays dark for the rest of the shot (only
// switch-offs, which read as lights going out; never a row of windows popping back on as they leave the band), with a
// ragged, noisy edge. Share the result with close-ups via wallDarkFrom() / wallCellState(). lod: those cells are left
// out of the batched grid while the layer is zoomed past `above` (draw them as WindowCloseup yourself, level of detail
// from the cell's screen size; at 'glass' they are pixel-identical to the grid pane, so the swap is invisible).

import React, {useId, useMemo} from 'react';
import {palette} from '../theme';
import {useTime} from '../time';
import {Seed} from '../rng';
import {line, Pt} from '../sketch';
import {ambient, atmos, TodLike, TodPalette, useTodPal} from './atmosphere';
import {darker} from './city';
import {Quad, quadMap} from './persp';
import {gridCells, lodScale, quadAt, ROOM_LOD, roomLook, roomMelt, roomShapes, SwitchEvent, switchTimes, WinCell, windowPaths, WindowLook} from './windows';
import {PathBuf} from './util';
import {exitScale, inkOn, isPaper, lookPaint, toScreen, useCineState, xfScale} from './state';
import type {Mat} from '../xf';
import {mat, useXf} from '../xf';
import {rand} from '../rng';

/** A receding wall whose horizontal lines converge on the vanishing point `vp` (on the horizon): the near edge is
 *  vertical at x = near[0] from y near[1] (top) to near[2] (bottom); the far edge is vertical at farX. */
export function wallQuadVP(o: {vp: Pt; near: [number, number, number]; farX: number}): Quad {
  const [vx, vy] = o.vp;
  const [nx, nt, nb] = o.near;
  const k = (o.farX - nx) / (vx - nx);
  return [
    [nx, nt],
    [o.farX, nt + (vy - nt) * k],
    [o.farX, nb + (vy - nb) * k],
    [nx, nb],
  ];
}

export type WallSpec = {quad: Quad; rows: number; cols: number; fw?: number; fh?: number; seed?: Seed; exclude?: [number, number][]; events?: SwitchEvent[]; initial?: number};

type WallTimes = {all: WinCell[]; index: Map<string, number>; cells: WinCell[]; times: Float64Array[]};
const WALL_TIMES = new Map<string, WallTimes>();

function wallTimes(o: WallSpec): WallTimes {
  const key = JSON.stringify([o.quad, o.rows, o.cols, o.fw, o.fh, o.seed, o.exclude, o.events]);
  let v = WALL_TIMES.get(key);
  if (!v) {
    const ex = new Set((o.exclude ?? []).map(([r, c]) => `${r},${c}`));
    const all = gridCells({rows: o.rows, cols: o.cols, fw: o.fw ?? WALL_FW, fh: o.fh ?? WALL_FH, jitter: 0}, o.seed ?? 'wall', o.quad);
    const index = new Map<string, number>();
    const cells: WinCell[] = [];
    all.forEach((c, i) => {
      const k = `${Math.floor(i / o.cols)},${i % o.cols}`;
      if (ex.has(k)) return;
      index.set(k, cells.length);
      cells.push(c);
    });
    v = {all, index, cells, times: switchTimes(cells, o.events ?? [], `${o.seed ?? 'wall'}/sw`)};
    if (WALL_TIMES.size > 16) WALL_TIMES.clear();
    WALL_TIMES.set(key, v);
  }
  return v;
}

export type KeepDark = {
  /** Static screen band (old API): cells whose screen quad overlaps y0..y1 (x0..x1) are dark. */
  y0?: number;
  y1?: number;
  x0?: number;
  x1?: number;
  /** Screen boxes [x0, y0, x1, y1] to keep dark at time t (e.g. the caption lines' ink boxes): replaces the band. */
  boxes?: (t: number) => [number, number, number, number][];
  /** HYSTERESIS: the layer -> screen matrix over (local) time, e.g. camPath(keys, 0, {handheld, seed}), and the time
   *  span to sample. A cell that has touched a box at any sampled time <= t stays dark. */
  path?: (t: number) => Mat;
  span?: [number, number];
  /** Sampling step (s). Default 1 / 30. */
  step?: number;
  /** Boxes grow by pad + ragged * noise(cell) px (a ragged edge, not a ruler line). Default 20 / 26. */
  pad?: number;
  ragged?: number;
  /** With a `path`: 'static' (default) decides membership ONCE for the shot: every cell that touches a box at ANY
   *  sampled time is dark for the whole shot, so nothing switches off as the camera carries cells into the caption
   *  boxes (the old sweep traced a moving scan line of switch-offs along the box edge). 'sweep' = the old hysteresis:
   *  a cell goes dark the first time it touches a box and stays dark. */
  mode?: 'static' | 'sweep';
  /** Thin ink (floor bands, piers) is cut out of the caption boxes, grown by this many px. Default 14. */
  inkPad?: number;
};

const DARK_CACHE = new WeakMap<object, Map<string, Float64Array>>();

/** For every grid cell (row-major, excluded ones included): the time it is first forced dark by `keepDark` (Infinity =
 *  never). Needs keepDark.path; memoised per path function (define it once, at module level). */
export function wallDarkFrom(o: WallSpec, k: KeepDark): Float64Array | null {
  if (!k.path) return null;
  const key = JSON.stringify([o.quad, o.rows, o.cols, o.fw, o.fh, o.seed, k.y0, k.y1, k.x0, k.x1, k.span, k.step, k.pad, k.ragged, !!k.boxes, k.mode ?? 'static']);
  let m = DARK_CACHE.get(k.path);
  if (!m) DARK_CACHE.set(k.path, (m = new Map()));
  let out = m.get(key);
  if (out) return out;
  const {all} = wallTimes(o);
  out = new Float64Array(all.length).fill(Infinity);
  const [t0, t1] = k.span ?? [0, 10];
  const step = k.step ?? 1 / 30;
  const pad = k.pad ?? 20;
  const rag = k.ragged ?? 26;
  const noise = all.map((_, i) => pad + rag * rand(o.seed ?? 'wall', `kd${i}`));
  for (let t = t0; t <= t1 + 1e-6; t += step) {
    const boxes = k.boxes ? k.boxes(t) : [[k.x0 ?? -1e9, k.y0 ?? 0, k.x1 ?? 1e9, k.y1 ?? 0] as [number, number, number, number]];
    if (!boxes.length) continue;
    const M = k.path(t);
    for (let i = 0; i < all.length; i++) {
      if (out[i] !== Infinity) continue;
      const q = all[i].quad!;
      const a = toScreen(M, q[0]);
      const c = toScreen(M, q[2]);
      const n = noise[i];
      const xmin = Math.min(a[0], c[0]) - n;
      const xmax = Math.max(a[0], c[0]) + n;
      const ymin = Math.min(a[1], c[1]) - n;
      const ymax = Math.max(a[1], c[1]) + n;
      for (const [bx0, by0, bx1, by1] of boxes) {
        if (xmax >= bx0 && xmin <= bx1 && ymax >= by0 && ymin <= by1) {
          out[i] = t;
          break;
        }
      }
    }
  }
  // static membership: a cell that is EVER under a box is dark for the whole shot (no switch-off crossing the box edge)
  if ((k.mode ?? 'static') === 'static') for (let i = 0; i < out.length; i++) if (out[i] !== Infinity) out[i] = -Infinity;
  if (m.size > 8) m.clear();
  m.set(key, out);
  return out;
}

/** true while a cell with this glass width on screen (px) and LOD jitter needs a CLOSE-UP (it shows more than the
 *  grid's room level: a lamp, a desk, a person); below it the grid pane is the same picture. */
export const wallLodDetailed = (screenW: number, jitter: number, from: number = ROOM_LOD.lamp) => screenW / lodScale(jitter) >= from;

/** Per-cell LOD jitter (0..1) of a WallOfWindows cell: pass it to the close-up drawn over that cell (`lodJitter`). */
export const wallCellJitter = (o: WallSpec, row: number, col: number) => rand(o.seed ?? 'wall', `lod${row * o.cols + col}`);

/** The colours of a window's room-level shapes (shared by the grid and WindowCloseup): floor band, curtain, transom. */
export function roomColors(on: boolean, litC: string, darkC: string, p: TodPalette): {floor: string; curtain: string; transom: string} {
  if (on) return {floor: ROOM_DARKER[litC] ?? darker(litC), curtain: palette.sand, transom: palette.cream};
  const td = ambient(palette.tealDark, p);
  const cur = darkC === td || darkC === palette.tealDark ? palette.teal : td;
  return {floor: darker(darkC), curtain: cur, transom: cur};
}
const ROOM_DARKER: Record<string, string> = {[palette.peach]: palette.tan, [palette.cream]: palette.sand, [palette.white]: palette.mintPale};

/** Everything a WindowCloseup drawn over grid cell (row, col) needs to match the grid exactly (state, colours, room
 *  seed, LOD jitter and its glass width on screen through `m`, the layer -> screen matrix). Spread it into the close-up;
 *  pass `screenW: 0` under caption words (flat glass). */
export function wallCloseupProps(o: WallSpec, row: number, col: number, t: number, m: Mat, look: {lit: string[]; dark: string}, extra: {darkFrom?: Float64Array | null; override?: (row: number, col: number, t: number, on: boolean) => boolean} = {}) {
  const st = wallCellState(o, row, col, t, extra);
  const q = windowQuad(o.quad, o.rows, o.cols, row, col, o.fw ?? WALL_FW, o.fh ?? WALL_FH);
  const a = toScreen(m, q[0]);
  const b = toScreen(m, q[1]);
  const litColor = look.lit[Math.min(look.lit.length - 1, Math.floor(st.k3 * look.lit.length))];
  return {on: st.on, lit: st.on, litColor, darkColor: look.dark, seed: `${o.seed ?? 'wall'}/${row},${col}`, lodJitter: wallCellJitter(o, row, col), screenW: Math.hypot(b[0] - a[0], b[1] - a[1]), quad: q};
}

/** Trim a path of `M x yQ cx cy x y` pen strokes (sketch line() output) to its first fraction g of length. */
function trimStrokes(d: string, g: number): string {
  if (g >= 1) return d;
  if (g <= 0) return '';
  const segs = d.split('M').filter(Boolean).map((p) => p.match(/-?[\d.]+(?:e-?\d+)?/g)!.map(Number));
  const lens = segs.map((n) => Math.hypot(n[2] - n[0], n[3] - n[1]) + Math.hypot(n[4] - n[2], n[5] - n[3]));
  let left = g * lens.reduce((a, b) => a + b, 0);
  let out = '';
  for (let i = 0; i < segs.length; i++) {
    const [x0, y0, cx, cy, x1, y1] = segs[i];
    if (left >= lens[i]) {
      out += `M${x0} ${y0}Q${cx} ${cy} ${x1} ${y1}`;
      left -= lens[i];
      continue;
    }
    const u = Math.max(0, left / (lens[i] || 1));
    if (u > 0.01) {
      // de Casteljau: the first part [0, u] of the quadratic
      const ax = x0 + (cx - x0) * u;
      const ay = y0 + (cy - y0) * u;
      const bx = cx + (x1 - cx) * u;
      const by = cy + (y1 - cy) * u;
      out += `M${x0} ${y0}Q${r2(ax)} ${r2(ay)} ${r2(ax + (bx - ax) * u)} ${r2(ay + (by - ay) * u)}`;
    }
    break;
  }
  return out;
}
const r2 = (n: number) => Math.round(n * 100) / 100;

export type CellState = {on: boolean; since: number; k2: number; k3: number};

/** State of window (row, col) of a WallOfWindows with these props at time t, exactly as the wall draws it (same cells,
 *  seeds, switch order, keepDark darkFrom, override and one-frame flicker): lets a close-up drawn over a cell light up
 *  (and in the same lit colour: litColors[floor(k3 * n)]) exactly when the grid would. */
export function wallCellState(o: WallSpec, row: number, col: number, t: number, extra: {darkFrom?: Float64Array | null; override?: (row: number, col: number, t: number, on: boolean) => boolean; flicker?: number} = {}): CellState {
  const v = wallTimes(o);
  const gi = row * o.cols + col;
  const c = v.all[gi];
  const i = v.index.get(`${row},${col}`);
  let on = c.k < (o.initial ?? 0);
  let since = -1e9;
  if (i !== undefined) {
    (o.events ?? []).forEach((ev, e) => {
      const sw = v.times[e][i];
      if (sw === sw && t >= sw && sw >= since) {
        on = ev.to === 'on';
        since = sw;
      }
    });
  }
  if (on && extra.darkFrom && extra.darkFrom[gi] <= t) on = false;
  if (extra.override) on = extra.override(row, col, t, on);
  const dt = t - since;
  if (on && c.k2 < (extra.flicker ?? 0.25) && dt > 0.035 && dt < 0.085) on = false;
  return {on, since, k2: c.k2, k3: c.k3};
}

/** Is window (row, col) lit at time t (see wallCellState)? */
export function wallCellOn(o: WallSpec, row: number, col: number, t: number): boolean {
  return wallCellState(o, row, col, t).on;
}

/** Uniform screen scale of the current layer (1 = rest). */
export const useLayerZoom = () => xfScale(useXf());

export const WALL_FW = 0.56;
export const WALL_FH = 0.6;

/** Screen quad of window (row, col) of a WallOfWindows grid (same layout rule as gridCells without jitter). */
export function windowQuad(quad: Quad, rows: number, cols: number, row: number, col: number, fw = WALL_FW, fh = WALL_FH): Quad {
  const m = quadMap(quad);
  const u0 = (col + (1 - fw) / 2) / cols;
  const u1 = (col + (1 + fw) / 2) / cols;
  const v0 = (row + (1 - fh) * 0.42) / rows;
  const v1 = v0 + fh / rows;
  return [m(u0, v0), m(u1, v0), m(u1, v1), m(u0, v1)];
}

export type WallOfWindowsProps = WindowLook & {
  quad: Quad;
  rows: number;
  cols: number;
  tod?: TodLike | TodPalette;
  wall?: string;
  events?: SwitchEvent[];
  seed?: Seed;
  /** Cells left out of the window layer (e.g. the hero window drawn separately): [row, col][]. */
  exclude?: [number, number][];
  /** Ink floor bands every n rows and piers every n cols (0 = none). Fades with the quad's far side. */
  bandEvery?: number;
  pierEvery?: number;
  inkW?: number;
  /** Atmospheric depth of the far edge (u = 1) — the far half of the wall is tinted one step. */
  farDepth?: number;
  fw?: number;
  fh?: number;
  /** Path precision (decimals). Use 2-3 when a camera zooms 10x+ into the wall. Default 2. */
  precision?: number;
  /** Caption-safe darkness (see KeepDark): a static screen band, or caption ink boxes with hysteresis along a camera
   *  path. */
  keepDark?: KeepDark;
  /** Level of detail: these cells are left to WindowCloseups. Per cell (default): a cell is skipped while its glass is
   *  at least `detailFrom` px wide on screen (default ROOM_LOD.lamp, jittered by wallCellJitter): below that a close-up
   *  would draw exactly what the grid draws (same room shapes / colours), so the swap is invisible. Draw the close-ups
   *  where wallLodDetailed() is true. `above` (old API): skip them all while the layer zoom is above it. */
  lod?: {cells: [number, number][]; above?: number; detailFrom?: number};
  /** Final say on a cell's state, e.g. a hero window lit until its own off time: (row, col, t, on) => on. */
  override?: (row: number, col: number, t: number, on: boolean) => boolean;
  /** Floor bands DRAW ON (each from its near end, staggered like pen strokes, ~0.15 s each over a ~0.4 s window at a
   *  typical pull-back) as the layer's zoom falls through ~1.13x .. 0.93x this value, and retract the same way on a
   *  push-in (their free ends would crawl over the grid in a deep zoom). Default 3. */
  bandsBelow?: number;
  /** Room-level detail on big grid panes (curtain, floor band, transom: the same shapes and sizes WindowCloseup melts
   *  through), so a close-up and the grid pane beside it match at any size. Default true. */
  rooms?: boolean;
};

export const WallOfWindows: React.FC<WallOfWindowsProps> = ({quad, rows, cols, tod, wall, events = [], seed = 'wall', exclude = [], bandEvery = 4, pierEvery = 6, inkW = 1.6, farDepth = 0.5, fw = WALL_FW, fh = WALL_FH, precision = 2, keepDark, lod, override, bandsBelow = 3, rooms = true, ...look}) => {
  const S = useCineState();
  const clipId = 'wk' + useId().replace(/[^a-zA-Z0-9]/g, '');
  const t = S.t;
  const p = useTodPal(tod);
  const ex = new Set(exclude.map(([r, c]) => `${r},${c}`));
  const {cells, rc} = useMemo(() => {
    const all = gridCells({rows, cols, fw, fh, jitter: 0}, seed, quad);
    // gridCells walks row-major without skips here, so index -> (row, col)
    const keepI = all.map((_, i) => i).filter((i) => !ex.has(`${Math.floor(i / cols)},${i % cols}`));
    return {cells: keepI.map((i) => all[i]), rc: keepI.map((i) => [Math.floor(i / cols), i % cols] as [number, number])};
  }, [JSON.stringify(quad), rows, cols, seed, fw, fh, exclude.join('|')]);
  const lodSet = useMemo(() => {
    if (!lod) return null;
    const want = new Set(lod.cells.map(([r, c]) => `${r},${c}`));
    const out = new Uint8Array(cells.length);
    rc.forEach(([r, c], i) => (out[i] = want.has(`${r},${c}`) ? 1 : 0));
    return out;
  }, [rc, lod?.cells.map((x) => x.join(',')).join('|')]);
  const times = useMemo(() => switchTimes(cells, events, `${seed}/sw`), [cells, JSON.stringify(events), seed]);
  const geo = useMemo(() => {
    const m = quadMap(quad);
    const ink = new PathBuf(precision);
    const bands: {d: string; o: number}[] = [];
    const shade = new PathBuf(precision);
    const far = new PathBuf(precision);
    // far half of the wall, one haze step lighter (stepped atmospheric perspective)
    far.quad(m(0.55, 0), m(1, 0), m(1, 1), m(0.55, 1));
    if (bandEvery > 0) {
      // each band ends ON a pier line (a fixed place in the grid), with a small overshoot past it
      const lastPier = pierEvery > 0 ? Math.max(pierEvery, Math.floor((cols * 0.45) / pierEvery) * pierEvery) : Math.round(cols * 0.45);
      const uEnd = (lastPier + 0.12) / cols;
      for (let r = bandEvery; r < rows; r += bandEvery) {
        const v = r / rows;
        const a: Pt = m(0, v);
        const b: Pt = m(uEnd, v);
        // each band is drawn on from its NEAR end (pen order: a random stagger per band) when the zoom falls past bandsBelow
        bands.push({d: new PathBuf(precision).raw(line(a[0], a[1], b[0], b[1], {seed: `${seed}/b${r}`, over: [10, 0], breaks: true})).d, o: rand(seed, `bo${r}`)});
      }
    }
    if (pierEvery > 0) {
      for (let c = pierEvery; c < cols * 0.5; c += pierEvery) {
        const u = c / cols;
        const a = m(u, 0);
        const b = m(u, 1);
        ink.raw(line(a[0], a[1], b[0], b[1], {seed: `${seed}/p${c}`, over: [0, 0]}));
        // a flat pier shade strip right of the line
        const u2 = (c + 0.18) / cols;
        shade.quad(m(u, 0), m(u2, 0), m(u2, 1), m(u, 1));
      }
    }
    return {ink: ink.d, bands, shade: shade.d, far: far.d, outline: new PathBuf(precision).quad(...quad).d};
  }, [JSON.stringify(quad), rows, cols, bandEvery, pierEvery, seed, precision]);
  const zoom = xfScale(S.m);
  const glassW = (i: number) => {
    const q = cells[i].quad!;
    const a = toScreen(S.m, q[0]);
    const b = toScreen(S.m, q[1]);
    return Math.hypot(b[0] - a[0], b[1] - a[1]);
  };
  const skipLod = !lodSet
    ? undefined
    : lod!.above !== undefined
      ? zoom > lod!.above
        ? (i: number) => lodSet[i] === 0
        : undefined
      : (i: number) => lodSet[i] === 0 || !wallLodDetailed(glassW(i), rand(seed, `lod${rc[i][0] * cols + rc[i][1]}`), lod!.detailFrom);
  const spec: WallSpec = {quad, rows, cols, fw, fh, seed, exclude, events};
  const darkFrom = keepDark?.path ? wallDarkFrom(spec, keepDark) : null;
  const darkBand = darkFrom ? (i: number) => darkFrom[rc[i][0] * cols + rc[i][1]] <= t : keepDark ? bandTest(S.m, cells, keepDark, t) : undefined;
  const switchOff = S.e > 0.05; // un-build: every window switches off at once
  const ov = override ? (i: number, on: boolean) => override(rc[i][0], rc[i][1], t, on) : undefined;
  const lit = look.lit ?? p.windowLit;
  const darkPane = look.dark ?? p.windowDark;
  // room-level LOD on big panes (the shapes WindowCloseup melts through at the same glass width): batched per colour
  const roomBufs = new Map<string, PathBuf>();
  const roomAdd = (c: string) => {
    let b = roomBufs.get(c);
    if (!b) roomBufs.set(c, (b = new PathBuf(precision)));
    return b;
  };
  const each =
    rooms && S.look.fills === 'color'
      ? (i: number, on: boolean, ci: number, q: Quad, forced: boolean) => {
          if (forced) return; // under the caption words: flat glass only
          const a = toScreen(S.m, q[0]);
          const b = toScreen(S.m, q[1]);
          const [r, c] = rc[i];
          const Wg = Math.hypot(b[0] - a[0], b[1] - a[1]) / lodScale(rand(seed, `lod${r * cols + c}`));
          if (Wg < ROOM_LOD.glass) return;
          const lk = roomLook(`${seed}/${r},${c}`, on);
          const sh = roomShapes(lk.curtainW, lk.curtainRight, roomMelt(Wg, ROOM_LOD.curtain), roomMelt(Wg, ROOM_LOD.floor));
          const col = roomColors(on, lit[ci % lit.length], darkPane, p);
          if (sh.floor !== null) roomAdd(col.floor).quad(quadAt(q, 0, sh.floor), quadAt(q, 1, sh.floor), q[2], q[3]);
          if (sh.curtain) roomAdd(col.curtain).poly(sh.curtain.map(([u, v]) => quadAt(q, u, v)));
          if (sh.transom) roomAdd(col.transom).quad(quadAt(q, 0, sh.transom[0]), quadAt(q, 1, sh.transom[0]), quadAt(q, 1, sh.transom[1]), quadAt(q, 0, sh.transom[1]));
        }
      : undefined;
  const W = windowPaths(cells, events, times, t, {lit: p.windowLit, dark: p.windowDark, ...look}, precision, {keep: skipLod, dark: switchOff ? () => true : darkBand, override: switchOff ? undefined : ov, each: switchOff ? undefined : each});
  const wallC = wall ?? ambient(palette.teal, p);
  // thin ink (floor bands, piers) never runs through the caption words: cut the padded caption boxes out of it
  const capBoxes = keepDark?.boxes ? keepDark.boxes(t) : [];
  let inkClip: string | null = null;
  if (capBoxes.length) {
    const inv = mat.inv(S.m);
    const ip = keepDark?.inkPad ?? 14;
    const poly = (x0: number, y0: number, x1: number, y1: number) => new PathBuf(2).poly([toScreen(inv, [x0, y0]), toScreen(inv, [x1, y0]), toScreen(inv, [x1, y1]), toScreen(inv, [x0, y1])]).d;
    inkClip = poly(-400, -400, 1480, 2320) + capBoxes.map(([x0, y0, x1, y1]) => poly(x0 - ip, y0 - ip, x1 + ip, y1 + ip)).join('');
  }
  // floor bands draw on from their near ends as the zoom falls past bandsBelow (staggered), never all in one frame
  const lz = Math.log(Math.max(1e-6, zoom));
  const hiZ = Math.log(bandsBelow * 1.13);
  const loZ = Math.log(bandsBelow * 0.93);
  const bandD = geo.bands
    .map((b) => {
      const start = hiZ - b.o * (hiZ - loZ) * 0.6;
      const g = Math.max(0, Math.min(1, (start - lz) / ((hiZ - loZ) * 0.4)));
      return trimStrokes(b.d, g);
    })
    .join('');
  // the wall is a slab-sized piece: it collapses toward its base edge late in an un-build
  const size = Math.min(1, xfScale(S.m) * 0.9);
  const k = exitScale(S.e, 0.4, size);
  if (k <= 0) return null;
  const mid: Pt = [(quad[0][0] + quad[2][0]) / 2, (quad[0][1] + quad[2][1]) / 2];
  const paper = isPaper(S, mid);
  const wallPaint = lookPaint(S, wallC, mid);
  const color = !paper && S.look.fills === 'color';
  const body = (
    <>
      {wallPaint !== 'none' ? <path d={geo.outline} fill={wallPaint} /> : null}
      {color ? <path d={geo.far} fill={atmos(wallC, farDepth, p, {raw: true, clear: 0})} /> : null}
      {color && geo.shade ? <path d={geo.shade} fill={darker(palette.teal) === wallC ? atmos(palette.tealDark, 0, p) : ambient(darker(palette.teal), p)} /> : null}
      {color && W.dark ? <path d={W.dark} fill={darkPane} /> : null}
      {color ? W.lit.map((d, i) => (d ? <path key={i} d={d} fill={lit[i % lit.length]} /> : null)) : null}
      {color ? [...roomBufs.entries()].map(([c, b]) => <path key={`rm${c}`} d={b.d} fill={c} />) : null}
      {color && W.blinds ? <path d={W.blinds} fill={ambient(look.blindColor ?? palette.tan, p)} /> : null}
      {inkClip ? (
        <defs>
          <clipPath id={clipId} clipPathUnits="userSpaceOnUse">
            <path d={inkClip} clipRule="evenodd" />
          </clipPath>
        </defs>
      ) : null}
      <g clipPath={inkClip ? `url(#${clipId})` : undefined}>
        {inkW > 0 && geo.ink && inkOn(S, 0.4) ? <path d={geo.ink} fill="none" stroke={palette.ink} strokeWidth={inkW} strokeLinecap="round" /> : null}
        {inkW > 0 && bandD && inkOn(S, 0.4) ? <path d={bandD} fill="none" stroke={palette.ink} strokeWidth={inkW} strokeLinecap="round" /> : null}
      </g>
      {paper && inkOn(S) ? <path d={geo.outline} fill="none" stroke={palette.ink} strokeWidth={inkW || 1.6} /> : null}
    </>
  );
  if (k >= 1) return body;
  const by = Math.max(quad[2][1], quad[3][1]);
  return <g transform={`translate(0 ${by}) scale(1 ${k.toFixed(4)}) translate(0 ${-by})`}>{body}</g>;
};

/** Cells whose screen quad overlaps a screen band / the boxes (this frame only: no hysteresis). */
function bandTest(m: Mat, cells: {quad?: Quad}[], b: KeepDark, t: number) {
  const boxes = b.boxes ? b.boxes(t) : [[b.x0 ?? -1e9, b.y0 ?? 0, b.x1 ?? 1e9, b.y1 ?? 0] as [number, number, number, number]];
  const pad = b.boxes ? b.pad ?? 20 : 0;
  return (i: number) => {
    const q = cells[i].quad;
    if (!q) return false;
    const a = toScreen(m, q[0]);
    const c = toScreen(m, q[2]);
    const ymin = Math.min(a[1], c[1]) - pad;
    const ymax = Math.max(a[1], c[1]) + pad;
    const xmin = Math.min(a[0], c[0]) - pad;
    const xmax = Math.max(a[0], c[0]) + pad;
    return boxes.some(([x0, y0, x1, y1]) => ymax >= y0 && ymin <= y1 && xmax >= x0 && xmin <= x1);
  };
}
