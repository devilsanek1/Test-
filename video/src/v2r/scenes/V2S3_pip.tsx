// V2S3_pip.tsx (lane L3, V2S3 STORY part; WORLD px in the terrace plane, inside V2S3's camera; FILM seconds): Pip.
// conform_L3 §1: seated on her terrace's front railing at S2's screen spot (590, 1050) from the first frame, the SAME
// Pip on both sides of the B match: L2's PIP_S2 track (its size, idle seed 'pipS2', so blinks, ear sway and scarf
// flutter carry over the cut, and its last pose: 3/4 back-left, head up at the window at M) without any hop.
//   13.90-13.98  "she" (13.96): its ONE reaction: it turns to her, quick and clean (body further left, head up toward her
//                silhouette, ears perk forward). It watches her through the push-through, which sweeps it (no leap).
import React from 'react';
import {PipTrack} from '../kit/pip';
import type {PipKey, PipTrackProps} from '../kit/pip';
import {PIP_S2} from './V2S2_Pip';
import {S3_BEATS, S3_PIP} from './V2S3_rig';

/** The turn to her: body yaw (deg; 270 = profile facing left, 250 a touch away from us, toward the facade), head
 *  turned further left and lifted to her head (~300 px up-left of Pip), ears perked. */
const TURN = {t: S3_BEATS.pipTurn, dur: 0.08, yaw: 252, look: -0.55, lookUp: 0.42} as const;

export const S3_PIP_KEYS: PipKey[] = [
  // S2's keys without a hop (L2's poses up to the match: the same pose on both sides of the cut)
  ...PIP_S2.keys.filter((k) => !k.hop && k.t < S3_BEATS.match),
  // "she": the one reaction
  {t: TURN.t, pose: 'alert', facing: TURN.yaw, look: TURN.look, lookUp: TURN.lookUp, dur: TURN.dur},
];

export const S3_PIP_TRACK: PipTrackProps = {...PIP_S2, x: S3_PIP.seat[0], y: S3_PIP.seat[1], keys: S3_PIP_KEYS};

export const S3Pip: React.FC = () => <PipTrack {...S3_PIP_TRACK} />;
