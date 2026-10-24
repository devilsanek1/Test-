// cine/monument.tsx — Monument: a colossal civic / government building (steps, colonnade, entablature, pediment
// with an emblem, drum, dome, lantern, flag) drawn in ELEVATION units and mapped through a worm's-eye homography,
// so verticals converge upward and the upper parts foreshorten. Straight lines stay straight under the map, so
// polygons map exactly; the ink is drawn after mapping (hand-drawn wobble stays screen-sized).
//
//   <Monument cx={540} by={1900} bw={1600} ty={-500} taper={0.32} tod="golden" light="back" people={30}
//     build={{at: 0.1, dur: 3}} emblem={(x, y, r) => <Clock .../>} emblemY={1720} />
//   const M = monumentMap({cx, by, bw, ty, taper});  M.at(500, 1300) -> screen point of the pediment emblem
//
// Elevation units: X 0..1000 = the colonnade (steps reach -150..1150), Y 0 = foot of the steps, up to 2900 (flag).
//
// Scale cues at human size: a central bronze door ~2.5x a person, people beside it, people on the steps sized by
// step depth (0.032 H on the lowest step -> 0.022 H on the top one; kit Persons, never under 40 px), column bases and
// capitals as doubled ink lines. The ink thins with height (x clamp(scale / scale(base), 0.45, 1)).
// light="back": the sun is behind it. Every face is a flat shadow field (silhouette value + one lighter step), the
// columns are fill-only bands, the upper storeys (entablature and up) carry NO inner ink (only their outline), and a
// 4 px peach rim runs down the sun-facing edges: captions can sit on it (ink on the golden field >= 5:1).
// Build (`build`): parts pop up bottom -> top (steps, door, columns left -> right, entablature, pediment, drum, dome,
// lantern, flag), each rising from its own base in 0.26 s. Un-build: parts sink into their base (small first), ink
// drops. Look: paper = white fills + ink; cascade = paper until the wave reaches each part.

import React, {useMemo} from 'react';
import {palette, stroke} from '../theme';
import {ease as E, osc, prog} from '../time';
import {rng, Seed} from '../rng';
import {line, Pt} from '../sketch';
import {ambient, deep, Tod, TodPalette, todPal} from './atmosphere';
import {darker} from './city';
import {quadMap, UV} from './persp';
import {mix, PathBuf, r1} from './util';
import {Person} from '../kit';
import {FlatColor} from './light';
import {PERSON_FEET, PERSON_H, personInk} from './figures';
import {exitScale, inkGone, isPaper, jit, screenSize, useCineState} from './state';

export const MON = {x0: -150, x1: 1150, h: 2900} as const;

export type MonumentGeo = {cx: number; by: number; bw: number; ty: number; taper?: number};

/** Elevation (X, Y) -> screen mapping of a Monument, plus local scale (screen px per elevation unit) there. */
export function monumentMap(g: MonumentGeo) {
  const taper = g.taper ?? 0.42;
  const m: UV = quadMap([
    [g.cx - (g.bw * taper) / 2, g.ty],
    [g.cx + (g.bw * taper) / 2, g.ty],
    [g.cx + g.bw / 2, g.by],
    [g.cx - g.bw / 2, g.by],
  ]);
  const W = MON.x1 - MON.x0;
  const at = (X: number, Y: number): Pt => m((X - MON.x0) / W, 1 - Y / MON.h);
  const scale = (X: number, Y: number) => {
    const a = at(X, Y);
    const b = at(X + 10, Y);
    return Math.hypot(b[0] - a[0], b[1] - a[1]) / 10;
  };
  return {at, scale, m};
}

