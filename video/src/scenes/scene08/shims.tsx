// S08 local stand-ins for shared-kit features requested from the props lane (fix round 1). Same names / props as the
// shared pieces plus the requested extras, so a later round swaps them for the shared ones:
//   - MinuteWedge + `ease` (the shared one sweeps outCubic, which reads frozen through 'forty-five') + `face` (an ink
//     face ring, so an inset clock reads as a whole clock face on the big sun).
//   - InkStamp: the requested CounterBoard `stampPaper`: a PEACH print with a rough edge and an orange double border,
//     rotated -4 deg, slamming from a clamped start scale (the print stays inside the frame) and LANDING at `land`.
import React from 'react';
import {palette} from '../../lib/theme';
import {ease as E, lerp, prog, springAt, springs, useTime} from '../../lib/time';
import type {Ease} from '../../lib/time';
import {rand} from '../../lib/rng';
import {ExitFade, useLook} from '../../lib/exit';
import {Ink} from '../../lib/Ink';
import {useCaptionFont} from '../../lib/font';
import {rect} from '../../lib/sketch';
import type {Pt} from '../../lib/sketch';
import {mat, XG} from '../../lib/xf';
import {InkTextBlock, labelLines, layoutText} from '../shared/props';
import type {LabelText} from '../shared/props';

const D2R = Math.PI / 180;
const polar = (a: number, rr: number): Pt => [Math.cos(a * D2R) * rr, Math.sin(a * D2R) * rr];
const rimArc = (a0: number, a1: number, rr: number) => {
  const [x0, y0] = polar(a0, rr);
  const [x1, y1] = polar(a1, rr);
  return `M${x0.toFixed(2)} ${y0.toFixed(2)}A${rr} ${rr} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${x1.toFixed(2)} ${y1.toFixed(2)}`;
};
const sector = (a0: number, a1: number, rr: number) => {
  const [x0, y0] = polar(a0, rr);
  const [x1, y1] = polar(a1, rr);
  return `M0 0L${x0.toFixed(2)} ${y0.toFixed(2)}A${rr} ${rr} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${x1.toFixed(2)} ${y1.toFixed(2)}Z`;
};

/** shared MinuteWedge (props/SunMorphs.tsx) + `ease` (default the shared outCubic) + `face` ring. */
export const MinuteWedge: React.FC<{r: number; at?: number; dur?: number; fraction?: number; outAt?: number; width?: number; sweepColor?: string; ease?: Ease; face?: boolean; cx?: number; cy?: number; seed?: string}> = ({
  r,
  at,
  dur = 0.61,
  fraction = 0.75,
  outAt,
  width,
  sweepColor = palette.peach,
  ease = E.outCubic,
  face,
  cx = 0,
  cy = 0,
}) => {
  const t = useTime();
  if (at !== undefined && t < at) return null;
  const q = at !== undefined ? prog(t, at, dur, ease) : 1;
  const done = at === undefined || t >= at + dur;
  const tick = done && at !== undefined ? 3 * Math.sin(Math.min(1, (t - at - dur) / 0.12) * Math.PI) : 0;
  const outK = outAt !== undefined ? 1 - E.inCubic(prog(t, outAt, 0.14)) : 1;
  if (outK <= 0.002) return null;
  const end = -90 + 360 * fraction * q;
  const R = r * 0.9;
  const w = width ?? Math.max(4.8, r * 0.035);
  const [hx, hy] = polar(end + tick, R * 0.92);
  let ticks = '';
  [-90, 0, 90, 180].forEach((a, i) => {
    const k = at === undefined ? 1 : springAt(t, at + i * 0.04, springs.pop);
    if (k <= 0.01) return;
    const [x0, y0] = polar(a, R * (1 - 0.2 * k));
    const [x1, y1] = polar(a, R * 0.97);
    ticks += `M${x0.toFixed(1)} ${y0.toFixed(1)}L${x1.toFixed(1)} ${y1.toFixed(1)}`;
  });
  const [sx, sy] = polar(-90, R);
  const fk = at === undefined ? 1 : springAt(t, at, springs.pop);
  return (
    <ExitFade x={cx} y={cy}>
      <g transform={`translate(${cx} ${cy}) scale(${outK.toFixed(4)})`}>
        {face && fk > 0.01 ? <circle r={R * fk} fill="none" stroke={palette.ink} strokeWidth={w * 0.55} /> : null}
        {q > 0.003 && fk > 0.01 ? (
          <g transform={fk < 0.999 ? `scale(${fk.toFixed(4)})` : undefined}>
            <path d={sector(-90, Math.max(-89.9, end), R)} fill={sweepColor} />
            <path d={`M0 0L${sx.toFixed(2)} ${sy.toFixed(2)}` + rimArc(-90, Math.max(-89.9, end), R)} fill="none" stroke={palette.ink} strokeWidth={(w * 0.7) / Math.max(0.3, fk)} strokeLinecap="round" strokeLinejoin="round" />
          </g>
        ) : null}
        {ticks ? <path d={ticks} stroke={palette.ink} strokeWidth={w * 0.8} strokeLinecap="round" fill="none" /> : null}
        {/* fix round 2: the hand and hub pop WITH the face ring (fk): no lone hand on the bare sun for 2 frames */}
        {fk > 0.01 ? (
          <>
            <path d={`M0 0L${(hx * fk).toFixed(2)} ${(hy * fk).toFixed(2)}`} stroke={palette.ink} strokeWidth={w} strokeLinecap="round" />
            <circle r={w * 1.3 * Math.min(1, fk)} fill={palette.ink} />
          </>
        ) : null}
      </g>
    </ExitFade>
  );
};

