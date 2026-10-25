// S10 Pip (scale 1.2 on the OldQuarter bollard): leaps off the tram's tail onto the bollard, perks at the half sun,
// looks up at siteM's plaque, glances at the far plates flipping and at the cart, GAG trunk-up 'hey!' AT the skipped
// plaque (mirrored so the trunk points up-left at it, plus an ink 'hey' spark between them), then hops out past the right
// edge one frame before the cut (into S11). Never a fade: pose switches pop (ElephantTimeline), entrances are the leap.

import React from 'react';
import {Elephant, ElephantTimeline, hop, popSwitch} from '../../lib/mascot';
import type {PoseKey} from '../../lib/mascot';
import {useTime, prog, ease as E, springAt, springs} from '../../lib/time';
import {palette} from '../../lib/theme';
import {Ink} from '../../lib/Ink';
import {Fill} from '../../lib/Fill';
import {mat, XG} from '../../lib/xf';
import {polyPath, speedLines} from '../../lib/sketch';
import {captionFontStack} from '../../lib/font';
import type {Mat} from '../../lib/xf';
import type {Pt} from '../../lib/sketch';

/** The trunk tip in the 'hey!' pose (world; measured on the render, see HEY_TIP). */
const HEY_TIP_X = 651;
const HEY_TIP_Y = 1312;

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
  /** Optional: turns to the cart stepping out from behind the A-frame on the left (side-on, facing left) and HOLDS that
   *  silhouette until the 'hey!' (A1 FR2: the pop back to the back view on the lob, 0.23 s later, read as a flicker). */
  lookCart?: number;
  /** Optional: the lob sails over siteM's plate: he tips back (+6 deg, looking up after it) inside the side-on pose. */
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
/** One frame (fix round 3: was 2): the push-off starts at once. */
const CROUCH = 1 / 30;
const ARC = 0.66;
export const LEAP_DUR = CROUCH + ARC;
const OUT_DUR = 0.3;
/** The take-off (fix round 2b): a DOWNWARD push off the roof (+700 px/s, no upward kick, so he never hangs in the sky
 *  at the frame edge after the tram has gone), then constant gravity g = 2 (dy - VY0 ARC) / ARC^2 (~1,770 px/s^2): he
 *  lands at ~62 px / frame (was 75-93 with the kick and g ~4,950), consecutive silhouettes overlapping. */
const VY0 = 700;
/** Fix round 3: the tram's inherited velocity decays in ONE frame (was 0.08 s), and x runs linearly toward the perch
 *  from the first frame of the crouch (~-490 px/s): he leaves the right edge at once instead of drifting right first. */
const TAU_V = 1 / 30;

/** The leap's velocity (px / s) at tau s after take-off (the derivative of the x / y laws in the leap branch). */
function leapV(tau: number, T: PipTimes): [number, number] {
  const [x0, y0] = T.leapFrom;
  const [px, py] = PIP.perch;
  const vx0 = T.leapV ?? 0;
  const vx = vx0 * Math.exp(-tau / TAU_V) + (px - x0 - vx0 * TAU_V) / (CROUCH + ARC);
  const u = Math.max(0, tau - CROUCH);
  const g = (2 * (py - y0 - VY0 * ARC)) / (ARC * ARC);
  return [vx, tau < CROUCH ? 0 : VY0 + g * u];
}

/** A1 FR1: speed lines behind a fast Pip (the film's smear language: S12's PipFallSmear / S11's PipHopSmear / S03 FR3,
 *  copied here, never imported across scenes). WORLD px: (x, y) = his feet, (vx, vy) = px / s, `sc` = his scale (1 = the
 *  ~92 px stand-side body). 3 short ink lines anchored behind his body centre along -velocity, their length growing with
 *  his speed (|v| / 30 x 0.8: ~28 px at 35 px / frame, ~50 at 63); drawn only above SMEAR_MIN; `k` (0..1) retracts them
 *  (the 1-2 frames after touch-down). */
const SMEAR_MIN = 25 * 30;
const PipSmear: React.FC<{x: number; y: number; vx: number; vy: number; sc: number; k?: number; seed: string}> = ({x, y, vx, vy, sc, k = 1, seed}) => {
  const sp = Math.hypot(vx, vy);
  if (sp < SMEAR_MIN || k <= 0.05) return null;
  const ux = -vx / sp;
  const uy = -vy / sp;
  const cx = x + ux * 50 * sc;
  const cy = y - 46 * sc + uy * 50 * sc;
  const len = Math.max(22, Math.min(56, (sp / 30) * 0.8)) * k;
  const ang = (Math.atan2(uy, ux) * 180) / Math.PI;
  return <Ink d={speedLines(cx, cy, {n: 3, len, gap: 15 * sc, angle: ang, seed: `${seed}/l`})} width={2.6} taper={false} seed={`${seed}/i`} />;
};

