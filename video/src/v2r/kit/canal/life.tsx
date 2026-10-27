// canal/life.tsx: THE LIFE LAYER (TREATMENT §5 "life" column; docs/look/LIFE_AND_DENSITY.md §6). Small, specific,
// always on, deterministic (seeded, scene seconds), no opacity, nothing in the caption band (y 317-556: every flyer
// takes a `ceil`, default 580).
//   Birds        a row perched on a wire / rail / roof edge; bob and peck; lift off at `liftAt` and wheel away
//   Pigeons      bigger grey birds on a canopy or sill: shuffle, head-bob, optional lift
//   Ducks        on the water: paddle, bob, V wakes; one can land at `landAt`
//   Heron        standing on a post or the bank, still, one slow head turn
//   Puffs        smoke (chimneys) / steam (urns, kettles, mugs): a puff train + optional bursts
//   FallingLeaves / FloatingLeaves   October
//   StringLights a wire of bulbs: off, on, a run that lights bulb by bulb (`onAt`), one twinkle at a time
//   Cloud        a flat lobed cloud drifting a few px/s
//   Branch       a plane-tree branch in a corner gutter, leaves swaying
//   Movers       walkers / joggers / cyclists / dogs on a path (K4 slots via CastSlot), looping or crossing once
//   litAt        the window-switch clock (one window somewhere switches every 0.6-1.5 s)

import React from 'react';
import {CM, INK_PX} from '../../palette';
import {useTime} from '../../../lib/time';
import {wire as wirePath, wirePoint} from '../../../lib/sketch';
import {puffs, windowLit, twinkle, bob} from '../../../v3/film/kit/idle';
import {Batch, Paint, P, Pt, r1, rand, rng, ovalPath, leafPath, lobes, clamp01, frac, ease01, lerp} from './core';
import {CastSlot, PersonSlot, Pose} from './slots';

export {windowLit};

/** Is window i of n lit at t (one window somewhere switches every 0.6-1.5 s). `force` pins states from a time on. */
export const litAt = (t: number, seed: string, i: number, n: number, opts: {gap?: [number, number]; litFrac?: number; force?: {i: number; t: number; on: boolean}[]} = {}) =>
  windowLit(t, seed, i, n, opts);

// ---------------------------------------------------------------- birds

export type BirdsProps = {
  /** Perch line: a straight segment [x0, y0] -> [x1, y1] (a rail, a roof edge) or a sagging wire (sag px). */
  from: Pt;
  to: Pt;
  sag?: number;
  n: number;
  /** Bird length in px (8-24). */
  size?: number;
  seed: string;
  /** Lift-off time(s): the whole row goes at the first; later entries are second groups (half each). */
  liftAt?: number[];
  /** Where they wheel: -1 = west / screen left (default), +1 = right. */
  dir?: 1 | -1;
  /** Highest screen y a flyer may reach (the caption band is y 317-556). Default 580. */
  ceil?: number;
  /** Land back (a new perched row) at this time, e.g. birds that settle on the far roofs. */
  landAt?: number;
  color?: string;
};

