// K4 cast: HER (TREATMENT section 3). Generic and invented, never a likeness, never a face: a round plum head with a
// low bun, a long teal coat (the film's hero colour, hers only), a cream tote; in S1 a potted desk plant under her arm.
// Back view, rear 3/4 or walking profile. One model at every size (130-200 px; never under 130 px while she carries
// a story change), plus the French-window silhouette with the phone (S3).
//
//   <Her x={510} y={1095} pose="walk" view="rear34" step={step} plant />           // S1: strolling west (left)
//   <Her x={510} y={1095} pose="lookBack" step={step} plant />                      // S1 5.59: a look back at W
//   <Her x={720} y={1080} pose="walk" view="profile" step={step} />                 // S4: walking left in profile
//   <Her x={720} y={1080} pose="stopLook" />                                       // S4 17.96: stops, looks west
//   <Her x={565} y={1060} h={150} pose="walk" view="back" step={step} />            // S8: walking home, away
//   <Her x={565} y={1060} h={150} pose="goIn" />                                   // S8 34.55: at her door
//   <HerWindow x0={300} x1={370} y={860} h={136} gestureAt={14.28} />               // S3: pacing, phone at her ear
//
// Poses: walk (back | rear34 | profile) · stand · stopLook (profile, head up) · lookBack (rear 3/4, head turned back
// over her right shoulder) · goIn (back, a hand to the door, one foot on the step) · window silhouette (HerWindow).

import React from 'react';
import {useTime} from '../../../lib/time';
import {CM} from '../../palette';
import {Model, View} from './body';
import {BuildProps, Person} from './People';
import {drawn} from './gait';
import {Traits} from './traits';
import {ExitSync} from '../../../lib/exit';

/** Her model sheet (the one source of her colours and cut). */
export const HER: Traits & Partial<Model> = {
  hair: 'lowBun',
  hairColor: CM.anchor,
  hatColor: CM.anchor,
  coat: CM.hero,
  coatLen: 'long',
  trousers: CM.coatPlum,
  shoes: CM.line,
  skin: CM.brickLight,
  acc: 'none',
  accColor: CM.coatOat,
  tall: 1,
  broad: 0.94,
  tote: CM.coatOat,
  vent: true,
};

/** Her sizes in the shot list (px, standing height). */
export const HER_SIZE = {s1: 170, s1Door: 153, s4: 170, s8: 150, s3Window: 136, min: 130} as const;

export type HerPose = 'walk' | 'stand' | 'stopLook' | 'lookBack' | 'goIn';

export type HerProps = BuildProps & {
  /** Feet (canvas px). */
  x: number;
  y: number;
  /** Standing height (default 170). */
  h?: number;
  pose?: HerPose;
  /** View for walk / stand (default rear34: walking away-left down a towpath). */
  view?: View;
  /** Face right (the drawings face left). */
  flip?: boolean;
  /** Steps taken (gait.ts stepsAt, 12 drawings/s); or `walk` to clock herself. */
  step?: number;
  walk?: {rate: number; t0?: number; phase?: number};
  /** Stride factor (gait.ts strideFor: S1 strideFor(27, 170, 'rear34'), S4 strideFor(34, 170)). Default 1. */
  stride?: number;
  /** The potted desk plant under her arm (S1). */
  plant?: boolean;
  /** The cream tote (default true). */
  tote?: boolean;
  /** lookBack: how far round (0..1, default 1). */
  look?: number;
  /** goIn: the hand target relative to her feet (default a door handle at her right, forearm in, one foot on the step). */
  reach?: [number, number];
  /** Her coat stays paper until this time (S1: the flood reaches her coat LAST, f18 = 0.30 s). */
  coatAt?: number;
  ink?: number;
  seed?: string;
};

