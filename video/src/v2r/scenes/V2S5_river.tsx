// V2S5_river.tsx (lane L4): the S5 RIVER plane (the far shore's cherries, the Potomac, the bridges, the near bank, the
// parkway) in END coords, and its PullPlane (RIVER_PL: the rig's slide, re-slotted under the shot's horizon).
import React from 'react';
import {RiverPlane} from '../kit/dc/vista';
import {RIVER, type PullPlane} from '../kit/dc/crane';
import {FAR_END} from './V2S5_far';

export const RIVER_PL: PullPlane = {...RIVER, o: [RIVER.o[0], RIVER.o[1] + FAR_END.dy]};
export const S5River: React.FC = () => <RiverPlane />;
