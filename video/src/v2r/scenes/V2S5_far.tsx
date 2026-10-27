// V2S5_far.tsx (lane L4, SKY & FAR): the S5 FAR plane (the sky, the top-gutter clouds, the sun + its APRIL 2026 page,
// the hero cloud bank, the far hills, the packed low city, the obelisk) in END coords, and the sky life. FAR_END is the
// contract the rig (V2S5_rig.ts FAR_S5) pins on: the end horizon and the END sun (the rig maps it onto SUN1 at p 0).
//   Horizon y 750 (sky 39 % of the frame). The END sun (1058.5, 646) r 60.2, cut by the right edge, top 585.8 (>= 575):
//   with it the far plane sits 12 px LOWER at the start than at the end, so the binding limit for the bank and obelisk
//   tops is the END frame itself (610); an END y of 610 lands at 611 at the start (V2S5_qa prints the mapping).
//   Pieces: V2S5_far_sky (TopClouds, HeroBank, AprilBands, SunS5), V2S5_far_city (FarHills, FarCityS5, ObeliskS5),
//   tones in V2S5_far_tones.
// S5FarLife (screen space, given p) draws the sky's movers THROUGH the far plane's own map (farMat below = the rig's
// FAR_S5 exactly), so they ride the camera like the world they fly in: gulls wheeling over the far city (one flock in
// the start's slot, one over the end's city), and in the scale hold two V's of birds that enter from the left edge at
// ~75 % of the move, pass behind the terrace tree and cross in front of the obelisk; all at y >= 610.
// Import rule: never import V2S5_rig / V2S5_set / V2S5_figs (the rig imports this file).
import React from 'react';
import {useTime} from '../../lib/time';
import {XG} from '../../lib/xf';
import {SUN1} from '../world/map';
import {CRANE_T, planeMat, type PullPlane} from '../kit/dc/crane';
import {mix} from '../kit/dc/core';
import {CM} from '../palette';
import type {Pt} from '../../lib/sketch';
import {TopClouds, HeroBank, AprilBands, SunS5, SUN_END} from './V2S5_far_sky';
import {FarHills, FarCityS5, ObeliskS5, CITY} from './V2S5_far_city';

export const FAR_END = {
  /** The end horizon (screen y) and its shift from the kit's 800 (RIVER_PL reads dy). */
  horizon: CITY.horizon,
  dy: CITY.horizon - 800,
  /** The sun at the end (cut by the right edge). */
  sun: SUN_END,
};

/** The far plane's map at p (identical to the rig's FAR_S5: the END sun lands on SUN1 at p 0, pivot on the horizon). */
export const FAR_PL: PullPlane = (() => {
  const s = FAR_END.sun;
  const k = SUN1.r / s.r;
  const o: Pt = [540, FAR_END.horizon];
  return {o, k, off: [SUN1.x - o[0] - k * (s.x - o[0]), SUN1.y - o[1] - k * (s.y - o[1])]};
})();
export const farMat = (p: number) => planeMat(FAR_PL, p);

/** The far plane (drawn inside the rig's FAR_S5 PullLayer): back to front. */
export const S5Far: React.FC = () => (
  <>
    <AprilBands x0={CITY.x0} x1={CITY.x1} horizon={FAR_END.horizon} />
    <TopClouds />
    <SunS5 flip={CRANE_T.flip} />
    <HeroBank />
    <FarHills />
    <FarCityS5 obelisk={<ObeliskS5 />} />
  </>
);

// ---------------------------------------------------------------- the sky life (END coords, through farMat)

/** A flat bird: two wing strokes of span w; phase 0..1 (wings up -> down); glide = wings held, a slight dihedral. */
export function birdD(x: number, y: number, w: number, phase: number, glide = false): string {
  const up = glide ? 0.32 : Math.cos(phase * Math.PI * 2);
  const tip = -w * 0.26 * up;
  const mid = -w * 0.06 * up;
  const f = (v: number) => v.toFixed(1);
  return `M${f(x - w / 2)} ${f(y + tip)}Q${f(x - w * 0.22)} ${f(y + mid - w * 0.08)} ${f(x)} ${f(y + w * 0.04)}Q${f(x + w * 0.22)} ${f(y + mid - w * 0.08)} ${f(x + w / 2)} ${f(y + tip)}`;
}

/** Gull flocks (END coords): [centre, radii, count, span]. One wheels in the start's slot, one over the end's city. */
const GULLS: {c: Pt; r: Pt; n: number; span: number; seed: number}[] = [
  {c: [1188, 742], r: [88, 15], n: 3, span: 13, seed: 0},
  {c: [784, 726], r: [120, 20], n: 3, span: 14, seed: 1.7},
];

/** The two V's of the hold (END coords): enter left of the frame at ~75 % of the move (t0), fly right and a little up. */
const VS: {t0: number; from: Pt; v: number; rise: number; span: number; n: number; ink: number; glider: number}[] = [
  {t0: 1.9, from: [150, 694], v: 242, rise: -9, span: 38, n: 7, ink: 0.18, glider: 3},
  {t0: 2.08, from: [80, 652], v: 205, rise: -6, span: 27, n: 5, ink: 0.42, glider: -1},
];

export const S5FarLife: React.FC<{p: number}> = ({p}) => {
  const t = useTime();
  let gulls = '';
  for (const g of GULLS) {
    for (let i = 0; i < g.n; i++) {
      const a = t * (0.42 + i * 0.06) + i * 2.1 + g.seed;
      const x = g.c[0] + Math.cos(a) * g.r[0] * (0.7 + i * 0.16);
      const y = g.c[1] + Math.sin(a) * g.r[1] * (0.8 + i * 0.12);
      gulls += birdD(x, y, g.span - i * 1.5, (t * 2.6 + i * 0.31 + g.seed) % 1, i === 1 && Math.sin(t * 0.9 + g.seed) > 0.2);
    }
  }
  const vs: {d: string; ink: number; w: number}[] = [];
  for (const V of VS) {
    if (t < V.t0) continue;
    const dt = t - V.t0;
    const hx = V.from[0] + V.v * dt;
    const hy = V.from[1] + V.rise * dt;
    let d = '';
    for (let i = 0; i < V.n; i++) {
      const rank = Math.ceil(i / 2);
      const side = i === 0 ? 0 : i % 2 ? 1 : -1;
      const x = hx - rank * V.span * 0.86 + Math.sin(t * 1.7 + i * 2.3) * 2.2;
      const y = hy + side * rank * V.span * 0.46 + Math.sin(t * 2.1 + i * 1.3) * 1.6;
      const w = V.span * (1 - rank * 0.07);
      d += birdD(x, y, w, (t * 3.6 + i * 0.19) % 1, i === V.glider);
    }
    vs.push({d, ink: V.ink, w: V.span > 34 ? 2.6 : 2.1});
  }
  return (
    <XG m={farMat(p)}>
      <path d={gulls} stroke={mix(CM.anchor, CM.sky, 0.42)} strokeWidth={1.7} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {vs.map((v, i) => (
        <path key={i} d={v.d} stroke={mix(CM.anchor, CM.sky, v.ink)} strokeWidth={v.w} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      ))}
    </XG>
  );
};
