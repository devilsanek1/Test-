// S08 tally gates (A1 fix round 1). The reviewers: 'at thumbnail / phone size frames 3.0-7.0 s look the same: the tally
// gates are ~36 x 30 px each in a ~150 px zone and read as hatching'. The board's own gates (CounterBoard gatesAt) are
// off; this draws BIG hand-drawn gates over the board's gates zone: 4 bars ~42 px tall + the diagonal strike, 4 px ink,
// two rows of three that FILL the zone by 'thousands', then the count OVERFLOWS: the next gates are scrawled across the
// board's right teal frame (rotated, overlapping: 'too many to count'). Each gate strokes on in 0.12 s (bars left to
// right, then the strike). No digits anywhere.
import React from 'react';
import {palette} from '../../lib/theme';
import {rand} from '../../lib/rng';
import {Ink} from '../../lib/Ink';
import {line} from '../../lib/sketch';
import type {Seed} from '../../lib/rng';

type Rect4 = [number, number, number, number];

/** One gate: 4 bars + the strike in a local w x h box at (x, y), rotated `rot` deg about its centre. */
function gatePath(x: number, y: number, w: number, h: number, rot: number, seed: Seed): string {
  const cx = x + w / 2;
  const cy = y + h / 2;
  const c = Math.cos((rot * Math.PI) / 180);
  const s = Math.sin((rot * Math.PI) / 180);
  const R = (px: number, py: number): [number, number] => [cx + (px - cx) * c - (py - cy) * s, cy + (px - cx) * s + (py - cy) * c];
  const L = (a: [number, number], b: [number, number], k: string, drift: number) => {
    const p = R(a[0], a[1]);
    const q = R(b[0], b[1]);
    return line(p[0], p[1], q[0], q[1], {over: [0, 0], seed: `${seed}/${k}`, drift});
  };
  let d = '';
  for (let i = 0; i < 4; i++) {
    const bx = x + w * (0.1 + i * 0.25) + (rand(seed, `gx${i}`) - 0.5) * w * 0.05;
    d += L([bx, y + h * 0.04 + (rand(seed, `gt${i}`) - 0.5) * h * 0.08], [bx + (rand(seed, `gb${i}`) - 0.5) * w * 0.06, y + h * 0.96], `b${i}`, 0.6);
  }
  d += L([x - w * 0.06, y + h * 0.8], [x + w * 1.04, y + h * 0.16], 'x', 0.4);
  return d;
}

/** The gate slots: `cols` x 2 inside `zone`, then the overflow positions (board-frame coordinates, rotated). */
export function tallySlots(zone: Rect4, overflow: {cx: number; cy: number; rot: number}[], cols = 3): {x: number; y: number; w: number; h: number; rot: number}[] {
  const [x0, y0, x1, y1] = zone;
  const cw = (x1 - x0) / cols;
  const rh = (y1 - y0) / 2;
  const w = cw * 0.84;
  const h = rh * 0.94;
  const out: {x: number; y: number; w: number; h: number; rot: number}[] = [];
  for (let r = 0; r < 2; r++) for (let c = 0; c < cols; c++) out.push({x: x0 + c * cw + (cw - w) / 2, y: y0 + r * rh + (rh - h) / 2, w, h, rot: 0});
  for (const o of overflow) out.push({x: o.cx - w / 2, y: o.cy - h / 2, w, h, rot: o.rot});
  return out;
}

/** The tally: gate i strokes on at at[i] (0.12 s) in slot i. */
export const TallyGates: React.FC<{slots: {x: number; y: number; w: number; h: number; rot: number}[]; at: number[]; width?: number; seed: string}> = ({slots, at, width = 4, seed}) => (
  <>
    {at.map((a, i) => {
      const q = slots[Math.min(i, slots.length - 1)];
      return <Ink key={i} d={gatePath(q.x, q.y, q.w, q.h, q.rot, `${seed}/g${i}`)} at={a} dur={0.12} width={width} color={palette.ink} taper={false} seed={`${seed}/g${i}`} />;
    })}
  </>
);