/** A row of small birds on a line: bob, peck; on `liftAt` they lift together and wheel away in a loose flock. */
export const Birds: React.FC<BirdsProps> = ({from, to, sag = 0, n, size = 12, seed, liftAt, dir = -1, ceil = 580, landAt, color = CM.anchor}) => {
  const t = useTime();
  const b = new Batch();
  const r = rng(seed);
  const s = size;
  for (let i = 0; i < n; i++) {
    const u = (i + 0.5 + r.jitter(0.3)) / n;
    const [px, py] = sag ? wirePoint(from[0], from[1], to[0], to[1], sag, u) : [lerp(from[0], to[0], u), lerp(from[1], to[1], u)];
    const ph = r.range(0, 6.28);
    const face = r.chance(0.5) ? 1 : -1;
    const group = liftAt && liftAt.length > 1 && i % 2 === 1 ? liftAt[1] : liftAt?.[0];
    const delay = r.range(0, 0.18);
    const fly = group !== undefined && t >= group + delay && !(landAt !== undefined && t >= landAt);
    if (!fly) {
      // perched: a plump body, head, tail; a peck now and then
      const peck = Math.max(0, Math.sin(t * 0.7 + ph) - 0.86) * 6;
      const by = py - s * 0.32 + bob(t, s * 0.03, 0.8, ph);
      b.fill(color, ovalPath(px, by, s * 0.42, s * 0.28));
      b.fill(color, ovalPath(px + face * s * 0.36, by - s * 0.22 + peck * s * 0.05, s * 0.17, s * 0.16));
      b.fill(color, `M${P(px - face * s * 0.3, by - s * 0.04)}L${P(px - face * s * 0.66, by + s * 0.1)}L${P(px - face * s * 0.3, by + s * 0.14)}Z`);
      continue;
    }
    // flying: up off the perch, then a wide wheel toward `dir`, rising and shrinking with distance
    const ft = t - (group as number) - delay;
    const vx = dir * (130 + r.range(0, 70));
    const k = 1 - Math.exp(-ft * 1.1);
    const x = px + vx * ft + Math.sin(ft * 1.6 + ph) * 22 * k + r.jitter(10) * k;
    const lift = Math.min(ft * 180, 60) + ft * r.range(30, 70) - Math.sin(ft * 1.3 + ph) * 18 * k;
    const y = Math.max(ceil + s, py - lift);
    if (x < -60 || x > 1140) continue;
    const sc = 1 - Math.min(0.45, ft * 0.08);
    const flap = Math.sin(ft * 26 + ph);
    const wx = s * 0.62 * sc;
    const wy = s * 0.45 * sc * flap;
    b.fill(color, `M${P(x - wx, y - wy)}Q${P(x - wx * 0.4, y - wy * 0.2 - s * 0.05)} ${P(x, y + s * 0.08 * sc)}Q${P(x + wx * 0.4, y - wy * 0.2 - s * 0.05)} ${P(x + wx, y - wy)}L${P(x + wx * 0.5, y - wy * 0.5 + s * 0.08)}L${P(x, y + s * 0.2 * sc)}L${P(x - wx * 0.5, y - wy * 0.5 + s * 0.08)}Z`);
  }
  return <Paint b={b} seed={`birds/${seed}`} misreg={false} />;
};

/** Pigeons on a ledge: grey bodies, darker heads; shuffle a step, bob heads; optional lift at `liftAt`. */
export const Pigeons: React.FC<{ledge: [number, number, number]; n: number; size?: number; seed: string; liftAt?: number; dir?: 1 | -1; ceil?: number; shuffleAt?: number[]}> = ({ledge, n, size = 20, seed, liftAt, dir = -1, ceil = 580, shuffleAt = []}) => {
  const t = useTime();
  const [x0, x1, y] = ledge;
  const b = new Batch();
  const r = rng(seed);
  const s = size;
  for (let i = 0; i < n; i++) {
    let px = lerp(x0, x1, (i + 0.5 + r.jitter(0.3)) / n);
    const ph = r.range(0, 6.28);
    const face = r.chance(0.5) ? 1 : -1;
    // a shuffle: a few steps along the ledge after each cause (and on a slow own clock)
    for (const a of shuffleAt) px += face * s * 0.5 * ease01(t, a + r.range(0, 0.2), 0.35);
    px += face * s * 0.25 * Math.floor(frac(t / (5 + r.range(0, 4)) + ph) * 2);
    const delay = r.range(0, 0.25);
    if (liftAt !== undefined && t >= liftAt + delay) {
      const ft = t - liftAt - delay;
      const x = px + dir * (110 + r.range(0, 60)) * ft;
      const yy = Math.max(ceil + s, y - s * 0.4 - Math.min(ft * 220, 80) - ft * 40);
      const flap = Math.sin(ft * 22 + ph);
      const wx = s * 0.7;
      const wy = s * 0.5 * flap;
      b.fill(CM.stoneShade, `M${P(x - wx, yy - wy)}Q${P(x, yy - s * 0.1)} ${P(x + wx, yy - wy)}L${P(x + s * 0.25, yy + s * 0.18)}L${P(x - s * 0.25, yy + s * 0.18)}Z`);
      continue;
    }
    const nod = Math.max(0, Math.sin(t * 1.6 + ph) - 0.6) * s * 0.18;
    const by = y - s * 0.34;
    b.fill(CM.stoneShade, ovalPath(px, by, s * 0.46, s * 0.3));
    b.fill(CM.shadeCool, ovalPath(px - face * s * 0.08, by - s * 0.06, s * 0.3, s * 0.16));
    b.fill(CM.shadeCool, ovalPath(px + face * (s * 0.38 + nod * 0.5), by - s * 0.28 + nod * 0.4, s * 0.15, s * 0.15));
    b.fill(CM.shadeCool, `M${P(px - face * s * 0.36, by)}L${P(px - face * s * 0.7, by + s * 0.08)}L${P(px - face * s * 0.34, by + s * 0.16)}Z`);
    b.rect(CM.box, px - s * 0.08, y - s * 0.08, s * 0.05, s * 0.08);
    b.rect(CM.box, px + s * 0.06, y - s * 0.08, s * 0.05, s * 0.08);
  }
  return <Paint b={b} seed={`pigeons/${seed}`} misreg={false} />;
};

