// boards/StatementBoard.tsx: K3's ONE enamel A-board (TREATMENT section 9 K3; section 8 A5, V2, V9; section 5 "Texts
// on objects"). Every board in the film is this face: TOLD THE BBC (S2), the deal board (S6), GOOGLE SAYS (S7) and
// SHE SAYS (S8). The deal board, Google's board and hers are the SAME 480 x 520 face, frame, keyline, screws, light,
// shadow and type sizes (fairness, A5); the S2 newsstand board is the same face smaller (400 x 200), same type.
//
//   <StatementBoard face={B} lines={[{text: 'GOOGLE SAYS', size: TYPE.header, y: 770, anchor: 'middle'}]} />
//   <DealBoard />  <GoogleBoard />  <HerBoard />  <ToldTheBBCBoard />      the four presets (scene-local defaults)
//   boardFrame(face, stile, rail, legsTo)                                 the geometry, for figures / Pip / a cloth
//
// Anatomy, back -> front: the flat ground shadow (cast right; colour, never grey) | the A's back frame seen past the
// right stile (a slim wedge on the shade side) and its back leg under the bottom rail | the plum-painted wooden frame:
// two stiles that run down to the ground as the front legs, a top rail with a handle slot, a bottom rail; a lit strip
// on the sun side (screen left) | the cream enamel plate with slightly rounded corners, its thickness showing as a
// shade edge right and below | a plum keyline inset ~10 px, closed, with four brass screw heads on its corners (the clean face, 2026-10-28: no notches, no slots, no handle slot) | the lettering
// (WorldText, one type scale, flat ink) and thin painted rules | loose ink on the frame's outer contour only (open,
// small overshoots): never on the face, never round the letters.
// Motion (nothing fades, ever): `at` the board lands (a short drop, then the clack); `clackAt` a 3 px wooden jolt
// that springs back in 0.15 s; lines are already there, pen-written (`mode: 'pen'`: the face is there first) or popped
// (`'pop'`, a block pops as one); `wipe` erases the half-wiped menu (`smudges`) behind a ragged edge that crosses the
// face in ONE stroke; every piece un-builds with the loop (Fill / Ink / WorldText read useExit).

import React, {useId, useMemo} from 'react';
import {CM, INK_PX} from '../../palette';
import {Fill} from '../../../lib/Fill';
import {Ink} from '../../../lib/Ink';
import {line as skLine, type Pt} from '../../../lib/sketch';
import {ease, prog, springAt, springs, useTime} from '../../../lib/time';
import {useCaptionFont} from '../../../lib/font';
import {XG, mat} from '../../../lib/xf';
import {rng, type Rng} from '../../../lib/rng';
import {B, B_LEGS_Y1, S2, S6, type Rect, type XY} from '../../world/map';
import {TYPE, WorldText, penDur, textW, type TextMode} from './WorldText';
import {TXT_DEAL, TXT_GOOGLE, TXT_HER, TXT_TOLD_THE_BBC} from './texts';
import {tiered} from '../tiers';

// ---------------------------------------------------------------- colour: CM tokens and flat mixes of them

const hexRgb = (h: string): [number, number, number] => {
  const s = h.replace('#', '');
  return [parseInt(s.slice(0, 2), 16), parseInt(s.slice(2, 4), 16), parseInt(s.slice(4, 6), 16)];
};
/** A flat sRGB mix of two palette colours (k 0 = a). A colour step, never drawn as a gradient. */
export const mixHex = (a: string, b: string, k: number): string => {
  const A = hexRgb(a);
  const C = hexRgb(b);
  return '#' + A.map((v, i) => Math.round(v + (C[i] - v) * k).toString(16).padStart(2, '0')).join('').toUpperCase();
};

/** Every colour a board uses (CM tokens and flat mixes of them; identical on every board: one light, A5). */
export const BOARD_COLORS = {
  frame: CM.anchor,
  /** The lit strip on the sun side (screen left in S2, S6, S7, S8). */
  frameLit: CM.coatPlum,
  /** The shade side: the A's back frame seen past the right stile, the back leg. */
  frameShade: mixHex(CM.anchor, CM.ink, 0.5),
  face: CM.paper,
  /** The enamel plate's thickness (right and bottom edges, in shade). */
  faceEdge: mixHex(CM.paper, CM.stoneShade, 0.62),
  keyline: CM.anchor,
  screw: CM.coatMustard,
  screwSlot: CM.line,
  lettering: CM.ink,
  rule: CM.anchor,
  contour: CM.ink,
  /** The ground shadow: a warm shade of the paving (colour, never grey). */
  shadow: mixHex(CM.paving, CM.shadeWarm, 0.45),
  /** The blank face ONE value step down (L* ~88 vs the face's 96; warm, never greyed): `dim` (REVIEW_1 SHOULD 2 /
   *  check_light 34.0: a blank cream face outshone the beat's subject). `dim.k` scales the step (1 = the whole step). */
  faceDim: mixHex(CM.paper, CM.shadeWarm, 0.15),
  /** The half-wiped menu (HerBoard): pale flat smears, no legible words (its scribbles are not drawn since REVIEW_1:
   *  they read as a stray grey squiggle). */
  smear: mixHex(CM.paper, CM.coatPlum, 0.09),
  smearDeep: mixHex(CM.paper, CM.coatPlum, 0.16),
  scribble: mixHex(CM.coatPlum, CM.paper, 0.42),
} as const;
export type BoardColors = {[K in keyof typeof BOARD_COLORS]: string};

/** S2's TOLD THE BBC A-board, calm (L2's request, 2026-10-28: there it SUPPORTS the wall of windows): the frame L* ~42 in
 *  the coatPlum / line family (lit / shade one step either side), the face limestone L* 91, a step under the staff
 *  panes; the lettering stays ink (it must read). The deal, Google and her boards keep BOARD_COLORS (A5). */
const BBC_FRAME_C = mixHex(mixHex(CM.coatPlum, CM.line, 0.3), CM.paper, 0.08);
export const BBC_CALM: Partial<BoardColors> = {
  frame: BBC_FRAME_C,
  frameLit: mixHex(BBC_FRAME_C, CM.paper, 0.2),
  frameShade: mixHex(BBC_FRAME_C, CM.anchor, 0.35),
  face: CM.limestone,
  faceEdge: mixHex(CM.limestone, CM.stoneShade, 0.62),
  keyline: BBC_FRAME_C,
  rule: BBC_FRAME_C,
  contour: mixHex(BBC_FRAME_C, CM.anchor, 0.5),
};

/** The shared faux weight of every key line (>= 56 px: headers and keys) so it holds at 216 px wide. ONE value for
 *  every board (fairness: no board gets extra weight). */
export const KEY_WEIGHT = 1.2;
/** The frame's shared seed: the hand-drawn contour, screws and keyline are the same on every board (A5). */
export const FRAME_SEED = 'statement-board';
/** The shared faux weight of credits and small rows (<= 20 px) so they hold at full-screen phone width (~390 px). */
export const CREDIT_WEIGHT = 0.45;
/** The shared faux weight of the 40-55 px lines (REVIEW_1 MUST 3: every drawn line >= 44 px; ~KEY_WEIGHT x 44 / 56) so
 *  they hold at 0.25 scale like the keys. ONE value for every board. */
export const MID_WEIGHT = 0.9;
/** The faux weight of a line by its size (the same on every board): keys KEY_WEIGHT, 40-55 px MID_WEIGHT, credits
 *  CREDIT_WEIGHT, body 0. */
export const weightFor = (size: number) => (size >= TYPE.key ? KEY_WEIGHT : size >= 40 ? MID_WEIGHT : size <= TYPE.creditLarge ? CREDIT_WEIGHT : 0);

