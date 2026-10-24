// edges/variants.ts — what each edge variant is, as pure data: the colour layer's hand-cut clip (screen px), whether
// an ink-only paper layer shows outside it, and the hand-drawn overlay strokes. Deterministic in (variant, seed,
// amount); memoised, so the shapes are computed once per (variant, seed, amount) and never move.

import {rng, Seed} from '../rng';
import {line, Pt} from '../sketch';
import {skyCaption, stroke, world} from '../theme';
import {containsRect, cutPoly, cutSide, organic, pathOf, roundRectPts, smoothClosed} from './rough';
import type {Rng} from '../rng';

export type EdgeVariant = 'clean' | 'panel' | 'vignette' | 'construction' | 'rough-tb' | 'trim';
export const EDGE_VARIANTS: EdgeVariant[] = ['clean', 'panel', 'vignette', 'construction', 'rough-tb', 'trim'];

export type EdgeStroke = {d: string; w: number; taper?: boolean};

export type EdgeSpec = {
  variant: EdgeVariant;
  /** Clip of the full-colour layer (screen path, nonzero); null = full-bleed colour (no ink layer needed). */
  colour: string | null;
  /** The clip contour as points (checks, debug). */
  colourPts: Pt[] | null;
  /** Clip of the INK layer (the line art in the margin): lines stop at it, so they visibly end in the white. null /
   *  absent = the line art runs off the screen. */
  ink?: string | null;
  inkPts?: Pt[] | null;
  /** Hand-drawn overlay strokes (screen px), drawn above both layers and below the captions. */
  strokes: EdgeStroke[];
};

export type EdgeOpts = {
  /** Screen vanishing point for perspective guides (construction). Default world.vp. */
  vp?: Pt;
};

const W = world.w;
const H = world.h;

/** Screen rect the captions can occupy (hook pages are 1.06x): every colour clip must contain it, so a caption is
 *  always over the scene's own sky (white captions on a paper margin would vanish). */
export const CAPTION_SAFE: [number, number, number, number] = (() => {
  const half = (skyCaption.maxWidth * 1.06) / 2 + 20;
  return [Math.round(skyCaption.cx - half), skyCaption.clipTop - 22, Math.round(skyCaption.cx + half), skyCaption.clipBottom + 24];
})();

const dir = (a: Pt, b: Pt): Pt => {
  const l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
  return [(b[0] - a[0]) / l, (b[1] - a[1]) / l];
};
const add = (p: Pt, u: Pt, k: number): Pt => [p[0] + u[0] * k, p[1] + u[1] * k];

/** A ruled stroke from a to b (no auto overshoot: the caller sets the ends), drifting a hair, never broken. */
const ruled = (a: Pt, b: Pt, seed: string, drift = 0.25) => line(a[0], a[1], b[0], b[1], {seed, over: 'none', drift, bow: 1.2, jitter: 0.6, breaks: false});

// ---------------------------------------------------------------- shared: the corner strokes

/** The artist's ruled corner: one or two thin ruled lines along the cut edges near a corner, sitting 2-4 px OUT in the
 *  paper (misregistered from the colour like every fill in the style) and overshooting the corner into the margin.
 *  `h` = the horizontal (along the top cut) and `v` = the vertical (along the side cut); each is optional.
 *  sx = +1 for a left corner, -1 for a right one. Single strokes, no re-strokes. */
function ruledCorner(
  r: Rng,
  key: string,
  c: Pt,
  sx: 1 | -1,
  o: {h?: {len: [number, number]; over: number}; v?: {len: [number, number]; over: number}},
): EdgeStroke[] {
  const out: EdgeStroke[] = [];
  const m = r.range(2.5, 4); // out into the paper
  if (o.h) {
    const y = c[1] - m;
    const x0 = c[0] + sx * r.range(o.h.len[0], o.h.len[1]);
    const x1 = c[0] - sx * o.h.over;
    out.push({d: ruled([x0, y + r.jitter(0.6)], [x1, y + r.jitter(0.6)], `${key}h`, 0.2), w: stroke.inkThin});
  }
  if (o.v) {
    const x = c[0] - sx * m;
    const y0 = c[1] + r.range(o.v.len[0], o.v.len[1]);
    const y1 = c[1] - o.v.over;
    out.push({d: ruled([x + r.jitter(0.6), y0], [x + r.jitter(0.6), y1], `${key}v`, 0.2), w: stroke.inkThin});
  }
  return out;
}

