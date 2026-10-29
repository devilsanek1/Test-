// lib/patchwork.ts: tier C's "LOW POLY" PATCHWORK, an ENGINE primitive (owner, 2026-10-29, "Go with your suggestions"
// on the city-poster study's decision 3a: the near ground and the mid and far city as flat facets of the hero's
// colours, never on the subject, never as rectangles in the sky). The numbers are docs/look/CRAFT.md §b ("Tier C's
// build") (it wins over this file); the spec and how-to: docs/studies/2026-10-28_city_posters/test/ENGINE_PT.md (from
// style.md L4, pro_2_hierarchy.md §3.1 and §3.4, pro_4_colour.md §3.4). Opt-in and pure (no React, no frame state, no
// clock): nothing here runs unless a scene calls it, so a film that never imports it renders exactly as before.
//
// What it does: cuts a C mass (its layout polygon, in its PLANE's own coordinates) into flat facets by a seeded
// recursive GUILLOTINE (BSP) split, projects them onto the screen (lib/depth `groundCam` for a ground, so the facets
// recede and foreshorten; a quad's homography; or frontal for a mid or far city mass), snaps every vertex to a whole
// pixel (a vertex two facets share is shared exactly, so no seam opens), and gives each facet ONE flat tone from the
// plane's fills so that neighbours differ by dL* 4-10 near (2-4 far) as SHOWN. Facets are a pure function of the
// options: they belong to their parallax plane (draw them inside its float group) and never move or boil.
//
//   const cam = groundCam({horizon: 965, f: 1400, height: 1.3});                 // the shot's ONE camera
//   const PAVE = groundPatchwork(cam, {seed: 's1quay', poly: [[-7, 3], [7, 3], [7, 12], [-7, 12]], cell: 0.8,
//                                      tones: patchTones(CM.paving, {plane: -1}), plane: -1});
//   <Fill d={PAVE.base.d} color={PAVE.base.color} offset={false} />            // the base first (it fills every seam)
//   {patchPaths(PAVE).map((p) => <Fill key={p.key} d={p.d} color={p.color} offset={false} />)}
//   const FAR = frontalBlocks({seed: 's1far', poly: SKYLINE, tones: farTones, plane: 3});   // the far city, frontal
//   patchworkProblems(PAVE)                                                      // [] = OK (the scene's lint)
//
// Compute a patchwork ONCE (module scope or useMemo): it is deterministic, and ~300 facets take a few ms.

import {fromLch, lab, lch} from './light';
import {cleanColour} from './water';
import {applyH, rectToQuad, type Quad} from './persp';
import {rng, type Rng} from './rng';
import {groundCam, type GroundCam} from './depth';

export type Pt = [number, number];
/** A screen box [x0, y0, x1, y1] (px at 1080 x 1920). */
export type Box = [number, number, number, number];

// ================================================================= the plane's numbers (CRAFT §b; pro_2 §3.1; pro_4 §3.4)

export type PatchStep = {
  /** The smallest facet (its min width on screen, px): C near's smallest feature 8 px, C far's 12 (pro_2 §3.1). */
  minPx: number;
  /** The typical facet side on screen (px): C near 30-75 [49], C far 50-200 [77] (pro_2 §3.1). */
  cellPx: number;
  /** Neighbour facets' |dL*| as shown: 4-10 near, 2-4 far (pro_4 §3.4: "dL* 2-4 far, 4-10 near"; CRAFT §b). */
  dL: [number, number];
};

/** The patchwork's numbers by lib/depth plane (0 the subject's plane, -1 / -2 the foreground, +1 ... +4 farther). */
export const PATCH_PLANE: Record<number, PatchStep> = {
  [-2]: {minPx: 8, cellPx: 56, dL: [4, 10]},
  [-1]: {minPx: 8, cellPx: 52, dL: [4, 10]},
  0: {minPx: 8, cellPx: 50, dL: [4, 10]},
  1: {minPx: 8, cellPx: 56, dL: [4, 8]},
  2: {minPx: 10, cellPx: 64, dL: [3, 6]},
  3: {minPx: 12, cellPx: 77, dL: [2, 5]},
  4: {minPx: 12, cellPx: 90, dL: [2, 4]},
};

/** A plane's numbers (fractional planes take the nearer one; beyond the table the last). */
export function patchStep(plane = 0): PatchStep {
  const i = Math.max(-2, Math.min(4, Math.round(plane)));
  return PATCH_PLANE[i];
}

/** The caption band (keep clear): DIRECTION rule 10, LAYOUT.md "caption band (keep clear) y 290-600". */
export const PATCH_BAND: [number, number] = [290, 600];
/** CRAFT §c: "at most dL* 15 inside one plane" (C: flat shapes, 2 tones per mass). */
export const PATCH_SPAN_MAX = 15;
/** The slack on the neighbour rule: an 8-bit hex moves a tone's L* by up to ~0.2 each way. */
export const PATCH_TOL = 0.3;

// ================================================================= small geometry (plane coordinates u, v)

const EPS = 1e-9;
const area2 = (p: Pt[]) => {
  let s = 0;
  for (let i = 0; i < p.length; i++) {
    const a = p[i];
    const b = p[(i + 1) % p.length];
    s += a[0] * b[1] - b[0] * a[1];
  }
  return s;
};
const cross = (o: Pt, a: Pt, b: Pt) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
const centroid = (p: Pt[]): Pt => {
  const A = area2(p);
  if (Math.abs(A) < EPS) return [p.reduce((s, q) => s + q[0], 0) / p.length, p.reduce((s, q) => s + q[1], 0) / p.length];
  let cx = 0;
  let cy = 0;
  for (let i = 0; i < p.length; i++) {
    const a = p[i];
    const b = p[(i + 1) % p.length];
    const k = a[0] * b[1] - b[0] * a[1];
    cx += (a[0] + b[0]) * k;
    cy += (a[1] + b[1]) * k;
  }
  return [cx / (3 * A), cy / (3 * A)];
};
const bboxOf = (p: Pt[]): Box => {
  let x0 = Infinity;
  let y0 = Infinity;
  let x1 = -Infinity;
  let y1 = -Infinity;
  for (const [x, y] of p) {
    if (x < x0) x0 = x;
    if (y < y0) y0 = y;
    if (x > x1) x1 = x;
    if (y > y1) y1 = y;
  }
  return [x0, y0, x1, y1];
};
const overlaps = (a: Box, b: Box, m = 0) => a[0] <= b[2] + m && b[0] <= a[2] + m && a[1] <= b[3] + m && b[1] <= a[3] + m;

