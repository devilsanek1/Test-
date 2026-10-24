// S03 local STAND-INS for shared-kit pieces requested in docs/storyboard_v3.json "requests" that have not landed yet.
// Same names / props as requested, so a later fix round swaps the import to '../shared/props' / '../shared/sets':
//   - Sticker (props request): 'I [heart] PHP' with a DRAWN heart (the font has no heart glyph) and a hand-scribbled '?',
//     >= 110 px wide, lettering >= 24 px on screen; static (no animation: it rides its parent's pop-up).
//   - TitleBlock (BlueprintStreet request "the title-block card at the plan's bottom-right corner (world x 490-910,
//     y 1320-1440) as a label slot"): the plan's ruled title-block frame drawn ON the sheet around the card slot; the
//     card itself is the shared LabelTag (kind 'card', flipTo), which has landed.

import React from 'react';
import {palette} from '../../lib/theme';
import {Ink} from '../../lib/Ink';
import {Fill} from '../../lib/Fill';
import {captionFontStack, useCaptionFont} from '../../lib/font';
import {line, rect, roundRect} from '../../lib/sketch';
import {mat, XG} from '../../lib/xf';
import {useLook} from '../../lib/exit';

// ---------------------------------------------------------------- Sticker

export type StickerProps = {
  /** Centre of the sticker (world px). */
  x: number;
  y: number;
  /** Width in world px (default 118: >= 110 px on screen at zoom 1.0-1.04). */
  w?: number;
  /** Lettering size in world px (default 28). */
  fontSize?: number;
  /** Tilt in degrees (default -6). */
  rot?: number;
  /** Draw the scribbled '?' (default true). */
  question?: boolean;
  /** Ink width (world px, default 2.2). */
  ink?: number;
  seed?: string;
};

/** A heart drawn as two lobes and a point (local, centred on 0,0, width ~2r). */
const heartPath = (r: number) =>
  `M0 ${(r * 0.95).toFixed(2)}C${(-r * 0.25).toFixed(2)} ${(r * 0.7).toFixed(2)} ${(-r * 1.05).toFixed(2)} ${(r * 0.25).toFixed(2)} ${(-r * 1.0).toFixed(2)} ${(-r * 0.3).toFixed(2)}` +
  `C${(-r * 0.95).toFixed(2)} ${(-r * 0.85).toFixed(2)} ${(-r * 0.25).toFixed(2)} ${(-r * 0.95).toFixed(2)} 0 ${(-r * 0.42).toFixed(2)}` +
  `C${(r * 0.25).toFixed(2)} ${(-r * 0.95).toFixed(2)} ${(r * 0.95).toFixed(2)} ${(-r * 0.85).toFixed(2)} ${(r * 1.0).toFixed(2)} ${(-r * 0.3).toFixed(2)}` +
  `C${(r * 1.05).toFixed(2)} ${(r * 0.25).toFixed(2)} ${(r * 0.25).toFixed(2)} ${(r * 0.7).toFixed(2)} 0 ${(r * 0.95).toFixed(2)}Z`;

