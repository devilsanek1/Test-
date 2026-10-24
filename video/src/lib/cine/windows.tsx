// cine/windows.tsx — LitWindows: grids of windows that switch on / off in staggered patterns, BATCHED into a few
// paths (dark panes, lit panes per colour, blinds), so thousands of windows cost a handful of SVG elements.
// Switching is a pop (tiny scale overshoot + optional one-frame flicker), never a fade.
//
//   <LitWindows grid={{x: 100, y: 300, w: 400, h: 900, rows: 30, cols: 12}} initial={0}
//     events={[{at: 1, dur: 3, to: 'on', pattern: 'random'}]} />
//   <LitWindows quad={[[0, 0], [600, 300], [600, 1500], [0, 1900]]} grid={{rows: 60, cols: 25}} initial={1}
//     events={[{at: 2, dur: 2.5, to: 'off', pattern: 'wave', origin: [0.9, 0.2]}]} />     // perspective facade
//
// Patterns (order in which windows switch inside [at, at + dur]): 'random' | 'rows' (bottom -> top) | 'cols'
// (left -> right) | 'sweep' (along `dir` degrees in u/v space) | 'wave' (expanding from `origin` u/v) |
// 'collapse' (toward `origin`). `noise` (0..1) mixes randomness into the order; `fraction` affects only part.
// Use windowPaths() directly to batch windows of many buildings into one row (EndlessCity does).

import React, {useMemo} from 'react';
import {palette} from '../theme';
import {useTime} from '../time';
import {rand, rng, Seed} from '../rng';
import type {Pt} from '../sketch';
import {Quad, quadMap} from './persp';
import {PathBuf} from './util';
import {inkOn, useCineState} from './state';

export type SwitchPattern = 'random' | 'rows' | 'cols' | 'sweep' | 'wave' | 'collapse';

export type SwitchEvent = {
  at: number;
  dur: number;
  to: 'on' | 'off';
  pattern?: SwitchPattern;
  /** u/v origin for wave / collapse (0..1). Default centre. */
  origin?: [number, number];
  /** Sweep direction in degrees (0 = +u, 90 = +v). */
  dir?: number;
  /** Share of windows this event touches (0..1). Default 1. */
  fraction?: number;
  /** Randomness mixed into the order (0..1). Default 0.25 (random pattern ignores it). */
  noise?: number;
};

/** One window: u/v = position in its grid / facade (0..1, used by patterns); shape = rect [x, y, w, h] or quad. */
export type WinCell = {u: number; v: number; rect?: [number, number, number, number]; quad?: Quad; k: number; k2: number; k3: number};

export type WindowLook = {
  lit?: string[];
  dark?: string;
  /** Fraction of lit windows with a blind pulled over the top part. */
  blinds?: number;
  blindColor?: string;
  /** Pop scale on switch-on (0 = none). Default 0.35. */
  pop?: number;
  /** Fraction of windows that flicker once when they switch on. Default 0.25. */
  flicker?: number;
  /** Fraction initially on (0..1). Default 0. */
  initial?: number;
  /** Don't draw dark panes (they are part of the wall colour). */
  noDark?: boolean;
};

const POP = 0.16;

/** Switch times per event for every cell (NaN = not affected). */
export function switchTimes(cells: WinCell[], events: SwitchEvent[], seed: Seed): Float64Array[] {
  return events.map((ev, ei) => {
    const out = new Float64Array(cells.length);
    const pat = ev.pattern ?? 'random';
    const noise = pat === 'random' ? 1 : ev.noise ?? 0.25;
    const [ou, ov] = ev.origin ?? [0.5, 0.5];
    const dir = ((ev.dir ?? 0) * Math.PI) / 180;
    const cd = Math.cos(dir);
    const sd = Math.sin(dir);
    // normalise sweep / wave distances
    let maxD = 1e-6;
    let minS = Infinity;
    let maxS = -Infinity;
    for (const c of cells) {
      maxD = Math.max(maxD, Math.hypot(c.u - ou, c.v - ov));
      const s = c.u * cd + c.v * sd;
      minS = Math.min(minS, s);
      maxS = Math.max(maxS, s);
    }
    const frac = ev.fraction ?? 1;
    for (let i = 0; i < cells.length; i++) {
      const c = cells[i];
      if (frac < 1 && rand(seed, `f${ei}/${i}`) > frac) {
        out[i] = NaN;
        continue;
      }
      let base: number;
      switch (pat) {
        case 'rows':
          base = 1 - c.v;
          break;
        case 'cols':
          base = c.u;
          break;
        case 'sweep':
          base = (c.u * cd + c.v * sd - minS) / Math.max(1e-6, maxS - minS);
          break;
        case 'wave':
          base = Math.hypot(c.u - ou, c.v - ov) / maxD;
          break;
        case 'collapse':
          base = 1 - Math.hypot(c.u - ou, c.v - ov) / maxD;
          break;
        default:
          base = 0;
      }
      const r = rand(seed, `o${ei}/${i}`);
      const o = (1 - noise) * base + noise * r;
      out[i] = ev.at + ev.dur * Math.max(0, Math.min(1, o));
    }
    return out;
  });
}

