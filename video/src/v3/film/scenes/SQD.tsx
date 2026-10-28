// SQD THEIR MOUNTAIN (line 5b: "And so do AI data centers. By the mountain."), 19.40-22.68 (docs/v3/flow_v2.md §2, §4,
// §5, §6): the film's scale reveal and the thread's one declared gap. ONE pull-back on the S5 ease (155 f, 19.40-21.98)
// from the stick your laptop gave up, now lying on the summit of THEIR mountain, out over the town and our street to
// just outside our window; a hold (21.98-22.35, the birds); then J4's entry pulls on back through our glass.
//
// IN, J3 (the engine's push-through, from = to = (540, 870), x7, no bridge): at t 0 the summit stick is exactly SQC's
// stick (centre (540, 870), w 700, rot -4: SQD_peak's J3Stick), sky above it and its bed of sticks below, so at x7 only
// the bands above and below it change. The far plane starts at x27 (planeMat {o: the summit stick, off: (540, 870) -
// o, k: 27}); the town rises from the bottom, then our street, then our sill and desk.
// OUT, J4 (a seam mid-entry at 22.68, frame 1361): the pull lands on h2_window's entry start state and from 21.98 SQD
// draws the H2 view through h2Cams on FILM time; from 22.25 (its own life done: nothing new moves 22.28-23.08) it draws
// SQE's own H2Scene (outside's three planes, h2_window's window and desk, the thread plane rising into LEFT from 22.45).
// Hierarchy (flow_v2 §5): A the stick -> the DC (its lit sign: the brightest cold light; in frame from ~21.0) -> the
// mountain (whole by ~21.35, the thoom on "mountain." 21.72); B the streams (from 21.0) and two trucks on the road; C the
// town, clouds, birds, snow, and OUR STREET: while the far field leads, the street's loud pieces (the gate's pool and lit
// opening, the DC trucks, the notice) are calm until the load beat (outside.tsx, film time, both builders: E5; at 21.40
// the street held 81 % of the top salience), the town and the DC off its beat sit back (E3), so "By the mountain." keeps
// the eye up on the mountain; the mountain itself shows its detail only while it is big on screen (SQD_peak: the chips
// pale with distance), so the hold and SQE see the calm pile.
// Light: the street rig (the open sky the key, upper left): the pile's tops a step lighter, a cold rim on the summit
// stick, contact shadows under all that stands (the summit stick's on its bed, clipped to the pile); the gate's
// floodlight the street's one pool. Planes and maps: SQD_rig.ts; the mountain and THE stick: SQD_peak.tsx; the life:
// SQD_life.tsx (the hold's birds are OutsideFar's own RevealBirds: one flock, behind the mountain's flank). Shared pieces
// drawn read-only: outside.tsx (OutsideFar / OutsideTown / OutsideStreet), h2_window.tsx (H2Window, h2Cams), SQE's
// H2Scene (with the thread plane).
import React from 'react';
import {World} from '../../../lib';
import type {ToneKey} from '../../../lib/Film';
import {useFilmTime} from '../../../lib/sequence';
import {XG} from '../../../lib/xf';
import {InkScale} from '../../../lib/inkComp';
import {EMBER, FILM_TOD} from '../kit';
import {Lit, RIGS} from '../kit/Light';
import {OutsideFar, OutsideTown, OutsideStreet, FilmClock, PlaneCamsProvider} from './outside';
import {H2Window} from './h2_window';
import {H2Scene} from './SQE';
import {sqdCams, inkZoom, applyMat, matScale, SUMMIT_STICK, MOVE_END, LIFE_END} from './SQD_rig';
import {J3Stick, J3StickLight, J3StickRim} from './SQD_peak';
import {RevealStreams, RoadTrucks} from './SQD_life';

const SQD: React.FC = () => {
  const T = useFilmTime();
  const c = sqdCams(T);
  const moving = T < MOVE_END;
  // THE stick, in screen px while the far plane is big (so at t 0 it is SQC's stick to the pixel); from 21.98 outside
  // draws the same stick at H2 size (its summit stick)
  const sc = applyMat(c.far, [SUMMIT_STICK.x, SUMMIT_STICK.y]);
  const sw = SUMMIT_STICK.w * matScale(c.far);
  // From LIFE_END (22.25: SQD's own streams and trucks are in) SQD draws SQE's own H2 picture (h2_window's planes
  // through h2Cams, the thread plane rising into LEFT), so J4's seam is one drawing by construction
  if (T >= LIFE_END) {
    return (
      <World sky={[{t: 0, tod: FILM_TOD, color: EMBER.sky}]}>
        <H2Scene />
      </World>
    );
  }
  return (
    <World sky={[{t: 0, tod: FILM_TOD, color: EMBER.sky}]}>
      <FilmClock>
        {/* the planes' cameras for outside's own screen-space pieces (the street's snow kept under the caption band in
            SCREEN px, the road's trucks), as H2View hands them: the pull, the hold and SQE's frames agree */}
        <PlaneCamsProvider value={{far: c.far, town: c.town, street: c.street}}>
          <XG m={c.far}>
            <InkScale {...inkZoom('far', c.far, T)}>
              <OutsideFar summit={!moving} streams={<RevealStreams T={T} />} />
            </InkScale>
          </XG>
          {moving ? (
            <Lit rig={RIGS.street}>
              <J3StickLight x={sc[0]} y={sc[1]} w={sw} rot={SUMMIT_STICK.rot} m={c.far} />
              <J3Stick x={sc[0]} y={sc[1]} w={sw} rot={SUMMIT_STICK.rot} />
              <J3StickRim x={sc[0]} y={sc[1]} w={sw} rot={SUMMIT_STICK.rot} />
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
        </PlaneCamsProvider>
        <XG m={c.win}>
          <InkScale {...inkZoom('win', c.win, T)}>
            <H2Window />
          </InkScale>
        </XG>
      </FilmClock>
    </World>
  );
};
export default SQD;

/** Captions (E6): dark ink while THE stick fills the caption band at the cut (19.40, x7), then white on the dusk sky as
 *  its top edge drops past "And so do" (ink rows y 317-386): a 'down' wipe whose edge rides that edge through the line
 *  (the stick's top edge at x 540: 302 at frame 1165, 385 at 1166, 452 at 1167; the wipe's 384 at 1166), instead of
 *  0.15 + 0.4 s of dark ink on navy (19.43-19.62). */
export const captionTone: ToneKey[] = [
  {t: 0, tone: 'dark'},
  {t: 0.016, tone: 'light', wipe: 'down', dur: 0.08},
];
