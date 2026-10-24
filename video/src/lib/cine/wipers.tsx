// cine/wipers.tsx — the cine FOREGROUND WIPERS as a LEAF module (no runtime import of Film or the rest of cine), in the
// core WiperComponent shape ({x, p, dir, color} in SCREEN px, opaque over x +- 90 for the full height, with a static
// `captionRegions`), so the core Film can register them next to its own wipers without an import cycle:
//
//   import {CINE_WIPERS} from './cine/wipers';     // Film: {...BUILTIN_WIPERS, ...CINE_WIPERS} -> 'column', 'passer'
//   <ColumnWiper x={x} p={p} dir="right" />          // a near-lens stone column (capital + base in doubled ink)
//   <PasserWiper x={x} p={p} dir="left" />           // a giant back-view passer-by right at the lens
//   wipeEdgeX(p, 'right', CINE_WIPE_HALF.passer)     // the edge x at progress p (in-out sine across the frame)
//
// The cine WipeCut / WipePass (props.tsx) draw these; captions over the element take `captionRegions` (white text on
// the dark body; same geometry as the drawing, including the walking bob).

import React from 'react';
import {palette, stroke} from '../theme';
import {ease as E} from '../time';
import {line, Pt} from '../sketch';
import {rng} from '../rng';
import {PathBuf, r1} from './util';
import type {WiperComponent, WiperProps} from '../Film';
import type {ToneRegion} from '../Captions';

/** Half-width of each cine wiper (the edge travels from -half to W + half). */
export const CINE_WIPE_HALF = {column: 230, passer: 680} as const;

/** Edge x of a foreground wipe at progress p (0..1): in-out sine from -half - 30 to W + half + 30 (crosses the centre at
 *  p = 0.5). The ONE edge curve for cine wipes (the core Film should use the same). */
export function wipeEdgeX(p: number, dir: 'left' | 'right', half: number): number {
  const x = -half - 30 + (1080 + 2 * half + 60) * E.inOutSine(Math.max(0, Math.min(1, p)));
  return dir === 'right' ? x : 1080 - x;
}

// ---------------------------------------------------------------- column

/** A near-lens stone column: shaft with fill-only flutes, capital and base mouldings in doubled ink, a lit rim on the
 *  leading side. Screen px, centred on x. */
export type ColumnWiperProps = WiperProps & {rim?: string; light?: string};

const ColumnWiperFC: React.FC<ColumnWiperProps> = ({x, dir, color = palette.tealDark, rim = palette.peach, light = palette.teal}) => {
  const w = 300;
  const L = x - w / 2;
  const lead = dir === 'right' ? 1 : -1;
  const fl = new PathBuf();
  for (const f of [0.2, 0.42, 0.64]) fl.rect(L + w * f, 210, w * 0.08, 1560);
  const capW = 400;
  const ink =
    line(L, 170, L, 1820, {seed: 'cw/l', over: [0, 0], breaks: false}) +
    line(L + w, 170, L + w, 1820, {seed: 'cw/r', over: [0, 0], breaks: false}) +
    line(x - capW / 2 - 10, 110, x + capW / 2 + 10, 110, {seed: 'cw/c1', over: [6, 12], breaks: false}) +
    line(x - capW / 2, 128, x + capW / 2, 128, {seed: 'cw/c2', over: [4, 8], breaks: false}) +
    line(x - capW / 2 + 20, 190, x + capW / 2 - 20, 190, {seed: 'cw/c3', over: [4, 8], breaks: false}) +
    line(x - capW / 2 + 20, 1830, x + capW / 2 - 20, 1830, {seed: 'cw/b1', over: [4, 8], breaks: false}) +
    line(x - capW / 2, 1852, x + capW / 2, 1852, {seed: 'cw/b2', over: [6, 12], breaks: false});
  const rx = lead > 0 ? L + w - 12 : L;
  return (
    <>
      <rect x={L} y={-60} width={w} height={2040} fill={color} />
      <path d={fl.d} fill={light} />
      <rect x={x - capW / 2} y={110} width={capW} height={80} fill={color} />
      <rect x={x - capW / 2} y={1830} width={capW} height={150} fill={color} />
      <rect x={rx} y={190} width={12} height={1640} fill={rim} />
      <rect x={lead > 0 ? x + capW / 2 - 14 : x - capW / 2} y={128} width={14} height={62} fill={rim} />
      <path d={ink} fill="none" stroke={palette.ink} strokeWidth={stroke.inkBold + 1} strokeLinecap="round" />
    </>
  );
};

export const ColumnWiper = Object.assign(ColumnWiperFC, {
  /** White captions on the shaft and the capital (tealDark; the teal flutes keep >= 4.5:1 with white). */
  captionRegions: ({x}: WiperProps): ToneRegion[] => [{tone: 'light', d: `M${r1(x - 160)} -60H${r1(x + 160)}V1980H${r1(x - 160)}ZM${r1(x - 212)} 100H${r1(x + 212)}V200H${r1(x - 212)}Z`}],
});

// ---------------------------------------------------------------- passer

