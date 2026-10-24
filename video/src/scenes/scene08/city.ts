// S08 world geometry (canvas px at camera rest), built once at module level.
//
// This is the v3 re-staging of DomeCity (docs/storyboard_v3.md S08 + the sets request "DomeCity: `dome` prop to re-scale
// the dome to one far district"): four city rows with VISIBLE STREETS (the hooded attempters stand at doors), a glass
// dome over ONE far district (feet (180, 1112) / (600, 1112), apex (390, 830): ~1/5 of the city), a lattice watchtower at
// its right foot silhouetted against the r260 sun, our rooftop parapet with a chimney cut by the left edge, the antenna on
// the right, and a telephone pole at x 540 where WIRES.S08 end (the S07 match). Local stand-in until the sets lane ships
// the re-scaled DomeCity (task #51); the anchors below are what the scene choreography reads.

import {palette} from '../../lib/theme';
import {line, polyPath, rect, rectPath, Pt} from '../../lib/sketch';
import {rng} from '../../lib/rng';
import {HALF} from '../shared/sets/common';

export type R4 = [number, number, number, number];

// ---------------------------------------------------------------- layout (world @ rest)

export const HORIZON = 1000;
/** Multiplane parallax factors f = 1 - depth (0 = sky, 1 = our parapet). Chosen so that on the crane's first frame
 *  (camera (540, 1260) zoom 1.3) every row's roofline sits on the skyline the sun is half behind (the S07 match), and
 *  row 3 is still mostly behind our parapet: the crane then opens the city row by row. */
export const F = {row0: 0.03, row1: 0.08, row2: 0.25, row3: 0.62, near: 1} as const;
export const DEPTH = {row0: 1 - F.row0, row1: 1 - F.row1, row2: 1 - F.row2, row3: 1 - F.row3, near: 0} as const;

export type RowSpec = {
  top: [number, number];
  base: number;
  /** Visible street band below the base (the next row starts here). */
  street: number;
  /** Width scale of the buildings (far rows narrower). */
  s: number;
  cols: string[];
  /** Taller accents: [x0, x1, top]. */
  towers?: [number, number, number][];
  /** Keep tops at or below y inside these x ranges (the street in front of the dome stays visible). */
  low?: [number, number, number][];
  win: number;
};

export const ROW: RowSpec[] = [
  {top: [988, 1012], base: 1042, street: 12, s: 0.32, cols: [HALF.sand, palette.sand, HALF.sand], towers: [[-120, -86, 948], [40, 66, 962], [262, 290, 936], [468, 494, 952], [818, 846, 942], [960, 990, 958], [1130, 1160, 950]], win: 3},
  {top: [1054, 1080], base: 1112, street: 14, s: 0.45, cols: [palette.sand, palette.sand, HALF.sand], towers: [[110, 142, 1030], [660, 700, 1026], [930, 966, 1034]], win: 4},
  {top: [1132, 1196], base: 1260, street: 16, s: 0.7, cols: [palette.tan, palette.sage, palette.sand, palette.tan], towers: [[880, 960, 1104], [-60, 10, 1110]], low: [[140, 500, 1150]], win: 6},
  {top: [1282, 1346], base: 1420, street: 40, s: 1, cols: [palette.tan, palette.teal, palette.sand, palette.tan, palette.sage], towers: [[560, 690, 1236]], low: [[40, 470, 1300]], win: 9},
];
/** The street band (ground) colour per row: pale ground (mintPale relights to cream at golden). */
export const STREET = [HALF.sand, palette.cream, palette.mintPale, palette.mintPale];

/** Feet lines of each row's street (where its people stand). */
export const FEET = ROW.map((r) => r.base + Math.min(r.street * 0.55, 10));

// the dome: one far district on rows 0-1 (feet on row 1's base)
export const DOME = {cx: 390, by: 1112, rx: 210, ry: 282, apex: [390, 830] as Pt, feet: [[180, 1112], [600, 1112]] as Pt[]};
export function domeY(x: number): number {
  const u = (x - DOME.cx) / DOME.rx;
  if (Math.abs(u) > 1) return NaN;
  return DOME.by - DOME.ry * Math.sqrt(1 - u * u);
}
export const inDome = (x: number, y: number) => {
  const u = (x - DOME.cx) / DOME.rx;
  const v = (DOME.by - y) / DOME.ry;
  return y < DOME.by && u * u + v * v < 1;
};

