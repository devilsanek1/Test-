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
import {Sky, fromOklch, hexToRgb, mixOklab, oklabToHex, oklch, rgbToCieLab, skyColorAt, toOklab, type SkySpec} from './sky';
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
/** CIE76 colour difference of two hex colours (CIE Lab, D65: the critic's measure). */
export function dE76(a: string, b: string): number {
  const p = rgbToCieLab(hexToRgb(a));
  const q = rgbToCieLab(hexToRgb(b));
  return Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]);
}
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
/** The body's tone family: the approved Canal Mint (the open body #A0C5BE, C* 13.7; v5's flat #A6C9C1, C* 13.2). A
 *  reflection keeps the water's chroma round C* 13.5 (deeper = a touch richer), never under 9: the critic on v6's
 *  first master (2026-10-28, docs/v2/water/CRITIC.md must-fix 3): waterC 10 / cMin 6.5 turned the wing's reflection a
 *  grey-teal (C* 10.5) and the water's median C* 11.2. */
export const TONE_DEFAULT: ToneOpts = {waterL: 76, waterH: 182, waterC: 13.5, hueSlope: 0.9, chromaSlope: 0.32, cMin: 9, cMax: 16, warmMemory: 0};
const TONES = new Map<string, string>();
export function reflectTone(src: string, k: number, o: ToneOpts, kind: ToneKind = 'body', dL = 0, kMin = 0.6): string {
  const key = `${src}|${k.toFixed(3)}|${kind}|${dL}|${kMin}|${o.waterL}|${o.waterH}|${o.waterC}|${o.hueSlope}|${o.chromaSlope}|${o.cMin}|${o.cMax}|${o.warmMemory}`;
  const hit = TONES.get(key);
  if (hit) return hit;
  const c = lch(src);
  const kk = kind === 'figure' ? Math.max(kMin, k) : k;
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
  amp: [1.4, 4.4],
  waves: [
    {lambda: 3.2, period: 7.0, w: 0.72},
    {lambda: 1.6, period: 4.2, w: 0.28},
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
 *  screen y mirrors the sky at 2 hz - y (R1), a FRESNEL STEP under it (OKLab L - dl: ~5 L* at the far edge, so the far
 *  water is >= 4 L* under the air and never the lit ground's own colour); from the middle water on it is pulled toward
 *  the water's own teal (R2: the near water shows its body) in OKLab, through a light veil of the body's hue. The warm
 *  sky's chroma is cancelled by the teal body where they cross (the physical mix is low in chroma): through the whole
 *  warm-to-cool crossing (CIE h 30-150) the chroma is held in the CLEAN GAP, C* 4.3-`cap` (5.6: the beige and olive
 *  bands start at 6, grey under 4), as the sky's own light band crosses at C* <= 6 (CRAFT §g.1): so the far water is a
 *  pale warm pearl, never peach paving, beige, olive or grey (R4; the critic on v6's first master, CRITIC.md must-fix
 *  2b: its far end was the paving's colour, dE76 ~1, and its crossing ran through the house beige band). Defaults are
 *  S1's; n runs 0 at `yFar` (the far edge) -> 1 at `yNear` (our edge). */
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
  /** The clean gap's chroma ceiling (CIE C*) through the warm-to-cool crossing (default 5.6; the bands start at 6). */
  cap?: number;
};
export const RAMP_DEFAULT = {dl: [0.05, -0.03] as [number, number], ck: [0.95, 0.1] as [number, number], veil: {l: 0.085, c: 0.018}, veilAt: [0.1, 0.4] as [number, number], bodyAt: [0.32, 0.86, 0.92] as [number, number, number], step: 16, cap: 5.6};
/** The CLEAN GAP (rampColour): through the warm-to-cool crossing (CIE h 55-150, eased off over h 30-55 on the rose side
 *  and 150-168 on the cool side) a colour's chroma is held under `cap` (beige and olive start at C* 6) and, under
 *  L* 85, over 4.3 (grey is C* < 4); its L* and hue are kept. */
export function rampGap(hex: string, cap: number = RAMP_DEFAULT.cap): string {
  const c = lch(hex);
  let lim = Infinity;
  if (c.h >= 55 && c.h <= 150) lim = cap;
  else if (c.h >= 30 && c.h < 55) lim = cap + ((55 - c.h) / 25) * 30;
  else if (c.h > 150 && c.h < 168) lim = cap + ((c.h - 150) / 18) * 30;
  let C = Math.min(c.C, lim);
  if (c.L < 85 && C < 4.3 && lim < Infinity) C = 4.3;
  return C === c.C ? hex : fromLch(c.L, C, c.h);
}
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
  return rampGap(cleanColour(oklabToHex(mixOklab(mixOklab(skyL, veil, a), toOklab(body), bb * ba[2])), b.h), o.cap ?? RAMP_DEFAULT.cap);
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
   *  'stub' (a dome-ended vertical from the waterline: a bollard's reflection). A `kind: 'light'` mass is drawn as
   *  LIGHT ON WATER (`light`): a short solid block, then a few lens slivers on the open water. */
  draw?: 'mass' | 'crisp' | 'stub';
  /** The share of its VISIBLE length drawn as the solid block (>= 0.55, default 0.6): the rest is bars. 1 = WHOLE: one
   *  smooth shape to its end, no bars (a far thing in the far water, a near mirror: R2, R5). */
  solid?: number;
  /** At most this many bars under the block (default: as many as the envelope gives): a thin thing breaks once or
   *  twice, never into a comb (CRITIC.md must-fix 2c). */
  maxBars?: number;
  /** A light's column (kind 'light'; LIGHT_DEFAULT). */
  light?: LightOpts;
  /** A figure's Fresnel k floor (kind 'figure'; default 0.6): higher = nearer the water's own value, so a person's
   *  reflection stays a soft, slim step on its field (environment, never a second subject: R5). */
  kMin?: number;
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
/** LIGHT ON WATER (a lit door, a lamp: R7; the critic on v6's first master, CRITIC.md must-fix 1: "a solid slab with
 *  five equal round-capped bars ... a stack of pancakes", its 2 px gaps khaki in the encode's 4:2:0 chroma). The
 *  column is the light's mirror: a SHORT SOLID BLOCK (<= 35 % of its visible length; its sides bent by the sway; its
 *  bottom a gentle static ripple, `wave` px, so no single row carries the whole gold-to-water edge), then at most 3
 *  LEAF SLIVERS on the open water (pointed at both ends, never a pill cap; flanks a touch straighter than a lens, `leaf`
 *  1.5), each `ratio` (<= 0.85) as long and `thinning` (<= 0.85) as thick as the one above (the first: `ratio` x the
 *  block's width), seeded a little off the column's middle, each swaying with its own row; the water between them is
 *  >= `gap` px (>= 4: the encode's 4:2:0 keeps at least 2 rows of every gap the water's own colour, wherever the float
 *  puts it). Its value is a step under its source (>= 4 L*: a reflection never outshines its light) and falls with
 *  each sliver. */
export type LightOpts = {
  solid?: number;
  slivers?: number;
  /** Each sliver's length over the one above (the first's over the block's width) ... */
  ratio?: number;
  /** ... and its thickness over the one above. */
  thinning?: number;
  /** The first sliver's thickness: this share of its band's pitch, clamped to `thickPx`. */
  thick?: number;
  thickPx?: [number, number];
  /** The water gap above each sliver: max(`gap`, `gapK` x the pitch there), growing by `gapGrow` per sliver. */
  gap?: number;
  gapK?: number;
  gapGrow?: number;
  /** CIE L*: the block's step under its source, and each sliver's further fall. */
  step?: number;
  fall?: number;
  /** Each sliver's seeded shift across, as a share of the block's width. */
  wander?: number;
  /** The block's bottom ripple: amplitude (px) and wavelength (px). */
  wave?: [number, number];
  /** The sliver's profile: 2 = a lens (parabolic flanks), 1 = a diamond; 1.5 a willow leaf. */
  leaf?: number;
};
export const LIGHT_DEFAULT: Required<LightOpts> = {solid: 0.33, slivers: 3, ratio: 0.68, thinning: 0.85, thick: 1.05, thickPx: [6, 9], gap: 4.5, gapK: 0.95, gapGrow: 0.2, step: 6, fall: 1.3, wander: 0.05, wave: [2.2, 56], leaf: 1.5};
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
  /** THE SUN'S PATH under the bed (the sun's light on the water, the sky's sun warmth seen in it: DIRECTION rule 6;
   *  the critic on v6's first master: the glitter "sits on cool teal" and its gold lenses' edges mix to khaki in the
   *  encode): one flat pale-cream leaf along the column, `k` x R8's half-width, a step LIGHTER than the water it lies
   *  on (light is lighter than what it lights), its chroma low (default C* 7.5 at the air's hue, L* air - 1.2: cream at
   *  L* >= 86, never beige), so the gold lenses sit on warm light and its own edge mixes with the teal at C* < 6.
   *  false = none. */
  path?: false | {color?: string; k?: number};
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
  /** The rest between two lives of a slot (s; default 0.2-0.7). */
  rest?: [number, number];
  t0: number;
  /** A crest across a reflection: the reflection's own tone this many CIE L* lighter (default 8: R9's +6-10); a trough
   *  across the open water: the water's own colour this many OKLab L darker (default -0.04). */
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
  /** Colours the water must never be mistaken for (the lit ground beside it, as drawn on screen): the lint walks the
   *  ramp row by row and every reflection tone, and flags any within dE76 `dE` (default 6) of one (the critic on v6's
   *  first master: the far water was the paving's own colour, dE76 ~1, so at the near-left it read as paving). */
  notLike?: {name: string; hex: string; dE?: number}[];
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
  // WHOLE (solid 1): one smooth shape to its own end (the region clips it at our edge), no bars
  if ((s.solid ?? 0.6) >= 1 && s.kind !== 'light') return {...s, p, box, ySolid: box.y1 + 1, yEnd: box.y1 + 1, sd: seedOf(s.id)};
  const k = Math.min(1, Math.max(0.55, s.solid ?? 0.6));
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
    const rest: FrameCtx = {st, t: 0, sway: () => 0, shift: () => [0, 0]};
    for (const s of srcs.slice().sort((a, b) => a.layer - b.layer)) {
      if (!s.p.length) continue;
      const color = paleOf(toneOf(st, s, 0.45), f.pale, f.paper);
      const key = `${s.layer}|${color}`;
      let a = acc.get(key);
      if (!a) acc.set(key, (a = {layer: s.layer, color, parts: []}));
      if (s.kind === 'light' && (s.draw ?? 'mass') === 'mass') {
        // a light lands as its own column's shapes (the block and the slivers), pale
        const tmp: Runs = new Map();
        buildLight(s, rest, tmp);
        for (const r of tmp.values()) a.parts.push(...r.parts);
      } else a.parts.push(s.draw === 'stub' ? stubOf(s, 0) : polyD(s.p));
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
  let c = reflectTone(s.color, k, st.tone, s.kind ?? 'body', s.dL ?? 0, s.kMin);
  if (s.sep) {
    const o = st.byId.get(s.sep.from);
    if (o) {
      const oc = reflectTone(o.color, k, st.tone, o.kind ?? 'body', o.dL ?? 0, o.kMin);
      const L0 = lch(oc).L;
      const L1 = lch(c).L;
      const want = s.sep.dL;
      const have = L1 - L0;
      if (want < 0 ? have > want : have < want) c = reflectTone(s.color, k, st.tone, s.kind ?? 'body', (s.dL ?? 0) + (want - have), s.kMin);
    }
  }
  return c;
}

const TROUGHS = new Map<string, string>();
/** A band's trough colour, tone-on-tone: the bar's own hue and chroma, its L* moved `gapMix` of the way toward the open
 *  water's there, by 3.5 L* at most (a light line across a reflection is a ripple line's job, few and placed: R9). */
export const TROUGH_MAX_DL = 3.5;
function troughOf(st: Static, col: string, y: number): string {
  const key = `${col}|${Math.round(y)}|${st.gapMix}|${st.seed}`;
  const hit = TROUGHS.get(key);
  if (hit) return hit;
  const b = lch(col);
  const w = lch(skyColorAt(st.ramp, y));
  const dl = Math.max(-TROUGH_MAX_DL, Math.min(TROUGH_MAX_DL, st.gapMix * (w.L - b.L)));
  const c = cleanColour(fromLch(b.L + dl, b.C, b.h), st.tone.waterH);
  if (TROUGHS.size > 8000) TROUGHS.clear();
  TROUGHS.set(key, c);
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

type FrameCtx = {st: Static; t: number; sway: (y: number) => number; shift: (plane: number) => Pt; count?: Map<string, PieceCount>};
/** What a reflection drew in a frame (QA: `waterPieces`): its solid block(s), its bars (a broken band counts twice),
 *  a light's slivers. */
export type PieceCount = {blocks: number; bars: number; slivers: number; x: number};
const counted = (ctx: FrameCtx, s: Resolved, key: 'blocks' | 'bars' | 'slivers', n = 1) => {
  if (!ctx.count) return;
  let c = ctx.count.get(s.id);
  if (!c) ctx.count.set(s.id, (c = {blocks: 0, bars: 0, slivers: 0, x: (s.box.x0 + s.box.x1) / 2}));
  c[key] += n;
};

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
  if (s.kind === 'light') {
    buildLight(s, ctx, out);
    return;
  }
  const p = sx || sy ? s.p.map(([x, y]) => [x + sx, y + sy] as Pt) : s.p;
  // ---- the solid block: the reflection itself down to ySolid, its sides bent by the sway (one smooth closed shape);
  // its bottom corners rounded (never a square cut)
  const block = clipBand(p, -1e9, s.ySolid);
  if (block) {
    const dense = roundBottom(densify(block, 4), s.ySolid, 3.5);
    const top = Math.max(s.box.y0 + sy, st.spec.region.top((s.box.x0 + s.box.x1) / 2));
    const kb = kAt(st, lerp(top, Math.min(s.ySolid, s.yEnd), 0.3));
    pushRun(out, s.layer, toneOf(st, s, kb), polyD(dense.map(([x, y]) => [x + ctx.sway(y) * k, y] as Pt)));
    counted(ctx, s, 'blocks');
  }
  // ---- the bars: one per band below the block, on the shared grid; the reflection narrows along a smooth envelope
  // (a touch of seeded asymmetry), a band breaks once at most and only in its last half, the very last may drop
  const rows = st.grid.rows;
  const brk = moving ? Math.min(s.breakup ?? 0.45, 0.0001) : s.breakup ?? 0.45;
  const narrow = s.narrow ?? 0.18;
  const taperBase = s.taper ?? 3;
  const span = Math.max(1, s.yEnd - s.ySolid);
  const yMax = s.box.y1 + sy;
  const maxBars = s.maxBars ?? Infinity;
  let bands = 0;
  for (let i = 0; i + 1 < rows.length; i++) {
    const yb = rows[i + 1];
    if (yb <= s.ySolid + 0.01) continue;
    if (bands >= maxBars) break;
    // the band under the block starts at the block (a moving source's block ends between two boundaries)
    const ya = Math.max(rows[i], s.ySolid);
    if (ya >= yMax || ya > s.yEnd + 2) break;
    const topY = ya + gapOf(st.grid, rows[i], yb);
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
    const pitch = yb - rows[i];
    const kk = kAt(st, ym);
    const col = toneOf(st, s, kk);
    // the band's trough (its gap): tone-on-tone, the bar's own tone a step toward the open water there (a LIGHT is
    // drawn by buildLight: its slivers part on the open water, R7)
    const trough = troughOf(st, col, ya);
    const dx = ctx.sway(ym) * k;
    let drew = 0;
    const seg = (a: number, b: number, tl: number, tr: number) => {
      if (trough) pushRun(out, s.layer, trough, barD(a + dx, b + dx, ya, topY, tl, tr));
      const d = barD(a + dx, b + dx, topY, bot, tl, tr);
      pushRun(out, s.layer, col, d);
      if (d) drew++;
    };
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
        if (xb - g0 / 2 - x0 >= 3) seg(x0, xb - g0 / 2, taper, Math.min(taper, (xb - g0 / 2 - x0) * 0.4));
        if (x1 - xb - g0 / 2 >= 3) seg(xb + g0 / 2, x1, Math.min(taper, (x1 - xb - g0 / 2) * 0.4), taper);
      } else seg(x0, x1, taper, taper);
    }
    if (drew) {
      bands++;
      counted(ctx, s, 'bars', drew);
    }
  }
}

/** The grid's band pitch (px) at screen y. */
function pitchAt(st: Static, y: number): number {
  const r = st.grid.rows;
  for (let i = 0; i + 1 < r.length; i++) if (y < r[i + 1]) return r[i + 1] - r[i];
  return r[r.length - 1] - r[r.length - 2];
}
/** A light's top and visible end, and the solid block's bottom (static: from the reflection at rest). */
export function lightGeom(st: Static, s: Resolved): {top: number; yEnd: number; yBlock: number} {
  const lo = {...LIGHT_DEFAULT, ...(s.light ?? {})};
  const xc = (s.box.x0 + s.box.x1) / 2;
  const top = Math.max(s.box.y0, st.spec.region.top(xc));
  const yEnd = Math.min(s.box.y1, st.spec.region.bottom(xc) + 4);
  return {top, yEnd, yBlock: top + Math.max(1, yEnd - top) * Math.min(0.35, lo.solid)};
}
/** A level LEAF (a light's sliver): pointed at both ends, `h` thick at its middle; its flanks follow 1 - |u|^p (p 2: a
 *  lens; p 1: a diamond), sampled densely (smooth at any size). */
export function leafD(cx: number, cy: number, len: number, h: number, p = 1.5): string {
  if (len < 0.6 || h < 0.15) return '';
  const n = 14;
  const top: Pt[] = [];
  for (let i = 0; i <= 2 * n; i++) {
    const u = i / n - 1;
    top.push([cx + (u * len) / 2, cy - (h / 2) * (1 - Math.pow(Math.abs(u), p))]);
  }
  const bot = top.slice(1, -1).map(([x, y]) => [x, 2 * cy - y] as Pt).reverse();
  return polyD([...top, ...bot]);
}
/** LIGHT ON WATER (LightOpts): the short block, then the leaf slivers on the open water. */
function buildLight(s: Resolved, ctx: FrameCtx, out: Runs): void {
  const {st} = ctx;
  const lo = {...LIGHT_DEFAULT, ...(s.light ?? {})};
  const [sx, sy] = ctx.shift(s.plane);
  const k = s.sway ?? 1;
  const p = sx || sy ? s.p.map(([x, y]) => [x + sx, y + sy] as Pt) : s.p;
  const g = lightGeom(st, s);
  const top = g.top + sy;
  const yEnd = g.yEnd + sy;
  const yB = g.yBlock + sy;
  const tones = lightTones(st, s, lerp(top, yB, 0.5));
  const iv = intervalsAt(p, yB - 0.5);
  if (!iv.length) return;
  const x0 = iv[0][0];
  const x1 = iv[iv.length - 1][1];
  const W = x1 - x0;
  // ---- the block: the light's own mirror, its sides bent by the sway, its bottom corners rounded and its bottom a
  // gentle static ripple (eased to nothing at the corners; its phase seeded, its crests on the light's own x)
  const block = clipBand(p, -1e9, yB);
  if (block) {
    const [amp, lam] = lo.wave;
    const ph = 2 * Math.PI * hash01(st.seed, s.sd, 31);
    const dense = roundBottom(densify(block, 4, 3), yB, 3.5).map(([x, y]) => {
      if (Math.abs(y - yB) > 0.01 || amp <= 0) return [x, y] as Pt;
      const e = smooth(0, 10, Math.min(x - x0, x1 - x));
      return [x, y + amp * e * Math.sin((2 * Math.PI * (x - sx)) / lam + ph)] as Pt;
    });
    pushRun(out, s.layer, tones[0], polyD(dense.map(([x, y]) => [x + ctx.sway(y) * k, y] as Pt)));
    counted(ctx, s, 'blocks');
  }
  // ---- the slivers: leaves on the open water, each `ratio` as long and `thinning` as thick as the one above
  let len = W;
  let T = Math.min(lo.thickPx[1], Math.max(lo.thickPx[0], pitchAt(st, yB) * lo.thick));
  let y = yB + lo.wave[0];
  for (let i = 0; i < Math.min(3, lo.slivers); i++) {
    len *= lo.ratio;
    if (i > 0) T *= lo.thinning;
    const gap = Math.max(lo.gap, pitchAt(st, y) * lo.gapK * (1 + lo.gapGrow * i));
    const yc = y + gap + T / 2;
    if (yc + T / 2 > yEnd || len < 8) break;
    const cx = (x0 + x1) / 2 + (2 * hash01(st.seed, s.sd, 40 + i) - 1) * lo.wander * W + ctx.sway(yc) * k;
    pushRun(out, s.layer, tones[i + 1], leafD(cx, yc, len, T, lo.leaf));
    counted(ctx, s, 'slivers');
    y = yc + T / 2;
  }
}
/** A light's tones: the block a step (`step` >= 4 L*) under its source, each sliver `fall` further (hue and chroma
 *  kept). */
function lightTones(st: Static, s: WaterSource, yMid: number): string[] {
  const lo = {...LIGHT_DEFAULT, ...(s.light ?? {})};
  const base = lch(toneOf(st, s, kAt(st, yMid)));
  const L0 = Math.min(base.L, lch(s.color).L - Math.max(4, lo.step));
  return [0, 1, 2, 3].map((i) => cleanColour(fromLch(L0 - lo.fall * i, base.C, base.h), st.tone.waterH));
}

/** Round a clipped shape's bottom corners (the vertices on the cut line y = yb whose other edge rises): each corner
 *  becomes a quarter curve of radius <= r (and <= a third of each edge), so a block never ends in a square cut. */
export function roundBottom(p: Poly, yb: number, r: number): Poly {
  const n = p.length;
  if (n < 3) return p;
  const on = (q: Pt) => Math.abs(q[1] - yb) < 0.01;
  const out: Poly = [];
  for (let i = 0; i < n; i++) {
    const c = p[i];
    const a = p[(i - 1 + n) % n];
    const b = p[(i + 1) % n];
    if (!on(c) || (on(a) && on(b)) || (!on(a) && !on(b))) {
      out.push(c);
      continue;
    }
    // one neighbour along the cut, the other up a side
    const along = on(a) ? a : b;
    const up = on(a) ? b : a;
    const la = Math.hypot(along[0] - c[0], along[1] - c[1]);
    const lu = Math.hypot(up[0] - c[0], up[1] - c[1]);
    const rr = Math.min(r, la / 3, lu / 1.01);
    if (rr < 0.4) {
      out.push(c);
      continue;
    }
    const pa: Pt = [c[0] + ((along[0] - c[0]) * rr) / la, c[1] + ((along[1] - c[1]) * rr) / la];
    const pu: Pt = [c[0] + ((up[0] - c[0]) * rr) / lu, c[1] + ((up[1] - c[1]) * rr) / lu];
    const [first, last] = on(a) ? [pa, pu] : [pu, pa];
    out.push(first, ...quadPts(first, c, last, 4));
  }
  return out;
}

/** Far LOD (R14): a reflection as one flat shape at its far tone (no bars, no sway). */
function buildFlat(s: Resolved, ctx: FrameCtx, out: Runs): void {
  if (s.p.length < 3 || s.far === false) return;
  const [sx, sy] = ctx.shift(s.plane);
  pushRun(out, s.layer, toneOf(ctx.st, s, kAt(ctx.st, s.box.y0)), s.draw === 'stub' ? stubOf(s, 0, sx, sy) : polyD(s.p, sx, sy));
}

// ================================================================= the sun's glitter (G2: a still bed, nested slivers)

const SUN_DEFAULT = {slope: 0.06, bed: fromLch(82, 34, 74), core: fromLch(97.5, 7, 85), t0: 0.3, slots: 6, life: [0.5, 0.8] as [number, number], len: [20, 34] as [number, number], sigma: 22};
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
 *  longest round the sun's mirror point; seeded lengths and offsets break it: never a ladder). */
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
    const len = hash01(st.seed, 7001, i, 2);
    const off = hash01(st.seed, 7001, i, 3);
    const u = clamp01((ya - y0) / Math.max(1, y1 - y0));
    const nearPeak = clamp01(1 - Math.abs((ya + yb) / 2 - peak) / ((y1 - y0) * 0.6));
    const top = ya + gapOf(st.grid, ya, yb);
    const col = glitterHalfW(st.spec.cam, s, (top + yb) / 2);
    const hw = Math.min(28, col * (0.45 + 0.62 * len + 0.25 * nearPeak));
    // its centre wanders inside the column (never past its edge): seeded per band, still
    const room = Math.max(0, col - hw * 0.55);
    out.push({cx: s.x + (2 * off - 1) * Math.min(room, lerp(8, 16, u)), cy: (top + yb) / 2, len: Math.max(21, hw * 2), h: (yb - top) * 0.92, band: i});
  }
  return out;
}
/** THE SUN'S PATH (WaterSun.path): one flat leaf along the column, pointed at its far end, widening toward us to `k`
 *  x R8's half-width (the near bank crops it), its sides swaying with their rows like the bed. */