/** Rotation keys about his feet (deg, - = the top leans left / up-left), each switch eased in 0.12 s (outBack): the
 *  look beats read by SILHOUETTE from behind, not only by the head's look offset. */
function rotAt(t: number, keys: [number, number][]): number {
  let r = 0;
  let prev = 0;
  for (const [kt, kr] of keys) {
    if (t < kt) break;
    const q = E.outBack(1.6)(Math.min(1, (t - kt) / 0.12));
    r = prev + (kr - prev) * q;
    prev = kr;
  }
  return r;
}

/** The perk (A1 FR1: the pose-pop dip read as the ears DIPPING): an upward STRETCH pop instead, -0.10 for 2 frames, then a
 *  short springy settle. */
function perkStretch(t: number, at: number): number {
  const d = t - at;
  if (d < 0 || d > 0.4) return 0;
  if (d < 2 / 30) return -0.1;
  const e = d - 2 / 30;
  return -0.1 * Math.exp(-e * 10) * Math.cos(e * Math.PI * 2 * 3);
}

/** Where his trunk tip is in the mirrored 'trunk-up' pose leaning HEY_LEAN (world, measured on the render): the 'hey'
 *  spark radiates from here at the plaque. */
const HEY_TIP: Pt = [HEY_TIP_X, HEY_TIP_Y];
/** A1 FR2: three strokes fanned +-24 deg, 32 px long (r 14 -> 46 from the tip), 5 px ink. Wrap FR1: aimed at the EMPTY
 *  twine hook on siteM's old plate (world ~(670, 1135), measured on the render; was the plate centre (590, 1144)): the
 *  tag that should hang there went over it; fanned +-20 deg so the left stroke clears the shout bubble. */
const HEY_DIR = (Math.atan2(1135 - HEY_TIP_Y, 670 - HEY_TIP_X) * 180) / Math.PI;
const HEY_ANGLES = [HEY_DIR - 20, HEY_DIR, HEY_DIR + 20];
const HEY_R: [number, number] = [14, 46];
/** The 'hey!' lean (deg, - = the top leans left toward the plate). */
const HEY_LEAN = -10;
/** The 'hey!' STAMP (A1 FR2): squash 0.90 for one frame on the beat, stretch 1.08, settle, over 0.12 s (it replaces the
 *  pose-switch pop): an alarm, not a happy look-up. */
function heyStamp(t: number, at: number): number {
  const d = t - at;
  if (d < 0 || d >= 0.12) return 0;
  if (d < 1 / 30) return 0.1;
  if (d < 2.2 / 30) return -0.08;
  return -0.08 * (1 - E.outCubic((d - 2.2 / 30) / (0.12 - 2.2 / 30)));
}

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
  return d ? <Ink d={d} width={5} taper={false} vary={0} seed="s10/hey" /> : null;
};

/** Wrap FR1: a SPIKY shout bubble lettered 'hey!' (caption hand, ~30 px tall on screen) up-left of his head, its tail
 *  aimed at his mouth (the tip on his left ear's top edge): it pops on the stamp (spring about the tail tip), holds,
 *  and shrinks out into the tail tip by `end` (no fade). Replaces A1 FR2's round peach '!' on siteM's wall (it read as
 *  the door / plaque exclaiming). World px. */
