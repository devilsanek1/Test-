// cine/wall.tsx — WallOfWindows: a vast facade receding in perspective (a projective quad), thousands of windows
// batched into a few paths, floor bands and piers in thin ink near the camera, switch-on/off waves.
// windowQuad() gives the screen quad of any single window, so a detailed hero window can sit exactly on the grid.
//
//   const Q: Quad = [[-80, -400], [760, 620], [760, 1180], [-80, 2300]];      // TL, TR, BR, BL (near side left)
//   <WallOfWindows quad={Q} rows={80} cols={44} tod="night" initial={1}
//     events={[{at: 2, dur: 2.4, to: 'off', pattern: 'wave', origin: [0.95, 0.4], noise: 0.3}]} />
//   const hero = windowQuad(Q, 80, 44, 41, 3);                               // row 41, col 3

import React, {useMemo} from 'react';
import {palette} from '../theme';
import {useTime} from '../time';
import {Seed} from '../rng';
import {line, Pt} from '../sketch';
import {ambient, atmos, Tod, TodPalette, todPal} from './atmosphere';
import {darker} from './city';
import {Quad, quadMap} from './persp';
import {gridCells, SwitchEvent, switchTimes, windowPaths, WindowLook} from './windows';
import {PathBuf} from './util';

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
};

export const WallOfWindows: React.FC<WallOfWindowsProps> = ({quad, rows, cols, tod = 'night', wall, events = [], seed = 'wall', exclude = [], bandEvery = 4, pierEvery = 6, inkW = 1.6, farDepth = 0.5, fw = WALL_FW, fh = WALL_FH, precision = 2, ...look}) => {
  const t = useTime();
  const p = todPal(tod);
  const ex = new Set(exclude.map(([r, c]) => `${r},${c}`));
  const cells = useMemo(() => {
    const all = gridCells({rows, cols, fw, fh, jitter: 0}, seed, quad);
    // gridCells walks row-major without skips here, so index -> (row, col)
    return all.filter((_, i) => !ex.has(`${Math.floor(i / cols)},${i % cols}`));
  }, [JSON.stringify(quad), rows, cols, seed, fw, fh, exclude.join('|')]);
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
  const W = windowPaths(cells, events, times, t, {lit: p.windowLit, dark: p.windowDark, ...look}, precision);
  const wallC = wall ?? ambient(palette.teal, p);
  const lit = look.lit ?? p.windowLit;
  return (
    <>
      <path d={geo.outline} fill={wallC} />
      <path d={geo.far} fill={atmos(wallC, farDepth, p, {raw: true})} />
      {geo.shade ? <path d={geo.shade} fill={darker(palette.teal) === wallC ? atmos(palette.tealDark, 0, p) : ambient(darker(palette.teal), p)} /> : null}
      {W.dark ? <path d={W.dark} fill={look.dark ?? p.windowDark} /> : null}
      {W.lit.map((d, i) => (d ? <path key={i} d={d} fill={lit[i % lit.length]} /> : null))}
      {W.blinds ? <path d={W.blinds} fill={ambient(look.blindColor ?? palette.tan, p)} /> : null}
      {inkW > 0 && geo.ink ? <path d={geo.ink} fill="none" stroke={palette.ink} strokeWidth={inkW} strokeLinecap="round" /> : null}
    </>
  );
};
