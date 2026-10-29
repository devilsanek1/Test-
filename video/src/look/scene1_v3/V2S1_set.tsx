// V2S1 helper (lane L1): the S1 WORLD, everything but the story slots (TREATMENT section 4 layout, map S1_SHEET):
// the sky things, the west gap (SUN0, far roofs, the road bridge), the far towpath and its bend, Google's canal wing
// (W, the glass doors, the canopy letters), the water and the two moored boats, the far-towpath life. Our bank (the
// steps, the seated public) is the `seated` slot (V2S1_steps / V2S1_public); Pip and its bollard the `pip` slot.
// Composed from the lane's own parts (each its own file):
//   V2S1_set_far    the west gap: far roofs, SUN0, the bridge, the bus (once, 1.10), the five birds (1.40)
//   V2S1_set_wing   the wing: facade, panes (one switch, 3.90), W, the lobby (+ behindDoor), the sliding leaves, pigeons
//   V2S1_set_life   the far towpath and its bend, lamps and bollards, the boats, the one far jogger, the plane branch
//   V2S1_water      the canal (the film's one shared water, src/lib/water.tsx: S1's spec) and the duck on it
//   V2S1_set_core   CellPaint (fills split by region, so the flood ripples shape by shape)
//   V2S1_light      the light layers (RIG_CANAL): the fins' shades, the soffit, the towpath's contact and cast shadows,
//                   the boats' waterline strips
// TIERS (CRAFT §b): everything here is tier C (<Tier tier="environment">: flat shapes, no line) but W and the door,
// which promote themselves on their spans (V2S1_clock S1_TIER_A); the slots carry their own tiers.
// z-order (the slot contract): sky things, west gap, water, far towpath (+ the far jogger), the wing (behindDoor inside,
// between the lobby and the door glass), the door leaves, the wing's shades, pigeons, the towpath's shadows, lamps and
// bollards, {towpath} (her + the row), the moored boats, ducks, {seated}, {pip}.
import React from 'react';
import {Tier} from '../../lib/tier';
import {CM} from '../../v2r/palette';
import {Cloud} from '../../v2r/kit/canal/life';
import {CanalCast} from '../../v2r/kit/canal/slots';
import {k4Person} from '../../v2r/kit/canal/k4k5';
import * as MAP from '../../v2r/world/map';
import {S1WestGap} from './V2S1_set_far';
import {S1Wing, S1DoorLeaves, S1WingLife} from './V2S1_set_wing';
import {S1FarTowpath, S1PathFurniture, S1Boats, S1FarLife, S1PlaneBranch} from './V2S1_set_life';
import {S1Water, S1Duck} from './V2S1_water';
import {S1BoatStrips, S1TowpathShadows, S1WingShades} from './V2S1_light';
import {S1Plane, S1PlaneStack, S1_PLANE} from './V2S1_float';
import {useSwitches} from './switches';
import {CloudSlot, SpraySlot, TextureSlot} from './engine';
import {useTime} from '../../lib/time';
import {S1PipShadows} from './V2S1_pip';

export type S1WorldProps = {
  /** Her figure behind the glass doors (between the lobby and the door glass). */
  behindDoor?: React.ReactNode;
  /** The far towpath plane: her and the ghost row (drawn in front of the wing and the far-towpath life). */
  towpath?: React.ReactNode;
  /** Our bank y 1215-1920: the steps and the seated public (drawn after the water and the boats). */
  seated?: React.ReactNode;
  /** Pip on its waterline bollard (drawn after the steps). */
  pip?: React.ReactNode;
};

const S = MAP.S1_SHEET;
/** The ONE thin cloud bar (y < 290, clear of the caption band 317-556): drifting the hero cloud's way, 9 px/s. */
const CLOUD_BAR = {x: 40, y: 236, w: 300, h: 20, speed: 9} as const;

/** The sky things (fixed: the sky never floats): the hero cloud and the thin bar, or under the cloud switch lane N's
 *  hero cumulus alone; in the sky's mottle (the same seed as the sky's other groups: one surface). */
const S1SkyThings: React.FC = () => {
  const sw = useSwitches();
  const t = useTime();
  return (
    <TextureSlot sw={sw} t={t} plane={S1_PLANE.sky} sky>
      <CloudSlot
        sw={sw}
        fallback={<Cloud x={S.heroCloud.x0} y={S.heroCloud.y0 + 40} w={S.heroCloud.x1 - S.heroCloud.x0} h={(S.heroCloud.y1 - S.heroCloud.y0) * 0.7} seed="s1cloud" speed={S.heroCloudDriftPxS} top={CM.paper} />}
      />
      {sw.cloud ? null : <Cloud x={CLOUD_BAR.x} y={CLOUD_BAR.y} w={CLOUD_BAR.w} h={CLOUD_BAR.h} seed="s1cloudbar" speed={CLOUD_BAR.speed} />}
    </TextureSlot>
  );
};

