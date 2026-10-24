// scene02/shims.tsx — LOCAL STAND-INS for props-lane pieces requested in docs/storyboard_v3.json `requests.props` that
// do not exist in src/scenes/shared/props yet. Same names and the requested props, so a later fix round swaps them for
// the shared versions (import {DiagramHand, SiteIcon, KeyCross} from '../shared/props'):
//   DiagramHand (a hand in DASHED ink on paper white, a dashed teal hoodie sleeve with a ribbed cuff; enterAt / turnAt /
//                exitAt / settleAt)
//   SiteIcon    (schematic website house; at / takenAt (window hatching + roof flag) / unlockAt (padlock opens) / flutterAt)
//   KeyCross    (key glyph + ink cross; at / crossAt / settleAt)
// Everything is ink + flat fills, seconds-driven, no opacity.

import React, {useId} from 'react';
import {palette} from '../../lib/theme';
import {clamp, ease as E, lerp, osc, prog, springAt, springs, useTime} from '../../lib/time';
import {Ink} from '../../lib/Ink';
import {Fill} from '../../lib/Fill';
import {circle, line, polyPath, rect, Pt} from '../../lib/sketch';
import {mat, useXf, XG} from '../../lib/xf';
import {matScale, misregScreen} from '../shared/props/common';

/** Screen-space misregistration converted to local units. */
const useMisreg = (seed: string, k = 1): [number, number] => {
  const m = useXf();
  const s = Math.max(1e-3, matScale(m));
  const o = misregScreen(seed);
  return [(o[0] * k) / s, (o[1] * k) / s];
};

// ================================================================ DiagramHand

export type DiagramHandProps = {
  /** The pinch point (world px) where the fingertips meet. */
  x: number;
  y: number;
  /** Direction the forearm runs from the hand (deg, 0 = to the right, negative = up-right). */
  angle?: number;
  /** Hand length scale (1 = ~100 px from fingertips to the cuff). */
  scale?: number;
  /** Slides in along the arm (0.3 s, out(cubic)) from `from` world px away. */
  enterAt?: number;
  from?: number;
  /** Fingers settle on the knob (a small squeeze) this long after the entry ends. */
  settle?: number;
  /** Turns about the pinch point by `turnDeg` (0.2 s). */
  turnAt?: number;
  turnDeg?: number;
  /** Slides back out along the arm (0.25 s, in(cubic)). */
  exitAt?: number;
  /** Ink width (world). */
  ink?: number;
  seed?: string;
};

// local hand: fingertips at the origin pointing to -x, the forearm along +x
const HAND_OUT =
  'M2 -10C10 -16 24 -20 38 -24C52 -30 70 -31 84 -25L100 -23L100 23C86 27 70 31 56 30C45 30 37 27 31 22C23 18 13 13 5 9C0 7 -1 3 3 1.5C10 2.5 18 5 25 6.5C21 1.5 15 -1.5 7 -2.5C2 -3 -2 -6 2 -10Z';
const HAND_DETAIL =
  // index nail, thumb nail, curled middle / ring / little fingers, a knuckle crease
  'M4.5 -9C7 -11 10 -11.5 13 -10.5' + 'M6 5.5C8.5 7 11 7.5 13.5 7' + 'M33 3C38 9 45 11 52 9' + 'M42 13C47 18 54 20 61 18' + 'M53 22C57 25 63 26 69 24' + 'M38 -16C41 -13 41 -9 38 -6';
const SLEEVE = 'M98 -32L640 -70L640 70L98 32C93 12 93 -12 98 -32Z';
const CUFF = 'M98 -32C93 -12 93 12 98 32L118 34C113 12 113 -12 118 -34Z';
const CUFF_RIBS = 'M103 -28V28M108 -29V29M113 -30V30';

