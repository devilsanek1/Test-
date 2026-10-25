// S04 local props: the season ivy on door #4's frame (THE season cue: it creeps up one node per step and recolours every
// two tears: green, peach, tan, bare), the YEAR calendar (a bigger body than the kit's, a year page of twelve month
// blocks) and its torn pages (each flips up over the binding, then flies off: several in the air at once: the
// time-lapse), the neighbours' windows, the stoop's step tones, the ground marks, and the clip helpers the scene uses
// for the fill-only cornice top, the dive's one-unit flatten and the near tree's shift.

import React, {useId} from 'react';
import {palette} from '../../lib/theme';
import {Look} from '../../lib/exit';
import {ease as E, lerp, prog, springAt, springs, useTime} from '../../lib/time';
import {Ink} from '../../lib/Ink';
import {Fill} from '../../lib/Fill';
import {rand} from '../../lib/rng';
import {circle, hline, line, polyPath, rect, rectPath, roundRect, Pt} from '../../lib/sketch';
import {mat, XG} from '../../lib/xf';
import type {Season} from '../shared/sets';
import {SI, STOOP} from '../shared/sets';
import {PropRoot, usePropFrame} from '../shared/props';

// ---------------------------------------------------------------- seasons

export const SEASON_FILL: Record<Season, string | null> = {green: palette.sage, peach: palette.peach, tan: palette.tan, bare: null};

/** The season keys: green until the time-lapse, then one step every two tears (tears 2, 4, ... 10: tan, bare, green,
 *  tan, bare; fix round 2: the last tan leaf lets go one frame after the vine turns tan on tear 8 (index 7) and the vine
 *  goes bare on tear 10 while it falls: the leaf never falls through green or peach ivy). Two years of autumn -> winter
 *  -> spring; it stays bare (the last leaf is on Pip) to the cut. */
export function seasonKeys(tears: number[]): {t: number; s: Season}[] {
  const order: Season[] = ['tan', 'bare', 'green', 'tan', 'bare'];
  return [{t: -10, s: 'green'}, ...order.map((s, i) => ({t: tears[i * 2 + 1], s}))];
}

export const seasonAt = (keys: {t: number; s: Season}[], t: number): Season => keys.reduce<Season>((acc, k) => (t >= k.t ? k.s : acc), 'green');

// ---------------------------------------------------------------- the ivy

/** The ivy's path: up door #4's left frame (x ~222) from step 2's tread (y 1222) to the head (1030), then right along
 *  the lintel toward the lock side (x 330). One node every 16 px. */
const IVY_NODES: Pt[] = (() => {
  const out: Pt[] = [];
  for (let y = 1222; y >= 1034; y -= 16) out.push([222 + Math.sin(y * 0.09) * 7, y]);
  const top = out[out.length - 1];
  for (let x = top[0] + 16, i = 0; x <= 336; x += 16, i++) out.push([x, 1024 + Math.sin(i * 1.3) * 4]);
  return out;
})();

/** An ivy leaf at p (its stem end), pointing along angle a (deg), length s (world px): a broad heart with a pointed tip
 *  and two shoulder lobes. Returns the outline and its centre vein. */
function leafD(p: Pt, a: number, s: number): {d: string; vein: string} {
  const r = (a * Math.PI) / 180;
  const c = Math.cos(r);
  const sn = Math.sin(r);
  const P = (u: number, v: number) => `${(p[0] + u * s * c - v * s * sn).toFixed(1)} ${(p[1] + u * s * sn + v * s * c).toFixed(1)}`;
  const d = `M${P(0.08, 0)}C${P(0.02, -0.38)} ${P(0.3, -0.62)} ${P(0.5, -0.5)}C${P(0.62, -0.42)} ${P(0.82, -0.3)} ${P(1, 0)}C${P(0.82, 0.3)} ${P(0.62, 0.42)} ${P(0.5, 0.5)}C${P(0.3, 0.62)} ${P(0.02, 0.38)} ${P(0.08, 0)}Z`;
  return {d, vein: `M${P(-0.1, 0)}L${P(0.72, 0)}`};
}

const IVY_TONES: Record<Season, [string, string] | null> = {green: [palette.sage, palette.teal], peach: [palette.peach, '#F5CCAF'], tan: [palette.tan, palette.sand], bare: null};

/** Ivy on door #4's frame: a vine with two leaves per node (fanned off both sides, two tones). `steps` = how many nodes
 *  are grown from when (each new node's leaves pop 20 % -> 100 % in 0.12 s, 0.03 s apart); the leaves recolour in one
 *  frame when the season steps (bare = only the vine and its twig ticks). Settled leaves draw node by node (fills, then
 *  that node's ink) so the overlaps stay clean. */
