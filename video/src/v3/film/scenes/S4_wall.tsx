// S4_wall (lane L2-inserts): the G5 insert set, still used by S11 / S12 (breathe, WallCard). Since G5b, S4 and S6 use
// S4_street.tsx (the chart in the computer shop's noticeboard; it re-exports BOARD_LINE / BOARD_HOOK / breathe from
// here). The G5 description, for S11: the shared set of the three insert panels S4, S6 and S11. A flat warm-white chart card
// taped straight-on and level to the nook's peach wall (charts are never angled), the terracotta desk top along the
// bottom (framing only: platform UI covers it) with a sliver of the lamp's golden pool. Present the chart in the film's
// world, not as a UI slide. The caption band (y 290-600) stays flat wall: the card starts at y 615.
//
// Shared numbers: S4 and S6 are the SAME frame (camera_plan_g3: "the matched frame makes the turn the only
// difference"), so both read CARD / PLOT / BREATHE from here.
import React from 'react';
import {Fill} from '../../../lib/Fill';
import {Ink} from '../../../lib/Ink';
import {blob, hline, line, poly, polyPath} from '../../../lib/sketch';
import {ease, prog} from '../../../lib/time';
import {EMBER, type Pt} from '../kit';
import {ChartCard} from '../kit/Charts';

/** The card on the wall (canvas px). Right edge 940 stays left of the platform rail (x > 950). */
export const CARD = {x: 140, y: 615, w: 800, h: 735};
/** The line chart's plot box (axes origin bottom-left), the board's axes moved into the card. */
export const PLOT = {x: 240, y: 770, w: 600, h: 430};
/** The desk's back edge (under the platform's bottom UI). */
const DESK_Y = 1585;

/** The board's line (animatic S4, axes 260-800 x 690-1180) in plot units (u right, v up): 20 years downhill with
 *  the small 2021 bump, ending at u 0.815 so the turn has room. */
export const BOARD_LINE: Pt[] = [
  [0.056, 0.857],
  [0.207, 0.673],
  [0.359, 0.5],
  [0.511, 0.347],
  [0.63, 0.241],
  [0.663, 0.286],
  [0.704, 0.214],
  [0.815, 0.143],
];
/** S6's hook (animatic S6: 700,1110 -> 712,1086 -> 738,978). */
export const BOARD_HOOK: Pt[] = [
  [0.837, 0.192],
  [0.885, 0.412],
];
/** Plot units -> canvas px. */
export const plotPt = ([u, v]: Pt): Pt => [PLOT.x + u * PLOT.w, PLOT.y + PLOT.h - v * PLOT.h];

/** S4 / S6's breathe fixed point: the chart, right of centre (the turn's side). */
export const S4_ANCHOR: [number, number] = [600, 1050];

/** The hold's breathe (owner: 1.5-2 % at most): 1 -> 1.015 over the panel, ease in-out. */
export const breathe = (t: number, dur: number) => 1 + 0.015 * prog(t, 0, dur, ease.inOutSine);

/** One strip of paper tape across a card corner. */
const Tape: React.FC<{cx: number; cy: number; deg: number; seed: string}> = ({cx, cy, deg, seed}) => {
  const L = 62;
  const T = 19;
  const a = (deg * Math.PI) / 180;
  const loc: Pt[] = [[-L, -T], [L * 0.96, -T], [L, -T * 0.3], [L * 0.94, T * 0.2], [L, T], [-L * 0.97, T], [-L, T * 0.35], [-L * 0.95, -T * 0.25]];
  const pts = loc.map(([px, py]) => [cx + px * Math.cos(a) - py * Math.sin(a), cy + px * Math.sin(a) + py * Math.cos(a)] as Pt);
  return (
    <>
      <Fill d={polyPath(pts)} color={EMBER.reveal} offset={[1.5, 1]} seed={`${seed}/f`} />
      <Ink d={poly(pts, {closed: true, joined: true, seed: `${seed}/i`, over: [0, 1]})} width={1.6} />
    </>
  );
};

/** The wall behind the card is the World sky (EMBER.wall); this draws the desk band, the pool sliver, the card and
 *  its two tapes. Children = the chart, drawn on the card. */
export const WallCard: React.FC<{seed: string; children?: React.ReactNode}> = ({seed, children}) => (
  <>
    {/* the desk top along the bottom, with the lamp's golden pool coming in from the left */}
    <Fill rect={[-60, DESK_Y, 1200, 500]} color={EMBER.desk} offset={false} />
    <Fill d={blob(150, DESK_Y + 150, 340, 96, {seed: `${seed}/pool1`, wobble: 0.02})} color={EMBER.ring} offset={false} />
    <Fill d={blob(130, DESK_Y + 150, 200, 58, {seed: `${seed}/pool2`, wobble: 0.025})} color={EMBER.core} offset={false} />
    <Ink d={hline(-60, 1140, DESK_Y, {seed: `${seed}/deskE`, over: 'structural'})} width={3.4} />
    <Ink d={line(620, DESK_Y + 120, 960, DESK_Y + 126, {seed: `${seed}/gr`, over: [0, 0]})} width={2.2} />
    {/* the card, taped to the wall straight-on and level */}
    <ChartCard x={CARD.x} y={CARD.y} w={CARD.w} h={CARD.h} seed={`${seed}/card`}>
      {children}
    </ChartCard>
    <Tape cx={CARD.x + 34} cy={CARD.y + 6} deg={-38} seed={`${seed}/tapeL`} />
    <Tape cx={CARD.x + CARD.w - 34} cy={CARD.y + 6} deg={38} seed={`${seed}/tapeR`} />
  </>
);
