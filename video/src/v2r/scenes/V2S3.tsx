// V2S3 "Her window" (lane L3). Film 12.98-14.86 s; the binding spec docs/v2/lanes/conform_L3.md (wins over plan_L3 and
// TREATMENT); map.ts S3, PIP, MATCHES. RIVERSIDE across the water, DENSE-CALM, a flash-forward in S8's sunset light: her
// brick terrace across the canal, her lit French window at M (teal frame, Juliet rail, blind up, lamp on, plants) with
// her full-figure silhouette on the phone; neighbours, balconies, string lights; the moored narrowboat and our towpath
// below us. In: the B match from S2's dark office window at M (same spot, same size); a gentle parallax float (home on
// the match and from 14.50, no zoom); Pip on her terrace railing at (590, 1050) from the first frame turns to her on
// "she"; out: from 14.60 she stands still, head on (330, 742), where the A push-through into her starts (the join's).
// Everything inside runs on FILM seconds (<TimeShift by={-S3_START}>): map.ts and V2S3_rig.ts land as written.
//
// Planes (back to front, WORLD px = screen px at rest; each in an S3Plane group: V2S3_float): the sun (sky: no float) ·
// the terrace (V2S3_terrace: the west gap, her terrace, her window + silhouette, neighbours, her towpath; 0) · the canal
// (V2S3_tCanal; -0.6) · the boat and its water (-1) and our towpath (-2) (V2S3_near) · Pip on the terrace railing (0).
import React from 'react';
import {World} from '../../lib/World';
import {TimeShift} from '../../lib/time';
import {CM} from '../palette';
import * as MAP from '../world/map';
import {CanalCast} from '../kit/canal/slots';
import {k4Person} from '../kit/canal/k4k5';
import type {ToneKey} from '../../lib/Film';
import {S3_START, S3_PLANE} from './V2S3_rig';
import {S3Plane} from './V2S3_float';
import {S3Sun, S3Terrace, S3Canal} from './V2S3_terrace';
import {S3Near} from './V2S3_near';
import {S3Pip} from './V2S3_pip';

export const captionTone: ToneKey[] = [{t: 0, tone: 'dark'}];

const Shot: React.FC = () => (
  <CanalCast person={k4Person}>
    <S3Plane plane={S3_PLANE.sky}>
      <S3Sun />
    </S3Plane>
    <S3Plane plane={S3_PLANE.terrace}>
      <S3Terrace />
    </S3Plane>
    <S3Plane plane={S3_PLANE.water}>
      <S3Canal />
    </S3Plane>
    <S3Near />
    <S3Plane plane={S3_PLANE.terrace}>
      <S3Pip />
    </S3Plane>
  </CanalCast>
);

const V2S3: React.FC = () => (
  <World sky={[CM.sky, CM.bandSunset]} horizon={1000}>
    <TimeShift by={-S3_START}>
      <Shot />
    </TimeShift>
  </World>
);
export default V2S3;
