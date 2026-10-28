// V2S3_tParts.tsx (lane L3, V2S3 FAR helpers): the drawing toolkit of her terrace. Pure functions that put flat
// shapes into the canal kit's Batch (one Fill per colour per layer), so the whole terrace costs a few dozen SVG paths.
// Everything in WORLD px at the 12.98 match. Only CM tokens; no opacity.
//
// The clean look (DIRECTION rules 2, 4, 5; CRAFT §b-§d): the terrace is tier C (environment), so it is FLAT COLOUR with
// no lines (the clean pen drops tier-C ink; nothing here draws hand marks: no brick ticks, stone dabs, dentil rows,
// leaf specks or ink-only things). Its SHADOWS are not painted here: a builder puts each shade shape into a ShadeSink
// (`form`: a plane turned from the low western sun or an underside; `cast`: the shadow a projection throws on the wall,
// to the EAST, screen right, a little down) and the terrace's light layer (V2S3_light) draws them as the rig's ONE
// tint family, multiplied (CRAFT §d.3: never a hand-picked fill). Lit panes are CM.lamp, flat (her pane alone is
// brighter: the shot's brightest 5 %); thin iron is a mid plum (S3_IRON), never near-black.
import {CM, INK_PX} from '../palette';
import {line, rect as rectInk} from '../../lib/sketch';
import {seamTone} from '../../lib/depth';
import {mixHex} from '../../lib/light';
import {Batch, P, r1, rng, ovalPath, domePath, lobes, leafPath, lerp, Pt} from '../kit/canal/core';

export {Batch};
export type {Pt};

/** Ink weights (kept for the pieces that still author a line: the clean pen sets every line's width by its tier). */
export const TK = {struct: INK_PX.far, detail: INK_PX.hair, her: INK_PX.mid, fine: 1.2} as const;

/** Tier C's thin iron on the terrace (area railings, the balcony rail, drainpipes, bollards, the bin, benches): a MID
 *  warm mauve (L* ~61), so thin bars never read as dark lines in the calm world (S1's S1_IRON, CRAFT §b-§c: things
 *  that ARE lines within dL* 15 of their ground; the line count's budget, <= 80 strokes / Mpx). */
export const S3_IRON = '#A08E96';
/** An unlit pane at sunset: the glass holds the evening sky, half way from the slate to the glass (L* ~65), so its
 *  glazing bars never cut it into dark specks (the tool counts each dark corner as a stroke: L1's report). */
export const S3_UNLIT = mixHex(CM.paneUnlit, CM.glass, 0.45);

/** Where the builders put their shade shapes (drawn by the light layer as the rig's tint family; CRAFT §d.3-§d.4). */
export type ShadeSink = {form: string[]; cast: string[]};
export const shadeSink = (): ShadeSink => ({form: [], cast: []});

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
  /** Lit or not (static: nothing switches in this shot; the brief's life budget). A Switch[] still resolves. */
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

/** Surround, sill and frame (static, behind the pane); their shadows go to the sink: the surround's cast to the east,
 *  the lintel's, hood's and sill's strips below them. */
export function winBack(b: Batch, s: WinSpec, sh: ShadeSink) {
  const {x, y, w, h} = s;
  const r = rng(`${s.id}/back`);
  const fr = s.frame ?? CM.paper;
  const fw = Math.max(3, w * 0.06);
  sh.cast.push(quadP([[x + w + fw, y - fw + 4], [x + w + fw + 7, y - fw + 9], [x + w + fw + 7, y + h + 9], [x + w + fw, y + h + 2]]));
  if (s.surround === 'stone' || s.surround === 'hood') {
    const lw = w + fw * 2 + 10;
    if (s.surround === 'stone') {
      b.rect(CM.limestone, x - fw - 5, y - fw - 12, lw, 12);
      b.poly(CM.limestone, [[x + w / 2 - 6, y - fw - 15], [x + w / 2 + 6, y - fw - 15], [x + w / 2 + 4, y - fw], [x + w / 2 - 4, y - fw]]);
      sh.cast.push(rectP(x - fw - 5, y - fw, lw, 3));
    } else {
      b.rect(CM.stucco, x - fw - 8, y - fw - 14, lw + 6, 8);
      b.rect(CM.stucco, x - fw - 6, y - fw - 6, 6, 9);
      b.rect(CM.stucco, x + w + fw, y - fw - 6, 6, 9);
      sh.cast.push(rectP(x - fw - 8, y - fw - 6, lw + 6, 2.5));
    }
  } else if (s.surround === 'arch') {
    const band = 11;
    const col = s.wall === CM.brickDeep ? CM.brick : s.wall === CM.brickLight ? CM.brick : CM.brickLight;
    b.fill(col, segArchP(x - fw, y - fw, w + fw * 2, 4, band));
  } else if (s.surround === 'stucco') {
    b.rect(CM.stucco, x - fw - 6, y - fw - 6, w + fw * 2 + 12, h + fw + 6);
    b.rect(CM.stucco, x - fw - 10, y - fw - 16, w + fw * 2 + 20, 9);
    sh.cast.push(rectP(x - fw - 10, y - fw - 7, w + fw * 2 + 20, 2.5));
  }
  // the frame (the painted box the sashes sit in)
  b.rect(fr, x - fw, y - fw, w + fw * 2, h + fw);
  if (s.sill !== false) {
    b.rect(CM.limestone, x - fw - 6 + r.jitter(1), y + h, w + fw * 2 + 12, 6);
    sh.cast.push(rectP(x - fw - 4, y + h + 6, w + fw * 2 + 8, 3));
  }
}

