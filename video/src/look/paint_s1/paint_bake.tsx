// The bake's inputs for S1 (lib/paint/bake.tsx; NOTES.md "the bake"): each painted piece's FLAT shapes alone on a
// transparent 1080 x 1920 frame, in their layer's own px (the camera at rest), in the contexts the scene draws them in
// (v2's switches, the tier, RIG_CANAL), with their light layers (the form shades the paint takes over):
//   sky    the S1_EVENING sky (lib/sky <Sky>), the whole frame
//   tree   the bay tree (trunk + crown + its inner lobes) and v2's crescent form shade on the crown
//   pier   the stone pier (body, coping, the thyme pot) and its two Shade steps
//   farroofs, fartower   the west gap's far roofs and the calm tower (v2 set)
//   fern   the big fern pot at the bottom edge and its form shade (v2 set)
// Rendered once (t = 1.0 s, after the flood) by scripts/look/paint/bake_v2s1.sh.
import React from 'react';
import {PaintBakeFrame} from '../../lib/paint';
import {Sky} from '../../lib/sky';
import {Lit} from '../../lib/light';
import {Tier} from '../../lib/tier';
import {RIG_CANAL} from '../../v2r/world/rigs';
import {PosterSwitchProvider, resolveSwitches} from './switches';
import {s1Sky} from './V2S1_sky';
import {PlanterTree, Pier, PierShades, TreeCrescent, FernPot, FrontForm} from './V2S1_fore';
import {FarRoofs, CalmTower} from './V2S1_set_far';

export type PaintFlatS1Props = {piece: 'sky' | 'tree' | 'pier' | 'farroofs' | 'fartower' | 'fern'};

export const PaintFlatS1: React.FC<PaintFlatS1Props> = ({piece}) => {
  const sw = resolveSwitches({preset: 'v2'});
  return (
    <PosterSwitchProvider value={sw}>
      <PaintBakeFrame width={1080} height={1920}>
        <Lit rig={RIG_CANAL}>
          {piece === 'sky' ? <Sky spec={s1Sky(false)} /> : null}
          {piece === 'tree' ? (
            <>
              <Tier tier="environment">
                <PlanterTree />
              </Tier>
              <TreeCrescent />
            </>
          ) : null}
          {piece === 'farroofs' ? (
            <Tier tier="environment">
              <FarRoofs />
            </Tier>
          ) : null}
          {piece === 'fartower' ? (
            <Tier tier="environment">
              <CalmTower />
            </Tier>
          ) : null}
          {piece === 'fern' ? (
            <>
              <Tier tier="environment">
                <FernPot />
              </Tier>
              <FrontForm />
            </>
          ) : null}
          {piece === 'pier' ? (
            <>
              <Tier tier="environment">
                <Pier />
              </Tier>
              <PierShades />
            </>
          ) : null}
        </Lit>
      </PaintBakeFrame>
    </PosterSwitchProvider>
  );
};
