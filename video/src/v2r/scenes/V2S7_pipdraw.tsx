// V2S7_pipdraw.tsx (lane L5): Pip in V2S7 (TREATMENT section 3: "S7 sit-watch at the board bollard (700, 1205), NO
// reaction"; conform_L5.md section 3: seated from the first frame, the S6 -> S7 hop retired; kit/pip README "S7":
// idle={{flick: false}}).
//   S7PipSeat  WORLD space (inside the S7 camera, the subject's plane): sits on the bollard (map BOARD_BOLLARD) at
//              PIP_SIZE_S7, facing backLeft (3/4 back, looking at the board: the pose L6 uses at her board in S8, A5),
//              idle only: blink, ear sway, breath, scarf. No tilt, no nod, no ear flick, no head turn on Google's beat
//              (V14). It stays seated, unmoved, until the narrowboat's bow covers it (~32.83; S8 owns Pip from the stern).
import React from 'react';
import {BOARD_BOLLARD, B} from '../world/map';
import {Pip} from '../kit/pip';
import {PIP_SIZE_S7} from './V2S7_pip';

const SEED = 'pipS7';
/** Where the seated Pip looks: the board's face, a little above its middle (a fixed target: no head turns). */
const LOOK_AT: [number, number] = [(B.x0 + B.x1) / 2 + 40, B.y0 + 250];
/** The canal breeze blows west (screen left) as in the other shots: the scarf tails lift toward the left. */
const WIND = -0.7;

export const S7PipSeat: React.FC = () => (
  <Pip x={BOARD_BOLLARD.x} y={BOARD_BOLLARD.y} size={PIP_SIZE_S7} pose="sit" facing="backLeft" target={LOOK_AT} wind={WIND} idle={{flick: false}} seed={SEED} />
);
