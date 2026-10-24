// cine/monument.tsx — Monument: a colossal civic / government building (steps, colonnade, entablature, pediment
// with an emblem, drum, dome, lantern, flag) drawn in ELEVATION units and mapped through a worm's-eye homography,
// so verticals converge upward and the upper parts foreshorten. Straight lines stay straight under the map, so
// polygons map exactly; the ink is drawn after mapping (hand-drawn wobble stays screen-sized). Batched fills.
// Tiny back-view people on the steps give the scale.
//
//   <Monument cx={540} by={1880} bw={1500} ty={-1500} tod="golden" people={40} />
//   const M = monumentMap({cx, by, bw, ty});  M.at(500, 1300) -> screen point of the pediment emblem
//
// Elevation units: X 0..1000 = the colonnade (steps reach -150..1150), Y 0 = foot of the steps, up to 2900 (flag).

import React, {useMemo} from 'react';
import {palette, stroke} from '../theme';
import {osc, useTime} from '../time';
import {rng, Seed} from '../rng';
import {line, Pt} from '../sketch';
import {ambient, Tod, TodPalette, todPal} from './atmosphere';
import {darker} from './city';
import {quadMap, UV} from './persp';
import {tinyFigure} from './figures';
import {PathBuf, r1} from './util';

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
  columns?: number;
  dome?: boolean;
  flag?: boolean;
  /** Tiny people on the steps and plaza. */
  people?: number;
  /** Doors' transoms lit (peach). */
  lit?: boolean;
  seed?: Seed;
  /** Ink width of the main lines (screen px). */
  inkW?: number;
  /** Emblem overlay renderer (screen centre + radius), e.g. a clock or a power symbol. */
  emblem?: (x: number, y: number, r: number) => React.ReactNode;
};

type Geo = {
  stone: string;
  stoneLit: string;
  stoneShade: string;
  dark: string;
  doors: string;
  transoms: string;
  dome: string;
  domeShade: string;
  ink: string;
  thin: string;
  hair: string;
  emblem: {x: number; y: number; r: number};
  flagPole: Pt;
  flagScale: number;
};

