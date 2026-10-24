// S10 Pip (scale 1.2 on the OldQuarter bollard): leaps off the tram's tail onto the bollard, perks at the half sun,
// looks up at siteM's plaque, GAG trunk-up 'hey!' when the support tag skips it, then hops toward the right edge
// (mid-air at the cut, into S11). Never a fade: pose switches pop (ElephantTimeline), entrances are the leap.

import React from 'react';
import {Elephant, ElephantTimeline, hop} from '../../lib/mascot';
import type {PoseKey} from '../../lib/mascot';
import {useTime} from '../../lib/time';

export const PIP = {scale: 1.2, seed: 10, perch: [700, 1450] as [number, number], exitTo: [1175, 1372] as [number, number]};

export type PipTimes = {
  /** Take-off from the tram's tail (first frame shown: airborne). */
  leap: number;
  /** Where the leap starts: S09's Pip on the tram roof at `leap` (off-frame right, behind the tram's tail). */
  leapFrom: [number, number];
  /** His scale on the tram roof (S09's 0.75): he grows to 1.2 over the leap (he comes toward us). */
  leapScale?: number;
  perk: number;
  lookPlaque: number;
  /** Optional: glances up at the far row's plates flipping, then back down at the web. */
  lookFar?: number;
  lookWeb?: number;
  /** Optional: turns to the cart rolling in on the left, then follows the lob over siteM. */
  lookCart?: number;
  lookLob?: number;
  hey: number;
  heyEnd: number;
  /** Take-off toward the right edge. */
  out: number;
};

const LEAP_DUR = 0.5;
const OUT_DUR = 0.46;

export const Pip: React.FC<{T: PipTimes}> = ({T}) => {
  const t = useTime();
  const [px, py] = PIP.perch;
  if (t < T.leap) return null;
  // 1) the leap off the tram (airborne from its first frame)
  if (t < T.leap + LEAP_DUR) {
    // a ballistic drop off the high roof: a small kick up, then gravity (y ~ k^2): never up into the caption band
    const h = hop({t, t0: T.leap, dur: LEAP_DUR, from: {x: T.leapFrom[0], y: T.leapFrom[1]}, to: {x: px, y: py}, height: 8});
    const k = h.k;
    const y = T.leapFrom[1] + (py - T.leapFrom[1]) * k * k - 2 * 30 * k * (1 - k);
    const sc = (T.leapScale ?? PIP.scale) + (PIP.scale - (T.leapScale ?? PIP.scale)) * k;
    return <Elephant x={h.x} y={y} scale={sc} pose="stand-side" flip amount={h.spread} squash={h.squash} rotate={h.rotate * 0.6 - 12 * k} t={t} seed={PIP.seed} />;
  }
  // 3) the hop out toward the right edge
  if (t >= T.out) {
    const h = hop({t, t0: T.out, dur: OUT_DUR, from: {x: px, y: py}, to: {x: PIP.exitTo[0], y: PIP.exitTo[1]}, height: 64});
    return <Elephant x={h.x} y={h.y} scale={PIP.scale} pose="stand-side" amount={h.spread} squash={h.squash} rotate={h.rotate} t={t} seed={PIP.seed} />;
  }
  // 2) perched: the landing squash, then pose / look keys (each switch pops), the crouch before the hop out
  const land = hop({t, t0: T.leap, dur: LEAP_DUR, from: {x: T.leapFrom[0], y: T.leapFrom[1]}, to: {x: px, y: py}, height: 8});
  const crouch = hop({t, t0: T.out, dur: OUT_DUR, from: {x: px, y: py}, to: {x: PIP.exitTo[0], y: PIP.exitTo[1]}, height: 64});
  const keys: PoseKey[] = [
    {t: T.leap + LEAP_DUR, pose: 'sit-back', look: 0.25},
    {t: T.perk, pose: 'sit-back', look: -0.45},
    {t: T.lookPlaque, pose: 'sit-back', look: -0.8},
    ...(T.lookFar !== undefined ? [{t: T.lookFar, pose: 'sit-back' as const, look: -0.15}] : []),
    ...(T.lookWeb !== undefined ? [{t: T.lookWeb, pose: 'sit-back' as const, look: -0.9}] : []),
    ...(T.lookCart !== undefined ? [{t: T.lookCart, pose: 'sit-back' as const, look: -1}] : []),
    ...(T.lookLob !== undefined ? [{t: T.lookLob, pose: 'sit-back' as const, look: 0.1}] : []),
    {t: T.hey, pose: 'trunk-up', expression: 'wide'},
    {t: T.heyEnd, pose: 'sit-back', look: 0.55},
  ];
  return <ElephantTimeline x={px} y={py} scale={PIP.scale} t={t} seed={PIP.seed} keys={keys} squash={land.squash + crouch.squash} />;
};
