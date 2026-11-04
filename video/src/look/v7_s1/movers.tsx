// v7_s1: the MOVERS (organic/light.md §4.0 home 3; light_proof.md §2.3, from src/look/light_s1/movers.tsx): her and Pip
// are drawn by their own components (look 'v7a': paint_s1's S1Row; look 'v7': the people overhaul's her, ./her_v7;
// ./V7Props V7Pip on boat A's roof); in the lit looks their light is computed every frame from that same drawing
// (lib/light2's live layers), so it follows every pose with no keys:
//   her   the door's pool with her shadows from the lobby's three lamps cut out of it, her backlit shade, the sun's gold
//         rim on her front, the lit opening's wrap round her edge, a thin rim from the lamps; her colours NOT keyed
//   Pip   its backlit shade (deep: tone-on-tone with the boat) and a thin sun rim (tier B)
// Step 5 (the paper, look 'v7') adds lib/light2's GrainOn on each: the frame's paper as a tile locked to the mover.
import React from 'react';
import {useTime} from '../../lib/time';
import {Tod} from '../../lib/tod';
import * as MAP from '../../v2r/world/map';
import {affineFit, castHomography, GrainOn, LightMap, RimOf, ShadeOf, ShadowCut, toward, WrapOf, type Affine, type Region} from '../../lib/light2';
import {S1Row} from '../paint_s1/V2S1_row';
import {C, s1HerXAt} from '../paint_s1/V2S1_clock';
import {identityV7} from './palette_v7';
import {litLook, Seg, useSegOn, useV7} from './context';
import {HER_V7_H, V7Her} from './her_v7';
import {DOOR, HER_LIGHT, HER_LIGHT_V7, PIP_LIGHT, SUN} from './rig';
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
  const lit = litLook(look) && !parts;
  const live = lit && movers && drawn && t >= C.steppingOut;
  const b = herBox(t);
  const second = look === 'v7';
  // the subject keeps her own colour: never keyed (her teal against the door's gold). Look 'v7': the people overhaul's
  // her at her place (her soles at the stepping-out pose's feet), her light layers drawn from her figure alone (her
  // contact shadow is the ground's, never rimmed or shaded)
  const her = second ? (
    <V7Her x={b.x} feetY={b.feetY} h={HER_V7_H} />
  ) : (
    <Tod map={identityV7}>
      <S1Row />
    </Tod>
  );
  const fig = second ? <V7Her x={b.x} feetY={b.feetY} h={HER_V7_H} shadow={false} /> : her;
  const pool = lit ? maps.live.pool : undefined;
  const grain = second ? maps.live.grain : undefined;
  const HL = second ? HER_LIGHT_V7 : HER_LIGHT;
  return (
    <>
      {pool ? (
        live ? (
          <ShadowCut of={fig} region={pool.box} casts={herCasts(t)} share={DOOR.lamps.map(() => HL.shadowShare)} blur={HL.shadowBlur}>
            <LightMap {...pool} blend="normal" label="pool" />
          </ShadowCut>
        ) : (
          <LightMap {...pool} label="pool" />
        )
      ) : null}
      <Seg name="her">{her}</Seg>
      {live ? (
        <>
          <ShadeOf of={fig} region={b.region} tint={HL.shade.tint} opacity={HL.shade.opacity} />
          {grain ? <GrainOn of={fig} region={b.region} tile={grain} at={[b.x - grain.size / 2, b.feetY - grain.size + 12]} /> : null}
          <RimOf of={fig} region={b.region} l={toward(b.c, SUN.img)} width={HL.sun.width} color={SUN.color} opacity={HL.sun.opacity} soft={HL.sun.soft} />
          {maps.live.doorBlur ? <WrapOf of={fig} region={b.region} img={maps.live.doorBlur} width={HL.wrap.width} opacity={HL.wrap.opacity} /> : null}
          <RimOf of={fig} region={b.region} l={toward(b.c, DOOR.lamps[1])} width={HL.lamps.width} color={DOOR.color} opacity={HL.lamps.opacity} steps={1} />
        </>
      ) : null}
    </>
  );
};

/** Pip's box on the roof (its size 70: ~75 px tall over its seat). */
const PIP_REGION: Region = [V7_PIP.seat[0] - 52, V7_PIP.seat[1] - 82, 104, 92];
const PIP_C: [number, number] = [V7_PIP.seat[0], V7_PIP.seat[1] - 30];

export const PipLit: React.FC = () => {
  const {look, parts, movers, maps} = useV7();
  const drawn = useSegOn('pip');
  const live = litLook(look) && !parts && movers && drawn;
  const pip = <V7Pip />;
  const grain = look === 'v7' ? maps.live.grain : undefined;
  return (
    <>
      <Seg name="pip">{pip}</Seg>
      {live ? (
        <>
          <ShadeOf of={pip} region={PIP_REGION} tint={PIP_LIGHT.shade.tint} opacity={PIP_LIGHT.shade.opacity} />
          {grain ? <GrainOn of={pip} region={PIP_REGION} tile={grain} at={[PIP_REGION[0], PIP_REGION[1]]} /> : null}
          <RimOf of={pip} region={PIP_REGION} l={toward(PIP_C, SUN.img)} width={PIP_LIGHT.sun.width} color={SUN.color} opacity={PIP_LIGHT.sun.opacity} soft={PIP_LIGHT.sun.soft} />
        </>
      ) : null}
    </>
  );
};