export const SeasonIvy: React.FC<{steps: {t: number; n: number}[]; seasons: {t: number; s: Season}[]; seed?: string}> = ({steps, seasons, seed = 's4ivy'}) => {
  const t = useTime();
  const season = seasonAt(seasons, t);
  const born: number[] = [];
  steps.forEach((st, i) => {
    const prev = i ? steps[i - 1].n : 0;
    for (let k = prev; k < st.n; k++) born[k] = st.t + (k - prev) * 0.03;
  });
  const n = born.filter((b) => t >= b).length;
  if (n < 2) return null;
  const pts = IVY_NODES.slice(0, n);
  const vine = smoothVine(pts);
  const tones = IVY_TONES[season];
  let twigs = '';
  // settled leaves are drawn NODE BY NODE (that node's two fills, then its ink), from the root up: a nearer / newer
  // leaf's fill covers the outline of the one under it (fix round 1: one batched ink pass let back outlines show through)
  const settled: React.ReactNode[] = [];
  const popping: React.ReactNode[] = [];
  pts.forEach((p, i) => {
    if (i === 0) return;
    const prev = pts[i - 1];
    const dir = (Math.atan2(p[1] - prev[1], p[0] - prev[0]) * 180) / Math.PI;
    const q = Math.min(1, (t - born[i]) / 0.12);
    const k = 0.2 + 0.8 * E.outCubic(q);
    let fa = '';
    let fb = '';
    let ink = '';
    for (const side of [-1, 1]) {
      const j = `${i}${side}`;
      const a = dir + side * (62 + rand(seed, `a${j}`) * 26);
      const sz = 15 + rand(seed, `s${j}`) * 6 + (i < 4 ? 3 : 0);
      if (!tones) {
        if ((i + (side > 0 ? 1 : 0)) % 2 === 0) {
          const rr = (a * Math.PI) / 180;
          twigs += `M${p[0].toFixed(1)} ${p[1].toFixed(1)}l${(Math.cos(rr) * 7).toFixed(1)} ${(Math.sin(rr) * 7).toFixed(1)}`;
        }
        continue;
      }
      const L = leafD(p, a, sz);
      const useA = (i + (side > 0 ? 0 : 1)) % 2 === 0;
      if (q < 1) {
        popping.push(
          <XG key={j} m={mat.about(mat.scale(k), p[0], p[1])}>
            <Fill d={L.d} color={useA ? tones[0] : tones[1]} offset={false} mode="none" seed={`${seed}/p${j}`} />
            <Ink d={L.d + L.vein} width={1.3} taper={false} seed={`${seed}/pi${j}`} />
          </XG>,
        );
      } else {
        if (useA) fa += L.d;
        else fb += L.d;
        ink += L.d + L.vein;
      }
    }
    if (tones && ink)
      settled.push(
        <React.Fragment key={i}>
          {fa ? <Fill d={fa} color={tones[0]} offset={false} mode="none" seed={`${seed}/fa${i}`} /> : null}
          {fb ? <Fill d={fb} color={tones[1]} offset={false} mode="none" seed={`${seed}/fb${i}`} /> : null}
          <Ink d={ink} width={1.3} taper={false} seed={`${seed}/li${i}`} />
        </React.Fragment>,
      );
  });
  return (
    <>
      <Ink d={vine + twigs} width={2.2} taper={false} seed={`${seed}/vine`} />
      {settled}
      {popping}
    </>
  );
};

/** A smooth vine through the nodes (quadratic midpoints). */
function smoothVine(pts: Pt[]): string {
  let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const m: Pt = [(pts[i][0] + pts[i + 1][0]) / 2, (pts[i][1] + pts[i + 1][1]) / 2];
    d += `Q${pts[i][0].toFixed(1)} ${pts[i][1].toFixed(1)} ${m[0].toFixed(1)} ${m[1].toFixed(1)}`;
  }
  const l = pts[pts.length - 1];
  return d + `L${l[0].toFixed(1)} ${l[1].toFixed(1)}`;
}

/** The world point of ivy node i (the falling leaf starts there). */
export const ivyNode = (i: number): Pt => IVY_NODES[Math.min(IVY_NODES.length - 1, i)];

// ---------------------------------------------------------------- the year calendar and its torn pages

/** The calendar body in S04 (fix round: the kit slot's 70 x 80 read as one month at phone size): 95 x 105 world
 *  (~145 x 160 px), grown up and left into the free wall above the slot, its right edge clear of the small window
 *  (466, 1132). Header band 20 %, the year page under it. */
export const CAL: [number, number, number, number] = [360, 1015, 95, 105];
const CAL_HEAD = CAL[3] * 0.2;
const PAGE_H = CAL[3] - CAL_HEAD;
const CAL_INK = SI.far;
const FRAME = 1 / 30;

/** A hand-scribbled, illegible 'year' on a page's tan title band (fix round 2: the pad read as an intercom panel; no
 *  numerals, the storyboard's rule): four cursive marks (loops and humps) whose heights and kinds change with `year`,
 *  so every torn page is visibly a new year. Page-local, centred on (cx, cy), width ww, x-height a. */
function yearScribble(cx: number, cy: number, ww: number, a: number, year: number): string {
  const r = (k: string) => rand('s4yr', `${year}${k}`);
  const n = 4;
  const step = ww / n;
  let x = cx - ww / 2;
  let d = `M${x.toFixed(1)} ${(cy + a * 0.35).toFixed(1)}`;
  for (let i = 0; i < n; i++) {
    const h = a * (0.75 + r(`h${i}`) * 0.6);
    const xm = x + step * 0.55;
    const xb = x + step;
    if (r(`k${i}`) > 0.42) {
      // a loop (like an 'l' or 'e'): up and back, crossing itself, on to the next mark
      d += `C${xm.toFixed(1)} ${(cy + a * 0.35).toFixed(1)} ${(xm + step * 0.32).toFixed(1)} ${(cy - h).toFixed(1)} ${xm.toFixed(1)} ${(cy - h).toFixed(1)}`;
      d += `C${(xm - step * 0.3).toFixed(1)} ${(cy - h).toFixed(1)} ${(xm - step * 0.08).toFixed(1)} ${(cy + a * 0.45).toFixed(1)} ${xb.toFixed(1)} ${(cy + a * 0.25).toFixed(1)}`;
    } else {
      // a hump (like an 'n' / 'm' stroke)
      d += `C${(x + step * 0.15).toFixed(1)} ${(cy - h * 0.7).toFixed(1)} ${(xb - step * 0.25).toFixed(1)} ${(cy - h * 0.8).toFixed(1)} ${(xb - step * 0.1).toFixed(1)} ${(cy + a * 0.35).toFixed(1)}`;
      d += `Q${(xb - step * 0.04).toFixed(1)} ${(cy + a * 0.5).toFixed(1)} ${xb.toFixed(1)} ${(cy + a * 0.2).toFixed(1)}`;
    }
    x = xb;
  }
  return d;
}

