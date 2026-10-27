// V2S3_tParts.tsx (lane L3, V2S3 FAR helpers): the drawing toolkit of her terrace. Pure functions that put flat
// shapes and loose ink into the canal kit's Batch (one Fill per colour per layer, one Ink per weight), so the whole
// terrace costs a few dozen SVG paths. Everything in WORLD px at the 12.98 match. Only CM tokens; no opacity.
//
// The house style (reference 1, v1): flat fills misregistered off loose architectural ink (overshoots, 20-40 % of
// contours open), thin lines as the cheapest fullness (glazing bars, railings, aerials, wires), shadows as colour
// (the low sun is WEST, screen left: projections cast a short shade to the EAST, screen right).
import {CM, INK_PX} from '../palette';
import {line, rect as rectInk, poly as polyInk, arc as arcInk, circle as circleInk} from '../../lib/sketch';
import {Batch, P, r1, rng, ovalPath, domePath, lobes, leafPath, lerp, Pt} from '../kit/canal/core';

export {Batch};
export type {Pt};

/** Ink weights used on the terrace (it is across the water: mid-far). */
export const TK = {struct: INK_PX.far, detail: INK_PX.hair, her: INK_PX.mid, fine: 1.2} as const;

// ---------------------------------------------------------------- small shapes

export const rectP = (x: number, y: number, w: number, h: number) => `M${P(x, y)}H${r1(x + w)}V${r1(y + h)}H${r1(x)}Z`;
export const quadP = (pts: Pt[]) => pts.map(([x, y], i) => `${i ? 'L' : 'M'}${P(x, y)}`).join('') + 'Z';
/** A round-headed (semicircular) arch opening: x, top of the arch y, width w, total height h. */
export const archP = (x: number, y: number, w: number, h: number) => {
  const r = w / 2;
  return `M${P(x, y + h)}L${P(x, y + r)}A${r1(r)} ${r1(r)} 0 0 1 ${P(x + w, y + r)}L${P(x + w, y + h)}Z`;
};
/** A segmental-arch band (rubbed brick head) over an opening x..x+w whose top edge is at y. */
export const segArchP = (x: number, y: number, w: number, rise: number, band: number) =>
  `M${P(x - band * 0.4, y + 2)}Q${P(x + w / 2, y - rise * 2)} ${P(x + w + band * 0.4, y + 2)}L${P(x + w + band * 0.9, y - band + 2)}Q${P(x + w / 2, y - rise * 2 - band * 1.2)} ${P(x - band * 0.9, y - band + 2)}Z`;

/** Brick ticks: a few bricks drawn in clusters (never a texture): stepped runs of 2-4 bricks near seeded spots,
 *  avoiding the given holes (openings). `cols` = the contrasting brick colours. */
export function brickTicks(b: Batch, x0: number, y0: number, x1: number, y1: number, cols: string[], seed: string, n: number, holes: [number, number, number, number][] = []) {
  const r = rng(seed);
  const bw = 15;
  const bh = 4.4;
  const inHole = (x: number, y: number) => holes.some(([hx0, hy0, hx1, hy1]) => x > hx0 - 8 && x < hx1 + 8 && y > hy0 - 8 && y < hy1 + 8);
  for (let i = 0; i < n; i++) {
    const cx = r.range(x0 + 6, x1 - 22);
    const cy = r.range(y0 + 6, y1 - 10);
    if (inHole(cx, cy) || inHole(cx + bw * 2, cy + bh * 3)) continue;
    const col = r.pick(cols);
    const k = r.int(2, 4);
    const dir = r.chance(0.5) ? 1 : -1;
    for (let j = 0; j < k; j++) {
      const bx = cx + (j % 2) * bw * 0.5 * dir + (j === 2 ? bw * dir : 0);
      const by = cy + j * (bh + 1.6);
      if (bx < x0 + 2 || bx + bw - 2 > x1) continue;
      b.rect(col, bx, by, bw - 2, bh);
    }
  }
}

// ---------------------------------------------------------------- windows

export type WinBars = '1/1' | '2/2' | '6/6' | 'french' | 'casement' | 'dormer';
export type Inner = 'curtains' | 'lamp' | 'shelf' | 'pendant' | 'frame' | 'plantSil' | 'none';
export type Unlit = 'sky' | 'blind' | 'nets' | 'plant' | 'curtainsShut';
export type Switch = {t: number; on: boolean};

