// canal/far.tsx: the far world past the canal. Seeded rows of London roofs (pitched terraces with chimney stacks and
// pots, mansards, a shed roof, a warehouse with a hoist, aerials) in flat depth steps (far = cool stone, then light
// brick, then brick), King's-Cross-like gasholder frames, a brick viaduct with an occasional train, a road bridge
// over the canal with an occasional bus, and warehouses. Far planes are fill-only or hair-lined (never 4.8 px ink).

import React, {useMemo} from 'react';
import {CM, INK_PX} from '../../palette';
import {useTime} from '../../../lib/time';
import {line} from '../../../lib/sketch';
import {Batch, Paint, P, rng, ovalPath, domePath, lobes, lerp, frac, r1} from './core';
import {litAt} from './life';

export type RowOpts = {
  x0: number;
  x1: number;
  /** Ground / base y (hidden by what stands in front, usually). */
  base: number;
  /** Typical roof-ridge y and its spread (px). */
  top: number;
  spread?: number;
  seed: string;
  /** Wall colours to cycle through (local colour variety). */
  walls: string[];
  roof?: string;
  /** Building width range (px). */
  wRange?: [number, number];
  /** Ink weight (0 = fill only). */
  ink?: number;
  /** Windows: 0 = none, else a size in px. */
  win?: number;
  /** Lit windows share (0..1) and the switching clock seed (sunset rows switch). */
  lit?: number;
  /** Never draw above this y (keeps the caption band clear). */
  ceil?: number;
  t?: number;
};

