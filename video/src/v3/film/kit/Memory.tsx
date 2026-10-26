// kit/Memory.tsx: the memory stick (a board with near-black chips and light gold pins), its flight helper, and the
// pile (a mountain of sticks, S9). One stick model at every size: O1's 130 px sticks, S7's bubble, S8's 700 px
// close-up, S11's bar caps, S9's 50 px streams and its mountain are the same object.

import React from 'react';
import {Ink} from '../../../lib/Ink';
import {Fill} from '../../../lib/Fill';
import {line, poly, polyPath} from '../../../lib/sketch';
import {rng} from '../../../lib/rng';
import {useTime, prog, ease, clamp} from '../../../lib/time';
import {mat, XG} from '../../../lib/xf';
import {EMBER} from '../palette';
import {At, b, fillAt, lerp, Pt, Show} from './util';

// ---------------------------------------------------------------- one stick

/** Stick proportions: h = w * STICK_RATIO (a real DIMM is ~0.23; drawn taller so the chips read at phone size). */
export const STICK_RATIO = 0.31;

export type MemoryStickProps = {
  /** Centre (canvas px). */
  x: number;
  y: number;
  /** Width (px). Reads from ~60 px; 130 px is the film's flying size. */
  w: number;
  rot?: number;
  at?: At;
  seed?: string;
  /** Screen ink weight. Default by size: 2.2 under 100 px, 3.4 under 400 px, 4.8 above (S8's close-up). */
  ink?: number;
  /** Chips across (default 4 at every size, so the stick is the same object close and far). */
  chips?: number;
  board?: string;
  /** No ink, fills only (far sticks, the back of the pile). */
  flat?: boolean;
};

/** Local geometry of a stick (centred on 0,0), in px for width w. */
function stickGeo(w: number, chips: number) {
  const h = w * STICK_RATIO;
  const x0 = -w / 2;
  const y0 = -h / 2;
  const notch = {x: x0 + w * 0.42, w: Math.max(3, w * 0.035), d: h * 0.16};
  // the board outline with the key notch in the pin edge and the two side notches
  const sideD = h * 0.12;
  const outline: Pt[] = [
    [x0, y0],
    [x0 + w, y0],
    [x0 + w, y0 + h * 0.5],
    [x0 + w - sideD, y0 + h * 0.58],
    [x0 + w, y0 + h * 0.66],
    [x0 + w, y0 + h],
    [notch.x + notch.w, y0 + h],
    [notch.x + notch.w, y0 + h - notch.d],
    [notch.x, y0 + h - notch.d],
    [notch.x, y0 + h],
    [x0, y0 + h],
    [x0, y0 + h * 0.66],
    [x0 + sideD, y0 + h * 0.58],
    [x0, y0 + h * 0.5],
  ];
  const pinTop = y0 + h * 0.76;
  const margin = w * 0.06;
  const gap = w * 0.04;
  const cw = (w - margin * 2 - gap * (chips - 1)) / chips;
  const chipRects: [number, number, number, number][] = [];
  for (let i = 0; i < chips; i++) chipRects.push([x0 + margin + i * (cw + gap), y0 + h * 0.13, cw, h * 0.5]);
  const pins = Math.max(8, Math.min(44, Math.round(w / 10)));
  return {h, x0, y0, outline, pinTop, chipRects, notch, pins};
}

