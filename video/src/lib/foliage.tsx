// lib/foliage.tsx: NATURE THAT LOOKS REAL BUT IS STYLISED, an engine primitive (city-poster study 2026-10-28,
// `docs/studies/2026-10-28_city_posters/pro_3_nature.md` §3.0-3.1; STUDY.md §3 and §10 item 8). The owner: "the
// "nature" objects are very subtle and they are visually very interesting like they are obviously very real, but if
// you look closely we combine the real effects with the lower poly kind of effects". Measured on the posters, that is:
// REAL at the silhouette (the species' own leaves), in the material (bark plates) and in the light (one key, the crown
// lit as one mass, darkest at its core); LOW POLY where the light turns (flat facets inside, a leaf folded on its veins).
//
//   <Crown spec={PLANE} wind={WIND} />        one species tree: limbs, trunk with its bark, 3-12 leaf clusters
//   <LeafSpray spec={SPRAY} wind={WIND} />    a near branch of the species' own leaves, each folded on its veins
//   foliageProblems({crowns: [crownGeometry(PLANE)], sprays: [sprayGeometry(SPRAY)]})   // [] = OK
//
// HOW A CROWN IS BUILT (once per spec, cached: the wind only moves it by transforms, never rebuilds a path: no boil):
//   1. the species' envelope (the London plane's broad, irregular dome) holds N clusters, each a jittered low-poly
//      ellipsoid (an icosphere) in screen-aligned 3D (x right, y down, z toward the viewer), drawn back to front;
//   2. each facet takes ONE tone from its normal against the key (wrap Lambert + the sky's fill), its normal blended
//      with the crown envelope's (the game artists' "foliage normals": the crown reads as ONE lit mass) and darkened by
//      its depth in the crown (the core is the darkest natural tone: rule 6's "the shade under trees");
//   3. the tones are the plane's ladder (near: core / shade / mid / lit / hi, L* 36 / 45 / 53 / 61 / 70), split at the
//      crown's own value quantiles, so its mean lands on the ladder's target whatever the light; hi only on the top
//      clusters (Gurney: lightest at the outer and upper edges);
//   4. the silhouette is LEAVES: species leaves (near), leaf bumps (mid) or the bare facets (far, >= 40 % straight)
//      along every cluster's outline, each rim leaf folded on its midrib (two facets, two tones); a few turn gold or
//      rust in October; 2-4 sky holes near the thin edge (a step under the open sky);
//   5. a trunk and limbs as tapered closed paths, the shade side away from the key, the bark's plates as same-hue
//      patches (the London plane's camouflage: N5 b), the crown's own shade across the trunk's top.
// Every shape is one closed path and a flat fill (no outline, no gradient, no blur); a layer is the union of the
// shapes at one tone and lighter (painted dark -> light), so neighbouring facets never leave an antialiasing seam.
// Thin parts (limbs, twigs, stalks, veins) are >= 2 px: under the parallax float anything thinner twinkles (CRAFT §c).
//
// Colour: the tones are FINAL (the nature ladder sets them per plane: N1); `exact` (default) keeps an enclosing clean-pen
// tier from pulling them again (pass exact={false} to let a Tier scope calm them). A mid or far tree steps toward its
// plane's air through lib/depth's `recede` when given the set's Atmosphere. Libraries: none needed beyond the project's
// own (the note: docs/studies/2026-10-28_city_posters/test/ENGINE_NATURE.md §2).

import React from 'react';
import {Fill} from './Fill';
import {Tier} from './tier';
import {useTime} from './time';
import {fromLch, lch} from './light';
import {recede, type Atmosphere} from './depth';
import {rng, type Rng} from './rng';
import {neverBand} from './water';
import {clusterShift, crownDeg, leafFlutter, STILL_WIND, type Wind} from './wind';

export type Pt = [number, number];
export type V3 = [number, number, number];

// ================================================================= small maths

const clamp = (v: number, lo: number, hi: number) => (v < lo ? lo : v > hi ? hi : v);
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const smooth = (e0: number, e1: number, v: number) => {
  const k = clamp((v - e0) / (e1 - e0), 0, 1);
  return k * k * (3 - 2 * k);
};
const add3 = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const sub3 = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const mul3 = (a: V3, k: number): V3 => [a[0] * k, a[1] * k, a[2] * k];
const dot3 = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross3 = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const norm3 = (a: V3): V3 => {
  const l = Math.hypot(a[0], a[1], a[2]) || 1;
  return [a[0] / l, a[1] / l, a[2] / l];
};
const rad = (d: number) => (d * Math.PI) / 180;
const r1 = (n: number) => Math.round(n * 10) / 10;

