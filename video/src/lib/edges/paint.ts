// edges/paint.ts — the 'paint' edge: a WHITE PAPER BASE with the scene's colour PAINTED ON TOP, loosely and
// incompletely, at every edge of the frame (the user's pick after the trim / panel round: "a default white base and
// then we paint on top of it in a somewhat messy, incomplete way, like the very first video, with the edges around
// the page even more loose and messy").
//
// How reference 1 paints (style bible 4, 5.4; f_3.0, f_5.5, f_9.0, f_12.0): colour goes down as a FEW FLAT BLOCKS
// with long crisp edges, each stopping where it stops; the ink keeps going 30-62 px into the white and ends there; and
// every white area holds drawing (overshooting lines, line-art people, the crane, the bikes). No texture, gradient,
// blur or opacity.
//
// The colour is ONE BODY (each of its four sides a few slightly tilted blocks that meet in a single clear step, never a
// jog under ~26-48 px) plus a few union blocks (the clip's nonzero rule unions them):
//   corners  each frame corner gets a role:
//            bare    the paint did not reach it: an irregular diagonal run with two soft knees. Only where the scene
//                    has LINE ART there (hints.ink): a flat-sky corner never goes bare (it bleeds instead). The line
//                    art stays: the sketch is cut half as deep, the drawing runs on into the white.
//            step    a partly bare TOP corner: the block stops short in a tilted L; the line art fills it and the
//                    artist's ruled crossing pair marks the block's corner (f_9.0's top-left).
//            bleed   colour covers the corner and runs off both edges (the emptiest corner: usually sky).
//            square  the body's corner; one painted top corner gets the ruled crossing pair.
//   bites    big straight-sided bites where the paint did not reach: the one visible-zone gesture on the left side
//            (y 880-1460; medium / loose, only where the scene has drawing there) and the bottom under the app UI.
//            The line art inside a bite is complete (the sketch keeps the block's edge).
//   tongues  stretches where the colour runs off the frame (the ground off the bottom, a slant like a ground plane).
//   keep     hints.keep rects (a hero, the mascot and the ground under it, a lamp and its halo) are always in colour:
//            corners shrink or change role, bites and tongues keep clear, and a last block guarantees it. A figure is
//            never half colour, half line art.
// The INK layer (the scene as line art on paper, EdgeTreatment) is clipped to the body's SKETCH plus a reach band
// along every edge. Along one edge the reach RISES THEN FALLS (one peak, or one run-off end and one perpendicular cut),
// so a scene line running parallel to an edge shows on ONE stretch and ends once: no dashes. Lines crossing an edge
// end 26-66 px past the colour at varied points, or run off the frame.
//
// One knob: LOOSENESS (0.6 subtle, 1 medium, 1.6 loose; up to ~2). Every distance, count and role follows from it;
// a seed's random draws come from per-element forks, so the presets of one seed are the same painting, looser.
// Phone-aware: the colour contains the caption block; beside it the paper is <= 38 px (left) / 77 (right); under the
// right rail (y 860-1540) 10-18 px; the deepest work sits under the top ~180 / bottom ~400 px app UI, and the visible
// zone carries one decisive gesture on the left. Pure and deterministic in (seed, looseness, hints).

import {rng, Rng, Seed} from '../rng';
import type {Pt} from '../sketch';
import {stroke} from '../theme';
import {pathOf} from './rough';
import {CAPTION_SAFE, EdgeHints, EdgeInkRegion, EdgeRect, EdgeStroke, H, PHONE_UI, ruled, STROKE_MAX_Y, W} from './shared';

export type PaintPreset = 'paint-subtle' | 'paint-medium' | 'paint-loose';
export const PAINT_PRESETS: PaintPreset[] = ['paint-subtle', 'paint-medium', 'paint-loose'];
/** Each preset's looseness (the 'paint' variant takes `amount` as its looseness; a preset multiplies it). */
export const PAINT_LOOSENESS: Record<PaintPreset, number> = {'paint-subtle': 0.6, 'paint-medium': 1, 'paint-loose': 1.6};

type Range = [number, number];

type Params = {
  /** Paper depth (px from the frame edge) at the top edge's two ends; the chance of one step along it. */
  top: Range;
  topStep: number;
  /** Left side insets: the caption band (<= 38), the visible band, the bands under the bottom UI. */
  left0: Range;
  left: Range;
  leftLow: Range;
  /** Right side insets: the caption band (<= 77) and the band below the rail (the rail band is 10-18). */
  right0: Range;
  rightLow: Range;
  /** Bottom paper depth and the number of steps along it. */
  bottom: Range;
  bottomSteps: number;
  /** Where two blocks meet the side steps by 0 or by this much (a smaller step reads as a glitch). */
  step: Range;
  /** Block edge tilt (px over the block's length: 1-2 degrees). */
  tilt: number;
  /** Bands down the left side (2 / 3 / 4); the right side has 2 / 3. */
  bands: number;
  /** Bare corners: how many, and their extent along the vertical / horizontal side (a top corner's vertical extent
   *  stops above the caption block). */
  bare: number;
  bareV: Range;
  bareH: Range;
  /** Partly bare top corners: how many, and their size. */
  stepCorners: number;
  stepV: Range;
  stepH: Range;
  /** Bleed corners: how many, and their reach. */
  bleed: number;
  bleedR: Range;
  /** The visible-zone left bite: depth from the frame (0 = none) and width. */
  leftBite: Range;
  leftBiteW: Range;
  /** Bites in the bottom (under the UI): how many, depth past the bottom edge, width. */
  bottomBites: number;
  bottomBite: Range;
  bottomBiteW: Range;
  /** Stretches where the colour runs off the frame: how many, and how wide. */
  tongues: number;
  tongueW: Range;
  /** Ink past the colour (px) and the share of edges where it ends in the white (the rest run off or half). */
  over: Range;
  endP: number;
  /** The ruled crossing pair's overshoot past the block corner. */
  ruledOver: Range;
};

