// WATER STUDY, candidate B ("designed editorial"): THE ENGINE, film-agnostic and pure TS (no React), so node QA and
// the S1 spec (candB.tsx) share it, and the winner can move it to src/lib/water.ts as it is. The look it draws: a
// refined editorial / poster reading of calm city water (Hiroshige's bokashi in the water, a modern flat print's
// sliced reflections): every mass that stands over the water becomes ONE clean simplified reflection shape, mirrored
// about its own waterline under the shot's one camera, solid at its base and breaking into level slices (spaced by
// perspective) as it runs toward us; lights become warm vertical columns of slices; the low sun one narrow column of
// nested slivers; a few long tapered ripple lines; the shot's own sky mirrored and toned as the one gradient.
// Research: docs/look/research/2026-10-28_water.md (R1-R14); the design and its numbers: docs/v2/water/cand_B.md.
//
// Colour math in ONE place (R3-R4): OKLCH (lib/sky's OKLab), never an RGB or `atmos` mix of a warm colour into the
// teal (khaki / beige); a reflection moves toward the water's own value, keeps its hue (warm chroma held), and
// near-neutral sources take the water's hue. Every builder here is a pure function of its inputs and t (seeded with
// lib/rng; never Math.random or Date), so a frame renders the same bytes in any process.
import {hexToRgb, lchToOklab, oklabToHex, oklabToLch, rgbToCieLab, rgbToOklab, skyColorAt, type SkyKey, type SkySpec} from '../../lib/sky';
import {rng} from '../../lib/rng';

export type Pt = [number, number];

// ================================================================= colour (OKLCH in, CIE L*C*h out for the checks)

type Lch = {l: number; c: number; h: number};
/** OKLCH of a hex colour. */
export const okLch = (hex: string): Lch => oklabToLch(rgbToOklab(hexToRgb(hex)));
/** OKLCH -> '#RRGGBB' (gamut-mapped by lib/sky: L and hue kept). */
export const fromOk = (l: number, c: number, h: number): string => oklabToHex(lchToOklab({l, c, h: ((h % 360) + 360) % 360}));
/** CIE L*, C*, h of a hex colour (the house measures). */
export function cie(hex: string): {L: number; C: number; h: number} {
  const [L, a, b] = rgbToCieLab(hexToRgb(hex));
  return {L, C: Math.hypot(a, b), h: ((Math.atan2(b, a) * 180) / Math.PI + 360) % 360};
}
const clamp = (v: number, lo = 0, hi = 1) => (v < lo ? lo : v > hi ? hi : v);
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
/** The shortest hue path from a toward b by k. */
const hueLerp = (a: number, b: number, k: number) => {
  const d = ((((b - a) % 360) + 540) % 360) - 180;
  return (a + d * k + 360) % 360;
};

/** The house NEVER bands (the playbook: never beige, muddy tan, olive or grey; research R4-R5): what a toned colour must
 *  stay out of, in CIE terms. Returns '' when clean, else the band's name. */
export function neverBand(hex: string): string {
  const {L, C, h} = cie(hex);
  if (h >= 55 && h <= 95 && C < 18 && C >= 6 && L < 86) return 'beige';
  if (h > 95 && h <= 118 && C >= 6 && C < 30) return 'olive';
  if (C < 4 && L < 85) return 'grey';
  return '';
}

/** Nudge a colour out of the never bands, keeping its value: beige gets its warm chroma back (C* >= 18) or, when it is
 *  light, its hue turned toward rose; olive turns to the nearer warm or cool side; grey takes `hueIfGrey` at C* ~6. */
export function cleanColour(hex: string, hueIfGrey = 190): string {
  let out = hex;
  for (let i = 0; i < 12; i++) {
    const band = neverBand(out);
    if (!band) return out;
    const o = okLch(out);
    if (band === 'beige') out = fromOk(o.l, o.c * 1.12 + 0.002, o.h - 2);
    else if (band === 'olive') out = fromOk(o.l, o.c, o.h < 105 ? o.h - 6 : o.h + 10);
    else out = fromOk(o.l, Math.max(o.c, 0.018), o.c < 0.004 ? hueIfGrey : o.h);
  }
  return out;
}

