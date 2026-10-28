// V2S5_far.tsx (lane L4, SKY & FAR): the S5 FAR plane (the sky, the top-gutter clouds, the sun + its APRIL 2026 page,
// the hero cloud bank, the far hills, the packed low city, the obelisk) in END coords, and the sky life. FAR_END is the
// contract the rig (V2S5_rig.ts FAR_S5) pins on: the end horizon and the END sun (the rig maps it onto SUN1 at p 0).
//   Horizon y 750 (sky 39 % of the frame). The END sun (1058.5, 646) r 60.2, cut by the right edge, top 585.8 (>= 575):
//   with it the far plane sits 12 px LOWER at the start than at the end, so the binding limit for the bank and obelisk
//   tops is the END frame itself (610); an END y of 610 lands at 611 at the start (V2S5_qa prints the mapping).
//   The sky itself is V2S5's screen-space <Sky spec={S5_SKY}> (world/skies; no flat bands). Pieces: V2S5_far_sky
//   (HeroBank, SunS5), V2S5_far_city (FarHills, FarCityS5, ObeliskS5),
//   tones in V2S5_far_tones.
// S5FarLife (screen space, given p) draws the sky's movers THROUGH the far plane's own map (farMat below = the rig's
// FAR_S5 exactly), so they ride the camera like the world they fly in: gulls wheeling over the far city (one flock in
// the start's slot, one over the end's city), and two pale V's of birds that the crane's pan brings in from the left
// edge (~22.0) and that cross the open middle sky to the hold, always RIGHT of the obelisk (never across it); y >= 590.
// Import rule: never import V2S5_rig / V2S5_set / V2S5_figs (the rig imports this file).
import React from 'react';
import {useTime} from '../../lib/time';
import {XG} from '../../lib/xf';
import {SUN1} from '../world/map';
import {CRANE_T, planeMat, type PullPlane} from '../kit/dc/crane';
import {mix} from '../kit/dc/core';
import {CM} from '../palette';
import type {Pt} from '../../lib/sketch';
import {HeroBank, SunS5, SUN_END} from './V2S5_far_sky';
import {cloudD} from '../kit/dc/core';
import {fromLch} from '../../lib/light';
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
/** The top gutter. At the S5 -> S6 wipe (23.62-23.98) the tree is clipped at y >= 560, so above it the swap edge is a
 *  bare vertical line: the two skies there must be the SAME (conform_L4 §1). S6 draws NO cloud (its sky is lib/sky's one
 *  gradient, = S5_SKY above y 556: world/skies), so S5's END frame carries none either. The start's top gutter keeps a
 *  few clouds of S6's make (`cloudD`, its colours) that lie past the end frame's right edge (END x >= 1090): the far
 *  plane is slid ~850 px at p 0, and the crane's pan carries them out of the right edge by ~23.3 (before the hold's
 *  end 23.55; their 3 px/s drift is S6's). */
const S6_T0_IN_S5 = 23.8 - 20.55;
const START_CLOUDS: [number, number, number, number][] = [
  [1090, 330, 246, 96],
  [1470, 470, 236, 104],
  [1880, 420, 160, 86],
];
const S5TopGutter: React.FC = () => {
  const t = useTime();
  const dx = 3 * (t - S6_T0_IN_S5);
  let body = '';
  let lit = '';
  let belly = '';
  for (const [x0, w, base, hh] of START_CLOUDS) {
    const x = x0 + dx;
    body += cloudD(x, x + w, base, [
      [x + w * 0.18, w * 0.34, hh * 0.58],
      [x + w * 0.42, w * 0.4, hh],
      [x + w * 0.68, w * 0.36, hh * 0.76],
      [x + w * 0.88, w * 0.2, hh * 0.42],
    ]);
    lit += cloudD(x + w * 0.22, x + w * 0.78, base - hh * 0.32, [
      [x + w * 0.42, w * 0.32, hh * 0.6],
      [x + w * 0.62, w * 0.24, hh * 0.4],
    ]);
    belly += `M${(x + w * 0.1).toFixed(1)} ${base}h${(w * 0.8).toFixed(1)}v-7h${(-w * 0.8).toFixed(1)}Z`;
  }
  return (
    <>
      <path d={body} fill={CM.skyHigh} />
      <path d={belly} fill={mix(CM.skyHigh, CM.stoneShade, 0.35)} />
      <path d={lit} fill={CM.paper} />
    </>
  );
};

