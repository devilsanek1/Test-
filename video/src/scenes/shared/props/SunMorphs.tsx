// props/SunMorphs.tsx — the sun's meaningful morphs (P7). Overlays live in SUN-LOCAL coordinates (0, 0 = the disc centre)
// and scale with the radius r (110 baseline / 120 lane / 150 peaks / 165 S08), so they ride every core <Sun> behaviour:
//
//   <Sun cx={630} cy={800} r={150}>{(r) => <PowerGlyph r={r} glintAt={2.155} />}</Sun>        // bold frame-0 glyph
//   <SunPress at={2.28} cx={630} cy={800} r={150}><Sun .../></SunPress>                       // pressed like a button
//   <SunPress mode="release" at={0} .../>  <SunPress mode="reverse" at={55.0} .../>             // v3 frame 0 / S12 end
//   <Sun ...>{(r) => <RewindGlyph r={r} at={53.4} outAt={54.9} />}</Sun>                      // v3 S12 rewind button
//   <Sun ...>{(r) => <SunPie r={r} n={10} cream={3} spokesAt={8.97} slicesAt={9.82} />}</Sun>  // 7/10 (S02), n=3 cream=1 (S12)
//   <Sun ...>{(r) => <HoursClock r={r} at={33.9} spinAt={34.0} outAt={35.2} />}</Sun>          // S07 "hours"
//   <Sun ...>{(r) => <MinuteWedge r={r} at={39.2} />}</Sun>                                   // S08 "45 minutes" (peach sweep)
//   <WaxSeal from={[640, 820]} to={[420, 1290]} at={25.70} />                                 // S06, world coords
//   <SunGlowSteps cx={500} cy={690} r={110} at={69.1} />  (draw BEFORE the Sun: it sits behind)  // S13 "hope"
//   <Sun ...>{(r) => <HeatTicks r={r} at={22.0} />}</Sun>                                     // S05 heat ticks
//   <PowerGlyph x={430} y={1245} ring={70 * 0.373} width={10} color={palette.ink} colorAt={67.4} toColor={palette.cream}
//     fly={{at: 70.10, dur: 0.37, to: [630, 850, 56]}} />                                     // S13 pane glyph that docks on the sun
// No rays, no outlines on the disc, nothing fades: morphs draw on, pop, sweep or step.

import React from 'react';
import {palette} from '../../../lib/theme';
import {ease as E, lerp, osc, prog, springAt, springs, useTime} from '../../../lib/time';
import {Seed} from '../../../lib/rng';
import {Ink} from '../../../lib/Ink';
import {Fill} from '../../../lib/Fill';
import {ExitFade, useLook} from '../../../lib/exit';
import {useInkScale} from '../../../lib/inkComp';
import {arc, crown, line, smooth, Pt} from '../../../lib/sketch';
import {mat, XG} from '../../../lib/xf';
import {DEPTH_INK, pendulum, withOut} from './common';
import {stepTime} from './Shutter';
import {ElephantEmblem} from './Elephant';

const D2R = Math.PI / 180;
const polar = (a: number, rr: number): Pt => [Math.cos(a * D2R) * rr, Math.sin(a * D2R) * rr];

// ---------------------------------------------------------------- PowerGlyph

export type PowerGlyphProps = {
  /** Sun radius: the glyph is a ring of 56/150 r, 10/150 r wide (the S01 spec at r150). */
  r?: number;
  /** Explicit ring radius / stroke width (world px), overriding r. */
  ring?: number;
  width?: number;
  /** Centre (sun-local 0, 0 by default; world coords when used on a pane). */
  x?: number;
  y?: number;
  color?: string;
  /** Pops on (7 % overshoot). */
  at?: number;
  /** Draws on (ring, then the bar), 0.2 s. Omit = already drawn (the bold frame-0 glyph). */
  inkOnAt?: number;
  /** Two ink ticks spark beside the glyph (0.22 s). */
  glintAt?: number | number[];
  /** 1-frame colour switch (pane glyph: ink -> cream when the pane goes dark). */
  colorAt?: number;
  toColor?: string;
  /** Flight: from its own (x, y, ring) to [x, y, ring] over dur on a gentle arc (S13 pane -> sun dock). */
  fly?: {at: number; dur?: number; to: [number, number, number]; arc?: number};
  /** Shrinks away (0.12 s). */
  outAt?: number;
  seed?: Seed;
};

