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

import React, {useMemo} from 'react';
import {CM, INK_PX} from '../../palette';
import {Fill} from '../../../lib/Fill';
import {useTime} from '../../../lib/time';
import {line} from '../../../lib/sketch';
import {Batch, Paint, ovalPath, P, Pt, domePath, shadowInto} from './core';
import {Cloud, Branch, Birds, Pigeons, Ducks, Movers, FallingLeaves, FloatingLeaves, Heron, Puffs} from './life';
import {FarRoofs, roofRowInto, roadBridgeInto, BridgeBus, gasholderInto, viaductInto, warehouseInto, ViaductTrain} from './far';
import {TerraceRow, terraceBacksInto, potsInto} from './terrace';
import {XG, mat} from '../../../lib/xf';
import {WingS1, s1Layout, wingLedges} from './wing';
import {Towpath, Lamp, Bollard} from './towpath';
import {Water} from './water';
import {Narrowboat, PerspBoat, CafeDeck} from './boat';
import {WingS2, S2_STORY, s2x, s2y, s2g, s2u, StoryState} from './wall';
import {Newsstand} from './newsstand';
import {Railing, Planter, Bench, bikeInto, drainInto, Tree, benchInto, binInto, planterInto, bollardInto} from './towpath';
import {lerp, rng, leafPath, lobes} from './core';
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

// ---------------------------------------------------------------- S2

/** Our bank's water edge in S2 (the railing's foot) and the railing's top (a post at x 590 tops out at y 1050:
 *  Pip's seat, map S2.pipSeat). */
export const S2_BANK = {
  edge: (x: number) => lerp(1192, 1118, x / 1080),
  railTop: (x: number) => lerp(1072, 1032, x / 1080) + (x === 590 ? 0 : 0),
};
/** The far bank in S2: the wing's base, the far towpath (18 g deep) and its coping (6 g), per column position u. */
const s2FarCoping = (u: number) => s2y('base', u) + 24 * s2g(u);

export type S2SetProps = {
  story?: Record<string, StoryState>;
  staffCoolAt?: number;
  storyOverlay?: React.ComponentProps<typeof WingS2>['storyOverlay'];
  /** The A-board TOLD THE BBC (K3) at map S2.aBoard; the bench people (K4) at map S2 reporterX / stafferX. */
  aBoard?: React.ReactNode;
  bench?: React.ReactNode;
  pip?: React.ReactNode;
  /** The passing boat (11.0 in the film): enters at this time from the VP side. */
  boatAt?: number;
  /** Near passers-by and the dog (slots). Default true. */
  people?: boolean;
};

