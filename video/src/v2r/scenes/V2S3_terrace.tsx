// V2S3_terrace.tsx (lane L3, V2S3 FAR part; drawn in WORLD px at the 12.98 match, inside V2S3's camera, FILM seconds):
//   S3Sun      the low sun at left (CM.sun, r 46 at (96, 652), top 606), flat, no halo (the sky carries its warmth);
//              the far city's one level roof edge hides its lower part (V2S3_tWest S3FarCity)
//   S3Terrace  at the terrace's depth (plane 0): the tree and the garden wall past her end wall (V2S3_tWest), her brick
//              terrace (V2S3_tHouses), HER French window at M with her silhouette on the phone, blind up (V2S3_tHer),
//              the two lit neighbours (watering, kettle steam) and the balcony's festoons, her towpath with its bench,
//              bollards, bin, lit lamp and the one far walker (V2S3_tLife)
//   S3Canal    the canal (V2S3_water: lib/water's spec, its reflections, ripples and SUN3's glitter) and the heron
//              standing still on its post (V2S3_tCanal)
// The far city (+2) and the roofs and chimneys (+1) of the west gap are V2S3.tsx's own plane groups. The shot's ONE
// read: her lit window with her silhouette is the brightest, clearest thing in the frame; the rest is a calm, alive
// evening round it.
import React from 'react';
import {CM} from '../palette';
import {Fill} from '../../lib/Fill';
import {ovalPath} from '../kit/canal/core';
import {S3WestNear, SUN3} from './V2S3_tWest';
import {S3Houses} from './V2S3_tHouses';
import {S3Her} from './V2S3_tHer';
import {S3Path, S3Inside, S3Outside, S3RoofLife} from './V2S3_tLife';
import {S3CanalLife} from './V2S3_tCanal';
import {S3Water} from './V2S3_water';

export const S3Sun: React.FC = () => <Fill d={ovalPath(SUN3.x, SUN3.y, SUN3.r, SUN3.r)} color={CM.sun} offset={false} seed="s3sun" />;

export const S3Terrace: React.FC = () => (
  <>
    <S3WestNear />
    <S3Houses inside={<S3Inside />} />
    <S3Her />
    <S3Outside />
    <S3RoofLife />
    <S3Path />
  </>
);

export const S3Canal: React.FC = () => (
  <>
    <S3Water part="canal" />
    <S3CanalLife />
  </>
);