export type MonumentProps = MonumentGeo & {
  tod?: Tod | TodPalette;
  /** 'front' (default): sunlit stone. 'back': the sun is behind it (flat shadow fields + peach rim, quiet upper storeys). */
  light?: 'front' | 'back';
  columns?: number;
  dome?: boolean;
  flag?: boolean;
  /** People on the steps (kit Persons sized by step depth) and beside the door. */
  people?: number;
  doorPeople?: number;
  /** Door transom lit (peach). Default: dark times of day. */
  lit?: boolean;
  seed?: Seed;
  /** Ink width of the main lines at the base (screen px); thins with height. */
  inkW?: number;
  /** Emblem overlay renderer (screen centre + radius), e.g. a clock or a power symbol. */
  emblem?: (x: number, y: number, r: number) => React.ReactNode;
  /** Elevation of the emblem: 1300 = the pediment (default), ~1690 = the drum. */
  emblemY?: number;
  /** The emblem pops in at this time (a build event); default: with its part. */
  emblemAt?: number;
  /** Build bottom -> top over [at, at + dur]. Omit = standing. */
  build?: {at: number; dur?: number};
  /** People rise onto the steps over [at, at + span] (front to back). Omit = there. */
  peopleAt?: {at: number; span?: number};
};

type PaintKey = 'stone' | 'lit' | 'shade' | 'dark' | 'door' | 'transom' | 'dome' | 'domeShade' | 'rim' | 'disc';
const PAINTS: PaintKey[] = ['stone', 'dark', 'door', 'transom', 'shade', 'lit', 'dome', 'domeShade', 'disc', 'rim'];

/** One build part: fills per paint, ink per weight, the screen y of its base (it rises from there), its band. */
type Part = {name: string; fills: Partial<Record<PaintKey, string>>; ink: string; thin: string; hair: string; baseY: number; baseX: number; inkK: number; order: number; j: number; w: number; h: number};

type Geo = {parts: Part[]; emblem: {x: number; y: number; r: number}; flagPole: Pt; flagScale: number; emblemPart: number};

