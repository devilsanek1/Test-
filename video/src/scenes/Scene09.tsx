// S09 "Every single server" (cut(day) -> cut(server @0.8); 34.483-39.634 on the take). Storyboard: docs/storyboard_v3.md
// S09, docs/storyboard_v3_resolved.json; notes: docs/scenes/S09.md.
//
// "But even with the fix out, somebody still has to install it on every single server."
//
// Part A1 (cut -> cut(out)): Stoop Street at the end of the night, matched on the set point (S08's sun set at screen
//   (700, 1000) = STOOP.vp); the dusk holds through 'But even' (windows pop off), the dawn wipes UP on 'with' and the
//   sun rises at the VP; the crate of new locks (there since last night) pops its lid on 'fix', its check tags pop up
//   on 'out' while the cart's 'still fixing...' sign is struck and 'fixed!' scribbled (J5); the maker rolls off.
// Part A2 (HARD CUT on 'somebody', held still): door #4 close; the keeper rises; the old lock drops with Bit riding,
//   Bit scuttles up the door frame; Pip lifts a new lock and flings it on 'STILL' (GAG): it pops onto the door, check.
// Part B (HIDDEN MATCH-CUT on door #4 into TerraceHill at zoom 6): BIG MOVE 2, the log-anchored pull-back from rest to
//   a hillside of ~650 identical doors, landing on 'single' and HOLDING still: the one ticked tag + flag among hundreds
//   of EMPTY check-box tags; the keeper walks to door #5 and kneels; Pip on a near bollard, Bit on the snail.
// Out: the tram (this module's Wiper) wipes to S10.

import React from 'react';
import {World, XG, useTime} from '../lib';
import type {SkyKey} from '../lib';
import {B} from './scene09/beats';
import {camAt, camMat} from './scene09/camera';
import {PartA} from './scene09/PartA';
import {PartBScreen, PartBWorld} from './scene09/PartB';
import {TramWiper} from './scene09/TramWiper';

/** S08's last sky key (dusk step 5/5), held; the dawn = the day sky, wiped UP on 'with'. Facades keep their day
 *  fills (no `tod` on the dusk key): the set's night mode relights only the ground and lights the lamps. */
const SKY: SkyKey[] = [
  {t: 0, color: '#709F8B'},
  {t: B.dawn, tod: 'dawn', wipe: 'up', dur: 0.4},
];

const Scene09: React.FC = () => {
  const t = useTime();
  const c = camAt(t);
  return (
    <World sky={SKY}>
      <XG m={camMat(c)}>{c.part === 'B' ? <PartBWorld /> : <PartA />}</XG>
      {c.part === 'B' ? <PartBScreen /> : null}
    </World>
  );
};
export default Scene09;

/** The tram: S10's foreground wipe (element 'scene'). */
export const Wiper = TramWiper;
