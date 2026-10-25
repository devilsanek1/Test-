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
import {line, polyPath, rectPath, Pt} from '../../lib/sketch';
import {mat, XG} from '../../lib/xf';
import type {Season} from '../shared/sets';
import {SI, STOOP} from '../shared/sets';

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

/** One YEAR page in page-local coords (0,0 = its top-left), w x h: cream paper, a solid tan title band (no numerals),
 *  twelve separate month blocks (3 x 4, with gaps), each a small box with a sand title strip. */
const YearPage: React.FC<{w: number; h: number; seed: string; back?: boolean}> = ({w, h, seed, back = false}) => {
  if (back) {
    // the page's back (seen while it flips up over the binding): plain paper
    return (
      <>
        <Fill d={rectPath(0, 0, w, h)} color={palette.cream} offset={false} mode="none" seed={`${seed}/bk`} />
        <Ink d={`M0 0H${w}V${h}H0Z`} width={CAL_INK * 0.8} taper={false} seed={`${seed}/bko`} />
      </>
    );
  }
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
  return (
    <>
      <Fill d={rectPath(0, 0, w, h)} color={palette.cream} offset={false} mode="none" seed={`${seed}/p`} />
      <Fill d={rectPath(0, 0, w, band)} color={palette.tan} offset={false} mode="none" seed={`${seed}/b`} />
      <Fill d={strips} color={palette.sand} offset={false} mode="none" seed={`${seed}/s`} />
      <Ink d={boxes} width={1.1} taper={false} seed={`${seed}/g`} />
      <Ink d={`M0 ${band.toFixed(1)}H${w}M0 0H${w}V${h}H0Z`} width={CAL_INK * 0.8} taper={false} seed={`${seed}/o`} />
    </>
  );
};

/** The tear-off YEAR calendar (scene-local: the kit Calendar draws its year page as one grid): nail + string, a sand
 *  header with two rings, the current year page. A tear swaps the page in one frame (the torn one is YearFlyers'). */
export const YearCalendar: React.FC<{tears: number[]; seed?: string}> = ({tears, seed = 's4cal'}) => {
  const t = useTime();
  const [x, y, w, h] = CAL;
  const torn = tears.filter((ta) => t >= ta).length;
  return (
    <XG m={mat.translate(x, y)}>
      <Ink d={`M${w * 0.2} 0L${w / 2} ${-h * 0.11}L${w * 0.8} 0`} width={CAL_INK * 0.6} seed={`${seed}/str`} />
      <Fill d={`M${w / 2 - 2.4} ${-h * 0.11}a2.4 2.4 0 1 0 4.8 0a2.4 2.4 0 1 0 -4.8 0Z`} color={palette.ink} offset={false} mode="none" seed={`${seed}/nail`} />
      <XG m={mat.translate(0, CAL_HEAD)}>
        <YearPage w={w} h={PAGE_H} seed={`${seed}/pg${torn % 3}`} />
      </XG>
      <Fill d={rectPath(0, 0, w, CAL_HEAD + 2)} color={palette.sand} seed={`${seed}/hd`} />
      <Ink d={`M-3 0H${w + 3}M0 0V${CAL_HEAD}M${w} 0V${CAL_HEAD}M-2 ${CAL_HEAD}H${w + 2}`} width={CAL_INK} seed={`${seed}/hdo`} />
      <Ink d={`M${w * 0.3 - 3} ${CAL_HEAD * 0.5}a3 3 0 1 0 6 0a3 3 0 1 0 -6 0M${w * 0.7 - 3} ${CAL_HEAD * 0.5}a3 3 0 1 0 6 0a3 3 0 1 0 -6 0`} width={CAL_INK * 0.6} seed={`${seed}/rings`} />
    </XG>
  );
};

/** The torn pages: each one first FLIPS UP over the binding (2 frames: it folds up about its top edge, showing its
 *  back), then flutters up and a little right off the wall, shrinking away, so it reads as a page torn off THAT
 *  calendar. Several are in the air at once (the time-lapse). None is left in the air when the dive starts (`until`). */
