// Story props in the ink style: Bug, Shield, Cloud, Server, Laptop.
//
//   <Bug x={480} y={600} size={90} at={1} crawl />          // the security bug (legs wiggle when crawl)
//   <Shield x={480} y={600} size={160} at={2} check />
//   <Cloud x={480} y={300} w={300} at={1} />
//   <Server x={120} y={500} w={160} h={260} at={1} blink />
//   <Laptop x={300} y={800} w={260} at={1.5} screen={palette.teal} />
// x,y = centre (Bug, Shield, Cloud) or top-left (Server, Laptop: base line at y + h).

import React from 'react';
import {palette, stroke} from '../theme';
import {osc, useTime} from '../time';
import {rand, Seed} from '../rng';
import {Ink} from '../Ink';
import {Fill} from '../Fill';
import {Pop} from '../motion';
import {blob, check, crown, ellipse, hline, line, polyPath, rect, roundRect, Pt} from '../sketch';
import {At, b} from './common';

// ---------------------------------------------------------------- Bug

export const Bug: React.FC<{x: number; y: number; size?: number; at?: At; seed?: Seed; color?: string; crawl?: boolean; rot?: number; width?: number}> = ({
  x,
  y,
  size = 80,
  at,
  seed = 'bug',
  color = palette.sun,
  crawl = false,
  rot = 0,
  width = stroke.ink,
}) => {
  const t = useTime();
  const s = size;
  const legs: React.ReactNode[] = [];
  for (let side = -1; side <= 1; side += 2) {
    for (let i = 0; i < 3; i++) {
      const ly = y - s * 0.12 + i * s * 0.2;
      const wig = crawl ? osc(t, 3.2, i * 2.1 + (side > 0 ? 3.1 : 0)) * 9 : 0;
      const ax = x + side * s * 0.28;
      const kx = x + side * s * 0.5;
      const ky = ly - s * 0.1 + (i - 1) * s * 0.06;
      const ex = x + side * s * 0.62;
      const ey = ly + s * 0.08 + (i - 1) * s * 0.12;
      legs.push(
        <g key={`${side}${i}`} transform={wig ? `rotate(${side * wig} ${ax} ${ly})` : undefined}>
          <Ink d={`M${ax} ${ly}L${kx} ${ky}L${ex} ${ey}`} at={b(at, 0.35 + i * 0.05)} dur={0.15} width={width} />
        </g>,
      );
    }
  }
  const dots = [0, 1, 2, 3].map((i) => {
    const dx = (i % 2 ? 1 : -1) * s * 0.12;
    const dy = y - s * 0.02 + Math.floor(i / 2) * s * 0.2;
    return <circle key={i} cx={x + dx} cy={dy} r={s * 0.045} fill={palette.ink} />;
  });
  return (
    <g transform={rot ? `rotate(${rot} ${x} ${y})` : undefined}>
      <Pop at={b(at, 0) ?? -10} x={x} y={y}>
        {legs}
        <Ink d={`M${x - s * 0.08} ${y - s * 0.42}Q${x - s * 0.16} ${y - s * 0.62} ${x - s * 0.3} ${y - s * 0.64}M${x + s * 0.08} ${y - s * 0.42}Q${x + s * 0.16} ${y - s * 0.62} ${x + s * 0.3} ${y - s * 0.64}`} at={b(at, 0.45)} dur={0.2} width={width * 0.9} />
        <Fill d={blob(x, y + s * 0.08, s * 0.3, s * 0.38, {seed: `${seed}/b`})} color={color} at={b(at, 0.25)} mode="pop" seed={`${seed}/bf`} />
        <Fill d={blob(x, y - s * 0.36, s * 0.16, s * 0.13, {seed: `${seed}/h`})} color={palette.ink} at={b(at, 0.3)} mode="pop" offset={false} seed={`${seed}/hf`} />
        <Ink d={ellipse(x, y + s * 0.08, s * 0.3, s * 0.38, {seed: `${seed}/bo`})} at={at} dur={0.3} width={width} />
        <Ink d={line(x, y - s * 0.26, x, y + s * 0.44, {over: [0, 0], seed: `${seed}/sp`})} at={b(at, 0.3)} dur={0.15} width={width * 0.9} />
        {dots}
      </Pop>
    </g>
  );
};

// ---------------------------------------------------------------- Shield

export const Shield: React.FC<{x: number; y: number; size?: number; at?: At; seed?: Seed; color?: string; check?: boolean; checkAt?: number; width?: number}> = ({
  x,
  y,
  size = 150,
  at,
  seed = 'shield',
  color = palette.teal,
  check: withCheck = false,
  checkAt,
  width = stroke.ink,
}) => {
  const w = size * 0.8;
  const h = size;
  const top = y - h / 2;
  const d = `M${x - w / 2} ${top + h * 0.12}Q${x - w * 0.1} ${top + h * 0.06} ${x} ${top}Q${x + w * 0.1} ${top + h * 0.06} ${x + w / 2} ${top + h * 0.12}L${x + w / 2} ${top + h * 0.45}Q${x + w * 0.45} ${top + h * 0.82} ${x} ${top + h}Q${x - w * 0.45} ${top + h * 0.82} ${x - w / 2} ${top + h * 0.45}Z`;
  return (
    <>
      <Fill d={d} color={color} at={b(at, 0.35)} mode="pop" seed={`${seed}/f`} />
      <Ink d={d} at={at} dur={0.5} width={width} />
      {withCheck ? <Ink d={check(x, y + h * 0.02, size * 0.42, {seed: `${seed}/c`})} at={checkAt ?? b(at, 0.7)} dur={0.3} width={stroke.inkBold + 1} color={palette.card} /> : null}
    </>
  );
};