// ---------------------------------------------------------------- water birds

export type Duck = {x: number; y: number; size?: number; vx?: number; drake?: boolean};

/** Ducks on the water: paddle slowly with small V wakes, bob; `landAt` brings one more in from the left. */
export const Ducks: React.FC<{ducks: Duck[]; seed: string; landAt?: number; land?: {from: Pt; to: Pt; size?: number}; x0?: number; x1?: number}> = ({ducks, seed, landAt, land, x0 = -40, x1 = 1120}) => {
  const t = useTime();
  const b = new Batch();
  const draw = (x: number, y: number, s: number, face: number, drake: boolean, ph: number, wings = 0) => {
    const by = y - s * 0.22 + bob(t, s * 0.03, 0.6, ph);
    b.layer();
    // wake: two thin paper strokes behind
    b.fill(CM.paper, `M${P(x - face * s * 0.5, y)}L${P(x - face * s * 1.6, y - s * 0.12)}L${P(x - face * s * 1.6, y - s * 0.06)}Z`);
    b.fill(CM.paper, `M${P(x - face * s * 0.5, y + 1)}L${P(x - face * s * 1.5, y + s * 0.14)}L${P(x - face * s * 1.5, y + s * 0.2)}Z`);
    b.fill(drake ? CM.coatOat : CM.line, `M${P(x - s * 0.55, by)}Q${P(x - s * 0.5, by + s * 0.32)} ${P(x, by + s * 0.3)}Q${P(x + s * 0.5, by + s * 0.3)} ${P(x + s * 0.55, by - s * 0.02)}Q${P(x + face * s * 0.1, by - s * 0.3)} ${P(x - s * 0.55, by)}Z`);
    b.fill(drake ? CM.sage : CM.line, ovalPath(x + face * s * 0.4, by - s * 0.32, s * 0.16, s * 0.15));
    b.fill(CM.coatMustard, `M${P(x + face * s * 0.52, by - s * 0.33)}L${P(x + face * s * 0.72, by - s * 0.29)}L${P(x + face * s * 0.52, by - s * 0.25)}Z`);
    if (wings > 0) b.fill(drake ? CM.coatOat : CM.line, `M${P(x - s * 0.2, by - s * 0.1)}L${P(x - face * s * 0.6, by - s * 0.1 - s * 0.7 * wings)}L${P(x + s * 0.2, by - s * 0.1)}Z`);
  };
  ducks.forEach((d, i) => {
    const ph = rand(seed, i) * 6.28;
    const s = d.size ?? 28;
    const vx = d.vx ?? 0;
    const span = x1 - x0;
    const x = vx ? x0 + frac((d.x - x0 + vx * t) / span) * span : d.x + Math.sin(t * 0.3 + ph) * 6;
    draw(x, d.y, s, vx < 0 ? -1 : 1, !!d.drake, ph);
  });
  if (landAt !== undefined && land && t >= landAt - 0.5) {
    const s = land.size ?? 28;
    const k = clamp01((t - (landAt - 0.5)) / 0.5);
    const x = lerp(land.from[0], land.to[0], k) + (t > landAt ? (t - landAt) * 25 * Math.exp(-(t - landAt)) : 0);
    const y = lerp(land.from[1], land.to[1], 1 - (1 - k) * (1 - k));
    draw(x, y, s, land.to[0] >= land.from[0] ? 1 : -1, true, 1, k < 1 ? 1 - k * 0.8 : 0);
    if (t >= landAt && t < landAt + 0.6) {
      // the splash: a short ring of paper dashes
      const q = (t - landAt) / 0.6;
      const R = s * (0.6 + q * 1.4);
      for (let j = 0; j < 6; j++) {
        const a = (j / 6) * Math.PI + 0.25;
        b.fill(CM.paper, ovalPath(land.to[0] + Math.cos(a) * R * (j % 2 ? 1 : -1), land.to[1] - Math.sin(a) * R * 0.25, s * 0.12 * (1 - q), s * 0.05 * (1 - q)));
      }
    }
  }
  return <Paint b={b} seed={`ducks/${seed}`} misreg={false} />;
};

