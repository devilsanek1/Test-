// S12_props (lane S12, G5b fix pass): the desk's cool-share copies of O1's things, shared by S12 and S7 (the same desk,
// so they match across the two closes): O1's planner CLOSED in a dusk-blue cover and O1's radio in dusk blue.
import React from 'react';
import {Fill} from '../../../lib/Fill';
import {Ink} from '../../../lib/Ink';
import {circle, line, polyPath, roundRect} from '../../../lib/sketch';
import {EMBER, W} from '../kit';

/** O1's planner, CLOSED, with a dusk-blue cloth cover (an S12 copy: the cool share), an elastic band and a ribbon
 *  tail; cut by the bottom-right corner. */
export const ClosedPlanner: React.FC<{x: number; y: number}> = ({x, y}) => {
  const cover = polyPath([[x, y], [x + 400, y - 30], [x + 432, y + 330], [x + 10, y + 356]]);
  const pages = polyPath([[x + 400, y - 30], [x + 414, y - 22], [x + 446, y + 334], [x + 432, y + 330]]);
  return (
    <>
      <Fill d={pages} color={EMBER.card} seed="s12/cpP" />
      <Fill d={cover} color={EMBER.dc} seed="s12/cpC" />
      <Fill d={polyPath([[x + 330, y - 25], [x + 352, y - 27], [x + 384, y + 333], [x + 362, y + 335]])} color={EMBER.dcSide} offset={false} />
      <Fill d={polyPath([[x + 120, y + 60], [x + 250, y + 50], [x + 256, y + 116], [x + 126, y + 126]])} color={EMBER.frost} offset={false} />
      <Ink d={line(x + 140, y + 82, x + 236, y + 74, {over: [0, 0], seed: 's12/cpL1'}) + line(x + 142, y + 102, x + 210, y + 97, {over: [0, 0], seed: 's12/cpL2'})} width={1.4} />
      <path d={polyPath([[x + 16, y + 14], [x + 384, y - 14], [x + 414, y + 316], [x + 26, y + 340]])} stroke={EMBER.skyLow} strokeWidth={2} strokeDasharray="8 7" fill="none" />
      <Ink d={cover + pages} width={W.mid} />
      <Fill d={polyPath([[x + 60, y + 354], [x + 72, y + 353], [x + 66, y + 400], [x + 54, y + 398]])} color={EMBER.books[4]} offset={false} />
    </>
  );
};

/** O1's little radio, an S12 copy in dusk blue (snow grille panel, warm dial): the cool share. */
export const DuskRadio: React.FC<{x: number; y: number; w?: number}> = ({x, y, w = 116}) => {
  const h = w * 0.66;
  const body = roundRect(x, y - h, w, h, 12);
  const grille = [0, 1, 2, 3, 4].map((i) => line(x + 14, y - h + 22 + i * 10, x + w * 0.5, y - h + 22 + i * 10, {over: [0, 0], seed: `s12/gr${i}`})).join('');
  return (
    <>
      <Ink d={line(x + w * 0.78, y - h, x + w * 0.98, y - h - 96, {over: [0, 0], seed: 's12/ant'})} width={W.far} />
      <Fill d={body} color={EMBER.dc} seed="s12/radio" />
      <Fill d={roundRect(x + 8, y - h + 12, w * 0.5, h - 26, 6)} color={EMBER.frost} offset={false} />
      <Fill d={circle(x + w * 0.76, y - h * 0.52, w * 0.13)} color={EMBER.card} offset={false} />
      <Fill rect={[x + 10, y - 6, w - 20, 8]} color={EMBER.beam} offset={false} />
      <Ink d={body + circle(x + w * 0.76, y - h * 0.52, w * 0.13)} width={W.far} />
      <Ink d={grille} width={1.4} color={EMBER.dc} />
      <Ink d={line(x + w * 0.76, y - h * 0.52, x + w * 0.83, y - h * 0.62, {over: [0, 0], seed: 's12/needle'})} width={W.hair} />
    </>
  );
};