/** Drop repeated and collinear vertices (a split leaves them on the cut). */
function clean(p: Pt[], eps = 1e-9): Pt[] {
  let q = p.filter((v, i) => {
    const w = p[(i + 1) % p.length];
    return Math.abs(v[0] - w[0]) > eps || Math.abs(v[1] - w[1]) > eps;
  });
  let changed = true;
  while (changed && q.length > 3) {
    changed = false;
    for (let i = 0; i < q.length; i++) {
      const a = q[(i + q.length - 1) % q.length];
      const b = q[i];
      const c = q[(i + 1) % q.length];
      const len = Math.hypot(c[0] - a[0], c[1] - a[1]) || 1;
      if (Math.abs(cross(a, b, c)) / len < eps * 10) {
        q = q.filter((_, j) => j !== i);
        changed = true;
        break;
      }
    }
  }
  return q;
}

/** True when the polygon is convex (either winding). */
function isConvex(p: Pt[]): boolean {
  let sign = 0;
  for (let i = 0; i < p.length; i++) {
    const c = cross(p[i], p[(i + 1) % p.length], p[(i + 2) % p.length]);
    if (Math.abs(c) < EPS) continue;
    const s = Math.sign(c);
    if (sign && s !== sign) return false;
    sign = s;
  }
  return true;
}

/** Split a CONVEX polygon by the line a u + b v = c: [the side < c, the side > c] (either may be empty). Exact for
 *  axis-aligned cuts (the cut coordinate is copied, never recomputed). */
function splitConvex(p: Pt[], a: number, b: number, c: number): [Pt[], Pt[]] {
  const lo: Pt[] = [];
  const hi: Pt[] = [];
  const s = p.map(([u, v]) => a * u + b * v - c);
  for (let i = 0; i < p.length; i++) {
    const j = (i + 1) % p.length;
    const P = p[i];
    const Q = p[j];
    if (s[i] <= 0) lo.push(P);
    if (s[i] >= 0) hi.push(P);
    if ((s[i] < 0 && s[j] > 0) || (s[i] > 0 && s[j] < 0)) {
      const t = s[i] / (s[i] - s[j]);
      let X: Pt = [P[0] + (Q[0] - P[0]) * t, P[1] + (Q[1] - P[1]) * t];
      if (b === 0 && a !== 0) X = [c / a, X[1]];
      else if (a === 0 && b !== 0) X = [X[0], c / b];
      lo.push(X);
      hi.push(X);
    }
  }
  const L = clean(lo);
  const H = clean(hi);
  return [L.length >= 3 && Math.abs(area2(L)) > EPS ? L : [], H.length >= 3 && Math.abs(area2(H)) > EPS ? H : []];
}

/** Any simple polygon -> exact convex parts: itself when convex, else its vertical trapezoids (one slab per run of the
 *  same two edges: a skyline's buildings, an L's two arms). No library: the slab decomposition is exact and short. */
export function convexParts(poly: Pt[]): Pt[][] {
  const p = clean(poly);
  if (p.length < 3) return [];
  if (isConvex(p)) return [p];
  const n = p.length;
  const edges = p.map((a, i) => [a, p[(i + 1) % n]] as [Pt, Pt]).map(([a, b], i) => ({i, a, b, x0: Math.min(a[0], b[0]), x1: Math.max(a[0], b[0])})).filter((e) => e.x1 - e.x0 > EPS);
  const xs = Array.from(new Set(p.map((q) => q[0]))).sort((a, b) => a - b);
  const yAt = (e: {a: Pt; b: Pt}, x: number) => e.a[1] + ((e.b[1] - e.a[1]) * (x - e.a[0])) / (e.b[0] - e.a[0]);
  type Run = {lo: number; hi: number; x0: number; x1: number};
  const runs: Run[] = [];
  let open: Run[] = [];
  for (let s = 0; s + 1 < xs.length; s++) {
    const x0 = xs[s];
    const x1 = xs[s + 1];
    const xm = (x0 + x1) / 2;
    const span = edges.filter((e) => e.x0 <= x0 + EPS && e.x1 >= x1 - EPS).map((e) => ({i: e.i, y: yAt(e, xm)})).sort((a, b) => a.y - b.y);
    const next: Run[] = [];
    for (let k = 0; k + 1 < span.length; k += 2) {
      const lo = span[k].i;
      const hi = span[k + 1].i;
      const prev = open.find((r) => r.lo === lo && r.hi === hi && Math.abs(r.x1 - x0) < EPS);
      if (prev) {
        prev.x1 = x1;
        next.push(prev);
      } else {
        const r = {lo, hi, x0, x1};
        runs.push(r);
        next.push(r);
      }
    }
    open = next;
  }
  const byI = new Map(edges.map((e) => [e.i, e]));
  const out: Pt[][] = [];
  for (const r of runs) {
    const lo = byI.get(r.lo)!;
    const hi = byI.get(r.hi)!;
    const q = clean([[r.x0, yAt(lo, r.x0)], [r.x1, yAt(lo, r.x1)], [r.x1, yAt(hi, r.x1)], [r.x0, yAt(hi, r.x0)]]);
    if (q.length >= 3 && Math.abs(area2(q)) > EPS) out.push(q);
  }
  return out;
}

/** The chord of a convex polygon along u at height v: [u0, u1] (or null). */
function chordU(p: Pt[], v: number): [number, number] | null {
  let a = Infinity;
  let b = -Infinity;
  for (let i = 0; i < p.length; i++) {
    const P = p[i];
    const Q = p[(i + 1) % p.length];
    if ((P[1] - v) * (Q[1] - v) > 0) continue;
    if (Math.abs(Q[1] - P[1]) < EPS) {
      a = Math.min(a, P[0], Q[0]);
      b = Math.max(b, P[0], Q[0]);
    } else {
      const u = P[0] + ((Q[0] - P[0]) * (v - P[1])) / (Q[1] - P[1]);
      a = Math.min(a, u);
      b = Math.max(b, u);
    }
  }
  return a <= b ? [a, b] : null;
}
const swap = (p: Pt[]): Pt[] => p.map(([u, v]) => [v, u] as Pt);
function chordV(p: Pt[], u: number): [number, number] | null {
  return chordU(swap(p), u);
}

// ================================================================= projections

export type Project = (p: Pt) => Pt;
/** Frontal: plane coordinates ARE screen px (a mid or far city mass, a facade seen square on). */
export const frontal: Project = (p) => p;
/** A ground through the shot's ONE camera: plane (x, z) metres on `level` -> screen px (lib/depth groundCam). Every
 *  point must lie in front of the camera (z > ~0.1 m). */
export const viaCam = (cam: GroundCam, level = 0): Project => (p) => cam.pt(p[0], p[1], level);
/** ONE camera from two vanishing points on the horizon (a two-point view, like v2 S1's bank: lines along the canal
 *  to `vpL`, lines across it to `vpR`): lib/depth groundCam with f = sqrt((vpx - vpL)(vpR - vpx)) and its yaw. World
 *  z runs to `vpL`, world x to `vpR`. v2 S1's bank: twoPointCam({horizon: 1000, vpL: -1100, vpR: 2600, height}). */
