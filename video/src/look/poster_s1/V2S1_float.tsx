// V2S1 helper (lane L1): the shot's gentle PARALLAX float (owner, 2026-10-28; DIRECTION rule 8, COZY_AND_SCALE 3b.5;
// lib/depth floatAt / parallaxOffset). S1's camera stays locked through the hook's first beat (frame 0 is the loop
// match: L6's S8 -> S1 un-build lands on it), then floats in four straight legs (each ramps its speed in and out:
// <= ~10 px/s at the near ground, the net offset within 12 px) and is home again at 5.80, so the push-through into W
// at 5.95 starts from rest and W sits on its map spot (860, 700). Each plane shows its share of the float: the near
// ground all of it, our bank 0.85, the water ~0.72, the subject's plane (the wing, the far towpath, her and the row)
// 0.6, the bridge 0.35, the far tower 0.15, the far roofs and the sun 0.05, the sky and the captions nothing.
// Shadows and particles ride the group of the plane they lie on.
import React from 'react';
import {useTime} from '../../lib/time';
import {floatAt, parallaxOffset, PARALLAX_SKY, type FloatLeg} from '../../lib/depth';
import {currentFloatTable, TextureSlot} from './engine';
import {useSwitches} from './switches';

/** The float's legs (near-ground px from home): rest to 1.10 (after "She quit Google." and her step-out at 0.97). */
export const S1_FLOAT_LEGS: FloatLeg[] = [
  {t0: 1.1, t1: 2.3, to: [-8, -3]},
  {t0: 2.3, t1: 3.4, to: [-4, -9]},
  {t0: 3.4, t1: 4.6, to: [4, -7]},
  {t0: 4.6, t1: 5.8, to: [0, 0]},
];
/** Home at these times (floatProblems): frame 0 / the loop match, the flood, her step-out, from 5.80 to the dive. */
export const S1_FLOAT_REST = [0, 0.3, 0.97, 5.8, 5.95, 6.1];

/** The planes of S1 (lib/depth parallax planes; fractional ones interpolate). */
export const S1_PLANE = {
  sky: PARALLAX_SKY,
  farRoofs: 4,
  farTower: 3,
  bridge: 2,
  subject: 0,
  water: -0.5,
  boats: -0.55,
  bank: -1,
  near: -2,
} as const;

/** The near-ground float at time t (S1 seconds). */
export const s1Float = (t: number): [number, number] => floatAt(t, S1_FLOAT_LEGS) as [number, number];

/** One plane's group: translated by its share of the float (sub-pixel, never rounded); translate(0 0) at rest (the
 *  same tree every frame: nothing remounts when the float starts or stops).
 *  (the look test) The plane's fills carry its mottle (engine TextureSlot) inside the translate, so it rides the float.
 *  `under` / `over`: drawn in the same translate before / after the plane's fills but OUTSIDE the mottle, for a multiply
 *  layer that falls on ANOTHER plane's group (a mottled group is isolated: inside it such a layer would paint its tint
 *  solid). With the texture off the tree is v2's order exactly (under, children, over). `texture={false}`: never
 *  mottled (a falling leaf); `region`: the mottle's filter region in the group's space (default the frame + 160 px). */
export const S1Plane: React.FC<{plane: number; under?: React.ReactNode; over?: React.ReactNode; texture?: boolean; region?: [number, number, number, number]; children?: React.ReactNode}> = ({plane, under, over, texture = true, region, children}) => {
  const t = useTime();
  const sw = useSwitches();
  // (the look test: the float by 1/z when the switch is on, lane E's PARALLAX_Z; v2's PARALLAX_K otherwise)
  const [dx, dy] = parallaxOffset(s1Float(t), plane, currentFloatTable());
  return (
    <g transform={`translate(${dx.toFixed(3)} ${dy.toFixed(3)})`}>
      {under}
      {texture ? (
        <TextureSlot sw={sw} t={t} plane={plane} sky={!Number.isFinite(plane)} offset={[dx, dy]} region={region}>
          {children}
        </TextureSlot>
      ) : (
        children
      )}
      {over}
    </g>
  );
};
