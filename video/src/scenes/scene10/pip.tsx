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
  /** Where the leap starts (the tram roof's tail at `leap`). */
  leapFrom: [number, number];
  perk: number;
  lookPlaque: number;
  hey: number;
  heyEnd: number;
  /** Take-off toward the right edge. */
  out: number;
};

const LEAP_DUR = 0.42;
const OUT_DUR = 0.46;

export const Pip: React.FC<{T: PipTimes}> = ({T}) => {
  const t = useTime();
  const [px, py] = PIP.perch;
  if (t < T.leap) return null;
  // 1) the leap off the tram (airborne from its first frame)
  if (t < T.leap + LEAP_DUR) {
    const h = hop({t, t0: T.leap, dur: LEAP_DUR, from: {x: T.leapFrom[0], y: T.leapFrom[1]}, to: {x: px, y: py}, height: 46});
    return <Elephant x={h.x} y={h.y} scale={PIP.scale} pose="stand-side" flip amount={h.spread} squash={h.squash} rotate={h.rotate} t={t} seed={PIP.seed} />;
  }
  // 3) the hop out toward the right edge
  if (t >= T.out) {
    const h = hop({t, t0: T.out, dur: OUT_DUR, from: {x: px, y: py}, to: {x: PIP.exitTo[0], y: PIP.exitTo[1]}, height: 64});
    return <Elephant x={h.x} y={h.y} scale={PIP.scale} pose="stand-side" amount={h.spread} squash={h.squash} rotate={h.rotate} t={t} seed={PIP.seed} />;
  }
  // 2) perched: the landing squash, then pose / look keys (each switch pops), the crouch before the hop out
  const land = hop({t, t0: T.leap, dur: LEAP_DUR, from: {x: T.leapFrom[0], y: T.leapFrom[1]}, to: {x: px, y: py}, height: 46});
  const crouch = hop({t, t0: T.out, dur: OUT_DUR, from: {x: px, y: py}, to: {x: PIP.exitTo[0], y: PIP.exitTo[1]}, height: 64});
  const keys: PoseKey[] = [
    {t: T.leap + LEAP_DUR, pose: 'sit-back', look: 0.25},
    {t: T.perk, pose: 'sit-back', look: -0.45},
    {t: T.lookPlaque, pose: 'sit-back', look: -0.8},
    {t: T.hey, pose: 'trunk-up', expression: 'wide'},
    {t: T.heyEnd, pose: 'sit-back', look: 0.55},
  ];
  return <ElephantTimeline x={px} y={py} scale={PIP.scale} t={t} seed={PIP.seed} keys={keys} squash={land.squash + crouch.squash} />;
};

/** Pip riding the tram's tail (stand-in preview only; in the film S09's tram Wiper carries him). */
export const PipRiding: React.FC<{x: number; y: number}> = ({x, y}) => {
  const t = useTime();
  return <Elephant x={x} y={y} scale={PIP.scale} pose="sit-front" t={t} seed={PIP.seed} />;
};