// ---------------------------------------------------------------- geometry

export type BoardGeom = {
  face: Rect;
  stile: number;
  rail: number;
  legsTo: number;
  keyInset: number;
  /** The frame's top edge. */
  top: number;
  /** The front frame's outer box, top edge to the feet. */
  outer: Rect;
  stileL: Rect;
  stileR: Rect;
  railT: Rect;
  railB: Rect;
  /** The A's back frame seen past the right stile (the shade side): hinge at the top, foot near the ground. */
  side: Pt[] | null;
  /** The back left leg seen under the bottom rail, just right of the left front leg. */
  backLeg: Pt[] | null;
  /** The handle slot in the top rail (a hole: the scene shows through it), or null. */
  handle: Rect | null;
  /** The plum keyline (centreline rect; corners notched round the screws) and the four screw centres. */
  keyline: Rect;
  notch: number;
  screws: XY[];
  /** The text column (inside the keyline, with a margin) and the face centre. */
  column: {x0: number; x1: number};
  centre: XY;
  /** The front feet (bottom centres) on the ground line, and the back foot's height above it. */
  feet: [XY, XY];
  lift: number;
};

export type BoardFrameOpts = {
  /** Keyline inset from the face edge (px). Default 10 (big faces); the presets pass 7 for the small S2 face. */
  keyInset?: number;
  /** Width of the A's back frame seen past the right stile at the feet (px); 0 = none. Default 0.36 x stile. */
  side?: number;
  /** A handle slot in the top rail. Default: true when the rail is >= 18 px. */
  handle?: boolean;
  /** Text margin inside the keyline (px). Default 12. */
  margin?: number;
};

/** The board's geometry for a face rect, the frame's stile / rail widths and the ground line (legs' feet). Pure. */
export function boardFrame(face: Rect, stile = 40, rail = 20, legsTo: number = B_LEGS_Y1, o: BoardFrameOpts = {}): BoardGeom {
  const keyInset = o.keyInset ?? 10;
  const sideW = o.side ?? Math.round(stile * 0.36);
  const margin = o.margin ?? 12;
  const top = face.y0 - rail;
  const X0 = face.x0 - stile;
  const X1 = face.x1 + stile;
  const legsTop = face.y1 + rail;
  const lift = Math.max(1.5, Math.min(6, (legsTo - legsTop) * 0.3));
  const hinge = top + rail * 0.3;
  const footY = legsTo - lift;
  const wAt = (y: number) => (sideW * (y - hinge)) / Math.max(1, footY - hinge);
  const side: Pt[] | null = sideW > 0 ? [[X1 - 2, hinge], [X1 + 1.5, hinge], [X1 + sideW, footY], [X1 - 2, footY]] : null;
  const backLeg: Pt[] | null =
    sideW > 0 && legsTo - legsTop > 2 ? [[face.x0 - 2, legsTop - 2], [face.x0 + wAt(legsTop), legsTop - 2], [face.x0 + sideW, footY], [face.x0 - 2, footY]] : null;
  // the clean face (2026-10-28, the orchestrator on L5's request): no handle slot unless a board asks for one
  const hasHandle = o.handle ?? false;
  const hw = Math.min(62, (face.x1 - face.x0) * 0.13);
  const hh = Math.max(4.5, rail * 0.3);
  const cx = (face.x0 + face.x1) / 2;
  const handle = hasHandle ? {x0: cx - hw / 2, y0: top + (rail - hh) / 2, x1: cx + hw / 2, y1: top + (rail + hh) / 2} : null;
  const k = {x0: face.x0 + keyInset, y0: face.y0 + keyInset, x1: face.x1 - keyInset, y1: face.y1 - keyInset};
  return {
    face,
    stile,
    rail,
    legsTo,
    keyInset,
    top,
    outer: {x0: X0, y0: top, x1: X1, y1: legsTo},
    stileL: {x0: X0, y0: top, x1: face.x0, y1: legsTo},
    stileR: {x0: face.x1, y0: top, x1: X1, y1: legsTo},
    railT: {x0: face.x0, y0: top, x1: face.x1, y1: face.y0},
    railB: {x0: face.x0, y0: face.y1, x1: face.x1, y1: legsTop},
    side,
    backLeg,
    handle,
    keyline: k,
    notch: Math.max(6, keyInset * 0.95),
    screws: [
      {x: k.x0, y: k.y0},
      {x: k.x1, y: k.y0},
      {x: k.x1, y: k.y1},
      {x: k.x0, y: k.y1},
    ],
    column: {x0: k.x0 + margin, x1: k.x1 - margin},
    centre: {x: cx, y: (face.y0 + face.y1) / 2},
    feet: [
      {x: X0 + stile / 2, y: legsTo},
      {x: X1 - stile / 2, y: legsTo},
    ],
    lift,
  };
}

/** The face of the big boards inside S6's 560 x 560 contract rect (x 160-640, y 700-1220 at the cut). */
export const S6_FACE: Rect = {x0: S6.board0.x0 + 40, y0: S6.board0.y0 + 20, x1: S6.board0.x1 - 40, y1: S6.board0.y1 - 20};
/** S6's ground line: the feet stand on the footpath's back kerb (dc/gate draws it y 1248-1255, GATE.kerbY 1252). It is
 *  B_LEGS_Y1, so the deal board's frame, legs and shadow are IDENTICAL to Google's (fairness, A5). */
export const S6_LEGS_Y1 = B_LEGS_Y1;
/** S2: L2's paving line under the newsstand board. */
export const S2_LEGS_Y1 = 1298;
/** The small S2 face's frame options (the keyline and margin scaled with the 26 px stile). */
export const BBC_FRAME: BoardFrameOpts = {keyInset: 7, margin: 10};

const r1 = (n: number) => Math.round(n * 10) / 10;
const P = (x: number, y: number) => `${r1(x)} ${r1(y)}`;
const polyD = (pts: Pt[]) => pts.map(([x, y], i) => `${i ? 'L' : 'M'}${P(x, y)}`).join('') + 'Z';
const rectD = (r: Rect) => `M${P(r.x0, r.y0)}H${r1(r.x1)}V${r1(r.y1)}H${r1(r.x0)}Z`;
/** Rounded rect (convex corners), closed. */
const roundD = (r: Rect, rad: number) =>
  `M${P(r.x0 + rad, r.y0)}H${r1(r.x1 - rad)}A${rad} ${rad} 0 0 1 ${P(r.x1, r.y0 + rad)}V${r1(r.y1 - rad)}A${rad} ${rad} 0 0 1 ${P(r.x1 - rad, r.y1)}` +
  `H${r1(r.x0 + rad)}A${rad} ${rad} 0 0 1 ${P(r.x0, r.y1 - rad)}V${r1(r.y0 + rad)}A${rad} ${rad} 0 0 1 ${P(r.x0 + rad, r.y0)}Z`;
const circD = (x: number, y: number, rr: number) => `M${P(x - rr, y)}a${rr} ${rr} 0 1 0 ${r1(rr * 2)} 0a${rr} ${rr} 0 1 0 ${r1(-rr * 2)} 0Z`;

// ---------------------------------------------------------------- motion helpers (pure)

export const CLACK = {drop: 3.2, dur: 0.15} as const;
/** The wooden jolt (px, down positive) at time t for a clack at `at`: a ~3 px drop in 2 frames, a small rebound past
 *  rest, settled by 0.15 s. */
export function clackDy(t: number, at: number, drop: number = CLACK.drop, dur: number = CLACK.dur): number {
  const x = t - at;
  if (x < 0 || x >= dur) return 0;
  const k1 = dur * 0.4;
  if (x < k1) return drop * Math.sin((Math.PI * x) / k1);
  return -0.3 * drop * Math.sin((Math.PI * (x - k1)) / (dur - k1));
}