/** Lowest y a stroke near the left / right frame edge may reach: just above the caption block. */
const STROKE_MAX_Y = CAPTION_SAFE[1] - 12;

// ---------------------------------------------------------------- panel

/** Reference 1's panel, phone-aware: "the sketch runs out at the edges". Colour stops on a hand-cut edge, the line art
 *  keeps going into white paper and visibly STOPS there (lines end in the white, like f_9.0), and the colour runs out of
 *  the frame at the bottom (the ground and the foreground figures stay full-bleed and in colour, nothing white sits
 *  under the platform's description text).
 *  - LEFT 36-42 px (the side that carries the charm: away from the right rail), cut in 3-4 scissor strokes (2-3 px
 *    jogs), ending at y 1490-1570 in ONE sharp diagonal snip out to the frame edge; RIGHT 18-22 px (clear of the
 *    rail), TOP 14-18 px (clear of the status bar); every side off-axis by < 1 px.
 *  - The ink layer is clipped to a comb on the left: stretches of 80-180 px where the line art stops 6-20 px short of
 *    the screen edge (a line ends in the white, 20-35 px past the colour), between stretches where it runs off.
 *  - Two inked corners, single strokes: top-left = a crossing ruled pair, the horizontal ending in the paper;
 *    top-right (usually sky) = one ruled vertical that overshoots off the top. */
function panel(seed: Seed, a: number): EdgeSpec {
  const r = rng(`${seed}/panel`);
  let L = r.range(36, 42) * a;
  const R = r.range(18, 22) * a;
  const T = r.range(14, 18) * a;
  const yOpen = r.range(1490, 1570);
  const snipDy = r.range(120, 170);
  const tilt = () => r.jitter(0.8);
  let pts: Pt[] = [];
  let tl: Pt = [L, T];
  let tr: Pt = [W - R, T];
  for (let k = 0; k < 12; k++, L *= 0.9) {
    tl = [L, T];
    tr = [W - R, T + tilt()];
    const corners: Pt[] = [tl, tr, [W - R + tilt(), H + 40], [-40, H + 40], [-40, yOpen + snipDy], [L + tilt(), yOpen]];
    pts = cutPoly(corners, r.fork(`cut${k}`), {
      side: (i) =>
        i === 0 ? {segs: [2, 3], dev: 1.8 * a, bow: 1.2 * a} : i === 1 ? {segs: [3, 4], dev: 2.2 * a, bow: 1.2 * a} : i === 5 ? {segs: [3, 4], dev: 2.6 * a, bow: 1.6 * a} : {segs: [1, 1], dev: 0, bow: 0},
    });
    if (containsRect(pts, CAPTION_SAFE)) break;
  }
  // the ink comb (left side, down to just below the snip)
  const rc = r.fork('comb');
  const comb: Pt[] = [];
  let y = yOpen + 60;
  while (y > -40) {
    const h = rc.range(80, 180);
    const k = rc.chance(0.6) ? rc.range(6, 20) * a : -2;
    comb.push([k, y], [k, y - h]);
    y -= h;
  }
  const inkPts: Pt[] = [[W + 40, -60], [W + 40, H + 40], [-40, H + 40], [-40, yOpen + 60], ...comb, [-40, y - 20], [-40, -60]];
  const strokes: EdgeStroke[] = [
    ...ruledCorner(r.fork('tl'), `${seed}ptl`, tl, 1, {h: {len: [170, 290], over: Math.min(L - 10, r.range(18, 30) * a)}, v: {len: [150, STROKE_MAX_Y - T], over: 40}}),
    ...ruledCorner(r.fork('tr'), `${seed}ptr`, tr, -1, {v: {len: [200, 320], over: 40}}),
  ];
  return {variant: 'panel', colour: pathOf(pts), colourPts: pts, ink: pathOf(inkPts), inkPts, strokes};
}

// ---------------------------------------------------------------- vignette