const ANCHORS: [number, Params][] = [
  [
    0.6,
    {
      top: [14, 26],
      topStep: 0,
      left0: [18, 30],
      left: [46, 62],
      leftLow: [46, 62],
      right0: [14, 24],
      rightLow: [14, 24],
      bottom: [18, 34],
      bottomSteps: 0,
      step: [26, 40],
      tilt: 8,
      bands: 2,
      bare: 1,
      bareV: [300, 400],
      bareH: [180, 260],
      stepCorners: 0,
      stepV: [100, 160],
      stepH: [160, 240],
      bleed: 0,
      bleedR: [130, 200],
      leftBite: [0, 0],
      leftBiteW: [160, 240],
      bottomBites: 0,
      bottomBite: [30, 60],
      bottomBiteW: [160, 260],
      tongues: 1,
      tongueW: [220, 380],
      over: [18, 38],
      endP: 0.55,
      ruledOver: [14, 24],
    },
  ],
  [
    1,
    {
      top: [24, 50],
      topStep: 0.35,
      left0: [22, 36],
      left: [44, 70],
      leftLow: [34, 110],
      right0: [18, 56],
      rightLow: [26, 80],
      bottom: [40, 96],
      bottomSteps: 1,
      step: [40, 64],
      tilt: 14,
      bands: 3,
      bare: 1,
      bareV: [380, 520],
      bareH: [240, 340],
      stepCorners: 1,
      stepV: [110, 180],
      stepH: [200, 320],
      bleed: 1,
      bleedR: [150, 250],
      leftBite: [92, 124],
      leftBiteW: [180, 300],
      bottomBites: 1,
      bottomBite: [50, 100],
      bottomBiteW: [180, 320],
      tongues: 1,
      tongueW: [220, 420],
      over: [26, 56],
      endP: 0.62,
      ruledOver: [24, 40],
    },
  ],
  [
    1.6,
    {
      top: [40, 84],
      topStep: 0.6,
      left0: [24, 38],
      left: [52, 92],
      leftLow: [40, 150],
      right0: [26, 77],
      rightLow: [40, 130],
      bottom: [70, 150],
      bottomSteps: 2,
      step: [48, 90],
      tilt: 22,
      bands: 4,
      bare: 2,
      bareV: [430, 600],
      bareH: [290, 430],
      stepCorners: 1,
      stepV: [130, 200],
      stepH: [240, 380],
      bleed: 1,
      bleedR: [170, 300],
      leftBite: [128, 166],
      leftBiteW: [220, 360],
      bottomBites: 2,
      bottomBite: [70, 150],
      bottomBiteW: [180, 340],
      tongues: 2,
      tongueW: [240, 440],
      over: [32, 66],
      endP: 0.72,
      ruledOver: [40, 60],
    },
  ],
];

/** Fields that are counts or chances (not scaled down below subtle). */
const COUNTS = new Set<keyof Params>(['topStep', 'bottomSteps', 'bands', 'bare', 'stepCorners', 'bleed', 'bottomBites', 'tongues', 'endP']);

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

/** The parameters at a looseness: piecewise linear between the presets; below subtle every distance shrinks toward 0
 *  (the counts stay: one bare corner until ~0.25); above loose the medium -> loose slope extrapolates. */
