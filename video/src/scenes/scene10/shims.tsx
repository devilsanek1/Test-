// S10 LOCAL STAND-INS for shared-kit pieces requested in docs/storyboard_v3.json "requests" that do not exist yet.
// Each keeps the requested name / props so a later fix round can swap the import to src/scenes/shared/**:
//   (SupportTag: swapped to the shared props one, src/scenes/shared/props/Labels.tsx)
//   CartSign    (sets request: the MakersLane `blindSign` 'still fixing...' that hangs on the MakersCart in S09, struck
//                to 'still fixed!' there; S10 carries the struck sign)
//   Satchel     (the cart's satchel of support tags; no shared piece requested, scene-owned)
// Everything is Ink / Fill (relights, un-builds, paper Look), seconds-based, no opacity.

import React from 'react';
import {palette} from '../../lib/theme';
import {ease as E, prog, useTime} from '../../lib/time';
import {Ink} from '../../lib/Ink';
import {Fill} from '../../lib/Fill';
import {circle, line, rect, rectPath, roundRect} from '../../lib/sketch';
import {mat, XG} from '../../lib/xf';
import {captionFontStack, measureCaption, useCaptionFont} from '../../lib/font';

// ---------------------------------------------------------------- CartSign ('still fixed!')

/** The workshop's 'still fixing...' sign as S09 leaves it: 'still' struck, 'fixed!' scribbled beside it. (x, y) = the
 *  post foot (on the cart bed); the card sits on a short post. fontSize in parent px. */
export const CartSign: React.FC<{x: number; y: number; post?: number; fontSize?: number; ink?: number; seed?: string}> = ({x, y, post = 30, fontSize = 24, ink = 2.2, seed = 'csign'}) => {
  useCaptionFont();
  const a = 'still';
  const b = 'fixed!';
  const wa = measureCaption(a, fontSize * 0.82);
  const wb = measureCaption(b, fontSize);
  const gap = fontSize * 0.28;
  const padX = fontSize * 0.36;
  const w = wa + gap + wb + padX * 2;
  const h = fontSize * 1.32;
  const x0 = x - w / 2;
  const y0 = y - post - h;
  const base = y0 + h * 0.72;
  return (
    <>
      <Ink d={line(x, y, x, y0 + h - 2, {over: [0, 0], seed: `${seed}/p`})} width={ink * 1.2} taper={false} seed={`${seed}/p`} />
      <Fill d={roundRect(x0, y0, w, h, 3, {seed: `${seed}/f`})} color={palette.cream} offset={[2, 1.5]} seed={`${seed}/f`} />
      <Ink d={roundRect(x0, y0, w, h, 3, {seed: `${seed}/i`, closed: false})} width={ink} taper={false} seed={`${seed}/i`} />
      <text x={x0 + padX} y={base} fontFamily={captionFontStack} fontSize={fontSize * 0.82} fill={palette.ink}>
        {a}
      </text>
      <Ink d={line(x0 + padX - 2, base - fontSize * 0.26, x0 + padX + wa + 2, base - fontSize * 0.3, {over: [0, 0], seed: `${seed}/x`})} width={ink * 0.9} taper={false} seed={`${seed}/x`} />
      <text x={x0 + padX + wa + gap} y={base} fontFamily={captionFontStack} fontSize={fontSize} fill={palette.ink}>
        {b}
      </text>
    </>
  );
};

// ---------------------------------------------------------------- Satchel (the cart's bag of support tags)

/** A sand satchel with a flap and two sage tag tops peeking out. (x, y) = bottom centre; w = width. `pullAt` times:
 *  each pulls one tag up out of the bag (0.12 s rise), then it is gone (the scene flies it). */
export const Satchel: React.FC<{x: number; y: number; w?: number; pullAt?: number[]; ink?: number; seed?: string}> = ({x, y, w = 34, pullAt = [], ink = 2.2, seed = 'satchel'}) => {
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
    if (t < pa || t >= pa + 0.1) return;
    const q = E.outCubic(prog(t, pa, 0.1));
    const ty = y0 - h * 0.3 - q * h * 0.9;
    tags.push(
      <g key={`pl${i}`}>
        <Fill d={rectPath(x - w * 0.15, ty, w * 0.3, h * 0.62)} color={palette.sage} offset={false} mode="none" seed={`${seed}/pl${i}`} />
        <Ink d={rect(x - w * 0.15, ty, w * 0.3, h * 0.62, {seed: `${seed}/pli${i}`, over: 1})} width={ink * 0.7} taper={false} seed={`${seed}/pli${i}`} />
      </g>,
    );
  });
  const bag = roundRect(x0, y0, w, h, w * 0.14, {seed: `${seed}/b`});
  const flap = `M${x0} ${y0 + h * 0.08}Q${x} ${y0 + h * 0.62} ${x0 + w} ${y0 + h * 0.08}Z`;
  return (
    <>
      {tags}
      <Fill d={bag} color={palette.sand} offset={[2, 1.5]} seed={`${seed}/bag`} />
      <Fill d={flap} color={palette.tan} offset={false} mode="none" seed={`${seed}/flap`} />
      <Ink d={roundRect(x0, y0, w, h, w * 0.14, {seed: `${seed}/bi`, closed: false}) + `M${x0 + 1} ${y0 + h * 0.1}Q${x} ${y0 + h * 0.64} ${x0 + w - 1} ${y0 + h * 0.1}`} width={ink} taper={false} seed={`${seed}/bi`} />
      <Fill d={circle(x, y0 + h * 0.36, w * 0.05, {seed: `${seed}/btn`})} color={palette.ink} offset={false} mode="none" seed={`${seed}/btn`} />
    </>
  );
};
