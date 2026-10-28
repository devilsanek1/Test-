// V2S7 "Google says" (lane L5), the conform to the approved look (G4 v4; RESUME_2026-10-28; DIRECTION, CRAFT §a-§g).
// Film 28.10-32.93 s (visible under the narrowboat wipe to 33.16); TREATMENT section 5 row S7, section 8 (V3, V12, V14,
// V15, A5); THROUGHLINE §4-§6; conform_L5 §3, §7. Words: "But Google says it follows its AI principles and bans
// retaliation "of any kind"." (28.31-32.70)
//
// Google's canal wing from its west-end forecourt at a standing eye level (ONE camera, V2S7_plan S7_CAM: eye 1.6 m,
// horizon 897, VP (540, 897)), looking north at sunset: Google's board GOOGLE SAYS at B is the subject (tier A, the
// whole shot); Pip sits on the board bollard and watches it (no reaction: V14); the wing behind is a calm field (its
// shaded brick, tone-on-tone lit windows, the lit lobby, the canopy "Google"); the west strip left of the board shows
// two people at rest, the far street's plane trees and roofs on the sunset band; the bottom third is things, few and
// big, cut by the edges (the cafe table and chairs with a coat over one, a planter of grasses, the fountain basin).
// Life takes turns (<= 3 noticeable at once): a staffer going in, the cyclist, a staffer coming out; the festoon lights
// in three switch-ons (film frames 1812 / 1836 / 1848); leaves and motes SEEN at phone size; steady jets.
//
// Camera: the ONE 4 % story push about B's centre 28.40-30.04 (landing on "principles", B exact), identical on every
// plane (one XG); then a gentle PARALLAX float 30.20-32.50, each plane its own share (V2S7_float S7Plane; home at
// 30.04 and from 32.50: the wipe starts at rest). The sky rides the push but never floats; SUN2 (260, 620) r 45 is
// screen-fixed (the S6 -> S7 push-through lands on it at 28.10: what shows in its 7x window is the sun, the sky and
// the board's top rail only). Light: <Lit rig={RIG_CANAL}> (V2S7_light: the sun low at the left).
// Parts: V2S7_plan (the camera and the plan), V2S7_rig (the clock), V2S7_far (sky, sun, the west strip), V2S7_wing,
// V2S7_ground (paving, the plane tree, the bollard), V2S7_near (cafe, planter, basin), V2S7_folk (people, bikes,
// festoon, smoke), V2S7_particles, V2S7_light, V2S7_board, V2S7_pipdraw, V2S7_wiper (the wipe into S8: `Wiper`).
import React from 'react';
import {World} from '../../lib/World';
import {useTime} from '../../lib/time';
import {XG, mat} from '../../lib/xf';
import {Lit} from '../../lib/light';
import {CM} from '../palette';
import {RIG_CANAL} from '../world/rigs';
import type {ToneKey, WiperComponent} from '../../lib/Film';
import {s7PushAt, S7_PLANE, S7_T0} from './V2S7_pip';
import {S7_HORIZON} from './V2S7_plan';
import {S7Plane} from './V2S7_float';
import {S7Sky, S7Sun, S7FarRoofs, S7FarTrees, S7WestEdge} from './V2S7_far';
import {S7WingFront} from './V2S7_wing';
import {S7Ground, S7TreeGrate, S7NearLeaves, S7TreeTrunk, S7TreeCrown, S7Bollard} from './V2S7_ground';
import {S7Cafe, S7Planter, S7BasinWater, S7BasinRims, S7Jets} from './V2S7_near';
import {S7StaffInside, S7StaffOutside, S7Cyclist, S7CafePair, S7FarWalker, S7Bikes, S7Festoon, S7BoatSmoke} from './V2S7_folk';
import {S7Field} from './V2S7_particles';
import {
  S7WingShade, S7WestWallShade, S7BoardShadows, S7BollardForm, S7TreeShadows, S7TrunkForm, S7CrownForm, S7FolkShadows,
  S7CyclistShadow, S7CafeShadows, S7CafeForm, S7BasinContact, S7BasinWaterShade, S7BasinFaceShade,
} from './V2S7_light';
import {S7Board} from './V2S7_board';
import {S7PipSeat} from './V2S7_pipdraw';
import {S7Wiper} from './V2S7_wiper';