export const S2Set: React.FC<S2SetProps> = ({story, staffCoolAt, storyOverlay, aBoard, bench, pip, boatAt = 2.0, people = true}) => {
  const t = useTime();
  const uEnd = s2u(1120);
  const far = useMemo(() => {
    const b = new Batch();
    const r = rng('s2far');
    // the water: between the far coping and our edge
    const top: Pt[] = [];
    for (let u = -2.5; u <= uEnd; u += 0.25) top.push([s2x(u), s2FarCoping(u) - 2]);
    b.poly(CM.water, [...top, [1120, 1300], [-40, 1300]]);
    // the far towpath: paving band + coping + the coping's shade on the water
    const band = (a: (u: number) => number, c: (u: number) => number): Pt[] => {
      const p: Pt[] = [];
      for (let u = -2.5; u <= uEnd; u += 0.25) p.push([s2x(u), a(u)]);
      for (let u = uEnd; u >= -2.5; u -= 0.25) p.push([s2x(u), c(u)]);
      return p;
    };
    b.poly(CM.paving, band((u) => s2y('base', u) - 1, (u) => s2FarCoping(u) - 6 * s2g(u)));
    b.poly(CM.limestone, band((u) => s2FarCoping(u) - 6 * s2g(u), (u) => s2FarCoping(u)));
    b.poly(CM.waterDeep, band((u) => s2FarCoping(u), (u) => s2FarCoping(u) + 7 * s2g(u)));
    // reflections of the wing's lit windows and brick in the water (broken dashes under the far coping)
    b.layer();
    for (let u = -2; u < uEnd; u += 0.5) {
      const g = s2g(u);
      const x = s2x(u);
      const y0 = s2FarCoping(u) + 8 * g;
      for (let k = 0; k < 5; k++) {
        const yy = y0 + k * 9 * g;
        const w = r.range(20, 60) * g;
        if (r.chance(0.7)) b.rect(k % 2 ? CM.brickLight : r.chance(0.4) ? CM.lamp : CM.waterDeep, x - w / 2 + r.jitter(8 * g), yy, w, Math.max(1.5, 3 * g));
      }
    }
    let d = '';
    for (let u = -2.5; u < uEnd; u += 0.5) d += `M${P(s2x(u), s2FarCoping(u) - 6 * s2g(u))}L${P(s2x(u + 0.5), s2FarCoping(u + 0.5) - 6 * s2g(u + 0.5))}`;
    b.ink(d, INK_PX.hair);
    return b;
  }, [uEnd]);
  // ripples and glints on the S2 water (inside the wedge between the banks)
  const life = new Batch();
  const rr = rng('s2ripples');
  for (let i = 0; i < 34; i++) {
    const x = rr.range(-20, 1100);
    const yTop = s2FarCoping(s2u(x)) + 10;
    const yBot = S2_BANK.edge(x) - 6;
    if (yBot <= yTop) continue;
    const v = rr.next();
    const y = lerp(yTop, yBot, v);
    const sc = 0.5 + v * 0.8;
    const xx = x + ((-9 * t * sc) % 60);
    const w = rr.range(18, 50) * sc;
    const on = i % 3 === 0 ? (t / rr.range(1.3, 2.6) + rr.next()) % 1 < 0.45 : true;
    if (on) life.fill(i % 3 === 0 ? CM.paper : CM.waterDeep, `M${P(xx - w / 2, y)}Q${P(xx, y - 2.2 * sc)} ${P(xx + w / 2, y)}Q${P(xx, y + 2.2 * sc)} ${P(xx - w / 2, y)}Z`);
  }
  // the moored boats along the far bank (perspective) and the passing boat (from the VP side toward us)
  const mooredA = {u0: 4.6, u1: 9.2};
  const boatU = boatAt !== undefined ? 12 - (t - boatAt) * 0.9 : 99;
  const lane = (u: number, off: number) => s2FarCoping(u) + off * s2g(u);
  const near = useMemo(() => {
    const b = new Batch();
    const r = rng('s2near');
    // our towpath (the near ground) from our edge down: paving, joints converging toward the VP, leaves, a drain
    const edge: Pt[] = [];
    for (let x = -40; x <= 1120; x += 40) edge.push([x, S2_BANK.edge(x)]);
    b.poly(CM.paving, [...edge, [1120, 1940], [-40, 1940]]);
    // the coping along our edge
    const cop: Pt[] = [];
    for (let x = -40; x <= 1120; x += 40) cop.push([x, S2_BANK.edge(x) - 2]);
    b.poly(CM.limestone, [...cop, ...cop.slice().reverse().map(([x, y]) => [x, y + 16] as Pt)]);
    let j = '';
    const vp = [1400, 700];
    for (let k = 0; k < 14; k++) {
      const yb = 1940;
      const xb = -600 + k * 210 + r.jitter(30);
      // a joint line from the bottom toward the VP, stopping at our edge
      const tEnd = (S2_BANK.edge(Math.max(-40, Math.min(1120, xb))) + 20 - yb) / (vp[1] - yb);
      const x1 = xb + (vp[0] - xb) * tEnd;
      const y1 = yb + (vp[1] - yb) * tEnd;
      for (let s = 0; s < 3; s++) {
        const a = r.range(0, 0.7);
        const c = Math.min(1, a + r.range(0.15, 0.35));
        j += `M${P(lerp(xb, x1, a), lerp(yb, y1, a))}L${P(lerp(xb, x1, c), lerp(yb, y1, c))}`;
      }
    }
    for (let y = 1260; y < 1920; y += r.range(70, 140)) {
      const x = r.range(80, 900);
      j += `M${P(x, y)}L${P(x + r.range(60, 160), y + r.jitter(6))}`;
    }
    b.ink(j, INK_PX.far, CM.line);
    b.layer();
    for (let i = 0; i < 40; i++) {
      const y = r.range(1240, 1900);
      const s = lerp(10, 22, (y - 1240) / 660);
      b.fill(r.pick([CM.leafGold, CM.leafRust, CM.coatMustard]), leafPath(r.range(0, 1080), y, s, s * 0.35, r.range(-40, 40)));
    }
    drainInto(b, 470, 1760, 120, 's2drain');
    // two puddles mirroring the sky (a leaf afloat in one)
    for (const [px, py, pw] of [[300, 1420, 150], [760, 1640, 210]] as [number, number, number][]) {
      b.fill(CM.glass, `M${P(px - pw / 2, py)}Q${P(px - pw * 0.2, py - pw * 0.12)} ${P(px + pw * 0.1, py - pw * 0.08)}Q${P(px + pw / 2, py - pw * 0.06)} ${P(px + pw * 0.45, py + pw * 0.05)}Q${P(px, py + pw * 0.14)} ${P(px - pw / 2, py)}Z`);
      b.fill(CM.skyHigh, `M${P(px - pw * 0.25, py - pw * 0.03)}L${P(px + pw * 0.2, py - pw * 0.05)}L${P(px + pw * 0.15, py - pw * 0.01)}L${P(px - pw * 0.2, py + pw * 0.01)}Z`);
    }
    b.fill(CM.leafRust, leafPath(780, 1636, 22, 8, 20));
    // the bike locked to the lamp-post bottom-right (the post is a Lamp below)
    bikeInto(b, 870, 1905, 92, 's2bike', CM.coatMustard, -1);
    return b;
  }, []);
  return (
    <>
      <WingS2 story={story} staffCoolAt={staffCoolAt} storyOverlay={storyOverlay} />
      <Pigeons ledge={[90, 520, 652]} n={5} size={16} seed="s2parapet" />
      <Paint b={far} seed="s2far" />
      <Paint b={life} seed="s2life" misreg={false} />
      {/* the far towpath: lamps receding at the fins (never over a story window), walkers both ways */}
      {[2.5, 5.5, 9.5, 15.5].map((u, i) => (
        <Lamp key={i} x={s2x(u)} y={s2y('base', u) + 12 * s2g(u)} h={290 * s2g(u)} seed={`s2lamp${i}`} />
      ))}
      <Movers
        idPrefix="s2far"
        movers={[
          {pose: 'walk', from: [1100, s2y('base', s2u(1100)) + 12 * s2g(s2u(1100))], to: [-60, s2y('base', s2u(-60)) + 12 * s2g(s2u(-60))], h: [40, 190], speed: 60, phase: 0.2, seed: 's2fw1', acc: 'tote'},
          {pose: 'walk', from: [-60, 1046], to: [1100, s2y('base', s2u(1100)) + 12 * s2g(s2u(1100))], h: [190, 40], speed: 55, phase: 0.75, seed: 's2fw2', acc: 'scarf'},
          {pose: 'jog', from: [1100, s2y('base', s2u(1100)) + 12 * s2g(s2u(1100))], to: [-60, 1046], h: [40, 190], speed: 140, phase: 0.45, seed: 's2fj', acc: 'cap'},
        ]}
      />
      <PerspBoat stern={[s2x(mooredA.u1), lane(mooredA.u1, 34)]} bow={[s2x(mooredA.u0), lane(mooredA.u0, 34)]} hStern={150 * s2g(mooredA.u1)} hBow={150 * s2g(mooredA.u0)} seed="s2moored" cabin={CM.sage} />
      {boatU < 13 && boatU > -6 ? (
        <PerspBoat stern={[s2x(boatU + 5), lane(boatU + 5, 92)]} bow={[s2x(boatU), lane(boatU, 92)]} hStern={175 * s2g(boatU + 5)} hBow={175 * s2g(boatU)} seed="s2passing" cabin={CM.coatOat} />
      ) : null}
      <Ducks ducks={[{x: 760, y: 1080, size: 22, vx: -10, drake: true}, {x: 300, y: 1150, size: 26, vx: -7}]} seed="s2ducks" />
      {/* our bank: the railing (a post tops out at Pip's seat), the newsstand, the bench, the planter */}
      <Paint b={near} seed="s2near" />
      <S2Railing />
      <Newsstand x0={-70} x1={124} top={918} ground={1292} seed="s2news" />
      {aBoard}
      <Bench x={(MAP.S2.bench.x0 + MAP.S2.bench.x1) / 2} y={MAP.S2.bench.y1} w={MAP.S2.bench.x1 - MAP.S2.bench.x0} view="back" seed="s2bench" />
      {bench ?? (
        <>
          <CastSlot s={{id: 'reporter', x: MAP.S2.reporter.x, y: MAP.S2.reporter.feetY - MAP.S2.reporter.h * 0.32, h: MAP.S2.reporter.h * 0.7, pose: 'sit', seed: 'reporter', acc: 'bag', coat: CM.coatOat}} />
          <CastSlot s={{id: 'staffer', x: MAP.S2.staffer.x, y: MAP.S2.staffer.feetY - MAP.S2.staffer.h * 0.32, h: MAP.S2.staffer.h * 0.7, pose: 'sit', seed: 'staffer', acc: 'none', coat: CM.coatSlate, hair: '#9A5A3E'}} />
        </>
      )}
      {pip ?? <PipSlot seat={{id: 'V2S2', x: MAP.S2.pipSeat.x, y: MAP.S2.pipSeat.y, size: 96}} />}
      <Planter x0={-30} x1={230} y={1650} h={190} seed="s2planter" />
      <Lamp x={930} y={1990} h={1350} w={30} variant="near" seed="s2nearlamp" />
      {people ? (
        <>
          <CastSlot s={{id: 'dog', x: 590, y: 1430, h: 64, pose: 'dog', seed: 's2dog', dir: -1, gait: t}} />
          <CastSlot s={{id: 'pass1', x: 380, y: 1920, h: 280, pose: 'bust', seed: 's2pass1', acc: 'beanie'}} />
          <CastSlot s={{id: 'pass2', x: 660, y: 1920, h: 304, pose: 'bust', seed: 's2pass2', acc: 'cap'}} />
        </>
      ) : null}
      <FallingLeaves box={[200, 640, 1080, 1700]} n={6} size={15} seed="s2fall" wind={-30} />
    </>
  );
};

