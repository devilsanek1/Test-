// S08 cast: the hooded attempters (rattlers at doors, the rim crowd tapping the glass, the stipple flood), the leaked
// copies on the wires, the pigeons, Pip and Bit. Everything is time-driven (scene seconds), no fades.
import React from 'react';
import {palette} from '../../lib/theme';
import {ease as E, lerp, prog, useTime} from '../../lib/time';
import {rand} from '../../lib/rng';
import {useLook} from '../../lib/exit';
import {arc, Pt} from '../../lib/sketch';
import {mat, XG} from '../../lib/xf';
import {Bird} from '../../lib/kit';
import {ElephantTimeline, hop as pipHop} from '../../lib/mascot';
import type {PoseKey} from '../../lib/mascot';
import {Attempter, Bit, LeakSheet} from '../shared/props';
import {glassStep, WIRES, wireAt} from '../shared/sets';
import {inDome} from './layout';

// ---------------------------------------------------------------- rattlers (the near doors: NOT counted)

const latest = (ts: number[], t: number): number | undefined => {
  let r: number | undefined;
  for (const x of ts) if (x <= t) r = x;
  return r;
};

export type RattlerSpec = {x: number; y: number; h: number; at: number; rattles: number[]; hop?: {at: number; to: number}; flip?: boolean; seed: string};

/** A hooded attempter at a door rattling its handle (ink marks); `hop` = gives up and hops to the next door. */
export const Rattler: React.FC<RattlerSpec> = ({x, y, h, at, rattles, hop, flip, seed}) => {
  const t = useTime();
  if (t < at) return null;
  let px = x;
  let py = y;
  let rattleAt = latest(rattles, t);
  if (hop && t >= hop.at) {
    const q = prog(t, hop.at, 0.34);
    px = lerp(x, hop.to, E.inOutSine(q));
    py = y - Math.sin(q * Math.PI) * h * 0.38;
    if (q < 1) rattleAt = undefined;
  }
  return <Attempter x={px} y={py} h={h} mode="rattle" riseAt={at} rattleAt={rattleAt} rattleDur={0.5} flip={flip} seed={seed} />;
};

// ---------------------------------------------------------------- the rim crowd (tiny, tapping the glass: counted)

export type RimFig = {x: number; y: number; h: number; at: number; taps: number[]};

/** Tiny hooded attempters pressed against the dome's foot, tapping the glass: ripple arcs on the glass (seen, never
 *  getting in). Batched: three paths for the whole crowd. */
export const RimCrowd: React.FC<{figs: RimFig[]; glassColor?: string}> = ({figs}) => {
  const t = useTime();
  const look = useLook();
  let body = '';
  let arms = '';
  let ripples = '';
  for (const f of figs) {
    if (t < f.at) continue;
    const pop = t < f.at + 0.067 ? 1.25 : 1;
    const h = f.h * pop;
    const w = h * 0.46;
    const {x, y} = f;
    body += `M${(x - w / 2).toFixed(1)} ${y.toFixed(1)}V${(y - h * 0.6).toFixed(1)}Q${(x - w / 2).toFixed(1)} ${(y - h * 0.84).toFixed(1)} ${x.toFixed(1)} ${(y - h).toFixed(1)}Q${(x + w / 2).toFixed(1)} ${(y - h * 0.84).toFixed(1)} ${(x + w / 2).toFixed(1)} ${(y - h * 0.6).toFixed(1)}V${y.toFixed(1)}Z`;
    const tap = latest(f.taps, t);
    if (tap !== undefined && t < tap + 0.4) {
      const q = (t - tap) / 0.4;
      const hx = x + w * 0.62;
      const hy = y - h * 1.12 + Math.sin(q * Math.PI * 4) * 0.8;
      arms += `M${(x + w * 0.3).toFixed(1)} ${(y - h * 0.62).toFixed(1)}L${hx.toFixed(1)} ${hy.toFixed(1)}`;
      for (let i = 0; i < 2; i++) {
        const rr = 3 + i * 4 + q * 7;
        ripples += arc(hx, hy, rr, rr * 0.8, -150, -30, {seed: `rim${Math.round(x)}${i}`});
      }
    }
  }
  if (!body) return null;
  return (
    <>
      {look.fills === 'color' ? <path d={body} fill={palette.tealDark} /> : <path d={body} fill={palette.white} stroke={palette.ink} strokeWidth={0.8} />}
      {arms ? <path d={arms} stroke={palette.tealDark} strokeWidth={2.2} strokeLinecap="round" fill="none" /> : null}
      {ripples ? <path d={ripples} stroke={palette.ink} strokeWidth={1.3} strokeLinecap="round" fill="none" /> : null}
    </>
  );
};