/** Signed area (screen coords, y down: > 0 = clockwise on screen). */
function area2(p: Pt[]): number {
  let a = 0;
  for (let i = 0; i < p.length; i++) {
    const q = p[i];
    const s = p[(i + 1) % p.length];
    a += q[0] * s[1] - s[0] * q[1];
  }
  return a / 2;
}
/** One winding for every polygon of a layer (nonzero fill: overlapping shapes never cancel into holes). */
const orient = (p: Pt[]): Pt[] => (area2(p) < 0 ? p.slice().reverse() : p);
/** A closed polygon as a path (0.1 px). */
export const polyD = (p: Pt[]): string => (p.length < 3 ? '' : 'M' + orient(p).map(([x, y]) => `${r1(x)} ${r1(y)}`).join('L') + 'Z');
function centroid(p: Pt[]): Pt {
  let x = 0;
  let y = 0;
  for (const q of p) {
    x += q[0];
    y += q[1];
  }
  return [x / Math.max(1, p.length), y / Math.max(1, p.length)];
}
/** Convex hull (Andrew's monotone chain). */
function convexHull(pts: Pt[]): Pt[] {
  const p = pts.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  if (p.length < 3) return p;
  const cr = (o: Pt, a: Pt, b: Pt) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lo: Pt[] = [];
  for (const q of p) {
    while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop();
    lo.push(q);
  }
  const up: Pt[] = [];
  for (let i = p.length - 1; i >= 0; i--) {
    const q = p[i];
    while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], q) <= 0) up.pop();
    up.push(q);
  }
  return lo.slice(0, -1).concat(up.slice(0, -1));
}
/** Point inside a convex polygon (either winding). */
function inConvex(poly: Pt[], q: Pt): boolean {
  let sign = 0;
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i];
    const b = poly[(i + 1) % poly.length];
    const c = (b[0] - a[0]) * (q[1] - a[1]) - (b[1] - a[1]) * (q[0] - a[0]);
    if (c !== 0) {
      if (sign === 0) sign = Math.sign(c);
      else if (Math.sign(c) !== sign) return false;
    }
  }
  return true;
}
/** A convex polygon moved `d` px toward its centroid (an inset; negative = outset). */
function insetConvex(poly: Pt[], d: number): Pt[] {
  const c = centroid(poly);
  return poly.map(([x, y]) => {
    const l = Math.hypot(x - c[0], y - c[1]) || 1;
    return [x - ((x - c[0]) / l) * d, y - ((y - c[1]) / l) * d] as Pt;
  });
}
/** Points along a closed polygon every `step` px, each with the outward normal of its edge. */
function alongClosed(poly: Pt[], step: number, offset = 0): {p: Pt; n: Pt}[] {
  const out: {p: Pt; n: Pt}[] = [];
  const cw = area2(poly) > 0;
  let carry = offset;
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i];
    const b = poly[(i + 1) % poly.length];
    const L = Math.hypot(b[0] - a[0], b[1] - a[1]);
    if (L < 1e-6) continue;
    const ux = (b[0] - a[0]) / L;
    const uy = (b[1] - a[1]) / L;
    // outward normal: for a clockwise (screen) ring the outside is on the left of travel
    const n: Pt = cw ? [uy, -ux] : [-uy, ux];
    let s = carry;
    while (s < L) {
      out.push({p: [a[0] + ux * s, a[1] + uy * s], n});
      s += step;
    }
    carry = s - L;
  }
  return out;
}
/** A smooth open curve through points (Catmull-Rom), sampled at about `step` px. */
function smoothOpen(pts: Pt[], step = 8): Pt[] {
  if (pts.length < 2) return pts.slice();
  const out: Pt[] = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    const L = Math.hypot(p2[0] - p1[0], p2[1] - p1[1]);
    const n = Math.max(2, Math.ceil(L / step));
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
/** Cumulative arc length of a polyline (0 .. 1). */
function arcParams(line: Pt[]): number[] {
  const s = [0];
  for (let i = 1; i < line.length; i++) s.push(s[i - 1] + Math.hypot(line[i][0] - line[i - 1][0], line[i][1] - line[i - 1][1]));
  const L = s[s.length - 1] || 1;
  return s.map((v) => v / L);
}
/** The point and unit tangent at u (0 .. 1) along a polyline. */
function atU(line: Pt[], us: number[], u: number): {p: Pt; t: Pt} {
  const v = clamp(u, 0, 1);
  let i = 1;
  while (i < us.length - 1 && us[i] < v) i++;
  const a = line[i - 1];
  const b = line[i];
  const k = us[i] > us[i - 1] ? (v - us[i - 1]) / (us[i] - us[i - 1]) : 0;
  const L = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
  return {p: [lerp(a[0], b[0], k), lerp(a[1], b[1], k)], t: [(b[0] - a[0]) / L, (b[1] - a[1]) / L]};
}
/** Concatenate lists (Array.prototype.flat is ES2019; the project's lib is ES2015). */
const cat = <T,>(lists: T[][]): T[] => ([] as T[]).concat(...lists);
/** Which side of a line faces the light: +1 = the ribbon's u > 0 side (its right-hand normal, screen y down). */
function litSide(line: Pt[], L2: Pt): 1 | -1 {
  const a = line[0];
  const b = line[line.length - 1];
  const l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
  return (-(b[1] - a[1]) / l) * L2[0] + ((b[0] - a[0]) / l) * L2[1] >= 0 ? 1 : -1;
}
/** The lit band of a ribbon (55 % of its width on the light's side) and its shade band (the other 35 %). */
const litBandOf = (side: 1 | -1, k = 0.1): [number, number] => (side > 0 ? [-k, 1] : [-1, k]);
const shadeBandOf = (side: 1 | -1, k = 0.3): [number, number] => (side > 0 ? [-1, -k] : [k, 1]);
const polyLength = (line: Pt[]) => {
  let s = 0;
  for (let i = 1; i < line.length; i++) s += Math.hypot(line[i][0] - line[i - 1][0], line[i][1] - line[i - 1][1]);
  return s;
};

/** A tapered ribbon along a centreline: the band between `u0` and `u1` across it (-1 = the left edge, +1 = the right
 *  edge, seen along the line), widths from w0 at the start to w1 at the end (a closed polygon). */
function ribbon(line: Pt[], w: (s: number) => number, u0 = -1, u1 = 1): Pt[] {
  const us = arcParams(line);
  const L: Pt[] = [];
  const R: Pt[] = [];
  for (let i = 0; i < line.length; i++) {
    const a = line[Math.max(0, i - 1)];
    const b = line[Math.min(line.length - 1, i + 1)];
    const l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
    const nx = -(b[1] - a[1]) / l; // the line's right-hand normal (screen: y down)
    const ny = (b[0] - a[0]) / l;
    const hw = w(us[i]) / 2;
    L.push([line[i][0] - nx * hw * -u0, line[i][1] - ny * hw * -u0]);
    R.push([line[i][0] + nx * hw * u1, line[i][1] + ny * hw * u1]);
  }
  return L.concat(R.reverse());
}

// ================================================================= the light (ONE key for all nature: N3)

/** The key toward which every facet turns: a 3D unit vector toward the light (screen-aligned: x right, y down, z toward
 *  the viewer), a lib/light sun (`{kind: 'sun', toward, el}`), a rig (`{key}`), or `{from, el}` (the screen direction
 *  the light comes from, its elevation). */
export type LightInput = V3 | {kind: 'sun'; toward: number; el: number} | {kind: 'sky'; from?: number} | {from: number; el?: number} | {key: unknown};

/** A sun's direction in screen-aligned 3D: `toward` = where its shadows fall on the ground (lib/light: 0 right, 90
 *  toward us, 180 left, 270 away), `el` its elevation. */
export const sunVector = (toward: number, el: number): V3 => norm3([-Math.cos(rad(toward)) * Math.cos(rad(el)), -Math.sin(rad(el)), -Math.sin(rad(toward)) * Math.cos(rad(el))]);

/** The 3D unit vector toward the light. A lamp (a point light) is not a direction: pass its vector at the tree. */
export function lightVec(l: LightInput): V3 {
  if (Array.isArray(l)) return norm3(l as V3);
  const o = l as Record<string, unknown>;
  if (o.key) return lightVec(o.key as LightInput);
  if (o.kind === 'sun') return sunVector(o.toward as number, o.el as number);
  if (o.kind === 'sky') {
    const f = rad((o.from as number) ?? 250);
    return norm3([Math.cos(f) * 0.55, Math.min(-0.6, Math.sin(f)), 0.3]);
  }
  if (typeof o.from === 'number') return sunVector(((o.from as number) + 180) % 360, (o.el as number) ?? 40);
  return norm3([-0.6, -0.7, 0.2]);
}

// ================================================================= colour: the nature ladder (N1, N4, N6)

/** The near ladder (pro_3 §3.1): core / shade / mid / lit / hi, L*. Mean ~52 at the default shares. */
export const LADDER_NEAR = [36, 45, 53, 61, 70] as const;
/** The mid ladder (3-4 tones, mean 45-60). */
export const LADDER_MID = [42, 50, 58, 66] as const;
/** The far ladder (2-3 tones in 4-6 L* steps), before the plane's air step. */
export const LADDER_FAR = [50, 55.5, 61] as const;
/** The tones' area shares (dark -> light) the quantiles split at, per mode. */
export const TONE_SHARES = {near: [0.14, 0.26, 0.26, 0.24, 0.1], mid: [0.2, 0.32, 0.31, 0.17], far: [0.3, 0.42, 0.28]} as const;

export type Mode = 'near' | 'mid' | 'far';
/** The realism ladder by plane (N1): near (<= -1) species leaves, mid (0 ... +2) leaf bumps, far (+3, +4) facets. */
export const modeOf = (plane: number): Mode => (plane <= -0.5 ? 'near' : plane < 2.5 ? 'mid' : 'far');

/** A tree's greens, dark -> light, from one green (default v2 Canal Mint's leaf sage #AFC4A8): its hue turns cooler
 *  toward the core (shaded leaves facing up go blue-green: Gurney) and warmer toward the light, never into the olive
 *  band (CIE h 95-118; a lit tone stops at h 122), chroma rising toward the light (C* 13 -> 24 at sage's C* 17). */
export function foliageTones(o: {green?: string; L?: readonly number[]; chroma?: number; hueTurn?: number} = {}): string[] {
  const g = lch(o.green ?? '#AFC4A8');
  const L = o.L ?? LADDER_NEAR;
  const n = L.length;
  const turn = o.hueTurn ?? 46;
  const cK = (o.chroma ?? g.C) / 17;
  return L.map((l, i) => {
    const u = n > 1 ? i / (n - 1) : 0.5;
    const h = clamp(g.h - 8 + turn * (1 - u), 122, 192);
    return fromLch(l, (13 + 11 * u) * cK, h);
  });
}

/** October: a rim leaf turned, at its tone's value (+6 L*): gold (CM.leafGold's hue) or rust (CM.leafRust's). */
export function autumnTone(green: string, kind: 'gold' | 'rust'): string {
  const L = lch(green).L;
  return kind === 'gold' ? fromLch(Math.min(80, L + 6), 38, 76) : fromLch(Math.min(76, L + 4), 36, 52);
}

/** A trunk's and its limbs' tones: the lit side, the shade side (one deep flat step: a dark piece), the bark's plates
 *  on each side (same-hue patches, dL* 3-10: N5 b's material inside a facet), the crown's own shade on the trunk. */
export type BarkTones = {lit: string; shade: string; core: string; litPatches: string[]; shadePatches: string[]};

/** The London plane's camouflage bark in warm terms (never beige, olive or grey: DIRECTION rule 6): a warm mushroom lit
 *  side, a plum-brown shade, peach-cream, rose and soft sage plates. */
export function barkTones(o: {lit?: string; shade?: string} = {}): BarkTones {
  const lit = o.lit ?? fromLch(63, 11, 45);
  const shade = o.shade ?? fromLch(41, 9, 18);
  const l = lch(lit);
  const s = lch(shade);
  return {
    lit,
    shade,
    core: fromLch(s.L - 5, s.C * 0.9, s.h + 6),
    litPatches: [fromLch(l.L + 10, 15, 48), fromLch(l.L - 5, 11, 30), fromLch(l.L - 4, 8, 150)],
    shadePatches: [fromLch(s.L - 4, 8, 25), fromLch(s.L + 4, 9, 8)],
  };
}

// ================================================================= the species (drawn once by hand: N6)

/** A leaf template: a closed outline in leaf units (the blade's base at (0, 0), its main tip at (0, -1), x to the leaf's
 *  right), and the fan of facets it folds into: `rays` (outline indices, in order) split it into facets from the base;
 *  `veins` are the rays that are vein tips (each facet tilts toward its vein: a valley fold, N2's "a leaf folded on its
 *  midrib"). */
export type LeafTemplate = {
  pts: Pt[];
  rays: number[];
  veins: number[];
  /** The veins drawn on a near leaf (outline indices): the midrib's tip first, then the two lateral lobes' tips. */
  main?: number[];
};

function mirrorLeaf(right: Pt[], rayAt: number[], veinAt: number[]): LeafTemplate {
  // right: the right half from the base corner (near the stalk) UP to the main tip (last point)
  const tip = right.length - 1;
  const left = right.slice(0, -1).reverse().map(([x, y]) => [-x, y] as Pt);
  const pts: Pt[] = [[0, 0.02], ...right, ...left];
  const leftIndex = (i: number) => 1 + tip + (tip - i); // a right-half index mirrored
  const rays = [...rayAt.map((i) => 1 + i), ...rayAt.slice(0, -1).reverse().map(leftIndex)];
  const veins = [...veinAt.map((i) => 1 + i), ...veinAt.filter((i) => i !== tip).map(leftIndex)];
  // the midrib, then the lobes next to it (the vein tips just below the main tip)
  const sideVeins = veinAt.filter((i) => i !== tip);
  const lat = sideVeins.length ? sideVeins[sideVeins.length - 1] : -1;
  const main = lat >= 0 ? [1 + tip, 1 + lat, leftIndex(lat)] : [1 + tip];
  return {pts, rays, veins, main};
}

/** The London plane's leaf, near (pro_3 §3.1 "the species' own leaves at the edge"): five lobes (three big, two small
 *  basal), shallow sinuses, a few big teeth, a truncate base. Rays: basal tip, sinus, lateral tip, sinus, main tip. */
export const PLANE_LEAF: LeafTemplate = mirrorLeaf(
  [
    [0.08, 0.0], [0.22, 0.02], [0.36, -0.01], [0.5, -0.07], [0.6, -0.14], // 4: the basal tip
    [0.56, -0.23], [0.5, -0.31], // 6: sinus 2
    [0.55, -0.4], [0.6, -0.47], [0.57, -0.52], [0.62, -0.62], [0.64, -0.75], // 11: the lateral tip
    [0.52, -0.69], [0.45, -0.7], [0.43, -0.635], [0.36, -0.58], [0.25, -0.5], // 16: sinus 1
    [0.2, -0.6], [0.135, -0.73], [0.14, -0.8], [0.085, -0.84], [0, -1], // 21: the main tip
  ],
  [4, 6, 11, 16, 21],
  [4, 11, 21],
);

/** The crown's rim leaf: the same five lobes, no teeth (24-36 px: a tooth would be a 2 px speck), folded on its midrib. */
export const PLANE_RIM_LEAF: LeafTemplate = mirrorLeaf(
  [[0.1, 0.0], [0.34, -0.01], [0.6, -0.14], [0.5, -0.31], [0.66, -0.74], [0.25, -0.5], [0, -1]],
  [6],
  [6],
);

/** A mid crown's leaf bump (12-16 px): a three-lobed scallop, one facet. */
export const BUMP_LEAF: LeafTemplate = {pts: [[0, 0.05], [0.5, -0.1], [0.62, -0.55], [0.3, -0.62], [0, -1], [-0.3, -0.62], [-0.62, -0.55], [-0.5, -0.1]], rays: [], veins: []};

export type Species = {
  name: string;
  /** The default green (the ladder's hue and chroma). */
  green: string;
  leaf: LeafTemplate;
  rimLeaf: LeafTemplate;
  bumpLeaf: LeafTemplate;
  /** Crown width / tree height. */
  aspect: number;
  /** The clear trunk: where the crown's envelope starts, a share of the height from the foot. */
  clear: number;
  /** Trunk width at the foot / tree height. */
  trunk: number;
  /** Clusters by mode [min, max] and their radius as a share of the crown's mean radius. */
  clusters: Record<Mode, [number, number]>;
  clusterR: Record<Mode, [number, number]>;
  /** How irregular the envelope is (radial noise amplitude) and how flat its base (0 round .. 0.5 flat). */
  irregular: number;
  flatBase: number;
  /** Rim leaf length (base to tip) as a share of the crown's mean radius, near / mid; clamped to px ranges. */
  leafK: {near: number; mid: number};
  leafPx: {near: [number, number]; mid: [number, number]};
  /** Main limbs from the fork. */
  limbs: [number, number];
  /** Share of rim leaves turned in October (0 in summer). */
  autumn: number;
};

/** London plane (Platanus x hispanica), the canal's tree: a broad, irregular dome on a clear trunk, big billowing
 *  masses with open gaps, pale sinuous limbs, camouflage bark, palmate leaves; in late October still green with a few
 *  gold and rust leaves (S1's falling leaves are its own). */
export const LONDON_PLANE: Species = {
  name: 'London plane',
  green: '#AFC4A8',
  leaf: PLANE_LEAF,
  rimLeaf: PLANE_RIM_LEAF,
  bumpLeaf: BUMP_LEAF,
  aspect: 0.78,
  clear: 0.36,
  trunk: 0.05,
  clusters: {near: [9, 12], mid: [5, 7], far: [1, 2]},
  clusterR: {near: [0.27, 0.42], mid: [0.32, 0.46], far: [0.6, 0.8]},
  irregular: 0.13,
  flatBase: 0.3,
  leafK: {near: 0.1, mid: 0.075},
  leafPx: {near: [22, 38], mid: [10, 18]},
  limbs: [3, 4],
  autumn: 0.07,
};

// ================================================================= the low-poly cluster (an icosphere)

type Mesh = {v: V3[]; f: [number, number, number][]};
const MESH = new Map<number, Mesh>();
function icosphere(level: 0 | 1): Mesh {
  const hit = MESH.get(level);
  if (hit) return hit;
  const t = (1 + Math.sqrt(5)) / 2;
  let v: V3[] = [[-1, t, 0], [1, t, 0], [-1, -t, 0], [1, -t, 0], [0, -1, t], [0, 1, t], [0, -1, -t], [0, 1, -t], [t, 0, -1], [t, 0, 1], [-t, 0, -1], [-t, 0, 1]].map((p) => norm3(p as V3));
  let f: [number, number, number][] = [
    [0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11], [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8],
    [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9], [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1],
  ];
  for (let l = 0; l < level; l++) {
    const cache = new Map<string, number>();
    const mid = (a: number, b: number) => {
      const k = a < b ? `${a}_${b}` : `${b}_${a}`;
      const hit2 = cache.get(k);
      if (hit2 !== undefined) return hit2;
      v.push(norm3(mul3(add3(v[a], v[b]), 0.5)));
      cache.set(k, v.length - 1);
      return v.length - 1;
    };
    const nf: [number, number, number][] = [];
    for (const [a, b, c] of f) {
      const ab = mid(a, b);
      const bc = mid(b, c);
      const ca = mid(c, a);
      nf.push([a, ab, ca], [b, bc, ab], [c, ca, bc], [ab, bc, ca]);
    }
    f = nf;
    v = v.slice();
  }
  const m = {v, f};
  MESH.set(level, m);
  return m;
}
/** A rotation matrix from three seeded angles (rows). */
function rotation(r: Rng): [V3, V3, V3] {
  const a = r.range(0, Math.PI * 2);
  const b = r.range(-0.6, 0.6);
  const c = r.range(0, Math.PI * 2);
  const ca = Math.cos(a), sa = Math.sin(a), cb = Math.cos(b), sb = Math.sin(b), cc = Math.cos(c), sc = Math.sin(c);
  return [
    [ca * cc - sa * cb * sc, -ca * sc - sa * cb * cc, sa * sb],
    [sa * cc + ca * cb * sc, -sa * sc + ca * cb * cc, -ca * sb],
    [sb * sc, sb * cc, cb],
  ];
}
const rot = (m: [V3, V3, V3], p: V3): V3 => [dot3(m[0], p), dot3(m[1], p), dot3(m[2], p)];

// ================================================================= the crown

export type CrownSpec = {
  /** Every random choice comes from it (lib/rng): one seed, one tree, every frame the same. */
  seed: string;
  species?: Species;
  /** The trunk's foot on screen (canvas px at camera rest). */
  base: Pt;
  /** Foot to the crown's top (px). */
  height: number;
  /** The crown's width (px). Default height x species.aspect. */
  width?: number;
  /** The plane (lib/depth): near <= -1 (species leaves), mid 0 ... +2 (leaf bumps), far +3, +4 (facets). Default -1. */
  plane?: number;
  /** THE key (one light for all nature: N3): lib/light's rig or sun, or a 3D vector toward the light. */
  light: LightInput;
  /** The greens, dark -> light (default foliageTones(species.green) on the plane's ladder). */
  tones?: string[];
  bark?: BarkTones;
  /** The set's atmosphere (lib/depth): a mid or far tree takes its plane's step toward the air. */
  atm?: Atmosphere;
  /** Sky holes: the colour of the sky a step down behind the crown (2-4 holes near the thin edge), or false (none:
   *  the crown is not against the sky). Default false. */
  holes?: string | false;
  /** October: the share of rim leaves turned gold or rust (default species.autumn). */
  autumn?: number;
  /** Override the cluster count. */
  clusters?: number;
  /** Rim leaf length (px, base to tip). Default by plane from the crown's size. */
  leafSize?: number;
  /** The whole tree's lean (deg, + = clockwise). */
  lean?: number;
  /** Trunk width at the foot (px). Default height x species.trunk. */
  trunkWidth?: number;
  /** The trunk's bark plates (default true on near and mid planes). */
  patches?: boolean;
};

/** One painted layer: a path and its flat colour. */
export type Layer = {d: string; color: string};
export type ClusterGeom = {id: number; c: Pt; z: number; layers: Layer[]};
export type CrownStats = {
  mode: Mode;
  tones: string[];
  /** Area share per tone index over the visible facets and leaves (approx.: occlusion between clusters ignored). */
  share: number[];
  meanL: number;
  /** The crown's light vector (lightest 20 % of its painted area minus the darkest 20 %): screen deg (0 right, 90 up)
   *  and strength (over the radius of gyration), as pro_3_nature.py measures it; and the key's 2D direction. */
  lightDeg: number;
  lightK: number;
  keyDeg: number;
  clusters: number;
  leaves: number;
  holesShare: number;
  /** The thinnest drawn width of any limb (px). */
  minWidth: number;
};
export type CrownGeom = {
  spec: CrownSpec;
  /** The trunk's foot: the crown rotates about it (main bending). */
  pivot: Pt;
  /** The crown envelope's centre and radii (screen px). */
  centre: Pt;
  radii: [number, number];
  /** Clusters behind the limbs, then the trunk and limbs, then the clusters in front (back to front). */
  back: ClusterGeom[];
  wood: Layer[];
  front: ClusterGeom[];
  /** [x0, y0, x1, y1] at rest. */
  bbox: [number, number, number, number];
  stats: CrownStats;
};

type Shaded = {poly: Pt[]; v: number; area: number; cluster: number; hiOK: boolean; autumn?: 'gold' | 'rust'; kind: 'facet' | 'leaf' | 'half'; leaf?: number};

/** Wrap Lambert + the sky's fill: how lit a normal is (0 .. 1) under key L. */
function lambert(n: V3, L: V3, wrap = 0.35): number {
  const d = Math.max(0, (dot3(n, L) + wrap) / (1 + wrap));
  const sky = 0.5 * (1 - n[1]);
  return 0.8 * d + 0.2 * sky;
}

/** Weighted quantile thresholds splitting `vals` into the given area shares (dark -> light). */
function thresholds(vals: {v: number; w: number}[], shares: readonly number[]): number[] {
  const s = vals.slice().sort((a, b) => a.v - b.v);
  const tot = s.reduce((acc, q) => acc + q.w, 0) || 1;
  const out: number[] = [];
  let cum = 0;
  let k = 0;
  let target = shares[0];
  for (const q of s) {
    cum += q.w / tot;
    while (k < shares.length - 1 && cum >= target) {
      out.push(q.v);
      k++;
      target += shares[k];
    }
  }
  while (out.length < shares.length - 1) out.push(Infinity);
  return out;
}
const toneIndex = (v: number, th: number[]) => {
  let k = 0;
  while (k < th.length && v >= th[k]) k++;
  return k;
};

/** Level-set layers: for each tone k (dark -> light) the union of the shapes at tone >= k (the first layer is the
 *  `base` silhouette), so a lighter shape always sits on a darker one: no antialiasing seam between facets. */
function levelLayers(items: {poly: Pt[]; k: number}[], tones: string[], base?: Pt[][]): Layer[] {
  if (!items.length) return [];
  const ks = items.map((q) => q.k);
  const k0 = Math.min(...ks);
  const k1 = Math.max(...ks);
  const out: Layer[] = [];
  for (let k = k0; k <= k1; k++) {
    const polys = k === k0 && base ? base : items.filter((q) => q.k >= k).map((q) => q.poly);
    const d = polys.map(polyD).join('');
    if (d) out.push({d, color: tones[k]});
  }
  return out;
}

/** A leaf placed in screen-aligned 3D: base point, length, axis a, side s, normal n (all unit). */
type LeafPose = {base: Pt; len: number; a: V3; s: V3; n: V3};
function leafPose(base: Pt, len: number, deg: number, roll: number, pitch: number, mirror: boolean): LeafPose {
  const t = rad(deg);
  const a0: V3 = [Math.cos(t), Math.sin(t), 0];
  const s0: V3 = [-Math.sin(t), Math.cos(t), 0];
  const n0: V3 = [0, 0, 1];
  const cr = Math.cos(rad(roll));
  const sr = Math.sin(rad(roll));
  const s1 = norm3(add3(mul3(s0, cr), mul3(n0, sr)));
  const n1 = norm3(sub3(mul3(n0, cr), mul3(s0, sr)));
  const cp = Math.cos(rad(pitch));
  const sp = Math.sin(rad(pitch));
  const a2 = norm3(add3(mul3(a0, cp), mul3(n1, sp)));
  const n2 = norm3(sub3(mul3(n1, cp), mul3(a0, sp)));
  return {base, len, a: a2, s: mirror ? mul3(s1, -1) : s1, n: n2};
}
/** A template point on screen. */
const leafPt = (q: LeafPose, x: number, y: number): Pt => [q.base[0] + q.len * (x * q.s[0] - y * q.a[0]), q.base[1] + q.len * (x * q.s[1] - y * q.a[1])];
const leafPts = (q: LeafPose, tpl: LeafTemplate): Pt[] => tpl.pts.map(([x, y]) => leafPt(q, x, y));

/** The leaf's facets (the fan between its rays) with each facet's folded normal: tilted `fold` deg toward its vein. */
function leafFacets(q: LeafPose, tpl: LeafTemplate, fold: number): {poly: Pt[]; n: V3}[] {
  const P = leafPts(q, tpl);
  if (!tpl.rays.length) return [{poly: P, n: q.n}];
  const B = P[0];
  const cuts = [0, ...tpl.rays, P.length];
  const out: {poly: Pt[]; n: V3}[] = [];
  for (let j = 0; j < cuts.length - 1; j++) {
    const i0 = cuts[j];
    const i1 = cuts[j + 1];
    const ring: Pt[] = [B];
    for (let i = Math.max(1, i0); i <= Math.min(P.length - 1, i1); i++) ring.push(P[i]);
    if (i1 === P.length) ring.push(P[0]);
    // its vein: the vein-tip ray at either end (the stalk side for the base wedges)
    const vi = tpl.veins.indexOf(i0) >= 0 ? i0 : tpl.veins.indexOf(i1) >= 0 ? i1 : -1;
    let n = q.n;
    if (vi >= 0) {
      const tip = tpl.pts[vi];
      const vl = Math.hypot(tip[0], tip[1]) || 1;
      const v: Pt = [tip[0] / vl, tip[1] / vl];
      // the facet's side of its vein, in the template (exact, whatever the pose)
      const tc = centroid(tpl.pts.slice(Math.max(1, i0), Math.min(tpl.pts.length, i1 + 1)));
      const along = tc[0] * v[0] + tc[1] * v[1];
      let qx = tc[0] - v[0] * along;
      let qy = tc[1] - v[1] * along;
      const ql = Math.hypot(qx, qy) || 1;
      qx /= ql;
      qy /= ql;
      // the facet's side in 3D (template x -> s, template y -> -a); a valley fold tilts its normal toward the vein
      const Q = norm3(sub3(mul3(q.s, qx), mul3(q.a, qy)));
      n = norm3(sub3(mul3(q.n, Math.cos(rad(fold))), mul3(Q, Math.sin(rad(fold)))));
      if (n[2] < 0 && q.n[2] > 0) n = q.n;
    }
    if (ring.length >= 3) out.push({poly: ring, n});
  }
  return out;
}

const KEY_CACHE = new Map<string, CrownGeom>();
function specKey(s: object): string {
  return JSON.stringify(s, (k, v) => (typeof v === 'function' ? undefined : k === 'atm' && v ? (v as Atmosphere).name + JSON.stringify((v as Atmosphere).steps) + (v as Atmosphere).air(1) + (v as Atmosphere).air(4) : v));
}

/** The plane's tones: the given ones, or the ladder on the species green; a mid or far tree steps toward its air. */
function planeTones(spec: {tones?: string[]; species?: Species; plane?: number; atm?: Atmosphere}, mode: Mode): string[] {
  const sp = spec.species ?? LONDON_PLANE;
  const base = spec.tones ?? foliageTones({green: sp.green, L: mode === 'near' ? LADDER_NEAR : mode === 'mid' ? LADDER_MID : LADDER_FAR});
  const plane = spec.plane ?? -1;
  return spec.atm && plane > 0 ? base.map((c) => recede(c, plane, spec.atm as Atmosphere)) : base;
}

/** The crown, built once per spec (cached by its content): clusters, rim leaves, holes, trunk and limbs, all paths. */
export function crownGeometry(spec: CrownSpec): CrownGeom {
  const key = specKey(spec);
  const hit = KEY_CACHE.get(key);
  if (hit) return hit;
  const g = buildCrown(spec);
  if (KEY_CACHE.size > 64) KEY_CACHE.clear();
  KEY_CACHE.set(key, g);
  return g;
}

function buildCrown(spec: CrownSpec): CrownGeom {
  const sp = spec.species ?? LONDON_PLANE;
  const plane = spec.plane ?? -1;
  const mode = modeOf(plane);
  const R = rng(`crown/${spec.seed}`);
  const L = lightVec(spec.light);
  const L2n = Math.hypot(L[0], L[1]) || 1;
  const L2: Pt = [L[0] / L2n, L[1] / L2n];
  const tones = planeTones(spec, mode);
  const shares = TONE_SHARES[mode].slice(0, tones.length);
  const bark = spec.bark ?? barkTones();
  const recedeC = (c: string) => (spec.atm && plane > 0 ? recede(c, plane, spec.atm) : c);

  const H = spec.height;
  const W = spec.width ?? H * sp.aspect;
  const lean = spec.lean ?? 0;
  const foot = spec.base;
  const top = foot[1] - H;
  const bottom = foot[1] - H * sp.clear;
  const Rx = W / 2;
  const Ry = (bottom - top) / 2;
  const Rz = Rx * 0.85;
  const leanDx = Math.tan(rad(lean)) * (foot[1] - (top + Ry));
  const C: V3 = [foot[0] + leanDx, top + Ry, 0];
  const Rm = (Rx + Ry) / 2;

  // ---- the envelope: an ellipsoid, irregular (low-frequency radial noise), its base flattened
  const lobes = [R.range(0, 6.28), R.range(0, 6.28), R.range(0, 6.28)];
  const envR = (d: V3) => {
    const th = Math.atan2(d[1], d[0]);
    const ph = Math.atan2(d[2], Math.hypot(d[0], d[1]));
    return 1 + sp.irregular * (0.6 * Math.sin(2 * th + lobes[0]) + 0.3 * Math.sin(3 * th + lobes[1] + ph) + 0.25 * Math.sin(5 * th + lobes[2]));
  };
  const envNormal = (p: V3): V3 => norm3([(p[0] - C[0]) / (Rx * Rx), (p[1] - C[1]) / (Ry * Ry), (p[2] - C[2]) / (Rz * Rz)]);
  const envDepth = (p: V3) => Math.hypot((p[0] - C[0]) / Rx, (p[1] - C[1]) / Ry, (p[2] - C[2]) / Rz);

  // ---- the clusters: centres just inside the envelope's surface, more on the front half (a golden spiral)
  const [nMin, nMax] = sp.clusters[mode];
  const n = Math.max(1, spec.clusters ?? R.int(nMin, nMax));
  const [rMin, rMax] = sp.clusterR[mode];
  type Cl = {id: number; c: V3; r: V3; m: [V3, V3, V3]; seed: Rng};
  const cls: Cl[] = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i++) {
    let c: V3;
    let rr: number;
    if (mode === 'far' || n === 1) {
      rr = Rm * R.range(rMin, rMax);
      c = [C[0] + R.jitter(Rx * 0.15), C[1] + R.jitter(Ry * 0.1), 0];
    } else {
      // directions over the sphere, z from -0.35 (a few behind) to 1 (front), the base kept flat
      const zz = lerp(-0.35, 0.95, (i + 0.5) / n);
      const rho = Math.sqrt(Math.max(0, 1 - zz * zz));
      const th = i * golden + R.range(-0.25, 0.25);
      let d: V3 = [rho * Math.cos(th), rho * Math.sin(th) * 0.95, zz];
      d = norm3(d);
      rr = Rm * R.range(rMin, rMax);
      const e = envR(d);
      const surf: V3 = [C[0] + d[0] * Rx * e, C[1] + d[1] * Ry * e, C[2] + d[2] * Rz * e];
      const inward = envNormal(surf);
      c = sub3(surf, mul3(inward, rr * 0.62));
      const flatY = C[1] + Ry * (1 - sp.flatBase) - rr * 0.4;
      if (c[1] > flatY) c[1] = flatY;
    }
    cls.push({id: i, c, r: [rr, rr * R.range(0.78, 0.9), rr * R.range(0.85, 0.95)], m: rotation(R), seed: R.fork(`c${i}`)});
  }
  // a filler behind the middle (the crown's dark core: no hole shows through the clusters)
  if (mode !== 'far' && n >= 3) cls.push({id: n, c: [C[0], C[1] + Ry * 0.12, -Rz * 0.45], r: [Rx * 0.62, Ry * 0.66, Rz * 0.5], m: rotation(R), seed: R.fork('core')});
  cls.sort((a, b) => a.c[2] - b.c[2]);

  // ---- facets: each cluster's front faces, shaded by the key (normals blended with the envelope's: one mass)
  const level: 0 | 1 = mode === 'far' ? 0 : 1;
  const mesh = icosphere(level);
  const jit = mode === 'far' ? 0.1 : 0.075;
  const items: Shaded[] = [];
  const hulls: Pt[][] = [];
  const clusterTop = cls.map((c) => c.c[1] - c.r[1]);
  const topOrder = cls.map((c, i) => [clusterTop[i], i] as [number, number]).sort((a, b) => a[0] - b[0]);
  const hiSet = new Set(topOrder.slice(0, mode === 'near' ? 3 : 2).map((q) => q[1]));
  const wF = mode === 'far' ? 0.65 : 0.5;
  const shadeAt = (nf: V3, p: V3, isCore: boolean) => {
    const ne = envNormal(p);
    const nn = norm3(add3(mul3(nf, wF), mul3(ne, 1 - wF)));
    const s = envDepth(p);
    const ao = isCore ? 0.45 : 0.55 + 0.45 * smooth(0.42, 1.0, s);
    // the underside away from the key shades itself (the core crescent): lower and away = darker
    const under = 1 - 0.18 * smooth(0.2, 1.0, (p[1] - C[1]) / Ry);
    return lambert(nn, L) * ao * under;
  };
  cls.forEach((cl, ci) => {
    const V = mesh.v.map((p0) => {
      const j = 1 + cl.seed.jitter(jit);
      const p = rot(cl.m, mul3(p0, j));
      return add3(cl.c, [p[0] * cl.r[0], p[1] * cl.r[1], p[2] * cl.r[2]]) as V3;
    });
    const proj = V.map((p) => [p[0], p[1]] as Pt);
    const hull = convexHull(proj);
    hulls.push(hull);
    const isCore = cl.id === n && mode !== 'far';
    const faces = mesh.f
      .map(([a, b, c]) => {
        let nf = norm3(cross3(sub3(V[b], V[a]), sub3(V[c], V[a])));
        const fc = mul3(add3(add3(V[a], V[b]), V[c]), 1 / 3);
        if (dot3(nf, sub3(fc, cl.c)) < 0) nf = mul3(nf, -1);
        return {a, b, c, nf, fc};
      })
      .filter((q) => q.nf[2] > 0.0)
      .sort((p, q) => p.fc[2] - q.fc[2]);
    for (const q of faces) {
      const poly: Pt[] = [proj[q.a], proj[q.b], proj[q.c]];
      items.push({poly, v: shadeAt(q.nf, q.fc, isCore), area: Math.abs(area2(poly)), cluster: ci, hiOK: hiSet.has(ci), kind: 'facet'});
    }
  });

  // ---- the rim: leaves along every cluster's outline (near: species leaves folded on the midrib; mid: bumps)
  const leafBase = mode === 'near' ? sp.leafK.near : sp.leafK.mid;
  const leafRange = mode === 'near' ? sp.leafPx.near : sp.leafPx.mid;
  const Lf = spec.leafSize ?? clamp(Rm * leafBase, leafRange[0], leafRange[1]);
  const autumnShare = spec.autumn ?? sp.autumn;
  let leafCount = 0;
  const rimLeaves: Shaded[] = [];
  if (mode !== 'far') {
    const tpl = mode === 'near' ? sp.rimLeaf : sp.bumpLeaf;
    cls.forEach((cl, ci) => {
      if (cl.id === n) return; // the core filler has no rim of its own
      const hull = insetConvex(hulls[ci], Lf * 0.2);
      const nearer = hulls.slice(ci + 1).map((h) => insetConvex(h, Lf * 0.3));
      const step = Lf * (mode === 'near' ? 0.48 : 0.58);
      for (const {p, n: n2} of alongClosed(hull, step, cl.seed.range(0, step))) {
        const r = cl.seed;
        let deg = (Math.atan2(n2[1], n2[0]) * 180) / Math.PI + r.jitter(38);
        if (n2[1] > 0.35) deg = lerp(deg, 90, 0.25); // the low leaves hang a little
        const len = Lf * r.range(0.8, 1.15);
        const base: Pt = [p[0] - n2[0] * len * 0.3, p[1] - n2[1] * len * 0.3];
        const tip: Pt = [base[0] + Math.cos(rad(deg)) * len, base[1] + Math.sin(rad(deg)) * len];
        if (nearer.some((h) => inConvex(h, tip) && inConvex(h, base))) continue; // hidden by a nearer cluster
        const pose = leafPose(base, len, deg, r.jitter(50), r.jitter(32), r.chance(0.5));
        const rimN = norm3([n2[0], n2[1], 0.35]);
        const z = cl.c[2] + cl.r[2] * 0.2;
        const pos: V3 = [p[0], p[1], z];
        const ne = envNormal(pos);
        const turned = r.chance(autumnShare * (0.6 + 0.8 * Math.max(0, n2[0] * L2[0] + n2[1] * L2[1]))) ? (r.chance(0.68) ? 'gold' : 'rust') : undefined;
        leafCount++;
        for (const f of leafFacets(pose, tpl, mode === 'near' ? 26 : 0)) {
          const nn = norm3(add3(add3(mul3(f.n, 0.38), mul3(rimN, 0.34)), mul3(ne, 0.28)));
          const s = envDepth(pos);
          const v = lambert(nn, L) * (0.62 + 0.38 * smooth(0.5, 1.0, s)) * (1 - 0.15 * smooth(0.2, 1, (p[1] - C[1]) / Ry));
          rimLeaves.push({poly: f.poly, v, area: Math.abs(area2(f.poly)) * 0.55, cluster: ci, hiOK: hiSet.has(ci), autumn: turned, kind: 'half', leaf: leafCount});
        }
      }
    });
  }

  // ---- the tones: split at the crown's own value quantiles (area-weighted) so its mean sits on the ladder
  const all = items.concat(rimLeaves);
  const th = thresholds(all.map((q) => ({v: q.v, w: q.area})), shares);
  const top1 = tones.length - 1;
  const kOf = (q: Shaded) => {
    const k = toneIndex(q.v, th);
    return mode === 'near' && k === top1 && !q.hiOK ? top1 - 1 : k;
  };

  // ---- sky holes near the thin edge (2-4, a step under the open sky, <= 3 % of the crown)
  const holes: {ci: number; poly: Pt[]}[] = [];
  if (spec.holes && mode !== 'far') {
    const cand = cls
      .map((cl, ci) => ({ci, cl, up: -(cl.c[1] - C[1]) / Ry + Math.abs(cl.c[0] - C[0]) / Rx * 0.6}))
      .filter((q) => q.cl.id !== n && q.cl.c[2] > -Rz * 0.1)
      .sort((a, b) => b.up - a.up)
      .slice(0, R.int(2, 4));
    for (const q of cand) {
      const dir = norm3([q.cl.c[0] - C[0], q.cl.c[1] - C[1] - Ry * 0.3, 0]);
      const hc: Pt = [q.cl.c[0] + dir[0] * q.cl.r[0] * 0.58, q.cl.c[1] + dir[1] * q.cl.r[1] * 0.58];
      const hr = q.cl.r[0] * q.cl.seed.range(0.08, 0.13);
      const poly: Pt[] = [];
      const m = 7;
      for (let i = 0; i < m; i++) {
        const a = (i / m) * Math.PI * 2 + q.cl.seed.jitter(0.25);
        const k = i % 2 ? q.cl.seed.range(0.45, 0.65) : q.cl.seed.range(0.85, 1.15);
        poly.push([hc[0] + Math.cos(a) * hr * k * 1.25, hc[1] + Math.sin(a) * hr * k]);
      }
      holes.push({ci: q.ci, poly});
    }
  }

  // ---- paint the clusters: rim leaves under their own facets (the silhouette is leaves, the inside facets)
  const greenTones = tones;
  const clusterGeoms: ClusterGeom[] = cls.map((cl, ci) => {
    const layers: Layer[] = [];
    const myLeaves = rimLeaves.filter((q) => q.cluster === ci);
    // leaves: the full leaf in its darker half's tone, its lighter half on top (no seam on the midrib)
    const byLeaf = new Map<number, Shaded[]>();
    for (const q of myLeaves) byLeaf.set(q.leaf ?? 0, [...(byLeaf.get(q.leaf ?? 0) ?? []), q]);
    const green: {poly: Pt[]; k: number}[] = [];
    const turned: {poly: Pt[]; k: number; kind: 'gold' | 'rust'}[] = [];
    byLeaf.forEach((halves) => {
      const ks = halves.map(kOf);
      const kLo = Math.min(...ks);
      const outline = halves.length > 1 ? halves.map((h) => h.poly) : [halves[0].poly];
      const kind = halves[0].autumn;
      const push = (poly: Pt[], k: number) => (kind && k >= 2 ? turned.push({poly, k, kind}) : green.push({poly, k}));
      for (const o of outline) push(o, kLo);
      halves.forEach((h, j) => {
        if (ks[j] > kLo) push(h.poly, ks[j]);
      });
    });
    for (let k = 0; k <= top1; k++) {
      const d = green.filter((q) => q.k === k).map((q) => polyD(q.poly)).join('');
      if (d) layers.push({d, color: greenTones[k]});
    }
    for (const kind of ['gold', 'rust'] as const) {
      for (let k = 0; k <= top1; k++) {
        const d = turned.filter((q) => q.k === k && q.kind === kind).map((q) => polyD(q.poly)).join('');
        if (d) layers.push({d, color: recedeC(autumnTone(greenTones[k], kind))});
      }
    }
    const facets = items.filter((q) => q.cluster === ci).map((q) => ({poly: q.poly, k: kOf(q)}));
    layers.push(...levelLayers(facets, greenTones, [hulls[ci]]));
    for (const h of holes.filter((q) => q.ci === ci)) layers.push({d: polyD(h.poly), color: spec.holes as string});
    return {id: cl.id, c: [cl.c[0], cl.c[1]], z: cl.c[2], layers};
  });

  // ---- the wood: a tapered trunk to the fork, 3-4 limbs into the crown (their ends hidden by clusters)
  const wood: Layer[] = [];
  const trunkW = spec.trunkWidth ?? H * sp.trunk;
  const forkY = bottom + (foot[1] - bottom) * 0.06;
  const fork: Pt = [foot[0] + leanDx * ((foot[1] - forkY) / (foot[1] - C[1])), forkY];
  const bend = R.jitter(trunkW * 0.35);
  const trunkLine = smoothOpen([foot, [lerp(foot[0], fork[0], 0.35) + bend, lerp(foot[1], fork[1], 0.35)], [lerp(foot[0], fork[0], 0.7) - bend * 0.6, lerp(foot[1], fork[1], 0.7)], fork], 10);
  const trunkWidth = (s: number) => trunkW * (s < 0.06 ? lerp(1.22, 1, s / 0.06) : lerp(1, 0.74, (s - 0.06) / 0.94));
  // which side faces the key (the ribbon's +u side is its right-hand normal: screen-right for a line going up)
  const tSide = litSide(trunkLine, L2);
  const shadeBand = shadeBandOf(tSide);
  const litBand = litBandOf(tSide, 0.3);
  const minWidth: number[] = [trunkW * 0.74];
  const woodTone = (c: string) => recedeC(c);
  wood.push({d: polyD(ribbon(trunkLine, trunkWidth)), color: woodTone(bark.lit)});
  const patches = spec.patches ?? mode !== 'far';
  if (patches) {
    // the London plane's plates: same-hue patches in the trunk's (s, u) frame, kept inside their side
    const us = arcParams(trunkLine);
    const len = polyLength(trunkLine);
    const np = Math.round((len * trunkW) / (trunkW * trunkW * 0.55));
    const lit: Pt[][][] = [[], [], []];
    const sh: Pt[][][] = [[], []];
    const PR = R.fork('bark');
    for (let i = 0; i < np; i++) {
      const s = PR.range(0.02, 0.97);
      const inShade = PR.chance(0.35);
      const band = inShade ? shadeBand : litBand;
      const uc = PR.range(band[0] + 0.18, band[1] - 0.18);
      const du = PR.range(0.14, 0.3);
      const ds = (PR.range(0.6, 1.3) * trunkW) / len;
      const ring: Pt[] = [];
      const m = 7;
      for (let k = 0; k < m; k++) {
        const a = (k / m) * Math.PI * 2;
        const kk = PR.range(0.7, 1.15);
        const u = clamp(uc + Math.cos(a) * du * kk, band[0] + 0.04, band[1] - 0.04);
        const sv = clamp(s + Math.sin(a) * ds * kk, 0, 1);
        const {p, t} = atU(trunkLine, us, sv);
        const hw = trunkWidth(sv) / 2;
        ring.push([p[0] - t[1] * hw * u, p[1] + t[0] * hw * u]);
      }
      if (inShade) sh[PR.int(0, 1)].push(ring);
      else lit[PR.int(0, 2)].push(ring);
    }
    lit.forEach((rs, i) => rs.length && wood.push({d: rs.map(polyD).join(''), color: woodTone(bark.litPatches[i])}));
    wood.push({d: polyD(ribbon(trunkLine, trunkWidth, shadeBand[0], shadeBand[1])), color: woodTone(bark.shade)});
    sh.forEach((rs, i) => rs.length && wood.push({d: rs.map(polyD).join(''), color: woodTone(bark.shadePatches[i])}));
  } else {
    wood.push({d: polyD(ribbon(trunkLine, trunkWidth, shadeBand[0], shadeBand[1])), color: woodTone(bark.shade)});
  }
  // the crown's own shade across the trunk's top (the shade under the tree, a real effect), two flat steps
  if (mode !== 'far') {
    const sub = (a: number, b: number) => {
      const us = arcParams(trunkLine);
      return trunkLine.filter((_, i) => us[i] >= a && us[i] <= b);
    };
    const sA = 0.74;
    const s0 = 0.8;
    const half = sub(sA, s0 + 0.01);
    const upper = sub(s0, 1);
    const wHalf = (s: number) => trunkWidth(lerp(sA, s0, s)) + 0.6;
    const w2 = (s: number) => trunkWidth(lerp(s0, 1, s)) + 0.6;
    // the half step on the lit side, then the full shade, then the shade side's core
    if (half.length >= 2) wood.push({d: polyD(ribbon(half, wHalf, litBand[0], litBand[1])), color: woodTone(mixL(bark.lit, bark.shade))});
    if (upper.length >= 2) {
      wood.push({d: polyD(ribbon(upper, w2)), color: woodTone(bark.shade)});
      wood.push({d: polyD(ribbon(upper, w2, shadeBand[0], shadeBand[1])), color: woodTone(bark.core)});
    }
  }
  // limbs: from the fork up into the lower and middle clusters
  // (front clusters only: each limb's end must sit under a cluster drawn after it)
  const targets = cls
    .filter((c) => c.id !== n && c.c[2] >= 0 && c.c[1] > C[1] - Ry * 0.45)
    .sort((a, b) => Math.abs(a.c[0] - fork[0]) - Math.abs(b.c[0] - fork[0]));
  const nl = mode === 'far' ? 0 : Math.min(targets.length, R.int(sp.limbs[0], sp.limbs[1]));
  const picked = targets.slice(0, nl + 2).sort((a, b) => a.c[0] - b.c[0]);
  const limbs: Pt[][] = [];
  for (let i = 0; i < Math.min(nl, picked.length); i++) {
    const tgt = picked[Math.round((i * (picked.length - 1)) / Math.max(1, nl - 1))];
    const end: Pt = [tgt.c[0], tgt.c[1] + tgt.r[1] * 0.15];
    const start: Pt = [fork[0] + (i - (nl - 1) / 2) * trunkW * 0.22, fork[1] + trunkW * 0.3];
    const mid: Pt = [lerp(start[0], end[0], 0.35) + R.jitter(trunkW * 0.4), lerp(start[1], end[1], 0.55)];
    limbs.push(smoothOpen([start, mid, end], 8));
  }
  const limbW = (s: number) => Math.max(4, trunkW * lerp(0.5, 0.18, s));
  minWidth.push(...limbs.map(() => Math.max(4, trunkW * 0.18)));
  if (limbs.length) {
    // limbs live under the crown: mostly its shade, a lit strip on the key's side
    wood.push({d: limbs.map((l) => polyD(ribbon(l, limbW))).join(''), color: woodTone(bark.shade)});
    wood.push({d: limbs.map((l) => {
      const b = litBandOf(litSide(l, L2), -0.2);
      return polyD(ribbon(l, limbW, b[0], b[1]));
    }).join(''), color: woodTone(bark.litPatches[1])});
  }

  // ---- split back / front of the limbs, the bbox, the stats
  const back = clusterGeoms.filter((c) => c.z < 0 || c.id === n);
  const front = clusterGeoms.filter((c) => !(c.z < 0 || c.id === n));
  const allPts = cat(hulls).concat(cat(rimLeaves.map((q) => q.poly))).concat(ribbon(trunkLine, trunkWidth));
  const bbox: [number, number, number, number] = [
    Math.min(...allPts.map((p) => p[0])),
    Math.min(...allPts.map((p) => p[1])),
    Math.max(...allPts.map((p) => p[0])),
    Math.max(...allPts.map((p) => p[1])),
  ];
  const share = tones.map(() => 0);
  let tot = 0;
  for (const q of all) {
    const k = kOf(q);
    share[k] += q.area;
    tot += q.area;
  }
  for (let k = 0; k < share.length; k++) share[k] /= tot || 1;
  const meanL = share.reduce((acc, s, k) => acc + s * lch(tones[k]).L, 0);
  // the light vector: lightest 20 % of the painted area minus the darkest 20 %, as pro_3_nature.py measures it
  const sorted = all.map((q) => ({q, k: kOf(q), c: centroid(q.poly)})).sort((a, b) => a.k - b.k || a.q.v - b.q.v);
  const cum = (list: typeof sorted) => {
    let acc = 0;
    let x = 0;
    let y = 0;
    for (const e of list) {
      acc += e.q.area;
      x += e.c[0] * e.q.area;
      y += e.c[1] * e.q.area;
      if (acc >= tot * 0.2) break;
    }
    return [x / (acc || 1), y / (acc || 1)] as Pt;
  };
  const dark = cum(sorted);
  const light = cum(sorted.slice().reverse());
  let gx = 0;
  let gy = 0;
  for (const e of sorted) {
    gx += e.c[0] * e.q.area;
    gy += e.c[1] * e.q.area;
  }
  gx /= tot || 1;
  gy /= tot || 1;
  let gyr = 0;
  for (const e of sorted) gyr += ((e.c[0] - gx) ** 2 + (e.c[1] - gy) ** 2) * e.q.area;
  gyr = Math.sqrt(gyr / (tot || 1)) || 1;
  const dx = light[0] - dark[0];
  const dy = light[1] - dark[1];
  const holesArea = holes.reduce((acc, h) => acc + Math.abs(area2(h.poly)), 0);
  const crownArea = Math.PI * Rx * Ry;
  const stats: CrownStats = {
    mode,
    tones,
    share,
    meanL,
    lightDeg: ((Math.atan2(-dy, dx) * 180) / Math.PI + 360) % 360,
    lightK: Math.hypot(dx, dy) / gyr,
    keyDeg: ((Math.atan2(-L2[1], L2[0]) * 180) / Math.PI + 360) % 360,
    clusters: cls.length,
    leaves: leafCount,
    holesShare: holesArea / crownArea,
    minWidth: Math.min(...minWidth),
  };
  return {spec, pivot: foot, centre: [C[0], C[1]], radii: [Rx, Ry], back, wood, front, bbox, stats};
}