export const LAND = {drop: 34, dur: 0.1} as const;
/** The landing: the board drops the last `LAND.drop` px onto its feet over `LAND.dur` s from `at` (then clacks). */
export const landDy = (t: number, at: number | undefined) => (at === undefined ? 0 : -LAND.drop * (1 - ease.inQuad(prog(t, at, LAND.dur))));

/** The board's vertical offset at t (landing + every clack): use it to keep a figure's hand or a cloth on the board. */
export function boardDy(t: number, at?: number, clackAt?: number | readonly number[], drop: number = CLACK.drop): number {
  const cl = clackAt === undefined ? [] : typeof clackAt === 'number' ? [clackAt] : clackAt;
  const all = at === undefined ? cl : [...cl, at + LAND.dur];
  return landDy(t, at) + all.reduce((s, c) => s + clackDy(t, c, drop), 0);
}

// ---------------------------------------------------------------- the half-wiped menu and the wipe

export type Wipe = {
  /** Start of the ONE stroke (scene s). */
  at: number;
  /** Duration (s). Default 0.35. */
  dur?: number;
  /** The direction the cloth travels across the face. Default 'right'. */
  dir?: 'right' | 'left';
  seed?: string;
};
export const WIPE_DUR = 0.35;
/** The seed of her board's wipe edge (HerBoard and herWipe share it, so a cloth on wipeEdgeX matches the erase). */
export const HER_WIPE_SEED = 'her-wipe';

const wipeNoise = (y: number, seed: string) => {
  const r = rng(`wipe/${seed}`);
  const p1 = r.range(0, 6.28);
  const p2 = r.range(0, 6.28);
  const p3 = r.range(0, 6.28);
  return 4.2 * Math.sin(y * 0.083 + p1) + 2.8 * Math.sin(y * 0.29 + p2) + 1.6 * Math.sin(y * 0.97 + p3);
};

/** The wipe's leading edge x at height y (default the face's middle) at time t, or null before / after the stroke.
 *  A cloth (L6's figure) holds its edge here: the board erases exactly what this edge has passed. */
export function wipeEdgeX(face: Rect, w: Wipe, t: number, y?: number): number | null {
  const dur = w.dur ?? WIPE_DUR;
  if (t < w.at || t > w.at + dur) return null;
  return wipeEdgeAt(face, w, prog(t, w.at, dur, ease.inOutSine), y ?? (face.y0 + face.y1) / 2);
}

const WIPE_BULGE = 22;
function wipeEdgeAt(face: Rect, w: Wipe, u: number, y: number): number {
  const right = (w.dir ?? 'right') === 'right';
  const h2 = (face.y1 - face.y0) / 2;
  const cy = (face.y0 + face.y1) / 2;
  const bul = WIPE_BULGE * (1 - Math.min(1, ((y - cy) / h2) ** 2));
  const from = right ? face.x0 - 34 - WIPE_BULGE : face.x1 + 34 + WIPE_BULGE;
  const to = right ? face.x1 + 34 : face.x0 - 34;
  const e = from + (to - from) * u;
  return e + (right ? bul : -bul) + wipeNoise(y, w.seed ?? 'wipe');
}

/** The not-yet-wiped region (a polygon) at wipe progress u: everything beyond the ragged edge. */
function dirtyD(face: Rect, w: Wipe, u: number): string {
  const right = (w.dir ?? 'right') === 'right';
  const pts: Pt[] = [];
  for (let y = face.y0 - 20; y <= face.y1 + 20; y += 9) pts.push([wipeEdgeAt(face, w, u, y), y]);
  const far = right ? face.x1 + 80 : face.x0 - 80;
  pts.push([far, face.y1 + 20], [far, face.y0 - 20]);
  return polyD(pts);
}

/** One run of faded handwriting with no letters in it: slanted cursive humps (a looped trochoid per hump) whose
 *  height, loop and width vary like x-height strokes, ascender loops and the odd descender, broken into "words". */
function scribbleWords(x0: number, x1: number, yb: number, r: Rng, scale = 1): string {
  let d = '';
  let x = x0;
  while (x < x1 - 12 * scale) {
    const xe = Math.min(x1, x + r.range(30, 92) * scale);
    const slant = r.range(0.18, 0.34);
    const pts: Pt[] = [];
    let hx = x;
    while (hx < xe) {
      // one hump: x-height (most), an ascender loop, a descender loop, or a flat wave (n / u / m)
      const k = r.next();
      const a = r.range(1.05, 1.5) * scale;
      const up = k < 0.18 ? r.range(13, 18) : k < 0.27 ? -r.range(7, 10) : r.range(5.5, 9);
      const b = k < 0.27 ? r.range(1.8, 2.6) * scale : r.chance(0.5) ? r.range(1.4, 2.2) * scale : r.range(0.3, 0.9) * scale;
      const h = Math.abs(up) * scale;
      for (let i = 0; i <= 12; i++) {
        const th = (i / 12) * Math.PI * 2;
        const px = hx + a * th + b * Math.sin(th);
        const lift = (h * (1 - Math.cos(th))) / 2;
        const py = up > 0 ? yb - lift : yb + lift;
        if (i > 0 || pts.length === 0) pts.push([px + (yb - py) * slant, py + r.jitter(0.35)]);
      }
      hx += a * Math.PI * 2;
    }
    if (pts.length > 3) d += pts.map(([px, py], i) => `${i ? 'L' : 'M'}${P(px, py)}`).join('');
    x = hx + r.range(9, 17) * scale;
  }
  return d;
}

/** A soft-edged flat smear blob (closed): an elongated wavy loop. */
function smearD(cx: number, cy: number, rx: number, ry: number, rot: number, r: Rng): string {
  const n = 18;
  const pts: Pt[] = [];
  const c = Math.cos(rot);
  const s = Math.sin(rot);
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const f = 1 + r.jitter(0.1) + 0.06 * Math.sin(a * 3 + r.range(0, 6));
    const x = Math.cos(a) * rx * f;
    const y = Math.sin(a) * ry * f;
    pts.push([cx + x * c - y * s, cy + x * s + y * c]);
  }
  const mid = (p: Pt, q: Pt): Pt => [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
  let d = `M${P(...mid(pts[n - 1], pts[0]))}`;
  for (let i = 0; i < n; i++) {
    const m = mid(pts[i], pts[(i + 1) % n]);
    d += `Q${P(pts[i][0], pts[i][1])} ${P(m[0], m[1])}`;
  }
  return d + 'Z';
}

/** The half-wiped cafe menu inside `area`: a scribbled title, rows of faded handwriting (no letters) with dot leaders
 *  to a "price", partly smeared by earlier wipes (pale flat blobs over the writing). */
