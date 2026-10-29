// S10_yard (S10 / S14 G5b): the RIGHT side of the road up to the chip factory, in the set's perspective (S10_geo.ts):
// the factory gate (the lit guard booth beside the door, its striped barrier across the road's end, the guard who
// steps out and waves the data center in), workers in hi-vis carrying crates of sticks, a forklift shuttling crates to
// the door (the panel's loop), the yard behind a railed fence receding to the gate (pallets under snow, stacked crates
// with gold showing, a lorry backed up under a floodlight mast, drums), the DELIVERIES sign on the yard's corner and
// one lamp post on the kerb. The data center's calm ring stays clear: nothing new within ~45 px of its right side.
import React from 'react';
import {Fill} from '../../../lib/Fill';
import {Ink} from '../../../lib/Ink';
import {blob, rect as rectInk} from '../../../lib/sketch';
import {useTime} from '../../../lib/time';
import {EMBER, Forklift, GateBooth, Guard, Pallet, PostSign, SnowCap, StickCrate, Worker, WinterPerson, personGeo, W} from '../kit';
import {P, X_FENCE, figK, kAtZ, mixHex, quad, type QueueBeats} from './S10_geo';
import {HALO_SNOW, QLamp, type Item} from './S10_left';

/** The gate: the booth's base centre and width (beside the door, right of the road's end). */
export const BOOTH = {x: 932, y: 882, w: 62};
export const GUARD = {x: 948, y: 892, h: 50, stepTo: 904};

// ---------------------------------------------------------------- the fence (railed, receding; drawn bay by bay)

const FENCE_Z0 = 30;
const FENCE_Z1 = 97;
const FENCE_H = 2;

/** One bay of the fence between depths za and zb on the line X (or across at depth z from Xa to Xb). */
const FenceBay: React.FC<{a: [number, number]; b: [number, number]; post?: boolean; seed: string}> = ({a, b: bb, post = true, seed}) => {
  // a, b = [X, z]
  const ka = kAtZ(a[1]);
  const kb = kAtZ(bb[1]);
  const A0 = P(a[0], ka, 0);
  const A1 = P(a[0], ka, FENCE_H);
  const B0 = P(bb[0], kb, 0);
  const B1 = P(bb[0], kb, FENCE_H);
  const Am = P(a[0], ka, FENCE_H * 0.48);
  const Bm = P(bb[0], kb, FENCE_H * 0.48);
  const iw = ka >= 30 ? W.far : W.hair;
  // pickets: thin verticals between the posts (perspective-spaced)
  const n = Math.max(3, Math.round(Math.abs(A0[0] - B0[0]) / 9));
  let pk = '';
  for (let i = 1; i < n; i++) {
    const u = i / n;
    // true depth spacing
    const za = a[1] + (bb[1] - a[1]) * u;
    const Xa = a[0] + (bb[0] - a[0]) * u;
    const kk = kAtZ(za);
    const p0 = P(Xa, kk, 0.05);
    const p1 = P(Xa, kk, FENCE_H * 0.92);
    pk += `M${p0[0].toFixed(1)} ${p0[1].toFixed(1)}L${p1[0].toFixed(1)} ${p1[1].toFixed(1)}`;
  }
  const pw = Math.max(2.4, 0.12 * ka);
  return (
    <>
      <path d={pk} stroke={EMBER.dcSide} strokeWidth={Math.max(1.2, 0.035 * ka)} />
      <Ink d={`M${A1[0].toFixed(1)} ${A1[1].toFixed(1)}L${B1[0].toFixed(1)} ${B1[1].toFixed(1)}M${Am[0].toFixed(1)} ${Am[1].toFixed(1)}L${Bm[0].toFixed(1)} ${Bm[1].toFixed(1)}`} width={iw} />
      <path d={`M${A1[0].toFixed(1)} ${(A1[1] - 1.5).toFixed(1)}L${B1[0].toFixed(1)} ${(B1[1] - 1.5).toFixed(1)}`} stroke={EMBER.snow} strokeWidth={Math.max(1.6, 0.07 * ka)} strokeLinecap="round" />
      {post ? (
        <>
          <path d={`M${A0[0].toFixed(1)} ${A0[1].toFixed(1)}L${A1[0].toFixed(1)} ${(A1[1] - 2).toFixed(1)}`} stroke={EMBER.dcSide} strokeWidth={pw} strokeLinecap="round" />
          <path d={blob(A1[0], A1[1] - 3, pw * 0.9, pw * 0.45 + 1, {seed: `${seed}/s`})} fill={EMBER.snow} />
        </>
      ) : null}
      {/* snow banked along the fence's foot */}
      <path d={quad([P(a[0] - 0.2, ka, 0.3), P(bb[0] - 0.2, kb, 0.3), P(bb[0] - 0.8, kb, 0), P(a[0] - 0.8, ka, 0)])} fill={EMBER.snow} />
    </>
  );
};

