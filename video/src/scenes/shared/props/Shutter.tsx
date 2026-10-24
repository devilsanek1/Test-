// props/Shutter.tsx — the switch-off hardware (P5, S01 / S11): roller shutter (with an optional peephole), the shutter
// padlock (visually distinct from the P1 door lock: a shackle loop, no cover / screws) and the "back soon" clock tag.
//
//   <RollerShutter x={270} y={860} w={210} h={150} slamAt={2.40} />                 // covers the window rect (x, y, w, h)
//   <RollerShutter ... state="down" peephole={{x: 375, y: 935, r: 12}} />           // S11: the bar still crawls behind it
//   <ShutterPadlock x={375} y={1015} at={3.64} glintAt={4.28} />                    // 24 x 28, centre of the body
//   <BackSoonTag x={405} y={1006} at={3.70} tapAt={58.2} />                         // hang point; tag 30 x 36 below it
//
// Roller shutter: an 18 px box above the window (tealDark, ink), the curtain unrolls from it: tealDark slats with ink
// ribs every 14 px, a sand bottom rail. slamAt: drops in 0.16 s (gravity) with a 6 px bounce. liftAt rolls it up (0.3 s).
// The peephole is a real hole (evenodd) with a cream rim: whatever is drawn BEHIND the shutter shows through it.

import React from 'react';
import {palette} from '../../../lib/theme';
import {ease as E, lerp, prog, springAt, springs, useTime} from '../../../lib/time';
import {Seed} from '../../../lib/rng';
import {Ink} from '../../../lib/Ink';
import {Fill} from '../../../lib/Fill';
import {ExitFade} from '../../../lib/exit';
import {blob, circle, hline, line, rect, rectPath, roundRect} from '../../../lib/sketch';
import {mat, XG} from '../../../lib/xf';
import {bt, Depth, DEPTH_INK, misregScreen, pendulum} from './common';

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
  /** Rib spacing (world px). Default 14. */
  rib?: number;
  peephole?: {x: number; y: number; r?: number};
  depth?: Depth;
  width?: number;
  seed?: Seed;
  outAt?: number;
};

/** Drop progress 0 (rolled up) .. 1 (down) with the slam bounce. Returns [k, bouncePx]. */
export function shutterDrop(t: number, o: {slamAt?: number; liftAt?: number; state?: 'up' | 'down'}): [number, number] {
  let k = o.state === 'down' ? 1 : 0;
  let bounce = 0;
  if (o.slamAt !== undefined && t >= o.slamAt) {
    const q = prog(t, o.slamAt, 0.16, E.inQuad);
    k = Math.max(k, q);
    if (t > o.slamAt + 0.16) {
      const dt = t - o.slamAt - 0.16;
      bounce = dt < 0.18 ? -6 * Math.sin((dt / 0.18) * Math.PI) * Math.exp(-dt * 6) : 0;
    }
  }
  if (o.liftAt !== undefined && t >= o.liftAt) k = Math.min(k, 1 - prog(t, o.liftAt, 0.3, E.inOutCubic));
  return [k, bounce];
}

export const RollerShutter: React.FC<RollerShutterProps> = ({x, y, w, h, box = 18, at, slamAt, liftAt, state = 'up', rib = 14, peephole, depth, width, seed = 'shut', outAt}) => {
  const t = useTime();
  if (at !== undefined && t < at) return null;
  if (outAt !== undefined && t >= outAt + 0.2) return null;
  const iw = width ?? DEPTH_INK[depth ?? 'mid'];
  const [k, bounce] = shutterDrop(t, {slamAt, liftAt, state});
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
};

/** The shutter padlock: sand body, ink shackle, cream glint. Pops on, the shackle clicks shut. */
export const ShutterPadlock: React.FC<ShutterPadlockProps> = ({x, y, size = 28, at, lockAt, glintAt, depth, width, seed = 'padlock'}) => {
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
  /** Tag width (height = 1.2 x). Default 30. */
  size?: number;
  /** Appears and swings -16 -> 0 deg over 0.5 s. */
  at?: number;
  /** Swing again (a tap). */
  tapAt?: number | number[];
  /** Extra static tilt (deg). */
  tilt?: number;
  depth?: Depth;
  width?: number;
  seed?: Seed;
};

/** White "back soon" tag with an ink clock icon on a short string. */
export const BackSoonTag: React.FC<BackSoonTagProps> = ({x, y, size = 30, at, tapAt, tilt = 0, depth, width, seed = 'tag'}) => {
  const t = useTime();
  if (at !== undefined && t < at) return null;
  const s = size / 30;
  const iw = (width ?? DEPTH_INK[depth ?? 'far']) / s;
  let a = pendulum(t, at, -16, 0.5, 0.8) + tilt;
  const taps = tapAt === undefined ? [] : Array.isArray(tapAt) ? tapAt : [tapAt];
  for (const tp of taps) a += pendulum(t, tp, 14, 0.5, 0.9);
  const pop = at !== undefined ? Math.min(1, 0.3 + springAt(t, at, springs.pop) * 0.7) : 1;
  const tag = 'M-15 14L-9 8H9L15 14V50H-15Z';
  const off = misregScreen(seed);
  return (
    <XG m={mat.compose(mat.translate(x, y), mat.scale(s), mat.rotate(a), mat.scale(pop))}>
      <Ink d={line(0, 0, 0, 11, {over: [0, 0], seed: `${seed}/str`})} width={iw * 0.6} taper={false} seed={`${seed}/str`} />
      <Fill d={tag} color={palette.white} offset={[off[0] / s, off[1] / s]} seed={`${seed}/f`} />
      <Ink d={tag} width={iw} taper={false} seed={`${seed}/o`} />
      <Ink d={circle(0, 12.5, 2.2, {seed: `${seed}/h`})} width={iw * 0.6} taper={false} seed={`${seed}/h`} />
      <Ink d={circle(0, 33, 9, {seed: `${seed}/c`, overlap: 12}) + 'M0 33V26.5M0 33L4.5 35.5'} width={iw * 0.85} taper={false} seed={`${seed}/c`} />
    </XG>
  );
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
export {lerp};
