// light_s1: v6's scene 1 under PROPER LIGHT (light_proof.md). A copy of src/look/paint_s1/V2S1.tsx (the composer: the
// sky, the Look cascade, the world, the particles) with this folder's world and bank (their light slots), her and Pip
// as movers with live light (./movers.tsx), and the dusk rig:
//   look 'v6'          v6's rig (paint_s1 v6.tsx v6Rig): the tree is v6's exactly
//   'light' / 'full'   the same rig with NO cast shadows (light.md §6.3 weak spot 1: v6's day casts of a sun at 36 deg
//                      under a sunset sky whose sun sits at 8.9 deg; in the dusk plan the near ground lies in shade, and a
//                      thing in shade casts no sun shadow) and without the wing's fin shades (the facade is backlit: its
//                      shade is the baked subject map's); contact shadows and form shades stay (ambient occlusion holds
//                      under any light)
// In a parts render (the bake) the World's slab is the given colour (black or white: the bake's matte) and nothing
// but the named segments draws.
import React from 'react';
import {World} from '../../lib/World';
import {Look} from '../../lib/exit';
import {Lit, type LightRig} from '../../lib/light';
import {RIG_CANAL} from '../../v2r/world/rigs';
import {CM} from '../../v2r/palette';
import {FLOOD, FLOOD_ORIGIN, S1_PALE} from '../paint_s1/V2S1_clock';
import {SkyFlood} from '../paint_s1/V2S1_sky';
import {S1HerBehindDoor} from '../paint_s1/V2S1_row';
import {S1Particles} from '../paint_s1/V2S1_particles';
import {useSwitches} from '../paint_s1/switches';
import {shadeRig, TextureSlot} from '../paint_s1/engine';
import {useTime} from '../../lib/time';
import {PARALLAX_SKY} from '../../lib/depth';
import {v6Rig} from '../paint_s1/v6';
import {Seg, useLightS1} from './context';
import {LightS1World} from './LightS1World';
import {LightS1Steps} from './LightS1Steps';
import {HerLit, PipLit} from './movers';

/** v6's rig, and the dusk rig: the same with no casts (a white cast tint multiplies nothing). */
export const duskS1Rig = (rig: LightRig): LightRig => ({...rig, tints: {...rig.tints, cast: '#FFFFFF'}});

export const LightV2S1: React.FC<{slab?: string}> = ({slab}) => {
  const sw = useSwitches();
  const t = useTime();
  const {look} = useLightS1();
  const v6 = v6Rig(shadeRig(sw, RIG_CANAL, CM.shadeWarm));
  const rig = look === 'v6' ? v6 : duskS1Rig(v6);
  return (
    <World sky={slab ?? CM.white} horizon={1000}>
      <Lit rig={rig}>
        <TextureSlot sw={sw} t={t} plane={PARALLAX_SKY} sky>
          <Seg name="sky">
            <SkyFlood />
          </Seg>
        </TextureSlot>
        <Look cascade={{at: FLOOD.t0, origin: FLOOD_ORIGIN, speed: FLOOD.speed, pale: S1_PALE, paper: CM.white}}>
          <LightS1World
            behindDoor={
              <Seg name="her">
                <S1HerBehindDoor />
              </Seg>
            }
            towpath={<HerLit />}
            seated={<LightS1Steps />}
            pip={<PipLit />}
          />
        </Look>
        <Seg name="particles">
          <S1Particles />
        </Seg>
      </Lit>
    </World>
  );
};