/** A rough-edged rect (local 0..w x 0..h): seeded nicks along every edge (an inked rubber-stamp print). */
function roughRect(w: number, h: number, seed: string): string {
  const pts: Pt[] = [];
  const edge = (x0: number, y0: number, x1: number, y1: number, nx: number, ny: number, key: string) => {
    const L = Math.hypot(x1 - x0, y1 - y0);
    const n = Math.max(3, Math.round(L / 12));
    for (let i = 0; i < n; i++) {
      const u = i / n;
      const j = (rand(seed, `${key}${i}`) - 0.5) * 2.6 + (rand(seed, `b${key}${i}`) < 0.12 ? -3 : 0);
      pts.push([x0 + (x1 - x0) * u + nx * j, y0 + (y1 - y0) * u + ny * j]);
    }
  };
  edge(0, 0, w, 0, 0, -1, 't');
  edge(w, 0, w, h, 1, 0, 'r');
  edge(w, h, 0, h, 0, 1, 'b');
  edge(0, h, 0, 0, -1, 0, 'l');
  return pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join('') + 'Z';
}

/** An ink stamp print in a slot `box` (world rect): hidden before `at`, then the print slams from s0 x to 1 x
 *  (inCubic: it accelerates into the board) and LANDS at `land`; 2 frames of squash on the landing. */