const SHOUT = {x: 568, y: 1263, rx: 47, ry: 37, spike: 10, n: 14, fs: 38};
const SHOUT_MOUTH: Pt = [686, 1388];
const SHOUT_TIP: Pt = [628, 1321];
const SHOUT_PTS: Pt[] = (() => {
  const {x, y, rx, ry, spike, n} = SHOUT;
  const pts: Pt[] = [];
  for (let i = 0; i < 2 * n; i++) {
    const a = (i / (2 * n)) * Math.PI * 2 - Math.PI / 2 + 0.11;
    const out = i % 2 === 0;
    // hand-drawn unevenness: spike lengths vary (deterministic)
    const k = out ? 1 + (spike / rx) * (0.75 + 0.5 * Math.abs(Math.sin(i * 2.7))) : 1;
    pts.push([x + Math.cos(a) * rx * k, y + Math.sin(a) * ry * (out ? 1 + (spike / ry) * (0.75 + 0.5 * Math.abs(Math.sin(i * 2.7))) : 1)]);
  }
  return pts;
})();
/** The tail: a wedge from the bubble's edge toward his mouth, its base 22 px wide. */
const SHOUT_TAIL: Pt[] = (() => {
  const {x, y, rx, ry} = SHOUT;
  const dx = SHOUT_MOUTH[0] - x;
  const dy = SHOUT_MOUTH[1] - y;
  const a = Math.atan2(dy / ry, dx / rx);
  const nx = -Math.sin(Math.atan2(dy, dx));
  const ny = Math.cos(Math.atan2(dy, dx));
  const bx = x + Math.cos(a) * rx * 0.8;
  const by = y + Math.sin(a) * ry * 0.8;
  return [[bx + nx * 11, by + ny * 11], SHOUT_TIP, [bx - nx * 11, by - ny * 11]];
})();
const ShoutBubble: React.FC<{at: number; end: number}> = ({at, end}) => {
  const t = useTime();
  if (t < at || t >= end) return null;
  const k = Math.min(springAt(t, at, springs.pop), 1 - E.inCubic(prog(t, end - 0.1, 0.1)));
  if (k <= 0.02) return null;
  const body = polyPath(SHOUT_PTS);
  const tail = polyPath(SHOUT_TAIL);
  const [a, b, c] = SHOUT_TAIL;
  return (
    <XG m={mat.about(mat.scale(k), SHOUT_TIP[0], SHOUT_TIP[1])}>
      <Fill d={tail + body} color={palette.peach} offset={false} mode="none" seed="s10/shout" />
      <Ink d={`${body}M${a[0].toFixed(1)} ${a[1].toFixed(1)}L${b[0]} ${b[1]}L${c[0].toFixed(1)} ${c[1].toFixed(1)}`} width={3.4} taper={false} seed="s10/shouti" />
      <Fill d={polyPath([a, b, c])} color={palette.peach} offset={false} mode="none" seed="s10/shoutt" />
      <text x={SHOUT.x - 1} y={SHOUT.y + SHOUT.fs * 0.3} textAnchor="middle" fontFamily={captionFontStack} fontSize={SHOUT.fs} fill={palette.ink} transform={`rotate(-6 ${SHOUT.x} ${SHOUT.y})`}>
        hey!
      </text>
    </XG>
  );
};

/** Wrap FR1: two short ink impact ticks either side of his feet on the bollard top: the stamp's squash frame is a STOMP
 *  (3 frames: full, then retracting from the inner ends). */
const StompTicks: React.FC<{at: number; x: number; y: number}> = ({at, x, y}) => {
  const t = useTime();
  const d = t - at;
  if (d < 0 || d >= 0.1) return null;
  const k = d < 1 / 30 ? 0 : E.inCubic(Math.min(1, (d - 1 / 30) / (0.1 - 1 / 30)));
  let p = '';
  for (const s of [-1, 1]) {
    const x0 = x + s * 46;
    const y0 = y - 4;
    const x1 = x + s * 66;
    const y1 = y - 16;
    p += `M${(x0 + (x1 - x0) * k).toFixed(1)} ${(y0 + (y1 - y0) * k).toFixed(1)}L${x1} ${y1}`;
    p += `M${(x0 + s * 2 + (x1 - x0 + s * 6) * k * 0.9).toFixed(1)} ${(y0 + 9 + (y1 - y0 + 8) * k * 0.9).toFixed(1)}L${x1 + s * 8} ${y1 + 16}`;
  }
  return <Ink d={p} width={3.6} taper={false} vary={0} seed="s10/stomp" />;
};

/** Wrap FR1: a CROSS face for the 'hey!': two 5 px ink brow slashes over his eyes, inner ends low (toward the trunk),
 *  drawn through Pip's own transform (Elephant: translate, rotate, scale(flip x scale), squash), so they ride the stamp.
 *  Points are the trunk-up front rig's head frame (poses.ts frontRig: head at (1.6 look, -69), tilt -7 + 2 look). */