function buildGeo(g: MonumentGeo, columns: number, dome: boolean, back: boolean, emblemY: number, seed: Seed): Geo {
  const M = monumentMap(g);
  const A = M.at;
  const s0 = M.scale(500, 0);
  const parts: Part[] = [];
  const r0 = rng(`mon/${seed}`);
  let cur: {fills: Partial<Record<PaintKey, PathBuf>>; ink: PathBuf; thin: PathBuf; hair: PathBuf; Y0: number; Y1: number; X0: number; X1: number} | null = null;
  const begin = (Y0: number, Y1: number, X0 = 0, X1 = 1000) => (cur = {fills: {}, ink: new PathBuf(), thin: new PathBuf(), hair: new PathBuf(), Y0, Y1, X0, X1});
  const end = (name: string, order: number) => {
    const c = cur!;
    const fills: Partial<Record<PaintKey, string>> = {};
    for (const k of Object.keys(c.fills) as PaintKey[]) fills[k] = c.fills[k]!.d;
    const b = A((c.X0 + c.X1) / 2, c.Y0);
    const tp = A((c.X0 + c.X1) / 2, c.Y1);
    const sc = M.scale(500, (c.Y0 + c.Y1) / 2);
    const wl = A(c.X0, c.Y0);
    const wr = A(c.X1, c.Y0);
    parts.push({name, fills, ink: c.ink.d, thin: c.thin.d, hair: c.hair.d, baseY: b[1], baseX: b[0], inkK: Math.max(0.45, Math.min(1, sc / s0)), order, j: r0.next(), w: Math.abs(wr[0] - wl[0]), h: Math.abs(b[1] - tp[1])});
    cur = null;
  };
  const P = (pts: [number, number][]) => pts.map(([x, y]) => A(x, y));
  const F = (k: PaintKey) => {
    const c = cur!;
    return (c.fills[k] ??= new PathBuf());
  };
  const L = (w: 'ink' | 'thin' | 'hair', x1: number, y1: number, x2: number, y2: number, s: string, over: [number, number] = [4, 8], breaks = true) => {
    const a = A(x1, y1);
    const b = A(x2, y2);
    cur![w].raw(line(a[0], a[1], b[0], b[1], {seed: `${seed}/${s}`, over, breaks}));
  };
  const quiet = back; // upper storeys carry no inner ink in backlight

  // ---- steps (Y 0..180), stepped sides
  begin(0, 180, -150, 1150);
  const nSteps = 12;
  const sh = 180 / nSteps;
  F('stone').poly(P([[-150, 0], [1150, 0], [1150 - nSteps * 6, 180], [-150 + nSteps * 6, 180]]));
  for (let i = 0; i < nSteps; i++) {
    const y = i * sh;
    const xa = -150 + i * 6;
    const xb = 1150 - i * 6;
    F('shade').poly(P([[xa, y], [xb, y], [xb, y + sh * 0.62], [xa, y + sh * 0.62]]));
    F('lit').poly(P([[xa, y + sh * 0.62], [xb, y + sh * 0.62], [xb - 6, y + sh], [xa + 6, y + sh]]));
    if (!back) L(i % 3 === 0 ? 'ink' : 'thin', xa - 20, y + sh * 0.62, xb + 20, y + sh * 0.62, `st${i}`, [10, 30]);
    else if (i % 3 === 0) L('thin', xa - 20, y + sh * 0.62, xb + 20, y + sh * 0.62, `st${i}`, [10, 30]);
  }
  L('ink', -150, 0, -150 + nSteps * 6, 180, 'sl', [0, 6], false);
  L('ink', 1150, 0, 1150 - nSteps * 6, 180, 'sr', [0, 6], false);
  end('steps', 0);

  // ---- stylobate + portico recess + the central bronze door (+ two side doorways)
  begin(180, 1000, -20, 1020);
  F('stone').poly(P([[-20, 180], [1020, 180], [1020, 215], [-20, 215]]));
  L('ink', -60, 180, 1060, 180, 'sb1', [20, 40]);
  L('thin', -40, 215, 1040, 215, 'sb2', [10, 20]);
  F('dark').poly(P([[20, 215], [980, 215], [980, 1000], [20, 1000]]));
  // door: ~2.5x a person (a person on the top step is ~50 units tall here)
  const dw = 70;
  const dh = 140;
  F('door').poly(P([[500 - dw / 2, 215], [500 + dw / 2, 215], [500 + dw / 2, 215 + dh], [500 - dw / 2, 215 + dh]]));
  F('transom').poly(P([[500 - dw / 2, 215 + dh + 8], [500 + dw / 2, 215 + dh + 8], [500 + dw / 2, 215 + dh + 34], [500 - dw / 2, 215 + dh + 34]]));
  L('thin', 500 - dw / 2 - 6, 215, 500 - dw / 2 - 6, 215 + dh + 40, 'df1', [0, 4], false);
  L('thin', 500 + dw / 2 + 6, 215, 500 + dw / 2 + 6, 215 + dh + 40, 'df2', [0, 4], false);
  L('thin', 500 - dw / 2 - 12, 215 + dh + 40, 500 + dw / 2 + 12, 215 + dh + 40, 'df3', [4, 8], false);
  L('hair', 500 - dw / 2 - 2, 215 + dh + 4, 500 + dw / 2 + 2, 215 + dh + 4, 'df4', [0, 0], false);
  L('hair', 500, 215, 500, 215 + dh, 'dm', [0, 0], false);
  for (const k of [0.32, 0.66]) L('hair', 500 - dw / 2 + 6, 215 + dh * k, 500 + dw / 2 - 6, 215 + dh * k, `dp${k}`, [0, 0], false);
  for (const dx of [250, 750]) {
    F('door').poly(P([[dx - 30, 215], [dx + 30, 215], [dx + 30, 330], [dx - 30, 330]]));
    L('hair', dx - 34, 215, dx - 34, 334, `sd${dx}a`, [0, 2], false);
    L('hair', dx + 34, 215, dx + 34, 334, `sd${dx}b`, [0, 2], false);
    L('hair', dx - 38, 334, dx + 38, 334, `sd${dx}c`, [2, 4], false);
  }
  end('portico', 2 + columns * 0.35 + 0.05);

  // ---- columns (each its own part: they pop left -> right)
  const cs = 880 / (columns - 1);
  for (let i = 0; i < columns; i++) {
    const x = 60 + i * cs;
    const r = 47;
    begin(215, 1000, x - 52, x + 52);
    F('stone').poly(P([[x - 44, 215], [x + 44, 215], [x + 44, 250], [x - 44, 250]]));
    F('stone').poly(P([[x - r, 250], [x + r, 250], [x + r * 0.9, 960], [x - r * 0.9, 960]]));
    F('stone').poly(P([[x - 48, 960], [x + 48, 960], [x + 52, 1000], [x - 52, 1000]]));
    // shade on the left 30% of the shaft; a lit strip on the right edge over 40-70 % of it (from the top)
    F('shade').poly(P([[x - r, 250], [x - r * 0.3, 250], [x - r * 0.27, 960], [x - r * 0.9, 960]]));
    const litLen = r0.range(0.4, 0.7);
    const y0 = 960 - (960 - 250) * litLen;
    const xe = (Y: number) => x + r * (1 - (0.1 * (Y - 250)) / 710);
    const ws = r * (back ? 0.12 : 0.2);
    F(back ? 'rim' : 'lit').poly(P([[xe(y0) - ws, y0], [xe(y0), y0], [xe(960), 960], [xe(960) - ws, 960]]));
    // the entablature's shadow across the top of the shafts
    F('shade').poly(P([[x - r * 0.9, 900], [x + r * 0.9, 900], [x + r * 0.9, 960], [x - r * 0.9, 960]]));
    if (!back) {
      L('ink', x - r, 250, x - r * 0.9, 960, `cl${i}`, [2, 6], false);
      L('ink', x + r, 250, x + r * 0.9, 960, `cr${i}`, [2, 6], false);
      L('hair', x - r * 0.15, 270, x - r * 0.13, 940, `cf${i}a`, [0, 0], false);
    } else {
      L('thin', x - r, 250, x - r * 0.9, 960, `cl${i}`, [2, 4], false);
      L('thin', x + r, 250, x + r * 0.9, 960, `cr${i}`, [2, 4], false);
    }
    // base + capital: two short doubled ink lines each
    L('thin', x - 50, 222, x + 50, 222, `cb${i}a`, [3, 5], false);
    L('thin', x - 46, 246, x + 46, 246, `cb${i}b`, [3, 5], false);
    if (!back) {
      L('thin', x - 50, 964, x + 50, 964, `cc${i}a`, [3, 5], false);
      L('thin', x - 54, 996, x + 54, 996, `cc${i}b`, [3, 5], false);
    }
    end(`col${i}`, 2 + i * 0.35);
  }

  // ---- entablature (Y 1000..1190)
  begin(1000, 1190, -40, 1040);
  F('stone').poly(P([[-10, 1000], [1010, 1000], [1010, 1060], [-10, 1060]]));
  F('shade').poly(P([[-10, 1060], [1010, 1060], [1010, 1150], [-10, 1150]]));
  F('lit').poly(P([[-40, 1150], [1040, 1150], [1040, 1190], [-40, 1190]]));
  if (back) F('rim').poly(P([[1010 - 9, 1000], [1010, 1000], [1010, 1150], [1010 - 9, 1150]]));
  L('ink', -60, 1000, 1060, 1000, 'e1', [30, 50]);
  if (!quiet) {
    L('thin', -30, 1060, 1030, 1060, 'e2', [10, 20]);
    L('ink', -70, 1150, 1070, 1150, 'e3', [30, 60]);
    for (let x = -30; x < 1030; x += 26) L('hair', x, 1150, x, 1138, `de${x}`, [0, 0], false);
  }
  L('ink', -60, 1190, 1060, 1190, 'e4', [20, 40]);
  end('entablature', 2 + columns * 0.35 + 0.3);

  // ---- pediment (Y 1190..1470)
  begin(1190, 1470, -40, 1040);
  F('stone').poly(P([[-40, 1190], [1040, 1190], [500, 1470]]));
  F(back ? 'lit' : 'shade').poly(P([[40, 1215], [960, 1215], [500, 1430]]));
  if (back) F('rim').poly(P([[500, 1470], [1040, 1190], [1040 - 30, 1190], [500, 1470 - 18]]));
  L('ink', -60, 1190, 520, 1480, 'p1', [10, 20], false);
  L('ink', 1060, 1190, 480, 1480, 'p2', [10, 20], false);
  if (!quiet) {
    L('thin', 40, 1215, 500, 1430, 'p3', [4, 6], false);
    L('thin', 960, 1215, 500, 1430, 'p4', [4, 6], false);
  }
  end('pediment', 2 + columns * 0.35 + 0.8);

  let emblemPart = parts.length - 1;
  // ---- drum + dome + lantern + flagpole
  if (dome) {
    begin(1400, 1900, 230, 770);
    F('stone').poly(P([[260, 1400], [740, 1400], [740, 1900], [260, 1900]]));
    F('shade').poly(P([[260, 1400], [330, 1400], [330, 1900], [260, 1900]]));
    if (back) F('rim').poly(P([[740 - 10, 1420], [740, 1420], [740, 1880], [740 - 10, 1880]]));
    // window slots (fill-only, framed by the drum's pilasters in front light)
    // window slots: dark in front light; one shade step (teal) in backlight, so a caption over them stays >= 3:1
    for (let x = 320; x < 700; x += 60) F(back ? 'shade' : 'dark').poly(P([[x, 1560], [x + 26, 1560], [x + 26, 1650], [x, 1650]]));
    if (!quiet) for (let x = 290; x <= 710; x += 60) L('thin', x, 1470, x, 1880, `dp${x}`, [0, 0], false);
    if (!quiet) L('ink', 230, 1900, 770, 1900, 'dc', [16, 24]);
    L(quiet ? 'thin' : 'ink', 260, 1420, 260, 1900, 'dl', [0, 10], false);
    L(quiet ? 'thin' : 'ink', 740, 1420, 740, 1900, 'dr', [0, 10], false);
    end('drum', 2 + columns * 0.35 + 1.3);
    if (emblemY > 1470) emblemPart = parts.length - 1;
    // dome: half ellipse (sampled, mapped), shade on the left third, ribs (front light only)
    begin(1900, 2230, 250, 750);
    const rx = 250;
    const ry = 330;
    const pts: [number, number][] = [];
    for (let i = 0; i <= 24; i++) {
      const a = Math.PI - (Math.PI * i) / 24;
      pts.push([500 + Math.cos(a) * rx, 1900 + Math.sin(a) * ry]);
    }
    F('dome').poly(P(pts));
    const sh2: [number, number][] = pts.filter(([x]) => x <= 420);
    sh2.push([420, 1900 + Math.sqrt(Math.max(0, 1 - ((420 - 500) / rx) ** 2)) * ry], [420, 1900]);
    F('domeShade').poly(P(sh2));
    if (back) {
      // peach rim along the sun-facing (right) shoulder of the dome
      const rimPts: [number, number][] = pts.filter(([x]) => x >= 560);
      const inner = rimPts.map(([x, y]) => [500 + (x - 500) * 0.955, 1900 + (y - 1900) * 0.97] as [number, number]).reverse();
      F('rim').poly(P([...rimPts, ...inner]));
    }
    let outline = '';
    pts.forEach(([x, y], i) => {
      const sp = A(x, y);
      outline += `${i ? 'L' : 'M'}${r1(sp[0])} ${r1(sp[1])}`;
    });
    (quiet ? cur!.thin : cur!.ink).raw(outline);
    if (!quiet) {
      for (const k of [-0.6, -0.25, 0.25, 0.6]) {
        let rib = '';
        for (let i = 0; i <= 12; i++) {
          const a = (Math.PI / 2) * (i / 12);
          const sp = A(500 + Math.sin(a) * rx * k * 1.0, 1900 + Math.cos(a) * ry * (1 - 0.02 * Math.abs(k)));
          rib += `${i ? 'L' : 'M'}${r1(sp[0])} ${r1(sp[1])}`;
        }
        cur!.hair.raw(rib);
      }
    }
    end('dome', 2 + columns * 0.35 + 1.8);
    // lantern + flagpole
    begin(2215, 2900, 440, 560);
    F('stone').poly(P([[455, 2215], [545, 2215], [545, 2390], [455, 2390]]));
    if (!quiet) for (const x of [470, 500, 530]) L('hair', x, 2225, x, 2380, `ln${x}`, [0, 0], false);
    F('dome').poly(P([[440, 2390], [560, 2390], [535, 2440], [500, 2460], [465, 2440]]));
    if (!quiet) L('thin', 440, 2390, 560, 2390, 'lt', [6, 8], false);
    L('thin', 455, 2215, 455, 2390, 'll', [0, 4], false);
    L('thin', 545, 2215, 545, 2390, 'lr', [0, 4], false);
    L('thin', 500, 2460, 500, 2880, 'fp', [0, 0], false);
    end('lantern', 2 + columns * 0.35 + 2.2);
  }
  // emblem disc lives in its part (pediment or drum)
  const ec = A(500, emblemY);
  const er = M.scale(500, emblemY) * (emblemY > 1470 ? 44 : 62);
  const ep = parts[emblemPart];
  ep.fills.disc = (ep.fills.disc ?? '') + new PathBuf().circle(ec[0], ec[1], er).d;
  return {parts, emblem: {x: ec[0], y: ec[1], r: er}, flagPole: A(500, 2880), flagScale: M.scale(500, 2800), emblemPart};
}

