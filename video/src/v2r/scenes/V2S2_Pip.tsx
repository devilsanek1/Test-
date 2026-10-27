// V2S2_Pip (lane L2): towpath Pip in S2 (map PIP V2S2, S2.pipSeat (590, 1050), PIP_HOP_S2_S3). World px, FILM seconds.
//   6.20 hops in from off-frame bottom-left on a low rising arc that stays under the ground-row story windows (its
//        head never above y 1010 while it is left of x ~555), lands on the railing post 6.71 (after the camera lands
//        at 6.70, before the ring 6.82) with the kit's squash, already turning 3/4 FRONT: it watches our towpath (the
//        dog), never the bench pair.
//   8.28 "But" (its ONE beat, before the board moves): a whole head-and-body swivel to the back-left, head up at W2
//        (335, 785), in 3 drawn steps at 12/s (8.28 anticipation dip, 8.36 through 3/4 front-left, 8.44 landed); then
//        it holds that look (idle only, no ear flick) to the hop.
//   12.85 hops toward W2 on PIP_HOP_S2_S3 (unchanged: the world-space inverse of S3.pipSeat under the 1.06 push,
//        height 50 / 1.06, dur 0.25), mid-air at the 12.98 match.
import React from 'react';
import * as MAP from '../world/map';
import {PipTrack} from '../kit/pip';
import type {PipKey, PipTrackProps} from '../kit/pip';

const S2 = MAP.S2;
const STEP = 1 / 60;

/** Pip's world-space landing for the S2 -> S3 hop: the inverse of S3.pipSeat under the 1.06 push (no float then). */
export const HOP_TO: [number, number] = (() => {
  const a = S2.camera.push.anchor;
  const z = S2.camera.push.to;
  return [a.x + (MAP.S3.pipSeat.x - a.x) / z, a.y + (MAP.S3.pipSeat.y - a.y) / z];
})();

/** Off-frame bottom-left (world px; the 6.20 camera maps it to ~(260, 2110)): the hop-in's take-off. */
export const PIP_S2_FROM: [number, number] = [255, 2030];
export const PIP_S2_SIZE = 98;
/** The beat on "But" (map PIP V2S2 beats[1] = 8.30): drawings at 8.28 / 8.36 / 8.44. */
export const PIP_S2_BEAT = MAP.PIP.find((p) => p.shot === 'V2S2')!.beats[1].t - 0.02;

const KEYS: PipKey[] = [
  // the hop in: low and rising (apex at the seat end), landing 6.71; facing 3/4 front as it lands, looking down our
  // towpath to the right (the dog), head down
  {t: 6.2, hop: {to: [S2.pipSeat.x, S2.pipSeat.y], height: 70, dur: 0.51, style: 'tuck', crouch: 0.02}, facing: 'frontRight', look: 0.35, lookUp: -0.34, dur: 0.3},
  // "But": anticipation dip (a hair further right and down) ...
  {t: PIP_S2_BEAT, pose: {headDrop: 2.6, hunch: 0.16, earDroopA: 40, earDroopB: 40}, facing: 50, look: 0.45, lookUp: -0.45, dur: STEP},
  // ... swings through 3/4 front-left (the face sweeping left) ...
  {t: PIP_S2_BEAT + 0.08, pose: {earSwingA: -10, earSwingB: -10}, facing: 318, look: -0.45, lookUp: 0.12, dur: STEP},
  // ... and lands 3/4 back-left, head up at W2 (ears back a little, the trunk lifting): held to the hop
  {t: PIP_S2_BEAT + 0.16, pose: {earDroopA: 38, earDroopB: 34, earSwingA: -16, earSwingB: -12, trunkRaise: 20, trunkCurl: 0.95}, facing: 212, look: -0.55, lookUp: 0.42, dur: STEP},
  // the match-cut hop (PIP_HOP_S2_S3, unchanged)
  {t: MAP.PIP_HOP_S2_S3.t0, target: null, hop: {to: HOP_TO, height: MAP.PIP_HOP_S2_S3.apexPx / S2.camera.push.to, dur: MAP.PIP_HOP_S2_S3.t1 - MAP.PIP_HOP_S2_S3.t0}},
];

/** The track (also read by the clearance QA). */
export const PIP_S2: PipTrackProps = {
  x: PIP_S2_FROM[0],
  y: PIP_S2_FROM[1],
  size: PIP_S2_SIZE,
  facing: 'frontRight',
  seed: 'pipS2',
  idle: {flick: false},
  keys: KEYS,
};

export const PipS2: React.FC = () => <PipTrack {...PIP_S2} />;
