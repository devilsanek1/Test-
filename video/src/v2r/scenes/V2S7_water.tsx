// V2S7_water.tsx (lane L5): the fountain basin's WATER in V2S7, isolated in ONE component so the film-wide premium water
// (src/lib/water.tsx, being built: the owner on v5 called the old water "way too cheap, not clean or premium") swaps in
// with a one-line change. Drawn plain and flat for now, nothing spent on its styling: the surface in one colour with
// the far rim's reflection as one deeper step, and three steady jets (a constant column, two tones, a small crown).
// Its geometry is S7_WATER (screen px at the 30.04 pose; the basin group's float plane -0.5 and the shot's push move
// it like the rims). V2S7.tsx draws it between the basin's far rim and its west end + near rim; the light layer's water
// shade (V2S7_light S7BasinWaterShade, tint "water") lies on S7_WATER.shade.
import React from 'react';
import {CM} from '../palette';
import {useTime} from '../../lib/time';
import {Tier} from '../../lib/tier';
import {recede} from '../../lib/depth';
import {Batch, Paint, ovalPath} from '../kit/canal/core';
import {kz, pt, S7_ATM, S7_BASIN, type P2} from './V2S7_plan';

const BS = S7_BASIN;
const flat = (x0: number, x1: number, z0: number, z1: number, l: number): P2[] => [pt(x0, z0, l), pt(x1, z0, l), pt(x1, z1, l), pt(x0, z1, l)];

/** The water's geometry (screen px at the pose): the surface polygon, its far reflection band, the west wall's shadow
 *  strip on it, and each jet's base (on the water), top and column half-width. */
export const S7_WATER = {
  surface: flat(BS.x0 + BS.coping, BS.x1, BS.zN + BS.coping, BS.zF - BS.coping, BS.water),
  reflection: flat(BS.x0 + BS.coping, BS.x1, BS.zF - BS.coping - 0.24, BS.zF - BS.coping, BS.water),
  shade: flat(BS.x0 + BS.coping, BS.x0 + BS.coping + 0.14, BS.zN + BS.coping, BS.zF - BS.coping, BS.water),
  jets: BS.jets.z.map((z) => ({base: pt(BS.jets.x, z, BS.water), top: pt(BS.jets.x, z, BS.water + BS.jets.h), half: BS.jets.r * kz(z)})),
} as const;

const polyD = (pts: readonly P2[]) => `M${pts.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join('L')}Z`;

/** The basin's water: plain and flat (plane -0.5's colours), and its three steady jets. */
export const S7BasinWater: React.FC = () => {
  const t = useTime();
  const b = new Batch();
  const water = recede(CM.water, -0.5, S7_ATM);
  const deep = recede(CM.waterDeep, -0.5, S7_ATM);
  const glass = recede(CM.glass, -0.5, S7_ATM);
  const foam = recede(CM.paper, -0.5, S7_ATM);
  b.fill(water, polyD(S7_WATER.surface));
  b.fill(deep, polyD(S7_WATER.reflection));
  b.layer();
  S7_WATER.jets.forEach(({base: [bx, by], top: [, ty], half}, i) => {
    const H = by - ty;
    const L: P2[] = [];
    const R: P2[] = [];
    const S: P2[] = [];
    for (let s = 0; s <= 10; s++) {
      const u = s / 10;
      const w = half * (1 - 0.35 * u);
      const wob = 1.2 * Math.sin(2 * Math.PI * (u * 2 - t * 1.6) + i * 1.7) * u;
      L.push([bx - w + wob, by - H * u]);
      R.push([bx + w + wob, by - H * u]);
      S.push([bx - w * 0.3 + wob, by - H * u]);
    }
    b.fill(foam, ovalPath(bx, by + 1, half * 2.2, half * 0.55));
    b.poly(glass, [...L, ...R.slice().reverse()]);
    b.poly(foam, [...L, ...S.slice().reverse()]);
    const cx = (L[10][0] + R[10][0]) / 2;
    b.fill(glass, `M${(cx - half * 2.4).toFixed(1)} ${(ty + 5).toFixed(1)}Q${cx.toFixed(1)} ${(ty - half * 1.6).toFixed(1)} ${(cx + half * 2.4).toFixed(1)} ${(ty + 5).toFixed(1)}Z`);
  });
  return (
    <Tier tier="environment">
      <Paint b={b} seed="s7/water" misreg={false} />
    </Tier>
  );
};
