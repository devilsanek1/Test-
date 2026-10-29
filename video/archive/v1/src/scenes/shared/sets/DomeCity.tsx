// DomeCity — S7 (S08 "the dome and the flood", PEAK 2, the film's only rooftop vista). Canvas coords at S08 rest.
//
// An endless city of websites in four rows on the golden atmosphere ladder (sky cream -> row 0 half-sand / sand
// fill-only on the horizon y 1000 with a small TERRACED-HILL silhouette far left (S10 set-up) -> row 1 sand fill-only
// with window dots -> row 2 tan / sage with ink 1.6-2.2 and tiny browser-window dots -> row 3 near rooftops tan / teal
// with ink 3.4). Every row is BACK-FILLED (the band under its lowest roof, in the colour of the row behind) and the sun
// slot is clipped to y < row 0's base, so nothing behind the city shows below the first skyline. Over ~80 % of it a
// glass shield DOME, mirrored so the action sits left: ONE bold 4.8 ink arc from (260, 1300) over the apex (730, 700)
// to (1200, 1300), drawn from both feet up to the apex; inside it every fill takes the GLASS step (`glassStep`: a full
// step lighter for mid / dark tones, half a step for light ones, so nothing turns paper-white: the glass sky is
// #F9F0E5 on a golden sky), an 8-10 px cream rim strip, 3 white glint bars, 6 meridians + 3 parallels in hair.
// The uncovered strip x 90-260 keeps normal values, with its nearest doors at y 1384-1436 (rattler slots); a dashed
// "big chunk" footprint line along the rooftops. Rows 2-3 carry 6-8 real BrowserChrome windows; the window grids are
// jittered (drop-outs, partial fills). A lattice WATCHTOWER x 160-220 (y 790-1500) rises in: a 124 x 86 cabin with a
// 56 px back-view guard (shoulders, head, peaked cap) in a sage window, a searchlight from (190, 800) (flat cream at a
// FIXED partial opacity, dashed edges, sweeping -20 .. +40 deg; drawn UNDER the dome's ink), a white tally board (the
// tally marks are the <DomeTallies n/> overlay). The near layer is a real ROOFTOP: a parapet cut by both frame edges
// (cream coping 1452 -> 1440, tan face to 1600, our sand deck below), a chimney stack and the antenna (the only tealDark)
// on the coping, Pip's perch (500, 1448) and a back-view observer. Golden -> dusk: windows pop peach from the horizon
// outward on `duskAt`.
//
//   <DomeCity sun={<Sun cx={700} cy={990} r={165}/>} domeAt={36.2} towerAt={37.0} searchAt={37.3}
//     duskAt={42.7} sky="golden" />
//   domeArcY(x) -> the arc's y at x (attempters on the rim), DOME.rattlerDoors, DOME.pip, tallyGatePath(x, y, size)

import React, {useId} from 'react';
import {palette, skies} from '../../../lib/theme';
import {ease as E, prog, useTime} from '../../../lib/time';
import {Ink} from '../../../lib/Ink';
import {Fill} from '../../../lib/Fill';
import {useLook} from '../../../lib/exit';
import {useInkScale} from '../../../lib/inkComp';
import {line, polyPath, rect, rectPath, Pt} from '../../../lib/sketch';
import {mat, XG} from '../../../lib/xf';
import {rng, Seed} from '../../../lib/rng';
import {Glass, glassStep, HALF, LayerWrap, noWrap, SetPlace, SI} from './common';
import {ChromeSlot, OnlookerSlot} from './propSlots';

export const DOME = {
  horizon: 1000,
  band: [880, 1000] as [number, number],
  arc: {cx: 730, by: 1300, rx: 470, ry: 600},
  apex: [730, 700] as Pt,
  feet: [
    [260, 1300],
    [1200, 1300],
  ] as Pt[],
  sun: {x: 700, y: 990, r: 165},
  strip: [90, 260] as [number, number],
  /** The uncovered strip's nearest doors (rattlers stand here), just above the parapet's coping. */
  rattlerDoors: [
    [112, 1436],
    [158, 1432],
    [205, 1430],
    [244, 1428],
  ] as Pt[],
  /** Watchtower: the cabin reads as the figure (a 56 px back-view guard in a 124 x 86 cabin). */
  tower: {x0: 160, x1: 220, top: 790, base: 1500, cabin: [128, 772, 124, 86] as [number, number, number, number], light: [190, 800] as Pt, board: [130, 900, 115, 110] as [number, number, number, number]},
  /** The near PARAPET we stand behind (the only rooftop vista): coping top y at x (sloping 1452 -> 1440), face to 1600. */
  parapet: {top: [1452, 1440] as [number, number], coping: 22, face: 1600},
  /** Pip's perch on the coping (feet), left of the chimney stack. */
  pip: [500, 1448] as Pt,
  /** A back-view observer behind the parapet, looking out at the dome (EdgeOnlooker head centre / diameter). */
  observer: {head: [872, 1372] as Pt, size: 104},
  /** Stipple crowd zone (scene). */
  stipple: [60, 1050, 1060, 1500] as [number, number, number, number],
  rows: [
    {top: [985, 1004], base: 1052},
    {top: [1030, 1066], base: 1120},
    {top: [1080, 1170], base: 1300},
    {top: [1220, 1300], base: 1520},
  ],
  // ---- storyboard v3 (S08 re-staged)
  /** v3 `dome="district"`: the dome over ONE far district (~1/5 of the city): feet (180, 1080) / (600, 1080), apex (390, 830). */
  district: {cx: 390, by: 1080, rx: 210, ry: 250},
  /** v3 sun slot: r260 half-set on the horizon; SunGlowSteps rings at x1.25 / x1.5 (outer top at y 610). */
  sunV3: {x: 700, y: 1000, r: 260, glow: [1.25, 1.5] as [number, number]},
  /** v3 watchtower at the district dome's right foot, silhouetted against the sun (dark cabin, no guard): lattice
   *  x 600-650 from its base on row 1 (y 1100) up to the cabin (600-650 x 892-934, roof apex y 880); the searchlight
   *  sits on the cabin's left side and points at the dome. */
  towerV3: {x0: 600, x1: 650, base: 1100, cabin: [600, 892, 50, 42] as [number, number, number, number], top: 880, light: [598, 910] as Pt},
  /** v3 searchlight: `searchAngle` = degrees BELOW the horizontal, pointing at the dome (left), clamped -10..+25; the cone
   *  is cut so it never rises above world y 800 (screen y >= 600 through the S08 baseline push). */
  searchV3: {clamp: [-10, 25] as [number, number], ceiling: 800, length: 520, half: 7},
  /** v3 rattler doors (feet points; h = the attempter's height there): row 3 (the near rooftops) x 100-460 with
   *  55-70 px figures, their feet just above our coping; row 2 across the width (30-40 px figures) at street level y 1300,
   *  each in front of a LOW row-3 shed so its door and figure show. */
  rattlers: {
    row3: [
      {x: 110, y: 1442, h: 62},
      {x: 195, y: 1441, h: 58},
      {x: 285, y: 1440, h: 70},
      {x: 370, y: 1439, h: 64},
      {x: 455, y: 1438, h: 56},
    ],
    row2: [
      {x: 50, y: 1300, h: 36},
      {x: 210, y: 1300, h: 34},
      {x: 370, y: 1300, h: 38},
      {x: 540, y: 1300, h: 32},
      {x: 720, y: 1300, h: 36},
      {x: 880, y: 1300, h: 40},
    ],
  },
  /** v3 multiplane depths (wrap gets nearness = 1 - depth), TUNED in S08 (scene08/layout.ts `F`): rows 0-1, the dome
   *  and its glass 0.98, row 2 0.75, row 3 0.38, our rooftop 0, the sky and the sun 1 (screen space: it only swells and
   *  sets). Why not the storyboard's 0.85 / 0.7 / 0.45 / 0.2 (`depthsStoryboard`): on the crane's first frame (camera
   *  (540, 1260) zoom 1.3) they lift rows 1-3 over the sun, while the S07 match wants the sun HALF behind the skyline;
   *  with these the far rooftops sit on that skyline at the cut, row 3 stays mostly behind our parapet, the crane opens
   *  the city row by row, and rows 0-1 share the dome's depth so the glass copies stay registered on the dome through
   *  every move (no glass-edge drift under the arc ink). */
  depths: {sky: 1, sun: 1, row0: 0.98, row1: 0.98, dome: 0.98, row2: 0.75, row3: 0.38, fg: 0},
  /** The storyboard's S08 layer depths (superseded by `depths`, kept for reference). */
  depthsStoryboard: {sky: 1, sun: 1, row0: 0.85, row1: 0.7, dome: 0.7, row2: 0.45, row3: 0.2, fg: 0},
} as const;

