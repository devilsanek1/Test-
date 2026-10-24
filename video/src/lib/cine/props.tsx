// cine/props.tsx — foreground framing pieces for full-bleed shots: a rooftop Ledge (parapet) to sit the mascot
// and back-view figures on, and a WipePass (something passes close to the lens: a cut hides behind it).
//
//   <Ledge y={1460} tod="dusk" at={0.1} />                       // parapet across the frame, cropped by its edges
//   <WipePass at={5.8} dur={0.5} dir="right" color={deep.teal60} />  // the cut sits at at + dur/2

import React from 'react';
import {palette, stroke} from '../theme';
import {ease as E, prog, useTime} from '../time';
import {Ink} from '../Ink';
import {crown, glint, hline, line, rect, textLines, wallTicks} from '../sketch';
import {rng, Seed} from '../rng';
import {ambient, Tod, TodPalette, todPal} from './atmosphere';
import {darker} from './city';
import {Glow} from './light';
import {PathBuf, r1} from './util';

export type LedgeProps = {
  /** Back edge of the top surface (where things sit). */
  y: number;
  x0?: number;
  x1?: number;
  /** Top surface depth (px) and front face height. */
  top?: number;
  face?: number;
  tod?: Tod | TodPalette;
  color?: string;
  /** Draw-on start (ink), fills pop a beat later. Omit = built. */
  at?: number;
  seed?: Seed;
  width?: number;
  /** Floor colour below the face (the roof we stand on). */
  floor?: string;
};

/** A rooftop parapet seen from behind and slightly above: lit top surface, shaded front face, inked edges that
 *  overshoot past the frame, brick ticks. Everything below it is the roof floor. */
export const Ledge: React.FC<LedgeProps> = ({y, x0 = -60, x1 = 1140, top = 30, face = 110, tod = 'day', color, at, seed = 'ledge', width = stroke.inkBold, floor}) => {
  const t = useTime();
  const p = todPal(tod);
  const r = rng(`ledge/${seed}`);
  const c = color ?? ambient(palette.sand, p);
  const shadeC = ambient(darker(palette.sand), p);
  const floorC = floor ?? ambient(palette.tan, p);
  const fp = at === undefined ? 1 : prog(t, at + 0.25, 0.01);
  const ink =
    hline(x0, x1, y, {seed: `${seed}/a`, over: 'structural'}) +
    hline(x0 + 20, x1 - 10, y + top, {seed: `${seed}/b`, over: 'structural'}) +
    hline(x0, x1, y + top + face, {seed: `${seed}/c`, over: [10, 30]}) +
    line(x0 + (x1 - x0) * r.range(0.62, 0.7), y + top, x0 + (x1 - x0) * r.range(0.62, 0.7) + 2, y + top + face, {seed: `${seed}/j`, over: [0, 4]});
  const ticks = wallTicks(x0 + 80, y + top + 22, x1 - x0 - 160, face - 40, {seed: `${seed}/t`, n: 7, size: 26});
  return (
    <>
      {fp > 0 ? (
        <>
          <rect x={x0 - 400} y={y + top + face} width={x1 - x0 + 800} height={1400} fill={floorC} />
          <rect x={x0 - 400} y={y + top} width={x1 - x0 + 800} height={face} fill={shadeC} />
          <rect x={x0 - 400} y={y + 3} width={x1 - x0 + 800} height={top} fill={c} />
        </>
      ) : null}
      <Ink d={ink} at={at} width={width} exit={false} />
      <Ink d={ticks} at={at === undefined ? undefined : at + 0.3} width={stroke.ink} order="all" exit={false} />
    </>
  );
};

export type WipePassProps = {
  at: number;
  /** Seconds to cross the frame. The cut should sit at at + dur / 2 (the frame is fully covered then). */
  dur?: number;
  dir?: 'left' | 'right';
  color?: string;
  /** Lighter edge strip on the leading side. */
  rim?: string;
  width?: number;
  seed?: Seed;
};

/** A dark foreground slab (a pillar, a lamp post, a passer-by) whipping across the lens. It covers the whole frame
 *  for ~0.1 s around at + dur/2: put the cut there. Screen space: render it outside any Layer. */
