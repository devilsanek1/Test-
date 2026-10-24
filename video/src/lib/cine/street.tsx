// cine/street.tsx — reference 2's street furniture and its one-point street, built on a tiny 3D projection so
// everything recedes together: utility Poles, sagging Wires, StringLights (bulbs on stems; lit bulbs get the
// stepped sage halo of ref 2 f_38), and PerspectiveStreet (road, sidewalks, facades with perspective window grids,
// poles + wires, string lights across the street, tiny walkers heading for the vanishing point).
//
//   <StringLights x1={-40} y1={140} x2={1120} y2={190} sag={50} n={14} tod="night" on={{at: 1, dur: 1.2}} />
//   <Pole x={120} y={1500} h={900} at={0.4} />
//   <PerspectiveStreet vp={[600, 1000]} tod="golden" seed="main" crowd={40} lightsOn={{at: 2, dur: 2}} />

import React, {useMemo} from 'react';
import {palette, stroke} from '../theme';
import {ease as E, osc, prog, springAt, springs, useTime} from '../time';
import {rng, Seed} from '../rng';
import {line, Pt, wirePoint} from '../sketch';
import {atmos, ambient, Tod, TodPalette, todPal} from './atmosphere';
import {darker} from './city';
import {persp1, quadMap, Quad} from './persp';
import {gridCells, SwitchEvent, switchTimes, windowPaths} from './windows';
import {personInk, PERSON_FEET, PERSON_H, tinyFigure} from './figures';
import {PathBuf, r1} from './util';
import {Person} from '../kit';
import {exitScale, inkGone, inkOn, isPaper, lookPaint, useCineState} from './state';

// ---------------------------------------------------------------- StringLights

export type StringLightsProps = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  /** Sag at the middle (px). */
  sag?: number;
  /** Number of bulbs. */
  n?: number;
  /** Bulb radius (px). */
  r?: number;
  tod?: Tod | TodPalette;
  /** Bulbs light up along the wire over [at, at + dur] (pop). Omit = lit if the tod is dark. */
  on?: {at: number; dur?: number; reverse?: boolean};
  lit?: boolean;
  /** Wind sway amplitude (px at the middle). */
  sway?: number;
  width?: number;
  seed?: Seed;
  /** Draw-on: the wire draws, then bulbs pop along it. */
  at?: number;
};

