// v7_s1: v7's scene 1, the composer (from src/look/light_s1/LightV2S1.tsx: the sky, the Look cascade, the world, the
// particles) with v7's three steps of the first half (ORGANIC.md §6):
//   step 4 (the cut)    V7World draws only what T1/T3 keeps (run first)
//   step 1 (the key)    the whole world under ONE colour map at the source (lib/tod <Tod map={keyV7}>: every <Fill> and
//                       kit Batch passes its colour through it before the clean pen's calm; her excepted, the lobby
//                       on the accent map); the clean pen's page (PEN.bg) is v7's caption field, so the calm tiers pull
//                       toward the sky they sit under; the painted pieces come keyed from the painter (paint_set.ts)
//   step 2 (the light)  the dusk rig (no day casts: a sun on the roofline puts the near ground in shade, and nothing in
//                       a shade mass casts a sun shadow; contact and form shades kept; the wing's fin shades off: the
//                       backlit facade's shade is the baked subject map's), the slots' baked maps, the movers' live light
import React from 'react';
import {World} from '../../lib/World';
import {Look} from '../../lib/exit';
import {Lit} from '../../lib/light';
import {Tod} from '../../lib/tod';
import {RIG_CANAL} from '../../v2r/world/rigs';
import {CM} from '../../v2r/palette';
import {FLOOD, FLOOD_ORIGIN, S1_PALE} from '../paint_s1/V2S1_clock';
import {SkyFlood} from '../paint_s1/V2S1_sky';
import {useSwitches} from '../paint_s1/switches';
import {shadeRig, TextureSlot} from '../paint_s1/engine';
import {useTime} from '../../lib/time';
import {PARALLAX_SKY} from '../../lib/depth';
import {v6Rig} from '../paint_s1/v6';
import {duskS1Rig} from '../light_s1/LightV2S1';
import {CM_V2} from '../paint_s1/palette_10b';
import {keyV7} from './palette_v7';
import {litLook, Seg, useKeyed, useV7} from './context';
import {V7World} from './V7World';
import {HerLit, PipLit} from './movers';
import {V7Particles} from './V7Particles';

/** The bake's marker: the lit panes (v2's lamp role) pure green, the rest keyed. */
const MARK = CM_V2.lamp.toUpperCase();
const markerV7 = (c: string) => (c && c.toUpperCase() === MARK ? '#00FF00' : keyV7(c));

/** The key around a subtree (looks 'key', 'v7a' and 'v7'); look 'cut' draws v6's colours. */
const Keyed: React.FC<{children?: React.ReactNode}> = ({children}) => {
  const keyed = useKeyed();
  const {marker} = useV7();
  return keyed ? <Tod map={marker ? markerV7 : keyV7}>{children}</Tod> : <>{children}</>;
};

export const V7Scene: React.FC<{slab?: string}> = ({slab}) => {
  const sw = useSwitches();
  const t = useTime();
  const {look} = useV7();
  const v6 = v6Rig(shadeRig(sw, RIG_CANAL, CM.shadeWarm));
  const rig = litLook(look) ? duskS1Rig(v6) : v6;
  return (
    <World sky={slab ?? CM.white} horizon={1000}>
      <Lit rig={rig}>
        <TextureSlot sw={sw} t={t} plane={PARALLAX_SKY} sky>
          <Seg name="sky">
            <SkyFlood />
          </Seg>
        </TextureSlot>
        <Look cascade={{at: FLOOD.t0, origin: FLOOD_ORIGIN, speed: FLOOD.speed, pale: S1_PALE, paper: CM.white}}>
          <Keyed>
            <V7World towpath={<HerLit />} pip={<PipLit />} />
          </Keyed>
        </Look>
        <Seg name="particles">
          <Keyed>
            <V7Particles />
          </Keyed>
        </Seg>
      </Lit>
    </World>
  );
};
