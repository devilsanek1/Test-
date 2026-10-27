// V2S5_figs.tsx (lane L4): the S5 figures, tier B (the scale anchors; conform_L4 §1, §5; THROUGHLINE §3-4). START coords
// (drawn through the deck's start map until the swap): the stranger, a small full figure reading an open newspaper on the
// bench, and Pip SEATED on the backrest beside them from the first frame (S5 opens out of the sun by a push-through: no
// arrival hop, no landing). 0.21 "April": Pip looks up at the slot's blossom (its ONE reaction), then settles to watch
// the view; the stranger turns a page once (0.60). END coords (from the swap behind the lamppost wipe, in the deck
// plane): the same two, tiny, at the balustrade; Pip stays put (no leap): S5's blossom-tree Wiper covers it ~23.81 and
// S6's Pip appears at the deal board's foot (360, 1410) in the same column.
import React from 'react';
import {Stranger} from '../kit/cast';
import {PipTrack} from '../kit/pip';
import {FIG, T5, DECK} from './V2S5_rig';

/** Scene times: "April" 0.21 (heard 20.76); the look-up returns by ~0.9. */
const LOOK = T5.april;
/** Where Pip looks on "April": the slot trees' tops bursting into blossom (START coords). */
const BLOSSOM: [number, number] = [330, 885];

export const FiguresStart: React.FC = () => {
  const s = FIG.start.stranger;
  const pip = FIG.start.pip;
  return (
    <>
      <Stranger x={s.x} y={s.feetY - 50} h={s.h - 50} turnPageAt={[0.6]} seed="s5/stranger" />
      <PipTrack
        x={pip.x}
        y={pip.y}
        size={FIG.start.pipSize}
        facing="back"
        seed="s5pip"
        keys={[
          {t: LOOK - 0.06, pose: 'lookUp', dur: 0.14, target: BLOSSOM},
          {t: 0.7, pose: 'sit', dur: 0.25, target: null},
        ]}
      />
    </>
  );
};

export const FiguresEnd: React.FC = () => {
  const s = FIG.end.stranger;
  const pip = FIG.end.pip;
  return (
    <>
      <Stranger x={s.x} y={s.feetY - 50 / DECK.k} h={(s.h * DECK.k - 50) / DECK.k} seed="s5/stranger" />
      <PipTrack x={pip[0]} y={pip[1]} size={FIG.end.pipSize} facing="back" seed="s5pip" keys={[]} />
    </>
  );
};
