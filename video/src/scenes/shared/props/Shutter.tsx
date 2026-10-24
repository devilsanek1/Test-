// props/Shutter.tsx — the switch-off hardware (P5, S01 / S11): roller shutter (with an optional peephole), the shutter
// padlock (visually distinct from the P1 door lock: a shackle loop, no cover / screws) and the "back soon" clock tag.
//
//   <RollerShutter x={270} y={860} w={210} h={150} slamAt={2.40} />                 // covers the window rect (x, y, w, h)
//   <RollerShutter ... state="down" peephole={{x: 375, y: 935, r: 12}} />           // S11: the bar still crawls behind it
//   <ShutterPadlock x={375} y={1015} at={3.64} glintAt={4.28} />                    // 24 x 28, centre of the body
//   <BackSoonTag x={405} y={1006} at={3.70} tapAt={58.2} />                         // hang point; tag 30 x 36 below it
//   <BackSoonTag x={518} y={1124} lettered size={88} at={3.69} liftAt={53.9} />       // v3: 'back soon' lettered, rewind
//   <RollerShutter ... slamAt={2.35} stopAt={0.5} />  <RollerShutter ... liftAt={54.2} liftMode="reverse" />   // v3
//
// Roller shutter: an 18 px box above the window (tealDark, ink), the curtain unrolls from it: tealDark slats with ink
// ribs every 14 px, a sand bottom rail. slamAt: drops in 0.16 s (gravity) with a 6 px bounce. liftAt rolls it up (0.3 s).
// The peephole is a real hole (evenodd) with a cream rim: whatever is drawn BEHIND the shutter shows through it.

import React from 'react';
import {palette} from '../../../lib/theme';
import {clamp, ease as E, lerp, prog, springAt, springs, useTime} from '../../../lib/time';
import {Seed} from '../../../lib/rng';
import {Ink} from '../../../lib/Ink';
import {Fill} from '../../../lib/Fill';
import {ExitFade, UnBuild} from '../../../lib/exit';
import {MOTION} from '../../../lib/spec';
import {captionFontStack, measureCaption, useCaptionFont} from '../../../lib/font';
import {blob, circle, hline, line, poly, Pt, rect, rectPath, roundRect} from '../../../lib/sketch';
import {mat, useXf, XG} from '../../../lib/xf';
import {bt, Depth, DEPTH_INK, matScale, misregScreen, pendulum, withOut} from './common';

export type RollerShutterProps = {
  /** The window rect the curtain covers (world px). The box sits above it (y - box .. y). */
  x: number;
  y: number;
  w: number;
  h: number;
  /** Box height. Default 18. */
  box?: number;
  /** Box draws on at `at` (omit = built). */
  at?: number;
  slamAt?: number;
  liftAt?: number;
  /** Rest state before any event: 'up' (default) or 'down'. */
  state?: 'up' | 'down';
  /** A partial shutter: the drop stops at this FRACTION of the window (govC: 0.5) with a 1-frame jolt (+5 px, -2 px);
   *  the fall time shortens with the distance (gravity). 'down' rests at it too. Default 1 (all the way). */
  stopAt?: number;
  /** How `liftAt` lifts it: 'roll' (default: rolls up 0.3 s) | 'reverse' (S12 rewind: the slam played BACKWARDS, the
   *  bounce first, then the curtain shoots up, stepped at `step` Hz like a tape). */
  liftMode?: 'roll' | 'reverse';
  /** Tape-step rate (Hz) for liftMode 'reverse'. Default 12. 0 = smooth. */
  step?: number;
  /** Rib spacing (world px). Default 14. */
  rib?: number;
  peephole?: {x: number; y: number; r?: number};
  depth?: Depth;
  width?: number;
  seed?: Seed;
  outAt?: number;
};

/** Quantise the time since `at` to `hz` steps (a tape rewind look); hz 0 = smooth. */
export const stepTime = (t: number, at: number, hz = 12) => (hz > 0 ? at + Math.floor((t - at) * hz + 1e-6) / hz : t);

