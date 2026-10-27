// V2S6 "The gate" (lane L5). Film 24.00-28.06 s (scene t = film - 24.00, 244 frames); TREATMENT.md sections 3, 5
// (row S6), 8 (V1-V3, V9, V10, V12, V15); map.ts S6; STYLE.md (BUSY). Eye level, straight-on, looking SOUTH along the
// Pentagon's perimeter fence on an April morning (the sun in the east = screen left, SUN2 screen-fixed: the match-cut
// into S7 at 28.06), a lateral truck LEFT (every plane drifts right, linear: far 10, lawn 15, mid 24.63 = the deal
// board's contract drift of exactly 100 px, near 65 px/s).
//   0.00  the cut on Pip's leap (on "any"): the deal board is UP (frame, tag, the FULL clause, the credit) and clacks;
//         Pip arrives mid-leap (694, 714) and lands on the tall corner post's cap 0.12
//   0.03  "any": the purpose line pops; 0.05-0.10 a gust shakes 14 petals off the flowering shrub (the burst)
//   0-0.85 a staff member walks in at the service door; 1.00 it slides shut behind them
//   2.40  "veto": the F12 line pops (Lawful use: decided by the Pentagon); 2.50 Pip's ONE ear flick (no droop)
//   2.30  the door opens; 2.62 a staff member steps out for air, 3.05 goes back in; 3.40 the door slides shut
//   3.08-3.80 the facade's windows light one by one past both edges ("how it's used")
//   3.95  Pip hops (screen space, V2S7_pip's pipHopAt: the same path S7 continues)
//   always: the promenade (joggers, a dog walker, a cyclist, a parent with a stroller, a walker), the gardener, birds,
//   petals, pigeons fluttering as a passer-by comes past, the readers (one turns to her neighbour), tulips nodding.
// Parts: V2S6_rig (shared numbers), V2S6_board (the deal board slot), V2S6_pip, V2S6_life (beyond the fence),
// V2S6_near (the near plane), V2S6_set (dressing + the kit colour fixes). The set is the dc kit's GateSet; its slots
// carry every part.
import React from 'react';
import {World} from '../../lib/World';
import {skyBands, TOD} from '../palette';
import {GateSet} from '../kit/dc/gate';
import type {ToneKey} from '../../lib/Film';
import {S6Board} from './V2S6_board';
import {S6PipOnPost, S6PipHop} from './V2S6_pip';
import {S6Clouds, S6Birds, S6LawnTrees, S6Promenade, S6Staff, S6LawnMid, S6Petals} from './V2S6_life';
import {S6NearBack, S6NearFront, S6Readers} from './V2S6_near';
import {S6HedgeFix, S6ShrubFix, S6Border} from './V2S6_set';

export const captionTone: ToneKey[] = [{t: 0, tone: 'dark'}];

/** The April light: the mint caption sky, then the high step (y 600-680) over the gold band (680 ->, seen above the
 *  facade): World's bands with horizon 760 land the first step exactly on y 600. */
const SKY = skyBands('april');

const V2S6: React.FC = () => (
  <World sky={SKY} tod={TOD.april} horizon={760}>
    <GateSet
      bars={<S6Clouds />}
      doorPeople={<S6Staff />}
      lawn={
        <>
          <S6LawnTrees />
          <S6Birds />
          <S6Promenade />
        </>
      }
      mid={
        <>
          <S6HedgeFix />
          <S6LawnMid />
        </>
      }
      board={<S6Board />}
      pip={<S6PipOnPost />}
      near={
        <>
          <S6NearBack />
          <S6ShrubFix />
          <S6Border />
          <S6NearFront />
          <S6Readers />
        </>
      }
    />
    <S6Petals />
    <S6PipHop />
  </World>
);
export default V2S6;
