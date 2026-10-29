// S09 camera: three framings, one owner (this scene; Film adds no camera: matchcut in, tram wipe out).
//   A1  Stoop Street wide  (560, 1020) zoom 1.00 -> 1.03 (in-out sine, cut -> cut(out)): a 3 % breath on the dusk street,
//       the VP STOOP.vp (720, 1060) sits at screen (700, 1000) = where S08's sun set (stays within 5 px).
//   A2  door #4 close      (330, 900) zoom 1.5, HELD STILL (hard cut on 'somebody' -> the hidden cut).
//   B   TerraceHill        log-anchored pull-back (540, 1407, 6) -> (540, 890, 1), MOTION.camera.reveal from rest,
//       anchored on house #4's lock (world (540, 1464.5)) released from screen (540, 1305) to its rest spot (540, 1534.5);
//       lands on 'single' and HOLDS still to the tram wipe. Fix round 2b: the rest camera sits 70 px HIGHER than the set's
//       canvas rest (cam y 890, screen = world + 70): row 0's base at screen 1570, the sun's crest top at 640 (>= 600 under
//       the captions), the near street band below for the standers, their shadows and the near balustrade.
// screen = (world - cam) * zoom + (540, 960).

import {MOTION, ease as E, clamp, mat, Mat} from '../../lib';
import {B} from './beats';

export type Cam = {x: number; y: number; zoom: number; part: 'A1' | 'A2' | 'B'};
const C: [number, number] = [540, 960];

export const A1 = {x: 560, y: 1020, z0: 1, z1: 1.03};
export const A2 = {x: 330, y: 900, zoom: 1.5};
/** Part B: the lock anchor (world) and its screen path. */
export const BPULL = {anchor: [540, 1464.5] as [number, number], from: 1305, to: 1534.5, zoom0: 6};
/** Part B's rest: screen = world + (0, REST_DY). */
export const REST_DY = BPULL.to - BPULL.anchor[1];

export function camAt(t: number): Cam {
  if (t < B.cutA2) {
    const q = E.inOutSine(clamp(t / B.cutA2));
    return {x: A1.x, y: A1.y, zoom: A1.z0 + (A1.z1 - A1.z0) * q, part: 'A1'};
  }
  if (t < B.hidden) return {x: A2.x, y: A2.y, zoom: A2.zoom, part: 'A2'};
  const q = clamp((t - B.hidden) / (B.land - B.hidden));
  const u = MOTION.camera.reveal(q);
  const zoom = Math.exp(Math.log(BPULL.zoom0) * (1 - u));
  const ay = BPULL.from + (BPULL.to - BPULL.from) * u;
  return {x: BPULL.anchor[0] - (540 - C[0]) / zoom, y: BPULL.anchor[1] - (ay - C[1]) / zoom, zoom, part: 'B'};
}

/** world -> screen matrix of a camera. */
export const camMat = (c: Cam): Mat => mat.compose(mat.translate(C[0], C[1]), mat.scale(c.zoom, c.zoom), mat.translate(-c.x, -c.y));

export const toScreen = (c: Cam, p: [number, number]): [number, number] => [(p[0] - c.x) * c.zoom + C[0], (p[1] - c.y) * c.zoom + C[1]];

/** The hidden cut maps Part A2's world onto TerraceHill's world: same screen at A2 (zoom 1.5) and B's start (zoom 6).
 *  wB = (457.5, 1182) + 0.25 wA  (lock4 (330, 1130) 34 x 42 -> house #4's lock (540, 1464.5) 8.5 x 10.5). */
export const A2_TO_B = {k: A2.zoom / BPULL.zoom0, dx: 540 - A2.x * (A2.zoom / BPULL.zoom0), dy: 1407 - A2.y * (A2.zoom / BPULL.zoom0)};
export const a2ToBMat: Mat = mat.compose(mat.translate(A2_TO_B.dx, A2_TO_B.dy), mat.scale(A2_TO_B.k, A2_TO_B.k));
export const a2ToB = (p: [number, number]): [number, number] => [A2_TO_B.dx + A2_TO_B.k * p[0], A2_TO_B.dy + A2_TO_B.k * p[1]];