export function paintParams(L: number): Params {
  const [[l0, p0], [l1, p1], [l2, p2]] = ANCHORS;
  if (L <= l0) {
    const k = Math.max(0, L / l0);
    const out = {} as Record<string, unknown>;
    for (const key of Object.keys(p0) as (keyof Params)[]) {
      const v = p0[key];
      out[key] = COUNTS.has(key) ? v : Array.isArray(v) ? v.map((x) => x * k) : (v as number) * k;
    }
    const p = out as Params;
    p.bare = L >= 0.25 ? 1 : 0;
    p.tongues = L >= 0.35 ? 1 : 0;
    return p;
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
/** Corner names (TL, TR, BR, BL) as hint regions. */
const CORNER_REGION: EdgeInkRegion[] = ['tl', 'tr', 'br', 'bl'];

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

const [CX0, CY0, CX1, CY1] = CAPTION_SAFE;
const CAP_PAD = 36;
const RAIL: [number, number] = [PHONE_UI.rail.y0 - 40, PHONE_UI.rail.y1 + 40];
/** The paper allowed beside the caption block (left / right), under the right rail, above the caption block and at
 *  the bottom (the bottom UI block). */
export const PAINT_LIMITS = {left: CX0 - 12, right: W - CX1 - 12, rail: 18, top: CY0 - 24, bottom: PHONE_UI.bottom - 20};
/** Lowest screen y a top corner's bare / step area may reach down a side (above the caption block). */
const TOP_CORNER_Y = CY0 - CAP_PAD - 8;
/** The visible-zone left bite lives in this screen y range. */
const LEFT_BITE_Y: Range = [880, 1460];

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
/** Does a rect (grown by pad) overlap a polygon? (sampled: rect points in the polygon or polygon points in the rect) */
function rectHitsPoly([x0, y0, x1, y1]: EdgeRect, poly: Pt[], pad = 24): boolean {
  const [a, b, c, d] = [x0 - pad, y0 - pad, x1 + pad, y1 + pad];
  if (poly.some(([x, y]) => x >= a && x <= c && y >= b && y <= d)) return true;
  for (let x = a; x <= c; x += 12) for (let y = b; y <= d; y += 12) if (insidePoly([x, y], poly)) return true;
  return false;
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

/** Free start positions in [lo, hi - w] on a line, avoiding the forbidden intervals. */
function free(lo: number, hi: number, w: number, forbid: Range[]): Range[] {
  let fr: Range[] = [[lo, hi - w]];
  for (const [a, b] of forbid) {
    fr = fr.flatMap(([x, y]) => {
      const o: Range[] = [];
      if (a - w > x) o.push([x, Math.min(y, a - w)]);
      if (b < y) o.push([Math.max(x, b), y]);
      return o;
    });
  }
  return fr.filter(([x, y]) => y > x);
}
function pickIn(fr: Range[], t: number): number | null {
  const tot = fr.reduce((s, [x, y]) => s + (y - x), 0);
  if (tot < 1) return null;
  let at = t * tot;
  for (const [x, y] of fr) {
    if (at <= y - x) return x + at;
    at -= y - x;
  }
  return null;
}

// ---------------------------------------------------------------- side profiles

/** Insets of consecutive blocks along a side: block i is a tilted line from s[i] to e[i] within lims[i]; two blocks
 *  meet in a step of 0 or `P.step` (when no step fits, the earlier block is re-aimed to end where the next starts:
 *  a longer slope, never a small jog). */
function blockInsets(lims: Range[], P: Params, r: Rng): {s: number[]; e: number[]} {
  const s: number[] = [];
  const e: number[] = [];
  for (let i = 0; i < lims.length; i++) {
    const [lo, hi] = lims[i];
    const want = r.range(lo, hi);
    const st = r.range(P.step[0], P.step[1]);
    const tilt = r.jitter(P.tilt / 2);
    if (i === 0) s[i] = want;
    else {
      const opts = [e[i - 1] + st, e[i - 1] - st].filter((v) => v >= lo && v <= hi).sort((a, b) => Math.abs(a - want) - Math.abs(b - want));
      if (opts.length) s[i] = opts[0];
      else {
        const c = Math.min(hi, Math.max(lo, e[i - 1]));
        if (Math.abs(c - e[i - 1]) > 0.5 && c >= lims[i - 1][0] && c <= lims[i - 1][1]) e[i - 1] = c;
        s[i] = c;
      }
    }
    e[i] = Math.min(hi, Math.max(lo, s[i] + tilt));
  }
  return {s, e};
}

/** Knots (u ascending) of a side made of blocks between cuts (u positions), with slanted steps where the inset changes. */
function blockKnots(len: number, cuts: number[], s: number[], e: number[], slant: number[]): Knot[] {
  const k: Knot[] = [];
  const bounds = [0, ...cuts, len];
  for (let i = 0; i < s.length; i++) {
    const stepIn = i > 0 ? Math.abs(s[i] - e[i - 1]) : 0;
    const stepOut = i < s.length - 1 ? Math.abs(s[i + 1] - e[i]) : 0;
    const wIn = stepIn > 0.5 ? (stepIn * slant[i - 1]) / 2 : 0;
    const wOut = stepOut > 0.5 ? (stepOut * slant[i]) / 2 : 0;
    k.push({u: bounds[i] + wIn, d: s[i]}, {u: bounds[i + 1] - wOut, d: e[i]});
  }
  return k.filter((p, i) => i === 0 || Math.abs(p.u - k[i - 1].u) > 0.3 || Math.abs(p.d - k[i - 1].d) > 0.3);
}

// ---------------------------------------------------------------- the paint

export type PaintRole = 'bare' | 'step' | 'bleed' | 'square';

export type PaintGeometry = {
  colour: string;
  /** The body (it contains the caption block; the single-contour stand-in for checks written for one contour). */
  colourPts: Pt[];
  /** Every colour block (clockwise; the clip is their union). */
  colourPolys: Pt[][];
  ink: string;
  inkPolys: Pt[][];
  strokes: EdgeStroke[];
  /** Tuning / checks: the corner roles (TL, TR, BR, BL), the left / right block seams (screen y), the features. */
  meta: {roles: PaintRole[]; seamsL: number[]; seamsR: number[]; bites: number; tongues: number; keeps: number; L: number};
};

const CACHE = new Map<string, PaintGeometry>();

/** The painted edge for a seed at a looseness, aware of the scene under it (memoised). */
export function paintSpec(seed: Seed, looseness: number, hints?: EdgeHints): PaintGeometry {
  const key = `${seed}|${looseness.toFixed(3)}|${hints ? JSON.stringify(hints) : ''}`;
  let g = CACHE.get(key);
  if (!g) {
    let L = looseness;
    for (let i = 0; i < 10; i++, L *= 0.9) {
      g = build(seed, L, hints);
      if (containsRectAny(g.colourPolys, CAPTION_SAFE, 10)) break;
    }
    CACHE.set(key, g!);
  }
  return g!;
}

type Corner = {role: PaintRole; V: number; Hh: number; strokes: boolean};

function build(seed: Seed, L: number, hints?: EdgeHints): PaintGeometry {
  const P = paintParams(L);
  const r = rng(`${seed}/paint`);
  const keeps: EdgeRect[] = hints?.keep ?? [];
  const inkOf = (g: EdgeInkRegion): number | undefined => hints?.ink?.[g];

  // 1. block seams down the sides (screen y). Left: just under the caption block, then (medium / loose) one where the
  // visible band meets the bottom UI, then (loose) one more under it. Right: between the caption and the rail, and
  // (medium / loose) just below the rail, so the rail band is one block.
  const rs = r.fork('seams');
  const sL = [rs.range(650, 790), rs.range(1440, 1560), rs.range(1640, 1760)];
  const sR = [rs.range(640, 830), rs.range(1560, 1660)];
  const nL = Math.max(2, Math.min(4, Math.round(P.bands)));
  const nR = nL >= 3 ? 3 : 2;
  const seamsL = nL === 2 ? [sL[0]] : nL === 3 ? [sL[0], sL[1]] : sL;
  const seamsR = nR === 2 ? [sR[0]] : sR;
  const rail: Range = [10, PAINT_LIMITS.rail];
  const limsL: Range[] = [P.left0, P.left, ...(nL >= 3 ? [P.leftLow] : []), ...(nL >= 4 ? [P.leftLow] : [])];
  const limsR: Range[] = [P.right0, rail, ...(nR >= 3 ? [P.rightLow] : [])];
  const insL = blockInsets(limsL, P, r.fork('insetsL'));
  const insR = blockInsets(limsR, P, r.fork('insetsR'));
  const rsl = r.fork('slants');
  const slant = Array.from({length: 6}, () => rsl.range(0.2, 0.5));
  // right side: u = y; left side: u = H - y (blocks listed bottom-up)
  const right = blockKnots(H, seamsR, insR.s, insR.e, slant);
  const left = blockKnots(H, seamsL.map((y) => H - y).reverse(), insL.e.slice().reverse(), insL.s.slice().reverse(), slant.slice(0, nL - 1).reverse());

  // top: a tilted line, maybe one step; bottom: blocks with 0-2 steps
  const rt = r.fork('top');
  const topCut = rt.range(320, 760);
  const topStepOn = rt.next() < P.topStep;
  const topIns = blockInsets(topStepOn ? [P.top, [P.top[0], P.top[1] * 1.5] as Range] : [P.top], P, rt);
  const top = blockKnots(W, topStepOn ? [topCut] : [], topIns.s, topIns.e, [rt.range(0.2, 0.5)]);
  const rbt = r.fork('bottom');
  const nBS = Math.round(P.bottomSteps);
  const bCuts = [rbt.range(240, 440), rbt.range(620, 860)].slice(0, nBS).sort((a, b) => a - b);
  const bLims: Range[] = Array.from({length: nBS + 1}, (_, i) => (i % 2 ? [P.bottom[0] * 1.2, Math.min(PAINT_LIMITS.bottom - 60, P.bottom[1] * 1.6)] : P.bottom) as Range);
  const botIns = blockInsets(bLims, P, rbt);
  const bottom = blockKnots(W, bCuts, botIns.s, botIns.e, [rbt.range(0.2, 0.5), rbt.range(0.2, 0.5)]);
  const prof: Knot[][] = [top, right, bottom, left];
  const onSide = (s: number, u: number): Pt => toScreen(s, u, interp(prof[s], u));

  // 2. the body's corners (where adjacent side profiles meet), and each corner's local frame
  const fc: Pt[] = [
    [0, 0],
    [W, 0],
    [W, H],
    [0, H],
  ];
  const hx = (k: number) => (k === 0 || k === 3 ? 1 : -1); // inward along x
  const vy = (k: number) => (k <= 1 ? 1 : -1); // inward along y
  const vSide = (k: number) => (k === 0 || k === 3 ? 3 : 1);
  const hSide = (k: number) => (k <= 1 ? 0 : 2);
  const Q: Pt[] = fc.map((c, k) => {
    let q: Pt = c;
    for (let i = 0; i < 4; i++) {
      const x = vSide(k) === 3 ? interp(left, H - q[1]) : W - interp(right, q[1]);
      const y = hSide(k) === 0 ? interp(top, q[0]) : H - interp(bottom, W - q[0]);
      q = [x, y];
    }
    return q;
  });
  /** A point on corner k's vertical side `a` px from its corner, and on its horizontal side `b` px from it. */
  const vPt = (k: number, a: number): Pt => {
    const y = Q[k][1] + vy(k) * a;
    return onSide(vSide(k), vSide(k) === 1 ? y : H - y);
  };
  const hPt = (k: number, b: number): Pt => {
    const x = Q[k][0] + hx(k) * b;
    return onSide(hSide(k), hSide(k) === 0 ? x : W - x);
  };
  /** The most a corner's bare / step area may extend down its vertical side. */
  const maxV = (k: number) => (k <= 1 ? TOP_CORNER_Y - Q[k][1] : k === 2 ? Q[k][1] - (RAIL[1] + 12) : Q[k][1] - 1380);

  // 3. corner roles, aware of the scene: bare only where there is line art (hints.ink), never through a keep rect
  const rr = r.fork('roles');
  const jit = [0, 1, 2, 3].map(() => rr.next());
  const sizeDraws = [0, 1, 2, 3].map(() => ({v: rr.next(), h: rr.next(), sv: rr.next(), sh: rr.next(), b1: rr.next(), b2: rr.next()}));
  const kneeDraws = [0, 1, 2, 3].map(() => ({t1: rr.range(0.26, 0.4), t2: rr.range(0.6, 0.76), o1: rr.range(-0.05, 0.07), o2: rr.range(-0.06, 0.05), ke: rr.range(0.45, 0.6), jy: rr.jitter(1), sl: rr.range(0.12, 0.35)}));
  const prior = [0.3, 0.3, 0.45, 0.45];
  const inkC = (k: number) => inkOf(CORNER_REGION[k]);
  const score = (k: number) => (inkC(k) ?? prior[k]) + 0.3 * jit[k];
  /** The bare region of corner k at a size (frame corner + the run), for keep-out tests. */
  const runPts = (k: number, V: number, Hh: number, sketch: boolean): Pt[] => {
    const kd = kneeDraws[k];
    const f = sketch ? kd.ke : 1;
    const A = vPt(k, V * f);
    const B = hPt(k, Hh * f);
    const len = Math.hypot(B[0] - A[0], B[1] - A[1]);
    // the normal of A -> B pointing toward the corner
    const nx = -(B[1] - A[1]) / (len || 1);
    const ny = (B[0] - A[0]) / (len || 1);
    const toQ = (Q[k][0] - A[0]) * nx + (Q[k][1] - A[1]) * ny > 0 ? 1 : -1;
    const knee = (t: number, o: number): Pt => [A[0] + (B[0] - A[0]) * t + toQ * nx * o * len, A[1] + (B[1] - A[1]) * t + toQ * ny * o * len];
    return [A, knee(kd.t1, kd.o1), knee(kd.t2, kd.o2), B];
  };
  const stepPts = (k: number, V: number, Hh: number): Pt[] => {
    const kd = kneeDraws[k];
    const A = vPt(k, V);
    const A2: Pt = [Q[k][0] + hx(k) * Hh, A[1] + kd.jy * Math.min(10, V * 0.06)];
    const B = hPt(k, Hh + kd.sl * V);
    return [A, A2, B];
  };
  const region = (k: number, pts: Pt[]): Pt[] => {
    const a = pts[0];
    const b = pts[pts.length - 1];
    const sideA: Pt = vSide(k) === 3 ? [-OFF, a[1]] : [W + OFF, a[1]];
    const sideB: Pt = hSide(k) === 0 ? [b[0], -OFF] : [b[0], H + OFF];
    const c: Pt = [fc[k][0] - hx(k) * OFF, fc[k][1] - vy(k) * OFF];
    return [sideA, ...pts, sideB, c];
  };
  const fits = (k: number, role: 'bare' | 'step'): {V: number; Hh: number} | null => {
    const sd = sizeDraws[k];
    const vMax = maxV(k);
    let V = role === 'bare' ? lerpR(k <= 1 ? [P.bareH[0] * 0.5, P.bareH[1] * 0.5] : P.bareV, sd.v) : lerpR(P.stepV, sd.sv);
    let Hh = role === 'bare' ? lerpR(P.bareH, sd.h) : lerpR(P.stepH, sd.sh);
    V = Math.min(V, vMax);
    if (V < (role === 'bare' ? 90 : 60)) return null;
    for (const f of [1, 0.85, 0.72, 0.6]) {
      const v = V * f;
      const h = Hh * f;
      const reg = region(k, role === 'bare' ? runPts(k, v, h, false) : stepPts(k, v, h));
      if (!keeps.some((kr) => rectHitsPoly(kr, reg))) return {V: v, Hh: h};
    }
    return null;
  };
  const corners: Corner[] = [0, 1, 2, 3].map(() => ({role: 'square', V: 0, Hh: 0, strokes: false}));
  const nBare = Math.round(P.bare);
  const byScore = [0, 1, 2, 3].sort((a, b) => score(b) - score(a));
  const dense = (k: number) => (inkC(k) ?? 0.5) >= 0.3;
  const sparse = (k: number) => (inkC(k) ?? 0.5) < 0.12;
  if (nBare >= 1) {
    let first = byScore.find((k) => dense(k) && fits(k, 'bare'));
    // no corner holds enough drawing: the best non-flat one, with its block outline ruled in
    if (first === undefined) first = byScore.find((k) => !sparse(k) && fits(k, 'bare'));
    if (first !== undefined) {
      const sz = fits(first, 'bare')!;
      corners[first] = {role: 'bare', ...sz, strokes: (inkC(first) ?? 0) < 0.5};
      if (nBare >= 2) {
        const diag = (first + 2) % 4;
        const second = [diag, ...byScore.filter((k) => k !== diag)].find((k) => k !== first && dense(k) && fits(k, 'bare'));
        if (second !== undefined) corners[second] = {role: 'bare', ...fits(second, 'bare')!, strokes: (inkC(second) ?? 0) < 0.5};
      }
    }
  }
  for (let n = 0; n < Math.round(P.stepCorners); n++) {
    const k = [0, 1].filter((c) => corners[c].role === 'square' && dense(c)).sort((a, b) => score(b) - score(a))[0];
    if (k === undefined) break;
    const sz = fits(k, 'step');
    if (sz) corners[k] = {role: 'step', ...sz, strokes: true};
  }
  for (let n = 0; n < Math.round(P.bleed); n++) {
    // the emptiest corner (a flat sky), not next to a bare / step corner on a short side
    const k = [0, 1, 2, 3].filter((c) => corners[c].role === 'square').sort((a, b) => score(a) - score(b))[0];
    if (k === undefined) break;
    corners[k] = {role: 'bleed', V: 0, Hh: 0, strokes: false};
  }
  const roles = corners.map((c) => c.role);

  // 4. features along the sides: bites (colour only) and tongues (blocks), clear of corners, seams and keep rects
  const taken: Range[][] = [[], [], [], []];
  const cornerSpan = (s: number): Range[] => {
    // u intervals at both ends of side s used by its corners (+ margin)
    const out: Range[] = [];
    const startK = s; // corner at u = 0 of side s
    const endK = (s + 1) % 4; // corner at u = LEN
    for (const [k, atStart] of [
      [startK, true],
      [endK, false],
    ] as const) {
      const c = corners[k];
      const vert = s === 1 || s === 3;
      const ext = c.role === 'bare' || c.role === 'step' ? (vert ? c.V : c.Hh + 40) : c.role === 'bleed' ? 320 : 0;
      const base = vert ? Math.abs(Q[k][1] - fc[k][1]) : Math.abs(Q[k][0] - fc[k][0]);
      const reach = base + ext + 110;
      out.push(atStart ? [-1e4, reach] : [LEN[s] - reach, 1e4]);
    }
    return out;
  };
  const keepSpan = (s: number, depth: number): Range[] =>
    keeps
      .map((kr) => {
        const ks = [fromScreen(s, [kr[0], kr[1]]), fromScreen(s, [kr[2], kr[3]])];
        return {u0: Math.min(ks[0].u, ks[1].u), u1: Math.max(ks[0].u, ks[1].u), d0: Math.min(ks[0].d, ks[1].d)};
      })
      .filter((k) => k.d0 < depth + 60)
      .map((k) => [k.u0 - 60, k.u1 + 60] as Range);
  const seamSpan = (s: number): Range[] =>
    s === 3 ? seamsL.map((y) => [H - y - 80, H - y + 80] as Range) : s === 1 ? seamsR.map((y) => [y - 80, y + 80] as Range) : s === 2 ? bCuts.map((u) => [u - 80, u + 80] as Range) : [];
  const colourK: Knot[][] = prof.map((k) => k.slice());
  let nBites = 0;
  const bite = (s: number, lo: number, hi: number, w: number, depthFn: (dSide: number) => number, t: number, e1: number, e2: number, tl: number) => {
    const probe = depthFn(Math.max(...colourK[s].map((p) => p.d)));
    const fr = free(lo, hi, w, [...cornerSpan(s), ...seamSpan(s), ...keepSpan(s, probe), ...taken[s].map(([a, b]) => [a - 150, b + 150] as Range)]);
    const ua = pickIn(fr, t);
    if (ua === null) return;
    const ub = ua + w;
    const base = colourK[s];
    const dA = interp(base, ua);
    const dB = interp(base, ub);
    const dIn = depthFn(Math.max(dA, dB));
    const deep = dIn - Math.max(dA, dB);
    if (deep < P.step[0] * 0.8) return;
    const mid: Knot[] = [
      {u: ua + e1 * deep, d: dIn - tl / 2},
      {u: ub - e2 * deep, d: dIn + tl / 2},
    ];
    if (mid[1].u - mid[0].u < 40) return;
    colourK[s] = [...base.filter((p) => p.u < ua), {u: ua, d: dA}, ...mid, {u: ub, d: dB}, ...base.filter((p) => p.u > ub)];
    taken[s].push([ua, ub]);
    nBites++;
  };
  const rbL = r.fork('leftBite');
  const lb = {depth: lerpR(P.leftBite, rbL.next()), w: lerpR(P.leftBiteW, rbL.next()), t: rbL.next(), e1: rbL.range(0.25, 0.6), e2: rbL.range(0.25, 0.6), tl: rbL.jitter(P.tilt * 0.5)};
  if (lb.depth > 40 && (inkOf('left') ?? 0.5) >= 0.3) bite(3, H - LEFT_BITE_Y[1], H - LEFT_BITE_Y[0], lb.w, (d) => Math.max(lb.depth, d + P.step[0]), lb.t, lb.e1, lb.e2, lb.tl);
  const bottomInk = inkOf('bottom') ?? 0.5;
  for (let i = 0; i < 2; i++) {
    const rb = r.fork(`bottomBite${i}`);
    const d = {depth: lerpR(P.bottomBite, rb.next()), w: lerpR(P.bottomBiteW, rb.next()), t: rb.next(), e1: rb.range(0.3, 0.8), e2: rb.range(0.3, 0.8), tl: rb.jitter(P.tilt * 0.6)};
    if (i >= Math.round(P.bottomBites) || bottomInk < 0.25) continue;
    bite(2, 60, W - 60, d.w, (ds) => Math.min(PAINT_LIMITS.bottom - 10, ds + d.depth), d.t, d.e1, d.e2, d.tl);
  }

  // 5. blocks: bleed corners, tongues
  const blocks: Pt[][] = [];
  const local = (k: number, a: number, b: number): Pt => [fc[k][0] + hx(k) * a, fc[k][1] + vy(k) * b];
  for (let k = 0; k < 4; k++) {
    const rb = r.fork(`bleed${k}`);
    const t = [rb.next(), rb.next(), rb.range(0.55, 0.8), rb.range(0.5, 0.75)];
    if (corners[k].role !== 'bleed') continue;
    const qa = Math.abs(Q[k][0] - fc[k][0]);
    const qb = Math.abs(Q[k][1] - fc[k][1]);
    const bx = Math.max(lerpR(P.bleedR, t[0]), (qa + P.step[0]) / t[2]);
    const by = Math.max(lerpR(P.bleedR, t[1]) * (k <= 1 ? 0.8 : 1), (qb + P.step[0]) / t[3]);
    blocks.push(cw([local(k, -OFF, -OFF), local(k, bx, -OFF), local(k, bx * t[2], by * t[3]), local(k, -OFF, by)]));
  }
  let nTongues = 0;
  for (let i = 0; i < 2; i++) {
    const rt2 = r.fork(`tongue${i}`);
    const s = i === 0 || rt2.chance(0.6) ? 2 : 3;
    const w = lerpR(P.tongueW, rt2.next());
    const t = rt2.next();
    const sl = rt2.range(0.2, 0.42);
    const flip = rt2.chance(0.5);
    const reach = rt2.range(40, 80);
    const jit = Array.from({length: 8}, () => rt2.jitter(2));
    if (i >= Math.round(P.tongues)) continue;
    const [lo, hi] = s === 2 ? [60, W - 60] : [H - 1880, H - 1520];
    const fr = free(lo, hi, w, [...cornerSpan(s), ...seamSpan(s).map(([a, b]) => [a + 40, b - 40] as Range), ...taken[s].map(([a, b]) => [a - 160, b + 160] as Range)]);
    const ua = pickIn(fr, t);
    if (ua === null) continue;
    let deep = 0;
    for (let u = ua; u <= ua + w; u += 10) deep = Math.max(deep, interp(colourK[s], u));
    const inner = deep + reach;
    const e = sl * w;
    const a = flip ? 14 : e;
    const b = flip ? e : 14;
    const q = [toScreen(s, ua, -OFF), toScreen(s, ua + w, -OFF), toScreen(s, ua + w - b, inner), toScreen(s, ua + a, inner)];
    blocks.push(cw(q.map((p, j) => [p[0] + jit[2 * j], p[1] + jit[2 * j + 1]] as Pt)));
    taken[s].push([ua, ua + w]);
    nTongues++;
  }

  // 6. assemble the body (colour) and its sketch (ink): corners in clockwise order, first point on the side before
  const seqOf = (k: number, sketch: boolean): Pt[] => {
    const c = corners[k];
    let pts: Pt[];
    if (c.role === 'bare') pts = runPts(k, c.V, c.Hh, sketch);
    else if (c.role === 'step' && !sketch) pts = stepPts(k, c.V, c.Hh);
    else pts = [Q[k]];
    // runPts / stepPts go vertical side -> horizontal side; clockwise, corners TR and BL come from the horizontal side
    return k === 1 || k === 3 ? pts.slice().reverse() : pts;
  };
  const assemble = (lists: Knot[][], sketch: boolean): Pt[] => {
    const seqs = [0, 1, 2, 3].map((k) => seqOf(k, sketch));
    const pts: Pt[] = [];
    for (let k = 0; k < 4; k++) {
      pts.push(...seqs[k]);
      const u0 = fromScreen(k, seqs[k][seqs[k].length - 1]).u;
      const u1 = fromScreen(k, seqs[(k + 1) % 4][0]).u;
      pts.push(...lists[k].filter((p) => p.u > u0 + 0.5 && p.u < u1 - 0.5).map((p) => toScreen(k, p.u, p.d)));
    }
    return cw(dedupe(pts));
  };
  const body = assemble(colourK, false);
  const sketch = assemble(prof, true);

  // 7. keep rects: always in colour (a block, run off the frame on any side the rect comes close to)
  const rk = r.fork('keep');
  let nKeeps = 0;
  for (const kr of keeps) {
    const jit = [rk.jitter(2), rk.jitter(2), rk.jitter(2), rk.jitter(2)];
    if (containsRectAny([body, ...blocks], kr, 12)) continue;
    const pad = 14;
    let [x0, y0, x1, y1] = [kr[0] - pad, kr[1] - pad, kr[2] + pad, kr[3] + pad];
    const near = 110;
    if (x0 < depthAt([body], 3, H - (kr[1] + kr[3]) / 2) + near) x0 = -OFF;
    if (x1 > W - depthAt([body], 1, (kr[1] + kr[3]) / 2) - near) x1 = W + OFF;
    if (y0 < depthAt([body], 0, (kr[0] + kr[2]) / 2) + near) y0 = -OFF;
    if (y1 > H - depthAt([body], 2, W - (kr[0] + kr[2]) / 2) - near) y1 = H + OFF;
    blocks.push(
      cw([
        [x0 + jit[0], y0 + jit[1]],
        [x1 + jit[2], y0 - jit[1]],
        [x1 - jit[2], y1 + jit[3]],
        [x0 - jit[0], y1 - jit[3]],
      ]),
    );
    nKeeps++;
  }

  const colourPolys = [body, ...blocks];
  const inkPolys = [sketch, ...blocks, ...inkReach([sketch, ...blocks], P, r.fork('ink'))];

  // 8. ruled strokes: the block's corner where the paint stopped short (step corners; bare corners that hold little
  // drawing), else one painted top corner: a crossing pair 2-4 px out in the paper, overshooting the corner
  const strokes: EdgeStroke[] = [];
  const rsr = r.fork('ruled');
  const pairDraws = [0, 1, 2, 3].map(() => ({m: rsr.range(2.5, 4), oh: rsr.next(), ov: rsr.next(), lh: rsr.range(30, 70), lv: rsr.range(30, 70), sq: rsr.range(150, 260)}));
  const pickTop = rsr.chance(0.5) ? 0 : 1;
  const pair = (k: number, lenH: number, lenV: number, over: number[]) => {
    const pd = pairDraws[k];
    const q = Q[k];
    const vEnd = vPt(k, lenV);
    const hEnd = hPt(k, lenH);
    const unit = (a: Pt, b: Pt): Pt => {
      const l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
      return [(b[0] - a[0]) / l, (b[1] - a[1]) / l];
    };
    const dv = unit(q, vEnd);
    const dh = unit(q, hEnd);
    const nv: Pt = [-hx(k) * pd.m, 0];
    const nh: Pt = [0, -vy(k) * pd.m];
    const id = `${seed}pnt${k}`;
    strokes.push({d: ruled([vEnd[0] + nv[0], vEnd[1]], [q[0] - dv[0] * over[1] + nv[0], q[1] - dv[1] * over[1]], `${id}v`, 0.2), w: stroke.inkThin});
    strokes.push({d: ruled([hEnd[0], hEnd[1] + nh[1]], [q[0] - dh[0] * over[0], q[1] - dh[1] * over[0] + nh[1]], `${id}h`, 0.2), w: stroke.inkThin});
  };
  const overOf = (k: number, f = 1): number[] => [lerpR(P.ruledOver, pairDraws[k].oh) * f, lerpR(P.ruledOver, pairDraws[k].ov) * f];
  let topPair = false;
  let botPair = false;
  for (const k of [0, 1, 2, 3]) {
    const c = corners[k];
    if (!c.strokes || L < 0.3) continue;
    if (k <= 1 && topPair) continue;
    if (k >= 2 && botPair) continue;
    const lenV = k <= 1 ? Math.min(c.V + pairDraws[k].lv, STROKE_MAX_Y - Q[k][1]) : c.V + pairDraws[k].lv;
    pair(k, c.Hh + pairDraws[k].lh, lenV, overOf(k, c.role === 'bare' ? 0.8 : 1));
    if (k <= 1) topPair = true;
    else botPair = true;
  }
  if (!topPair && L >= 0.3) {
    const sq = [0, 1].filter((k) => roles[k] === 'square');
    const k = sq.length > 1 ? pickTop : sq[0];
    if (k !== undefined && Q[k][1] < STROKE_MAX_Y - 60) pair(k, pairDraws[k].sq, Math.min(pairDraws[k].sq * 0.8, STROKE_MAX_Y - Q[k][1]), overOf(k));
  }

  const path = (polys: Pt[][]) => polys.map((p) => pathOf(p)).join('');
  return {
    colour: path(colourPolys),
    colourPts: body,
    colourPolys,
    ink: path(inkPolys),
    inkPolys,
    strokes,
    meta: {roles, seamsL, seamsR, bites: nBites, tongues: nTongues, keeps: nKeeps, L},
  };
}

// ---------------------------------------------------------------- the ink reach

const toFrame = (p: Pt, n: Pt) => {
  if (p[0] < 0 || p[0] > W || p[1] < 0 || p[1] > H) return 0;
  const tx = n[0] > 1e-6 ? (W - p[0]) / n[0] : n[0] < -1e-6 ? -p[0] / n[0] : Infinity;
  const ty = n[1] > 1e-6 ? (H - p[1]) / n[1] : n[1] < -1e-6 ? -p[1] / n[1] : Infinity;
  return Math.min(tx, ty);
};

/** The band past every edge where the line art keeps going. Per edge the reach either ENDS in the white (one peak:
 *  it rises then falls, 26-66 px), RUNS OFF the frame, or does half and half with one perpendicular cut: a scene
 *  line parallel to the edge shows on one stretch and ends once (no dashes). Where the paper is under 30 px the
 *  line art runs off. Lines end at least 6-20 px short of the frame (they visibly stop in the white). */
function inkReach(polys: Pt[][], P: Params, ri: Rng): Pt[][] {
  const out: Pt[][] = [];
  const [lo, hi] = P.over;
  const span = hi - lo;
  for (const poly of polys) {
    const m = poly.length;
    const firstO: number[] = new Array(m).fill(0);
    const lastO: number[] = new Array(m).fill(0);
    for (let i = 0; i < m; i++) {
      const a = poly[i];
      const b = poly[(i + 1) % m];
      const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
      if (len < 2) continue;
      const dx = (b[0] - a[0]) / len;
      const dy = (b[1] - a[1]) / len;
      const n: Pt = [dy, -dx]; // outward for a clockwise (screen) polygon
      const at = (t: number): Pt => [a[0] + dx * t, a[1] + dy * t];
      const D = (t: number) => toFrame(at(t), n);
      const Dmax = Math.max(D(0), D(len / 2), D(len));
      const short = ri.range(6, 20);
      const mode = Dmax < 30 ? 'off' : ri.weighted([['ends', P.endP], ['off', (1 - P.endP) * 0.4], ['half', (1 - P.endP) * 0.6]] as const);
      const ts: number[] = [0];
      while (ts[ts.length - 1] < len) ts.push(Math.min(len, ts[ts.length - 1] + ri.range(90, 220)));
      if (ts.length > 2 && len - ts[ts.length - 2] < 45) ts.splice(ts.length - 2, 1);
      let off: boolean[];
      let v: number[];
      if (mode === 'half') {
        const tc = len * ri.range(0.3, 0.7);
        const offFirst = ri.chance(0.5);
        const keepTs = ts.filter((t) => Math.abs(t - tc) > 20);
        ts.length = 0;
        ts.push(...[...keepTs, tc - 0.5, tc + 0.5].sort((p, q) => p - q));
        off = ts.map((t) => (offFirst ? t < tc : t > tc));
        // falling away from the cut
        v = ts.map(() => 0);
        const order = ts.map((_, j) => j).filter((j) => !off[j]);
        if (!offFirst) order.reverse();
        let cur = lo + span * ri.range(0.6, 1);
        for (const j of order) {
          v[j] = cur;
          cur = Math.max(lo, cur - span * ri.range(0.05, 0.3));
        }
      } else {
        off = ts.map(() => mode === 'off');
        v = ts.map(() => 0);
        const pk = ri.int(0, ts.length - 1);
        v[pk] = lo + span * ri.range(0.55, 1);
        for (let j = pk - 1; j >= 0; j--) v[j] = Math.max(lo, v[j + 1] - span * ri.range(0.05, 0.35));
        for (let j = pk + 1; j < ts.length; j++) v[j] = Math.max(lo, v[j - 1] - span * ri.range(0.05, 0.35));
      }
      const comb: Pt[] = [a];
      ts.forEach((t, j) => {
        const d = D(t);
        const o = off[j] ? d + OFF : Math.max(Math.min(6, d), Math.min(v[j], d - short));
        if (j === 0) firstO[i] = o;
        lastO[i] = o;
        const p = at(t);
        comb.push([p[0] + n[0] * o, p[1] + n[1] * o]);
      });
      comb.push(b);
      out.push(cw(comb));
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
      const o = Math.min(lastO[(i + m - 1) % m], firstO[i]);
      if (!(o > 0)) continue;
      const n0: Pt = [d0[1] / l0, -d0[0] / l0];
      const n1: Pt = [d1[1] / l1, -d1[0] / l1];
      out.push(cw([v, [v[0] + n0[0] * o, v[1] + n0[1] * o], [v[0] + (n0[0] + n1[0]) * o * 0.7, v[1] + (n0[1] + n1[1]) * o * 0.7], [v[0] + n1[0] * o, v[1] + n1[1] * o]]));
    }
  }
  return out;
}