const HeyBrows: React.FC<{m: Mat; look: number}> = ({m, look}) => {
  const H: Pt = [look * 1.6, -69];
  const tilt = ((-7 + look * 2) * Math.PI) / 180;
  const hp = (p: Pt): Pt => [p[0] * Math.cos(tilt) - p[1] * Math.sin(tilt) + H[0], p[0] * Math.sin(tilt) + p[1] * Math.cos(tilt) + H[1]];
  const ap = (p: Pt): Pt => [m[0] * p[0] + m[2] * p[1] + m[4], m[1] * p[0] + m[3] * p[1] + m[5]];
  let d = '';
  for (const s of [-1, 1]) {
    const ex = s * 9.6 + look * 2.2;
    const a = ap(hp([ex - s * 3.6, -7.4]));
    const b = ap(hp([ex + s * 4.6, -12.6]));
    d += `M${a[0].toFixed(1)} ${a[1].toFixed(1)}L${b[0].toFixed(1)} ${b[1].toFixed(1)}`;
  }
  return <Ink d={d} width={5} taper={false} vary={0} seed="s10/brows" />;
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
    const kx = tau / (CROUCH + ARC);
    const x = x0 + vx0 * TAU_V * (1 - Math.exp(-tau / TAU_V)) + (px - x0 - vx0 * TAU_V) * kx;
    if (tau < CROUCH) {
      return <Elephant x={x} y={y0} scale={s0} pose="stand-side" flip amount={0.15} squash={0.24} rotate={4} t={t} seed={PIP.seed} />;
    }
    const u = tau - CROUCH;
    const g = (2 * (py - y0 - VY0 * ARC)) / (ARC * ARC);
    const y = y0 + VY0 * u + 0.5 * g * u * u;
    const sc = s0 + (PIP.scale - s0) * E.inOutSine(k);
    // A1 FR1: the along-velocity stretch deepens over the last 6 frames before contact (-0.04 -> -0.16, was -0.12)
    const stretch = k < 0.25 ? -0.2 * (1 - k / 0.25) - 0.04 : -0.04 - 0.12 * Math.max(0, (k - 0.7) / 0.3);
    const spread = Math.sqrt(Math.sin(Math.PI * Math.min(1, k * 1.15)));
    const v = leapV(tau, T);
    return (
      <>
        <PipSmear x={x} y={y} vx={v[0]} vy={v[1]} sc={sc} seed="s10/pipLeapSpd" />
        <Elephant x={x} y={y} scale={sc} pose="stand-side" flip amount={spread} squash={stretch} rotate={8 * (1 - k) - 16 * k} t={t} seed={PIP.seed} />
      </>
    );
  }
  // 3) the hop out past the right edge
  if (t >= T.out) {
    const hopAt = (tt: number) => hop({t: tt, t0: T.out, dur: OUT_DUR, from: {x: px, y: py}, to: {x: PIP.exitTo[0], y: PIP.exitTo[1]}, height: 64});
    const h = hopAt(t);
    // A1 FR1: the hop out runs at 60-77 px / frame: the same 3-line smear, trailing left and down behind him (S11's
    // in-hop is smeared on the other side of the cut)
    const ha = hopAt(Math.max(T.out, t - 0.5 / 30));
    const hb = hopAt(t + 0.5 / 30);
    const dtv = t + 0.5 / 30 - Math.max(T.out, t - 0.5 / 30);
    return (
      <>
        {h.airborne ? <PipSmear x={h.x} y={h.y} vx={(hb.x - ha.x) / dtv} vy={(hb.y - ha.y) / dtv} sc={PIP.scale} seed="s10/pipOutSpd" /> : null}
        <Elephant x={h.x} y={h.y} scale={PIP.scale} pose="stand-side" amount={h.spread} squash={h.squash} rotate={h.rotate} t={t} seed={PIP.seed} />
      </>
    );
  }
  // 2) perched: the landing squash, then pose / look keys (each switch pops), the crouch before the hop out. Idle life
  //    is kept low so each look / pose pop reads as its own beat (not one long fidget)
  const t1 = T.leap + CROUCH;
  const dl = t - (t1 + ARC);
  const land = dl < 0.32 ? 0.24 * Math.exp(-dl * 11) * Math.cos(dl * Math.PI * 2 * 3.2) : 0;
  const crouch = hop({t, t0: T.out, dur: OUT_DUR, from: {x: px, y: py}, to: {x: PIP.exitTo[0], y: PIP.exitTo[1]}, height: 64});
  // A1 FR1: each look beat has its own SILHOUETTE (from behind, at ~120 px on a phone, a look offset alone did not read):
  //  - perk at the half sun: an upward stretch pop (not the pose-pop dip, which read as the ears dipping) + the whole
  //    body tilts 6 deg up-left toward the sun;
  //  - looks up at siteM's plaque: leans back toward it (-10 deg, held);
  //  - turns to the cart: pops to the side-on pose FACING LEFT (the trunk profile shows), back to sit-back on the lob;
  //  - 'hey!': the trunk curled up-left AT the old plaque (the 'hold' pose mirrored: a pointing trunk, the head turned
  //    toward it), leaning 13 deg toward it.
  const keys: PoseKey[] = [
    {t: t1 + ARC, pose: 'sit-back', look: 0.25},
    {t: T.perk, pose: 'sit-back', look: -0.45},
    {t: T.lookPlaque, pose: 'sit-back', look: -0.8},
    ...(T.lookFar !== undefined ? [{t: T.lookFar, pose: 'sit-back' as const, look: -0.15}] : []),
    ...(T.lookWeb !== undefined ? [{t: T.lookWeb, pose: 'sit-back' as const, look: -0.9}] : []),
    ...(T.lookCart !== undefined ? [{t: T.lookCart, pose: 'stand-side' as const, look: 0.2, amount: 0.15}] : []),
    // GAG (A1 FR2): mirrored 'trunk-up' (mouth open, trumpet marks, ears spread), wide eyes: the trunk raised and curled
    // up-left AT siteM's plaque (A1 FR1's mirrored 'hold' kept the closed smile + blush and read as a happy look-up)
    // Wrap FR1: 'worried' (its rig brows are inner-LOW = cross, and the eyes lose the 'wide' size + shine), with the
    // local 5 px brow slashes (HeyBrows) on top: indignant, not cheering
    {t: T.hey, pose: 'trunk-up', expression: 'worried', look: 1},
    // straight from the 'hey' into the hop's own pose (side-on, facing right): its crouch frames come right before the
    // take-off, so the exit has exactly ONE pose pop (fix round 2: no 3-frame back-view flicker)
    {t: T.heyEnd, pose: 'stand-side', look: 0.3},
  ];
  const heyOn = t >= T.hey && t < T.heyEnd;
  const cartOn = T.lookCart !== undefined && t >= T.lookCart && t < T.hey;
  const rot = rotAt(t, [
    [T.perk, -6],
    [T.lookPlaque, -10],
    ...(T.lookFar !== undefined ? ([[T.lookFar, -4]] as [number, number][]) : []),
    ...(T.lookWeb !== undefined ? ([[T.lookWeb, -8]] as [number, number][]) : []),
    ...(T.lookCart !== undefined ? ([[T.lookCart, -3]] as [number, number][]) : []),
    ...(T.lookLob !== undefined ? ([[T.lookLob, 6]] as [number, number][]) : []),
    [T.hey, HEY_LEAN],
    [T.heyEnd, 0],
  ]);
  // the perk replaces its pose-pop dip with the stretch pop
  const perk = perkStretch(t, T.perk) - popSwitch(t, T.perk);
  // the 'hey!' stamp replaces its pose-switch pop
  const stamp = heyStamp(t, T.hey) - popSwitch(t, T.hey);
  // Wrap FR1: Pip's own matrix in the 'hey!' (Elephant: translate rotate scale(fx scale, scale) scale(squash)), with the
  // squash ElephantTimeline adds (its pops into the 'hey' key and toward the next one), for the brows
  const sqAll = land + crouch.squash + perk + stamp + popSwitch(t, T.hey) + popSwitch(t, T.heyEnd);
  const heyM = mat.compose(mat.translate(px, py), mat.rotate(rot), mat.scale(-PIP.scale * (1 + sqAll * 0.55), PIP.scale * (1 - sqAll)));
  // the leap's speed lines retract over the 2 frames after touch-down
  const vLand = leapV(CROUCH + ARC - 1e-3, T);
  return (
    <>
      {dl >= 0 && dl < 2 / 30 ? <PipSmear x={px} y={py} vx={vLand[0]} vy={vLand[1]} sc={PIP.scale} k={1 - dl / (2 / 30)} seed="s10/pipLeapSpd" /> : null}
      <ElephantTimeline x={px} y={py} scale={PIP.scale} t={t} seed={PIP.seed} keys={keys} flip={heyOn || cartOn} rotate={rot} squash={land + crouch.squash + perk + stamp} idle={0.25} />
      {heyOn ? <HeyBrows m={heyM} look={1} /> : null}
      <StompTicks at={T.hey} x={px} y={py} />
      <HeySpark at={T.hey + 0.04} end={T.sparkEnd ?? T.heyEnd} />
      <ShoutBubble at={T.hey} end={T.heyEnd} />
    </>
  );
};
