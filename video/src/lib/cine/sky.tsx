// cine/sky.tsx — flat skies for full-bleed shots: value-stepped bands, reference-style clouds, sunset streaks,
// stars, haze / fog bands between layers, rolling hills, flying birds. Everything is flat fills (no gradients,
// no blur); motion is drift, pops and wing flaps (no opacity animation).
//
//   <Sky tod="dusk" horizon={1010} />                                  // 4 flat value steps down to the horizon
//   <SkyCloud x={300} y={420} w={260} tod="day" drift={6} />           // white, inked top (ref 2 f_1)
//   <Streaks y={930} tod="dusk" n={4} />                               // thin sunset streak clouds near the horizon
//   <Stars tod="night" region={[0, 0, 1080, 700]} at={1} span={4} />  // pop in one by one, twinkle by size
//   <HazeBand y={985} h={70} color={TOD.dusk.haze} opacity={0.55} />  // flat fog between two city rows
//   <Hills y={1000} amp={40} color={palette.teal} seed="h1" />         // ref 2's rolling far hills
//   <Birds at={1.2} from={[-60, 640]} to={[1140, 520]} dur={6} n={5} />

import React, {useMemo} from 'react';
import {palette, stroke} from '../theme';
import {osc, prog, springAt, springs, useTime} from '../time';
import {rand, rng, Seed} from '../rng';
import {line, Pt} from '../sketch';
import {TodLike, TodPalette, todPal, useTodPal} from './atmosphere';
import {memoize, PathBuf, r1} from './util';
import {exitScale, inkOn, isPaper, lookPaint, toScreen, useCineState, xfScale} from './state';
import {ease as E} from '../time';

const WIDE = {x0: -1600, x1: 2680};

// ---------------------------------------------------------------- Sky

export type SkyProps = {
  tod?: TodLike | TodPalette;
  /** Horizon y (world). */
  horizon: number;
  /** Override band colours, top -> horizon. */
  colors?: string[];
  /** Band top edges as distances above the horizon (px), top -> bottom; length = colors.length - 1. */
  edges?: number[];
  /** Total height of the stepped part above the horizon. Default keeps every step below y 600, so the caption zone
   *  (y 280-570) sits on ONE flat value (style_bible_ref2 8): min(1150, horizon - 600), at least 160. */
  span?: number;
  /** How far the last band continues below the horizon (default 1600: the un-build slab covers the whole frame). */
  below?: number;
  x0?: number;
  x1?: number;
  top?: number;
  /** Hand-drawn band edges: each step edge breaks into streak tongues +- this many px (default 9; 0 = ruler-straight).
   *  No edge runs straight across the full width. */
  wobble?: number;
  seed?: Seed;
};

/** One band's top edge: streak tongues (stepped offsets joined by short ramps) so the step reads as layered
 *  cloud streaks, not a divider line. Returns the path of the band down to y1. */
function bandPath(x0: number, x1: number, y: number, y1: number, amp: number, seed: Seed): string {
  if (amp <= 0) return `M${r1(x0)} ${r1(y)}H${r1(x1)}V${r1(y1)}H${r1(x0)}Z`;
  return memoize(BAND_CACHE, `${x0},${x1},${r1(y)},${r1(y1)},${amp},${seed}`, () => {
    const r = rng(`band/${seed}`);
    let d = `M${r1(x0)} ${r1(y1)}L${r1(x0)} ${r1(y)}`;
    let x = x0;
    let cy = y;
    while (x < x1) {
      const len = r.range(170, 430);
      const ny = y + r.pick([-1, -0.55, 0, 0.45, 1]) * amp;
      const ramp = Math.min(60, len * 0.25);
      // short ramp to the new level (a quadratic, like the end of a streak), then a long flat run
      d += `Q${r1(x + ramp * 0.5)} ${r1(cy)} ${r1(x + ramp)} ${r1(ny)}L${r1(Math.min(x1 + 40, x + len))} ${r1(ny)}`;
      cy = ny;
      x += len;
    }
    return d + `L${r1(x1 + 40)} ${r1(y1)}Z`;
  });
}
const BAND_CACHE = new Map<string, string>();

