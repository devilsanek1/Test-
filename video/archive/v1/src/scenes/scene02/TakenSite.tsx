// scene02/TakenSite.tsx — the shared `SiteIcon` (props/Diagram.tsx) with the S02 fix-round-1 'taken over' payoff the
// shared prop does not have yet (props-lane request in docs/scenes/S02.md: `flagAt`, `flagSize`, `takenFill`):
//   - takenAt: the window goes DARK (a flat tealDark fill wipes across it) under the ink hatching (both 0.22 s, starting
//     ON takenAt, out(cubic)), so the browser window visibly dies at phone size;
//   - flagAt (default takenAt + 0.08): a BIG ink flag pops on the roof apex (pole 40 u, pennant 28 u; the shared one is
//     30 / 20 and pops at takenAt + 0.2), a 0.1 s outBack scale from 0.3 (readable on its second frame);
//   - unlockAt / flutterAt as the shared prop.
// Same geometry, props and seeds as the shared SiteIcon, so swapping back is a one-line change once it has these props.

import React, {useId} from 'react';
import {palette} from '../../lib/theme';
import {ease as E, lerp, osc, prog, springAt, springs, useTime} from '../../lib/time';
import {Seed} from '../../lib/rng';
import {Ink} from '../../lib/Ink';
import {Fill} from '../../lib/Fill';
import {ExitFade} from '../../lib/exit';
import {circle, line, polyPath, Pt, rect} from '../../lib/sketch';
import {mat, useXf, XG} from '../../lib/xf';
import {matScale, misregScreen} from '../shared/props/common';

const FLAG_POP = E.outBack(1.7);

export type TakenSiteProps = {
  x: number;
  y: number;
  w?: number;
  h?: number;
  at?: number;
  takenAt?: number;
  flagAt?: number;
  unlockAt?: number;
  flutterAt?: number;
  /** Flag pole / pennant length in icon units (120 u = the icon box). */
  pole?: number;
  pennant?: number;
  ink?: number;
  seed?: Seed;
};

/** The icon's browser window rect (world) for a box. */
export const takenSiteWindow = (x: number, y: number, w = 120, h = 120): [number, number, number, number] => {
  const u = w / 120;
  return [x + 26 * u, y + 54 * (h / 120), 68 * u, 50 * (h / 120)];
};

