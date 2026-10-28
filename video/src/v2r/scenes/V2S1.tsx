// V2S1 "Walking out" (lane L1, the hook and the PILOT). Film 0.00-6.10 s; TREATMENT.md sections 3-5 (row S1), map.ts
// sections 5-6 (the S1 scale sheet, S1_CLOCK, s1RowAt). RIVERSIDE from a seated eye level on our steps, looking north
// across the canal at Google's two-storey canal wing; she walks out of the glass doors into the gold and strolls WEST
// (screen left) while outline copies of her, greyer each time, pop up ahead of her on the towpath.
//   t < 0      the clean pen's drawing state (frame 0 and the loop underlay; V2S1_clock S1_F0): paper, every fill a flat
//              PALE shape, no line but the subject's outlines drawing on from -0.26 (her behind the glass, the door, W),
//              the sun half-coloured; no Pip (S8's Pip owns the seam); its bollard pale.
//   0.00-0.30  Pip's tinted line draws on; the flood from SUN0 (sky by f5, the wing f6-12, water, boats, the steps; Pip
//              with it; her teal coat LAST at f18).
//   0.40 W goes plum-dark · 0.45-0.52 the glass doors slide (the exit ding) · 0.97 she steps out · 1.10 doors shut
//   2.00 ... 4.79 G1-G6 pop on their words · 4.54-4.98 everyone stops mid-stride · 4.98 "life": one step together,
//   three bare outlines down the bend, Pip ears-cover · 5.55 Pip sits · 5.59 she looks back at W.
//   Camera: LOCKED at zoom 1.00 (the pull-out is retired); 5.95-6.25 the push-through into W is the engine's. In
//   5.80-6.40 nothing enters, pops or turns but the dive.
//   Light: <Lit rig={RIG_CANAL}> (V2S1_light; the sun low left, shadows right and a little toward us).
// Parts (each its own file; the shared clock and contract is V2S1_clock.ts):
//   V2S1_sky    the sky flood + the frame-0 half sun      V2S1_set    the world (S1World) and its slots
//   V2S1_row    her + the ghost row (towpath slot)         V2S1_steps  our bank: steps, the seated public (seated slot)
//   V2S1_pip    Pip + its bollard (pip slot)                V2S1_light  the light layers (shadows, shades)
import React from 'react';
import {World} from '../../lib/World';
import {Look} from '../../lib/exit';
import {Lit} from '../../lib/light';
import {RIG_CANAL} from '../world/rigs';
import {CM} from '../palette';
import {FLOOD, FLOOD_ORIGIN, S1_PALE} from './V2S1_clock';
import {SkyFlood} from './V2S1_sky';
import {S1World} from './V2S1_set';
import {S1Row, S1HerBehindDoor} from './V2S1_row';
import {S1Steps} from './V2S1_steps';
import {S1Pip} from './V2S1_pip';
import type {ToneKey} from '../../lib/Film';
import {CAPTION_BAND, Particles, glitterPath} from '../../lib/particles';
import * as MAP from '../world/map';
import {S1Plane, S1_PLANE} from './V2S1_float';

export const captionTone: ToneKey[] = [{t: 0, tone: 'dark'}];

/** THE PARTICLES (the owner's note, 2026-10-27: "a bit of particles here and there ... to make things a bit more
 *  natural"; CRAFT §f.6; conform_L1 §11): three small tier-C fields from lib/particles, all after the frame-0 flood
 *  (t0 0.30), no birth after 5.75 (nothing enters in 5.80-6.40 around the push-through join at 6.10), clear of the
 *  caption band and her path:
 *    motes   a few in the sun-side air over the west gap, against the far rows (a step lighter toward SUN0)
 *    glints  in the sun's glitter path on the canal under SUN0 (short level dashes that shorten toward the horizon)
 *    a leaf  from the plane branch, straight down the left gutter (x < 95: never through the caption band; no drift,
 *            a 10 px margin: conform_L1 §11, the toolkit critic's note) */
export const S1_PARTICLES = {t0: 0.3, t1: 5.75, joins: [6.1], her: [380, 900, 320, 220] as [number, number, number, number]};
const S1Particles: React.FC = () => {
  const sun: [number, number] = [MAP.SUN0.x, MAP.SUN0.y];
  const common = {t0: S1_PARTICLES.t0, t1: S1_PARTICLES.t1, joins: S1_PARTICLES.joins, avoid: [CAPTION_BAND, S1_PARTICLES.her], sun};
  return (
    <>
      {/* motes 3-4 px against the shaded far tower beside the sun, where they show (over the pale far rows they did not) */}
      <S1Plane plane={S1_PLANE.farTower}>
        <Particles kind="motes" seed="s1motes" region={{rect: [252, 640, 104, 280]}} on="#B5B7C6" size={[3, 4]} count={4} {...common} />
      </S1Plane>
      {/* glints as 14-24 px level dashes, 2-4 twinkling at once in the sun's glitter path */}
      <S1Plane plane={S1_PLANE.water}>
        <Particles kind="glints" seed="s1glints" region={{poly: glitterPath({x: MAP.SUN0.x, yFar: 1104, yNear: 1166})}} on="#E9C98E" horizon={965} size={[14, 24]} count={5} gap={[0.05, 0.3]} {...common} />
      </S1Plane>
      {/* a second leaf from the bay tree, across the mid ground from ~2.75 s (its seed's first birth; clear of the row
          and the caption band) */}
      <S1Plane plane={S1_PLANE.near}>
        <Particles kind="leaves" seed="s1leaf2" region={{rect: [70, 1330, 170, 80]}} on="#F4D6C2" colors={[CM.leafGold, CM.leafRust]} floor={1700} count={1} size={[10, 14]} t0={common.t0} t1={4} joins={common.joins} avoid={common.avoid} sun={sun} />
      </S1Plane>
      <S1Plane plane={S1_PLANE.near}>
        <Particles kind="leaves" seed="s1leaf" region={{rect: [20, 110, 34, 70]}} on="#DACCBE" colors={[CM.leafGold, CM.leafRust]} floor={1910} count={1} gap={[0.3, 0.9]} drift={[0, 0]} margin={10} {...common} />
      </S1Plane>
    </>
  );
};

const V2S1: React.FC = () => (
  <World sky={CM.white} horizon={1000}>
    <Lit rig={RIG_CANAL}>
      <SkyFlood />
      <Look cascade={{at: FLOOD.t0, origin: FLOOD_ORIGIN, speed: FLOOD.speed, pale: S1_PALE, paper: CM.white}}>
        <S1World behindDoor={<S1HerBehindDoor />} towpath={<S1Row />} seated={<S1Steps />} pip={<S1Pip />} />
      </Look>
      <S1Particles />
    </Lit>
  </World>
);
export default V2S1;
