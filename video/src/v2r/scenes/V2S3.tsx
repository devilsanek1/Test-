// V2S3 "Her window" (lane L3). Film 12.98-14.86 s; TREATMENT.md §3, §5 (row S3), §8; map.ts S3, PIP, MATCHES; the build
// spec docs/v2/lanes/plan_L3.md §2. RIVERSIDE across the water, DENSE-CALM, a flash-forward in S8's sunset light: her
// brick terrace across the canal, her French window at W2 (teal frame, Juliet rail, blind going UP, lamp on, plants)
// with her full-figure silhouette pacing, phone at her ear; neighbours, balconies, string lights; the moored narrowboat
// and our towpath below us. The window match-cut from S2's W2 (same spot, same size), a 5 % ease-back, a float west;
// Pip lands on her window box, turns to her on "she" and leaps out through the left edge (the cut on action into V2S4).
// Everything inside runs on FILM seconds (<TimeShift by={-S3_START}>): map.ts and V2S3_rig.ts land as written.
//
// Parts (back to front, all in WORLD px at the 12.98 match, inside ONE camera: the float after the ease-back about W2):
//   S3Sun · S3Terrace (V2S3_terrace: terrace, her window + silhouette, neighbours, her towpath) · S3Canal (V2S3_terrace)
//   · S3Near (V2S3_near: our boat, coping, towpath, head-backs, lamp foot) · S3Pip (V2S3_pip).
import React from 'react';
import {World} from '../../lib/World';
import {useTime, TimeShift} from '../../lib/time';
import {XG, mat} from '../../lib/xf';
import {InkScale} from '../../lib/inkComp';
import {CM} from '../palette';
import * as MAP from '../world/map';
import {CanalCast} from '../kit/canal/slots';
import {k4Person} from '../kit/canal/k4k5';
import type {ToneKey} from '../../lib/Film';
import {S3_START, s3Zoom, s3FloatDx} from './V2S3_rig';
import {S3Sun, S3Terrace, S3Canal} from './V2S3_terrace';
import {S3Near} from './V2S3_near';
import {S3Pip} from './V2S3_pip';

export const captionTone: ToneKey[] = [{t: 0, tone: 'dark'}];

const Shot: React.FC = () => {
  const t = useTime(); // film seconds
  const z = s3Zoom(t);
  const a = MAP.S3.camera.easeBack.anchor;
  return (
    <XG m={mat.compose(mat.translate(s3FloatDx(t), 0), mat.about(mat.scale(z), a.x, a.y))}>
      <InkScale zoom={z} k={0.6}>
        <CanalCast person={k4Person}>
          <S3Sun />
          <S3Terrace />
          <S3Canal />
          <S3Near />
          <S3Pip />
        </CanalCast>
      </InkScale>
    </XG>
  );
};

const V2S3: React.FC = () => (
  <World sky={[CM.sky, CM.bandSunset]} horizon={1000}>
    <TimeShift by={-S3_START}>
      <Shot />
    </TimeShift>
  </World>
);
export default V2S3;