export const TakenSite: React.FC<TakenSiteProps> = ({x, y, w = 120, h = 120, at, takenAt, flagAt, unlockAt, flutterAt, pole: poleL = 40, pennant = 28, ink = 3.4, seed = 'site'}) => {
  const t = useTime();
  const uid = 'ts' + useId().replace(/[^a-zA-Z0-9]/g, '');
  const m = useXf();
  const sc = Math.max(1e-3, matScale(m));
  const o = misregScreen(seed);
  const off: [number, number] = [o[0] / sc, o[1] / sc];
  if (at !== undefined && t < at) return null;
  const u = w / 120;
  const X = (v: number) => x + v * u;
  const Y = (v: number) => y + v * (h / 120);
  const house = polyPath([
    [X(60), Y(4)],
    [X(114), Y(44)],
    [X(106), Y(44)],
    [X(106), Y(118)],
    [X(14), Y(118)],
    [X(14), Y(44)],
    [X(6), Y(44)],
  ]);
  const houseInk =
    line(X(4), Y(46), X(60), Y(3), {seed: `${seed}/r1`, over: [3, 2]}) +
    line(X(60), Y(3), X(116), Y(46), {seed: `${seed}/r2`, over: [2, 3]}) +
    line(X(14), Y(44), X(14), Y(118), {seed: `${seed}/w1`, over: [0, 3]}) +
    line(X(106), Y(44), X(106), Y(118), {seed: `${seed}/w2`, over: [0, 3]}) +
    line(X(4), Y(118), X(116), Y(118), {seed: `${seed}/g`, over: [4, 4]});
  const win = takenSiteWindow(x, y, w, h);
  const winInk = rect(win[0], win[1], win[2], win[3], {seed: `${seed}/win`, over: 'small'}) + line(win[0], win[1] + 11 * u, win[0] + win[2], win[1] + 11 * u, {seed: `${seed}/bar`, over: [0, 0]});
  const dots = circle(win[0] + 6 * u, win[1] + 5.5 * u, 2.2 * u, {seed: `${seed}/d1`}) + circle(win[0] + 13 * u, win[1] + 5.5 * u, 2.2 * u, {seed: `${seed}/d2`}) + circle(win[0] + 20 * u, win[1] + 5.5 * u, 2.2 * u, {seed: `${seed}/d3`});
  const content = line(win[0] + 8 * u, win[1] + 22 * u, win[0] + 44 * u, win[1] + 22 * u, {seed: `${seed}/c1`, over: [0, 0]}) + line(win[0] + 8 * u, win[1] + 31 * u, win[0] + 36 * u, win[1] + 31 * u, {seed: `${seed}/c2`, over: [0, 0]});
  const inkAt = (dt: number) => (at === undefined ? undefined : at + dt);
  // taken over: the dark fill and the hatching sweep across the window together (out(cubic), visible from frame 1)
  const hatchP = takenAt === undefined ? 0 : prog(t, takenAt, 0.22, E.outCubic);
  let hatch = '';
  if (hatchP > 0) {
    const n = 16;
    for (let i = 0; i < n; i++) {
      const xx = win[0] - win[3] + ((win[2] + win[3]) * (i + 0.5)) / n;
      if ((i + 0.5) / n > hatchP) break;
      hatch += `M${xx.toFixed(1)} ${(win[1] + win[3]).toFixed(1)}L${(xx + win[3]).toFixed(1)} ${win[1].toFixed(1)}`;
    }
  }
  // the dark front follows the hatching's diagonal front (a parallelogram clip that sweeps left -> right)
  const front = win[0] - win[3] + (win[2] + win[3] * 2) * hatchP;
  const darkClip = `M${(win[0] - win[3] - 2).toFixed(1)} ${(win[1] + win[3]).toFixed(1)}L${front.toFixed(1)} ${(win[1] + win[3]).toFixed(1)}L${(front + win[3]).toFixed(1)} ${win[1].toFixed(1)}L${(win[0] - 2).toFixed(1)} ${win[1].toFixed(1)}Z`;
  const fAt = flagAt ?? (takenAt === undefined ? undefined : takenAt + 0.08);
  // the flag pops FAST and readable (polish: springs.pop started at ~0.19 scale and took ~2.4 frames to read): a 0.1 s
  // outBack scale from 0.3, so it is full size on the frame after its start
  const flagK = fAt === undefined || t < fAt ? 0 : lerp(0.3, 1, FLAG_POP(prog(t, fAt, 0.1)));
  const flap = flutterAt === undefined || t < flutterAt ? 0 : Math.exp(-(t - flutterAt) * 5) * osc(t - flutterAt, 4.2);
  const pole: Pt = [X(60), Y(3)];
  const pl: Pt = [win[0] + win[2] - 10 * u, win[1] + win[3] - 10 * u];
  const unl = unlockAt === undefined ? 0 : springAt(t, unlockAt, springs.snappy);
  const shackleRot = -50 * unl;
  const shackleLift = 4 * u * unl;
  const pt = pole[1] - poleL * u; // pole top
  return (
    <g>
      <Fill d={house} color={palette.cream} at={inkAt(0.12)} offset={off} seed={`${seed}/hf`} />
      <Fill rect={win} color={palette.white} at={inkAt(0.18)} offset={false} seed={`${seed}/wf`} />
      <Ink d={houseInk} at={at} dur={0.12} width={ink} seed={`${seed}/hi`} />
      <Ink d={winInk} at={inkAt(0.1)} dur={0.08} width={ink * 0.7} taper={false} seed={`${seed}/wi`} />
      <Ink d={dots + content} at={inkAt(0.18)} width={ink * 0.5} taper={false} order="all" seed={`${seed}/dt`} />
      {hatch ? (
        <ExitFade>
          <defs>
            <clipPath id={`${uid}w`}>
              <rect x={win[0]} y={win[1] + 11 * u} width={win[2]} height={win[3] - 11 * u} />
            </clipPath>
            <clipPath id={`${uid}d`}>
              <path d={darkClip} />
            </clipPath>
          </defs>
          <g clipPath={`url(#${uid}w)`}>
            <g clipPath={`url(#${uid}d)`}>
              <rect x={win[0]} y={win[1]} width={win[2]} height={win[3]} fill={palette.tealDark} />
            </g>
            <path d={hatch} stroke={palette.ink} strokeWidth={ink * 0.62} strokeLinecap="round" fill="none" />
          </g>
        </ExitFade>
      ) : null}
      {at === undefined || t >= at + 0.22 ? (
        <g>
          <XG m={mat.compose(mat.translate(0, -shackleLift), mat.about(mat.rotate(shackleRot), pl[0] + 5 * u, pl[1] - 3 * u))}>
            <Ink d={`M${pl[0] - 5 * u} ${pl[1] - 3 * u}V${pl[1] - 9 * u}A${5 * u} ${5 * u} 0 0 1 ${pl[0] + 5 * u} ${pl[1] - 9 * u}V${pl[1] - 3 * u}`} width={ink * 0.62} taper={false} vary={0} seed={`${seed}/sh`} />
          </XG>
          <Fill rect={[pl[0] - 8 * u, pl[1] - 4 * u, 16 * u, 13 * u]} color={palette.sand} offset={false} mode="none" seed={`${seed}/pb`} />
          <Ink d={rect(pl[0] - 8 * u, pl[1] - 4 * u, 16 * u, 13 * u, {seed: `${seed}/pbi`, over: 'small'})} width={ink * 0.6} taper={false} seed={`${seed}/pbi`} />
        </g>
      ) : null}
      {flagK > 0.01 ? (
        <ExitFade x={pole[0]} y={pole[1]}>
          <XG m={mat.about(mat.scale(flagK), pole[0], pole[1])}>
            <path d={`M${pole[0]} ${pole[1]}V${pt}`} stroke={palette.ink} strokeWidth={ink * 0.75} strokeLinecap="round" fill="none" />
            <XG m={mat.about(mat.scale(1 - Math.abs(flap) * 0.25, 1), pole[0], pole[1])}>
              <path d={`M${pole[0]} ${pt}L${pole[0] + pennant * u} ${pt + (pennant * 0.27 + 3 * flap) * u}L${pole[0]} ${pt + pennant * 0.55 * u}Z`} fill={palette.ink} stroke={palette.ink} strokeWidth={ink * 0.3} strokeLinejoin="round" />
            </XG>
          </XG>
        </ExitFade>
      ) : null}
    </g>
  );
};
