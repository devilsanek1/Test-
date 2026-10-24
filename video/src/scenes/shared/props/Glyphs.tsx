// props/Glyphs.tsx — small marks shared across scenes so they are the SAME design everywhere (P15):
//   <CheckMark x y size at />            the one check stroke (S06, S09, S10): 0.17 s, lands on its word
//   <MarkRing x y r at width? pingAt? /> stroke-on ink ring (S02, S05 r55 @4.8, S07, S10 ping)
//   <Cobweb x y r corner at />            inkHair web in a corner, draws on over 0.3 s (S04 lock, S12 plaque)
//   <Magnifier x y r at /> <WrenchGlyph x y w at />   riser glyphs (S03, S04 at 90 px), ink only
//   <WrenchTag x y size at />             sage tag with a cream wrench (S03 "everywhere" ripple)
//   <CheckFlag x y size at raiseAt />     60 px cream flag with an ink check on a pole (S10)
//   <QuestionMark x y size at /> <AlertMark x y size at />   "?" cream + ink outline (S09), "!" solid ink (Bit caught)
// All glyphs: x, y = centre (flag / tag: see each), sizes in world px, `width` = world ink px (default by depth).

import React from 'react';
import {palette} from '../../../lib/theme';
import {ease as E, lerp, osc, prog, springAt, springs, useTime} from '../../../lib/time';
import {Seed} from '../../../lib/rng';
import {Ink} from '../../../lib/Ink';
import {Fill} from '../../../lib/Fill';
import {ExitFade} from '../../../lib/exit';
import {arc, blob, check, circle, line, rectPath, roundRect, smooth, Pt} from '../../../lib/sketch';
import {mat, XG} from '../../../lib/xf';
import {bt, Depth, DEPTH_INK, misregScreen, pendulum, withOut} from './common';

type G = {x: number; y: number; at?: number; seed?: Seed; width?: number; depth?: Depth; color?: string};
const wOf = (o: {width?: number; depth?: Depth}, def: Depth) => o.width ?? DEPTH_INK[o.depth ?? def];

/** Pop (spring) about (x, y); hidden before at. */
const PopAt: React.FC<{at?: number; x: number; y: number; children?: React.ReactNode; from?: number}> = ({at, x, y, children, from = 0}) => {
  const t = useTime();
  if (at === undefined) return <>{children}</>;
  if (t < at) return null;
  const s = from + (1 - from) * springAt(t, at, springs.pop);
  if (s <= 0.001) return null;
  return <XG m={mat.about(mat.scale(s), x, y)}>{children}</XG>;
};

// ---------------------------------------------------------------- CheckMark

const CheckMarkBase: React.FC<G & {size?: number; dur?: number}> = ({x, y, size = 60, at, dur = 0.17, seed = 'chk', width, depth, color = palette.ink}) => (
  <Ink d={check(x, y, size, {seed})} at={at} dur={dur} width={wOf({width, depth}, 'front')} color={color} taper={false} seed={seed} />
);

// ---------------------------------------------------------------- MarkRing

/** Ink ring that strokes on in ~0.17 s; `pingAt` sends out an expanding ring (r -> 1.7 r, 0.3 s) that thins to nothing. */
const MarkRingBase: React.FC<G & {r?: number; dur?: number; pingAt?: number}> = ({x, y, r = 55, at, dur = 0.17, seed = 'ring', width, depth, color = palette.ink, pingAt}) => {
  const t = useTime();
  const w = wOf({width, depth}, 'front');
  const ping = pingAt !== undefined ? prog(t, pingAt, 0.3, E.outCubic) : 0;
  return (
    <>
      <Ink d={circle(x, y, r, {seed, overlap: 22})} at={at} dur={dur} width={w} color={color} taper={false} seed={seed} />
      {ping > 0 && ping < 1 ? <circle cx={x} cy={y} r={r * (1 + 0.7 * ping)} fill="none" stroke={color} strokeWidth={w * (1 - ping)} /> : null}
    </>
  );
};

// ---------------------------------------------------------------- Cobweb

export type Corner = 'tl' | 'tr' | 'bl' | 'br';