/** One row of roofs (terraces, mansards, sheds, warehouses, a chimney-stack skyline), batched into `b`. */
export function roofRowInto(b: Batch, o: RowOpts) {
  const r = rng(o.seed);
  const ceil = o.ceil ?? 590;
  const [w0, w1] = o.wRange ?? [60, 150];
  const roof = o.roof ?? CM.brickDeep;
  const ink = o.ink ?? 0;
  let x = o.x0 - r.range(0, w1 * 0.6);
  let i = 0;
  const wins: [number, number, number, number, number][] = [];
  let lines = '';
  while (x < o.x1) {
    const w = r.range(w0, w1);
    const kind = r.weighted([
      ['pitch', 4],
      ['mansard', 2],
      ['flat', 2],
      ['shed', 1],
      ['gable', 2],
    ] as const);
    const top = Math.max(ceil + 12, o.top + r.jitter(o.spread ?? 24));
    const wall = o.walls[i % o.walls.length];
    const rh = Math.min(w * 0.35, 46);
    // wall
    b.rect(wall, x, top, w + 1, o.base - top);
    // roof shapes
    if (kind === 'pitch') b.poly(roof, [[x - 2, top], [x + w * 0.12, top - rh * 0.8], [x + w * 0.88, top - rh * 0.8], [x + w + 2, top]]);
    if (kind === 'mansard') {
      b.poly(CM.shadeCool, [[x - 1, top], [x + w * 0.08, top - rh], [x + w * 0.92, top - rh], [x + w + 1, top]]);
      b.rect(CM.shadeCool, x + w * 0.08, top - rh - 3, w * 0.84, 3);
      for (let k = 0; k < Math.floor(w / 34); k++) b.rect(CM.paper, x + w * 0.16 + k * 34, top - rh * 0.7, 10, rh * 0.45);
    }
    if (kind === 'flat') b.rect(CM.stoneShade, x - 1, top - 6, w + 2, 6);
    if (kind === 'shed') {
      const n = Math.max(2, Math.round(w / 34));
      const pts: [number, number][] = [[x, top]];
      for (let k = 0; k < n; k++) {
        pts.push([x + ((k + 0.82) * w) / n, top - rh * 0.6]);
        pts.push([x + ((k + 1) * w) / n, top]);
      }
      b.poly(roof, pts);
    }
    if (kind === 'gable') b.poly(roof, [[x - 3, top], [x + w / 2, top - rh * 1.15], [x + w + 3, top]]);
    // chimney stacks with pots on pitched / gable / mansard roofs
    if (kind !== 'flat' && kind !== 'shed') {
      const ns = r.int(1, 2);
      for (let k = 0; k < ns; k++) {
        const cx = x + w * (ns === 1 ? r.range(0.3, 0.7) : k === 0 ? r.range(0.12, 0.3) : r.range(0.7, 0.88));
        const ch = r.range(16, 30);
        const ct = Math.max(ceil + 8, top - rh * 0.8 - ch);
        const cw = r.range(12, 22);
        b.rect(wall === CM.brickLight ? CM.brick : CM.brickLight, cx - cw / 2, ct, cw, top - ct);
        b.rect(CM.stoneShade, cx - cw / 2 - 2, ct, cw + 4, 3);
        const pots = Math.max(1, Math.round(cw / 7));
        for (let p = 0; p < pots; p++) b.rect(r.chance(0.5) ? CM.leafRust : CM.brickDeep, cx - cw / 2 + 2 + (p * (cw - 4)) / pots, Math.max(ceil + 2, ct - 6), Math.max(3, (cw - 4) / pots - 2), 6);
        if (ink > 0) lines += line(cx - cw / 2, ct, cx - cw / 2, top - rh * 0.5, {seed: `${o.seed}/c${i}${k}`, over: 'small'});
        // a TV aerial on some stacks
        if (r.chance(0.35)) {
          const ay = Math.max(ceil + 2, ct - r.range(16, 30));
          lines += `M${P(cx, ct - 6)}L${P(cx, ay)}M${P(cx - 9, ay + 4)}L${P(cx + 9, ay + 4)}M${P(cx - 6, ay + 9)}L${P(cx + 6, ay + 9)}`;
        }
      }
    }
    // windows: rows of small panes (some lit)
    if (o.win && o.win > 0) {
      const ww = o.win;
      const cols = Math.max(1, Math.floor((w - ww) / (ww * 2.2)));
      const rows = Math.max(1, Math.floor((o.base - top - ww) / (ww * 2.4)));
      for (let rr = 0; rr < rows; rr++) {
        for (let c = 0; c < cols; c++) {
          const wx = x + (w - cols * ww * 2.2) / 2 + c * ww * 2.2 + ww * 0.6;
          const wy = top + ww * 0.9 + rr * ww * 2.4;
          if (wy + ww * 1.4 > o.base) continue;
          wins.push([wx, wy, ww, ww * 1.55, wins.length]);
        }
      }
    }
    if (ink > 0) lines += line(x, top, x, top + Math.min(80, (o.base - top) * 0.6), {seed: `${o.seed}/w${i}`, over: 'small'});
    x += w;
    i++;
  }
  // windows batched: unlit panes, lit ones switch on a shared clock
  const n = wins.length;
  const rw = rng(`${o.seed}/wincol`);
  for (const [wx, wy, ww, wh, k] of wins) {
    const on = o.lit && o.lit > 0 ? litAt(o.t ?? 0, o.seed, k, n, {litFrac: o.lit, gap: [0.8, 2.2]}) : false;
    const v = rw.next();
    const col = on ? CM.lamp : v < 0.55 ? CM.paneUnlit : v < 0.85 ? CM.glass : CM.shadeCool;
    b.rect(col, wx, wy, ww, wh);
    if (!on && v < 0.55 && ww >= 6) b.rect(CM.glass, wx, wy, ww, wh * 0.3);
  }
  if (ink > 0 && lines) b.ink(lines, ink);
}

export type FarRoofsProps = {
  x0?: number;
  x1?: number;
  /** y of the row bases (the canal bank or a wall hides them) and the skyline's typical top. */
  base: number;
  top: number;
  seed: string;
  /** 1-3 rows, far to near. */
  rows?: 1 | 2 | 3;
  /** Lit window share for the nearest row (sunset rows switch). */
  lit?: number;
  ceil?: number;
  /** Window size of the nearest row (px). */
  win?: number;
};

