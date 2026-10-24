// edges/shared.ts — what every edge variant shares: the frame, the caption block every colour contour must contain,
// the phone UI zones, the overlay stroke type and the artist's ruled strokes. Pure, deterministic.

import {line, Pt} from '../sketch';
import {skyCaption, stroke, world} from '../theme';
import type {Rng} from '../rng';

export const W = world.w;
export const H = world.h;

/** Screen rect the captions can occupy (hook pages are 1.06x): every colour clip must contain it, so a caption is
 *  always over the scene's own sky (white captions on a paper margin would vanish). */
export const CAPTION_SAFE: [number, number, number, number] = (() => {
  const half = (skyCaption.maxWidth * 1.06) / 2 + 20;
  return [Math.round(skyCaption.cx - half), skyCaption.clipTop - 22, Math.round(skyCaption.cx + half), skyCaption.clipBottom + 24];
})();

/** Phone platform UI (9:16 short-video apps), screen px: the status bar + header cover the top ~180 px, the
 *  description / sound / progress block the bottom ~400 px, the action rail (like, comment, share) sits at x > 950
 *  between y 900 and 1500. The messiest edge work can live under the top / bottom UI; paper under the rail would
 *  take the contrast away from its white icons. */
export const PHONE_UI = {top: 180, bottom: 400, rail: {x: 950, y0: 900, y1: 1500}} as const;

/** Lowest y a stroke near the left / right frame edge may reach: just above the caption block. */
export const STROKE_MAX_Y = CAPTION_SAFE[1] - 12;

export type EdgeStroke = {d: string; w: number; taper?: boolean};

/** A screen rect [x0, y0, x1, y1] (px). */
export type EdgeRect = [number, number, number, number];
/** The regions an edge may leave bare: the four corners, the visible left side (y 860-1460), the right side between
 *  the caption and the rail (y 630-860), the bottom middle. */
export type EdgeInkRegion = 'tl' | 'tr' | 'br' | 'bl' | 'left' | 'right' | 'bottom';
/** What an edge should know about the scene under it (screen px, for the whole shot; see edges/hints.ts):
 *  - `ink`: how much LINE ART each region holds, 0 (a flat sky) to 1 (a crowd, branches). 'paint' leaves a region
 *    bare only where there is drawing to show there; a flat region gets colour to the edge instead. Measured from a
 *    clean render (review/edges/loose/final/tools/scan_hints.py). Unknown regions are allowed, with ruled strokes.
 *  - `keep`: rects that must stay entirely in colour (a hero figure, the mascot and the ground under it, a lamp and
 *    its halo, a key prop): no colour edge ever cuts them. */
export type EdgeHints = {ink?: Partial<Record<EdgeInkRegion, number>>; keep?: EdgeRect[]};

/** A ruled stroke from a to b (no auto overshoot: the caller sets the ends), drifting a hair, never broken. */
export const ruled = (a: Pt, b: Pt, seed: string, drift = 0.25) => line(a[0], a[1], b[0], b[1], {seed, over: 'none', drift, bow: 1.2, jitter: 0.6, breaks: false});

/** The artist's ruled corner: one or two thin ruled lines along the cut edges near a corner, sitting 2-4 px OUT in the
 *  paper (misregistered from the colour like every fill in the style) and overshooting the corner into the margin.
 *  `h` = the horizontal (along the top cut) and `v` = the vertical (along the side cut); each is optional.
 *  sx = +1 for a left corner, -1 for a right one. Single strokes, no re-strokes. */
export function ruledCorner(
  r: Rng,
  key: string,
  c: Pt,
  sx: 1 | -1,
  o: {h?: {len: [number, number]; over: number}; v?: {len: [number, number]; over: number}},
): EdgeStroke[] {
  const out: EdgeStroke[] = [];
  const m = r.range(2.5, 4); // out into the paper
  if (o.h) {
    const y = c[1] - m;
    const x0 = c[0] + sx * r.range(o.h.len[0], o.h.len[1]);
    const x1 = c[0] - sx * o.h.over;
    out.push({d: ruled([x0, y + r.jitter(0.6)], [x1, y + r.jitter(0.6)], `${key}h`, 0.2), w: stroke.inkThin});
  }
  if (o.v) {
    const x = c[0] - sx * m;
    const y0 = c[1] + r.range(o.v.len[0], o.v.len[1]);
    const y1 = c[1] - o.v.over;
    out.push({d: ruled([x + r.jitter(0.6), y0], [x + r.jitter(0.6), y1], `${key}v`, 0.2), w: stroke.inkThin});
  }
  return out;
}