function buildGeo(g: MonumentGeo, columns: number, dome: boolean, seed: Seed): Geo {
  const M = monumentMap(g);
  const A = M.at;
  const stone = new PathBuf();
  const stoneLit = new PathBuf();
  const stoneShade = new PathBuf();
  const dark = new PathBuf();
  const doors = new PathBuf();
  const transoms = new PathBuf();
  const domeF = new PathBuf();
  const domeS = new PathBuf();
  const ink = new PathBuf();
  const thin = new PathBuf();
  const hair = new PathBuf();
  const P = (pts: [number, number][]) => pts.map(([x, y]) => A(x, y));
  const L = (pb: PathBuf, x1: number, y1: number, x2: number, y2: number, s: string, over: [number, number] = [4, 8], breaks = true) => {
    const a = A(x1, y1);
    const b = A(x2, y2);
    pb.raw(line(a[0], a[1], b[0], b[1], {seed: `${seed}/${s}`, over, breaks}));
  };

  // ---- steps (Y 0..180), stepped sides
  const nSteps = 12;
  const sh = 180 / nSteps;
  stone.poly(P([[-150, 0], [1150, 0], [1150 - nSteps * 6, 180], [-150 + nSteps * 6, 180]]));
  for (let i = 0; i < nSteps; i++) {
    const y = i * sh;
    const xa = -150 + i * 6;
    const xb = 1150 - i * 6;
    // riser in shade, tread (top of each step) lit
    stoneShade.poly(P([[xa, y], [xb, y], [xb, y + sh * 0.62], [xa, y + sh * 0.62]]));
    stoneLit.poly(P([[xa, y + sh * 0.62], [xb, y + sh * 0.62], [xb - 6, y + sh], [xa + 6, y + sh]]));
    L(i % 3 === 0 ? ink : thin, xa - 20, y + sh * 0.62, xb + 20, y + sh * 0.62, `st${i}`, [10, 30]);
  }
  L(ink, -150, 0, -150 + nSteps * 6, 180, 'sl', [0, 6], false);
  L(ink, 1150, 0, 1150 - nSteps * 6, 180, 'sr', [0, 6], false);

  // ---- stylobate (Y 180..215)
  stone.poly(P([[-20, 180], [1020, 180], [1020, 215], [-20, 215]]));
  L(ink, -60, 180, 1060, 180, 'sb1', [20, 40]);
  L(thin, -40, 215, 1040, 215, 'sb2', [10, 20]);

  // ---- portico recess (dark) + doors
  dark.poly(P([[20, 215], [980, 215], [980, 1000], [20, 1000]]));
  const doorX = [250, 500, 750];
  for (const dx of doorX) {
    const w = dx === 500 ? 150 : 115;
    const top = dx === 500 ? 600 : 540;
    doors.poly(P([[dx - w / 2, 215], [dx + w / 2, 215], [dx + w / 2, top], [dx - w / 2, top]]));
    transoms.poly(P([[dx - w / 2, top + 25], [dx + w / 2, top + 25], [dx + w / 2, top + 110], [dx - w / 2, top + 110]]));
    // door panels + frame
    L(thin, dx, 215, dx, top, `dm${dx}`, [0, 0], false);
    for (const k of [0.3, 0.62]) L(hair, dx - w / 2 + 12, 215 + (top - 215) * k, dx + w / 2 - 12, 215 + (top - 215) * k, `dp${dx}${k}`, [0, 0], false);
    L(thin, dx - w / 2 - 8, top + 4, dx + w / 2 + 8, top + 4, `dt${dx}`, [6, 10], false);
  }

  // ---- columns
  const cs = 880 / (columns - 1);
  for (let i = 0; i < columns; i++) {
    const x = 60 + i * cs;
    const r = 47;
    // base, shaft, capital
    stone.poly(P([[x - 44, 215], [x + 44, 215], [x + 44, 250], [x - 44, 250]]));
    stone.poly(P([[x - r, 250], [x + r, 250], [x + r * 0.9, 960], [x - r * 0.9, 960]]));
    stone.poly(P([[x - 48, 960], [x + 48, 960], [x + 52, 1000], [x - 52, 1000]]));
    // shade on the left 30% of the shaft, rim light on the right edge
    stoneShade.poly(P([[x - r, 250], [x - r * 0.3, 250], [x - r * 0.27, 960], [x - r * 0.9, 960]]));
    stoneLit.poly(P([[x + r * 0.8, 250], [x + r, 250], [x + r * 0.9, 960], [x + r * 0.72, 960]]));
    // the entablature's shadow across the top of the shafts
    stoneShade.poly(P([[x - r * 0.9, 900], [x + r * 0.9, 900], [x + r * 0.9, 960], [x - r * 0.9, 960]]));
    L(ink, x - r, 250, x - r * 0.9, 960, `cl${i}`, [2, 6], false);
    L(ink, x + r, 250, x + r * 0.9, 960, `cr${i}`, [2, 6], false);
    L(hair, x - r * 0.15, 270, x - r * 0.13, 940, `cf${i}a`, [0, 0], false);
    L(hair, x + r * 0.35, 270, x + r * 0.32, 940, `cf${i}b`, [0, 0], false);
    L(thin, x - 52, 1000, x + 52, 1000, `cc${i}`, [3, 5], false);
    L(thin, x - 46, 250, x + 46, 250, `cb${i}`, [3, 5], false);
  }

  // ---- entablature (Y 1000..1190)
  stone.poly(P([[-10, 1000], [1010, 1000], [1010, 1060], [-10, 1060]]));
  stoneShade.poly(P([[-10, 1060], [1010, 1060], [1010, 1150], [-10, 1150]]));
  stoneLit.poly(P([[-40, 1150], [1040, 1150], [1040, 1190], [-40, 1190]]));
  L(ink, -60, 1000, 1060, 1000, 'e1', [30, 50]);
  L(thin, -30, 1060, 1030, 1060, 'e2', [10, 20]);
  L(ink, -70, 1150, 1070, 1150, 'e3', [30, 60]);
  L(ink, -60, 1190, 1060, 1190, 'e4', [20, 40]);
  // inscription dashes in the frieze
  const r0 = rng(`mon/${seed}`);
  for (let x = 120; x < 880; x += r0.range(28, 44)) {
    if (Math.abs(x - 500) < 40) continue;
    L(hair, x, 1105, x + r0.range(12, 26), 1105, `in${x.toFixed(0)}`, [0, 0], false);
  }
  // dentils under the cornice
  for (let x = -30; x < 1030; x += 26) L(hair, x, 1150, x, 1138, `de${x}`, [0, 0], false);

  // ---- pediment (Y 1190..1470)
  stone.poly(P([[-40, 1190], [1040, 1190], [500, 1470]]));
  stoneShade.poly(P([[40, 1215], [960, 1215], [500, 1430]]));
  L(ink, -60, 1190, 520, 1480, 'p1', [10, 20], false);
  L(ink, 1060, 1190, 480, 1480, 'p2', [10, 20], false);
  L(thin, 40, 1215, 500, 1430, 'p3', [4, 6], false);
  L(thin, 960, 1215, 500, 1430, 'p4', [4, 6], false);
  const ec = A(500, 1300);
  const er = M.scale(500, 1300) * 62;

  // ---- drum + dome + lantern + flagpole
  if (dome) {
    stone.poly(P([[260, 1400], [740, 1400], [740, 1900], [260, 1900]]));
    stoneShade.poly(P([[260, 1400], [330, 1400], [330, 1900], [260, 1900]]));
    for (let x = 290; x <= 710; x += 60) L(thin, x, 1470, x, 1880, `dp${x}`, [0, 0], false);
    for (let x = 320; x < 700; x += 60) dark.poly(P([[x, 1600], [x + 30, 1600], [x + 30, 1760], [x, 1760]]));
    L(ink, 230, 1900, 770, 1900, 'dc', [16, 24]);
    L(ink, 260, 1470, 260, 1900, 'dl', [0, 10], false);
    L(ink, 740, 1470, 740, 1900, 'dr', [0, 10], false);
    // dome: half ellipse (sampled, mapped), shade on the left third, ribs
    const rx = 250;
    const ry = 330;
    const pts: [number, number][] = [];
    for (let i = 0; i <= 24; i++) {
      const a = Math.PI - (Math.PI * i) / 24;
      pts.push([500 + Math.cos(a) * rx, 1900 + Math.sin(a) * ry]);
    }
    domeF.poly(P(pts));
    const sh2: [number, number][] = pts.filter(([x]) => x <= 420);
    sh2.push([420, 1900 + Math.sqrt(Math.max(0, 1 - ((420 - 500) / rx) ** 2)) * ry], [420, 1900]);
    domeS.poly(P(sh2));
    let outline = '';
    pts.forEach(([x, y], i) => {
      const s = A(x, y);
      outline += `${i ? 'L' : 'M'}${r1(s[0])} ${r1(s[1])}`;
    });
    ink.raw(outline);
    for (const k of [-0.6, -0.25, 0.25, 0.6]) {
      let rib = '';
      for (let i = 0; i <= 12; i++) {
        const a = (Math.PI / 2) * (i / 12);
        const s = A(500 + Math.sin(a) * rx * k * 1.0, 1900 + Math.cos(a) * ry * (1 - 0.02 * Math.abs(k)));
        rib += `${i ? 'L' : 'M'}${r1(s[0])} ${r1(s[1])}`;
      }
      hair.raw(rib);
    }
    // lantern
    stone.poly(P([[455, 2215], [545, 2215], [545, 2390], [455, 2390]]));
    for (const x of [470, 500, 530]) L(hair, x, 2225, x, 2380, `ln${x}`, [0, 0], false);
    domeF.poly(P([[440, 2390], [560, 2390], [535, 2440], [500, 2460], [465, 2440]]));
    L(thin, 440, 2390, 560, 2390, 'lt', [6, 8], false);
    L(thin, 455, 2215, 455, 2390, 'll', [0, 4], false);
    L(thin, 545, 2215, 545, 2390, 'lr', [0, 4], false);
    L(thin, 500, 2460, 500, 2880, 'fp', [0, 0], false);
  }
  return {
    stone: stone.d,
    stoneLit: stoneLit.d,
    stoneShade: stoneShade.d,
    dark: dark.d,
    doors: doors.d,
    transoms: transoms.d,
    dome: domeF.d,
    domeShade: domeS.d,
    ink: ink.d,
    thin: thin.d,
    hair: hair.d,
    emblem: {x: ec[0], y: ec[1], r: er},
    flagPole: A(500, 2880),
    flagScale: M.scale(500, 2800),
  };
}

