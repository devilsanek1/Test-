// S4_chart (S4 pilot lane, G5b): the price chart of S4 and S6, one component so the two panels are the same frame.
// "U.S. computer prices" from 2005, ink L axes, the hero line (kit LineChart, 9 px) drawn downhill with the voice;
// S6 adds only the hook up and "+9.7%". G5b: the card sits in the shop's noticeboard (S4_street), 6 % smaller about
// its bottom edge, so every number here comes from S4_street's CARD / PLOT (the words keep their 56-64 px).
import React from 'react';
import {ChartCard, LineChart} from '../kit/Charts';
import {EMBER, Pop, Txt} from '../kit';
import {BOARD_HOOK, BOARD_LINE, CARD, CARD_K, PLOT, plotPt} from './S4_street';

export type PriceChartProps = {
  /** The line draws on from drawAt over drawDur (omit = drawn: S6). */
  drawAt?: number;
  drawDur?: number;
  /** S6: the hook draws from hookAt over hookDur, "+9.7%" pops at labelAt. */
  hookAt?: number;
  hookDur?: number;
  labelAt?: number;
};

/** "+9.7%": left of the hook's top, clear of the falling line (board: 120 px, at the hook top's height). */
const hookTop = plotPt(BOARD_HOOK[BOARD_HOOK.length - 1]);
const LABEL = {x: hookTop[0] - 126 * CARD_K, y: hookTop[1] - 22 * CARD_K, size: Math.round(118 * CARD_K)};

/** The card (warm white, ink edge) with the chart on it. */
export const PriceChart: React.FC<PriceChartProps> = ({drawAt, drawDur = 2.3, hookAt, hookDur = 1.2, labelAt}) => {
  const isS6 = hookAt !== undefined;
  return (
    <ChartCard x={CARD.x} y={CARD.y} w={CARD.w} h={CARD.h} seed="s4/card">
      {/* the title in the caption hand (62 px at G5 size: 58 here, inside the 56-64 band) */}
      <Txt x={CARD.x + CARD.w / 2} y={CARD.y + 98 * CARD_K} size={58} fit={CARD.w * 0.86}>
        U.S. computer prices
      </Txt>
      <LineChart
        x={PLOT.x}
        y={PLOT.y}
        w={PLOT.w}
        h={PLOT.h}
        title=""
        years={['2005']}
        data={BOARD_LINE}
        drawAt={drawAt}
        drawDur={drawDur}
        hook={isS6 ? BOARD_HOOK : undefined}
        hookAt={hookAt}
        hookDur={hookDur}
        seed="s4/chart"
      />
      {isS6 ? (
        <Pop at={labelAt} x={LABEL.x} y={LABEL.y - LABEL.size * 0.35} overshoot>
          <Txt x={LABEL.x} y={LABEL.y} size={LABEL.size} fill={EMBER.hero}>
            +9.7%
          </Txt>
        </Pop>
      ) : null}
    </ChartCard>
  );
};