export const PowerGlyph: React.FC<PowerGlyphProps> = ({r = 150, ring: ringIn, width: wIn, x = 0, y = 0, color = palette.cream, at, inkOnAt, glintAt, colorAt, toColor, fly, outAt, seed = 'pwr'}) => {
  const t = useTime();
  const ks = useInkScale(); // camera ink compensation for the raw strokes below (lib/inkComp.tsx): 1 outside an <InkScale>
  if (at !== undefined && t < at) return null;
  const ring0 = ringIn ?? (r * 56) / 150;
  const w0 = wIn ?? (ring0 * 10) / 56;
  let ring = ring0;
  let cx = x;
  let cy = y;
  if (fly && t >= fly.at) {
    const q = E.inOutCubic(prog(t, fly.at, fly.dur ?? 0.37));
    const [tx, ty, tr] = fly.to;
    cx = lerp(x, tx, q);
    cy = lerp(y, ty, q) - Math.sin(Math.PI * q) * (fly.arc ?? 80);
    ring = lerp(ring, tr, q);
  }
  const w = (w0 * ring) / ring0;
  const col = colorAt !== undefined && toColor && t >= colorAt ? toColor : color;
  const pop = at !== undefined ? springAt(t, at, springs.pop) : 1;
  const outK = outAt !== undefined ? 1 - E.inCubic(prog(t, outAt, 0.12)) : 1;
  const k = pop * outK;
  if (k <= 0.001) return null;
  const ringD = arc(0, ring * 0.04, ring, ring, -55, 235, {seed: `${seed}/r`, wobble: 0.012});
  const barD = line(0, -ring * 1.22, 0, -ring * 0.12, {over: [0, 0], seed: `${seed}/b`, drift: 0.2});
  const glints = glintAt === undefined ? [] : Array.isArray(glintAt) ? glintAt : [glintAt];
  const ticks: React.ReactNode[] = [];
  for (const g of glints) {
    if (t >= g && t < g + 0.22) {
      const q = (t - g) / 0.22;
      const len = ring * 0.32 * Math.sin(Math.PI * q);
      const [ax, ay] = polar(-40, ring * 1.45);
      const [bx, by] = polar(-62, ring * 1.55);
      ticks.push(
        <path
          key={g}
          d={`M${ax} ${ay}l${(Math.cos(-40 * D2R) * len).toFixed(2)} ${(Math.sin(-40 * D2R) * len).toFixed(2)}M${bx} ${by}l${(Math.cos(-62 * D2R) * len * 0.8).toFixed(2)} ${(Math.sin(-62 * D2R) * len * 0.8).toFixed(2)}`}
          stroke={palette.ink}
          strokeWidth={Math.max(2, w * 0.45) * ks}
          strokeLinecap="round"
          fill="none"
        />,
      );
    }
  }
  return (
    <XG m={mat.compose(mat.translate(cx, cy), mat.scale(k))}>
      <Ink d={ringD} at={inkOnAt} dur={0.14} width={w} color={col} taper={false} exit={false} seed={`${seed}/ri`} vary={0} />
      <Ink d={barD} at={inkOnAt !== undefined ? inkOnAt + 0.1 : undefined} dur={0.1} width={w} color={col} taper={false} exit={false} seed={`${seed}/bi`} vary={0} />
      <ExitFade>{ticks}</ExitFade>
    </XG>
  );
};

// ---------------------------------------------------------------- RewindGlyph (S12)

export type RewindGlyphProps = {
  /** Sun radius: the glyph matches the PowerGlyph's size and weight (ring 56/150 r, stroke 10/150 r). */
  r?: number;
  /** Explicit glyph half-height (= the power ring radius) / stroke width (world px), overriding r. */
  ring?: number;
  width?: number;
  /** Centre (sun-local 0, 0 by default). */
  x?: number;
  y?: number;
  color?: string;
  /** Pops on (7 % overshoot). Omit = already there. */
  at?: number;
  /** Shrinks away (0.12 s), like the PowerGlyph. */
  outAt?: number;
  /** Optional nudges: the triangles jab left once (0.16 s) at each time (a "rewinding" tick). */
  nudgeAt?: number | number[];
  seed?: Seed;
};