export function twoPointCam(o: {horizon: number; vpL: number; vpR: number; vpx?: number; height: number}): GroundCam {
  const vpx = o.vpx ?? 540;
  const a = vpx - o.vpL;
  const b = o.vpR - vpx;
  if (!(a > 0 && b > 0)) throw new Error('twoPointCam: vpL < vpx < vpR');
  const f = Math.sqrt(a * b);
  return groundCam({horizon: o.horizon, vpx, f, height: o.height, yaw: (Math.atan(a / f) * 180) / Math.PI});
}
/** The ground point under a screen point (the inverse of `cam.pt` on `level`): world [x, z] metres, or null above
 *  the horizon. Lay a patchwork's polygon out from screen corners (a tread's ends, a quay's edge). */
export function groundAt(cam: GroundCam, sx: number, sy: number, level = 0): Pt | null {
  if (sy <= cam.horizon + 1e-6) return null;
  const zc = (cam.f * (cam.height - level)) / (sy - cam.horizon);
  const xc = ((sx - cam.vpx) * zc) / cam.f;
  const th = (cam.yaw * Math.PI) / 180;
  return [xc * Math.cos(th) + zc * Math.sin(th), -xc * Math.sin(th) + zc * Math.cos(th)];
}
/** A plane drawn into a screen quad (TL, TR, BR, BL): plane (u, v) in [0, w] x [0, h] (metres, or any unit) ->
 *  screen through the quad's homography (lib/persp): a tread between two lines to a vanishing point, a wall in
 *  perspective. Exact when the quad is the true perspective image of a w x h rectangle. */
export function viaQuad(quad: Quad, w: number, h: number): Project {
  const H = rectToQuad(w, h, quad);
  return (p) => applyH(H, p[0], p[1]);
}

// ================================================================= tones

/** `n` tones of one fill for a patchwork plane: L* steps of `step` centred on the base (n 4, step 4: -6 -2 +2 +6;
 *  span <= 15, CRAFT §c), hue kept, chroma eased 1 C* per 4 L* lighter (the darker ones a hair richer, like a paint
 *  loaded), and never beige, olive or grey (lib/water `cleanColour`: a cream stepped darker gets its warm chroma back). Steps follow the plane (`plane` sets the
 *  default `step` from PATCH_PLANE's dL: near 4, far 2). `shown` (the clean pen's tier pull, `c => tierFill(c,
 *  'environment')`) pre-compensates the tones so the steps SHOWN are `step` apart. Or pass a palette's siblings
 *  (lib/gamut `siblings`) straight to the patchwork instead. */
export function patchTones(base: string, o: {n?: number; step?: number; plane?: number; shown?: (hex: string) => string} = {}): string[] {
  const st = patchStep(o.plane ?? 0);
  const n = Math.max(2, Math.min(6, o.n ?? (st.dL[1] <= 6 ? 3 : 4)));
  // steps inside the plane's range: 4 tones near at 4.6 apart (pairs 4.6 / 9.2; the outer pair 13.8 never touches),
  // 3 tones farther at a step whose double still fits (far +4: 2.0 / 4.0)
  const step = o.step ?? (n >= 4 ? Math.min(st.dL[1] / 2, Math.max(st.dL[0] + 0.6, 4.6)) : Math.max(st.dL[0], Math.min(st.dL[1] / 2, st.dL[0] + 0.4)));
  const c = lch(base);
  const shownL = (L: number) => (o.shown ? lab(o.shown(fromLch(L, c.C, c.h)))[0] : L);
  const L0 = shownL(c.L);
  const out: string[] = [];
  for (let i = 0; i < n; i++) {
    const off = (i - (n - 1) / 2) * step;
    const target = L0 + off;
    // the authored L* whose shown L* hits the target (the tier pull is monotone in L*): bisection
    let lo = 0;
    let hi = 100;
    for (let k = 0; k < 40; k++) {
      const m = (lo + hi) / 2;
      if (shownL(m) < target) lo = m;
      else hi = m;
    }
    const L = o.shown ? (lo + hi) / 2 : c.L + off;
    const C = Math.max(0, c.C - (L - c.L) * 0.25);
    // never beige, olive or grey (lib/water neverBand: a warm cream stepped darker gets its warm chroma back)
    out.push(cleanColour(fromLch(Math.max(0, Math.min(100, L)), C, c.h), c.h));
  }
  return out;
}

// ================================================================= the patchwork

export type PatchOpts = {
  seed: string;
  /** The mass in PLANE coordinates (u, v): one simple polygon (convex or not: cut into exact convex parts) or a list of
   *  polygons (parts: buildings of a skyline, treads of a flight). Neighbours across parts still differ. */
  poly: Pt[] | Pt[][];
  /** Plane -> screen px: `frontal` (default), `viaCam(cam, level)`, `viaQuad(quad, w, h)`, or any projective map. */
  project?: Project;
  /** The lib/depth plane it lies on: sets minPx, the facet size and the neighbour steps (PATCH_PLANE). Default 0. */
  plane?: number;
  /** The facet size to aim for, in PLANE units ([u, v] or one number). Default: the plane's cellPx through the
   *  projection at the mass's centre. On a ground, give metres (a paving module): far facets come out smaller on
   *  screen (the texture gradient, CRAFT §f.4), near ones are split further at `maxPx`. */
  cell?: number | [number, number];
  /** Never split below this min width on screen (px). Default the plane's minPx (8 near, 12 far). */
  minPx?: number;
  /** Keep splitting while a facet's side on screen is over this (px). Default 1.7 x the plane's cellPx. */
  maxPx?: number;
  /** A cut falls in [0.5 - jitter, 0.5 + jitter] of the cell (default 0.25: children 25-75 %). */
  jitter?: number;
  /** Cuts snap to multiples of this from the mass's min (plane units; [u, v] or one number): a paving module. */
  grid?: number | [number, number];
  /** Frontal masses: the share of the top row's facets cut at 45 deg from a top corner (roof triangles; posters 4-22
   *  % of edges diagonal). Default 0 (0.15 in frontalBlocks). */
  diagonal?: number;
  /** The plane's fills (>= 3 for the neighbour rule; 2 = a far plane's two values: equal neighbours then merge). */
  tones: string[];
  /** Neighbours' |dL*| as shown: default the plane's (4-10 near, 2-4 far). */
  dL?: [number, number];
  /** The colour as drawn (the clean pen's tier pull: `c => tierFill(c, 'environment')`); default as authored. */
  shown?: (hex: string) => string;
  /** The screen direction TOWARD the key light ([-1, -0.3] = a low sun at the left): facets on that side lean to
   *  the lighter tones ("lighter toward the key", pro_4 §3.4). */
  key?: Pt;
  /** How strongly the key biases the tones (default 1.2 with a key). */
  keyBias?: number;
  /** Screen rows kept clear (DIRECTION rule 10): default the caption band y 290-600; null = none. */
  band?: [number, number] | null;
  /** The band's margin for the float (px; default 12: the near ground's net float). */
  bandMargin?: number;
  /** Screen boxes kept clear (the subject and its calm field: "never on the subject"); facets touching one are
   *  dropped, so the base (one calm tone) shows there. */
  avoid?: Box[];
  /** Identity marks: about one facet in `marks` is flagged (default 4.5: "one every 3-6 facets", pro_2 §3.1), never
   *  two neighbours; draw them with `markShape`. false = none. */
  marks?: number | false;
  /** The screen area worth cutting (px): the frame plus the float's overscan, default [-80, -80, 1160, 2000]. A cell
   *  wholly outside is left uncut and not returned (the base still covers it). */
  clip?: Box;
};