function scaleQuad(q: Quad, s: number): Quad {
  const cx = (q[0][0] + q[1][0] + q[2][0] + q[3][0]) / 4;
  const cy = (q[0][1] + q[1][1] + q[2][1] + q[3][1]) / 4;
  return q.map(([x, y]) => [cx + (x - cx) * s, cy + (y - cy) * s] as Pt) as Quad;
}

export type WindowPaths = {dark: string; lit: string[]; blinds: string};

export type WindowFilter = {
  /** Draw cell i at all (e.g. only the windows of buildings that have finished building, or not the LOD cells). */
  keep?: (i: number) => boolean;
  /** Force cell i dark this frame (e.g. a caption-safe band, or windows switched off by an un-build). */
  dark?: (i: number) => boolean;
  /** Final say on cell i's state (after the events and `dark`): e.g. a hero window lit until its own off time. */
  override?: (i: number, on: boolean) => boolean;
};

/** Build batched paths for the windows at time t. `times` from switchTimes(). */
export function windowPaths(cells: WinCell[], events: SwitchEvent[], times: Float64Array[], t: number, look: WindowLook = {}, precision = 1, filter: WindowFilter = {}): WindowPaths {
  const litCols = look.lit ?? [palette.peach, palette.cream];
  const initial = look.initial ?? 0;
  const popK = look.pop ?? 0.35;
  const flick = look.flicker ?? 0.25;
  const blinds = look.blinds ?? 0;
  const dark = new PathBuf(precision);
  const lit = litCols.map(() => new PathBuf(precision));
  const bl = new PathBuf(precision);
  const nE = events.length;
  const keep = filter.keep;
  const force = filter.dark;
  for (let i = 0; i < cells.length; i++) {
    const c = cells[i];
    if (keep && !keep(i)) continue;
    let on = c.k < initial;
    let since = -1e9;
    for (let e = 0; e < nE; e++) {
      const sw = times[e][i];
      if (sw === sw && t >= sw) {
        // events are applied in array order; later switches win
        if (sw >= since) {
          on = events[e].to === 'on';
          since = sw;
        }
      }
    }
    if (on && force && force(i)) on = false;
    if (filter.override) on = filter.override(i, on);
    const dt = t - since;
    let s = 1;
    if (on && dt < POP && popK > 0) s = 1 + popK * Math.sin((Math.PI * dt) / POP);
    // one-frame-ish flicker right after switching on (deterministic per window)
    if (on && c.k2 < flick && dt > 0.035 && dt < 0.085) on = false;
    if (!on) {
      if (look.noDark) continue;
      if (c.rect) dark.rect(...c.rect);
      else if (c.quad) dark.quad(...c.quad);
      continue;
    }
    const ci = Math.min(litCols.length - 1, Math.floor(c.k3 * litCols.length));
    const pb = lit[ci];
    if (c.rect) {
      const [x, y, w, h] = c.rect;
      if (s !== 1) pb.rect(x + (w * (1 - s)) / 2, y + (h * (1 - s)) / 2, w * s, h * s);
      else pb.rect(x, y, w, h);
      if (c.k2 > 1 - blinds) bl.rect(x, y, w, h * (0.25 + 0.4 * c.k3));
    } else if (c.quad) {
      const q = s !== 1 ? scaleQuad(c.quad, s) : c.quad;
      pb.quad(...q);
      if (c.k2 > 1 - blinds) {
        const kk = 0.25 + 0.4 * c.k3;
        const [a, b, cc, d] = c.quad;
        bl.quad(a, b, [b[0] + (cc[0] - b[0]) * kk, b[1] + (cc[1] - b[1]) * kk], [a[0] + (d[0] - a[0]) * kk, a[1] + (d[1] - a[1]) * kk]);
      }
    }
  }
  return {dark: dark.d, lit: lit.map((p) => p.d), blinds: bl.d};
}

// ---------------------------------------------------------------- grid cells

export type GridSpec = {
  /** Rect for flat grids (ignored with a quad). */
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  rows: number;
  cols: number;
  /** Window size as a fraction of its cell. */
  fw?: number;
  fh?: number;
  /** Size jitter (fraction). */
  jitter?: number;
  /** Fraction of cells left blank (wall). */
  skip?: number;
  /** Group columns in bays: every `bay` columns leave one blank. */
  bay?: number;
};

