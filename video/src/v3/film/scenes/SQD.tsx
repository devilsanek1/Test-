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
// town, clouds, birds, snow. While the far field leads (to the hold's end) the two planes under it, the town and OUR
// STREET, are one tier calmer (their colours pulled 40 % toward the street's haze: a colour step, no blur), so "And so
// do AI data centers. By the mountain." keeps the eye up on the DC and the mountain (E5: at 21.40 the street held 81 %
// of the top salience, the town's navy-and-snow zigzag most of the rest); at 22.15 / 22.20 they step back up in two
// steps, as "mountain." ends: the far field hands the eye to our street before J4 (whose 22.28-23.08 window stays
// still), and SQE's street is the subject from its first frame. The mountain itself shows its detail only while it is
// big on screen (SQD_peak: the chips pale with distance), so the hold and SQE see the calm pile.
// Light: the street rig (the open sky the key, upper left): the pile's tops a step lighter, a cold rim on the summit
// stick, contact shadows under all that stands (the summit stick's on its bed, clipped to the pile); the gate's
// floodlight the street's one pool. Planes and maps: SQD_rig.ts; the mountain and THE stick: SQD_peak.tsx; the life:
// SQD_life.tsx (the hold's birds are OutsideFar's own RevealBirds: one flock, behind the mountain's flank). Shared pieces
// drawn read-only: outside.tsx (OutsideFar / OutsideTown / OutsideStreet), h2_window.tsx (H2Window, h2Cams), SQE's
// H2Scene (with the thread plane).
import React, {useId} from 'react';
import {World} from '../../../lib';
import type {ToneKey} from '../../../lib/Film';
import {useFilmTime} from '../../../lib/sequence';
import {XG} from '../../../lib/xf';
import {InkScale} from '../../../lib/inkComp';
import {EMBER, FILM_TOD} from '../kit';
import {Lit, RIGS} from '../kit/Light';
import {OutsideFar, OutsideTown, OutsideStreet, FilmClock} from './outside';
import {H2Window} from './h2_window';
import {H2Scene} from './SQE';
import {sqdCams, inkZoom, applyMat, matScale, SUMMIT_STICK, MOVE_END, LIFE_END} from './SQD_rig';
import {J3Stick, J3StickLight, J3StickRim} from './SQD_peak';
import {RevealStreams, RoadTrucks} from './SQD_life';

/** The calm step of the town and the street while the far field leads: how far their colours are pulled toward the
 *  haze (0 = as drawn). */
export const STREET_CALM = 0.4;
/** The haze: the far haze (skyLow) halfway to the ground's ambient snow (L* 71, the street's mean value), so the
 *  calmer planes keep their brightness and lose contrast (a colour step, never a fade or a blur). */
export const STREET_HAZE = '#A3ACCE';
/** Back to the planes as drawn (film seconds): the half step, then the full one, as "mountain." ends (~22.15). */
export const CALM_UNTIL: [number, number] = [22.15, 22.2];
/** The calm amount at film time T: full through the reveal, then two steps back. */
export const streetCalm = (T: number) => (T >= CALM_UNTIL[1] ? 0 : T >= CALM_UNTIL[0] ? STREET_CALM / 2 : STREET_CALM);

/** A plane's colours pulled `a` toward `to` (feComponentTransfer in sRGB: every pixel c -> c (1 - a) + to a, alpha
 *  kept): the tier step for a plane drawn by a shared piece (raw fills the pen's tiers never reach). */
const CalmPlane: React.FC<{a: number; to: string; children?: React.ReactNode}> = ({a, to, children}) => {
  const id = 'sqdcalm' + useId().replace(/[^a-zA-Z0-9]/g, '');
  if (a <= 0) return <>{children}</>;
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(to.slice(i, i + 2), 16) / 255);
  const f = (c: number) => ({type: 'linear', slope: +(1 - a).toFixed(4), intercept: +(c * a).toFixed(4)});
  return (
    <>
      <defs>
        <filter id={id} filterUnits="userSpaceOnUse" x={-420} y={540} width={1920} height={1080} colorInterpolationFilters="sRGB">
          <feComponentTransfer>
            <feFuncR {...f(r)} />
            <feFuncG {...f(g)} />
            <feFuncB {...f(b)} />
          </feComponentTransfer>
        </filter>
      </defs>
      <g filter={`url(#${id})`}>{children}</g>
    </>
  );
};

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
            <CalmPlane a={streetCalm(T)} to={STREET_HAZE}>
              <OutsideTown onRoad={<RoadTrucks T={T} />} />
            </CalmPlane>
          </InkScale>
        </XG>
        <XG m={c.street}>
          <InkScale {...inkZoom('street', c.street, T)}>
            <CalmPlane a={streetCalm(T)} to={STREET_HAZE}>
              <OutsideStreet />
            </CalmPlane>
          </InkScale>
        </XG>
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

/** Captions (E6): dark ink while THE stick fills the caption band at the cut (19.40, x7), then white on the dusk sky
 *  the moment its top edge has dropped past "And so do" (frame 1167): a short 'down' wipe that follows that edge down
 *  the band (it crosses the line between frames 1166 and 1167), instead of 0.15 + 0.4 s of dark ink on navy. */
export const captionTone: ToneKey[] = [
  {t: 0, tone: 'dark'},
  {t: 0.022, tone: 'light', wipe: 'down', dur: 0.1},
];
