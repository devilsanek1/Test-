// kit/Charts.tsx: the insert cards (S4 = S6, S11): a flat warm-white card, straight-on and level (charts are never
// angled: an angle bends the slope), ink L axes, the caption hand for every word. LineChart draws its hero line ON with
// the voice (a progressive line, not the 0.1-0.2 s pen pacing), then an optional hook up and a label (+9.7%).
// BarChart grows two bars from the baseline ("last year" and the 5x one), a memory stick on each.

import React from 'react';
import {Ink} from '../../../lib/Ink';
import {Fill} from '../../../lib/Fill';
import {line, poly, polyPath, rect as rectInk} from '../../../lib/sketch';
import {useTime, prog, ease, clamp} from '../../../lib/time';
import {EMBER} from '../palette';
import {At, b, fillAt, lerp, Pt, Pop, Show, Txt, TCircle, TPath} from './util';
import {MemoryStick} from './Memory';
import {tiered} from '../../../lib/tier';

// ---------------------------------------------------------------- the card

/** A flat insert card (no shadow, no texture): warm white with a mid ink edge. */
const ChartCardBody: React.FC<{x: number; y: number; w: number; h: number; at?: At; seed?: string; color?: string; children?: React.ReactNode}> = ({x, y, w, h, at, seed = 'card', color = EMBER.card, children}) => (
  <>
    <Fill rect={[x, y, w, h]} color={color} at={fillAt(at)} seed={`${seed}/f`} />
    <Ink d={rectInk(x, y, w, h, {seed: `${seed}/i`, over: 'medium'})} at={at} width={3.4} />
    {children}
  </>
);
export const ChartCard = tiered('support', {tone: EMBER.card, lines: true}, ChartCardBody);

// ---------------------------------------------------------------- line chart

export type LineChartProps = {
  /** The plot box (axes origin at its bottom-left), canvas px. The title sits above it, the years under it. */
  x: number;
  y: number;
  w: number;
  h: number;
  title?: string;
  /** Year labels spread along the x axis (first at the left end, last at the right end). */
  years?: string[];
  /** The line: points in 0..1 (u right, v up). Default: 20 years of falling prices. */
  data?: Pt[];
  /** The line draws on from drawAt over drawDur (seconds). Omit drawAt = drawn. */
  drawAt?: number;
  drawDur?: number;
  /** The hook (the turn up at the end): points continuing from the last data point, drawn from hookAt. */
  hook?: Pt[];
  hookAt?: number;
  hookDur?: number;
  /** A big label near the hook's end (e.g. "+9.7%"), popping at labelAt. */
  label?: string;
  labelAt?: number;
  labelPos?: Pt;
  lineWidth?: number;
  color?: string;
  at?: At;
  seed?: string;
};

export const PRICE_LINE: Pt[] = [
  [0, 0.92],
  [0.1, 0.82],
  [0.2, 0.7],
  [0.3, 0.62],
  [0.42, 0.5],
  [0.55, 0.42],
  [0.66, 0.34],
  [0.78, 0.28],
  [0.88, 0.24],
];
export const PRICE_HOOK: Pt[] = [
  [0.94, 0.27],
  [1.0, 0.4],
];

/** A polyline cut at progress p (0..1 of its length). */
function partial(pts: Pt[], p: number): Pt[] {
  if (p >= 1) return pts;
  if (p <= 0 || pts.length < 2) return pts.slice(0, 1);
  const seg: number[] = [];
  let total = 0;
  for (let i = 1; i < pts.length; i++) {
    const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    seg.push(l);
    total += l;
  }
  let target = total * p;
  const out: Pt[] = [pts[0]];
  for (let i = 1; i < pts.length; i++) {
    if (target <= seg[i - 1]) {
      const k = target / (seg[i - 1] || 1);
      out.push([lerp(pts[i - 1][0], pts[i][0], k), lerp(pts[i - 1][1], pts[i][1], k)]);
      return out;
    }
    target -= seg[i - 1];
    out.push(pts[i]);
  }
  return out;
}

const pathOf = (pts: Pt[]) => pts.map(([px, py], i) => `${i ? 'L' : 'M'}${px.toFixed(1)} ${py.toFixed(1)}`).join('');

