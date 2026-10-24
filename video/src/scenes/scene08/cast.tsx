// S08 cast: the hooded attempters (rattlers at doors, the rim crowd tapping the glass, the stipple flood), the leaked
// copies on the wires, the pigeons, Pip and Bit. Everything is time-driven (scene seconds), no fades.
import React from 'react';
import {palette} from '../../lib/theme';
import {ease as E, lerp, prog, useTime} from '../../lib/time';
import {rand} from '../../lib/rng';
import {Ink} from '../../lib/Ink';
import {useLook} from '../../lib/exit';
import {arc, Pt} from '../../lib/sketch';
import {mat, XG} from '../../lib/xf';
import {Bird} from '../../lib/kit';
import {ElephantTimeline, hop as pipHop, walkSpeed} from '../../lib/mascot';
import type {PoseKey} from '../../lib/mascot';
import {Attempter, Bit, LeakSheet} from '../shared/props';
import {glassStep} from '../shared/sets';
import {copingY, inDome, wireAtX} from './city';

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

export type CopySpec = {wire: number; x0: number; speed: number; unpegAt?: number; scale?: number; seed: string};

const COPY_H = 270;

/** Where a pegged copy is at t (its peg point on the wire). */
export function copyPeg(c: CopySpec, t: number): Pt {
  const x = c.x0 - c.speed * t;
  return wireAtX(c.wire, Math.min(539, x));
}

/** A leaked copy pegged on a wire, sliding left toward the city; at `unpegAt` it lets go and flutters down into the
 *  streets (tumbling, shrinking away: it falls INTO the far city), then is gone (a 1-frame pop at the end). */
export const WireCopy: React.FC<CopySpec & {children?: React.ReactNode}> = (c) => {
  const t = useTime();
  const s = c.scale ?? 0.26;
  if (c.unpegAt === undefined || t < c.unpegAt) {
    const [px, py] = copyPeg(c, t);
    const sway = Math.sin(t * 5.3 + rand(c.seed, 'p') * 6) * 2.5;
    return (
      <>
        <LeakSheet x={px} y={py + (COPY_H * s) / 2 - 2} peg scale={s} rot={sway} seed={c.seed} />
        {c.children}
      </>
    );
  }
  const dt = t - c.unpegAt;
  const q = prog(t, c.unpegAt, 0.85);
  if (q >= 1) return null;
  const [px, py] = copyPeg(c, c.unpegAt);
  const x = px - 70 * dt - Math.sin(dt * 9) * 14;
  const y = py + (COPY_H * s) / 2 + 300 * E.inQuad(q) + 40 * q;
  const k = s * (1 - 0.8 * E.inQuad(q));
  const rot = Math.sin(dt * 11 + rand(c.seed, 'r') * 6) * 28 * (0.4 + q);
  return <LeakSheet x={x} y={y} scale={k} rot={rot} pin={false} seed={c.seed} />;
};

// ---------------------------------------------------------------- pigeons on the chimney

export const Pigeons: React.FC<{flyAt: number}> = ({flyAt}) => (
  <>
    {[
      [0, 1296, 0.8],
      [38, 1306, 0.75],
      [-14, 1296, 0.72],
    ].map(([x, y, s], i) => (
      <Bird key={i} x={x} y={y} s={s} seed={`s8/pg${i}`} flyAt={flyAt + i * 0.07} flyTo={[-320 - i * 40, -300 + i * 30]} color={i % 2 ? palette.sand : palette.white} flip={i === 1} />
    ))}
  </>
);

// ---------------------------------------------------------------- Pip

export type PipPlan = {walkAt: number; walkFrom: number; hopAt: number; hopFrom: number; spot: Pt; keys: PoseKey[]; scale: number};

/** Pip walks in along the coping from the right edge, hops onto his spot as the crane settles, then plays his keys. */
export const Pip: React.FC<{plan: PipPlan}> = ({plan}) => {
  const t = useTime();
  const {walkAt, walkFrom, hopAt, hopFrom, spot, keys, scale} = plan;
  if (t < walkAt) return null;
  const dur = 0.34;
  if (t < hopAt - 0.14) {
    // walking left along the coping
    const sp = walkSpeed(1.35) * scale;
    const x = Math.max(hopFrom, walkFrom - (t - walkAt) * sp);
    return <ElephantTimeline x={x} y={copingY(x)} scale={scale} t={t} seed={8} flip keys={[{t: 0, pose: 'walk-side'}]} walkRate={1.35} />;
  }
  if (t < hopAt + dur + 0.32) {
    const h = pipHop({t, t0: hopAt, dur, from: {x: hopFrom, y: copingY(hopFrom)}, to: {x: spot[0], y: spot[1]}, height: 30});
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

export type BitPlan = {copy: CopySpec; hopAt: number; land: Pt; crawlAt: number; crawlTo: Pt; alertAt: number; size: number};

/** Bit rides the last copy on the wire, hops onto the board's top edge, scuttles along it and watches the count. */
export const BitRide: React.FC<{plan: BitPlan}> = ({plan}) => {
  const t = useTime();
  const {copy, hopAt, land, crawlAt, crawlTo, alertAt, size} = plan;
  const air = 0.36;
  if (t < hopAt) {
    const [px, py] = copyPeg(copy, t);
    return <Bit x={px + 9} y={py - 0.5} size={size} state="ride" flip look="forward" seed="s8/bit" />;
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
  if (t < crawlAt) return <Bit x={land[0]} y={land[1]} size={size} hopAt={hopAt + air - 0.02} hopH={0.2} state="idle" look="forward" seed="s8/bit" />;
  return <Bit x={land[0]} y={land[1]} size={size} crawl={{at: crawlAt, path: [land, crawlTo], speed: 300}} state={t < crawlAt + Math.hypot(crawlTo[0] - land[0], crawlTo[1] - land[1]) / 300 ? 'scuttle' : 'idle'} alertAt={alertAt} alertDur={1.0} look={t > crawlAt + 1.4 ? 'down' : 'auto'} seed="s8/bit" />;
};

export {Ink};