/** The bold cream REWIND glyph: two left-pointing triangles (solid, corners rounded by a stroke of the PowerGlyph
 *  weight), the same button language as the power glyph. Swap: <PowerGlyph outAt={T} /> + <RewindGlyph at={T + 0.06}
 *  outAt={F} /> + <PowerGlyph at={F + 0.06} />. */
export const RewindGlyph: React.FC<RewindGlyphProps> = ({r = 150, ring: ringIn, width: wIn, x = 0, y = 0, color = palette.cream, at, outAt, nudgeAt, seed = 'rew'}) => {
  const t = useTime();
  const ks = useInkScale();
  if (at !== undefined && t < at) return null;
  const R = ringIn ?? (r * 56) / 150;
  const w = wIn ?? (R * 10) / 56;
  const pop = at !== undefined ? springAt(t, at, springs.pop) : 1;
  const outK = outAt !== undefined ? 1 - E.inCubic(prog(t, outAt, 0.12)) : 1;
  const k = pop * outK;
  if (k <= 0.001) return null;
  const nudges = nudgeAt === undefined ? [] : Array.isArray(nudgeAt) ? nudgeAt : [nudgeAt];
  let nx = 0;
  for (const n of nudges) if (t >= n && t < n + 0.16) nx -= R * 0.12 * Math.sin(Math.PI * ((t - n) / 0.16));
  // two triangles, each R * 0.95 wide and 2 * R * 0.78 tall, the second overlapping the first's base a little
  const hh = R * 0.8;
  const tw = R * 0.98;
  const gap = R * 0.06;
  const x0 = -tw + gap / 2;
  const tri = (tipX: number) => `M${tipX.toFixed(2)} 0L${(tipX + tw).toFixed(2)} ${(-hh).toFixed(2)}L${(tipX + tw).toFixed(2)} ${hh.toFixed(2)}Z`;
  const d = tri(x0 - tw * 0.02) + tri(x0 + tw - gap);
  return (
    <XG m={mat.compose(mat.translate(x + nx, y), mat.scale(k))}>
      <ExitFade x={0} y={0}>
        <path d={d} fill={color} stroke={color} strokeWidth={w * 0.8 * ks} strokeLinejoin="round" />
      </ExitFade>
    </XG>
  );
};

// ---------------------------------------------------------------- SunPress (+ ripple)

/** Press scale at t: squash to 1 - amount over 0.08 s, release over 0.2 s (slight overshoot). */
export function pressScale(t: number, at: number | number[] | undefined, amount = 0.12): number {
  const ats = at === undefined ? [] : Array.isArray(at) ? at : [at];
  let s = 1;
  for (const a of ats) {
    if (t < a || t > a + 0.3) continue;
    const down = prog(t, a, 0.08, E.outCubic);
    const up = prog(t, a + 0.08, 0.2, E.outBack(1.8));
    s *= 1 - amount * (down - up);
  }
  return s;
}

export type SunPressProps = {
  at?: number | number[];
  cx: number;
  cy: number;
  r: number;
  /** 0.12 = the press (S01 / S11); 0.06 = the S13 echo. */
  amount?: number;
  /** 'press' (uniform about the centre) | 'land' (S06: -10 % y anchored at the disc bottom, in place) |
   *  'release' (v3 frame 0: AT `at` the sun sits at the bottom of the squash with the ripple ring at its emission radius
   *  r, and releases over 0.2 s while the ripple runs out to r + 40; before `at` it holds that bottom state) |
   *  'reverse' (v3 S12 end: from `at` the release plays BACKWARDS over `dur`, stepped at `step` Hz, and HOLDS the bottom
   *  of the squash with the ripple at r: the frame-0 state). release / reverse take one `at`. */
  mode?: 'press' | 'land' | 'release' | 'reverse';
  /** Ink ripple ring r -> r + 40 over 0.2 s. Default true for 'press' / 'release' / 'reverse'. */
  ripple?: boolean;
  /** 'reverse': length of the backwards release (default 0.2 s = the release). */
  dur?: number;
  /** 'reverse': tape-step rate (Hz, default 12; 0 = smooth). */
  step?: number;
  width?: number;
  children?: React.ReactNode;
};

