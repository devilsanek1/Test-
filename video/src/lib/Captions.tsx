// Captions.tsx — word-group captions in the caption zone, reference grammar:
//  - 1–2 centred lines in the hand font, dark-brown ink
//  - a line rolls up into place (clipped) when its first word is spoken
//  - the whole caption rolls up/out while the next one rolls in from below
//  - keyword highlight box (theme.highlight) wipes in left->right behind the keyword when it is spoken
// Times are VO / timeline seconds (useGlobalTime), so captions stay synced inside any scene.
//
//   <Captions beats={captions} />                                  // inside <Card>, above <Art>
//   type CaptionBeat = {s, e?, lines: {text, s}[], highlights?: {text, s}[]}

import React from 'react';
import {captionZone, palette, timing, type as typeTok} from './theme';
import {ease as E, prog, useGlobalTime} from './time';
import {captionFontStack, measureCaption, useCaptionFont} from './font';

export type CaptionLine = {text: string; s: number};
export type CaptionHighlight = {text: string; s: number};
export type CaptionBeat = {s: number; e?: number; lines: CaptionLine[]; highlights?: CaptionHighlight[]};

export type CaptionsProps = {
  beats: CaptionBeat[];
  /** Only beats starting in [from, to) (seconds). Used per card so a flipping card keeps its own caption. */
  range?: [number, number];
  /** First beat of the range appears without rolling if it starts within 0.35 s of range[0]. */
  instantFirst?: boolean;
  /** Font size (px). Auto-shrinks per beat to fit the zone width. */
  size?: number;
  zone?: {x: number; y: number; w: number; h: number};
  color?: string;
  highlightColor?: string;
};

type Seg = {text: string; hl?: CaptionHighlight};

function segment(line: string, hls: CaptionHighlight[], used: Set<CaptionHighlight>): Seg[] {
  let segs: Seg[] = [{text: line}];
  for (const h of hls) {
    if (used.has(h) || !h.text) continue;
    const next: Seg[] = [];
    let done = false;
    for (const sg of segs) {
      if (done || sg.hl) {
        next.push(sg);
        continue;
      }
      let idx = sg.text.indexOf(h.text);
      if (idx < 0) idx = sg.text.toLowerCase().indexOf(h.text.toLowerCase());
      if (idx < 0) {
        next.push(sg);
        continue;
      }
      if (idx > 0) next.push({text: sg.text.slice(0, idx)});
      next.push({text: sg.text.slice(idx, idx + h.text.length), hl: h});
      if (idx + h.text.length < sg.text.length) next.push({text: sg.text.slice(idx + h.text.length)});
      done = true;
      used.add(h);
    }
    segs = next;
  }
  return segs;
}

const Block: React.FC<{
  beat: CaptionBeat;
  T: number;
  dy: number;
  size: number;
  zone: {w: number; h: number};
  rollFirstLine: boolean;
  color: string;
  hlColor: string;
}> = ({beat, T, dy, size, zone, rollFirstLine, color, hlColor}) => {
  const lineH = Math.round(size * typeTok.lineHeight);
  const n = beat.lines.length;
  const top = (zone.h - n * lineH) / 2;
  const used = new Set<CaptionHighlight>();
  const hls = beat.highlights ?? [];
  return (
    <div style={{position: 'absolute', left: 0, top: 0, width: zone.w, height: zone.h, fontSize: size, transform: dy ? `translateY(${dy.toFixed(2)}px)` : undefined}}>
      {beat.lines.map((ln, i) => {
        const rolls = i > 0 ? ln.s > beat.s + 0.04 : rollFirstLine;
        const p = rolls ? prog(T, ln.s, timing.captionLine, E.outCubic) : 1;
        if (p <= 0) return null;
        const segs = segment(ln.text, hls, used);
        return (
          <div
            key={i}
            style={{position: 'absolute', left: -40, width: zone.w + 80, top: top + i * lineH - size * 0.1, height: lineH + size * 0.2, overflow: 'hidden'}}
          >
            <div
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: size * 0.1,
                height: lineH,
                lineHeight: `${lineH}px`,
                textAlign: 'center',
                whiteSpace: 'nowrap',
                transform: p < 1 ? `translateY(${((1 - p) * (lineH + size * 0.2)).toFixed(2)}px)` : undefined,
              }}
            >
              {segs.map((sg, j) => {
                if (!sg.hl) return <span key={j}>{sg.text}</span>;
                const hp = prog(T, sg.hl.s, timing.highlightWipe, E.inOutCubic);
                return (
                  <span key={j} style={{position: 'relative', display: 'inline-block', zIndex: 0}}>
                    {hp > 0 ? (
                      <span
                        style={{
                          position: 'absolute',
                          left: -size * 0.09,
                          top: lineH / 2 - size * 0.5,
                          height: size * 1.06,
                          width: `calc(${(hp * 100).toFixed(2)}% + ${(size * 0.18 * hp).toFixed(2)}px)`,
                          background: hlColor,
                          borderRadius: 2,
                          zIndex: -1,
                        }}
                      />
                    ) : null}
                    {sg.text}
                  </span>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export const Captions: React.FC<CaptionsProps> = ({beats, range, instantFirst = true, size = typeTok.size, zone = captionZone, color = typeTok.color, highlightColor = palette.highlight}) => {
  const T = useGlobalTime();
  const fontOk = useCaptionFont();
  const list = (range ? beats.filter((b) => b.s >= range[0] && b.s < range[1]) : beats).slice().sort((a, b) => a.s - b.s);
  let k = -1;
  for (let i = 0; i < list.length; i++) if (list[i].s <= T) k = i;
  if (k < 0) return null;
  const cur = list[k];
  const prev = k > 0 ? list[k - 1] : null;
  const fit = (b: CaptionBeat) => {
    const widest = Math.max(...b.lines.map((l) => measureCaption(l.text, size)));
    return widest > zone.w ? Math.floor((size * zone.w) / widest) : size;
  };
  const roll = prev ? prog(T, cur.s, timing.captionRoll, E.inOutCubic) : 1;
  const travel = zone.h * 0.92;
  const firstInstant = instantFirst && !prev && (!range || cur.s - range[0] < 0.35);
  const common = {T, zone, color, hlColor: highlightColor};
  return (
    <div
      style={{
        position: 'absolute',
        left: zone.x,
        top: zone.y,
        width: zone.w,
        height: zone.h,
        overflow: 'visible',
        clipPath: 'inset(0px -60px 0px -60px)',
        fontFamily: captionFontStack,
        color,
        visibility: fontOk ? undefined : 'hidden',
      }}
    >
      {prev && roll < 1 ? <Block beat={prev} dy={-roll * travel} size={fit(prev)} rollFirstLine={false} {...common} key={`b${k - 1}`} /> : null}
      <Block beat={cur} dy={(1 - roll) * travel} size={fit(cur)} rollFirstLine={!prev && !firstInstant} {...common} key={`b${k}`} />
    </div>
  );
};
