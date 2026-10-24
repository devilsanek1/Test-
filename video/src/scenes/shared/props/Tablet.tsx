// props/Tablet.tsx — the AI teams' kit (P12, S05): a white tablet with a four-point sparkle, and the scan beam.
//
//   <SparkleTablet x={230} y={1300} raiseAt={22.9} />                                   // 60 x 85, centre
//   <ScanBeam from={[230, 1260]} to={[488, 960]} at={23.2} sweep={{amp: 8, hz: 0.9}} convergeAt={23.9} />
//
// The sparkle is the generic "AI" sign (no logo): a four-point star with concave sides + a small twin that twinkles
// by SIZE (never opacity). The beam is a flat mintPale polygon at a FIXED partial opacity with dashed ink edges.

import React from 'react';
import {palette} from '../../../lib/theme';
import {ease as E, lerp, osc, prog, useTime} from '../../../lib/time';
import {Seed} from '../../../lib/rng';
import {Ink} from '../../../lib/Ink';
import {Fill} from '../../../lib/Fill';
import {ExitFade, useLook} from '../../../lib/exit';
import {roundRect, Pt} from '../../../lib/sketch';
import {mat, XG} from '../../../lib/xf';
import {Depth, DEPTH_INK, misregScreen, withOut} from './common';
import {MOTION} from '../../../lib/spec';

/** Four-point sparkle path (concave sides) centred at (x, y), radius r. */
export function sparklePath(x: number, y: number, r: number, k = 0.28): string {
  const q = r * k;
  return `M${x} ${y - r}Q${x + q} ${y - q} ${x + r} ${y}Q${x + q} ${y + q} ${x} ${y + r}Q${x - q} ${y + q} ${x - r} ${y}Q${x - q} ${y - q} ${x} ${y - r}Z`;
}

export type SparkleTabletProps = {
  /** Centre. */
  x: number;
  y: number;
  /** Width (height 1.42 x). Default 60. */
  size?: number;
  rot?: number;
  at?: number;
  /** Rises 0.6 x its height from below with a 20 deg tilt settling (0.33 s out(exp)). */
  raiseAt?: number;
  twinkle?: boolean;
  /** Ink width in parent units. */
  ink?: number;
  depth?: Depth;
  seed?: Seed;
};

const SparkleTabletBase: React.FC<SparkleTabletProps> = ({x, y, size = 60, rot = 0, at, raiseAt, twinkle = true, ink, depth = 'mid', seed = 'tablet'}) => {
  const t = useTime();
  const start = raiseAt ?? at;
  if (start !== undefined && t < start) return null;
  const w = size;
  const h = size * 1.42;
  const iw = ink ?? DEPTH_INK[depth];
  const q = raiseAt !== undefined ? MOTION.rise.ease(prog(t, raiseAt, 0.33)) : 1;
  const dy = (1 - q) * h * 0.6;
  const r = rot + (1 - q) * 20;
  const tw1 = twinkle ? 1 + 0.14 * osc(t, 1.7, 0.4) : 1;
  const tw2 = twinkle ? 1 + 0.35 * osc(t, 2.3, 2.1) : 1;
  const off = misregScreen(seed);
  const k = size / 60;
  return (
    <XG m={mat.compose(mat.translate(x, y + dy), mat.rotate(r))}>
      <Fill d={roundRect(-w / 2, -h / 2, w, h, w * 0.12)} color={palette.white} offset={[off[0] * 0.6, off[1] * 0.6]} seed={`${seed}/b`} />
      <Fill d={roundRect(-w / 2 + w * 0.1, -h / 2 + w * 0.12, w * 0.8, h - w * 0.32, w * 0.05)} color={palette.mintPale} offset={false} seed={`${seed}/s`} />
      <Ink d={roundRect(-w / 2, -h / 2, w, h, w * 0.12, {closed: false, seed: `${seed}/o`})} at={at} width={iw} seed={`${seed}/o`} />
      <Ink d={`M${-w * 0.08} ${h / 2 - w * 0.1}H${w * 0.08}`} width={iw * 0.8} taper={false} seed={`${seed}/btn`} />
      <XG m={mat.about(mat.scale(tw1), 0, -h * 0.05)}>
        <Fill d={sparklePath(0, -h * 0.05, w * 0.26)} color={palette.ink} offset={false} mode="none" seed={`${seed}/sp`} />
      </XG>
      <XG m={mat.about(mat.scale(tw2), w * 0.2, -h * 0.25)}>
        <Fill d={sparklePath(w * 0.2, -h * 0.25, w * 0.09)} color={palette.ink} offset={false} mode="none" seed={`${seed}/sp2`} />
      </XG>
    </XG>
  );
};

