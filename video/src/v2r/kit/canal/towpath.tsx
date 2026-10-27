// canal/towpath.tsx: the towpaths and their furniture. A paving band that is never flat (broken joint lines, specks,
// fallen leaves, the coping at the water), and the things that stand on it: heritage lamp posts that light on a time
// (`lightAt`, a 3-frame flicker, no glow), railings, benches, mooring bollards and rings, bins, planters of grasses,
// parked bikes, drain covers. Every piece takes a screen position and a size, so one model serves every shot.

import React, {useMemo} from 'react';
import {CM, INK_PX} from '../../palette';
import {useTime} from '../../../lib/time';
import {line, rect as rectInk, wire as wirePath, circle as circleInk} from '../../../lib/sketch';
import {Batch, Paint, P, r1, rng, inkFor, ovalPath, domePath, lobes, leafPath, lerp, Pt} from './core';
import {copingInto} from './water';
import {tiered} from '../tiers';

// ---------------------------------------------------------------- the paving band

export type TowpathProps = {
  x0?: number;
  x1?: number;
  /** Back edge y (the wall / facade base) and front edge y (the water side), on the straight. */
  top: number;
  edge: number;
  seed: string;
  /** Coping height at the front edge (px); 0 = none (a path away from the water). */
  coping?: number;
  /** Fallen leaves on the path (count). */
  leaves?: number;
  /** Joint line weight; 0 = fill only (a far towpath). */
  ink?: number;
  /** Mooring rings on the coping (screen x list). */
  rings?: number[];
  color?: string;
  /** A bend: extra y offset at screen x (S1's towpath bends away at the left: map S1_TOWPATH_FEET). */
  bend?: (x: number) => number;
};

/** A towpath seen side-on: paving, broken joint lines and specks, leaves, the coping and its rings; optionally bending. */
const TowpathBody: React.FC<TowpathProps> = ({x0 = -40, x1 = 1120, top, edge, seed, coping = 10, leaves = 14, ink = INK_PX.far, rings = [], color = CM.paving, bend}) => {
  const b = useMemo(() => {
    const b = new Batch();
    const r = rng(seed);
    const H = edge - top;
    const off = bend ?? (() => 0);
    // a band between two curves y = a + off(x) .. y = c + off(x), sampled every 24 px
    const band = (a: number, c: number): Pt[] => {
      const pts: Pt[] = [];
      for (let x = x0; x <= x1 + 24; x += 24) pts.push([Math.min(x, x1), a + off(Math.min(x, x1))]);
      for (let x = x1; x >= x0 - 24; x -= 24) pts.push([Math.max(x, x0), c + off(Math.max(x, x0))]);
      return pts;
    };
    b.poly(color, band(top, edge + 1));
    // a slightly darker strip along the back (the wall's foot) for depth
    b.poly(CM.stucco, band(top, top + Math.max(2, H * 0.14)));
    // broken paving joints: short horizontal runs + a few cross ticks (never a grid)
    let d = '';
    const rows = Math.max(1, Math.round(H / 26));
    for (let k = 1; k <= rows; k++) {
      const yy = top + (H * k) / (rows + 1);
      let x = x0 + r.range(0, 60);
      while (x < x1) {
        const L = r.range(40, 120);
        if (r.chance(0.55)) d += `M${P(x, yy + off(x) + r.jitter(1))}L${P(x + L, yy + off(x + L) + r.jitter(1.2))}`;
        if (r.chance(0.3)) d += `M${P(x + L * 0.5, yy + off(x + L * 0.5))}L${P(x + L * 0.5 + r.jitter(3), yy + off(x + L * 0.5) + H / (rows + 1))}`;
        x += L + r.range(20, 90);
      }
    }
    b.ink(d, ink * 0.6, CM.line);
    // specks
    for (let i = 0; i < (x1 - x0) / 30; i++) {
      const sx = r.range(x0, x1);
      b.fill(CM.stoneShade, ovalPath(sx, r.range(top + 3, edge - coping - 2) + off(sx), r.range(1.2, 2.6), r.range(0.8, 1.6)));
    }
    // leaves
    b.layer();
    for (let i = 0; i < leaves; i++) {
      const yy = r.range(top + H * 0.2, edge - coping - 2);
      const s = lerp(7, 13, (yy - top) / Math.max(1, H));
      const lx = r.range(x0, x1);
      b.fill(r.pick([CM.leafGold, CM.leafRust, CM.coatMustard]), leafPath(lx, yy + off(lx), s, s * 0.35, r.range(-30, 30)));
    }
    if (coping > 0) {
      b.layer();
      // the shade the coping casts on the water just below it
      b.poly(CM.waterDeep, band(edge, edge + Math.max(4, coping * 0.55)));
      if (!bend) {
        copingInto(b, x0, x1, edge - coping, coping, `${seed}/cop`, ink || 1.6);
      } else {
        b.poly(CM.limestone, band(edge - coping, edge));
        b.poly(CM.stoneShade, band(edge - coping * 0.28, edge));
        let j = '';
        let lip = '';
        for (let x = x0; x < x1; x += r.range(70, 130)) j += `M${P(x, edge - coping + 1 + off(x))}L${P(x + r.jitter(1), edge - coping * 0.3 + off(x))}`;
        for (let x = x0; x < x1; x += 24) lip += `${x === x0 ? 'M' : 'L'}${P(x, edge - coping + off(x))}`;
        b.ink(j, Math.max(1.2, (ink || 1.6) * 0.6));
        b.ink(lip, ink || 1.6, CM.ink, 0.2);
      }
      for (const rx of rings) b.ink(circleInk(rx, edge - coping * 0.45 + off(rx), coping * 0.32, {seed: `${seed}/ring${rx}`}), Math.max(1.4, ink * 0.7), CM.ink, 0, {thing: true});
    }
    return b;
  }, [x0, x1, top, edge, seed, coping, leaves, ink, rings.join(','), color, bend]);
  return <Paint b={b} seed={`tow/${seed}`} />;
};
export const Towpath = tiered('environment', {}, TowpathBody);