/** S2's railing along our edge, with a post exactly at Pip's seat (x 590, top y 1050). */
const S2Railing: React.FC = () => {
  const b = useMemo(() => {
    const b = new Batch();
    const posts: number[] = [];
    for (let x = 590; x > -160; x -= 168) posts.unshift(x);
    for (let x = 590 + 160; x < 1200; x += 160 - (x - 590) * 0.04) posts.push(x);
    const top = (x: number) => (x === 590 ? MAP.S2.pipSeat.y : S2_BANK.railTop(x) + (MAP.S2.pipSeat.y - S2_BANK.railTop(590)));
    // rails
    const rail: Pt[] = [];
    for (let x = -60; x <= 1120; x += 40) rail.push([x, top(x) + 6]);
    b.poly(CM.anchor, [...rail, ...rail.slice().reverse().map(([x, y]) => [x, y + 6] as Pt)]);
    const mid: Pt[] = [];
    for (let x = -60; x <= 1120; x += 40) mid.push([x, lerp(top(x), S2_BANK.edge(x), 0.55)]);
    b.poly(CM.anchor, [...mid, ...mid.slice().reverse().map(([x, y]) => [x, y + 4] as Pt)]);
    let bars = '';
    for (const x of posts) {
      b.rect(CM.anchor, x - 6, top(x), 12, S2_BANK.edge(x) - top(x));
      b.fill(CM.anchor, ovalPath(x, top(x) - 1, 9, 6));
    }
    for (let x = -60; x < 1120; x += 26) bars += `M${P(x, lerp(top(x), S2_BANK.edge(x), 0.55) + 3)}L${P(x, S2_BANK.edge(x) - 2)}`;
    b.ink(bars, INK_PX.far, CM.anchor);
    b.ink(line(-60, top(-60) + 6, 1120, top(1120) + 6, {seed: 's2rail', over: 'small'}), INK_PX.mid);
    return b;
  }, []);
  return <Paint b={b} seed="s2railing" />;
};

