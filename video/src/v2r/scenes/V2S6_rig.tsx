// V2S6_rig.tsx (lane L5): the numbers every V2S6 part shares. Scene time t = film - 24.00 (0 .. 4.06 s, 244 frames).
// The set is the dc kit's gate (src/v2r/kit/dc/gate.tsx `GateSet`) on its lateral truck LEFT: every plane drifts RIGHT
// linearly (far 10, lawn 15, mid 24.63 = the deal board's contract drift, near 65 px/s). Extra layers that live between
// two kit planes drift at an interpolated speed (`driftAtY`: a point's screen speed grows with its depth below the eye
// line), so the parallax stays one camera.
import {GATE, GATE_DRIFT, gateDx, GATE_DUR} from '../kit/dc/gate';
import {S6, SUN2, s6BoardAt, type Rect} from '../world/map';

export const T0 = 24.0;
export const DUR = GATE_DUR; // 4.06
/** HEARD word onsets, scene seconds (film - 24.00). */
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

/** Plane drifts (px/s, rightward) = the kit's. */
export const DRIFT = GATE_DRIFT;
export const dxOf = (v: number, t: number) => gateDx(v, t);
/** The eye line of the set (eye level: a standing adult's head sits about here at any distance). */
export const EYE_Y = 760;
/** A ground point's drift speed by its screen y (linear through the kit's far 10 @ 835 and mid 24.63 @ 1252). */
export const driftAtY = (y: number) => DRIFT.far + ((y - 835) * (DRIFT.mid - DRIFT.far)) / (1252 - 835);
/** Height (px) of a standing 1.7 m adult whose feet are at screen y (eye level, ~1.64 m eye height). */
export const adultH = (feetY: number) => 1.04 * (feetY - EYE_Y);

/** The deal board's contract rect on screen at scene t (map s6BoardAt). */
export const boardAt = (t: number): Rect => s6BoardAt(T0 + t);
/** Life never crosses the board's lettering: its rect + a margin (screen px at scene t). */
export const boardKeepOut = (t: number, m = 18): Rect => {
  const b = boardAt(t);
  return {x0: b.x0 - m, y0: b.y0 - m, x1: b.x1 + m, y1: b.y1 + 4};
};
export const inRect = (x: number, y: number, r: Rect) => x >= r.x0 && x <= r.x1 && y >= r.y0 && y <= r.y1;

/** The service door on screen (far plane) and its centre. */
export const doorAt = (t: number): Rect => {
  const dx = dxOf(DRIFT.far, t);
  return {x0: GATE.door.x0 + dx, y0: GATE.door.y0, x1: GATE.door.x1 + dx, y1: GATE.door.y1};
};

/** Pip's seat in MID-plane coordinates (= the contract's 24.00 screen spot) and its screen spot at t. */
export const PIP_SEAT = {x: S6.pipSeat0.x, y: S6.pipSeat0.y};
export const pipSeatScreen = (t: number) => ({x: PIP_SEAT.x + dxOf(DRIFT.mid, t), y: PIP_SEAT.y});

export const SUN = SUN2;
/** Never draw here (the caption band, with its flat margin): y 290-600. */
export const BAND = {y0: 290, y1: 600};