export function menuSmudges(area: Rect, seed: string): {scribbles: string; dots: string; smears: string; smearsDeep: string} {
  const r = rng(`menu/${seed}`);
  let scribbles = '';
  let dots = '';
  let smears = '';
  let smearsDeep = '';
  const w = area.x1 - area.x0;
  // the title: one larger scribbled word, centred, with a wavy underline
  const tw = r.range(150, 200);
  const tx = area.x0 + (w - tw) / 2;
  const ty = area.y0 + 34;
  scribbles += scribbleWords(tx, tx + tw, ty, r, 1.35);
  scribbles += `M${P(tx + 6, ty + 10)}Q${P(tx + tw * 0.3, ty + 15)} ${P(tx + tw * 0.55, ty + 9)}T${P(tx + tw - 4, ty + 11)}`;
  const rowGap = 42;
  const n = Math.max(1, Math.floor((area.y1 - area.y0 - 70) / rowGap));
  for (let i = 0; i < n; i++) {
    const yb = area.y0 + 92 + i * rowGap + r.jitter(2.5);
    if (yb > area.y1 - 6) break;
    const dishEnd = area.x0 + r.range(0.38, 0.66) * w;
    scribbles += scribbleWords(area.x0 + r.range(6, 18), dishEnd, yb, r);
    if (r.chance(0.75)) {
      const px0 = area.x1 - r.range(46, 64);
      scribbles += scribbleWords(px0, area.x1 - r.range(6, 12), yb, r);
      if (r.chance(0.6)) for (let x = dishEnd + 14; x < px0 - 12; x += 10) dots += circD(x, yb - 1, 1.5);
    }
    // an earlier wipe smeared part of this row (pale flat blobs over the writing)
    if (r.chance(0.45)) smears += smearD(area.x0 + r.range(0.2, 0.8) * w, yb - 5, r.range(40, 96), r.range(8, 13), r.jitter(0.07), r);
  }
  // two broad arcs of an earlier, lazier wipe across several rows
  for (let k = 0; k < 2; k++) {
    const cx = area.x0 + (k === 0 ? r.range(0.22, 0.42) : r.range(0.58, 0.78)) * w;
    const cy = area.y0 + (k === 0 ? r.range(0.35, 0.55) : r.range(0.6, 0.8)) * (area.y1 - area.y0);
    smearsDeep += smearD(cx, cy, r.range(80, 120), r.range(15, 22), r.range(-0.25, 0.25), r);
  }
  return {scribbles, dots, smears, smearsDeep};
}

// ---------------------------------------------------------------- lines and rules

export type BoardLine = {
  /** One line, or a block of lines (`lead` apart) that pops as one or is pen-written line after line. */
  text: string | readonly string[];
  size: number;
  /** Baseline of the (first) line. */
  y: number;
  /** Anchor x. Default: the text column's left (start), the face centre (middle) or the column's right (end). */
  x?: number;
  anchor?: 'start' | 'middle' | 'end';
  /** Block line advance (px). Default size x TYPE.lead. */
  lead?: number;
  /** Build time (scene s). Omit = already there. */
  at?: number;
  /** 'pen' (default when `at` is set: written left -> right, the face is already there), 'pop', 'none' (snap). */
  mode?: TextMode;
  /** Pen duration (s) for the whole line or block. */
  dur?: number;
  /** Faux weight (px). Default weightFor(size): KEY_WEIGHT for key lines, CREDIT_WEIGHT for credits, 0 for body. */
  weight?: number;
  letterSpacing?: number;
  color?: string;
  /** Pops off at this time. */
  off?: number;
  maxW?: number;
  seed?: string;
};

export type BoardRule = {
  x0: number;
  x1: number;
  y: number;
  /** Drawn on with the pen from this time (scene s). Omit = already there. */
  at?: number;
  dur?: number;
  /** Thickness (px). Default 2.6. */
  width?: number;
  color?: string;
  seed?: string;
};

const blockLines = (l: BoardLine): readonly string[] => (typeof l.text === 'string' ? [l.text] : l.text);

/** Where a BoardLine's lines start (x0) and how wide they are (measured in the caption hand). */
export function lineExtent(l: BoardLine, g: BoardGeom): {x0: number; w: number; y: number; size: number; text: string}[] {
  const anchor = l.anchor ?? 'start';
  const x = l.x ?? (anchor === 'middle' ? g.centre.x : anchor === 'end' ? g.column.x1 : g.column.x0);
  const lead = l.lead ?? Math.round(l.size * TYPE.lead);
  return blockLines(l).map((s, i) => {
    const w = textW(s, l.size, l.letterSpacing ?? 0);
    return {text: s, size: l.size, y: l.y + i * lead, w, x0: anchor === 'start' ? x : anchor === 'middle' ? x - w / 2 : x - w};
  });
}

const BoardText: React.FC<{l: BoardLine; g: BoardGeom; seed: string}> = ({l, g, seed}) => {
  useCaptionFont();
  const t = useTime();
  const lines = blockLines(l);
  const anchor = l.anchor ?? 'start';
  const x = l.x ?? (anchor === 'middle' ? g.centre.x : anchor === 'end' ? g.column.x1 : g.column.x0);
  const lead = l.lead ?? Math.round(l.size * TYPE.lead);
  const weight = l.weight ?? weightFor(l.size);
  const mode: TextMode = l.mode ?? (l.at === undefined ? 'none' : 'pen');
  const common = {size: l.size, anchor, weight, letterSpacing: l.letterSpacing, color: l.color ?? BOARD_COLORS.lettering, off: l.off, maxW: l.maxW};
  if (lines.length === 1) return <WorldText x={x} y={l.y} text={lines[0]} at={l.at} mode={mode} dur={l.dur} seed={seed} {...common} />;
  if (mode === 'pen' && l.at !== undefined) {
    // one hand writes the block line after line: the duration is shared out by width
    const ws = lines.map((s) => textW(s, l.size, l.letterSpacing ?? 0));
    const tot = ws.reduce((s, w) => s + w, 0) || 1;
    const dur = l.dur ?? penDur(tot);
    let acc = 0;
    return (
      <>
        {lines.map((s, i) => {
          const a = l.at! + (dur * acc) / tot;
          acc += ws[i];
          return <WorldText key={i} x={x} y={l.y + i * lead} text={s} at={a} mode="pen" dur={(dur * ws[i]) / tot} seed={`${seed}/${i}`} {...common} />;
        })}
      </>
    );
  }
  if (l.at !== undefined && t < l.at) return null;
  // a block pops as ONE (about the block's centre), or snaps on
  let s = 1;
  if (mode === 'pop' && l.at !== undefined) s = 0.55 + 0.45 * springAt(t, l.at, springs.pop);
  const ext = lineExtent(l, g);
  const bx0 = Math.min(...ext.map((e) => e.x0));
  const bx1 = Math.max(...ext.map((e) => e.x0 + e.w));
  const cx = (bx0 + bx1) / 2;
  const cy = l.y + ((lines.length - 1) * lead) / 2 - l.size * 0.33;
  const body = lines.map((s2, i) => <WorldText key={i} x={x} y={l.y + i * lead} text={s2} seed={`${seed}/${i}`} {...common} />);
  if (s === 1) return <>{body}</>;
  return <XG m={mat.about(mat.scale(s), cx, cy)}>{body}</XG>;
};

const BoardRuleInk: React.FC<{r: BoardRule; seed: string}> = ({r, seed}) => {
  const d = useMemo(() => skLine(r.x0, r.y, r.x1, r.y, {over: 'none', breaks: false, jitter: 0.35, drift: 0.12, bow: 0.5, seed}), [r.x0, r.x1, r.y, seed]);
  return <Ink d={d} width={r.width ?? 2.6} color={r.color ?? BOARD_COLORS.rule} at={r.at} dur={r.dur} vary={0.03} seed={seed} graphic />;
};

// ---------------------------------------------------------------- the board

