// cine/city.tsx — EndlessCity / Skyline: procedural rows of buildings receding to the horizon, atmospheric tint per
// row (stepped), batched window grids that light up across the city, rim light on the sun side, ink only on the
// nearer rows (far rows are fill-only, like the reference). Each row is a handful of paths: fills per colour,
// shade strips, rim strips, windows (dark / lit), ink. Geometry is memoised by seed.
//
//   <EndlessCity horizon={1010} nearY={1560} rows={6} tod="dusk" seed="pilt"
//     windows={{initial: 0.2, events: [{at: 0.4, dur: 5, to: 'on', pattern: 'sweep', dir: 90, fraction: 0.7}]}} />
//   <Skyline base={1250} s={0.45} depth={0.5} tod="day" seed="row" />      // one frontal row
//   cityRows({horizon, nearY, rows, nearS, farS})                          // where each row sits (place props in rows)
//
// Rows are wrapped in <Layer depth> (parallax factor = row scale) unless layered={false}.

import React, {useMemo} from 'react';
import {palette} from '../theme';
import {ease as E, osc, prog, useTime} from '../time';
import {rng, Seed} from '../rng';
import {arc, line, Pt} from '../sketch';
import {Layer} from './camera';
import {atmos, deep, Tod, TodPalette, todPal} from './atmosphere';
import {HazeBand} from './sky';
import {SwitchEvent, switchTimes, WinCell, windowPaths, WindowLook} from './windows';
import {memoize, PathBuf, r1} from './util';

// ---------------------------------------------------------------- palette steps

/** The next darker flat step of a palette colour (style bible: cream -> sand -> clay; mintPale -> sage -> teal -> tealDark). */
export function darker(c: string): string {
  switch (c) {
    case palette.white:
      return palette.mintPale;
    case palette.cream:
      return palette.sand;
    case palette.sand:
      return palette.tan;
    case palette.tan:
      return palette.brown;
    case palette.mintPale:
      return palette.sage;
    case palette.sage:
      return palette.teal;
    case palette.teal:
      return palette.tealDark;
    case palette.tealDark:
      return deep.teal78;
    case palette.peach:
      return palette.tan;
    case palette.brown:
      return deep.teal60;
    default:
      return deep.teal60;
  }
}

// ---------------------------------------------------------------- geometry

type Kind = 'flat' | 'step' | 'gable' | 'dome' | 'spire' | 'tower';

type Bld = {
  x: number;
  w: number;
  h: number;
  kind: Kind;
  ci: number;
  roofCi: number;
  tiers: [number, number, number, number][]; // [x, y, w, h] body rects bottom -> top
  roof: Pt[] | null; // extra roof polygon (gable / dome / spire)
  extras: {water?: [number, number, number]; antenna?: [number, number, number]; chimney?: [number, number, number, number]};
  beacon?: Pt;
};

type RowGeo = {
  blds: Bld[];
  fillsByCi: Map<number, string>;
  roofsByCi: Map<number, string>;
  shadeByCi: Map<number, string>;
  rim: string;
  mass: string;
  ink: string;
  inkThin: string;
  cells: WinCell[];
  beacons: Pt[];
};

export type RowParams = {
  base: number;
  s: number;
  x0: number;
  x1: number;
  seed: Seed;
  /** Probability of a tall tower per building. */
  towers?: number;
  /** Ink width on screen (0 = fill-only). */
  ink?: number;
  /** Window cell scale multiplier (bigger = fewer windows). */
  cell?: number;
  /** Building height range (px at s = 1). */
  hRange?: [number, number];
  wRange?: [number, number];
  /** Number of facade colours available. */
  nColors?: number;
  /** Rim light side ('right' = sun on the right / behind). */
  rimSide?: 'left' | 'right' | 'none';
};

function rowGeo(p: RowParams): RowGeo {
  const key = JSON.stringify(p);
  return memoize(ROW_CACHE, key, () => buildRow(p), 64);
}
const ROW_CACHE = new Map<string, RowGeo>();