export const WipePass: React.FC<WipePassProps> = ({at, dur = 0.5, dir = 'right', color = palette.tealDark, rim, width = 1500, seed = 'wipe'}) => {
  const t = useTime();
  const u = prog(t, at, dur, E.inOutSine);
  if (u <= 0 || u >= 1) return null;
  const r = rng(`wipe/${seed}`);
  const W = 1080;
  const lead = dir === 'right' ? -width + (W + width) * u : W - (W + width) * u;
  const pb = new PathBuf();
  const tilt = r.range(40, 90);
  pb.poly([
    [lead, -50],
    [lead + width, -50],
    [lead + width + tilt, 1970],
    [lead + tilt, 1970],
  ]);
  const edgeX = dir === 'right' ? lead + width : lead;
  return (
    <g>
      <path d={pb.d} fill={color} />
      {rim ? <path d={new PathBuf().poly([[edgeX - (dir === 'right' ? 26 : 0), -50], [edgeX + (dir === 'right' ? 0 : 26), -50], [edgeX + tilt + (dir === 'right' ? 0 : 26), 1970], [edgeX + tilt - (dir === 'right' ? 26 : 0), 1970]]).d} fill={rim} /> : null}
      <path d={line(edgeX, -60, edgeX + tilt, 1980, {seed: `${seed}/e`, over: [0, 0]})} fill="none" stroke={palette.ink} strokeWidth={9} strokeLinecap="round" />
    </g>
  );
};


// ---------------------------------------------------------------- Plinth

/** A stone block / low wall end to perch a mascot or a figure on (front face, lit cap, ink). Top-centre at (x, y). */
export const Plinth: React.FC<{x: number; y: number; w?: number; h?: number; tod?: Tod | TodPalette; seed?: Seed; width?: number}> = ({x, y, w = 260, h = 420, tod = 'day', seed = 'plinth', width = stroke.inkBold}) => {
  const p = todPal(tod);
  const cap = 26;
  const x0 = x - w / 2;
  const ink =
    hline(x0 - 14, x0 + w + 14, y, {seed: `${seed}/a`, over: [8, 18]}) +
    hline(x0 - 14, x0 + w + 14, y + cap, {seed: `${seed}/b`, over: [6, 12]}) +
    line(x0, y + cap, x0, y + h, {seed: `${seed}/l`, over: [0, 0]}) +
    line(x0 + w, y + cap, x0 + w, y + h, {seed: `${seed}/r`, over: [0, 0]});
  return (
    <>
      <rect x={x0} y={y + cap} width={w} height={h} fill={ambient(palette.sand, p)} />
      <rect x={x0} y={y + cap} width={w * 0.22} height={h} fill={ambient(palette.tan, p)} />
      <rect x={x0 - 12} y={y + 2} width={w + 24} height={cap} fill={ambient(palette.cream, p)} />
      <path d={ink} fill="none" stroke={palette.ink} strokeWidth={width} strokeLinecap="round" />
      <path d={wallTicks(x0 + 30, y + cap + 40, w - 60, h - 80, {seed: `${seed}/t`, n: 3, size: 22})} fill="none" stroke={palette.ink} strokeWidth={stroke.ink} strokeLinecap="round" />
    </>
  );
};

// ---------------------------------------------------------------- WindowCloseup

export type WindowCloseupProps = {
  /** Glass opening size in local px (draw at ~1x, then place it on a facade with affineFromTri). */
  w?: number;
  h?: number;
  tod?: Tod | TodPalette;
  /** Room light switches off (pop). */
  offAt?: number;
  /** The monitor (a website) switches off. Default offAt + 0.35. */
  screenOffAt?: number;
  seed?: Seed;
  /** Person at the desk (back view). */
  person?: React.ReactNode;
};

/** One lit window up close: frame, transom, curtain, pendant lamp with a stepped glow, a desk with a monitor showing
 *  a web page, a plant on the sill, glints. Local origin = top-left of the glass. */
