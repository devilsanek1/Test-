// kit/Ambient.tsx: THE AMBIENT LIFE every v2 panel uses, so the whole film lives the same way (owner, 2026-10-26: "every
// scene must feel alive"; "HOLD" means the CAMERA holds, the world keeps living). Draft motion for G5: simple, flat,
// deterministic in t (scene seconds), always on, looping forever; no opacity fades (things move, step, pop or wrap).
//   <Clouds>      flat clouds drifting across a region (wrap), with a lit underside
//   <Flock>       a loose flock crossing a region every `period` s (stepped wing flaps), plus <Bird> (one glyph)
//   <Steam>       wisps rising off a mug / a pot (dashes travelling up a wavy path)
//   <DustMotes>   motes drifting in a lamp's light (an ellipse)
//   <WallClock>   a wall clock; the second hand ticks every second (a 3 screen-px stroke: it reads on a phone)
//   <Sway>        rotates its children about a pivot by a slow seeded sway (plant leaves, a hanging cord)
//   <CandleFlame> a stepped flicker
//   <LampMoth>    a pale moth circling a lamp (O1's moth, generalised: the nook lamps P2 / P4 / P13 and P6's lamp)
//   <Live>        gate for raw-SVG life: appears with `at` (or with the BuildWave's colour), shrinks away in an un-build
//   helpers       onOff (a seeded light switching on / off), swayAt, loopT, stepT
// Every rate has a parameter (`speed`, `period`, `rate`): G6 raises the density to >= 5 medium events / s.

import React, {useContext} from 'react';
import {blob, ellipse, line, polyPath, roundRect, smooth} from '../../../lib/sketch';
import {rand, rng} from '../../../lib/rng';
import {useTime} from '../../../lib/time';
import {mat, useXf, XG} from '../../../lib/xf';
import {ExitFade} from '../../../lib/exit';
import {useInkScale} from '../../../lib/inkComp';
import {CC} from '../palette';
import {applyM, At, b, BuildWaveCtx, Fill, fillAt, Ink, Pt, W} from './util';

// ---------------------------------------------------------------- time helpers

/** t wrapped into [0, period). */
export const loopT = (t: number, period: number, phase = 0) => ((((t + phase) % period) + period) % period);
/** Time held on drawings: `fps` drawings per second (house: 8-12 for drawn motion; the camera stays smooth). */
export const stepT = (t: number, fps = 12) => Math.floor(t * fps + 1e-6) / fps;
/** A slow seeded sway: amp x sin(2 pi hz t + phase(seed)). */
export const swayAt = (t: number, seed: string, amp = 1, hz = 0.25) => amp * Math.sin(2 * Math.PI * hz * t + rand(seed, 'sway') * 6.283);
/** A light that switches: on for `duty` of every `period` s, its phase seeded. `base` = its state when it never switches. */
export const onOff = (t: number, seed: string, period = 6, duty = 0.6) => loopT(t, period, rand(seed, 'ph') * period) < period * duty;

// ---------------------------------------------------------------- the gate for raw-SVG life

/** Raw-SVG ambient pieces: hidden before `at`; inside a BuildWave (the opening) with no `at`, they appear when the
 *  colour wave reaches `c` (canvas px); they shrink about (x, y) = c in an un-build (lib/exit ExitFade, never a fade). */
export const Live: React.FC<{at?: At; c: Pt; children?: React.ReactNode}> = ({at, c, children}) => {
  const t = useTime();
  const w = useContext(BuildWaveCtx);
  const m = useXf();
  if (at !== undefined && t < at) return null;
  if (at === undefined && w) {
    const wc = applyM(mat.mul(w.uncam ?? mat.I, m), c[0], c[1]);
    if (t < w.colourAt(wc)) return null;
  }
  return (
    <ExitFade x={c[0]} y={c[1]}>
      {children}
    </ExitFade>
  );
};

// ---------------------------------------------------------------- clouds

