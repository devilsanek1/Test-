// props/Vehicles.tsx — the makers' handcart (P13: S07, S10, S12) and the foreground tram (P16: S11 -> S12 wipe).
//
//   <MakersCart x={900} y={1450} size={160} crates={2} roll={{at: 34.6, to: [720, 1450], dur: 0.8}} />
//   <MakersCart x={-150} y={1440} roll={{at: 64.0, to: [1250, 1440], dur: 2.4}} pusher
//     dropCrateAt={[64.6, 65.6]} skipAt={65.1} />                                // tick (siteL), skip (siteM), tick (siteR)
//   <Tram y={1150} cross={{at: 60.3, dur: 0.4}} />                              // crosses x -1100 -> 1100 over 0.4 s
//   tramRoof(y) -> world y of the roof line (Pip's perch slot)
//
// Cart anchor (x, y) = the ground point under the cart centre; size = bed length (default 160, about 160 x 100 + handle).
// It faces right (handle at the back-left); flip for leftward travel. Dropped crates stay where they land (world).

import React from 'react';
import {palette} from '../../../lib/theme';
import {ease as E, lerp, prog, useTime} from '../../../lib/time';
import {Seed} from '../../../lib/rng';
import {Ink} from '../../../lib/Ink';
import {Fill} from '../../../lib/Fill';
import {circle, line, rect, rectPath, roundRect, Pt} from '../../../lib/sketch';
import {mat, XG} from '../../../lib/xf';
import {Depth, DEPTH_INK, hopY, landSquash, lodOf, misregScreen, usePropFrame, withOut} from './common';
import {LockCrate} from './Lock';
import {Maker} from './Figures';

export type MakersCartProps = {
  x: number;
  y: number;
  size?: number;
  crates?: number;
  /** Roll from (x, y) to `to` over dur (in-out sine); the wheel turns with the distance. */
  roll?: {at: number; to: Pt; dur?: number; ease?: (q: number) => number};
  /** Crates drop off the back, LAST crate first, one per time; they land and stay (world). */
  dropCrateAt?: number[];
  /** A skip (hop 14 px, 0.25 s) with a landing squash (passing the old site). */
  skipAt?: number | number[];
  /** A back-view maker pushing it. */
  pusher?: boolean;
  at?: number;
  flip?: boolean;
  depth?: Depth;
  seed?: Seed;
};

const BED = {x0: -70, x1: 70, y0: -60, y1: -47};
const WHEEL: [number, number, number] = [-6, -24, 24];

function cartPos(t: number, p: MakersCartProps): {x: number; y: number; dist: number} {
  if (!p.roll || t < p.roll.at) return {x: p.x, y: p.y, dist: 0};
  const q = (p.roll.ease ?? E.inOutSine)(prog(t, p.roll.at, p.roll.dur ?? 1));
  const x = lerp(p.x, p.roll.to[0], q);
  const y = lerp(p.y, p.roll.to[1], q);
  return {x, y, dist: Math.hypot(x - p.x, y - p.y)};
}