// ================================================================= the near leaf spray (framing: pro_3 §3.1 "Near")

export type LeafSpraySpec = {
  seed: string;
  species?: Species;
  /** The branch's centreline: from where it enters (off-frame) to its tip (canvas px at rest). */
  branch: Pt[];
  /** The branch's width at its entry and at its tip (px; the tip >= 3 so it never twinkles). Default [16, 4]. */
  width?: [number, number];
  /** How many leaves (default 11) and their length range, base to tip (px; default [70, 120]). */
  leaves?: number;
  size?: [number, number];
  /** Side twigs (default 2). */
  twigs?: number;
  /** The plane (default -2: the near framing plane that floats most). */
  plane?: number;
  light: LightInput;
  tones?: string[];
  bark?: BarkTones;
  /** 0..1: how much the leaves hang (default 0.45). */
  droop?: number;
  /** October: the share of leaves turned (default 0). */
  autumn?: number;
  /** The folds' depth (deg, default 22): each half-lobe tilts toward its vein. */
  fold?: number;
  /** The veins: 'main' (the midrib and the two lateral veins, default), 'midrib' or 'none'. */
  veins?: 'main' | 'midrib' | 'none';
};

export type SprayLeafGeom = {id: number; node: Pt; depth: 0 | 1 | 2; layers: Layer[]};
export type SprayTwigGeom = {id: number; root: Pt; len: number; wood: Layer[]; leaves: SprayLeafGeom[]};
export type SprayGeom = {
  spec: LeafSpraySpec;
  /** The branch's entry point: the spray rotates about it. */
  pivot: Pt;
  wood: Layer[];
  /** Leaves on the branch itself (twig -1) and on each twig, by depth (back first). */
  twigs: SprayTwigGeom[];
  bbox: [number, number, number, number];
  stats: {tones: string[]; leaves: number; minWidth: number; share: number[]};
};

