// props/Street.tsx — small street furniture and the running gag: Bollard (P17), Snail (P10), Calendar (P14).
//
//   <Bollard x={760} y={1530} />                          // 50 x 90 cream post, ink 4.8; bollardTop(760, 1530) = Pip's perch
//   <Snail x={520} y={1190} size={14} popAt={46.9} crawl={{at: 47.0, speed: 6}} />
//   <Calendar x={385} y={1040} pages={[{kind: 'season', i: 0}, ...yearPages(14)]} tearAt={[17.1, 17.2, ...]} />
//
// Anchors: Bollard / Snail = bottom centre on the ground; Calendar = top-left of its 70 x 80 body (the nail is above).

import React from 'react';
import {palette} from '../../../lib/theme';
import {ease as E, lerp, osc, prog, springAt, springs, useTime} from '../../../lib/time';
import {rand, Seed} from '../../../lib/rng';
import {Ink} from '../../../lib/Ink';
import {Fill} from '../../../lib/Fill';
import {blob, circle, line, rect, rectPath, roundRect, smooth, Pt} from '../../../lib/sketch';
import {mat, XG} from '../../../lib/xf';
import {bt, Depth, DEPTH_INK, misregScreen, PropRoot} from './common';

// ---------------------------------------------------------------- Bollard

export const bollardTop = (x: number, y: number, h = 90): Pt => [x, y - h];

export type BollardProps = {x: number; y: number; w?: number; h?: number; at?: number; outAt?: number; depth?: Depth; seed?: Seed; color?: string};

/** Cream stone bollard: rounded top, a tan band, a wider base, left shade strip. (x, y) = bottom centre. */
export const Bollard: React.FC<BollardProps> = ({x, y, w = 50, h = 90, at, outAt, depth = 'front', seed = 'bollard', color = palette.cream}) => {
  const iw = DEPTH_INK[depth];
  const r = w / 2;
  const body = `M${x - r} ${y}V${y - h + r}A${r} ${r} 0 0 1 ${x + r} ${y - h + r}V${y}Z`;
  const off = misregScreen(seed);
  return (
    <PropRoot outAt={outAt}>
      <Fill d={body} color={color} at={bt(at, 0.1)} offset={off} seed={`${seed}/f`} />
      <Fill d={rectPath(x - r, y - h + r, w * 0.24, h - r)} color={palette.sand} at={bt(at, 0.16)} mode="snap" offset={off} seed={`${seed}/sh`} />
      <Fill d={rectPath(x - r, y - h * 0.74, w, h * 0.09)} color={palette.tan} at={bt(at, 0.2)} mode="snap" offset={off} seed={`${seed}/band`} />
      <Fill d={rectPath(x - r - 5, y - 9, w + 10, 9)} color={palette.sand} at={bt(at, 0.2)} mode="snap" offset={off} seed={`${seed}/base`} />
      <Ink d={`M${x - r} ${y - 8}V${y - h + r}A${r} ${r} 0 0 1 ${x + r} ${y - h + r}V${y - 8}`} at={at} dur={0.2} width={iw} seed={`${seed}/o`} />
      <Ink d={line(x - r, y - h * 0.74, x + r, y - h * 0.74, {over: [2, 2], seed: `${seed}/b1`}) + line(x - r, y - h * 0.65, x + r, y - h * 0.65, {over: [2, 2], seed: `${seed}/b2`}) + rect(x - r - 5, y - 9, w + 10, 9, {seed: `${seed}/bs`, over: 4, edges: 'tlr'})} at={bt(at, 0.08)} width={iw * 0.7} seed={`${seed}/d`} />
    </PropRoot>
  );
};

// ---------------------------------------------------------------- Snail