export const DiagramHand: React.FC<DiagramHandProps> = ({x, y, angle = -20, scale = 1, enterAt, from = 760, settle = 0.12, turnAt, turnDeg = 38, exitAt, ink = 3.4, seed = 'hand'}) => {
  const t = useTime();
  const off = useMisreg(`${seed}/sl`, 1.3);
  if (enterAt !== undefined && t < enterAt) return null;
  const a = (angle * Math.PI) / 180;
  const ux = Math.cos(a);
  const uy = Math.sin(a);
  let d = 0;
  if (enterAt !== undefined) d = from * (1 - prog(t, enterAt, 0.3, E.outCubic));
  if (exitAt !== undefined && t >= exitAt) d = from * prog(t, exitAt, 0.25, E.inCubic);
  if (d >= from - 1) return null;
  const rot = turnAt === undefined ? 0 : turnDeg * prog(t, turnAt, 0.2, E.inOutCubic);
  // the fingers settle onto the knob: a 2-frame squeeze after the slide
  const sq = enterAt === undefined ? 0 : Math.max(0, Math.sin(clamp((t - enterAt - 0.3 - settle) / 0.14) * Math.PI)) * 0.05;
  const W = ink / scale;
  const m = mat.compose(mat.translate(x + ux * d, y + uy * d), mat.rotate(angle + rot), mat.scale(scale * (1 - sq), scale * (1 + sq * 0.5)));
  const dash = `${(7 / scale).toFixed(1)} ${(5.5 / scale).toFixed(1)}`;
  return (
    <XG m={m}>
      <Fill d={SLEEVE} color={palette.teal} offset={[off[0] / scale, off[1] / scale]} mode="none" seed={`${seed}/slf`} />
      <Fill d={CUFF} color={palette.tealDark} offset={[off[0] / scale, off[1] / scale]} mode="none" seed={`${seed}/cf`} />
      <Ink d={'M98 -32L640 -70M98 32L640 70'} width={W} dash={dash} taper={false} seed={`${seed}/sli`} />
      <Ink d={CUFF + CUFF_RIBS} width={W * 0.7} dash={dash} taper={false} seed={`${seed}/cfi`} />
      <Fill d={HAND_OUT} color={palette.white} offset={false} mode="none" seed={`${seed}/hf`} />
      <Ink d={HAND_OUT} width={W} dash={dash} taper={false} seed={`${seed}/hi`} />
      <Ink d={HAND_DETAIL} width={W * 0.7} dash={`${(5 / scale).toFixed(1)} ${(4 / scale).toFixed(1)}`} taper={false} seed={`${seed}/hd`} />
    </XG>
  );
};

// ================================================================ SiteIcon

export type SiteIconProps = {
  /** Box (world px): the icon fits [x, y, w, h]. */
  x: number;
  y: number;
  w?: number;
  h?: number;
  at?: number;
  takenAt?: number;
  unlockAt?: number;
  flutterAt?: number;
  ink?: number;
  seed?: string;
};

