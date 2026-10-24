// edges/paint.ts — the 'paint' edge: a WHITE PAPER BASE with the scene's colour PAINTED ON TOP, loosely and
// incompletely, at every edge of the frame (the user's pick after the trim / panel round: "a default white base and
// then we paint on top of it in a somewhat messy, incomplete way, like the very first video, with the edges around
// the page even more loose and messy").
//
// How reference 1 paints (style bible 4, 5.4; f_3.0, f_5.5, f_9.0, f_12.0): colour goes down as FLAT BLOCKS with
// crisp straight edges, each block stopping where it stops (the sky block, a facade block dead on a vertical, the pale
// ground block a trapezoid running past the panel bottom, a tree crown half filled); the ink keeps going 30-62 px into
// the white and ends there. No texture, no gradient, no blur, no opacity.
//
// So the colour here is the UNION OF A FEW FLAT LASSO BLOCKS (the clip path's nonzero rule unions them for free):
//   - bands     the body, cut into 2-4 horizontal bands, each with its own slightly tilted side insets: where two
//               bands meet, the side steps in or out (a block ends, the next starts deeper or shallower),
//   - tongues   blocks run out past the frame edge (the ground off the bottom, a stretch of a side or the top),
//   - shelves   a block that sticks 8-40 px further out of a side for a stretch,
//   - notches   trapezoid / scoop bites in a band side where the paint did not reach,
// and the four frame corners each get a role:
//   - unpainted a big lasso chamfer (1-2 knees): the corner stays line art on white (1 corner, 2 when loose),
//   - bleed     a block covers the corner and runs off both edges (medium / loose),
//   - lip       a small block overlaps the corner, its own corner sticking out,
//   - square    the band's corner.
// The INK layer (the scene as line art on paper, see EdgeTreatment) is clipped to the same blocks in their SKETCH
// state (notches closed: the drawing is complete there, only the paint is missing; unpainted corners half drawn) plus
// a comb along every block edge: stretches of 20-70 px where the line art runs 14-66 px past the colour and ENDS in
// the white, between stretches where it runs off the screen (more of those where the paper is thin).
//
// One knob: LOOSENESS (0 none, 0.5 subtle, 1 medium, 1.6 loose; up to ~2). Every distance, count and corner role
// follows from it, and a seed's random structure is SHARED across looseness (each element draws from its own fork):
// the same painting, looser. Phone-aware: the deepest work (chamfers, the widest wander, the bottom) sits under the top
// ~180 px / bottom ~400 px app UI; beside the caption block the paper stays <= 38 px (left) / <= 77 px (right); in the
// right-rail zone (y 860-1540) <= 18 px (white icons on white paper); the colour always contains the caption block.
// Pure and deterministic in (seed, looseness).

import {rng, Rng, Seed} from '../rng';
import type {Pt} from '../sketch';
import {pathOf} from './rough';
import {CAPTION_SAFE, EdgeStroke, H, PHONE_UI, ruledCorner, STROKE_MAX_Y, W} from './shared';

export type PaintPreset = 'paint-subtle' | 'paint-medium' | 'paint-loose';
export const PAINT_PRESETS: PaintPreset[] = ['paint-subtle', 'paint-medium', 'paint-loose'];
/** Each preset's looseness (the 'paint' variant takes `amount` as its looseness; a preset multiplies it). */
export const PAINT_LOOSENESS: Record<PaintPreset, number> = {'paint-subtle': 0.5, 'paint-medium': 1, 'paint-loose': 1.6};

type Range = [number, number];
type Four = [number, number, number, number]; // per side: top, right, bottom, left (clockwise)

type Params = {
  /** Paper depth per side (px, frame edge to colour) and its wander (+-) between blocks. */
  base: Four;
  wander: Four;
  /** Side-inset change from one band to the next (the step where two blocks meet). */
  bandStep: Range;
  /** How far a band reaches into the next one (hidden overlap), and how much a band edge tilts (px over its length). */
  ov: Range;
  tilt: number;
  /** Chance of a knee in a long block edge, and its size. */
  kneeP: number;
  knee: number;
  /** Counts (rounded) and sizes of the features. */
  tongues: number;
  tongueW: Range;
  shelves: number;
  shelf: Range;
  shelfW: Range;
  notches: number;
  notch: Range;
  notchW: Range;
  /** Corners: unpainted chamfer size, lip block size / overhang, bleed block reach. */
  chamfer: Range;
  lip: Range;
  lipOut: Range;
  bleed: Range;
  /** Ink past the colour (px), the share of stretches where it ends in the white, the stretch length. */
  over: Range;
  endP: number;
  stretch: Range;
  /** Smallest paper depth (a thinner sliver reads as a glitch: below it the block runs off the edge instead). */
  minD: number;
};