const SPRAY_CACHE = new Map<string, SprayGeom>();

/** The spray, built once per spec (cached): the branch, its twigs and the folded leaves. */
export function sprayGeometry(spec: LeafSpraySpec): SprayGeom {
  const key = specKey(spec);
  const hit = SPRAY_CACHE.get(key);
  if (hit) return hit;
  const g = buildSpray(spec);
  if (SPRAY_CACHE.size > 64) SPRAY_CACHE.clear();
  SPRAY_CACHE.set(key, g);
  return g;
}

function buildSpray(spec: LeafSpraySpec): SprayGeom {
  const sp = spec.species ?? LONDON_PLANE;
  const R = rng(`spray/${spec.seed}`);
  const L = lightVec(spec.light);
  const tones = spec.tones ?? foliageTones({green: sp.green});
  const bark = spec.bark ?? barkTones();
  const [w0, w1] = spec.width ?? [16, 4];
  const fold = spec.fold ?? 22;
  const veins = spec.veins ?? 'main';
  const droop = spec.droop ?? 0.45;
  const [s0, s1] = spec.size ?? [70, 120];
  const line = smoothOpen(spec.branch, 6);
  const us = arcParams(line);
  const blen = polyLength(line);
  const bw = (s: number) => Math.max(3, lerp(w0, w1, s));
  const L2n = Math.hypot(L[0], L[1]) || 1;
  const L2: Pt = [L[0] / L2n, L[1] / L2n];
  const minWidth: number[] = [w1];

  // twigs: alternate sides, drooping, from 35-75 % along the branch
  const nT = spec.twigs ?? 2;
  type Tw = {id: number; line: Pt[]; us: number[]; len: number; w: (s: number) => number};
  const twigs: Tw[] = [{id: -1, line, us, len: blen, w: bw}];
  for (let i = 0; i < nT; i++) {
    const s = lerp(0.35, 0.75, nT > 1 ? i / (nT - 1) : 0.5) + R.jitter(0.04);
    const {p, t} = atU(line, us, s);
    const side = i % 2 ? 1 : -1;
    const a = Math.atan2(t[1], t[0]) + side * rad(R.range(35, 55));
    const len = blen * R.range(0.26, 0.38);
    const dir: Pt = [Math.cos(a), Math.sin(a)];
    const mid: Pt = [p[0] + dir[0] * len * 0.5, p[1] + dir[1] * len * 0.5 + len * 0.08];
    const end: Pt = [p[0] + dir[0] * len, p[1] + dir[1] * len + len * 0.2];
    const tl = smoothOpen([p, mid, end], 5);
    const wa = bw(s) * 0.62;
    twigs.push({id: i, line: tl, us: arcParams(tl), len: polyLength(tl), w: (q: number) => Math.max(3, lerp(wa, 3, q))});
  }

  // the leaves: spread over the branch and the twigs by length, alternate sides
  const nLeaves = spec.leaves ?? 11;
  const totLen = twigs.reduce((acc, q) => acc + q.len * (q.id < 0 ? 0.7 : 0.75), 0);
  type Lf = {tw: number; node: Pt; depth: 0 | 1 | 2; facets: {poly: Pt[]; v: number}[]; petiole: Pt[]; veins: Pt[][]; id: number; turned?: 'gold' | 'rust'};
  const leaves: Lf[] = [];
  const vals: {v: number; w: number}[] = [];
  let id = 0;
  twigs.forEach((tw) => {
    const share = (tw.len * (tw.id < 0 ? 0.7 : 0.75)) / totLen;
    const k = Math.max(1, Math.round(nLeaves * share));
    for (let j = 0; j < k; j++) {
      const s = tw.id < 0 ? lerp(0.32, 0.98, k > 1 ? j / (k - 1) : 1) : lerp(0.3, 1, k > 1 ? j / (k - 1) : 1);
      const {p, t} = atU(tw.line, tw.us, s);
      const side = (j + (tw.id < 0 ? 0 : 1)) % 2 ? 1 : -1;
      let a = (Math.atan2(t[1], t[0]) * 180) / Math.PI + side * R.range(45, 80);
      // gravity: hang toward straight down by `droop`
      const toDown = ((90 - a + 540) % 360) - 180;
      a += toDown * droop * R.range(0.6, 1.1);
      const size = lerp(s1, s0, s * 0.6) * R.range(0.85, 1.08);
      const pet = size * R.range(0.36, 0.48);
      const base: Pt = [p[0] + Math.cos(rad(a)) * pet, p[1] + Math.sin(rad(a)) * pet];
      const axis = a + side * R.range(4, 14);
      const pose = leafPose(base, size, axis, R.jitter(42), R.jitter(28), R.chance(0.5));
      const depth = R.weighted<0 | 1 | 2>([[0, 0.4], [1, 0.35], [2, 0.25]]);
      const facets = leafFacets(pose, sp.leaf, fold).map((f) => ({poly: f.poly, v: lambert(f.n, L, 0.4) - 0.07 * depth}));
      for (const f of facets) vals.push({v: f.v, w: Math.abs(area2(f.poly))});
      // the stalk: a tapered closed shape, >= 2 px (2.8 at the twig, 2.2 at the blade)
      const pw0 = 2.8;
      const pw1 = 2.2;
      const nx = -Math.sin(rad(a));
      const ny = Math.cos(rad(a));
      const petiole: Pt[] = [[p[0] + nx * pw0 / 2, p[1] + ny * pw0 / 2], [base[0] + nx * pw1 / 2, base[1] + ny * pw1 / 2], [base[0] - nx * pw1 / 2, base[1] - ny * pw1 / 2], [p[0] - nx * pw0 / 2, p[1] - ny * pw0 / 2]];
      minWidth.push(pw1);
      // veins: thin same-hue light shapes from the base toward the tips (3.0 -> 2.0 px)
      const vs: Pt[][] = [];
      if (veins !== 'none') {
        const tips = veins === 'main' ? [sp.leaf.veins[sp.leaf.veins.length - 1], ...sp.leaf.veins.filter((_, q) => q === 1 || q === sp.leaf.veins.length - 2)] : [sp.leaf.veins[Math.floor(sp.leaf.veins.length / 2)]];
        const B = leafPt(pose, 0, 0);
        for (const ti of tips) {
          const tp = sp.leaf.pts[ti];
          const E = leafPt(pose, tp[0] * 0.84, tp[1] * 0.84);
          const vl = Math.hypot(E[0] - B[0], E[1] - B[1]) || 1;
          const qx = -(E[1] - B[1]) / vl;
          const qy = (E[0] - B[0]) / vl;
          vs.push([[B[0] + qx * 1.5, B[1] + qy * 1.5], [E[0] + qx * 1.0, E[1] + qy * 1.0], [E[0] - qx * 1.0, E[1] - qy * 1.0], [B[0] - qx * 1.5, B[1] - qy * 1.5]]);
        }
        minWidth.push(2.0);
      }
      const turned = R.chance(spec.autumn ?? 0) ? (R.chance(0.6) ? 'gold' : 'rust') : undefined;
      leaves.push({tw: tw.id, node: p, depth, facets, petiole, veins: vs, id: id++, turned});
    }
  });
  const th = thresholds(vals, TONE_SHARES.near.slice(0, tones.length));
  const top1 = tones.length - 1;
  const share = tones.map(() => 0);
  let tot = 0;
  const leafGeom = (lf: Lf): SprayLeafGeom => {
    const items = lf.facets.map((f) => ({poly: f.poly, k: toneIndex(f.v, th)}));
    for (const it of items) {
      const a = Math.abs(area2(it.poly));
      share[it.k] += a;
      tot += a;
    }
    const kHi = Math.max(...items.map((q) => q.k));
    const palette = lf.turned ? tones.map((c) => autumnTone(c, lf.turned as 'gold' | 'rust')) : tones;
    const layers: Layer[] = [{d: polyD(lf.petiole), color: palette[Math.max(1, Math.min(top1, 2))]}];
    layers.push(...levelLayers(items, palette, [[...lf.facets.map((f) => f.poly).flat()].length ? lf.facets.map((f) => f.poly) : []].flat() as unknown as Pt[][]));
    if (lf.veins.length) {
      const vt = lch(palette[Math.min(top1, kHi)]);
      layers.push({d: lf.veins.map(polyD).join(''), color: fromLch(Math.min(84, vt.L + 7), Math.max(8, vt.C - 3), vt.h - 4)});
    }
    return {id: lf.id, node: lf.node, depth: lf.depth, layers};
  };
  const twigGeoms: SprayTwigGeom[] = twigs.map((tw) => {
    const wd: Layer[] = [];
    if (tw.id >= 0) {
      wd.push({d: polyD(ribbon(tw.line, tw.w)), color: bark.shade});
      wd.push({d: polyD(ribbon(tw.line, tw.w, L2[0] * 0 + (L2[1] < 0 ? -1 : 0.1), L2[1] < 0 ? -0.1 : 1)), color: bark.lit});
    }
    const ls = leaves
      .filter((q) => q.tw === tw.id)
      .sort((a, b) => b.depth - a.depth)
      .map(leafGeom);
    return {id: tw.id, root: tw.line[0], len: tw.len, wood: wd, leaves: ls};
  });
  for (let k = 0; k < share.length; k++) share[k] /= tot || 1;
  const wood: Layer[] = [
    {d: polyD(ribbon(line, bw)), color: bark.shade},
    {d: polyD(ribbon(line, bw, L2[1] < 0 ? -1 : 0.1, L2[1] < 0 ? -0.1 : 1)), color: bark.lit},
  ];
  const pts = leaves.flatMap((q) => q.facets.flatMap((f) => f.poly)).concat(line);
  const bbox: [number, number, number, number] = [Math.min(...pts.map((p) => p[0])), Math.min(...pts.map((p) => p[1])), Math.max(...pts.map((p) => p[0])), Math.max(...pts.map((p) => p[1]))];
  return {spec, pivot: line[0], wood, twigs: twigGeoms, bbox, stats: {tones, leaves: leaves.length, minWidth: Math.min(...minWidth), share}};
}

