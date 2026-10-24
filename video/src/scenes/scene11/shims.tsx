// S11 local pieces around / instead of shared kit pieces. No opacity anywhere: rotations, scales, pops.
//   NoteBreeze  the J6 sticky note flutters on its adhesive top edge in a breeze (a damped swing about its top) and jolts
//               under the pen as the strike starts. Applied OUTSIDE the shared StickyNote so the prop stays untouched.
//   NoteFlight  the note's ride in on the breeze from off the right edge (the shared StickyNote's own flutter pops it in
//               full size mid-air and runs too fast at this zoom): a near-linear tumbling arc, <= ~25 px / frame.
//   S11Padlock  STAND-IN for the set's govB padlock rig (GovernmentPlaza draws govB's sill ink AFTER its WindowRig, so the
//               two sill lines strike through the padlock and the tag: sets-lane z-order fix pending). Same anchor
//               (PLAZA.gov.govB.padlock), the props ShutterPadlock look, but an OCHRE body with a 3 px misregistered
//               fill (the sand body vanished into the darkened facade) at ~1.2x size, a rock + a cream sparkle glint.
//   S11Tag      STAND-IN for the set's lettered 'back soon' tag rig: the props BackSoonTag lettered look in CREAM (label
//               style), hung from a nail on the shutter face a little above the rail so it clears the bottom UI zone.
// Swap back to the set's rigs (gov.govB.padlockAt / tagAt / tagProps) once the sill is drawn under them.

import React from 'react';
import {palette} from '../../lib/theme';
import {ease as E, prog, springAt, springs, useTime} from '../../lib/time';
import {Ink} from '../../lib/Ink';
import {Fill} from '../../lib/Fill';
import {blob, circle, line, poly, roundRect, Pt} from '../../lib/sketch';
import {mat, useXf, XG} from '../../lib/xf';
import {captionFontStack, measureCaption, useCaptionFont} from '../../lib/font';
import {matScale, pendulum} from '../shared/props/common';

// ---------------------------------------------------------------- NoteBreeze

export const NoteBreeze: React.FC<{
  /** The note's rest centre and height (world): the swing pivots on the middle of its top edge. */
  x: number;
  y: number;
  h: number;
  /** Breeze flutters (0.7 s each, +-5 deg decaying, 1.5 swings). */
  flutterAt?: number[];
  /** The pen press: a 3.5 % squash over 0.12 s. */
  joltAt?: number;
  children?: React.ReactNode;
}> = ({x, y, h, flutterAt = [], joltAt, children}) => {
  const t = useTime();
  let fa = 0;
  for (const fl of flutterAt) if (t >= fl && t < fl + 0.7) fa += 5 * Math.sin(prog(t, fl, 0.7) * Math.PI * 3) * (1 - prog(t, fl, 0.7));
  let jolt = 1;
  if (joltAt !== undefined && t >= joltAt && t < joltAt + 0.12) jolt = 1 - 0.035 * Math.sin(prog(t, joltAt, 0.12) * Math.PI);
  if (fa === 0 && jolt === 1) return <>{children}</>;
  return <XG m={mat.compose(mat.about(mat.scale(jolt), x, y), mat.about(mat.rotate(fa), x, y - h / 2))}>{children}</XG>;
};

// ---------------------------------------------------------------- NoteFlight

/** Carries `children` (the note drawn at its rest centre (x, y), already stuck on) along a breeze arc from `from` to the
 *  rest centre, arriving at `arriveAt` (the slap). Linear speed (no ease-out spike), a lift arc, one slow tumble (scaleX
 *  1 -> 0.55 -> 1) and a spin that settles to 0. Nothing before `arriveAt - dur`, nothing after `arriveAt`
 *  (the slapping note takes over). */
export const NoteFlight: React.FC<{x: number; y: number; from: Pt; arriveAt: number; dur: number; lift?: number; spin?: number; children?: React.ReactNode}> = ({x, y, from, arriveAt, dur, lift = 24, spin = 32, children}) => {
  const t = useTime();
  if (t < arriveAt - dur || t >= arriveAt) return null;
  const q = (t - (arriveAt - dur)) / dur;
  // linear: an even on-screen speed (the peak IS the average), a lift arc, one slow tumble (scaleX 1 -> 0.75 -> 1)
  const px = from[0] + (x - from[0]) * q;
  const py = from[1] + (y - from[1]) * q - Math.sin(q * Math.PI) * lift;
  const a = spin * (1 - q) * Math.cos(q * Math.PI * 1.2);
  const sx = 0.75 + 0.25 * Math.abs(Math.cos(q * Math.PI));
  return <XG m={mat.compose(mat.translate(px, py), mat.rotate(a), mat.scale(sx, 0.92 + 0.08 * q), mat.translate(-x, -y))}>{children}</XG>;
};

