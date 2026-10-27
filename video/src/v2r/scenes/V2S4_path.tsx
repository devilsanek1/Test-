// V2S4_path.tsx (lane L3, V2S4 WORLD part): her towpath plane (1.0x: paving, garden walls, lamps, bench + reader,
// planters, bin, bike, lifebuoy, coping with rings and bollards, an angler, walkers she passes, a jogger, a cyclist, a
// dog) with the post as `children` (drawn inside the plane after the props), and the canal strip y 1082-1220 (1.0x:
// water, ducks, the heron, floating leaves). STUB: the world build replaces it.
import React from 'react';
import {XG, mat} from '../../lib/xf';
import {useTime} from '../../lib/time';
import {S4_K, s4PlaneDx} from './V2S4_rig';

export const S4Path: React.FC<{children?: React.ReactNode}> = ({children}) => {
  const t = useTime();
  return <XG m={mat.translate(s4PlaneDx(S4_K.path, t), 0)}>{children}</XG>;
};
export const S4Canal: React.FC = () => null;
