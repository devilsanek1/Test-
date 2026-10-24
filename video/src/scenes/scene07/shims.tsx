// scene07/shims.tsx — LOCAL STAND-INS for shared-kit pieces requested in docs/storyboard_v3.json "requests" that do
// not exist in src/scenes/shared yet. Same names / props as requested, so a later fix round swaps in the shared ones:
//   LabelTag  (props request: tag / card / slip / notice / sign / stamp; `at`, `outAt`, `flipTo`, `swing`)
//             -> this shim implements the 'tag' style only (a pinned cream card that hangs from its pin and swings).
//   BlindSign (sets request: MakersLane / Workshop `blindSign` slot, 'still fixing...' on the shop-window blind)
// Both follow labelStyle: CaptionHand ink #2B1B0F on cream paper, a ~2.2 px ink outline on screen, the fill
// misregistered ~3 px, slightly soft corners; pop with the 7 % spring, hanging tags add the pendulum (-16 -> 0, 0.5 s).
// Never a fade. Text is linework: it hides with the ink (<Look ink={false}>).

import React from 'react';
import {captionFontStack, Fill, Ink, mat, palette, roundRect, line, springAt, springs, useCaptionFont, useLook, useTime, useXf, XG, ease as E, prog} from '../../lib';
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

export type LabelTagProps = {
  /** Only 'tag' is implemented by this shim (a pinned card hanging from its pin). */
  style?: 'tag' | 'card' | 'slip' | 'notice' | 'sign' | 'stamp';
  /** The pin (attachment point), parent coordinates. The card hangs below it. */
  x: number;
  y: number;
  w: number;
  h: number;
  lines: string[];
  /** Font size in parent units (aim for 34-40 px on screen). */
  size?: number;
  at?: number;
  /** 1-frame shrink pop out. */
  outAt?: number;
  /** Hanging tags swing in (pendulum -16 -> 0, 0.5 s). Default true. */
  swing?: boolean;
  /** Rest tilt (deg). */
  rot?: number;
  /** How far above the pin the card's top edge sits (the pin is ON the card). Default 10. */
  pinInset?: number;
  seed?: string;
};

/** LabelTag 'tag' stand-in: cream card, ink outline, misregistered fill, an ink pin dot, two lines of CaptionHand. */
export const LabelTag: React.FC<LabelTagProps> = ({x, y, w, h, lines, size = 38, at, outAt, swing = true, rot = 0, pinInset = 10, seed = 'label'}) => {
  const t = useTime();
  const m = useXf();
  if (at !== undefined && t < at) return null;
  if (outAt !== undefined && t >= outAt + 1 / 30) return null;
  const k = Math.max(1e-3, matScale(m));
  const pop = at !== undefined ? springAt(t, at, springs.pop) : 1;
  const out = outAt !== undefined && t >= outAt ? 0.4 : 1;
  const sw = swing ? pendulum(t, at, -16, 0.5, 0.8) : 0;
  const top = -pinInset;
  const card = roundRect(-w / 2, top, w, h, 7);
  const ink = 2.2 / k;
  return (
    <XG m={mat.compose(mat.translate(x, y), mat.rotate(rot + sw), mat.scale(pop * out))}>
      <Fill d={card} color={palette.cream} offset={[3 / k, 2 / k]} mode="none" seed={`${seed}/f`} />
      <Ink d={roundRect(-w / 2, top, w, h, 7, {seed: `${seed}/o`})} width={ink} taper={false} seed={`${seed}/o`} />
      <Lettering lines={lines} size={size} y0={top + h * 0.5 - (lines.length - 1) * size * 0.5 + size * 0.33} />
      {/* the pin: an ink head with a cream glint */}
      <Fill d={roundRect(-6, -6, 12, 12, 6)} color={palette.ink} offset={false} mode="none" seed={`${seed}/pin`} />
      <Fill d={roundRect(-3.5, -3.5, 3.5, 3.5, 1.75)} color={palette.cream} offset={false} mode="none" seed={`${seed}/pg`} />
    </XG>
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

/** Small helper: 0..1 eased progress (re-exported for parts.tsx). */
export const eased = (t: number, a: number, d: number) => prog(t, a, d, E.outCubic);
