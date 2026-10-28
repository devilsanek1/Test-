// WATER STUDY, candidate A ("TRUE REFLECTION"): THE ENGINE, pure TS (no React; it also runs from node QA). It is the
// would-be core of a shared lib/water.tsx: a shot feeds it its camera, its sky, its body colour and a LIST of what
// stands above the water (polygons in screen px, already mirrored about their own waterlines, on their parallax
// planes); the engine cuts them into perspective ripple rows, sways each row on a travelling wave, frays every piece's
// ends (a little far, a lot near), tones every reflection by a Fresnel ladder (in CIE LCh: the value from the world,
// the hue from the water, lights keep theirs; never an RGB mix), and lays the ripple gaps (flat lenses of the
// open-water colour), the sun's glitter column and its slivers over them. Every number is a pure
// function of the frame time and integer seeds (no Math.random, no clock). docs/v2/water/cand_A.md has the why and
// the numbers; docs/look/research/2026-10-28_water.md the optics (R1-R14).
import {fromLch, lch} from '../../lib/light';

export type Pt = [number, number];
export type Poly = Pt[];

// ================================================================= the camera over the water (DERIVED, level lens)

/** A level pinhole over flat water: horizon y, focal px, the eye's height over the WATER (m). */
export type WaterCam = {horizon: number; f: number; eye: number};
/** Depth (m) of the water surface at screen y. */
export const camZ = (c: WaterCam, y: number): number => (c.f * c.eye) / Math.max(1e-6, y - c.horizon);
/** Screen y of the water surface at depth z (m). */
export const camY = (c: WaterCam, z: number): number => c.horizon + (c.f * c.eye) / Math.max(1e-6, z);
/** Fresnel reflectance of calm water (n 1.333, unpolarised) seen at screen y. */
export function camFresnel(c: WaterCam, y: number, n = 1.333): number {
  const ti = Math.PI / 2 - Math.atan(Math.max(1e-6, y - c.horizon) / c.f);
  const tt = Math.asin(Math.sin(ti) / n);
  const rs = ((Math.cos(ti) - n * Math.cos(tt)) / (Math.cos(ti) + n * Math.cos(tt))) ** 2;
  const rp = ((Math.cos(tt) - n * Math.cos(ti)) / (Math.cos(tt) + n * Math.cos(ti))) ** 2;
  return (rs + rp) / 2;
}

// ================================================================= small numbers

export const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
export const smooth = (a: number, b: number, v: number) => {
  const k = clamp01((v - a) / (b - a));
  return k * k * (3 - 2 * k);
};
/** A deterministic hash of integers to [0, 1) (murmur3's finaliser): the per-row, per-slot, per-cycle draws. */
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
/** Two hashes as one standard normal draw (Box-Muller), clamped to +-2.5. */
export const gauss = (a: number, b: number) => Math.max(-2.5, Math.min(2.5, Math.sqrt(-2 * Math.log(Math.max(1e-6, a))) * Math.cos(2 * Math.PI * b)));
const r2 = (v: number) => (Math.round(v * 100) / 100).toString();

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
  const a = clipHalf(p, y0, true);
  if (a.length < 3) return null;
  const b = clipHalf(a, y1, false);
  return b.length < 3 ? null : b;
}
/** Keep the part of a polygon at x >= xc (right) or x <= xc (left). */
function clipHalfX(p: Poly, xc: number, right: boolean): Poly {
  const out: Poly = [];
  const n = p.length;
  for (let i = 0; i < n; i++) {
    const a = p[i];
    const b = p[(i + 1) % n];
    const ia = right ? a[0] >= xc : a[0] <= xc;
    const ib = right ? b[0] >= xc : b[0] <= xc;
    if (ia) out.push(a);
    if (ia !== ib) {
      const k = (xc - a[0]) / (b[0] - a[0]);
      out.push([xc, a[1] + (b[1] - a[1]) * k]);
    }
  }
  return out;
}
/** The part of a polygon inside x0..x1 (null when empty). */
export function clipX(p: Poly, x0: number, x1: number): Poly | null {
  const a = clipHalfX(p, x0, true);
  if (a.length < 3) return null;
  const b = clipHalfX(a, x1, false);
  return b.length < 3 ? null : b;
}
export const polyD = (p: Poly, dx = 0, dy = 0): string => {
  let d = '';
  for (let i = 0; i < p.length; i++) d += `${i ? 'L' : 'M'}${r2(p[i][0] + dx)} ${r2(p[i][1] + dy)}`;
  return d + 'Z';
};
/** A level LENS (a ripple gap, a glitter sliver): pointed ends, `h` thick in the middle (two quadratic arcs). */
export const lensD = (cx: number, cy: number, len: number, h: number): string =>
  `M${r2(cx - len / 2)} ${r2(cy)}Q${r2(cx)} ${r2(cy - h)} ${r2(cx + len / 2)} ${r2(cy)}Q${r2(cx)} ${r2(cy + h)} ${r2(cx - len / 2)} ${r2(cy)}Z`;