export type CloudsProps = {
  /** The region the clouds drift through (canvas px); clip it yourself (a window's glass). */
  x: number;
  y: number;
  w: number;
  h: number;
  /** How many clouds (default 3). */
  n?: number;
  /** Drift speed px/s (default 22; + = to the right): >= 20 so the drift reads by eye between two glances. */
  speed?: number;
  /** Cloud size factor (1 = ~150 px long). */
  size?: number;
  color?: string;
  lit?: string;
  seed?: string;
  at?: At;
};

/** One flat cloud: a stack of bumps on a flat base, the lit underside one step lighter (StyleDesk's flat bars, grown up). */
export const cloudPath = (cx: number, cy: number, L: number, seed: string): {body: string; under: string} => {
  const r = rng(`cloud/${seed}`);
  const h = L * 0.16;
  const n = 3 + Math.floor(r.range(0, 2.99));
  let body = roundRect(cx - L / 2, cy - h, L, h, h / 2);
  for (let i = 0; i < n; i++) {
    const u = (i + 0.5) / n;
    const bx = cx - L / 2 + L * (0.18 + 0.64 * u) + r.jitter(L * 0.04);
    const br = L * r.range(0.11, 0.19) * (i === Math.floor(n / 2) ? 1.25 : 1);
    body += blob(bx, cy - h - br * 0.35, br, br * 0.82, {seed: `${seed}/b${i}`, wobble: 0.02});
  }
  const under = roundRect(cx - L * 0.42, cy - h * 0.42, L * 0.84, h * 0.42, h * 0.21);
  return {body, under};
};

export const Clouds: React.FC<CloudsProps> = ({x, y, w, h, n = 3, speed = 22, size = 1, color = CC.cloud, lit = CC.cloudLit, seed = 'clouds', at}) => {
  const t = useTime();
  const r = rng(`clouds/${seed}`);
  const out: React.ReactNode[] = [];
  for (let i = 0; i < n; i++) {
    const L = 150 * size * r.range(0.7, 1.35);
    const span = w + L * 1.2;
    const x0 = r.range(0, span);
    const cy = y + h * ((i + 0.5) / n) + r.jitter(h * 0.12);
    const sp = speed * r.range(0.75, 1.25);
    const cx = x - L * 0.6 + ((((x0 + sp * t) % span) + span) % span);
    const c = cloudPath(cx, cy, L, `${seed}/${i}`);
    out.push(
      <g key={i}>
        <path d={c.body} fill={color} />
        <path d={c.under} fill={lit} />
      </g>,
    );
  }
  return (
    <Live at={at} c={[x + w / 2, y + h / 2]}>
      {out}
    </Live>
  );
};

// ---------------------------------------------------------------- birds

/** One bird glyph (a far plane: no outline), wings up (flap 1) or down (flap 0), span 2 s px: the centre line of the
 *  wings (birdShape fills it out). */
export const birdPath = (x: number, y: number, s: number, flap: number): string => {
  const up = flap > 0.5;
  const tipY = up ? -0.75 * s : 0.15 * s;
  const midY = up ? -0.42 * s : -0.38 * s;
  return `M${x - s} ${y + tipY}Q${x - 0.45 * s} ${y + midY} ${x} ${y}Q${x + 0.45 * s} ${y + midY} ${x + s} ${y + tipY}`;
};
/** The FILLED bird (thin moving lines vanish at phone size; filled shapes read): the wing line thickened toward the
 *  body (0.26 s at the middle), tips sharp, a small body under the joint. */
export const birdShape = (x: number, y: number, s: number, flap: number): string => {
  const up = flap > 0.5;
  const tipY = up ? -0.75 * s : 0.15 * s;
  const midY = up ? -0.42 * s : -0.38 * s;
  const th = 0.26 * s;
  return (
    `M${x - s} ${y + tipY}Q${x - 0.45 * s} ${y + midY} ${x} ${y}Q${x + 0.45 * s} ${y + midY} ${x + s} ${y + tipY}` +
    `Q${x + 0.42 * s} ${y + midY + th} ${x + 0.1 * s} ${y + th}L${x} ${y + th * 1.35}L${x - 0.1 * s} ${y + th}Q${x - 0.42 * s} ${y + midY + th} ${x - s} ${y + tipY}Z`
  );
};