export type StatementBoardProps = {
  /** The enamel face (the contract rect: B, S6's face, S2.aBoard ...). */
  face: Rect;
  /** Stile width (each side) and rail height (top and bottom), px. Defaults 40 / 20 (the 480 x 520 faces). */
  stile?: number;
  rail?: number;
  /** The ground line: the legs' feet. Default B_LEGS_Y1 (1250). */
  legsTo?: number;
  /** The ground shadow's colour (default BOARD_COLORS.shadow), or false = none (a scene can draw <BoardShadow> in
   *  another layer). */
  shadow?: string | false;
  /** The board lands at this time (a short drop onto its feet, then the clack). Omit = already there. */
  at?: number;
  /** A small wooden jolt (a ~3 px drop + spring back in 0.15 s) at each of these times: when it lands, or when its
   *  header pops. */
  clackAt?: number | readonly number[];
  lines?: readonly BoardLine[];
  rules?: readonly BoardRule[];
  /** A half-wiped cafe menu on the face (pale flat smudges + scribbled strokes, no words): true = the face below
   *  `smudgeTop`, or an explicit area. */
  smudges?: boolean | Rect;
  /** Where the smudged area starts (y) when `smudges` is true. Default face.y0 + 108 (under a header). */
  smudgeTop?: number;
  /** The ONE cloth stroke that erases the smudges (they are gone after it). */
  wipe?: Wipe;
  /** The blank face one value step down (C.faceDim, scaled by k <= 1). With `wipe` and no `until`: the face is dull
   *  until the stroke, which wipes it clean (the dull film goes with the smudges, behind the ragged edge). With `until`:
   *  the face eases back to full over `dur` s (in-out sine) from `until` (a board whose words come on, no cloth). */
  dim?: {k?: number; until?: number; dur?: number};
  /** Frame options (keyline inset, the back frame's wedge, the handle slot, the text margin). */
  frame?: BoardFrameOpts;
  /** Contour ink weight (outer edges); inner edges get INK_PX.far. Default INK_PX.mid. */
  inkWidth?: number;
  /** Seed of the lettering, rules and menu. */
  seed?: string;
  /** Seed of the frame's hand-drawn contour (shared by default: every board is the SAME face, A5). */
  frameSeed?: string;
  /** Extra face content (drawn over the face and under the lettering; moves with the jolt). */
  children?: React.ReactNode;
  /** A colour override (keys of BOARD_COLORS; a stable object, e.g. BBC_CALM). Default: BOARD_COLORS. */
  colors?: Partial<BoardColors>;
};

/** The ground shadow of a board (flat, cast right and a little toward us; colour, never grey). */
const BoardShadowBody: React.FC<{g: BoardGeom; color?: string; seed?: string}> = ({g, color = BOARD_COLORS.shadow, seed = 'board'}) => {
  const H = g.legsTo - g.top;
  const dx = H * 0.26;
  const dy = Math.max(8, H * 0.04);
  const x0 = g.outer.x0 + 6;
  const x1 = g.outer.x1 + (g.side ? 6 : 0);
  const y = g.legsTo;
  const d = polyD([
    [x0, y - 1],
    [x1, y - 1],
    [x1 + dx, y + dy],
    [x0 + dx * 0.72, y + dy],
  ]);
  return <Fill d={d} color={color} offset={false} seed={`${seed}/shadow`} />;
};
export const BoardShadow = tiered('support', {}, BoardShadowBody);

