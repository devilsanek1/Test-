// V2S5_nearmid.tsx (lane L4): the S5 NEAR-MID plane in START coords: the slope's blossoming crowns just beyond the
// balustrade (the slot's bottom edge, the left mass, the big tree that stands where the Pentagon will land; they burst
// into blossom in 4 frames on "April" and sink below the balustrade as the crane rises: the drop), and its PullPlane
// NEARMID_PLANE (the rig reads it; drawn through startMat).
// Import rule: never import V2S5_rig / V2S5_set / V2S5_figs (the rig imports this file).
import React from 'react';
import {NearMid5} from './V2S5_valley';
import {CRANE_T, NEAR_MID_PL, type PullPlane} from '../kit/dc/crane';

export const NEARMID_PLANE: PullPlane = NEAR_MID_PL;

export const S5NearMid: React.FC = () => <NearMid5 burstAt={CRANE_T.april} />;
