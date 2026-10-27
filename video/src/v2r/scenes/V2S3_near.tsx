// V2S3_near.tsx (lane L3, V2S3 NEAR part; WORLD px at the 12.98 match, inside V2S3's camera): the bottom third,
// back to front. The sliver of shaded water under our hull (V2S3_nground), our moored narrowboat cut by both edges
// (V2S3_nboat: the SAME boat as V2S4's foreground boat: sage cabin, ONE plum gunwale stripe, cream lamp-lit portholes
// with curtains, the painted flower panel, roof dressing, the stove chimney's smoke, fenders), our coping with the
// boat's rope through its ring and our towpath (V2S3_nground), two walkers' head-backs cut by the bottom crossing
// slowly (V2S3_nfolk), and the near lamp-post foot cut by the bottom-right (V2S3_nground). Rich, never flat; alive in
// every frame (smoke, curtains, herbs, the passer-by inside, ripples and glints, skittering leaves, the walkers).
import React from 'react';
import {S3Boat} from './V2S3_nboat';
import {S3NearWater, S3Ground, S3LampFoot} from './V2S3_nground';
import {S3HeadBacks} from './V2S3_nfolk';

export const S3Near: React.FC = () => (
  <>
    <S3NearWater />
    <S3Boat />
    <S3Ground />
    <S3HeadBacks />
    <S3LampFoot />
  </>
);