// ---------------------------------------------------------------- the stipple flood

export type Speck = {x: number; y: number; h: number; at: number};

/** Hundreds of 3-12 px hooded tombstones in ONE path per colour; each pops at its `at` (1.25x for 2 frames). After
 *  `flickerAt` a seeded third of them bob 1-2 px in 0.1 s steps (the crowd seethes). Specks inside the dome take the
 *  glass step. */
export const Stipple: React.FC<{specks: Speck[]; flickerAt?: number; glass?: boolean; seed: string}> = ({specks, flickerAt, glass, seed}) => {
  const t = useTime();
  const look = useLook();
  if (look.fills !== 'color') return null;
  const step = flickerAt !== undefined && t >= flickerAt ? Math.floor((t - flickerAt) / 0.1) : -1;
  let d = '';
  specks.forEach((sp, i) => {
    if (t < sp.at) return;
    const k = t < sp.at + 0.067 ? 1.25 : 1;
    const h = sp.h * k;
    const w = h * 0.5;
    const bob = step >= 0 && rand(seed, `f${i}`) < 0.35 && (step + i) % 2 === 0 ? -Math.max(1, h * 0.15) : 0;
    const y = sp.y + bob;
    d += `M${(sp.x - w / 2).toFixed(1)} ${y.toFixed(1)}V${(y - h * 0.62).toFixed(1)}Q${(sp.x - w / 2).toFixed(1)} ${(y - h * 0.82).toFixed(1)} ${sp.x.toFixed(1)} ${(y - h).toFixed(1)}Q${(sp.x + w / 2).toFixed(1)} ${(y - h * 0.82).toFixed(1)} ${(sp.x + w / 2).toFixed(1)} ${(y - h * 0.62).toFixed(1)}V${y.toFixed(1)}Z`;
  });
  if (!d) return null;
  return <path d={d} fill={glass ? glassStep(palette.tealDark) : palette.tealDark} />;
};

/** Specks along a street line: n seeded positions in [x0, x1] at feet y (+- jy), sizes in [h0, h1], popping over span. */
export function specksAlong(seed: string, n: number, x0: number, x1: number, y: number, h0: number, h1: number, at: number, span: number, o: {jy?: number; order?: 'rand' | 'ltr' | 'center'; skip?: (x: number, y: number) => boolean} = {}): Speck[] {
  const out: Speck[] = [];
  for (let i = 0; i < n * 3 && out.length < n; i++) {
    const x = x0 + rand(seed, `x${i}`) * (x1 - x0);
    const yy = y + (rand(seed, `y${i}`) - 0.5) * 2 * (o.jy ?? 2);
    if (o.skip && o.skip(x, yy)) continue;
    const u = o.order === 'ltr' ? (x - x0) / (x1 - x0) : o.order === 'center' ? Math.abs(x - (x0 + x1) / 2) / ((x1 - x0) / 2) : rand(seed, `a${i}`);
    out.push({x, y: yy, h: lerp(h0, h1, rand(seed, `h${i}`)), at: at + u * span});
  }
  return out;
}
export const splitDome = (sp: Speck[]) => ({inside: sp.filter((s) => inDome(s.x, s.y - s.h * 0.5)), outside: sp.filter((s) => !inDome(s.x, s.y - s.h * 0.5))});

// ---------------------------------------------------------------- paper specks (the copies landing in the streets)

export const PaperSpecks: React.FC<{spots: {x: number; y: number; at: number; s?: number}[]}> = ({spots}) => {
  const t = useTime();
  let d = '';
  for (const p of spots) {
    if (t < p.at) continue;
    const s = (p.s ?? 6) * (t < p.at + 0.067 ? 1.3 : 1);
    d += `M${(p.x - s / 2).toFixed(1)} ${(p.y - s * 0.6).toFixed(1)}h${s.toFixed(1)}v${(s * 0.75).toFixed(1)}h${(-s).toFixed(1)}Z`;
  }
  if (!d) return null;
  return <path d={d} fill={palette.white} stroke={palette.ink} strokeWidth={0.9} />;
};

// ---------------------------------------------------------------- the leaked copies on the wires

