// S10 the street-gap walker (OldQuarter's first anchor; local because of his exit): back view, standing at the end of
// the empty street; on 'sites' he walks away up the gap and off to the right, shrinking with the distance, and is gone
// behind siteR's wall by 'old' (fix round 2: the gap is clear before the maker parks, so the two back-view figures never
// merge). Drawn BEFORE the near row (siteR's facade covers his exit). No idle bob: the beats around him stay crisp.
import React from 'react';
import {useTime, prog} from '../../lib/time';
import {Citizen, OLD_QUARTER} from './kit';

/** x 708 (the set's anchor is 696): a clear 40 px from siteM's plaque edge. `to` = where he is when hidden by siteR. */
export const GAP_WALKER = {x: 708, y: 1262, h: 100, to: {x: 776, y: 1224, h: 66}};

export const GapWalker: React.FC<{walkAt: number; outAt: number}> = ({walkAt, outAt}) => {
  const t = useTime();
  if (t >= outAt + 0.1) return null;
  const w = GAP_WALKER;
  const a = OLD_QUARTER.walkers[0];
  const k = prog(t, walkAt, outAt - walkAt);
  const walking = t >= walkAt && t < outAt;
  return (
    <Citizen x={w.x + (w.to.x - w.x) * k} y={w.y + (w.to.y - w.y) * k} h={w.h + (w.to.h - w.h) * k} body={a.body} hair={a.hair} acc={a.acc} walk={walking ? {at: walkAt, hz: 1.9} : undefined} seed="s10/walker" />
  );
};