/** Her, at any size the shot list uses. */
export const Her: React.FC<HerProps> = ({x, y, h = 170, pose = 'walk', view, flip, step, walk, stride, plant, tote = true, look = 1, reach, coatAt, ink, seed = 'her', at, fillLag}) => {
  const t = useTime();
  const coat = coatAt !== undefined && t < coatAt ? CM.white : CM.hero;
  const model: Partial<Model> = {...HER, coat, plant, tote: tote ? HER.tote : undefined, cheek: true};
  const common = {x, y, h, seed, at, fillLag, exact: true, flip, stride, ink: ink ?? (h >= 130 ? 3.4 : 2.2), model, traits: HER};
  switch (pose) {
    case 'stand':
      return <Person {...common} pose="stand" view={view ?? 'rear34'} />;
    case 'stopLook':
      return <Person {...common} pose="stand" view="profile" tilt={-9} />;
    case 'lookBack':
      return <Person {...common} pose={step !== undefined || walk ? 'walk' : 'stand'} step={step} walk={walk} view={view ?? 'rear34'} turn={look} />;
    case 'goIn':
      return <Person {...common} pose="reach" view="back" reach={reach ?? [h * 0.2, -h * 0.56]} elbow={[h * 0.27, -h * 0.62]} stepUp={1} />;
    case 'walk':
    default:
      return <Person {...common} pose="walk" step={step} walk={walk ?? (step === undefined ? {rate: 1.6} : undefined)} view={view ?? 'rear34'} />;
  }
};

export type HerWindowProps = BuildProps & {
  /** Pacing range for her feet (canvas px) on the room floor behind the French window. */
  x0: number;
  x1: number;
  y: number;
  /** Silhouette height (>= 130 px while she carries the S3 beat). */
  h?: number;
  /** Seconds per one-way pace (default 1.7) and the pause at each end (default 0.45). */
  pace?: number;
  hold?: number;
  /** Phase offset (s) of the pacing. */
  phase?: number;
  /** Her free hand moves at this time (S3 14.28: 0.45 s out and back). */
  gestureAt?: number;
  /** Silhouette colour (default the plum anchor, against the lamp-lit room). */
  color?: string;
  seed?: string;
};

/** Her full-figure silhouette pacing in her lamp-lit French window, phone at her ear (S3 flash-forward). */
export const HerWindow: React.FC<HerWindowProps> = ({x0, x1, y, h = 136, pace = 1.7, hold = 0.45, phase = 0, gestureAt, color = CM.anchor, seed = 'herWin', at, fillLag}) => {
  const t = useTime();
  const T = 2 * (pace + hold);
  const v = (((t + phase) % T) + T) % T;
  let x: number;
  let dir: 1 | -1;
  let moving: boolean;
  if (v < pace) {
    x = x0 + (x1 - x0) * smooth(v / pace);
    dir = 1;
    moving = true;
  } else if (v < pace + hold) {
    x = x1;
    dir = 1;
    moving = false;
  } else if (v < 2 * pace + hold) {
    x = x1 + (x0 - x1) * smooth((v - pace - hold) / pace);
    dir = -1;
    moving = true;
  } else {
    x = x0;
    dir = -1;
    moving = false;
  }
  const g = gestureAt !== undefined ? bump(t, gestureAt, 0.45) : 0;
  const step = moving ? 1.6 * drawn(t + phase, 12) : 0;
  return (
    <ExitSync seed={`fig/${seed}`}>
      <Person
        x={x}
        y={y}
        h={h}
        exact
        seed={seed}
        traits={HER}
        model={{...HER, coat: color, mono: color, tote: undefined, vent: false}}
        pose="phoneEar"
        gesture={g}
        view="profile"
        step={moving ? step : undefined}
        stride={0.7}
        flip={dir > 0}
        ink={0}
        exactFill
        at={at}
        fillLag={fillLag}
        noSync
      />
    </ExitSync>
  );
};

const smooth = (k: number) => {
  const c = Math.max(0, Math.min(1, k));
  return c * c * (3 - 2 * c);
};
/** 0 -> 1 -> 0 over dur from at (a gesture out and back). */
const bump = (t: number, at: number, dur: number) => (t < at || t > at + dur ? 0 : Math.sin(((t - at) / dur) * Math.PI));
