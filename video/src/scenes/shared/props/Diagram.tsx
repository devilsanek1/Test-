// props/Diagram.tsx — the S02 takeover DIAGRAM pieces (storyboard v3), drawn on the PHP master blueprint (and the S05
// callback). Promoted from the S02 scene shims with the same names and props, so a scene swaps its import:
//
//   <DiagramHand x={pinchX} y={pinchY} angle={-36} scale={0.82} enterAt={5.83} from={520} turnAt={6.42} turnDeg={34} exitAt={8.27} />
//   <DiagramHand ... drawAt={18.87} turnAt={18.95} undrawAt={19.43} />        // S05 callback: redraws over the lock
//   <SiteIcon x={640} y={1090} w={120} h={120} at={5.70} takenAt={6.63} unlockAt={6.90} flutterAt={8.03} />
//   <KeyCross x={604} y={1030} size={84} at={7.28} crossAt={7.45} settleAt={8.03} />
//   dashPath(points, dash, gap, phase) / pointAlong(points, s)                  // dashed connectors that draw on / march
//
// DiagramHand: a bare hand in DASHED ink (no fill by default: the lock drawing reads through it; `handFill` for one)
// with a dashed hooded-sleeve cuff in the attempters' tealDark (the hoodie sleeve: `sleeve` colour, false = ink only).
// (x, y) = the PINCH point where the fingertips meet; the forearm runs off along `angle`; `scale` 1 = ~100 px from the
// fingertips to the cuff. enterAt slides it in along the arm (0.3 s out(cubic)) from `from` px away, the fingers settle
// (a small squeeze) `settle` s later, turnAt turns it `turnDeg` about the pinch (0.2 s), exitAt slides it back out
// (0.25 s in(cubic)). drawAt / undrawAt instead draw the dashes on / take them off (0.25 s, along the outline).
// SiteIcon: a schematic website house in a w x h box (top-left x, y): roof, walls, a browser window with dots, two
// content lines and a padlock; takenAt = ink hatching floods the window, then a small ink flag pops on the roof apex;
// unlockAt = the padlock's shackle pops open; flutterAt = the flag flutters.
// KeyCross: a key glyph (bow ring, shaft, two teeth) and, at crossAt, an ink cross through it (0.06 s); settleAt = a
// small 8 % pulse as the ink settles.

import React, {useId} from 'react';
import {palette} from '../../../lib/theme';
import {clamp, ease as E, lerp, osc, prog, springAt, springs, useTime} from '../../../lib/time';
import {Seed} from '../../../lib/rng';
import {Ink} from '../../../lib/Ink';
import {Fill} from '../../../lib/Fill';
import {ExitFade} from '../../../lib/exit';
import {useInkScale} from '../../../lib/inkComp';
import {circle, line, polyPath, Pt, rect} from '../../../lib/sketch';
import {mat, useXf, XG} from '../../../lib/xf';
import {matScale, misregScreen} from './common';

/** Screen-space misregistration converted to local units (k scales the 2.4-4 px offset). */
const useMisreg = (seed: Seed, k = 1): [number, number] => {
  const m = useXf();
  const s = Math.max(1e-3, matScale(m));
  const o = misregScreen(seed);
  return [(o[0] * k) / s, (o[1] * k) / s];
};

// ---------------------------------------------------------------- dashed polylines

/** Explicit dash subpaths along a polyline (so <Ink> can draw the dashes on one after another). `phase` shifts the
 *  pattern along the path (0..1 of one period): the "dashes march" beat. Returns the path and its length. */
export function dashPath(pts: Pt[], dash: number, gap: number, phase = 0): {d: string; len: number} {
  const segs: {a: Pt; b: Pt; l: number}[] = [];
  let len = 0;
  for (let i = 0; i < pts.length - 1; i++) {
    const l = Math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1]);
    segs.push({a: pts[i], b: pts[i + 1], l});
    len += l;
  }
  const at = (s: number): Pt => {
    let r = clamp(s, 0, len);
    for (const g of segs) {
      if (r <= g.l) return g.l > 0 ? [lerp(g.a[0], g.b[0], r / g.l), lerp(g.a[1], g.b[1], r / g.l)] : g.a;
      r -= g.l;
    }
    return pts[pts.length - 1];
  };
  const period = dash + gap;
  let d = '';
  for (let s = -period + (phase % 1) * period; s < len; s += period) {
    const s0 = Math.max(0, s);
    const s1 = Math.min(len, s + dash);
    if (s1 - s0 < 0.8) continue;
    let p = at(s0);
    d += `M${p[0].toFixed(1)} ${p[1].toFixed(1)}`;
    let acc = 0;
    for (const g of segs) {
      const c = acc + g.l;
      if (c > s0 && c < s1) {
        p = g.b;
        d += `L${p[0].toFixed(1)} ${p[1].toFixed(1)}`;
      }
      acc = c;
    }
    p = at(s1);
    d += `L${p[0].toFixed(1)} ${p[1].toFixed(1)}`;
  }
  return {d, len};
}

