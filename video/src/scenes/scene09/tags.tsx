// S09 PEAK-3 payoff (fix round 1): the EMPTY check-box tags over rows 0-3 at phone-readable size. TerraceHill's own
// wave (checkBoxWaveAt) draws them at 19 house units: 16 px on row 0 and specks from row 2 up, cream on cream facades,
// so 'one tick among hundreds of EMPTY boxes' only read through the flag. This overlay re-draws rows 0-3 at 26 units
// (x 1.4: 26 / 21 / 17 / 13 px), batched (props CheckBoxTags: cream card, ink outline + an EMPTY ink box, a one-frame
// +30 % pop), on the SAME hang point and the SAME row times as the set's wave, so they simply cover the small ones;
// rows 4+ stay the set's texture. House #4's tag is the one TICKED tag, at the same size.

import React from 'react';
import {CheckBoxTag, CheckBoxTags} from '../shared/props';
import type {CheckBoxSpot} from '../shared/props';
import {TERRACE} from '../shared/sets';

/** Tag width in house units (TerraceHill checkBox.size 19 x 1.4). */
export const BIG_TAG = 26;
/** Hang point in house units (1.2 units above the set's, so the bigger card covers the set's card corner). */
const HANG: [number, number] = [TERRACE.checkBox.hang[0], TERRACE.checkBox.hang[1] - 1.2];
/** TerraceHill's stair column per row (no house where the stair climbs, rows 1-6). */
const stairX = (k: number) => 612 + (k % 2 ? 1 : -1) * 6 * Math.pow(0.8, k);

function rowSpots(k: number, at: number): CheckBoxSpot[] {
  const R = TERRACE.rows[k];
  const u = R.w / 90;
  const out: CheckBoxSpot[] = [];
  const j0 = Math.floor((-80 - R.x0) / R.w);
  const j1 = Math.ceil((1160 - R.x0) / R.w);
  for (let j = j0; j <= j1; j++) {
    const x = R.x0 + j * R.w;
    const cx = x + R.w / 2;
    if (cx < -60 || cx > 1140) continue;
    if (k === 0 && j === 0) continue; // house #4: the ticked one (below)
    if (k >= 1 && k <= 6 && Math.abs(cx - stairX(k)) < R.w * 0.5) continue;
    out.push({x: x + HANG[0] * u, y: R.top + HANG[1] * u, size: BIG_TAG * u, at});
  }
  return out;
}

/** The rows 0-3 tag wave, row k at `at + k * step` (pass TerraceHill's checkBoxWaveAt / checkBoxStep). */
export const BigTags: React.FC<{at: number; step: number}> = ({at, step}) => {
  const near = [...rowSpots(0, at), ...rowSpots(1, at + step)];
  const far = [...rowSpots(2, at + 2 * step), ...rowSpots(3, at + 3 * step)];
  const H4 = TERRACE.house4;
  return (
    <>
      <CheckBoxTags spots={far} ink={1.6} inkFrom={8} boxFrom={10} />
      <CheckBoxTags spots={near} ink={2.1} inkFrom={8} boxFrom={10} />
      <CheckBoxTag x={H4.facade[0] + HANG[0]} y={H4.facade[1] + HANG[1]} size={BIG_TAG} ticked at={at} ink={2.4} seed="s9h4tag" />
    </>
  );
};