/** A level PILL (a light-column slice): flat top and bottom, elliptical ends `e` long. */
export const pillD = (x0: number, x1: number, y0: number, y1: number): string => {
  const h = (y1 - y0) / 2;
  const e = Math.min((x1 - x0) / 2, Math.max(h, 3 * h));
  return `M${r2(x0 + e)} ${r2(y0)}L${r2(x1 - e)} ${r2(y0)}A${r2(e)} ${r2(h)} 0 0 1 ${r2(x1 - e)} ${r2(y1)}L${r2(x0 + e)} ${r2(y1)}A${r2(e)} ${r2(h)} 0 0 1 ${r2(x0 + e)} ${r2(y0)}Z`;
};
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

// ================================================================= the ripple rows (R6: level slices spaced by perspective)

export type Row = {
  /** Stable index (far = 0). */
  i: number;
  y0: number;
  y1: number;
  yc: number;
  h: number;
  /** Depth (m) of the row's centre. */
  z: number;
  /** Nearness 0 (the far quay) .. 1 (our edge): the Fresnel ladder, the sway, the gaps. */
  n: number;
};
/** Rows at equal real spacing `dz` (m) +- `jitter` across the water plane, from yTop down past yBot: fixed on the
 *  water (the ripple pattern travels through them as the sway's phase). */
export function makeRows(cam: WaterCam, o: {yTop: number; yBot: number; dz: number; jitter: number; seed: number; nearFrom: number; nearTo: number}): Row[] {
  const rows: Row[] = [];
  let z = camZ(cam, o.yTop);
  let y0 = o.yTop;
  for (let i = 0; y0 < o.yBot && i < 400; i++) {
    const dz = o.dz * (1 + o.jitter * (2 * hash01(o.seed, i, 1) - 1));
    const z1 = Math.max(0.3, z - dz);
    const y1 = camY(cam, z1);
    const yc = (y0 + y1) / 2;
    rows.push({i, y0, y1, yc, h: y1 - y0, z: camZ(cam, yc), n: clamp01((yc - o.nearFrom) / (o.nearTo - o.nearFrom))});
    z = z1;
    y0 = y1;
  }
  return rows;
}

/** The sway (R6, R12): each row slides sideways on a sum of waves travelling TOWARD the viewer (phase k z + w t),
 *  amplitude growing with nearness; plus a small static break per row (a calm reflection is never ruler-straight). */