// ================================================================= React

/** The layers as flat fills (lib/Fill: the paper state and the frame-0 flood apply; exact registration). */
const Layers: React.FC<{layers: Layer[]; seed: string}> = ({layers, seed}) => (
  <>
    {layers.map((l, i) => (
      <Fill key={i} d={l.d} color={l.color} offset={false} seed={`${seed}/${i}`} />
    ))}
  </>
);

export type CrownProps = {
  spec: CrownSpec;
  /** The set's one wind (lib/wind). Default: still. */
  wind?: Wind;
  /** Scene time (default useTime()). */
  t?: number;
  /** Keep the nature ladder's tones exact under the clean pen (default true; see the header). */
  exact?: boolean;
};

/** One species tree: the crown rotates about the trunk's foot (main bending), each cluster shifts as a whole (detail
 *  bending), nothing is redrawn. */
export const Crown: React.FC<CrownProps> = ({spec, wind, t: tIn, exact = true}) => {
  const tScene = useTime();
  const t = tIn ?? tScene;
  const g = crownGeometry(spec);
  const w = wind ?? STILL_WIND;
  const plane = spec.plane ?? -1;
  const deg = crownDeg(w, t, {x: g.centre[0], y: g.centre[1], plane, seed: spec.seed});
  const cluster = (c: ClusterGeom) => {
    const [dx, dy] = clusterShift(w, t, {x: c.c[0], y: c.c[1], plane, seed: spec.seed, i: c.id});
    return (
      <g key={c.id} transform={`translate(${dx.toFixed(3)} ${dy.toFixed(3)})`}>
        <Layers layers={c.layers} seed={`crown/${spec.seed}/${c.id}`} />
      </g>
    );
  };
  const body = (
    <g transform={`rotate(${deg.toFixed(4)} ${g.pivot[0]} ${g.pivot[1]})`}>
      {g.back.map(cluster)}
      <Layers layers={g.wood} seed={`crown/${spec.seed}/wood`} />
      {g.front.map(cluster)}
    </g>
  );
  return exact ? <Tier tier="subject">{body}</Tier> : body;
};

