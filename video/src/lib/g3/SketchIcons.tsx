// SketchIcons (shared G3 kit; copied from src/v3/SketchIcons.tsx on 2026-10-30, which stays v3's own): recognisable
// pencil-sketch objects for SketchReel's {t: 'icon'} element (G3 clarity rule: literal beats clever, every shot reads
// with the sound off). Each icon is built at its real pixel size from the sketch.ts pencil helpers.
//
//   {"t": "icon", "name": "laptop", "x": 120, "y": 800, "w": 400, "tier": "A", "draw": [0, 0.8], "fillIn": 0.9}
//
// x, y = top-left of the box; w = width; h defaults to w * ICON_ASPECT[name] (another h stretches the drawing);
// fill = the body colour (a fill token or a #hex; 'none' = lines and details only; omitted = the icon's own colour);
// text = the icon's own words (sign, price, chart title, year, chip marking); pts = chart only: the line's points
// [[x 0..1, value 0..1], ...]. Readable from 270 px wide (a third of the frame); details scale with w.
//
// Board weights (pass `board: {role, sw?, tone?}`): every colour snaps to the 4 board tones by brightness (boardTone:
// dark only on the subject); outlines (the 4+ px strokes) take the role's weight: subject (tier A) 9 px ink, far (tier
// B) 3 px mid grey with light fills, env (tier C) 3 px light with light / paper fills (a pale tone, no dark line); mid =
// v3's 5 px ink; details are 3 px; lights don't blink; a chart drops its grid and area wash. `tone` maps every output
// colour to its plane's grey step (src/lib/g3/board.ts planeTone). The label is 60 px ink.

import React, {useMemo} from 'react';
import {captionFontStack} from '../font';
import {rng} from '../rng';
import {type LineOpts, Pt, arc, arrow, boardLoop, boardPen, crown, ellipse, glint, line, poly, polyPath, rect, rectPath, roundRect, smooth} from '../sketch';
import {BOARD, type ToneRole, boardTone, roleLine} from './board';

export type IconName =
  | 'laptop' | 'phone' | 'ram' | 'chip' | 'datacenter' | 'server' | 'pricetag' | 'chart'
  | 'factory' | 'truck' | 'calendar' | 'house' | 'cart' | 'crane' | 'pile'
  // added for v2 (2026-10-26)
  | 'page' | 'stamp' | 'badge' | 'mic' | 'lamp' | 'mug' | 'pentagon' | 'lot' | 'speech' | 'bookshelf' | 'window'
  | 'box' | 'stonewall' | 'nodes' | 'marker' | 'cars';

/** natural height / width of each icon (h defaults to w * this) */
export const ICON_ASPECT: Record<IconName, number> = {
  laptop: 0.7, phone: 2, ram: 0.3, chip: 1, datacenter: 0.7, server: 1.7, pricetag: 0.6, chart: 0.78,
  factory: 0.72, truck: 0.58, calendar: 1, house: 0.92, cart: 0.82, crane: 1, pile: 0.58,
  page: 1.3, stamp: 0.38, badge: 1.7, mic: 1.7, lamp: 1.1, mug: 1.1, pentagon: 0.62, lot: 0.5, speech: 0.66,
  bookshelf: 2.4, window: 1.15, box: 0.8, stonewall: 0.3, nodes: 0.6, marker: 1, cars: 0.035,
};
export const ICON_NAMES = Object.keys(ICON_ASPECT) as IconName[];

const LEAD = '#4a443e';
const MUTED = '#8a7f72';
const C = {
  paper: '#f3ebdd', white: '#fbf6ee', dark: '#3d3943', darker: '#2a262c', silver: '#d3d5d9', steel: '#9fa3aa',
  key: '#8c8f97', screen: '#7fa8cc', glass: '#b6d0e2', lit: '#ffd36b', gold: '#dba236', green: '#86b07f',
  red: '#e0573a', brick: '#d38f74', brickDark: '#b06d58', roof: '#b9654c', wood: '#8f5f47', yellow: '#f2c14e',
  concrete: '#b3aca3', cold: '#bac3ce', warm: '#f2d49b', cream: '#efdcb8', smoke: '#dedad5', slate: '#3f4652',
  ledG: '#7fe0a0', ledB: '#8fd3f0', ledA: '#f5b945', grid: '#bfb3a3',
};

/** k (board mode): 'o' outline (takes the role's weight), 'd' detail (3 px), 'm' a fixed 5 px line (chart axes) */
type Stroke = {d: string; w: number; c?: string; subs: string[]; k: 'o' | 'd' | 'm'};
type Paint = {d: string; c: string; o?: number; blink?: number};
type Words = {x: number; y: number; s: string; size: number; c: string; anchor: 'start' | 'middle'; onFill?: boolean};
type Part = {fills: Paint[]; strokes: Stroke[]; texts: Words[]};

const r1 = (n: number) => Math.round(n * 10) / 10;
const ovalPath = (cx: number, cy: number, rx: number, ry: number) =>
  `M${r1(cx - rx)} ${r1(cy)}a${r1(rx)} ${r1(ry)} 0 1 0 ${r1(2 * rx)} 0a${r1(rx)} ${r1(ry)} 0 1 0 ${r1(-2 * rx)} 0Z`;
const lerp = (a: Pt, b: Pt, f: number): Pt => [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f];
const shortest = (pts: Pt[], closed: boolean) => {
  let m = Infinity;
  for (let i = 0; i < pts.length - (closed ? 0 : 1); i++) {
    const q = pts[(i + 1) % pts.length];
    m = Math.min(m, Math.hypot(q[0] - pts[i][0], q[1] - pts[i][1]));
  }
  return m;
};

/** Collects an icon's parts (painted back to front: each part's fills, then its strokes, then its words) in box
 *  units: u runs across the width (0..1), v down the height (0..1); radii (r) are in units of the width. */
