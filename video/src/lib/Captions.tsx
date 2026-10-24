// Captions.tsx — word-group captions, reference grammar (style bible 10 + motion measurements):
//  - Patrick Hand ('CaptionHand') 82 px, ink, centred on the card; baselines card-local 1208 / 1304
//    (a 1-line caption sits centred on 1265; style 'punch' = x1.16 there; style 'hook' = x1.06)
//  - a later line rises from +88 px into place when its first word is spoken (0.4 s, fast ease-out)
//  - on a new caption the old block exits upward (~250 px in 0.2 s) while the new block rises from +112 px
//  - everything is clipped to the caption viewport type.clip (y 1070..1400)
//  - keyword highlight box (theme.highlight / highlightBox em geometry) wipes in left->right behind the
//    keyword at its time; trailing punctuation stays outside the box; multi-word phrases get one box
// Times are VO / timeline seconds (useGlobalTime), so captions stay synced inside any scene.
//
//   <Captions beats={captions} />                       // inside <Card>, after <Art>
//   type CaptionBeat = {s, e?, lines: {text, s}[], highlights?: {text, s}[], style?: 'punch' | 'hook'}

import React, {useId} from 'react';
import {card, highlightBox, palette, type as typeTok} from './theme';
import {ease as E, prog, useGlobalTime} from './time';
import {captionFontStack, measureCaption, useCaptionFont} from './font';

export type CaptionLine = {text: string; s: number};
export type CaptionHighlight = {text: string; s: number};
export type CaptionBeat = {s: number; e?: number; lines: CaptionLine[]; highlights?: CaptionHighlight[]; style?: 'normal' | 'punch' | 'hook'};

export type CaptionsProps = {
  beats: CaptionBeat[];
  /** Only beats starting in [from, to) (seconds). Used per card so a flipping card keeps its own caption. */
  range?: [number, number];
  /** Also show the beat that was active at range[0] (a new card shows the current caption). Default true. */
  carry?: boolean;
  /** Beats / lines / highlights starting before range[0] + this are shown settled (no roll). Default 0.35 s. */
  instantWithin?: number;
  /** Base font size (px). Default type.size (82). Auto-shrinks to type.maxLineWidth. */
  size?: number;
  color?: string;
  highlightColor?: string;
};

// measured curves (docs/motion_evidence/measurements.json)
const PAGE_RISE = 112; // new block starts this far below its rest position
const LINE_RISE = 88; // a later line starts this far below
const RISE_DUR = 0.4;
const OUT_DIST = 250; // old block travel upward
const OUT_DUR = 0.2;
const riseEase = E.expOut(4.5);
const hlEase = E.expOut(4);

