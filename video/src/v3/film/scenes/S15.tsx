// S15 (lane L1-opening): the HOME BASE callback, 36.36-38.84 = O1's end frame, held.
// O1's set (O1_set.tsx) at O1 time 5.80 + t: the dark, named data center in the window, the lowered phone, the tag
// with the struck $999 and $1,099. Every build is finished, so only the life of the hold moves (snow, the server
// lights, the tag's sway, the mug's steam). Camera: the hold breathes in 1.5 % toward the tag's axis (ease in-out),
// which leads into S16's cut-in on the tag.
import React from 'react';
import {World} from '../../../lib/World';
import type {ToneKey} from '../../../lib/Film';
import {ease, prog, TimeShift, useTime} from '../../../lib/time';
import {mat, XG} from '../../../lib/xf';
import {EMBER} from '../kit';
import {O1Set, O1_END} from './O1_set';

const DUR = 38.84 - 36.36;

const S15: React.FC = () => {
  const t = useTime();
  const z = 1 + 0.015 * prog(t, 0, DUR, ease.inOutSine);
  return (
    <World sky={EMBER.wall}>
      <XG m={mat.about(mat.scale(z), 540, 1250)}>
        <TimeShift by={-O1_END}>
          <O1Set />
        </TimeShift>
      </XG>
    </World>
  );
};
export default S15;

/** Ink captions on the wall. */
export const captionTone: ToneKey[] = [{t: 0, tone: 'dark'}];