/** Cobweb spanning a corner at (x, y) (the corner point), radius r, inkHair, draws on over `dur`. */
const CobwebBase: React.FC<G & {r?: number; corner?: Corner; dur?: number}> = ({x, y, r = 40, corner = 'tl', at, dur = 0.3, seed = 'web', width, color = palette.ink}) => {
  const sx = corner === 'tl' || corner === 'bl' ? 1 : -1;
  const sy = corner === 'tl' || corner === 'tr' ? 1 : -1;
  const spokes = [0, 30, 60, 90];
  const P = (a: number, rr: number): Pt => [x + sx * Math.cos((a * Math.PI) / 180) * rr, y + sy * Math.sin((a * Math.PI) / 180) * rr];
  let d = '';
  for (const a of spokes) d += line(x, y, ...P(a, r * (a % 60 === 0 ? 1 : 0.92)), {over: [0, 2], seed: `${seed}/s${a}`});
  for (const k of [0.38, 0.66, 0.92]) {
    const pts: Pt[] = [];
    for (let i = 0; i < spokes.length; i++) {
      const a = spokes[i];
      pts.push(P(a, r * k));
      if (i < spokes.length - 1) pts.push(P((a + spokes[i + 1]) / 2, r * k * 0.82)); // sag toward the corner
    }
    d += smooth(pts);
  }
  return <Ink d={d} at={at} dur={dur} width={width ?? DEPTH_INK.hair} color={color} taper={false} seed={seed} />;
};

// ---------------------------------------------------------------- Magnifier / Wrench

/** Magnifier: ring radius r centred at (x, y), handle down-right. Ink only. */
const MagnifierBase: React.FC<G & {r?: number; dur?: number}> = ({x, y, r = 28, at, dur = 0.25, seed = 'mag', width, depth, color = palette.ink}) => {
  const a = Math.PI / 4;
  const h0: Pt = [x + Math.cos(a) * r * 1.05, y + Math.sin(a) * r * 1.05];
  const h1: Pt = [x + Math.cos(a) * r * 2.05, y + Math.sin(a) * r * 2.05];
  const w = wOf({width, depth}, 'front');
  return (
    <>
      <Ink d={circle(x, y, r, {seed, overlap: 16})} at={at} dur={dur} width={w} color={color} seed={seed} />
      <Ink d={line(h0[0], h0[1], h1[0], h1[1], {over: [0, 2], seed: `${seed}/h`})} at={bt(at, 0.08)} width={w * 1.9} color={color} taper={false} seed={`${seed}/h`} />
      <Ink d={arc(x, y, r * 0.62, r * 0.62, 200, 250, {seed: `${seed}/g`})} at={bt(at, 0.14)} width={w * 0.55} color={color} seed={`${seed}/g`} />
    </>
  );
};

/** Wrench outline path (centre (x, y), length w, head height h): ring tail on the left, open jaw on the right. */
export function wrenchPaths(x: number, y: number, w: number, h: number): {ink: string; fill: string} {
  const sh = h * 0.36; // shaft half height
  const hr = h * 0.5; // head radius
  const hx = x + w / 2 - hr;
  const tx = x - w / 2 + h * 0.32;
  const jaw = h * 0.2;
  const ink =
    `M${tx} ${y - sh}L${hx - hr * 0.62} ${y - sh}` +
    `M${tx} ${y + sh}L${hx - hr * 0.62} ${y + sh}` +
    `M${hx - hr * 0.62} ${y - sh}A${hr} ${hr} 0 0 1 ${hx + hr * 0.92} ${y - jaw}L${hx + hr * 0.2} ${y - jaw}L${hx + hr * 0.2} ${y + jaw}L${hx + hr * 0.92} ${y + jaw}A${hr} ${hr} 0 0 1 ${hx - hr * 0.62} ${y + sh}` +
    `M${tx} ${y - sh}A${sh} ${sh} 0 0 0 ${tx} ${y + sh}`;
  const fill =
    `M${tx} ${y - sh}L${hx - hr * 0.62} ${y - sh}A${hr} ${hr} 0 0 1 ${hx + hr * 0.92} ${y - jaw}L${hx + hr * 0.2} ${y - jaw}L${hx + hr * 0.2} ${y + jaw}L${hx + hr * 0.92} ${y + jaw}A${hr} ${hr} 0 0 1 ${hx - hr * 0.62} ${y + sh}L${tx} ${y + sh}A${sh} ${sh} 0 0 1 ${tx} ${y - sh}Z`;
  return {ink, fill};
}

