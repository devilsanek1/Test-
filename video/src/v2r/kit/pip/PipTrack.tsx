// PipTrack.tsx — Pip on a timeline: one component a lane drops into its shot with a list of keys (scene seconds).
// Poses blend (0.16 s default), facings and head turns ease, hops arc from seat to seat (crouch, take-off stretch,
// parabola, landing squash, the ears flopping after), the head can follow a target, a boat roof can carry it, one ear
// can flick, and it can draw itself on or un-build. Idle life never stops.
//
//   <PipTrack x={700} y={1235} size={96} keys={[
//     {t: 0, facing: 'back', target: herAt},             // the watcher; its head follows her (a point or a function)
//     {t: 4.98, pose: 'earsCover', dur: 0.1},            // S1 "life"
//     {t: 5.5, pose: 'sit', dur: 0.25},
//     {t: 5.9, hop: {to: [540, 760], height: 90}},        // take-off at 5.90 (it crouches 0.12 s before)
//   ]} />
//   keys={[{t: 26.5, flick: 'A'}]}                         // S6 "veto": one ear flick, no droop
//   keys={[{t: 0, ride: {amp: 1.6}}]}  + move x / y with the boat (the track adds the bob and roll)

import React from 'react';
import {Seed} from '../../../lib/rng';
import {useTime} from '../../../lib/time';
import {useExit, useLook} from '../../../lib/exit';
import {useInkScale} from '../../../lib/inkComp';
import {clamp, lerp, smooth, V2} from './geom';
import {blendParams, PoseParams} from './model';
import {applyIdle, flickShape, IdleOpts} from './idle';
import {FACING, FacingName, PoseName, poseParams, POSES} from './poses';
import {aimAt, drawOn, hopAt, HopState, rideAt, unBuild} from './motion';
import {defaultInk, PipDrawing, PipPaint} from './Pip';

export type PipHop = {
  /** Landing seat (feet anchor, screen px). Off-frame is fine (a leap out of the shot). */
  to: V2;
  /** Airtime (s). Default 0.4 (tuck) / 0.6 (leap). */
  dur?: number;
  /** Apex above the straight line (px). Default 0.35 x the distance, >= 40. */
  height?: number;
  style?: 'tuck' | 'leap';
  crouch?: number;
  land?: number;
  /** Turn side-on to the travel direction while airborne (default true). */
  turn?: boolean;
};

export type PipKey = {
  /** Scene seconds. For a hop: the take-off (the crouch starts ~0.12 s before). */
  t: number;
  /** Blend to this pose (facing and head keep their own channels). */
  pose?: PoseName | Partial<PoseParams>;
  /** Blend time for this key's changes (s). Default 0.16 (pose), 0.3 (facing / look). */
  dur?: number;
  facing?: FacingName | number;
  look?: number;
  lookUp?: number;
  /** Follow a screen point (or a function of scene seconds) from now on; null stops following. */
  target?: V2 | ((t: number) => V2) | null;
  hop?: PipHop;
  /** One ear's fold-and-flick at t ('A' = Pip's model +x ear, 'B' = the other). */
  flick?: 'A' | 'B';
  /** Ride a boat roof from now on (bob + roll); null stops. */
  ride?: {amp?: number; rate?: number; phase?: number} | null;
  /** Draw on from t (dur s, default 0.9). */
  draw?: number;
  /** Un-build from t (dur s, default 0.5). */
  unbuild?: number;
  /** Wind for the scarf from now on (-1 .. 1, eased over dur). */
  wind?: number;
};

export type PipTrackProps = {
  x: number;
  y: number;
  size?: number;
  keys: PipKey[];
  /** The starting pose / facing (before the first key). */
  pose?: PoseName | Partial<PoseParams>;
  facing?: FacingName | number;
  /** Raw overrides on every pose. */
  params?: Partial<PoseParams>;
  seed?: Seed;
  idle?: number | IdleOpts;
  t?: number;
  paint?: PipPaint;
  inkPx?: number;
  /** Extra exit (default: the engine's useExit()). */
  exit?: number;
};