const StatementBoardBody: React.FC<StatementBoardProps> = ({
  face,
  stile = 40,
  rail = 20,
  legsTo = B_LEGS_Y1,
  shadow,
  at,
  clackAt,
  lines = [],
  rules = [],
  smudges,
  smudgeTop,
  wipe,
  dim,
  frame,
  inkWidth = INK_PX.mid,
  seed = 'board',
  frameSeed = FRAME_SEED,
  children,
  colors,
}) => {
  const t = useTime();
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const g = useMemo(() => boardFrame(face, stile, rail, legsTo, frame), [face.x0, face.y0, face.x1, face.y1, stile, rail, legsTo, frame?.keyInset, frame?.side, frame?.handle, frame?.margin]);
  const C = useMemo(() => (colors ? {...BOARD_COLORS, ...colors} : BOARD_COLORS), [colors]);
  // ---- static paths (frame, face, keyline, contour ink)
  const P2 = useMemo(() => {
    const {outer: O, face: F, railB} = g;
    // the front frame as ONE silhouette (stiles to the ground + rails), the handle slot cut out of the top rail
    const frameD =
      polyD([
        [O.x0, O.y0],
        [O.x1, O.y0],
        [O.x1, O.y1],
        [F.x1, O.y1],
        [F.x1, railB.y1],
        [F.x0, railB.y1],
        [F.x0, O.y1],
        [O.x0, O.y1],
      ]) + (g.handle ? roundD(g.handle, (g.handle.y1 - g.handle.y0) / 2) : '');
    const litW = Math.max(3, Math.round(stile * 0.15));
    const litD =
      rectD({x0: O.x0, y0: O.y0, x1: O.x0 + litW, y1: O.y1}) +
      rectD({x0: F.x1, y0: O.y0, x1: F.x1 + litW * 0.8, y1: O.y1}) +
      rectD({x0: O.x0, y0: O.y0, x1: O.x1, y1: O.y0 + Math.max(2.5, rail * 0.16)});
    const fr = Math.max(4, Math.min(8, (F.x1 - F.x0) * 0.016));
    const plate = roundD(F, fr);
    const plateEdge = roundD({x0: F.x0 + 2.5, y0: F.y0 + 3, x1: F.x1 + 2.5, y1: F.y1 + 3}, fr);
    // the keyline: ONE closed border (its corners no longer notched round the screws: the clean premium line)
    const keyD = roundD(g.keyline, 2.5);
    const sr = Math.max(2.6, g.keyInset * 0.36);
    const screwD = g.screws.map((s) => circD(s.x, s.y, sr)).join('');
    // contour ink: the outer silhouette only (left edge, top edge, the right stile's edge), one pen stroke per edge
    // with a small overshoot; the A's back edge thinner (it recedes). Open: Ink leaves a seeded gap in each stroke.
    const o = {over: 'small' as const, jitter: 0.5, drift: 0.25, breaks: false};
    const outerInk =
      skLine(O.x0, O.y0 + 3, O.x0, O.y1, {...o, over: [6, 0], seed: `${frameSeed}/cL`}) +
      skLine(O.x0, O.y0, O.x1, O.y0, {...o, over: [9, 5], seed: `${frameSeed}/cT`}) +
      skLine(O.x1, O.y0 + 3, O.x1, O.y1, {...o, over: [4, 0], seed: `${frameSeed}/cR`});
    const backInk = g.side ? skLine(g.side[1][0], g.side[1][1] + 4, g.side[2][0], g.side[2][1], {...o, over: [0, 0], seed: `${frameSeed}/cS`}) : '';
    const innerInk =
      skLine(F.x0 + 1, railB.y1, F.x1 - 1, railB.y1, {over: [0, 0], jitter: 0.4, drift: 0.15, breaks: false, seed: `${frameSeed}/cB`}) +
      (O.y1 - railB.y1 > 6
        ? skLine(F.x0, railB.y1 + 2, F.x0, O.y1, {over: [0, 0], breaks: false, seed: `${frameSeed}/cl`}) + skLine(F.x1, railB.y1 + 2, F.x1, O.y1, {over: [0, 0], breaks: false, seed: `${frameSeed}/cr`})
        : '');
    return {frameD, litD, plate, plateEdge, keyD, screwD, outerInk, backInk, innerInk, sr};
  }, [g, stile, rail, frameSeed]);
  const smudge = useMemo(() => {
    if (!smudges) return null;
    const k = g.keyline;
    const area: Rect = smudges === true ? {x0: k.x0 + 6, y0: smudgeTop ?? face.y0 + 108, x1: k.x1 - 6, y1: k.y1 - 6} : smudges;
    return menuSmudges(area, seed);
  }, [smudges, smudgeTop, g, seed]);

  if (at !== undefined && t < at) return null;
  const dy = boardDy(t, at, clackAt);
  const landed = at === undefined || t >= at + LAND.dur;
  const frameOff: [number, number] = [2.4, 1.6];
  // the wipe: smudges beyond the ragged edge only; gone once the stroke is done
  let menu: React.ReactNode = null;
  if (smudge) {
    const wdur = wipe ? wipe.dur ?? WIPE_DUR : 0;
    const u = wipe ? prog(t, wipe.at, wdur, ease.inOutSine) : 0;
    if (!wipe || t < wipe.at + wdur) {
      // flat smears only (the scribbles and dot leaders read as a stray grey squiggle: REVIEW_1 SHOULD 2)
      const body = (
        <>
          <Fill d={smudge.smearsDeep} color={C.smearDeep} offset={false} seed={`${seed}/smD`} />
          <Fill d={smudge.smears} color={C.smear} offset={false} seed={`${seed}/sm`} />
        </>
      );
      // clipped to the enamel inside the keyline, and (during the stroke) to the not-yet-wiped side of the edge
      const k = g.keyline;
      menu = (
        <>
          <defs>
            <clipPath id={`menu${uid}`}>
              <rect x={k.x0 + 3} y={k.y0 + 3} width={k.x1 - k.x0 - 6} height={k.y1 - k.y0 - 6} />
            </clipPath>
            {wipe && t >= wipe.at ? (
              <clipPath id={`wipe${uid}`}>
                <path d={dirtyD(face, wipe, u)} />
              </clipPath>
            ) : null}
          </defs>
          <g clipPath={`url(#menu${uid})`}>{wipe && t >= wipe.at ? <g clipPath={`url(#wipe${uid})`}>{body}</g> : body}</g>
        </>
      );
    }
  }
  // the dull face: with a wipe (and no `until`) a film the stroke wipes away with the smudges; else a timed ease back
  let dull: React.ReactNode = null;
  if (dim) {
    const k = Math.min(1, dim.k ?? 1);
    if (wipe && dim.until === undefined) {
      const wdur = wipe.dur ?? WIPE_DUR;
      if (t < wipe.at + wdur) {
        const film = <Fill d={P2.plate} color={mixHex(C.face, C.faceDim, k)} offset={false} seed={`${frameSeed}/dull`} />;
        dull =
          t >= wipe.at ? (
            <>
              <defs>
                <clipPath id={`dull${uid}`}>
                  <path d={dirtyD(face, wipe, prog(t, wipe.at, wdur, ease.inOutSine))} />
                </clipPath>
              </defs>
              <g clipPath={`url(#dull${uid})`}>{film}</g>
            </>
          ) : (
            film
          );
      }
    } else {
      const u = dim.until === undefined ? 0 : prog(t, dim.until, dim.dur ?? 0.3, ease.inOutSine);
      const kk = k * (1 - u);
      if (kk > 0.004) dull = <Fill d={P2.plate} color={mixHex(C.face, C.faceDim, kk)} offset={false} seed={`${frameSeed}/dull`} />;
    }
  }
  return (
    <>
      {shadow !== false && landed ? <BoardShadow g={g} color={shadow || BOARD_COLORS.shadow} seed={frameSeed} /> : null}
      <XG m={mat.translate(0, dy)}>
        {/* the A's back frame on the shade side: the wedge past the right stile, the back leg under the rail */}
        {g.side ? <Fill d={polyD(g.side)} color={C.frameShade} offset={frameOff} seed={`${frameSeed}/side`} /> : null}
        {g.backLeg ? <Fill d={polyD(g.backLeg)} color={C.frameShade} offset={frameOff} seed={`${frameSeed}/back`} /> : null}
        {/* the plum frame (one silhouette, the handle slot open), its lit strips on the sun side */}
        <Fill d={P2.frameD} color={C.frame} rule="evenodd" offset={frameOff} seed={`${frameSeed}/frame`} />
        <Fill d={P2.litD} color={C.frameLit} offset={frameOff} seed={`${frameSeed}/lit`} />
        {/* the enamel plate: its thickness in shade, the face, the keyline, four brass screws */}
        <Fill d={P2.plateEdge} color={C.faceEdge} offset={false} seed={`${frameSeed}/edge`} />
        <Fill d={P2.plate} color={C.face} offset={false} seed={`${frameSeed}/face`} />
        {dull}
        <Ink d={P2.keyD} width={Math.max(1.6, Math.min(2.2, g.keyInset * 0.2))} color={C.keyline} taper={false} vary={0} seed={`${frameSeed}/key`} graphic />
        <Fill d={P2.screwD} color={C.screw} offset={false} seed={`${frameSeed}/screw`} />
        {menu}
        {children}
        {rules.map((r, i) => (
          <BoardRuleInk key={`r${i}`} r={r} seed={r.seed ?? `${seed}/rule${i}`} />
        ))}
        {lines.map((l, i) => (
          <BoardText key={`l${i}`} l={l} g={g} seed={l.seed ?? `${seed}/l${i}`} />
        ))}
        {/* loose ink on the frame's outer contour only (never on the face, never round the letters) */}
        <Ink d={P2.outerInk} width={inkWidth} color={C.contour} open={0.12} seed={`${frameSeed}/ink`} />
        {P2.backInk ? <Ink d={P2.backInk} width={INK_PX.far} color={C.contour} open={0.2} seed={`${frameSeed}/inkBack`} /> : null}
        <Ink d={P2.innerInk} width={INK_PX.far} color={C.contour} open={0.1} seed={`${frameSeed}/inkIn`} />
      </XG>
    </>
  );
};
export const StatementBoard = tiered('support', {tone: (p: StatementBoardProps) => p.colors?.frame ?? BOARD_COLORS.frame}, StatementBoardBody);

// ---------------------------------------------------------------- presets: layouts (baselines = dy from the face top)

// FEW AND BIG (REVIEW_1 MUST 3 + 4, 2026-10-28): every drawn line >= 44 px, no source, clause or small row on a face
// (the post carries them: docs/v2/POSTING_KIT.md), and the big faces 100 px shorter (480 x 420: their tops at y 800, so
// SUN2 floats > 1 diameter clear of the frame's top rail at 780).

/** S6 deal board layout (480 x 420 face): px below the face's top edge. The tag (44), the purpose line (56, two rows),
 *  the divider and the F12 line (44, two rows) on "veto". */
export const DEAL_LAYOUT = {tag: 62, purpose: 150, purposeLead: 60, rule: 262, f12: 322, f12Lead: 52} as const;
/** S7 Google's board layout (480 x 420 face): the header, then Google's words as heard (44 / 56 / 44 / 56). */
export const GOOGLE_LAYOUT = {header: 70, rule: 92, follows: 158, principles: 222, bans: 300, anyKind: 364} as const;
/** S8 her board layout (480 x 420 face): her quote at 60 px (the column's width: the payoff), centred under the rule. */
export const HER_LAYOUT = {header: 70, rule: 92, quote: 222, quoteLead: 72} as const;
/** The size of her quote: the widest row at the text column's width (436 px). */
export const HER_QUOTE_SIZE = 60;
/** S2 newsstand board layout (400 x 200 face): the BBC's quote alone, two rows at 56, centred on the face. */
export const BBC_LAYOUT = {quote: 88, quoteLead: 62} as const;

/** Scene-local default times (s from each shot's start; TREATMENT section 5 + the heard word times). */
export const DEAL_T = {clack: 0, purpose: 0.03, f12: 2.4} as const;
export const GOOGLE_T = {header: 0.3, credit: 0.3, follows: [1.59, 1.72], principles: [1.72, 1.98], small: 2.24, bans: [2.68, 3.22], anyKind: [3.27, 4.02]} as const;
export const HER_T = {wipe: 2.79, wipeDur: WIPE_DUR, quote1: [3.61, 4.17], quote2: [4.27, 4.77], credit: 3.61} as const;