// ---------------------------------------------------------------- lamp posts

export type LampProps = {
  x: number;
  /** Ground y (the post's foot). */
  y: number;
  /** Total height in px (foot to finial). */
  h: number;
  seed: string;
  /** Lights at this time (3-frame flicker). Omit + `on` for a steady state. */
  lightAt?: number;
  on?: boolean;
  /** A flat lamp pool on the ground once lit (rx px; 0 = none). */
  pool?: number;
  color?: string;
  /** 'near': a column right in front of the lens whose swan-neck arm leaves the frame (no lantern in frame):
   *  y = foot (may be below the frame), h = the column top's height above the foot, w = column width. */
  variant?: 'heritage' | 'near';
  w?: number;
};

/** A heritage lamp post: plinth, fluted column, ladder bar, lantern (glass off; lamp-lit on), cap and finial. */
const LampBody: React.FC<LampProps> = ({x, y, h, seed, lightAt, on = false, pool = 0, color = CM.anchor, variant = 'heritage', w: colW}) => {
  const t = useTime();
  if (variant === 'near') {
    const b = new Batch();
    const cw = colW ?? 34;
    const top = y - h;
    b.fill(color, `M${P(x - cw * 0.7, y)}L${P(x - cw * 0.5, top + cw * 3)}L${P(x - cw * 0.5, top)}Q${P(x - cw * 0.4, top - cw * 2.6)} ${P(x + cw * 3, top - cw * 2.8)}L${P(1200, top - cw * 2.4)}L${P(1200, top - cw * 1.7)}L${P(x + cw * 3, top - cw * 2.0)}Q${P(x + cw * 0.5, top - cw * 1.8)} ${P(x + cw * 0.5, top)}L${P(x + cw * 0.5, top + cw * 3)}L${P(x + cw * 0.7, y)}Z`);
    b.rect(CM.coatMustard, x - cw * 0.55, top + h * 0.42, cw * 1.1, cw * 0.3);
    b.rect(color, x - cw * 0.75, top + h * 0.62, cw * 1.5, cw * 0.5);
    b.ink(line(x - cw * 0.5, top, x - cw * 0.6, y, {seed: `${seed}/n`, over: 'small'}), INK_PX.front);
    return <Paint b={b} seed={`nearlamp/${seed}`} />;
  }
  const lit = lightAt !== undefined ? t >= lightAt && !(t >= lightAt + 1 / 60 && t < lightAt + 3 / 60) : on;
  const w = inkFor(h);
  const b = new Batch();
  if (lit && pool > 0) b.fill(CM.lamp, ovalPath(x, y + 2, pool, pool * 0.16));
  b.layer();
  const cw = Math.max(2.5, h * 0.034);
  b.fill(color, `M${P(x - cw * 1.6, y)}L${P(x - cw * 1.2, y - h * 0.08)}L${P(x + cw * 1.2, y - h * 0.08)}L${P(x + cw * 1.6, y)}Z`);
  b.fill(color, `M${P(x - cw * 0.7, y - h * 0.08)}L${P(x - cw * 0.45, y - h * 0.8)}L${P(x + cw * 0.45, y - h * 0.8)}L${P(x + cw * 0.7, y - h * 0.08)}Z`);
  b.rect(color, x - cw * 1.0, y - h * 0.36, cw * 2, h * 0.018);
  b.rect(color, x - cw * 2.6, y - h * 0.79, cw * 5.2, Math.max(1.5, h * 0.012));
  // lantern: a trapezoid of glass, wider at the top
  const lb = y - h * 0.82;
  const lt = y - h * 0.94;
  const lw0 = cw * 1.5;
  const lw1 = cw * 2.4;
  b.fill(lit ? CM.lampCore : CM.glass, `M${P(x - lw0, lb)}L${P(x - lw1, lt)}L${P(x + lw1, lt)}L${P(x + lw0, lb)}Z`);
  if (lit) b.fill(CM.lamp, `M${P(x - lw0 * 0.5, lb)}L${P(x - lw1 * 0.55, lt)}L${P(x + lw1 * 0.55, lt)}L${P(x + lw0 * 0.5, lb)}Z`);
  b.fill(color, `M${P(x - lw1 * 1.15, lt)}L${P(x, lt - h * 0.045)}L${P(x + lw1 * 1.15, lt)}Z`);
  b.fill(color, ovalPath(x, lt - h * 0.055, cw * 0.5, cw * 0.6));
  if (w > 0) {
    b.ink(`M${P(x - lw0, lb)}L${P(x - lw1, lt)}M${P(x + lw0, lb)}L${P(x + lw1, lt)}M${P(x, lb)}L${P(x, lt)}`, Math.max(1.4, w * 0.6), CM.ink, 0, {thing: true, tone: color});
    b.ink(line(x - cw * 0.6, y - h * 0.08, x - cw * 0.45, y - h * 0.79, {seed: `${seed}/c`, over: 'small'}), w);
  }
  return <Paint b={b} seed={`lamp/${seed}`} misreg={h > 140} />;
};
export const Lamp = tiered('environment', {}, LampBody);