export type WinSpec = {
  id: string;
  /** The glazed opening (world px). */
  x: number;
  y: number;
  w: number;
  h: number;
  bars: WinBars;
  surround: 'stone' | 'arch' | 'stucco' | 'plain' | 'hood';
  /** The wall colour around it (picks the arch / lintel contrast). */
  wall: string;
  /** Lit from the start (static), or switches (state before the first switch = !first.on). */
  lit: boolean | Switch[];
  inner?: Inner;
  unlit?: Unlit;
  /** A roller blind down from the top (fraction of h), lit or unlit. */
  blind?: number;
  curtain?: string;
  /** The lower sash raised by this many px (an open window: the opening shows the room deeper). */
  open?: number;
  sill?: boolean;
  /** A window box under the sill. */
  box?: boolean;
  frame?: string;
};

export const litNow = (s: WinSpec, t: number): boolean => {
  if (typeof s.lit === 'boolean') return s.lit;
  let on = !s.lit[0].on;
  for (const k of s.lit) if (t >= k.t) on = k.on;
  return on;
};
export const switches = (s: WinSpec) => typeof s.lit !== 'boolean';

/** Surround, sill, the reveal and its cast shade (static, behind the pane). */
export function winBack(b: Batch, s: WinSpec) {
  const {x, y, w, h} = s;
  const r = rng(`${s.id}/back`);
  const fr = s.frame ?? CM.paper;
  const fw = Math.max(3, w * 0.06);
  // the cast shade of the surround to the EAST (right) and under the sill: colour, never grey
  const shade = s.wall === CM.stucco || s.wall === CM.limestone || s.wall === CM.paper ? CM.stoneShade : CM.shadeWarm;
  b.poly(shade, [[x + w + fw, y - fw + 4], [x + w + fw + 7, y - fw + 9], [x + w + fw + 7, y + h + 9], [x + w + fw, y + h + 2]]);
  if (s.surround === 'stone' || s.surround === 'hood') {
    // a stone lintel with a keystone (or a hood on two small consoles)
    const lw = w + fw * 2 + 10;
    if (s.surround === 'stone') {
      b.rect(CM.limestone, x - fw - 5, y - fw - 12, lw, 12);
      b.poly(CM.limestone, [[x + w / 2 - 6, y - fw - 15], [x + w / 2 + 6, y - fw - 15], [x + w / 2 + 4, y - fw], [x + w / 2 - 4, y - fw]]);
      b.rect(shade, x - fw - 5, y - fw, lw, 3);
    } else {
      b.rect(CM.stucco, x - fw - 8, y - fw - 14, lw + 6, 8);
      b.rect(CM.stucco, x - fw - 6, y - fw - 6, 6, 9);
      b.rect(CM.stucco, x + w + fw, y - fw - 6, 6, 9);
      b.rect(shade, x - fw - 8, y - fw - 6, lw + 6, 2.5);
    }
  } else if (s.surround === 'arch') {
    const band = 11;
    const col = s.wall === CM.brickDeep ? CM.brick : s.wall === CM.brickLight ? CM.brick : CM.brickLight;
    b.fill(col, segArchP(x - fw, y - fw, w + fw * 2, 4, band));
  } else if (s.surround === 'stucco') {
    // a painted architrave all round
    b.rect(CM.stucco, x - fw - 6, y - fw - 6, w + fw * 2 + 12, h + fw + 6);
    b.rect(CM.stucco, x - fw - 10, y - fw - 16, w + fw * 2 + 20, 9);
    b.rect(CM.stoneShade, x - fw - 10, y - fw - 7, w + fw * 2 + 20, 2.5);
  }
  // the frame (the white-painted box the sashes sit in)
  b.rect(fr, x - fw, y - fw, w + fw * 2, h + fw);
  if (s.sill !== false) {
    b.rect(CM.limestone, x - fw - 6 + r.jitter(1), y + h, w + fw * 2 + 12, 6);
    b.rect(shade, x - fw - 4, y + h + 6, w + fw * 2 + 8, 3);
  }
}

const CURTAINS = [CM.box, CM.coatMustard, CM.blossom, CM.sage, CM.coatPlum, CM.leafRust, CM.coatOat];