class Ico {
  parts: Part[] = [];
  rotate = 0;
  private cur: Part = {fills: [], strokes: [], texts: []};
  private n = 0;
  readonly over: number;
  /** board-mode pen options spread into every stroke ({} in sketch mode, so sketch strokes are unchanged) */
  readonly pen: LineOpts;
  constructor(readonly x: number, readonly y: number, readonly w: number, readonly h: number, readonly seed: string,
    readonly board?: {role: ToneRole; sw?: number}) {
    this.parts.push(this.cur);
    this.over = 3 * Math.max(0.5, Math.min(3, w / 270));
    this.pen = board ? {breaks: false, jitter: boardPen().jitter, drift: boardPen().drift} : {};
  }
  part() {
    this.cur = {fills: [], strokes: [], texts: []};
    this.parts.push(this.cur);
  }
  X = (u: number) => this.x + u * this.w;
  Y = (v: number) => this.y + v * this.h;
  P = (p: Pt): Pt => [this.X(p[0]), this.Y(p[1])];
  sd = () => `${this.seed}/${this.n++}`;
  /** overshoot for a stroke whose shortest segment is len px: small details stay crisp (board: at most 6 px, none on the subject) */
  ov = (len: number): LineOpts['over'] => {
    if (!this.board) return Math.min(this.over, 0.07 * len);
    const v = this.board.role === 'subject' ? 0 : Math.min(6, 0.05 * len);
    return [v, v * 0.8];
  };
  // ---- strokes
  ink(d: string, w = 4, c?: string, k?: Stroke['k']) {
    if (d) this.cur.strokes.push({d, w, c, subs: d.split(/(?=M)/).filter((s) => s.trim()), k: k ?? (w >= 4 ? 'o' : 'd')});
  }
  ln(u1: number, v1: number, u2: number, v2: number, w = 4, c?: string) {
    this.ink(line(this.X(u1), this.Y(v1), this.X(u2), this.Y(v2), {seed: this.sd(), over: this.ov(Math.hypot((u2 - u1) * this.w, (v2 - v1) * this.h)), ...this.pen}), w, c);
  }
  bx(u: number, v: number, uw: number, vh: number, w = 4, c?: string) {
    this.ink(rect(this.X(u), this.Y(v), uw * this.w, vh * this.h, {seed: this.sd(), over: this.ov(Math.min(Math.abs(uw * this.w), Math.abs(vh * this.h))), ...this.pen}), w, c);
  }
  pl(pts: Pt[], closed = true, w = 4, c?: string) {
    this.ink(poly(pts.map(this.P), {seed: this.sd(), closed, over: this.ov(shortest(pts.map(this.P), closed)), ...this.pen}), w, c);
  }
  /** one continuous stroke through the points */
  run(pts: Pt[], w = 4, c?: string) {
    this.ink(poly(pts.map(this.P), {seed: this.sd(), joined: true, jitter: this.pen.jitter}), w, c);
  }
  ci(u: number, v: number, r: number, w = 4, c?: string) {
    const loop = this.board ? boardLoop(r * this.w, this.board.role === 'subject') : {};
    this.ink(ellipse(this.X(u), this.Y(v), r * this.w, r * this.w, {seed: this.sd(), ...loop}), w, c);
  }
  rr(u: number, v: number, uw: number, vh: number, rad: number, w = 4, c?: string) {
    this.ink(roundRect(this.X(u), this.Y(v), uw * this.w, vh * this.h, rad * this.w, {seed: this.sd(), closed: false}), w, c);
  }
  // ---- fills (c null/undefined = skip)
  paint(d: string, c: string | null | undefined, o?: number, blink?: number) {
    if (c) this.cur.fills.push({d, c, o, blink});
  }
  fBx(u: number, v: number, uw: number, vh: number, c: string | null, o?: number) {
    this.paint(rectPath(this.X(u), this.Y(v), uw * this.w, vh * this.h), c, o);
  }
  fPl(pts: Pt[], c: string | null, o?: number) {
    this.paint(polyPath(pts.map(this.P)), c, o);
  }
  fCi(u: number, v: number, r: number, c: string | null, o?: number, blink?: number) {
    this.paint(ovalPath(this.X(u), this.Y(v), r * this.w, r * this.w), c, o, blink);
  }
  fRr(u: number, v: number, uw: number, vh: number, rad: number, c: string | null, o?: number) {
    this.paint(roundRect(this.X(u), this.Y(v), uw * this.w, vh * this.h, rad * this.w, {seed: this.sd()}), c, o);
  }
  // ---- words, vertically centred on v
  say(u: number, v: number, s: string, size: number, c = LEAD, o: {anchor?: 'start' | 'middle'; onFill?: boolean} = {}) {
    this.cur.texts.push({x: this.X(u), y: this.Y(v) + size * 0.36, s, size, c, anchor: o.anchor ?? 'middle', onFill: o.onFill});
  }
  /** font size (px) that fits s into maxW x maxH px */
  fit(s: string, maxW: number, maxH: number) {
    return Math.min(maxH, maxW / Math.max(1, s.length * 0.55));
  }
}

type Opts = {body: (def: string | null) => string | null; text?: string; pts?: Pt[]; board: boolean};