export const S5Far: React.FC = () => (
  <>
    <S5TopGutter />
    <SunS5 />
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

/** Gull flocks (END coords): [centre, radii, count, span]. One wheels in the start's slot, one over the end's city
 *  (right of the V's lane, under the sun's x but below its disc). */
const GULLS: {c: Pt; r: Pt; n: number; span: number; seed: number}[] = [
  {c: [1188, 742], r: [88, 15], n: 3, span: 13, seed: 0},
  {c: [952, 774], r: [72, 11], n: 3, span: 14, seed: 1.7},
];

/** The two V's of the hold (END coords, the far plane's air). They fly RIGHT of the obelisk all the way (every bird at
 *  END x >= 440 from t0, when the whole V is still off-screen left: the crane's pan brings them in at ~22.0, behind the
 *  lamppost wipe's moment, and they cross the open middle sky over the hero bank to the hold), so no V ever crosses the
 *  needle (the critic, 2026-10-28: a dark V over the obelisk read as a windmill on a phone). A PALE AIR TONE on hairline
 *  strokes (CRAFT §c: things that ARE lines within dL* 15 of what is behind them; §f.6: far birds pale and small):
 *  L* 75 / 78 over the bank (L* 90) and the mint (85), ~2 px; at 360 px wide the near V is still a 15 px mark. */
export const VS: {t0: number; from: Pt; v: number; rise: number; span: number; n: number; glider: number; color: string; w: number}[] = [
  {t0: 1.4, from: [590, 692], v: 116, rise: -6, span: 44, n: 7, glider: 3, color: fromLch(75, 10, 22), w: 2.2},
  {t0: 1.4, from: [492, 640], v: 98, rise: -4, span: 32, n: 5, glider: -1, color: fromLch(78, 8, 30), w: 2.0},
];
/** The V's vertical spread per rank (x span): a shallow V (the far birds read as a line of marks, never a tall cross). */
const V_SPREAD = 0.4;

/** Every bird of the V's at scene time t (END coords): centre, span, wing phase, glide. Pure (the QA reads it). */
export function vBirds(t: number): {v: number; x: number; y: number; w: number; phase: number; glide: boolean}[] {
  const out: {v: number; x: number; y: number; w: number; phase: number; glide: boolean}[] = [];
  VS.forEach((V, vi) => {
    if (t < V.t0) return;
    const dt = t - V.t0;
    const hx = V.from[0] + V.v * dt;
    const hy = V.from[1] + V.rise * dt;
    for (let i = 0; i < V.n; i++) {
      const rank = Math.ceil(i / 2);
      const side = i === 0 ? 0 : i % 2 ? 1 : -1;
      out.push({
        v: vi,
        x: hx - rank * V.span * 0.86 + Math.sin(t * 1.7 + i * 2.3) * 2.2,
        y: hy + side * rank * V.span * V_SPREAD + Math.sin(t * 2.1 + i * 1.3) * 1.6,
        w: V.span * (1 - rank * 0.07),
        phase: (t * 3.6 + i * 0.19) % 1,
        glide: i === V.glider,
      });
    }
  });
  return out;
}

/** A far flock low over the city (the smallest step of the birds' size ladder: V 44 / far V 32 / gulls 14 / this 8 px),
 *  drifting left slowly while it wheels a little (END coords), under the V's lane and left of the gulls. */
const FLOCK = {c: [836, 790] as Pt, n: 7, span: 8, vx: -9, seed: 0.6};
/** The small far birds' pale tones (L* 76 / 74 over the far city and the bank: within dL* 15). */
const FLOCK_TONE = fromLch(76, 8, 30);
const GULL_TONE = fromLch(74, 9, 26);

export const S5FarLife: React.FC<{p: number}> = ({p}) => {
  const t = useTime();
  let flock = '';
  for (let i = 0; i < FLOCK.n; i++) {
    const a = t * 0.9 + i * 0.9 + FLOCK.seed;
    const x = FLOCK.c[0] + FLOCK.vx * t + Math.cos(a) * (14 + i * 5) + (i - 3) * 9;
    const y = FLOCK.c[1] + Math.sin(a * 1.3) * (3 + i * 0.7) - Math.abs(i - 3) * 2.2;
    flock += birdD(x, y, FLOCK.span - (i % 3), (t * 4.6 + i * 0.37) % 1);
  }
  let gulls = '';
  for (const g of GULLS) {
    for (let i = 0; i < g.n; i++) {
      const a = t * (0.42 + i * 0.06) + i * 2.1 + g.seed;
      const x = g.c[0] + Math.cos(a) * g.r[0] * (0.7 + i * 0.16);
      const y = g.c[1] + Math.sin(a) * g.r[1] * (0.8 + i * 0.12);
      gulls += birdD(x, y, g.span - i * 1.5, (t * 2.6 + i * 0.31 + g.seed) % 1, i === 1 && Math.sin(t * 0.9 + g.seed) > 0.2);
    }
  }
  const vs = VS.map(() => '');
  for (const b of vBirds(t)) vs[b.v] += birdD(b.x, b.y, b.w, b.phase, b.glide);
  return (
    <XG m={farMat(p)}>
      <path d={flock} stroke={FLOCK_TONE} strokeWidth={1.2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d={gulls} stroke={GULL_TONE} strokeWidth={1.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {VS.map((V, i) => (vs[i] ? <path key={i} d={vs[i]} stroke={V.color} strokeWidth={V.w} fill="none" strokeLinecap="round" strokeLinejoin="round" /> : null))}
    </XG>
  );
};
