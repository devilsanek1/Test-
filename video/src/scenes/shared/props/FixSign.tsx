// props/FixSign.tsx — THE 'still fixing...' sign (sign jokes J3 -> J4 -> J5): one hand-lettered cream card that hangs on
// the makers' shop-window blind (S06 J3, the Workshop `blindSign` slot), on the S07 corner blind (J4), then on the
// MakersCart (S09 J5: 'still fixing...' is struck through and 'fixed!' is scribbled under it) and rolls on with that end
// state (S10). One component, one layout, so the payoff reads as the SAME sign. (The S09 shim `CartSign`, promoted: same
// props; `CartSign` is exported as an alias.)
//
//   <FixSign x={a.x} y={a.y} fs={27} swingAt={[B.headsUp]} />                          // J3 / J4 on the blind (a = slot)
//   <FixSign x={800} y={1236} w={224} fs={36} strikeAt={B.out} fixedAt={B.out + 0.1} />  // J5 on its own post
//   <MakersCart ... sign={<FixSign x={0} y={0} fs={36} strikeAt={B.out} fixedAt={B.out + 0.1} />} />  // J5 in the cart slot
//   <FixSign x y fs={18} strikeAt={-10} fixedAt={-10} />                                  // S10: the end state
//
// Anchor: (x, y) = the HANG point (a nail / the post's hook); the card hangs below it on a V string (`string={false}`:
// pinned flat on the surface instead, an ink pin at the top centre). The card: w (default: fits the lettering) x
// 2.55 fs; row 1 = the text (default one line 'still fixing...' at fs, baseline 1.05 fs below the card top), row 2 =
// the room 'fixed!' is scribbled into (1.12 fs, -4 deg, baseline 2.15 fs). Pass only `fs` everywhere and the four
// scenes show the same proportions and line breaks.
// Motion: `at` pops it in (7 % spring about the hang point); `swingAt` = taps (pendulum 12 deg); `strikeAt` = one ink
// stroke draws across each text line (0.12 s, lines 0.05 s apart) and the card jolts (-7 deg pendulum); `fixedAt` =
// 'fixed!' is scribbled in with an L -> R wipe (0.16 s, out-cubic); `outAt` = one shrunken frame, gone. Never a fade.
// Look: cream card (`paper`), ink text + outline (`ink` world px, `inkPx` screen px), the fill misregistered in screen
// space; paper Look = white card, ink text; lettering under 7 px on screen becomes hairlines.

import React, {useId} from 'react';
import {palette} from '../../../lib/theme';
import {ease as E, prog, springAt, springs, useTime} from '../../../lib/time';
import {Seed} from '../../../lib/rng';
import {Ink} from '../../../lib/Ink';
import {Fill} from '../../../lib/Fill';
import {ExitFade, useLook} from '../../../lib/exit';
import {captionFontStack, measureCaption, useCaptionFont} from '../../../lib/font';
import {circle, line, roundRect} from '../../../lib/sketch';
import {mat, XG} from '../../../lib/xf';
import {pendulum, usePropFrame} from './common';
import {labelLines, LabelText} from './Labels';

export type FixSignProps = {
  /** Hang point (world): the nail on the blind, or the top of the cart's post. The card hangs below it. */
  x: number;
  y: number;
  /** Card width (world). Default: fits the lettering (row 1 and 'fixed!') + 0.5 fs margins. */
  w?: number;
  /** Card height (world). Default 2.55 fs (+ 1 fs per extra text line). */
  h?: number;
  /** Lettering size (world px; on screen = x the camera zoom). Default 30. `size` = alias (the S07 BlindSign shim). */
  fs?: number;
  size?: number;
  /** Row-1 text. Default 'still fixing...' (one line: the canonical sign). A string array = several lines. `lines` = alias. */
  text?: LabelText;
  lines?: string[];
  /** The scribble (default 'fixed!'). */
  fixedText?: string;
  /** Pop in (7 % spring about the hang point). Omit = already there. */
  at?: number;
  /** The row-1 text is struck through (one ink stroke per line, 0.12 s, 0.05 s apart); the card jolts. */
  strikeAt?: number;
  /** 'fixed!' is scribbled into row 2 (L -> R wipe, 0.16 s). */
  fixedAt?: number;
  /** Taps: the card swings again (pendulum 12 deg). */
  swingAt?: number | number[];
  /** One shrunken frame (x 0.72), then gone. */
  outAt?: number;
  /** false = no string: the card is pinned flat (an ink pin at its top centre, the anchor = the pin). */
  string?: boolean;
  /** Static tilt (deg). Default -2 (hanging a little crooked). */
  rot?: number;
  /** Card colour (default cream). */
  paper?: string;
  /** World ink width (default 2.2, the labelStyle outline). */
  ink?: number;
  /** Ink in SCREEN px (divided by the accumulated camera scale). Overrides `ink`. */
  inkPx?: number;
  seed?: Seed;
};