/** Wrench glyph (ink only, or with a fill colour). (x, y) = centre, w = length (height = 0.43 w). */
const WrenchGlyphBase: React.FC<G & {w?: number; fill?: string; dur?: number; tilt?: number}> = ({x, y, w = 56, at, dur = 0.25, seed = 'wr', width, depth, color = palette.ink, fill, tilt = 0}) => {
  const h = w * 0.43;
  const p = wrenchPaths(x, y, w, h);
  return (
    <XG m={tilt ? mat.about(mat.rotate(tilt), x, y) : mat.I}>
      {fill ? <Fill d={p.fill} color={fill} at={bt(at, 0.1)} offset={false} seed={`${seed}/f`} /> : null}
      <Ink d={p.ink} at={at} dur={dur} width={wOf({width, depth}, 'front')} color={color} seed={seed} />
    </XG>
  );
};

// ---------------------------------------------------------------- WrenchTag

/** Sage tag with a cream wrench glyph ("the fix has to go here"). (x, y) = tag centre; size = tag width (40-60 near). */
const WrenchTagBase: React.FC<G & {size?: number}> = ({x, y, size = 60, at, seed = 'wtag', width, depth}) => {
  const w = size;
  const h = size * 0.72;
  const iw = width ?? DEPTH_INK[depth ?? 'far'];
  const off = misregScreen(seed);
  const small = size < 18;
  return (
    <PopAt at={at} x={x} y={y + h / 2}>
      <Fill d={roundRect(x - w / 2, y - h / 2, w, h, h * 0.22)} color={palette.sage} offset={small ? false : [off[0] * 0.7, off[1] * 0.7]} seed={`${seed}/f`} />
      {small ? null : (
        <>
          <WrenchGlyph x={x} y={y} w={w * 0.66} fill={palette.cream} width={iw * 0.8} tilt={-18} seed={`${seed}/w`} />
          <Ink d={roundRect(x - w / 2, y - h / 2, w, h, h * 0.22, {closed: false, seed: `${seed}/o`})} width={iw} seed={`${seed}/o`} />
        </>
      )}
    </PopAt>
  );
};

// ---------------------------------------------------------------- CheckFlag

/** Cream check flag on an ink pole. (x, y) = pole foot; size = flag width (60). raiseAt: the flag runs up the pole. */
const CheckFlagBase: React.FC<G & {size?: number; pole?: number; raiseAt?: number}> = ({x, y, size = 60, pole, at, raiseAt, seed = 'flag', width, depth}) => {
  const t = useTime();
  const H = pole ?? size * 1.7;
  const fw = size;
  const fh = size * 0.68;
  const w = wOf({width, depth}, 'mid');
  const up = raiseAt !== undefined ? prog(t, raiseAt, 0.3, E.outBack(1.4)) : 1;
  const top = y - H;
  const fy = lerp(y - fh - 4, top, up);
  const flutter = osc(t, 1.4, 0.7) * 0.04;
  const pts: Pt[] = [
    [x, fy],
    [x + fw, fy + fh * flutter],
    [x + fw * 0.94, fy + fh * (1 + flutter)],
    [x, fy + fh],
  ];
  const off = misregScreen(seed);
  return (
    <>
      <Ink d={line(x, y, x, top - 4, {over: [0, 0], seed: `${seed}/p`})} at={at} width={w} seed={`${seed}/p`} />
      {raiseAt === undefined || t >= raiseAt ? (
        <>
          <Fill d={`M${pts.map((p) => p.join(' ')).join('L')}Z`} color={palette.cream} at={bt(at, 0.12)} offset={off} seed={`${seed}/f`} />
          <Ink d={`M${pts[0].join(' ')}L${pts[1].join(' ')}L${pts[2].join(' ')}L${pts[3].join(' ')}`} at={bt(at, 0.06)} width={w * 0.85} seed={`${seed}/fo`} />
          <Ink d={check(x + fw * 0.48, fy + fh * 0.5, fh * 0.62, {seed: `${seed}/c`})} at={bt(raiseAt ?? at, 0.18)} dur={0.17} width={w} taper={false} seed={`${seed}/c`} />
        </>
      ) : null}
    </>
  );
};

