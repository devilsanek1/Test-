// RadioCut: the G1 gate video (PIPELINE_V2). Plain paper, the frame-0 claim, big pop-in captions with the spoken word
// highlighted, a small note of the planned picture per line, and a burned-in gate label. Everything comes from one JSON
// file (public/v3/radio_*.json, written by scripts/v3/build_radio.py), so a script change is a data rebuild.

import React from 'react';
import {AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {captionFontStack, useCaptionFont} from '../lib/font';

export type Word = {w: string; s: number; e: number; line: number};
export type RadioData = {
  label: string;
  audio: string;
  durationSec: number;
  frame0: string;
  frame0Until: number;
  words: Word[];
  lines: {s: number; e: number; image: string}[];
  sfx: {src: string; t: number; gain?: number}[];
};

const INK = '#2a2420';
const PAPER = '#f3ebdd';
const ACCENT = '#d2452f';
const MUTED = '#8a7f72';
const MAX_CHARS = 16;

// pages of up to MAX_CHARS characters, never crossing a script line
function paginate(words: Word[]): Word[][] {
  const pages: Word[][] = [];
  let cur: Word[] = [];
  for (const w of words) {
    const len = cur.reduce((n, x) => n + x.w.length + 1, 0) + w.w.length;
    if (cur.length && (len > MAX_CHARS || cur[0].line !== w.line)) {
      pages.push(cur);
      cur = [];
    }
    cur.push(w);
  }
  if (cur.length) pages.push(cur);
  return pages;
}

const pop = (f: number, start: number, fps: number) => {
  const d = f - start * fps;
  return {
    opacity: interpolate(d, [0, 2], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
    scale: interpolate(d, [0, 2, 5], [0.86, 1.04, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
  };
};

export const RadioCut: React.FC<{data: RadioData}> = ({data}) => {
  useCaptionFont();
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = f / fps;
  const pages = paginate(data.words);
  const page = t < (pages[0]?.[0].s ?? 0) ? pages[0] : pages.find((p, i) => t >= p[0].s && t < (pages[i + 1]?.[0].s ?? data.durationSec));
  const line = data.lines.find((l, i) => t >= l.s && t < (data.lines[i + 1]?.s ?? data.durationSec));
  const showF0 = t < data.frame0Until;
  const f0 = interpolate(t, [data.frame0Until - 0.15, data.frame0Until], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const pp = page ? pop(f, page === pages[0] ? -1 : page[0].s, fps) : {opacity: 0, scale: 1};
  const tc = `${Math.floor(t / 60)}:${(t % 60).toFixed(1).padStart(4, '0')}`;

  return (
    <AbsoluteFill style={{background: PAPER, fontFamily: captionFontStack, color: INK}}>
      <Audio src={staticFile(data.audio)} />
      {data.sfx.map((s, i) => (
        <Sequence key={i} from={Math.round(s.t * fps)}>
          <Audio src={staticFile(s.src)} volume={s.gain ?? 0.6} />
        </Sequence>
      ))}

      {showF0 && (
        <div style={{position: 'absolute', top: 330, left: 70, right: 70, textAlign: 'center', fontSize: 104,
          lineHeight: 1.08, fontWeight: 700, opacity: f0}}>
          {data.frame0}
        </div>
      )}

      {page && (
        <div style={{position: 'absolute', top: 1000, left: 60, right: 60, textAlign: 'center', fontSize: 118,
          lineHeight: 1.1, opacity: pp.opacity, transform: `scale(${pp.scale})`}}>
          {page.map((w, i) => (
            <span key={i} style={{color: t >= w.s && t < w.e ? ACCENT : INK}}>{w.w}{i < page.length - 1 ? ' ' : ''}</span>
          ))}
        </div>
      )}

      {line && (
        <div style={{position: 'absolute', top: 1360, left: 110, right: 110, textAlign: 'center', fontSize: 38,
          lineHeight: 1.25, color: MUTED, fontStyle: 'italic'}}>
          picture: {line.image}
        </div>
      )}

      <div style={{position: 'absolute', top: 150, left: 60, fontSize: 30, color: MUTED, letterSpacing: 1}}>
        {data.label} · {tc}
      </div>
    </AbsoluteFill>
  );
};
