// V2S3_terrace.tsx (lane L3, V2S3 FAR part; drawn in WORLD px at the 12.98 match, inside V2S3's camera, FILM seconds):
//   S3Sun      the low sun at left (CM.sun, r 46 at (96, 652), top 606), no ink; the west gap's far roofs and stacks
//              (in S3Terrace) hide its lower half
//   S3Terrace  the west gap (gasholder, far roofs, the viaduct with a train heading west, a warehouse, an autumn tree,
//              a garden wall), her brick terrace (V2S3_tHouses), HER French window at W2_CUT with her silhouette on the
//              phone and the blind rolling UP (V2S3_tHer), the two lit neighbours (watering, kettle steam), string
//              lights, birds, smoke, and her towpath with its lit lamp, a bench, walkers both ways and a cyclist
//              (V2S3_tLife)
//   S3Canal    the canal: warm broken reflections, ripples, glints, leaves, a heron on a post, two ducks (V2S3_tCanal)
// Everything is drawn over S3_BLEED (x -60..1160) so no edge shows through the ease-back and the float. The shot's ONE
// read: her lit window with her silhouette is the brightest, clearest thing in the frame; the rest is a calm, alive
// evening round it.
import React from 'react';
import {CM} from '../palette';
import {Fill} from '../../lib/Fill';
import {ovalPath} from '../kit/canal/core';
import {S3West, SUN3} from './V2S3_tWest';
import {S3Houses} from './V2S3_tHouses';
import {S3Her} from './V2S3_tHer';
import {S3Path, S3Inside, S3Outside, S3RoofLife} from './V2S3_tLife';
import {S3Water, S3CanalLife} from './V2S3_tCanal';

export const S3Sun: React.FC = () => <Fill d={ovalPath(SUN3.x, SUN3.y, SUN3.r, SUN3.r)} color={CM.sun} offset={false} seed="s3sun" />;

export const S3Terrace: React.FC = () => (
  <>
    <S3West />
    <S3Houses inside={<S3Inside />} />
    <S3Her />
    <S3Outside />
    <S3RoofLife />
    <S3Path />
  </>
);

export const S3Canal: React.FC = () => (
  <>
    <S3Water />
    <S3CanalLife />
  </>
);
