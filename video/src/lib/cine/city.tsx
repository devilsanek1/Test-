// cine/city.tsx — EndlessCity / Skyline: procedural rows of buildings receding to the horizon, atmospheric tint per
// row (stepped palette mixes for FAR rows only), batched window grids that light up across the city, rim light on the
// sun side, ink only on the nearer rows (far rows are fill-only, like the reference). Geometry is memoised by seed.
//
//   <EndlessCity horizon={1010} nearY={1560} rows={6} tod="dusk" seed="pilt"
//     build={{at: 0.1, span: 2.4}}                                          // buildings pop up one by one
//     windows={{initial: 0.2, events: [{at: 0.4, dur: 5, to: 'on', pattern: 'sweep', dir: 90, fraction: 0.7}]}} />
//   <Skyline base={1250} s={0.45} depth={0.5} tod="day" seed="row" build={{at: 1, span: 1.5, order: 'center'}} />
//   cityRows({horizon, nearY, rows, nearS, farS})                          // where each row sits (place props in rows)
//
// Hand-drawn look of the inked (near) rows: each building's FILL sits misregistered from its ink (theme misreg,
// seeded per building), 2-3 window types per building with their own rhythm, a ledge band every 3-4 floors, shop
// fronts / awnings on the nearest row, water towers, and ink window frames that overshoot their corners.
// Build: fill-first silhouettes that rise from the base (outBack, ~0.27 s per building, 50 % overlap), ink pops a beat
// later, windows appear once the building stands. Un-build: windows switch off, buildings sink into their base (small
// first), the ink drops. Look: paper = white fills + ink (fill-only rows get a hairline outline), cascade = paper
// until the wave reaches each building.
//
// Rows are wrapped in <Layer depth> (parallax factor = row scale) unless layered={false}.

import React, {useMemo} from 'react';
import {misreg, palette} from '../theme';
import {ease as E, osc, prog, useTime} from '../time';
import {rng, Seed} from '../rng';
import {arc, line, Pt} from '../sketch';
import {Layer} from './camera';
import {atmos, deep, Tod, TodPalette, todPal} from './atmosphere';
import {HazeBand} from './sky';
import {SwitchEvent, switchTimes, WinCell, windowPaths, WindowLook} from './windows';
import {memoize, PathBuf, r1} from './util';
import {exitScale, inkGone, isPaper, jit, lookPaint, screenSize, useCineState} from './state';

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
      return palette.tealDark;
    default:
      return palette.tealDark;
  }
}

// ---------------------------------------------------------------- geometry

export type Kind = 'flat' | 'step' | 'gable' | 'dome' | 'spire' | 'tower';

/** One building of a row: its own path strings (fills already misregistered), so a row can build / un-build /
 *  cascade building by building and still batch everything that is at rest. */
type BGeo = {
  x: number;
  w: number;
  base: number;
  top: number;
  ci: number;
  roofCi: number;
  fill: string;
  roof: string;
  shade: string;
  band: string;
  rim: string;
  awning: string;
  ink: string;
  inkThin: string;
  /** cells [c0, c1) of the row's window list */
  c0: number;
  c1: number;
  beacon?: Pt;
  j: number;
};

type RowGeo = {blds: BGeo[]; mass: string; cells: WinCell[]; cellB: Int32Array; all: Batch};

type Batch = {fills: Map<number, string>; roofs: Map<number, string>; shades: Map<number, string>; bands: Map<number, string>; rim: string; awning: string; ink: string; inkThin: string; outline: string};

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
  /** Colossal landmark buildings at world x (centre), size in px at s = 1. */
  landmarks?: Landmark[];
  /** Draw window frames in ink (open rectangles overshooting their corners). Default: rows with ink >= 2. */
  frames?: boolean;
  /** Shop fronts / awnings on the ground floor. Default: rows with s >= 0.7. */
  shops?: boolean;
};