/** One YEAR page in page-local coords (0,0 = its top-left), w x h: cream paper, a tan title band with the scribbled
 *  'year' on it (no numerals), twelve separate month blocks (3 x 4, with gaps), each a small box with a sand title strip;
 *  `curl` = the dog-ear on its bottom-right corner (the pad's top page). */
const YearPage: React.FC<{w: number; h: number; seed: string; year: number; curl?: boolean}> = ({w, h, seed, year, curl = false}) => {
  const band = h * 0.13;
  const mx = w * 0.08;
  const gx = w * 0.05;
  const top = band + h * 0.07;
  const gy = h * 0.045;
  const bw = (w - 2 * mx - 2 * gx) / 3;
  const bh = (h - top - h * 0.06 - 3 * gy) / 4;
  let boxes = '';
  let strips = '';
  for (let r = 0; r < 4; r++)
    for (let c = 0; c < 3; c++) {
      const x = mx + c * (bw + gx);
      const y = top + r * (bh + gy);
      boxes += rectPath(x, y, bw, bh);
      strips += rectPath(x, y, bw, bh * 0.32);
    }
  const ce = w * 0.1;
  const flap = `M${w - ce} ${h}L${w} ${h - ce}L${w - ce * 0.92} ${h - ce * 0.92}Z`;
  return (
    <>
      <Fill d={rectPath(0, 0, w, h)} color={palette.cream} offset={false} mode="none" seed={`${seed}/p`} />
      <Fill d={rectPath(0, 0, w, band)} color={palette.tan} offset={false} mode="none" seed={`${seed}/b`} />
      <Fill d={strips} color={palette.sand} offset={false} mode="none" seed={`${seed}/s`} />
      <Ink d={boxes} width={1.1} taper={false} seed={`${seed}/g`} />
      <Ink d={yearScribble(w / 2, band * 0.6, w * 0.5, band * 0.4, year)} width={1.3} taper={false} seed={`${seed}/yr${year % 4}`} />
      <Ink d={`M0 ${band.toFixed(1)}H${w}M0 0H${w}V${curl ? h - ce : h}${curl ? `M${w - ce} ${h}` : ''}H0Z`} width={CAL_INK * 0.8} taper={false} seed={`${seed}/o`} />
      {curl ? (
        <>
          <Fill d={flap} color={palette.sand} offset={false} mode="none" seed={`${seed}/cf`} />
          <Ink d={flap} width={CAL_INK * 0.6} taper={false} seed={`${seed}/ci`} />
        </>
      ) : null}
    </>
  );
};

/** The torn-stub fringe left at the binding once pages have been torn: small paper teeth along the header's bottom
 *  edge (page-local of the calendar, y = the binding). */
const stubFringe = (w: number, y: number, n: number): string => {
  let d = `M1.5 ${y}`;
  const k = 16;
  for (let i = 1; i <= k; i++) {
    const x = 1.5 + ((w - 3) * i) / k;
    const dep = 1.2 + rand('s4stub', `${n % 4}${i}`) * 1.7;
    d += `L${(x - (w - 3) / k / 2).toFixed(1)} ${(y + dep).toFixed(1)}L${x.toFixed(1)} ${y}`;
  }
  return d + 'Z';
};

/** The tear-off YEAR calendar (scene-local: the kit Calendar draws its year page as one grid): nail + string, a sand
 *  header with two rings, the current year page (dog-eared) on a pad (the next page peeks out under it); after the
 *  first tear a torn-stub fringe at the binding. A tear swaps the page in one frame (the torn one is YearFlyers'). */
export const YearCalendar: React.FC<{tears: number[]; seed?: string}> = ({tears, seed = 's4cal'}) => {
  const t = useTime();
  const [x, y, w, h] = CAL;
  const torn = tears.filter((ta) => t >= ta).length;
  const stack = `M${w + 1.8} ${CAL_HEAD + 3}V${CAL_HEAD + PAGE_H + 2.6}H3`;
  return (
    <XG m={mat.translate(x, y)}>
      <Ink d={`M${w * 0.2} 0L${w / 2} ${-h * 0.11}L${w * 0.8} 0`} width={CAL_INK * 0.6} seed={`${seed}/str`} />
      <Fill d={`M${w / 2 - 2.4} ${-h * 0.11}a2.4 2.4 0 1 0 4.8 0a2.4 2.4 0 1 0 -4.8 0Z`} color={palette.ink} offset={false} mode="none" seed={`${seed}/nail`} />
      {/* the pad: the next pages peek out under the top one (right and bottom edges) */}
      <Fill d={rectPath(2, CAL_HEAD + 2, w, PAGE_H + 0.8)} color={palette.cream} offset={false} mode="none" seed={`${seed}/stk`} />
      <Ink d={stack} width={CAL_INK * 0.55} taper={false} seed={`${seed}/stki`} />
      <XG m={mat.translate(0, CAL_HEAD)}>
        <YearPage w={w} h={PAGE_H} seed={`${seed}/pg${torn % 3}`} year={torn} curl />
      </XG>
      {torn > 0 ? (
        <>
          <Fill d={stubFringe(w, CAL_HEAD - 0.5, torn)} color={palette.cream} offset={false} mode="none" seed={`${seed}/stub`} />
          <Ink d={stubFringe(w, CAL_HEAD - 0.5, torn)} width={CAL_INK * 0.4} taper={false} seed={`${seed}/stubi`} />
        </>
      ) : null}
      <Fill d={rectPath(0, 0, w, CAL_HEAD + 2)} color={palette.sand} seed={`${seed}/hd`} />
      <Ink d={`M-3 0H${w + 3}M0 0V${CAL_HEAD}M${w} 0V${CAL_HEAD}M-2 ${CAL_HEAD}H${w + 2}`} width={CAL_INK} seed={`${seed}/hdo`} />
      <Ink d={`M${w * 0.3 - 3} ${CAL_HEAD * 0.5}a3 3 0 1 0 6 0a3 3 0 1 0 -6 0M${w * 0.7 - 3} ${CAL_HEAD * 0.5}a3 3 0 1 0 6 0a3 3 0 1 0 -6 0`} width={CAL_INK * 0.6} seed={`${seed}/rings`} />
    </XG>
  );
};

