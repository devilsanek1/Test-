// V2S3_pip.tsx (lane L3, V2S3 STORY part; WORLD px, inside V2S3's camera): Pip continues L2's hop across the window
// match-cut (PIP_HOP_S2_S3), lands on her window box 13.10, turns to her on "she" (its one reaction), leaps up-LEFT out
// through the left edge at 14.70 (the cut on action into V2S4). STUB (v0): the story build refines it.
import React from 'react';
import {PipTrack} from '../kit/pip';
import {S3_BEATS, S3_HER, S3_PIP} from './V2S3_rig';

export const S3Pip: React.FC = () => (
  <PipTrack
    x={S3_PIP.from[0]}
    y={S3_PIP.from[1]}
    size={S3_PIP.size}
    facing="back"
    seed={S3_PIP.seed}
    keys={[
      {t: S3_PIP.inHop.t0, target: null, hop: {to: S3_PIP.inHop.to, height: S3_PIP.inHop.height, dur: S3_PIP.inHop.dur}},
      {t: S3_BEATS.pipLand + 0.05, pose: 'sit', facing: 'frontLeft', dur: 0.25},
      {t: S3_BEATS.pipTurn, facing: 'left', target: [S3_HER.x0 + 40, S3_HER.y - S3_HER.h + 20]},
      {t: S3_PIP.outLeap.t0, target: null, hop: {to: S3_PIP.outLeap.to, height: S3_PIP.outLeap.height, dur: S3_PIP.outLeap.dur, style: 'leap'}},
    ]}
  />
);