// ---------------------------------------------------------------- railings, benches, bollards and the rest

/** A canal railing: posts every `pitch`, a top rail and a mid rail, thin bars between (iron, anchor plum). */
export function railingInto(b: Batch, x0: number, x1: number, y: number, h: number, seed: string, o: {pitch?: number; bars?: number; color?: string; ink?: number} = {}) {
  const pitch = o.pitch ?? h * 1.6;
  const color = o.color ?? CM.anchor;
  const w = o.ink ?? inkFor(h * 3);
  const bw = Math.max(1.2, h * 0.025);
  b.rect(color, x0, y - h, x1 - x0, Math.max(2, h * 0.06));
  b.rect(color, x0, y - h * 0.45, x1 - x0, Math.max(1.4, h * 0.035));
  for (let x = x0; x <= x1; x += pitch) {
    b.rect(color, x - bw * 1.4, y - h - bw, bw * 2.8, h + bw);
    b.fill(color, ovalPath(x, y - h - bw * 1.6, bw * 1.8, bw * 1.8));
    const nb = o.bars ?? 3;
    for (let k = 1; k <= nb; k++) b.rect(color, x + (pitch * k) / (nb + 1) - bw * 0.5, y - h * 0.45, bw, h * 0.45);
  }
  if (w > 0) b.ink(line(x0, y - h, x1, y - h, {seed: `${seed}/rt`, over: 'small'}), Math.max(1.4, w * 0.6));
}