export const MemoryStick: React.FC<MemoryStickProps> = ({x, y, w, rot = 0, at, seed = 'stick', ink, chips = 4, board = EMBER.board, flat}) => {
  const g = stickGeo(w, chips);
  const iw = ink ?? (w < 100 ? W_FAR : w < 400 ? 3.4 : 4.8);
  const small = w < 200;
  const over: [number, number] = small ? [0, 1] : [1, 4];
  // pins: a light strip cut by short dark separators (one dashed stroke, so it stays cheap)
  const pinH = g.y0 + g.h - g.pinTop;
  const sep: string[] = [];
  const pitch = (w * 0.9) / g.pins;
  for (let i = 1; i < g.pins; i++) {
    const px = g.x0 + w * 0.05 + i * pitch;
    if (px > g.notch.x - 1 && px < g.notch.x + g.notch.w + 1) continue;
    sep.push(`M${px.toFixed(1)} ${(g.pinTop + pinH * 0.25).toFixed(1)}V${(g.y0 + g.h).toFixed(1)}`);
  }
  const chipD = g.chipRects.map(([cx, cy, cw, ch]) => `M${cx} ${cy}h${cw}v${ch}h${-cw}Z`).join('');
  const chipMarks = w >= 260 ? g.chipRects.map(([cx, cy, cw, ch], i) => line(cx + cw * 0.18, cy + ch * 0.3, cx + cw * 0.6, cy + ch * 0.3, {over: [0, 0], seed: `${seed}/cm${i}`})).join('') : '';
  // tiny SMD parts along the board top (only from mid size up)
  const smd = w >= 160 ? [0.2, 0.36, 0.64, 0.8].map((u) => `M${(g.x0 + w * u).toFixed(1)} ${(g.y0 + g.h * 0.67).toFixed(1)}h${(w * 0.03).toFixed(1)}v${(g.h * 0.05).toFixed(1)}h${(-w * 0.03).toFixed(1)}Z`).join('') : '';
  return (
    <XG m={mat.compose(mat.translate(x, y), mat.rotate(rot))}>
      <Fill d={polyPath(g.outline)} color={board} at={fillAt(at)} seed={`${seed}/board`} offset={small ? [0.8, 0.6] : undefined} />
      <Fill rect={[g.x0 + w * 0.05, g.pinTop, w * 0.9, pinH]} color={EMBER.pin} at={fillAt(at, 0.04)} offset={false} seed={`${seed}/pins`} />
      <Fill d={chipD} color={EMBER.chip} at={fillAt(at, 0.02)} offset={false} seed={`${seed}/chips`} />
      {smd ? <Fill d={smd} color={EMBER.boardDeep} at={fillAt(at, 0.06)} offset={false} seed={`${seed}/smd`} /> : null}
      {flat ? null : (
        <>
          <Ink d={poly(g.outline, {closed: true, seed: `${seed}/o`, over, jitter: small ? 0.3 : 0.8})} at={at} width={iw} />
          <Show at={fillAt(at, 0.04)}>
            <path d={sep.join('')} stroke={EMBER.boardDeep} strokeWidth={Math.max(1, Math.min(3, w / 120))} fill="none" strokeLinecap="butt" />
          </Show>
          <Ink d={line(g.x0 + w * 0.05, g.pinTop, g.x0 + w * 0.95, g.pinTop, {over: [0, 0], seed: `${seed}/pl`})} at={b(at, 0.05)} width={Math.max(1.2, iw * 0.55)} />
          {chipMarks ? <Ink d={chipMarks} at={b(at, 0.12)} width={1.6} color={EMBER.boardDeep} /> : null}
        </>
      )}
    </XG>
  );
};
const W_FAR = 2.2;

// ---------------------------------------------------------------- flight (a stick along an arc from A to B)

export type StickFlightOpts = {
  from: Pt;
  to: Pt;
  /** Departure and arrival (scene seconds). */
  t0: number;
  t1: number;
  /** Arc height (px, positive = bows up). Default 25 % of the distance. */
  arc?: number;
  /** Width at departure / arrival (shrinks into the distance). */
  w0?: number;
  w1?: number;
  rot0?: number;
  rot1?: number;
  /** 'vanish' (gone at t1, default) | 'shrink' (shrinks to 0 over the last 0.1 s into the target) | 'land' (stays at B). */
  end?: 'vanish' | 'shrink' | 'land';
  ease?: (x: number) => number;
};

/** Pose of a flying stick at time t (null = not visible). Pure: lanes use it to aim other things at the stick. */
export function flightPose(t: number, o: StickFlightOpts): {x: number; y: number; w: number; rot: number; p: number} | null {
  if (t < o.t0) return null;
  const end = o.end ?? 'vanish';
  if (t >= o.t1 && end === 'vanish') return null;
  const e = o.ease ?? ease.inOutSine;
  const p = e(clamp((t - o.t0) / Math.max(1e-6, o.t1 - o.t0)));
  const [ax, ay] = o.from;
  const [bx, by] = o.to;
  const dist = Math.hypot(bx - ax, by - ay);
  const arc = o.arc ?? dist * 0.25;
  // quadratic bezier with the control point lifted off the chord's midpoint
  const cx = (ax + bx) / 2;
  const cy = (ay + by) / 2 - arc;
  const x = (1 - p) * (1 - p) * ax + 2 * (1 - p) * p * cx + p * p * bx;
  const y = (1 - p) * (1 - p) * ay + 2 * (1 - p) * p * cy + p * p * by;
  let w = lerp(o.w0 ?? 130, o.w1 ?? o.w0 ?? 130, p);
  if (end === 'shrink') {
    const k = clamp((t - (o.t1 - 0.1)) / 0.1);
    w *= 1 - k;
    if (k >= 1) return null;
  }
  return {x, y, w, rot: lerp(o.rot0 ?? 0, o.rot1 ?? o.rot0 ?? 0, p), p};
}

