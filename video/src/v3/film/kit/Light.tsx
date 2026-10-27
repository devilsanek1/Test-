// kit/Light.tsx: LIGHT AND SHADOW for the v3 film. Owner (v3 G5b, 2026-10-27): "We don't have the shadows much and the
// light is weirdly put; lighting and shadows should be gentle but should exist." The system is the retro's light.md
// sections C-D; the how-to is kit/README.md "Light and shadow". Everything is a FLAT SHAPE:
//   * a shadow is a flat shape MULTIPLIED with one tint per set (so every surface gets "darker + hue-shifted" for free,
//     never grey, never a separate fill colour); shadows that overlap inside one layer never double-darken;
//   * a light is a flat step LIGHTER and WARMER than what it lands on (pools, window spill, a rim), never a disc sticker;
//   * a soft edge is 2 flat steps (a half-tint penumbra band), never blur, a gradient or an opacity fade.
//
//   const rig = nookRig(NOOK_LAYOUT.pov);                        // ONE rig per set, locked at G3 with the story
//   <Lit rig={rig}>
//     ...the set (wall, window, desk)...   <LightPool />          // the pool: two opaque steps on the desk
//     <ShadowLayer> <ContactShadow x={842} y={1236} w={98} /> <CastShadow x={380} y={1215} w={120} h={60} /> </ShadowLayer>
//     {mug} <FormShade of={mug} c={[842, 1180]} />                // objects, each with its shade side
//     <Ambient holes={[{e: rig.wash, soft: 26, steps: 2}, {e: rig.pool, soft: 12}, {of: laptop}]} />  // one step down
//     <Rim d={lidPath} c={lidCentre} />                            // the subject's lit edge, on top
//   </Lit>
//
// LAYER ORDER (bottom to top): set fills -> ground light (LightPool, WindowSpill, Halo on the sky) -> ground shadows
// (ShadowLayer: ContactShadow, CastShadow, Shadow) -> objects -> per-object FormShade / Shade -> Ambient (LAST over the
// set: one tint step outside the light; holes for the lit zones, the lit objects and every source) -> Rim, PoolLift.
// Captions come later (Film draws them): they are never lit. Ink is multiplied like the fills it sits on, which keeps
// near-black ink near-black (x 0.87 at most): "ink stays unlit".
//
// Geometry is canvas px at camera rest (the set's own coordinates: put these layers inside the same camera group as
// the set). Ground directions use the ground's foreshortening `rig.ground` (ry / rx: desk 0.3, street 0.2-0.35):
// ground (x, z) maps to screen (x, z * ground). Angles are SCREEN degrees: 0 = right, 90 = down (toward the viewer
// on a ground plane), 180 = left, 270 = up (away from the viewer).
//
// Pen-agnostic: no lib/sketch strokes (exact paths only), so the clean pen and the sketch pen both get the same light.
// Opt-in and local to v3: nothing in lib/ changes; a panel without these layers renders exactly as before.

import React, {createContext, useContext, useId} from 'react';
import {getInputProps} from 'remotion';
import {getBoundingBox} from '@remotion/paths';
import {Fill} from '../../../lib/Fill';
import {ExitFade, exitFillProgress, Look, useExit, useLook} from '../../../lib/exit';
import {ease, useTime} from '../../../lib/time';
import {mat, useXf, XG} from '../../../lib/xf';
import {EMBER} from '../palette';
import {At, Pt} from './util';

// ================================================================= colour (sRGB hex <-> CIE Lab D65, the retro's L*/C*/h)

const c01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

/** '#RRGGBB' (or '#RGB') -> [r, g, b] in 0..1 (sRGB, gamma-encoded). */
export function hexRgb(hex: string): [number, number, number] {
  let h = hex.replace('#', '').trim();
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  return [parseInt(h.slice(0, 2), 16) / 255, parseInt(h.slice(2, 4), 16) / 255, parseInt(h.slice(4, 6), 16) / 255];
}
export const rgbHex = (r: number, g: number, b: number) => '#' + [r, g, b].map((v) => Math.round(c01(v) * 255).toString(16).padStart(2, '0')).join('').toUpperCase();

const toLin = (c: number) => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
const toGam = (c: number) => (c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055);
const XN = 0.95047;
const ZN = 1.08883;
const EPS = 216 / 24389;
const KAP = 24389 / 27;
const fLab = (t: number) => (t > EPS ? Math.cbrt(t) : (KAP * t + 16) / 116);
const fInv = (t: number) => (t * t * t > EPS ? t * t * t : (116 * t - 16) / KAP);

/** CIE L*a*b* (D65) of a hex colour: [L*, a*, b*]. */
export function lab(hex: string): [number, number, number] {
  const [r, g, b] = hexRgb(hex).map(toLin);
  const X = (0.4124564 * r + 0.3575761 * g + 0.1804375 * b) / XN;
  const Y = 0.2126729 * r + 0.7151522 * g + 0.072175 * b;
  const Z = (0.0193339 * r + 0.119192 * g + 0.9503041 * b) / ZN;
  const fy = fLab(Y);
  return [116 * fy - 16, 500 * (fLab(X) - fy), 200 * (fy - fLab(Z))];
}
/** L*, C*, h (degrees) of a hex colour. */
export function lch(hex: string): {L: number; C: number; h: number} {
  const [L, a, b] = lab(hex);
  return {L, C: Math.hypot(a, b), h: ((Math.atan2(b, a) * 180) / Math.PI + 360) % 360};
}
function labRgb(L: number, a: number, b: number): [number, number, number] {
  const fy = (L + 16) / 116;
  const X = fInv(fy + a / 500) * XN;
  const Y = fInv(fy);
  const Z = fInv(fy - b / 200) * ZN;
  return [3.2404542 * X - 1.5371385 * Y - 0.4985314 * Z, -0.969266 * X + 1.8760108 * Y + 0.041556 * Z, 0.0556434 * X - 0.2040259 * Y + 1.0572252 * Z].map(toGam) as [number, number, number];
}
/** Hex from L*, C*, h; out-of-gamut colours keep L* and hue and lose chroma until they fit. */
export function fromLch(L: number, C: number, h: number): string {
  const hr = (h * Math.PI) / 180;
  let c = Math.max(0, C);
  for (let i = 0; i < 60; i++) {
    const rgb = labRgb(L, c * Math.cos(hr), c * Math.sin(hr));
    if (rgb.every((v) => v >= -0.001 && v <= 1.001) || c < 0.5) return rgbHex(rgb[0], rgb[1], rgb[2]);
    c *= 0.95;
  }
  const rgb = labRgb(L, 0, 0);
  return rgbHex(rgb[0], rgb[1], rgb[2]);
}
/** Per-channel sRGB multiply: what a `mix-blend-mode: multiply` layer of `tint` does to `surface` in the browser. */
export const multiply = (surface: string, ...tints: string[]) => {
  const v = hexRgb(surface);
  for (const t of tints) {
    const c = hexRgb(t);
    v[0] *= c[0];
    v[1] *= c[1];
    v[2] *= c[2];
  }
  return rgbHex(v[0], v[1], v[2]);
};
/** Per-channel sRGB screen (what `mix-blend-mode: screen` does): 1 - (1 - a)(1 - b). */
export const screen = (surface: string, lift: string) => {
  const a = hexRgb(surface);
  const b = hexRgb(lift);
  return rgbHex(1 - (1 - a[0]) * (1 - b[0]), 1 - (1 - a[1]) * (1 - b[1]), 1 - (1 - a[2]) * (1 - b[2]));
};
/** sRGB mix a -> b by k. */
export const mixHex = (a: string, b: string, k: number) => {
  const x = hexRgb(a);
  const y = hexRgb(b);
  return rgbHex(x[0] + (y[0] - x[0]) * k, x[1] + (y[1] - x[1]) * k, x[2] + (y[2] - x[2]) * k);
};
/** A partial multiply step: the tint at strength k (0 = white = no change, 1 = the full tint). The penumbra = k 0.5. */
export const step = (tint: string, k = 0.5) => mixHex('#FFFFFF', tint, k);
/** The multiply tint that turns `surface` into `target` (per channel, capped at 1): derive a set's tint from a measured
 *  pair (e.g. the snow ambient: tintFor(EMBER.snow, '#C9CFE6') = #DFE1ED). */
export const tintFor = (surface: string, target: string) => {
  const s = hexRgb(surface);
  const t = hexRgb(target);
  return rgbHex(...(s.map((v, i) => (v > 0 ? c01(t[i] / v) : 1)) as [number, number, number]));
};
/** A LIGHTER, WARMER variant of a surface (a pool or spill on a ground with no preset): L* + dL, the hue turned up to
 *  `warm` degrees toward gold (h 80), chroma x `chroma`. relit('#C9CFE6', 5) ~ the snow pool's outer step. */
export function relit(surface: string, dL: number, o: {warm?: number; chroma?: number} = {}): string {
  const {L, C, h} = lch(surface);
  const warm = o.warm ?? 40;
  const d = ((80 - h + 540) % 360) - 180; // signed shortest turn toward gold
  const turn = Math.sign(d) * Math.min(Math.abs(d), warm);
  return fromLch(Math.min(99, L + dL), C * (o.chroma ?? 1) + Math.min(6, Math.abs(turn) * 0.1), h + turn);
}