/** A dome as an ellipse arc (centre x, foot y, half-width, height). */
export type DomeArc = {cx: number; by: number; rx: number; ry: number};
/** 'wide' = the review-5 dome over ~80 % of the city (default); 'district' = storyboard v3 (DOME.district); or an arc /
 *  feet + apex. Anything but 'wide' switches the v3 staging (tower at the right foot, observer off, v3 layers, v3 doors). */
export type DomeShape = 'wide' | 'district' | DomeArc | {feet: [Pt, Pt]; apex: Pt};

/** Resolve a DomeShape to its arc. */
export function domeArc(d: DomeShape = 'wide'): DomeArc {
  if (d === 'wide') return DOME.arc;
  if (d === 'district') return DOME.district;
  if ('feet' in d) {
    const [a, b] = d.feet;
    return {cx: (a[0] + b[0]) / 2, by: (a[1] + b[1]) / 2, rx: Math.abs(b[0] - a[0]) / 2, ry: (a[1] + b[1]) / 2 - d.apex[1]};
  }
  return d;
}

/** The dome arc's y at x (upper half of the ellipse; NaN outside). Pass the v3 dome (`'district'`) for its arc. */
export function domeArcY(x: number, dome: DomeShape = 'wide'): number {
  const a = domeArc(dome);
  const u = (x - a.cx) / a.rx;
  if (Math.abs(u) > 1) return NaN;
  return a.by - a.ry * Math.sqrt(1 - u * u);
}

/** A 5-bar tally gate (four verticals + one diagonal) as an ink path; size = height. */
export function tallyGatePath(x: number, y: number, size: number, n = 5): string {
  const gap = size * 0.24;
  let d = '';
  for (let i = 0; i < Math.min(4, n); i++) d += `M${(x + i * gap).toFixed(1)} ${y.toFixed(1)}l${(size * 0.02).toFixed(1)} ${size.toFixed(1)}`;
  if (n >= 5) d += `M${(x - gap * 0.4).toFixed(1)} ${(y + size * 0.78).toFixed(1)}L${(x + gap * 3.4).toFixed(1)} ${(y + size * 0.2).toFixed(1)}`;
  return d;
}

// ---------------------------------------------------------------- the city rows (batched geometry, module level)

type R4 = [number, number, number, number];
type RowGeo = {fills: {color: string; d: string}[]; ink: string; dots: string[]; bw: string; bars: string; back: {color: string; d: string}; chrome: R4[]};

