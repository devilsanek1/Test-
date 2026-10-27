// V2S1 helper (lane L1): the S1 WORLD, everything but the story slots (TREATMENT section 4 layout, map S1_SHEET):
// the sky things, the west gap (SUN0, far roofs, the road bridge), the far towpath and its bend, Google's canal wing
// (W, the glass doors, the canopy letters), the water and the two moored boats, the far-towpath life. Our bank (the
// steps, the seated public) is the `seated` slot (V2S1_steps / V2S1_public); Pip and its bollard the `pip` slot.
// Composed from the lane's own parts (each its own file):
//   V2S1_set_far    the west gap: far roofs, SUN0, the bridge, the bus (once, 1.10), the five birds (1.40)
//   V2S1_set_wing   the wing: facade, panes (one switch, 3.90), W, the lobby (+ behindDoor), the sliding leaves, pigeons
//   V2S1_set_life   the water, the far towpath and its bend, lamps and bollards, the boats, the one far jogger, the
//                   plane branch
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
import {CM} from '../palette';
import {Cloud, Ducks} from '../kit/canal/life';
import {CanalCast} from '../kit/canal/slots';
import {k4Person} from '../kit/canal/k4k5';
import * as MAP from '../world/map';
import {S1WestGap} from './V2S1_set_far';
import {S1Wing, S1DoorLeaves, S1WingLife} from './V2S1_set_wing';
import {S1Water, S1FarTowpath, S1PathFurniture, S1Boats, S1FarLife, S1PlaneBranch} from './V2S1_set_life';
import {S1BoatStrips, S1TowpathShadows, S1WingShades} from './V2S1_light';

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

/** Tier C: the environment (no outlines, hairlines only for the things that ARE lines). The slots keep their own
 *  tiers: {towpath} her + the row (A, V2S1_row), {seated} the lead's bank, {pip} Pip (B) and its bollard (C). */
const Env: React.FC<{children?: React.ReactNode}> = ({children}) => <Tier tier="environment">{children}</Tier>;

export const S1World: React.FC<S1WorldProps> = ({behindDoor, towpath, seated, pip}) => (
  <CanalCast person={k4Person}>
    <Env>
      {/* sky things: the hero cloud (upper right, 2 px/s) + one thin bar, the plane branch in the top-left gutter */}
      <Cloud x={S.heroCloud.x0} y={S.heroCloud.y0 + 40} w={S.heroCloud.x1 - S.heroCloud.x0} h={(S.heroCloud.y1 - S.heroCloud.y0) * 0.7} seed="s1cloud" speed={S.heroCloudDriftPxS} top={CM.paper} />
      <Cloud x={CLOUD_BAR.x} y={CLOUD_BAR.y} w={CLOUD_BAR.w} h={CLOUD_BAR.h} seed="s1cloudbar" speed={CLOUD_BAR.speed} />
      <S1PlaneBranch />
      {/* the west gap: far roofs, SUN0, the road bridge, the bus once (1.10), the five birds (1.40) */}
      <S1WestGap />
      {/* the water, the far towpath bending away at the left; the one far jogger, seen through the bridge's arch */}
      <S1Water />
      <S1FarTowpath />
      <S1FarLife />
    </Env>
    {/* the wing (her behind the glass inside it; W and the door tier themselves), the sliding leaves, the pigeons */}
    <Env>
      <S1Wing behindDoor={behindDoor} />
      <S1DoorLeaves />
      <S1WingShades />
      <S1WingLife />
    </Env>
    {/* ground shadows on the far towpath, then its lamps and bollards, then her and the row */}
    <S1TowpathShadows />
    <Env>
      <S1PathFurniture />
    </Env>
    {towpath}
    {/* the moored boats (the right rail) with their waterline strips; the ducks sit still */}
    <Env>
      <S1BoatStrips which="A" />
      <S1BoatStrips which="B" />
      <S1Boats />
      <Ducks ducks={[{x: 470, y: 1182, size: 26, drake: true}, {x: 522, y: 1194, size: 24}, {x: 300, y: 1158, size: 22}]} seed="s1ducks" />
    </Env>
    {seated}
    {/* (S1BankShade retired: the near foreground's big things carry their own form and front shades now) */}
    {pip}
  </CanalCast>
);
