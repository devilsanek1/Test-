// SQD_life (REVEAL lane): the supporting life of the reveal (docs/v3/flow_v2.md §4-5 SQD), each piece on FILM time:
//   B  the streams: sticks rising off the town's roofs into the DC's roof, from 21.0 only, <= 1 per 0.25 s, no trails,
//      the last one in by 22.2 (nothing moves in or out across J4's no-new-mover window 22.28-23.08)
//   B  two DC trucks driving up the road from our street into the DC's gate (20.80-22.20), small, at one steady speed
//   C  a V of four birds crossing the sky below the caption band in the hold (they keep flying across J4: RevealBirds
//      is exported for `outside.tsx` to draw on the same clock), the thoom's snow puffs off the front roofs (21.72)
// Tier B life is soft (no outline, C* <= 25 by its fills), slow, and never in the caption band. H2 px.
import React from 'react';
import {rng} from '../../../lib/rng';
import {StickFlight, EMBER, type StickFlightOpts} from '../kit';
import {roadAt, truckD} from './SQD_standin';
import {SQD_START} from './SQD_rig';

const f1 = (v: number) => v.toFixed(1);

// ---------------------------------------------------------------- the streams (far plane: town roofs -> the DC roof)
/** The DC's roof (H2 px): S9's hall roof re-laid (x 230-560, top y ~787). */
const DC_ROOF = {x0: 262, x1: 528, y: 789};
export const STREAMS: StickFlightOpts[] = (() => {
  const r = rng('sqd/streams');
  const t0s = [20.98, 21.22, 21.46, 21.68];
  const from: [number, number][] = [[118, 958], [660, 950], [196, 962], [612, 955]];
  return t0s.map((t0, i) => {
    const to: [number, number] = [r.range(DC_ROOF.x0 + 30, DC_ROOF.x1 - 30), DC_ROOF.y + 6];
    return {from: from[i], to, t0, t1: t0 + r.range(0.5, 0.55), arc: r.range(70, 90), w0: 16, w1: 12, rot0: r.range(-20, 20), rot1: r.range(-30, 30), end: 'shrink' as const};
  });
})();
/** The streams at film time T (StickFlight reads SQD's own clock: its times are moved to it). */
export const RevealStreams: React.FC<{T: number}> = ({T}) => (
  <>
    {STREAMS.map((o, i) =>
      T >= o.t0 && T < o.t1 + 0.02 ? <StickFlight key={i} {...o} t0={o.t0 - SQD_START} t1={o.t1 - SQD_START} tier="support" trail={false} seed={`sqd/st${i}`} /> : null,
    )}
  </>
);

// ---------------------------------------------------------------- the trucks on the road (town plane)
const TRUCKS = [
  {t0: 20.8, t1: 22.0},
  {t0: 21.15, t1: 22.2},
];
/** The two DC trucks driving up the road into the DC's gate (they shrink into it over their last 0.12 s). */
export const RoadTrucks: React.FC<{T: number}> = ({T}) => {
  let box = '';
  let cab = '';
  let lit = '';
  let wheels = '';
  for (const k of TRUCKS) {
    if (T < k.t0 || T >= k.t1) continue;
    const u = (T - k.t0) / (k.t1 - k.t0);
    const {p, w} = roadAt(u);
    const len = w * 0.9 * Math.min(1, (k.t1 - T) / 0.12);
    if (len < 0.8) continue;
    // driving away up the road (seen from behind and the side, cab ahead): flip so the cab leads up-right
    const g = truckD(p[0] - len / 2, p[1] - 1, len);
    box += g.box;
    cab += g.cab;
    lit += g.roofLit;
    wheels += g.wheels;
  }
  if (!box) return null;
  return (
    <>
      <path d={box} fill={EMBER.dc} />
      <path d={cab} fill={EMBER.dcSide} />
      <path d={lit} fill={EMBER.frost} />
      <path d={wheels} fill={EMBER.dcDark} />
    </>
  );
};

// ---------------------------------------------------------------- the birds (sky; film time)
type Bird = {dx: number; dy: number; size: number; hz: number; ph: number; glide?: boolean};
const BIRDS: Bird[] = [
  {dx: 0, dy: 0, size: 17, hz: 3.2, ph: 0},
  {dx: -26, dy: -14, size: 15, hz: 3.6, ph: 1.1, glide: true},
  {dx: -28, dy: 15, size: 14, hz: 3.0, ph: 2.3},
  {dx: -54, dy: -26, size: 12, hz: 3.8, ph: 0.6},
];
/** From 21.30 a V of four birds crosses from the left edge at ~95 px/s along y ~700 (below the caption band, above the
 *  DC): a hairline-weight V in the sky's own darker tone (tier C: within ~15 L* of the sky), gone off the right edge
 *  by ~33 s. H2 px, film time. */
export const BIRDS_FROM = 21.3;
export const RevealBirds: React.FC<{T: number}> = ({T}) => {
  if (T < BIRDS_FROM) return null;
  const k = T - BIRDS_FROM;
  const lead: [number, number] = [-30 + 95 * k, 712 - 9 * k + Math.sin(k * 1.9) * 3];
  if (lead[0] > 1200) return null;
  let d = '';
  for (const b of BIRDS) {
    const x = lead[0] + b.dx + Math.sin(k * 1.7 + b.ph) * 1.5;
    const y = lead[1] + b.dy + Math.sin(k * 2.3 + b.ph) * 2;
    const s = b.size / 2;
    const lift = b.glide ? s * (0.3 + 0.05 * Math.sin(k * 2)) : Math.sin(k * b.hz * Math.PI * 2 + b.ph) * s * 0.55;
    const mid = s * 0.3;
    d += `M${f1(x - s)} ${f1(y - lift)}Q${f1(x - s * 0.42)} ${f1(y - mid - lift * 0.3)} ${f1(x)} ${f1(y)}Q${f1(x + s * 0.42)} ${f1(y - mid - lift * 0.3)} ${f1(x + s)} ${f1(y - lift)}`;
  }
  return <path d={d} fill="none" stroke={BIRD_TONE} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />;
};
/** The birds' tone: the dusk sky one step darker (dL* ~ -14 on #5B6A94). */
export const BIRD_TONE = '#3E4A70';
