// O1 (lane L1-desk): the HOOK, 0-6.12. HOME BASE desk, COZY, INSERT high 3/4, PULL OUT 1.05 -> 1.00 (ease-in).
// She quit: her sleeve drops her GOOGLE badge in a box and carries the box out; a highlighter marks the clause, in words
// ("no criticizing / Google"); then her contract runs past its own end and pours off the desk, a year every few rows,
// faster and faster. Her cat watches every beat. The set and every beat live in O1_set.tsx (shared with P12);
// t < 0 = the bare-line state the loop reveals under P13's un-build (frame 0's drawing, drawing on).
import React from 'react';
import {World} from '../../../lib/World';
import type {ToneKey} from '../../../lib/Film';
import {CC} from '../kit';
import {O1Set} from './O1_set';

const O1: React.FC = () => (
  <World sky={CC.wall}>
    <O1Set />
  </World>
);
export default O1;

/** Ink captions on the cream wall (the caption band is wall all shot long). */
export const captionTone: ToneKey[] = [{t: 0, tone: 'dark'}];