const RailingBody: React.FC<{x0: number; x1: number; y: number; h: number; seed: string; pitch?: number; bars?: number; color?: string}> = (p) => {
  const b = useMemo(() => {
    const b = new Batch();
    railingInto(b, p.x0, p.x1, p.y, p.h, p.seed, p);
    return b;
  }, [p.x0, p.x1, p.y, p.h, p.seed, p.pitch, p.bars, p.color]);
  return <Paint b={b} seed={`rail/${p.seed}`} misreg={false} />;
};
export const Railing = tiered('environment', {}, RailingBody);

/** A park bench. view 'back' (we see the backrest: people sit facing away), 'front', or 'side'. x = centre, y = feet. */
export function benchInto(b: Batch, x: number, y: number, w: number, view: 'back' | 'front' | 'side', seed: string) {
  const h = w * 0.42;
  const wood = CM.line;
  const iron = CM.anchor;
  const iw = inkFor(w);
  if (view === 'side') {
    b.rect(iron, x - w * 0.18, y - h * 0.5, w * 0.04, h * 0.5);
    b.rect(iron, x + w * 0.14, y - h * 0.5, w * 0.04, h * 0.5);
    b.rect(wood, x - w * 0.22, y - h * 0.55, w * 0.44, h * 0.08);
    b.poly(wood, [
      [x + w * 0.16, y - h * 0.55],
      [x + w * 0.24, y - h],
      [x + w * 0.28, y - h],
      [x + w * 0.2, y - h * 0.55],
    ]);
    return;
  }
  // legs (iron ends)
  for (const k of [-0.42, 0.42]) {
    b.rect(iron, x + k * w - w * 0.025, y - h * 0.62, w * 0.05, h * 0.62);
  }
  // seat front edge + backrest slats
  if (view === 'front') {
    b.rect(wood, x - w / 2, y - h * 0.55, w, h * 0.09);
    for (let s = 0; s < 3; s++) b.rect(wood, x - w / 2, y - h * (1 - s * 0.14), w, h * 0.08);
  } else {
    for (let s = 0; s < 3; s++) b.rect(s === 1 ? CM.brickDeep : wood, x - w / 2, y - h * (1 - s * 0.15), w, h * 0.1);
    b.rect(CM.shadeWarm, x - w / 2 + 4, y - h * 0.55, w - 8, h * 0.06);
  }
  if (iw > 0) b.ink(rectInk(x - w / 2, y - h, w, h * 0.42, {seed: `${seed}/bk`, over: 'small', open: 0.4}), iw * 0.7);
}

const BenchBody: React.FC<{x: number; y: number; w: number; view?: 'back' | 'front' | 'side'; seed: string}> = ({x, y, w, view = 'back', seed}) => {
  const b = useMemo(() => {
    const b = new Batch();
    benchInto(b, x, y, w, view, seed);
    return b;
  }, [x, y, w, view, seed]);
  return <Paint b={b} seed={`bench/${seed}`} />;
};
export const Bench = tiered('environment', {}, BenchBody);

/** A cast-iron mooring bollard (dome cap, waist): x = centre, y = foot, h = height. Pip's waterline seat. */
export function bollardInto(b: Batch, x: number, y: number, h: number, seed: string) {
  const w = h * 0.9;
  b.fill(CM.anchor, `M${P(x - w * 0.42, y)}L${P(x - w * 0.3, y - h * 0.55)}L${P(x - w * 0.42, y - h * 0.78)}L${P(x + w * 0.42, y - h * 0.78)}L${P(x + w * 0.3, y - h * 0.55)}L${P(x + w * 0.42, y)}Z`);
  b.fill(CM.anchor, domePath(x, y - h * 0.76, w * 0.46, h * 0.26));
  b.fill(CM.shadeWarm, `M${P(x + w * 0.12, y - h * 0.05)}L${P(x + w * 0.2, y - h * 0.55)}L${P(x + w * 0.3, y - h * 0.55)}L${P(x + w * 0.38, y - h * 0.05)}Z`);
  const iw = inkFor(h * 3);
  if (iw > 0) b.ink(`M${P(x - w * 0.46, y - h * 0.76)}A${r1(w * 0.46)} ${r1(h * 0.26)} 0 0 1 ${P(x + w * 0.46, y - h * 0.76)}`, iw, CM.ink, 0.2);
}