/** Point and direction (deg) at arc length s along a polyline. */
export function pointAlong(pts: Pt[], s: number): {p: Pt; ang: number} {
  let r = Math.max(0, s);
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i];
    const b = pts[i + 1];
    const l = Math.hypot(b[0] - a[0], b[1] - a[1]);
    if (r <= l || i === pts.length - 2) {
      const u = l > 0 ? clamp(r / l) : 1;
      return {p: [lerp(a[0], b[0], u), lerp(a[1], b[1], u)], ang: (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI};
    }
    r -= l;
  }
  return {p: pts[pts.length - 1], ang: 0};
}

/** Flatten an absolute SVG path (M L H V C Z) into polylines (beziers sampled `n` steps each). */
export function flattenPath(d: string, n = 10): Pt[][] {
  const tok = d.match(/[MLHVCZ]|-?\d*\.?\d+(?:e-?\d+)?/gi) ?? [];
  const out: Pt[][] = [];
  let cur: Pt[] = [];
  let i = 0;
  let cmd = '';
  let p: Pt = [0, 0];
  let start: Pt = [0, 0];
  const num = () => parseFloat(tok[i++]);
  while (i < tok.length) {
    if (/[MLHVCZ]/i.test(tok[i])) cmd = tok[i++].toUpperCase();
    if (cmd === 'M') {
      if (cur.length > 1) out.push(cur);
      p = [num(), num()];
      start = p;
      cur = [p];
      cmd = 'L';
    } else if (cmd === 'L') {
      p = [num(), num()];
      cur.push(p);
    } else if (cmd === 'H') {
      p = [num(), p[1]];
      cur.push(p);
    } else if (cmd === 'V') {
      p = [p[0], num()];
      cur.push(p);
    } else if (cmd === 'C') {
      const c1: Pt = [num(), num()];
      const c2: Pt = [num(), num()];
      const e: Pt = [num(), num()];
      for (let k = 1; k <= n; k++) {
        const u = k / n;
        const v = 1 - u;
        cur.push([v * v * v * p[0] + 3 * v * v * u * c1[0] + 3 * v * u * u * c2[0] + u * u * u * e[0], v * v * v * p[1] + 3 * v * v * u * c1[1] + 3 * v * u * u * c2[1] + u * u * u * e[1]]);
      }
      p = e;
    } else if (cmd === 'Z') {
      cur.push(start);
      p = start;
      if (cur.length > 1) out.push(cur);
      cur = [];
      cmd = '';
    } else i++;
  }
  if (cur.length > 1) out.push(cur);
  return out;
}

const DASH_CACHE = new Map<string, string[]>();
/** Explicit dash subpaths (one string per dash, in drawing order) for a path at a dash / gap in local units. */
function dashesOf(d: string, dash: number, gap: number): string[] {
  const key = `${d}|${dash.toFixed(2)}|${gap.toFixed(2)}`;
  const hit = DASH_CACHE.get(key);
  if (hit) return hit;
  const res: string[] = [];
  for (const pl of flattenPath(d)) {
    const {d: dd} = dashPath(pl, dash, gap);
    for (const part of dd.split('M')) if (part) res.push('M' + part);
  }
  if (DASH_CACHE.size > 400) DASH_CACHE.clear();
  DASH_CACHE.set(key, res);
  return res;
}

// ---------------------------------------------------------------- DiagramHand

