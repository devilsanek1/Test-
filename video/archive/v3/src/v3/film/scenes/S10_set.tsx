// S10_set: THE QUEUE, the one set of S10 (22.68-25.24) and its reprise S14 (33.40-36.36): the exact same camera and
// set, so in S14 the change is the only difference (docs/v3/camera_plan_g3.md rows S10 / S14 and "Fix round 1": a
// queue in depth from slightly above; board public/v3/animatic.json "S10" / "S14", whose coordinates this keeps).
//
// Blue hour, first snow (kit/README.md). Horizon high (y 800: slightly above), the flat dusk sky over it holds the
// white captions; snowy far houses on the horizon at the left. The road (a trodden band, one step under the snow)
// runs from the near bottom-left up to THE CHIP FACTORY's lit door at the far upper right (warm brick: our side of the
// trade). THE AI DATA CENTER (the subject, its sign lit: the light that replaces the board's dark subject fill) is
// first at the door, memory sticks lobbing from the door into its roof; THE LAPTOP VAN (cream, the hero laptop on its
// box) waits small behind it, near, with waiting dots over the cab.
//
// S14 adds (props): the chip maker at the door speaking, the speech bubble with the 2026 -> 2027 calendar, a second,
// DARKER data center sliding in from the left between the van and the first one (the lit sign passes to it: the
// first one steps back to mid), and the van shoved back down the road, cut by the frame edges.
//
// Camera: HOLD with a 1.5 % breathe anchored on the data center (G5_BLOCKING: holds may breathe 1.5-2 %).
//
// G5b (density lane): the frame is the same; a whole street now stands round the queue in the road's own perspective
// (S10_geo.ts: one camera from the locked road): the far plane (clouds over the band, the hill town, the chip works:
// S10_far), the left street of houses and shops with lamp posts, trees and walkers (S10_left), the factory gate, the
// yard and its workers, a forklift (the loop) and the DELIVERIES sign (S10_yard), the dressed road, the forecourt with
// the bus stop and the front row of backs (S10_near), Pip on the van's roof. Everything sorts by depth (ground scale k)
// round the queue's own pieces. `beats` carries what S10 and S14 do differently (S10.tsx, S14.tsx).

import React from 'react';
import {World, ShotCam, Fill, Ink, hline, line, polyPath, ease, prog, useTime, mat, XG} from '../../../lib';
import {Layer, type CamKey} from '../../../lib/cine/camera';
import {EMBER, FILM_TOD, ChipFactory, chipFactoryGeo, ChipMaker, CoolingPlume, DataCenter, SnowLayers, SpeechBubble, Calendar, StickFlight, Van, WaitingDots, type Pt} from '../kit';
import {FarPlane} from './S10_far';
import {kAtY, type QueueBeats} from './S10_geo';
import {LeftGround, leftItems, type Item} from './S10_left';
import {RoadGround, VanLife, nearItems} from './S10_near';
import {YardGround, yardItems} from './S10_yard';

// ---- the set (canvas px at camera rest; the board's coordinates translated to the kit props)
export const HORIZON = 800;
const BAND_Y = 700; // the one flat lighter sky step (skyLow) toward the horizon

/** The chip factory: base centre, width. Its big door at the right end (kit `doorSide="r"`), where the board's road
 *  arrives. */
export const FAB = {x: 784, y: 856, w: 280};
const fabG = chipFactoryGeo(FAB.x, FAB.y, FAB.w);
/** The door in the mirrored drawing (canvas px). */
export const DOOR = {x0: 2 * FAB.x - (fabG.door.x + fabG.door.w), x1: 2 * FAB.x - fabG.door.x, y0: fabG.door.y, y1: FAB.y};
// the chimney's top sits at y ~590, just under the caption band: no steam (kit `steam={false}`)

/** The road: the board's polygon (far end at the door, edges at the board's slopes), run on to the frame bottom. */
const ROAD_FAR: [Pt, Pt] = [
  [DOOR.x0 - 14, FAB.y],
  [DOOR.x1 + 10, FAB.y],
];
const L_SLOPE = -1.452; // dx / dy of the board's left edge
const R_SLOPE = -0.649; // and right edge
const roadL = (y: number) => ROAD_FAR[0][0] + L_SLOPE * (y - FAB.y);
const roadR = (y: number) => ROAD_FAR[1][0] + R_SLOPE * (y - FAB.y);
const Y_LEFT_EXIT = FAB.y + (-60 - ROAD_FAR[0][0]) / L_SLOPE; // where the left edge leaves the frame
const ROAD_D = polyPath([ROAD_FAR[0], ROAD_FAR[1], [roadR(1990), 1990], [-60, 1990], [-60, Y_LEFT_EXIT]]);