/** Flat sky. Day and golden are ONE flat value (reference 2); dusk / night / dawn add value steps toward the horizon,
 *  all below y 600, with hand-drawn streak edges. It is the background SLAB of the un-build: the lower (glow) bands
 *  shrink into the horizon with the fills, then the slab collapses downward (its top edge falls from the screen top to
 *  the bottom, from e 0.5, overlapping the last fills). It keeps its colour in the paper / cascade Looks. */
export const Sky: React.FC<SkyProps> = ({tod, horizon, colors, edges, span: spanIn, below = 1600, x0 = WIDE.x0, x1 = WIDE.x1, top: top0 = -4000, wobble = 9, seed = 'sky'}) => {
  const p = useTodPal(tod);
  const S = useCineState();
  let top = top0;
  let glowK = 1;
  if (S.e > 0) {
    const k = E.inQuad(prog(S.e, 0.5, 0.38));
    if (k >= 1) return null;
    // screen y of the falling edge -> this layer's y (layers never rotate much: use the inverse of y only)
    const sy = -60 + (1920 + 120) * k;
    const sc = xfScale(S.m) || 1;
    top = Math.max(top0, (sy - S.m[5]) / sc);
    // the glow / horizon bands go with the fills (not after them: no lone stripe on an empty slab)
    glowK = exitScale(S.e, 0.3, 0.4);
  }
  const cols = colors ?? p.skyBands;
  const n = cols.length;
  const span = spanIn ?? Math.max(160, Math.min(1150, horizon - 600));
  // default edges: geometric toward the horizon (thin bands near it, like a low sun's glow steps); last edge 110 px
  const ratio = n > 2 ? Math.pow(Math.min(110, span * 0.5) / span, 1 / (n - 2)) : 1;
  const e = edges ?? Array.from({length: n - 1}, (_, i) => span * Math.pow(ratio, i));
  const out: React.ReactNode[] = [];
  const y1 = horizon + below;
  if (y1 > top) out.push(<rect key={0} x={x0} y={top} width={x1 - x0} height={y1 - top} fill={cols[0]} />);
  for (let i = 1; i < n; i++) {
    const h = e[i - 1] * glowK;
    if (h <= 0.5) continue;
    const y0 = horizon - h;
    if (y0 < top) continue;
    // the band's wobble shrinks with its height (thin glow bands near the horizon wobble less)
    const amp = Math.min(wobble, h * 0.18);
    out.push(<path key={i} d={bandPath(x0, x1, y0, y1, amp, `${seed}/${i}`)} fill={cols[i]} />);
  }
  return <>{out}</>;
};

// ---------------------------------------------------------------- clouds

type Circ = {cx: number; cy: number; r: number};

