// Sun.tsx — the orange disc (theme.sun), the visual anchor of every scene. Render it inside your scene's
// <Art> where you want it in the z-order (e.g. before a wall so it can set behind it).
//
//   <Sun />                                            // static at theme position
//   <Sun at={0.2} breathe />                           // springs in, then breathes gently
//   <Sun pulse={[2.4, 5.1]} />                         // one-shot "heartbeat" bumps at those times
//   <Sun moves={[{at: 6, dur: 1.5, y: 260}]} horizon={230} />   // sets behind a wall line at y=230
//   <Sun>{(r) => <PowerSymbol r={r} at={3} />}</Sun>   // overlays in sun-local coords (0,0 = centre)
//
// During a card flip the Sun counter-scales so it stays a round disc (as in the reference).

import React, {useId} from 'react';
import {palette, stroke, sun as sunGeo} from './theme';
import {Ease, ease as E, lerp, osc, prog, springAt, springs, useTime} from './time';
import {useCardRotY} from './Card';
import {ExitFade, exitFillProgress, useExit} from './exit';
import {Ink} from './Ink';
import {arc, line} from './sketch';

export type SunMove = {at: number; dur?: number; x?: number; y?: number; r?: number; ease?: Ease};

export type SunProps = {
  /** Spring-in time (s). Omit = already there. */
  at?: number;
  cx?: number;
  cy?: number;
  r?: number;
  color?: string;
  /** Sequential moves (set / rise / slide / grow). Each interpolates from the previous state. */
  moves?: SunMove[];
  /** Times of one-shot pulses (scale bump ~10%). */
  pulse?: number | number[];
  /** Idle breathing (true = 1.2%, or a fraction). */
  breathe?: boolean | number;
  /** Clip the disc below this y (card coords): the sun "sets" behind a horizon/wall line. */
  horizon?: number;
  /** Shrink away during scene un-build (default true). */
  exit?: boolean;
  children?: React.ReactNode | ((r: number) => React.ReactNode);
};

export const Sun: React.FC<SunProps> = ({at, cx = sunGeo.cx, cy = sunGeo.cy, r = sunGeo.r, color = palette.sun, moves = [], pulse, breathe, horizon, exit = true, children}) => {
  const t = useTime();
  const rotY = useCardRotY();
  const e = useExit();
  const id = useId().replace(/[^a-zA-Z0-9]/g, '');
  if (at !== undefined && t < at) return null;

  let x = cx;
  let y = cy;
  let rad = r;
  for (const m of moves) {
    const p = prog(t, m.at, m.dur ?? 1, m.ease ?? E.inOutCubic);
    if (p <= 0) break;
    x = lerp(x, m.x ?? x, p);
    y = lerp(y, m.y ?? y, p);
    rad = lerp(rad, m.r ?? rad, p);
  }
  let s = at !== undefined ? springAt(t, at, springs.wobbly) : 1;
  const pulses = pulse === undefined ? [] : Array.isArray(pulse) ? pulse : [pulse];
  for (const pt of pulses) {
    if (t >= pt && t < pt + 1.2) s *= 1 + 0.11 * Math.sin(Math.PI * prog(t, pt, 0.22, E.outQuad)) + (t > pt + 0.22 ? -0.04 * Math.sin(Math.PI * prog(t, pt + 0.22, 0.4)) : 0);
  }
  if (breathe) s *= 1 + (typeof breathe === 'number' ? breathe : 0.012) * osc(t, 0.45);
  if (exit && e > 0) s *= 1 - E.inCubic(exitFillProgress(e, 0.3));
  if (s <= 0.001) return null;

  // keep round while the card is rotated about Y
  const k = Math.cos((rotY * Math.PI) / 180);
  const counter = rotY !== 0 && k > 0.02 ? 1 / k : 1;
  const tr = `translate(${x.toFixed(2)} ${y.toFixed(2)}) scale(${(s * counter).toFixed(4)} ${s.toFixed(4)})`;
  const body = (
    <g transform={tr}>
      <circle cx={0} cy={0} r={rad} fill={color} />
      {typeof children === 'function' ? children(rad) : children}
    </g>
  );
  if (horizon === undefined) return body;
  return (
    <>
      <defs>
        <clipPath id={`sunclip${id}`}>
          <rect x={-2000} y={-2000} width={5000} height={horizon + 2000} />
        </clipPath>
      </defs>
      <g clipPath={`url(#sunclip${id})`}>{body}</g>
    </>
  );
};

// ---------------------------------------------------------------- overlays (sun-local coordinates)

/** Power symbol drawn on the sun (switch-off motif). */
export const PowerSymbol: React.FC<{r: number; at?: number; color?: string; width?: number}> = ({r, at, color = palette.card, width = stroke.inkBold + 1.5}) => {
  const rr = r * 0.48;
  return (
    <>
      <Ink d={arc(0, r * 0.04, rr, rr, -60, 240, {seed: 'pwr'})} at={at} dur={0.45} color={color} width={width} exit={false} />
      <Ink d={line(0, -r * 0.58, 0, -r * 0.08, {over: 0, seed: 'pwr2'})} at={at !== undefined ? at + 0.3 : undefined} dur={0.2} color={color} width={width} exit={false} />
    </>
  );
};

/** Clock hands on the sun. Minute hand turns `speed` revolutions per second after `at`. */
export const ClockHands: React.FC<{r: number; at?: number; speed?: number; color?: string; width?: number; ticks?: boolean}> = ({
  r,
  at = 0,
  speed = 0.5,
  color = palette.card,
  width = stroke.inkBold,
  ticks = true,
}) => {
  const t = useTime();
  if (t < at) return null;
  const pop = springAt(t, at, springs.pop);
  const run = Math.max(0, t - at - 0.3);
  const mA = -90 + 360 * speed * run + 30;
  const hA = -90 + 30 * speed * run + 120;
  const hand = (a: number, len: number) => {
    const rad = (a * Math.PI) / 180;
    return `M0 0L${(Math.cos(rad) * len).toFixed(1)} ${(Math.sin(rad) * len).toFixed(1)}`;
  };
  return (
    <ExitFade>
    <g transform={`scale(${pop.toFixed(3)})`}>
      {ticks
        ? [0, 90, 180, 270].map((a) => {
            const rad = (a * Math.PI) / 180;
            return <line key={a} x1={Math.cos(rad) * r * 0.72} y1={Math.sin(rad) * r * 0.72} x2={Math.cos(rad) * r * 0.84} y2={Math.sin(rad) * r * 0.84} stroke={color} strokeWidth={width * 0.8} strokeLinecap="round" />;
          })
        : null}
      <path d={hand(hA, r * 0.38)} stroke={color} strokeWidth={width * 1.15} strokeLinecap="round" fill="none" />
      <path d={hand(mA, r * 0.6)} stroke={color} strokeWidth={width} strokeLinecap="round" fill="none" />
      <circle r={width * 0.9} fill={color} />
    </g>
    </ExitFade>
  );
};