function buildRow(p: RowParams): RowGeo {
  const {base, s, x0, x1} = p;
  const r = rng(`row/${p.seed}`);
  const [h0, h1] = p.hRange ?? [230, 720];
  const [w0, w1] = p.wRange ?? [120, 270];
  const nC = p.nColors ?? 4;
  const blds: Bld[] = [];
  let x = x0 - r.range(0, w1 * s);
  while (x < x1) {
    const w = r.range(w0, w1) * s;
    const tower = r.chance(p.towers ?? 0.08);
    const kind: Kind = tower ? r.pick<Kind>(['tower', 'spire', 'step', 'dome']) : r.weighted<Kind>([['flat', 5], ['step', 1.4], ['gable', 1.6], ['dome', 0.5], ['spire', 0.3]]);
    let h = r.range(h0, h1) * s * (tower ? r.range(1.8, 2.8) : 1);
    if (kind === 'gable') h *= 0.75;
    const ci = r.int(0, nC - 1);
    const roofCi = r.int(0, nC - 1);
    const tiers: [number, number, number, number][] = [];
    const top = base - h;
    let roof: Pt[] | null = null;
    const ww = kind === 'tower' || kind === 'spire' ? w * 0.72 : w;
    const bx = x + (w - ww) / 2;
    if (kind === 'step') {
      const hA = h * r.range(0.55, 0.68);
      const hB = h * r.range(0.2, 0.28);
      tiers.push([bx, base - hA, ww, hA]);
      tiers.push([bx + ww * 0.14, base - hA - hB, ww * 0.72, hB]);
      tiers.push([bx + ww * 0.3, top, ww * 0.4, h - hA - hB]);
    } else tiers.push([bx, top, ww, h]);
    const T = tiers[tiers.length - 1];
    const tx = T[0];
    const tw = T[2];
    const ty = T[1];
    if (kind === 'gable') {
      const ph = tw * r.range(0.28, 0.42);
      roof = [
        [tx - 3 * s, ty],
        [tx + tw / 2, ty - ph],
        [tx + tw + 3 * s, ty],
      ];
    } else if (kind === 'dome') {
      const rx = tw * 0.4;
      const ry = tw * r.range(0.26, 0.36);
      const cx = tx + tw / 2;
      const pts: Pt[] = [];
      for (let i = 0; i <= 12; i++) {
        const a = Math.PI + (Math.PI * i) / 12;
        pts.push([cx + Math.cos(a) * rx, ty + Math.sin(a) * ry]);
      }
      // lantern + spike
      pts.splice(7, 0, [cx - rx * 0.12, ty - ry * 0.98], [cx - rx * 0.12, ty - ry * 1.25], [cx, ty - ry * 1.7], [cx + rx * 0.12, ty - ry * 1.25], [cx + rx * 0.12, ty - ry * 0.98]);
      roof = pts;
    } else if (kind === 'spire' || kind === 'tower') {
      const sh = tw * (kind === 'spire' ? r.range(1.2, 2.0) : r.range(0.25, 0.5));
      roof = kind === 'spire' ? [[tx, ty], [tx + tw / 2, ty - sh], [tx + tw, ty]] : [[tx + tw * 0.2, ty], [tx + tw * 0.2, ty - sh * 0.4], [tx + tw * 0.5, ty - sh], [tx + tw * 0.8, ty - sh * 0.4], [tx + tw * 0.8, ty]];
    }
    const extras: Bld['extras'] = {};
    if ((kind === 'flat' || kind === 'step') && r.chance(0.32)) {
      const ws = r.range(16, 24) * s;
      extras.water = [tx + r.range(0.15, 0.85) * (tw - ws), ty, ws];
    } else if (kind === 'flat' && r.chance(0.3)) extras.chimney = [tx + r.range(0.1, 0.8) * tw, ty, r.range(6, 12) * s, r.range(10, 26) * s];
    if (r.chance(kind === 'tower' || kind === 'step' ? 0.75 : 0.15)) extras.antenna = [tx + tw * r.range(0.3, 0.7), ty - (roof ? Math.max(0, ty - Math.min(...roof.map((q) => q[1]))) : 0), r.range(22, 60) * s];
    const beacon: Pt | undefined = tower || kind === 'spire' ? [extras.antenna ? extras.antenna[0] : tx + tw / 2, roof ? Math.min(...roof.map((q) => q[1])) - (extras.antenna ? extras.antenna[2] : 0) : ty] : undefined;
    blds.push({x, w, h, kind, ci, roofCi, tiers, roof, extras, beacon});
    x += w + r.range(-2, 14) * s;
  }

  // ---- batched fills
  const fills = new Map<number, PathBuf>();
  const roofs = new Map<number, PathBuf>();
  const shades = new Map<number, PathBuf>();
  const rim = new PathBuf();
  const ink = new PathBuf();
  const inkThin = new PathBuf();
  const cells: WinCell[] = [];
  const beacons: Pt[] = [];
  const get = (m: Map<number, PathBuf>, k: number) => {
    let v = m.get(k);
    if (!v) m.set(k, (v = new PathBuf()));
    return v;
  };
  const cellK = (p.cell ?? 1) * (s >= 0.4 ? 1 : Math.pow(0.4 / s, 0.7));
  const cw = 24 * s * cellK;
  const ch = 32 * s * cellK;
  const wr = rng(`rowwin/${p.seed}`);
  const inkW = p.ink ?? 0;
  for (const b of blds) {
    const F = get(fills, b.ci);
    const S = get(shades, b.ci);
    for (const [tx, ty, tw, th] of b.tiers) {
      F.rect(tx, ty, tw, th + 2);
      // shade plane on the left part of each tier (light from the right / behind)
      if (p.rimSide !== 'left') S.rect(tx, ty, tw * 0.18, th + 2);
      else S.rect(tx + tw * 0.82, ty, tw * 0.18, th + 2);
      if (p.rimSide !== 'none') rim.rect(p.rimSide === 'left' ? tx : tx + tw - Math.max(1.2, 5 * s), ty, Math.max(1.2, 5 * s), th);
      // windows
      const m = 9 * s * cellK;
      const cols = Math.floor((tw - 2 * m) / cw);
      const rows = Math.floor((th - m - ch * 0.8) / ch);
      if (cols >= 1 && rows >= 1 && wr.next() > 0.08) {
        const ox = tx + (tw - cols * cw) / 2;
        const tall = wr.chance(0.35);
        const fw = tall ? 0.4 : 0.55;
        const fh = tall ? 0.7 : 0.55;
        for (let ri = 0; ri < rows; ri++) {
          for (let c = 0; c < cols; c++) {
            const wx = ox + c * cw + (cw * (1 - fw)) / 2;
            const wy = ty + m + ri * ch;
            cells.push({u: wx / 1080, v: wy / 1920, k: wr.next(), k2: wr.next(), k3: wr.next(), rect: [wx, wy, cw * fw, ch * fh]});
          }
        }
      }
    }
    if (b.roof) get(roofs, b.roofCi).poly(b.roof);
    if (b.extras.water) {
      const [wx, wy, ws] = b.extras.water;
      const R = get(roofs, b.roofCi);
      R.rect(wx, wy - ws * 1.55, ws, ws * 0.9);
      R.poly([
        [wx - ws * 0.08, wy - ws * 1.55],
        [wx + ws / 2, wy - ws * 1.95],
        [wx + ws * 1.08, wy - ws * 1.55],
      ]);
      if (inkW) inkThin.raw(line(wx + ws * 0.15, wy, wx + ws * 0.15, wy - ws * 0.65, {over: [0, 1], seed: `wl${wx}`}) + line(wx + ws * 0.85, wy, wx + ws * 0.85, wy - ws * 0.65, {over: [0, 1], seed: `wr${wx}`}));
      else R.rect(wx + ws * 0.1, wy - ws * 0.68, ws * 0.8, ws * 0.12);
    }
    if (b.extras.chimney) {
      const [cx, cy, cwid, chh] = b.extras.chimney;
      F.rect(cx, cy - chh, cwid, chh + 1);
    }
    if (b.extras.antenna) {
      const [ax, ay, ah] = b.extras.antenna;
      inkThin.raw(`M${r1(ax)} ${r1(ay)}L${r1(ax)} ${r1(ay - ah)}M${r1(ax - ah * 0.14)} ${r1(ay - ah * 0.7)}L${r1(ax + ah * 0.14)} ${r1(ay - ah * 0.7)}`);
    }
    if (b.beacon) beacons.push(b.beacon);
    // ink: sides overshooting the roof, roof lines
    if (inkW) {
      const sd = `${p.seed}/${r1(b.x)}`;
      for (let i = 0; i < b.tiers.length; i++) {
        const [tx, ty, tw, th] = b.tiers[i];
        const bot = ty + th;
        ink.raw(line(tx, bot, tx, ty, {seed: `${sd}l${i}`, over: [0, 6 + 10 * s], breaks: false}));
        ink.raw(line(tx + tw, bot, tx + tw, ty, {seed: `${sd}r${i}`, over: [0, 4 + 8 * s], breaks: false}));
        ink.raw(line(tx, ty, tx + tw, ty, {seed: `${sd}t${i}`, over: [4 * s + 2, 8 * s + 4], breaks: false}));
      }
      if (b.roof && b.kind === 'dome') {
        const T = b.tiers[b.tiers.length - 1];
        ink.raw(arc(T[0] + T[2] / 2, T[1], T[2] * 0.4, (T[1] - Math.min(...b.roof.map((q) => q[1]))) / 1.7, 182, 358, {seed: `${sd}d`}));
      } else if (b.roof) {
        for (let i = 0; i < b.roof.length - 1; i++) ink.raw(line(b.roof[i][0], b.roof[i][1], b.roof[i + 1][0], b.roof[i + 1][1], {seed: `${sd}p${i}`, over: [0, 3 + 4 * s], breaks: false}));
      }
    }
  }
  // low city mass behind / below the row (no sky shows under it)
  const mass = new PathBuf().rect(x0 - 400, base - 70 * s, x1 - x0 + 800, 2400).d;
  const toStr = (m: Map<number, PathBuf>) => new Map([...m.entries()].map(([k, v]) => [k, v.d]));
  return {blds, fillsByCi: toStr(fills), roofsByCi: toStr(roofs), shadeByCi: toStr(shades), rim: rim.d, mass, ink: ink.d, inkThin: inkThin.d, cells, beacons};
}