// ---------------------------------------------------------------- Sparkle

/** A cream 4-point sparkle with an ink rim (sketch 'glint' language): pops full size for one frame at `at`, then shrinks
 *  to nothing by scale over `dur`. `r` = arm length (world). */
export const Sparkle: React.FC<{x: number; y: number; r: number; at: number[]; dur?: number; inkPx?: number}> = ({x, y, r, at, dur = 0.17, inkPx = 1.6}) => {
  const t = useTime();
  const k = Math.max(1e-4, matScale(useXf()));
  let s = 0;
  for (const a of at) if (t >= a && t < a + 1 / 30 + dur) s = Math.max(s, t < a + 1 / 30 ? 1 : 1 - E.inQuad(prog(t, a + 1 / 30, dur)));
  if (s <= 0.04) return null;
  const w = r * 0.26;
  const d = `M0 ${-r}Q${w * 0.35} ${-w * 0.35} ${r} 0Q${w * 0.35} ${w * 0.35} 0 ${r}Q${-w * 0.35} ${w * 0.35} ${-r} 0Q${-w * 0.35} ${-w * 0.35} 0 ${-r}Z`;
  return (
    <XG m={mat.compose(mat.translate(x, y), mat.rotate(8), mat.scale(s))}>
      <path d={d} fill={palette.cream} stroke={palette.ink} strokeWidth={inkPx / (k * Math.max(0.2, s))} strokeLinejoin="round" />
    </XG>
  );
};

// ---------------------------------------------------------------- S11Padlock

export type S11PadlockProps = {
  /** Body centre (world): PLAZA.gov.govB.padlock. */
  x: number;
  y: number;
  /** Total height (shackle + body), world. ShutterPadlock's default is 28. */
  size?: number;
  /** Pops on (springs.pop); the shackle snaps shut at lockAt (default at + 0.1). */
  at: number;
  lockAt?: number;
  /** Rocks on its shackle (+-6 deg, decaying, 0.35 s): Bit shifting his weight / tapping. */
  rockAt?: number[];
  /** Body colour (default ochre: brass against the darkened facade). */
  color?: string;
  /** Ink (screen px). */
  inkPx?: number;
  seed?: string;
};

/** Shackle-top offset (world, for size s) above the body centre: where Bit sits. */
export const padlockShackleTop = (size: number) => (-9 - 6.5 - 1) * (size / 28);

export const S11Padlock: React.FC<S11PadlockProps> = ({x, y, size = 28, at, lockAt, rockAt = [], color = palette.ochre, inkPx = 2.6, seed = 's11/pl'}) => {
  const t = useTime();
  const k = Math.max(1e-4, matScale(useXf()));
  if (t < at) return null;
  const s = size / 28;
  const iw = inkPx / (k * s);
  const pop = springAt(t, at, springs.pop);
  const la = lockAt ?? at + 0.1;
  const sh = -4 * (1 - springAt(t, la, springs.snappy));
  // rock about the shackle top (it hangs from the rail there)
  let rot = 0;
  for (const r of rockAt) if (t >= r && t < r + 0.5) rot += 6 * Math.sin(prog(t, r, 0.5) * Math.PI * 3) * Math.exp(-(t - r) * 6);
  const top = padlockShackleTop(size) / s;
  // misregistered fill: 3 px right / 2 px down on screen, constant whatever the zoom
  const off: Pt = [3 / (k * s), 2 / (k * s)];
  return (
    <XG m={mat.compose(mat.translate(x, y), mat.scale(s * pop), mat.about(mat.rotate(rot), 0, top))}>
      <XG m={mat.translate(0, sh)}>
        <Ink d="M-6.5 -1V-9A6.5 6.5 0 0 1 6.5 -9V-1" width={iw * 1.35} taper={false} seed={`${seed}/sh`} />
      </XG>
      <Fill d={roundRect(-12, -3, 24, 18, 3.5)} color={color} offset={off} mode="none" seed={`${seed}/b`} />
      <Ink d={roundRect(-12, -3, 24, 18, 3.5, {closed: false, seed: `${seed}/bi`})} width={iw} seed={`${seed}/bi`} />
      {/* keyhole: a cream plate with the ink hole, so it reads on the ochre */}
      <Fill d={blob(0, 6, 5.2, 6.2, {seed: `${seed}/kp`})} color={palette.cream} offset={false} mode="none" seed={`${seed}/kp`} />
      <Fill d={blob(0, 4.6, 1.9, 1.9, {seed: `${seed}/k`}) + 'M-0.9 5.5L-1.4 9.6H1.4L0.9 5.5Z'} color={palette.ink} offset={false} mode="none" seed={`${seed}/k`} />
      <Ink d="M-9 10L-7.2 1.5" width={iw * 0.8} color={palette.cream} taper={false} seed={`${seed}/g0`} />
    </XG>
  );
};