/** A memory stick flying along an arc from A to B over [t0, t1], shrinking into the target. Speed ticks trail it. */
export const StickFlight: React.FC<StickFlightOpts & {seed?: string; ink?: number; trail?: boolean}> = ({seed = 'fly', ink, trail = true, ...o}) => {
  const t = useTime();
  const pose = flightPose(t, o);
  if (!pose || pose.w < 4) return null;
  // two short trail ticks behind the stick (direction of travel, from a pose 0.04 s earlier)
  const prev = flightPose(Math.max(o.t0, t - 0.04), {...o, end: 'land'});
  let trailD = '';
  if (trail && prev && pose.p > 0.05 && pose.p < 0.95) {
    const dx = pose.x - prev.x;
    const dy = pose.y - prev.y;
    const len = Math.hypot(dx, dy);
    if (len > 2) {
      const ux = dx / len;
      const uy = dy / len;
      const nx = -uy;
      const ny = ux;
      const back = pose.w * 0.55;
      const L = Math.min(pose.w * 0.6, len * 3);
      for (const s of [-0.18, 0.18]) {
        const sx = pose.x - ux * back + nx * pose.w * s;
        const sy = pose.y - uy * back + ny * pose.w * s;
        trailD += `M${sx.toFixed(1)} ${sy.toFixed(1)}L${(sx - ux * L).toFixed(1)} ${(sy - uy * L).toFixed(1)}`;
      }
    }
  }
  return (
    <>
      {trailD ? <path d={trailD} stroke={EMBER.ink} strokeWidth={1.8} strokeLinecap="round" fill="none" /> : null}
      <MemoryStick x={pose.x} y={pose.y} w={pose.w} rot={pose.rot} seed={seed} ink={ink} />
    </>
  );
};

// ---------------------------------------------------------------- the pile (a mountain of sticks)

export type PileProps = {
  /** Centre x and the ground line y (the pile's base). */
  x: number;
  y: number;
  /** Base width and height (px). Wider than the frame is fine (S9: 840 x 372, past the right edge). */
  w: number;
  h: number;
  /** Largest stick (px, front row). Capped at 130 so a big pile gets MORE sticks, not bigger ones. */
  stickW?: number;
  /** Build: sticks pop in row by row from the bottom up over `dur` from `at`. */
  at?: At;
  dur?: number;
  seed?: string;
  /** Screen ink of the silhouette (the sticks inside get hairlines). */
  ink?: number;
};

type PileStick = {x: number; y: number; w: number; rot: number; shade: boolean; back: boolean; row: number};

const pileCache = new Map<string, {sticks: PileStick[]; rows: number; outline: string; mound: string}>();

/** Half-width of the mound at height `dy` above the base (0..h): a rounded heap. */
const moundHalf = (w: number, h: number, dy: number) => (w / 2) * Math.pow(Math.max(0, 1 - Math.pow(dy / h, 1.7)), 0.62);

