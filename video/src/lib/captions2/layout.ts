// layout.ts: where every piece of a group sits, measured in the browser that draws it (after useHandFonts()).
// The measure is scripts/type/lib/type.js's (the type stills, the recipes as drawn): a canvas 2D context with
// letter-spacing; the advance includes it, the ink's right edge has the trailing spacing taken off. Placement:
//  - a seat group: each row's ink box laid at dx (row index x step); the group's ink box centred on the seat's x
//    (type.js TYPE.group);
//  - an anchored row: its ink start / centre / end at x (TYPE.text's anchor);
//  - inside a row: each piece at the previous one's advance plus a word space in the previous piece's face (as one
//    typed line), or `gap` px from the previous piece's ink (R6's 0.48 em, R9's 40 px); a number's comma tucked in.
// scripts/captions2/build_captions.py runs the same rules on Chromium-measured metrics for its checks (`est`).

import recipes from './recipes.json';
import {HAND_FAMILY} from './fonts';
import type {Group, GroupLayout, Metrics, Piece, PlacedPiece, Row} from './types';

let ctx: CanvasRenderingContext2D | null = null;
const cache = new Map<string, Metrics>();

/** Ink metrics of `t` in Gaegu `weight` at `size` px with `track` em letter-spacing. */
export function measure(t: string, size: number, weight: number, track: number): Metrics {
  const key = `${weight}|${size}|${track}|${t}`;
  const hit = cache.get(key);
  if (hit) return hit;
  if (!ctx && typeof document !== 'undefined') ctx = document.createElement('canvas').getContext('2d');
  let m: Metrics;
  if (ctx) {
    ctx.font = `${weight} ${size}px '${HAND_FAMILY}'`;
    (ctx as unknown as {letterSpacing: string}).letterSpacing = `${track * size}px`;
    const r = ctx.measureText(t);
    m = {adv: r.width, left: -r.actualBoundingBoxLeft, right: r.actualBoundingBoxRight - track * size, asc: r.actualBoundingBoxAscent, desc: r.actualBoundingBoxDescent};
  } else {
    // no DOM (never in a render): a rough estimate so callers never crash
    const w = t.length * size * 0.42;
    m = {adv: w, left: 0, right: w, asc: size * 0.58, desc: size * 0.2};
  }
  cache.set(key, m);
  return m;
}

/** Clears the metric cache (call after a font change; the render never needs it). */
export const clearMeasureCache = () => cache.clear();

type PieceShape = {parts: {t: string; dx: number}[]; m: Metrics};

/** A piece's own shape: one part, or a number split at its commas with the guide's tuck (ink to ink). */
export function pieceShape(p: Piece): PieceShape {
  const one = measure(p.t, p.size, p.weight, p.track);
  if (!p.tuck || p.t.indexOf(',') < 0) return {parts: [{t: p.t, dx: 0}], m: one};
  const toks = p.t.split(/(,)/).filter((s) => s.length > 0);
  const parts: {t: string; dx: number}[] = [];
  let ox = 0;
  let prevRight = 0;
  let asc = 0;
  let desc = 0;
  let left = 0;
  let right = 0;
  let adv = 0;
  toks.forEach((tok, i) => {
    const m = measure(tok, p.size, p.weight, p.track);
    if (i > 0) {
      // the comma 0.02 em after the figures' ink; the next figures 0.05 em after the comma's ink
      const g = (tok === ',' ? p.tuck![0] : p.tuck![1]) * p.size;
      ox = prevRight + g - m.left;
    } else left = m.left;
    parts.push({t: tok, dx: ox});
    prevRight = ox + m.right;
    right = prevRight;
    adv = ox + m.adv;
    asc = Math.max(asc, m.asc);
    desc = Math.max(desc, m.desc);
  });
  return {parts, m: {adv, left, right, asc, desc}};
}

type RowShape = {pieces: {shape: PieceShape; ox: number}[]; left: number; right: number; asc: number; desc: number};

/** A row laid out from origin 0: each piece's origin, and the row's ink extent. */
export function rowShape(row: Row): RowShape {
  const out: RowShape['pieces'] = [];
  let left = Infinity;
  let right = -Infinity;
  let asc = 0;
  let desc = 0;
  row.pieces.forEach((p, j) => {
    const shape = pieceShape(p);
    let ox = 0;
    if (j > 0) {
      const prev = out[j - 1];
      const pp = row.pieces[j - 1];
      if (p.gap !== undefined && p.gap !== null) ox = prev.ox + prev.shape.m.right + p.gap - shape.m.left;
      else ox = prev.ox + prev.shape.m.adv + measure(' ', pp.size, pp.weight, pp.track).adv;
    }
    out.push({shape, ox});
    left = Math.min(left, ox + shape.m.left);
    right = Math.max(right, ox + shape.m.right);
    asc = Math.max(asc, shape.m.asc);
    desc = Math.max(desc, shape.m.desc);
  });
  return {pieces: out, left, right, asc, desc};
}

const SEATS = recipes.seats as Record<string, number>;

/** Every piece of a group placed on the frame. */
export function layoutGroup(g: Pick<Group, 'rows' | 'seat' | 'step'>): GroupLayout {
  const shapes = g.rows.map(rowShape);
  // the shift that puts each row's origin on the frame
  const shift: number[] = [];
  if (g.seat) {
    const step = g.step ?? recipes.step.default;
    const offs = g.rows.map((r, i) => (r.dx !== undefined ? r.dx : i * step));
    const widths = shapes.map((s) => s.right - s.left);
    const left = Math.min(...offs);
    const right = Math.max(...offs.map((d, i) => d + widths[i]));
    const x0 = SEATS[g.seat] - (left + right) / 2;
    shapes.forEach((s, i) => shift.push(x0 + offs[i] - s.left));
  } else {
    g.rows.forEach((r, i) => {
      const s = shapes[i];
      const x = r.x ?? 0;
      const a = r.anchor ?? 'start';
      shift.push(a === 'start' ? x - s.left : a === 'end' ? x - s.right : x - (s.left + s.right) / 2);
    });
  }
  const pieces: PlacedPiece[] = [];
  g.rows.forEach((r, i) => {
    shapes[i].pieces.forEach(({shape, ox}, j) => {
      const o = shift[i] + ox;
      pieces.push({
        piece: r.pieces[j],
        row: i,
        index: j,
        parts: shape.parts.map((pt) => ({t: pt.t, x: o + pt.dx})),
        y: r.baseline,
        x0: o + shape.m.left,
        x1: o + shape.m.right,
        top: r.baseline - shape.m.asc,
        bottom: r.baseline + shape.m.desc,
      });
    });
  });
  const x0 = Math.min(...pieces.map((p) => p.x0));
  const x1 = Math.max(...pieces.map((p) => p.x1));
  const top = Math.min(...pieces.map((p) => p.top));
  const bottom = Math.max(...pieces.map((p) => p.bottom));
  return {pieces, x0, x1, top, bottom};
}
