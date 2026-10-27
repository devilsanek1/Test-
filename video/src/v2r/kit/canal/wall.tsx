// canal/wall.tsx: S2's RECEDING WALL (TREATMENT §5 S2; map S2): Google's canal wing in 3/4 from the south towpath,
// cut by the left edge and receding right, two storeys of windows from ~150 px wide at the left edge to ~10 px at the
// right edge, the stepped tiers of the main building small behind it (all at y >= 600, ~380 tiny windows in ONE
// batched path with LOD), pigeons on the parapet. Her dark window and the five staff windows sit EXACTLY on the
// map's rects (story windows: lanes and K4's blind rig layer over them through `storyOverlay`); every other column
// is procedural: the first three columns follow the map, the rest continue in one-point perspective toward a
// vanishing point off the right edge (VP), so the wall really recedes.

import React, {useMemo} from 'react';
import {CM, INK_PX} from '../../palette';
import {useTime} from '../../../lib/time';
import {line, poly} from '../../../lib/sketch';
import {Batch, Paint, P, Pt, rng, lerp, lobes, ovalPath} from './core';
import {litAt} from './life';
import * as MAP from '../../world/map';

/** The S2 lens: the wing's lines meet at VP (off the right edge); the map's first three columns are drawn as given. */
export const S2_WALL = {
  vp: [1400, 700] as Pt,
  /** Projective step per column beyond column 2 (spacing ~125 px there, shrinking toward the VP). */
  k: 0.1333,
  /** Column knots (u = column index; x = window centre) for u <= 2: col 0 = her window, 1 = W2, 2 = SW2. */
  knots: [
    {u: -2, x: -86, g: 1.43},
    {u: -1, x: 60, g: 1.32},
    {u: 0, x: 200, g: 1.214},
    {u: 1, x: 335, g: 1.107},
    {u: 2, x: 465, g: 1.0},
  ],
  /** Level lines at the knots (screen y): parapet top, coping foot, first-storey window top/bottom, the stone band,
   *  ground-storey window top/bottom, plinth top, base. Beyond column 2: y = vpY + (y@2 - vpY) * g(u). */
  levels: {
    parapet: [646, 650, 654, 658, 662],
    coping: [657, 661, 664, 667, 670],
    firstTop: [714, 712, 710, 707.5, 706],
    firstBot: [912, 895, 880, 862.5, 846],
    bandTop: [916, 902, 888, 870, 856],
    bandBot: [930, 914, 900, 884, 870],
    groundTop: [914, 912, 910, 907.5, 903],
    groundBot: [1028, 1018, 1010, 1002.5, 993],
    plinth: [1036, 1026, 1018, 1010, 1000],
    base: [1050, 1040, 1031, 1022, 1012],
  },
};
type Level = keyof typeof S2_WALL.levels;

const knotIdx = (u: number) => Math.max(0, Math.min(S2_WALL.knots.length - 2, Math.floor(u - S2_WALL.knots[0].u)));

/** Perspective scale g(u) (1 at column 2) and window-centre x(u) of column position u (continuous). */
export function s2g(u: number): number {
  if (u >= 2) return 1 / (1 + S2_WALL.k * (u - 2));
  const i = knotIdx(u);
  const a = S2_WALL.knots[i];
  const c = S2_WALL.knots[i + 1];
  return lerp(a.g, c.g, (u - a.u) / (c.u - a.u));
}
export function s2x(u: number): number {
  const [vx] = S2_WALL.vp;
  if (u >= 2) return vx - (vx - 465) * s2g(u);
  const i = knotIdx(u);
  const a = S2_WALL.knots[i];
  const c = S2_WALL.knots[i + 1];
  return lerp(a.x, c.x, (u - a.u) / (c.u - a.u));
}
/** Screen y of a level line at column position u. */
export function s2y(level: Level, u: number): number {
  const L = S2_WALL.levels[level];
  const vy = S2_WALL.vp[1];
  if (u >= 2) return vy + (L[4] - vy) * s2g(u);
  const i = knotIdx(u);
  const a = S2_WALL.knots[i];
  return lerp(L[i], L[i + 1], (u - a.u) / (S2_WALL.knots[i + 1].u - a.u));
}
/** Column position u at screen x (inverse of s2x, bisection). */
export function s2u(x: number): number {
  let lo = -2;
  let hi = 60;
  for (let i = 0; i < 60; i++) {
    const m = (lo + hi) / 2;
    if (s2x(m) < x) lo = m;
    else hi = m;
  }
  return (lo + hi) / 2;
}
/** A band between two levels from u0 to u1 as a polygon (sampled). */
function bandPts(top: Level | ((u: number) => number), bot: Level | ((u: number) => number), u0: number, u1: number): Pt[] {
  const T = typeof top === 'string' ? (u: number) => s2y(top, u) : top;
  const B = typeof bot === 'string' ? (u: number) => s2y(bot, u) : bot;
  const pts: Pt[] = [];
  const n = Math.max(2, Math.ceil((u1 - u0) * 3));
  for (let i = 0; i <= n; i++) {
    const u = lerp(u0, u1, i / n);
    pts.push([s2x(u), T(u)]);
  }
  for (let i = n; i >= 0; i--) {
    const u = lerp(u0, u1, i / n);
    pts.push([s2x(u), B(u)]);
  }
  return pts;
}

