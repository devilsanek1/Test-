// SQE FIRST DIBS (lines 6-8: "They pay more, so they get first dibs. Which means what's left costs about five times
// last year's price. And laptop makers pass that on. Normally you'd wait for the better one. But chip makers say next
// year's even tighter."), 22.68-36.36 (docs/v3/flow_v2.md §2, §4, §5): H2, standing at our glass: our street with the
// chip factory's lit gate, the data center and the mountain behind. ONE place, one camera (h2_window's h2Cams on film
// time: J4's entry, then one push x1.25 toward the gate's pool 24.90-25.70, released 28.93-29.60); the story is the
// queue (outside.tsx holds the whole street timeline): their trucks first; our van's ONE crate; the 5x notice; the
// crate hops over the sill into the listing laptop and the tag ticks to $1,099 on "pass" (30.28); the BETTER van stuck
// at the back; the notice flips to 2027 and two of their trucks overtake it.
// Hierarchy (flow_v2 §5): A in turn = truck A, our van + its crate, the 5x face, the hop + the tag, the BETTER van, the
// 2027 face + the trucks (each the only full outline in its beat, outside.tsx); B = the waiting vans, the workers, the
// guard, Pip, the tag; C = the street, the lamps, the walker and dog, the steam, the town, the data center. Light: the
// street rig outside (the open sky the key; the gate's floodlight THE light: its pool; our van unlit until 25.72), the
// nook rig on the desk and the front plane (J4's declared light change: into the warm room).
// Joins (docs/G5_BLOCKING.md §2b): IN J4, a seam mid-entry at 22.68 (frame 1361): H2View + the front plane on film
// time, identical to SQD's last frame; OUT J5, a seam on a held frame at 36.36 (frame 2182): SQF draws the same.
import React from 'react';
import {World} from '../../../lib/World';
import type {ToneKey} from '../../../lib/Film';
import {useFilmTime} from '../../../lib/sequence';
import {EMBER, FILM_TOD} from '../kit';
import {H2View} from './h2_window';
import {FrontStandIn} from './SQE_front';

/** The H2 picture at film time (shared by SQE and SQF: the J5 seam is the same drawing). */
export const H2Scene: React.FC = () => {
  const T = useFilmTime();
  return (
    <>
      <H2View />
      <FrontStandIn T={T} />
    </>
  );
};

const SQE: React.FC = () => (
  <World stage="context" sky={[{t: 0, tod: FILM_TOD, color: EMBER.sky}]}>
    <H2Scene />
  </World>
);
export default SQE;

/** White captions on the dusk sky (the caption band is plain sky all sequence long, the push included). */
export const captionTone: ToneKey[] = [{t: 0, tone: 'light'}];