export const captionTone: ToneKey[] = [{t: 0, tone: 'dark'}];

const P = S7_PLANE;

const V2S7: React.FC = () => {
  const t = useTime();
  const push = s7PushAt(S7_T0 + t);
  const cam = mat.about(mat.scale(push.z), push.ax, push.ay);
  return (
    <World sky={CM.sky} horizon={S7_HORIZON}>
      <Lit rig={RIG_CANAL}>
        {/* the one continuous sky rides the push (never the float); SUN2 is screen-fixed, flat, on it */}
        <XG m={cam}>
          <S7Sky />
        </XG>
        <S7Sun />
        <XG m={cam}>
          {/* the far street on the sunset band, beyond the west hedge */}
          <S7Plane plane={P.farRoofs}>
            <S7FarRoofs />
          </S7Plane>
          <S7Plane plane={P.trees}>
            <S7FarTrees />
            <S7BoatSmoke />
            <S7FarWalker />
          </S7Plane>
          {/* the forecourt's paving first, each band in its plane (seams on cross joints) */}
          <S7Plane plane={P.plane}>
            <S7Ground band="far" />
            <S7TreeGrate />
          </S7Plane>
          <S7Plane plane={P.subject}>
            <S7Ground band="mid" />
          </S7Plane>
          <S7Plane plane={P.cafe}>
            <S7Ground band="near" />
            <S7NearLeaves />
          </S7Plane>
          {/* +1: the west hedge, the wing (its shade step), what stands along it */}
          <S7Plane plane={P.wing}>
            <S7WestEdge />
            <S7WestWallShade />
            <S7WingFront behindDoor={<S7StaffInside />} />
            <S7WingShade />
            <S7FolkShadows />
            <S7CafePair />
            <S7Bikes />
            <S7StaffOutside />
          </S7Plane>
          <S7Plane plane={P.festoon}>
            <S7Festoon />
          </S7Plane>
          {/* +0.5: the cyclist behind the young plane, the plane, its leaves */}
          <S7Plane plane={P.plane}>
            <S7CyclistShadow />
            <S7Cyclist />
            <S7TreeShadows />
            <S7TreeTrunk />
            <S7TrunkForm />
            <S7TreeCrown />
            <S7CrownForm />
            <S7Field seed="s7/leaves" />
          </S7Plane>
          <S7Plane plane={P.motes}>
            <S7Field seed="s7/motes" />
          </S7Plane>
          {/* 0: Google's board (tier A, its shadows the rig's), Pip on the bollard */}
          <S7Plane plane={P.subject}>
            <S7BoardShadows />
            <S7Board shadow={false} />
            <S7Bollard />
            <S7BollardForm />
            <S7PipSeat />
          </S7Plane>
          {/* the near things: the basin, then the cafe and the planter */}
          <S7Plane plane={P.basin}>
            <S7BasinContact />
            <S7BasinWater />
            <S7BasinWaterShade />
            <S7BasinRims />
            <S7BasinFaceShade />
            <S7Jets />
          </S7Plane>
          <S7Plane plane={P.cafe}>
            <S7CafeShadows />
            <S7Cafe />
            <S7Planter />
            <S7CafeForm />
            <S7Field seed="s7/nearMotes" />
          </S7Plane>
        </XG>
      </Lit>
    </World>
  );
};
export default V2S7;

/** The narrowboat wipe into V2S8 (32.70-33.16, dir 'left'): band-safe, no Pip (V2S7_wiper). */
export const Wiper: WiperComponent = S7Wiper;