/** The story windows (map S2): her dark window and the five staff windows, by id. */
export const S2_STORY: (MAP.Spot & {id: string; col: number; row: 'first' | 'ground'})[] = [
  {...MAP.S2.herDarkWindow, id: 'HER', col: 0, row: 'first'},
  {...MAP.S2.staffWindows[0], col: 1, row: 'first'},
  {...MAP.S2.staffWindows[1], col: 2, row: 'first'},
  {...MAP.S2.staffWindows[2], col: 2, row: 'ground'},
  {...MAP.S2.staffWindows[3], col: 1, row: 'ground'},
  {...MAP.S2.staffWindows[4], col: 0, row: 'ground'},
];

export type StoryState = 'lit' | 'cool' | 'dark' | 'unlit';

export type WingS2Props = {
  /** State of each story window by id ('HER', 'W2', 'SW2'...). Default: HER dark, staff lit (golden). */
  story?: Record<string, StoryState>;
  /** The staff windows turn a cooler white at this time (map staffOnAt 8.96, 0.04 s apart). Omit = stay lit. */
  staffCoolAt?: number;
  staffStagger?: number;
  /** Drawn over each story window (K4's silhouettes and blinds; the ring round hers). */
  storyOverlay?: (w: MAP.Spot & {id: string}) => React.ReactNode;
  /** Lit share of the procedural windows (the golden wing is half lit). */
  litFrac?: number;
  seed?: string;
};