// watchtower at the dome's right foot (row-1 layer), silhouetted against the sun
export const TOWER = {x0: 606, x1: 648, base: 1114, top: 916, cabin: [596, 880, 62, 40] as R4, light: [597, 900] as Pt};

// near layer
export const PARAPET = {top: [1452, 1440] as [number, number], coping: 22, face: 1600};
export const copingY = (x: number) => PARAPET.top[0] + ((PARAPET.top[1] - PARAPET.top[0]) * (x + 160)) / 1400;
export const BOARD: R4 = [430, 1080, 460, 360];
export const POLE = {x: 540, top: 1192};
export const PIP: Pt = [915, copingY(915)];

/** Row-3 doors (left of the board) and row-2 doors across the width (the attempters' slots). */
export const DOORS3 = [70, 122, 174, 226, 278, 330, 382].map((x) => [x, FEET[3] - 2] as Pt);
export const DOORS3_RIGHT = [948, 1006].map((x) => [x, FEET[3] - 2] as Pt);
export const DOORS2 = [52, 168, 300, 452, 596, 740, 872, 1010].map((x) => [x, FEET[2] - 1] as Pt);

// ---------------------------------------------------------------- telephone wires (S07 -> S08 match)

/** The three wires: at the pole (x 540) y 1211 / 1235.5 / 1260 (= screen 896 / 928 / 960 on the crane's first frame,
 *  the S07 tilt's last frame), rising gently to the left (toward the city) and to the right. */
export const WIRE_Y = [1211, 1235.5, 1260];
function wireCtrlL(i: number): [Pt, Pt, Pt] {
  const y = WIRE_Y[i];
  return [[-300, y - 64 + i * 4], [140, y + 12], [POLE.x, y]];
}
function wireCtrlR(i: number): [Pt, Pt, Pt] {
  const y = WIRE_Y[i];
  return [[POLE.x, y], [920, y + 8], [1380, y - 96 - i * 6]];
}
const qb = (a: Pt, c: Pt, b: Pt, u: number): Pt => [(1 - u) * (1 - u) * a[0] + 2 * u * (1 - u) * c[0] + u * u * b[0], (1 - u) * (1 - u) * a[1] + 2 * u * (1 - u) * c[1] + u * u * b[1]];
/** Point on wire i at x (left span only; x <= 540): solves the Bezier's x by bisection. */
export function wireAtX(i: number, x: number): Pt {
  const [a, c, b] = x <= POLE.x ? wireCtrlL(i) : wireCtrlR(i);
  let lo = 0;
  let hi = 1;
  for (let k = 0; k < 24; k++) {
    const m = (lo + hi) / 2;
    if (qb(a, c, b, m)[0] < x) lo = m;
    else hi = m;
  }
  return qb(a, c, b, (lo + hi) / 2);
}
export const WIRES_D = [0, 1, 2]
  .map((i) => {
    const [a, c, b] = wireCtrlL(i);
    const [a2, c2, b2] = wireCtrlR(i);
    return `M${a[0]} ${a[1]}Q${c[0]} ${c[1]} ${b[0]} ${b[1]}M${a2[0]} ${a2[1]}Q${c2[0]} ${c2[1]} ${b2[0]} ${b2[1]}`;
  })
  .join('');

// ---------------------------------------------------------------- city rows (batched geometry)

export type RowGeo = {
  fills: {color: string; d: string}[];
  back: {color: string; d: string};
  street: {color: string; d: string};
  ink: string;
  /** Window dots in 4 x-chunks (dusk lights them from the sun outward). */
  dots: string[];
  /** Tiny browser windows (far LOD): screens + title bars. */
  bw: string;
  bars: string;
  /** Real BrowserChrome windows (rows 2-3). */
  chrome: R4[];
  /** Door fills + ink (rows 2-3). */
  doors: string;
  doorInk: string;
};