export const Bird: React.FC<{x: number; y: number; s?: number; flap?: number; color?: string; width?: number}> = ({x, y, s = 10, flap = 0, color = CC.anchor, width}) => {
  const k = useInkScale();
  return <path d={birdShape(x, y, s, flap)} fill={color} stroke={color} strokeWidth={(width ?? Math.max(1.2, s * 0.12)) * k} strokeLinejoin="round" />;
};

export type FlockProps = {
  /** The region they cross (canvas px): they enter at one side and leave at the other. */
  x: number;
  y: number;
  w: number;
  h: number;
  /** Birds per pass (default 7). */
  n?: number;
  /** A pass starts every `period` s (default 4.2) and takes `dur` s (default 2.4) to cross (the AD: ~2 s, readable). */
  period?: number;
  dur?: number;
  /** First pass start (scene s; default -1.5: already crossing on the cut). */
  offset?: number;
  /** +1 left to right (default), -1 right to left. */
  dir?: 1 | -1;
  /** Half wing span px (default 14: it reads at phone size; a near flock 18-24). */
  size?: number;
  color?: string;
  /** One extra single bird on its own slower cycle (default true). */
  single?: boolean;
  seed?: string;
  at?: At;
};

export const Flock: React.FC<FlockProps> = ({x, y, w, h, n = 7, period = 4.2, dur = 2.4, offset = -1.5, dir = 1, size = 14, color = CC.anchor, single = true, seed = 'flock', at}) => {
  const t = useTime();
  const out: React.ReactNode[] = [];
  const pass = Math.floor((t - offset) / period);
  // the current pass and the one before (a long crossing may overlap the next start)
  for (const k of [pass - 1, pass]) {
    const t0 = offset + k * period;
    const p = (t - t0) / dur;
    if (p < 0 || p > 1) continue;
    const r = rng(`${seed}/pass${k}`);
    const yBase = y + h * r.range(0.2, 0.8);
    const climb = r.jitter(h * 0.25);
    for (let i = 0; i < n; i++) {
      const lag = (i % 2 === 0 ? 1 : -1) * Math.ceil(i / 2);
      const bx0 = -size * 6 - Math.abs(lag) * size * 3.2 - r.range(0, size * 2);
      const by0 = lag * size * 1.5 + r.jitter(size);
      const travel = w + size * 24;
      const px = dir === 1 ? x + bx0 + travel * p : x + w - bx0 - travel * p;
      const py = yBase + by0 + climb * p + Math.sin((t + i) * 2.4) * size * 0.25;
      const flap = Math.floor((t + rand(seed, `f${i}`)) * 8) % 2;
      out.push(<Bird key={`${k}/${i}`} x={px} y={py} s={size * (0.85 + 0.3 * rand(seed, `s${i}`))} flap={flap} color={color} />);
    }
  }
  if (single) {
    const sp = period * 1.7;
    const k = Math.floor((t - offset - period * 0.45) / sp);
    const t0 = offset + period * 0.45 + k * sp;
    const p = (t - t0) / (dur * 1.5);
    if (p >= 0 && p <= 1) {
      const r = rng(`${seed}/one${k}`);
      const yy = y + h * r.range(0.1, 0.9) + Math.sin(t * 1.7) * size * 0.4;
      const px = dir === 1 ? x + w + size * 3 - (w + size * 6) * p : x - size * 3 + (w + size * 6) * p;
      out.push(<Bird key="one" x={px} y={yy} s={size * 0.9} flap={Math.floor(t * 6) % 2} color={color} />);
    }
  }
  return (
    <Live at={at} c={[x + w / 2, y + h / 2]}>
      {out}
    </Live>
  );
};

// ---------------------------------------------------------------- steam