/** Release phase u (0 = the bottom of the squash, 1 = released) -> [scale, ripple radius offset, ripple width factor]. */
export function releaseState(u: number, amount = 0.12, grow = 40): [number, number, number] {
  const q = Math.max(0, Math.min(1, u));
  const up = E.outBack(1.8)(q);
  return [1 - amount * (1 - up), grow * E.outCubic(q), 1 - q];
}

/** Wrap a <Sun> (or <BigSun>) to press it like a power button. */
export const SunPress: React.FC<SunPressProps> = ({at, cx, cy, r, amount, mode = 'press', ripple, dur = 0.2, step = 12, width = DEPTH_INK.mid, children}) => {
  const t = useTime();
  const ks = useInkScale();
  const amt = amount ?? (mode === 'land' ? 0.1 : 0.12);
  if (mode === 'release' || mode === 'reverse') {
    const a0 = Array.isArray(at) ? at[0] : at;
    let u = 1;
    if (a0 !== undefined) {
      if (mode === 'release') u = t < a0 ? 0 : prog(t, a0, 0.2);
      else u = t < a0 ? 1 : 1 - Math.min(1, (stepTime(t, a0, step) - a0) / Math.max(1e-3, dur));
    }
    const [sc, rg, rw] = releaseState(u, amt);
    const showRipple = (ripple ?? true) && u < 1 && rw > 0.02;
    return (
      <>
        <XG m={sc === 1 ? mat.I : mat.about(mat.scale(sc), cx, cy)}>{children}</XG>
        {showRipple ? <circle cx={cx} cy={cy} r={r + rg} fill="none" stroke={palette.ink} strokeWidth={(width * rw + 0.01) * ks} /> : null}
      </>
    );
  }
  const s = pressScale(t, at, amt);
  const m = mode === 'land' ? mat.about(mat.scale(1 + (1 - s) * 0.5, s), cx, cy + r) : mat.about(mat.scale(s), cx, cy);
  const ats = at === undefined ? [] : Array.isArray(at) ? at : [at];
  return (
    <>
      <XG m={s === 1 ? mat.I : m}>{children}</XG>
      {(ripple ?? mode === 'press') ? ats.map((a) => <PressRipple key={a} cx={cx} cy={cy} r={r} at={a} width={width} />) : null}
    </>
  );
};

/** An ink ring that expands r -> r + grow and thins to nothing (0.2 s). */
export const PressRipple: React.FC<{cx: number; cy: number; r: number; at: number; grow?: number; dur?: number; width?: number; color?: string}> = ({cx, cy, r, at, grow = 40, dur = 0.2, width = DEPTH_INK.mid, color = palette.ink}) => {
  const t = useTime();
  const ks = useInkScale();
  if (t < at || t >= at + dur) return null;
  const q = E.outCubic((t - at) / dur);
  return <circle cx={cx} cy={cy} r={r + grow * q} fill="none" stroke={color} strokeWidth={(width * (1 - q) + 0.01) * ks} />;
};

// ---------------------------------------------------------------- SunPie

export type SunPieProps = {
  r: number;
  /** Number of slices (spokes). */
  n: number;
  /** Cream slices: a count (the LAST ones clockwise from 12 o'clock) or explicit indices. */
  cream?: number | number[];
  spokesAt?: number;
  /** Cream slices pop (with the +6 % pulse). */
  slicesAt?: number;
  sliceStagger?: number;
  /** Extra +6 % pulses of the cream slices. */
  pulseAt?: number | number[];
  /** The cream slices pop back to solid orange (shrink, 0.12 s, staggered 0.03); the spokes retract right after. */
  solidAt?: number;
  /** Spokes retract (0.15 s). Default: solidAt + 0.1 (a solid sun never keeps its spokes: wagon wheel). */
  spokesOutAt?: number;
  /** Spoke + rim ink width (default far 2.2: dividers, not a wheel). */
  width?: number;
  /** Colour of the "missing" slices (default cream). Each one carries an ink rim arc, so it never dissolves into a
   *  cream (golden) sky: the disc silhouette stays whole. */
  sliceColor?: string;
  seed?: Seed;
};

