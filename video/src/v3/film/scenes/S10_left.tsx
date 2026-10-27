// S10_left (S10 / S14 G5b): the LEFT side of the road up to the chip factory, in the set's one perspective
// (S10_geo.ts): a street of houses and shops whose road-facing walls stand on the left pavement and recede to the
// vanishing point, their snowy roofs seen from a little above, chimneys smoking, warm windows switching (some with a
// neighbour), two shopfronts with blade signs, wall lamps, string lights and drainpipes; on the pavement lamp posts,
// snowy trees, a pair chatting under a lamp and walkers heading up the road. Fills the upper-left quadrant round the
// queue without touching the road (the queue's lane) or the caption band (every roof ridge stays under y 612).
import React, {useId} from 'react';
import {Ink} from '../../../lib/Ink';
import {blob} from '../../../lib/sketch';
import {rng} from '../../../lib/rng';
import {useTime} from '../../../lib/time';
import {EMBER, LampPost3, SnowTree, Smoke, Txt, Walker, WinterPerson, personGeo, windowLit, W} from '../kit';
import type {Pt} from '../kit';
import {P, X_ROAD_L, X_WALL_L, kAtZ, mixHex, quad, type QueueBeats} from './S10_geo';

export type Item = {k: number; el: React.ReactNode};

// ---------------------------------------------------------------- the houses

type Roof = 'side' | 'front' | 'flat';
type House = {
  /** Near end (m from the camera) and length along the street (m). */
  z: number;
  len: number;
  /** Eave height, roof rise, depth back from the street (m). */
  h: number;
  rise?: number;
  dep?: number;
  roof: Roof;
  wall: string;
  /** A shopfront on the ground floor: its window colour, its awning colour and the blade sign (text or picto). */
  shop?: {win: string; awning: string; sign: string; signColor: string; lights?: boolean; bladeU?: number};
  /** Silhouettes in these window indices. */
  sil?: Record<number, 'cross' | 'stand' | 'read'>;
  chimney?: number[];
  skylight?: boolean;
};

const WALLS = {
  plum: '#6B4A6E',
  dusk: EMBER.dc,
  steel: '#56628C',
  violet: '#5E5A86',
  navy: '#3E4A74',
  brick: EMBER.brick,
  terra: '#B0603E',
};

/** The street, near to far (Z in m). The near ones are cut by the left edge and the van; past Z ~42 the walls hide
 *  behind the first data center and only their snowy roofs show over it (a calm ground for the landing sticks: low
 *  eaves, no lit windows there); the street stops at Z ~64, where its walls would start to cover the factory's facade. */
const HOUSES: House[] = [
  {z: 13.5, len: 9.5, h: 9.2, rise: 3.0, dep: 10, roof: 'side', wall: WALLS.plum, sil: {3: 'stand'}, chimney: [0.7]},
  {z: 23.3, len: 8.2, h: 7.4, rise: 3.2, dep: 9, roof: 'front', wall: WALLS.steel, shop: {win: EMBER.core, awning: EMBER.hl, sign: 'CAFE', signColor: EMBER.card, lights: true}, sil: {1: 'cross'}, chimney: [0.3], skylight: true},
  {z: 31.8, len: 10, h: 9.6, rise: 2.8, dep: 10, roof: 'side', wall: WALLS.terra, shop: {win: EMBER.houseLit, awning: EMBER.dcSide, sign: 'BAKERY', signColor: EMBER.wall, bladeU: 0.24}, sil: {4: 'read'}, chimney: [0.25, 0.8], skylight: true},
  {z: 42.2, len: 7.2, h: 6.6, dep: 9, roof: 'flat', wall: WALLS.navy},
  {z: 49.8, len: 9, h: 7, rise: 3, dep: 10, roof: 'side', wall: WALLS.violet, chimney: [0.6]},
  {z: 59.2, len: 5, h: 6.5, rise: 2.6, dep: 9, roof: 'front', wall: WALLS.brick, chimney: [0.5]},
];

const shade = (c: string) => mixHex(c, EMBER.dcDark, 0.42);
const roofEdge = EMBER.dcSide;

/** Points on the road-facing wall (X = X_WALL_L): z (m), h (m). */
const wallPt = (z: number, h: number): Pt => P(X_WALL_L, kAtZ(z), h);

