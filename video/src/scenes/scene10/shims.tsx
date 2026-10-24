// S10 LOCAL STAND-INS for shared-kit pieces requested in docs/storyboard_v3.json "requests" that do not exist yet.
// Each keeps the requested name / props so a later fix round can swap the import to src/scenes/shared/**:
//   SupportTag  (props request: "SupportTag (S10): a sage check tag stamped with the elephant mark")
//   CartSign    (sets request: the MakersLane `blindSign` 'still fixing...' that hangs on the MakersCart in S09, struck
//                to 'still fixed!' there; S10 carries the struck sign)
//   Satchel     (the cart's satchel of support tags; no shared piece requested, scene-owned)
// Everything is Ink / Fill (relights, un-builds, paper Look), seconds-based, no opacity.

import React from 'react';
import {palette} from '../../lib/theme';
import {ease as E, prog, useTime} from '../../lib/time';
import {Ink} from '../../lib/Ink';
import {Fill} from '../../lib/Fill';
import {check, circle, line, poly, Pt, rect, rectPath, roundRect} from '../../lib/sketch';
import {mat, XG} from '../../lib/xf';
import {captionFontStack, measureCaption, useCaptionFont} from '../../lib/font';
import {ElephantEmblem, pendulum, popK} from './kit';

// ---------------------------------------------------------------- SupportTag

export type SupportTagProps = {
  /** Hang point (string top) in parent coords. */
  x: number;
  y: number;
  /** Tag body height (parent px). Width = 0.74 h. Default 44. */
  size?: number;
  /** Lands / pops in here (7 % pop about the hang point + the pendulum -16 -> 0). Omit = already hanging. */
  at?: number;
  /** The check strokes on (0.17 s). Omit = no check (an empty tag); -1 = already ticked. */
  tickAt?: number;
  /** Extra rotation (deg) about the hang point (flight spin). */
  rot?: number;
  /** Draw the string (false while it flies). Default true. */
  string?: boolean;
  /** String length (parent px). Default 0.22 h. */
  stringLen?: number;
  /** Outline width (parent px). Default 2.2. */
  ink?: number;
  /** Pendulum amplitude on landing (deg). Default -16. */
  swingAmp?: number;
  seed?: string;
};

/** A sage 'officially supported' check tag stamped with the elephant mark (it comes from the people who make PHP). */
export const SupportTag: React.FC<SupportTagProps> = ({x, y, size = 44, at, tickAt, rot = 0, string = true, stringLen, ink = 2.2, swingAmp = -16, seed = 'stag'}) => {
  const t = useTime();
  if (at !== undefined && t < at) return null;
  const h = size;
  const w = h * 0.74;
  const sl = stringLen ?? h * 0.22;
  const k = at !== undefined ? popK(t, at, 0.1, 0.18) : 1;
  const sw = at !== undefined && string ? pendulum(t, at, swingAmp, 0.5, 0.9) : 0;
  const c = Math.min(w * 0.26, h * 0.2);
  const pts: Pt[] = [
    [-w / 2 + c, 0],
    [w / 2 - c, 0],
    [w / 2, c],
    [w / 2, h],
    [-w / 2, h],
    [-w / 2, c],
  ];
  const body = poly(pts, {closed: true, joined: true, jitter: 0.3, seed: `${seed}/f`}) + 'Z';
  const bodyInk = poly(pts, {closed: true, over: 2, seed: `${seed}/i`});
  const er = Math.max(1.6, h * 0.06);
  const ey = c * 0.9;
  // the stamp: a cream disc with an ink ring and a solid ink elephant (the makers' mark)
  const sr = w * 0.28;
  const sy = h * 0.42;
  const ticked = tickAt === -1 || (tickAt !== undefined && t >= tickAt);
  return (
    <XG m={mat.compose(mat.translate(x, y), mat.rotate(rot + sw), mat.scale(k))}>
      {string ? <Ink d={line(0, 0, 0, sl + ey, {over: [0, 0], seed: `${seed}/s`, drift: 0.3})} width={ink * 0.6} taper={false} seed={`${seed}/s`} /> : null}
      <XG m={mat.translate(0, sl)}>
        <Fill d={body} color={palette.sage} offset={[2, 1.5]} seed={`${seed}/body`} />
        <Ink d={bodyInk} width={ink} taper={false} seed={`${seed}/bi`} />
        <Fill d={circle(0, ey, er * 1.5, {seed: `${seed}/ey`})} color={palette.cream} offset={false} mode="none" seed={`${seed}/ey`} />
        <Ink d={circle(0, ey, er, {seed: `${seed}/eyi`, overlap: 8})} width={ink * 0.55} taper={false} seed={`${seed}/eyi`} />
        <Fill d={circle(0, sy, sr, {seed: `${seed}/st`})} color={palette.cream} offset={false} mode="none" seed={`${seed}/st`} />
        <Ink d={circle(0, sy, sr, {seed: `${seed}/sti`, overlap: 10})} width={ink * 0.55} taper={false} seed={`${seed}/sti`} />
        <ElephantEmblem x={0} y={sy + sr * 0.04} size={sr * 1.55} mode="solid" seed={`${seed}/e`} />
        {ticked || tickAt !== undefined ? <Ink d={check(0, h * 0.8, w * 0.42, {seed: `${seed}/ck`})} at={tickAt === -1 ? undefined : tickAt} dur={0.17} width={Math.max(1.6, ink * 1.05)} color={palette.ink} taper={false} seed={`${seed}/ck`} /> : null}
      </XG>
    </XG>
  );
};

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
  // a pulled tag rises out (0.12 s), held for 0.08 s, then the scene's flying tag takes over
  pullAt.forEach((pa, i) => {
    if (t < pa || t >= pa + 0.2) return;
    const q = E.outCubic(prog(t, pa, 0.12));
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
