// ShotCam.tsx — the default camera for a multiplane shot, in one component (no flags that must agree).
// It is the cine <CineCamera> with the transition camera ALWAYS folded in (`stage`), which is safe in both World
// modes: a flat <World> consumes the transition camera itself (children see rest), a <World stage="context"> passes
// it through and ShotCam adds it with real parallax.
//
//   <World stage="context" sky={...}>
//     <ShotCam push={{to: 1.06, dur: 2}}>                         // reference 2's per-shot gentle push (dolly)
//       <Layer depth={1}> sky things </Layer>  <Layer depth={0}> ... </Layer>  <Layer depth={-0.5}> framing </Layer>
//     </ShotCam>
//   </World>
//   <ShotCam keys={[{t: 0, y: 1260}, {t: 5, y: -540, ease: MOTION.camera.reveal}]} handheld={1.2}>   // any CineCamera keys
//
// For a flat scene (no layers) the World `push` prop does the same job without a camera.

import React from 'react';
import {CineCamera, CamKey, CamState} from './cine/camera';
import {Ease} from './time';
import {MOTION} from './spec';
import {world} from './theme';
import type {Seed} from './rng';
import type {Pt} from './sketch';

export type ShotPush = {
  /** Screen scale of the reference plane at the end (1.06 = +6 %). Far layers grow less (dolly parallax). */
  to?: number;
  dur?: number;
  at?: number;
  /** World point (reference plane) that stays put. Default world.vp. */
  anchor?: Pt;
  ease?: Ease;
};

export type ShotCamProps = {
  /** Gentle per-shot dolly push (true = 1.06 over 2 s from t 0). Ignored when `keys` is given. */
  push?: ShotPush | boolean;
  /** Full CineCamera keys (see docs/CINE.md). */
  keys?: CamKey[];
  handheld?: number;
  seed?: Seed;
  add?: Partial<CamState>;
  children?: React.ReactNode;
};

/** CineCamera keys for a gentle push (dolly: push = 1 - 1 / to at depth 0). */
export function pushKeys(p: ShotPush | boolean = true): CamKey[] {
  const o = p === true || p === false ? {} : p;
  const to = o.to ?? MOTION.camera.push.to;
  const at = o.at ?? 0;
  const anchor = o.anchor ?? world.vp;
  return [
    {t: at, push: 0, anchor},
    {t: at + (o.dur ?? MOTION.camera.push.dur), push: 1 - 1 / to, anchor, ease: o.ease ?? MOTION.camera.push.ease},
  ];
}

export const ShotCam: React.FC<ShotCamProps> = ({push, keys, handheld = 0, seed = 'shot', add, children}) => (
  <CineCamera keys={keys ?? (push ? pushKeys(push) : [])} handheld={handheld} seed={seed} add={add} stage>
    {children}
  </CineCamera>
);
