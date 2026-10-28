// SQC_stick (HOME lane; docs/v3/flow_v2.md §4 SQC, §5, §6 J3): YOUR STICK. On "memory" (18.28) one memory stick lifts
// out of the listing laptop on your phone and comes toward the lens: from the listing's screen at SQA's launch size (the
// same stick that flew to the data center five times in the hook) to the screen centre (540, 870), w 700,
// rot -4 by 18.86, ONE outCubic move (no overshoot), so its chips are clear on "chips" (18.76); it holds there to
// 18.905, then the engine's push-through (J3) zooms into it x7 and SQD opens on the same stick lying on THEIR mountain.
// THE stick is SQD_peak's J3Stick (the kit MemoryStick + S8's close-up detail, seeds s8/stick, s8/stickD) at every
// frame of the move, so from 18.86 on it is J3Stick at (540, 870), w 700, rot -4 to the pixel (the REVEAL lane's
// request: J3 matches on both sides).
// Light (the nook rig, CRAFT §d.8): the stick is the subject, so it alone gets a rim: the lamp's warm light (its key,
// screen-left and below the stick: the lamp is in frame) 4-6 px inside its silhouette on the key-facing sides, growing
// with the stick. The rim's shape is THE stick's own outline (its key notch and side notches) moved in by the
// subject's 3 px line (final pass, as SQD_peak's J3StickRim, early review E7): on a plain rectangle the band ran
// straight across the left side notch, outside the silhouette, and painted over the outline on the lamp side. No
// contact or cast shadow: it touches nothing once it leaves the phone.
import React from 'react';
import {clamp, ease} from '../../../lib/time';
import {STICK_RATIO, type Pt} from '../kit';
import {Rim, polyD} from '../kit/Light';
import {J3Stick, stickParts} from './SQD_peak';
import {threadAt} from './thread_plane';

/** The lift (film seconds): from "memory" to just after "chips", then the hold J3 starts from. */
export const LIFT = {t0: 18.28, t1: 18.86, hold: 18.905};
/** THE stick's end pose (flow_v2 §6 J3: both sides of the push-through draw this). */
export const STICK_END = {x: 540, y: 870, w: 700, rot: -4};
/** Its start: SQA's launch (124 px, from 0.6 x: it comes out of the listing laptop's screen, ~140 px wide), tilted like
 *  a launch; the outCubic move takes it past 124 px within the first frame. */
const W0 = 74;
const ROT0 = -12;

export type StickPose = {x: number; y: number; w: number; rot: number};

/** Where the stick is at film time T (null before the lift). */
export function liftPose(T: number): StickPose | null {
  if (T < LIFT.t0) return null;
  if (T >= LIFT.t1) return STICK_END;
  const a: Pt = threadAt(LIFT.t0).listingScreen;
  const k = ease.outCubic(clamp((T - LIFT.t0) / (LIFT.t1 - LIFT.t0)));
  return {
    x: a[0] + (STICK_END.x - a[0]) * k,
    y: a[1] + (STICK_END.y - a[1]) * k,
    w: W0 + (STICK_END.w - W0) * k,
    rot: ROT0 + (STICK_END.rot - ROT0) * k,
  };
}

/** The subject's outline on the stick (screen px: the kit MemoryStick under the clean pen draws it 3 px, inside its
 *  fill, from ~100 px up). */
const LINE = 3;

/** A closed polygon (clockwise on screen) moved `d` px inward: each edge along its inward normal, each vertex where its
 *  two offset edges meet (SQD_peak's own helper for J3StickRim; the stick's outline has no edge shorter than ~4 % of its
 *  width, so a few px keep it a simple polygon). */
function insetPoly(pts: Pt[], d: number): Pt[] {
  const n = pts.length;
  const edge = (i: number) => {
    const a = pts[i];
    const b = pts[(i + 1) % n];
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const l = Math.hypot(dx, dy) || 1;
    return {p: [a[0] - (dy / l) * d, a[1] + (dx / l) * d] as Pt, v: [dx, dy] as Pt};
  };
  return pts.map((_, i) => {
    const A = edge((i - 1 + n) % n);
    const B = edge(i);
    const den = A.v[0] * B.v[1] - A.v[1] * B.v[0];
    if (Math.abs(den) < 1e-9) return B.p;
    const t = ((B.p[0] - A.p[0]) * B.v[1] - (B.p[1] - A.p[1]) * B.v[0]) / den;
    return [A.p[0] + A.v[0] * t, A.p[1] + A.v[1] * t] as Pt;
  });
}

/** THE stick's silhouette (its notches included) just inside its outline, at a pose (screen px): the rim's shape. */
function rimShapeD(p: StickPose): string {
  const a = (p.rot * Math.PI) / 180;
  const ca = Math.cos(a);
  const sa = Math.sin(a);
  return polyD(insetPoly(stickParts(p.w).outline, LINE).map(([lx, ly]): Pt => [p.x + lx * ca - ly * sa, p.y + lx * sa + ly * ca]));
}

/** THE stick at film time T (screen space, after the thread plane; inside the nook rig's <Lit>). */
export const LiftStick: React.FC<{T: number}> = ({T}) => {
  const p = liftPose(T);
  if (!p) return null;
  const rimW = 5 * Math.min(1, p.w / 520);
  return (
    <>
      <J3Stick x={p.x} y={p.y} w={p.w} rot={p.rot} />
      {rimW >= 1 ? <Rim d={rimShapeD(p)} c={[p.x, p.y]} size={[p.w - 2 * LINE, p.w * STICK_RATIO - 2 * LINE]} width={rimW} /> : null}
    </>
  );
};
