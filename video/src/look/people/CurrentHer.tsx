// Our CURRENT her, exactly as the scene-1 v3 still draws her (src/look/scene1_v3 V3Her under the look test's pass-2
// switches and the canal rig), at any height: the "before" of the people recipe's proof sheet. Read-only use of that
// folder: nothing here changes it.
import React from 'react';
import {Lit} from '../../lib/light';
import {RIG_CANAL} from '../../v2r/world/rigs';
import {CM} from '../../v2r/palette';
import {V3Her} from '../scene1_v3/V2S1_row';
import {PosterSwitchProvider, resolveSwitches} from '../scene1_v3/switches';
import {applyPalette, applyPen, shadeRig} from '../scene1_v3/engine';

export const CurrentHer: React.FC<{x: number; y: number; h: number}> = ({x, y, h}) => {
  const sw = resolveSwitches({preset: 'pass2'});
  applyPalette(sw);
  applyPen(sw, 1.6);
  return (
    <PosterSwitchProvider value={sw}>
      <Lit rig={shadeRig(sw, RIG_CANAL, CM.shadeWarm)}>
        <V3Her x={x} y={y} h={h} step={2.5} turn={0} />
      </Lit>
    </PosterSwitchProvider>
  );
};
