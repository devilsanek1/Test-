// FigureWiper.tsx — the core 'figure' foreground wiper: a hooded passer-by right in front of the lens, seen from
// behind, drawn like the cine PasserWiper (cine/wipers.tsx) so the two read as one hand:
//   - ONE closed, clockwise outline (shoulders + an irregular, slightly peaked hood): nothing cancels under nonzero
//   - the hood's back seam, its drape on the shoulders as a U whose ink OVERSHOOTS the silhouette, creases, a yoke seam
//     and sleeve seams (broken strokes), the outline left open in two places on the trailing side
//   - fills misregistered 5 px from the ink (toward the leading side, + 5 down: a background sliver inside the trailing
//     ink, the rim poking past the leading ink)
//   - the rim: a ~8 px sliver INSIDE the leading outline (the body fill is shifted toward the trailing side inside the
//     outline's clip, so the rim follows the hood and the shoulder curve, thinning out where the outline turns)
//   - a walking bob (the same as the passer's)
// Screen px, centred on x; opaque over x +- 90 for the full frame height (Film's WiperComponent contract).
//
//   <FigureWiper x={x} p={p} dir="right" />                 // tealDark jacket + hood, sage rim
//   <FigureWiper x={x} p={p} dir="left" color={palette.teal} rim={palette.peach} />

import React from 'react';
import {getBoundingBox} from '@remotion/paths';
import {palette, stroke} from './theme';
import {rng} from './rng';
import {line, Pt} from './sketch';
import {toneOn} from './Captions';
import type {ToneRegion} from './Captions';
import type {WiperComponent, WiperProps} from './Film';

const r1 = (v: number) => Math.round(v * 10) / 10;

/** The figure's walking bob (px, up) at progress p (3 steps across the frame). */
const figureBob = (p: number) => Math.abs(Math.sin(p * Math.PI * 3)) * 10;

/** Catmull-Rom through pts (open), n samples per segment, appended to out (first point excluded). */
function catmull(pts: Pt[], n: number, out: Pt[]) {
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    for (let k = 1; k <= n; k++) {
      const u = k / n;
      const u2 = u * u;
      const u3 = u2 * u;
      const f = (a: number, b: number, c: number, d: number) => 0.5 * (2 * b + (-a + c) * u + (2 * a - 5 * b + 4 * c - d) * u2 + (-a + 3 * b - 3 * c + d) * u3);
      out.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])]);
    }
  }
}

type FigureGeo = {outline: string; outlineInk: string; detail: string; drape: string};
const CACHE = new Map<string, FigureGeo>();

function figureGeo(x: number, dir: 'left' | 'right'): FigureGeo {
  const key = `${Math.round(x * 10)}${dir}`;
  const hit = CACHE.get(key);
  if (hit) return hit;
  const r = rng('figureWiper');
  const lead = dir === 'right' ? 1 : -1;
  // hood contour, left drape -> over a slightly off-centre peak -> right drape (local x, screen y), hand-jittered
  const hood: Pt[] = [
    [-300, 752], [-318, 646], [-334, 508], [-326, 372], [-292, 252], [-228, 154], [-140, 92], [-48, 62], [14, 40],
    [66, 58], [150, 90], [236, 158], [296, 262], [330, 396], [336, 540], [322, 664], [302, 752],
  ].map(([a, b], i, all) => (i === 0 || i === all.length - 1 ? [a, b] : [a + r.jitter(5), b + r.jitter(5)])) as Pt[];
  const pts: Pt[] = [[x - 662, 1990], [x - 660, 1110]];
  const quad = (a: Pt, c: Pt, b: Pt, n: number) => {
    for (let i = 1; i <= n; i++) {
      const u = i / n;
      pts.push([(1 - u) * (1 - u) * a[0] + 2 * (1 - u) * u * c[0] + u * u * b[0], (1 - u) * (1 - u) * a[1] + 2 * (1 - u) * u * c[1] + u * u * b[1]]);
    }
  };
  // left shoulder up to the hood's drape
  quad([x - 660, 1110], [x - 646, 800], [x - 300, 752], 12);
  const hoodStart = pts.length;
  catmull(hood.map(([a, b]) => [x + a, b] as Pt), 6, pts);
  const hoodEnd = pts.length;
  quad([x + 300, 752], [x + 652, 806], [x + 660, 1110], 12);
  pts.push([x + 662, 1990]);
  const outline = pts.map(([a, b], i) => `${i ? 'L' : 'M'}${r1(a)} ${r1(b)}`).join('') + 'Z';
  // the ink leaves the outline open in two places on the TRAILING side (style bible: 20-40 % of contours open; the
  // frame-cut bottom is never inked): a gap on the trailing shoulder and one high on the trailing side of the hood
  const hoodN = hoodEnd - hoodStart;
  const gaps: [number, number][] =
    lead > 0
      ? [[5, 8], [hoodStart + Math.round(hoodN * 0.2), hoodStart + Math.round(hoodN * 0.2) + 3]]
      : [[pts.length - 8, pts.length - 5], [hoodStart + Math.round(hoodN * 0.8) - 3, hoodStart + Math.round(hoodN * 0.8)]];
  let outlineInk = '';
  let pen = false;
  for (let i = 1; i < pts.length - 1; i++) {
    if (gaps.some(([a, b]) => i > a && i <= b)) {
      pen = false;
      continue;
    }
    outlineInk += `${pen ? 'L' : 'M'}${r1(pts[i][0])} ${r1(pts[i][1])}`;
    pen = true;
  }
  // hood: the back seam from the peak down to the drape, two side creases, the drape as a U whose ink runs 18-24 px
  // PAST the silhouette on both sides, two folds where it rests on the shoulders
  const drape = `M${r1(x - 322)} ${r1(726)}Q${r1(x - 6)} ${r1(940)} ${r1(x + 324)} ${r1(722)}` + `M${r1(x - 296)} ${r1(756)}Q${r1(x - 20)} ${r1(905)} ${r1(x + 150)} ${r1(838)}`;
  const detail =
    line(x + 16, 72, x + 2, 690, {seed: 'fw/seam', over: [0, 0], breaks: true, bow: 14}) +
    `M${r1(x - 252)} ${r1(312)}Q${r1(x - 266)} ${r1(430)} ${r1(x - 244)} ${r1(548)}` +
    `M${r1(x + 266)} ${r1(340)}Q${r1(x + 276)} ${r1(440)} ${r1(x + 258)} ${r1(522)}` +
    `M${r1(x - 222)} ${r1(796)}Q${r1(x - 188)} ${r1(834)} ${r1(x - 146)} ${r1(846)}` +
    `M${r1(x + 172)} ${r1(842)}Q${r1(x + 206)} ${r1(826)} ${r1(x + 232)} ${r1(790)}` +
    // jacket: sleeve seams, shoulder folds, two tension creases under the drape
    `M${r1(x - 96)} ${r1(1010)}Q${r1(x - 40)} ${r1(1060)} ${r1(x - 52)} ${r1(1150)}` +
    `M${r1(x + 70)} ${r1(1030)}Q${r1(x + 112)} ${r1(1082)} ${r1(x + 98)} ${r1(1176)}` +
    line(x - 472, 1100, x - 452, 1990, {seed: 'fw/sl', over: [0, 0], breaks: true}) +
    line(x + 480, 1096, x + 462, 1990, {seed: 'fw/sr', over: [0, 0], breaks: true}) +
    `M${r1(x - 430)} ${r1(968)}Q${r1(x - 372)} ${r1(1004)} ${r1(x - 318)} ${r1(1072)}` +
    `M${r1(x + 436)} ${r1(972)}Q${r1(x + 380)} ${r1(1010)} ${r1(x + 330)} ${r1(1070)}`;
  const g = {outline, outlineInk, detail, drape};
  if (CACHE.size > 200) CACHE.clear();
  CACHE.set(key, g);
  return g;
}

