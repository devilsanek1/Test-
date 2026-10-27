// SQB_chart (HOME lane; docs/v3/flow_v2.md §4 SQB, §5): THE CHART on the nook's card (home_set's CARD, right of the
// window), drawn in H1 px right after the card's paper and static face (title, subtitle, axes, 2005, 2025), so it sits
// in the room's ambient light like the paper it is printed on (card unlit: no light layer, no shadow of its own).
// Keyed on FILM time: SQB draws it as its subject, SQC draws the finished card through J2's pan back (the same
// component, so the J2 seam is one drawing).
//
//   6.98-9.28   the line draws DOWNHILL with the voice ("Laptops get better for the same money"), 2005 -> Sept 2025,
//               one small bump in 2021 (FL 1.6); the pen's head is a hero dot that stays on the
//               stroke's end once drawn ("now": the eye waits there for the hook)
//   10.32-10.50 a doodle laptop drops onto the line (~2010) and lands on "buy" (10.60): its screen says "$999"
//   10.82       a shinier, bigger BETTER one pops onto the line right after it (~2015.5), the SAME "$999" ("one." 10.92):
//               same money, better laptop = lower on the line (the index is quality-adjusted, FL 1.8/1.9)
//   13.85-14.45 the line hooks UP (Sept 2025 -> Sept 2026), ending just before "up" (14.52)
//   14.74       "+9.7%" pops alone, above the hook ("almost10%" 14.84)
//   15.05       the source, small, at the card's foot: "US computers · Sept 2026 vs a year earlier (BLS)"
// The shape is the BLS index's (CUUR0000SEEE01, FL 1.6-1.8): falling fast early and slower later, the 2021 bump, the
// turn up at the end; no y numbers (the label carries the one number). Hierarchy (CRAFT §b): the line, then the
// doodles, then the hook and "+9.7%" are the subject in turn (the hero colour, the laptops' full outline; the line is a
// graphic stroke); nothing else on the card moves. Layout: the old deal reads left to right (the falling line, the
// doodles in the middle, the turn and its number on the right), each clear of the static face.
import React from 'react';
import {Tier} from '../../../lib/tier';
import {clamp, ease, prog, useTime} from '../../../lib/time';
import {mat, XG} from '../../../lib/xf';
import {EMBER, Laptop, laptopGeo, Txt, type Pt} from '../kit';
import {TCircle, TPath} from '../kit/util';
import {CARD, plotPt} from './home_set';

// ================================================================= the data (year, v: 0..1 of the plot's height)

/** u 0..1 = 2005..2026 (home_set's plotPt; the 2025 label sits at u 0.95). */
const uOf = (year: number) => (year - 2005) / 21;
const P = (year: number, v: number): Pt => plotPt([uOf(year), v]);

/** The line, Jan 2005 -> Sept 2025: the index falls fast early, slower later, one small bump in 2021 (FL 1.6). */
export const LINE_PTS: [number, number][] = [
  [2005.0, 0.88],
  [2006.5, 0.765],
  [2008.0, 0.668],
  [2010.0, 0.56],
  [2012.0, 0.478],
  [2014.0, 0.412],
  [2016.0, 0.357],
  [2018.0, 0.312],
  [2019.8, 0.278],
  [2020.7, 0.264],
  [2021.5, 0.305],
  [2022.4, 0.256],
  [2024.0, 0.217],
  [2025.7, 0.186],
];
/** The hook, Sept 2025 -> Sept 2026 (a quadratic: it leaves level, then turns UP; it ends at the x axis's end). */
const HOOK = {c: [2026.35, 0.19] as [number, number], end: [2026.7, 0.452] as [number, number]};

/** Catmull-Rom through pts (centripetal enough for our gentle data), sampled every ~3 px. */
function catmull(pts: Pt[]): Pt[] {
  const out: Pt[] = [pts[0]];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    const n = Math.max(2, Math.ceil(Math.hypot(p2[0] - p1[0], p2[1] - p1[1]) / 3));
    for (let k = 1; k <= n; k++) {
      const t = k / n;
      const t2 = t * t;
      const t3 = t2 * t;
      const f = (a: number, b: number, c: number, d: number) => 0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
      out.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])]);
    }
  }
  return out;
}