/** The forward slam at local time u (0 = slamAt) for a drop to `stop`: [k, bouncePx]. Gravity fall (in(quad)) whose
 *  length shortens with the distance (0.16 s for a full drop), then the 6 px bounce (full) or a 1-frame jolt (partial). */
export function slamCurve(u: number, stop = 1): [number, number] {
  if (u < 0) return [0, 0];
  const dur = 0.16 * Math.sqrt(Math.max(0.05, stop));
  const k = E.inQuad(Math.min(1, u / dur)) * stop;
  const d = u - dur;
  if (d <= 0) return [k, 0];
  if (stop < 0.999) return [k, d < 1 / 30 ? 5 : d < 2 / 30 ? -2 : 0];
  return [k, d < 0.18 ? -6 * Math.sin((d / 0.18) * Math.PI) * Math.exp(-d * 6) : 0];
}
/** Length of the forward slam (fall + bounce / jolt) for a drop to `stop`. */
export const slamLength = (stop = 1) => 0.16 * Math.sqrt(Math.max(0.05, stop)) + (stop < 0.999 ? 2 / 30 : 0.18);

/** Drop progress 0 (rolled up) .. 1 (down) with the slam bounce. Returns [k, bouncePx]. */
export function shutterDrop(t: number, o: {slamAt?: number; liftAt?: number; state?: 'up' | 'down'; stopAt?: number; liftMode?: 'roll' | 'reverse'; step?: number}): [number, number] {
  const stop = clamp(o.stopAt ?? 1, 0.02, 1);
  let k = o.state === 'down' ? stop : 0;
  let bounce = 0;
  if (o.slamAt !== undefined && t >= o.slamAt) {
    const [q, b] = slamCurve(t - o.slamAt, stop);
    k = Math.max(k, q);
    bounce = b;
  }
  if (o.liftAt !== undefined && t >= o.liftAt) {
    if (o.liftMode === 'reverse') {
      const L = slamLength(stop);
      const u = stepTime(t, o.liftAt, o.step ?? 12) - o.liftAt;
      const [q, b] = slamCurve(L - u, stop);
      k = Math.min(k, q);
      bounce = u < L ? b : 0;
    } else k = Math.min(k, 1 - prog(t, o.liftAt, 0.3, E.inOutCubic));
  }
  return [k, bounce];
}

