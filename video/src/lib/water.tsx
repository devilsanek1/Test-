// lib/water.tsx — ONE SHARED WATER for every shot of a film (the owner on video 2's G4 look clip v5, 2026-10-28: "It's
// just looking way too cheap, not clean or premium quality or refined. Just lazy and cheap. I mean that about the
// water"; the playbook's DEPTH AND SEPARATION: "water gets the same clean, premium, refined drawing as everything
// else ... designed ... as one shared component"). How-to, numbers and a recipe per scene: `src/lib/WATER.md`; the
// rules: `docs/look/CRAFT.md` §f.7; the optics: `docs/look/research/2026-10-28_water.md` (R1-R14); the study that
// chose this design: `docs/v2/water/JUDGE.md` (candidate A's engine and colour, candidate B's drawing language).
//
// THE WATER IS THE MIRROR OF ITS OWN SHOT, seen through a Fresnel veil and cut by calm ripples. A shot feeds a
// WaterSpec: its camera (a level lens over the water), the visible region and its edges, its own lib/sky preset, the
// water's body colour, the light rig's water tint, a seed, the tier, and a LIST of what stands above the water (the
// THINGS as screen polygons with their own waterlines, coloured as the clean pen shows them). The engine draws, bottom
// to top (raw SVG with computed colours: the pen's tier pull never re-tints them):
//   1. THE RAMP: the shot's sky mirrored about the horizon and toned toward the water's body (warm far, a light veil,
//      the teal body near: the ONE allowed gradient, the sky's own gradient seen in the water; lib/sky's eased OKLab
//      curve and blue-noise dither), held still on screen while the water plane floats (the sky is at infinity).
//   2. REFLECTIONS: every thing mirrored about its own waterline (R1), toned by a flat Fresnel ladder in CIE LCh (hue
//      from the water, value from the world, a light keeps its colour: never an RGB mix, so never khaki, beige, olive
//      or grey; R2-R4), drawn as ONE SOLID SMOOTH BLOCK from its waterline down to >= 55 % of its visible length (its
//      sides sampled every 4 px and swayed by the travelling ripple: no stair-steps), then LEVEL BARS with tapered ends
//      on ONE shared perspective grid, narrowing along a smooth envelope, with at most one static seeded break per band
//      and only in the last half (R5-R6): nothing boils, nothing regrows elsewhere.
//   3. THE QUAY: a contact band (the quay's face mirrored: one crisp flat band, no sway) and dome-capped stubs (R10).
//   4. RIPPLE LINES: a few long, level, tapered lines on the grid, light across reflections and darker across the open
//      water, drifting with the breeze (R9); the open water carries nothing else.
//   5. THE SUN'S GLITTER: one narrow column straight under the sun (R8): a STILL bed of gold lenses, one per band,
//      densest at the sun's mirror point, swaying with its rows, and 4-6 warm-white slivers nested in it, each growing
//      in and shrinking out along its length (CRAFT §f.6's glints: 20-36 px, 0.3-0.8 s; never four-point stars).
//   Floaters (a duck, a buoy) take `floaterWater`: a thin dark contact lens at the waterline and their underside
//   mirrored as 2-3 tapered bars (R10, R11). `lod: 'far'` (R14) draws a far strip as flat bands, flecks and current
//   lines (no slices). Frame 0 (DIRECTION rule 9): the water lands as flat pale shapes and floods with the set.
// Motion (R12): the ramp, the masses, the quay and the glitter bed hold; only the bars' and blocks' sides sway on waves
// that travel toward the viewer, the ripple lines drift, the slivers twinkle. Deterministic: integer hashes and the
// frame time only (no Math.random, no clock). `waterProblems(spec)` is the lint; `waterPalette(spec)` the palette QA
// hook; `waterFrame(spec, t)` the pure per-frame build (node QA reads the same numbers the picture draws).
import React, {useId} from 'react';
import {Sky, fromOklch, mixOklab, oklabToHex, oklch, skyColorAt, toOklab, type SkySpec} from './sky';
import {fromLch, lch} from './light';
import {ALIVE_MAX} from './particles';

export type Pt = [number, number];
export type Poly = Pt[];

// ================================================================= small numbers (deterministic)

export const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
export const smooth = (a: number, b: number, v: number) => {
  const k = clamp01((v - a) / (b - a));
  return k * k * (3 - 2 * k);
};
/** A deterministic hash of integers to [0, 1) (murmur3's finaliser): every per-band, per-slot, per-cycle draw. */
export function hash01(...ks: number[]): number {
  let h = 0x2f6b9e1d;
  for (const k of ks) {
    h ^= Math.imul((k | 0) ^ 0x5bd1e995, 0x9e3779b1);
    h = Math.imul(h ^ (h >>> 15), 0x85ebca6b);
    h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35);
    h ^= h >>> 16;
  }
  return (h >>> 0) / 4294967296;
}
/** A string (or number) seed as a 31-bit integer (FNV-1a). */
export function seedOf(s: string | number): number {
  const str = String(s);
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 1) & 0x3fffffff;
}
/** Two hashes as one standard normal draw (Box-Muller), clamped to +-2.5. */
const gauss = (a: number, b: number) => Math.max(-2.5, Math.min(2.5, Math.sqrt(-2 * Math.log(Math.max(1e-6, a))) * Math.cos(2 * Math.PI * b)));
const r2 = (v: number) => (Math.round(v * 100) / 100).toString();

// ================================================================= the camera over the water (a level lens)

/** A level pinhole over flat water: the horizon (screen y), the focal length (px), the eye's height over the WATER (m). */
export type WaterCam = {horizon: number; f: number; eye: number};
/** Depth (m) of the water surface at screen y. */
export const camZ = (c: WaterCam, y: number): number => (c.f * c.eye) / Math.max(1e-6, y - c.horizon);
/** Screen y of the water surface at depth z (m). */
export const camY = (c: WaterCam, z: number): number => c.horizon + (c.f * c.eye) / Math.max(1e-6, z);
/** px per metre of DEPTH at screen y (a row's foreshortening). */
export const pxPerMDeep = (c: WaterCam, y: number): number => ((y - c.horizon) * (y - c.horizon)) / (c.f * c.eye);
/** px per metre ACROSS at screen y. */
export const pxPerMAcross = (c: WaterCam, y: number): number => (y - c.horizon) / c.eye;
/** A flat round ripple's height:width on screen at y. */
export const foreshorten = (c: WaterCam, y: number): number => (y - c.horizon) / c.f;
/** Fresnel reflectance of calm water (n 1.333, unpolarised) seen at screen y (R2). */
export function camFresnel(c: WaterCam, y: number, n = 1.333): number {
  const ti = Math.PI / 2 - Math.atan(Math.max(1e-6, y - c.horizon) / c.f);
  const tt = Math.asin(Math.sin(ti) / n);
  const rs = ((Math.cos(ti) - n * Math.cos(tt)) / (Math.cos(ti) + n * Math.cos(tt))) ** 2;
  const rp = ((Math.cos(tt) - n * Math.cos(ti)) / (Math.cos(tt) + n * Math.cos(ti))) ** 2;
  return (rs + rp) / 2;
}

// ================================================================= colour (CIE LCh for the tone, OKLCH for nudges)

/** CIE L*, C*, h of a hex colour (the house measures, lib/light). */
export const cie = (hex: string) => lch(hex);
/** The house NEVER bands (the playbook: never beige, muddy tan, olive or grey; research R4): '' when clean, else the
 *  band's name. Beige: h 55-95 at C* 6-18 under L* 86 (lighter, a low chroma reads as cream); olive: h 95-118 at C*
 *  6-30; grey: C* < 4 under L* 85. */
export function neverBand(hex: string): '' | 'beige' | 'olive' | 'grey' {
  const {L, C, h} = cie(hex);
  if (h >= 55 && h <= 95 && C < 18 && C >= 6 && L < 86) return 'beige';
  if (h > 95 && h <= 118 && C >= 6 && C < 30) return 'olive';
  if (C < 4 && L < 85) return 'grey';
  return '';
}
/** Nudge a colour out of the never bands, keeping its value: beige gets its warm chroma back, olive turns to the nearer
 *  warm or cool side, grey takes `hueIfGrey` (OKLCH deg) at a soft chroma. A clean colour is returned as it is. */
export function cleanColour(hex: string, hueIfGrey = 190): string {
  let out = hex;
  for (let i = 0; i < 12; i++) {
    const band = neverBand(out);
    if (!band) return out;
    const o = oklch(out);
    if (band === 'beige') out = fromOklch({l: o.l, c: o.c * 1.12 + 0.002, h: o.h - 2});
    else if (band === 'olive') out = fromOklch({l: o.l, c: o.c, h: o.h < 105 ? o.h - 6 : o.h + 10});
    else out = fromOklch({l: o.l, c: Math.max(o.c, 0.018), h: o.c < 0.004 ? hueIfGrey : o.h});
  }
  return out;
}
/** sRGB mix toward the paper (lib/Fill's pale state: the flood's frame-0 shapes). */
export function paleOf(hex: string, k: number, paper: string): string {
  const a = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  const b = [1, 3, 5].map((i) => parseInt(paper.slice(i, i + 2), 16));
  return '#' + a.map((v, i) => Math.round(v + (b[i] - v) * k).toString(16).padStart(2, '0')).join('').toUpperCase();
}
/** One flat value step of the water itself (a ripple line, a contact lens): dl (OKLab L) lighter or darker, its hue kept,
 *  its chroma scaled. */
export function waterStep(water: string, dl: number, ck = 1): string {
  const w = oklch(water);
  return cleanColour(fromOklch({l: w.l + dl, c: w.c * ck, h: w.h}), w.h);
}