function cloudGeo(x: number, y: number, w: number, h: number, seed: Seed): {fill: string; top: string; bottom: string} {
  return memoize(CLOUD_CACHE, `${r1(x)},${r1(y)},${r1(w)},${r1(h)},${seed}`, () => {
    const r = rng(`cloud/${seed}`);
    // three bumps: small left, big middle, medium right (ref 2 f_1), bottoms below the flat base
    const c: Circ[] = [
      {cx: x + w * r.range(0.2, 0.26), cy: y - h * 0.32, r: h * r.range(0.46, 0.56)},
      {cx: x + w * r.range(0.46, 0.54), cy: y - h * 0.48, r: h * r.range(0.62, 0.72)},
      {cx: x + w * r.range(0.74, 0.8), cy: y - h * 0.3, r: h * r.range(0.44, 0.52)},
    ];
    const baseX = (ci: Circ, side: -1 | 1) => ci.cx + side * Math.sqrt(Math.max(0, ci.r * ci.r - (y - ci.cy) * (y - ci.cy)));
    const inter = (a: Circ, b: Circ): Pt => {
      const dx = b.cx - a.cx;
      const dy = b.cy - a.cy;
      const d = Math.hypot(dx, dy);
      const l = (a.r * a.r - b.r * b.r + d * d) / (2 * d);
      const hh = Math.sqrt(Math.max(0, a.r * a.r - l * l));
      const mx = a.cx + (dx * l) / d;
      const my = a.cy + (dy * l) / d;
      // upper intersection (smaller y)
      const p1: Pt = [mx + (dy * hh) / d, my - (dx * hh) / d];
      const p2: Pt = [mx - (dy * hh) / d, my + (dx * hh) / d];
      return p1[1] < p2[1] ? p1 : p2;
    };
    const L: Pt = [baseX(c[0], -1), y];
    const R: Pt = [baseX(c[2], 1), y];
    const i12 = inter(c[0], c[1]);
    const i23 = inter(c[1], c[2]);
    const arcTo = (ci: Circ, from: Pt, to: Pt) => {
      const a0 = Math.atan2(from[1] - ci.cy, from[0] - ci.cx);
      let a1 = Math.atan2(to[1] - ci.cy, to[0] - ci.cx);
      while (a1 < a0) a1 += Math.PI * 2;
      const large = a1 - a0 > Math.PI ? 1 : 0;
      return `A${r1(ci.r)} ${r1(ci.r)} 0 ${large} 1 ${r1(to[0])} ${r1(to[1])}`;
    };
    const top = `M${r1(L[0])} ${r1(L[1])}` + arcTo(c[0], L, i12) + arcTo(c[1], i12, i23) + arcTo(c[2], i23, R);
    const fill = top + 'Z';
    const bottom = line(L[0] + w * 0.08, y, R[0] - w * r.range(0.05, 0.3), y, {seed: `cl/${seed}`, over: [2, 6]});
    return {fill, top, bottom};
  });
}
const CLOUD_CACHE = new Map<string, {fill: string; top: string; bottom: string}>();

export type SkyCloudProps = {
  x: number;
  /** Flat base y. */
  y: number;
  w?: number;
  /** Height (default w * 0.42). */
  h?: number;
  tod?: TodLike | TodPalette;
  color?: string;
  /** Ink the top (default: palette.cloudInk). */
  ink?: boolean;
  inkColor?: string;
  width?: number;
  /** Horizontal drift (px/s). */
  drift?: number;
  /** Pop in at this time (scale from the base). */
  at?: number;
  seed?: Seed;
};