/** A grey heron standing still (on a post top, the bank), one slow head turn at `turnAt` (or on its own clock). */
export const Heron: React.FC<{x: number; y: number; h?: number; face?: 1 | -1; turnAt?: number; seed?: string}> = ({x, y, h = 90, face = -1, turnAt, seed = 'heron'}) => {
  const t = useTime();
  const b = new Batch();
  const ph = rand(seed, 0) * 6.28;
  const turn = turnAt !== undefined ? ease01(t, turnAt, 0.5) : Math.max(0, Math.sin(t * 0.35 + ph) - 0.5) * 2;
  const f = face * (1 - 2 * Math.min(1, turn) * 0); // body keeps facing; only the head swings
  const headDir = turn > 0.5 ? -face : face;
  const legH = h * 0.36;
  // legs
  b.rect(CM.shadeCool, x - h * 0.03, y - legH, h * 0.025, legH);
  b.rect(CM.shadeCool, x + h * 0.02, y - legH, h * 0.025, legH);
  // body: a long tilted drop
  const bx = x;
  const by = y - legH - h * 0.14;
  b.fill(CM.stoneShade, `M${P(bx + f * h * 0.16, by - h * 0.08)}Q${P(bx - f * h * 0.1, by - h * 0.14)} ${P(bx - f * h * 0.24, by + h * 0.06)}Q${P(bx - f * h * 0.05, by + h * 0.16)} ${P(bx + f * h * 0.14, by + h * 0.04)}Z`);
  b.fill(CM.shadeCool, `M${P(bx - f * h * 0.02, by - h * 0.06)}L${P(bx - f * h * 0.26, by + h * 0.08)}L${P(bx - f * h * 0.04, by + h * 0.06)}Z`);
  // neck: an S up to the head
  const nx = bx + f * h * 0.12;
  const ny = by - h * 0.08;
  const hx = nx + headDir * h * 0.06;
  const hy = ny - h * 0.3;
  b.ink(`M${P(nx, ny)}C${P(nx - f * h * 0.08, ny - h * 0.12)} ${P(hx + headDir * h * 0.04, hy + h * 0.14)} ${P(hx, hy)}`, Math.max(2.2, h * 0.045), CM.paper);
  b.fill(CM.paper, ovalPath(hx, hy, h * 0.05, h * 0.04));
  b.rect(CM.anchor, hx - h * 0.04, hy - h * 0.04, h * 0.07, h * 0.02);
  b.fill(CM.coatMustard, `M${P(hx + headDir * h * 0.03, hy - h * 0.012)}L${P(hx + headDir * h * 0.17, hy + h * 0.008)}L${P(hx + headDir * h * 0.03, hy + h * 0.02)}Z`);
  return <Paint b={b} seed={`heron/${seed}`} misreg={false} />;
};

// ---------------------------------------------------------------- smoke and steam