/** The receding wing + its tiers. */
export const WingS2: React.FC<WingS2Props> = ({story = {}, staffCoolAt, staffStagger = MAP.S2.staffOnStagger, storyOverlay, litFrac = 0.5, seed = 'wingS2'}) => {
  const t = useTime();
  const uEnd = s2u(1120);
  const stat = useMemo(() => {
    const b = new Batch();
    const r = rng(seed);
    // ---- the tiers behind (y >= 600): three setbacks, each a band with rows of tiny windows and a planted edge
    const tiers = [
      {top: (u: number) => Math.max(602, s2y('parapet', u) - 26 * s2g(u)), col: CM.limestone, win: 0.9},
      {top: (u: number) => Math.max(601, s2y('parapet', u) - 48 * s2g(u) + Math.sin(u * 0.9) * 2), col: CM.stucco, win: 0.8},
      {top: (u: number) => Math.max(600, s2y('parapet', u) - 64 * s2g(u)), col: CM.brickLight, win: 0.7},
    ];
    // far tier first (it is highest), drawn as stepped blocks so the skyline steps
    for (let k = tiers.length - 1; k >= 0; k--) {
      const T = tiers[k];
      let u = -2.5 + k * 0.7;
      let blk = 0;
      while (u < uEnd) {
        const w = r.range(2.2, 4.5);
        const step = (blk % 3) * 6 * s2g(u);
        const top = (uu: number) => Math.max(600, T.top(uu) + step);
        b.poly(blk % 2 ? T.col : CM.limestone, bandPts(top, 'coping', u, u + w));
        // planting on the setback edge
        const [px, py] = [s2x(u + w * 0.5), top(u + w * 0.5)];
        const gs = s2g(u + w * 0.5);
        if (py - 14 * gs > 600) b.fill(k === 1 ? CM.leafGold : CM.sage, lobes(px - 24 * gs, px + 24 * gs, py + 2, 10 * gs, `${seed}/tp${k}${blk}`, 2));
        u += w;
        blk++;
      }
    }
    b.layer();
    // tiny tier windows: ONE batched path per colour, LOD: under 4 px they become specks
    for (let k = 0; k < tiers.length; k++) {
      const T = tiers[k];
      for (let u = -2; u < uEnd; u += 0.33) {
        const g = s2g(u);
        const x = s2x(u);
        const top = T.top(u) + 6 * g;
        const bot = s2y('parapet', u) - (k === 0 ? 2 : 10) * g;
        const ww = Math.max(1.4, 9 * g * g);
        const wh = Math.max(2, 7 * g);
        for (let y = top; y + wh < bot; y += wh * 1.9) {
          const v = r.next();
          const col = v < 0.3 ? CM.lamp : v < 0.65 ? CM.paneUnlit : CM.glass;
          b.rect(col, x - ww / 2, y, ww, wh);
        }
      }
    }
    b.layer();
    // ---- the wing: brick, the coping, the stone band, the plinth
    b.poly(CM.brickLight, bandPts('parapet', 'base', -2.5, uEnd));
    b.poly(CM.limestone, bandPts('parapet', 'coping', -2.5, uEnd));
    b.poly(CM.stoneShade, bandPts((u) => s2y('coping', u) - 3 * s2g(u), 'coping', -2.5, uEnd));
    b.poly(CM.limestone, bandPts('bandTop', 'bandBot', -2.5, uEnd));
    b.poly(CM.limestone, bandPts('plinth', 'base', -2.5, uEnd));
    b.poly(CM.stoneShade, bandPts('plinth', (u) => s2y('plinth', u) + 4 * s2g(u), -2.5, uEnd));
    // the roof-terrace planting over the coping (y >= 600)
    for (let u = -2.3; u < uEnd; u += r.range(0.4, 0.8)) {
      const g = s2g(u);
      const x = s2x(u);
      const y = s2y('parapet', u);
      const h = Math.min(y - 601, r.range(10, 22) * g);
      if (h > 2) b.fill(r.pick([CM.sage, CM.sage, CM.leafGold, CM.leafRust]), lobes(x - 26 * g, x + 26 * g, y + 2, h, `${seed}/pl${u.toFixed(2)}`, 2));
    }
    // fins between the columns: slim limestone with a shade strip (sun from the west = screen left)
    for (let u = -2.5; u < uEnd; u += 1) {
      const g = s2g(u);
      const x = s2x(u);
      const w = Math.max(1.5, 12 * g * g);
      b.poly(CM.limestone, [[x - w / 2, s2y('coping', u)], [x + w / 2, s2y('coping', u)], [x + w / 2, s2y('plinth', u)], [x - w / 2, s2y('plinth', u)]]);
      b.poly(CM.stoneShade, [[x + w / 2, s2y('coping', u)], [x + w * 0.9, s2y('coping', u)], [x + w * 0.9, s2y('plinth', u)], [x + w / 2, s2y('plinth', u)]]);
    }
    // ink: coping line, band, plinth, base (overshooting), the near fins
    let st = '';
    const L = (lv: Level, over: 'small' | 'medium' | 'structural') => {
      let d = '';
      const pts: Pt[] = [];
      for (let u = -2.5; u <= uEnd; u += 0.5) pts.push([s2x(u), s2y(lv, u)]);
      for (let i = 0; i < pts.length - 1; i += 2) d += line(pts[i][0], pts[i][1], pts[Math.min(pts.length - 1, i + 2)][0], pts[Math.min(pts.length - 1, i + 2)][1], {seed: `${seed}/${lv}${i}`, over, breaks: false});
      return d;
    };
    st += L('parapet', 'medium') + L('bandTop', 'small') + L('plinth', 'small') + L('base', 'small');
    for (let u = -1.5; u < 6; u += 1) {
      const x = s2x(u);
      st += line(x - 5 * s2g(u), s2y('coping', u), x - 5 * s2g(u), s2y('plinth', u), {seed: `${seed}/fin${u}`, over: 'small'});
    }
    b.ink(st, INK_PX.far);
    return b;
  }, [seed, uEnd]);

  // ---- per frame: the procedural windows (switching) and the story windows (exact rects, states)
  const dyn = new Batch();
  let frames = '';
  let k = 0;
  const cols: number[] = [];
  for (let c = -2; c <= Math.ceil(uEnd); c++) cols.push(c);
  const N = cols.length * 2;
  for (const c of cols) {
    for (const row of ['first', 'ground'] as const) {
      const story = S2_STORY.find((s) => s.col === c && s.row === row);
      k++;
      if (story) continue;
      const g = s2g(c);
      const x = s2x(c);
      const w = (row === 'first' ? 110 : 100) * g * g * (c < 2 ? 1.12 : 1);
      const y0 = s2y(row === 'first' ? 'firstTop' : 'groundTop', c);
      const y1 = s2y(row === 'first' ? 'firstBot' : 'groundBot', c);
      if (x - w / 2 > 1100 || w < 1) continue;
      const on = litAt(t, seed, k, N, {litFrac});
      windowInto(dyn, x - w / 2, y0, w, y1 - y0, on ? 'lit' : 'unlit', `${seed}/w${c}${row}${on ? 'L' : 'U'}`);
      if (w > 14) {
        dyn.rect(CM.shadeCool, x - Math.max(0.8, w * 0.015), y0, Math.max(1.6, w * 0.03), y1 - y0);
        dyn.rect(CM.shadeCool, x - w / 2, y0 + (y1 - y0) * 0.2, w, Math.max(1.2, (y1 - y0) * 0.018));
      }
      if (w > 6) dyn.rect(CM.limestone, x - w / 2 - w * 0.06, y1, w * 1.12, Math.max(1.5, 6 * g));
      if (w > 22) frames += poly([[x - w / 2, y0], [x + w / 2, y0], [x + w / 2, y1], [x - w / 2, y1]], {closed: true, over: 'small', seed: `${seed}/f${c}${row}`});
    }
  }
  dyn.ink(frames, INK_PX.far);
  // story windows: exact rects
  const sb = new Batch();
  let sfr = '';
  S2_STORY.forEach((w, i) => {
    const staffIdx = MAP.S2.staffWindows.findIndex((s) => s.id === w.id);
    let st: StoryState = story[w.id] ?? (w.id === 'HER' ? 'dark' : 'lit');
    if (staffCoolAt !== undefined && staffIdx >= 0 && t >= staffCoolAt + staffIdx * staffStagger && !story[w.id]) st = 'cool';
    const x0 = w.x - w.w / 2;
    const y0 = w.y - w.h / 2;
    sb.rect(CM.stoneShade, x0 - 5, y0, 5, w.h);
    windowInto(sb, x0, y0, w.w, w.h, st, `${seed}/story${i}`);
    sb.rect(CM.shadeCool, x0 + w.w * 0.5 - 2, y0, 4, w.h);
    sb.rect(CM.shadeCool, x0, y0 + w.h * 0.2, w.w, 3);
    sb.rect(CM.limestone, x0 - 8, y0 + w.h, w.w + 16, 7);
    sfr += poly([[x0, y0], [x0 + w.w, y0], [x0 + w.w, y0 + w.h], [x0, y0 + w.h]], {closed: true, over: 'small', seed: `${seed}/sf${i}`});
  });
  sb.ink(sfr, INK_PX.mid);
  return (
    <>
      <Paint b={stat} seed={`${seed}/stat`} />
      <Paint b={dyn} seed={`${seed}/dyn`} />
      <Paint b={sb} seed={`${seed}/story`} />
      {storyOverlay ? S2_STORY.map((w) => <React.Fragment key={w.id}>{storyOverlay(w)}</React.Fragment>) : null}
    </>
  );
};

