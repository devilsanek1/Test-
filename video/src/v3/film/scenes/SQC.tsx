// SQC YOUR STICK (line 5a: "Mostly because your laptop runs on memory chips,"), film 16.60-19.40 (docs/v3/flow_v2.md
// §2, §4, §5, §6; the HOME lane). The head turns back from the card to the window (J2: homeCam pans back over
// 15.95-17.25, locked at H1 from then); "your laptop": the phone rises to HIGH2 and its screen lights (17.24-17.64);
// "memory": one stick lifts out of the listing laptop toward the lens (18.28-18.86) and holds at the screen centre,
// where J3 pushes through it into THEIR mountain. The shared pieces, drawn read-only on FILM time:
//   home_set.tsx     the nook under homeCam(T), lit by the nook rig (the lamp, screen-left, is the key); the card
//                    keeps SQB's finished chart (SQB_chart, the same component) while it slides out of frame right
//   thread_plane     the hand, the phone (LOW-C -> HIGH2 17.24-17.64, the screen lit 17.24-19.40), THE TAG (it tugs on
//                    18.30 as the stick leaves its laptop), Pip on the phone's edge
//   SQC_stick.tsx    THE stick (SQD_peak's J3Stick at every frame of the move) and its warm rim
// Hierarchy (flow_v2 §5, CRAFT §b): A the listing laptop (the phone rises, its screen lights) -> the stick; B the tag,
// Pip, the hand; C the room, the data center calm in the window (its sign lit). Nothing enters 16.20-17.00 (J2).
// Joins (docs/G5_BLOCKING.md §2b): IN J2, a seam mid-pan at 16.60 (frame 996: SQB draws the same home_set + chart +
// thread_plane at film time); OUT J3, the engine's push-through (scenes.json SQD: from = to = (540, 870), x7, no
// bridge; its out leg zooms THIS sequence 18.905-19.40): the stick holds at (540, 870), w 700, rot -4 from 18.86, the
// pose SQD opens on.
import React from 'react';
import {useFilmTime} from '../../../lib/sequence';
import {World} from '../../../lib/World';
import type {ToneKey} from '../../../lib/Film';
import {EMBER} from '../kit';
import {Lit} from '../kit/Light';
import {FilmClock, HOME_RIG, HomeSet} from './home_set';
import {ThreadPlane} from './thread_plane';
import {OldDealChart} from './SQB_chart';
import {LiftStick} from './SQC_stick';

const SQC: React.FC = () => {
  const T = useFilmTime();
  return (
    <World sky={EMBER.wall}>
      <HomeSet T={T} card={<OldDealChart T={T} />} />
      <ThreadPlane T={T} />
      <FilmClock T={T}>
        <Lit rig={HOME_RIG}>
          <LiftStick T={T} />
        </Lit>
      </FilmClock>
    </World>
  );
};
export default SQC;

/** Ink captions on the peach-cream wall (the caption band is the wall all through SQC; J3's push-through hands over to
 *  SQD's own keys). */
export const captionTone: ToneKey[] = [{t: 0, tone: 'dark'}];
