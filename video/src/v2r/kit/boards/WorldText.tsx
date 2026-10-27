// boards/WorldText.tsx: K3's lettering primitive (TREATMENT section 9 K3). Text that lives IN the world (on a board, a
// plate, a tag, a box), set in the caption hand (lib/font.ts: Patrick Hand, loaded once, render blocked until ready),
// flat ink, never faded. ONE type scale for the whole film (`TYPE`): keys >= 56 px (read at 216 px), body 30-34 px and
// credits 18-20 px (read at full-screen phone width, ~390 px).
//
//   <WorldText x={182} y={818} size={TYPE.key} text="“any lawful" />                       already there
//   <WorldText ... at={1.2} mode="pen" dur={0.4} />    the pen: written left -> right behind a slanted nib edge
//   <WorldText ... at={1.2} mode="pop" />              the line pop: springs from 0.55 to 1 about its centre (7 %)
//   <WorldText ... off={3.0} />                         pops off (shrinks to its centre in 0.12 s)
//
// Exit (the loop's un-build): a line shrinks to its centre with the fills' timing (lib/exit). No opacity anywhere.

import React, {useId} from 'react';
import {CM} from '../../palette';
import {captionFontStack, measureCaption, useCaptionFont} from '../../../lib/font';
import {clamp, ease, prog, springAt, springs, useTime} from '../../../lib/time';
import {exitFillProgress, useExit} from '../../../lib/exit';
import {rand} from '../../../lib/rng';

/** The one type scale (px at 1080 x 1920). */
export const TYPE = {
  /** Board headers (TOLD THE BBC / GOOGLE SAYS / SHE SAYS). */
  header: 60,
  /** Key lines: read at 216 px wide (>= 56). */
  key: 56,
  /** Body lines: read at ~390 px (30-34). */
  body: 34,
  bodySmall: 30,
  /** Credits and small rows (18-20). */
  credit: 18,
  creditLarge: 20,
  /** Line advance as a multiple of the size. */
  lead: 1.18,
} as const;

export type TextMode = 'pen' | 'pop' | 'none';

export type WorldTextProps = {
  /** Anchor x (by `anchor`) and BASELINE y, px. */
  x: number;
  y: number;
  size: number;
  text: string;
  anchor?: 'start' | 'middle' | 'end';
  color?: string;
  /** Build time (scene s). Omit = already there. */
  at?: number;
  /** 'pen' (default when `at` is set), 'pop', or 'none' (snaps on at `at`). */
  mode?: TextMode;
  /** Pen duration (s). Default: 0.06 s per 100 px of text, clamped 0.16-0.6. */
  dur?: number;
  /** Pops off (shrinks away) at this time. */
  off?: number;
  /** Never wider than this (px): a longer line is scaled down to fit (a guard; presets are measured to fit). */
  maxW?: number;
  letterSpacing?: number;
  /** Faux weight: an ink stroke of this width round the glyphs (0 = none). Keys use ~0.9 px so they hold at 216 px. */
  weight?: number;
  seed?: string;
  exit?: boolean;
};

/** Width of a line in the caption hand at `size` (exact once the font has loaded: WorldText blocks until it is). */
export const textW = (text: string, size: number, letterSpacing = 0) => measureCaption(text, size) + letterSpacing * Math.max(0, text.length - 1);

/** Pen progress 0..1 of a line built at `at` over `dur`. */
export const penAt = (t: number, at: number | undefined, dur: number) => (at === undefined ? 1 : prog(t, at, dur, ease.inOutSine));

export const penDur = (w: number) => clamp((w / 100) * 0.06, 0.16, 0.6);

export const WorldText: React.FC<WorldTextProps> = ({
  x,
  y,
  size,
  text,
  anchor = 'start',
  color = CM.ink,
  at,
  mode,
  dur,
  off,
  maxW,
  letterSpacing = 0,
  weight = 0,
  seed = 'wt',
  exit = true,
}) => {
  useCaptionFont();
  const t = useTime();
  const e = useExit();
  const id = useId().replace(/:/g, '');
  const m: TextMode = mode ?? (at === undefined ? 'none' : 'pen');
  if (at !== undefined && t < at) return null;
  const w0 = textW(text, size, letterSpacing);
  const fit = maxW && w0 > maxW ? maxW / w0 : 1;
  const w = w0 * fit;
  const x0 = anchor === 'start' ? x : anchor === 'middle' ? x - w / 2 : x - w;
  const cx = x0 + w / 2;
  const cy = y - size * 0.33;
  // scale: pop in, pop off, exit shrink
  let s = fit;
  if (m === 'pop' && at !== undefined) s *= 0.55 + 0.45 * springAt(t, at, springs.pop);
  if (off !== undefined && t >= off) {
    const k = prog(t, off, 0.12, ease.inCubic);
    if (k >= 1) return null;
    s *= 1 - k;
  }
  if (exit && e > 0) {
    const k = ease.inCubic(exitFillProgress(e, rand(seed, 'xj'), 0.1));
    if (k >= 1) return null;
    s *= 1 - k;
  }
  const txt = (
    <text
      x={0}
      y={0}
      fontFamily={captionFontStack}
      fontSize={size}
      letterSpacing={letterSpacing || undefined}
      fill={color}
      stroke={weight ? color : undefined}
      strokeWidth={weight ? weight / Math.max(0.05, s) : undefined}
      strokeLinejoin="round"
      paintOrder="stroke"
    >
      {text}
    </text>
  );
  // the pen: a clip that grows left -> right with a slanted leading edge (a hand writing, not a mechanical wipe)
  const p = m === 'pen' ? penAt(t, at, dur ?? penDur(w)) : 1;
  const tf = `translate(${cx.toFixed(2)} ${cy.toFixed(2)}) scale(${s.toFixed(4)}) translate(${(-w0 / 2).toFixed(2)} ${(size * 0.33).toFixed(2)})`;
  if (p >= 1) return <g transform={tf}>{txt}</g>;
  const top = -size * 1.05;
  const bot = size * 0.4;
  const slant = size * 0.35;
  const front = -slant + p * (w0 + slant * 2);
  const clip = `M${-10} ${top}L${(front + slant).toFixed(1)} ${top}L${(front - slant).toFixed(1)} ${bot}L${-10} ${bot}Z`;
  return (
    <g transform={tf}>
      <defs>
        <clipPath id={`pen${id}`}>
          <path d={clip} />
        </clipPath>
      </defs>
      <g clipPath={`url(#pen${id})`}>{txt}</g>
    </g>
  );
};

/** A run of lines laid out top-down from a first baseline (leading = size x TYPE.lead unless a line says `gap`). */
export type TextLine = {
  text: string;
  size: number;
  /** Extra space before this line (px). */
  gap?: number;
  at?: number;
  mode?: TextMode;
  dur?: number;
  off?: number;
  weight?: number;
  letterSpacing?: number;
  color?: string;
  /** Absolute baseline (overrides the flow). */
  y?: number;
};

/** Baselines for a flow of lines starting at `y0` (the first line's top), pure. */
export function flowBaselines(lines: TextLine[], y0: number): number[] {
  const out: number[] = [];
  let y = y0;
  lines.forEach((l, i) => {
    if (l.y !== undefined) {
      out.push(l.y);
      y = l.y + l.size * (TYPE.lead - 0.78);
      return;
    }
    y += (l.gap ?? 0) + (i === 0 ? l.size * 0.78 : l.size * TYPE.lead);
    out.push(y);
  });
  return out;
}
