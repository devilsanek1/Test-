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
export function reflectTone(src: string, k: number, water: string, o: {rose?: number; chroma?: number; toWater?: number} = {}): string {
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
    const warm = s.h >= 300 || s.h <= 110;
    h = warm ? s.h - (o.rose ?? 4) * k : s.h + 6 * k;
    c = (warm ? s.c * (1 - 0.1 * k) : s.c * (1 - 0.3 * k)) * (o.chroma ?? 1);
  }
  if (o.toWater) {
    // a weak reflection of a pale thing (near water): the water's own hue at a soft chroma, its value lifted
    h = hueLerp(h, w.h, o.toWater);
    c = lerp(c, Math.min(w.c, 0.03), o.toWater);
  }
  return cleanColour(fromOk(l, c, h), w.h);
}

/** R2 + R4 in flat colour: a reflection's THREE Fresnel steps (the far bank, the middle, our feet). Each step moves the
 *  value toward the water's by k[i] (reflectTone), and from the second step on the reflection also loses chroma
 *  (`fade`) and turns its hue away from the water's complement (`turn` deg: a warm one toward rose and mauve, a cool one
 *  toward the water's teal), so it sinks into the water through mauve or slate, never through khaki or grey. */
export function fresnelSteps(src: string, k: [number, number, number], water: string, o: {turn?: number; fade?: [number, number]; rose?: number; toWater?: number} = {}): string[] {
  const w = okLch(water);
  return k.map((kk, i) => {
    const base = okLch(reflectTone(src, kk, water, {rose: o.rose, toWater: o.toWater}));
    if (i === 0 || base.c < 0.02) return fromOk(base.l, base.c, base.h);
    const fade = (o.fade ?? [0.78, 0.6])[i - 1];
    const turn = (o.turn ?? 12) * i;
    // warm (rose, red, orange, gold: h 300-110 through 0) turns toward mauve; cool turns toward the water's own hue
    const warm = base.h >= 300 || base.h <= 110;
    const h = warm ? base.h - turn : hueLerp(base.h, w.h, Math.min(1, (turn / 60) * 1.5));
    return cleanColour(fromOk(base.l, base.c * fade, h), w.h);
  });
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

/** R6: ROWS at equal real spacing (dz metres) projected: the slice rows of every reflection and the glitter's bed, thin
 *  far, thick near (S1, dz 0.45: 4.7 px at the far edge, 12.2 at y 1200, 23 near). Cached by value. */
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
/** A level LENS (a sliver, a ripple, a glint): pointed ends, the fullest at its middle. */
export function lensPath(cx: number, cy: number, len: number, h: number): string {
  if (len < 0.6 || h < 0.2) return '';
  const x0 = cx - len / 2;
  const x1 = cx + len / 2;
  const top = cy - h / 2;
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
};

/** The fill colour for a row of a mass. */
const colourAt = (m: Mass, y: number): string => {
  const s = m.steps ?? [];
  let i = 0;
  while (i < s.length && y >= s[i]) i++;
  return m.colors[Math.min(i, m.colors.length - 1)];
};

/** Colour runs (colour -> path data), drawn in insertion order, one <path> per colour. */
export type Runs = Map<string, string[]>;
export const pushRun = (out: Runs, c: string, d: string) => {
  if (!d) return;
  const a = out.get(c);
  if (a) a.push(d);
  else out.set(c, [d]);
};

/** Build a mass: the SOLID block (one smooth closed shape whose sides wave with the sway: the mirror is intact at its
 *  base), then the SLICES (one tapered bar per band of the shared grid; toward y1 the bands thin out, break along their
 *  length and pull in, the last ones short dashes). Breaks are static per band (seeded): only the sway moves them, so
 *  the reflection never boils. */
export function buildMass(m: Mass, grid: SliceGrid, sway: (y: number) => number, out: Runs): void {
  const k = m.sway ?? 1;
  const solid = snapRow(grid, m.solid);
  // ---- the solid block: its edges sampled every 4 px in [y0, solid] (a smooth wave, independent of the bands)
  if (solid > m.y0 + 0.5) {
    const ys: number[] = [];
    const n = Math.max(2, Math.ceil((solid - m.y0) / 4));
    for (let i = 0; i <= n; i++) ys.push(m.y0 + ((solid - m.y0) * i) / n);
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
  // ---- the slices: the bands below the block, in order; the reflection narrows along a smooth envelope (symmetric,
  // a touch of seeded asymmetry), a band breaks once at most and only in its last half, the very last may drop
  const brk = m.breakup ?? 0.5;
  const narrow = m.narrow ?? 0.22;
  const rows = grid.rows;
  const bands: [number, number, number][] = [];
  for (let i = 0; i + 1 < rows.length; i++) if (rows[i + 1] > solid + 0.01 && rows[i] < m.y1) bands.push([i, rows[i], rows[i + 1]]);
  const K = bands.length;
  bands.forEach(([i, ya, yb], j) => {
    const rr = rng(`mass/${m.id}/${i}`);
    const asym = rr.next() * 2 - 1;
    const jit = rr.next();
    const pbreak = rr.next();
    const at = rr.next();
    const drop = rr.next();
    const a = Math.max(ya, solid);
    const top = a + grid.gap(ya, yb);
    const bot = yb;
    if (bot - top < 0.8) return;
    const ym = (top + bot) / 2;
    const s = m.span(ym);
    if (!s) return;
    const u = (j + 0.5) / Math.max(1, K); // 0 at the block .. 1 at the reflection's end
    if (u > 0.82 && drop < 0.35) return;
    const pitch = yb - ya;
    const w = s[1] - s[0];
    const inset = narrow * w * Math.pow(u, 1.5) * (0.85 + 0.3 * jit);
    const x0 = s[0] + inset * (1 + 0.25 * asym);
    const x1 = s[1] - inset * (1 - 0.25 * asym);
    if (x1 - x0 < 3) return;
    const taper = Math.min((m.taper ?? 3) * (0.6 + pitch / 10), (x1 - x0) * 0.4);
    const segs: [number, number][] = [];
    if (brk > 0 && u > 0.45 && x1 - x0 > 60 && pbreak < brk * (u - 0.3) * 1.6) {
      const g0 = Math.max(6, pitch * (1 + 1.4 * u));
      const xb = x0 + (x1 - x0) * (0.25 + 0.5 * at);
      segs.push([x0, xb - g0 / 2], [xb + g0 / 2, x1]);
    } else segs.push([x0, x1]);
    const dx = sway(ym) * k;
    const col = colourAt(m, ym);
    for (const [s0, s1] of segs) {
      if (s1 - s0 < 3) continue;
      pushRun(out, col, barPath(s0 + dx, s1 + dx, top, bot, taper, taper));
    }
  });
}

/** THE SUN'S GLITTER (R8): one narrow column straight under the sun, drawn as NESTED level slivers: a still bed of
 *  gold lenses, one per band of the grid (their lengths follow the column's envelope: narrow far, wider near, longest
 *  round the sun's mirror point), and in them warm-white cores that live 0.3-0.7 s each, growing in and shrinking out
 *  along their length (never fading): the shimmer is the cores; the column itself holds still (it sways with its rows). */
export type Glitter = {
  x: number;
  yTop: number;
  yBot: number;
  /** Half-width of the column at yTop and yBot (px). */
  w: [number, number];
  /** Where it is densest (the sun's mirror point, y). */
  peak: number;
  seed: string;
  /** The cores are born from t0 (after the frame-0 flood). */
  t0: number;
};
export type GlitterLens = {cx: number; cy: number; len: number; h: number};
/** The bed: one gold lens per band (some bands left out: the column breathes), static. */
export function glitterBed(g: Glitter, grid: SliceGrid): GlitterLens[] {
  const out: GlitterLens[] = [];
  const rows = grid.rows;
  for (let i = 0; i + 1 < rows.length; i++) {
    const ya = rows[i];
    const yb = rows[i + 1];
    if (ya < g.yTop || yb > g.yBot + 2) continue;
    const r = rng(`glitbed/${g.seed}/${i}`);
    const keep = r.next();
    const len = r.next();
    const off = r.next();
    const u = clamp((ya - g.yTop) / (g.yBot - g.yTop));
    const nearPeak = clamp(1 - Math.abs((ya + yb) / 2 - g.peak) / ((g.yBot - g.yTop) * 0.6));
    if (keep < 0.18 - 0.12 * nearPeak) continue;
    const hw = lerp(g.w[0], g.w[1], u) * (0.5 + 0.38 * len + 0.25 * nearPeak);
    const top = ya + grid.gap(ya, yb);
    out.push({cx: g.x + (off - 0.5) * lerp(5, 12, u), cy: (top + yb) / 2, len: hw * 2, h: (yb - top) * 0.92});
  }
  return out;
}
/** The live cores at t: per bed lens one (two on the long near ones) warm-white sliver cycling through lives of
 *  0.3-0.7 s with rests of 0.1-0.6 s, placed inside its lens, k = its grow-in / shrink-out (0..1). */
export function glitterCores(g: Glitter, bed: GlitterLens[], t: number): (GlitterLens & {k: number})[] {
  const out: (GlitterLens & {k: number})[] = [];
  if (t < g.t0) return out;
  bed.forEach((b, i) => {
    const slots = b.len > 44 ? 2 : 1;
    for (let s = 0; s < slots; s++) {
      let tb = g.t0 + rng(`glitc/${g.seed}/${i}/${s}`).range(0, 0.8);
      for (let n = 0; n < 400 && tb <= t; n++) {
        const r = rng(`glitc/${g.seed}/${i}/${s}/${n}`);
        const life = r.range(0.3, 0.7);
        const rest = r.range(0.1, 0.6);
        if (t < tb + life) {
          const q = (t - tb) / life;
          const e = q < 0.35 ? q / 0.35 : q > 0.65 ? (1 - q) / 0.35 : 1;
          const len = b.len * r.range(0.26, 0.46);
          const half = slots === 2 ? (s === 0 ? -0.22 : 0.22) : 0;
          const cx = b.cx + b.len * (half + (r.next() - 0.5) * 0.3);
          out.push({cx, cy: b.cy + b.h * 0.06, len, h: b.h * 0.56, k: e * e * (3 - 2 * e)});
          break;
        }
        tb += life + rest;
      }
    }
  });
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