const GEO_CACHE = new Map<string, Geo>();

export const Monument: React.FC<MonumentProps> = ({cx, by, bw, ty, taper, tod = 'day', columns = 8, dome = true, flag = true, people = 30, lit, seed = 'mon', inkW = stroke.inkBold, emblem}) => {
  const t = useTime();
  const p = todPal(tod);
  const key = JSON.stringify([cx, by, bw, ty, taper, columns, dome, seed]);
  let G = GEO_CACHE.get(key);
  if (!G) {
    G = buildGeo({cx, by, bw, ty, taper}, columns, dome, seed);
    if (GEO_CACHE.size > 50) GEO_CACHE.clear();
    GEO_CACHE.set(key, G);
  }
  const M = useMemo(() => monumentMap({cx, by, bw, ty, taper}), [cx, by, bw, ty, taper]);
  const spots = useMemo(() => {
    const r = rng(`monppl/${seed}`);
    return Array.from({length: people}, () => {
      const step = r.int(0, 11);
      return {X: r.range(-60, 1060), Y: step * 15 + 10, walk: r.chance(0.35) ? r.sign() * r.range(8, 22) : 0, ph: r.range(0, 6.28)};
    });
  }, [people, seed]);

  const stoneC = ambient(palette.cream, p);
  const litC = ambient(palette.white, p);
  const shadeC = ambient(palette.sand, p);
  const darkC = ambient(palette.tealDark, p);
  const domeC = ambient(palette.sage, p);
  const domeShade = ambient(darker(palette.sage), p);

  // people (tiny, walking along the steps), far (higher) first
  const ph = new PathBuf();
  const pb = new PathBuf();
  const pl = new PathBuf();
  spots
    .map((s) => ({...s, X: s.X + s.walk * t}))
    .sort((a, b) => b.Y - a.Y)
    .forEach((s) => {
      const [x, y] = M.at(s.X, s.Y);
      const h = M.scale(s.X, s.Y) * 30;
      tinyFigure(ph, pb, pl, x, y - (s.walk ? Math.abs(Math.sin(t * 7 + s.ph)) * h * 0.04 : 0), h);
    });

  // flag: a waving quad at the top of the pole
  let flagD = '';
  if (flag && dome) {
    const [fx, fy] = G.flagPole;
    const k = G.flagScale;
    const fw = 130 * k;
    const fh = 80 * k;
    const w1 = osc(t, 1.1, 0) * fh * 0.12;
    const w2 = osc(t, 1.1, 1.4) * fh * 0.16;
    flagD = `M${r1(fx)} ${r1(fy)}Q${r1(fx + fw * 0.5)} ${r1(fy + w1)} ${r1(fx + fw)} ${r1(fy + w2)}L${r1(fx + fw)} ${r1(fy + fh + w2)}Q${r1(fx + fw * 0.5)} ${r1(fy + fh + w1)} ${r1(fx)} ${r1(fy + fh)}Z`;
  }

  return (
    <>
      <path d={G.stone} fill={stoneC} />
      <path d={G.dark} fill={darkC} />
      <path d={G.doors} fill={ambient(darker(palette.tealDark), p)} />
      <path d={G.transoms} fill={lit ?? p.stars > 0.3 ? palette.peach : ambient(palette.sage, p)} />
      <path d={G.stoneShade} fill={shadeC} />
      <path d={G.stoneLit} fill={litC} />
      {G.dome ? <path d={G.dome} fill={domeC} /> : null}
      {G.domeShade ? <path d={G.domeShade} fill={domeShade} /> : null}
      <circle cx={G.emblem.x} cy={G.emblem.y} r={G.emblem.r} fill={palette.white} />
      <path d={G.hair} fill="none" stroke={palette.ink} strokeWidth={stroke.inkHair} strokeLinecap="round" />
      <path d={G.thin} fill="none" stroke={palette.ink} strokeWidth={stroke.inkThin} strokeLinecap="round" />
      <path d={G.ink} fill="none" stroke={palette.ink} strokeWidth={inkW} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={G.emblem.x} cy={G.emblem.y} r={G.emblem.r} fill="none" stroke={palette.ink} strokeWidth={stroke.ink} />
      {emblem ? emblem(G.emblem.x, G.emblem.y, G.emblem.r) : null}
      {flagD ? (
        <>
          <path d={flagD} fill={palette.peach} transform="translate(2 1.5)" />
          <path d={flagD} fill="none" stroke={palette.ink} strokeWidth={stroke.inkThin} strokeLinejoin="round" />
        </>
      ) : null}
      {!pl.empty ? <path d={pl.d} fill={ambient(palette.tealDark, p)} /> : null}
      {!pb.empty ? <path d={pb.d} fill={ambient(palette.teal, p)} /> : null}
      {!ph.empty ? <path d={ph.d} fill={palette.ink} /> : null}
    </>
  );
};