/** R3-R4: THE REFLECTION TONE. A source colour seen in the water: its OKLab L moved toward the water's own L by k (0.3 at
 *  the far bank, 0.6 near: Fresnel), its hue kept (warm hues turned up to `rose` deg toward rose, cool ones toward
 *  violet: the rig's shade family), warm chroma held (>= 0.9x), cool chroma eased; a near-neutral source (glass, stone,
 *  a pale band) takes the water's hue at a soft chroma. Never an RGB or `atmos` mix (khaki, beige). */
export function reflectTone(src: string, k: number, water: string, o: {rose?: number; chroma?: number} = {}): string {
  const s = okLch(src);
  const w = okLch(water);
  const l = lerp(s.l, w.l, k);
  let c: number;
  let h: number;
  if (s.c < 0.02) {
    // near-neutral (C* < ~6): the water's hue, soft
    h = w.h;
    c = Math.max(s.c, Math.min(w.c, 0.022));
  } else {
    const warm = s.h >= 15 && s.h <= 110;
    h = warm ? s.h - (o.rose ?? 4) * k : s.h + 6 * k;
    c = (warm ? s.c * (1 - 0.1 * k) : s.c * (1 - 0.3 * k)) * (o.chroma ?? 1);
  }
  return cleanColour(fromOk(l, c, h), w.h);
}

/** One flat value step of the water itself (a ripple line, a contact band): the water's colour dL (OKLab L) lighter or
 *  darker, its hue kept, its chroma scaled. */
export const waterStep = (water: string, dl: number, ck = 1): string => {
  const w = okLch(water);
  return cleanColour(fromOk(w.l + dl, w.c * ck, w.h), w.h);
};

// ================================================================= the camera on the water (a level pinhole)

/** A level camera over flat water: horizon y, focal px, the eye's height over the WATER (m). */
export type WaterCam = {hz: number; f: number; eye: number};
/** Depth (m) of the water's surface at screen y. */
export const depthAt = (cam: WaterCam, y: number) => (cam.f * cam.eye) / Math.max(1e-6, y - cam.hz);
/** Screen px per metre of DEPTH at screen y (the foreshortening of a row). */
export const pxPerMDeep = (cam: WaterCam, y: number) => ((y - cam.hz) * (y - cam.hz)) / (cam.f * cam.eye);
/** Screen px per metre ACROSS at screen y. */
export const pxPerM = (cam: WaterCam, y: number) => (y - cam.hz) / cam.eye;

/** R6: ROWS at equal real spacing (dz metres) projected: the slice rows of every reflection and the ripple rows, thin
 *  far, thick near (S1, dz 0.32: 3.4 px at the far edge, 8.7 at y 1200, 16.6 near). Cached by value. */
const ROWS = new Map<string, number[]>();
export function perspectiveRows(cam: WaterCam, y0: number, y1: number, dz: number, minPitch = 2.5): number[] {
  const key = `${cam.hz}|${cam.f}|${cam.eye}|${y0}|${y1}|${dz}|${minPitch}`;
  const hit = ROWS.get(key);
  if (hit) return hit;
  const out: number[] = [y0];
  let y = y0;
  while (y < y1) {
    y += Math.max(minPitch, pxPerMDeep(cam, y) * dz);
    out.push(Math.min(y, y1 + 40));
  }
  ROWS.set(key, out);
  return out;
}

// ================================================================= motion: the row sway (R6, R12)

/** The water's calm motion: every row sways sideways (two slow sines whose phase travels TOWARD the viewer at real
 *  wave speeds: lambda / T m/s), its amplitude growing with nearness (amp[0] px at yFar -> amp[1] px at yNear). */
export type Sway = {amp: [number, number]; yFar: number; yNear: number; T: [number, number]; lambda: [number, number]; seed: string};
export function swayAt(s: Sway, cam: WaterCam, y: number, t: number): number {
  const A = lerp(s.amp[0], s.amp[1], clamp((y - s.yFar) / (s.yNear - s.yFar)));
  const z = depthAt(cam, y);
  const r = rng(`sway/${s.seed}`);
  const p1 = r.range(0, 6.283);
  const p2 = r.range(0, 6.283);
  const a = Math.sin(2 * Math.PI * (t / s.T[0] + z / s.lambda[0]) + p1);
  const b = Math.sin(2 * Math.PI * (t / s.T[1] + z / s.lambda[1]) + p2);
  return (A * (a + 0.42 * b)) / 1.42;
}

