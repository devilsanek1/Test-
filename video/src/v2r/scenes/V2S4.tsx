// V2S4 "The walk home" (lane L3). Film 14.86-20.55 s; TREATMENT.md §3, §5 (row S4), §8; map.ts S4, PIP, MATCHES;
// the build spec docs/v2/lanes/plan_L3.md §1. RIVERSIDE truck from the water, DENSE-CALM: our narrowboat glides with us
// as the foreground (Pip riding its roof); across the canal she walks home WEST along her towpath in profile,
// screen-fixed at x 720 while the world trucks (far roofs 0.3x, terrace backs 0.6x, her towpath 1.0x); the name tag
// builds above her; the truck slows to a stop on "objected" beside the ONE fingerpost; its two dated plates build on
// "military" / "heading"; the camera holds locked (home by 20.40) and the A push-through into SUN1 (20.40-20.70, the
// join's) carries us into V2S5; Pip turns west on "heading" and stays seated (the push sweeps it).
// Everything inside runs on FILM seconds (<TimeShift by={-S4_START}>): map.ts and V2S4_rig.ts land as written.
//
// Parts (back to front; each plane part slides itself by its V2S4_rig plane offset):
//   SunDisc (fixed) · S4Far 0.3x + S4Backs 0.6x (V2S4_far) · S4Path 1.0x with the bare post inside (V2S4_path,
//   V2S4_post S4Post) · S4Her screen-fixed (V2S4_her) · S4Canal 1.0x (V2S4_path) · S4Boat screen-fixed + near water 2.0x
//   (V2S4_boat) · S4Pip (V2S4_pip) · S4Plates (V2S4_post: the arrow plates, ABOVE Pip and the boat, so nothing ever
//   moves over their lettering) · S4Tag (V2S4_tag).
// No camera move (the 6 % push is retired: no zoom in a hold): the truck is the planes' own parallax, the hold after the
// stop is locked, and SUN1 sits at (250, 650) r 65 on screen for the push-through.
import React from 'react';
import {World} from '../../lib/World';
import {TimeShift} from '../../lib/time';
import {Sky} from '../../lib/sky';
import {S4_SKY} from '../world/skies';
import {CM} from '../palette';
import * as MAP from '../world/map';
import {CanalCast} from '../kit/canal/slots';
import {k4Person} from '../kit/canal/k4k5';
import {SunDisc} from '../kit/canal/sets';
import type {ToneKey} from '../../lib/Film';
import {Lit} from '../../lib/light';
import {Tier} from '../../lib/tier';
import {RIG_CANAL} from '../world/rigs';
import {S4_AIR} from '../world/skies';
import {S4_START} from './V2S4_rig';
import {S4Far, S4Backs} from './V2S4_far';
import {S4Path, S4Canal} from './V2S4_path';
import {S4Boat} from './V2S4_boat';
import {S4Post, S4Plates} from './V2S4_post';
import {S4Her} from './V2S4_her';
import {S4Pip} from './V2S4_pip';
import {S4Tag} from './V2S4_tag';

export const captionTone: ToneKey[] = [{t: 0, tone: 'dark'}];

const Shot: React.FC = () => (
  <CanalCast person={k4Person}>
    <Lit rig={RIG_CANAL}>
      {/* the sky (no truck: it is at infinity): ONE continuous, gentle, dithered sky (lib/sky; world/skies S4_SKY)
          carrying SUN1's warmth low and wide; then the flat disc, no halo */}
      <Sky spec={S4_SKY} />
      <SunDisc x={MAP.S4.sunAtPose.x} y={MAP.S4.sunAtPose.y} r={MAP.S4.sunAtPose.r} />
      {/* TIERS (CRAFT §b): the world is tier C (flat, no line; the far planes calmed toward the air, the rest toward the
          paving); A = her, the name tag, the fingerpost and its plates; B = Pip, her far window, the walkers she passes */}
      <Tier tier="environment" bg={S4_AIR}>
        <S4Far />
      </Tier>
      <Tier tier="environment" bg={S4_AIR}>
        <S4Backs />
      </Tier>
      <S4Path>
        <S4Post />
      </S4Path>
      <S4Her />
      <Tier tier="environment" bg={CM.paving}>
        <S4Canal />
      </Tier>
      <Tier tier="environment" bg={CM.paving}>
        <S4Boat />
      </Tier>
      <S4Pip />
      <S4Plates />
      <S4Tag />
    </Lit>
  </CanalCast>
);

const V2S4: React.FC = () => (
  <World sky={CM.sky} horizon={1000}>
    <TimeShift by={-S4_START}>
      <Shot />
    </TimeShift>
  </World>
);
export default V2S4;
