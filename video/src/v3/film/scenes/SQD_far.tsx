// SQD_far (REVEAL lane): the far plane of the reveal in H2 px (outside's frame at rest: horizon y 930, the DC x 230-560,
// the summit (800, 640)): S9's far field re-laid (read-only imports from S9_far; S9's own files are untouched) by ONE
// map, S9 px -> H2 px (x0.868 about the hall: S9's 380 px hall becomes the 330 px DC at x 230-560, S9's horizon 960 ->
// 930), plus the mountain (SQD_peak, at its own H2 place). Tiers (flow_v2 §5 SQD): the DC and the mountain are the
// subject in turn (the DC the darkest far shape with the brightest cold light, its lit sign; the mountain the warmest),
// the clouds and the far field are environment (fills only, no line), hall B and the infinity line a calm C.
// STAND-IN for `outside.tsx`'s far field (the WINDOW lane owns it; flow_v2 §3): swapped for its far plane when it lands.
import React from 'react';
import {mat, XG} from '../../../lib/xf';
import {CornerCloud, HighClouds, CloudBank, FarGround, InfinityLine, FarField, HallB, HallPlume, HallFans, Hall, HALL, HORIZON} from './S9_far';
import {RevealPeak} from './SQD_peak';

/** S9 px -> H2 px (the far field's one map). */
export const S9_TO_H2 = mat.compose(mat.translate(395, 930), mat.scale(330 / HALL.w), mat.translate(-HALL.x, -HORIZON));

/** The sky's clouds (behind everything far; drawn on the far map too, so they share its camera). */
export const RevealClouds: React.FC = () => (
  <XG m={S9_TO_H2}>
    <CornerCloud />
    <HighClouds />
    <CloudBank />
  </XG>
);

/** The far field, back to front: the far ground, the mountain, hall B and its plume, the hall's fans and THE DC, the
 *  infinity line and the far field's roof rows (the town plane covers their foot). S9's pieces read the sequence
 *  clock (scene time from 19.40, as S9's did), so they move exactly as they did. */
export const RevealFar: React.FC<{streams?: React.ReactNode}> = ({streams}) => (
  <>
    <XG m={S9_TO_H2}>
      <FarGround />
    </XG>
    <RevealPeak />
    <XG m={S9_TO_H2}>
      <HallB />
      <HallPlume />
    </XG>
    {streams}
    <XG m={S9_TO_H2}>
      <HallFans />
      <Hall />
      <InfinityLine />
      <FarField />
    </XG>
  </>
);
