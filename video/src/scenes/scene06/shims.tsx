// scene06/shims.tsx — LOCAL STAND-IN for a shared-kit piece requested in docs/storyboard_v3.json "requests" that does
// not exist in src/scenes/shared yet. Same name / purpose as requested, so a later fix round swaps in the shared one:
//   BlindSign (sets request: MakersLane / Workshop `blindSign` slot, 'still fixing...' on the shop-window blind, used by
//             S06 and the S07 corner preset; the same sign hangs on the MakersCart in S09)
// (A copy of scene07/shims.tsx BlindSign, so S06 and the S07 corner show the same card until the sets lane ships the slot.)
// labelStyle: CaptionHand ink on paper, a ~2 px ink outline on screen, the fill misregistered ~3 px, slightly soft
// corners. Never a fade. The lettering is linework: it hides with the ink (<Look ink={false}>).

import React from 'react';
import {captionFontStack, Fill, Ink, mat, palette, roundRect, line, useCaptionFont, useLook, useTime, useXf, XG} from '../../lib';
import {pendulum} from '../shared/props';

const matScale = (m: [number, number, number, number, number, number]) => Math.sqrt(Math.abs(m[0] * m[3] - m[1] * m[2]));

/** Hand-lettered lines centred on x = 0, first baseline at y0 (local units). */
const Lettering: React.FC<{lines: string[]; size: number; y0: number; lead?: number; color?: string}> = ({lines, size, y0, lead = 1.0, color = palette.ink}) => {
  useCaptionFont();
  const look = useLook();
  if (!look.ink) return null;
  return (
    <text x={0} y={y0} textAnchor="middle" fontFamily={captionFontStack} fontSize={size} fill={color}>
      {lines.map((ln, i) => (
        <tspan key={i} x={0} dy={i === 0 ? 0 : size * lead}>
          {ln}
        </tspan>
      ))}
    </text>
  );
};

export type BlindSignProps = {
  /** Nail point on the blind (parent coords): the card hangs below it on a string. */
  x: number;
  y: number;
  w?: number;
  h?: number;
  lines?: string[];
  size?: number;
  /** Swings (a jolt) at these times. */
  swingAt?: number[];
  seed?: string;
};

/** BlindSign stand-in: a little hand-lettered card on a string hanging on the shop-window blind ('still fixing...'). */
export const BlindSign: React.FC<BlindSignProps> = ({x, y, w = 112, h = 70, lines = ['still', 'fixing...'], size = 27, swingAt = [], seed = 'blindsign'}) => {
  const t = useTime();
  const m = useXf();
  const k = Math.max(1e-3, matScale(m));
  let sw = 0;
  for (const a of swingAt) sw += pendulum(t, a, 7, 0.45, 0.6);
  const drop = 16;
  const ink = 2.0 / k;
  return (
    <XG m={mat.compose(mat.translate(x, y), mat.rotate(-2 + sw))}>
      <Ink d={line(-w * 0.3, drop, 0, 0, {over: 0, seed: `${seed}/s1`}) + line(0, 0, w * 0.3, drop, {over: 0, seed: `${seed}/s2`})} width={ink * 0.8} taper={false} seed={`${seed}/str`} />
      <Fill d={roundRect(-w / 2, drop, w, h, 5)} color={palette.white} offset={[3 / k, 2 / k]} mode="none" seed={`${seed}/f`} />
      <Ink d={roundRect(-w / 2, drop, w, h, 5, {seed: `${seed}/o`})} width={ink} taper={false} seed={`${seed}/o`} />
      <Lettering lines={lines} size={size} y0={drop + h * 0.5 - (lines.length - 1) * size * 0.46 + size * 0.3} lead={0.92} />
      <Fill d={roundRect(-3, -3, 6, 6, 3)} color={palette.ink} offset={false} mode="none" seed={`${seed}/nail`} />
    </XG>
  );
};