/** The lift pose of a torn page (fix round 3: the old one-frame lift was the page's blank BACK as a trapezoid that
 *  narrowed upward with a tan band at its foot: on a pause a lampshade on the calendar, strobing every other frame). The
 *  page is swung up about the binding toward the camera, so its free (bottom) edge is now ON TOP and NEARER the camera:
 *  WIDER than the hinge (perspective), the page FRONT showing, squashed (its 3 x 4 month grid with the blocks' sand title
 *  strips, mirrored: the strips sit at each block's foot), a dog-eared top corner (sand: the paper's back), a
 *  misregistered cream fill and an inkThin outline whose free edge bows like bent paper. Two poses alternate tear by
 *  tear so no single shape strobes: 'a' ~45 % squash, free edge 12 % wider, dog-ear right; 'b' flatter (~30 %), 16 %
 *  wider, its free edge curling back (a sliver of the sand back shows), dog-ear left. World coords; the hinge spans the
 *  calendar's width on the binding. Nothing covers the next page or its title band (the pose sits above the binding,
 *  over the pad's header). */
function LiftPose({i, seed}: {i: number; seed: string}) {
  const w = CAL[2];
  const h = PAGE_H;
  const x0 = CAL[0];
  const bind = CAL[1] + CAL_HEAD;
  const r = (k: string) => rand(seed, `${i}${k}`);
  const b = i % 2 === 1;
  const hp = h * (b ? 0.3 : 0.45) * (0.94 + r('h') * 0.12);
  const spread = b ? 0.16 : 0.12;
  const sk = (b ? -3 : 3) + (r('sk') - 0.5) * 3;
  const cx = x0 + w / 2;
  // page-local (u across 0..w, v from the hinge 0..h) -> world: the far rows (nearer the camera) a little taller
  const f = (s: number) => (s * 1.3) / (1 + 0.3 * s);
  const P = (u: number, v: number): Pt => {
    const s = f(v / h);
    return [cx + (u - w / 2) * (1 + spread * s) + sk * s, bind - hp * s - (b ? 2.5 : 1.5) * Math.sin(Math.PI * (u / w)) * s];
  };
  const quad = (u0: number, v0: number, u1: number, v1: number) => polyPath([P(u0, v0), P(u1, v0), P(u1, v1), P(u0, v1)]);
  const fmt = (p: Pt) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`;
  // the outline: hinge, a side, the free edge bowing up (paper bending as it is pulled), the other side
  const ce = w * 0.13; // the dog-ear's leg (page-local)
  const earR = !b;
  const tl = P(0, h);
  const tr = P(w, h);
  const mid = P(w / 2, h);
  const bow: Pt = [mid[0], mid[1] - (b ? 5 : 3)];
  const earA = earR ? P(w - ce, h) : P(ce, h);
  const earB = earR ? P(w, h - ce * 1.4) : P(0, h - ce * 1.4);
  const outline = earR
    ? `M${fmt(P(0, 0))}L${fmt(P(w, 0))}L${fmt(earB)}L${fmt(earA)}Q${fmt(bow)} ${fmt(tl)}Z`
    : `M${fmt(P(0, 0))}L${fmt(P(w, 0))}L${fmt(tr)}Q${fmt(bow)} ${fmt(earA)}L${fmt(earB)}Z`;
  // the fold: the corner turned over toward the camera (its back, sand), a small triangle inside the corner
  const corner = earR ? tr : tl;
  // the corner reflected across the fold line earA-earB (pulled in 15 %: the flap stands a little off the page)
  const fold: Pt = (() => {
    const dx = earB[0] - earA[0];
    const dy = earB[1] - earA[1];
    const k = ((corner[0] - earA[0]) * dx + (corner[1] - earA[1]) * dy) / (dx * dx + dy * dy);
    const fx = earA[0] + k * dx;
    const fy = earA[1] + k * dy;
    return [fx + (fx - corner[0]) * 0.85, fy + (fy - corner[1]) * 0.85];
  })();
  const ear = `M${fmt(earA)}L${fmt(earB)}L${fmt(fold)}Z`;
  // the 3 x 4 month blocks, squashed and mirrored (block title strips at each block's foot, nearer the hinge)
  const band = h * 0.13;
  const mx = w * 0.08;
  const gx = w * 0.05;
  const top = band + h * 0.07;
  const gy = h * 0.045;
  const bw = (w - 2 * mx - 2 * gx) / 3;
  const bh = (h - top - h * 0.06 - 3 * gy) / 4;
  let boxes = '';
  let strips = '';
  for (let rr = 0; rr < 4; rr++)
    for (let c = 0; c < 3; c++) {
      const u = mx + c * (bw + gx);
      const v = top + rr * (bh + gy);
      if (earR ? c === 2 && rr === 3 : c === 0 && rr === 3) continue; // under the dog-ear
      boxes += quad(u, v, u + bw, v + bh);
      strips += quad(u, v, u + bw, v + bh * 0.32);
    }
  // pose b curls its free edge back: a sliver of the sand back along the top
  const curl = b ? `M${fmt(P(w * 0.08, h))}Q${fmt([mid[0], mid[1] - 9])} ${fmt(P(w * 0.92, h))}Q${fmt([mid[0], mid[1] - 4])} ${fmt(P(w * 0.08, h))}Z` : '';
  return (
    <>
      <Fill d={outline} color={palette.cream} mode="none" seed={`${seed}/lf${i % 4}`} />
      <Fill d={strips} color={palette.sand} offset={false} mode="none" seed={`${seed}/ls${i % 4}`} />
      <Ink d={boxes} width={1.0} taper={false} seed={`${seed}/lg${i % 4}`} />
      {curl ? <Fill d={curl} color={palette.sand} offset={false} mode="none" seed={`${seed}/lc${i % 4}`} /> : null}
      <Fill d={ear} color={palette.sand} offset={false} mode="none" seed={`${seed}/le${i % 4}`} />
      <Ink d={outline + ear + (curl ? curl : '')} width={CAL_INK} taper={false} seed={`${seed}/lo${i % 4}`} />
    </>
  );
}

/** The torn pages (fix round 2: the old flip laid a blank 145 x 95 px lid over the calendar on almost every frame).
 *  Each tear: ONE frame of the page lifted over the binding (`LiftPose`, fix round 3: the page front, wider at its free
 *  top edge, two alternating poses); from the next frame the page is off the pad, front out (its year grid and
 *  scribbled year), fluttering up and a little right while it shrinks away. Nothing ever covers the next page's title
 *  band. None is left in the air when the dive starts (`until`). */
export const YearFlyers: React.FC<{tears: number[]; until: number; life?: number; seed?: string}> = ({tears, until, life = 0.32, seed = 's4fly'}) => {
  const t = useTime();
  const w = CAL[2];
  const h = PAGE_H;
  const bind = CAL[1] + CAL_HEAD;
  const out: React.ReactNode[] = [];
  tears.forEach((ta, i) => {
    const end = Math.min(ta + life, until);
    if (t < ta || t >= end) return;
    const r = (k: string) => rand(seed, `${i}${k}`);
    if (t < ta + FRAME) {
      out.push(<LiftPose key={i} i={i} seed={seed} />);
      return;
    }
    const q = (t - ta - FRAME) / (life - FRAME);
    // off the pad, front out: from just above the header, up and a little right, shrinking away, fluttering
    const cx = CAL[0] + w / 2 + 4 + lerp(0, 26 + r('x') * 48, E.outCubic(q));
    const cy = bind - 34 - lerp(0, 46 + r('y') * 40, E.outQuad(q)) + 16 * q * q;
    const rot = (r('r') - 0.4) * 36 * q + 7 * Math.sin(q * 9 + r('p') * 6);
    const sc = 0.72 - 0.42 * E.outQuad(q);
    const fl = 0.55 + 0.4 * Math.abs(Math.sin(q * 7 + 0.4 + r('f') * 2));
    out.push(
      <XG key={i} m={mat.compose(mat.translate(cx, cy), mat.rotate(rot), mat.scale(sc, sc * fl), mat.translate(-w / 2, -h / 2))}>
        <YearPage w={w} h={h} seed={`${seed}/${i % 3}`} year={i} />
      </XG>,
    );
  });
  return <>{out}</>;
};

/** Pop scale (7 % spring) for an element appearing at `at`, 0 before. */
export const popK = (t: number, at: number) => (t < at ? 0 : springAt(t, at, springs.pop));

/** 0..1 over [a, a + d] with an ease. */
export const pr = (t: number, a: number, d: number, e = E.inOutSine) => prog(t, a, d, e);

// ---------------------------------------------------------------- the neighbours' windows (time-lapse life)

/** The hero house's windows (StoopStreet's own list, without the small one right of the calendar). */
const HERO_WINS: [number, number, number, number][] = [
  [70, 712, 62, 92],
  [70, 862, 62, 92],
  [70, 1012, 62, 92],
  [428, 712, 62, 92],
  [428, 862, 62, 92],
];

type WinState = 'none' | 'blind' | 'curtain' | 'plant';
const WIN_CYCLE: WinState[] = ['none', 'blind', 'curtain', 'plant'];
const WIN_START: WinState[] = ['curtain', 'none', 'plant', 'blind', 'none'];
const WIN_ORDER = [3, 0, 4, 1, 2, 0, 3];

/** The hero house's windows live through the fourteen years: on every other tear one window changes (a sand blind
 *  comes down, curtains are drawn, a plant appears on the sill, or it is bare again), one-frame pops like a time-lapse. */
export const WindowLife: React.FC<{tears: number[]; seed?: string}> = ({tears, seed = 's4win'}) => {
  const t = useTime();
  const state = [...WIN_START];
  WIN_ORDER.forEach((w, k) => {
    const at = tears[k * 2];
    if (at !== undefined && t >= at) state[w] = WIN_CYCLE[(WIN_CYCLE.indexOf(state[w]) + 1 + (k % 2)) % WIN_CYCLE.length];
  });
  let blindSand = '';
  let cream = '';
  let tan = '';
  let sage = '';
  let ink = '';
  HERO_WINS.forEach(([x, y, w, h], i) => {
    const s = state[i];
    if (s === 'blind') {
      const bh = h * (0.38 + rand(seed, `b${i}`) * 0.14);
      // fix round 3: SAND for the whole scene (was peach, repainted sand on the dive's first frame): on 'bug' the
      // spot is the only peach under the captions, and nothing repaints in the dive
      blindSand += rectPath(x + 2, y + 2, w - 4, bh);
      ink += `M${x + 1} ${(y + bh + 2).toFixed(1)}H${x + w - 1}M${x + w / 2} ${y + 2}V${(y + bh + 2).toFixed(1)}M${(x + w * 0.72).toFixed(1)} ${(y + bh + 2).toFixed(1)}v8`;
    } else if (s === 'curtain') {
      const a = w * 0.3;
      const L = `M${x + 2} ${y + 2}H${x + 2 + a}Q${x + 2 + a * 0.35} ${y + h * 0.55} ${x + 2 + a * 0.55} ${y + h - 2}H${x + 2}Z`;
      const R = `M${x + w - 2} ${y + 2}H${x + w - 2 - a}Q${x + w - 2 - a * 0.35} ${y + h * 0.55} ${x + w - 2 - a * 0.55} ${y + h - 2}H${x + w - 2}Z`;
      cream += L + R;
      ink += `M${x + 2 + a} ${y + 2}Q${x + 2 + a * 0.35} ${y + h * 0.55} ${x + 2 + a * 0.55} ${y + h - 2}M${x + w - 2 - a} ${y + 2}Q${x + w - 2 - a * 0.35} ${y + h * 0.55} ${x + w - 2 - a * 0.55} ${y + h - 2}`;
    } else if (s === 'plant') {
      const px = x + w * 0.5;
      const py = y + h - 2;
      tan += `M${px - 11} ${py - 16}h22l-3 16h-16z`;
      const leaf = `M${px} ${py - 15}c-16 -2 -18 -20 -6 -26c4 -8 16 -8 18 2c10 4 6 22 -12 24z`;
      sage += leaf;
      ink += `M${px - 11} ${py - 16}h22l-3 16h-16z` + leaf;
    }
  });
  return (
    <>
      {blindSand ? <Fill d={blindSand} color={palette.sand} offset={false} mode="none" seed={`${seed}/p`} /> : null}
      {cream ? <Fill d={cream} color={palette.cream} offset={false} mode="none" seed={`${seed}/c`} /> : null}
      {tan ? <Fill d={tan} color={palette.tan} offset={false} mode="none" seed={`${seed}/t`} /> : null}
      {sage ? <Fill d={sage} color={palette.sage} offset={false} mode="none" seed={`${seed}/s`} /> : null}
      {ink ? <Ink d={ink} width={1.8} taper={false} seed={`${seed}/i`} /> : null}
    </>
  );
};

// ---------------------------------------------------------------- the stoop's step tones

const TREAD = 9; // StoopStreet's tread depth
/** Re-tones the set's two steps so the stoop reads as STEPS, not a podium (fix round: treads and risers were one cream
 *  value): cream treads (lit from above), a sand strip a step darker across each riser's top (the shadow under the
 *  nosing), misregistered right / down a little, over the cream riser face; then the
 *  stoop's own ink is redrawn on top (the same `line` calls and seeds as the set's Stoop, so it is pixel-identical).
 *  Draw it first in the hero slot (over the set's Stoop, under everything on the steps). */
export const StepTones: React.FC<{seed?: string}> = ({seed = 'stoop/stoop'}) => {
  const [s2x, s2y, s2w, s2h] = STOOP.step2;
  const [s1x, s1y, s1w, s1h] = STOOP.step1;
  const tread = (x: number, y: number, w: number) => polyPath([[x - 6, y - TREAD], [x + w + 6, y - TREAD], [x + w, y], [x, y]]);
  const ink2 = line(s2x - 8, s2y - TREAD, s2x + s2w + 8, s2y - TREAD, {seed: `${seed}/i2a`, over: [3, 6]}) + line(s2x - 2, s2y, s2x + s2w + 4, s2y, {seed: `${seed}/i2b`, over: [2, 4]}) + line(s2x, s2y, s2x, s2y + s2h, {seed: `${seed}/i2c`, over: [0, 0]}) + line(s2x + s2w, s2y, s2x + s2w, s2y + s2h, {seed: `${seed}/i2d`, over: [0, 0]});
  const ink1 = line(s1x - 8, s1y - TREAD, s1x + s1w + 8, s1y - TREAD, {seed: `${seed}/i1a`, over: [3, 6]}) + line(s1x - 2, s1y, s1x + s1w + 4, s1y, {seed: `${seed}/i1d`, over: [2, 4]}) + line(s1x, s1y, s1x, s1y + s1h, {seed: `${seed}/i1e`, over: [0, 0]}) + line(s1x + s1w, s1y, s1x + s1w, s1y + s1h, {seed: `${seed}/i1g`, over: [0, 0]});
  // the strip: the riser's top ~30 % (the shadow under the tread's nosing), misregistered a little right / down
  const strip = (x: number, y: number, w: number, h: number) => rectPath(x + 1, y + 1, w - 2, h * 0.3);
  return (
    <>
      <Fill d={tread(s2x, s2y, s2w)} color={palette.cream} offset={false} mode="none" seed="s4/t2" />
      <Fill d={strip(s2x, s2y, s2w, s2h)} color={palette.sand} offset={[3, 2]} mode="none" seed="s4/r2" />
      <Ink d={ink2} width={SI.mid} seed="s4/i2" />
      <Fill d={tread(s1x, s1y, s1w)} color={palette.cream} offset={false} mode="none" seed="s4/t1" />
      <Fill d={strip(s1x, s1y, s1w, s1h)} color={palette.sand} offset={[3, 2]} mode="none" seed="s4/r1" />
      <Ink d={ink1} width={SI.mid} seed="s4/i1" />
    </>
  );
};

// ---------------------------------------------------------------- the ground's ink

const VP = STOOP.vp;
const kerbR = (yy: number) => VP[0] + ((980 - VP[0]) * (yy - VP[1])) / (STOOP.pavementY - VP[1]);
/** The set's kerb lines, exactly (StoopStreet's G.kerbInk: same calls and seeds). */
const KERB_INK =
  line(VP[0] + 2, VP[1] + 2, kerbR(1372), 1372, {seed: 'stp/kr', over: [0, 0], breaks: false}) +
  line(-150, STOOP.pavementY, 1230, STOOP.pavementY, {seed: 'stp/kn', over: [0, 0]}) +
  line(-150, STOOP.pavementY + 18, 1230, STOOP.pavementY + 20, {seed: 'stp/kn2', over: [0, 0]});
/** Kerb-stone joints along the near kerb. */
const KERB_JOINTS = (() => {
  let d = '';
  for (let x = -40; x <= 720; x += 64) d += line(x, STOOP.pavementY + 2, x - 1, STOOP.pavementY + 17, {seed: `s4kj${x}`, over: 0});
  return d;
})();
/** A few short, sparse ground specks on the near pavement (style bible: texture strokes short and sparse; fix round:
 *  the set's long paving rays read as scratches at this zoom). */
const SPECKS = [
  [118, 1438, 12, -0.25],
  [262, 1486, 9, 0.3],
  [612, 1452, 11, -0.15],
  [404, 1530, 8, 0.1],
  [700, 1505, 10, 0.35],
].reduce((d, [x, y, l, a], i) => d + line(x, y, x + l * Math.cos(a), y + l * Math.sin(a), {seed: `s4sp${i}`, over: 0}), '');
const GRATE: [number, number, number, number] = [470, 1452, 74, 26];
const GRATE_INK = (() => {
  const [x, y, w, h] = GRATE;
  let d = rectPath(x, y, w, h);
  for (let i = 1; i < 6; i++) d += `M${(x + (w * i) / 6).toFixed(1)} ${y + 4}V${y + h - 4}`;
  return d;
})();

/** Fix round 2 (the dive leaves the bottom quarter of the cut frame a barren mint band): perspective paving joints on
 *  the near pavement, hair-weight and broken, converging on the street's VP (world y 1420-1660: screen ~1530-1990 at the
 *  cut, under the platform UI, so all of it is low-contrast). */
const PAVE_JOINTS = (() => {
  // short broken strokes only (style bible: texture strokes short and sparse; long rays read as scratches): per joint
  // two ~24 world dashes toward the VP, plus a few short slab joints parallel to the kerb
  let d = '';
  const at = (X: number, y: number) => VP[0] + ((X - VP[0]) * (y - VP[1])) / (1700 - VP[1]);
  [-180, 640].forEach((X, i) => {
    const y0 = 1452 + i * 30;
    d += line(at(X, y0), y0, at(X, y0 + 22), y0 + 22, {seed: `s4pj${i}a`, over: 0});
    d += line(at(X, y0 + 40), y0 + 40, at(X, y0 + 58), y0 + 58, {seed: `s4pj${i}b`, over: 0});
  });
  [[40, 1514, 34], [376, 1572, 30]].forEach(([x, y, l], i) => {
    d += line(x, y, x + l, y + 1, {seed: `s4ps${i}`, over: 0});
  });
  return d;
})();
/** The sand kerb shadows (the sun is up right: they fall a little left): under the stoop's bottom step and the planter. */
const KERB_SHADOWS =
  polyPath([[148, STOOP.pavementY + 1], [436, STOOP.pavementY + 1], [428, STOOP.pavementY + 8], [140, STOOP.pavementY + 8]]) +
  polyPath([[452, STOOP.furniture[0].y - 1], [512, STOOP.furniture[0].y - 1], [506, STOOP.furniture[0].y + 6], [444, STOOP.furniture[0].y + 6]]);
/** Two fallen tan leaves on the pavement (the season cue's callback): (x, y, rot, size). */
const FALLEN: [number, number, number, number][] = [
  [292, 1482, -28, 9],
  [574, 1536, 34, 8],
];
const fallenD = (x: number, y: number, a: number, k: number) => {
  const r = (a * Math.PI) / 180;
  const P = (u: number, v: number) => `${(x + (u * Math.cos(r) - v * Math.sin(r)) * k).toFixed(1)} ${(y + (u * Math.sin(r) + v * Math.cos(r)) * k).toFixed(1)}`;
  return {d: `M${P(-1, 0)}C${P(-0.5, -0.8)} ${P(0.55, -0.75)} ${P(1, 0)}C${P(0.55, 0.75)} ${P(-0.5, 0.8)} ${P(-1, 0)}Z`, rib: `M${P(-1.25, 0.05)}L${P(0.7, 0)}`};
};
const FALLEN_D = FALLEN.map(([x, y, a, k]) => fallenD(x, y, a, k));

/** The ground layer, re-inked: the set's ground FILLS (road, pavements) with its own kerb lines, the kerb-stone joints,
 *  a drain grate and a few specks instead of its long paving rays; fix round 2: paving joints toward the VP, sand kerb
 *  shadows under the stoop and the planter, two fallen tan leaves. */
export const GroundS04: React.FC<{node: React.ReactNode}> = ({node}) => (
  <>
    <Look ink={false}>{node}</Look>
    <Fill d={KERB_SHADOWS} color={palette.sand} offset={false} mode="none" seed="s4ks" />
    <Ink d={KERB_INK} width={SI.front} seed="stoop/kerb" />
    <Ink d={KERB_JOINTS} width={SI.far} taper={false} seed="s4kj" />
    <Ink d={PAVE_JOINTS} width={SI.hair} taper={false} seed="s4pj" />
    <Ink d={SPECKS} width={SI.far} taper={false} seed="s4sp" />
    <Fill rect={GRATE} color={palette.tealDark} offset={false} mode="none" seed="s4gr" />
    <Ink d={GRATE_INK} width={SI.far} taper={false} seed="s4gri" />
    <Fill d={FALLEN_D.map((f) => f.d).join('')} color={palette.tan} offset={false} mode="none" seed="s4fl" />
    <Ink d={FALLEN_D.map((f) => f.d + f.rib).join('')} width={SI.hair * 0.8} taper={false} seed="s4fli" />
  </>
);

// ---------------------------------------------------------------- clips (world space, hard edges)

const BIG = rectPath(-4000, -4000, 9000, 9000);
/** The region above world y (from x0 rightward). */
export const above = (y: number, x0 = -4000) => rectPath(x0, -4000, 9000, y + 4000);
/** Everything except `d` (even-odd). */
export const except = (d: string) => BIG + d;

/** Children clipped to the path `d` (even-odd, world space: the clip is in the user space of this group). */
export const ClipG: React.FC<{d: string; children?: React.ReactNode}> = ({d, children}) => {
  const id = 's4clip' + useId().replace(/[^a-zA-Z0-9]/g, '');
  return (
    <>
      <defs>
        <clipPath id={id}>
          <path d={d} clipRule="evenodd" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id})`}>{children}</g>
    </>
  );
};

