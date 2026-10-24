// S11 camera: one flat camera on the GovernmentPlaza world (PLAZA.closeup), keyed in scene seconds.
//   cut -> 'if'          push-in (518,826,1.60) -> (518,826,1.66), in-out sine (a gentle 4 % push from rest)
//   'if' -> cut(off)     hold: locked, the tension comes from the crawling bar
//   cut(off) -> end(everything)+0.05   lean (518,826,1.66) -> (522,832,1.71), in-out sine (3 % into the joke)
//   -> cut(everything)   hold for the exits
// Every segment starts and ends at zero velocity (sine), so the camera never stalls mid-move or slams at a seam.
// screen = (world - cam) * zoom + (540, 960). Zoom is interpolated in log space (constant perceived rate).

import {ease as E, prog} from '../../lib/time';
import {mat, Mat} from '../../lib/xf';
import type {Pt} from '../../lib/sketch';

export type Cam = {x: number; y: number; z: number};

export type CamKey = Cam & {t: number};

/** Keys in scene seconds (filled by the scene from its beats). */
export function camKeys(b: {lookNotice: number; offCut: number; leanEnd: number}): CamKey[] {
  return [
    {t: 0, x: 518, y: 826, z: 1.6},
    {t: b.lookNotice, x: 518, y: 826, z: 1.66},
    {t: b.offCut, x: 518, y: 826, z: 1.66},
    {t: b.leanEnd, x: 522, y: 832, z: 1.71},
  ];
}

export function camAt(keys: CamKey[], t: number): Cam {
  if (t <= keys[0].t) return keys[0];
  for (let i = 1; i < keys.length; i++) {
    const a = keys[i - 1];
    const b = keys[i];
    if (t <= b.t) {
      const q = prog(t, a.t, b.t - a.t, E.inOutSine);
      return {x: a.x + (b.x - a.x) * q, y: a.y + (b.y - a.y) * q, z: Math.exp(Math.log(a.z) + (Math.log(b.z) - Math.log(a.z)) * q)};
    }
  }
  return keys[keys.length - 1];
}

/** World -> screen matrix of a camera. */
export const camMat = (c: Cam): Mat => mat.compose(mat.translate(540, 960), mat.scale(c.z), mat.translate(-c.x, -c.y));

/** World point -> screen point. */
export const toScreen = (c: Cam, p: Pt): Pt => [(p[0] - c.x) * c.z + 540, (p[1] - c.y) * c.z + 960];
