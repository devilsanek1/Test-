// S4 (lane L2-inserts): INSERT, the line chart straight-on, 5.80-9.48 ("Which is backwards. Laptops get better for
// the same money."). Locked board (public/v3/animatic.json S4, docs/v3/camera_plan_g3.md): "U.S. computer prices",
// L axes, "2005", one 9 px line drawn downhill with the voice (board: t 0.1 -> 2.4, ending on "better for the").
// In the film's world: the chart is a warm-white card taped level to the nook's peach wall above the desk
// (S4_wall.tsx). Camera: HOLD, breathing in 1.5 % toward the line's end (where S6 turns it up); S6 is this exact frame.
import React from 'react';
import {World} from '../../../lib/World';
import type {ToneKey} from '../../../lib/Film';
import {useTime} from '../../../lib/time';
import {mat, XG} from '../../../lib/xf';
import {EMBER} from '../kit';
import {breathe, S4_ANCHOR, WallCard} from './S4_wall';
import {PriceChart} from './S4_chart';

const DUR = 9.48 - 5.8;

const S4: React.FC = () => {
  const t = useTime();
  const z = breathe(t, DUR);
  return (
    <World sky={EMBER.wall}>
      <XG m={mat.about(mat.scale(z), S4_ANCHOR[0], S4_ANCHOR[1])}>
        <WallCard seed="s4">
          <PriceChart drawAt={0.1} drawDur={2.3} />
        </WallCard>
      </XG>
    </World>
  );
};
export default S4;

/** Ink captions on the wall. */
export const captionTone: ToneKey[] = [{t: 0, tone: 'dark'}];