export const RollerShutter: React.FC<RollerShutterProps> = ({x, y, w, h, box = 18, at, slamAt, liftAt, state = 'up', stopAt, liftMode, step, rib = 14, peephole, depth, width, seed = 'shut', outAt}) => {
  const t = useTime();
  if (at !== undefined && t < at) return null;
  if (outAt !== undefined && t >= outAt + 0.2) return null;
  const iw = width ?? DEPTH_INK[depth ?? 'mid'];
  const [k, bounce] = shutterDrop(t, {slamAt, liftAt, state, stopAt, liftMode, step});
  const bottom = y + h * k + bounce;
  const curH = bottom - y;
  const off = misregScreen(seed);
  const out: React.ReactNode[] = [];
  if (curH > 0.5) {
    // curtain (with an optional peephole that rides the curtain)
    let d = rectPath(x, y, w, curH);
    let ph: {cx: number; cy: number; r: number} | null = null;
    if (peephole) {
      const cy = peephole.y - (y + h - bottom);
      const r = peephole.r ?? 12;
      if (cy - r > y + 2) {
        ph = {cx: peephole.x, cy, r};
        d += `M${peephole.x - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0Z`;
      }
    }
    out.push(<Fill key="cur" d={d} color={palette.tealDark} rule="evenodd" offset={false} mode="none" seed={`${seed}/c`} />);
    // ribs, moving with the curtain's bottom edge
    let ribs = '';
    for (let yy = bottom - 10; yy > y + 2; yy -= rib) ribs += `M${x + 3} ${yy.toFixed(1)}H${x + w - 3}`;
    if (ribs) out.push(<Ink key="ribs" d={ribs} width={iw * 0.45} taper={false} vary={0} seed={`${seed}/rb`} />);
    // bottom rail + handle
    out.push(<Fill key="rail" d={rectPath(x - 3, bottom - 9, w + 6, 9)} color={palette.sand} offset={false} mode="none" seed={`${seed}/rl`} />);
    out.push(<Ink key="railI" d={`M${x - 4} ${(bottom - 9).toFixed(1)}H${x + w + 4}M${x - 4} ${bottom.toFixed(1)}H${x + w + 4}` + `M${x + w / 2 - 9} ${bottom.toFixed(1)}v5h18v-5`} width={iw * 0.75} taper={false} seed={`${seed}/rli`} />);
    out.push(<Ink key="side" d={`M${x} ${y}V${bottom.toFixed(1)}M${x + w} ${y}V${bottom.toFixed(1)}`} width={iw * 0.8} taper={false} seed={`${seed}/sd`} />);
    if (ph) {
      out.push(
        <ExitFade key="ph" x={ph.cx} y={ph.cy}>
          <circle cx={ph.cx} cy={ph.cy} r={ph.r + 1.6} fill="none" stroke={palette.cream} strokeWidth={4} />
          <circle cx={ph.cx} cy={ph.cy} r={ph.r + 4} fill="none" stroke={palette.ink} strokeWidth={iw * 0.6} />
        </ExitFade>,
      );
    }
  }
  // the box (always on top of the rolled curtain)
  out.push(<Fill key="box" rect={[x - 6, y - box, w + 12, box]} color={palette.tealDark} at={bt(at, 0.1)} mode="wipe" dir="right" offset={off} seed={`${seed}/bx`} />);
  out.push(<Ink key="boxI" d={rect(x - 6, y - box, w + 12, box, {seed: `${seed}/bxi`, over: 6})} at={at} dur={0.2} width={iw} seed={`${seed}/bxi`} />);
  out.push(<Ink key="boxL" d={hline(x - 2, x + w + 2, y - box * 0.45, {seed: `${seed}/bxl`, over: [0, 0]})} at={bt(at, 0.12)} width={iw * 0.45} seed={`${seed}/bxl`} />);
  const ek = outAt !== undefined ? 1 - E.inCubic(prog(t, outAt, 0.2)) : 1;
  return ek < 1 ? <XG m={mat.about(mat.scale(1, ek), x, y - box)}>{out}</XG> : <>{out}</>;
};

// ---------------------------------------------------------------- ShutterPadlock

export type ShutterPadlockProps = {
  /** Centre of the body (the padlock hangs from the shutter rail above it). */
  x: number;
  y: number;
  /** Total height (shackle + body). Default 28 (24 wide). */
  size?: number;
  at?: number;
  /** The shackle snaps shut (springs down) at lockAt (default at + 0.1). */
  lockAt?: number;
  glintAt?: number | number[];
  depth?: Depth;
  width?: number;
  seed?: Seed;
  /** Out (S12 rewind): 'unbuild' (default, the measured un-build over outDur) | 'pop' (one shrunken frame, gone). */
  outAt?: number;
  outDur?: number;
  outMode?: 'pop' | 'unbuild';
};

