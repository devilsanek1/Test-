// V2S1 helper (lane L1): the S1 WORLD, everything but the story slots (TREATMENT section 4 layout, map S1_SHEET):
// the sky things, the west gap (SUN0, far roofs, the road bridge), the far towpath and its bend, Google's canal wing
// (W, the glass doors, the canopy letters), the water and the two moored boats, the far-towpath life. Our bank (the
// steps, the seated public) is the `seated` slot (V2S1_steps / V2S1_public); Pip and its bollard the `pip` slot.
// Composed from the lane's own parts (each its own file):
//   V2S1_set_far    the west gap: far roofs + their f0 underdrawing, SUN0, the bridge, the bus, the cyclist, two flocks
//   V2S1_set_wing   the wing: facade, panes switching, W, the lobby (+ behindDoor), the sliding leaves, pigeons
//   V2S1_set_life   the water, the far towpath and its bend, lamps and bollards, the boats, the far-towpath life, the
//                   plane branch
//   V2S1_set_core   CellPaint (fills split by region, so the flood ripples shape by shape; every stroke CM.ink) and
//                   Under (the frame-0 underdrawing of the planes that get no ink in colour)
// z-order (the slot contract): sky things, west gap, water, far towpath, the wing (behindDoor inside, between the lobby
// and the door glass), the door leaves, far-towpath life, lamps and bollards, {towpath} (her + the row), the moored
// boats, ducks, floating leaves, {seated}, {pip}, falling leaves. Nothing of our bank (y >= 1215) but falling leaves.
import React from 'react';
import {CM} from '../palette';
import {Cloud, Ducks, FloatingLeaves, FallingLeaves} from '../kit/canal/life';
import {CanalCast} from '../kit/canal/slots';
import {k4Person} from '../kit/canal/k4k5';
import * as MAP from '../world/map';
import {S1WestGap} from './V2S1_set_far';
import {S1Wing, S1DoorLeaves, S1WingLife} from './V2S1_set_wing';
import {S1Water, S1FarTowpath, S1PathFurniture, S1PathFurnitureUnder, S1Boats, S1FarLife, S1PlaneBranch} from './V2S1_set_life';

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

export const S1World: React.FC<S1WorldProps> = ({behindDoor, towpath, seated, pip}) => (
  <CanalCast person={k4Person}>
    {/* sky things: the hero cloud (upper right, 2 px/s), the plane branch in the top-left gutter */}
    <Cloud x={S.heroCloud.x0} y={S.heroCloud.y0 + 40} w={S.heroCloud.x1 - S.heroCloud.x0} h={(S.heroCloud.y1 - S.heroCloud.y0) * 0.7} seed="s1cloud" speed={S.heroCloudDriftPxS} top={CM.paper} />
    <S1PlaneBranch />
    {/* the west gap: far roofs, SUN0, the road bridge and its traffic, the two flocks */}
    <S1WestGap />
    {/* the water, the far towpath bending away at the left */}
    <S1Water />
    <S1FarTowpath />
    <S1PathFurnitureUnder />
    {/* the wing (her behind the glass inside it), then the sliding leaves, the pigeons */}
    <S1Wing behindDoor={behindDoor} />
    <S1DoorLeaves />
    <S1WingLife />
    {/* far-towpath life, lamps and bollards */}
    <S1FarLife />
    <S1PathFurniture />
    {towpath}
    {/* the moored boats (the right rail), ducks, floating leaves */}
    <S1Boats />
    <Ducks ducks={[{x: 470, y: 1182, size: 26, drake: true}, {x: 522, y: 1194, size: 24}, {x: 250, y: 1166, size: 22, vx: -6}]} seed="s1ducks" landAt={2.3} land={{from: [120, 1080], to: [330, 1198], size: 26}} />
    <FloatingLeaves y0={1150} y1={1210} n={9} size={13} seed="s1fl" current={-8} />
    {seated}
    {pip}
    <FallingLeaves box={[0, 640, 260, 1180]} n={4} size={13} seed="s1fall" wind={-26} />
  </CanalCast>
);
