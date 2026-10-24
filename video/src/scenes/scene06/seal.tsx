// scene06/seal.tsx — the 'They' beat: the sun's in-place press (with one visible rebound) and the wax seal it pops.
// LOCAL SHIMS (props lane requests, docs/scenes/S06.md): props SunPress 'land' has no rebound control (outBack 1.8 on a
// -10 % squash: imperceptible at phone size) and props WaxSeal has no `ease` / trail options (inQuad over a tall arc:
// the 32 px seal jumped 4-6 diameters a frame and its dotted trail lingered as specks). Same look as the props pieces
// (crown fill in the sun's orange, an ink arc, the solid elephant emblem); here:
//   SunPressS06  -14 % y anchored at the disc bottom, then a damped spring with one clear +5 % rebound
//   WaxSealS06   ~48 px on screen, pops 0.3 -> 1.3 -> 1 on emission with three ink pop ticks at the sun's edge, travels a
//                low arc with inOut(sine) (largest step <= ~55 px / frame), the dotted trail is eaten from its tail and
//                is gone 0.1 s after landing; lands with the props squash + pendulum wobble.

import React from 'react';
import {arc, crown, ease as E, Fill, Ink, lerp, mat, palette, prog, Pt, useTime, XG} from '../../lib';
import {ElephantEmblem, pendulum} from '../shared/props';

/** The press scale (y) at t: 0.08 s down to 1 - amount, then a damped spring back with one visible overshoot. */
export function pressS(t: number, at: number, amount = 0.14): number {
  const d = t - at;
  if (d < 0) return 1;
  if (d < 0.08) return 1 - amount * E.outCubic(d / 0.08);
  const tau = d - 0.08;
  if (tau > 0.6) return 1;
  return 1 - amount * Math.exp(-9.4 * tau) * Math.cos((2 * Math.PI * tau) / 0.22);
}

export const SunPressS06: React.FC<{at: number; cx: number; cy: number; r: number; amount?: number; children?: React.ReactNode}> = ({at, cx, cy, r, amount = 0.14, children}) => {
  const t = useTime();
  const s = pressS(t, at, amount);
  if (s === 1) return <>{children}</>;
  return <XG m={mat.about(mat.scale(1 + (1 - s) * 0.5, s), cx, cy + r)}>{children}</XG>;
};

export type WaxSealS06Props = {from: Pt; to: Pt; at: number; dur?: number; arc?: number; r?: number; sun?: Pt; seed?: string};

const POP_T = 0.1;

/** When the seal lands (film-local seconds). */
export const sealLandAt = (at: number, dur: number) => at + POP_T + dur;

export const WaxSealS06: React.FC<WaxSealS06Props> = ({from, to, at, dur = 0.4, arc: arcH = 26, r = 23, sun, seed = 's6seal'}) => {
  const t = useTime();
  if (t < at) return null;
  const apexY = Math.min(from[1], to[1]) - arcH;
  const P = (u: number): Pt => {
    const c = 2 * apexY - (from[1] + to[1]) / 2;
    return [lerp(from[0], to[0], u), (1 - u) * (1 - u) * from[1] + 2 * (1 - u) * u * c + u * u * to[1]];
  };
  const travel = prog(t, at + POP_T, dur);
  const u = E.inOutSine(travel);
  const [sx, sy] = t < at + POP_T ? from : P(u);
  const landT = sealLandAt(at, dur);
  const d = t - at;
  const pop = d < 0.06 ? lerp(0.3, 1.3, E.outCubic(d / 0.06)) : d < 0.17 ? lerp(1.3, 1, E.inOutSine((d - 0.06) / 0.11)) : 1;
  const sq = t >= landT && t < landT + 0.14 ? 1 - 0.18 * Math.sin(((t - landT) / 0.14) * Math.PI) : 1;
  const rot = pendulum(t, landT, -16, 0.5, 0.8);
  // the dotted trail: a window behind the seal while it travels, eaten from the tail; gone 0.1 s after landing
  const tail = t < landT ? Math.max(0, u - 0.42) : lerp(Math.max(0, 1 - 0.42), 1, prog(t, landT, 0.1));
  const dots: React.ReactNode[] = [];
  const n = 18;
  for (let i = 1; i < n; i++) {
    const v = i / n;
    if (v > u - 0.03 || v < tail) continue;
    const [dx, dy] = P(v);
    dots.push(<circle key={i} cx={dx} cy={dy} r={2.4} fill={palette.ink} />);
  }
  // emission pop ticks at the sun's edge (radial)
  let ticks: React.ReactNode = null;
  if (sun && d < 0.15) {
    const ax = from[0] - sun[0];
    const ay = from[1] - sun[1];
    const nn = Math.hypot(ax, ay) || 1;
    const g = E.outCubic(d / 0.07);
    const o = 26 + 16 * E.outCubic(d / 0.15);
    const L = 15 * g * (1 - Math.max(0, (d - 0.09) / 0.06));
    let dd = '';
    for (const da of [-0.62, 0, 0.62]) {
      const c = Math.cos(da);
      const s = Math.sin(da);
      const ux = (ax / nn) * c - (ay / nn) * s;
      const uy = (ax / nn) * s + (ay / nn) * c;
      dd += `M${(from[0] + ux * o).toFixed(1)} ${(from[1] + uy * o).toFixed(1)}l${(ux * L).toFixed(1)} ${(uy * L).toFixed(1)}`;
    }
    ticks = L > 0.5 ? <Ink d={dd} width={3.2} taper={false} order="all" seed={`${seed}/tk`} /> : null;
  }
  const blobD = crown(0, 0, r, r, {seed: `${seed}/c`, bumps: 8, round: 0.72});
  return (
    <>
      {dots}
      {ticks}
      <XG m={mat.compose(mat.translate(sx, sy), mat.rotate(rot), mat.scale(pop * (2 - sq), pop * sq))}>
        <Fill d={blobD} color={palette.sun} offset={[1.5, 1.5]} seed={`${seed}/f`} lookExempt />
        <Ink d={arc(0, 0, r * 0.64, r * 0.64, -20, 300, {seed: `${seed}/i`})} width={2.2} taper={false} seed={`${seed}/i`} />
        <ElephantEmblem size={r * 1.05} mode="solid" color={palette.ink} seed={`${seed}/e`} />
      </XG>
    </>
  );
};