export type Sway = {ampFar: number; ampNear: number; waves: {lambda: number; period: number; w: number}[]; jitter: number; seed: number};
export function rowOffset(row: Row, t: number, s: Sway): number {
  const A = lerp(s.ampFar, s.ampNear, Math.pow(row.n, 1.1));
  let v = 0;
  for (let j = 0; j < s.waves.length; j++) {
    const w = s.waves[j];
    v += w.w * Math.sin((2 * Math.PI * row.z) / w.lambda + (2 * Math.PI * t) / w.period + 2 * Math.PI * hash01(s.seed, 900 + j));
  }
  v += s.jitter * (2 * hash01(s.seed, row.i, 7) - 1);
  return A * v;
}

// ================================================================= colour: the Fresnel ladder in CIE LCh (R2-R4)

/** How a reflection is toned: HUE FROM THE WATER, VALUE FROM THE WORLD, LIGHT KEEPS ITS COLOUR. `body`: an opaque
 *  thing: its L* moves toward the water's by k (R3: lights a little darker, darks lighter), and it takes the water's own
 *  hue family at that value (deeper = a touch bluer and richer, lighter = a touch greener and paler): the physical mix
 *  of a warm reflection into the teal body is khaki in RGB (research R4), so the flat-colour answer keeps the water one
 *  colour family and lets the VALUES carry every mirrored shape; `light`: an emissive source (the lobby's gold: stays
 *  light and rich, R7); `figure`: a person (k >= 0.6: environment, never a second subject, R5). */
export type ToneKind = 'body' | 'light' | 'figure';
export type ToneOpts = {waterL: number; waterH: number; waterC: number; hueSlope: number; chromaSlope: number; cMin: number; cMax: number};
const TONES = new Map<string, string>();
export function reflectTone(src: string, k: number, o: ToneOpts, kind: ToneKind = 'body'): string {
  const key = `${src}|${k.toFixed(3)}|${kind}|${o.waterL}|${o.waterH}|${o.waterC}`;
  const hit = TONES.get(key);
  if (hit) return hit;
  const c = lch(src);
  const kk = kind === 'figure' ? Math.max(0.6, k) : k;
  const L = c.L + (o.waterL - c.L) * kk;
  let out: string;
  if (kind === 'light') {
    // R7: the lobby's gold stays the brightest, richest field in the water (L* 79-83, C* >= 35), a touch toward rose
    out = fromLch(L, Math.max(35, c.C * 0.92), c.h - 4 * kk);
  } else {
    const d = o.waterL - L;
    out = fromLch(L, Math.max(o.cMin, Math.min(o.cMax, o.waterC + d * o.chromaSlope)), o.waterH + d * o.hueSlope);
  }
  if (TONES.size > 6000) TONES.clear();
  TONES.set(key, out);
  return out;
}
/** sRGB mix toward the paper (lib/Fill's pale state: the flood's frame-0 shapes). */
export function paleOf(hex: string, k: number, paper: string): string {
  const a = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  const b = [1, 3, 5].map((i) => parseInt(paper.slice(i, i + 2), 16));
  return '#' + a.map((v, i) => Math.round(v + (b[i] - v) * k).toString(16).padStart(2, '0')).join('').toUpperCase();
}

// ================================================================= sources and the slicer

/** One thing over the water, as its REFLECTION: a polygon already mirrored about its own waterline (screen px at the
 *  camera's rest), its on-screen colour (the reflection is toned from it), its z-layer among the reflections (higher
 *  = nearer, drawn later) and the parallax plane whose float it rides. */
export type Src = {
  p: Poly;
  col: string;
  layer: number;
  plane: number;
  kind?: ToneKind;
  /** A stable id (the ragged edges' seed). */
  id?: number;
  /** No ragged edges (a contact band: the quay's own face stays crisp, R10). */
  crisp?: boolean;
  ymin?: number;
  ymax?: number;
  xmin?: number;
  xmax?: number;
};
export function withBox(s: Src): Src {
  let ymin = Infinity;
  let ymax = -Infinity;
  let xmin = Infinity;
  let xmax = -Infinity;
  for (const [x, y] of s.p) {
    if (y < ymin) ymin = y;
    if (y > ymax) ymax = y;
    if (x < xmin) xmin = x;
    if (x > xmax) xmax = x;
  }
  return {...s, ymin, ymax, xmin, xmax};
}