const TRAILING = /[\s.,!?;:…"')\]]+$/;

type Box = {x: number; y: number; w: number; h: number; r: number; s: number};
type LineLayout = {text: string; s: number; baseline: number; boxes: Box[]};

function layoutBeat(b: CaptionBeat, baseSize: number): {size: number; lines: LineLayout[]} {
  const n = b.lines.length;
  const style = b.style ?? 'normal';
  let size = baseSize * (style === 'punch' ? typeTok.punchScale : style === 'hook' ? typeTok.hookScale : 1);
  const widest = Math.max(1, ...b.lines.map((l) => measureCaption(l.text, size)));
  if (widest > typeTok.maxLineWidth) size = Math.floor((size * typeTok.maxLineWidth) / widest);
  const {line1, line2, punch} = typeTok.baselines;
  const gap = (line2 - line1) * (style === 'hook' ? typeTok.hookScale : 1);
  let baselines: number[];
  if (n === 1) baselines = [punch];
  else if (n === 2) baselines = style === 'hook' ? [(line1 + line2) / 2 - gap / 2, (line1 + line2) / 2 + gap / 2] : [line1, line2];
  else baselines = b.lines.map((_, i) => line1 - ((n - 2) * gap) / 2 + i * gap);
  const used = new Set<CaptionHighlight>();
  const cx = card.w / 2;
  const lines: LineLayout[] = b.lines.map((ln, i) => {
    const boxes: Box[] = [];
    const lw = measureCaption(ln.text, size);
    for (const h of b.highlights ?? []) {
      if (used.has(h) || !h.text) continue;
      const want = h.text.replace(TRAILING, '');
      let idx = ln.text.indexOf(want);
      if (idx < 0) idx = ln.text.toLowerCase().indexOf(want.toLowerCase());
      if (idx < 0 || !want) continue;
      used.add(h);
      const x0 = cx - lw / 2 + measureCaption(ln.text.slice(0, idx), size);
      const x1 = x0 + measureCaption(ln.text.slice(idx, idx + want.length), size);
      boxes.push({
        x: x0 - highlightBox.padLeftEm * size,
        y: baselines[i] - highlightBox.topEm * size,
        w: x1 - x0 + (highlightBox.padLeftEm + highlightBox.padRightEm) * size,
        h: (highlightBox.topEm + highlightBox.bottomEm) * size,
        r: highlightBox.radiusEm * size,
        s: h.s,
      });
    }
    return {text: ln.text, s: ln.s, baseline: baselines[i], boxes};
  });
  return {size, lines};
}

const Block: React.FC<{beat: CaptionBeat; T: number; dy: number; baseSize: number; instantUntil: number; color: string; hlColor: string}> = ({beat, T, dy, baseSize, instantUntil, color, hlColor}) => {
  const {size, lines} = layoutBeat(beat, baseSize);
  return (
    <g transform={dy ? `translate(0 ${dy.toFixed(2)})` : undefined}>
      {lines.map((ln, i) => {
        const rolls = i > 0 && ln.s > beat.s + 0.04 && ln.s > instantUntil;
        if (rolls && T < ln.s) return null;
        const ldy = rolls ? LINE_RISE * (1 - riseEase(prog(T, ln.s, RISE_DUR))) : 0;
        return (
          <g key={i} transform={ldy > 0.01 ? `translate(0 ${ldy.toFixed(2)})` : undefined}>
            {ln.boxes.map((bx, j) => {
              const p = bx.s <= instantUntil ? 1 : hlEase(prog(T, bx.s + 0.02, 0.2 + bx.w / 3000));
              if (p <= 0) return null;
              return <rect key={j} x={bx.x} y={bx.y} width={bx.w * p} height={bx.h} rx={Math.min(bx.r, (bx.w * p) / 2)} fill={hlColor} />;
            })}
            <text
              x={card.w / 2}
              y={ln.baseline}
              textAnchor="middle"
              fontFamily={captionFontStack}
              fontSize={size}
              fontWeight={typeTok.weight}
              fill={color}
              style={{fontKerning: 'normal', fontVariantLigatures: 'common-ligatures contextual', letterSpacing: typeTok.letterSpacing}}
            >
              {ln.text}
            </text>
          </g>
        );
      })}
    </g>
  );
};

export const Captions: React.FC<CaptionsProps> = ({beats, range, carry = true, instantWithin = 0.35, size = typeTok.size, color = typeTok.color, highlightColor = palette.highlight}) => {
  const T = useGlobalTime();
  const fontOk = useCaptionFont();
  const id = 'cap' + useId().replace(/[^a-zA-Z0-9]/g, '');
  const sorted = beats.slice().sort((a, b) => a.s - b.s);
  let list = range ? sorted.filter((b) => b.s >= range[0] && b.s < range[1]) : sorted;
  if (range && carry && isFinite(range[0])) {
    const prev = sorted.filter((b) => b.s < range[0]).pop();
    if (prev) list = [prev, ...list];
  }
  const instantUntil = Math.max(range && isFinite(range[0]) ? range[0] + instantWithin : -Infinity, 0.05);
  let k = -1;
  for (let i = 0; i < list.length; i++) if (list[i].s <= T) k = i;
  if (k < 0) return null;
  const cur = list[k];
  const prev = k > 0 ? list[k - 1] : null;
  const instant = cur.s <= instantUntil;
  const u = prog(T, cur.s, RISE_DUR);
  const curDy = instant ? 0 : PAGE_RISE * (1 - riseEase(u));
  const prevDy = prev && !instant && T - cur.s < OUT_DUR ? -OUT_DIST * E.inSine(prog(T, cur.s, OUT_DUR)) : null;
  const common = {T, baseSize: size, instantUntil, color, hlColor: highlightColor};
  return (
    <svg width={card.w} height={card.h} viewBox={`0 0 ${card.w} ${card.h}`} style={{position: 'absolute', left: 0, top: 0, visibility: fontOk ? undefined : 'hidden'}}>
      <defs>
        <clipPath id={id}>
          <rect x={0} y={typeTok.clip.top} width={card.w} height={typeTok.clip.bottom - typeTok.clip.top} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id})`}>
        {prev && prevDy !== null ? <Block key={`b${k - 1}`} beat={prev} dy={prevDy} {...common} /> : null}
        <Block key={`b${k}`} beat={cur} dy={curDy} {...common} />
      </g>
    </svg>
  );
};
