// Scene 1, still v3 ("She quit Google."): v2's S1 view in our v2 look with the look test's pass-2 lessons, the camera at
// human height on OUR steps, close to her (docs/studies/2026-10-28_city_posters/scene_rethink/NOTES.md "still_v3").
//   the sky      V3_sky, in SCREEN px: v2's gentle evening gradient re-fit to the lower horizon, the warm cloud bank
//                (above and below the caption band, never across its text), long strata round the low sun, birds
//   the world    v2's S1World (this folder's copy of the look test's), drawn V3_SHIFT px lower: the west gap and the
//                far city, the bridge, Google's canal wing, the water and its boats; its `towpath` slot is the full far
//                street (V3_street), its `seated` slot our bank and her (V3_near), its `pip` slot the waterline bollard
//                (Pip itself hidden on the boat: V3Pip); nobody behind the glass door, no ghost row
//   the spray    the near autumn leaves in the top-left gutter (v2's size), in SCREEN px
// Light: <Lit rig={RIG_CANAL}> (the sun low left, shadows right and a little toward us), the subject's form step.
// The frame-0 machinery is kept (the Look cascade from the sun, the sky's flood), so the still can move later.
import React from 'react';
import {World} from '../../lib/World';
import {Look} from '../../lib/exit';
import {Lit} from '../../lib/light';
import {RIG_CANAL} from '../../v2r/world/rigs';
import {CM} from '../../v2r/palette';
import type {ToneKey} from '../../lib/Film';
import {useTime} from '../../lib/time';
import {PARALLAX_SKY} from '../../lib/depth';
import {FLOOD, FLOOD_ORIGIN, S1_PALE} from './V2S1_clock';
import {S1World, V3Spray} from './V2S1_set';
import {S1Pip} from './V2S1_pip';
import {S1Particles} from './V2S1_particles';
import {useSwitches} from './switches';
import {shadeRig, TextureSlot} from './engine';
import {V3Sky} from './V3_sky';
import {V3FarStreet} from './V3_street';
import {V3Near, V3Pip} from './V3_near';
import {V3_SHIFT} from './V3_layout';

export const captionTone: ToneKey[] = [{t: 0, tone: 'dark'}];

const V3S1: React.FC = () => {
  const sw = useSwitches();
  const t = useTime();
  return (
    <World sky={CM.white} horizon={1000 + V3_SHIFT}>
      <Lit rig={shadeRig(sw, RIG_CANAL, CM.shadeWarm)}>
        {/* the sky (screen px; the sky plane's mottle, no float) */}
        <TextureSlot sw={sw} t={t} plane={PARALLAX_SKY} sky>
          <V3Sky />
        </TextureSlot>
        {/* v2's world, V3_SHIFT lower (world px inside) */}
        <g transform={`translate(0 ${V3_SHIFT})`}>
          <Look cascade={{at: FLOOD.t0, origin: FLOOD_ORIGIN, speed: FLOOD.speed, pale: S1_PALE, paper: CM.white}}>
            <S1World
              towpath={<V3FarStreet />}
              seated={<V3Near />}
              pip={
                <>
                  <S1Pip />
                  <V3Pip />
                </>
              }
            />
          </Look>
          <S1Particles />
        </g>
        <Look cascade={{at: FLOOD.t0, origin: [FLOOD_ORIGIN[0], FLOOD_ORIGIN[1] + V3_SHIFT], speed: FLOOD.speed, pale: S1_PALE, paper: CM.white}}>
          <V3Spray />
        </Look>
      </Lit>
    </World>
  );
};
export default V3S1;