const PH = {hy: 300, R: 330, neckY: 585, collarY: 650, shoulder: 660, shoulderY: 1070} as const;

/** The passer's walking bob (px, up) at progress p. */
const passerBob = (p: number) => Math.abs(Math.sin(p * Math.PI * 3)) * 10;

type PasserGeo = {outline: string; hair: string; earInk: string; clumps: string; collar: string; outlineInk: string};
const PASSER_CACHE = new Map<number, PasserGeo>();

/** Head contour radius at angle a (deg, screen: 0 = right, 90 = down): an irregular, slightly egg-shaped skull with
 *  hair bumps, and ONE ear on the right side (back view, head turned a touch). */
function headR(a: number): number {
  const t = (a * Math.PI) / 180;
  let r = PH.R * (1 + 0.035 * Math.sin(3 * t + 0.7) + 0.02 * Math.sin(7 * t + 1.9) + 0.012 * Math.sin(13 * t + 0.4));
  // taller than wide (egg), crown a little flatter on the left
  r *= 1 + 0.05 * Math.pow(Math.sin(t), 2) * (Math.sin(t) < 0 ? 1 : 0.4);
  // the ear: a rounded lobe at ~ 8 deg below the right equator
  const d = ((a - 12 + 540) % 360) - 180;
  if (Math.abs(d) < 15) r += 58 * Math.cos((d / 15) * (Math.PI / 2)) ** 1.4;
  return r;
}

function passerGeo(x: number): PasserGeo {
  const key = Math.round(x * 10);
  const hit = PASSER_CACHE.get(key);
  if (hit) return hit;
  const {hy, neckY, collarY, shoulder, shoulderY} = PH;
  const hp = (a: number): Pt => {
    const r = headR(a);
    const t = (a * Math.PI) / 180;
    return [x + Math.cos(t) * r, hy + Math.sin(t) * r];
  };
  // ONE closed outline, clockwise on screen (left shoulder up, over the head, right shoulder down): no subpath can
  // cancel another under the nonzero rule (the old head circle + neck rect had opposite windings: a hole).
  const pts: Pt[] = [];
  pts.push([x - shoulder, 1990], [x - shoulder, shoulderY]);
  // left shoulder curve to the collar (sampled quadratic)
  const q = (a: Pt, c: Pt, b: Pt, n: number) => {
    for (let i = 1; i <= n; i++) {
      const u = i / n;
      pts.push([(1 - u) * (1 - u) * a[0] + 2 * (1 - u) * u * c[0] + u * u * b[0], (1 - u) * (1 - u) * a[1] + 2 * (1 - u) * u * c[1] + u * u * b[1]]);
    }
  };
  q([x - shoulder, shoulderY], [x - shoulder + 20, collarY + 40], [x - 238, collarY], 12);
  pts.push([x - 214, neckY + 8]);
  // head from the lower left (~124 deg) over the top to the lower right (~52 deg = 412)
  for (let a = 126; a <= 412; a += 4) pts.push(hp(a));
  pts.push([x + 210, neckY + 10], [x + 240, collarY]);
  q([x + 240, collarY], [x + shoulder - 18, collarY + 46], [x + shoulder, shoulderY], 12);
  pts.push([x + shoulder, 1990]);
  const outline = pts.map(([a, b], i) => `${i ? 'L' : 'M'}${r1(a)} ${r1(b)}`).join('') + 'Z';
  // hair: the head down to a ragged nape line (the ear and the nape stay body colour)
  const hairPts: Pt[] = [];
  for (let a = 150; a <= 350; a += 4) hairPts.push(hp(a));
  // down the right side just inside the ear's root, then a ragged nape line back to the left
  hairPts.push([x + PH.R * 0.9, hy + 30], [x + PH.R * 0.74, hy + PH.R * 0.5]);
  const r = rng('passer/hair');
  const nape = hy + PH.R * 0.66;
  const ex: Pt = [x + PH.R * 0.62, nape];
  const sx = hairPts[0];
  const steps = 6;
  for (let i = 1; i < steps; i++) {
    const u = i / steps;
    hairPts.push([ex[0] + (sx[0] - ex[0]) * u, nape + (i % 2 ? 26 : -8) + r.jitter(10)]);
  }
  const hair = hairPts.map(([a, b], i) => `${i ? 'L' : 'M'}${r1(a)} ${r1(b)}`).join('') + 'Z';
  // 3 hair-clump strokes (curved, from the crown whorl outward) + the ear's inner curl
  const crown: Pt = [x + 40, hy - 150];
  const clump = (a: number, len: number, bend: number) => {
    const t = (a * Math.PI) / 180;
    const e: Pt = [crown[0] + Math.cos(t) * len, crown[1] + Math.sin(t) * len];
    const c: Pt = [(crown[0] + e[0]) / 2 - Math.sin(t) * bend, (crown[1] + e[1]) / 2 + Math.cos(t) * bend];
    return `M${r1(crown[0] + Math.cos(t) * 26)} ${r1(crown[1] + Math.sin(t) * 26)}Q${r1(c[0])} ${r1(c[1])} ${r1(e[0])} ${r1(e[1])}`;
  };
  const clumps = clump(160, 230, 40) + clump(105, 260, -36) + clump(30, 210, 30) + `M${r1(crown[0] - 14)} ${r1(crown[1] - 10)}q18 -22 34 4`;
  const ec = hp(12);
  const earInk = `M${r1(ec[0] - 30)} ${r1(ec[1] - 26)}q26 4 22 30q-4 20 -22 22`;
  // collar: a hood / jacket collar folded around the neck, its ink overshooting the shoulders' outline
  const collar =
    line(x - 300, collarY + 18, x - 40, collarY + 150, {seed: 'pw/c1', over: [10, 22], breaks: false}) +
    line(x + 40, collarY + 150, x + 310, collarY + 14, {seed: 'pw/c2', over: [22, 12], breaks: false}) +
    `M${r1(x - 210)} ${r1(neckY + 30)}Q${r1(x)} ${r1(neckY + 96)} ${r1(x + 214)} ${r1(neckY + 28)}` +
    line(x - 440, 1240, x - 420, 1990, {seed: 'pw/s1', over: [0, 0], breaks: true}) +
    line(x + 120, 860, x + 150, 1990, {seed: 'pw/s2', over: [0, 0], breaks: true});
  const g = {outline, hair, earInk, clumps, collar, outlineInk: outline};
  if (PASSER_CACHE.size > 200) PASSER_CACHE.clear();
  PASSER_CACHE.set(key, g);
  return g;
}

