// scene02/PlanGrid.tsx — the PLAN's grid on the master blueprint: a broken-stroke hairline grid on the sheet below its
// clean top margin. Fix round 2: it is a pale BLUEPRINT TINT (`color`, default GRID_TINT), not ink, at 52 world px
// pitch and 0.85 width, so it sits far below the plan drawing in weight and colour (the artist leaves paper empty; an
// ink grid read as wire mesh and buried the door elevation and the dashed connector). `thin` drops whole segments
// (never by opacity) toward the lock, so the paper round the loupe stays clean. It draws OUTWARD from the lock with the
// rest of the sheet: the segments are binned by distance from the lock into rings, one Ink per ring, each ring a
// little later. The loupe, the labels, the site icon and the eraser patch are all drawn on top of it.

import React from 'react';
import {Ink} from '../../lib/Ink';
import {line, Pt} from '../../lib/sketch';
import {rng} from '../../lib/rng';

export type PlanGridProps = {
  /** The region [x0, y0, x1, y1] (world). */
  area: [number, number, number, number];
  /** Draw-on origin (the lock) and the first ring's start (scene s). */
  from: Pt;
  at: number;
  pitch?: number;
  /** Keep-outs: circles [x, y, r] and rects [x0, y0, x1, y1] (the sheet's stamp badge and title block). */
  holes?: Hole[];
  /** Ring width (world px) and the delay per ring (s). */
  ring?: number;
  perRing?: number;
  width?: number;
  /** Stroke colour (default GRID_TINT, the pale blueprint tint). */
  color?: string;
  /** [r0, r1] world px from `from`: no segment inside r0, all kept past r1, a linear keep-chance between (seeded). */
  thin?: [number, number];
  seed?: string;
};

/** The blueprint tint: a pale mint between the page sky and the paper (reads as printed grid, never as ink). */
export const GRID_TINT = '#BFD8CC';

export type Hole = {c: [number, number, number]} | {r: [number, number, number, number]};
const inHole = (p: Pt, holes: Hole[]) =>
  holes.some((h) => ('c' in h ? Math.hypot(p[0] - h.c[0], p[1] - h.c[1]) < h.c[2] : p[0] > h.r[0] && p[0] < h.r[2] && p[1] > h.r[1] && p[1] < h.r[3]));

const CACHE = new Map<string, string[]>();

function rings(area: [number, number, number, number], from: Pt, pitch: number, ring: number, holes: Hole[], thin: [number, number] | undefined, seed: string): string[] {
  const key = `${area.join(',')}|${from.join(',')}|${pitch}|${ring}|${JSON.stringify(holes)}|${thin?.join(',')}|${seed}`;
  const hit = CACHE.get(key);
  if (hit) return hit;
  const [x0, y0, x1, y1] = area;
  const r = rng(`${seed}/grid`);
  const keep = rng(`${seed}/thin`);
  const out: string[] = [];
  const add = (a: Pt, b: Pt, i: number) => {
    // cut the segment where it crosses a keep-out (2 px steps), keep the runs longer than 14 px
    const L = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const n = Math.max(1, Math.ceil(L / 2));
    let r0 = -1;
    const at = (j: number): Pt => [a[0] + ((b[0] - a[0]) * j) / n, a[1] + ((b[1] - a[1]) * j) / n];
    for (let j = 0; j <= n; j++) {
      const ok = !inHole(at(j), holes);
      if (ok && r0 < 0) r0 = j;
      if ((!ok || j === n) && r0 >= 0) {
        const j1 = ok ? j : j - 1;
        if (((j1 - r0) * L) / n > 14) put(at(r0), at(j1), `${i}.${r0}`);
        r0 = -1;
      }
    }
  };
  const put = (a: Pt, b: Pt, i: string) => {
    const mx = (a[0] + b[0]) / 2 - from[0];
    const my = (a[1] + b[1]) / 2 - from[1];
    const dist = Math.hypot(mx, my);
    if (thin) {
      const u = keep.range(0, 1);
      if (dist < thin[0] || u > (dist - thin[0]) / (thin[1] - thin[0])) return;
    }
    const k = Math.floor(dist / ring);
    while (out.length <= k) out.push('');
    out[k] += line(a[0], a[1], b[0], b[1], {seed: `${seed}/g${i}`, over: 0});
  };
  let n = 0;
  // broken strokes: runs of 60-170 px with 9-22 px gaps, every line starting at a random phase
  const run = (len: number, emit: (s0: number, s1: number) => void) => {
    let s = -r.range(0, 60);
    while (s < len) {
      const l = r.range(60, 170);
      const a = Math.max(0, s);
      const b = Math.min(len, s + l);
      if (b - a > 14) emit(a, b);
      s += l + r.range(9, 22);
    }
  };
  for (let x = x0 + pitch / 2; x < x1; x += pitch) run(y1 - y0, (a, b) => add([x, y0 + a], [x, y0 + b], n++));
  for (let y = y0 + pitch / 2; y < y1; y += pitch) run(x1 - x0, (a, b) => add([x0 + a, y], [x0 + b, y], n++));
  CACHE.set(key, out);
  return out;
}

export const PlanGrid: React.FC<PlanGridProps> = ({area, from, at, pitch = 52, holes = [], ring = 60, perRing = 0.05, width = 0.85, color = GRID_TINT, thin, seed = 's2grid'}) => {
  const rs = rings(area, from, pitch, ring, holes, thin, seed);
  return (
    <>
      {rs.map((d, i) => (d ? <Ink key={i} d={d} at={at + i * perRing} order="all" width={width} color={color} taper={false} vary={0} seed={`${seed}/r${i}`} /> : null))}
    </>
  );
};