export type SnailProps = {
  /** Bottom centre (foot on the ground). */
  x: number;
  y: number;
  /** Length in world px (S09 ledge ~12, S11 sill ~24, S10 specks 3-5). Default 24. */
  size?: number;
  popAt?: number;
  /** Crawl from popAt / at at `speed` world px/s (default 6) in its facing direction; optional max distance. */
  crawl?: {at: number; speed?: number; max?: number};
  /** Retracts into its shell. */
  hideAt?: number;
  flip?: boolean;
  depth?: Depth;
  seed?: Seed;
};

/** Sand shell with an ink spiral, cream foot, two eye stalks; slow peristalsis while crawling. Faces right. */
export const Snail: React.FC<SnailProps> = ({x, y, size = 24, popAt, crawl, hideAt, flip = false, depth = 'far', seed = 'snail'}) => {
  const t = useTime();
  if (popAt !== undefined && t < popAt) return null;
  const s = size / 24;
  let dx = 0;
  let moving = false;
  if (crawl && t >= crawl.at) {
    const d = (t - crawl.at) * (crawl.speed ?? 6);
    dx = crawl.max !== undefined ? Math.min(crawl.max, d) : d;
    moving = crawl.max === undefined || d < crawl.max;
  }
  const hide = hideAt !== undefined ? prog(t, hideAt, 0.2, E.inCubic) : 0;
  const pop = popAt !== undefined ? springAt(t, popAt, springs.pop) : 1;
  const peri = moving ? 1 + 0.06 * Math.sin(t * 5) : 1;
  const iw = Math.max(0.9, DEPTH_INK[depth] / s);
  const tiny = size < 8;
  const foot = smooth(
    [
      [-12, 0],
      [11, 0],
      [13, -2],
      [13, -6],
      [10, -8],
      [6, -5],
      [-2, -3],
      [-10, -2],
    ],
    {closed: true},
  );
  const stalk = osc(t, 1.3, rand(seed, 'p') * 6) * 1.2;
  const spiral = (() => {
    const pts: Pt[] = [];
    for (let i = 0; i <= 16; i++) {
      const a = (i / 16) * Math.PI * 3.4;
      const rr = 6.6 - (i / 16) * 5.4;
      pts.push([-2 + Math.cos(a + 2.2) * rr, -8.5 + Math.sin(a + 2.2) * rr]);
    }
    return smooth(pts);
  })();
  const sx = (flip ? -1 : 1) * s * pop;
  return (
    <XG m={mat.compose(mat.translate(x + (flip ? -dx : dx), y), mat.scale(sx, s * pop))}>
      {hide < 1 ? (
        <XG m={mat.about(mat.scale(peri * (1 - hide * 0.75), 1 - hide * 0.5), -2, 0)}>
          <Fill d={foot} color={palette.cream} offset={false} seed={`${seed}/ft`} />
          {!tiny ? <Ink d={foot} width={iw * 0.8} open={0.15} seed={`${seed}/fti`} /> : null}
          {!tiny && hide <= 0 ? <Ink d={`M10 -7L${12 + stalk} -14M11.5 -6.5L${15.5 + stalk} -12.5`} width={iw * 0.7} taper={false} seed={`${seed}/st`} order="all" /> : null}
          {!tiny && hide <= 0 ? <Fill d={blob(12 + stalk, -14.2, 1.3, 1.3, {seed: `${seed}/e1`}) + blob(15.5 + stalk, -12.7, 1.3, 1.3, {seed: `${seed}/e2`})} color={palette.ink} offset={false} seed={`${seed}/eyes`} /> : null}
        </XG>
      ) : null}
      <Fill d={blob(-2, -8.5, 7.6, 7.4, {seed: `${seed}/sh`})} color={palette.sand} offset={tiny ? false : [0.8, 0.6]} seed={`${seed}/sh`} />
      {!tiny ? <Ink d={circle(-2, -8.5, 7.6, {seed: `${seed}/sho`, overlap: 6}) + spiral} width={iw * 0.75} seed={`${seed}/shi`} /> : null}
    </XG>
  );
};

// ---------------------------------------------------------------- Calendar

