// S11 (lane L2-inserts): INSERT, the bar chart straight-on, 25.24-29.40 ("Which means what's left costs about five
// times last year's price."). Locked board (animatic S11): L axes; a light short "last year" bar with a memory stick
// on it; a dark bar five times as tall, with its stick, in on "costs" (26.36); "5x" over it on "five" (27.08).
// The big bar grows from the baseline so it completes on "costs" (ENGINE rule 5: a big build leads by ~0.3 s); "5x"
// leads "five" by 0.1 s. Same world as S4 / S6: the card taped level to the peach wall above the desk.
// Camera: HOLD, breathing in 1.5 % toward the tall bar.
import React from 'react';
import {World} from '../../../lib/World';
import type {ToneKey} from '../../../lib/Film';
import {useTime} from '../../../lib/time';
import {mat, XG} from '../../../lib/xf';
import {EMBER} from '../kit';
import {BarChart} from '../kit/Charts';
import {breathe, WallCard} from './S4_wall';

const START = 25.24;
const DUR = 29.4 - START;
/** The tall bar grows 0.35 s and lands on "costs" (26.36); "5x" leads "five" (27.08). */
const BIG_AT = 26.36 - START - 0.32;
const VALUE_AT = 27.08 - START - 0.1;
/** Axes origin, plot width and the tall bar's height (the short one is a fifth of it). */
const BARS = {x: 200, y: 1240, w: 680, h: 420};

const S11: React.FC = () => {
  const t = useTime();
  const z = breathe(t, DUR);
  return (
    <World sky={EMBER.wall}>
      <XG m={mat.about(mat.scale(z), 690, 1040)}>
        <WallCard seed="s11">
          <BarChart
            x={BARS.x}
            y={BARS.y}
            w={BARS.w}
            h={BARS.h}
            bars={[
              {label: 'last year', v: 1, color: EMBER.shelf},
              {label: '', v: 5, color: EMBER.anchor, at: BIG_AT},
            ]}
            value="5x"
            valueAt={VALUE_AT}
            seed="s11/bars"
          />
        </WallCard>
      </XG>
    </World>
  );
};
export default S11;

/** Ink captions on the wall. */
export const captionTone: ToneKey[] = [{t: 0, tone: 'dark'}];