export type FigureWiperProps = WiperProps & {/** The lit sliver inside the leading outline. Default sage. */ rim?: string};

const FigureWiperFC: React.FC<FigureWiperProps> = ({x, p, dir, color = palette.tealDark, rim = palette.sage}) => {
  const id = `fw${Math.round(x)}${dir[0]}`;
  const g = figureGeo(x, dir);
  const lead = dir === 'right' ? 1 : -1;
  const bob = figureBob(p);
  const W = stroke.inkBold + 1;
  return (
    <g transform={bob ? `translate(0 ${r1(-bob)})` : undefined}>
      <defs>
        <clipPath id={id} clipPathUnits="userSpaceOnUse">
          <path d={g.outline} />
        </clipPath>
      </defs>
      {/* fills misregistered 5 px toward the LEADING side (+5 down): the rim colour pokes ~2 px past the leading ink, a
          ~2 px sliver of background shows inside the trailing ink and under the top; inside the outline the body is
          shifted 16 px back toward the trailing side, so the rim shows as an ~8 px sliver along the leading outline */}
      <g transform={`translate(${lead * 5} 5)`}>
        <g clipPath={`url(#${id})`}>
          <path d={g.outline} fill={rim} />
          <path d={g.outline} fill={color} transform={`translate(${-lead * 16} 1)`} />
        </g>
      </g>
      <path d={g.outlineInk} fill="none" stroke={palette.ink} strokeWidth={W} strokeLinejoin="round" strokeLinecap="round" />
      <path d={g.drape} fill="none" stroke={palette.ink} strokeWidth={W} strokeLinecap="round" />
      <path d={g.detail} fill="none" stroke={palette.ink} strokeWidth={W - 1} strokeLinecap="round" />
    </g>
  );
};

/** The figure's real half-width about x (screen px): its outline, the 5 px fill misregistration and half the outline
 *  ink. Film runs the wipe edge from -half - 30 so the figure enters and leaves fully off-frame (no edge sliver). */
const FIGURE_HALF = (() => {
  const b = getBoundingBox(figureGeo(0, 'right').outline);
  return Math.ceil(Math.max(-b.x1, b.x2) + 5 + (stroke.inkBold + 1) / 2 + 1);
})();

/** Over the caption band only the hood is there (one dark field): the tone that reads on its colour (white on the
 *  default tealDark), the bob included. */
export const FigureWiper: WiperComponent = Object.assign(FigureWiperFC as React.FC<WiperProps>, {
  half: FIGURE_HALF,
  captionRegions: ({x, p, dir, color = palette.tealDark}: WiperProps): ToneRegion[] => [
    {tone: toneOn(color) === 'light' ? 'light' : 'dark', d: figureGeo(x, dir).outline, transform: `translate(0 ${r1(-figureBob(p))})`},
  ],
});