const ROW1 = 1.05; // baseline of row 1 below the card top (fs)
const PITCH = 1.0; // extra row-1 lines (fs)
const ROW2 = 1.1; // 'fixed!' baseline below the last row-1 baseline (fs)
const BOT = 0.4; // card bottom below the 'fixed!' baseline (fs)
const FIXED_K = 1.12; // 'fixed!' size (x fs)
const DROP = 0.5; // card top below the hang point (fs)

/** The card rect [x0, y0, x1, y1] (world) a FixSign occupies at rest (for lint boxes / placing). Exact once the
 *  caption font has loaded. */
export function fixSignBox(p: Pick<FixSignProps, 'x' | 'y' | 'w' | 'h' | 'fs' | 'size' | 'text' | 'lines' | 'fixedText' | 'string'>): [number, number, number, number] {
  const g = fixSignGeom(p);
  return [g.x0, g.top, g.x0 + g.w, g.top + g.h];
}

function fixSignGeom(p: Pick<FixSignProps, 'x' | 'y' | 'w' | 'h' | 'fs' | 'size' | 'text' | 'lines' | 'fixedText' | 'string'>) {
  const fs = p.fs ?? p.size ?? 30;
  const lines = p.lines ?? labelLines(p.text ?? 'still fixing...');
  const fixedText = p.fixedText ?? 'fixed!';
  const widths = lines.map((l) => measureCaption(l, 100) / 100);
  const fixedW = (measureCaption(fixedText, 100) / 100) * FIXED_K;
  const n = Math.max(1, lines.length);
  const w = p.w ?? fs * (Math.max(...widths, fixedW) + 1.0);
  const b2 = ROW1 + (n - 1) * PITCH + ROW2; // 'fixed!' baseline (fs) on the default card
  const h0 = fs * (b2 + BOT);
  const h = p.h ?? h0;
  const top = p.string === false ? p.y - fs * 0.22 : p.y + fs * DROP;
  // an explicit h keeps the rows' proportions (row 2 sits at the same fraction of the card)
  return {fs, lines, fixedText, widths, w, h, top, x0: p.x - w / 2, base1: ROW1 * fs, pitch: PITCH * fs, base2: fs * b2 * (h / h0)};
}

