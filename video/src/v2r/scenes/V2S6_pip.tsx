// V2S6_pip.tsx (lane L5): Pip in S6 (conform_L5.md section 2; map.ts S6.pipSeat0 / pipH / pipEarFlickAt): seated on the
// paving at the deal board's foot from the first frame, STILL (the column of S5's tiny Pip, swapped in by the blossom
// tree's wipe), looking up at the board (3/4 back); its ONE reaction: an ear flick on "veto" 26.50 (no droop). The
// idle never flicks on its own (idle={{flick: false}}). No arrival, no hop out: the push-through into SUN2 sweeps it.
// Its head stays >= 200 px under the clause's last line (map S6.clauseBottomMaxY) and it is out of the right rail.
// Clock: the scene's inner clock (V2S6 wraps its body in <TimeShift by={0.2}>: t = film - 24.00).
import React from 'react';
import {PipTrack} from '../kit/pip';
import {S6} from '../world/map';
import {W6, T0} from './V2S6_rig';

/** Where Pip looks: the board's face, above its middle (a fixed target: it watches the record). */
const LOOK_AT: [number, number] = [(S6.board0.x0 + S6.board0.x1) / 2, S6.board0.y0 + 230];

export const S6PipSeat: React.FC = () => (
  <PipTrack
    x={S6.pipSeat0.x}
    y={S6.pipSeat0.y}
    size={S6.pipH}
    pose="sit"
    facing="back"
    idle={{flick: false}}
    seed="s6pip"
    keys={[
      {t: -1, target: LOOK_AT, wind: 0.4},
      {t: S6.pipEarFlickAt - T0, flick: 'A'},
    ]}
  />
);
/** (kept for the report: the flick's inner time = W6.veto) */
export const S6_PIP_FLICK_T = W6.veto;