export type PuffsProps = {
  x: number;
  y: number;
  seed: string;
  /** 'smoke' (chimneys, boat stoves: stone grey) | 'steam' (urns, kettles, mugs: paper white). */
  kind?: 'smoke' | 'steam';
  /** Puff size scale (1 = a boat chimney seen at ~40 px). */
  scale?: number;
  /** Extra big puffs at these times (a chimney "puffs" on a beat). */
  bursts?: number[];
  /** Highest y any puff may reach (default 580: under the caption band). */
  ceil?: number;
  drift?: number;
};

/** A puff train that rises, drifts with the canal wind and shrinks to nothing (no fade). */
export const Puffs: React.FC<PuffsProps> = ({x, y, seed, kind = 'smoke', scale = 1, bursts = [], ceil = 580, drift = -36}) => {
  const t = useTime();
  const b = new Batch();
  const col = kind === 'steam' ? CM.paper : CM.stoneShade;
  const col2 = kind === 'steam' ? CM.lampCore : CM.paving;
  const ps = puffs(t, {n: 5, life: kind === 'steam' ? 1.8 : 2.8, rise: 110 * scale, drift: drift * scale, r0: 5 * scale, r1: 17 * scale, wobble: 5 * scale, seed, ceil}, y);
  ps.forEach((p, i) => b.fill(i % 2 ? col : col2, ovalPath(x + p.x, y + p.y, p.r, p.r * 0.86)));
  for (const a of bursts) {
    const k = (t - a) / 1.4;
    if (k < 0 || k > 1) continue;
    const r = 26 * scale * (k < 0.3 ? k / 0.3 : Math.pow(1 - (k - 0.3) / 0.7, 0.8));
    const py = Math.max(ceil + r, y - 40 * scale - k * 120 * scale);
    if (r > 0.6) b.fill(col, ovalPath(x + drift * scale * k * 1.4, py, r, r * 0.85));
  }
  return <Paint b={b} seed={`puffs/${seed}`} misreg={false} />;
};

// ---------------------------------------------------------------- leaves

const LEAF_COLS = [CM.leafGold, CM.leafRust, CM.leafGold, CM.coatMustard];

/** Leaves falling through a box [x0, x1] x [y0, y1] (October): drift, sway and spin (scaleX), looping. */
export const FallingLeaves: React.FC<{box: [number, number, number, number]; n: number; size?: number; seed: string; wind?: number}> = ({box, n, size = 12, seed, wind = -30}) => {
  const t = useTime();
  const [x0, y0, x1, y1] = box;
  const b = new Batch();
  const r = rng(seed);
  for (let i = 0; i < n; i++) {
    const period = r.range(4, 7);
    const ph = r.next();
    const u = frac(t / period + ph);
    const sx = r.range(x0, x1);
    const x = sx + wind * u * period + Math.sin(u * 9 + i) * 18;
    const y = lerp(y0, y1, u);
    const s = size * r.range(0.7, 1.2);
    const spin = Math.cos(t * r.range(3, 6) + i);
    b.fill(LEAF_COLS[i % LEAF_COLS.length], leafPath(x, y, s, Math.max(1.2, s * 0.32 * Math.abs(spin)), r.range(0, 180) + t * 40));
  }
  return <Paint b={b} seed={`leaves/${seed}`} misreg={false} />;
};

/** Leaves floating on the water, drifting with the current (px/s) and bobbing; wrap across [x0, x1]. */
export const FloatingLeaves: React.FC<{y0: number; y1: number; x0?: number; x1?: number; n: number; size?: number; seed: string; current?: number}> = ({y0, y1, x0 = -20, x1 = 1100, n, size = 12, seed, current = -8}) => {
  const t = useTime();
  const b = new Batch();
  const r = rng(seed);
  for (let i = 0; i < n; i++) {
    const y = r.range(y0, y1);
    const k = (y - y0) / Math.max(1, y1 - y0);
    const s = size * (0.6 + 0.6 * k) * r.range(0.8, 1.2);
    const span = x1 - x0;
    const x = x0 + frac((r.range(0, span) + current * (0.6 + 0.6 * k) * t) / span) * span;
    b.fill(LEAF_COLS[i % LEAF_COLS.length], leafPath(x, y + Math.sin(t * 1.2 + i) * 1.2, s, s * 0.22, r.range(-20, 20)));
  }
  return <Paint b={b} seed={`fleaves/${seed}`} misreg={false} />;
};