export type Landmark = {x: number; w: number; h: number; kind?: Kind; ci?: number};

function rowGeo(p: RowParams): RowGeo {
  const key = JSON.stringify(p);
  return memoize(ROW_CACHE, key, () => buildRow(p), 64);
}
const ROW_CACHE = new Map<string, RowGeo>();

// window types: [fw, fh] as fractions of a cell
const WTYPES: [number, number][] = [
  [0.4, 0.7], // tall narrow
  [0.56, 0.52], // square
  [0.74, 0.44], // wide / ribbon
];

type Proto = {x: number; w: number; h: number; kind: Kind; tower: boolean; ci: number; roofCi: number};

function buildRow(p: RowParams): RowGeo {
  const {base, s, x0, x1} = p;
  const r = rng(`row/${p.seed}`);
  const [h0, h1] = p.hRange ?? [230, 720];
  const [w0, w1] = p.wRange ?? [120, 270];
  const nC = p.nColors ?? 4;
  const inkW = p.ink ?? 0;
  const frames = p.frames ?? inkW >= 2;
  const shops = p.shops ?? s >= 0.7;
  const protos: Proto[] = [];
  let x = x0 - r.range(0, w1 * s);
  while (x < x1) {
    const w = r.range(w0, w1) * s;
    const tower = r.chance(p.towers ?? 0.08);
    const kind: Kind = tower ? r.pick<Kind>(['tower', 'spire', 'step', 'dome']) : r.weighted<Kind>([['flat', 5], ['step', 1.4], ['gable', 1.6], ['dome', 0.5], ['spire', 0.3]]);
    let h = r.range(h0, h1) * s * (tower ? r.range(1.8, 2.8) : 1);
    if (kind === 'gable') h *= 0.75;
    protos.push({x, w, h, kind, tower, ci: r.int(0, nC - 1), roofCi: r.int(0, nC - 1)});
    x += w + r.range(-2, 14) * s;
  }
  // colossal landmarks replace whatever stood in their footprint
  for (const lm of p.landmarks ?? []) {
    const lw = lm.w * s;
    const lx = lm.x - lw / 2;
    for (let i = protos.length - 1; i >= 0; i--) if (protos[i].x < lx + lw && protos[i].x + protos[i].w > lx) protos.splice(i, 1);
    protos.push({x: lx, w: lw, h: lm.h * s, kind: lm.kind ?? 'step', tower: true, ci: lm.ci ?? 0, roofCi: lm.ci ?? 0});
  }
  protos.sort((a, b) => a.x - b.x);

  const cells: WinCell[] = [];
  const cellB: number[] = [];
  const blds: BGeo[] = [];
  const wr = rng(`rowwin/${p.seed}`);
  const cellK = (p.cell ?? 1) * (s >= 0.4 ? 1 : Math.pow(0.4 / s, 0.7));

  protos.forEach((b, bi) => {
    const br = rng(`bld/${p.seed}/${bi}`);
    // misregistration of this building's fills (ink rows only; fill-only rows have nothing to misregister against)
    const ox = inkW ? (misreg.dx + br.jitter(misreg.jitter)) * Math.max(0.5, s) : 0;
    const oy = inkW ? (misreg.dy + br.jitter(misreg.jitter * 0.6)) * Math.max(0.5, s) : 0;
    const F = new PathBuf();
    const R = new PathBuf();
    const SH = new PathBuf();
    const BA = new PathBuf();
    const RIM = new PathBuf();
    const AW = new PathBuf();
    const INK = new PathBuf();
    const THIN = new PathBuf();
    const tiers: [number, number, number, number][] = [];
    const top = base - b.h;
    let roof: Pt[] | null = null;
    const ww = b.kind === 'tower' || b.kind === 'spire' ? b.w * 0.72 : b.w;
    const bx = b.x + (b.w - ww) / 2;
    if (b.kind === 'step') {
      const hA = b.h * br.range(0.55, 0.68);
      const hB = b.h * br.range(0.2, 0.28);
      tiers.push([bx, base - hA, ww, hA]);
      tiers.push([bx + ww * 0.14, base - hA - hB, ww * 0.72, hB]);
      tiers.push([bx + ww * 0.3, top, ww * 0.4, b.h - hA - hB]);
    } else tiers.push([bx, top, ww, b.h]);
    const T = tiers[tiers.length - 1];
    const [tx, ty, tw] = T;
    if (b.kind === 'gable') {
      const ph = tw * br.range(0.28, 0.42);
      roof = [
        [tx - 3 * s, ty],
        [tx + tw / 2, ty - ph],
        [tx + tw + 3 * s, ty],
      ];
    } else if (b.kind === 'dome') {
      const rx = tw * 0.4;
      const ry = tw * br.range(0.26, 0.36);
      const cx = tx + tw / 2;
      const pts: Pt[] = [];
      for (let i = 0; i <= 12; i++) {
        const a = Math.PI + (Math.PI * i) / 12;
        pts.push([cx + Math.cos(a) * rx, ty + Math.sin(a) * ry]);
      }
      pts.splice(7, 0, [cx - rx * 0.12, ty - ry * 0.98], [cx - rx * 0.12, ty - ry * 1.25], [cx, ty - ry * 1.7], [cx + rx * 0.12, ty - ry * 1.25], [cx + rx * 0.12, ty - ry * 0.98]);
      roof = pts;
    } else if (b.kind === 'spire' || b.kind === 'tower') {
      const sh = tw * (b.kind === 'spire' ? br.range(1.2, 2.0) : br.range(0.25, 0.5));
      roof =
        b.kind === 'spire'
          ? [
              [tx, ty],
              [tx + tw / 2, ty - sh],
              [tx + tw, ty],
            ]
          : [
              [tx + tw * 0.2, ty],
              [tx + tw * 0.2, ty - sh * 0.4],
              [tx + tw * 0.5, ty - sh],
              [tx + tw * 0.8, ty - sh * 0.4],
              [tx + tw * 0.8, ty],
            ];
    }
    const roofTop = roof ? Math.min(...roof.map((q) => q[1])) : ty;
    const sd = `${p.seed}/${bi}`;
    // ---- fills (misregistered)
    for (const [qx, qy, qw, qh] of tiers) {
      F.rect(qx + ox, qy + oy, qw, qh + 2);
      if (p.rimSide !== 'left') SH.rect(qx + ox, qy + oy, qw * 0.18, qh + 2);
      else SH.rect(qx + ox + qw * 0.82, qy + oy, qw * 0.18, qh + 2);
      if (p.rimSide !== 'none') {
        // rim strip over 40-70 % of the lit edge (style_bible_ref2 1.7), from the top down
        const rw = Math.max(1.2, 5 * s);
        RIM.rect(p.rimSide === 'left' ? qx + ox : qx + ox + qw - rw, qy + oy, rw, qh * br.range(0.4, 0.7));
      }
    }
    if (roof) R.poly(roof.map(([a, c]) => [a + ox, c + oy] as Pt));
    // water tower / chimney / antenna crowns (10-30 % of flat roofs)
    if ((b.kind === 'flat' || b.kind === 'step') && br.chance(0.24)) {
      const ws = br.range(16, 26) * s;
      const wx = tx + br.range(0.15, 0.85) * (tw - ws);
      R.rect(wx + ox, ty - ws * 1.55 + oy, ws, ws * 0.9);
      R.poly([
        [wx - ws * 0.08 + ox, ty - ws * 1.55 + oy],
        [wx + ws / 2 + ox, ty - ws * 1.95 + oy],
        [wx + ws * 1.08 + ox, ty - ws * 1.55 + oy],
      ]);
      if (inkW) {
        THIN.raw(line(wx + ws * 0.15, ty, wx + ws * 0.15, ty - ws * 0.65, {over: [0, 1], seed: `${sd}wl`}) + line(wx + ws * 0.85, ty, wx + ws * 0.85, ty - ws * 0.65, {over: [0, 1], seed: `${sd}wr`}));
        THIN.raw(line(wx - ws * 0.1, ty - ws * 0.65, wx + ws * 1.1, ty - ws * 0.65, {over: [1, 2], seed: `${sd}wb`}));
      } else R.rect(wx + ws * 0.1, ty - ws * 0.68, ws * 0.8, ws * 0.12);
    } else if (b.kind === 'flat' && br.chance(0.3)) {
      const cwid = br.range(6, 12) * s;
      F.rect(tx + br.range(0.1, 0.8) * tw + ox, ty - br.range(10, 26) * s + oy, cwid, br.range(10, 26) * s + 1);
    }
    let antenna: [number, number, number] | null = null;
    if (br.chance(b.kind === 'tower' || b.kind === 'step' ? 0.75 : 0.12)) {
      antenna = [tx + tw * br.range(0.3, 0.7), roofTop, br.range(22, 60) * s];
      const [ax, ay, ah] = antenna;
      THIN.raw(`M${r1(ax)} ${r1(ay)}L${r1(ax)} ${r1(ay - ah)}M${r1(ax - ah * 0.14)} ${r1(ay - ah * 0.7)}L${r1(ax + ah * 0.14)} ${r1(ay - ah * 0.7)}`);
    }
    const beacon: Pt | undefined = b.tower || b.kind === 'spire' ? [antenna ? antenna[0] : tx + tw / 2, roofTop - (antenna ? antenna[2] : 0)] : undefined;

    // ---- windows: per-building type + rhythm, ledge bands every 3-4 floors, shop fronts on the ground floor
    const c0 = cells.length;
    const tA = br.int(0, WTYPES.length - 1);
    const tB = (tA + 1 + br.int(0, 1)) % WTYPES.length;
    const cw = 24 * s * cellK * br.range(0.85, 1.25);
    const ch = 32 * s * cellK * br.range(0.9, 1.15);
    const bandEvery = br.pick([3, 4, 4, 5]);
    const pairs = br.chance(0.3);
    const frameO = s * br.range(3, 8);
    tiers.forEach(([qx, qy, qw, qh], ti) => {
      const m = 9 * s * cellK;
      const cols = Math.floor((qw - 2 * m) / cw);
      const rows = Math.floor((qh - m - ch * 0.8) / ch);
      if (cols < 1 || rows < 1 || wr.next() < 0.08) return;
      const ox2 = qx + (qw - cols * cw) / 2;
      for (let ri = 0; ri < rows; ri++) {
        const wy0 = qy + m + ri * ch;
        const isGround = ti === 0 && ri === rows - 1 && shops;
        // a ledge band instead of a window row every few floors (not on the top row)
        if (ri > 0 && ri % bandEvery === 0 && !isGround && s >= 0.2) {
          const by = wy0 + ch * 0.35;
          BA.rect(qx + ox - 2 * s, by + oy, qw + 4 * s, Math.max(1.5, 6 * s));
          if (inkW) THIN.raw(line(qx - 4 * s, by, qx + qw + 4 * s, by, {seed: `${sd}lb${ti}${ri}`, over: [2, 5], breaks: false}));
          continue;
        }
        const [fw, fh] = isGround ? [0.82, 0.62] : WTYPES[ri % 5 === 4 ? tB : tA];
        for (let c = 0; c < cols; c++) {
          if (pairs && !isGround && c % 3 === 2) continue;
          const wx = ox2 + c * cw + (cw * (1 - fw)) / 2;
          const wy = wy0 + (isGround ? ch * 0.3 : 0);
          const w = cw * fw;
          const h = ch * fh;
          cells.push({u: wx / 1080, v: wy / 1920, k: wr.next(), k2: wr.next(), k3: wr.next(), rect: [wx, wy, w, h]});
          cellB.push(bi);
          if (frames) {
            // open rectangle: top edge + two sides overshooting the corners (ref 1 window frames)
            const o = frameO * (0.6 + 0.4 * wr.next());
            THIN.raw(`M${r1(wx - o)} ${r1(wy)}H${r1(wx + w + o * 0.6)}M${r1(wx)} ${r1(wy - o * 0.6)}V${r1(wy + h + o)}M${r1(wx + w)} ${r1(wy - o * 0.4)}V${r1(wy + h + o * 0.7)}`);
          }
        }
        if (isGround && br.chance(0.18)) {
          // awning over the shop front
          const ay = wy0 + ch * 0.12;
          const ah = ch * 0.34;
          AW.poly([
            [qx + ox + 3 * s, ay + oy],
            [qx + ox + qw - 3 * s, ay + oy],
            [qx + ox + qw + 6 * s, ay + ah + oy],
            [qx + ox - 6 * s, ay + ah + oy],
          ]);
          if (inkW) THIN.raw(line(qx - 8 * s, ay + ah, qx + qw + 8 * s, ay + ah, {seed: `${sd}aw`, over: [2, 4], breaks: false}) + line(qx + 2 * s, ay, qx + qw - 2 * s, ay, {seed: `${sd}aw2`, over: [1, 3], breaks: false}));
        }
      }
    });
    // ---- ink: sides overshooting the roof, roof lines
    if (inkW) {
      for (let i = 0; i < tiers.length; i++) {
        const [qx, qy, qw, qh] = tiers[i];
        const bot = qy + qh;
        INK.raw(line(qx, bot, qx, qy, {seed: `${sd}l${i}`, over: [0, 6 + 10 * s], breaks: false}));
        INK.raw(line(qx + qw, bot, qx + qw, qy, {seed: `${sd}r${i}`, over: [0, 4 + 8 * s], breaks: false}));
        INK.raw(line(qx, qy, qx + qw, qy, {seed: `${sd}t${i}`, over: [4 * s + 2, 8 * s + 4], breaks: false}));
      }
      if (roof && b.kind === 'dome') INK.raw(arc(tx + tw / 2, ty, tw * 0.4, (ty - roofTop) / 1.7, 182, 358, {seed: `${sd}d`}));
      else if (roof) for (let i = 0; i < roof.length - 1; i++) INK.raw(line(roof[i][0], roof[i][1], roof[i + 1][0], roof[i + 1][1], {seed: `${sd}p${i}`, over: [0, 3 + 4 * s], breaks: false}));
    }
    blds.push({
      x: b.x,
      w: b.w,
      base,
      top: roofTop,
      ci: b.ci,
      roofCi: b.roofCi,
      fill: F.d,
      roof: R.d,
      shade: SH.d,
      band: BA.d,
      rim: RIM.d,
      awning: AW.d,
      ink: INK.d,
      inkThin: THIN.d,
      c0,
      c1: cells.length,
      beacon,
      j: br.next(),
    });
  });
  // low city mass behind / below the row (no sky shows under it)
  const mass = new PathBuf().rect(x0 - 400, base - 70 * s, x1 - x0 + 800, 2400).d;
  return {blds, mass, cells, cellB: Int32Array.from(cellB), all: batch(blds, blds.map((_, i) => i))};
}