// ================================================================= geometry (exact paths: no pen, no jitter)

export type Ellipse = {cx: number; cy: number; rx: number; ry: number};
const r2 = (v: number) => Math.round(v * 100) / 100;
/** An exact ellipse as one closed path (two arcs). */
export const ellipseD = (e: Ellipse) => `M${r2(e.cx - e.rx)} ${r2(e.cy)}A${r2(e.rx)} ${r2(e.ry)} 0 1 0 ${r2(e.cx + e.rx)} ${r2(e.cy)}A${r2(e.rx)} ${r2(e.ry)} 0 1 0 ${r2(e.cx - e.rx)} ${r2(e.cy)}Z`;
/** A closed polygon path. */
export const polyD = (pts: Pt[]) => (pts.length ? 'M' + pts.map(([x, y]) => `${r2(x)} ${r2(y)}`).join('L') + 'Z' : '');
/** A closed rect path. */
export const rectD = (x: number, y: number, w: number, h: number) => polyD([[x, y], [x + w, y], [x + w, y + h], [x, y + h]]);
/** Points around an ellipse (n samples). */
export const ellipsePts = (e: Ellipse, n = 40): Pt[] => Array.from({length: n}, (_, i) => [e.cx + e.rx * Math.cos((i / n) * Math.PI * 2), e.cy + e.ry * Math.sin((i / n) * Math.PI * 2)] as Pt);
/** Convex hull (monotone chain), counter-clockwise on screen. */
export function hull(pts: Pt[]): Pt[] {
  const p = [...pts].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  if (p.length < 3) return p;
  const cross = (o: Pt, a: Pt, b: Pt) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lo: Pt[] = [];
  for (const q of p) {
    while (lo.length >= 2 && cross(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop();
    lo.push(q);
  }
  const up: Pt[] = [];
  for (let i = p.length - 1; i >= 0; i--) {
    const q = p[i];
    while (up.length >= 2 && cross(up[up.length - 2], up[up.length - 1], q) <= 0) up.pop();
    up.push(q);
  }
  return lo.slice(0, -1).concat(up.slice(0, -1));
}
const centroid = (pts: Pt[]): Pt => {
  let x = 0;
  let y = 0;
  for (const p of pts) {
    x += p[0];
    y += p[1];
  }
  return [x / Math.max(1, pts.length), y / Math.max(1, pts.length)];
};
/** A convex point set grown by r px (Minkowski sum with a 12-gon), as hull points. */
const grow = (pts: Pt[], r: number): Pt[] => (r <= 0 ? pts : hull(pts.flatMap(([x, y]) => Array.from({length: 12}, (_, i) => [x + r * Math.cos((i * Math.PI) / 6), y + r * Math.sin((i * Math.PI) / 6)] as Pt))));
/** Scale points about their centroid so the set shrinks by ~r px (r < its half-size). */
const shrink = (pts: Pt[], r: number): Pt[] => {
  if (r <= 0) return pts;
  const c = centroid(pts);
  const R = Math.max(1, ...pts.map(([x, y]) => Math.hypot(x - c[0], y - c[1])));
  const k = Math.max(0.2, 1 - r / R);
  return pts.map(([x, y]) => [c[0] + (x - c[0]) * k, c[1] + (y - c[1]) * k] as Pt);
};
const add = (pts: Pt[], v: Pt): Pt[] => pts.map(([x, y]) => [x + v[0], y + v[1]] as Pt);
const norm = (v: Pt): Pt => {
  const l = Math.hypot(v[0], v[1]);
  return l > 1e-9 ? [v[0] / l, v[1] / l] : [0, 0];
};
const deg = (a: number): Pt => [Math.cos((a * Math.PI) / 180), Math.sin((a * Math.PI) / 180)];
/** Is (x, y) inside the ellipse (scaled by k)? */
export const inEllipse = (e: Ellipse, p: Pt, k = 1) => ((p[0] - e.cx) / (e.rx * k)) ** 2 + ((p[1] - e.cy) / (e.ry * k)) ** 2 <= 1;
type BB = {x: number; y: number; w: number; h: number};
const bbCache = new Map<string, BB>();
function pathBox(d: string): BB {
  let b = bbCache.get(d);
  if (!b) {
    try {
      const r = getBoundingBox(d);
      b = {x: r.x1, y: r.y1, w: r.x2 - r.x1, h: r.y2 - r.y1};
    } catch {
      b = {x: 0, y: 0, w: 0, h: 0};
    }
    if (bbCache.size > 4000) bbCache.clear();
    bbCache.set(d, b);
  }
  return b;
}

// ================================================================= the rig: ONE per set (light.md C.1)

/** A practical: a lamp, a lantern, a bulb. `src` = the light on screen (the shade's mouth, the lantern's centre);
 *  `foot` = the point on the ground right under it (cast shadows radiate from here); `H` = its height above that
 *  ground (screen px at the foot's depth); `pool` = the light it throws on the ground (cast shadows live only inside). */
export type PointLight = {kind: 'point'; src: Pt; foot: Pt; H: number; pool?: Ellipse};
/** A far source (the sun, a bank of ceiling lights, the glow of the sky beyond the town): parallel shadows. `toward` =
 *  the screen direction the shadows fall on the ground (0 right, 90 toward us, 180 left, 270 away); `el` = elevation
 *  (deg): shadow length = h / tan(el), so 51-73 deg gives the gentle 0.8-0.3 h. */
export type SunLight = {kind: 'sun'; toward: number; el: number};
/** Blue hour's open sky: no cast direction (tops lit, contact shadows only). `from` = the screen direction the brighter
 *  sky lies in, for form shades (deg; default 250: up and a little left). */
export type SkyLight = {kind: 'sky'; from?: number};
export type Light = PointLight | SunLight | SkyLight;

/** Multiply tints (CRAFT §d.3): per set, `form` (an object's side away from the key), `cast` (a cast shadow) and
 *  `contact` (the strip where a thing touches the ground) are ONE tint family: three strengths of one hue (`tintFamily`).
 *  `ambient` (one step down outside the light: the room's falloff) is the light's absence, not a shadow: it keeps the
 *  surface's hue within ~10 deg. The half step (penumbra) is `step(tint, 0.5)`. */
export type Tints = {ambient: string; form: string; cast: string; contact: string};

/** One shadow family: `base` at three strengths (0 = white = no change, 1 = the base). */
export const tintFamily = (base: string, k: {form: number; cast: number; contact: number}, ambient: string): Tints => ({
  ambient,
  form: mixHex('#FFFFFF', base, k.form),
  cast: mixHex('#FFFFFF', base, k.cast),
  contact: mixHex('#FFFFFF', base, k.contact),
});

export type LightRig = {
  /** 'nook' | 'shop' | 'street' | 'roof' (or a lane's own). */
  name: string;
  /** THE key (where the eye goes). */
  key: Light;
  /** Practicals besides the key (street lamps under a sky key): each lights its own pool and casts inside it. */
  lamps: PointLight[];
  /** A secondary, cooler light that only colours (the nook's window at blue hour): data for Rim `from="fill"`. */
  fill?: {from: number; color: string};
  /** The ground's foreshortening ry / rx (desk 0.3, street 0.2-0.35). */
  ground: number;
  /** Longest cast shadow, as a multiple of the object's height (light.md: 1.5; the street 1.2). */
  cap: number;
  tints: Tints;
  /** The pool on this set's ground: [outer, inner], both LIGHTER and WARMER than the ground they land on. */
  pool: [string, string];
  /** The set's ground in its LIT palette colour (the desk, the snow): what pools, casts and contacts land on. */
  surface: string;
  /** The open ground in ambient light (exteriors: the snow at L* 83, painted directly; interiors: the surface x the
   *  ambient tint, which Ambient applies). Default multiply(surface, tints.ambient). */
  groundAmbient?: string;
  /** The lit variant for rims (warm lamp core). */
  rim: string;
  /** Screen colour that lifts a warm object inside a pool (+6..+11 L*). */
  lift: string;
  /** A lantern's one halo step on the sky (r <= 1.7x the lantern width), never a disc on the ground. */
  halo: string;
  /** Lit window panes at dusk (L* 85-92: the brightest warm things outside). */
  window: string;
  /** A lit window's spill on the ground (+4 L*, warm). */
  spill: string;
  /** A source's own core (bulb, lantern, lamp mouth: L* 95-98, <= 1 % of the frame). */
  source: string;
  /** Sky-facing snow caps at dusk (CRAFT §d.2: L* 87-89, thin, never above the pool core: a sky at ~45 lights them). */
  snowCap: string;
  /** Default form shade: fraction of the object's extent (0.25-0.4) and, for a backlit key, 'down' (tops lit). */
  form: {frac: number; backlit?: boolean};
  /** Penumbra widths (px): contact, cast [base, tip], a hole's soft edge, the lamp wash. */
  soft: {contact: number; cast: [number, number]; hole: number; wash: number};
  /** A lamp's lit wash on the wall (the room's falloff: the one lit zone above the desk). */
  wash?: Ellipse;
};

/** The warm interior family: rose base #CBA6A6 (h 21) at 0.40 / 0.55 / 0.90 = form #EADBDB, cast #E2CECE, contact
 *  #D0AFAF. Measured on the room's surfaces (CRAFT §d.3 targets): wall form / cast / contact dL* -10 / -14 / -23, desk
 *  -7 / -10 / -17, pool -8..-9 / -11..-13 / -19..-21; warm hues turn 4-17 deg toward rose, chroma kept; a contact strip
 *  on the AMBIENT desk stays at L* 46.6 (the ladder's 45+; the retro's #C8A3B0 at full strength gave 44). The ambient
 *  #EEDED8 turns the wall only 10 deg (peach stays peach: wall 91 -> 82, desk 68 -> 61). */
export const TINT_ROOM: Tints = tintFamily('#CBA6A6', {form: 0.4, cast: 0.55, contact: 0.9}, '#EEDED8');
/** The dusk exterior family: violet base #BBA8DA (h 306) at 0.50 / 0.58 / 1.0. On the ambient snow (83): form / cast /
 *  contact dL* -12 / -13 / -23, turning 13-18 deg toward violet (CRAFT §d.3: cool surfaces 10-16); warm light surfaces
 *  keep their chroma (a cream shoe 10.5 -> 10.2, the pool's outer step 7 -> 10.6, a window spill 11 -> 9.8): CRAFT's
 *  bluer #B4AED8 / #D3CFEA greyed them (cream 7.5, spill 7.3: a violet on a warm light cancels toward grey; measured with
 *  scripts/qa/check_light.py). The ambient #DFE1ED = the open snow 93 -> 83 (tintFor(EMBER.snow, '#C9CFE6')). */
export const TINT_DUSK: Tints = tintFamily('#BBA8DA', {form: 0.5, cast: 0.58, contact: 1}, '#DFE1ED');

/** The desk pool on CRAFT §d.2's ladder: ring #FFD7A4 (L* 88), core #FFE8C1 (L* 93), both warmer than the desk. (§d.7's
 *  example #EBB07F / #F6CD98, L* 76 / 85, sits under the ambient wall's 82 at the ring: the brightest 5 % then lands on
 *  the upper wall, not on the subject in the pool; measured in the demo.) */
export const POOL_DESK: [string, string] = ['#FFD7A4', '#FFE8C1'];

const BASE = {
  rim: EMBER.core,
  lift: '#4A2E10',
  halo: '#8A8FB5',
  window: '#FFD27A',
  spill: '#EBD8C8',
  source: '#FFF4DA',
  snowCap: '#D9DFF2',
};

/** Where the kit Lamp's mouth is (the shade's lit ellipse), from its pose (Nook's LampPose: head + rot + scale). */
export function lampMouth(pose: {head: Pt; rot: number; scale?: number}): {c: Pt; halfW: number; axis: Pt} {
  const s = pose.scale ?? 1;
  const a = (pose.rot * Math.PI) / 180;
  const axis: Pt = [-Math.sin(a), Math.cos(a)]; // the shade's local +y (toward the mouth), rotated
  return {c: [pose.head[0] + axis[0] * 100 * s, pose.head[1] + axis[1] * 100 * s], halfW: 72 * s, axis};
}

/** The pool a lamp throws (light.md C.7): centred on the mouth's foot pushed along the shade's tilt, rx = `k` x the
 *  mouth's half-width (2.5-3.5), ry = rx x the ground's foreshortening. `groundY` = the ground's screen y under it. */
export function poolFor(pose: {head: Pt; rot: number; scale?: number}, groundY: number, o: {k?: number; ground?: number; push?: number} = {}): Ellipse {
  const m = lampMouth(pose);
  const rx = m.halfW * (o.k ?? 3.2);
  const drop = groundY - m.c[1];
  const push = (o.push ?? 0.6) * drop * (m.axis[0] / Math.max(0.2, m.axis[1]));
  return {cx: m.c[0] + push, cy: groundY, rx, ry: rx * (o.ground ?? 0.3)};
}

/** The nook's rig (O1 / S7 / S12 / S13 / S15 / S16): the desk lamp is THE key (a point light on screen-left, its pool
 *  on the desk); the window is a cool fill that only colours (shade tints lean rose / plum; Rim `from="fill"`); its
 *  glass is a source (never darkened). Pass the shot's lamp pose and pool (NOOK_LAYOUT[variant], or a lane's own).
 *  NO wall wash by default: v3's anglepoise points down and always stands in front of the window, so a wash's edge
 *  wraps round the glass and reads as the WINDOW glowing (tried in the demo); the room's falloff is the ambient step,
 *  the pool and the lit objects. Pass `wash` only for a lamp against an open wall (a table lamp). */
export function nookRig(L: {lamp: {head: Pt; rot: number; scale?: number; base: Pt}; pool: Ellipse; glass?: {x: number; y: number; w: number; h: number}}, o: {wash?: Ellipse | null} = {}): LightRig {
  const m = lampMouth(L.lamp);
  const foot: Pt = [m.c[0], L.pool.cy];
  const glass = L.glass;
  return {
    name: 'nook',
    key: {kind: 'point', src: m.c, foot, H: Math.max(40, foot[1] - m.c[1]), pool: L.pool},
    lamps: [],
    fill: glass ? {from: 270, color: '#C9D2EE'} : undefined,
    ground: L.pool.ry / L.pool.rx,
    cap: 1.5,
    tints: TINT_ROOM,
    pool: POOL_DESK,
    surface: EMBER.desk,
    ...BASE,
    form: {frac: 0.34},
    soft: {contact: 3.5, cast: [2, 12], hole: 12, wash: 26},
    wash: o.wash ?? undefined,
  };
}

/** The four places of v3 (light.md C.1). Geometry-free presets: a lane copies one and sets the key's screen geometry
 *  for its shot (`withKey`), or uses `nookRig()` for the nook. */
export const RIGS: Record<'nook' | 'shop' | 'street' | 'roof', LightRig> = {
  /** The nook at blue hour: the O1 pov lamp (point) + the window as the cool fill. */
  nook: nookRig({lamp: {base: [330, 1180], head: [214, 990], rot: 10}, pool: {cx: 210, cy: 1206, rx: 236, ry: 74}, glass: {x: 180, y: 630, w: 720, h: 430}}),
  /** The shop (S5): the ceiling's warm bank high upper-left = a 'sun' (short shadows falling right and toward us, form
   *  shades on the right), the display window behind a cool fill. */
  shop: {
    name: 'shop',
    key: {kind: 'sun', toward: 35, el: 64},
    lamps: [],
    fill: {from: 0, color: '#C9D2EE'},
    ground: 0.3,
    cap: 0.8,
    tints: TINT_ROOM,
    pool: POOL_DESK,
    surface: EMBER.desk,
    ...BASE,
    form: {frac: 0.3},
    soft: {contact: 3.5, cast: [2, 10], hole: 12, wash: 26},
  },
  /** The street at blue hour (S4 / S6 / S10 / S14, the window views): the open sky is the key (tops lit, no cast
   *  direction, contact shadows only), the brighter sky upper-left; street lamps are practicals (their own pools; cast
   *  shadows only inside them); lit windows spill onto the snow; the open snow sits at its ambient L* 83. */
  street: {
    name: 'street',
    key: {kind: 'sky', from: 235},
    lamps: [],
    ground: 0.25,
    cap: 1.2,
    tints: TINT_DUSK,
    pool: ['#EADBD2', '#F6E4CA'],
    surface: EMBER.snow,
    groundAmbient: '#C9CFE6',
    ...BASE,
    rim: '#F6E4CA',
    form: {frac: 0.32},
    soft: {contact: 3.5, cast: [2, 14], hole: 12, wash: 26},
  },
  /** The roof (S9): the glow beyond the town is a 3/4 BACKLIGHT (CINEMATIC_GUIDE S9): tops and the key-side edges lit,
   *  the camera-facing sides and the backs in shade, short shadows falling toward us. */
  roof: {
    name: 'roof',
    key: {kind: 'sun', toward: 100, el: 58},
    lamps: [],
    ground: 0.3,
    cap: 0.8,
    tints: TINT_DUSK,
    pool: ['#EADBD2', '#F6E4CA'],
    surface: EMBER.snow,
    groundAmbient: '#C9CFE6',
    ...BASE,
    rim: '#F6E4CA',
    form: {frac: 0.62, backlit: true},
    soft: {contact: 3.5, cast: [2, 12], hole: 12, wash: 26},
  },
};

/** A copy of a rig with another key and / or practicals (a shot's own screen geometry). */
export const withKey = (rig: LightRig, key: Light, lamps: PointLight[] = rig.lamps): LightRig => ({...rig, key, lamps});

/** A street lamp as a practical: lantern at `src`, standing on the ground at `base` (its post's foot), pool rx = k x
 *  the post height (light.md: 0.8-1.0; 0.75 keeps several pools apart), ry = rx x ground. */
export function streetLamp(src: Pt, base: Pt, o: {k?: number; ground?: number} = {}): PointLight {
  const H = Math.max(40, base[1] - src[1]);
  const rx = H * (o.k ?? 0.8);
  return {kind: 'point', src, foot: [src[0], base[1]], H, pool: {cx: src[0], cy: base[1], rx, ry: rx * (o.ground ?? 0.25)}};
}

/** The set's ground in ambient light (see `groundAmbient`). */
export const groundAmbientOf = (rig: LightRig) => rig.groundAmbient ?? multiply(rig.surface, rig.tints.ambient);

/** A pool's two steps: the outer ellipse and the inner one (k x its size), leaning toward the source's foot (the light
 *  is strongest right under it). LightPool draws them; CastShadow shades each with its own tint. */
export function poolSteps(pool: Ellipse, foot?: Pt, k = 0.6): {outer: Ellipse; inner: Ellipse} {
  const fx = foot ? foot[0] : pool.cx;
  const fy = foot ? foot[1] : pool.cy;
  return {outer: pool, inner: {cx: pool.cx + (fx - pool.cx) * 0.35, cy: pool.cy + (fy - pool.cy) * 0.35 - pool.ry * 0.06, rx: pool.rx * k, ry: pool.ry * k}};
}

/** Cast-shadow tints INSIDE a pool, one per step: the set's cast tint, weakened (a lower strength of the same family)
 *  just enough that the shadow never lands darker than the unlit ground beyond the pool's edge (its ambient, a third of
 *  a cast step deeper). So a shadow in a lamp's light reads as "the light blocked here": gentle on a bright desk pool
 *  (there the full cast tint is already lighter) and, on a lamp pool over night snow, 88 -> ~79 against the ambient
 *  snow's 83 (the full tint gave 74: a shadow ending in a lighter dark at the pool's edge). Same hue as every other
 *  shadow of the set (a "light removed" tint toward the cool ground cannot be reached by a multiply on a warm pool: the
 *  blue channel caps, and it lands grey, C* ~5; measured with scripts/qa/check_light.py). */
export function poolCastTints(rig: LightRig): [string, string] {
  const floorL = lch(multiply(groundAmbientOf(rig), step(rig.tints.cast, 0.35))).L;
  return rig.pool.map((p) => {
    if (lch(multiply(p, rig.tints.cast)).L >= floorL) return rig.tints.cast;
    let lo = 0;
    let hi = 1;
    for (let i = 0; i < 24; i++) {
      const k = (lo + hi) / 2;
      if (lch(multiply(p, step(rig.tints.cast, k))).L > floorL) lo = k;
      else hi = k;
    }
    return step(rig.tints.cast, lo);
  }) as [string, string];
}

// ================================================================= context: <Lit rig> (and the global off switch)

type LitV = {rig: LightRig; off: boolean};
const LitCtx = createContext<LitV>({rig: RIGS.nook, off: false});
/** Every light layer below reads this rig. `off` renders none of them (A/B renders: the same panel unlit; or, for any
 *  composition, the input prop `--props='{"lightOff":true}'`). */
export const Lit: React.FC<{rig: LightRig; off?: boolean; children?: React.ReactNode}> = ({rig, off = false, children}) => <LitCtx.Provider value={{rig, off}}>{children}</LitCtx.Provider>;
export const useRig = () => useContext(LitCtx).rig;
/** The render's input props say `{"lightOff": true}`: every light layer of every composition is off (the A side of
 *  scripts/qa/check_light.py's A/B, with no panel edited). Read once. */
let GLOBAL_OFF: boolean | null = null;
const globalOff = () => {
  if (GLOBAL_OFF === null) {
    try {
      GLOBAL_OFF = (getInputProps() as {lightOff?: unknown} | undefined)?.lightOff === true;
    } catch {
      GLOBAL_OFF = false;
    }
  }
  return GLOBAL_OFF;
};
const useOff = () => useContext(LitCtx).off || globalOff();
/** True inside `<Lit off>` (the A side of an A/B render): a panel's own light-dependent colours switch back with it. */
export const useLightOff = useOff;

// ================================================================= light directions

/** The light that shapes a spot on the ground: a practical whose pool holds it (the nearest), else the key (if it
 *  casts: a point or a sun), else null (sky only: contact shadows, no cast). */
export function lightAt(rig: LightRig, p: Pt): PointLight | SunLight | null {
  const pts = [...rig.lamps, ...(rig.key.kind === 'point' ? [rig.key] : [])];
  let best: PointLight | null = null;
  let bd = Infinity;
  for (const l of pts) {
    if (l.pool && !inEllipse(l.pool, p, 1.02)) continue;
    const d = Math.hypot(p[0] - l.foot[0], (p[1] - l.foot[1]) / rig.ground);
    if (d < bd) {
      bd = d;
      best = l;
    }
  }
  if (best) return best;
  if (rig.key.kind === 'sun') return rig.key;
  if (rig.key.kind === 'point' && !rig.key.pool) return rig.key;
  return null;
}

/** Unit vector ON THE GROUND (x, z; z toward the viewer) the light travels at ground point p, or null (sky). */
export function groundDir(rig: LightRig, p: Pt, light: Light | null = lightAt(rig, p)): Pt | null {
  if (!light || light.kind === 'sky') return null;
  if (light.kind === 'sun') return deg(light.toward);
  const v = norm([p[0] - light.foot[0], (p[1] - light.foot[1]) / rig.ground]);
  return v[0] === 0 && v[1] === 0 ? null : v;
}

/** The cast shadow's vector on screen for an object of height h standing at ground point `foot` (light.md C.5):
 *  under a lamp h * d / (H - h), capped at `cap` x h; under a sun h / tan(el); foreshortened by the ground. */
export function castVector(rig: LightRig, foot: Pt, h: number, light: Light | null = lightAt(rig, foot)): Pt | null {
  if (!light || light.kind === 'sky' || h <= 0) return null;
  const capL = rig.cap * h;
  let L: number;
  let u: Pt;
  if (light.kind === 'sun') {
    L = Math.min(capL, h / Math.tan((Math.max(5, light.el) * Math.PI) / 180));
    u = deg(light.toward);
  } else {
    const gx = foot[0] - light.foot[0];
    const gz = (foot[1] - light.foot[1]) / rig.ground;
    const d = Math.hypot(gx, gz);
    if (d < 1) return null;
    u = [gx / d, gz / d];
    L = light.H > h * 1.02 ? Math.min(capL, (h * d) / (light.H - h)) : capL;
  }
  return [u[0] * L, u[1] * L * rig.ground];
}

/** The direction (screen, unit) the light travels at an object's centre c, for form shades and rims: from a point light
 *  toward c (its vertical part damped, so side shades dominate), a sun's projection, or away from the sky's bright side. */
export function lightDir(rig: LightRig, c: Pt, from?: 'key' | 'fill'): Pt {
  if (from === 'fill' && rig.fill) {
    const f = deg(rig.fill.from);
    return [-f[0], -f[1]];
  }
  const k = rig.key;
  const near = lightAt(rig, c);
  const l: Light = near && near.kind === 'point' ? near : k;
  if (l.kind === 'point') {
    const v = norm([c[0] - l.src[0], c[1] - l.src[1]]);
    return norm([v[0], v[1] * 0.6]);
  }
  if (l.kind === 'sun') {
    const el = (l.el * Math.PI) / 180;
    const g = deg(l.toward);
    return norm([g[0] * Math.cos(el), Math.sin(el) * 0.6 + g[1] * Math.cos(el) * rig.ground]);
  }
  const f = deg(l.from ?? 250);
  return [-f[0], -f[1]];
}

// ================================================================= internal: paper state, blend groups, silhouettes

/** True while fills are paper (Look 'paper', or a colour cascade that has not reached this point yet): light layers
 *  draw nothing then (multiply layers paint white = no change; screen and opaque light layers are skipped). */
function usePaper(c: Pt): boolean {
  const look = useLook();
  const t = useTime();
  const m = useXf();
  if (look.fills !== 'color') return true;
  const cs = look.cascade;
  if (!cs) return false;
  const sx = m[0] * c[0] + m[2] * c[1] + m[4];
  const sy = m[1] * c[0] + m[3] * c[1] + m[5];
  return t < cs.at + Math.hypot(sx - cs.origin[0], sy - cs.origin[1]) / (cs.speed ?? 2600);
}

const LayerCtx = createContext(false);
/** One isolated multiply group. Inside it, shapes paint normally (src-over), so overlapping shadows never
 *  double-darken; then the group multiplies onto everything below. */
const Multiply: React.FC<{children?: React.ReactNode; shared?: boolean}> = ({children, shared}) => {
  const inLayer = useContext(LayerCtx);
  if (shared && inLayer) return <>{children}</>;
  return (
    <g style={{mixBlendMode: 'multiply'}}>
      <LayerCtx.Provider value={true}>{children}</LayerCtx.Provider>
    </g>
  );
};

const uid = (s: string) => s.replace(/[^a-zA-Z0-9]/g, '');

/** A rendered node as a WHITE silhouette (its fills only; ink off). Pass the SAME element you drew: the silhouette
 *  follows its sway, pops, builds and un-build for free. Kit pieces that draw raw SVG outside <Fill> keep those parts. */
export const AsSilhouette: React.FC<{of: React.ReactNode}> = ({of}) => (
  <Look fills="paper" ink={false}>
    {of}
  </Look>
);

/** Where light layers may paint (canvas px + bleed): masks and big tints use it. */
const REGION: [number, number, number, number] = [-600, -600, 2280, 3120];

/** A <mask> holding a silhouette (a node's fills, or a path), white = inside. */
const SilMask: React.FC<{id: string; of?: React.ReactNode; d?: string}> = ({id, of, d}) => (
  <mask id={id} maskUnits="userSpaceOnUse" x={REGION[0]} y={REGION[1]} width={REGION[2]} height={REGION[3]}>
    {of ? <AsSilhouette of={of} /> : null}
    {d ? <path d={d} fill="#FFFFFF" /> : null}
  </mask>
);

/** Every light shape: exact (no misregistration), a 1-frame pop at `at`, and a BACKDROP for the clean pen (never
 *  recoloured by an attention tier: a tint, a hole's white and a pool colour must stay exactly what the rig says). */
const LF: React.FC<{d?: string; rect?: [number, number, number, number]; color: string; at?: At; exit?: boolean; rule?: 'nonzero' | 'evenodd'; style?: React.CSSProperties}> = (p) => <Fill {...p} mode="snap" offset={false} backdrop />;

/** A shape (path or ellipse) with an optional penumbra band `soft` px wide at the half step. Paths grow their band with
 *  a round-joined stroke (the paper state paints it white like the fill: no stroke edge on paper). */
const Stepped: React.FC<{d: string; color: string; soft?: number; half?: string; at?: At; exit?: boolean; c: Pt; rule?: 'nonzero' | 'evenodd'}> = ({d, color, soft = 0, half, at, exit, c, rule}) => {
  const paper = usePaper(c);
  if (!(soft > 0)) return <LF d={d} color={color} at={at} exit={exit} rule={rule} />;
  const hc = half ?? step(color, 0.5);
  return (
    <>
      <LF d={d} color={hc} at={at} exit={exit} rule={rule} style={{stroke: paper ? '#FFFFFF' : hc, strokeWidth: soft * 2, strokeLinejoin: 'round'}} />
      <LF d={d} color={color} at={at} exit={exit} rule={rule} />
    </>
  );
};

const tintOf = (rig: LightRig, t: keyof Tints | string | undefined, dflt: keyof Tints) => {
  const k = t ?? dflt;
  return k in rig.tints ? rig.tints[k as keyof Tints] : k;
};

// ================================================================= ground shadows

/** One multiply layer for the ground shadows of a set (contact, cast, generic): place it AFTER the ground and its
 *  light (pools, spills) and BEFORE the objects that stand on it. When the objects are already drawn (a kit set that
 *  draws everything at once), list them in `exclude` (paths or nodes): their silhouettes are kept clear. */
export const ShadowLayer: React.FC<{exclude?: (string | React.ReactNode)[]; children?: React.ReactNode}> = ({exclude, children}) => {
  if (useOff()) return null;
  return (
    <Multiply>
      {children}
      {exclude?.map((x, i) => (typeof x === 'string' ? <LF key={i} d={x} color="#FFFFFF" exit={false} /> : <AsSilhouette key={i} of={x} />))}
    </Multiply>
  );
};

export type ContactShadowProps = {
  /** The footprint's centre on the ground (an object's base centre; a person's feet). */
  x: number;
  y: number;
  /** Footprint width (px). The ellipse is k x this wide (default 1.1; people 1.1-1.3 x the stance). */
  w: number;
  /** Ellipse height (px): 6-12 (default clamp(0.09 w, 6, 12)); a vehicle 16. */
  h?: number;
  k?: number;
  /** A custom footprint path instead of the ellipse (a strip under a laptop, a book's edge). */
  d?: string;
  /** Offset away from the key (px, default 3.5). */
  away?: number;
  /** Penumbra band (px, default rig.soft.contact). */
  soft?: number;
  /** 'contact' (default) | 'cast' | 'form' | a hex tint. */
  tint?: keyof Tints | string;
  at?: At;
  exit?: boolean;
};

/** The strip where a thing touches the ground (light.md C.6): an ellipse 1.05-1.15x the footprint, 6-12 px tall,
 *  pushed 3-4 px away from the key, with a 3-4 px half-step penumbra. The cheapest "premium" tell: give one to
 *  everything that touches a surface. */
export const ContactShadow: React.FC<ContactShadowProps> = ({x, y, w, h, k = 1.1, d, away = 3.5, soft, tint, at, exit}) => {
  const rig = useRig();
  const off = useOff();
  const color = tintOf(rig, tint, 'contact');
  // away from the light that shapes this spot; outside every pool a lamp key still sets the side (the room's light)
  const g = groundDir(rig, [x, y], lightAt(rig, [x, y]) ?? (rig.key.kind === 'point' ? rig.key : null));
  const o: Pt = g ? norm([g[0], g[1] * rig.ground]) : [0, 0.4];
  const ox = o[0] * away;
  const oy = o[1] * away;
  const sf = soft ?? rig.soft.contact;
  if (off) return null;
  const hh = h ?? Math.max(6, Math.min(12, w * 0.09));
  const shape = d ? (
    <XG m={mat.translate(ox, oy)}>
      <Stepped d={d} color={color} soft={sf} at={at} exit={exit} c={[x, y]} />
    </XG>
  ) : (
    <>
      <LF d={ellipseD({cx: x + ox, cy: y + oy, rx: (w * k) / 2 + sf, ry: hh / 2 + sf * 0.75})} color={step(color, 0.5)} at={at} exit={exit} />
      <LF d={ellipseD({cx: x + ox, cy: y + oy, rx: (w * k) / 2, ry: hh / 2})} color={color} at={at} exit={exit} />
    </>
  );
  return <Multiply shared>{shape}</Multiply>;
};

export type CastShadowProps = {
  /** The footprint on the ground: centre (x, y) and width w (an ellipse, ry = w / 2 x the ground's foreshortening,
   *  or `depth`), or `pts` (a convex footprint polygon on the ground, screen px). */
  x: number;
  y: number;
  w: number;
  depth?: number;
  pts?: Pt[];
  /** The object's height (px). */
  h: number;
  /** Which light (default: the practical whose pool holds the foot, else the key). */
  light?: PointLight | SunLight;
  /** Clip: 'pool' (default for a point light: shadows live only inside its pool), an ellipse, a path, or false. */
  clip?: 'pool' | Ellipse | string | false;
  /** Penumbra [at the base, at the tip] (px): sharp at the base, softer at the far end (default rig.soft.cast). */
  soft?: [number, number];
  /** 'cast' (default) | a tint key | a hex tint. */
  tint?: keyof Tints | string;
  at?: At;
  exit?: boolean;
};

/** The footprint swept along the light (light.md C.5): radiating from a lamp's foot (h * d / (H - h), capped), or
 *  parallel under a sun (h / tan(el)), foreshortened by the ground; a penumbra band that widens toward the tip; drawn
 *  only inside the lamp's pool (outside it a thing gets only its contact shadow). Sky light: nothing. */
export const CastShadow: React.FC<CastShadowProps> = ({x, y, w, depth, pts, h, light, clip = 'pool', soft, tint, at, exit}) => {
  const rig = useRig();
  const off = useOff();
  const id = 'lcs' + uid(useId());
  const l = light ?? lightAt(rig, [x, y]);
  const v = castVector(rig, [x, y], h, l);
  if (off || !v || Math.hypot(v[0], v[1]) < 1.5) return null;
  const color = tintOf(rig, tint, 'cast');
  const [s0, s1] = soft ?? rig.soft.cast;
  const fp = pts ?? ellipsePts({cx: x, cy: y, rx: w / 2, ry: depth ?? (w / 2) * rig.ground}, 36);
  const core = hull([...fp, ...add(shrink(fp, s1 * 0.5), v)]);
  const vl = Math.hypot(v[0], v[1]);
  const tip: Pt = [v[0] + (v[0] / vl) * s1 * 0.5, v[1] + (v[1] / vl) * s1 * 0.5];
  const pen = hull([...grow(fp, s0), ...add(grow(fp, s1), tip)]);
  const body = (c: string) => (
    <>
      <LF d={polyD(pen)} color={step(c, 0.5)} at={at} exit={exit} />
      <LF d={polyD(core)} color={c} at={at} exit={exit} />
    </>
  );
  // inside a lamp's pool: each pool step gets its own tint (poolCastTints), so the shadow is "the light blocked" and
  // never darker than the unlit ground beyond the pool's edge
  if (clip === 'pool' && l && l.kind === 'point' && l.pool && tint === undefined) {
    const P = poolSteps(l.pool, l.foot);
    const [t0, t1] = poolCastTints(rig);
    return (
      <Multiply shared>
        <defs>
          <clipPath id={`${id}o`} clipPathUnits="userSpaceOnUse">
            <path d={ellipseD(P.outer) + ellipseD(P.inner)} clipRule="evenodd" />
          </clipPath>
          <clipPath id={`${id}i`} clipPathUnits="userSpaceOnUse">
            <path d={ellipseD(P.inner)} />
          </clipPath>
        </defs>
        <g clipPath={`url(#${id}o)`}>{body(t0)}</g>
        <g clipPath={`url(#${id}i)`}>{body(t1)}</g>
      </Multiply>
    );
  }
  const clipD = clip === false ? null : clip === 'pool' ? (l && l.kind === 'point' && l.pool ? ellipseD(l.pool) : null) : typeof clip === 'string' ? clip : ellipseD(clip);
  return (
    <Multiply shared>
      {clipD ? (
        <>
          <defs>
            <clipPath id={id} clipPathUnits="userSpaceOnUse">
              <path d={clipD} />
            </clipPath>
          </defs>
          <g clipPath={`url(#${id})`}>{body(color)}</g>
        </>
      ) : (
        body(color)
      )}
    </Multiply>
  );
};

/** A generic shadow shape: a drop shadow on a wall (a frame, a hanging tag: `dx dy` away from the key, clipped to the
 *  surface it falls on), the dark strip under a desk's front edge, an eave's underside. Multiply, with a penumbra. */
export const Shadow: React.FC<{d: string; dx?: number; dy?: number; clip?: string | Ellipse; soft?: number; tint?: keyof Tints | string; at?: At; exit?: boolean}> = ({d, dx = 0, dy = 0, clip, soft = 0, tint, at, exit}) => {
  const rig = useRig();
  const off = useOff();
  const id = 'lsh' + uid(useId());
  if (off) return null;
  const b = pathBox(d);
  const color = tintOf(rig, tint, 'cast');
  const shape = (
    <XG m={mat.translate(dx, dy)}>
      <Stepped d={d} color={color} soft={soft} at={at} exit={exit} c={[b.x + b.w / 2, b.y + b.h / 2]} />
    </XG>
  );
  const clipD = clip === undefined ? null : typeof clip === 'string' ? clip : ellipseD(clip);
  return (
    <Multiply shared>
      {clipD ? (
        <>
          <defs>
            <clipPath id={id} clipPathUnits="userSpaceOnUse">
              <path d={clipD} />
            </clipPath>
          </defs>
          <g clipPath={`url(#${id})`}>{shape}</g>
        </>
      ) : (
        shape
      )}
    </Multiply>
  );
};

/** Where a hanging or leaning thing's shadow lands on the surface behind it: the light's screen direction x `gap`
 *  (its distance from the surface, px). */
export const dropOffset = (rig: LightRig, c: Pt, gap: number): Pt => {
  const v = lightDir(rig, c);
  return [v[0] * gap, v[1] * gap];
};

// ================================================================= form: the side away from the key

export type FormShadeProps = {
  /** The object: the SAME element you drew (`of`), or its silhouette path `d`. */
  of?: React.ReactNode;
  d?: string;
  /** Its centre (light direction) and extent; default from `d`'s bbox (required with `of`: `c` + `size`). */
  c?: Pt;
  /** [w, h] of the object (with `of`). */
  size?: [number, number];
  /** Fraction of the object in shade along the light (default rig.form.frac: 0.25-0.4). */
  frac?: number;
  /** 'band' (a straight terminator: boxes, planes, cylinders seen from the side) | 'crescent' (the object minus a copy
   *  moved toward the key: round things). Default 'band'. */
  kind?: 'band' | 'crescent';
  /** Override the light's travel direction (screen deg or 'key' default). */
  dir?: number;
  tint?: keyof Tints | string;
  at?: At;
};

/** The form shadow (light.md C.4): one flat step (multiply `form`, dL -7..-12) on the side AWAY from the key, 25-40 %
 *  of the object's extent, hard-edged, no ink on the boundary; round things get a crescent. Lit : shade ~3 : 1. Give it
 *  to every object in a lit zone (objects in the ambient get only their contact shadow). */
export const FormShade: React.FC<FormShadeProps> = ({of, d, c: cIn, size, frac, kind = 'band', dir, tint, at}) => {
  const rig = useRig();
  const off = useOff();
  const t = useTime();
  const id = 'lfs' + uid(useId());
  const bb = d ? pathBox(d) : null;
  const c: Pt = cIn ?? (bb ? [bb.x + bb.w / 2, bb.y + bb.h / 2] : [0, 0]);
  const [w, h] = size ?? (bb ? [bb.w, bb.h] : [100, 100]);
  if (off || (!of && !d)) return null;
  if (at !== undefined && t < at) return null;
  // a band is a SIDE shade (light.md C.4: "on the side away from the key, 25-40 % of the width"): horizontal unless
  // the key is backlit (tops lit: the shade from below) or `dir` says otherwise; a crescent follows the full direction
  const lv = lightDir(rig, c);
  const v: Pt = dir !== undefined ? deg(dir) : rig.form.backlit ? [0, 1] : kind === 'band' ? [lv[0] < 0 ? -1 : 1, 0] : lv;
  const f = frac ?? rig.form.frac;
  const color = tintOf(rig, tint, 'form');
  // extent of the object along v (its bbox projected), so `frac` is a share of what you see
  const ext = Math.abs(v[0]) * w + Math.abs(v[1]) * h;
  let inner: React.ReactNode;
  if (kind === 'crescent') {
    const s = ext * f;
    inner = (
      <>
        <LF rect={REGION} color={color} exit={false} />
        <XG m={mat.translate(-v[0] * s, -v[1] * s)}>{of ? <AsSilhouette of={of} /> : <LF d={d!} color="#FFFFFF" exit={false} />}</XG>
      </>
    );
  } else {
    // the half-plane beyond the terminator: points p with (p - c) . v >= ext * (0.5 - f)
    const t0 = ext * (0.5 - f);
    const o: Pt = [c[0] + v[0] * t0, c[1] + v[1] * t0];
    const n: Pt = [-v[1], v[0]];
    const B = 4000;
    const quad: Pt[] = [
      [o[0] + n[0] * B, o[1] + n[1] * B],
      [o[0] + n[0] * B + v[0] * B, o[1] + n[1] * B + v[1] * B],
      [o[0] - n[0] * B + v[0] * B, o[1] - n[1] * B + v[1] * B],
      [o[0] - n[0] * B, o[1] - n[1] * B],
    ];
    inner = <LF d={polyD(quad)} color={color} exit={false} />;
  }
  const body = (
    <Multiply>
      <defs>
        <SilMask id={id} of={of} d={d} />
      </defs>
      <g mask={`url(#${id})`}>{inner}</g>
    </Multiply>
  );
  // a node's silhouette leaves with the node; a fixed path shrinks about the object's centre with the small fills
  return of ? (
    body
  ) : (
    <ExitFade x={c[0]} y={c[1]} jitter={0.5}>
      {body}
    </ExitFade>
  );
};

/** A whole plane in shade (one step): a building's side away from the key, the window reveal facing away from the lamp,
 *  an underside, the eave's strip (tint 'cast'). Multiply. */
export const Shade: React.FC<{d?: string; of?: React.ReactNode; tint?: keyof Tints | string; at?: At; exit?: boolean}> = ({d, of, tint, at, exit}) => {
  const rig = useRig();
  const off = useOff();
  const id = 'lsd' + uid(useId());
  if (off || (!d && !of)) return null;
  const color = tintOf(rig, tint, 'form');
  if (d && !of) {
    return (
      <Multiply>
        <LF d={d} color={color} at={at} exit={exit} />
      </Multiply>
    );
  }
  return (
    <Multiply>
      <defs>
        <SilMask id={id} of={of} />
      </defs>
      <g mask={`url(#${id})`}>
        <LF rect={REGION} color={color} at={at} exit={false} />
      </g>
    </Multiply>
  );
};

// ================================================================= ambient: the room's falloff (one step outside the light)

/** The lamp's wall wash as an Ambient hole: the rig's wash ellipse cut at the desk's back edge (`cutY`: the wash lights
 *  the WALL; on the desk the pool is the light), with its 2-step ~26 px edge. */
export function washHole(rig: LightRig, cutY: number, o: {soft?: number; steps?: 1 | 2} = {}): LightHole | null {
  const e = rig.wash;
  if (!e) return null;
  const pts = ellipsePts(e, 72).map(([x, y]) => [x, Math.min(y, cutY)] as Pt);
  // clipped above the desk line: the cut edge is the wall / desk crease (a plane change), so no soft band below it
  return {d: polyD(pts), soft: o.soft ?? rig.soft.wash, steps: o.steps ?? 2, clip: [-2000, -2000, 5080, cutY + 2000]};
}

export type LightHole = {
  /** The region: an ellipse `e`, a path `d`, a rect, or a node `of` (an object's silhouette: a lit object in a pool). */
  e?: Ellipse;
  d?: string;
  rect?: [number, number, number, number];
  of?: React.ReactNode;
  /** Soft edge (px): one half-step band (or `steps` 2: two bands at 2/3 and 1/3), outside the region. 0 = hard
   *  (sources, glass, objects). */
  soft?: number;
  steps?: 1 | 2;
  /** 'lit' (default: no tint here) | 'dark' (paint the tint back: a thing in front of a hole that is NOT lit, e.g. Pip
   *  in front of the window glass). */
  kind?: 'lit' | 'dark';
  /** Keep this hole (and its soft bands) inside a rect [x, y, w, h] (a wash that stops at the desk's crease). */
  clip?: [number, number, number, number];
};

/** The ambient step (light.md C.2, C.7 "room falloff"): ONE multiply of the set's `ambient` tint over `region` (default
 *  the whole frame), with HOLES painted back to white in order: the lamp's wall wash (a 2-step ~26 px edge, `washHole`),
 *  the pool (hard: its own two steps are its gradient; a soft band there reads as a third ring, a target), every object
 *  standing lit in the pool, and every source (the window glass, a screen, a lamp's mouth: hard edges).
 *  Outdoors under the clean pen the environment tier already pulls far snow toward the sky (93 -> ~82, the ambient
 *  target): never stack an Ambient on a tiered outside (the nook's window view needs none).
 *  The palette values become the LIT values; everything else sits one step down (wall L* 91 -> 82, desk 68 -> 61).
 *  Never concentric target rings; inside the caption band (y 290-600) the wall must stay one value (a hole's edge there
 *  is a mistake: `lightProblems` reports it for ellipse holes). Place it LAST over the set (after the objects). */
export const Ambient: React.FC<{region?: [number, number, number, number] | string; holes?: LightHole[]; tint?: keyof Tints | string; at?: At}> = ({region, holes = [], tint, at}) => {
  const rig = useRig();
  const off = useOff();
  const id = 'lam' + uid(useId());
  if (off) return null;
  const color = tintOf(rig, tint, 'ambient');
  const reg = region ?? REGION;
  const regionD = typeof reg === 'string' ? reg : rectD(reg[0], reg[1], reg[2], reg[3]);
  const half = step(color, 0.5);
  const third = step(color, 1 / 3);
  const twoThirds = step(color, 2 / 3);
  const masks: React.ReactNode[] = [];
  const op = (hl: LightHole, i: number): React.ReactNode => {
    const lit = (hl.kind ?? 'lit') === 'lit';
    const paint = lit ? '#FFFFFF' : color;
    const soft = hl.soft ?? 0;
    const bands = soft > 0 ? (hl.steps === 2 ? [[soft, twoThirds], [soft / 2, third]] : [[soft, half]]) as [number, string][] : [];
    if (hl.of) {
      if (lit) return <AsSilhouette of={hl.of} />;
      const mid = `${id}m${i}`;
      masks.push(<SilMask key={mid} id={mid} of={hl.of} />);
      return (
        <g mask={`url(#${mid})`}>
          <LF rect={REGION} color={color} exit={false} />
        </g>
      );
    }
    if (hl.e) {
      const e = hl.e;
      return (
        <>
          {lit ? bands.map(([s, col], j) => <LF key={j} d={ellipseD({cx: e.cx, cy: e.cy, rx: e.rx + s, ry: e.ry + s})} color={col} exit={false} />) : null}
          <LF d={ellipseD(e)} color={paint} exit={false} />
        </>
      );
    }
    const d = hl.d ?? (hl.rect ? rectD(hl.rect[0], hl.rect[1], hl.rect[2], hl.rect[3]) : '');
    if (!d) return null;
    const b = pathBox(d);
    return lit && bands.length ? (
      <>
        {bands.map(([s, col], j) => (
          <Stepped key={j} d={d} color={col} soft={s} half={col} exit={false} c={[b.x + b.w / 2, b.y + b.h / 2]} />
        ))}
        <LF d={d} color={paint} exit={false} />
      </>
    ) : (
      <LF d={d} color={paint} exit={false} />
    );
  };
  const clips: React.ReactNode[] = [];
  const ops = holes.map((hl, i) => {
    const node = op(hl, i);
    if (!hl.clip) return <React.Fragment key={i}>{node}</React.Fragment>;
    const cid = `${id}c${i}`;
    clips.push(
      <clipPath key={cid} id={cid} clipPathUnits="userSpaceOnUse">
        <rect x={hl.clip[0]} y={hl.clip[1]} width={hl.clip[2]} height={hl.clip[3]} />
      </clipPath>,
    );
    return (
      <g key={i} clipPath={`url(#${cid})`}>
        {node}
      </g>
    );
  });
  return (
    <Multiply>
      {masks.length || clips.length ? (
        <defs>
          {masks}
          {clips}
        </defs>
      ) : null}
      <LF d={regionD} color={color} at={at} />
      {ops}
    </Multiply>
  );
};

// ================================================================= light shapes (opaque, lighter + warmer)

/** A lamp's pool on its ground (CRAFT §d.2, §d.7): two opaque flat steps LIGHTER and WARMER than the ground (desk:
 *  `POOL_DESK` ring L* 88, core 93; snow: #EADBD2 88, #F6E4CA 91). The inner step sits toward the source. Draw it on
 *  the ground before the shadows and objects. Default: the key's (or `light`'s) pool. */
export const LightPool: React.FC<{pool?: Ellipse; light?: PointLight; colors?: [string, string]; inner?: number; at?: At}> = ({pool, light, colors, inner = 0.6, at}) => {
  const rig = useRig();
  const off = useOff();
  const l = light ?? (rig.key.kind === 'point' ? rig.key : rig.lamps[0]);
  const P = pool ?? l?.pool;
  if (off || !P) return null;
  const [co, ci] = colors ?? rig.pool;
  // the inner step leans toward the source's foot (the light is strongest right under it)
  const S = poolSteps(P, l?.foot, inner);
  return (
    <>
      <LF d={ellipseD(S.outer)} color={co} at={at} />
      <LF d={ellipseD(S.inner)} color={ci} at={at} />
    </>
  );
};

/** A lit window pane at dusk (light.md C.2: L* 85-92, the brightest warm things outside; rig.window), exact and never
 *  recoloured by a tier; pair a ground-floor pane with its WindowSpill. With the light off (`<Lit off>`, the A/B
 *  render) it paints the old EMBER.houseLit, so the A side is the kit's look before the light system. */
export const LitWindow: React.FC<{rect: [number, number, number, number]; color?: string; at?: At}> = ({rect, color, at}) => {
  const rig = useRig();
  if (useOff()) return <LF rect={rect} color={EMBER.houseLit} at={at} />;
  return <LF rect={rect} color={color ?? rig.window} at={at} />;
};

/** A lit window's light on the ground in front of it (light.md C.7): a flat trapezoid from the wall's foot under the
 *  window, widening `widen` x (1.3-1.6) over `depth` x the window's height (0.6-1). +4 L*, warm (rig.spill). */
export const WindowSpill: React.FC<{win: [number, number, number, number]; base: number; widen?: number; depth?: number; color?: string; at?: At}> = ({win, base, widen = 1.45, depth = 0.7, color, at}) => {
  const rig = useRig();
  const off = useOff();
  if (off) return null;
  const [x, , w, h] = win;
  const cx = x + w / 2;
  const D = h * depth;
  const pts: Pt[] = [[x, base], [x + w, base], [cx + (w * widen) / 2, base + D], [cx - (w * widen) / 2, base + D]];
  return <LF d={polyD(pts)} color={color ?? rig.spill} at={at} />;
};

/** A lantern's halo (light.md C.7): at most ONE flat step on the SKY only (draw it right after the sky), r <= 1.7x the
 *  lantern width; or none. Never a disc over the ground or the houses. `on` = the sky colour behind it when that is not
 *  the plain sky (the lighter horizon band `skyLow`): the step is taken from it (+7 L*, warmer), so it still shows. */
export const Halo: React.FC<{x: number; y: number; w: number; r?: number; color?: string; on?: string; at?: At}> = ({x, y, w, r, color, on, at}) => {
  const rig = useRig();
  const off = useOff();
  if (off) return null;
  const R = Math.min(r ?? w * 1.4, w * 1.7);
  return <LF d={ellipseD({cx: x, cy: y, rx: R, ry: R})} color={color ?? (on ? relit(on, 7, {warm: 20}) : rig.halo)} at={at} />;
};

/** A source's core (a lantern's glass, a bulb, the lamp's mouth): the brightest warm value (L* 95-98, <= 1 % of the
 *  frame). Never darkened (keep it out of Ambient with a hole). */
export const SourceCore: React.FC<{d: string; color?: string; at?: At}> = ({d, color, at}) => {
  const rig = useRig();
  if (useOff()) return null;
  return <LF d={d} color={color ?? rig.source} at={at} />;
};

/** Lift an object standing in a pool (light.md C.7): a screen layer of `rig.lift` (#4A2E10: sleeve +11, hero +8, desk
 *  +6) on the object's silhouette, clipped to the pool. Warm surfaces only (screen greys cool ones). Optional on top of
 *  the Ambient hole: the subject in the pool, one step brighter than its surroundings. `pool={false}` lifts the whole
 *  object (a thing STANDING in the pool: its upright faces are lit too, not only the part over the pool's ellipse). */
export const PoolLift: React.FC<{of?: React.ReactNode; d?: string; pool?: Ellipse | false; color?: string; c: Pt; at?: At}> = ({of, d, pool, color, c, at}) => {
  const rig = useRig();
  const off = useOff();
  const paper = usePaper(c);
  const t = useTime();
  const e = useExit();
  const id = 'lpl' + uid(useId());
  const P = pool === false ? undefined : pool ?? (rig.key.kind === 'point' ? rig.key.pool : undefined);
  // screen never paints "no change" on paper: off while paper, and (a fixed path) gone once the un-build starts
  if (off || paper || (!of && !d) || (at !== undefined && t < at) || (!of && exitFillProgress(e, 0.5, 0.2) > 0)) return null;
  return (
    <g style={{mixBlendMode: 'screen'}}>
      <defs>
        <SilMask id={id} of={of} d={d} />
        {P ? (
          <clipPath id={`${id}c`} clipPathUnits="userSpaceOnUse">
            <path d={ellipseD(P)} />
          </clipPath>
        ) : null}
      </defs>
      <g clipPath={P ? `url(#${id}c)` : undefined}>
        <g mask={`url(#${id})`}>
          <rect x={REGION[0]} y={REGION[1]} width={REGION[2]} height={REGION[3]} fill={color ?? rig.lift} />
        </g>
      </g>
    </g>
  );
};

/** The subject's lit edge (light.md C.8): 4-6 px INSIDE the silhouette along the key side (the object minus a copy
 *  moved away from the light: thickest where the edge faces the key, nothing where it turns away), limited to `cover`
 *  (0.25-0.5) of the contour (by itself it keeps the key-facing half: a box's two key-facing sides; `cover` trims a round
 *  thing further), in the lit variant (rig.rim, the lamp core). Only on the story subject (You, the hero
 *  laptop or tag), only when the key is behind or to the side or the subject is in front of a darker field. Never an
 *  offset copy of the outline. `from="fill"` = the window's cool fill instead of the key. The object: its path `d`, or
 *  the SAME element you drew (`of`, with its centre `c` and `size`). */
export const Rim: React.FC<{d?: string; of?: React.ReactNode; c?: Pt; size?: [number, number]; width?: number; cover?: number; color?: string; from?: 'key' | 'fill'; at?: At}> = ({d, of, c: cIn, size, width = 5, cover, color, from = 'key', at}) => {
  const rig = useRig();
  const off = useOff();
  const t = useTime();
  const id = 'lrm' + uid(useId());
  const bb = d ? pathBox(d) : null;
  const c: Pt = cIn ?? (bb ? [bb.x + bb.w / 2, bb.y + bb.h / 2] : [0, 0]);
  const [bw, bh] = size ?? (bb ? [bb.w, bb.h] : [100, 100]);
  const paper = usePaper(c);
  if (off || paper || (!d && !of) || (at !== undefined && t < at)) return null;
  const v = lightDir(rig, c, from);
  // the moved copy alone keeps the key-facing half of the contour (a box: its two key-facing sides, whole); `cover`
  // < 0.5 trims a ROUND thing further with a half-plane on the key side (a circle's chord at R cos(pi cover))
  const R = (Math.abs(v[0]) * bw + Math.abs(v[1]) * bh) / 2;
  const s = cover === undefined ? -4 * R : R * Math.cos(Math.PI * Math.min(0.5, Math.max(0.05, cover)));
  const o: Pt = [c[0] - v[0] * s, c[1] - v[1] * s];
  const n: Pt = [-v[1], v[0]];
  const B = 4000;
  const half = polyD([
    [o[0] + n[0] * B, o[1] + n[1] * B],
    [o[0] + n[0] * B - v[0] * B, o[1] + n[1] * B - v[1] * B],
    [o[0] - n[0] * B - v[0] * B, o[1] - n[1] * B - v[1] * B],
    [o[0] - n[0] * B, o[1] - n[1] * B],
  ]);
  const col = color ?? (from === 'fill' && rig.fill ? rig.fill.color : rig.rim);
  const shift = mat.translate(r2(v[0] * width), r2(v[1] * width));
  // the mask: the silhouette white, then the same silhouette moved away from the light painted black over it
  // (brightness(0) is a colour step, not a blur): what stays white is the band along the key-facing edges
  const body = (
    <>
      <defs>
        <clipPath id={`${id}h`} clipPathUnits="userSpaceOnUse">
          <path d={half} />
        </clipPath>
        <mask id={`${id}m`} maskUnits="userSpaceOnUse" x={REGION[0]} y={REGION[1]} width={REGION[2]} height={REGION[3]}>
          {of ? <AsSilhouette of={of} /> : <path d={d} fill="#FFFFFF" />}
          {of ? (
            <g style={{filter: 'brightness(0)'}}>
              <XG m={shift}>
                <AsSilhouette of={of} />
              </XG>
            </g>
          ) : (
            <path d={d} fill="#000000" transform={mat.str(shift)} />
          )}
        </mask>
      </defs>
      <g clipPath={`url(#${id}h)`}>
        <g mask={`url(#${id}m)`}>
          <rect x={REGION[0]} y={REGION[1]} width={REGION[2]} height={REGION[3]} fill={col} />
        </g>
      </g>
    </>
  );
  return of ? (
    body
  ) : (
    <ExitFade x={c[0]} y={c[1]} jitter={0.5}>
      {body}
    </ExitFade>
  );
};

// ================================================================= checks (light.md D: what the gate check measures)

/** Value checks of a rig against CRAFT §d's ladder, for the surfaces a set uses (empty = OK). Pools must sit >= 4 L*
 *  above their ground in ambient; form / cast / contact are one family (hues within 6 deg); shadow colours (surface x
 *  tint, stacked on the ambient where it applies) keep C* >= 8 (on surfaces that have it) and L* >= 35 (except on an
 *  anchor-dark surface, L* < 45: its shadows take one step below); lit windows L* 85-92; sources >= 95; snow caps 87-89
 *  and under the pool's inner step; ellipse holes / the wash keep their edge out of the caption band (y 290-600). */
export function lightProblems(rig: LightRig, surfaces: Record<string, string>, o: {ground?: string; band?: [number, number]; holes?: Ellipse[]} = {}): string[] {
  const out: string[] = [];
  const L = (h: string) => lch(h).L;
  const groundLit = o.ground;
  if (groundLit) {
    const amb = rig.groundAmbient ?? multiply(groundLit, rig.tints.ambient);
    const [po, pi] = rig.pool;
    if (L(po) < L(amb) + 4) out.push(`pool outer ${po} L${L(po).toFixed(1)} < ground ${amb} L${L(amb).toFixed(1)} + 4`);
    if (L(pi) < L(po) + 3) out.push(`pool inner ${pi} L${L(pi).toFixed(1)} not a step above the outer`);
  }
  const hues = (['form', 'cast', 'contact'] as (keyof Tints)[]).map((j) => lch(rig.tints[j]).h);
  const spread = Math.max(...hues.map((a) => Math.max(...hues.map((b) => Math.abs(((a - b + 540) % 360) - 180)))));
  if (spread > 6) out.push(`form / cast / contact are not one family (hues ${hues.map((h) => h.toFixed(0)).join(' / ')})`);
  if (rig.groundAmbient !== undefined) {
    // outdoors (a ground in ambient light): sky-facing caps stay thin and under the pool's inner step
    const cap = L(rig.snowCap);
    if (cap < 87 || cap > 89.5) out.push(`snow cap ${rig.snowCap} L${cap.toFixed(1)} outside 87-89`);
    if (cap > L(rig.pool[1])) out.push(`snow cap L${cap.toFixed(1)} above the pool core L${L(rig.pool[1]).toFixed(1)}`);
  }
  for (const [name, s] of Object.entries(surfaces)) {
    const base = lch(s);
    const amb = multiply(s, rig.tints.ambient);
    for (const job of ['form', 'cast', 'contact'] as (keyof Tints)[]) {
      for (const [where, under] of [['lit', s], ['ambient', amb]] as [string, string][]) {
        const sh = lch(multiply(under, rig.tints[job]));
        if (base.C >= 10 && sh.C < 8) out.push(`${name} ${job} (${where}) C${sh.C.toFixed(1)} < 8 (greys)`);
        if (base.L >= 45 && sh.L < 35) out.push(`${name} ${job} (${where}) L${sh.L.toFixed(1)} < 35`);
      }
    }
  }
  const w = L(rig.window);
  if (w < 85 || w > 92.5) out.push(`window ${rig.window} L${w.toFixed(1)} outside 85-92`);
  if (L(rig.source) < 95) out.push(`source ${rig.source} L${L(rig.source).toFixed(1)} < 95`);
  const band = o.band ?? [290, 600];
  for (const e of [...(o.holes ?? []), ...(rig.wash ? [rig.wash] : [])]) {
    const top = e.cy - e.ry;
    if (top > band[0] - 1 && top < band[1] + 30) out.push(`a lit edge at y ${top.toFixed(0)} crosses the caption band ${band[0]}-${band[1]}`);
  }
  return out;
}