/** A sagging wire with bulbs on short stems (ref 2). Lit bulbs: peach core + sage stepped halo discs. */
export const StringLights: React.FC<StringLightsProps> = ({x1, y1, x2, y2, sag = 40, n = 12, r = 9, tod = 'day', on, lit, sway = 3, width = stroke.inkThin, seed = 'sl', at}) => {
  const S = useCineState();
  const t = S.t;
  const p = todPal(tod);
  const dark = p.stars > 0.3;
  const sg = sag + osc(t, 0.21, x1 * 0.01) * sway;
  // un-build: bulbs shrink (small first), then the wire retracts from its far end
  const bulbK = exitScale(S.e, 0.2, 0.01);
  const wireK = S.e > 0 ? 1 - E.inCubic(Math.min(1, Math.max(0, (S.e - 0.36) / 0.3))) : 1;
  const wp = (at === undefined ? 1 : E.outCubic(prog(t, at, 0.45))) * wireK;
  if (wp <= 0) return null;
  const colorOn = S.look.fills === 'color' && !isPaper(S, [(x1 + x2) / 2, (y1 + y2) / 2]);
  const cx = (x1 + x2) / 2;
  const cy = (y1 + y2) / 2 + sg * 2;
  const qa = wp; // partial wire: sub-curve [0, wp] of the quadratic
  const ex = (1 - qa) * (1 - qa) * x1 + 2 * (1 - qa) * qa * cx + qa * qa * x2;
  const ey = (1 - qa) * (1 - qa) * y1 + 2 * (1 - qa) * qa * cy + qa * qa * y2;
  const qx = x1 + qa * (cx - x1);
  const qy = y1 + qa * (cy - y1);
  const wireD = `M${r1(x1)} ${r1(y1)}Q${r1(qx)} ${r1(qy)} ${r1(ex)} ${r1(ey)}`;
  const stems = new PathBuf();
  const outline = new PathBuf();
  const fillOff = new PathBuf();
  const fillOn = new PathBuf();
  const halo = new PathBuf();
  const halo2 = new PathBuf();
  for (let i = 0; i < n; i++) {
    const u = (i + 0.5) / n;
    if (u > wp) break;
    const [bx, by] = wirePoint(x1, y1, x2, y2, sg, u);
    const pop = (at === undefined ? 1 : springAt(t, at + 0.25 + u * 0.35, springs.pop)) * bulbK;
    if (pop <= 0.01) continue;
    const rr = r * pop;
    const stem = r * 0.9;
    const swing = osc(t, 0.6, i * 1.3) * 0.08;
    const sx = bx + Math.sin(swing) * stem;
    const syy = by + stem;
    stems.raw(`M${r1(bx)} ${r1(by)}L${r1(sx)} ${r1(syy)}`);
    const bcx = sx;
    const bcy = syy + rr * 0.95;
    let isOn = (lit ?? dark) && colorOn;
    if (on && colorOn) {
      const k = on.reverse ? 1 - u : u;
      const ta = on.at + (on.dur ?? 1) * k;
      isOn = t >= ta;
      const pp = isOn ? springAt(t, ta, springs.wobbly) : 0;
      if (isOn && pp < 1.4) {
        // the bulb pops a little when it switches on
        const k2 = 1 + 0.25 * Math.sin(Math.min(1, (t - ta) / 0.2) * Math.PI);
        outline.circle(bcx, bcy, rr * k2);
        fillOn.circle(bcx, bcy, rr * k2);
        halo.circle(bcx, bcy, rr * 2.1);
        halo2.circle(bcx, bcy, rr * 3.2);
        continue;
      }
    }
    outline.circle(bcx, bcy, rr);
    if (isOn) {
      fillOn.circle(bcx, bcy, rr);
      halo.circle(bcx, bcy, rr * 2.1);
      halo2.circle(bcx, bcy, rr * 3.2);
    } else fillOff.circle(bcx, bcy, rr);
  }
  const ink = S.look.ink;
  return (
    <>
      {!halo2.empty ? <path d={halo2.d} fill={p.glow} opacity={0.22} /> : null}
      {!halo.empty ? <path d={halo.d} fill={p.glow} opacity={0.3} /> : null}
      {ink ? <path d={wireD} fill="none" stroke={palette.ink} strokeWidth={width} strokeLinecap="round" /> : null}
      {ink && !stems.empty ? <path d={stems.d} fill="none" stroke={palette.ink} strokeWidth={width} strokeLinecap="round" /> : null}
      {!fillOff.empty && S.look.fills !== 'none' ? <path d={fillOff.d} fill={palette.white} /> : null}
      {!fillOn.empty ? <path d={fillOn.d} fill={palette.peach} /> : null}
      {ink && !outline.empty ? <path d={outline.d} fill="none" stroke={palette.ink} strokeWidth={width} /> : null}
    </>
  );
};

// ---------------------------------------------------------------- Pole

export type PoleProps = {
  /** Foot of the pole. */
  x: number;
  y: number;
  h: number;
  /** Thickness at the foot (px). */
  w?: number;
  /** Crossbars at the top (0-2). */
  bars?: number;
  color?: string;
  inkW?: number;
  at?: number;
  seed?: Seed;
};

/** Wooden utility pole (ink sides + ochre fill, one or two crossbars with insulator ticks). Grows up when `at` is set. */
export const Pole: React.FC<PoleProps> = ({x, y, h, w = 12, bars = 1, color = palette.brown, inkW = stroke.ink, at, seed = 'pole'}) => {
  const S = useCineState();
  const t = S.t;
  if (at !== undefined && t < at) return null;
  const k = (at === undefined ? 1 : E.outBack(1.2)(prog(t, at, 0.4))) * exitScale(S.e, 0.3, 0.05);
  if (k <= 0.002) return null;
  const top = y - h * k;
  const wt = w * 0.7;
  const fill = `M${r1(x - w / 2)} ${r1(y)}L${r1(x - wt / 2)} ${r1(top)}L${r1(x + wt / 2)} ${r1(top)}L${r1(x + w / 2)} ${r1(y)}Z`;
  let ink = line(x - w / 2, y, x - wt / 2, top, {seed: `${seed}/l`, over: [0, 4], breaks: false}) + line(x + w / 2, y, x + wt / 2, top, {seed: `${seed}/r`, over: [0, 2], breaks: false});
  const barD = new PathBuf();
  for (let i = 0; i < bars; i++) {
    const by = top + h * k * (0.04 + i * 0.07);
    const bw = h * (0.16 - i * 0.03);
    ink += line(x - bw, by, x + bw, by, {seed: `${seed}/b${i}`, over: [3, 3], breaks: false});
    for (const fx of [-0.85, -0.45, 0.45, 0.85]) barD.raw(`M${r1(x + bw * fx)} ${r1(by)}L${r1(x + bw * fx)} ${r1(by - Math.max(3, h * 0.012))}`);
  }
  const paint = lookPaint(S, color, [x, y - h / 2]);
  return (
    <>
      {paint !== 'none' ? <path d={fill} fill={paint} /> : null}
      {inkOn(S, 0.3) ? <path d={ink + barD.d} fill="none" stroke={palette.ink} strokeWidth={inkW} strokeLinecap="round" /> : null}
    </>
  );
};