/** Outline of the 'passer' wiper (one closed, clockwise path: head with one ear, neck, shoulders) centred on x, screen
 *  px, before the walking bob. Export for tools / caption tone regions. */
export function passerPath(x: number): string {
  return passerGeo(x).outline;
}

/** A passer-by right in front of the lens (back view, backlit): a dark silhouette (tealDark jacket, ochre hair with
 *  three ink clump strokes, one ear), collar ink overshooting, fills misregistered 4 px from the ink, and a one-sided
 *  8 px rim sliver on the leading edge (inside the outline). */
export type PasserWiperProps = WiperProps & {rim?: string; hair?: string};

const PasserWiperFC: React.FC<PasserWiperProps> = ({x, p, dir, color = palette.tealDark, rim = palette.peach, hair = palette.brown}) => {
  const id = `pw${Math.round(x)}`;
  const g = passerGeo(x);
  const lead = dir === 'right' ? 1 : -1;
  const bob = passerBob(p);
  const W = stroke.inkBold + 1;
  return (
    <g transform={bob ? `translate(0 ${r1(-bob)})` : undefined}>
      <defs>
        <clipPath id={id} clipPathUnits="userSpaceOnUse">
          <path d={g.outline} />
        </clipPath>
      </defs>
      {/* fills misregistered (3, 4) px from the ink; inside the outline the body is shifted 8 px to the trailing side,
          so the rim colour shows as a sliver along the leading edge only */}
      <g transform="translate(-3 4)">
        <g clipPath={`url(#${id})`}>
          <path d={g.outline} fill={rim} />
          <g transform={`translate(${-lead * 8} 1)`}>
            <path d={g.outline} fill={color} />
            <path d={g.hair} fill={hair} />
          </g>
        </g>
      </g>
      <path d={g.outlineInk} fill="none" stroke={palette.ink} strokeWidth={W} strokeLinejoin="round" />
      <path d={g.clumps + g.earInk} fill="none" stroke={palette.ink} strokeWidth={W - 1} strokeLinecap="round" />
      <path d={g.collar} fill="none" stroke={palette.ink} strokeWidth={W} strokeLinecap="round" />
    </g>
  );
};

export const PasserWiper = Object.assign(PasserWiperFC, {
  /** White captions over the whole passer (tealDark body, ochre hair: both >= 4.5:1 with white), bob included. */
  captionRegions: ({x, p}: WiperProps): ToneRegion[] => [{tone: 'light', d: passerPath(x), transform: `translate(0 ${r1(-passerBob(p))})`}],
});

/** The cine wipers by kind name (register in Film: {...BUILTIN_WIPERS, ...CINE_WIPERS}). */
export const CINE_WIPERS: Record<'column' | 'passer', WiperComponent> = {column: ColumnWiper, passer: PasserWiper};

/** Caption tone regions of a wiper at (x, p), with the cine pass's parallax growth (`grow` about the element's foot). */
export function wiperRegions(W: WiperComponent, props: WiperProps, grow = 0): ToneRegion[] {
  const regs = W.captionRegions ? W.captionRegions(props) : [{tone: 'light' as const, rect: [props.x - 90, -200, props.x + 90, 2200] as [number, number, number, number]}];
  if (!grow) return regs;
  const k = 1 + grow * props.p;
  const g = `translate(${r1(props.x)} 1920) scale(${k.toFixed(4)}) translate(${r1(-props.x)} -1920)`;
  return regs.map((r) => ({...r, transform: r.transform ? `${g} ${r.transform}` : g}));
}