function batch(blds: BGeo[], idx: number[]): Batch {
  const fills = new Map<number, string[]>();
  const roofs = new Map<number, string[]>();
  const shades = new Map<number, string[]>();
  const bands = new Map<number, string[]>();
  const rim: string[] = [];
  const aw: string[] = [];
  const ink: string[] = [];
  const thin: string[] = [];
  const push = (m: Map<number, string[]>, k: number, d: string) => {
    if (!d) return;
    let a = m.get(k);
    if (!a) m.set(k, (a = []));
    a.push(d);
  };
  for (const i of idx) {
    const b = blds[i];
    push(fills, b.ci, b.fill);
    push(roofs, b.roofCi, b.roof);
    push(shades, b.ci, b.shade);
    push(bands, b.ci, b.band);
    if (b.rim) rim.push(b.rim);
    if (b.awning) aw.push(b.awning);
    if (b.ink) ink.push(b.ink);
    if (b.inkThin) thin.push(b.inkThin);
  }
  const j = (m: Map<number, string[]>) => new Map([...m.entries()].map(([k, v]) => [k, v.join('')]));
  const F = j(fills);
  return {fills: F, roofs: j(roofs), shades: j(shades), bands: j(bands), rim: rim.join(''), awning: aw.join(''), ink: ink.join(''), inkThin: thin.join(''), outline: [...F.values(), ...j(roofs).values()].join('')};
}

