// S10 the street-gap walker (OldQuarter's first anchor, moved up the gap so he never stands on Pip's head): back view,
// standing still at the end of the empty street; on 'sites' he walks away up the gap toward the vanishing point
// (perspective shrink as in sets/life.tsx walkerAt), then stops (no idle bob: the beats around him stay crisp).
import React from 'react';
import {useTime} from '../../lib/time';
import type {Pt} from '../../lib/sketch';
import {Citizen, OLD_QUARTER} from './kit';

/** x 708 (the set's anchor is 696): a clear 40 px from siteM's plaque edge, so its beats never touch his walk. */
export const GAP_WALKER = {x: 708, y: 1262, h: 100, pace: 0.3};

export const GapWalker: React.FC<{walkAt: number; stopAt: number; vp?: Pt}> = ({walkAt, stopAt, vp = OLD_QUARTER.vp as unknown as Pt}) => {
  const t = useTime();
  const w = GAP_WALKER;
  const a = OLD_QUARTER.walkers[0];
  const tt = Math.min(Math.max(t, walkAt), stopAt);
  const k = 1 / (1 + w.pace * (tt - walkAt));
  const walking = t >= walkAt && t < stopAt;
  return (
    <Citizen x={vp[0] + (w.x - vp[0]) * k} y={vp[1] + (w.y - vp[1]) * k} h={w.h * k} body={a.body} hair={a.hair} acc={a.acc} walk={walking ? {at: walkAt, hz: 1.9} : undefined} seed="s10/walker" />
  );
};
