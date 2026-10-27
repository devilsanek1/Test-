// V2S1 world (lane L1): the shared helpers of the S1 world parts (V2S1_set*.tsx). Two jobs the kit's Paint can't do:
//   CellPaint  a Batch painted with its fills SPLIT BY REGION (cells of `cell` px, by each shape's bbox centre), so the
//              Look cascade (the flood out of SUN0, V2S1_clock FLOOD) colours a big piece region by region, "shape by
//              shape", instead of one colour of the whole set at once. All regions of one (layer, colour) share ONE
//              misregistration offset, so strips of one wall never open seams.
//   Under      the frame-0 UNDERDRAWING: ink that only the bare-line state shows. Far planes and the water get no ink
//              in colour (STYLE section 3), so their lines live only until the flood reaches their region (floodAt):
//              each group vanishes on the frame its own colour lands. t < 0 (the loop underlay) shows it all.
// Plus small drawing helpers: thin bars as FILLS (a thin coloured element is a thin fill, never a coloured line).
// Every line here is CM.ink: never a coloured stroke (STYLE section 3).
import React, {useMemo} from 'react';
import {Fill, bbox} from '../../lib/Fill';
import {Ink} from '../../lib/Ink';
import {useTime} from '../../lib/time';
import {rng} from '../../lib/rng';
import {CM} from '../palette';
import {Batch, P, Pt} from '../kit/canal/core';
import {floodAt} from './V2S1_clock';

export type {Pt};

/** One fill misregistration (2-4 px in a seeded direction) for an object part: STYLE "fills 2-5 px off the line". */
export function offsetFor(seed: string, k = 1): [number, number] {
  const r = rng(`s1off/${seed}`);
  const a = r.range(0, Math.PI * 2);
  const m = r.range(2, 3.6) * k;
  return [Math.cos(a) * m, Math.sin(a) * m * 0.8];
}

// ---------------------------------------------------------------- CellPaint

type Group = {key: string; color: string; d: string; off: [number, number] | false};
type InkG = {key: string; w: number; color: string; open: number; d: string};
type Split = {fills: Group[]; inks: InkG[]}[];

const centreCache = new Map<string, [number, number]>();
function centreOf(d: string): [number, number] {
  let c = centreCache.get(d);
  if (!c) {
    const b = bbox(d);
    c = [b.x + b.w / 2, b.y + b.h / 2];
    if (centreCache.size > 60000) centreCache.clear();
    centreCache.set(d, c);
  }
  return c;
}

function split(b: Batch, cell: number, seed: string, misreg: number): Split {
  return b.layers.map((l, i) => {
    const fills: Group[] = [];
    l.fills.forEach((parts, color) => {
      const off: [number, number] | false = misreg > 0 ? offsetFor(`${seed}/${i}/${color}`, misreg) : false;
      const cells = new Map<string, string[]>();
      for (const d of parts) {
        const [cx, cy] = centreOf(d);
        const k = `${Math.floor(cx / cell)},${Math.floor(cy / cell)}`;
        const a = cells.get(k);
        if (a) a.push(d);
        else cells.set(k, [d]);
      }
      cells.forEach((ds, k) => fills.push({key: `f${i}|${color}|${k}`, color, d: ds.join(''), off}));
    });
    const inks: InkG[] = [];
    l.inks.forEach((run, k) => inks.push({key: `i${i}|${k}`, w: run.w, color: run.color, open: run.open, d: run.parts.join('')}));
    return {fills, inks};
  });
}

export type CellPaintProps = {
  b: Batch;
  seed: string;
  /** Region size (px): a shape floods when the front reaches its region's bbox centre. */
  cell?: number;
  /** Misregistration scale (0 = exact registration: tiny things). */
  misreg?: number;
  /** true: the batch is rebuilt every frame (moving / switching things): skip the memo. */
  live?: boolean;
};

/** Renders a Batch: per layer, its fills split by region (one <Fill> per colour per cell), then its inks. */
export const CellPaint: React.FC<CellPaintProps> = ({b, seed, cell = 120, misreg = 1, live = false}) => {
  const memo = useMemo(() => (live ? null : split(b, cell, seed, misreg)), [live ? null : b, cell, seed, misreg, live]);
  const s = memo ?? split(b, cell, seed, misreg);
  return (
    <>
      {s.map((l, i) => (
        <React.Fragment key={i}>
          {l.fills.map((g) => (
            <Fill key={g.key} d={g.d} color={g.color} offset={g.off} seed={`${seed}/${g.key}`} />
          ))}
          {l.inks.map((g) => (
            <Ink key={g.key} d={g.d} width={g.w} color={CM.ink} open={g.open} seed={`${seed}/${g.key}`} />
          ))}
        </React.Fragment>
      ))}
    </>
  );
};

// ---------------------------------------------------------------- the frame-0 underdrawing

/** Ink groups that live only until the flood reaches their region (world px). Build once (useMemo), paint with
 *  <UnderPaint>. Each group = one region point + one weight. */