/** How a reflection is toned (R3-R4): HUE FROM THE WATER, VALUE FROM THE WORLD, A LIGHT KEEPS ITS COLOUR. `body`: its L*
 *  moves toward the water's by k (lights a little darker, darks lighter) and it takes the water's own hue family at that
 *  value (deeper = a touch bluer and richer, lighter = a touch greener and paler), because the physical mix of a warm
 *  reflection into teal water is khaki in RGB; `light`: an emissive source (a lit door, a lamp): it stays light and
 *  rich (R7); `figure`: a person (k >= 0.6: environment, never a second subject, R5). `warmMemory` (0..1, an owner knob,
 *  OFF by default: research §5.6) lets a warm mass keep its hue family in the far steps at C* <= 12, turning from the
 *  water's teal through violet to mauve (never through khaki); use it only while the water stays >= 80 % cool. */
export type ToneKind = 'body' | 'light' | 'figure';
export type ToneOpts = {waterL: number; waterH: number; waterC: number; hueSlope: number; chromaSlope: number; cMin: number; cMax: number; warmMemory: number};
export const TONE_DEFAULT: ToneOpts = {waterL: 76, waterH: 182, waterC: 10, hueSlope: 0.9, chromaSlope: 0.32, cMin: 6.5, cMax: 16, warmMemory: 0};
const TONES = new Map<string, string>();
export function reflectTone(src: string, k: number, o: ToneOpts, kind: ToneKind = 'body', dL = 0): string {
  const key = `${src}|${k.toFixed(3)}|${kind}|${dL}|${o.waterL}|${o.waterH}|${o.waterC}|${o.hueSlope}|${o.chromaSlope}|${o.cMin}|${o.cMax}|${o.warmMemory}`;
  const hit = TONES.get(key);
  if (hit) return hit;
  const c = lch(src);
  const kk = kind === 'figure' ? Math.max(0.6, k) : k;
  const L = c.L + (o.waterL - c.L) * kk + dL;
  let out: string;
  if (kind === 'light') {
    out = fromLch(L, Math.max(35, c.C * 0.92), c.h - 4 * kk);
  } else {
    const d = o.waterL - L;
    let C = Math.max(o.cMin, Math.min(o.cMax, o.waterC + d * o.chromaSlope));
    let h = o.waterH + d * o.hueSlope;
    const warm = (c.h <= 110 || c.h >= 300) && c.C >= 8;
    const m = o.warmMemory > 0 && kind === 'body' && warm ? o.warmMemory * clamp01((0.6 - kk) / 0.2) : 0;
    if (m > 0) {
      // toward the source's own family turned to mauve, the long way round through violet (never through khaki)
      let target = (c.h - 25 + 360) % 360;
      if (target < h) target += 360;
      h = lerp(h, target, m) % 360;
      C = lerp(C, Math.min(12, c.C), m);
    }
    out = fromLch(L, C, h);
  }
  out = cleanColour(out, o.waterH);
  if (TONES.size > 8000) TONES.clear();
  TONES.set(key, out);
  return out;
}

// ================================================================= polygons and paths

