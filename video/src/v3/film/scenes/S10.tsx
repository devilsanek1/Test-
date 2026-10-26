// S10 (22.68-25.24, "They pay more, so they get first dibs."): WIDE, the QUEUE seen from slightly above
// (docs/v3/camera_plan_g3.md row S10 + "Fix round 1"; board public/v3/animatic.json "S10"; the set: S10_set.tsx).
//
// ONE idea: they pay more, so they're first. The AI data center (the subject, its sign lit) stands first at the chip
// factory's lit door while memory sticks lob out of the door into its roof (the board's six, from 0.10 every 0.35 s,
// from the lead of "They"); the laptop van waits small behind it with waiting dots. Everything is on from the cut
// (on "They", 0.00); the sticks, the server lights, the dots and the snow keep the hold alive.
//
// Camera: HOLD, 1.5 % breathe anchored on the data center (shared with S14, the exact same frame).
import React from 'react';
import {type ToneKey} from '../../../lib';
import {QueueSet} from './S10_set';

const DUR = 2.56;

const S10: React.FC = () => <QueueSet id="S10" dur={DUR} />;
export default S10;

/** White captions on the dusk-blue sky (5.3:1). */
export const captionTone: ToneKey[] = [{t: 0, tone: 'light'}];
