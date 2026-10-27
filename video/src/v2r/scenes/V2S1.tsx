// V2S1 "Walking out" (lane L1, the hook and the PILOT). Film 0.00-6.10 s; TREATMENT.md sections 3-5 (row S1), map.ts
// sections 5-6 (the S1 scale sheet, S1_CLOCK, s1RowAt). RIVERSIDE from a seated eye level on our steps, looking north
// across the canal at Google's two-storey canal wing; she walks out of the glass doors into the gold and strolls WEST
// (screen left) while outline copies of her, greyer each time, pop up ahead of her on the towpath.
//   t < 0      the bare-line state (frame 0 and the loop underlay): warm ink on paper, the sun half-coloured, Pip in
//              colour; first motions run 3-4 frames before t 0 (the cloud, the water, the steps' life).
//   0.02-0.30  the flood from SUN0 (sky by f5, the wing f6-12, water, boats, the steps; her teal coat LAST at f18).
//   0.40 W goes plum-dark · 0.45-0.52 the glass doors slide (the exit ding) · 0.97 she steps out · 1.10 doors shut
//   2.00 ... 4.79 G1-G6 pop on their words · 4.54-4.98 everyone stops · 4.98 "life": one step together, three bare
//   outlines down the bend, birds off the far roofs, Pip ears-cover · 5.59 she looks back at W · 5.90 Pip hops.
//   Camera: the 5 % pull-out about W (1.05 -> 1.00, ease-in, 0-4.90); the push-through into W is the engine's.
// Helpers: V2S1_*.tsx (the steps' public, the sky flood).
import React from 'react';
import {World} from '../../lib/World';
import {Look} from '../../lib/exit';
import {useTime, clamp} from '../../lib/time';
import {XG, mat} from '../../lib/xf';
import {CM} from '../palette';
import * as MAP from '../world/map';
import {S1Set} from '../kit/canal/sets';
import {CanalCast} from '../kit/canal/slots';
import {k4Person} from '../kit/canal/k4k5';
import {Her, GhostRow, strideFor} from '../kit/cast';
import {PipTrack} from '../kit/pip';
import {S1Public} from './V2S1_public';
import {SkyFlood, SunHalf} from './V2S1_sky';
import type {ToneKey} from '../../lib/Film';

export const captionTone: ToneKey[] = [{t: 0, tone: 'dark'}];

const C = MAP.S1_CLOCK;
const STRIDE = strideFor(27, 170, 'rear34');
/** Her steps (lockstep for the whole row): ~1.5 steps/s from the step-out to the stop, ONE step on "life". */
const herStep = (t: number) => {
  // behind the door: frozen mid-step, then two slow steps toward the opening doors
  const inside = 0.5 + 1.2 * clamp((t - 0.55) / 0.42);
  if (t < C.steppingOut) return inside;
  const walk = 1.5 * (Math.min(t, C.stop.t0) - C.steppingOut);
  const life = t >= C.life ? Math.min(1, (t - C.life) / 0.27) : 0;
  return inside + walk + life;
};
/** Her x behind the glass before the step-out: she nears the doors as they open (map: 680 at 0.97). */
const herX = (t: number) => (t < C.steppingOut ? 692 - 12 * clamp((t - 0.55) / 0.42) : MAP.s1HerX(t));

const HerS1: React.FC = () => {
  const t = useTime();
  const pose = MAP.s1RowAt(Math.max(t, 0))[0];
  const step = herStep(t);
  const x = herX(t);
  if (t < C.steppingOut) return null;
  const look = t >= MAP.S1_HER_LOOK_BACK_AT ? clamp((t - MAP.S1_HER_LOOK_BACK_AT) / 0.22) : 0;
  return look > 0 ? (
    <Her x={x} y={pose.feetY} h={pose.h} pose="lookBack" look={look} view="rear34" step={step} stride={STRIDE} plant coatAt={C.flood.t1} />
  ) : (
    <Her x={x} y={pose.feetY} h={pose.h} pose="walk" view="rear34" step={step} stride={STRIDE} plant coatAt={C.flood.t1} />
  );
};

const HerBehindDoor: React.FC = () => {
  const t = useTime();
  if (t >= C.steppingOut) return null;
  return <Her x={herX(t)} y={MAP.S1_HER_STEP_OUT.feetFrom} h={MAP.S1_SHEET.herHAtFacade} pose="walk" view="rear34" step={herStep(t)} stride={STRIDE} plant coatAt={C.flood.t1} />;
};

const Row: React.FC = () => {
  const t = useTime();
  if (t < C.ghostPops[0]) return <HerS1 />;
  return (
    <>
      <GhostRow step={herStep(t)} stride={STRIDE} />
      <HerS1 />
    </>
  );
};

/** Her head (zoom 1.00 px) for Pip's gaze. */
const herHead = (t: number): [number, number] => {
  const p = MAP.s1RowAt(Math.max(t, 0))[0];
  return [herX(t), p.feetY - p.h * 0.9];
};

const PipS1: React.FC = () => (
  <PipTrack
    x={MAP.S1_BOLLARD.x}
    y={MAP.S1_BOLLARD.y}
    size={100}
    facing="back"
    seed="pipS1"
    keys={[
      {t: C.pipHeadFollows, target: herHead},
      {t: C.life, pose: 'earsCover', dur: 0.1},
      {t: 5.55, pose: 'sit', dur: 0.25},
      {t: C.pipHopsUpLeft, target: null, hop: {to: [560, 1010], height: 120, dur: 0.5}},
    ]}
  />
);

const V2S1: React.FC = () => {
  const t = useTime();
  const z = MAP.s1Zoom(Math.max(t, 0));
  const cam = mat.about(mat.scale(z), MAP.W.x, MAP.W.y);
  return (
    <World sky={CM.white} horizon={1000}>
      <XG m={cam}>
        <SkyFlood />
        <Look cascade={{at: C.flood.t0, origin: [MAP.SUN0.x, MAP.SUN0.y], speed: 4800}}>
          <CanalCast person={k4Person}>
            <S1Set towpath={<Row />} behindDoor={<HerBehindDoor />} seated={<S1Public />} pip={<PipS1 />} />
          </CanalCast>
        </Look>
        <SunHalf />
      </XG>
    </World>
  );
};
export default V2S1;
