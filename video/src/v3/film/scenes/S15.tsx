// S15 (lane L1-opening): the HOME BASE callback, 36.36-38.84 = O1's end frame, held.
// O1's set (O1_set.tsx) at O1 time 5.80 + t: the dark, named data center in the window, the lowered phone, the tag
// with the struck $999 and $1,099. Every build is finished, so only the life of the hold moves (snow, the server
// lights, the tag's sway, the mug's steam). Camera (cozy v2 §3, OVERRIDES g5b: docs/v3/cozy_v2_application.md): the
// FLOAT replaces the invisible 1.5 % breathe: translation only, 8-12 px/s legs that turn back (eased), within +-12 x /
// +-10 y of home (the window top stays >= 603); it starts at home (= O1's end frame) and passes back through home on
// the last frame, still moving, so S16's cut-in on the tag stays on axis.
import React from 'react';
import {World} from '../../../lib/World';
import type {ToneKey} from '../../../lib/Film';
import {TimeShift, useTime} from '../../../lib/time';
import {mat, XG} from '../../../lib/xf';
import {EMBER, floatCam} from '../kit';
import {O1Set, O1_END} from './O1_set';

const DUR = 38.84 - 36.36;

const S15: React.FC = () => {
  const t = useTime();
  const [dx, dy] = floatCam(t, {dur: DUR, seed: 's15/float'});
  return (
    <World sky={EMBER.wall}>
      <XG m={mat.translate(dx, dy)}>
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
