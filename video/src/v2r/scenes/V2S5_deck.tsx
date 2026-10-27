// V2S5_deck.tsx (lane L4, TERRACE): the S5 DECK (the viewpoint terrace in END coords, drawn in the rig's deck plane:
// pinned on the stranger, 2.42x at the start) and the end frame's near frames:
//   S5Deck        the terrace under the figures: the floor (paving, border band, header course, sett band, the static
//                 2-value dapple, drifts), the balustrade (the ONE level line), the stranger's bench UNDER part (the top
//                 rail's right half = Pip's perch, the seat, the shadow, the tote), the props and the people sorted by
//                 depth (V2S5_deck_props / _life)
//   S5DeckOver    over the figures: the stranger's bench OVER part (the top rail's left half across the stranger's
//                 back, the iron ends, the seat's back edge). An OPEN back: the stranger's whole seated back shows.
//   S5TreeLeft    the blossoming terrace tree, the LEFT frame (box TREE_BOX: it slides in from the left)
//   S5RightFrame  the terrace lamppost (a nodding basket) + the corner crown, the RIGHT frame (box RIGHT_BOX)
//   S5WipeProp    the lamppost with two hanging baskets that wipes the backs at the peak (base at (0, 0); the rig moves it)
//   S5NearEnd     screen-space petals near the lens (never in y 290-600, never over a subject)
// The deck camera follows the far plane's horizon (V2S5_deck_cam: FAR_END.horizon), its VP sits above the pair.
// Import rule: never import V2S5_rig / V2S5_set / V2S5_figs (the rig imports this file).
import React, {useMemo} from 'react';
import {useTime} from '../../lib/time';
import {Paint, lineD, ellD} from '../kit/dc/core';
import {CRANE_T, WIPE, type PullBox} from '../kit/dc/crane';
import {CM} from '../palette';
import {DeckFloor} from './V2S5_deck_floor';
import {balustrade, strangerBench, parkBench, bin, fountain, tulipBed, crabPlanter, bikeAtRail, lectern, type Prop} from './V2S5_deck_props';
import {lifeItems} from './V2S5_deck_life';
import {TerraceTree5, RightFrame5, LampPost5, NearPetals5, TREE5_BOX, RIGHT5_BOX} from './V2S5_deck_frames';
import {dpt} from './V2S5_deck_cam';

/** The left frame's box: its crown's top-left travels in from the left (end top held at y 642). */
export const TREE_BOX: PullBox = TREE5_BOX;
/** The right frame's box: the lamppost's base travels in from beyond the bottom-right. */
export const RIGHT_BOX: PullBox = RIGHT5_BOX;

/** The terrace's static props (END coords), each with its foot y for the depth sort. */
function props(): Prop[] {
  return [
    bikeAtRail(14.6),
    parkBench(6.0, 8.0, 16.5),
    parkBench(-1.5, 1.5, 10.8, (B, a, b, k) => {
      // a takeaway cup and a folded scarf on the near bench's right end
      const x = b[0] - 0.42 * k;
      const y = b[1] - 0.47 * k;
      B.rect(CM.paper, x, y - 0.13 * k, 0.07 * k, 0.13 * k);
      B.rect(CM.brick, x, y - 0.09 * k, 0.07 * k, 0.04 * k);
      B.fill(CM.coatPlum, ellD(x - 0.3 * k, y - 0.03 * k, 0.16 * k, 0.045 * k));
      B.ink(lineD([[x, y], [x, y - 0.13 * k], [x + 0.07 * k, y - 0.13 * k], [x + 0.07 * k, y]]), 1.4, CM.ink);
      void a;
    }),
    bin(-2.25, 11.1),
    fountain(3.0, 11.6),
    crabPlanter(-2.2, 12.3, 'L'),
    lectern(4.35, 12.75),
    tulipBed(-1.2, 3.6, 8.2, 9.7, 'near', true),
  ];
}

export const S5Deck: React.FC = () => {
  const t = useTime();
  const rail = useMemo(() => balustrade(), []);
  const benchU = useMemo(() => strangerBench('under'), []);
  const ps = useMemo(() => props(), []);
  const items = [
    ...ps.map((p) => ({y: p.y, key: p.key, el: <Paint b={p.b} seed={`s5deck/${p.key}`} misreg={2} />})),
    ...lifeItems(t),
  ].sort((a, b) => a.y - b.y);
  return (
    <>
      <DeckFloor />
      <Paint b={rail} seed="s5deck/rail" misreg={2} />
      <Paint b={benchU} seed="s5deck/benchU" misreg={1.5} />
      {items.map((i) => (
        <React.Fragment key={i.key}>{i.el}</React.Fragment>
      ))}
    </>
  );
};

export const S5DeckOver: React.FC = () => {
  const b = useMemo(() => strangerBench('over'), []);
  return <Paint b={b} seed="s5deck/benchO" misreg={1.5} />;
};
export const S5TreeLeft: React.FC = () => <TerraceTree5 burstAt={CRANE_T.april} />;
export const S5RightFrame: React.FC = () => <RightFrame5 />;
export const S5WipeProp: React.FC = () => <LampPost5 h={WIPE.h} baskets={2} seed="wipe" nod={false} />;
export const S5NearEnd: React.FC<{p: number}> = () => <NearPetals5 n={14} />;

void dpt;
