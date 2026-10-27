// V2S7 "Google says" (lane L5). Film 28.06-32.93 s (visible under the wipe to 33.16); TREATMENT.md section 5 row S7,
// section 8 (V3, V12, V14, V15, A5), section 9; STYLE.md (the definitive look); map.ts S7, B, BOARD_BOLLARD, SUN2.
// Words: "But Google says it follows its AI principles and bans retaliation "of any kind"." (28.31-32.70)
//
// Google's canal wing at human size from its west-end forecourt, looking north at sunset (the same light as S8, A5):
// Google's A-board GOOGLE SAYS at B, Pip sitting on the board bollard watching it (no reaction), the "Google" canopy
// right of the board, plain lit windows, two young planes with festoons, a fountain basin, a cafe, bikes; the west
// gap past the wing's corner with far London roofs and SUN2 setting behind them (the match from S6's morning sun).
// DENSE-CALM and uninterrupted 28.31-32.70: people cross sideways behind the board, the jets rise and fall, leaves
// drop, and ON "principles" (30.04) the forecourt lights up in one run (A5: her lamps run on "facts" in S8).
//
// Camera (V2S7_pip s7CamAt): the ONE 4 % story push about B's centre 28.40-30.04 (landing on "principles", B exact)
// + a 2D float within +-12 px of home, zero at 30.04. Every WORLD layer sits in that camera; the sky (World, = S8's)
// and SUN2 (260, 620) r 45 are screen-fixed (the sun sets behind the far roofs; it never rims the building).
// Pip: 28.06-28.22 the second half of the hop across the cut in SCREEN space (pipHopAt), then seated in the camera.
// The wipe into S8 (32.70-33.16) is V2S7_wiper's band-safe narrowboat: `export const Wiper`.
// Parts: V2S7_rig (numbers), V2S7_set (the set), V2S7_life (life), V2S7_board (the board), V2S7_pipdraw (Pip),
// V2S7_wiper (the wipe), V2S7_pip (the camera and the hop, shared with V2S6).
import React from 'react';
import {World} from '../../lib/World';
import {useTime} from '../../lib/time';
import {XG, mat} from '../../lib/xf';
import {CM, skyBands} from '../palette';
import {SUN2} from '../world/map';
import type {ToneKey, WiperComponent} from '../../lib/Film';
import {s7CamAt, S7_T0} from './V2S7_pip';
import {runAt} from './V2S7_rig';
import {
  S7SkyClipDefs, SkyClip, S7SkyBand, S7Far, S7TreeLTrunk, S7TreeLCrown, S7TreeRTrunk, S7TreeRCrown, S7TreeLights, S7Wing,
  S7Steps, S7Ground, S7Shadows, S7Bollard, S7Basin, S7BasinLights, S7CafeBack, S7CafeT1Chairs, S7CafeNear, S7Rack,
  S7Planter,
} from './V2S7_set';
import {
  S7WalkersA, S7WalkersBC, S7StaffInside, S7StaffOutside, S7StepSitters, S7CafeT1People, S7CafeNearPeople, S7FarWalkers,
  S7Jets, S7Water, S7Festoons, S7CafeLights, S7FallingLeaves, S7GroundLeaves, S7Smoke, S7Steam, S7Pigeons,
  S7GroundPigeons,
} from './V2S7_life';
import {S7Board} from './V2S7_board';
import {S7PipHop, S7PipSeat} from './V2S7_pipdraw';
import {S7Wiper} from './V2S7_wiper';

export const captionTone: ToneKey[] = [{t: 0, tone: 'dark'}];

/** SUN2: screen-fixed, the one orange (a plain flat disc, as S6 draws it: the match-cut at 28.06). */
const Sun2: React.FC = () => <circle cx={SUN2.x} cy={SUN2.y} r={SUN2.r} fill={CM.sun} />;

const V2S7: React.FC = () => {
  const t = useTime();
  const c = s7CamAt(S7_T0 + t);
  const cam = mat.compose(mat.translate(c.dx, c.dy), mat.about(mat.scale(c.z), c.ax, c.ay));
  const litTrees = t >= runAt('treeLights');
  const litBasin = t >= runAt('basinLights');
  return (
    <World sky={skyBands('sunset', true)} horizon={900}>
      <S7SkyBand />
      <Sun2 />
      <XG m={cam}>
        <S7SkyClipDefs />
        <SkyClip>
          <S7Far t={t} />
          <S7Smoke />
          <S7FarWalkers />
        </SkyClip>
        <S7Wing behindDoor={<S7StaffInside />} />
        <S7Pigeons />
        <S7Steps />
        <S7Ground />
        <S7Shadows />
        <SkyClip>
          <S7Festoons />
        </SkyClip>
        <S7StaffOutside />
        <S7StepSitters />
        <S7WalkersA />
        <S7TreeRTrunk />
        <S7TreeLTrunk />
        <S7TreeLights lit={litTrees} />
        <S7FallingLeaves />
        <SkyClip>
          <S7TreeRCrown />
          <S7TreeLCrown />
        </SkyClip>
        <S7WalkersBC />
        <S7Board />
        <S7Bollard />
        <S7PipSeat />
        <S7Basin />
        <S7Water />
        <S7BasinLights lit={litBasin} />
        <S7Jets />
        <S7CafeBack />
        <S7CafeT1People />
        <S7CafeT1Chairs />
        <S7Rack />
        <S7GroundPigeons />
        <S7GroundLeaves />
        <S7CafeNear />
        <S7CafeLights />
        <S7Steam />
        <S7CafeNearPeople />
        <S7Planter />
      </XG>
      <S7PipHop />
    </World>
  );
};
export default V2S7;

/** The narrowboat wipe into V2S8 (32.70-33.16, dir 'left'): band-safe, no Pip (V2S7_wiper). */
export const Wiper: WiperComponent = S7Wiper;