// ================================================================= shapes (one closed path each; the clean pen's rules)

const n1 = (v: number) => (Math.round(v * 10) / 10).toString();
/** A level LENS (a sliver, a ripple, a glint): pointed ends, the fullest at its middle. `bias` < 0 flattens the top
 *  (a sliver lying on the water). */
export function lensPath(cx: number, cy: number, len: number, h: number, bias = 0): string {
  if (len < 0.6 || h < 0.2) return '';
  const x0 = cx - len / 2;
  const x1 = cx + len / 2;
  const top = cy - h / 2 + Math.max(0, -bias) * h * 0.25;
  const bot = cy + h / 2;
  // two quadratic arcs: control points at 2x the half-height make the apex exactly h tall
  const kt = cy - (cy - top) * 2;
  const kb = cy + (bot - cy) * 2;
  return `M${n1(x0)} ${n1(cy)}Q${n1(cx)} ${n1(kt)} ${n1(x1)} ${n1(cy)}Q${n1(cx)} ${n1(kb)} ${n1(x0)} ${n1(cy)}Z`;
}

/** A level BAR with tapered ends (a reflection slice): flat top and bottom, each end drawn to a point on the bar's mid
 *  line over `taper` px (0 = a square end). The slice language of the whole water: every slice ends this way. */
export function barPath(x0: number, x1: number, y0: number, y1: number, taperL: number, taperR = taperL): string {
  const w = x1 - x0;
  const h = y1 - y0;
  if (w < 0.8 || h < 0.3) return '';
  const tl = Math.min(Math.max(0, taperL), w * 0.45);
  const tr = Math.min(Math.max(0, taperR), w * 0.45);
  const ym = (y0 + y1) / 2;
  let d = `M${n1(x0 + tl)} ${n1(y0)}L${n1(x1 - tr)} ${n1(y0)}`;
  d += tr > 0.3 ? `Q${n1(x1 - tr * 0.2)} ${n1(y0)} ${n1(x1)} ${n1(ym)}Q${n1(x1 - tr * 0.2)} ${n1(y1)} ${n1(x1 - tr)} ${n1(y1)}` : `L${n1(x1)} ${n1(y1)}`;
  d += `L${n1(x0 + tl)} ${n1(y1)}`;
  d += tl > 0.3 ? `Q${n1(x0 + tl * 0.2)} ${n1(y1)} ${n1(x0)} ${n1(ym)}Q${n1(x0 + tl * 0.2)} ${n1(y0)} ${n1(x0 + tl)} ${n1(y0)}` : `L${n1(x0)} ${n1(y0)}`;
  return d + 'Z';
}

