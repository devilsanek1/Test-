// edges/variants.ts — what each edge variant is, as pure data: the colour layer's hand-cut clip (screen px), whether
// an ink-only paper layer shows outside it, and the hand-drawn overlay strokes. Deterministic in (variant, seed,
// amount); memoised, so the shapes are computed once per (variant, seed, amount) and never move.

import {rng, Seed} from '../rng';
import {line, Pt} from '../sketch';
import {skyCaption, stroke, world} from '../theme';
import {containsRect, cutPoly, cutSide, organic, pathOf, roundRectPts, smoothClosed} from './rough';

export type EdgeVariant = 'clean' | 'panel' | 'vignette' | 'construction' | 'rough-tb' | 'trim';
export const EDGE_VARIANTS: EdgeVariant[] = ['clean', 'panel', 'vignette', 'construction', 'rough-tb', 'trim'];

export type EdgeStroke = {d: string; w: number; taper?: boolean};

export type EdgeSpec = {
  variant: EdgeVariant;
  /** Clip of the full-colour layer (screen path, nonzero); null = full-bleed colour (no ink layer needed). */
  colour: string | null;
  /** The clip contour as points (checks, debug). */
  colourPts: Pt[] | null;
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

// ---------------------------------------------------------------- panel

/** Outward normal of a side running along u on a clockwise (screen) contour. */
const outward = (u: Pt): Pt => [u[1], -u[0]];

/** Reference 1, nearly full-bleed: full colour inside a hand-cut panel 30-45 px in (each corner its own inset, so
 *  every side runs a hair off-axis), cut in 1-4 scissor strokes per side; the ink-only drawing runs on into the paper
 *  margin; at 2-3 corners ONE of the two sides is inked and overshoots the corner by 22-50 px (sometimes with a
 *  re-stroke 4-7 px outside it), the other side stays open (style bible 3: overshoot + unclosed contours). */
function panel(seed: Seed, a: number): EdgeSpec {
  const r = rng(`${seed}/panel`);
  const ins = Array.from({length: 8}, () => r.range(30, 45) * a); // [x, y] inset per corner
  let corners: Pt[] = [];
  let pts: Pt[] = [];
  // at large amounts the side insets give way (never into the caption block: white captions on paper would vanish)
  for (let k = 0, sx = 1; k < 12; k++, sx *= 0.9) {
    corners = [
      [ins[0] * sx, ins[1]],
      [W - ins[2] * sx, ins[3]],
      [W - ins[4] * sx, H - ins[5]],
      [ins[6] * sx, H - ins[7]],
    ];
    pts = cutPoly(corners, r.fork('cut'), {
      dev: 1.6 * a,
      bow: 2.2 * a,
      side: (i) => (i % 2 === 0 ? {segs: [1, 2]} : {segs: [2, 4]}),
    });
    if (containsRect(pts, CAPTION_SAFE)) break;
  }
  const strokes: EdgeStroke[] = [];
  const pick = r.fork('corners').shuffle([0, 1, 2, 3]).slice(0, r.int(2, 3));
  for (const ci of pick) {
    const c = corners[ci];
    const rr = r.fork(`c${ci}`);
    const incoming = rr.chance(0.5);
    const u = incoming ? dir(corners[(ci + 3) % 4], c) : dir(c, corners[(ci + 1) % 4]);
    const n = outward(u);
    const L = rr.range(70, 220) * a;
    const O = rr.range(22, 50) * a;
    const off = rr.jitter(1.2);
    const p0 = add(add(c, u, incoming ? -L : -O), n, off);
    const p1 = add(add(c, u, incoming ? O : L), n, off);
    strokes.push({d: ruled(p0, p1, `${seed}pc${ci}`), w: stroke.inkThin});
    if (rr.chance(0.45)) {
      // a re-stroke over part of it, 4-7 px into the margin, a degree off-parallel
      const k = rr.range(4, 7);
      const q0 = add(add(c, u, incoming ? -L * 0.45 : -O * 1.1), n, k);
      const q1 = add(add(c, u, incoming ? O * 1.1 : L * 0.45), n, k + rr.jitter(2.5));
      strokes.push({d: ruled(q0, q1, `${seed}pr${ci}`), w: stroke.inkHair});
    }
  }
  return {variant: 'panel', colour: pathOf(pts), colourPts: pts, strokes};
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

// ---------------------------------------------------------------- trim (the house proposal)

/** A hand-trimmed print, phone-aware: the edge charm where it costs no immersion. SLIM hand-cut side margins (16-24 px: the only edges
 *  the viewer sees in the app, so the world stays a window and the scene's lines just cross a sliver of paper),
 *  DEEPER top (48-66) and bottom (64-92) margins that live under the platform UI (the full card charm in a clean
 *  export or a paused frame), every corner snipped with a small scissor chamfer, no added strokes: only the scene's
 *  own lines overshoot, and actors (the sun, the mascot) break the edge in colour. */
function trim(seed: Seed, a: number): EdgeSpec {
  const r = rng(`${seed}/trim`);
  const side = () => r.range(16, 24) * a;
  const top = () => r.range(48, 66) * a;
  const bot = () => r.range(64, 92) * a;
  const c: Pt[] = [
    [side(), top()],
    [W - side(), top()],
    [W - side(), H - bot()],
    [side(), H - bot()],
  ];
  // each corner snipped: two points 5-12 px from the corner along its sides
  const pts0: Pt[] = [];
  c.forEach((p, i) => {
    const prev = c[(i + 3) % 4];
    const next = c[(i + 1) % 4];
    pts0.push(add(p, dir(p, prev), r.range(5, 12) * a), add(p, dir(p, next), r.range(5, 12) * a));
  });
  // sides: 0-1 chamfer, 1-2 top, 2-3 chamfer, 3-4 right, ... (odd = a real side)
  const pts = cutPoly(pts0, r.fork('cut'), {
    side: (i) => (i % 2 === 0 ? {segs: [1, 1], dev: 0, bow: 0} : i % 4 === 1 ? {segs: [2, 3], dev: 1.2 * a, bow: 1.5 * a} : {segs: [3, 4], dev: 1.2 * a, bow: 1.8 * a}),
  });
  return {variant: 'trim', colour: pathOf(pts), colourPts: pts, strokes: []};
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