/** Window cells for a grid, optionally mapped onto a perspective quad (homography: rows foreshorten). */
export function gridCells(g: GridSpec, seed: Seed, quad?: Quad): WinCell[] {
  const r = rng(`cells/${seed}`);
  const m = quad ? quadMap(quad) : null;
  const fw = g.fw ?? 0.55;
  const fh = g.fh ?? 0.6;
  const j = g.jitter ?? 0.06;
  const out: WinCell[] = [];
  for (let row = 0; row < g.rows; row++) {
    for (let col = 0; col < g.cols; col++) {
      const k = r.next();
      const k2 = r.next();
      const k3 = r.next();
      const jw = 1 + r.jitter(j);
      const jh = 1 + r.jitter(j);
      if (g.skip && r.next() < g.skip) continue;
      if (g.bay && (col + 1) % (g.bay + 1) === 0) continue;
      const u0 = (col + (1 - fw * jw) / 2) / g.cols;
      const u1 = (col + (1 + fw * jw) / 2) / g.cols;
      const v0 = (row + (1 - fh * jh) * 0.42) / g.rows;
      const v1 = v0 + (fh * jh) / g.rows;
      const u = (col + 0.5) / g.cols;
      const v = (row + 0.5) / g.rows;
      if (m) out.push({u, v, k, k2, k3, quad: [m(u0, v0), m(u1, v0), m(u1, v1), m(u0, v1)]});
      else {
        const x = g.x ?? 0;
        const y = g.y ?? 0;
        const w = g.w ?? 100;
        const h = g.h ?? 100;
        out.push({u, v, k, k2, k3, rect: [x + u0 * w, y + v0 * h, (u1 - u0) * w, (v1 - v0) * h]});
      }
    }
  }
  return out;
}

// ---------------------------------------------------------------- component

export type LitWindowsProps = WindowLook & {
  grid?: GridSpec;
  quad?: Quad;
  cells?: WinCell[];
  events?: SwitchEvent[];
  seed?: Seed;
  /** Fill misregistration offset (px). Default [1.2, 0.8]. */
  offset?: [number, number];
  /** Optional ink: bare brackets (top + left edge) on every window. */
  ink?: {color?: string; width?: number};
};

export const LitWindows: React.FC<LitWindowsProps> = ({grid, quad, cells: cellsIn, events = [], seed = 'lw', offset = [1.2, 0.8], ink, ...look}) => {
  const S = useCineState();
  const t = S.t;
  const cells = useMemo(() => cellsIn ?? (grid ? gridCells(grid, seed, quad) : []), [cellsIn, JSON.stringify(grid), JSON.stringify(quad), seed]);
  const times = useMemo(() => switchTimes(cells, events, seed), [cells, JSON.stringify(events), seed]);
  const inkD = useMemo(() => {
    if (!ink) return '';
    const pb = new PathBuf();
    for (const c of cells) {
      if (c.rect) {
        const [x, y, w, h] = c.rect;
        pb.raw(`M${(x + w + 1.5).toFixed(1)} ${y.toFixed(1)}H${(x - 1).toFixed(1)}V${(y + h + 1.5).toFixed(1)}`);
      } else if (c.quad) {
        const [a, b, , d] = c.quad;
        pb.raw(`M${b[0].toFixed(1)} ${b[1].toFixed(1)}L${a[0].toFixed(1)} ${a[1].toFixed(1)}L${d[0].toFixed(1)} ${d[1].toFixed(1)}`);
      }
    }
    return pb.d;
  }, [cells, !!ink]);
  // un-build: every window switches off at once (a 1-frame event), then the panes go with the fills
  const off = S.e > 0.05;
  const P = windowPaths(cells, events, times, t, look, 1, off ? {dark: () => true} : {});
  const lit = look.lit ?? [palette.peach, palette.cream];
  const tr = offset[0] || offset[1] ? `translate(${offset[0]} ${offset[1]})` : undefined;
  const color = S.look.fills === 'color' && S.e < 0.4;
  return (
    <>
      {color && P.dark ? <path d={P.dark} fill={look.dark ?? palette.tealDark} transform={tr} /> : null}
      {color ? P.lit.map((d, i) => (d ? <path key={i} d={d} fill={lit[i]} transform={tr} /> : null)) : null}
      {color && P.blinds ? <path d={P.blinds} fill={look.blindColor ?? palette.tan} transform={tr} /> : null}
      {inkD && inkOn(S) ? <path d={inkD} fill="none" stroke={ink?.color ?? palette.ink} strokeWidth={ink?.width ?? 1.6} strokeLinecap="round" strokeLinejoin="round" /> : null}
    </>
  );
};