/** A smooth closed outline through points (Catmull-Rom -> cubic Beziers): the clean pen's curves. */
export function smoothClosed(pts: Pt[], tension = 0.5): string {
  const n = pts.length;
  if (n < 3) return '';
  let d = `M${n1(pts[0][0])} ${n1(pts[0][1])}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % n];
    const p3 = pts[(i + 2) % n];
    const k = tension / 3;
    d += `C${n1(p1[0] + (p2[0] - p0[0]) * k)} ${n1(p1[1] + (p2[1] - p0[1]) * k)} ${n1(p2[0] - (p3[0] - p1[0]) * k)} ${n1(p2[1] - (p3[1] - p1[1]) * k)} ${n1(p2[0])} ${n1(p2[1])}`;
  }
  return d + 'Z';
}

/** An open smooth polyline (Catmull-Rom) as path commands continuing a path (no M). */
function smoothRun(pts: Pt[], tension = 0.5): string {
  let d = '';
  for (let i = 0; i + 1 < pts.length; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    const k = tension / 3;
    d += `C${n1(p1[0] + (p2[0] - p0[0]) * k)} ${n1(p1[1] + (p2[1] - p0[1]) * k)} ${n1(p2[0] - (p3[0] - p1[0]) * k)} ${n1(p2[1] - (p3[1] - p1[1]) * k)} ${n1(p2[0])} ${n1(p2[1])}`;
  }
  return d;
}

// ================================================================= the water ramp: the shot's sky, mirrored and toned

/** THE ONE GRADIENT (the brief's decided exception): the shot's own lib/sky preset seen in the water. The water at
 *  screen y mirrors the sky at y_sky = 2 hz - anchor - compress (y - anchor) (compress 1 = the exact mirror about the
 *  horizon; > 1 brings more of the sky's ramp into a narrow strip: the "teal-forward" art cheat, declared), toned by
 *  Fresnel toward the water's body: the far rows keep the sky's warmth (toned in value only, R4: a warm sky mixed into
 *  the teal reads khaki), the near rows show the body. Returns lib/sky keys for <Sky> (its eased OKLab curve and
 *  blue-noise dither), so the water's ramp is drawn, dithered and checked exactly like the sky. */
export type RampSpec = {
  sky: SkySpec;
  hz: number;
  /** The water y that mirrors its sky exactly (the far edge on the straight). */
  anchor: number;
  compress: number;
  /** The sky column the water mirrors (x; the sun's warmth there is included). */
  x: number;
  /** The water's BODY by y (what shows where it mirrors little: the near rows), as keys [y, hex]. */
  body: [number, string][];
  /** How much of the sky shows at y (art-directed Fresnel, 0..1). */
  mirror: (y: number) => number;
  /** The water ys to key (the curve between them is lib/sky's monotone cubic in OKLab). */
  at: number[];
};
const bodyAt = (body: [number, string][], y: number): string => {
  if (y <= body[0][0]) return body[0][1];
  for (let i = 0; i + 1 < body.length; i++) {
    const [ya, ca] = body[i];
    const [yb, cb] = body[i + 1];
    if (y <= yb) {
      const k = (y - ya) / (yb - ya);
      const a = okLch(ca);
      const b = okLch(cb);
      return fromOk(lerp(a.l, b.l, k), lerp(a.c, b.c, k), hueLerp(a.h, b.h, k));
    }
  }
  return body[body.length - 1][1];
};
/** The sky a water row mirrors (before toning). */
export const rampSkyY = (r: RampSpec, y: number) => 2 * r.hz - r.anchor - r.compress * (y - r.anchor);
/** One water row's colour: the mirrored sky toned toward the body (OKLab mix where the sky is pale or cool; where it is
 *  warm and chromatic, toned in value only: hue and chroma kept, R4). */
export function rampColour(r: RampSpec, y: number): string {
  const s = okLch(skyColorAt(r.sky, rampSkyY(r, y), r.x));
  const b = okLch(bodyAt(r.body, y));
  const m = clamp(r.mirror(y));
  // the plain OKLab mix (safe for pale and cool skies)
  const sa = lchToOklab(s);
  const ba = lchToOklab(b);
  const mix: [number, number, number] = [lerp(ba[0], sa[0], m), lerp(ba[1], sa[1], m), lerp(ba[2], sa[2], m)];
  const ml = oklabToLch(mix);
  // the value-only tone of a warm sky (hue and chroma kept): weighted by how warm and chromatic the sky is there
  const warm = s.h >= 20 && s.h <= 100 ? clamp((s.c - 0.012) / 0.03) : 0;
  const l = ml.l;
  const c = lerp(ml.c, s.c * 0.95, warm);
  const h = warm > 0 ? hueLerp(ml.h, s.h, warm) : ml.h;
  return cleanColour(fromOk(l, c, h), b.h);
}
/** The ramp as lib/sky keys. */
export const rampKeys = (r: RampSpec): SkyKey[] => r.at.map((y) => ({y, color: rampColour(r, y)}));

// ================================================================= reflections: one simplified mass, solid then sliced

/** THE SLICE GRID (R6), shared by every reflection of a shot: perspective rows, each with the same gap at its top (a
 *  ripple's trough: the water's own ramp shows through it), so slices of neighbouring reflections line up row by row. */
export type SliceGrid = {rows: number[]; gap: (ya: number, yb: number) => number};
/** The grid's gap: `k[0]` of the row's pitch at yFar -> `k[1]` at yNear (at least 0.8 px). */
export const sliceGrid = (rows: number[], k: [number, number], yFar: number, yNear: number): SliceGrid => ({
  rows,
  gap: (ya, yb) => Math.max(0.8, (yb - ya) * lerp(k[0], k[1], clamp(((ya + yb) / 2 - yFar) / (yNear - yFar)))),
});
/** Snap a y to the nearest row boundary of the grid. */
export const snapRow = (g: SliceGrid, y: number) => g.rows.reduce((b, r) => (Math.abs(r - y) < Math.abs(b - y) ? r : b), g.rows[0]);

/** A REFLECTION MASS (R1, R5, R6): the simplified reflection of one thing over the water, in screen px at rest.
 *  `span(y)` = its horizontal extent at row y (null = none there), already mirrored about the thing's own waterline;
 *  `y0` its top (it may start under the quay band: the band covers it), `solid` where its intact block ends and the
 *  slicing begins (snapped to a row), `y1` where its last fragment ends. Colours step by Fresnel (R2): `colors[0]` for
 *  the solid block and the slices until `steps[0]` (y), then `colors[1]`, then `colors[2]` from `steps[1]`. */
export type Mass = {
  id: string;
  span: (y: number) => [number, number] | null;
  y0: number;
  solid: number;
  y1: number;
  colors: string[];
  steps?: number[];
  /** Taper of the slices' ends (px at a 6 px row; it scales with the row pitch). */
  taper?: number;
  /** 0..1: how readily its slices break into pieces along the row (a post 0, a facade ~0.6). */
  breakup?: number;
  /** How far its slice ends pull in toward its end (0..0.4 of its width). */
  narrow?: number;
  /** Sway multiplier (0 = still). */
  sway?: number;
  /** Hide everything above this y at x (the quay band covers it; for the block's top edge). */
  topAt?: (x: number) => number;
};

/** The fill colour for a row of a mass. */
const colourAt = (m: Mass, y: number): string => {
  const s = m.steps ?? [];
  let i = 0;
  while (i < s.length && y >= s[i]) i++;
  return m.colors[Math.min(i, m.colors.length - 1)];
};

const smooth01 = (a: number, b: number, v: number) => {
  const u = clamp((v - a) / Math.max(1e-6, b - a));
  return u * u * (3 - 2 * u);
};

/** Colour runs (colour -> path data), drawn in insertion order, one <path> per colour. */
export type Runs = Map<string, string[]>;
export const pushRun = (out: Runs, c: string, d: string) => {
  if (!d) return;
  const a = out.get(c);
  if (a) a.push(d);
  else out.set(c, [d]);
};

/** Build a mass: the SOLID block (one smooth closed shape whose sides wave with the rows' sway: the mirror is intact
 *  at its base), then the SLICES (one tapered bar per row segment, on the shared grid; toward y1 the rows thin out,
 *  break along their length and pull in, the last ones short dashes). Breaks are static per row (seeded): only the sway
 *  moves them, so the reflection never boils. */
export function buildMass(m: Mass, grid: SliceGrid, sway: (y: number) => number, out: Runs): void {
  const k = m.sway ?? 1;
  const solid = snapRow(grid, m.solid);
  // ---- the solid block: its edges sampled at every row boundary in [y0, solid]
  if (solid > m.y0 + 0.5) {
    const ys: number[] = [m.y0];
    for (const y of grid.rows) if (y > m.y0 + 0.5 && y < solid - 0.5) ys.push(y);
    ys.push(solid);
    const left: Pt[] = [];
    const right: Pt[] = [];
    for (const y of ys) {
      const s = m.span(Math.min(Math.max(y, m.y0 + 0.01), solid - 0.01));
      if (!s) continue;
      const dx = sway(y) * k;
      left.push([s[0] + dx, y]);
      right.push([s[1] + dx, y]);
    }
    if (left.length >= 2) {
      let d = `M${n1(left[0][0])} ${n1(left[0][1])}L${n1(right[0][0])} ${n1(right[0][1])}`;
      d += smoothRun(right, 0.5);
      d += `L${n1(left[left.length - 1][0])} ${n1(left[left.length - 1][1])}`;
      d += smoothRun(left.slice().reverse(), 0.5);
      pushRun(out, colourAt(m, m.y0), d + 'Z');
    }
  }
  // ---- the slices
  const brk = m.breakup ?? 0.5;
  const narrow = m.narrow ?? 0.22;
  const rows = grid.rows;
  for (let i = 0; i + 1 < rows.length; i++) {
    const ya = rows[i];
    const yb = rows[i + 1];
    if (yb <= solid + 0.01 || ya >= m.y1) continue;
    // every row draws its numbers whether or not it is used (one row's pattern never depends on another's)
    const rr = rng(`mass/${m.id}/${i}`);
    const drop = rr.next();
    const nbr = rr.next();
    const pa = rr.next();
    const pb = rr.next();
    const la = rr.next();
    const lb = rr.next();
    const a = Math.max(ya, solid);
    const top = a + grid.gap(ya, yb);
    const bot = yb;
    if (bot - top < 0.6) continue;
    const ym = (top + bot) / 2;
    const s = m.span(ym);
    if (!s) continue;
    const u = smooth01(solid, m.y1, ym); // 0 at the block, 1 at the reflection's end
    if (drop < 0.72 * u * u) continue; // the end thins out
    const pitch = yb - ya;
    const w = s[1] - s[0];
    const x0 = s[0] + w * u * narrow * la;
    const x1 = s[1] - w * u * narrow * lb;
    if (x1 - x0 < 2) continue;
    const taper = Math.min((m.taper ?? 3) * (0.5 + pitch / 8), (x1 - x0) * 0.4);
    // breaks along the row (0-2), more toward the end: a short gap of the water
    let nb = 0;
    if (brk > 0 && x1 - x0 > 30) nb = Math.min(2, Math.floor(brk * (0.25 + 2.2 * u) + nbr));
    const cuts: [number, number][] = [];
    const g0 = Math.max(4, pitch * (1.4 + 2.4 * u));
    if (nb >= 1) {
      const xb = x0 + (x1 - x0) * (0.2 + 0.6 * pa);
      cuts.push([xb - g0 / 2, xb + g0 / 2]);
    }
    if (nb >= 2) {
      const xb = x0 + (x1 - x0) * (pb < 0.5 ? 0.08 + 0.14 * pb : 0.78 + 0.14 * pb);
      cuts.push([xb - g0 * 0.35, xb + g0 * 0.35]);
    }
    cuts.sort((p, q) => p[0] - q[0]);
    const segs: [number, number][] = [];
    let cur = x0;
    for (const [c0, c1] of cuts) {
      if (c0 > cur) segs.push([cur, c0]);
      cur = Math.max(cur, c1);
    }
    if (x1 > cur) segs.push([cur, x1]);
    const dx = sway(ym) * k;
    const col = colourAt(m, ym);
    for (const [s0, s1] of segs) {
      if (s1 - s0 < 2.5) continue;
      pushRun(out, col, barPath(s0 + dx, s1 + dx, top, bot, taper, taper));
    }
  }
}

/** THE SUN'S GLITTER (R8): one narrow column straight under the sun of NESTED level slivers (a gold lens with a warm
 *  white core), living 0.3-0.7 s each, growing in and shrinking out along their length (never fading), densest at
 *  the sun's mirror point; under them a still bed of short gold slices (the sun's reflected colour). */
export type Glitter = {
  x: number;
  yTop: number;
  yBot: number;
  /** Half-width of the column at yTop and yBot (px). */
  w: [number, number];
  /** Where it is densest (the sun's mirror point, y). */
  peak: number;
  /** Slots (how many slivers can be alive at once). */
  slots: number;
  bed: string;
  gold: string;
  core: string;
  seed: string;
  /** Slivers are born from t0 (after the frame-0 flood). */
  t0: number;
};
export type Sliver = {x: number; y: number; len: number; h: number; k: number};
/** The live slivers at t: each slot cycles through lives of 0.3-0.7 s with a short rest between them. */
export function glitterAt(g: Glitter, cam: WaterCam, t: number): Sliver[] {
  const out: Sliver[] = [];
  if (t < g.t0) return out;
  const span = g.yBot - g.yTop;
  for (let s = 0; s < g.slots; s++) {
    const base = rng(`glit/${g.seed}/${s}`);
    const phase = base.range(0, 0.9);
    // walk this slot's lives up to t (lives are short: a handful of steps)
    let tb = g.t0 + phase;
    let n = 0;
    while (n < 400) {
      const r = rng(`glit/${g.seed}/${s}/${n}`);
      const life = r.range(0.3, 0.7);
      const rest = r.range(0.05, 0.35);
      if (t < tb) break;
      if (t < tb + life) {
        // where: a row biased toward the peak (a triangular pick), x inside the column at that row
        const v = (r.next() + r.next()) / 2;
        const yPick = g.yTop + span * v;
        const toward = clamp(1 - Math.abs(yPick - g.peak) / span);
        const y = lerp(yPick, g.peak, 0.35 * r.next());
        const uy = clamp((y - g.yTop) / span);
        const hw = lerp(g.w[0], g.w[1], uy);
        const x = g.x + (r.next() * 2 - 1) * hw * (0.85 - 0.25 * toward);
        const near = clamp((y - g.yTop) / span);
        const len = lerp(7, 30, near) * r.range(0.65, 1.15) * (0.8 + 0.35 * toward);
        const h = lerp(1.6, 3.6, near) * r.range(0.85, 1.1);
        const q = (t - tb) / life;
        // grow in along the length (35 %), hold, shrink out (35 %)
        const k = q < 0.35 ? q / 0.35 : q > 0.65 ? (1 - q) / 0.35 : 1;
        out.push({x, y, len, h, k: k * k * (3 - 2 * k)});
        break;
      }
      tb += life + rest;
      n++;
    }
  }
  void cam;
  return out;
}

// ================================================================= ripple lines (R9)

/** RIPPLE LINES: a few long, level, tapered lines on the perspective rows, in two tones (lighter: the sky caught on a
 *  crest; darker: the body in a trough), each living a few seconds (growing in along its length, holding, shrinking
 *  out: never a fade), drifting slowly with the breeze. */
export type Ripples = {
  slots: number;
  seed: string;
  /** Where they may live: [x0, x1] and the y range; `avoid` boxes (x0, y0, x1, y1) they never start in. */
  x: [number, number];
  y: [number, number];
  avoid?: [number, number, number, number][];
  /** Length (px) at the far and near y, and thickness. */
  len: [number, number];
  thick: [number, number];
  /** Drift (px/s) at the far and near y (+ = right). */
  drift: [number, number];
  life: [number, number];
  t0: number;
};
export type RippleLine = {x: number; y: number; len: number; h: number; tone: number};
export function ripplesAt(rp: Ripples, t: number, bounds?: (x: number) => [number, number]): RippleLine[] {
  const out: RippleLine[] = [];
  if (t < rp.t0) return out;
  for (let s = 0; s < rp.slots; s++) {
    const base = rng(`rip/${rp.seed}/${s}`);
    let tb = rp.t0 - base.range(0, rp.life[1]);
    let n = 0;
    while (n < 200) {
      const r = rng(`rip/${rp.seed}/${s}/${n}`);
      const life = r.range(rp.life[0], rp.life[1]);
      if (t < tb) break;
      if (t < tb + life) {
        // a spot: biased toward the near water (where the open teal is), clear of the avoid boxes
        let x = 0;
        let y = 0;
        let ok = false;
        for (let tries = 0; tries < 8 && !ok; tries++) {
          const v = Math.sqrt(r.next());
          y = lerp(rp.y[0], rp.y[1], v);
          x = lerp(rp.x[0], rp.x[1], r.next());
          ok = !(rp.avoid ?? []).some(([a, b, c, d]) => x >= a && x <= c && y >= b && y <= d);
          if (ok && bounds) {
            const [lo, hi] = bounds(x);
            ok = y > lo + 4 && y < hi - 3;
          }
        }
        if (!ok) break;
        const near = clamp((y - rp.y[0]) / (rp.y[1] - rp.y[0]));
        const q = (t - tb) / life;
        const grow = q < 0.3 ? q / 0.3 : q > 0.7 ? (1 - q) / 0.3 : 1;
        const g = grow * grow * (3 - 2 * grow);
        const len = lerp(rp.len[0], rp.len[1], near) * r.range(0.7, 1.2) * g;
        const h = lerp(rp.thick[0], rp.thick[1], near) * r.range(0.85, 1.1) * (0.55 + 0.45 * g);
        const v = lerp(rp.drift[0], rp.drift[1], near);
        out.push({x: x + v * (t - tb), y, len, h, tone: r.next() < 0.55 ? -1 : 1});
        break;
      }
      tb += life + r.range(0.2, 1.2);
      n++;
    }
  }
  return out;
}

// ================================================================= the flood (frame 0: the water lands pale, then floods)

/** sRGB mix toward the paper (exactly lib/Fill's pale state). */
export function paleOf(hex: string, k: number, paper: string): string {
  const a = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  const b = [1, 3, 5].map((i) => parseInt(paper.slice(i, i + 2), 16));
  return '#' + a.map((v, i) => Math.round(v + (b[i] - v) * k).toString(16).padStart(2, '0')).join('').toUpperCase();
}