/** Centre finished, periphery a sketch: full colour inside a loose hand-drawn contour that hugs the sides (touching
 *  the frame in places), sits lower than the top / higher than the bottom and pulls in at the corners with
 *  elliptical, unequal sweeps (the bottom ones deepest); the ink-only drawing runs out to the screen edge. The
 *  contour always contains the caption block. */
function vignette(seed: Seed, a: number): EdgeSpec {
  const r = rng(`${seed}/vignette`);
  const sideL = r.range(4, 18) * a;
  const sideR = r.range(4, 18) * a;
  const top = r.range(56, 90) * a;
  const bot = r.range(90, 130) * a;
  // unequal corners: one top corner tight, the other a long shallow sweep; one bottom corner a deep diagonal bite
  const flipT = r.chance(0.5);
  const flipB = r.chance(0.5);
  const tA: [number, number] = [r.range(110, 170) * a, r.range(150, 230) * a];
  const tB: [number, number] = [r.range(230, 320) * a, r.range(120, 180) * a];
  const bA: [number, number] = [r.range(180, 250) * a, r.range(240, 330) * a];
  const bB: [number, number] = [r.range(330, 430) * a, r.range(460, 620) * a];
  let rad: [number, number][] = [flipT ? tA : tB, flipT ? tB : tA, flipB ? bA : bB, flipB ? bB : bA];
  const wr = r.fork('wob');
  const harmonics: [number, number][] = [
    [wr.int(2, 3), 0.45],
    [wr.int(4, 6), 0.35],
    [wr.int(9, 13), 0.2],
  ];
  let pts: Pt[] = [];
  for (let k = 0; k < 14; k++) {
    const base = roundRectPts(sideL, top, W - sideR, H - bot, rad);
    pts = organic(base, rng(`${seed}/vignette/wob`), {
      amp: 18 * a,
      harmonics,
      // more wobble where the contour turns (the corners), less along the long sides
      ampAt: (p) => 0.6 + 0.8 * Math.max(0, Math.min(1, (360 - Math.max(Math.min(p[0], W - p[0]), Math.min(p[1], H - p[1]))) / 360)),
    });
    if (containsRect(pts, CAPTION_SAFE)) break;
    rad = [[rad[0][0] * 0.88, rad[0][1] * 0.88], [rad[1][0] * 0.88, rad[1][1] * 0.88], rad[2], rad[3]];
  }
  return {variant: 'vignette', colour: smoothClosed(pts), colourPts: pts, strokes: []};
}

// ---------------------------------------------------------------- construction

/** Full-bleed colour + the artist's construction lines left at the edges, sparse: perspective guides toward the
 *  vanishing point that start past the frame and stop 90-200 px in, the horizon (eye-level) guide crossing both side
 *  edges, composition ticks at the thirds and the half of every edge, and two crop-mark corners. Nothing enters the
 *  caption block. */