/** The shutter padlock: sand body, ink shackle, cream glint. Pops on, the shackle clicks shut. */
const ShutterPadlockBase: React.FC<ShutterPadlockProps> = ({x, y, size = 28, at, lockAt, glintAt, depth, width, seed = 'padlock'}) => {
  const t = useTime();
  if (at !== undefined && t < at) return null;
  const s = size / 28;
  const iw = (width ?? DEPTH_INK[depth ?? 'far']) / s;
  const pop = at !== undefined ? springAt(t, at, springs.pop) : 1;
  const la = lockAt ?? bt(at, 0.1);
  const sh = la !== undefined ? -4 * (1 - springAt(t, la, springs.snappy)) : 0;
  const glints = glintAt === undefined ? [] : Array.isArray(glintAt) ? glintAt : [glintAt];
  const gl = glints.some((g) => t >= g && t < g + 0.25);
  const off = misregScreen(seed);
  return (
    <XG m={mat.compose(mat.translate(x, y), mat.scale(s * pop))}>
      <XG m={mat.translate(0, sh)}>
        <Ink d="M-6.5 -1V-9A6.5 6.5 0 0 1 6.5 -9V-1" width={iw * 1.25} taper={false} seed={`${seed}/sh`} />
      </XG>
      <Fill d={roundRect(-12, -3, 24, 18, 3.5)} color={palette.sand} offset={[off[0] / s, off[1] / s]} seed={`${seed}/b`} />
      <Ink d={roundRect(-12, -3, 24, 18, 3.5, {closed: false, seed: `${seed}/bi`})} width={iw} seed={`${seed}/bi`} />
      <Fill d={blob(0, 4.5, 2.2, 2.2, {seed: `${seed}/k`}) + 'M-1.1 5.5L-1.6 10.5H1.6L1.1 5.5Z'} color={palette.ink} offset={false} seed={`${seed}/k`} />
      {gl ? <Ink d="M-8.5 9L-5.5 1" width={iw * 0.9} color={palette.cream} taper={false} seed={`${seed}/g`} /> : <Ink d="M-8.5 9L-6.8 4.5" width={iw * 0.7} color={palette.cream} taper={false} seed={`${seed}/g0`} />}
    </XG>
  );
};

// ---------------------------------------------------------------- BackSoonTag

export type BackSoonTagProps = {
  /** Hang point (the string's top). The tag hangs below it. */
  x: number;
  y: number;
  /** Tag width (height = 1.2 x for the clock tag; the lettered tag fits its words). Default 30 (lettered: 84). */
  size?: number;
  /** Alias of `size` (scene shims). */
  w?: number;
  /** Appears and swings -16 -> 0 deg over 0.5 s. */
  at?: number;
  /** Swing again (a tap). */
  tapAt?: number | number[];
  /** Twirls once about its string (0.45 s: scaleX through edge-on, the blank back shows; no fade). */
  twirlAt?: number | number[];
  /** Extra static tilt (deg). */
  tilt?: number;
  /** v3: the LETTERED tag: 'back soon' in CaptionHand (one line on a wide tag, 'back' / 'soon' otherwise) instead of
   *  the clock icon. Keep it >= 80 px wide and the lettering >= 22 px ON SCREEN (S01 govB). */
  lettered?: boolean;
  /** Lettered text (default 'back soon'; a pair = two lines). */
  text?: string | [string, string];
  /** Lettering size in world px (default: the largest that fits the width). */
  font?: number;
  /** S12 rewind: the tag swings back UP (0 -> -16 deg, stepped at `step` Hz, 0.17 s), then one shrunken frame, gone. */
  liftAt?: number;
  /** Out: 'pop' = one shrunken frame, then gone (default when lettered or with liftAt) | 'unbuild' = the measured
   *  un-build over outDur (the v2 behaviour, default for the clock tag). */
  outAt?: number;
  outDur?: number;
  outMode?: 'pop' | 'unbuild';
  /** Tape-step rate for liftAt (Hz). Default 12; 0 = smooth. */
  step?: number;
  depth?: Depth;
  width?: number;
  /** Ink in SCREEN px (divided by the camera scale). Overrides width / depth. */
  inkPx?: number;
  seed?: Seed;
};