export const YearFlyers: React.FC<{tears: number[]; until: number; life?: number; seed?: string}> = ({tears, until, life = 0.32, seed = 's4fly'}) => {
  const t = useTime();
  const w = CAL[2];
  const h = PAGE_H;
  const top: Pt = [CAL[0], CAL[1] + CAL_HEAD];
  const FLIP = 0.067;
  const out: React.ReactNode[] = [];
  tears.forEach((ta, i) => {
    const end = Math.min(ta + life, until);
    if (t < ta || t >= end) return;
    const r = (k: string) => rand(seed, `${i}${k}`);
    if (t < ta + FLIP) {
      // the flip up over the binding: scaleY 1 -> -0.7 about the top edge (frame 1: edge-on-ish, frame 2: its back)
      const q = (t - ta) / FLIP;
      const sy = 1 - 1.7 * E.outCubic(Math.min(1, q + 0.5));
      out.push(
        <XG key={i} m={mat.compose(mat.translate(top[0], top[1]), mat.scale(1, sy))}>
          <YearPage w={w} h={h} seed={`${seed}/${i % 3}`} back={sy < 0} />
        </XG>,
      );
      return;
    }
    const q = (t - ta - FLIP) / (life - FLIP);
    // it turns over to its FRONT (the year grid) within the first 30 % and flutters (front out), drifting up and a
    // little right while it shrinks away (into the distance): a page off THAT calendar, not a loose leaflet
    const dx = lerp(0, 24 + r('x') * 46, E.outCubic(q));
    const dy = lerp(-h * 0.7, -(h * 0.7 + 40 + r('y') * 40), E.outQuad(q)) + 20 * q * q;
    const rot = (r('r') - 0.4) * 40 * q + 8 * Math.sin(q * 9 + r('p') * 6);
    const sc = 1 - 0.68 * E.outQuad(q);
    const fl = q < 0.3 ? lerp(-0.7, 0.9, E.inOutSine(q / 0.3)) : 0.9 - 0.25 * Math.abs(Math.sin((q - 0.3) * 8 + r('f') * 6));
    out.push(
      <XG key={i} m={mat.compose(mat.translate(top[0] + dx + (w * (1 - sc)) / 2, top[1] + dy), mat.rotate(rot), mat.scale(sc, sc * fl))}>
        <YearPage w={w} h={h} seed={`${seed}/${i % 3}`} back={fl < 0} />
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

/** The hero house's windows live through the fourteen years: on every other tear one window changes (a blind comes
 *  down, curtains are drawn, a plant appears on the sill, or it is bare again), one-frame pops like a time-lapse. */
export const WindowLife: React.FC<{tears: number[]; flatAbove?: number; seed?: string}> = ({tears, flatAbove, seed = 's4win'}) => {
  const t = useTime();
  const state = [...WIN_START];
  WIN_ORDER.forEach((w, k) => {
    const at = tears[k * 2];
    if (at !== undefined && t >= at) state[w] = WIN_CYCLE[(WIN_CYCLE.indexOf(state[w]) + 1 + (k % 2)) % WIN_CYCLE.length];
  });
  let peach = '';
  let blindSand = '';
  let cream = '';
  let tan = '';
  let sage = '';
  let ink = '';
  HERO_WINS.forEach(([x, y, w, h], i) => {
    const s = state[i];
    if (s === 'blind') {
      const bh = h * (0.38 + rand(seed, `b${i}`) * 0.14);
      // fix round 2: in the dive the windows above the flatten line slide up through the caption band, where peach
      // belongs only to the caption highlight: their blinds repaint sand with the flatten (one unit, its first frame)
      if (flatAbove !== undefined && y < flatAbove) blindSand += rectPath(x + 2, y + 2, w - 4, bh);
      else peach += rectPath(x + 2, y + 2, w - 4, bh);
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
      {peach ? <Fill d={peach} color={palette.peach} offset={false} mode="none" seed={`${seed}/p`} /> : null}
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

/** The ground layer, re-inked: the set's ground FILLS (road, pavements) with its own kerb lines, the kerb-stone joints,
 *  a drain grate and a few specks instead of its long paving rays. */
export const GroundS04: React.FC<{node: React.ReactNode}> = ({node}) => (
  <>
    <Look ink={false}>{node}</Look>
    <Ink d={KERB_INK} width={SI.front} seed="stoop/kerb" />
    <Ink d={KERB_JOINTS} width={SI.far} taper={false} seed="s4kj" />
    <Ink d={SPECKS} width={SI.far} taper={false} seed="s4sp" />
    <Fill rect={GRATE} color={palette.tealDark} offset={false} mode="none" seed="s4gr" />
    <Ink d={GRATE_INK} width={SI.far} taper={false} seed="s4gri" />
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

// ---------------------------------------------------------------- the browser window's flat chrome (dive)

/** During the dive the hero's browser window is flat with the rest of the upper facade, and its chrome bar crosses the
 *  captions: the kit's tealDark bar under ink lettering is ~2.4:1 (framecheck: 8 % of the band below 3:1), so in the
 *  dive the bar is repainted one step lighter (teal, ~3.6:1) with its three dots and the address pill on top: still the
 *  browser's chrome (the 'this is a website' cue never disappears), legible under the text. Fix round 2 (major: the
 *  peach headline block slid in behind 'like' / 'bug was in there' and read as a second, misplaced highlight box): the
 *  page under the bar is ONE cream field (inside the caption band peach belongs only to the caption highlight), and the
 *  third dot is sand, not peach. Geometry = BrowserChrome's (bar min(30, 0.27 h), dots r 0.25 bar at 0.47 bar + i x
 *  0.63 bar, the pill after them). Draw it in the hero slot from the dive's first frame: it only shows in the flat copy
 *  (above the flatten line). */
export const FlatChrome: React.FC<{on: boolean}> = ({on}) => {
  if (!on) return null;
  const [x, y, w, h] = STOOP.browser;
  const bar = Math.min(30, h * 0.27);
  const dr = bar * 0.25;
  const sp = bar * 0.63;
  const d0 = bar * 0.47;
  const cy = y + bar / 2;
  const px = d0 + 2 * sp + dr + bar * 0.38;
  const pw = Math.max(bar, w - px - bar * 0.35);
  const ph = bar * 0.6;
  const dot = (i: number) => `M${x + d0 + i * sp - dr} ${cy}a${dr} ${dr} 0 1 0 ${2 * dr} 0a${dr} ${dr} 0 1 0 ${-2 * dr} 0Z`;
  const pill = `M${x + px + ph / 2} ${cy - ph / 2}H${x + px + pw - ph / 2}a${ph / 2} ${ph / 2} 0 0 1 0 ${ph}H${x + px + ph / 2}a${ph / 2} ${ph / 2} 0 0 1 0 ${-ph}Z`;
  return (
    <>
      <Fill d={rectPath(x - 4, y + bar - 1, w + 8, h - bar + 5)} color={palette.cream} offset={false} mode="none" seed="s4/fcs" />
      <Fill d={rectPath(x - 3, y - 3, w + 6, bar + 4)} color={palette.teal} offset={false} mode="none" seed="s4/fc" />
      <Fill d={dot(0)} color={palette.cream} offset={false} mode="none" seed="s4/fc0" />
      <Fill d={dot(1)} color={palette.sage} offset={false} mode="none" seed="s4/fc1" />
      <Fill d={dot(2)} color={palette.sand} offset={false} mode="none" seed="s4/fc2" />
      <Fill d={pill} color={palette.cream} offset={false} mode="none" seed="s4/fcp" />
    </>
  );
};
