// V2S5_mid.tsx (lane L4): the S5 MID plane (lens.ts MID camera, END coords; the kit's valley and Pentagon FORKED onto
// S5's air: V2S5_valley, V2S5_pentagon): the lawns, ring road, boulevard, groves, joggers and THE PENTAGON (box x 322-1080, y 846-1104), and its PullPlane MID_PLANE (the rig reads it: it rises into
// view as the camera dollies back). Tiers (conform_L4 §5): the valley is C (environment, the kit's default); the
// Pentagon is promoted to A ON "Pentagon" (scene 1.88 = 22.43: its one closed outline returns in its own shade, never
// near-black) and its lit wing's windows warm in ONE flat step at 23.08 (one change, not a run).
// Import rule: never import V2S5_rig / V2S5_set / V2S5_figs (the rig imports this file).
import React from 'react';
import {useTime} from '../../lib/time';
import {MidGround5} from './V2S5_valley';
import {Pentagon5} from './V2S5_pentagon';
import {CRANE_T, MID_PL, type PullPlane} from '../kit/dc/crane';

export const MID_PLANE: PullPlane = MID_PL;

/** "Pentagon" (heard 22.44): the promotion pops on its word, a frame ahead (scene s). */
export const PENTAGON_A_AT = 22.43 - 20.55;

export const S5Mid: React.FC = () => {
  const t = useTime();
  return (
    <>
      <MidGround5 />
      <Pentagon5 warmAt={CRANE_T.warm} warmDur={0.001} tier={t >= PENTAGON_A_AT ? 'subject' : 'environment'} />
    </>
  );
};