export type SteamProps = {
  /** Base (canvas px): the mug's rim centre. */
  x: number;
  y: number;
  /** Rise (px, default 70) and half width of the wave (default 7). */
  h?: number;
  amp?: number;
  /** Wisps (default 2), stroke width (default max(3.2, h / 22): it reads at phone size), colour (default ink). */
  n?: number;
  width?: number;
  color?: string;
  /** Rise speed factor (default 1). */
  rate?: number;
  seed?: string;
  at?: At;
};

/** Steam: each wisp is a wavy path whose dashes travel upward and wrap (flat, no fade). */
export const Steam: React.FC<SteamProps> = ({x, y, h = 70, amp = 7, n = 2, width, color = CC.ink, rate = 1, seed = 'steam', at}) => {
  const t = useTime();
  const k = useInkScale();
  const sw = (width ?? Math.max(3.2, h / 22)) * k;
  const out: React.ReactNode[] = [];
  for (let i = 0; i < n; i++) {
    const sx = x + (i - (n - 1) / 2) * amp * 2.6;
    const ph = rand(seed, `p${i}`) * 6.28;
    const pts: Pt[] = [];
    for (let j = 0; j <= 6; j++) pts.push([sx + Math.sin(j * 1.15 + ph + t * 1.3) * amp * (0.5 + j / 10), y - (h * j) / 6]);
    const d = smooth(pts);
    const seg = h * 0.42;
    const off = -((t * 38 * rate + rand(seed, `o${i}`) * 200) % (seg * 2.4));
    out.push(<path key={i} d={d} fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeDasharray={`${seg.toFixed(1)} ${(seg * 1.4).toFixed(1)}`} strokeDashoffset={off.toFixed(1)} />);
  }
  return (
    <Live at={at} c={[x, y - h / 2]}>
      {out}
    </Live>
  );
};

// ---------------------------------------------------------------- dust motes in a lamp's light

export type DustMotesProps = {
  /** The light's ellipse (canvas px). */
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  n?: number;
  /** Mote radius px (default 3.6) and colour (default the paper white, a step lighter than the pool). */
  r?: number;
  color?: string;
  /** Drift speed factor (default 1). */
  rate?: number;
  /** Rects [x, y, w, h] (canvas px) the motes never cross (a mote there is not drawn): keep them off lettering (the
   *  clause: a white mote on the "e" of Google read "Googlz" at phone size). */
  avoid?: [number, number, number, number][];
  seed?: string;
  at?: At;
};

export const DustMotes: React.FC<DustMotesProps> = ({cx, cy, rx, ry, n = 10, r = 3.6, color = CC.paper, rate = 1, avoid, seed = 'motes', at}) => {
  const t = useTime() * rate;
  const g = rng(`motes/${seed}`);
  const k = useInkScale();
  const out: React.ReactNode[] = [];
  for (let i = 0; i < n; i++) {
    const a0 = g.range(0, 6.28);
    const rr = Math.sqrt(g.range(0.05, 0.95));
    const wx = g.range(0.12, 0.3);
    const wy = g.range(0.1, 0.24);
    const rise = g.range(0.03, 0.07);
    // a slow wander inside the unit disk, rising and wrapping
    const u = rr * Math.cos(a0 + t * wx) + 0.18 * Math.sin(t * wy * 2.1 + i);
    let v = rr * Math.sin(a0 + t * wy) - ((t * rise + g.range(0, 2)) % 2) + 1;
    if (v < -1) v += 2;
    const px = cx + u * rx * 0.92;
    const py = cy + v * ry * 0.92;
    if (avoid && avoid.some(([ax, ay, aw, ah]) => px > ax - r && px < ax + aw + r && py > ay - r && py < ay + ah + r)) continue;
    out.push(<circle key={i} cx={px} cy={py} r={r * g.range(0.7, 1.25) * Math.max(0.7, k)} fill={color} />);
  }
  return (
    <Live at={at} c={[cx, cy]}>
      {out}
    </Live>
  );
};

// ---------------------------------------------------------------- a wall clock