export function sunPathD(st: Static, sway: (y: number) => number): string {
  const s = st.spec.sun;
  if (!s || s.path === false || st.spec.lod === 'far') return '';
  const k = s.path?.k ?? 1.3;
  const [y0, y1] = sunRows(st);
  const n = 30;
  const L: Pt[] = [];
  const R: Pt[] = [];
  for (let i = 0; i <= n; i++) {
    const u = i / n;
    const y = lerp(y0, y1, u);
    const taper = Math.pow(smooth(0, 0.42, u), 0.6);
    const hw = Math.max(0.3, k * glitterHalfW(st.spec.cam, s, y) * taper);
    const dx = sway(y) * 0.7;
    L.push([s.x - hw + dx, y]);
    R.push([s.x + hw + dx, y]);
  }
  return polyD([...L, ...R.reverse()]);
}
/** The sun's path colour: the shot's air (the sky's lowest colour, under the sun) a touch under, its chroma low. */
export function sunPathColour(spec: WaterSpec): string {
  const s = spec.sun;
  if (!s || s.path === false) return '';
  if (s.path?.color) return s.path.color;
  const a = lch(spec.air ?? spec.body);
  return cleanColour(fromLch(Math.min(95, a.L - 1.2), 7.5, a.h), spec.tone?.waterH ?? TONE_DEFAULT.waterH);
}
export type Sliver = {x: number; y: number; len: number; h: number; lens: number};
/** A sliver's dark rest between two lives (s): longer than 0.1 s, so no pixel flickers on and off. */
export const SLIVER_REST = 0.12;
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
    // a cycle = a life (lit 92-98 % of it) then a rest of at least SLIVER_REST s (a sliver never re-lights at once:
    // more than 6 frames dark)
    const P = lerp(life[0], life[1], hash01(st.seed, 7100, j, 1)) + SLIVER_REST;
    const u = (t - t0) / P - hash01(st.seed, 7100, j, 2);
    if (u < 0) continue;
    const cyc = Math.floor(u);
    const tau = (u - cyc) * P;
    const lit = (P - SLIVER_REST) * lerp(0.92, 0.98, hash01(st.seed, 7100, j, 3, cyc));
    if (tau > lit) continue;
    // it grows in along its length (35 %), holds (30 %), shrinks out (35 %): eased, never a fade
    const q = tau / lit;
    const e0 = q < 0.35 ? q / 0.35 : q > 0.65 ? (1 - q) / 0.35 : 1;
    const env = e0 * e0 * (3 - 2 * e0);
    // which of its lenses this cycle: weighted toward the mirror point (a normal draw in y, the nearest lens); with two
    // lenses a slot takes them in turn
    const yv = peak + sigma * gauss(hash01(st.seed, 7100, j, 4, cyc), hash01(st.seed, 7100, j, 5, cyc));
    let pick = own[0];
    if (own.length > 1) pick = own[cyc % own.length];
    else for (const o of own) if (Math.abs(o.b.cy - yv) < Math.abs(pick.b.cy - yv)) pick = o;
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