/** The first data center (the subject in S10): base centre, size (board: 330 x 231). */
export const DC1 = {x: 600, y: 1094, w: 330, h: 231};
/** The second, darker one (S14): base centre, size (board: 300 x 210). */
export const DC2 = {x: 458, y: 1232, w: 300, h: 210};
/** The van: wheels' ground centre, width (board 380). */
export const VAN = {x: 260, y: 1428, w: 380};
/** The board's push of the van in S14 (down the road, cut by the frame edges). */
const VAN_PUSH: Pt = [-190, 170];
/** S14's chip maker at the door: feet and height. G5b: he steps forward onto the forecourt in front of the facade
 *  (feet 856 -> 878, between the chip sign and the door) so he can be bigger (92 -> 118 px) and read at phone size
 *  without dwarfing the door. */
export const MAKER = {x: 812, y: 878, h: 118};

// ---- the sticks: the board's six, one every 0.35 s, each 0.8 s from the door into the data center's roof
const STICK_T0 = 0.1;
const STICK_GAP = 0.35;
const STICK_FLY = 0.8;
const STICK_TO = [566, 640, 596, 532, 662, 612];
const STICK_FROM: Pt = [(DOOR.x0 + DOOR.x1) / 2, DOOR.y0 + 30];
/** A high lob: out of the door, up over the factory's roof against the sky (gold on dusk blue reads; on the brick it
 *  did not), apex ~y 645 (under the caption band), down into the roof. */
const STICK_ARC = 380;
const DC1_ROOF = DC1.y - DC1.h;

// ---- the camera (shared, so S14 is the exact S10 frame)
export const queueCam = (dur: number): CamKey[] => [
  {t: 0, zoom: 1, anchor: [DC1.x, DC1.y - DC1.h / 2]},
  {t: dur, zoom: 1.015, anchor: [DC1.x, DC1.y - DC1.h / 2], ease: ease.inOutSine},
];

export type QueueS14 = {
  /** The chip maker appears (ink first, fill lands 0.18 s later). */
  makerAt: number;
  /** The speech bubble pops from its tail. */
  bubbleAt: number;
  /** 2026 -> 2027. */
  flipAt: number;
  /** The second data center slides in from the left over [cutInAt, cutInEnd] (outBack: it lands, overshoots, settles). */
  cutInAt: number;
  cutInEnd: number;
  /** The lit sign passes from the first data center to the second. */
  litSwapAt: number;
  /** The van is shoved back over [pushAt, pushAt + pushDur]. */
  pushAt: number;
  pushDur: number;
};

/** The whole queue set. `dur` = the panel length (the breathe), `s14` = the reprise's changes, `beats` = the life's
 *  scripted beats (guard, barrier, workers, birds, bus stop, front row, Pip). */
