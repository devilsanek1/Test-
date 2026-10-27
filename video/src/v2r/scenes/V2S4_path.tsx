// V2S4_path.tsx (lane L3, V2S4 WORLD part): HER TOWPATH plane (1.0x) and the CANAL STRIP (1.0x), each drawn at the
// 17.96 pose and slid by its own truck offset (V2S4_rig `s4PlaneDx`).
//   S4Path   garden walls with gates, railings, a trellis and ivy; paving that is never flat (joints, patches, moss,
//            a drain, a manhole, leaves, some skittering east); the coping with rings and bollards; heritage lamps
//            (off), planters, a bin, two bikes, a lifebuoy, a bench with a reader (one page turn), an angler with his
//            rod, the heron beside him; the public (a jogger who overtakes her, a parent and toddler she passes, a
//            cyclist, a dog walker) all BEHIND her; then `children` = the fingerpost (V2S4_post), inside the plane
//   S4Canal  the water between her coping and our boat: the bank's broken reflections, ripples, glints, two ducks,
//            floating leaves, the angler's line and float
// Drawing: V2S4_wpath.tsx, V2S4_wcast.tsx, V2S4_wcanal.tsx; shared numbers: V2S4_wcore.ts.
import React from 'react';
import {XG, mat} from '../../lib/xf';
import {useTime} from '../../lib/time';
import {S4_K, s4PlaneDx} from './V2S4_rig';
import {PathPlane} from './V2S4_wpath';
import {Walkers} from './V2S4_wcast';
import {CanalPlane} from './V2S4_wcanal';

export const S4Path: React.FC<{children?: React.ReactNode}> = ({children}) => {
  const t = useTime();
  return (
    <XG m={mat.translate(s4PlaneDx(S4_K.path, t), 0)}>
      <PathPlane />
      <Walkers />
      {children}
    </XG>
  );
};

export const S4Canal: React.FC = () => {
  const t = useTime();
  return (
    <XG m={mat.translate(s4PlaneDx(S4_K.canal, t), 0)}>
      <CanalPlane />
    </XG>
  );
};