/** Two or three rows of far roofs in flat depth steps (cool stone far, light brick mid, brick near). */
export const FarRoofs: React.FC<FarRoofsProps> = ({x0 = -60, x1 = 1140, base, top, seed, rows = 3, lit = 0, ceil = 590, win = 7}) => {
  const t = useTime();
  const staticB = useMemo(() => {
    const b = new Batch();
    if (rows >= 3) roofRowInto(b, {x0, x1, base, top: top - 46, spread: 30, seed: `${seed}/far`, walls: [CM.stoneShade, CM.limestone, CM.stoneShade], roof: CM.shadeCool, wRange: [40, 110], ceil});
    b.layer();
    if (rows >= 2) roofRowInto(b, {x0, x1, base, top: top - 20, spread: 22, seed: `${seed}/mid`, walls: [CM.brickLight, CM.stucco, CM.brickLight, CM.limestone], roof: CM.shadeWarm, wRange: [50, 130], ceil, win: win * 0.7});
    return b;
  }, [x0, x1, base, top, seed, rows, ceil, win]);
  const near = new Batch();
  roofRowInto(near, {x0, x1, base, top, spread: 18, seed: `${seed}/near`, walls: [CM.brick, CM.brickLight, CM.stucco, CM.brickDeep, CM.brick], roof: CM.brickDeep, wRange: [60, 150], ink: INK_PX.hair, win, lit, t, ceil});
  return (
    <>
      <Paint b={staticB} seed={`far/${seed}`} misreg={false} />
      <Paint b={near} seed={`farnear/${seed}`} />
    </>
  );
};

/** A gasholder guide frame (King's Cross style): columns in a ring seen side-on, ring girders, lattice crosses; an
 *  optional drum inside. cx, base y, radius r (px), height h. */
export function gasholderInto(b: Batch, cx: number, base: number, r: number, h: number, seed: string, o: {drum?: number; color?: string; ink?: number; ceil?: number} = {}) {
  const col = o.color ?? CM.shadeCool;
  const ceil = o.ceil ?? 590;
  const top = Math.max(ceil + 4, base - h);
  if (o.drum) b.rect(o.drum > 0 ? CM.limestone : CM.stoneShade, cx - r * 0.86, Math.max(ceil + 10, base - h * 0.55), r * 1.72, base - Math.max(ceil + 10, base - h * 0.55));
  const n = 9;
  const cw = Math.max(2, r * 0.035);
  let d = '';
  const xs: number[] = [];
  for (let k = 0; k < n; k++) {
    const a = Math.PI * (k / (n - 1));
    xs.push(cx - Math.cos(a) * r);
  }
  for (const x of xs) b.rect(col, x - cw / 2, top, cw, base - top);
  const rings = 3;
  for (let k = 0; k <= rings; k++) {
    const y = top + ((base - top) * k) / (rings + 0.6);
    b.rect(col, cx - r - cw, y, 2 * r + 2 * cw, Math.max(2, cw * 1.2));
    if (k < rings) {
      const y2 = top + ((base - top) * (k + 1)) / (rings + 0.6);
      for (let j = 0; j < n - 1; j++) d += `M${P(xs[j], y)}L${P(xs[j + 1], y2)}M${P(xs[j + 1], y)}L${P(xs[j], y2)}`;
    }
  }
  b.ink(d, o.ink ?? 1.2, col);
}

/** A brick viaduct: a deck on a row of arches (x0..x1), deck top y, base y, arch pitch. */
export function viaductInto(b: Batch, x0: number, x1: number, deck: number, base: number, pitch: number, seed: string, ink = 0) {
  const pierW = pitch * 0.22;
  const dh = Math.max(6, (base - deck) * 0.16);
  b.rect(CM.brick, x0, deck, x1 - x0, dh);
  b.rect(CM.stoneShade, x0, deck - 3, x1 - x0, 3);
  for (let x = x0; x < x1; x += pitch) {
    b.rect(CM.brick, x, deck + dh - 1, pierW, base - deck - dh + 1);
    const ax = x + pierW;
    const aw = pitch - pierW;
    // spandrels: brick above the arch (fill between the deck and the arch curve)
    b.fill(CM.brick, `M${P(ax, deck + dh)}L${P(ax + aw, deck + dh)}L${P(ax + aw, deck + dh + aw * 0.5)}A${r1(aw / 2)} ${r1(aw / 2)} 0 0 0 ${P(ax, deck + dh + aw * 0.5)}Z`);
  }
  if (ink > 0) b.ink(line(x0, deck, x1, deck, {seed: `${seed}/deck`, over: 'small'}), ink);
}