export {roofRowInto, Heron, CastSlot, P, Railing, Tree, lobes};

// ---------------------------------------------------------------- S4: the walk home (truck west with a narrowboat)

export type S4SetProps = {
  /** Per-plane truck offsets (px, + = the plane moves right on screen as the camera trucks west): far roofs ~0.3x. */
  dxFar?: number;
  dxBacks?: number;
  dxPath?: number;
  /** Her on her towpath (K4) and the fingerpost (K3): drawn on the towpath plane. */
  towpath?: React.ReactNode;
  pip?: React.ReactNode;
  /** Birds fly west into the sun (19.80 in the film). */
  birdsAt?: number;
  /** Draw the kit's walkers on her towpath. */
  walkers?: boolean;
};

const S4_PATH = {back: 860, edge: 1082, coping: 12, water: [1082, 1300] as [number, number]};

export const S4Set: React.FC<S4SetProps> = ({dxFar = 0, dxBacks = 0, dxPath = 0, towpath, pip, birdsAt = 3.0, walkers = true}) => {
  const t = useTime();
  const far = useMemo(() => {
    const b = new Batch();
    // gasholder frames on the left (the low sun seen through one), far roofs, a warehouse, the viaduct
    gasholderInto(b, 250, 790, 118, 172, 's4gas1', {ink: 1.6});
    gasholderInto(b, 470, 800, 90, 150, 's4gas2', {drum: 1, ink: 1.4});
    b.layer();
    roofRowInto(b, {x0: -80, x1: 1240, base: 840, top: 712, spread: 22, seed: 's4roofs', walls: [CM.stoneShade, CM.limestone, CM.brickLight], roof: CM.shadeCool, wRange: [50, 120], win: 6});
    b.layer();
    viaductInto(b, -80, 1240, 772, 860, 96, 's4via', INK_PX.hair);
    return b;
  }, []);
  const backs = new Batch();
  terraceBacksInto(backs, 360, 1260, S4_PATH.back + 4, 664, 's4backs', t, 0.25);
  warehouseInto(backs, -60, S4_PATH.back + 4, 200, 230, 's4ware', {ink: INK_PX.hair, lit: 0.2, t});
  const path = useMemo(() => {
    const b = new Batch();
    const sun: Pt = [MAP.SUN1.x, MAP.SUN1.y];
    // long low-sun shadows (toward the east = screen right) of the lamps, the bench, the planters
    for (const [x, y, h] of [[110, 1072, 300], [980, 1072, 300], [330, 1062, 70], [205, 1066, 48], [820, 1066, 70], [1180, 1066, 70]] as [number, number, number][]) shadowInto(b, x, y, Math.max(10, h * 0.08), h * 0.9, sun, CM.stoneShade, 0.25);
    b.layer();
    benchInto(b, 330, 1062, 150, 'side', 's4bench');
    binInto(b, 205, 1066, 48, 's4bin');
    // planters of grasses along the garden walls, a parked bike, a lifebuoy on a post, mooring bollards
    planterInto(b, 760, 880, 1062, 46, 's4pl1');
    planterInto(b, 1120, 1240, 1062, 46, 's4pl2');
    bikeInto(b, 1040, 1066, 26, 's4bike', CM.coatMustard, -1);
    b.rect(CM.line, 46, 980, 8, 92);
    b.fill(CM.box, ovalPath(50, 1004, 24, 24));
    b.fill(CM.paving, ovalPath(50, 1004, 12, 12));
    for (const x of [260, 640, 900]) bollardInto(b, x, 1080, 24, `s4bol${x}`);
    return b;
  }, []);
  return (
    <>
      <SunDisc x={MAP.S4.sunAtPose.x} y={MAP.S4.sunAtPose.y} r={MAP.S4.sunAtPose.r} />
      <XG m={mat.translate(dxFar, 0)}>
        <Paint b={far} seed="s4far" />
        <ViaductTrain x0={-80} x1={1240} deck={769} h={20} seed="s4train" speed={140} every={11} phase={0.5} />
        <Birds from={[700, 784]} to={[1000, 790]} n={6} size={10} seed="s4birds" liftAt={[birdsAt]} dir={-1} />
      </XG>
      <XG m={mat.translate(dxBacks, 0)}>
        <Paint b={backs} seed="s4backs" />
        <Puffs x={566} y={668} seed="s4chim" kind="smoke" scale={0.5} drift={-24} ceil={600} />
      </XG>
      <XG m={mat.translate(dxPath, 0)}>
        <Towpath x0={-200} x1={1400} top={S4_PATH.back} edge={S4_PATH.edge} coping={S4_PATH.coping} seed="s4path" leaves={22} ink={INK_PX.far} rings={[120, 470, 980]} />
        <Lamp x={110} y={1072} h={300} seed="s4lamp1" />
        <Lamp x={980} y={1072} h={300} seed="s4lamp2" />
        <Paint b={path} seed="s4pathprops" />
        {walkers ? (
          <Movers
            idPrefix="s4w"
            movers={[
              {pose: 'walk', from: [-60, 1068], to: [1160, 1068], h: 160, speed: 52, phase: 0.15, seed: 's4wE', acc: 'bag'},
              {pose: 'cycle', from: [1180, 1070], to: [-100, 1070], h: 165, speed: 190, phase: 0.6, pause: 3, seed: 's4cyc'},
              {pose: 'dog', from: [-60, 1070], to: [1160, 1070], h: 44, speed: 70, phase: 0.42, seed: 's4dog'},
            ]}
          />
        ) : null}
        {towpath}
        <Water y0={S4_PATH.water[0]} y1={S4_PATH.water[1]} seed="s4water" bankShade={0} reflTop={S4_PATH.edge + 6} reflections={[{x0: 360, x1: 1080, color: CM.brickLight, depth: 70}, {x0: 100, x1: 330, color: CM.brickDeep, depth: 50}, {x0: 90, x1: 130, color: CM.anchor, depth: 60}]} ripples={20} glints={10} />
        <Ducks ducks={[{x: 860, y: 1150, size: 26, vx: -12, drake: true}, {x: 910, y: 1162, size: 24, vx: -12}]} seed="s4ducks" />
        <Heron x={420} y={1112} h={92} face={-1} seed="s4heron" />
      </XG>
      {/* the narrowboat beside us (screen-fixed: it glides with the camera) */}
      <Water y0={1700} y1={1940} seed="s4near" bankShade={0} ripples={14} glints={8} near={2.2} wake={{x: () => 1240, y: 1712, dir: -1, len: 400}} />
      <FloatingLeaves y0={1740} y1={1900} n={8} size={20} seed="s4fl" current={18} />
      <Narrowboat x={-420} water={1712} len={1780} h={370} dir={-1} seed="s4boat" cabin={CM.sage} topView={44} hullK={0.11} roofItems panel fenders chimney={0.62} />
      {pip ?? <PipSlot seat={{id: 'V2S4', x: MAP.S4.pipSeat.x, y: MAP.S4.pipSeat.y, size: 100}} />}
    </>
  );
};

