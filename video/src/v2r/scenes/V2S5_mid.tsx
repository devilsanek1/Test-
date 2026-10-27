// V2S5_mid.tsx (lane L4): the S5 MID plane (lens.ts MID camera, END coords): the lawns, ring road, boulevard, groves,
// joggers and THE PENTAGON (box x 322-1080, y 846-1104). Drawn inside the kit's MID_PL PullLayer.
import React from 'react';
import {MidGround} from '../kit/dc/valley';
import {Pentagon} from '../kit/dc/pentagon';
import {CRANE_T} from '../kit/dc/crane';

export const S5Mid: React.FC = () => (
  <>
    <MidGround />
    <Pentagon warmAt={CRANE_T.warm} />
  </>
);