export type CalPage = {kind: 'season'; i: 0 | 1 | 2 | 3} | {kind: 'year'} | {kind: 'summer'} | {kind: 'blank'};

/** n year pages (3 x 4 month grids). */
export const yearPages = (n: number): CalPage[] => Array.from({length: n}, () => ({kind: 'year' as const}));

export type CalendarProps = {
  /** Top-left of the 70 x 80 body (header + page). */
  x: number;
  y: number;
  w?: number;
  h?: number;
  pages: CalPage[];
  /** Each tear flips the current top page up and away (tearDur, default 0.1 s) revealing the next. */
  tearAt?: number[];
  tearDur?: number;
  at?: number;
  depth?: Depth;
  seed?: Seed;
};

function pagePict(p: CalPage, w: number, h: number, top: number, seed: string): {fill?: string; ink: string; extra?: {d: string; color: string}[]} {
  const cx = w / 2;
  const cy = top + (h - top) / 2;
  const u = Math.min(w, h - top);
  if (p.kind === 'year') {
    let d = '';
    const gx = w * 0.14;
    const gw = w * 0.72;
    const gy = top + (h - top) * 0.14;
    const gh = (h - top) * 0.72;
    for (let c = 0; c <= 3; c++) d += `M${(gx + (gw * c) / 3).toFixed(1)} ${gy.toFixed(1)}V${(gy + gh).toFixed(1)}`;
    for (let r = 0; r <= 4; r++) d += `M${gx.toFixed(1)} ${(gy + (gh * r) / 4).toFixed(1)}H${(gx + gw).toFixed(1)}`;
    return {ink: d};
  }
  if (p.kind === 'summer') {
    const wave = (yy: number) => `M${w * 0.18} ${yy}q${w * 0.08} -4 ${w * 0.16} 0t${w * 0.16} 0t${w * 0.16} 0t${w * 0.16} 0`;
    return {fill: palette.peach, ink: wave(cy + u * 0.02) + wave(cy + u * 0.16) + line(w * 0.14, cy + u * 0.3, w * 0.86, cy + u * 0.3, {over: [0, 0], seed: `${seed}/hz`}) + circle(cx + u * 0.18, cy - u * 0.2, u * 0.11, {seed: `${seed}/sun`})};
  }
  if (p.kind === 'season') {
    const i = p.i;
    if (i === 0) {
      // spring: a flower
      let d = '';
      for (let k = 0; k < 5; k++) {
        const a = (k / 5) * Math.PI * 2;
        d += circle(cx + Math.cos(a) * u * 0.14, cy - u * 0.06 + Math.sin(a) * u * 0.14, u * 0.09, {seed: `${seed}/p${k}`});
      }
      d += line(cx, cy + u * 0.06, cx, cy + u * 0.32, {over: [0, 0], seed: `${seed}/stem`});
      return {ink: d, extra: [{d: blob(cx, cy - u * 0.06, u * 0.07, u * 0.07, {seed: `${seed}/c`}), color: palette.peach}]};
    }
    if (i === 1) return {ink: circle(cx, cy, u * 0.2, {seed: `${seed}/s`}), extra: [{d: blob(cx, cy, u * 0.2, u * 0.2, {seed: `${seed}/sf`}), color: palette.peach}]};
    if (i === 2) {
      const leaf = `M${cx - u * 0.22} ${cy + u * 0.2}Q${cx - u * 0.2} ${cy - u * 0.22} ${cx + u * 0.22} ${cy - u * 0.22}Q${cx + u * 0.2} ${cy + u * 0.2} ${cx - u * 0.22} ${cy + u * 0.2}Z`;
      return {ink: leaf + `M${cx - u * 0.28} ${cy + u * 0.26}L${cx + u * 0.1} ${cy - u * 0.1}`, extra: [{d: leaf, color: palette.tan}]};
    }
    let d = '';
    for (let k = 0; k < 3; k++) {
      const a = (k / 3) * Math.PI;
      d += `M${(cx - Math.cos(a) * u * 0.26).toFixed(1)} ${(cy - Math.sin(a) * u * 0.26).toFixed(1)}L${(cx + Math.cos(a) * u * 0.26).toFixed(1)} ${(cy + Math.sin(a) * u * 0.26).toFixed(1)}`;
    }
    return {ink: d};
  }
  return {ink: ''};
}