/** Several sagging wires between two points (offset vertically), ink only. */
export const Wires: React.FC<{a: Pt; b: Pt; n?: number; gap?: number; sag?: number; width?: number; color?: string}> = ({a, b, n = 3, gap = 8, sag = 20, width = stroke.inkHair, color = palette.ink}) => {
  const S = useCineState();
  const t = S.t;
  if (!inkOn(S, 0.2)) return null;
  const pb = new PathBuf();
  for (let i = 0; i < n; i++) {
    const s = sag * (1 + i * 0.12) + osc(t, 0.17, i + a[0] * 0.01) * sag * 0.04;
    const y1 = a[1] + i * gap;
    const y2 = b[1] + i * gap * 0.8;
    pb.raw(`M${r1(a[0])} ${r1(y1)}Q${r1((a[0] + b[0]) / 2)} ${r1((y1 + y2) / 2 + s * 2)} ${r1(b[0])} ${r1(y2)}`);
  }
  return <path d={pb.d} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" />;
};

// ---------------------------------------------------------------- PerspectiveStreet

export type PerspectiveStreetProps = {
  /** Vanishing point (screen / world coords of the layer). */
  vp: Pt;
  /** Focal length (px) and eye height (world units, ~cm). */
  f?: number;
  camH?: number;
  /** Road half width and sidewalk width (world units). */
  road?: number;
  walk?: number;
  /** Depth range (world units). */
  zNear?: number;
  zFar?: number;
  tod?: Tod | TodPalette;
  seed?: Seed;
  sides?: 'both' | 'left' | 'right';
  /** Building height range (world units). */
  heights?: [number, number];
  /** Pole spacing (world units, 0 = none). */
  poles?: number;
  /** String lights zig-zag across the street between poles. */
  lights?: boolean;
  lightsOn?: {at: number; dur?: number};
  /** Windows: initial lit fraction + events. */
  windows?: {initial?: number; events?: SwitchEvent[]};
  /** Tiny walkers on the sidewalks. */
  crowd?: number;
  /** Ink width (screen px) for the nearest lines. */
  ink?: number;
  /** Ground detail: kerb ink, paving joints receding to the VP, dash specks (style bible "ground specks"). */
  ground?: boolean;
  /** Walkers at least this tall (px) are kit Persons (inked, legs). Default 40. */
  personAbove?: number;
};

type Facade = {quad: Quad; color: string; zA: number; zB: number; side: -1 | 1; H: number};