// ---------------------------------------------------------------- string lights

export type StringLightsProps = {
  from: Pt;
  to: Pt;
  sag?: number;
  n: number;
  seed: string;
  /** Bulbs light one by one along the wire from this time (the run); before it they are off. Omit = `on`. */
  onAt?: number;
  /** Seconds between bulbs in the run. */
  step?: number;
  /** Steady state when there is no run. */
  on?: boolean;
  /** Bulb radius (px). */
  r?: number;
  /** Wire line weight (0 = no ink). */
  w?: number;
  /** Run direction: 1 = from `from` to `to`, -1 = reverse. */
  runDir?: 1 | -1;
};

/** A festoon of bulbs on a sagging wire: off (paper), on (lamp), a run that lights them in order, one twinkle at a time. */
export const StringLights: React.FC<StringLightsProps> = ({from, to, sag = 24, n, seed, onAt, step = 0.035, on = false, r = 5, w = INK_PX.hair, runDir = 1}) => {
  const t = useTime();
  const b = new Batch();
  b.ink(wirePath(from[0], from[1], to[0], to[1], sag, {seed: `sl/${seed}`}), w, CM.ink);
  b.layer();
  for (let i = 0; i < n; i++) {
    const u = (i + 0.5) / n;
    const [x, y] = wirePoint(from[0], from[1], to[0], to[1], sag, u);
    const order = runDir > 0 ? i : n - 1 - i;
    const lit = onAt !== undefined ? t >= onAt + order * step : on;
    const dim = lit && twinkle(t, seed, i, n, 0.45, 0.12);
    const col = !lit ? CM.paper : dim ? CM.lamp : i % 3 === 0 ? CM.lampCore : CM.lamp;
    b.fill(col, ovalPath(x, y + r * 0.9, r * 0.8, r));
    b.rect(CM.ink, x - r * 0.3, y, r * 0.6, r * 0.35);
  }
  return <Paint b={b} seed={`sl/${seed}`} misreg={false} />;
};

// ---------------------------------------------------------------- sky things

/** A flat lobed cloud (no ink), drifting `speed` px/s. Keep it out of the caption band (y 317-556). */
export const Cloud: React.FC<{x: number; y: number; w: number; h: number; seed: string; speed?: number; color?: string; top?: string}> = ({x, y, w, h, seed, speed = 2, color = CM.skyHigh, top}) => {
  const t = useTime();
  const dx = speed * t;
  const b = new Batch();
  b.fill(color, lobes(x + dx, x + dx + w, y + h, h, seed));
  if (top) b.fill(top, lobes(x + dx + w * 0.15, x + dx + w * 0.62, y + h * 0.62, h * 0.62, `${seed}/t`));
  return <Paint b={b} seed={`cloud/${seed}`} misreg={false} />;
};

/** A plane-tree branch reaching in from a top corner (side -1 = left edge): twigs in ink, autumn leaf clusters that
 *  sway; keep it inside y 0-240 so the caption band stays clear. */