/** Tear-off wall calendar: cream pages, a sand header with two rings, NO numerals. */
export const Calendar: React.FC<CalendarProps> = ({x, y, w = 70, h = 80, pages, tearAt = [], tearDur = 0.1, at, depth = 'far', seed = 'cal'}) => {
  const t = useTime();
  if (at !== undefined && t < at) return null;
  const iw = DEPTH_INK[depth];
  const head = h * 0.2;
  let torn = 0;
  for (const ta of tearAt) if (t >= ta + tearDur) torn++;
  const tearing = tearAt.find((ta) => t >= ta && t < ta + tearDur);
  const cur = Math.min(pages.length - 1, torn);
  const next = Math.min(pages.length - 1, cur + 1);
  const off = misregScreen(seed);
  const page = (p: CalPage, key: string, k: string) => {
    const pic = pagePict(p, w, h, head, `${seed}/${k}`);
    return (
      <g key={key}>
        <Fill d={rectPath(0, head, w, h - head)} color={pic.fill ?? palette.cream} offset={false} mode="none" seed={`${seed}/pg${k}`} />
        {pic.extra?.map((e, i) => <Fill key={i} d={e.d} color={e.color} offset={false} mode="none" seed={`${seed}/ex${k}${i}`} />)}
        {pic.ink ? <Ink d={pic.ink} width={iw * 0.7} seed={`${seed}/pi${k}`} /> : null}
        <Ink d={rect(0, head, w, h - head, {seed: `${seed}/po${k}`, over: 2, edges: 'lrb'})} width={iw} seed={`${seed}/po${k}`} />
      </g>
    );
  };
  let flying: React.ReactNode = null;
  if (tearing !== undefined) {
    const q = (t - tearing) / tearDur;
    const flipY = 1 - 1.4 * E.inQuad(Math.min(1, q * 1.4));
    flying = <XG m={mat.compose(mat.translate(lerp(0, -w * 0.5, q), lerp(0, -h * 0.7, E.inQuad(q))), mat.about(mat.rotate(-35 * q), 0, head), mat.about(mat.scale(1, flipY), 0, head))}>{page(pages[cur], 'fly', `c${cur}`)}</XG>;
  }
  return (
    <XG m={mat.translate(x, y)}>
      <Ink d={`M${w * 0.2} 0L${w / 2} ${-h * 0.12}L${w * 0.8} 0`} at={at} width={iw * 0.6} seed={`${seed}/str`} />
      <Fill d={blob(w / 2, -h * 0.12, 2.2, 2.2, {seed: `${seed}/nail`})} color={palette.ink} offset={false} at={at} mode="snap" seed={`${seed}/nail`} />
      {page(pages[tearing !== undefined ? next : cur], 'under', `u${tearing !== undefined ? next : cur}`)}
      <Fill d={roundRect(0, 0, w, head + 2, 3)} color={palette.sand} at={bt(at, 0.05)} offset={off} seed={`${seed}/hd`} />
      <Ink d={rect(0, 0, w, head, {seed: `${seed}/hdo`, over: 3})} at={at} dur={0.15} width={iw} seed={`${seed}/hdo`} />
      <Ink d={circle(w * 0.3, head * 0.5, head * 0.18, {seed: `${seed}/r1`}) + circle(w * 0.7, head * 0.5, head * 0.18, {seed: `${seed}/r2`})} width={iw * 0.6} seed={`${seed}/rings`} />
      {flying}
    </XG>
  );
};
