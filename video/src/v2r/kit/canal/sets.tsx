// canal/sets.tsx: whole canal SETS assembled from the kit at the map's positions, one per shot that uses this world.
// Each set is a full-frame layer stack (sky things, far world, the bank across, the water, our bank, life) with the
// story slots left open: lanes pass their own people (K4 via <CanalCast>), Pip (K5) and boards (K3) as children / slot
// props, and keep their camera outside (a set is drawn at the shot's pose, zoom 1.00, screen px = world px).
//   S1Set   RIVERSIDE from our steps: the wing frontal, the west gap (far roofs, the road bridge, SUN0), the far
//           towpath (her line), the water with two moored boats, our steps with the seated public.
//   S2Set   RIVERSIDE from the south towpath: the receding wing + tiers, the five staff windows and hers, the water,
//           our towpath with the newsstand, the bench, the railing, the planter, the bike.
//   S4Set   the walk home: far roofs, gasholders, the viaduct and SUN1; terrace backs; her towpath; the water; the
//           narrowboat gliding with us as the foreground.
//   S8Set   the LANE looking west: the cafe boat moored left with its stern deck, her towpath running to the bend, her
//           house facing down the lane (teal door, W), the terrace row, lamps receding, the low sun over the canal.
// Story events (lamp off, doors, letters, birds lifting, lamps lighting) are props with the TREATMENT's defaults.

import React from 'react';
import {CM, INK_PX} from '../../palette';
import {Fill} from '../../../lib/Fill';
import {useTime} from '../../../lib/time';
import {Batch, Paint, ovalPath, P} from './core';
import {Cloud, Branch, Birds, Pigeons, Ducks, Movers, FallingLeaves, FloatingLeaves, Heron} from './life';
import {FarRoofs, roofRowInto, roadBridgeInto, BridgeBus} from './far';
import {WingS1, s1Layout, wingLedges} from './wing';
import {Towpath, Lamp, Bollard} from './towpath';
import {Water} from './water';
import {Narrowboat} from './boat';
import {Steps} from './steps';
import {CastSlot, PipSlot} from './slots';
import * as MAP from '../../world/map';

/** A flat sun disc (the film's one pop colour), no ink, no glow. */
export const SunDisc: React.FC<{x: number; y: number; r: number}> = ({x, y, r}) => <Fill d={ovalPath(x, y, r, r)} color={CM.sun} offset={false} seed="sun" />;

// ---------------------------------------------------------------- S1

export type S1SetProps = {
  /** Lamp at W clicks off (0.40), doors (map S1_SHEET), canopy letters pop (0.97), birds lift (1.40 bridge, 4.98 far roofs). */
  lampOffAt?: number;
  lettersAt?: number;
  birdsBridgeAt?: number;
  birdsRoofsAt?: number;
  busAt?: number;
  duckLandsAt?: number;
  /** Her figure behind the glass door (f0) and on the towpath: lanes draw her and the ghost row (K4). */
  behindDoor?: React.ReactNode;
  /** Drawn on the far towpath plane (her, the ghosts, walkers). */
  towpath?: React.ReactNode;
  /** Pip on the waterline bollard (a node), or the placeholder seat. */
  pip?: React.ReactNode;
  /** Draw the kit's own ambient walkers on the far towpath (cyclist f15, jogger f96, ...). Default true. */
  walkers?: boolean;
};

