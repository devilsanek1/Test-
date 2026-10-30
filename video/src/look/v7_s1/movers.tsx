// v7_s1: the MOVERS (organic/light.md §4.0 home 3; light_proof.md §2.3, from src/look/light_s1/movers.tsx): her and Pip
// are drawn by their own components (paint_s1's S1Row; ./V7Props V7Pip on boat A's roof); in look 'v7a' their light is
// computed every frame from that same drawing (lib/light2's live layers), so it follows every pose with no keys:
//   her   the door's pool with her shadows from the lobby's three lamps cut out of it, her backlit shade, the sun's gold
//         rim on her front, the lit opening's wrap round her edge, a thin rim from the lamps; her colours NOT keyed
//   Pip   its backlit shade (deep: tone-on-tone with the boat) and a thin sun rim (tier B)
// Step 5 (the paper) adds lib/light2's GrainOn on each, locked to it (the second half).
import React from 'react';
import {useTime} from '../../lib/time';
import {Tod} from '../../lib/tod';
import * as MAP from '../../v2r/world/map';
import {affineFit, castHomography, LightMap, RimOf, ShadeOf, ShadowCut, toward, WrapOf, type Affine, type Region} from '../../lib/light2';
import {S1Row} from '../paint_s1/V2S1_row';
import {C, s1HerXAt} from '../paint_s1/V2S1_clock';
import {identityV7} from './palette_v7';
import {Seg, useSegOn, useV7} from './context';
import {DOOR, HER_LIGHT, PIP_LIGHT, SUN} from './rig';
import {V7Pip, V7_PIP} from './V7Props';

/** Her box at t (world px): the stepping-out pose's feet and height, her scarf's reach behind her. */
export function herBox(t: number): {region: Region; c: [number, number]; feetY: number; h: number; x: number} {
  const p = MAP.s1RowAt(Math.max(0, t))[0];
  const x = s1HerXAt(t);
  const h = p.h;
  const region: Region = [x - 0.62 * h, p.feetY - 1.12 * h, 1.24 * h, 1.12 * h + 10];
  return {region, c: [x, p.feetY - 0.5 * h], feetY: p.feetY, h, x};
}

/** Her shadows from the lobby's lamps on the towpath: each lamp's projection of her drawing (light.md §4.6), fitted as
 *  an affine map over her lower body. */
export function herCasts(t: number): Affine[] {
  const b = herBox(t);
  const lower: Region = [b.region[0], b.feetY - 0.5 * b.h, b.region[2], 0.5 * b.h];
  return DOOR.lamps.map((L) => affineFit(castHomography(L, [L[0], DOOR.lampFootY], b.feetY, lower), lower));
}

export const HerLit: React.FC = () => {
  const t = useTime();
  const {look, parts, movers, maps} = useV7();
  const drawn = useSegOn('her');
  const lit = look === 'v7a' && !parts;
  const live = lit && movers && drawn && t >= C.steppingOut;
  // the subject keeps her own colour: never keyed (her teal against the door's gold)
  const her = (
    <Tod map={identityV7}>
      <S1Row />
    </Tod>
  );
  const b = herBox(t);
  const pool = lit ? maps.live.pool : undefined;
  return (
    <>
      {pool ? (
        live ? (
          <ShadowCut of={her} region={pool.box} casts={herCasts(t)} share={DOOR.lamps.map(() => HER_LIGHT.shadowShare)} blur={HER_LIGHT.shadowBlur}>
            <LightMap {...pool} blend="normal" label="pool" />
          </ShadowCut>
        ) : (
          <LightMap {...pool} label="pool" />
        )
      ) : null}
      <Seg name="her">{her}</Seg>
      {live ? (
        <>
          <ShadeOf of={her} region={b.region} tint={HER_LIGHT.shade.tint} opacity={HER_LIGHT.shade.opacity} />
          <RimOf of={her} region={b.region} l={toward(b.c, SUN.img)} width={HER_LIGHT.sun.width} color={SUN.color} opacity={HER_LIGHT.sun.opacity} soft={HER_LIGHT.sun.soft} />
          {maps.live.doorBlur ? <WrapOf of={her} region={b.region} img={maps.live.doorBlur} width={HER_LIGHT.wrap.width} opacity={HER_LIGHT.wrap.opacity} /> : null}
          <RimOf of={her} region={b.region} l={toward(b.c, DOOR.lamps[1])} width={HER_LIGHT.lamps.width} color={DOOR.color} opacity={HER_LIGHT.lamps.opacity} steps={1} />
        </>
      ) : null}
    </>
  );
};

/** Pip's box on the roof (its size 70: ~75 px tall over its seat). */
const PIP_REGION: Region = [V7_PIP.seat[0] - 52, V7_PIP.seat[1] - 82, 104, 92];
const PIP_C: [number, number] = [V7_PIP.seat[0], V7_PIP.seat[1] - 30];

export const PipLit: React.FC = () => {
  const {look, parts, movers} = useV7();
  const drawn = useSegOn('pip');
  const live = look === 'v7a' && !parts && movers && drawn;
  const pip = <V7Pip />;
  return (
    <>
      <Seg name="pip">{pip}</Seg>
      {live ? (
        <>
          <ShadeOf of={pip} region={PIP_REGION} tint={PIP_LIGHT.shade.tint} opacity={PIP_LIGHT.shade.opacity} />
          <RimOf of={pip} region={PIP_REGION} l={toward(PIP_C, SUN.img)} width={PIP_LIGHT.sun.width} color={SUN.color} opacity={PIP_LIGHT.sun.opacity} soft={PIP_LIGHT.sun.soft} />
        </>
      ) : null}
    </>
  );
};