/** The pane (lit or unlit) with its interior: draw per frame for switching windows, once for the rest. */
export function winPane(b: Batch, s: WinSpec, on: boolean) {
  const {x, y, w, h} = s;
  const r = rng(`${s.id}/pane`);
  const curtain = s.curtain ?? r.pick(CURTAINS);
  const open = s.open ?? 0;
  if (on) {
    b.rect(CM.lamp, x, y, w, h);
    // the lamp-lit back wall: a lighter field where the light falls
    const gx = r.range(0.15, 0.45);
    b.rect(CM.lampCore, x + w * gx, y + h * 0.12, w * r.range(0.35, 0.55), h * r.range(0.35, 0.6));
    const inner = s.inner ?? 'curtains';
    if (inner === 'curtains' || inner === 'lamp' || inner === 'frame') {
      // two side curtains, gathered at the bottom (darker against the lit room)
      const cw = w * r.range(0.16, 0.22);
      b.poly(curtain, [[x, y], [x + cw, y], [x + cw * 0.7, y + h * 0.55], [x + cw * 1.05, y + h], [x, y + h]]);
      b.poly(curtain, [[x + w, y], [x + w - cw, y], [x + w - cw * 0.7, y + h * 0.55], [x + w - cw * 1.05, y + h], [x + w, y + h]]);
      b.rect(CM.line, x - 2, y + 2, w + 4, 2.4);
    }
    if (inner === 'lamp') {
      // a table lamp: plum base, a shade in a warm colour, the brighter pool round it
      const lx = x + w * r.range(0.35, 0.65);
      const ly = y + h * 0.78;
      b.fill(CM.lampCore, ovalPath(lx, ly - h * 0.12, w * 0.24, h * 0.14));
      b.poly(r.pick([CM.box, CM.coatMustard, CM.paper]), [[lx - w * 0.12, ly - h * 0.06], [lx + w * 0.12, ly - h * 0.06], [lx + w * 0.08, ly - h * 0.17], [lx - w * 0.08, ly - h * 0.17]]);
      b.rect(CM.anchor, lx - 1.2, ly - h * 0.06, 2.4, h * 0.1);
      b.rect(CM.shadeWarm, x + w * 0.1, ly + h * 0.04, w * 0.8, h * 0.18);
    }
    if (inner === 'frame') {
      const fx = x + w * r.range(0.32, 0.5);
      const fy = y + h * r.range(0.15, 0.25);
      b.rect(CM.line, fx, fy, w * 0.24, h * 0.16);
      b.rect(r.pick([CM.sage, CM.box, CM.paper, CM.blossom]), fx + 2.5, fy + 2.5, w * 0.24 - 5, h * 0.16 - 5);
    }
    if (inner === 'shelf') {
      for (let k = 0; k < 2; k++) {
        const sy = y + h * (0.3 + k * 0.26);
        b.rect(CM.line, x + w * 0.08, sy, w * 0.84, 2.6);
        let bx = x + w * 0.1;
        while (bx < x + w * 0.88) {
          const bw = r.range(3, 6.5);
          const bh = r.range(h * 0.07, h * 0.12);
          b.rect(r.pick([CM.brick, CM.coatMustard, CM.sage, CM.paneUnlit, CM.box, CM.coatPlum, CM.paper]), bx, sy - bh, bw, bh);
          bx += bw + r.range(0.6, 2.2);
        }
      }
    }
    if (inner === 'pendant') {
      const px = x + w * r.range(0.35, 0.65);
      b.rect(CM.anchor, px - 0.8, y, 1.6, h * 0.22);
      b.fill(r.pick([CM.coatMustard, CM.box, CM.sage]), domePath(px, y + h * 0.3, w * 0.15, h * 0.09));
      b.fill(CM.lampCore, ovalPath(px, y + h * 0.33, w * 0.1, h * 0.03));
      b.rect(curtain, x, y, w * 0.14, h);
    }
    if (inner === 'plantSil') {
      b.fill(CM.shadeWarm, lobes(x + w * 0.12, x + w * 0.5, y + h, h * 0.34, `${s.id}/pl`, 3));
      b.rect(CM.leafRust, x + w * 0.2, y + h * 0.9, w * 0.22, h * 0.1);
      b.rect(curtain, x + w * 0.84, y, w * 0.16, h);
    }
    if (s.blind) b.rect(r.pick([CM.paper, CM.coatOat, CM.box]), x, y, w, h * s.blind);
  } else {
    b.rect(CM.paneUnlit, x, y, w, h);
    // the evening sky in the glass: a mint wedge and a thin warm sliver (the sunset band)
    const k = r.range(0.25, 0.5);
    b.poly(CM.glass, [[x, y], [x + w * k, y], [x, y + h * k * 1.2]]);
    b.poly(CM.glass, [[x + w, y + h * 0.48], [x + w, y + h * (0.48 + k * 0.5)], [x + w * (1 - k * 0.5), y + h * 0.48]]);
    b.rect(CM.bandSunset, x + w * 0.62, y + h * 0.05, w * 0.3, Math.max(2, h * 0.025));
    const u = s.unlit ?? 'sky';
    if (u === 'blind' || s.blind) b.rect(r.pick([CM.coatOat, CM.paper, CM.stoneShade]), x, y, w, h * (s.blind ?? r.range(0.3, 0.6)));
    if (u === 'nets') {
      // half-height lace nets with a scalloped hem (a London front room)
      const ny = y + h * 0.5;
      let d = `M${P(x, ny)}`;
      const n = Math.max(3, Math.round(w / 9));
      for (let i = 0; i < n; i++) d += `Q${P(x + (w * (i + 0.5)) / n, ny + 4)} ${P(x + (w * (i + 1)) / n, ny)}`;
      d += `L${P(x + w, y + h)}L${P(x, y + h)}Z`;
      b.fill(CM.paper, d);
    }
    if (u === 'plant') b.fill(CM.sage, lobes(x + w * 0.1, x + w * 0.55, y + h, h * 0.28, `${s.id}/upl`, 3));
    if (u === 'curtainsShut') {
      b.rect(curtain, x, y, w * 0.5, h);
      b.rect(curtain, x + w * 0.5, y, w * 0.5, h);
      b.rect(CM.shadeWarm, x + w * 0.49, y, 1.6, h);
    }
  }
  if (open > 0) {
    // the raised lower sash: its rail crosses the top half, the gap below shows the room deeper
    b.rect(CM.shadeWarm, x, y + h - open, w, 3);
  }
}