// ---------------------------------------------------------------- Skyline (one row)

export type CityWindows = WindowLook & {events?: SwitchEvent[]};

export type SkylineProps = Omit<RowParams, 'seed'> & {
  seed?: Seed;
  /** Atmospheric depth 0 (near) .. 1 (horizon). */
  depth?: number;
  tod?: Tod | TodPalette;
  /** Facade colours (default palette.facade of the tod). */
  colors?: string[];
  roofColors?: string[];
  windows?: CityWindows;
  /** Rise from the base at this time (0.6 s, slight overshoot). */
  at?: number;
  /** Blinking beacon lights on towers (Hz, 0 = off). */
  beacons?: number;
  inkColor?: string;
  /** Mass colour under the row (default the darkest facade colour, tinted). */
  massColor?: string;
};

export const Skyline: React.FC<SkylineProps> = ({seed = 'sky', depth = 0, tod = 'day', colors, roofColors, windows, at, beacons = 0, inkColor = palette.ink, massColor, ...row}) => {
  const t = useTime();
  const p = todPal(tod);
  const geo = rowGeo({...row, seed, nColors: (colors ?? p.facade).length});
  const cols = (colors ?? p.facade).map((c) => atmos(c, depth, p));
  const rcols = (roofColors ?? [palette.teal, palette.tealDark, palette.tan, palette.brown]).map((c) => atmos(c, depth, p));
  const shades = (colors ?? p.facade).map((c) => atmos(darker(c), depth, p));
  const ev = windows?.events ?? [];
  const times = useMemo(() => switchTimes(geo.cells, ev, `${seed}/w`), [geo, JSON.stringify(ev), seed]);
  if (at !== undefined && t < at) return null;
  const W = windowPaths(geo.cells, ev, times, t, windows ?? {});
  const lit = (windows?.lit ?? p.windowLit).map((c) => atmos(c, depth * 0.6, p, {raw: true}));
  const dark = atmos(windows?.dark ?? p.windowDark, depth, p, {raw: true});
  const out: React.ReactNode[] = [];
  out.push(<path key="mass" d={geo.mass} fill={massColor ?? atmos(darker(p.facade[0]), depth, p)} />);
  geo.fillsByCi.forEach((d, k) => out.push(<path key={`f${k}`} d={d} fill={cols[k % cols.length]} />));
  geo.roofsByCi.forEach((d, k) => out.push(<path key={`r${k}`} d={d} fill={rcols[k % rcols.length]} />));
  geo.shadeByCi.forEach((d, k) => out.push(<path key={`s${k}`} d={d} fill={shades[k % shades.length]} />));
  if (geo.rim && row.rimSide !== 'none') out.push(<path key="rim" d={geo.rim} fill={atmos(p.rim, depth, p, {raw: true})} />);
  if (W.dark && !windows?.noDark) out.push(<path key="wd" d={W.dark} fill={dark} />);
  W.lit.forEach((d, i) => d && out.push(<path key={`wl${i}`} d={d} fill={lit[i % lit.length]} />));
  if (W.blinds) out.push(<path key="wb" d={W.blinds} fill={atmos(windows?.blindColor ?? palette.tan, depth, p)} />);
  if (geo.ink && row.ink) out.push(<path key="ink" d={geo.ink} fill="none" stroke={inkColor} strokeWidth={row.ink} strokeLinecap="round" strokeLinejoin="round" />);
  if (geo.inkThin && row.ink) out.push(<path key="inkT" d={geo.inkThin} fill="none" stroke={inkColor} strokeWidth={row.ink * 0.7} strokeLinecap="round" />);
  else if (geo.inkThin) out.push(<path key="ant" d={geo.inkThin} fill="none" stroke={atmos(darker(p.facade[0]), depth, p)} strokeWidth={Math.max(0.8, 2.2 * row.s)} strokeLinecap="round" />);
  if (beacons > 0 && geo.beacons.length) {
    const pb = new PathBuf();
    geo.beacons.forEach(([bx, by], i) => {
      if (osc(t, beacons, i * 1.7) > 0.35) pb.circle(bx, by, Math.max(1.6, 4.5 * row.s));
    });
    if (!pb.empty) out.push(<path key="bc" d={pb.d} fill={palette.peach} />);
  }
  const content = <>{out}</>;
  if (at === undefined) return content;
  const k = E.outBack(1.4)(prog(t, at, 0.6));
  return <g transform={`translate(0 ${r1(row.base)}) scale(1 ${k.toFixed(4)}) translate(0 ${r1(-row.base)})`}>{content}</g>;
};