// ---------------------------------------------------------------- ? and !

const qPath = (x: number, y: number, s: number) =>
  `M${x - s * 0.24} ${y - s * 0.22}C${x - s * 0.24} ${y - s * 0.5} ${x + s * 0.26} ${y - s * 0.52} ${x + s * 0.26} ${y - s * 0.24}C${x + s * 0.26} ${y - s * 0.04} ${x} ${y - s * 0.02} ${x} ${y + s * 0.16}`;

/** "?" with a cream body and an ink outline (pops). (x, y) = centre, size = height. */
const QuestionMarkBase: React.FC<G & {size?: number}> = ({x, y, size = 70, at, seed = 'q', width, depth}) => {
  const w = wOf({width, depth}, 'mid');
  const body = size * 0.16;
  const d = qPath(x, y, size);
  const dy = y + size * 0.38;
  return (
    <PopAt at={at} x={x} y={y + size * 0.4}>
      <ExitFade x={x} y={y}>
      <path d={d} fill="none" stroke={palette.ink} strokeWidth={body + w * 2} strokeLinecap="round" />
      <path d={d} fill="none" stroke={palette.cream} strokeWidth={body} strokeLinecap="round" />
      <circle cx={x} cy={dy} r={body * 0.62 + w} fill={palette.ink} />
      <circle cx={x} cy={dy} r={body * 0.62} fill={palette.cream} />
      </ExitFade>
    </PopAt>
  );
};

/** "!" in solid ink (pops). (x, y) = centre, size = height. */
const AlertMarkBase: React.FC<G & {size?: number}> = ({x, y, size = 24, at, seed = 'alert', color = palette.ink}) => (
  <PopAt at={at} x={x} y={y + size / 2}>
    <Fill d={`M${x - size * 0.11} ${y - size / 2}L${x + size * 0.11} ${y - size / 2}L${x + size * 0.06} ${y + size * 0.18}L${x - size * 0.06} ${y + size * 0.18}Z`} color={color} offset={false} seed={`${seed}/b`} />
    <Fill d={blob(x, y + size * 0.4, size * 0.1, size * 0.1, {seed: `${seed}/d`})} color={color} offset={false} seed={`${seed}/d`} />
  </PopAt>
);

/** A swinging hang (pendulum about (px, py)): for tags and signs. */
export const Swing: React.FC<{px: number; py: number; at?: number; amp?: number; period?: number; extra?: number; children?: React.ReactNode}> = ({px, py, at, amp = -16, period = 0.5, extra = 0, children}) => {
  const t = useTime();
  const a = pendulum(t, at, amp, period) + extra;
  if (!a) return <>{children}</>;
  return <XG m={mat.about(mat.rotate(a), px, py)}>{children}</XG>;
};

export {PopAt};

// build-out (outAt / outDur) for props that have no own exit
export const CheckMark = withOut(CheckMarkBase, 'CheckMark');
export const MarkRing = withOut(MarkRingBase, 'MarkRing');
export const Cobweb = withOut(CobwebBase, 'Cobweb');
export const Magnifier = withOut(MagnifierBase, 'Magnifier');
export const WrenchGlyph = withOut(WrenchGlyphBase, 'WrenchGlyph');
export const WrenchTag = withOut(WrenchTagBase, 'WrenchTag');
export const CheckFlag = withOut(CheckFlagBase, 'CheckFlag');
export const QuestionMark = withOut(QuestionMarkBase, 'QuestionMark');
export const AlertMark = withOut(AlertMarkBase, 'AlertMark');