export type RippleLine = {x: number; y: number; len: number; h: number; tone: 1 | -1; /** The reflection colour it crosses (a crest). */ over?: string};
/** Ripple lines at t: `slots` lenses, each living `life` s (growing in along its length, holding, shrinking out: never a
 *  fade) at a new spot each cycle, drifting with the breeze; every spot keeps clear of the avoid boxes over its whole
 *  drift, and of the water's edges. The tone is decided by what lies under its middle: a light crest across a
 *  reflection, a darker trough across the open water (R9). */
export function ripplesAt(st: Static, t: number, under: (x: number, y: number) => string | null): RippleLine[] {
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
        // its tone is decided once for its life, by what lies under its mid-life spot (a line never flips colour)
        const tone = under(x + v * life * 0.5, y);
        if (len >= 2) out.push({x: xc, y, len, h, tone: tone ? 1 : -1, over: tone || undefined});
        break;
      }
      tb += life + lerp(rp.rest?.[0] ?? 0.2, rp.rest?.[1] ?? 0.7, hash01(st.seed, 7300, s, n, 6));
    }
  }
  return out;
}

/** A crest across a reflection (R9): the reflection's own hue a light step up (CIE L*), its chroma eased: tone-on-tone,
 *  never a white line. */
export const CREST_DL = 8;
const CRESTS = new Map<string, string>();
export function crestOf(under: string, dl: number): string {
  const key = `${under}|${dl}`;
  const hit = CRESTS.get(key);
  if (hit) return hit;
  const c = lch(under);
  const out = cleanColour(fromLch(Math.min(95, c.L + dl), c.C * 0.8, c.h));
  if (CRESTS.size > 4000) CRESTS.clear();
  CRESTS.set(key, out);
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
  runs: {layer: number; color: string; d: string}[];
  ripples: {color: string; d: string}[];
  quayLayer: number;
  bed: string;
  /** The sun's path under the bed (WaterSun.path). */
  pathD: string;
  pathColor: string;
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
    .map((a) => ({layer: a.layer, color: a.color, d: a.parts.join('')}));
  // ripple lines: light across a reflection, darker across the open water
  const polys = all
    .filter(({s}) => s.draw !== 'crisp' && s.p.length >= 3)
    .map(({s}) => {
      const [sx, sy] = shift(s.plane);
      // a light is solid only down to its block (its slivers part on the open water)
      const p = s.kind === 'light' ? clipBand(s.p, -1e9, lightGeom(st, s).yBlock) ?? [] : s.p;
      return {s, p, sx, sy, box: boxOf(p.length ? p : s.p)};
    })
    .filter((q) => q.p.length >= 3);
  // the topmost reflection under a point (its tone there), or null for the open water
  const under = (x: number, y: number): string | null => {
    for (let i = polys.length - 1; i >= 0; i--) {
      const q = polys[i];
      if (x >= q.box.x0 + q.sx && x <= q.box.x1 + q.sx && y >= q.box.y0 + q.sy && y <= q.box.y1 + q.sy && inPoly(q.p, x - q.sx, y - q.sy)) return q.s.kind === 'light' ? lightTones(st, q.s, y)[0] : toneOf(st, q.s, kAt(st, y));
    }
    return null;
  };
  const lines = far ? farLines(st) : ripplesAt(st, t, under);
  const rip = new Map<string, string[]>();
  const rp = spec.ripples;
  for (const l of lines) {
    const base = skyColorAt(st.ramp, l.y);
    const c = far ? waterStep(base, l.tone * 0.02, 1) : l.over ? crestOf(l.over, rp?.crest ?? CREST_DL) : waterStep(base, rp?.trough ?? -0.04, 1.1);
    const d = lensD(l.x, l.y, l.len, l.h);
    const a = rip.get(c);
    if (a) a.push(d);
    else rip.set(c, [d]);
  }
  // the glitter: the still bed (swaying with its bands) and the slivers nested in it
  const sun = spec.sun;
  // the column lies on the water's bands (no shift in y) and follows the sun's plane across (x)
  const sunShift: Pt = sun ? [shift(st.sunPlane)[0], 0] : [0, 0];
  let bed = '';
  let sliverD = '';
  let pathD = '';
  let slivers: Sliver[] = [];
  if (sun && !far) {
    pathD = sunPathD(st, swayFn);
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
    pathD,
    pathColor: sun ? sunPathColour(spec) : '',
    slivers,
    sliverD,
    bedColor: sun?.bed ?? SUN_DEFAULT.bed,
    coreColor: sun?.core ?? SUN_DEFAULT.core,
    sunShift,
    lines,
    quayLayer: spec.quayLayer ?? 30,
  };
}