// ---------------------------------------------------------------- EndlessCity

export type RowInfo = {i: number; base: number; s: number; depth: number; parallax: number};

/** Where each row of an EndlessCity sits (row 0 = farthest). */
export function cityRows(o: {horizon: number; nearY: number; rows?: number; nearS?: number; farS?: number; depthNear?: number; depthFar?: number; parallaxNear?: number}): RowInfo[] {
  const n = o.rows ?? 6;
  const nearS = o.nearS ?? 1;
  const farS = o.farS ?? 0.1;
  const dN = o.depthNear ?? 0.05;
  const dF = o.depthFar ?? 1;
  const fN = o.parallaxNear ?? 1;
  return Array.from({length: n}, (_, i) => {
    const u = n === 1 ? 1 : i / (n - 1);
    const s = farS * Math.pow(nearS / farS, u);
    const base = o.horizon + ((o.nearY - o.horizon) * s) / nearS;
    return {i, s, base, depth: dF + (dN - dF) * u, parallax: 1 - (s / nearS) * fN};
  });
}

export type EndlessCityProps = {
  horizon: number;
  /** Base y of the nearest row. */
  nearY: number;
  rows?: number;
  nearS?: number;
  farS?: number;
  /** Atmospheric depth of nearest / farthest row (0 near .. 1 horizon). */
  depthNear?: number;
  depthFar?: number;
  /** Parallax factor of the nearest row (1 = reference plane). */
  parallaxNear?: number;
  tod?: Tod | TodPalette;
  seed?: Seed;
  x0?: number;
  x1?: number;
  windows?: CityWindows;
  /** Per-row overrides (index 0 = farthest). */
  rowProps?: (info: RowInfo) => Partial<SkylineProps>;
  /** Rows rise one after another (far -> near) starting here. */
  at?: number;
  stagger?: number;
  /** Fog band at each row's foot (opacity, 0 = none). */
  haze?: number;
  towers?: number;
  beacons?: number;
  layered?: boolean;
  /** Render extra things inside a row's layer (behind = before the row, front = after). */
  inRow?: (info: RowInfo) => {behind?: React.ReactNode; front?: React.ReactNode} | null;
};