export const QueueSet: React.FC<{dur: number; s14?: QueueS14; beats?: QueueBeats; id: string}> = ({dur, s14, beats = {}, id}) => {
  const t = useTime();
  // S14: the van shove and the second data center's slide
  const push = s14 ? prog(t, s14.pushAt, s14.pushDur, ease.outCubic) : 0;
  const vdx = VAN_PUSH[0] * push;
  const vdy = VAN_PUSH[1] * push;
  const slide = s14 ? prog(t, s14.cutInAt, s14.cutInEnd - s14.cutInAt, ease.outBack(1.15)) : 0;
  const dc2Off = -(DC2.x + DC2.w / 2 + 40) * (1 - slide); // fully off the left edge before it starts
  const dc1Lit = !s14 || t < s14.litSwapAt;
  const vanTop = VAN.y - VAN.w * 0.5;
  const makerX = MAKER.x;
  const makerH = MAKER.h;
  const makerHead: Pt = [makerX - 14 * (makerH / 112), MAKER.y - makerH + 15 * (makerH / 112)];
  const lifeBeats: QueueBeats = s14 ? {...beats, pushAt: s14.pushAt, pushDur: s14.pushDur} : beats;
  // ---- everything that stands, sorted far to near by its ground scale k (S10_geo)
  const items: Item[] = [
    ...leftItems(lifeBeats),
    ...yardItems(lifeBeats),
    ...nearItems(lifeBeats),
    // the chip factory, its door at the right end (on the road); no steam (the caption band is right above)
    {k: kAtY(FAB.y), el: <ChipFactory key="fab" x={FAB.x} y={FAB.y} w={FAB.w} doorSide="r" steam={false} seed="q/fab" />},
    // S14: the chip maker speaks from the door (facing the road, arm out)
    ...(s14 ? [{k: kAtY(MAKER.y), el: <ChipMaker key="maker" x={makerX} y={MAKER.y} h={makerH} facing="l" at={s14.makerAt} seed="q/maker" />}] : []),
    // the first data center, first at the door (its sign lit while it is the subject), a cooling plume off its left unit
    {
      k: kAtY(DC1.y),
      el: (
        <React.Fragment key="dc1">
          <CoolingPlume x={DC1.x - DC1.w * 0.36} y={DC1.y - DC1.h - 14} seed="q/plume" rise={110} drift={-40} r1={18} />
          {/* dark (O1 after 4.04, S9, S15: the near-black body): the building has gone dark (G5b review) */}
          <DataCenter x={DC1.x} y={DC1.y} w={DC1.w} h={DC1.h} variant="dark" signLitAt={dc1Lit ? 0 : undefined} seed="q/dc1" />
        </React.Fragment>
      ),
    },
    // the sticks lob from the door into its roof
    {
      k: kAtY(DC1.y) + 0.05,
      el: (
        <React.Fragment key="sticks">
          {STICK_TO.map((x, i) => {
            const t0 = STICK_T0 + i * STICK_GAP;
            return <StickFlight key={i} seed={`q/st${i}`} from={STICK_FROM} to={[x, DC1_ROOF - 4]} t0={t0} t1={t0 + STICK_FLY} arc={STICK_ARC} w0={80} w1={96} rot0={-8} rot1={-28} end="shrink" />;
          })}
        </React.Fragment>
      ),
    },
    // the van's waiting dots (behind the newcomer, which blocks them as it cuts in)
    {
      k: kAtY(DC2.y) - 0.05,
      el: (
        <XG key="dots" m={mat.translate(vdx, vdy)}>
          <WaitingDots x={372} y={vanTop - 40} r={11} />
        </XG>
      ),
    },
    // S14: the second, darker data center cuts in from the left
    ...(s14 && slide > 0
      ? [
          {
            k: kAtY(DC2.y),
            el: (
              <XG key="dc2" m={mat.translate(dc2Off, 0)}>
                <DataCenter x={DC2.x} y={DC2.y} w={DC2.w} h={DC2.h} variant="dark" signLitAt={s14.litSwapAt} seed="q/dc2" />
              </XG>
            ),
          },
        ]
      : []),
    // the laptop van, waiting (shoved back in S14), with Pip on its roof
    {
      k: kAtY(VAN.y),
      el: (
        <XG key="van" m={mat.translate(vdx, vdy)}>
          <VanLife van={VAN} beats={lifeBeats} layer="under" />
          {/* THE laptop on its box at the board's size (kit decalW) */}
          <Van x={VAN.x} y={VAN.y} w={VAN.w} decalW={140} seed="q/van" />
          <VanLife van={VAN} beats={lifeBeats} layer="over" />
        </XG>
      ),
    },
  ];
  items.sort((p, q) => p.k - q.k);
  return (
    <World stage="context" sky={[{t: 0, tod: FILM_TOD, color: EMBER.sky}]}>
      <ShotCam keys={queueCam(dur)}>
        <Layer depth={0}>
          {/* sky step, snowfield, the far plane (clouds over the band, the hill town, the chip works) */}
          <Fill rect={[-200, BAND_Y, 1480, HORIZON - BAND_Y + 4]} color={EMBER.skyLow} offset={false} />
          <Fill rect={[-200, HORIZON, 1480, 1400]} color={EMBER.snow} offset={false} />
          <FarPlane beats={lifeBeats} />
          <Ink d={hline(560, 1140, HORIZON + 64, {seed: 'q/hor', over: [0, 0]})} width={2.2} />
          {/* the road to the factory door, dressed; the pavements' light pools */}
          <Fill d={ROAD_D} color={EMBER.road} offset={false} seed="q/road" />
          <Ink d={line(ROAD_FAR[0][0], FAB.y, -60, Y_LEFT_EXIT, {seed: 'q/rl', over: [0, 0]}) + line(ROAD_FAR[1][0], FAB.y, roadR(1990), 1990, {seed: 'q/rr', over: [0, 0]})} width={2.2} />
          <RoadGround />
          <LeftGround />
          <YardGround />
          {items.map((it) => it.el)}
          {/* falling snow in three layers (half density in the caption band) */}
          <SnowLayers density={0.85} seed="q/snowL" />
          {/* S14: the speech bubble, the calendar flipping 2026 -> 2027 */}
          {s14 ? (
            <SpeechBubble cx={450} cy={720} rx={170} ry={112} to={makerHead} at={s14.bubbleAt} seed="q/bubble">
              <Calendar x={365} y={642} w={170} from="2026" to="2027" flipAt={s14.flipAt} seed="q/cal" />
            </SpeechBubble>
          ) : null}
          <g data-id={id} />
        </Layer>
      </ShotCam>
    </World>
  );
};
