// Door — like the reference's teal double door: outer frame band, glass upper panels with glints,
// darker lower panels, long bar handles.
//   <Door x={620} y={420} w={200} h={400} at={2} double />
// x,y = top-left of the door leaf area (excluding the frame band). Optional `openAt` swings the leaves open.

import React from 'react';
import {palette, stroke} from '../theme';
import {ease as E, prog, useTime} from '../time';
import {Seed} from '../rng';
import {Ink} from '../Ink';
import {Fill} from '../Fill';
import {glint, hline, line, rect, roundRect} from '../sketch';
import {At, b} from './common';
import {mat, XG} from '../xf';
import {TodAnchor} from '../tod';

export type DoorProps = {
  x: number;
  y: number;
  w: number;
  h: number;
  at?: At;
  seed?: Seed;
  double?: boolean;
  color?: string;
  glassColor?: string;
  panelColor?: string;
  /** Frame band colour (e.g. palette.tan) and width. Default tan, 16. 0 = none. */
  frame?: string;
  frameW?: number;
  /** Glass upper panels. Default true. */
  glass?: boolean;
  /** Swing the leaves open (time). */
  openAt?: number;
  /** What shows inside when open. */
  inside?: string;
  width?: number;
};

export const Door: React.FC<DoorProps> = ({
  x,
  y,
  w,
  h,
  at,
  seed = 'door',
  double = true,
  color = palette.teal,
  glassColor = palette.sage,
  panelColor = palette.tealDark,
  frame = palette.tan,
  frameW = 16,
  glass = true,
  openAt,
  inside = palette.tealDark,
  width = stroke.ink,
}) => {
  const t = useTime();
  const leaves = double ? 2 : 1;
  const lw = w / leaves;
  const open = openAt !== undefined ? prog(t, openAt, 0.7, E.inOutCubic) : 0;
  const out: React.ReactNode[] = [];
  if (frameW > 0) {
    out.push(<Fill key="frame" rect={[x - frameW, y - frameW, w + frameW * 2, h + frameW]} color={frame} at={b(at, 0.25)} mode="grow" seed={`${seed}/fr`} />);
    out.push(<Ink key="frameI" d={rect(x - frameW, y - frameW, w + frameW * 2, h + frameW, {edges: 'tlr', seed: `${seed}/fri`})} at={at} dur={0.35} width={width} />);
  }
  if (open > 0) out.push(<Fill key="inside" rect={[x, y, w, h]} color={inside} offset={false} seed={`${seed}/in`} />);
  for (let i = 0; i < leaves; i++) {
    const lx = x + i * lw;
    const k = i === 0 ? 1 - open * 0.82 : 1 - open * 0.82; // leaf width while swinging (fake 3D)
    const ox = i === 0 ? lx : lx + lw; // hinge side
    const tr = open > 0 ? mat.about(mat.scale(k, 1), ox, 0) : mat.I;
    const px = lw * 0.14;
    const gy = y + h * 0.08;
    const gh = h * 0.5;
    const py = y + h * 0.66;
    const ph = h * 0.26;
    out.push(
      <XG key={`leaf${i}`} m={tr}>
        <Fill rect={[lx, y, lw, h]} color={color} at={b(at, 0.35 + i * 0.05)} mode="grow" seed={`${seed}/l${i}`} />
        {glass ? <Fill rect={[lx + px, gy, lw - px * 2, gh]} color={glassColor} at={b(at, 0.55)} mode="snap" offset={false} seed={`${seed}/g${i}`} /> : null}
        <Fill rect={[lx + px, py, lw - px * 2, ph]} color={panelColor} at={b(at, 0.6)} mode="snap" offset={false} seed={`${seed}/p${i}`} />
        {glass ? <Ink d={rect(lx + px, gy, lw - px * 2, gh, {over: 2, seed: `${seed}/gi${i}`})} at={b(at, 0.45)} dur={0.25} width={width * 0.8} /> : null}
        {glass ? <Ink d={glint(lx + px + (lw - px * 2) * 0.25, gy + gh * 0.3, gh * 0.22, {seed: `${seed}/gl${i}`})} at={b(at, 0.75)} dur={0.12} width={width * 0.7} order="all" /> : null}
        <Ink d={roundRect(i === 0 ? lx + lw - lw * 0.1 - 6 : lx + lw * 0.1, y + h * 0.4, 7, h * 0.2, 3.5, {closed: false})} at={b(at, 0.7)} dur={0.2} width={width * 0.75} />
        <Fill d={roundRect(i === 0 ? lx + lw - lw * 0.1 - 6 : lx + lw * 0.1, y + h * 0.4, 7, h * 0.2, 3.5)} color={palette.mintPale} at={b(at, 0.8)} offset={false} seed={`${seed}/h${i}`} />
      </XG>,
    );
  }
  out.push(<Ink key="edges" d={line(x, y, x, y + h, {seed: `${seed}/e1`}) + line(x + w, y, x + w, y + h, {seed: `${seed}/e2`}) + hline(x, x + w, y, {seed: `${seed}/e3`})} at={b(at, 0.15)} dur={0.35} width={width} />);
  if (double && open <= 0) out.push(<Ink key="mid" d={line(x + lw, y, x + lw, y + h, {over: [0, 2], seed: `${seed}/mid`})} at={b(at, 0.3)} dur={0.2} width={width * 0.9} />);
  return <TodAnchor at={[x + w / 2, y + h / 2]}>{out}</TodAnchor>;
};