function quad(a: Pt, c: Pt, b: Pt, n: number): Pt[] {
  const out: Pt[] = [];
  for (let k = 1; k <= n; k++) {
    const t = k / n;
    const v = 1 - t;
    out.push([v * v * a[0] + 2 * v * t * c[0] + t * t * b[0], v * v * a[1] + 2 * v * t * c[1] + t * t * b[1]]);
  }
  return out;
}

/** The whole stroke (H1 px): the line's samples, then the hook's; and where the hook starts along it. */
const LINE_XY = catmull(LINE_PTS.map(([yr, v]) => P(yr, v)));
const HOOK_XY = quad(LINE_XY[LINE_XY.length - 1], P(HOOK.c[0], HOOK.c[1]), P(HOOK.end[0], HOOK.end[1]), 14);
const STROKE: Pt[] = [...LINE_XY, ...HOOK_XY];
const CUM: number[] = STROKE.reduce<number[]>((acc, p, i) => {
  acc.push(i ? acc[i - 1] + Math.hypot(p[0] - STROKE[i - 1][0], p[1] - STROKE[i - 1][1]) : 0);
  return acc;
}, []);
const L_LINE = CUM[LINE_XY.length - 1];
const L_ALL = CUM[CUM.length - 1];

/** The stroke cut at length s (its points, the last one interpolated). */
function upTo(s: number): Pt[] {
  if (s >= L_ALL) return STROKE;
  const out: Pt[] = [STROKE[0]];
  for (let i = 1; i < STROKE.length; i++) {
    if (CUM[i] >= s) {
      const k = (s - CUM[i - 1]) / Math.max(1e-6, CUM[i] - CUM[i - 1]);
      out.push([STROKE[i - 1][0] + (STROKE[i][0] - STROKE[i - 1][0]) * k, STROKE[i - 1][1] + (STROKE[i][1] - STROKE[i - 1][1]) * k]);
      return out;
    }
    out.push(STROKE[i]);
  }
  return out;
}