/** Reference-style cloud: three scalloped bumps, flat bottom; white with ink on top (day) or fill-only (dusk). */
export const SkyCloud: React.FC<SkyCloudProps> = ({x, y, w = 240, h, tod, color, ink, inkColor = palette.ink, width = stroke.ink, drift = 0, at, seed = 'c'}) => {
  const S = useCineState();
  const t = S.t;
  const p = useTodPal(tod);
  const g = cloudGeo(0, 0, w, h ?? w * 0.42, seed);
  if (at !== undefined && t < at) return null;
  const ex = exitScale(S.e, 0.3, 0.15);
  if (ex <= 0) return null;
  const s = (at === undefined ? 1 : springAt(t, at, springs.pop)) * ex;
  const dx = drift * t;
  const paper = isPaper(S, [x + w / 2, y]);
  const showInk = (ink ?? p.cloudInk) || paper;
  const fill = lookPaint(S, color ?? p.cloud, [x + w / 2, y]);
  return (
    <g transform={`translate(${r1(x + dx)} ${r1(y)})${s !== 1 ? ` translate(${w / 2} 0) scale(${s.toFixed(3)}) translate(${-w / 2} 0)` : ''}`}>
      {fill !== 'none' ? <path d={g.fill} fill={fill} transform={showInk ? 'translate(3 2)' : undefined} /> : null}
      {showInk && inkOn(S) ? <path d={g.top + g.bottom} fill="none" stroke={inkColor} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" /> : null}
    </g>
  );
};

/** Long thin sunset streak clouds (flat pills) stacked near the horizon. */
export const Streaks: React.FC<{y: number; tod?: TodLike | TodPalette; color?: string; n?: number; x0?: number; x1?: number; seed?: Seed; drift?: number; thick?: number}> = ({
  y,
  tod,
  color,
  n = 4,
  x0 = -200,
  x1 = 1280,
  seed = 'streak',
  drift = 4,
  thick = 14,
}) => {
  const t = useTime();
  const p = useTodPal(tod);
  const d = useMemo(() => {
    const r = rng(`streak/${seed}`);
    const pb = new PathBuf();
    for (let i = 0; i < n; i++) {
      const w = r.range(220, 620);
      const cx = r.range(x0, x1);
      const yy = y - i * r.range(16, 30) - r.range(0, 12);
      const hh = thick * r.range(0.55, 1.1);
      const rr = hh / 2;
      pb.raw(`M${r1(cx - w / 2 + rr)} ${r1(yy)}h${r1(w - 2 * rr)}a${r1(rr)} ${r1(rr)} 0 0 1 0 ${r1(hh)}h${r1(-(w - 2 * rr))}a${r1(rr)} ${r1(rr)} 0 0 1 0 ${r1(-hh)}z`);
    }
    return pb.d;
  }, [y, n, x0, x1, seed, thick]);
  const S = useCineState();
  if (S.look.fills !== 'color' || exitScale(S.e, 0.2, 0.1) < 0.5) return null;
  return <path d={d} fill={color ?? p.horizonGlow} transform={drift ? `translate(${r1(drift * t)} 0)` : undefined} />;
};

// ---------------------------------------------------------------- stars

export type StarsProps = {
  tod?: TodLike | TodPalette;
  color?: string;
  /** [x0, y0, x1, y1] */
  region: [number, number, number, number];
  /** Count (default from tod density x area). */
  n?: number;
  /** Stars pop in one by one over [at, at + span]. Omit = all present. */
  at?: number;
  span?: number;
  /** Fraction that twinkle (size pulses). Default 0.35. */
  twinkle?: number;
  seed?: Seed;
  size?: number;
  /** Boxes [x0, y0, x1, y1] (layer coords) kept free of stars. Default: the caption band [80, 270, 1000, 580]
   *  (skyCaption clip window + 10 px), so no dot ever reads as punctuation. Pass [] to allow everywhere. */
  avoid?: [number, number, number, number][];
};

/** The caption band (screen px) that stars, shafts and busy detail stay out of (skyCaption clipTop/clipBottom + 10). */
export const CAPTION_BAND: [number, number, number, number] = [80, 270, 1000, 580];

/** Small cream dots and a few 4-point sparkles; pop in (spring scale), twinkle by size. One path. */
export const Stars: React.FC<StarsProps> = ({tod, color, region, n, at, span = 3, twinkle = 0.35, seed = 'stars', size = 1, avoid = [CAPTION_BAND]}) => {
  const S = useCineState();
  const t = S.t;
  const p = useTodPal(tod);
  const [x0, y0, x1, y1] = region;
  const count = n ?? Math.round(((x1 - x0) * (y1 - y0) * p.stars) / 5200);
  const avoidKey = avoid.map((a) => a.join(',')).join('|');
  const stars = useMemo(() => {
    const r = rng(`stars/${seed}`);
    return Array.from({length: count}, (_, i) => ({
      x: r.range(x0, x1),
      y: y0 + (y1 - y0) * Math.pow(r.next(), 1.4),
      r: r.range(1.3, 2.9) * size,
      sparkle: r.chance(0.12),
      tw: r.chance(twinkle),
      hz: r.range(0.25, 0.7),
      ph: r.range(0, 6.28),
      at: at === undefined ? -1 : at + r.next() * span,
      j: r.next(),
    })).filter((s) => !avoid.some(([a, b, c, d]) => s.x > a - 6 && s.x < c + 6 && s.y > b - 6 && s.y < d + 6));
  }, [count, x0, y0, x1, y1, seed, at, span, twinkle, size, avoidKey]);
  if (S.look.fills !== 'color') return null;
  const pb = new PathBuf();
  for (const s of stars) {
    if (t < s.at) continue;
    let k = (s.at < 0 ? 1 : springAt(t, s.at, springs.wobbly)) * exitScale(S.e, s.j, 0.01);
    if (s.tw) k *= 0.75 + 0.35 * (osc(t, s.hz, s.ph) > 0.55 ? 1 : 0.5 + 0.5 * osc(t, s.hz * 2.3, s.ph));
    const rr = s.r * k;
    if (rr <= 0.2) continue;
    if (s.sparkle) {
      const L = rr * 3.2;
      const w = rr * 0.55;
      pb.raw(`M${r1(s.x - L)} ${r1(s.y)}L${r1(s.x - w)} ${r1(s.y - w)}L${r1(s.x)} ${r1(s.y - L)}L${r1(s.x + w)} ${r1(s.y - w)}L${r1(s.x + L)} ${r1(s.y)}L${r1(s.x + w)} ${r1(s.y + w)}L${r1(s.x)} ${r1(s.y + L)}L${r1(s.x - w)} ${r1(s.y + w)}z`);
    } else pb.circle(s.x, s.y, rr);
  }
  return pb.empty ? null : <path d={pb.d} fill={color ?? p.star} />;
};

// ---------------------------------------------------------------- haze & hills

function wavyTop(x0: number, x1: number, y: number, amp: number, seed: Seed, step = 40, freq = 1): Pt[] {
  const r = rng(`wave/${seed}`);
  const ph = [r.range(0, 6.28), r.range(0, 6.28), r.range(0, 6.28)];
  const pts: Pt[] = [];
  for (let x = x0; x <= x1 + step; x += step) {
    const u = x * 0.0035 * freq;
    const v = 0.55 * Math.sin(u + ph[0]) + 0.3 * Math.sin(u * 2.3 + ph[1]) + 0.15 * Math.sin(u * 5.1 + ph[2]);
    pts.push([x, y - amp * (0.5 + 0.5 * v)]);
  }
  return pts;
}

function smoothPts(pts: Pt[]): string {
  let d = `M${r1(pts[0][0])} ${r1(pts[0][1])}`;
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1];
    const [x1, y1] = pts[i];
    d += `Q${r1(x0)} ${r1(y0)} ${r1((x0 + x1) / 2)} ${r1((y0 + y1) / 2)}`;
  }
  const last = pts[pts.length - 1];
  return d + `L${r1(last[0])} ${r1(last[1])}`;
}

