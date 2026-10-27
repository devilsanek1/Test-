// SQD THEIR MOUNTAIN (line 5b: "And so do AI data centers. By the mountain."), 19.40-22.68 (docs/v3/flow_v2.md §2, §4,
// §5, §6): the film's scale reveal and the thread's one declared gap. ONE pull-back on the S5 ease (155 f, 19.40-21.98)
// from the stick your laptop gave up, now lying on the summit of THEIR mountain, out over the town and our street to
// just outside our window; a hold (21.98-22.35, the birds); then J4's entry pulls on back through the glass.
//
// IN, J3 (the engine's push-through, from = to = (540, 870), x7, no bridge): at t 0 the summit stick is exactly SQC's
// stick (centre (540, 870), w 700, rot -4, the same MemoryStick + StickDetail), sky above it and its neighbours below,
// so at x7 only the bands above and below it change. The far plane starts at x27 (planeMat {o: the summit, off:
// (540, 870) - o, k: 27}); the town planes rise from the bottom, our street last, the window's sill last of all.
// OUT, J4 (a seam mid-entry at 22.68, frame 1361): every plane ends on the entry's start state (far x1.03, street x1.12,
// window x3.0 about (540, 1100)) and the entry (22.35-22.95) moves them all on FILM time, with the front plane rising
// into LEFT from 22.45; nothing new moves 22.28-23.08.
// Hierarchy (flow_v2 §5): A the stick -> the DC (its lit sign: the brightest cold light, in frame from ~21.0) -> the
// mountain (whole by ~21.35, the thoom on "mountain." 21.72); B the streams (from 21.0) and two trucks on the road; C the
// town, clouds, birds, snow. Light: the street rig (the open sky the key, upper left): the pile's tops a step lighter, a
// cold rim on the summit stick, contact shadows under all that stands; the gate's floodlight the street's one pool.
// Planes and their maps: SQD_rig.ts. Stand-ins for the shared pieces (outside, h2_window, thread_plane): SQD_standin.
import React, {useId} from 'react';
import {World} from '../../../lib';
import {useFilmTime} from '../../../lib/sequence';
import {Tier} from '../../../lib/tier';
import {EMBER, FILM_TOD, SnowLayers, PullLayer} from '../kit';
import {Lit, RIGS} from '../kit/Light';
import {ThoomPuffs} from './S9_far';
import {sqdMat, applyMat, matScale, SUMMIT_STICK, THOOM, SQD_START} from './SQD_rig';
import {J3Stick, J3StickLight} from './SQD_peak';
import {RevealClouds, RevealFar} from './SQD_far';
import {OutsideTown, OutsideStreet, H2Window, FrontPlane} from './SQD_standin';
import {RevealStreams, RoadTrucks, RevealBirds} from './SQD_life';

/** The thoom's snow puffs off the town's front roofs (town plane, H2 px). */
const PUFFS: [number, number][] = [[96, 1000], [258, 1004], [702, 998], [884, 1003]];

const SQD: React.FC = () => {
  const T = useFilmTime();
  const far = sqdMat('far', T);
  const town = sqdMat('town', T);
  const street = sqdMat('street', T);
  const win = sqdMat('window', T);
  // THE stick, in screen px (so at t 0 it is SQC's stick to the pixel)
  const sc = applyMat(far, [SUMMIT_STICK.x, SUMMIT_STICK.y]);
  const sw = SUMMIT_STICK.w * matScale(far);
  const clipId = 'sqdsnow' + useId().replace(/[^a-zA-Z0-9]/g, '');
  return (
    <World stage="context" sky={[{t: 0, tod: FILM_TOD, color: EMBER.sky}]}>
      <Lit rig={RIGS.street}>
        <Tier tier="environment" bg={EMBER.sky}>
          <PullLayer m={far}>
            <RevealClouds />
            <RevealFar streams={<RevealStreams T={T} />} />
          </PullLayer>
        </Tier>
        <J3StickLight x={sc[0]} y={sc[1]} w={sw} rot={SUMMIT_STICK.rot} />
        <J3Stick x={sc[0]} y={sc[1]} w={sw} rot={SUMMIT_STICK.rot} />
        <PullLayer m={far}>
          <RevealBirds T={T} />
        </PullLayer>
        <Tier tier="environment" bg={EMBER.sky}>
          <PullLayer m={town}>
            <OutsideTown onRoad={<RoadTrucks T={T} />} />
            <ThoomPuffs at={THOOM - SQD_START} pts={PUFFS} size={6} seed="sqd/town" />
          </PullLayer>
          {/* falling snow, far and sparse, kept under the caption band (screen y >= 625) */}
          <defs>
            <clipPath id={clipId} clipPathUnits="userSpaceOnUse">
              <rect x={-10} y={625} width={1100} height={1310} />
            </clipPath>
          </defs>
          <g clipPath={`url(#${clipId})`}>
            <SnowLayers x={-40} y={600} w={1160} h={1360} layers={['far']} density={0.45} band={null} seed="sqd/far" />
          </g>
          <PullLayer m={street}>
            <OutsideStreet />
          </PullLayer>
          <PullLayer m={win}>
            <H2Window />
          </PullLayer>
        </Tier>
        <FrontPlane T={T} />
      </Lit>
    </World>
  );
};
export default SQD;