export type WallClockProps = {
  cx: number;
  cy: number;
  /** Radius px (default 40). Reads from r 26. */
  r?: number;
  /** The time it shows at t 0, in minutes after midnight (default 19:42, evening). */
  startMin?: number;
  rim?: string;
  at?: At;
  seed?: string;
};

export const WallClock: React.FC<WallClockProps> = ({cx, cy, r = 40, startMin = 19 * 60 + 42, rim = CC.trim, at, seed = 'clock'}) => {
  const t = useTime();
  const k = useInkScale();
  const sec = Math.floor(Math.max(0, t) + 1e-6) + 17;
  const min = startMin + sec / 60;
  // the second hand ticks at 1 Hz and READS at phone size: a straight 3 screen-px stroke with a short tail (lane L2's
  // SecondHand overlay, folded back by the assembler)
  const sa = (((sec % 60) * 6 - 90) * Math.PI) / 180;
  const hand = (deg: number, len: number) => {
    const a = ((deg - 90) * Math.PI) / 180;
    return line(cx, cy, cx + Math.cos(a) * len, cy + Math.sin(a) * len, {over: [0, 0], seed: `${seed}/h${len.toFixed(0)}`});
  };
  const ticks = Array.from({length: 12}, (_, i) => {
    const a = (i * 30 * Math.PI) / 180;
    return line(cx + Math.cos(a) * r * 0.74, cy + Math.sin(a) * r * 0.74, cx + Math.cos(a) * r * (i % 3 === 0 ? 0.58 : 0.66), cy + Math.sin(a) * r * (i % 3 === 0 ? 0.58 : 0.66), {over: [0, 0], seed: `${seed}/t${i}`});
  }).join('');
  const ink = r >= 50 ? W.mid : W.far;
  return (
    <>
      <Fill d={blob(cx, cy, r, r, {seed: `${seed}/rim`, wobble: 0.01})} color={rim} at={fillAt(at)} seed={`${seed}/rimF`} />
      <Fill d={blob(cx, cy, r * 0.84, r * 0.84, {seed: `${seed}/face`, wobble: 0.01})} color={CC.paper} offset={false} at={fillAt(at, 0.02)} />
      <Ink d={ellipse(cx, cy, r, r, {seed: `${seed}/rimI`, wobble: 0.01})} width={ink} at={at} />
      <Ink d={ticks} width={W.hair} at={b(at, 0.06)} />
      <Ink d={hand(((min / 60) % 12) * 30, r * 0.42)} width={ink + 0.6} at={b(at, 0.08)} taper={false} />
      <Ink d={hand((min % 60) * 6, r * 0.62)} width={ink} at={b(at, 0.08)} taper={false} />
      <Live at={at === undefined ? undefined : at + 0.1} c={[cx, cy]}>
        <path d={`M${cx - Math.cos(sa) * r * 0.16} ${cy - Math.sin(sa) * r * 0.16}L${cx + Math.cos(sa) * r * 0.72} ${cy + Math.sin(sa) * r * 0.72}`} stroke={CC.trim} strokeWidth={3 * k} strokeLinecap="round" fill="none" />
        <circle cx={cx} cy={cy} r={Math.max(3.4 * k, r * 0.07)} fill={CC.anchor} />
      </Live>
    </>
  );
};

// ---------------------------------------------------------------- sway

/** Rotates children about (x, y) by a slow sway (deg): plant leaves, a hanging pot, a blind's cord. */
export const Sway: React.FC<{x: number; y: number; amp?: number; hz?: number; seed?: string; children?: React.ReactNode}> = ({x, y, amp = 2, hz = 0.22, seed = 'sway', children}) => {
  const t = useTime();
  const a = swayAt(t, seed, amp, hz);
  return <XG m={mat.about(mat.rotate(a), x, y)}>{children}</XG>;
};

// ---------------------------------------------------------------- a candle flame

