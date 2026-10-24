// A tiny display list for the mascot. Pose builders push layers; Elephant.tsx renders them.
import type React from 'react';
import type {Colorway} from './colors';
import {Pt, loopRange, rand, spline, tube} from './ink';

export type InkOpts = {
  w?: number; // multiplier of the base line weight
  over?: number;
  overStart?: number;
  overEnd?: number;
  tipIn?: number;
  tipOut?: number;
  wobble?: number;
};

export type Layer =
  | {k: 'fill'; pts: Pt[]; color: string; misreg?: number}
  | ({k: 'ink'; pts: Pt[]; seed: number; color?: string} & InkOpts)
  | {k: 'solid'; pts: Pt[]; color: string} // registered fill (eyes, tufts, mouth): no misregistration
  | {k: 'node'; at: Pt; rot: number; node: React.ReactNode}
  | {k: 'clip'; x: number; on: boolean}; // start/stop clipping everything left of x

export class Pen {
  layers: Layer[] = [];
  private n = 0;
  constructor(public seed: number, public c: Colorway) {}

  fill(pts: Pt[], color: string, misreg = 1) {
    this.layers.push({k: 'fill', pts, color, misreg});
  }
  solid(pts: Pt[], color?: string) {
    this.layers.push({k: 'solid', pts, color: color ?? this.c.ink});
  }
  ink(pts: Pt[], o: InkOpts = {}) {
    this.n += 1;
    this.layers.push({k: 'ink', pts, seed: this.seed * 31.7 + this.n * 7.31, ...o});
  }
  /** Smooth open stroke through control points. */
  line(ctrl: Pt[], o: InkOpts = {}) {
    this.ink(spline(ctrl, false, 6), o);
  }
  /** Closed smooth shape: misregistered flat fill + ink drawn as loose strokes over the given loop ranges. */
  shape(ctrl: Pt[], color: string, ranges: [number, number][], o: InkOpts = {}, misreg = 1): Pt[] {
    const loop = spline(ctrl, true, 8);
    this.fill(loop, color, misreg);
    for (const [a, b] of ranges) this.ink(loopRange(loop, a, b), o);
    return loop;
  }
  node(at: Pt, rot: number, node: React.ReactNode) {
    this.layers.push({k: 'node', at, rot, node});
  }
  clip(x: number, on: boolean) {
    this.layers.push({k: 'clip', x, on});
  }
  r(k: number) {
    return rand(this.seed, k);
  }
}

/** Rounded-end tube outline: centerline -> loop with a round cap at the far end. */
export const cappedTube = (center: Pt[], w0: number, w1: number) => {
  const {left, right} = tube(center, w0, w1);
  const n = center.length;
  const end = center[n - 1];
  const prev = center[Math.max(0, n - 2)];
  const ang = Math.atan2(end[1] - prev[1], end[0] - prev[0]);
  const cap: Pt[] = [];
  const r = w1 / 2;
  for (let i = 1; i < 8; i++) {
    const a = ang + Math.PI / 2 - (i / 8) * Math.PI;
    cap.push([end[0] + Math.cos(a) * r, end[1] + Math.sin(a) * r]);
  }
  return {left, right, cap, loop: [...left, ...cap, ...right.slice().reverse()]};
};