/** White "back soon" tag on a short string: an ink clock icon (v2) or LETTERED 'back soon' (v3). */
const BackSoonTagBase: React.FC<BackSoonTagProps & {k: number}> = ({x, y, size: sizeIn, w: wIn, at, tapAt, twirlAt, tilt = 0, lettered = false, text = 'back soon', font, liftAt, step = 12, depth, width, inkPx, seed = 'tag', k}) => {
  const t = useTime();
  if (at !== undefined && t < at) return null;
  let a = pendulum(t, at, -16, 0.5, 0.8) + tilt;
  const taps = tapAt === undefined ? [] : Array.isArray(tapAt) ? tapAt : [tapAt];
  for (const tp of taps) a += pendulum(t, tp, 14, 0.5, 0.9);
  let lift = 1;
  if (liftAt !== undefined && t >= liftAt) {
    const SW = 0.17;
    if (t >= liftAt + SW + 1 / 30) return null;
    if (t >= liftAt + SW) lift = 0.55;
    a += -16 * Math.min(1, (stepTime(t, liftAt, step) - liftAt) / SW);
  }
  const twirls = twirlAt === undefined ? [] : Array.isArray(twirlAt) ? twirlAt : [twirlAt];
  let tw = 1;
  for (const tr of twirls) if (t >= tr && t < tr + 0.45) tw = Math.cos(prog(t, tr, 0.45, E.inOutSine) * Math.PI * 2);
  const twx = Math.abs(tw) < 0.06 ? 0.06 : tw;
  const pop = (at !== undefined ? Math.min(1, 0.3 + springAt(t, at, springs.pop) * 0.7) : 1) * lift;
  const off = misregScreen(seed);
  if (!lettered) {
    const size = sizeIn ?? wIn ?? 30;
    const s = size / 30;
    const iw = (inkPx !== undefined ? inkPx / k : width ?? DEPTH_INK[depth ?? 'far']) / s;
    const tag = 'M-15 14L-9 8H9L15 14V50H-15Z';
    return (
      <XG m={mat.compose(mat.translate(x, y), mat.scale(s), mat.rotate(a), mat.scale(pop))}>
        <Ink d={line(0, 0, 0, 11, {over: [0, 0], seed: `${seed}/str`})} width={iw * 0.6} taper={false} seed={`${seed}/str`} />
        <XG m={mat.scale(twx, 1)}>
          <Fill d={tag} color={palette.white} offset={[off[0] / s / k, off[1] / s / k]} seed={`${seed}/f`} />
          <Ink d={tag} width={iw} taper={false} seed={`${seed}/o`} />
          <Ink d={circle(0, 12.5, 2.2, {seed: `${seed}/h`})} width={iw * 0.6} taper={false} seed={`${seed}/h`} />
          {tw > 0.3 ? <Ink d={circle(0, 33, 9, {seed: `${seed}/c`, overlap: 12}) + 'M0 33V26.5M0 33L4.5 35.5'} width={iw * 0.85} taper={false} seed={`${seed}/c`} /> : null}
        </XG>
      </XG>
    );
  }
  // lettered: W wide, clipped top corners, an eyelet, the words in CaptionHand
  const W = sizeIn ?? wIn ?? 84;
  const iw = inkPx !== undefined ? inkPx / k : width ?? DEPTH_INK[depth ?? 'far'];
  const one = typeof text === 'string' ? text : text.join(' ');
  const two: [string, string] = typeof text === 'string' ? (text.includes(' ') ? [text.slice(0, text.indexOf(' ')), text.slice(text.indexOf(' ') + 1)] : [text, '']) : text;
  const m1 = measureCaption(one, 100) / 100;
  const m2 = Math.max(measureCaption(two[0], 100), measureCaption(two[1], 100)) / 100;
  const fit1 = (W * 0.84) / m1;
  const fit2 = (W * 0.8) / m2;
  const useOne = typeof text === 'string' && (font !== undefined ? font * m1 <= W * 0.9 : fit1 >= Math.max(20, W * 0.24));
  const fs = font ?? (useOne ? Math.min(fit1, W * 0.34) : Math.min(fit2, W * 0.34));
  const n = Math.min(W * 0.14, fs * 0.6);
  const str = Math.max(6, fs * 0.36);
  const H = n + fs * 0.42 + (useOne ? fs * 1.02 : fs * 2.0) + fs * 0.28;
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
  return (
    <XG m={mat.compose(mat.translate(x, y), mat.rotate(a), mat.scale(pop))}>
      <Ink d={line(0, 0, 0, ey - er, {over: [0, 0], seed: `${seed}/str`})} width={iw * 0.6} taper={false} seed={`${seed}/str`} />
      <XG m={mat.scale(twx, 1)}>
        <Fill d={bodyD} color={palette.white} offset={[off[0] / k, off[1] / k]} seed={`${seed}/f`} />
        <Ink d={poly(body, {closed: true, over: 2, seed: `${seed}/o`})} width={iw} taper={false} seed={`${seed}/o`} />
        <Ink d={circle(0, ey, er, {seed: `${seed}/h`})} width={iw * 0.6} taper={false} seed={`${seed}/h`} />
        {tw > 0.3 ? (
          <ExitFade x={0} y={str + H / 2}>
            {useOne ? (
              <text x={0} y={ty} fontFamily={captionFontStack} fontSize={fs} fill={palette.ink} textAnchor="middle">
                {one}
              </text>
            ) : (
              <>
                <text x={0} y={ty} fontFamily={captionFontStack} fontSize={fs} fill={palette.ink} textAnchor="middle">
                  {two[0]}
                </text>
                <text x={0} y={ty + fs * 0.98} fontFamily={captionFontStack} fontSize={fs} fill={palette.ink} textAnchor="middle">
                  {two[1]}
                </text>
              </>
            )}
          </ExitFade>
        ) : null}
      </XG>
    </XG>
  );
};

