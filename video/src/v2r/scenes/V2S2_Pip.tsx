// V2S2_Pip (lane L2): towpath Pip in S2 (map PIP V2S2, S2.pipSeat (590, 1050); conform_L2 §2, THROUGHLINE §3). World px,
// FILM seconds. Pip is SEATED on its railing post from S2's first frame (the push-through sweeps it in: no hop-in) and
// is still there at the 12.98 window match (S3's Pip sits on the same screen spot: no hop across the cut).
//   6.10-8.28 seated 3/4 FRONT, watching our towpath to the right (never the bench pair).
//   8.28 "But" (its ONE beat, before the board moves): a whole head-and-body swivel to the back-left, head up at the
//        wall (her window M (335, 785)), in 3 drawn steps at 12/s (8.28 anticipation dip, 8.36 through 3/4 front-left,
//        8.44 landed); then it holds that look (idle only, no ear flick) through the match.
import React from 'react';
import * as MAP from '../world/map';
import {PipTrack} from '../kit/pip';
import type {PipKey, PipTrackProps} from '../kit/pip';

const S2 = MAP.S2;
const STEP = 1 / 60;

export const PIP_S2_SIZE = 98;
/** The beat on "But" (map PIP V2S2 beats[1] = 8.30): drawings at 8.28 / 8.36 / 8.44. */
export const PIP_S2_BEAT = MAP.PIP.find((p) => p.shot === 'V2S2')!.beats[1].t - 0.02;

const KEYS: PipKey[] = [
  // seated from the first frame: 3/4 front, looking down our towpath to the right, head down
  {t: 0, facing: 'frontRight', look: 0.35, lookUp: -0.34, dur: STEP},
  // "But": anticipation dip (a hair further right and down) ...
  {t: PIP_S2_BEAT, pose: {headDrop: 2.6, hunch: 0.16, earDroopA: 40, earDroopB: 40}, facing: 50, look: 0.45, lookUp: -0.45, dur: STEP},
  // ... swings through 3/4 front-left (the face sweeping left) ...
  {t: PIP_S2_BEAT + 0.08, pose: {earSwingA: -10, earSwingB: -10}, facing: 318, look: -0.45, lookUp: 0.12, dur: STEP},
  // ... and lands 3/4 back-left, head up at her window M (ears back a little, the trunk lifting): held through the match
  {t: PIP_S2_BEAT + 0.16, pose: {earDroopA: 38, earDroopB: 34, earSwingA: -16, earSwingB: -12, trunkRaise: 20, trunkCurl: 0.95}, facing: 212, look: -0.55, lookUp: 0.42, dur: STEP},
];

/** The track (also read by the clearance QA). */
export const PIP_S2: PipTrackProps = {
  x: S2.pipSeat.x,
  y: S2.pipSeat.y,
  size: PIP_S2_SIZE,
  facing: 'frontRight',
  seed: 'pipS2',
  idle: {flick: false},
  keys: KEYS,
};

export const PipS2: React.FC = () => <PipTrack {...PIP_S2} />;