const inLow = (spec: RowSpec, x0: number, x1: number): number | undefined => {
  for (const [a, b, y] of spec.low ?? []) if (x1 > a && x0 < b) return y;
  return undefined;
};

function buildRow(ri: number): RowGeo {
  const spec = ROW[ri];
  const r = rng(`s08/row${ri}`);
  const cols = spec.cols;
  const byColor = cols.map(() => '');
  let ink = '';
  const dots = ['', '', '', ''];
  let bw = '';
  let bars = '';
  const chrome: R4[] = [];
  let doors = '';
  let doorInk = '';
  const chromeQ = new Set<number>();
  const s = spec.s;
  const ws = spec.win;
  const step = ws * 2.2;
  let x = -280;
  let n = 0;
  while (x < 1360) {
    let w = r.range(70, 160) * s;
    let top = r.range(spec.top[0], spec.top[1]);
    const tower = (spec.towers ?? []).find(([a, b]) => x + w > a && x < b);
    if (tower && r.chance(1)) {
      // a taller accent sits exactly on its slot
      if (x < tower[0]) {
        w = Math.max(10, tower[0] - x);
      } else {
        w = tower[1] - x;
        top = tower[2];
      }
    }
    const lowY = inLow(spec, x, x + w);
    if (lowY !== undefined) top = Math.max(top, lowY + r.range(0, 30));
    const ci = n % cols.length === 0 ? r.int(0, cols.length - 1) : (n * 7 + r.int(0, 2)) % cols.length;
    const roof = r.next();
    let d = rectPath(x, top, w, spec.base - top);
    if (ri >= 2 && roof < 0.2 && w > 50) d += polyPath([[x - 2, top], [x + w / 2, top - w * 0.3], [x + w + 2, top]]);
    if (ri >= 2 && roof > 0.84) d += rectPath(x + w * 0.22, top - 14 * s, w * 0.56, 15 * s);
    byColor[ci] += d;
    // a real browser window (rows 2-3): one per x quarter, inside the frame, wide enough to read on a phone
    const q4 = Math.floor(((x + w / 2) / 1080) * 4);
    const cw = Math.min(w * 0.72, ri === 2 ? 70 : 104);
    let cr: R4 | null = null;
    if (ri >= 2 && cw >= 54 && x + w / 2 > 70 && x + w / 2 < 1010 && q4 >= 0 && q4 <= 3 && !chromeQ.has(q4) && r.chance(0.7)) {
      chromeQ.add(q4);
      cr = [x + (w - cw) / 2, top + (spec.base - top) * 0.14, cw, cw * 0.6];
      chrome.push(cr);
    }
    // window dots: a jittered grid (dead column, drop-outs, partial panes)
    if (ri >= 0) {
      const deadCol = r.int(0, 5);
      let col = 0;
      const yEnd = spec.base - ws * (ri >= 2 ? 6.5 : 1.6);
      for (let xx = x + ws; xx < x + w - ws * 1.2; xx += step, col++) {
        if (col === deadCol && w > step * 3) continue;
        for (let yy = top + ws * 1.4; yy < yEnd; yy += step * 1.15) {
          if (cr && xx + ws > cr[0] - 3 && xx < cr[0] + cr[2] + 3 && yy + ws * 1.25 > cr[1] - 3 && yy < cr[1] + cr[3] + 3) continue;
          if (!r.chance(ri === 0 ? 0.35 : 0.55)) continue;
          const chunk = Math.max(0, Math.min(3, Math.floor(((xx + 280) / 1640) * 4)));
          const ww = ws * r.range(0.8, 1.15);
          const hh = ws * 1.25 * r.range(0.85, 1.15);
          const jx = xx + r.jitter(ws * 0.12);
          if (ri >= 2 && r.chance(0.3)) {
            const k = r.range(0.4, 0.7);
            dots[chunk] += rectPath(jx, r.chance(0.5) ? yy : yy + hh * (1 - k), ww, hh * k);
          } else dots[chunk] += rectPath(jx, yy, ww, hh);
        }
      }
    }
    // tiny browser windows (far LOD of the real ones)
    if (ri >= 2 && !cr && w > 44 * s && r.chance(0.45)) {
      const bwW = w * 0.5;
      const bwH = bwW * 0.55;
      const bx = x + w * 0.25;
      const by = top + (spec.base - top) * 0.2;
      if (by + bwH < spec.base - 40 * s) {
        bw += rectPath(bx, by, bwW, bwH);
        bars += rectPath(bx, by, bwW, bwH * 0.24);
      }
    }
    if (ri >= 2) {
      ink += line(x, top, x + w, top, {seed: `s8r${ri}t${n}`, over: 'small', breaks: false}) + line(x, top, x, spec.base, {seed: `s8r${ri}l${n}`, over: [1, 0], breaks: false});
      if (ri === 3 && roof > 0.55 && roof < 0.8 && w > 70) {
        const cx = x + w * r.range(0.25, 0.7);
        if (r.chance(0.5)) {
          byColor[0] += rectPath(cx - 7, top - 24, 14, 25);
          ink += rect(cx - 7, top - 24, 14, 24, {seed: `s8c${n}`, over: 'small', edges: 'tlr'});
        } else {
          byColor[2] += rectPath(cx - 15, top - 38, 30, 28) + polyPath([[cx - 17, top - 38], [cx, top - 50], [cx + 17, top - 38]]);
          ink += rect(cx - 15, top - 38, 30, 28, {seed: `s8w${n}`, over: 'small'}) + line(cx - 11, top - 10, cx - 11, top, {seed: `s8wl${n}`, over: 0}) + line(cx + 11, top - 10, cx + 11, top, {seed: `s8wr${n}`, over: 0});
        }
      }
    }
    x += w + r.range(-3, 2) * s;
    n++;
  }
  // doors (rows 2-3): at the street, the attempters' slots + extra doors along the row
  const doorList: Pt[] = ri === 3 ? [...DOORS3, ...DOORS3_RIGHT, [520, FEET[3] - 2], [610, FEET[3] - 2], [700, FEET[3] - 2], [800, FEET[3] - 2]] : ri === 2 ? [...DOORS2, [236, FEET[2] - 1], [670, FEET[2] - 1], [940, FEET[2] - 1]] : [];
  const dw = ri === 3 ? 30 : 17;
  const dh = ri === 3 ? 66 : 38;
  doorList.forEach(([dx, dy], i) => {
    const top = dy + 2 - dh;
    doors += rectPath(dx - dw / 2, top, dw, dh);
    doorInk += rect(dx - dw / 2, top, dw, dh, {seed: `s8d${ri}/${i}`, edges: 'tlr', over: 'small'}) + `M${(dx + dw * 0.26).toFixed(1)} ${(top + dh * 0.5).toFixed(1)}l0 ${(dh * 0.12).toFixed(1)}`;
  });
  const back = {color: ri === 0 ? cols[0] : ROW[ri].cols[0], d: rectPath(-280, spec.top[1] - 1, 1660, spec.base - spec.top[1] + 1)};
  const nextTop = ri < 3 ? ROW[ri + 1].top[1] + 24 : spec.base + spec.street + 60;
  const street = {color: STREET[ri], d: rectPath(-280, spec.base - 0.5, 1660, nextTop - spec.base + 0.5)};
  return {fills: cols.map((c, i) => ({color: c, d: byColor[i]})), back, street, ink, dots, bw, bars, chrome, doors, doorInk};
}