/** Flat fog / haze band (static translucency) with an optional gently wavy top edge. */
export const HazeBand: React.FC<{y: number; h: number; color: string; opacity?: number; wave?: number; seed?: Seed; x0?: number; x1?: number}> = ({
  y,
  h,
  color,
  opacity = 0.5,
  wave = 0,
  seed = 'haze',
  x0 = WIDE.x0,
  x1 = WIDE.x1,
}) => {
  const d = useMemo(() => {
    if (!wave) return `M${x0} ${y}H${x1}V${y + h}H${x0}Z`;
    const pts = wavyTop(x0, x1, y, wave, seed, 60, 1.6);
    return smoothPts(pts) + `L${x1} ${y + h}L${x0} ${y + h}Z`;
  }, [y, h, wave, seed, x0, x1]);
  const S = useCineState();
  if (S.look.fills !== 'color' || exitScale(S.e, 0.1, 0.3) < 0.5) return null;
  return <path d={d} fill={color} opacity={opacity < 1 ? opacity : undefined} />;
};

/** Rolling hills silhouette (ref 2's far hills): a smooth wavy top, flat fill down to `bottom`. Optional thin ink top. */
export const Hills: React.FC<{y: number; amp?: number; color: string; bottom?: number; seed?: Seed; freq?: number; ink?: number; inkColor?: string; x0?: number; x1?: number}> = ({
  y,
  amp = 40,
  color,
  bottom,
  seed = 'hills',
  freq = 1,
  ink = 0,
  inkColor = palette.ink,
  x0 = WIDE.x0,
  x1 = WIDE.x1,
}) => {
  const {top, fill} = useMemo(() => {
    const pts = wavyTop(x0, x1, y, amp, seed, 30, freq);
    const topD = smoothPts(pts);
    return {top: topD, fill: topD + `L${x1} ${bottom ?? y + 900}L${x0} ${bottom ?? y + 900}Z`};
  }, [y, amp, bottom, seed, freq, x0, x1]);
  const S = useCineState();
  const ex = exitScale(S.e, 0.2, 0.45);
  if (ex <= 0) return null;
  const paper = isPaper(S, [540, y]);
  const paint = lookPaint(S, color, [540, y]);
  const body = (
    <>
      {paint !== 'none' ? <path d={fill} fill={paint} /> : null}
      {(ink || paper) && inkOn(S) ? <path d={top} fill="none" stroke={inkColor} strokeWidth={ink || 1.6} strokeLinecap="round" /> : null}
    </>
  );
  return ex < 1 ? <g transform={`translate(0 ${r1(y)}) scale(1 ${ex.toFixed(4)}) translate(0 ${r1(-y)})`}>{body}</g> : body;
};

