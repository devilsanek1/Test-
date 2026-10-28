// SQB OLD DEAL (lines 3-4: "Which is backwards. Laptops get better for the same money… usually right after you buy one.
// But this past year, in the US, computers went up almost ten percent."), film 5.80-16.60 (docs/v3/flow_v2.md §2, §4,
// §5; the HOME lane). The head has turned from the window to the chart card pinned on the nook's wall, right of the
// window (J1: homeCam pans x 0 -> -775 over 5.15-6.45); the card is paper in the place you already are, never a new
// place (CRAFT §a.2). The shared pieces, drawn read-only on FILM time:
//   home_set.tsx     the nook under homeCam(T) (the pan, then the cozy float over the hold, then J2's pan back from
//                    15.95), lit by the nook rig (the lamp off screen-left; the card unlit; the pins cast down-right)
//   thread_plane     the hand, the phone at LOW-C with its screen dimmed one step (the stage leads), THE TAG (the thread,
//                    on screen all through: it jolts on 15.30, after the +9.7%), Pip on the phone's edge (it looks up at
//                    the card 9.04-11.14, ears droop on "one." 10.92)
//   SQB_chart.tsx    THE CHART on the card (this sequence's subject; SQC draws it too through J2's pan back)
// Beats (film seconds; visuals lead their word by ~0.1 s): the card's face is static until 6.98; 6.98-9.28 the line
// draws downhill with the voice; 10.32-10.50 a doodle laptop "$999" lands on the line ("buy" 10.60); 10.82 a shinier
// BETTER one, the same "$999", pops right after it ("one." 10.92); 13.85-14.45 the line hooks UP ("up" 14.52); 14.74
// "+9.7%" pops alone ("almost10%" 14.84); 15.05 the source, small; 15.30 the tag jolts (the thread reacts).
// Hierarchy (flow_v2 §5, CRAFT §b): A the line -> the doodles -> the hook and "+9.7%", one at a time; B the tag, Pip,
// the dim phone; C the wall, the notes, the window strip (snow), the desk. Nothing enters 5.40-6.20 (J1) or 16.20-17.00
// (J2): the card's face is static at J1 and finished at J2.
// Joins (docs/G5_BLOCKING.md §2b): IN J1, a seam mid-pan at 5.80 (frame 348: SQA draws the same home_set + thread_plane
// at film time, the card bare); OUT J2, a seam mid-pan at 16.60 (frame 996: SQC draws the same, the card finished).
// Quiet life (early review E12, final pass: the film's longest shot must stay alive but calm, never stealing the
// chart): home_set's SQB corner (the slope's string lights, snow past the skylight, the teacup and pencil) plus, here, the
// teacup's steam (TeaSteam), the set's own slow life (the mug in H1 steams the same way), drawn in the room plane through
// HomeSet's `room` so the room's light takes it.
import React from 'react';
import {Ink} from '../../../lib/Ink';
import {smooth} from '../../../lib/sketch';
import {useFilmTime} from '../../../lib/sequence';
import {Tier} from '../../../lib/tier';
import {World} from '../../../lib/World';
import type {ToneKey} from '../../../lib/Film';
import {EMBER, type Pt} from '../kit';
import {HomeSet, TEACUP} from './home_set';
import {ThreadPlane} from './thread_plane';
import {OldDealChart} from './SQB_chart';

/** The teacup on the desk's lower right (home_set.tsx TEACUP, H1 px; its tea's surface at y - 0.4 w), seen only in
 *  SQB's framing (off screen at both seams: x 1341 on screen at J1 and J2): the steam reads its position, never a copy. */
const TEA = {x: TEACUP.x, surface: TEACUP.y - 0.4 * TEACUP.w};
/** The steam's colour: a light warm step of the desk (L* 82, ~75 under the room's ambient step, the desk ~64 there:
 *  within CRAFT §c's dL* 15 for tier C), so it is felt at the frame's edge, never seen before the chart. */
const STEAM = '#EEC2A6';
/** Two thin strands rising ~70 px from the tea and swaying slowly (a light line: the clean pen keeps it 1.8 px, never
 *  a dark squiggle), on film time: it never starts or stops inside SQB. */
const TeaSteam: React.FC<{T: number}> = ({T}) => {
  const strand = (sx: number, ph: number) => {
    const pts: Pt[] = [];
    for (let i = 0; i <= 4; i++) pts.push([sx + Math.sin(i * 1.15 + ph + T * 1.05) * (2 + i * 1.6), TEA.surface - 8 - i * 17]);
    return smooth(pts);
  };
  return (
    <Tier tier="environment">
      <Ink thing d={strand(TEA.x - 11, 0) + strand(TEA.x + 13, 2.4)} width={1.8} color={STEAM} />
    </Tier>
  );
};

const SQB: React.FC = () => {
  const T = useFilmTime();
  return (
    <World sky={EMBER.wall}>
      <HomeSet T={T} card={<OldDealChart T={T} />} room={<TeaSteam T={T} />} />
      <ThreadPlane T={T} />
    </World>
  );
};
export default SQB;

/** Ink captions on the peach-cream wall (the caption band is the wall all through SQB). */
export const captionTone: ToneKey[] = [{t: 0, tone: 'dark'}];
