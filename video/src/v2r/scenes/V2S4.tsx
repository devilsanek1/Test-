// V2S4 "The walk home" (lane L3). Film 14.86-20.55 s; TREATMENT.md §3, §5 (row S4), §8; map.ts S4, PIP, MATCHES;
// the build spec docs/v2/lanes/plan_L3.md §1. RIVERSIDE truck from the water, DENSE-CALM: our narrowboat glides with us
// as the foreground (Pip riding its roof); across the canal she walks home WEST along her towpath in profile,
// screen-fixed at x 720 while the world trucks (far roofs 0.3x, terrace backs 0.6x, her towpath 1.0x); the name tag
// builds above her; the truck slows to a stop on "objected" beside the ONE fingerpost; its two dated plates build on
// "military" / "heading"; a 6 % push toward SUN1; Pip leaps into the sun, mid-air at the sun match-cut into V2S5.
// Everything inside runs on FILM seconds (<TimeShift by={-S4_START}>): map.ts and V2S4_rig.ts land as written.
//
// Parts (back to front; each plane part slides itself by its V2S4_rig plane offset):
//   SunDisc (fixed) · S4Far 0.3x + S4Backs 0.6x (V2S4_far) · S4Path 1.0x with the bare post inside (V2S4_path,
//   V2S4_post S4Post) · S4Her screen-fixed (V2S4_her) · S4Canal 1.0x (V2S4_path) · S4Boat screen-fixed + near water 2.0x
//   (V2S4_boat) · S4Pip (V2S4_pip) · S4Plates (V2S4_post: the arrow plates, ABOVE Pip and the boat, so nothing ever
//   moves over their lettering; Pip's leap into the sun passes behind them) · S4Tag (V2S4_tag).
// ONE camera: the 6 % push about SUN1 18.40-20.10 (V2S4_rig `s4Zoom`, a soft landing, then locked to the cut), so SUN1
// is exactly (250, 650) r 65 on screen at 20.55. No other camera move (the truck is the planes' own parallax).
import React from 'react';
import {World} from '../../lib/World';
import {useTime, TimeShift} from '../../lib/time';
import {XG, mat} from '../../lib/xf';
import {InkScale} from '../../lib/inkComp';
import {CM} from '../palette';
import * as MAP from '../world/map';
import {CanalCast} from '../kit/canal/slots';
import {k4Person} from '../kit/canal/k4k5';
import {SunDisc} from '../kit/canal/sets';
import type {ToneKey} from '../../lib/Film';
import {S4_START, s4Zoom} from './V2S4_rig';
import {S4Far, S4Backs} from './V2S4_far';
import {S4Path, S4Canal} from './V2S4_path';
import {S4Boat} from './V2S4_boat';
import {S4Post, S4Plates} from './V2S4_post';
import {S4Her} from './V2S4_her';
import {S4Pip} from './V2S4_pip';
import {S4Tag} from './V2S4_tag';

export const captionTone: ToneKey[] = [{t: 0, tone: 'dark'}];

const Shot: React.FC = () => {
  const t = useTime(); // film seconds
  const z = s4Zoom(t);
  const a = MAP.S4.camera.push.anchor;
  return (
    <XG m={mat.about(mat.scale(z), a.x, a.y)}>
      <InkScale zoom={z} k={0.6}>
        <CanalCast person={k4Person}>
          <SunDisc x={MAP.S4.sunAtPose.x} y={MAP.S4.sunAtPose.y} r={MAP.S4.sunAtPose.r} />
          <S4Far />
          <S4Backs />
          <S4Path>
            <S4Post />
          </S4Path>
          <S4Her />
          <S4Canal />
          <S4Boat />
          <S4Pip />
          <S4Plates />
          <S4Tag />
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