/** `node` drawn FLAT (fills only, <Look ink={false}>) above world y `y` (from x0 rightward) and inked below it: two
 *  copies, each clipped; the inked one overlaps the seam by 1.5 px so no hairline opens. One switch for a whole layer. */
export const SplitInk: React.FC<{y: number; x0?: number; node: React.ReactNode}> = ({y, x0, node}) => (
  <>
    <ClipG d={above(y + 1.5, x0)}>
      <Look ink={false}>{node}</Look>
    </ClipG>
    <ClipG d={except(above(y, x0))}>{node}</ClipG>
  </>
);

// ---------------------------------------------------------------- soft ink (the dive)

/** `node` with its ink SOFTENED to tan above world y `y` (from x0 rightward), unchanged below: two clipped copies, one
 *  switch for a whole layer. Fix round 3 (the dive's flatten dropped every ink line above world 990 in one frame and the
 *  browser / windows changed content: a repaint, not motion): every line, mullion, curtain edge, browser hairline and
 *  window frame stays exactly where it is, only its colour steps from ink to tan (a CSS rule on the copy: SVG presentation
 *  attributes lose to any style rule), so silhouettes and content are identical and the caption band only ever sees tan
 *  lines (tan behind ink lettering is ~6:1). */
export const SoftInk: React.FC<{y: number; x0?: number; node: React.ReactNode; color?: string}> = ({y, x0, node, color = palette.tan}) => {
  const cls = 's4soft' + useId().replace(/[^a-zA-Z0-9]/g, '');
  return (
    <>
      <style>{`.${cls} path[stroke="${palette.ink}" i]{stroke:${color}}`}</style>
      <ClipG d={above(y + 1.5, x0)}>
        <g className={cls}>{node}</g>
      </ClipG>
      <ClipG d={except(above(y, x0))}>{node}</ClipG>
    </>
  );
};