export type CopySpec = {
  wire: number;
  /** Peg x on the wire at the cut (world) and the slide speed there (world px/s, leftwards): S07 hands each copy over
   *  at this speed (scene07 toCut). It eases off along the wire (time constant tau) to a slow residual drift vr. */
  x0: number;
  v0: number;
  tau?: number;
  vr?: number;
  unpegAt?: number;
  seed: string;
};

/** S07's copies: LeakSheet 210 x 270 at scale 0.34 x its zoom 1.06, hung (h / 2 + 6) below the peg, leaning ~5 deg
 *  against the travel. Same on-screen size here at the cut (zoom 1.3). */
const COPY_H = 270;
export const COPY_S = (0.34 * 1.06) / 1.3;
const HANG = (COPY_H / 2 + 6) * COPY_S;

/** Peg x along the wire at t. */
export const copyX = (c: CopySpec, t: number) => {
  const tau = c.tau ?? 0.6;
  return c.x0 - c.v0 * tau * (1 - Math.exp(-Math.max(0, t) / tau)) - (c.vr ?? 0) * Math.max(0, t);
};
/** Where a pegged copy is at t (its peg point on the wire). */
export function copyPeg(c: CopySpec, t: number): Pt {
  return wireAt(WIRES.S08, c.wire, Math.min(538, copyX(c, t)));
}
const copyLean = (c: CopySpec, t: number) => 5 + 1.5 * Math.sin(t * 5.3 + rand(c.seed, 'p') * 6);

/** A leaked copy pegged on a wire, sliding left toward the city; at `unpegAt` it lets go and flutters down into the
 *  streets (tumbling, shrinking away: it falls INTO the far city), then is gone (a 1-frame pop at the end). */
export const WireCopy: React.FC<CopySpec & {children?: React.ReactNode}> = (c) => {
  const t = useTime();
  const s = COPY_S;
  if (c.unpegAt === undefined || t < c.unpegAt) {
    const [px, py] = copyPeg(c, t);
    return (
      <>
        <XG m={mat.compose(mat.translate(px, py), mat.rotate(copyLean(c, t)))}>
          <LeakSheet x={0} y={HANG} peg scale={s} depth="far" seed={c.seed} />
        </XG>
        {c.children}
      </>
    );
  }
  // it falls INTO the far city: it shrinks away fast (distance) while it drops a little, and is gone before it could
  // reach our coping (the scene also clips the copies above the coping line)
  const dt = t - c.unpegAt;
  const q = prog(t, c.unpegAt, 0.7);
  if (q >= 1) return null;
  const [px, py] = copyPeg(c, c.unpegAt);
  const x = px - 80 * dt - Math.sin(dt * 9) * 12;
  const y = py + HANG + 120 * E.inQuad(q) + 30 * q;
  const k = s * (1 - 0.86 * E.outQuad(q));
  const rot = copyLean(c, c.unpegAt) + Math.sin(dt * 11 + rand(c.seed, 'r') * 6) * 28 * (0.4 + q);
  return <LeakSheet x={x} y={y} scale={k} rot={rot} pin={false} depth="far" seed={c.seed} />;
};

// ---------------------------------------------------------------- pigeons on the chimney

/** S07's two pigeons on wire 0 (its Pigeon x 384 white / x 330 sand flipped, Bird s 0.8 at zoom 1.06), carried over
 *  the cut at the same screen spot and size: S07 x -> S08 x = 540 + 1.06 / 1.3 (x - 480). */
const WIRE_PIGEONS = [
  {x7: 384, seed: 's7pg0', color: palette.white, flip: false},
  {x7: 330, seed: 's7pg1', color: palette.sand, flip: true},
];

export const Pigeons: React.FC<{flyAt: number}> = ({flyAt}) => (
  <>
    {WIRE_PIGEONS.map((p, i) => {
      const x = 540 + (1.06 / 1.3) * (p.x7 - 480);
      const q = wireAt(WIRES.S08, 0, x);
      return <Bird key={p.seed} x={q[0]} y={q[1] + 1} s={(0.8 * 1.06) / 1.3} seed={p.seed} flyAt={flyAt - 0.12 + i * 0.09} flyTo={[-300 - i * 80, -200 + i * 30]} color={p.color} flip={p.flip} />;
    })}
    {[
      [612, 1294, 0.8],
      [662, 1306, 0.75],
      [626, 1294, 0.7],
    ].map(([x, y, s], i) => (
      <Bird key={i} x={x} y={y} s={s} seed={`s8/pg${i}`} flyAt={flyAt + i * 0.07} flyTo={[-420 - i * 60, -240 + i * 40]} color={i % 2 ? palette.sand : palette.white} flip={i === 1} />
    ))}
  </>
);