// ---------------------------------------------------------------- S8: the lane, looking west (landing pose)

export type S8SetProps = {
  /** Plane offsets (px) from the LANDING pose: pre-truck = {house: -160, board: -250} (map S8.truck). */
  dxHouse?: number;
  dxNear?: number;
  /** Her window W lights at (34.95 in the film: local seconds here); her door, her ghosts, the board: lanes. */
  wAt?: number;
  /** The lamp run ("facts" 37.18) and the string lights. Omit = off. */
  lampRunAt?: number;
  board?: React.ReactNode;
  lane?: React.ReactNode;
  pip?: React.ReactNode;
  walkers?: boolean;
};

/** S8's VP: the lane runs west to the bend at her house. */
export const S8_LANE = {vp: [600, 948] as Pt, ground: 1060, edge: (x: number) => lerp(1372, 1062, Math.min(1, x / 560))};

export const S8Set: React.FC<S8SetProps> = ({dxHouse = 0, dxNear = 0, wAt, lampRunAt, board, lane, pip, walkers = true}) => {
  const t = useTime();
  const far = useMemo(() => {
    const b = new Batch();
    // far west beyond the bend: roofs, the gasholders, the viaduct (small), then the south bank receding on the left
    roofRowInto(b, {x0: -80, x1: 760, base: 960, top: 818, spread: 16, seed: 's8far', walls: [CM.stoneShade, CM.limestone, CM.brickLight], roof: CM.shadeCool, wRange: [34, 80], win: 4, lit: 0.4, t: 0});
    gasholderInto(b, 620, 900, 60, 96, 's8gas', {ink: 1.2});
    viaductInto(b, 300, 760, 880, 940, 46, 's8via', 0);
    b.layer();
    // the south bank (across the canal), receding: warehouse fronts and trees, tops falling toward the VP
    const vp = S8_LANE.vp;
    let x = -60;
    let i = 0;
    const r = rng('s8south');
    while (x < 560) {
      const w = r.range(70, 130) * (1 - x / 900);
      const k = (x - vp[0]) / (0 - vp[0]);
      const top = lerp(vp[1], 730, k) + r.jitter(10);
      const base = lerp(vp[1], 905, k);
      b.rect(r.pick([CM.brick, CM.brickLight, CM.stucco, CM.brickDeep]), x, Math.max(602, top), w + 1, base - Math.max(602, top));
      for (let wy = top + 14; wy < base - 16; wy += 22) for (let wx = x + 8; wx < x + w - 10; wx += 18) b.rect(r.chance(0.35) ? CM.lamp : CM.paneUnlit, wx, wy, 7, 11);
      if (i % 3 === 1) b.fill(r.pick([CM.sage, CM.leafGold, CM.leafRust]), lobes(x - 10, x + w * 0.8, base, (base - top) * 0.7, `s8tree${i}`, 3));
      x += w;
      i++;
    }
    // the far bank's wall and coping
    b.poly(CM.limestone, [[-60, 905], [vp[0], vp[1]], [vp[0], vp[1] + 3], [-60, 920]]);
    return b;
  }, []);
  // the canal water between the south bank and our edge (a wedge), with ripples
  const water = useMemo(() => {
    const b = new Batch();
    const vp = S8_LANE.vp;
    b.poly(CM.water, [[-60, 918], [vp[0], vp[1] + 2], [vp[0], S8_LANE.edge(vp[0])], [560, S8_LANE.edge(560)], [-60, S8_LANE.edge(-60) + 40]]);
    b.poly(CM.waterDeep, [[-60, 918], [vp[0], vp[1] + 2], [vp[0], vp[1] + 6], [-60, 934]]);
    const r = rng('s8water');
    for (let k = 0; k < 18; k++) {
      const x = r.range(-20, 540);
      const y0 = lerp(925, vp[1] + 4, x / vp[0]);
      const y1 = S8_LANE.edge(x) - 6;
      const y = lerp(y0, y1, r.next());
      const s = 0.4 + ((y - 900) / 500) * 1.2;
      const w = r.range(20, 50) * s;
      b.fill(k % 3 ? CM.waterDeep : CM.bandSunset, `M${P(x - w / 2, y)}Q${P(x, y - 2 * s)} ${P(x + w / 2, y)}Q${P(x, y + 2 * s)} ${P(x - w / 2, y)}Z`);
    }
    return b;
  }, []);
  // our towpath (the lane) converging on the bend
  const path = useMemo(() => {
    const b = new Batch();
    const vp = S8_LANE.vp;
    const edge: Pt[] = [];
    for (let x = -60; x <= vp[0]; x += 30) edge.push([x, S8_LANE.edge(x)]);
    b.poly(CM.paving, [...edge, [vp[0], S8_LANE.ground], [1120, S8_LANE.ground], [1120, 1940], [-60, 1940]]);
    b.poly(CM.limestone, [...edge, ...edge.slice().reverse().map(([x, y]) => [x, y + lerp(26, 4, x / vp[0])] as Pt)]);
    // paving joints converging on the VP; cross joints
    const r = rng('s8path');
    let j = '';
    for (let k = 0; k < 16; k++) {
      const xb = -400 + k * 120;
      for (let s = 0; s < 3; s++) {
        const a = r.range(0.0, 0.85);
        const c = Math.min(0.97, a + r.range(0.08, 0.25));
        j += `M${P(lerp(xb, vp[0], a), lerp(1940, vp[1], a))}L${P(lerp(xb, vp[0], c), lerp(1940, vp[1], c))}`;
      }
    }
    for (let y = 1100; y < 1920; y += (y - 940) * 0.22) {
      const k = (y - vp[1]) / (1940 - vp[1]);
      const xa = lerp(vp[0], -60, k);
      const xc = lerp(vp[0], 1300, k);
      for (let s = 0; s < 3; s++) {
        const a = r.range(0, 0.8);
        j += `M${P(lerp(xa, xc, a), y)}L${P(lerp(xa, xc, Math.min(1, a + r.range(0.05, 0.15))), y)}`;
      }
    }
    b.ink(j, INK_PX.far, CM.line);
    b.layer();
    for (let i = 0; i < 34; i++) {
      const y = r.range(1080, 1900);
      const s = lerp(6, 24, (y - 1060) / 860);
      b.fill(r.pick([CM.leafGold, CM.leafRust, CM.coatMustard]), leafPath(r.range(300, 1080), y, s, s * 0.35, r.range(-40, 40)));
    }
    drainInto(b, 760, 1540, 130, 's8drain');
    return b;
  }, []);
  // lamps receding down the lane on the water side (never crossing the band: tops at y >= 600)
  const lamps: [number, number, number][] = [];
  for (const k of [0.62, 0.74, 0.83, 0.9]) {
    const vp = S8_LANE.vp;
    const yf = lerp(vp[1], 1300, 1 - k);
    const xf = lerp(vp[0], -40, 1 - k) + 20;
    const h = (yf - vp[1]) * 2.4;
    lamps.push([xf, yf, h]);
  }
  return (
    <>
      <SunDisc x={MAP.SUN8.x} y={MAP.SUN8.y} r={MAP.SUN8.r} />
      <Paint b={far} seed="s8far" />
      <Paint b={water} seed="s8water" misreg={false} />
      <PerspBoat stern={[-150, 1530]} bow={[440, 1060]} hStern={400} hBow={104} seed="s8cafe" cabin={CM.coatOat} cafe lit />
      <Paint b={path} seed="s8path" />
      {lamps.map(([x, y, h], i) => (
        <Lamp key={i} x={x + dxNear * (1 - i * 0.2)} y={y} h={h} seed={`s8lamp${i}`} lightAt={lampRunAt !== undefined ? lampRunAt + (lamps.length - 1 - i) * 0.07 : undefined} />
      ))}
      <XG m={mat.translate(dxHouse, 0)}>
        <TerraceRow
          x0={650}
          levels={{ground: S8_LANE.ground, first: 797, cornice: 604, mansardTop: 600}}
          houses={[{w: 360, first: 'french'}, {w: 380, first: 'two', lights: true, neighbour: 'first', brick: CM.brickLight}]}
          her={{index: 0, french: MAP.S8.w, door: MAP.S8.door, lampAt: wAt}}
          seed="s8row"
          litFrac={0.6}
          lightsAt={lampRunAt}
          lightsOn={lampRunAt === undefined}
        />
        <TerraceRow
          x0={250}
          levels={{ground: S8_LANE.ground - 2, first: 870, cornice: 760, mansardTop: 712}}
          houses={[{w: 200, first: 'one', neighbour: 'first'}, {w: 200, first: 'two', lights: true, brick: CM.brickDeep}]}
          seed="s8row2"
          litFrac={0.6}
          lightsOn
          ink={INK_PX.far}
        />
      </XG>
      {walkers ? (
        <Movers
          idPrefix="s8w"
          movers={[
            {pose: 'walk', from: [560, 1064], to: [1120, 1180], h: [92, 150], speed: 40, phase: 0.3, seed: 's8w1', acc: 'scarf'},
            {pose: 'cycle', from: [1150, 1300], to: [560, 1066], h: [300, 96], speed: 120, phase: 0.7, pause: 2, seed: 's8cyc'},
          ]}
        />
      ) : null}
      {lane}
      <S8Dressing />
      <CafeDeck x0={-30} x1={540} y0={1560} y1={1940} seed="s8deck" />
      <Planter x0={900} x1={1110} y={1920} h={200} seed="s8planter" />
      <Lamp x={1010} y={2000} h={1300} w={28} variant="near" seed="s8nearlamp" />
      {board}
      {pip ?? <PipSlot seat={{id: 'V2S8', x: MAP.BOARD_BOLLARD.x, y: MAP.BOARD_BOLLARD.y, size: 96}} />}
    </>
  );
};

