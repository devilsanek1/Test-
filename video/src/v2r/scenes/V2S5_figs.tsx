// V2S5_figs.tsx (lane L4): the S5 figures. START coords (drawn through the deck's start map until the swap): the
// stranger reading an open newspaper on the bench, Pip landing beside them out of the sun's direction, looking up at
// the calendar sun on "April". END coords (from the swap, in the deck plane): the same two, tiny, at the balustrade;
// Pip leaps up-right at 23.90 (the cut on action into S6).
import React from 'react';
import {Stranger} from '../kit/cast';
import {PipTrack} from '../kit/pip';
import {SUN1} from '../world/map';
import {FIG, T5, DECK} from './V2S5_rig';

/** Scene times. */
const LAND = 0.15; // Pip seated by 20.70
const LOOK = T5.april; // 20.76 "April"

export const FiguresStart: React.FC = () => {
  const s = FIG.start.stranger;
  const pip = FIG.start.pip;
  return (
    <>
      <Stranger x={s.x} y={s.feetY - 50} h={s.h - 50} turnPageAt={[1.05, 2.4]} seed="s5/stranger" />
      <PipTrack
        x={292}
        y={700}
        size={FIG.start.pipSize}
        facing="back"
        seed="s5pip"
        keys={[
          {t: -0.12, hop: {to: [pip.x, pip.y], dur: 0.27, height: 40, style: 'tuck'}},
          {t: LAND + 0.02, pose: 'sit', dur: 0.12},
          {t: LOOK - 0.04, pose: 'lookUp', dur: 0.14, target: [SUN1.x, SUN1.y]},
          {t: T5.flip[1] + 0.25, pose: 'sit', dur: 0.25, target: null},
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
      <PipTrack
        x={pip[0]}
        y={pip[1]}
        size={FIG.end.pipSize}
        facing="back"
        seed="s5pip"
        keys={[{t: T5.pipLeap, hop: {to: [560, 980], dur: 0.36, height: 90, style: 'leap'}}]}
      />
    </>
  );
};
