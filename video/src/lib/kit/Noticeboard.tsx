// Noticeboard + Paper — the reference's glass-door board on legs, and pinned notices.
//
//   <Noticeboard x={160} y={380} w={420} h={300} legs={200} at={0.5}>
//     <Paper x={230} y={420} w={140} h={180} at={1.6} entry="drop" />
//   </Noticeboard>
//   <Paper x={120} y={700} w={160} h={210} rot={-8} at={3} stamp={{at: 3.8}} />
//
// Noticeboard: x,y = top-left of the frame; children render BEHIND the glass (papers), glints on top.
// Paper: x,y = top-left before rotation; rot in degrees about its centre.

import React from 'react';
import {palette, stroke} from '../theme';
import {ease as E, lerp, prog, springAt, springs, useTime} from '../time';
import {rng, Seed} from '../rng';
import {Ink} from '../Ink';
import {Fill} from '../Fill';
import {Pop} from '../motion';
import {ExitFade} from '../exit';
import {arc, blob, circle, glint, hline, line, poly, polyPath, rect, roundRect, textLines, Pt} from '../sketch';
import {At, b} from './common';
import {mat, XG} from '../xf';
import {TodAnchor} from '../tod';

// ---------------------------------------------------------------- Noticeboard

export type NoticeboardProps = {
  x: number;
  y: number;
  w?: number;
  h?: number;
  legs?: number;
  at?: At;
  seed?: Seed;
  frame?: string;
  glass?: string;
  doors?: 1 | 2;
  /** Swing the glass doors open (time). */
  openAt?: number;
  /** Glass tint over children (0 = none). Default 0.12. */
  tint?: number;
  children?: React.ReactNode;
  width?: number;
};

export const Noticeboard: React.FC<NoticeboardProps> = ({x, y, w = 420, h = 300, legs = 200, at, seed = 'board', frame = palette.teal, glass = palette.mintPale, doors = 2, openAt, tint = 0.12, children, width = stroke.ink}) => {
  const t = useTime();
  const fb = 13;
  const gap = doors === 2 ? 7 : 0;
  const gw = doors === 2 ? (w - fb * 2 - gap) / 2 : w - fb * 2;
  const gh = h - fb * 2;
  const open = openAt !== undefined ? prog(t, openAt, 0.6, E.inOutCubic) : 0;
  const lx1 = x + w * 0.1;
  const lx2 = x + w * 0.9 - 12;
  const out: React.ReactNode[] = [];
  // legs
  if (legs > 0) {
    out.push(<Fill key="legsF" d={`M${lx1} ${y + h}h12v${legs}h-12zM${lx2} ${y + h}h12v${legs}h-12z`} color={frame} at={b(at, 0.6)} mode="grow" dir="down" seed={`${seed}/lf`} />);
    out.push(
      <Ink
        key="legs"
        d={line(lx1, y + h, lx1, y + h + legs, {over: [0, 4], seed: `${seed}/l1`}) + line(lx1 + 12, y + h, lx1 + 12, y + h + legs, {over: [0, 3], seed: `${seed}/l2`}) + line(lx2, y + h, lx2, y + h + legs, {over: [0, 4], seed: `${seed}/l3`}) + line(lx2 + 12, y + h, lx2 + 12, y + h + legs, {over: [0, 3], seed: `${seed}/l4`})}
        at={b(at, 0.45)}
        dur={0.4}
        width={width}
        order="all"
      />,
    );
  }
  // frame + glass
  out.push(<Fill key="frameF" rect={[x, y, w, h]} color={frame} at={b(at, 0.18)} mode="snap" seed={`${seed}/ff`} />);
  for (let i = 0; i < doors; i++) {
    out.push(<Fill key={`g${i}`} rect={[x + fb + i * (gw + gap), y + fb, gw, gh]} color={glass} at={b(at, 0.5 + i * 0.08)} mode="wipe" dir="down" offset={false} seed={`${seed}/g${i}`} />);
  }
  out.push(<g key="content">{children}</g>);
  if (tint > 0) {
    for (let i = 0; i < doors; i++) {
      const gx = x + fb + i * (gw + gap);
      const hinge = i === 0 ? gx : gx + gw;
      const k = 1 - open * 0.85;
      out.push(
        <XG key={`tint${i}`} m={open > 0 ? mat.about(mat.scale(k, 1), hinge, 0) : mat.I}>
          <Fill rect={[gx, y + fb, gw, gh]} color={glass} opacity={tint} at={b(at, 0.8)} offset={false} seed={`${seed}/t${i}`} />
          <Ink d={rect(gx, y + fb, gw, gh, {over: 2, seed: `${seed}/gi${i}`})} at={b(at, 0.3 + i * 0.1)} dur={0.4} width={width * 0.85} />
          <Ink d={glint(gx + gw * 0.2, y + fb + gh * 0.4, gh * 0.22, {seed: `${seed}/gl${i}`})} at={b(at, 1.0 + i * 0.1)} dur={0.15} width={width * 0.7} order="all" />
          <Fill d={roundRect(i === 0 ? gx + gw - 9 : gx + 2, y + h / 2 - 22, 7, 44, 3.5)} color={palette.ink} at={b(at, 0.95)} offset={false} seed={`${seed}/hd${i}`} />
        </XG>,
      );
    }
  }
  // outer frame ink + top cap + hinges
  out.push(<Ink key="frame" d={rect(x, y, w, h, {seed: `${seed}/fr`})} at={at} dur={0.5} width={width} />);
  out.push(<Fill key="capF" rect={[x - 9, y - 9, w + 18, 10]} color={palette.tealDark} at={b(at, 0.55)} mode="wipe" dir="right" offset={false} seed={`${seed}/cf`} />);
  out.push(<Ink key="cap" d={hline(x - 12, x + w + 12, y - 9, {seed: `${seed}/cap`, over: [2, 6]})} at={b(at, 0.25)} dur={0.3} width={width} />);
  out.push(
    <Ink
      key="hinges"
      d={hline(x - 9, x + 4, y + h * 0.22, {over: 0, seed: `${seed}/h1`}) + hline(x - 9, x + 4, y + h * 0.78, {over: 0, seed: `${seed}/h2`}) + hline(x + w - 4, x + w + 9, y + h * 0.22, {over: 0, seed: `${seed}/h3`}) + hline(x + w - 4, x + w + 9, y + h * 0.78, {over: 0, seed: `${seed}/h4`})}
      at={b(at, 0.9)}
      dur={0.2}
      width={width * 1.6}
      order="all"
    />,
  );
  return <TodAnchor at={[x + w / 2, y + h / 2]}>{out}</TodAnchor>;
};