/** S8's lane dressing on the house side: wheelie bins, a bike on the area railings, pots on the steps, a bench, two
 *  bollards on the lane. Screen px at the landing pose. */
const S8Dressing: React.FC = () => {
  const b = useMemo(() => {
    const b = new Batch();
    // long sunset shadows toward us (the low sun ahead in the west): the terrace's shade on the lane's right, the
    // lamps', bollards' and the bench's stripes across the paving
    const sun: Pt = [MAP.SUN8.x, MAP.SUN8.y];
    b.poly(CM.stoneShade, [[640, 1062], [1120, 1062], [1120, 1500], [880, 1250]]);
    for (const [x, y, h] of [[470, 1150, 50], [380, 1290, 66], [1000, 1236, 60], [930, 1072, 40], [700, 1062, 46]] as [number, number, number][]) shadowInto(b, x, y, h * 0.32 + 8, h * 4.2, sun, CM.stoneShade);
    b.layer();
    // pots on her door steps and the neighbour's, a planter of herbs under her window
    potsInto(b, 640, 676, 1060, 18, 's8steps1');
    potsInto(b, 776, 812, 1060, 18, 's8steps2');
    // wheelie bins by the neighbour's railings
    for (const [x, c] of [[1040, CM.sage], [1092, CM.coatSlate]] as [number, string][]) {
      b.rect(c, x - 24, 1012, 48, 60);
      b.rect(c, x - 27, 1006, 54, 8);
      b.fill(CM.anchor, ovalPath(x - 16, 1074, 6, 6));
    }
    // a bike leaning on her area railings (left of the door)
    bikeInto(b, 618, 1066, 26, 's8bike', CM.brickDeep, 1);
    // a bench on the lane side (side view) and two bollards
    benchInto(b, 1000, 1236, 170, 'side', 's8bench');
    for (const [x, y, h] of [[470, 1150, 50], [380, 1290, 66]] as [number, number, number][]) {
      b.rect(CM.anchor, x - h * 0.16, y - h, h * 0.32, h);
      b.fill(CM.anchor, domePath(x, y - h, h * 0.18, h * 0.12));
      b.rect(CM.coatMustard, x - h * 0.16, y - h * 0.8, h * 0.32, h * 0.08);
    }
    return b;
  }, []);
  return <Paint b={b} seed="s8dress" />;
};