export type Facet = {
  id: number;
  /** The convex part of the mass it came from. */
  part: number;
  /** Its polygon in plane coordinates (T-junction vertices included). */
  uv: Pt[];
  /** On screen, whole px. */
  pts: Pt[];
  d: string;
  tone: number;
  color: string;
  /** Screen centroid, area (px^2), min width (px), bbox. */
  c: Pt;
  area: number;
  minW: number;
  box: Box;
  /** Its top edge lies on the mass's outline (frontal: a roof row). */
  top: boolean;
  /** An uncut part of the mass (a thin far strip may be narrower than minPx: it is the mass, not a sliver). */
  whole: boolean;
  /** Its screen width (along the plane's u) and depth (along v) through its centroid (px). */
  wU: number;
  wV: number;
  /** Carries an identity mark (markShape). */
  mark: boolean;
};

export type Patchwork = {
  facets: Facet[];
  /** The base under the facets: the whole mass in the middle tone. Draw it first: it fills every anti-aliased seam
   *  (the leak is <= a quarter pixel of a neighbour tone) and every dropped facet (the band, the avoid boxes). */
  base: {d: string; color: string};
  tones: string[];
  /** Neighbours by facet index (a shared edge of positive length). */
  adj: number[][];
  /** What the lint needs. */
  spec: {plane: number; minPx: number; dL: [number, number]; band: [number, number] | null; bandMargin: number; avoid: Box[]; shown: (hex: string) => string};
  project: Project;
  /** Facets dropped: in the band, in an avoid box, or degenerate after snapping. */
  dropped: number;
  /** Neighbour pairs of two different tones whose shown |dL*| left the range (after the repair). */
  offRange: number;
};

type Cell = {uv: Pt[]; part: number; top: boolean; whole: boolean};

const r1 = (n: number) => Math.round(n * 10) / 10;
const pathOf = (pts: Pt[]) => (pts.length >= 3 ? 'M' + pts.map(([x, y]) => `${x} ${y}`).join('L') + 'Z' : '');
const keyOf = ([u, v]: Pt) => `${Math.round(u * 1e6)},${Math.round(v * 1e6)}`;

/** The min width of a convex screen polygon (rotating calipers, O(n^2) for our few vertices). */
function minWidth(p: Pt[]): number {
  let best = Infinity;
  for (let i = 0; i < p.length; i++) {
    const a = p[i];
    const b = p[(i + 1) % p.length];
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
    if (len < 1e-6) continue;
    let far = 0;
    for (const q of p) far = Math.max(far, Math.abs(cross(a, b, q)) / len);
    best = Math.min(best, far);
  }
  return best === Infinity ? 0 : best;
}