const ROWS: RowGeo[] = (() => {
  const out: RowGeo[] = [];
  // golden atmosphere ladder (sky cream -> half-sand -> sand -> tan / sage + ink -> tan / teal + ink): every row sits one
  // step off what is behind it, and NO row is the sky colour (a cream block on the cream sky would read as a hole)
  const palettes = [
    [HALF.sand, palette.sand, HALF.sand],
    [palette.sand, palette.sand, HALF.sand],
    [palette.tan, palette.sage, palette.sand, palette.tan],
    [palette.tan, palette.teal, palette.sand, palette.tan, palette.sage],
  ];
  DOME.rows.forEach((row, ri) => {
    const r = rng(`dome/row${ri}`);
    const cols = palettes[ri];
    const byColor = cols.map(() => '');
    let ink = '';
    const dots = ['', '', '', ''];
    let bw = '';
    let bars = '';
    const chrome: R4[] = [];
    const s = [0.22, 0.38, 0.62, 1][ri];
    // up to 4 buildings per row (rows 2-3) carry a REAL browser window (>= 60 px wide: dots + pill read on a phone),
    // spread across the frame (one per x quarter)
    const chromeQ = new Set<number>();
    let x = -260;
    while (x < 1340) {
      const w = r.range(60, 150) * s;
      const top0 = r.range(row.top[0], row.top[1]);
      // v3: a LOW row-3 shed in front of every row-2 rattler door, so the door at row 2's street level (y 1300) and its
      // attempter show above it (same RNG stream: the rest of the city is unchanged)
      const low = ri === 3 && DOME.rattlers.row2.some((q) => q.x + 18 > x && q.x - 18 < x + w);
      const top = low ? 1338 : top0;
      const ci = r.int(0, cols.length - 1);
      const roof = r.next();
      let d = rectPath(x, top, w, row.base - top);
      if (ri >= 2 && !low && roof < 0.22) d += polyPath([[x - 2, top], [x + w / 2, top - w * 0.35], [x + w + 2, top]]);
      if (ri >= 2 && !low && roof > 0.82) d += rectPath(x + w * 0.2, top - 16 * s, w * 0.6, 17 * s);
      byColor[ci] += d;
      // a real browser window on this building? (rows 2-3, wide enough, one per x quarter, inside the frame)
      const q4 = Math.floor(((x + w / 2) / 1080) * 4);
      const cw = Math.min(w * 0.74, ri === 2 ? 74 : 112);
      const wantChrome = ri >= 2 && cw >= 60 && x + w / 2 > 60 && x + w / 2 < 1020 && q4 >= 0 && q4 <= 3 && !chromeQ.has(q4) && r.chance(0.7);
      let cr: R4 | null = null;
      if (wantChrome) {
        chromeQ.add(q4);
        cr = [x + (w - cw) / 2, top + (row.base - top) * 0.14, cw, cw * 0.62];
        chrome.push(cr);
      }
      // window dots (rows 1-3) in 4 x-chunks (they pop in a wave / switch peach): a JITTERED grid (style bible 7):
      // seeded drop-outs (whole columns and single panes), 40-70 % partial fills (top or bottom), size / position jitter
      if (ri >= 1) {
        const ws = ri === 1 ? 4 : ri === 2 ? 6 : 9;
        const step = ws * 2.2;
        const deadCol = r.int(0, 5);
        let col = 0;
        for (let xx = x + ws; xx < x + w - ws * 1.2; xx += step, col++) {
          if (col === deadCol && w > step * 3) continue;
          for (let yy = top + ws * 1.4; yy < row.base - ws * 1.6; yy += step * 1.15) {
            if (cr && xx + ws > cr[0] - 3 && xx < cr[0] + cr[2] + 3 && yy + ws * 1.25 > cr[1] - 3 && yy < cr[1] + cr[3] + 3) continue;
            if (!r.chance(0.55)) continue;
            const chunk = Math.max(0, Math.min(3, Math.floor(((xx + 260) / 1600) * 4)));
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
      // tiny browser windows (rows 2-3): a cream screen with a dark bar (the far LOD of the real ones)
      if (ri >= 2 && !cr && w > 40 * s && r.chance(0.5)) {
        const bwW = w * 0.5;
        const bwH = bwW * 0.55;
        const bx = x + w * 0.25;
        const by = top + (row.base - top) * 0.18;
        bw += rectPath(bx, by, bwW, bwH);
        bars += rectPath(bx, by, bwW, bwH * 0.24);
      }
      if (ri >= 2) {
        ink += line(x, top, x + w, top, {seed: `dm${ri}t${Math.round(x)}`, over: 'small', breaks: false}) + line(x, top, x, row.base, {seed: `dm${ri}l${Math.round(x)}`, over: [1, 0], breaks: false});
        if (ri === 3 && roof > 0.55 && roof < 0.82) {
          // chimney or water tank on the near rooftops (not on the low sheds; the RNG draws stay the same)
          const cx = x + w * r.range(0.2, 0.7);
          const chim = r.chance(0.5);
          if (low) {
            /* flat shed roof */
          } else if (chim) {
            byColor[0] += rectPath(cx - 7, top - 26, 14, 27);
            ink += rect(cx - 7, top - 26, 14, 26, {seed: `dmc${Math.round(x)}`, over: 'small', edges: 'tlr'});
          } else {
            byColor[2] += rectPath(cx - 16, top - 40, 32, 30) + polyPath([[cx - 18, top - 40], [cx, top - 54], [cx + 18, top - 40]]);
            ink += rect(cx - 16, top - 40, 32, 30, {seed: `dmw${Math.round(x)}`, over: 'small'}) + line(cx - 12, top - 10, cx - 12, top, {seed: `dml${Math.round(x)}`, over: 0}) + line(cx + 12, top - 10, cx + 12, top, {seed: `dmr${Math.round(x)}`, over: 0});
          }
        }
      }
      x += w + r.range(-4, 3) * s;
    }
    // BACK-FILL: the band under this row's lowest roof, down from the row behind (or this row's lowest top for row 0),
    // in the colour of the row behind, so nothing behind the city (the sun, the sky) shows through the gaps between
    // buildings below the first skyline
    const prevBase = ri === 0 ? row.top[1] : DOME.rows[ri - 1].base;
    const back = {color: ri === 0 ? palettes[0][0] : palettes[ri - 1][0], d: rectPath(-260, prevBase - 1, 1600, row.base - prevBase + 1)};
    out.push({fills: cols.map((c, i) => ({color: c, d: byColor[i]})), ink, dots, bw, bars, back, chrome});
  });
  return out;
})();

const G = (() => {
  const s = 'dome';
  const a = DOME.arc;
  const pts = (rx: number, ry: number, from: number, to: number, n = 40) => {
    const p: Pt[] = [];
    for (let i = 0; i <= n; i++) {
      const th = from + ((to - from) * i) / n;
      p.push([a.cx + Math.cos(th) * rx, a.by - Math.sin(th) * ry]);
    }
    return p;
  };
  const toD = (p: Pt[]) => p.map((q, i) => `${i ? 'L' : 'M'}${q[0].toFixed(1)} ${q[1].toFixed(1)}`).join('');
  // the arc in two halves drawn from each foot up to the apex
  const leftHalf = toD(pts(a.rx, a.ry, Math.PI, Math.PI / 2));
  const rightHalf = toD(pts(a.rx, a.ry, 0, Math.PI / 2));
  const interior = toD(pts(a.rx, a.ry, 0, Math.PI, 64)) + 'Z';
  // cream rim strip inside the arc, upper right (sun side)
  const outer = pts(a.rx - 2, a.ry - 2, Math.PI * 0.18, Math.PI * 0.62, 24);
  const inner = pts(a.rx - 11, a.ry - 11, Math.PI * 0.62, Math.PI * 0.18, 24);
  const rim = toD([...outer, ...inner]) + 'Z';
  // lattice: 6 meridians + 3 parallels (hair)
  let lattice = '';
  for (const k of [-0.78, -0.5, -0.2, 0.2, 0.5, 0.78]) {
    const rx = Math.abs(k) * a.rx;
    lattice += toD(pts(rx, a.ry, k < 0 ? Math.PI : 0, Math.PI / 2, 24));
  }
  for (const v of [0.3, 0.58, 0.82]) {
    const yy = a.by - v * a.ry;
    const half = a.rx * Math.sqrt(1 - v * v);
    lattice += `M${(a.cx - half).toFixed(1)} ${yy.toFixed(1)}Q${a.cx} ${(yy - 18 * (1 - v)).toFixed(1)} ${(a.cx + half).toFixed(1)} ${yy.toFixed(1)}`;
  }
  // 3 white glint bars across the glass (long thin diagonal quads)
  const bar = (x: number, y: number, L: number, w: number) => polyPath([[x, y], [x + w, y], [x + w + L * 0.42, y - L], [x + L * 0.42, y - L]]);
  const glints = bar(420, 1060, 230, 16) + bar(452, 1068, 180, 7) + bar(880, 960, 170, 12);
  // dashed footprint line along the rooftops
  const footprint = line(260, 1302, 1200, 1300, {seed: `${s}/fp`, over: 0, breaks: false});
  // terraced hill silhouette (row 0, far left)
  const hill = polyPath([[-160, 1004], [-40, 1004], [-20, 984], [10, 984], [26, 966], [56, 966], [70, 950], [104, 950], [118, 968], [146, 968], [160, 986], [196, 986], [214, 1004], [260, 1004], [260, 1010], [-160, 1010]]);
  // watchtower lattice
  const T = DOME.tower;
  let lat = line(T.x0, T.base, T.x0 + 12, T.top + 60, {seed: `${s}/tl`, over: 0}) + line(T.x1, T.base, T.x1 - 12, T.top + 60, {seed: `${s}/tr`, over: 0});
  for (let y = T.base - 40, i = 0; y > T.top + 80; y -= 46, i++) {
    const k = (T.base - y) / (T.base - T.top - 60);
    const xl = T.x0 + 12 * k;
    const xr = T.x1 - 12 * k;
    const k2 = (T.base - (y - 46)) / (T.base - T.top - 60);
    lat += line(xl, y, xr, y, {seed: `${s}/tb${i}`, over: 'small', breaks: false}) + line(xl, y, T.x1 - 12 * k2, y - 46, {seed: `${s}/td${i}`, over: 0, breaks: false});
  }
  const [cx, cy, cw, ch] = T.cabin;
  const cabin = rectPath(cx, cy, cw, ch);
  const cabinRoof = polyPath([[cx - 8, cy], [cx + cw / 2, cy - 22], [cx + cw + 8, cy]]);
  const cabinInk = rect(cx, cy, cw, ch, {seed: `${s}/cab`, over: 'small'}) + line(cx - 10, cy, cx + cw / 2, cy - 22, {seed: `${s}/cr1`, over: [2, 0]}) + line(cx + cw / 2, cy - 22, cx + cw + 10, cy, {seed: `${s}/cr2`, over: [0, 2]}) + line(cx + 6, cy + ch * 0.62, cx + cw - 6, cy + ch * 0.62, {seed: `${s}/sill`, over: 0});
  const [bx, by, bw, bh] = T.board;
  const boardInk = rect(bx, by, bw, bh, {seed: `${s}/bd`, over: 'small'});
  // the near PARAPET we stand behind (review 5: a real rooftop, not a road): a cream coping strip (peach at golden) with
  // doubled coping lines that overshoot both frame edges, a tan front face with a few joints, cut by both frame edges;
  // below it our own roof deck (sand) with the parapet's teal shadow band. A chimney stack with two pots and the
  // antenna stand ON the coping at near scale.
  const P = DOME.parapet;
  const yTop = (x: number) => P.top[0] + ((P.top[1] - P.top[0]) * (x + 160)) / 1400;
  const coping = polyPath([[-160, yTop(-160)], [1240, yTop(1240)], [1240, yTop(1240) + P.coping], [-160, yTop(-160) + P.coping]]);
  const face = polyPath([[-160, yTop(-160) + P.coping], [1240, yTop(1240) + P.coping], [1240, P.face], [-160, P.face + 6]]);
  const deck = polyPath([[-160, P.face + 6], [1240, P.face], [1240, 2080], [-160, 2080]]);
  const deckShade = polyPath([[-160, P.face + 6], [1240, P.face], [1240, P.face + 46], [-160, P.face + 58]]);
  let joints = '';
  for (let i = 0; i < 9; i++) {
    const jx = -100 + i * 150 + (i % 3) * 14;
    joints += line(jx, yTop(jx) + P.coping + 10, jx + 1, P.face - 6, {seed: `${s}/jt${i}`, over: 0, breaks: false});
  }
  joints += line(-160, yTop(-160) + P.coping + 62, 1240, yTop(1240) + P.coping + 60, {seed: `${s}/jh`, over: 0});
  const ledgeInk =
    line(-160, yTop(-160) - 1, 1240, yTop(1240) - 1, {seed: `${s}/cp1`, over: [40, 40]}) +
    line(-160, yTop(-160) + 7, 1240, yTop(1240) + 7, {seed: `${s}/cp2`, over: [26, 50]}) +
    line(-160, yTop(-160) + P.coping, 1240, yTop(1240) + P.coping, {seed: `${s}/cp3`, over: [30, 30]}) +
    line(-160, P.face + 6, 1240, P.face, {seed: `${s}/fb`, over: 0});
  // chimney stack (x 690-800) with two pots, on the coping
  const cs = {x0: 590, x1: 690, top: 1336};
  const pots = rectPath(cs.x0, cs.top, cs.x1 - cs.x0, yTop(cs.x0) - cs.top + 2);
  const potTops = rectPath(cs.x0 + 14, 1294, 24, 44) + rectPath(cs.x0 + 58, 1306, 24, 32);
  const potBands = rectPath(cs.x0 - 6, cs.top, cs.x1 - cs.x0 + 12, 12);
  const chimInk = rect(cs.x0, cs.top, cs.x1 - cs.x0, yTop(cs.x0) - cs.top, {seed: `${s}/ch1`, over: 'small', edges: 'tlr'}) + line(cs.x0 - 8, cs.top, cs.x1 + 8, cs.top, {seed: `${s}/ch1t`, over: [4, 4]}) + rect(cs.x0 + 14, 1294, 24, 44, {seed: `${s}/ch2`, over: 'small', edges: 'tlr'}) + rect(cs.x0 + 58, 1306, 24, 32, {seed: `${s}/ch3`, over: 'small', edges: 'tlr'}) + line(cs.x0 + 8, 1380, cs.x0 + 30, 1380, {seed: `${s}/chb`, over: 0}) + line(cs.x1 - 40, 1406, cs.x1 - 12, 1406, {seed: `${s}/chb2`, over: 0});
  const antenna = line(990, yTop(990), 990, 1236, {seed: `${s}/an`, over: 0}) + line(956, 1280, 1024, 1280, {seed: `${s}/an1`, over: [2, 2]}) + line(964, 1318, 1016, 1318, {seed: `${s}/an2`, over: [2, 2]}) + line(944, 1250, 1036, 1250, {seed: `${s}/an3`, over: [2, 2]}) + line(990, 1350, 1030, yTop(1030), {seed: `${s}/an4`, over: 0});
  const ledge = coping;
  const ledgeShade = deckShade;
  const tiles = joints;
  return {potTops, potBands, leftHalf, rightHalf, interior, rim, lattice, glints, footprint, hill, lat, cabin, cabinRoof, cabinInk, boardInk, ledge, ledgeShade, pots, ledgeInk, antenna, tiles, face, deck, chimInk};
})();

// ---------------------------------------------------------------- v3 geometry (district dome, foot tower, doors)

/** Arc-dependent dome geometry (memoised per arc): the two halves drawn from the feet, the interior (glass clip), the
 *  cream rim strip on the sun side, glint bars, a lattice (meridians / parallels scale with the dome) and the footprint. */
const DOME_GEO = new Map<string, {leftHalf: string; rightHalf: string; interior: string; rim: string; lattice: string; glints: string; footprint: string}>();
function domeGeo(a: DomeArc) {
  const key = `${a.cx},${a.by},${a.rx},${a.ry}`;
  const hit = DOME_GEO.get(key);
  if (hit) return hit;
  const pts = (rx: number, ry: number, from: number, to: number, n = 40) => {
    const p: Pt[] = [];
    for (let i = 0; i <= n; i++) {
      const th = from + ((to - from) * i) / n;
      p.push([a.cx + Math.cos(th) * rx, a.by - Math.sin(th) * ry]);
    }
    return p;
  };
  const toD = (p: Pt[]) => p.map((q, i) => `${i ? 'L' : 'M'}${q[0].toFixed(1)} ${q[1].toFixed(1)}`).join('');
  const small = a.rx < 320;
  const leftHalf = toD(pts(a.rx, a.ry, Math.PI, Math.PI / 2));
  const rightHalf = toD(pts(a.rx, a.ry, 0, Math.PI / 2));
  const interior = toD(pts(a.rx, a.ry, 0, Math.PI, 64)) + 'Z';
  const rimW = small ? 7 : 9;
  const rim = toD([...pts(a.rx - 2, a.ry - 2, Math.PI * 0.18, Math.PI * 0.62, 24), ...pts(a.rx - 2 - rimW, a.ry - 2 - rimW, Math.PI * 0.62, Math.PI * 0.18, 24)]) + 'Z';
  let lattice = '';
  for (const k of small ? [-0.62, -0.24, 0.24, 0.62] : [-0.78, -0.5, -0.2, 0.2, 0.5, 0.78]) {
    lattice += toD(pts(Math.abs(k) * a.rx, a.ry, k < 0 ? Math.PI : 0, Math.PI / 2, 24));
  }
  for (const v of small ? [0.36, 0.7] : [0.3, 0.58, 0.82]) {
    const yy = a.by - v * a.ry;
    const half = a.rx * Math.sqrt(1 - v * v);
    lattice += `M${(a.cx - half).toFixed(1)} ${yy.toFixed(1)}Q${a.cx} ${(yy - 18 * (a.ry / 600) * (1 - v)).toFixed(1)} ${(a.cx + half).toFixed(1)} ${yy.toFixed(1)}`;
  }
  // glint bars: long thin diagonal quads on the left half (2 on a district dome, 3 on the wide one)
  const k = a.ry / 600;
  const bar = (x: number, y: number, L: number, w: number) => polyPath([[x, y], [x + w, y], [x + w + L * 0.42, y - L], [x + L * 0.42, y - L]]);
  const gx = a.cx - a.rx * 0.66;
  const gy = a.by - a.ry * 0.4;
  const glints = small
    ? bar(gx, gy, 230 * k * 1.2, 12 * Math.max(0.6, k)) + bar(gx + 26 * k * 1.6, gy + 8 * k, 170 * k * 1.2, 6)
    : bar(420, 1060, 230, 16) + bar(452, 1068, 180, 7) + bar(880, 960, 170, 12);
  const footprint = line(a.cx - a.rx, a.by + 2, a.cx + a.rx, a.by, {seed: `dome/fp${a.cx}`, over: 0, breaks: false});
  const out = {leftHalf, rightHalf, interior, rim, lattice, glints, footprint};
  DOME_GEO.set(key, out);
  return out;
}

/** v3: the watchtower at the dome's right foot as a SILHOUETTE against the big sun (tealDark lattice + cabin, a dark
 *  window band, no guard), its searchlight housing on the cabin's left. */
const TOWER_V3 = (() => {
  const T = DOME.towerV3;
  const [cx, cy, cw, ch] = T.cabin;
  const legL: [Pt, Pt] = [[T.x0 - 6, T.base], [cx + 6, cy + ch]];
  const legR: [Pt, Pt] = [[T.x1 + 6, T.base], [cx + cw - 6, cy + ch]];
  const at = (leg: [Pt, Pt], u: number): Pt => [leg[0][0] + (leg[1][0] - leg[0][0]) * u, leg[0][1] + (leg[1][1] - leg[0][1]) * u];
  let lattice = `M${legL[0][0]} ${legL[0][1]}L${legL[1][0]} ${legL[1][1]}M${legR[0][0]} ${legR[0][1]}L${legR[1][0]} ${legR[1][1]}`;
  const us = [0, 0.22, 0.44, 0.66, 0.86];
  for (let i = 0; i < us.length - 1; i++) {
    const a0 = at(legL, us[i]);
    const b0 = at(legR, us[i]);
    const b1 = at(legR, us[i + 1]);
    const a1 = at(legL, us[i + 1]);
    lattice += `M${a0[0].toFixed(1)} ${a0[1].toFixed(1)}L${b0[0].toFixed(1)} ${b0[1].toFixed(1)}`;
    lattice += i % 2 ? `M${a0[0].toFixed(1)} ${a0[1].toFixed(1)}L${b1[0].toFixed(1)} ${b1[1].toFixed(1)}` : `M${b0[0].toFixed(1)} ${b0[1].toFixed(1)}L${a1[0].toFixed(1)} ${a1[1].toFixed(1)}`;
  }
  const cabin = rectPath(cx, cy, cw, ch) + polyPath([[cx - 5, cy + 1], [cx + cw / 2, T.top], [cx + cw + 5, cy + 1]]) + rectPath(cx - 4, cy + ch - 3, cw + 8, 5);
  const window = rectPath(cx + 5, cy + 7, cw - 10, ch * 0.42);
  const lamp = rectPath(T.light[0] - 7, T.light[1] - 6, 9, 12);
  return {lattice, cabin, window, lamp};
})();

/** v3 rattler doors: row 3 (near rooftops, feet just above our coping) and row 2 (street level y 1300, in front of the
 *  low row-3 sheds). Fill + ink per row, batched. */
const DOORS_V3 = (() => {
  const make = (list: readonly {x: number; y: number; h: number}[], k: number, seed: string) => {
    let fill = '';
    let lintel = '';
    let ink = '';
    list.forEach((q, i) => {
      const h = q.h * 1.18;
      const w = h * 0.42;
      fill += rectPath(q.x - w / 2, q.y - h, w, h);
      lintel += rectPath(q.x - w / 2 - 3 * k, q.y - h - 5 * k, w + 6 * k, 5 * k);
      ink += rect(q.x - w / 2, q.y - h, w, h, {seed: `${seed}${i}`, edges: 'tlr', over: 'small'}) + `M${(q.x + w * 0.26).toFixed(1)} ${(q.y - h * 0.5).toFixed(1)}l0 ${(h * 0.12).toFixed(1)}`;
    });
    return {fill, lintel, ink};
  };
  return {row3: make(DOME.rattlers.row3, 1, 'dr3'), row2: make(DOME.rattlers.row2, 0.6, 'dr2')};
})();

// ---------------------------------------------------------------- pieces

const RowNode: React.FC<{ri: number; inkW: number; dotsAt?: number; duskAt?: number; seed: string}> = ({ri, inkW, dotsAt, duskAt, seed}) => {
  const t = useTime();
  const R = ROWS[ri];
  return (
    <>
      <Fill d={R.back.d} color={R.back.color} offset={false} mode="snap" seed={`${seed}/r${ri}back`} />
      {R.fills.map((f, i) => (f.d ? <Fill key={i} d={f.d} color={f.color} offset={ri >= 2 ? undefined : false} mode="snap" seed={`${seed}/r${ri}f${i}`} /> : null))}
      {R.dots.map((d, c) => {
        if (!d) return null;
        if (dotsAt !== undefined && t < dotsAt + c * 0.08 + ri * 0.05) return null;
        const lit = duskAt !== undefined && t >= duskAt + ri * 0.18 + Math.abs(c - 1.5) * 0.06;
        return <Fill key={`d${c}`} d={d} color={lit ? palette.peach : ri === 1 ? HALF.sand : palette.tealDark} offset={false} mode="snap" seed={`${seed}/r${ri}d${c}`} />;
      })}
      {R.bw ? <Fill d={R.bw} color={duskAt !== undefined && t >= duskAt + ri * 0.18 ? palette.peach : palette.cream} offset={false} mode="snap" seed={`${seed}/r${ri}bw`} /> : null}
      {R.bars ? <Fill d={R.bars} color={palette.tealDark} offset={false} mode="snap" seed={`${seed}/r${ri}bar`} /> : null}
      {inkW > 0 && R.ink ? <Ink d={R.ink} width={inkW} taper={false} seed={`${seed}/r${ri}i`} /> : null}
      {R.chrome.map((c, i) =>
        dotsAt !== undefined && t < dotsAt + ri * 0.05 + i * 0.04 ? null : (
          <ChromeSlot key={`c${i}`} x={c[0]} y={c[1]} w={c[2]} h={c[3]} offAt={undefined} width={ri === 3 ? SI.far : SI.hair} seed={`${seed}/r${ri}c${i}`} />
        ),
      )}
    </>
  );
};

/** The searchlight: a flat cream wedge at a FIXED partial opacity with dashed ink edges (never animated opacity). */
const Searchlight: React.FC<{at?: number; angle?: number | ((t: number) => number); seed: string; v3?: boolean; clamp?: [number, number]}> = ({at, angle, seed, v3, clamp}) => {
  const t = useTime();
  const look = useLook();
  const ks = useInkScale(); // camera ink compensation for the raw strokes below (lib/inkComp.tsx): 1 outside an <InkScale>
  if (at === undefined || t < at || look.fills !== 'color') return null;
  const S = DOME.searchV3;
  const [ox, oy] = v3 ? DOME.towerV3.light : DOME.tower.light;
  const lim = clamp ?? (v3 ? S.clamp : undefined);
  const raw = typeof angle === 'function' ? angle(t) : angle ?? (v3 ? (S.clamp[0] + S.clamp[1]) / 2 + ((S.clamp[1] - S.clamp[0]) / 2) * Math.sin((t - at) * 0.9) : 10 + 30 * Math.sin((t - at) * 0.9));
  const a = lim ? Math.max(lim[0], Math.min(lim[1], raw)) : raw;
  const grow = E.outCubic(prog(t, at, 0.35));
  const half = v3 ? S.half : 7;
  // v3 points LEFT at the dome (angle = degrees below the horizontal) and never rises above the ceiling
  const dir = v3 ? -1 : 1;
  const edge = (deg: number): Pt => {
    const r = (deg * Math.PI) / 180;
    let L = (v3 ? S.length : 900) * grow;
    if (v3 && deg < 0) L = Math.min(L, (oy - S.ceiling) / Math.sin(-r));
    return [ox + dir * Math.cos(r) * L, oy + Math.sin(r) * L];
  };
  const p0 = edge(a - half);
  const p1 = edge(a + half);
  return (
    <>
      <path d={polyPath([[ox, oy], p0, p1])} fill={palette.cream} opacity={0.55} />
      <path d={`M${ox} ${oy}L${p0[0].toFixed(1)} ${p0[1].toFixed(1)}M${ox} ${oy}L${p1[0].toFixed(1)} ${p1[1].toFixed(1)}`} fill="none" stroke={palette.ink} strokeWidth={SI.far * ks} strokeDasharray="12 10" strokeLinecap="round" data-seed={seed} />
    </>
  );
};

/** The watchtower guard, back view, 56 px tall in the cabin window (review 5: >= 55 px, the cabin reads as the figure):
 *  tealDark coat shoulders under the sill, a brown head and a teal peaked cap (the brim points away from us). Drawn at
 *  the 34 px design and scaled x1.65 about the sill. */
const Guard: React.FC<{x: number; sill: number; seed: string}> = ({x, sill, seed}) => (
  <XG m={mat.about(mat.scale(1.65), x, sill)}>
    <GuardBody x={x} sill={sill} seed={seed} />
  </XG>
);
const GuardBody: React.FC<{x: number; sill: number; seed: string}> = ({x, sill, seed}) => {
  const hy = sill - 17;
  const shoulders = `M${x - 19} ${sill + 2}L${x - 19} ${sill - 4}Q${x - 18} ${sill - 11} ${x - 8} ${sill - 11}L${x + 8} ${sill - 11}Q${x + 18} ${sill - 11} ${x + 19} ${sill - 4}L${x + 19} ${sill + 2}Z`;
  const head = `M${x - 8.5} ${hy}a8.5 8.5 0 1 0 17 0a8.5 8.5 0 1 0 -17 0Z`;
  const cap = `M${x - 10} ${hy - 2}Q${x - 10} ${hy - 13} ${x} ${hy - 13}Q${x + 10} ${hy - 13} ${x + 10} ${hy - 2}Z`;
  const band = rectPath(x - 10.5, hy - 3.5, 21, 3.5);
  return (
    <>
      <Fill d={shoulders} color={palette.tealDark} seed={`${seed}/c`} />
      <Fill d={head} color={palette.brown} seed={`${seed}/h`} />
      <Fill d={cap} color={palette.teal} seed={`${seed}/cap`} />
      <Fill d={band} color={palette.tealDark} offset={false} seed={`${seed}/b`} />
      <Ink d={`M${x - 19} ${sill}L${x - 19} ${sill - 4}Q${x - 18} ${sill - 11} ${x - 8} ${sill - 11}M${x + 8} ${sill - 11}Q${x + 18} ${sill - 11} ${x + 19} ${sill - 4}L${x + 19} ${sill}` + `M${x - 8.5} ${hy + 1}A8.5 8.5 0 0 0 ${x + 8.5} ${hy + 1}` + `M${x - 10.5} ${hy - 1}Q${x - 10} ${hy - 13} ${x} ${hy - 13}Q${x + 10} ${hy - 13} ${x + 10.5} ${hy - 1}L${x - 10.5} ${hy - 1}` + `M${x - 3} ${sill - 10}L${x - 3} ${sill - 2}`} width={SI.far / 1.65} taper={false} vary={0} seed={`${seed}/i`} />
    </>
  );
};

// ---------------------------------------------------------------- the set

export type DomeCityProps = {
  /** The scene's sun (r165): drawn behind the city and the glass, so the horizon row hides it as it sets. */
  sun?: React.ReactNode;
  /** The dome arc draws from both feet up to the apex over domeDur (omit = there). The glass (lighter fills, rim, glints,
   *  lattice) pops when the arc completes (or at glassAt). */
  domeAt?: number;
  domeDur?: number;
  glassAt?: number;
  /** Footprint dashes draw on ("a big chunk"). Omit = there; false = none. */
  footprintAt?: number | false;
  /** Window / browser dots pop in a wave (omit = there). */
  dotsAt?: number;
  /** Dusk: dots pop peach from the horizon outward; the glass interior follows the dusk sky (sage -> sky). */
  duskAt?: number;
  /** Watchtower rises (scaleY from its base with overshoot); searchlight shoots on at searchAt and sweeps. */
  towerAt?: number;
  searchAt?: number;
  searchAngle?: number | ((t: number) => number);
  guard?: boolean;
  /** The back-view observer behind the parapet (DOME.observer). Default true ('wide'), false in v3. */
  observer?: boolean;
  /** Storyboard v3: 'district' re-scales the dome to one far district (DOME.district: feet (180, 1080) / (600, 1080),
   *  apex (390, 830)); also an arc {cx, by, rx, ry} or {feet, apex}. Anything but 'wide' (default) stages v3: the
   *  watchtower silhouetted at the dome's right foot (dark cabin, no guard), the searchlight pointing at the dome
   *  (clamped), observer off, the v3 rattler doors and the v3 multiplane layers (DOME.depths). */
  dome?: DomeShape;
  /** Clamp of `searchAngle` in degrees (v3 default -10..+25: below the horizontal, pointing at the dome). */
  searchClamp?: [number, number];
  /** v3 rattler doors on rows 2-3 (DOME.rattlers). Default true in v3. */
  doors?: boolean;
  /** Sky colour behind (skies.golden by default): the glass interior is one step lighter. */
  sky?: string;
  wrap?: LayerWrap;
  x?: number;
  y?: number;
  scale?: number;
  /** Un-build just this set from here (s), over outDur (default 0.5). */
  outAt?: number;
  outDur?: number;
  seed?: Seed;
};

export const DomeCity: React.FC<DomeCityProps> = (props) => (props.dome !== undefined && props.dome !== 'wide' ? <DomeCityV3 {...props} /> : <DomeCityWide {...props} />);

/** The near layer: our rooftop parapet (deck, shadow band, face, coping, joints), the chimney stack, the antenna and
 *  the optional back-view observer. */
const Rooftop: React.FC<{sd: string; observer: boolean}> = ({sd, observer}) => (
  <>
    <Fill d={G.deck} color={palette.sand} offset={false} seed={`${sd}/deck`} />
    <Fill d={G.ledgeShade} color={palette.teal} offset={false} seed={`${sd}/deckS`} />
    <Fill d={G.face} color={palette.tan} offset={false} seed={`${sd}/face`} />
    <Fill d={G.ledge} color={palette.cream} offset={false} seed={`${sd}/coping`} />
    <Ink d={G.tiles} width={SI.far} taper={false} seed={`${sd}/joints`} />
    <Ink d={G.ledgeInk} width={SI.front} seed={`${sd}/ledgeI`} />
    <Fill d={G.pots} color={palette.brown} seed={`${sd}/pots`} />
    <Fill d={G.potBands} color={palette.tan} offset={false} seed={`${sd}/potb`} />
    <Fill d={G.potTops} color={palette.sand} seed={`${sd}/pott`} />
    <Ink d={G.chimInk} width={SI.front} seed={`${sd}/chimI`} />
    <Ink d={G.antenna} width={SI.mid} color={palette.tealDark} taper={false} seed={`${sd}/ant`} />
    {observer ? <OnlookerSlot x={DOME.observer.head[0]} y={DOME.observer.head[1]} head={DOME.observer.size} hair="cap" body={palette.sand} acc={['scarf']} rim="left" arms="near" seed={`${sd}/obs3`} /> : null}
  </>
);

const DomeCityWide: React.FC<DomeCityProps> = ({sun, domeAt, domeDur = 1.1, glassAt, footprintAt, dotsAt, duskAt, towerAt, searchAt, searchAngle, guard = true, observer = true, sky = skies.golden, wrap = noWrap, x = 0, y = 0, scale = 1, outAt, outDur, seed = 'dome'}) => {
  const t = useTime();
  const clipId = 'dm' + useId().replace(/[^a-zA-Z0-9]/g, '');
  const sd = String(seed);
  const glassT = glassAt ?? (domeAt !== undefined ? domeAt + domeDur : undefined);
  const glass = glassT === undefined || t >= glassT;
  const dusk = duskAt !== undefined && t >= duskAt + 0.2;
  const domeSky = glassStep(dusk ? skies.dusk : sky);
  const T = DOME.tower;
  // tower rise: scaleY 0 -> 1.04 -> 1 about its base
  const tk = towerAt === undefined ? 1 : t < towerAt ? 0 : prog(t, towerAt, 0.3, E.outCubic) < 1 ? prog(t, towerAt, 0.3, E.outCubic) * 1.04 : 1.04 - 0.04 * prog(t, towerAt + 0.3, 0.15);
  const rows = (lighter: boolean) => (
    <>
      <Fill d={G.hill} color={palette.sand} offset={false} mode="snap" seed={`${sd}/hill`} />
      <Ink d={`M-20 984L10 984M26 966L56 966M70 950L104 950M118 968L146 968M160 986L196 986`} width={SI.hair} taper={false} />
      <RowNode ri={0} inkW={0} dotsAt={dotsAt} duskAt={duskAt} seed={`${sd}/${lighter ? 'g' : 'n'}0`} />
      <RowNode ri={1} inkW={0} dotsAt={dotsAt} duskAt={duskAt} seed={`${sd}/${lighter ? 'g' : 'n'}1`} />
      <RowNode ri={2} inkW={SI.hair} dotsAt={dotsAt} duskAt={duskAt} seed={`${sd}/${lighter ? 'g' : 'n'}2`} />
    </>
  );
  const far = (
    <>
      <Fill rect={[-260, DOME.band[0], 1600, DOME.band[1] - DOME.band[0] + 2]} color={palette.peach} offset={false} mode="snap" seed={`${sd}/band`} />
      {glass ? (
        <g clipPath={`url(#${clipId})`}>
          <Fill d={G.interior} color={domeSky} offset={false} mode="snap" seed={`${sd}/gsky`} />
          <Fill rect={[-260, DOME.band[0], 1600, DOME.band[1] - DOME.band[0] + 2]} color={glassStep(palette.peach)} offset={false} mode="snap" seed={`${sd}/gband`} />
        </g>
      ) : null}
    </>
  );
  const city = (
    <>
      {rows(false)}
      {glass ? (
        <g clipPath={`url(#${clipId})`}>
          <Glass>{rows(true)}</Glass>
        </g>
      ) : null}
    </>
  );
  const domeNode = (
    <>
      {glass ? <Fill d={G.rim} color={palette.cream} offset={false} mode="snap" seed={`${sd}/rim`} /> : null}
      {glass ? <Fill d={G.glints} color={palette.white} offset={false} mode="snap" seed={`${sd}/glint`} /> : null}
      {/* the searchlight passes UNDER the dome's ink (the bold arc stays ink where the beam crosses it) */}
      <Searchlight at={searchAt} angle={searchAngle} seed={sd} />
      {glass ? <Ink d={G.lattice} width={SI.hair} taper={false} order="all" seed={`${sd}/lat`} /> : null}
      <Ink d={G.leftHalf} width={SI.front} at={domeAt} dur={domeDur} pace="free" ease={E.inOutCubic} seed={`${sd}/arcL`} />
      <Ink d={G.rightHalf} width={SI.front} at={domeAt} dur={domeDur} pace="free" ease={E.inOutCubic} seed={`${sd}/arcR`} />
      {footprintAt !== false ? <Ink d={G.footprint} width={SI.far} dash="14 12" at={footprintAt} seed={`${sd}/fp`} /> : null}
    </>
  );
  const near = (
    <>
      <RowNode ri={3} inkW={SI.mid} dotsAt={dotsAt} duskAt={duskAt} seed={`${sd}/n3`} />
      {/* the uncovered strip's nearest street doors (normal values, rattlers stand here) */}
      <Fill d={DOME.rattlerDoors.map(([dx, dy]) => rectPath(dx - 12, dy - 44, 24, 44)).join('')} color={palette.teal} seed={`${sd}/rdoor`} />
      <Fill d={DOME.rattlerDoors.map(([dx, dy]) => rectPath(dx - 18, dy - 50, 36, 6)).join('')} color={palette.sand} offset={false} seed={`${sd}/rlint`} />
      <Ink d={DOME.rattlerDoors.map(([dx, dy], i) => rect(dx - 12, dy - 44, 24, 44, {seed: `${sd}/rd${i}`, edges: 'tlr', over: 'small'}) + `M${dx + 6} ${dy - 22}l0 6`).join('')} width={SI.far} taper={false} seed={`${sd}/rdi`} />
      {/* watchtower */}
      {tk > 0 ? (
        <XG m={tk !== 1 ? mat.about(mat.scale(1, tk), (T.x0 + T.x1) / 2, T.base) : mat.I}>
          <Ink d={G.lat} width={SI.mid} taper={false} seed={`${sd}/tower`} />
          <Fill d={G.cabinRoof} color={palette.teal} seed={`${sd}/croof`} />
          <Fill d={G.cabin} color={palette.sand} seed={`${sd}/cabin`} />
          <Fill rect={[T.cabin[0] + 8, T.cabin[1] + 6, T.cabin[2] - 16, T.cabin[3] * 0.56]} color={palette.sage} offset={false} seed={`${sd}/cwin`} />
          {guard ? <Guard x={T.cabin[0] + T.cabin[2] / 2} sill={T.cabin[1] + T.cabin[3] * 0.62} seed={`${sd}/guard`} /> : null}
          <Fill rect={[T.cabin[0], T.cabin[1] + T.cabin[3] * 0.62, T.cabin[2], T.cabin[3] * 0.38]} color={palette.sand} offset={false} seed={`${sd}/cabsill`} />
          <Ink d={G.cabinInk} width={SI.mid} taper={false} seed={`${sd}/cabi`} />
          <Fill rect={T.board} color={palette.white} seed={`${sd}/board`} />
          <Ink d={G.boardInk} width={SI.far} taper={false} seed={`${sd}/boardi`} />
        </XG>
      ) : null}
    </>
  );
  const fg = <Rooftop sd={sd} observer={observer} />;
  return (
    <SetPlace x={x} y={y} scale={scale} outAt={outAt} outDur={outDur}>
      <defs>
        <clipPath id={clipId} clipPathUnits="userSpaceOnUse">
          <path d={G.interior} />
        </clipPath>
        <clipPath id={`${clipId}s`} clipPathUnits="userSpaceOnUse">
          <rect x={-2000} y={-3000} width={5000} height={3000 + DOME.rows[0].base} />
        </clipPath>
      </defs>
      {wrap('sky', 0.05, far)}
      {/* the sun never shows below the first skyline (row 0's base), whatever the camera or the dome draw-on does */}
      {sun ? wrap('sun', 0.08, <g clipPath={`url(#${clipId}s)`}>{sun}</g>) : null}
      {wrap('city', 0.3, city)}
      {wrap('dome', 0.55, domeNode)}
      {wrap('near', 0.8, near)}
      {wrap('fg', 1.0, fg)}
    </SetPlace>
  );
};

/** Storyboard v3 staging (S08 re-staged): the district dome (or any non-wide arc) over rows 0-1, the watchtower
 *  silhouetted against the big sun at its right foot, the clamped searchlight, rattler doors on rows 2-3, and one layer
 *  per row for the crane (DOME.depths, S08-tuned: rows 0-1 + the dome / tower / glass 0.98, row 2 0.75, row 3 0.38,
 *  the sky and the sun at 1, our rooftop at 0). The glass copy of each row lives in that row's own layer (clipped to the dome
 *  interior), the glass sky in a layer at the dome's depth drawn UNDER the sun. */
const DomeCityV3: React.FC<DomeCityProps> = ({sun, dome = 'district', domeAt, domeDur = 1.1, glassAt, footprintAt, dotsAt, duskAt, towerAt, searchAt, searchAngle, searchClamp, observer = false, doors = true, sky = skies.golden, wrap = noWrap, x = 0, y = 0, scale = 1, outAt, outDur, seed = 'dome'}) => {
  const t = useTime();
  const clipId = 'dv' + useId().replace(/[^a-zA-Z0-9]/g, '');
  const sd = String(seed);
  const arc = domeArc(dome);
  const g = domeGeo(arc);
  const glassT = glassAt ?? (domeAt !== undefined ? domeAt + domeDur : undefined);
  const glass = glassT === undefined || t >= glassT;
  const dusk = duskAt !== undefined && t >= duskAt + 0.2;
  const domeSky = glassStep(dusk ? skies.dusk : sky);
  const nz = (k: keyof typeof DOME.depths) => 1 - DOME.depths[k];
  const T = DOME.towerV3;
  const tk = towerAt === undefined ? 1 : t < towerAt ? 0 : prog(t, towerAt, 0.3, E.outCubic) < 1 ? prog(t, towerAt, 0.3, E.outCubic) * 1.04 : 1.04 - 0.04 * prog(t, towerAt + 0.3, 0.15);
  const clip = (node: React.ReactNode) => (glass ? <g clipPath={`url(#${clipId})`}>{node}</g> : null);
  const row = (ri: number, lighter: boolean) => (
    <>
      {ri === 0 ? (
        <>
          <Fill d={G.hill} color={palette.sand} offset={false} mode="snap" seed={`${sd}/${lighter ? 'g' : 'n'}hill`} />
          <Ink d={`M-20 984L10 984M26 966L56 966M70 950L104 950M118 968L146 968M160 986L196 986`} width={SI.hair} taper={false} />
        </>
      ) : null}
      <RowNode ri={ri} inkW={ri === 3 ? SI.mid : ri === 2 ? SI.hair : 0} dotsAt={dotsAt} duskAt={duskAt} seed={`${sd}/${lighter ? 'g' : 'n'}${ri}`} />
    </>
  );
  const doorNode = (k: 'row2' | 'row3') =>
    doors ? (
      <>
        <Fill d={DOORS_V3[k].fill} color={palette.teal} offset={false} mode="snap" seed={`${sd}/${k}door`} />
        <Fill d={DOORS_V3[k].lintel} color={palette.sand} offset={false} mode="snap" seed={`${sd}/${k}lint`} />
        <Ink d={DOORS_V3[k].ink} width={k === 'row3' ? SI.far : SI.hair} taper={false} seed={`${sd}/${k}di`} />
      </>
    ) : null;
  return (
    <SetPlace x={x} y={y} scale={scale} outAt={outAt} outDur={outDur}>
      <defs>
        <clipPath id={clipId} clipPathUnits="userSpaceOnUse">
          <path d={g.interior} />
        </clipPath>
        <clipPath id={`${clipId}s`} clipPathUnits="userSpaceOnUse">
          <rect x={-2000} y={-3000} width={5000} height={3000 + DOME.rows[0].base} />
        </clipPath>
      </defs>
      {wrap('sky', nz('sky'), <Fill rect={[-260, DOME.band[0], 1600, DOME.band[1] - DOME.band[0] + 2]} color={palette.peach} offset={false} mode="snap" seed={`${sd}/band`} />)}
      {wrap(
        'domeGlass',
        nz('dome'),
        clip(
          <>
            <Fill d={g.interior} color={domeSky} offset={false} mode="snap" seed={`${sd}/gsky`} />
            <Fill rect={[-260, DOME.band[0], 1600, DOME.band[1] - DOME.band[0] + 2]} color={glassStep(palette.peach)} offset={false} mode="snap" seed={`${sd}/gband`} />
          </>,
        ),
      )}
      {sun ? wrap('sun', nz('sun'), <g clipPath={`url(#${clipId}s)`}>{sun}</g>) : null}
      {wrap('row0', nz('row0'), <>{row(0, false)}{clip(<Glass>{row(0, true)}</Glass>)}</>)}
      {wrap('row1', nz('row1'), <>{row(1, false)}{clip(<Glass>{row(1, true)}</Glass>)}</>)}
      {wrap(
        'dome',
        nz('dome'),
        <>
          {glass ? <Fill d={g.rim} color={palette.cream} offset={false} mode="snap" seed={`${sd}/rim`} /> : null}
          {glass && (glassT === undefined || t >= glassT + 0.07) ? <Fill d={g.glints} color={palette.white} offset={false} mode="snap" seed={`${sd}/glint`} /> : null}
          <Searchlight at={searchAt} angle={searchAngle} clamp={searchClamp} v3 seed={sd} />
          {glass ? <Ink d={g.lattice} width={SI.hair} taper={false} order="all" seed={`${sd}/lat`} /> : null}
          <Ink d={g.leftHalf} width={SI.front} at={domeAt} dur={domeDur} pace="free" ease={E.inOutCubic} seed={`${sd}/arcL`} />
          <Ink d={g.rightHalf} width={SI.front} at={domeAt} dur={domeDur} pace="free" ease={E.inOutCubic} seed={`${sd}/arcR`} />
          {footprintAt !== false && footprintAt !== undefined ? <Ink d={g.footprint} width={SI.far} dash="14 12" at={footprintAt} seed={`${sd}/fp`} /> : null}
          {/* the watchtower: a silhouette against the sun (tealDark, no ink), dark cabin, no guard */}
          {tk > 0 ? (
            <XG m={tk !== 1 ? mat.about(mat.scale(1, tk), (T.x0 + T.x1) / 2, T.base) : mat.I}>
              <Ink d={TOWER_V3.lattice} width={3.2} color={palette.tealDark} taper={false} vary={0} seed={`${sd}/tw`} />
              <Fill d={TOWER_V3.cabin} color={palette.tealDark} offset={false} seed={`${sd}/twc`} />
              <Fill d={TOWER_V3.window} color={DEEP_WINDOW} offset={false} seed={`${sd}/tww`} />
              <Fill d={TOWER_V3.lamp} color={palette.tealDark} offset={false} seed={`${sd}/twl`} />
            </XG>
          ) : null}
        </>,
      )}
      {wrap('row2', nz('row2'), <>{row(2, false)}{doorNode('row2')}</>)}
      {wrap('near', nz('row3'), <>{row(3, false)}{doorNode('row3')}</>)}
      {wrap('fg', nz('fg'), <Rooftop sd={sd} observer={observer} />)}
    </SetPlace>
  );
};

/** A dark (unlit) cabin window on the tealDark silhouette: one value step below tealDark. */
const DEEP_WINDOW = '#2F4A49';

/** Tally gates (5-bar) on the watchtower's white board for a count n (up to 30): DOME.tower.board anchors. */
export function boardTallyPath(n: number): string {
  const [bx, by] = DOME.tower.board;
  let d = '';
  const gates = Math.floor(n / 5);
  for (let g = 0; g < Math.min(6, gates + (n % 5 ? 1 : 0)); g++) {
    const k = g < gates ? 5 : n % 5;
    d += tallyGatePath(bx + 14 + (g % 3) * 34, by + 16 + Math.floor(g / 3) * 46, 32, k);
  }
  return d;
}


/** The attack counter on the watchtower's board (a scene overlay in the dome's camera; S08's tally beat). Each new mark
 *  inks on as n grows (pass a time-driven count). */
export const DomeTallies: React.FC<{n: number; width?: number; seed?: string}> = ({n, width = SI.far, seed = 'dome'}) => {
  const k = Math.max(0, Math.min(30, Math.floor(n)));
  return k > 0 ? <Ink d={boardTallyPath(k)} width={width} taper={false} seed={`${seed}/tally`} /> : null;
};
