// S6 (S4 pilot lane, G5b): INSERT, EXACTLY the S4 frame, 11.48-16.60 ("But this past year, in the US, computers went up
// almost 10%."). Locked board (animatic S6): S4's card, title, axes, "2005" and the drawn line; the only change on the
// chart is the hook turning UP at the line's end (board: from "US," 12.92 for 1.2 s, ending on "went") and "+9.7%" on
// "almost10%" (14.84). Each leads its word by 0.1 s (ENGINE rule 5). Camera: the same 1.5 % breathe about the same
// point as S4. G5b: the same street set (S4_street, S4's set and dressing to the pixel at the cut); the audience's
// reaction carries the change (density_plan_g5b S6): a sixth person squeezes in, heads lean in on "US", the row
// recoils on "up" (the phone drops, an arm points at the hook, Pip goes trunk-up), "+9.7%" pops alone, then settling.
import React from 'react';
import {World} from '../../../lib/World';
import type {ToneKey} from '../../../lib/Film';
import {useTime} from '../../../lib/time';
import {mat, XG} from '../../../lib/xf';
import {EMBER} from '../kit';
import {breathe, S4_ANCHOR, S4Street, type StreetLife} from './S4_street';
import {S4_LIFE} from './S4';
import {PriceChart} from './S4_chart';

const START = 11.48;
const DUR = 16.6 - START;
/** "US," 12.92 and "almost10%" 14.84 (VO), led by 0.1 s. */
const HOOK_AT = 12.92 - START - 0.1;
const LABEL_AT = 14.84 - START - 0.12;
/** "US" 12.92, "up" 14.52 (VO), panel-local. */
const US = 12.92 - START;
const UP = 14.52 - START;
/** Nothing new may start in [LABEL_AT, LABEL_AT + 0.25]: "+9.7%" pops alone. */
const SETTLE = LABEL_AT + 0.32;

const s4row = S4_LIFE.row ?? [];
/** Each back as in S4 (same hair, coat, accessories, place), with S6's own moves. */
const row = (i: number, extra: object) => ({...s4row[i], moves: [], ...extra});

const S6_LIFE: StreetLife = {
  headlights: [0.25, 4.32],
  keeper: [[-1, 0.9], [3.7, 6]],
  slides: [0.5, 1.4, 2.3, 4.0, 4.9],
  upperSpeed: 0.4,
  flutterAt: [UP + 0.05],
  bellAt: [3.62],
  birdsLift: SETTLE + 0.05,
  lampSnowAt: 4.72,
  squeezeAt: 0.72,
  squeeze: {hair: 'beanie', coat: EMBER.reveal, hat: EMBER.dc, wear: ['earmuffs'], moves: [{t: US + 0.1, kind: 'lean', amp: 1.2}, {t: UP + 0.1, kind: 'recoil', amp: 1.2}]},
  row: [
    row(0, {moves: [{t: 0.35, kind: 'turn', amp: 1.4}, {t: US, kind: 'lean', amp: 1.3}, {t: UP, kind: 'recoil', amp: 1.3}, {t: SETTLE + 0.4, kind: 'turn', amp: 1.6}]}),
    row(1, {moves: [{t: US + 0.08, kind: 'lean', amp: 1.3}, {t: UP + 0.03, kind: 'recoil', amp: 1.3}, {t: SETTLE + 0.1, kind: 'turn', amp: 1.8, dir: 1}]}),
    // the phone came up on "Laptops" in S4: it drops on "up" and the arm points at the hook
    row(2, {phoneWin: [-1, UP], wear: ['point'], pointAt: UP + 0.1, moves: [{t: US + 0.16, kind: 'lean', amp: 1.3}, {t: UP + 0.07, kind: 'recoil', amp: 1.5}, {t: SETTLE + 0.18, kind: 'turn', amp: 1.8, dir: -1}]}),
    row(3, {moves: [{t: 1.0, kind: 'turn', amp: 1.4}, {t: US + 0.24, kind: 'lean', amp: 1.3}, {t: UP + 0.1, kind: 'recoil', amp: 1.3}]}),
    row(4, {moves: [{t: US + 0.32, kind: 'lean', amp: 1.3}, {t: UP + 0.13, kind: 'recoil', amp: 1.3}, {t: SETTLE + 0.7, kind: 'turn', amp: 1.6}]}),
  ],
  pip: {
    // from S4's last look, Pip follows the hook up; trunk-up on "up"; then it turns to us, worried
    look: [
      {t: 0, v: -0.34},
      {t: 1.5, v: -0.3},
      {t: 2.1, v: -0.22},
    ],
    keys: [
      {t: 0, pose: 'sit-back'},
      {t: UP + 0.08, pose: 'trunk-up'},
      {t: SETTLE + 0.25, pose: 'sit-front', expression: 'worried'},
    ],
  },
};

const S6: React.FC = () => {
  const t = useTime();
  const z = breathe(t, DUR);
  return (
    <World sky={EMBER.wall}>
      <XG m={mat.about(mat.scale(z), S4_ANCHOR[0], S4_ANCHOR[1])}>
        <S4Street life={S6_LIFE}>
          <PriceChart hookAt={HOOK_AT} hookDur={1.2} labelAt={LABEL_AT} />
        </S4Street>
      </XG>
    </World>
  );
};
export default S6;

/** Ink captions on the wall. */
export const captionTone: ToneKey[] = [{t: 0, tone: 'dark'}];