export type ScanBeamProps = {
  /** Source (the tablet top). */
  from: Pt;
  /** Target point (the lock detail). */
  to: Pt;
  /** Width at the source / at the target (default 14 / 150). */
  w0?: number;
  w1?: number;
  /** Wipes on (the far end travels from the source to the target in 0.25 s). */
  at?: number;
  /** Sweep about the source: amp (deg) and rate (Hz), damped to 0 when it converges. */
  sweep?: {amp?: number; hz?: number};
  /** The far end narrows onto the target (0.3 s). */
  convergeAt?: number;
  outAt?: number;
  color?: string;
  opacity?: number;
  depth?: Depth;
};

export const ScanBeam: React.FC<ScanBeamProps> = ({from, to, w0 = 14, w1 = 150, at, sweep, convergeAt, outAt, color = palette.mintPale, opacity = 0.5, depth = 'far'}) => {
  const t = useTime();
  const look = useLook();
  if (at !== undefined && t < at) return null;
  const grow = at !== undefined ? E.outCubic(prog(t, at, 0.25)) : 1;
  const shrink = outAt !== undefined ? 1 - E.inCubic(prog(t, outAt, 0.2)) : 1;
  if (shrink <= 0.002) return null;
  const conv = convergeAt !== undefined ? E.inOutCubic(prog(t, convergeAt, 0.3)) : 0;
  const sw = sweep ? (sweep.amp ?? 8) * osc(t, sweep.hz ?? 0.9) * (1 - conv) : 0;
  const dx0 = to[0] - from[0];
  const dy0 = to[1] - from[1];
  const a = Math.atan2(dy0, dx0) + (sw * Math.PI) / 180;
  const L = Math.hypot(dx0, dy0) * grow * shrink;
  const d: Pt = [Math.cos(a), Math.sin(a)];
  const n: Pt = [-d[1], d[0]];
  const wEnd = lerp(w1, 10, conv);
  const P = (dist: number, w: number, side: number): Pt => [from[0] + d[0] * dist + n[0] * side * w / 2, from[1] + d[1] * dist + n[1] * side * w / 2];
  const A = P(0, w0, -1);
  const B = P(0, w0, 1);
  const C = P(L, wEnd, 1);
  const D = P(L, wEnd, -1);
  const poly = `M${A[0].toFixed(1)} ${A[1].toFixed(1)}L${B[0].toFixed(1)} ${B[1].toFixed(1)}L${C[0].toFixed(1)} ${C[1].toFixed(1)}L${D[0].toFixed(1)} ${D[1].toFixed(1)}Z`;
  const edges = `M${A[0].toFixed(1)} ${A[1].toFixed(1)}L${D[0].toFixed(1)} ${D[1].toFixed(1)}M${B[0].toFixed(1)} ${B[1].toFixed(1)}L${C[0].toFixed(1)} ${C[1].toFixed(1)}`;
  return (
    <ExitFade>
      {look.fills === 'color' ? <path d={poly} fill={color} opacity={opacity} /> : null}
      <path d={edges} fill="none" stroke={palette.ink} strokeWidth={DEPTH_INK[depth]} strokeDasharray="9 8" strokeLinecap="round" />
    </ExitFade>
  );
};

// build-out (outAt / outDur) for props that have no own exit
export const SparkleTablet = withOut(SparkleTabletBase, 'SparkleTablet');
