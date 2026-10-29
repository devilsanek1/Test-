// S10 local pieces that have no shared-kit counterpart:
//   (SupportTag: swapped to the shared props one, src/scenes/shared/props/Labels.tsx)
//   (CartSign: swapped to the shared props FixSign, src/scenes/shared/props/FixSign.tsx, fix round 1)
//   Satchel     (the maker's hip satchel of support tags; no shared piece requested, scene-owned)
// Everything is Ink / Fill (relights, un-builds, paper Look), seconds-based, no opacity.

import React from 'react';
import {palette} from '../../lib/theme';
import {ease as E, prog, useTime} from '../../lib/time';
import {Ink} from '../../lib/Ink';
import {Fill} from '../../lib/Fill';
import {circle, rect, rectPath, roundRect} from '../../lib/sketch';
import {mat, XG} from '../../lib/xf';

// ---------------------------------------------------------------- Satchel (the cart's bag of support tags)

/** A sand satchel with a flap and two sage tag tops peeking out. (x, y) = bottom centre; w = width. `pullAt` times:
 *  each pulls one tag up out of the bag (`pullDur` rise), then it is gone (the scene's raised hand has it). */
export const Satchel: React.FC<{x: number; y: number; w?: number; pullAt?: number[]; pullDur?: number; ink?: number; seed?: string}> = ({x, y, w = 34, pullAt = [], pullDur = 0.1, ink = 2.2, seed = 'satchel'}) => {
  const t = useTime();
  const h = w * 0.72;
  const x0 = x - w / 2;
  const y0 = y - h;
  const tags: React.ReactNode[] = [];
  // the peeking tags (always two visible: the bag is full)
  [-0.18, 0.16].forEach((dx, i) => {
    tags.push(
      <XG key={`pk${i}`} m={mat.about(mat.rotate(i ? 9 : -7), x + dx * w, y0)}>
        <Fill d={rectPath(x + dx * w - w * 0.13, y0 - h * 0.36, w * 0.26, h * 0.5)} color={palette.sage} offset={false} mode="none" seed={`${seed}/pk${i}`} />
        <Ink d={rect(x + dx * w - w * 0.13, y0 - h * 0.36, w * 0.26, h * 0.5, {seed: `${seed}/pki${i}`, over: 1, edges: 'tlr'})} width={ink * 0.7} taper={false} seed={`${seed}/pki${i}`} />
      </XG>,
    );
  });
  // a pulled tag rises out (0.12 s) and is gone 2 frames before the scene flicks the flying tag up from above the bag
  pullAt.forEach((pa, i) => {
    if (t < pa || t >= pa + pullDur) return;
    const q = E.outCubic(prog(t, pa, pullDur));
    const ty = y0 - h * 0.3 - q * h * 0.9;
    tags.push(
      <g key={`pl${i}`}>
        <Fill d={rectPath(x - w * 0.15, ty, w * 0.3, h * 0.62)} color={palette.sage} offset={false} mode="none" seed={`${seed}/pl${i}`} />
        <Ink d={rect(x - w * 0.15, ty, w * 0.3, h * 0.62, {seed: `${seed}/pli${i}`, over: 1})} width={ink * 0.7} taper={false} seed={`${seed}/pli${i}`} />
      </g>,
    );
  });
  const bag = roundRect(x0, y0, w, h, w * 0.14, {seed: `${seed}/b`});
  // A1 FR1: a PEACH strap loop over the bag's top (its hang loop on the cart handle): a warm accent at the maker's hip
  // that reads at phone size (ink edges, a 4.5 px peach band)
  const strap = `M${x0 + w * 0.12} ${y0 + 2}C${x0 + w * 0.05} ${y0 - h * 0.85} ${x0 + w * 0.95} ${y0 - h * 0.85} ${x0 + w * 0.88} ${y0 + 2}`;
  const flap = `M${x0} ${y0 + h * 0.08}Q${x} ${y0 + h * 0.62} ${x0 + w} ${y0 + h * 0.08}Z`;
  return (
    <>
      <path d={strap} fill="none" stroke={palette.ink} strokeWidth={4.5 + ink * 1.2} strokeLinecap="round" />
      <path d={strap} fill="none" stroke={palette.peach} strokeWidth={4.5} strokeLinecap="round" />
      {tags}
      <Fill d={bag} color={palette.sand} offset={[2, 1.5]} seed={`${seed}/bag`} />
      <Fill d={flap} color={palette.tan} offset={false} mode="none" seed={`${seed}/flap`} />
      <Ink d={roundRect(x0, y0, w, h, w * 0.14, {seed: `${seed}/bi`, closed: false}) + `M${x0 + 1} ${y0 + h * 0.1}Q${x} ${y0 + h * 0.64} ${x0 + w - 1} ${y0 + h * 0.1}`} width={ink} taper={false} seed={`${seed}/bi`} />
      <Fill d={circle(x, y0 + h * 0.36, w * 0.05, {seed: `${seed}/btn`})} color={palette.ink} offset={false} mode="none" seed={`${seed}/btn`} />
    </>
  );
};