/** A flat window pane in screen space (axis-aligned): lit / unlit / cool (a cooler white) / dark (plum). */
export function windowInto(b: Batch, x: number, y: number, w: number, h: number, state: StoryState, seed: string) {
  const r = rng(seed);
  if (state === 'dark') {
    b.rect(CM.anchor, x, y, w, h);
    if (w > 20) b.poly(CM.paneUnlit, [[x + w * 0.08, y + h * 0.05], [x + w * 0.32, y + h * 0.05], [x + w * 0.08, y + h * 0.28]]);
    return;
  }
  if (state === 'cool') {
    b.rect(CM.paper, x, y, w, h);
    b.rect(CM.glass, x, y + h * 0.84, w, h * 0.16);
    return;
  }
  if (state === 'unlit') {
    b.rect(CM.glass, x, y, w, h);
    const lo = r.range(0.45, 0.65);
    b.poly(CM.shadeCool, [[x, y + h * lo], [x + w, y + h * (lo - 0.2)], [x + w, y + h], [x, y + h]]);
    if (w > 14) b.poly(CM.skyHigh, [[x + w * 0.12, y], [x + w * 0.4, y], [x, y + h * 0.35], [x, y + h * 0.15]]);
    return;
  }
  b.rect(CM.lamp, x, y, w, h);
  if (w > 10) {
    b.rect(CM.lampCore, x + w * 0.12, y + h * 0.1, w * 0.76, h * 0.45);
    const kind = r.int(0, 2);
    if (kind === 0) b.rect(CM.coatOat, x, y, w, h * r.range(0.18, 0.4));
    if (kind === 1 && w > 30) b.fill(CM.sage, lobes(x + w * 0.1, x + w * 0.45, y + h, h * 0.35, `${seed}/pl`, 2));
    if (kind === 2 && w > 30) b.fill(CM.anchor, ovalPath(x + w * 0.5, y + h * 0.18, w * 0.12, h * 0.05));
    b.poly(CM.glass, [[x + w, y], [x + w, y + h * 0.18], [x + w * 0.8, y]]);
  }
}
