// Window — overshooting frame, misregistered glass fill, mullions, glints, optional sill/blind/frame band.
//   <Window x={200} y={300} w={90} h={130} at={1.2} panes={2} glint sill />
// x,y = top-left of the opening (card/parent coords). Build: frame ink -> mullions -> glass -> glint.

import React from 'react';
import {palette, stroke} from '../theme';
import {rng, Seed} from '../rng';
import {Ink} from '../Ink';
import {Fill} from '../Fill';
import {glint as glintPath, hline, line, rect, rectPath} from '../sketch';
import {At, b} from './common';

export type WindowProps = {
  x: number;
  y: number;
  w: number;
  h: number;
  at?: At;
  seed?: Seed;
  /** Vertical panes (1..4). Default 1 (or 2 for wide windows). */
  panes?: number;
  /** Horizontal transom bar at this fraction of height (e.g. 0.3). */
  transom?: number;
  glass?: string;
  /** Thick coloured frame band (e.g. palette.teal) like the noticeboard. */
  frame?: string;
  glint?: boolean;
  sill?: boolean;
  /** Blind pulled down over this fraction (0..1). */
  blind?: number;
  /** Lit window (warm glass). */
  lit?: boolean;
  width?: number;
  /** Draw speed multiplier (2 = twice as fast). */
  speed?: number;
};

export const Window: React.FC<WindowProps> = ({x, y, w, h, at, seed = `${Math.round(x)},${Math.round(y)}`, panes, transom, glass, frame, glint, sill, blind = 0, lit, width = stroke.ink, speed = 1}) => {
  const r = rng(`win/${seed}`);
  const np = panes ?? (w > h * 1.1 ? 2 : 1);
  const g = glass ?? (lit ? palette.cream : palette.mintPale);
  const showGlint = glint ?? r.chance(0.55);
  const k = 1 / speed;
  const T = (dt: number) => b(at, dt * k);
  const fb = frame ? Math.max(5, Math.min(14, w * 0.09)) : 0;
  const parts: React.ReactNode[] = [];
  if (frame) parts.push(<Fill key="fr" rect={[x - fb, y - fb, w + fb * 2, h + fb * 2]} color={frame} at={T(0.3)} mode="snap" seed={`${seed}/fr`} />);
  parts.push(<Fill key="gl" rect={[x, y, w, h]} color={g} at={T(0.38)} mode="wipe" dir="down" seed={`${seed}/gl`} offset={frame ? false : undefined} />);
  if (blind > 0) parts.push(<Fill key="bl" rect={[x, y, w, h * blind]} color={palette.tan} at={T(0.5)} mode="wipe" dir="down" seed={`${seed}/bl`} offset={false} />);
  parts.push(<Ink key="fr" d={rect(x, y, w, h, {seed: `${seed}/f`})} at={T(0)} dur={0.4 * k} width={width} seed={`${seed}/f`} />);
  let mull = '';
  for (let i = 1; i < np; i++) mull += line(x + (w * i) / np, y, x + (w * i) / np, y + h, {over: [1, 2], seed: `${seed}/m${i}`});
  if (transom) mull += hline(x, x + w, y + h * transom, {over: [1, 3], seed: `${seed}/t`});
  if (blind > 0) mull += hline(x, x + w, y + h * blind, {over: [1, 2], seed: `${seed}/bl`});
  if (mull) parts.push(<Ink key="m" d={mull} at={T(0.28)} dur={0.2 * k} width={width * 0.85} order="all" seed={`${seed}/m`} />);
  if (sill) parts.push(<Ink key="s" d={hline(x - 8, x + w + 8, y + h + 6, {seed: `${seed}/s`})} at={T(0.35)} dur={0.15 * k} width={width} />);
  if (showGlint && w > 24 && h > 30) {
    const gl = Math.min(w, h) * r.range(0.32, 0.45);
    parts.push(<Ink key="g" d={glintPath(x + w * r.range(0.15, 0.3), y + h * r.range(0.45, 0.75), gl, {seed: `${seed}/g`})} at={T(0.6)} dur={0.15 * k} width={width * 0.7} order="all" />);
  }
  return <>{parts}</>;
};

// ---------------------------------------------------------------- simple "window grid" helper

/** Rows x cols of identical windows inside a box (used by Building; also handy for distant facades). */
export const WindowGrid: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  rows: number;
  cols: number;
  /** Window size as fraction of the cell. */
  fw?: number;
  fh?: number;
  at?: At;
  /** Seconds between consecutive windows. */
  stagger?: number;
  seed?: Seed;
  glass?: string;
  panes?: number;
  sill?: boolean;
  width?: number;
}> = ({x, y, w, h, rows, cols, fw = 0.5, fh = 0.62, at, stagger = 0.04, seed = 'wg', glass, panes, sill, width}) => {
  const cw = w / cols;
  const ch = h / rows;
  const out: React.ReactNode[] = [];
  let i = 0;
  for (let rI = rows - 1; rI >= 0; rI--) {
    for (let c = 0; c < cols; c++) {
      out.push(
        <Window
          key={`${rI}-${c}`}
          x={x + c * cw + (cw * (1 - fw)) / 2}
          y={y + rI * ch + ch * (1 - fh) * 0.45}
          w={cw * fw}
          h={ch * fh}
          at={b(at, i * stagger)}
          seed={`${seed}/${rI}/${c}`}
          glass={glass}
          panes={panes}
          sill={sill}
          width={width}
          speed={1.6}
        />,
      );
      i++;
    }
  }
  return <>{out}</>;
};