// ---------------------------------------------------------------- Pip

export type PipPlan = {hopAt: number; hopFrom: Pt; hopDur: number; spot: Pt; keys: PoseKey[]; scale: number};

/** Pip hops in from beyond the right frame edge and lands on his spot on the coping as the crane settles, then plays his
 *  keys (watching, a glance at the board, ears-cover, sit-front worried). */
export const Pip: React.FC<{plan: PipPlan}> = ({plan}) => {
  const t = useTime();
  const {hopAt, hopFrom, hopDur, spot, keys, scale} = plan;
  if (t < hopAt - 0.14) return null;
  if (t < hopAt + hopDur + 0.32) {
    const h = pipHop({t, t0: hopAt, dur: hopDur, from: {x: hopFrom[0], y: hopFrom[1]}, to: {x: spot[0], y: spot[1]}, height: 70});
    const landed = h.k >= 1;
    return (
      <ElephantTimeline
        x={h.x}
        y={h.y}
        scale={scale}
        t={t}
        seed={8}
        flip={!landed}
        squash={h.squash}
        rotate={h.rotate}
        amount={h.spread}
        keys={landed ? keys : [{t: 0, pose: 'stand-side'}]}
      />
    );
  }
  return <ElephantTimeline x={spot[0]} y={spot[1]} scale={scale} t={t} seed={8} keys={keys} />;
};

// ---------------------------------------------------------------- Bit

export type BitPlan = {copy: CopySpec; hopAt: number; land: Pt; crawlAt: number; crawlTo: Pt; alertAt: number; size: number; /** little hops as the gates go up */ cheers?: number[]; /** camera zoom at t (riding Bit keeps S07's on-screen size through the crane) */ zoomAt?: (t: number) => number};

/** Bit rides the last copy on the wire, hops onto the board's top edge, scuttles along it and watches the count. */
export const BitRide: React.FC<{plan: BitPlan}> = ({plan}) => {
  const t = useTime();
  const {copy, hopAt, land, crawlAt, crawlTo, alertAt, size} = plan;
  const air = 0.36;
  if (t < hopAt) {
    const [px, py] = copyPeg(copy, t);
    // riding on the copy's peg like in S07 (size 18 at its zoom 1.06): the same pixels on screen until the camera rests
    const sz = (18 * 1.06) / (plan.zoomAt ? plan.zoomAt(t) : 1);
    const lean = copyLean(copy, t);
    return (
      <XG m={mat.compose(mat.translate(px, py), mat.rotate(lean))}>
        <Bit x={(9 * COPY_S) / 0.34} y={-0.5} size={sz} state="ride" flip look="forward" seed="s8/bit" />
      </XG>
    );
  }
  if (t < hopAt + air) {
    const [px, py] = copyPeg(copy, hopAt);
    const q = (t - hopAt) / air;
    const x = lerp(px + 9, land[0], q);
    const top = Math.min(py, land[1]) - 46;
    const c = 2 * top - (py + land[1]) / 2;
    const y = (1 - q) * (1 - q) * py + 2 * (1 - q) * q * c + q * q * land[1];
    return (
      <XG m={mat.about(mat.rotate(-25 * Math.cos(Math.PI * q)), x, y)}>
        <Bit x={x} y={y} size={size} state="hop" look="up" seed="s8/bit" />
      </XG>
    );
  }
  if (t < crawlAt) return <Bit x={land[0]} y={land[1]} size={size} state="idle" look="forward" seed="s8/bit" />;
  const cheer = latest(plan.cheers ?? [], t);
  return <Bit x={land[0]} y={land[1]} size={size} hopAt={cheer} hopH={0.7} crawl={{at: crawlAt, path: [land, crawlTo], speed: 300}} state={t < crawlAt + Math.hypot(crawlTo[0] - land[0], crawlTo[1] - land[1]) / 300 ? 'scuttle' : 'idle'} alertAt={alertAt} alertDur={1.0} look={t > crawlAt + 1.4 ? 'down' : 'auto'} seed="s8/bit" />;
};


/** Crowds as CLUMPS (a flood reads as crowds, not as an even grain): `n` clumps along a band, each 'per' specks packed
 *  shoulder to shoulder (back rows a hair higher and smaller), all popping at `at` (+ the clump's share of `span`). */
