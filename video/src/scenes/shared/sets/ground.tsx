// sets/ground.tsx — how the sets draw GROUND and FOREGROUND (review 4).
//
// Ground (style bible 7 + ref 2 f_1 / f_12): ONE flat field with 2-3 broken kerb / paving lines and sparse specks,
// never a ruler-straight perspective tile grid. `groundMarks()` returns a few broken, tapering paving / kerb segments
// that start near the vanishing point and DIE before they reach the viewer, a couple of partial cross joints, and
// seeded ground specks (3-10 px dashes, larger near).
//
// Foreground (ref 2: >= 2 edge-cut elements per shot, a bottom audience in 9 of 16 shots): <Foreground spec=.../> draws
// presets in the bottom band (y >= ~1480, under the platform UI, so it frames the shot without carrying action):
//   'heads'   3-4 back-view heads + shoulders cut by the bottom edge (props EdgeOnlooker), the centre left open
//   'kerb'    a near kerb (sand band, bold broken lines) with two near bollards (the right one cut by the edge) and a
//             drain grate
//   'railing' a low iron railing across the bottom-left, cut by the left edge, ending in a post at x 700
//   'treeL' / 'treeR'  a near tree cropped by a side edge, trunk into a tree pit at kerb height
// Every street set takes `foreground?: ForegroundSpec` (a preset, a list of presets, any node, or false).

import React from 'react';
import {palette} from '../../../lib/theme';
import {Ink} from '../../../lib/Ink';
import {Fill} from '../../../lib/Fill';
import {crown, crownTicks, ellipse, line, rectPath, Pt} from '../../../lib/sketch';
import {rng, Seed} from '../../../lib/rng';
import {SI} from './common';
import {BollardSlot, OnlookerSlot} from './propSlots';
import type {Acc, Hair} from '../../../lib/kit';

// ---------------------------------------------------------------- ground marks

export type GroundMarksOpts = {
  /** Vanishing point the paving lines run toward. */
  vp: Pt;
  /** Ground band (world y): the far edge (top) and the frame bottom. */
  top: number;
  bottom: number;
  /** Width of the ground at the bottom edge. */
  x0: number;
  x1: number;
  /** Broken paving lines toward the VP (default 4) and partial cross joints (default 2). */
  rays?: number;
  cross?: number;
  /** Ground specks (default 16). */
  specks?: number;
  /** How far down the frame the paving lines may reach before they die (fraction of top..bottom, default 0.62). */
  reach?: number;
  /** Keep marks out of a region (paths, props). */
  avoid?: (x: number, y: number) => boolean;
  seed: Seed;
};

const f1 = (n: number) => n.toFixed(1);

/** A few broken, tapering paving / kerb segments that thin out and die toward the viewer + seeded specks. */
export function groundMarks(o: GroundMarksOpts): {lines: string; specks: string} {
  const r = rng(`gm/${o.seed}`);
  const {vp, top, bottom, x0, x1} = o;
  const H = bottom - top;
  const reach = o.reach ?? 0.62;
  const rayX = (xb: number, y: number) => vp[0] + ((xb - vp[0]) * (y - vp[1])) / (bottom - vp[1]);
  let lines = '';
  const n = o.rays ?? 4;
  for (let i = 0; i < n; i++) {
    const xb = x0 + ((x1 - x0) * (i + 0.5 + r.range(-0.3, 0.3))) / n;
    const ya = top + H * r.range(0.02, 0.12);
    const yb = top + H * reach * r.range(0.55, 1);
    // 2-3 pen strokes with 10-28 px gaps
    const pieces = r.int(2, 3);
    let y = ya;
    for (let p = 0; p < pieces; p++) {
      const yEnd = p === pieces - 1 ? yb : y + ((yb - y) / (pieces - p)) * r.range(0.7, 1.1);
      if (yEnd - y > 14 && !(o.avoid && (o.avoid(rayX(xb, y), y) || o.avoid(rayX(xb, yEnd), yEnd)))) lines += line(rayX(xb, y), y, rayX(xb, yEnd), yEnd, {seed: `gm/${o.seed}/r${i}/${p}`, over: [0, 0], breaks: false, drift: 0.3});
      y = yEnd + r.range(10, 28);
      if (y >= yb) break;
    }
  }
  const m = o.cross ?? 2;
  for (let k = 1; k <= m; k++) {
    const y = top + H * Math.pow(k / (m + 1.4), 1.5) * reach * 1.25;
    const xl = rayX(x0, y);
    const xr = rayX(x1, y);
    const a = xl + (xr - xl) * r.range(0.05, 0.4);
    const b = a + (xr - xl) * r.range(0.25, 0.5);
    const cut = a + (b - a) * r.range(0.35, 0.65);
    if (!(o.avoid && o.avoid((a + b) / 2, y))) lines += line(a, y, cut - 6, y + r.jitter(1), {seed: `gm/${o.seed}/c${k}a`, over: [0, 0], breaks: false}) + line(cut + 8, y, b, y + r.jitter(1.5), {seed: `gm/${o.seed}/c${k}b`, over: [0, 0], breaks: false});
  }
  let specks = '';
  const s = o.specks ?? 16;
  for (let i = 0, tries = 0; i < s && tries < s * 4; tries++) {
    const v = Math.pow(r.next(), 0.75);
    const y = top + 20 + v * (H - 30);
    const xl = rayX(x0, y);
    const xr = rayX(x1, y);
    const x = r.range(Math.max(-20, xl), Math.min(1100, xr));
    if (o.avoid && o.avoid(x, y)) continue;
    const L = 3 + v * 7 + r.range(0, 2);
    specks += `M${f1(x)} ${f1(y)}l${f1(L)} ${f1(r.range(-0.6, 0.6))}`;
    i++;
  }
  return {lines, specks};
}