// ---------------------------------------------------------------- S11Tag

export type S11TagProps = {
  /** Hang point (world): the nail. The tag hangs below it. */
  x: number;
  y: number;
  /** Tag width (world). */
  size: number;
  text: [string, string];
  /** Appears and swings -16 -> 0 deg over 0.5 s. */
  at: number;
  tapAt?: number[];
  /** Twirls once about its string (0.45 s: scaleX through edge-on, the blank back shows). */
  twirlAt?: number[];
  inkPx?: number;
  color?: string;
  seed?: string;
};

/** The lettered 'back soon' tag (props BackSoonTag lettered geometry) in cream, on a nail. */
export const S11Tag: React.FC<S11TagProps> = ({x, y, size: W, text, at, tapAt = [], twirlAt = [], inkPx = 2.2, color = palette.cream, seed = 's11/tag'}) => {
  useCaptionFont();
  const t = useTime();
  const k = Math.max(1e-4, matScale(useXf()));
  if (t < at) return null;
  let a = pendulum(t, at, -16, 0.5, 0.8);
  for (const tp of tapAt) a += pendulum(t, tp, 14, 0.5, 0.9);
  let tw = 1;
  for (const tr of twirlAt) if (t >= tr && t < tr + 0.45) tw = Math.cos(prog(t, tr, 0.45, E.inOutSine) * Math.PI * 2);
  const twx = Math.abs(tw) < 0.06 ? 0.06 : tw;
  const pop = Math.min(1, 0.3 + springAt(t, at, springs.pop) * 0.7);
  const iw = inkPx / k;
  const m2 = Math.max(measureCaption(text[0], 100), measureCaption(text[1], 100)) / 100;
  const fs = Math.min((W * 0.8) / m2, W * 0.34);
  const n = Math.min(W * 0.14, fs * 0.6);
  const str = Math.max(5, fs * 0.3);
  const H = n + fs * 0.42 + fs * 2.0 + fs * 0.28;
  const body: Pt[] = [
    [-W / 2, str + n],
    [-W / 2 + n, str],
    [W / 2 - n, str],
    [W / 2, str + n],
    [W / 2, str + H],
    [-W / 2, str + H],
  ];
  const bodyD = `M${body.map((q) => `${q[0].toFixed(1)} ${q[1].toFixed(1)}`).join('L')}Z`;
  const ey = str + n * 0.62;
  const er = Math.max(1.8, fs * 0.1);
  const ty = str + n + fs * 0.32 + fs * 0.72;
  const off: Pt = [-3 / k, 2 / k];
  return (
    <>
      {/* the nail head on the shutter */}
      <path d={blob(x, y - 0.5, 1.8, 1.8, {seed: `${seed}/nail`})} fill={palette.ink} />
      <XG m={mat.compose(mat.translate(x, y), mat.rotate(a), mat.scale(pop))}>
        <Ink d={line(0, 0, 0, ey - er, {over: [0, 0], seed: `${seed}/str`})} width={iw * 0.6} taper={false} seed={`${seed}/str`} />
        <XG m={mat.scale(twx, 1)}>
          <Fill d={bodyD} color={color} offset={off} mode="none" seed={`${seed}/f`} />
          <Ink d={poly(body, {closed: true, over: 2, seed: `${seed}/o`})} width={iw} taper={false} seed={`${seed}/o`} />
          <Ink d={circle(0, ey, er, {seed: `${seed}/h`})} width={iw * 0.6} taper={false} seed={`${seed}/h`} />
          {tw > 0.3 ? (
            <>
              <text x={0} y={ty} fontFamily={captionFontStack} fontSize={fs} fill={palette.ink} textAnchor="middle">
                {text[0]}
              </text>
              <text x={0} y={ty + fs * 0.98} fontFamily={captionFontStack} fontSize={fs} fill={palette.ink} textAnchor="middle">
                {text[1]}
              </text>
            </>
          ) : null}
        </XG>
      </XG>
    </>
  );
};

/** Height (world) of an S11Tag of width W hanging from its nail, string included (for the UI-zone check). */
export function s11TagDrop(W: number, text: [string, string]): number {
  const m2 = Math.max(measureCaption(text[0], 100), measureCaption(text[1], 100)) / 100;
  const fs = Math.min((W * 0.8) / m2, W * 0.34);
  const n = Math.min(W * 0.14, fs * 0.6);
  return Math.max(5, fs * 0.3) + n + fs * 2.7;
}
