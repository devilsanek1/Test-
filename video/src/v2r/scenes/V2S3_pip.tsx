// V2S3_pip.tsx (lane L3, V2S3 STORY part; WORLD px, inside V2S3's camera; FILM seconds): Pip.
//   12.85-13.10  L2's hop continued EXACTLY across the window match-cut (PIP_HOP_S2_S3: world = screen at 12.98 because
//                the S3 camera is identity there; size 106 = S2's 100 px Pip under S2's 1.06 push; the idle seed
//                'pipS2' = S2's, so blinks, ear sway and scarf flutter carry over the cut). In the air both shots show
//                the same airborne pose, facing left (the travel), so the base facing here is 'left' (no swing on
//                landing).
//   13.10        lands on her window box (462, 878): a soft squash, the ears flop and settle
//   13.18        settles facing us (frontLeft), a watcher on the box's right end, clear of the window opening
//   13.90-13.98  "she" (13.96): its ONE reaction: it turns to her, quick and clean (body to the left, head up toward
//                her silhouette, ears perk forward). It watches her until it goes.
//   14.70        crouch (14.58) and a fast leap up-LEFT out through the left edge (the cut on action into V2S4, where
//                it comes down onto our boat's roof): the arc stays at y >= 600, the ears below the caption band.
import React from 'react';
import {PipTrack} from '../kit/pip';
import type {PipKey} from '../kit/pip';
import {S3_BEATS, S3_PIP} from './V2S3_rig';

/** The turn to her: body yaw (deg; 270 = profile facing left, 250 a touch away from us, toward the facade), head
 *  turned further left and lifted to her head (~75 px above Pip's), ears perked. */
const TURN = {t: S3_BEATS.pipTurn, dur: 0.08, yaw: 252, look: -0.55, lookUp: 0.42} as const;

export const S3_PIP_KEYS: PipKey[] = [
  // the in-hop (the same arc spec as S2's, in screen px = world px at the match)
  {t: S3_PIP.inHop.t0, target: null, hop: {to: S3_PIP.inHop.to, height: S3_PIP.inHop.height, dur: S3_PIP.inHop.dur}},
  // settles facing us
  {t: S3_BEATS.pipLand + 0.08, pose: 'sit', facing: 'frontLeft', look: 0.1, dur: 0.34},
  // "she": the one reaction
  {t: TURN.t, pose: 'alert', facing: TURN.yaw, look: TURN.look, lookUp: TURN.lookUp, dur: TURN.dur},
  // the exit leap (crouch 0.12 s before take-off)
  {t: S3_PIP.outLeap.t0, target: null, hop: {to: S3_PIP.outLeap.to, height: S3_PIP.outLeap.height, dur: S3_PIP.outLeap.dur, style: 'leap'}},
];

export const S3Pip: React.FC = () => (
  <PipTrack x={S3_PIP.from[0]} y={S3_PIP.from[1]} size={S3_PIP.size} facing="left" seed={S3_PIP.seed} keys={S3_PIP_KEYS} />
);
