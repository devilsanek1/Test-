// S6 (lane L2-inserts): INSERT, EXACTLY the S4 frame, 11.48-16.60 ("But this past year, in the US, computers went up
// almost 10%."). Locked board (animatic S6): S4's card, title, axes, "2005" and the drawn line; the only change is the
// hook turning UP at the line's end (board: from "US," 12.92 for 1.2 s, ending on "went") and "+9.7%" on "almost10%"
// (14.84). Each leads its word by 0.1 s (ENGINE rule 5). The board's emphasis is the hook itself: the hero line's head
// dot rides up with it. Camera: the same 1.5 % breathe about the same point as S4.
import React from 'react';
import {World} from '../../../lib/World';
import type {ToneKey} from '../../../lib/Film';
import {useTime} from '../../../lib/time';
import {mat, XG} from '../../../lib/xf';
import {EMBER} from '../kit';
import {breathe, S4_ANCHOR, WallCard} from './S4_wall';
import {PriceChart} from './S4_chart';

const START = 11.48;
const DUR = 16.6 - START;
/** "US," 12.92 and "almost10%" 14.84 (VO), led by 0.1 s. */
const HOOK_AT = 12.92 - START - 0.1;
const LABEL_AT = 14.84 - START - 0.12;

const S6: React.FC = () => {
  const t = useTime();
  const z = breathe(t, DUR);
  return (
    <World sky={EMBER.wall}>
      <XG m={mat.about(mat.scale(z), S4_ANCHOR[0], S4_ANCHOR[1])}>
        <WallCard seed="s4">
          <PriceChart hookAt={HOOK_AT} hookDur={1.2} labelAt={LABEL_AT} />
        </WallCard>
      </XG>
    </World>
  );
};
export default S6;

/** Ink captions on the wall. */
export const captionTone: ToneKey[] = [{t: 0, tone: 'dark'}];
