// kit/Town.tsx: THE TOWN OUTSIDE HER WINDOW (one evening for the film, kit/README.md "Time of day"). Drawn into any
// window's glass rect, a far plane (fills only, no ink), DENSE and ALIVE in flat value steps, back to front:
//   the dusk-blue sky (CC.sky) with a lower step (skyLow), the last light at the horizon (glowHi, glow: lilac then peach),
//   a crescent moon, stars (two twinkle), drifting clouds; the far skyline in haze (towers, a dome, a crane, a few lit
//   specks); two rows of roofs (townMid, townNear: pitched and flat, chimneys, many small windows); the facades across the
//   street (facade plum, cornices, a grid of windows, lit shop fronts on the ground floor, a street lamp) with a
//   pavement where walkers and two cars (warm headlight beams) pass; neighbours at home in lit windows and crossing
//   two of them; windows switching on and off (the front ones show who came home); a flock (7 filled birds crossing in
//   ~2 s), a single bird and a near bird past the glass; clouds drifting at ~22 px/s. Sized to READ at phone width.
// Usage: <DuskTown x y w h /> with the GLASS rect in canvas px (it clips itself). `horizon` = the canvas y of the far
// skyline's base (default y + 0.55 h); `k` = the content scale (1 = the nook wide P2; the same seed + the room's
// matrix gives the same town at 1.2x / 1.4x). Life rates: `life` (1 = draft G5 density).

import React, {useId, useMemo} from 'react';
import {blob, polyPath, roundRect} from '../../../lib/sketch';
import {rand, rng} from '../../../lib/rng';
import {useTime} from '../../../lib/time';
import {CC} from '../palette';
import {At, Pt} from './util';
import {Bird, Clouds, Flock, Live, loopT, onOff, stepT} from './Ambient';

export type DuskTownProps = {
  /** The glass rect (canvas px). */
  x: number;
  y: number;
  w: number;
  h: number;
  /** Canvas y of the far skyline's base (default y + 0.55 h). */
  horizon?: number;
  /** Content scale (default 1: P2's window; the desk strip ~0.9; a close window 1.2-1.6). */
  k?: number;
  /** Crescent moon at this canvas point (default: upper right of the glass); false = none. */
  moon?: Pt | false;
  /** Number of stars (default 7). */
  stars?: number;
  /** Clouds (default 3) and their drift px/s at k 1 (default 22: the drift reads by eye; scaled by k). */
  clouds?: number;
  cloudSpeed?: number;
  /** A flock crossing the sky (default true; its period / size scale with k). */
  flock?: boolean;
  /** The facades across the street + pavement + walkers (default true). */
  street?: boolean;
  /** Ambient rate multiplier (default 1). */
  life?: number;
  seed?: string;
  at?: At;
};

type Win = {x: number; y: number; w: number; h: number; lit: boolean; sw: boolean; per: number; duty: number; c: string; id: string};
type Blk = {d: string; c: string};

