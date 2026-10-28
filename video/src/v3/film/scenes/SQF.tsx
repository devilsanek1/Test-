// SQF PAYOFF (line 9: "So that's how an AI data center ends up on your next laptop's price tag."), 36.36-41.15
// (docs/v3/flow_v2.md §2, §4, §5): H2. 36.36-36.98 nothing new: SQE's push releases (J5's continuous camera, h2_window)
// and the street keeps its calm life; 36.98 the data center's sign LIGHTS (outside.tsx: its beat, drawn on top of the
// hall; the notice goes blank in the same frame); 38.12-38.62 the phone rises to PAYOFF (the data center and the
// mountain uncovered above it); 39.70 the tag turns: the mini data center "AI" on its back; 39.88 the like-pop;
// 40.40-40.55 Pip shrugs in its side pose; THE LOOP: 40.55-40.85 the whole thread plane travels back to frame 0's spot
// (PAYOFF is HIGH-C x1.15 about (540, 1180): the inverse scale) while the tag turns back to its front, the payoff's
// $1,099 under the struck $999 (assembly review R1-6: the last coloured price is the new one); 40.85-41.15 the window, the
// street, the sky and the plane's colour leave under ONE falling erase edge (desk_window's EraseDown) onto SQA's frame-0
// lines in the same place, and the captions roll at 41.00 (Film3.tsx).
// Hierarchy (flow_v2 §5): A = the data center's sign -> the tag; B = Pip; C = the window view. Light: the nook rig on
// the tag (rim left, form shade on its right third).
// Joins: IN J5, a seam on a held frame at 36.36 (frame 2182: SQE's H2Scene at film time); OUT the loop, scenes.json
// transitionOut {type: 'unbuild', loop: true, dur: 0.3} onto SQA's t < 0 bare lines; the sky slab is dropped while it
// un-builds (S16's recipe), so SQA's lines draw on in place under the falling edge.
import React from 'react';
import {World} from '../../../lib/World';
import type {ToneKey} from '../../../lib/Film';
import {useExit} from '../../../lib/exit';
import {ease, prog} from '../../../lib/time';
import {mat, XG} from '../../../lib/xf';
import {EMBER, FILM_TOD} from '../kit';
import {EraseDown} from './desk_window';
import {useFilmT} from './outside';
import {H2Scene} from './SQE';

/** The falling erase edge (exit 0.0 -> 0.8 of the 0.3 s un-build): from the frame top to past its bottom. */
const ERASE = {y0: -40, y1: 2000, e0: 0, e1: 0.8};

/** The loop's carry (film seconds): the plane travels back to frame 0's spot (HIGH-C) as the tag turns to its front
 *  ($1,099, the struck $999 above it), ending as the un-build starts, so the falling edge takes its colour off in place,
 *  over the same lines. */
export const LOOP_BACK = {t0: 40.55, t1: 40.85, k: 1 / 1.15, c: [540, 1180] as [number, number]};

const SQF: React.FC = () => {
  const unbuilding = useExit() > 0;
  const T = useFilmT();
  const u = ease.inOutCubic(prog(T, LOOP_BACK.t0, LOOP_BACK.t1 - LOOP_BACK.t0));
  const back = u > 0;
  const wrap = back ? (plane: React.ReactNode) => <XG m={mat.about(mat.scale(Math.pow(LOOP_BACK.k, u)), LOOP_BACK.c[0], LOOP_BACK.c[1])}>{plane}</XG> : undefined;
  // the tag turns back to its front as it travels: the PAYOFF price, $1,099 under the struck $999 (assembly review R1-6:
  // a front reading "$999" again made the old price the last coloured one the viewer sees); the falling erase edge then
  // takes its colour off onto SQA's frame-0 lines in the same place
  const tagProps = back ? {turn: 1 - u} : undefined;
  return (
    <World stage="context" sky={unbuilding ? 'transparent' : [{t: 0, tod: FILM_TOD, color: EMBER.sky}]}>
      <EraseDown {...ERASE}>
        {unbuilding ? <path d="M-200 -200H1280V2120H-200Z" fill={EMBER.sky} /> : null}
        <H2Scene wrap={wrap} tagProps={tagProps} />
      </EraseDown>
    </World>
  );
};
export default SQF;

/** White captions on the dusk sky; ink from the loop's caption roll (41.00, local 4.64: the frame-0 words return on the
 *  pale un-built page, never white on it; the last page before it is all highlight boxes, readable on both). 4.635 sits
 *  between frames 2459 and 2460, so float rounding can never move the switch off the roll's frame. */
export const captionTone: ToneKey[] = [
  {t: 0, tone: 'light'},
  {t: 4.635, tone: 'dark'},
];