export function clumps(seed: string, n: number, x0: number, x1: number, y0: number, y1: number, h0: number, h1: number, per: [number, number], at: number, span: number, o: {order?: 'rand' | 'ltr'; skip?: (x: number, y: number) => boolean} = {}): Speck[] {
  const out: Speck[] = [];
  for (let c = 0, made = 0; c < n * 3 && made < n; c++) {
    const cx = x0 + rand(seed, `cx${c}`) * (x1 - x0);
    const cy = y0 + rand(seed, `cy${c}`) * (y1 - y0);
    if (o.skip && o.skip(cx, cy)) continue;
    made++;
    const h = lerp(h0, h1, rand(seed, `ch${c}`));
    const k = Math.round(lerp(per[0], per[1], rand(seed, `ck${c}`)));
    const u = o.order === 'ltr' ? (cx - x0) / (x1 - x0) : rand(seed, `ca${c}`);
    for (let i = 0; i < k; i++) {
      const row = i % 2;
      const x = cx + (i - k / 2) * h * 0.42 + (rand(seed, `jx${c}/${i}`) - 0.5) * h * 0.3;
      const y = cy - row * h * 0.22 + (rand(seed, `jy${c}/${i}`) - 0.5) * h * 0.12;
      out.push({x, y, h: h * (row ? 0.92 : 1) * lerp(0.9, 1.08, rand(seed, `js${c}/${i}`)), at: at + u * span});
    }
  }
  // back rows first (smaller y first) so nearer specks overlap them
  return out.sort((a, b) => a.y - b.y);
}

/** A window grid on a far building winks: its panes flash cream for 2 frames, twice. */
export const WindowWink: React.FC<{x: number; y: number; cols: number; rows: number; at: number; size?: number}> = ({x, y, cols, rows, at, size = 5}) => {
  const t = useTime();
  const on = (t >= at && t < at + 0.07) || (t >= at + 0.2 && t < at + 0.27);
  if (!on) return null;
  let d = '';
  for (let c = 0; c < cols; c++) for (let r = 0; r < rows; r++) d += `M${(x + c * size * 2).toFixed(1)} ${(y + r * size * 2.4).toFixed(1)}h${size}v${(size * 1.25).toFixed(1)}h${-size}Z`;
  return <path d={d} fill={palette.white} />;
};

/** One white glint bar sliding across the dome's glass (clipped to the dome interior, same layer). */
export const GlintSweep: React.FC<{at: number; dur?: number; interior: string; x0: number; x1: number; y: number; L: number}> = ({at, dur = 0.45, interior, x0, x1, y, L}) => {
  const t = useTime();
  const look = useLook();
  if (t < at || t >= at + dur || look.fills !== 'color') return null;
  const x = lerp(x0, x1, E.inOutSine((t - at) / dur));
  const w = 16;
  const d = `M${x.toFixed(1)} ${y}L${(x + w).toFixed(1)} ${y}L${(x + w + L * 0.42).toFixed(1)} ${y - L}L${(x + L * 0.42).toFixed(1)} ${y - L}Z`;
  const id = `gl8${Math.round(at * 100)}`;
  return (
    <>
      <defs>
        <clipPath id={id} clipPathUnits="userSpaceOnUse">
          <path d={interior} />
        </clipPath>
      </defs>
      <path d={d} fill={palette.white} clipPath={`url(#${id})`} />
    </>
  );
};

/** Ink impact ticks around a landed stamp (4-6 short strokes), on for `dur`. */
export const StampHit: React.FC<{box: [number, number, number, number]; at: number; dur?: number}> = ({box, at, dur = 0.3}) => {
  const t = useTime();
  if (t < at || t >= at + dur) return null;
  const [x0, y0, x1, y1] = box;
  const q = E.outCubic((t - at) / 0.12);
  const g = 6 + 8 * Math.min(1, q);
  const d =
    `M${x0 - g} ${y0 + 6}l-12 -8M${x0 - g} ${y1 - 4}l-12 7M${x1 + g} ${y0 + 6}l12 -8M${x1 + g} ${y1 - 4}l12 7` +
    `M${(x0 + x1) / 2 - 40} ${y0 - g}l-4 -11M${(x0 + x1) / 2 + 40} ${y0 - g}l4 -11`;
  return <path d={d} stroke={palette.ink} strokeWidth={2.6} strokeLinecap="round" fill="none" />;
};