/** Sashes, glazing bars and the loose ink of the opening (static, over the pane). */
export function winFront(b: Batch, s: WinSpec, ink = TK.detail) {
  const {x, y, w, h} = s;
  const fr = s.frame ?? CM.paper;
  const st = Math.max(2.2, w * 0.045);
  const gb = Math.max(1.4, w * 0.022);
  const open = s.open ?? 0;
  const bars = s.bars;
  if (bars === 'french') {
    b.rect(fr, x + w / 2 - st / 2, y, st, h);
    b.rect(fr, x, y + h * 0.66, w, st * 0.8);
    for (const k of [0.25, 0.75]) b.rect(fr, x + w * k - gb / 2, y, gb, h * 0.66);
    b.rect(fr, x, y + h * 0.33, w, gb);
  } else if (bars === 'casement' || bars === 'dormer') {
    b.rect(fr, x + w / 2 - st / 2, y, st, h);
    if (bars === 'casement') b.rect(fr, x, y + h * 0.3, w, gb);
  } else {
    // a box sash: the meeting rail, and the lower sash raised by `open`
    const my = y + h * 0.5 - open;
    b.rect(fr, x, my - st / 2, w, st);
    if (open > 0) b.rect(fr, x, y + h - open - st * 0.4, w, st * 0.8);
    if (bars === '2/2') {
      b.rect(fr, x + w / 2 - gb / 2, y, gb, my - y);
      b.rect(fr, x + w / 2 - gb / 2, my, gb, y + h - my - open);
    }
    if (bars === '6/6') {
      for (const k of [1 / 3, 2 / 3]) {
        b.rect(fr, x + w * k - gb / 2, y, gb, my - y);
        b.rect(fr, x + w * k - gb / 2, my, gb, y + h - my - open);
      }
      b.rect(fr, x, y + (my - y) * 0.5 - gb / 2, w, gb);
      b.rect(fr, x, my + (y + h - open - my) * 0.5 - gb / 2, w, gb);
    }
  }
  if (ink > 0) {
    const fw = Math.max(3, w * 0.06);
    b.ink(rectInk(x - fw, y - fw, w + fw * 2, h + fw, {seed: `${s.id}/ink`, over: 'medium', open: 0.35}), ink);
    if (bars !== 'french' && bars !== 'dormer') b.ink(line(x + 1, y + h * 0.5 - open, x + w - 1, y + h * 0.5 - open, {seed: `${s.id}/mr`, over: 'none'}), TK.fine);
    if (s.sill !== false) b.ink(line(x - fw - 6, y + h, x + w + fw + 6, y + h, {seed: `${s.id}/sill`, over: 'small'}), TK.fine);
  }
  if (s.box) boxInto(b, x - 6, x + w + 6, y + h + 2, 13, `${s.id}/box`);
}

// ---------------------------------------------------------------- window boxes, pots, plants

const FLOWERS = [CM.box, CM.blossom, CM.paper, CM.coatMustard, CM.leafRust];