export const ROWS: RowGeo[] = [0, 1, 2, 3].map(buildRow);

/** The street kerb lines (rows 2-3) in ink: one broken line each. */
export const KERBS = [
  '',
  '',
  line(-280, ROW[2].base + ROW[2].street, 1360, ROW[2].base + ROW[2].street, {seed: 's8k2', over: 0}),
  line(-280, FEET[3] + 4, 1360, FEET[3] + 4, {seed: 's8k3', over: 0}),
];

// ---------------------------------------------------------------- the dome (row-1 layer)

export const DOME_G = (() => {
  const a = DOME;
  const pts = (rx: number, ry: number, from: number, to: number, n = 40) => {
    const p: Pt[] = [];
    for (let i = 0; i <= n; i++) {
      const th = from + ((to - from) * i) / n;
      p.push([a.cx + Math.cos(th) * rx, a.by - Math.sin(th) * ry]);
    }
    return p;
  };
  const toD = (p: Pt[]) => p.map((q, i) => `${i ? 'L' : 'M'}${q[0].toFixed(1)} ${q[1].toFixed(1)}`).join('');
  const leftHalf = toD(pts(a.rx, a.ry, Math.PI, Math.PI / 2));
  const rightHalf = toD(pts(a.rx, a.ry, 0, Math.PI / 2));
  const interior = toD(pts(a.rx, a.ry, 0, Math.PI, 64)) + 'Z';
  // cream rim strip inside the arc, on the sun side (upper right)
  const outer = pts(a.rx - 3, a.ry - 3, Math.PI * 0.12, Math.PI * 0.6, 24);
  const inner = pts(a.rx - 13, a.ry - 13, Math.PI * 0.6, Math.PI * 0.12, 24);
  const rim = toD([...outer, ...inner]) + 'Z';
  // lattice: 4 meridians + 2 parallels (hair)
  let lattice = '';
  for (const k of [-0.62, -0.25, 0.25, 0.62]) {
    const rx = Math.abs(k) * a.rx;
    lattice += toD(pts(rx, a.ry, k < 0 ? Math.PI : 0, Math.PI / 2, 24));
  }
  for (const v of [0.36, 0.7]) {
    const yy = a.by - v * a.ry;
    const half = a.rx * Math.sqrt(1 - v * v);
    lattice += `M${(a.cx - half).toFixed(1)} ${yy.toFixed(1)}Q${a.cx} ${(yy - 16 * (1 - v)).toFixed(1)} ${(a.cx + half).toFixed(1)} ${yy.toFixed(1)}`;
  }
  // 2 glint bars across the glass (long thin diagonal quads), on the sun side
  const bar = (x: number, y: number, L: number, w: number) => polyPath([[x, y], [x + w, y], [x + w + L * 0.42, y - L], [x + L * 0.42, y - L]]);
  const glints = bar(436, 1000, 120, 11) + bar(458, 1004, 90, 5);
  return {leftHalf, rightHalf, interior, rim, lattice, glints};
})();