// ---------------------------------------------------------------- Cloud

export const Cloud: React.FC<{x: number; y: number; w?: number; at?: At; seed?: Seed; color?: string; width?: number}> = ({x, y, w = 260, at, seed = 'cloud', color = palette.card, width = stroke.ink}) => {
  const h = w * 0.42;
  // bumpy top from three crowns, flat bottom
  const d = crown(x, y, w * 0.5, h * 0.5, {seed: `${seed}/c`, bumps: 7, round: 0.75});
  return (
    <>
      <Fill d={d} color={color} at={b(at, 0.3)} mode="pop" seed={`${seed}/f`} />
      <Ink d={d} at={at} dur={0.55} width={width} />
      <Ink d={hline(x - w * 0.42, x + w * 0.42, y + h * 0.48, {seed: `${seed}/b`, over: [4, 14]})} at={b(at, 0.45)} dur={0.2} width={width} />
    </>
  );
};

// ---------------------------------------------------------------- Server rack

export const Server: React.FC<{x: number; y: number; w?: number; h?: number; units?: number; at?: At; seed?: Seed; color?: string; blink?: boolean; width?: number}> = ({
  x,
  y,
  w = 160,
  h = 260,
  units = 4,
  at,
  seed = 'server',
  color = palette.teal,
  blink = true,
  width = stroke.ink,
}) => {
  const t = useTime();
  const uh = (h - 24) / units;
  const out: React.ReactNode[] = [];
  out.push(<Fill key="f" rect={[x, y, w, h]} color={color} at={b(at, 0.3)} mode="grow" seed={`${seed}/f`} />);
  out.push(<Ink key="o" d={rect(x, y, w, h, {seed: `${seed}/o`})} at={at} dur={0.45} width={width} />);
  for (let i = 0; i < units; i++) {
    const uy = y + 12 + i * uh;
    out.push(<Fill key={`u${i}`} rect={[x + 12, uy + 4, w - 24, uh - 8]} color={palette.tealDark} at={b(at, 0.5 + i * 0.06)} mode="wipe" offset={false} seed={`${seed}/u${i}`} />);
    out.push(<Ink key={`ul${i}`} d={rect(x + 12, uy + 4, w - 24, uh - 8, {over: 2, seed: `${seed}/ul${i}`}) + hline(x + 28, x + w * 0.55, uy + uh / 2, {over: 0, seed: `${seed}/sl${i}`})} at={b(at, 0.45 + i * 0.06)} dur={0.3} width={width * 0.8} />);
    for (let k = 0; k < 2; k++) {
      const on = !blink || osc(t, 0.8 + rand(`${seed}${i}${k}`, 'hz') * 2.5, rand(`${seed}${i}${k}`, 'ph') * 6) > -0.2;
      const c = k === 0 ? palette.sage : palette.sun;
      out.push(<circle key={`l${i}${k}`} cx={x + w - 34 + k * 14} cy={uy + uh / 2} r={4.5} fill={on ? c : palette.olive} opacity={at !== undefined && t < at + 0.8 ? 0 : 1} />);
    }
  }
  return <>{out}</>;
};

// ---------------------------------------------------------------- Laptop

export const Laptop: React.FC<{x: number; y: number; w?: number; at?: At; seed?: Seed; screen?: string; children?: React.ReactNode; width?: number}> = ({
  x,
  y,
  w = 260,
  at,
  seed = 'laptop',
  screen = palette.mintPale,
  children,
  width = stroke.ink,
}) => {
  const sh = w * 0.62;
  const base: Pt[] = [
    [x - w * 0.08, y + sh + 4],
    [x + w * 1.08, y + sh + 4],
    [x + w * 1.0, y + sh + 22],
    [x, y + sh + 22],
  ];
  return (
    <>
      <Fill d={roundRect(x, y, w, sh, 8)} color={palette.olive} at={b(at, 0.3)} mode="grow" seed={`${seed}/lid`} />
      <Fill rect={[x + 12, y + 12, w - 24, sh - 24]} color={screen} at={b(at, 0.45)} mode="wipe" dir="down" offset={false} seed={`${seed}/scr`} />
      <g>{children}</g>
      <Ink d={roundRect(x, y, w, sh, 8, {closed: false, seed: `${seed}/li`})} at={at} dur={0.45} width={width} />
      <Fill d={polyPath(base)} color={palette.grey} at={b(at, 0.4)} mode="fade" seed={`${seed}/base`} />
      <Ink d={`M${base[0][0]} ${base[0][1]}L${base[1][0]} ${base[1][1]}L${base[2][0]} ${base[2][1]}L${base[3][0]} ${base[3][1]}Z`} at={b(at, 0.3)} dur={0.35} width={width} />
    </>
  );
};