// ---------------------------------------------------------------- the hero browser window (whole scene)

/** The hero house's browser window re-toned for S04 (fix round 3), drawn OVER the set's own (StoopStreet's ChromeSlot:
 *  same geometry, seeds and misregistration, so every line lands on the set's): for the WHOLE scene, never switched,
 *  - the screen's header block is SAND (the kit's peach block was the strongest accent under the captions on 'bug',
 *    pulling the eye off lock4's spot);
 *  - the title bar is TEAL, one step lighter than the kit's tealDark (it crosses the captions in the dive: tealDark under
 *    ink lettering is ~2.4:1, teal ~3.6:1), its dots cream / sage / SAND (no peach inside the caption band but the
 *    highlight), the cream address pill, the bar line and the frame redrawn on top.
 *  The screen's ink hairlines stay the set's. */
export const HeroBrowser: React.FC<{seed?: string}> = ({seed = 'stoop/hbw'}) => {
  const [x, y, w, h] = STOOP.browser;
  const F = usePropFrame({ink: SI.mid, seed, defDepth: 'mid'});
  const W = F.W;
  const bar = Math.min(30, h * 0.27);
  const sh = h - bar;
  const pad = Math.max(5, w * 0.07);
  const hh = sh * 0.24;
  const dr = bar * 0.25;
  const sp = bar * 0.63;
  const d0 = bar * 0.47;
  const px = d0 + 2 * sp + dr + bar * 0.38;
  const pw = Math.max(bar, w - px - bar * 0.35);
  const ph = bar * 0.6;
  const py = (bar - ph) / 2;
  const dots = [palette.cream, palette.sage, palette.sand];
  return (
    <PropRoot x={x} y={y}>
      <Fill rect={[pad, bar + pad, w - pad * 2, hh]} color={palette.sand} offset={false} mode="none" seed={`${seed}/hdr`} />
      <Fill rect={[0, 0, w, bar]} color={palette.teal} offset={F.off} mode="none" seed={`${seed}/bar`} />
      {dots.map((c, i) => (
        <React.Fragment key={i}>
          <Fill d={roundRect(d0 + i * sp - dr, bar / 2 - dr, dr * 2, dr * 2, dr)} color={c} offset={false} mode="none" seed={`${seed}/d${i}`} />
          <Ink d={circle(d0 + i * sp, bar / 2, dr, {seed: `${seed}/di${i}`, overlap: 8})} width={W * 0.5} taper={false} seed={`${seed}/di${i}`} />
        </React.Fragment>
      ))}
      <Fill d={roundRect(px, py, pw, ph, ph / 2)} color={palette.cream} offset={false} mode="none" seed={`${seed}/pill`} />
      <Ink d={roundRect(px, py, pw, ph, ph / 2, {closed: false, seed: `${seed}/pi`})} width={W * 0.55} seed={`${seed}/pi`} />
      <Ink d={hline(0, w, bar, {seed: `${seed}/bl`, over: [2, 6]})} width={W * 0.8} seed={`${seed}/bl`} />
      <Ink d={rect(0, 0, w, h, {seed: `${seed}/fr`, over: 6})} width={W} seed={`${seed}/fr`} />
    </PropRoot>
  );
};