const BollardBody: React.FC<{x: number; y: number; h: number; seed: string}> = ({x, y, h, seed}) => {
  const b = useMemo(() => {
    const b = new Batch();
    bollardInto(b, x, y, h, seed);
    return b;
  }, [x, y, h, seed]);
  return <Paint b={b} seed={`bollard/${seed}`} />;
};
export const Bollard = tiered('environment', {}, BollardBody);

/** A planter box of grasses (wooden box, lobed tufts, a few seed heads). x0..x1, y = foot, h = box height. */
export function planterInto(b: Batch, x0: number, x1: number, y: number, h: number, seed: string, t = 0) {
  const r = rng(seed);
  const w = x1 - x0;
  b.rect(CM.line, x0, y - h, w, h);
  b.rect(CM.brickDeep, x0, y - h, w, h * 0.12);
  let d = '';
  for (let k = 1; k < 4; k++) d += `M${P(x0 + 3, y - h + (h * k) / 4)}L${P(x1 - 3, y - h + (h * k) / 4 + r.jitter(1))}`;
  b.ink(d, Math.max(1.2, inkFor(w) * 0.5), CM.ink);
  b.layer();
  b.fill(CM.sage, lobes(x0 + 4, x1 - 4, y - h + 2, h * 1.4, `${seed}/g`));
  b.layer();
  // grass blades + seed heads swaying
  let g = '';
  const n = Math.round(w / 12);
  for (let i = 0; i < n; i++) {
    const bx = x0 + 8 + ((w - 16) * (i + r.next() * 0.5)) / n;
    const L = h * r.range(0.5, 1.0);
    const sw = Math.sin(t * 1.3 + i * 0.7) * L * 0.08;
    g += `M${P(bx, y - h)}Q${P(bx + sw * 0.5, y - h - L * 0.5)} ${P(bx + sw + r.jitter(6), y - h - L)}`;
    if (r.chance(0.35)) b.fill(CM.coatOat, leafPath(bx + sw + r.jitter(6), y - h - L, 10, 3, 80));
  }
  b.ink(g, Math.max(1.4, inkFor(h * 4) * 0.55), CM.sage, 0, {thing: true});
}

const PlanterBody: React.FC<{x0: number; x1: number; y: number; h: number; seed: string}> = ({x0, x1, y, h, seed}) => {
  const t = useTime();
  const b = new Batch();
  planterInto(b, x0, x1, y, h, seed, t);
  return <Paint b={b} seed={`planter/${seed}`} />;
};
export const Planter = tiered('environment', {}, PlanterBody);

/** A parked bicycle in profile: x = centre, y = ground, R = wheel radius. Optional lock to a post at lockX. */
export function bikeInto(b: Batch, x: number, y: number, R: number, seed: string, color = CM.brickDeep, dir: 1 | -1 = 1) {
  const w = Math.max(1.6, inkFor(R * 6));
  const ax = x - dir * R * 1.25;
  const bx = x + dir * R * 1.25;
  const wy = y - R;
  b.ink(circleInk(ax, wy, R, {seed: `${seed}/a`, wobble: 0.015}) + circleInk(bx, wy, R, {seed: `${seed}/b`, wobble: 0.015}), w, CM.ink, 0, {thing: true});
  const seat: Pt = [x - dir * R * 0.35, wy - R * 1.15];
  const bar: Pt = [x + dir * R * 0.75, wy - R * 1.35];
  const crank: Pt = [x, wy];
  b.ink(`M${P(ax, wy)}L${P(crank[0], crank[1])}L${P(seat[0], seat[1] + R * 0.12)}L${P(ax, wy)}M${P(crank[0], crank[1])}L${P(bar[0] - dir * R * 0.12, bar[1] + R * 0.25)}L${P(seat[0], seat[1] + R * 0.12)}M${P(bar[0] - dir * R * 0.12, bar[1] + R * 0.25)}L${P(bx, wy)}`, w * 1.3, color, 0, {thing: true});
  b.ink(`M${P(bar[0] - dir * R * 0.25, bar[1])}L${P(bar[0] + dir * R * 0.15, bar[1] - R * 0.05)}`, w * 1.2, CM.ink, 0, {thing: true});
  b.fill(CM.anchor, ovalPath(seat[0], seat[1], R * 0.3, R * 0.08));
  b.fill(color, ovalPath(crank[0], crank[1], R * 0.12, R * 0.12));
}