/** A train of carriages crossing a viaduct deck: from the left at speed px/s, every `every` s. */
export const ViaductTrain: React.FC<{x0: number; x1: number; deck: number; h: number; seed: string; speed?: number; every?: number; phase?: number}> = ({x0, x1, deck, h, seed, speed = 160, every = 9, phase = 0}) => {
  const t = useTime();
  const len = h * 14;
  const span = x1 - x0 + len;
  const T = Math.max(span / speed, every);
  const u = frac(t / T + phase) * T * speed;
  if (u > span) return null;
  const b = new Batch();
  const head = x0 - len + u;
  for (let k = 0; k < 4; k++) {
    const cx = head + k * h * 3.5;
    b.rect(k === 3 ? CM.coatMustard : CM.limestone, cx, deck - h, h * 3.3, h);
    b.rect(CM.paneUnlit, cx + h * 0.3, deck - h * 0.72, h * 2.7, h * 0.32);
  }
  return <Paint b={b} seed={`train/${seed}`} misreg={false} />;
};

/** A road bridge over the canal seen side-on: a parapet and deck (top y `deck`), an arch opening down to the water,
 *  brick spandrels and stone voussoirs. x0..x1 span; the arch centre at archX. */
export function roadBridgeInto(b: Batch, x0: number, x1: number, deck: number, water: number, archX: number, archW: number, seed: string, ink = INK_PX.far) {
  const r = rng(seed);
  const ph = Math.max(14, (water - deck) * 0.24);
  // the parapet (brick, a limestone coping), the deck face (light brick), a string course under the deck
  b.rect(CM.stucco, x0, deck - ph, x1 - x0, ph);
  for (let x = x0 + 6; x < x1; x += 9) b.rect(CM.stoneShade, x, deck - ph + 4, 3.5, ph - 6);
  b.rect(CM.limestone, x0, deck - ph - 6, x1 - x0, 6);
  b.rect(CM.brickLight, x0, deck, x1 - x0, water - deck);
  b.rect(CM.limestone, x0, deck, x1 - x0, 7);
  b.rect(CM.stoneShade, x0, deck + 7, x1 - x0, 4);
  // the arch opening (a light stone shade, so ink in front still reads), the far water through it
  const ar = archW / 2;
  const springY = water - ar * 0.3;
  b.fill(CM.stoneShade, `M${P(archX - ar, water)}L${P(archX - ar, springY)}A${r1(ar)} ${r1(ar * 0.8)} 0 0 1 ${P(archX + ar, springY)}L${P(archX + ar, water)}Z`);
  b.rect(CM.waterDeep, archX - ar, water - 7, archW, 7);
  // voussoir ring (stone)
  b.fill(CM.limestone, `M${P(archX - ar - 12, springY)}A${r1(ar + 12)} ${r1(ar * 0.8 + 12)} 0 0 1 ${P(archX + ar + 12, springY)}L${P(archX + ar, springY)}A${r1(ar)} ${r1(ar * 0.8)} 0 0 0 ${P(archX - ar, springY)}Z`);
  let v = '';
  for (let k = 0; k <= 12; k++) {
    const a = Math.PI + (Math.PI * k) / 12;
    v += `M${P(archX + Math.cos(a) * ar, springY + Math.sin(a) * ar * 0.8)}L${P(archX + Math.cos(a) * (ar + 12), springY + Math.sin(a) * (ar * 0.8 + 12))}`;
  }
  b.ink(v, Math.max(1.2, ink * 0.6), CM.line);
  b.ink(line(x0, deck - ph, x1, deck - ph, {seed: `${seed}/p`, over: 'medium'}) + line(x0, deck, x1, deck, {seed: `${seed}/d`, over: 'small'}) + `M${P(archX - ar, water)}L${P(archX - ar, springY)}A${r1(ar)} ${r1(ar * 0.8)} 0 0 1 ${P(archX + ar, springY)}L${P(archX + ar, water)}`, ink, CM.ink, 0.15);
  // parapet pilasters and a lamp standard on the bridge
  for (let x = x0 + r.range(20, 60); x < x1; x += r.range(110, 160)) b.rect(CM.limestone, x, deck - ph - 10, 12, ph + 10);
}