/** The ragged edges (R6: a rippled reflection's sides waver and its far end breaks up): in every row each piece's two
 *  ends recede a little (`small`, far -> near: an irregular zigzag on top of the sway), and from nearness `from` on a
 *  lot more (`big` at our edge: the near end breaking into fragments, R6's last 25-35 %), seeded per row and thing,
 *  breathing on its own `period` cycle; a narrow thing (a figure, a post) loses at most a fifth of its width per side,
 *  and a piece shorter than 2 px drops out. Only the deep breaks are rounded (`round` px or more). */
export type Ragged = {small: [number, number]; big: number; from: number; round: number; period: [number, number]; seed: number};
function erode(p: Poly, row: Row, id: number, t: number, rg: Ragged): {p: Poly; a: number; b: number} | null {
  let x0 = Infinity;
  let x1 = -Infinity;
  for (const q of p) {
    if (q[0] < x0) x0 = q[0];
    if (q[0] > x1) x1 = q[0];
  }
  const w = x1 - x0;
  const small = lerp(rg.small[0], rg.small[1], row.n);
  const big = rg.big * Math.pow(clamp01((row.n - rg.from) / (1 - rg.from)), 1.2);
  const cap = w < 80 ? 0.2 * w : Infinity;
  const side = (j: number) => {
    const P = lerp(rg.period[0], rg.period[1], hash01(rg.seed, row.i, id, j, 1));
    const breath = 0.62 + 0.38 * Math.sin((2 * Math.PI * t) / P + 2 * Math.PI * hash01(rg.seed, row.i, id, j, 2));
    return Math.min(cap, (small * hash01(rg.seed, row.i, id, j, 3) + big * hash01(rg.seed, row.i, id, j)) * breath);
  };
  const ea = side(0);
  const eb = side(1);
  const a = x0 + ea;
  const b = x1 - eb;
  if (b - a < 2) return null;
  const q = ea > 0.05 || eb > 0.05 ? clipX(p, a, b) : p;
  const rh = row.h >= 5;
  return q ? {p: q, a: rh && ea >= rg.round ? a : NaN, b: rh && eb >= rg.round ? b : NaN} : null;
}
/** A piece's path with its ERODED ends rounded (R6: a slice ends round, never square): a vertical segment lying on a
 *  cut becomes a half-lens bulging outward by 0.4 of its height (at most 5 px). */
export function polyDRound(p: Poly, dx: number, a: number, b: number): string {
  let d = '';
  const n = p.length;
  const on = (x: number, c: number) => Number.isFinite(c) && Math.abs(x - c) < 0.02;
  for (let i = 0; i < n; i++) {
    const q = p[i];
    if (i === 0) {
      d += `M${r2(q[0] + dx)} ${r2(q[1])}`;
      continue;
    }
    const prev = p[i - 1];
    const cut = on(prev[0], a) && on(q[0], a) ? -1 : on(prev[0], b) && on(q[0], b) ? 1 : 0;
    if (cut) {
      const bulge = Math.min(5, Math.abs(q[1] - prev[1]) * 0.4) * cut;
      d += `Q${r2(q[0] + bulge + dx)} ${r2((q[1] + prev[1]) / 2)} ${r2(q[0] + dx)} ${r2(q[1])}`;
    } else d += `L${r2(q[0] + dx)} ${r2(q[1])}`;
  }
  // the closing segment (last -> first)
  const L = p[n - 1];
  const F = p[0];
  const cut = on(L[0], a) && on(F[0], a) ? -1 : on(L[0], b) && on(F[0], b) ? 1 : 0;
  if (cut) {
    const bulge = Math.min(5, Math.abs(F[1] - L[1]) * 0.4) * cut;
    d += `Q${r2(F[0] + bulge + dx)} ${r2((F[1] + L[1]) / 2)} ${r2(F[0] + dx)} ${r2(F[1])}`;
  }
  return d + 'Z';
}

