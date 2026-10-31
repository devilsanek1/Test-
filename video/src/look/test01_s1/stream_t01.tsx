// test01_s1: THE STREAM (CARD.md §2, §6): the story light's moving part, drawn live (it is the subject: crisp, never
// painted, ready to climb in motion). A winding ribbon of candle-gold light from the waking pages up the bridge's face to
// her phone: widest and softest where it gathers off the pages, a hot thin core, narrowing as it reaches her hand; loops
// of the old script coming loose around it as light (soft gold curls, never letters, never ink); her phone at its end,
// glowing (the question and the answer are one light). Its light on the stone, the brick and the water is the bake's
// (bake/light_t01.py reads the same points from scene.json).
import React, {useId} from 'react';
import {useMoverOn} from './context';
import {GOLD, streamScreen} from './rig';

type P = [number, number];

/** Catmull-Rom through the points, sampled densely. */
function spline(pts: P[], n = 18): P[] {
  const out: P[] = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    for (let k = 0; k < n; k++) {
      const t = k / n;
      const t2 = t * t;
      const t3 = t2 * t;
      const f = (a: number, b: number, c: number, d: number) => 0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
      out.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])]);
    }
  }
  out.push(pts[pts.length - 1]);
  return out;
}

/** A tapered ribbon (a filled path) along the curve: width w(t) at t in 0..1. */
function ribbon(c: P[], w: (t: number) => number): string {
  const L: P[] = [];
  const R: P[] = [];
  for (let i = 0; i < c.length; i++) {
    const a = c[Math.max(0, i - 1)];
    const b = c[Math.min(c.length - 1, i + 1)];
    let dx = b[0] - a[0];
    let dy = b[1] - a[1];
    const n = Math.hypot(dx, dy) || 1;
    dx /= n;
    dy /= n;
    const hw = w(i / (c.length - 1)) / 2;
    L.push([c[i][0] - dy * hw, c[i][1] + dx * hw]);
    R.push([c[i][0] + dy * hw, c[i][1] - dx * hw]);
  }
  const f = (p: P) => `${p[0].toFixed(2)} ${p[1].toFixed(2)}`;
  return `M${L.map(f).join('L')}L${R.reverse().map(f).join('L')}Z`;
}

/** One loop of script coming loose: a cursive curl (a loop and a tail), at `c`, size r, turned by `rot`. */
function loop(c: P, r: number, rot: number, turns: number): string {
  const pts: P[] = [];
  const N = 40;
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const a = t * Math.PI * 2 * turns;
    // a prolate cycloid: the pen moving along while it loops (handwriting's own motion)
    const x = r * (1.6 * t - 0.8) + r * 0.62 * Math.sin(a);
    const y = -r * 0.62 * (1 - Math.cos(a)) * (0.6 + 0.4 * Math.sin(t * Math.PI));
    const cs = Math.cos(rot);
    const sn = Math.sin(rot);
    pts.push([c[0] + x * cs - y * sn, c[1] + x * sn + y * cs]);
  }
  return 'M' + pts.map((p) => `${p[0].toFixed(2)} ${p[1].toFixed(2)}`).join('L');
}

/** The loops along the stream: (t along it, side offset px, size px, rotation, turns, opacity). */
const LOOPS: [number, number, number, number, number, number][] = [
  [0.14, -20, 9, -0.5, 2.0, 0.75],
  [0.26, 18, 11, 0.6, 1.5, 0.8],
  [0.4, -17, 8, -0.9, 2.0, 0.7],
  [0.52, 15, 9, 0.3, 1.5, 0.65],
  [0.66, -13, 7, -0.3, 2.0, 0.55],
  [0.78, 12, 6, 0.8, 1.5, 0.45],
];

export const Stream: React.FC<{phone: P}> = ({phone}) => {
  const on = useMoverOn('stream');
  const id = 'st' + useId().replace(/[^a-zA-Z0-9]/g, '');
  if (!on) return null;
  const pts = streamScreen();
  pts[pts.length - 1] = phone;
  const c = spline(pts as P[]);
  const at = (t: number): P => c[Math.min(c.length - 1, Math.max(0, Math.round(t * (c.length - 1))))];
  const norm = (t: number): P => {
    const a = at(Math.max(0, t - 0.02));
    const b = at(Math.min(1, t + 0.02));
    const n = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
    return [-(b[1] - a[1]) / n, (b[0] - a[0]) / n];
  };
  const halo = ribbon(c, (t) => 30 - 16 * t);
  const glow = ribbon(c, (t) => 12 - 6 * t);
  const core = ribbon(c, (t) => 4.2 - 2.4 * t);
  return (
    <g>
      <defs>
        <filter id={`${id}b14`} x="-50%" y="-20%" width="200%" height="140%">
          <feGaussianBlur stdDeviation={11} />
        </filter>
        <filter id={`${id}b5`} x="-50%" y="-20%" width="200%" height="140%">
          <feGaussianBlur stdDeviation={3.6} />
        </filter>
        <filter id={`${id}b1`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation={0.9} />
        </filter>
        <radialGradient id={`${id}ph`}>
          <stop offset="0" stopColor={GOLD.hot} stopOpacity={0.95} />
          <stop offset="0.35" stopColor={GOLD.gold} stopOpacity={0.5} />
          <stop offset="1" stopColor={GOLD.ember} stopOpacity={0} />
        </radialGradient>
      </defs>
      <g style={{mixBlendMode: 'screen'}}>
        <path d={halo} fill={GOLD.gold} opacity={0.42} filter={`url(#${id}b14)`} />
        <path d={glow} fill={GOLD.hot} opacity={0.7} filter={`url(#${id}b5)`} />
        {LOOPS.map(([t, off, r, rot, turns, op], i) => {
          const p = at(t);
          const n = norm(t);
          const q: P = [p[0] + n[0] * off, p[1] + n[1] * off];
          const d = loop(q, r, rot, turns);
          return (
            <g key={i} opacity={op}>
              <path d={d} fill="none" stroke={GOLD.gold} strokeWidth={4.5} strokeLinecap="round" opacity={0.45} filter={`url(#${id}b5)`} />
              <path d={d} fill="none" stroke={GOLD.hot} strokeWidth={1.7} strokeLinecap="round" filter={`url(#${id}b1)`} />
            </g>
          );
        })}
        <path d={core} fill={GOLD.core} filter={`url(#${id}b1)`} />
        <circle cx={phone[0]} cy={phone[1]} r={26} fill={`url(#${id}ph)`} />
      </g>
    </g>
  );
};

/** Her phone in her hand at the stream's end: held out flat over the water, its screen lit gold (we see its glowing
 *  edge and the light under it from below). */
export const Phone: React.FC<{at: P}> = ({at}) => {
  const on = useMoverOn('stream');
  if (!on) return null;
  const [x, y] = at;
  return (
    <g transform={`translate(${x} ${y}) rotate(-8)`}>
      <rect x={-7.5} y={-2.2} width={15} height={4.4} rx={1.6} fill="#2A2632" />
      <rect x={-6.8} y={0.2} width={13.6} height={2.2} rx={1.0} fill={GOLD.core} />
    </g>
  );
};
