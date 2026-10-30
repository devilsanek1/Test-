// people_dirs/painterly: the reusable figure component (dir_painterly.md "Use"). One person, one pose, one view:
//   <PainterlyFigure person={HER_EVENING} pose={POSE_STAND} view="front34" h={200} x={540} y={1080} uid="her1" />
// x, y: where the soles land (px); h: the figure's height in px (crown to sole). The rig (a warm key, a cool sky rim)
// is in camera space, so a figure keeps its light when it turns. Everything is deterministic (no randomness).
import React, {useMemo} from 'react';
import {buildModel, type Person} from './figure';
import type {Pose} from './body';
import {type Cam} from './mesh';
import {paintFigure} from './paint';
import {type Rig, DUSK} from './color';
import {type V3, nrm} from './math';

/** The views we use: the front 3/4, the profile (facing screen-left or right), the back, the back 3/4 (lost profile). */
export type View = 'front34' | 'front34R' | 'profileL' | 'profileR' | 'back' | 'back34' | 'front' | number;
export const yawOf = (v: View): number =>
  typeof v === 'number'
    ? v
    : {front34: -32, front34R: 32, profileL: -90, profileR: 90, back: 180, back34: 148, front: 0}[v];

/** The default light: the key from the upper left and a little in front, the sky rim from the right and behind. */
export const KEY_LEFT: {L: V3; R: V3} = {L: nrm([-0.62, 0.5, 0.6]), R: nrm([0.82, 0.22, -0.52])};
export const KEY_RIGHT: {L: V3; R: V3} = {L: nrm([0.62, 0.5, 0.6]), R: nrm([-0.82, 0.22, -0.52])};

export type FigureProps = {
  person: Person;
  pose: Pose;
  view: View;
  /** Height in px, crown to sole. */
  h: number;
  x: number;
  y: number;
  uid: string;
  rig?: Rig;
  light?: {L: V3; R: V3};
  /** Mesh resolution (1 = full; lower for small figures). Default from the size. */
  res?: number;
  /** The camera's eye height (in H) and distance (in H): a mild perspective. */
  eye?: number;
  dist?: number;
  shadow?: string | null;
  groundGrad?: number;
  brush?: number;
  flat?: boolean;
};

export function camFor(p: {view: View; h: number; x: number; y: number; light?: {L: V3; R: V3}; eye?: number; dist?: number}): Cam {
  const lt = p.light ?? KEY_LEFT;
  return {yaw: yawOf(p.view), eyeY: (p.eye ?? 0.9) * 1000, D: (p.dist ?? 5) * 1000, s: p.h / 1000, ox: p.x, oy: p.y, L: lt.L, R: lt.R};
}

export const resFor = (h: number) => (h >= 500 ? 1 : h >= 260 ? 0.75 : h >= 160 ? 0.55 : 0.42);

export const PainterlyFigure: React.FC<FigureProps> = (p) => {
  const res = p.res ?? resFor(p.h);
  const model = useMemo(() => buildModel(p.person, p.pose, res), [p.person, p.pose, res]);
  const cam = camFor(p);
  return paintFigure(model, cam, {rig: p.rig ?? DUSK, uid: p.uid, shadow: p.shadow, groundGrad: p.groundGrad, brush: p.brush, flat: p.flat});
};
