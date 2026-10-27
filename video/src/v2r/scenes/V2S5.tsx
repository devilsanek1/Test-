// V2S5 "The far side" (lane L4): the ONE big move and the only scale moment. Film 20.55-24.00 s (scene t = film -
// 20.55); TREATMENT.md sections 5-6 (row S5), map.ts S5, the Arlington kit (kit/dc) on the crane rig.
//   0.00       the sun match-cut: SUN1 (250, 650) r 65 in the bright slot under the blossoming canopy; Pip comes down
//              out of the sun onto the bench beside the stranger reading an open newspaper; the US news box beside them.
//   0.21       "April": the disc flips into a calendar page APRIL 2026 (back by 0.65); the slot's trees burst into
//              blossom in 4 frames; Pip looks up at it.
//   0.75-2.85  ONE ease: dolly back + crane up + ~75 deg arc round the two backs (the far slides right, the slope sinks,
//              the valley rises); a big tree where the Pentagon will land; the lamppost wipes the backs at the peak
//              (the tiny drawings swap behind it); a light burst; 1.88 "Pentagon": it clears the tree, the plaque
//              pops; the obelisk rises; 2.53 windows warm on along one wing.
//   2.85-3.45  the hold: a V of birds; 3.35 Pip leaps up-right (the cut on action into S6).
// Helpers: V2S5_rig (planes), V2S5_set (the layered set), V2S5_far, V2S5_figs, V2S5_text.
import React from 'react';
import {World} from '../../lib/World';
import {CM} from '../palette';
import {S5Set} from './V2S5_set';
import type {ToneKey} from '../../lib/Film';

export const captionTone: ToneKey[] = [{t: 0, tone: 'dark'}];

const V2S5: React.FC = () => (
  <World sky={CM.sky} stage="context">
    <S5Set />
  </World>
);
export default V2S5;