// ---------------------------------------------------------------- Skyline (one row)

export type CityWindows = WindowLook & {events?: SwitchEvent[]};

export type CityBuild = {
  /** Start (scene s). */
  at: number;
  /** Seconds over which the buildings start (default: 0.135 s apart, i.e. ~0.27 s each with 50 % overlap). */
  span?: number;
  /** Seconds each building takes to rise (default 0.27). */
  per?: number;
  order?: 'left' | 'right' | 'center' | 'random' | 'tall';
};

export type SkylineProps = Omit<RowParams, 'seed'> & {
  seed?: Seed;
  /** Atmospheric depth 0 (near) .. 1 (horizon). */
  depth?: number;
  tod?: Tod | TodPalette;
  /** Facade colours (default palette.facade of the tod). */
  colors?: string[];
  roofColors?: string[];
  windows?: CityWindows;
  /** Rise from the base at this time (whole row: 0.6 s, slight overshoot). */
  at?: number;
  /** Building-by-building build (fill-first silhouettes, then ink, then windows). */
  build?: CityBuild;
  /** Blinking beacon lights on towers (Hz, 0 = off). */
  beacons?: number;
  inkColor?: string;
  /** Mass colour under the row (default the darkest facade colour, tinted). */
  massColor?: string;
};

type BState = {k: number; paper: boolean; ink: boolean; steady: boolean};