function buildTown(p: Required<Pick<DuskTownProps, 'x' | 'y' | 'w' | 'h' | 'k' | 'seed' | 'street'>> & {H: number}) {
  const {x, y, w, h, k, seed, H, street} = p;
  const r = rng(`town2/${seed}`);
  const x0 = x - 60 * k;
  const x1 = x + w + 60 * k;
  const far: Blk[] = [];
  const farLit: Pt[] = [];
  const mid: Blk[] = [];
  const near: Blk[] = [];
  const front: Blk[] = [];
  const wins: Win[] = [];
  const addWins = (bx: number, top: number, bw: number, bh: number, ww: number, wh: number, gx: number, gy: number, litP: number, swP: number, layer: string) => {
    const cols = Math.max(1, Math.floor((bw - gx) / (ww + gx)));
    const rows = Math.max(1, Math.floor((bh - gy) / (wh + gy)));
    const ox = bx + (bw - cols * (ww + gx) + gx) / 2;
    for (let j = 0; j < rows; j++)
      for (let i = 0; i < cols; i++) {
        const lit = r.chance(litP);
        wins.push({x: ox + i * (ww + gx), y: top + gy + j * (wh + gy), w: ww, h: wh, lit, sw: r.chance(swP), per: r.range(4, 9), duty: r.range(0.45, 0.75), c: r.chance(0.3) ? CC.litWarm : CC.lit, id: `${layer}${wins.length}`});
      }
  };
  // ---- far skyline (haze): towers, a dome, a crane
  for (let cx = x0; cx < x1; ) {
    const bw = r.range(18, 54) * k;
    const bh = r.range(30, 150) * k * (r.chance(0.15) ? 1.4 : 1);
    const top = H - bh;
    if (r.chance(0.22)) {
      // a stepped tower top
      far.push({d: polyPath([[cx, H + 10 * k], [cx, top + 14 * k], [cx + bw * 0.2, top + 14 * k], [cx + bw * 0.2, top], [cx + bw * 0.8, top], [cx + bw * 0.8, top + 14 * k], [cx + bw, top + 14 * k], [cx + bw, H + 10 * k]]), c: CC.skyline});
    } else far.push({d: polyPath([[cx, H + 10 * k], [cx, top], [cx + bw, top + (r.chance(0.3) ? 8 * k : 0)], [cx + bw, H + 10 * k]]), c: CC.skyline});
    for (let i = 0; i < 3; i++) if (r.chance(0.5)) farLit.push([cx + r.range(4, bw - 4), top + r.range(8, bh - 6)]);
    cx += bw + r.range(-4, 6) * k;
  }
  // a dome and a crane (the town keeps going)
  const domeX = x + w * r.range(0.25, 0.45);
  far.push({d: blob(domeX, H - 70 * k, 34 * k, 30 * k, {seed: `${seed}/dome`, wobble: 0.01}) + polyPath([[domeX - 38 * k, H + 10 * k], [domeX - 38 * k, H - 66 * k], [domeX + 38 * k, H - 66 * k], [domeX + 38 * k, H + 10 * k]]) + polyPath([[domeX - 3 * k, H - 100 * k], [domeX + 3 * k, H - 100 * k], [domeX + 2 * k, H - 124 * k], [domeX - 2 * k, H - 124 * k]]), c: CC.skyline});
  const crX = x + w * r.range(0.62, 0.8);
  const crTop = H - 190 * k;
  far.push({d: polyPath([[crX - 4 * k, H], [crX - 4 * k, crTop], [crX + 4 * k, crTop], [crX + 4 * k, H]]) + polyPath([[crX - 70 * k, crTop + 4 * k], [crX + 130 * k, crTop + 4 * k], [crX + 130 * k, crTop + 10 * k], [crX - 70 * k, crTop + 10 * k]]) + polyPath([[crX - 70 * k, crTop + 10 * k], [crX - 52 * k, crTop + 10 * k], [crX - 52 * k, crTop + 26 * k], [crX - 70 * k, crTop + 26 * k]]) + polyPath([[crX + 98 * k, crTop + 10 * k], [crX + 100 * k, crTop + 10 * k], [crX + 100 * k, crTop + 60 * k], [crX + 98 * k, crTop + 60 * k]]), c: CC.skyline});
  // ---- mid row (townMid): blocks and pitched roofs, small windows
  const midBase = H + 60 * k;
  for (let cx = x0; cx < x1; ) {
    const bw = r.range(48, 96) * k;
    const bh = r.range(70, 120) * k;
    const top = midBase - bh;
    if (r.chance(0.55)) {
      const peak = top - bw * r.range(0.22, 0.34);
      mid.push({d: polyPath([[cx, midBase + 40 * k], [cx, top], [cx + bw / 2, peak], [cx + bw, top], [cx + bw, midBase + 40 * k]]), c: r.chance(0.5) ? CC.townMid : CC.townMidSide});
    } else mid.push({d: polyPath([[cx, midBase + 40 * k], [cx, top], [cx + bw, top], [cx + bw, midBase + 40 * k]]), c: r.chance(0.5) ? CC.townMid : CC.townMidSide});
    if (r.chance(0.4)) mid.push({d: polyPath([[cx + bw * 0.7, top + 2], [cx + bw * 0.7, top - 22 * k], [cx + bw * 0.82, top - 22 * k], [cx + bw * 0.82, top + 2]]), c: CC.townMidSide});
    addWins(cx, top + 8 * k, bw, bh - 10 * k, 9 * k, 12 * k, 7 * k, 9 * k, 0.32, 0.06, 'm');
    cx += bw + r.range(0, 8) * k;
  }
  // ---- near roofs (townNear): bigger pitched roofs with chimneys
  const nearBase = H + 140 * k;
  for (let cx = x0 - 30 * k; cx < x1; ) {
    const bw = r.range(80, 140) * k;
    const bh = r.range(80, 118) * k;
    const top = nearBase - bh;
    const peak = top - bw * r.range(0.26, 0.38);
    near.push({d: polyPath([[cx, nearBase + 60 * k], [cx, top], [cx - 6 * k, top + 4 * k], [cx + bw / 2, peak], [cx + bw + 6 * k, top + 4 * k], [cx + bw, top], [cx + bw, nearBase + 60 * k]]), c: CC.townNear});
    if (r.chance(0.65)) {
      const chx = cx + bw * r.range(0.6, 0.78);
      near.push({d: polyPath([[chx, top - 4 * k], [chx, peak + (chx - cx - bw / 2) * 0.6 - 30 * k], [chx + 14 * k, peak + (chx - cx - bw / 2) * 0.6 - 30 * k], [chx + 14 * k, top - 4 * k]]), c: CC.roofs});
    }
    addWins(cx + 6 * k, top + 10 * k, bw - 12 * k, bh - 12 * k, 14 * k, 19 * k, 11 * k, 12 * k, 0.38, 0.16, 'n');
    cx += bw + r.range(4, 16) * k;
  }
  // ---- the facades across the street (+ pavement, shop fronts, a street lamp)
  const pave = y + h - 12 * k;
  const shop: {x: number; w: number; y: number; h: number}[] = [];
  if (street) {
    for (let cx = x0 - 20 * k; cx < x1; ) {
      const bw = r.range(150, 230) * k;
      const top = H + r.range(70, 130) * k;
      front.push({d: polyPath([[cx, pave], [cx, top], [cx + bw, top], [cx + bw, pave]]), c: r.chance(0.5) ? CC.facade : CC.facadeSide});
      front.push({d: polyPath([[cx - 4 * k, top], [cx - 4 * k, top - 9 * k], [cx + bw + 4 * k, top - 9 * k], [cx + bw + 4 * k, top]]), c: CC.cornice});
      const floorsTop = top + 6 * k;
      const shopTop = pave - 46 * k;
      addWins(cx + 8 * k, floorsTop, bw - 16 * k, Math.max(10 * k, shopTop - floorsTop - 14 * k), 22 * k, 30 * k, 14 * k, 16 * k, 0.45, 0.22, 'f');
      front.push({d: polyPath([[cx, shopTop - 8 * k], [cx + bw, shopTop - 8 * k], [cx + bw, shopTop - 2 * k], [cx, shopTop - 2 * k]]), c: CC.cornice});
      if (r.chance(0.7)) shop.push({x: cx + bw * 0.12, w: bw * 0.5, y: shopTop + 4 * k, h: pave - shopTop - 4 * k});
      cx += bw;
    }
  }
  return {far, farLit, mid, near, front, wins, shop, pave};
}