const ANCHORS: [number, Params][] = [
  [
    0.5,
    {
      base: [24, 16, 40, 22],
      wander: [8, 5, 18, 7],
      bandStep: [6, 14],
      ov: [30, 70],
      tilt: 6,
      kneeP: 0.3,
      knee: 4,
      tongues: 1,
      tongueW: [180, 320],
      shelves: 1,
      shelf: [8, 14],
      shelfW: [140, 320],
      notches: 0,
      notch: [14, 26],
      notchW: [90, 170],
      chamfer: [80, 140],
      lip: [70, 150],
      lipOut: [6, 12],
      bleed: [90, 170],
      over: [14, 34],
      endP: 0.5,
      stretch: [24, 70],
      minD: 7,
    },
  ],
  [
    1,
    {
      base: [42, 22, 70, 34],
      wander: [16, 8, 36, 12],
      bandStep: [12, 30],
      ov: [30, 80],
      tilt: 12,
      kneeP: 0.45,
      knee: 8,
      tongues: 2,
      tongueW: [180, 380],
      shelves: 2,
      shelf: [12, 26],
      shelfW: [140, 360],
      notches: 2,
      notch: [28, 70],
      notchW: [90, 230],
      chamfer: [150, 250],
      lip: [90, 200],
      lipOut: [8, 18],
      bleed: [110, 220],
      over: [24, 58],
      endP: 0.62,
      stretch: [22, 70],
      minD: 8,
    },
  ],
  [
    1.6,
    {
      base: [60, 28, 108, 46],
      wander: [26, 10, 60, 18],
      bandStep: [18, 46],
      ov: [30, 90],
      tilt: 20,
      kneeP: 0.6,
      knee: 14,
      tongues: 3,
      tongueW: [200, 420],
      shelves: 3,
      shelf: [16, 40],
      shelfW: [140, 400],
      notches: 4,
      notch: [44, 130],
      notchW: [100, 280],
      chamfer: [210, 340],
      lip: [110, 240],
      lipOut: [10, 26],
      bleed: [130, 280],
      over: [30, 66],
      endP: 0.72,
      stretch: [20, 64],
      minD: 8,
    },
  ],
];

const mix = (a: number, b: number, t: number) => a + (b - a) * t;
function mixParams(a: Params, b: Params, t: number): Params {
  const out = {} as Record<string, unknown>;
  for (const k of Object.keys(a) as (keyof Params)[]) {
    const va = a[k];
    const vb = b[k];
    out[k] = Array.isArray(va) ? (va as number[]).map((v, i) => mix(v, (vb as number[])[i], t)) : mix(va as number, vb as number, t);
  }
  return out as Params;
}

/** The parameters at a looseness (piecewise linear between the presets; below subtle every distance and count
 *  shrinks toward 0, above loose it extrapolates the medium -> loose slope). */
export function paintParams(L: number): Params {
  const [[l0, p0], [l1, p1], [l2, p2]] = ANCHORS;
  if (L <= l0) {
    const k = Math.max(0, L / l0);
    const s = <T extends number[]>(v: T) => v.map((x) => x * k) as T;
    return {...p0, base: s(p0.base), wander: s(p0.wander), bandStep: s(p0.bandStep), tilt: p0.tilt * k, knee: p0.knee * k, shelf: s(p0.shelf), notch: s(p0.notch), chamfer: s(p0.chamfer), lipOut: s(p0.lipOut), over: s(p0.over), tongues: p0.tongues * k, shelves: p0.shelves * k};
  }
  if (L <= l1) return mixParams(p0, p1, (L - l0) / (l1 - l0));
  return mixParams(p1, p2, (L - l1) / (l2 - l1));
}

// ---------------------------------------------------------------- side coordinates

/** Side s (0 top, 1 right, 2 bottom, 3 left, clockwise): u runs along it from its start corner (TL, TR, BR, BL), d is
 *  the distance inward from that frame edge (negative = past the edge). */
const LEN = [W, H, W, H];
const toScreen = (s: number, u: number, d: number): Pt => (s === 0 ? [u, d] : s === 1 ? [W - d, u] : s === 2 ? [W - u, H - d] : [d, H - u]);
const fromScreen = (s: number, p: Pt): Knot => (s === 0 ? {u: p[0], d: p[1]} : s === 1 ? {u: p[1], d: W - p[0]} : s === 2 ? {u: W - p[0], d: H - p[1]} : {u: H - p[1], d: p[0]});
const lerpR = (r: Range, t: number) => r[0] + (r[1] - r[0]) * t;
/** How far past the frame edge a run-off block or ink stretch goes. */
const OFF = 40;

type Knot = {u: number; d: number};

function interp(k: Knot[], u: number): number {
  if (u <= k[0].u) return k[0].d;
  for (let i = 0; i < k.length - 1; i++) {
    const a = k[i];
    const b = k[i + 1];
    if (u >= a.u && u <= b.u) return b.u - a.u < 1e-6 ? b.d : a.d + ((b.d - a.d) * (u - a.u)) / (b.u - a.u);
  }
  return k[k.length - 1].d;
}