type Span = readonly [number, number];
const sp = (s: Span, t0: number): [number, number] => [s[0] + t0, s[1] + t0];
const penOf = (s: Span) => ({at: s[0], dur: Math.max(0.05, s[1] - s[0])});
/** A short centred rule under a header (`w` wide). */
const headerRule = (g: BoardGeom, y: number, w: number, at?: number): BoardRule => ({x0: g.centre.x - w / 2, x1: g.centre.x + w / 2, y, at, dur: 0.16});
/** The x where a left-aligned block of these widths sits centred on the face (clamped to the text column). */
const blockX = (g: BoardGeom, widest: number) => Math.max(g.column.x0, g.centre.x - widest / 2);

type PresetBase = {
  /** The face rect (default: the shot's contract face). */
  face?: Rect;
  legsTo?: number;
  shadow?: string | false;
  /** The shot's start on the caller's clock: every DEFAULT time is t0 + its scene-local default (explicit times are
   *  taken as given). Default 0 (scene-local). */
  t0?: number;
  clackAt?: number | readonly number[];
  /** The board lands at this time (omit = already there). */
  at?: number;
  seed?: string;
  children?: React.ReactNode;
};

// ---- 1. the deal board (S6)

export type DealBoardProps = PresetBase & {
  /** The purpose line pops ON "any" (24.03 = scene 0.03). */
  purposeAt?: number;
  /** The F12 line pops on "veto" (26.40 = scene 2.40). */
  f12At?: number;
};

/** The deal's lines and rule for a face (pure: the integrator's sheet and QA read it too). */
export function dealContent(g: BoardGeom, purposeAt?: number, f12At?: number): {lines: BoardLine[]; rules: BoardRule[]} {
  const L = DEAL_LAYOUT;
  const y0 = g.face.y0;
  const x = g.column.x0;
  const tagLS = 1.5;
  const tagSize = 44;
  // the tag is a ruled caps line: the caps, then a hairline to the column's right edge at the caps' middle
  const tagEnd = x + textW(TXT_DEAL.tag, tagSize, tagLS);
  const capMid = y0 + L.tag - tagSize * 0.661 * 0.5;
  return {
    lines: [
      {text: TXT_DEAL.tag, size: tagSize, x, y: y0 + L.tag, letterSpacing: tagLS},
      {text: TXT_DEAL.purpose, size: TYPE.key, x, y: y0 + L.purpose, lead: L.purposeLead, at: purposeAt, mode: 'pop'},
      {text: TXT_DEAL.f12Rows, size: 44, x, y: y0 + L.f12, lead: L.f12Lead, at: f12At, mode: 'pop'},
    ],
    rules: [
      {x0: tagEnd + 14, x1: g.column.x1, y: capMid, width: 2.2},
      // the divider over the F12 line draws on with it (never an empty slot at the cut)
      {x0: x, x1: g.column.x1, y: y0 + L.rule, width: 2.2, at: f12At === undefined ? undefined : f12At - 0.04, dur: 0.14},
    ],
  };
}

/** S6's deal board (the record): at the cut the frame and the tag are up; the purpose line pops ON "any"; the F12 line
 *  pops on "veto"; the board clacks on the cut. No party named, no "Google" (V2). */
const DealBoardBody: React.FC<DealBoardProps> = ({face = S6_FACE, legsTo = S6_LEGS_Y1, t0 = 0, purposeAt, f12At, clackAt, seed = 'deal', ...rest}) => {
  useCaptionFont();
  const g = useMemo(() => boardFrame(face, 40, 20, legsTo), [face.x0, face.y0, face.x1, face.y1, legsTo]);
  const c = dealContent(g, purposeAt ?? t0 + DEAL_T.purpose, f12At ?? t0 + DEAL_T.f12);
  return <StatementBoard face={face} legsTo={legsTo} clackAt={clackAt ?? t0 + DEAL_T.clack} lines={c.lines} rules={c.rules} seed={seed} {...rest} />;
};
export const DealBoard = tiered('support', {}, DealBoardBody);

// ---- 2. Google's board (S7)

export type GoogleBoardProps = PresetBase & {
  /** GOOGLE SAYS pops with the clack (28.36 = scene 0.30). */
  headerAt?: number;
  /** The credit comes up with the header. */
  creditAt?: number;
  /** Pen spans [start, end]: follows its 1.59-1.72, "AI principles" 1.72-1.98 (complete on "principles" 30.04). */
  follows?: Span;
  principles?: Span;
  /** The small row pops (30.30 = 2.24). */
  smallAt?: number;
  /** bans retaliation 2.68-3.22, "of any kind" 3.27-4.02 (complete on 32.08). */
  bans?: Span;
  anyKind?: Span;
};

export function googleContent(g: BoardGeom, T: {header?: number; credit?: number; follows?: Span; principles?: Span; small?: number; bans?: Span; anyKind?: Span}): {lines: BoardLine[]; rules: BoardRule[]} {
  // `credit` and `small` are kept in the signature for old callers: neither is drawn (REVIEW_1 MUST 3)
  const L = GOOGLE_LAYOUT;
  const y0 = g.face.y0;
  const mid = 44;
  const widest = Math.max(...[TXT_GOOGLE.principles, TXT_GOOGLE.anyKind].map((s) => textW(s, TYPE.key)), ...[TXT_GOOGLE.follows, TXT_GOOGLE.bans].map((s) => textW(s, mid)));
  const x = blockX(g, widest);
  const pen = (s?: Span) => (s ? penOf(s) : {});
  return {
    lines: [
      {text: TXT_GOOGLE.header, size: TYPE.header, anchor: 'middle', y: y0 + L.header, at: T.header, mode: 'pop'},
      {text: TXT_GOOGLE.follows, size: mid, x, y: y0 + L.follows, ...pen(T.follows), mode: 'pen'},
      {text: TXT_GOOGLE.principles, size: TYPE.key, x, y: y0 + L.principles, ...pen(T.principles), mode: 'pen'},
      {text: TXT_GOOGLE.bans, size: mid, x, y: y0 + L.bans, ...pen(T.bans), mode: 'pen'},
      {text: TXT_GOOGLE.anyKind, size: TYPE.key, x, y: y0 + L.anyKind, ...pen(T.anyKind), mode: 'pen'},
    ],
    rules: [headerRule(g, y0 + L.rule, 112, T.header === undefined ? undefined : T.header + 0.05)],
  };
}

/** S7's GOOGLE SAYS board at B: the header pops with the clack, then Google's own words pen on, as heard. */
const GoogleBoardBody: React.FC<GoogleBoardProps> = ({face = B, legsTo = B_LEGS_Y1, t0 = 0, headerAt, creditAt, follows, principles, smallAt, bans, anyKind, clackAt, seed = 'google', ...rest}) => {
  useCaptionFont();
  const g = useMemo(() => boardFrame(face, 40, 20, legsTo), [face.x0, face.y0, face.x1, face.y1, legsTo]);
  const h = headerAt ?? t0 + GOOGLE_T.header;
  const c = googleContent(g, {
    header: h,
    credit: creditAt ?? h,
    follows: follows ?? sp(GOOGLE_T.follows, t0),
    principles: principles ?? sp(GOOGLE_T.principles, t0),
    small: smallAt ?? t0 + GOOGLE_T.small,
    bans: bans ?? sp(GOOGLE_T.bans, t0),
    anyKind: anyKind ?? sp(GOOGLE_T.anyKind, t0),
  });
  return <StatementBoard face={face} legsTo={legsTo} clackAt={clackAt ?? h} lines={c.lines} rules={c.rules} seed={seed} {...rest} />;
};
export const GoogleBoard = tiered('support', {}, GoogleBoardBody);