function fenceItems(): Item[] {
  const items: Item[] = [];
  // along the road: perspective bays from the yard corner to the gate
  const bays = 15;
  const zs: number[] = [];
  for (let i = 0; i <= bays; i++) {
    // equal bays in depth (metres)
    zs.push(FENCE_Z0 + ((FENCE_Z1 - FENCE_Z0) * i) / bays);
  }
  for (let i = 0; i < bays; i++) {
    items.push({k: kAtZ(zs[i]) - 0.02, el: <FenceBay key={`fb${i}`} a={[X_FENCE, zs[i]]} b={[X_FENCE, zs[i + 1]]} seed={`q/fb${i}`} />});
  }
  // the yard's front, across at Z 30 from the corner to past the right edge
  for (let i = 0; i < 4; i++) {
    const Xa = X_FENCE + i * 2.1;
    items.push({k: kAtZ(FENCE_Z0) + 0.01, el: <FenceBay key={`ff${i}`} a={[Xa, FENCE_Z0]} b={[Xa + 2.1, FENCE_Z0]} seed={`q/ff${i}`} />});
  }
  return items;
}

// ---------------------------------------------------------------- the yard's props

/** The lorry backed up in the yard (its back doors face us: a back elevation at X ~0, where its sides hide). */
const Lorry: React.FC<{x: number; y: number; w: number; seed: string}> = ({x, y, w, seed}) => {
  const t = useTime();
  const h = w * 1.45;
  const x0 = x - w / 2;
  const top = y - w * 0.22 - h;
  const iw = W.far;
  const blink = Math.floor(t * 1.6) % 2 === 0;
  return (
    <>
      <Fill rect={[x0, top, w, h]} color={EMBER.frost} seed={`${seed}/b`} />
      <Fill rect={[x0 + w * 0.06, top + h * 0.06, w * 0.42, h * 0.86]} color={EMBER.snow} offset={false} />
      <Fill rect={[x0 + w * 0.52, top + h * 0.06, w * 0.42, h * 0.86]} color={EMBER.snow} offset={false} />
      {/* the locking bars and a reflective stripe */}
      <path d={`M${x0 + w * 0.2} ${top + h * 0.08}v${h * 0.82}M${x0 + w * 0.36} ${top + h * 0.08}v${h * 0.82}M${x0 + w * 0.64} ${top + h * 0.08}v${h * 0.82}M${x0 + w * 0.8} ${top + h * 0.08}v${h * 0.82}`} stroke={EMBER.dcSide} strokeWidth={1.6} />
      <rect x={x0} y={top + h * 0.94} width={w} height={h * 0.04} fill={EMBER.hl} />
      {/* bumper, wheels, tail lights */}
      <rect x={x0 - 2} y={top + h} width={w + 4} height={w * 0.08} fill={EMBER.dcSide} />
      <rect x={x0 + w * 0.04} y={top + h + w * 0.08} width={w * 0.22} height={w * 0.14} fill={EMBER.anchor} />
      <rect x={x0 + w * 0.74} y={top + h + w * 0.08} width={w * 0.22} height={w * 0.14} fill={EMBER.anchor} />
      <rect x={x0 + w * 0.02} y={top + h - w * 0.02} width={w * 0.1} height={w * 0.07} fill={blink ? EMBER.houseLit : EMBER.beam} />
      <rect x={x0 + w * 0.88} y={top + h - w * 0.02} width={w * 0.1} height={w * 0.07} fill={blink ? EMBER.houseLit : EMBER.beam} />
      <SnowCap x={x0 - 2} y={top} w={w + 4} h={7} seed={`${seed}/sn`} />
      <Ink d={rectInk(x0, top, w, h, {seed: `${seed}/i`, over: [1, 2]}) + `M${x0 + w * 0.5} ${top + h * 0.06}v${h * 0.86}`} width={iw} />
    </>
  );
};