/** An open arc path (sun-local) from angle a0 to a1 (deg, clockwise) at radius rr. */
const rimArc = (a0: number, a1: number, rr: number) => {
  const [x0, y0] = polar(a0, rr);
  const [x1, y1] = polar(a1, rr);
  return `M${x0.toFixed(2)} ${y0.toFixed(2)}A${rr} ${rr} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${x1.toFixed(2)} ${y1.toFixed(2)}`;
};

const sector = (a0: number, a1: number, rr: number) => {
  const [x0, y0] = polar(a0, rr);
  const [x1, y1] = polar(a1, rr);
  return `M0 0L${x0.toFixed(2)} ${y0.toFixed(2)}A${rr} ${rr} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${x1.toFixed(2)} ${y1.toFixed(2)}Z`;
};

export const SunPie: React.FC<SunPieProps> = ({r, n, cream = 0, spokesAt, slicesAt, sliceStagger = 0, pulseAt, solidAt, spokesOutAt: spokesOutIn, width = DEPTH_INK.far, sliceColor = palette.cream, seed = 'pie'}) => {
  const spokesOutAt = spokesOutIn ?? (solidAt !== undefined ? solidAt + 0.1 : undefined);
  const t = useTime();
  const ks = useInkScale();
  const idx = Array.isArray(cream) ? cream : Array.from({length: cream}, (_, i) => n - cream + i);
  const step = 360 / n;
  const out: React.ReactNode[] = [];
  const pulses = pulseAt === undefined ? [] : Array.isArray(pulseAt) ? pulseAt : [pulseAt];
  idx.forEach((i, j) => {
    const sa = slicesAt === undefined ? undefined : slicesAt + j * sliceStagger;
    if (sa !== undefined && t < sa) return;
    // pop with the +6 % overshoot (snappy spring), then optional pulses
    let k = sa !== undefined ? springAt(t, sa, {stiffness: 420, damping: 25, mass: 1}) : 1;
    for (const pa of pulses) if (t >= pa && t < pa + 0.22) k *= 1 + 0.06 * Math.sin(Math.PI * ((t - pa) / 0.22));
    if (solidAt !== undefined) k *= 1 - E.inCubic(prog(t, solidAt + j * 0.03, 0.12));
    if (k <= 0.002) return;
    const a0 = -90 + i * step;
    const mid = polar(a0 + step / 2, r * 0.45);
    out.push(
      <XG key={`s${i}`} m={mat.about(mat.scale(k), mid[0] * 0.2, mid[1] * 0.2)}>
        <Fill d={sector(a0 + 0.6, a0 + step - 0.6, r * 0.985)} color={sliceColor} offset={false} mode="none" seed={`${seed}/s${i}`} lookExempt />
        <path d={rimArc(a0 + 0.6, a0 + step - 0.6, r * 0.985 - (width * ks) / 2)} fill="none" stroke={palette.ink} strokeWidth={width * ks} strokeLinecap="round" />
      </XG>,
    );
  });
  if (spokesAt === undefined || t >= spokesAt) {
    const outQ = spokesOutAt !== undefined ? prog(t, spokesOutAt, 0.15, E.inCubic) : 0;
    if (outQ < 1) {
      let d = '';
      for (let i = 0; i < n; i++) {
        const [ex, ey] = polar(-90 + i * step, r * (1 - outQ) + 0.01);
        d += `M0 0L${ex.toFixed(2)} ${ey.toFixed(2)}`;
      }
      out.push(<Ink key="spokes" d={d} at={spokesAt} dur={0.15} width={width} taper={false} exit={false} vary={0} seed={`${seed}/sp`} />);
    }
  }
  return <>{out}</>;
};