/** The reflections cut into rows: per layer, per toned colour, ONE path (every row's pieces with that row's sway). */
export type Sliced = {layer: number; color: string; d: string}[];
export function slice(srcs: Src[], rows: Row[], offs: number[], shift: (plane: number) => Pt, tone: (src: Src, row: Row) => string, rag?: {t: number; r: Ragged}): Sliced {
  const acc = new Map<string, {layer: number; color: string; parts: string[]}>();
  const byLayer = srcs.slice().sort((a, b) => a.layer - b.layer);
  for (const s of byLayer) {
    const [sx, sy] = shift(s.plane);
    const ymin = (s.ymin ?? -Infinity) + sy;
    const ymax = (s.ymax ?? Infinity) + sy;
    const moved = sx || sy ? s.p.map(([x, y]) => [x + sx, y + sy] as Pt) : s.p;
    for (let r = 0; r < rows.length; r++) {
      const row = rows[r];
      if (row.y1 <= ymin || row.y0 >= ymax) continue;
      const piece = clipBand(moved, row.y0, row.y1);
      if (!piece) continue;
      const er = rag && !s.crisp ? erode(piece, row, s.id ?? 0, rag.t, rag.r) : {p: piece, a: NaN, b: NaN};
      if (!er) continue;
      const color = tone(s, row);
      const key = `${s.layer}|${color}`;
      let a = acc.get(key);
      if (!a) acc.set(key, (a = {layer: s.layer, color, parts: []}));
      a.parts.push(Number.isFinite(er.a) || Number.isFinite(er.b) ? polyDRound(er.p, offs[r], er.a, er.b) : polyD(er.p, offs[r], 0));
    }
  }
  return Array.from(acc.values())
    .sort((a, b) => a.layer - b.layer)
    .map((a) => ({layer: a.layer, color: a.color, d: a.parts.join('')}));
}
/** The row a screen y falls in (binary search over the fixed rows), or -1. */
export function rowAtY(rows: Row[], y: number): number {
  let lo = 0;
  let hi = rows.length - 1;
  if (!rows.length || y < rows[0].y0 || y >= rows[hi].y1) return -1;
  while (lo < hi) {
    const m = (lo + hi) >> 1;
    if (rows[m].y1 <= y) lo = m + 1;
    else hi = m;
  }
  return lo;
}

// ================================================================= the ripple gaps (R6, R9): lenses of the open water

/** The gap field: per row, `slots` per 1000 px of its width (far .. near), each slot a lens that grows along its
 *  length and shrinks out again on its own slow cycle (never a fade), at a new place each cycle; far lenses are thin
 *  cut lines on the row's top edge (the light ripple lines across a reflection), near ones as tall as the row (the
 *  reflection breaking into fragments: Fresnel by coverage, the water's own colour showing between). */
