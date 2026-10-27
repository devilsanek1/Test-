// V2S4 "The walk home" (lane L3). Film 14.86-20.55 s; TREATMENT.md §3, §5 (row S4), §8; map.ts S4, PIP, MATCHES.
// RIVERSIDE truck from the water, DENSE-CALM: our narrowboat glides with us as the foreground (Pip riding its roof);
// across the canal she walks home WEST along her towpath in profile, screen-fixed at x 720 while the world trucks
// (far roofs 0.3x, terrace backs 0.6x, her towpath 1.0x); the name tag builds above her; the truck slows to a stop on
// "objected" with the ONE fingerpost beside her; its two dated plates build on "military" / "heading"; a 6 % push
// toward SUN1; Pip leaps into the sun, mid-air at the sun match-cut into V2S5.
// Everything inside runs on FILM seconds (<TimeShift by={-S4_START}>): map.ts and V2S4_rig.ts land as written.
// v0 SKELETON (kit set + kit cast): the build replaces it part by part (helpers V2S4_*.tsx).
import React from 'react';
import {World} from '../../lib/World';
import {useTime, TimeShift} from '../../lib/time';
import {XG, mat} from '../../lib/xf';
import {InkScale} from '../../lib/inkComp';
import {CM} from '../palette';
import * as MAP from '../world/map';
import {CanalCast} from '../kit/canal/slots';
import {k4Person} from '../kit/canal/k4k5';
import {S4Set} from '../kit/canal/sets';
import {FingerpostPlaceholder} from '../kit/canal/samples';
import {Her, strideFor} from '../kit/cast';
import {PipTrack} from '../kit/pip';
import type {ToneKey} from '../../lib/Film';
import {S4_START, S4_K, S4_BEATS, S4_HER, S4_HER_HEAD, S4_PIP, s4PlaneDx, s4PathDx, s4Zoom, s4HerSteps} from './V2S4_rig';

export const captionTone: ToneKey[] = [{t: 0, tone: 'dark'}];

/** Her: screen-fixed at x 720 while the world trucks; stops on "objected" and looks west along the post. */
const S4HerV0: React.FC = () => {
  const t = useTime();
  if (t >= S4_BEATS.stop) return <Her x={S4_HER.x} y={S4_HER.feetY} h={S4_HER.h} pose="stopLook" seed="s4her" />;
  return <Her x={S4_HER.x} y={S4_HER.feetY} h={S4_HER.h} pose="walk" view="profile" step={s4HerSteps(t)} stride={strideFor(S4_HER.stepPx, S4_HER.h)} seed="s4her" />;
};

const S4PipV0: React.FC = () => (
  <PipTrack
    x={S4_PIP.inLeap.from[0]}
    y={S4_PIP.inLeap.from[1]}
    size={S4_PIP.size}
    facing="back"
    seed="s4pip"
    keys={[
      {t: S4_PIP.inLeap.t0, hop: {to: S4_PIP.seat, dur: S4_PIP.inLeap.dur, height: S4_PIP.inLeap.height, style: 'leap'}},
      {t: S4_BEATS.pipLand + 0.22, ride: {amp: 1.6, rate: 0.55}, target: [S4_HER_HEAD.x, S4_HER_HEAD.y]},
      {t: S4_BEATS.pipTurnWest, facing: 'left', target: null},
      {t: S4_PIP.outLeap.t0, ride: null, hop: {to: S4_PIP.outLeap.to, dur: S4_PIP.outLeap.dur, height: S4_PIP.outLeap.height, style: 'leap'}},
    ]}
  />
);

const Shot: React.FC = () => {
  const t = useTime(); // film seconds
  const z = s4Zoom(t);
  const dxPath = s4PathDx(t);
  return (
    <XG m={mat.about(mat.scale(z), MAP.SUN1.x, MAP.SUN1.y)}>
      <InkScale zoom={z} k={0.6}>
        <CanalCast person={k4Person}>
          <S4Set
            dxFar={s4PlaneDx(S4_K.far, t)}
            dxBacks={s4PlaneDx(S4_K.backs, t)}
            dxPath={dxPath}
            birdsAt={S4_BEATS.birdsWest}
            towpath={
              <>
                <FingerpostPlaceholder />
                <XG m={mat.translate(-dxPath, 0)}>
                  <S4HerV0 />
                </XG>
              </>
            }
            pip={<S4PipV0 />}
          />
        </CanalCast>
      </InkScale>
    </XG>
  );
};

const V2S4: React.FC = () => (
  <World sky={[CM.sky, CM.bandGold]} horizon={1000}>
    <TimeShift by={-S4_START}>
      <Shot />
    </TimeShift>
  </World>
);
export default V2S4;