// ---------------------------------------------------------------- HoursClock (S07)

export type HoursClockProps = {
  r: number;
  at?: number;
  spinAt?: number;
  spinDur?: number;
  turns?: number;
  hourSteps?: number;
  outAt?: number;
  color?: string;
  seed?: Seed;
};

/** Cream ring (0.82 r) + a long minute hand spinning `turns` over spinDur + a short hour hand stepping on. No numerals. */
export const HoursClock: React.FC<HoursClockProps> = ({r, at, spinAt, spinDur = 1.1, turns = 3.5, hourSteps = 4, outAt, color = palette.cream, seed = 'clock'}) => {
  const t = useTime();
  const ks = useInkScale();
  if (at !== undefined && t < at) return null;
  const pop = at !== undefined ? springAt(t, at, springs.pop) : 1;
  const outK = outAt !== undefined ? 1 - E.inBack(1.4)(prog(t, outAt, 0.16)) : 1;
  const k = Math.max(0, pop * outK);
  if (k <= 0.002) return null;
  const R = r * 0.818;
  const sw = r * 0.07;
  const q = spinAt !== undefined ? prog(t, spinAt, spinDur, E.inOutSine) : 0;
  const mA = -90 + 360 * turns * q;
  let hA = -90 + 60;
  if (spinAt !== undefined) {
    for (let i = 0; i < hourSteps; i++) {
      const ts = spinAt + ((i + 0.6) * spinDur) / hourSteps;
      hA += 30 * E.outBack(2.2)(prog(t, ts, 0.09));
    }
  }
  const hand = (a: number, len: number) => `M0 0L${(Math.cos(a * D2R) * len).toFixed(2)} ${(Math.sin(a * D2R) * len).toFixed(2)}`;
  let ticks = '';
  for (const a of [-90, 0, 90, 180]) {
    const [x0, y0] = polar(a, R * 0.72);
    const [x1, y1] = polar(a, R * 0.86);
    ticks += `M${x0.toFixed(1)} ${y0.toFixed(1)}L${x1.toFixed(1)} ${y1.toFixed(1)}`;
  }
  return (
    <ExitFade x={0} y={0}>
      <g transform={`scale(${k.toFixed(4)})`}>
        <circle r={R} fill="none" stroke={color} strokeWidth={sw * ks} />
        <path d={ticks} stroke={color} strokeWidth={sw * 0.6 * ks} strokeLinecap="round" />
        <path d={hand(hA, R * 0.48)} stroke={color} strokeWidth={sw * 1.15 * ks} strokeLinecap="round" />
        <path d={hand(mA, R * 0.78)} stroke={color} strokeWidth={sw * 0.8 * ks} strokeLinecap="round" />
        <circle r={sw * 0.95 * ks} fill={color} />
      </g>
    </ExitFade>
  );
};

// ---------------------------------------------------------------- MinuteWedge (S08)

export type MinuteWedgeProps = {
  r: number;
  at?: number;
  dur?: number;
  /** Swept fraction of the hour (3/4 = 45 min). */
  fraction?: number;
  outAt?: number;
  width?: number;
  /** Swept-sector colour. Default peach: it contrasts with the day (mint), golden (cream) and dusk (sage) skies AND
   *  with the orange disc, so "3/4 swept" is the dominant shape whatever the sky. */
  sweepColor?: string;
  seed?: Seed;
};

/** A clock face on the sun: 4 ink quarter ticks pop, then one minute hand sweeps a peach sector of `fraction` (0.61 s
 *  ease-out) with an ink rim arc following it, and ticks. The disc silhouette stays whole (thin orange ring outside). */