/** A window box (a painted trough) with mixed planting: leaves, flowers, a trailing ivy over the front. */
export function boxInto(b: Batch, x0: number, x1: number, top: number, hh: number, seed: string, o: {trough?: string; low?: [number, number]; flinch?: number} = {}) {
  const r = rng(seed);
  const w = x1 - x0;
  // planting behind the trough's lip
  const n = Math.max(2, Math.round(w / 26));
  for (let i = 0; i < n; i++) {
    const cx = x0 + (w * (i + 0.5)) / n + r.jitter(5);
    const low = o.low && cx > o.low[0] && cx < o.low[1];
    const ph = low ? r.range(6, 11) : r.range(12, 26);
    const fl = (o.flinch ?? 0) * (cx > (o.low?.[0] ?? 1e9) - 60 ? 1 : 0.35);
    const col = r.pick([CM.sage, CM.sage, CM.leafGold, CM.sage]);
    b.fill(col, lobes(cx - 16 + fl, cx + 16 + fl, top + 2, ph, `${seed}/l${i}`, 2));
    if (!low && r.chance(0.75)) {
      const fc = r.pick(FLOWERS);
      for (let k = 0; k < 3; k++) b.fill(fc, ovalPath(cx + r.jitter(11) + fl * 1.3, top + 2 - ph * r.range(0.55, 1.0), 2.8, 2.6));
    }
  }
  // the trough and its shade
  b.rect(o.trough ?? CM.line, x0, top, w, hh);
  b.rect(CM.shadeWarm, x0 + 2, top + hh, w - 4, 3);
  // trailing ivy over the lip
  for (let i = 0; i < Math.round(w / 34); i++) {
    const tx = r.range(x0 + 6, x1 - 6);
    const L = r.range(10, 26);
    for (let k = 0; k < 3; k++) b.fill(CM.sage, leafPath(tx + Math.sin(k) * 2, top + hh * 0.5 + (L * (k + 1)) / 3, 6, 2.6, 90 + r.jitter(30)));
  }
}

/** Terracotta pots with lobed greens and flowers on a ledge (balcony, steps). */
export function potsInto(b: Batch, xs: number[], y: number, s: number, seed: string) {
  const r = rng(seed);
  xs.forEach((x, i) => {
    const pw = s * r.range(0.8, 1.15);
    b.poly(r.pick([CM.leafRust, CM.brickDeep, CM.brick]), [[x - pw / 2, y - pw * 0.85], [x + pw / 2, y - pw * 0.85], [x + pw * 0.38, y], [x - pw * 0.38, y]]);
    b.rect(CM.brickDeep, x - pw * 0.55, y - pw * 0.9, pw * 1.1, pw * 0.14);
    const kind = r.int(0, 2);
    if (kind === 0) b.fill(CM.sage, lobes(x - pw * 0.8, x + pw * 0.8, y - pw * 0.85, pw * r.range(1.0, 1.6), `${seed}/p${i}`, 2));
    if (kind === 1) {
      // a clipped bay ball on a stem
      b.rect(CM.line, x - 1, y - pw * 1.9, 2, pw * 1.1);
      b.fill(CM.sage, ovalPath(x, y - pw * 2.1, pw * 0.62, pw * 0.58));
    }
    if (kind === 2) {
      b.fill(CM.sage, lobes(x - pw * 0.7, x + pw * 0.7, y - pw * 0.85, pw * 1.2, `${seed}/q${i}`, 2));
      for (let k = 0; k < 4; k++) b.fill(r.pick(FLOWERS), ovalPath(x + r.jitter(pw * 0.6), y - pw * r.range(1.3, 1.9), s * 0.14, s * 0.13));
    }
  });
}

// ---------------------------------------------------------------- doors

export type DoorSpec = {
  id: string;
  x: number;
  /** Top of the door leaf and its bottom (the top step). */
  y: number;
  w: number;
  h: number;
  color: string;
  fan: 'arch' | 'rect';
  fanLit: boolean;
  /** Stucco door case (pilasters + hood) or a plain brick reveal. */
  caseStucco?: boolean;
  steps?: number;
  /** Ground (towpath) y under the steps. */
  ground: number;
  knocker?: boolean;
};