export type DiagramHandProps = {
  /** The pinch point (world px) where the fingertips meet. */
  x: number;
  y: number;
  /** Direction the forearm runs from the hand (deg, 0 = to the right, negative = up-right). Default -20. */
  angle?: number;
  /** Hand length scale (1 = ~100 px from fingertips to the cuff). */
  scale?: number;
  /** Slides in along the arm (0.3 s, out(cubic)) from `from` world px away (default 760). */
  enterAt?: number;
  from?: number;
  /** Fingers settle on the knob (a small squeeze) this long after the entry ends (default 0.12). */
  settle?: number;
  /** Turns about the pinch point by `turnDeg` (0.2 s, in-out cubic). */
  turnAt?: number;
  turnDeg?: number;
  /** Slides back out along the arm (0.25 s, in(cubic)). */
  exitAt?: number;
  /** S05 callback: the dashes draw on along the outlines (0.25 s) instead of a slide in / are taken off at undrawAt. */
  drawAt?: number;
  undrawAt?: number;
  drawDur?: number;
  /** Ink width (world px, default 3.4). */
  ink?: number;
  /** Dash and gap in world px (default 7 / 5.5). */
  dash?: [number, number];
  /** Hand fill (default none: a bare dashed hand, the drawing reads through it). */
  handFill?: string;
  /** Sleeve / cuff fills (default teal / tealDark: the attempters' hoodie). false = ink only. */
  sleeve?: string | false;
  cuff?: string | false;
  color?: string;
  seed?: Seed;
};

// local hand: fingertips at the origin pointing to -x, the forearm along +x
const HAND_OUT =
  'M2 -10C10 -16 24 -20 38 -24C52 -30 70 -31 84 -25L100 -23L100 23C86 27 70 31 56 30C45 30 37 27 31 22C23 18 13 13 5 9C0 7 -1 3 3 1.5C10 2.5 18 5 25 6.5C21 1.5 15 -1.5 7 -2.5C2 -3 -2 -6 2 -10Z';
const HAND_DETAIL = 'M4.5 -9C7 -11 10 -11.5 13 -10.5' + 'M6 5.5C8.5 7 11 7.5 13.5 7' + 'M33 3C38 9 45 11 52 9' + 'M42 13C47 18 54 20 61 18' + 'M53 22C57 25 63 26 69 24' + 'M38 -16C41 -13 41 -9 38 -6';
const SLEEVE = 'M98 -32L640 -70L640 70L98 32C93 12 93 -12 98 -32Z';
const SLEEVE_INK = 'M98 -32L640 -70M98 32L640 70';
const CUFF = 'M98 -32C93 -12 93 12 98 32L118 34C113 12 113 -12 118 -34Z';
const CUFF_RIBS = 'M103 -28V28M108 -29V29M113 -30V30';