export type LeafSprayProps = {spec: LeafSpraySpec; wind?: Wind; t?: number; exact?: boolean};

/** A near branch of the species' own leaves: the branch bends about its entry (main bending), each twig about its root
 *  (detail bending, as a rotation so it never detaches), each leaf flutters about its stalk. */
export const LeafSpray: React.FC<LeafSprayProps> = ({spec, wind, t: tIn, exact = true}) => {
  const tScene = useTime();
  const t = tIn ?? tScene;
  const g = sprayGeometry(spec);
  const w = wind ?? STILL_WIND;
  const plane = spec.plane ?? -2;
  const deg = crownDeg(w, t, {x: g.pivot[0], y: g.pivot[1], plane, seed: spec.seed}) * 1.2;
  const leaf = (lf: SprayLeafGeom) => {
    const f = leafFlutter(w, t, {x: lf.node[0], y: lf.node[1], plane, seed: spec.seed, i: lf.id});
    return (
      <g key={lf.id} transform={`translate(${f.dx.toFixed(3)} ${f.dy.toFixed(3)}) rotate(${f.deg.toFixed(3)} ${lf.node[0]} ${lf.node[1]})`}>
        <Layers layers={lf.layers} seed={`spray/${spec.seed}/${lf.id}`} />
      </g>
    );
  };
  const twigRot = (tw: SprayTwigGeom) => {
    if (tw.id < 0) return 0;
    const [dx, dy] = clusterShift(w, t, {x: tw.root[0], y: tw.root[1], plane, seed: spec.seed, i: tw.id});
    return ((Math.hypot(dx, dy) * Math.sign(dx || 1)) / Math.max(40, tw.len)) * (180 / Math.PI);
  };
  const byDepth = (d: number) =>
    g.twigs.map((tw) => (
      <g key={`${tw.id}/${d}`} transform={`rotate(${twigRot(tw).toFixed(4)} ${tw.root[0]} ${tw.root[1]})`}>
        {d === 1 && tw.wood.length ? <Layers layers={tw.wood} seed={`spray/${spec.seed}/tw${tw.id}`} /> : null}
        {tw.leaves.filter((q) => q.depth === d).map(leaf)}
      </g>
    ));
  const body = (
    <g transform={`rotate(${deg.toFixed(4)} ${g.pivot[0]} ${g.pivot[1]})`}>
      {byDepth(2)}
      <Layers layers={g.wood} seed={`spray/${spec.seed}/wood`} />
      {byDepth(1)}
      {byDepth(0)}
    </g>
  );
  return exact ? <Tier tier="subject">{body}</Tier> : body;
};