// ---------------------------------------------------------------- Paper

export type PaperProps = {
  x: number;
  y: number;
  w?: number;
  h?: number;
  rot?: number;
  at?: At;
  seed?: Seed;
  lines?: number;
  fold?: boolean;
  pin?: boolean;
  /** Orange seal stamp. true or {at, color}. */
  stamp?: boolean | {at?: number; color?: string};
  entry?: 'drop' | 'pop' | 'draw' | 'slide';
  color?: string;
  width?: number;
};

export const Paper: React.FC<PaperProps> = ({x, y, w = 150, h = 200, rot = 0, at, seed = 'paper', lines = 5, fold = true, pin = true, stamp, entry = 'draw', color = palette.card, width = stroke.ink}) => {
  const t = useTime();
  const r = rng(`paper/${seed}`);
  if (at !== undefined && t < at && entry !== 'draw') return null;
  const f = Math.min(w, h) * 0.15;
  const outline: Pt[] = fold
    ? [
        [0, 0],
        [w - f, 0],
        [w, f],
        [w, h],
        [0, h],
      ]
    : [
        [0, 0],
        [w, 0],
        [w, h],
        [0, h],
      ];
  const drawn = entry === 'draw';
  const A = drawn ? at : undefined;
  const stampO = stamp ? (stamp === true ? {} : stamp) : null;
  const inner = (
    <>
      <Fill d={polyPath(outline)} color={color} at={b(A, 0.16)} seed={`${seed}/f`} offset={[-3, 2]} />
      {fold ? <Fill d={polyPath([[w - f, 0], [w - f, f], [w, f]])} color={palette.tan} at={b(A, 0.5)} offset={false} seed={`${seed}/fold`} /> : null}
      <Ink d={poly(outline, {closed: true, seed: `${seed}/o`, over: 2.5})} at={A} dur={0.5} width={width} />
      {fold ? <Ink d={`M${w - f} 0L${w - f + 1} ${f}L${w} ${f}`} at={b(A, 0.45)} dur={0.15} width={width * 0.8} /> : null}
      <Ink d={hline(w * 0.18, w * 0.18 + w * r.range(0.25, 0.4), h * 0.2, {over: 0, seed: `${seed}/hd`})} at={b(A, 0.55)} dur={0.15} width={width * 1.7} />
      <Ink d={textLines(w * 0.14, h * 0.34, w * 0.7, {n: lines, gap: (h * 0.5) / Math.max(1, lines), heading: false, seed: `${seed}/tl`})} at={b(A, 0.6)} dur={0.45} width={width * 0.8} />
      {pin ? <Fill d={blob(w / 2, h * 0.07, Math.max(3, w * 0.035), Math.max(3, w * 0.035), {seed: `${seed}/pin`})} color={palette.ink} at={b(A, 0.4)} mode="snap" offset={false} seed={`${seed}/pin`} /> : null}
      {stampO ? <Stamp x={w * 0.66} y={h * 0.64} r={w * 0.22} at={stampO.at ?? b(at, 0.9)} color={stampO.color} seed={`${seed}/st`} /> : null}
    </>
  );
  // entrance transforms
  let dx = 0;
  let dy = 0;
  let dr = 0;
  if (at !== undefined && entry === 'drop') {
    const s1 = springAt(t, at, {stiffness: 140, damping: 12});
    dy = lerp(-260, 0, s1);
    dr = lerp(r.sign() * 14, 0, springAt(t, at + 0.05, springs.wobbly));
  }
  if (at !== undefined && entry === 'slide') {
    dx = lerp(-180, 0, prog(t, at, 0.5, E.outCubic));
  }
  const body = (
    <XG m={mat.compose(mat.translate(x + dx, y + dy), mat.about(mat.rotate(rot + dr), w / 2, h / 2))}>
      {inner}
    </XG>
  );
  if (at !== undefined && entry === 'pop') {
    return (
      <Pop at={at} x={x + w / 2} y={y + h / 2}>
        {body}
      </Pop>
    );
  }
  return body;
};

/** Orange seal: disc (misregistered) + ink arc, pops in. Usable on its own. */
export const Stamp: React.FC<{x: number; y: number; r?: number; at?: At; color?: string; seed?: Seed}> = ({x, y, r = 34, at, color = palette.sun, seed = 'stamp'}) => (
  <Pop at={at ?? -10} x={x} y={y} spring={springs.wobbly}>
    <Fill d={blob(x, y, r, r, {seed: `${seed}/b`})} color={color} seed={`${seed}/f`} offset={[-3, 3]} />
    <Ink d={circle(x, y, r, {seed: `${seed}/o`, overlap: -40})} width={stroke.inkThin} />
    <Ink d={arc(x, y, r * 0.55, r * 0.55, 190, 290, {seed: `${seed}/a`})} width={stroke.inkThin} />
  </Pop>
);