const BikeBody: React.FC<{x: number; y: number; R: number; seed: string; color?: string; dir?: 1 | -1}> = ({x, y, R, seed, color, dir}) => {
  const b = useMemo(() => {
    const b = new Batch();
    bikeInto(b, x, y, R, seed, color, dir);
    return b;
  }, [x, y, R, seed, color, dir]);
  return <Paint b={b} seed={`bike/${seed}`} misreg={false} />;
};
export const Bike = tiered('environment', {}, BikeBody);

/** A litter bin (round, slatted): x = centre, y = foot, h = height. */
export function binInto(b: Batch, x: number, y: number, h: number, seed: string) {
  const w = h * 0.62;
  b.fill(CM.anchor, `M${P(x - w / 2, y - h * 0.86)}L${P(x - w * 0.44, y)}L${P(x + w * 0.44, y)}L${P(x + w / 2, y - h * 0.86)}Z`);
  b.fill(CM.anchor, domePath(x, y - h * 0.86, w * 0.54, h * 0.14));
  b.rect(CM.coatMustard, x - w * 0.36, y - h * 0.62, w * 0.72, h * 0.08);
  const iw = inkFor(h * 3);
  if (iw > 0) b.ink(line(x - w / 2, y - h * 0.86, x + w / 2, y - h * 0.86, {seed: `${seed}/l`, over: 'small'}), iw * 0.7);
}

/** A drain cover seen on the ground (a squashed grille). */
export function drainInto(b: Batch, x: number, y: number, w: number, seed: string) {
  const h = w * 0.32;
  b.fill(CM.stoneShade, `M${P(x - w / 2, y)}L${P(x + w / 2, y)}L${P(x + w * 0.46, y + h)}L${P(x - w * 0.46, y + h)}Z`);
  let d = '';
  for (let k = 1; k < 6; k++) d += `M${P(x - w / 2 + (w * k) / 6, y + 1)}L${P(x - w / 2 + (w * k) / 6, y + h - 1)}`;
  b.ink(d, Math.max(1.2, inkFor(w * 4) * 0.5), CM.shadeCool);
}

/** A tree on the bank: trunk + lobed crown in autumn colours (plane / lime), with the house's leaf ticks. */
export function treeInto(b: Batch, x: number, y: number, h: number, seed: string, t = 0, autumn = true) {
  const r = rng(seed);
  const tw = Math.max(4, h * 0.05);
  const sw = Math.sin(t * 0.7 + r.next() * 6) * h * 0.006;
  b.fill(CM.line, `M${P(x - tw, y)}L${P(x - tw * 0.6, y - h * 0.5)}L${P(x + tw * 0.6, y - h * 0.5)}L${P(x + tw, y)}Z`);
  b.layer();
  const cols = autumn ? [CM.sage, CM.leafGold, CM.sage, CM.leafRust] : [CM.sage, CM.sage];
  const cx = x + sw;
  const cy = y - h * 0.68;
  const R = h * 0.34;
  b.fill(cols[0], lobes(cx - R, cx + R, cy + R * 0.7, R * 1.55, `${seed}/a`, 5));
  b.fill(cols[1], lobes(cx - R * 0.7, cx + R * 0.15, cy + R * 0.25, R * 0.9, `${seed}/b`, 3));
  b.fill(cols[3 % cols.length], lobes(cx + R * 0.05, cx + R * 0.8, cy + R * 0.55, R * 0.8, `${seed}/c`, 3));
  const iw = inkFor(h);
  if (iw > 0) b.ink(`M${P(x, y - h * 0.4)}L${P(x - R * 0.35, cy - R * 0.1)}M${P(x, y - h * 0.45)}L${P(x + R * 0.3, cy)}`, iw * 0.7, CM.line, 0, {thing: true});
}

const TreeBody: React.FC<{x: number; y: number; h: number; seed: string; autumn?: boolean}> = ({x, y, h, seed, autumn}) => {
  const t = useTime();
  const b = new Batch();
  treeInto(b, x, y, h, seed, t, autumn);
  return <Paint b={b} seed={`tree/${seed}`} />;
};
export const Tree = tiered('environment', {}, TreeBody);

/** A string-light span helper for wires between posts (re-exported for sets). */
export const wireBetween = (a: Pt, c: Pt, sag: number, seed: string) => wirePath(a[0], a[1], c[0], c[1], sag, {seed});