export function doorInto(b: Batch, d: DoorSpec, ink = TK.struct) {
  const {x, y, w, h} = d;
  const r = rng(`${d.id}/door`);
  const fanH = d.fan === 'arch' ? w / 2 : w * 0.42;
  const top = y - fanH - 4;
  // the case
  if (d.caseStucco) {
    b.rect(CM.stucco, x - 13, top - 4, 11, h + fanH + 8);
    b.rect(CM.stucco, x + w + 2, top - 4, 11, h + fanH + 8);
    b.rect(CM.stucco, x - 18, top - 14, w + 36, 11);
    b.rect(CM.stoneShade, x - 18, top - 3, w + 36, 2.6);
    b.poly(CM.stoneShade, [[x + w + 13, top], [x + w + 20, top + 6], [x + w + 20, y + h], [x + w + 13, y + h]]);
  } else {
    b.poly(CM.shadeWarm, [[x + w + 3, top + 4], [x + w + 9, top + 9], [x + w + 9, y + h], [x + w + 3, y + h]]);
  }
  // the opening: frame, fanlight, the leaf with four panels
  b.rect(CM.paper, x - 3, top, w + 6, h + fanH + 4);
  if (d.fan === 'arch') b.fill(d.fanLit ? CM.lampCore : CM.paneUnlit, domePath(x + w / 2, y - 2, w / 2 - 2, fanH - 3));
  else b.rect(d.fanLit ? CM.lampCore : CM.paneUnlit, x + 1, top + 3, w - 2, fanH - 4);
  b.rect(d.color, x, y, w, h);
  const pw = w * 0.32;
  const shade = d.color === CM.anchor || d.color === CM.coatPlum ? CM.coatPlum : CM.shadeWarm;
  for (const [px, py, ph] of [[x + w * 0.12, y + h * 0.07, h * 0.36], [x + w * 0.56, y + h * 0.07, h * 0.36], [x + w * 0.12, y + h * 0.52, h * 0.4], [x + w * 0.56, y + h * 0.52, h * 0.4]] as const) {
    b.rect(shade, px, py, pw, 2.4);
    b.rect(shade, px, py, 2.4, ph);
  }
  // ironmongery: knocker, letterbox, knob (brass)
  if (d.knocker !== false) b.fill(CM.coatMustard, ovalPath(x + w / 2, y + h * 0.34, 3.2, 3.6));
  b.rect(CM.coatMustard, x + w * 0.36, y + h * 0.47, w * 0.28, 3.2);
  b.fill(CM.coatMustard, ovalPath(x + w * 0.84, y + h * 0.52, 2.4, 2.4));
  // steps up from the towpath
  const n = d.steps ?? 3;
  const sh = (d.ground - (y + h)) / n;
  for (let k = 0; k < n; k++) {
    const sy = y + h + k * sh;
    const ext = 6 + k * 5;
    b.rect(CM.limestone, x - ext - 4, sy, w + ext * 2 + 8, sh * 0.42);
    b.rect(CM.stoneShade, x - ext - 4, sy + sh * 0.42, w + ext * 2 + 8, sh * 0.58);
  }
  if (ink > 0) {
    let s = rectInk(x - 3, top, w + 6, h + fanH + 4, {seed: `${d.id}/f`, over: 'medium', open: 0.3});
    if (d.fan === 'arch') s += `M${P(x + 2, y - 2)}A${r1(w / 2 - 2)} ${r1(fanH - 3)} 0 0 1 ${P(x + w - 2, y - 2)}`;
    b.ink(s, ink);
    let fan = '';
    if (d.fan === 'arch') for (let k = 1; k < 6; k++) {
      const a = Math.PI + (Math.PI * k) / 6;
      fan += `M${P(x + w / 2, y - 3)}L${P(x + w / 2 + Math.cos(a) * (w / 2 - 3), y - 3 + Math.sin(a) * (fanH - 4))}`;
    }
    else for (let k = 1; k < 4; k++) fan += `M${P(x + (w * k) / 4, top + 3)}L${P(x + (w * k) / 4, top + fanH - 1)}`;
    b.ink(fan, TK.fine, CM.paper === d.color ? CM.line : CM.ink);
    let st = '';
    for (let k = 0; k < n; k++) {
      const sy = y + h + k * sh;
      const ext = 6 + k * 5;
      st += line(x - ext - 4, sy, x + w + ext + 4, sy, {seed: `${d.id}/s${k}`, over: 'small'});
    }
    b.ink(st, TK.fine);
  }
  void r;
}

// ---------------------------------------------------------------- railings, pipes, stacks, aerials