const MakersCartBase: React.FC<MakersCartProps> = (p) => {
  const t = useTime();
  const {size = 160, crates = 2, at, flip = false, depth = 'mid', seed = 'cart'} = p;
  const s = size / 140;
  const F = usePropFrame({scale: s, depth, at, seed, defDepth: 'mid'});
  const lod = lodOf(size * F.k, 14, 50);
  if (at !== undefined && t < at) return null;
  const pos = cartPos(t, p);
  const skips = p.skipAt === undefined ? [] : Array.isArray(p.skipAt) ? p.skipAt : [p.skipAt];
  let hy = 0;
  let sq: [number, number] = [1, 1];
  for (const sk of skips) {
    hy += hopY(t, sk, 0.25, 14 / s);
    const l = landSquash(t, sk + 0.25, 0.9);
    sq = [sq[0] * l[0], sq[1] * l[1]];
  }
  const ang = ((pos.dist / s / WHEEL[2]) * 180) / Math.PI;
  const W = F.W;
  const dir = flip ? -1 : 1;
  const drops = p.dropCrateAt ?? [];
  const crateX = (i: number) => (crates === 1 ? 0 : lerp(-36, 36, i / (crates - 1)));
  const onBed: React.ReactNode[] = [];
  const dropped: React.ReactNode[] = [];
  for (let i = 0; i < crates; i++) {
    const dropIdx = crates - 1 - i; // last crate drops first
    const td = drops[dropIdx];
    if (td === undefined || t < td) {
      onBed.push(<LockCrate key={i} x={crateX(i)} y={BED.y0} size={58} n={2} seed={`${seed}/c${i}`} ink={W} />);
      continue;
    }
    // world position at the drop, then a short fall backwards to the ground with a tick
    const pd = cartPos(td, p);
    const bx = pd.x + dir * crateX(i) * s;
    const by = pd.y + BED.y0 * s;
    const fall = prog(t, td, 0.22, E.inQuad);
    const gx = bx - dir * 46 * s * fall;
    const gy = lerp(by, pd.y, fall);
    const rot = -dir * 14 * fall * (1 - prog(t, td + 0.22, 0.12));
    const [lsx, lsy] = landSquash(t, td + 0.22, 0.85);
    dropped.push(
      <XG key={`d${i}`} m={mat.compose(mat.translate(gx, gy), mat.rotate(rot), mat.scale(s * lsx, s * lsy))}>
        <LockCrate x={0} y={0} size={58} n={2} seed={`${seed}/c${i}`} ink={W} />
      </XG>,
    );
  }
  const off = misregScreen(seed);
  const o: [number, number] = [off[0] / F.k, off[1] / F.k];
  const body = (
    <>
      {/* handle rails + grip (behind the bed) */}
      <Ink d={line(BED.x0 + 4, -54, -120, -94, {over: [0, 4], seed: `${seed}/h1`}) + line(BED.x0 + 4, -50, -118, -88, {over: [0, 2], seed: `${seed}/h2`}) + `M-128 -98L-112 -84`} width={W * 1.2} seed={`${seed}/hd`} />
      {onBed}
      <Fill d={rectPath(BED.x0, BED.y0, BED.x1 - BED.x0, BED.y1 - BED.y0)} color={palette.brown} offset={o} seed={`${seed}/bed`} />
      {lod >= 1 ? <Ink d={rect(BED.x0, BED.y0, BED.x1 - BED.x0, BED.y1 - BED.y0, {seed: `${seed}/bedI`, over: 4})} width={W} seed={`${seed}/bedI`} /> : null}
      {lod === 2 ? <Ink d={line(BED.x1 - 8, BED.y1, BED.x1 - 6, -4, {over: [0, 0], seed: `${seed}/leg`}) + `M${BED.x1 - 14} -4H${BED.x1 + 2}` + `M${WHEEL[0] - 6} ${BED.y1}L${WHEEL[0]} ${WHEEL[1]}M${WHEEL[0] + 6} ${BED.y1}L${WHEEL[0]} ${WHEEL[1]}`} width={W * 0.8} seed={`${seed}/frame`} /> : null}
      {/* wheel */}
      <XG m={mat.about(mat.rotate(ang * dir), WHEEL[0], WHEEL[1])}>
        <Fill d={`M${WHEEL[0] - WHEEL[2]} ${WHEEL[1]}a${WHEEL[2]} ${WHEEL[2]} 0 1 0 ${WHEEL[2] * 2} 0a${WHEEL[2]} ${WHEEL[2]} 0 1 0 ${-WHEEL[2] * 2} 0Z` + `M${WHEEL[0] - WHEEL[2] + 6} ${WHEEL[1]}a${WHEEL[2] - 6} ${WHEEL[2] - 6} 0 1 1 ${(WHEEL[2] - 6) * 2} 0a${WHEEL[2] - 6} ${WHEEL[2] - 6} 0 1 1 ${-(WHEEL[2] - 6) * 2} 0Z`} rule="evenodd" color={palette.brown} offset={false} seed={`${seed}/wf`} />
        {lod >= 1 ? <Ink d={circle(WHEEL[0], WHEEL[1], WHEEL[2], {seed: `${seed}/w`, overlap: 10})} width={W} seed={`${seed}/w`} /> : null}
        {lod === 2 ? <Ink d={[0, 60, 120].map((a) => {
          const r = (a * Math.PI) / 180;
          const k = WHEEL[2] - 6;
          return `M${(WHEEL[0] - Math.cos(r) * k).toFixed(1)} ${(WHEEL[1] - Math.sin(r) * k).toFixed(1)}L${(WHEEL[0] + Math.cos(r) * k).toFixed(1)} ${(WHEEL[1] + Math.sin(r) * k).toFixed(1)}`;
        }).join('') + circle(WHEEL[0], WHEEL[1], 4, {seed: `${seed}/hub`})} width={W * 0.6} taper={false} seed={`${seed}/spokes`} /> : null}
      </XG>
    </>
  );
  return (
    <>
      {dropped}
      {p.pusher ? <Maker x={pos.x - dir * 150 * s} y={pos.y} h={200 * s * 1.0} walk={p.roll && t >= p.roll.at && t < p.roll.at + (p.roll.dur ?? 1) ? {hz: 2.2} : undefined} seed={`${seed}/maker`} /> : null}
      <XG m={mat.compose(mat.translate(pos.x, pos.y + hy * s), mat.scale(dir * s * sq[0], s * sq[1]))}>{body}</XG>
    </>
  );
};