/** Zones (in side u) where the paper may not be deeper than `max`. */
type Zone = [number, number, number];
const [CX0, CY0, CX1, CY1] = CAPTION_SAFE;
const CAP_PAD = 36;
const RAIL: [number, number] = [PHONE_UI.rail.y0 - 40, PHONE_UI.rail.y1 + 40];
/** The paper allowed beside the caption block (left / right), under the right rail, above the caption block and at
 *  the bottom (the bottom UI block). */
export const PAINT_LIMITS = {left: CX0 - 12, right: W - CX1 - 12, rail: 18, top: CY0 - 24, bottom: PHONE_UI.bottom - 20};
const ZONES: Zone[][] = [
  [[CX0 - 30, CX1 + 30, PAINT_LIMITS.top]],
  [
    [CY0 - CAP_PAD, CY1 + CAP_PAD, PAINT_LIMITS.right],
    [RAIL[0], RAIL[1], PAINT_LIMITS.rail],
  ],
  [[-1e4, 1e4, PAINT_LIMITS.bottom]],
  [[H - (CY1 + CAP_PAD), H - (CY0 - CAP_PAD), PAINT_LIMITS.left]],
];
const zoneMax = (s: number, u: number) => ZONES[s].reduce((m, [a, b, z]) => (u >= a && u <= b ? Math.min(m, z) : m), Infinity);

/** Clamp a frame-facing block edge (side s) to its zones, inserting knots at the zone boundaries. */
function clampZones(s: number, k: Knot[]): Knot[] {
  let out = k;
  for (const [a, b, m] of ZONES[s]) {
    const ins: Knot[] = [];
    for (const u of [a, b]) if (u > out[0].u && u < out[out.length - 1].u && !out.some((p) => Math.abs(p.u - u) < 1e-6)) ins.push({u, d: interp(out, u)});
    out = [...out, ...ins].sort((p, q) => p.u - q.u).map((p) => (p.u >= a - 1e-6 && p.u <= b + 1e-6 ? {u: p.u, d: Math.min(p.d, m)} : p));
  }
  return out;
}

// ---------------------------------------------------------------- polygons

const area = (p: Pt[]) =>
  p.reduce((s, a, i) => {
    const b = p[(i + 1) % p.length];
    return s + a[0] * b[1] - b[0] * a[1];
  }, 0);
/** Clockwise on screen (positive shoelace with y down): every subpath of a nonzero clip must wind the same way. */
const cw = (p: Pt[]) => (area(p) < 0 ? p.slice().reverse() : p);
const dedupe = (p: Pt[]) =>
  p.filter((a, i) => {
    const b = p[(i + p.length - 1) % p.length];
    return Math.hypot(a[0] - b[0], a[1] - b[1]) > 0.5;
  });

function insidePoly(p: Pt, poly: Pt[]): boolean {
  let c = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const a = poly[i];
    const b = poly[j];
    if (a[1] > p[1] !== b[1] > p[1] && p[0] < ((b[0] - a[0]) * (p[1] - a[1])) / (b[1] - a[1] || 1e-9) + a[0]) c = !c;
  }
  return c;
}
/** Inside the union of polygons (nonzero over same-wound simple polygons = inside any). */
export const insideAny = (p: Pt, polys: Pt[][]) => polys.some((q) => insidePoly(p, q));
export function containsRectAny(polys: Pt[][], [x0, y0, x1, y1]: [number, number, number, number], step = 10): boolean {
  for (let x = x0; x <= x1; x += step) if (!insideAny([x, y0], polys) || !insideAny([x, y1], polys)) return false;
  for (let y = y0; y <= y1; y += step) if (!insideAny([x0, y], polys) || !insideAny([x1, y], polys)) return false;
  return true;
}

/** Paper depth at u on side s: how far a ray from that frame edge travels inward before it enters any polygon. */
export function depthAt(polys: Pt[][], s: number, u: number): number {
  let best = Infinity;
  for (const poly of polys) {
    for (let i = 0; i < poly.length; i++) {
      const a = fromScreen(s, poly[i]);
      const b = fromScreen(s, poly[(i + 1) % poly.length]);
      if (a.u > u === b.u > u) continue;
      const d = a.d + ((b.d - a.d) * (u - a.u)) / (b.u - a.u || 1e-9);
      if (d < best) best = d;
    }
  }
  return best;
}

/** A clockwise rect [x0, y0, x1, y1] whose corners drift a little (a hand-laid block, never exactly square). */
const block = (x0: number, y0: number, x1: number, y1: number, r: Rng, j = 2.5): Pt[] => [
  [x0 + r.jitter(j), y0 + r.jitter(j)],
  [x1 + r.jitter(j), y0 + r.jitter(j)],
  [x1 + r.jitter(j), y1 + r.jitter(j)],
  [x0 + r.jitter(j), y1 + r.jitter(j)],
];

