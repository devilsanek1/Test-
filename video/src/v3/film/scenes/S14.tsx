// S14 (33.40-36.36, "But chip makers say next year's even tighter."): WIDE, the exact S10 frame (a reprise: same
// camera, same set, S10_set.tsx), so the change is the only difference (docs/v3/camera_plan_g3.md row S14; board
// public/v3/animatic.json "S14").
//
// On "chip" (0.16) the chip maker at the factory door speaks: he draws on from 0.00, the speech bubble pops from its
// tail at 0.10, a calendar inside it reads 2026 and flips to 2027 on "next" (flip 1.04 -> 1.22, the word at 1.20).
// From 1.04 a second, DARKER data center slides in from the left edge and cuts into the line between the van and the
// first one (lands ~1.28, settles 1.40; the board's 1.36 = 34.76); the lit sign passes to it at 1.30 (the first one
// steps back to mid: the board's subject swap), and the van is shoved back down the road (1.20-1.50, the board's
// move), half out of frame. The sticks keep lobbing into the first one.
//
// Camera: HOLD, 1.5 % breathe anchored on the first data center (as S10).
import React from 'react';
import {type ToneKey} from '../../../lib';
import {QueueSet, type QueueS14} from './S10_set';

const DUR = 2.96;
const CHANGES: QueueS14 = {
  makerAt: 0.0,
  bubbleAt: 0.1,
  flipAt: 1.04,
  cutInAt: 1.04,
  cutInEnd: 1.4,
  litSwapAt: 1.3,
  pushAt: 1.2,
  pushDur: 0.3,
};

const S14: React.FC = () => <QueueSet id="S14" dur={DUR} s14={CHANGES} />;
export default S14;

/** White captions on the dusk-blue sky (5.3:1). */
export const captionTone: ToneKey[] = [{t: 0, tone: 'light'}];