export const DiagramHand: React.FC<DiagramHandProps> = ({
  x,
  y,
  angle = -20,
  scale = 1,
  enterAt,
  from = 760,
  settle = 0.12,
  turnAt,
  turnDeg = 38,
  exitAt,
  drawAt,
  undrawAt,
  drawDur = 0.25,
  ink = 3.4,
  dash = [7, 5.5],
  handFill,
  sleeve = palette.teal,
  cuff = palette.tealDark,
  color = palette.ink,
  seed = 'hand',
}) => {
  const t = useTime();
  const off = useMisreg(`${seed}/sl`, 1.3);
  if (enterAt !== undefined && t < enterAt) return null;
  if (drawAt !== undefined && t < drawAt) return null;
  if (undrawAt !== undefined && t >= undrawAt + drawDur) return null;
  const a = (angle * Math.PI) / 180;
  const ux = Math.cos(a);
  const uy = Math.sin(a);
  let d = 0;
  if (enterAt !== undefined) d = from * (1 - prog(t, enterAt, 0.3, E.outCubic));
  if (exitAt !== undefined && t >= exitAt) d = from * prog(t, exitAt, 0.25, E.inCubic);
  if (d >= from - 1) return null;
  const rot = turnAt === undefined ? 0 : turnDeg * prog(t, turnAt, 0.2, E.inOutCubic);
  const sq = enterAt === undefined ? 0 : Math.max(0, Math.sin(clamp((t - enterAt - 0.3 - settle) / 0.14) * Math.PI)) * 0.05;
  const W = ink / scale;
  const m = mat.compose(mat.translate(x + ux * d, y + uy * d), mat.rotate(angle + rot), mat.scale(scale * (1 - sq), scale * (1 + sq * 0.5)));
  // dash reveal: drawAt draws the dashes on (hand first, then cuff and sleeve), undrawAt takes them off in reverse
  let q = 1;
  if (drawAt !== undefined) q = prog(t, drawAt, drawDur);
  if (undrawAt !== undefined && t >= undrawAt) q = Math.min(q, 1 - prog(t, undrawAt, drawDur));
  const [dl, gl] = [dash[0] / scale, dash[1] / scale];
  const pick = (dd: string, q0: number, q1: number, dsh = dl, gp = gl) => {
    const all = dashesOf(dd, dsh, gp);
    const u = clamp((q - q0) / (q1 - q0));
    return u >= 1 ? all.join('') : all.slice(0, Math.floor(all.length * u)).join('');
  };
  const handD = pick(HAND_OUT, 0, 0.6);
  const detD = pick(HAND_DETAIL, 0.35, 0.75, (dash[0] * 0.7) / scale, (dash[1] * 0.7) / scale);
  const cuffD = pick(CUFF + CUFF_RIBS, 0.5, 0.9);
  const slD = pick(SLEEVE_INK, 0.6, 1);
  const fillsOn = q >= 0.55;
  const offL: [number, number] = [off[0] / scale, off[1] / scale];
  return (
    <XG m={m}>
      {fillsOn && sleeve ? <Fill d={SLEEVE} color={sleeve} offset={offL} mode="none" seed={`${seed}/slf`} /> : null}
      {fillsOn && cuff ? <Fill d={CUFF} color={cuff} offset={offL} mode="none" seed={`${seed}/cf`} /> : null}
      {slD ? <Ink d={slD} width={W} color={color} taper={false} vary={0} seed={`${seed}/sli`} /> : null}
      {cuffD ? <Ink d={cuffD} width={W * 0.7} color={color} taper={false} vary={0} seed={`${seed}/cfi`} /> : null}
      {fillsOn && handFill ? <Fill d={HAND_OUT} color={handFill} offset={false} mode="none" seed={`${seed}/hf`} /> : null}
      {handD ? <Ink d={handD} width={W} color={color} taper={false} vary={0} seed={`${seed}/hi`} /> : null}
      {detD ? <Ink d={detD} width={W * 0.7} color={color} taper={false} vary={0} seed={`${seed}/hd`} /> : null}
    </XG>
  );
};

// ---------------------------------------------------------------- SiteIcon

export type SiteIconProps = {
  /** Box (world px): the icon fits [x, y, w, h] (x, y = top-left). */
  x: number;
  y: number;
  w?: number;
  h?: number;
  at?: number;
  /** Taken over: ink hatching floods the window (0.22 s), then an ink flag pops on the roof apex (+0.2). */
  takenAt?: number;
  /** The padlock's shackle pops open. */
  unlockAt?: number;
  /** The roof flag flutters. */
  flutterAt?: number;
  ink?: number;
  seed?: Seed;
};

