// SQD_life (REVEAL lane): the supporting life of the reveal (docs/v3/flow_v2.md §4-5 SQD), each piece on FILM time:
//   B  the streams: sticks rising off the town's roofs into the DC's roof, from 21.0 only, <= 1 per 0.25 s, no trails,
//      the last one in by 22.2 (nothing moves in or out across J4's no-new-mover window 22.28-23.08)
//   B  two DC trucks driving up outside's road from our street into the DC's gate (20.80-22.20), small, one steady
//      speed (they come out from behind our street's far side, between the town's two rows: OutsideTown's onRoad slot)
//   C  a V of four birds crossing the upper right of the sky in the hold, out past the right edge by ~22.15
// Tier B life is soft (no outline, C* <= 25 by its fills), slow, and never in the caption band. H2 px.
import React from 'react';
import {rng} from '../../../lib/rng';
import {clamp} from '../../../lib/time';
import {StickFlight, EMBER, type StickFlightOpts} from '../kit';
import {polyD, rectD} from '../kit/Light';
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
type Pt = [number, number];
/** outside.tsx's road up to the DC (its centre line through its three lamps; 88 px wide at our street, 12 at the gate). */
const ROAD: {pts: Pt[]; w: [number, number]} = {pts: [[294, 1092], [318, 1046], [346, 1000], [372, 962], [398, 934]], w: [88, 12]};
const roadAt = (u: number): {p: Pt; w: number} => {
  const P = ROAD.pts;
  const s = clamp(u) * (P.length - 1);
  const i = Math.min(P.length - 2, Math.floor(s));
  const k = s - i;
  return {p: [P[i][0] + (P[i + 1][0] - P[i][0]) * k, P[i][1] + (P[i + 1][1] - P[i][1]) * k], w: ROAD.w[0] + (ROAD.w[1] - ROAD.w[0]) * clamp(u)};
};
/** A small DC truck (H2 px; x = its left, y = its wheels' ground line, w its length): the data center's blue, the cab
 *  ahead (up-right, toward the DC), a lit roof edge (the sky key), flat fills only (tier B: no outline). */
const truckD = (x: number, y: number, w: number) => {
  const h = w * 0.42;
  const box = rectD(x, y - h, w * 0.72, h * 0.86);
  const cab = polyD([[x + w * 0.74, y - h * 0.62], [x + w * 0.9, y - h * 0.62], [x + w, y - h * 0.3], [x + w, y - h * 0.14], [x + w * 0.74, y - h * 0.14]]);
  const wheels = [0.14, 0.56, 0.86].map((u) => {
    const r = w * 0.07;
    const cx = x + w * u;
    const cy = y - r;
    return `M${f1(cx - r)} ${f1(cy)}a${f1(r)} ${f1(r)} 0 1 0 ${f1(2 * r)} 0a${f1(r)} ${f1(r)} 0 1 0 ${f1(-2 * r)} 0`;
  }).join('');
  const roofLit = rectD(x, y - h - 1, w * 0.72, Math.max(1.2, h * 0.08));
  return {box, cab, wheels, roofLit};
};
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
    // ~half the lane wide, shrinking into the DC's gate over its last 0.12 s
    const len = w * 0.5 * Math.min(1, (k.t1 - T) / 0.12);
    if (len < 0.8) continue;
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
/** The hold's life: from 21.30 a V of four birds crosses the upper right of the sky, below the caption band, over the
 *  mountain's flank (~220 px/s, a gentle climb), and leaves past the right edge by ~22.15: in the hold, gone before
 *  J4's no-new-mover window (22.28-23.08), so the seam stays one drawing. A hairline-weight V in the sky's own darker
 *  tone (tier C). H2 px (far plane), film time. */
export const BIRDS_FROM = 21.3;
export const RevealBirds: React.FC<{T: number}> = ({T}) => {
  if (T < BIRDS_FROM) return null;
  const k = T - BIRDS_FROM;
  const lead: [number, number] = [880 + 220 * k, 716 - 22 * k + Math.sin(k * 1.9) * 3];
  if (lead[0] - 70 > 1110) return null;
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