const GEO_CACHE = new Map<string, Geo>();

type PaintMap = Record<PaintKey, string>;

function paints(p: TodPalette, back: boolean, lit: boolean): PaintMap {
  const dark = p.stars > 0.3;
  if (back) {
    const night = dark || p.name === 'dusk';
    return night
      ? {stone: palette.tealDark, lit: palette.teal, shade: deep.teal78, dark: deep.teal60, door: palette.brown, transom: lit ? palette.peach : palette.teal, dome: palette.teal, domeShade: palette.tealDark, rim: palette.peach, disc: palette.teal}
      : {stone: palette.sage, lit: mix(palette.sky, palette.teal, 0.45), shade: palette.teal, dark: palette.tealDark, door: palette.brown, transom: lit ? palette.peach : palette.sage, dome: mix(palette.sky, palette.teal, 0.45), domeShade: palette.sage, rim: palette.peach, disc: mix(palette.sky, palette.teal, 0.45)};
  }
  return {
    stone: ambient(palette.cream, p),
    lit: ambient(palette.white, p),
    shade: ambient(palette.sand, p),
    dark: ambient(palette.tealDark, p),
    door: palette.brown,
    transom: lit ? palette.peach : ambient(palette.sage, p),
    dome: ambient(palette.sage, p),
    domeShade: ambient(darker(palette.sage), p),
    rim: ambient(palette.white, p),
    disc: palette.white,
  };
}

