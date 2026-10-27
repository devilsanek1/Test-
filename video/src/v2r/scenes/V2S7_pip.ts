// V2S7_pip.ts (lane L5): the maths V2S6 and V2S7 share, so both sides of the SUN2 match-cut (28.06) agree.
//   1. S7's camera: the ONE 4 % story push about B's centre (map S7.camera.push, 28.40-30.04, ease in-out) and a
//      gentle 2D float (translation only, STYLE.md section 6: legs turning back within +-12 px of home, ~5-12 px/s)
//      that passes through zero at the pose time 30.04 (B exact). The sun (SUN2) is screen-fixed.
//   2. Pip's hop across the cut: it leaves S6's corner post at 27.95 up-left, reaches the top of its arc ON the cut
//      (feet y <= 720 for all of S6: >= 200 px from the deal board's clause), and in S7 drops onto the board bollard
//      (vertical speed 0 at the cut, like a ball at its apex), landing at S7_PIP_LAND. One screen-space path.
// FILM seconds everywhere (scene-local = film - S6_T0 / S7_T0).
import {B, BOARD_BOLLARD, S6, S7, zoomAt, type XY} from '../world/map';

export const S6_T0 = 24.0;
export const S7_T0 = 28.06;

/** The float: dx = AX sin(WX (T - 30.04)), dy = AY sin(WY (T - 30.04)). Zero at 30.04; |dx| <= 12, |dy| <= 5 (home
 *  +-12 px); speed ~12 px/s at 30.04, never 0 (the two legs turn at different times). Over 28.06-33.16: dx -11.9 ->
 *  +12 (31.89) -> +5.6, dy -2.7 -> -5 (28.83) -> +5 (31.25) -> -4. */
export const S7_FLOAT = {ax: 12, wx: 0.85, ay: 5, wy: 1.3} as const;
export const S7_POSE_T = 30.04;

/** S7 camera at film time T: zoom z about B's centre, then the float (dx, dy). World coords = the 30.04 pose. */
export function s7CamAt(T: number): {z: number; ax: number; ay: number; dx: number; dy: number} {
  const k = S7.camera.push;
  const u = T - S7_POSE_T;
  return {z: zoomAt(k, T), ax: k.anchor.x, ay: k.anchor.y, dx: S7_FLOAT.ax * Math.sin(S7_FLOAT.wx * u), dy: S7_FLOAT.ay * Math.sin(S7_FLOAT.wy * u)};
}

/** A world point (S7's 30.04 pose) on screen at film time T. */
export function s7Screen(p: XY, T: number): XY {
  const c = s7CamAt(T);
  return {x: c.ax + (p.x - c.ax) * c.z + c.dx, y: c.ay + (p.y - c.ay) * c.z + c.dy};
}

/** Pip's size (seat to head top, px): S6 on the post; S7 in WORLD px at the bollard (x the camera zoom on screen). */
export const PIP_SIZE_S6 = 96;
export const PIP_SIZE_S7 = 100;

/** The hop across the cut (screen px, film s). */
export const PIP_HOP = {
  t0: 27.95,
  tCut: S7_T0,
  t1: 28.22,
  /** S6's post cap at take-off (the mid plane's drift: S6.pipSeat0 + 3.95 s x 24.63 px/s). */
  from: {x: S6.pipSeat0.x + (27.95 - S6_T0) * S6.boardDriftPxS, y: S6.pipSeat0.y} as XY,
  /** The arc's top, ON the cut: right of S7's board frame (x <= 642 at 28.06), above the canopy letters (y >= 768). */
  apex: {x: 732, y: 702} as XY,
  /** Rise of the S6 half above the straight line (px). */
  rise: 16,
};
/** Where S7's Pip lands: the board bollard on screen at the landing time. */
export const S7_PIP_LAND: XY = s7Screen(BOARD_BOLLARD, PIP_HOP.t1);

const herm = (p0: number, p1: number, v0: number, v1: number, u: number) => {
  const u2 = u * u;
  const u3 = u2 * u;
  return (2 * u3 - 3 * u2 + 1) * p0 + (u3 - 2 * u2 + u) * v0 + (-2 * u3 + 3 * u2) * p1 + (u3 - u2) * v1;
};

/** Pip's feet on screen during the hop, or null outside [t0, t1]. `k` 0..1 over the whole hop, `side` the scene
 *  that draws it (S6 before the cut, S7 from it). */
export function pipHopAt(T: number): {x: number; y: number; k: number; side: 'V2S6' | 'V2S7'} | null {
  const h = PIP_HOP;
  if (T < h.t0 || T > h.t1) return null;
  const A = h.from;
  const M = h.apex;
  const L = S7_PIP_LAND;
  const d1 = h.tCut - h.t0;
  const d2 = h.t1 - h.tCut;
  // one horizontal velocity at the cut (continuous across it): the S7 half's straight drop speed
  const vx = (L.x - M.x) / d2;
  if (T < h.tCut) {
    const u = (T - h.t0) / d1;
    const x = herm(A.x, M.x, (M.x - A.x) * 1.6, vx * d1, u);
    // a little rise, then the apex ON the cut (vertical speed 0 there)
    const y = A.y + (M.y - A.y) * (1 - (1 - u) * (1 - u)) - h.rise * Math.sin(Math.PI * u) * (1 - u);
    return {x, y, k: (T - h.t0) / (h.t1 - h.t0), side: 'V2S6'};
  }
  const u = (T - h.tCut) / d2;
  // the drop: x keeps its speed, y falls from rest (gravity)
  return {x: M.x + vx * d2 * u, y: M.y + (L.y - M.y) * u * u, k: (T - h.t0) / (h.t1 - h.t0), side: 'V2S7'};
}

/** B's frame on screen at film time T (the GoogleBoard's face is B at the pose). */
export const s7BoardFaceAt = (T: number) => {
  const a = s7Screen({x: B.x0, y: B.y0}, T);
  const b = s7Screen({x: B.x1, y: B.y1}, T);
  return {x0: a.x, y0: a.y, x1: b.x, y1: b.y};
};