function construction(seed: Seed, a: number, o: EdgeOpts): EdgeSpec {
  const r = rng(`${seed}/construction`);
  const vp = o.vp ?? world.vp;
  const strokes: EdgeStroke[] = [];
  const [cx0, cy0, cx1, cy1] = CAPTION_SAFE;
  const inCap = (p: Pt) => p[0] > cx0 - 10 && p[0] < cx1 + 10 && p[1] > cy0 - 10 && p[1] < cy1 + 10;
  // 1. perspective guides: rays from the VP past the frame border; only the outer stretch is drawn
  const targets: Pt[] = [
    [r.range(-60, 120), H + 60],
    [W - r.range(-60, 120), H + 60],
    [-60, r.range(1240, 1560)],
    [W + 60, r.range(1180, 1500)],
  ];
  if (r.chance(0.7)) targets.push([r.range(300, 420), H + 60]);
  if (r.chance(0.6)) targets.push([-60, r.range(-60, 120)]);
  if (r.chance(0.6)) targets.push([W + 60, r.range(-60, 120)]);
  targets.forEach((tp, i) => {
    const rr = r.fork(`g${i}`);
    const u = dir(vp, tp);
    // where the ray leaves the frame
    const tx = u[0] > 1e-6 ? (W - vp[0]) / u[0] : u[0] < -1e-6 ? -vp[0] / u[0] : Infinity;
    const ty = u[1] > 1e-6 ? (H - vp[1]) / u[1] : u[1] < -1e-6 ? -vp[1] / u[1] : Infinity;
    const te = Math.min(tx, ty);
    const out = add(vp, u, te + rr.range(10, 30));
    const inn = add(vp, u, te - rr.range(120, 260) * a);
    if (inCap(inn) || inCap(out)) return;
    strokes.push({d: ruled(inn, out, `${seed}cg${i}`, 0.15), w: stroke.inkThin});
  });
  // 2. the horizon (eye-level) guide crossing both side edges
  const hy = vp[1] + r.jitter(3);
  strokes.push({d: ruled([-24, hy + r.jitter(2)], [r.range(110, 200) * a, hy + r.jitter(2)], `${seed}hzL`, 0.2), w: stroke.inkThin});
  strokes.push({d: ruled([W - r.range(110, 200) * a, hy + r.jitter(2)], [W + 24, hy + r.jitter(2)], `${seed}hzR`, 0.2), w: stroke.inkThin});
  // 3. composition ticks at the thirds and the half of each edge (some doubled)
  const tick = (p: Pt, inward: Pt, key: string) => {
    const rr = r.fork(key);
    const len = rr.range(22, 36) * a;
    const along: Pt = [inward[1], -inward[0]];
    const p0 = add(p, inward, -8);
    const p1 = add(add(p, inward, len), along, rr.jitter(1.5));
    if (inCap(p1)) return;
    strokes.push({d: ruled(p0, p1, `${seed}${key}`, 0.5), w: stroke.inkThin, taper: false});
    if (rr.chance(0.35)) strokes.push({d: ruled(add(p0, along, 8), add(p1, along, 8 + rr.jitter(1.5)), `${seed}${key}b`, 0.5), w: stroke.inkHair, taper: false});
  };
  [1 / 3, 1 / 2, 2 / 3].forEach((f, i) => {
    tick([0, H * f + r.jitter(6)], [1, 0], `tl${i}`);
    tick([W, H * f + r.jitter(6)], [-1, 0], `tr${i}`);
    tick([W * f + r.jitter(6), 0], [0, 1], `tt${i}`);
    tick([W * f + r.jitter(6), H], [0, -1], `tb${i}`);
  });
  // 4. two crop-mark corners (a diagonal pair), lines overshooting each other
  const cm = r.chance(0.5) ? [0, 2] : [1, 3];
  const corners: Pt[] = [
    [0, 0],
    [W, 0],
    [W, H],
    [0, H],
  ];
  for (const ci of cm) {
    const rr = r.fork(`cm${ci}`);
    const c = corners[ci];
    const sx = c[0] === 0 ? 1 : -1;
    const sy = c[1] === 0 ? 1 : -1;
    const inset = rr.range(22, 32) * a;
    const k: Pt = [c[0] + sx * inset, c[1] + sy * inset];
    strokes.push({d: ruled([k[0] - sx * rr.range(16, 30), k[1]], [k[0] + sx * rr.range(80, 150) * a, k[1]], `${seed}cmh${ci}`, 0.3), w: stroke.inkThin});
    strokes.push({d: ruled([k[0], k[1] - sy * rr.range(16, 30)], [k[0], k[1] + sy * rr.range(100, 190) * a], `${seed}cmv${ci}`, 0.3), w: stroke.inkThin});
  }
  return {variant: 'construction', colour: null, colourPts: null, strokes};
}

// ---------------------------------------------------------------- rough top / bottom

/** A hand-cut paper edge at the TOP and BOTTOM only (4-6 scissor cuts each, rougher than the panel); the sides stay
 *  fully immersive (the contour closes outside the frame). Both bands sit under the platform UI. */
function roughTB(seed: Seed, a: number): EdgeSpec {
  const r = rng(`${seed}/roughtb`);
  const t0: Pt = [-60, r.range(44, 70) * a];
  const t1: Pt = [W + 60, r.range(44, 70) * a];
  const b1: Pt = [W + 60, H - r.range(56, 90) * a];
  const b0: Pt = [-60, H - r.range(56, 90) * a];
  const o = {segs: [4, 6] as [number, number], dev: 6 * a, bow: 4 * a};
  // t0 -> (top cut) -> t1, straight down outside the frame to b1 -> (bottom cut) -> b0, closing outside the frame
  const pts: Pt[] = [t0, ...cutSide(t0, t1, r.fork('top'), o), b1, ...cutSide(b1, b0, r.fork('bot'), o)];
  return {variant: 'rough-tb', colour: pathOf(pts), colourPts: pts, strokes: []};
}

