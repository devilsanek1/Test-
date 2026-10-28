// V2S1 "Walking out" (lane L1, the hook and the PILOT). Film 0.00-6.10 s; TREATMENT.md sections 3-5 (row S1), map.ts
// sections 5-6 (the S1 scale sheet, S1_CLOCK, s1RowAt). RIVERSIDE from a seated eye level on our steps, looking north
// across the canal at Google's two-storey canal wing; she walks out of the glass doors into the gold and strolls WEST
// (screen left) while outline copies of her, greyer each time, pop up ahead of her on the towpath.
//   t < 0      the loop underlay (V2S1_clock S1_F0): paper, every fill a flat PALE shape, NO line yet, the sun
//              half-coloured; no Pip (S8's Pip owns the seam); its bollard pale.
//   0.00-0.39  REVIEW_1 MUST 2: the strokes START at frame 0 and are the event: the clean pen draws her behind the glass,
//              then the door (frame, leaves), then W, bold (5.4 px: S1_BOLD) with a moving tip (S1_DRAW)
//   0.40 W goes plum-dark (its pane in full colour at once: the first colour after the sun) · 0.44-0.78 the flood from
//              SUN0 (the sky by f30, the wing, water, boats, the steps; Pip's tinted line with it; her teal coat LAST at
//              f47; the bold line eases back to 3.0 px by 0.80) · 0.45-0.52 the glass doors slide (the exit ding) ·
//              0.97 she steps out · 1.10 doors shut
//   2.00 ... 4.79 G1-G6 pop on their words · 4.54-4.98 everyone stops mid-stride · 4.98 "life": one step together,
//   three bare outlines down the bend, Pip ears-cover · 5.55 Pip sits · 5.59 she looks back at W.
//   Camera: LOCKED at zoom 1.00 (the pull-out is retired); 5.875-6.325 the push-through into W is the engine's. In
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
import {S1Particles} from './V2S1_particles';

export const captionTone: ToneKey[] = [{t: 0, tone: 'dark'}];

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
