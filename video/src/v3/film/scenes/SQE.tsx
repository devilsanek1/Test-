// SQE FIRST DIBS (lines 6-8: "They pay more, so they get first dibs. Which means what's left costs about five times
// last year's price. And laptop makers pass that on. Normally you'd wait for the better one. But chip makers say next
// year's even tighter."), 22.68-36.36 (docs/v3/flow_v2.md §2, §4, §5): H2, standing at our glass: our street with the
// chip factory's lit gate, the data center and the mountain behind. ONE place, one camera (h2_window's h2Cams on film
// time: J4's entry, then ONE push x1.35 toward the gate's pool 24.90-25.70, held through the queue and released in
// SQF's "nothing new" stretch 36.36-36.98); the story is the queue (outside.tsx holds the whole street timeline): their
// trucks first; our van's ONE crate; the 5x notice; the crate hops over the sill into the listing laptop (growing as it
// comes toward the glass, shrinking into the screen) and the tag ticks to $1,099 on "pass" (30.28); the BETTER van stuck
// at the back; the notice flips to 2027 and two of their trucks overtake it.
// Hierarchy (flow_v2 §5): A in turn = truck A, our van + its crate, the 5x face, the hop + the tag, the BETTER van, the
// 2027 face + the trucks (each the only full outline in its beat, outside.tsx); B = the waiting vans, the workers, the
// guard, Pip, the tag off its beats (the thread plane's own off-beat state); C = the street, the lamps, the walker and
// dog, the steam, the town, the data center (calm and hazed off its two beats). Light: the street rig outside (the open
// sky the key; the gate's floodlight THE light: its pool; the road-mouth lamp's own small pool; our van unlit until
// 25.72), the nook rig (h2_window's H2_RIG) on the desk and the front plane (J4's declared light change: into the warm
// room).
// THE FRONT PLANE is the real thread plane (scenes/thread_plane.tsx, read-only here): the hand holds the phone at LEFT
// (rising from below 22.45-22.95), PAYOFF from 38.12; it is screen-fixed and keyed on film time, so J4 (SQD draws this
// same H2Scene from 22.25) and J5 are one drawing by construction. The crate's hop lands on its listing laptop's screen
// at film time (threadAt(T).listingScreen), drawn over the plane.
// Joins (docs/G5_BLOCKING.md §2b): IN J4, a seam mid-entry at 22.68 (frame 1361): H2View + the front plane on film
// time, identical to SQD's last frame; OUT J5, a seam at 36.36 (frame 2182, the push's release just starting): SQF draws
// the same.
import React from 'react';
import {World} from '../../../lib/World';
import type {ToneKey} from '../../../lib/Film';
import {EMBER, FILM_TOD} from '../kit';
import {H2View, H2_RIG, h2Cams} from './h2_window';
import {CrateHop, FilmClock, useFilmT} from './outside';
import {ThreadPlane, threadAt, type ThreadPlaneProps} from './thread_plane';

/** The H2 picture at film time (shared by SQE, SQF and SQD's last frames: J4 and J5 are the same drawing). The thread
 *  plane gets film time explicitly (it must never sit inside outside's FilmClock: useFilmTime() would read that clock's
 *  time base as a shift). `tagProps` / `wrap` = SQF's loop (the tag turning back onto frame 0's tag). */
export const H2Scene: React.FC<{tagProps?: ThreadPlaneProps['tagProps']; wrap?: (plane: React.ReactNode) => React.ReactNode}> = ({tagProps, wrap}) => {
  const T = useFilmT();
  const plane = (
    <>
      <ThreadPlane T={T} rig={H2_RIG} tagProps={tagProps} />
      <FilmClock>
        <CrateHop to={threadAt(T).listingScreen} street={h2Cams(T).street} />
      </FilmClock>
    </>
  );
  return (
    <>
      <FilmClock>
        <H2View />
      </FilmClock>
      {wrap ? wrap(plane) : plane}
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