/** "back soon" tag (P5). v2: white tag with an ink clock; v3 `lettered`: the words in CaptionHand, `liftAt` / `outAt`
 *  for the S12 rewind. `outAt` pops it off in one shrunken frame (lettered / liftAt) or un-builds it (clock tag). */
export const BackSoonTag: React.FC<BackSoonTagProps> = (p) => {
  useCaptionFont();
  const k = Math.max(1e-4, matScale(useXf()));
  const t = useTime();
  const mode = p.outMode ?? (p.lettered || p.liftAt !== undefined ? 'pop' : 'unbuild');
  const el = <BackSoonTagBase {...p} k={k} />;
  if (p.outAt === undefined) return el;
  if (mode === 'pop') {
    if (t < p.outAt) return el;
    if (t >= p.outAt + 1 / 30) return null;
    return <XG m={mat.about(mat.scale(0.55), p.x, p.y)}>{el}</XG>;
  }
  return <UnBuild at={p.outAt} dur={p.outDur ?? MOTION.unbuild.total}>{el}</UnBuild>;
};

/** Window-switch-off helper: the 1-frame "lights out" step map (cream -> sand -> tan, mintPale -> sage, glow -> tealDark). */
export const LIGHTS_OUT: Record<string, string> = {
  [palette.cream]: palette.sand,
  [palette.sand]: palette.tan,
  [palette.mintPale]: palette.sage,
  [palette.white]: palette.cream,
  [palette.peach]: palette.tan,
};
/** One palette step darker (unknown colours pass through). */
export const lightsOut = (c: string) => LIGHTS_OUT[c] ?? c;

// build-out (outAt / outDur) for props that have no own exit
const ShutterPadlockOut = withOut(ShutterPadlockBase, 'ShutterPadlock');
/** The shutter padlock (P5); `outAt` un-builds it, or pops it off in one shrunken frame with outMode 'pop'. */
export const ShutterPadlock: React.FC<ShutterPadlockProps> = (p) => {
  const t = useTime();
  if (p.outAt === undefined || (p.outMode ?? 'unbuild') === 'unbuild') return <ShutterPadlockOut {...p} />;
  const {outAt, outDur, outMode, ...rest} = p;
  if (t < outAt) return <ShutterPadlockBase {...rest} />;
  if (t >= outAt + 1 / 30) return null;
  return <XG m={mat.about(mat.scale(0.55), p.x, p.y)}><ShutterPadlockBase {...rest} /></XG>;
};