export const Branch: React.FC<{side?: 1 | -1; y?: number; reach?: number; seed: string; drop?: number}> = ({side = -1, y = 40, reach = 330, seed, drop = 170}) => {
  const t = useTime();
  const b = new Batch();
  const r = rng(seed);
  const X = (u: number) => (side < 0 ? u : 1080 - u);
  const sw = (k: number) => Math.sin(t * 0.9 + k) * 3 + Math.sin(t * 2.1 + k * 1.7) * 1.2;
  // the limb: a thick tapered fill + twigs
  const limb: Pt[] = [
    [X(-20), y - 20],
    [X(reach * 0.45), y + drop * 0.35],
    [X(reach), y + drop * 0.55],
  ];
  b.fill(CM.line, `M${P(X(-20), y - 34)}Q${P(X(reach * 0.5), y + drop * 0.18)} ${P(limb[2][0] + sw(0), limb[2][1])}Q${P(X(reach * 0.45), y + drop * 0.32)} ${P(X(-20), y + 8)}Z`);
  b.layer();
  const tips: Pt[] = [];
  for (let i = 0; i < 7; i++) {
    const u = 0.25 + (i / 6) * 0.75;
    const bx = lerp(X(0), limb[2][0], u);
    const by = lerp(y - 10, limb[2][1], u * u);
    const ang = (i % 2 ? 1 : -1) * r.range(30, 70);
    const L = r.range(40, 90);
    const a = ((side < 0 ? 0 : 180) + ang) * (Math.PI / 180);
    const tx = bx + Math.cos(a) * L + sw(i);
    const ty = Math.min(y + drop, by + Math.sin(a) * L * 0.6 + 20);
    b.ink(`M${P(bx, by)}Q${P((bx + tx) / 2, (by + ty) / 2 - 8)} ${P(tx, ty)}`, INK_PX.mid);
    tips.push([tx, ty]);
  }
  b.layer();
  // leaf clusters: plane leaves as lobed masses, a few single leaves at the edges
  tips.concat([limb[2]]).forEach(([x, yy], i) => {
    const col = [CM.sage, CM.leafGold, CM.sage, CM.leafRust, CM.coatMustard][i % 5];
    const R = r.range(22, 38);
    const cy = Math.min(y + drop - R * 0.5, yy);
    b.fill(col, lobes(x - R, x + R, cy + R * 0.5, R * 1.3, `${seed}/c${i}`, 3));
    for (let k = 0; k < 3; k++) b.fill(LEAF_COLS[(i + k) % 4], leafPath(x + r.jitter(R), cy + r.jitter(R * 0.5) + R * 0.4, 14, 5, r.range(0, 180) + sw(k) * 4));
  });
  return <Paint b={b} seed={`branch/${seed}`} />;
};

// ---------------------------------------------------------------- movers (K4 slots)

export type Mover = {
  pose: Pose;
  /** Path: a straight screen segment (y may differ: a towpath bending away), or a function u -> {x, y, s}. */
  from: Pt;
  to: Pt;
  /** Height in px at `from` and at `to` (a bend away shrinks them). */
  h: number | [number, number];
  /** px/s along the path. Walk ~40-70, jog ~110, bike ~170-220. */
  speed: number;
  /** 0..1 where it is at t = 0 (looping), or with `once` the time it enters. */
  phase?: number;
  /** Cross once from t = enter (no loop). */
  enter?: number;
  /** Off-screen pause (s) between loops. */
  pause?: number;
  seed: string;
  acc?: string;
  coat?: string;
};

/** People (and dogs, bikes) moving along paths; each frame becomes a PersonSlot rendered by K4 (or a placeholder). */
export const Movers: React.FC<{movers: Mover[]; idPrefix?: string}> = ({movers, idPrefix = 'mv'}) => {
  const t = useTime();
  const out: React.ReactNode[] = [];
  movers.forEach((m, i) => {
    const L = Math.hypot(m.to[0] - m.from[0], m.to[1] - m.from[1]) || 1;
    const T = L / Math.max(1e-6, m.speed);
    let u: number;
    if (m.enter !== undefined) {
      u = (t - m.enter) / T;
      if (u < 0 || u > 1) return;
    } else {
      const TT = T + (m.pause ?? 0);
      const v = frac(t / TT + (m.phase ?? 0)) * TT;
      u = v / T;
      if (u > 1) return;
    }
    const x = lerp(m.from[0], m.to[0], u);
    const y = lerp(m.from[1], m.to[1], u);
    const h = Array.isArray(m.h) ? lerp(m.h[0], m.h[1], u) : m.h;
    const dir: 1 | -1 = m.to[0] >= m.from[0] ? 1 : -1;
    const s: PersonSlot = {id: `${idPrefix}${i}`, x, y, h, pose: m.pose, dir, seed: m.seed, acc: m.acc, coat: m.coat, gait: t};
    out.push(<CastSlot key={i} s={s} />);
  });
  return <>{out}</>;
};

export {lobes};
