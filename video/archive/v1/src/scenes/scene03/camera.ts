// S03 camera (storyboard v3, ONE owner per move: this scene's own keys; Film adds no camera on a 'cut').
// screen = (world - cam) x zoom + (540, 960)
//   cut(password) -> w34 'everyone'  push-in (540, 950, 1.00) -> (545, 945, 1.04), inOut(sine): a 4 % breath from rest
//   w34 'everyone' -> cut(it)        hold (545, 945, 1.04): locked while the bait plays and the count happens
// The breath ends at zero velocity (sine) into the lock: velocity-continuous, no step.

import {ease as E, prog} from '../../lib/time';
import {mat, Mat} from '../../lib/xf';
import type {Pt} from '../../lib/sketch';

export type CamKey = {x: number; y: number; zoom: number};

export const CAM_REST: CamKey = {x: 540, y: 950, zoom: 1.0};
export const CAM_LOCK: CamKey = {x: 545, y: 945, zoom: 1.04};

/** Camera at scene time t; `breathEnd` = local time of w34 'everyone'. */
export function camAt(t: number, breathEnd: number): CamKey {
  const p = prog(t, 0, breathEnd, E.inOutSine);
  return {
    x: CAM_REST.x + (CAM_LOCK.x - CAM_REST.x) * p,
    y: CAM_REST.y + (CAM_LOCK.y - CAM_REST.y) * p,
    zoom: CAM_REST.zoom * Math.pow(CAM_LOCK.zoom / CAM_REST.zoom, p),
  };
}

/** World -> screen matrix of a camera key. */
export const camMat = (c: CamKey): Mat => mat.compose(mat.translate(540, 960), mat.scale(c.zoom), mat.translate(-c.x, -c.y));

/** World point -> screen point. */
export const toScreen = (c: CamKey, p: Pt): Pt => [(p[0] - c.x) * c.zoom + 540, (p[1] - c.y) * c.zoom + 960];