export const DuskTown: React.FC<DuskTownProps> = ({x, y, w, h, horizon, k = 1, moon, stars = 7, clouds = 3, cloudSpeed = 22, flock = true, street = true, life = 1, seed = 'town', at}) => {
  const t = useTime() * life;
  const id = 'v2town' + useId().replace(/[^a-zA-Z0-9]/g, '');
  const H = horizon ?? y + h * 0.55;
  const T = useMemo(() => buildTown({x, y, w, h, k, seed, H, street}), [x, y, w, h, k, seed, H, street]);
  const r = rng(`townsky/${seed}`);
  const moonP: Pt | false = moon === undefined ? [x + w * 0.82, y + Math.max(40 * k, (H - y) * 0.22)] : moon;
  const starPts: Pt[] = Array.from({length: stars}, () => [x + r.range(0.04, 0.96) * w, y + r.range(0.03, 0.55) * Math.max(10, H - 170 * k - y)]);
  // two neighbours crossing lit facade windows (a figure passes every ~6 s)
  const litFront = T.wins.filter((q) => q.id.startsWith('f') && q.lit && !q.sw && q.x > x && q.x + q.w < x + w && q.y > H && q.y + q.h < y + h);
  const hosts = [litFront[Math.floor(litFront.length * 0.3)], litFront[Math.floor(litFront.length * 0.75)]].filter(Boolean);
  const wt = stepT(t, 12);
  const walkers = street
    ? [0, 1, 2].map((i) => {
        const per = 9 + i * 2.3;
        const dir = i % 2 === 0 ? 1 : -1;
        const p = loopT(wt, per, rand(seed, `wk${i}`) * per) / per;
        const wx = dir === 1 ? x - 20 * k + (w + 40 * k) * p : x + w + 20 * k - (w + 40 * k) * p;
        return {x: wx, step: Math.floor(wt * 6 + i) % 2, i};
      })
    : [];
  // two cars along the street (opposite ways, warm headlight beams on the road ahead, tail lights), big enough to read
  // at phone width; a near bird past the glass every ~6.5 s
  const cars = street
    ? [0, 1].map((i) => {
        const per = 3.4 + i * 1.3;
        const dur = 2.0 + i * 0.4;
        const p = loopT(t, per, rand(seed, `car${i}`) * per) / dur;
        const dir = i === 0 ? 1 : -1;
        const cx = dir === 1 ? x - 200 * k + (w + 400 * k) * p : x + w + 200 * k - (w + 400 * k) * p;
        return {i, cx, dir, on: p <= 1};
      })
    : [];
  const nb = loopT(t, 6.5, rand(seed, 'nearbird') * 6.5) / 1.6;
  const nbx = x + w + 40 * k - (w + 80 * k) * nb;
  const nby = y + Math.max(40 * k, (H - y) * 0.45) + Math.sin(nb * 6) * 18 * k;
  return (
    <Live at={at} c={[x + w / 2, y + h / 2]}>
      <defs>
        <clipPath id={id} clipPathUnits="userSpaceOnUse">
          <rect x={x} y={y} width={w} height={h} />
        </clipPath>
        {hosts.map((q, i) => (
          <clipPath key={i} id={`${id}n${i}`} clipPathUnits="userSpaceOnUse">
            <rect x={q.x} y={q.y} width={q.w} height={q.h} />
          </clipPath>
        ))}
      </defs>
      <g clipPath={`url(#${id})`}>
        <rect x={x - 2} y={y - 2} width={w + 4} height={h + 4} fill={CC.sky} />
        <rect x={x - 2} y={H - 150 * k} width={w + 4} height={h + 200 * k} fill={CC.skyLow} />
        <rect x={x - 2} y={H - 70 * k} width={w + 4} height={h + 120 * k} fill={CC.glowHi} />
        <rect x={x - 2} y={H - 34 * k} width={w + 4} height={h + 80 * k} fill={CC.glow} />
        {starPts.map(([sx, sy], i) => (i < 2 && !onOff(t, `${seed}/st${i}`, 2.6 + i, 0.7) ? null : <circle key={i} cx={sx} cy={sy} r={(i < 2 ? 3.4 : 2.4) * Math.sqrt(k)} fill={CC.star} />))}
        {moonP ? (
          <>
            <circle cx={moonP[0]} cy={moonP[1]} r={22 * k} fill={CC.moon} />
            <circle cx={moonP[0] + 11 * k} cy={moonP[1] - 7 * k} r={19 * k} fill={CC.sky} />
          </>
        ) : null}
        {clouds > 0 ? <Clouds x={x} y={y + 18 * k} w={w} h={Math.max(30, H - 120 * k - y)} n={clouds} speed={cloudSpeed * k} size={k} seed={`${seed}/cl`} /> : null}
        {T.far.map((q, i) => (
          <path key={`f${i}`} d={q.d} fill={q.c} />
        ))}
        {T.farLit.map(([lx, ly], i) => (onOff(t, `${seed}/fl${i}`, 7, 0.85) ? <rect key={`fl${i}`} x={lx} y={ly} width={3 * k} height={3 * k} fill={CC.skylineLit} /> : null))}
        {flock ? <Flock x={x} y={y + 30 * k} w={w} h={Math.max(40, H - 120 * k - y)} n={7} size={14 * k} period={4.2} dur={Math.min(2.6, Math.max(1.8, w / 330))} offset={-0.8} seed={`${seed}/fk`} /> : null}
        {T.mid.map((q, i) => (
          <path key={`m${i}`} d={q.d} fill={q.c} />
        ))}
        {T.wins
          .filter((q) => q.id.startsWith('m'))
          .map((q) => (
            <rect key={q.id} x={q.x} y={q.y} width={q.w} height={q.h} fill={(q.sw ? onOff(t, `${seed}/${q.id}`, q.per, q.duty) : q.lit) ? q.c : CC.winDark} />
          ))}
        {T.near.map((q, i) => (
          <path key={`n${i}`} d={q.d} fill={q.c} />
        ))}
        {T.wins
          .filter((q) => q.id.startsWith('n'))
          .map((q) => (
            <rect key={q.id} x={q.x} y={q.y} width={q.w} height={q.h} fill={(q.sw ? onOff(t, `${seed}/${q.id}`, q.per, q.duty) : q.lit) ? q.c : CC.winDark} />
          ))}
        {T.front.map((q, i) => (
          <path key={`fr${i}`} d={q.d} fill={q.c} />
        ))}
        {T.wins
          .filter((q) => q.id.startsWith('f'))
          .map((q) => {
            const on = q.sw ? onOff(t, `${seed}/${q.id}`, q.per, q.duty) : q.lit;
            // a neighbour at home: half the lit front windows hold a head-and-shoulders silhouette (the switching ones:
            // someone came in and put the light on)
            const who = on && (q.sw || rand(seed, `who${q.id}`) < 0.4);
            const sx = q.x + q.w * (0.3 + 0.4 * rand(seed, `wx${q.id}`));
            return (
              <g key={q.id}>
                <rect x={q.x} y={q.y} width={q.w} height={q.h} fill={on ? q.c : CC.winDark} />
                {who ? (
                  <>
                    <circle cx={sx} cy={q.y + q.h * 0.46} r={q.w * 0.19} fill={CC.neighbour} />
                    <path d={roundRect(sx - q.w * 0.3, q.y + q.h * 0.62, q.w * 0.6, q.h * 0.42, q.w * 0.16)} fill={CC.neighbour} />
                  </>
                ) : null}
                <rect x={q.x - 2 * k} y={q.y + q.h} width={q.w + 4 * k} height={3 * k} fill={CC.cornice} />
              </g>
            );
          })}
        {hosts.map((q, i) => {
          const per = 5.5 + i * 1.7;
          const p = loopT(t, per, rand(seed, `nb${i}`) * per) / 1.6;
          if (p > 1) return null;
          const fx = q.x - q.w * 0.6 + q.w * 2.2 * p;
          return (
            <g key={`nb${i}`} clipPath={`url(#${id}n${i})`}>
              <circle cx={fx} cy={q.y + q.h * 0.45} r={q.w * 0.2} fill={CC.neighbour} />
              <path d={roundRect(fx - q.w * 0.36, q.y + q.h * 0.62, q.w * 0.72, q.h * 0.6, q.w * 0.2)} fill={CC.neighbour} />
            </g>
          );
        })}
        {T.shop.map((s, i) => (
          <g key={`s${i}`}>
            <rect x={s.x} y={s.y} width={s.w} height={s.h} fill={CC.lit} />
            <rect x={s.x - 6 * k} y={s.y - 7 * k} width={s.w + 12 * k} height={7 * k} fill={CC.facadeSide} />
          </g>
        ))}
        {street ? <rect x={x - 2} y={T.pave} width={w + 4} height={h} fill={CC.roofs} /> : null}
        {cars.map((q) => {
          if (!q.on) return null;
          const c = k * 1.35;
          const front = q.cx + q.dir * 40 * c;
          const by = T.pave - 9 * c;
          return (
            <g key={`car${q.i}`}>
              {/* the headlight beam on the road ahead (a flat warm wedge) */}
              <path d={`M${front} ${by - 2 * c}L${front + q.dir * 150 * c} ${by - 7 * c}L${front + q.dir * 150 * c} ${T.pave + 6 * c}L${front} ${by + 3 * c}Z`} fill={CC.lit} />
              <path d={roundRect(q.cx - 40 * c, T.pave - 17 * c, 80 * c, 15 * c, 6 * c)} fill={CC.neighbour} />
              <path d={roundRect(q.cx - 22 * c - q.dir * 4 * c, T.pave - 30 * c, 40 * c, 15 * c, 7 * c)} fill={CC.neighbour} />
              <rect x={q.cx - 17 * c - q.dir * 4 * c} y={T.pave - 27 * c} width={30 * c} height={8 * c} fill={CC.skyline} />
              <circle cx={q.cx - 24 * c} cy={T.pave - 2 * c} r={6 * c} fill={CC.roofs} />
              <circle cx={q.cx + 24 * c} cy={T.pave - 2 * c} r={6 * c} fill={CC.roofs} />
              <rect x={front - (q.dir === 1 ? 6 : 0) * c} y={by - 4 * c} width={6 * c} height={6 * c} fill={CC.moon} />
              <rect x={q.cx - q.dir * 40 * c - (q.dir === 1 ? 0 : 5) * c} y={by - 4 * c} width={5 * c} height={5 * c} fill={CC.catEar} />
            </g>
          );
        })}
        {nb <= 1 ? <Bird x={nbx} y={nby} s={24 * k} flap={Math.floor(t * 7) % 2} color={CC.anchor} /> : null}
        {walkers.map((q) => (
          <g key={`w${q.i}`}>
            <circle cx={q.x} cy={T.pave - 34 * k} r={6 * k} fill={CC.roofs} />
            <path d={roundRect(q.x - 7 * k, T.pave - 28 * k, 14 * k, 19 * k, 4 * k)} fill={CC.roofs} />
            <path d={`M${q.x - 3 * k} ${T.pave - 11 * k}L${q.x - (q.step ? 7 : 1) * k} ${T.pave}M${q.x + 3 * k} ${T.pave - 11 * k}L${q.x + (q.step ? 7 : 1) * k} ${T.pave}`} stroke={CC.roofs} strokeWidth={4.2 * k} strokeLinecap="round" />
          </g>
        ))}
      </g>
    </Live>
  );
};