/** Draws groundMarks: lines tapered (thin far ends), specks short dashes. */
export const GroundMarks: React.FC<{marks: {lines: string; specks: string}; width?: number; color?: string; at?: number; seed?: Seed}> = ({marks, width = SI.far, color, at, seed = 'gm'}) => (
  <>
    {marks.lines ? <Ink d={marks.lines} width={width} color={color} at={at} taper vary={0.1} seed={`${seed}/l`} /> : null}
    {marks.specks ? <Ink d={marks.specks} width={width} color={color} at={at} taper={false} vary={0.15} seed={`${seed}/s`} /> : null}
  </>
);

// ---------------------------------------------------------------- foreground presets

export type ForegroundPreset = 'heads' | 'kerb' | 'railing' | 'treeL' | 'treeR';
export type ForegroundSpec = ForegroundPreset | ForegroundPreset[] | React.ReactNode | false;

const HEADS: {x: number; y: number; head: number; hair: Hair; body: string; acc: Acc[]; rim: 'left' | 'right'}[] = [
  {x: 70, y: 1700, head: 118, hair: 'short', body: palette.teal, acc: ['hood'], rim: 'right'},
  {x: 300, y: 1800, head: 112, hair: 'bun', body: palette.sand, acc: ['scarf'], rim: 'right'},
  {x: 800, y: 1810, head: 112, hair: 'cap', body: palette.sage, acc: ['collar'], rim: 'left'},
  {x: 1015, y: 1715, head: 120, hair: 'long', body: palette.brown, acc: [], rim: 'left'},
];

const KERB = (() => {
  const s = 'fgk';
  const y = 1660;
  const lines = line(-160, y, 520, y + 3, {seed: `${s}/1`, over: 0, breaks: false}) + line(546, y + 3, 1240, y + 6, {seed: `${s}/2`, over: 0, breaks: false}) + line(-160, y + 26, 300, y + 28, {seed: `${s}/3`, over: 0, breaks: false}) + line(330, y + 28, 1240, y + 33, {seed: `${s}/4`, over: 0, breaks: false});
  const band = `M-160 ${y}L1240 ${y + 6}L1240 ${y + 33}L-160 ${y + 26}Z`;
  const grate = rectPath(600, y + 60, 120, 34);
  let grateInk = line(600, y + 60, 720, y + 60, {seed: `${s}/g1`, over: [3, 3], breaks: false}) + line(600, y + 94, 720, y + 94, {seed: `${s}/g2`, over: [2, 4], breaks: false});
  for (let i = 1; i < 6; i++) grateInk += `M${600 + i * 20} ${y + 66}L${600 + i * 20} ${y + 88}`;
  return {y, lines, band, grate, grateInk};
})();

const RAIL = (() => {
  const s = 'fgr';
  const y = 1710;
  // from the left edge to an end post at x 700 (the right of the frame stays open): sparse bars, two rails
  const x1 = 700;
  let posts = '';
  let postInk = '';
  for (let x = -30; x < x1; x += 96) {
    posts += rectPath(x - 3, y, 6, 260);
    postInk += `M${x - 3} ${y + 10}L${x - 3} 1960M${x + 3} ${y + 10}L${x + 3} 1960`;
  }
  posts += rectPath(x1 - 9, y - 30, 18, 300);
  postInk += line(x1 - 9, 1960, x1 - 9, y - 30, {seed: `${s}/e1`, over: 0}) + line(x1 + 9, 1960, x1 + 9, y - 30, {seed: `${s}/e2`, over: 0}) + line(x1 - 14, y - 32, x1 + 14, y - 32, {seed: `${s}/e3`, over: [2, 2]});
  const rails = rectPath(-160, y - 12, x1 + 160, 12) + rectPath(-160, y + 120, x1 + 160, 7);
  const railInk = line(-160, y - 12, x1, y - 14, {seed: `${s}/t1`, over: [0, 4]}) + line(-160, y, x1, y - 2, {seed: `${s}/t2`, over: [0, 3]}) + line(-160, y + 120, x1, y + 118, {seed: `${s}/b1`, over: [0, 4]});
  return {posts, postInk, rails, railInk};
})();