/** Area railings: plum uprights with spear tops, a top and a bottom rail. */
export function areaRailInto(b: Batch, x0: number, x1: number, ground: number, h: number, seed: string, pitch = 9.5) {
  const top = ground - h;
  const r = rng(seed);
  b.rect(CM.anchor, x0, top + 5, x1 - x0, 2.4);
  b.rect(CM.anchor, x0, ground - 9, x1 - x0, 2.2);
  for (let x = x0 + 3; x < x1 - 1; x += pitch) {
    b.rect(CM.anchor, x - 0.85, top + 1, 1.7, h - 1);
    b.poly(CM.anchor, [[x - 2.1, top + 2], [x, top - 4], [x + 2.1, top + 2]]);
  }
  // stouter posts every few bays, with a ball finial
  for (let x = x0; x <= x1; x += pitch * r.int(9, 12)) {
    b.rect(CM.anchor, x - 2.2, top - 2, 4.4, h + 2);
    b.fill(CM.anchor, ovalPath(x, top - 4, 3.2, 3.2));
  }
  b.ink(line(x0, top + 6, x1, top + 6, {seed: `${seed}/t`, over: 'small'}), TK.fine);
}

/** A cast-iron drainpipe with brackets and a hopper head under the gutter. */
export function pipeInto(b: Batch, x: number, y0: number, y1: number, col: string = CM.shadeCool) {
  b.poly(col, [[x - 6, y0], [x + 6, y0], [x + 3, y0 + 9], [x - 3, y0 + 9]]);
  b.rect(col, x - 2.2, y0 + 8, 4.4, y1 - y0 - 8);
  for (let y = y0 + 40; y < y1 - 10; y += 62) b.rect(col, x - 3.6, y, 7.2, 3);
  b.rect(col, x - 2.2, y1 - 4, 9, 4);
}

/** A chimney stack: brick body, a limestone cap, pots (varied heights / colours / a cowl). Top of the pots >= 600. */
export function stackInto(b: Batch, x: number, w: number, top: number, bottom: number, col: string, seed: string, o: {pots?: number; aerial?: boolean; shadeRight?: boolean} = {}) {
  const r = rng(seed);
  const capT = Math.max(608, top);
  b.rect(col, x, capT + 5, w, bottom - capT - 5);
  b.rect(CM.limestone, x - 3, capT, w + 6, 6);
  if (o.shadeRight !== false) b.rect(CM.shadeWarm, x + w - Math.max(4, w * 0.18), capT + 6, Math.max(4, w * 0.18), bottom - capT - 6);
  const n = o.pots ?? Math.max(2, Math.round(w / 12));
  for (let k = 0; k < n; k++) {
    const pw = Math.min(9, (w - 4) / n - 2);
    const px = x + 3 + k * ((w - 4) / n) + ((w - 4) / n - pw) / 2;
    const ph = Math.min(capT - 600, r.range(5, 9));
    const pc = r.pick([CM.leafRust, CM.brickDeep, CM.brick, CM.coatOat, CM.leafRust]);
    b.rect(pc, px, capT - ph, pw, ph + 1);
    if (r.chance(0.25) && capT - ph - 3 >= 600) b.rect(CM.shadeCool, px - 1, capT - ph - 3, pw + 2, 3);
  }
}

/** A TV aerial (a yagi on a mast) as thin ink: mast from (x, y0) up to y1 (>= 600), crossbars, a boom. */
export function aerialInk(x: number, y0: number, y1: number, seed: string, dir = 1): string {
  const r = rng(seed);
  const top = Math.max(601, y1);
  const L = r.range(18, 30);
  let d = `M${P(x, y0)}L${P(x + r.jitter(0.6), top)}`;
  d += `M${P(x - L * 0.2 * dir, top + 3)}L${P(x + L * dir, top + 3)}`;
  for (let k = 0; k < 4; k++) {
    const bx = x + (L * (k + 0.2) * dir) / 4;
    const s = 5 - k * 0.6;
    d += `M${P(bx, top + 3 - s)}L${P(bx, top + 3 + s)}`;
  }
  if (r.chance(0.5)) d += `M${P(x, top + 14)}L${P(x - 9 * dir, top + 14)}M${P(x - 9 * dir, top + 10)}L${P(x - 9 * dir, top + 18)}`;
  return d;
}

// ---------------------------------------------------------------- climbing plants