/** A floodlight mast (yard lighting): a lattice pole with two lamp heads and flat halo steps; true perspective. */
const FloodMast: React.FC<{x: number; y: number; h: number; seed: string}> = ({x, y, h, seed}) => {
  const top = y - h;
  const s = h / 230;
  let lat = '';
  for (let i = 0; i < 9; i++) {
    const ya = y - (h * i) / 9;
    const yb = y - (h * (i + 1)) / 9;
    lat += `M${x - 4 * s} ${ya}L${x + 4 * s} ${yb}M${x + 4 * s} ${ya}L${x - 4 * s} ${yb}`;
  }
  return (
    <>
      <circle cx={x} cy={top + 6 * s} r={30 * s} fill={mixHex(EMBER.ring, EMBER.skyLow, 0.18)} />
      <circle cx={x} cy={top + 6 * s} r={17 * s} fill={mixHex(EMBER.ring, EMBER.core, 0.3)} />
      <path d={`M${x - 4 * s} ${y}L${x - 2 * s} ${top}M${x + 4 * s} ${y}L${x + 2 * s} ${top}`} stroke={EMBER.dcSide} strokeWidth={2} />
      <path d={lat} stroke={EMBER.dcSide} strokeWidth={1.2} />
      <rect x={x - 22 * s} y={top - 2 * s} width={44 * s} height={4 * s} fill={EMBER.anchor} />
      <rect x={x - 22 * s} y={top + 2 * s} width={16 * s} height={10 * s} fill={EMBER.core} />
      <rect x={x + 6 * s} y={top + 2 * s} width={16 * s} height={10 * s} fill={EMBER.core} />
      <path d={blob(x, top - 3 * s, 22 * s, 3 * s + 1, {seed: `${seed}/sn`})} fill={EMBER.snow} />
    </>
  );
};

/** Oil drums (two, one with snow), base centre on y. */
const Drums: React.FC<{x: number; y: number; w: number}> = ({x, y, w}) => (
  <>
    {[0, 1].map((i) => {
      const dx = x + (i - 0.5) * w * 1.05;
      const h = w * 1.3;
      return (
        <g key={i}>
          <rect x={dx - w / 2} y={y - h} width={w} height={h} fill={i ? EMBER.dc : EMBER.beam} />
          <path d={`M${dx - w / 2} ${y - h * 0.66}h${w}M${dx - w / 2} ${y - h * 0.33}h${w}`} stroke={EMBER.ink} strokeWidth={1.2} />
          <path d={blob(dx, y - h - 1, w * 0.5, w * 0.12 + 1, {seed: `drum${i}`})} fill={EMBER.snow} />
          <path d={`M${dx - w / 2} ${y - h}h${w}v${h}h${-w}Z`} fill="none" stroke={EMBER.ink} strokeWidth={1.6} />
        </g>
      );
    })}
  </>
);

/** A worker standing with a clipboard (rest next to motion); turns to the chip maker on `stopAt` (S14). */
const ClipboardWorker: React.FC<{x: number; y: number; h: number; turnAt?: number; seed: string}> = ({x, y, h, turnAt, seed}) => {
  const g = personGeo(seed, {legs: true});
  const s = h / (g.legH - g.headTop);
  return <WinterPerson x={x} y={y - g.legH * s} s={s} seed={seed} legs hair="short" wear={['hivis', 'hardhat', 'clipboard']} breathe={0.8} ink={2.2} moves={turnAt !== undefined ? [{t: turnAt, kind: 'turn', amp: 1.4}] : []} />;
};

