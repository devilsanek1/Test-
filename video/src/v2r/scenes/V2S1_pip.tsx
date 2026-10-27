// V2S1 helper (lane L1): PIP on the waterline bollard (TREATMENT section 3 "Pip per shot", map PIP V2S1 / S1_BOLLARD).
// In colour from frame 0; head follows her from 1.25; EARS-COVER on "life" 4.98 (its one reaction); sits 5.55; hops
// up-left into the dive 5.90 (arc at y >= 600). Nothing at t < 0: on the loop seam S8's Pip hops onto this bollard
// (lane L6), so drawing ours too would show two.
// STUB: the kit's PipTrack (the export below is final; the builder replaces the body and adds the bollard).
import React from 'react';
import {useTime} from '../../lib/time';
import * as MAP from '../world/map';
import {PipTrack} from '../kit/pip';
import {C, s1HerHead} from './V2S1_clock';

/** Pip and its bollard. The `pip` slot (drawn after the steps). */
export const S1Pip: React.FC = () => {
  const t = useTime();
  if (t < 0) return null;
  return (
    <PipTrack
      x={MAP.S1_BOLLARD.x}
      y={MAP.S1_BOLLARD.y}
      size={100}
      facing="back"
      seed="pipS1"
      keys={[
        {t: C.pipHeadFollows, target: s1HerHead},
        {t: C.life, pose: 'earsCover', dur: 0.1},
        {t: 5.55, pose: 'sit', dur: 0.25},
        {t: C.pipHopsUpLeft, target: null, hop: {to: [560, 1010], height: 120, dur: 0.5}},
      ]}
    />
  );
};