/** The 'still fixing...' sign (J3 / J4) and its payoff (J5: struck, 'fixed!'). See the file header. */
export const FixSign: React.FC<FixSignProps> = (p) => {
  useCaptionFont();
  const t = useTime();
  const look = useLook();
  const seed = p.seed ?? 'fixsign';
  const uid = 'fx' + useId().replace(/[^a-zA-Z0-9]/g, '');
  const F = usePropFrame({ink: p.ink ?? 2.2, seed, defDepth: 'far'});
  if (p.at !== undefined && t < p.at) return null;
  if (p.outAt !== undefined && t >= p.outAt + 1 / 30) return null;
  const W = p.inkPx !== undefined ? p.inkPx / F.k : F.W;
  const g = fixSignGeom(p);
  const {fs, w, h, top, x0} = g;
  const {x, y} = p;
  const hung = p.string !== false;

  // motion: pop, tilt, taps, the jolt when the strike lands
  let ang = p.rot ?? -2;
  const taps = p.swingAt === undefined ? [] : Array.isArray(p.swingAt) ? p.swingAt : [p.swingAt];
  for (const tp of taps) ang += pendulum(t, tp, 12, 0.5, 0.9);
  if (hung && p.at !== undefined) ang += pendulum(t, p.at, -10, 0.5, 0.8);
  if (p.strikeAt !== undefined) ang += pendulum(t, p.strikeAt, -7, 0.55, 0.92);
  let k = p.at === undefined ? 1 : springAt(t, p.at, springs.pop);
  if (p.outAt !== undefined && t >= p.outAt) k *= 0.72;
  if (k <= 0.001) return null;

  const r = Math.min(fs * 0.18, w * 0.08);
  const card = roundRect(x0, top, w, h, r, {seed: `${seed}/c`});
  const cardI = roundRect(x0, top, w, h, r, {seed: `${seed}/ci`, closed: false});
  const onScreen = fs * F.k * k;
  const textOn = look.ink;

  // row 1 (+ the strikes)
  const rows: React.ReactNode[] = [];
  const strikes: React.ReactNode[] = [];
  g.lines.forEach((ln, i) => {
    const by = top + g.base1 + i * g.pitch;
    const lw = g.widths[i] * fs;
    if (textOn) {
      rows.push(
        onScreen < 7 ? (
          <path key={`r${i}`} d={`M${(x - lw * 0.46).toFixed(1)} ${(by - fs * 0.25).toFixed(1)}h${(lw * 0.92).toFixed(1)}`} stroke={palette.ink} strokeWidth={Math.max(0.6, fs * 0.14)} strokeLinecap="round" fill="none" />
        ) : (
          <text key={`r${i}`} x={x} y={by} fontFamily={captionFontStack} fontSize={fs} fill={palette.ink} textAnchor="middle">
            {ln}
          </text>
        ),
      );
    }
    if (p.strikeAt !== undefined && t >= p.strikeAt + i * 0.05) {
      const sy = by - fs * 0.29;
      strikes.push(
        <Ink
          key={`s${i}`}
          d={line(x - lw / 2 - fs * 0.12, sy + fs * 0.02, x + lw / 2 + fs * 0.14, sy - fs * 0.05, {over: [0, 0], seed: `${seed}/st${i}`, drift: 0.4})}
          at={p.strikeAt + i * 0.05}
          dur={0.12}
          width={W * 1.4}
          taper={false}
          seed={`${seed}/st${i}`}
        />,
      );
    }
  });

  // row 2: 'fixed!' scribbled in (L -> R wipe)
  let fixedNode: React.ReactNode = null;
  if (p.fixedAt !== undefined && t >= p.fixedAt && textOn) {
    const fp = E.outCubic(prog(t, p.fixedAt, 0.16));
    const by = top + g.base2;
    const ffs = fs * FIXED_K;
    const fx = x + w * 0.04;
    const fw = (measureCaption(g.fixedText, 100) / 100) * ffs;
    const glyph =
      onScreen < 7 ? (
        <path d={`M${(fx - fw * 0.46).toFixed(1)} ${(by - ffs * 0.25).toFixed(1)}h${(fw * 0.92).toFixed(1)}`} stroke={palette.ink} strokeWidth={Math.max(0.6, ffs * 0.14)} strokeLinecap="round" fill="none" transform={`rotate(-4 ${fx.toFixed(1)} ${by.toFixed(1)})`} />
      ) : (
        <text x={fx} y={by} fontFamily={captionFontStack} fontSize={ffs} fill={palette.ink} textAnchor="middle" transform={`rotate(-4 ${fx.toFixed(1)} ${by.toFixed(1)})`}>
          {g.fixedText}
        </text>
      );
    fixedNode =
      fp >= 1 ? (
        glyph
      ) : (
        <>
          <defs>
            <clipPath id={uid} clipPathUnits="userSpaceOnUse">
              <rect x={x0} y={top + g.base1 + (g.lines.length - 1) * g.pitch + fs * 0.15} width={w * fp} height={h} />
            </clipPath>
          </defs>
          <g clipPath={`url(#${uid})`}>{glyph}</g>
        </>
      );
  }

  // the hanger: a V string from the nail to the card's top corners, or a pin
  const hanger = hung ? (
    <>
      <Ink d={`M${x.toFixed(1)} ${y.toFixed(1)}L${(x0 + w * 0.2).toFixed(1)} ${(top + 2).toFixed(1)}M${x.toFixed(1)} ${y.toFixed(1)}L${(x0 + w * 0.8).toFixed(1)} ${(top + 2).toFixed(1)}`} width={W * 0.7} taper={false} vary={0} seed={`${seed}/str`} />
    </>
  ) : null;
  const nail = <Fill d={circle(x, hung ? y : top + fs * 0.22, Math.max(1.6, W * 1.3), {seed: `${seed}/nail`})} color={palette.ink} offset={false} mode="none" lookExempt seed={`${seed}/nail`} />;

  return (
    <XG m={mat.about(mat.compose(mat.rotate(ang), mat.scale(k)), x, y)}>
      {hanger}
      <Fill d={card} color={p.paper ?? palette.cream} offset={F.off} mode="none" seed={`${seed}/card`} />
      <Ink d={cardI} width={W} taper={false} seed={`${seed}/cardI`} />
      <ExitFade x={x} y={top + h / 2}>
        {rows}
        {fixedNode}
      </ExitFade>
      {strikes}
      {nail}
    </XG>
  );
};

/** Alias: the S09 / S10 shim name (same props). */
export const CartSign = FixSign;
export type CartSignProps = FixSignProps;