/** Keep the part of a polygon at y >= yc (below) or y <= yc (above): one Sutherland-Hodgman pass. */
function clipHalf(p: Poly, yc: number, below: boolean): Poly {
  const out: Poly = [];
  const n = p.length;
  for (let i = 0; i < n; i++) {
    const a = p[i];
    const b = p[(i + 1) % n];
    const ia = below ? a[1] >= yc : a[1] <= yc;
    const ib = below ? b[1] >= yc : b[1] <= yc;
    if (ia) out.push(a);
    if (ia !== ib) {
      const k = (yc - a[1]) / (b[1] - a[1]);
      out.push([a[0] + (b[0] - a[0]) * k, yc]);
    }
  }
  return out;
}
/** The part of a polygon inside the horizontal band y0..y1 (null when empty). */
export function clipBand(p: Poly, y0: number, y1: number): Poly | null {
  const a = y0 > -1e8 ? clipHalf(p, y0, true) : p;
  if (a.length < 3) return null;
  const b = clipHalf(a, y1, false);
  return b.length < 3 ? null : b;
}
/** Where a polygon covers the level line y (even-odd), as sorted [x0, x1] intervals; runs closer than `merge` px join. */
export function intervalsAt(p: Poly, y: number, merge = 1.5): [number, number][] {
  const xs: number[] = [];
  const n = p.length;
  for (let i = 0; i < n; i++) {
    const a = p[i];
    const b = p[(i + 1) % n];
    if (a[1] <= y !== b[1] <= y) xs.push(a[0] + ((y - a[1]) / (b[1] - a[1])) * (b[0] - a[0]));
  }
  xs.sort((u, v) => u - v);
  const out: [number, number][] = [];
  for (let i = 0; i + 1 < xs.length; i += 2) {
    const last = out[out.length - 1];
    if (last && xs[i] - last[1] < merge) last[1] = Math.max(last[1], xs[i + 1]);
    else out.push([xs[i], xs[i + 1]]);
  }
  return out;
}
/** A polygon's bounding box. */
export function boxOf(p: Poly): {x0: number; x1: number; y0: number; y1: number} {
  let x0 = Infinity;
  let x1 = -Infinity;
  let y0 = Infinity;
  let y1 = -Infinity;
  for (const [x, y] of p) {
    if (x < x0) x0 = x;
    if (x > x1) x1 = x;
    if (y < y0) y0 = y;
    if (y > y1) y1 = y;
  }
  return {x0, x1, y0, y1};
}
/** Point in polygon (even-odd). */
export function inPoly(p: Poly, x: number, y: number): boolean {
  let inside = false;
  for (let i = 0, j = p.length - 1; i < p.length; j = i++) {
    const [xi, yi] = p[i];
    const [xj, yj] = p[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}
/** Subdivide a polygon's edges so no segment spans more than `dy` px in y (and `dx` in x, when given): the sway then
 *  bends its sides as smooth curves, and a mirror about a sloped line maps it exactly. */
export function densify(p: Poly, dy = 4, dx = Infinity): Poly {
  const out: Poly = [];
  const n = p.length;
  for (let i = 0; i < n; i++) {
    const a = p[i];
    const b = p[(i + 1) % n];
    out.push(a);
    const k = Math.max(Math.ceil(Math.abs(b[1] - a[1]) / dy), Number.isFinite(dx) ? Math.ceil(Math.abs(b[0] - a[0]) / dx) : 1, 1);
    for (let j = 1; j < k; j++) out.push([a[0] + ((b[0] - a[0]) * j) / k, a[1] + ((b[1] - a[1]) * j) / k]);
  }
  return out;
}
export const polyD = (p: Poly, dx = 0, dy = 0): string => {
  let d = '';
  for (let i = 0; i < p.length; i++) d += `${i ? 'L' : 'M'}${r2(p[i][0] + dx)} ${r2(p[i][1] + dy)}`;
  return d + 'Z';
};
/** A level LENS (a ripple line, a glitter lens, a contact lens): pointed ends, `h` thick at its middle. */
export function lensD(cx: number, cy: number, len: number, h: number): string {
  if (len < 0.6 || h < 0.15) return '';
  return `M${r2(cx - len / 2)} ${r2(cy)}Q${r2(cx)} ${r2(cy - h)} ${r2(cx + len / 2)} ${r2(cy)}Q${r2(cx)} ${r2(cy + h)} ${r2(cx - len / 2)} ${r2(cy)}Z`;
}
/** A level BAR with tapered ends (a reflection's slice): flat top and bottom, each end drawn to a point on the bar's mid
 *  line over `taper` px, a curve, never a square cut. The slice language of the whole water. */
export function barD(x0: number, x1: number, y0: number, y1: number, taperL: number, taperR = taperL): string {
  const w = x1 - x0;
  const h = y1 - y0;
  if (w < 0.8 || h < 0.3) return '';
  const tl = Math.min(Math.max(0.6, taperL), w * 0.45);
  const tr = Math.min(Math.max(0.6, taperR), w * 0.45);
  const ym = (y0 + y1) / 2;
  return (
    `M${r2(x0 + tl)} ${r2(y0)}L${r2(x1 - tr)} ${r2(y0)}` +
    `Q${r2(x1 - tr * 0.2)} ${r2(y0)} ${r2(x1)} ${r2(ym)}Q${r2(x1 - tr * 0.2)} ${r2(y1)} ${r2(x1 - tr)} ${r2(y1)}` +
    `L${r2(x0 + tl)} ${r2(y1)}` +
    `Q${r2(x0 + tl * 0.2)} ${r2(y1)} ${r2(x0)} ${r2(ym)}Q${r2(x0 + tl * 0.2)} ${r2(y0)} ${r2(x0 + tl)} ${r2(y0)}Z`
  );
}
/** A short vertical STUB whose far end is a dome (a bollard's reflection: its cap mirrored round, R10). */
export function stubD(x: number, y0: number, y1: number, w: number): string {
  const r = w / 2;
  const yc = Math.max(y0 + 1, y1 - r * 0.55);
  return `M${r2(x - r)} ${r2(y0)}L${r2(x + r)} ${r2(y0)}L${r2(x + r)} ${r2(yc)}Q${r2(x + r)} ${r2(y1)} ${r2(x)} ${r2(y1)}Q${r2(x - r)} ${r2(y1)} ${r2(x - r)} ${r2(yc)}Z`;
}
/** Points along a quadratic Bezier a -> c (control b), excluding a. */
export function quadPts(a: Pt, b: Pt, c: Pt, n = 8): Pt[] {
  const out: Pt[] = [];
  for (let i = 1; i <= n; i++) {
    const s = i / n;
    out.push([(1 - s) * (1 - s) * a[0] + 2 * s * (1 - s) * b[0] + s * s * c[0], (1 - s) * (1 - s) * a[1] + 2 * s * (1 - s) * b[1] + s * s * c[1]]);
  }
  return out;
}
/** An ellipse as a polygon. */
export const ellipsePoly = (cx: number, cy: number, rx: number, ry: number, n = 16): Poly =>
  Array.from({length: n}, (_, i) => [cx + rx * Math.cos((i / n) * 2 * Math.PI), cy + ry * Math.sin((i / n) * 2 * Math.PI)] as Pt);

// ================================================================= mirrors (R1)

/** The water surface right under a thing (its mirror axis): a level waterline (screen y); 'horizon' (things at
 *  infinity: the sky, the sun, far roofs); a straight receding quay y = a0 + s x (R1's affine map: S2's sloped
 *  quay); or a line that varies with x (a facade set back from a bending quay). */
export type Axis = number | 'horizon' | {a0: number; s: number} | {line: (x: number) => number};
export function axisY(axis: Axis, x: number, cam: WaterCam): number {
  if (typeof axis === 'number') return axis;
  if (axis === 'horizon') return cam.horizon;
  if ('line' in axis) return axis.line(x);
  return axis.a0 + axis.s * x;
}
const levelAxis = (axis: Axis) => typeof axis === 'number' || axis === 'horizon';
/** A thing's reflection under a level camera (R1): every point (x, y) shows at (x, 2 y_m(x) - y). Sloped or curved axes
 *  subdivide the thing's edges first (every 12 px), so its mirrored edges follow the axis exactly. */
export function mirrorPoly(p: Poly, axis: Axis, cam: WaterCam): Poly {
  const q = levelAxis(axis) ? p : densify(p, 12, 12);
  return q.map(([x, y]) => [x, 2 * axisY(axis, x, cam) - y] as Pt);
}
/** R1's affine mirror as an SVG transform, for a whole group about a straight receding quay y = a0 + s x. */
export const affineMirror = (a0: number, s: number): string => `matrix(1 ${r2(2 * s)} 0 -1 0 ${r2(2 * a0)})`;

// ================================================================= the grid: level bands spaced by perspective (R6)

/** The shared slice grid: band boundaries at equal real spacing `dz` (m) on the water, projected (thin far, thick near),
 *  each band's gap (its trough: the ramp shows through) a share of its pitch growing toward the viewer. Every
 *  reflection's bars and the glitter bed sit on it, so neighbouring reflections break on the same bands. */
export type Grid = {rows: number[]; gapK: [number, number]; yFar: number; yNear: number; minGap: number};
export function makeGrid(cam: WaterCam, o: {yTop: number; yBot: number; dz: number; minPitch: number; gap: [number, number]; yFar: number; yNear: number; minGap?: number}): Grid {
  const rows: number[] = [o.yTop];
  let y = o.yTop;
  for (let i = 0; y < o.yBot && i < 600; i++) {
    y += Math.max(o.minPitch, pxPerMDeep(cam, y) * o.dz);
    rows.push(y);
  }
  return {rows, gapK: o.gap, yFar: o.yFar, yNear: o.yNear, minGap: o.minGap ?? 0.8};
}
/** A band's gap (px) at its top. */
export const gapOf = (g: Grid, ya: number, yb: number): number => Math.max(g.minGap, (yb - ya) * lerp(g.gapK[0], g.gapK[1], clamp01(((ya + yb) / 2 - g.yFar) / (g.yNear - g.yFar))));
/** The grid boundary nearest to y. */
export function snapRow(g: Grid, y: number): number {
  let best = g.rows[0];
  for (const r of g.rows) if (Math.abs(r - y) < Math.abs(best - y)) best = r;
  return best;
}

// ================================================================= motion: the travelling sway (R6, R12)

/** The water's calm motion: every level of the water slides sideways on a sum of waves whose phase travels TOWARD the
 *  viewer at real wave speeds (lambda / period m/s), the amplitude growing with nearness (amp[0] px at the far edge ->
 *  amp[1] at the near edge). Continuous in y: a block's side bends as one smooth curve, a bar slides with its band. */
export type Sway = {amp: [number, number]; waves: {lambda: number; period: number; w: number}[]};
export const SWAY_DEFAULT: Sway = {
  amp: [1.5, 4.4],
  waves: [
    {lambda: 2.2, period: 5.0, w: 0.7},
    {lambda: 1.4, period: 3.6, w: 0.3},
  ],
};
export function swayAt(cam: WaterCam, s: Sway, yFar: number, yNear: number, seed: number, y: number, t: number): number {
  const n = clamp01((y - yFar) / (yNear - yFar));
  const A = lerp(s.amp[0], s.amp[1], Math.pow(n, 1.1));
  const z = camZ(cam, Math.max(cam.horizon + 4, y));
  let v = 0;
  for (let j = 0; j < s.waves.length; j++) {
    const w = s.waves[j];
    v += w.w * Math.sin((2 * Math.PI * z) / w.lambda + (2 * Math.PI * t) / w.period + 2 * Math.PI * hash01(seed, 900 + j));
  }
  return A * v;
}

// ================================================================= the open water: the shot's sky, mirrored and toned

/** THE ONE ALLOWED GRADIENT (DIRECTION rule 6's water exception): the shot's own sky seen in the water. The water at
 *  screen y mirrors the sky at 2 hz - y (R1), its value toned a little darker toward the viewer (R3); from the middle
 *  water on it is pulled toward the water's own teal (R2: the near water shows its body) in OKLab, through a light veil
 *  of the body's hue, where the sky is already light: the crossing stays light, never khaki or grey (R4). Defaults are
 *  S1's (the judged candidate A); n runs 0 at `yFar` (the far edge) -> 1 at `yNear` (our edge). */
export type RampOpts = {
  /** The far edge and the near edge of the water (screen y) for the toning's n. */
  yFar: number;
  yNear: number;
  /** The sky column it mirrors (x; undefined = the sky away from its sun warmth). */
  skyX?: number;
  /** The sky's value toned darker toward us: OKLab L - (dl[0] + dl[1] n). */
  dl?: [number, number];
  /** The sky's chroma kept: c x (ck[0] - ck[1] n). */
  ck?: [number, number];
  /** The veil: the body's hue at the body's L + veil.l, chroma veil.c; mixed in over n veilAt[0] -> veilAt[1]. */
  veil?: {l: number; c: number};
  veilAt?: [number, number];
  /** The body mixed in over n bodyAt[0] -> bodyAt[1], up to bodyAt[2]. */
  bodyAt?: [number, number, number];
  /** Keys every `step` px over the water's box. */
  step?: number;
};
export const RAMP_DEFAULT = {dl: [0.02, 0.015] as [number, number], ck: [0.95, 0.1] as [number, number], veil: {l: 0.085, c: 0.018}, veilAt: [0.1, 0.4] as [number, number], bodyAt: [0.32, 0.86, 0.92] as [number, number, number], step: 16};
export function rampColour(cam: WaterCam, sky: SkySpec, body: string, o: RampOpts, y: number): string {
  const dl = o.dl ?? RAMP_DEFAULT.dl;
  const ck = o.ck ?? RAMP_DEFAULT.ck;
  const veilO = o.veil ?? RAMP_DEFAULT.veil;
  const va = o.veilAt ?? RAMP_DEFAULT.veilAt;
  const ba = o.bodyAt ?? RAMP_DEFAULT.bodyAt;
  const s = oklch(skyColorAt(sky, 2 * cam.horizon - y, o.skyX));
  const n = (y - o.yFar) / (o.yNear - o.yFar);
  const nn = clamp01(n);
  const skyL = toOklab({l: s.l - dl[0] - dl[1] * nn, c: s.c * (ck[0] - ck[1] * nn), h: s.h});
  const b = oklch(body);
  const veil = toOklab({l: b.l + veilO.l, c: veilO.c, h: b.h});
  const a = smooth(va[0], va[1], n);
  const bb = smooth(ba[0], ba[1], n);
  return cleanColour(oklabToHex(mixOklab(mixOklab(skyL, veil, a), toOklab(body), bb * ba[2])), b.h);
}
/** The ramp as a lib/sky spec over the water's box (its eased curve and blue-noise dither). */
export function waterRamp(cam: WaterCam, sky: SkySpec, body: string, o: RampOpts, box: {x0: number; x1: number; top: number; bottom: number}): SkySpec {
  const step = o.step ?? RAMP_DEFAULT.step;
  const keys: {y: number; color: string}[] = [];
  for (let y = box.top; y <= box.bottom + step - 1e-6; y += step) keys.push({y, color: rampColour(cam, sky, body, o, y)});
  return {keys, band: null, x: box.x0, width: box.x1 - box.x0, top: box.top, bottom: box.bottom, sun: null};
}

// ================================================================= the spec

/** One thing over the water, and how its reflection is drawn. */
export type WaterSource = {
  /** A stable id (its bars' static breaks are seeded by it). */
  id: string;
  /** The THING as it stands on screen (px at the camera's rest) and the waterline it mirrors about (R1) ... */
  thing?: Poly;
  axis?: Axis;
  /** ... or its reflection polygon directly (already mirrored: a contact band, a hand-shaped light column). */
  refl?: Poly;
  /** Its on-screen colour (what the clean pen shows): the reflection is toned from it. */
  color: string;
  kind?: ToneKind;
  /** Higher = nearer, drawn later. */
  layer: number;
  /** The parallax plane whose float it rides (the shot's `float`). */
  plane: number;
  /** 'mass' (a solid block, then bars: the default), 'crisp' (one flat band: a contact band; no bars, no sway),
   *  'stub' (a dome-ended vertical from the waterline: a bollard's reflection). */
  draw?: 'mass' | 'crisp' | 'stub';
  /** The share of its VISIBLE length drawn as the solid block (>= 0.55, default 0.6): the rest is bars. */
  solid?: number;
  /** 0..1: how readily a bar breaks (once at most, static, only in the last half; a post 0, a facade ~0.5). */
  breakup?: number;
  /** 0..0.4: how far the bars pull in toward its end (a smooth envelope). */
  narrow?: number;
  /** Bar ends' taper (px at a 6 px band; it scales with the pitch). */
  taper?: number;
  /** Sway multiplier (1 = the water's; 0 = still). */
  sway?: number;
  /** A value step from another source's tone (CIE L*, signed: negative = darker), kept at every ladder step: an arch's
   *  soffit bowl under its voussoir ring (G7), so the ellipse closes with a clear step. */
  sep?: {from: string; dL: number};
  /** A fixed shift of its toned L* (CIE). */
  dL?: number;
  /** Far LOD only: draw it, or leave it to the ramp. */
  far?: boolean;
};
/** The sun's glitter column (R8; CRAFT §f.6's glints are its slivers). */
export type WaterSun = {
  /** The sun on screen (its disc's centre). */
  x: number;
  y: number;
  /** The water's max wave slope (rad; calm 0.05-0.08). */
  slope?: number;
  /** The column's y range (default the water's at the sun's x). */
  rows?: [number, number];
  /** The bed's gold and the slivers' warm white (default L* 82 C* 34 h 74 / L* 97.5 C* 7 h 85: the slivers +15 over the
   *  bed, CRAFT §f.6). */
  bed?: string;
  core?: string;
  /** Slivers are born from t0 (after the frame-0 flood). */
  t0?: number;
  /** Sliver slots (<= 6: 4-6 alive, CRAFT §f.6), lives (s), lengths (px, 20-36). */
  slots?: number;
  life?: [number, number];
  len?: [number, number];
  /** Where it is densest (default the sun's still-water mirror point, 2 hz - y) and the spread (px). */
  mirrorY?: number;
  sigma?: number;
  /** The plane it rides (the sun's). */
  plane?: number;
};
/** Ripple lines (R9). */
export type WaterRipples = {
  slots: number;
  /** Where they may start: x range, y range, boxes [x0, y0, x1, y1] they never touch (the glitter, the mascot's seat). */
  x: [number, number];
  y: [number, number];
  avoid?: [number, number, number, number][];
  /** Length (px) far -> near, thickness, drift (px/s, + = right) far -> near, life (s). */
  len: [number, number];
  thick: [number, number];
  drift: [number, number];
  life: [number, number];
  t0: number;
  /** Tone steps (OKLab L) on the water's own colour: a crest (light) and a trough (dark). */
  crest?: number;
  trough?: number;
};
export type WaterSpec = {
  /** A name (the lint's messages) and the seed every hash mixes in. */
  id: string;
  seed?: string | number;
  cam: WaterCam;
  /** The visible water: its far and near edges as functions of x (screen px at rest), x range, tucks under the banks. */
  region: {top: (x: number) => number; bottom: (x: number) => number; x0: number; x1: number; tuckTop?: number; tuckBottom?: number; step?: number};
  /** The shot's own lib/sky preset (mirrored: the ramp) and its air (the far haze, for the record). */
  sky: SkySpec;
  air?: string;
  /** The water's own colour (what the near water shows: R2). */
  body: string;
  /** The rig's water tint (a multiply: bank shades on the water, R10) and the shades it lays (closed paths). */
  tint?: string;
  shades?: string[];
  /** The tier (CRAFT §b): the water is environment (no outlines). */
  tier?: 'environment' | 'support';
  ramp: RampOpts;
  tone?: Partial<ToneOpts>;
  /** The Fresnel ladder: k far -> near over the water's y, in flat steps (default 0.40 -> 0.72 in steps of 0.05). */
  ladder?: {k: [number, number]; y?: [number, number]; step?: number};
  /** The grid (default dz 0.45 m, pitch >= 3 px, gap 16 -> 26 % of the pitch). Bars start only where a band is at
   *  least `barPitch` px (default 7: the far water is a near-perfect mirror, R2, so a far reflection stays whole); a gap
   *  inside a reflection is a TROUGH, tone-on-tone: the bar's own tone mixed `gapMix` (default 0.4) toward the open
   *  water there (a light line across a reflection is a ripple line's job, few and placed: R9). */
  grid?: {dz?: number; minPitch?: number; gap?: [number, number]; barPitch?: number; gapMix?: number};
  /** Reflection layers from this one on (the quay, the boats) draw over the glitter (default 30). */
  quayLayer?: number;
  sway?: Sway;
  sources: WaterSource[];
  /** Reflections of things that move (people walking, a door sliding, a bus): rebuilt every frame. */
  moving?: (t: number) => WaterSource[];
  sun?: WaterSun;
  ripples?: WaterRipples;
  /** The shot's parallax float per plane, as the counter-shift INSIDE the water's own plane group, and the sky's plane
   *  (the ramp holds still on screen: the sky is at infinity). */
  float?: (plane: number, t: number) => Pt;
  skyPlane?: number;
  /** Frame 0 (DIRECTION rule 9): before the flood front reaches it the water is flat pale shapes. */
  flood?: {origin: Pt; t0: number; speed: number; pale: number; paper: string};
  /** The shot's joins (scene s): nothing new is born in the 0.4 s around one (steady fields keep their pace). */
  joins?: number[];
  /** 'far' (R14): a far strip under ~2 px rows: flat bands, flecks, current lines, no slices. */
  lod?: 'near' | 'far';
  /** Far LOD: flecks (count, length px) and current lines (count). */
  farLod?: {flecks?: number; fleckLen?: [number, number]; lines?: number};
};

// ================================================================= the static part of a spec (built once per spec)

type Resolved = WaterSource & {
  p: Poly;
  box: {x0: number; x1: number; y0: number; y1: number};
  /** The block's bottom (static: snapped to the grid) and the visible end the envelope runs to. */
  ySolid: number;
  yEnd: number;
  sd: number;
};
type Static = {
  spec: WaterSpec;
  seed: number;
  tone: ToneOpts;
  grid: Grid;
  ramp: SkySpec;
  regionD: string;
  regionPoly: Poly;
  box: {x0: number; x1: number; top: number; bottom: number};
  srcs: Resolved[];
  byId: Map<string, Resolved>;
  ladder: {k: [number, number]; y: [number, number]; step: number};
  sway: Sway;
  /** Bars start at or below this y (the first band of barPitch px). */
  yBarMin: number;
  gapMix: number;
  bed: GlitterLens[];
  sunPlane: number;
  floodEnd: number;
  pale: {color: string; d: string}[];
  paleBase: string;
};
export type GlitterLens = {cx: number; cy: number; len: number; h: number; band: number};

const STATIC = new WeakMap<WaterSpec, Static>();

/** The region polygon (screen px at rest, with its tucks). */
export function regionPoly(r: WaterSpec['region']): Poly {
  const step = r.step ?? 10;
  const top: Pt[] = [];
  const bot: Pt[] = [];
  for (let x = r.x0; x <= r.x1 + 1e-6; x += step) {
    top.push([x, r.top(x) - (r.tuckTop ?? 4)]);
    bot.push([x, r.bottom(x) + (r.tuckBottom ?? 20)]);
  }
  return [...top, ...bot.reverse()];
}

function resolveSource(s: WaterSource, cam: WaterCam, grid: Grid, region: WaterSpec['region'], moving: boolean, yBarMin: number): Resolved {
  const p = s.refl ?? (s.thing && s.axis !== undefined ? mirrorPoly(s.thing, s.axis, cam) : []);
  const box = boxOf(p);
  // the visible length: from its top (or the water's far edge) to the near edge under its middle (or its own end)
  const xc = Math.max(region.x0, Math.min(region.x1, (box.x0 + box.x1) / 2));
  const top = Math.max(box.y0, region.top(xc));
  const yEnd = Math.min(box.y1, region.bottom(xc) + 4);
  const k = Math.max(0.55, s.solid ?? 0.6);
  const raw = Math.max(top + Math.max(0, yEnd - top) * k, yBarMin);
  const ySolid = moving ? raw : snapRow(grid, raw);
  return {...s, p, box, ySolid, yEnd: Math.max(yEnd, ySolid + 1), sd: seedOf(s.id)};
}

export function waterStatic(spec: WaterSpec): Static {
  const hit = STATIC.get(spec);
  if (hit) return hit;
  const seed = seedOf(spec.seed ?? spec.id);
  const tone: ToneOpts = {...TONE_DEFAULT, ...(spec.tone ?? {})};
  const rp = regionPoly(spec.region);
  const rb = boxOf(rp);
  const box = {x0: rb.x0 - 20, x1: rb.x1 + 20, top: Math.floor(rb.y0) - 6, bottom: Math.ceil(rb.y1) + 6};
  const g = spec.grid ?? {};
  const grid = makeGrid(spec.cam, {yTop: box.top, yBot: box.bottom + 40, dz: g.dz ?? 0.45, minPitch: g.minPitch ?? 3, gap: g.gap ?? [0.16, 0.26], yFar: spec.ramp.yFar, yNear: spec.ramp.yNear});
  const ramp = waterRamp(spec.cam, spec.sky, spec.body, spec.ramp, box);
  const barPitch = g.barPitch ?? 7;
  let yBarMin = grid.rows[grid.rows.length - 1];
  for (let i = 0; i + 1 < grid.rows.length; i++)
    if (grid.rows[i + 1] - grid.rows[i] >= barPitch - 1e-9) {
      yBarMin = grid.rows[i];
      break;
    }
  const srcs = spec.sources.map((s) => resolveSource(s, spec.cam, grid, spec.region, false, yBarMin));
  const byId = new Map(srcs.map((s) => [s.id, s] as [string, Resolved]));
  const ladder = {k: spec.ladder?.k ?? ([0.4, 0.72] as [number, number]), y: spec.ladder?.y ?? ([spec.ramp.yFar, spec.ramp.yNear] as [number, number]), step: spec.ladder?.step ?? 0.05};
  const sway = spec.sway ?? SWAY_DEFAULT;
  const st: Static = {spec, seed, tone, grid, ramp, regionD: polyD(rp), regionPoly: rp, box, srcs, byId, ladder, sway, yBarMin, gapMix: g.gapMix ?? 0.4, bed: [], sunPlane: spec.sun?.plane ?? 0, floodEnd: 0, pale: [], paleBase: ''};
  st.bed = spec.sun && spec.lod !== 'far' ? glitterBed(st) : [];
  if (spec.flood) {
    const f = spec.flood;
    let r = 0;
    for (const [x, y] of [[box.x0, box.top], [box.x1, box.top], [box.x0, box.bottom], [box.x1, box.bottom]] as Pt[]) r = Math.max(r, Math.hypot(x - f.origin[0], y - f.origin[1]));
    st.floodEnd = f.t0 + r / f.speed;
    // frame 0: the reflections as flat pale shapes (whole, unsliced, in z-order) on a flat pale water
    const acc = new Map<string, {layer: number; color: string; parts: string[]}>();
    for (const s of srcs.slice().sort((a, b) => a.layer - b.layer)) {
      if (!s.p.length) continue;
      const color = paleOf(toneOf(st, s, 0.45), f.pale, f.paper);
      const key = `${s.layer}|${color}`;
      let a = acc.get(key);
      if (!a) acc.set(key, (a = {layer: s.layer, color, parts: []}));
      a.parts.push(s.draw === 'stub' ? stubOf(s, 0) : polyD(s.p));
    }
    st.pale = Array.from(acc.values())
      .sort((a, b) => a.layer - b.layer)
      .map((a) => ({color: a.color, d: a.parts.join('')}));
    st.paleBase = paleOf(skyColorAt(ramp, lerp(spec.ramp.yFar, spec.ramp.yNear, 0.4)), f.pale, f.paper);
  }
  STATIC.set(spec, st);
  return st;
}

/** The Fresnel ladder's k at screen y (flat steps). */
function kAt(st: Static, y: number): number {
  const {k, y: yy, step} = st.ladder;
  const v = lerp(k[0], k[1], clamp01((y - yy[0]) / (yy[1] - yy[0])));
  return Math.round(v / step) * step;
}
/** A source's tone at ladder step k (its value step from another source kept: `sep`). */
function toneOf(st: Static, s: WaterSource, k: number): string {
  let c = reflectTone(s.color, k, st.tone, s.kind ?? 'body', s.dL ?? 0);
  if (s.sep) {
    const o = st.byId.get(s.sep.from);
    if (o) {
      const oc = reflectTone(o.color, k, st.tone, o.kind ?? 'body', o.dL ?? 0);
      const L0 = lch(oc).L;
      const L1 = lch(c).L;
      const want = s.sep.dL;
      const have = L1 - L0;
      if (want < 0 ? have > want : have < want) c = reflectTone(s.color, k, st.tone, s.kind ?? 'body', (s.dL ?? 0) + (want - have));
    }
  }
  return c;
}

// ================================================================= the mass builder (G1: a solid block, then bars)

type Runs = Map<string, {layer: number; color: string; parts: string[]}>;
const pushRun = (out: Runs, layer: number, color: string, d: string) => {
  if (!d) return;
  const key = `${layer}|${color}`;
  const a = out.get(key);
  if (a) a.parts.push(d);
  else out.set(key, {layer, color, parts: [d]});
};

type FrameCtx = {st: Static; t: number; sway: (y: number) => number; shift: (plane: number) => Pt};

/** A bollard-like stub from the waterline: x at its middle, its far end the reflection's end. */
function stubOf(s: Resolved, dx: number, sx = 0, sy = 0): string {
  const w = (s.box.x1 - s.box.x0) * 0.84;
  const x = (s.box.x0 + s.box.x1) / 2 + sx + dx;
  return stubD(x, s.box.y0 + sy - 4, s.box.y1 + sy, w);
}

function buildMass(s: Resolved, ctx: FrameCtx, out: Runs, moving: boolean): void {
  if (s.p.length < 3) return;
  const {st} = ctx;
  const [sx, sy] = ctx.shift(s.plane);
  const k = s.sway ?? 1;
  if (s.draw === 'stub') {
    pushRun(out, s.layer, toneOf(st, s, kAt(st, s.box.y0 + 6)), stubOf(s, ctx.sway(s.box.y1) * 0.6 * k, sx, sy));
    return;
  }
  if (s.draw === 'crisp') {
    pushRun(out, s.layer, toneOf(st, s, kAt(st, s.box.y0)), polyD(s.p, sx, sy));
    return;
  }
  const p = sx || sy ? s.p.map(([x, y]) => [x + sx, y + sy] as Pt) : s.p;
  // ---- the solid block: the reflection itself down to ySolid, its sides bent by the sway (one smooth closed shape)
  const block = clipBand(p, -1e9, s.ySolid);
  if (block) {
    const dense = densify(block, 4);
    const top = Math.max(s.box.y0 + sy, st.spec.region.top((s.box.x0 + s.box.x1) / 2));
    const kb = kAt(st, lerp(top, s.ySolid, 0.3));
    pushRun(out, s.layer, toneOf(st, s, kb), polyD(dense.map(([x, y]) => [x + ctx.sway(y) * k, y] as Pt)));
  }
  // ---- the bars: one per band below the block, on the shared grid; the reflection narrows along a smooth envelope
  // (a touch of seeded asymmetry), a band breaks once at most and only in its last half, the very last may drop
  const rows = st.grid.rows;
  const brk = moving ? Math.min(s.breakup ?? 0.45, 0.0001) : s.breakup ?? 0.45;
  const narrow = s.narrow ?? 0.18;
  const taperBase = s.taper ?? 3;
  const span = Math.max(1, s.yEnd - s.ySolid);
  const yMax = s.box.y1 + sy;
  for (let i = 0; i + 1 < rows.length; i++) {
    const ya = rows[i];
    const yb = rows[i + 1];
    if (ya < s.ySolid - 0.01) continue;
    if (ya >= yMax || ya > s.yEnd + 2) break;
    const topY = ya + gapOf(st.grid, ya, yb);
    const bot = Math.min(yb, yMax);
    if (bot - topY < 0.8) continue;
    const ym = (topY + bot) / 2;
    const u = clamp01((ym - s.ySolid) / span); // 0 at the block .. 1 at the reflection's visible end
    const sd = s.sd;
    const asym = 2 * hash01(st.seed, sd, i, 1) - 1;
    const jit = hash01(st.seed, sd, i, 2);
    const pbreak = hash01(st.seed, sd, i, 3);
    const at = hash01(st.seed, sd, i, 4);
    const drop = hash01(st.seed, sd, i, 5);
    if (!moving && u > 0.82 && drop < 0.35) continue;
    const pitch = yb - ya;
    const kk = kAt(st, ym);
    const col = toneOf(st, s, kk);
    const dx = ctx.sway(ym) * k;
    for (const [x0r, x1r] of intervalsAt(p, ym)) {
      const w = x1r - x0r;
      const inset = narrow * w * Math.pow(u, 1.5) * (0.85 + 0.3 * jit);
      const x0 = x0r + inset * (1 + 0.25 * asym);
      const x1 = x1r - inset * (1 - 0.25 * asym);
      if (x1 - x0 < 3) continue;
      const taper = Math.min(taperBase * (0.6 + pitch / 10), (x1 - x0) * 0.4);
      if (brk > 0.001 && u > 0.45 && x1 - x0 > 60 && pbreak < brk * (u - 0.3) * 1.6) {
        const g0 = Math.max(6, pitch * (1 + 1.4 * u));
        const xb = x0 + (x1 - x0) * (0.25 + 0.5 * at);
        if (xb - g0 / 2 - x0 >= 3) pushRun(out, s.layer, col, barD(x0 + dx, xb - g0 / 2 + dx, topY, bot, taper, Math.min(taper, (xb - g0 / 2 - x0) * 0.4)));
        if (x1 - xb - g0 / 2 >= 3) pushRun(out, s.layer, col, barD(xb + g0 / 2 + dx, x1 + dx, topY, bot, Math.min(taper, (x1 - xb - g0 / 2) * 0.4), taper));
      } else pushRun(out, s.layer, col, barD(x0 + dx, x1 + dx, topY, bot, taper, taper));
    }
  }
}

/** Far LOD (R14): a reflection as one flat shape at its far tone (no bars, no sway). */
function buildFlat(s: Resolved, ctx: FrameCtx, out: Runs): void {
  if (s.p.length < 3 || s.far === false) return;
  const [sx, sy] = ctx.shift(s.plane);
  pushRun(out, s.layer, toneOf(ctx.st, s, kAt(ctx.st, s.box.y0)), s.draw === 'stub' ? stubOf(s, 0, sx, sy) : polyD(s.p, sx, sy));
}

// ================================================================= the sun's glitter (G2: a still bed, nested slivers)

const SUN_DEFAULT = {slope: 0.06, bed: fromLch(82, 34, 74), core: fromLch(97.5, 7, 85), t0: 0.3, slots: 6, life: [0.42, 0.9] as [number, number], len: [20, 34] as [number, number], sigma: 22};
/** The column's half-width at screen y (R8, DERIVED for a level camera): a (y - hz) + f a sin(e), e the sun's elevation. */
export function glitterHalfW(cam: WaterCam, sun: WaterSun, y: number): number {
  const a = sun.slope ?? SUN_DEFAULT.slope;
  const e = Math.atan(Math.max(0, cam.horizon - sun.y) / cam.f);
  return a * Math.max(0, y - cam.horizon) + cam.f * a * Math.sin(e);
}
function sunRows(st: Static): [number, number] {
  const s = st.spec.sun!;
  return s.rows ?? [st.spec.region.top(s.x) + 4, st.spec.region.bottom(s.x) + 2];
}
/** THE BED: one still gold lens per band of the grid inside the column (its length follows the column's envelope,
 *  longest round the sun's mirror point); a few bands left out (static: the column reads broken, never a ladder). */
function glitterBed(st: Static): GlitterLens[] {
  const s = st.spec.sun!;
  const [y0, y1] = sunRows(st);
  const peak = s.mirrorY ?? 2 * st.spec.cam.horizon - s.y;
  const rows = st.grid.rows;
  const out: GlitterLens[] = [];
  for (let i = 0; i + 1 < rows.length; i++) {
    const ya = rows[i];
    const yb = rows[i + 1];
    if (ya < y0 || yb > y1 + 2) continue;
    const keep = hash01(st.seed, 7001, i, 1);
    const len = hash01(st.seed, 7001, i, 2);
    const off = hash01(st.seed, 7001, i, 3);
    const u = clamp01((ya - y0) / Math.max(1, y1 - y0));
    const nearPeak = clamp01(1 - Math.abs((ya + yb) / 2 - peak) / ((y1 - y0) * 0.6));
    if (keep < 0.16 - 0.12 * nearPeak) continue;
    const top = ya + gapOf(st.grid, ya, yb);
    const hw = glitterHalfW(st.spec.cam, s, (top + yb) / 2) * (0.52 + 0.4 * len + 0.26 * nearPeak);
    out.push({cx: s.x + (off - 0.5) * lerp(5, 12, u), cy: (top + yb) / 2, len: hw * 2, h: (yb - top) * 0.92, band: i});
  }
  return out;
}
export type Sliver = {x: number; y: number; len: number; h: number; lens: number};
/** THE SLIVERS at t: `slots` warm-white lenses nested in the bed's longer lenses (each slot owns its own lenses, so two
 *  never share one), each living `life` s (lit 62-86 % of it), growing in and shrinking out along its length (never a
 *  fade), densest round the sun's mirror point. Born from t0. */
export function glitterSlivers(st: Static, t: number): Sliver[] {
  const s = st.spec.sun;
  if (!s || st.spec.lod === 'far') return [];
  const t0 = s.t0 ?? SUN_DEFAULT.t0;
  if (t < t0) return [];
  const slots = Math.min(6, s.slots ?? SUN_DEFAULT.slots);
  const life = s.life ?? SUN_DEFAULT.life;
  const len = s.len ?? SUN_DEFAULT.len;
  const peak = s.mirrorY ?? 2 * st.spec.cam.horizon - s.y;
  const sigma = s.sigma ?? SUN_DEFAULT.sigma;
  // the lenses long enough to hold a sliver, by nearness to the mirror point; slot j owns ranks j, j + slots, ...
  const long = st.bed
    .map((b, i) => ({b, i}))
    .filter((o) => o.b.len >= len[0] / 0.8)
    .sort((a, c) => Math.abs(a.b.cy - peak) - Math.abs(c.b.cy - peak));
  const out: Sliver[] = [];
  for (let j = 0; j < slots; j++) {
    const own = long.filter((_, r) => r % slots === j);
    if (!own.length) continue;
    const P = lerp(life[0], life[1], hash01(st.seed, 7100, j, 1));
    const u = (t - t0) / P - hash01(st.seed, 7100, j, 2);
    if (u < 0) continue;
    const cyc = Math.floor(u);
    const tau = u - cyc;
    const lifeK = lerp(0.62, 0.86, hash01(st.seed, 7100, j, 3, cyc));
    if (tau > lifeK) continue;
    const env = Math.pow(Math.sin((Math.PI * tau) / lifeK), 0.6);
    // which of its lenses this cycle: weighted toward the mirror point (a normal draw in y, the nearest lens)
    const yv = peak + sigma * gauss(hash01(st.seed, 7100, j, 4, cyc), hash01(st.seed, 7100, j, 5, cyc));
    let pick = own[0];
    for (const o of own) if (Math.abs(o.b.cy - yv) < Math.abs(pick.b.cy - yv)) pick = o;
    const b = pick.b;
    const L0 = Math.min(len[1], b.len * 0.8) * lerp(0.82, 1, hash01(st.seed, 7100, j, 6, cyc));
    const L = Math.max(len[0], L0) * env;
    if (L < 2) continue;
    const room = Math.max(0, b.len - Math.max(len[0], L0)) / 2;
    const x = b.cx + room * (2 * hash01(st.seed, 7100, j, 7, cyc) - 1) * 0.8;
    out.push({x, y: b.cy, len: L, h: Math.min(b.h * 0.62, Math.max(1.6, L / 8.5)), lens: pick.i});
  }
  return out;
}

// ================================================================= ripple lines (G3)

export type RippleLine = {x: number; y: number; len: number; h: number; tone: 1 | -1};
/** Ripple lines at t: `slots` lenses, each living `life` s (growing in along its length, holding, shrinking out: never a
 *  fade) at a new spot each cycle, drifting with the breeze; every spot keeps clear of the avoid boxes over its whole
 *  drift, and of the water's edges. The tone is decided by what lies under its middle: a light crest across a
 *  reflection, a darker trough across the open water (R9). */
export function ripplesAt(st: Static, t: number, under: (x: number, y: number) => boolean): RippleLine[] {
  const rp = st.spec.ripples;
  const out: RippleLine[] = [];
  if (!rp || st.spec.lod === 'far' || t < rp.t0) return out;
  const reg = st.spec.region;
  for (let s = 0; s < rp.slots; s++) {
    let tb = rp.t0 - lerp(0, rp.life[1], hash01(st.seed, 7300, s));
    for (let n = 0; n < 400; n++) {
      const life = lerp(rp.life[0], rp.life[1], hash01(st.seed, 7300, s, n, 1));
      if (t < tb) break;
      if (t < tb + life) {
        let ok = false;
        let x = 0;
        let y = 0;
        let L = 0;
        let v = 0;
        for (let tries = 0; tries < 10 && !ok; tries++) {
          y = lerp(rp.y[0], rp.y[1], Math.sqrt(hash01(st.seed, 7300, s, n, 2, tries)));
          x = lerp(rp.x[0], rp.x[1], hash01(st.seed, 7300, s, n, 3, tries));
          const near = clamp01((y - rp.y[0]) / (rp.y[1] - rp.y[0]));
          L = lerp(rp.len[0], rp.len[1], near) * lerp(0.75, 1.15, hash01(st.seed, 7300, s, n, 4));
          v = lerp(rp.drift[0], rp.drift[1], near);
          const xe = x + v * life;
          const lo = Math.min(x, xe) - L / 2;
          const hi = Math.max(x, xe) + L / 2;
          ok = !(rp.avoid ?? []).some(([a, b, c, d]) => hi >= a && lo <= c && y >= b - 3 && y <= d + 3);
          if (ok) ok = [lo, (lo + hi) / 2, hi].every((xx) => y > reg.top(xx) + 6 && y < reg.bottom(xx) - 3);
        }
        if (!ok) break;
        const q = (t - tb) / life;
        const grow = q < 0.3 ? q / 0.3 : q > 0.7 ? (1 - q) / 0.3 : 1;
        const g = grow * grow * (3 - 2 * grow);
        const near = clamp01((y - rp.y[0]) / (rp.y[1] - rp.y[0]));
        const len = L * g;
        const h = lerp(rp.thick[0], rp.thick[1], near) * lerp(0.85, 1.1, hash01(st.seed, 7300, s, n, 5)) * (0.55 + 0.45 * g);
        const xc = x + v * (t - tb);
        if (len >= 2) out.push({x: xc, y, len, h, tone: under(xc, y) ? 1 : -1});
        break;
      }
      tb += life + lerp(0.2, 1.2, hash01(st.seed, 7300, s, n, 6));
    }
  }
  return out;
}

// ================================================================= floaters (G5: the contact and the mirrored underside)

/** A floating thing's water (a duck, a buoy): a thin dark contact lens along its waterline (R10: the deepest value of
 *  its own reflection) and its underside mirrored as 2-3 tapered bars, toned like every reflection (k at its
 *  waterline). `len` its body's length, `color` its on-screen colour, `sway` the water's sway there (px). */
export function floaterWater(o: {x: number; y: number; len: number; color: string; k: number; tone?: Partial<ToneOpts>; sway?: number; bars?: 2 | 3}): {refl: string; reflColor: string; contact: string; contactColor: string} {
  const s = o.len;
  const sw = o.sway ?? 0;
  const tone = {...TONE_DEFAULT, ...(o.tone ?? {})};
  const bars: [number, number, number, number, number][] = [
    [-0.5, 0.5, 1.2, 6.2, 6],
    [-0.36, 0.4, 7.4, 10.4, 5],
    [-0.18, 0.22, 11.6, 13.6, 3],
  ];
  const n = o.bars ?? 3;
  const refl = bars
    .slice(0, n)
    .map(([a, b, y0, y1, tp], i) => barD(o.x + s * a + sw * [0.5, 1, 1.2][i], o.x + s * b + sw * [0.5, 1, 1.2][i], o.y + y0, o.y + y1, tp))
    .join('');
  const reflColor = reflectTone(o.color, o.k, tone);
  return {refl, reflColor, contact: lensD(o.x + s * 0.02, o.y + 0.6, s * 1.14, 2.4), contactColor: waterStep(reflColor, -0.06, 1.05)};
}

// ================================================================= the frame (pure: the component and node QA share it)

export type WaterFrame = {
  ramp: SkySpec;
  skyShift: Pt;
  runs: {color: string; d: string}[];
  ripples: {color: string; d: string}[];
  bed: string;
  slivers: Sliver[];
  sliverD: string;
  bedColor: string;
  coreColor: string;
  sunShift: Pt;
  lines: RippleLine[];
};
/** Everything the water draws at t (scene seconds), in draw order. */
export function waterFrame(spec: WaterSpec, t: number): WaterFrame {
  const st = waterStatic(spec);
  const far = spec.lod === 'far';
  const shift = (plane: number): Pt => (spec.float ? spec.float(plane, t) : [0, 0]);
  const yFar = spec.ramp.yFar;
  const yNear = spec.ramp.yNear;
  const swayFn = far ? () => 0 : (y: number) => swayAt(spec.cam, st.sway, yFar, yNear, st.seed, y, t);
  const ctx: FrameCtx = {st, t, sway: swayFn, shift};
  const out: Runs = new Map();
  const moving = spec.moving ? spec.moving(t).map((s) => resolveSource(s, spec.cam, st.grid, spec.region, true, st.yBarMin)) : [];
  const all = [...st.srcs.map((s) => ({s, m: false})), ...moving.map((s) => ({s, m: true}))].sort((a, b) => a.s.layer - b.s.layer);
  for (const {s, m} of all) {
    if (far) buildFlat(s, ctx, out);
    else buildMass(s, ctx, out, m);
  }
  const runs = Array.from(out.values())
    .sort((a, b) => a.layer - b.layer)
    .map((a) => ({color: a.color, d: a.parts.join('')}));
  // ripple lines: light across a reflection, darker across the open water
  const polys = all.filter(({s}) => s.draw !== 'crisp' && s.p.length >= 3).map(({s}) => {
    const [sx, sy] = shift(s.plane);
    return {p: s.p, sx, sy, box: s.box};
  });
  const under = (x: number, y: number) => polys.some((q) => x >= q.box.x0 + q.sx && x <= q.box.x1 + q.sx && y >= q.box.y0 + q.sy && y <= q.box.y1 + q.sy && inPoly(q.p, x - q.sx, y - q.sy));
  const lines = far ? farLines(st) : ripplesAt(st, t, under);
  const rip = new Map<string, string[]>();
  const rp = spec.ripples;
  for (const l of lines) {
    const base = skyColorAt(st.ramp, l.y);
    const c = far ? waterStep(base, l.tone * 0.02, 1) : waterStep(base, l.tone > 0 ? rp?.crest ?? 0.045 : rp?.trough ?? -0.05, l.tone > 0 ? 0.75 : 1.1);
    const d = lensD(l.x, l.y, l.len, l.h);
    const a = rip.get(c);
    if (a) a.push(d);
    else rip.set(c, [d]);
  }
  // the glitter: the still bed (swaying with its bands) and the slivers nested in it
  const sun = spec.sun;
  const sunShift = sun ? shift(st.sunPlane) : ([0, 0] as Pt);
  let bed = '';
  let sliverD = '';
  let slivers: Sliver[] = [];
  if (sun && !far) {
    for (const b of st.bed) bed += lensD(b.cx + swayFn(b.cy) * 0.7, b.cy, b.len, b.h);
    slivers = glitterSlivers(st, t);
    for (const s of slivers) sliverD += lensD(s.x + swayFn(s.y) * 0.7, s.y, s.len, s.h);
  } else if (sun && far) {
    slivers = farFlecks(st, t);
    for (const s of slivers) sliverD += lensD(s.x, s.y, s.len, s.h);
  }
  return {
    ramp: st.ramp,
    skyShift: shift(spec.skyPlane ?? Infinity),
    runs,
    ripples: Array.from(rip.entries()).map(([color, ds]) => ({color, d: ds.join('')})),
    bed,
    slivers,
    sliverD,
    bedColor: sun?.bed ?? SUN_DEFAULT.bed,
    coreColor: sun?.core ?? SUN_DEFAULT.core,
    sunShift,
    lines,
  };
}

/** Far LOD (R14): 2-4 long, thin, tone-on-tone current lines, still. */
function farLines(st: Static): RippleLine[] {
  const n = st.spec.farLod?.lines ?? 3;
  const reg = st.spec.region;
  const out: RippleLine[] = [];
  for (let i = 0; i < n; i++) {
    const x = lerp(reg.x0 + 60, reg.x1 - 60, (i + 0.25 + 0.5 * hash01(st.seed, 7500, i)) / n);
    const y0 = reg.top(x);
    const y1 = reg.bottom(x);
    const y = lerp(y0, y1, lerp(0.35, 0.8, hash01(st.seed, 7500, i, 1)));
    out.push({x, y, len: lerp(80, 200, hash01(st.seed, 7500, i, 2)), h: 1, tone: hash01(st.seed, 7500, i, 3) < 0.5 ? -1 : 1});
  }
  return out;
}
/** Far LOD (R14): the glitter as single short flecks (2-6 px) in the sun's column, each living 0.3-0.7 s. */
function farFlecks(st: Static, t: number): Sliver[] {
  const s = st.spec.sun!;
  const t0 = s.t0 ?? SUN_DEFAULT.t0;
  if (t < t0) return [];
  const n = Math.min(6, st.spec.farLod?.flecks ?? 5);
  const fl = st.spec.farLod?.fleckLen ?? [2, 6];
  const [y0, y1] = sunRows(st);
  const out: Sliver[] = [];
  for (let j = 0; j < n; j++) {
    const P = lerp(0.42, 0.9, hash01(st.seed, 7600, j, 1));
    const u = (t - t0) / P - hash01(st.seed, 7600, j, 2);
    if (u < 0) continue;
    const cyc = Math.floor(u);
    const tau = u - cyc;
    if (tau > 0.75) continue;
    const env = Math.pow(Math.sin((Math.PI * tau) / 0.75), 0.6);
    const y = lerp(y0, y1, hash01(st.seed, 7600, j, 3, cyc));
    const hw = glitterHalfW(st.spec.cam, s, y);
    const x = s.x + hw * (2 * hash01(st.seed, 7600, j, 4, cyc) - 1);
    const L = lerp(fl[0], fl[1], hash01(st.seed, 7600, j, 5, cyc)) * env;
    if (L >= 1) out.push({x, y, len: L, h: Math.max(0.8, L / 4), lens: -1});
  }
  return out;
}

// ================================================================= the component

/** THE WATER: draw it in the shot's water slot (inside the water's parallax plane group, after the sky things and
 *  before everything that stands in or over it), with the scene time `t`. Raw SVG with computed colours. */
export const Water: React.FC<{spec: WaterSpec; t: number}> = ({spec, t}) => {
  const uid = 'w' + useId().replace(/[^a-zA-Z0-9]/g, '');
  const st = waterStatic(spec);
  const f = spec.flood;
  const r = f ? Math.max(0, (t - f.t0) * f.speed) : Infinity;
  const flooding = !!f && t < st.floodEnd;
  const colour = r > 0;
  let body: React.ReactNode = null;
  if (colour) {
    const fr = waterFrame(spec, t);
    const tr = (v: Pt) => `translate(${v[0].toFixed(3)} ${v[1].toFixed(3)})`;
    body = (
      <>
        <g transform={tr(fr.skyShift)}>
          <Sky spec={fr.ramp} />
        </g>
        {fr.runs.map((p, i) => (
          <path key={`r${i}`} d={p.d} fill={p.color} />
        ))}
        {spec.shades && spec.tint ? (
          <g style={{mixBlendMode: 'multiply'}}>
            <path d={spec.shades.join('')} fill={spec.tint} />
          </g>
        ) : null}
        {fr.ripples.map((p, i) => (
          <path key={`l${i}`} d={p.d} fill={p.color} />
        ))}
        <g transform={tr(fr.sunShift)}>
          {fr.bed ? <path d={fr.bed} fill={fr.bedColor} /> : null}
          {fr.sliverD ? <path d={fr.sliverD} fill={fr.coreColor} /> : null}
        </g>
      </>
    );
  }
  return (
    <g style={{isolation: 'isolate'}}>
      <defs>
        <clipPath id={`${uid}r`} clipPathUnits="userSpaceOnUse">
          <path d={st.regionD} />
        </clipPath>
        {flooding && colour && f ? (
          <clipPath id={`${uid}f`} clipPathUnits="userSpaceOnUse">
            <circle cx={f.origin[0]} cy={f.origin[1]} r={r} />
          </clipPath>
        ) : null}
      </defs>
      <g clipPath={`url(#${uid}r)`}>
        {flooding ? (
          <>
            <path d={st.regionD} fill={st.paleBase} />
            {st.pale.map((p, i) => (
              <path key={`p${i}`} d={p.d} fill={p.color} />
            ))}
          </>
        ) : null}
        {colour ? flooding ? <g clipPath={`url(#${uid}f)`}>{body}</g> : body : null}
      </g>
    </g>
  );
};

/** The open water's colour at screen y (the ramp as drawn): a floater's contact, a ripple's base. */
export const waterColourAt = (spec: WaterSpec, y: number): string => skyColorAt(waterStatic(spec).ramp, y);
/** The Fresnel ladder's k at screen y (a floater's tone). */
export const waterKAt = (spec: WaterSpec, y: number): number => kAt(waterStatic(spec), y);
/** The water's sway (px) at screen y and t (a floater swaying with its water). */
export const waterSwayAt = (spec: WaterSpec, y: number, t: number): number => {
  const st = waterStatic(spec);
  return swayAt(spec.cam, st.sway, spec.ramp.yFar, spec.ramp.yNear, st.seed, y, t);
};

// ================================================================= QA: the palette and the lint

/** Every colour the water uses, with its CIE L*, C*, h (the palette QA hook). */
export function waterPalette(spec: WaterSpec): {name: string; hex: string; L: number; C: number; h: number; band: string}[] {
  const st = waterStatic(spec);
  const out: {name: string; hex: string; L: number; C: number; h: number; band: string}[] = [];
  const add = (name: string, hex: string) => {
    const c = cie(hex);
    out.push({name, hex, L: +c.L.toFixed(1), C: +c.C.toFixed(1), h: +c.h.toFixed(0), band: neverBand(hex)});
  };
  st.ramp.keys.forEach((k) => add(`ramp y${k.y}`, k.color as string));
  const ks: number[] = [];
  for (let k = st.ladder.k[0]; k <= st.ladder.k[1] + 1e-9; k += st.ladder.step) ks.push(Math.round(k / st.ladder.step) * st.ladder.step);
  for (const s of st.srcs) for (const k of ks) add(`${s.id} k${k.toFixed(2)}`, toneOf(st, s, k));
  if (spec.sun) {
    add('glitter bed', spec.sun.bed ?? SUN_DEFAULT.bed);
    add('glitter sliver', spec.sun.core ?? SUN_DEFAULT.core);
  }
  if (spec.ripples) {
    for (let y = st.box.top; y <= st.box.bottom; y += 24) {
      const base = skyColorAt(st.ramp, y);
      add(`ripple crest y${y}`, waterStep(base, spec.ripples.crest ?? 0.045, 0.75));
      add(`ripple trough y${y}`, waterStep(base, spec.ripples.trough ?? -0.05, 1.1));
    }
  }
  return out;
}

/** CRAFT §f.7 / R12's calm limits. */
export const WATER_LIMITS = {swayFar: 3, swayNear: 7, slicePxS: 15, waveMS: [0.2, 0.6] as [number, number], rippleDrift: 25, rippleCount: [6, 14] as [number, number], rippleLen: 40, sliversAlive: 6, sliverLen: [20, 36] as [number, number], sliverLife: [0.25, 0.9] as [number, number], solid: 0.55, minPitch: 2, widthTol: 0.25};

/** THE LINT (run it before a render, and in the shot's QA): '' problems = the water is drawn by the rules. `t1` the
 *  shot's last second (the sliver count is sampled over [0, t1] at 60 fps); `otherAlive` the shot's other particles
 *  alive at once (CRAFT §f.6: <= 16 in all). */
export function waterProblems(spec: WaterSpec, o: {t1?: number; otherAlive?: number; fps?: number} = {}): string[] {
  const out: string[] = [];
  const st = waterStatic(spec);
  const L = WATER_LIMITS;
  const name = spec.id;
  // ---- colour: nothing in the beige, olive or grey bands (the playbook's never list)
  for (const c of waterPalette(spec)) if (c.band) out.push(`${name}: ${c.name} ${c.hex} (L* ${c.L} C* ${c.C} h ${c.h}) is in the ${c.band} band`);
  const b = cie(spec.body);
  if (!(b.h >= 150 && b.h <= 250 && b.C > 4)) out.push(`${name}: the body ${spec.body} is not a cool colour (h ${b.h.toFixed(0)}, C* ${b.C.toFixed(1)}): the water is the frame's cool field (DIRECTION rule 6)`);
  if ((spec.tone?.warmMemory ?? 0) > 0) out.push(`${name}: warmMemory ${spec.tone?.warmMemory} is ON (an owner knob): check the water stays >= 80 % cool (docs/v2/water/judge_metrics.py)`);
  // ---- every reflection hangs from its own waterline, inside the water's span
  for (const s of spec.sources) {
    if (s.thing && s.axis !== undefined) {
      const bad = s.thing.filter(([x, y]) => y > axisY(s.axis!, x, spec.cam) + 0.5);
      if (bad.length) out.push(`${name}: ${s.id}: ${bad.length} point(s) of the thing lie below its waterline: its reflection would rise above the water line (R1)`);
    } else if (!s.refl) out.push(`${name}: ${s.id}: neither a thing with an axis nor a reflection polygon`);
    if ((s.draw ?? 'mass') === 'mass' && (s.solid ?? 0.6) < L.solid) out.push(`${name}: ${s.id}: solid ${s.solid} < ${L.solid}: a reflection is one smooth shape down to >= 55 % of its length`);
    if ((s.taper ?? 3) <= 0) out.push(`${name}: ${s.id}: taper 0 makes square bar ends (never a square cut)`);
  }
  for (const s of st.srcs) {
    if (!s.p.length) continue;
    if (s.box.x1 < spec.region.x0 - 60 || s.box.x0 > spec.region.x1 + 60) out.push(`${name}: ${s.id}: its reflection lies outside the water's x range`);
  }
  // ---- the grid: no slice row under 2 px where bars are drawn (far LOD draws none)
  if (spec.lod !== 'far') {
    const rows = st.grid.rows;
    for (let i = 0; i + 1 < rows.length; i++) {
      const pitch = rows[i + 1] - rows[i];
      const gap = gapOf(st.grid, rows[i], rows[i + 1]);
      if (pitch - gap < L.minPitch && rows[i] < st.box.bottom) {
        out.push(`${name}: the band at y ${rows[i].toFixed(0)} draws a ${(pitch - gap).toFixed(1)} px slice (< ${L.minPitch}): use lod 'far' (R14) or a coarser grid`);
        break;
      }
    }
  }
  // ---- calm motion (R12): the sway, its wave speed, the ripple drift
  const sw = st.sway;
  if (sw.amp[0] > L.swayFar || sw.amp[1] > L.swayNear) out.push(`${name}: sway +-${sw.amp[0]} / +-${sw.amp[1]} px: calm is <= +-${L.swayFar} far, +-${L.swayNear} near (R12)`);
  for (const w of sw.waves) {
    const v = w.lambda / w.period;
    if (v < L.waveMS[0] || v > L.waveMS[1]) out.push(`${name}: a sway wave travels ${v.toFixed(2)} m/s (real wave speeds: ${L.waveMS[0]}-${L.waveMS[1]})`);
    const peak = (2 * Math.PI * sw.amp[1] * w.w) / w.period;
    if (peak > L.slicePxS) out.push(`${name}: a slice slides up to ${peak.toFixed(1)} px/s (calm: <= ${L.slicePxS})`);
  }
  const rp = spec.ripples;
  if (rp && spec.lod !== 'far') {
    if (Math.max(Math.abs(rp.drift[0]), Math.abs(rp.drift[1])) > L.rippleDrift) out.push(`${name}: ripple lines drift up to ${Math.max(...rp.drift.map(Math.abs))} px/s (calm: <= ${L.rippleDrift}; faster reads as a scroll)`);
    if (rp.slots < L.rippleCount[0] || rp.slots > L.rippleCount[1]) out.push(`${name}: ${rp.slots} ripple slots: R9 asks for ${L.rippleCount[0]}-${L.rippleCount[1]}, never a scatter`);
    if (rp.len[0] < L.rippleLen) out.push(`${name}: ripple lines from ${rp.len[0]} px: >= ${L.rippleLen} px (a shorter mark reads as a dash)`);
  }
  // ---- the glitter: only under the sun, R8's width, CRAFT §f.6's slivers
  const sun = spec.sun;
  if (sun) {
    const [y0, y1] = sunRows(st);
    if (sun.x < spec.region.x0 || sun.x > spec.region.x1) out.push(`${name}: the sun's column x ${sun.x} is outside the water`);
    if (sun.mirrorY !== undefined && Math.abs(sun.mirrorY - (2 * spec.cam.horizon - sun.y)) > 2) out.push(`${name}: the glitter's mirror point ${sun.mirrorY} is not the sun's (2 hz - y = ${2 * spec.cam.horizon - sun.y})`);
    if (y0 < spec.region.top(sun.x) - 6 || y1 > spec.region.bottom(sun.x) + 8) out.push(`${name}: the glitter rows ${y0.toFixed(0)}-${y1.toFixed(0)} leave the water at x ${sun.x}`);
    for (const g of st.bed) {
      if (Math.abs(g.cx - sun.x) > glitterHalfW(spec.cam, sun, g.cy)) out.push(`${name}: a glitter lens at x ${g.cx.toFixed(0)} is outside the sun's column (glitter only under the sun)`);
      const hw = glitterHalfW(spec.cam, sun, g.cy);
      if (g.len / 2 > hw * (1 + 0.5 + L.widthTol)) out.push(`${name}: a glitter lens ${g.len.toFixed(0)} px long at y ${g.cy.toFixed(0)}: wider than R8's column (+-${hw.toFixed(0)} px)`);
    }
    const life = sun.life ?? SUN_DEFAULT.life;
    const len = sun.len ?? SUN_DEFAULT.len;
    if ((sun.slots ?? SUN_DEFAULT.slots) > L.sliversAlive) out.push(`${name}: ${sun.slots} sliver slots (CRAFT §f.6: 4-6 twinkling at once)`);
    if (spec.lod !== 'far' && (len[0] < L.sliverLen[0] || len[1] > L.sliverLen[1])) out.push(`${name}: slivers ${len[0]}-${len[1]} px (CRAFT §f.6: ${L.sliverLen[0]}-${L.sliverLen[1]})`);
    if (life[0] * 0.62 < L.sliverLife[0] - 1e-9 || life[1] > L.sliverLife[1] + 1e-9) out.push(`${name}: sliver lives ${life[0]}-${life[1]} s (lit 0.25-0.8 s: CRAFT §f.6)`);
    const t0 = sun.t0 ?? SUN_DEFAULT.t0;
    if (spec.flood && t0 < st.floodEnd) out.push(`${name}: slivers born from ${t0} s, before the flood has crossed the water (${st.floodEnd.toFixed(2)} s)`);
    // alive at once, sampled over the shot
    const fps = o.fps ?? 60;
    const t1 = o.t1 ?? 8;
    let most = 0;
    for (let f = 0; f <= Math.round(t1 * fps); f++) most = Math.max(most, (spec.lod === 'far' ? farFlecks(st, f / fps) : glitterSlivers(st, f / fps)).length);
    if (most > L.sliversAlive) out.push(`${name}: ${most} slivers alive at once (<= ${L.sliversAlive})`);
    if (most + (o.otherAlive ?? 0) > ALIVE_MAX) out.push(`${name}: ${most} slivers + ${o.otherAlive} other particles alive: over the shot's ${ALIVE_MAX} (CRAFT §f.6)`);
    if (spec.lod !== 'far') {
      for (let f = Math.round(t0 * fps) + 1; f <= Math.round(t1 * fps); f++) {
        for (const s of glitterSlivers(st, f / fps)) {
          const b = st.bed[s.lens];
          if (!b || s.len > b.len + 0.5) {
            out.push(`${name}: a sliver ${s.len.toFixed(0)} px at t ${(f / fps).toFixed(2)} does not nest in its bed lens`);
            f = Infinity;
            break;
          }
        }
      }
    }
  }
  // ---- the draw-in at frame 0, and the joins
  if (!spec.flood) out.push(`${name}: no flood: frame 0 must land the water as flat pale shapes and flood it with the set (DIRECTION rule 9); declare it`);
  else if (!(spec.flood.pale > 0.4 && spec.flood.pale < 0.9 && spec.flood.speed > 0)) out.push(`${name}: the flood's pale ${spec.flood.pale} / speed ${spec.flood.speed} are off (lib/Fill's pale state is ~0.7)`);
  for (const j of spec.joins ?? []) {
    const births = [sun ? sun.t0 ?? SUN_DEFAULT.t0 : null, rp ? rp.t0 : null].filter((v): v is number => v !== null);
    for (const b0 of births) if (Math.abs(b0 - j) < 0.2) out.push(`${name}: a field starts at ${b0} s, inside the join at ${j} s (nothing new in a join's 0.4 s)`);
  }
  return out;
}