const LineChartBody: React.FC<LineChartProps> = ({
  x,
  y,
  w,
  h,
  title = 'U.S. computer prices',
  years = ['2005'],
  data = PRICE_LINE,
  drawAt,
  drawDur = 2.3,
  hook,
  hookAt,
  hookDur = 1.2,
  label,
  labelAt,
  labelPos,
  lineWidth = 9,
  color = EMBER.hero,
  at,
  seed = 'line',
}) => {
  const t = useTime();
  const P = (u: number, v: number): Pt => [x + u * w, y + h - v * h];
  const main = data.map(([u, v]) => P(u, v));
  const pMain = drawAt === undefined ? 1 : prog(t, drawAt, drawDur, ease.inOutSine);
  const shown = drawAt !== undefined && t < drawAt ? [] : partial(main, pMain);
  const hk = hook ? [main[main.length - 1], ...hook.map(([u, v]) => P(u, v))] : null;
  const pHook = hookAt === undefined ? (hook ? 1 : 0) : prog(t, hookAt, hookDur, ease.inOutSine);
  const hookShown = hk && (hookAt === undefined || t >= hookAt) ? partial(hk, pHook) : [];
  const head = hookShown.length > 1 ? hookShown[hookShown.length - 1] : shown.length > 1 && pMain < 1 ? shown[shown.length - 1] : null;
  const axes = poly([[x, y - h * 0.08], [x, y + h], [x + w * 1.04, y + h]], {seed: `${seed}/ax`, over: [4, 10]});
  const ticks = years.map((_, i) => {
    const u = years.length === 1 ? 0 : i / (years.length - 1);
    return line(x + u * w, y + h, x + u * w, y + h + 16, {over: [0, 0], seed: `${seed}/tk${i}`});
  });
  const lp = labelPos ?? (hk ? [hk[hk.length - 1][0] - w * 0.12, hk[hk.length - 1][1] - h * 0.18] : P(0.7, 0.75));
  return (
    <>
      <Show at={fillAt(at)}>
        <Txt x={x + w / 2} y={y - h * 0.16} size={Math.min(64, w * 0.085)} fit={w * 1.05}>
          {title}
        </Txt>
      </Show>
      <Ink d={axes + ticks.join('')} at={at} width={4.8} />
      <Show at={fillAt(at, 0.04)}>
        {years.map((yr, i) => {
          const u = years.length === 1 ? 0 : i / (years.length - 1);
          return (
            <Txt key={i} x={x + u * w} y={y + h + 74} size={56}>
              {yr}
            </Txt>
          );
        })}
      </Show>
      {shown.length > 1 ? <TPath d={pathOf(shown)} stroke={color} strokeWidth={lineWidth} strokeLinecap="round" strokeLinejoin="round" fill="none" /> : null}
      {hookShown.length > 1 ? <TPath d={pathOf(hookShown)} stroke={color} strokeWidth={lineWidth} strokeLinecap="round" strokeLinejoin="round" fill="none" /> : null}
      {head ? <TCircle cx={head[0]} cy={head[1]} r={lineWidth * 1.15} fill={color} stroke={EMBER.ink} strokeWidth={2.2} /> : null}
      {label ? (
        <Pop at={labelAt} x={lp[0]} y={lp[1]} overshoot>
          <Txt x={lp[0]} y={lp[1]} size={Math.min(120, w * 0.16)} fill={color}>
            {label}
          </Txt>
        </Pop>
      ) : null}
    </>
  );
};
export const LineChart = tiered('subject', {}, LineChartBody);

// ---------------------------------------------------------------- bar chart

export type Bar = {label: string; v: number; color?: string; at?: number; stick?: boolean};

export type BarChartProps = {
  /** Axes origin (bottom-left of the plot), plot width and the height of the tallest bar. */
  x: number;
  y: number;
  w: number;
  h: number;
  bars?: Bar[];
  /** The big value label over the last bar ("5x"), popping at valueAt. */
  value?: string;
  valueAt?: number;
  at?: At;
  seed?: string;
};

const BarChartBody: React.FC<BarChartProps> = ({
  x,
  y,
  w,
  h,
  bars = [
    {label: 'last year', v: 1, color: EMBER.shelf},
    {label: '', v: 5, color: EMBER.anchor},
  ],
  value = '5x',
  valueAt,
  at,
  seed = 'bars',
}) => {
  const t = useTime();
  const vmax = Math.max(...bars.map((bb) => bb.v));
  const n = bars.length;
  const slot = w / n;
  const bw = slot * 0.62;
  const axes = poly([[x, y - h * 1.12], [x, y], [x + w, y]], {seed: `${seed}/ax`, over: [4, 10]});
  return (
    <>
      <Ink d={axes} at={at} width={4.8} />
      {bars.map((bar, i) => {
        const bh = (bar.v / vmax) * h;
        const bx = x + slot * i + (slot - bw) / 2;
        const growAt = bar.at ?? fillAt(at, 0.1 + i * 0.1);
        const g = growAt === undefined ? 1 : prog(t, growAt, 0.35, ease.outCubic);
        const top = y - bh * g;
        const color = bar.color ?? EMBER.shelf;
        return (
          <React.Fragment key={i}>
            <Fill rect={[bx, y - bh, bw, bh]} color={color} at={growAt} mode="grow" dir="up" dur={0.35} seed={`${seed}/b${i}`} />
            {growAt === undefined || t >= growAt ? <Ink d={rectInk(bx, top, bw, y - top, {seed: `${seed}/bi${i}`, edges: 'tlr', over: [0, 3]})} width={3.4} /> : null}
            {bar.stick !== false && g > 0.98 ? <MemoryStick x={bx + bw / 2} y={top - bw * 0.2} w={bw * 0.86} seed={`${seed}/st${i}`} at={growAt === undefined ? undefined : growAt + 0.3} /> : null}
            {bar.label ? (
              <Show at={fillAt(at, 0.04)}>
                <Txt x={bx + bw / 2} y={y + 70} size={56} fit={slot * 0.95}>
                  {bar.label}
                </Txt>
              </Show>
            ) : null}
            {i === n - 1 && value ? (
              <Pop at={valueAt} x={bx + bw / 2} y={y - bh - bw * 0.5} overshoot>
                <Txt x={bx + bw / 2} y={y - bh - bw * 0.42} size={Math.min(130, bw * 0.62)} fill={EMBER.ink}>
                  {value}
                </Txt>
              </Pop>
            ) : null}
          </React.Fragment>
        );
      })}
    </>
  );
};
export const BarChart = tiered('subject', {}, BarChartBody);
void polyPath;
void clamp;
void b;
