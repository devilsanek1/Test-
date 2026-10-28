// V2S3_near.tsx (lane L3, V2S3 NEAR part; WORLD px at the 12.98 match, inside V2S3's camera): the bottom third,
// back to front. The sliver of shaded water under our hull (V2S3_nground), our moored narrowboat cut by both edges
// (V2S3_nboat: the SAME boat as V2S4's foreground boat: sage cabin, ONE plum gunwale stripe, cream lamp-lit portholes
// with curtains, the painted flower panel, roof dressing, the stove chimney's smoke, fenders), our coping with the
// boat's rope through its ring and our towpath (V2S3_nground) with the boaters' things (V2S3_ndress), and the near
// lamp-post foot held from S2, cut by the bottom-right (V2S3_nground). No head-backs (conform_L3 §1: things only).
// Planes (V2S3_float): the water under the hull and the boat -1 (0.85 of the float), our towpath -2 (all of it).
import React from 'react';
import {S3Boat} from './V2S3_nboat';
import {S3NearWater, S3Ground, S3Rope, S3LampFoot} from './V2S3_nground';
import {S3Plane} from './V2S3_float';
import {S3_PLANE} from './V2S3_rig';
import {S3Dress} from './V2S3_ndress';

export const S3Near: React.FC = () => (
  <>
    <S3Plane plane={S3_PLANE.boat}>
      <S3NearWater />
      <S3Boat />
    </S3Plane>
    <S3Plane plane={S3_PLANE.towpath}>
      <S3Ground />
      <S3Dress />
      <S3Rope />
      <S3LampFoot />
    </S3Plane>
  </>
);
