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
import React from 'react';
import {World, ShotCam, Fill, Ink, hline, line, polyPath, ease, prog, useTime, mat, XG} from '../../../lib';
import {Layer, type CamKey} from '../../../lib/cine/camera';
import {EMBER, FILM_TOD, ChipFactory, chipFactoryGeo, ChipMaker, DataCenter, Laptop, Snowfall, SpeechBubble, Calendar, StickFlight, TownBand, Van, WaitingDots, type Pt} from '../kit';

// ---- the set (canvas px at camera rest; the board's coordinates translated to the kit props)
export const HORIZON = 800;
const BAND_Y = 700; // the one flat lighter sky step (skyLow) toward the horizon

/** The chip factory: base centre, width. Drawn MIRRORED so its big door sits at the right end, where the board's
 *  road arrives (the kit door is at the left end). */
export const FAB = {x: 784, y: 856, w: 280};
const fabG = chipFactoryGeo(FAB.x, FAB.y, FAB.w);
/** The door in the mirrored drawing (canvas px). */
export const DOOR = {x0: 2 * FAB.x - (fabG.door.x + fabG.door.w), x1: 2 * FAB.x - fabG.door.x, y0: fabG.door.y, y1: FAB.y};
/** The chimney's top (the kit puffs above it are clipped: they would rise into the caption band). */
const CHIMNEY_TOP = fabG.top - FAB.w * 0.17 - FAB.w * 0.32;

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

// far houses on the horizon (left of the factory; fill only)
const HOUSES = [
  {x: -16, w: 58, lit: true, chimney: true},
  {x: 70, w: 50, lit: false},
  {x: 150, w: 62, lit: true},
  {x: 262, w: 52, lit: true, chimney: true},
  {x: 352, w: 56, lit: false},
  {x: 452, w: 50, lit: true},
  {x: 540, w: 54, lit: true, chimney: true},
];

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

/** The whole queue set. `dur` = the panel length (the breathe), `s14` = the reprise's changes. */
export const QueueSet: React.FC<{dur: number; s14?: QueueS14; id: string}> = ({dur, s14, id}) => {
  const t = useTime();
  // S14: the van shove and the second data center's slide
  const push = s14 ? prog(t, s14.pushAt, s14.pushDur, ease.outCubic) : 0;
  const vdx = VAN_PUSH[0] * push;
  const vdy = VAN_PUSH[1] * push;
  const slide = s14 ? prog(t, s14.cutInAt, s14.cutInEnd - s14.cutInAt, ease.outBack(1.15)) : 0;
  const dc2Off = -(DC2.x + DC2.w / 2 + 40) * (1 - slide); // fully off the left edge before it starts
  const dc1Lit = !s14 || t < s14.litSwapAt;
  const vanTop = VAN.y - VAN.w * 0.5;
  const boxW = VAN.w * 0.68;
  const clipId = `${id}-fabsteam`;
  const makerX = 792;
  const makerH = 92;
  const makerHead: Pt = [makerX - 14, FAB.y - makerH + 12];
  return (
    <World stage="context" sky={[{t: 0, tod: FILM_TOD, color: EMBER.sky}]}>
      <ShotCam keys={queueCam(dur)}>
        <Layer depth={0}>
          {/* sky step, snowfield, horizon */}
          <Fill rect={[-200, BAND_Y, 1480, HORIZON - BAND_Y + 4]} color={EMBER.skyLow} offset={false} />
          <Fill rect={[-200, HORIZON, 1480, 1400]} color={EMBER.snow} offset={false} />
          <Ink d={hline(-60, 1140, HORIZON, {seed: 'q/hor', over: [0, 0]})} width={2.2} />
          <TownBand y={HORIZON + 2} houses={HOUSES} far seed="q/town" />
          {/* the road to the factory door */}
          <Fill d={ROAD_D} color={EMBER.road} offset={false} seed="q/road" />
          <Ink d={line(ROAD_FAR[0][0], FAB.y, -60, Y_LEFT_EXIT, {seed: 'q/rl', over: [0, 0]}) + line(ROAD_FAR[1][0], FAB.y, roadR(1990), 1990, {seed: 'q/rr', over: [0, 0]})} width={2.2} />
          {/* the chip factory, mirrored (door at the right end, on the road); its chimney steam clipped */}
          <defs>
            <clipPath id={clipId} clipPathUnits="userSpaceOnUse">
              <rect x={-400} y={CHIMNEY_TOP - 4} width={1900} height={2400} />
            </clipPath>
          </defs>
          <g clipPath={`url(#${clipId})`}>
            <XG m={mat.about(mat.scale(-1, 1), FAB.x, FAB.y)}>
              <ChipFactory x={FAB.x} y={FAB.y} w={FAB.w} seed="q/fab" />
            </XG>
          </g>
          {/* S14: the chip maker speaks from the door (facing the road, arm out) */}
          {s14 ? <ChipMaker x={makerX} y={FAB.y} h={makerH} facing="l" at={s14.makerAt} seed="q/maker" /> : null}
          {/* the first data center, first at the door (its sign lit while it is the subject) */}
          <DataCenter x={DC1.x} y={DC1.y} w={DC1.w} h={DC1.h} signLitAt={dc1Lit ? 0 : undefined} seed="q/dc1" />
          {/* the sticks lob from the door into its roof */}
          {STICK_TO.map((x, i) => {
            const t0 = STICK_T0 + i * STICK_GAP;
            return (
              <StickFlight key={i} seed={`q/st${i}`} from={STICK_FROM} to={[x, DC1_ROOF - 4]} t0={t0} t1={t0 + STICK_FLY} arc={STICK_ARC} w0={80} w1={96} rot0={-8} rot1={-28} end="shrink" />
            );
          })}
          {/* the van's waiting dots (behind the newcomer, which blocks them as it cuts in) */}
          <XG m={mat.translate(vdx, vdy)}>
            <WaitingDots x={372} y={vanTop - 40} r={11} />
          </XG>
          {/* S14: the second, darker data center cuts in from the left */}
          {s14 && slide > 0 ? (
            <XG m={mat.translate(dc2Off, 0)}>
              <DataCenter x={DC2.x} y={DC2.y} w={DC2.w} h={DC2.h} variant="dark" signLitAt={s14.litSwapAt} seed="q/dc2" />
            </XG>
          ) : null}
          {/* the laptop van, waiting (shoved back in S14) */}
          <XG m={mat.translate(vdx, vdy)}>
            <Van x={VAN.x} y={VAN.y} w={VAN.w} seed="q/van" />
            {/* THE laptop on its box at the board's size (covers the kit's smaller decal) */}
            <Laptop x={VAN.x - VAN.w / 2 + boxW * 0.5} y={vanTop + 104} w={140} variant="old" seed="q/vanlap" ink={2.8} />
          </XG>
          {/* falling snow under the caption band */}
          <Snowfall x={-20} y={612} w={1120} h={1000} n={22} seed="q/snow" />
          {/* S14: the speech bubble, the calendar flipping 2026 -> 2027 */}
          {s14 ? (
            <SpeechBubble cx={450} cy={720} rx={170} ry={112} to={makerHead} at={s14.bubbleAt} seed="q/bubble">
              <Calendar x={365} y={642} w={170} from="2026" to="2027" flipAt={s14.flipAt} seed="q/cal" />
            </SpeechBubble>
          ) : null}
        </Layer>
      </ShotCam>
    </World>
  );
};
