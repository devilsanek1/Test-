// S11 local wrappers around shared props (no stand-ins left: LabelTag, the lettered BackSoonTag and StickyNote all come
// from '../shared/props' now).
//   NoteBreeze: the J6 sticky note flutters on its adhesive top edge in a breeze (a damped swing about its top) and
//   jolts under the pen as the strike starts. Applied OUTSIDE the shared StickyNote so the prop stays untouched.
// No opacity anywhere: rotations and a 3.5 % squash.

import React from 'react';
import {prog, useTime} from '../../lib/time';
import {mat, XG} from '../../lib/xf';

export const NoteBreeze: React.FC<{
  /** The note's rest centre and height (world): the swing pivots on the middle of its top edge. */
  x: number;
  y: number;
  h: number;
  /** Breeze flutters (0.7 s each, +-5 deg decaying, 1.5 swings). */
  flutterAt?: number[];
  /** The pen press: a 3.5 % squash over 0.12 s. */
  joltAt?: number;
  children?: React.ReactNode;
}> = ({x, y, h, flutterAt = [], joltAt, children}) => {
  const t = useTime();
  let fa = 0;
  for (const fl of flutterAt) if (t >= fl && t < fl + 0.7) fa += 5 * Math.sin(prog(t, fl, 0.7) * Math.PI * 3) * (1 - prog(t, fl, 0.7));
  let jolt = 1;
  if (joltAt !== undefined && t >= joltAt && t < joltAt + 0.12) jolt = 1 - 0.035 * Math.sin(prog(t, joltAt, 0.12) * Math.PI);
  if (fa === 0 && jolt === 1) return <>{children}</>;
  return <XG m={mat.compose(mat.about(mat.scale(jolt), x, y), mat.about(mat.rotate(fa), x, y - h / 2))}>{children}</XG>;
};