const ICONS: Record<IconName, (b: Ico, o: Opts) => void> = {
  laptop(b, o) {
    const body = o.body(C.silver);
    b.fBx(0.12, 0, 0.76, 0.6, body);
    b.fBx(0.165, 0.055, 0.67, 0.49, C.screen);
    b.bx(0.12, 0, 0.76, 0.6);
    b.bx(0.165, 0.055, 0.67, 0.49, 3);
    b.ink(glint(b.X(0.71), b.Y(0.32), 0.11 * b.w, {seed: b.sd()}), 3, C.white);
    b.part();
    const edge = (v: number) => 0.12 - 0.4 * (v - 0.6); // the deck's left edge (perspective)
    const deck: Pt[] = [[0.12, 0.6], [0.88, 0.6], [1, 0.9], [0, 0.9]];
    b.fPl(deck, body);
    b.fPl([[0, 0.9], [1, 0.9], [0.985, 0.965], [0.015, 0.965]], body ? C.steel : null);
    for (let r = 0; r < 3; r++) {
      const vt = 0.625 + r * 0.052;
      const l = edge(vt + 0.018) + 0.075;
      const unit = (1 - 2 * l) / 12;
      let u = l;
      for (const s of r < 2 ? Array(12).fill(1) : [1, 1, 1, 6, 1, 1, 1]) {
        b.fBx(u + unit * 0.12, vt, s * unit - unit * 0.24, 0.036, C.key);
        u += s * unit;
      }
    }
    const wl = (v: number) => edge(v) + 0.06;
    b.pl([[wl(0.613), 0.613], [1 - wl(0.613), 0.613], [1 - wl(0.772), 0.772], [wl(0.772), 0.772]], true, 2.5);
    b.pl([[0.4, 0.79], [0.6, 0.79], [0.61, 0.875], [0.39, 0.875]], true, 3);
    b.pl(deck);
    b.pl([[0, 0.9], [0.015, 0.965], [0.985, 0.965], [1, 0.9]], false);
  },

  phone(b, o) {
    const body = o.body(C.dark);
    b.fRr(0.04, 0.01, 0.92, 0.98, 0.15, body);
    b.fRr(0.1, 0.045, 0.8, 0.91, 0.09, C.screen);
    for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) b.fRr(0.2 + c * 0.22, 0.13 + r * 0.1, 0.16, 0.08, 0.04, C.white, 0.85);
    b.fRr(0.38, 0.062, 0.24, 0.026, 0.05, C.darker);
    b.fRr(0.34, 0.915, 0.32, 0.012, 0.03, C.white);
    b.rr(0.04, 0.01, 0.92, 0.98, 0.15);
    b.rr(0.1, 0.045, 0.8, 0.91, 0.09, 3);
    b.ln(0.985, 0.2, 0.985, 0.28, 5);
    b.ink(glint(b.X(0.72), b.Y(0.72), 0.12 * b.w, {seed: b.sd()}), 3, C.white);
  },

  ram(b, o) {
    const board = o.body(C.green);
    const outline: Pt[] = [[0, 0.04], [1, 0.04], [1, 1], [0.46, 1], [0.46, 0.84], [0.42, 0.84], [0.42, 1], [0, 1]];
    b.fPl(outline, board);
    for (let u = 0.03; u < 0.965; u += 0.027) if (u + 0.018 < 0.42 || u > 0.46) b.fBx(u, 0.74, 0.018, 0.23, C.gold);
    for (let i = 0; i < 4; i++) b.fBx(0.06 + i * 0.23, 0.17, 0.18, 0.42, C.darker);
    for (let i = 0; i < 4; i++) b.bx(0.06 + i * 0.23, 0.17, 0.18, 0.42, 3);
    b.pl(outline);
    b.ln(0.02, 0.7, 0.98, 0.7, 2.5);
  },

  chip(b, o) {
    const body = o.body(C.dark);
    for (const p of [0.29, 0.395, 0.5, 0.605, 0.71]) {
      b.ln(p, 0.2, p, 0.05, 5);
      b.ln(p, 0.8, p, 0.95, 5);
      b.ln(0.2, p, 0.05, p, 5);
      b.ln(0.8, p, 0.95, p, 5);
    }
    b.part();
    b.fBx(0.2, 0.2, 0.6, 0.6, body);
    b.fBx(0.31, 0.31, 0.38, 0.38, body ? '#57525c' : null);
    b.fCi(0.27, 0.27, 0.025, C.silver);
    b.bx(0.2, 0.2, 0.6, 0.6);
    b.bx(0.31, 0.31, 0.38, 0.38, 2.5, body ? '#7a7480' : LEAD);
    if (o.text) b.say(0.5, 0.5, o.text, b.fit(o.text, 0.34 * b.w, 0.22 * b.h), C.white, {onFill: true});
  },

  datacenter(b, o) {
    const wall = o.body(C.cold);
    // cooling units on the roof (fan + grille)
    for (const u0 of [0.1, 0.4, 0.7]) {
      b.fBx(u0, 0.055, 0.2, 0.135, C.silver);
      b.fCi(u0 + 0.06, 0.1225, 0.032, '#8e959e');
      b.bx(u0, 0.055, 0.2, 0.135, 3);
      b.ci(u0 + 0.06, 0.1225, 0.032, 3);
      b.ln(u0 + 0.06 - 0.022, 0.1225, u0 + 0.06 + 0.022, 0.1225, 2.5);
      b.ln(u0 + 0.06, 0.1225 - 0.03, u0 + 0.06, 0.1225 + 0.03, 2.5);
      for (const g of [0.125, 0.15, 0.175]) b.ln(u0 + g, 0.08, u0 + g, 0.165, 2.5);
    }
    b.part();
    b.fBx(0, 0.19, 1, 0.055, wall ? '#9aa3ae' : null);
    b.fBx(0.03, 0.245, 0.94, 0.755, wall);
    b.bx(0, 0.19, 1, 0.055);
    b.bx(0.03, 0.245, 0.94, 0.755);
    const text = o.text;
    if (text) {
      b.fBx(0.08, 0.275, 0.84, 0.16, C.white);
      b.bx(0.08, 0.275, 0.84, 0.16, 3);
      b.say(0.5, 0.355, text, b.fit(text, 0.8 * b.w, 0.13 * b.h), LEAD);
    }
    // rows of server windows: rack panes with orderly LED dashes
    const r = rng(`${b.seed}/leds`);
    const pane = 0.84 / 8;
    for (let v = text ? 0.48 : 0.3; v + 0.085 <= 0.86; v += 0.125) {
      b.fBx(0.08, v, 0.84, 0.085, C.slate);
      for (let k = 0; k < 8; k++) {
        const pu = 0.08 + k * pane;
        for (const [dv, c] of [[0.02, C.ledG], [0.05, C.ledB]] as const) {
          for (const du of [0.018, 0.055]) b.fBx(pu + du, v + dv, 0.028, 0.016, r.chance(0.15) ? C.ledA : c);
        }
      }
      b.bx(0.08, v, 0.84, 0.085, 3);
      for (let k = 1; k < 8; k++) b.ln(0.08 + k * pane, v, 0.08 + k * pane, v + 0.085, 2.5);
    }
    b.fBx(0.42, 0.88, 0.16, 0.12, C.dark);
    b.bx(0.42, 0.88, 0.16, 0.12, 3);
    b.ln(0.5, 0.88, 0.5, 1, 2.5);
    b.ln(-0.04, 1, 1.04, 1);
  },

  server(b, o) {
    const rack = o.body(C.dark);
    for (const u of [0.13, 0.77]) {
      b.fBx(u, 0.945, 0.1, 0.045, C.darker);
      b.bx(u, 0.945, 0.1, 0.045, 3);
    }
    b.part();
    b.fBx(0.08, 0.02, 0.84, 0.925, rack);
    b.bx(0.08, 0.02, 0.84, 0.925);
    const r = rng(`${b.seed}/blink`);
    const uh = 0.85 / 6;
    for (let i = 0; i < 6; i++) {
      const v0 = 0.06 + i * uh + 0.012;
      const hh = uh - 0.024;
      const vm = v0 + hh / 2;
      b.fBx(0.14, v0, 0.72, hh, rack ? '#5d5864' : null);
      [C.ledG, C.ledG, C.ledA].forEach((c, j) => b.fCi(0.22 + j * 0.075, vm, 0.026, c, 1, j < 2 ? r.next() : undefined));
      b.bx(0.14, v0, 0.72, hh, 3);
      for (const dv of [-0.022, 0, 0.022]) b.ln(0.5, vm + dv, 0.8, vm + dv, 2.5, rack ? C.darker : LEAD);
    }
  },

  pricetag(b, o) {
    const tag = o.body(C.warm);
    b.rotate = -10;
    const shape: Pt[] = [[0.27, 0.1], [0.97, 0.1], [0.97, 0.9], [0.27, 0.9], [0.03, 0.5]];
    b.fPl(shape, tag);
    b.fCi(0.19, 0.5, 0.042, C.paper);
    b.pl(shape);
    b.ci(0.19, 0.5, 0.042, 3);
    b.ink(smooth(([[0.19, 0.46], [0.16, 0.24], [0.09, 0.1], [0.02, 0.06], [-0.04, -0.04]] as Pt[]).map(b.P)), 3);
    if (o.text) b.say(0.62, 0.5, o.text, b.fit(o.text, 0.6 * b.w, 0.5 * b.h), LEAD);
  },

  chart(b, o) {
    // board: no default area wash (one line on an L of axes); an explicit fill still paints the area
    const area = o.body(o.board ? null : C.red);
    const top = o.text ? 0.22 : 0.06;
    const L = 0.12;
    const R = 0.95;
    const B = 0.88;
    if (o.text) b.say(0.04, 0.08, o.text, b.fit(o.text, 0.92 * b.w, 0.13 * b.h), LEAD, {anchor: 'start'});
    if (o.board) {
      b.ink(poly([b.P([L, top - 0.02]), b.P([L, B]), b.P([R + 0.03, B])], {seed: b.sd(), over: b.ov(0.3 * b.w), ...b.pen}), 4, undefined, 'm');
    } else {
      for (const f of [0.33, 0.66]) b.ln(L, B - f * (B - top), R, B - f * (B - top), 2, C.grid);
      const head = 0.035 * b.w;
      b.ink(arrow(b.X(L), b.Y(B), b.X(L), b.Y(top - 0.02), {seed: b.sd(), head}));
      b.ink(arrow(b.X(L), b.Y(B), b.X(R + 0.03), b.Y(B), {seed: b.sd(), head}));
    }
    const raw: Pt[] = o.pts?.length
      ? o.pts
      : [[0, 0.58], [0.12, 0.5], [0.22, 0.53], [0.34, 0.42], [0.46, 0.4], [0.58, 0.31], [0.7, 0.27], [0.8, 0.36], [0.9, 0.62], [1, 0.97]];
    const pts = raw.map(([x, v]): Pt => [L + 0.04 + x * (R - L - 0.08), B - 0.04 - v * (B - top - 0.1)]);
    const first = pts[0];
    const last = pts[pts.length - 1];
    b.fPl([...pts, [last[0], B], [first[0], B]], area, 0.4);
    b.run(pts, 5);
    if (pts.length > 1) {
      const [ex, ey] = b.P(last);
      const [px, py] = b.P(pts[pts.length - 2]);
      const a = Math.atan2(ey - py, ex - px) + Math.PI;
      const len = 0.07 * b.w;
      const hx = (da: number) => `${r1(ex + Math.cos(a + da) * len)} ${r1(ey + Math.sin(a + da) * len)}`;
      b.ink(`M${hx(-0.5)}L${r1(ex)} ${r1(ey)}L${hx(0.5)}`, 5);
    }
  },

  factory(b, o) {
    const wall = o.body(C.brick);
    for (const [u, v, rx] of [[0.8, 0.15, 0.05], [0.9, 0.065, 0.06]] as const) {
      const d = crown(b.X(u), b.Y(v), rx * b.w, rx * 0.8 * b.w, {seed: b.sd(), bumps: 6});
      b.paint(d, C.smoke);
      b.ink(d, 3, MUTED);
    }
    b.fBx(0.74, 0.22, 0.11, 0.42, wall ? C.brickDark : null);
    b.bx(0.74, 0.22, 0.11, 0.42);
    b.ln(0.74, 0.29, 0.85, 0.29, 3);
    b.part();
    const body: Pt[] = [[0.02, 1], [0.02, 0.42], [0.25, 0.6], [0.25, 0.42], [0.48, 0.6], [0.48, 0.42], [0.71, 0.6], [0.98, 0.6], [0.98, 1]];
    b.fPl(body, wall);
    for (const x0 of [0.02, 0.25, 0.48]) b.fPl([[x0, 0.42], [x0 + 0.23, 0.6], [x0, 0.6]], wall ? '#9c6a5a' : null);
    b.pl(body);
    b.ln(0.02, 0.6, 0.71, 0.6, 3);
    for (let i = 0; i < 4; i++) {
      b.fBx(0.07 + i * 0.13, 0.69, 0.08, 0.12, C.glass);
      b.bx(0.07 + i * 0.13, 0.69, 0.08, 0.12, 3);
    }
    b.fBx(0.64, 0.73, 0.26, 0.27, C.steel);
    b.bx(0.64, 0.73, 0.26, 0.27, 3);
    for (const v of [0.8, 0.86, 0.92]) b.ln(0.64, v, 0.9, v, 2.5);
    b.ln(-0.03, 1, 1.03, 1);
  },

  truck(b, o) {
    const box = o.body(C.white);
    b.fBx(0.02, 0.06, 0.64, 0.66, box);
    b.bx(0.02, 0.06, 0.64, 0.66);
    b.fBx(0.02, 0.72, 0.95, 0.06, C.dark);
    b.bx(0.02, 0.72, 0.95, 0.06, 3);
    const cab: Pt[] = [[0.68, 0.24], [0.85, 0.24], [0.97, 0.48], [0.97, 0.76], [0.68, 0.76]];
    const win: Pt[] = [[0.72, 0.3], [0.835, 0.3], [0.92, 0.48], [0.72, 0.48]];
    b.fPl(cab, C.red);
    b.fPl(win, C.glass);
    b.fBx(0.945, 0.6, 0.025, 0.07, C.lit);
    b.pl(cab);
    b.pl(win, true, 3);
    b.ln(0.75, 0.52, 0.75, 0.72, 2.5);
    b.ln(0.78, 0.56, 0.83, 0.56, 3);
    b.part();
    for (const u of [0.2, 0.82]) {
      b.fCi(u, 0.84, 0.085, C.dark);
      b.fCi(u, 0.84, 0.035, C.silver);
      b.ci(u, 0.84, 0.085);
      b.ci(u, 0.84, 0.035, 3);
    }
    b.ln(-0.03, 0.99, 1.03, 0.99, 3);
  },

  calendar(b, o) {
    const head = o.body(C.red);
    b.fBx(0.06, 0.1, 0.88, 0.86, C.white);
    b.fBx(0.06, 0.1, 0.88, 0.24, head);
    b.bx(0.06, 0.1, 0.88, 0.86);
    b.ln(0.06, 0.34, 0.94, 0.34);
    for (let i = 1; i < 4; i++) b.ln(0.1, 0.4 + i * 0.13, 0.9, 0.4 + i * 0.13, 2.5, C.grid);
    for (let j = 1; j < 7; j++) b.ln(0.1 + (j * 0.8) / 7, 0.4, 0.1 + (j * 0.8) / 7, 0.92, 2.5, C.grid);
    for (const u of [0.28, 0.72]) {
      b.fRr(u - 0.025, 0.03, 0.05, 0.14, 0.025, C.steel);
      b.rr(u - 0.025, 0.03, 0.05, 0.14, 0.025, 3);
    }
    if (o.text) b.say(0.5, 0.225, o.text, b.fit(o.text, 0.76 * b.w, 0.17 * b.h), head ? C.white : LEAD, {onFill: !!head});
  },

  house(b, o) {
    const wall = o.body(C.cream);
    b.fBx(0.66, 0.1, 0.1, 0.28, C.brick);
    b.bx(0.66, 0.1, 0.1, 0.28, 3);
    b.part();
    b.fBx(0.1, 0.46, 0.8, 0.52, wall);
    b.bx(0.1, 0.46, 0.8, 0.52);
    b.part();
    const roof: Pt[] = [[0, 0.5], [0.5, 0.06], [1, 0.5]];
    b.fPl(roof, C.roof);
    b.pl(roof);
    b.fBx(0.2, 0.6, 0.22, 0.2, C.lit);
    b.bx(0.2, 0.6, 0.22, 0.2);
    b.ln(0.31, 0.6, 0.31, 0.8, 3);
    b.ln(0.2, 0.7, 0.42, 0.7, 3);
    b.fBx(0.56, 0.66, 0.2, 0.32, C.wood);
    b.bx(0.56, 0.66, 0.2, 0.32);
    b.fCi(0.72, 0.83, 0.014, C.gold);
    b.ln(-0.04, 0.98, 1.04, 0.98);
  },

  cart(b, o) {
    const fill = o.body(C.cold);
    const basket: Pt[] = [[0.18, 0.18], [0.98, 0.18], [0.88, 0.58], [0.31, 0.58]];
    b.fPl(basket, fill, 0.6);
    b.fRr(-0.01, 0.03, 0.12, 0.06, 0.03, C.red);
    for (const f of [0.2, 0.4, 0.6, 0.8]) {
      const [tu, tv] = lerp(basket[0], basket[1], f);
      const [bu, bv] = lerp(basket[3], basket[2], f);
      b.ln(tu, tv, bu, bv, 3);
    }
    b.ln(0.245, 0.38, 0.93, 0.38, 3);
    b.pl(basket);
    b.pl([[-0.01, 0.06], [0.14, 0.06], [0.36, 0.72], [0.88, 0.72]], false);
    b.ln(0.42, 0.72, 0.42, 0.8, 3);
    b.ln(0.82, 0.72, 0.82, 0.8, 3);
    for (const u of [0.42, 0.82]) {
      b.fCi(u, 0.86, 0.06, C.dark);
      b.ci(u, 0.86, 0.06);
    }
  },

  crane(b, o) {
    const steel = o.body(C.yellow);
    b.ln(0.32, 0.02, 0.03, 0.16, 2.5);
    b.ln(0.32, 0.02, 0.8, 0.16, 2.5);
    b.fBx(0.02, 0.22, 0.12, 0.09, C.concrete);
    b.bx(0.02, 0.22, 0.12, 0.09, 3);
    b.part();
    const apex: Pt[] = [[0.27, 0.16], [0.32, 0.02], [0.37, 0.16]];
    b.fPl(apex, steel);
    b.pl(apex, false);
    b.fBx(0, 0.16, 1, 0.06, steel);
    b.fBx(0.28, 0.22, 0.08, 0.72, steel);
    b.fBx(0.36, 0.22, 0.09, 0.08, steel);
    b.fBx(0.385, 0.235, 0.05, 0.045, C.glass);
    b.ln(0, 0.16, 1, 0.16);
    b.ln(0, 0.22, 1, 0.22);
    b.ln(1, 0.16, 1, 0.22, 3);
    const jib: Pt[] = [];
    for (let i = 0; i <= 20; i++) jib.push([i * 0.05, i % 2 ? 0.16 : 0.22]);
    b.pl(jib, false, 2.5);
    b.ln(0.28, 0.22, 0.28, 0.94);
    b.ln(0.36, 0.22, 0.36, 0.94);
    const mast: Pt[] = [];
    for (let i = 0; i <= 12; i++) mast.push([i % 2 ? 0.36 : 0.28, 0.22 + i * 0.06]);
    b.pl(mast, false, 2.5);
    b.bx(0.36, 0.22, 0.09, 0.08, 3);
    // trolley, cable, hook
    b.fBx(0.76, 0.22, 0.05, 0.025, C.dark);
    b.ln(0.785, 0.245, 0.785, 0.6, 2.5);
    b.fBx(0.76, 0.6, 0.05, 0.05, C.dark);
    b.bx(0.76, 0.6, 0.05, 0.05, 3);
    b.ink(line(b.X(0.785), b.Y(0.65), b.X(0.785), b.Y(0.69), {seed: b.sd(), over: [0, 0]}) + arc(b.X(0.755), b.Y(0.69), 0.03 * b.w, 0.03 * b.w, 0, 165, {seed: b.sd()}).replace(/^M/, 'L'), 4);
    b.fBx(0.22, 0.94, 0.2, 0.06, C.concrete);
    b.bx(0.22, 0.94, 0.2, 0.06);
    b.ln(0.08, 1, 0.56, 1, 3);
  },

  pile(b, o) {
    // a heap of the same memory sticks as 'ram' (board, four black chips, gold teeth), biggest at the bottom
    const board = o.body(C.green);
    const r = rng(`${b.seed}/pile`);
    // sticks stay ram-sized (at most 130 px wide): a pile wider than ~460 px gets MORE sticks, not bigger ones, so a
    // worm's-eye mountain that runs past both frame edges still reads as countless sticks (v3 G3 S9b)
    const unit = Math.min(b.w, 130 / 0.28);
    const sw = 0.28 * unit;
    const sh = 0.085 * unit;
    const stick = (cx: number, cy: number, deg: number) => {
      const a = (deg * Math.PI) / 180;
      const T = (lx: number, ly: number): Pt => [cx + lx * Math.cos(a) - ly * Math.sin(a), cy + lx * Math.sin(a) + ly * Math.cos(a)];
      const quad = (x0: number, y0: number, x1: number, y1: number) => polyPath([T(x0, y0), T(x1, y0), T(x1, y1), T(x0, y1)]);
      b.part();
      const outline = [T(-sw / 2, -sh / 2), T(sw / 2, -sh / 2), T(sw / 2, sh / 2), T(-sw / 2, sh / 2)];
      b.paint(polyPath(outline), board);
      for (let k = 0; k < 10; k++) b.paint(quad(sw * (-0.46 + k * 0.093), sh * 0.2, sw * (-0.46 + k * 0.093 + 0.06), sh * 0.47), C.gold);
      for (let k = 0; k < 4; k++) b.paint(quad(sw * (-0.43 + k * 0.225), -sh * 0.36, sw * (-0.43 + k * 0.225 + 0.17), sh * 0.1), C.darker);
      b.ink(poly(outline, {seed: b.sd(), closed: true, over: b.ov(sh), ...b.pen}), 3.5);
    };
    // a taller box makes a taller mountain: rows stack 0.09 unit apart, each narrower than the one below
    const nRows = Math.max(2, Math.round((b.h - 0.2 * unit) / (0.09 * unit)) + 1);
    for (let i = 0; i < nRows; i++) {
      const span = 0.94 - (i * 0.76) / (nRows - 1);
      const n = Math.max(1, Math.round((span * b.w) / (0.188 * unit)));
      for (let k = 0; k < n; k++) {
        const u = 0.5 - span / 2 + ((k + 0.5) * span) / n + r.jitter((0.02 * unit) / b.w);
        const cy = b.h - 0.06 * unit - i * 0.09 * unit + r.jitter(0.01 * unit);
        const deg = i === 0 ? r.range(-8, 8) : r.range(8, 28) * r.sign();
        stick(b.X(u), b.y + cy, deg);
      }
    }
    b.part();
    b.ln(-0.03, 1, 1.03, 1, 3);
  },

  // ---------------------------------------------------------------- added for v2 (2026-10-26): documents, desk
  // props, the nook (shelf, window, lamp, mug, box), the Pentagon from a high 3/4 angle with its car-lot ruler.

  page(b, o) {
    // A sheet lying on a surface, seen from slightly above (its top edge a little narrower). text = its rows, one per
    // line, "v|kind|content": v = the row's centre (0..1 down the sheet); kind '#NN' bold header centred (NN px),
    // '^NN' words centred, '>NN' words from the left margin, '~' a handwriting squiggle (content = its width 0..1),
    // '-' a plain rule, '@' a signed rule (rule + signature), 'm' the side margin for the rows after it (default 0.08),
    // '=' a highlighter band behind the row (content "frac|px": its width 0..1 of the text area, its height in px; it
    // sits under the words, so they stay readable). No text: a short heading rule, 6 squiggles, a signature.
    const paper = o.body(C.white);
    const k = 0.035;
    const shape: Pt[] = [[k, 0], [1 - k, 0], [1, 1], [0, 1]];
    b.fPl(shape, paper);
    b.pl(shape);
    const r = rng(`${b.seed}/page`);
    const amp = Math.min(7, 0.014 * b.w);
    const squiggle = (u0: number, u1: number, v: number) => {
      const n = Math.max(4, Math.round(((u1 - u0) * b.w) / 24));
      const pts: Pt[] = [];
      for (let i = 0; i <= n; i++) pts.push([b.X(u0 + ((u1 - u0) * i) / n), b.Y(v) + (i % 2 ? -1 : 1) * r.range(0.3, 1) * amp]);
      b.ink(smooth(pts), 2.5);
    };
    const signature = (u0: number, v: number) => {
      const s = 0.05 * b.w;
      const x0 = b.X(u0 + 0.02);
      const y0 = b.Y(v) - 0.25 * s;
      const pts: Pt[] = [[0, 0], [0.5, -1.2], [0.9, -0.2], [0.7, 0.3], [1.3, -0.9], [1.8, 0.1], [2.3, -1], [2.6, 0], [3.4, -0.6], [4.4, -0.3]];
      b.ink(smooth(pts.map(([x, y]): Pt => [x0 + x * s, y0 + y * s])), 3);
    };
    const rows = o.text ?? '0.1|-|0.4\n0.24|~|0.85\n0.34|~|0.9\n0.44|~|0.8\n0.54|~|0.9\n0.64|~|0.85\n0.86|@|0.45';
    let margin = 0.08;
    for (const row of rows.split('\n')) {
      const [vs, kind = '', ...rest] = row.split('|');
      const v = parseFloat(vs);
      if (kind === 'm') margin = Math.max(0.02, Math.min(0.3, parseFloat(rest[0]) || 0.08)); // '0|m|0.05': the side margin from here on
      if (!Number.isFinite(v) || !kind || kind === 'm') continue;
      const content = rest.join('|');
      const inset = k * (1 - v);
      const L = margin + inset;
      const R = 1 - margin - inset;
      const size = parseFloat(kind.slice(1));
      const frac = Math.max(0.05, Math.min(1, parseFloat(content) || 0.85));
      if (kind[0] === '#' || kind[0] === '^') b.say(0.5, v, content, Number.isFinite(size) ? size : b.fit(content, (R - L) * b.w, 0.09 * b.h));
      else if (kind[0] === '>') b.say(L, v, content, Number.isFinite(size) ? size : b.fit(content, (R - L) * b.w, 0.06 * b.h), LEAD, {anchor: 'start'});
      else if (kind[0] === '~') squiggle(L, L + (R - L) * frac, v);
      else if (kind[0] === '-') b.ln(L, v, L + (R - L) * frac, v, 2.5);
      else if (kind[0] === '=') {
        const hh = (parseFloat(rest[1]) || 0.06 * b.h) / b.h;
        b.fBx(L - 0.01, v - hh / 2, (R - L) * frac + 0.02, hh, C.smoke);
      }
      else if (kind[0] === '@') {
        b.ln(L, v, L + (R - L) * frac, v, 2.5);
        signature(L, v);
      }
    }
  },

  stamp(b, o) {
    // a rubber-stamp impression, slightly tilted: a double rounded border and its words (text) in stamp ink (body)
    const ink = o.body(C.dark) ?? LEAD;
    b.rotate = -6;
    b.fRr(0.01, 0.03, 0.98, 0.94, 0.06, C.white, 0.9);
    b.rr(0.01, 0.03, 0.98, 0.94, 0.06, 4, ink);
    b.rr(0.05, 0.14, 0.9, 0.72, 0.04, 3, ink);
    if (o.text) b.say(0.5, 0.5, o.text, b.fit(o.text, 0.8 * b.w, 0.52 * b.h), ink);
  },

  badge(b, o) {
    // a work ID badge on its lanyard: the strap loop, a clip, the card with a photo square and a name (text)
    const card = o.body(C.white);
    b.ink(smooth(([[0.5, 0.4], [0.22, 0.24], [0.16, 0.07], [0.32, 0.0], [0.68, 0.0], [0.84, 0.07], [0.78, 0.24], [0.5, 0.4]] as Pt[]).map(b.P)), 4);
    b.fBx(0.43, 0.37, 0.14, 0.08, C.steel);
    b.bx(0.43, 0.37, 0.14, 0.08, 3);
    b.part();
    b.fRr(0.08, 0.44, 0.84, 0.54, 0.07, card);
    b.rr(0.08, 0.44, 0.84, 0.54, 0.07);
    b.fBx(0.17, 0.51, 0.28, 0.25, C.steel);
    b.bx(0.17, 0.51, 0.28, 0.25, 3);
    b.ln(0.53, 0.57, 0.83, 0.57, 2.5);
    b.ln(0.53, 0.66, 0.75, 0.66, 2.5);
    if (o.text) b.say(0.5, 0.87, o.text, b.fit(o.text, 0.74 * b.w, 0.13 * b.h));
    else b.ln(0.17, 0.87, 0.83, 0.87, 2.5);
  },

  mic(b, o) {
    // a desk microphone: a round-ended capsule with grille lines (body) on a short stand with a flat base
    const body = o.body(C.dark);
    b.fRr(0.14, 0.9, 0.72, 0.09, 0.045, C.steel);
    b.rr(0.14, 0.9, 0.72, 0.09, 0.045);
    b.ln(0.5, 0.9, 0.5, 0.46);
    b.part();
    b.fRr(0.27, 0.02, 0.46, 0.46, 0.23, body);
    b.rr(0.27, 0.02, 0.46, 0.46, 0.23);
    for (const v of [0.15, 0.23, 0.31]) b.ln(0.33, v, 0.67, v, 2.5, C.silver);
  },

  lamp(b, o) {
    // a desk lamp: round base, a two-part arm, a cone shade opening down to the right (body = the shade)
    const shade = o.body(C.cream);
    b.fRr(0.06, 0.9, 0.44, 0.09, 0.045, C.steel);
    b.rr(0.06, 0.9, 0.44, 0.09, 0.045);
    b.pl([[0.28, 0.9], [0.18, 0.5], [0.56, 0.14]], false);
    b.part();
    const cone: Pt[] = [[0.48, 0.08], [0.7, 0.0], [0.98, 0.42], [0.6, 0.54]];
    b.fPl(cone, shade);
    b.pl(cone);
  },

  mug(b, o) {
    // a mug of something hot (a sign of care): two steam curls, the handle, the body
    const body = o.body(C.cream);
    for (const u of [0.28, 0.5]) b.ink(smooth(([[u, 0.32], [u - 0.06, 0.22], [u + 0.02, 0.12], [u - 0.04, 0.02]] as Pt[]).map(b.P)), 2.5);
    b.part();
    b.ink(smooth(([[0.7, 0.5], [0.94, 0.52], [0.94, 0.78], [0.7, 0.84]] as Pt[]).map(b.P)), 4);
    b.fRr(0.08, 0.38, 0.64, 0.6, 0.08, body);
    b.rr(0.08, 0.38, 0.64, 0.6, 0.08);
    b.ln(0.08, 0.46, 0.72, 0.46, 2.5);
  },

  pentagon(b, o) {
    // the Pentagon from a high 3/4 angle: the near facades under the outer edge, five rings of roof (body) round the
    // courtyard, and the corner corridors that make the shape unmistakable
    const roof = o.body(C.silver);
    const cx = b.X(0.5);
    const cy = b.Y(0.43);
    const R = 0.49 * b.w;
    const sq = Math.min(0.62, (0.82 * b.h) / (2 * R));
    const fh = 0.13 * b.h;
    const ang = [-90, -18, 54, 126, 198].map((a) => (a * Math.PI) / 180);
    const ring = (f: number): Pt[] => ang.map((a): Pt => [cx + Math.cos(a) * R * f, cy + Math.sin(a) * R * f * sq]);
    const outer = ring(1);
    const shut = (pts: Pt[], w: number) => b.ink(poly(pts, {seed: b.sd(), closed: true, over: b.ov(40), ...b.pen}), w);
    for (const i of [1, 2, 3]) {
      const p = outer[i];
      const q = outer[(i + 1) % 5];
      const face: Pt[] = [p, q, [q[0], q[1] + fh], [p[0], p[1] + fh]];
      b.paint(polyPath(face), C.steel);
      shut(face, 4);
    }
    b.part();
    b.paint(polyPath(outer), roof);
    shut(outer, 4);
    for (const f of [0.82, 0.64]) shut(ring(f), 2.5);
    const court = ring(0.44);
    for (let i = 0; i < 5; i++) b.ink(line(court[i][0], court[i][1], outer[i][0], outer[i][1], {seed: b.sd(), over: b.ov(40), ...b.pen}), 2.5);
    b.paint(polyPath(court), C.white);
    shut(court, 3);
    b.fBx(0.46, 0.41, 0.08, 0.05, C.steel);
  },

  lot(b, o) {
    // a parking lot seen from high up: two rows of tiny parked cars, the ruler for a colossal building
    const tar = o.body(C.smoke);
    b.fBx(0, 0, 1, 1, tar);
    const r = rng(`${b.seed}/lot`);
    const cw = 0.042;
    for (const v of [0.12, 0.56]) {
      for (let u = 0.04; u + cw < 0.97; u += cw + 0.024) if (!r.chance(0.22)) b.fRr(u, v, cw, 0.28, 0.014, C.steel);
    }
  },

  speech(b, o) {
    // a speech bubble; pts[0] = the tail's tip in box units (default: below the bottom-left); text: none = three
    // speech lines, ' ' = empty, anything else = those words
    const fill = o.body(C.white);
    const tip: Pt = o.pts?.[0] ?? [0.14, 1.04];
    const cu = 0.5;
    const cv = 0.44;
    const ru = 0.49;
    const rv = 0.42;
    const a0 = Math.atan2((tip[1] - cv) / rv, (tip[0] - cu) / ru);
    const pts: Pt[] = [tip];
    const N = 34;
    for (let i = 0; i <= N; i++) {
      const a = a0 + 0.24 + ((2 * Math.PI - 0.48) * i) / N;
      pts.push([cu + ru * Math.cos(a), cv + rv * Math.sin(a)]);
    }
    b.fPl(pts, fill);
    b.pl(pts);
    if (o.text === undefined) {
      for (const [v, w] of [[0.3, 0.56], [0.44, 0.66], [0.58, 0.4]]) b.ln(0.5 - w / 2, v, 0.5 + w / 2, v);
    } else if (o.text.trim()) b.say(0.5, 0.44, o.text, b.fit(o.text, 0.7 * b.w, 0.3 * b.h));
  },

  bookshelf(b, o) {
    // a bookcase: the frame (body), three shelves, books of uneven heights with a few gaps
    const wood = o.body(C.cream);
    b.fBx(0, 0, 1, 1, wood);
    const r = rng(`${b.seed}/books`);
    for (const base of [0.245, 0.495, 0.745, 0.985]) {
      let u = 0.06;
      while (u < 0.9) {
        const bw = r.range(0.08, 0.14);
        const bh = r.range(0.13, 0.2);
        if (u + bw > 0.94) break;
        b.fBx(u, base - bh, bw, bh, r.chance(0.5) ? C.smoke : C.steel);
        b.bx(u, base - bh, bw, bh, 2.5);
        u += bw + 0.012 + (r.chance(0.18) ? 0.1 : 0);
      }
    }
    b.part();
    b.bx(0, 0, 1, 1);
    for (const v of [0.25, 0.5, 0.75]) b.ln(0, v, 1, v);
  },

  window(b, o) {
    // the room's one opening: the pane (body), two flat far roofs at its foot (text ' ' = none), a cross mullion, the sill
    const pane = o.body(C.glass);
    b.fBx(0, 0, 1, 0.93, pane);
    if (o.text !== ' ') {
      b.fPl([[0, 0.93], [0, 0.73], [0.2, 0.73], [0.2, 0.66], [0.38, 0.66], [0.38, 0.93]], C.steel);
      b.fPl([[0.6, 0.93], [0.6, 0.77], [0.82, 0.77], [0.82, 0.71], [1, 0.71], [1, 0.93]], C.steel);
    }
    b.bx(0, 0, 1, 0.93);
    b.ln(0.5, 0, 0.5, 0.93);
    b.ln(0, 0.46, 1, 0.46);
    b.fBx(-0.05, 0.93, 1.1, 0.07, C.cream);
    b.bx(-0.05, 0.93, 1.1, 0.07, 3);
  },

  box(b, o) {
    // an open cardboard box from slightly above: two flaps out, the shadowed inside, the front (body) with its tape
    const card = o.body(C.cream);
    const flapL: Pt[] = [[0.04, 0.34], [0.16, 0.18], [-0.04, 0.02], [-0.12, 0.22]];
    const flapR: Pt[] = [[0.96, 0.34], [0.84, 0.18], [1.04, 0.04], [1.12, 0.24]];
    b.fPl(flapL, card);
    b.pl(flapL);
    b.fPl(flapR, card);
    b.pl(flapR);
    b.part();
    const inside: Pt[] = [[0.04, 0.34], [0.96, 0.34], [0.84, 0.18], [0.16, 0.18]];
    b.fPl(inside, C.steel);
    b.pl(inside);
    b.fBx(0.04, 0.34, 0.92, 0.64, card);
    b.bx(0.04, 0.34, 0.92, 0.64);
    b.ln(0.5, 0.34, 0.5, 0.56, 2.5);
  },

  stonewall(b, o) {
    // a low stone wall (the rise-over ledge): a coping band on top, staggered block joints (body = the stone)
    const stone = o.body(C.concrete);
    b.fBx(0, 0.1, 1, 0.9, stone);
    b.fBx(-0.01, 0, 1.02, 0.1, C.smoke);
    for (let k = 0; k < 4; k++) {
      const v = 0.1 + k * 0.225;
      if (k) b.ln(0, v, 1, v, 2.5);
      for (let u = k % 2 ? 0.05 : 0.12; u < 0.98; u += 0.14) b.ln(u, v, u, v + 0.225, 2.5);
    }
    b.bx(-0.01, 0, 1.02, 0.1);
  },

  nodes(b, o) {
    // an AI network doodle: a hub (text = its word, e.g. "AI") linked to six nodes in a ring
    const node = o.body(C.white);
    const ringPts: Pt[] = [[0.12, 0.26], [0.5, 0.09], [0.88, 0.26], [0.88, 0.74], [0.5, 0.91], [0.12, 0.74]];
    ringPts.forEach((p, i) => {
      const q = ringPts[(i + 1) % 6];
      b.ln(0.5, 0.5, p[0], p[1], 3);
      b.ln(p[0], p[1], q[0], q[1], 2.5);
    });
    b.part();
    for (const p of ringPts) {
      b.fCi(p[0], p[1], 0.05, node);
      b.ci(p[0], p[1], 0.05, 3);
    }
    b.fCi(0.5, 0.5, 0.16, node);
    b.ci(0.5, 0.5, 0.16);
    if (o.text) b.say(0.5, 0.5, o.text, b.fit(o.text, 0.24 * b.w, 0.3 * b.h));
  },

  cars(b, o) {
    // a row of identical parked cars seen from high up (the scale ruler under a colossal building, ISOTYPE-style): each
    // a rounded body, a glass cabin on top and two wheels, with gaps between them and a few empty bays (a tight grid of
    // boxes read as a keyboard); text = how many bays (default: as many as fit at about 2.6 x the height each)
    const body = o.body(C.silver);
    const n = Math.max(1, parseInt(o.text ?? '', 10) || Math.round(b.w / (2.6 * b.h)));
    const slot = 1 / n;
    const r = rng(`${b.seed}/cars`);
    for (let i = 0; i < n; i++) {
      if (i % 7 === 3 || r.chance(0.1)) continue;
      const u0 = i * slot + 0.2 * slot;
      const cw = 0.6 * slot;
      const cabin: Pt[] = [[u0 + 0.2 * cw, 0.04], [u0 + 0.8 * cw, 0.04], [u0 + 0.94 * cw, 0.44], [u0 + 0.06 * cw, 0.44]];
      for (const wu of [0.08, 0.7]) b.fBx(u0 + wu * cw, 0.8, 0.22 * cw, 0.2, C.dark);
      b.fRr(u0, 0.36, cw, 0.5, 0.22 * cw, body);
      b.fPl(cabin, C.steel);
      b.rr(u0, 0.36, cw, 0.5, 0.22 * cw, 3);
      b.pl(cabin, true, 3);
    }
  },

  marker(b, o) {
    // a highlighter lying diagonally, its chisel tip at the box's bottom-left corner (body = the barrel)
    const barrel = o.body(C.dark);
    const T = b.P([0, 1]);
    const E = b.P([1, 0]);
    const L = Math.hypot(E[0] - T[0], E[1] - T[1]);
    const ux = (E[0] - T[0]) / L;
    const uy = (E[1] - T[1]) / L;
    const at = (s: number, k: number): Pt => [T[0] + (ux * s - uy * k) * L, T[1] + (uy * s + ux * k) * L];
    const hw = 0.08;
    const tip = [at(0, -0.015), at(0, 0.015), at(0.13, hw * 0.7), at(0.13, -hw * 0.7)];
    const body = [at(0.13, -hw), at(0.13, hw), at(0.78, hw), at(0.78, -hw)];
    const cap = [at(0.78, -hw * 0.95), at(0.78, hw * 0.95), at(1, hw * 0.85), at(1, -hw * 0.85)];
    b.paint(polyPath(tip), C.steel);
    b.paint(polyPath(body), barrel);
    b.paint(polyPath(cap), C.steel);
    for (const q of [tip, body, cap]) b.ink(poly(q, {seed: b.sd(), closed: true, over: b.ov(2 * hw * L), ...b.pen}), 4);
  },
};