function pileLayout(x: number, y: number, w: number, h: number, stickW: number, seed: string) {
  const key = [x, y, w, h, stickW, seed].join('|');
  const hit = pileCache.get(key);
  if (hit) return hit;
  const r = rng(`pile/${seed}`);
  const sticks: PileStick[] = [];
  const rowStep = stickW * STICK_RATIO * 0.78;
  const rows = Math.ceil(h / rowStep);
  // back (top) rows first, so the front rows overlap them
  for (let ri = rows - 1; ri >= 0; ri--) {
    const dy = ri * rowStep + rowStep * 0.5;
    const half = moundHalf(w, h, Math.min(h, dy));
    if (half < stickW * 0.3) continue;
    const depth = dy / h; // 0 front .. 1 top
    const sw = stickW * lerp(1, 0.78, depth);
    const step = sw * 0.62;
    const n = Math.max(1, Math.round((half * 2) / step));
    for (let i = 0; i < n; i++) {
      const u = (i + 0.5) / n;
      sticks.push({
        x: x - half + u * half * 2 + r.jitter(step * 0.35),
        y: y - dy + r.jitter(rowStep * 0.35),
        w: sw * r.range(0.86, 1),
        // mostly near level (steep, pale-edged sticks at random angles read as fries or hay at phone size)
        rot: r.chance(0.07) ? r.range(50, 70) * (r.chance(0.5) ? 1 : -1) : r.jitter(30),
        shade: r.chance(0.3),
        back: r.chance(0.3),
        row: ri,
      });
    }
  }
  // silhouette: the mound top with a few sticks poking out
  const pts: Pt[] = [];
  const N = 40;
  for (let i = 0; i <= N; i++) {
    const dy = h * (1 - Math.pow(Math.abs(i / N - 0.5) * 2, 1.25));
    const half = moundHalf(w, h, dy);
    const sgn = i < N / 2 ? -1 : 1;
    pts.push([x + sgn * half + r.jitter(6), y - dy + r.jitter(5)]);
  }
  pts.sort((a, c) => a[0] - c[0]);
  const mound = polyPath([[x - w / 2, y + 4], ...pts, [x + w / 2, y + 4]]);
  const outline = pts.map(([px, py], i) => `${i ? 'L' : 'M'}${px.toFixed(1)} ${py.toFixed(1)}`).join('');
  const out = {sticks, rows, outline, mound};
  pileCache.set(key, out);
  return out;
}

/** One pile stick as raw SVG (cheap: a pile has hundreds). */
const RawStick: React.FC<{s: PileStick; scale: number}> = ({s, scale}) => {
  const w = s.w * scale;
  if (w < 3) return null;
  const h = w * STICK_RATIO;
  const x0 = -w / 2;
  const y0 = -h / 2;
  const cw = (w * 0.88 - w * 0.04 * 3) / 4;
  let chips = '';
  for (let i = 0; i < 4; i++) chips += `M${(x0 + w * 0.06 + i * (cw + w * 0.04)).toFixed(1)} ${(y0 + h * 0.13).toFixed(1)}h${cw.toFixed(1)}v${(h * 0.5).toFixed(1)}h${(-cw).toFixed(1)}Z`;
  return (
    <g transform={`translate(${s.x.toFixed(1)} ${s.y.toFixed(1)}) rotate(${s.rot.toFixed(1)})`}>
      <rect x={x0} y={y0} width={w} height={h} fill={s.shade ? EMBER.boardDeep : EMBER.board} />
      <rect x={x0 + w * 0.05} y={y0 + h * 0.76} width={w * 0.9} height={h * 0.24} fill={EMBER.pin} />
      {/* every pile stick shows its black chips (the stick's signature; v3 cold read: pale label backs read as hay) */}
      <path d={chips} fill={EMBER.chip} />
      <rect x={x0} y={y0} width={w} height={h} fill="none" stroke={EMBER.ink} strokeWidth={1.7} strokeLinejoin="round" />
    </g>
  );
};

export const Pile: React.FC<PileProps> = ({x, y, w, h, stickW = 130, at, dur = 0.8, seed = 'pile', ink = 3.4}) => {
  const t = useTime();
  const sw = Math.min(130, stickW);
  const L = pileLayout(x, y, w, h, sw, seed);
  const shown = (row: number) => (at === undefined ? 1 : prog(t, at + (row / Math.max(1, L.rows - 1)) * dur, 0.12, ease.outCubic));
  return (
    <>
      <Fill d={L.mound} color={EMBER.boardDeep} at={at} seed={`${seed}/mound`} offset={false} />
      {L.sticks.map((s, i) => {
        const k = shown(s.row);
        return k <= 0 ? null : <RawStick key={i} s={s} scale={0.2 + 0.8 * k} />;
      })}
      <Ink d={L.outline} at={b(at, dur * 0.6)} width={ink} />
    </>
  );
};

/** The stick count of a pile (for the README's sizing notes and lint). */
export const pileCount = (w: number, h: number, stickW = 130, seed = 'pile') => pileLayout(0, 0, w, h, Math.min(130, stickW), seed).sticks.length;