/** QA: what each reflection draws at t (its solid block, its bars: a broken band counts twice, a light's slivers), by
 *  source id with its middle x (the critic's comb count: bars outside the glitter in a stretch of the water). */
export function waterPieces(spec: WaterSpec, t: number): Map<string, PieceCount> {
  const st = waterStatic(spec);
  const shift = (plane: number): Pt => (spec.float ? spec.float(plane, t) : [0, 0]);
  const swayFn = (y: number) => swayAt(spec.cam, st.sway, spec.ramp.yFar, spec.ramp.yNear, st.seed, y, t);
  const count = new Map<string, PieceCount>();
  const ctx: FrameCtx = {st, t, sway: swayFn, shift, count};
  const moving = spec.moving ? spec.moving(t).map((s) => resolveSource(s, spec.cam, st.grid, spec.region, true, st.yBarMin)) : [];
  const out: Runs = new Map();
  for (const s of st.srcs) buildMass(s, ctx, out, false);
  for (const s of moving) buildMass(s, ctx, out, true);
  return count;
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
        {fr.runs
          .filter((p) => p.layer < fr.quayLayer)
          .map((p, i) => (
            <path key={`r${i}`} d={p.d} fill={p.color} />
          ))}
        <g transform={tr(fr.sunShift)}>
          {fr.pathD ? <path d={fr.pathD} fill={fr.pathColor} /> : null}
          {fr.bed ? <path d={fr.bed} fill={fr.bedColor} /> : null}
          {fr.sliverD ? <path d={fr.sliverD} fill={fr.coreColor} /> : null}
        </g>
        {fr.runs
          .filter((p) => p.layer >= fr.quayLayer)
          .map((p, i) => (
            <path key={`q${i}`} d={p.d} fill={p.color} />
          ))}
        {spec.shades && spec.tint ? (
          <g style={{mixBlendMode: 'multiply'}}>
            <path d={spec.shades.join('')} fill={spec.tint} />
          </g>
        ) : null}
        {fr.ripples.map((p, i) => (
          <path key={`l${i}`} d={p.d} fill={p.color} />
        ))}
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
  for (const s of st.srcs) {
    if (s.kind === 'light' && (s.draw ?? 'mass') === 'mass') {
      const g = lightGeom(st, s);
      lightTones(st, s, lerp(g.top, g.yBlock, 0.5)).forEach((c, i) => add(`${s.id} ${i ? `sliver ${i}` : 'block'}`, c));
    } else for (const k of ks) add(`${s.id} k${k.toFixed(2)}`, toneOf(st, s, k));
  }
  if (spec.sun) {
    if (spec.sun.path !== false) add('sun path', sunPathColour(spec));
    add('glitter bed', spec.sun.bed ?? SUN_DEFAULT.bed);
    add('glitter sliver', spec.sun.core ?? SUN_DEFAULT.core);
  }
  if (spec.ripples) {
    for (let y = st.box.top; y <= st.box.bottom; y += 24) add(`ripple trough y${y}`, waterStep(skyColorAt(st.ramp, y), spec.ripples.trough ?? -0.04, 1.1));
    for (const s of st.srcs) for (const k of [ks[0], ks[ks.length - 1]]) add(`ripple crest over ${s.id} k${k.toFixed(2)}`, crestOf(toneOf(st, s, k), spec.ripples.crest ?? CREST_DL));
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
  const pal = waterPalette(spec);
  for (const c of pal) if (c.band) out.push(`${name}: ${c.name} ${c.hex} (L* ${c.L} C* ${c.C} h ${c.h}) is in the ${c.band} band`);
  // ---- the ramp as drawn, ROW BY ROW (its keys alone miss what the curve does between them: the critic found 8 rows
  // in the house bands between two clean keys on v6's first master)
  const rows: {y: number; hex: string}[] = [];
  for (let y = Math.floor(st.box.top); y <= Math.ceil(st.box.bottom); y++) rows.push({y, hex: skyColorAt(st.ramp, y)});
  const runs = (bad: (r: {y: number; hex: string}) => string): string[] => {
    const msgs: string[] = [];
    let a: {y: number; hex: string; why: string} | null = null;
    let last = -1;
    const flush = () => {
      if (a) msgs.push(`${name}: the ramp's rows y ${a.y}-${last} (${a.hex}...) ${a.why}`);
      a = null;
    };
    for (const r of rows) {
      const why = bad(r);
      if (why && a && r.y === last + 1) last = r.y;
      else {
        flush();
        if (why) {
          a = {y: r.y, hex: r.hex, why};
          last = r.y;
        }
      }
    }
    flush();
    return msgs;
  };
  out.push(...runs((r) => (neverBand(r.hex) ? `are in the ${neverBand(r.hex)} band` : '')));
  // ---- never mistaken for the lit ground beside it (dE76, CIE Lab)
  for (const nl of spec.notLike ?? []) {
    const lim = nl.dE ?? 6;
    out.push(...runs((r) => (dE76(r.hex, nl.hex) < lim ? `are within dE76 ${lim} of ${nl.name} ${nl.hex}: the water reads as ${nl.name}` : '')));
    for (const c of pal) if (!c.name.startsWith('ramp') && dE76(c.hex, nl.hex) < lim) out.push(`${name}: ${c.name} ${c.hex} is within dE76 ${lim} of ${nl.name} ${nl.hex}`);
  }
  // ---- the far water is a Fresnel step under the air (>= 4 L*): never as light as the sky it mirrors
  if (spec.air) {
    const yTop = Math.min(...[0, 0.25, 0.5, 0.75, 1].map((u) => spec.region.top(lerp(spec.region.x0, spec.region.x1, u))));
    const far = lch(skyColorAt(st.ramp, Math.max(yTop, spec.ramp.yFar))).L;
    if (far > lch(spec.air).L - 4) out.push(`${name}: the far water is L* ${far.toFixed(1)}, under 4 L* below the air ${spec.air} (L* ${lch(spec.air).L.toFixed(1)}): a Fresnel step under the sky (RampOpts.dl)`);
  }
  // ---- a light is light on water (LightOpts): a short block, <= 3 tapering lens slivers, gaps >= 4 px, a step under
  for (const s of spec.sources) {
    if (s.kind !== 'light' || (s.draw ?? 'mass') !== 'mass') continue;
    const lo = {...LIGHT_DEFAULT, ...(s.light ?? {})};
    if (lo.solid > 0.35) out.push(`${name}: ${s.id}: a light's solid block ${Math.round(lo.solid * 100)} % of its length (<= 35 %: a longer one reads as a slab)`);
    if (lo.slivers > 3) out.push(`${name}: ${s.id}: ${lo.slivers} slivers (<= 3: more read as a stack)`);
    if (lo.ratio > 0.85 || lo.thinning > 0.85) out.push(`${name}: ${s.id}: sliver ratio ${lo.ratio} / thinning ${lo.thinning} (each >= 15 % shorter and thinner than the one above)`);
    if (lo.gap < 4) out.push(`${name}: ${s.id}: sliver gaps ${lo.gap} px (>= 4: the encode's 4:2:0 chroma turns a thinner gap khaki)`);
    if (lo.step < 4) out.push(`${name}: ${s.id}: the column ${lo.step} L* under its light (>= 4: a reflection never outshines its source)`);
  }
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
  // ---- the grid: no slice row under 2 px. Bars start only where a band is barPitch px or more (the blocks above are
  // whole), so a near water's slices are >= 2 px by construction; a water whose NEAR rows are already under 2 px is a
  // far strip and is drawn with lod 'far' (R14: flat bands, flecks, current lines)
  if (spec.lod !== 'far') {
    let yNear = -Infinity;
    for (let x = spec.region.x0; x <= spec.region.x1; x += 20) yNear = Math.max(yNear, spec.region.bottom(x));
    const real = pxPerMDeep(spec.cam, yNear) * (spec.grid?.dz ?? 0.45);
    if (real < L.minPitch) out.push(`${name}: the water's nearest rows are ${real.toFixed(2)} px (< ${L.minPitch}): a far strip, draw it with lod 'far' (R14)`);
    const barPitch = spec.grid?.barPitch ?? 7;
    if (barPitch - Math.max(st.grid.minGap, barPitch * st.grid.gapK[1]) < L.minPitch) out.push(`${name}: barPitch ${barPitch} px leaves slices under ${L.minPitch} px`);
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
    if (life[0] * 0.85 < L.sliverLife[0] - 1e-9 || life[1] > L.sliverLife[1] + 1e-9) out.push(`${name}: sliver lives ${life[0]}-${life[1]} s (lit 0.25-0.8 s: CRAFT §f.6)`);
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