/** THE PATCHWORK: a seeded guillotine split of the mass (plane coordinates), projected, snapped to whole pixels, toned. */
export function patchwork(o: PatchOpts): Patchwork {
  const plane = o.plane ?? 0;
  const st = patchStep(plane);
  const project = o.project ?? frontal;
  const minPx = o.minPx ?? st.minPx;
  const maxPx = o.maxPx ?? st.cellPx * 1.7;
  const jit = Math.max(0, Math.min(0.4, o.jitter ?? 0.25));
  const dL = o.dL ?? st.dL;
  const shown = o.shown ?? ((c: string) => c);
  const band = o.band === undefined ? PATCH_BAND : o.band;
  const bandMargin = o.bandMargin ?? 12;
  const avoid = o.avoid ?? [];
  const r = rng(`patchwork/${o.seed}`);
  if (o.tones.length < 1) throw new Error(`patchwork(${o.seed}): give the plane's tones`);

  // the parts (exact convex pieces of the mass)
  const polys: Pt[][] = (Array.isArray(o.poly[0]?.[0]) ? (o.poly as Pt[][]) : [o.poly as Pt[]]).map((p) => p.map(([u, v]) => [u, v] as Pt));
  const parts: Pt[][] = [];
  for (const p of polys) for (const q of convexParts(p)) parts.push(q);
  if (!parts.length) throw new Error(`patchwork(${o.seed}): an empty mass`);

  // the facet size in plane units: given, or the plane's cellPx at the mass's centre through the projection
  const all = parts.flat();
  const mb = bboxOf(all);
  const mc: Pt = [(mb[0] + mb[2]) / 2, (mb[1] + mb[3]) / 2];
  const pxPer = (c: Pt, axis: 0 | 1, du: number) => {
    const a = project(c);
    const b = project(axis === 0 ? [c[0] + du, c[1]] : [c[0], c[1] + du]);
    return Math.hypot(b[0] - a[0], b[1] - a[1]) / du;
  };
  const cell: [number, number] = typeof o.cell === 'number' ? [o.cell, o.cell] : o.cell ?? [st.cellPx / Math.max(1e-6, pxPer(mc, 0, (mb[2] - mb[0]) * 1e-3 || 1e-3)), st.cellPx / Math.max(1e-6, pxPer(mc, 1, (mb[3] - mb[1]) * 1e-3 || 1e-3))];
  // a guillotine cut makes children of 25-75 %: aim the split threshold so the median facet lands near `cell`
  const grid: [number, number] = typeof o.grid === 'number' ? [o.grid, o.grid] : o.grid ?? [0, 0];
  const diag = Math.max(0, Math.min(1, o.diagonal ?? 0));

  const scrLen = (a: Pt, b: Pt) => {
    const A = project(a);
    const B = project(b);
    return Math.hypot(B[0] - A[0], B[1] - A[1]);
  };
  /** The cell's screen length along an axis through its centroid (its size there). */
  const midChord = (p: Pt[], axis: 0 | 1): number => {
    const c = centroid(p);
    if (axis === 0) {
      const ch = chordU(p, c[1]);
      return ch ? scrLen([ch[0], c[1]], [ch[1], c[1]]) : 0;
    }
    const ch = chordV(p, c[0]);
    return ch ? scrLen([c[0], ch[0]], [c[0], ch[1]]) : 0;
  };
  /** Its true min width on screen (a projective map keeps a convex cell convex in front of the camera). */
  const scrW = (p: Pt[]) => minWidth(p.map(project));
  const clip = o.clip ?? ([-80, -80, 1160, 2000] as Box);
  const onScreen = (p: Pt[]) => overlaps(bboxOf(p.map(project)), clip);

  const leaves: Cell[] = [];
  const split = (cl: Cell, depth: number, rr: Rng) => {
    const p = cl.uv;
    if (!onScreen(p)) return; // wholly off the frame: uncut, not returned (the base covers it)
    const b = bboxOf(p);
    const len: [number, number] = [b[2] - b[0], b[3] - b[1]];
    const scr: [number, number] = [midChord(p, 0), midChord(p, 1)];
    const need = [0, 1].map((ax) => Math.max(len[ax] / (cell[ax] * (0.9 + 0.35 * rr.next())), scr[ax] / maxPx));
    const order: (0 | 1)[] = need[0] >= need[1] ? [0, 1] : [1, 0];
    if (depth < 48) {
      for (const ax of order) {
        if (need[ax] <= 1.12 || scr[ax] < 2 * minPx) continue;
        const lo = ax === 0 ? b[0] : b[1];
        const L = len[ax];
        const tries = [0.5 + (rr.next() * 2 - 1) * jit, 0.5 + (rr.next() * 2 - 1) * jit * 0.5, 0.5];
        for (const t of tries) {
          let c = lo + L * t;
          const g = grid[ax];
          if (g > 0) {
            c = lo + Math.round((c - lo) / g) * g;
            if (c <= lo + EPS || c >= lo + L - EPS) continue;
          }
          const [A, B] = ax === 0 ? splitConvex(p, 1, 0, c) : splitConvex(p, 0, 1, c);
          if (!A.length || !B.length) continue;
          // both children keep the plane's min width on screen (never a sliver), unless the parent was already thinner
          const wP = scrW(p);
          const floor = Math.min(minPx, wP);
          if (scrW(A) < floor || scrW(B) < floor) continue;
          // v grows downward on a frontal mass: the lower-v child keeps the top edge
          split({uv: A, part: cl.part, top: cl.top, whole: false}, depth + 1, rr.fork('a'));
          split({uv: B, part: cl.part, top: ax === 0 ? cl.top : false, whole: false}, depth + 1, rr.fork('b'));
          return;
        }
      }
    }
    // a leaf; on a roof row, maybe one 45-degree corner triangle
    if (diag > 0 && cl.top && rr.next() < diag) {
      const leg = Math.min(len[0], len[1]) * (0.45 + 0.3 * rr.next());
      const left = rr.next() < 0.5;
      // the triangle at a top corner: u - u0 + v - v0 < leg (left) or (u1 - u) + (v - v0) < leg (right)
      const [Tr, R] = left ? splitConvex(p, 1, 1, b[0] + b[1] + leg) : splitConvex(p, -1, 1, -b[2] + b[1] + leg);
      if (Tr.length && R.length && scrW(Tr) >= minPx && scrW(R) >= minPx) {
        leaves.push({uv: Tr, part: cl.part, top: true, whole: false}, {uv: R, part: cl.part, top: false, whole: false});
        return;
      }
    }
    leaves.push(cl);
  };
  parts.forEach((p, i) => split({uv: p, part: i, top: true, whole: true}, 0, r.fork(`part${i}`)));

  // T-junctions: every vertex lying on another facet's edge is inserted there, so neighbours share whole edges and
  // their snapped screen vertices coincide exactly (no hairline seam, no overlap)
  const boxes = leaves.map((l) => bboxOf(l.uv));
  const scale = Math.max(mb[2] - mb[0], mb[3] - mb[1]) || 1;
  const tol = scale * 1e-9 + 1e-9;
  const uvs: Pt[][] = leaves.map((l, i) => {
    const p = l.uv;
    const out: Pt[] = [];
    const cands: Pt[] = [];
    for (let j = 0; j < leaves.length; j++) if (j !== i && overlaps(boxes[i], boxes[j], tol * 10)) for (const v of leaves[j].uv) cands.push(v);
    for (let k = 0; k < p.length; k++) {
      const a = p[k];
      const b = p[(k + 1) % p.length];
      out.push(a);
      const dx = b[0] - a[0];
      const dy = b[1] - a[1];
      const L2 = dx * dx + dy * dy;
      if (L2 < EPS) continue;
      const on: {t: number; v: Pt}[] = [];
      for (const v of cands) {
        const t = ((v[0] - a[0]) * dx + (v[1] - a[1]) * dy) / L2;
        if (t <= 1e-9 || t >= 1 - 1e-9) continue;
        if (Math.abs(cross(a, b, v)) / Math.sqrt(L2) > tol * 100) continue;
        on.push({t, v});
      }
      on.sort((x, y) => x.t - y.t);
      for (const q of on) if (keyOf(q.v) !== keyOf(out[out.length - 1])) out.push(q.v);
    }
    return out;
  });

  // project and snap: one screen point per plane vertex
  const snap = new Map<string, Pt>();
  const scr = (v: Pt): Pt => {
    const k = keyOf(v);
    let s = snap.get(k);
    if (!s) {
      const [x, y] = project(v);
      s = [Math.round(x), Math.round(y)];
      snap.set(k, s);
    }
    return s;
  };
  type Raw = {uv: Pt[]; pts: Pt[]; part: number; top: boolean; whole: boolean; wU: number; wV: number};
  const raws: Raw[] = [];
  let dropped = 0;
  uvs.forEach((uv, i) => {
    const pts0 = uv.map(scr);
    const pts = pts0.filter((q, k) => {
      const w = pts0[(k + 1) % pts0.length];
      return q[0] !== w[0] || q[1] !== w[1];
    });
    if (pts.length < 3 || Math.abs(area2(pts)) / 2 < 1) {
      dropped++;
      return;
    }
    const box = bboxOf(pts);
    if (band && box[3] >= band[0] - bandMargin && box[1] <= band[1] + bandMargin) {
      dropped++;
      return;
    }
    if (avoid.some((a) => overlaps(box, a))) {
      dropped++;
      return;
    }
    const l = leaves[i];
    raws.push({uv, pts, part: l.part, top: l.top, whole: l.whole, wU: r1(midChord(l.uv, 0)), wV: r1(midChord(l.uv, 1))});
  });

  // neighbours: facets sharing an edge (identical vertex pair after the T-junction pass)
  const edgeMap = new Map<string, number[]>();
  raws.forEach((f, i) => {
    for (let k = 0; k < f.uv.length; k++) {
      const a = keyOf(f.uv[k]);
      const b = keyOf(f.uv[(k + 1) % f.uv.length]);
      if (a === b) continue;
      const e = a < b ? `${a}|${b}` : `${b}|${a}`;
      const l = edgeMap.get(e);
      if (l) l.push(i);
      else edgeMap.set(e, [i]);
    }
  });
  const adjSet = raws.map(() => new Set<number>());
  for (const l of edgeMap.values()) for (const i of l) for (const j of l) if (i !== j) adjSet[i].add(j);
  const adj = adjSet.map((s) => Array.from(s).sort((a, b) => a - b));

  // tones: DSatur colouring with the value rule (neighbours' shown |dL*| in [lo, hi]), seeded preferences leaning
  // lighter toward the key, usage kept even; then repair passes
  const T = o.tones;
  const LS = T.map((c) => lab(shown(c))[0]);
  const Lmid = (Math.max(...LS) + Math.min(...LS)) / 2;
  const Lhalf = Math.max(1e-6, (Math.max(...LS) - Math.min(...LS)) / 2);
  // the 8-bit hex moves a tone's L* by up to ~0.2, so the range is read with that slack (PATCH_TOL)
  const ok = (a: number, b: number) => {
    if (T.length <= 2) return a !== b || T.length === 1;
    const d = Math.abs(LS[a] - LS[b]);
    return d >= dL[0] - PATCH_TOL && d <= dL[1] + PATCH_TOL;
  };
  // the cost of a pair: a SPIKE (over the range's top: a contrast the C tier must not have) is the worst; a step
  // under the bottom reads as one facet with a faint seam (the posters keep 12-52 % such soft steps); the same tone
  // merges the two into one bigger facet (harmless): lightest
  const viol = (a: number, b: number) => {
    if (T.length <= 2) return a === b ? 1 : 0;
    if (a === b) return 0.6;
    const d = Math.abs(LS[a] - LS[b]);
    if (d > dL[1] + PATCH_TOL) return 2 + 2 * (d - dL[1] - PATCH_TOL);
    if (d < dL[0] - PATCH_TOL) return 0.4 + (dL[0] - PATCH_TOL - d);
    return 0;
  };
  const cs = raws.map((f) => centroid(f.pts));
  const sb = bboxOf(cs.length ? cs : [[0, 0]]);
  const kd = o.key ? Math.hypot(o.key[0], o.key[1]) || 1 : 1;
  const kdir: Pt | null = o.key ? [o.key[0] / kd, o.key[1] / kd] : null;
  const kb = o.keyBias ?? 1.2;
  const sc: Pt = [(sb[0] + sb[2]) / 2, (sb[1] + sb[3]) / 2];
  const ext = Math.max(1, Math.abs((sb[2] - sb[0]) * (kdir?.[0] ?? 0)) / 2 + Math.abs((sb[3] - sb[1]) * (kdir?.[1] ?? 0)) / 2);
  const tr = r.fork('tones');
  const pref = raws.map((_, i) => {
    const s = kdir ? Math.max(-1, Math.min(1, ((cs[i][0] - sc[0]) * kdir[0] + (cs[i][1] - sc[1]) * kdir[1]) / ext)) : 0;
    return T.map((_, k) => (0.55 + 0.9 * tr.next()) * Math.exp(kb * s * ((LS[k] - Lmid) / Lhalf)));
  });
  const tone = raws.map(() => -1);
  const usage = T.map(() => 0);
  const expected = Math.max(1, raws.length / T.length);
  const tie = raws.map(() => tr.next());
  // saturation (distinct tones among coloured neighbours), kept incrementally
  const seen = raws.map(() => T.map(() => 0));
  const sat = raws.map(() => 0);
  for (let n = 0; n < raws.length; n++) {
    let best = -1;
    for (let i = 0; i < raws.length; i++) {
      if (tone[i] >= 0) continue;
      if (best < 0 || sat[i] > sat[best] || (sat[i] === sat[best] && (adj[i].length > adj[best].length || (adj[i].length === adj[best].length && tie[i] > tie[best])))) best = i;
    }
    const i = best;
    const nb = adj[i].filter((j) => tone[j] >= 0);
    const cand = T.map((_, k) => k).filter((k) => nb.every((j) => ok(k, tone[j])));
    let pick: number;
    if (cand.length) {
      const w = cand.map((k) => pref[i][k] / (1 + usage[k] / expected));
      let x = tr.next() * w.reduce((s, v) => s + v, 0);
      pick = cand[cand.length - 1];
      for (let q = 0; q < cand.length; q++) if ((x -= w[q]) <= 0) {
        pick = cand[q];
        break;
      }
    } else {
      let bv = Infinity;
      pick = 0;
      for (let k = 0; k < T.length; k++) {
        const v = nb.reduce((s, j) => s + viol(k, tone[j]), 0) - 1e-3 * pref[i][k];
        if (v < bv) {
          bv = v;
          pick = k;
        }
      }
    }
    tone[i] = pick;
    usage[pick]++;
    for (const j of adj[i]) if (seen[j][pick]++ === 0) sat[j]++;
  }
  // repair: min-conflicts (a conflicted facet takes its least-cost tone, ties seeded; now and then a random step to
  // leave a local minimum), kept incrementally, keeping the best assignment. Odd wheels force some same-tone pairs
  // (four tones, the outer pair never neighbours): those merge into one bigger facet, the cheap way out.
  const costAt = (i: number, k: number) => adj[i].reduce((s, j) => s + viol(k, tone[j]), 0);
  const fc = raws.map((_, i) => costAt(i, tone[i]));
  const bad = new Set<number>();
  fc.forEach((c, i) => c > 0 && bad.add(i));
  let cur = fc.reduce((s, c) => s + c, 0) / 2;
  let bestCost = cur;
  let bestTone = tone.slice();
  const mr = r.fork('repair');
  const steps = Math.min(raws.length * 30, 20000);
  for (let it = 0; it < steps && bestCost > 1e-9 && bad.size; it++) {
    const list = Array.from(bad);
    const i = list[Math.floor(mr.next() * list.length)];
    let bv = Infinity;
    let picks: number[] = [];
    for (let k = 0; k < T.length; k++) {
      const v = costAt(i, k);
      if (v < bv - 1e-9) {
        bv = v;
        picks = [k];
      } else if (Math.abs(v - bv) <= 1e-9) picks.push(k);
    }
    const nk = mr.next() < 0.06 ? Math.floor(mr.next() * T.length) : picks[Math.floor(mr.next() * picks.length)];
    if (nk === tone[i]) continue;
    const old = tone[i];
    tone[i] = nk;
    cur += costAt(i, nk) - adj[i].reduce((s, j) => s + viol(old, tone[j]), 0);
    for (const j of [i, ...adj[i]]) {
      fc[j] = costAt(j, tone[j]);
      if (fc[j] > 1e-9) bad.add(j);
      else bad.delete(j);
    }
    if (cur < bestCost - 1e-9) {
      bestCost = cur;
      bestTone = tone.slice();
    }
  }
  for (let i = 0; i < raws.length; i++) tone[i] = bestTone[i];
  let offRange = 0;
  raws.forEach((_, i) => adj[i].forEach((j) => {
    if (j > i && tone[i] !== tone[j] && !ok(tone[i], tone[j])) offRange++;
  }));

  // identity marks: about one facet in `marks`, roomy ones, never two neighbours
  const meanGap = o.marks === false ? 0 : o.marks ?? 4.5;
  const mark = raws.map(() => false);
  if (meanGap > 0) {
    const order = r.fork('marks').shuffle(raws.map((_, i) => i));
    const roomy = order.filter((i) => minWidth(raws[i].pts) >= 2.6 * minPx);
    const target = Math.round(raws.length / meanGap);
    let n = 0;
    for (const i of roomy) {
      if (n >= target) break;
      if (adj[i].some((j) => mark[j])) continue;
      mark[i] = true;
      n++;
    }
  }

  const facets: Facet[] = raws.map((f, i) => ({
    id: i,
    part: f.part,
    uv: f.uv,
    pts: f.pts,
    d: pathOf(f.pts),
    tone: tone[i],
    color: T[tone[i]],
    c: [r1(cs[i][0]), r1(cs[i][1])],
    area: Math.abs(area2(f.pts)) / 2,
    minW: r1(minWidth(f.pts)),
    box: bboxOf(f.pts),
    top: f.top,
    whole: f.whole,
    wU: f.wU,
    wV: f.wV,
    mark: mark[i],
  }));

  // the base: the whole mass (its parts), the middle tone
  let mid = 0;
  for (let k = 0; k < T.length; k++) if (Math.abs(LS[k] - Lmid) < Math.abs(LS[mid] - Lmid)) mid = k;
  const baseD = parts.map((p) => pathOf(p.map(scr))).join('');
  return {
    facets,
    base: {d: baseD, color: T[mid]},
    tones: T.slice(),
    adj,
    spec: {plane, minPx, dL, band, bandMargin, avoid, shown},
    project,
    dropped,
    offRange,
  };
}

