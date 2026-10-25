// S08 cast: the leaked copies on the wires, the pigeons, Pip and Bit, the glint / window wink, stamp impact ticks and the
// paper specks (the hooded attempters live in crowd.tsx). Everything is time-driven (scene seconds), no fades.
import React from 'react';
import {palette} from '../../lib/theme';
import {ease as E, lerp, prog, useTime} from '../../lib/time';
import {rand} from '../../lib/rng';
import {useLook} from '../../lib/exit';
import type {Pt} from '../../lib/sketch';
import {mat, XG} from '../../lib/xf';
import {Bird} from '../../lib/kit';
import {ElephantTimeline, hop as pipHop} from '../../lib/mascot';
import type {PoseKey} from '../../lib/mascot';
import {Bit, LeakSheet} from '../shared/props';
import {WIRES, wireAt} from '../shared/sets';
import {stampPrintSize} from './shims';

const latest = (ts: number[], t: number): number | undefined => {
  let r: number | undefined;
  for (const x of ts) if (x <= t) r = x;
  return r;
};

// ---------------------------------------------------------------- paper specks (the copies landing in the streets)

/** The copies landing in the far streets (fix round 3b: 10-16 px sheets that TUMBLE down 22 px over 0.3 s, flipping
 *  between a face-on and an edge-on step every 2 frames, then lie flat: an event the detector can see). */
export const PaperSpecks: React.FC<{spots: {x: number; y: number; at: number; s?: number}[]}> = ({spots}) => {
  const t = useTime();
  let d = '';
  for (const p of spots) {
    if (t < p.at) continue;
    const s = p.s ?? 10;
    const q = Math.min(1, (t - p.at) / 0.3);
    const y = p.y - 22 * (1 - E.inQuad(q));
    const flat = q >= 1;
    const step = Math.floor((t - p.at) / 0.067) % 3;
    const w = flat ? s : step === 1 ? s * 0.3 : s * (step === 0 ? 1 : 0.75);
    const hh = flat ? s * 0.4 : s * 0.75;
    const rot = flat ? 0 : (step - 1) * 0.35;
    const cx = p.x + (flat ? 0 : Math.sin((t - p.at) * 14) * 4);
    const c = Math.cos(rot);
    const sn = Math.sin(rot);
    const pt = (u: number, v: number) => `${(cx + u * c - v * sn).toFixed(1)} ${(y + u * sn + v * c).toFixed(1)}`;
    d += `M${pt(-w / 2, -hh)}L${pt(w / 2, -hh)}L${pt(w / 2, 0)}L${pt(-w / 2, 0)}Z`;
  }
  if (!d) return null;
  return <path d={d} fill={palette.white} stroke={palette.ink} strokeWidth={1.1} strokeLinejoin="round" />;
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
  const k = s * (1 - 0.8 * E.inOutSine(q));
  // fix round 3b: a bigger paper TUMBLE (it reads as an event at 0.9-1.1 s): +-60 deg swings and an edge-on flip (the
  // sheet narrows to a third every ~0.2 s: it turns over as it falls)
  const rot = copyLean(c, c.unpegAt) + Math.sin(dt * 11 + rand(c.seed, 'r') * 6) * 60 * (0.4 + q);
  const flip = 0.3 + 0.7 * Math.abs(Math.cos(dt * 8 + rand(c.seed, 'f') * 3));
  return (
    <XG m={mat.about(mat.scale(flip, 1), x, y)}>
      <LeakSheet x={x} y={y} scale={k} rot={rot} pin={false} depth="far" seed={c.seed} />
    </XG>
  );
};

// ---------------------------------------------------------------- pigeons on the chimney

/** S07's two pigeons on wire 0 (Scene07: Pigeon x 384 white / x 330 sand flipped, Bird s 0.8 at zoom 1.06), carried
 *  over the cut at the same screen spot and size: S07 x -> S08 x = 540 + 1.06 / 1.3 (x - 480). (Fix round 2 checked on
 *  the cut: the S07 polish moved its pigeons to these x, so both birds land on the same screen spot.) */
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
        flip={!landed && hopFrom[0] > spot[0]}
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

/** Ink impact ticks off a landed stamp's SHORT ENDS only (fix round 2: the top ticks struck through L9a's last line and
 *  L10): three short strokes fanning out from each end of the print (its real rotated extent), on for `dur`. */
export const StampHit: React.FC<{box: [number, number, number, number]; text: string; fontSize: number; rot: number; at: number; dur?: number; pad?: {x: number; top: number; bot: number}}> = ({box, text, fontSize, rot, at, dur = 0.3, pad}) => {
  const t = useTime();
  if (t < at || t >= at + dur) return null;
  const {w} = stampPrintSize(text, fontSize, pad);
  const cx = (box[0] + box[2]) / 2;
  const cy = (box[1] + box[3]) / 2;
  const q = E.outCubic(Math.min(1, (t - at) / 0.12));
  const g = 8 + 8 * q;
  const r = (rot * Math.PI) / 180;
  const ux = Math.cos(r);
  const uy = Math.sin(r);
  let d = '';
  for (const s of [-1, 1]) {
    const ex = cx + s * ux * (w / 2 + g);
    const ey = cy + s * uy * (w / 2 + g);
    for (const a of [-32, 0, 32]) {
      const th = r + ((s < 0 ? 180 : 0) + a) * (Math.PI / 180);
      d += `M${(ex + Math.cos(th) * 2).toFixed(1)} ${(ey + Math.sin(th) * 2).toFixed(1)}l${(Math.cos(th) * 12).toFixed(1)} ${(Math.sin(th) * 12).toFixed(1)}`;
    }
  }
  return <path d={d} stroke={palette.ink} strokeWidth={2.6} strokeLinecap="round" fill="none" />;
};