// ================================================================= the checks

/** The nature lane's targets by mode (pro_3_nature.md N1, N3; STUDY.md §3). */
export const NATURE_TARGETS = {
  near: {tones: [4, 5], steps: [6, 10], range: 30, meanL: [42, 55]},
  mid: {tones: [3, 4], steps: [6, 10], range: 30, meanL: [45, 60]},
  far: {tones: [2, 3], steps: [4, 6], range: 15, meanL: [45, 75]},
  lightDeg: 45,
  lightK: 0.3,
  holes: 0.03,
  minWidth: 2,
} as const;

/** The caption band's flat field and the organic right rail (LAYOUT.md §1), [x0, y0, x1, y1]. */
export const NATURE_KEEP_OUT: {name: string; box: [number, number, number, number]}[] = [
  {name: 'the caption band', box: [95, 290, 945, 600]},
  {name: 'the right rail', box: [950, 900, 1080, 1500]},
];

const overlaps = (a: [number, number, number, number], b: [number, number, number, number]) => a[0] < b[2] && a[2] > b[0] && a[1] < b[3] && a[3] > b[1];

/** The nature checks (empty = OK): each tone out of the never bands (beige, olive, grey) and at C* >= 8; the ladder's
 *  steps, range, count and mean L* by mode; the crown's light vector within 45 deg of the key at strength >= 0.3 (N3);
 *  sky holes <= 3 % of the crown; every thin part >= 2 px (the float's twinkle); nothing in the caption band or the
 *  rail (a 6 px margin for the sway). The pixel metrics (roughness, local contrast) are measured on a still with
 *  scripts/look/posters/nature_check.py. */