/** A ground's patchwork through the shot's ONE camera (CRAFT §f.4: projected, so it recedes; never level bands): the
 *  mass in ground (x, z) metres on `level`; `cell` in metres (a paving module, default ~0.9 m near). */
export function groundPatchwork(cam: GroundCam, o: Omit<PatchOpts, 'project'> & {level?: number}): Patchwork {
  const {level, ...rest} = o;
  // a ground's marks are things (a drain, a mooring ring, a hatch: pro_2 §4), sparser than a facade's windows
  return patchwork({plane: -1, marks: 16, ...rest, project: viaCam(cam, level ?? 0)});
}

/** A mid or far city mass, FRONTAL (CRAFT §b: frontal on mid and far masses): the mass in screen px, cuts level and
 *  plumb at whole pixels (and 45-degree roof triangles on the top row), facets from the plane's size (far ~77 px). */
export function frontalBlocks(o: Omit<PatchOpts, 'project'>): Patchwork {
  const snapPoly = (p: Pt[]) => p.map(([x, y]) => [Math.round(x), Math.round(y)] as Pt);
  const poly = Array.isArray(o.poly[0]?.[0]) ? (o.poly as Pt[][]).map(snapPoly) : snapPoly(o.poly as Pt[]);
  const plane = o.plane ?? 3;
  const st = patchStep(plane);
  return patchwork({diagonal: 0.15, grid: 1, cell: st.cellPx * 1.25, ...o, plane, poly, project: frontal});
}

