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
// keepDark: windows whose SCREEN centre falls in the caption band stay dark (or switch off as the camera brings them
// in), so captions always sit on flat wall. lod: those cells are left out of the batched grid while the layer is
// zoomed past `above` (draw them as WindowCloseup yourself; useLayerZoom() tells you when).

import React, {useMemo} from 'react';
import {palette} from '../theme';
import {useTime} from '../time';
import {Seed} from '../rng';
import {line, Pt} from '../sketch';
import {ambient, atmos, Tod, TodPalette, todPal} from './atmosphere';
import {darker} from './city';
import {Quad, quadMap} from './persp';
import {gridCells, SwitchEvent, switchTimes, WinCell, windowPaths, WindowLook} from './windows';
import {PathBuf} from './util';
import {exitScale, inkOn, isPaper, lookPaint, toScreen, useCineState, xfScale} from './state';
import type {Mat} from '../xf';
import {useXf} from '../xf';

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

const WALL_TIMES = new Map<string, {index: Map<string, number>; cells: WinCell[]; times: Float64Array[]}>();

/** Is window (row, col) of a WallOfWindows with these props lit at time t (same cells, seeds and switch order as the
 *  wall itself)? Lets a close-up drawn over a cell light up exactly when the grid would. */
export function wallCellOn(o: WallSpec, row: number, col: number, t: number): boolean {
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
    v = {index, cells, times: switchTimes(cells, o.events ?? [], `${o.seed ?? 'wall'}/sw`)};
    if (WALL_TIMES.size > 16) WALL_TIMES.clear();
    WALL_TIMES.set(key, v);
  }
  const i = v.index.get(`${row},${col}`);
  if (i === undefined) return false;
  let on = v.cells[i].k < (o.initial ?? 0);
  let since = -1e9;
  (o.events ?? []).forEach((ev, e) => {
    const sw = v!.times[e][i];
    if (sw === sw && t >= sw && sw >= since) {
      on = ev.to === 'on';
      since = sw;
    }
  });
  return on;
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
  tod?: Tod | TodPalette;
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
  /** Caption-safe band (SCREEN y): windows whose screen centre is inside stay dark on every frame. */
  keepDark?: {y0: number; y1: number; x0?: number; x1?: number};
  /** Level of detail: these cells are skipped while the layer's screen scale is above `above` (draw closeups). */
  lod?: {cells: [number, number][]; above: number};
};

export const WallOfWindows: React.FC<WallOfWindowsProps> = ({quad, rows, cols, tod = 'night', wall, events = [], seed = 'wall', exclude = [], bandEvery = 4, pierEvery = 6, inkW = 1.6, farDepth = 0.5, fw = WALL_FW, fh = WALL_FH, precision = 2, keepDark, lod, ...look}) => {
  const S = useCineState();
  const t = S.t;
  const p = todPal(tod);
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
    const shade = new PathBuf(precision);
    const far = new PathBuf(precision);
    // far half of the wall, one haze step lighter (stepped atmospheric perspective)
    far.quad(m(0.55, 0), m(1, 0), m(1, 1), m(0.55, 1));
    if (bandEvery > 0) {
      for (let r = bandEvery; r < rows; r += bandEvery) {
        const v = r / rows;
        const a: Pt = m(0, v);
        const b: Pt = m(0.45, v);
        ink.raw(line(a[0], a[1], b[0], b[1], {seed: `${seed}/b${r}`, over: [10, 0], breaks: true}));
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
    return {ink: ink.d, shade: shade.d, far: far.d, outline: new PathBuf(precision).quad(...quad).d};
  }, [JSON.stringify(quad), rows, cols, bandEvery, pierEvery, seed, precision]);
  const zoom = xfScale(S.m);
  const skipLod = lodSet && zoom > lod!.above ? (i: number) => lodSet[i] === 0 : undefined;
  const darkBand = keepDark ? bandTest(S.m, cells, keepDark) : undefined;
  const switchOff = S.e > 0.05; // un-build: every window switches off at once
  const W = windowPaths(cells, events, times, t, {lit: p.windowLit, dark: p.windowDark, ...look}, precision, {keep: skipLod, dark: switchOff ? () => true : darkBand});
  const wallC = wall ?? ambient(palette.teal, p);
  const lit = look.lit ?? p.windowLit;
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
      {color && W.dark ? <path d={W.dark} fill={look.dark ?? p.windowDark} /> : null}
      {color ? W.lit.map((d, i) => (d ? <path key={i} d={d} fill={lit[i % lit.length]} /> : null)) : null}
      {color && W.blinds ? <path d={W.blinds} fill={ambient(look.blindColor ?? palette.tan, p)} /> : null}
      {inkW > 0 && geo.ink && inkOn(S, 0.4) ? <path d={geo.ink} fill="none" stroke={palette.ink} strokeWidth={inkW} strokeLinecap="round" /> : null}
      {paper && inkOn(S) ? <path d={geo.outline} fill="none" stroke={palette.ink} strokeWidth={inkW || 1.6} /> : null}
    </>
  );
  if (k >= 1) return body;
  const by = Math.max(quad[2][1], quad[3][1]);
  return <g transform={`translate(0 ${by}) scale(1 ${k.toFixed(4)}) translate(0 ${-by})`}>{body}</g>;
};

/** Cells whose screen quad overlaps a screen band. */
function bandTest(m: Mat, cells: {quad?: Quad}[], b: {y0: number; y1: number; x0?: number; x1?: number}) {
  const x0 = b.x0 ?? -1e9;
  const x1 = b.x1 ?? 1e9;
  return (i: number) => {
    const q = cells[i].quad;
    if (!q) return false;
    const a = toScreen(m, q[0]);
    const c = toScreen(m, q[2]);
    const ymin = Math.min(a[1], c[1]);
    const ymax = Math.max(a[1], c[1]);
    const xmin = Math.min(a[0], c[0]);
    const xmax = Math.max(a[0], c[0]);
    return ymax >= b.y0 && ymin <= b.y1 && xmax >= x0 && xmin <= x1;
  };
}
