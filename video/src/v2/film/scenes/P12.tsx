// P12 (lane L1-desk): HOME BASE callback, 33.08-35.32 = O1's END frame, matched (O1_set.tsx, mode "p12"): the same
// camera (1.00), set and living details: the highlighted clause, 2030, the run-on over the front edge and on the floor,
// the box gone; her cat now looks down at the run-on on the floor. On "can't" (33.72, the short unroll) the paper
// slides on another 200 px over the edge. HOLD (the camera holds; the world keeps living). Credit: her account (Film2).
import React from 'react';
import {World} from '../../../lib/World';
import type {ToneKey} from '../../../lib/Film';
import {CC} from '../kit';
import {O1Set} from './O1_set';

const P12: React.FC = () => (
  <World sky={CC.wall}>
    <O1Set mode="p12" />
  </World>
);
export default P12;

/** Ink captions on the cream wall. */
export const captionTone: ToneKey[] = [{t: 0, tone: 'dark'}];
