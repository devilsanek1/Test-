// SQD THEIR MOUNTAIN (line 5b: "And so do AI data centers. By the mountain."), 19.40-22.68 (docs/v3/flow_v2.md §2, §4,
// §5, §6): the film's scale reveal and the thread's one declared gap. ONE pull-back on the S5 ease (155 f, 19.40-21.98)
// from the stick your laptop gave up, now lying on the summit of THEIR mountain, out over the town and our street to
// just outside our window; a hold (21.98-22.35, the birds); then J4's entry pulls on back through our glass.
//
// IN, J3 (the engine's push-through, from = to = (540, 870), x7, no bridge): at t 0 the summit stick is exactly SQC's
// stick (centre (540, 870), w 700, rot -4: SQD_peak's J3Stick), sky above it and its neighbours below, so at x7 only
// the bands above and below it change. The far plane starts at x27 (planeMat {o: the summit stick, off: (540, 870) -
// o, k: 27}); the town rises from the bottom, then our street, then our sill and desk.
// OUT, J4 (a seam mid-entry at 22.68, frame 1361): the pull lands on h2_window's entry start state and from 21.98 SQD
// draws the H2 view through h2Cams on FILM time exactly as SQE does (outside's three planes, h2_window's window and
// desk, the front plane rising into LEFT from 22.45); its own life is done by 22.20 (nothing new moves 22.28-23.08).
// Hierarchy (flow_v2 §5): A the stick -> the DC (its lit sign: the brightest cold light; in frame from ~21.0) -> the
// mountain (whole by ~21.35, the thoom on "mountain." 21.72); B the streams (from 21.0) and two trucks on the road; C the
// town, clouds, birds, snow. Light: the street rig (the open sky the key, upper left): the pile's tops a step lighter, a
// cold rim on the summit stick, contact shadows under all that stands; the gate's floodlight the street's one pool.
// Planes and maps: SQD_rig.ts; the mountain and THE stick: SQD_peak.tsx; the life: SQD_life.tsx. Shared pieces drawn
// read-only: outside.tsx (OutsideFar / OutsideTown / OutsideStreet), h2_window.tsx (H2Window, h2Cams), the front plane
// (SQE_front's stand-in until thread_plane.tsx lands).
import React from 'react';
import {World} from '../../../lib';
import {useFilmTime} from '../../../lib/sequence';
import {XG} from '../../../lib/xf';
import {InkScale} from '../../../lib/inkComp';
import {EMBER, FILM_TOD} from '../kit';
import {Lit, RIGS} from '../kit/Light';
import {OutsideFar, OutsideTown, OutsideStreet} from './outside';
import {H2Window} from './h2_window';
import {FrontStandIn} from './SQE_front';
import {sqdCams, inkZoom, applyMat, matScale, SUMMIT_STICK, MOVE_END} from './SQD_rig';
import {J3Stick, J3StickLight} from './SQD_peak';
import {RevealStreams, RoadTrucks, RevealBirds} from './SQD_life';

const SQD: React.FC = () => {
  const T = useFilmTime();
  const c = sqdCams(T);
  const moving = T < MOVE_END;
  // THE stick, in screen px while the far plane is big (so at t 0 it is SQC's stick to the pixel); from 21.98 outside
  // draws the same stick at H2 size (its summit stick)
  const sc = applyMat(c.far, [SUMMIT_STICK.x, SUMMIT_STICK.y]);
  const sw = SUMMIT_STICK.w * matScale(c.far);
  return (
    <World sky={[{t: 0, tod: FILM_TOD, color: EMBER.sky}]}>
      <XG m={c.far}>
        <InkScale {...inkZoom('far', c.far, T)}>
          <OutsideFar summit={!moving} streams={<RevealStreams T={T} />} />
          <RevealBirds T={T} />
        </InkScale>
      </XG>
      {moving ? (
        <Lit rig={RIGS.street}>
          <J3StickLight x={sc[0]} y={sc[1]} w={sw} rot={SUMMIT_STICK.rot} />
          <J3Stick x={sc[0]} y={sc[1]} w={sw} rot={SUMMIT_STICK.rot} />
        </Lit>
      ) : null}
      <XG m={c.town}>
        <InkScale {...inkZoom('town', c.town, T)}>
          <OutsideTown onRoad={<RoadTrucks T={T} />} />
        </InkScale>
      </XG>
      <XG m={c.street}>
        <InkScale {...inkZoom('street', c.street, T)}>
          <OutsideStreet />
        </InkScale>
      </XG>
      <XG m={c.win}>
        <InkScale {...inkZoom('win', c.win, T)}>
          <H2Window />
        </InkScale>
      </XG>
      {T >= 22.4 ? <FrontStandIn T={T} /> : null}
    </World>
  );
};
export default SQD;
