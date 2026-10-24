// Padlock — body + outlined shackle band + keyhole. Can lock (shackle snaps down), open (lifts), or break
// (shackle flies off, body shakes, crack draws).
//   <Padlock x={480} y={600} size={140} at={1} lockAt={2.2} />
//   <Padlock x={480} y={600} size={140} breakAt={4} />
// x,y = centre of the body.

import React from 'react';
import {palette, stroke} from '../theme';
import {ease as E, prog, springAt, springs, useTime} from '../time';
import {Seed} from '../rng';
import {Ink} from '../Ink';
import {Fill} from '../Fill';
import {Shake} from '../motion';
import {poly, roundRect} from '../sketch';
import {At, b} from './common';
import {mat, XG} from '../xf';

export type PadlockProps = {
  x: number;
  y: number;
  size?: number;
  at?: At;
  seed?: Seed;
  color?: string;
  shackleColor?: string;
  lockAt?: number;
  openAt?: number;
  breakAt?: number;
  width?: number;
};

export const Padlock: React.FC<PadlockProps> = ({x, y, size = 130, at, seed = 'lock', color = palette.sun, shackleColor = palette.sand, lockAt, openAt, breakAt, width = stroke.ink}) => {
  const t = useTime();
  const bw = size;
  const bh = size * 0.8;
  const top = y - bh / 2;
  const sw = size * 0.6;
  const band = size * 0.1;
  const sh = size * 0.46;
  const shackle = `M${x - sw / 2} ${top + 4}L${x - sw / 2} ${top - sh + sw / 2}A${sw / 2} ${sw / 2} 0 0 1 ${x + sw / 2} ${top - sh + sw / 2}L${x + sw / 2} ${top + 4}`;
  const raise = size * 0.17;
  let dy = 0;
  let rot = 0;
  let fx = 0;
  let fo = 1;
  if (lockAt !== undefined) dy = -raise * (1 - springAt(t, lockAt, springs.snappy));
  if (openAt !== undefined) {
    const p = prog(t, openAt, 0.35, E.outBack(2));
    dy += -raise * p;
    rot = -18 * prog(t, openAt + 0.2, 0.3, E.outCubic);
  }
  if (breakAt !== undefined) {
    const p = prog(t, breakAt, 0.8, E.outCubic);
    fx = size * 0.9 * p;
    dy += -size * 1.1 * Math.sin(p * Math.PI * 0.6);
    rot += 70 * p;
    fo = t < breakAt + 0.6 ? 1 : 0; // the flying shackle pops out (no fade)
  }
  const keyhole = `M${x} ${y - bh * 0.12}m-${size * 0.07} 0a${size * 0.07} ${size * 0.07} 0 1 0 ${size * 0.14} 0a${size * 0.07} ${size * 0.07} 0 1 0 -${size * 0.14} 0M${x - size * 0.035} ${y - bh * 0.08}L${x - size * 0.06} ${y + bh * 0.18}L${x + size * 0.06} ${y + bh * 0.18}L${x + size * 0.035} ${y - bh * 0.08}Z`;
  const pivotX = x - sw / 2;
  const body = (
    <>
      <Fill d={roundRect(x - bw / 2, top, bw, bh, size * 0.12)} color={color} at={b(at, 0.35)} mode="grow" seed={`${seed}/b`} />
      <Ink d={roundRect(x - bw / 2, top, bw, bh, size * 0.12, {closed: false, seed: `${seed}/bi`})} at={at} dur={0.45} width={width} />
      <Fill d={keyhole} color={palette.ink} at={b(at, 0.7)} mode="pop" offset={false} seed={`${seed}/k`} />
      {breakAt !== undefined ? <Ink d={poly([[x - bw * 0.3, top], [x - bw * 0.12, top + bh * 0.3], [x - bw * 0.22, top + bh * 0.5], [x - bw * 0.02, top + bh * 0.8]], {joined: true, seed: `${seed}/cr`})} at={breakAt + 0.05} dur={0.25} width={width} /> : null}
    </>
  );
  return (
    <>
      {fo > 0.01 ? (
        <XG m={mat.compose(mat.translate(fx, dy), mat.about(mat.rotate(rot), pivotX, top))}>
          <Ink d={shackle} at={b(at, 0.2)} dur={0.4} width={band + width * 2} color={palette.ink} />
          <Ink d={shackle} at={b(at, 0.25)} dur={0.4} width={band} color={shackleColor} />
        </XG>
      ) : null}
      {breakAt !== undefined ? (
        <Shake at={breakAt} dur={0.6} amp={size * 0.06} rot={4} x={x} y={y}>
          {body}
        </Shake>
      ) : (
        body
      )}
    </>
  );
};