export function foliageProblems(o: {crowns?: CrownGeom[]; sprays?: SprayGeom[]; keepOut?: {name: string; box: [number, number, number, number]}[]} = {}): string[] {
  const out: string[] = [];
  const keep = o.keepOut ?? NATURE_KEEP_OUT;
  const toneChecks = (name: string, tones: string[], mode: Mode, used: number[]) => {
    const T = NATURE_TARGETS[mode];
    tones.forEach((c, k) => {
      const band = neverBand(c);
      if (band) out.push(`${name}: tone ${k} ${c} sits in the ${band} band`);
      if (lch(c).C < 8) out.push(`${name}: tone ${k} ${c} C* ${lch(c).C.toFixed(1)} (< 8 reads grey)`);
    });
    const live = tones.filter((_, k) => (used[k] ?? 0) > 0.02);
    if (live.length < T.tones[0] || live.length > T.tones[1]) out.push(`${name}: ${live.length} tones in use (${mode}: ${T.tones[0]}-${T.tones[1]})`);
    const Ls = live.map((c) => lch(c).L);
    for (let i = 1; i < Ls.length; i++) {
      const s = Ls[i] - Ls[i - 1];
      if (s < T.steps[0] - 0.5 || s > T.steps[1] + 0.5) out.push(`${name}: step ${i - 1}->${i} is ${s.toFixed(1)} L* (${mode}: ${T.steps[0]}-${T.steps[1]})`);
    }
  };
  for (const g of o.crowns ?? []) {
    const s = g.stats;
    const name = `crown ${g.spec.seed}`;
    const T = NATURE_TARGETS[s.mode];
    toneChecks(name, s.tones, s.mode, s.share);
    const lo = s.tones.map((c) => lch(c).L);
    const body = s.mode === 'near' ? lo.slice(0, 4) : lo;
    if (body.length && Math.max(...body) - Math.min(...body) > T.range + 0.5) out.push(`${name}: the body's range is ${(Math.max(...body) - Math.min(...body)).toFixed(1)} L* (${s.mode}: <= ${T.range})`);
    if (s.meanL < T.meanL[0] || s.meanL > T.meanL[1]) out.push(`${name}: mean L* ${s.meanL.toFixed(1)} (${s.mode}: ${T.meanL[0]}-${T.meanL[1]})`);
    const dAng = Math.abs(((s.lightDeg - s.keyDeg + 540) % 360) - 180);
    if (s.mode !== 'far' && dAng > NATURE_TARGETS.lightDeg) out.push(`${name}: its light vector (${s.lightDeg.toFixed(0)} deg) is ${dAng.toFixed(0)} deg off the key (${s.keyDeg.toFixed(0)} deg; N3: <= 45)`);
    if (s.mode !== 'far' && s.lightK < NATURE_TARGETS.lightK) out.push(`${name}: light strength ${s.lightK.toFixed(2)} (N3: >= 0.3)`);
    if (s.holesShare > NATURE_TARGETS.holes) out.push(`${name}: sky holes ${(s.holesShare * 100).toFixed(1)} % of the crown (<= 3 %)`);
    if (s.minWidth < NATURE_TARGETS.minWidth) out.push(`${name}: a limb ${s.minWidth.toFixed(1)} px wide (>= 2 px on a floating plane)`);
    const b: [number, number, number, number] = [g.bbox[0] - 6, g.bbox[1] - 6, g.bbox[2] + 6, g.bbox[3] + 6];
    for (const k of keep) if (overlaps(b, k.box)) out.push(`${name}: reaches into ${k.name} (bbox ${g.bbox.map(Math.round).join(', ')})`);
  }
  for (const g of o.sprays ?? []) {
    const name = `spray ${g.spec.seed}`;
    toneChecks(name, g.stats.tones, 'near', g.stats.share);
    if (g.stats.minWidth < NATURE_TARGETS.minWidth) out.push(`${name}: a stalk, vein or twig ${g.stats.minWidth.toFixed(1)} px wide (>= 2 px on a floating plane)`);
    const b: [number, number, number, number] = [g.bbox[0] - 6, g.bbox[1] - 6, g.bbox[2] + 6, g.bbox[3] + 6];
    for (const k of keep) if (overlaps(b, k.box)) out.push(`${name}: reaches into ${k.name} (bbox ${g.bbox.map(Math.round).join(', ')})`);
  }
  return out;
}