// ================================================================= drawing helpers

export type PatchPath = {key: string; d: string; color: string; c: Pt};

/** The facets as few paths: `by` 'tone' (one compound path per tone: the fewest nodes), 'cell' (per tone per `cell`
 *  px square of the screen: a frame-0 flood (lib/exit Look cascade) ripples cell by cell), or 'facet'. The base is not
 *  included (draw `pw.base` first). */
export function patchPaths(pw: Patchwork, o: {by?: 'tone' | 'cell' | 'facet'; cell?: number} = {}): PatchPath[] {
  const by = o.by ?? 'tone';
  if (by === 'facet') return pw.facets.map((f) => ({key: `f${f.id}`, d: f.d, color: f.color, c: f.c}));
  const g = Math.max(16, o.cell ?? 160);
  const groups = new Map<string, {d: string[]; color: string; xs: number; ys: number; n: number}>();
  for (const f of pw.facets) {
    const k = by === 'tone' ? `t${f.tone}` : `t${f.tone}c${Math.floor(f.c[0] / g)}_${Math.floor(f.c[1] / g)}`;
    const e = groups.get(k);
    if (e) {
      e.d.push(f.d);
      e.xs += f.c[0];
      e.ys += f.c[1];
      e.n++;
    } else groups.set(k, {d: [f.d], color: f.color, xs: f.c[0], ys: f.c[1], n: 1});
  }
  return Array.from(groups.entries()).map(([key, e]) => ({key, d: e.d.join(''), color: e.color, c: [r1(e.xs / e.n), r1(e.ys / e.n)] as Pt}));
}

/** A mark's tone on its facet: near, a darker step of the facet's own colour (dL* -7, hue kept, a hair richer: a
 *  drain, a ring, a slot; never a dark speck); far (plane >= 2), tone-on-tone (dL* -4: CRAFT §f.2's far windows). */
export function markTone(color: string, plane = 0): string {
  const c = lch(color);
  const dL = plane >= 2 ? 4 : 7;
  return fromLch(Math.max(0, c.L - dL), c.C * (plane >= 2 ? 1 : 1.06), c.h);
}

export type MarkKind = 'pair' | 'slot' | 'band' | 'square';
/** One identity mark on a facet (pro_2 §3.1: "a window pair, a roof edge, a stair run, a lamppost ... single flat
 *  shapes"), drawn in the facet's PLANE coordinates and projected like it (a drain on the ground foreshortens):
 *  'pair' two small panes side by side, 'slot' a door or a gap at the facet's foot, 'band' a sill or roof edge
 *  across it, 'square' a hatch or a drain. null when it would fall under the plane's minPx on screen. */
export function markShape(pw: Patchwork, f: Facet, kind: MarkKind = 'pair'): {d: string; color: string} | null {
  const b = bboxOf(f.uv);
  const w = b[2] - b[0];
  const h = b[3] - b[1];
  const cx = (b[0] + b[2]) / 2;
  const cy = (b[1] + b[3]) / 2;
  const s = Math.min(w, h);
  const rects: [number, number, number, number][] = [];
  if (kind === 'pair') {
    const pw2 = s * 0.2;
    const ph = s * 0.3;
    rects.push([cx - pw2 - s * 0.06, cy - ph / 2, pw2, ph], [cx + s * 0.06, cy - ph / 2, pw2, ph]);
  } else if (kind === 'slot') rects.push([cx - s * 0.12, b[1] + h * 0.55, s * 0.24, h * 0.45]);
  else if (kind === 'band') rects.push([b[0], b[1] + h * 0.28, w, Math.max(h * 0.12, 0)]);
  else rects.push([cx - s * 0.2, cy - s * 0.2, s * 0.4, s * 0.4]);
  const polys = rects.map(([x, y, rw, rh]) => [[x, y], [x + rw, y], [x + rw, y + rh], [x, y + rh]] as Pt[]);
  const scr = polys.map((p) => p.map((v) => {
    const [x, y] = pw.project(v);
    return [Math.round(x), Math.round(y)] as Pt;
  }));
  if (scr.some((p) => minWidth(p) < pw.spec.minPx * (kind === 'band' ? 0.25 : 0.5))) return null;
  return {d: scr.map(pathOf).join(''), color: markTone(f.color, pw.spec.plane)};
}

