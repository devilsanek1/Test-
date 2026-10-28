// V2S4_path.tsx (lane L3, V2S4 WORLD part): HER TOWPATH plane (1.0x) and the CANAL STRIP (1.0x), each drawn at the
// 17.96 pose and slid by its own truck offset (V2S4_rig `s4PlaneDx`).
//   S4Path   (tier C) garden walls with gates, railings, roses and ivy; flagstones laid out from S4_CAM; the coping and
//            its bollards; heritage lamps (off), a planter, a bin, a lifebuoy, a bench with a reader, an angler, the
//            heron (all still); the parent and toddler she passes (tier B) BEHIND her; the towpath's one ShadowLayer;
//            then `children` = the fingerpost (V2S4_post, tier A), inside the plane
//   S4Canal  the canal strip between her coping and our boat: lib/water's canal (V2S4_water: reflections, ripples, SUN1's glitter), two ducks,
//            the angler's line and float (still)
// Drawing: V2S4_wpath.tsx, V2S4_wcast.tsx, V2S4_wcanal.tsx; shared numbers: V2S4_wcore.ts.
import React from 'react';
import {XG, mat} from '../../lib/xf';
import {useTime} from '../../lib/time';
import {S4_K, s4PlaneDx} from './V2S4_rig';
import {Tier} from '../../lib/tier';
import {CM} from '../palette';
import {PathPlane} from './V2S4_wpath';
import {CanalPlane} from './V2S4_wcanal';

export const S4Path: React.FC<{children?: React.ReactNode}> = ({children}) => {
  const t = useTime();
  return (
    <XG m={mat.translate(s4PlaneDx(S4_K.path, t), 0)}>
      <Tier tier="environment" bg={CM.paving}>
        <PathPlane />
      </Tier>
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