// ---------------------------------------------------------------- the paint

type Role = 'unpainted' | 'bleed' | 'lip' | 'square';

export type PaintGeometry = {
  colour: string;
  /** The top band (it contains the caption block; the single-contour stand-in for checks written for one contour). */
  colourPts: Pt[];
  /** Every colour block (clockwise; the clip is their union). */
  colourPolys: Pt[][];
  ink: string;
  inkPolys: Pt[][];
  strokes: EdgeStroke[];
  /** Tuning / checks: the corner roles (TL, TR, BR, BL), the band boundaries, the looseness actually built. */
  meta: {roles: Role[]; splits: number[]; L: number};
};

const CACHE = new Map<string, PaintGeometry>();

/** The painted edge for a seed at a looseness (memoised). */
export function paintSpec(seed: Seed, looseness: number): PaintGeometry {
  const key = `${seed}|${looseness.toFixed(3)}`;
  let g = CACHE.get(key);
  if (!g) {
    let L = looseness;
    for (let i = 0; i < 10; i++, L *= 0.9) {
      g = build(seed, L);
      if (containsRectAny(g.colourPolys, CAPTION_SAFE, 10)) break;
    }
    CACHE.set(key, g!);
  }
  return g!;
}

type Band = {k: Knot[][]; frame: boolean[]; corners: number[]};