export class Under {
  g = new Map<string, {x: number; y: number; w: number; parts: string[]}>();
  /** Add stroke(s) `d` to the group at region point (x, y) with weight w. */
  add(x: number, y: number, d: string, w = 1.6): this {
    if (!d) return this;
    const k = `${Math.round(x)},${Math.round(y)},${w}`;
    const a = this.g.get(k);
    if (a) a.parts.push(d);
    else this.g.set(k, {x, y, w, parts: [d]});
    return this;
  }
}

/** Paints an Under: every group while t < floodAt(its point) (+ `lag` s: hold the line a frame or two past the flood). */
export const UnderPaint: React.FC<{u: Under; seed: string; lag?: number}> = ({u, seed, lag = 0}) => {
  const t = useTime();
  const out: React.ReactNode[] = [];
  u.g.forEach((g, k) => {
    if (t >= floodAt(g.x, g.y) + lag) return;
    out.push(<Ink key={k} d={g.parts.join('')} width={g.w} seed={`${seed}/${k}`} />);
  });
  return <>{out}</>;
};

/** Is the flood still before (x, y)? (the bare-line state of that spot, t < 0 included) */
export const bareAt = (t: number, x: number, y: number) => t < floodAt(x, y);

// ---------------------------------------------------------------- small fill helpers

/** A thin bar from a to b, `w` px wide, as a closed FILL path (railing bars, aerials, glazing bars, wires far away). */
export function barPath(a: Pt, b: Pt, w: number): string {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const L = Math.hypot(dx, dy) || 1;
  const nx = (-dy / L) * (w / 2);
  const ny = (dx / L) * (w / 2);
  return `M${P(a[0] + nx, a[1] + ny)}L${P(b[0] + nx, b[1] + ny)}L${P(b[0] - nx, b[1] - ny)}L${P(a[0] - nx, a[1] - ny)}Z`;
}

/** A filled annulus-ish ellipse ring (outer minus inner, even-odd is not available in a Batch: two crescents). */
export function ringPath(cx: number, cy: number, rx: number, ry: number, t: number): string {
  // the ring as a closed band drawn with two arcs out and two arcs back (a "C" shape on each side, joined)
  const ix = Math.max(0.5, rx - t);
  const iy = Math.max(0.3, ry - t * (ry / rx));
  return (
    `M${P(cx - rx, cy)}A${rx.toFixed(1)} ${ry.toFixed(1)} 0 0 1 ${P(cx + rx, cy)}L${P(cx + ix, cy)}A${ix.toFixed(1)} ${iy.toFixed(1)} 0 0 0 ${P(cx - ix, cy)}Z` +
    `M${P(cx - rx, cy)}A${rx.toFixed(1)} ${ry.toFixed(1)} 0 0 0 ${P(cx + rx, cy)}L${P(cx + ix, cy)}A${ix.toFixed(1)} ${iy.toFixed(1)} 0 0 1 ${P(cx - ix, cy)}Z`
  );
}

/** A palmate plane-tree leaf (5 pointed lobes, a petiole) as a closed path: base at (x, y), main lobe toward `deg`,
 *  size R (base to the main tip). Returns {d, ribs} (ribs = the midrib + two veins, for ink). */
export function planeLeaf(x: number, y: number, R: number, deg: number, seed: string): {d: string; ribs: string; tip: Pt} {
  const r = rng(`pleaf/${seed}`);
  const a0 = (deg * Math.PI) / 180;
  // lobes: angle offset (rad) and length (x R); sinuses between at ~0.42 R
  const lobes: [number, number][] = [
    [-1.75, 0.42],
    [-0.95, 0.82],
    [0, 1],
    [0.95, 0.82],
    [1.75, 0.42],
  ];
  const cx = x + Math.cos(a0) * R * 0.32;
  const cy = y + Math.sin(a0) * R * 0.32;
  const pts: Pt[] = [];
  const at = (a: number, L: number): Pt => [cx + Math.cos(a0 + a) * R * L, cy + Math.sin(a0 + a) * R * L];
  pts.push([x, y]);
  lobes.forEach(([a, L], i) => {
    const jl = L * r.range(0.92, 1.08);
    if (i > 0) pts.push(at((lobes[i - 1][0] + a) / 2 + r.jitter(0.05), 0.44 * r.range(0.9, 1.1)));
    // a lobe: a shoulder, the tip, a shoulder
    pts.push(at(a - 0.2, jl * 0.72));
    pts.push(at(a + r.jitter(0.04), jl));
    pts.push(at(a + 0.2, jl * 0.72));
  });
  pts.push([x, y]);
  let d = `M${P(pts[0][0], pts[0][1])}`;
  for (let i = 1; i < pts.length; i++) d += `L${P(pts[i][0], pts[i][1])}`;
  d += 'Z';
  const tip = at(0, 1);
  const ribs = `M${P(x, y)}L${P(tip[0] * 0.9 + x * 0.1, tip[1] * 0.9 + y * 0.1)}M${P(cx, cy)}L${P(...at(-0.95, 0.66))}M${P(cx, cy)}L${P(...at(0.95, 0.66))}`;
  return {d, ribs, tip};
}