export const Monument: React.FC<MonumentProps> = ({
  cx,
  by,
  bw,
  ty,
  taper,
  tod = 'day',
  light = 'front',
  columns = 8,
  dome = true,
  flag = true,
  people = 30,
  doorPeople = 3,
  lit,
  seed = 'mon',
  inkW = stroke.inkBold,
  emblem,
  emblemY = 1300,
  emblemAt,
  build,
  peopleAt,
}) => {
  const S = useCineState();
  const t = S.t;
  const p = todPal(tod);
  const back = light === 'back';
  const key = JSON.stringify([cx, by, bw, ty, taper, columns, dome, back, emblemY, seed]);
  let G = GEO_CACHE.get(key);
  if (!G) {
    G = buildGeo({cx, by, bw, ty, taper}, columns, dome, back, emblemY, seed);
    if (GEO_CACHE.size > 50) GEO_CACHE.clear();
    GEO_CACHE.set(key, G);
  }
  const M = useMemo(() => monumentMap({cx, by, bw, ty, taper}), [cx, by, bw, ty, taper]);
  const PM = paints(p, back, lit ?? p.stars > 0.3);
  const maxOrder = Math.max(...G.parts.map((q) => q.order));
  // per-part state: build pop (rise from its base), exit shrink, paper / ink
  const st = G.parts.map((part) => {
    let k = 1;
    let ink = S.look.ink;
    if (build) {
      const t0 = build.at + ((build.dur ?? 2.6) * part.order) / Math.max(1, maxOrder);
      if (t < t0) return {k: 0, ink: false, paper: false};
      const u = prog(t, t0, 0.26);
      k = u >= 1 ? 1 : E.outBack(1.5)(u);
      ink = ink && t >= t0 + 0.12;
    }
    if (S.e > 0) {
      k *= exitScale(S.e, part.j, Math.min(0.7, screenSize(S.m, part.w, part.h)));
      ink = ink && !inkGone(S.e, part.j);
    }
    return {k, ink, paper: isPaper(S, [part.baseX, part.baseY - part.h / 2])};
  });

  const out: React.ReactNode[] = [];
  const W = {ink: inkW, thin: stroke.inkThin, hair: stroke.inkHair};
  // parts in construction order (back to front: the portico recess sits behind the columns)
  G.parts.forEach((part, i) => {
    const x0 = st[i];
    if (x0.k <= 0.002) return;
    const node: React.ReactNode[] = [];
    if (S.look.fills !== 'none') {
      if (x0.paper) {
        const d = PAINTS.filter((k) => k !== 'rim' && k !== 'disc').map((k) => part.fills[k] ?? '').join('');
        if (d) node.push(<path key="pw" d={d} fill={palette.white} />);
      } else
        for (const k of PAINTS) {
          const d = k === 'disc' ? '' : part.fills[k];
          if (d) node.push(<path key={k} d={d} fill={PM[k]} />);
        }
    }
    if (x0.ink) {
      // ink thins with height (inkK per part)
      for (const w of ['hair', 'thin', 'ink'] as const) {
        const d = part[w];
        if (d) node.push(<path key={w} d={d} fill="none" stroke={palette.ink} strokeWidth={r1(W[w] * part.inkK * 10) / 10} strokeLinecap="round" strokeLinejoin="round" />);
      }
    }
    out.push(
      x0.k === 1 ? (
        <React.Fragment key={i}>{node}</React.Fragment>
      ) : (
        <g key={i} transform={`translate(0 ${r1(part.baseY)}) scale(1 ${x0.k.toFixed(4)}) translate(0 ${r1(-part.baseY)})`}>
          {node}
        </g>
      ),
    );
  });

  // emblem: with its part, or popping at emblemAt
  const ep = st[G.emblemPart];
  const emK = emblemAt === undefined ? ep.k : ep.k * E.outBack(1.8)(prog(t, emblemAt, 0.22));
  if (emK > 0.01 && S.look.fills !== 'none') {
    const {x, y, r} = G.emblem;
    out.push(
      <g key="emblem" transform={emK !== 1 ? `translate(${r1(x)} ${r1(y)}) scale(${emK.toFixed(3)}) translate(${r1(-x)} ${r1(-y)})` : undefined}>
        <circle cx={x} cy={y} r={r} fill={back && !ep.paper ? palette.cream : palette.white} />
        {ep.ink ? <circle cx={x} cy={y} r={r} fill="none" stroke={palette.ink} strokeWidth={stroke.ink * ep.k} /> : null}
        {ep.ink && emblem ? emblem(x, y, r) : null}
      </g>,
    );
  }

  // flag: a waving quad at the top of the pole (pops with the lantern)
  const lp = st[st.length - 1];
  if (flag && dome && lp.k >= 1) {
    const [fx, fy] = G.flagPole;
    const k = G.flagScale;
    const fw = 130 * k;
    const fh = 80 * k;
    const w1 = osc(t, 1.1, 0) * fh * 0.12;
    const w2 = osc(t, 1.1, 1.4) * fh * 0.16;
    const flagD = `M${r1(fx)} ${r1(fy)}Q${r1(fx + fw * 0.5)} ${r1(fy + w1)} ${r1(fx + fw)} ${r1(fy + w2)}L${r1(fx + fw)} ${r1(fy + fh + w2)}Q${r1(fx + fw * 0.5)} ${r1(fy + fh + w1)} ${r1(fx)} ${r1(fy + fh)}Z`;
    out.push(
      <React.Fragment key="flag">
        {S.look.fills !== 'none' ? <path d={flagD} fill={lp.paper ? palette.white : palette.peach} transform="translate(2 1.5)" /> : null}
        {lp.ink ? <path d={flagD} fill="none" stroke={palette.ink} strokeWidth={stroke.inkThin} strokeLinejoin="round" /> : null}
      </React.Fragment>,
    );
  }

  // people: on the steps (sized by step depth) and beside the door, as kit Persons (back view, legs)
  const spots = useMemo(() => {
    const r = rng(`monppl/${seed}`);
    const list = Array.from({length: people}, () => {
      const step = r.int(0, 11);
      return {X: r.range(-60, 1060), step, walk: r.chance(0.35) ? r.sign() * r.range(8, 22) : 0, ph: r.range(0, 6.28), d: false};
    });
    for (let i = 0; i < doorPeople; i++) list.push({X: 500 + (i % 2 ? 1 : -1) * (70 + 40 * Math.floor(i / 2)) + r.jitter(10), step: 12, walk: 0, ph: r.range(0, 6.28), d: true});
    return list;
  }, [people, doorPeople, seed]);
  const portico = st[1];
  const steps = st[0];
  const ppl: React.ReactNode[] = [];
  const order2 = spots
    .map((s, i) => ({...s, i}))
    .sort((a, b) => b.step - a.step)
    .filter((s) => (s.d ? portico.k >= 1 : steps.k >= 1));
  for (const s of order2) {
    const Y = s.d ? 215 : s.step * 15 + 10;
    const X = s.X + s.walk * t;
    const [x, y] = M.at(X, Y);
    // 0.032 H on the lowest step -> 0.022 H on the top one (never under the 40 px legibility floor)
    let h = Math.max(40, 1920 * (s.d ? 0.026 : 0.032 - (0.01 * s.step) / 11));
    if (peopleAt) {
      const a0 = peopleAt.at + (peopleAt.span ?? 1.2) * (s.d ? 0.2 : 1 - s.step / 11) * 0.8 + jit(s.i) * 0.2;
      if (t < a0) continue;
      h *= E.outBack(1.6)(prog(t, a0, 0.22));
    }
    h *= exitScale(S.e, jit(s.i + 9), 0.01);
    if (h < 2) continue;
    const sc = h / PERSON_H;
    const bob = s.walk ? Math.abs(Math.sin(t * 7 + s.ph)) * h * 0.03 : 0;
    ppl.push(<Person key={`p${s.i}`} x={x} y={y - bob - PERSON_FEET * sc} s={sc} legs seed={`${seed}/pp${s.i}`} ink={personInk(h)} lod={1} idle={s.walk ? 0 : 0.6} />);
  }
  if (ppl.length) out.push(back ? <FlatColor key="ppl" color={p.stars > 0.3 || p.name === 'dusk' ? deep.teal60 : palette.tealDark}>{ppl}</FlatColor> : <React.Fragment key="ppl">{ppl}</React.Fragment>);
  return <>{out}</>;
};
