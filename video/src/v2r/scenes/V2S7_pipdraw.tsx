// V2S7_pipdraw.tsx (lane L5): Pip in V2S7 (TREATMENT section 3: "S7 sit-watch at the board bollard (700, 1205), NO
// reaction"; map.ts PIP V2S7; kit/pip README "S7": idle={{flick: false}}).
//   S7PipHop   SCREEN space, 28.06-28.22: the second half of the hop across the S6 -> S7 cut (V2S7_pip pipHopAt,
//              side 'V2S7'): falling from the apex ON the cut onto the bollard, tucked; the facing turns from the
//              watcher's 3/4 back to backLeft on the way down.
//   S7PipSeat  WORLD space (inside the S7 camera), from 28.22: sits on the bollard (map BOARD_BOLLARD) at PIP_SIZE_S7,
//              facing backLeft (3/4 back, looking at the board: the pose L6 uses at her board in S8, A5), a short
//              landing squash (done before "Google" 28.36), then idle only: blink, ear sway, breath, scarf. No tilt,
//              no nod, no ear flick, no head turn on Google's beat.
import React from 'react';
import {useTime} from '../../lib/time';
import {BOARD_BOLLARD, B} from '../world/map';
import {Pip, FACING, poseParams, blendParams} from '../kit/pip';
import {pipHopAt, PIP_HOP, PIP_SIZE_S6, PIP_SIZE_S7, S7_T0, s7CamAt} from './V2S7_pip';

const SEED = 'pipS7';
/** The landing squash (shot-local s), ending before "Google" (0.30). */
const LAND = {t: PIP_HOP.t1 - S7_T0, dur: 0.12};
/** Where the seated Pip looks: the board's face, a little above its middle (a fixed target: no head turns). */
const LOOK_AT: [number, number] = [(B.x0 + B.x1) / 2 + 40, B.y0 + 250];
/** The canal breeze blows west (screen left) as in the other shots: the scarf tails lift toward the left. */
const WIND = -0.7;

export const S7PipHop: React.FC = () => {
  const t = useTime();
  const T = S7_T0 + t;
  const h = pipHopAt(T);
  if (!h || h.side !== 'V2S7') return null;
  const k = (T - PIP_HOP.tCut) / (PIP_HOP.t1 - PIP_HOP.tCut);
  const size = PIP_SIZE_S6 + (PIP_SIZE_S7 * s7CamAt(T).z - PIP_SIZE_S6) * k;
  // tucked in the fall, opening toward the landing pose in the last frames
  const pose = blendParams(poseParams('tuck'), poseParams('land'), Math.max(0, (k - 0.7) / 0.3));
  const yaw = FACING.back + (FACING.backLeft - FACING.back) * Math.min(1, k * 1.2);
  return <Pip x={h.x} y={h.y} size={size} pose={pose} facing={yaw} wind={WIND} squash={-0.08 * (1 - k)} idle={{amount: 0.6, flick: false}} seed={SEED} />;
};

export const S7PipSeat: React.FC = () => {
  const t = useTime();
  if (t < LAND.t) return null;
  const u = (t - LAND.t) / LAND.dur;
  const squash = u < 1 ? 0.2 * Math.sin(Math.PI * Math.min(1, u * 1.25)) * (1 - u * 0.3) : 0;
  const pose = u < 1.6 ? blendParams(poseParams('land'), poseParams('sit'), Math.min(1, Math.max(0, (u - 0.2) / 1.2))) : poseParams('sit');
  return (
    <Pip
      x={BOARD_BOLLARD.x}
      y={BOARD_BOLLARD.y}
      size={PIP_SIZE_S7}
      pose={pose}
      facing="backLeft"
      target={LOOK_AT}
      wind={WIND}
      squash={squash}
      idle={{flick: false}}
      seed={SEED}
    />
  );
};