/** The line's point and its direction (degrees, screen) at a year (the line part only). */
export function linePose(year: number): {p: Pt; deg: number} {
  const x = P(year, 0)[0];
  for (let i = 1; i < LINE_XY.length; i++) {
    if (LINE_XY[i][0] >= x) {
      const a = LINE_XY[i - 1];
      const b = LINE_XY[i];
      const k = (x - a[0]) / Math.max(1e-6, b[0] - a[0]);
      return {p: [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k], deg: (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI};
    }
  }
  return {p: LINE_XY[LINE_XY.length - 1], deg: 0};
}

const pathOf = (pts: Pt[]) => pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join('');

// ================================================================= the beats (film seconds)

export const CHART_BEATS = {
  draw: [6.98, 9.28] as [number, number],
  drop: [10.32, 10.5] as [number, number],
  better: 10.82,
  hook: [13.85, 14.45] as [number, number],
  label: 14.74,
  source: 15.05,
};
export const LINE_W = 9;

// ================================================================= the doodles (two kit laptops standing ON the line)

/** A doodle: a kit laptop standing on the line at `year` (its deck's front edge on the stroke's top, tilted with the
 *  line), "$999" on its screen. */
export const DOODLES = {
  mine: {year: 2010.0, w: 84},
  better: {year: 2015.6, w: 96},
};

/** How much of the line's slope a doodle takes (1 = flush on the slope, like a sled; 0 = level): a hint of it, so it
 *  rests ON the line without sliding down it. */
const TILT = 0.35;

/** Where a doodle stands: its hinge (the kit Laptop's x, y), rotation and its foot point (its deck's front edge
 *  centre, on the stroke: the line passes under the deck, so the laptop stands ON it). */
export function doodlePose(year: number, w: number): {x: number; y: number; rot: number; foot: Pt} {
  const {p, deg} = linePose(year);
  const rot = deg * TILT;
  const a = (rot * Math.PI) / 180;
  // the foot: a hair above the stroke's centre (the deck's front edge covers the stroke's top half)
  const foot: Pt = [p[0], p[1] - LINE_W * 0.15];
  // the laptop's lowest point (its deck's front edge, with the edge strip) sits 0.27 w under the hinge (laptopGeo)
  const d = w * 0.27;
  return {x: foot[0] + Math.sin(a) * d, y: foot[1] - Math.cos(a) * d, rot, foot};
}

/** The price on a doodle's screen (upright in the laptop's frame), a little right of centre and up: the kit's screen
 *  glint lies in the screen's lower-left corner. */
const ScreenPrice: React.FC<{x: number; y: number; w: number; dark: boolean}> = ({x, y, w, dark}) => {
  const g = laptopGeo(x, y, w);
  const [cx, cy] = g.screenC;
  const size = Math.round(w * 0.27);
  return (
    <Txt x={cx + w * 0.08} y={cy + size * 0.24} size={size} fill={dark ? EMBER.core : EMBER.ink} fit={w * 0.6}>
      $999
    </Txt>
  );
};

/** The BETTER badge over the new laptop's lid: a small warm-white card with ink letters (the kit's label, at the
 *  doodle's size: the kit's own starts at 34 px letters, too big for a 96 px laptop on the card). */
const BetterBadge: React.FC<{x: number; y: number; w: number}> = ({x, y, w}) => {
  const g = laptopGeo(x, y, w);
  const top = (g.lid[0][1] + g.lid[1][1]) / 2;
  const cx = (g.lid[0][0] + g.lid[1][0]) / 2;
  const size = Math.round(w * 0.24);
  const bw = size * 3.6;
  const bh = size * 1.2;
  const by = top - bh - w * 0.06;
  const r = bh * 0.2;
  return (
    <>
      <TPath
        d={`M${cx - bw / 2 + r} ${by}H${cx + bw / 2 - r}Q${cx + bw / 2} ${by} ${cx + bw / 2} ${by + r}V${by + bh - r}Q${cx + bw / 2} ${by + bh} ${cx + bw / 2 - r} ${by + bh}H${cx - bw / 2 + r}Q${cx - bw / 2} ${by + bh} ${cx - bw / 2} ${by + bh - r}V${by + r}Q${cx - bw / 2} ${by} ${cx - bw / 2 + r} ${by}Z`}
        fill={EMBER.white}
        stroke={EMBER.beam}
        strokeWidth={2}
        tone={EMBER.white}
      />
      <Txt x={cx} y={by + bh * 0.76} size={size} fit={bw * 0.86}>
        BETTER
      </Txt>
    </>
  );
};

const Doodle: React.FC<{year: number; w: number; variant: 'old' | 'new'; seed: string}> = ({year, w, variant, seed}) => {
  const q = doodlePose(year, w);
  return (
    <XG m={mat.about(mat.rotate(q.rot), q.x, q.y)}>
      <Laptop x={q.x} y={q.y} w={w} variant={variant} seed={seed}>
        <ScreenPrice x={q.x} y={q.y} w={w} dark={variant === 'old'} />
      </Laptop>
      {variant === 'new' ? <BetterBadge x={q.x} y={q.y} w={w} /> : null}
    </XG>
  );
};

/** Laptop 1 drops onto the line (a 40 px fall along the line's normal, outCubic) and lands with a small squash. */
const MineDoodle: React.FC<{T: number}> = ({T}) => {
  const [t0, t1] = CHART_BEATS.drop;
  if (T < t0) return null;
  const {w, year} = DOODLES.mine;
  const q = doodlePose(year, w);
  const a = (q.rot * Math.PI) / 180;
  const fall = 40 * (1 - ease.outCubic(clamp((T - t0) / (t1 - t0))));
  // the landing: one squash of 8 % about the foot (along the laptop's own axes) and back, over 0.12 s
  const k = T < t1 ? 0 : clamp((T - t1) / 0.12);
  const sq = 1 - 0.08 * Math.sin(Math.PI * k);
  const m = mat.mul(mat.translate(Math.sin(a) * fall, -Math.cos(a) * fall), mat.about(mat.compose(mat.rotate(q.rot), mat.scale(1 + (1 - sq) * 0.5, sq), mat.rotate(-q.rot)), q.foot[0], q.foot[1]));
  return (
    <XG m={m}>
      <Doodle year={year} w={w} variant="old" seed="sqb/mine" />
    </XG>
  );
};

/** Laptop 2 pops in place (about its foot, 0.2 -> 1 with a small overshoot, 0.14 s). */
const BetterDoodle: React.FC<{T: number}> = ({T}) => {
  const at = CHART_BEATS.better;
  if (T < at) return null;
  const {w, year} = DOODLES.better;
  const q = doodlePose(year, w);
  const p = prog(T, at, 0.14, ease.outBack(1.4));
  const s = 0.2 + 0.8 * p;
  const body = <Doodle year={year} w={w} variant="new" seed="sqb/better" />;
  return s >= 0.999 && p >= 1 ? body : <XG m={mat.about(mat.scale(s), q.foot[0], q.foot[1])}>{body}</XG>;
};

// ================================================================= "+9.7%" and the source

/** "+9.7%": right-aligned over the hook's top (its right end near the card's right margin), clear of the falling line
 *  under it and of the BETTER doodle on its left. */
export const LABEL = (() => {
  const top = P(HOOK.end[0], HOOK.end[1]);
  return {x: CARD.x + CARD.w - 26, y: top[1] - 30, size: 110};
})();
const SOURCE = {x: CARD.x + CARD.w / 2, y: CARD.y + CARD.h - 13, size: 22};

const Label: React.FC<{T: number}> = ({T}) => {
  if (T < CHART_BEATS.label) return null;
  const p = prog(T, CHART_BEATS.label, 0.16, ease.outBack(1.4));
  const s = 0.2 + 0.8 * p;
  // centred on the label's own middle (it is right-aligned: its width is ~2.2 x its size)
  const cx = LABEL.x - LABEL.size * 1.1;
  const cy = LABEL.y - LABEL.size * 0.33;
  const txt = (
    <Txt x={LABEL.x} y={LABEL.y} size={LABEL.size} fill={EMBER.hero} anchor="end">
      +9.7%
    </Txt>
  );
  return s >= 0.999 && p >= 1 ? txt : <XG m={mat.about(mat.scale(s), cx, cy)}>{txt}</XG>;
};

const Source: React.FC<{T: number}> = ({T}) => {
  if (T < CHART_BEATS.source) return null;
  const p = prog(T, CHART_BEATS.source, 0.1, ease.outCubic);
  const s = 0.7 + 0.3 * p;
  const txt = (
    <Txt x={SOURCE.x} y={SOURCE.y} size={SOURCE.size} fill="#6E4A3A" fit={CARD.w * 0.9}>
      US computers · Sept 2026 vs a year earlier (BLS)
    </Txt>
  );
  return s >= 0.999 ? txt : <XG m={mat.about(mat.scale(s), SOURCE.x, SOURCE.y - SOURCE.size * 0.3)}>{txt}</XG>;
};

// ================================================================= the chart

/** How much of the stroke is drawn at film time T (px along it) and whether the pen's dot shows (it rides the head
 *  while the line draws and then stays on the stroke's end: "now", where the hook will turn up). */
export function strokeAt(T: number): {s: number; pen: boolean} {
  const [d0, d1] = CHART_BEATS.draw;
  const [h0, h1] = CHART_BEATS.hook;
  if (T < d0) return {s: 0, pen: false};
  if (T < d1) return {s: L_LINE * ease.inOutSine((T - d0) / (d1 - d0)), pen: true};
  if (T < h0) return {s: L_LINE, pen: true};
  if (T < h1) return {s: L_LINE + (L_ALL - L_LINE) * ease.inOutSine((T - h0) / (h1 - h0)), pen: true};
  return {s: L_ALL, pen: true};
}

/** THE CHART at film time T (H1 px; draw it as HomeSet's `card`). Nothing before 6.98 (the J1 seam sees the bare
 *  face only). */
export const OldDealChart: React.FC<{T?: number}> = ({T: Tin}) => {
  const t = useTime();
  const T = Tin ?? t;
  const {s, pen} = strokeAt(T);
  if (s <= 0) return null;
  const pts = upTo(s);
  const head = pts[pts.length - 1];
  return (
    <Tier tier="subject">
      <TPath d={pathOf(pts)} stroke={EMBER.hero} strokeWidth={LINE_W} strokeLinecap="round" strokeLinejoin="round" fill="none" graphic />
      {pen ? <TCircle cx={head[0]} cy={head[1]} r={LINE_W * 0.95} fill={EMBER.hero} /> : null}
      <MineDoodle T={T} />
      <BetterDoodle T={T} />
      <Label T={T} />
      <Source T={T} />
    </Tier>
  );
};