// ---------------------------------------------------------------- trim

/** A hand-trimmed WINDOW, the quiet one: paper only where a phone viewer sees it and nothing hides it, and the world
 *  still bleeds. Hand-cut side slivers (LEFT 28-32 px with one stretch where the scissors drift out to 36-40, RIGHT
 *  22-26 px: clear of the rail), a thin TOP (12-16 px: clear of the status bar), the BOTTOM OPEN (ground and
 *  foreground run off the frame in colour). One sharp, uneven scissor snip at the top-right corner (a straight
 *  chamfer, 18-28 x 30-46 px, never a radius); at the top-left the artist's two ruled lines cross and overshoot into
 *  the paper (single thin strokes). Everything else is the scene's own ink running off the screen across the slivers. */
function trim(seed: Seed, a: number): EdgeSpec {
  const r = rng(`${seed}/trim`);
  let L = r.range(28, 32) * a;
  let Lw = r.range(36, 40) * a;
  const R = r.range(22, 26) * a;
  const T = r.range(12, 16) * a;
  const w0 = r.range(560, 900);
  const w1 = w0 + r.range(300, 440);
  const tr0 = r.range(80, 120); // the drift out / back in runs over 80-120 px (a gentle 4-6 deg turn)
  const tr1 = r.range(80, 120);
  const snip: [number, number] = [r.range(18, 28) * a, r.range(30, 46) * a];
  const tilt = () => r.jitter(0.8);
  let pts: Pt[] = [];
  let tl: Pt = [L, T];
  for (let k = 0; k < 12; k++, L *= 0.9, Lw *= 0.9) {
    tl = [L, T];
    const yT = T + tilt();
    const corners: Pt[] = [
      tl,
      [W - R - snip[0], yT],
      [W - R, yT + snip[1]],
      [W - R + tilt(), H + 40],
      [L + tilt(), H + 40],
      [L, w1 + tr1],
      [Lw, w1],
      [Lw + tilt(), w0],
      [L, w0 - tr0],
    ];
    pts = cutPoly(corners, r.fork(`cut${k}`), {
      side: (i) => (i === 0 ? {segs: [2, 3], dev: 1.2 * a, bow: 1 * a} : i === 2 ? {segs: [3, 4], dev: 1.5 * a, bow: 1.2 * a} : i === 4 || i === 6 || i === 8 ? {segs: [1, 2], dev: 1.5 * a, bow: 1 * a} : {segs: [1, 1], dev: 0, bow: 0}),
    });
    if (containsRect(pts, CAPTION_SAFE)) break;
  }
  const strokes = ruledCorner(r.fork('tl'), `${seed}ttl`, tl, 1, {h: {len: [140, 240], over: Math.min(L - 8, r.range(16, 22) * a)}, v: {len: [140, STROKE_MAX_Y - T], over: 40}});
  return {variant: 'trim', colour: pathOf(pts), colourPts: pts, ink: null, inkPts: null, strokes};
}

// ---------------------------------------------------------------- registry

const CACHE = new Map<string, EdgeSpec>();

/** The spec of a variant (memoised by variant, seed, amount and the VP). */
export function edgeSpec(variant: EdgeVariant, seed: Seed = 'edge', amount = 1, o: EdgeOpts = {}): EdgeSpec {
  const a = Math.max(0, amount);
  const key = `${variant}|${seed}|${a.toFixed(3)}|${o.vp?.join(',') ?? ''}`;
  let s = CACHE.get(key);
  if (s) return s;
  if (variant === 'clean' || a <= 0) s = {variant, colour: null, colourPts: null, strokes: []};
  else if (variant === 'panel') s = panel(seed, a);
  else if (variant === 'vignette') s = vignette(seed, a);
  else if (variant === 'construction') s = construction(seed, a, o);
  else if (variant === 'rough-tb') s = roughTB(seed, a);
  else s = trim(seed, a);
  CACHE.set(key, s);
  return s;
}