const CURTAINS = [CM.box, CM.coatMustard, CM.blossom, CM.sage, CM.leafRust, CM.coatOat];
/** Wood inside a lit room (rods, shelves, frames, a sideboard): a light oak, never a dark line on the lamp gold. */
const ROOM_WOOD = '#C69A78';

/** The pane (lit or unlit) with its interior: a lit pane is CM.lamp, flat (no lighter core and no glow disc: her pane
 *  alone carries the lamp's core); an unlit one holds a wedge of the evening sky. */
export function winPane(b: Batch, s: WinSpec, on: boolean) {
  const {x, y, w, h} = s;
  const r = rng(`${s.id}/pane`);
  const curtain = s.curtain ?? r.pick(CURTAINS);
  const open = s.open ?? 0;
  if (on) {
    b.rect(CM.lamp, x, y, w, h);
    const inner = s.inner ?? 'curtains';
    if (inner === 'curtains' || inner === 'lamp' || inner === 'frame') {
      // two side curtains, gathered at the bottom (darker against the lit room)
      const cw = w * r.range(0.16, 0.22);
      b.poly(curtain, [[x, y], [x + cw, y], [x + cw * 0.7, y + h * 0.55], [x + cw * 1.05, y + h], [x, y + h]]);
      b.poly(curtain, [[x + w, y], [x + w - cw, y], [x + w - cw * 0.7, y + h * 0.55], [x + w - cw * 1.05, y + h], [x + w, y + h]]);
      b.rect(ROOM_WOOD, x - 2, y + 2, w + 4, 2.4);
    }
    if (inner === 'lamp') {
      // a table lamp on a sideboard: its shade in a warm colour (no glow disc)
      const lx = x + w * r.range(0.35, 0.65);
      const ly = y + h * 0.78;
      b.poly(r.pick([CM.box, CM.coatMustard, CM.paper]), [[lx - w * 0.12, ly - h * 0.06], [lx + w * 0.12, ly - h * 0.06], [lx + w * 0.08, ly - h * 0.17], [lx - w * 0.08, ly - h * 0.17]]);
      b.rect(S3_IRON, lx - 1.2, ly - h * 0.06, 2.4, h * 0.1);
      b.rect(ROOM_WOOD, x + w * 0.1, ly + h * 0.04, w * 0.8, h * 0.18);
    }
    if (inner === 'frame') {
      const fx = x + w * r.range(0.32, 0.5);
      const fy = y + h * r.range(0.15, 0.25);
      b.rect(ROOM_WOOD, fx, fy, w * 0.24, h * 0.16);
      b.rect(r.pick([CM.sage, CM.box, CM.paper, CM.blossom]), fx + 2.5, fy + 2.5, w * 0.24 - 5, h * 0.16 - 5);
    }
    if (inner === 'shelf') {
      for (let k = 0; k < 2; k++) {
        const sy = y + h * (0.3 + k * 0.26);
        b.rect(ROOM_WOOD, x + w * 0.08, sy, w * 0.84, 2.6);
        // the books as one stepped block per shelf (two tones), never a row of specks
        b.rect(CM.coatMustard, x + w * 0.1, sy - h * 0.1, w * 0.4, h * 0.1);
        b.rect(CM.brick, x + w * 0.52, sy - h * 0.08, w * 0.34, h * 0.08);
      }
    }
    if (inner === 'pendant') {
      const px = x + w * r.range(0.35, 0.65);
      b.rect(S3_IRON, px - 0.8, y, 1.6, h * 0.22);
      b.fill(r.pick([CM.coatMustard, CM.box, CM.sage]), domePath(px, y + h * 0.3, w * 0.15, h * 0.09));
      b.rect(curtain, x, y, w * 0.14, h);
    }
    if (inner === 'plantSil') {
      b.fill(CM.shadeWarm, lobes(x + w * 0.12, x + w * 0.5, y + h, h * 0.34, `${s.id}/pl`, 3));
      b.rect(curtain, x + w * 0.84, y, w * 0.16, h);
    }
    if (s.blind) b.rect(r.pick([CM.paper, CM.coatOat, CM.box]), x, y, w, h * s.blind);
  } else {
    b.rect(S3_UNLIT, x, y, w, h);
    // the evening sky in the glass: two mint wedges
    const k = r.range(0.25, 0.5);
    b.poly(CM.glass, [[x, y], [x + w * k, y], [x, y + h * k * 1.2]]);
    b.poly(CM.glass, [[x + w, y + h * 0.48], [x + w, y + h * (0.48 + k * 0.5)], [x + w * (1 - k * 0.5), y + h * 0.48]]);
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
    }
  }
  if (open > 0) {
    // the raised lower sash: its rail crosses the top half, the gap below shows the room deeper
    b.rect(ROOM_WOOD, x, y + h - open, w, 3);
  }
}

