// S4 (S4 pilot lane, G5b): INSERT, the line chart straight-on, 5.80-9.48 ("Which is backwards. Laptops get better for
// the same money."). Locked board (public/v3/animatic.json S4, docs/v3/camera_plan_g3.md): "U.S. computer prices",
// L axes, "2005", one 9 px line drawn downhill with the voice (board: t 0.1 -> 2.4, ending on "better for the").
// In the film's world (G5b, density_plan_g5b S4): the chart hangs in the glass noticeboard on the street wall of the
// computer shop on your street, blue hour, first snow (S4_street.tsx): a row of backs looks up at it, Pip reads it
// from the board's rail. Camera: HOLD, breathing in 1.5 % toward the line's end (where S6 turns it up); S6 is this
// exact frame. Nothing big moves beside the line while it draws: the life is small and at the edges.
import React from 'react';
import {World} from '../../../lib/World';
import type {ToneKey} from '../../../lib/Film';
import {useTime} from '../../../lib/time';
import {mat, XG} from '../../../lib/xf';
import {EMBER} from '../kit';
import {breathe, S4_ANCHOR, S4Street, type StreetLife} from './S4_street';
import {PriceChart} from './S4_chart';

const DUR = 9.48 - 5.8;
/** VO words, panel-local (VO - 5.80): "Laptops" 7.08, "better" 7.88, "same money" 8.52. */
const LAPTOPS = 7.08 - 5.8;
const BETTER = 7.88 - 5.8;
const SAME = 8.52 - 5.8;

/** S4's beats round the line (the set and its idle loops are S4_street's, shared with S6). */
export const S4_LIFE: StreetLife = {
  headlights: [0.6, 2.85],
  keeper: [[0.15, 1.75], [2.35, 5]],
  slides: [0.45, 1.35, 2.25, 3.15],
  upperSpeed: 0.4,
  flutterAt: [LAPTOPS + 0.05, SAME + 0.05],
  // "Laptops": the raised phone takes the picture (a 2-frame flash once it is up)
  flashAt: [LAPTOPS + 0.2],
  row: [
    {wear: ['earmuffs'], acc: ['scarf', 'strap'], coat: EMBER.wall, moves: [{t: 0.5, kind: 'turn', amp: 1.6}, {t: 3.1, kind: 'turn', amp: 1.4}]},
    {hair: 'long', acc: ['scarf'], coat: EMBER.dc, moves: [{t: 2.4, kind: 'turn', amp: 1.6}]},
    // "Laptops": the phone goes up at the chart (it stays up into S6, which drops it on "up")
    {hair: 'cap', acc: ['phone', 'backpack'], coat: EMBER.skyLow, dy: 34, phoneWin: [LAPTOPS - 0.06, 99], moves: [{t: LAPTOPS - 0.06, kind: 'lean', amp: 1.4}]},
    // "same money": a back nudges its neighbour
    {hair: 'beanie', acc: ['strap', 'collar'], coat: '#6B4A6E', moves: [{t: 1.75, kind: 'turn', amp: 1.5}, {t: SAME, kind: 'nudge', dir: 1, amp: 1.4}]},
    {acc: ['hood', 'backpack'], coat: EMBER.beam, moves: [{t: 1.0, kind: 'turn', amp: 1.5}, {t: SAME + 0.12, kind: 'turn', amp: 1.8}]},
  ],
  pip: {
    // Pip reads the line as it draws: the head steps down the slope with the line's head, a nod on "better"
    look: [
      {t: 0, v: -0.9},
      {t: 0.62, v: -0.76},
      {t: 1.18, v: -0.62},
      {t: 1.74, v: -0.48},
      {t: 2.3, v: -0.34},
    ],
    keys: [
      {t: 0, pose: 'sit-back'},
      {t: BETTER - 0.04, pose: 'sit-back'},
    ],
  },
};

const S4: React.FC = () => {
  const t = useTime();
  const z = breathe(t, DUR);
  return (
    <World sky={EMBER.wall}>
      <XG m={mat.about(mat.scale(z), S4_ANCHOR[0], S4_ANCHOR[1])}>
        <S4Street life={S4_LIFE}>
          <PriceChart drawAt={0.1} drawDur={2.3} />
        </S4Street>
      </XG>
    </World>
  );
};
export default S4;

/** Ink captions on the wall. */
export const captionTone: ToneKey[] = [{t: 0, tone: 'dark'}];