export type PipTrackState = {x: number; y: number; params: PoseParams; squash: number; rotate: number; draw: number; exit: number; hop: HopState | null};

/** The track's state at time t (pure; also handy for a scene that needs to know where Pip is, e.g. a wiper). */
export function trackAt(p: PipTrackProps, t: number): PipTrackState {
  const keys = [...p.keys].sort((a, b) => a.t - b.t);
  const base = poseParams(p.pose ?? 'sit', p.params ?? {});
  if (p.facing !== undefined) base.yaw = typeof p.facing === 'number' ? p.facing : FACING[p.facing];
  // ---- the blended parameter channel
  let from: PoseParams = base;
  let target: PoseParams = base;
  let tStart = -1e9;
  let dur = 0.16;
  let tgt: PipKey['target'] = null;
  let tgtSince = -1e9;
  let ride: PipKey['ride'] = null;
  let drawT: number | null = null;
  let drawDur = 0.9;
  let unT: number | null = null;
  let unDur = 0.5;
  const flicks: [number, 'A' | 'B'][] = [];
  for (const k of keys) {
    if (k.t > t) {
      // a hop's crouch starts before its key: handled below; everything else waits
      continue;
    }
    const ease = (u: number) => smooth(u);
    from = blendParams(from, target, ease(clamp((k.t - tStart) / dur)));
    const next: PoseParams = {...target};
    let changed = false;
    if (k.pose !== undefined) {
      const pp = poseParams(k.pose, p.params ?? {});
      for (const key of Object.keys(pp) as (keyof PoseParams)[]) {
        if (key === 'yaw' && typeof k.pose === 'string' && POSES[k.pose].yaw === undefined) continue;
        if ((key === 'look' || key === 'lookUp') && !(typeof k.pose === 'object' && key in k.pose) && !(typeof k.pose === 'string' && key in POSES[k.pose])) continue;
        if (key === 'wind') continue;
        next[key] = pp[key];
      }
      changed = true;
    }
    if (k.facing !== undefined) {
      next.yaw = typeof k.facing === 'number' ? k.facing : FACING[k.facing];
      changed = true;
    }
    if (k.look !== undefined) {
      next.look = k.look;
      changed = true;
    }
    if (k.lookUp !== undefined) {
      next.lookUp = k.lookUp;
      changed = true;
    }
    if (k.wind !== undefined) {
      next.wind = k.wind;
      changed = true;
    }
    if (changed) {
      target = next;
      tStart = k.t;
      dur = k.dur ?? (k.pose !== undefined ? 0.16 : 0.3);
    }
    if (k.target !== undefined) {
      tgt = k.target;
      tgtSince = k.t;
    }
    if (k.ride !== undefined) ride = k.ride;
    if (k.flick) flicks.push([k.t, k.flick]);
    if (k.draw !== undefined) {
      drawT = k.t;
      drawDur = k.draw || 0.9;
    }
    if (k.unbuild !== undefined) {
      unT = k.t;
      unDur = k.unbuild || 0.5;
    }
  }
  let params = blendParams(from, target, smooth(clamp((t - tStart) / dur)));
  // ---- hops: seat to seat
  let x = p.x;
  let y = p.y;
  let hop: HopState | null = null;
  let squash = 0;
  let rotate = 0;
  for (const k of keys) {
    if (!k.hop) continue;
    const h = k.hop;
    const span = Math.hypot(h.to[0] - x, h.to[1] - y);
    const style = h.style ?? (span > 260 ? 'leap' : 'tuck');
    const spec = {t0: k.t, dur: h.dur ?? (style === 'leap' ? 0.6 : 0.4), from: [x, y] as V2, to: h.to, height: h.height ?? Math.max(40, span * 0.35), style, crouch: h.crouch, land: h.land};
    const cr = spec.crouch ?? 0.12;
    if (t < spec.t0 - cr) break;
    const st = hopAt(t, spec);
    if (st.phase === 'after' && t > spec.t0 + spec.dur + 1) {
      x = h.to[0];
      y = h.to[1];
      continue;
    }
    hop = st;
    x = st.x;
    y = st.y;
    squash = st.squash;
    rotate = st.rotate;
    // the airborne pose, the crouch / landing squash, side-on in the air, the ears' follow-through
    if (st.crouch > 0) params = blendParams(params, {...poseParams(st.phase === 'land' ? 'land' : 'crouch', p.params ?? {}), yaw: params.yaw, look: params.look, wind: params.wind}, st.crouch * 0.8);
    if (st.air > 0) {
      const turn = h.turn !== false;
      const side = st.dir < 0 ? FACING.left : FACING.right;
      params = blendParams(params, {...poseParams(st.airborne, p.params ?? {}), yaw: turn ? side : params.yaw, look: 0, wind: -st.dir}, st.air);
    }
    params = {...params, earDroopA: params.earDroopA + st.earKick, earDroopB: params.earDroopB + st.earKick * 0.85};
    if (st.phase !== 'after') break;
    // landed: keep the final seat for the next hop
    x = h.to[0];
    y = h.to[1];
  }
  // ---- head follows a target (eased in over 0.25 s)
  if (tgt) {
    const pt = typeof tgt === 'function' ? tgt(t) : tgt;
    const size = p.size ?? 96;
    const a = aimAt([x, y - size * 0.74], pt);
    const wgt = smooth(clamp((t - tgtSince) / 0.25)) * (hop ? 1 - hop.air : 1);
    params = {...params, look: lerp(params.look, a.look, wgt), lookUp: lerp(params.lookUp, Math.max(params.lookUp, a.lookUp), wgt)};
  }
  // ---- a boat roof
  if (ride) {
    const r = rideAt(t, ride.amp, ride.rate, ride.phase);
    y += r.dy;
    rotate += r.rotate;
    params = {...params, scarfLift: Math.max(params.scarfLift, 0.85)};
  }
  // ---- one ear flick
  for (const [tf, side] of flicks) {
    const k = flickShape(t - tf);
    if (!k) continue;
    if (side === 'A') params = {...params, earDroopA: params.earDroopA - 30 * k, earSwingA: params.earSwingA + 14 * k, earFoldA: params.earFoldA + 0.35 * Math.max(0, k)};
    else params = {...params, earDroopB: params.earDroopB - 30 * k, earSwingB: params.earSwingB + 14 * k, earFoldB: params.earFoldB + 0.35 * Math.max(0, k)};
  }
  // ---- idle
  const idle = p.idle ?? 1;
  const idleOpts: IdleOpts = typeof idle === 'number' ? {amount: idle} : idle;
  params = applyIdle(params, t, p.seed ?? 'pip', {...idleOpts, breeze: ride ? 1.8 : idleOpts.breeze});
  const draw = drawT === null ? 1 : drawOn(t, drawT, drawDur);
  const exit = unT === null ? 0 : unBuild(t, unT, unDur);
  return {x, y, params, squash, rotate, draw, exit, hop};
}

export const PipTrack: React.FC<PipTrackProps> = (p) => {
  const tNow = useTime();
  const ctxExit = useExit();
  const look = useLook();
  const inkScale = useInkScale();
  const t = p.t ?? tNow;
  const st = trackAt(p, t);
  const size = p.size ?? 96;
  let paint: 'colour' | 'paper' | 'none' = 'colour';
  if (p.paint === 'paper') paint = 'paper';
  else if (p.paint === 'look') {
    if (look.fills === 'paper') paint = 'paper';
    else if (look.fills === 'none') paint = 'none';
    else if (look.cascade && t < look.cascade.at + Math.hypot(st.x - look.cascade.origin[0], st.y - look.cascade.origin[1]) / (look.cascade.speed ?? 2600)) paint = 'paper';
  }
  return (
    <PipDrawing
      x={st.x}
      y={st.y}
      size={size}
      params={st.params}
      squash={st.squash}
      rotate={st.rotate}
      draw={st.draw}
      exit={Math.max(st.exit, p.exit ?? ctxExit)}
      paint={paint}
      inkPx={(p.inkPx ?? defaultInk(size)) * inkScale}
      seed={p.seed ?? 'pip'}
      drawInk={look.ink}
    />
  );
};