export const PerspectiveStreet: React.FC<PerspectiveStreetProps> = ({
  vp,
  f = 900,
  camH = 110,
  road = 420,
  walk = 260,
  zNear = 260,
  zFar = 40000,
  tod = 'day',
  seed = 'street',
  sides = 'both',
  heights = [700, 1700],
  poles = 1400,
  lights = true,
  lightsOn,
  windows,
  crowd = 30,
  ink = stroke.ink,
  ground = true,
  personAbove = 40,
}) => {
  const C = useCineState();
  const t = C.t;
  const p = todPal(tod);
  const P = persp1({vx: vp[0], vy: vp[1], f, camH});
  const S = (x: number, y: number, z: number): Pt => {
    const [sx, sy] = P(x, y, z);
    return [sx, sy];
  };
  const geo = useMemo(() => {
    const r = rng(`street/${seed}`);
    const fac: Facade[] = [];
    const colors = p.facade;
    const X = road + walk;
    for (const side of [-1, 1] as const) {
      if (sides === 'left' && side === 1) continue;
      if (sides === 'right' && side === -1) continue;
      let z = zNear * 0.6;
      while (z < zFar * 0.35) {
        const len = r.range(700, 1800) * (1 + z / 9000);
        const H = r.range(heights[0], heights[1]);
        const zA = z;
        const zB = z + len;
        const x = side * X;
        const quad: Quad = side === -1 ? [S(x, H, zA), S(x, H, zB), S(x, 0, zB), S(x, 0, zA)] : [S(x, H, zB), S(x, H, zA), S(x, 0, zA), S(x, 0, zB)];
        fac.push({quad, color: r.pick(colors), zA, zB, side, H});
        z = zB + r.range(0, 60);
      }
    }
    return fac;
  }, [vp[0], vp[1], f, camH, road, walk, zNear, zFar, seed, sides, heights.join(), p.name]);

  // window cells per facade (u along the street, v top -> bottom)
  const cells = useMemo(() => {
    const all = geo.flatMap((fc, i) => {
      const len = fc.zB - fc.zA;
      const cols = Math.max(1, Math.round(len / 260));
      const rows = Math.max(1, Math.round(fc.H / 300));
      const c = gridCells({rows, cols, fw: 0.42, fh: 0.5}, `${seed}/f${i}`, fc.quad);
      return fc.side === 1 ? c : c;
    });
    return all;
  }, [geo, seed]);
  const ev = windows?.events ?? [];
  const times = useMemo(() => switchTimes(cells, ev, `${seed}/w`), [cells, JSON.stringify(ev), seed]);
  const W = windowPaths(cells, ev, times, t, {initial: windows?.initial ?? (p.stars > 0.3 ? 0.55 : 0.1), lit: p.windowLit, blinds: 0.1}, 1, C.e > 0.05 ? {dark: () => true} : {});

  // ground: from below the frame bottom (+ bleed) to the far end
  const zG = Math.min(zNear, (f * camH) / Math.max(1, 2300 - vp[1]));
  const groundRoad = new PathBuf().quad(S(-road, 0, zG), S(road, 0, zG), S(road, 0, zFar), S(-road, 0, zFar)).d;
  const walks = new PathBuf();
  const X = road + walk;
  if (sides !== 'right') walks.quad(S(-X * 3, 0, zG), S(-road, 0, zG), S(-road, 0, zFar), S(-X, 0, zFar));
  if (sides !== 'left') walks.quad(S(road, 0, zG), S(X * 3, 0, zG), S(X, 0, zFar), S(road, 0, zFar));

  // facade fills / shade / ink, drawn far -> near
  const sorted = geo.slice().sort((a, b) => b.zA - a.zA);
  const fills: React.ReactNode[] = [];
  const inkPB = new PathBuf();
  sorted.forEach((fc, i) => {
    const depth = Math.min(1, fc.zA / (zFar * 0.25));
    fills.push(<path key={`fc${i}`} d={new PathBuf().quad(...fc.quad).d} fill={atmos(fc.color, depth, p)} />);
    // near vertical edge + roofline + base (converging), ink fades out with depth (thinner, then none)
    if (depth < 0.55) {
      const [tl, tr, br, bl] = fc.quad;
      const near: [Pt, Pt] = fc.side === -1 ? [tl, bl] : [tr, br];
      inkPB.raw(line(near[0][0], near[0][1], near[1][0], near[1][1], {seed: `${seed}/v${i}`, over: [6, 0], breaks: false}));
      inkPB.raw(line(tl[0], tl[1], tr[0], tr[1], {seed: `${seed}/t${i}`, over: [4, 8], breaks: false}));
    }
  });
  // kerb lines toward the VP (heavy, 3.4 px), paving joints across the sidewalks, dash specks on the road
  const kerbPB = new PathBuf();
  const groundPB = new PathBuf();
  for (const x of sides === 'both' ? [-road, road] : sides === 'left' ? [-road] : [road]) {
    const a = S(x, 0, zG);
    const b = S(x, 0, zFar * 0.3);
    kerbPB.raw(line(a[0], a[1], b[0], b[1], {seed: `${seed}/k${x}`, over: [0, 0]}));
  }
  if (ground) {
    const gr = rng(`ground/${seed}`);
    // joints: a line across each sidewalk every `jz` world units, receding (spacing foreshortens by itself)
    const jz = 320;
    for (let z = zG + jz * 0.5; z < zFar * 0.08; z += jz) {
      const k = f / z;
      if (k < 0.06) break;
      for (const side of sides === 'both' ? [-1, 1] : sides === 'left' ? [-1] : [1]) {
        const a = S(side * road, 0, z);
        const b = S(side * (road + walk * gr.range(0.75, 1.0)), 0, z);
        groundPB.raw(line(a[0], a[1], b[0], b[1], {seed: `${seed}/j${z.toFixed(0)}${side}`, over: [0, 2], breaks: false}));
      }
    }
    // dash specks: short horizontal ticks, 3-10 px, scattered on the road and walks, denser near the lens
    for (let i = 0; i < 70; i++) {
      const z = zG * Math.pow(gr.range(1, 30), 1.4);
      const x = gr.range(-(road + walk), road + walk);
      const [sx, sy] = S(x, 0, z);
      if (sy > 2100 || sy < vp[1] + 6) continue;
      const len = Math.min(10, Math.max(3, (f / z) * gr.range(14, 30)));
      groundPB.raw(`M${r1(sx - len / 2)} ${r1(sy)}h${r1(len)}`);
    }
  }

  // poles, wires, string lights
  const poleNodes: React.ReactNode[] = [];
  const wirePB = new PathBuf();
  const tops: {l: Pt; r: Pt; k: number}[] = [];
  if (poles > 0) {
    for (let z = zNear + poles * 0.5; z < zFar * 0.3; z += poles) {
      const k = f / z;
      const ph = 950;
      const l: Pt = S(-road - 40, ph, z);
      const rr: Pt = S(road + 40, ph, z);
      tops.push({l, r: rr, k});
    }
    tops
      .slice()
      .reverse()
      .forEach((tp, i) => {
        for (const side of sides === 'both' ? [-1, 1] : sides === 'left' ? [-1] : [1]) {
          const foot = S(side * (road + 40), 0, f / tp.k);
          const top = side === -1 ? tp.l : tp.r;
          poleNodes.push(<Pole key={`p${i}${side}`} x={foot[0]} y={foot[1]} h={foot[1] - top[1]} w={Math.max(2, 26 * tp.k)} inkW={Math.max(0.8, ink * Math.min(1, tp.k * 1.6))} seed={`${seed}/p${i}${side}`} />);
        }
      });
    for (let i = 0; i < tops.length - 1; i++) {
      const a = tops[i];
      const b = tops[i + 1];
      for (const [pa, pb] of [
        [a.l, b.l],
        [a.r, b.r],
      ] as [Pt, Pt][]) {
        const sag = 14 * a.k;
        wirePB.raw(`M${r1(pa[0])} ${r1(pa[1])}Q${r1((pa[0] + pb[0]) / 2)} ${r1((pa[1] + pb[1]) / 2 + sag)} ${r1(pb[0])} ${r1(pb[1])}`);
      }
    }
  }
  const lightNodes: React.ReactNode[] = [];
  if (lights && tops.length > 1) {
    for (let i = tops.length - 2; i >= 0; i--) {
      const a = tops[i];
      const b = tops[i + 1];
      const from = i % 2 ? a.l : a.r;
      const to = i % 2 ? b.r : b.l;
      const lo = lightsOn ? {at: lightsOn.at + ((lightsOn.dur ?? 2) * i) / tops.length, dur: 0.4} : undefined;
      lightNodes.push(
        <StringLights key={`sl${i}`} x1={from[0]} y1={from[1] + 4 * a.k} x2={to[0]} y2={to[1] + 4 * b.k} sag={60 * a.k} n={Math.max(4, Math.round(14 * Math.sqrt(a.k)))} r={Math.max(1.4, 14 * a.k)} tod={p} on={lo} width={Math.max(0.8, stroke.inkThin * Math.min(1, a.k * 2))} seed={`${seed}/sl${i}`} sway={2 * a.k} />,
      );
    }
  }

  // walkers on the sidewalks, heading to the VP (z grows with time, wraps); colours vary per walker
  const WC = [palette.teal, palette.sage, palette.tan, palette.cream, palette.brown, palette.tealDark, palette.peach];
  const WH = [palette.ink, palette.brown, palette.tan, palette.tealDark];
  const heads = WH.map(() => new PathBuf());
  const bodies = WC.map(() => new PathBuf());
  const legsB = new PathBuf();
  const people: React.ReactNode[] = [];
  if (crowd > 0) {
    const r = rng(`walk/${seed}`);
    const list = Array.from({length: crowd}, () => {
      const side = sides === 'both' ? r.sign() : sides === 'left' ? -1 : 1;
      return {x: side * (road + r.range(40, walk - 40)), z0: r.range(zNear * 1.6, zFar * 0.12), v: r.range(60, 140) * (r.chance(0.2) ? -1 : 1), c: r.int(0, WC.length - 1), h: r.int(0, WH.length - 1)};
    });
    const pos = list.map((w, i) => ({...w, i, z: Math.max(zNear * 1.4, ((w.z0 + w.v * t - zNear * 1.4) % (zFar * 0.12)) + zNear * 1.4)})).sort((a, b) => b.z - a.z);
    const exK = exitScale(C.e, 0.3, 0.01);
    for (const w of pos) {
      const [sx, sy] = S(w.x, 0, w.z);
      const h = ((170 * f) / w.z) * exK;
      if (h < 2.5) continue;
      const bob = Math.abs(Math.sin(t * 6 + w.x)) * h * 0.03;
      if (personAbove > 0 && h >= personAbove) {
        const s = h / PERSON_H;
        people.push(<Person key={`wp${w.i}`} x={sx} y={sy - bob - PERSON_FEET * s} s={s} legs seed={`${seed}/wp${w.i}`} body={WC[w.c]} hairColor={WH[w.h]} ink={personInk(h)} lod={h < 70 ? 1 : 0} />);
        continue;
      }
      tinyFigure(heads[w.h], bodies[w.c], legsB, sx, sy - bob, h);
    }
  }

  const paper = isPaper(C, vp);
  const color = !paper && C.look.fills === 'color';
  const gp = (c: string) => lookPaint(C, c, vp);
  const showInk = inkOn(C, 0.3);
  // un-build: the street (a big slab-like piece) sinks toward the bottom edge late
  const k = exitScale(C.e, 0.5, 0.7);
  if (k <= 0) return null;
  const body = (
    <>
      {gp(ambient(palette.sand, p)) !== 'none' ? <path d={groundRoad} fill={gp(ambient(palette.sand, p))} /> : null}
      {gp(ambient(palette.cream, p)) !== 'none' ? <path d={walks.d} fill={gp(ambient(palette.cream, p))} /> : null}
      {color ? fills : paper ? <path d={sorted.map((fc) => new PathBuf().quad(...fc.quad).d).join('')} fill={palette.white} stroke={showInk ? palette.ink : 'none'} strokeWidth={1.2} /> : null}
      {color && W.dark ? <path d={W.dark} fill={atmos(p.windowDark, 0.3, p, {raw: true})} /> : null}
      {color ? W.lit.map((d, i) => (d ? <path key={`w${i}`} d={d} fill={p.windowLit[i % p.windowLit.length]} /> : null)) : null}
      {color && W.blinds ? <path d={W.blinds} fill={ambient(palette.tan, p)} /> : null}
      {showInk ? <path d={inkPB.d} fill="none" stroke={palette.ink} strokeWidth={ink * 0.8} strokeLinecap="round" /> : null}
      {showInk && !kerbPB.empty ? <path d={kerbPB.d} fill="none" stroke={palette.ink} strokeWidth={stroke.ink} strokeLinecap="round" /> : null}
      {showInk && !groundPB.empty ? <path d={groundPB.d} fill="none" stroke={palette.ink} strokeWidth={stroke.inkThin} strokeLinecap="round" /> : null}
      {color && !legsB.empty ? <path d={legsB.d} fill={ambient(palette.tealDark, p)} /> : null}
      {color ? bodies.map((b, i) => (b.empty ? null : <path key={`wb${i}`} d={b.d} fill={ambient(WC[i], p)} />)) : null}
      {color ? heads.map((b, i) => (b.empty ? null : <path key={`wh${i}`} d={b.d} fill={ambient(WH[i], p)} />)) : null}
      {people}
      {poleNodes}
      {showInk ? <path d={wirePB.d} fill="none" stroke={palette.ink} strokeWidth={stroke.inkHair} strokeLinecap="round" /> : null}
      {lightNodes}
    </>
  );
  if (k >= 1) return body;
  return <g transform={`translate(0 1920) scale(1 ${k.toFixed(4)}) translate(0 -1920)`}>{body}</g>;
};

