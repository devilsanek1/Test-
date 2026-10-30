// light_s1: the MOVERS' live light (organic/light.md §4.0 home 3; light_proof.md §2.3): her and Pip are drawn by
// paint_s1's own components (S1Row, S1Pip), unchanged; their light is computed every frame from that same drawing
// (lib/light2's live layers), so it follows every pose with no keys:
//   her   the door's pool on the towpath with her shadows from the lobby's three lamps cut out of it (projected from her
//         drawing), her shade side (backlit), the sun's gold rim on her front (n . l toward the sun's image), the lit
//         opening's wrap round her edge (it fades as she walks out of the opening's light), a thin rim from the lamps
//   Pip   the sun's rim (tier B) and its shade side
// In look 'full' the movers also carry the frame's paper grain, locked to them (lib/light2 GrainOn).
import React from 'react';
import {useTime} from '../../lib/time';
import * as MAP from '../../v2r/world/map';
import {affineFit, castHomography, GrainOn, LightMap, RimOf, ShadeOf, ShadowCut, toward, WrapOf, type Affine, type Region} from '../../lib/light2';
import {S1Row} from '../paint_s1/V2S1_row';
import {S1Pip, S1_PIP_BOLLARD} from '../paint_s1/V2S1_pip';
import {C, S1_PIP, s1HerXAt} from '../paint_s1/V2S1_clock';
import {Seg, useLightS1, useSegOn} from './context';
import {DOOR, HER_LIGHT, PIP_LIGHT, SUN} from './rig';

/** Her box at t (world px): the stepping-out pose's feet and height, her scarf's reach behind her. */
export function herBox(t: number): {region: Region; c: [number, number]; feetY: number; h: number; x: number} {
  const p = MAP.s1RowAt(Math.max(0, t))[0];
  const x = s1HerXAt(t);
  const h = p.h;
  const region: Region = [x - 0.62 * h, p.feetY - 1.12 * h, 1.24 * h, 1.12 * h + 10];
  return {region, c: [x, p.feetY - 0.5 * h], feetY: p.feetY, h, x};
}

/** Her shadows from the lobby's lamps on the towpath: each lamp's projection of her drawing (light.md §4.6), fitted
 *  as an affine map over her lower body (the part whose shadow lands on the towpath before the coping cuts it). */
export function herCasts(t: number): Affine[] {
  const b = herBox(t);
  const lower: Region = [b.region[0], b.feetY - 0.5 * b.h, b.region[2], 0.5 * b.h];
  return DOOR.lamps.map((L) => affineFit(castHomography(L, [L[0], DOOR.lampFootY], b.feetY, lower), lower));
}

export const HerLit: React.FC = () => {
  const t = useTime();
  const {look, parts, movers, maps} = useLightS1();
  const drawn = useSegOn('her');
  const live = look !== 'v6' && !parts && movers && drawn && t >= C.steppingOut;
  const her = <S1Row />;
  const b = herBox(t);
  const pool = look !== 'v6' && !parts ? maps.live.pool : undefined;
  return (
    <>
      {pool ? (
        live ? (
          <ShadowCut of={her} region={pool.box} casts={herCasts(t)} blur={HER_LIGHT.shadowBlur}>
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
          {look === 'full' && maps.live.grain ? <GrainOn of={her} region={b.region} tile={maps.live.grain} at={[b.x - maps.live.grain.size / 2, b.feetY - maps.live.grain.size + 12]} /> : null}
        </>
      ) : null}
    </>
  );
};

/** Pip's box (its bollard's seat, size 100 above it). */
const PIP_REGION: Region = [S1_PIP.seat[0] - 72, S1_PIP.seat[1] - 112, 144, 112 + S1_PIP_BOLLARD.h + 14];
const PIP_C: [number, number] = [S1_PIP.seat[0], S1_PIP.seat[1] - 40];

export const PipLit: React.FC = () => {
  const {look, parts, movers, maps} = useLightS1();
  const drawn = useSegOn('pip');
  const live = look !== 'v6' && !parts && movers && drawn;
  const pip = <S1Pip />;
  return (
    <>
      <Seg name="pip">{pip}</Seg>
      {live ? (
        <>
          <ShadeOf of={pip} region={PIP_REGION} tint={PIP_LIGHT.shade.tint} opacity={PIP_LIGHT.shade.opacity} />
          <RimOf of={pip} region={PIP_REGION} l={toward(PIP_C, SUN.img)} width={PIP_LIGHT.sun.width} color={SUN.color} opacity={PIP_LIGHT.sun.opacity} soft={PIP_LIGHT.sun.soft} />
          {look === 'full' && maps.live.grain ? <GrainOn of={pip} region={PIP_REGION} tile={maps.live.grain} at={[PIP_REGION[0], PIP_REGION[1]]} /> : null}
        </>
      ) : null}
    </>
  );
};
