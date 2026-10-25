// S10 Pip (scale 1.2 on the OldQuarter bollard): leaps off the tram's tail onto the bollard, perks at the half sun,
// looks up at siteM's plaque, glances at the far plates flipping and at the cart, GAG trunk-up 'hey!' AT the skipped
// plaque (mirrored so the trunk points up-left at it, plus an ink 'hey' spark between them), then hops out past the right
// edge one frame before the cut (into S11). Never a fade: pose switches pop (ElephantTimeline), entrances are the leap.

import React from 'react';
import {Elephant, ElephantTimeline, hop} from '../../lib/mascot';
import type {PoseKey} from '../../lib/mascot';
import {useTime, prog, ease as E} from '../../lib/time';
import {Ink} from '../../lib/Ink';
import type {Pt} from '../../lib/sketch';

export const PIP = {scale: 1.2, seed: 10, perch: [700, 1450] as [number, number], exitTo: [1185, 1360] as [number, number]};

export type PipTimes = {
  /** Take-off from the tram's tail (first frame: the crouch on the roof, where S09's Wiper last drew him). */
  leap: number;
  /** Where the leap starts: S09's Pip on the tram roof at `leap` (screen = world at the camera's rest). */
  leapFrom: [number, number];
  /** His scale on the tram roof (S09's 0.75): he grows to 1.2 over the leap (he comes toward us). */
  leapScale?: number;
  /** His screen velocity on the roof at the hand-off (px/s, S09's tramPipAt backward difference): the leap keeps it. */
  leapV?: number;
  perk: number;
  lookPlaque: number;
  /** Optional: glances up at the far row's plates flipping, then back down at the web. */
  lookFar?: number;
  lookWeb?: number;
  /** Optional: turns to the cart stepping out from behind the A-frame on the left. */
  lookCart?: number;
  lookLob?: number;
  hey: number;
  /** The 'hey' spark retracts by here (default heyEnd): before the cart rolls behind him. */
  sparkEnd?: number;
  /** He turns side-on (facing right, the hop's pose) = the crouch of the hop out: set to out - 0.12. */
  heyEnd: number;
  /** Take-off toward the right edge. */
  out: number;
};

/** The crouch on the roof (2 frames), then the drop to the bollard. */
const CROUCH = 0.05;
const ARC = 0.66;
export const LEAP_DUR = CROUCH + ARC;
const OUT_DUR = 0.3;
/** The take-off (fix round 2b): a DOWNWARD push off the roof (+700 px/s, no upward kick, so he never hangs in the sky
 *  at the frame edge after the tram has gone), then constant gravity g = 2 (dy - VY0 ARC) / ARC^2 (~1,770 px/s^2): he
 *  lands at ~62 px / frame (was 75-93 with the kick and g ~4,950), consecutive silhouettes overlapping. x keeps S09's
 *  roof velocity through the crouch (decaying over TAU_V: he never steps back left), and the push-off gives him a
 *  constant leftward speed (ballistic: x linear in the air), so he leaves the edge at once. */
const VY0 = 700;
const TAU_V = 0.08;

/** Where his trunk tip is in the mirrored trunk-up pose (world): the 'hey' spark radiates from here at the plaque. */
const HEY_TIP: Pt = [662, 1306];
/** Spark directions (deg), toward siteM's plaque (its centre is at -113 deg from the tip), and the stroke span along
 *  them (fix round 2b: 40-72 px from the tip, was 24-52: the spark sits ~30 px higher, on the clear wall between the
 *  plaque's bottom (1224) and the cart's card (top 1285), clear of both). */
const HEY_ANGLES = [-134, -112, -90];
const HEY_R: [number, number] = [40, 72];

/** The 'hey' spark: three short ink emanata from the trunk tip toward siteM's plaque (up-left), drawn on in a stagger and
 *  retracted from their inner ends before Pip settles (no fade). */
const HeySpark: React.FC<{at: number; end: number}> = ({at, end}) => {
  const t = useTime();
  if (t < at || t >= end) return null;
  let d = '';
  HEY_ANGLES.forEach((deg, i) => {
    const a = (deg * Math.PI) / 180;
    const grow = E.outCubic(prog(t, at + i * 0.03, 0.08));
    const shrink = E.inCubic(prog(t, end - 0.12 + i * 0.02, 0.08));
    const r0 = HEY_R[0] + (HEY_R[1] - HEY_R[0]) * shrink;
    const r1 = HEY_R[0] + (HEY_R[1] - HEY_R[0]) * grow;
    if (r1 - r0 < 1) return;
    d += `M${(HEY_TIP[0] + Math.cos(a) * r0).toFixed(1)} ${(HEY_TIP[1] + Math.sin(a) * r0).toFixed(1)}L${(HEY_TIP[0] + Math.cos(a) * r1).toFixed(1)} ${(HEY_TIP[1] + Math.sin(a) * r1).toFixed(1)}`;
  });
  return d ? <Ink d={d} width={4} taper={false} vary={0} seed="s10/hey" /> : null;
};

