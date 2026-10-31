// Captions.tsx: the board's caption layer. PopCaptions = v3's in-place pop captions (pages of <= 16 characters, broken
// at sentence ends; each page pops in place over 5 frames, never a clipped roll-in), 100 px ink in the caption band.
// Frame 0 shows the first spoken line as a normal caption (no title over it). The production caption component
// (src/lib/captions2/, TYPE_GUIDE.md) replaces it through SketchReel's `captions` prop when it lands.

import React from 'react';
import {interpolate} from 'remotion';
import {captionFontStack} from '../font';
import {BOARD} from './board';
import type {Word} from './types';

/** what a caption layer gets each frame */
export type CaptionProps = {t: number; fps: number; words: Word[]};
export type CaptionLayer = React.FC<CaptionProps>;

export const CAPTION_TOP = 300;
const MAX_CHARS = 16;

export function pages(words: Word[]): Word[][] {
  const out: Word[][] = [];
  let cur: Word[] = [];
  for (const w of words) {
    const len = cur.reduce((n, x) => n + x.w.length + 1, 0) + w.w.length;
    const sentenceEnd = cur.length > 0 && /[.?!]$/.test(cur[cur.length - 1].w);
    if (cur.length && (len > MAX_CHARS || sentenceEnd)) {
      out.push(cur);
      cur = [];
    }
    cur.push(w);
  }
  if (cur.length) out.push(cur);
  return out;
}

export const PopCaptions: CaptionLayer = ({t, fps, words}) => {
  const ps = pages(words.map((w) => ({...w, w: w.w.replace(/([a-z])(\d)/i, '$1 $2')})));
  const page = t < (ps[0]?.[0].s ?? 0) ? ps[0] : ps.find((p, i) => t >= p[0].s && t < (ps[i + 1]?.[0].s ?? Infinity));
  if (!page) return null;
  const popD = page === ps[0] ? 99 : (t - page[0].s) * fps;
  const opacity = interpolate(popD, [0, 2], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const scale = interpolate(popD, [0, 2, 5], [0.86, 1.04, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <div style={{position: 'absolute', top: CAPTION_TOP + 80, left: 60, right: 60, textAlign: 'center', fontSize: 100, lineHeight: 1.1,
      color: BOARD.ink, opacity, transform: `scale(${scale})`, fontFamily: captionFontStack}}>
      {page.map((w) => w.w).join(' ')}
    </div>
  );
};