export type Gaps = {
  slots: [number, number];
  len: [[number, number], [number, number]];
  /** Lens height as a share of the row height (far, near). */
  thick: [number, number];
  minH: number;
  period: [number, number];
  /** From this nearness on, a gap is a level PILL (rounded ends: the reflection breaking into fragments) rather than a
   *  pointed lens (a thin light ripple line). */
  pillFrom: number;
  seed: number;
};
export type Lens = {x: number; y: number; len: number; h: number; row: number; pill: boolean};
export function gapsAt(rows: Row[], t: number, g: Gaps, xRange: (row: Row) => [number, number] | null): Lens[] {
  const out: Lens[] = [];
  for (const row of rows) {
    const xr = xRange(row);
    if (!xr) continue;
    const width = xr[1] - xr[0];
    const per = lerp(g.slots[0], g.slots[1], row.n);
    const nSlots = Math.max(0, Math.round((per * width) / 1000 + (hash01(g.seed, row.i, 11) - 0.5)));
    const L0 = lerp(g.len[0][0], g.len[1][0], row.n);
    const L1 = lerp(g.len[0][1], g.len[1][1], row.n);
    const hk = lerp(g.thick[0], g.thick[1], Math.pow(row.n, 1.2));
    const h = Math.max(g.minH, row.h * hk);
    const y = lerp(row.y0, row.yc, smooth(0.3, 0.8, row.n));
    for (let j = 0; j < nSlots; j++) {
      const P = lerp(g.period[0], g.period[1], hash01(g.seed, row.i, j, 1));
      const ph = hash01(g.seed, row.i, j, 2);
      const u = t / P + ph;
      const cyc = Math.floor(u);
      const tau = u - cyc;
      const env = Math.pow(Math.sin(Math.PI * tau), 0.7);
      const len = lerp(L0, L1, hash01(g.seed, row.i, j, 3, cyc)) * env;
      if (len < 3) continue;
      const x = xr[0] + width * hash01(g.seed, row.i, j, 4, cyc);
      out.push({x, y, len, h: Math.min(h, len * 0.45), row: row.i, pill: row.n >= g.pillFrom});
    }
  }
  return out;
}

// ================================================================= the sun's glitter column (R8)

/** The column straight under a low sun (x), its half-width at screen y from the max wave slope `a` (rad) and the
 *  sun's elevation (rad): hw = a (y - hz) + f a sin(e) (research R8, DERIVED); slivers live on the rows, densest at the
 *  sun's still-water mirror point. */
export type Glitter = {x: number; mirrorY: number; sigma: number; slope: number; elev: number; slots: number; life: [number, number]; len: [number, number]; aspect: number; t0: number; seed: number};
export const glitterHalfW = (cam: WaterCam, g: Glitter, y: number) => g.slope * Math.max(0, y - cam.horizon) + cam.f * g.slope * Math.sin(g.elev);
export type Sliver = {x: number; y: number; len: number; h: number; row: number};
export function glitterAt(cam: WaterCam, rows: Row[], t: number, g: Glitter, yRange: [number, number]): Sliver[] {
  const out: Sliver[] = [];
  if (t < g.t0) return out;
  for (let j = 0; j < g.slots; j++) {
    const P = lerp(g.life[0], g.life[1], hash01(g.seed, j, 1));
    // each slot starts at its own moment after t0 (the field fills in, nothing pops on the frame it starts)
    const u = (t - g.t0) / P - hash01(g.seed, j, 2);
    if (u < 0) continue;
    const cyc = Math.floor(u);
    const tau = u - cyc;
    // each cycle: a life (most of it), then a short rest; the length grows in and shrinks out along the sliver
    const lifeK = lerp(0.62, 0.86, hash01(g.seed, j, 3, cyc));
    if (tau > lifeK) continue;
    const env = Math.pow(Math.sin((Math.PI * tau) / lifeK), 0.6);
    let y = g.mirrorY + g.sigma * gauss(hash01(g.seed, j, 4, cyc), hash01(g.seed, j, 5, cyc));
    y = Math.max(yRange[0], Math.min(yRange[1], y));
    const r = rowAtY(rows, y);
    if (r < 0) continue;
    const row = rows[r];
    y = row.yc;
    const hw = glitterHalfW(cam, g, y);
    const x = g.x + hw * 0.5 * gauss(hash01(g.seed, j, 6, cyc), hash01(g.seed, j, 7, cyc));
    const near = clamp01((y - yRange[0]) / Math.max(1, yRange[1] - yRange[0]));
    const L = lerp(g.len[0], g.len[1], near) * lerp(0.8, 1.2, hash01(g.seed, j, 8, cyc)) * env;
    if (L < 2) continue;
    out.push({x, y, len: L, h: Math.max(1.5, L / g.aspect), row: r});
  }
  return out;
}
