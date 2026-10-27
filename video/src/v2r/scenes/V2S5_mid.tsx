// V2S5_mid.tsx (lane L4): the S5 MID plane (lens.ts MID camera, END coords): the lawns, ring road, boulevard, groves,
// joggers and THE PENTAGON (box x 322-1080, y 846-1104), and its PullPlane MID_PLANE (the rig reads it: it rises into
// view as the camera dollies back).
// Import rule: never import V2S5_rig / V2S5_set / V2S5_figs (the rig imports this file).
import React from 'react';
import {MidGround} from '../kit/dc/valley';
import {Pentagon} from '../kit/dc/pentagon';
import {CRANE_T, MID_PL, type PullPlane} from '../kit/dc/crane';

export const MID_PLANE: PullPlane = MID_PL;

export const S5Mid: React.FC = () => (
  <>
    <MidGround />
    <Pentagon warmAt={CRANE_T.warm} />
  </>
);