// ---- 3. her board (S8)

export type HerBoardProps = PresetBase & {
  /** SHE SAYS pops at this time (with the clack). Omit = already there (L6 may pop it at 0.23). */
  headerAt?: number;
  /** The ONE cloth stroke that wipes the menu clean (35.72 = scene 2.79), ~0.35 s. */
  wipeAt?: number;
  wipeDur?: number;
  wipeDir?: 'right' | 'left';
  /** The quote pen-draws on: "talking about facts 3.61-4.17, is not criticising" 4.27-4.77. */
  quote1?: Span;
  quote2?: Span;
  /** The credit comes up with the quote (3.61). */
  creditAt?: number;
  /** The credit on one line (TREATMENT's "Sofia Liguori to the BBC · Source: BBC News, 21 Oct 2026", 370.8 px) or
   *  as TXT_HER.credit's two lines. Default 1. */
  creditLines?: 1 | 2;
};

export function herContent(g: BoardGeom, T: {header?: number; quote1?: Span; quote2?: Span; credit?: number}, _creditLines: 1 | 2 = 1): {lines: BoardLine[]; rules: BoardRule[]} {
  // `credit` / `creditLines` are kept in the signature for old callers: the credit is not drawn (REVIEW_1 MUST 3)
  const L = HER_LAYOUT;
  const y0 = g.face.y0;
  const size = HER_QUOTE_SIZE;
  const widest = Math.max(...TXT_HER.quote.map((s) => textW(s, size)));
  const x = blockX(g, widest);
  const pen = (s?: Span) => (s ? penOf(s) : {});
  return {
    lines: [
      {text: TXT_HER.header, size: TYPE.header, anchor: 'middle', y: y0 + L.header, at: T.header, mode: 'pop'},
      {text: TXT_HER.quote[0], size, x, y: y0 + L.quote, ...pen(T.quote1), mode: 'pen'},
      {text: TXT_HER.quote[1], size, x, y: y0 + L.quote + L.quoteLead, ...pen(T.quote2), mode: 'pen'},
    ],
    rules: [headerRule(g, y0 + L.rule, 112, T.header === undefined ? undefined : T.header + 0.05)],
  };
}

/** S8's SHE SAYS board (the cafe boat's quote-of-the-day A-board; the same face as Google's): the header over a
 *  half-wiped menu; ONE cloth stroke wipes it clean; her quote pen-draws on, with its credit. The cafe owner and the
 *  cloth are L6's figure: hold the cloth on `wipeEdgeX(face, wipe, t)`. */
const HerBoardBody: React.FC<HerBoardProps> = ({
  face = B,
  legsTo = B_LEGS_Y1,
  t0 = 0,
  headerAt,
  wipeAt,
  wipeDur,
  wipeDir = 'right',
  quote1,
  quote2,
  creditAt,
  creditLines = 1,
  clackAt,
  seed = 'her',
  ...rest
}) => {
  useCaptionFont();
  const g = useMemo(() => boardFrame(face, 40, 20, legsTo), [face.x0, face.y0, face.x1, face.y1, legsTo]);
  const c = herContent(
    g,
    {header: headerAt, quote1: quote1 ?? sp(HER_T.quote1, t0), quote2: quote2 ?? sp(HER_T.quote2, t0), credit: creditAt ?? t0 + HER_T.credit},
    creditLines,
  );
  const wipe = herWipe({t0, wipeAt, wipeDur, wipeDir});
  return (
    <StatementBoard
      face={face}
      legsTo={legsTo}
      clackAt={clackAt ?? headerAt}
      lines={c.lines}
      rules={c.rules}
      smudges
      smudgeTop={face.y0 + HER_LAYOUT.rule + 14}
      wipe={wipe}
      seed={seed}
      {...rest}
    />
  );
};
export const HerBoard = tiered('support', {}, HerBoardBody);

/** HerBoard's wipe for the same props (the object HerBoard uses): a cloth follows `wipeEdgeX(face, herWipe({...}), t)`
 *  drawn in the board's own coordinates (inside the same transform as the board). */
export function herWipe(o: {t0?: number; wipeAt?: number; wipeDur?: number; wipeDir?: 'right' | 'left'} = {}): Wipe {
  return {at: o.wipeAt ?? (o.t0 ?? 0) + HER_T.wipe, dur: o.wipeDur ?? HER_T.wipeDur, dir: o.wipeDir ?? 'right', seed: HER_WIPE_SEED};
}

// ---- 4. the newsstand board (S2)

export type ToldTheBBCBoardProps = PresetBase & {
  /** Default BBC_CALM (S2's calm A-board); pass BOARD_COLORS for the full-contrast face. */
  colors?: Partial<BoardColors>;
  /** Frame sizes for the smaller board (defaults 26 / 16). */
  stile?: number;
  rail?: number;
};

/** "One current staffer stayed unnamed," split before "stayed" (the words exactly as texts.ts has them). */
export const bbcBody = (): string[] => {
  const s = TXT_TOLD_THE_BBC.body[0];
  const i = s.indexOf(' stayed');
  return i > 0 ? [s.slice(0, i), s.slice(i + 1), TXT_TOLD_THE_BBC.body[1]] : [...TXT_TOLD_THE_BBC.body];
};

export function bbcContent(g: BoardGeom): {lines: BoardLine[]; rules: BoardRule[]} {
  const L = BBC_LAYOUT;
  const y0 = g.face.y0;
  const widest = Math.max(...TXT_TOLD_THE_BBC.quote.map((s) => textW(s, TYPE.key)));
  const x = blockX(g, widest);
  return {
    // the BBC's quote alone (REVIEW_1 MUST 3: the caption says "told the BBC"; the body and the credit were fine print)
    lines: [{text: TXT_TOLD_THE_BBC.quote, size: TYPE.key, x, y: y0 + L.quote, lead: L.quoteLead}],
    rules: [],
  };
}

/** S2's newsstand A-board (face S2.aBoard 400 x 200; the same face and type, smaller frame) with the BBC's quote
 *  "for fear of retaliation"; already there: L2 slides it out with its own transform at 8.44. */
const ToldTheBBCBoardBody: React.FC<ToldTheBBCBoardProps> = ({face = S2.aBoard, legsTo = S2_LEGS_Y1, stile = 26, rail = 16, seed = 'bbc', colors = BBC_CALM, t0: _t0, ...rest}) => {
  useCaptionFont();
  const g = useMemo(() => boardFrame(face, stile, rail, legsTo, BBC_FRAME), [face.x0, face.y0, face.x1, face.y1, legsTo, stile, rail]);
  const c = bbcContent(g);
  return <StatementBoard face={face} legsTo={legsTo} stile={stile} rail={rail} frame={BBC_FRAME} lines={c.lines} rules={c.rules} seed={seed} colors={colors} {...rest} />;
};
export const ToldTheBBCBoard = tiered('support', {}, ToldTheBBCBoardBody);

// ---------------------------------------------------------------- the presets' geometry (for figures, Pip, a cloth)

/** S6's deal board at the cut (the scene moves it with its mid plane). */
export const DEAL_GEOM: BoardGeom = boardFrame(S6_FACE, 40, 20, S6_LEGS_Y1);
/** Google's board (S7) and hers (S8, after the truck) at B. */
export const B_GEOM: BoardGeom = boardFrame(B, 40, 20, B_LEGS_Y1);
/** The S2 newsstand board at S2.aBoard (before L2's slide transform). */
export const BBC_GEOM: BoardGeom = boardFrame(S2.aBoard, 26, 16, S2_LEGS_Y1, BBC_FRAME);