export const SiteIcon: React.FC<SiteIconProps> = ({x, y, w = 120, h = 120, at, takenAt, unlockAt, flutterAt, ink = 3.4, seed = 'site'}) => {
  const t = useTime();
  const uid = 'si' + useId().replace(/[^a-zA-Z0-9]/g, '');
  const off = useMisreg(seed);
  const ks = useInkScale(); // camera ink compensation for the raw strokes below (lib/inkComp.tsx): 1 outside an <InkScale>
  if (at !== undefined && t < at) return null;
  const u = w / 120;
  const X = (v: number) => x + v * u;
  const Y = (v: number) => y + v * (h / 120);
  const house = polyPath([
    [X(60), Y(4)],
    [X(114), Y(44)],
    [X(106), Y(44)],
    [X(106), Y(118)],
    [X(14), Y(118)],
    [X(14), Y(44)],
    [X(6), Y(44)],
  ]);
  const houseInk =
    line(X(4), Y(46), X(60), Y(3), {seed: `${seed}/r1`, over: [3, 2]}) +
    line(X(60), Y(3), X(116), Y(46), {seed: `${seed}/r2`, over: [2, 3]}) +
    line(X(14), Y(44), X(14), Y(118), {seed: `${seed}/w1`, over: [0, 3]}) +
    line(X(106), Y(44), X(106), Y(118), {seed: `${seed}/w2`, over: [0, 3]}) +
    line(X(4), Y(118), X(116), Y(118), {seed: `${seed}/g`, over: [4, 4]});
  const win = [X(26), Y(54), X(94) - X(26), Y(104) - Y(54)] as [number, number, number, number];
  const winInk = rect(win[0], win[1], win[2], win[3], {seed: `${seed}/win`, over: 'small'}) + line(win[0], win[1] + 11 * u, win[0] + win[2], win[1] + 11 * u, {seed: `${seed}/bar`, over: [0, 0]});
  const dots = circle(win[0] + 6 * u, win[1] + 5.5 * u, 2.2 * u, {seed: `${seed}/d1`}) + circle(win[0] + 13 * u, win[1] + 5.5 * u, 2.2 * u, {seed: `${seed}/d2`}) + circle(win[0] + 20 * u, win[1] + 5.5 * u, 2.2 * u, {seed: `${seed}/d3`});
  const content = line(win[0] + 8 * u, win[1] + 22 * u, win[0] + 44 * u, win[1] + 22 * u, {seed: `${seed}/c1`, over: [0, 0]}) + line(win[0] + 8 * u, win[1] + 31 * u, win[0] + 36 * u, win[1] + 31 * u, {seed: `${seed}/c2`, over: [0, 0]});
  const inkAt = (dt: number) => (at === undefined ? undefined : at + dt);
  const hatchP = takenAt === undefined ? 0 : prog(t, takenAt + 0.05, 0.22, E.outCubic);
  let hatch = '';
  if (hatchP > 0) {
    const n = 16;
    for (let i = 0; i < n; i++) {
      const xx = win[0] - win[3] + ((win[2] + win[3]) * (i + 0.5)) / n;
      if ((i + 0.5) / n > hatchP) break;
      hatch += `M${xx.toFixed(1)} ${(win[1] + win[3]).toFixed(1)}L${(xx + win[3]).toFixed(1)} ${win[1].toFixed(1)}`;
    }
  }
  const flagAt = takenAt === undefined ? undefined : takenAt + 0.2;
  const flagK = flagAt === undefined ? 0 : springAt(t, flagAt, springs.pop);
  const flap = flutterAt === undefined || t < flutterAt ? 0 : Math.exp(-(t - flutterAt) * 5) * osc(t - flutterAt, 4.2);
  const pole: Pt = [X(60), Y(3)];
  const pl: Pt = [win[0] + win[2] - 10 * u, win[1] + win[3] - 10 * u];
  const unl = unlockAt === undefined ? 0 : springAt(t, unlockAt, springs.snappy);
  const shackleRot = -50 * unl;
  const shackleLift = 4 * u * unl;
  return (
    <g>
      <Fill d={house} color={palette.cream} at={inkAt(0.12)} offset={off} seed={`${seed}/hf`} />
      <Fill rect={win} color={palette.white} at={inkAt(0.18)} offset={false} seed={`${seed}/wf`} />
      <Ink d={houseInk} at={at} dur={0.12} width={ink} seed={`${seed}/hi`} />
      <Ink d={winInk} at={inkAt(0.1)} dur={0.08} width={ink * 0.7} taper={false} seed={`${seed}/wi`} />
      <Ink d={dots + content} at={inkAt(0.18)} width={ink * 0.5} taper={false} order="all" seed={`${seed}/dt`} />
      {hatch ? (
        <ExitFade>
          <defs>
            <clipPath id={`${uid}w`}>
              <rect x={win[0]} y={win[1] + 11 * u} width={win[2]} height={win[3] - 11 * u} />
            </clipPath>
          </defs>
          <g clipPath={`url(#${uid}w)`}>
            <path d={hatch} stroke={palette.ink} strokeWidth={ink * 0.62 * ks} strokeLinecap="round" fill="none" />
          </g>
        </ExitFade>
      ) : null}
      {at === undefined || t >= at + 0.22 ? (
        <g>
          <XG m={mat.compose(mat.translate(0, -shackleLift), mat.about(mat.rotate(shackleRot), pl[0] + 5 * u, pl[1] - 3 * u))}>
            <Ink d={`M${pl[0] - 5 * u} ${pl[1] - 3 * u}V${pl[1] - 9 * u}A${5 * u} ${5 * u} 0 0 1 ${pl[0] + 5 * u} ${pl[1] - 9 * u}V${pl[1] - 3 * u}`} width={ink * 0.62} taper={false} vary={0} seed={`${seed}/sh`} />
          </XG>
          <Fill rect={[pl[0] - 8 * u, pl[1] - 4 * u, 16 * u, 13 * u]} color={palette.sand} offset={false} mode="none" seed={`${seed}/pb`} />
          <Ink d={rect(pl[0] - 8 * u, pl[1] - 4 * u, 16 * u, 13 * u, {seed: `${seed}/pbi`, over: 'small'})} width={ink * 0.6} taper={false} seed={`${seed}/pbi`} />
        </g>
      ) : null}
      {flagK > 0.01 ? (
        <ExitFade x={pole[0]} y={pole[1]}>
          <XG m={mat.about(mat.scale(flagK), pole[0], pole[1])}>
            <path d={`M${pole[0]} ${pole[1]}V${pole[1] - 30 * u}`} stroke={palette.ink} strokeWidth={ink * 0.7 * ks} strokeLinecap="round" fill="none" />
            <XG m={mat.about(mat.scale(1 - Math.abs(flap) * 0.25, 1), pole[0], pole[1])}>
              <path d={`M${pole[0]} ${pole[1] - 30 * u}L${pole[0] + 20 * u} ${pole[1] - (25 + 3 * flap) * u}L${pole[0]} ${pole[1] - 19 * u}Z`} fill={palette.ink} />
            </XG>
          </XG>
        </ExitFade>
      ) : null}
    </g>
  );
};

