// S10 LOCAL STAND-INS for shared-kit pieces requested in docs/storyboard_v3.json "requests" that do not exist yet.
// Each keeps the requested name / props so a later fix round can swap the import to src/scenes/shared/**:
//   (SupportTag: swapped to the shared props one, src/scenes/shared/props/Labels.tsx)
//   CartSign    (S09's local CartSign, same props and look: the MakersLane `blindSign` 'still fixing...' re-hung on the
//                MakersCart; S09 strikes it and scribbles 'fixed!'; S10 carries that end state)
//   Satchel     (the cart's satchel of support tags; no shared piece requested, scene-owned)
// Everything is Ink / Fill (relights, un-builds, paper Look), seconds-based, no opacity.

import React from 'react';
import {palette} from '../../lib/theme';
import {ease as E, prog, useTime} from '../../lib/time';
import {Ink} from '../../lib/Ink';
import {Fill} from '../../lib/Fill';
import {circle, line, rect, rectPath, roundRect} from '../../lib/sketch';
import {mat, XG} from '../../lib/xf';
import {captionFontStack, useCaptionFont} from '../../lib/font';

// ---------------------------------------------------------------- CartSign (the S09 sign, as S09 leaves it)

/** The workshop blind's sign card re-hung on the cart, drawn exactly like S09's CartSign (src/scenes/scene09/shims.tsx,
 *  same props): 'still fixing...' (J3 / J4) struck through and 'fixed!' scribbled under it (J5). S10 shows its end
 *  state (strikeAt / fixedAt in the past). (x, y) = the hang point (top of the post); the card hangs below it. */
export const CartSign: React.FC<{x: number; y: number; w?: number; fs?: number; strikeAt?: number; fixedAt?: number; ink?: number; seed?: string}> = ({x, y, w = 190, fs = 30, strikeAt, fixedAt, ink = 2.2, seed = 'cartsign'}) => {
  const t = useTime();
  useCaptionFont();
  const uid = `cs${seed.replace(/[^a-zA-Z0-9]/g, '')}`;
  const h = fs * 2.55;
  const top = y + fs * 0.5;
  const x0 = x - w / 2;
  const sp = strikeAt === undefined ? 0 : E.inOutSine(prog(t, strikeAt, 0.12));
  const fp = fixedAt === undefined ? 0 : E.outCubic(prog(t, fixedAt, 0.16));
  const line1Y = top + fs * 1.05;
  const line2Y = top + fs * 2.15;
  const tx0 = x0 + w * 0.08;
  const tx1 = x0 + w * 0.92;
  const f1 = (v: number) => v.toFixed(1);
  return (
    <>
      <Ink d={`M${f1(x)} ${f1(y)}L${f1(x0 + w * 0.2)} ${f1(top + 2)}M${f1(x)} ${f1(y)}L${f1(x0 + w * 0.8)} ${f1(top + 2)}`} width={ink * 0.7} taper={false} vary={0} seed={`${seed}/str`} />
      <circle cx={x} cy={y} r={ink * 1.3} fill={palette.ink} />
      <Fill d={roundRect(x0, top, w, h, fs * 0.18)} color={palette.cream} offset={[2, 1.5]} seed={`${seed}/card`} />
      <Ink d={roundRect(x0, top, w, h, fs * 0.18)} width={ink} taper={false} seed={`${seed}/cardI`} />
      <text x={x} y={line1Y} fontFamily={captionFontStack} fontSize={fs} fill={palette.ink} textAnchor="middle">
        still fixing...
      </text>
      {sp > 0 ? <path d={`M${f1(tx0)} ${f1(line1Y - fs * 0.3)}L${f1(tx0 + (tx1 - tx0) * sp)} ${f1(line1Y - fs * 0.27 - sp * fs * 0.06)}`} stroke={palette.ink} strokeWidth={ink * 1.4} strokeLinecap="round" fill="none" /> : null}
      {fp > 0 ? (
        <>
          <defs>
            <clipPath id={uid} clipPathUnits="userSpaceOnUse">
              <rect x={x0} y={top + fs * 1.2} width={w * fp} height={fs * 1.3} />
            </clipPath>
          </defs>
          <g clipPath={`url(#${uid})`}>
            <text x={x + w * 0.04} y={line2Y} fontFamily={captionFontStack} fontSize={fs * 1.12} fill={palette.ink} textAnchor="middle" transform={`rotate(-4 ${f1(x)} ${f1(line2Y)})`}>
              fixed!
            </text>
          </g>
        </>
      ) : null}
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