export type IconProps = {
  name: IconName | string;
  x: number;
  y: number;
  w: number;
  h?: number;
  /** resolved body colour: undefined = the icon's own, null = none */
  fill?: string | null;
  text?: string;
  label?: string;
  pts?: [number, number][];
  seed: string;
  /** stroke draw-on progress 0..1 (strokes draw one after another across the whole icon) */
  drawU: number;
  /** fill opacity 0..1 */
  fillO: number;
  /** seconds since the shot start (blinking server lights) */
  t: number;
  /** board mode (STORYBOARD_STYLE §6): tones, tier line weights, no blinking, `tone` = the plane step; omitted = the
   *  sketch look */
  board?: {role: ToneRole; sw?: number; tone?: (hex: string) => string};
};

export const SketchIcon: React.FC<IconProps> = ({name, x, y, w, h, fill, text, label, pts, seed, drawU, fillO, t, board}) => {
  const hh = h ?? w * (ICON_ASPECT[name as IconName] ?? 1);
  const ptsKey = pts ? JSON.stringify(pts) : '';
  const role = board?.role;
  const sw = board?.sw;
  const plane = board?.tone ?? ((c: string) => c);
  const built = useMemo(() => {
    const b = new Ico(x, y, w, hh, seed, role ? {role, sw} : undefined);
    const body = (def: string | null) => (fill === null ? null : fill ?? def);
    (ICONS[name as IconName] ?? ICONS.chip)(b, {body, text, pts, board: !!role});
    const total = b.parts.reduce((n, p) => n + p.strokes.reduce((m, s) => m + s.subs.length, 0), 0);
    return {parts: b.parts, rotate: b.rotate, total};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, x, y, w, hh, fill, text, ptsKey, seed, role, sw]);
  const line = role ? roleLine(role, sw) : null;
  const tone = (c: string, o?: number) => (role ? plane(boardTone(c, role, o)) : c);
  const strokeOf = (s: Stroke) => {
    if (!role || !line) return {c: s.c ?? LEAD, w: s.w};
    const c = s.c === undefined || s.c === LEAD ? plane(line.c) : tone(s.c);
    return {c, w: s.k === 'o' ? line.w : s.k === 'm' ? (role === 'far' || role === 'env' ? 3 : 5) : 3};
  };
  const textC = (c: string) => (!role ? c : plane(c === LEAD ? (role === 'far' ? BOARD.mid : role === 'env' ? BOARD.light : BOARD.ink)
    : boardTone(c, role === 'env' ? 'env' : 'subject')));

  const textO = Math.max(0, Math.min(1, (drawU - 0.85) / 0.15));
  let k = 0;
  const out: React.ReactNode[] = [];
  built.parts.forEach((p, pi) => {
    p.fills.forEach((f, fi) => {
      if (fillO <= 0) return;
      if (role) {
        out.push(<path key={`f${pi}-${fi}`} d={f.d} fill={tone(f.c, f.o)} opacity={fillO} />);
        return;
      }
      const blink = f.blink === undefined ? 1 : Math.floor(t * 2.6 + f.blink * 11) % 4 === 0 ? 0.25 : 1;
      out.push(<path key={`f${pi}-${fi}`} d={f.d} fill={f.c} opacity={fillO * (f.o ?? 1) * blink} />);
    });
    p.strokes.forEach((s, si) => {
      const sc = strokeOf(s);
      const style = {stroke: sc.c, strokeWidth: sc.w, fill: 'none', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const};
      if (drawU >= 1) {
        out.push(<path key={`s${pi}-${si}`} d={s.d} {...style} />);
        return;
      }
      s.subs.forEach((sp, j) => {
        const v = Math.max(0, Math.min(1, drawU * built.total - (k + j)));
        if (v > 0) out.push(<path key={`s${pi}-${si}-${j}`} d={sp} {...style} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - v} />);
      });
      k += s.subs.length;
    });
    p.texts.forEach((tx, ti) => {
      if (textO <= 0) return;
      const common = {x: tx.x, y: tx.y, fontSize: tx.size, fontWeight: 700, textAnchor: tx.anchor, fontFamily: captionFontStack};
      if (tx.onFill) {
        if (fillO < 1) out.push(<text key={`tl${pi}-${ti}`} {...common} fill={textC(LEAD)} opacity={textO * (1 - fillO)}>{tx.s}</text>);
        if (fillO > 0) out.push(<text key={`t${pi}-${ti}`} {...common} fill={textC(tx.c)} opacity={textO * fillO}>{tx.s}</text>);
      } else out.push(<text key={`t${pi}-${ti}`} {...common} fill={textC(tx.c)} opacity={textO}>{tx.s}</text>);
    });
  });
  return (
    <>
      <g transform={built.rotate ? `rotate(${built.rotate} ${x + w / 2} ${y + hh / 2})` : undefined}>{out}</g>
      {label && role ? (
        <text x={x + w / 2} y={y + hh + 64} fontSize={60} fill={plane(BOARD.ink)} textAnchor="middle" fontFamily={captionFontStack}>{label}</text>
      ) : label ? (
        <text x={x + w / 2} y={y + hh + 46} fontSize={34} fill={MUTED} textAnchor="middle" fontFamily={captionFontStack}>{label}</text>
      ) : null}
    </>
  );
};