/** One window quad on the wall (z0..z1, h0..h1). */
const winQuad = (z0: number, z1: number, h0: number, h1: number) => quad([wallPt(z0, h0), wallPt(z1, h0), wallPt(z1, h1), wallPt(z0, h1)]);

/** A neighbour's head and shoulders in a lit window (clipped to the pane): crossing, standing or reading. */
const PaneSil: React.FC<{z0: number; z1: number; h0: number; h1: number; who: 'cross' | 'stand' | 'read'; seed: string}> = ({z0, z1, h0, h1, who, seed}) => {
  const t = useTime();
  const id = 'pane' + useId().replace(/[^a-zA-Z0-9]/g, '');
  const r = rng(`pane/${seed}`);
  const ph = r.range(0, 6);
  let u = 0.5;
  if (who === 'cross') {
    const T = 5.2;
    u = -0.4 + ((((t + ph) / T) % 1) + 1) % 1 * 1.8;
  } else if (who === 'stand') u = 0.45 + Math.sin(t * 0.6 + ph) * 0.08;
  else u = 0.55;
  const zc = z0 + (z1 - z0) * u;
  const base = wallPt(zc, h0);
  const top = wallPt(zc, h0 + (h1 - h0) * (who === 'read' ? 0.62 : 0.8));
  const hh = base[1] - top[1];
  const sw = hh * 0.62;
  const nod = who === 'read' ? Math.sin(t * 0.9 + ph) * hh * 0.03 : Math.sin(t * 2.1 + ph) * hh * 0.012;
  const x = base[0];
  const y = base[1];
  return (
    <g>
      <defs>
        <clipPath id={id}>
          <path d={winQuad(z0, z1, h0, h1)} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id})`}>
        <path d={`M${x - sw / 2} ${y}Q${x - sw / 2} ${y - hh * 0.5} ${x} ${y - hh * 0.52}Q${x + sw / 2} ${y - hh * 0.5} ${x + sw / 2} ${y}Z`} fill="#C98A64" />
        <circle cx={x} cy={y - hh * 0.52 - hh * 0.15 + nod} r={hh * 0.17} fill="#C98A64" />
        {who === 'read' ? <rect x={x - sw * 0.3} y={y - hh * 0.36} width={sw * 0.6} height={hh * 0.2} fill={EMBER.card} /> : null}
      </g>
    </g>
  );
};

/** One house of the left street, drawn far-to-near by the caller (nearer houses overlap). */
const StreetHouse: React.FC<{hs: House; i: number}> = ({hs, i}) => {
  const t = useTime();
  const seed = `qh${i}`;
  const z0 = hs.z;
  const z1 = hs.z + hs.len;
  const dep = hs.dep ?? 9;
  const rise = hs.rise ?? 3;
  const k0 = kAtZ(z0);
  const k1 = kAtZ(z1);
  const Xw = X_WALL_L;
  const Xb = Xw - dep;
  const near = k0 >= 30;
  const iw = near ? W.far : W.hair;
  const out: React.ReactNode[] = [];
  // ---- the front (the near end, facing the camera: the shade side) and its gable
  const fA = P(Xw, k0, 0);
  const fB = P(Xb, k0, 0);
  const fC = P(Xb, k0, hs.h);
  const fD = P(Xw, k0, hs.h);
  out.push(<path key="front" d={quad([fA, fB, fC, fD])} fill={shade(hs.wall)} />);
  if (hs.roof === 'side') {
    out.push(<path key="gable" d={quad([fD, P(Xw - dep / 2, k0, hs.h + rise), fC])} fill={shade(hs.wall)} />);
    out.push(<path key="gsn" d={quad([P(Xw + 0.3, k0, hs.h - 0.1), P(Xw - dep / 2, k0, hs.h + rise + 0.25), P(Xb - 0.3, k0, hs.h - 0.1), P(Xb + 0.4, k0, hs.h + 0.3), P(Xw - dep / 2, k0, hs.h + rise - 0.25), P(Xw - 0.4, k0, hs.h + 0.3)])} fill={EMBER.snow} />);
  }
  // ---- the road-facing wall (lit by the street)
  let wallD: string;
  const wA = P(Xw, k0, 0);
  const wB = P(Xw, k1, 0);
  const wC = P(Xw, k1, hs.h);
  const wD = P(Xw, k0, hs.h);
  const zm = (z0 + z1) / 2;
  if (hs.roof === 'front') wallD = quad([wA, wB, wC, P(Xw, kAtZ(zm), hs.h + rise), wD]);
  else wallD = quad([wA, wB, wC, wD]);
  out.push(<path key="wall" d={wallD} fill={hs.wall} />);
  // floor bands (a string course one step darker) on the bigger walls
  if (near) {
    for (let f = 1; f * 2.9 < hs.h - 1; f++) {
      out.push(<path key={`band${f}`} d={quad([wallPt(z0, f * 2.9), wallPt(z1, f * 2.9), wallPt(z1, f * 2.9 + 0.22), wallPt(z0, f * 2.9 + 0.22)])} fill={shade(hs.wall)} />);
    }
  }
  // ---- windows (and the shopfront)
  const floors = Math.max(1, Math.floor((hs.h - 0.8) / 2.9));
  const cols = Math.max(2, Math.round(hs.len / 2.7));
  const wins: {z0: number; z1: number; h0: number; h1: number}[] = [];
  for (let f = hs.shop ? 1 : 0; f < floors; f++) {
    for (let c = 0; c < cols; c++) {
      const zz0 = z0 + (hs.len * (c + 0.28)) / cols;
      const zz1 = z0 + (hs.len * (c + 0.72)) / cols;
      wins.push({z0: zz0, z1: zz1, h0: f * 2.9 + 0.95, h1: f * 2.9 + 2.25});
    }
  }
  const nW = wins.length;
  wins.forEach((w, j) => {
    const lit = windowLit(t, `qhw/${seed}`, j, nW, {litFrac: 0.62, gap: [0.7, 1.6]});
    out.push(<path key={`w${j}`} d={winQuad(w.z0, w.z1, w.h0, w.h1)} fill={lit ? EMBER.houseLit : EMBER.dcDark} />);
    if (lit && near) {
      // a sill of snow under each lit window, curtains on the near ones
      out.push(<path key={`ws${j}`} d={quad([wallPt(w.z0 - 0.1, w.h0 - 0.12), wallPt(w.z1 + 0.1, w.h0 - 0.12), wallPt(w.z1 + 0.1, w.h0 + 0.05), wallPt(w.z0 - 0.1, w.h0 + 0.05)])} fill={EMBER.snow} />);
      out.push(<path key={`wc${j}`} d={winQuad(w.z0, w.z0 + (w.z1 - w.z0) * 0.2, w.h0, w.h1)} fill={EMBER.hl} />);
      const who = hs.sil?.[j];
      if (who) out.push(<PaneSil key={`sil${j}`} {...w} who={who} seed={`${seed}/${j}`} />);
    } else if (near) {
      out.push(<path key={`ws${j}`} d={quad([wallPt(w.z0 - 0.1, w.h0 - 0.12), wallPt(w.z1 + 0.1, w.h0 - 0.12), wallPt(w.z1 + 0.1, w.h0 + 0.05), wallPt(w.z0 - 0.1, w.h0 + 0.05)])} fill={EMBER.snow} />);
    }
  });
  if (hs.shop) {
    const sz0 = z0 + hs.len * 0.12;
    const sz1 = z0 + hs.len * 0.66;
    out.push(<path key="shopwin" d={winQuad(sz0, sz1, 0.5, 2.5)} fill={hs.shop.win} />);
    // mullions and a counter shape inside
    out.push(<path key="shopmull" d={winQuad(sz0 + (sz1 - sz0) * 0.49, sz0 + (sz1 - sz0) * 0.53, 0.5, 2.5)} fill={shade(hs.wall)} />);
    out.push(<path key="shopin" d={winQuad(sz0 + (sz1 - sz0) * 0.08, sz0 + (sz1 - sz0) * 0.4, 0.5, 1.2)} fill={EMBER.ring} />);
    out.push(<path key="door" d={winQuad(z0 + hs.len * 0.74, z0 + hs.len * 0.88, 0, 2.4)} fill={EMBER.houseLit} />);
    // the awning: a slab tilted out over the pavement
    const aw = quad([P(Xw, kAtZ(sz0 - 0.3), 3.0), P(Xw, kAtZ(z0 + hs.len * 0.9), 3.0), P(Xw + 1.3, kAtZ(z0 + hs.len * 0.9), 2.5), P(Xw + 1.3, kAtZ(sz0 - 0.3), 2.5)]);
    out.push(<path key="awning" d={aw} fill={hs.shop.awning} />);
    out.push(<path key="awsn" d={quad([P(Xw, kAtZ(sz0 - 0.3), 3.05), P(Xw, kAtZ(z0 + hs.len * 0.9), 3.05), P(Xw + 0.7, kAtZ(z0 + hs.len * 0.9), 2.85), P(Xw + 0.7, kAtZ(sz0 - 0.3), 2.85)])} fill={EMBER.snow} />);
    out.push(<Ink key="awi" d={quad([P(Xw + 1.3, kAtZ(sz0 - 0.3), 2.5), P(Xw + 1.3, kAtZ(z0 + hs.len * 0.9), 2.5)]).replace(/Z$/, '')} width={iw} />);
  }
  // drainpipe at the far end, a wall lamp
  const dp0 = wallPt(z1 - 0.15, 0);
  const dp1 = wallPt(z1 - 0.15, hs.h);
  out.push(<path key="pipe" d={`M${dp0[0].toFixed(1)} ${dp0[1].toFixed(1)}L${dp1[0].toFixed(1)} ${dp1[1].toFixed(1)}`} stroke={EMBER.dcSide} strokeWidth={Math.max(1.4, 0.14 * k1)} />);
  // ---- the roof
  if (hs.roof === 'side') {
    const eave0 = P(Xw + 0.35, k0, hs.h - 0.05);
    const eave1 = P(Xw + 0.35, k1, hs.h - 0.05);
    const ridge0 = P(Xw - dep / 2, k0, hs.h + rise);
    const ridge1 = P(Xw - dep / 2, k1, hs.h + rise);
    out.push(<path key="roof" d={quad([eave0, eave1, ridge1, ridge0])} fill={roofEdge} />);
    // snow covers most of the slope; the tiles show in a strip at the eave
    const sn = (u: number) => [P(Xw + 0.35 - (dep / 2 + 0.35) * u, k0, hs.h - 0.05 + (rise + 0.05) * u), P(Xw + 0.35 - (dep / 2 + 0.35) * u, k1, hs.h - 0.05 + (rise + 0.05) * u)] as [Pt, Pt];
    const [s0a, s0b] = sn(0.16);
    const [s1a, s1b] = sn(1.02);
    out.push(<path key="roofsnow" d={quad([s0a, s0b, s1b, s1a])} fill={EMBER.snow} />);
    // tile courses peeking through the snow (a few short strokes)
    if (near) {
      const r = rng(`tiles/${seed}`);
      let td = '';
      for (let q = 0; q < 5; q++) {
        const u = r.range(0.3, 0.85);
        const za = z0 + r.range(0.05, 0.7) * hs.len;
        const zb = za + r.range(0.8, 2) ;
        const a = P(Xw + 0.35 - (dep / 2 + 0.35) * u, kAtZ(za), hs.h + rise * u);
        const c = P(Xw + 0.35 - (dep / 2 + 0.35) * u, kAtZ(Math.min(z1, zb)), hs.h + rise * u);
        td += `M${a[0].toFixed(1)} ${a[1].toFixed(1)}L${c[0].toFixed(1)} ${c[1].toFixed(1)}`;
      }
      out.push(<path key="tiles" d={td} stroke={EMBER.frost} strokeWidth={Math.max(1.4, k0 * 0.05)} strokeLinecap="round" />);
    }
    if (hs.skylight) {
      const zz = z0 + hs.len * 0.42;
      const lit = windowLit(t, `qsky/${seed}`, 0, 1, {litFrac: 0.6, gap: [1.2, 2.6]});
      const pt = (u: number, z: number) => P(Xw + 0.35 - (dep / 2 + 0.35) * u, kAtZ(z), hs.h + rise * u);
      out.push(<path key="sky" d={quad([pt(0.35, zz), pt(0.35, zz + 1.1), pt(0.62, zz + 1.1), pt(0.62, zz)])} fill={lit ? EMBER.houseLit : EMBER.dcDark} />);
    }
    out.push(<Ink key="ri" d={`M${eave0[0].toFixed(1)} ${eave0[1].toFixed(1)}L${eave1[0].toFixed(1)} ${eave1[1].toFixed(1)}M${ridge0[0].toFixed(1)} ${ridge0[1].toFixed(1)}L${ridge1[0].toFixed(1)} ${ridge1[1].toFixed(1)}`} width={iw} />);
  } else if (hs.roof === 'front') {
    const km = kAtZ(zm);
    const e0 = P(Xw + 0.3, k0, hs.h - 0.05);
    const r0 = P(Xw + 0.3, km, hs.h + rise);
    const r1 = P(Xb, km, hs.h + rise);
    const e1 = P(Xb, k0, hs.h - 0.05);
    out.push(<path key="roof" d={quad([e0, r0, r1, e1])} fill={EMBER.snow} />);
    out.push(<path key="roofedge" d={quad([e0, P(Xw + 0.3, km, hs.h + rise), P(Xw + 0.05, km, hs.h + rise - 0.25), P(Xw + 0.05, k0, hs.h - 0.3)])} fill={roofEdge} />);
    if (hs.skylight) {
      const lit = windowLit(t, `qsky/${seed}`, 0, 1, {litFrac: 0.6, gap: [1.2, 2.6]});
      const pt = (u: number, x: number) => P(Xw - dep * x, kAtZ(z0 + (zm - z0) * u), hs.h + rise * u);
      out.push(<path key="sky" d={quad([pt(0.3, 0.3), pt(0.3, 0.45), pt(0.6, 0.45), pt(0.6, 0.3)])} fill={lit ? EMBER.houseLit : EMBER.dcDark} />);
    }
    out.push(<Ink key="ri" d={`M${e0[0].toFixed(1)} ${e0[1].toFixed(1)}L${r0[0].toFixed(1)} ${r0[1].toFixed(1)}L${r1[0].toFixed(1)} ${r1[1].toFixed(1)}`} width={iw} />);
  } else {
    // flat roof: the top seen from above, snow with a parapet
    const t0 = P(Xw, k0, hs.h);
    const t1 = P(Xw, k1, hs.h);
    const t2 = P(Xb, k1, hs.h);
    const t3 = P(Xb, k0, hs.h);
    out.push(<path key="roof" d={quad([t0, t1, t2, t3])} fill={EMBER.snow} />);
    out.push(<path key="par" d={quad([t0, t1, P(Xw, k1, hs.h + 0.5), P(Xw, k0, hs.h + 0.5)])} fill={shade(hs.wall)} />);
    out.push(<path key="parsn" d={quad([P(Xw, k0, hs.h + 0.5), P(Xw, k1, hs.h + 0.5), P(Xw - 0.4, k1, hs.h + 0.62), P(Xw - 0.4, k0, hs.h + 0.62)])} fill={EMBER.snow} />);
    // an aerial on the roof
    const a0 = P(Xw - dep * 0.4, kAtZ(z0 + hs.len * 0.5), hs.h);
    const ah = 2.4 * kAtZ(z0 + hs.len * 0.5);
    out.push(<path key="ant" d={`M${a0[0]} ${a0[1]}v${-ah}M${a0[0] - ah * 0.22} ${a0[1] - ah * 0.75}h${ah * 0.44}M${a0[0] - ah * 0.15} ${a0[1] - ah * 0.5}h${ah * 0.3}`} stroke={EMBER.dcSide} strokeWidth={1.6} fill="none" />);
  }
  // chimneys with smoke (boxes on the roof near the ridge)
  (hs.chimney ?? []).forEach((u, c) => {
    const zc = z0 + hs.len * u;
    const kc = kAtZ(zc);
    const Xc = hs.roof === 'side' ? Xw - dep / 2 + 0.9 : hs.roof === 'front' ? Xw - dep * 0.6 : Xw - dep * 0.5;
    const hb = hs.roof === 'side' ? hs.h + rise * 0.82 : hs.roof === 'front' ? hs.h + rise * Math.min(1, (zc - z0) / (zm - z0)) * 0.8 : hs.h;
    const cw = 0.8;
    const chTop = hb + 1.6;
    const a = P(Xc - cw / 2, kc, hb);
    const c2 = P(Xc + cw / 2, kc, chTop);
    out.push(<rect key={`ch${c}`} x={a[0]} y={c2[1]} width={Math.max(4, c2[0] - a[0])} height={Math.max(4, a[1] - c2[1])} fill={EMBER.brickShade} />);
    out.push(<path key={`chs${c}`} d={blob((a[0] + c2[0]) / 2, c2[1] - 1, Math.max(3, (c2[0] - a[0]) * 0.7), Math.max(2, kc * 0.18), {seed: `${seed}/cs${c}`})} fill={EMBER.snow} />);
    if (c2[1] > 640) out.push(<Smoke key={`sm${c}`} x={(a[0] + c2[0]) / 2} y={c2[1] - 3} seed={`${seed}/sm${c}`} rise={Math.min(c2[1] - 615, kc * 4)} r1={Math.max(4, kc * 0.3)} r0={Math.max(2, kc * 0.1)} drift={-kc * 1.6} ceil={612} />);
  });
  // blade sign (faces the camera: hangs from the wall over the pavement)
  if (hs.shop) {
    const kz = kAtZ(z0 + hs.len * (hs.shop.bladeU ?? 0.1));
    const s0 = P(Xw + 0.2, kz, 4.3);
    const s1 = P(Xw + 1.9, kz, 3.4);
    const bw = s1[0] - s0[0];
    const bh = s1[1] - s0[1];
    out.push(<path key="bracket" d={`M${s0[0] - 2} ${s0[1] - 3}h${bw + 4}`} stroke={EMBER.anchor} strokeWidth={Math.max(1.6, kz * 0.06)} />);
    out.push(<rect key="blade" x={s0[0]} y={s0[1]} width={bw} height={bh} fill={hs.shop.signColor} />);
    out.push(
      <Txt key="bladet" x={s0[0] + bw / 2} y={s0[1] + bh * 0.68} size={Math.max(12, bh * 0.52)} fill={EMBER.beam} fit={bw * 0.84}>
        {hs.shop.sign}
      </Txt>,
    );
    out.push(<path key="bladesn" d={blob(s0[0] + bw / 2, s0[1] - 1, bw * 0.46, Math.max(2, bh * 0.1), {seed: `${seed}/bs`})} fill={EMBER.snow} />);
    out.push(<Ink key="bladei" d={`M${s0[0]} ${s0[1]}h${bw}v${bh}h${-bw}Z`} width={W.hair} />);
    // warm string lights along the awning's edge (twinkle)
    if (hs.shop.lights) {
      const n = 9;
      const sz0 = z0 + hs.len * 0.12 - 0.3;
      const sz1 = z0 + hs.len * 0.9;
      for (let q = 0; q < n; q++) {
        const zq = sz0 + ((sz1 - sz0) * q) / (n - 1);
        const p = P(Xw + 1.3, kAtZ(zq), 2.4 - Math.sin((q / (n - 1)) * Math.PI) * 0.25);
        const on = Math.floor(t * 2.2 + q * 1.7) % 5 !== 0;
        out.push(<circle key={`bulb${q}`} cx={p[0]} cy={p[1]} r={Math.max(2.2, kAtZ(zq) * 0.09)} fill={on ? EMBER.core : EMBER.ring} />);
      }
    }
  }
  // the wall's outline ink (the near vertical edge and the eave line)
  const eA = P(Xw, k0, 0);
  const eD = P(Xw, k0, hs.h);
  out.push(<Ink key="wi" d={`M${eA[0].toFixed(1)} ${eA[1].toFixed(1)}L${eD[0].toFixed(1)} ${eD[1].toFixed(1)}`} width={iw} />);
  // snow drifted against the wall's foot
  out.push(<path key="drift" d={quad([P(Xw, k0, 0.35), P(Xw, k1, 0.35), P(Xw + 0.6, k1, 0), P(Xw + 0.6, k0, 0)])} fill={EMBER.snow} />);
  return <>{out}</>;
};

// ---------------------------------------------------------------- the pavement life

/** A street lamp (kit LampPost3, arm on top) with its own halo steps: `halo` colours (outer, inner) and sizes in lantern
 *  widths (the kit's 2.6 / 1.5 read as a blue disc in front of snow; on snow the steps are warm and smaller). */
export const QLamp: React.FC<{x: number; y: number; h: number; halo: [string, string]; r?: [number, number]; seed: string; ink?: number}> = ({x, y, h, halo, r = [1.9, 1.15], seed, ink}) => {
  const k = h / 300;
  const lw = 30 * k;
  const cy = y - h - 6 * k + 40 * k * 0.55;
  return (
    <>
      <circle cx={x} cy={cy} r={lw * r[0]} fill={halo[0]} />
      <circle cx={x} cy={cy} r={lw * r[1]} fill={halo[1]} />
      <LampPost3 x={x} y={y} h={h} arm="top" halo={false} seed={seed} ink={ink} />
    </>
  );
};

/** Warm halo steps for a lamp seen against snow or pale ground. */
export const HALO_SNOW: [string, string] = [mixHex(EMBER.snow, EMBER.ring, 0.42), mixHex(EMBER.ring, EMBER.core, 0.25)];
/** ... and against the dusk-blue house walls. */
export const HALO_WALL: [string, string] = [mixHex(EMBER.dc, EMBER.ring, 0.35), mixHex(EMBER.ring, EMBER.core, 0.2)];

/** Feet point on the left pavement: X (m), Z (m). */
const pave = (X: number, z: number): Pt => P(X, kAtZ(z), 0);

/** A standing chatting pair (rest next to motion), true size at their depth. */
const Chatters: React.FC<{z: number; X: number; seed: string}> = ({z, X, seed}) => {
  const k = kAtZ(z);
  const out: React.ReactNode[] = [];
  [0, 1].forEach((i) => {
    const [fx, fy] = pave(X + i * 0.75, z + i * 0.3);
    const g = personGeo(`${seed}/${i}`, {legs: true});
    const hh = 1.72 * k * (i ? 0.94 : 1);
    const s = hh / (g.legH - g.headTop);
    out.push(<WinterPerson key={i} x={fx} y={fy - g.legH * s} s={s} seed={`${seed}/${i}`} legs wear={i ? ['coffee', 'snow'] : ['bag', 'snow']} hair={i ? 'bun' : 'beanie'} breathe={1.2} moves={[{t: 0.9 + i * 0.7, kind: 'turn', amp: 1}]} ink={2.2} />);
  });
  return <>{out}</>;
};

/** A slab of snow sliding off an eave (z0..z1 along the wall at eave height h): it creeps out, tips, drops in three
 *  pieces and bursts into powder on the pavement. Secondary life on the street (S10 1.05; S14 the same frame: 1.05). */
const SnowSlide: React.FC<{z0: number; z1: number; h: number; at: number; seed: string}> = ({z0, z1, h, at, seed}) => {
  const t = useTime();
  const d = t - at;
  if (d < 0 || d > 1.1) return null;
  const r = rng(`slide/${seed}`);
  const out: React.ReactNode[] = [];
  const pieces = 3;
  for (let i = 0; i < pieces; i++) {
    const za = z0 + ((z1 - z0) * i) / pieces;
    const zb = z0 + ((z1 - z0) * (i + 1)) / pieces;
    const zc = (za + zb) / 2;
    const k = kAtZ(zc);
    const creep = Math.min(1, d / 0.25) * 0.35;
    const fall = Math.max(0, d - 0.25 - i * 0.04);
    const hh = Math.max(0, h - 4.9 * fall * fall * 2.4);
    if (hh <= 0.05) continue;
    const a = P(X_WALL_L + 0.35 + creep, kAtZ(za), hh);
    const c = P(X_WALL_L + 0.35 + creep, kAtZ(zb), hh);
    const th = 0.32 * k;
    out.push(<path key={`p${i}`} d={quad([[a[0], a[1] - th], [c[0], c[1] - th], [c[0], c[1]], [a[0], a[1]]])} fill={EMBER.snow} />);
    out.push(<path key={`pi${i}`} d={`M${a[0].toFixed(1)} ${(a[1] - th).toFixed(1)}L${c[0].toFixed(1)} ${(c[1] - th).toFixed(1)}`} stroke={EMBER.ink} strokeWidth={1.4} />);
  }
  // the powder burst where it lands (flat puffs that grow and shrink to nothing)
  const land = 0.25 + Math.sqrt(h / (4.9 * 2.4));
  const b = d - land;
  if (b > 0 && b < 0.55) {
    const k = kAtZ((z0 + z1) / 2);
    const [gx, gy] = P(X_WALL_L + 0.9, k, 0);
    let pd = '';
    for (let q = 0; q < 5; q++) {
      const g = Math.sin((b / 0.55) * Math.PI);
      const rr = (0.25 + r.range(0, 0.25)) * k * g;
      if (rr > 0.6) pd += blob(gx + (q - 2) * 0.35 * k + r.jitter(4), gy - 0.25 * k - b * 0.6 * k, rr, rr * 0.7, {seed: `${seed}/b${q}`});
    }
    if (pd) out.push(<path key="burst" d={pd} fill={EMBER.snow} />);
  }
  return <>{out}</>;
};

export function leftItems(beats: QueueBeats): Item[] {
  const items: Item[] = [];
  // houses far to near: each sorts by its near end
  HOUSES.forEach((hs, i) => {
    items.push({k: kAtZ(hs.z) - 0.01, el: <StreetHouse key={`h${i}`} hs={hs} i={i} />});
  });
  // lamp posts on the left pavement (X -15.9), lit, true size
  for (const z of [20, 28]) {
    const k = kAtZ(z);
    const [x, y] = pave(X_ROAD_L - 0.5, z);
    items.push({k, el: <QLamp key={`lp${z}`} x={x} y={y} h={5 * k} halo={HALO_WALL} r={z > 25 ? [1.5, 0.95] : [1.9, 1.15]} seed={`q/lpL${z}`} />});
  }
  // snowy trees between them (one pine, one bare)
  {
    const z = 24.2;
    const k = kAtZ(z);
    const [x, y] = pave(-17.1, z);
    items.push({k, el: <SnowTree key="tr1" x={x} y={y} h={6 * k} kind="pine" seed="q/trL1" />});
  }
  {
    const z = 33;
    const k = kAtZ(z);
    const [x, y] = pave(-17.3, z);
    items.push({k, el: <SnowTree key="tr2" x={x} y={y} h={5.4 * k} kind="bare" seed="q/trL2" />});
  }
  // the pair chatting under the second lamp
  items.push({k: kAtZ(29.2), el: <Chatters key="chat" z={29.2} X={-17.4} seed="q/chat" />});
  // walkers heading up the road (away), one with a dog; they pass behind the van and on behind the first data center
  {
    const a = pave(-16.6, 24.5);
    const bb = pave(-16.6, 36.5);
    const ka = kAtZ(24.5);
    const kb = kAtZ(36.5);
    items.push({k: kAtZ(30), el: <Walker key="wk1" from={a} to={bb} h={1.75 * ka} h1={1.75 * kb} speed={52} phase={0.15} pause={0.6} seed="q/wk1" wear={['snow']} dog />});
    const a2 = pave(-17.6, 22);
    const b2 = pave(-17.6, 34);
    items.push({k: kAtZ(29), el: <Walker key="wk2" from={a2} to={b2} h={1.7 * kAtZ(22)} h1={1.7 * kAtZ(34)} speed={46} phase={0.62} pause={0.4} seed="q/wk2" wear={['bag', 'snow']} />});
    // one coming DOWN the pavement under an umbrella (two-way traffic), on a fixed window so both panels match
    const a3 = pave(-17.0, 37);
    const b3 = pave(-17.0, 23.5);
    items.push({k: kAtZ(31), el: <Walker key="wk3" from={a3} to={b3} h={1.72 * kAtZ(37)} h1={1.72 * kAtZ(23.5)} window={[-1.6, 4.6]} seed="q/wk3" wear={['umbrella']} />});
  }
  // a slab of snow slides off the bakery's eave
  items.push({k: kAtZ(33.5), el: <SnowSlide key="slide" z0={32.4} z1={35.6} h={9.55} at={1.05} seed="q/slide" />});
  return items;
}

/** The left pavement's ground dressing (drawn with the road, under everything standing): footprints and the kerb's
 *  snow ridge are RoadDress's; here the shopfronts' warm light pools on the snow. */
export const LeftGround: React.FC = () => {
  const pools: React.ReactNode[] = [];
  [
    {z: 16, X: -17.4, r: 2.6, c: EMBER.ring},
    {z: 35.5, X: -17.2, r: 2.2, c: EMBER.core},
  ].forEach((p, i) => {
    const k = kAtZ(p.z);
    const [x, y] = P(p.X, k, 0);
    pools.push(<ellipse key={i} cx={x} cy={y} rx={p.r * k} ry={p.r * k * 0.28} fill={p.c} />);
  });
  return <>{pools}</>;
};