/** Tier C: the environment (no outlines, hairlines only for the things that ARE lines). The slots keep their own
 *  tiers: {towpath} her + the row (A, V2S1_row), {seated} the lead's bank, {pip} Pip (B) and its bollard (C). */
const Env: React.FC<{children?: React.ReactNode}> = ({children}) => <Tier tier="environment">{children}</Tier>;

export const S1World: React.FC<S1WorldProps> = ({behindDoor, towpath, seated, pip}) => {
  const sw = useSwitches();
  return (
  <CanalCast person={k4Person}>
    {/* every group rides its plane's share of the shot's parallax float (V2S1_float; the sky and its clouds fixed) */}
    <Env>
      {/* sky things: the hero cloud (upper right, 2 px/s) + one thin bar (fixed: the sky never floats) */}
      {/* (the look test's cloud switch: lane N's hero cumulus in the hero cloud's spot, and no bar (the one cloud; the
          bar's 9 px/s is over N7's 2-6); the sky's mottle, its own seed, no float) */}
      <S1SkyThings />
      {/* the plane branch in the top-left gutter: a NEAR twig (the full float) */}
      {/* (the look test's texture: none on the spray: the wind turns its branch, a rotated group, which a filter would
          soften; on a spray of small leaves the mottle would not show) */}
      <S1Plane plane={S1_PLANE.near} texture={false}>
        {/* (the look test's foliage switch: lane N's London-plane leaf spray; off, v2's twig) */}
        <SpraySlot sw={sw} fallback={<S1PlaneBranch />} />
      </S1Plane>
      {/* the west gap: far roofs + SUN0 (+4), the calm tower (+3), the road bridge, its bus and birds (+2); the one far
          jogger seen through the bridge's arch rides the bridge's plane (its clip is the arch) */}
      <S1WestGap />
      <S1Plane plane={S1_PLANE.bridge} texture={false}>
        <S1FarLife />
      </S1Plane>
      {/* the water */}
      <S1Plane plane={S1_PLANE.water}>
        <S1Water />
      </S1Plane>
    </Env>
    {/* the subject's plane: the far towpath, the wing (her behind the glass inside it; W and the door tier themselves),
        the sliding leaves, the pigeons, the towpath's shadows, lamps and bollards, her and the row */}
    {/* (the look test's texture: the light layers (the wing's shades, the towpath's shadows) spill past the towpath's
        edge onto the water's group: they go outside the plane's mottle, between its mottled layers) */}
    <S1PlaneStack
      plane={S1_PLANE.subject}
      layers={[
        {
          node: (
            <Env>
              <S1FarTowpath />
              <S1Wing behindDoor={behindDoor} />
              <S1DoorLeaves />
            </Env>
          ),
        },
        {
          node: (
            <Env>
              <S1WingShades />
            </Env>
          ),
          mottle: false,
        },
        {
          node: (
            <Env>
              <S1WingLife />
            </Env>
          ),
        },
        {node: <S1TowpathShadows />, mottle: false},
        {
          node: (
            <>
              <Env>
                <S1PathFurniture />
              </Env>
              {towpath}
            </>
          ),
        },
      ]}
    />
    {/* (the look test's texture: none on the boats: the kit draws them as scaled groups, which a filter would soften, and
        their strips multiply onto the WATER, another group: drawn outside it anyway) */}
    <S1Plane
      plane={S1_PLANE.boats}
      texture={false}
      under={
        <Env>
          <S1BoatStrips which="A" />
          <S1BoatStrips which="B" />
        </Env>
      }
    >
      <Env>
        <S1Boats />
        {/* one duck at its water's scale (one camera: ~127 px/m there, a mallard ~0.58 m: ~70 px), by the bend, clear
            of Pip's zone and the sun's glitter path (the pale drake read as a ghost: the art director on v3); its contact
            lens and mirrored underside are the water's (V2S1_water), its paper V wake is gone */}
        <S1Duck />
      </Env>
    </S1Plane>
    {/* our bank and its near things split their own planes (V2S1_steps) */}
    {seated}
    {/* (S1BankShade retired: the near foreground's big things carry their own form and front shades now) */}
    {/* (the look test's texture: none on Pip and its bollard (the kit draws Pip as scaled groups, which a filter would
        soften); the bollard's contact and cast shadows fall on the landing, the seated slot's group: `under`) */}
    <S1Plane plane={S1_PLANE.bank} under={pip ? <S1PipShadows /> : null} texture={false}>
      {pip}
    </S1Plane>
  </CanalCast>
  );
};
