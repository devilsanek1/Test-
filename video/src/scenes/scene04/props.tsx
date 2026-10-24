// S04 local props: the season ivy on door #4's frame (THE season cue: it creeps up one node per step and recolours every
// two tears: green, peach, tan, bare), the torn year pages flying off the tear-off calendar (several in the air at once:
// the time-lapse), and the season clock shared by the ivy and the near tree.

import React from 'react';
import {palette, skies} from '../../lib/theme';
import {ease as E, lerp, prog, springAt, springs, useTime} from '../../lib/time';
import {Ink} from '../../lib/Ink';
import {Fill} from '../../lib/Fill';
import {rand} from '../../lib/rng';
import {rectPath, Pt} from '../../lib/sketch';
import {mat, XG} from '../../lib/xf';
import type {Season} from '../shared/sets';
import {STOOP} from '../shared/sets';

// ---------------------------------------------------------------- seasons

export const SEASON_FILL: Record<Season, string | null> = {green: palette.sage, peach: palette.peach, tan: palette.tan, bare: null};

/** The season keys: green until the time-lapse, then one step every two tears (tears 2, 4, ... 12: peach, tan, bare,
 *  green, peach, tan): fourteen years end in autumn (tan), the leaf's season. */
export function seasonKeys(tears: number[]): {t: number; s: Season}[] {
  const order: Season[] = ['peach', 'tan', 'bare', 'green', 'peach', 'tan'];
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

// ---------------------------------------------------------------- the torn year pages

const CAL = STOOP.calendar; // [x, y, w, h]: the 70 x 80 body, header 20 % (pages under it)

/** One year page (3 x 4 month grid, no numerals) in page-local coords (0,0 = its top-left), w x h. */
const YearPage: React.FC<{w: number; h: number; seed: string}> = ({w, h, seed}) => {
  const gx = w * 0.14;
  const gw = w * 0.72;
  const gy = h * 0.14;
  const gh = h * 0.72;
  let d = '';
  for (let c = 0; c <= 3; c++) d += `M${(gx + (gw * c) / 3).toFixed(1)} ${gy.toFixed(1)}V${(gy + gh).toFixed(1)}`;
  for (let r = 0; r <= 4; r++) d += `M${gx.toFixed(1)} ${(gy + (gh * r) / 4).toFixed(1)}H${(gx + gw).toFixed(1)}`;
  return (
    <>
      <Fill d={rectPath(0, 0, w, h)} color={palette.cream} offset={false} mode="none" seed={`${seed}/p`} />
      <Ink d={d} width={1.3} taper={false} seed={`${seed}/g`} />
      <Ink d={`M0 0H${w}V${h}H0Z`} width={2.0} taper={false} seed={`${seed}/o`} />
    </>
  );
};

/** The torn pages: each one flips up off the calendar's top edge, flutters up and to the right (seeded fan) and shrinks
 *  away into the distance over `life` s. Several are in the air at once (the time-lapse). */
export const YearFlyers: React.FC<{tears: number[]; life?: number; seed?: string}> = ({tears, life = 0.36, seed = 's4fly'}) => {
  const t = useTime();
  const w = CAL[2];
  const head = CAL[3] * 0.2;
  const h = CAL[3] - head;
  const top: Pt = [CAL[0], CAL[1] + head];
  const out: React.ReactNode[] = [];
  tears.forEach((ta, i) => {
    const q = (t - ta) / life;
    if (q < 0 || q >= 1) return;
    const r = (k: string) => rand(seed, `${i}${k}`);
    // flip up about the top edge (scaleY 1 -> -0.5 over the first 40 %), then flutter
    const flip = 1 - 1.5 * E.outCubic(Math.min(1, q / 0.4));
    const dx = lerp(0, 70 + r('x') * 90, E.outCubic(q));
    const dy = lerp(0, -(90 + r('y') * 70), E.outQuad(q)) + 30 * q * q;
    const rot = (r('r') - 0.35) * 70 * q + 12 * Math.sin(q * 9 + r('p') * 6);
    const sc = 1 - 0.75 * E.inQuad(q);
    out.push(
      <XG key={i} m={mat.compose(mat.translate(top[0] + dx, top[1] + dy), mat.rotate(rot), mat.scale(sc, sc * flip))}>
        <YearPage w={w} h={h} seed={`${seed}/${i % 3}`} />
      </XG>,
    );
  });
  return <>{out}</>;
};

/** A tiny 1-frame "tear" tick: the two binding holes' paper stubs left on the header after a tear (life). */
export const TearStubs: React.FC<{tears: number[]}> = ({tears}) => {
  const t = useTime();
  const n = tears.filter((x) => t >= x).length;
  if (!n) return null;
  // a few ragged stub marks under the header, more after more tears (max 5)
  const k = Math.min(5, Math.ceil(n / 3));
  let d = '';
  for (let i = 0; i < k; i++) {
    const x = CAL[0] + 8 + i * 12;
    const y = CAL[1] + CAL[3] * 0.2;
    d += `M${x} ${y}l3 4l3 -3l3 4`;
  }
  return <Ink d={d} width={1.2} taper={false} />;
};

/** Pop scale (7 % spring) for an element appearing at `at`, 0 before. */
export const popK = (t: number, at: number) => (t < at ? 0 : springAt(t, at, springs.pop));

/** 0..1 over [a, a + d] with an ease. */
export const pr = (t: number, a: number, d: number, e = E.inOutSine) => prog(t, a, d, e);

// ---------------------------------------------------------------- the dive's calm caption band

/** The hero house's windows (StoopStreet's own list) and frame. */
const HERO_WINS: [number, number, number, number][] = [
  [70, 712, 62, 92],
  [70, 862, 62, 92],
  [70, 1012, 62, 92],
  [428, 712, 62, 92],
  [428, 862, 62, 92],
];

/** The shade strip on the hero facade's left quarter (tan; the rest of the wall is sand). */
const SHADE_X = STOOP.hero.x + STOOP.hero.w * 0.25;
/** A wall-coloured cover over [x, y, w, h] that follows the shade strip (tan left of it, sand right of it). */
const wallCover = (x: number, y: number, w: number, h: number): {tan: string; sand: string} => {
  const x1 = x + w;
  if (x1 <= SHADE_X) return {tan: rectPath(x, y, w, h), sand: ''};
  if (x >= SHADE_X) return {tan: '', sand: rectPath(x, y, w, h)};
  return {tan: rectPath(x, y, SHADE_X - x, h), sand: rectPath(SHADE_X, y, x1 - SHADE_X, h)};
};

type FlatObj = {id: string; top: number; draw: () => {tan: string; sand: string; cream: string; sage: string; lite: string; sky: string}};

/** The objects of the hero facade that cross the caption band during the dive, each with its FLAT (no-ink) version:
 *  the cornice (tan band + cream rim; its ink overshoots covered with sky above the left row's roof), every window
 *  (wall margin, cream frame, sage glass, pale lite), the browser window (flattened to the WALL: it melts into the
 *  facade instead of becoming a plate behind the caption). `top` = the object's world top (incl. its ink). */
const FLAT_OBJS: FlatObj[] = (() => {
  const H = STOOP.hero;
  const B = STOOP.browser;
  const out: FlatObj[] = [];
  out.push({
    id: 'cornice',
    top: H.y - 16,
    draw: () => {
      const below = wallCover(H.x, H.y + 38, H.w, 12);
      // the overshoot ends: sky left of the house; on the right only ABOVE the left row's roofline (y = 660 + 2 (x - 520))
      const sky = rectPath(H.x - 44, H.y - 16, 38, 70) + `M${H.x + H.w + 6} ${H.y - 16}H${H.x + H.w + 50}V${H.y + 54}H${H.x + H.w + 17}L${H.x + H.w + 6} ${H.y + 32}Z`;
      // the lower line's end stubs: sky left of the house, the left row's cream facade right of it
      const stubs = rectPath(H.x - 6, H.y + 38, 6, 16);
      return {tan: rectPath(H.x - 6, H.y, H.w + 12, 40) + below.tan, sand: below.sand, cream: rectPath(H.x - 6, H.y - 7, H.w + 12, 8) + rectPath(H.x + H.w, H.y + 38, 8, 14), sage: '', lite: '', sky: sky + stubs + rectPath(H.x - 6, H.y - 16, H.w + 12, 9)};
    },
  });
  HERO_WINS.forEach(([x, y, w, h], i) => {
    out.push({
      id: `w${i}`,
      top: y - 16,
      draw: () => {
        const m = wallCover(x - 16, y - 16, w + 32, h + 32);
        return {tan: m.tan, sand: m.sand, cream: rectPath(x - 6, y - 6, w + 12, h + 12), sage: rectPath(x, y, w, h), lite: rectPath(x + 1, y, w - 2, h * 0.58), sky: ''};
      },
    });
  });
  out.push({
    id: 'browser',
    top: B[1] - 16,
    draw: () => {
      const m = wallCover(B[0] - 36, B[1] - 16, B[2] + 54, B[3] + 32);
      return {tan: m.tan, sand: m.sand, cream: '', sage: '', lite: '', sky: ''};
    },
  });
  return out;
})();

/** During the dive the hero facade sweeps up through the caption band (y 280-570). From `from` on, every object that
 *  has ENTERED the band (its screen top above `bandBottom`) pops WHOLE to its flat no-ink version on the first frame
 *  it is in (a per-object LOD swap: any seam follows the object's own edges, never a screen line). Outside the dive
 *  nothing changes. */
export const DiveFlat: React.FC<{cam: {y: number; zoom: number}; from: number; bandBottom?: number; seed?: string}> = ({cam, from, bandBottom = 588, seed = 's4flat'}) => {
  const t = useTime();
  if (t < from) return null;
  let tan = '';
  let sand = '';
  let cream = '';
  let sage = '';
  let lite = '';
  let sky = '';
  for (const o of FLAT_OBJS) {
    const top = (o.top - cam.y) * cam.zoom + 960;
    if (top >= bandBottom) continue;
    const d = o.draw();
    tan += d.tan;
    sand += d.sand;
    cream += d.cream;
    sage += d.sage;
    lite += d.lite;
    sky += d.sky;
  }
  const f = (d: string, color: string, k: string) => (d ? <Fill d={d} color={color} offset={false} mode="none" exit={false} seed={`${seed}/${k}`} /> : null);
  return (
    <>
      {f(sky, skies.day, 'k')}
      {f(tan, palette.tan, 't')}
      {f(sand, palette.sand, 's')}
      {f(cream, palette.cream, 'c')}
      {f(sage, palette.sage, 'g')}
      {f(lite, palette.mintPale, 'l')}
    </>
  );
};

// ---------------------------------------------------------------- the neighbours' windows (time-lapse life)

type WinState = 'none' | 'blind' | 'curtain' | 'plant';
const WIN_CYCLE: WinState[] = ['none', 'blind', 'curtain', 'plant'];
const WIN_START: WinState[] = ['curtain', 'none', 'plant', 'blind', 'none'];
const WIN_ORDER = [3, 0, 4, 1, 2, 0, 3];

/** The hero house's windows live through the fourteen years: on every other tear one window changes (a blind comes
 *  down, curtains are drawn, a plant appears on the sill, or it is bare again), one-frame pops like a time-lapse. */
export const WindowLife: React.FC<{tears: number[]; seed?: string}> = ({tears, seed = 's4win'}) => {
  const t = useTime();
  const state = [...WIN_START];
  WIN_ORDER.forEach((w, k) => {
    const at = tears[k * 2];
    if (at !== undefined && t >= at) state[w] = WIN_CYCLE[(WIN_CYCLE.indexOf(state[w]) + 1 + (k % 2)) % WIN_CYCLE.length];
  });
  let peach = '';
  let cream = '';
  let tan = '';
  let sage = '';
  let ink = '';
  HERO_WINS.forEach(([x, y, w, h], i) => {
    const s = state[i];
    if (s === 'blind') {
      const bh = h * (0.38 + rand(seed, `b${i}`) * 0.14);
      peach += rectPath(x + 2, y + 2, w - 4, bh);
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
      {cream ? <Fill d={cream} color={palette.cream} offset={false} mode="none" seed={`${seed}/c`} /> : null}
      {tan ? <Fill d={tan} color={palette.tan} offset={false} mode="none" seed={`${seed}/t`} /> : null}
      {sage ? <Fill d={sage} color={palette.sage} offset={false} mode="none" seed={`${seed}/s`} /> : null}
      {ink ? <Ink d={ink} width={1.8} taper={false} seed={`${seed}/i`} /> : null}
    </>
  );
};