/** A bus crossing the road bridge (a flat double-decker, no livery or lettering): enters at `at`, px/s, dir. */
export const BridgeBus: React.FC<{deck: number; h: number; at: number; from: number; to: number; seed?: string; speed?: number}> = ({deck, h, at, from, to, seed = 'bus', speed = 180}) => {
  const t = useTime();
  const dir = to >= from ? 1 : -1;
  const L = h * 2.3;
  const x = from + dir * (t - at) * speed;
  if (t < at || (dir > 0 ? x - L > to : x + L < to)) return null;
  const b = new Batch();
  const y0 = deck - h;
  b.rect(CM.brick, x - L / 2, y0, L, h);
  b.rect(CM.paper, x - L / 2 + h * 0.12, y0 + h * 0.14, L - h * 0.24, h * 0.18);
  b.rect(CM.paper, x - L / 2 + h * 0.12, y0 + h * 0.52, L - h * 0.24, h * 0.16);
  b.rect(CM.anchor, x - L / 2 + h * 0.2, deck - h * 0.08, h * 0.22, h * 0.1);
  b.rect(CM.anchor, x + L / 2 - h * 0.42, deck - h * 0.08, h * 0.22, h * 0.1);
  return <Paint b={b} seed={`bus/${seed}`} misreg={false} />;
};

/** A canal warehouse: brick, arched windows in rows, a loading door with a hoist beam, a parapet name band (blank). */
export function warehouseInto(b: Batch, x: number, base: number, w: number, h: number, seed: string, o: {ink?: number; lit?: number; t?: number; ceil?: number; color?: string} = {}) {
  const ceil = o.ceil ?? 590;
  const top = Math.max(ceil + 6, base - h);
  b.rect(o.color ?? CM.brickDeep, x, top, w, base - top);
  b.rect(CM.limestone, x - 3, top, w + 6, 6);
  b.rect(CM.stucco, x + w * 0.1, top + 12, w * 0.8, 10);
  const cols = Math.max(2, Math.round(w / 46));
  const rows = Math.max(2, Math.round((base - top) / 70));
  const ww = (w / cols) * 0.42;
  const wh = ww * 1.5;
  let k = 0;
  for (let rr = 0; rr < rows; rr++) {
    for (let c = 0; c < cols; c++) {
      const wx = x + (w / cols) * (c + 0.5) - ww / 2;
      const wy = top + 34 + rr * ((base - top - 40) / rows);
      if (wy + wh > base - 4) continue;
      const door = c === Math.floor(cols / 2);
      if (door) {
        b.rect(CM.line, wx - ww * 0.15, wy, ww * 1.3, wh * 1.1);
        b.rect(CM.coatMustard, wx + ww * 0.1, wy + wh * 0.12, ww * 0.8, 3);
      } else {
        const on = o.lit ? litAt(o.t ?? 0, seed, k, rows * cols, {litFrac: o.lit, gap: [0.9, 2.4]}) : false;
        b.fill(on ? CM.lamp : CM.paneUnlit, `M${P(wx, wy + wh)}L${P(wx, wy + ww / 2)}A${r1(ww / 2)} ${r1(ww / 2)} 0 0 1 ${P(wx + ww, wy + ww / 2)}L${P(wx + ww, wy + wh)}Z`);
        b.rect(CM.limestone, wx - 2, wy + wh, ww + 4, 3);
      }
      k++;
    }
  }
  // hoist beam over the loading doors
  const hx = x + w / 2;
  b.rect(CM.anchor, hx - 3, top + 22, 6, 10);
  b.rect(CM.anchor, hx - 2, top + 26, 22, 4);
  if (o.ink && o.ink > 0) b.ink(line(x, top, x, base, {seed: `${seed}/l`, over: 'small'}) + line(x + w, top, x + w, base, {seed: `${seed}/r`, over: 'small'}), o.ink);
}

export {domePath, ovalPath, lobes, lerp};