function build(seed: Seed, L: number): PaintGeometry {
  const P = paintParams(L);
  const r = rng(`${seed}/paint`);

  // 1. corner roles (shared across looseness): one unpainted corner, then bleed, lip, a second unpainted when loose
  const perm = r.fork('roles').shuffle([0, 1, 2, 3]);
  const roles: Role[] = ['square', 'square', 'square', 'square'];
  roles[perm[0]] = 'unpainted';
  if (L >= 0.75) roles[perm[1]] = 'bleed';
  if (L >= 0.3) roles[perm[2]] = 'lip';
  if (L >= 1.3) roles[perm[3]] = 'unpainted';

  // 2. band boundaries: the first just under the caption block (the top band holds it), more as it loosens
  const rsp = r.fork('splits');
  const s1 = rsp.range(680, 780);
  const s2a = rsp.range(1180, 1480);
  const s3a = rsp.range(1020, 1200);
  const s3b = rsp.range(1380, 1640);
  const nBands = L < 0.75 ? 2 : L < 1.3 ? 3 : 4;
  const splits = nBands === 2 ? [s1] : nBands === 3 ? [s1, s2a] : [s1, s3a, s3b];
  const nb = splits.length + 1;

  // 3. per band: side insets at both ends (each band a slightly tilted block), stepping from band to band
  const insets = (s: 1 | 3) => {
    const rr = r.fork(`insets${s}`);
    const out: [number, number][] = [];
    let prev = P.base[s] + P.wander[s] * rr.jitter(1);
    for (let i = 0; i < 6; i++) {
      const tilt = P.wander[s] * 0.5 * rr.jitter(1);
      const sign = prev > P.base[s] + P.wander[s] * 0.5 ? -1 : prev < P.base[s] - P.wander[s] * 0.5 ? 1 : rr.sign();
      const step = lerpR(P.bandStep, rr.next());
      if (i > 0) prev = P.base[s] + 0.4 * (prev - P.base[s]) + sign * step;
      out.push([prev - tilt / 2, prev + tilt / 2]);
    }
    return out.slice(0, nb);
  };
  const lIn = insets(3);
  const rIn = insets(1);
  const re = r.fork('ends');
  const topD: [number, number] = [P.base[0] + P.wander[0] * re.jitter(1), P.base[0] + P.wander[0] * re.jitter(1)];
  const botD: [number, number] = [P.base[2] + P.wander[2] * re.jitter(1), P.base[2] + P.wander[2] * re.jitter(1)];
  const rov = r.fork('overlap');
  const ovs = [0, 1, 2].map(() => [lerpR(P.ov, rov.next()), lerpR(P.ov, rov.next()), P.tilt * rov.jitter(1), P.tilt * rov.jitter(1)]);

  const clampD = (s: number, u: number, d: number) => Math.min(Math.max(d, P.minD), zoneMax(s, u));
  const rk = r.fork('knees');
  const kneeDraws = Array.from({length: 24}, () => [rk.next(), rk.range(0.3, 0.7), rk.jitter(1)]);
  let kneeI = 0;
  /** A block edge on side s from screen point a to b (clockwise), maybe with a knee; clamped if it faces the frame. */
  const edge = (s: number, a: Pt, b: Pt, frame: boolean): Knot[] => {
    const ka = fromScreen(s, a);
    const kb = fromScreen(s, b);
    const [c, t, j] = kneeDraws[kneeI++ % kneeDraws.length];
    const k: Knot[] = [ka];
    if (c < P.kneeP && kb.u - ka.u > 260) k.push({u: ka.u + (kb.u - ka.u) * t, d: Math.max(P.minD, ka.d + (kb.d - ka.d) * t + j * P.knee)});
    k.push(kb);
    return frame ? clampZones(s, k) : k;
  };

  // 4. the bands as knot lists per side (top, right, bottom, left); corner points clamped to the zones first
  const bands: Band[] = [];
  for (let i = 0; i < nb; i++) {
    const first = i === 0;
    const last = i === nb - 1;
    const oT = first ? null : ovs[i - 1];
    const oB = last ? null : ovs[i];
    const yTL = first ? topD[0] : splits[i - 1] - oT![1] + oT![2];
    const yTR = first ? topD[1] : splits[i - 1] - oT![1] - oT![2];
    const yBL = last ? H - botD[0] : splits[i] + oB![0] + oB![3];
    const yBR = last ? H - botD[1] : splits[i] + oB![0] - oB![3];
    const TL: Pt = [clampD(3, H - yTL, lIn[i][0]), first ? clampD(0, lIn[i][0], yTL) : yTL];
    const TR: Pt = [W - clampD(1, yTR, rIn[i][0]), first ? clampD(0, W - rIn[i][0], yTR) : yTR];
    const BR: Pt = [W - clampD(1, yBR, rIn[i][1]), last ? H - clampD(2, rIn[i][1], H - yBR) : yBR];
    const BL: Pt = [clampD(3, H - yBL, lIn[i][1]), last ? H - clampD(2, W - lIn[i][1], H - yBL) : yBL];
    bands.push({
      k: [edge(0, TL, TR, first), edge(1, TR, BR, true), edge(2, BR, BL, last), edge(3, BL, TL, true)],
      frame: [first, true, last, true],
      corners: [first ? 0 : -1, first ? 1 : -1, last ? 2 : -1, last ? 3 : -1],
    });
  }

  // 5. notches (colour only: the sketch keeps the band edge)
  const taken: [number, number][][] = [[], [], [], []]; // per frame side, in u
  const free = (s: number, lo: number, hi: number, w: number, forbid: [number, number][]): [number, number][] => {
    let fr: [number, number][] = [[lo, hi - w]];
    for (const [a, b] of [...forbid, ...taken[s].map(([a, b]) => [a - 50, b + 50] as [number, number])]) {
      fr = fr.flatMap(([x, y]) => {
        const o: [number, number][] = [];
        if (a - w > x) o.push([x, Math.min(y, a - w)]);
        if (b < y) o.push([Math.max(x, b), y]);
        return o;
      });
    }
    return fr.filter(([x, y]) => y > x);
  };
  const pickIn = (fr: [number, number][], t: number): number | null => {
    const tot = fr.reduce((s, [x, y]) => s + (y - x), 0);
    if (tot < 1) return null;
    let at = t * tot;
    for (const [x, y] of fr) {
      if (at <= y - x) return x + at;
      at -= y - x;
    }
    return null;
  };
  // keep features clear of the unpainted corners (they stay bare)
  const cornerKeep = (s: number): [number, number][] => {
    const out: [number, number][] = [];
    if (roles[s] === 'unpainted') out.push([-1e4, P.chamfer[1] + 80]);
    if (roles[(s + 1) % 4] === 'unpainted') out.push([LEN[s] - P.chamfer[1] - 80, 1e4]);
    return out;
  };
  const zoneForbid = (s: number): [number, number][] => ZONES[s].filter((z) => z[2] < 200).map(([a, b]) => [a - 30, b + 30]);
  const colK: Knot[][][] = bands.map((b) => b.k.map((k) => k.slice()));
  const nN = Math.round(P.notches);
  for (let i = 0; i < 5; i++) {
    const rf = r.fork(`notch${i}`);
    const s = rf.weighted([
      [3, 0.45],
      [2, 0.25],
      [0, 0.2],
      [1, 0.1],
    ] as const);
    const w = lerpR(P.notchW, rf.next());
    const depth = lerpR(P.notch, rf.next());
    const t = rf.next();
    const scoop = rf.chance(0.35);
    const a1 = rf.range(0.12, 0.3);
    const a2 = rf.range(0.7, 0.9);
    const k2 = rf.range(0.6, 1.1);
    const mirror = rf.chance(0.5);
    if (i >= nN) continue;
    // a frame-facing band edge on side s with room for it
    const cands = bands.map((b, bi) => ({bi, k: b.k[s], frame: b.frame[s]})).filter((c) => c.frame);
    const fr = cands.flatMap((c) => free(s, c.k[0].u + 70, c.k[c.k.length - 1].u - 70, w, [...zoneForbid(s), ...cornerKeep(s)]));
    const at = pickIn(fr, t);
    if (at === null) continue;
    const c = cands.find((cc) => at >= cc.k[0].u + 69 && at + w <= cc.k[cc.k.length - 1].u - 69);
    if (!c) continue;
    taken[s].push([at, at + w]);
    const ua = at;
    const ub = at + w;
    const base = colK[c.bi][s];
    const pos = (f: number) => (mirror ? ub - f * w : ua + f * w);
    const mid: Knot[] = (
      scoop
        ? [{u: pos(0.06 + a1 * 0.2), d: interp(base, pos(0.06 + a1 * 0.2)) + depth}]
        : [
            {u: pos(a1 * 0.5), d: interp(base, pos(a1 * 0.5)) + depth},
            {u: pos(1 - (1 - a2) * 0.5), d: interp(base, pos(1 - (1 - a2) * 0.5)) + depth * k2},
          ]
    ).sort((p, q) => p.u - q.u);
    colK[c.bi][s] = [...base.filter((p) => p.u < ua), {u: ua, d: interp(base, ua)}, ...mid, {u: ub, d: interp(base, ub)}, ...base.filter((p) => p.u > ub)];
  }

  // 6. assemble a band polygon, cutting its unpainted corners (paint: full chamfer; sketch: a smaller one)
  const rc = r.fork('chamfers');
  const cham = [0, 1, 2, 3].map(() => ({cIn: rc.next(), cOut: rc.next(), two: rc.chance(0.55), t1: rc.range(0.22, 0.42), t2: rc.range(0.58, 0.8), b1: rc.range(-0.3, 0.3), b2: rc.range(-0.3, 0.3), t0: rc.range(0.35, 0.65), b0: rc.range(-0.35, 0.25), ke: rc.range(0.4, 0.6)}));
  const chamExtent = (k: number, s: number, q: Pt) => {
    // along a vertical side: the top corners stay above the caption zone, the bottom-right below the rail
    if (s === 1 || s === 3) return k <= 1 ? Math.max(20, CY0 - CAP_PAD - 8 - q[1]) : k === 2 ? Math.max(20, q[1] - RAIL[1] - 8) : 420;
    return 420;
  };
  const assemble = (kk: Knot[][], corners: number[], sketch: boolean): Pt[] => {
    const lists = kk.map((k) => k.slice());
    const knees: Pt[][] = [[], [], [], []];
    for (let s = 0; s < 4; s++) {
      const k = corners[s]; // corner k joins list (k+3)%4's end with list k's start
      if (k < 0 || roles[k] !== 'unpainted') continue;
      const ci = cham[k];
      const sIn = (k + 3) % 4;
      const inL = lists[sIn];
      const outL = lists[k];
      const q = toScreen(k, outL[0].u, outL[0].d);
      const spanIn = inL[inL.length - 1].u - inL[0].u;
      const spanOut = outL[outL.length - 1].u - outL[0].u;
      const ke = sketch ? ci.ke : 1;
      const cIn = Math.min(lerpR(P.chamfer, ci.cIn), chamExtent(k, sIn, q), spanIn * 0.45) * ke;
      const cOut = Math.min(lerpR(P.chamfer, ci.cOut), chamExtent(k, k, q), spanOut * 0.45) * ke;
      const uA = inL[inL.length - 1].u - cIn;
      const uB = outL[0].u + cOut;
      const A = toScreen(sIn, uA, interp(inL, uA));
      const B = toScreen(k, uB, interp(outL, uB));
      lists[sIn] = [...inL.filter((p) => p.u < uA), fromScreen(sIn, A)];
      lists[k] = [fromScreen(k, B), ...outL.filter((p) => p.u > uB)];
      const knee = (t: number, bulge: number): Pt => {
        const m: Pt = [A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t];
        return [m[0] + (q[0] - m[0]) * bulge, m[1] + (q[1] - m[1]) * bulge];
      };
      knees[k] = ci.two ? [knee(ci.t1, ci.b1), knee(ci.t2, ci.b2)] : [knee(ci.t0, ci.b0)];
    }
    const pts: Pt[] = [];
    for (let s = 0; s < 4; s++) {
      pts.push(...knees[s]);
      pts.push(...lists[s].map((p) => toScreen(s, p.u, p.d)));
    }
    return cw(dedupe(pts));
  };
  const bandPaint = bands.map((b, i) => assemble(colK[i], b.corners, false));
  const bandSketch = bands.map((b) => assemble(b.k, b.corners, true));

  // 7. corner blocks: bleed (covers the frame corner) and lip (a small block overlapping the band corner)
  const blocks: Pt[][] = [];
  const lipCorner: Pt[] = [];
  const cornerQ = (k: number): Pt => {
    const b = k <= 1 ? bands[0] : bands[nb - 1];
    const kk = b.k[k];
    return toScreen(k, kk[0].u, kk[0].d);
  };
  const inward: Pt[] = [
    [1, 1],
    [-1, 1],
    [-1, -1],
    [1, -1],
  ];
  const fc: Pt[] = [
    [0, 0],
    [W, 0],
    [W, H],
    [0, H],
  ];
  for (let k = 0; k < 4; k++) {
    const rb = r.fork(`cblock${k}`);
    const q = cornerQ(k);
    const [ix, iy] = inward[k];
    const t1 = rb.next();
    const t2 = rb.next();
    const t3 = rb.next();
    const t4 = rb.next();
    const dx = Math.abs(q[0] - fc[k][0]);
    const dy = Math.abs(q[1] - fc[k][1]);
    if (roles[k] === 'bleed') {
      // reach along the horizontal edge (x) and the vertical edge (y), past the band corner
      const bx = Math.max(dx + 40, lerpR(P.bleed, t1));
      const by = Math.max(dy + 40, lerpR(P.bleed, t2) * (k <= 1 ? 0.8 : 1.2));
      const xs = [fc[k][0] - ix * OFF, fc[k][0] + ix * bx];
      const ys = [fc[k][1] - iy * OFF, fc[k][1] + iy * by];
      blocks.push(cw(block(Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys), rb)));
    } else if (roles[k] === 'lip') {
      const ox = Math.max(0, Math.min(lerpR(P.lipOut, t1), dx - P.minD));
      const oy = Math.max(0, Math.min(lerpR(P.lipOut, t2), dy - P.minD));
      const sx = lerpR(P.lip, t3);
      const sy = Math.min(lerpR(P.lip, t4), k <= 1 ? Math.max(30, CY0 - CAP_PAD - 8 - q[1]) : 400);
      const c: Pt = [q[0] - ix * ox, q[1] - iy * oy];
      const xs = [c[0], q[0] + ix * sx];
      const ys = [c[1], q[1] + iy * sy];
      blocks.push(cw(block(Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys), rb, 1.5)));
      lipCorner[k] = c;
    }
  }

  // 8. tongues (blocks run off an edge) and shelves (blocks stick further out of a side), on free stretches
  const nT = Math.round(P.tongues);
  const nS = Math.round(P.shelves);
  const features = (kind: 'tongue' | 'shelf', n: number) => {
    for (let i = 0; i < 4; i++) {
      const rf = r.fork(`${kind}${i}`);
      const s =
        kind === 'tongue'
          ? rf.weighted([
              [2, 0.5],
              [3, 0.25],
              [1, 0.1],
              [0, 0.15],
            ] as const)
          : rf.weighted([
              [3, 0.45],
              [0, 0.25],
              [2, 0.2],
              [1, 0.1],
            ] as const);
      const w = lerpR(kind === 'tongue' ? P.tongueW : P.shelfW, rf.next());
      const t = rf.next();
      const out = lerpR(P.shelf, rf.next());
      const slant = rf.range(0.18, 0.42);
      const flip = rf.chance(0.5);
      const reach = rf.range(30, 80);
      const jit = Array.from({length: 9}, () => rf.jitter(1.5));
      if (i >= n) continue;
      const forbid = [...cornerKeep(s), ...(kind === 'shelf' ? zoneForbid(s) : [])];
      const at = pickIn(free(s, 60, LEN[s] - 60, w, forbid), t);
      if (at === null) continue;
      taken[s].push([at, at + w]);
      // the colour depth along this stretch, so the block overlaps the body
      const body = [...bandPaint, ...blocks];
      let deep = 0;
      let shallow = Infinity;
      for (let u = at; u <= at + w; u += 10) {
        const d = depthAt(body, s, u);
        if (Number.isFinite(d)) {
          deep = Math.max(deep, d);
          shallow = Math.min(shallow, d);
        }
      }
      if (!Number.isFinite(shallow)) continue;
      const inner = deep + reach;
      let q: Pt[];
      if (kind === 'tongue') {
        // one long slant (like a ground plane in perspective) at one end, a short step at the other
        const e = slant * w;
        const a = flip ? 8 : e;
        const b = flip ? e : 8;
        q = [toScreen(s, at, -OFF), toScreen(s, at + w, -OFF), toScreen(s, at + w - b, inner), toScreen(s, at + a, inner)];
      } else {
        const o = shallow - out < P.minD + 4 ? -OFF : shallow - out;
        q = [toScreen(s, at, o), toScreen(s, at + w, o + jit[8] * 2), toScreen(s, at + w, inner), toScreen(s, at, inner)];
      }
      blocks.push(cw(q.map((p, j) => [p[0] + jit[2 * j], p[1] + jit[2 * j + 1]] as Pt)));
    }
  };
  features('tongue', nT);
  features('shelf', nS);

  const colourPolys = [...bandPaint, ...blocks];
  const sketchPolys = [...bandSketch, ...blocks];

  // 9. the ink: the sketch blocks + a comb along every edge (lines run past the colour and end in the white)
  const ri = r.fork('ink');
  const inkPolys: Pt[][] = [...sketchPolys];
  const toFrame = (p: Pt, n: Pt) => {
    if (p[0] < 0 || p[0] > W || p[1] < 0 || p[1] > H) return 0;
    const tx = n[0] > 1e-6 ? (W - p[0]) / n[0] : n[0] < -1e-6 ? -p[0] / n[0] : Infinity;
    const ty = n[1] > 1e-6 ? (H - p[1]) / n[1] : n[1] < -1e-6 ? -p[1] / n[1] : Infinity;
    return Math.min(tx, ty);
  };
  for (const poly of sketchPolys) {
    const m = poly.length;
    const lastOver: number[] = [];
    const firstOver: number[] = [];
    for (let i = 0; i < m; i++) {
      const a = poly[i];
      const b = poly[(i + 1) % m];
      const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
      firstOver[i] = lastOver[i] = 0;
      if (len < 2) continue;
      const dx = (b[0] - a[0]) / len;
      const dy = (b[1] - a[1]) / len;
      const n: Pt = [dy, -dx]; // outward for a clockwise (screen) polygon
      const comb: Pt[] = [a];
      let t = 0;
      while (t < len - 0.5) {
        const t1 = Math.min(len, t + lerpR(P.stretch, ri.next()));
        const ends = ri.next() < P.endP;
        const o = lerpR(P.over, ri.next());
        const short = ri.range(6, 22);
        const mid: Pt = [a[0] + dx * (t + t1) * 0.5, a[1] + dy * (t + t1) * 0.5];
        const D = toFrame(mid, n);
        const over = D < 16 || !ends ? D + OFF : Math.max(8, Math.min(o, D - short));
        if (t === 0) firstOver[i] = over;
        lastOver[i] = over;
        comb.push([a[0] + dx * t + n[0] * over, a[1] + dy * t + n[1] * over], [a[0] + dx * t1 + n[0] * over, a[1] + dy * t1 + n[1] * over]);
        t = t1;
      }
      comb.push(b);
      inkPolys.push(cw(comb));
    }
    // convex corners: a wedge, so lines do not stop dead at a block corner
    for (let i = 0; i < m; i++) {
      const p0 = poly[(i + m - 1) % m];
      const v = poly[i];
      const p1 = poly[(i + 1) % m];
      const d0: Pt = [v[0] - p0[0], v[1] - p0[1]];
      const d1: Pt = [p1[0] - v[0], p1[1] - v[1]];
      const l0 = Math.hypot(d0[0], d0[1]);
      const l1 = Math.hypot(d1[0], d1[1]);
      if (l0 < 2 || l1 < 2 || d0[0] * d1[1] - d0[1] * d1[0] <= 0) continue;
      const o = Math.min(lastOver[(i + m - 1) % m], firstOver[i]);
      if (!(o > 0)) continue;
      const n0: Pt = [d0[1] / l0, -d0[0] / l0];
      const n1: Pt = [d1[1] / l1, -d1[0] / l1];
      inkPolys.push(cw([v, [v[0] + n0[0] * o, v[1] + n0[1] * o], [v[0] + (n0[0] + n1[0]) * o * 0.7, v[1] + (n0[1] + n1[1]) * o * 0.7], [v[0] + n1[0] * o, v[1] + n1[1] * o]]));
    }
  }

  // 10. overlay: the artist's ruled corner at a painted top corner (square or lip), single thin strokes
  const strokes: EdgeStroke[] = [];
  const rs = r.fork('ruled');
  const topK = [0, 1].filter((k) => roles[k] === 'square' || roles[k] === 'lip');
  const pickK = rs.chance(0.5) ? 0 : 1;
  if (topK.length && L >= 0.3) {
    const k = topK.length > 1 ? pickK : topK[0];
    const q = roles[k] === 'lip' ? lipCorner[k] : cornerQ(k);
    const sx: 1 | -1 = k === 0 ? 1 : -1;
    const side = k === 0 ? q[0] : W - q[0];
    strokes.push(
      ...ruledCorner(rs, `${seed}pnt${k}`, q, sx, {
        h: {len: [150, 260], over: Math.max(6, Math.min(side - 8, rs.range(16, 26) * Math.min(1.3, L)))},
        v: {len: [140, Math.max(160, STROKE_MAX_Y - q[1])], over: 40},
      }),
    );
  }

  const path = (polys: Pt[][]) => polys.map((p) => pathOf(p)).join('');
  return {colour: path(colourPolys), colourPts: bandPaint[0], colourPolys, ink: path(inkPolys), inkPolys, strokes, meta: {roles, splits, L}};
}
