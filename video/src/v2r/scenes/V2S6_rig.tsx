// V2S6_rig.tsx (lane L5): the numbers every V2S6 part shares.
// CLOCK: V2S6 starts at film 23.80 (scenes.json: S5's blossom tree wipes it in 23.62-23.98). V2S6.tsx wraps the shot
//   in <TimeShift by={0.2}>, so every part, and the dc kit's gate (its S6_T0 is 24.00), runs on t = film - 24.00
//   (-0.20 .. 4.10). Word times below are on that clock.
// CAMERA (CRAFT §f.5: ONE camera per shot; lib/depth groundCam): eye level, 1.6 m up, horizon y 771, VP (540, 771),
//   f 1400. It is the camera the gate's own far field already implies: the service door (2.5 m, 100 px tall, foot at
//   y 835) = 40 px/m, (835 - 771) / 40 = 1.6 m; the far promenade's people (1.7 m, ~105 px at feet ~870); the lawn's
//   gravel walk runs to (455, 771) on the same horizon. The deal board's feet (the kerb, y 1252): 300 px/m, z 4.66 m
//   (its face 1.6 m wide); Pip (feet 1410): z 3.5 m; the frame's foot: z 1.95 m (718 px/m). The kit's `GATE.horizon`
//   836 is the facade's foot, not the eye.
// FLOAT (DIRECTION rule 8; lib/depth floatAt / parallaxOffset, as S1's V2S1_float): one gentle out-and-back after the
//   purpose line, home through the join in (to 24.30), on F12 + Pip's flick (26.40 on) and through the push-through
//   into SUN2 (27.95; F11 measures 27.82). Each plane shows its share; the sky, the sun and the captions none.
import React from 'react';
import {useTime} from '../../lib/time';
import {floatAt, floatProblems, groundCam, parallaxOffset, PARALLAX_SKY, type FloatLeg} from '../../lib/depth';
import {S6, SUN2, s6BoardAt, shotById, type Rect} from '../world/map';

export const T0 = 24.0;
/** The shot's start on the film (map SHOTS = scenes.json): 23.80. V2S6 shifts its clock by T0 - S6_START. */
export const S6_START = shotById('V2S6').start;
/** The shot on the inner clock: -0.20 (film 23.80) .. 4.10 (film 28.10). */
export const T_IN = -0.2;
export const T_OUT = 4.1;
export const DUR = T_OUT - T_IN;
/** HEARD word onsets, inner seconds (film - 24.00). */
export const W6 = {
  any: 0.03,
  lawful: 0.28,
  government: 0.76,
  purpose: 1.16,
  google: 2.08,
  cant: 2.36,
  veto: 2.5,
  how: 3.08,
  used: 3.56,
  usedEnd: 3.82,
} as const;

// ---------------------------------------------------------------- the camera

export const HORIZON = 771;
export const VP = {x: 540, y: HORIZON} as const;
export const CAM = groundCam({horizon: HORIZON, vpx: 540, f: 1400, height: 1.6});
/** The kerb at the board's feet (the footpath's back edge) and its depth. */
export const KERB_Y = 1252;
export const KERB_Z = CAM.z(KERB_Y);
/** Height (px) of a standing 1.7 m adult whose feet are at screen y. */
export const adultH = (feetY: number) => 1.7 * CAM.pxPerM(feetY);

// ---------------------------------------------------------------- the float and the planes

/** S6's planes (lib/depth parallax planes): -1 the near bed, shrub and bench, 0 the deal board + footpath + Pip, +1 the
 *  fence and the lawn, +2 the lawn's cherries and the far promenade, +3 the facade band and its door; the sky never. */
export const S6_PLANE = {sky: PARALLAX_SKY, facade: 3, lawn: 2, fence: 1, subject: 0, near: -1} as const;

/** The float's legs (near-ground px from home, FILM s). */
export const S6_FLOAT_LEGS: FloatLeg[] = [
  {t0: 24.3, t1: 25.35, to: [6, -3]},
  {t0: 25.35, t1: 26.4, to: [0, 0]},
];
/** Home at these FILM times: the join in, the purpose line, F12 and the flick, F11, the push-through. */
export const S6_FLOAT_REST = [23.8, 24.03, 24.3, 26.4, 26.467, 26.5, 27.82, 27.95, 28.1];
/** floatProblems(...) must be [] (net <= 12 px, peak <= 10 px/s, home at the rests). */
export const s6FloatProblems = () => floatProblems(S6_FLOAT_LEGS, {rest: S6_FLOAT_REST});
/** The near-ground float at inner time t. */
export const s6Float = (t: number): [number, number] => floatAt(T0 + t, S6_FLOAT_LEGS) as [number, number];

/** One plane's group: translated by its share of the float (the same tree every frame: nothing remounts). */
export const S6Plane: React.FC<{plane: number; children?: React.ReactNode}> = ({plane, children}) => {
  const t = useTime();
  const [dx, dy] = parallaxOffset(s6Float(t), plane);
  return <g transform={`translate(${dx.toFixed(3)} ${dy.toFixed(3)})`}>{children}</g>;
};

// ---------------------------------------------------------------- shared spots

/** The deal board's contract rect on screen (map s6BoardAt; held). */
export const boardAt = (t: number): Rect => s6BoardAt(T0 + t);
export const inRect = (x: number, y: number, r: Rect) => x >= r.x0 && x <= r.x1 && y >= r.y0 && y <= r.y1;
/** Pip's seat (feet) on the paving in front of the board. */
export const PIP_SEAT = {x: S6.pipSeat0.x, y: S6.pipSeat0.y};
export const SUN = SUN2;
/** Never draw here (the caption band, with its flat margin): y 290-600. */
export const BAND = {y0: 290, y1: 600};
/** (Retired: the truck's drifts, all 0; kept until every part drops them.) */
export const DRIFT = {far: 0, lawn: 0, mid: 0, near: 0} as const;
export const dxOf = (_v: number, _t: number) => 0;
/** Nothing enters, pops or turns in these inner windows (film 23.60-24.00 and 27.90-28.30). */
export const QUIET: [number, number][] = [
  [-0.4, 0.0],
  [3.9, 4.3],
];