// ---------------------------------------------------------------- KeyCross

export type KeyCrossProps = {
  /** Centre (world px). */
  x: number;
  y: number;
  /** Key length (world px, default 60). */
  size?: number;
  at?: number;
  /** The ink cross strikes through the key (0.06 s). */
  crossAt?: number;
  /** A small 8 % pulse as the ink settles (0.18 s). */
  settleAt?: number;
  ink?: number;
  seed?: Seed;
};

export const KeyCross: React.FC<KeyCrossProps> = ({x, y, size = 60, at, crossAt, settleAt, ink = 3.4, seed = 'key'}) => {
  const t = useTime();
  if (at !== undefined && t < at) return null;
  const k = size / 60;
  const P = (px: number, py: number): string => `${(x + px * k).toFixed(1)} ${(y + py * k).toFixed(1)}`;
  const key =
    circle(x - 19 * k, y, 9 * k, {seed: `${seed}/bow`, overlap: 10}) +
    `M${P(-10, -2.5)}L${P(27, -2.5)}` +
    `M${P(-10, 2.5)}L${P(27, 2.5)}L${P(27, -2.5)}` +
    `M${P(14, 2.5)}V${(y + 10 * k).toFixed(1)}H${(x + 19 * k).toFixed(1)}V${(y + 2.5 * k).toFixed(1)}` +
    `M${P(21, 2.5)}V${(y + 8 * k).toFixed(1)}H${(x + 25 * k).toFixed(1)}V${(y + 2.5 * k).toFixed(1)}`;
  const xs = line(x - 26 * k, y - 18 * k, x + 28 * k, y + 18 * k, {seed: `${seed}/x1`, over: [2, 5], bow: 1.5}) + line(x + 26 * k, y - 18 * k, x - 24 * k, y + 18 * k, {seed: `${seed}/x2`, over: [2, 6], bow: 1.5});
  const pulse = settleAt === undefined ? 1 : 1 + 0.08 * Math.sin(clamp((t - settleAt) / 0.18) * Math.PI);
  return (
    <XG m={mat.about(mat.scale(pulse), x, y)}>
      <Fill d={`M${x - 19 * k - 9 * k} ${y}a${9 * k} ${9 * k} 0 1 0 ${18 * k} 0a${9 * k} ${9 * k} 0 1 0 ${-18 * k} 0Z`} color={palette.white} at={at === undefined ? undefined : at + 0.08} offset={false} seed={`${seed}/bf`} />
      <Ink d={key} at={at} dur={0.1} width={ink * 0.7} taper={false} seed={`${seed}/k`} />
      {crossAt === undefined || t >= crossAt ? <Ink d={xs} at={crossAt} dur={0.06} width={ink * 1.05} seed={`${seed}/x`} /> : null}
    </XG>
  );
};