// ================================================================= the lint and the numbers

export type PatchStats = {
  facets: number;
  dropped: number;
  /** Facets per 10,000 px of their area (information: pro_2's "shapes per 10,000 px" (C near 11-25) counts every
   *  segment, the marks and things on the ground included, not just the facets). */
  per10k: number;
  /** The median facet width on screen (along u through its centroid, px): the posters' patches 38-81 px (style.md
   *  §1.3: 3.5-7.5 % W), far planes 6-10 % W; pro_2 §3.1 face side C near 30-75 [49], C far 50-200 [77]. */
  medianW: number;
  /** The median facet depth on screen (along v): on a ground it foreshortens toward the horizon. */
  medianD: number;
  /** The median sqrt(area) (px). */
  medianSide: number;
  /** The smallest min width among the CUT facets (px; an uncut thin part is the mass itself). */
  minW: number;
  /** Neighbour pairs; of those with two different tones, the share inside the plane's range (with PATCH_TOL); the
   *  share over its top (a SPIKE: more contrast than the C tier may have); the share of same-tone pairs (they read
   *  as one bigger facet: odd wheels force a few with four tones). */
  pairs: number;
  inRange: number;
  spikes: number;
  merges: number;
  /** The shown tones' L* span (CRAFT §c: <= 15 in one plane). */
  span: number;
  /** Marks flagged. */
  marks: number;
};

const median = (v: number[]) => {
  const s = v.slice().sort((a, b) => a - b);
  return s.length ? s[Math.floor(s.length / 2)] : 0;
};

export function patchStats(pw: Patchwork): PatchStats {
  const sh = pw.spec.shown;
  const L = pw.tones.map((c) => lab(sh(c))[0]);
  const area = pw.facets.reduce((s, f) => s + f.area, 0);
  let pairs = 0;
  let distinct = 0;
  let inR = 0;
  let spikes = 0;
  let merges = 0;
  pw.adj.forEach((l, i) => l.forEach((j) => {
    if (j <= i) return;
    pairs++;
    const a = pw.facets[i].tone;
    const b = pw.facets[j].tone;
    if (a === b) {
      merges++;
      return;
    }
    distinct++;
    const d = Math.abs(L[a] - L[b]);
    if (d > pw.spec.dL[1] + PATCH_TOL) spikes++;
    else if (pw.tones.length <= 2 || d >= pw.spec.dL[0] - PATCH_TOL) inR++;
  }));
  const cut = pw.facets.filter((f) => !f.whole);
  return {
    facets: pw.facets.length,
    dropped: pw.dropped,
    per10k: r1((pw.facets.length / Math.max(1, area)) * 1e4),
    medianW: r1(median(pw.facets.map((f) => f.wU))),
    medianD: r1(median(pw.facets.map((f) => f.wV))),
    medianSide: r1(median(pw.facets.map((f) => Math.sqrt(f.area)))),
    minW: r1(cut.length ? Math.min(...cut.map((f) => f.minW)) : 0),
    pairs,
    inRange: distinct ? Math.round((1000 * inR) / distinct) / 1000 : 1,
    spikes: distinct ? Math.round((1000 * spikes) / distinct) / 1000 : 0,
    merges: pairs ? Math.round((1000 * merges) / pairs) / 1000 : 0,
    span: r1(Math.max(...L) - Math.min(...L)),
    marks: pw.facets.filter((f) => f.mark).length,
  };
}

/** The patchwork lint (run it in the scene's problems()): [] = OK. Cut facets under the plane's minPx (slivers and
 *  specks), any neighbour step over the plane's range (a spike), steps under it on more than 10 % of the pairs, over
 *  20 % same-tone neighbours (too few tones), the tones' span over 15 L* (CRAFT
 *  §c), anything in the caption band or its float margin (DIRECTION rule 10), anything in an avoid box ("never on the
 *  subject"), and facets far off the plane's size (the median width under half or over twice its cellPx). */
export function patchworkProblems(pw: Patchwork, name = 'patchwork'): string[] {
  const out: string[] = [];
  const s = patchStats(pw);
  const small = pw.facets.filter((f) => !f.whole && f.minW < pw.spec.minPx - 0.5);
  if (small.length) out.push(`${name}: ${small.length} facet(s) under ${pw.spec.minPx} px wide (slivers; the smallest ${s.minW} px)`);
  if (s.spikes > 0) out.push(`${name}: ${Math.round(s.spikes * 1000) / 10} % of neighbour steps over dL* ${pw.spec.dL[1]} (spikes: more contrast than tier C may have; tones closer together)`);
  if (s.inRange < 0.9) out.push(`${name}: ${Math.round((1 - s.inRange) * 100)} % of neighbour steps off dL* ${pw.spec.dL[0]}-${pw.spec.dL[1]} (give tones that fit the range)`);
  if (pw.tones.length > 2 && s.merges > 0.2) out.push(`${name}: ${Math.round(s.merges * 100)} % of neighbours share a tone (they merge: give a fourth tone)`);
  if (s.span > PATCH_SPAN_MAX + PATCH_TOL) out.push(`${name}: the tones span ${s.span} L* (> ${PATCH_SPAN_MAX} in one plane, CRAFT §c)`);
  const b = pw.spec.band;
  if (b) {
    const inBand = pw.facets.filter((f) => f.box[3] >= b[0] - pw.spec.bandMargin && f.box[1] <= b[1] + pw.spec.bandMargin);
    if (inBand.length) out.push(`${name}: ${inBand.length} facet(s) in the caption band y ${b[0]}-${b[1]} (+${pw.spec.bandMargin})`);
  }
  for (const a of pw.spec.avoid) {
    const n = pw.facets.filter((f) => overlaps(f.box, a)).length;
    if (n) out.push(`${name}: ${n} facet(s) in the avoid box [${a.join(', ')}]`);
  }
  const cp = patchStep(pw.spec.plane).cellPx;
  if (s.facets >= 6 && s.medianW < cp * 0.5) out.push(`${name}: median facet width ${s.medianW} px (under half the plane's ${cp}: busier than the hero; a bigger cell)`);
  if (s.facets >= 6 && s.medianW > cp * 2) out.push(`${name}: median facet width ${s.medianW} px (over twice the plane's ${cp}: reads empty; a smaller cell)`);
  return out;
}