export const SiteIcon: React.FC<SiteIconProps> = ({x, y, w = 120, h = 120, at, takenAt, unlockAt, flutterAt, ink = 3.4, seed = 'site'}) => {
  const t = useTime();
  const uid = 'si' + useId().replace(/[^a-zA-Z0-9]/g, '');
  const off = useMisreg(seed);
  if (at !== undefined && t < at) return null;
  const u = w / 120;
  const X = (v: number) => x + v * u;
  const Y = (v: number) => y + v * (h / 120);
  // house: roof apex (60, 4), eaves 42, walls 12..108, base 118
  const house = polyPath([[X(60), Y(4)], [X(114), Y(44)], [X(106), Y(44)], [X(106), Y(118)], [X(14), Y(118)], [X(14), Y(44)], [X(6), Y(44)]]);
  const houseInk = line(X(4), Y(46), X(60), Y(3), {seed: `${seed}/r1`, over: [3, 2]}) + line(X(60), Y(3), X(116), Y(46), {seed: `${seed}/r2`, over: [2, 3]}) + line(X(14), Y(44), X(14), Y(118), {seed: `${seed}/w1`, over: [0, 3]}) + line(X(106), Y(44), X(106), Y(118), {seed: `${seed}/w2`, over: [0, 3]}) + line(X(4), Y(118), X(116), Y(118), {seed: `${seed}/g`, over: [4, 4]});
  const win = [X(26), Y(54), X(94) - X(26), Y(104) - Y(54)] as [number, number, number, number];
  const winInk = rect(win[0], win[1], win[2], win[3], {seed: `${seed}/win`, over: 'small'}) + line(win[0], win[1] + 11 * u, win[0] + win[2], win[1] + 11 * u, {seed: `${seed}/bar`, over: [0, 0]});
  const dots = circle(win[0] + 6 * u, win[1] + 5.5 * u, 2.2 * u, {seed: `${seed}/d1`}) + circle(win[0] + 13 * u, win[1] + 5.5 * u, 2.2 * u, {seed: `${seed}/d2`}) + circle(win[0] + 20 * u, win[1] + 5.5 * u, 2.2 * u, {seed: `${seed}/d3`});
  const content = line(win[0] + 8 * u, win[1] + 22 * u, win[0] + 44 * u, win[1] + 22 * u, {seed: `${seed}/c1`, over: [0, 0]}) + line(win[0] + 8 * u, win[1] + 31 * u, win[0] + 36 * u, win[1] + 31 * u, {seed: `${seed}/c2`, over: [0, 0]});
  const inkAt = (dt: number) => (at === undefined ? undefined : at + dt);
  // taken over: ink hatching floods the window (left to right), then a little ink flag pops on the roof
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
  // the padlock on the window's lower right: body + shackle; unlock = the shackle pops up and swings open
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
        <>
          <defs>
            <clipPath id={`${uid}w`}>
              <rect x={win[0]} y={win[1] + 11 * u} width={win[2]} height={win[3] - 11 * u} />
            </clipPath>
          </defs>
          <g clipPath={`url(#${uid}w)`}>
            <path d={hatch} stroke={palette.ink} strokeWidth={ink * 0.62} strokeLinecap="round" fill="none" />
          </g>
        </>
      ) : null}
      {/* padlock (body + shackle) */}
      {at === undefined || t >= at + 0.22 ? (
        <g>
          <XG m={mat.compose(mat.translate(0, -shackleLift), mat.about(mat.rotate(shackleRot), pl[0] + 5 * u, pl[1] - 3 * u))}>
            <path d={`M${pl[0] - 5 * u} ${pl[1] - 3 * u}V${pl[1] - 9 * u}A${5 * u} ${5 * u} 0 0 1 ${pl[0] + 5 * u} ${pl[1] - 9 * u}V${pl[1] - 3 * u}`} stroke={palette.ink} strokeWidth={ink * 0.62} fill="none" strokeLinecap="round" />
          </XG>
          <Fill rect={[pl[0] - 8 * u, pl[1] - 4 * u, 16 * u, 13 * u]} color={palette.sand} offset={false} mode="none" seed={`${seed}/pb`} />
          <Ink d={rect(pl[0] - 8 * u, pl[1] - 4 * u, 16 * u, 13 * u, {seed: `${seed}/pbi`, over: 'small'})} width={ink * 0.6} taper={false} seed={`${seed}/pbi`} />
        </g>
      ) : null}
      {/* the flag on the roof apex */}
      {flagK > 0.01 ? (
        <XG m={mat.about(mat.scale(flagK), pole[0], pole[1])}>
          <path d={`M${pole[0]} ${pole[1]}V${pole[1] - 30 * u}`} stroke={palette.ink} strokeWidth={ink * 0.7} strokeLinecap="round" fill="none" />
          <XG m={mat.about(mat.scale(1 - Math.abs(flap) * 0.25, 1), pole[0], pole[1])}>
            <path d={`M${pole[0]} ${pole[1] - 30 * u}L${pole[0] + 20 * u} ${pole[1] - (25 + 3 * flap) * u}L${pole[0]} ${pole[1] - 19 * u}Z`} fill={palette.ink} />
          </XG>
        </XG>
      ) : null}
    </g>
  );
};

// ================================================================ KeyCross

export type KeyCrossProps = {
  /** Centre (world px). */
  x: number;
  y: number;
  /** Key length (world px). */
  size?: number;
  at?: number;
  crossAt?: number;
  settleAt?: number;
  ink?: number;
  seed?: string;
};

export const KeyCross: React.FC<KeyCrossProps> = ({x, y, size = 60, at, crossAt, settleAt, ink = 3.4, seed = 'key'}) => {
  const t = useTime();
  if (at !== undefined && t < at) return null;
  const k = size / 60;
  const P = (px: number, py: number): string => `${(x + px * k).toFixed(1)} ${(y + py * k).toFixed(1)}`;
  // a key lying flat: bow ring at the left, shaft to the right, two teeth
  const key = circle(x - 19 * k, y, 9 * k, {seed: `${seed}/bow`, overlap: 10}) + `M${P(-10, -2.5)}L${P(27, -2.5)}` + `M${P(-10, 2.5)}L${P(27, 2.5)}L${P(27, -2.5)}` + `M${P(14, 2.5)}V${(y + 10 * k).toFixed(1)}H${(x + 19 * k).toFixed(1)}V${(y + 2.5 * k).toFixed(1)}` + `M${P(21, 2.5)}V${(y + 8 * k).toFixed(1)}H${(x + 25 * k).toFixed(1)}V${(y + 2.5 * k).toFixed(1)}`;
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

// ================================================================ dashed polylines that draw on

/** Explicit dash subpaths along a polyline (so <Ink> can DRAW the dashes on one after another). `phase` shifts the
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
      if (r <= g.l) return [lerp(g.a[0], g.b[0], r / g.l), lerp(g.a[1], g.b[1], r / g.l)];
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
    // split a dash at a corner so it bends with the path
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
