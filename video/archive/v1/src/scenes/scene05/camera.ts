// S05 camera (storyboard v3, ONE owner per move: this scene's own keys; Film adds no camera on a 'matchcut').
// screen = (world - cam) x zoom + (540, 960)
//   cut(years) -> +0.40      push-in zoom 1.033 -> 1.13, 1 - 2^(-6.67u) normalised (A1 fix round: was 1.055 over 0.30 s on
//                            2^(-8u); A1: 1.07; fix round 4: out(expo)): the S04 dive lands still moving IN (log-zoom
//                            ~0.77 /s on Main's first S05 pair vs S04's last ~0.83 /s) and decelerates over ~10 frames
//                            (x 0.68 per frame); the lock on Main's first S05 frame is S04's last-frame size (~60 px).
//                            y has its OWN zero-velocity ease (fix round 3): 960 -> 940 in-out(sine) over 0.05 -> 0.65
//                            s, so the lock (world y 960) holds its screen spot through the match; peak ~1.2 px/frame.
//                            The 20 world px rise (fix round 2) puts the cornice ink at screen ~587, under the caption
//                            band (ENGINE 10; 950 was tried in the final polish and failed the caption check)
//   +0.40 -> cut(was)-0.30   hold (540, 940, 1.13): locked while the teams, tablets, beams and the ring build
//   cut(was)-0.30 -> cut     truck-right (540 -> 690, 940, 1.13), in(sine): follows the messenger out of frame right; a
//                            FIXED 0.30 s ending on the cut, exiting at pi/2 x 150 / 0.30 x 1.13 = ~888 screen px/s
// Zoom is interpolated in log space. Every segment meets the next at zero velocity except the cut-on-action exit.
// MULTIPLANE (fix round 1): every set layer sees its own camera x = 540 + f x (cam.x - 540) (zoom and y shared, so the
// t = 0 lock / L5 match and the whole hold are unchanged): the steps plane (teams, messenger, Pip in the air) is the
// match plane f = 1 (~29.6 px/frame at the cut, = S06's messenger plane), the facade and banner 0.67 (~19.8 px/frame,
// S06's houses run at 0.6 = ~17), the wing 0.4, the foreground audience 1.0 (final polish: its big flat heads strobed at
// 32.7 px/frame with 1.12; fix round 2: was 1.3 = ~38), the sun 0.05 (screen space, Scene05.tsx).

import {ease as E, lerp, prog} from '../../lib/time';
import {mat, Mat} from '../../lib/xf';
import type {Pt} from '../../lib/sketch';

export type Cam = {x: number; y: number; zoom: number};

/** Fix round 4: 1.08 -> 1.07 (Main's first S05 frame is t = 0.01, already into the landing: the lock grew ~9 % across
 *  the cut against S04's last drawn frame). A1 polish: 1.07 -> 1.055 with the steeper LAND_K 8. A1 fix round (review:
 *  the rate then halved every frame, 0.79 -> 0.43 -> 0.23 /s, a soft brake on the cut, not one long decelerating
 *  push): 1.055 -> 1.033 over a 0.40 s landing at the gentler K 6.67 (per-frame decay 0.68 instead of 0.54: 0.77, 0.53,
 *  0.36, 0.25 /s ...). Main's first S05 pair still runs at ~0.77 /s against S04's last pair ~0.83 /s (S04's Hermite dive
 *  ends at 0.84 /s, scene04/camera.ts), and the lock on Main's first S05 frame is ~60.6 px wide (S04's last: 59 px plus
 *  one frame of its zoom = 60.7). */
export const K_LAND: Cam = {x: 540, y: 960, zoom: 1.033};
/** Final polish: a review asked to take back 10-15 px of the y rise (the teams' feet sit at screen ~1559, in the bottom
 *  UI band) "if the cornice allows". Tried 950: the cornice ink came to ~576 and the caption check failed (f63, the
 *  'how bad it was.' roll: 8 % of its box under 3:1; f24 warned), so the rise stays 20 world (feet ~1559, foreground
 *  framing; the key reads are above y 1480). */
export const K_LOCK: Cam = {x: 540, y: 940, zoom: 1.13};
export const K_EXIT: Cam = {x: 690, y: 940, zoom: 1.13};
/** A1 fix round: 0.30 -> 0.40 s with K 5 -> 6.67 (the same per-frame decay), so the landing's residual rate when it
 *  locks is ~0.01 /s (0.4 px/frame at the frame corners) instead of a ~1.2 px/frame step. */
export const LAND = 0.4;
export const TRUCK = 0.3;
/** The y rise: in-out(sine) from RISE[0] over RISE[1] s (zero velocity at both ends). */
export const RISE: [number, number] = [0.05, 0.6];
/** Fix round 4: the landing's ease, 1 - 2^(-K u) normalised (was out(expo), exponent 10: a 1.3-frame time constant, the
 *  log-zoom rate halved every frame after the cut and read as a soft stop). A1 polish: K 6 -> 8 with K_LAND 1.055 (one
 *  decelerating push across the matchcut, ~1.4 x rate drop at the cut). */
const LAND_K = 6.67;
const landEase = (u: number) => (u >= 1 ? 1 : (1 - Math.pow(2, -LAND_K * u)) / (1 - Math.pow(2, -LAND_K)));

/** Camera at scene time t; `end` = the scene length (the cut on action). */
export function camAt(t: number, end: number): Cam {
  const y = lerp(K_LAND.y, K_LOCK.y, prog(t, RISE[0], RISE[1], E.inOutSine));
  if (t < LAND) {
    const q = landEase(prog(t, 0, LAND));
    return {x: K_LAND.x, y, zoom: Math.exp(lerp(Math.log(K_LAND.zoom), Math.log(K_LOCK.zoom), q))};
  }
  const q = prog(t, end - TRUCK, TRUCK, E.inSine);
  return {x: lerp(K_LOCK.x, K_EXIT.x, q), y, zoom: K_LOCK.zoom};
}

/** Parallax factor per BlueprintWall layer (the set's own `n` is a draw order, not a depth: ignored). */
export const LAYER_F: Record<string, number> = {wing: 0.4, facade: 0.67, banner: 0.67, steps: 1, foreground: 1.0};

/** The camera a layer with parallax factor f sees. */
export const layerCam = (c: Cam, f: number): Cam => ({x: K_LOCK.x + f * (c.x - K_LOCK.x), y: c.y, zoom: c.zoom});

/** World -> screen matrix of a camera. */
export const camMat = (c: Cam): Mat => mat.compose(mat.translate(540, 960), mat.scale(c.zoom), mat.translate(-c.x, -c.y));

/** World point -> screen point. */
export const toScreen = (c: Cam, p: Pt): Pt => [(p[0] - c.x) * c.zoom + 540, (p[1] - c.y) * c.zoom + 960];

/** Screen point -> world point. */
export const toWorld = (c: Cam, p: Pt): Pt => [(p[0] - 540) / c.zoom + c.x, (p[1] - 960) / c.zoom + c.y];