export const CandleFlame: React.FC<{x: number; y: number; h?: number; seed?: string; at?: At}> = ({x, y, h = 22, seed = 'flame', at}) => {
  const t = stepT(useTime(), 8);
  const k = useInkScale();
  const lean = Math.sin(t * 5.1 + rand(seed, 'l') * 6) * h * 0.12;
  const hh = h * (0.9 + 0.12 * Math.sin(t * 7.3));
  const d = `M${x} ${y}Q${x - h * 0.32} ${y - hh * 0.35} ${x + lean} ${y - hh}Q${x + h * 0.32} ${y - hh * 0.35} ${x} ${y}Z`;
  return (
    <Live at={at} c={[x, y]}>
      <path d={d} fill={CC.flame} stroke={CC.ink} strokeWidth={W.hair * k} strokeLinejoin="round" />
      <path d={`M${x} ${y - 2}Q${x - h * 0.12} ${y - hh * 0.3} ${x + lean * 0.5} ${y - hh * 0.55}Q${x + h * 0.12} ${y - hh * 0.3} ${x} ${y - 2}Z`} fill={CC.candle} />
    </Live>
  );
};

// ---------------------------------------------------------------- a moth circling a lamp

/** A moth circling a lamp's light (always on: a looping path, wings stepped at 14 / s), O1's moth generalised so every
 *  lamp in her home has one (finisher: P2 / P6 had too few movers in their holds). Centre (cx, cy) and orbit radii
 *  (rx, ry) in canvas px; `size` scales the glyph (1 = O1's: ~30 px span); `color` = the wings (default the red-brown
 *  trim: a pale moth vanished against the lamp-lit wall at phone size, and the density meter could not see it). */
export const LampMoth: React.FC<{cx: number; cy: number; rx?: number; ry?: number; period?: number; size?: number; color?: string; seed?: string; at?: At}> = ({cx, cy, rx = 74, ry = 30, period = 2.1, size = 1, color = CC.trim, seed = 'moth', at}) => {
  const t = useTime();
  const k = useInkScale();
  const a = (2 * Math.PI * loopT(t, period, rand(seed, 'ph') * period)) / period;
  const x = cx + rx * Math.cos(a) + rx * 0.19 * Math.sin(2 * a);
  const y = cy + ry * Math.sin(a) + ry * 0.33 * Math.sin(3 * a + 1);
  const flap = Math.floor(stepT(t, 14) * 14) % 2 === 0;
  const z = size;
  const wing = (sd: number) => {
    const span = (flap ? 15 : 8) * z;
    const tip: Pt = [x + sd * span, y - (flap ? 5 : 10) * z];
    const back: Pt = [x + sd * span * 0.7, y + 8 * z];
    return `M${x} ${y - 3 * z}Q${tip[0]} ${tip[1] - 6 * z} ${tip[0]} ${tip[1]}Q${back[0] + sd * 4 * z} ${back[1]} ${x} ${y + 4 * z}Z`;
  };
  return (
    <Live at={at} c={[cx, cy]}>
      <path d={wing(-1) + wing(1)} fill={color} stroke={CC.ink} strokeWidth={1.8 * k} strokeLinejoin="round" />
      <ellipse cx={x} cy={y + z} rx={3.2 * z} ry={7 * z} fill={CC.ink} />
    </Live>
  );
};

/** A leaf: from its stem (x, y) toward `deg`, length `len` (shared with the desk insert). */
export const leafD = (x: number, y: number, len: number, deg: number, wid = 0.42): string => {
  const a = (deg * Math.PI) / 180;
  const u: Pt = [Math.cos(a), Math.sin(a)];
  const nn: Pt = [-u[1], u[0]];
  const w = len * wid;
  const tip: Pt = [x + u[0] * len, y + u[1] * len];
  const c1: Pt = [x + u[0] * len * 0.5 + nn[0] * w, y + u[1] * len * 0.5 + nn[1] * w];
  const c2: Pt = [x + u[0] * len * 0.5 - nn[0] * w, y + u[1] * len * 0.5 - nn[1] * w];
  return `M${x} ${y}Q${c1[0]} ${c1[1]} ${tip[0]} ${tip[1]}Q${c2[0]} ${c2[1]} ${x} ${y}Z`;
};
void polyPath;