// ---------------------------------------------------------------- Tram

export const tramRoof = (y: number) => y + 70;

export type TramProps = {
  /** Centre x at rest (or the cross path below) and the top y (pantograph tip). Default y 1150 (body 1220-1750). */
  x?: number;
  y?: number;
  /** Body length / total height (world px). Default 1500 x 600. */
  w?: number;
  h?: number;
  /** Crosses the frame: x from `from` to `to` over dur (default -1100 -> 1100 in 0.4 s, in-out sine). */
  cross?: {at: number; dur?: number; from?: number; to?: number};
  /** Travel direction (lamps lead): 'right' (default) | 'left'. */
  dir?: 'left' | 'right';
  seed?: Seed;
};

/** Teal tram seen side-on, close to the lens: mintPale windows with ink mullions, a sand stripe, a tealDark skirt and
 *  bogies, peach lamps at the leading end, a pantograph on the roof. Ink 4.8. A foreground wiper: cheap (few paths). */
export const Tram: React.FC<TramProps> = ({x: x0 = 540, y = 1150, w = 1500, h = 600, cross, dir = 'right', seed = 'tram'}) => {
  const t = useTime();
  let x = x0;
  if (cross) {
    if (t < cross.at || t > cross.at + (cross.dur ?? 0.4) + 0.05) return null;
    x = lerp(cross.from ?? -1100, cross.to ?? 1100, E.inOutSine(prog(t, cross.at, cross.dur ?? 0.4)));
  }
  const W = DEPTH_INK.front;
  const L = x - w / 2;
  const R = x + w / 2;
  const top = y + 70;
  const bottom = y + h - 40;
  const nose = 90;
  const bodyD = dir === 'right'
    ? `M${L} ${top}H${R - nose}Q${R} ${top} ${R} ${top + nose}V${bottom}H${L}Z`
    : `M${R} ${top}H${L + nose}Q${L} ${top} ${L} ${top + nose}V${bottom}H${R}Z`;
  const winY = top + 60;
  const winH = 170;
  const n = Math.max(4, Math.round(w / 190));
  let mull = '';
  const wins: string[] = [];
  for (let i = 0; i < n; i++) {
    const wx = L + 50 + (i * (w - 160)) / n;
    const ww = (w - 160) / n - 26;
    wins.push(roundRect(wx, winY, ww, winH, 10));
    mull += rect(wx, winY, ww, winH, {seed: `${seed}/w${i}`, over: 4, edges: 'tlb'});
  }
  const lampX = dir === 'right' ? R - 30 : L + 30;
  const off = misregScreen(seed);
  return (
    <>
      <Ink d={`M${x - 120} ${top}L${x - 40} ${y + 10}L${x + 40} ${top}M${x - 90} ${y + 10}H${x + 30}` + line(x - 200, top + 2, x + 200, top + 2, {over: [0, 0], seed: `${seed}/rf`})} width={W * 0.8} seed={`${seed}/panto`} />
      <Fill d={bodyD} color={palette.teal} offset={off} seed={`${seed}/body`} />
      <Fill d={rectPath(L, top, w - nose * 0.4, 26)} color={palette.tealDark} offset={false} seed={`${seed}/roof`} />
      <Fill d={wins.join('')} color={palette.mintPale} offset={false} seed={`${seed}/win`} />
      <Fill d={rectPath(L, winY + winH + 34, w, 26)} color={palette.sand} offset={false} seed={`${seed}/stripe`} />
      <Fill d={rectPath(L, bottom - 70, w, 70)} color={palette.tealDark} offset={false} seed={`${seed}/skirt`} />
      <Fill d={roundRect(lampX - 22, bottom - 130, 44, 30, 12)} color={palette.peach} offset={false} seed={`${seed}/lamp`} />
      <Ink d={bodyD} width={W} seed={`${seed}/bodyI`} />
      <Ink d={mull + line(L, winY + winH + 34, R, winY + winH + 34, {over: [0, 0], seed: `${seed}/s1`}) + line(L, bottom - 70, R, bottom - 70, {over: [0, 0], seed: `${seed}/s2`})} width={W * 0.75} seed={`${seed}/mull`} />
      <Ink d={roundRect(lampX - 22, bottom - 130, 44, 30, 12, {closed: false, seed: `${seed}/li`})} width={W * 0.6} seed={`${seed}/li`} />
      {[0.22, 0.78].map((f, i) => (
        <g key={i}>
          <Fill d={`M${L + w * f - 70} ${bottom}a70 34 0 0 1 140 0Z`} color={palette.ink} offset={false} seed={`${seed}/bog${i}`} />
        </g>
      ))}
    </>
  );
};

// build-out (outAt / outDur) for props that have no own exit
export const MakersCart = withOut(MakersCartBase, 'MakersCart');
