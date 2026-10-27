// V2S8 "Her words" (lane L6). Film 32.93-39.08 s; TREATMENT.md sections 3-5 (row S8), 8 (fairness, Q9), map.ts S8.
// The LANE along her towpath, looking west at sunset: the cafe boat moored left with its quote-of-the-day A-board,
// her towpath running to the bend, her house at the bend facing down the lane (teal door, W above-right of it).
//   -0.23-0.23  S7's narrowboat wipes in (travelling west); Pip rides its stern deck in and leaps to the board bollard
//   0.23 "She": SHE SAYS pops on the board (clack); she walks home · 0.85 "can't": three ghosts pop ahead of her,
//   Pip's ears down · 1.57 she reaches her door · 1.82 it shuts, the ghosts stay · 2.02 W lights
//   2.06-2.67 ONE plain truck left (inside the pause; multiplane, V2S8_clock) · 2.79 "her words": the cafe owner
//   wipes the board clean in one stroke · 3.61 the quote pen-draws on · 4.25 "facts": the lamps light in a run west
//   down the lane, two neighbours stop to read · 4.77 "not": Pip looks up at W; the seam push 1.00 -> 1.05 about W
//   5.89-6.15 the engine un-builds S8 onto S1's t < 0 bare-line state (the sky slab dropped, the ghosts and W last,
//   Pip hops onto S1's f0 bollard in colour and becomes S1's frame-0 Pip).
// Parts (each its own file): V2S8_clock (times, planes, bands, camera), V2S8_set (sun, far, south bank, water, the
// cafe boat, the lane's ground bands, the near band), V2S8_house (her house and the terrace at the bend, W, her door,
// lamps and the lamp run), V2S8_board (her board, its bollard, the cafe owner, the readers), V2S8_cast (her, the
// ghosts, the public), V2S8_pip (Pip), V2S8_exit (the un-build order).
import React from 'react';
import {World} from '../../lib/World';
import {useExit} from '../../lib/exit';
import {useTime} from '../../lib/time';
import {XG, mat} from '../../lib/xf';
import {skyBands} from '../palette';
import * as MAP from '../world/map';
import {CanalCast} from '../kit/canal/slots';
import {k4Person} from '../kit/canal/k4k5';
import type {ToneKey} from '../../lib/Film';
import {floatXY, seamZoom} from './V2S8_clock';
import {S8Sky, S8Far, S8South, S8Water, S8Boat, S8Ground, S8Front} from './V2S8_set';
import {S8House, S8Window, S8DoorLeaf} from './V2S8_house';
import {S8Board, S8Readers} from './V2S8_board';
import {S8Her, S8GhostsLayer, S8Public} from './V2S8_cast';
import {S8Pip} from './V2S8_pip';

export const captionTone: ToneKey[] = [{t: 0, tone: 'dark'}];

const V2S8: React.FC = () => {
  const t = useTime();
  const e = useExit();
  // the seam push about W (1.00 until 37.70, 1.05 from 38.82) after the 2D float (zero whenever a move runs): every part
  // draws at the landing pose inside it
  const [fx, fy] = floatXY(t);
  const cam = mat.mul(mat.translate(fx, fy), mat.about(mat.scale(seamZoom(t)), MAP.W.x, MAP.W.y));
  return (
    <World sky={e > 0 ? 'transparent' : skyBands('sunset', true)} horizon={900}>
      <XG m={cam}>
        <CanalCast person={k4Person}>
          <S8Sky />
          <S8Far />
          <S8South />
          <S8Water />
          <S8House />
          <S8Window />
          <S8Boat />
          <S8Ground />
          <S8Public />
          <S8Her />
          <S8DoorLeaf />
          <S8GhostsLayer />
          <S8Board />
          <S8Front />
          <S8Readers />
          <S8Pip />
        </CanalCast>
      </XG>
    </World>
  );
};
export default V2S8;