export const Skyline: React.FC<SkylineProps> = ({seed = 'sky', depth = 0, tod = 'day', colors, roofColors, windows, at, build, beacons = 0, inkColor = palette.ink, massColor, ...row}) => {
  const S = useCineState();
  const t = S.t;
  const p = todPal(tod);
  const geo = rowGeo({...row, seed, nColors: (colors ?? p.facade).length});
  const cols = (colors ?? p.facade).map((c) => atmos(c, depth, p));
  const rcols = (roofColors ?? [palette.teal, palette.tealDark, palette.tan, palette.brown]).map((c) => atmos(c, depth, p));
  const shades = (colors ?? p.facade).map((c) => atmos(darker(c), depth, p));
  const ev = windows?.events ?? [];
  const times = useMemo(() => switchTimes(geo.cells, ev, `${seed}/w`), [geo, JSON.stringify(ev), seed]);
  // build start per building
  const starts = useMemo(() => {
    if (!build) return null;
    const n = geo.blds.length;
    const per = build.per ?? 0.27;
    const order = build.order ?? 'left';
    const rank = geo.blds.map((b, i) => {
      const cx = b.x + b.w / 2;
      return order === 'left' ? cx : order === 'right' ? -cx : order === 'center' ? Math.abs(cx - 540) : order === 'tall' ? b.top : jit(i + n * 7.3);
    });
    const idx = rank.map((_, i) => i).sort((a, b) => rank[a] - rank[b]);
    const step = build.span !== undefined ? build.span / Math.max(1, n - 1) : per * 0.5;
    const st = new Float64Array(n);
    idx.forEach((bi, k) => (st[bi] = build.at + k * step + (jit(bi * 3.1 + 1) - 0.5) * step * 0.6));
    return {st, per};
  }, [geo, build?.at, build?.span, build?.per, build?.order]);
  if (at !== undefined && t < at) return null;
  if (S.look.fills === 'none' && !S.look.ink) return null;

  const rowInk = (row.ink ?? 0) > 0;
  const rowSize = screenSize(S.m, Math.min(row.x1 - row.x0, 1400), Math.max(40, row.base - Math.min(...geo.blds.map((b) => b.top))));
  // per-building state
  const st: BState[] = geo.blds.map((b, i) => {
    let k = 1;
    let ink = S.look.ink;
    if (starts) {
      const t0 = starts.st[i];
      if (t < t0) return {k: 0, paper: false, ink: false, steady: false};
      const u = prog(t, t0, starts.per * 0.62);
      k = u >= 1 ? 1 : E.outBack(1.5)(u);
      ink = ink && t >= t0 + starts.per * 0.45; // ink lands a beat after the fill
    }
    if (S.e > 0) {
      const sz = Math.min(rowSize, screenSize(S.m, b.w, b.base - b.top));
      k *= exitScale(S.e, b.j, sz);
      ink = ink && !inkGone(S.e, b.j);
    }
    const paper = isPaper(S, [b.x + b.w / 2, (b.base + b.top) / 2]);
    return {k, paper, ink, steady: k === 1 && !paper && ink === S.look.ink && S.e <= 0};
  });
  const allSteady = st.every((x) => x.steady);
  const steadyIdx: number[] = [];
  const paperIdx: number[] = [];
  const moving: number[] = [];
  st.forEach((x, i) => {
    if (x.k <= 0.002) return;
    if (x.k !== 1) moving.push(i);
    else if (x.paper) paperIdx.push(i);
    else steadyIdx.push(i);
  });
  const B = allSteady ? geo.all : batch(geo.blds, steadyIdx);

  const out: React.ReactNode[] = [];
  const massPaint = lookPaint(S, massColor ?? atmos(darker(p.facade[0]), depth, p), [540, row.base]);
  const massK = S.e > 0 ? exitScale(S.e, 0.5, rowSize) : 1;
  if (massPaint !== 'none' && massK > 0) out.push(<path key="mass" d={geo.mass} fill={massPaint} transform={massK < 1 ? `translate(0 ${r1(row.base * (1 - massK))}) scale(1 ${massK.toFixed(4)})` : undefined} />);

  const drawBatch = (b: Batch, key: string, paper: boolean, ink: boolean) => {
    const o: React.ReactNode[] = [];
    if (S.look.fills !== 'none') {
      if (paper) {
        const d = [...b.fills.values(), ...b.roofs.values()].join('');
        if (d) o.push(<path key={`${key}pw`} d={d} fill={palette.white} />);
      } else {
        b.fills.forEach((d, k) => o.push(<path key={`${key}f${k}`} d={d} fill={cols[k % cols.length]} />));
        b.roofs.forEach((d, k) => o.push(<path key={`${key}r${k}`} d={d} fill={rcols[k % rcols.length]} />));
        b.shades.forEach((d, k) => o.push(<path key={`${key}s${k}`} d={d} fill={shades[k % shades.length]} />));
        b.bands.forEach((d, k) => o.push(<path key={`${key}b${k}`} d={d} fill={shades[k % shades.length]} />));
        if (b.rim && row.rimSide !== 'none') o.push(<path key={`${key}rim`} d={b.rim} fill={atmos(p.rim, depth, p, {raw: true})} />);
        if (b.awning) o.push(<path key={`${key}aw`} d={b.awning} fill={atmos(palette.peach, depth, p, {raw: true})} />);
      }
    }
    if (ink) {
      if (rowInk) {
        if (b.ink) o.push(<path key={`${key}i`} d={b.ink} fill="none" stroke={inkColor} strokeWidth={row.ink} strokeLinecap="round" strokeLinejoin="round" />);
        if (b.inkThin) o.push(<path key={`${key}it`} d={b.inkThin} fill="none" stroke={inkColor} strokeWidth={(row.ink ?? 2) * 0.62} strokeLinecap="round" />);
      } else if (paper) {
        // fill-only row in the paper state: a hairline outline so it reads as line art
        o.push(<path key={`${key}po`} d={b.outline} fill="none" stroke={inkColor} strokeWidth={1.3} strokeLinejoin="round" />);
      } else if (b.inkThin) o.push(<path key={`${key}ant`} d={b.inkThin} fill="none" stroke={atmos(darker(p.facade[0]), depth, p)} strokeWidth={Math.max(0.8, 2.2 * row.s)} strokeLinecap="round" />);
    }
    return o;
  };

  out.push(...drawBatch(B, 'a', false, S.look.ink && (allSteady || steadyIdx.length > 0)));
  if (paperIdx.length) out.push(...drawBatch(batch(geo.blds, paperIdx), 'p', true, S.look.ink));
  // windows: only on standing, coloured buildings; an un-build switches them all off
  if (S.look.fills === 'color' && S.e <= 0.05) {
    const keep = allSteady ? undefined : (() => {
      const ok = new Uint8Array(geo.blds.length);
      for (const i of steadyIdx) ok[i] = 1;
      return (ci: number) => ok[geo.cellB[ci]] === 1;
    })();
    const W = windowPaths(geo.cells, ev, times, t, windows ?? {}, 1, {keep});
    const lit = (windows?.lit ?? p.windowLit).map((c) => atmos(c, depth * 0.6, p, {raw: true}));
    const dark = atmos(windows?.dark ?? p.windowDark, depth, p, {raw: true});
    if (W.dark && !windows?.noDark) out.push(<path key="wd" d={W.dark} fill={dark} />);
    W.lit.forEach((d, i) => d && out.push(<path key={`wl${i}`} d={d} fill={lit[i % lit.length]} />));
    if (W.blinds) out.push(<path key="wb" d={W.blinds} fill={atmos(windows?.blindColor ?? palette.tan, depth, p)} />);
    if (beacons > 0) {
      const pb = new PathBuf();
      geo.blds.forEach((b, i) => {
        if (b.beacon && st[i].steady && osc(t, beacons, i * 1.7) > 0.35) pb.circle(b.beacon[0], b.beacon[1], Math.max(1.6, 4.5 * row.s));
      });
      if (!pb.empty) out.push(<path key="bc" d={pb.d} fill={palette.peach} />);
    }
  }
  // buildings rising / sinking: one group each, scaled about their base
  for (const i of moving) {
    const b = geo.blds[i];
    const x = st[i];
    const one = batch(geo.blds, [i]);
    out.push(
      <g key={`m${i}`} transform={`translate(0 ${r1(b.base)}) scale(1 ${x.k.toFixed(4)}) translate(0 ${r1(-b.base)})`}>
        {drawBatch(one, `m${i}`, x.paper, x.ink)}
      </g>,
    );
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
  /** Rows rise one after another (far -> near) starting here (whole-row rise). */
  at?: number;
  stagger?: number;
  /** Building-by-building build: rows start `rowStagger` apart (far first), buildings pop across `span` each. */
  build?: CityBuild & {rowStagger?: number};
  /** Translucent fog band at each row's foot (opacity). Default 0: depth comes from the rows' flat haze steps
   *  (style_bible_ref2 8: haze is a per-layer tint, not an overlay). */
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
  build,
  haze = 0,
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
        const rb = build ? {...build, at: build.at + ri.i * (build.rowStagger ?? 0.3)} : undefined;
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
              build={rb}
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