export const MinuteWedge: React.FC<MinuteWedgeProps> = ({r, at, dur = 0.61, fraction = 0.75, outAt, width, sweepColor = palette.peach, seed = 'wedge'}) => {
  const t = useTime();
  const ks = useInkScale();
  if (at !== undefined && t < at) return null;
  const q = at !== undefined ? prog(t, at, dur, E.outCubic) : 1;
  const done = at === undefined || t >= at + dur;
  const tick = done && at !== undefined ? 3 * Math.sin(Math.min(1, (t - at - dur) / 0.12) * Math.PI) : 0;
  const outK = outAt !== undefined ? 1 - E.inCubic(prog(t, outAt, 0.14)) : 1;
  if (outK <= 0.002) return null;
  const end = -90 + 360 * fraction * q;
  const R = r * 0.9;
  const w = width ?? Math.max(DEPTH_INK.front, r * 0.035);
  const [hx, hy] = polar(end + tick, R * 0.92);
  // quarter ticks (12, 3, 6, 9) pop with the 7 % spring, 0.04 s apart
  let ticks = '';
  [-90, 0, 90, 180].forEach((a, i) => {
    const k = at === undefined ? 1 : springAt(t, at + i * 0.04, springs.pop);
    if (k <= 0.01) return;
    const [x0, y0] = polar(a, R * (1 - 0.2 * k));
    const [x1, y1] = polar(a, R * 0.97);
    ticks += `M${x0.toFixed(1)} ${y0.toFixed(1)}L${x1.toFixed(1)} ${y1.toFixed(1)}`;
  });
  const [sx, sy] = polar(-90, R);
  return (
    <ExitFade x={0} y={0}>
      <g transform={`scale(${outK.toFixed(4)})`}>
        {q > 0.003 ? (
          <>
            <path d={sector(-90, Math.max(-89.9, end), R)} fill={sweepColor} />
            <path d={`M0 0L${sx.toFixed(2)} ${sy.toFixed(2)}` + rimArc(-90, Math.max(-89.9, end), R)} fill="none" stroke={palette.ink} strokeWidth={w * 0.7 * ks} strokeLinecap="round" strokeLinejoin="round" />
          </>
        ) : null}
        {ticks ? <path d={ticks} stroke={palette.ink} strokeWidth={w * 0.8 * ks} strokeLinecap="round" fill="none" /> : null}
        <path d={`M0 0L${hx.toFixed(2)} ${hy.toFixed(2)}`} stroke={palette.ink} strokeWidth={w * ks} strokeLinecap="round" />
        <circle r={w * 1.3 * ks} fill={palette.ink} />
      </g>
    </ExitFade>
  );
};

// ---------------------------------------------------------------- WaxSeal (S06)

export type WaxSealProps = {
  /** World point where it pops out of the sun (on the disc). */
  from: Pt;
  /** World point where it lands (the envelope's seal point). */
  to: Pt;
  at: number;
  /** Travel time along the dotted arc. Default 0.33. */
  dur?: number;
  /** Arc apex height above the higher end (px). Default 120. */
  arc?: number;
  r?: number;
  /** Keep the dotted trail after landing (default: it retracts in 0.25 s). */
  keepTrail?: boolean;
  seed?: Seed;
};

/** The film's one allowed orange prop: a wax seal pops out of the sun, drops along a dotted ink arc onto the envelope,
 *  lands with a squash and settles with a pendulum wobble. */
const WaxSealBase: React.FC<WaxSealProps> = ({from, to, at, dur = 0.33, arc: arcH = 120, r = 16, keepTrail = false, seed = 'seal'}) => {
  const t = useTime();
  if (t < at) return null;
  const popT = 0.1;
  const apexY = Math.min(from[1], to[1]) - arcH;
  const P = (u: number): Pt => {
    const x = lerp(from[0], to[0], u);
    // quadratic through from -> apex -> to
    const c = 2 * apexY - (from[1] + to[1]) / 2;
    const y = (1 - u) * (1 - u) * from[1] + 2 * (1 - u) * u * c + u * u * to[1];
    return [x, y];
  };
  const u = prog(t, at + popT, dur, E.inQuad);
  const [sx, sy] = t < at + popT ? from : P(u);
  const landT = at + popT + dur;
  const pop = t < at + popT ? 0.3 + 0.7 * E.outCubic((t - at) / popT) : 1;
  const sq = t >= landT && t < landT + 0.14 ? 1 - 0.18 * Math.sin(((t - landT) / 0.14) * Math.PI) : 1;
  const rot = pendulum(t, landT, -16, 0.5, 0.8);
  // dotted trail
  const dots: React.ReactNode[] = [];
  const retract = keepTrail ? 0 : prog(t, landT + 0.05, 0.25);
  const n = 18;
  for (let i = 1; i < n; i++) {
    const v = i / n;
    if (v > u || v < retract) continue;
    const [dx, dy] = P(v);
    dots.push(<circle key={i} cx={dx} cy={dy} r={2.1} fill={palette.ink} />);
  }
  const blobD = crown(0, 0, r, r, {seed: `${seed}/c`, bumps: 8, round: 0.72});
  return (
    <>
      <ExitFade>{dots}</ExitFade>
      <XG m={mat.compose(mat.translate(sx, sy), mat.rotate(rot), mat.scale(pop * (2 - sq), pop * sq))}>
        <Fill d={blobD} color={palette.sun} offset={[1.5, 1.5]} seed={`${seed}/f`} lookExempt />
        <Ink d={arc(0, 0, r * 0.64, r * 0.64, -20, 300, {seed: `${seed}/i`})} width={1.6} taper={false} seed={`${seed}/i`} />
        <ElephantEmblem size={r * 1.05} mode="solid" color={palette.ink} seed={`${seed}/e`} />
      </XG>
    </>
  );
};

