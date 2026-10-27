// V2S4_pip.tsx (lane L3, V2S4 STORY part): Pip. The in-leap (mid-air at the cut, LEFT of her), the landing on the boat
// roof (470, 1218) at 14.95, the ride (bob + roll), watching her; 19.55 turns west ("heading", its one reaction); 20.25
// leaps toward the sun (mid-air at the sun match-cut). STUB (v0): the story build refines it.
import React from 'react';
import {PipTrack} from '../kit/pip';
import {S4_BEATS, S4_HER_HEAD, S4_PIP} from './V2S4_rig';

export const S4Pip: React.FC = () => (
  <PipTrack
    x={S4_PIP.inLeap.from[0]}
    y={S4_PIP.inLeap.from[1]}
    size={S4_PIP.size}
    facing="back"
    seed="s4pip"
    keys={[
      {t: S4_PIP.inLeap.t0, hop: {to: S4_PIP.seat, dur: S4_PIP.inLeap.dur, height: S4_PIP.inLeap.height, style: 'leap'}},
      {t: S4_BEATS.pipLand + 0.22, ride: {amp: 1.6, rate: 0.55}, target: [S4_HER_HEAD.x, S4_HER_HEAD.y]},
      {t: S4_BEATS.pipTurnWest, facing: 'left', target: null},
      {t: S4_PIP.outLeap.t0, ride: null, hop: {to: S4_PIP.outLeap.to, dur: S4_PIP.outLeap.dur, height: S4_PIP.outLeap.height, style: 'leap'}},
    ]}
  />
);