export const EndlessCity: React.FC<EndlessCityProps> = ({
  horizon,
  nearY,
  rows = 6,
  nearS = 1,
  farS = 0.1,
  depthNear = 0.05,
  depthFar = 1,
  parallaxNear = 1,
  tod = 'dusk',
  seed = 'city',
  x0 = -500,
  x1 = 1580,
  windows,
  rowProps,
  at,
  stagger = 0.18,
  haze = 0.45,
  towers = 0.08,
  beacons = 0,
  layered = true,
  inRow,
}) => {
  const p = todPal(tod);
  const info = cityRows({horizon, nearY, rows, nearS, farS, depthNear, depthFar, parallaxNear});
  return (
    <>
      {info.map((ri) => {
        const inkW = ri.s >= 0.7 ? 3.0 : ri.s >= 0.42 ? 2.2 : ri.s >= 0.27 ? 1.5 : 0;
        const margin = 260 * (1 - ri.s) + 100;
        const extra = inRow?.(ri) ?? null;
        const nextBase = info[ri.i + 1]?.base ?? ri.base + 400;
        const body = (
          <>
            {extra?.behind}
            <Skyline
              base={ri.base}
              s={ri.s}
              x0={x0 - margin}
              x1={x1 + margin}
              seed={`${seed}/${ri.i}`}
              depth={ri.depth}
              tod={p}
              ink={inkW}
              towers={towers * (ri.i === 0 ? 0.4 : 1)}
              windows={windows}
              at={at === undefined ? undefined : at + ri.i * stagger}
              beacons={beacons}
              rimSide="right"
              {...rowProps?.(ri)}
            />
            {haze > 0 && ri.i < rows - 1 ? <HazeBand y={ri.base - 30 * ri.s} h={nextBase - ri.base + 200} color={p.haze} opacity={haze * (0.55 + 0.45 * ri.depth)} wave={10 * ri.s + 3} seed={`${seed}/hz${ri.i}`} /> : null}
            {extra?.front}
          </>
        );
        return layered ? (
          <Layer key={ri.i} depth={ri.parallax}>
            {body}
          </Layer>
        ) : (
          <React.Fragment key={ri.i}>{body}</React.Fragment>
        );
      })}
    </>
  );
};