export const S1Set: React.FC<S1SetProps> = ({lampOffAt = 0.4, lettersAt = 0.97, birdsBridgeAt = 1.4, birdsRoofsAt = MAP.S1_LIFE_T, busAt = 1.1, duckLandsAt = 2.3, behindDoor, towpath, pip, walkers = true}) => {
  const S = MAP.S1_SHEET;
  const L = s1Layout();
  const led = wingLedges(L);
  return (
    <>
      {/* sky things: the hero cloud (upper right, 2 px/s) and the plane branch in the top-left gutter */}
      <Cloud x={S.heroCloud.x0} y={S.heroCloud.y0 + 40} w={S.heroCloud.x1 - S.heroCloud.x0} h={(S.heroCloud.y1 - S.heroCloud.y0) * 0.7} seed="s1cloud" speed={S.heroCloudDriftPxS} top={CM.paper} />
      <Branch side={-1} y={30} reach={210} drop={190} seed="s1branch" />
      {/* the west gap: SUN0 over far roofs, the road bridge */}
      <SunDisc x={S.sun.x} y={S.sun.y} r={S.sun.r} />
      <FarRoofs x0={-60} x1={420} base={980} top={S.farRoofTopY + 6} seed="s1far" rows={3} win={8} />
      <S1Bridge />
      <BridgeBus deck={S.bridgeDeckY - 16} h={52} at={busAt} from={-140} to={400} seed="s1bus" speed={230} />
      <Birds from={[30, S.bridgeDeckY - 44]} to={[290, S.bridgeDeckY - 50]} n={5} size={13} seed="s1bridgebirds" liftAt={[birdsBridgeAt]} dir={-1} />
      <Birds from={[40, 806]} to={[260, 800]} n={6} size={9} seed="s1roofbirds" liftAt={[birdsRoofsAt]} dir={-1} />
      {/* the water: reflections of the wing, W, the boats; ripples, glints, ducks; two moored boats right */}
      <Water
        y0={1030}
        y1={1216}
        seed="s1water"
        bankShade={9}
        reflTop={1118}
        reflections={[
          {x0: 330, x1: 1080, color: CM.brickLight, depth: 50},
          {x0: 795, x1: 925, color: CM.lamp, depth: 36},
          {x0: 0, x1: 320, color: CM.brick, depth: 30},
          {x0: 548, x1: 712, color: CM.lamp, depth: 26},
        ]}
        ripples={30}
        glints={16}
        current={-9}
      />
      {/* the far towpath (her line) behind the wing's base, the wing, the towpath furniture */}
      <Towpath x0={-40} x1={1120} top={1068} edge={1111} coping={15} seed="s1farpath" leaves={10} ink={INK_PX.far} rings={[380, 640, 900]} bend={s1Bend} />
      <WingS1 lampOffAt={lampOffAt} lettersAt={lettersAt} behindDoor={behindDoor} />
      <Pigeons ledge={led.canopy} n={4} size={17} seed="s1canopy" shuffleAt={[0.15]} />
      <Pigeons ledge={[led.sills[1][0] + 10, led.sills[1][1] - 10, led.sills[1][2]]} n={2} size={15} seed="s1sill" />
      <Lamp x={762} y={1098} h={350} seed="s1lampW" />
      <Lamp x={1046} y={1100} h={366} seed="s1lampE" />
      <Bollard x={430} y={1108} h={22} seed="s1b1" />
      <Bollard x={760} y={1108} h={22} seed="s1b2" />
      {walkers ? (
        <Movers
          idPrefix="s1w"
          movers={[
            {pose: 'cycle', from: [1120, 1100], to: [-80, 1060], h: [168, 150], speed: 200, enter: 0.25, seed: 'cyc1'},
            {pose: 'jog', from: [1150, 1101], to: [-80, 1060], h: [170, 150], speed: 120, enter: 1.6, seed: 'jog1', acc: 'cap'},
            {pose: 'walk', from: [-60, 1060], to: [1160, 1100], h: [150, 168], speed: 45, phase: 0.55, seed: 'walkE', acc: 'tote'},
            {pose: 'jog', from: [-80, 1060], to: [1150, 1101], h: [150, 170], speed: 125, enter: 3.25, seed: 'jog2', acc: 'beanie'},
          ]}
        />
      ) : null}
      {towpath}
      <Narrowboat x={786} water={1136} len={560} h={78} dir={-1} seed="s1boatA" cabin={CM.sage} topView={8} roofItems panel={false} bursts={[0.7]} />
      <Narrowboat x={930} water={1192} len={520} h={88} dir={-1} seed="s1boatB" cabin={CM.coatOat} topView={10} roofItems panel smoke={false} />
      <Ducks ducks={[{x: 470, y: 1180, size: 26, drake: true}, {x: 520, y: 1192, size: 24}, {x: 250, y: 1160, size: 22, vx: -6}]} seed="s1ducks" landAt={duckLandsAt} land={{from: [120, 1080], to: [330, 1196], size: 26}} />
      <FloatingLeaves y0={1150} y1={1210} n={9} size={13} seed="s1fl" current={-8} />
      {/* our bank: the steps and the seated public; Pip on the waterline bollard */}
      <Steps />
      {pip ?? <PipSlot seat={{id: 'V2S1', x: MAP.S1_BOLLARD.x, y: MAP.S1_BOLLARD.y, size: 100}} />}
      <FallingLeaves box={[0, 640, 260, 1180]} n={4} size={13} seed="s1fall" wind={-26} />
    </>
  );
};

/** The S1 far towpath bends away at the left (map S1_TOWPATH_FEET): the y offset from the straight at screen x. */
const s1Bend = (x: number) => MAP.s1TowpathFeetY(x) - MAP.S1_SHEET.herLineFeetY;

/** S1's road bridge across the west gap, beyond the bend: the deck at the map's y, an arch the canal and the towpath
 *  pass under (its shade a light stone, so the ghost row's ink still reads in front of it). */
const S1Bridge: React.FC = () => {
  const b = React.useMemo(() => {
    const b = new Batch();
    const deck = MAP.S1_SHEET.bridgeDeckY;
    roadBridgeInto(b, -60, 420, deck, 1048, 96, 190, 's1bridge', INK_PX.far);
    return b;
  }, []);
  return <Paint b={b} seed="s1bridge" />;
};

export {roofRowInto, Heron, CastSlot, P};