/** Sashes and glazing bars over the pane (static), flat; the window box under the sill. */
export function winFront(b: Batch, s: WinSpec, sh?: ShadeSink) {
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
  if (s.box) boxInto(b, x - 6, x + w + 6, y + h + 2, 13, `${s.id}/box`, {}, sh);
}

// ---------------------------------------------------------------- window boxes, pots, plants

const FLOWERS = [CM.box, CM.blossom, CM.paper, CM.coatMustard, CM.leafRust];

/** A window box (a painted trough) with mixed planting: leaves, flowers, a trailing ivy over the front; its shadow on
 *  the wall below goes to the sink. */
export function boxInto(b: Batch, x0: number, x1: number, top: number, hh: number, seed: string, o: {trough?: string; low?: [number, number]; flinch?: number} = {}, sh?: ShadeSink) {
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
      for (let k = 0; k < 3; k++) b.fill(fc, ovalPath(cx + r.jitter(11) + fl * 1.3, top + 2 - ph * r.range(0.55, 1.0), 3.4, 3.2));
    }
  }
  // the trough; its shadow on the wall below
  b.rect(o.trough ?? CM.line, x0, top, w, hh);
  sh?.cast.push(rectP(x0 + 2, top + hh, w - 4, 3));
  // trailing ivy over the lip: a few hanging strands as lobed shapes
  for (let i = 0; i < Math.round(w / 40); i++) {
    const tx = r.range(x0 + 8, x1 - 8);
    const L = r.range(10, 22);
    b.fill(CM.sage, leafPath(tx, top + hh * 0.5 + L / 2, L, 5, 90 + r.jitter(20)));
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
      for (let k = 0; k < 3; k++) b.fill(r.pick(FLOWERS), ovalPath(x + r.jitter(pw * 0.6), y - pw * r.range(1.3, 1.9), s * 0.17, s * 0.16));
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

/** A front door: its case, frame, fanlight (lit: CM.lamp), the leaf with four panel mouldings (a soft step of its own
 *  colour), brass, and the steps up from the towpath (each riser in its nosing's shade); shadows to the sink. */
export function doorInto(b: Batch, d: DoorSpec, sh: ShadeSink) {
  const {x, y, w, h} = d;
  const fanH = d.fan === 'arch' ? w / 2 : w * 0.42;
  const top = y - fanH - 4;
  if (d.caseStucco) {
    b.rect(CM.stucco, x - 13, top - 4, 11, h + fanH + 8);
    b.rect(CM.stucco, x + w + 2, top - 4, 11, h + fanH + 8);
    b.rect(CM.stucco, x - 18, top - 14, w + 36, 11);
    sh.cast.push(rectP(x - 18, top - 3, w + 36, 2.6));
    sh.cast.push(quadP([[x + w + 13, top], [x + w + 20, top + 6], [x + w + 20, y + h], [x + w + 13, y + h]]));
  } else {
    sh.cast.push(quadP([[x + w + 3, top + 4], [x + w + 9, top + 9], [x + w + 9, y + h], [x + w + 3, y + h]]));
  }
  b.rect(CM.paper, x - 3, top, w + 6, h + fanH + 4);
  if (d.fan === 'arch') b.fill(d.fanLit ? CM.lamp : S3_UNLIT, domePath(x + w / 2, y - 2, w / 2 - 2, fanH - 3));
  else b.rect(d.fanLit ? CM.lamp : S3_UNLIT, x + 1, top + 3, w - 2, fanH - 4);
  b.rect(d.color, x, y, w, h);
  const pw = w * 0.32;
  const moulding = seamTone(d.color, 8);
  for (const [px, py, ph] of [[x + w * 0.12, y + h * 0.07, h * 0.36], [x + w * 0.56, y + h * 0.07, h * 0.36], [x + w * 0.12, y + h * 0.52, h * 0.4], [x + w * 0.56, y + h * 0.52, h * 0.4]] as const) {
    b.rect(moulding, px, py, pw, 2.4);
    b.rect(moulding, px, py, 2.4, ph);
  }
  if (d.knocker !== false) b.fill(CM.coatMustard, ovalPath(x + w / 2, y + h * 0.34, 3.2, 3.6));
  b.rect(CM.coatMustard, x + w * 0.36, y + h * 0.47, w * 0.28, 3.2);
  b.fill(CM.coatMustard, ovalPath(x + w * 0.84, y + h * 0.52, 2.4, 2.4));
  const n = d.steps ?? 3;
  const stepH = (d.ground - (y + h)) / n;
  for (let k = 0; k < n; k++) {
    const sy = y + h + k * stepH;
    const ext = 6 + k * 5;
    b.rect(CM.limestone, x - ext - 4, sy, w + ext * 2 + 8, stepH);
    sh.form.push(rectP(x - ext - 4, sy + stepH * 0.42, w + ext * 2 + 8, stepH * 0.58));
  }
}

// ---------------------------------------------------------------- railings, pipes, stacks

/** Area railings: mid-plum uprights with a top and a bottom rail and a stouter post every few bays (flat, calm: one bar
 *  every `pitch` px, no spear specks). */
export function areaRailInto(b: Batch, x0: number, x1: number, ground: number, h: number, seed: string, pitch = 19, col: string = S3_IRON) {
  const top = ground - h;
  const r = rng(seed);
  b.rect(col, x0, top + 5, x1 - x0, 2.4);
  b.rect(col, x0, ground - 9, x1 - x0, 2.2);
  for (let x = x0 + 3; x < x1 - 1; x += pitch) b.rect(col, x - 0.9, top + 2, 1.8, h - 2);
  for (let x = x0; x <= x1; x += pitch * r.int(5, 7)) {
    b.rect(col, x - 2, top, 4, h);
    b.fill(col, ovalPath(x, top - 2, 3.2, 3.2));
  }
}

/** A cast-iron drainpipe with brackets and a hopper head under the gutter. */
export function pipeInto(b: Batch, x: number, y0: number, y1: number, col: string = S3_IRON) {
  b.poly(col, [[x - 6, y0], [x + 6, y0], [x + 3, y0 + 9], [x - 3, y0 + 9]]);
  b.rect(col, x - 2, y0 + 8, 4, y1 - y0 - 8);
  b.rect(col, x - 2, y1 - 4, 8, 4);
}

/** A chimney stack: brick body, a stone cap, pots (top of the pots >= 600). Returns the body's path (its form shade on
 *  the side away from the sun is the light layer's FormShade). */
export function stackInto(b: Batch, x: number, w: number, top: number, bottom: number, col: string, seed: string, o: {pots?: number} = {}): string {
  const r = rng(seed);
  const capT = Math.max(608, top);
  b.rect(col, x, capT + 5, w, bottom - capT - 5);
  b.rect(CM.limestone, x - 3, capT, w + 6, 6);
  const n = o.pots ?? Math.max(2, Math.round(w / 12));
  for (let k = 0; k < n; k++) {
    const pw = Math.min(9, (w - 4) / n - 2);
    const px = x + 3 + k * ((w - 4) / n) + ((w - 4) / n - pw) / 2;
    const ph = Math.min(capT - 600, r.range(5, 9));
    b.rect(r.pick(['#C98B6B', CM.brick, CM.coatOat, '#C98B6B']), px, capT - ph, pw, ph + 1);
  }
  return rectP(x, capT + 5, w, bottom - capT - 5);
}

// ---------------------------------------------------------------- street things

/** A wheelie bin (body, lid, wheel): x = centre, y = ground. Flat. */
export function binInto(b: Batch, x: number, y: number, h: number, col: string) {
  const w = h * 0.62;
  b.poly(col, [[x - w / 2, y - h * 0.86], [x + w / 2, y - h * 0.86], [x + w * 0.44, y - 2], [x - w * 0.44, y - 2]]);
  b.rect(seamTone(col, -6), x - w * 0.56, y - h, w * 1.12, h * 0.15);
  b.fill(S3_IRON, ovalPath(x + w * 0.38, y - 3, 3.5, 3.5));
}

export {line, rectInk, ovalPath, domePath, lobes, leafPath, lerp, rng, P, r1};