export function yardItems(beats: QueueBeats): Item[] {
  const items: Item[] = [...fenceItems()];
  // ---- the gate (the booth beside the door, the barrier across the road's end, the guard)
  const kGate = kAtZ(96);
  items.push({k: kGate, el: <GateBooth key="booth" x={BOOTH.x} y={BOOTH.y} w={BOOTH.w} arm={58} armSide="left" liftAt={beats.barrierLiftAt} seed="q/booth" ink={W.far} />});
  items.push({k: kGate + 0.3, el: <Guard key="guard" x={GUARD.x} y={GUARD.y} h={GUARD.h} stepAt={beats.guardStepAt} stepTo={GUARD.stepTo} waveAt={beats.guardWaveAt} seed="q/guard" />});
  // ---- workers in the yard (hi-vis, crates of sticks), the forklift (the loop)
  const kW = kAtZ(84);
  items.push({k: kW - 0.4, el: <Forklift key="fork" y={898} w={74} loop={{a: 1052, b: 968, dur: 2.0, hold: 0.55, phase: 0.1}} dir={-1} carry seed="q/fork" />});
  items.push({k: kW, el: <Worker key="wk1" x={0} y={906} h={46} carry walk={{a: 1000, b: 958, dur: 1.6, hold: 0.5, phase: 0.55}} stopAt={beats.workersStopAt} seed="q/wkr1" />});
  items.push({k: kW + 0.2, el: <ClipboardWorker key="wk2" x={1040} y={912} h={47} turnAt={beats.workersStopAt} seed="q/wkr2" />});
  const kW3 = kAtZ(62);
  items.push({k: kW3, el: <Worker key="wk3" x={0} y={968} h={1.75 * figK(kW3)} carry walk={{a: 1066, b: 1000, dur: 1.9, hold: 0.7, phase: 0.2}} stopAt={beats.workersStopAt !== undefined ? beats.workersStopAt + 0.08 : undefined} seed="q/wkr3" />});
  // ---- the yard: stacked crates with gold showing, pallets under snow, drums, the lorry, the floodlight mast
  {
    const z = 70;
    const k = kAtZ(z);
    const [x, y] = P(-2.7, k, 0);
    const fk = figK(k);
    items.push({k: k - 0.5, el: (
      <React.Fragment key="crates">
        <StickCrate x={x} y={y} w={1.4 * fk} sticks={4} snow seed="q/cr1" ink={W.hair} />
        <StickCrate x={x + 1.45 * fk} y={y} w={1.4 * fk} sticks={3} snow seed="q/cr2" ink={W.hair} />
        <StickCrate x={x + 0.7 * fk} y={y - 0.87 * fk} w={1.4 * fk} sticks={4} snow seed="q/cr3" ink={W.hair} />
      </React.Fragment>
    )});
  }
  {
    const z = 54;
    const k = kAtZ(z);
    const [x, y] = P(1.4, k, 0);
    items.push({k: k - 0.3, el: <FloodMast key="mast" x={x} y={y} h={12 * k} seed="q/mast" />});
  }
  {
    const z = 44;
    const k = kAtZ(z);
    const [x, y] = P(0.2, k, 0);
    items.push({k, el: <Lorry key="lorry" x={x} y={y} w={2.5 * figK(k)} seed="q/lorry" />});
  }
  {
    const z = 36;
    const k = kAtZ(z);
    const [x, y] = P(-2.6, k, 0);
    const w = 1.2 * k;
    items.push({k, el: (
      <React.Fragment key="pallets">
        <Pallet x={x} y={y} w={w} seed="q/pal1" />
        <Pallet x={x} y={y - w * 0.16} w={w} seed="q/pal2" />
        <Pallet x={x + 2} y={y - w * 0.32} w={w} seed="q/pal3" />
        <Pallet x={x + w * 1.08} y={y} w={w} seed="q/pal4" />
      </React.Fragment>
    )});
  }
  {
    const z = 40;
    const k = kAtZ(z);
    const [x, y] = P(1.9, k, 0);
    items.push({k: k + 0.1, el: <Drums key="drums" x={x} y={y} w={0.6 * k} />});
  }
  // ---- the DELIVERIES sign on the yard's corner (faces the road's traffic: us), out of the right rail
  {
    const k = kAtZ(FENCE_Z0);
    const [x, y] = P(X_FENCE + 1.6, k, 0);
    items.push({k: k + 0.05, el: <PostSign key="deliv" x={Math.min(x, 872)} y={y + 4} w={150} h={36} post={44} text="DELIVERIES" size={24} color={EMBER.card} seed="q/deliv" ink={W.far} />});
  }
  // ---- one lamp post on the right pavement by the fence (clear of the data center's ring and the chip maker's feet)
  {
    const z = 46;
    const k = kAtZ(z);
    const [x, y] = P(X_FENCE - 0.6, k, 0);
    items.push({k, el: <QLamp key="lpR" x={x} y={y} h={5 * k} halo={HALO_SNOW} r={[1.6, 1.0]} seed="q/lpR" />});
  }
  return items;
}

/** The gate's ground: the barrier's shadow strip and the yard's lamp pools (under everything standing). */
export const YardGround: React.FC = () => {
  const pools: React.ReactNode[] = [];
  [
    {z: 54, X: 1.4, r: 4.5},
    {z: 46, X: -4.6, r: 2.2},
  ].forEach((p, i) => {
    const k = kAtZ(p.z);
    const [x, y] = P(p.X, k, 0);
    pools.push(<ellipse key={i} cx={x} cy={y} rx={p.r * k} ry={p.r * k * 0.3} fill={i ? EMBER.core : EMBER.frost} />);
  });
  return <>{pools}</>;
};