const TREE = (side: 'L' | 'R') => {
  const cx = side === 'L' ? -10 : 1090;
  const cy = 1390;
  const pit = 1700;
  const crownD = crown(cx, cy, 150, 165, {seed: `fgt${side}`, bumps: 11});
  const ticks = crownTicks(cx, cy, 150, 165, {seed: `fgt${side}k`, n: 5, size: 14});
  const tx = side === 'L' ? 46 : 1034;
  const trunk = rectPath(tx - 13, cy + 100, 26, pit - cy - 100);
  const trunkInk = line(tx - 13, pit, tx - 12, cy + 110, {seed: `fgt${side}t1`, over: 0}) + line(tx + 13, pit, tx + 12, cy + 120, {seed: `fgt${side}t2`, over: 0});
  const pitInk = ellipse(tx, pit, 70, 16, {seed: `fgt${side}p`, overlap: -30});
  const pitFill = `M${tx - 70} ${pit}a70 16 0 1 0 140 0a70 16 0 1 0 -140 0Z`;
  return {crownD, ticks, trunk, trunkInk, pitInk, pitFill};
};
const TREES = {L: TREE('L'), R: TREE('R')};

const Preset: React.FC<{p: ForegroundPreset; seed: string; at?: number}> = ({p, seed, at}) => {
  if (p === 'heads')
    return (
      <>
        {HEADS.map((h, i) => (
          <OnlookerSlot key={i} x={h.x} y={h.y} head={h.head} hair={h.hair} body={h.body} acc={h.acc} rim={h.rim} riseAt={at === undefined ? undefined : at + i * 0.06} seed={`${seed}/h${i}`} />
        ))}
      </>
    );
  if (p === 'kerb')
    return (
      <>
        <Fill d={KERB.band} color={palette.sand} offset={false} mode="snap" at={at} seed={`${seed}/kb`} />
        <Fill d={KERB.grate} color={palette.tealDark} at={at} seed={`${seed}/gr`} />
        <Ink d={KERB.lines} width={SI.front} at={at} seed={`${seed}/kl`} />
        <Ink d={KERB.grateInk} width={SI.mid} taper={false} at={at} seed={`${seed}/gi`} />
        <BollardSlot x={160} y={KERB.y - 150} w={76} h={160} at={at} seed={`${seed}/b1`} />
        <BollardSlot x={1046} y={KERB.y - 144} w={74} h={154} at={at === undefined ? undefined : at + 0.06} seed={`${seed}/b2`} />
      </>
    );
  if (p === 'railing')
    return (
      <>
        <Fill d={RAIL.posts} color={palette.tealDark} offset={false} mode="snap" at={at} seed={`${seed}/rp`} />
        <Fill d={RAIL.rails} color={palette.teal} at={at} seed={`${seed}/rr`} />
        <Ink d={RAIL.railInk} width={SI.front} at={at} seed={`${seed}/ri`} />
        <Ink d={RAIL.postInk} width={SI.far} taper={false} at={at} seed={`${seed}/rpi`} />
      </>
    );
  const T = TREES[p === 'treeL' ? 'L' : 'R'];
  return (
    <>
      <Fill d={T.pitFill} color={palette.tan} offset={false} at={at} seed={`${seed}/pit`} />
      <Fill d={T.trunk} color={palette.brown} at={at} seed={`${seed}/tr`} />
      <Ink d={T.trunkInk + T.pitInk} width={SI.front} taper={false} at={at} seed={`${seed}/ti`} />
      <Fill d={T.crownD} color={palette.teal} at={at} seed={`${seed}/cr`} />
      <Ink d={T.crownD} width={SI.front} open={0.14} at={at} seed={`${seed}/ci`} />
      <Ink d={T.ticks} width={SI.mid} taper={false} at={at} seed={`${seed}/ck`} />
    </>
  );
};

const PRESETS: ForegroundPreset[] = ['heads', 'kerb', 'railing', 'treeL', 'treeR'];
const isPreset = (v: unknown): v is ForegroundPreset => typeof v === 'string' && (PRESETS as string[]).includes(v);

/** The foreground framing band (see the file header). `at` pops the presets in (heads rise). */
export const Foreground: React.FC<{spec?: ForegroundSpec; at?: number; seed?: string}> = ({spec, at, seed = 'fg'}) => {
  if (spec === false || spec === undefined || spec === null) return null;
  if (isPreset(spec)) return <Preset p={spec} seed={`${seed}/${spec}`} at={at} />;
  if (Array.isArray(spec) && spec.every(isPreset))
    return (
      <>
        {(spec as ForegroundPreset[]).map((p) => (
          <Preset key={p} p={p} seed={`${seed}/${p}`} at={at} />
        ))}
      </>
    );
  return <>{spec as React.ReactNode}</>;
};
