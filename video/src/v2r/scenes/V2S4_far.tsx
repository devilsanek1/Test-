// V2S4_far.tsx (lane L3, V2S4 WORLD part): the far band behind her towpath, drawn at the 17.96 pose and slid by its
// plane's truck offset (V2S4_rig `s4PlaneDx`). S4Far (0.3x): far roof rows, the gasholder frame the sun is seen through,
// the viaduct with a train, aerials, birds on the gasholder ring (the flock that flies WEST into the sun at 19.78).
// S4Backs (0.6x): the terrace backs over the garden walls (rear sashes, a few warmly lit, back extensions, drainpipes,
// stacks with smoke, a washing line, an autumn tree, ivy, pigeons), a warehouse at the west end and an allotment yard in
// the sun's gap. Drawing: V2S4_wfar.tsx, V2S4_wbacks.tsx; shared numbers: V2S4_wcore.ts.
import React from 'react';
import {useTime} from '../../lib/time';
import {XG, mat} from '../../lib/xf';
import {S4_K, s4PlaneDx} from './V2S4_rig';
import {FarPlane} from './V2S4_wfar';
import {BacksPlane} from './V2S4_wbacks';

export const S4Far: React.FC = () => {
  const t = useTime();
  return (
    <XG m={mat.translate(s4PlaneDx(S4_K.far, t), 0)}>
      <FarPlane />
    </XG>
  );
};

export const S4Backs: React.FC = () => {
  const t = useTime();
  return (
    <XG m={mat.translate(s4PlaneDx(S4_K.backs, t), 0)}>
      <BacksPlane />
    </XG>
  );
};
