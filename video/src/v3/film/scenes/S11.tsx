// S11 (S11 lane, G5b): INSERT, the bar chart straight-on, 25.24-29.40 ("Which means what's left costs about five
// times last year's price."). Locked board (animatic S11, storyboard_g3 / camera_plan_g3): L axes; a light short "last
// year" bar with a memory stick on it; a dark bar five times as tall, with its stick, landing on "costs" (26.36); "5x"
// over it on "five" (27.08). The big bar grows from the baseline so it completes on "costs" (ENGINE rule 5: a big
// build leads by ~0.3 s); "5x" leads "five" by 0.1 s. Camera: HOLD, breathing in 1.5 % toward the tall bar.
//
// In the film's world (G5b, density_plan_g5b S11): the chart is pinned to the cork price board in the drivers' room by
// the chip factory's loading dock (S11_room.tsx), where the laptop van's driver waits; four drivers watch it from the
// bottom of the frame and Pip reads it from a stack of crates of gold sticks (S11_people.tsx). The card is S4's size
// (x 0.94 about its bottom edge) so the board's top rail stays under the caption band.
//
// Beats (panel-local s = VO - 25.24): "means" 0.16, "what's" 0.48, "left" 0.80, "costs" 1.12, "about" 1.60, "five"
// 1.84, "times" 2.24, "last" 2.64, "year's" 2.88, "price" 3.28, "And" 3.92.
import React from 'react';
import {World} from '../../../lib/World';
import type {ToneKey} from '../../../lib/Film';
import {useTime} from '../../../lib/time';
import {mat, XG} from '../../../lib/xf';
import {EMBER} from '../kit';
import {BarChart} from '../kit/Charts';
import {breathe} from './S4_wall';
import {BARS, S11Room, type RoomLife} from './S11_room';
import {S11Crowd, type CrowdLife} from './S11_people';

const START = 25.24;
const DUR = 29.4 - START;
const COSTS = 26.36 - START;
const FIVE = 27.08 - START;
/** The tall bar grows 0.35 s and lands on "costs"; "5x" leads "five". */
const BIG_AT = COSTS - 0.32;
const VALUE_AT = FIVE - 0.1;

/** The room's life: the forklift crosses the dock window early (the old empty start) and again in the settle; the
 *  strip light flickers once before "left"; the board's papers lift on "five". */
const ROOM: RoomLife = {
  flickerAt: [0.76],
  flutterAt: [FIVE + 0.06],
  forklift: [
    [0.06, 1.12, 1],
    [2.4, 3.5, -1],
  ],
  worker: [-0.6, 4.6],
};

/** The drivers and Pip (coat colours from the Ember families; the cap carries the laptop badge). */
const CROWD: CrowdLife = {
  row: [
    // the dock hand: hi-vis, hard hat; the phone goes up after "five" to snap the board
    {hair: 'short', wear: ['hivis', 'hardhat'], coat: EMBER.dcSide, phoneWin: [FIVE + 0.24, 99], moves: [{t: FIVE + 0.08, kind: 'recoil', amp: 1}]},
    // the laptop van's driver: the cap with the badge; a hand to the back of his head on "five", then turns to his
    // neighbour in the settle
    {hair: 'cap', wear: ['badge'], coat: EMBER.dc, hat: EMBER.dcSide, coatDetail: ['quilt', 'yoke'], moves: [{t: 2.92, kind: 'lean', dir: 1, amp: 1.2}]},
    // the coffee: two sips, turns back to the van driver in the settle
    {hair: 'beanie', acc: ['scarf'], coat: '#6B4A6E', hat: EMBER.hl, coatDetail: ['zip'], moves: [{t: 3.0, kind: 'lean', dir: -1, amp: 1.2}]},
    // the hood with the clipboard
    {acc: ['hood'], coat: '#C98A64', coatDetail: ['quilt'], moves: [{t: FIVE + 0.12, kind: 'turn', amp: 1.6}]},
  ],
  // "costs": the row leans in after the tall bar as it climbs (staggered 2 frames)
  rowMoves: [{t: BIG_AT + 0.12, kind: 'lean', amp: 1}],
  sips: [
    [0.36, 1.0],
    [3.08, 3.78],
  ],
  headScratch: [FIVE + 0.1, FIVE + 1.2],
  clipFlutter: [FIVE + 0.04],
  pip: {
    // Pip reads the short bar, follows the tall one up as it lands, covers its ears on "5x", then looks to the drivers
    look: [
      {t: 0, v: -0.85},
      {t: BIG_AT + 0.05, v: -0.4},
      {t: 2.9, v: -0.7},
    ],
    keys: [
      {t: 0, pose: 'sit-back'},
      {t: FIVE + 0.1, pose: 'ears-cover'},
      {t: 3.05, pose: 'sit-back'},
    ],
  },
};

const S11: React.FC = () => {
  const t = useTime();
  const z = breathe(t, DUR);
  return (
    <World sky={EMBER.wall}>
      <XG m={mat.about(mat.scale(z), 690, 1040)}>
        <S11Room life={ROOM}>
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
        </S11Room>
        <S11Crowd life={CROWD} />
      </XG>
    </World>
  );
};
export default S11;

/** Ink captions on the wall. */
export const captionTone: ToneKey[] = [{t: 0, tone: 'dark'}];