export const InkStamp: React.FC<{box: [number, number, number, number]; text: LabelText; fontSize: number; at: number; land: number; s0: number; rot?: number; paper?: string; border?: string; seed: string}> = ({
  box,
  text,
  fontSize,
  at,
  land,
  s0,
  rot = -4,
  paper = palette.peach,
  border = palette.sun,
  seed,
}) => {
  useCaptionFont();
  const t = useTime();
  const look = useLook();
  if (t < at) return null;
  const L = layoutText(labelLines(text), fontSize, {x: 0.3, top: 0.2, bot: 0.14});
  const {w, h} = L;
  const cx = (box[0] + box[2]) / 2;
  const cy = (box[1] + box[3]) / 2;
  let k = t < land ? lerp(s0, 1, E.inCubic(prog(t, at, land - at))) : 1;
  let sq = 1;
  if (t >= land && t < land + 0.067) sq = 0.94;
  if (t < land) k = Math.max(1, k);
  const m = mat.compose(mat.translate(cx, cy), mat.rotate(rot), mat.scale(k * (2 - sq), k * sq), mat.translate(-w / 2, -h / 2));
  const fill = roughRect(w, h, seed);
  const b1 = rect(5, 5, w - 10, h - 10, {seed: `${seed}/b1`, over: 2});
  const b2 = rect(9.5, 9.5, w - 19, h - 19, {seed: `${seed}/b2`, over: 1});
  let specks = '';
  for (let i = 0; i < 7; i++) {
    const sx = rand(seed, `sx${i}`) * w;
    const sy = rand(seed, `sy${i}`) < 0.5 ? 2 + rand(seed, `sz${i}`) * 3 : h - 2 - rand(seed, `sz${i}`) * 3;
    specks += `M${sx.toFixed(1)} ${sy.toFixed(1)}h${(2 + rand(seed, `sw${i}`) * 3).toFixed(1)}v1.6h${-(2 + rand(seed, `sw${i}`) * 3).toFixed(1)}Z`;
  }
  return (
    <XG m={m}>
      {look.fills === 'color' ? <path d={fill} fill={paper} /> : null}
      {look.fills === 'color' ? <path d={specks} fill={palette.cream} /> : null}
      <Ink d={b1} width={2.8} color={border} taper={false} seed={`${seed}/b1`} />
      <Ink d={b2} width={1.4} color={border} taper={false} seed={`${seed}/b2`} />
      <InkTextBlock L={L} align="center" color={palette.ink} k={k} seed={seed} />
    </XG>
  );
};

/** The print's size (world px, before rotation) for a stamp text at a font size (InkStamp's own layout). */
export const stampPrintSize = (text: LabelText, fontSize: number) => {
  const L = layoutText(labelLines(text), fontSize, {x: 0.3, top: 0.2, bot: 0.14});
  return {w: L.w, h: L.h};
};

/** A painted note block in a zone (world rect), popping (7 % spring) about its left middle at `at`. Used for L9a so it
 *  can hold 28 px across the note + gutter (the shared CounterBoard's note zone holds ~26 px at this board width). */
export const BoardNote: React.FC<{zone: [number, number, number, number]; text: LabelText; fontSize: number; at: number; seed: string; underline?: {line: number; at: number}}> = ({zone, text, fontSize, at, seed, underline}) => {
  useCaptionFont();
  const t = useTime();
  if (t < at) return null;
  const k = springAt(t, at, springs.pop);
  if (k <= 0.001) return null;
  const L = layoutText(labelLines(text), fontSize, {x: 0.02, top: 0.05, bot: 0.05, pitch: 1.05}, [zone[2] - zone[0], zone[3] - zone[1]]);
  const cy = (zone[3] - zone[1]) / 2;
  // fix round 3: one hand-drawn ink stroke under the qualifier line ('attempts, not break-ins': the line that keeps the
  // claim true), drawing on left to right after the note pops
  let ul: React.ReactNode = null;
  if (underline && t >= underline.at) {
    const i = underline.line;
    const yb = L.base0 + i * (L.pitch ?? 1.05) * L.fs + L.fs * 0.17;
    const x0 = L.padX - 2;
    const x1 = L.padX + L.widths[i] + 3;
    const d = `M${x0.toFixed(1)} ${(yb + 1.2).toFixed(1)}Q${((x0 + x1) / 2).toFixed(1)} ${(yb - 1.6).toFixed(1)} ${x1.toFixed(1)} ${(yb + 0.6).toFixed(1)}`;
    ul = <Ink d={d} width={2.6} at={underline.at} dur={0.14} seed={`${seed}/ul`} />;
  }
  return (
    <XG m={mat.compose(mat.translate(zone[0], zone[1]), mat.about(mat.scale(k), 0, cy))}>
      <InkTextBlock L={L} align="left" color={palette.ink} k={k} seed={seed} />
      {ul}
    </XG>
  );
};