// ---------------------------------------------------------------- the watchtower (row-1 layer, a tealDark silhouette)

export const TOWER_G = (() => {
  const T = TOWER;
  const leg = (xb: number, xt: number, w: number) => polyPath([[xb - w, T.base], [xb + w, T.base], [xt + w * 0.7, T.top], [xt - w * 0.7, T.top]]);
  let d = leg(T.x0, T.x0 + 8, 2.4) + leg(T.x1, T.x1 - 8, 2.4);
  // cross bracing as thin quads (fill-only silhouette)
  const xl = (y: number) => T.x0 + 8 * ((T.base - y) / (T.base - T.top));
  const xr = (y: number) => T.x1 - 8 * ((T.base - y) / (T.base - T.top));
  const thin = (a: Pt, b: Pt, w = 1.3) => {
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const L = Math.hypot(dx, dy) || 1;
    const nx = (-dy / L) * w;
    const ny = (dx / L) * w;
    return polyPath([[a[0] + nx, a[1] + ny], [b[0] + nx, b[1] + ny], [b[0] - nx, b[1] - ny], [a[0] - nx, a[1] - ny]]);
  };
  for (let y = T.base - 6, i = 0; y > T.top + 20; y -= 36, i++) {
    const y2 = y - 36;
    d += thin([xl(y), y], [xr(y), y], 1.1);
    d += i % 2 ? thin([xl(y), y], [xr(Math.max(T.top, y2)), Math.max(T.top, y2)]) : thin([xr(y), y], [xl(Math.max(T.top, y2)), Math.max(T.top, y2)]);
  }
  const [cx, cy, cw, ch] = T.cabin;
  const cabin = rectPath(cx, cy + 8, cw, ch - 8) + polyPath([[cx - 6, cy + 9], [cx + cw / 2, cy - 6], [cx + cw + 6, cy + 9]]) + rectPath(cx - 4, cy + ch - 2, cw + 8, 5);
  const slot = rectPath(cx + 7, cy + 15, cw - 14, 12);
  return {frame: d + cabin, slot};
})();