export const Pip: React.FC<{T: PipTimes}> = ({T}) => {
  const t = useTime();
  const [px, py] = PIP.perch;
  if (t < T.leap) return null;
  const s0 = T.leapScale ?? PIP.scale;
  // 1) the take-off from the tram's tail roof: x continues S09's roof velocity (decaying) and eases onto the perch; the
  //    first two frames are the crouch (on the roof, squashed), then a small kick up and a constant-gravity fall
  const tau = t - T.leap;
  if (tau < CROUCH + ARC) {
    const [x0, y0] = T.leapFrom;
    const vx0 = T.leapV ?? 0;
    const k = Math.max(0, (tau - CROUCH) / ARC);
    const x = x0 + vx0 * tau * Math.exp(-tau / TAU_V) + (px - x0) * k;
    if (tau < CROUCH) {
      return <Elephant x={x} y={y0} scale={s0} pose="stand-side" flip amount={0.15} squash={0.24} rotate={4} t={t} seed={PIP.seed} />;
    }
    const u = tau - CROUCH;
    const g = (2 * (py - y0 - VY0 * ARC)) / (ARC * ARC);
    const y = y0 + VY0 * u + 0.5 * g * u * u;
    const sc = s0 + (PIP.scale - s0) * E.inOutSine(k);
    const stretch = k < 0.25 ? -0.2 * (1 - k / 0.25) - 0.04 : -0.04 - 0.08 * Math.max(0, (k - 0.7) / 0.3);
    const spread = Math.sqrt(Math.sin(Math.PI * Math.min(1, k * 1.15)));
    return <Elephant x={x} y={y} scale={sc} pose="stand-side" flip amount={spread} squash={stretch} rotate={8 * (1 - k) - 16 * k} t={t} seed={PIP.seed} />;
  }
  // 3) the hop out past the right edge
  if (t >= T.out) {
    const h = hop({t, t0: T.out, dur: OUT_DUR, from: {x: px, y: py}, to: {x: PIP.exitTo[0], y: PIP.exitTo[1]}, height: 64});
    return <Elephant x={h.x} y={h.y} scale={PIP.scale} pose="stand-side" amount={h.spread} squash={h.squash} rotate={h.rotate} t={t} seed={PIP.seed} />;
  }
  // 2) perched: the landing squash, then pose / look keys (each switch pops), the crouch before the hop out. Idle life
  //    is kept low so each look / pose pop reads as its own beat (not one long fidget)
  const t1 = T.leap + CROUCH;
  const dl = t - (t1 + ARC);
  const land = dl < 0.32 ? 0.24 * Math.exp(-dl * 11) * Math.cos(dl * Math.PI * 2 * 3.2) : 0;
  const crouch = hop({t, t0: T.out, dur: OUT_DUR, from: {x: px, y: py}, to: {x: PIP.exitTo[0], y: PIP.exitTo[1]}, height: 64});
  const keys: PoseKey[] = [
    {t: t1 + ARC, pose: 'sit-back', look: 0.25},
    {t: T.perk, pose: 'sit-back', look: -0.45},
    {t: T.lookPlaque, pose: 'sit-back', look: -0.8},
    ...(T.lookFar !== undefined ? [{t: T.lookFar, pose: 'sit-back' as const, look: -0.15}] : []),
    ...(T.lookWeb !== undefined ? [{t: T.lookWeb, pose: 'sit-back' as const, look: -0.9}] : []),
    ...(T.lookCart !== undefined ? [{t: T.lookCart, pose: 'sit-back' as const, look: -1}] : []),
    ...(T.lookLob !== undefined ? [{t: T.lookLob, pose: 'sit-back' as const, look: 0.45}] : []),
    // GAG: mirrored so the raised trunk points up-left AT siteM's plaque; look +1 before the mirror = head, eyes and
    // cheeks shifted toward it (fix round 2b: was 0.6, the pupils read as centred on the camera)
    {t: T.hey, pose: 'trunk-up', expression: 'wide', look: 1},
    // straight from the 'hey' into the hop's own pose (side-on, facing right): its crouch frames come right before the
    // take-off, so the exit has exactly ONE pose pop (fix round 2: no 3-frame back-view flicker)
    {t: T.heyEnd, pose: 'stand-side', look: 0.3},
  ];
  const heyOn = t >= T.hey && t < T.heyEnd;
  return (
    <>
      {/* during the 'hey' he leans toward the plaque (about his feet, 13 deg: the head tilts up-left at it) */}
      <ElephantTimeline x={px} y={py} scale={PIP.scale} t={t} seed={PIP.seed} keys={keys} flip={heyOn} rotate={heyOn ? -13 : 0} squash={land + crouch.squash} idle={0.25} />
      <HeySpark at={T.hey + 0.04} end={T.sparkEnd ?? T.heyEnd} />
    </>
  );
};