// ---------------------------------------------------------------- SunGlowSteps (S13)

/** Opaque stepped flat discs BEHIND the sun (render before it): default peach at 1.25 r and cream at 1.5 r. They step
 *  out ring by ring (outBack, 0.22 s, 0.08 s apart) and step back in at outAt. */
export const SunGlowSteps: React.FC<{cx: number; cy: number; r: number; at?: number; outAt?: number; rings?: {k: number; color: string}[]; opacity?: number}> = ({
  cx,
  cy,
  r,
  at,
  outAt,
  rings = [
    {k: 1.25, color: palette.peach},
    {k: 1.5, color: palette.cream},
  ],
  opacity,
}) => {
  const t = useTime();
  const look = useLook();
  if (at !== undefined && t < at) return null;
  if (look.fills !== 'color') return null; // light only exists in the coloured state
  const out: React.ReactNode[] = [];
  for (let i = rings.length - 1; i >= 0; i--) {
    const g = rings[i];
    const k = at === undefined ? 1 : E.outBack(1.6)(prog(t, at + i * 0.08, 0.22));
    const ko = outAt !== undefined ? 1 - E.inCubic(prog(t, outAt + (rings.length - 1 - i) * 0.05, 0.15)) : 1;
    const rr = r + (g.k * r - r) * k * ko;
    if (rr > r + 0.5) out.push(<circle key={i} cx={cx} cy={cy} r={rr} fill={g.color} opacity={opacity} />);
  }
  return <ExitFade x={cx} y={cy}>{out}</ExitFade>;
};

// ---------------------------------------------------------------- HeatTicks (S05)

/** Three wavy ink ticks above the sun (sun-local), drawn on staggered, then shimmering in place. */
export const HeatTicks: React.FC<{r: number; at?: number; outAt?: number; width?: number; seed?: Seed}> = ({r, at, outAt, width = DEPTH_INK.mid, seed = 'heat'}) => {
  const t = useTime();
  if (at !== undefined && t < at) return null;
  if (outAt !== undefined && t >= outAt) return null;
  const out: React.ReactNode[] = [];
  [-0.42, 0, 0.42].forEach((fx, i) => {
    const x = fx * r;
    const y0 = -r - 16 - (i === 1 ? 10 : 0);
    const h = 34;
    const d = smooth([
      [x, y0],
      [x + 5, y0 - h * 0.33],
      [x - 5, y0 - h * 0.66],
      [x, y0 - h],
    ]);
    const dy = osc(t, 1.6, i * 2) * 2.5;
    out.push(
      <XG key={i} m={mat.translate(0, dy)}>
        <Ink d={d} at={at !== undefined ? at + i * 0.06 : undefined} width={width} seed={`${seed}/${i}`} />
      </XG>,
    );
  });
  return <>{out}</>;
};

// build-out (outAt / outDur) for props that have no own exit
export const WaxSeal = withOut(WaxSealBase, 'WaxSeal');