/** 'I [heart] PHP' sticker + a hand-scribbled ink '?' beside it. Static pauser detail (J2). */
export const Sticker: React.FC<StickerProps> = ({x, y, w = 118, fontSize = 28, rot = -6, question = true, ink = 2.2, seed = 'sticker'}) => {
  useCaptionFont();
  const look = useLook();
  const h = fontSize * 1.55;
  const fs = fontSize;
  // layout (local, centre 0,0): "I"  heart  "PHP"
  const hr = fs * 0.36;
  const iX = -w / 2 + fs * 0.62;
  const hX = iX + fs * 0.62;
  const pX = hX + hr + fs * 0.22;
  const base = fs * 0.34;
  const q = `M${(w / 2 + fs * 0.32).toFixed(1)} ${(-fs * 0.52).toFixed(1)}c${(fs * 0.12).toFixed(1)} ${(-fs * 0.4).toFixed(1)} ${(fs * 0.78).toFixed(1)} ${(-fs * 0.36).toFixed(1)} ${(fs * 0.62).toFixed(1)} ${(fs * 0.08).toFixed(1)}` +
    `c${(-fs * 0.08).toFixed(1)} ${(fs * 0.22).toFixed(1)} ${(-fs * 0.34).toFixed(1)} ${(fs * 0.24).toFixed(1)} ${(-fs * 0.34).toFixed(1)} ${(fs * 0.6).toFixed(1)}` +
    `M${(w / 2 + fs * 0.6).toFixed(1)} ${(fs * 0.5).toFixed(1)}l${(fs * 0.03).toFixed(1)} ${(fs * 0.07).toFixed(1)}`;
  return (
    <XG m={mat.compose(mat.translate(x, y), mat.rotate(rot))}>
      <Fill d={roundRect(-w / 2, -h / 2, w, h, fs * 0.28, {seed: `${seed}/f`})} color={palette.white} offset={[2.4, 1.6]} mode="none" seed={`${seed}/f`} />
      <Ink d={roundRect(-w / 2, -h / 2, w, h, fs * 0.28, {seed: `${seed}/o`, closed: false})} width={ink} taper={false} seed={`${seed}/o`} />
      <XG m={mat.translate(hX, -fs * 0.04)}>
        <Fill d={heartPath(hr)} color={palette.peach} offset={false} mode="none" seed={`${seed}/hf`} />
        <Ink d={heartPath(hr)} width={ink * 0.9} taper={false} seed={`${seed}/hi`} />
      </XG>
      {look.ink ? (
        <>
          <text x={iX} y={base} fontFamily={captionFontStack} fontSize={fs} fill={palette.ink} textAnchor="middle">
            I
          </text>
          <text x={pX} y={base} fontFamily={captionFontStack} fontSize={fs} fill={palette.ink} textAnchor="start">
            PHP
          </text>
        </>
      ) : null}
      {question ? <Ink d={q} width={ink * 1.25} taper={false} seed={`${seed}/q`} /> : null}
    </XG>
  );
};

// ---------------------------------------------------------------- TitleBlock (BlueprintStreet slot stand-in)

export type TitleBlockProps = {
  /** The card slot [x0, y0, x1, y1] (world). The ruled frame is drawn `pad` px outside it. */
  box: [number, number, number, number];
  pad?: number;
  /** Draw-on start (with the plan's grid); omit = drawn. */
  at?: number;
  width?: number;
  seed?: string;
};

/** The plan's title block: a double-ruled frame on the sheet with two division ticks (ink only, hairline weights). */
export const TitleBlock: React.FC<TitleBlockProps> = ({box, pad = 12, at, width = 1.6, seed = 'tblock'}) => {
  const [x0, y0, x1, y1] = box;
  const a = [x0 - pad, y0 - pad, x1 + pad, y1 + pad];
  const outer = rect(a[0], a[1], a[2] - a[0], a[3] - a[1], {seed: `${seed}/o`, over: 'small'});
  const inner = rect(a[0] + 6, a[1] + 6, a[2] - a[0] - 12, a[3] - a[1] - 12, {seed: `${seed}/i`, over: 0});
  const ticks = line(a[0] - 18, a[3] + 10, a[0] + 40, a[3] + 10, {seed: `${seed}/t1`, over: 0}) + line(a[2] + 10, a[1] - 18, a[2] + 10, a[1] + 40, {seed: `${seed}/t2`, over: 0});
  return (
    <>
      <Ink d={outer + ticks} at={at} dur={0.2} width={width} taper={false} seed={`${seed}/a`} />
      <Ink d={inner} at={at !== undefined ? at + 0.08 : undefined} dur={0.2} width={width * 0.6} taper={false} seed={`${seed}/b`} />
    </>
  );
};
