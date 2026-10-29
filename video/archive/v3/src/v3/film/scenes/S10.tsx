// S10 (22.68-25.24, "They pay more, so they get first dibs."): WIDE, the QUEUE seen from slightly above
// (docs/v3/camera_plan_g3.md row S10 + "Fix round 1"; board public/v3/animatic.json "S10"; the set: S10_set.tsx).
//
// ONE idea: they pay more, so they're first. The AI data center (the subject, its sign lit) stands first at the chip
// factory's lit door while memory sticks lob out of the door into its roof (the board's six, from 0.10 every 0.35 s,
// from the lead of "They"); the laptop van waits small behind it with waiting dots. Everything is on from the cut
// (on "They", 0.00); the sticks, the server lights, the dots and the snow keep the hold alive.
//
// Camera: HOLD, 1.5 % breathe anchored on the data center (shared with S14, the exact same frame).
// G5b: the street round the queue (S10_set.tsx and its planes S10_far / S10_left / S10_yard / S10_near).
import React from 'react';
import {type ToneKey} from '../../../lib';
import type {QueueBeats} from './S10_geo';
import {QueueSet} from './S10_set';

const DUR = 2.56;
/** G5b life beats (panel seconds; VO = 22.68 + t): the guard steps out on "pay" (0.24) and waves the data center in on
 *  "first dibs" (1.52) as the barrier lifts; a car crosses the hill road; the kid in the front row points up the
 *  queue; Pip jolts, worried, on "first dibs". */
const BEATS: QueueBeats = {
  guardStepAt: 0.26,
  guardWaveAt: 1.6,
  barrierLiftAt: [1.54],
  carPass: [0.72, 2.9],
  pipDroopAt: 1.66,
  kidPointAt: 0.4,
  rowLeanAt: 1.0,
};

const S10: React.FC = () => <QueueSet id="S10" dur={DUR} beats={BEATS} />;
export default S10;

/** White captions on the dusk-blue sky (5.3:1). */
export const captionTone: ToneKey[] = [{t: 0, tone: 'light'}];