/** Autumn Virginia creeper / ivy climbing a wall: vines of small leaves in seeded runs (no texture: leaves as shapes). */
export function creeperInto(b: Batch, x0: number, x1: number, yTop: number, yBot: number, seed: string, cols: string[], n: number, holes: [number, number, number, number][] = []) {
  const r = rng(seed);
  const inHole = (x: number, y: number) => holes.some(([hx0, hy0, hx1, hy1]) => x > hx0 && x < hx1 && y > hy0 && y < hy1);
  for (let v = 0; v < n; v++) {
    let x = r.range(x0, x1);
    let y = yBot - r.range(0, 30);
    const top = lerp(yTop, yBot, r.range(0, 0.45));
    let a = -Math.PI / 2 + r.jitter(0.5);
    while (y > top) {
      a += r.jitter(0.5);
      a = Math.max(-Math.PI * 0.85, Math.min(-Math.PI * 0.15, a));
      x += Math.cos(a) * 7;
      y += Math.sin(a) * 7;
      if (x < x0 - 10 || x > x1 + 10) break;
      if (inHole(x, y)) continue;
      const s = r.range(5, 8.5);
      b.fill(r.pick(cols), leafPath(x + r.jitter(4), y + r.jitter(3), s, s * 0.5, r.range(0, 180)));
      if (r.chance(0.5)) b.fill(r.pick(cols), leafPath(x + r.jitter(6), y + r.jitter(5), s * 0.9, s * 0.45, r.range(0, 180)));
    }
  }
}

/** A climbing rose round a door: leaves + blooms. */
export function roseInto(b: Batch, x0: number, x1: number, yTop: number, yBot: number, seed: string) {
  creeperInto(b, x0, x1, yTop, yBot, seed, [CM.sage, CM.sage, CM.leafGold], 4);
  const r = rng(`${seed}/fl`);
  for (let i = 0; i < 16; i++) b.fill(r.pick([CM.blossom, CM.box, CM.paper]), ovalPath(r.range(x0, x1), r.range(yTop + (yBot - yTop) * 0.3, yBot), 3, 2.8));
}

// ---------------------------------------------------------------- street things

/** A wheelie bin (body, lid, wheel): x = centre, y = ground. */
export function binInto(b: Batch, x: number, y: number, h: number, col: string) {
  const w = h * 0.62;
  b.poly(col, [[x - w / 2, y - h * 0.86], [x + w / 2, y - h * 0.86], [x + w * 0.44, y - 2], [x - w * 0.44, y - 2]]);
  b.rect(col, x - w * 0.56, y - h, w * 1.12, h * 0.15);
  b.rect(CM.shadeCool, x - w * 0.5, y - h * 0.86, w, 2);
  b.fill(CM.anchor, ovalPath(x + w * 0.38, y - 3, 3.5, 3.5));
  b.ink(line(x - w * 0.56, y - h, x + w * 0.56, y - h, {seed: `bin${x}`, over: 'small'}) + line(x - w / 2, y - h * 0.86, x - w * 0.44, y - 2, {seed: `binl${x}`, over: 'small'}), TK.fine);
}

/** A bicycle in profile (ink wheels and frame in a colour), x = centre, y = ground, R = wheel radius. */
export function bikeInk(b: Batch, x: number, y: number, R: number, col: string, seed: string, dir: 1 | -1 = 1) {
  const ax = x - dir * R * 1.25;
  const bx = x + dir * R * 1.25;
  const wy = y - R;
  b.ink(circleInk(ax, wy, R, {seed: `${seed}/a`, wobble: 0.015}) + circleInk(bx, wy, R, {seed: `${seed}/b`, wobble: 0.015}), TK.detail);
  const seat: Pt = [x - dir * R * 0.35, wy - R * 1.12];
  const bar: Pt = [x + dir * R * 0.8, wy - R * 1.3];
  b.ink(`M${P(ax, wy)}L${P(x, wy)}L${P(seat[0], seat[1] + R * 0.1)}L${P(ax, wy)}M${P(x, wy)}L${P(bar[0] - dir * R * 0.12, bar[1] + R * 0.25)}L${P(seat[0], seat[1] + R * 0.1)}M${P(bar[0] - dir * R * 0.12, bar[1] + R * 0.25)}L${P(bx, wy)}`, 2.2, col);
  b.ink(`M${P(bar[0] - dir * R * 0.3, bar[1])}L${P(bar[0] + dir * R * 0.12, bar[1] - R * 0.04)}`, 2, CM.ink);
  b.fill(CM.anchor, ovalPath(seat[0], seat[1], R * 0.28, R * 0.08));
  b.fill(col, ovalPath(x, wy, R * 0.12, R * 0.12));
}

export {line, rectInk, polyInk, arcInk, circleInk, ovalPath, domePath, lobes, leafPath, lerp, rng, P, r1};