// ---------------------------------------------------------------- birds

export type BirdsProps = {
  at: number;
  from: Pt;
  to: Pt;
  /** Flight time (s). */
  dur?: number;
  n?: number;
  /** Flock spread (px). */
  spread?: number;
  /** Wing span (px). */
  size?: number;
  color?: string;
  width?: number;
  seed?: Seed;
  /** Wing beats per second. */
  flap?: number;
};

/** A small flock of ink "V" birds crossing the sky, wings flapping (each bird its own phase). */
export const Birds: React.FC<BirdsProps> = ({at, from, to, dur = 5, n = 5, spread = 70, size = 18, color = palette.ink, width = stroke.inkThin, seed = 'birds', flap = 3}) => {
  const t = useTime();
  const birds = useMemo(() => {
    const r = rng(`birds/${seed}`);
    return Array.from({length: n}, (_, i) => ({dx: i === 0 ? 0 : -r.range(0.3, 1) * spread, dy: r.jitter(spread * 0.45), lag: r.range(0, 0.4), ph: r.range(0, 6.28), s: r.range(0.75, 1.15), bob: r.range(4, 10)}));
  }, [n, spread, seed]);
  const S = useCineState();
  if (t < at || t > at + dur + 0.6 || S.e > 0.15 || !S.look.ink) return null;
  const pb = new PathBuf();
  for (const b of birds) {
    const u = prog(t, at + b.lag, dur);
    if (u <= 0 || u >= 1) continue;
    const x = from[0] + (to[0] - from[0]) * u + b.dx;
    const y = from[1] + (to[1] - from[1]) * u + b.dy + Math.sin(u * 9 + b.ph) * b.bob;
    const w = size * b.s * 0.5;
    const lift = Math.sin(t * flap * 6.2832 + b.ph) * w * 0.55; // wing tip height
    pb.raw(`M${r1(x - w)} ${r1(y - lift)}Q${r1(x - w * 0.45)} ${r1(y - lift * 0.2 - w * 0.25)} ${r1(x)} ${r1(y)}Q${r1(x + w * 0.45)} ${r1(y - lift * 0.2 - w * 0.25)} ${r1(x + w)} ${r1(y - lift)}`);
  }
  return pb.empty ? null : <path d={pb.d} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" />;
};

