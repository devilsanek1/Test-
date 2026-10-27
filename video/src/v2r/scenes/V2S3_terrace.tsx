// V2S3_terrace.tsx (lane L3, V2S3 FAR part; drawn in WORLD px at the 12.98 match, inside V2S3's camera): the low sun at
// left (S3Sun), her brick terrace across the water with her French window at W2_CUT and her silhouette inside, the
// neighbours, balconies and string lights, her towpath in front of it (S3Terrace), and the canal (S3Canal: warm
// reflections, the heron on a post, ducks). STUB (v0, the kit terrace): the far build replaces it.
import React from 'react';
import {CM, INK_PX} from '../palette';
import * as MAP from '../world/map';
import {TerraceRow} from '../kit/canal/terrace';
import {Water} from '../kit/canal/water';
import {Towpath, Lamp} from '../kit/canal/towpath';
import {SunDisc} from '../kit/canal/sets';
import {HerWindow} from '../kit/cast';
import {S3_BEATS, S3_HER} from './V2S3_rig';

const LV = {ground: 1100, first: 878, cornice: 664, mansardTop: 602};

export const S3Sun: React.FC = () => <SunDisc x={96} y={652} r={46} />;

export const S3Terrace: React.FC = () => (
  <>
    <TerraceRow
      x0={-150}
      levels={LV}
      houses={[{w: 330, first: 'two'}, {w: 330, first: 'french'}, {w: 300, first: 'french', lights: true, neighbour: 'first'}, {w: 320, first: 'two', stucco: true, neighbour: 'ground'}]}
      her={{index: 1, french: MAP.W2_CUT, inside: <HerWindow x0={S3_HER.x0} x1={S3_HER.x1} y={S3_HER.y} h={S3_HER.h} gestureAt={S3_BEATS.hand} phase={0.3} />}}
      seed="s3terrace"
      litFrac={0.6}
      lightsOn
      waterAt={13.4}
    />
    <Towpath x0={-80} x1={1180} top={1100} edge={1128} seed="s3herpath" leaves={10} ink={INK_PX.far} />
    <Lamp x={620} y={1120} h={260} seed="s3lamp" on />
  </>
);

export const S3Canal: React.FC = () => (
  <Water y0={1128} y1={1300} seed="s3water" reflTop={1132} reflections={[{x0: 250, x1: 420, color: CM.lamp, depth: 70}, {x0: 600, x1: 760, color: CM.brickLight, depth: 60}]} ripples={22} glints={12} />
);
