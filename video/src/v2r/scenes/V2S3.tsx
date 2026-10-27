// V2S3 "Her window" (lane L3). Film 12.98-14.86 s; TREATMENT.md §3, §5 (row S3), §8; map.ts S3, PIP, MATCHES.
// RIVERSIDE across the water, DENSE-CALM, a flash-forward in S8's sunset light: her brick terrace across the canal,
// her French window at W2 (teal frame, Juliet rail, blind UP, lamp on, plants) with her full-figure silhouette pacing,
// phone at her ear; neighbours, balconies, string lights; the moored narrowboat and our towpath below us. The window
// match-cut from S2's W2 (same spot, same size), a 5 % ease-back, a float west; Pip lands on her window box, turns to
// her on "she" and leaps out through the left edge (the cut on action into V2S4).
// Everything inside runs on FILM seconds (<TimeShift by={-S3_START}>): map.ts and V2S3_rig.ts land as written.
// v0 SKELETON (kit terrace + kit cast): the build replaces it part by part (helpers V2S3_*.tsx).
import React from 'react';
import {World} from '../../lib/World';
import {useTime, TimeShift} from '../../lib/time';
import {XG, mat} from '../../lib/xf';
import {InkScale} from '../../lib/inkComp';
import {CM, INK_PX} from '../palette';
import * as MAP from '../world/map';
import {CanalCast} from '../kit/canal/slots';
import {k4Person} from '../kit/canal/k4k5';
import {TerraceRow} from '../kit/canal/terrace';
import {Water} from '../kit/canal/water';
import {Narrowboat} from '../kit/canal/boat';
import {Towpath, Lamp} from '../kit/canal/towpath';
import {SunDisc} from '../kit/canal/sets';
import {HerWindow} from '../kit/cast';
import {PipTrack} from '../kit/pip';
import type {ToneKey} from '../../lib/Film';
import {S3_START, S3_BEATS, S3_PIP, S3_HER, s3Zoom, s3FloatDx} from './V2S3_rig';

export const captionTone: ToneKey[] = [{t: 0, tone: 'dark'}];

const LV = {ground: 1100, first: 878, cornice: 664, mansardTop: 602};

const S3PipV0: React.FC = () => (
  <PipTrack
    x={S3_PIP.from[0]}
    y={S3_PIP.from[1]}
    size={S3_PIP.size}
    facing="back"
    seed={S3_PIP.seed}
    keys={[
      {t: S3_PIP.inHop.t0, target: null, hop: {to: S3_PIP.inHop.to, height: S3_PIP.inHop.height, dur: S3_PIP.inHop.dur}},
      {t: S3_BEATS.pipLand + 0.05, pose: 'sit', facing: 'frontLeft', dur: 0.25},
      {t: S3_BEATS.pipTurn, facing: 'left', target: [S3_HER.x0 + 40, S3_HER.y - S3_HER.h + 20]},
      {t: S3_PIP.outLeap.t0, target: null, hop: {to: S3_PIP.outLeap.to, height: S3_PIP.outLeap.height, dur: S3_PIP.outLeap.dur, style: 'leap'}},
    ]}
  />
);

const Shot: React.FC = () => {
  const t = useTime(); // film seconds
  const z = s3Zoom(t);
  const a = MAP.S3.camera.easeBack.anchor;
  return (
    <XG m={mat.compose(mat.translate(s3FloatDx(t), 0), mat.about(mat.scale(z), a.x, a.y))}>
      <InkScale zoom={z} k={0.6}>
        <CanalCast person={k4Person}>
          <SunDisc x={96} y={652} r={46} />
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
          <Water y0={1128} y1={1300} seed="s3water" reflTop={1132} reflections={[{x0: 250, x1: 420, color: CM.lamp, depth: 70}, {x0: 600, x1: 760, color: CM.brickLight, depth: 60}]} ripples={22} glints={12} />
          <Narrowboat x={-300} water={1600} len={1700} h={250} dir={1} seed="s3boat" cabin={CM.sage} topView={36} hullK={0.12} roofItems panel fenders chimney={0.7} />
          <Water y0={1590} y1={1660} seed="s3near" ripples={8} glints={4} />
          <Towpath x0={-80} x1={1180} top={1650} edge={2010} seed="s3ourpath" leaves={14} ink={INK_PX.mid} />
          <S3PipV0 />
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