export const WindowCloseup: React.FC<WindowCloseupProps> = ({w = 420, h = 760, tod = 'night', offAt, screenOffAt, seed = 'wc', person}) => {
  const t = useTime();
  const p = todPal(tod);
  const on = offAt === undefined || t < offAt;
  const scrOn = t < (screenOffAt ?? (offAt === undefined ? Infinity : offAt + 0.35));
  const fr = 22;
  const room = on ? palette.peach : ambient(palette.tealDark, p);
  const roomDark = on ? palette.tan : ambient(darker(palette.tealDark), p);
  const lampX = w * 0.64;
  const deskY = h * 0.6;
  const mon = {x: w * 0.47, y: h * 0.42, w: w * 0.36, h: h * 0.15};
  const frameC = palette.cream;
  const ink = rect(-fr, -fr, w + fr * 2, h + fr * 2, {seed: `${seed}/o`, over: 'medium'}) + rect(0, 0, w, h, {seed: `${seed}/i`, over: 'small'}) + hline(-fr - 30, w + fr + 30, h + fr + 14, {seed: `${seed}/s`, over: [20, 30]}) + hline(-fr - 24, w + fr + 24, h + fr + 30, {seed: `${seed}/s2`, over: [10, 20]});
  const tr = hline(0, w, h * 0.3, {seed: `${seed}/tr`, over: [2, 4]}) + hline(0, w, h * 0.3 + 14, {seed: `${seed}/tr2`, over: [2, 4]});
  const curtain = `M0 0L${w * 0.17} 0Q${w * 0.2} ${h * 0.4} ${w * 0.13} ${h * 0.72}L0 ${h * 0.74}Z`;
  const lamp = `M${lampX - 34} ${h * 0.2}L${lampX + 34} ${h * 0.2}L${lampX + 20} ${h * 0.14}L${lampX - 20} ${h * 0.14}Z`;
  const web = textLines(mon.x + 16, mon.y + 38, mon.w - 32, {seed: `${seed}/web`, n: 3, gap: 16});
  const plant = crown(w * 0.8, h + fr - 46, 38, 30, {seed: `${seed}/pl`, bumps: 7});
  return (
    <>
      {/* frame band + interior */}
      <rect x={-fr} y={-fr} width={w + fr * 2} height={h + fr * 2} fill={frameC} />
      <rect x={0} y={0} width={w} height={h} fill={room} />
      <rect x={0} y={deskY} width={w} height={h - deskY} fill={roomDark} />
      {on ? <Glow cx={lampX} cy={h * 0.21} r={30} rings={3} spread={2.6} color={palette.cream} opacity={0.32} /> : null}
      <path d={`M${lampX} 0L${lampX} ${h * 0.14}`} stroke={palette.ink} strokeWidth={2.2} />
      <path d={lamp} fill={on ? palette.cream : ambient(palette.teal, p)} />
      {/* desk + monitor (the website) */}
      <rect x={w * 0.22} y={deskY - 8} width={w * 0.78} height={16} fill={palette.brown} />
      <rect x={mon.x} y={mon.y} width={mon.w} height={mon.h} fill={palette.ink} />
      <rect x={mon.x + 7} y={mon.y + 7} width={mon.w - 14} height={mon.h - 14} fill={scrOn ? palette.white : ambient(palette.tealDark, p)} />
      {scrOn ? <rect x={mon.x + 7} y={mon.y + 7} width={mon.w - 14} height={16} fill={palette.sage} /> : null}
      {scrOn ? <path d={web} fill="none" stroke={palette.ink} strokeWidth={2} strokeLinecap="round" /> : null}
      <path d={`M${mon.x + mon.w / 2} ${mon.y + mon.h}L${mon.x + mon.w / 2} ${deskY - 8}`} stroke={palette.ink} strokeWidth={6} />
      {/* the person (back view) */}
      {person}
      {/* curtain, transom bar, plant, glints */}
      <path d={curtain} fill={on ? palette.sand : ambient(palette.tan, p)} transform="translate(2 2)" />
      <path d={`M${w * 0.06} 6Q${w * 0.08} ${h * 0.4} ${w * 0.05} ${h * 0.7}M${w * 0.11} 6Q${w * 0.14} ${h * 0.4} ${w * 0.09} ${h * 0.71}`} fill="none" stroke={palette.ink} strokeWidth={2} strokeLinecap="round" />
      <rect x={0} y={h * 0.3} width={w} height={14} fill={frameC} />
      <rect x={w * 0.68} y={h + fr - 44} width={58} height={44} fill={palette.brown} />
      <path d={plant} fill={palette.sage} transform="translate(3 2)" />
      <Ink d={plant} width={stroke.ink} exit={false} />
      <path d={glint(w * 0.12, h * 0.26, 70, {seed: `${seed}/g`})} stroke={palette.white} strokeWidth={4} strokeLinecap="round" />
      <Ink d={ink + tr} width={stroke.ink} exit={false} />
    </>
  );
};
